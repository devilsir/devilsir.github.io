(function () {
  'use strict';
  const KEY = 'lexicon-aegis-v1';
  const defaults = {
    profiles: [],
    activeProfileId: null,
    settings: {
      music: 0.26,
      sfx: 0.7,
      voice: 0.85,
      ui: 0.65,
      highContrast: false,
      reducedMotion: false,
      screenShake: true,
      largeText: false,
      dyslexia: false,
      gameSpeed: 1,
      challengeTime: 0,
      ptSupport: true,
      subtitles: true,
      leftHanded: false,
      controlOpacity: 0.78,
      touchControls: true,
      keymap: { left: 'ArrowLeft', right: 'ArrowRight', jump: 'Space', dash: 'ShiftLeft', fire: 'KeyJ', interact: 'KeyE', pause: 'Escape' }
    },
    teacher: {
      year: 6,
      topic: 'all',
      difficulty: 'guided',
      supportLevel: 2,
      sessionLength: 10,
      timers: false,
      combat: true,
      bosses: true,
      ptSupport: true,
      mode: 'practice',
      projector: false
    },
    sessions: [],
    customQuestions: []
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function merge(base, incoming) {
    if (!incoming || typeof incoming !== 'object') return clone(base);
    const result = clone(base);
    Object.keys(incoming).forEach(key => {
      if (incoming[key] && typeof incoming[key] === 'object' && !Array.isArray(incoming[key]) && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
        result[key] = merge(base[key], incoming[key]);
      } else result[key] = incoming[key];
    });
    return result;
  }
  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      return merge(defaults, parsed || {});
    } catch (error) {
      console.warn('Lexicon save was unreadable; a clean local save was loaded.', error);
      return clone(defaults);
    }
  }
  let state = load();
  let writeTimer = null;
  function save(immediate) {
    clearTimeout(writeTimer);
    const write = () => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (error) { console.warn('Local progress could not be saved.', error); }
    };
    if (immediate) write(); else writeTimer = setTimeout(write, 120);
  }
  function makeId(prefix) { return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }
  function defaultMastery(year) {
    const info = window.LexiconCurriculum.getYear(year);
    return Object.fromEntries(info.topics.map(t => [t.id, { correct: 0, attempts: 0, hints: 0, streak: 0, formats: [], bossWins: 0, recent: [], state: 'Starting', percent: 0 }]));
  }
  function createProfile(input) {
    const profile = {
      id: makeId('student'),
      name: String(input.name || 'Explorer').trim().slice(0, 24) || 'Explorer',
      year: Number(input.year) || 6,
      supportLevel: Number(input.supportLevel) || 2,
      avatar: input.avatar || 'nova',
      currentCampaign: null,
      completedMissions: [],
      languageCores: {},
      mastery: defaultMastery(Number(input.year) || 6),
      bestRanks: {},
      playTime: 0,
      achievements: [],
      createdAt: new Date().toISOString(),
      lastPlayedAt: new Date().toISOString()
    };
    state.profiles.push(profile);
    state.activeProfileId = profile.id;
    save(true);
    return profile;
  }
  function activeProfile() { return state.profiles.find(p => p.id === state.activeProfileId) || null; }
  function updateProfile(id, patch) {
    const index = state.profiles.findIndex(p => p.id === id);
    if (index < 0) return null;
    state.profiles[index] = Object.assign({}, state.profiles[index], patch, { lastPlayedAt: new Date().toISOString() });
    save();
    return state.profiles[index];
  }
  function deleteProfile(id) {
    state.profiles = state.profiles.filter(p => p.id !== id);
    if (state.activeProfileId === id) state.activeProfileId = state.profiles[0]?.id || null;
    save(true);
  }
  function setActiveProfile(id) {
    if (state.profiles.some(p => p.id === id)) { state.activeProfileId = id; save(true); }
  }
  function setSettings(patch) { state.settings = merge(state.settings, patch); save(); return state.settings; }
  function setTeacher(patch) { state.teacher = merge(state.teacher, patch); save(); return state.teacher; }
  function addSession(session) {
    state.sessions.unshift(Object.assign({ id: makeId('session'), date: new Date().toISOString() }, session));
    state.sessions = state.sessions.slice(0, 250);
    save();
  }
  function exportData() { return JSON.stringify(state, null, 2); }
  function resetProfileProgress(id) {
    const p = state.profiles.find(item => item.id === id); if (!p) return;
    Object.assign(p, { currentCampaign: null, completedMissions: [], languageCores: {}, mastery: defaultMastery(p.year), bestRanks: {}, playTime: 0, achievements: [] });
    save(true);
  }
  function clearClassroomData() { state = clone(defaults); save(true); }

  window.LexiconStorage = { get state() { return state; }, save, createProfile, activeProfile, updateProfile, deleteProfile, setActiveProfile, setSettings, setTeacher, addSession, exportData, resetProfileProgress, clearClassroomData, makeId };
})();
