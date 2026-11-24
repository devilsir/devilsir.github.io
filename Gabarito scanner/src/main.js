import {
  MARK_STYLES,
  OMR_ANNULLED,
  OPTION_SCHEMES,
  ORIENTATIONS,
  STORAGE_KEYS,
  formatOptionRange,
  getOptionLabels,
  getOptionScheme,
  resolveOptionCount
} from './config.js';
import { clamp, confidenceLabel, rotatePoint, round } from './utils/math.js';
import { ImageLoader, loadOpenCV } from './utils/image.js';
import { AnswerKeyParser, AnswerScorer } from './scoring/answer-key.js';
import { OMREngine } from './cv/omr-engine.js';
import { TemplateRegistrar } from './cv/template-registrar.js';
import { CropEditor } from './ui/crop-editor.js';
import { ResultOverlay } from './ui/result-overlay.js';
import { ZoomPanViewer } from './ui/zoom-viewer.js';
import { CAPTURE_CONDITIONS, DEMO_PRESETS, generateDemoPhoto } from './demo/demo-sheets.js';
import { downloadTextFile, formatBenchmarkSuiteTxt, formatSingleScanTxt } from './utils/txt-export.js';
import { buildZipBlob, downloadBlob } from './utils/zip.js';

console.info('[OMR] build v10 (ES Modules · Vertical/Horizontal · Multi-estilo) carregado');

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const els = {
  engineState: $('#engineState'),
  newScanButton: $('#newScanButton'),
  screens: $$('.screen'),
  steps: $$('.step'),
  uploadScreen: $('#uploadScreen'),
  cropScreen: $('#cropScreen'),
  processingScreen: $('#processingScreen'),
  resultsScreen: $('#resultsScreen'),
  fileInput: $('#fileInput'),
  cameraInput: $('#cameraInput'),
  chooseFileButton: $('#chooseFileButton'),
  cameraButton: $('#cameraButton'),
  demoButton: $('#demoButton'),
  demoPreset: $('#demoPreset'),
  runSuiteButton: $('#runSuiteButton'),
  downloadDemoImageButton: $('#downloadDemoImageButton'),
  dropZone: $('#dropZone'),
  questionCount: $('#questionCount'),
  optionScheme: $('#optionScheme'),
  optionCount: $('#optionCount'),
  orientation: $('#sheetOrientation'),
  markStyle: $('#markStyle'),
  maxGrade: $('#maxGrade'),
  pointsPerQuestionHint: $('#pointsPerQuestionHint'),
  recognitionMode: $('#recognitionMode'),
  readingOrder: $('#readingOrder'),
  readingOrderField: $('#readingOrderField'),
  answerKeyInput: $('#answerKeyInput'),
  answerKeyHint: $('#answerKeyHint'),
  resultKeyCard: $('#resultKeyCard'),
  resultKeyStatus: $('#resultKeyStatus'),
  resultAnswerKeyInput: $('#resultAnswerKeyInput'),
  resultAnswerKeyHint: $('#resultAnswerKeyHint'),
  useDetectedAsKeyButton: $('#useDetectedAsKeyButton'),
  applyResultKeyButton: $('#applyResultKeyButton'),
  sourceCanvas: $('#sourceCanvas'),
  cropOverlayCanvas: $('#cropOverlayCanvas'),
  cropCanvasStack: $('#cropCanvasStack'),
  cropViewport: $('#cropViewport'),
  documentConfidence: $('#documentConfidence'),
  documentWarning: $('#documentWarning'),
  rotateLeftButton: $('#rotateLeftButton'),
  rotateRightButton: $('#rotateRightButton'),
  redetectButton: $('#redetectButton'),
  resetCornersButton: $('#resetCornersButton'),
  confirmCropButton: $('#confirmCropButton'),
  backToUploadButton: $('#backToUploadButton'),
  processingStage: $('#processingStage'),
  processingDetail: $('#processingDetail'),
  processingProgress: $('#processingProgress'),
  resultLead: $('#resultLead'),
  gradeLabel: $('#gradeLabel'),
  gradeScore: $('#gradeScore'),
  scoreFraction: $('#scoreFraction'),
  scorePercent: $('#scorePercent'),
  correctCount: $('#correctCount'),
  incorrectCount: $('#incorrectCount'),
  blankCount: $('#blankCount'),
  multipleCount: $('#multipleCount'),
  ambiguousCount: $('#ambiguousCount'),
  annulledCount: $('#annulledCount'),
  rectifiedCanvas: $('#rectifiedCanvas'),
  resultOverlayCanvas: $('#resultOverlayCanvas'),
  viewerViewport: $('#viewerViewport'),
  zoomStage: $('#zoomStage'),
  zoomOutButton: $('#zoomOutButton'),
  zoomInButton: $('#zoomInButton'),
  zoomFitButton: $('#zoomFitButton'),
  zoom100Button: $('#zoom100Button'),
  zoomReadout: $('#zoomReadout'),
  layerButtons: $$('[data-view-layer]'),
  questionList: $('#questionList'),
  uncertainOnlyToggle: $('#uncertainOnlyToggle'),
  qualityScore: $('#qualityScore'),
  qualityBars: $('#qualityBars'),
  diagnosticList: $('#diagnosticList'),
  debugToggle: $('#debugToggle'),
  debugOptions: $('#debugOptions'),
  debugInputs: $$('[data-debug]'),
  geometrySummary: $('#geometrySummary'),
  saveTemplateButton: $('#saveTemplateButton'),
  exportTxtButton: $('#exportTxtButton'),
  exportJsonButton: $('#exportJsonButton'),
  finishButton: $('#finishButton'),
  suiteModal: $('#suiteModal'),
  suiteBackdrop: $('#suiteBackdrop'),
  closeSuiteButton: $('#closeSuiteButton'),
  suiteStatus: $('#suiteStatus'),
  suiteProgress: $('#suiteProgress'),
  suiteReportOutput: $('#suiteReportOutput'),
  rerunSuiteButton: $('#rerunSuiteButton'),
  copySuiteTxtButton: $('#copySuiteTxtButton'),
  downloadSuiteTxtButton: $('#downloadSuiteTxtButton'),
  downloadSuiteZipButton: $('#downloadSuiteZipButton'),
  reviewSheet: $('#reviewSheet'),
  reviewBackdrop: $('#reviewBackdrop'),
  closeReviewButton: $('#closeReviewButton'),
  reviewSheetMeta: $('#reviewSheetMeta'),
  reviewSheetTitle: $('#reviewSheetTitle'),
  bubbleEvidence: $('#bubbleEvidence'),
  manualOptions: $('#manualOptions'),
  clearOverrideButton: $('#clearOverrideButton'),
  toastRegion: $('#toastRegion')
};

const state = {
  cv: null,
  engine: null,
  image: null,
  documentDetection: null,
  cropManuallyAdjusted: false,
  result: null,
  scored: null,
  answerKey: [],
  answerKeyErrors: [],
  answerKeyWarnings: [],
  answerKeyOrigin: 'empty',
  selectedQuestion: null,
  currentLayer: 'rectified',
  debug: { debug: false, rows: true, bubbles: true, centers: false, scores: false, inferred: true },
  busy: false,
  lastSuiteTxt: '',
  lastSuiteZipBlob: null
};

const parser = new AnswerKeyParser();
const scorer = new AnswerScorer();
const templateStore = new TemplateRegistrar();

const cropEditor = new CropEditor({
  imageCanvas: els.sourceCanvas,
  overlayCanvas: els.cropOverlayCanvas,
  stack: els.cropCanvasStack,
  viewport: els.cropViewport,
  onChange: (_pts, meta) => {
    if (meta.manual) state.cropManuallyAdjusted = true;
  }
});

const overlay = new ResultOverlay(els.resultOverlayCanvas);

const viewer = new ZoomPanViewer({
  viewport: els.viewerViewport,
  stage: els.zoomStage,
  onZoomChange: ({ label, isFit, percent }) => {
    els.zoomReadout.textContent = isFit ? 'Ajustado' : label || `${percent}%`;
  },
  onTap: (imgPoint) => {
    if (!state.scored) return;
    const hit = overlay.hitTest(imgPoint);
    if (!hit) return;
    const target = state.result.questions.find((q) => q.question === hit.question.question);
    if (!target) return;
    target.manualAnswer = hit.bubble.option;
    state.selectedQuestion = target.question;
    recomputeAndRender({ preserveListScroll: true });
    openReviewSheet(target.question, { focusViewer: false });
    showToast(`Questão ${target.question}: resposta final alterada para ${hit.bubble.option}.`);
  }
});

