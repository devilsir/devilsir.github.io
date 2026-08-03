const SOUND_PATHS = {
  click: 'assets/audio/click.wav',
  positive: 'assets/audio/positive.wav',
  feed: 'assets/audio/feed.wav',
  crunch: 'assets/audio/crunch.wav',
  treat: 'assets/audio/treat.wav',
  water: 'assets/audio/water.wav',
  clean: 'assets/audio/clean.wav',
  toy: 'assets/audio/toy.wav',
  jump: 'assets/audio/jump.wav',
  land: 'assets/audio/land.wav',
  sleep: 'assets/audio/sleep.wav',
  medicine: 'assets/audio/medicine.wav',
  'voice-apollo-call': 'assets/audio/voices/voice-apollo-call.wav',
  'voice-apollo-happy': 'assets/audio/voices/voice-apollo-happy.wav',
  'voice-apollo-calm': 'assets/audio/voices/voice-apollo-calm.wav',
  'voice-lilith-call': 'assets/audio/voices/voice-lilith-call.wav',
  'voice-lilith-happy': 'assets/audio/voices/voice-lilith-happy.wav',
  'voice-lilith-calm': 'assets/audio/voices/voice-lilith-calm.wav',
  'voice-pietro-call': 'assets/audio/voices/voice-pietro-call.wav',
  'voice-pietro-happy': 'assets/audio/voices/voice-pietro-happy.wav',
  'voice-pietro-calm': 'assets/audio/voices/voice-pietro-calm.wav',
  'voice-bolt-call': 'assets/audio/voices/voice-bolt-call.wav',
  'voice-bolt-happy': 'assets/audio/voices/voice-bolt-happy.wav',
  'voice-bolt-calm': 'assets/audio/voices/voice-bolt-calm.wav',
  'voice-chica-call': 'assets/audio/voices/voice-chica-call.wav',
  'voice-chica-happy': 'assets/audio/voices/voice-chica-happy.wav',
  'voice-chica-calm': 'assets/audio/voices/voice-chica-calm.wav',
  'voice-kate-call': 'assets/audio/voices/voice-kate-call.wav',
  'voice-kate-happy': 'assets/audio/voices/voice-kate-happy.wav',
  'voice-kate-calm': 'assets/audio/voices/voice-kate-calm.wav',
  'voice-caramelo-call': 'assets/audio/voices/voice-caramelo-call.wav',
  'voice-caramelo-happy': 'assets/audio/voices/voice-caramelo-happy.wav',
  'voice-caramelo-calm': 'assets/audio/voices/voice-caramelo-calm.wav',
  'voice-kiara-call': 'assets/audio/voices/voice-kiara-call.wav',
  'voice-kiara-happy': 'assets/audio/voices/voice-kiara-happy.wav',
  'voice-kiara-calm': 'assets/audio/voices/voice-kiara-calm.wav',
  'voice-pacoca-call': 'assets/audio/voices/voice-pacoca-call.wav',
  'voice-pacoca-happy': 'assets/audio/voices/voice-pacoca-happy.wav',
  'voice-pacoca-calm': 'assets/audio/voices/voice-pacoca-calm.wav',
  'voice-simba-call': 'assets/audio/voices/voice-simba-call.wav',
  'voice-simba-happy': 'assets/audio/voices/voice-simba-happy.wav',
  'voice-simba-calm': 'assets/audio/voices/voice-simba-calm.wav',
  'ambient-room': 'assets/audio/ambient-room.wav',
  'ambient-garden': 'assets/audio/ambient-garden.wav',
  'ambient-night': 'assets/audio/ambient-night.wav',
  'music-home': 'assets/audio/music-home.wav'
};

