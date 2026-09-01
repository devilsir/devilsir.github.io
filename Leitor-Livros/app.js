const $ = (s) => document.querySelector(s);

const OFFLINE_DEPS = [
  "./vendor/tesseract.min.js",
  "./vendor/worker.min.js",
  "./vendor/core/tesseract-core.wasm.js",
  "./vendor/core/tesseract-core-simd.wasm.js",
  "./vendor/core/tesseract-core-lstm.wasm.js",
  "./vendor/core/tesseract-core-simd-lstm.wasm.js",
  "./vendor/lang/por.traineddata.gz",
  "./vendor/lang/eng.traineddata.gz"
];

let installPrompt = null;
let ocrEngineReady = false;
let currentImageFile = null;
let currentImageUrl = "";
let ocrWorker = null;
let ocrWorkerLanguage = "";

let voices = [];
let visibleVoices = [];
let speechChunks = [];
let speechIndex = 0;
let speechToken = 0;
let stopped = false;

const installBtn = $("#installBtn");
const offlineSetup = $("#offlineSetup");
const offlineTitle = $("#offlineTitle");
const offlineDetail = $("#offlineDetail");
const offlineBadge = $("#offlineBadge");
const setupBar = $("#setupBar");
const setupHint = $("#setupHint");

const imageInput = $("#imageInput");
const previewLayout = $("#previewLayout");
const preview = $("#preview");
const ocrBtn = $("#ocrBtn");
const clearImageBtn = $("#clearImageBtn");
const ocrLanguage = $("#ocrLanguage");
const grayscaleImage = $("#grayscaleImage");
const enhanceImage = $("#enhanceImage");
const processingCanvas = $("#processingCanvas");
const ocrProgressWrap = $("#ocrProgressWrap");
const ocrProgressBar = $("#ocrProgressBar");
const ocrProgressText = $("#ocrProgressText");
const ocrStatus = $("#ocrStatus");

const textArea = $("#text");
const copyBtn = $("#copyBtn");
const clearTextBtn = $("#clearTextBtn");
const wordCount = $("#wordCount");
const charCount = $("#charCount");

const offlineVoicesOnly = $("#offlineVoicesOnly");
const voiceLanguage = $("#voiceLanguage");
const voiceSelect = $("#voiceSelect");
const voiceCount = $("#voiceCount");
const voiceInfo = $("#voiceInfo");
const testVoiceBtn = $("#testVoiceBtn");
const rate = $("#rate");
const volume = $("#volume");
const pitch = $("#pitch");
const rateValue = $("#rateValue");
const volumeValue = $("#volumeValue");
const pitchValue = $("#pitchValue");
const playBtn = $("#playBtn");
const pauseBtn = $("#pauseBtn");
const resumeBtn = $("#resumeBtn");
const restartBtn = $("#restartBtn");
const stopBtn = $("#stopBtn");
const readingBar = $("#readingBar");
const readingText = $("#readingText");

function absolute(path) {
  return new URL(path, window.location.href).href;
}

function setOfflineUI(state, title, detail, progress = null) {
  offlineSetup.classList.remove("ready", "error");
  offlineBadge.className = "badge loading";

  if (state === "ready") {
    offlineSetup.classList.add("ready");
    offlineBadge.className = "badge ready";
    offlineBadge.textContent = "Offline pronto";
    setupBar.style.width = "100%";
    setupHint.textContent = "Pode desligar Wi‑Fi/4G. OCR, interface e idiomas já estão guardados neste aparelho.";
  } else if (state === "error") {
    offlineSetup.classList.add("error");
    offlineBadge.className = "badge";
    offlineBadge.textContent = "Falhou";
    setupHint.textContent = "Confira a conexão e recarregue a página para tentar novamente.";
  } else {
    offlineBadge.textContent = "Preparando";
    if (typeof progress === "number") setupBar.style.width = `${Math.max(4, Math.min(100, progress))}%`;
  }

  offlineTitle.textContent = title;
  offlineDetail.textContent = detail;
}