const fmtGrade = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtPoints = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
const formatGrade = (val) => (val == null ? '—' : fmtGrade.format(val));
const formatPts = (val) => (val == null ? '—' : fmtPoints.format(val));

function setEngineStatus(kind, text) {
  const dot = $('.state-dot', els.engineState);
  dot.className = `state-dot is-${kind}`;
  $('span:last-child', els.engineState).textContent = text;
}

function showToast(message, tone = 'info', duration = 4200) {
  const node = document.createElement('div');
  node.className = `toast${tone === 'info' ? '' : ` is-${tone}`}`;
  node.textContent = message;
  els.toastRegion.append(node);
  window.setTimeout(() => node.remove(), duration);
}

function setBusy(busy) {
  state.busy = busy;
  [
    els.chooseFileButton,
    els.cameraButton,
    els.demoButton,
    els.runSuiteButton,
    els.downloadDemoImageButton,
    els.confirmCropButton,
    els.redetectButton,
    els.rotateLeftButton,
    els.rotateRightButton
  ].forEach((btn) => {
    if (btn) btn.disabled = busy;
  });
}

function populateDemoPresets() {
  if (!els.demoPreset) return;
  const groups = new Map();
  for (const preset of DEMO_PRESETS) {
    if (!groups.has(preset.group)) groups.set(preset.group, []);
    groups.get(preset.group).push(preset);
  }
  const frag = document.createDocumentFragment();
  for (const [groupLabel, items] of groups.entries()) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupLabel;
    for (const item of items) {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.label;
      if (item.id === 'enem-vertical') opt.selected = true;
      optgroup.append(opt);
    }
    frag.append(optgroup);
  }
  els.demoPreset.replaceChildren(frag);
}

const STEP_ORDER = ['upload', 'crop', 'recognition', 'review'];

function goToScreen(name) {
  const targetId = {
    upload: 'uploadScreen',
    crop: 'cropScreen',
    processing: 'processingScreen',
    results: 'resultsScreen'
  }[name];
  els.screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === targetId));
  const stepName = name === 'processing' ? 'recognition' : name === 'results' ? 'review' : name;
  const stepIdx = STEP_ORDER.indexOf(stepName);
  els.steps.forEach((stepEl, idx) => {
    stepEl.classList.toggle('is-active', idx === stepIdx);
    stepEl.classList.toggle('is-complete', idx < stepIdx);
    stepEl.disabled = idx > stepIdx;
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function syncOptionCountControl() {
  const schemeId = els.optionScheme?.value || 'upper';
  const scheme = getOptionScheme(schemeId);
  const select = els.optionCount;
  if (!select) return;

  const currentVal = Number(select.value) || scheme.defaultCount;
  if (scheme.fixedCount != null) {
    select.innerHTML = `<option value="${scheme.fixedCount}" selected>${formatOptionRange(schemeId, scheme.fixedCount)} (${scheme.fixedCount})</option>`;
    select.value = String(scheme.fixedCount);
    select.disabled = true;
  } else {
    select.disabled = false;
    const allowedCounts = [2, 3, 4, 5, 6].filter((n) => n >= scheme.minCount && n <= scheme.maxCount);
    const chosen = allowedCounts.includes(currentVal) ? currentVal : scheme.defaultCount;
    select.innerHTML = allowedCounts
      .map((n) => `<option value="${n}"${n === chosen ? ' selected' : ''}>${formatOptionRange(schemeId, n)} (${n})</option>`)
      .join('');
    select.value = String(chosen);
  }

  // Update answer key placeholder to reflect active scheme
  const labels = getOptionLabels(schemeId, Number(select.value));
  const sampleLines = [
    `1 ${labels[0]}`,
    `2 ${labels[Math.min(1, labels.length - 1)]}`,
    `3 ${labels[Math.min(2, labels.length - 1)]}`,
    `4 (${labels[0]})`,
    `5 "${labels[Math.min(1, labels.length - 1)]}"`,
    '11 --'
  ].join('\n');
  if (els.answerKeyInput) els.answerKeyInput.placeholder = sampleLines;
  if (els.resultAnswerKeyInput) els.resultAnswerKeyInput.placeholder = sampleLines;
}

function syncOrientationControl() {
  const orient = els.orientation?.value || 'vertical';
  if (els.readingOrderField) {
    const labelSpan = els.readingOrderField.querySelector('span');
    if (labelSpan) {
      labelSpan.textContent =
        orient === 'horizontal' ? 'Ordem em faixas horizontais' : 'Ordem em páginas com colunas';
    }
    const colsOpt = els.readingOrder?.querySelector('option[value="columns"]');
    const rowsOpt = els.readingOrder?.querySelector('option[value="rows"]');
    if (colsOpt) colsOpt.textContent = orient === 'horizontal' ? 'Faixa por faixa (padrão)' : 'Coluna por coluna';
    if (rowsOpt) rowsOpt.textContent = orient === 'horizontal' ? 'Alinhado por coluna' : 'Linha por linha';
  }
}

function readConfig() {
  const rawGrade = Number(String(els.maxGrade.value).replace(',', '.'));
  const optionScheme = els.optionScheme?.value || 'upper';
  const optionCount = resolveOptionCount(optionScheme, Number(els.optionCount.value));
  return {
    expectedQuestions: clamp(Number(els.questionCount.value) || 50, 1, 180),
    optionScheme,
    optionCount,
    orientation: els.orientation?.value || 'vertical',
    markStyle: els.markStyle?.value || 'auto',
    maxGrade: clamp(Number.isFinite(rawGrade) && rawGrade > 0 ? rawGrade : 10, 0.1, 1000),
    readingOrder: els.readingOrder.value,
    mode: els.recognitionMode.value
  };
}

function updatePointsPreview() {
  const cfg = readConfig();
  let annulled = 0;
  try {
    annulled = parser.parse(els.answerKeyInput.value, cfg).annulledCount || 0;
  } catch {}
  const eligible = Math.max(1, cfg.expectedQuestions - annulled);
  const perQ = cfg.maxGrade / eligible;
  const unit = perQ === 1 ? 'ponto' : 'pontos';
  els.pointsPerQuestionHint.textContent = annulled
    ? `${annulled} questão(ões) anulada(s): cada uma das ${eligible} questões válidas vale ${formatPts(perQ)} ${unit}.`
    : `Cada questão vale ${formatPts(perQ)} ${unit}.`;
}

function persistSetup() {
  try {
    localStorage.setItem(
      STORAGE_KEYS.setup,
      JSON.stringify({
        questionCount: els.questionCount.value,
        optionScheme: els.optionScheme?.value || 'upper',
        optionCount: els.optionCount.value,
        orientation: els.orientation?.value || 'vertical',
        markStyle: els.markStyle?.value || 'auto',
        maxGrade: els.maxGrade.value,
        readingOrder: els.readingOrder.value,
        recognitionMode: els.recognitionMode.value,
        answerKey: els.answerKeyInput.value,
        answerKeyOrigin: state.answerKeyOrigin
      })
    );
  } catch {}
}

function restoreSetup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.setup) || localStorage.getItem(STORAGE_KEYS.legacySetup);
    const saved = raw ? JSON.parse(raw) : null;
    if (!saved) {
      syncOptionCountControl();
      syncOrientationControl();
      return;
    }
    if (saved.optionScheme && els.optionScheme && OPTION_SCHEMES[saved.optionScheme]) {
      els.optionScheme.value = saved.optionScheme;
    }
    syncOptionCountControl();
    if (saved.questionCount) els.questionCount.value = saved.questionCount;
    if (saved.optionCount && !els.optionCount.disabled) els.optionCount.value = saved.optionCount;
    if (saved.orientation && els.orientation && ORIENTATIONS[saved.orientation]) {
      els.orientation.value = saved.orientation;
    }
    if (saved.markStyle && els.markStyle && MARK_STYLES[saved.markStyle]) {
      els.markStyle.value = saved.markStyle;
    }
    if (saved.maxGrade) els.maxGrade.value = saved.maxGrade;
    if (saved.readingOrder) els.readingOrder.value = saved.readingOrder;
    if (saved.answerKey) {
      els.answerKeyInput.value = saved.answerKey;
      state.answerKeyOrigin = saved.answerKeyOrigin || 'user';
    }
    syncOrientationControl();
  } catch {
    syncOptionCountControl();
    syncOrientationControl();
  }
}