export class AudioSystem {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.context = null;
    this.master = null;
    this.effects = null;
    this.ambient = null;
    this.music = null;
    this.buffers = new Map();
    this.ambientSource = null;
    this.musicSource = null;
    this.currentMusic = null;
    this.currentAmbient = null;
    this.desiredMusic = null;
    this.desiredAmbient = null;
    this.unlocked = false;
    this.unlockPromise = null;
    this.gestureTarget = null;
    this.gestureHandler = null;
    this.musicRequestId = 0;
    this.ambientRequestId = 0;
  }

  bindGestureUnlock(target = document) {
    if (!target?.addEventListener || this.gestureHandler) return;
    this.gestureTarget = target;
    this.gestureHandler = () => { void this.unlock({ fromGesture: true }); };
    target.addEventListener('pointerdown', this.gestureHandler, { capture: true, passive: true });
    target.addEventListener('touchstart', this.gestureHandler, { capture: true, passive: true });
    target.addEventListener('keydown', this.gestureHandler, { capture: true });
  }

  unbindGestureUnlock() {
    if (!this.gestureTarget || !this.gestureHandler) return;
    this.gestureTarget.removeEventListener('pointerdown', this.gestureHandler, true);
    this.gestureTarget.removeEventListener('touchstart', this.gestureHandler, true);
    this.gestureTarget.removeEventListener('keydown', this.gestureHandler, true);
    this.gestureTarget = null;
    this.gestureHandler = null;
  }

  canUnlockNow(fromGesture = false) {
    if (fromGesture) return true;
    const activation = typeof navigator !== 'undefined' ? navigator.userActivation : null;
    return Boolean(activation?.isActive || this.context?.state === 'running');
  }

  createGraph() {
    if (this.context) return true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.effects = this.context.createGain();
    this.ambient = this.context.createGain();
    this.music = this.context.createGain();
    this.effects.connect(this.master);
    this.ambient.connect(this.master);
    this.music.connect(this.master);
    this.master.connect(this.context.destination);
    this.applyVolumes();
    return true;
  }

  async unlock({ fromGesture = false } = {}) {
    if (this.context?.state === 'running') {
      this.unlocked = true;
      this.unbindGestureUnlock();
      return true;
    }
    if (!this.canUnlockNow(fromGesture)) return false;
    if (this.unlockPromise) return this.unlockPromise;

    this.unlockPromise = (async () => {
      if (!this.createGraph()) return false;
      try {
        if (this.context.state === 'suspended') await this.context.resume();
      } catch {
        return false;
      }
      this.unlocked = this.context.state === 'running';
      if (!this.unlocked) return false;
      this.applyVolumes();
      this.unbindGestureUnlock();
      void this.flushPendingTracks();
      return true;
    })().finally(() => { this.unlockPromise = null; });

    return this.unlockPromise;
  }

  applyVolumes() {
    if (!this.context || !this.master || !this.effects || !this.ambient || !this.music) return;
    const settings = this.getSettings();
    const mute = settings.muted ? 0 : 1;
    const master = Math.max(0, Math.min(1, settings.masterVolume ?? 1)) * mute;
    this.master.gain.setTargetAtTime(master, this.context.currentTime, 0.02);
    this.effects.gain.setTargetAtTime(Math.max(0, Math.min(1, settings.effectsVolume ?? 1)), this.context.currentTime, 0.02);
    this.ambient.gain.setTargetAtTime(Math.max(0, Math.min(1, settings.ambientVolume ?? 1)), this.context.currentTime, 0.05);
    this.music.gain.setTargetAtTime(Math.max(0, Math.min(1, settings.musicVolume ?? 0.4)), this.context.currentTime, 0.05);
  }

  async load(name) {
    if (!this.unlocked || !this.context) return null;
    if (this.buffers.has(name)) return this.buffers.get(name);
    const path = SOUND_PATHS[name];
    if (!path) return null;
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Audio ${name} returned ${response.status}`);
      const buffer = await response.arrayBuffer();
      const decoded = await this.context.decodeAudioData(buffer.slice(0));
      this.buffers.set(name, decoded);
      return decoded;
    } catch (error) {
      console.warn('[Pocket Companions] Audio load failed:', name, error);
      return null;
    }
  }

  async play(name, options = {}) {
    if (!this.unlocked && !(await this.unlock())) return null;
    this.applyVolumes();
    const buffer = await this.load(name);
    if (!buffer || !this.context) return null;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    gain.gain.value = options.volume ?? 1;
    source.buffer = buffer;
    source.playbackRate.value = options.rate ?? 1;
    source.connect(gain);
    gain.connect(options.channel === 'ambient' ? this.ambient : this.effects);
    source.start();
    return source;
  }

  async setAmbient(name) {
    this.desiredAmbient = name || null;
    const requestId = ++this.ambientRequestId;
    if (!name || !this.unlocked || !this.context) return null;
    if (this.currentAmbient === name && this.ambientSource) return this.ambientSource;
    const buffer = await this.load(name);
    if (!buffer || !this.context || requestId !== this.ambientRequestId || this.desiredAmbient !== name) return null;
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch {}
      this.ambientSource.disconnect();
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.ambient);
    source.start();
    this.ambientSource = source;
    this.currentAmbient = name;
    return source;
  }

  async setMusic(name) {
    this.desiredMusic = name || null;
    const requestId = ++this.musicRequestId;
    if (!name || !this.unlocked || !this.context) return null;
    if (this.currentMusic === name && this.musicSource) return this.musicSource;
    const buffer = await this.load(name);
    if (!buffer || !this.context || requestId !== this.musicRequestId || this.desiredMusic !== name) return null;
    if (this.musicSource) {
      try { this.musicSource.stop(); } catch {}
      this.musicSource.disconnect();
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.music);
    source.start();
    this.musicSource = source;
    this.currentMusic = name;
    return source;
  }

  async flushPendingTracks() {
    if (!this.unlocked) return;
    const music = this.desiredMusic;
    const ambient = this.desiredAmbient;
    await Promise.all([
      music ? this.setMusic(music) : Promise.resolve(),
      ambient ? this.setAmbient(ambient) : Promise.resolve()
    ]);
  }

  stopMusic() {
    this.desiredMusic = null;
    this.musicRequestId += 1;
    if (this.musicSource) {
      try { this.musicSource.stop(); } catch {}
      this.musicSource.disconnect();
      this.musicSource = null;
    }
    this.currentMusic = null;
  }

  stopAmbient() {
    this.desiredAmbient = null;
    this.ambientRequestId += 1;
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch {}
      this.ambientSource.disconnect();
      this.ambientSource = null;
    }
    this.currentAmbient = null;
  }
}
