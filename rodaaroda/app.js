import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { dataStore, uid, nowIso } from './data-store.js?v=20261003-clean3';
import { createPlatformUI } from './platform-ui.js?v=20261003-clean3';

const config = window.SILVIO_CONFIG || {};

const ALLOWED_CHARACTERS = Object.freeze([
  Object.freeze({ id: 'silvio_bursto_animado', label: 'Silvio Busto Animado', path: './assets/model/silvioburstoanimado.glb' }),
  Object.freeze({ id: 'silvio_corpo_animado', label: 'Silvio Corpo Animado', path: './assets/model/silviocorpoanimado.glb' }),
  Object.freeze({ id: 'silvio_corpo_animado_2', label: 'Silvio Corpo Animado 2', path: './assets/model/SILVIOCORPOANIMADO2.glb' }),
]);

function purgeLegacyAccessoryStateAndUi() {
  try {
    localStorage.removeItem('rodaRodapersonagem.accessoryFits.v6');
    localStorage.removeItem('roda-a-roda.accessory-transforms');
  } catch (_) {}

  document.querySelectorAll('.wardrobe-selector[data-wardrobe-category]').forEach((row) => {
    if (row.dataset.wardrobeCategory !== 'character') row.remove();
  });

  [
    '#accessoryEditToggle', '#accessoryEditTools', '#accessoryEditStatus',
    '#accessoryResetButton', '#accessoryExportCurrentButton', '#accessoryExportAllButton',
    '#wardrobeHatName', '#wardrobeGlassesName', '#wardrobeShirtName',
    '.wardrobe-edit-tools', '.wardrobe-edit-targets', '.wardrobe-transform-editor',
  ].forEach((selector) => document.querySelectorAll(selector).forEach((node) => node.remove()));
}

purgeLegacyAccessoryStateAndUi();

// -----------------------------------------------------------------------------
// DOM
// -----------------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const puzzleBoard = $('#puzzleBoard');
const keyboard = $('#keyboard');
const scoreDisplay = $('#scoreDisplay');
const categoryDisplay = $('#categoryDisplay');
const roundDisplay = $('#roundDisplay');
const wheelResult = $('#wheelResult');
const phaseDisplay = $('#phaseDisplay');
const spinButton = $('#spinButton');
const solveButton = $('#solveButton');
const newRoundButton = $('#newRoundButton');
const solvePanel = $('#solvePanel');
const solveInput = $('#solveInput');
const confirmSolveButton = $('#confirmSolveButton');
const wheelCanvas = $('#wheelCanvas');
const viewer = $('#viewer');
const viewerHint = $('#viewerHint');
const audioOrbButton = $('#audioOrbButton');
const audioStatus = $('#audioStatus');
const loadingOverlay = $('#loadingOverlay');
const loadingText = $('#loadingText');
const toast = $('#toast');
const playerDisplay = $('#playerDisplay');
const playerStrip = $('#playerStrip');
const playerSetup = $('#playerSetup');
const gameShell = $('.game-shell');
const wardrobePanel = $('#wardrobePanel');
const wardrobePlayerTitle = $('#wardrobePlayerTitle');
const wardrobeProgress = $('#wardrobeProgress');
const wardrobeConfirmButton = $('#wardrobeConfirmButton');
const wardrobeCharacterName = $('#wardrobeCharacterName');
const modeMenu = $('#modeMenu');
const singlePlayerModeButton = $('#singlePlayerModeButton');
const multiplayerModeButton = $('#multiplayerModeButton');
const multiplayerConnectPanel = $('#multiplayerConnectPanel');
const multiplayerServerInput = $('#multiplayerServerInput');
const multiplayerNameInput = $('#multiplayerNameInput');
const lobbyCodeInput = $('#lobbyCodeInput');
const createLobbyButton = $('#createLobbyButton');
const joinLobbyButton = $('#joinLobbyButton');
const backToModeMenuButton = $('#backToModeMenuButton');
const multiplayerConnectStatus = $('#multiplayerConnectStatus');
const multiplayerLobbyBar = $('#multiplayerLobbyBar');
const multiplayerLobbyCode = $('#multiplayerLobbyCode');
const multiplayerInviteUrl = $('#multiplayerInviteUrl');
const copyInviteButton = $('#copyInviteButton');
const multiplayerLobbyPlayers = $('#multiplayerLobbyPlayers');
const multiplayerCountdown = $('#multiplayerCountdown');
const multiplayerCountdownNumber = $('#multiplayerCountdownNumber');
const questionDisplay = $('#questionDisplay');
const hintDisplay = $('#hintDisplay');
const hintButton = $('#hintButton');
const scoreFeedback = $('#scoreFeedback');
const centralButton = $('#centralButton');
const fullscreenButton = $('#fullscreenButton');
const volumeControl = $('#volumeControl');
const muteButton = $('#muteButton');

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .trim()
  .replace(/\s+/g, ' ');

function setToast(message, kind = '') {
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast is-visible ${kind}`.trim();
  clearTimeout(setToast._timer);
  setToast._timer = setTimeout(() => {
    toast.className = 'toast';
  }, 2200);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const platformUI = createPlatformUI({ store: dataStore, config, toast: setToast });
let gameRules = { ...(config.defaultRules || {}) };
let lastGameSetup = { themeIds: [], difficulty: 'all', rounds: 3, noRepeat: true, randomMix: true };

async function loadPersistentGameConfig() {
  await dataStore.ready;
  gameRules = { ...(config.defaultRules || {}), ...(await dataStore.getKv('rules', config.defaultRules || {})) };
  lastGameSetup = { ...lastGameSetup, ...(await dataStore.getKv('lastSetup', {})) };
}
loadPersistentGameConfig().then(() => {
  if (dataStore.fallback) setToast('IndexedDB indisponível — dados serão salvos no armazenamento local de compatibilidade.', 'warning');
}).catch((error) => {
  console.warn('[dados] configuração persistente indisponível:', error);
  setToast('Não foi possível carregar todas as preferências salvas.', 'warning');
});

async function offerResumeSession() {
  await dataStore.ready;
  const saved = await dataStore.getKv('activeSession', null);
  if (!saved?.session || !saved?.puzzle || !Array.isArray(saved.players)) return;
  const card = document.querySelector('.mode-menu__card');
  if (!card || card.querySelector('[data-resume-session]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'resume-session-button';
  button.dataset.resumeSession = '1';
  button.innerHTML = `<strong>CONTINUAR PARTIDA</strong><small>Rodada ${Number(saved.round) || 1} • salva ${new Date(saved.savedAt || Date.now()).toLocaleString('pt-BR')}</small>`;
  card.insertBefore(button, card.querySelector('.mode-tools'));
  button.addEventListener('click', () => {
    multiplayer.active = false;
    game.setup = { ...lastGameSetup, ...(saved.setup || {}) };
    game.session = saved.session;
    game.round = Number(saved.round) || 1;
    game.players = saved.players.map((player, index) => ({
      name: player.name || `Jogador ${index + 1}`,
      score: Number(player.score) || 0,
      roundScore: Number(player.roundScore) || 0,
      character: clamp(Number(player.character) || 0, 0, Math.max(0, characterList().length - 1)),
    }));
    game.currentPlayerIndex = clamp(Number(saved.currentPlayerIndex) || 0, 0, Math.max(0, game.players.length - 1));
    game.puzzle = { ...saved.puzzle };
    game.guessed = new Set(Array.isArray(saved.guessed) ? saved.guessed : []);
    game.phase = saved.phase || 'spin';
    game.roundState = saved.roundState || null;
    game.wardrobeActive = false;
    game.finale = false;
    modeMenu?.classList.add('is-hidden');
    playerSetup?.classList.add('is-hidden');
    gameShell?.classList.remove('is-setup', 'is-wardrobe', 'is-finale');
    if (wardrobePanel) wardrobePanel.hidden = true;
    categoryDisplay.textContent = game.puzzle.category || game.puzzle.theme || '—';
    if (questionDisplay) questionDisplay.textContent = game.puzzle.question || `Tema: ${game.puzzle.category || 'GERAL'}`;
    const used = game.roundState?.hintsUsed || [];
    if (hintDisplay) { hintDisplay.hidden = !used.length; hintDisplay.textContent = used.length ? `DICA ${used.length}/${game.puzzle.hints?.length || used.length} • ${used[used.length - 1]?.text || ''}` : ''; }
    roundDisplay.textContent = String(game.round);
    updatePlayersUI(); updateRoundLights(); buildPuzzleBoard(); syncControls(); applyPlayerCharacter(currentPlayer());
    phaseDisplay.textContent = `${currentPlayer().name}: ${game.phase === 'letter' ? 'escolha uma letra' : 'gire para jogar'}`;
    setToast('Partida restaurada', 'good');
  });
}


function showScoreFeedback(text, negative = false) {
  if (!scoreFeedback) return;
  scoreFeedback.textContent = text;
  scoreFeedback.className = `score-feedback is-showing ${negative ? 'is-negative' : 'is-positive'}`;
  clearTimeout(showScoreFeedback._timer);
  showScoreFeedback._timer = setTimeout(() => { scoreFeedback.className = 'score-feedback'; }, 1080);
}

function showRoundResult(playerName, bonus, round = game.round) {
  document.querySelector('.round-result-banner')?.remove();
  const node = document.createElement('div');
  node.className = 'round-result-banner';
  node.innerHTML = `<small>RODADA ${Number(round) || 1} CONCLUÍDA</small><strong>${String(playerName || 'JOGADOR').toUpperCase()}</strong><span>+${Number(bonus || 0).toLocaleString('pt-BR')} PONTOS</span>`;
  document.body.appendChild(node);
  requestAnimationFrame(() => node.classList.add('is-visible'));
  setTimeout(() => { node.classList.remove('is-visible'); setTimeout(() => node.remove(), 280); }, 1700);
}

// -----------------------------------------------------------------------------
// Game state
// -----------------------------------------------------------------------------
let game = {
  round: 1,
  players: [{
    name: 'Jogador 1',
    score: 0,
    roundScore: 0,
    character: 0,
  }],
  currentPlayerIndex: 0,
  puzzle: null,
  guessed: new Set(),
  phase: 'spin', // spin | letter | solved | wardrobe | finale
  currentWheelSegment: null,
  spinning: false,
  wardrobePlayerIndex: 0,
  wardrobeActive: false,
  finale: false,
  setup: { themeIds: [], difficulty: 'all', rounds: 3, noRepeat: true, randomMix: true },
  session: null,
  roundState: null,
  comboByPlayer: {},
  historyFinalized: false,
};

const multiplayer = {
  active: false,
  lobbyCode: '',
  playerId: '',
  hostId: '',
  localReady: false,
  gameStarted: false,
  lastRevision: -1,
  lastEventId: 0,
  pollTimer: null,
  eventPollTimer: null,
  polling: false,
  eventPolling: false,
  processedEventIds: new Set(),
  applyingRemote: false,
  initializingGame: false,
  inviteUrl: '',
  serverBase: '',
};

let multiplayerCharacterSyncTimer = null;

const MULTIPLAYER_SERVER_STORAGE_KEY = 'rodaRodapersonagem.multiplayerServer.v1';
const startupParams = new URLSearchParams(location.search);

function normalizeServerBase(value) {
  let raw = String(value || '').trim();
  if (!raw) return '';
  if (!/^https?:\/\//i.test(raw)) {
    const isLocal = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(raw);
    raw = `${isLocal ? 'http' : 'https'}://${raw}`;
  }
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol)) return '';
    url.pathname = url.pathname.replace(/\/+$/, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return '';
  }
}

function defaultMultiplayerServer() {
  const fromQuery = normalizeServerBase(startupParams.get('server'));
  if (fromQuery) return fromQuery;
  try {
    const saved = normalizeServerBase(localStorage.getItem(MULTIPLAYER_SERVER_STORAGE_KEY));
    if (saved) return saved;
  } catch {}
  const localHost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(location.hostname);
  if (location.protocol === 'http:' || (localHost && location.protocol === 'https:')) return location.origin;
  return '';
}

multiplayer.serverBase = defaultMultiplayerServer();
if (multiplayerServerInput) multiplayerServerInput.value = multiplayer.serverBase;
const startupLobbyCode = normalizeLobbyCode(startupParams.get('lobby') || '');
if (startupLobbyCode && lobbyCodeInput) lobbyCodeInput.value = startupLobbyCode;

offerResumeSession().catch((error) => console.warn('[sessão] não foi possível oferecer retomada:', error));

function saveMultiplayerServer(value) {
  const normalized = normalizeServerBase(value);
  multiplayer.serverBase = normalized;
  if (multiplayerServerInput && multiplayerServerInput.value !== normalized) multiplayerServerInput.value = normalized;
  try {
    if (normalized) localStorage.setItem(MULTIPLAYER_SERVER_STORAGE_KEY, normalized);
    else localStorage.removeItem(MULTIPLAYER_SERVER_STORAGE_KEY);
  } catch {}
  return normalized;
}

