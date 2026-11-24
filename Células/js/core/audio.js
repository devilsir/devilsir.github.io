class LabAudio {
  muted = true;
  context = null;
  noiseBuffer = null;
  lastDial = 0;

  setMuted(value) {
    this.muted = value;
    if (!value) this.play('click');
  }

  ensureContext() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (this.muted || !Context) return null;
    this.context ||= new Context();
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    if (!this.noiseBuffer) {
      const len = Math.floor(this.context.sampleRate * 0.25);
      const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
    }
    return this.context;
  }

  tone(ctx, now, from, to, duration, type, peak, attack = 0.006) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + duration);
    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  burst(ctx, now, freq, q, duration, peak, endFreq = freq) {
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, now);
    if (endFreq !== freq) filter.frequency.exponentialRampToValueAtTime(Math.max(60, endFreq), now + duration);
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0008, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + Math.min(0.008, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.01);
    src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  play(name) {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (name === 'click') {
        // Ultra-subtle tactile UI soft tap
        this.tone(ctx, now, 520, 290, 0.042, 'sine', 0.032, 0.004);
        this.burst(ctx, now, 2400, 3.2, 0.018, 0.014);
      } else if (name === 'lens') {
        // Crisp precision mechanical turret detent click-clack
        this.burst(ctx, now, 2300, 4.0, 0.028, 0.048);
        this.tone(ctx, now, 185, 76, 0.068, 'triangle', 0.055, 0.003);
        this.burst(ctx, now + 0.034, 3100, 5.5, 0.022, 0.034);
      } else if (name === 'dial') {
        // Micro-ratchet knob tick (throttled so smooth dragging feels crisp)
        if (now - this.lastDial < 0.045) return;
        this.lastDial = now;
        this.burst(ctx, now, 3400, 5.0, 0.014, 0.02);
        this.tone(ctx, now, 680, 410, 0.02, 'sine', 0.016, 0.002);
      } else if (name === 'slice') {
        // Crisp microtome steel shear through paraffin
        this.burst(ctx, now, 2600, 2.4, 0.14, 0.04, 720);
        this.tone(ctx, now + 0.02, 240, 120, 0.09, 'triangle', 0.028, 0.006);
      } else if (name === 'atp') {
        // Soft, deep organic harmonic pulse for ATP synthesis
        this.tone(ctx, now, 218, 262, 0.2, 'sine', 0.022, 0.035);
        this.tone(ctx, now + 0.015, 327, 392, 0.17, 'sine', 0.012, 0.03);
      } else if (name === 'glass') {
        // Delicate borosilicate glass chime
        this.tone(ctx, now, 1760, 1710, 0.11, 'sine', 0.026, 0.004);
        this.tone(ctx, now, 2640, 2580, 0.08, 'sine', 0.014, 0.004);
      } else if (name === 'mutate') {
        // Molecular edit confirmation pulse
        this.tone(ctx, now, 440, 588, 0.095, 'sine', 0.032, 0.008);
        this.tone(ctx, now + 0.045, 660, 740, 0.09, 'triangle', 0.018, 0.008);
      } else if (name === 'alert') {
        // Calm clinical two-step caution chime
        this.tone(ctx, now, 310, 275, 0.11, 'triangle', 0.046, 0.006);
        this.tone(ctx, now + 0.1, 245, 196, 0.15, 'triangle', 0.044, 0.008);
      }
    } catch {}
  }
}

export const audio = new LabAudio();
