const DB_NAME = 'rodaARoda.platform';
const DB_VERSION = 3;
const BACKUP_VERSION = 2;
const FALLBACK_KEY = 'rodaARoda.fallbackDb.v2';

const nowIso = () => new Date().toISOString();
const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
const normalizeKey = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim().replace(/\s+/g, ' ');
const slug = (value) => normalizeKey(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tema';
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falha no IndexedDB'));
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error || new Error('Transação abortada'));
    tx.onerror = () => reject(tx.error || new Error('Falha na transação'));
  });
}

class RodaDataStore {
  constructor(config = {}) {
    this.config = config;
    this.db = null;
    this.fallback = false;
    this.lastError = null;
    this.cache = { themes: [], questions: [], history: [] };
    this.ready = this.init();
  }

  async init() {
    try {
      if (!('indexedDB' in window)) throw new Error('IndexedDB indisponível neste navegador');
      this.db = await this.openDb();
      await this.migrateDatabase();
      await this.ensureSeedData();
      await this.refreshCache();
      return this;
    } catch (error) {
      console.warn('[dados] IndexedDB indisponível; usando fallback local:', error);
      this.lastError = error;
      this.fallback = true;
      this.ensureFallbackSeed();
      await this.refreshCache();
      return this;
    }
  }

  openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('themes')) {
          const store = db.createObjectStore('themes', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('enabled', 'enabled', { unique: false });
        }
        if (!db.objectStoreNames.contains('questions')) {
          const store = db.createObjectStore('questions', { keyPath: 'id' });
          store.createIndex('themeId', 'themeId', { unique: false });
          store.createIndex('enabled', 'enabled', { unique: false });
          store.createIndex('difficulty', 'difficulty', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains('history')) {
          const store = db.createObjectStore('history', { keyPath: 'id' });
          store.createIndex('completedAt', 'completedAt', { unique: false });
          store.createIndex('mode', 'mode', { unique: false });
        }
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv', { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o banco local'));
      request.onblocked = () => reject(new Error('Banco local bloqueado por outra aba'));
    });
  }

  async migrateDatabase() {
    const readVersionTx = this.db.transaction('kv', 'readonly');
    const versionRecord = await requestToPromise(readVersionTx.objectStore('kv').get('schemaVersion'));
    const fromVersion = Math.max(0, Number(versionRecord?.value) || 0);
    if (fromVersion >= DB_VERSION) return;

    const readTx = this.db.transaction(['themes', 'questions'], 'readonly');
    const [themes, questions] = await Promise.all([
      requestToPromise(readTx.objectStore('themes').getAll()),
      requestToPromise(readTx.objectStore('questions').getAll()),
    ]);

    const writeTx = this.db.transaction(['themes', 'questions', 'kv'], 'readwrite');
    for (const theme of themes || []) writeTx.objectStore('themes').put(this.normalizeTheme(theme));
    for (const question of questions || []) writeTx.objectStore('questions').put(this.normalizeQuestion(question));
    writeTx.objectStore('kv').put({ key: 'schemaVersion', value: DB_VERSION });
    await txDone(writeTx);
    console.info(`[dados] esquema migrado de v${fromVersion} para v${DB_VERSION}`);
  }

  fallbackState() {
    try {
      return JSON.parse(localStorage.getItem(FALLBACK_KEY) || '') || { themes: [], questions: [], history: [], kv: {} };
    } catch {
      return { themes: [], questions: [], history: [], kv: {} };
    }
  }

  saveFallback(state) {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
  }

  ensureFallbackSeed() {
    const state = this.fallbackState();
    if (state.themes.length || state.questions.length) return;
    const seeded = this.buildSeedRecords();
    state.themes = seeded.themes;
    state.questions = seeded.questions;
    state.kv = state.kv || {};
    state.kv.schemaVersion = DB_VERSION;
    state.kv.rules = clone(this.config.defaultRules || {});
    this.saveFallback(state);
  }

  buildSeedRecords() {
    const source = [
      ...(Array.isArray(this.config.defaultPuzzles) ? this.config.defaultPuzzles : []),
      ...(Array.isArray(this.config.sampleQuestions) ? this.config.sampleQuestions : []),
    ];
    const themes = [];
    const themeByName = new Map();
    const questions = [];
    const usedIds = new Set();
    const createdAt = nowIso();

    for (const item of source) {
      const themeName = String(item.theme || item.category || 'GERAL').trim() || 'GERAL';
      const themeKey = normalizeKey(themeName);
      let theme = themeByName.get(themeKey);
      if (!theme) {
        let id = `theme_${slug(themeName)}`;
        let suffix = 2;
        while (themes.some((entry) => entry.id === id)) id = `theme_${slug(themeName)}_${suffix++}`;
        theme = { id, name: themeName, enabled: true, createdAt, updatedAt: createdAt };
        themes.push(theme);
        themeByName.set(themeKey, theme);
      }
      const answer = String(item.answer || item.phrase || '').trim();
      if (!answer) continue;
      let id = item.id || `q_${slug(themeName)}_${slug(answer).slice(0, 40)}`;
      let suffix = 2;
      while (usedIds.has(id)) id = `${id}_${suffix++}`;
      usedIds.add(id);
      questions.push(this.normalizeQuestion({
        ...item,
        id,
        themeId: theme.id,
        answer,
        question: item.question || item.clue || '',
        hints: Array.isArray(item.hints) ? item.hints : [],
        difficulty: item.difficulty || 'medium',
        enabled: item.enabled !== false,
        createdAt: item.createdAt || createdAt,
        updatedAt: item.updatedAt || createdAt,
      }));
    }
    return { themes, questions };
  }

  async ensureSeedData() {
    const counts = await Promise.all([this.count('themes'), this.count('questions')]);
    if (counts[0] || counts[1]) return;
    const { themes, questions } = this.buildSeedRecords();
    const tx = this.db.transaction(['themes', 'questions', 'kv'], 'readwrite');
    themes.forEach((entry) => tx.objectStore('themes').put(entry));
    questions.forEach((entry) => tx.objectStore('questions').put(entry));
    tx.objectStore('kv').put({ key: 'schemaVersion', value: DB_VERSION });
    tx.objectStore('kv').put({ key: 'rules', value: clone(this.config.defaultRules || {}) });
    await txDone(tx);
  }

  normalizeQuestion(input = {}) {
    const createdAt = input.createdAt || nowIso();
    const tags = Array.isArray(input.tags)
      ? input.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(input.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
    return {
      id: input.id || uid('q'),
      themeId: String(input.themeId || ''),
      question: String(input.question || '').trim(),
      answer: String(input.answer || input.phrase || '').trim(),
      hints: Array.isArray(input.hints) ? input.hints.map((hint) => String(hint).trim()).filter(Boolean) : [],
      difficulty: ['easy', 'medium', 'hard'].includes(input.difficulty) ? input.difficulty : 'medium',
      enabled: input.enabled !== false,
      baseScore: input.baseScore === '' || input.baseScore == null ? null : Number(input.baseScore) || 0,
      tags,
      notes: String(input.notes || '').trim(),
      createdAt,
      updatedAt: input.updatedAt || createdAt,
      timesPlayed: Math.max(0, Number(input.timesPlayed) || 0),
      timesSolved: Math.max(0, Number(input.timesSolved) || 0),
      totalHintsUsed: Math.max(0, Number(input.totalHintsUsed) || 0),
      totalSolveMs: Math.max(0, Number(input.totalSolveMs) || 0),
      lastPlayedAt: input.lastPlayedAt || null,
    };
  }

  normalizeTheme(input = {}) {
    const createdAt = input.createdAt || nowIso();
    return {
      id: input.id || uid('theme'),
      name: String(input.name || 'Novo tema').trim() || 'Novo tema',
      enabled: input.enabled !== false,
      createdAt,
      updatedAt: input.updatedAt || createdAt,
    };
  }

  async count(storeName) {
    if (this.fallback) return this.fallbackState()[storeName]?.length || 0;
    const tx = this.db.transaction(storeName, 'readonly');
    return requestToPromise(tx.objectStore(storeName).count());
  }

  async getAll(storeName) {
    if (this.fallback) return clone(this.fallbackState()[storeName] || []);
    const tx = this.db.transaction(storeName, 'readonly');
    return requestToPromise(tx.objectStore(storeName).getAll());
  }

  async refreshCache() {
    this.cache.themes = await this.getAll('themes');
    this.cache.questions = await this.getAll('questions');
    this.cache.history = await this.getAll('history');
    return this.cache;
  }

  async listThemes() { await this.ready; return clone(this.cache.themes); }
  async listQuestions() { await this.ready; return clone(this.cache.questions); }
  async listHistory() { await this.ready; return clone(this.cache.history).sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt))); }

  async putTheme(theme) {
    await this.ready;
    const entry = this.normalizeTheme({ ...theme, updatedAt: nowIso() });
    if (this.fallback) {
      const state = this.fallbackState();
      const index = state.themes.findIndex((item) => item.id === entry.id);
      if (index >= 0) state.themes[index] = entry; else state.themes.push(entry);
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('themes', 'readwrite');
      tx.objectStore('themes').put(entry);
      await txDone(tx);
    }
    await this.refreshCache();
    return clone(entry);
  }

  async deleteTheme(id, { cascade = false } = {}) {
    await this.ready;
    const related = this.cache.questions.filter((q) => q.themeId === id);
    if (related.length && !cascade) throw new Error(`O tema contém ${related.length} pergunta(s).`);
    if (this.fallback) {
      const state = this.fallbackState();
      state.themes = state.themes.filter((item) => item.id !== id);
      if (cascade) state.questions = state.questions.filter((item) => item.themeId !== id);
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction(['themes', 'questions'], 'readwrite');
      tx.objectStore('themes').delete(id);
      if (cascade) related.forEach((item) => tx.objectStore('questions').delete(item.id));
      await txDone(tx);
    }
    await this.refreshCache();
  }

  async putQuestion(question) {
    await this.ready;
    const existing = this.cache.questions.find((item) => item.id === question.id);
    const entry = this.normalizeQuestion({ ...existing, ...question, updatedAt: nowIso() });
    if (!entry.themeId || !this.cache.themes.some((theme) => theme.id === entry.themeId)) throw new Error('Selecione um tema válido.');
    if (!entry.answer) throw new Error('A resposta é obrigatória.');
    if (this.fallback) {
      const state = this.fallbackState();
      const index = state.questions.findIndex((item) => item.id === entry.id);
      if (index >= 0) state.questions[index] = entry; else state.questions.push(entry);
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('questions', 'readwrite');
      tx.objectStore('questions').put(entry);
      await txDone(tx);
    }
    await this.refreshCache();
    return clone(entry);
  }

  async deleteQuestions(ids = []) {
    await this.ready;
    const wanted = new Set(ids);
    if (this.fallback) {
      const state = this.fallbackState();
      state.questions = state.questions.filter((item) => !wanted.has(item.id));
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('questions', 'readwrite');
      wanted.forEach((id) => tx.objectStore('questions').delete(id));
      await txDone(tx);
    }
    await this.refreshCache();
  }

  async bulkUpdateQuestions(ids, patch) {
    await this.ready;
    const wanted = new Set(ids);
    const entries = this.cache.questions.filter((q) => wanted.has(q.id)).map((q) => this.normalizeQuestion({ ...q, ...patch, updatedAt: nowIso() }));
    if (this.fallback) {
      const state = this.fallbackState();
      state.questions = state.questions.map((q) => entries.find((entry) => entry.id === q.id) || q);
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('questions', 'readwrite');
      entries.forEach((entry) => tx.objectStore('questions').put(entry));
      await txDone(tx);
    }
    await this.refreshCache();
  }

  async getKv(key, fallback = null) {
    await this.ready;
    if (this.fallback) {
      const state = this.fallbackState();
      return clone(state.kv?.[key] ?? fallback);
    }
    const tx = this.db.transaction('kv', 'readonly');
    const result = await requestToPromise(tx.objectStore('kv').get(key));
    return clone(result?.value ?? fallback);
  }

  async setKv(key, value) {
    await this.ready;
    if (this.fallback) {
      const state = this.fallbackState();
      state.kv = state.kv || {};
      state.kv[key] = clone(value);
      this.saveFallback(state);
      return;
    }
    const tx = this.db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put({ key, value: clone(value) });
    await txDone(tx);
  }

  async addHistory(record) {
    await this.ready;
    const entry = { ...clone(record), id: record.id || uid('match'), completedAt: record.completedAt || nowIso() };
    if (this.cache.history.some((item) => item.id === entry.id)) return clone(entry);
    if (this.fallback) {
      const state = this.fallbackState();
      if (!state.history.some((item) => item.id === entry.id)) state.history.push(entry);
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('history', 'readwrite');
      tx.objectStore('history').put(entry);
      await txDone(tx);
    }
    await this.refreshCache();
    return clone(entry);
  }

  async deleteHistory(id) {
    await this.ready;
    if (this.fallback) {
      const state = this.fallbackState();
      state.history = state.history.filter((item) => item.id !== id);
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('history', 'readwrite');
      tx.objectStore('history').delete(id);
      await txDone(tx);
    }
    await this.refreshCache();
  }

  async clearHistory() {
    await this.ready;
    if (this.fallback) {
      const state = this.fallbackState();
      state.history = [];
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction('history', 'readwrite');
      tx.objectStore('history').clear();
      await txDone(tx);
    }
    await this.refreshCache();
  }

  async recordQuestionPerformance(questionId, { solved = false, hintsUsed = 0, durationMs = 0 } = {}) {
    await this.ready;
    const current = this.cache.questions.find((item) => item.id === questionId);
    if (!current) return;
    await this.putQuestion({
      ...current,
      timesPlayed: (current.timesPlayed || 0) + 1,
      timesSolved: (current.timesSolved || 0) + (solved ? 1 : 0),
      totalHintsUsed: (current.totalHintsUsed || 0) + Math.max(0, Number(hintsUsed) || 0),
      totalSolveMs: (current.totalSolveMs || 0) + Math.max(0, Number(durationMs) || 0),
      lastPlayedAt: nowIso(),
    });
  }

  async resetDefaults() {
    await this.ready;
    const seed = this.buildSeedRecords();
    if (this.fallback) {
      const state = this.fallbackState();
      state.themes = seed.themes;
      state.questions = seed.questions;
      this.saveFallback(state);
    } else {
      const tx = this.db.transaction(['themes', 'questions'], 'readwrite');
      tx.objectStore('themes').clear();
      tx.objectStore('questions').clear();
      seed.themes.forEach((item) => tx.objectStore('themes').put(item));
      seed.questions.forEach((item) => tx.objectStore('questions').put(item));
      await txDone(tx);
    }
    await this.refreshCache();
  }

  async exportBackup() {
    await this.ready;
    return {
      app: 'Roda a Roda',
      backupVersion: BACKUP_VERSION,
      schemaVersion: DB_VERSION,
      exportedAt: nowIso(),
      themes: await this.listThemes(),
      questions: await this.listQuestions(),
      history: await this.listHistory(),
      rules: await this.getKv('rules', this.config.defaultRules || {}),
      setup: await this.getKv('lastSetup', {}),
      recentQuestionIds: await this.getKv('recentQuestionIds', []),
      activeSession: await this.getKv('activeSession', null),
    };
  }

  validateBackup(data) {
    if (!data || typeof data !== 'object') throw new Error('Arquivo JSON inválido.');
    if (!Array.isArray(data.themes) || !Array.isArray(data.questions)) throw new Error('Backup sem temas/perguntas válidos.');
    const ids = new Set(data.themes.map((theme) => String(theme.id || '')));
    if ([...ids].some((id) => !id)) throw new Error('Tema sem ID válido.');
    for (const q of data.questions) {
      if (!q.id || !q.themeId || !ids.has(String(q.themeId)) || !String(q.answer || q.phrase || '').trim()) {
        throw new Error('Backup contém pergunta inválida ou tema inexistente.');
      }
    }
    return true;
  }

  async importBackup(data, { mode = 'merge', includeHistory = true } = {}) {
    await this.ready;
    this.validateBackup(data);
    const incomingThemes = data.themes.map((item) => this.normalizeTheme(item));
    const incomingQuestions = data.questions.map((item) => this.normalizeQuestion(item));
    const incomingHistory = Array.isArray(data.history) ? clone(data.history) : [];

    if (this.fallback) {
      const state = this.fallbackState();
      state.kv = state.kv || {};
      if (mode === 'replace') {
        state.themes = incomingThemes;
        state.questions = incomingQuestions;
        if (includeHistory) state.history = incomingHistory;
      } else {
        const themeMap = new Map(state.themes.map((item) => [item.id, item]));
        incomingThemes.forEach((item) => themeMap.set(item.id, item));
        state.themes = [...themeMap.values()];
        const qMap = new Map(state.questions.map((item) => [item.id, item]));
        incomingQuestions.forEach((item) => qMap.set(item.id, item));
        state.questions = [...qMap.values()];
        if (includeHistory) {
          const hMap = new Map(state.history.map((item) => [item.id, item]));
          incomingHistory.forEach((item) => hMap.set(item.id, item));
          state.history = [...hMap.values()];
        }
      }
      if (data.rules) state.kv.rules = clone(data.rules);
      if (data.setup) state.kv.lastSetup = clone(data.setup);
      if (Array.isArray(data.recentQuestionIds)) state.kv.recentQuestionIds = clone(data.recentQuestionIds);
      if ('activeSession' in data) state.kv.activeSession = clone(data.activeSession);
      state.kv.schemaVersion = DB_VERSION;
      this.saveFallback(state);
    } else {
      const stores = includeHistory ? ['themes', 'questions', 'history', 'kv'] : ['themes', 'questions', 'kv'];
      const tx = this.db.transaction(stores, 'readwrite');
      if (mode === 'replace') {
        tx.objectStore('themes').clear();
        tx.objectStore('questions').clear();
        if (includeHistory) tx.objectStore('history').clear();
      }
      incomingThemes.forEach((item) => tx.objectStore('themes').put(item));
      incomingQuestions.forEach((item) => tx.objectStore('questions').put(item));
      if (includeHistory) incomingHistory.forEach((item) => tx.objectStore('history').put(item));
      if (data.rules) tx.objectStore('kv').put({ key: 'rules', value: clone(data.rules) });
      if (data.setup) tx.objectStore('kv').put({ key: 'lastSetup', value: clone(data.setup) });
      if (Array.isArray(data.recentQuestionIds)) tx.objectStore('kv').put({ key: 'recentQuestionIds', value: clone(data.recentQuestionIds) });
      if ('activeSession' in data) tx.objectStore('kv').put({ key: 'activeSession', value: clone(data.activeSession) });
      tx.objectStore('kv').put({ key: 'schemaVersion', value: DB_VERSION });
      await txDone(tx);
    }
    await this.refreshCache();
  }
}

export const dataStore = new RodaDataStore(window.SILVIO_CONFIG || {});
export { uid, normalizeKey, nowIso };