function apiUrl(path) {
  if (!String(path).startsWith('/api/')) return path;
  const base = multiplayer.serverBase || '';
  return base ? `${base}${path}` : path;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Erro do servidor (${response.status})`);
  }
  return data;
}

function setMultiplayerConnectStatus(message, isError = false) {
  if (!multiplayerConnectStatus) return;
  multiplayerConnectStatus.textContent = message;
  multiplayerConnectStatus.classList.toggle('is-error', Boolean(isError));
}

function setMode(mode) {
  if (mode === 'single') {
    multiplayer.active = false;
    document.body.classList.remove('is-multiplayer', 'is-local-ready');
    modeMenu?.classList.add('is-hidden');
    playerSetup?.classList.remove('is-hidden');
    return;
  }
  if (mode === 'multiplayer') {
    multiplayerConnectPanel.hidden = false;
    setMultiplayerConnectStatus(multiplayer.serverBase ? 'Servidor salvo. Crie ou entre em um lobby.' : 'Cole a URL HTTPS do Cloudflare para jogar online.');
  }
}

singlePlayerModeButton?.addEventListener('click', () => setMode('single'));
multiplayerModeButton?.addEventListener('click', () => setMode('multiplayer'));
backToModeMenuButton?.addEventListener('click', () => {
  multiplayerConnectPanel.hidden = true;
  setMultiplayerConnectStatus(multiplayer.serverBase ? 'Servidor salvo. Crie ou entre em um lobby.' : 'Cole a URL HTTPS do Cloudflare para jogar online.');
});

function normalizeLobbyCode(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
}

lobbyCodeInput?.addEventListener('input', () => {
  const value = normalizeLobbyCode(lobbyCodeInput.value);
  if (lobbyCodeInput.value !== value) lobbyCodeInput.value = value;
});

multiplayerServerInput?.addEventListener('change', () => {
  const server = saveMultiplayerServer(multiplayerServerInput.value);
  setMultiplayerConnectStatus(server ? 'Servidor salvo. Crie ou entre em um lobby.' : 'URL de servidor inválida.', !server);
});

// Compatibility layer for the existing multiplayer server.
// Character choice is encoded in the player name because the legacy server
// does not expose a dedicated character field on every deployment.
function decodeLobbyIdentity(rawName, fallback = 'Jogador') {
  const raw = String(rawName || fallback);
  const match = raw.match(/~ch(\d{1,2})$/i);
  const character = match ? Math.max(0, Number(match[1]) || 0) : 0;
  const name = (match ? raw.slice(0, match.index) : raw).trim() || fallback;
  return { name, character };
}

function encodeLobbyIdentity(name, character = 0) {
  const clean = decodeLobbyIdentity(name, 'Jogador').name.replace(/~ch\d{1,2}$/i, '').trim() || 'Jogador';
  // Existing server limits names to 24 chars; reserve room for metadata.
  const suffix = `~ch${Math.max(0, Math.min(2, Number(character) || 0))}`;
  return `${clean.slice(0, Math.max(1, 24 - suffix.length))}${suffix}`;
}

function playerFromLobby(entry, index, previous = null) {
  const identity = decodeLobbyIdentity(entry.name, `Jogador ${index + 1}`);
  return {
    id: entry.id,
    name: identity.name,
    score: previous?.score || 0,
    roundScore: previous?.roundScore || 0,
    character: Number.isFinite(Number(entry.character))
      ? Number(entry.character)
      : (identity.character ?? previous?.character ?? 0),
    ready: Boolean(entry.ready),
  };
}

function localMultiplayerIndex() {
  if (!multiplayer.active) return game.currentPlayerIndex;
  return game.players.findIndex((player) => player.id === multiplayer.playerId);
}

function canLocalInteract() {
  if (!multiplayer.active) return true;
  if (!multiplayer.gameStarted || multiplayer.applyingRemote || game.finale || game.wardrobeActive) return false;
  return currentPlayer()?.id === multiplayer.playerId;
}

function updateLobbyBar(lobby) {
  if (!lobby) return;
  if (multiplayerLobbyCode) multiplayerLobbyCode.textContent = lobby.code || '-----';
  if (multiplayerInviteUrl) multiplayerInviteUrl.textContent = multiplayer.inviteUrl || `${location.origin}/`;
  if (multiplayerLobbyPlayers) {
    multiplayerLobbyPlayers.innerHTML = '';
    lobby.players.forEach((player) => {
      const badge = document.createElement('span');
      badge.className = `multiplayer-lobby-player${player.ready ? ' is-ready' : ''}${player.id === multiplayer.playerId ? ' is-me' : ''}`;
      const lobbyIdentity = decodeLobbyIdentity(player.name, 'Jogador');
      badge.textContent = `${lobbyIdentity.name}${player.ready ? ' • PRONTO' : ' • ESCOLHENDO'}`;
      multiplayerLobbyPlayers.appendChild(badge);
    });
  }
}

function syncPlayersFromLobby(lobby) {
  if (!lobby?.players?.length || multiplayer.gameStarted) return;
  const previousById = new Map(game.players.map((player) => [player.id, player]));
  game.players = lobby.players.map((entry, index) => {
    const previous = previousById.get(entry.id);
    const player = playerFromLobby(entry, index, previous);
    // Keep the local character choice while the update is still travelling to the server.
    if (entry.id === multiplayer.playerId && previous && !entry.ready) {
      player.character = Number(previous.character) || 0;
    }
    return player;
  });
  const localIndex = Math.max(0, game.players.findIndex((player) => player.id === multiplayer.playerId));
  game.wardrobePlayerIndex = localIndex;
  game.currentPlayerIndex = localIndex;
  const localEntry = lobby.players.find((player) => player.id === multiplayer.playerId);
  multiplayer.localReady = Boolean(localEntry?.ready);
  document.body.classList.toggle('is-local-ready', multiplayer.localReady);
  if (wardrobeConfirmButton) wardrobeConfirmButton.textContent = multiplayer.localReady ? 'EDITAR PERSONAGEM' : 'PRONTO';
  if (wardrobeProgress) wardrobeProgress.textContent = multiplayer.localReady ? 'PRONTO • AGUARDANDO OS OUTROS' : `VOCÊ É ${game.players[localIndex]?.name?.toUpperCase() || 'JOGADOR'}`;
  updatePlayersUI();
  if (game.wardrobeActive) renderWardrobePlayer();
}

async function loadInviteUrl() {
  const page = new URL(location.href);
  page.search = '';
  page.hash = '';
  if (multiplayer.serverBase) page.searchParams.set('server', multiplayer.serverBase);
  if (multiplayer.lobbyCode) page.searchParams.set('lobby', multiplayer.lobbyCode);
  multiplayer.inviteUrl = page.toString();
  if (multiplayerInviteUrl) {
    multiplayerInviteUrl.textContent = multiplayer.inviteUrl;
    multiplayerInviteUrl.title = multiplayer.inviteUrl;
  }
  if (copyInviteButton) copyInviteButton.disabled = !multiplayer.inviteUrl;
}

async function copyInviteLink() {
  const link = String(multiplayer.inviteUrl || multiplayerInviteUrl?.textContent || '').trim();
  if (!link || link === 'carregando endereço…') return;

  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
      copied = true;
    }
  } catch (error) {
    console.warn('[multiplayer] clipboard API indisponível:', error);
  }

  if (!copied) {
    const input = document.createElement('textarea');
    input.value = link;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    input.style.top = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    input.remove();
  }

  if (copyInviteButton) {
    const original = 'COPIAR LINK';
    copyInviteButton.textContent = copied ? 'COPIADO!' : 'SELECIONE O LINK';
    copyInviteButton.classList.toggle('is-copied', copied);
    clearTimeout(copyInviteLink._timer);
    copyInviteLink._timer = setTimeout(() => {
      copyInviteButton.textContent = original;
      copyInviteButton.classList.remove('is-copied');
    }, 1600);
  }

  if (!copied && multiplayerInviteUrl) {
    const range = document.createRange();
    range.selectNodeContents(multiplayerInviteUrl);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}

copyInviteButton?.addEventListener('click', copyInviteLink);

function beginMultiplayerWardrobe(lobby) {
  game.finale = false;
  game.wardrobeActive = true;
  game.phase = 'wardrobe';
  multiplayer.gameStarted = false;
  document.body.classList.add('is-multiplayer');
  modeMenu?.classList.add('is-hidden');
  playerSetup?.classList.add('is-hidden');
  gameShell?.classList.remove('is-setup');
  gameShell?.classList.add('is-wardrobe');
  if (wardrobePanel) wardrobePanel.hidden = false;
  if (multiplayerLobbyBar) multiplayerLobbyBar.hidden = false;
  syncPlayersFromLobby(lobby);
  updateLobbyBar(lobby);
  scheduleViewerResize({ refit: true });
  setTimeout(() => scheduleViewerResize({ refit: true }), 80);
}

async function connectMultiplayer(kind) {
  const serverBase = saveMultiplayerServer(multiplayerServerInput?.value || multiplayer.serverBase);
  if (!serverBase) {
    setMultiplayerConnectStatus('Cole a URL HTTPS exibida pelo start_cloudflare.bat.', true);
    multiplayerServerInput?.focus();
    return;
  }
  if (location.protocol === 'https:' && serverBase.startsWith('http://')) {
    setMultiplayerConnectStatus('No GitHub Pages o servidor precisa usar HTTPS (Cloudflare).', true);
    multiplayerServerInput?.focus();
    return;
  }
  const name = String(multiplayerNameInput?.value || '').trim() || 'Jogador';
  const code = normalizeLobbyCode(lobbyCodeInput?.value || '');
  if (kind === 'join' && code.length !== 5) {
    setMultiplayerConnectStatus('Digite o código de 5 caracteres do lobby.', true);
    lobbyCodeInput?.focus();
    return;
  }
  createLobbyButton.disabled = true;
  joinLobbyButton.disabled = true;
  setMultiplayerConnectStatus(kind === 'create' ? 'Criando lobby…' : 'Entrando no lobby…');
  try {
    await apiRequest('/api/info', { method: 'GET', headers: {} });
    const data = await apiRequest(kind === 'create' ? '/api/lobby/create' : '/api/lobby/join', {
      method: 'POST',
      body: JSON.stringify(kind === 'create' ? { name } : { name, code }),
    });
    multiplayer.active = true;
    multiplayer.lobbyCode = data.lobby.code;
    multiplayer.playerId = data.playerId;
    multiplayer.hostId = data.lobby.hostId;
    multiplayer.lastRevision = data.lobby.revision;
    multiplayer.lastEventId = Number(data.lobby.latestEventId) || 0;
    multiplayer.processedEventIds.clear();
    multiplayer.localReady = false;
    multiplayer.initializingGame = false;
    await loadInviteUrl();
    beginMultiplayerWardrobe(data.lobby);
    startLobbyPolling();
    setToast(`LOBBY ${data.lobby.code} • escolha seu Silvio`, 'good');
  } catch (error) {
    setMultiplayerConnectStatus(error.message || 'Não foi possível conectar ao servidor Cloudflare.', true);
  } finally {
    createLobbyButton.disabled = false;
    joinLobbyButton.disabled = false;
  }
}

createLobbyButton?.addEventListener('click', () => connectMultiplayer('create'));
joinLobbyButton?.addEventListener('click', () => connectMultiplayer('join'));
lobbyCodeInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') connectMultiplayer('join');
});

if (startupLobbyCode || startupParams.get('server')) {
  if (multiplayerConnectPanel) multiplayerConnectPanel.hidden = false;
  setMultiplayerConnectStatus(multiplayer.serverBase
    ? 'Convite carregado. Informe seu nome e clique em ENTRAR.'
    : 'Convite sem servidor. Cole a URL do Cloudflare.',
    !multiplayer.serverBase);
}

function scheduleMultiplayerCharacterSync() {
  if (!multiplayer.active || multiplayer.gameStarted || multiplayer.localReady) return;
  clearTimeout(multiplayerCharacterSyncTimer);
  multiplayerCharacterSyncTimer = setTimeout(() => updateMultiplayerPlayer(false).catch(() => {}), 120);
}

async function updateMultiplayerPlayer(ready = multiplayer.localReady) {
  if (!multiplayer.active || !multiplayer.lobbyCode || !multiplayer.playerId) return null;
  const index = localMultiplayerIndex();
  const player = game.players[index];
  if (!player) return null;
  const data = await apiRequest('/api/lobby/player', {
    method: 'POST',
    body: JSON.stringify({
      code: multiplayer.lobbyCode,
      playerId: multiplayer.playerId,
      outfit: { hat: 0, glasses: 0, bra: 0 },
      name: encodeLobbyIdentity(player.name, player.character),
      ready,
    }),
  });
  multiplayer.lastRevision = data.lobby.revision;
  multiplayer.localReady = Boolean(data.lobby.players.find((item) => item.id === multiplayer.playerId)?.ready);
  syncPlayersFromLobby(data.lobby);
  updateLobbyBar(data.lobby);
  return data.lobby;
}

async function toggleMultiplayerReady() {
  if (!multiplayer.active || multiplayer.gameStarted) return;
  try {
    const nextReady = !multiplayer.localReady;
    const lobby = await updateMultiplayerPlayer(nextReady);
    if (lobby) {
      setToast(nextReady ? 'PRONTO • aguardando os outros' : 'Edição liberada', nextReady ? 'good' : '');
      handleLobbyStatus(lobby);
    }
  } catch (error) {
    setToast(error.message || 'Falha ao marcar pronto', 'bad');
  }
}

function showCountdown(lobby) {
  if (!multiplayerCountdown || !multiplayerCountdownNumber) return;
  if (lobby.status !== 'countdown') {
    multiplayerCountdown.hidden = true;
    return;
  }
  multiplayerCountdown.hidden = false;
  const remaining = Math.max(0, Math.ceil((Number(lobby.countdownEndsAt || 0) - Date.now()) / 1000));
  multiplayerCountdownNumber.textContent = String(Math.max(1, remaining));
}

function closeWardrobeForGame() {
  game.wardrobeActive = false;
  document.body.classList.remove('is-local-ready');
  gameShell?.classList.remove('is-wardrobe', 'is-setup');
  if (wardrobePanel) wardrobePanel.hidden = true;
  if (multiplayerLobbyBar) multiplayerLobbyBar.hidden = true;
  if (multiplayerCountdown) multiplayerCountdown.hidden = true;
  scheduleViewerResize({ refit: true });
  setTimeout(() => scheduleViewerResize({ refit: true }), 80);
}

function serializeGameSnapshot(reason = 'state') {
  return {
    version: 2,
    reason,
    timestamp: Date.now(),
    round: game.round,
    setup: game.setup ? JSON.parse(JSON.stringify(game.setup)) : null,
    session: game.session ? JSON.parse(JSON.stringify(game.session)) : null,
    roundState: game.roundState ? JSON.parse(JSON.stringify(game.roundState)) : null,
    comboByPlayer: { ...(game.comboByPlayer || {}) },
    players: game.players.map((player) => ({
      id: player.id || '',
      name: player.name,
      score: Number(player.score) || 0,
      roundScore: Number(player.roundScore) || 0,
      character: Number(player.character) || 0,
    })),
    currentPlayerIndex: game.currentPlayerIndex,
    puzzle: game.puzzle ? { ...game.puzzle } : null,
    guessed: [...game.guessed],
    phase: game.phase,
    currentWheelSegment: game.currentWheelSegment ? { ...game.currentWheelSegment } : null,
    finale: Boolean(game.finale),
    wheelAngle,
    wheelResultText: wheelResult?.textContent || '',
    phaseText: phaseDisplay?.textContent || '',
  };
}

let multiplayerSnapshotQueue = Promise.resolve();
let multiplayerSnapshotSequence = 0;

function pushMultiplayerSnapshot(reason = 'state') {
  if (!multiplayer.active || !multiplayer.gameStarted || multiplayer.applyingRemote || !multiplayer.lobbyCode) {
    return Promise.resolve();
  }

  // Capture the state NOW, then serialize every write through one queue. Without
  // this, a fast LETTER click can overtake the previous WHEEL snapshot and an
  // older request may arrive at the server after the turn has already changed.
  const snapshot = serializeGameSnapshot(reason);
  const sequence = ++multiplayerSnapshotSequence;
  const payload = {
    code: multiplayer.lobbyCode,
    playerId: multiplayer.playerId,
    sequence,
    snapshot,
  };

  multiplayerSnapshotQueue = multiplayerSnapshotQueue
    .catch(() => {})
    .then(async () => {
      // If this client no longer owns the turn, the server will also reject the
      // stale write. Keeping the request queued preserves action order locally.
      const data = await apiRequest('/api/lobby/snapshot', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (Number.isFinite(data.revision)) {
        multiplayer.lastRevision = Math.max(multiplayer.lastRevision, data.revision);
      }
    })
    .catch((error) => {
      console.warn(`[multiplayer] snapshot ${sequence} (${reason}) rejeitado:`, error);
      // A rejected stale snapshot normally means the authoritative turn already
      // advanced. Pull it immediately instead of waiting for the next poll tick.
      setTimeout(() => pollLobby(), 0);
    });

  return multiplayerSnapshotQueue;
}

function applyRemoteSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || !Array.isArray(snapshot.players) || !snapshot.players.length) {
    console.warn('[multiplayer] snapshot inválido ignorado:', snapshot);
    setToast('Estado multiplayer inválido recebido; aguardando nova sincronização', 'bad');
    return;
  }
  if (snapshot.puzzle && typeof snapshot.puzzle !== 'object') {
    console.warn('[multiplayer] puzzle inválido no snapshot:', snapshot.puzzle);
    setToast('Pergunta multiplayer inválida; aguardando nova sincronização', 'bad');
    return;
  }
  if (!snapshot.finale) platformUI.hideResults?.();
  const previousTurnOwnerId = currentPlayer()?.id || '';
  const shouldStartFinale = Boolean(snapshot.finale) && !game.finale;
  multiplayer.applyingRemote = true;
  closeWardrobeForGame();
  multiplayer.gameStarted = true;
  game.round = Number(snapshot.round) || 1;
  if (snapshot.setup && typeof snapshot.setup === 'object') game.setup = { ...snapshot.setup };
  if (snapshot.session && typeof snapshot.session === 'object') game.session = JSON.parse(JSON.stringify(snapshot.session));
  game.roundState = snapshot.roundState && typeof snapshot.roundState === 'object' ? JSON.parse(JSON.stringify(snapshot.roundState)) : null;
  game.comboByPlayer = snapshot.comboByPlayer && typeof snapshot.comboByPlayer === 'object' ? { ...snapshot.comboByPlayer } : {};
  game.players = Array.isArray(snapshot.players) ? snapshot.players.map((player, index) => ({
    id: player.id || '',
    name: player.name || `Jogador ${index + 1}`,
    score: Number(player.score) || 0,
    roundScore: Number(player.roundScore) || 0,
    character: Number.isFinite(Number(player.character)) ? Number(player.character) : 0,
  })) : game.players;
  game.currentPlayerIndex = clamp(Number(snapshot.currentPlayerIndex) || 0, 0, Math.max(0, game.players.length - 1));
  game.puzzle = snapshot.puzzle ? { ...snapshot.puzzle } : game.puzzle;
  game.guessed = new Set(Array.isArray(snapshot.guessed) ? snapshot.guessed : []);
  game.phase = snapshot.phase || 'spin';
  game.currentWheelSegment = snapshot.currentWheelSegment ? { ...snapshot.currentWheelSegment } : null;
  game.spinning = false;

  const nextTurnOwnerId = currentPlayer()?.id || '';
  const turnActuallyChanged = Boolean(previousTurnOwnerId && nextTurnOwnerId && previousTurnOwnerId !== nextTurnOwnerId);
  // Every rule that passes the turn (wrong letter, PASSA, PERDE TUDO, wrong
  // solve) starts the receiver in spin phase. This also heals any stale
  // intermediate wheel snapshot that might have left phase='letter'.
  if (turnActuallyChanged && game.phase !== 'solved' && game.phase !== 'finale') {
    game.phase = 'spin';
    game.currentWheelSegment = null;
  }
  cancelAnimationFrame(wheelAnimationFrame);
  if (Number.isFinite(snapshot.wheelAngle)) wheelAngle = snapshot.wheelAngle;
  game.finale = false;

  updateScore();
  updateRoundLights();
  if (roundDisplay) roundDisplay.textContent = String(game.round);
  if (categoryDisplay) categoryDisplay.textContent = game.puzzle?.category || '—';
  if (questionDisplay) questionDisplay.textContent = game.puzzle?.question || (game.puzzle?.category ? `Tema: ${game.puzzle.category}` : '—');
  if (snapshot.reason === 'round-win' && game.roundState?.solvedBy) showRoundResult(game.roundState.solvedBy, game.roundState.solveBonus || 0, game.round);
  if (hintDisplay) {
    const used = game.roundState?.hintsUsed || [];
    hintDisplay.hidden = !used.length;
    hintDisplay.textContent = used.length ? `DICA ${used.length}/${game.puzzle?.hints?.length || used.length} • ${used[used.length - 1]?.text || used[used.length - 1] || ''}` : '';
  }
  if (wheelResult) wheelResult.textContent = snapshot.wheelResultText || (game.currentWheelSegment?.label || 'gire a roda');
  if (phaseDisplay) phaseDisplay.textContent = snapshot.phaseText || `${currentPlayer()?.name || 'Jogador'}: gire para jogar`;
  if (solvePanel) solvePanel.hidden = true;
  buildPuzzleBoard();
  applyPlayerCharacter(currentPlayer());
  drawWheel(wheelAngle);

  // IMPORTANT: while a remote snapshot is being applied, canLocalInteract()
  // intentionally returns false. Re-enable interaction first, then recalculate
  // every turn-sensitive control for the player whose turn just arrived.
  multiplayer.applyingRemote = false;
  syncControls();
  // Some browsers can still have the old disabled state queued from the same
  // event loop turn. Recompute once more after DOM/state settling.
  requestAnimationFrame(() => {
    if (!multiplayer.applyingRemote && multiplayer.gameStarted && !game.finale) syncControls();
  });

  if (shouldStartFinale) startFinale({ remote: true });
}

async function initializeMultiplayerGame(lobby) {
  if (multiplayer.initializingGame || multiplayer.gameStarted || lobby.hostId !== multiplayer.playerId) return;
  multiplayer.initializingGame = true;
  const previousById = new Map(game.players.map((player) => [player.id, player]));
  game.players = lobby.players.map((entry, index) => {
    const previous = previousById.get(entry.id);
    const identity = decodeLobbyIdentity(entry.name, `Jogador ${index + 1}`);
    return {
      id: entry.id,
      name: identity.name,
      score: 0,
      roundScore: 0,
      character: Number.isFinite(Number(entry.character)) ? Number(entry.character) : identity.character,
      };
  });
  game.currentPlayerIndex = 0;
  game.round = 1;
  game.finale = false;
  await loadPersistentGameConfig();
  game.setup = { ...lastGameSetup };
  createMatchSession();
  multiplayer.gameStarted = true;
  closeWardrobeForGame();
  await startRound();
  setTimeout(() => {
    multiplayer.initializingGame = false;
  }, 300);
}


async function sendMultiplayerEvent(type, payload = {}) {
  if (!multiplayer.active || !multiplayer.gameStarted || !multiplayer.lobbyCode || !multiplayer.playerId) return null;
  try {
    const data = await apiRequest('/api/lobby/event', {
      method: 'POST',
      body: JSON.stringify({
        code: multiplayer.lobbyCode,
        playerId: multiplayer.playerId,
        type,
        payload,
      }),
    });
    if (data.event) scheduleMultiplayerEvent(data.event, Number(data.serverNow) || Date.now());
    return data.event || null;
  } catch (error) {
    console.warn(`[multiplayer] evento ${type} falhou:`, error);
    return null;
  }
}

function multiplayerPlayerName(playerId) {
  return game.players.find((player) => player.id === playerId)?.name || 'Outro jogador';
}

function scheduleMultiplayerEvent(event, observedServerNow = Date.now()) {
  const eventId = Number(event?.id) || 0;
  if (!eventId || multiplayer.processedEventIds.has(eventId)) return;
  multiplayer.processedEventIds.add(eventId);

  // Prevent an infinitely growing client-side Set during a very long session.
  if (multiplayer.processedEventIds.size > 512) {
    const keepFrom = Math.max(0, multiplayer.lastEventId - 128);
    multiplayer.processedEventIds = new Set(
      [...multiplayer.processedEventIds].filter((id) => Number(id) >= keepFrom),
    );
  }

  const startsAt = Number(event.startsAt) || Number(event.createdAt) || observedServerNow;
  const serverSeenAt = Number(observedServerNow || Date.now());
  const delay = clamp(startsAt - serverSeenAt, 0, 2500);
  const initialLateness = Math.max(0, serverSeenAt - startsAt);
  const localScheduledAt = Date.now() + delay;

  window.setTimeout(() => {
    if (!multiplayer.active || !multiplayer.gameStarted) return;
    const elapsedMs = initialLateness + Math.max(0, Date.now() - localScheduledAt);

    if (event.type === 'audio') {
      const src = String(event.payload?.src || '');
      if (!src) return;
      playAudioSource(src, {
        broadcast: false,
        sourcePlayerId: event.playerId,
        sourcePlayerName: multiplayerPlayerName(event.playerId),
      });
      return;
    }

    if (event.type === 'wheel-spin') {
      const payload = event.payload || {};
      const segments = wheelSegments();
      const selectedIndex = clamp(Number(payload.selectedIndex) || 0, 0, Math.max(0, segments.length - 1));
      animateWheelSpin({
        startAngle: Number(payload.startAngle),
        targetAngle: Number(payload.targetAngle),
        duration: Number(payload.duration),
        selectedIndex,
        authoritative: event.playerId === multiplayer.playerId,
        sourcePlayerName: multiplayerPlayerName(event.playerId),
        elapsedMs,
      });
    }
  }, delay);
}

async function pollMultiplayerEvents() {
  if (!multiplayer.active || !multiplayer.gameStarted || multiplayer.eventPolling || !multiplayer.lobbyCode) return;
  multiplayer.eventPolling = true;
  try {
    const query = new URLSearchParams({
      code: multiplayer.lobbyCode,
      playerId: multiplayer.playerId,
      after: String(multiplayer.lastEventId || 0),
      _: String(Date.now()),
    });
    const data = await apiRequest(`/api/lobby/events?${query.toString()}`, { method: 'GET', headers: {} });
    const events = Array.isArray(data.events) ? [...data.events] : [];
    events.sort((a, b) => Number(a?.id || 0) - Number(b?.id || 0));

    for (const event of events) {
      scheduleMultiplayerEvent(event, Number(data.serverNow) || Date.now());
      multiplayer.lastEventId = Math.max(multiplayer.lastEventId, Number(event?.id) || 0);
    }
  } catch (error) {
    console.warn('[multiplayer] eventos indisponíveis:', error);
  } finally {
    multiplayer.eventPolling = false;
  }
}

function handleLobbyStatus(lobby) {
  updateLobbyBar(lobby);
  if (!multiplayer.gameStarted) syncPlayersFromLobby(lobby);
  if (lobby.status === 'countdown') {
    showCountdown(lobby);
    return;
  }
  if (lobby.status === 'lobby') {
    showCountdown(lobby);
    return;
  }
  if (lobby.status === 'game') {
    if (!lobby.snapshot && lobby.hostId === multiplayer.playerId) {
      initializeMultiplayerGame(lobby);
      return;
    }
    if (!lobby.snapshot) {
      if (multiplayerCountdown) multiplayerCountdown.hidden = false;
      if (multiplayerCountdownNumber) multiplayerCountdownNumber.textContent = '…';
      return;
    }
    if (multiplayerCountdown) multiplayerCountdown.hidden = true;
    if (!multiplayer.gameStarted || lobby.revision > multiplayer.lastRevision) applyRemoteSnapshot(lobby.snapshot);
  }
}

async function pollLobby() {
  if (!multiplayer.active || multiplayer.polling) return;
  multiplayer.polling = true;
  try {
    const query = new URLSearchParams({ code: multiplayer.lobbyCode, playerId: multiplayer.playerId, _: String(Date.now()) });
    const data = await apiRequest(`/api/lobby/state?${query.toString()}`, { method: 'GET', headers: {} });
    const lobby = data.lobby;
    const changed = lobby.revision !== multiplayer.lastRevision;
    if (changed || lobby.status === 'countdown' || !multiplayer.gameStarted) {
      handleLobbyStatus(lobby);
      multiplayer.lastRevision = Math.max(multiplayer.lastRevision, lobby.revision);
    }
    // Recompute every turn-sensitive control on every authoritative poll.
    // This prevents a disabled GIRAR/keyboard state from surviving when the
    // turn leaves this browser and later comes back to it.
    if (multiplayer.gameStarted && !multiplayer.applyingRemote && !game.finale) {
      syncControls();
    }
  } catch (error) {
    console.warn('[multiplayer] lobby indisponível:', error);
    setToast('Servidor multiplayer desconectado', 'bad');
  } finally {
    multiplayer.polling = false;
  }
}

function startLobbyPolling() {
  clearInterval(multiplayer.pollTimer);
  clearInterval(multiplayer.eventPollTimer);
  multiplayer.pollTimer = setInterval(pollLobby, 350);
  // Transient effects need a faster independent channel than game snapshots.
  multiplayer.eventPollTimer = setInterval(pollMultiplayerEvents, 100);
  pollLobby();
  pollMultiplayerEvents();
}

function currentPlayer() {
  return game.players[game.currentPlayerIndex] || game.players[0];
}

function updatePlayersUI() {
  const player = currentPlayer();
  if (playerDisplay) playerDisplay.textContent = player?.name || 'JOGADOR 1';
  if (scoreDisplay) scoreDisplay.textContent = (player?.score || 0).toLocaleString('pt-BR');
  if (!playerStrip) return;
  playerStrip.innerHTML = '';
  game.players.forEach((item, index) => {
    const pill = document.createElement('div');
    pill.className = `player-pill${index === game.currentPlayerIndex ? ' is-current' : ''}`;
    pill.innerHTML = `<span>${item.name}</span><strong>${item.score.toLocaleString('pt-BR')}</strong>`;
    playerStrip.appendChild(pill);
  });
}

function setPlayerCount(count) {
  multiplayer.active = false;
  document.body.classList.remove('is-multiplayer', 'is-local-ready');
  if (multiplayerLobbyBar) multiplayerLobbyBar.hidden = true;
  const safeCount = clamp(Math.round(Number(count) || 1), 1, 4);
  game.players = Array.from({ length: safeCount }, (_, index) => ({
    name: `Jogador ${index + 1}`,
    score: 0,
    roundScore: 0,
    character: index % Math.max(1, characterList().length),
  }));
  game.currentPlayerIndex = 0;
  game.round = 1;
  game.finale = false;
  playerSetup?.classList.add('is-hidden');
  gameShell?.classList.remove('is-setup');
  beginWardrobeSetup();
  updatePlayersUI();
  setToast(`${safeCount} jogador${safeCount > 1 ? 'es' : ''} • escolha uma versão do Silvio`, 'good');
}

function nextPlayer(message = '') {
  if (game.players.length <= 1) {
    applyPlayerCharacter(currentPlayer());
    return;
  }
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  updatePlayersUI();
  applyPlayerCharacter(currentPlayer());
  const player = currentPlayer();
  if (message) setToast(`${message} • vez de ${player.name}`, 'bad');
  phaseDisplay.textContent = `vez de ${player.name}`;
}

document.querySelectorAll('[data-player-count]').forEach((button) => {
  button.addEventListener('click', () => setPlayerCount(button.dataset.playerCount));
});

function characterList() {
  return ALLOWED_CHARACTERS.map((character) => ({ ...character }));
}

function characterForPlayer(player = currentPlayer()) {
  const list = characterList();
  const index = clamp(Number(player?.character) || 0, 0, Math.max(0, list.length - 1));
  if (player) player.character = index;
  return list[index];
}

function currentWardrobePlayer() {
  return game.players[game.wardrobePlayerIndex] || currentPlayer();
}

function normalizeModelPlacement() {
  if (!modelRoot) return null;
  modelRoot.position.set(0, 0, 0);
  modelRoot.updateMatrixWorld(true);
  const bodyRoot = modelRoot.getObjectByName('ROOT') || modelRoot;
  const box = new THREE.Box3().setFromObject(bodyRoot);
  if (box.isEmpty()) return bodyRoot;
  const center = box.getCenter(new THREE.Vector3());
  modelRoot.position.x -= center.x;
  modelRoot.position.y -= box.min.y;
  modelRoot.position.z -= center.z;
  modelRoot.updateMatrixWorld(true);
  return bodyRoot;
}

function beginWardrobeSetup() {
  game.wardrobeActive = true;
  game.wardrobePlayerIndex = 0;
  game.phase = 'wardrobe';
  gameShell?.classList.add('is-wardrobe');
  if (wardrobePanel) wardrobePanel.hidden = false;
  renderWardrobePlayer();
  scheduleViewerResize({ refit: true });
  setTimeout(() => scheduleViewerResize({ refit: true }), 80);
}

function renderWardrobePlayer() {
  const player = game.players[game.wardrobePlayerIndex];
  if (!player) return;
  const character = characterForPlayer(player);
  if (wardrobeCharacterName) wardrobeCharacterName.textContent = character?.label || '—';
  if (wardrobePlayerTitle) wardrobePlayerTitle.textContent = player.name.toUpperCase();
  if (wardrobeProgress) {
    wardrobeProgress.textContent = multiplayer.active
      ? (multiplayer.localReady ? 'PRONTO • AGUARDANDO OS OUTROS' : `VOCÊ É ${player.name.toUpperCase()}`)
      : `JOGADOR ${game.wardrobePlayerIndex + 1} DE ${game.players.length}`;
  }
  game.currentPlayerIndex = game.wardrobePlayerIndex;
  updatePlayersUI();
  applyPlayerCharacter(player);
  if (viewerHint) viewerHint.textContent = `${player.name.toUpperCase()} • ESCOLHA UMA DAS 3 VERSÕES DO SILVIO`;
}

document.querySelectorAll('[data-character-prev]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!game.wardrobeActive) return;
    const player = game.players[game.wardrobePlayerIndex];
    const list = characterList();
    if (!player || !list.length) return;
    player.character = (Number(player.character) || 0) - 1;
    if (player.character < 0) player.character = list.length - 1;
    renderWardrobePlayer();
    scheduleMultiplayerCharacterSync();
  });
});

document.querySelectorAll('[data-character-next]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!game.wardrobeActive) return;
    const player = game.players[game.wardrobePlayerIndex];
    const list = characterList();
    if (!player || !list.length) return;
    player.character = ((Number(player.character) || 0) + 1) % list.length;
    renderWardrobePlayer();
    scheduleMultiplayerCharacterSync();
  });
});

wardrobeConfirmButton?.addEventListener('click', async () => {
  if (!game.wardrobeActive) return;
  if (multiplayer.active) {
    if (multiplayer.hostId === multiplayer.playerId && !multiplayer.localReady) {
      const setup = await platformUI.openSetup({ multiplayer: true, host: true });
      if (!setup) return;
      lastGameSetup = { ...setup };
      game.setup = { ...setup };
    }
    toggleMultiplayerReady();
    return;
  }
  if (game.wardrobePlayerIndex < game.players.length - 1) {
    game.wardrobePlayerIndex += 1;
    renderWardrobePlayer();
    return;
  }

  game.wardrobeActive = false;
  game.currentPlayerIndex = 0;
  gameShell?.classList.remove('is-wardrobe');
  if (wardrobePanel) wardrobePanel.hidden = true;
  updatePlayersUI();
  applyPlayerCharacter(currentPlayer());
  scheduleViewerResize({ refit: true });
  setTimeout(() => scheduleViewerResize({ refit: true }), 80);
  requestLocalGameSetup();
});

function difficultyMultiplier(difficulty) {
  if (!gameRules.difficultyBonusEnabled) return 1;
  return Number(gameRules.difficultyMultipliers?.[difficulty]) || 1;
}

async function pickPuzzle() {
  await dataStore.ready;
  const themes = await dataStore.listThemes();
  const questions = await dataStore.listQuestions();
  const enabledThemes = new Set(themes.filter((theme) => theme.enabled).map((theme) => theme.id));
  const selectedThemes = game.setup?.themeIds?.length ? new Set(game.setup.themeIds) : enabledThemes;
  const difficulty = game.setup?.difficulty || 'all';
  let pool = questions.filter((q) => q.enabled && enabledThemes.has(q.themeId) && selectedThemes.has(q.themeId) && (difficulty === 'all' || q.difficulty === difficulty));
  if (!pool.length) throw new Error('Nenhuma pergunta ativa atende aos filtros da partida.');

  if (game.setup?.randomMix === false) {
    const orderedThemes = (game.setup?.themeIds || []).filter((id) => pool.some((q) => q.themeId === id));
    if (orderedThemes.length > 1) {
      const targetTheme = orderedThemes[(Math.max(1, Number(game.round) || 1) - 1) % orderedThemes.length];
      const themedPool = pool.filter((q) => q.themeId === targetTheme);
      if (themedPool.length) pool = themedPool;
    }
  }

  const recent = new Set(await dataStore.getKv('recentQuestionIds', []));
  const sessionUsed = new Set(game.session?.usedQuestionIds || []);
  if (game.setup?.noRepeat !== false) {
    let candidates = pool.filter((q) => !sessionUsed.has(q.id) && !recent.has(q.id));
    if (!candidates.length) candidates = pool.filter((q) => !sessionUsed.has(q.id));
    if (!candidates.length) {
      sessionUsed.clear();
      if (game.session) game.session.usedQuestionIds = [];
      candidates = [...pool];
    }
    pool = candidates;
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  const theme = themes.find((item) => item.id === picked.themeId);
  const recentList = [picked.id, ...[...recent].filter((id) => id !== picked.id)].slice(0, 40);
  dataStore.setKv('recentQuestionIds', recentList).catch(() => {});
  if (game.session && !game.session.usedQuestionIds.includes(picked.id)) game.session.usedQuestionIds.push(picked.id);
  return {
    id: picked.id,
    themeId: picked.themeId,
    category: theme?.name || 'GERAL',
    theme: theme?.name || 'GERAL',
    question: picked.question || '',
    phrase: picked.answer,
    answer: picked.answer,
    hints: Array.isArray(picked.hints) ? [...picked.hints] : [],
    difficulty: picked.difficulty || 'medium',
    baseScore: picked.baseScore,
    tags: [...(picked.tags || [])],
  };
}

function createMatchSession() {
  const id = uid('match');
  game.session = {
    id,
    startedAt: nowIso(),
    startedAtMs: Date.now(),
    mode: multiplayer.active ? 'multiplayer' : 'single',
    selectedThemes: (game.setup?.themeIds || []).map((id) => dataStore.cache.themes.find((theme) => theme.id === id)?.name || id),
    setup: JSON.parse(JSON.stringify(game.setup || {})),
    rules: JSON.parse(JSON.stringify(gameRules || {})),
    usedQuestionIds: [],
    rounds: [],
  };
  game.historyFinalized = false;
  game.comboByPlayer = {};
  game.players.forEach((player) => { player.roundScore = 0; player.score = 0; });
}

async function startConfiguredMatch(setup = lastGameSetup) {
  platformUI.hideResults?.();
  await loadPersistentGameConfig();
  game.setup = { ...lastGameSetup, ...(setup || {}) };
  lastGameSetup = { ...game.setup };
  game.round = 1;
  game.currentPlayerIndex = 0;
  game.finale = false;
  createMatchSession();
  updatePlayersUI();
  await startRound();
}

async function requestLocalGameSetup() {
  const setup = await platformUI.openSetup({ multiplayer: false, host: true });
  if (!setup) {
    game.wardrobeActive = true;
    game.phase = 'wardrobe';
    gameShell?.classList.add('is-wardrobe');
    if (wardrobePanel) wardrobePanel.hidden = false;
    return;
  }
  await startConfiguredMatch(setup);
  setToast('PERSONAGENS PRONTOS • AGORA VALE!', 'good');
}

async function startRound({ increment = false } = {}) {
  if (game.finale) return;
  if (!game.session) createMatchSession();
  if (increment) game.round += 1;
  const totalRounds = Math.max(1, Number(game.setup?.rounds) || 3);
  if (game.round > totalRounds) {
    startFinale();
    return;
  }

  try {
    game.puzzle = await pickPuzzle();
  } catch (error) {
    console.error('[conteúdo] falha ao selecionar pergunta:', error);
    setToast(error.message || 'Nenhuma pergunta disponível', 'bad');
    if (questionDisplay) questionDisplay.textContent = 'Não há perguntas disponíveis para estes filtros.';
    game.phase = 'spin';
    syncControls();
    return;
  }

  game.guessed = new Set();
  game.phase = 'spin';
  game.currentWheelSegment = null;
  game.spinning = false;
  game.roundState = {
    questionId: game.puzzle.id,
    theme: game.puzzle.theme,
    question: game.puzzle.question,
    answer: game.puzzle.answer,
    difficulty: game.puzzle.difficulty,
    startedAt: nowIso(),
    startedAtMs: Date.now(),
    hintsUsed: [],
    lettersAttempted: [],
    incorrectLetters: [],
    incorrectSolves: [],
    wheelResults: [],
    pointsAwarded: 0,
    solvedBy: null,
  };
  game.players.forEach((player) => { player.roundScore = 0; });
  solvePanel.hidden = true;
  solveInput.value = '';
  wheelResult.textContent = 'gira a roda';
  phaseDisplay.textContent = `${currentPlayer().name}: gire para jogar`;
  categoryDisplay.textContent = game.puzzle.category;
  if (questionDisplay) questionDisplay.textContent = game.puzzle.question || `Tema: ${game.puzzle.category}`;
  if (hintDisplay) { hintDisplay.hidden = true; hintDisplay.textContent = ''; }
  roundDisplay.textContent = String(game.round);
  updateScore();
  updateRoundLights();
  buildPuzzleBoard();
  buildKeyboard();
  syncControls();
  applyPlayerCharacter(currentPlayer());
  impulseBoth(0.45);
  saveActiveSession();
  pushMultiplayerSnapshot(increment ? 'next-round' : 'round-start');
}

function saveActiveSession() {
  if (multiplayer.active || !game.session || game.finale) return;
  const snapshot = {
    savedAt: nowIso(),
    setup: game.setup,
    session: game.session,
    round: game.round,
    players: game.players.map((p) => ({ ...p })),
    currentPlayerIndex: game.currentPlayerIndex,
    puzzle: game.puzzle,
    guessed: [...game.guessed],
    phase: game.phase,
    roundState: game.roundState,
  };
  dataStore.setKv('activeSession', snapshot).catch(() => {});
}

function updateScore() {
  updatePlayersUI();
}

function updateRoundLights() {
  const holder = document.querySelector('.round-lights');
  if (!holder) return;
  const total = Math.max(1, Number(game.setup?.rounds) || 3);
  const visible = Math.min(total, 8);
  if (holder.children.length !== visible) {
    holder.innerHTML = '';
    for (let i = 0; i < visible; i += 1) {
      const light = document.createElement('span');
      light.className = 'round-light';
      light.textContent = total > 8 && i === visible - 1 ? '…' : String(i + 1);
      holder.appendChild(light);
    }
  }
  [...holder.children].forEach((light, index) => {
    const mappedIndex = total > 8 && game.round > 7 ? visible - 1 : game.round - 1;
    light.classList.toggle('is-active', index === mappedIndex);
  });
}

function splitPhraseIntoLines(phrase, maxCols = 14, maxRows = 3) {
  const words = String(phrase || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCols) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (word.length <= maxCols) {
        current = word;
      } else {
        let rest = word;
        while (rest.length > maxCols && lines.length < maxRows - 1) {
          lines.push(rest.slice(0, maxCols));
          rest = rest.slice(maxCols);
        }
        current = rest;
      }
    }
  }
  if (current) lines.push(current);

  while (lines.length > maxRows) {
    const tail = lines.pop();
    lines[lines.length - 1] = `${lines[lines.length - 1]} ${tail}`.slice(0, maxCols);
  }
  return lines.slice(0, maxRows);
}

function buildPuzzleBoard() {
  puzzleBoard.innerHTML = '';
  if (!game.puzzle) return;

  const cols = 14;
  const rows = 3;
  const lines = splitPhraseIntoLines(game.puzzle.phrase, cols, rows);
  const topPad = Math.max(0, Math.floor((rows - lines.length) / 2));
  const boardRows = Array.from({ length: rows }, () => Array(cols).fill(null));

  lines.forEach((line, lineIndex) => {
    const rowIndex = Math.min(rows - 1, topPad + lineIndex);
    const startCol = Math.max(0, Math.floor((cols - line.length) / 2));
    [...line].forEach((char, i) => {
      const col = startCol + i;
      if (col < cols) boardRows[rowIndex][col] = char;
    });
  });

  boardRows.flat().forEach((char) => {
    const cell = document.createElement('span');
    cell.className = 'puzzle-cell';

    if (char === null || char === ' ') {
      puzzleBoard.appendChild(cell);
      return;
    }

    const normalized = normalizeText(char);
    const isLetter = /^[A-Z]$/.test(normalized);
    const revealed = !isLetter || game.guessed.has(normalized) || game.phase === 'solved';

    cell.classList.add('is-active');
    if (revealed) {
      cell.classList.add('is-revealed');
      cell.textContent = char.toUpperCase();
    } else {
      cell.textContent = '';
    }
    puzzleBoard.appendChild(cell);
  });
}

function buildKeyboard() {
  keyboard.innerHTML = '';
  alphabet.forEach((letter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'key';
    button.textContent = letter;
    button.dataset.letter = letter;
    button.disabled = !canLocalInteract() || game.phase !== 'letter' || game.guessed.has(letter) || game.spinning;
    button.addEventListener('click', () => guessLetter(letter));
    keyboard.appendChild(button);
  });
}

function syncControls() {
  const localTurn = canLocalInteract();
  spinButton.disabled = !localTurn || game.spinning || game.phase !== 'spin';
  solveButton.disabled = !localTurn || game.spinning || game.phase === 'solved';
  confirmSolveButton.disabled = !localTurn || game.spinning || game.phase === 'solved';
  if (hintButton) {
    const usedCount = game.roundState?.hintsUsed?.length || 0;
    const totalHints = game.puzzle?.hints?.length || 0;
    const penalties = Array.isArray(gameRules.hintPenalties) ? gameRules.hintPenalties : [];
    const penalty = penalties[Math.min(usedCount, Math.max(0, penalties.length - 1))] || 0;
    hintButton.disabled = !localTurn || game.spinning || game.phase === 'solved' || usedCount >= totalHints || !totalHints;
    hintButton.textContent = totalHints && usedCount < totalHints ? `DICA • -${penalty}` : 'DICA';
    hintButton.title = totalHints ? `${usedCount}/${totalHints} dicas usadas` : 'Esta pergunta não possui dicas';
  }
  buildKeyboard();
}

function useHint() {
  if (!canLocalInteract() || game.phase === 'solved' || !game.puzzle) return;
  const hints = Array.isArray(game.puzzle.hints) ? game.puzzle.hints : [];
  const usedCount = game.roundState?.hintsUsed?.length || 0;
  if (usedCount >= hints.length) return;
  const penalties = Array.isArray(gameRules.hintPenalties) ? gameRules.hintPenalties : [];
  const penalty = Math.max(0, Number(penalties[Math.min(usedCount, Math.max(0, penalties.length - 1))]) || 0);
  const player = currentPlayer();
  player.score = Math.max(0, (player.score || 0) - penalty);
  player.roundScore = Math.max(0, (player.roundScore || 0) - penalty);
  game.roundState.hintsUsed.push({ index: usedCount, text: hints[usedCount], player: player.name, penalty, at: nowIso() });
  game.roundState.pointsAwarded -= penalty;
  if (hintDisplay) { hintDisplay.hidden = false; hintDisplay.textContent = `DICA ${usedCount + 1}/${hints.length} • ${hints[usedCount]}`; }
  updateScore();
  showScoreFeedback(`DICA -${penalty}`, true);
  setToast(`Dica ${usedCount + 1}/${hints.length} • -${penalty}`, 'bad');
  saveActiveSession();
  syncControls();
  pushMultiplayerSnapshot('hint');
}

hintButton?.addEventListener('click', useHint);

function guessLetter(letter) {
  if (!canLocalInteract()) {
    if (multiplayer.active) setToast(`Agora é a vez de ${currentPlayer()?.name || 'outro jogador'}`, 'bad');
    return;
  }
  if (game.phase !== 'letter' || game.spinning || game.guessed.has(letter)) return;

  game.guessed.add(letter);
  const normalizedPhrase = normalizeText(game.puzzle.phrase);
  const matches = [...normalizedPhrase].filter(ch => ch === letter).length;
  const segment = game.currentWheelSegment;
  const value = Number(segment?.value) || 0;
  const player = currentPlayer();
  const playerKey = player.id || player.name;
  let earned = 0;

  if (matches > 0) {
    const streak = (game.comboByPlayer[playerKey] || 0) + 1;
    game.comboByPlayer[playerKey] = streak;
    const comboMultiplier = gameRules.comboEnabled
      ? Math.min(Number(gameRules.maxComboMultiplier) || 1.5, 1 + Math.max(0, streak - 1) * (Number(gameRules.comboStep) || 0.1))
      : 1;
    earned = Math.round(value * matches * comboMultiplier);
    player.score += earned;
    player.roundScore = (player.roundScore || 0) + earned;
    if (game.roundState) game.roundState.pointsAwarded += earned;
    updateScore();
    const comboLabel = comboMultiplier > 1 ? ` • COMBO x${comboMultiplier.toFixed(1)}` : '';
    phaseDisplay.textContent = `${matches}x ${letter} • +${earned}${comboLabel}`;
    setToast(`${matches} letra${matches > 1 ? 's' : ''} ${letter} • +${earned}${comboLabel}`, 'good');
    showScoreFeedback(`+${earned}${comboMultiplier > 1 ? `  x${comboMultiplier.toFixed(1)}` : ''}`);
    playTalk(700);
    impulseBoth(0.5 + Math.min(matches, 3) * 0.1);
  } else {
    game.comboByPlayer[playerKey] = 0;
    phaseDisplay.textContent = `não tem ${letter}`;
    setToast(`Não tem ${letter}`, 'bad');
    playRandomAudio({ shortOnly: true });
    if (game.roundState) game.roundState.incorrectLetters.push({ letter, player: player.name, at: nowIso() });
    nextPlayer(`Não tem ${letter}`);
  }

  if (game.roundState) game.roundState.lettersAttempted.push({ letter, player: player.name, correct: matches > 0, matches, wheelValue: value, earned, at: nowIso() });
  buildPuzzleBoard();

  if (isPuzzleFullyRevealed()) {
    solvePuzzleSuccess();
    return;
  }

  game.phase = 'spin';
  game.currentWheelSegment = null;
  wheelResult.textContent = 'gire novamente';
  setTimeout(() => {
    if (game.phase === 'spin') phaseDisplay.textContent = `${currentPlayer().name}: gire para jogar`;
  }, 900);
  saveActiveSession();
  syncControls();
  pushMultiplayerSnapshot(matches > 0 ? 'letter-hit' : 'letter-miss');
}

function isPuzzleFullyRevealed() {
  const uniqueLetters = new Set(normalizeText(game.puzzle.phrase).replace(/[^A-Z]/g, ''));
  return [...uniqueLetters].every(letter => game.guessed.has(letter));
}

function finalizeCurrentRound({ solved = false, solvedBy = null } = {}) {
  if (!game.roundState || game.roundState.finalized) return;
  game.roundState.finalized = true;
  game.roundState.completedAt = nowIso();
  game.roundState.durationMs = Math.max(0, Date.now() - (game.roundState.startedAtMs || Date.now()));
  game.roundState.solvedBy = solvedBy?.name || game.roundState.solvedBy || null;
  game.roundState.finalScores = game.players.map((player) => ({ name: player.name, score: player.score, roundScore: player.roundScore || 0 }));
  if (game.session) game.session.rounds.push(JSON.parse(JSON.stringify(game.roundState)));
  dataStore.recordQuestionPerformance(game.roundState.questionId, {
    solved,
    hintsUsed: game.roundState.hintsUsed?.length || 0,
    durationMs: game.roundState.durationMs,
  }).catch((error) => console.warn('[stats] falha ao registrar desempenho da pergunta:', error));
}

async function finalizeMatchHistory() {
  if (game.historyFinalized || !game.session) return null;
  game.historyFinalized = true;
  const ranking = [...game.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const record = {
    id: game.session.id,
    startedAt: game.session.startedAt,
    completedAt: nowIso(),
    durationMs: Math.max(0, Date.now() - (game.session.startedAtMs || Date.now())),
    mode: game.session.mode,
    players: game.players.map((player) => ({ name: player.name, score: player.score || 0 })),
    winner: ranking[0] ? { name: ranking[0].name, score: ranking[0].score || 0 } : null,
    selectedThemes: [...(game.session.selectedThemes || [])],
    setup: JSON.parse(JSON.stringify(game.setup || {})),
    rules: JSON.parse(JSON.stringify(gameRules || {})),
    rounds: JSON.parse(JSON.stringify(game.session.rounds || [])),
  };
  try {
    await dataStore.addHistory(record);
    await dataStore.setKv('activeSession', null);
  } catch (error) {
    console.warn('[histórico] não foi possível salvar a partida:', error);
    setToast('Partida concluída, mas o histórico local não pôde ser salvo', 'bad');
  }
  return record;
}

function solvePuzzleSuccess() {
  if (game.phase === 'solved' || game.finale) return;
  game.phase = 'solved';
  const winner = currentPlayer();
  const baseBonus = game.puzzle?.baseScore != null ? Number(game.puzzle.baseScore) || 0 : Number(gameRules.solveBonus) || 1000;
  const bonus = Math.round(baseBonus * difficultyMultiplier(game.puzzle?.difficulty));
  winner.score += bonus;
  winner.roundScore = (winner.roundScore || 0) + bonus;
  if (game.roundState) {
    game.roundState.pointsAwarded += bonus;
    game.roundState.solveBonus = bonus;
    game.roundState.solvedBy = winner.name;
  }
  updateScore();
  buildPuzzleBoard();
  phaseDisplay.textContent = `ACERTOU! ${winner.name} +${bonus}`;
  const totalRounds = Math.max(1, Number(game.setup?.rounds) || 3);
  wheelResult.textContent = game.round >= totalRounds ? 'final!' : 'rodada concluída';
  solvePanel.hidden = true;
  setToast(`${winner.name} ACERTOU A FRASE! +${bonus}`, 'good');
  showScoreFeedback(`BÔNUS +${bonus}`);
  showRoundResult(winner.name, bonus, game.round);
  playTalk(1400);
  impulseBoth(1.35);
  applyPlayerCharacter(winner);
  finalizeCurrentRound({ solved: true, solvedBy: winner });
  saveActiveSession();
  syncControls();
  pushMultiplayerSnapshot('round-win');

  if (game.round >= totalRounds) {
    setTimeout(() => startFinale(), 1350);
  } else if (multiplayer.active && !multiplayer.applyingRemote) {
    setTimeout(() => {
      if (game.phase === 'solved' && !game.finale) startRound({ increment: true });
    }, 1650);
  }
}

function trySolve() {
  if (!canLocalInteract()) {
    if (multiplayer.active) setToast(`Agora é a vez de ${currentPlayer()?.name || 'outro jogador'}`, 'bad');
    return;
  }
  const answer = normalizeText(solveInput.value);
  const target = normalizeText(game.puzzle.phrase);
  if (!answer) {
    setToast('Digite uma resposta primeiro', 'bad');
    solveInput.focus();
    return;
  }

  if (answer === target) {
    solvePuzzleSuccess();
  } else {
    const player = currentPlayer();
    const penalty = Math.max(0, Number(gameRules.wrongSolvePenalty) || 0);
    player.score = Math.max(0, player.score - penalty);
    player.roundScore = Math.max(0, (player.roundScore || 0) - penalty);
    const playerKey = player.id || player.name;
    game.comboByPlayer[playerKey] = 0;
    if (game.roundState) {
      game.roundState.pointsAwarded -= penalty;
      game.roundState.incorrectSolves.push({ player: player.name, answer: solveInput.value.trim(), penalty, at: nowIso() });
    }
    updateScore();
    showScoreFeedback(`-${penalty}`, true);
    setToast(`Resposta errada • -${penalty}`, 'bad');
    playRandomAudio({ shortOnly: true });
    if (gameRules.wrongSolveLosesTurn !== false) nextPlayer('Resposta errada');
    game.phase = 'spin';
    game.currentWheelSegment = null;
    wheelResult.textContent = 'gire novamente';
    phaseDisplay.textContent = `${currentPlayer().name}: gire para jogar`;
    solvePanel.hidden = true;
    saveActiveSession();
    syncControls();
    pushMultiplayerSnapshot('solve-miss');
  }
}

solveButton.addEventListener('click', () => {
  if (!canLocalInteract()) {
    if (multiplayer.active) setToast(`Agora é a vez de ${currentPlayer()?.name || 'outro jogador'}`, 'bad');
    return;
  }
  if (game.phase === 'solved') return;
  solvePanel.hidden = !solvePanel.hidden;
  if (!solvePanel.hidden) solveInput.focus();
});
confirmSolveButton.addEventListener('click', trySolve);
solveInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') trySolve();
});
newRoundButton.addEventListener('click', () => {
  if (multiplayer.active) return;
  const totalRounds = Math.max(1, Number(game.setup?.rounds) || 3);
  if (game.round >= totalRounds && game.phase === 'solved') {
    startFinale();
    return;
  }
  if (game.roundState && !game.roundState.finalized) finalizeCurrentRound({ solved: false });
  startRound({ increment: true });
});

// -----------------------------------------------------------------------------
// Wheel
// -----------------------------------------------------------------------------
const wheelCtx = wheelCanvas.getContext('2d');
let wheelAngle = 0;
let wheelTargetAngle = 0;
let wheelAnimStart = 0;
let wheelAnimDuration = 0;
let wheelAnimationFrame = null;

function wheelSegments() {
  const segments = Array.isArray(config.wheelSegments) && config.wheelSegments.length
    ? config.wheelSegments
    : [{ label: '100', value: 100, color: '#e74c3c' }];
  return segments;
}

function drawWheel(angle = wheelAngle) {
  const segments = wheelSegments();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssSize = wheelCanvas.clientWidth || 340;
  const px = Math.max(320, Math.round(cssSize * dpr));
  if (wheelCanvas.width !== px || wheelCanvas.height !== px) {
    wheelCanvas.width = px;
    wheelCanvas.height = px;
  }

  const ctx = wheelCtx;
  const size = wheelCanvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;
  const innerRadius = size * 0.17;
  const step = (Math.PI * 2) / segments.length;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  segments.forEach((segment, index) => {
    const start = -Math.PI / 2 + index * step;
    const end = start + step;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = segment.color || '#999';
    ctx.fill();
    ctx.lineWidth = Math.max(2, size * 0.006);
    ctx.strokeStyle = '#f6f7ff';
    ctx.stroke();

    const mid = start + step / 2;
    ctx.save();
    ctx.rotate(mid);
    ctx.translate(radius * 0.69, 0);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = segment.type === 'bankrupt' ? '#fff' : '#11182f';
    ctx.font = `900 ${Math.max(12, size * 0.031)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = String(segment.label || '').length > 9
      ? String(segment.label).replace(' ', '\n')
      : String(segment.label || '');
    const lines = label.split('\n');
    lines.forEach((line, li) => ctx.fillText(line, 0, (li - (lines.length - 1) / 2) * size * 0.032));
    ctx.restore();
  });

  ctx.restore();

  // Outer rings
  ctx.beginPath();
  ctx.arc(cx, cy, radius + size * 0.012, 0, Math.PI * 2);
  ctx.lineWidth = size * 0.028;
  ctx.strokeStyle = '#dfeaff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius + size * 0.035, 0, Math.PI * 2);
  ctx.lineWidth = size * 0.012;
  ctx.strokeStyle = '#162c82';
  ctx.stroke();

  // Hub
  const hub = ctx.createRadialGradient(cx - innerRadius * .25, cy - innerRadius * .25, 0, cx, cy, innerRadius);
  hub.addColorStop(0, '#3c94ff');
  hub.addColorStop(1, '#0758d5');
  ctx.fillStyle = hub;
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = size * .012;
  ctx.strokeStyle = '#eaf3ff';
  ctx.stroke();
}

function cubicOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function chooseWheelIndex(segments) {
  const bankrupt = [];
  const normal = [];
  segments.forEach((segment, index) => {
    if (segment.type === 'bankrupt') bankrupt.push(index);
    else normal.push(index);
  });
  // PERDE TUDO has an actual 5% probability per spin, independent of how many
  // graphical slices the wheel contains.
  if (bankrupt.length && Math.random() < 0.05) {
    return bankrupt[Math.floor(Math.random() * bankrupt.length)];
  }
  const pool = normal.length ? normal : segments.map((_, index) => index);
  return pool[Math.floor(Math.random() * pool.length)];
}

function animateWheelSpin({
  startAngle,
  targetAngle,
  duration,
  selectedIndex,
  authoritative = false,
  sourcePlayerName = '',
  elapsedMs = 0,
}) {
  const segments = wheelSegments();
  if (!segments.length) return;
  const safeIndex = clamp(Number(selectedIndex) || 0, 0, segments.length - 1);
  const safeStart = Number.isFinite(startAngle) ? startAngle : wheelAngle;
  const safeTarget = Number.isFinite(targetAngle) ? targetAngle : safeStart;
  const safeDuration = clamp(Number(duration) || 2900, 900, 6000);

  game.spinning = true;
  game.currentWheelSegment = null;
  wheelResult.textContent = 'girando...';
  phaseDisplay.textContent = sourcePlayerName ? `${sourcePlayerName}: girando a roleta` : 'segura!';
  syncControls();

  // Back-date the local animation when this event arrived late. This keeps
  // every browser at the same point of the spin instead of each starting at receipt time.
  const safeElapsed = clamp(Number(elapsedMs) || 0, 0, Math.max(0, safeDuration - 1));
  wheelAnimStart = performance.now() - safeElapsed;
  wheelAnimDuration = safeDuration;
  wheelTargetAngle = safeTarget;
  wheelAngle = safeStart;

  const animateSpin = (now) => {
    const t = clamp((now - wheelAnimStart) / wheelAnimDuration, 0, 1);
    const eased = cubicOut(t);
    wheelAngle = safeStart + (safeTarget - safeStart) * eased;
    drawWheel(wheelAngle);

    if (t < 1) {
      wheelAnimationFrame = requestAnimationFrame(animateSpin);
      return;
    }

    wheelAngle = safeTarget % (Math.PI * 2);
    drawWheel(wheelAngle);
    if (authoritative) {
      finishWheelSpin(segments[safeIndex]);
    } else {
      // Keep remote controls locked until the authoritative end-of-spin snapshot arrives.
      game.spinning = true;
      syncControls();
    }
  };

  cancelAnimationFrame(wheelAnimationFrame);
  wheelAnimationFrame = requestAnimationFrame(animateSpin);
}

