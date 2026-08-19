import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { GameSettings } from "./Settings";

export type AudioBus = "effects" | "music" | "dialogue";

interface SpatialLoop {
  source: AudioBufferSourceNode;
  gain: GainNode;
  panner: PannerNode;
}

export class AudioManager {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private effects: GainNode | null = null;
  private music: GainNode | null = null;
  private dialogue: GainNode | null = null;
  private settings: GameSettings;
  private readonly loops = new Map<string, AudioNode[]>();
  private readonly spatialLoops = new Map<string, SpatialLoop>();
  private readonly timers = new Map<string, number>();

  public constructor(settings: GameSettings) {
    this.settings = settings;
  }

  public get unlocked(): boolean {
    return this.context?.state === "running";
  }

  public async unlock(): Promise<void> {
    const context = this.ensureContext();
    if (context.state !== "suspended") return;
    try {
      await context.resume();
    } catch (error) {
      console.warn("Não foi possível liberar o áudio do navegador.", error);
    }
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    if (!this.context || !this.master || !this.effects || !this.music || !this.dialogue) return;
    this.master.gain.value = settings.masterVolume;
    this.effects.gain.value = settings.effectsVolume;
    this.music.gain.value = settings.musicVolume;
    this.dialogue.gain.value = settings.dialogueVolume;
  }

  public startProjector(): void {
    const context = this.ensureContext();
    if (this.loops.has("projector")) return;
    const output = this.bus("effects");
    const noise = context.createBufferSource();
    noise.buffer = this.noiseBuffer(2.4, 0.25);
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;
    const gain = context.createGain();
    gain.gain.value = 0.13;
    noise.connect(filter).connect(gain).connect(output);
    noise.start();

    const motor = context.createOscillator();
    motor.type = "sawtooth";
    motor.frequency.value = 24;
    const motorGain = context.createGain();
    motorGain.gain.value = 0.035;
    motor.connect(motorGain).connect(output);
    motor.start();
    this.loops.set("projector", [noise, motor, gain, motorGain]);
  }

  public startRain(): void {
    const context = this.ensureContext();
    if (this.loops.has("rain")) return;
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(4, 0.38);
    source.loop = true;
    const high = context.createBiquadFilter();
    high.type = "highpass";
    high.frequency.value = 900;
    const low = context.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.value = 6500;
    const gain = context.createGain();
    gain.gain.value = 0.22;
    source.connect(high).connect(low).connect(gain).connect(this.bus("effects"));
    source.start();
    this.loops.set("rain", [source, gain]);
  }

  public startInteriorHum(): void {
    const context = this.ensureContext();
    if (this.loops.has("interior")) return;
    const output = this.bus("effects");
    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 59.7;
    const harmonic = context.createOscillator();
    harmonic.type = "sine";
    harmonic.frequency.value = 119.4;
    const gain = context.createGain();
    gain.gain.value = 0.025;
    hum.connect(gain);
    harmonic.connect(gain);
    gain.connect(output);
    hum.start();
    harmonic.start();

    const buzz = context.createBufferSource();
    buzz.buffer = this.noiseBuffer(1.8, 0.15);
    buzz.loop = true;
    const band = context.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3200;
    band.Q.value = 5;
    const buzzGain = context.createGain();
    buzzGain.gain.value = 0.018;
    buzz.connect(band).connect(buzzGain).connect(output);
    buzz.start();
    this.loops.set("interior", [hum, harmonic, buzz, gain, buzzGain]);
  }

