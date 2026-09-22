import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

const config = window.SILVIO_CONFIG || {};

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
const wardrobeHatName = $('#wardrobeHatName');
const wardrobeShirtName = $('#wardrobeShirtName');
const wardrobeGlassesName = $('#wardrobeGlassesName');
const accessoryEditToggle = $('#accessoryEditToggle');
const accessoryEditTools = $('#accessoryEditTools');
const accessoryEditStatus = $('#accessoryEditStatus');
const accessoryResetButton = $('#accessoryResetButton');
const accessoryEditTargetButtons = [...document.querySelectorAll('[data-edit-target]')];
const accessoryTransformModeButtons = [...document.querySelectorAll('[data-transform-mode]')];
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
const multiplayerLobbyPlayers = $('#multiplayerLobbyPlayers');
const multiplayerCountdown = $('#multiplayerCountdown');
const multiplayerCountdownNumber = $('#multiplayerCountdownNumber');

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

// -----------------------------------------------------------------------------
// Game state
// -----------------------------------------------------------------------------
let game = {
  round: 1,
  players: [{
    name: 'Jogador 1',
    score: 0,
    outfit: { hat: 0, glasses: 0, shirt: 0 },
    character: 0,
    removedAccessories: [],
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
};

const multiplayer = {
  active: false,
  lobbyCode: '',
  playerId: '',
  hostId: '',
  localReady: false,
  gameStarted: false,
  lastRevision: -1,
  pollTimer: null,
  polling: false,
  applyingRemote: false,
  initializingGame: false,
  inviteUrl: '',
  serverBase: '',
};

let multiplayerOutfitSyncTimer = null;

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

function playerFromLobby(entry, index, previous = null) {
  return {
    id: entry.id,
    name: entry.name || `Jogador ${index + 1}`,
    score: previous?.score || 0,
    outfit: {
      hat: Number(entry.outfit?.hat) || 0,
      glasses: Number(entry.outfit?.glasses) || 0,
      shirt: Number(entry.outfit?.shirt) || 0,
    },
    character: Number.isFinite(Number(entry.character)) ? Number(entry.character) : (previous?.character || 0),
    removedAccessories: Array.isArray(previous?.removedAccessories) ? [...previous.removedAccessories] : [],
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
      badge.textContent = `${player.name}${player.ready ? ' • PRONTO' : ' • VESTINDO'}`;
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
    // Never let a polling tick undo the accessory the local player just clicked
    // while their new outfit is still on its way to the server.
    if (entry.id === multiplayer.playerId && previous?.outfit && !entry.ready) {
      player.outfit = { ...previous.outfit };
    }
    return player;
  });
  const localIndex = Math.max(0, game.players.findIndex((player) => player.id === multiplayer.playerId));
  game.wardrobePlayerIndex = localIndex;
  game.currentPlayerIndex = localIndex;
  const localEntry = lobby.players.find((player) => player.id === multiplayer.playerId);
  multiplayer.localReady = Boolean(localEntry?.ready);
  document.body.classList.toggle('is-local-ready', multiplayer.localReady);
  if (wardrobeConfirmButton) wardrobeConfirmButton.textContent = multiplayer.localReady ? 'EDITAR LOOK' : 'PRONTO';
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
}

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
    multiplayer.localReady = false;
    multiplayer.initializingGame = false;
    await loadInviteUrl();
    beginMultiplayerWardrobe(data.lobby);
    startLobbyPolling();
    setToast(`LOBBY ${data.lobby.code} • monte seu personagem`, 'good');
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

function scheduleMultiplayerOutfitSync() {
  if (!multiplayer.active || multiplayer.gameStarted || multiplayer.localReady) return;
  clearTimeout(multiplayerOutfitSyncTimer);
  multiplayerOutfitSyncTimer = setTimeout(() => updateMultiplayerPlayer(false).catch(() => {}), 120);
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
      outfit: player.outfit,
      character: Number(player.character) || 0,
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
  setAccessoryEditing(false);
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
    version: 1,
    reason,
    timestamp: Date.now(),
    round: game.round,
    players: game.players.map((player) => ({
      id: player.id || '',
      name: player.name,
      score: Number(player.score) || 0,
      outfit: { ...player.outfit },
      removedAccessories: [...(player.removedAccessories || [])],
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

async function pushMultiplayerSnapshot(reason = 'state') {
  if (!multiplayer.active || !multiplayer.gameStarted || multiplayer.applyingRemote || !multiplayer.lobbyCode) return;
  try {
    const data = await apiRequest('/api/lobby/snapshot', {
      method: 'POST',
      body: JSON.stringify({
        code: multiplayer.lobbyCode,
        playerId: multiplayer.playerId,
        snapshot: serializeGameSnapshot(reason),
      }),
    });
    if (Number.isFinite(data.revision)) multiplayer.lastRevision = data.revision;
  } catch (error) {
    console.warn('[multiplayer] falha ao sincronizar:', error);
  }
}

function applyRemoteSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return;
  const shouldStartFinale = Boolean(snapshot.finale) && !game.finale;
  multiplayer.applyingRemote = true;
  closeWardrobeForGame();
  multiplayer.gameStarted = true;
  game.round = Number(snapshot.round) || 1;
  game.players = Array.isArray(snapshot.players) ? snapshot.players.map((player, index) => ({
    id: player.id || '',
    name: player.name || `Jogador ${index + 1}`,
    score: Number(player.score) || 0,
    outfit: { hat: Number(player.outfit?.hat) || 0, glasses: Number(player.outfit?.glasses) || 0, shirt: Number(player.outfit?.shirt) || 0 },
    character: Number.isFinite(Number(player.character)) ? Number(player.character) : 0,
    removedAccessories: Array.isArray(player.removedAccessories) ? [...player.removedAccessories] : [],
  })) : game.players;
  game.currentPlayerIndex = clamp(Number(snapshot.currentPlayerIndex) || 0, 0, Math.max(0, game.players.length - 1));
  game.puzzle = snapshot.puzzle ? { ...snapshot.puzzle } : game.puzzle;
  game.guessed = new Set(Array.isArray(snapshot.guessed) ? snapshot.guessed : []);
  game.phase = snapshot.phase || 'spin';
  game.currentWheelSegment = snapshot.currentWheelSegment ? { ...snapshot.currentWheelSegment } : null;
  game.spinning = false;
  if (Number.isFinite(snapshot.wheelAngle)) wheelAngle = snapshot.wheelAngle;
  game.finale = false;

  updateScore();
  updateRoundLights();
  if (roundDisplay) roundDisplay.textContent = String(game.round);
  if (categoryDisplay) categoryDisplay.textContent = game.puzzle?.category || '—';
  if (wheelResult) wheelResult.textContent = snapshot.wheelResultText || (game.currentWheelSegment?.label || 'gire a roda');
  if (phaseDisplay) phaseDisplay.textContent = snapshot.phaseText || `${currentPlayer()?.name || 'Jogador'}: gire para jogar`;
  if (solvePanel) solvePanel.hidden = true;
  buildPuzzleBoard();
  syncControls();
  applyPlayerOutfit(currentPlayer());
  drawWheel(wheelAngle);
  multiplayer.applyingRemote = false;

  if (shouldStartFinale) startFinale({ remote: true });
}

function initializeMultiplayerGame(lobby) {
  if (multiplayer.initializingGame || multiplayer.gameStarted || lobby.hostId !== multiplayer.playerId) return;
  multiplayer.initializingGame = true;
  const previousById = new Map(game.players.map((player) => [player.id, player]));
  game.players = lobby.players.map((entry, index) => {
    const previous = previousById.get(entry.id);
    return {
      id: entry.id,
      name: entry.name || `Jogador ${index + 1}`,
      score: 0,
      outfit: { ...entry.outfit },
      character: Number.isFinite(Number(entry.character)) ? Number(entry.character) : 0,
      removedAccessories: [],
    };
  });
  game.currentPlayerIndex = 0;
  game.round = 1;
  game.finale = false;
  multiplayer.gameStarted = true;
  closeWardrobeForGame();
  startRound();
  setTimeout(() => {
    multiplayer.initializingGame = false;
  }, 300);
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
    const query = new URLSearchParams({ code: multiplayer.lobbyCode, playerId: multiplayer.playerId });
    const data = await apiRequest(`/api/lobby/state?${query.toString()}`, { method: 'GET', headers: {} });
    const lobby = data.lobby;
    const changed = lobby.revision !== multiplayer.lastRevision;
    if (changed || lobby.status === 'countdown' || !multiplayer.gameStarted) {
      handleLobbyStatus(lobby);
      multiplayer.lastRevision = Math.max(multiplayer.lastRevision, lobby.revision);
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
  multiplayer.pollTimer = setInterval(pollLobby, 400);
  pollLobby();
}

let accessoryEditEnabled = false;
let activeEditCategory = 'hat';
let activeTransformMode = 'translate';
let accessoryTransformControls = null;
let transformDragging = false;
let accessoryTransformDirty = false;

const ACCESSORY_EDIT_STORAGE_KEY = 'rodaRodapersonagem.accessoryFits.v4';
let accessoryEditPresets = {};
try {
  accessoryEditPresets = JSON.parse(localStorage.getItem(ACCESSORY_EDIT_STORAGE_KEY) || '{}') || {};
} catch (error) {
  console.warn('[acessórios] não foi possível ler os ajustes salvos:', error);
  accessoryEditPresets = {};
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
    const removed = Array.isArray(item.removedAccessories) ? item.removedAccessories.length : 0;
    const wornCount = Math.max(0, 3 - removed);
    pill.innerHTML = `<span>${item.name}<small class="outfit-count">${wornCount}/3 ACESS.</small></span><strong>${item.score.toLocaleString('pt-BR')}</strong>`;
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
    outfit: { hat: index % 6, glasses: index % 6, shirt: index % 6 },
    character: index % Math.max(1, characterList().length),
    removedAccessories: [],
  }));
  game.currentPlayerIndex = 0;
  game.round = 1;
  game.finale = false;
  playerSetup?.classList.add('is-hidden');
  gameShell?.classList.remove('is-setup');
  beginWardrobeSetup();
  updatePlayersUI();
  setToast(`${safeCount} jogador${safeCount > 1 ? 'es' : ''} • hora de montar os personagens`, 'good');
}

function nextPlayer(message = '') {
  if (game.players.length <= 1) {
    applyPlayerOutfit(currentPlayer());
    return;
  }
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  updatePlayersUI();
  applyPlayerOutfit(currentPlayer());
  const player = currentPlayer();
  if (message) setToast(`${message} • vez de ${player.name}`, 'bad');
  phaseDisplay.textContent = `vez de ${player.name}`;
}

document.querySelectorAll('[data-player-count]').forEach((button) => {
  button.addEventListener('click', () => setPlayerCount(button.dataset.playerCount));
});

const wardrobeNameNodes = {
  hat: wardrobeHatName,
  glasses: wardrobeGlassesName,
  shirt: wardrobeShirtName,
};

function accessoryList(category) {
  const list = config.accessories?.[category];
  return Array.isArray(list) ? list : [];
}

function characterList() {
  const list = Array.isArray(config.characters) ? config.characters : [];
  return list.length ? list : [{ id: 'default', label: 'Personagem', path: config.modelPath || './assets/model/lucas.glb' }];
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

function selectedAccessoryItem(category, player = currentWardrobePlayer()) {
  const list = accessoryList(category);
  if (!player || !list.length) return null;
  const index = clamp(Number(player.outfit?.[category]) || 0, 0, list.length - 1);
  return list[index] || null;
}

function accessoryEditKey(category, item) {
  return item ? `${category}:${item.id || item.path || 'item'}` : '';
}

function persistAccessoryEditPresets() {
  try {
    localStorage.setItem(ACCESSORY_EDIT_STORAGE_KEY, JSON.stringify(accessoryEditPresets));
  } catch (error) {
    console.warn('[acessórios] não foi possível salvar o encaixe:', error);
  }
}

function savedAccessoryTransform(category, item) {
  return accessoryEditPresets[accessoryEditKey(category, item)] || null;
}

function saveAccessoryTransform(category, item, object, { persist = true } = {}) {
  if (!category || !item || !object) return;
  accessoryEditPresets[accessoryEditKey(category, item)] = {
    position: object.position.toArray(),
    quaternion: object.quaternion.toArray(),
    scale: object.scale.toArray(),
  };
  if (persist) persistAccessoryEditPresets();
}

function clearSavedAccessoryTransform(category, item) {
  const key = accessoryEditKey(category, item);
  if (!key) return;
  delete accessoryEditPresets[key];
  persistAccessoryEditPresets();
}

function computeRenderableLocalBox(root) {
  const box = new THREE.Box3();
  const tmpBox = new THREE.Box3();
  const inv = new THREE.Matrix4();
  let hasMesh = false;
  root.updateMatrixWorld(true);
  inv.copy(root.matrixWorld).invert();
  root.traverse((child) => {
    if (!child.isMesh || !child.geometry) return;
    const geometry = child.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    if (!geometry.boundingBox) return;
    tmpBox.copy(geometry.boundingBox);
    tmpBox.applyMatrix4(child.matrixWorld);
    tmpBox.applyMatrix4(inv);
    if (!hasMesh) {
      box.copy(tmpBox);
      hasMesh = true;
    } else {
      box.union(tmpBox);
    }
  });
  return hasMesh ? box : null;
}

function wrapObjectWithGeometryOrigin(template) {
  const inner = template.clone(true);
  const wrapper = new THREE.Group();
  wrapper.name = `${template.name || 'Object'}.GeometryOrigin`;
  const localBox = computeRenderableLocalBox(inner);
  const geometryCenter = localBox ? localBox.getCenter(new THREE.Vector3()) : new THREE.Vector3();
  inner.position.sub(geometryCenter);
  wrapper.userData.geometryOriginCenter = geometryCenter.toArray();
  wrapper.add(inner);
  return wrapper;
}

function positionForGeometryOrigin(basePosition, quaternion, scale, geometryCenterArray) {
  const pos = new THREE.Vector3().fromArray(basePosition || [0, 0, 0]);
  const quat = new THREE.Quaternion().fromArray(quaternion || [0, 0, 0, 1]);
  const scl = Array.isArray(scale) ? new THREE.Vector3().fromArray(scale) : new THREE.Vector3(1, 1, 1);
  const center = Array.isArray(geometryCenterArray)
    ? new THREE.Vector3().fromArray(geometryCenterArray)
    : new THREE.Vector3();
  center.multiply(scl).applyQuaternion(quat);
  pos.add(center);
  return pos;
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

function applyBaseOrSavedAccessoryTransform(object, category, item) {
  if (!object) return;
  const base = config.accessoryTransforms?.[category];
  const geometryCenter = object.userData?.geometryOriginCenter;
  const baseQuat = base?.quaternion || [0, 0, 0, 1];
  const baseScale = base?.scale || [1, 1, 1];
  if (base?.quaternion) object.quaternion.fromArray(base.quaternion);
  if (base?.scale) object.scale.fromArray(base.scale);
  if (base?.position) {
    const adjusted = positionForGeometryOrigin(base.position, baseQuat, baseScale, geometryCenter);
    object.position.copy(adjusted);
  }

  const saved = savedAccessoryTransform(category, item);
  if (saved?.position) object.position.fromArray(saved.position);
  if (saved?.quaternion) object.quaternion.fromArray(saved.quaternion);
  if (saved?.scale) object.scale.fromArray(saved.scale);
}

function updateEditTargetUI() {
  accessoryEditTargetButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.editTarget === activeEditCategory);
  });
  accessoryTransformModeButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.transformMode === activeTransformMode);
  });
  document.querySelectorAll('.wardrobe-selector[data-wardrobe-category]').forEach((row) => {
    row.classList.toggle('is-edit-target', row.dataset.wardrobeCategory === activeEditCategory && accessoryEditEnabled);
  });

  if (accessoryEditStatus) {
    const labels = { hat: 'cabeça', glasses: 'óculos', shirt: 'camisa' };
    const item = selectedAccessoryItem(activeEditCategory);
    accessoryEditStatus.textContent = `Editando: ${labels[activeEditCategory] || activeEditCategory}${item?.label ? ` • ${item.label}` : ''}`;
  }
}