async function spinWheel() {
  if (!canLocalInteract()) {
    if (multiplayer.active) setToast(`Agora é a vez de ${currentPlayer()?.name || 'outro jogador'}`, 'bad');
    return;
  }
  if (game.spinning || game.phase !== 'spin') return;

  const segments = wheelSegments();
  const selectedIndex = chooseWheelIndex(segments);
  const step = (Math.PI * 2) / segments.length;

  // Pointer is at top. End with center of selected segment under pointer.
  const segmentCenter = -Math.PI / 2 + selectedIndex * step + step / 2;
  const currentNormalized = ((wheelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  let desiredNormalized = (-Math.PI / 2 - segmentCenter) % (Math.PI * 2);
  if (desiredNormalized < 0) desiredNormalized += Math.PI * 2;
  let delta = desiredNormalized - currentNormalized;
  if (delta < 0) delta += Math.PI * 2;
  const extraTurns = (5 + Math.floor(Math.random() * 3)) * Math.PI * 2;
  const startAngle = wheelAngle;
  const targetAngle = startAngle + extraTurns + delta;
  const duration = 2700 + Math.random() * 500;

  // Lock instantly so a double click cannot create two spins while the event is sent.
  game.spinning = true;
  game.currentWheelSegment = null;
  wheelResult.textContent = 'girando...';
  phaseDisplay.textContent = 'segura!';
  syncControls();

  if (multiplayer.active) {
    const event = await sendMultiplayerEvent('wheel-spin', {
      startAngle,
      targetAngle,
      duration,
      selectedIndex,
    });
    if (!event) {
      game.spinning = false;
      wheelResult.textContent = 'gire a roda';
      phaseDisplay.textContent = `${currentPlayer().name}: gire para jogar`;
      syncControls();
      setToast('Não foi possível sincronizar a roleta', 'bad');
    }
    // In multiplayer the server event starts the animation for EVERY client,
    // including the player who clicked GIRAR.
    return;
  }

  animateWheelSpin({
    startAngle,
    targetAngle,
    duration,
    selectedIndex,
    authoritative: true,
  });
}

function finishWheelSpin(segment) {
  game.spinning = false;
  game.currentWheelSegment = segment;
  wheelResult.textContent = segment.label;
  const player = currentPlayer();
  if (game.roundState) game.roundState.wheelResults.push({ player: player?.name || '', label: segment.label, value: Number(segment.value) || 0, type: segment.type || 'score', at: nowIso() });

  if (segment.type === 'bankrupt') {
    if (gameRules.bankruptBehavior === 'round') {
      const lost = player.roundScore || 0;
      player.score = Math.max(0, (player.score || 0) - lost);
      player.roundScore = 0;
      if (game.roundState) game.roundState.pointsAwarded -= lost;
    } else {
      const lost = player.score || 0;
      player.score = 0;
      player.roundScore = 0;
      if (game.roundState) game.roundState.pointsAwarded -= lost;
    }
    updateScore();
    showScoreFeedback('PERDE TUDO', true);
    game.phase = 'spin';
    phaseDisplay.textContent = 'PERDEU TUDO';
    setToast('PERDEU TUDO!', 'bad');
    playRandomAudio({ shortOnly: true });
    impulseBoth(0.9);
    nextPlayer('PERDEU TUDO');
  } else if (segment.type === 'loseTurn') {
    game.phase = 'spin';
    phaseDisplay.textContent = 'PASSA VEZ';
    setToast('Passa a vez', 'bad');
    playRandomAudio({ shortOnly: true });
    nextPlayer('PASSA VEZ');
  } else {
    game.phase = 'letter';
    phaseDisplay.textContent = `vale ${segment.value} por letra`;
    setToast(`Vale ${segment.value} por letra`, 'good');
  }

  saveActiveSession();
  syncControls();
  pushMultiplayerSnapshot(segment.type === 'bankrupt' ? 'bankrupt' : segment.type === 'loseTurn' ? 'pass-turn' : 'wheel-value');
}

spinButton.addEventListener('click', spinWheel);

// -----------------------------------------------------------------------------
// Audio orb
// -----------------------------------------------------------------------------
let audio = null;
let finalAudio = null;
let lastAudioIndex = -1;
let audioPlayToken = 0;
let mediaUnlocked = false;
let masterVolume = 0.8;
let lastAudibleVolume = 0.8;
try { masterVolume = clamp(Number(localStorage.getItem('rodaARoda.volume.v1') ?? 0.8), 0, 1); } catch {}
if (masterVolume > 0) lastAudibleVolume = masterVolume;
if (volumeControl) volumeControl.value = String(masterVolume);
function syncMasterVolume() {
  if (audio) audio.volume = masterVolume;
  if (finalAudio) finalAudio.volume = masterVolume;
  if (muteButton) {
    muteButton.textContent = masterVolume <= 0 ? 'SOM' : 'MUDO';
    muteButton.setAttribute('aria-pressed', masterVolume <= 0 ? 'true' : 'false');
    muteButton.setAttribute('aria-label', masterVolume <= 0 ? 'Ativar som' : 'Silenciar áudio');
  }
  try { localStorage.setItem('rodaARoda.volume.v1', String(masterVolume)); } catch {}
}
volumeControl?.addEventListener('input', () => {
  masterVolume = clamp(Number(volumeControl.value) || 0, 0, 1);
  if (masterVolume > 0) lastAudibleVolume = masterVolume;
  syncMasterVolume();
});
muteButton?.addEventListener('click', () => {
  if (masterVolume > 0) {
    lastAudibleVolume = masterVolume;
    masterVolume = 0;
  } else {
    masterVolume = clamp(lastAudibleVolume || 0.8, 0.05, 1);
  }
  if (volumeControl) volumeControl.value = String(masterVolume);
  syncMasterVolume();
});
syncMasterVolume();
centralButton?.addEventListener('click', () => platformUI.open('content'));
fullscreenButton?.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch (error) { console.warn('[fullscreen]', error); }
});