function refreshTemplateOption() {
  const opt = $('option[value="template"]', els.recognitionMode);
  const tpl = templateStore.load();
  opt.disabled = !tpl;
  if (tpl) {
    const orientTxt = tpl.orientation === 'horizontal' ? 'horizontal' : 'vertical';
    const rangeTxt = formatOptionRange(tpl.optionScheme || 'upper', tpl.optionCount);
    opt.textContent = `Modelo salvo · ${tpl.questionCount} q / ${rangeTxt} (${orientTxt})`;
  } else {
    opt.textContent = 'Modelo salvo — nenhum disponível';
    if (els.recognitionMode.value === 'template') els.recognitionMode.value = 'auto';
  }
}

function validateSetupAnswerKey({ announce = false } = {}) {
  const cfg = readConfig();
  const parsed = parser.parse(els.answerKeyInput.value, cfg);
  els.answerKeyHint.classList.toggle('is-error', parsed.errors.length > 0);
  if (parsed.errors.length) {
    els.answerKeyHint.textContent = `No gabarito oficial: ${parsed.errors[0]}`;
    if (announce) showToast(`No gabarito oficial: ${parsed.errors[0]}`, 'error');
  } else if (parsed.warnings.length) {
    els.answerKeyHint.textContent = parsed.warnings[0];
  } else {
    els.answerKeyHint.textContent = `${parsed.validCount} resposta(s) válida(s) reconhecida(s)${parsed.annulledCount ? ` · ${parsed.annulledCount} anulada(s)` : ''}.`;
  }
  updatePointsPreview();
  return parsed;
}

function applyParsedAnswerKey(parsed) {
  state.answerKey = parsed.errors.length ? [] : parsed.answers;
  state.answerKeyErrors = [...parsed.errors];
  state.answerKeyWarnings = [...parsed.warnings];
}

function updateResultKeyCard(parsed) {
  if (!els.resultKeyCard) return;
  const hasText = els.resultAnswerKeyInput.value.trim().length > 0;
  const cfg = readConfig();
  const optCount = state.result?.optionCount || cfg.optionCount;
  const schemeId = state.result?.optionScheme || cfg.optionScheme;
  const qCount = state.result?.questions.length || cfg.expectedQuestions;

  els.resultAnswerKeyHint.classList.toggle('is-error', parsed.errors.length > 0);
  els.resultKeyCard.classList.toggle('is-required', parsed.errors.length > 0 || !hasText);

  if (parsed.errors.length) {
    els.resultKeyStatus.textContent = 'Corrija para calcular a nota';
    els.resultAnswerKeyHint.textContent = `No gabarito oficial: ${parsed.errors[0]} A folha configurada aceita ${formatOptionRange(schemeId, optCount)}.`;
    els.resultKeyCard.open = true;
  } else if (hasText) {
    if (parsed.warnings.length) {
      els.resultKeyStatus.textContent = `${parsed.validCount} resposta(s) válida(s)${parsed.annulledCount ? ` · ${parsed.annulledCount} anulada(s)` : ''} · nota parcial`;
      els.resultAnswerKeyHint.textContent = parsed.warnings[0];
    } else {
      els.resultKeyStatus.textContent = `${parsed.validCount} resposta(s) válida(s)${parsed.annulledCount ? ` · ${parsed.annulledCount} anulada(s)` : ''}`;
      els.resultAnswerKeyHint.textContent = parsed.annulledCount
        ? 'Gabarito válido. Questões anuladas foram retiradas do total e a nota foi redistribuída entre as demais.'
        : 'Gabarito válido. A nota abaixo já foi recalculada.';
    }
  } else {
    els.resultKeyStatus.textContent = `${qCount} respostas lidas · falta o gabarito correto`;
    els.resultAnswerKeyHint.textContent =
      'Cole as respostas corretas para calcular acertos e nota. Se esta for a folha do professor, use “Esta folha é o gabarito mestre”.';
    els.resultKeyCard.open = true;
  }
}

function syncResultAnswerKey() {
  const cfg = readConfig();
  const effectiveCfg = {
    ...cfg,
    optionCount: state.result?.optionCount || cfg.optionCount,
    optionScheme: state.result?.optionScheme || cfg.optionScheme,
    expectedQuestions: state.result?.questions.length || cfg.expectedQuestions
  };
  const parsed = parser.parse(els.answerKeyInput.value, effectiveCfg);
  applyParsedAnswerKey(parsed);
  els.resultAnswerKeyInput.value = els.answerKeyInput.value;
  updateResultKeyCard(parsed);
  return parsed;
}

function applyResultKeyEditor() {
  els.answerKeyInput.value = els.resultAnswerKeyInput.value;
  state.answerKeyOrigin = els.answerKeyInput.value.trim() ? 'user' : 'empty';
  const parsed = validateSetupAnswerKey();
  applyParsedAnswerKey(parsed);
  updateResultKeyCard(parsed);
  persistSetup();
  recomputeAndRender();
  if (parsed.errors.length) {
    showToast(parsed.errors[0], 'error', 6500);
  } else {
    if (!parsed.warnings.length) els.resultKeyCard.open = false;
    showToast(
      parsed.warnings.length ? 'Gabarito aplicado. A nota permanece parcial.' : 'Gabarito aplicado e nota recalculada.',
      parsed.warnings.length ? 'warning' : 'success'
    );
  }
}

function useSheetAsMasterKey() {
  if (!state.result || !state.scored) return;
  const problematic = state.scored.questions.filter(
    (q) =>
      typeof (q.manualAnswer === undefined ? q.detectedAnswer : q.manualAnswer) !== 'string' ||
      (['blank', 'multiple', 'ambiguous'].includes(q.classification) && q.manualAnswer === undefined)
  );
  if (problematic.length) {
    showToast(
      `Revise primeiro as questões ${problematic.slice(0, 8).map((q) => q.question).join(', ')}${problematic.length > 8 ? '…' : ''}. O gabarito mestre exige uma resposta única por questão.`,
      'warning',
      8000
    );
    return;
  }
  if (
    !window.confirm(
      'Use esta opção apenas se a foto for a folha oficial do professor. As respostas lidas serão salvas como gabarito para corrigir as próximas provas. Continuar?'
    )
  ) {
    return;
  }
  const answers = state.scored.questions.map((q) => (q.manualAnswer === undefined ? q.detectedAnswer : q.manualAnswer));
  const formatted = parser.format(answers);
  els.answerKeyInput.value = formatted;
  els.resultAnswerKeyInput.value = formatted;
  state.answerKeyOrigin = 'user';
  const parsed = validateSetupAnswerKey();
  applyParsedAnswerKey(parsed);
  updateResultKeyCard(parsed);
  els.resultKeyCard.open = false;
  persistSetup();
  recomputeAndRender();
  showToast('Esta folha foi salva como gabarito mestre. As próximas provas usarão estas respostas.', 'success', 7500);
}

async function ensureEngine() {
  if (state.engine) return state.engine;
  const cv = await loadOpenCV({
    onStatus(status, err) {
      if (status === 'loading') setEngineStatus('loading', 'Preparando visão computacional');
      else if (status === 'ready') setEngineStatus('ready', 'Motor v10 pronto · processamento local');
      else setEngineStatus('error', err?.message || 'Motor indisponível');
    }
  });
  state.cv = cv;
  state.engine = new OMREngine(cv);
  return state.engine;
}