async function registerOffline() {
  if (!("serviceWorker" in navigator)) {
    setOfflineUI("error", "Este navegador não suporta PWA offline.", "Você ainda pode usar o leitor enquanto estiver online.");
    return;
  }

  try {
    navigator.serviceWorker.addEventListener("message", (event) => {
      const data = event.data || {};
      if (data.type === "OFFLINE_PROGRESS") {
        setOfflineUI("loading", "Baixando motor OCR…", data.label || "Preparando componentes.", data.progress || 5);
      }
      if (data.type === "OFFLINE_READY") {
        setOfflineUI("ready", "Tudo salvo no aparelho.", "O leitor agora está preparado para funcionar sem internet.");
      }
    });

    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;

    // Allow the active SW a brief moment to claim this first-load page.
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 1800);
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    }

    try { await navigator.storage?.persist?.(); } catch {}

    await verifyOfflineFiles();
    await loadOcrEngine();
  } catch (err) {
    console.error("PWA setup:", err);
    setOfflineUI("error", "Não consegui preparar o modo offline.", "Recarregue a página com internet para baixar novamente os componentes.");
    await loadOcrEngineOnlineFallback();
  }
}

async function verifyOfflineFiles() {
  let done = 0;
  for (const path of OFFLINE_DEPS) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Recurso offline ausente: ${path}`);
    done++;
    const pct = Math.round((done / OFFLINE_DEPS.length) * 100);
    setOfflineUI("loading", "Validando arquivos offline…", `${done} de ${OFFLINE_DEPS.length} componentes prontos.`, pct);
  }
  setOfflineUI("ready", "Tudo salvo no aparelho.", "O leitor agora está preparado para funcionar sem internet.");
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    document.head.appendChild(script);
  });
}

async function loadOcrEngine() {
  try {
    await loadScript("./vendor/tesseract.min.js");
    ocrEngineReady = Boolean(window.Tesseract);
    updateOcrButton();
  } catch (err) {
    console.error(err);
    await loadOcrEngineOnlineFallback();
  }
}

async function loadOcrEngineOnlineFallback() {
  if (!navigator.onLine) {
    ocrEngineReady = false;
    updateOcrButton();
    return;
  }
  try {
    await loadScript("https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js");
    ocrEngineReady = Boolean(window.Tesseract);
    updateOcrButton();
  } catch {
    ocrEngineReady = false;
    updateOcrButton();
  }
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener("click", async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  installBtn.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
});

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem("bookReaderSettings") || "{}");
    if (s.ocrLanguage) ocrLanguage.value = s.ocrLanguage;
    if (typeof s.gray === "boolean") grayscaleImage.checked = s.gray;
    if (typeof s.contrast === "boolean") enhanceImage.checked = s.contrast;
    if (typeof s.offlineVoice === "boolean") offlineVoicesOnly.checked = s.offlineVoice;
    if (s.voiceLanguage) voiceLanguage.value = s.voiceLanguage;
    if (s.rate) rate.value = s.rate;
    if (s.volume) volume.value = s.volume;
    if (s.pitch) pitch.value = s.pitch;
    if (s.text) textArea.value = s.text;
    return s.voiceURI || "";
  } catch {
    return "";
  }
}

const savedVoiceURI = loadSettings();

function saveSettings() {
  localStorage.setItem("bookReaderSettings", JSON.stringify({
    ocrLanguage: ocrLanguage.value,
    gray: grayscaleImage.checked,
    contrast: enhanceImage.checked,
    offlineVoice: offlineVoicesOnly.checked,
    voiceLanguage: voiceLanguage.value,
    voiceURI: voiceSelect.value,
    rate: rate.value,
    volume: volume.value,
    pitch: pitch.value,
    text: textArea.value
  }));
}

function updateTextStats() {
  const trimmed = textArea.value.trim();
  wordCount.textContent = `${trimmed ? trimmed.split(/\s+/).length : 0} palavras`;
  charCount.textContent = `${textArea.value.length} caracteres`;
}

function updateSliders() {
  rateValue.textContent = `${Number(rate.value).toFixed(1)}x`;
  volumeValue.textContent = `${Math.round(Number(volume.value) * 100)}%`;
  pitchValue.textContent = Number(pitch.value).toFixed(1);
}

textArea.addEventListener("input", () => {
  updateTextStats();
  saveSettings();
});

copyBtn.addEventListener("click", async () => {
  if (!textArea.value) return;
  try {
    await navigator.clipboard.writeText(textArea.value);
  } catch {
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
  }
});

clearTextBtn.addEventListener("click", () => {
  stopReading();
  textArea.value = "";
  updateTextStats();
  saveSettings();
});

[rate, volume, pitch].forEach(el => el.addEventListener("input", () => {
  updateSliders();
  saveSettings();
}));

[ocrLanguage, grayscaleImage, enhanceImage].forEach(el => el.addEventListener("change", saveSettings));

function updateOcrButton() {
  ocrBtn.disabled = !(currentImageFile && ocrEngineReady);
  if (currentImageFile && !ocrEngineReady) ocrStatus.textContent = "Aguardando o motor OCR terminar de instalar.";
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;

  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
  currentImageFile = file;
  currentImageUrl = URL.createObjectURL(file);
  preview.src = currentImageUrl;
  previewLayout.hidden = false;
  ocrStatus.textContent = "Página carregada. Toque em “Reconhecer texto”.";
  updateOcrButton();
});

clearImageBtn.addEventListener("click", () => {
  currentImageFile = null;
  imageInput.value = "";
  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
  currentImageUrl = "";
  preview.src = "";
  previewLayout.hidden = true;
  ocrProgressWrap.hidden = true;
  ocrProgressBar.style.width = "0%";
  ocrProgressText.textContent = "0%";
  ocrStatus.textContent = "Aguardando uma página.";
  updateOcrButton();
});

async function preprocess(file) {
  if (!grayscaleImage.checked && !enhanceImage.checked) return file;

  const bitmap = await createImageBitmap(file);
  const maxDimension = 2300;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  processingCanvas.width = w;
  processingCanvas.height = h;
  const ctx = processingCanvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, w, h);

  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  let min = 255, max = 0;

  if (enhanceImage.checked) {
    for (let i = 0; i < d.length; i += 4) {
      const y = .299*d[i] + .587*d[i+1] + .114*d[i+2];
      if (y < min) min = y;
      if (y > max) max = y;
    }
  }

  const range = Math.max(42, max - min);

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i+1], b = d[i+2];
    if (grayscaleImage.checked) {
      const gray = .299*r + .587*g + .114*b;
      r = g = b = gray;
    }
    if (enhanceImage.checked) {
      r = Math.max(0, Math.min(255, ((r-min)*255)/range));
      g = Math.max(0, Math.min(255, ((g-min)*255)/range));
      b = Math.max(0, Math.min(255, ((b-min)*255)/range));
    }
    d[i] = r; d[i+1] = g; d[i+2] = b;
  }

  ctx.putImageData(img, 0, 0);
  return await new Promise(resolve => processingCanvas.toBlob(b => resolve(b || file), "image/jpeg", .94));
}

function handleOcrLog(m) {
  if (!m) return;
  const pct = typeof m.progress === "number" ? Math.round(m.progress * 100) : 0;
  const names = {
    "loading tesseract core": "Carregando OCR",
    "initializing tesseract": "Inicializando OCR",
    "loading language traineddata": "Carregando idioma",
    "initializing api": "Preparando leitura da página",
    "recognizing text": "Reconhecendo texto"
  };
  ocrStatus.textContent = names[m.status] || "Processando…";
  ocrProgressBar.style.width = `${pct}%`;
  ocrProgressText.textContent = `${pct}%`;
}

async function ensureWorker(language) {
  if (ocrWorker && ocrWorkerLanguage === language) return ocrWorker;
  if (ocrWorker) {
    try { await ocrWorker.terminate(); } catch {}
    ocrWorker = null;
  }

  const base = new URL("./", location.href);
  const workerPath = new URL("vendor/worker.min.js", base).href;
  const langPath = new URL("vendor/lang", base).href.replace(/\/$/, "");
  const corePath = new URL("vendor/core", base).href.replace(/\/$/, "");

  ocrWorkerLanguage = language;
  ocrWorker = await Tesseract.createWorker(language, 1, {
    workerPath,
    langPath,
    corePath,
    logger: handleOcrLog,
    errorHandler: err => console.error("Tesseract worker:", err)
  });

  try {
    await ocrWorker.setParameters({ preserve_interword_spaces: "1" });
  } catch {}
  return ocrWorker;
}

ocrBtn.addEventListener("click", async () => {
  if (!currentImageFile || !ocrEngineReady) return;

  ocrBtn.disabled = true;
  ocrProgressWrap.hidden = false;
  ocrProgressBar.style.width = "0%";
  ocrProgressText.textContent = "0%";

  try {
    ocrStatus.textContent = "Preparando imagem…";
    const prepared = await preprocess(currentImageFile);
    const worker = await ensureWorker(ocrLanguage.value);
    const result = await worker.recognize(prepared);
    textArea.value = (result.data.text || "").trim();
    updateTextStats();
    saveSettings();
    ocrProgressBar.style.width = "100%";
    ocrProgressText.textContent = "100%";
    ocrStatus.textContent = "Texto reconhecido.";
  } catch (err) {
    console.error(err);
    ocrStatus.textContent = "Não consegui reconhecer esta página.";
    alert("O OCR falhou. Se for a primeira abertura, confirme se apareceu “Offline pronto” e tente novamente.");
  } finally {
    updateOcrButton();
  }
});

// Speech synthesis
function voiceScore(v) {
  const lang = (v.lang || "").toLowerCase();
  let score = 0;
  if (v.localService) score += 100;
  if (voiceLanguage.value === "pt") {
    if (lang.startsWith("pt-br")) score += 80;
    else if (lang.startsWith("pt")) score += 60;
  }
  if (voiceLanguage.value === "en") {
    if (lang.startsWith("en-us")) score += 80;
    else if (lang.startsWith("en")) score += 60;
  }
  return score;
}

function refreshVoices() {
  voices = speechSynthesis.getVoices();

  const sorted = [...voices].sort((a,b) => {
    const diff = voiceScore(b) - voiceScore(a);
    return diff || `${a.lang} ${a.name}`.localeCompare(`${b.lang} ${b.name}`);
  });

  if (offlineVoicesOnly.checked) {
    const local = sorted.filter(v => v.localService);
    visibleVoices = local.length ? local : sorted;
  } else {
    visibleVoices = sorted;
  }

  const previous = voiceSelect.value || savedVoiceURI;
  voiceSelect.innerHTML = "";

  visibleVoices.forEach(v => {
    const op = document.createElement("option");
    op.value = v.voiceURI;
    op.textContent = `${v.name} — ${v.lang}${v.localService ? " · offline" : ""}`;
    voiceSelect.appendChild(op);
  });

  if (previous && visibleVoices.some(v => v.voiceURI === previous)) {
    voiceSelect.value = previous;
  } else {
    const pt = visibleVoices.find(v => (v.lang || "").toLowerCase().startsWith("pt-br"));
    if (pt) voiceSelect.value = pt.voiceURI;
  }

  voiceCount.textContent = `${visibleVoices.length} ${visibleVoices.length === 1 ? "voz" : "vozes"}`;
  updateVoiceInfo();
}

function selectedVoice() {
  return visibleVoices.find(v => v.voiceURI === voiceSelect.value) || visibleVoices[0] || null;
}

function updateVoiceInfo() {
  const v = selectedVoice();
  if (!v) {
    voiceInfo.textContent = "Nenhuma voz foi disponibilizada pelo navegador.";
    testVoiceBtn.disabled = true;
    return;
  }
  testVoiceBtn.disabled = false;
  voiceInfo.textContent = v.localService
    ? `${v.name} (${v.lang}) · o navegador informa que esta voz é local.`
    : `${v.name} (${v.lang}) · esta voz pode depender dos serviços de fala do aparelho.`;
}

speechSynthesis.onvoiceschanged = refreshVoices;
setTimeout(refreshVoices, 0);
setTimeout(refreshVoices, 350);
setTimeout(refreshVoices, 1200);

offlineVoicesOnly.addEventListener("change", () => { refreshVoices(); saveSettings(); });
voiceLanguage.addEventListener("change", () => { refreshVoices(); saveSettings(); });
voiceSelect.addEventListener("change", () => { updateVoiceInfo(); saveSettings(); });

function splitSpeech(text, max = 260) {
  const cleaned = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return [];
  const units = cleaned.match(/[^.!?…\n]+(?:[.!?…]+|(?=\n)|$)|\n+/g) || [cleaned];
  const chunks = [];
  let current = "";

  const flush = () => {
    const c = current.trim();
    if (c) chunks.push(c);
    current = "";
  };

  for (let unit of units) {
    unit = unit.trim();
    if (!unit) continue;
    if (unit.length <= max) {
      const candidate = current ? `${current} ${unit}` : unit;
      if (candidate.length <= max) current = candidate;
      else { flush(); current = unit; }
      continue;
    }
    flush();
    for (const word of unit.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > max && current) { flush(); current = word; }
      else current = candidate;
    }
    flush();
  }
  flush();
  return chunks;
}

function updateReadingProgress() {
  const pct = speechChunks.length ? Math.min(100, Math.round((speechIndex / speechChunks.length) * 100)) : 0;
  readingBar.style.width = `${pct}%`;
  readingText.textContent = `${pct}%`;
}

function speakChunk(token) {
  if (token !== speechToken || stopped) return;
  if (speechIndex >= speechChunks.length) {
    readingBar.style.width = "100%";
    readingText.textContent = "100%";
    return;
  }

  const v = selectedVoice();
  if (!v) return alert("Nenhuma voz disponível neste navegador.");

  const u = new SpeechSynthesisUtterance(speechChunks[speechIndex]);
  u.voice = v;
  u.lang = v.lang || "pt-BR";
  u.rate = Number(rate.value);
  u.volume = Number(volume.value);
  u.pitch = Number(pitch.value);

  u.onend = () => {
    if (token !== speechToken || stopped) return;
    speechIndex++;
    updateReadingProgress();
    setTimeout(() => speakChunk(token), 25);
  };
  u.onerror = (e) => {
    if (!["canceled","interrupted"].includes(e.error)) console.error("Speech:", e.error);
  };

  speechSynthesis.speak(u);
}

function startReading() {
  const text = textArea.value.trim();
  if (!text) return alert("Reconheça ou cole algum texto primeiro.");
  speechSynthesis.cancel();
  speechToken++;
  stopped = false;
  speechChunks = splitSpeech(text);
  speechIndex = 0;
  updateReadingProgress();
  speakChunk(speechToken);
}

function stopReading() {
  stopped = true;
  speechToken++;
  speechSynthesis.cancel();
  speechChunks = [];
  speechIndex = 0;
  updateReadingProgress();
}

playBtn.addEventListener("click", startReading);
restartBtn.addEventListener("click", startReading);
pauseBtn.addEventListener("click", () => { if (speechSynthesis.speaking && !speechSynthesis.paused) speechSynthesis.pause(); });
resumeBtn.addEventListener("click", () => { if (speechSynthesis.paused) speechSynthesis.resume(); });
stopBtn.addEventListener("click", stopReading);

testVoiceBtn.addEventListener("click", () => {
  const v = selectedVoice();
  if (!v) return;
  speechSynthesis.cancel();
  const en = (v.lang || "").toLowerCase().startsWith("en");
  const u = new SpeechSynthesisUtterance(en ? "Hello. This is the selected voice." : "Olá. Esta é a voz selecionada.");
  u.voice = v; u.lang = v.lang; u.rate = Number(rate.value); u.volume = Number(volume.value); u.pitch = Number(pitch.value);
  speechSynthesis.speak(u);
});

window.addEventListener("beforeunload", () => {
  speechSynthesis.cancel();
  if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
  if (ocrWorker) { try { ocrWorker.terminate(); } catch {} }
});

updateTextStats();
updateSliders();
updateOcrButton();
registerOffline();