function unlockMediaPlayback() {
  if (mediaUnlocked) return;
  mediaUnlocked = true;
  // A tiny silent WAV is played during a real user gesture. This gives remote
  // multiplayer audio a much better chance of being accepted later by autoplay policies.
  try {
    const silent = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
    silent.volume = 0.001;
    const promise = silent.play();
    if (promise?.catch) promise.catch(() => {});
  } catch (_) {}
}

document.addEventListener('pointerdown', unlockMediaPlayback, { capture: true, once: true });
document.addEventListener('keydown', unlockMediaPlayback, { capture: true, once: true });

function chooseAudioIndex(list) {
  if (list.length <= 1) return 0;
  let index = Math.floor(Math.random() * list.length);
  if (index === lastAudioIndex) index = (index + 1) % list.length;
  lastAudioIndex = index;
  return index;
}

function prettyAudioName(src) {
  try {
    return decodeURIComponent(String(src).split('/').pop() || 'áudio')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[_-]+/g, ' ');
  } catch (_) {
    return 'áudio';
  }
}

function playAudioSource(src, {
  broadcast = false,
  sourcePlayerId = multiplayer.playerId,
  sourcePlayerName = '',
} = {}) {
  if (!src) return;
  const token = ++audioPlayToken;
  const absoluteSrc = new URL(src, window.location.href).href;

  if (audio) {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    try { audio.currentTime = 0; } catch (_) {}
  }

  audio = new Audio();
  audio.preload = 'auto';
  audio.volume = masterVolume;
  audio.src = absoluteSrc;
  audio.load();

  const who = sourcePlayerName || (sourcePlayerId ? multiplayerPlayerName(sourcePlayerId) : '');
  const label = prettyAudioName(src);
  audioStatus.textContent = who && multiplayer.active ? `${who}: ${label}` : label;
  audioOrbButton.classList.add('is-playing');
  playTalk(4500);
  playRandomAudioAnimation();
  impulseBoth(0.8);

  const started = audio.play();
  if (started?.catch) {
    started.catch((error) => {
      if (token !== audioPlayToken) return;
      console.warn('[audio] reprodução bloqueada:', error);
      audioStatus.textContent = 'clique uma vez na página para liberar o áudio';
      audioOrbButton.classList.remove('is-playing');
      stopAudioAnimation();
    });
  }

  audio.onended = () => {
    if (token !== audioPlayToken) return;
    talkAction?.stop();
    stopAudioAnimation();
    audioStatus.textContent = 'clique no botão roxo';
    audioOrbButton.classList.remove('is-playing');
  };
  audio.onerror = () => {
    if (token !== audioPlayToken) return;
    console.warn('[audio] falha ao carregar:', absoluteSrc);
    stopAudioAnimation();
    audioStatus.textContent = 'falha ao carregar áudio';
    audioOrbButton.classList.remove('is-playing');
  };

  if (broadcast && multiplayer.active && multiplayer.gameStarted) {
    sendMultiplayerEvent('audio', { src }).catch(() => {});
  }
}

