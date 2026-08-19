export class AudioEngine {
  constructor(getSettings) {
    this.getSettings = getSettings;
    this.context = null;
    this.master = null;
    this.music = null;
    this.fx = null;
    this.ambientNodes = [];
  }

  unlock() {
    if (!this.context) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.context = new AudioCtx();
      this.master = this.context.createGain();
      this.music = this.context.createGain();
      this.fx = this.context.createGain();
      this.music.connect(this.master);
      this.fx.connect(this.master);
      this.master.connect(this.context.destination);
      this.updateVolumes();
    }
    if (this.context.state === "suspended") this.context.resume().catch(() => {});
  }

  updateVolumes() {
    if (!this.context) return;
    const settings = this.getSettings();
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(settings.masterVolume ?? .7, now, .02);
    this.music.gain.setTargetAtTime(settings.musicVolume ?? .4, now, .02);
    this.fx.gain.setTargetAtTime(settings.effectsVolume ?? .75, now, .02);
  }

  tone(frequency=440, duration=.09, type="square", volume=.08, destination="fx", slide=0) {
    this.unlock();
    if (!this.context) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30,frequency + slide), now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume), now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    osc.connect(gain);
    gain.connect(destination === "music" ? this.music : this.fx);
    osc.start(now);
    osc.stop(now + duration + .03);
  }

  noise(duration=.12, volume=.04) {
    this.unlock();
    if (!this.context) return;
    const length = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1,length,this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<length;i++) data[i] = (Math.random()*2-1) * (1-i/length);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 1300;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.fx);
    source.start();
  }

  ui() { this.tone(520,.045,"square",.045, "fx", 110); }
  confirm() { this.tone(520,.08,"triangle",.06,"fx",240); setTimeout(()=>this.tone(780,.09,"triangle",.05),55); }
  cancel() { this.tone(330,.075,"sawtooth",.045,"fx",-110); }
  hit(heavy=false) { this.noise(heavy ? .2 : .12, heavy ? .1 : .06); this.tone(heavy ? 92 : 140,heavy ? .18 : .1,"square",.08,"fx",-45); }
  spell(element="Fratura") {
    const map = {Fogo:220,Gelo:780,Água:510,Vida:660,Morte:160,Sangue:190,Terra:110,Ordem:880,Dominação:145,Fratura:320,Invocação:410};
    this.tone(map[element] || 360,.32,"sine",.07,"fx", element === "Morte" ? -90 : 320);
  }
  heal() { [440,554,660].forEach((f,i)=>setTimeout(()=>this.tone(f,.2,"sine",.05),i*65)); }
  transform() { this.noise(.45,.035); this.tone(120,.55,"sawtooth",.07,"fx",760); }
  victory() { [392,494,587,784].forEach((f,i)=>setTimeout(()=>this.tone(f,.28,"triangle",.06),i*105)); }
  bossPhase() { this.noise(.5,.08); this.tone(65,.65,"sawtooth",.1,"fx",-20); }
  portal() { this.tone(96,.72,"sine",.065,"fx",420);this.noise(.32,.025); }
  reward() { [294,440,587].forEach((frequency,index)=>setTimeout(()=>this.tone(frequency,.22,"triangle",.045,"fx",90),index*70)); }
  towerPulse(strong=false) { this.tone(strong ? 48 : 58,strong ? .52 : .34,"sine",strong ? .09 : .055,"fx",-8);if(strong)this.noise(.24,.045); }
  towerDeath() { this.noise(.65,.07);this.tone(92,.9,"sawtooth",.075,"fx",-58); }

  startAmbient(regionIndex=0) {
    this.stopAmbient();
    this.unlock();
    if (!this.context) return;
    const roots = [73,98,82,65,110,123,147,92,55,104];
    const root = roots[regionIndex] || 82;
    const now = this.context.currentTime;
    [1,1.5,2].forEach((ratio,index) => {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      const lfo = this.context.createOscillator();
      const lfoGain = this.context.createGain();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.value = root * ratio;
      gain.gain.value = index === 0 ? .025 : .009;
      lfo.frequency.value = .07 + index * .03;
      lfoGain.gain.value = index === 0 ? 3 : 5;
      lfo.connect(lfoGain); lfoGain.connect(osc.detune);
      osc.connect(gain); gain.connect(this.music);
      osc.start(now); lfo.start(now);
      this.ambientNodes.push(osc,lfo,gain,lfoGain);
    });
  }

  startTowerAmbient(familyIndex=0,floor=1,boss=false) {
    this.startAmbient(familyIndex);
    if(!this.context)return;const current=this.context.currentTime,osc=this.context.createOscillator(),gain=this.context.createGain(),pulse=this.context.createOscillator(),pulseGain=this.context.createGain();osc.type="sine";osc.frequency.value=boss?43:49+(familyIndex%4)*4;gain.gain.value=boss ? .022 : .012;pulse.type="sine";pulse.frequency.value=boss?1.35:.72+Math.min(.35,floor*.003);pulseGain.gain.value=boss ? .014 : .007;pulse.connect(pulseGain);pulseGain.connect(gain.gain);osc.connect(gain);gain.connect(this.music);osc.start(current);pulse.start(current);this.ambientNodes.push(osc,gain,pulse,pulseGain);
  }

  stopAmbient() {
    this.ambientNodes.forEach((node) => { try { if (typeof node.stop === "function") node.stop(); else node.disconnect(); } catch {} });
    this.ambientNodes = [];
  }
}
