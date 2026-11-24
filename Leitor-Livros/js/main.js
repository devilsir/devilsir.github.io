(function (App) {
  "use strict";

  const {
    clearAllHistory,
    deleteHistoryPage,
    getHistoryPage,
    getHistoryPages,
    getStorageEstimate,
    loadSettings,
    requestPersistentStorage,
    saveHistoryPage,
    saveSettings
  } = App.storage;
  const { preprocessImage } = App.imageProcessing;
  const { cleanBookText, estimateReadingSeconds, formatDuration } = App.textCleaner;
  const { cancelOcr, loadLocalOcrEngine, recognizePage, terminateOcrWorker } = App.ocr;
  const { SpeechReader } = App.tts;

  const $ = (selector) => document.querySelector(selector);

  const els = {
    themeBtn: $("#themeBtn"),
    updateBtn: $("#updateBtn"),
    installBtn: $("#installBtn"),

    uploadZone: $("#uploadZone"),
    imageInput: $("#imageInput"),
    galleryInput: $("#galleryInput"),
    sampleGallery: $("#sampleGallery"),
    previewLayout: $("#previewLayout"),
    preview: $("#preview"),
    rotateLeftBtn: $("#rotateLeftBtn"),
    rotateRightBtn: $("#rotateRightBtn"),
    toggleProcessedBtn: $("#toggleProcessedBtn"),

    ocrLanguage: $("#ocrLanguage"),
    ocrPsm: $("#ocrPsm"),
    removeShadow: $("#removeShadow"),
    grayscaleImage: $("#grayscaleImage"),
    enhanceImage: $("#enhanceImage"),
    binarizeImage: $("#binarizeImage"),
    cleanTextOption: $("#cleanTextOption"),
    appendTextOption: $("#appendTextOption"),
    processingCanvas: $("#processingCanvas"),

    ocrBtn: $("#ocrBtn"),
    cancelOcrBtn: $("#cancelOcrBtn"),
    clearImageBtn: $("#clearImageBtn"),
    ocrProgressWrap: $("#ocrProgressWrap"),
    ocrProgressBar: $("#ocrProgressBar"),
    ocrProgressText: $("#ocrProgressText"),
    ocrStatus: $("#ocrStatus"),
    ocrConfidence: $("#ocrConfidence"),

    textArea: $("#text"),
    formatTextBtn: $("#formatTextBtn"),
    fontDownBtn: $("#fontDownBtn"),
    fontUpBtn: $("#fontUpBtn"),
    copyBtn: $("#copyBtn"),
    downloadTxtBtn: $("#downloadTxtBtn"),
    clearTextBtn: $("#clearTextBtn"),
    wordCount: $("#wordCount"),
    charCount: $("#charCount"),
    readTimeEstimate: $("#readTimeEstimate"),

    wakeLockBadge: $("#wakeLockBadge"),
    voiceCount: $("#voiceCount"),
    voiceLanguage: $("#voiceLanguage"),
    voiceSelect: $("#voiceSelect"),
    testVoiceBtn: $("#testVoiceBtn"),
    voiceInfo: $("#voiceInfo"),
    neuralProgressWrap: $("#neuralProgressWrap"),
    neuralProgressBar: $("#neuralProgressBar"),
    neuralProgressText: $("#neuralProgressText"),
    rate: $("#rate"),
    volume: $("#volume"),
    pitch: $("#pitch"),
    rateValue: $("#rateValue"),
    volumeValue: $("#volumeValue"),
    pitchValue: $("#pitchValue"),

    readerLiveWrap: $("#readerLiveWrap"),
    chunkCounter: $("#chunkCounter"),
    readerChunks: $("#readerChunks"),
    readingBar: $("#readingBar"),
    readingText: $("#readingText"),
    prevChunkBtn: $("#prevChunkBtn"),
    playPauseBtn: $("#playPauseBtn"),
    nextChunkBtn: $("#nextChunkBtn"),
    restartBtn: $("#restartBtn"),
    stopBtn: $("#stopBtn"),

    historyCount: $("#historyCount"),
    clearHistoryBtn: $("#clearHistoryBtn"),
    storageStatus: $("#storageStatus"),
    historySearch: $("#historySearch"),
    historyEmpty: $("#historyEmpty"),
    historyList: $("#historyList")
  };

  const state = {
    installPrompt: null,
    ocrEngineReady: false,
    ocrRunning: false,
    currentImageFile: null,
    currentImageUrl: "",
    processedPreviewUrl: "",
    showProcessedPreview: false,
    rotation: 0,
    theme: "paper",
    fontSize: 16,
    savedVoiceURI: "",
    visibleVoices: [],
    renderedChunksKey: "",
    historyPages: [],
    historyObjectUrls: []
  };

  let toastTimer = null;
  function showToast(message) {
    let toast = document.querySelector(".history-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "history-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function applyTheme(theme) {
    state.theme = theme === "dark" ? "dark" : "paper";
    document.documentElement.dataset.theme = state.theme;
    els.themeBtn.textContent = state.theme === "dark" ? "☀ Claro" : "◐ Escuro";
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", state.theme === "dark" ? "#171412" : "#6b4f35");
    }
  }

  function applyFontSize(size) {
    state.fontSize = Math.max(13, Math.min(26, Number(size) || 16));
    els.textArea.style.fontSize = `${state.fontSize}px`;
  }

  function collectSettings() {
    return {
      ocrLanguage: els.ocrLanguage.value,
      ocrPsm: els.ocrPsm.value,
      ocrAppend: els.appendTextOption.checked,
      gray: els.grayscaleImage.checked,
      contrast: els.enhanceImage.checked,
      removeShadow: els.removeShadow.checked,
      binarize: els.binarizeImage.checked,
      cleanText: els.cleanTextOption.checked,
      voiceLanguage: els.voiceLanguage.value,
      voiceURI: els.voiceSelect.value || state.savedVoiceURI,
      rate: els.rate.value,
      volume: els.volume.value,
      pitch: els.pitch.value,
      theme: state.theme,
      fontSize: state.fontSize,
      text: els.textArea.value
    };
  }

  function persistSettings() {
    saveSettings(collectSettings());
  }

  function hydrateSettings() {
    const s = loadSettings();
    els.ocrLanguage.value = s.ocrLanguage;
    els.ocrPsm.value = s.ocrPsm;
    els.appendTextOption.checked = Boolean(s.ocrAppend);
    els.grayscaleImage.checked = Boolean(s.gray);
    els.enhanceImage.checked = Boolean(s.contrast);
    els.removeShadow.checked = Boolean(s.removeShadow);
    els.binarizeImage.checked = Boolean(s.binarize);
    els.cleanTextOption.checked = Boolean(s.cleanText);
    els.voiceLanguage.value = s.voiceLanguage;
    els.rate.value = s.rate;
    els.volume.value = s.volume;
    els.pitch.value = s.pitch;
    els.textArea.value = s.text || "";
    state.savedVoiceURI = s.voiceURI || "";

    applyTheme(s.theme);
    applyFontSize(s.fontSize);
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPrompt = event;
    els.installBtn.hidden = false;
  });

  els.installBtn.addEventListener("click", async () => {
    if (!state.installPrompt) return;
    state.installPrompt.prompt();
    await state.installPrompt.userChoice;
    state.installPrompt = null;
    els.installBtn.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    els.installBtn.hidden = true;
    showToast("App instalado no aparelho");
  });

  els.themeBtn.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "paper" : "dark");
    persistSettings();
  });

  function revokePreviewUrls() {
    if (state.currentImageUrl) {
      URL.revokeObjectURL(state.currentImageUrl);
      state.currentImageUrl = "";
    }
    if (state.processedPreviewUrl) {
      URL.revokeObjectURL(state.processedPreviewUrl);
      state.processedPreviewUrl = "";
    }
  }

  function getPreprocessOptions() {
    return {
      rotation: state.rotation,
      grayscale: els.grayscaleImage.checked,
      contrast: els.enhanceImage.checked,
      removeShadow: els.removeShadow.checked,
      binarize: els.binarizeImage.checked
    };
  }

  async function refreshPreviewImage() {
    if (!state.currentImageFile) return;

    if (state.showProcessedPreview || state.rotation !== 0) {
      try {
        const options = state.showProcessedPreview
          ? { ...getPreprocessOptions(), maxDimension: 1400 }
          : {
              rotation: state.rotation,
              grayscale: false,
              contrast: false,
              removeShadow: false,
              binarize: false,
              maxDimension: 1400
            };
        const blob = await preprocessImage(state.currentImageFile, els.processingCanvas, options);
        if (state.processedPreviewUrl) URL.revokeObjectURL(state.processedPreviewUrl);
        state.processedPreviewUrl = URL.createObjectURL(blob);
        els.preview.src = state.processedPreviewUrl;
        return;
      } catch (err) {
        console.warn("Falha na prévia tratada:", err);
      }
    }

    els.preview.src = state.currentImageUrl;
  }

  function loadImageFile(file, sourceLabel = "Página carregada. Toque em “Reconhecer texto”.") {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Escolha um arquivo de imagem válido.");
      return;
    }

    revokePreviewUrls();
    state.currentImageFile = file;
    state.currentImageUrl = URL.createObjectURL(file);
    state.rotation = 0;
    state.showProcessedPreview = false;
    els.toggleProcessedBtn.setAttribute("aria-pressed", "false");
    els.toggleProcessedBtn.textContent = "Ver imagem tratada";

    els.preview.src = state.currentImageUrl;
    els.previewLayout.hidden = false;
    els.ocrConfidence.hidden = true;
    els.ocrStatus.textContent = sourceLabel;
    updateOcrButton();
  }

  els.uploadZone.addEventListener("click", (event) => {
    if (event.target.closest(".upload-trigger")) return;
    els.imageInput.click();
  });

  els.uploadZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      els.imageInput.click();
    }
  });

  els.imageInput.addEventListener("change", () => {
    const file = els.imageInput.files?.[0];
    if (file) loadImageFile(file);
  });

  els.galleryInput.addEventListener("change", () => {
    const file = els.galleryInput.files?.[0];
    if (file) loadImageFile(file);
  });

  // Built-in sample book pages (works both on http(s):// and file://)
  let samplesDataPromise = null;
  function loadSamplesDataScript() {
    if (window.__LEITOR_SAMPLES_B64__) return Promise.resolve(window.__LEITOR_SAMPLES_B64__);
    if (samplesDataPromise) return samplesDataPromise;
    samplesDataPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./samples/samples-data.js";
      script.async = true;
      script.onload = () => resolve(window.__LEITOR_SAMPLES_B64__ || {});
      script.onerror = () => reject(new Error("Não foi possível carregar samples-data.js"));
      document.head.appendChild(script);
    });
    return samplesDataPromise;
  }

  async function loadSampleImageFile(sampleId, srcUrl) {
    if (!App.config.isFileProtocol()) {
      const res = await fetch(srcUrl);
      if (res.ok) {
        const blob = await res.blob();
        return new File([blob], `${sampleId}.jpg`, { type: blob.type || "image/jpeg" });
      }
    }
    const map = await loadSamplesDataScript();
    const b64 = map[sampleId];
    if (!b64) throw new Error("Imagem de exemplo não encontrada.");
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], `${sampleId}.jpg`, { type: "image/jpeg" });
  }

  els.sampleGallery?.addEventListener("click", async (event) => {
    const card = event.target.closest(".sample-card");
    if (!card || state.ocrRunning) return;

    const sampleId = card.dataset.sample;
    const sampleLang = card.dataset.lang || "por";
    const sampleSrc = card.dataset.src;
    const sampleTitle = card.querySelector("strong")?.textContent || "Exemplo";

    els.sampleGallery.querySelectorAll(".sample-card").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");

    try {
      const file = await loadSampleImageFile(sampleId, sampleSrc);
      els.ocrLanguage.value = sampleLang;
      if (els.voiceLanguage.value === "auto") renderVoices();
      persistSettings();

      loadImageFile(file, `Exemplo “${sampleTitle}” carregado. Toque em “Reconhecer texto”.`);
      els.previewLayout.scrollIntoView({ behavior: "smooth", block: "nearest" });
      showToast(`Exemplo “${sampleTitle}” pronto para OCR`);
    } catch (err) {
      console.error("Erro ao carregar exemplo:", err);
      showToast("Não foi possível carregar a página de exemplo");
    }
  });

  ["dragenter", "dragover"].forEach((evt) => {
    els.uploadZone.addEventListener(evt, (event) => {
      event.preventDefault();
      els.uploadZone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    els.uploadZone.addEventListener(evt, (event) => {
      event.preventDefault();
      els.uploadZone.classList.remove("drag-over");
    });
  });

  els.uploadZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) loadImageFile(file, "Imagem recebida. Toque em “Reconhecer texto”.");
  });

  window.addEventListener("paste", (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          loadImageFile(file, "Imagem colada da área de transferência. Toque em “Reconhecer texto”.");
          showToast("Imagem colada");
        }
        break;
      }
    }
  });

  els.rotateLeftBtn.addEventListener("click", () => {
    state.rotation = (state.rotation + 270) % 360;
    refreshPreviewImage();
  });

  els.rotateRightBtn.addEventListener("click", () => {
    state.rotation = (state.rotation + 90) % 360;
    refreshPreviewImage();
  });

  els.toggleProcessedBtn.addEventListener("click", () => {
    state.showProcessedPreview = !state.showProcessedPreview;
    els.toggleProcessedBtn.setAttribute("aria-pressed", String(state.showProcessedPreview));
    els.toggleProcessedBtn.textContent = state.showProcessedPreview
      ? "Ver imagem original"
      : "Ver imagem tratada";
    refreshPreviewImage();
  });

  [els.removeShadow, els.grayscaleImage, els.enhanceImage, els.binarizeImage].forEach((el) => {
    el.addEventListener("change", () => {
      persistSettings();
      if (state.showProcessedPreview) refreshPreviewImage();
    });
  });

  [els.ocrLanguage, els.ocrPsm, els.cleanTextOption, els.appendTextOption].forEach((el) => {
    el.addEventListener("change", () => {
      persistSettings();
      if (el === els.ocrLanguage && els.voiceLanguage.value === "auto") {
        renderVoices();
      }
    });
  });

  els.clearImageBtn.addEventListener("click", () => {
    if (state.ocrRunning) return;
    revokePreviewUrls();
    state.currentImageFile = null;
    state.rotation = 0;
    state.showProcessedPreview = false;
    els.imageInput.value = "";
    els.galleryInput.value = "";
    els.preview.src = "";
    els.previewLayout.hidden = true;
    els.ocrProgressWrap.hidden = true;
    els.ocrProgressBar.style.width = "0%";
    els.ocrProgressText.textContent = "0%";
    els.ocrConfidence.hidden = true;
    els.ocrStatus.textContent = "Aguardando uma página.";
    updateOcrButton();
  });

  function updateOcrButton() {
    els.ocrBtn.disabled = state.ocrRunning || !(state.currentImageFile && state.ocrEngineReady);
    els.cancelOcrBtn.hidden = !state.ocrRunning || App.config.isFileProtocol();
    els.clearImageBtn.disabled = state.ocrRunning;

    if (state.currentImageFile && !state.ocrEngineReady && !state.ocrRunning) {
      els.ocrStatus.textContent = "Carregando motor OCR local…";
    }
  }

  els.ocrBtn.addEventListener("click", async () => {
    if (!state.currentImageFile || !state.ocrEngineReady || state.ocrRunning) return;

    state.ocrRunning = true;
    updateOcrButton();
    els.ocrConfidence.hidden = true;
    els.ocrProgressWrap.hidden = false;
    els.ocrProgressBar.style.width = "4%";
    els.ocrProgressText.textContent = "4%";

    try {
      els.ocrStatus.textContent = "Tratando iluminação, contraste e nitidez…";
      const prepared = await preprocessImage(
        state.currentImageFile,
        els.processingCanvas,
        getPreprocessOptions()
      );

      const { text: rawText, confidence, canceled } = await recognizePage(prepared, {
        language: els.ocrLanguage.value,
        psm: els.ocrPsm.value,
        onProgress: ({ label, progress }) => {
          els.ocrStatus.textContent = label;
          els.ocrProgressBar.style.width = `${progress}%`;
          els.ocrProgressText.textContent = `${progress}%`;
        }
      });

      if (canceled) {
        els.ocrStatus.textContent = "Reconhecimento cancelado.";
        els.ocrProgressWrap.hidden = true;
        return;
      }

      const finalText = els.cleanTextOption.checked ? cleanBookText(rawText) : rawText;

      if (!finalText) {
        els.ocrStatus.textContent = "Nenhum texto legível foi encontrado. Tente girar a foto ou ativar 'Preto e branco forte'.";
        els.ocrProgressBar.style.width = "100%";
        els.ocrProgressText.textContent = "100%";
        return;
      }

      if (els.appendTextOption.checked && els.textArea.value.trim()) {
        els.textArea.value = `${els.textArea.value.trim()}\n\n${finalText}`;
      } else {
        els.textArea.value = finalText;
      }

      syncTextAndChunks();
      persistSettings();

      if (confidence > 0) {
        els.ocrConfidence.textContent = `Confiança: ${confidence}%`;
        els.ocrConfidence.className = confidence >= 80 ? "badge ready" : "badge loading";
        els.ocrConfidence.hidden = false;
      }

      try {
        await saveHistoryPage({
          imageFile: state.currentImageFile,
          text: finalText,
          language: els.ocrLanguage.value,
          confidence,
          rotation: state.rotation
        });
        await refreshHistoryUI();
        showToast("Página salva na memória");
      } catch (historyErr) {
        console.warn("Histórico indisponível:", historyErr);
        showToast("Texto reconhecido");
      }

      els.ocrProgressBar.style.width = "100%";
      els.ocrProgressText.textContent = "100%";
      els.ocrStatus.textContent = els.appendTextOption.checked
        ? "Página acrescentada ao texto."
        : "Texto reconhecido com sucesso.";
    } catch (err) {
      console.error("Erro no OCR:", err);
      els.ocrStatus.textContent = "Não consegui reconhecer esta página. Tente novamente ou ajuste os filtros.";
      showToast("Falha ao executar OCR");
    } finally {
      state.ocrRunning = false;
      updateOcrButton();
    }
  });

  els.cancelOcrBtn.addEventListener("click", async () => {
    if (!state.ocrRunning) return;
    els.ocrStatus.textContent = "Cancelando…";
    await cancelOcr();
  });

  function updateTextStats() {
    const value = els.textArea.value;
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const seconds = estimateReadingSeconds(trimmed, els.rate.value);

    els.wordCount.textContent = `${words} ${words === 1 ? "palavra" : "palavras"}`;
    els.charCount.textContent = `${value.length} ${value.length === 1 ? "caractere" : "caracteres"}`;
    els.readTimeEstimate.textContent = `${formatDuration(seconds)} de leitura`;
  }

  function updateSlidersUI() {
    els.rateValue.textContent = `${Number(els.rate.value).toFixed(2).replace(/0$/, "")}x`;
    els.volumeValue.textContent = `${Math.round(Number(els.volume.value) * 100)}%`;
    els.pitchValue.textContent = Number(els.pitch.value).toFixed(1);
    updateTextStats();
  }

  els.textArea.addEventListener("input", () => {
    syncTextAndChunks();
    persistSettings();
  });

  els.formatTextBtn.addEventListener("click", () => {
    if (!els.textArea.value.trim()) return;
    els.textArea.value = cleanBookText(els.textArea.value);
    syncTextAndChunks();
    persistSettings();
    showToast("Quebras de linha e hifens ajustados");
  });

  els.fontDownBtn.addEventListener("click", () => {
    applyFontSize(state.fontSize - 2);
    persistSettings();
  });

  els.fontUpBtn.addEventListener("click", () => {
    applyFontSize(state.fontSize + 2);
    persistSettings();
  });

  async function copyToClipboard(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const tmp = document.createElement("textarea");
      tmp.value = text;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      tmp.remove();
    }
    showToast("Texto copiado");
  }

  els.copyBtn.addEventListener("click", () => copyToClipboard(els.textArea.value));

  els.downloadTxtBtn.addEventListener("click", () => {
    const content = els.textArea.value.trim();
    if (!content) return showToast("Não há texto para exportar");
    const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leitor-pagina-${stamp}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    showToast("Arquivo .txt baixado");
  });

  els.clearTextBtn.addEventListener("click", () => {
    reader.stop();
    els.textArea.value = "";
    syncTextAndChunks();
    persistSettings();
  });

  function getEffectiveVoiceLang() {
    if (els.voiceLanguage.value !== "auto") return els.voiceLanguage.value;
    return els.ocrLanguage.value.startsWith("eng") ? "en" : "pt";
  }

  function getSelectedVoice() {
    return (
      state.visibleVoices.find((v) => v.voiceURI === els.voiceSelect.value) ||
      state.visibleVoices[0] ||
      null
    );
  }

  function updateVoiceInfo() {
    const voice = getSelectedVoice();
    reader.setConfig({ voice });

    if (!voice) {
      els.voiceInfo.textContent = "Nenhuma voz disponível neste navegador.";
      els.testVoiceBtn.disabled = true;
      return;
    }

    els.testVoiceBtn.disabled = false;
    if (voice.neural) {
      els.voiceInfo.textContent = `${voice.name} (${voice.lang}) · voz neural local.`;
    } else {
      els.voiceInfo.textContent = `${voice.name} (${voice.lang}) · voz do aparelho.`;
    }
  }

  function renderVoices() {
    const preferredLang = getEffectiveVoiceLang();
    state.visibleVoices = reader.getSortedVoices({ preferredLang });

    const previous = els.voiceSelect.value || state.savedVoiceURI;
    els.voiceSelect.innerHTML = "";

    state.visibleVoices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} — ${voice.lang}`;
      els.voiceSelect.appendChild(option);
    });

    if (previous && state.visibleVoices.some((v) => v.voiceURI === previous)) {
      els.voiceSelect.value = previous;
    } else {
      const targetPrefix = preferredLang === "en" ? "en" : "pt";
      const match = state.visibleVoices.find((v) =>
        (v.lang || "").toLowerCase().startsWith(targetPrefix)
      );
      if (match) els.voiceSelect.value = match.voiceURI;
    }

    els.voiceCount.textContent = `${state.visibleVoices.length} ${state.visibleVoices.length === 1 ? "voz" : "vozes"}`;
    updateVoiceInfo();
  }

  function renderChunkList(chunks, activeIndex) {
    els.readerLiveWrap.hidden = chunks.length === 0;
    if (!chunks.length) {
      els.readerChunks.innerHTML = "";
      state.renderedChunksKey = "";
      return;
    }

    const key = `${chunks.length}:${chunks[0]?.slice(0, 24)}:${chunks[chunks.length - 1]?.slice(-24)}`;
    if (key !== state.renderedChunksKey) {
      state.renderedChunksKey = key;
      const frag = document.createDocumentFragment();
      chunks.forEach((chunk, index) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "reader-chunk";
        btn.dataset.index = String(index);
        btn.textContent = chunk;
        frag.appendChild(btn);
      });
      els.readerChunks.innerHTML = "";
      els.readerChunks.appendChild(frag);
    }

    const buttons = els.readerChunks.querySelectorAll(".reader-chunk");
    buttons.forEach((btn, idx) => {
      const isActive = idx === activeIndex;
      btn.classList.toggle("active", isActive);
      if (isActive && reader.status === "playing") {
        btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }

  function renderReaderState({ status, chunks, currentIndex, totalChunks, progress, wakeLockActive }) {
    els.readingBar.style.width = `${progress}%`;
    els.readingText.textContent = `${progress}%`;
    els.wakeLockBadge.hidden = !wakeLockActive;

    const displayIdx = totalChunks ? Math.min(currentIndex + 1, totalChunks) : 0;
    els.chunkCounter.textContent = `${displayIdx} / ${totalChunks}`;
    renderChunkList(chunks, status === "finished" ? -1 : currentIndex);

    if (status === "playing") {
      els.playPauseBtn.textContent = "Ⅱ Pausar";
    } else if (status === "paused") {
      els.playPauseBtn.textContent = "▶ Continuar";
    } else {
      els.playPauseBtn.textContent = "▶ Ler";
    }

    const hasChunks = totalChunks > 0;
    els.prevChunkBtn.disabled = !hasChunks || currentIndex <= 0;
    els.nextChunkBtn.disabled = !hasChunks || currentIndex >= totalChunks - 1;
    els.restartBtn.disabled = !hasChunks;
    els.stopBtn.disabled = status === "idle";
  }

  function renderNeuralProgress(info) {
    if (!info) {
      els.neuralProgressWrap.hidden = true;
      els.neuralProgressBar.style.width = "0%";
      els.neuralProgressText.textContent = "0%";
      updateVoiceInfo();
      return;
    }
    els.neuralProgressWrap.hidden = false;
    const pct = typeof info.percent === "number" ? Math.max(2, Math.min(100, info.percent)) : 50;
    els.neuralProgressBar.style.width = `${pct}%`;
    els.neuralProgressText.textContent = `${pct}%`;
    if (info.label) {
      els.voiceInfo.textContent = info.label;
    }
  }

  const reader = new SpeechReader({
    onVoicesChange: () => renderVoices(),
    onStateChange: (ttsState) => renderReaderState(ttsState),
    onNeuralProgress: (info) => renderNeuralProgress(info),
    onError: (msg) => showToast(msg)
  });

  function syncTextAndChunks() {
    updateTextStats();
    if (reader.status !== "playing") {
      reader.loadText(els.textArea.value);
    }
  }

  els.readerChunks.addEventListener("click", (event) => {
    const btn = event.target.closest(".reader-chunk");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    reader.setConfig({
      voice: getSelectedVoice(),
      rate: els.rate.value,
      volume: els.volume.value,
      pitch: els.pitch.value
    });
    reader.play(els.textArea.value, idx);
  });

  els.voiceLanguage.addEventListener("change", () => {
    renderVoices();
    persistSettings();
  });

  els.voiceSelect.addEventListener("change", () => {
    state.savedVoiceURI = els.voiceSelect.value;
    updateVoiceInfo();
    reader.setConfig({ voice: getSelectedVoice() }, true);
    persistSettings();
  });

  [els.rate, els.volume, els.pitch].forEach((slider) => {
    slider.addEventListener("input", () => {
      updateSlidersUI();
      persistSettings();
    });
    slider.addEventListener("change", () => {
      reader.setConfig(
        {
          rate: els.rate.value,
          volume: els.volume.value,
          pitch: els.pitch.value
        },
        true
      );
    });
  });

  els.playPauseBtn.addEventListener("click", () => {
    if (reader.status === "playing") {
      reader.pause();
      return;
    }
    if (reader.status === "paused") {
      reader.resume();
      return;
    }
    if (!els.textArea.value.trim()) {
      showToast("Reconheça ou cole algum texto primeiro");
      return;
    }
    reader.setConfig({
      voice: getSelectedVoice(),
      rate: els.rate.value,
      volume: els.volume.value,
      pitch: els.pitch.value
    });
    reader.play(els.textArea.value);
  });

  els.restartBtn.addEventListener("click", () => {
    if (!els.textArea.value.trim()) return;
    reader.setConfig({
      voice: getSelectedVoice(),
      rate: els.rate.value,
      volume: els.volume.value,
      pitch: els.pitch.value
    });
    reader.play(els.textArea.value, 0);
  });

  els.prevChunkBtn.addEventListener("click", () => reader.prev());
  els.nextChunkBtn.addEventListener("click", () => reader.next());
  els.stopBtn.addEventListener("click", () => reader.stop());

  els.testVoiceBtn.addEventListener("click", () => {
    reader.setConfig({
      rate: els.rate.value,
      volume: els.volume.value,
      pitch: els.pitch.value
    });
    reader.testVoice(getSelectedVoice());
  });

  function formatLanguageLabel(language) {
    if (language === "por") return "Português";
    if (language === "eng") return "English";
    if (language === "por+eng") return "PT + EN";
    return language || "OCR";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function updateStorageBadge() {
    const { usageMB } = await getStorageEstimate();
    if (typeof usageMB === "number") {
      const label = usageMB < 10 ? usageMB.toFixed(1) : Math.round(usageMB);
      els.storageStatus.textContent = `${label} MB usados`;
    }
  }

  function renderFilteredHistory() {
    state.historyObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    state.historyObjectUrls = [];

    const query = els.historySearch.value.trim().toLowerCase();
    const dateFmt = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const timeFmt = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const filtered = state.historyPages.filter((page) => {
      if (!query) return true;
      const dateStr = dateFmt.format(new Date(page.createdAt));
      return (
        (page.text || "").toLowerCase().includes(query) ||
        dateStr.includes(query) ||
        formatLanguageLabel(page.language).toLowerCase().includes(query)
      );
    });

    els.historyList.innerHTML = "";
    const total = state.historyPages.length;
    els.historyCount.textContent = `${total} ${total === 1 ? "página" : "páginas"}`;

    if (filtered.length === 0) {
      els.historyEmpty.hidden = false;
      els.historyEmpty.innerHTML =
        total === 0
          ? "<strong>Nenhuma página salva ainda.</strong><span>Fotografe uma página e reconheça o texto. Ela aparecerá aqui automaticamente.</span>"
          : "<strong>Nenhum resultado encontrado.</strong><span>Tente buscar por outra palavra ou limpe o filtro.</span>";
      return;
    }

    els.historyEmpty.hidden = true;
    const fragment = document.createDocumentFragment();

    for (const page of filtered) {
      const date = new Date(page.createdAt);
      const dateText = dateFmt.format(date);
      const timeText = timeFmt.format(date);
      const imageUrl = page.imageBlob ? URL.createObjectURL(page.imageBlob) : "";
      if (imageUrl) state.historyObjectUrls.push(imageUrl);

      const confidenceBadge =
        typeof page.confidence === "number" && page.confidence > 0
          ? `<span class="history-lang">${page.confidence}%</span>`
          : "";

      const article = document.createElement("article");
      article.className = "history-item";
      article.dataset.id = String(page.id);
      article.innerHTML = `
        <div class="history-thumb">
          ${imageUrl ? `<img src="${imageUrl}" loading="lazy" alt="Página salva em ${dateText} às ${timeText}">` : ""}
        </div>
        <div class="history-body">
          <div class="history-meta">
            <span class="history-date">${dateText}</span>
            <span class="history-time">${timeText}</span>
            <span class="history-lang">${formatLanguageLabel(page.language)}</span>
            ${confidenceBadge}
          </div>
          <p class="history-text">${escapeHtml(page.text)}</p>
          <div class="history-actions">
            <button class="secondary open-history" type="button">Abrir</button>
            <button class="secondary listen-history" type="button">▶ Ouvir</button>
            <button class="ghost copy-history" type="button">Copiar</button>
            <button class="delete-history" type="button">Excluir</button>
          </div>
        </div>
      `;
      fragment.appendChild(article);
    }

    els.historyList.appendChild(fragment);
  }

  async function refreshHistoryUI() {
    try {
      state.historyPages = await getHistoryPages();
      renderFilteredHistory();
      await updateStorageBadge();
    } catch (err) {
      console.warn("Histórico IndexedDB:", err);
      els.storageStatus.textContent = "Memória da sessão";
      els.historyEmpty.hidden = false;
      els.historyEmpty.innerHTML =
        "<strong>Memória persistente limitada neste modo.</strong><span>Alguns navegadores restringem o IndexedDB em arquivos locais; o OCR e a leitura continuam funcionando normalmente.</span>";
    }
  }

  async function openHistoryRecord(id, autoListen = false) {
    const page = await getHistoryPage(id);
    if (!page) return;

    reader.stop();
    els.textArea.value = page.text || "";
    syncTextAndChunks();
    persistSettings();

    if (page.imageBlob) {
      const restoredFile = new File([page.imageBlob], `pagina-${page.id}.jpg`, {
        type: page.imageBlob.type || "image/jpeg"
      });
      loadImageFile(restoredFile, "Página carregada da memória.");
    }

    if (page.language) els.ocrLanguage.value = page.language;

    els.textArea.scrollIntoView({ behavior: "smooth", block: "center" });

    if (autoListen) {
      setTimeout(() => {
        reader.setConfig({
          voice: getSelectedVoice(),
          rate: els.rate.value,
          volume: els.volume.value,
          pitch: els.pitch.value
        });
        reader.play(els.textArea.value, 0);
      }, 220);
    }
  }

  els.historySearch.addEventListener("input", renderFilteredHistory);

  els.historyList.addEventListener("click", async (event) => {
    const item = event.target.closest(".history-item");
    if (!item) return;
    const id = Number(item.dataset.id);

    if (event.target.closest(".open-history")) {
      await openHistoryRecord(id, false);
    } else if (event.target.closest(".listen-history")) {
      await openHistoryRecord(id, true);
    } else if (event.target.closest(".copy-history")) {
      const page = await getHistoryPage(id);
      if (page?.text) await copyToClipboard(page.text);
    } else if (event.target.closest(".delete-history")) {
      if (confirm("Excluir esta página salva?")) {
        await deleteHistoryPage(id);
        await refreshHistoryUI();
        showToast("Página excluída");
      }
    }
  });

  els.clearHistoryBtn.addEventListener("click", async () => {
    const total = state.historyPages.length;
    if (!total) return;
    if (confirm(`Apagar as ${total} páginas salvas deste aparelho? Esta ação não pode ser desfeita.`)) {
      await clearAllHistory();
      await refreshHistoryUI();
      showToast("Histórico apagado");
    }
  });

  window.addEventListener("beforeunload", () => {
    reader.destroy();
    revokePreviewUrls();
    state.historyObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    terminateOcrWorker();
  });

  async function bootstrap() {
    window.__LEITOR_BOOTED__ = true;
    hydrateSettings();
    updateSlidersUI();
    syncTextAndChunks();
    updateOcrButton();

    requestPersistentStorage()
      .then(({ persisted, usageMB }) => {
        if (typeof usageMB === "number") {
          const label = usageMB < 10 ? usageMB.toFixed(1) : Math.round(usageMB);
          els.storageStatus.textContent = `${label} MB usados${persisted ? " · protegida" : ""}`;
        } else {
          els.storageStatus.textContent = persisted ? "Memória protegida" : "Memória local";
        }
      })
      .catch(() => {
        els.storageStatus.textContent = "Memória local";
      });

    refreshHistoryUI();

    loadLocalOcrEngine()
      .then(() => {
        state.ocrEngineReady = true;
        updateOcrButton();
      })
      .catch((err) => {
        console.error("Falha ao carregar motor OCR local:", err);
        state.ocrEngineReady = false;
        updateOcrButton();
      });

    await App.offline?.setupOfflineSupport({
      onUpdateAvailable: (applyUpdate) => {
        els.updateBtn.hidden = false;
        els.updateBtn.onclick = () => {
          els.updateBtn.disabled = true;
          applyUpdate();
        };
      }
    });
  }

  bootstrap();
})((window.LeitorApp = window.LeitorApp || {}));