function playRandomAudio({ shortOnly = false, broadcast = multiplayer.active } = {}) {
  const list = Array.isArray(config.audioFiles) ? config.audioFiles.filter(Boolean) : [];
  if (!list.length) {
    audioStatus.textContent = 'adicione áudios em config.js';
    playTalk(800);
    return;
  }

  let candidates = list;
  if (shortOnly && list.length > 1) candidates = list.slice(1);
  const localIndex = chooseAudioIndex(candidates);
  const src = candidates[localIndex];
  const localName = multiplayer.active
    ? (game.players[localMultiplayerIndex()]?.name || 'Jogador')
    : '';

  if (broadcast && multiplayer.active && multiplayer.gameStarted) {
    // The server event is the single source of truth. The sender waits for the
    // same startsAt timestamp as every other client, so everybody hears it together.
    sendMultiplayerEvent('audio', { src }).then((event) => {
      if (!event) {
        // Network failure fallback: at least keep the local button responsive.
        playAudioSource(src, {
          broadcast: false,
          sourcePlayerId: multiplayer.playerId,
          sourcePlayerName: localName,
        });
      }
    }).catch(() => {
      playAudioSource(src, {
        broadcast: false,
        sourcePlayerId: multiplayer.playerId,
        sourcePlayerName: localName,
      });
    });
    return;
  }

  playAudioSource(src, {
    broadcast: false,
    sourcePlayerId: multiplayer.playerId,
    sourcePlayerName: localName,
  });
}

audioOrbButton.addEventListener('click', () => {
  unlockMediaPlayback();
  playRandomAudio({ broadcast: multiplayer.active });
});

