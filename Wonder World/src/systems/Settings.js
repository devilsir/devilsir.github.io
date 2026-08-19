export const DEFAULT_SETTINGS = {
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
    guideLightEnabled: true,
    extendedBossWindows: false,
    extendedPuzzleWindows: false,
    simplifiedChase: false,
    performancePreset: "balanced"
};
const STORAGE_KEY = "atracao-final-settings-v1";
const clamp = (value, min, max, fallback) => {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
};
const bool = (value, fallback) => typeof value === "boolean" ? value : fallback;
export class SettingsStore {
    value;
    constructor() {
        this.value = this.load();
    }
    save(next) {
        this.value = this.sanitize({ ...this.value, ...next });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
        return this.value;
    }
    reset() {
        this.value = { ...DEFAULT_SETTINGS };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.value));
        return this.value;
    }
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return { ...DEFAULT_SETTINGS };
            return this.sanitize(JSON.parse(raw));
        }
        catch {
            return { ...DEFAULT_SETTINGS };
        }
    }
    sanitize(raw) {
        const sprintMode = raw.sprintMode === "toggle" ? "toggle" : "hold";
        const crouchMode = raw.crouchMode === "toggle" ? "toggle" : "hold";
        const performancePreset = raw.performancePreset === "performance" || raw.performancePreset === "cinematic"
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
            guideLightEnabled: bool(raw.guideLightEnabled, DEFAULT_SETTINGS.guideLightEnabled),
            extendedBossWindows: bool(raw.extendedBossWindows, DEFAULT_SETTINGS.extendedBossWindows),
            extendedPuzzleWindows: bool(raw.extendedPuzzleWindows, DEFAULT_SETTINGS.extendedPuzzleWindows),
            simplifiedChase: bool(raw.simplifiedChase, DEFAULT_SETTINGS.simplifiedChase),
            performancePreset
        };
    }
}
