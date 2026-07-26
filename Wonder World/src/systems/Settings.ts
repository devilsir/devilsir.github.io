export type PerformancePreset = "performance" | "balanced" | "cinematic";
export type ToggleMode = "hold" | "toggle";

export interface GameSettings {
  masterVolume: number;
  effectsVolume: number;
  musicVolume: number;
  dialogueVolume: number;
  brightness: number;
  gamma: number;
  mouseSensitivity: number;
  subtitles: boolean;
  subtitleSize: number;
  speakerLabels: boolean;
  soundCaptions: boolean;
  reducedCameraShake: boolean;
  reducedFlashing: boolean;
  reducedHeadBob: boolean;
  sprintMode: ToggleMode;
  crouchMode: ToggleMode;
  highContrastInteractions: boolean;
  extendedBossWindows: boolean;
  extendedPuzzleWindows: boolean;
  simplifiedChase: boolean;
  performancePreset: PerformancePreset;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.82,
  effectsVolume: 0.82,
  musicVolume: 0.55,
  dialogueVolume: 0.9,
  brightness: 1,
  gamma: 1,
  mouseSensitivity: 0.55,
  subtitles: true,
  subtitleSize: 22,
  speakerLabels: true,
  soundCaptions: true,
  reducedCameraShake: false,
  reducedFlashing: false,
  reducedHeadBob: false,
  sprintMode: "hold",
  crouchMode: "hold",
  highContrastInteractions: true,
  extendedBossWindows: false,
  extendedPuzzleWindows: false,
  simplifiedChase: false,
  performancePreset: "balanced"
};

const STORAGE_KEY = "atracao-final-settings-v1";

const clamp = (value: unknown, min: number, max: number, fallback: number): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
};

const bool = (value: unknown, fallback: boolean): boolean =>
  typeof value === "boolean" ? value : fallback;

export class SettingsStore {
  public value: GameSettings;

  public constructor() {
    this.value = this.load();
  }

  public save(next: Partial<GameSettings>): GameSettings {
    this.value = this.sanitize({ ...this.value, ...next });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
    return this.value;
  }

  public reset(): GameSettings {
    this.value = { ...DEFAULT_SETTINGS };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
    return this.value;
  }

  private load(): GameSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return this.sanitize(JSON.parse(raw) as Partial<GameSettings>);
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private sanitize(raw: Partial<GameSettings>): GameSettings {
    const sprintMode: ToggleMode = raw.sprintMode === "toggle" ? "toggle" : "hold";
    const crouchMode: ToggleMode = raw.crouchMode === "toggle" ? "toggle" : "hold";
    const performancePreset: PerformancePreset =
      raw.performancePreset === "performance" || raw.performancePreset === "cinematic"
        ? raw.performancePreset
        : "balanced";

    return {
      masterVolume: clamp(raw.masterVolume, 0, 1, DEFAULT_SETTINGS.masterVolume),
      effectsVolume: clamp(raw.effectsVolume, 0, 1, DEFAULT_SETTINGS.effectsVolume),
      musicVolume: clamp(raw.musicVolume, 0, 1, DEFAULT_SETTINGS.musicVolume),
      dialogueVolume: clamp(raw.dialogueVolume, 0, 1, DEFAULT_SETTINGS.dialogueVolume),
      brightness: clamp(raw.brightness, 0.65, 1.65, DEFAULT_SETTINGS.brightness),
      gamma: clamp(raw.gamma, 0.65, 1.65, DEFAULT_SETTINGS.gamma),
      mouseSensitivity: clamp(raw.mouseSensitivity, 0.1, 1.6, DEFAULT_SETTINGS.mouseSensitivity),
      subtitles: bool(raw.subtitles, DEFAULT_SETTINGS.subtitles),
      subtitleSize: clamp(raw.subtitleSize, 16, 34, DEFAULT_SETTINGS.subtitleSize),
      speakerLabels: bool(raw.speakerLabels, DEFAULT_SETTINGS.speakerLabels),
      soundCaptions: bool(raw.soundCaptions, DEFAULT_SETTINGS.soundCaptions),
      reducedCameraShake: bool(raw.reducedCameraShake, DEFAULT_SETTINGS.reducedCameraShake),
      reducedFlashing: bool(raw.reducedFlashing, DEFAULT_SETTINGS.reducedFlashing),
      reducedHeadBob: bool(raw.reducedHeadBob, DEFAULT_SETTINGS.reducedHeadBob),
      sprintMode,
      crouchMode,
      highContrastInteractions: bool(raw.highContrastInteractions, DEFAULT_SETTINGS.highContrastInteractions),
      extendedBossWindows: bool(raw.extendedBossWindows, DEFAULT_SETTINGS.extendedBossWindows),
      extendedPuzzleWindows: bool(raw.extendedPuzzleWindows, DEFAULT_SETTINGS.extendedPuzzleWindows),
      simplifiedChase: bool(raw.simplifiedChase, DEFAULT_SETTINGS.simplifiedChase),
      performancePreset
    };
  }
}
