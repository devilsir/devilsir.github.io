'use strict';
/**
 * audio.js — Síntese sonora nativa do laboratório (efeitos táteis e trilha ambiente).
 */
const AudioEngine = (() => {
  let ctx = null;
  let sfxBus = null;
  let ambBus = null;
  let reverb = null;
  let sfxWet = null;

  let sfxEnabled = true;
  let ambientEnabled = false;
  let ambientTimer = null;
  let droneNodes = null;
  let arpStep = 0;

  const AMBIENT_NOTES = [293.66, 349.23, 440.0, 523.25, 659.25, 587.33, 440.0, 392.0];

  function syncFromState() {
    if (typeof GameState !== 'undefined') {
      const s = GameState.get().settings;
      sfxEnabled = s.sfx !== false;
      ambientEnabled = !!s.ambient;
    }
  }

  function buildImpulse(seconds = 2.2, decay = 3.2) {
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  function ensure() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      sfxBus = ctx.createGain();
      sfxBus.gain.value = sfxEnabled ? 0.56 : 0;
      sfxBus.connect(ctx.destination);

      ambBus = ctx.createGain();
      ambBus.gain.value = ambientEnabled ? 0.22 : 0;
      ambBus.connect(ctx.destination);

      reverb = ctx.createConvolver();
      reverb.buffer = buildImpulse();
      sfxWet = ctx.createGain();
      sfxWet.gain.value = 0.26;
      reverb.connect(sfxWet).connect(sfxBus);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    if (ambientEnabled && !droneNodes) startAmbientNodes();
    return ctx;
  }

  function startAmbientNodes() {
    if (!ctx || droneNodes) return;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 480;
    lp.Q.value = 0.6;
    lp.connect(ambBus);

    const freqs = [73.42, 110.0, 164.81];
    const oscs = freqs.map((f, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = idx === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      g.gain.value = idx === 0 ? 0.13 : idx === 1 ? 0.055 : 0.03;
      o.connect(g).connect(lp);
      o.start();
      return { o, g };
    });

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 160;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();

    droneNodes = { oscs, lfo, lp };

    const schedulePluck = () => {
      if (!ambientEnabled || !ctx || ctx.state !== 'running') return;
      const t0 = ctx.currentTime + 0.05;
      const freq = AMBIENT_NOTES[arpStep % AMBIENT_NOTES.length];
      arpStep += (Math.random() < 0.7 ? 1 : 2);

      const o = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t0);
      f.type = 'lowpass';
      f.frequency.setValueAtTime(1250, t0);
      f.frequency.exponentialRampToValueAtTime(340, t0 + 2.3);

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.075, t0 + 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.5);

      o.connect(f).connect(g).connect(ambBus);
      o.start(t0);
      o.stop(t0 + 2.65);
    };

    ambientTimer = setInterval(schedulePluck, 2900);
  }

  function stopAmbientNodes() {
    if (ambientTimer) { clearInterval(ambientTimer); ambientTimer = null; }
    if (droneNodes) {
      try {
        droneNodes.oscs.forEach(({ o }) => o.stop());
        droneNodes.lfo.stop();
      } catch (e) { /* ignore */ }
      droneNodes = null;
    }
  }

  function tone({ freq = 440, freqEnd = null, type = 'sine', start = 0, dur = 0.24, vol = 0.17, attack = 0.008, verb = false }) {
    if (!sfxEnabled || !ensure()) return;
    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(sfxBus);
    if (verb && reverb) g.connect(reverb);
    osc.start(t0);
    osc.stop(t0 + dur + 0.06);
  }

  function noise({ start = 0, dur = 0.16, vol = 0.08, freq = 1000, freqEnd = null, q = 1, type = 'bandpass', verb = false }) {
    if (!sfxEnabled || !ensure()) return;
    const t0 = ctx.currentTime + start;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t0);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.02, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(sfxBus);
    if (verb && reverb) g.connect(reverb);
    src.start(t0);
  }

  function bell(freq, start = 0, vol = 0.10, dur = 1.45) {
    [[1, 1], [2.76, 0.42], [5.4, 0.18]].forEach(([m, a]) => {
      tone({ freq: freq * m, start, dur: dur / Math.sqrt(m), vol: vol * a, attack: 0.004, verb: true });
    });
  }

  syncFromState();

  return {
    unlock() { syncFromState(); ensure(); },
    isSfxEnabled: () => sfxEnabled,
    isAmbientEnabled: () => ambientEnabled,
    setSfx(on) {
      sfxEnabled = !!on;
      if (typeof GameState !== 'undefined') GameState.setSetting('sfx', sfxEnabled);
      if (sfxBus && ctx) sfxBus.gain.setTargetAtTime(sfxEnabled ? 0.56 : 0, ctx.currentTime, 0.03);
      if (sfxEnabled) this.toggle(true);
    },
    setAmbient(on) {
      ambientEnabled = !!on;
      if (typeof GameState !== 'undefined') GameState.setSetting('ambient', ambientEnabled);
      if (ambientEnabled) {
        ensure();
        if (ambBus && ctx) ambBus.gain.setTargetAtTime(0.22, ctx.currentTime, 0.25);
        startAmbientNodes();
      } else {
        if (ambBus && ctx) ambBus.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        setTimeout(() => { if (!ambientEnabled) stopAmbientNodes(); }, 250);
      }
    },
    click() {
      tone({ freq: 1750, freqEnd: 980, type: 'triangle', dur: 0.038, vol: 0.075, attack: 0.002 });
      noise({ dur: 0.02, vol: 0.032, freq: 3600, type: 'highpass' });
    },
    flipClue() {
      noise({ dur: 0.13, vol: 0.085, freq: 2300, freqEnd: 880, type: 'bandpass', q: 1.2 });
      tone({ freq: 500, freqEnd: 640, type: 'sine', start: 0.02, dur: 0.07, vol: 0.045 });
    },
    select(second = false) {
      tone({ freq: second ? 740 : 622, type: 'sine', dur: 0.15, vol: 0.10, verb: true });
      tone({ freq: second ? 1109 : 932, type: 'sine', start: 0.045, dur: 0.16, vol: 0.055, verb: true });
    },
    deselect() {
      tone({ freq: 560, freqEnd: 380, type: 'sine', dur: 0.12, vol: 0.065 });
    },
    pollinate() {
      noise({ dur: 0.8, vol: 0.05, freq: 420, freqEnd: 4200, type: 'bandpass', q: 2.0, verb: true });
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        tone({ freq: f, type: 'sine', start: 0.06 + i * 0.07, dur: 0.8, vol: 0.06, verb: true });
      });
    },
    sprout(i = 0) {
      tone({ freq: 360 + i * 90, freqEnd: 560 + i * 125, type: 'sine', dur: 0.16, vol: 0.07, verb: true });
    },
    plant() {
      noise({ dur: 0.24, vol: 0.10, freq: 460, freqEnd: 165, type: 'lowpass', q: 0.7 });
      tone({ freq: 196, freqEnd: 392, type: 'sine', start: 0.04, dur: 0.26, vol: 0.11 });
    },
    discard() {
      noise({ dur: 0.18, vol: 0.065, freq: 1500, freqEnd: 210, type: 'bandpass', q: 1.4 });
      tone({ freq: 300, freqEnd: 130, type: 'sine', dur: 0.18, vol: 0.065 });
    },
    stamp(success = true) {
      tone({ freq: 135, freqEnd: 44, type: 'sine', dur: 0.16, vol: 0.24, attack: 0.002 });
      noise({ dur: 0.09, vol: 0.16, freq: 860, freqEnd: 240, type: 'lowpass' });
      if (success) {
        [587.33, 739.99, 880.0, 1174.66].forEach((f, i) => bell(f, 0.12 + i * 0.11, 0.10, 1.5));
      } else {
        tone({ freq: 261.63, freqEnd: 220.0, type: 'triangle', start: 0.12, dur: 0.34, vol: 0.10, verb: true });
        tone({ freq: 196.0, freqEnd: 174.61, type: 'triangle', start: 0.24, dur: 0.36, vol: 0.09, verb: true });
      }
    },
    toggle(on) {
      tone({ freq: on ? 840 : 620, type: 'sine', dur: 0.08, vol: 0.08 });
      tone({ freq: on ? 1240 : 420, type: 'sine', start: 0.06, dur: 0.10, vol: 0.07 });
    },
    error() {
      tone({ freq: 230, freqEnd: 190, type: 'triangle', dur: 0.15, vol: 0.085 });
      tone({ freq: 185, freqEnd: 160, type: 'triangle', start: 0.11, dur: 0.18, vol: 0.075 });
    },
    fail() {
      [392, 349.23, 293.66].forEach((f, i) => tone({ freq: f, type: 'triangle', start: i * 0.18, dur: 0.42, vol: 0.09, verb: true }));
    },
    fanfare() {
      [587.33, 739.99, 880.0, 1174.66].forEach((f, i) => bell(f, i * 0.12, 0.10, 1.45));
      bell(1760, 0.54, 0.09, 2.0);
    },
    achievement() {
      [659.25, 830.61, 987.77, 1318.51].forEach((f, i) => bell(f, i * 0.085, 0.09, 1.25));
    },
  };
})();