function attachTransformToActiveAccessory() {
  if (!accessoryTransformControls) return;
  accessoryTransformControls.detach();
  if (!accessoryEditEnabled || !game.wardrobeActive) return;
  const object = equippedAccessories?.[activeEditCategory];
  if (!object) return;
  accessoryTransformControls.attach(object);
  accessoryTransformControls.setMode(activeTransformMode);
  accessoryTransformControls.setSpace(activeTransformMode === 'translate' ? 'world' : 'local');
}

function setAccessoryEditTarget(category) {
  if (!['hat', 'glasses', 'shirt'].includes(category)) return;
  activeEditCategory = category;
  updateEditTargetUI();
  attachTransformToActiveAccessory();
}

function setAccessoryEditing(enabled, { syncCheckbox = true } = {}) {
  accessoryEditEnabled = Boolean(enabled) && game.wardrobeActive && !game.finale;
  if (syncCheckbox && accessoryEditToggle) accessoryEditToggle.checked = accessoryEditEnabled;
  if (accessoryEditTools) accessoryEditTools.hidden = !accessoryEditEnabled;
  if (accessoryTransformControls && !accessoryEditEnabled) accessoryTransformControls.detach();
  if (accessoryEditEnabled) attachTransformToActiveAccessory();
  updateEditTargetUI();
  if (viewerHint && game.wardrobeActive) {
    viewerHint.textContent = accessoryEditEnabled
      ? 'EDIÇÃO ATIVA • USE O GIZMO 3D PARA MOVER, ROTACIONAR OU ESCALONAR'
      : `${currentWardrobePlayer()?.name?.toUpperCase() || 'JOGADOR'} • ESCOLHA CABEÇA, ÓCULOS E CAMISA`;
  }
}