// -----------------------------------------------------------------------------
// THREE.JS presenter + breast physics driven by the GLB Breast_Jelly_* clips
// -----------------------------------------------------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(31, 1, 0.01, 100);
camera.position.set(0, 0.35, 2.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  stencil: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
viewer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x17214a, 2.7));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
keyLight.position.set(2.4, 3.2, 4.2);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x8ec5ff, 1.5);
rimLight.position.set(-3, 1.4, -2.4);
scene.add(rimLight);

// Zoom stays with OrbitControls; rotation is applied directly to modelRoot so we
// can read the real angular velocity of the body and feed it into the jelly sim.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.enableRotate = false;
controls.enableZoom = true;
controls.minDistance = 0.9;
controls.maxDistance = 4.2;

const clock = new THREE.Clock();
const tmpVec = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
let modelRoot = null;
let mixer = null;
let blinkAction = null;
let talkAction = null;
let standAction = null;
let audioAnimationAction = null;
let audioAnimationClips = [];
let standClipName = '';
let lastAudioAnimationName = '';
let blinkTimer = null;
let modelRotationDrag = null;
let breastPointerDrag = null;
let modelSpinYaw = 0;
let modelSpinPitch = 0;

const breastBones = {
  left: null,
  right: null,
};

// All Breast_Jelly_* clips live in the same AnimationMixer as Blink/Talk, but
// they are paused and sampled manually. That gives us physics-like inertia
// without fighting the actual skinning/weights inside the GLB.
const breastClipActions = new Map();
const breastSim = {
  energy: 0,
  targetEnergy: 0,
  phase: 0,
  phaseSpeed: 1.15,
  targetPhaseSpeed: 1.15,
  horizontalMix: 0.45,
  targetHorizontalMix: 0.45,
  releaseKick: 0,
  lastInputAt: 0,
};

function fitCamera(object) {
  if (!object) return;
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Fit using BOTH the viewer aspect and vertical FOV. This prevents the model
  // from looking stretched when the wardrobe changes the viewer proportions.
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const safeAspect = Math.max(0.01, camera.aspect || 1);
  const hFov = 2 * Math.atan(Math.tan(vFov * 0.5) * safeAspect);
  const fitHeight = (size.y * 0.62) / Math.tan(vFov * 0.5);
  const fitWidth = (size.x * 0.68) / Math.tan(hFov * 0.5);
  const fitDepth = Math.max(size.z * 1.45, 0.01);
  const distance = Math.max(fitHeight, fitWidth, fitDepth);

  const target = new THREE.Vector3(0, Math.max(size.y * 0.50, center.y), 0);
  controls.target.copy(target);
  camera.position.set(0, target.y + size.y * 0.02, distance * 1.14);
  camera.near = Math.max(0.001, distance / 120);
  camera.far = Math.max(100, distance * 100);
  camera.updateProjectionMatrix();
  controls.update();
}

function normalizedAnimationName(name = '') {
  return String(name).trim().toLowerCase().replace(/\.\d+$/i, '');
}

function isPresenterAudioPlaying() {
  return Boolean((audio && !audio.paused && !audio.ended) || (finalAudio && !finalAudio.paused && !finalAudio.ended));
}

function chooseStandClip(animations = []) {
  const priorities = ['standing_relax', 'idle', 'agree'];
  for (const target of priorities) {
    const clip = animations.find((candidate) => normalizedAnimationName(candidate.name) === target);
    if (clip) return clip;
  }
  return animations[0] || null;
}

function chooseAudioAnimationClips(animations = [], standClip = null) {
  const reactionPattern = /(?:^|_)(?:sing|clap|sob|hug|agree|afraid|angry|bow|cheer|complain|scratch|heart|wave|freaky|cry|depressed|scared|defeat)(?:_|$)/i;
  const ignoredPattern = /^(?:blink|talk|breast_jelly_)/i;
  const safe = animations.filter((clip) => {
    if (!clip || clip === standClip || ignoredPattern.test(clip.name || '')) return false;
    return reactionPattern.test(normalizedAnimationName(clip.name));
  });
  if (safe.length) return safe;
  return animations.filter((clip) => clip && clip !== standClip && !ignoredPattern.test(clip.name || ''));
}

function playStandAnimation({ immediate = false } = {}) {
  if (!standAction) return;
  const previous = audioAnimationAction;
  audioAnimationAction = null;
  if (previous && previous !== standAction) {
    if (immediate) previous.stop();
    else previous.fadeOut(0.22);
  }
  standAction.enabled = true;
  standAction.setLoop(THREE.LoopRepeat, Infinity);
  standAction.clampWhenFinished = false;
  standAction.setEffectiveWeight(1);
  standAction.setEffectiveTimeScale(normalizedAnimationName(standClipName) === 'agree' ? 0.42 : 1);
  if (!standAction.isRunning()) standAction.reset().play();
  if (!immediate) standAction.fadeIn(0.22);
}

function playRandomAudioAnimation() {
  if (!mixer || !audioAnimationClips.length) return;
  let candidates = audioAnimationClips;
  if (candidates.length > 1 && lastAudioAnimationName) {
    const filtered = candidates.filter((clip) => clip.name !== lastAudioAnimationName);
    if (filtered.length) candidates = filtered;
  }
  const clip = candidates[Math.floor(Math.random() * candidates.length)];
  if (!clip) return;
  lastAudioAnimationName = clip.name;

  const next = mixer.clipAction(clip);
  const previous = audioAnimationAction || standAction;
  audioAnimationAction = next;
  next.enabled = true;
  next.reset();
  next.setLoop(THREE.LoopRepeat, Infinity);
  next.clampWhenFinished = false;
  next.setEffectiveWeight(1);
  next.setEffectiveTimeScale(1);
  next.play();
  if (previous && previous !== next) next.crossFadeFrom(previous, 0.2, false);
}

function stopAudioAnimation() {
  playStandAnimation();
}

function setupAnimations(gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);
  const clips = new Map(gltf.animations.map(clip => [clip.name, clip]));

  const blinkClip = clips.get('Blink');
  if (blinkClip) {
    blinkAction = mixer.clipAction(blinkClip);
    blinkAction.setLoop(THREE.LoopOnce, 1);
    blinkAction.clampWhenFinished = false;
  }

  const talkClip = clips.get('Talk');
  if (talkClip) {
    talkAction = mixer.clipAction(talkClip);
    talkAction.setLoop(THREE.LoopRepeat, Infinity);
  }

  const standClip = chooseStandClip(gltf.animations);
  standClipName = standClip?.name || '';
  standAction = standClip ? mixer.clipAction(standClip) : null;
  audioAnimationAction = null;
  audioAnimationClips = chooseAudioAnimationClips(gltf.animations, standClip);
  lastAudioAnimationName = '';
  playStandAnimation({ immediate: true });
  if (isPresenterAudioPlaying()) playRandomAudioAnimation();

  breastClipActions.clear();
  gltf.animations
    .filter(clip => /^Breast_Jelly_/i.test(clip.name))
    .forEach((clip) => {
      const action = mixer.clipAction(clip);
      action.enabled = true;
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.play();
      action.paused = true;
      action.time = 0;
      action.setEffectiveWeight(0);
      breastClipActions.set(clip.name, { clip, action });
    });

  console.info('[animation] stand:', standClipName || 'nenhum');
  console.info('[animation] reações de áudio:', audioAnimationClips.map(clip => clip.name));
  console.info('[jelly] clips carregados:', [...breastClipActions.keys()]);
}

function setupBreasts() {
  breastBones.left = modelRoot?.getObjectByName('BreastJelly.L') || null;
  breastBones.right = modelRoot?.getObjectByName('BreastJelly.R') || null;
  console.info('[jelly] BreastJelly.L:', Boolean(breastBones.left));
  console.info('[jelly] BreastJelly.R:', Boolean(breastBones.right));
}

function playBlink() {
  if (!blinkAction) return;
  blinkAction.reset().play();
}

function scheduleBlink() {
  clearTimeout(blinkTimer);
  if (!config.autoBlink || !blinkAction) return;
  const min = Number(config.blinkMinSeconds) || 2.8;
  const max = Math.max(min, Number(config.blinkMaxSeconds) || 5.8);
  blinkTimer = setTimeout(() => {
    playBlink();
    scheduleBlink();
  }, THREE.MathUtils.lerp(min, max, Math.random()) * 1000);
}

function playTalk(duration = 1200) {
  if (!talkAction) return;
  talkAction.reset().play();
  setTimeout(() => talkAction?.stop(), duration);
}

let viewerResizeFrame = 0;
let viewerResizeNeedsRefit = false;

function resizeViewer({ refit = false } = {}) {
  const w = Math.max(1, Math.round(viewer.clientWidth));
  const h = Math.max(1, Math.round(viewer.clientHeight));
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);

  if (refit && modelRoot) {
    const bodyRoot = modelRoot.getObjectByName('ROOT') || modelRoot;
    fitCamera(bodyRoot);
  }
}

function scheduleViewerResize({ refit = false } = {}) {
  viewerResizeNeedsRefit ||= refit;
  cancelAnimationFrame(viewerResizeFrame);
  viewerResizeFrame = requestAnimationFrame(() => {
    const shouldRefit = viewerResizeNeedsRefit;
    viewerResizeNeedsRefit = false;
    resizeViewer({ refit: shouldRefit });
  });
}

// The wardrobe changes the CSS grid without triggering window.resize. Observe
// the viewer itself so the WebGL drawing buffer always matches its CSS box.
const viewerResizeObserver = new ResizeObserver(() => {
  scheduleViewerResize({ refit: game.wardrobeActive || game.finale });
});
viewerResizeObserver.observe(viewer);

function screenPointForBone(bone) {
  bone.getWorldPosition(tmpVec);
  tmpVec.project(camera);
  const rect = renderer.domElement.getBoundingClientRect();
  return {
    x: rect.left + (tmpVec.x * 0.5 + 0.5) * rect.width,
    y: rect.top + (-tmpVec.y * 0.5 + 0.5) * rect.height,
  };
}

function closestBreast(event) {
  const radius = Number(config.breastHitRadiusPx) || 150;
  let best = null;
  let bestDistance = Infinity;

  for (const [side, bone] of Object.entries(breastBones)) {
    if (!bone) continue;
    const point = screenPointForBone(bone);
    const distance = Math.hypot(event.clientX - point.x, event.clientY - point.y);
    if (distance <= radius && distance < bestDistance) {
      best = { side, bone };
      bestDistance = distance;
    }
  }
  return best;
}

function injectBreastPhysics(dx = 0, dy = 0, boost = 1) {
  const movement = Math.hypot(dx, dy);
  if (movement < 0.01) return;

  const horizontal = Math.abs(dx) / Math.max(1, Math.abs(dx) + Math.abs(dy));
  const kick = clamp((movement / 13) * boost, 0, 1.35);
  const angularHint = clamp((Math.abs(modelSpinYaw) + Math.abs(modelSpinPitch)) * 0.04, 0, 0.65);

  breastSim.energy = clamp(Math.max(breastSim.energy, kick * 0.72) + kick * 0.18 + angularHint, 0, 1.28);
  breastSim.targetEnergy = clamp(0.30 + kick * 0.72, 0, 1.05);
  breastSim.targetPhaseSpeed = clamp(1.35 + movement * 0.055 * boost, 1.35, 5.3);
  breastSim.targetHorizontalMix = clamp(horizontal, 0.05, 0.95);
  breastSim.releaseKick = Math.max(breastSim.releaseKick, kick * 0.85);
  breastSim.lastInputAt = performance.now();
}

// Compatibility with existing game events: score/audio/wheel can still trigger a jiggle.
function impulseBoth(amount = 1) {
  const strength = clamp(Number(amount) || 1, 0.1, 2.0);
  breastSim.energy = clamp(breastSim.energy + 0.38 * strength, 0, 1.28);
  breastSim.targetEnergy = Math.max(breastSim.targetEnergy, clamp(0.28 + 0.24 * strength, 0, 1.0));
  breastSim.targetPhaseSpeed = Math.max(breastSim.targetPhaseSpeed, 1.6 + 0.55 * strength);
  breastSim.releaseKick = Math.max(breastSim.releaseKick, 0.55 * strength);
  breastSim.lastInputAt = performance.now();
}

function playBreastJiggle(strength = 1) {
  impulseBoth(strength);
}

function setBreastAction(name, weight, normalizedPhase) {
  const entry = breastClipActions.get(name);
  if (!entry) return;
  const w = clamp(weight, 0, 1);
  entry.action.enabled = true;
  entry.action.paused = true;
  entry.action.time = ((normalizedPhase % 1) + 1) % 1 * entry.clip.duration;
  entry.action.setEffectiveWeight(w);
}

function updateBreastClipPhysics(dt) {
  if (!breastClipActions.size) return;

  const now = performance.now();
  const receivingInput = Boolean(modelRotationDrag || breastPointerDrag) || (now - breastSim.lastInputAt < 90);

  if (!receivingInput) {
    breastSim.targetEnergy = 0;
    breastSim.targetPhaseSpeed = THREE.MathUtils.lerp(breastSim.targetPhaseSpeed, 1.15, 1 - Math.exp(-dt * 3.2));
    breastSim.targetHorizontalMix = THREE.MathUtils.lerp(breastSim.targetHorizontalMix, 0.42, 1 - Math.exp(-dt * 2.3));
  }

  // The envelope is intentionally springy: quick energy pickup, slower release.
  const upRate = receivingInput ? 12.0 : 3.8;
  breastSim.energy = THREE.MathUtils.lerp(
    breastSim.energy,
    breastSim.targetEnergy,
    1 - Math.exp(-dt * upRate),
  );

  if (!receivingInput) {
    const residual = breastSim.releaseKick;
    breastSim.energy += residual * Math.sin(breastSim.phase * Math.PI * 2.0) * dt * 0.22;
    breastSim.releaseKick *= Math.exp(-dt * 2.5);
    breastSim.energy *= Math.exp(-dt * 0.58);
  }

  breastSim.energy = clamp(breastSim.energy, 0, 1.22);
  breastSim.phaseSpeed = THREE.MathUtils.lerp(
    breastSim.phaseSpeed,
    breastSim.targetPhaseSpeed,
    1 - Math.exp(-dt * 7.0),
  );
  breastSim.horizontalMix = THREE.MathUtils.lerp(
    breastSim.horizontalMix,
    breastSim.targetHorizontalMix,
    1 - Math.exp(-dt * 8.0),
  );

  breastSim.phase = (breastSim.phase + dt * breastSim.phaseSpeed * (0.72 + breastSim.energy * 0.55)) % 1;

  // Use multiple authored jelly clips as a dynamic blend. They already contain
  // the correct skin deformation, so the motion is visible and stable.
  const e = clamp(breastSim.energy, 0, 1);
  const h = breastSim.horizontalMix;
  let big = e * (0.56 + (1 - h) * 0.18);
  let side = e * (0.20 + h * 0.62);
  let heavy = e * (0.20 + (1 - h) * 0.30);
  let chaotic = clamp((breastSim.energy - 0.72) * 0.78, 0, 0.34);

  const sum = big + side + heavy + chaotic;
  if (sum > 1.0) {
    const inv = 1 / sum;
    big *= inv;
    side *= inv;
    heavy *= inv;
    chaotic *= inv;
  }

  // Reset every jelly action first. A microscopic idle weight on the soft clip
  // keeps the breast tracks bound and prevents stale transforms after a jiggle.
  for (const [name, entry] of breastClipActions) {
    entry.action.setEffectiveWeight(name === 'Breast_Jelly_01_Soft' ? 0.0001 : 0);
  }

  setBreastAction('Breast_Jelly_05_BigJiggle', big, breastSim.phase);
  setBreastAction('Breast_Jelly_03_SideWave', side, breastSim.phase + 0.08);
  setBreastAction('Breast_Jelly_02_HeavyDrop', heavy, breastSim.phase + 0.16);
  setBreastAction('Breast_Jelly_06_Chaotic', chaotic, breastSim.phase + 0.04);
}