async function openCropStage(loadedImage) {
  setBusy(true);
  try {
    const engine = await ensureEngine();
    state.image = loadedImage;
    state.documentDetection = engine.detectDocument(loadedImage.canvas);
    state.cropManuallyAdjusted = false;
    cropEditor.setImage(loadedImage.canvas, state.documentDetection.points);
    renderDocumentConfidence();
    els.newScanButton.hidden = false;
    goToScreen('crop');
  } catch (err) {
    showToast(err.message || 'Não foi possível abrir a imagem.', 'error', 6500);
  } finally {
    setBusy(false);
  }
}

async function handleImageFile(file) {
  if (!file) return;
  setBusy(true);
  try {
    if (state.answerKeyOrigin === 'demo') {
      els.answerKeyInput.value = '';
      state.answerKey = [];
      state.answerKeyErrors = [];
      state.answerKeyWarnings = [];
      state.answerKeyOrigin = 'empty';
      validateSetupAnswerKey();
      persistSetup();
      showToast('O gabarito da demonstração foi removido antes da leitura da sua foto.', 'info', 6200);
    }
    const loaded = await ImageLoader.fromFile(file);
    await openCropStage(loaded);
  } catch (err) {
    showToast(err.message || 'Não foi possível ler este arquivo.', 'error', 6500);
  } finally {
    els.fileInput.value = '';
    els.cameraInput.value = '';
    setBusy(false);
  }
}

function renderDocumentConfidence() {
  const doc = state.documentDetection;
  if (!doc) return;
  const pct = Math.round(doc.confidence * 100);
  $('b', els.documentConfidence).textContent = `${pct}% · ${confidenceLabel(doc.confidence)}`;
  els.documentWarning.hidden = !doc.message;
  els.documentWarning.textContent = doc.message || '';
}

async function redetectDocument() {
  if (!state.image || state.busy) return;
  setBusy(true);
  try {
    const engine = await ensureEngine();
    state.documentDetection = engine.detectDocument(state.image.canvas);
    state.cropManuallyAdjusted = false;
    cropEditor.setPoints(state.documentDetection.points);
    renderDocumentConfidence();
    showToast('O contorno da página foi recalculado.');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBusy(false);
  }
}

function rotateCropImage(direction) {
  if (!state.image || state.busy) return;
  const src = state.image.canvas;
  const pts = cropEditor.getPoints();
  const rotated = ImageLoader.rotate(src, direction);
  const rotatedPts = pts.map((pt) => rotatePoint(pt, src.width, src.height, direction));
  state.image = { ...state.image, canvas: rotated };
  state.documentDetection = {
    ...(state.documentDetection || {}),
    points: rotatedPts,
    message: state.documentDetection?.message
  };
  cropEditor.setImage(rotated, rotatedPts);
  state.cropManuallyAdjusted = true;
}

async function runRecognition() {
  if (!state.image || state.busy) return;
  const cfg = readConfig();
  applyParsedAnswerKey(validateSetupAnswerKey());
  persistSetup();
  setBusy(true);
  goToScreen('processing');
  els.processingProgress.style.width = '3%';

  try {
    const engine = await ensureEngine();
    const result = await engine.recognize(state.image.canvas, cropEditor.getPoints(), {
      ...cfg,
      documentConfidence: state.documentDetection?.confidence ?? 0.3,
      onStage({ label, detail, progress }) {
        els.processingStage.textContent = label;
        els.processingDetail.textContent = detail;
        els.processingProgress.style.width = `${progress}%`;
      }
    });

    if (result.optionCount !== cfg.optionCount && !els.optionCount.disabled) {
      els.optionCount.value = String(result.optionCount);
      persistSetup();
      showToast(
        `A grade física possui ${result.optionCount} alternativas. A configuração foi ajustada automaticamente para ${formatOptionRange(result.optionScheme, result.optionCount)}.`,
        'warning',
        7500
      );
    }

    state.result = result;
    const keyValidation = syncResultAnswerKey();
    state.selectedQuestion =
      result.questions.find((q) => q.classification === 'ambiguous' || q.classification === 'multiple')?.question ?? null;

    renderResultViewerAndQuality();
    recomputeAndRender();
    goToScreen('results');
    requestAnimationFrame(() => viewer.fit());

    if (keyValidation.errors.length) {
      showToast('A folha foi lida. Corrija o gabarito destacado para liberar a nota.', 'warning', 8000);
    }
    if (!result.success) {
      showToast(
        'A leitura ficou incompleta. Confira a orientação (vertical/horizontal), o recorte e ajuste manualmente as questões não localizadas.',
        'warning',
        7500
      );
    }
  } catch (err) {
    console.error('[OMR v10] Falha na leitura', err, err?.cause);
    goToScreen('crop');
    showToast(err.message || 'A leitura falhou. Confira o recorte e tente novamente.', 'error', 7500);
  } finally {
    setBusy(false);
  }
}

function switchViewerLayer(layer) {
  if (!state.result) return;
  const source =
    layer === 'normalized'
      ? state.result.snapshots.normalized
      : layer === 'threshold'
        ? state.result.snapshots.threshold
        : state.result.rectified.canvas;
  els.rectifiedCanvas.width = source.width;
  els.rectifiedCanvas.height = source.height;
  els.rectifiedCanvas.style.width = `${source.width}px`;
  els.rectifiedCanvas.style.height = `${source.height}px`;
  const ctx = els.rectifiedCanvas.getContext('2d', { alpha: false });
  ctx.clearRect(0, 0, source.width, source.height);
  ctx.drawImage(source, 0, 0);
  state.currentLayer = layer;
  els.layerButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.viewLayer === layer));
}

function renderResultViewerAndQuality() {
  const res = state.result;
  switchViewerLayer('rectified');
  overlay.setSize(res.rectified.width, res.rectified.height);
  viewer.setContent(res.rectified.width, res.rectified.height);
  els.qualityScore.textContent = `${Math.round(res.quality.overall * 100)}%`;
  renderQualityCard(res.quality);

  const diag = res.structure.diagnostics;
  const orientText = res.orientation === 'horizontal' ? 'horizontal (alternativas na vertical)' : 'vertical (alternativas na horizontal)';
  els.geometrySummary.textContent = [
    `Modo: ${res.mode === 'template' ? 'modelo registrado' : 'estrutura automática'}.`,
    `Orientação: ${orientText}.`,
    `Detector: ${diag.winningPool || diag.detectorPool || 'auto'}.`,
    `Alternativas: ${formatOptionRange(res.optionScheme, res.optionCount)}.`,
    `${diag.detectedRows} questões detectadas, ${diag.inferredRows} inferidas e ${diag.unresolvedRows} não localizadas.`,
    `${diag.detectedBubbleCount}/${diag.expectedBubbleCount} posições físicas confirmadas.`,
    `${diag.blockCount} bloco(s).`
  ].join(' ');
}

function renderQualityCard(quality) {
  const labels = {
    sharpness: 'Nitidez',
    lighting: 'Iluminação',
    perspective: 'Perspectiva',
    rowDetection: 'Grade',
    bubbleDetection: 'Marcas'
  };
  els.qualityBars.replaceChildren(
    ...Object.entries(quality.components).map(([key, score]) => {
      const row = document.createElement('div');
      row.className = 'quality-row';
      const color = score < 0.45 ? '#ff5f65' : score < 0.7 ? '#ffbf47' : '#bbff38';
      row.style.setProperty('--quality', `${Math.round(score * 100)}%`);
      row.style.setProperty('--bar-color', color);
      row.innerHTML = `<span>${labels[key] || key}</span><i></i><b>${Math.round(score * 100)}%</b>`;
      return row;
    })
  );
  els.diagnosticList.replaceChildren(
    ...quality.issues.map((msg) => {
      const li = document.createElement('li');
      li.textContent = msg;
      return li;
    })
  );
}

const STATUS_LABELS = {
  correct: 'Correta',
  incorrect: 'Incorreta',
  blank: 'Em branco',
  multiple: 'Múltipla',
  ambiguous: 'Revisar',
  unkeyed: 'Sem gabarito',
  annulled: 'Anulada'
};

const formatAnswerValue = (val) => (Array.isArray(val) ? val.join('+') : val ?? '—');

