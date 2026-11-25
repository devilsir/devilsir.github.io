const suspense = new Set(["cross-fence", "reach-side-door", "enter-auditorium", "defeat-mimic"]);
const finalPursuit = new Set(["escape-collapse", "body-return", "escape-mannequin", "mannequin-return", "final-jesse", "burning-archives", "maintenance-bridge"]);

// Music should inform pacing, not mask the authored cassette, music-box and puzzle cues.
export function selectHorrorScore(stage, objective, nearMelodyPuzzle = false) {
    if (stage === "menu") return "dream";
    if (stage === "campaign-complete" || stage.endsWith("-transition")) return null;
    if (stage === "prologue") return suspense.has(objective) ? "dread" : "dream";
    if (stage === "boss") return "chase";
    if (stage === "chapter1") return objective === "survive-plush" ? "chase" : "dread";
    if (stage === "chapter2") {
        if (objective === "follow-music") return null;
        if (objective === "escape-arena") return "chase";
        return objective.startsWith("sphere-") ? "pursuit" : "factory";
    }
    if (stage === "chapter3") {
        if (nearMelodyPuzzle || objective === "follow-jesse-melody" || objective === "watch-jack-box") return null;
        return objective === "escape-jesse" || objective === "survive-elevator" ? "chase" : objective === "activate-five-generators" ? "factory" : "dream";
    }
    if (stage === "chapter4") return objective === "defeat-mimic" ? "chase" : objective === "follow-blood" ? "pursuit" : "dread";
    if (stage === "chapter5") {
        if (objective === "read-final-record" || objective.includes("credits") || objective === "true-ending") return null;
        return finalPursuit.has(objective) ? "chase" : "dream";
    }
    return null;
}

