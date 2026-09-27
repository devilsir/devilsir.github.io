(() => {
  'use strict';

  const DB_NAME = 'omr-scan-history-v1';
  const STORE_NAME = 'scans';
  const IDENTITY_KEY = 'omr-scan.identity.v1';
  const MAX_HISTORY = 200;
  const PHOTO_MAX_DIMENSION = 1400;
  const PHOTO_QUALITY = 0.8;

  const $ = (id) => document.getElementById(id);
  const els = {
    historyButton: $('historyButton'),
    historyCountBadge: $('historyCountBadge'),
    historyModal: $('historyModal'),
    historyBackdrop: $('historyBackdrop'),
    closeHistoryButton: $('closeHistoryButton'),
    historySearch: $('historySearch'),
    historySummary: $('historySummary'),
    historyList: $('historyList'),
    clearHistoryButton: $('clearHistoryButton'),
    subjectName: $('subjectName'),
    studentName: $('studentName'),
    resultSubjectName: $('resultSubjectName'),
    resultStudentName: $('resultStudentName'),
    historyAutosaveState: $('historyAutosaveState'),
    resultsScreen: $('resultsScreen'),
    questionList: $('questionList'),
    uncertainOnlyToggle: $('uncertainOnlyToggle'),
    finishButton: $('finishButton'),
    newScanButton: $('newScanButton'),
    demoButton: $('demoButton'),
    dropZone: $('dropZone'),
    sourceCanvas: $('sourceCanvas'),
    rectifiedCanvas: $('rectifiedCanvas'),
    answerKeyInput: $('answerKeyInput'),
    resultAnswerKeyInput: $('resultAnswerKeyInput'),
    optionCount: $('optionCount'),
    gradeScore: $('gradeScore'),
    scoreFraction: $('scoreFraction'),
    scorePercent: $('scorePercent'),
    correctCount: $('correctCount'),
    incorrectCount: $('incorrectCount'),
    blankCount: $('blankCount'),
    multipleCount: $('multipleCount'),
    ambiguousCount: $('ambiguousCount'),
    annulledCount: $('annulledCount')
  };

  if (!els.historyButton || !els.historyModal) return;

  let dbPromise = null;
  let currentSessionId = createId();
  let currentPhotoPromise = Promise.resolve(null);
  let currentPhotoName = '';
  let saveTimer = null;
  let activeObjectUrls = [];
  let lastSavedFingerprint = '';
  let renderToken = 0;

  function createId() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function normalizeKey(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function parsePtNumber(value) {
    const cleaned = String(value ?? '')
      .replace(/[^\d,.-]/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const number = Number.parseFloat(cleaned);
    return Number.isFinite(number) ? number : null;
  }

  function intText(el) {
    const value = Number.parseInt(el?.textContent || '0', 10);
    return Number.isFinite(value) ? value : 0;
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
        store.createIndex('studentKey', 'studentKey');
        store.createIndex('subjectKey', 'subjectKey');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Não foi possível abrir o histórico local.'));
    });
    return dbPromise;
  }

  async function idbRequest(mode, operation) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      let request;
      try {
        request = operation(store);
      } catch (error) {
        reject(error);
        return;
      }
      if (request) {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } else {
        tx.oncomplete = () => resolve();
      }
      tx.onerror = () => reject(tx.error);
    });
  }

  const getAllRecords = async () => {
    const records = await idbRequest('readonly', (store) => store.getAll());
    return records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  };

  const putRecord = (record) => idbRequest('readwrite', (store) => store.put(record));
  const deleteRecord = (id) => idbRequest('readwrite', (store) => store.delete(id));
  const clearRecords = () => idbRequest('readwrite', (store) => store.clear());

  async function pruneHistory() {
    const records = await getAllRecords();
    if (records.length <= MAX_HISTORY) return;
    const overflow = records.slice(MAX_HISTORY);
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      overflow.forEach((record) => store.delete(record.id));
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  function loadIdentity() {
    try {
      const saved = JSON.parse(localStorage.getItem(IDENTITY_KEY) || 'null');
      if (saved?.subject && els.subjectName) els.subjectName.value = saved.subject;
    } catch {}
    syncIdentity('setup');
  }

  function persistIdentity() {
    try {
      localStorage.setItem(IDENTITY_KEY, JSON.stringify({ subject: els.subjectName?.value.trim() || '' }));
    } catch {}
  }

  function syncIdentity(source) {
    const fromResult = source === 'result';
    const student = (fromResult ? els.resultStudentName?.value : els.studentName?.value) ?? '';
    const subject = (fromResult ? els.resultSubjectName?.value : els.subjectName?.value) ?? '';
    if (fromResult) {
      if (els.studentName && els.studentName.value !== student) els.studentName.value = student;
      if (els.subjectName && els.subjectName.value !== subject) els.subjectName.value = subject;
    } else {
      if (els.resultStudentName && els.resultStudentName.value !== student) els.resultStudentName.value = student;
      if (els.resultSubjectName && els.resultSubjectName.value !== subject) els.resultSubjectName.value = subject;
    }
    persistIdentity();
  }

  async function imageFileToHistoryBlob(file) {
    if (!file || !String(file.type || '').startsWith('image/')) return null;
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close?.();
      return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', PHOTO_QUALITY));
    } catch {
      try {
        const url = URL.createObjectURL(file);
        const image = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
        const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', PHOTO_QUALITY));
      } catch {
        return file.size <= 3_500_000 ? file : null;
      }
    }
  }

  async function canvasToHistoryBlob(canvas) {
    if (!canvas?.width || !canvas?.height) return null;
    const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(canvas.width, canvas.height));
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(canvas.width * scale));
    out.height = Math.max(1, Math.round(canvas.height * scale));
    const ctx = out.getContext('2d', { alpha: false });
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(canvas, 0, 0, out.width, out.height);
    return await new Promise((resolve) => out.toBlob(resolve, 'image/jpeg', PHOTO_QUALITY));
  }

  function beginSession(file = null) {
    currentSessionId = createId();
    currentPhotoName = file?.name || '';
    currentPhotoPromise = file ? imageFileToHistoryBlob(file) : Promise.resolve(null);
    lastSavedFingerprint = '';
    if (els.historyAutosaveState) els.historyAutosaveState.textContent = 'O resultado será salvo automaticamente no histórico.';
  }

  function captureAnyFileInput(event) {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
    const file = input.files?.[0];
    if (file && String(file.type || '').startsWith('image/')) beginSession(file);
  }

  function parseAnswerKey(text, expectedCount) {
    const raw = String(text || '').trim();
    if (!raw) return [];
    const result = Array.from({ length: expectedCount }, () => null);
    const numbered = [...raw.matchAll(/(?:^|[\n;,])\s*(\d{1,3})(?:\s+|[.):]\s*|-(?=\s*[A-F])\s*|(?=--))(--|ANULADA|ANULADO|[A-F]|-|—|BRANCO|BLANK)(?=\s*(?:$|[\n;,]))/gim)];
    if (numbered.length) {
      numbered.forEach((match) => {
        const question = Number(match[1]);
        if (question < 1 || question > expectedCount) return;
        const token = String(match[2]).toUpperCase();
        result[question - 1] = ['--', 'ANULADA', 'ANULADO'].includes(token) ? '--' : ['-', '—', 'BRANCO', 'BLANK'].includes(token) ? null : token;
      });
      return result;
    }
    return raw
      .split(/[\s,;|/]+/)
      .filter(Boolean)
      .slice(0, expectedCount)
      .map((token) => {
        const value = token.toUpperCase();
        return ['--', 'ANULADA', 'ANULADO'].includes(value) ? '--' : ['-', '—', 'BRANCO', 'BLANK'].includes(value) ? null : /^[A-F]$/.test(value) ? value : null;
      });
  }

  function collectQuestionRows() {
    if (!els.questionList) return [];
    const toggle = els.uncertainOnlyToggle;
    const wasFiltered = Boolean(toggle?.checked);
    if (wasFiltered) {
      toggle.checked = false;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const rows = [...els.questionList.querySelectorAll('.question-item')].map((item) => {
      const question = Number(item.dataset.question);
      const status = item.dataset.status || '';
      const finalText = item.querySelector('.question-status')?.textContent?.trim() || '—';
      const secondary = item.querySelector('.question-copy small')?.textContent?.trim() || '';
      const manualMatch = secondary.match(/detectado\s+(.+)$/i);
      return {
        question,
        status,
        finalAnswer: finalText === '—' ? null : finalText === 'ANULADA' ? '--' : finalText,
        detectedAnswer: manualMatch ? manualMatch[1].trim() : null,
        manuallyReviewed: /^Manual\b/i.test(secondary)
      };
    });

    if (wasFiltered) {
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return rows;
  }

  function collectResultSnapshot() {
    if (!els.resultsScreen?.classList.contains('is-active')) return null;
    const questions = collectQuestionRows();
    if (!questions.length) return null;

    const answerKeyText = els.resultAnswerKeyInput?.value || els.answerKeyInput?.value || '';
    const answerKey = parseAnswerKey(answerKeyText, questions.length);
    questions.forEach((question) => {
      question.correctAnswer = answerKey[question.question - 1] ?? null;
    });

    const wrongQuestions = questions
      .filter((question) => !['correct', 'annulled'].includes(question.status))
      .map((question) => ({
        question: question.question,
        status: question.status,
        answer: question.finalAnswer,
        correctAnswer: question.correctAnswer,
        manuallyReviewed: question.manuallyReviewed
      }));

    const [earnedText, maxText] = String(els.gradeScore?.textContent || '').split('/').map((part) => part.trim());
    const scoreMatch = String(els.scoreFraction?.textContent || '').match(/(\d+)\s*\/\s*(\d+)/);
    const student = (els.resultStudentName?.value || els.studentName?.value || '').trim() || 'Aluno sem nome';
    const subject = (els.resultSubjectName?.value || els.subjectName?.value || '').trim() || 'Matéria não informada';

    return {
      student,
      studentKey: normalizeKey(student),
      subject,
      subjectKey: normalizeKey(subject),
      grade: parsePtNumber(earnedText),
      maxGrade: parsePtNumber(maxText),
      percentage: parsePtNumber(els.scorePercent?.textContent),
      correct: intText(els.correctCount),
      incorrect: intText(els.incorrectCount),
      blank: intText(els.blankCount),
      multiple: intText(els.multipleCount),
      ambiguous: intText(els.ambiguousCount),
      annulled: intText(els.annulledCount),
      keyedCorrect: scoreMatch ? Number(scoreMatch[1]) : null,
      eligibleQuestions: scoreMatch ? Number(scoreMatch[2]) : null,
      totalQuestions: questions.length,
      wrongQuestions,
      questions,
      answerKeyText,
      photoName: currentPhotoName
    };
  }

  function snapshotFingerprint(snapshot) {
    if (!snapshot) return '';
    return JSON.stringify({
      student: snapshot.student,
      subject: snapshot.subject,
      grade: snapshot.grade,
      maxGrade: snapshot.maxGrade,
      correct: snapshot.correct,
      incorrect: snapshot.incorrect,
      blank: snapshot.blank,
      multiple: snapshot.multiple,
      ambiguous: snapshot.ambiguous,
      annulled: snapshot.annulled,
      questions: snapshot.questions.map((q) => [q.question, q.status, q.finalAnswer, q.manuallyReviewed])
    });
  }

  async function saveCurrentResult({ force = false } = {}) {
    const snapshot = collectResultSnapshot();
    if (!snapshot) return false;
    const fingerprint = snapshotFingerprint(snapshot);
    if (!force && fingerprint === lastSavedFingerprint) return true;

    if (els.historyAutosaveState) els.historyAutosaveState.textContent = 'Salvando no histórico…';
    try {
      let photoBlob = await currentPhotoPromise;
      if (!photoBlob) photoBlob = await canvasToHistoryBlob(els.sourceCanvas);
      if (!photoBlob) photoBlob = await canvasToHistoryBlob(els.rectifiedCanvas);

      const existing = await idbRequest('readonly', (store) => store.get(currentSessionId));
      const record = {
        ...existing,
        ...snapshot,
        id: currentSessionId,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoBlob: photoBlob || existing?.photoBlob || null,
        schemaVersion: 1
      };
      await putRecord(record);
      lastSavedFingerprint = fingerprint;
      if (els.historyAutosaveState) {
        const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date());
        els.historyAutosaveState.textContent = `Salvo no histórico às ${time}.`;
      }
      await pruneHistory();
      await updateHistoryCount();
      return true;
    } catch (error) {
      console.warn('Falha ao salvar histórico OMR:', error);
      if (els.historyAutosaveState) els.historyAutosaveState.textContent = 'Não foi possível salvar o histórico neste navegador.';
      return false;
    }
  }

  function scheduleAutosave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveCurrentResult(), 700);
  }

  function formatGrade(record) {
    if (record.grade == null || record.maxGrade == null) return 'Sem nota';
    return `${record.grade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${record.maxGrade.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Data indisponível';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  }

  function statusLabel(status) {
    return ({ incorrect: 'Errada', blank: 'Em branco', multiple: 'Múltipla', ambiguous: 'Revisar', unkeyed: 'Sem gabarito' })[status] || status || '—';
  }

  function clearObjectUrls() {
    activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    activeObjectUrls = [];
  }

  async function renderHistory() {
    const token = ++renderToken;
    clearObjectUrls();
    const all = await getAllRecords();
    if (token !== renderToken) return;
    const query = normalizeKey(els.historySearch?.value || '');
    const records = query
      ? all.filter((record) => `${record.studentKey || ''} ${record.subjectKey || ''}`.includes(query))
      : all;

    const studentCount = new Set(all.map((record) => record.studentKey || 'sem-nome')).size;
    els.historySummary.textContent = all.length
      ? `${all.length} leitura${all.length === 1 ? '' : 's'} · ${studentCount} aluno${studentCount === 1 ? '' : 's'}`
      : 'Nenhuma leitura salva.';

    if (!records.length) {
      els.historyList.innerHTML = `<div class="history-empty"><strong>${all.length ? 'Nada encontrado' : 'Seu histórico aparece aqui'}</strong><span>${all.length ? 'Tente outro aluno ou matéria.' : 'Depois de uma leitura, foto, nota e questões ficam guardadas por aluno.'}</span></div>`;
      return;
    }

    const groups = new Map();
    for (const record of records) {
      const key = record.studentKey || 'sem-nome';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }

    const fragment = document.createDocumentFragment();
    for (const groupRecords of groups.values()) {
      const group = document.createElement('section');
      group.className = 'history-student-group';
      const student = groupRecords[0].student || 'Aluno sem nome';
      group.innerHTML = `<div class="history-student-heading"><div><span>Aluno</span><h3>${escapeHtml(student)}</h3></div><b>${groupRecords.length} leitura${groupRecords.length === 1 ? '' : 's'}</b></div>`;

      for (const record of groupRecords) {
        const details = document.createElement('details');
        details.className = 'history-entry';
        let imageUrl = '';
        if (record.photoBlob instanceof Blob) {
          imageUrl = URL.createObjectURL(record.photoBlob);
          activeObjectUrls.push(imageUrl);
        }
        const problems = record.wrongQuestions?.length || 0;
        details.innerHTML = `
          <summary>
            <div class="history-thumb">${imageUrl ? `<img src="${imageUrl}" alt="Foto da prova de ${escapeHtml(record.student)}" loading="lazy" />` : '<span>SEM FOTO</span>'}</div>
            <div class="history-entry-main">
              <div><strong>${escapeHtml(record.subject || 'Matéria não informada')}</strong><span>${escapeHtml(formatDate(record.createdAt))}</span></div>
              <div class="history-entry-metrics">
                <b>${escapeHtml(formatGrade(record))}</b>
                <span>${record.correct ?? 0} certas</span>
                <span>${problems} para revisar/erradas</span>
              </div>
            </div>
            <span class="history-chevron">⌄</span>
          </summary>
          <div class="history-entry-detail">
            <div class="history-detail-grid">
              <div class="history-photo-large">${imageUrl ? `<img src="${imageUrl}" alt="Prova fotografada" />` : '<span>Foto indisponível</span>'}</div>
              <div class="history-stats">
                <div><span>Nota</span><b>${escapeHtml(formatGrade(record))}</b></div>
                <div><span>Corretas</span><b>${record.correct ?? 0}</b></div>
                <div><span>Erradas</span><b>${record.incorrect ?? 0}</b></div>
                <div><span>Em branco</span><b>${record.blank ?? 0}</b></div>
                <div><span>Múltiplas</span><b>${record.multiple ?? 0}</b></div>
                <div><span>Revisar</span><b>${record.ambiguous ?? 0}</b></div>
              </div>
            </div>
            <div class="history-wrongs">
              <div class="history-wrongs-heading"><strong>Questões que pedem atenção</strong><span>${problems}</span></div>
              ${problems ? `
                <div class="history-wrong-table">
                  <div class="history-wrong-row is-head"><span>Questão</span><span>Resultado</span><span>Marcada</span><span>Correta</span></div>
                  ${(record.wrongQuestions || []).map((item) => `
                    <div class="history-wrong-row">
                      <b>${String(item.question).padStart(2, '0')}</b>
                      <span>${escapeHtml(statusLabel(item.status))}</span>
                      <span>${escapeHtml(item.answer ?? '—')}</span>
                      <span>${escapeHtml(item.correctAnswer ?? '—')}</span>
                    </div>`).join('')}
                </div>` : '<p class="history-perfect">Nenhuma questão errada ou pendente registrada nesta leitura.</p>'}
            </div>
            <button class="history-delete text-button" type="button" data-delete-history="${escapeHtml(record.id)}">Excluir esta leitura</button>
          </div>`;
        group.append(details);
      }
      fragment.append(group);
    }
    els.historyList.replaceChildren(fragment);
  }

  async function updateHistoryCount() {
    try {
      const records = await getAllRecords();
      const count = records.length;
      els.historyCountBadge.textContent = String(count);
      els.historyCountBadge.hidden = count === 0;
    } catch {
      els.historyCountBadge.hidden = true;
    }
  }

  async function openHistory() {
    await saveCurrentResult();
    els.historyModal.hidden = false;
    document.body.classList.add('history-open');
    await renderHistory();
    window.setTimeout(() => els.historySearch?.focus(), 0);
  }

  function closeHistory() {
    els.historyModal.hidden = true;
    document.body.classList.remove('history-open');
    clearObjectUrls();
  }

  function resetStudentForNextScan() {
    beginSession();
    if (els.studentName) els.studentName.value = '';
    if (els.resultStudentName) els.resultStudentName.value = '';
    syncIdentity('setup');
  }

  // Identity sync
  els.subjectName?.addEventListener('input', () => { syncIdentity('setup'); scheduleAutosave(); });
  els.studentName?.addEventListener('input', () => { syncIdentity('setup'); scheduleAutosave(); });
  els.resultSubjectName?.addEventListener('input', () => { syncIdentity('result'); scheduleAutosave(); });
  els.resultStudentName?.addEventListener('input', () => { syncIdentity('result'); scheduleAutosave(); });

  // Capture any source image, including the dynamically-created camera input.
  document.addEventListener('change', captureAnyFileInput, true);
  els.dropZone?.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) beginSession(file);
  }, true);
  els.demoButton?.addEventListener('click', () => beginSession());

  // History controls.
  els.historyButton.addEventListener('click', openHistory);
  els.closeHistoryButton?.addEventListener('click', closeHistory);
  els.historyBackdrop?.addEventListener('click', closeHistory);
  els.historySearch?.addEventListener('input', renderHistory);
  els.historyList?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-delete-history]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm('Excluir esta leitura do histórico?')) return;
    await deleteRecord(button.dataset.deleteHistory);
    await updateHistoryCount();
    await renderHistory();
  });
  els.clearHistoryButton?.addEventListener('click', async () => {
    if (!window.confirm('Apagar todo o histórico de alunos, notas e fotos deste dispositivo?')) return;
    await clearRecords();
    await updateHistoryCount();
    await renderHistory();
  });

  // Keep the history current while the user reviews/corrects questions.
  const resultObserver = new MutationObserver(() => {
    if (els.resultsScreen?.classList.contains('is-active')) {
      syncIdentity('setup');
      scheduleAutosave();
    }
  });
  if (els.resultsScreen) {
    resultObserver.observe(els.resultsScreen, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  }

  els.finishButton?.addEventListener('click', () => saveCurrentResult({ force: true }));
  els.newScanButton?.addEventListener('click', resetStudentForNextScan);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.historyModal.hidden) closeHistory();
  });

  loadIdentity();
  updateHistoryCount();
})();
