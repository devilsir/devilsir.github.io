import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
const museumData = window.museumData;
if (!museumData) throw new Error("Lilith museum data failed to load.");

const canvas = document.querySelector("#museum-canvas");
const intro = document.querySelector("#intro");
const enterButton = document.querySelector("#enter-button");
const hud = document.querySelector("#hud");
const reticle = document.querySelector("#reticle");
const roomCard = document.querySelector("#room-card");
const roomKicker = document.querySelector("#room-kicker");
const roomTitle = document.querySelector("#room-title");
const roomDescription = document.querySelector("#room-description");
const roomDate = document.querySelector("#room-date");
const artworkCard = document.querySelector("#artwork-card");
const artworkCardKicker = document.querySelector("#artwork-card-kicker");
const artworkCardTitle = document.querySelector("#artwork-card-title");
const artworkCardDate = document.querySelector("#artwork-card-date");
const starProgress = document.querySelector("#star-progress");
const starCount = document.querySelector("#star-count");
const interactionPrompt = document.querySelector("#interaction-prompt");
const interactionText = document.querySelector("#interaction-text");
const memoryReveal = document.querySelector("#memory-reveal");
const memoryNumber = document.querySelector("#memory-number");
const memoryTitle = document.querySelector("#memory-title");
const memoryMessage = document.querySelector("#memory-message");
const artworkModal = document.querySelector("#artwork-modal");
const artworkImage = document.querySelector("#artwork-image");
const artworkDate = document.querySelector("#artwork-date");
const artworkTitle = document.querySelector("#artwork-title");
const artworkCaption = document.querySelector("#artwork-caption");
const artworkMemory = document.querySelector("#artwork-memory");
const favoriteButton = document.querySelector("#favorite-button");
const audioButton = document.querySelector("#audio-button");
const fullscreenImageButton = document.querySelector("#fullscreen-image-button");
const archiveModal = document.querySelector("#archive-modal");
const archiveGrid = document.querySelector("#archive-grid");
const archiveCount = document.querySelector("#archive-count");
const letterModal = document.querySelector("#letter-modal");
const letterContent = document.querySelector("#letter-content");
const gardenModal = document.querySelector("#garden-modal");
const gardenForm = document.querySelector("#garden-form");
const gardenMessage = document.querySelector("#garden-message");
const gardenMessages = document.querySelector("#garden-messages");
const messageCount = document.querySelector("#message-count");
const helpModal = document.querySelector("#help-modal");
const helpButton = document.querySelector("#help-button");
const soundButton = document.querySelector("#sound-button");
const brightnessButton = document.querySelector("#brightness-button");
const toast = document.querySelector("#toast");
const finalOverlay = document.querySelector("#final-overlay");
const lookSkyButton = document.querySelector("#look-sky-button");
const skyMessage = document.querySelector("#sky-message");
const returnButton = document.querySelector("#return-button");
const mobileControls = document.querySelector("#mobile-controls");
const mobileInteract = document.querySelector("#mobile-interact");
const loadingScreen = document.querySelector("#loading-screen");
const loadingKicker = document.querySelector("#loading-kicker");
const loadingTitle = document.querySelector("#loading-title");
const loadingStatus = document.querySelector("#loading-status");
const loadingProgress = document.querySelector("#loading-progress");
const languageButton = document.querySelector("#language-button");
const worldLabelLayer = document.querySelector("#world-label-layer");

const STORAGE = {
  stars: "lilith-museum-stars-v1",
  favorites: "lilith-museum-favorites-v1",
  garden: "lilith-museum-garden-v1",
  language: "lilith-museum-language-v1"
};

const isTouch = window.matchMedia("(pointer: coarse)").matches;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17121d);
scene.fog = new THREE.FogExp2(0x17111d, 0.011);

const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.05, 160);
camera.position.set(0, 1.65, -4.2);
camera.rotation.order = "YXZ";
camera.rotation.y = Math.PI;

const lowPowerDevice = isTouch || (navigator.deviceMemory && navigator.deviceMemory <= 4) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
let pixelRatioCap = lowPowerDevice ? .78 : .92;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPowerDevice, powerPreference: "high-performance", precision: "highp", stencil: false, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatioCap));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.62;
renderer.shadowMap.enabled = false;

const localizedCanvasBindings = [];
const worldLabels = [];
const tempProjectedLabelPosition = new THREE.Vector3();

function normalizeLabelLines(lines) {
  return (lines || []).map((entry) => typeof entry === "string" ? { text: entry } : entry);
}

function worldLabelLinesToHtml(lines) {
  return normalizeLabelLines(lines).map((cfg, index) => {
    const styleBits = [];
    if (cfg.color) styleBits.push(`color:${cfg.color}`);
    if (cfg.italic) styleBits.push('font-style:italic');
    if (cfg.weight) styleBits.push(`font-weight:${cfg.weight}`);
    return `<div class="world-label__line world-label__line--${index}" style="${styleBits.join(';')}">${cfg.text}</div>`;
  }).join('');
}

function registerWorldLabel({ kind = "scene", linesByLang, position = null, getPosition = null, maxDistance = 16, offsetY = 0, scaleNear = 1, scaleFar = .82 }) {
  if (!worldLabelLayer) return null;
  const el = document.createElement('div');
  el.className = `world-label world-label--${kind}`;
  worldLabelLayer.appendChild(el);
  const label = { el, kind, linesByLang, position, getPosition, maxDistance, offsetY, scaleNear, scaleFar };
  worldLabels.push(label);
  refreshWorldLabelContent(label);
  return label;
}

function refreshWorldLabelContent(label) {
  const lines = label.linesByLang?.[currentLang] || label.linesByLang?.en || [];
  label.el.innerHTML = worldLabelLinesToHtml(lines);
}

function refreshWorldLabels() {
  worldLabels.forEach(refreshWorldLabelContent);
}

