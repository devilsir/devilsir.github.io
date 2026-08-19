(function () {
  'use strict';
  class LexiconAudioEngine {
    constructor() { this.ctx = null; this.musicTimer = null; this.musicStep = 0; this.enabled = true; }
    ensure() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx?.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    volume(channel) { return Number(window.LexiconStorage?.state?.settings?.[channel] ?? 0.6); }
    tone(freq, duration = .08, type = 'sine', gain = .08, when = 0) {
      const ctx = this.ensure(); if (!ctx || this.volume('sfx') <= 0) return;
      const osc = ctx.createOscillator(); const amp = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime + when);
      amp.gain.setValueAtTime(0.0001, ctx.currentTime + when);
      amp.gain.exponentialRampToValueAtTime(Math.max(.0001, gain * this.volume('sfx')), ctx.currentTime + when + .008);
      amp.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + when + duration);
      osc.connect(amp).connect(ctx.destination); osc.start(ctx.currentTime + when); osc.stop(ctx.currentTime + when + duration + .02);
    }
    ui() { this.tone(440,.05,'square',.035); }
    correct() { this.tone(520,.08,'triangle',.07); this.tone(780,.12,'triangle',.06,.07); }
    incorrect() { this.tone(180,.12,'sawtooth',.045); this.tone(135,.16,'sawtooth',.035,.08); }
    combo() { [440,554,659,880].forEach((f,i)=>this.tone(f,.08,'triangle',.045,i*.045)); }
    core() { [220,330,440,660,880].forEach((f,i)=>this.tone(f,.12,'sine',.045,i*.055)); }
    checkpoint() { this.tone(300,.12,'square',.04); this.tone(600,.18,'triangle',.05,.1); }
    warning() { this.tone(110,.22,'sawtooth',.05); this.tone(110,.22,'sawtooth',.05,.3); }
    victory() { [262,330,392,523,659].forEach((f,i)=>this.tone(f,.18,'triangle',.06,i*.09)); }
    achievement() { [740,880,988].forEach((f,i)=>this.tone(f,.14,'sine',.05,i*.07)); }
    shot(charged = false) { this.tone(charged ? 150 : 300, charged ? .18 : .045, charged ? 'sawtooth':'square', charged ? .09:.035); }
    jump() { this.tone(240,.07,'square',.03); }
    dash() { this.tone(95,.09,'sawtooth',.05); }
    hit() { this.tone(75,.1,'square',.055); }
    startMusic() {
      if (this.musicTimer || this.volume('music') <= 0) return;
      const sequence = [110,165,220,147,196,247,123,185];
      this.musicTimer = setInterval(() => {
        if (document.hidden || this.volume('music') <= 0) return;
        const ctx = this.ensure(); if (!ctx) return;
        const freq = sequence[this.musicStep++ % sequence.length];
        const osc = ctx.createOscillator(); const amp = ctx.createGain();
        osc.type = 'triangle'; osc.frequency.value = freq;
        amp.gain.value = Math.max(.0001, this.volume('music') * .018);
        osc.connect(amp).connect(ctx.destination); osc.start();
        amp.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .55); osc.stop(ctx.currentTime + .58);
      }, 610);
    }
    stopMusic() { clearInterval(this.musicTimer); this.musicTimer = null; }
    speak(text, rate = 1) {
      if (!('speechSynthesis' in window) || this.volume('voice') <= 0) return false;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.lang = 'en-US'; utterance.rate = Math.max(.55, Math.min(1.15, rate)); utterance.volume = this.volume('voice');
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(v => /^en(-|_)/i.test(v.lang) && /Google|Microsoft|Samantha|Daniel/i.test(v.name)) || voices.find(v => /^en(-|_)/i.test(v.lang));
      if (preferred) utterance.voice = preferred;
      speechSynthesis.speak(utterance); return true;
    }
  }
  window.LexiconAudio = new LexiconAudioEngine();
})();