function renderQuestionList({ preserveScroll = false } = {}) {
  const scrollTop = preserveScroll ? els.questionList.scrollTop : 0;
  const onlyUncertain = els.uncertainOnlyToggle.checked;
  const all = state.scored?.questions || [];
  const filtered = onlyUncertain
    ? all.filter(
        (q) =>
          q.status !== 'annulled' &&
          (['ambiguous', 'multiple'].includes(q.status) || q.answerConfidence < 0.58 || q.unresolved)
      )
    : all;

  els.questionList.replaceChildren(
    ...filtered.map((q) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `question-item${q.question === state.selectedQuestion ? ' is-active' : ''}`;
      btn.dataset.question = q.question;
      btn.dataset.status = q.status;
      const finalText = q.status === 'annulled' ? 'ANULADA' : formatAnswerValue(q.finalAnswer);
      const detectedText = formatAnswerValue(q.detectedAnswer);
      const markHint =
        !q.manuallyReviewed && q.markType === 'x-mark'
          ? ' · X'
          : !q.manuallyReviewed && q.markType === 'circled'
            ? ' · círculo'
            : '';
      btn.innerHTML = `
        <span class="question-number">${String(q.question).padStart(2, '0')}</span>
        <span class="question-copy">
          <strong>${STATUS_LABELS[q.status]} · ${finalText}</strong>
          <small>${q.manuallyReviewed ? `Manual · detectado ${detectedText}` : `${Math.round(q.answerConfidence * 100)}% de confiança${markHint}`}</small>
        </span>
        <span class="question-result">
          <small>${formatPts(q.pointsAwarded)} / ${formatPts(q.pointsPossible)} pt</small>
          <span class="question-status">${finalText}</span>
        </span>
      `;
      return btn;
    })
  );
  els.questionList.scrollTop = scrollTop;
}

function renderOverlay() {
  if (!state.scored) return;
  overlay.render(state.scored.questions, state.result.structure, {
    ...state.debug,
    selectedQuestion: state.selectedQuestion
  });
}

function recomputeAndRender({ preserveListScroll = false } = {}) {
  if (!state.result) return;
  state.scored = scorer.score(state.result.questions, state.answerKey, { maxGrade: readConfig().maxGrade });
  const { summary } = state.scored;

  els.gradeLabel.textContent = summary.keyedQuestions
    ? summary.gradeProvisional
      ? 'Nota parcial'
      : 'Nota final'
    : 'Aguardando gabarito';
  els.gradeScore.textContent = `${formatGrade(summary.earnedGrade)} / ${formatGrade(summary.maxGrade)}`;
  els.scoreFraction.textContent = summary.keyedQuestions
    ? `${summary.correct} / ${summary.eligibleQuestions} acertos${summary.annulled ? ` · ${summary.annulled} anulada(s)` : ''}`
    : `${summary.total} respostas lidas`;
  els.scorePercent.textContent = summary.keyedQuestions ? `${summary.percentage}%` : '—%';

  els.correctCount.textContent = summary.keyedQuestions ? summary.correct : '—';
  els.incorrectCount.textContent = summary.keyedQuestions ? summary.incorrect : '—';
  els.blankCount.textContent = summary.blank;
  els.multipleCount.textContent = summary.multiple;
  els.ambiguousCount.textContent = summary.ambiguous;
  els.annulledCount.textContent = summary.annulled;

  els.resultLead.textContent = summary.keyedQuestions
    ? summary.gradeProvisional
      ? `Nota parcial: o gabarito cobre ${summary.keyedQuestions} de ${summary.eligibleQuestions} questões válidas${summary.annulled ? ` e ${summary.annulled} foi/foram anulada(s)` : ''}.`
      : state.result.success
        ? summary.ambiguous + summary.multiple > 0
          ? `${summary.ambiguous + summary.multiple} questão(ões) pedem revisão antes de fechar a nota.${summary.annulled ? ` ${summary.annulled} anulada(s) já foi/foram retirada(s) do cálculo.` : ''}`
          : summary.annulled
            ? `${summary.annulled} questão(ões) anulada(s) foi/foram retirada(s) do total. A nota foi recalculada sobre ${summary.eligibleQuestions} questões válidas.`
            : 'A leitura está consistente. Você ainda pode tocar em qualquer opção para corrigir.'
        : 'A geometria ficou incompleta; nenhuma questão ausente foi tratada como certeza.'
    : state.answerKeyErrors.length
      ? `A leitura está pronta. O gabarito oficial precisa de ajuste: ${state.answerKeyErrors[0]}`
      : `${summary.total} respostas foram lidas. Informe o gabarito correto logo abaixo para calcular acertos e nota.`;

  renderQuestionList({ preserveScroll: preserveListScroll });
  renderOverlay();
  if (!els.reviewSheet.hidden && state.selectedQuestion) {
    renderReviewSheetContent(state.selectedQuestion);
  }
}

function openReviewSheet(questionNumber, { focusViewer = true } = {}) {
  if (!state.scored) return;
  const q = state.scored.questions.find((item) => item.question === Number(questionNumber));
  if (!q) return;

  state.selectedQuestion = q.question;
  renderQuestionList({ preserveScroll: true });
  renderOverlay();

  if (focusViewer) {
    const bounds = overlay.questionBounds(q, 2.8);
    if (bounds) viewer.focusRect(bounds, 120);
  }
  renderReviewSheetContent(q.question);
  els.reviewSheet.hidden = false;
  document.body.style.overflow = 'hidden';
}

function renderReviewSheetContent(questionNumber) {
  const q = state.scored.questions.find((item) => item.question === Number(questionNumber));
  if (!q) return;

  const pts = `${formatPts(q.pointsAwarded)} / ${formatPts(q.pointsPossible)} pt`;
  const reasonNote = q.reasons?.length ? ` · ${q.reasons[0]}` : '';
  els.reviewSheetMeta.textContent = `${STATUS_LABELS[q.status]} · ${pts} · ${Math.round(q.answerConfidence * 100)}% de confiança${reasonNote}`;
  els.reviewSheetTitle.textContent = `Questão ${q.question}`;

  const maxFill = Math.max(0, ...q.bubbles.map((b) => b.fillScore || 0));
  const labels = state.result?.optionLabels || getOptionLabels(readConfig().optionScheme, readConfig().optionCount);

  els.bubbleEvidence.style.gridTemplateColumns = `repeat(${Math.max(2, q.bubbles.length || labels.length)}, 1fr)`;
  els.bubbleEvidence.replaceChildren(
    ...q.bubbles.map((b) => {
      const card = document.createElement('div');
      card.className = `evidence-item${b.fillScore === maxFill && maxFill > 0 ? ' is-strongest' : ''}`;
      card.style.setProperty('--evidence', `${Math.round((b.fillScore || 0) * 100)}%`);
      card.innerHTML = `<b>${b.option}</b><span>${(b.fillScore || 0).toFixed(2)}</span><i></i>`;
      card.title = `Tinta: ${(b.fillScore || 0).toFixed(3)} · excesso: ${(b.excessInk || 0).toFixed(3)} · confiança: ${(b.fillConfidence || 0).toFixed(3)}`;
      return card;
    })
  );

  const current = q.finalAnswer;
  const optionButtons = labels.map((lbl) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `manual-option${q.manuallyReviewed && current === lbl ? ' is-selected' : ''}`;
    btn.dataset.manualAnswer = lbl;
    btn.textContent = lbl;
    return btn;
  });

  const blankBtn = document.createElement('button');
  blankBtn.type = 'button';
  blankBtn.className = `manual-option is-blank${q.manuallyReviewed && current == null ? ' is-selected' : ''}`;
  blankBtn.dataset.manualAnswer = 'blank';
  blankBtn.textContent = 'Em branco';

  els.manualOptions.style.gridTemplateColumns = `repeat(${Math.min(7, labels.length + 1)}, 1fr)`;
  els.manualOptions.replaceChildren(...optionButtons, blankBtn);
  els.clearOverrideButton.hidden = !q.manuallyReviewed;
}

function closeReviewSheet() {
  els.reviewSheet.hidden = true;
  document.body.style.overflow = '';
}

function setManualAnswer(value) {
  const q = state.result?.questions.find((item) => item.question === state.selectedQuestion);
  if (!q) return;
  q.manualAnswer = value === 'blank' ? null : value;
  recomputeAndRender({ preserveListScroll: true });
}