function updateWorldLabels() {
  if (!worldLabels.length || !started) {
    worldLabels.forEach((label) => { label.el.style.opacity = '0'; });
    return;
  }
  const halfW = innerWidth * .5;
  const halfH = innerHeight * .5;
  worldLabels.forEach((label) => {
    const point = label.getPosition ? label.getPosition() : label.position;
    if (!point) { label.el.style.opacity = '0'; return; }
    tempProjectedLabelPosition.copy(point);
    tempProjectedLabelPosition.y += label.offsetY;
    const distance = camera.position.distanceTo(tempProjectedLabelPosition);
    if (distance > label.maxDistance) { label.el.style.opacity = '0'; return; }
    tempProjectedLabelPosition.project(camera);
    if (tempProjectedLabelPosition.z < -1 || tempProjectedLabelPosition.z > 1 || Math.abs(tempProjectedLabelPosition.x) > 1.18 || Math.abs(tempProjectedLabelPosition.y) > 1.18) {
      label.el.style.opacity = '0';
      return;
    }
    const x = tempProjectedLabelPosition.x * halfW + halfW;
    const y = -tempProjectedLabelPosition.y * halfH + halfH;
    const t = Math.min(1, distance / label.maxDistance);
    const scale = label.scaleNear + (label.scaleFar - label.scaleNear) * t;
    const opacity = Math.max(.2, 1 - t * .8);
    label.el.style.opacity = `${opacity}`;
    label.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%) scale(${scale.toFixed(3)})`;
  });
}
const ROOM_TEXTS = {
  en: museumData.roomTexts,
  pt: {
    entrance: { kicker: "Hall de Entrada", title: "O Pequeno Museu da Lilith", description: "Ela chegou numa sexta-feira 13, como se o universo já soubesse que ela seria inesquecível." },
    beginnings: { kicker: "Sala dos Começos", title: "Sala dos Começos", description: "Uma data rara virou o início de algo extraordinariamente bonito." },
    everyday: { kicker: "Magia Cotidiana", title: "A Magia dos Dias Comuns", description: "Na época, pareciam momentos comuns. Agora são tesouros." },
    portraits: { kicker: "Galeria de Retratos", title: "Retratos da Lilith", description: "Uma coleção de olhares, silêncios e presenças que ainda brilham." },
    garden: { kicker: "Jardim das Memórias", title: "Jardim das Memórias", description: "Deixe uma luz para a Lilith. Cada mensagem vira uma nova estrela no céu." },
    final: { kicker: "Sala Final", title: "Amada para sempre. Esquecida jamais.", description: "A vida dela não foi só o tempo entre duas datas. Foi todo amor guardado entre elas." },
    thirteenth: { kicker: "Memorial Privado", title: "A Décima Terceira Sala", description: "Algumas vidas são medidas em anos. Outras, pela profundidade com que nos mudam." }
  }
};
const ROOM_DATES = {
  pt: {
    entrance: "13 de dezembro de 2019 — 27 de maio de 2026",
    beginnings: "Começos • desde 13 de dezembro de 2019",
    everyday: "Memórias de uma vida inteira",
    portraits: "Retratos e momentos preservados",
    garden: "Luzes deixadas em memória da Lilith",
    final: "13 de dezembro de 2019 — 27 de maio de 2026",
    thirteenth: "13 de dezembro de 2019 — 27 de maio de 2026"
  },
  en: {
    entrance: "December 13, 2019 — May 27, 2026",
    beginnings: "Beginnings • since December 13, 2019",
    everyday: "Memories from a whole life",
    portraits: "Portraits and moments preserved",
    garden: "Lights left in Lilith’s memory",
    final: "December 13, 2019 — May 27, 2026",
    thirteenth: "December 13, 2019 — May 27, 2026"
  }
};

const I18N = {
  pt: {
    loadingKicker: "Preparando o museu", loadingTitle: "Carregando memórias da Lilith", loadingStatus: "Organizando fotos, luzes e modelos…", loadingOptimizing: "Fixando luzes, sombras e reflexos…", loadingReady: "Tudo pronto.",
    introFor: "Para Lilith", introPoem: "Nascida sob um céu de sexta-feira.<br />Amada em todas as estações.<br />Lembrada para sempre.", introDates: "13 de dezembro de 2019 — 27 de maio de 2026", introSubtitle: "Um pequeno lugar para um amor imenso.", introEnter: "Entrar no Museu da Lilith", introSignature: "Um pequeno museu para um amor grande demais para desaparecer.",
    hudTitle: "O Pequeno Museu da Lilith", hudDates: "13 de dezembro de 2019 — 27 de maio de 2026", starProgressLabel: "memórias encontradas",
    controlsTitle: "Visite com calma o museu", controlsEyebrow: "Como visitar", controlsWalk: "Andar", controlsLook: "Olhar ao redor", controlsInteract: "Interagir", controlsRelease: "Soltar o cursor", controlsNote: "No celular, arraste para olhar e use os controles na tela.",
    brightnessTitles: ["Luz cinematográfica", "Luz equilibrada", "Luz intensa"], soundToggle: "Ativar ou desativar som", helpTitle: "Controles", languageLabel: "Idioma",
    interact: "Interagir", viewMemory: "Ver memória", discoverMemory: "Descobrir memória", rememberStar: "Relembrar esta estrela", leaveLight: "Deixar uma luz para Lilith", readLetter: "Ler a carta", openArchive: "Abrir o arquivo completo de fotos", petCat: (name) => `Fazer carinho em ${name}`, enterThirteenth: "Entrar na Décima Terceira Sala", starsRemaining: (n) => `Encontre ${n} ${n === 1 ? "estrela" : "estrelas"} ${n === 1 ? "a mais" : "a mais"}`,
    thirteenthOpen: "A Décima Terceira Sala foi aberta.", thirteenthAlreadyOpen: "A Décima Terceira Sala está aberta.", memoryRemainingToast: (n) => `Falta${n===1?'':'m'} ${n} ${n===1?'estrela de memória':'estrelas de memória'}.`, petToast: (name) => `Você fez carinho em ${name}.`,
    memoryNumber: (i) => `Memória ${String(i + 1).padStart(2, "0")} de 13`, keepExploring: "Continuar explorando",
    archiveEyebrow: "Coleção completa", archiveTitle: "Arquivo de Fotos da Lilith", archiveIntro: "Todas as fotografias das coleções enviadas estão preservadas aqui. Selecione uma para vê-la em detalhe.", archiveCount: (n) => `${n} ${n === 1 ? "fotografia" : "fotografias"}`,
    viewHighRes: "Ver em alta resolução", addFavorite: "♡ Adicionar aos favoritos", favoriteSaved: "♥ Salvo nos favoritos", playAudio: "Tocar áudio da memória", stopAudio: "Parar áudio", audioError: "Não foi possível reproduzir o arquivo de áudio.",
    letterEyebrow: "A Décima Terceira Sala", letterTitle: "Uma carta para Lilith", letterContent: `Querida Lilith,
Ainda existem momentos em que eu espero te ver no seu lugar favorito. A casa mudou quando você partiu, mas o amor que você criou continua em todo canto. Obrigado por cada dia comum que virou especial simplesmente porque você estava ali.`,
    gardenEyebrow: "Jardim das Memórias", gardenTitle: "Deixe uma luz para Lilith", gardenIntro: "Cada mensagem vira uma nova estrela brilhante no céu do jardim. Ela fica salva neste dispositivo.", gardenLabel: "Sua mensagem", gardenPlaceholder: "Obrigada por ter me escolhido.", placeStar: "Colocar estrela", emptyGarden: "Nenhuma luz foi deixada ainda. A primeira pode ser a sua.", gardenToast: "Uma nova estrela colorida está pulsando no céu da Lilith.",
    finalName: "Lilith", finalDates: "13 de dezembro de 2019 — 27 de maio de 2026", finalParagraph1: "Você esteve aqui.<br />Foi amada.<br />Mudou tudo.<br />E nada pode apagar isso.", finalParagraph2: "A vida dela não foi só o tempo entre duas datas.<br />Foi todo momento de amor guardado entre elas.", finalStrong: "Amada para sempre. Esquecida jamais.", lookSky: "Olhar para o céu", skyMessage: "Boa noite, Lilith.<br />A luz que você deixou ainda está aqui.", returnBeginning: "Voltar ao começo",
    sceneEntrancePhrase: "Um pequeno museu para um amor grande demais para desaparecer.", sceneBeginningsTitle: "Sala dos Começos", sceneBeginningsSubtitle: "Uma data rara virou o início de algo extraordinariamente bonito.", sceneEverydayTitle: "A Magia dos Dias Comuns", sceneEverydaySubtitle: "Na época, pareciam momentos comuns. Agora são tesouros.", scenePortraitsTitle: "Retratos da Lilith", scenePortraitsSubtitle: "Completamente ela.", sceneFinalName: "Lilith", sceneThirteenth1: "Algumas vidas são medidas em anos.", sceneThirteenth2: "Outras, pela profundidade com que nos mudam.", sceneThirteenth3: "Lilith  ·  13 de dezembro de 2019 — 27 de maio de 2026", labelReadLetter: "Ler a carta", labelLeaveLight: "Deixar uma luz", labelArchive: "Arquivo completo de fotos"
  },
  en: {
    loadingKicker: "Preparing the museum", loadingTitle: "Loading Lilith’s memories", loadingStatus: "Arranging photos, lights, and models…", loadingOptimizing: "Locking lights, shadows, and reflections…", loadingReady: "Everything is ready.",
    introFor: "For Lilith", introPoem: "Born beneath a Friday night sky.<br />Loved through every season.<br />Remembered forever.", introDates: "December 13, 2019 — May 27, 2026", introSubtitle: "A small place for a very big love.", introEnter: "Enter Lilith’s Museum", introSignature: "A small museum for a love too large to disappear.",
    hudTitle: "The Little Museum of Lilith", hudDates: "December 13, 2019 — May 27, 2026", starProgressLabel: "memories found",
    controlsTitle: "Move gently through the museum", controlsEyebrow: "How to visit", controlsWalk: "Walk", controlsLook: "Look around", controlsInteract: "Interact", controlsRelease: "Release cursor", controlsNote: "On touch devices, drag to look and use the on-screen controls.",
    brightnessTitles: ["Cinematic light", "Balanced light", "Bright light"], soundToggle: "Toggle sound", helpTitle: "Controls", languageLabel: "Language",
    interact: "Interact", viewMemory: "View memory", discoverMemory: "Discover memory", rememberStar: "Remember this star", leaveLight: "Leave a light for Lilith", readLetter: "Read the letter", openArchive: "Open the complete photo archive", petCat: (name) => `Pet ${name}`, enterThirteenth: "Enter the Thirteenth Room", starsRemaining: (n) => `Find ${n} more ${n === 1 ? "star" : "stars"}`,
    thirteenthOpen: "The Thirteenth Room has opened.", thirteenthAlreadyOpen: "The Thirteenth Room is open.", memoryRemainingToast: (n) => `${n} memory ${n === 1 ? "star remains" : "stars remain"}.`, petToast: (name) => `You pet ${name}.`,
    memoryNumber: (i) => `Memory ${String(i + 1).padStart(2, "0")} of 13`, keepExploring: "Keep exploring",
    archiveEyebrow: "Complete Collection", archiveTitle: "Lilith’s Photo Archive", archiveIntro: "Every photograph from the supplied collections is preserved here. Select one to see it in detail.", archiveCount: (n) => `${n} ${n === 1 ? "photograph" : "photographs"}`,
    viewHighRes: "View high resolution", addFavorite: "♡ Add to favorites", favoriteSaved: "♥ Saved to favorites", playAudio: "Play memory audio", stopAudio: "Stop audio", audioError: "The audio file could not be played.",
    letterEyebrow: "The Thirteenth Room", letterTitle: "A letter for Lilith", letterContent: museumData.personalLetter,
    gardenEyebrow: "Garden of Memories", gardenTitle: "Leave a light for Lilith", gardenIntro: "Every message becomes a new glowing star in the garden sky. It stays on this device.", gardenLabel: "Your message", gardenPlaceholder: "Thank you for choosing me.", placeStar: "Place a star", emptyGarden: "No lights placed yet. The first one can be yours.", gardenToast: "A colorful new star is pulsing in Lilith’s sky.",
    finalName: "Lilith", finalDates: "December 13, 2019 — May 27, 2026", finalParagraph1: "You were here.<br />You were loved.<br />You changed everything.<br />And nothing can erase that.", finalParagraph2: "Your life was not only the time between two dates.<br />It was every moment of love held between them.", finalStrong: "Loved forever. Forgotten never.", lookSky: "Look at the Sky", skyMessage: "Goodnight, Lilith.<br />The light you left behind is still here.", returnBeginning: "Return to the Beginning",
    sceneEntrancePhrase: "A small museum for a love too large to disappear.", sceneBeginningsTitle: "Room of Beginnings", sceneBeginningsSubtitle: "A rare date became the beginning of something extraordinarily beautiful.", sceneEverydayTitle: "The Magic of Ordinary Days", sceneEverydaySubtitle: "At the time, they seemed like ordinary moments. Now they are treasures.", scenePortraitsTitle: "Portraits of Lilith", scenePortraitsSubtitle: "Completely herself.", sceneFinalName: "Lilith", sceneThirteenth1: "Some lives are measured in years.", sceneThirteenth2: "Others are measured by how deeply they change us.", sceneThirteenth3: `Lilith  ·  ${museumData.identity.dates}`, labelReadLetter: "Read the letter", labelLeaveLight: "Leave a light", labelArchive: "Complete photo archive"
  }
};
let currentLang = localStorage.getItem(STORAGE.language) || "pt";
function langPack() { return I18N[currentLang] || I18N.pt; }
function bindLocalizedCanvas(mesh, factory) { localizedCanvasBindings.push({ mesh, factory }); refreshLocalizedCanvasBinding({ mesh, factory }); return mesh; }
function refreshLocalizedCanvasBinding(binding) {
  const texture = textCanvasTexture(binding.factory(currentLang));
  if (binding.mesh.material.map) binding.mesh.material.map.dispose();
  binding.mesh.material.map = texture;
  binding.mesh.material.needsUpdate = true;
}
function refreshLocalizedCanvases() { localizedCanvasBindings.forEach(refreshLocalizedCanvasBinding); }
function setHTML(selector, value) { const el = document.querySelector(selector); if (el) el.innerHTML = value; }
function setText(selector, value) { const el = document.querySelector(selector); if (el) el.textContent = value; }
function setButtonText(selector, value) { const el = document.querySelector(selector); if (el) el.textContent = value; }
let bootReady = false;
let shadowMapsFrozen = false;
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const gltfLoader = new GLTFLoader(loadingManager);
const controls = new PointerLockControls(camera, document.body);
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
raycaster.far = 4.6;

const keys = { forward: false, backward: false, left: false, right: false };
const interactionMeshes = [];
const animatedStars = [];
const decorativeParticles = [];
const fireflies = [];
let fireflySystem = null;
let gardenGrass = null;
const lightStripTransforms = [];
const flowerInstanceData = { stems: [], lightPetals: [], darkPetals: [], centers: [] };
let flowerMeshes = [];
let candleSystem = null;
let lightStripMesh = null;
let blobShadowTexture = null;
const butterflies = [];
const gardenCompanions = [];
const gardenUserStars = [];
const ceilingMeshes = [];
const finalConstellationStars = [];
const favorites = new Set(JSON.parse(localStorage.getItem(STORAGE.favorites) || "[]"));
const foundStars = new Set(JSON.parse(localStorage.getItem(STORAGE.stars) || "[]"));
const gardenNotes = JSON.parse(localStorage.getItem(STORAGE.garden) || "[]");

let activeInteraction = null;
let currentArtwork = null;
let currentRoom = null;
let roomCardTimer = null;
let started = false;
let modalOpen = false;
let finalSequenceStarted = false;
let skySequenceStarted = false;
let secretDoor = null;
let secretDoorLight = null;
let finalPortrait = null;
let finalPortraitLight = null;
let finalCeiling = null;
let constellationLine = null;
let currentAudio = null;
let toastTimer = null;
let interactionCheckTimer = 0;
let roomCheckTimer = 0;
let performanceFrames = 0;
let performanceWindow = 0;
let archiveRendered = false;
const brightnessLevels = [1.42, 1.62, 1.82];
let brightnessLevel = Number(localStorage.getItem("lilith-museum-brightness") ?? 1);
if (!Number.isInteger(brightnessLevel) || brightnessLevel < 0 || brightnessLevel >= brightnessLevels.length) brightnessLevel = 1;
renderer.toneMappingExposure = brightnessLevels[brightnessLevel];

const walkableRects = [
  { id: "entrance", minX: -7, maxX: 7, minZ: -7, maxZ: 7 },
  { id: "beginnings", minX: -25, maxX: -9, minZ: -7, maxZ: 7 },
  { id: "left-corridor", minX: -9.2, maxX: -6.8, minZ: -2, maxZ: 2 },
  { id: "everyday", minX: 9, maxX: 25, minZ: -7, maxZ: 7 },
  { id: "right-corridor", minX: 6.8, maxX: 9.2, minZ: -2, maxZ: 2 },
  { id: "portraits", minX: -10, maxX: 10, minZ: -27, maxZ: -11 },
  { id: "portrait-corridor", minX: -2, maxX: 2, minZ: -11.2, maxZ: -6.8 },
  { id: "garden", minX: -13, maxX: 13, minZ: -49, maxZ: -31 },
  { id: "garden-corridor", minX: -2, maxX: 2, minZ: -31.2, maxZ: -26.8 },
  { id: "final", minX: -9, maxX: 9, minZ: -69, maxZ: -53 },
  { id: "final-corridor", minX: -2, maxX: 2, minZ: -53.2, maxZ: -48.8 }
];

const staticCollisionCircles = [];
const companionCollisionRadius = 0.48;
const gardenBounds = { minX: -13, maxX: 13, minZ: -49, maxZ: -31 };

const roomZones = [
  { id: "beginnings", minX: -25, maxX: -9, minZ: -7, maxZ: 7 },
  { id: "everyday", minX: 9, maxX: 25, minZ: -7, maxZ: 7 },
  { id: "portraits", minX: -10, maxX: 10, minZ: -27, maxZ: -11 },
  { id: "garden", minX: -13, maxX: 13, minZ: -49, maxZ: -31 },
  { id: "final", minX: -9, maxX: 9, minZ: -69, maxZ: -53 },
  { id: "thirteenth", minX: 31, maxX: 47, minZ: -7, maxZ: 7 },
  { id: "entrance", minX: -7, maxX: 7, minZ: -7, maxZ: 7 }
];

const palette = {
  gold: 0xd7b46a,
  goldSoft: 0xf1dc9d,
  violet: 0x43265d,
  violetDeep: 0x241532,
  wall: 0x302735,
  wallWarm: 0x3a2b31,
  floor: 0x1b161d,
  cream: 0xe9dfcf,
  black: 0x050407
};

function updateLoadingProgress(loaded = 0, total = 1, label = null) {
  const strings = langPack();
  if (loadingKicker) loadingKicker.textContent = strings.loadingKicker;
  if (loadingTitle) loadingTitle.textContent = strings.loadingTitle;
  if (loadingStatus) loadingStatus.textContent = label || strings.loadingStatus;
  const ratio = total > 0 ? Math.max(.06, Math.min(1, loaded / total)) : .06;
  if (loadingProgress) loadingProgress.style.width = `${Math.round(ratio * 100)}%`;
}

async function finalizeBootScene() {
  if (bootReady) return;
  updateLoadingProgress(1, 1, langPack().loadingOptimizing);
  try {
    if (renderer.compileAsync) {
      await Promise.race([
        renderer.compileAsync(scene, camera),
        new Promise((resolve) => setTimeout(resolve, 4500))
      ]);
    } else renderer.compile(scene, camera);
  } catch (error) {
    console.warn("Shader warmup was not available.", error);
  }
  renderer.render(scene, camera);
  renderer.render(scene, camera);
  bootReady = true;
  if (enterButton) enterButton.disabled = false;
  updateLoadingProgress(1, 1, langPack().loadingReady);
  setTimeout(() => loadingScreen?.classList.add("is-hidden"), 220);
}

loadingManager.onStart = () => {
  updateLoadingProgress(0, 1, langPack().loadingStatus);
};
loadingManager.onProgress = (_url, loaded, total) => {
  updateLoadingProgress(loaded, total, langPack().loadingStatus);
};
loadingManager.onLoad = () => {
  requestAnimationFrame(() => finalizeBootScene());
};

function applyLanguage() {
  const strings = langPack();
  document.documentElement.lang = currentLang === "pt" ? "pt-BR" : "en";
  if (languageButton) { languageButton.textContent = currentLang.toUpperCase(); languageButton.title = strings.languageLabel; languageButton.setAttribute("aria-label", strings.languageLabel); }
  updateLoadingProgress(loadingProgress?.style.width ? parseFloat(loadingProgress.style.width) / 100 : 0, 1, bootReady ? strings.loadingReady : langPack().loadingStatus);
  setText('.intro-step.step-1', strings.introFor);
  setHTML('.intro-step.step-2', strings.introPoem);
  setText('.intro-step.step-3', strings.introDates);
  setText('.intro-step.step-4', strings.introSubtitle);
  setButtonText('#enter-button', strings.introEnter);
  setText('.intro-signature', strings.introSignature);
  setText('.hud-title', strings.hudTitle);
  setText('.hud-dates', strings.hudDates);
  const bp = document.querySelector('#brightness-button');
  if (bp) { bp.title = strings.brightnessTitles[brightnessLevel]; bp.setAttribute('aria-label', strings.brightnessTitles[brightnessLevel]); }
  if (soundButton) { soundButton.title = strings.soundToggle; soundButton.setAttribute('aria-label', strings.soundToggle); }
  if (helpButton) { helpButton.title = strings.helpTitle; helpButton.setAttribute('aria-label', strings.helpTitle); }
  const spl = document.querySelector('.star-progress-label'); if (spl) spl.textContent = strings.starProgressLabel;
  const roomTexts = ROOM_TEXTS[currentLang] || ROOM_TEXTS.en;
  if (currentRoom && roomTexts[currentRoom]) {
    roomKicker.textContent = roomTexts[currentRoom].kicker;
    roomTitle.textContent = roomTexts[currentRoom].title;
    roomDescription.textContent = roomTexts[currentRoom].description;
    roomDate.textContent = (ROOM_DATES[currentLang] || ROOM_DATES.pt)[currentRoom] || "";
  }
  setButtonText('#memory-reveal .secondary-button', strings.keepExploring);
  setText('#archive-modal .eyebrow', strings.archiveEyebrow);
  setText('#archive-title', strings.archiveTitle);
  setText('.archive-intro', strings.archiveIntro);
  setText('#letter-modal .eyebrow', strings.letterEyebrow);
  setText('#letter-title', strings.letterTitle);
  letterContent.textContent = strings.letterContent;
  setText('#garden-modal .eyebrow', strings.gardenEyebrow);
  setText('#garden-title', strings.gardenTitle);
  const gardenIntro = document.querySelector('#garden-modal h2 + p'); if (gardenIntro) gardenIntro.textContent = strings.gardenIntro;
  const gardenLabel = document.querySelector('label[for="garden-message"]'); if (gardenLabel) gardenLabel.textContent = strings.gardenLabel;
  if (gardenMessage) gardenMessage.placeholder = strings.gardenPlaceholder;
  setButtonText('#garden-form .primary-button', strings.placeStar);
  setText('#help-modal .eyebrow', strings.controlsEyebrow);
  setText('#help-title', strings.controlsTitle);
  const controlsText = document.querySelectorAll('.controls-grid p');
  if (controlsText[0]) controlsText[0].textContent = strings.controlsWalk;
  if (controlsText[1]) controlsText[1].textContent = strings.controlsLook;
  if (controlsText[2]) controlsText[2].textContent = strings.controlsInteract;
  if (controlsText[3]) controlsText[3].textContent = strings.controlsRelease;
  const note = document.querySelector('.small-note'); if (note) note.textContent = strings.controlsNote;
  setText('.final-name', strings.finalName);
  setText('.final-dates', strings.finalDates);
  const finalParas = document.querySelectorAll('.final-lines p');
  if (finalParas[0]) finalParas[0].innerHTML = strings.finalParagraph1;
  if (finalParas[1]) finalParas[1].innerHTML = strings.finalParagraph2;
  const finalStrong = document.querySelector('.final-lines strong'); if (finalStrong) finalStrong.textContent = strings.finalStrong;
  setButtonText('#look-sky-button', strings.lookSky);
  setHTML('#sky-message p', strings.skyMessage);
  setButtonText('#return-button', strings.returnBeginning);
  if (archiveRendered) archiveCount.textContent = strings.archiveCount((museumData.photoArchive || []).length);
  if (currentArtwork) populateArtworkModal(currentArtwork);
  renderGardenMessages();
  refreshLocalizedCanvases();
  refreshWorldLabels();
  updateInteractionPrompt();
}


const PT_EXACT_TRANSLATIONS = new Map([
  ["A small museum for a love too large to disappear.", "Um pequeno museu para um amor grande demais para desaparecer."],
  ["She arrived on a Friday the 13th, as if the universe already knew she would be unforgettable.", "Ela chegou numa sexta-feira 13, como se o universo já soubesse que seria inesquecível."],
  ["This museum was created to preserve the life of Lilith — her expressions, her habits, her favorite places, the ordinary moments that became precious, and the love that remains after goodbye.", "Este museu foi criado para preservar a vida da Lilith — suas expressões, seus hábitos, seus lugares favoritos, os momentos comuns que se tornaram preciosos e o amor que permanece depois da despedida."],
  ["Loved forever. Forgotten never.", "Amada para sempre. Esquecida jamais."],
  ["Your life was not only the time between two dates. It was every moment of love held between them.", "Sua vida não foi apenas o tempo entre duas datas. Foi cada momento de amor guardado entre elas."],
  ["Some lives are measured in years. Others are measured by how deeply they change us.", "Algumas vidas são medidas em anos. Outras, pela profundidade com que nos mudam."],
  ["A quiet portrait for the most intimate room in the museum.", "Um retrato silencioso para a sala mais íntima do museu."],

  ["Friday the Thirteenth", "Sexta-feira 13"],
  ["The Day Lilith Arrived", "O Dia em que Lilith Chegou"],
  ["Her First Home", "Seu Primeiro Lar"],
  ["The Beginning of Everything", "O Começo de Tudo"],
  ["Tiny Paws", "Patinhas Pequenas"],
  ["The First Photograph", "A Primeira Fotografia"],
  ["Her Favorite View", "Sua Vista Favorita"],
  ["Her Little Tower", "Sua Pequena Torre"],
  ["The Window Ritual", "O Ritual da Janela"],
  ["The Sound of Home", "O Som de Casa"],
  ["Her Chosen Place", "O Lugar Escolhido por Ela"],
  ["Dinner Negotiations", "Negociações do Jantar"],
  ["Her Eyes", "Seus Olhos"],
  ["Queen of the House", "Rainha da Casa"],
  ["Soft Paws", "Patinhas Macias"],
  ["The Night Cat", "A Gata da Noite"],
  ["A Quiet Afternoon", "Uma Tarde Tranquila"],
  ["Her Favorite Corner", "Seu Cantinho Favorito"],
  ["Lilith in the Light", "Lilith na Luz"],
  ["The Look", "O Olhar"],
  ["December Child", "Filha de Dezembro"],
  ["Completely Herself", "Completamente Ela"],

  ["A rare beginning beneath a Friday night sky.", "Um começo raro sob um céu de sexta-feira à noite."],
  ["One of Lilith’s earliest preserved photographs — the beginning of a life that would fill the home with presence.", "Uma das primeiras fotografias preservadas da Lilith — o início de uma vida que preencheria a casa com sua presença."],
  ["The first days before every corner became hers.", "Os primeiros dias, antes de cada canto se tornar dela."],
  ["A tiny black kitten, already carrying the gaze and confidence that would become unmistakably Lilith.", "Uma gatinha preta minúscula, já carregando o olhar e a confiança que se tornariam inconfundivelmente Lilith."],
  ["Small paws learning every corner.", "Patinhas pequenas conhecendo cada canto."],
  ["The rooms were still new to her, but she was already beginning to transform them into home.", "Os cômodos ainda eram novos para ela, mas ela já começava a transformá-los em lar."],
  ["Before the routines, before the favorite places — the beginning.", "Antes das rotinas, antes dos lugares favoritos — o começo."],
  ["An early memory of Lilith discovering comfort, company, and the places where she belonged.", "Uma memória antiga da Lilith descobrindo conforto, companhia e os lugares aos quais pertencia."],
  ["Proof that a small presence can fill an entire home.", "A prova de que uma pequena presença pode preencher uma casa inteira."],
  ["A young Lilith, curious and completely at ease in the ordinary spaces that became part of her story.", "Uma Lilith jovem, curiosa e totalmente à vontade nos espaços comuns que se tornaram parte de sua história."],
  ["The first preserved pieces of a life deeply loved.", "Os primeiros fragmentos preservados de uma vida profundamente amada."],
  ["The earliest chapter of the archive: small moments that now hold an entire world of affection.", "O capítulo mais antigo do arquivo: pequenos momentos que agora guardam um mundo inteiro de afeto."],

  ["A window could become a whole afternoon.", "Uma janela podia se transformar em uma tarde inteira."],
  ["Lilith watched the world with complete attention, turning a simple window into one of the home’s most important places.", "Lilith observava o mundo com atenção absoluta, transformando uma janela simples em um dos lugares mais importantes da casa."],
  ["A high place for observing everything.", "Um lugar alto para observar tudo."],
  ["She found comfort in being close and just above the room, quietly aware of every movement around her.", "Ela encontrava conforto ficando por perto e um pouco acima do cômodo, atenta em silêncio a cada movimento ao redor."],
  ["Outside was interesting. Her presence inside mattered more.", "Lá fora era interessante. A presença dela aqui dentro importava mais."],
  ["One of the many ordinary scenes that became part of the rhythm of home.", "Uma das muitas cenas comuns que passaram a fazer parte do ritmo da casa."],
  ["Rest, warmth, and the soft certainty that she was nearby.", "Descanso, aconchego e a doce certeza de que ela estava por perto."],
  ["The quiet moments — sleeping, breathing, purring — were part of the house’s everyday soundtrack.", "Os momentos silenciosos — dormindo, respirando, ronronando — faziam parte da trilha sonora cotidiana da casa."],
  ["Every soft surface eventually became hers.", "Toda superfície macia acabava se tornando dela."],
  ["Lilith had a talent for finding the exact place where comfort, warmth, and company met.", "Lilith tinha o talento de encontrar o ponto exato onde conforto, calor e companhia se encontravam."],
  ["She had a system. Everyone else had instructions.", "Ela tinha um sistema. Todo o resto recebia instruções."],
  ["The bowls, the look, and the unmistakable expectation that dinner should happen on Lilith’s schedule.", "Os potes, o olhar e a expectativa inconfundível de que o jantar deveria acontecer no horário da Lilith."],

  ["The look that seemed to contain an entire private world.", "O olhar que parecia conter um mundo particular inteiro."],
  ["A portrait centered on Lilith’s direct, luminous gaze — alert, elegant, and completely her own.", "Um retrato centrado no olhar direto e luminoso da Lilith — atento, elegante e inteiramente dela."],
  ["Not a title granted. A fact observed.", "Não era um título concedido. Era um fato observado."],
  ["Lilith sitting with the natural confidence of someone who never needed permission to belong.", "Lilith sentada com a confiança natural de quem nunca precisou de permissão para pertencer."],
  ["Peace could take the shape of a sleeping cat.", "A paz podia ter a forma de uma gata dormindo."],
  ["A close, quiet portrait preserving the softness of her paws, fur, and complete trust.", "Um retrato próximo e silencioso, preservando a maciez de suas patas, de seu pelo e de sua confiança completa."],
  ["At home beneath red light and quiet rooms.", "Em casa, sob a luz vermelha e entre cômodos silenciosos."],
  ["A mysterious little portrait that fits the rare Friday-night sky woven through Lilith’s story.", "Um pequeno retrato misterioso que combina com o raro céu de sexta-feira à noite entrelaçado à história da Lilith."],
  ["Nothing happened, and everything mattered.", "Nada aconteceu, e tudo importava."],
  ["One of the ordinary afternoons that now feels precious simply because Lilith was there.", "Uma das tardes comuns que agora parece preciosa simplesmente porque Lilith estava ali."],
  ["The geography of comfort.", "A geografia do conforto."],
  ["A familiar blanket, a familiar room, and Lilith making the place feel complete.", "Uma manta familiar, um cômodo familiar e Lilith fazendo o lugar parecer completo."],
  ["Warm light finding every detail.", "A luz quente encontrando cada detalhe."],
  ["A late portrait full of softness and presence, preserving the way she rested inside the life built around her.", "Um retrato tardio cheio de delicadeza e presença, preservando a maneira como ela descansava dentro da vida construída ao seu redor."],
  ["A complete sentence without a sound.", "Uma frase completa sem nenhum som."],
  ["Alert ears, bright eyes, and the unmistakable expression that made Lilith impossible to confuse with anyone else.", "Orelhas atentas, olhos brilhantes e a expressão inconfundível que tornava impossível confundir Lilith com qualquer outra gata."],
  ["Born beneath a rare Friday sky.", "Nascida sob um raro céu de sexta-feira."],
  ["A curled, peaceful Lilith — quiet, mysterious, and beautiful in the season that always belonged to her.", "Lilith encolhida e serena — silenciosa, misteriosa e linda na estação que sempre pertenceu a ela."],
  ["No performance. No explanation. Lilith.", "Sem atuação. Sem explicação. Lilith."],
  ["A final portrait in the gallery celebrating the companionship, routines, and home she shared with those around her.", "Um retrato final na galeria, celebrando a companhia, as rotinas e o lar que ela compartilhou com quem estava ao seu redor."],

  ["Early photograph · date not confirmed", "Fotografia antiga · data não confirmada"],
  ["A photograph preserved in Lilith’s complete collection.", "Uma fotografia preservada na coleção completa da Lilith."],
  ["One of the ordinary, affectionate moments carried into this museum so it can remain visible.", "Um dos momentos comuns e carinhosos trazidos para este museu para que permaneça visível."],
  ["Memory", "Memória"]
]);

const PT_MEMORY_STARS = [
  { title: "O dia em que ela chegou", message: "O início de uma nova forma de lar — uma que incluía seus passos, seu olhar e a certeza silenciosa de que ela pertencia àquele lugar." },
  { title: "Seu lugar favorito para dormir", message: "Um pequeno lugar se tornou importante simplesmente porque Lilith o escolheu repetidas vezes." },
  { title: "A expressão que fazia ao pedir comida", message: "Um olhar tão específico que não precisava de tradução, negociação e muito menos demora." },
  { title: "O som do seu ronronar", message: "Um pequeno motor de conforto — a prova de que a paz podia ter som." },
  { title: "Seu brinquedo favorito", message: "O objeto importava menos do que a seriedade com que ela transformava a brincadeira em um ritual particular." },
  { title: "A forma como olhava pela janela", message: "Observando um mundo que não podia explicar, enquanto tornava completo o cômodo atrás dela." },
  { title: "Seu hábito mais engraçado", message: "O pequeno ritual que não fazia sentido para mais ninguém e fazia todo sentido porque era dela." },
  { title: "O lugar onde se sentia mais segura", message: "Segurança não era apenas um lugar. Era a confiança que ela oferecia e o amor construído ao seu redor." },
  { title: "A forma como pedia carinho", message: "Nunca exatamente um pedido. Mais como um lembrete gentil de que o amor tinha hora marcada." },
  { title: "Uma fotografia que captura sua personalidade", message: "Um único quadro guardando confiança, ternura, curiosidade e o fato inconfundível de ser Lilith." },
  { title: "Um dia comum e silencioso", message: "Nada extraordinário aconteceu — e é por isso que a memória agora parece inestimável." },
  { title: "A última fotografia", message: "Não um fim, mas a última página visível de uma história que continua dentro de todos que a amaram." },
  { title: "O amor que nunca partiu", message: "O luto mudou os cômodos. O amor permaneceu em todos eles." }
];

const PT_MONTHS = {
  January: "janeiro", February: "fevereiro", March: "março", April: "abril", May: "maio", June: "junho",
  July: "julho", August: "agosto", September: "setembro", October: "outubro", November: "novembro", December: "dezembro"
};

function translateDateToPortuguese(value) {
  if (!value || currentLang !== "pt") return value || "";
  if (PT_EXACT_TRANSLATIONS.has(value)) return PT_EXACT_TRANSLATIONS.get(value);
  const full = value.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})$/);
  if (full) return `${Number(full[2])} de ${PT_MONTHS[full[1]]} de ${full[3]}`;
  return value;
}

function translateMuseumText(value) {
  if (!value || currentLang !== "pt") return value || "";
  if (PT_EXACT_TRANSLATIONS.has(value)) return PT_EXACT_TRANSLATIONS.get(value);
  const archiveMatch = value.match(/^Archive Memory\s+(\d+)$/);
  if (archiveMatch) return `Memória do Arquivo ${archiveMatch[1]}`;
  return value;
}

function localizedItem(item) {
  if (!item || currentLang !== "pt") return item;
  return {
    ...item,
    title: translateMuseumText(item.title),
    date: translateDateToPortuguese(item.date),
    caption: translateMuseumText(item.caption),
    memory: translateMuseumText(item.memory)
  };
}

function localizedMemoryStar(index) {
  return currentLang === "pt" ? PT_MEMORY_STARS[index] : museumData.memoryStars[index];
}

const CAT_MEOW_SOURCES = {
  Lilith: [
    "./audio/lilith-meow-1.mp3",
    "./audio/lilith-meow-2.mp3",
    "./audio/lilith-meow-3.mp3"
  ],
  Pietro: ["./audio/pietro-meow.mp3"],
  Apollo: []
};
const catMeowPlayers = new Map();
let activeRecordedMeow = null;

function prepareRecordedMeows() {
  Object.entries(CAT_MEOW_SOURCES).forEach(([name, sources]) => {
    catMeowPlayers.set(name, sources.map((source) => {
      const audio = new Audio(source);
      audio.preload = "auto";
      audio.volume = name === "Lilith" ? .95 : .9;
      return audio;
    }));
  });
}

function stopRecordedMeows() {
  if (activeRecordedMeow) {
    activeRecordedMeow.pause();
    activeRecordedMeow.currentTime = 0;
    activeRecordedMeow = null;
  }
}

function playRecordedCatMeow(name) {
  if (!ambientAudio.enabled) return false;
  const players = catMeowPlayers.get(name) || [];
  if (!players.length) return false;
  stopRecordedMeows();
  const selected = players[Math.floor(Math.random() * players.length)];
  selected.currentTime = 0;
  activeRecordedMeow = selected;
  selected.onended = () => { if (activeRecordedMeow === selected) activeRecordedMeow = null; };
  selected.play().catch(() => {
    if (activeRecordedMeow === selected) activeRecordedMeow = null;
    ambientAudio.playMeow(name.length);
  });
  return true;
}

class AmbientAudio {
  constructor() {
    this.context = null;
    this.master = null;
    this.purrGain = null;
    this.enabled = true;
  }

  start() {
    if (this.context) {
      this.context.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.18;
    this.master.connect(this.context.destination);

    const low = this.context.createOscillator();
    const lowGain = this.context.createGain();
    low.type = "sine";
    low.frequency.value = 54;
    lowGain.gain.value = 0.018;
    low.connect(lowGain).connect(this.master);
    low.start();

    const high = this.context.createOscillator();
    const highGain = this.context.createGain();
    high.type = "sine";
    high.frequency.value = 108.7;
    highGain.gain.value = 0.008;
    high.connect(highGain).connect(this.master);
    high.start();

    const noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 3, this.context.sampleRate);
    const channel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < channel.length; i++) channel[i] = (Math.random() * 2 - 1) * 0.22;
    const noise = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const noiseGain = this.context.createGain();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = 520;
    noiseGain.gain.value = 0.015;
    noise.connect(filter).connect(noiseGain).connect(this.master);
    noise.start();

    const purrCarrier = this.context.createOscillator();
    const purrMod = this.context.createOscillator();
    const purrModGain = this.context.createGain();
    this.purrGain = this.context.createGain();
    purrCarrier.type = "sine";
    purrCarrier.frequency.value = 28;
    purrMod.type = "sine";
    purrMod.frequency.value = 3.2;
    purrModGain.gain.value = 0.02;
    this.purrGain.gain.value = 0;
    purrMod.connect(purrModGain).connect(this.purrGain.gain);
    purrCarrier.connect(this.purrGain).connect(this.master);
    purrCarrier.start();
    purrMod.start();
  }

  setPurr(active) {
    if (!this.context || !this.purrGain) return;
    this.purrGain.gain.cancelScheduledValues(this.context.currentTime);
    this.purrGain.gain.linearRampToValueAtTime(active ? 0.035 : 0, this.context.currentTime + 1.2);
  }

  playMeow(variation = 0) {
    if (!this.enabled) return;
    if (!this.context) this.start();
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;

    const voice = this.context.createOscillator();
    const body = this.context.createOscillator();
    const tone = this.context.createBiquadFilter();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();

    voice.type = variation % 2 === 0 ? "triangle" : "sine";
    body.type = "sine";
    tone.type = "bandpass";
    tone.Q.value = 0.8;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(980, now + 0.26);

    const startPitch = 760 + Math.random() * 90;
    const middlePitch = 560 + Math.random() * 55;
    const endPitch = 430 + Math.random() * 30;

    voice.frequency.setValueAtTime(startPitch, now);
    voice.frequency.exponentialRampToValueAtTime(middlePitch, now + 0.08);
    voice.frequency.exponentialRampToValueAtTime(endPitch, now + 0.29);

    body.frequency.setValueAtTime(startPitch * 0.5, now);
    body.frequency.exponentialRampToValueAtTime(middlePitch * 0.52, now + 0.08);
    body.frequency.exponentialRampToValueAtTime(endPitch * 0.48, now + 0.29);

    tone.frequency.setValueAtTime(980, now);
    tone.frequency.exponentialRampToValueAtTime(760, now + 0.14);
    tone.frequency.exponentialRampToValueAtTime(620, now + 0.3);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.026, now + 0.17);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

    voice.connect(tone);
    body.connect(tone);
    tone.connect(filter).connect(gain).connect(this.master);
    voice.start(now);
    body.start(now);
    voice.stop(now + 0.4);
    body.stop(now + 0.4);
  }

  playApolloMeow() {
    if (!this.enabled) return;
    if (!this.context) this.start();
    if (!this.context || !this.master) return;
    if (Math.random() < 0.5) this.playApolloSpectralMeow();
    else this.playApolloGlottalMeow();
  }

  playApolloSpectralMeow() {
    const audioCtx = this.context;
    const now = audioCtx.currentTime;
    const duration = 0.6;
    const sampleCount = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    const sampleRate = audioCtx.sampleRate;
    const pitchScale = 0.97 + Math.random() * 0.06;
    let phase = 0;

    const h1 = 1.0;
    const h2 = 0.75;
    const h3 = 0.45;
    const h4 = 0.28;
    const h5 = 0.15;

    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleRate;
      let f0 = 410;
      if (t < 0.12) {
        f0 = 410 + 110 * Math.sin((t / 0.12) * (Math.PI / 2));
      } else if (t < 0.35) {
        f0 = 520 - 20 * ((t - 0.12) / 0.23);
      } else {
        const decline = (t - 0.35) / (duration - 0.35);
        f0 = 500 - 210 * Math.pow(decline, 2);
      }

      const microTremor = Math.sin(2 * Math.PI * 65 * t) * (1 - t / duration);
      const chaoticNoise = (Math.random() * 2 - 1) * 0.4;
      f0 = (f0 + microTremor * 3.5 + chaoticNoise * 1.5) * pitchScale;
      phase += (2 * Math.PI * f0) / sampleRate;

      let vocal = Math.sin(phase) * h1
        + Math.sin(phase * 2) * h2
        + Math.sin(phase * 3) * h3
        + Math.sin(phase * 4) * h4
        + Math.sin(phase * 5) * h5;
      vocal = Math.tanh(vocal * 1.1);
      const nasalBreath = (Math.random() * 2 - 1) * 0.025 * Math.sin(phase * 0.5);

      let envelope = 0;
      if (t < 0.06) envelope = Math.pow(t / 0.06, 2);
      else if (t < 0.4) envelope = 0.85 + 0.15 * Math.sin((t - 0.06) * 4);
      else envelope = 0.85 * (1 - (t - 0.4) / (duration - 0.4));

      data[i] = Math.max(-1, Math.min(1, (vocal + nasalBreath) * envelope * 0.35));
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + duration);
    const output = audioCtx.createGain();
    output.gain.setValueAtTime(0.9, now);
    source.connect(filter).connect(output).connect(this.master);
    source.start(now);
  }

  playApolloGlottalMeow() {
    const audioCtx = this.context;
    const now = audioCtx.currentTime;
    const duration = 0.65;
    const sampleCount = Math.floor(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    const sampleRate = audioCtx.sampleRate;
    const pitchScale = 0.97 + Math.random() * 0.06;
    let phase = 0;

    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleRate;
      let f0 = 380;
      if (t < 0.15) f0 = 380 + 150 * (t / 0.15);
      else if (t < 0.35) f0 = 530;
      else {
        const fall = (t - 0.35) / (duration - 0.35);
        f0 = 530 - 270 * Math.pow(fall, 1.5);
      }
      f0 = (f0 + Math.sin(2 * Math.PI * 45 * t) * 1.5) * pitchScale;
      phase += (2 * Math.PI * f0) / sampleRate;

      const nasalResonance = Math.sin(phase) * Math.exp(-0.00035 * phase);
      const vocalPulse = Math.sin(phase) + 0.6 * Math.sin(2 * phase) + 0.3 * Math.sin(3 * phase);
      const breathNoise = (Math.random() * 2 - 1) * 0.015;
      const volume = t < 0.05 ? t / 0.05 : Math.exp(-4 * (t - 0.05));
      data[i] = Math.max(-1, Math.min(1, ((vocalPulse * 0.7 + nasalResonance * 0.3) + breathNoise) * volume * 0.62));
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3200, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration);
    const output = audioCtx.createGain();
    output.gain.setValueAtTime(0.72, now);
    source.connect(filter).connect(output).connect(this.master);
    source.start(now);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) stopRecordedMeows();
    if (this.master && this.context) {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.linearRampToValueAtTime(this.enabled ? 0.18 : 0, this.context.currentTime + 0.25);
    }
    soundButton.textContent = this.enabled ? "♪" : "×";
    soundButton.title = this.enabled ? "Mute sound" : "Enable sound";
  }
}

const ambientAudio = new AmbientAudio();
prepareRecordedMeows();

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function createPlaceholderCanvas(title, subtitle = "The Little Museum of Lilith", landscape = false) {
  const canvasEl = document.createElement("canvas");
  canvasEl.width = landscape ? 800 : 600;
  canvasEl.height = landscape ? 520 : 750;
  const ctx = canvasEl.getContext("2d");
  const w = canvasEl.width;
  const h = canvasEl.height;

  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#251336");
  gradient.addColorStop(.55, "#0b0710");
  gradient.addColorStop(1, "#050407");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const moonGradient = ctx.createRadialGradient(w * .65, h * .27, 4, w * .65, h * .27, w * .2);
  moonGradient.addColorStop(0, "rgba(246,229,183,.3)");
  moonGradient.addColorStop(1, "rgba(246,229,183,0)");
  ctx.fillStyle = moonGradient;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(242,220,157,.9)";
  for (let i = 0; i < 13; i++) {
    const angle = i * 2.399;
    const radius = 70 + i * 18;
    const x = w * .65 + Math.cos(angle) * radius;
    const y = h * .27 + Math.sin(angle) * radius * .6;
    ctx.beginPath();
    ctx.arc(x, y, i % 3 === 0 ? 3 : 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(w / 2, h * .49);
  ctx.strokeStyle = "rgba(242,220,157,.75)";
  ctx.fillStyle = "rgba(5,4,7,.78)";
  ctx.lineWidth = Math.max(5, w * .006);
  ctx.beginPath();
  ctx.moveTo(-w * .16, -h * .05);
  ctx.lineTo(-w * .11, -h * .18);
  ctx.lineTo(-w * .03, -h * .1);
  ctx.quadraticCurveTo(w * .08, -h * .13, w * .17, -h * .03);
  ctx.lineTo(w * .21, -h * .18);
  ctx.lineTo(w * .28, -h * .03);
  ctx.quadraticCurveTo(w * .31, h * .1, w * .22, h * .18);
  ctx.quadraticCurveTo(w * .1, h * .29, -w * .05, h * .24);
  ctx.quadraticCurveTo(-w * .21, h * .18, -w * .21, h * .03);
  ctx.quadraticCurveTo(-w * .21, -h * .01, -w * .16, -h * .05);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.fillStyle = "#f4ecdf";
  ctx.font = `500 ${Math.round(w * .07)}px Georgia`;
  const titleLines = wrapCanvasText(ctx, title, w * .78);
  const titleY = h * .77 - (titleLines.length - 1) * w * .04;
  titleLines.forEach((line, i) => ctx.fillText(line, w / 2, titleY + i * w * .08));

  ctx.fillStyle = "rgba(215,180,106,.85)";
  ctx.font = `500 ${Math.round(w * .019)}px Arial`;
  ctx.letterSpacing = "3px";
  ctx.fillText(subtitle.toUpperCase(), w / 2, h * .91);

  roundedRect(ctx, w * .07, h * .06, w * .86, h * .88, 18);
  ctx.strokeStyle = "rgba(215,180,106,.22)";
  ctx.lineWidth = 2;
  ctx.stroke();

  return canvasEl;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trim());
      line = `${word} `;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line.trim());
  return lines;
}

function canvasTexture(canvasEl) {
  const texture = new THREE.CanvasTexture(canvasEl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), lowPowerDevice ? 2 : 4);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function textCanvasTexture(canvasEl) {
  const texture = new THREE.CanvasTexture(canvasEl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), lowPowerDevice ? 8 : 16);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const materialTextureCache = new Map();

function hexToRgb(hex) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}

function shiftHex(hex, amount = 0) {
  const { r, g, b } = hexToRgb(hex);
  const shift = (value) => Math.max(0, Math.min(255, Math.round(value + 255 * amount)));
  return `rgb(${shift(r)}, ${shift(g)}, ${shift(b)})`;
}

function proceduralTexture(key, width, height, repeatX, repeatY, draw) {
  if (materialTextureCache.has(key)) return materialTextureCache.get(key);
  const canvasEl = document.createElement("canvas");
  canvasEl.width = width;
  canvasEl.height = height;
  const ctx = canvasEl.getContext("2d");
  draw(ctx, width, height);
  const texture = canvasTexture(canvasEl);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  materialTextureCache.set(key, texture);
  return texture;
}

function createWallTexture(color) {
  return proceduralTexture(`wall-${color}`, 384, 384, 3, 2.2, (ctx, w, h) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, shiftHex(color, .12));
    gradient.addColorStop(.3, shiftHex(color, .05));
    gradient.addColorStop(1, shiftHex(color, -.08));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 2600; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const a = .02 + Math.random() * .05;
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fillRect(x, y, 1, 1);
    }

    for (let i = 0; i < 70; i++) {
      const x = Math.random() * w;
      const alpha = .02 + Math.random() * .03;
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(x, 0, 1 + Math.random() * 2, h);
    }

    for (let y = 56; y < h; y += 86) {
      ctx.strokeStyle = 'rgba(255,255,255,0.035)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + Math.random() * 2);
      ctx.stroke();
    }
  });
}

function createFloorTexture(color) {
  return proceduralTexture(`floor-${color}`, 512, 512, 2.2, 2.2, (ctx, w, h) => {
    ctx.fillStyle = shiftHex(color, -.02);
    ctx.fillRect(0, 0, w, h);

    const tileW = w / 4;
    const tileH = h / 4;
    for (let iy = 0; iy < 4; iy++) {
      for (let ix = 0; ix < 4; ix++) {
        const x = ix * tileW;
        const y = iy * tileH;
        ctx.fillStyle = shiftHex(color, ((ix + iy) % 2 === 0 ? .035 : -.025));
        ctx.fillRect(x, y, tileW, tileH);

        for (let s = 0; s < 140; s++) {
          ctx.fillStyle = `rgba(255,255,255,${0.01 + Math.random() * .02})`;
          ctx.fillRect(x + Math.random() * tileW, y + Math.random() * tileH, 1, 1);
        }

        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.strokeRect(x + .5, y + .5, tileW - 1, tileH - 1);
      }
    }

    const shine = ctx.createLinearGradient(0, 0, w, h);
    shine.addColorStop(0, 'rgba(255,255,255,0.08)');
    shine.addColorStop(.25, 'rgba(255,255,255,0)');
    shine.addColorStop(.55, 'rgba(255,255,255,0.03)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);
  });
}

function createCeilingTexture(color) {
  return proceduralTexture(`ceiling-${color}`, 256, 256, 2.5, 2.5, (ctx, w, h) => {
    ctx.fillStyle = shiftHex(color, 0);
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 1200; i++) {
      const alpha = .01 + Math.random() * .018;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
  });
}

function createTextCanvas(lines, options = {}) {
  const logicalWidth = options.width || 1500;
  const logicalHeight = options.height || 520;
  const resolutionScale = options.resolutionScale || (lowPowerDevice ? 1.5 : 2.1);
  const canvasEl = document.createElement("canvas");
  canvasEl.width = Math.round(logicalWidth * resolutionScale);
  canvasEl.height = Math.round(logicalHeight * resolutionScale);
  const ctx = canvasEl.getContext("2d", { alpha: true });
  ctx.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0);
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  let cursorY = options.startY || logicalHeight * .3;
  lines.forEach((entry) => {
    const cfg = typeof entry === "string" ? { text: entry } : entry;
    const effectiveSize = Math.round((cfg.size || 78) * (cfg.scale || 1.0));
    ctx.font = `${cfg.italic ? "italic " : ""}${cfg.weight || 500} ${effectiveSize}px Georgia`;
    ctx.fillStyle = cfg.color || "#f4ecdf";
    ctx.shadowColor = cfg.shadowColor || "rgba(0,0,0,.58)";
    ctx.shadowBlur = cfg.shadowBlur ?? 3.4;
    ctx.shadowOffsetY = cfg.shadowOffsetY ?? 1.0;
    const wrapped = wrapCanvasText(ctx, cfg.text, logicalWidth * (cfg.maxWidth || .86));
    wrapped.forEach((line) => {
      ctx.fillText(line, logicalWidth / 2, cursorY);
      cursorY += effectiveSize * (cfg.lineHeight || 1.08);
    });
    cursorY += cfg.gap ?? 16;
  });
  return canvasEl;
}

function makeMaterial(color, roughness = .72, metalness = .03) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

function makeWallMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    map: createWallTexture(color),
    roughness: .88,
    metalness: .02,
    emissive: new THREE.Color(color).multiplyScalar(.12),
    emissiveIntensity: .18
  });
}

function makeFloorMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    map: createFloorTexture(color),
    roughness: .68,
    metalness: .06,
    emissive: new THREE.Color(color).multiplyScalar(.08),
    emissiveIntensity: .12
  });
}

function makeCeilingMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color,
    map: createCeilingTexture(color),
    roughness: .95,
    metalness: .02,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1
  });
}

function addBox(position, scale, material, { cast = false, receive = true, parent = scene } = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale.x, scale.y, scale.z), material);
  mesh.position.copy(position);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  parent.add(mesh);
  return mesh;
}

function getBlobShadowTexture() {
  if (blobShadowTexture) return blobShadowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 5, 64, 64, 62);
  g.addColorStop(0, "rgba(0,0,0,.55)");
  g.addColorStop(.45, "rgba(0,0,0,.26)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  blobShadowTexture = canvasTexture(c);
  blobShadowTexture.generateMipmaps = true;
  return blobShadowTexture;
}

function createBlobShadow(x, z, width = 1, depth = .7, opacity = .24) {
  const material = new THREE.MeshBasicMaterial({
    map: getBlobShadowTexture(), transparent: true, opacity, depthWrite: false,
    side: THREE.DoubleSide, toneMapped: false
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), material);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(x, .028, z);
  shadow.renderOrder = 1;
  scene.add(shadow);
  return shadow;
}

function finalizeLightStrips() {
  if (!lightStripTransforms.length || lightStripMesh) return;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xf7f5ff, toneMapped: false });
  lightStripMesh = new THREE.InstancedMesh(geometry, material, lightStripTransforms.length);
  lightStripMesh.frustumCulled = false;
  const dummy = new THREE.Object3D();
  lightStripTransforms.forEach((entry, i) => {
    dummy.position.set(...entry.pos);
    dummy.scale.set(...entry.scale);
    dummy.updateMatrix();
    lightStripMesh.setMatrixAt(i, dummy.matrix);
  });
  lightStripMesh.instanceMatrix.needsUpdate = true;
  scene.add(lightStripMesh);
}

function addPerimeterLightStrips({ x, z, w, d, height }) {
  const topY = height - .14;
  const bottomY = .06;
  const stripThickness = .045;
  const stripDepth = .08;
  [
    { pos: [x, topY, z - d / 2 + .06], scale: [w - .16, stripThickness, stripDepth] },
    { pos: [x, topY, z + d / 2 - .06], scale: [w - .16, stripThickness, stripDepth] },
    { pos: [x - w / 2 + .06, topY, z], scale: [stripDepth, stripThickness, d - .16] },
    { pos: [x + w / 2 - .06, topY, z], scale: [stripDepth, stripThickness, d - .16] },
    { pos: [x, bottomY, z - d / 2 + .06], scale: [w - .16, stripThickness, stripDepth] },
    { pos: [x, bottomY, z + d / 2 - .06], scale: [w - .16, stripThickness, stripDepth] },
    { pos: [x - w / 2 + .06, bottomY, z], scale: [stripDepth, stripThickness, d - .16] },
    { pos: [x + w / 2 - .06, bottomY, z], scale: [stripDepth, stripThickness, d - .16] }
  ].forEach((entry) => lightStripTransforms.push(entry));
}

function buildWallSegments(side, room, openings, material, height) {
  const horizontal = side === "north" || side === "south";
  const length = horizontal ? room.w : room.d;
  const sorted = [...(openings || [])]
    .map((opening) => ({ start: opening.center - opening.width / 2, end: opening.center + opening.width / 2 }))
    .sort((a, b) => a.start - b.start);
  const intervals = [];
  let cursor = -length / 2;
  sorted.forEach((opening) => {
    if (opening.start > cursor) intervals.push([cursor, opening.start]);
    cursor = Math.max(cursor, opening.end);
  });
  if (cursor < length / 2) intervals.push([cursor, length / 2]);

  intervals.forEach(([start, end]) => {
    const segmentLength = end - start;
    if (segmentLength < .05) return;
    const center = (start + end) / 2;
    const pos = new THREE.Vector3(room.x, height / 2, room.z);
    const scale = new THREE.Vector3();
    if (horizontal) {
      pos.x += center;
      pos.z += side === "north" ? -room.d / 2 : room.d / 2;
      scale.set(segmentLength, height, .24);
    } else {
      pos.z += center;
      pos.x += side === "west" ? -room.w / 2 : room.w / 2;
      scale.set(.24, height, segmentLength);
    }
    addBox(pos, scale, material, { receive: true });
  });
}

function createRoomShell({ id, x, z, w, d, height = 8.2, wallColor = palette.wall, floorColor = palette.floor, ceiling = true, openings = {} }) {
  const wallMaterial = makeWallMaterial(wallColor);
  const floorMaterial = makeFloorMaterial(floorColor);
  const floor = addBox(new THREE.Vector3(x, -.08, z), new THREE.Vector3(w, .16, d), floorMaterial, { receive: true });
  floor.userData.room = id;
  ["north", "south", "east", "west"].forEach((side) => buildWallSegments(side, { x, z, w, d }, openings[side], wallMaterial, height));

  let ceilingMesh = null;
  if (ceiling) {
    const ceilingMaterial = makeCeilingMaterial(0x28202d);
    ceilingMesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilingMaterial);
    ceilingMesh.rotation.x = Math.PI / 2;
    ceilingMesh.position.set(x, height, z);
    ceilingMesh.receiveShadow = true;
    scene.add(ceilingMesh);
    ceilingMeshes.push(ceilingMesh);
  }
  if (id !== "garden") addPerimeterLightStrips({ x, z, w, d, height, includeCornerLights: true });
  return { floor, ceiling: ceilingMesh };
}

function createCorridor({ x, z, w, d, axis = "z", wallColor = palette.wall }) {
  addBox(new THREE.Vector3(x, -.08, z), new THREE.Vector3(w, .16, d), makeFloorMaterial(palette.floor), { receive: true });
  const material = makeWallMaterial(wallColor);
  if (axis === "z") {
    addBox(new THREE.Vector3(x - w / 2, 4.1, z), new THREE.Vector3(.24, 8.2, d), material);
    addBox(new THREE.Vector3(x + w / 2, 4.1, z), new THREE.Vector3(.24, 8.2, d), material);
  } else {
    addBox(new THREE.Vector3(x, 4.1, z - d / 2), new THREE.Vector3(w, 8.2, .24), material);
    addBox(new THREE.Vector3(x, 4.1, z + d / 2), new THREE.Vector3(w, 8.2, .24), material);
  }
  const ceilingMaterial = makeCeilingMaterial(0x251d2a);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(w, d), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(x, 8.2, z);
  scene.add(ceiling);
  ceilingMeshes.push(ceiling);
  addPerimeterLightStrips({ x, z, w, d, height: 8.2, includeCornerLights: false });
}

function addRoomLight(x, z, color = 0xffd9a4, intensity = 3.1, distance = 16, y = 6.9) {
  const fixture = new THREE.Mesh(
    new THREE.SphereGeometry(.09, 8, 8),
    new THREE.MeshBasicMaterial({ color, toneMapped: false })
  );
  fixture.position.set(x, y, z);
  scene.add(fixture);
  return fixture;
}

function addWallSconce(x, y, z, rotationY, color = 0xffd49a) {
  const group = new THREE.Group();
  const plate = addBox(new THREE.Vector3(0, 0, 0), new THREE.Vector3(.22, .48, .08), makeMaterial(0x6c5128, .42, .5), { parent: group });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 12), new THREE.MeshBasicMaterial({ color }));
  bulb.position.z = .1;
  group.add(bulb);
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  scene.add(group);
}

function createTextPanel(lines, position, rotationY = 0, width = 5.8, height = 2.2, options = {}) {
  const texture = textCanvasTexture(createTextCanvas(lines, options.canvas || {}));
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  panel.position.copy(position);
  panel.rotation.y = rotationY;
  if (options.renderOrder !== undefined) panel.renderOrder = options.renderOrder;
  panel.visible = true;
  scene.add(panel);
  return panel;
}

function createLocalizedTextPanel(linesByLang, position, rotationY = 0, width = 5.8, height = 2.2, options = {}) {
  const panel = createTextPanel(linesByLang[currentLang] || linesByLang.en, position, rotationY, width, height, options);
  bindLocalizedCanvas(panel, (lang) => createTextCanvas(linesByLang[lang] || linesByLang.en, options.canvas || {}));
  return panel;
}

function registerInteraction(mesh, payload) {
  mesh.userData.interaction = payload;
  interactionMeshes.push(mesh);
}

function createArtwork(item, position, rotationY = 0, size = { w: 2.2, h: 2.8, hideLabel: false }, room = "portrait") {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;
  scene.add(group);

  const frameOuter = addBox(new THREE.Vector3(0, 0, 0), new THREE.Vector3(size.w + .25, size.h + .25, .16), makeMaterial(0x8d6c31, .38, .52), { cast: true, parent: group });
  const matBoard = addBox(new THREE.Vector3(0, 0, .1), new THREE.Vector3(size.w + .06, size.h + .06, .08), makeMaterial(0xd9cdb8, .9), { parent: group });
  const placeholder = createPlaceholderCanvas(item.title, room === "beginnings" ? "Room of Beginnings" : room === "everyday" ? "The Magic of Ordinary Days" : "Portraits of Lilith", size.w > size.h);
  const texture = canvasTexture(placeholder);
  const photoMaterial = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff, toneMapped: false });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(size.w, size.h), photoMaterial);
  photo.position.z = .15;
  photo.userData.isPhoto = true;
  group.add(photo);

  const payload = {
    type: "artwork",
    item,
    previewSrc: placeholder.toDataURL("image/jpeg", .92)
  };
  [frameOuter, matBoard, photo].forEach((mesh) => registerInteraction(mesh, payload));

  if (item.image) {
    textureLoader.load(
      item.image,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        const originalWidth = loaded.image.width;
        const originalHeight = loaded.image.height;
        const maxSide = lowPowerDevice ? 512 : 640;
        let displayTexture = loaded;
        if (Math.max(originalWidth, originalHeight) > maxSide) {
          const scale = maxSide / Math.max(originalWidth, originalHeight);
          const optimizedCanvas = document.createElement("canvas");
          optimizedCanvas.width = Math.max(1, Math.round(originalWidth * scale));
          optimizedCanvas.height = Math.max(1, Math.round(originalHeight * scale));
          optimizedCanvas.getContext("2d").drawImage(loaded.image, 0, 0, optimizedCanvas.width, optimizedCanvas.height);
          displayTexture = canvasTexture(optimizedCanvas);
          displayTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), lowPowerDevice ? 8 : 16);
          loaded.dispose();
        } else {
          loaded.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), lowPowerDevice ? 8 : 16);
        }
        photoMaterial.map?.dispose();
        photoMaterial.map = displayTexture;
        photoMaterial.needsUpdate = true;
        const imageAspect = originalWidth / originalHeight;
        const frameAspect = size.w / size.h;
        if (imageAspect > frameAspect) photo.scale.set(1, frameAspect / imageAspect, 1);
        else photo.scale.set(imageAspect / frameAspect, 1, 1);
        payload.previewSrc = item.image;
      },
      undefined,
      () => console.warn(`Could not load image: ${item.image}`)
    );
  }
  return group;
}

function createPedestal(position, label, payload) {
  const group = new THREE.Group();
  group.position.copy(position);
  scene.add(group);
  const base = addBox(new THREE.Vector3(0, .45, 0), new THREE.Vector3(1.2, .9, 1.2), makeMaterial(0x17111d, .84), { parent: group, cast: true });
  const top = addBox(new THREE.Vector3(0, .95, 0), new THREE.Vector3(1.35, .12, 1.35), makeMaterial(0x9c7737, .42, .45), { parent: group, cast: true });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 20), new THREE.MeshBasicMaterial({ color: palette.goldSoft }));
  glow.position.set(0, 1.28, 0);
  group.add(glow);
  [base, top, glow].forEach((mesh) => registerInteraction(mesh, payload));

  const labelText = typeof label === "object" ? (label[currentLang] || label.en || "") : label;
  const labelCanvas = createTextCanvas([{ text: labelText, size: 48, color: "#f4ecdf", shadowBlur: 2.4 }], { width: 1200, height: 220, startY: 102, resolutionScale: lowPowerDevice ? 2.0 : 3.0 });
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .36), new THREE.MeshBasicMaterial({ map: textCanvasTexture(labelCanvas), transparent: true, depthWrite: false, toneMapped: false }));
  labelMesh.position.set(0, .62, .611);
  group.add(labelMesh);
  if (typeof label === "object") bindLocalizedCanvas(labelMesh, (lang) => createTextCanvas([{ text: label[lang] || label.en || "", size: 48, color: "#f4ecdf", shadowBlur: 2.4 }], { width: 1200, height: 220, startY: 102, resolutionScale: lowPowerDevice ? 2.0 : 3.0 }));
  return group;
}

function createMemoryStar(index, position) {
  const group = new THREE.Group();
  group.position.copy(position);
  scene.add(group);
  const found = foundStars.has(index);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: found ? palette.goldSoft : 0x8c7544,
    emissive: found ? 0xffd993 : 0x32220e,
    emissiveIntensity: found ? 2.4 : .65,
    roughness: .32,
    metalness: .45
  });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(.12, 0), coreMaterial);
  core.castShadow = true;
  group.add(core);
  const halo = new THREE.Mesh(new THREE.RingGeometry(.18, .24, 24), new THREE.MeshBasicMaterial({ color: found ? palette.goldSoft : 0x806a3c, transparent: true, opacity: found ? .72 : .24, side: THREE.DoubleSide, depthWrite: false }));
  halo.rotation.x = Math.PI / 2;
  group.add(halo);
  const payload = { type: "memory-star", index, group, coreMaterial, halo };
  registerInteraction(core, payload);
  registerInteraction(halo, payload);
  animatedStars.push({ group, core, halo, baseY: position.y, offset: index * .73, found });
  return group;
}

function createPawPrint(x, z, rotation = 0, opacity = .28, parent = scene) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xd8bd80, transparent: true, opacity, depthWrite: false });
  const pad = new THREE.Mesh(new THREE.CircleGeometry(.12, 18), material);
  pad.scale.set(1.25, .9, 1);
  pad.rotation.x = -Math.PI / 2;
  group.add(pad);
  const toePositions = [[-.12,.13],[-.04,.19],[.08,.18],[.15,.09]];
  toePositions.forEach(([tx,tz]) => {
    const toe = new THREE.Mesh(new THREE.CircleGeometry(.045, 14), material);
    toe.scale.set(.9, 1.15, 1);
    toe.rotation.x = -Math.PI / 2;
    toe.position.set(tx, .006, tz);
    group.add(toe);
  });
  group.position.set(x, .02, z);
  group.rotation.y = rotation;
  parent.add(group);
  return group;
}

function createFlower(x, z, dark = false, scale = 1) {
  flowerInstanceData.stems.push({ position: [x, .19 * scale, z], scale: [scale, scale, scale], rotationY: 0 });
  const target = dark ? flowerInstanceData.darkPetals : flowerInstanceData.lightPetals;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    target.push({
      position: [x + Math.cos(a) * .08 * scale, .40 * scale, z + Math.sin(a) * .08 * scale],
      scale: [1.5 * scale, .45 * scale, .75 * scale],
      rotationY: -a
    });
  }
  flowerInstanceData.centers.push({ position: [x, .41 * scale, z], scale: [scale, scale, scale], rotationY: 0 });
}

function buildInstancedMesh(geometry, material, entries) {
  if (!entries.length) return null;
  const mesh = new THREE.InstancedMesh(geometry, material, entries.length);
  const dummy = new THREE.Object3D();
  entries.forEach((entry, index) => {
    dummy.position.set(...entry.position);
    dummy.rotation.set(0, entry.rotationY || 0, 0);
    dummy.scale.set(...entry.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  scene.add(mesh);
  flowerMeshes.push(mesh);
  return mesh;
}

function finalizeFlowers() {
  if (flowerMeshes.length) return;
  buildInstancedMesh(
    new THREE.CylinderGeometry(.015, .02, .34, 6),
    new THREE.MeshStandardMaterial({ color: 0x244126, roughness: .9, emissive: 0x071108, emissiveIntensity: .12 }),
    flowerInstanceData.stems
  );
  const petalGeometry = new THREE.SphereGeometry(.07, 6, 5);
  buildInstancedMesh(
    petalGeometry,
    new THREE.MeshStandardMaterial({ color: 0xf4eee6, roughness: .78, emissive: 0x18130b, emissiveIntensity: .22 }),
    flowerInstanceData.lightPetals
  );
  buildInstancedMesh(
    petalGeometry,
    new THREE.MeshStandardMaterial({ color: 0x3d1d55, roughness: .78, emissive: 0x12051d, emissiveIntensity: .25 }),
    flowerInstanceData.darkPetals
  );
  buildInstancedMesh(
    new THREE.SphereGeometry(.045, 6, 5),
    new THREE.MeshBasicMaterial({ color: palette.gold, toneMapped: false }),
    flowerInstanceData.centers
  );
}

function createGrassField(count = 900) {
  const bladeGeometry = new THREE.PlaneGeometry(.07, .5);
  bladeGeometry.translate(0, .25, 0);
  const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f6a38,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: .95
  });
  const grass = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, count);
  grass.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  const dummy = new THREE.Object3D();
  let placed = 0;
  let attempts = 0;
  while (placed < count && attempts < count * 8) {
    attempts += 1;
    const x = (Math.random() - .5) * 24.2;
    const z = -40 + (Math.random() - .5) * 16.2;
    const distToPool = Math.hypot(x + 7, z + 43.5);
    const distToPedestal = Math.hypot(x - 8.2, z + 43.5);
    const distToTree = Math.hypot(x, z + 41);
    if (distToPool < 3.1 || distToPedestal < 1.9 || distToTree < 2.25 || (Math.abs(x) < 1.05 && z > -49 && z < -31)) continue;
    const scale = .55 + Math.random() * .9;
    dummy.position.set(x, .018, z);
    dummy.rotation.set(-.08 - Math.random() * .22, Math.random() * Math.PI * 2, (Math.random() - .5) * .18);
    dummy.scale.set(.75 + Math.random() * .5, scale, 1);
    dummy.updateMatrix();
    grass.setMatrixAt(placed, dummy.matrix);
    placed += 1;
  }
  grass.count = placed;
  grass.frustumCulled = true;
  scene.add(grass);
  return grass;
}

function createGrassTuft(x, z, scale = 1) {
  const group = new THREE.Group();
  group.position.set(x, .018, z);
  group.rotation.y = Math.random() * Math.PI * 2;
  scene.add(group);
  const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0x3f6a38, roughness: 1, metalness: 0, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(.08 + Math.random() * .03, .45 + Math.random() * .22), bladeMaterial);
    blade.position.set((Math.random() - .5) * .16, .22 + Math.random() * .08, (Math.random() - .5) * .16);
    blade.rotation.y = (i / 5) * Math.PI + Math.random() * .6;
    blade.rotation.x = -.18 - Math.random() * .2;
    group.add(blade);
  }
  group.scale.setScalar(scale);
  return group;
}

function createButterfly(position, color = 0xe9c6ff) {
  const group = new THREE.Group();
  group.position.copy(position);
  scene.add(group);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(.012, .018, .18, 8), makeMaterial(0x20151f, .84));
  body.rotation.z = Math.PI / 2;
  group.add(body);

  const wingMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .88, side: THREE.DoubleSide, depthWrite: false });
  const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(.28, .22), wingMaterial.clone());
  leftWing.position.set(-.08, 0, 0);
  const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(.28, .22), wingMaterial.clone());
  rightWing.position.set(.08, 0, 0);
  group.add(leftWing, rightWing);

  butterflies.push({
    group,
    leftWing,
    rightWing,
    center: position.clone(),
    radius: .35 + Math.random() * .35,
    height: .22 + Math.random() * .22,
    speed: .35 + Math.random() * .35,
    drift: .16 + Math.random() * .2,
    phase: Math.random() * Math.PI * 2
  });
  return group;
}

function createFireflies(count, area) {
  const coreGeometry = new THREE.SphereGeometry(.055, 6, 5);
  const glowGeometry = new THREE.SphereGeometry(.15, 6, 5);
  const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffe38b, transparent: true, opacity: .9, depthWrite: false, toneMapped: false });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xf0d477, transparent: true, opacity: .18, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
  const coreMesh = new THREE.InstancedMesh(coreGeometry, coreMaterial, count);
  const glowMesh = new THREE.InstancedMesh(glowGeometry, glowMaterial, count);
  coreMesh.frustumCulled = false;
  glowMesh.frustumCulled = false;
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      x: area.x + (Math.random() - .5) * area.w,
      y: area.y + Math.random() * area.h,
      z: area.z + (Math.random() - .5) * area.d,
      vx: (Math.random() - .5) * .28,
      vy: .02 + Math.random() * .05,
      vz: (Math.random() - .5) * .28,
      phase: Math.random() * Math.PI * 2,
      speed: .65 + Math.random() * .7
    });
  }
  const dummy = new THREE.Object3D();
  items.forEach((entry, index) => {
    dummy.position.set(entry.x, entry.y, entry.z);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    coreMesh.setMatrixAt(index, dummy.matrix);
    glowMesh.setMatrixAt(index, dummy.matrix);
  });
  coreMesh.instanceMatrix.needsUpdate = true;
  glowMesh.instanceMatrix.needsUpdate = true;
  coreMesh.computeBoundingSphere();
  glowMesh.computeBoundingSphere();
  scene.add(glowMesh, coreMesh);
  fireflySystem = { coreMesh, glowMesh, items, area, dummy };
}

function chooseWeighted(options) {
  const total = options.reduce((sum, option) => sum + option.weight, 0);
  let cursor = Math.random() * total;
  for (const option of options) {
    cursor -= option.weight;
    if (cursor <= 0) return option.value;
  }
  return options[options.length - 1]?.value;
}

function normalizeClipName(clip) {
  return (clip?.name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function categorizeCompanionClips(clips) {
  const groups = { idle: [], walk: [], sit: [], lie: [], groom: [], playful: [] };
  clips.forEach((clip) => {
    const name = normalizeClipName(clip);
    if (/walk|run|trot|move|locomotion/.test(name)) groups.walk.push(clip);
    else if (/sit|seat|wait/.test(name)) groups.sit.push(clip);
    else if (/sleep|lay|lie|down|nap/.test(name)) groups.lie.push(clip);
    else if (/groom|lick|scratch|itch|clean/.test(name)) groups.groom.push(clip);
    else if (/jump|play|paw|stretch|turn|look|meow/.test(name)) groups.playful.push(clip);
    else groups.idle.push(clip);
  });
  if (!groups.idle.length && clips.length) groups.idle.push(clips[0]);
  return groups;
}

function getRandomClip(list) {
  return list[Math.floor(Math.random() * list.length)] || null;
}

function fadeToCompanionAction(actor, clip, fadeDuration = .35) {
  if (!clip || !actor.actions.has(clip.name)) return;
  const nextAction = actor.actions.get(clip.name);
  if (actor.currentAction === nextAction) return;
  const prevAction = actor.currentAction;
  nextAction.reset().enabled = true;
  nextAction.setLoop(THREE.LoopRepeat, Infinity);
  nextAction.fadeIn(fadeDuration).play();
  if (prevAction) prevAction.fadeOut(fadeDuration);
  actor.currentAction = nextAction;
}

function setCompanionState(actor, state) {
  actor.state = state;
  let clip = null;
  if (state === "walk") clip = getRandomClip(actor.groups.walk) || getRandomClip(actor.groups.idle);
  else if (state === "sit") clip = getRandomClip(actor.groups.sit) || getRandomClip(actor.groups.idle);
  else if (state === "lie") clip = getRandomClip(actor.groups.lie) || getRandomClip(actor.groups.sit) || getRandomClip(actor.groups.idle);
  else if (state === "groom") clip = getRandomClip(actor.groups.groom) || getRandomClip(actor.groups.idle);
  else if (state === "playful") clip = getRandomClip(actor.groups.playful) || getRandomClip(actor.groups.idle);
  else clip = getRandomClip(actor.groups.idle);
  fadeToCompanionAction(actor, clip, .45);
}

function pickCompanionTarget(actor) {
  for (let attempt = 0; attempt < 30; attempt++) {
    let x;
    let z;
    if (actor.roamWholeGarden) {
      x = THREE.MathUtils.lerp(gardenBounds.minX + 1.1, gardenBounds.maxX - 1.1, Math.random());
      z = THREE.MathUtils.lerp(gardenBounds.minZ + 1.1, gardenBounds.maxZ - 1.1, Math.random());
    } else {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.6 + Math.random() * actor.wanderRadius;
      x = actor.home.x + Math.cos(angle) * radius;
      z = actor.home.z + Math.sin(angle) * radius;
    }
    if (isGardenNavigable(x, z, companionCollisionRadius, actor)) return new THREE.Vector3(x, actor.baseY, z);
  }
  return actor.home.clone();
}

function chooseNextCompanionBehavior(actor, immediate = false) {
  const choices = [
    { value: "idle", weight: 38 },
    { value: "walk", weight: actor.groups.walk.length ? 28 : 0 },
    { value: "sit", weight: actor.groups.sit.length ? 14 : 0 },
    { value: "groom", weight: actor.groups.groom.length ? 10 : 0 },
    { value: "playful", weight: actor.groups.playful.length ? 8 : 0 },
    { value: "lie", weight: actor.groups.lie.length ? 6 : 0 }
  ].filter((option) => option.weight > 0);
  const nextState = chooseWeighted(choices) || "idle";
  if (nextState === "walk") {
    actor.target = pickCompanionTarget(actor);
    actor.stateTimer = actor.model.position.distanceTo(actor.target) / actor.walkSpeed + 1.5 + Math.random() * 1.5;
  } else {
    actor.target = null;
    actor.stateTimer = nextState === "idle"
      ? 3.5 + Math.random() * 3.5
      : nextState === "lie"
        ? 6 + Math.random() * 4
        : 4 + Math.random() * 3;
  }
  setCompanionState(actor, nextState);
  if (immediate && nextState !== "walk") actor.stateTimer *= .75;
}

function loadGardenCompanion(config) {
  gltfLoader.load(
    config.url,
    (gltf) => {
      const model = gltf.scene;
      model.position.copy(config.position);
      model.rotation.y = config.rotationY || 0;
      model.scale.setScalar(config.scale || 1);
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = false;
          node.receiveShadow = true;
          node.frustumCulled = true;
          if (node.material) {
            node.material.transparent = false;
            node.material.needsUpdate = true;
          }
        }
      });
      scene.add(model);

      const mixer = new THREE.AnimationMixer(model);
      const actions = new Map();
      gltf.animations.forEach((clip) => actions.set(clip.name, mixer.clipAction(clip)));
      const actorShadow = createBlobShadow(config.position.x, config.position.z, .85, .55, .26);
      const actor = {
        name: config.name,
        model,
        mixer,
        actions,
        clips: gltf.animations,
        groups: categorizeCompanionClips(gltf.animations),
        currentAction: null,
        home: config.position.clone(),
        baseY: config.position.y,
        phase: Math.random() * Math.PI * 2,
        wanderRadius: config.wanderRadius || 2.2,
        walkSpeed: config.walkSpeed || .72,
        turnSpeed: config.turnSpeed || 4.2,
        state: "idle",
        stateTimer: 0,
        target: null,
        bobAmount: config.bobAmount || .015,
        roamWholeGarden: config.roamWholeGarden !== false,
        shadow: actorShadow
      };
      const payload = { type: "companion", actor };
      model.traverse((node) => { if (node.isMesh) registerInteraction(node, payload); });
      gardenCompanions.push(actor);
      chooseNextCompanionBehavior(actor, true);
    },
    undefined,
    (error) => console.warn(`Could not load ${config.name} companion model.`, error)
  );
}

function createGardenCompanions() {
  const configs = [
    {
      name: "Lilith",
      url: "./models/lilith.glb",
      position: new THREE.Vector3(-2.4, .46, -39.4),
      rotationY: Math.PI * .2,
      scale: .0115,
      wanderRadius: 2.1,
      walkSpeed: .68,
      bobAmount: .006,
      roamWholeGarden: true
    },
    {
      name: "Apollo",
      url: "./models/apollo.glb",
      position: new THREE.Vector3(6.2, .42, -41.2),
      rotationY: -Math.PI * .58,
      scale: .012,
      wanderRadius: 1.9,
      walkSpeed: .74,
      bobAmount: .006,
      roamWholeGarden: true
    },
    {
      name: "Pietro",
      url: "./models/pietro.glb",
      position: new THREE.Vector3(4.2, .41, -46.0),
      rotationY: Math.PI * .85,
      scale: .012,
      wanderRadius: 1.8,
      walkSpeed: .7,
      bobAmount: .006,
      roamWholeGarden: true
    }
  ];
  configs.forEach(loadGardenCompanion);
}

function updateGardenCompanions(delta, time) {
  gardenCompanions.forEach((actor) => {
    actor.mixer.update(delta);
    actor.stateTimer -= delta;

    if (actor.state === "walk" && actor.target) {
      const dx = actor.target.x - actor.model.position.x;
      const dz = actor.target.z - actor.model.position.z;
      const distance = Math.hypot(dx, dz);
      const targetAngle = Math.atan2(dx, dz);
      actor.model.rotation.y = THREE.MathUtils.lerp(actor.model.rotation.y, targetAngle, Math.min(1, delta * actor.turnSpeed));
      if (distance > .08) {
        const step = Math.min(distance, actor.walkSpeed * delta);
        const nextX = actor.model.position.x + Math.sin(targetAngle) * step;
        const nextZ = actor.model.position.z + Math.cos(targetAngle) * step;
        if (isGardenNavigable(nextX, nextZ, companionCollisionRadius, actor)) {
          actor.model.position.x = nextX;
          actor.model.position.z = nextZ;
        } else {
          actor.stateTimer = 0;
          actor.target = null;
        }
      } else {
        actor.target = null;
        actor.stateTimer = 0;
      }
    }

    actor.model.position.y = actor.baseY + Math.sin(time * 1.5 + actor.phase) * actor.bobAmount;
    if (actor.shadow) {
      actor.shadow.position.x = actor.model.position.x;
      actor.shadow.position.z = actor.model.position.z;
      actor.shadow.rotation.z = -actor.model.rotation.y;
    }

    if (actor.stateTimer <= 0) chooseNextCompanionBehavior(actor);
  });
}

function createBench(position, rotationY = 0, payload = null) {
  const group = new THREE.Group();
  group.position.copy(position);
  group.rotation.y = rotationY;
  scene.add(group);
  const wood = makeMaterial(0x4b3328, .72, .04);
  const metal = makeMaterial(0x261f27, .48, .5);
  const seat = addBox(new THREE.Vector3(0, .55, 0), new THREE.Vector3(2.4, .14, .72), wood, { parent: group, cast: true });
  const back = addBox(new THREE.Vector3(0, 1.08, .3), new THREE.Vector3(2.4, .82, .12), wood, { parent: group, cast: true });
  [-.92,.92].forEach((x) => {
    addBox(new THREE.Vector3(x, .27, -.2), new THREE.Vector3(.1, .55, .1), metal, { parent: group, cast: true });
    addBox(new THREE.Vector3(x, .55, .28), new THREE.Vector3(.1, 1.1, .1), metal, { parent: group, cast: true });
  });
  if (payload) [seat, back].forEach((mesh) => registerInteraction(mesh, payload));
  return group;
}

function createParticles({ count, area, color = 0xd8c27c, size = .04, opacity = .65, id }) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];
  for (let i = 0; i < count; i++) {
    positions[i * 3] = area.x + (Math.random() - .5) * area.w;
    positions[i * 3 + 1] = area.y + Math.random() * area.h;
    positions[i * 3 + 2] = area.z + (Math.random() - .5) * area.d;
    velocities.push({ x: (Math.random() - .5) * .04, y: .03 + Math.random() * .035, z: (Math.random() - .5) * .04, phase: Math.random() * 10 });
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  decorativeParticles.push({ id, points, velocities, area });
  return points;
}

function buildMuseum() {
  scene.add(new THREE.HemisphereLight(0xc7b3e6, 0x35283b, 1.18));
  scene.add(new THREE.AmbientLight(0xfff3e8, .36));

  const museumFill = new THREE.DirectionalLight(0xf7dfc5, .42);
  museumFill.position.set(10, 13, 7);
  scene.add(museumFill);

  const museumCoolLift = new THREE.DirectionalLight(0x8ca8d6, .14);
  museumCoolLift.position.set(-8, 9, -12);
  scene.add(museumCoolLift);

  const entrance = createRoomShell({
    id: "entrance", x: 0, z: 0, w: 14, d: 14, wallColor: 0x312637, floorColor: 0x1b161e,
    openings: { north: [{ center: 0, width: 4 }], east: [{ center: 0, width: 4 }], west: [{ center: 0, width: 4 }] }
  });
  const beginnings = createRoomShell({
    id: "beginnings", x: -17, z: 0, w: 16, d: 14, wallColor: 0x4a3537, floorColor: 0x2a211f,
    openings: { east: [{ center: 0, width: 4 }] }
  });
  const everyday = createRoomShell({
    id: "everyday", x: 17, z: 0, w: 16, d: 14, wallColor: 0x42333e, floorColor: 0x251d26,
    openings: { west: [{ center: 0, width: 4 }], east: [{ center: 0, width: 4 }] }
  });
  const portraits = createRoomShell({
    id: "portraits", x: 0, z: -19, w: 20, d: 16, wallColor: 0x2d2432, floorColor: 0x19151d,
    openings: { south: [{ center: 0, width: 4 }], north: [{ center: 0, width: 4 }] }
  });
  createRoomShell({
    id: "garden", x: 0, z: -40, w: 26, d: 18, wallColor: 0x20172a, floorColor: 0x1c281d, ceiling: false,
    openings: { south: [{ center: 0, width: 4 }], north: [{ center: 0, width: 4 }] }
  });
  const finalRoom = createRoomShell({
    id: "final", x: 0, z: -61, w: 18, d: 16, wallColor: 0x251f29, floorColor: 0x171319,
    openings: { south: [{ center: 0, width: 4 }] }
  });
  finalCeiling = finalRoom.ceiling;
  createRoomShell({
    id: "thirteenth", x: 39, z: 0, w: 16, d: 14, wallColor: palette.violet, floorColor: 0x281836,
    openings: { west: [{ center: 0, width: 4 }] }
  });

  createCorridor({ x: -8, z: 0, w: 2, d: 4, axis: "x", wallColor: 0x1c141c });
  createCorridor({ x: 8, z: 0, w: 2, d: 4, axis: "x", wallColor: 0x1c141c });
  createCorridor({ x: 0, z: -9, w: 4, d: 4, axis: "z", wallColor: 0x151018 });
  createCorridor({ x: 0, z: -29, w: 4, d: 4, axis: "z", wallColor: 0x100c14 });
  createCorridor({ x: 0, z: -51, w: 4, d: 4, axis: "z", wallColor: 0x0d0a10 });
  createCorridor({ x: 28, z: 0, w: 6, d: 4, axis: "x", wallColor: 0x20112f });

  addRoomLight(0, 0, 0xffe4bd, 3.3, 16);
  addRoomLight(-17, 0, 0xffd2a0, 3.45, 17);
  addRoomLight(17, 0, 0xffd1ae, 3.25, 17);
  addRoomLight(0, -19, 0xe4d2ff, 2.75, 18);
  addRoomLight(0, -61, 0xffddae, .72, 14, 4.2);
  addRoomLight(39, 0, 0xffdcaa, 3.05, 17);

  for (let x = -5; x <= 5; x += 2.5) addWallSconce(x, 2.55, 6.78, Math.PI, 0xffd6a0);
  addWallSconce(-24.78, 2.6, -3.8, Math.PI / 2, 0xffc48b);
  addWallSconce(-24.78, 2.6, 3.8, Math.PI / 2, 0xffc48b);
  addWallSconce(24.78, 2.6, -3.8, -Math.PI / 2, 0xffcca1);
  addWallSconce(24.78, 2.6, 3.8, -Math.PI / 2, 0xffcca1);

  buildEntrance(entrance);
  buildBeginnings();
  buildEveryday();
  buildPortraitGallery();
  buildGarden();
  finalizeFlowers();
  buildFinalRoom();
  buildThirteenthRoom();
  buildMemoryStars();
  buildSecretDoor();
  buildConstellation();
  finalizeLightStrips();
  updateSecretRoomState(false);
}

function buildEntrance() {
  const portrait = createArtwork(museumData.entrancePortrait, new THREE.Vector3(0, 2.72, 6.68), Math.PI, { w: 2.85, h: 3.25, hideLabel: true }, "entrance");
  portrait.children.forEach((child) => {
    if (child.userData.interaction) child.userData.interaction.item = museumData.entrancePortrait;
  });

  for (let i = 0; i < 13; i++) {
    const angle = (i / 13) * Math.PI * 2;
    const radius = 2.5 + (i % 3) * .55;
    const star = new THREE.Mesh(new THREE.OctahedronGeometry(.045 + (i % 3) * .012), new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? palette.goldSoft : palette.gold }));
    star.position.set(Math.cos(angle) * radius, 5.28, Math.sin(angle) * radius);
    star.rotation.set(angle, angle * .5, 0);
    scene.add(star);
  }

  for (let i = 0; i < 6; i++) createPawPrint(-.28 + (i % 2) * .46, -5.8 + i * .55, i % 2 ? -.12 : .1, .23);
}

function buildBeginnings() {
  // In-scene heading removed here to avoid overlapping artwork and to improve performance.

  const positions = [
    { p: [-24.66, 2.65, -3.7], r: Math.PI / 2 },
    { p: [-24.66, 2.65, 0], r: Math.PI / 2 },
    { p: [-24.66, 2.65, 3.7], r: Math.PI / 2 },
    { p: [-17, 2.65, -6.68], r: 0 },
    { p: [-13.2, 2.65, 6.68], r: Math.PI },
    { p: [-20.8, 2.65, 6.68], r: Math.PI }
  ];
  museumData.beginnings.forEach((item, i) => createArtwork(item, new THREE.Vector3(...positions[i].p), positions[i].r, { w: 1.9, h: 2.45 }, "beginnings"));

  const rug = addBox(new THREE.Vector3(-17, .03, 0), new THREE.Vector3(6.8, .03, 4.1), makeMaterial(0x4e293a, .96, 0), { receive: true });
  rug.material.emissive = new THREE.Color(0x13070e);
  rug.material.emissiveIntensity = .2;
}

function buildEveryday() {
  // In-scene heading removed here to avoid overlapping artwork and to improve performance.

  // Keep the west doorway completely clear. Two works sit on each solid wall.
  const positions = [
    { p: [9.34, 2.55, -4.15], r: Math.PI / 2 },
    { p: [9.34, 2.55, 4.15], r: Math.PI / 2 },
    { p: [13.25, 2.55, -6.68], r: 0 },
    { p: [20.75, 2.55, -6.68], r: 0 },
    { p: [13.25, 2.55, 6.68], r: Math.PI },
    { p: [20.75, 2.55, 6.68], r: Math.PI }
  ];
  museumData.everyday.forEach((item, i) => createArtwork(item, new THREE.Vector3(...positions[i].p), positions[i].r, { w: 1.95, h: 2.38 }, "everyday"));
}

function buildPortraitGallery() {
  // In-scene heading removed here to avoid overlapping artwork and to improve performance.

  // Door openings occupy the center of the north and south walls. The former
  // x=0 frames were floating inside those openings, so the collection now
  // wraps around both doors and continues onto the side walls.
  const portraitPositions = [
    { p: [-7.7, 2.65, -26.68], r: 0 },
    { p: [-4.25, 2.65, -26.68], r: 0 },
    { p: [4.25, 2.65, -26.68], r: 0 },
    { p: [7.7, 2.65, -26.68], r: 0 },
    { p: [-7.7, 2.65, -11.32], r: Math.PI },
    { p: [-4.25, 2.65, -11.32], r: Math.PI },
    { p: [4.25, 2.65, -11.32], r: Math.PI },
    { p: [7.7, 2.65, -11.32], r: Math.PI },
    { p: [-9.84, 2.65, -19], r: Math.PI / 2 },
    { p: [9.84, 2.65, -19], r: -Math.PI / 2 }
  ];
  museumData.portraits.forEach((item, i) => createArtwork(item, new THREE.Vector3(...portraitPositions[i].p), portraitPositions[i].r, { w: 1.82, h: 2.5 }, "portraits"));

  createPedestal(new THREE.Vector3(0, 0, -19), { pt: I18N.pt.labelArchive, en: I18N.en.labelArchive }, { type: "archive" });

}

function buildGarden() {
  scene.fog = new THREE.FogExp2(0x17111d, .011);
  const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x27452a, roughness: .94, metalness: .02, emissive: 0x07130a, emissiveIntensity: .12 });
  const grassGround = new THREE.Mesh(new THREE.PlaneGeometry(25.72, 17.72), grassMaterial);
  grassGround.rotation.x = -Math.PI / 2;
  grassGround.position.set(0, .012, -40);
  grassGround.receiveShadow = true;
  scene.add(grassGround);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(75, 24, 16), new THREE.MeshBasicMaterial({ color: 0x060511, side: THREE.BackSide }));
  sky.position.set(0, 0, -40);
  scene.add(sky);

  const moon = new THREE.Mesh(new THREE.SphereGeometry(1.35, 20, 16), new THREE.MeshBasicMaterial({ color: 0xf2e7c8 }));
  moon.position.set(9, 12, -48);
  scene.add(moon);
  const moonGlow = new THREE.DirectionalLight(0xd6ddff, 1.22);
  moonGlow.position.copy(moon.position);
  moonGlow.target.position.set(0, 0, -40);
  scene.add(moonGlow.target);
  scene.add(moonGlow);


  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(240 * 3);
  for (let i = 0; i < 240; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 20 + Math.random() * 44;
    starPositions[i * 3] = Math.cos(angle) * radius;
    starPositions[i * 3 + 1] = 7 + Math.random() * 28;
    starPositions[i * 3 + 2] = -40 + Math.sin(angle) * radius;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xece7ff, size: .09, transparent: true, opacity: .8, depthWrite: false })));

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.45, .7, 5.3, 12), makeMaterial(0x3a2b28, .92));
  trunk.position.set(0, 2.65, -41);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  scene.add(trunk);
  registerCollisionCircle(0, -41, 1.55);
  createBlobShadow(0, -41, 4.6, 3.6, .3);
  for (let i = 0; i < 9; i++) {
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(1.3 + Math.random() * .55, 1), makeMaterial(0x142219, .95));
    canopy.position.set((Math.random() - .5) * 3.8, 5 + Math.random() * 2.2, -41 + (Math.random() - .5) * 3.3);
    canopy.scale.y = .8;
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    scene.add(canopy);
  }

  for (let i = 0; i < 13; i++) {
    const angle = (i / 13) * Math.PI * 2;
    createFlower(Math.cos(angle) * 4.1, -41 + Math.sin(angle) * 3.25, i % 2 === 0, .9 + (i % 3) * .12);
  }
  for (let i = 0; i < 36; i++) createFlower((Math.random() - .5) * 22, -40 + (Math.random() - .5) * 14, Math.random() > .58, .55 + Math.random() * .6);

  const poolMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a5671,
    emissive: 0x0f2332,
    emissiveIntensity: .38,
    roughness: .06,
    metalness: .32,
    transparent: true,
    opacity: .92,
  });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.46, 64), poolMaterial);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(-7, .024, -43.5);
  scene.add(pool);

  const poolHighlight = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 40),
    new THREE.MeshBasicMaterial({ color: 0xc8ddff, transparent: true, opacity: .15, depthWrite: false, blending: THREE.AdditiveBlending })
  );
  poolHighlight.rotation.x = -Math.PI / 2;
  poolHighlight.position.set(-7.55, .032, -43.9);
  poolHighlight.scale.set(1.35, .78, 1);
  scene.add(poolHighlight);

  const poolRipple = new THREE.Mesh(
    new THREE.RingGeometry(.82, .95, 48),
    new THREE.MeshBasicMaterial({ color: 0xa4d0ff, transparent: true, opacity: .12, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
  );
  poolRipple.rotation.x = -Math.PI / 2;
  poolRipple.position.set(-6.45, .03, -43.15);
  scene.add(poolRipple);

  const poolRing = new THREE.Mesh(new THREE.RingGeometry(2.5, 2.82, 64), makeMaterial(0x665b65, .92, .02));
  poolRing.rotation.x = -Math.PI / 2;
  poolRing.position.set(-7, .026, -43.5);
  poolRing.receiveShadow = true;
  scene.add(poolRing);
  decorativeParticles.push({ id: "pool", mesh: pool, highlight: poolHighlight, ripple: poolRipple, ring: poolRing });

  createBench(new THREE.Vector3(6.7, 0, -38.7), -Math.PI / 2, { type: "garden" });
  createBlobShadow(6.7, -38.7, 2.8, 1.35, .24);
  registerCollisionCircle(6.7, -38.7, 1.45);
  createPedestal(new THREE.Vector3(8.2, 0, -43.5), { pt: I18N.pt.labelLeaveLight, en: I18N.en.labelLeaveLight }, { type: "garden" });
  createBlobShadow(8.2, -43.5, 1.6, 1.25, .2);
  registerCollisionCircle(8.2, -43.5, 1.08);

  for (let i = 0; i < 8; i++) createPawPrint(-1 + (i % 2) * .42, -33.3 - i * .72, i % 2 ? .12 : -.08, .22);

  gardenGrass = createGrassField(lowPowerDevice ? 340 : 460);

  createFireflies(lowPowerDevice ? 18 : 28, { x: 0, y: .45, z: -40, w: 23, h: 4.1, d: 15 });
  createGardenCompanions();
  gardenNotes.forEach((note, index) => createGardenStar(note, index, false));
}

function buildFinalRoom() {
  const finalItem = museumData.finalPortrait || {
    title: "Lilith",
    date: museumData.identity.dates,
    caption: "Loved forever. Forgotten never.",
    memory: "Your life was not only the time between two dates. It was every moment of love held between them.",
    image: museumData.entrancePortrait.image
  };
  const group = createArtwork(finalItem, new THREE.Vector3(0, 2.85, -68.68), 0, { w: 3.7, h: 4.35 }, "final");
  finalPortrait = group;
  group.traverse((child) => {
    if (child.isMesh && child.userData.isPhoto) {
      child.material.transparent = true;
      child.material.opacity = .08;
      child.material.emissiveIntensity = 0;
      finalPortrait.userData.photoMaterial = child.material;
    }
  });
  finalPortraitLight = { intensity: 0 };

}

function buildThirteenthRoom() {
  const skylightFrame = new THREE.Mesh(new THREE.TorusGeometry(2.3, .18, 16, 48), makeMaterial(0x8f6b2f, .32, .6));
  skylightFrame.rotation.x = Math.PI / 2;
  skylightFrame.position.set(39, 8.05, 0);
  scene.add(skylightFrame);
  const skylight = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), new THREE.MeshBasicMaterial({ color: 0x09071a, side: THREE.DoubleSide }));
  skylight.rotation.x = Math.PI / 2;
  skylight.position.set(39, 8.06, 0);
  scene.add(skylight);

  const central = createArtwork({
    ...(museumData.thirteenthPortrait || museumData.entrancePortrait),
    title: "Lilith",
    caption: "Some lives are measured in years. Others are measured by how deeply they change us."
  }, new THREE.Vector3(46.68, 2.85, 0), -Math.PI / 2, { w: 3.15, h: 3.75 }, "thirteenth");
  central.scale.setScalar(1.02);

  const candlePositions = [];
  const baseMesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(.08, .1, .38, 8),
    new THREE.MeshStandardMaterial({ color: 0xead8be, roughness: .82, emissive: 0x21170f, emissiveIntensity: .08 }),
    13
  );
  const flameMesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.055, 7, 6),
    new THREE.MeshBasicMaterial({ color: 0xffd88b, toneMapped: false }),
    13
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 13; i++) {
    const angle = (i / 13) * Math.PI * 2;
    const radius = 3.35;
    const x = 39 + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    candlePositions.push({ x, z, phase: i * .5 });
    dummy.position.set(x, .19, z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    baseMesh.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, .44, z);
    dummy.scale.set(1, 1.45, 1);
    dummy.updateMatrix();
    flameMesh.setMatrixAt(i, dummy.matrix);
  }
  baseMesh.instanceMatrix.needsUpdate = true;
  flameMesh.instanceMatrix.needsUpdate = true;
  baseMesh.computeBoundingSphere();
  flameMesh.computeBoundingSphere();
  scene.add(baseMesh, flameMesh);
  candleSystem = { baseMesh, flameMesh, positions: candlePositions, dummy };

  createPedestal(new THREE.Vector3(35.3, 0, -3.7), { pt: I18N.pt.labelReadLetter, en: I18N.en.labelReadLetter }, { type: "letter" });
  createParticles({ count: 46, area: { x: 39, y: .2, z: 0, w: 13, h: 4.6, d: 11 }, color: 0xe6c474, size: .045, opacity: .52, id: "thirteenth" });
}

function buildMemoryStars() {
  const positions = [
    [4.8, 4.65, 3.9], [-13.7, .75, 4.8], [-23.8, 4.2, -4.7], [-18.5, 1.15, -1.7],
    [10.2, 4.15, 4.8], [23.7, 1.05, -4.7], [18.4, 4.55, -1.2],
    [-8.8, 1.0, -22.7], [8.9, 4.6, -15.2], [0, .75, -24.6],
    [-10.7, .72, -46.5], [10.8, 3.7, -35], [0, 4.55, -57]
  ];
  positions.forEach((position, index) => createMemoryStar(index, new THREE.Vector3(...position)));
  updateStarUI();
}

function buildSecretDoor() {
  const group = new THREE.Group();
  group.position.set(25.05, 0, 0);
  scene.add(group);
  const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x2c173d, roughness: .72, metalness: .08, emissive: 0x0d0515, emissiveIntensity: .25 });
  const door = addBox(new THREE.Vector3(0, 2.35, 0), new THREE.Vector3(.32, 4.7, 3.7), doorMaterial, { parent: group, cast: true });
  const emblem = new THREE.Mesh(new THREE.TorusGeometry(.44, .05, 14, 32), new THREE.MeshStandardMaterial({ color: palette.gold, emissive: 0x55350e, emissiveIntensity: .5, metalness: .7, roughness: .28 }));
  emblem.rotation.y = Math.PI / 2;
  emblem.position.set(-.18, 2.6, 0);
  group.add(emblem);
  const number = createTextCanvas([{ text: "13", size: 138, color: "#d7b46a" }], { width: 500, height: 400, startY: 205 });
  const numberPlane = new THREE.Mesh(new THREE.PlaneGeometry(.72, .6), new THREE.MeshBasicMaterial({ map: textCanvasTexture(number), transparent: true, side: THREE.DoubleSide, toneMapped: false }));
  numberPlane.rotation.y = -Math.PI / 2;
  numberPlane.position.set(-.17, 2.58, 0);
  group.add(numberPlane);
  secretDoor = group;
  secretDoor.userData.closedY = 0;
  secretDoor.userData.openY = 5.1;
  secretDoorLight = { intensity: 0 };
  [door, emblem, numberPlane].forEach((mesh) => registerInteraction(mesh, { type: "secret-door" }));
}

function buildConstellation() {
  const shape = [
    [-1.8, .7], [-1.25, 2.2], [-.3, 1.45], [.6, 2.2], [1.42, .78], [1.25, -.35],
    [.55, -1.0], [-.2, -1.18], [-.92, -.72], [-1.35, -1.55], [-.55, -2.12], [.45, -2.0], [1.65, -1.25]
  ];
  const points = [];
  shape.forEach(([x, y], index) => {
    const star = new THREE.Mesh(new THREE.SphereGeometry(.075, 14, 14), new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? 0xffe5a9 : 0xe8e7ff, transparent: true, opacity: 0 }));
    star.position.set(x * 1.35, 10.1 + y * 1.1, -64.5);
    star.scale.setScalar(.001);
    scene.add(star);
    finalConstellationStars.push(star);
    points.push(star.position.clone());
  });
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  constellationLine = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xb9afd7, transparent: true, opacity: 0 }));
  scene.add(constellationLine);
}

function createGardenStar(note, index, animate = true) {
  const goldenAngle = 2.399963;
  const radius = 5 + (index % 8) * 1.25;
  const angle = index * goldenAngle;
  const colors = [0xffd166, 0xe1b7ff, 0x8ad8ff, 0xff9ecf, 0xb8ffb0, 0xf7c6ff];
  const color = colors[index % colors.length];

  const group = new THREE.Group();
  group.position.set(Math.cos(angle) * radius, 8 + (index % 5) * .75, -40 + Math.sin(angle) * radius * .72);
  group.scale.setScalar(animate ? .001 : 1);
  group.userData.note = note;

  const glow = new THREE.Mesh(new THREE.SphereGeometry(.18 + (index % 2) * .035, 14, 14), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: animate ? 0 : .34, depthWrite: false, blending: THREE.AdditiveBlending }));
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(.085 + (index % 3) * .014, 0), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: animate ? 0 : 1, depthWrite: false, blending: THREE.AdditiveBlending }));
  group.add(glow, core);
  scene.add(group);
  gardenUserStars.push({ group, core, glow, born: animate ? performance.now() : 0, index, baseScale: 1.35 + (index % 3) * .12, pulseOffset: Math.random() * Math.PI * 2 });
}

function updateSecretRoomState(showToast = true) {
  const unlocked = foundStars.size >= 13;
  if (unlocked && !walkableRects.some((rect) => rect.id === "secret-corridor")) {
    walkableRects.push({ id: "secret-corridor", minX: 24.8, maxX: 31.2, minZ: -2, maxZ: 2 });
    walkableRects.push({ id: "thirteenth", minX: 31, maxX: 47, minZ: -7, maxZ: 7 });
  }
  if (secretDoor) {
    secretDoor.userData.unlocked = unlocked;
    secretDoorLight.intensity = unlocked ? 1.35 : 0;
    secretDoor.children.forEach((child) => {
      if (child.material?.emissive) child.material.emissiveIntensity = unlocked ? 1.2 : .25;
    });
  }
  if (unlocked && showToast) showToastMessage(langPack().thirteenthOpen, 4300);
}

function registerCollisionCircle(x, z, radius, options = {}) {
  staticCollisionCircles.push({ x, z, radius, room: options.room || null, tags: options.tags || ["player", "companion"] });
}

function pointInsideGarden(x, z, padding = 0) {
  return x > gardenBounds.minX + padding && x < gardenBounds.maxX - padding && z > gardenBounds.minZ + padding && z < gardenBounds.maxZ - padding;
}

function collidesWithStaticCircles(x, z, radius = 0, tag = "player") {
  return staticCollisionCircles.some((circle) => {
    if (circle.tags && !circle.tags.includes(tag)) return false;
    return Math.hypot(x - circle.x, z - circle.z) < circle.radius + radius;
  });
}

function collidesWithCompanions(x, z, radius = 0, self = null) {
  return gardenCompanions.some((actor) => actor !== self && actor.model && Math.hypot(x - actor.model.position.x, z - actor.model.position.z) < companionCollisionRadius + radius);
}

function isGardenNavigable(x, z, radius = 0, self = null) {
  if (!pointInsideGarden(x, z, radius + .08)) return false;
  if (collidesWithStaticCircles(x, z, radius, "companion")) return false;
  if (collidesWithCompanions(x, z, radius, self)) return false;
  return true;
}

function isWalkable(x, z) {
  const margin = .05;
  const insideWalkable = walkableRects.some((rect) => x > rect.minX + margin && x < rect.maxX - margin && z > rect.minZ + margin && z < rect.maxZ - margin);
  if (!insideWalkable) return false;
  if (pointInsideGarden(x, z)) {
    if (collidesWithStaticCircles(x, z, .26, "player")) return false;
    if (collidesWithCompanions(x, z, .32)) return false;
  }
  return true;
}

function showRoom(id, force = false) {
  if (!museumData.roomTexts[id]) return;
  if (!force && currentRoom === id && roomCard.classList.contains("is-visible")) return;
  currentRoom = id;
  const roomTexts = ROOM_TEXTS[currentLang] || ROOM_TEXTS.en;
  const data = roomTexts[id] || museumData.roomTexts[id];
  roomKicker.textContent = data.kicker;
  roomTitle.textContent = data.title;
  roomDescription.textContent = data.description;
  const dates = ROOM_DATES[currentLang] || ROOM_DATES.pt;
  roomDate.textContent = dates[id] || "";
  roomDate.style.display = roomDate.textContent ? "block" : "none";
  roomCard.classList.add("is-visible");
  clearTimeout(roomCardTimer);
  ambientAudio.setPurr(id === "thirteenth");
}

function detectRoom() {
  const position = camera.position;
  const zone = roomZones.find((room) => position.x >= room.minX && position.x <= room.maxX && position.z >= room.minZ && position.z <= room.maxZ);
  if (zone) showRoom(zone.id);
}

function findInteraction() {
  if (modalOpen || finalSequenceStarted) return null;
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersections = raycaster.intersectObjects(interactionMeshes, false);
  const visibleHit = intersections.find((hit) => hit.object.visible && hit.object.userData.interaction);
  if (visibleHit) return visibleHit.object.userData.interaction;

  let nearest = null;
  let nearestDistance = Infinity;
  interactionMeshes.forEach((mesh) => {
    if (!mesh.visible || !mesh.userData.interaction) return;
    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    const distance = worldPos.distanceTo(camera.position);
    if (distance < 1.2 && distance < nearestDistance) {
      nearestDistance = distance;
      nearest = mesh.userData.interaction;
    }
  });
  return nearest;
}

function clearArtworkPromptOffset() {
  interactionPrompt?.style.removeProperty("bottom");
}

function placeInteractionPromptAboveArtwork() {
  if (!artworkCard?.classList.contains("is-visible") || !interactionPrompt) {
    clearArtworkPromptOffset();
    return;
  }
  const cardRect = artworkCard.getBoundingClientRect();
  const gap = 22;
  const bottom = Math.ceil(window.innerHeight - cardRect.top + gap);
  interactionPrompt.style.bottom = `${bottom}px`;
}

function updateArtworkCard() {
  if (!artworkCard) return;
  const found = activeInteraction;
  if (!found || found.type !== "artwork" || modalOpen) {
    artworkCard.classList.remove("is-visible");
    clearArtworkPromptOffset();
    return;
  }
  const item = localizedItem(found.item);
  artworkCardKicker.textContent = currentLang === "pt" ? "FOTOGRAFIA" : "PHOTOGRAPH";
  artworkCardTitle.textContent = item.title || "";
  artworkCardDate.textContent = item.date || "";
  artworkCard.classList.add("is-visible");
  placeInteractionPromptAboveArtwork();
}

function updateInteractionPrompt() {
  const found = findInteraction();
  activeInteraction = found;
  if (!found) {
    interactionPrompt.classList.remove("is-visible", "over-artwork");
    updateArtworkCard();
    clearArtworkPromptOffset();
    return;
  }
  const strings = langPack();
  const labels = {
    "artwork": strings.viewMemory,
    "memory-star": foundStars.has(found.index) ? strings.rememberStar : strings.discoverMemory,
    "garden": strings.leaveLight,
    "letter": strings.readLetter,
    "archive": strings.openArchive,
    "companion": strings.petCat(found.actor?.name || "cat"),
    "secret-door": foundStars.size >= 13 ? strings.enterThirteenth : strings.starsRemaining(13 - foundStars.size)
  };
  interactionText.textContent = labels[found.type] || strings.interact;
  interactionPrompt.classList.toggle("over-artwork", found.type === "artwork");
  interactionPrompt.classList.add("is-visible");
  updateArtworkCard();
  if (found.type === "artwork") placeInteractionPromptAboveArtwork();
  else clearArtworkPromptOffset();
}

function handleInteraction() {
  if (modalOpen) return;
  const interaction = activeInteraction || findInteraction();
  if (!interaction) return;
  if (interaction.type === "artwork") openArtwork(interaction);
  if (interaction.type === "memory-star") discoverStar(interaction);
  if (interaction.type === "garden") openModal(gardenModal);
  if (interaction.type === "letter") openModal(letterModal);
  if (interaction.type === "archive") {
    renderPhotoArchive();
    openModal(archiveModal);
  }
  if (interaction.type === "companion") petCompanion(interaction);
  if (interaction.type === "secret-door") {
    if (foundStars.size >= 13) showToastMessage(langPack().thirteenthAlreadyOpen);
    else showToastMessage(langPack().memoryRemainingToast(13 - foundStars.size));
  }
}

function petCompanion(interaction) {
  const actor = interaction.actor;
  if (!actor) return;
  if (!playRecordedCatMeow(actor.name)) {
    if (actor.name === "Apollo") ambientAudio.playApolloMeow();
    else ambientAudio.playMeow(actor.name.length);
  }
  actor.target = null;
  actor.stateTimer = 2.8 + Math.random() * 2;
  const responseState = actor.groups.playful.length ? "playful" : actor.groups.sit.length ? "sit" : "idle";
  setCompanionState(actor, responseState);
  showToastMessage(langPack().petToast(actor.name), 1800);
}

function discoverStar(interaction) {
  const index = interaction.index;
  const data = localizedMemoryStar(index);
  if (!foundStars.has(index)) {
    foundStars.add(index);
    localStorage.setItem(STORAGE.stars, JSON.stringify([...foundStars]));
    interaction.coreMaterial.color.setHex(palette.goldSoft);
    interaction.coreMaterial.emissive.setHex(0xffd993);
    interaction.coreMaterial.emissiveIntensity = 2.4;
    interaction.halo.material.color.setHex(palette.goldSoft);
    interaction.halo.material.opacity = .72;
    updateStarUI();
    updateSecretRoomState(true);
  }
  memoryNumber.textContent = langPack().memoryNumber(index);
  memoryTitle.textContent = data.title;
  memoryMessage.textContent = data.message;
  openStandalone(memoryReveal);
}

function updateStarUI() {
  starCount.textContent = foundStars.size;
}

function renderPhotoArchive() {
  if (archiveRendered || !archiveGrid) return;
  const items = museumData.photoArchive || [];
  archiveCount.textContent = langPack().archiveCount(items.length);
  const fragment = document.createDocumentFragment();
  items.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-card";
    button.setAttribute("aria-label", `${currentLang === "pt" ? "Abrir" : "Open"} ${localizedItem(item).title}`);

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = `${localizedItem(item).title} — Lilith`;
    image.loading = "lazy";
    image.decoding = "async";

    const copy = document.createElement("span");
    copy.className = "archive-card-copy";
    const number = document.createElement("small");
    number.textContent = String(index + 1).padStart(2, "0");
    const date = document.createElement("strong");
    date.textContent = localizedItem(item).date || langPack().memoryNumber(index).replace(/\s+\d+.*$/, "");
    copy.append(number, date);
    button.append(image, copy);
    button.addEventListener("click", () => {
      archiveModal.classList.remove("is-visible");
      openArtwork({ type: "artwork", item, previewSrc: item.image });
    });
    fragment.appendChild(button);
  });
  archiveGrid.appendChild(fragment);
  archiveRendered = true;
}

function populateArtworkModal(interaction) {
  if (!interaction) return;
  const { item, previewSrc } = interaction;
  const displayItem = localizedItem(item);
  artworkImage.src = previewSrc;
  artworkImage.alt = `${displayItem.title} — Lilith`;
  artworkDate.textContent = displayItem.date || "";
  artworkTitle.textContent = displayItem.title;
  artworkCaption.textContent = displayItem.caption || "";
  artworkMemory.textContent = displayItem.memory || "";
  const key = item.title;
  favoriteButton.textContent = favorites.has(key) ? langPack().favoriteSaved : langPack().addFavorite;
  audioButton.classList.toggle("is-hidden", !item.audio);
  audioButton.textContent = langPack().playAudio;
}

function openArtwork(interaction) {
  currentArtwork = interaction;
  artworkCard?.classList.remove("is-visible");
  clearArtworkPromptOffset();
  populateArtworkModal(interaction);
  openModal(artworkModal);
}

function openModal(element) {
  modalOpen = true;
  controls.unlock();
  element.classList.add("is-visible");
}

function openStandalone(element) {
  modalOpen = true;
  controls.unlock();
  element.classList.add("is-visible");
}

function closeElement(element) {
  element.classList.remove("is-visible");
  modalOpen = false;
  stopCurrentAudio();
  if (started && !isTouch && !finalSequenceStarted) controls.lock();
}

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function showToastMessage(message, duration = 2600) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), duration);
}

function saveGardenMessage(message) {
  const clean = message.trim();
  if (!clean) return;
  gardenNotes.push(clean);
  localStorage.setItem(STORAGE.garden, JSON.stringify(gardenNotes));
  createGardenStar(clean, gardenNotes.length - 1, true);
  renderGardenMessages();
  gardenMessage.value = "";
  messageCount.textContent = "0 / 220";
  closeElement(gardenModal);
  showToastMessage(langPack().gardenToast, 3800);
}

function renderGardenMessages() {
  gardenMessages.innerHTML = "";
  if (!gardenNotes.length) {
    const empty = document.createElement("div");
    empty.className = "garden-message";
    empty.textContent = langPack().emptyGarden;
    gardenMessages.appendChild(empty);
    return;
  }
  [...gardenNotes].reverse().slice(0, 8).forEach((message) => {
    const item = document.createElement("div");
    item.className = "garden-message";
    item.textContent = message;
    gardenMessages.appendChild(item);
  });
}

function animateSecretDoor(delta) {
  if (!secretDoor) return;
  const targetY = secretDoor.userData.unlocked ? secretDoor.userData.openY : secretDoor.userData.closedY;
  secretDoor.position.y = THREE.MathUtils.damp(secretDoor.position.y, targetY, 2.2, delta);
}

function animateFinalReveal(delta) {
  if (!finalPortrait || finalSequenceStarted) return;
  const distance = camera.position.distanceTo(new THREE.Vector3(0, 1.65, -65.8));
  const reveal = THREE.MathUtils.clamp(1 - (distance - 2.2) / 8, 0, 1);
  if (finalPortrait.userData.photoMaterial) {
    finalPortrait.userData.photoMaterial.opacity = THREE.MathUtils.damp(finalPortrait.userData.photoMaterial.opacity, .08 + reveal * .92, 3, delta);
    
  }
  finalPortraitLight.intensity = THREE.MathUtils.damp(finalPortraitLight.intensity, .05 + reveal * 3.6, 2.4, delta);
  if (camera.position.z < -63.2 && Math.abs(camera.position.x) < 4.5 && reveal > .63) startFinalSequence();
}

function startFinalSequence() {
  if (finalSequenceStarted) return;
  finalSequenceStarted = true;
  controls.unlock();
  finalOverlay.classList.add("is-visible");
  interactionPrompt.classList.remove("is-visible");
}

function lookAtSky() {
  if (skySequenceStarted) return;
  skySequenceStarted = true;
  finalOverlay.classList.remove("is-visible");
  const startRotation = camera.rotation.clone();
  const dummy = camera.clone();
  dummy.lookAt(new THREE.Vector3(0, 10.2, -64.5));
  const endQuaternion = dummy.quaternion.clone();
  const startQuaternion = camera.quaternion.clone();
  const startTime = performance.now();
  const duration = 5200;

  function sequence(now) {
    const t = THREE.MathUtils.clamp((now - startTime) / duration, 0, 1);
    const eased = t * t * (3 - 2 * t);
    camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, eased);
    if (finalCeiling) {
      finalCeiling.material.opacity = 1 - eased;
      finalCeiling.visible = finalCeiling.material.opacity > .01;
    }
    finalConstellationStars.forEach((star, index) => {
      const localT = THREE.MathUtils.clamp((t - index * .045) / .3, 0, 1);
      const smooth = localT * localT * (3 - 2 * localT);
      star.scale.setScalar(Math.max(.001, smooth));
      star.material.opacity = smooth;
    });
    if (constellationLine) constellationLine.material.opacity = Math.max(0, (t - .62) * 1.4) * .22;
    if (t < 1) requestAnimationFrame(sequence);
    else setTimeout(() => skyMessage.classList.add("is-visible"), 700);
  }
  requestAnimationFrame(sequence);
}

function updateMovement(delta) {
  if (!started || modalOpen || finalSequenceStarted) return;
  if (!isTouch && !controls.isLocked) return;
  const speed = isTouch ? 3.0 : 3.65;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const move = new THREE.Vector3();
  if (keys.forward) move.add(forward);
  if (keys.backward) move.sub(forward);
  if (keys.right) move.add(right);
  if (keys.left) move.sub(right);
  if (move.lengthSq() === 0) return;
  move.normalize().multiplyScalar(speed * delta);
  const next = camera.position.clone().add(move);
  if (isWalkable(next.x, camera.position.z)) camera.position.x = next.x;
  if (isWalkable(camera.position.x, next.z)) camera.position.z = next.z;
}

function updateAnimations(time, delta) {
  animatedStars.forEach((entry) => {
    entry.group.rotation.y += delta * .45;
    entry.group.position.y = entry.baseY + Math.sin(time * 1.5 + entry.offset) * .035;
    if (entry.halo) {
      entry.halo.rotation.z += delta * .35;
      entry.halo.material.opacity += Math.sin(time * 2 + entry.offset) * .0012;
    }
  });

  const thirteenthActiveGlobal = camera.position.x > 29 && Math.abs(camera.position.z) < 9;
  if (candleSystem) {
    candleSystem.baseMesh.visible = thirteenthActiveGlobal;
    candleSystem.flameMesh.visible = thirteenthActiveGlobal;
    if (thirteenthActiveGlobal) {
      const { flameMesh, positions, dummy } = candleSystem;
      positions.forEach((entry, index) => {
        const flicker = 1.25 + Math.sin(time * 8 + entry.phase) * .17;
        dummy.position.set(entry.x, .44 + Math.sin(time * 6 + entry.phase) * .008, entry.z);
        dummy.scale.set(.92 + Math.sin(time * 7 + entry.phase) * .06, flicker, .92);
        dummy.updateMatrix();
        flameMesh.setMatrixAt(index, dummy.matrix);
      });
      flameMesh.instanceMatrix.needsUpdate = true;
    }
  }

  decorativeParticles.forEach((entry) => {
    if (entry.id === "pool") {
      entry.mesh.material.opacity = .9;
      entry.mesh.material.emissiveIntensity = .36;
      if (entry.highlight) entry.highlight.material.opacity = .14;
      if (entry.ripple) entry.ripple.material.opacity = .1;
      return;
    }
    if (entry.id === "thirteenth" && !thirteenthActiveGlobal) return;
    const positions = entry.points.geometry.attributes.position.array;
    for (let i = 0; i < entry.velocities.length; i++) {
      const v = entry.velocities[i];
      positions[i * 3] += v.x * delta + Math.sin(time + v.phase) * .0005;
      positions[i * 3 + 1] += v.y * delta;
      positions[i * 3 + 2] += v.z * delta;
      if (positions[i * 3 + 1] > entry.area.y + entry.area.h) positions[i * 3 + 1] = entry.area.y;
    }
    entry.points.geometry.attributes.position.needsUpdate = true;
    entry.points.material.opacity = .52 + Math.sin(time * 1.4) * .16;
  });

  const gardenActive = camera.position.z < -27 && camera.position.z > -52 && Math.abs(camera.position.x) < 15;
  if (gardenGrass) gardenGrass.visible = gardenActive;
  flowerMeshes.forEach((mesh) => { mesh.visible = gardenActive; });
  if (fireflySystem) {
    fireflySystem.coreMesh.visible = gardenActive;
    fireflySystem.glowMesh.visible = gardenActive;
  }
  gardenCompanions.forEach((actor) => {
    actor.model.visible = gardenActive;
    if (actor.shadow) actor.shadow.visible = gardenActive;
  });
  gardenUserStars.forEach((entry) => { entry.group.visible = gardenActive; });
  if (gardenActive && fireflySystem) {
    const { coreMesh, glowMesh, items, area, dummy } = fireflySystem;
    items.forEach((entry, index) => {
      entry.x += entry.vx * delta + Math.sin(time * entry.speed + entry.phase) * .0022;
      entry.y += entry.vy * delta * .18 + Math.sin(time * (entry.speed * 1.6) + entry.phase) * .002;
      entry.z += entry.vz * delta + Math.cos(time * entry.speed + entry.phase) * .0022;
      if (entry.x < area.x - area.w / 2) entry.x = area.x + area.w / 2;
      if (entry.x > area.x + area.w / 2) entry.x = area.x - area.w / 2;
      if (entry.z < area.z - area.d / 2) entry.z = area.z + area.d / 2;
      if (entry.z > area.z + area.d / 2) entry.z = area.z - area.d / 2;
      if (entry.y < area.y) entry.y = area.y + area.h;
      if (entry.y > area.y + area.h) entry.y = area.y;
      const blink = .72 + Math.sin(time * (3.2 + (index % 3) * .55) + entry.phase) * .28;
      dummy.position.set(entry.x, entry.y, entry.z);
      dummy.scale.setScalar(.7 + blink * .42);
      dummy.updateMatrix();
      coreMesh.setMatrixAt(index, dummy.matrix);
      dummy.scale.setScalar(.8 + blink * .72);
      dummy.updateMatrix();
      glowMesh.setMatrixAt(index, dummy.matrix);
    });
    coreMesh.instanceMatrix.needsUpdate = true;
    glowMesh.instanceMatrix.needsUpdate = true;
  }

  butterflies.forEach((entry) => {
    const t = time * entry.speed + entry.phase;
    entry.group.position.x = entry.center.x + Math.cos(t) * entry.radius;
    entry.group.position.z = entry.center.z + Math.sin(t * .85) * entry.radius * .6;
    entry.group.position.y = entry.center.y + Math.sin(t * 1.7) * entry.height;
    entry.group.rotation.y = Math.atan2(Math.cos(t * .85) * entry.radius * .6, -Math.sin(t) * entry.radius) + Math.PI / 2;
    const flap = Math.sin(time * 12 + entry.phase) * .85;
    entry.leftWing.rotation.y = flap;
    entry.rightWing.rotation.y = -flap;
  });

  if (gardenActive) updateGardenCompanions(delta, time);

  if (gardenActive) gardenUserStars.forEach((entry) => {
    entry.group.rotation.y += delta * .55;
    const pulse = .92 + Math.sin(time * 2.35 + entry.index + entry.pulseOffset) * .28;
    if (entry.born) {
      const age = (performance.now() - entry.born) / 1200;
      const t = THREE.MathUtils.clamp(age, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      entry.group.scale.setScalar(Math.max(.001, eased * entry.baseScale));
      entry.core.material.opacity = eased * .95;
      entry.glow.material.opacity = eased * .22;
      if (t >= 1) entry.born = 0;
    } else {
      entry.group.scale.setScalar(entry.baseScale * pulse);
      entry.core.material.opacity = .78 + Math.sin(time * 2.4 + entry.index) * .18;
      entry.glow.material.opacity = .24 + Math.sin(time * 2.1 + entry.index) * .12;
    }
  });
}

function applyBrightness() {
  renderer.toneMappingExposure = brightnessLevels[brightnessLevel];
  if (brightnessButton) {
    brightnessButton.textContent = brightnessLevel === 0 ? "◐" : brightnessLevel === 1 ? "☀" : "☼";
    brightnessButton.title = langPack().brightnessTitles[brightnessLevel];
    brightnessButton.setAttribute("aria-label", brightnessButton.title);
  }
}

function monitorPerformance(delta) {
  performanceFrames += 1;
  performanceWindow += delta;
  if (performanceWindow < 3) return;
  const fps = performanceFrames / performanceWindow;
  const minimumPixelRatio = lowPowerDevice ? .64 : .72;
  if (fps < 48 && pixelRatioCap > minimumPixelRatio) {
    pixelRatioCap = Math.max(minimumPixelRatio, pixelRatioCap - .05);
    renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatioCap));
    renderer.setSize(innerWidth, innerHeight, false);
  }
  performanceFrames = 0;
  performanceWindow = 0;
}

let lastRenderedAt = 0;
function animate(timestamp = 0) {
  requestAnimationFrame(animate);
  if (document.hidden) return;
  const minFrameMs = lowPowerDevice ? 25 : 20;
  if (timestamp - lastRenderedAt < minFrameMs) return;
  lastRenderedAt = timestamp;
  const delta = Math.min(clock.getDelta(), .05);
  const time = clock.elapsedTime;
  updateMovement(delta);
  updateAnimations(time, delta);
  animateSecretDoor(delta);
  animateFinalReveal(delta);

  roomCheckTimer += delta;
  interactionCheckTimer += delta;
  if (roomCheckTimer >= .16) {
    detectRoom();
    roomCheckTimer = 0;
  }
  if (interactionCheckTimer >= .075) {
    updateInteractionPrompt();
    interactionCheckTimer = 0;
  }

  monitorPerformance(delta);
  updateWorldLabels();
  renderer.render(scene, camera);
}

function startExperience() {
  if (started) return;
  if (!bootReady) {
    updateLoadingProgress(0, 1, langPack().loadingOptimizing);
    return;
  }
  started = true;
  ambientAudio.start();
  intro.classList.add("is-leaving");
  hud.classList.remove("is-hidden");
  starProgress.classList.remove("is-hidden");
  reticle.classList.remove("is-hidden");
  setTimeout(() => {
    intro.classList.remove("is-visible");
    intro.classList.remove("is-leaving");
  }, 1600);
  showRoom("entrance", true);
  if (!isTouch) controls.lock();
  else mobileControls.setAttribute("aria-hidden", "false");
}

function setKey(event, pressed) {
  const mapping = {
    KeyW: "forward", ArrowUp: "forward",
    KeyS: "backward", ArrowDown: "backward",
    KeyA: "left", ArrowLeft: "left",
    KeyD: "right", ArrowRight: "right"
  };
  if (mapping[event.code]) keys[mapping[event.code]] = pressed;
  if (pressed && event.code === "KeyE") handleInteraction();
}

enterButton.addEventListener("click", startExperience);
canvas.addEventListener("click", () => {
  if (started && !modalOpen && !finalSequenceStarted && !isTouch && !controls.isLocked) controls.lock();
});
controls.addEventListener("lock", () => reticle.classList.remove("is-hidden"));
controls.addEventListener("unlock", () => reticle.classList.add("is-hidden"));
window.addEventListener("keydown", (event) => setKey(event, true));
window.addEventListener("keyup", (event) => setKey(event, false));

soundButton.addEventListener("click", () => ambientAudio.toggle());
languageButton?.addEventListener("click", () => { currentLang = currentLang === "pt" ? "en" : "pt"; localStorage.setItem(STORAGE.language, currentLang); applyLanguage(); });
brightnessButton?.addEventListener("click", () => {
  brightnessLevel = (brightnessLevel + 1) % brightnessLevels.length;
  localStorage.setItem("lilith-museum-brightness", String(brightnessLevel));
  applyBrightness();
});
helpButton.addEventListener("click", () => openModal(helpModal));
mobileInteract.addEventListener("click", handleInteraction);

favoriteButton.addEventListener("click", () => {
  if (!currentArtwork) return;
  const key = currentArtwork.item.title;
  if (favorites.has(key)) favorites.delete(key);
  else favorites.add(key);
  localStorage.setItem(STORAGE.favorites, JSON.stringify([...favorites]));
  favoriteButton.textContent = favorites.has(key) ? langPack().favoriteSaved : langPack().addFavorite;
});

fullscreenImageButton.addEventListener("click", async () => {
  try {
    if (artworkImage.requestFullscreen) await artworkImage.requestFullscreen();
  } catch (error) {
    console.warn("Fullscreen mode was not available.", error);
  }
});

audioButton.addEventListener("click", () => {
  const source = currentArtwork?.item?.audio;
  if (!source) return;
  if (currentAudio) {
    stopCurrentAudio();
    audioButton.textContent = langPack().playAudio;
    return;
  }
  currentAudio = new Audio(source);
  currentAudio.addEventListener("ended", () => {
    currentAudio = null;
    audioButton.textContent = langPack().playAudio;
  });
  currentAudio.play().catch(() => showToastMessage(langPack().audioError));
  audioButton.textContent = langPack().stopAudio;
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(`#${button.dataset.close}`);
    if (target) closeElement(target);
  });
});

