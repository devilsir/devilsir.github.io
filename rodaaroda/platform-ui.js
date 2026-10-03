import { uid, normalizeKey } from './data-store.js';

const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
const fmtDate = (value) => value ? new Date(value).toLocaleString('pt-BR') : '—';
const pct = (a, b) => b ? `${Math.round((a / b) * 100)}%` : '—';
const downloadText = (name, text, type = 'text/plain') => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function createPlatformUI({ store, config, toast }) {
  const state = {
    themes: [], questions: [], history: [], selected: new Set(), page: 0, pageSize: 50,
    setupResolver: null, setup: null, rules: { ...(config.defaultRules || {}) }, activeView: 'content', returnFocus: null,
  };

  document.body.insertAdjacentHTML('beforeend', `
    <section id="platformModal" class="platform-modal" hidden role="dialog" aria-modal="true" aria-labelledby="platformTitle">
      <div class="platform-modal__backdrop" data-platform-close></div>
      <div class="platform-window" role="document">
        <header class="platform-window__header">
          <div><small>RODA A RODA • CENTRAL DO JOGO</small><h2 id="platformTitle">Conteúdo</h2></div>
          <button class="platform-close" type="button" data-platform-close aria-label="Fechar">×</button>
        </header>
        <nav class="platform-tabs" aria-label="Central do jogo">
          <button data-platform-view="content" type="button">CONTEÚDO</button>
          <button data-platform-view="history" type="button">HISTÓRICO</button>
          <button data-platform-view="stats" type="button">ESTATÍSTICAS</button>
          <button data-platform-view="rules" type="button">REGRAS</button>
        </nav>
        <div id="platformBody" class="platform-body"></div>
      </div>
    </section>

    <section id="gameSetupModal" class="platform-modal game-setup-modal" hidden role="dialog" aria-modal="true" aria-labelledby="gameSetupTitle">
      <div class="platform-modal__backdrop"></div>
      <div class="platform-window platform-window--compact">
        <header class="platform-window__header"><div><small>ANTES DE GIRAR</small><h2 id="gameSetupTitle">Configurar partida</h2></div></header>
        <div id="gameSetupBody" class="platform-body"></div>
      </div>
    </section>

    <section id="resultsModal" class="results-modal" hidden role="dialog" aria-modal="true" aria-labelledby="resultsTitle">
      <div class="results-card"><small>RODA A RODA • RESULTADO FINAL</small><h2 id="resultsTitle">Fim de jogo!</h2><div id="resultsBody"></div></div>
    </section>

    <input id="platformImportInput" type="file" accept=".json,.csv,application/json,text/csv" hidden>
  `);

  const modal = document.querySelector('#platformModal');
  const body = document.querySelector('#platformBody');
  const title = document.querySelector('#platformTitle');
  const importInput = document.querySelector('#platformImportInput');
  const setupModal = document.querySelector('#gameSetupModal');
  const setupBody = document.querySelector('#gameSetupBody');
  const resultsModal = document.querySelector('#resultsModal');
  const resultsBody = document.querySelector('#resultsBody');

  const menuCard = document.querySelector('.mode-menu__card');
  if (menuCard) {
    const tools = document.createElement('div');
    tools.className = 'mode-tools';
    tools.innerHTML = `
      <button type="button" data-open-platform="content">✦ CONTEÚDO</button>
      <button type="button" data-open-platform="history">◷ HISTÓRICO</button>
      <button type="button" data-open-platform="stats">▥ ESTATÍSTICAS</button>
      <button type="button" data-open-platform="rules">⚙ REGRAS</button>`;
    menuCard.appendChild(tools);
  }

  async function refresh() {
    await store.ready;
    [state.themes, state.questions, state.history] = await Promise.all([store.listThemes(), store.listQuestions(), store.listHistory()]);
    state.rules = { ...(config.defaultRules || {}), ...(await store.getKv('rules', config.defaultRules || {})) };
  }

  function open(view = 'content') {
    state.returnFocus = document.activeElement;
    state.activeView = view;
    modal.hidden = false;
    document.body.classList.add('has-platform-modal');
    refresh().then(render);
    requestAnimationFrame(() => modal.querySelector('.platform-close')?.focus());
  }

  function close() {
    modal.hidden = true;
    document.body.classList.remove('has-platform-modal');
    state.returnFocus?.focus?.();
  }

  function render() {
    document.querySelectorAll('[data-platform-view]').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.platformView === state.activeView));
    if (state.activeView === 'content') renderContent();
    if (state.activeView === 'history') renderHistory();
    if (state.activeView === 'stats') renderStats();
    if (state.activeView === 'rules') renderRules();
  }

  function themeName(id) { return state.themes.find((theme) => theme.id === id)?.name || 'Sem tema'; }

  function questionStats(q) {
    return { rate: pct(q.timesSolved || 0, q.timesPlayed || 0), avgHints: q.timesPlayed ? ((q.totalHintsUsed || 0) / q.timesPlayed).toFixed(1) : '—', avgTime: q.timesPlayed ? Math.round((q.totalSolveMs || 0) / q.timesPlayed / 1000) : null };
  }

  function filteredQuestions() {
    const search = normalizeKey(document.querySelector('#contentSearch')?.value || '');
    const theme = document.querySelector('#contentThemeFilter')?.value || '';
    const difficulty = document.querySelector('#contentDifficultyFilter')?.value || '';
    const enabled = document.querySelector('#contentEnabledFilter')?.value || '';
    const sort = document.querySelector('#contentSort')?.value || 'newest';
    let list = state.questions.filter((q) => {
      const haystack = normalizeKey([q.question, q.answer, q.tags?.join(' '), q.notes, themeName(q.themeId)].join(' '));
      return (!search || haystack.includes(search)) && (!theme || q.themeId === theme) && (!difficulty || q.difficulty === difficulty) && (!enabled || String(q.enabled) === enabled);
    });
    const diffRank = { easy: 1, medium: 2, hard: 3 };
    list.sort((a, b) => {
      if (sort === 'oldest') return String(a.createdAt).localeCompare(String(b.createdAt));
      if (sort === 'az') return String(a.answer).localeCompare(String(b.answer), 'pt-BR');
      if (sort === 'difficulty') return (diffRank[b.difficulty] || 0) - (diffRank[a.difficulty] || 0);
      if (sort === 'played') return (b.timesPlayed || 0) - (a.timesPlayed || 0);
      if (sort === 'solved') return (b.timesSolved || 0) - (a.timesSolved || 0);
      if (sort === 'solveRate') return ((a.timesSolved || 0) / Math.max(1, a.timesPlayed || 0)) - ((b.timesSolved || 0) / Math.max(1, b.timesPlayed || 0));
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
    return list;
  }

  function renderContent() {
    title.textContent = 'Conteúdo';
    const active = state.questions.filter((q) => q.enabled && state.themes.find((t) => t.id === q.themeId)?.enabled).length;
    const noHints = state.questions.filter((q) => !q.hints?.length).length;
    body.innerHTML = `
      <div class="platform-metrics">
        <div><strong>${state.themes.length}</strong><span>temas</span></div><div><strong>${state.questions.length}</strong><span>perguntas</span></div>
        <div><strong>${active}</strong><span>ativas</span></div><div><strong>${noHints}</strong><span>sem dicas</span></div>
      </div>
      <div class="content-toolbar">
        <button class="platform-primary" type="button" data-add-question>+ PERGUNTA</button>
        <button type="button" data-add-theme>+ TEMA</button>
        <button type="button" data-export-json>BACKUP JSON</button><button type="button" data-export-csv>CSV</button><button type="button" data-import>IMPORTAR</button>
        <button type="button" data-reset-recent>LIMPAR RECENTES</button><button class="danger-ghost" type="button" data-reset-defaults>RESTAURAR PADRÃO</button>
      </div>
      <div class="content-layout">
        <aside class="theme-manager"><h3>TEMAS</h3><div class="theme-list">${state.themes.map((theme) => {
          const count = state.questions.filter((q) => q.themeId === theme.id).length;
          return `<div class="theme-row ${theme.enabled ? '' : 'is-disabled'}"><button class="theme-name" type="button" data-theme-filter="${esc(theme.id)}"><span>${esc(theme.name)}</span><small>${count}</small></button><button type="button" data-theme-toggle="${esc(theme.id)}" aria-label="Ativar ou desativar ${esc(theme.name)}">${theme.enabled ? '●' : '○'}</button><button type="button" data-theme-edit="${esc(theme.id)}" aria-label="Editar ${esc(theme.name)}">✎</button><button type="button" data-theme-delete="${esc(theme.id)}" aria-label="Excluir ${esc(theme.name)}">×</button></div>`;
        }).join('')}</div></aside>
        <section class="question-manager">
          <div class="question-filters">
            <input id="contentSearch" type="search" aria-label="Buscar perguntas" placeholder="Buscar pergunta, resposta, tag…">
            <select id="contentThemeFilter" aria-label="Filtrar por tema"><option value="">Todos os temas</option>${state.themes.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select>
            <select id="contentDifficultyFilter" aria-label="Filtrar por dificuldade"><option value="">Dificuldade</option><option value="easy">Fácil</option><option value="medium">Média</option><option value="hard">Difícil</option></select>
            <select id="contentEnabledFilter" aria-label="Filtrar por status"><option value="">Status</option><option value="true">Ativas</option><option value="false">Desativadas</option></select>
            <select id="contentSort" aria-label="Ordenar perguntas"><option value="newest">Mais novas</option><option value="oldest">Mais antigas</option><option value="az">A–Z</option><option value="difficulty">Dificuldade</option><option value="played">Mais jogadas</option><option value="solved">Mais resolvidas</option><option value="solveRate">Menor taxa de acerto</option></select>
          </div>
          <div id="bulkBar" class="bulk-bar" hidden><strong><span id="bulkCount">0</span> selecionadas</strong><button type="button" data-bulk-enable>ATIVAR</button><button type="button" data-bulk-disable>DESATIVAR</button><button type="button" data-bulk-duplicate>DUPLICAR</button><select id="bulkMoveTheme"><option value="">MOVER PARA…</option>${state.themes.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select><button class="danger-ghost" type="button" data-bulk-delete>EXCLUIR</button></div>
          <div id="questionList" class="question-list"></div>
          <div id="questionPager" class="question-pager"></div>
        </section>
      </div>`;
    bindContent(); renderQuestionList();
  }

  function renderQuestionList() {
    const listNode = document.querySelector('#questionList');
    const pager = document.querySelector('#questionPager');
    if (!listNode || !pager) return;
    const list = filteredQuestions();
    const pages = Math.max(1, Math.ceil(list.length / state.pageSize));
    state.page = Math.min(state.page, pages - 1);
    const pageItems = list.slice(state.page * state.pageSize, state.page * state.pageSize + state.pageSize);
    listNode.innerHTML = pageItems.length ? pageItems.map((q) => {
      const stats = questionStats(q);
      return `<article class="question-card ${q.enabled ? '' : 'is-disabled'}">
        <label class="question-check"><input type="checkbox" data-select-question="${esc(q.id)}" ${state.selected.has(q.id) ? 'checked' : ''}><span></span></label>
        <div class="question-card__main"><div class="question-card__meta"><span>${esc(themeName(q.themeId))}</span><span>${q.difficulty === 'easy' ? 'FÁCIL' : q.difficulty === 'hard' ? 'DIFÍCIL' : 'MÉDIA'}</span>${q.enabled ? '' : '<span>DESATIVADA</span>'}</div><h4>${esc(q.answer)}</h4><p>${esc(q.question || 'Sem pergunta — usa apenas o tema.')}</p><small>${q.hints?.length || 0} dica(s) • ${q.timesPlayed || 0} jogadas • ${stats.rate} acerto • ${stats.avgHints} dicas/jogo${stats.avgTime != null ? ` • ${stats.avgTime}s médio` : ''}${q.lastPlayedAt ? ` • última: ${fmtDate(q.lastPlayedAt)}` : ''}</small></div>
        <div class="question-card__actions"><button type="button" data-edit-question="${esc(q.id)}">EDITAR</button><button type="button" data-duplicate-question="${esc(q.id)}">DUPLICAR</button><button type="button" data-toggle-question="${esc(q.id)}">${q.enabled ? 'PAUSAR' : 'ATIVAR'}</button><button type="button" data-delete-question="${esc(q.id)}">EXCLUIR</button></div>
      </article>`;
    }).join('') : '<div class="empty-state"><strong>Nada por aqui.</strong><span>Ajuste os filtros ou crie uma nova pergunta.</span></div>';
    pager.innerHTML = `<span>${list.length} resultado(s) • página ${state.page + 1}/${pages}</span><div><button type="button" data-page-prev ${state.page <= 0 ? 'disabled' : ''}>←</button><button type="button" data-page-next ${state.page >= pages - 1 ? 'disabled' : ''}>→</button></div>`;
    pager.querySelector('[data-page-prev]')?.addEventListener('click', () => { state.page--; renderQuestionList(); });
    pager.querySelector('[data-page-next]')?.addEventListener('click', () => { state.page++; renderQuestionList(); });
    listNode.querySelectorAll('[data-select-question]').forEach((input) => input.addEventListener('change', () => { input.checked ? state.selected.add(input.dataset.selectQuestion) : state.selected.delete(input.dataset.selectQuestion); updateBulkBar(); }));
    listNode.querySelectorAll('[data-edit-question]').forEach((btn) => btn.addEventListener('click', () => editQuestion(btn.dataset.editQuestion)));
    listNode.querySelectorAll('[data-duplicate-question]').forEach((btn) => btn.addEventListener('click', async () => { const q = state.questions.find((item) => item.id === btn.dataset.duplicateQuestion); if (!q) return; await store.putQuestion({ ...q, id: uid('q'), answer: `${q.answer} (CÓPIA)`, timesPlayed: 0, timesSolved: 0, lastPlayedAt: null }); await refresh(); renderContent(); }));
    listNode.querySelectorAll('[data-toggle-question]').forEach((btn) => btn.addEventListener('click', async () => { const q = state.questions.find((item) => item.id === btn.dataset.toggleQuestion); if (!q) return; await store.putQuestion({ ...q, enabled: !q.enabled }); await refresh(); renderContent(); }));
    listNode.querySelectorAll('[data-delete-question]').forEach((btn) => btn.addEventListener('click', async () => { const q = state.questions.find((item) => item.id === btn.dataset.deleteQuestion); if (!q || !confirm(`Excluir a pergunta “${q.answer}”?`)) return; await store.deleteQuestions([q.id]); state.selected.delete(q.id); await refresh(); renderContent(); }));
    updateBulkBar();
  }

  function updateBulkBar() {
    const bar = document.querySelector('#bulkBar'); if (!bar) return;
    bar.hidden = !state.selected.size;
    const count = document.querySelector('#bulkCount'); if (count) count.textContent = String(state.selected.size);
  }

  function bindContent() {
    ['#contentSearch', '#contentThemeFilter', '#contentDifficultyFilter', '#contentEnabledFilter', '#contentSort'].forEach((sel) => document.querySelector(sel)?.addEventListener(sel === '#contentSearch' ? 'input' : 'change', () => { state.page = 0; renderQuestionList(); }));
    document.querySelector('[data-add-question]')?.addEventListener('click', () => editQuestion());
    document.querySelector('[data-add-theme]')?.addEventListener('click', () => editTheme());
    document.querySelectorAll('[data-theme-filter]').forEach((btn) => btn.addEventListener('click', () => { document.querySelector('#contentThemeFilter').value = btn.dataset.themeFilter; renderQuestionList(); }));
    document.querySelectorAll('[data-theme-edit]').forEach((btn) => btn.addEventListener('click', () => editTheme(btn.dataset.themeEdit)));
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', async () => { const t = state.themes.find((x) => x.id === btn.dataset.themeToggle); await store.putTheme({ ...t, enabled: !t.enabled }); await refresh(); renderContent(); }));
    document.querySelectorAll('[data-theme-delete]').forEach((btn) => btn.addEventListener('click', async () => { const t = state.themes.find((x) => x.id === btn.dataset.themeDelete); const count = state.questions.filter((q) => q.themeId === t.id).length; if (!confirm(`Excluir o tema “${t.name}”${count ? ` e suas ${count} pergunta(s)` : ''}?`)) return; await store.deleteTheme(t.id, { cascade: true }); await refresh(); renderContent(); }));
    document.querySelector('[data-bulk-enable]')?.addEventListener('click', () => bulkPatch({ enabled: true }));
    document.querySelector('[data-bulk-disable]')?.addEventListener('click', () => bulkPatch({ enabled: false }));
    document.querySelector('[data-bulk-duplicate]')?.addEventListener('click', async () => { const items = state.questions.filter((q) => state.selected.has(q.id)); for (const q of items) await store.putQuestion({ ...q, id: uid('q'), answer: `${q.answer} (CÓPIA)`, timesPlayed: 0, timesSolved: 0, totalHintsUsed: 0, totalSolveMs: 0, lastPlayedAt: null }); state.selected.clear(); await refresh(); renderContent(); });
    document.querySelector('#bulkMoveTheme')?.addEventListener('change', (e) => { if (e.target.value) bulkPatch({ themeId: e.target.value }); });
    document.querySelector('[data-bulk-delete]')?.addEventListener('click', async () => { if (!confirm(`Excluir ${state.selected.size} pergunta(s)?`)) return; await store.deleteQuestions([...state.selected]); state.selected.clear(); await refresh(); renderContent(); });
    document.querySelector('[data-export-json]')?.addEventListener('click', exportJson);
    document.querySelector('[data-export-csv]')?.addEventListener('click', exportCsv);
    document.querySelector('[data-import]')?.addEventListener('click', () => importInput.click());
    document.querySelector('[data-reset-recent]')?.addEventListener('click', async () => { await store.setKv('recentQuestionIds', []); toast?.('Pool de perguntas recentes limpo', 'good'); });
    document.querySelector('[data-reset-defaults]')?.addEventListener('click', async () => { if (!confirm('Restaurar o conteúdo padrão? Temas e perguntas atuais serão substituídos. O histórico será mantido.')) return; await store.resetDefaults(); await refresh(); renderContent(); toast?.('Conteúdo padrão restaurado', 'good'); });
  }

  async function bulkPatch(patch) { if (!state.selected.size) return; await store.bulkUpdateQuestions([...state.selected], patch); state.selected.clear(); await refresh(); renderContent(); }

  function editorShell(inner) { body.insertAdjacentHTML('beforeend', `<div class="editor-overlay" data-editor-overlay><div class="editor-panel">${inner}</div></div>`); }
  function closeEditor() { body.querySelector('[data-editor-overlay]')?.remove(); }

  function editTheme(id = '') {
    const current = state.themes.find((t) => t.id === id) || { id: '', name: '', enabled: true };
    editorShell(`<form id="themeEditor" class="editor-form"><header><div><small>TEMA</small><h3>${id ? 'Editar tema' : 'Novo tema'}</h3></div><button type="button" data-editor-close>×</button></header><label><span>NOME</span><input name="name" maxlength="60" required value="${esc(current.name)}"></label><label class="toggle-line"><input name="enabled" type="checkbox" ${current.enabled ? 'checked' : ''}><span>Ativo no jogo</span></label><footer><button type="button" data-editor-close>CANCELAR</button><button class="platform-primary" type="submit">SALVAR</button></footer></form>`);
    body.querySelectorAll('[data-editor-close]').forEach((b) => b.addEventListener('click', closeEditor));
    body.querySelector('#themeEditor input[name="name"]')?.focus();
    body.querySelector('#themeEditor')?.addEventListener('submit', async (e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); const name = String(fd.get('name') || '').trim(); if (!name) return; const duplicate = state.themes.find((t) => normalizeKey(t.name) === normalizeKey(name) && t.id !== id); if (duplicate && !confirm(`Já existe o tema “${duplicate.name}”. Criar mesmo assim?`)) return; await store.putTheme({ ...current, id: current.id || uid('theme'), name, enabled: fd.get('enabled') === 'on' }); closeEditor(); await refresh(); renderContent(); });
  }

  function editQuestion(id = '') {
    const q = state.questions.find((item) => item.id === id) || { id: '', themeId: state.themes[0]?.id || '', question: '', answer: '', hints: [''], difficulty: 'medium', enabled: true, baseScore: '', tags: [], notes: '' };
    editorShell(`<form id="questionEditor" class="editor-form editor-form--question">
      <header><div><small>PERGUNTA</small><h3>${id ? 'Editar pergunta' : 'Nova pergunta'}</h3></div><button type="button" data-editor-close>×</button></header>
      <div class="editor-grid"><label><span>TEMA</span><select name="themeId" required>${state.themes.map((t) => `<option value="${esc(t.id)}" ${t.id === q.themeId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label><label><span>DIFICULDADE</span><select name="difficulty"><option value="easy" ${q.difficulty === 'easy' ? 'selected' : ''}>Fácil</option><option value="medium" ${q.difficulty === 'medium' ? 'selected' : ''}>Média</option><option value="hard" ${q.difficulty === 'hard' ? 'selected' : ''}>Difícil</option></select></label></div>
      <label><span>PERGUNTA / PISTA PRINCIPAL</span><textarea name="question" rows="3" maxlength="300">${esc(q.question)}</textarea></label>
      <label><span>RESPOSTA NO PAINEL</span><input name="answer" required maxlength="90" value="${esc(q.answer)}"></label>
      <div class="editor-grid"><label><span>PONTUAÇÃO BASE OPCIONAL</span><input name="baseScore" type="number" min="0" step="50" value="${q.baseScore ?? ''}"></label><label><span>TAGS</span><input name="tags" value="${esc((q.tags || []).join(', '))}" placeholder="cinema, anos 90"></label></div>
      <section class="hint-editor"><div class="hint-editor__head"><span>DICAS</span><button type="button" data-add-hint>+ ADICIONAR DICA</button></div><div id="hintEditorList"></div></section>
      <label><span>NOTAS</span><textarea name="notes" rows="2">${esc(q.notes)}</textarea></label>
      <label class="toggle-line"><input name="enabled" type="checkbox" ${q.enabled ? 'checked' : ''}><span>Ativa no jogo</span></label>
      <div id="duplicateWarning" class="form-warning" hidden></div>
      <footer><button type="button" data-editor-close>CANCELAR</button><button class="platform-primary" type="submit">SALVAR</button></footer>
    </form>`);
    const form = body.querySelector('#questionEditor'); let hints = (q.hints?.length ? [...q.hints] : ['']);
    requestAnimationFrame(() => form.querySelector('textarea[name="question"]')?.focus());
    const renderHints = () => { const node = form.querySelector('#hintEditorList'); node.innerHTML = hints.map((hint, i) => `<div class="hint-row"><span>${i + 1}</span><input data-hint-index="${i}" aria-label="Dica ${i + 1}" value="${esc(hint)}" placeholder="Dica ${i + 1}"><button type="button" data-hint-up="${i}" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-hint-down="${i}" ${i === hints.length - 1 ? 'disabled' : ''}>↓</button><button type="button" data-hint-remove="${i}">×</button></div>`).join(''); node.querySelectorAll('[data-hint-index]').forEach((input) => input.addEventListener('input', () => { hints[Number(input.dataset.hintIndex)] = input.value; })); node.querySelectorAll('[data-hint-remove]').forEach((btn) => btn.addEventListener('click', () => { hints.splice(Number(btn.dataset.hintRemove), 1); if (!hints.length) hints.push(''); renderHints(); })); node.querySelectorAll('[data-hint-up]').forEach((btn) => btn.addEventListener('click', () => { const i = Number(btn.dataset.hintUp); [hints[i - 1], hints[i]] = [hints[i], hints[i - 1]]; renderHints(); })); node.querySelectorAll('[data-hint-down]').forEach((btn) => btn.addEventListener('click', () => { const i = Number(btn.dataset.hintDown); [hints[i + 1], hints[i]] = [hints[i], hints[i + 1]]; renderHints(); })); };
    renderHints(); form.querySelector('[data-add-hint]').addEventListener('click', () => { hints.push(''); renderHints(); });
    form.querySelectorAll('[data-editor-close]').forEach((b) => b.addEventListener('click', closeEditor));
    const checkDup = () => { const answer = normalizeKey(form.answer.value); const question = normalizeKey(form.question.value); const dup = state.questions.find((item) => item.id !== id && (normalizeKey(item.answer) === answer || (question && normalizeKey(item.question) === question))); const warning = form.querySelector('#duplicateWarning'); warning.hidden = !dup; warning.textContent = dup ? `Atenção: parece duplicar “${dup.answer}”.` : ''; };
    form.answer.addEventListener('input', checkDup); form.question.addEventListener('input', checkDup);
    form.addEventListener('submit', async (e) => { e.preventDefault(); const fd = new FormData(form); const answer = String(fd.get('answer') || '').trim(); const question = String(fd.get('question') || '').trim(); const dup = state.questions.find((item) => item.id !== id && (normalizeKey(item.answer) === normalizeKey(answer) || (question && normalizeKey(item.question) === normalizeKey(question)))); if (dup && !confirm(`Há conteúdo parecido: “${dup.answer}”. Salvar mesmo assim?`)) return; await store.putQuestion({ ...q, id: q.id || uid('q'), themeId: fd.get('themeId'), difficulty: fd.get('difficulty'), question, answer, baseScore: fd.get('baseScore'), tags: fd.get('tags'), hints: hints.map((x) => x.trim()).filter(Boolean), notes: fd.get('notes'), enabled: fd.get('enabled') === 'on' }); closeEditor(); await refresh(); renderContent(); toast?.('Pergunta salva', 'good'); });
  }

  async function exportJson() { const data = await store.exportBackup(); downloadText(`roda-a-roda-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(data, null, 2), 'application/json'); }
  function questionsCsv() { return [['id','tema','pergunta','resposta','dificuldade','ativa','pontuacao_base','tags','dicas','notas'].map(csvCell).join(','), ...state.questions.map((q) => [q.id, themeName(q.themeId), q.question, q.answer, q.difficulty, q.enabled, q.baseScore ?? '', (q.tags || []).join('|'), (q.hints || []).join('|'), q.notes || ''].map(csvCell).join(','))].join('\n'); }
  async function exportCsv() { downloadText(`roda-a-roda-perguntas-${new Date().toISOString().slice(0,10)}.csv`, '\ufeff' + questionsCsv(), 'text/csv;charset=utf-8'); }

  function parseCsv(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) { const ch = text[i], next = text[i + 1]; if (quoted && ch === '"' && next === '"') { cell += '"'; i++; } else if (ch === '"') quoted = !quoted; else if (ch === ',' && !quoted) { row.push(cell); cell = ''; } else if ((ch === '\n' || ch === '\r') && !quoted) { if (ch === '\r' && next === '\n') i++; row.push(cell); if (row.some((x) => x.trim())) rows.push(row); row = []; cell = ''; } else cell += ch; }
    row.push(cell); if (row.some((x) => x.trim())) rows.push(row); return rows;
  }

  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0]; importInput.value = ''; if (!file) return;
    try {
      if (/\.json$/i.test(file.name)) {
        const data = JSON.parse(await file.text());
        store.validateBackup(data);
        const choice = String(prompt('Digite MESCLAR para preservar os dados atuais ou SUBSTITUIR para trocar o banco pelo backup.', 'MESCLAR') || '').trim().toUpperCase();
        if (!choice) return;
        if (!['MESCLAR', 'SUBSTITUIR'].includes(choice)) throw new Error('Importação cancelada: escolha MESCLAR ou SUBSTITUIR.');
        const mode = choice === 'SUBSTITUIR' ? 'replace' : 'merge';
        if (mode === 'replace' && !confirm('SUBSTITUIR apagará temas, perguntas e histórico atuais antes de restaurar este backup. Continuar?')) return;
        await store.importBackup(data, { mode, includeHistory: true });
      } else {
        const rows = parseCsv(await file.text()); if (rows.length < 2) throw new Error('CSV vazio.'); const headers = rows[0].map((h) => normalizeKey(h)); const idx = (name) => headers.indexOf(normalizeKey(name)); if (idx('RESPOSTA') < 0 || idx('TEMA') < 0) throw new Error('CSV precisa das colunas tema e resposta.');
        const parsed = rows.slice(1).map((row, rowIndex) => ({
          row,
          rowNumber: rowIndex + 2,
          themeName: (row[idx('TEMA')] || '').trim(),
          answer: (row[idx('RESPOSTA')] || '').trim(),
        }));
        const invalid = parsed.find((item) => !item.themeName || !item.answer);
        if (invalid) throw new Error(`CSV inválido na linha ${invalid.rowNumber}: tema e resposta são obrigatórios.`);
        const importedThemes = new Map(state.themes.map((t) => [normalizeKey(t.name), t]));
        for (const item of parsed) {
          const row = item.row; const themeKey = normalizeKey(item.themeName); let theme = importedThemes.get(themeKey);
          if (!theme) { theme = await store.putTheme({ id: uid('theme'), name: item.themeName, enabled: true }); state.themes.push(theme); importedThemes.set(themeKey, theme); }
          await store.putQuestion({ id: row[idx('ID')] || uid('q'), themeId: theme.id, question: row[idx('PERGUNTA')] || '', answer: item.answer, difficulty: row[idx('DIFICULDADE')] || 'medium', enabled: !['FALSE','0','NAO','NÃO'].includes(normalizeKey(row[idx('ATIVA')] || 'true')), baseScore: row[idx('PONTUACAO_BASE')] || '', tags: (row[idx('TAGS')] || '').split('|').filter(Boolean), hints: (row[idx('DICAS')] || '').split('|').filter(Boolean), notes: row[idx('NOTAS')] || '' });
        }
      }
      await refresh(); renderContent(); toast?.('Importação concluída', 'good');
    } catch (error) { console.error('[import]', error); alert(`Não foi possível importar: ${error.message}`); }
  });

  function renderHistory() {
    title.textContent = 'Histórico';
    body.innerHTML = `<div class="history-toolbar"><input id="historySearch" type="search" aria-label="Filtrar histórico por jogador ou tema" placeholder="Filtrar por jogador ou tema"><select id="historyMode" aria-label="Filtrar histórico por modo"><option value="">Todos os modos</option><option value="single">Local</option><option value="multiplayer">Multiplayer</option></select><input id="historyDate" type="date" aria-label="Filtrar histórico por data"><button type="button" data-history-json>JSON</button><button type="button" data-history-csv>CSV</button><button type="button" class="danger-ghost" data-clear-history>LIMPAR HISTÓRICO</button></div><div id="historyList" class="history-list"></div>`;
    const renderList = () => { const search = normalizeKey(document.querySelector('#historySearch').value); const mode = document.querySelector('#historyMode').value; const date = document.querySelector('#historyDate').value; const items = state.history.filter((m) => (!mode || m.mode === mode) && (!date || String(m.completedAt || '').slice(0,10) === date) && (!search || normalizeKey(JSON.stringify([m.players, m.selectedThemes, m.winner])).includes(search))); document.querySelector('#historyList').innerHTML = items.length ? items.map((m) => `<article class="history-card"><div><small>${fmtDate(m.completedAt)} • ${m.mode === 'multiplayer' ? 'MULTIPLAYER' : 'LOCAL'}</small><h3>${esc(m.winner?.name || 'Partida concluída')}</h3><p>${(m.players || []).map((p) => `${esc(p.name)}: ${Number(p.score || 0).toLocaleString('pt-BR')}`).join(' • ')}</p><span>${m.rounds?.length || 0} rodada(s) • ${Math.round((m.durationMs || 0)/60000)} min</span></div><div><button type="button" data-history-detail="${esc(m.id)}">DETALHES</button><button type="button" data-history-delete="${esc(m.id)}">EXCLUIR</button></div></article>`).join('') : '<div class="empty-state"><strong>Nenhuma partida salva ainda.</strong><span>As partidas concluídas vão aparecer aqui.</span></div>'; bindHistoryCards(); };
    document.querySelector('#historySearch').addEventListener('input', renderList); document.querySelector('#historyMode').addEventListener('change', renderList); document.querySelector('#historyDate').addEventListener('change', renderList); renderList();
    document.querySelector('[data-clear-history]').addEventListener('click', async () => { if (!confirm('Apagar todo o histórico de partidas?')) return; await store.clearHistory(); await refresh(); renderHistory(); });
    document.querySelector('[data-history-json]').addEventListener('click', () => downloadText('roda-a-roda-historico.json', JSON.stringify(state.history, null, 2), 'application/json'));
    document.querySelector('[data-history-csv]').addEventListener('click', () => { const rows = [['id','data','modo','vencedor','duracao_ms','rodadas','jogadores'].map(csvCell).join(','), ...state.history.map((m) => [m.id,m.completedAt,m.mode,m.winner?.name || '',m.durationMs || 0,m.rounds?.length || 0,(m.players || []).map((p)=>`${p.name}:${p.score}`).join('|')].map(csvCell).join(','))]; downloadText('roda-a-roda-historico.csv','\ufeff'+rows.join('\n'),'text/csv;charset=utf-8'); });
  }

  function bindHistoryCards() {
    document.querySelectorAll('[data-history-delete]').forEach((btn) => btn.addEventListener('click', async () => { if (!confirm('Excluir esta partida do histórico?')) return; await store.deleteHistory(btn.dataset.historyDelete); await refresh(); renderHistory(); }));
    document.querySelectorAll('[data-history-detail]').forEach((btn) => btn.addEventListener('click', () => { const m = state.history.find((x) => x.id === btn.dataset.historyDetail); if (!m) return; editorShell(`<div class="match-detail"><header><div><small>${fmtDate(m.completedAt)}</small><h3>${esc(m.winner?.name || 'Partida')}</h3></div><button type="button" data-editor-close>×</button></header>${(m.rounds || []).map((r, i) => `<section><small>RODADA ${i+1} • ${esc(r.theme || '')}</small><h4>${esc(r.answer || '')}</h4><p>${esc(r.question || '')}</p><div class="detail-grid"><span>Resolveu: <b>${esc(r.solvedBy || '—')}</b></span><span>Pontos: <b>${r.pointsAwarded || 0}</b></span><span>Dicas: <b>${r.hintsUsed?.length || 0}</b></span><span>Duração: <b>${Math.round((r.durationMs || 0)/1000)}s</b></span><span>Letras erradas: <b>${esc((r.incorrectLetters || []).join(', ') || '—')}</b></span><span>Tentativas erradas: <b>${r.incorrectSolves?.length || 0}</b></span></div></section>`).join('')}</div>`); body.querySelectorAll('[data-editor-close]').forEach((b) => b.addEventListener('click', closeEditor)); }));
  }

  function renderStats() {
    title.textContent = 'Estatísticas';
    const playerMap = new Map();
    const themeMap = new Map();
    const qMap = new Map();
    let totalDuration = 0;
    const playerRow = (name) => {
      if (!name) return null;
      if (!playerMap.has(name)) playerMap.set(name, { name, matches:0, wins:0, total:0, high:0, solved:0, solveAttempts:0, hints:0, bankrupts:0, correctLetters:0, incorrectLetters:0 });
      return playerMap.get(name);
    };
    for (const m of state.history) {
      totalDuration += m.durationMs || 0;
      for (const p of m.players || []) {
        const row = playerRow(p.name); row.matches++; row.total += p.score || 0; row.high = Math.max(row.high, p.score || 0); if (m.winner?.name === p.name) row.wins++;
      }
      for (const r of m.rounds || []) {
        const t = themeMap.get(r.theme) || { name:r.theme, played:0, score:0 }; t.played++; t.score += r.pointsAwarded || 0; themeMap.set(r.theme,t);
        const q = qMap.get(r.questionId) || { answer:r.answer, played:0, solved:0 }; q.played++; if (r.solvedBy) q.solved++; qMap.set(r.questionId,q);
        if (r.solvedBy) { const p = playerRow(r.solvedBy); p.solved++; p.solveAttempts++; }
        for (const attempt of r.incorrectSolves || []) { const p = playerRow(attempt.player); if (p) p.solveAttempts++; }
        for (const attempt of r.lettersAttempted || []) { const p = playerRow(attempt.player); if (p) attempt.correct ? p.correctLetters++ : p.incorrectLetters++; }
        for (const hint of r.hintsUsed || []) { const p = playerRow(hint.player); if (p) p.hints++; }
        for (const wr of r.wheelResults || []) if (wr.type === 'bankrupt' && wr.player) { const p = playerRow(wr.player); if (p) p.bankrupts++; }
      }
    }
    const players = [...playerMap.values()].sort((a,b)=>b.total-a.total);
    const themesByPlayed = [...themeMap.values()].sort((a,b)=>b.played-a.played);
    const themesByScore = [...themeMap.values()].sort((a,b)=>b.score-a.score);
    const qsHard = [...qMap.values()].sort((a,b)=>(a.solved/Math.max(1,a.played))-(b.solved/Math.max(1,b.played)));
    const qsEasy = [...qMap.values()].sort((a,b)=>(b.solved/Math.max(1,b.played))-(a.solved/Math.max(1,a.played)));
    const neverPlayed = state.questions.filter(q=>!(q.timesPlayed||0));
    body.innerHTML = `<div class="platform-metrics"><div><strong>${state.history.length}</strong><span>partidas</span></div><div><strong>${state.history.reduce((n,m)=>n+(m.rounds?.length||0),0)}</strong><span>rodadas</span></div><div><strong>${state.history.length ? Math.round(totalDuration/state.history.length/60000) : 0}</strong><span>min médios</span></div><div><strong>${neverPlayed.length}</strong><span>nunca jogadas</span></div></div><div class="stats-grid">
      <section><h3>JOGADORES</h3>${players.length ? players.map((p)=>`<div class="stat-row"><div><strong>${esc(p.name)}</strong><small>${p.matches} partidas • ${p.wins} vitórias • média ${Math.round(p.total/Math.max(1,p.matches)).toLocaleString('pt-BR')} pts<br>${p.correctLetters} letras certas • ${p.incorrectLetters} erradas • ${p.hints} dicas • ${p.bankrupts} perde-tudo</small></div><span>${p.total.toLocaleString('pt-BR')} pts<br><small>máx ${p.high.toLocaleString('pt-BR')} • solução ${pct(p.solved,p.solveAttempts)}</small></span></div>`).join(''):'<p>Sem dados ainda.</p>'}</section>
      <section><h3>TEMAS MAIS JOGADOS</h3>${themesByPlayed.slice(0,8).map((t)=>`<div class="stat-row"><strong>${esc(t.name||'—')}</strong><span>${t.played}x</span></div>`).join('')||'<p>Sem dados ainda.</p>'}<h3 style="margin-top:16px">TEMAS COM MAIS PONTOS</h3>${themesByScore.slice(0,6).map((t)=>`<div class="stat-row"><strong>${esc(t.name||'—')}</strong><span>${t.score.toLocaleString('pt-BR')} pts</span></div>`).join('')||'<p>Sem dados ainda.</p>'}</section>
      <section><h3>PERGUNTAS MAIS DIFÍCEIS</h3>${qsHard.slice(0,6).map((q)=>`<div class="stat-row"><strong>${esc(q.answer)}</strong><span>${pct(q.solved,q.played)} • ${q.played}x</span></div>`).join('')||'<p>Sem dados ainda.</p>'}<h3 style="margin-top:16px">MAIS FÁCEIS</h3>${qsEasy.slice(0,6).map((q)=>`<div class="stat-row"><strong>${esc(q.answer)}</strong><span>${pct(q.solved,q.played)} • ${q.played}x</span></div>`).join('')||'<p>Sem dados ainda.</p>'}</section>
      <section><h3>NUNCA JOGADAS</h3>${neverPlayed.slice(0,8).map((q)=>`<div class="stat-row"><strong>${esc(q.answer)}</strong><span>${esc(themeName(q.themeId))}</span></div>`).join('')||'<p>Todas as perguntas já apareceram.</p>'}<h3 style="margin-top:16px">RECENTES</h3>${state.questions.filter(q=>q.lastPlayedAt).sort((a,b)=>String(b.lastPlayedAt).localeCompare(String(a.lastPlayedAt))).slice(0,6).map((q)=>`<div class="stat-row"><strong>${esc(q.answer)}</strong><span>${fmtDate(q.lastPlayedAt)}</span></div>`).join('')||'<p>Nenhuma pergunta jogada ainda.</p>'}</section>
    </div>`;
  }

  function renderRules() {
    title.textContent = 'Regras e pontuação'; const r = state.rules; const penalties = Array.isArray(r.hintPenalties) ? r.hintPenalties : [150,250,400];
    body.innerHTML = `<form id="rulesForm" class="rules-form"><div class="platform-metrics"><div><strong>${r.solveBonus || 0}</strong><span>bônus solução</span></div><div><strong>${r.wrongSolvePenalty || 0}</strong><span>erro resposta</span></div><div><strong>${penalties[0] || 0}</strong><span>1ª dica</span></div><div><strong>${r.comboEnabled ? 'ON' : 'OFF'}</strong><span>combo</span></div></div><div class="rules-grid"><label><span>BÔNUS POR RESOLVER</span><input name="solveBonus" type="number" min="0" step="50" value="${r.solveBonus || 0}"></label><label><span>PENALIDADE RESPOSTA ERRADA</span><input name="wrongSolvePenalty" type="number" min="0" step="50" value="${r.wrongSolvePenalty || 0}"></label><label><span>DICAS (separe por vírgula)</span><input name="hintPenalties" value="${penalties.join(', ')}"></label><label><span>COMBO: PASSO DO MULTIPLICADOR</span><input name="comboStep" type="number" min="0" max="1" step="0.05" value="${r.comboStep ?? .1}"></label><label><span>COMBO: MULTIPLICADOR MÁXIMO</span><input name="maxComboMultiplier" type="number" min="1" max="5" step="0.1" value="${r.maxComboMultiplier ?? 1.5}"></label><label><span>MULTIPLICADOR FÁCIL</span><input name="difficultyEasy" type="number" min="0.1" max="5" step="0.05" value="${r.difficultyMultipliers?.easy ?? 1}"></label><label><span>MULTIPLICADOR MÉDIO</span><input name="difficultyMedium" type="number" min="0.1" max="5" step="0.05" value="${r.difficultyMultipliers?.medium ?? 1.15}"></label><label><span>MULTIPLICADOR DIFÍCIL</span><input name="difficultyHard" type="number" min="0.1" max="5" step="0.05" value="${r.difficultyMultipliers?.hard ?? 1.35}"></label><label><span>PERDE TUDO</span><select name="bankruptBehavior"><option value="match" ${r.bankruptBehavior==='match'?'selected':''}>Zera placar da partida</option><option value="round" ${r.bankruptBehavior==='round'?'selected':''}>Zera só pontos da rodada</option></select></label></div><div class="rules-toggles"><label><input name="difficultyBonusEnabled" type="checkbox" ${r.difficultyBonusEnabled?'checked':''}> Bônus por dificuldade</label><label><input name="comboEnabled" type="checkbox" ${r.comboEnabled?'checked':''}> Combo de acertos consecutivos</label><label><input name="wrongSolveLosesTurn" type="checkbox" ${r.wrongSolveLosesTurn!==false?'checked':''}> Resposta errada passa a vez</label></div><footer><button type="button" data-rules-reset>RESTAURAR PADRÃO</button><button class="platform-primary" type="submit">SALVAR REGRAS</button></footer></form>`;
    const form = document.querySelector('#rulesForm'); form.addEventListener('submit', async (e)=>{e.preventDefault(); const fd=new FormData(form); const rules={...state.rules,solveBonus:Number(fd.get('solveBonus'))||0,wrongSolvePenalty:Number(fd.get('wrongSolvePenalty'))||0,hintPenalties:String(fd.get('hintPenalties')||'').split(',').map(x=>Math.max(0,Number(x.trim())||0)).filter((_,i)=>i<12),comboStep:Number(fd.get('comboStep'))||0,maxComboMultiplier:Number(fd.get('maxComboMultiplier'))||1,difficultyMultipliers:{easy:Number(fd.get('difficultyEasy'))||1,medium:Number(fd.get('difficultyMedium'))||1.15,hard:Number(fd.get('difficultyHard'))||1.35},bankruptBehavior:fd.get('bankruptBehavior'),difficultyBonusEnabled:fd.get('difficultyBonusEnabled')==='on',comboEnabled:fd.get('comboEnabled')==='on',wrongSolveLosesTurn:fd.get('wrongSolveLosesTurn')==='on'}; await store.setKv('rules',rules); state.rules=rules; toast?.('Regras salvas','good'); renderRules(); });
    document.querySelector('[data-rules-reset]').addEventListener('click', async()=>{ if(!confirm('Restaurar as regras padrão?')) return; await store.setKv('rules',config.defaultRules||{}); state.rules={...(config.defaultRules||{})}; renderRules(); });
  }

  async function openSetup({ multiplayer = false, host = true } = {}) {
    await refresh(); const previous = await store.getKv('lastSetup', {}); const enabledThemes = state.themes.filter((t)=>t.enabled); const selected = new Set(previous.themeIds?.length ? previous.themeIds : enabledThemes.map((t)=>t.id));
    setupModal.hidden = false; document.body.classList.add('has-platform-modal');
    setupBody.innerHTML = `<form id="gameSetupForm" class="setup-form"><div class="setup-highlight"><strong id="eligibleCount">0</strong><span>perguntas elegíveis</span></div><label><span>QUANTIDADE DE RODADAS</span><input name="rounds" type="number" min="1" max="50" value="${Math.max(1,Number(previous.rounds)||3)}"></label><label><span>DIFICULDADE</span><select name="difficulty"><option value="all">Todas</option><option value="easy" ${previous.difficulty==='easy'?'selected':''}>Fácil</option><option value="medium" ${previous.difficulty==='medium'?'selected':''}>Média</option><option value="hard" ${previous.difficulty==='hard'?'selected':''}>Difícil</option></select></label><div class="setup-theme-head"><span>TEMAS</span><div><button type="button" data-all-themes>TODOS</button><button type="button" data-random-mix>TEMAS ALEATÓRIOS</button></div></div><div class="setup-themes">${enabledThemes.map((t)=>`<label><input type="checkbox" data-setup-theme value="${esc(t.id)}" ${selected.has(t.id)?'checked':''}><span>${esc(t.name)}<small>${state.questions.filter(q=>q.themeId===t.id&&q.enabled).length} perguntas</small></span></label>`).join('')}</div><label class="toggle-line"><input name="randomMix" type="checkbox" ${previous.randomMix!==false?'checked':''}><span>Random Mix — misturar livremente as perguntas dos temas selecionados</span></label><label class="toggle-line"><input name="noRepeat" type="checkbox" ${previous.noRepeat!==false?'checked':''}><span>Evitar repetir perguntas até esgotar o pool</span></label><p class="setup-note">${multiplayer ? (host ? 'Você é o host: esta configuração será usada para escolher as perguntas e sincronizada pelo estado da partida.' : 'A configuração da partida é controlada pelo host.') : 'As últimas escolhas ficam salvas neste navegador.'}</p><footer>${multiplayer && !host ? '<button type="button" data-setup-cancel>FECHAR</button>' : '<button type="button" data-setup-cancel>CANCELAR</button><button class="platform-primary" type="submit">COMEÇAR PARTIDA</button>'}</footer></form>`;
    const form=setupBody.querySelector('#gameSetupForm'); requestAnimationFrame(() => form.querySelector('input, select, button')?.focus()); const updateCount=()=>{ const ids=[...form.querySelectorAll('[data-setup-theme]:checked')].map(x=>x.value); const diff=form.difficulty.value; const count=state.questions.filter(q=>q.enabled&&ids.includes(q.themeId)&&(diff==='all'||q.difficulty===diff)).length; form.querySelector('#eligibleCount').textContent=String(count); return count; }; form.querySelectorAll('[data-setup-theme]').forEach(x=>x.addEventListener('change',updateCount)); form.difficulty.addEventListener('change',updateCount); updateCount();
    form.querySelector('[data-all-themes]')?.addEventListener('click',()=>{form.querySelectorAll('[data-setup-theme]').forEach(x=>x.checked=true);updateCount();}); form.querySelector('[data-random-mix]')?.addEventListener('click',()=>{const boxes=[...form.querySelectorAll('[data-setup-theme]')];boxes.forEach(x=>x.checked=Math.random()>.45);if(!boxes.some(x=>x.checked)&&boxes[0])boxes[0].checked=true;updateCount();});
    return new Promise((resolve)=>{ const done=(value)=>{setupModal.hidden=true;document.body.classList.remove('has-platform-modal');resolve(value);}; form.querySelector('[data-setup-cancel]')?.addEventListener('click',()=>done(null)); if(multiplayer&&!host) return; form.addEventListener('submit',async(e)=>{e.preventDefault(); const count=updateCount(); const ids=[...form.querySelectorAll('[data-setup-theme]:checked')].map(x=>x.value); const rounds=Math.max(1,Math.min(50,Number(form.rounds.value)||3)); if(!ids.length){alert('Selecione pelo menos um tema.');return;} if(count<1){alert('Nenhuma pergunta ativa atende aos filtros.');return;} if(count<rounds&&!confirm(`Há ${count} pergunta(s) para ${rounds} rodada(s). O pool poderá se repetir depois de esgotar. Continuar?`))return; const setup={themeIds:ids,difficulty:form.difficulty.value,rounds,noRepeat:form.noRepeat.checked,randomMix:form.randomMix.checked}; await store.setKv('lastSetup',setup); done(setup);}); });
  }

  function showResults(summary, actions = {}) {
    resultsModal.hidden = false; document.body.classList.add('has-platform-modal'); const ranking=[...(summary.players||[])].sort((a,b)=>(b.score||0)-(a.score||0));
    const rounds = summary.rounds || [];
    const strongest = [...rounds].sort((a,b)=>(b.pointsAwarded||0)-(a.pointsAwarded||0))[0];
    const solvedCount = rounds.filter((r)=>r.solvedBy).length;
    resultsBody.innerHTML = `<div class="winner-block"><span>VENCEDOR</span><strong>${esc(summary.winner?.name || ranking[0]?.name || '—')}</strong><small>${Number(summary.winner?.score ?? ranking[0]?.score ?? 0).toLocaleString('pt-BR')} pontos</small></div><div class="final-ranking">${ranking.map((p,i)=>`<div><b>#${i+1}</b><span>${esc(p.name)}</span><strong>${Number(p.score||0).toLocaleString('pt-BR')}</strong></div>`).join('')}</div>${strongest ? `<div class="strongest-round"><small>RODADA MAIS FORTE</small><strong>${esc(strongest.answer || '—')}</strong><span>${Number(strongest.pointsAwarded||0).toLocaleString('pt-BR')} pts • ${esc(strongest.solvedBy || 'sem solução')}</span></div>` : ''}<div class="result-facts"><span>${rounds.length} rodadas</span><span>${solvedCount} puzzles resolvidos</span><span>${Math.round((summary.durationMs||0)/60000)} min</span><span>${rounds.reduce((n,r)=>n+(r.hintsUsed?.length||0),0)} dicas</span></div><div class="result-actions"><button class="platform-primary" type="button" data-result-again>JOGAR DE NOVO</button><button type="button" data-result-same>MESMAS CONFIGURAÇÕES</button><button type="button" data-result-details>DETALHES</button><button type="button" data-result-stats>ESTATÍSTICAS</button><button type="button" data-result-menu>MENU PRINCIPAL</button></div>`;
    requestAnimationFrame(() => resultsBody.querySelector('[data-result-again]')?.focus());
    const close=()=>{resultsModal.hidden=true;document.body.classList.remove('has-platform-modal');}; resultsBody.querySelector('[data-result-again]').addEventListener('click',()=>{close();actions.playAgain?.(false);}); resultsBody.querySelector('[data-result-same]').addEventListener('click',()=>{close();actions.playAgain?.(true);}); resultsBody.querySelector('[data-result-menu]').addEventListener('click',()=>{close();actions.menu?.();}); resultsBody.querySelector('[data-result-details]').addEventListener('click',()=>{close();open('history');}); resultsBody.querySelector('[data-result-stats]').addEventListener('click',()=>{close();open('stats');});
  }

  document.querySelectorAll('[data-open-platform]').forEach((btn)=>btn.addEventListener('click',()=>open(btn.dataset.openPlatform)));
  document.querySelectorAll('[data-platform-close]').forEach((btn)=>btn.addEventListener('click',close));
  document.querySelectorAll('[data-platform-view]').forEach((btn)=>btn.addEventListener('click',()=>{state.activeView=btn.dataset.platformView;render();}));
  document.addEventListener('keydown',(e)=>{
    const activeDialog = !resultsModal.hidden ? resultsModal : (!setupModal.hidden ? setupModal : (!modal.hidden ? modal : null));
    if (e.key === 'Escape' && activeDialog === modal) { close(); return; }
    if (e.key !== 'Tab' || !activeDialog) return;
    const focusable = [...activeDialog.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((el) => !el.hidden && el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function hideResults() { resultsModal.hidden = true; document.body.classList.remove('has-platform-modal'); }
  return { open, close, refresh, openSetup, showResults, hideResults, getRules:()=>({...state.rules}), getState:()=>state };
}