function clearManualAnswer() {
  const q = state.result?.questions.find((item) => item.question === state.selectedQuestion);
  if (!q) return;
  q.manualAnswer = undefined;
  recomputeAndRender({ preserveListScroll: true });
}

function syncDebugOptions() {
  state.debug.debug = els.debugToggle.checked;
  els.debugOptions.classList.toggle('is-enabled', state.debug.debug);
  els.debugOptions.setAttribute('aria-disabled', String(!state.debug.debug));
  els.debugInputs.forEach((input) => {
    state.debug[input.dataset.debug] = input.checked;
  });
  renderOverlay();
}

function buildAuditPayload() {
  const res = state.result;
  const scored = state.scored;
  return {
    schemaVersion: 3,
    createdAt: res.createdAt,
    mode: res.mode,
    orientation: res.orientation,
    optionScheme: res.optionScheme,
    optionLabels: res.optionLabels,
    markStyle: res.markStyle,
    shapeKind: res.shapeKind,
    optionCount: res.optionCount,
    requestedOptionCount: res.requestedOptionCount,
    success: res.success,
    sheetConfidence: round(res.sheetConfidence),
    pageConfidence: round(res.pageConfidence),
    answerKeyValidation: {
      valid: state.answerKeyErrors.length === 0,
      errors: state.answerKeyErrors,
      warnings: state.answerKeyWarnings,
      validAnswers: state.answerKey.filter((a) => a != null && a !== OMR_ANNULLED).length,
      annulledQuestions: state.answerKey.reduce((acc, a, i) => (a === OMR_ANNULLED && acc.push(i + 1), acc), [])
    },
    scanQuality: {
      overall: round(res.quality.overall),
      components: Object.fromEntries(Object.entries(res.quality.components).map(([k, v]) => [k, round(v)])),
      diagnostics: res.quality.diagnostics,
      issues: res.quality.issues
    },
    geometry: {
      confidence: round(res.structure.confidence),
      bubbleDiameter: round(res.structure.bubbleDiameter, 2),
      optionGap: round(res.structure.optionGap ?? res.structure.horizontalGap, 2),
      diagnostics: res.structure.diagnostics
    },
    calibration: res.calibration,
    summary: scored.summary,
    questions: scored.questions.map((q) => ({
      question: q.question,
      detectedAnswer: q.detectedAnswer,
      ...(q.manualAnswer === undefined ? {} : { manualAnswer: q.manualAnswer }),
      finalAnswer: q.finalAnswer,
      correctAnswer: q.correctAnswer === OMR_ANNULLED ? '--' : q.correctAnswer,
      status: q.status,
      markType: q.markType || null,
      pointsPossible: q.pointsPossible,
      pointsAwarded: q.pointsAwarded,
      classification: q.classification,
      answerConfidence: round(q.answerConfidence),
      rowConfidence: round(q.rowConfidence || 0),
      source: q.source,
      reasons: q.reasons,
      bubbles: Object.fromEntries(
        q.bubbles.map((b) => [
          b.option,
          {
            center: [round(b.centerX, 2), round(b.centerY, 2)],
            radius: [round(b.radiusX, 2), round(b.radiusY, 2)],
            inferred: b.inferred,
            contourDetected: b.contourDetected,
            fill: round(b.fillScore || 0),
            confidence: round(b.fillConfidence || 0),
            rawInkScore: round(b.rawInkScore || 0),
            slotBaseline: round(b.slotBaseline || 0),
            markType: b.markType || null
          }
        ])
      )
    }))
  };
}

function exportTxt() {
  if (!state.result || !state.scored) return;
  const student = $('#resultStudentName')?.value?.trim() || $('#studentName')?.value?.trim() || '';
  const subject = $('#resultSubjectName')?.value?.trim() || $('#subjectName')?.value?.trim() || '';
  const txt = formatSingleScanTxt(state.result, state.scored, { student, subject });
  downloadTextFile(`leitura-omr-${new Date().toISOString().slice(0, 10)}.txt`, txt);
  showToast('Relatório de leitura exportado em .TXT.');
}