gardenMessage.addEventListener("input", () => {
  messageCount.textContent = `${gardenMessage.value.length} / 220`;
});
gardenForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveGardenMessage(gardenMessage.value);
});
lookSkyButton.addEventListener("click", lookAtSky);
returnButton.addEventListener("click", () => window.location.reload());

letterContent.textContent = langPack().letterContent;
renderGardenMessages();
applyLanguage();

const moveButtons = document.querySelectorAll("[data-move]");
moveButtons.forEach((button) => {
  const direction = button.dataset.move;
  const press = (event) => { event.preventDefault(); keys[direction] = true; };
  const release = (event) => { event.preventDefault(); keys[direction] = false; };
  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);
});

let touchLook = null;
canvas.addEventListener("pointerdown", (event) => {
  if (!isTouch || modalOpen || finalSequenceStarted) return;
  touchLook = { x: event.clientX, y: event.clientY };
});
canvas.addEventListener("pointermove", (event) => {
  if (!isTouch || !touchLook || modalOpen || finalSequenceStarted) return;
  const dx = event.clientX - touchLook.x;
  const dy = event.clientY - touchLook.y;
  touchLook.x = event.clientX;
  touchLook.y = event.clientY;
  camera.rotation.y -= dx * .004;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * .003, -1.25, 1.25);
});
canvas.addEventListener("pointerup", () => { touchLook = null; });
canvas.addEventListener("pointercancel", () => { touchLook = null; });

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatioCap));
  renderer.setSize(innerWidth, innerHeight);
});

applyBrightness();
buildMuseum();
animate();

window.addEventListener("resize", () => {
  if (artworkCard?.classList.contains("is-visible")) requestAnimationFrame(placeInteractionPromptAboveArtwork);
});
