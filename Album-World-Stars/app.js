(() => {
  "use strict";

  const references = Array.isArray(window.STICKER_REFERENCES) ? window.STICKER_REFERENCES : [];
  const TOTAL = references.length || 64;
  const STORAGE_KEY = "world-stars-album-2026-v1";
  const PASS_SCORE = 55;
  const DEFAULT_MUSIC_VOLUME = 30;

  const QUIZ_QUESTIONS = [
    {
      question: "Which sentence correctly answers: Where are you from?",
      options: ["I am from Brazil.", "I have from Brazil.", "I is from Brazil.", "I am Brazil from."],
      answer: 0,
      note: "Use “I am from + country.”",
    },
    {
      question: "Complete: She is from Japan. She is ____.",
      options: ["Japanese", "Japanian", "Japans", "Japan"],
      answer: 0,
      note: "Japan is the country; Japanese is the nationality.",
    },
    {
      question: "Complete: I study at school. I am a ____.",
      options: ["student", "driver", "cook", "farmer"],
      answer: 0,
      note: "A student studies at school.",
    },
    {
      question: "Which month comes after March?",
      options: ["April", "January", "February", "December"],
      answer: 0,
      note: "The order is January, February, March, April.",
    },
    {
      question: "Complete: There ____ two chairs in the kitchen.",
      options: ["are", "is", "am", "was"],
      answer: 0,
      note: "Use “there are” for plural objects.",
    },
    {
      question: "Complete: There ____ a bed in the bedroom.",
      options: ["is", "are", "am", "were"],
      answer: 0,
      note: "Use “there is” for one thing.",
    },
    {
      question: "Choose the correct plural of child.",
      options: ["children", "childs", "childes", "childies"],
      answer: 0,
      note: "Child has an irregular plural: children.",
    },
    {
      question: "Choose the correct plural of baby.",
      options: ["babies", "babys", "babyes", "babyses"],
      answer: 0,
      note: "Consonant + y changes to -ies.",
    },
    {
      question: "Choose the correct possessive form: the pencil of Maria.",
      options: ["Maria’s pencil", "Marias pencil", "Pencil’s Maria", "Maria pencil’s"],
      answer: 0,
      note: "Use name + ’s to show possession.",
    },
    {
      question: "My mother’s mother is my ____.",
      options: ["grandmother", "aunt", "sister", "daughter"],
      answer: 0,
      note: "Grandmother means your parent’s mother.",
    },
    {
      question: "The fridge is usually in the ____.",
      options: ["kitchen", "bathroom", "garage", "bedroom"],
      answer: 0,
      note: "Kitchen vocabulary was part of the house unit.",
    },
    {
      question: "Complete: The ball is ____ the chair.",
      options: ["under", "January", "Brazilian", "doctor"],
      answer: 0,
      note: "Under is a preposition of place.",
    },
    {
      question: "Which subject pronoun matches: Maria?",
      options: ["she", "he", "they", "it"],
      answer: 0,
      note: "Use she for a female singular subject.",
    },
    {
      question: "Complete in the present: They ____ the champions.",
      options: ["are", "is", "am", "was"],
      answer: 0,
      note: "They uses are in the present.",
    },
    {
      question: "Complete in the past: She ____ beautiful.",
      options: ["was", "were", "are", "am"],
      answer: 0,
      note: "She uses was in the past.",
    },
  ];


  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const pageLabels = [
    "Capa",
    "Página 2 · Figurinhas 00–08",
    "Página 3 · Figurinhas 09–16",
    "Página 4 · Figurinhas 17–24",
    "Página 5 · Figurinhas 25–32",
    "Página 6 · Figurinhas 33–40",
    "Página 7 · Figurinhas 41–48",
    "Página 8 · Figurinhas 49–56",
    "Página 9 · Figurinhas 57–64",
    "Página especial",
    "Página especial",
    "Contracapa",
  ];

  const pageAlts = [
    "Capa do álbum World Stars 2026",
    "Primeira página interna do álbum, com nove espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Página interna do álbum, com oito espaços para figurinhas",
    "Última página com espaços para figurinhas",
    "Página especial ilustrada do álbum",
    "Segunda página especial ilustrada do álbum",
    "Contracapa do álbum World Stars 2026",
  ];

  const topSlot = { left: 39.53, top: 4.05, width: 21.78, height: 22.1 };
  const gridSlots = [
    { left: 3.04, top: 27.7, width: 21.85, height: 22.1 },
    { left: 27.37, top: 27.7, width: 21.85, height: 22.1 },
    { left: 51.27, top: 27.7, width: 21.85, height: 22.1 },
    { left: 75.25, top: 27.7, width: 21.85, height: 22.1 },
    { left: 3.04, top: 52.45, width: 21.85, height: 22.1 },
    { left: 27.37, top: 52.45, width: 21.85, height: 22.1 },
    { left: 51.27, top: 52.45, width: 21.85, height: 22.1 },
    { left: 75.25, top: 52.45, width: 21.85, height: 22.1 },
  ];

  let state = loadState();
  let currentView = "album";
  let currentFilter = "all";
  let pasteTarget = null;
  let pendingQuizStickerId = null;
  let currentQuiz = null;
  let justPasted = null;
  let toastTimer = 0;
  let sourceObjectUrl = null;
  let sourceImage = null;
  let lastMatch = null;
  let pointerDrag = null;
  let pageSwipe = null;
  let isPageFullscreen = false;
  let crop = { zoom: 1, offsetX: 0, offsetY: 0 };

  const elements = {
    albumView: $("#albumView"),
    inventoryView: $("#inventoryView"),
    albumPage: $("#albumPage"),
    pageWrap: $("#pageWrap"),
    stickerLayer: $("#stickerLayer"),
    pageStrip: $("#pageStrip"),
    previousPage: $("#previousPage"),
    nextPage: $("#nextPage"),
    pageCounter: $("#pageCounter"),
    pageEyebrow: $("#pageEyebrow"),
    miniInventory: $("#miniInventory"),
    inventoryGrid: $("#inventoryGrid"),
    filterCount: $("#filterCount"),
    pasteBanner: $("#pasteBanner"),
    pasteThumb: $("#pasteThumb"),
    pasteTitle: $("#pasteTitle"),
    scannerModal: $("#scannerModal"),
    sourceStep: $("#sourceStep"),
    cropStep: $("#cropStep"),
    analyzingStep: $("#analyzingStep"),
    resultStep: $("#resultStep"),
    cameraInput: $("#cameraInput"),
    galleryInput: $("#galleryInput"),
    cropCanvas: $("#cropCanvas"),
    cropStage: $("#cropStage"),
    zoomRange: $("#zoomRange"),
    resultBadge: $("#resultBadge"),
    resultIcon: $("#resultIcon"),
    resultEyebrow: $("#resultEyebrow"),
    resultTitle: $("#resultTitle"),
    resultMessage: $("#resultMessage"),
    matchedSticker: $("#matchedSticker"),
    matchedLabel: $("#matchedLabel"),
    scoreFill: $("#scoreFill"),
    scoreValue: $("#scoreValue"),
    resultActions: $("#resultActions"),
    toast: $("#toast"),
    toastIcon: $("#toastIcon"),
    toastMessage: $("#toastMessage"),
    confetti: $("#confetti"),
    analysisCanvas: $("#analysisCanvas"),
    fullscreenPage: $("#fullscreenPage"),
    exitFullscreen: $("#exitFullscreen"),
    profileModal: $("#profileModal"),
    profileSticker: $("#profileSticker"),
    profileNumber: $("#profileNumber"),
    profileName: $("#profileName"),
    profileRole: $("#profileRole"),
    profileAge: $("#profileAge"),
    profileLocation: $("#profileLocation"),
    profileDescription: $("#profileDescription"),
    quizModal: $("#quizModal"),
    closeQuiz: $("#closeQuiz"),
    quizSticker: $("#quizSticker"),
    quizNumber: $("#quizNumber"),
    quizQuestion: $("#quizQuestion"),
    quizOptions: $("#quizOptions"),
    quizFeedback: $("#quizFeedback"),
    quizCancel: $("#quizCancel"),
    quizRetry: $("#quizRetry"),
    musicButton: $("#musicButton"),
    musicVolume: $("#musicVolume"),
    musicVolumeLabel: $("#musicVolumeLabel"),
    volumePopover: $("#volumePopover"),
    backgroundMusic: $("#backgroundMusic"),
  };

  function defaultState() {
    return { unlocked: [], placed: [], page: 1 };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!stored || !Array.isArray(stored.unlocked) || !Array.isArray(stored.placed)) {
        return defaultState();
      }
      const validIds = new Set(references.map((item) => item.id));
      const unlocked = [...new Set(stored.unlocked.map(Number))].filter((id) => validIds.has(id));
      const placed = [...new Set(stored.placed.map(Number))].filter((id) => validIds.has(id));
      for (const id of placed) if (!unlocked.includes(id)) unlocked.push(id);
      return {
        unlocked,
        placed,
        page: clamp(Number(stored.page) || 1, 1, 12),
      };
    } catch (_error) {
      return defaultState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_error) {
      // The album still works for the current session when browser storage is unavailable.
    }
  }

  function referenceById(id) {
    return references.find((item) => item.id === Number(id));
  }

  function orderedReferences() {
    return [...references].sort((left, right) => left.albumPosition - right.albumPosition);
  }

  function placementFor(stickerId) {
    const reference = referenceById(stickerId);
    if (!reference) return null;
    const position = Number(reference.albumPosition);
    if (position >= 0 && position <= 8) return { page: 2, slot: position };
    if (position >= 9 && position <= 64) {
      const offset = position - 9;
      return { page: 3 + Math.floor(offset / 8), slot: offset % 8 };
    }
    return null;
  }

  function idsForPage(page) {
    return orderedReferences()
      .filter((reference) => placementFor(reference.id)?.page === page)
      .map((reference) => reference.id);
  }

  function slotPosition(page, slotIndex) {
    if (page === 2) return slotIndex === 0 ? topSlot : gridSlots[slotIndex - 1];
    return gridSlots[slotIndex];
  }

  function updateProgress() {
    const unlocked = state.unlocked.length;
    const placed = state.placed.length;
    const collectedPercent = Math.round((unlocked / TOTAL) * 100);
    const placedPercent = Math.round((placed / TOTAL) * 100);

    $("#headerProgress").textContent = `${unlocked}/${TOTAL}`;
    $("#miniProgress i").textContent = collectedPercent;
    $("#miniProgress").style.background = `conic-gradient(var(--yellow) ${collectedPercent}%, rgba(255,255,255,.13) 0)`;
    $("#progressPercent").textContent = `${placedPercent}%`;
    $("#progressRing").style.background = `conic-gradient(var(--yellow) ${placedPercent}%, rgba(255,255,255,.12) 0)`;
    $("#unlockedCount").textContent = unlocked;
    $("#placedCount").textContent = placed;
    $("#statUnlocked").textContent = unlocked;
    $("#statPlaced").textContent = placed;
    $("#statMissing").textContent = TOTAL - unlocked;
  }

  function buildPageStrip() {
    elements.pageStrip.replaceChildren();
    for (let page = 1; page <= 12; page += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "page-thumbnail";
      button.dataset.page = String(page);
      button.setAttribute("aria-label", `Abrir ${pageLabels[page - 1]}`);
      button.innerHTML = `<img src="assets/album/page-${String(page).padStart(2, "0")}.webp" alt="" loading="lazy"><span>${page}</span>`;
      button.addEventListener("click", () => setPage(page));
      elements.pageStrip.append(button);
    }
  }

  function renderPage(direction = "forward") {
    const page = state.page;
    elements.pageCounter.textContent = `${page} / 12`;
    elements.pageEyebrow.textContent = pageLabels[page - 1];
    elements.previousPage.disabled = page === 1;
    elements.nextPage.disabled = page === 12;
    elements.albumPage.classList.remove("is-ready", "turn-forward", "turn-backward");
    elements.albumPage.alt = pageAlts[page - 1];
    elements.albumPage.onload = () => {
      elements.albumPage.classList.add("is-ready", direction === "backward" ? "turn-backward" : "turn-forward");
    };
    elements.albumPage.src = `assets/album/page-${String(page).padStart(2, "0")}.webp`;

    $$(".page-thumbnail", elements.pageStrip).forEach((thumb) => {
      const active = Number(thumb.dataset.page) === page;
      thumb.classList.toggle("is-active", active);
      thumb.setAttribute("aria-current", active ? "page" : "false");
      if (active) {
        const targetLeft = thumb.offsetLeft - (elements.pageStrip.clientWidth - thumb.offsetWidth) / 2;
        elements.pageStrip.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
      }
    });
    renderStickerLayer();
    preloadPage(page - 1);
    preloadPage(page + 1);
  }

  function preloadPage(page) {
    if (page < 1 || page > 12) return;
    const image = new Image();
    image.src = `assets/album/page-${String(page).padStart(2, "0")}.webp`;
  }

  function setPage(page) {
    const next = clamp(Number(page), 1, 12);
    if (next === state.page) return renderStickerLayer();
    const direction = next < state.page ? "backward" : "forward";
    state.page = next;
    saveState();
    renderPage(direction);
  }

  function renderStickerLayer() {
    elements.stickerLayer.replaceChildren();
    const pageIds = idsForPage(state.page);

    pageIds.forEach((id) => {
      const placement = placementFor(id);
      const position = slotPosition(state.page, placement.slot);
      const reference = referenceById(id);
      if (!position) return;
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "album-slot";
      slot.style.left = `${position.left}%`;
      slot.style.top = `${position.top}%`;
      slot.style.width = `${position.width}%`;
      slot.style.height = `${position.height}%`;
      slot.dataset.stickerId = String(id);
      slot.setAttribute("aria-label", `Espaço da Figurinha ${reference.number}`);

      if (state.placed.includes(id)) {
        const image = document.createElement("img");
        image.src = reference.src;
        image.alt = reference.label;
        image.draggable = false;
        slot.append(image);
        slot.classList.add("has-profile");
        slot.setAttribute("aria-label", `Abrir perfil de ${reference.name}`);
        slot.addEventListener("click", () => openProfile(id));
        if (justPasted === id) {
          slot.classList.add("just-pasted");
          window.setTimeout(() => {
            justPasted = null;
            slot.classList.remove("just-pasted");
          }, 800);
        }
      } else if (pasteTarget === id) {
        slot.classList.add("is-target");
        slot.setAttribute("aria-label", `Colar ${referenceById(id).label} neste espaço`);
        slot.addEventListener("click", () => pasteSticker(id));
      }
      elements.stickerLayer.append(slot);
    });
  }

  function renderMiniInventory() {
    elements.miniInventory.replaceChildren();
    const available = state.unlocked.filter((id) => !state.placed.includes(id)).slice(0, 4);
    for (let index = 0; index < 4; index += 1) {
      const item = document.createElement("div");
      const id = available[index];
      item.className = `mini-sticker${id ? "" : " is-empty"}`;
      if (id) {
        const reference = referenceById(id);
        item.innerHTML = `<img src="${reference.src}" alt="${reference.label}">`;
      } else {
        item.textContent = "+";
        item.setAttribute("aria-hidden", "true");
      }
      elements.miniInventory.append(item);
    }
  }

  function inventoryState(id) {
    if (state.placed.includes(id)) return "placed";
    if (state.unlocked.includes(id)) return "available";
    return "missing";
  }

  function inventoryFilterMatches(id) {
    return currentFilter === "all" || inventoryState(id) === currentFilter;
  }

  function renderInventory() {
    const filtered = orderedReferences().filter((item) => inventoryFilterMatches(item.id));
    elements.filterCount.textContent = `${filtered.length} ${filtered.length === 1 ? "figurinha" : "figurinhas"}`;
    elements.inventoryGrid.replaceChildren();

    filtered.forEach((reference) => {
      const itemState = inventoryState(reference.id);
      const placement = placementFor(reference.id);
      const card = document.createElement("article");
      card.className = `sticker-card is-${itemState}`;
      const stateLabel = itemState === "placed" ? "Colada" : itemState === "available" ? "Nova" : "Faltando";
      const image = itemState === "missing" ? "" : `<img src="${reference.src}" alt="${reference.label}" loading="lazy">`;
      const buttonLabel = itemState === "placed" ? "Ver no álbum" : itemState === "available" ? "Colar no álbum" : "Ainda não encontrada";
      const buttonClass = itemState === "placed" ? "sticker-action secondary" : "sticker-action";
      card.innerHTML = `
        <figure>${image}<span class="sticker-state">${stateLabel}</span></figure>
        <div class="sticker-card-content">
          <strong>${reference.label}</strong>
          <small>Página ${placement.page} · espaço ${placement.slot + 1}</small>
          <button class="${buttonClass}" type="button" ${itemState === "missing" ? "disabled" : ""}>${buttonLabel}</button>
        </div>`;
      if (itemState !== "missing") {
        $(".sticker-action", card).addEventListener("click", () => {
          if (itemState === "available") startPaste(reference.id);
          else viewPlacedSticker(reference.id);
        });
      }
      elements.inventoryGrid.append(card);
    });
  }

  function renderAll() {
    updateProgress();
    renderPage("forward");
    renderMiniInventory();
    renderInventory();
  }

  function switchView(view, options = {}) {
    currentView = view === "inventory" ? "inventory" : "album";
    elements.albumView.classList.toggle("is-active", currentView === "album");
    elements.inventoryView.classList.toggle("is-active", currentView === "inventory");
    $$('[data-view="album"]').forEach((button) => button.classList.toggle("is-active", currentView === "album"));
    $$('[data-view="inventory"]').forEach((button) => button.classList.toggle("is-active", currentView === "inventory"));
    if (!options.keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
    if (currentView === "inventory") renderInventory();
  }

  function startPaste(id) {
    const reference = referenceById(id);
    const placement = placementFor(id);
    if (!reference || !placement || state.placed.includes(id)) return;
    pasteTarget = id;
    elements.pasteThumb.src = reference.src;
    elements.pasteThumb.alt = reference.label;
    elements.pasteTitle.textContent = `${reference.label} pronta`;
    elements.pasteBanner.classList.add("is-visible");
    switchView("album");
    setPage(placement.page);
    renderStickerLayer();
    window.setTimeout(() => elements.pageWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function cancelPaste() {
    pasteTarget = null;
    elements.pasteBanner.classList.remove("is-visible");
    renderStickerLayer();
  }

  function pasteSticker(id) {
    if (pasteTarget !== id || state.placed.includes(id)) return;
    openPasteQuiz(id);
  }

  function finalizePasteSticker(id) {
    if (pasteTarget !== id || state.placed.includes(id)) return;
    state.placed.push(id);
    if (!state.unlocked.includes(id)) state.unlocked.push(id);
    justPasted = id;
    saveState();
    cancelPaste();
    renderAll();
    celebrate(36);
    showToast(`${referenceById(id).label} colada no álbum!`, "★");
    window.setTimeout(() => openProfile(id), 280);
  }


  function randomQuizQuestion() {
    const question = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
    const options = question.options.map((text, index) => ({ text, correct: index === question.answer }));
    for (let index = options.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }
    return { ...question, options };
  }

  function renderQuizQuestion(previousQuestion = "") {
    let nextQuestion = randomQuizQuestion();
    if (QUIZ_QUESTIONS.length > 1) {
      let safety = 0;
      while (nextQuestion.question === previousQuestion && safety < 8) {
        nextQuestion = randomQuizQuestion();
        safety += 1;
      }
    }
    currentQuiz = nextQuestion;
    elements.quizQuestion.textContent = currentQuiz.question;
    elements.quizFeedback.hidden = true;
    elements.quizFeedback.className = "quiz-feedback";
    elements.quizFeedback.textContent = "";
    elements.quizRetry.hidden = true;
    elements.quizOptions.replaceChildren();

    currentQuiz.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.dataset.correct = option.correct ? "true" : "false";
      button.innerHTML = `<span>${String.fromCharCode(65 + index)}</span><strong>${option.text}</strong>`;
      button.addEventListener("click", () => answerQuizOption(button, option.correct));
      elements.quizOptions.append(button);
    });
    window.setTimeout(() => $(".quiz-option", elements.quizOptions)?.focus(), 30);
  }

  function openPasteQuiz(id) {
    const reference = referenceById(id);
    if (!reference) return;
    pendingQuizStickerId = id;
    elements.quizSticker.src = reference.src;
    elements.quizSticker.alt = reference.label;
    elements.quizNumber.textContent = `Sticker ${reference.number}`;
    renderQuizQuestion();
    elements.quizModal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeQuiz() {
    elements.quizModal.hidden = true;
    pendingQuizStickerId = null;
    currentQuiz = null;
    elements.quizRetry.hidden = true;
    if (elements.scannerModal.hidden && elements.profileModal.hidden && !isPageFullscreen) document.body.style.overflow = "";
  }

  function cancelQuizAttempt() {
    closeQuiz();
    cancelPaste();
    showToast("Figurinha guardada no inventário. Tente colar depois.", "✓");
  }

  function retryQuizQuestion() {
    const previousQuestion = currentQuiz?.question || "";
    renderQuizQuestion(previousQuestion);
  }

  function answerQuizOption(button, isCorrect) {
    const buttons = $$(".quiz-option", elements.quizOptions);
    elements.quizFeedback.hidden = false;

    if (!isCorrect) {
      buttons.forEach((item) => {
        item.disabled = true;
      });
      button.classList.add("is-wrong");
      elements.quizFeedback.className = "quiz-feedback is-wrong";
      elements.quizFeedback.textContent = "Not yet — click Retry for a new question, or Cancel to try later.";
      elements.quizRetry.hidden = false;
      window.setTimeout(() => elements.quizRetry.focus(), 30);
      return;
    }

    buttons.forEach((item) => {
      item.disabled = true;
      if (item.dataset.correct === "true") item.classList.add("is-correct");
    });
    elements.quizFeedback.className = "quiz-feedback is-correct";
    elements.quizFeedback.textContent = currentQuiz?.note ? `Correct! ${currentQuiz.note}` : "Correct!";
    const stickerId = pendingQuizStickerId;
    window.setTimeout(() => {
      elements.quizModal.hidden = true;
      pendingQuizStickerId = null;
      currentQuiz = null;
      finalizePasteSticker(stickerId);
    }, 650);
  }

  function setMusicVolume(value) {
    const volume = clamp(Number(value) || 0, 0, 100);
    elements.musicVolume.value = String(volume);
    elements.musicVolumeLabel.textContent = `${volume}%`;
    elements.backgroundMusic.volume = volume / 100;
    elements.musicButton.classList.toggle("is-muted", volume === 0);
  }

  function startBackgroundMusic() {
    if (!elements.backgroundMusic) return;
    const playback = elements.backgroundMusic.play();
    if (playback && typeof playback.then === "function") {
      playback
        .then(() => elements.musicButton.classList.add("is-playing"))
        .catch(() => elements.musicButton.classList.remove("is-playing"));
    }
  }

  function toggleVolumePopover() {
    const willOpen = elements.volumePopover.hidden;
    elements.volumePopover.hidden = !willOpen;
    elements.musicButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      startBackgroundMusic();
      window.setTimeout(() => elements.musicVolume.focus(), 30);
    }
  }

  function closeVolumePopover() {
    elements.volumePopover.hidden = true;
    elements.musicButton.setAttribute("aria-expanded", "false");
  }

  function viewPlacedSticker(id) {
    const placement = placementFor(id);
    pasteTarget = null;
    elements.pasteBanner.classList.remove("is-visible");
    switchView("album");
    setPage(placement.page);
    window.setTimeout(() => elements.pageWrap.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }

  function openProfile(id) {
    const reference = referenceById(id);
    const placement = placementFor(id);
    if (!reference || !placement) return;
    if (isPageFullscreen) exitPageFullscreen();
    elements.profileSticker.src = reference.src;
    elements.profileSticker.alt = reference.label;
    elements.profileNumber.textContent = `Figurinha ${reference.number}`;
    elements.profileName.textContent = reference.name;
    elements.profileRole.textContent = reference.role;
    elements.profileAge.textContent = reference.age;
    elements.profileLocation.textContent = `Página ${placement.page} · espaço ${placement.slot + 1}`;
    elements.profileDescription.textContent = reference.description;
    elements.profileModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#closeProfile").focus(), 30);
  }

  function closeProfile() {
    elements.profileModal.hidden = true;
    if (elements.scannerModal.hidden && elements.quizModal.hidden && !isPageFullscreen) document.body.style.overflow = "";
  }

  function enterPageFullscreen() {
    isPageFullscreen = true;
    document.body.classList.add("page-fullscreen-active");
    document.body.style.overflow = "hidden";
    const isTopLevelApp = window.self === window.top;
    if (isTopLevelApp && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    window.setTimeout(() => elements.exitFullscreen.focus(), 80);
  }

  function exitPageFullscreen() {
    isPageFullscreen = false;
    document.body.classList.remove("page-fullscreen-active");
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    if (elements.scannerModal.hidden && elements.profileModal.hidden && elements.quizModal.hidden) document.body.style.overflow = "";
  }

  function openScanner() {
    showScannerStep("source");
    elements.scannerModal.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => $("#closeScanner").focus(), 30);
  }

  function closeScanner() {
    elements.scannerModal.hidden = true;
    if (elements.profileModal.hidden && elements.quizModal.hidden && !isPageFullscreen) document.body.style.overflow = "";
    elements.cameraInput.value = "";
    elements.galleryInput.value = "";
    if (sourceObjectUrl) URL.revokeObjectURL(sourceObjectUrl);
    sourceObjectUrl = null;
    sourceImage = null;
    lastMatch = null;
  }

  function showScannerStep(step) {
    elements.sourceStep.hidden = step !== "source";
    elements.cropStep.hidden = step !== "crop";
    elements.analyzingStep.hidden = step !== "analyzing";
    elements.resultStep.hidden = step !== "result";
    if (step !== "result") elements.resultStep.classList.remove("is-failed");
  }

  function receiveFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Escolha um arquivo de imagem.", "!");
      return;
    }
    if (sourceObjectUrl) URL.revokeObjectURL(sourceObjectUrl);
    sourceObjectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      sourceImage = image;
      crop = { zoom: 1, offsetX: 0, offsetY: 0 };
      elements.zoomRange.value = "1";
      showScannerStep("crop");
      drawCrop();
    };
    image.onerror = () => {
      showToast("Não consegui abrir essa imagem. Tente JPG, PNG ou WEBP.", "!");
      showScannerStep("source");
    };
    image.src = sourceObjectUrl;
  }

  function cropGeometry() {
    if (!sourceImage) return null;
    const canvas = elements.cropCanvas;
    const baseScale = Math.max(canvas.width / sourceImage.naturalWidth, canvas.height / sourceImage.naturalHeight);
    const scale = baseScale * crop.zoom;
    const width = sourceImage.naturalWidth * scale;
    const height = sourceImage.naturalHeight * scale;
    const centerX = (canvas.width - width) / 2;
    const centerY = (canvas.height - height) / 2;
    let x = clamp(centerX + crop.offsetX, canvas.width - width, 0);
    let y = clamp(centerY + crop.offsetY, canvas.height - height, 0);
    crop.offsetX = x - centerX;
    crop.offsetY = y - centerY;
    return { x, y, width, height };
  }

  function drawCrop() {
    if (!sourceImage) return;
    const canvas = elements.cropCanvas;
    const context = canvas.getContext("2d", { alpha: false });
    const geometry = cropGeometry();
    context.fillStyle = "#111827";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(sourceImage, geometry.x, geometry.y, geometry.width, geometry.height);
  }

  function resetFileChoice() {
    elements.cameraInput.value = "";
    elements.galleryInput.value = "";
    showScannerStep("source");
  }

  async function analyzeSticker() {
    if (!sourceImage || !references.length) return;
    showScannerStep("analyzing");
    await wait(760);
    const candidates = createCandidateVariants();
    const scored = references.map((reference) => {
      const score = Math.max(...candidates.map((candidate) => compareFeatures(candidate, reference.features)));
      return { reference, score };
    }).sort((a, b) => b.score - a.score);

    const bestScore = scored[0].score;
    const equivalentMissing = scored.find((result) =>
      result.score >= bestScore - 3 && !state.unlocked.includes(result.reference.id)
    );
    const chosen = state.unlocked.includes(scored[0].reference.id) && equivalentMissing ? equivalentMissing : scored[0];
    lastMatch = { ...chosen, accepted: chosen.score >= PASS_SCORE };

    await wait(260);
    if (lastMatch.accepted && !state.unlocked.includes(lastMatch.reference.id)) {
      state.unlocked.push(lastMatch.reference.id);
      saveState();
      updateProgress();
      renderMiniInventory();
      renderInventory();
      celebrate(44);
    }
    renderMatchResult();
    showScannerStep("result");
    window.setTimeout(() => {
      elements.scoreFill.style.width = `${Math.round(lastMatch.score)}%`;
    }, 60);
  }

  function renderMatchResult() {
    const { reference, score, accepted } = lastMatch;
    const rounded = Math.round(score);
    const alreadyPlaced = state.placed.includes(reference.id);
    const alreadyUnlocked = state.unlocked.includes(reference.id);
    elements.resultStep.classList.toggle("is-failed", !accepted);
    elements.resultIcon.textContent = accepted ? "✓" : "×";
    elements.resultEyebrow.textContent = accepted ? "Figurinha reconhecida" : "Semelhança insuficiente";
    elements.resultTitle.textContent = accepted ? "Match encontrado!" : "Ainda não deu match";
    elements.resultMessage.textContent = accepted
      ? alreadyPlaced
        ? "Essa figurinha já está colada no seu álbum."
        : "A figurinha passou pelo limite de 55% e já entrou no seu inventário."
      : "Ajuste o enquadramento e tente novamente com a figurinha inteira e uma luz mais uniforme.";
    elements.matchedSticker.src = reference.src;
    elements.matchedSticker.alt = reference.label;
    elements.matchedLabel.textContent = reference.label;
    elements.scoreValue.textContent = `${rounded}%`;
    elements.scoreFill.style.width = "0%";
    elements.resultActions.replaceChildren();

    if (accepted) {
      if (!alreadyPlaced) {
        elements.resultActions.append(
          actionButton("Continuar depois", "secondary-button", closeScanner),
          actionButton("Colar agora", "primary-button", () => {
            closeScanner();
            startPaste(reference.id);
          }),
        );
      } else {
        elements.resultActions.append(
          actionButton("Fechar", "secondary-button", closeScanner),
          actionButton("Ver no álbum", "primary-button", () => {
            closeScanner();
            viewPlacedSticker(reference.id);
          }),
        );
      }
      if (alreadyUnlocked && !alreadyPlaced) showToast(`${reference.label} está no inventário.`, "✓");
    } else {
      elements.resultActions.append(
        actionButton("Outra foto", "secondary-button", resetFileChoice),
        actionButton("Reenquadrar", "primary-button", () => showScannerStep("crop")),
      );
    }
  }

  function actionButton(label, className, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", handler);
    return button;
  }

  function createCandidateVariants() {
    const source = elements.cropCanvas;
    const variants = [
      [0, 0, 300, 450],
      [4, 6, 292, 438],
      [7, 10, 286, 430],
      [0, 7, 296, 436],
      [4, 0, 292, 440],
    ];
    return variants.map(([x, y, width, height]) => describeCanvas(source, x, y, width, height));
  }

  function canvasPixels(source, sx, sy, sw, sh, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, sx, sy, sw, sh, 0, 0, width, height);
    return context.getImageData(0, 0, width, height).data;
  }

  function normalizeVector(values) {
    let mean = 0;
    for (const value of values) mean += value;
    mean /= values.length;
    let norm = 0;
    const normalized = new Float32Array(values.length);
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index] - mean;
      normalized[index] = value;
      norm += value * value;
    }
    norm = Math.sqrt(norm);
    if (norm > 1e-7) {
      for (let index = 0; index < normalized.length; index += 1) normalized[index] /= norm;
    }
    return normalized;
  }

  function grayscale(data) {
    const values = new Float32Array(data.length / 4);
    for (let pixel = 0, index = 0; pixel < data.length; pixel += 4, index += 1) {
      const red = data[pixel] / 255;
      const green = data[pixel + 1] / 255;
      const blue = data[pixel + 2] / 255;
      values[index] = red * 0.299 + green * 0.587 + blue * 0.114;
    }
    return values;
  }

  function describeCanvas(source, sx, sy, sw, sh) {
    const base = document.createElement("canvas");
    base.width = 96;
    base.height = 144;
    const baseContext = base.getContext("2d", { willReadFrequently: true });
    baseContext.imageSmoothingEnabled = true;
    baseContext.imageSmoothingQuality = "high";
    baseContext.drawImage(source, sx, sy, sw, sh, 0, 0, 96, 144);

    const smallData = canvasPixels(base, 15, 17, 66, 100, 24, 36);
    const gray = grayscale(smallData);
    const grayNormalized = normalizeVector(gray);
    const edges = new Float32Array(gray.length);
    for (let y = 1; y < 35; y += 1) {
      for (let x = 1; x < 23; x += 1) {
        const index = y * 24 + x;
        const gx = gray[index + 1] - gray[index - 1];
        const gy = gray[index + 24] - gray[index - 24];
        edges[index] = Math.sqrt(gx * gx + gy * gy);
      }
    }
    const edgeNormalized = normalizeVector(edges);

    const coarseData = canvasPixels(base, 15, 17, 66, 100, 12, 18);
    const chromaValues = new Float32Array(12 * 18 * 2);
    for (let pixel = 0, index = 0; pixel < coarseData.length; pixel += 4, index += 2) {
      const red = coarseData[pixel] / 255;
      const green = coarseData[pixel + 1] / 255;
      const blue = coarseData[pixel + 2] / 255;
      const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
      chromaValues[index] = (blue - luminance) * 0.564;
      chromaValues[index + 1] = (red - luminance) * 0.713;
    }
    const chromaNormalized = normalizeVector(chromaValues);

    const mask = new Uint8Array(24 * 36);
    for (let pixel = 0, index = 0; pixel < smallData.length; pixel += 4, index += 1) {
      const red = smallData[pixel] / 255;
      const green = smallData[pixel + 1] / 255;
      const blue = smallData[pixel + 2] / 255;
      const blueBackground = blue > 0.48 && blue > green * 1.12 && green > red * 1.45;
      mask[index] = blueBackground ? 0 : 1;
    }

    const hashData = canvasPixels(base, 15, 17, 66, 100, 9, 8);
    const hashGray = grayscale(hashData);
    const hash = new Uint8Array(64);
    let hashIndex = 0;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        hash[hashIndex] = hashGray[y * 9 + x + 1] >= hashGray[y * 9 + x] ? 1 : 0;
        hashIndex += 1;
      }
    }

    const footerData = canvasPixels(base, 4, 106, 88, 36, 32, 12);
    const footer = normalizeVector(grayscale(footerData));
    return { gray: grayNormalized, edge: edgeNormalized, chroma: chromaNormalized, mask, hash, footer };
  }

  function cosine(candidate, stored) {
    let dot = 0;
    let candidateNorm = 0;
    let storedNorm = 0;
    for (let index = 0; index < candidate.length; index += 1) {
      const left = candidate[index];
      const right = stored[index];
      dot += left * right;
      candidateNorm += left * left;
      storedNorm += right * right;
    }
    return dot / (Math.sqrt(candidateNorm * storedNorm) + 1e-9);
  }

  function compareFeatures(candidate, stored) {
    const gray = cosine(candidate.gray, stored.gray);
    const edge = cosine(candidate.edge, stored.edge);
    const chroma = cosine(candidate.chroma, stored.chroma);
    const footer = cosine(candidate.footer, stored.footer);
    let intersection = 0;
    let union = 0;
    let matchingHash = 0;
    for (let index = 0; index < candidate.mask.length; index += 1) {
      const left = candidate.mask[index] === 1;
      const right = stored.mask[index] === 1;
      if (left && right) intersection += 1;
      if (left || right) union += 1;
    }
    for (let index = 0; index < candidate.hash.length; index += 1) {
      if (candidate.hash[index] === stored.hash[index]) matchingHash += 1;
    }
    const mask = intersection / Math.max(1, union);
    const hash = matchingHash / candidate.hash.length;
    const raw =
      0.27 * ((gray + 1) / 2) +
      0.24 * edge +
      0.14 * ((chroma + 1) / 2) +
      0.08 * hash +
      0.05 * mask +
      0.22 * ((footer + 1) / 2);
    return clamp(((raw - 0.58) / 0.42) * 100, 0, 100);
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function showToast(message, icon = "✓") {
    window.clearTimeout(toastTimer);
    elements.toastMessage.textContent = message;
    elements.toastIcon.textContent = icon;
    elements.toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2900);
  }

  function celebrate(amount = 40) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#ffc400", "#0b9ee8", "#15a95e", "#ffffff", "#e13a53"];
    for (let index = 0; index < amount; index += 1) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[index % colors.length];
      piece.style.setProperty("--duration", `${2.2 + Math.random() * 1.5}s`);
      piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
      piece.style.setProperty("--spin", `${-540 + Math.random() * 1080}deg`);
      piece.style.animationDelay = `${Math.random() * 0.28}s`;
      elements.confetti.append(piece);
      window.setTimeout(() => piece.remove(), 4100);
    }
  }

  function resetAlbum() {
    const confirmed = window.confirm("Recomeçar o álbum? Todas as figurinhas desbloqueadas e coladas serão removidas deste aparelho.");
    if (!confirmed) return;
    state = defaultState();
    pasteTarget = null;
    saveState();
    elements.pasteBanner.classList.remove("is-visible");
    currentFilter = "all";
    $$("[data-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.filter === "all"));
    renderAll();
    switchView("album");
    showToast("Álbum reiniciado.", "↻");
  }

  function bindEvents() {
    elements.previousPage.addEventListener("click", () => setPage(state.page - 1));
    elements.nextPage.addEventListener("click", () => setPage(state.page + 1));
    $("#brandButton").addEventListener("click", () => {
      switchView("album");
      setPage(1);
    });
    $("#progressChip").addEventListener("click", () => switchView("inventory"));
    $("#resetButton").addEventListener("click", resetAlbum);
    elements.musicButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleVolumePopover();
    });
    elements.volumePopover.addEventListener("click", (event) => event.stopPropagation());
    elements.musicVolume.addEventListener("input", () => {
      setMusicVolume(elements.musicVolume.value);
      startBackgroundMusic();
    });
    const unlockMusic = () => startBackgroundMusic();
    document.addEventListener("pointerdown", unlockMusic, { once: true });
    document.addEventListener("keydown", unlockMusic, { once: true });
    document.addEventListener("click", closeVolumePopover);
    $("#cancelPaste").addEventListener("click", cancelPaste);
    elements.closeQuiz.addEventListener("click", closeQuiz);
    elements.quizCancel.addEventListener("click", cancelQuizAttempt);
    elements.quizRetry.addEventListener("click", retryQuizQuestion);
    elements.fullscreenPage.addEventListener("click", enterPageFullscreen);
    elements.exitFullscreen.addEventListener("click", exitPageFullscreen);
    $("#closeProfile").addEventListener("click", closeProfile);
    $("#profileContinue").addEventListener("click", closeProfile);

    $$('[data-view]').forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
    [$("#openScanner"), $("#openScannerInventory"), $("#mobileScanner")].forEach((button) => button.addEventListener("click", openScanner));

    $$("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        $$("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderInventory();
      });
    });

    $("#closeScanner").addEventListener("click", closeScanner);
    $("#chooseAnother").addEventListener("click", resetFileChoice);
    $("#analyzeSticker").addEventListener("click", analyzeSticker);
    elements.cameraInput.addEventListener("change", (event) => receiveFile(event.target.files[0]));
    elements.galleryInput.addEventListener("change", (event) => receiveFile(event.target.files[0]));
    elements.zoomRange.addEventListener("input", () => {
      crop.zoom = Number(elements.zoomRange.value);
      drawCrop();
    });

    elements.cropStage.addEventListener("pointerdown", (event) => {
      if (!sourceImage) return;
      elements.cropStage.setPointerCapture(event.pointerId);
      pointerDrag = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        offsetX: crop.offsetX,
        offsetY: crop.offsetY,
      };
    });
    elements.cropStage.addEventListener("pointermove", (event) => {
      if (!pointerDrag || pointerDrag.id !== event.pointerId) return;
      const scale = elements.cropCanvas.width / elements.cropStage.clientWidth;
      crop.offsetX = pointerDrag.offsetX + (event.clientX - pointerDrag.x) * scale;
      crop.offsetY = pointerDrag.offsetY + (event.clientY - pointerDrag.y) * scale;
      drawCrop();
    });
    const endPointer = (event) => {
      if (pointerDrag && pointerDrag.id === event.pointerId) pointerDrag = null;
    };
    elements.cropStage.addEventListener("pointerup", endPointer);
    elements.cropStage.addEventListener("pointercancel", endPointer);
    elements.cropStage.addEventListener("wheel", (event) => {
      event.preventDefault();
      crop.zoom = clamp(crop.zoom + (event.deltaY > 0 ? -0.08 : 0.08), 1, 3);
      elements.zoomRange.value = String(crop.zoom);
      drawCrop();
    }, { passive: false });

    elements.pageWrap.addEventListener("pointerdown", (event) => {
      if (pasteTarget) return;
      pageSwipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    elements.pageWrap.addEventListener("pointerup", (event) => {
      if (!pageSwipe || pageSwipe.id !== event.pointerId || pasteTarget) return;
      const dx = event.clientX - pageSwipe.x;
      const dy = event.clientY - pageSwipe.y;
      pageSwipe = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) setPage(state.page + (dx < 0 ? 1 : -1));
    });

    elements.scannerModal.addEventListener("click", (event) => {
      if (event.target === elements.scannerModal) closeScanner();
    });
    elements.profileModal.addEventListener("click", (event) => {
      if (event.target === elements.profileModal) closeProfile();
    });
    elements.quizModal.addEventListener("click", (event) => {
      if (event.target === elements.quizModal) closeQuiz();
    });
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && isPageFullscreen) exitPageFullscreen();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.quizModal.hidden) return closeQuiz();
      if (event.key === "Escape" && !elements.profileModal.hidden) return closeProfile();
      if (event.key === "Escape" && !elements.scannerModal.hidden) return closeScanner();
      if (event.key === "Escape" && isPageFullscreen) return exitPageFullscreen();
      if (!elements.scannerModal.hidden || currentView !== "album") return;
      if (event.key === "ArrowLeft") setPage(state.page - 1);
      if (event.key === "ArrowRight") setPage(state.page + 1);
    });
  }

  function initialize() {
    setMusicVolume(DEFAULT_MUSIC_VOLUME);
    buildPageStrip();
    bindEvents();
    renderAll();
    switchView("album", { keepScroll: true });
  }

  initialize();

  // A tiny local test surface helps verify matching without any network access.
  window.__WORLD_STARS_ALBUM__ = {
    getState: () => JSON.parse(JSON.stringify(state)),
    compareFeatures,
    describeCanvas,
    passScore: PASS_SCORE,
  };
})();