function beginWardrobeSetup() {
  game.wardrobeActive = true;
  game.wardrobePlayerIndex = 0;
  game.phase = 'wardrobe';
  gameShell?.classList.add('is-wardrobe');
  if (wardrobePanel) wardrobePanel.hidden = false;
  renderWardrobePlayer();

  // Wait for the wardrobe grid to settle, then update canvas + camera to the
  // new, wider viewer. Without this the old canvas aspect gets CSS-stretched.
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
  for (const category of ['hat', 'glasses', 'shirt']) {
    const list = accessoryList(category);
    const index = clamp(Number(player.outfit?.[category]) || 0, 0, Math.max(0, list.length - 1));
    player.outfit[category] = index;
    const item = list[index];
    if (wardrobeNameNodes[category]) wardrobeNameNodes[category].textContent = item?.label || '—';
  }
  game.currentPlayerIndex = game.wardrobePlayerIndex;
  updatePlayersUI();
  applyPlayerOutfit(player);
  if (viewerHint) viewerHint.textContent = `${player.name.toUpperCase()} • ESCOLHA PERSONAGEM, CABEÇA, ÓCULOS E CAMISA`;
}

function cycleWardrobe(category, direction) {
  if (!game.wardrobeActive) return;
  const player = game.players[game.wardrobePlayerIndex];
  const list = accessoryList(category);
  if (!player || !list.length) return;
  const current = Number(player.outfit?.[category]) || 0;
  player.outfit[category] = (current + direction + list.length) % list.length;
  if (accessoryEditEnabled) activeEditCategory = category;
  renderWardrobePlayer();
  updateEditTargetUI();
  scheduleMultiplayerOutfitSync();
}

