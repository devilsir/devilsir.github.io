const paintings = Object.freeze([
    {
        cue: "convite", until: 6200,
        image: new URL("../../assets/opening/01-convite.webp", import.meta.url).href,
        marker: "ROTA 17  /  FILME PROMOCIONAL",
        title: "Wonder World",
        detail: "Onde a diversão ganha vida.",
        narration: "Bem-vindos ao Wonder World, onde toda criança encontra uma parte de si mesma."
    },
    {
        cue: "body", until: 10200,
        image: new URL("../../assets/opening/02-body.webp", import.meta.url).href,
        marker: "A ATRAÇÃO PRINCIPAL",
        title: "Conheça Body",
        detail: "O amigo de quatro braços está esperando por você."
    },
    {
        cue: "quadro", until: 14900,
        image: new URL("../../assets/opening/03-quadro-437b.webp", import.meta.url).href,
        marker: "QUADRO 437-B  /  23:07",
        title: "Gravação interrompida",
        detail: "Três pessoas passam pelo corredor. No chão, quatro sombras."
    },
    {
        cue: "rota17", until: 20400,
        image: new URL("../../assets/opening/04-rota-17.webp", import.meta.url).href,
        marker: "ROTA 17  /  ANOS DEPOIS",
        title: "Atração Final",
        dialogue: [
            { until: 16700, text: "Noah: Lembra da ficha azul?" },
            { until: 18350, text: "Maya: Eu vou na frente." },
            { until: 20400, text: "Daniel: Cinco minutos. Espera aqui." }
        ]
    }
]);

// Deliberate holds, not gameplay simulation: the sequence has no per-frame JS.
export function openingCueAt(elapsed) {
    return paintings.find((shot) => elapsed < shot.until)?.cue ?? "fim";
}

function detailFor(shot, elapsed) {
    return shot?.dialogue?.find((line) => elapsed < line.until) ?? { until: shot?.until, text: shot?.detail ?? "" };
}

export function openingDetailAt(elapsed) {
    return detailFor(paintings.find((shot) => elapsed < shot.until), elapsed).text;
}

export function playIllustratedOpening(screen, settings, onSkip, onCue = () => {}) {
    const frame = screen.querySelector(".opening-frame");
    const marker = screen.querySelector(".opening-marker");
    const title = screen.querySelector(".opening-title");
    const detail = screen.querySelector(".opening-detail");
    detail.setAttribute("aria-live", "polite");
    const subtitle = screen.querySelector(".opening-subtitle");
    const skip = screen.querySelector("#skip-film");
    const progress = screen.querySelector(".opening-progress");
    const synth = window.speechSynthesis;
    const calm = Boolean(settings.reducedCameraShake || settings.reducedFlashing);
    const volume = (settings.masterVolume ?? 1) * (settings.dialogueVolume ?? 1);
    let narrationStarted = false;
    let narrationTimer;
    let frameTimer;
    let elapsed = 0;
    let last = null;
    let shown = null;
    let finished = false;
    const art = paintings.map((shot, index) => {
        const layer = document.createElement("div");
        const img = document.createElement("img");
        img.alt = "";
        img.decoding = "async";
        img.fetchPriority = index === 0 ? "high" : "low";
        img.src = shot.image;
        layer.className = "opening-art";
        layer.dataset.art = shot.cue;
        layer.append(img);
        return layer;
    });
    frame.prepend(...art);
    screen.dataset.calm = String(calm);
    screen.classList.remove("hidden");
    screen.showModal();
    skip.focus({ preventScroll: true });

    return new Promise((resolve) => {
        const signal = (cue) => {
            try { onCue(cue); }
            catch (error) { console.warn("Som da abertura indisponível:", error); }
        };
        const stopVoice = () => {
            clearTimeout(narrationTimer);
            if (narrationStarted) synth?.cancel();
        };
        const finish = (skipped) => {
            if (finished) return;
            finished = true;
            clearTimeout(frameTimer);
            stopVoice();
            document.removeEventListener("keydown", keydown, true);
            document.removeEventListener("visibilitychange", visibility);
            skip.removeEventListener("click", skipFilm);
            screen.removeEventListener("cancel", cancel);
            screen.close();
            screen.classList.add("hidden");
            delete screen.dataset.cue;
            art.forEach((layer) => layer.remove());
            signal("fim");
            resolve();
            if (skipped) onSkip();
        };
        const skipFilm = () => finish(true);
        const cancel = (event) => {
            event.preventDefault();
            skipFilm();
        };
        const keydown = (event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            event.stopImmediatePropagation();
            skipFilm();
        };
        const advance = () => {
            if (finished || document.hidden) return;
            const now = performance.now();
            if (last !== null) elapsed += now - last;
            last = now;
            const index = paintings.findIndex((shot) => elapsed < shot.until);
            if (index === -1) { finish(false); return; }
            const shot = paintings[index];
            if (shot !== shown) {
                if (shown?.narration) stopVoice();
                shown = shot;
                art.forEach((layer, i) => layer.classList.toggle("opening-art-current", i === index));
                screen.dataset.cue = shot.cue;
                marker.textContent = shot.marker;
                title.textContent = shot.title;
                subtitle.textContent = shot.narration ?? "";
                subtitle.hidden = !shot.narration || !settings.subtitles;
                progress.textContent = String(index + 1).padStart(2, "0") + " / 04";
                signal(shot.cue);
                if (shot.narration && synth && typeof SpeechSynthesisUtterance === "function" && volume > 0) {
                    narrationTimer = setTimeout(() => {
                        if (finished || document.hidden) return;
                        const words = new SpeechSynthesisUtterance(shot.narration);
                        words.lang = "pt-BR";
                        words.rate = 0.88;
                        words.pitch = 0.86;
                        words.volume = Math.max(0, Math.min(1, volume));
                        synth.cancel();
                        synth.speak(words);
                        narrationStarted = true;
                    }, 360);
                }
            }
            const line = detailFor(shot, elapsed);
            if (detail.textContent !== line.text) detail.textContent = line.text;
            frameTimer = setTimeout(advance, Math.max(1, line.until - elapsed));
        };
        const visibility = () => {
            clearTimeout(frameTimer);
            if (document.hidden) {
                if (last !== null) elapsed += performance.now() - last;
                last = null;
                stopVoice();
            } else {
                advance();
            }
        };
        document.addEventListener("keydown", keydown, true);
        document.addEventListener("visibilitychange", visibility);
        skip.addEventListener("click", skipFilm);
        screen.addEventListener("cancel", cancel);
        advance();
    });
}