function rotateModelFromPointer(dx, dy, dtSeconds) {
  if (!modelRoot) return;

  const yawDelta = dx * 0.0095;
  const pitchDelta = dy * 0.0048;
  modelRoot.rotation.y += yawDelta;
  modelRoot.rotation.x = clamp(modelRoot.rotation.x + pitchDelta, -0.30, 0.30);

  const safeDt = clamp(dtSeconds || 1 / 60, 1 / 240, 0.08);
  const yawSpeed = yawDelta / safeDt;
  const pitchSpeed = pitchDelta / safeDt;
  modelSpinYaw = THREE.MathUtils.lerp(modelSpinYaw, yawSpeed, 0.45);
  modelSpinPitch = THREE.MathUtils.lerp(modelSpinPitch, pitchSpeed, 0.45);

  // This is the actual coupling that was missing before: body angular movement
  // directly pumps the jelly animation envelope every pointer frame.
  injectBreastPhysics(dx, dy, 1.45);
}

function onPointerDown(event) {
  if (event.button !== 0 || !modelRoot) return;
  const hit = closestBreast(event);
  const now = performance.now();

  if (hit) {
    breastPointerDrag = {
      pointerId: event.pointerId,
      side: hit.side,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
      totalX: 0,
      totalY: 0,
    };
    breastSim.targetEnergy = Math.max(breastSim.targetEnergy, 0.38);
    breastSim.lastInputAt = now;
  } else {
    modelRotationDrag = {
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: now,
      totalX: 0,
      totalY: 0,
    };
  }

  controls.enabled = false;
  viewer.classList.add('is-dragging');
  renderer.domElement.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function onPointerMove(event) {
  const now = performance.now();

  if (breastPointerDrag && event.pointerId === breastPointerDrag.pointerId) {
    const dx = event.clientX - breastPointerDrag.lastX;
    const dy = event.clientY - breastPointerDrag.lastY;
    breastPointerDrag.lastX = event.clientX;
    breastPointerDrag.lastY = event.clientY;
    breastPointerDrag.totalX += dx;
    breastPointerDrag.totalY += dy;
    breastPointerDrag.lastTime = now;

    // Direct breast dragging does not move the body; it just pumps the jelly
    // system harder, so the skin deformation still comes from the GLB clips.
    injectBreastPhysics(dx * 1.35, dy * 1.35, 1.8);
    breastSim.targetHorizontalMix = clamp(0.62 + Math.abs(dx) / 80, 0.55, 0.95);
    event.preventDefault();
    return;
  }

  if (modelRotationDrag && event.pointerId === modelRotationDrag.pointerId) {
    const dx = event.clientX - modelRotationDrag.lastX;
    const dy = event.clientY - modelRotationDrag.lastY;
    const dtSeconds = (now - modelRotationDrag.lastTime) / 1000;
    modelRotationDrag.lastX = event.clientX;
    modelRotationDrag.lastY = event.clientY;
    modelRotationDrag.lastTime = now;
    modelRotationDrag.totalX += dx;
    modelRotationDrag.totalY += dy;
    rotateModelFromPointer(dx, dy, dtSeconds);
    event.preventDefault();
  }
}

function finishDrag(event) {
  if (breastPointerDrag && (!event || event.pointerId === breastPointerDrag.pointerId)) {
    const travel = Math.hypot(breastPointerDrag.totalX, breastPointerDrag.totalY);
    breastSim.energy = clamp(breastSim.energy + 0.20 + travel / 360, 0, 1.25);
    breastSim.releaseKick = Math.max(breastSim.releaseKick, 0.70 + Math.min(0.45, travel / 180));
    breastSim.targetEnergy = 0;
    renderer.domElement.releasePointerCapture?.(breastPointerDrag.pointerId);
    breastPointerDrag = null;
  }

  if (modelRotationDrag && (!event || event.pointerId === modelRotationDrag.pointerId)) {
    const travel = Math.hypot(modelRotationDrag.totalX, modelRotationDrag.totalY);
    const angular = Math.abs(modelSpinYaw) + Math.abs(modelSpinPitch);
    breastSim.energy = clamp(breastSim.energy + 0.18 + travel / 420 + angular * 0.02, 0, 1.25);
    breastSim.releaseKick = Math.max(breastSim.releaseKick, 0.65 + Math.min(0.5, travel / 190));
    breastSim.targetEnergy = 0;
    renderer.domElement.releasePointerCapture?.(modelRotationDrag.pointerId);
    modelRotationDrag = null;
  }

  controls.enabled = true;
  viewer.classList.remove('is-dragging');
}

renderer.domElement.addEventListener('pointerdown', onPointerDown);
renderer.domElement.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('pointerup', finishDrag);
renderer.domElement.addEventListener('pointercancel', finishDrag);
renderer.domElement.addEventListener('lostpointercapture', finishDrag);
renderer.domElement.addEventListener('wheel', (event) => {
  injectBreastPhysics(0, Math.sign(event.deltaY || 0) * 10, 0.7);
}, { passive: true });



const loader = new GLTFLoader();
function applyPlayerCharacter(player) {
  if (!player || game.finale) return;
  const desiredUrl = desiredCharacterUrl(player);
  if (!modelRoot || currentCharacterUrl !== desiredUrl) loadCharacterForPlayer(player);
}

async function startFinale({ remote = false } = {}) {
  if (game.finale) return;
  game.finale = true;
  game.phase = 'finale';
  if (multiplayer.active && !remote) pushMultiplayerSnapshot('finale');
  game.wardrobeActive = false;
  clearTimeout(blinkTimer);

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audioOrbButton?.classList.remove('is-playing');
    stopAudioAnimation();
  }

  document.body.classList.add('is-finale');
  gameShell?.classList.remove('is-wardrobe', 'is-setup');
  gameShell?.classList.add('is-finale');
  if (wardrobePanel) wardrobePanel.hidden = true;

  if (modelRoot) {
    modelRoot.rotation.set(0, 0, 0);
    normalizeModelPlacement();
  }

  requestAnimationFrame(() => {
    resizeViewer();
    const bodyRoot = normalizeModelPlacement() || (modelRoot?.getObjectByName('ROOT') || modelRoot);
    if (bodyRoot) fitCamera(bodyRoot);
  });
  setTimeout(() => {
    resizeViewer();
    const bodyRoot = normalizeModelPlacement() || (modelRoot?.getObjectByName('ROOT') || modelRoot);
    if (bodyRoot) fitCamera(bodyRoot);
  }, 120);

  if (config.finalAudio) {
    finalAudio = new Audio(config.finalAudio);
    finalAudio.preload = 'auto';
    finalAudio.volume = masterVolume;
    if (talkAction) talkAction.reset().play();
    playRandomAudioAnimation();
    finalAudio.play().catch((error) => {
      console.warn('Áudio final aguardando gesto do usuário:', error);
      stopAudioAnimation();
    });
    finalAudio.addEventListener('ended', () => {
      talkAction?.stop();
      stopAudioAnimation();
    }, { once: true });
  }

  if (game.roundState && !game.roundState.finalized) finalizeCurrentRound({ solved: false });
  const record = await finalizeMatchHistory();
  const summary = record || {
    players: game.players.map((player) => ({ name: player.name, score: player.score || 0 })),
    winner: [...game.players].sort((a, b) => (b.score || 0) - (a.score || 0))[0],
    rounds: game.session?.rounds || [],
    durationMs: game.session ? Date.now() - (game.session.startedAtMs || Date.now()) : 0,
  };
  setTimeout(() => {
    platformUI.showResults(summary, {
      playAgain: async (sameSettings) => {
        if (multiplayer.active && multiplayer.hostId !== multiplayer.playerId) {
          setToast('O host controla a próxima partida', 'bad');
          return;
        }
        document.body.classList.remove('is-finale');
        gameShell?.classList.remove('is-finale');
        finalAudio?.pause();
        stopAudioAnimation();
        game.finale = false;
        game.phase = 'spin';
        loadCharacterForPlayer(currentPlayer());
        if (sameSettings) {
          await startConfiguredMatch(game.setup);
        } else {
          const setup = await platformUI.openSetup({ multiplayer: multiplayer.active, host: !multiplayer.active || multiplayer.hostId === multiplayer.playerId });
          if (setup) await startConfiguredMatch(setup);
        }
      },
      menu: () => location.reload(),
    });
  }, 950);
}
let currentCharacterUrl = '';
let characterLoadToken = 0;

function disposeCharacterResources(root) {
  if (!root) return;
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry?.dispose?.();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      for (const value of Object.values(material)) {
        if (value?.isTexture) value.dispose?.();
      }
      material.dispose?.();
    }
  });
}

function desiredCharacterUrl(player = currentPlayer()) {
  const character = characterForPlayer(player);
  return new URL(character?.path || config.modelPath || './assets/model/silvioburstoanimado.glb', window.location.href).href;
}

function loadCharacterForPlayer(player = currentPlayer()) {
  const modelUrl = desiredCharacterUrl(player);
  const token = ++characterLoadToken;
  currentCharacterUrl = modelUrl;
  clearTimeout(blinkTimer);
  if (modelRoot) {
    const previousRoot = modelRoot;
    scene.remove(previousRoot);
    disposeCharacterResources(previousRoot);
    modelRoot = null;
  }
  mixer = null;
  blinkAction = null;
  talkAction = null;
  standAction = null;
  audioAnimationAction = null;
  audioAnimationClips = [];
  standClipName = '';
  lastAudioAnimationName = '';
  breastClipActions.clear();
  breastBones.left = null;
  breastBones.right = null;
  if (loadingOverlay) loadingOverlay.classList.remove('is-hidden');
  if (loadingText) loadingText.textContent = `Carregando ${characterForPlayer(player)?.label || 'personagem'}…`;
  loader.load(
    modelUrl,
    (gltf) => {
      if (token !== characterLoadToken) return;
      modelRoot = gltf.scene;
      scene.add(modelRoot);
      modelRoot.traverse((obj) => {
        if (obj.isMesh) {
          obj.frustumCulled = false;
          obj.castShadow = false;
          obj.receiveShadow = false;
        }
      });

      const bodyRoot = normalizeModelPlacement() || (modelRoot.getObjectByName('ROOT') || modelRoot);
      fitCamera(bodyRoot);
      setupAnimations(gltf);
      setupBreasts();
      resizeViewer();
      scheduleBlink();
      const previewPlayer = game.wardrobeActive ? game.players[game.wardrobePlayerIndex] : currentPlayer();
      if (loadingOverlay) loadingOverlay.classList.add('is-hidden');
      viewerHint.textContent = game.wardrobeActive
        ? `${previewPlayer?.name?.toUpperCase() || 'JOGADOR'} • ESCOLHA UMA VERSÃO DO SILVIO`
        : 'GIRE O PERSONAGEM PARA VER MELHOR';
    },
    (progress) => {
      if (!loadingText || !progress.total) return;
      const percent = progress.total > 0
        ? clamp(Math.round((progress.loaded / progress.total) * 100), 0, 100)
        : null;
      loadingText.textContent = percent === null
        ? `Carregando ${characterForPlayer(player)?.label || 'personagem'}…`
        : `Carregando ${characterForPlayer(player)?.label || 'personagem'}… ${percent}%`;
    },
    (error) => {
      console.error('Falha ao carregar o modelo:', modelUrl, error);
      if (loadingText) loadingText.textContent = 'Falha ao carregar o personagem.';
      setToast('Não foi possível carregar esta versão do Silvio. Escolha outra variante.', 'bad');
    },
  );
}

loadCharacterForPlayer(currentPlayer());

function renderLoop() {
  requestAnimationFrame(renderLoop);
  const dt = Math.min(clock.getDelta(), 1 / 20);

  // Update the physics envelope first, then sample the authored jelly clips at
  // the current phase, then let the mixer evaluate Blink/Talk + chest together.
  updateBreastClipPhysics(dt);
  mixer?.update(dt);

  if (!modelRotationDrag) {
    modelSpinYaw *= Math.exp(-dt * 5.0);
    modelSpinPitch *= Math.exp(-dt * 5.0);
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  scheduleViewerResize({ refit: game.wardrobeActive || game.finale });
  drawWheel(wheelAngle);
});

let cheatBuffer = '';
function forceLocalRoundWin() {
  if (!game.puzzle || game.wardrobeActive || game.finale || game.phase === 'solved') return;
  if (multiplayer.active) {
    const index = localMultiplayerIndex();
    if (index >= 0) game.currentPlayerIndex = index;
  }
  setToast('SOUOSILVIO • RODADA GANHA', 'good');
  solvePuzzleSuccess();
}

// Secret code works even while an input has focus.
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (/^[a-zA-Z]$/.test(event.key)) {
    cheatBuffer = (cheatBuffer + event.key.toLowerCase()).slice(-24);
    if (cheatBuffer.endsWith('souosilvio')) {
      cheatBuffer = '';
      forceLocalRoundWin();
      return;
    }
  }

  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (/^[a-zA-Z]$/.test(event.key) && game.phase === 'letter') {
    guessLetter(event.key.toUpperCase());
  }
  if (event.code === 'Space' && game.phase === 'spin') {
    event.preventDefault();
    spinWheel();
  }
});

// Start with the mode menu. A game is initialized only after Single Player or
// a multiplayer lobby is ready.
drawWheel();
resizeViewer();
renderLoop();