document.querySelectorAll('[data-wardrobe-prev]').forEach((button) => {
  button.addEventListener('click', () => cycleWardrobe(button.dataset.wardrobePrev, -1));
});
document.querySelectorAll('[data-wardrobe-next]').forEach((button) => {
  button.addEventListener('click', () => cycleWardrobe(button.dataset.wardrobeNext, 1));
});
document.querySelectorAll('[data-character-prev]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!game.wardrobeActive) return;
    const player = game.players[game.wardrobePlayerIndex];
    const list = characterList();
    if (!player || !list.length) return;
    player.character = (Number(player.character) || 0) - 1;
    if (player.character < 0) player.character = list.length - 1;
    renderWardrobePlayer();
    scheduleMultiplayerOutfitSync();
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
    scheduleMultiplayerOutfitSync();
  });
});

document.querySelectorAll('.wardrobe-selector[data-wardrobe-category]').forEach((row) => {
  row.addEventListener('click', () => {
    if (accessoryEditEnabled) setAccessoryEditTarget(row.dataset.wardrobeCategory);
  });
});

accessoryEditToggle?.addEventListener('change', () => {
  setAccessoryEditing(accessoryEditToggle.checked, { syncCheckbox: false });
});

accessoryEditTargetButtons.forEach((button) => {
  button.addEventListener('click', () => setAccessoryEditTarget(button.dataset.editTarget));
});

accessoryTransformModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeTransformMode = button.dataset.transformMode || 'translate';
    if (accessoryTransformControls) {
      accessoryTransformControls.setMode(activeTransformMode);
      accessoryTransformControls.setSpace(activeTransformMode === 'translate' ? 'world' : 'local');
    }
    updateEditTargetUI();
  });
});

accessoryResetButton?.addEventListener('click', () => {
  const player = currentWardrobePlayer();
  const item = selectedAccessoryItem(activeEditCategory, player);
  const object = equippedAccessories?.[activeEditCategory];
  if (!item || !object) return;
  clearSavedAccessoryTransform(activeEditCategory, item);
  applyBaseOrSavedAccessoryTransform(object, activeEditCategory, item);
  attachTransformToActiveAccessory();
  setToast(`${item.label} voltou ao encaixe de referência`, 'good');
});