  public startHorrorDrone(): void {
    const context = this.ensureContext();
    if (this.loops.has("drone")) return;
    const output = this.bus("music");
    const oscillators: OscillatorNode[] = [];
    const gain = context.createGain();
    gain.gain.value = 0.035;
    gain.connect(output);
    [42, 56.4, 83].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 7;
      oscillator.connect(gain);
      oscillator.start();
      oscillators.push(oscillator);
    });
    this.loops.set("drone", [...oscillators, gain]);
  }

  public stopLoop(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      window.clearInterval(timer);
      this.timers.delete(id);
    }
    const nodes = this.loops.get(id);
    if (!nodes) return;
    for (const node of nodes) {
      if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
        try { node.stop(); } catch { /* already stopped */ }
      }
      node.disconnect();
    }
    this.loops.delete(id);
  }

  public stopAll(): void {
    [...this.loops.keys()].forEach((id) => this.stopLoop(id));
    for (const loop of this.spatialLoops.values()) {
      try { loop.source.stop(); } catch { /* already stopped */ }
      loop.source.disconnect();
      loop.gain.disconnect();
      loop.panner.disconnect();
    }
    this.spatialLoops.clear();
  }

  public thunder(intensity = 1): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(2.1, 0.6);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(80, context.currentTime + 1.8);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4 * intensity, context.currentTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2);
    source.connect(filter).connect(gain).connect(this.bus("effects"));
    source.start();
  }

  public impact(strength = 1): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(95, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(35, context.currentTime + 0.22);
    const noise = context.createBufferSource();
    noise.buffer = this.noiseBuffer(0.28, 0.8);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.24 * strength, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28);
    oscillator.connect(gain);
    noise.connect(gain);
    gain.connect(this.bus("effects"));
    oscillator.start();
    noise.start();
    oscillator.stop(context.currentTime + 0.3);
  }

  public uiClick(): void {
    this.beep(340, 0.045, 0.05, "square", "effects");
  }

  public objective(): void {
    this.beep(520, 0.11, 0.08, "sine", "effects");
    window.setTimeout(() => this.beep(720, 0.13, 0.06, "sine", "effects"), 90);
  }

  public pickup(): void {
    this.beep(780, 0.08, 0.06, "triangle", "effects");
    window.setTimeout(() => this.beep(1040, 0.12, 0.045, "triangle", "effects"), 70);
  }

  public plushCry(): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(90, context.currentTime + 0.55);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1300;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.11, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6);
    oscillator.connect(filter).connect(gain).connect(this.bus("effects"));
    oscillator.start();
    oscillator.stop(context.currentTime + 0.62);
  }

  public fireBurst(): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(0.7, 0.55);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.14, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.65);
    source.connect(filter).connect(gain).connect(this.bus("effects"));
    source.start();
  }

  public footstep(surface: "concrete" | "tile" | "wood"): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(0.09, 0.35);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = surface === "wood" ? 310 : surface === "tile" ? 1100 : 620;
    filter.Q.value = 0.8;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.075, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.095);
    source.connect(filter).connect(gain).connect(this.bus("effects"));
    source.start();
  }

  public playVoiceLikeLine(duration = 1.4): void {
    const context = this.ensureContext();
    const gain = context.createGain();
    gain.gain.value = 0.025;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 820;
    filter.Q.value = 0.7;
    filter.connect(gain).connect(this.bus("dialogue"));
    for (let i = 0; i < 6; i += 1) {
      const oscillator = context.createOscillator();
      oscillator.type = "sawtooth";
      oscillator.frequency.value = 110 + i * 8;
      oscillator.detune.value = (Math.random() - 0.5) * 30;
      oscillator.connect(filter);
      oscillator.start(context.currentTime + i * 0.08);
      oscillator.stop(context.currentTime + duration - i * 0.05);
    }
  }


  public startIndustrialDepths(): void {
    const context = this.ensureContext();
    if (this.loops.has("industrial-depths")) return;
    const gain = context.createGain();
    gain.gain.value = 0.028;
    gain.connect(this.bus("music"));
    const low = context.createOscillator();
    low.type = "sine";
    low.frequency.value = 31;
    const pulse = context.createOscillator();
    pulse.type = "triangle";
    pulse.frequency.value = 46.5;
    low.connect(gain);
    pulse.connect(gain);
    low.start();
    pulse.start();
    const noise = context.createBufferSource();
    noise.buffer = this.noiseBuffer(3.2, 0.16);
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 480;
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.024;
    noise.connect(filter).connect(noiseGain).connect(this.bus("effects"));
    noise.start();
    this.loops.set("industrial-depths", [low, pulse, noise, gain, noiseGain]);
  }

  public startMachineAlarm(): void {
    const context = this.ensureContext();
    if (this.loops.has("machine-alarm")) return;
    const oscillator = context.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 172;
    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 1.15;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 95;
    lfo.connect(lfoGain).connect(oscillator.frequency);
    const gain = context.createGain();
    gain.gain.value = 0.045;
    oscillator.connect(gain).connect(this.bus("effects"));
    oscillator.start();
    lfo.start();
    this.loops.set("machine-alarm", [oscillator, lfo, lfoGain, gain]);
  }

  public startMusicBoxTheme(): void {
    if (this.loops.has("music-box")) return;
    this.loops.set("music-box", []);
    const play = (): void => {
      const notes = [659.25, 783.99, 698.46, 523.25, 587.33, 493.88, 392];
      const delays = [0, 290, 580, 930, 1220, 1510, 1920];
      notes.forEach((note, index) => window.setTimeout(() => this.beep(note, 0.34, 0.035, "sine", "music"), delays[index] ?? 0));
    };
    play();
    this.timers.set("music-box", window.setInterval(play, 2700));
  }

  public stopMusicBoxTheme(): void {
    this.stopLoop("music-box");
  }

  public startJesseMelody(variant: "clean" | "distant" | "slow" | "detuned" | "reversed" | "danger", position?: Vector3): void {
    this.stopJesseMelody();
    const id = "jesse-melody";
    this.loops.set(id, []);
    const base = [659.25, 783.99, 698.46, 523.25, 587.33, 493.88, 392];
    const notes = variant === "reversed" ? [...base].reverse() : base;
    const rate = variant === "slow" ? 1.55 : variant === "danger" ? 0.58 : variant === "distant" ? 1.15 : 1;
    const detune = variant === "detuned" || variant === "danger" ? -22 : 0;
    const volume = variant === "distant" ? 0.018 : variant === "danger" ? 0.055 : 0.035;
    const play = (): void => {
      notes.forEach((note, index) => {
        window.setTimeout(() => {
          const frequency = note * Math.pow(2, detune / 1200) * (variant === "danger" && index % 2 ? 1.008 : 1);
          if (position) this.spatialTone(position, frequency, 0.28 * rate, volume, "sine");
          else this.beep(frequency, 0.28 * rate, volume, "sine", "music");
          if (variant === "danger" && index % 2 === 0) this.beep(78, 0.08, 0.025, "triangle", "effects");
        }, Math.round(index * 310 * rate));
      });
    };
    play();
    const interval = Math.max(1500, Math.round(2700 * rate));
    this.timers.set(id, window.setInterval(play, interval));
  }

  public stopJesseMelody(): void {
    this.stopLoop("jesse-melody");
  }

  public startJesseChase(): void {
    const context = this.ensureContext();
    if (this.loops.has("jesse-chase")) return;
    const output = this.bus("music");
    const pulse = context.createOscillator();
    pulse.type = "triangle";
    pulse.frequency.value = 74;
    const spring = context.createOscillator();
    spring.type = "square";
    spring.frequency.value = 148;
    const tremolo = context.createOscillator();
    tremolo.frequency.value = 5.8;
    const tremoloGain = context.createGain();
    tremoloGain.gain.value = 0.025;
    const gain = context.createGain();
    gain.gain.value = 0.038;
    tremolo.connect(tremoloGain).connect(gain.gain);
    pulse.connect(gain);
    spring.connect(gain);
    gain.connect(output);
    pulse.start();
    spring.start();
    tremolo.start();
    this.loops.set("jesse-chase", [pulse, spring, tremolo, tremoloGain, gain]);
    const percussion = (): void => {
      this.beep(92, 0.055, 0.05, "square", "effects");
      window.setTimeout(() => this.beep(62, 0.08, 0.04, "triangle", "effects"), 130);
    };
    percussion();
    this.timers.set("jesse-chase", window.setInterval(percussion, 390));
  }

  public stopJesseChase(): void {
    this.stopLoop("jesse-chase");
  }

  public playJesseFalseCue(position: Vector3): void {
    [783.99, 698.46, 523.25].forEach((note, index) => {
      window.setTimeout(() => this.spatialTone(position, note * (index === 2 ? 0.992 : 1), 0.24, 0.022, "sine"), index * 340);
    });
  }

  public playMusicNote(index: number, position?: Vector3, reversed = false): void {
    const notes = [392, 493.88, 523.25, 587.33, 659.25, 783.99];
    const safe = Math.max(0, Math.min(notes.length - 1, index));
    const frequency = notes[reversed ? notes.length - 1 - safe : safe] ?? 392;
    if (position) this.spatialTone(position, frequency, 0.42, 0.07, "sine");
    else this.beep(frequency, 0.42, 0.07, "sine", "music");
  }

  public clubSwing(charged = false): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(charged ? 0.3 : 0.18, 0.38);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = charged ? 620 : 960;
    const gain = context.createGain();
    gain.gain.setValueAtTime(charged ? 0.15 : 0.09, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (charged ? 0.3 : 0.18));
    source.connect(filter).connect(gain).connect(this.bus("effects"));
    source.start();
  }

  public clubImpact(position: Vector3, material: "metal" | "plastic" | "concrete", charged = false): void {
    const base = material === "metal" ? 225 : material === "plastic" ? 480 : 120;
    this.spatialNoiseBurst(position, charged ? 0.46 : 0.28, charged ? 0.24 : 0.15, material === "plastic" ? 2200 : 1300, "bandpass");
    this.spatialTone(position, base, charged ? 0.36 : 0.2, charged ? 0.12 : 0.07, material === "metal" ? "triangle" : "square");
  }

  public springRelease(position: Vector3): void {
    this.spatialTone(position, 58, 1.1, 0.18, "sawtooth");
    this.spatialNoiseBurst(position, 0.9, 0.23, 900, "bandpass");
  }

  public gasHiss(position: Vector3, strength = 1): void {
    this.spatialNoiseBurst(position, 1.2, 0.12 * strength, 3300, "highpass");
  }

  public generatorStart(position: Vector3): void {
    this.spatialTone(position, 42, 1.3, 0.16, "sawtooth");
    window.setTimeout(() => this.spatialTone(position, 84, 0.8, 0.08, "triangle"), 420);
  }

  public startPrisonDrone(): void {
    const context = this.ensureContext();
    if (this.loops.has("prison-drone")) return;
    const low = context.createOscillator();
    low.type = "sine";
    low.frequency.value = 36;
    const harmonic = context.createOscillator();
    harmonic.type = "triangle";
    harmonic.frequency.value = 54;
    const tremolo = context.createOscillator();
    tremolo.type = "sine";
    tremolo.frequency.value = 0.21;
    const tremoloGain = context.createGain();
    tremoloGain.gain.value = 0.012;
    const gain = context.createGain();
    gain.gain.value = 0.025;
    tremolo.connect(tremoloGain).connect(gain.gain);
    low.connect(gain);
    harmonic.connect(gain);
    gain.connect(this.bus("music"));
    low.start();
    harmonic.start();
    tremolo.start();
    const drain = context.createBufferSource();
    drain.buffer = this.noiseBuffer(2.5, 0.12);
    drain.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 340;
    const drainGain = context.createGain();
    drainGain.gain.value = 0.018;
    drain.connect(filter).connect(drainGain).connect(this.bus("effects"));
    drain.start();
    this.loops.set("prison-drone", [low, harmonic, tremolo, tremoloGain, gain, drain, filter, drainGain]);
  }

  public stopPrisonDrone(): void {
    this.stopLoop("prison-drone");
  }

  public falseVoice(variant: "call" | "cry" | "intercom" | "answer" | "identity" | "chorus", position: Vector3, intensity = 1): void {
    const context = this.ensureContext();
    const panner = context.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 1.2;
    panner.maxDistance = 55;
    panner.rolloffFactor = variant === "intercom" ? 0.55 : 1.25;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y + 1.5;
    panner.positionZ.value = position.z;
    const filter = context.createBiquadFilter();
    filter.type = variant === "intercom" ? "bandpass" : "lowpass";
    filter.frequency.value = variant === "cry" ? 980 : variant === "intercom" ? 1350 : 1850;
    filter.Q.value = variant === "intercom" ? 1.8 : 0.7;
    const gain = context.createGain();
    const duration = variant === "chorus" ? 2.8 : 1.8;
    gain.gain.setValueAtTime(0.045 * intensity, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    filter.connect(panner).connect(gain).connect(this.bus("dialogue"));
    const voices = variant === "chorus" ? 6 : variant === "identity" ? 4 : 3;
    for (let index = 0; index < voices; index += 1) {
      const oscillator = context.createOscillator();
      oscillator.type = index % 2 === 0 ? "sawtooth" : "triangle";
      const base = variant === "cry" ? 156 : variant === "answer" ? 104 : 122;
      oscillator.frequency.setValueAtTime(base + index * 13, context.currentTime);
      oscillator.frequency.linearRampToValueAtTime(base * (variant === "call" ? 1.18 : 0.86) + index * 7, context.currentTime + duration * 0.78);
      oscillator.detune.value = (index - voices / 2) * 11;
      oscillator.connect(filter);
      oscillator.start(context.currentTime + index * 0.035);
      oscillator.stop(context.currentTime + duration);
    }
    const breath = context.createBufferSource();
    breath.buffer = this.noiseBuffer(duration, 0.18);
    const breathFilter = context.createBiquadFilter();
    breathFilter.type = "bandpass";
    breathFilter.frequency.value = 620;
    const breathGain = context.createGain();
    breathGain.gain.setValueAtTime(0.016 * intensity, context.currentTime);
    breathGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    breath.connect(breathFilter).connect(panner).connect(breathGain).connect(this.bus("dialogue"));
    breath.start();
  }

  public electricalBurst(position: Vector3): void {
    this.spatialNoiseBurst(position, 0.34, 0.17, 3100, "highpass");
    [96, 192, 384].forEach((frequency, index) => {
      window.setTimeout(() => this.spatialTone(position, frequency, 0.12, 0.07 - index * 0.014, index % 2 ? "square" : "sawtooth"), index * 42);
    });
  }

  public noahCue(position: Vector3): void {
    this.falseVoice("call", position, 0.62);
    window.setTimeout(() => this.spatialTone(position, 196, 0.5, 0.025, "sine"), 280);
  }

  public mimicVoice(): void {
    const context = this.ensureContext();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.065, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.6);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 740;
    filter.Q.value = 0.6;
    filter.connect(gain).connect(this.bus("dialogue"));
    [82, 109, 137, 164].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index % 2 ? "triangle" : "sawtooth";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 13 - 18;
      oscillator.connect(filter);
      oscillator.start(context.currentTime + index * 0.045);
      oscillator.stop(context.currentTime + 2.65);
    });
  }

  public memoryFragments(): void {
    [392, 247, 659, 165, 523].forEach((frequency, index) => {
      window.setTimeout(() => {
        this.beep(frequency, 0.22, 0.032, index % 2 ? "sawtooth" : "sine", index % 3 === 0 ? "dialogue" : "music");
      }, index * 520);
    });
  }

  public mannequinJoint(position: Vector3, intensity = 0.45): void {
    this.spatialNoiseBurst(position, 0.09, 0.08 * intensity, 2300, "bandpass");
    this.spatialTone(position, 135 + Math.random() * 55, 0.07, 0.035 * intensity, "square");
  }

  public mannequinBreak(position: Vector3): void {
    this.spatialNoiseBurst(position, 0.42, 0.22, 1400, "highpass");
    this.spatialTone(position, 72, 0.26, 0.12, "sawtooth");
  }

  public rearProximity(distance: number): void {
    const volume = Math.max(0.025, Math.min(0.12, 0.15 - distance * 0.02));
    const context = this.ensureContext();
    const noise = context.createBufferSource();
    noise.buffer = this.noiseBuffer(0.18, 0.28);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 780;
    const panner = context.createStereoPanner();
    panner.pan.value = -0.65 + Math.random() * 1.3;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
    noise.connect(filter).connect(panner).connect(gain).connect(this.bus("effects"));
    noise.start();
  }

  public metalLure(position: Vector3, strength = 1): void {
    this.spatialNoiseBurst(position, 0.36, 0.18 * strength, 1800, "bandpass");
    this.spatialTone(position, 210, 0.32, 0.09 * strength, "triangle");
  }

  public electricalSnap(position: Vector3, strength = 1): void {
    this.spatialNoiseBurst(position, 0.16, 0.12 * strength, 4200, "highpass");
    this.spatialTone(position, 920, 0.11, 0.055 * strength, "square");
  }

  public hydraulicPulse(strength = 1): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(68, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(28, context.currentTime + 0.48);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.11 * Math.max(0.2, strength), context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
    oscillator.connect(gain).connect(this.bus("effects"));
    oscillator.start();
    oscillator.stop(context.currentTime + 0.52);
  }

  public elevatorTick(floor: number): void {
    this.beep(220 + floor * 35, 0.08, 0.045, "square", "effects");
  }

  public distortedAnnouncement(): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 96;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 680;
    filter.Q.value = 0.5;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.025, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.4);
    oscillator.connect(filter).connect(gain).connect(this.bus("dialogue"));
    oscillator.start();
    oscillator.stop(context.currentTime + 1.45);
  }

  public blackoutDrop(): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(0.6, 0.45);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(3400, context.currentTime);
    filter.frequency.exponentialRampToValueAtTime(90, context.currentTime + 0.58);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.2, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6);
    source.connect(filter).connect(gain).connect(this.bus("effects"));
    source.start();
  }

  public windGust(): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(1.25, 0.42);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 950;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.2);
    source.connect(filter).connect(gain).connect(this.bus("effects"));
    source.start();
  }

  public startTemporaryBuzzer(position: Vector3, duration: number): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.value = 245;
    const gain = context.createGain();
    gain.gain.value = 0.07;
    const panner = this.createPanner(position);
    oscillator.connect(gain).connect(panner).connect(this.bus("effects"));
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  public updateListener(position: Vector3, forward: Vector3, up = Vector3.Up()): void {
    if (!this.context) return;
    const listener = this.context.listener;
    if (listener.positionX) {
      listener.positionX.value = position.x;
      listener.positionY.value = position.y;
      listener.positionZ.value = position.z;
      listener.forwardX.value = forward.x;
      listener.forwardY.value = forward.y;
      listener.forwardZ.value = forward.z;
      listener.upX.value = up.x;
      listener.upY.value = up.y;
      listener.upZ.value = up.z;
    }
  }

  public createSpatialNoise(id: string, position: Vector3, volume = 0.08): void {
    if (this.spatialLoops.has(id)) return;
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(1.4, 0.22);
    source.loop = true;
    const gain = context.createGain();
    gain.gain.value = volume;
    const panner = context.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 2;
    panner.maxDistance = 45;
    panner.rolloffFactor = 1.4;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;
    source.connect(gain).connect(panner).connect(this.bus("effects"));
    source.start();
    this.spatialLoops.set(id, { source, gain, panner });
  }


  private spatialNoiseBurst(position: Vector3, duration: number, volume: number, frequency: number, type: BiquadFilterType): void {
    const context = this.ensureContext();
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer(duration, 0.5);
    const filter = context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    const panner = this.createPanner(position);
    source.connect(filter).connect(gain).connect(panner).connect(this.bus("effects"));
    source.start();
  }

  private spatialTone(position: Vector3, frequency: number, duration: number, volume: number, type: OscillatorType): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    const panner = this.createPanner(position);
    oscillator.connect(gain).connect(panner).connect(this.bus("effects"));
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  private createPanner(position: Vector3): PannerNode {
    const context = this.ensureContext();
    const panner = context.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "inverse";
    panner.refDistance = 2;
    panner.maxDistance = 55;
    panner.rolloffFactor = 1.3;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;
    return panner;
  }

  private beep(frequency: number, duration: number, volume: number, type: OscillatorType, bus: AudioBus): void {
    const context = this.ensureContext();
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(this.bus(bus));
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }

  private ensureContext(): AudioContext {
    if (this.context) return this.context;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.effects = this.context.createGain();
    this.music = this.context.createGain();
    this.dialogue = this.context.createGain();
    this.effects.connect(this.master);
    this.music.connect(this.master);
    this.dialogue.connect(this.master);
    this.master.connect(this.context.destination);
    this.applySettings(this.settings);
    return this.context;
  }

  private bus(bus: AudioBus): GainNode {
    this.ensureContext();
    if (bus === "music") return this.music!;
    if (bus === "dialogue") return this.dialogue!;
    return this.effects!;
  }

  private noiseBuffer(duration: number, amplitude: number): AudioBuffer {
    const context = this.ensureContext();
    const length = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.72 + white * 0.28;
      data[i] = last * amplitude;
    }
    return buffer;
  }
}