function exportJson() {
  if (!state.result) return;
  const blob = new Blob([JSON.stringify(buildAuditPayload(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leitura-omr-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Dados de auditoria exportados em JSON.');
}

function saveLayoutAsTemplate() {
  if (!state.result) return;
  try {
    const cfg = readConfig();
    templateStore.save(
      state.result.structure,
      state.result.rectified.width,
      state.result.rectified.height,
      state.result.optionCount || cfg.optionCount,
      {
        optionScheme: state.result.optionScheme || cfg.optionScheme,
        orientation: state.result.orientation || cfg.orientation,
        shapeKind: state.result.shapeKind || 'bubble'
      }
    );
    refreshTemplateOption();
    showToast('Layout salvo. Nas próximas folhas iguais, use o modo “Modelo salvo”.');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function resetToUpload() {
  closeReviewSheet();
  state.image = null;
  state.documentDetection = null;
  state.cropManuallyAdjusted = false;
  state.result = null;
  state.scored = null;
  state.answerKey = [];
  state.answerKeyErrors = [];
  state.answerKeyWarnings = [];
  state.answerKeyOrigin = els.answerKeyInput.value.trim() ? state.answerKeyOrigin : 'empty';
  state.selectedQuestion = null;
  state.currentLayer = 'rectified';
  els.newScanButton.hidden = true;
  els.uncertainOnlyToggle.checked = false;
  goToScreen('upload');
}

function openCameraPicker() {
  if (state.busy) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.setAttribute('capture', 'environment');
  input.setAttribute('aria-hidden', 'true');
  Object.assign(input.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '1px',
    height: '1px',
    opacity: '0',
    pointerEvents: 'none'
  });
  document.body.append(input);

  let cleaned = false;
  const cleanup = () => {
    if (!cleaned) {
      cleaned = true;
      input.remove();
    }
  };
  input.addEventListener(
    'change',
    () => {
      const file = input.files?.[0];
      cleanup();
      if (file) handleImageFile(file);
    },
    { once: true }
  );
  input.addEventListener('cancel', cleanup, { once: true });
  window.setTimeout(cleanup, 120000);

  try {
    typeof input.showPicker === 'function' ? input.showPicker() : input.click();
  } catch {
    try {
      input.click();
    } catch {
      cleanup();
      showToast('Não foi possível abrir a câmera neste navegador. Use “Escolher foto”.', 'error', 6500);
    }
  }
}

async function runDemoPreset(presetId) {
  if (state.busy) return;
  setBusy(true);
  try {
    const engine = await ensureEngine();
    const demo = generateDemoPhoto(engine.cv, presetId);

    if (els.optionScheme) els.optionScheme.value = demo.optionScheme;
    syncOptionCountControl();
    els.questionCount.value = String(demo.questionCount);
    if (!els.optionCount.disabled) els.optionCount.value = String(demo.optionCount);
    if (els.orientation) els.orientation.value = demo.orientation;
    if (els.markStyle) els.markStyle.value = demo.markStyle;
    syncOrientationControl();

    updatePointsPreview();
    els.answerKeyInput.value = demo.answerKeyText;
    state.answerKeyOrigin = 'demo';
    validateSetupAnswerKey();
    persistSetup();

    await openCropStage(ImageLoader.fromCanvas(demo.canvas, { name: `demo-${demo.presetId}` }));
    demo.canvas.width = 1;
    demo.canvas.height = 1;
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBusy(false);
  }
}

async function downloadDemoImage(presetId) {
  if (state.busy) return;
  setBusy(true);
  try {
    const engine = await ensureEngine();
    const demo = generateDemoPhoto(engine.cv, presetId);
    const dataUrl = ImageLoader.toDataUrl(demo.canvas, 'image/jpeg', 0.92);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `teste-omr-${demo.presetId}.jpg`;
    a.click();
    demo.canvas.width = 1;
    demo.canvas.height = 1;
    showToast(`Imagem de teste “${demo.presetId}.jpg” baixada.`);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setBusy(false);
  }
}

function closeSuiteModal() {
  if (!els.suiteModal) return;
  els.suiteModal.hidden = true;
  document.body.style.overflow = '';
}

async function renderSuiteRecognitionJpeg(result, scored, meta, { includeScores = false } = {}) {
  const rect = result.rectified.canvas;
  const maxDim = 1500;
  const scale = Math.min(1, maxDim / Math.max(rect.width, rect.height));
  const imgW = Math.max(1, Math.round(rect.width * scale));
  const imgH = Math.max(1, Math.round(rect.height * scale));
  const bannerH = 54;

  // Render overlay at full rectified resolution so stroke widths and coordinates stay exact
  const overlayCanvas = document.createElement('canvas');
  const tempOverlay = new ResultOverlay(overlayCanvas);
  tempOverlay.setSize(rect.width, rect.height);
  tempOverlay.render(scored.questions, result.structure, {
    debug: true,
    rows: true,
    bubbles: true,
    centers: true,
    scores: includeScores,
    inferred: true,
    selectedQuestion: null
  });

  const out = document.createElement('canvas');
  out.width = imgW;
  out.height = imgH + bannerH;
  const ctx = out.getContext('2d', { alpha: false });

  // Top summary banner
  ctx.fillStyle = '#0e131b';
  ctx.fillRect(0, 0, imgW, bannerH);
  ctx.fillStyle = '#242c38';
  ctx.fillRect(0, bannerH - 1, imgW, 1);

  const pct = meta.totalQuestions ? Math.round((meta.expectedMatches / meta.totalQuestions) * 100) : 0;
  const accent = pct === 100 ? '#37e589' : pct >= 80 ? '#ffbf47' : '#ff5f65';
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 5, bannerH);

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5f6f2';
  ctx.font = '700 15px Manrope, Arial, sans-serif';
  ctx.fillText(`[${meta.indexLabel}] ${meta.presetId} · ${meta.conditionShort}${includeScores ? ' (SCORES)' : ''}`, 16, 20);

  ctx.fillStyle = '#98a1ad';
  ctx.font = '500 12px DM Mono, monospace';
  ctx.fillText(
    `Detector: ${meta.detector} · Cobertura: ${Math.round(meta.bubbleCoverage * 100)}% · Blocos: ${meta.blockCount} · Qualidade: ${Math.round(meta.qualityOverall * 100)}%`,
    16,
    39
  );

  ctx.textAlign = 'right';
  ctx.fillStyle = accent;
  ctx.font = '700 16px DM Mono, monospace';
  ctx.fillText(`${meta.expectedMatches}/${meta.totalQuestions} (${pct}%)`, imgW - 16, 28);

  // Composite rectified sheet + recognition overlay below the top summary banner
  ctx.drawImage(rect, 0, bannerH, imgW, imgH);
  ctx.drawImage(overlayCanvas, 0, bannerH, imgW, imgH);

  const blob = await new Promise((resolve) => out.toBlob(resolve, 'image/jpeg', 0.86));
  const bytes = blob ? new Uint8Array(await blob.arrayBuffer()) : new Uint8Array(0);

  overlayCanvas.width = 1;
  overlayCanvas.height = 1;
  out.width = 1;
  out.height = 1;
  return bytes;
}

async function runFullBenchmarkSuite() {
  if (state.busy || !els.suiteModal) return;
  setBusy(true);
  els.suiteModal.hidden = false;
  document.body.style.overflow = 'hidden';
  els.rerunSuiteButton.disabled = true;
  els.copySuiteTxtButton.disabled = true;
  els.downloadSuiteTxtButton.disabled = true;
  if (els.downloadSuiteZipButton) els.downloadSuiteZipButton.disabled = true;
  state.lastSuiteZipBlob = null;
  els.suiteProgress.style.width = '2%';
  els.suiteReportOutput.textContent = 'Inicializando OpenCV.js e preparando 22 imagens de teste…';

  const startedAt = Date.now();
  const entries = [];
  const zipFiles = [];

  try {
    const engine = await ensureEngine();

    for (let i = 0; i < DEMO_PRESETS.length; i += 1) {
      const preset = DEMO_PRESETS[i];
      const indexLabel = String(i + 1).padStart(2, '0');
      const pct = Math.round(((i + 0.2) / DEMO_PRESETS.length) * 100);
      els.suiteProgress.style.width = `${pct}%`;
      els.suiteStatus.textContent = `Executando ${i + 1} / ${DEMO_PRESETS.length} · ${preset.label}`;
      await new Promise((r) => requestAnimationFrame(() => window.setTimeout(r, 0)));

      const t0 = performance.now();
      let demo = null;
      try {
        demo = generateDemoPhoto(engine.cv, preset.id);
        const doc = engine.detectDocument(demo.canvas);
        const result = await engine.recognize(demo.canvas, doc.points, {
          expectedQuestions: demo.questionCount,
          optionCount: demo.optionCount,
          optionScheme: demo.optionScheme,
          orientation: demo.orientation,
          markStyle: demo.markStyle,
          readingOrder: 'columns',
          mode: 'auto',
          documentConfidence: doc.confidence
        });
        const scored = scorer.score(result.questions, demo.answers, { maxGrade: 10 });
        const durationMs = Math.round(performance.now() - t0);

        let expectedMatches = 0;
        const mismatches = [];
        for (const q of scored.questions) {
          const special = demo.expectedSpecial?.[q.question];
          const ok = special ? q.status === special : q.status === 'correct';
          if (ok) {
            expectedMatches += 1;
          } else {
            mismatches.push({
              question: q.question,
              expected: special ? `[${special}]` : demo.answers[q.question - 1],
              detected: q.detectedAnswer,
              status: q.status,
              confidence: q.answerConfidence || 0,
              scores: (q.bubbles || []).map((b) => `${b.option}:${(b.fillScore || 0).toFixed(2)}`).join(' ')
            });
          }
        }

        const diag = result.structure.diagnostics;
        const entry = {
          indexLabel,
          presetId: preset.id,
          presetLabel: preset.label,
          condition: preset.condition,
          conditionShort: CAPTURE_CONDITIONS[preset.condition]?.short || preset.condition,
          conditionLabel: CAPTURE_CONDITIONS[preset.condition]?.label || preset.condition,
          totalQuestions: demo.questionCount,
          expectedMatches,
          correct: scored.summary.correct,
          incorrect: scored.summary.incorrect,
          blank: scored.summary.blank,
          multiple: scored.summary.multiple,
          ambiguous: scored.summary.ambiguous,
          bubbleCoverage: diag.bubbleCoverage || 0,
          blockCount: diag.blockCount || 0,
          detector: diag.winningPool || diag.detectorPool || 'none',
          qualityOverall: result.quality?.overall || 0,
          docConfidence: doc.confidence || 0,
          durationMs,
          mismatches
        };
        entries.push(entry);

        // Render annotated recognition image (bolhas, grade, centros e status) for the ZIP archive
        const recJpeg = await renderSuiteRecognitionJpeg(result, scored, entry, { includeScores: false });
        if (recJpeg.length) {
          zipFiles.push({ name: `imagens/${indexLabel}-${preset.id}-reconhecimento.jpg`, data: recJpeg });
        }

        // For any scenario with mismatches/revisar, also add a detailed debug image with fillScores!
        if (mismatches.length > 0) {
          const debugJpeg = await renderSuiteRecognitionJpeg(result, scored, entry, { includeScores: true });
          if (debugJpeg.length) {
            zipFiles.push({ name: `debug/${indexLabel}-${preset.id}-scores.jpg`, data: debugJpeg });
          }
        }

        result.rectified.canvas.width = 1;
        result.rectified.canvas.height = 1;
      } catch (err) {
        entries.push({
          indexLabel,
          presetId: preset.id,
          presetLabel: preset.label,
          condition: preset.condition,
          conditionShort: CAPTURE_CONDITIONS[preset.condition]?.short || preset.condition,
          conditionLabel: CAPTURE_CONDITIONS[preset.condition]?.label || preset.condition,
          totalQuestions: demo?.questionCount || 0,
          expectedMatches: 0,
          correct: 0,
          incorrect: 0,
          blank: 0,
          multiple: 0,
          ambiguous: 0,
          bubbleCoverage: 0,
          blockCount: 0,
          detector: 'erro',
          qualityOverall: 0,
          docConfidence: 0,
          durationMs: Math.round(performance.now() - t0),
          mismatches: [],
          error: err.message
        });
      } finally {
        if (demo?.canvas) {
          demo.canvas.width = 1;
          demo.canvas.height = 1;
        }
      }

      const runningTxt = formatBenchmarkSuiteTxt(entries, { startedAt, finishedAt: Date.now() });
      els.suiteReportOutput.textContent = runningTxt;
    }

    const finalTxt = formatBenchmarkSuiteTxt(entries, { startedAt, finishedAt: Date.now() });
    state.lastSuiteTxt = finalTxt;
    zipFiles.unshift({ name: 'relatorio-bateria-omr.txt', data: finalTxt });
    state.lastSuiteZipBlob = buildZipBlob(zipFiles);

    els.suiteReportOutput.textContent = finalTxt;
    els.suiteProgress.style.width = '100%';

    const totalQ = entries.reduce((a, e) => a + e.totalQuestions, 0);
    const totalOk = entries.reduce((a, e) => a + e.expectedMatches, 0);
    const pct = totalQ ? ((totalOk / totalQ) * 100).toFixed(1) : '0.0';
    const zipMb = (state.lastSuiteZipBlob.size / (1024 * 1024)).toFixed(1);
    els.suiteStatus.textContent = `Bateria concluída · ${totalOk}/${totalQ} questões (${pct}%) · ZIP pronto (${zipFiles.length} arquivos, ${zipMb} MB).`;
    els.rerunSuiteButton.disabled = false;
    els.copySuiteTxtButton.disabled = false;
    els.downloadSuiteTxtButton.disabled = false;
    if (els.downloadSuiteZipButton) els.downloadSuiteZipButton.disabled = false;
  } catch (err) {
    els.suiteStatus.textContent = `Falha ao executar bateria: ${err.message}`;
    els.rerunSuiteButton.disabled = false;
  } finally {
    setBusy(false);
  }
}

function bindEvents() {
  els.chooseFileButton.addEventListener('click', () => els.fileInput.click());
  els.cameraButton.addEventListener('click', openCameraPicker);
  els.fileInput.addEventListener('change', () => handleImageFile(els.fileInput.files?.[0]));
  els.cameraInput.addEventListener('change', () => handleImageFile(els.cameraInput.files?.[0]));

  ['dragenter', 'dragover'].forEach((ev) => {
    els.dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      els.dropZone.classList.add('is-dragging');
    });
  });
  ['dragleave', 'drop'].forEach((ev) => {
    els.dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      els.dropZone.classList.remove('is-dragging');
    });
  });
  els.dropZone.addEventListener('drop', (e) => handleImageFile(e.dataTransfer?.files?.[0]));

  els.demoButton.addEventListener('click', () => runDemoPreset(els.demoPreset?.value || 'enem-vertical'));
  els.runSuiteButton?.addEventListener('click', runFullBenchmarkSuite);
  els.downloadDemoImageButton?.addEventListener('click', () => downloadDemoImage(els.demoPreset?.value || 'enem-vertical'));
  els.suiteBackdrop?.addEventListener('click', closeSuiteModal);
  els.closeSuiteButton?.addEventListener('click', closeSuiteModal);
  els.rerunSuiteButton?.addEventListener('click', runFullBenchmarkSuite);
  els.downloadSuiteTxtButton?.addEventListener('click', () => {
    if (!state.lastSuiteTxt) return;
    downloadTextFile(`bateria-testes-omr-${new Date().toISOString().slice(0, 10)}.txt`, state.lastSuiteTxt);
    showToast('Relatório da bateria exportado em .TXT.');
  });
  els.downloadSuiteZipButton?.addEventListener('click', () => {
    if (!state.lastSuiteZipBlob) return;
    downloadBlob(`bateria-testes-omr-${new Date().toISOString().slice(0, 10)}.zip`, state.lastSuiteZipBlob);
    showToast('Arquivo .ZIP (.TXT + imagens de reconhecimento) baixado.');
  });
  els.copySuiteTxtButton?.addEventListener('click', async () => {
    if (!state.lastSuiteTxt) return;
    try {
      await navigator.clipboard.writeText(state.lastSuiteTxt);
      showToast('Relatório .TXT copiado para a área de transferência.');
    } catch {
      showToast('Não foi possível copiar automaticamente. Use “Baixar relatório .TXT”.', 'warning');
    }
  });

  els.rotateLeftButton.addEventListener('click', () => rotateCropImage('counterclockwise'));
  els.rotateRightButton.addEventListener('click', () => rotateCropImage('clockwise'));
  els.redetectButton.addEventListener('click', redetectDocument);
  els.resetCornersButton.addEventListener('click', () => cropEditor.reset());
  els.confirmCropButton.addEventListener('click', runRecognition);
  els.backToUploadButton.addEventListener('click', resetToUpload);
  els.newScanButton.addEventListener('click', resetToUpload);

  els.optionScheme?.addEventListener('change', () => {
    syncOptionCountControl();
    updatePointsPreview();
    validateSetupAnswerKey();
    persistSetup();
  });

  els.orientation?.addEventListener('change', () => {
    syncOrientationControl();
    persistSetup();
  });

  [els.questionCount, els.optionCount, els.markStyle, els.maxGrade, els.readingOrder, els.recognitionMode].forEach(
    (el) => {
      el?.addEventListener('change', () => {
        updatePointsPreview();
        validateSetupAnswerKey();
        persistSetup();
      });
    }
  );
  [els.questionCount, els.maxGrade].forEach((el) => el?.addEventListener('input', updatePointsPreview));

  els.answerKeyInput.addEventListener('input', () => {
    state.answerKeyOrigin = els.answerKeyInput.value.trim() ? 'user' : 'empty';
    validateSetupAnswerKey();
    persistSetup();
  });

  els.useDetectedAsKeyButton.addEventListener('click', useSheetAsMasterKey);
  els.applyResultKeyButton.addEventListener('click', applyResultKeyEditor);

  els.layerButtons.forEach((btn) => btn.addEventListener('click', () => switchViewerLayer(btn.dataset.viewLayer)));
  els.zoomOutButton.addEventListener('click', () => viewer.zoomOut());
  els.zoomInButton.addEventListener('click', () => viewer.zoomIn());
  els.zoomFitButton.addEventListener('click', () => viewer.fit());
  els.zoom100Button.addEventListener('click', () => viewer.reset100());

  els.questionList.addEventListener('click', (e) => {
    const item = e.target.closest('[data-question]');
    if (item) openReviewSheet(Number(item.dataset.question));
  });
  els.uncertainOnlyToggle.addEventListener('change', () => renderQuestionList());

  els.reviewBackdrop.addEventListener('click', closeReviewSheet);
  els.closeReviewButton.addEventListener('click', closeReviewSheet);
  els.manualOptions.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-manual-answer]');
    if (btn) setManualAnswer(btn.dataset.manualAnswer);
  });
  els.clearOverrideButton.addEventListener('click', clearManualAnswer);

  els.debugToggle.addEventListener('change', syncDebugOptions);
  els.debugInputs.forEach((input) => input.addEventListener('change', syncDebugOptions));

  els.saveTemplateButton.addEventListener('click', saveLayoutAsTemplate);
  els.exportTxtButton?.addEventListener('click', exportTxt);
  els.exportJsonButton.addEventListener('click', exportJson);
  els.finishButton.addEventListener('click', () => {
    const pending = state.scored.summary.ambiguous + state.scored.summary.multiple;
    showToast(
      pending
        ? `Ainda existem ${pending} questão(ões) sem revisão definitiva.`
        : 'Revisão finalizada. A nota está atualizada.'
    );
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.reviewSheet.hidden) closeReviewSheet();
    else if (e.key === 'Escape' && els.suiteModal && !els.suiteModal.hidden) closeSuiteModal();
  });
}

// Expose a lightweight test/debug hook for automated verification
window.__OMR_APP__ = {
  ensureEngine,
  generateDemoPhoto,
  DEMO_PRESETS,
  getState: () => state,
  runDemoPreset,
  runFullBenchmarkSuite
};

async function init() {
  populateDemoPresets();
  restoreSetup();
  updatePointsPreview();
  refreshTemplateOption();
  validateSetupAnswerKey();
  bindEvents();
  try {
    await ensureEngine();
  } catch (err) {
    showToast(err.message, 'error', 9000);
  }
}

init();