wardrobeConfirmButton?.addEventListener('click', () => {
  if (!game.wardrobeActive) return;
  if (multiplayer.active) {
    toggleMultiplayerReady();
    return;
  }
  if (game.wardrobePlayerIndex < game.players.length - 1) {
    game.wardrobePlayerIndex += 1;
    renderWardrobePlayer();
    return;
  }

  setAccessoryEditing(false);
  game.wardrobeActive = false;
  game.currentPlayerIndex = 0;
  gameShell?.classList.remove('is-wardrobe');
  if (wardrobePanel) wardrobePanel.hidden = true;
  updatePlayersUI();
  applyPlayerOutfit(currentPlayer());
  scheduleViewerResize({ refit: true });
  setTimeout(() => scheduleViewerResize({ refit: true }), 80);
  startRound();
  setToast('PERSONAGENS PRONTOS • AGORA VALE!', 'good');
});

function pickPuzzle() {
  const pool = Array.isArray(config.puzzlePool) && config.puzzlePool.length
    ? config.puzzlePool
    : [{ category: 'DIVA POP', phrase: 'DIVA POP SEM LIMITE' }];

  const previous = game.puzzle?.phrase;
  const candidates = pool.length > 1 ? pool.filter(item => item.phrase !== previous) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function startRound({ increment = false } = {}) {
  if (game.finale) return;
  if (increment) game.round += 1;
  if (game.round > 3) {
    startFinale();
    return;
  }
  game.puzzle = pickPuzzle();
  game.guessed = new Set();
  game.phase = 'spin';
  game.currentWheelSegment = null;
  game.spinning = false;
  solvePanel.hidden = true;
  solveInput.value = '';
  wheelResult.textContent = 'gira a roda';
  phaseDisplay.textContent = `${currentPlayer().name}: gire para jogar`;
  categoryDisplay.textContent = game.puzzle.category;
  roundDisplay.textContent = String(game.round);
  updateScore();
  updateRoundLights();
  buildPuzzleBoard();
  buildKeyboard();
  syncControls();
  applyPlayerOutfit(currentPlayer());
  impulseBoth(0.45);
  pushMultiplayerSnapshot(increment ? 'next-round' : 'round-start');
}

function updateScore() {
  updatePlayersUI();
}

function updateRoundLights() {
  document.querySelectorAll('.round-light').forEach((light, index) => {
    light.classList.toggle('is-active', index === ((game.round - 1) % 3));
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
  buildKeyboard();
}

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

  if (matches > 0) {
    const earned = value * matches;
    currentPlayer().score += earned;
    updateScore();
    phaseDisplay.textContent = `${matches}x ${letter} • +${earned}`;
    setToast(`${matches} letra${matches > 1 ? 's' : ''} ${letter} • +${earned}`, 'good');
    playTalk(700);
    impulseBoth(0.5 + Math.min(matches, 3) * 0.1);
  } else {
    phaseDisplay.textContent = `não tem ${letter}`;
    setToast(`Não tem ${letter}`, 'bad');
    playRandomAudio({ shortOnly: true });
    nextPlayer(`Não tem ${letter}`);
  }

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
  syncControls();
  pushMultiplayerSnapshot(matches > 0 ? 'letter-hit' : 'letter-miss');
}

function isPuzzleFullyRevealed() {
  const uniqueLetters = new Set(normalizeText(game.puzzle.phrase).replace(/[^A-Z]/g, ''));
  return [...uniqueLetters].every(letter => game.guessed.has(letter));
}

function solvePuzzleSuccess() {
  game.phase = 'solved';
  const winner = currentPlayer();
  winner.score += 1000;
  updateScore();
  buildPuzzleBoard();
  phaseDisplay.textContent = `ACERTOU! ${winner.name} +1000`;
  wheelResult.textContent = game.round >= 3 ? 'final!' : 'rodada concluída';
  solvePanel.hidden = true;
  setToast(`${winner.name} ACERTOU A FRASE! +1000`, 'good');
  playTalk(1400);
  impulseBoth(1.35);
  // O look permanece intacto durante todas as rodadas.
  applyPlayerOutfit(winner);
  syncControls();
  pushMultiplayerSnapshot('round-win');

  if (game.round >= 3) {
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
    currentPlayer().score = Math.max(0, currentPlayer().score - 200);
    updateScore();
    setToast('Resposta errada • -200', 'bad');
    playRandomAudio({ shortOnly: true });
    nextPlayer('Resposta errada');
    game.phase = 'spin';
    game.currentWheelSegment = null;
    wheelResult.textContent = 'gire novamente';
    phaseDisplay.textContent = `${currentPlayer().name}: gire para jogar`;
    solvePanel.hidden = true;
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
  if (game.round >= 3 && game.phase === 'solved') {
    startFinale();
    return;
  }
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

function spinWheel() {
  if (!canLocalInteract()) {
    if (multiplayer.active) setToast(`Agora é a vez de ${currentPlayer()?.name || 'outro jogador'}`, 'bad');
    return;
  }
  if (game.spinning || game.phase !== 'spin') return;
  game.spinning = true;
  game.currentWheelSegment = null;
  wheelResult.textContent = 'girando...';
  phaseDisplay.textContent = 'segura!';
  syncControls();

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

  wheelAnimStart = performance.now();
  wheelAnimDuration = 2700 + Math.random() * 500;
  const startAngle = wheelAngle;
  wheelTargetAngle = startAngle + extraTurns + delta;

  const animateSpin = (now) => {
    const t = clamp((now - wheelAnimStart) / wheelAnimDuration, 0, 1);
    const eased = cubicOut(t);
    wheelAngle = startAngle + (wheelTargetAngle - startAngle) * eased;
    drawWheel(wheelAngle);

    if (t < 1) {
      wheelAnimationFrame = requestAnimationFrame(animateSpin);
    } else {
      wheelAngle = wheelTargetAngle % (Math.PI * 2);
      drawWheel(wheelAngle);
      finishWheelSpin(segments[selectedIndex]);
    }
  };

  cancelAnimationFrame(wheelAnimationFrame);
  wheelAnimationFrame = requestAnimationFrame(animateSpin);
}

function finishWheelSpin(segment) {
  game.spinning = false;
  game.currentWheelSegment = segment;
  wheelResult.textContent = segment.label;

  if (segment.type === 'bankrupt') {
    currentPlayer().score = 0;
    updateScore();
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

  syncControls();
  pushMultiplayerSnapshot(segment.type === 'bankrupt' ? 'bankrupt' : segment.type === 'loseTurn' ? 'pass-turn' : 'wheel-value');
}

spinButton.addEventListener('click', spinWheel);

// -----------------------------------------------------------------------------
// Audio orb
// -----------------------------------------------------------------------------
let audio = null;
let lastAudioIndex = -1;

function chooseAudioIndex(list) {
  if (list.length <= 1) return 0;
  let index = Math.floor(Math.random() * list.length);
  if (index === lastAudioIndex) index = (index + 1) % list.length;
  lastAudioIndex = index;
  return index;
}

function playRandomAudio({ shortOnly = false } = {}) {
  const list = Array.isArray(config.audioFiles) ? config.audioFiles.filter(Boolean) : [];
  if (!list.length) {
    audioStatus.textContent = 'sem áudios nesta versão';
    playTalk(800);
    return;
  }

  let candidates = list;
  if (shortOnly && list.length > 1) candidates = list.slice(1);
  const localIndex = chooseAudioIndex(candidates);
  const src = candidates[localIndex];

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  audio = new Audio(src);
  audio.preload = 'auto';
  audioStatus.textContent = src.split('/').pop().replace(/_/g, ' ');
  audioOrbButton.classList.add('is-playing');
  playTalk(4500);
  impulseBoth(0.8);

  audio.play().catch(() => {
    audioStatus.textContent = 'clique de novo para liberar áudio';
    audioOrbButton.classList.remove('is-playing');
  });

  audio.addEventListener('ended', () => {
    talkAction?.stop();
    audioStatus.textContent = 'sem áudios nesta versão';
    audioOrbButton.classList.remove('is-playing');
  }, { once: true });
}

audioOrbButton.addEventListener('click', () => playRandomAudio());

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

accessoryTransformControls = new TransformControls(camera, renderer.domElement);
accessoryTransformControls.setSize(0.72);
accessoryTransformControls.setMode(activeTransformMode);
accessoryTransformControls.setSpace('world');
scene.add(accessoryTransformControls.getHelper());

accessoryTransformControls.addEventListener('dragging-changed', (event) => {
  transformDragging = Boolean(event.value);
  controls.enabled = !transformDragging;
  viewer.classList.toggle('is-transforming', transformDragging);

  if (!transformDragging && accessoryTransformDirty) {
    const item = selectedAccessoryItem(activeEditCategory);
    const object = equippedAccessories?.[activeEditCategory];
    if (item && object) saveAccessoryTransform(activeEditCategory, item, object, { persist: true });
    accessoryTransformDirty = false;
  }
});

accessoryTransformControls.addEventListener('objectChange', () => {
  if (!accessoryEditEnabled || !game.wardrobeActive) return;
  const item = selectedAccessoryItem(activeEditCategory);
  const object = equippedAccessories?.[activeEditCategory];
  if (item && object) {
    saveAccessoryTransform(activeEditCategory, item, object, { persist: false });
    accessoryTransformDirty = true;
  }
});

const clock = new THREE.Clock();
const tmpVec = new THREE.Vector3();
const tmpQuat = new THREE.Quaternion();
const tmpEuler = new THREE.Euler();
let modelRoot = null;
let mixer = null;
let blinkAction = null;
let talkAction = null;
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
  if (event.button !== 0 || !modelRoot || accessoryEditEnabled || transformDragging) return;
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
  if (accessoryEditEnabled || transformDragging) return;
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

window.addEventListener('keydown', (event) => {
  if (!accessoryEditEnabled || !game.wardrobeActive) return;
  if (event.target?.matches?.('input, textarea, select')) return;
  const key = event.key.toLowerCase();
  const mode = key === 'w' ? 'translate' : key === 'e' ? 'rotate' : key === 'r' ? 'scale' : null;
  if (!mode) return;
  activeTransformMode = mode;
  accessoryTransformControls?.setMode(mode);
  accessoryTransformControls?.setSpace(mode === 'translate' ? 'world' : 'local');
  updateEditTargetUI();
  event.preventDefault();
});

const loader = new GLTFLoader();
const accessoryLoader = new GLTFLoader();
const accessoryCache = new Map();
const equippedAccessories = { hat: null, glasses: null, shirt: null };
let outfitApplyToken = 0;
let finalAudio = null;

const builtInAccessoryNames = ['bone_azul', 'sutia_azul_renda', 'oculos_tartaruga_marrom'];

const hairNodesHiddenByHat = Array.isArray(config.accessoryOcclusion?.hatHideNodes)
  ? config.accessoryOcclusion.hatHideNodes
  : ['tripo_part_1', 'tripo_part_8', 'tripo_part_10'];
const braBodyNodes = Array.isArray(config.accessoryOcclusion?.shirtBodyNodes)
  ? config.accessoryOcclusion.shirtBodyNodes
  : ['tripo_part_0', 'tripo_part_21'];
const hatHideHairIds = new Set(
  Array.isArray(config.accessoryOcclusion?.hatHideHairIds)
    ? config.accessoryOcclusion.hatHideHairIds
    : ['bone_azul', 'bone_preto', 'bucket_vermelho', 'gorro_cinza'],
);
const originalHairVisibility = new Map();

function setHatHairOcclusion() {
  // A cabeça/cabelo do personagem deve permanecer exatamente como no GLB original.
  // A antiga barreira de acessórios escondia partes reais do modelo e foi desativada.
  if (!modelRoot) return;
  hairNodesHiddenByHat.forEach((name) => {
    const object = modelRoot.getObjectByName(name);
    if (!object) return;
    if (!originalHairVisibility.has(name)) originalHairVisibility.set(name, object.visible);
    object.visible = originalHairVisibility.get(name);
  });
}

function applyStencilExclusionToObject(object, stencilRef, stencilMask) {
  if (!object?.isMesh) return;
  const source = Array.isArray(object.material) ? object.material : [object.material];
  const prepared = source.map((material) => {
    if (!material) return material;
    const clone = material.clone();
    clone.stencilWrite = true;
    clone.stencilRef = stencilRef;
    clone.stencilFunc = THREE.NotEqualStencilFunc;
    clone.stencilFuncMask = stencilMask;
    clone.stencilWriteMask = 0x00;
    clone.stencilFail = THREE.KeepStencilOp;
    clone.stencilZFail = THREE.KeepStencilOp;
    clone.stencilZPass = THREE.KeepStencilOp;
    clone.needsUpdate = true;
    return clone;
  });
  object.material = Array.isArray(object.material) ? prepared : prepared[0];
}

function prepareBodyStencilForBarriers() {
  if (!modelRoot) return;

  // Bit 1 = chapéus/bonés. Só o cabelo testa esse bit.
  for (const name of hairNodesHiddenByHat) {
    applyStencilExclusionToObject(modelRoot.getObjectByName(name), 0x01, 0x01);
  }

  // Bit 2 = camisas/tops. Só torso + seios testam esse bit, então braços e
  // outras partes do corpo continuam podendo passar naturalmente na frente.
  for (const name of braBodyNodes) {
    applyStencilExclusionToObject(modelRoot.getObjectByName(name), 0x02, 0x02);
  }
}

function makeBarrierMaterial(sourceMaterial, stencilRef, stencilMask) {
  const material = new THREE.MeshBasicMaterial({
    map: sourceMaterial?.map || null,
    alphaMap: sourceMaterial?.alphaMap || null,
    alphaTest: Math.max(0.01, Number(sourceMaterial?.alphaTest) || 0),
    side: THREE.DoubleSide,
    colorWrite: false,
    depthWrite: false,
    depthTest: false,
    stencilWrite: true,
    stencilRef,
    stencilFuncMask: stencilMask,
    stencilWriteMask: stencilMask,
    stencilFunc: THREE.AlwaysStencilFunc,
    stencilFail: THREE.ReplaceStencilOp,
    stencilZFail: THREE.ReplaceStencilOp,
    stencilZPass: THREE.ReplaceStencilOp,
  });
  material.transparent = false;
  material.toneMapped = false;
  return material;
}

function prepareAccessoryAntiClipping(instance, category) {
  if (!instance) return;
  const barrierEnabled = config.accessoryOcclusion?.enabled !== false
    && ['hat', 'shirt'].includes(category);
  const stencilRef = category === 'hat' ? 0x01 : 0x02;
  const stencilMask = stencilRef;

  const meshes = [];
  instance.traverse((object) => {
    if (object.isMesh && !object.userData?.isAccessoryBarrier) meshes.push(object);
  });

  for (const mesh of meshes) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const visibleMaterials = materials.map((material) => {
      if (!material) return material;
      const clone = material.clone();
      clone.polygonOffset = true;
      clone.polygonOffsetFactor = category === 'shirt' ? -3.5 : -2.0;
      clone.polygonOffsetUnits = category === 'shirt' ? -5.0 : -3.0;
      clone.needsUpdate = true;
      return clone;
    });
    mesh.material = Array.isArray(mesh.material) ? visibleMaterials : visibleMaterials[0];
    mesh.renderOrder = 20;

    if (!barrierEnabled) continue;
    const sourceMaterial = visibleMaterials[0];
    const barrier = new THREE.Mesh(
      mesh.geometry,
      makeBarrierMaterial(sourceMaterial, stencilRef, stencilMask),
    );
    barrier.name = `Barrier.${category}.${mesh.name || 'mesh'}`;
    barrier.userData.isAccessoryBarrier = true;
    barrier.renderOrder = -100;
    barrier.frustumCulled = false;
    mesh.add(barrier);
  }
}

function hideReferenceAccessories() {
  if (!modelRoot) return;
  builtInAccessoryNames.forEach((name) => {
    const obj = modelRoot.getObjectByName(name);
    if (obj) obj.visible = false;
  });
}

function accessoryCategoryLabel(category) {
  if (category === 'hat') return 'o acessório da cabeça';
  if (category === 'glasses') return 'os óculos';
  if (category === 'shirt') return 'a camisa';
  return 'um acessório';
}

function removeOneAccessory(player) {
  if (!player) return '';
  if (!Array.isArray(player.removedAccessories)) player.removedAccessories = [];
  const order = Array.isArray(config.accessoryRemovalOrder) && config.accessoryRemovalOrder.length
    ? config.accessoryRemovalOrder
    : ['glasses', 'hat', 'shirt'];
  const category = order.find((key) => !player.removedAccessories.includes(key));
  if (!category) return '';
  player.removedAccessories.push(category);
  return accessoryCategoryLabel(category);
}

function removeEquippedAccessory(category) {
  const current = equippedAccessories[category];
  if (accessoryTransformControls?.object === current) accessoryTransformControls.detach();
  if (current?.parent) current.parent.remove(current);
  equippedAccessories[category] = null;
}

function removeAllEquippedAccessories() {
  for (const category of Object.keys(equippedAccessories)) removeEquippedAccessory(category);
}

function loadAccessoryTemplate(path) {
  if (!path) return Promise.resolve(null);
  if (!accessoryCache.has(path)) {
    const url = new URL(path, window.location.href).href;
    accessoryCache.set(path, new Promise((resolve, reject) => {
      accessoryLoader.load(url, (gltf) => {
        gltf.scene.traverse((obj) => {
          if (obj.isMesh) {
            obj.frustumCulled = false;
            obj.castShadow = false;
            obj.receiveShadow = false;
          }
        });
        resolve(gltf.scene);
      }, undefined, reject);
    }));
  }
  return accessoryCache.get(path);
}

async function equipAccessory(category, item, token) {
  removeEquippedAccessory(category);
  if (!modelRoot || !item) return;
  try {
    const template = await loadAccessoryTemplate(item.path);
    if (!template || token !== outfitApplyToken || !modelRoot) return;
    const instance = wrapObjectWithGeometryOrigin(template);
    instance.name = `Accessory.${category}.${item.id || 'item'}`;
    applyBaseOrSavedAccessoryTransform(instance, category, item);
    modelRoot.add(instance);
    equippedAccessories[category] = instance;

    if (accessoryEditEnabled && game.wardrobeActive && activeEditCategory === category) {
      attachTransformToActiveAccessory();
    }
  } catch (error) {
    console.error(`[acessório] falha ao carregar ${category}:`, item.path, error);
  }
}

function applyPlayerOutfit(player) {
  if (!player || game.finale) return;
  const desiredUrl = desiredCharacterUrl(player);
  if (!modelRoot || currentCharacterUrl !== desiredUrl) {
    loadCharacterForPlayer(player);
    return;
  }
  const token = ++outfitApplyToken;
  const removed = new Set(Array.isArray(player.removedAccessories) ? player.removedAccessories : []);
  const hatList = accessoryList('hat');
  const hatIndex = clamp(Number(player.outfit?.hat) || 0, 0, Math.max(0, hatList.length - 1));
  const activeHat = removed.has('hat') ? null : hatList[hatIndex];
  setHatHairOcclusion(Boolean(activeHat && hatHideHairIds.has(activeHat.id)));

  for (const category of ['hat', 'glasses', 'shirt']) {
    const list = accessoryList(category);
    const index = clamp(Number(player.outfit?.[category]) || 0, 0, Math.max(0, list.length - 1));
    const item = removed.has(category) ? null : list[index];
    equipAccessory(category, item, token);
  }
  updateEditTargetUI();
}

function startFinale({ remote = false } = {}) {
  if (game.finale) return;
  game.finale = true;
  game.phase = 'finale';
  if (multiplayer.active && !remote) pushMultiplayerSnapshot('finale');
  setAccessoryEditing(false);
  game.wardrobeActive = false;
  clearTimeout(blinkTimer);
  removeAllEquippedAccessories();
  setHatHairOcclusion(false);
  hideReferenceAccessories();

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audioOrbButton?.classList.remove('is-playing');
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
    if (talkAction) talkAction.reset().play();
    finalAudio.play().catch((error) => {
      console.warn('Áudio final aguardando gesto do usuário:', error);
    });
    finalAudio.addEventListener('ended', () => talkAction?.stop(), { once: true });
  }
}
let currentCharacterUrl = '';
let characterLoadToken = 0;

function desiredCharacterUrl(player = currentPlayer()) {
  const character = characterForPlayer(player);
  return new URL(character?.path || config.modelPath || './assets/model/lucas.glb', window.location.href).href;
}

function loadCharacterForPlayer(player = currentPlayer()) {
  const modelUrl = desiredCharacterUrl(player);
  const token = ++characterLoadToken;
  currentCharacterUrl = modelUrl;
  clearTimeout(blinkTimer);
  removeAllEquippedAccessories();
  setHatHairOcclusion(false);
  if (modelRoot) {
    scene.remove(modelRoot);
    modelRoot = null;
  }
  mixer = null;
  blinkAction = null;
  talkAction = null;
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

      hideReferenceAccessories();
      const bodyRoot = normalizeModelPlacement() || (modelRoot.getObjectByName('ROOT') || modelRoot);
      fitCamera(bodyRoot);
      setupAnimations(gltf);
      setupBreasts();
      resizeViewer();
      scheduleBlink();
      const previewPlayer = game.wardrobeActive ? game.players[game.wardrobePlayerIndex] : currentPlayer();
      applyPlayerOutfit(previewPlayer);
      if (loadingOverlay) loadingOverlay.classList.add('is-hidden');
      viewerHint.textContent = game.wardrobeActive
        ? `${previewPlayer?.name?.toUpperCase() || 'JOGADOR'} • ESCOLHA O LOOK`
        : 'GIRE O PERSONAGEM PARA VER MELHOR';
    },
    (progress) => {
      if (!loadingText || !progress.total) return;
      loadingText.textContent = `Carregando ${characterForPlayer(player)?.label || 'personagem'}… ${Math.round(progress.loaded / progress.total * 100)}%`;
    },
    (error) => {
      console.error('Falha ao carregar o modelo:', modelUrl, error);
      if (loadingText) loadingText.textContent = 'Falha ao carregar o personagem.';
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
  setToast('SOUOLUCAS • RODADA GANHA', 'good');
  solvePuzzleSuccess();
}

// Secret code works even while an input has focus.
window.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (/^[a-zA-Z]$/.test(event.key)) {
    cheatBuffer = (cheatBuffer + event.key.toLowerCase()).slice(-24);
    if (cheatBuffer.endsWith('souolucas')) {
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
