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
  'character-apollo': 'assets/audio/character-apollo.wav',
  'character-lilith': 'assets/audio/character-lilith.wav',
  'character-pietro': 'assets/audio/character-pietro.wav',
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
  }

  async unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
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
    }
    if (this.context.state === 'suspended') await this.context.resume();
  }

  applyVolumes() {
    if (!this.context) return;
    const settings = this.getSettings();
    const mute = settings.muted ? 0 : 1;
    const master = Math.max(0, Math.min(1, settings.masterVolume ?? 1)) * mute;
    this.master.gain.setTargetAtTime(master, this.context.currentTime, 0.02);
    this.effects.gain.setTargetAtTime(Math.max(0, Math.min(1, settings.effectsVolume ?? 1)), this.context.currentTime, 0.02);
    this.ambient.gain.setTargetAtTime(Math.max(0, Math.min(1, settings.ambientVolume ?? 1)), this.context.currentTime, 0.05);
    this.music.gain.setTargetAtTime(Math.max(0, Math.min(1, settings.musicVolume ?? 0.4)), this.context.currentTime, 0.05);
  }

  async load(name) {
    await this.unlock();
    if (!this.context || this.buffers.has(name)) return this.buffers.get(name);
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
    await this.unlock();
    this.applyVolumes();
    const buffer = await this.load(name);
    if (!buffer || !this.context) return;
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
    if (this.currentAmbient === name) return;
    await this.unlock();
    const buffer = await this.load(name);
    if (!buffer || !this.context) return;
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
  }


  async setMusic(name) {
    if (this.currentMusic === name) return;
    await this.unlock();
    const buffer = await this.load(name);
    if (!buffer || !this.context) return;
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
  }

  stopMusic() {
    if (this.musicSource) {
      try { this.musicSource.stop(); } catch {}
      this.musicSource.disconnect();
      this.musicSource = null;
      this.currentMusic = null;
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch {}
      this.ambientSource.disconnect();
      this.ambientSource = null;
      this.currentAmbient = null;
    }
  }
}
