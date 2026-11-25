const layerSources = Object.freeze({
    reflections: new URL("../../assets/opening/01-reflexos.svg", import.meta.url).href,
    dust: new URL("../../assets/opening/02-poeira.svg", import.meta.url).href,
    shadow: new URL("../../assets/opening/03-quarta-sombra.svg", import.meta.url).href,
    rain: new URL("../../assets/opening/04-chuva.svg", import.meta.url).href,
    tape: new URL("../../assets/opening/05-fita.svg", import.meta.url).href,
    record: new URL("../../assets/opening/05-rec.svg", import.meta.url).href,
    archive: new URL("../../assets/opening/06-arquivo.svg", import.meta.url).href,
    note: new URL("../../assets/opening/06-nota.svg", import.meta.url).href,
    windshield: new URL("../../assets/opening/07-vidro.svg", import.meta.url).href,
    road: new URL("../../assets/opening/04-rota-17.webp", import.meta.url).href,
    projection: new URL("../../assets/opening/08-projection.webp", import.meta.url).href,
    closing: new URL("../../assets/opening/09-closing.webp", import.meta.url).href,
    monitor: new URL("../../assets/opening/10-desk.webp", import.meta.url).href,
    map: new URL("../../assets/opening/11-map.webp", import.meta.url).href,
    highway: new URL("../../assets/opening/12-highway.webp", import.meta.url).href,
    token: new URL("../../assets/opening/13-token.webp", import.meta.url).href,
    enamel: new URL("../../assets/opening/fx-token-blue.svg", import.meta.url).href,
    beam: new URL("../../assets/opening/fx-projector.svg", import.meta.url).href,
    fog: new URL("../../assets/opening/fx-smoke.svg", import.meta.url).href,
    light: new URL("../../assets/opening/fx-headlights.svg", import.meta.url).href,
    ink: new URL("../../assets/opening/fx-ink.svg", import.meta.url).href
});
const voices = Object.freeze({
    convite: new URL("../../assets/opening/voice/convite.mp3", import.meta.url).href,
    body: new URL("../../assets/opening/voice/body.mp3", import.meta.url).href,
    fita: new URL("../../assets/opening/voice/fita.mp3", import.meta.url).href,
    quadro: new URL("../../assets/opening/voice/quadro.mp3", import.meta.url).href,
    arquivo: new URL("../../assets/opening/voice/arquivo.mp3", import.meta.url).href,
    rota17: new URL("../../assets/opening/voice/rota17.mp3", import.meta.url).href,
    noah: new URL("../../assets/opening/voice/noah.mp3", import.meta.url).href,
    maya: new URL("../../assets/opening/voice/maya.mp3", import.meta.url).href,
    daniel: new URL("../../assets/opening/voice/daniel.mp3", import.meta.url).href,
    projecao: new URL("../../assets/opening/voice/projecao.mp3", import.meta.url).href,
    fechamento: new URL("../../assets/opening/voice/fechamento.mp3", import.meta.url).href,
    monitor: new URL("../../assets/opening/voice/monitor.mp3", import.meta.url).href,
    pista: new URL("../../assets/opening/voice/pista.mp3", import.meta.url).href,
    estrada: new URL("../../assets/opening/voice/estrada.mp3", import.meta.url).href,
    promessa: new URL("../../assets/opening/voice/promessa.mp3", import.meta.url).href
});

const paintings = Object.freeze([
    {
        cue: "convite", until: 9000,
        image: new URL("../../assets/opening/01-convite.webp", import.meta.url).href,
        motion: [["reflections", layerSources.reflections]],
        marker: "ROTA 17  /  FILME PROMOCIONAL",
        title: "Wonder World",
        detail: "Onde a diversão ganha vida.",
        narration: "Na Rota Dezessete, toda criança encontra uma parte de si mesma. Venha viver o Wonder World."
    },
    {
        cue: "projecao", until: 20000,
        image: layerSources.projection,
        motion: [["beam", layerSources.beam], ["theater-dust", layerSources.dust]],
        marker: "ROTA 17  /  ÚLTIMA SESSÃO",
        title: "O espetáculo começa",
        detail: "O comercial prometia uma segunda visita.",
        narration: "O último espetáculo começa quando as portas se fecham. Guardem a ficha azul. Ela vale uma segunda visita."
    },
    {
        cue: "body", until: 27800,
        image: new URL("../../assets/opening/02-body.webp", import.meta.url).href,
        motion: [["dust", layerSources.dust], ["curtain"]],
        marker: "A ATRAÇÃO PRINCIPAL",
        title: "Conheça Body",
        detail: "O amigo de quatro braços está esperando por você.",
        narration: "Quando as luzes se apagarem, Body vai continuar aqui, esperando por você."
    },
    {
        cue: "fechamento", until: 38800,
        image: layerSources.closing,
        motion: [["shutter-fog", layerSources.fog], ["afterglow", layerSources.beam]],
        marker: "ÚLTIMO TURNO  /  DEPOIS DO EXPEDIENTE",
        title: "As portas se fecham",
        detail: "A última música parou no meio.",
        narration: "O último turno terminou como qualquer outro. O bilheteiro fechou a grade. No palco, a música parou no meio."
    },
    {
        cue: "fita", until: 47000,
        image: layerSources.tape,
        motion: [["record", layerSources.record]],
        marker: "FITA MESTRE  /  APÓS O FECHAMENTO",
        title: "O que ficou na fita",
        detail: "Depois do comercial, a câmera continuou gravando.",
        narration: "O comercial acabava ali. Mas, naquela noite, alguém deixou a câmera gravando."
    },
    {
        cue: "monitor", until: 57500,
        image: layerSources.monitor,
        motion: [["scan-fog", layerSources.fog], ["timecode", layerSources.record]],
        marker: "FITA MESTRE  /  REBOBINAR",
        title: "Um quadro a mais",
        detail: "Alguém voltou a fita um quadro.",
        narration: "A primeira cópia pulava do corredor vazio para uma tela preta. Na segunda, alguém voltou um quadro."
    },
    {
        cue: "quadro", until: 66500,
        image: new URL("../../assets/opening/03-quadro-437b.webp", import.meta.url).href,
        motion: [["shadow", layerSources.shadow]],
        marker: "QUADRO 437-B  /  23:07",
        title: "Três pessoas. Quatro sombras.",
        detail: "A quarta sombra não pertencia a ninguém.",
        narration: "Três pessoas cruzaram o corredor. Uma quarta sombra não acompanhou ninguém."
    },
    {
        cue: "arquivo", until: 74500,
        image: layerSources.archive,
        motion: [["note", layerSources.note]],
        marker: "ARQUIVO DA ROTA 17",
        title: "O parque fechou",
        detail: "A placa sumiu da estrada. A fita, não.",
        narration: "O parque fechou. A placa sumiu da estrada. A fita, não."
    },
    {
        cue: "pista", until: 85500,
        image: layerSources.map,
        motion: [["ink", layerSources.ink], ["paper-haze", layerSources.fog]],
        marker: "ANOS DEPOIS  /  RECORTES E MAPAS",
        title: "A pista de Noah",
        detail: "A estrada mudou de nome. O prédio ainda estava lá.",
        narration: "Noah reconheceu a entrada num recorte de jornal. A estrada mudara de nome, mas o prédio ainda estava lá."
    },
    {
        cue: "estrada", until: 96600,
        image: layerSources.highway,
        motion: [["rain-far", layerSources.rain], ["headlights", layerSources.light], ["rain-near", layerSources.rain]],
        marker: "ESTRADA  /  DE MADRUGADA",
        title: "A última placa",
        detail: "A chuva apagou as marcas no asfalto.",
        narration: "Depois da última placa, só havia chuva. Ninguém no carro conseguia lembrar a última vez que o parque estivera aberto."
    },
    {
        cue: "rota17", until: 105300,
        image: layerSources.road,
        motion: [["rain-far", layerSources.rain], ["rain-near", layerSources.rain]],
        marker: "ROTA 17  /  ANOS DEPOIS",
        title: "De volta à Rota 17",
        detail: "A marquise ainda estava de pé.",
        narration: "Anos depois, quatro amigos voltaram à Rota Dezessete. Eles queriam ver o que a fita não mostrava."
    },
    {
        cue: "ficha", until: 112700,
        image: layerSources.token,
        motion: [["token-blue", layerSources.enamel], ["token-shine", layerSources.light], ["ink", layerSources.ink]],
        marker: "DENTRO DO CARRO  /  ANTES DE DESCER",
        title: "Uma promessa",
        detail: "Noah: Se a gente se separar, volta pro carro.",
        narration: "Se a gente se separar, volta pro carro. Não vale seguir uma voz no escuro.",
        voice: "promessa"
    },
    {
        cue: "chegada", until: 120000,
        image: layerSources.road,
        motion: [["rain-far", layerSources.rain], ["rain-near", layerSources.rain], ["glass", layerSources.windshield]],
        marker: "ESTACIONAMENTO  /  ESTA NOITE",
        title: "Atração Final",
        dialogue: [
            { until: 114900, voice: "noah", speaker: "Noah", text: "Lembra da ficha azul?" },
            { until: 117150, voice: "maya", speaker: "Maya", text: "Eu vou na frente." },
            { until: 120000, voice: "daniel", speaker: "Daniel", text: "Cinco minutos. Espera aqui." }
        ]
    }
]);

// Timestamps drive scene changes and dialogue; CSS animates only the active planes.
export function openingCueAt(elapsed) {
    return paintings.find((shot) => elapsed < shot.until)?.cue ?? "fim";
}

function detailFor(shot, elapsed) {
    return shot?.dialogue?.find((line) => elapsed < line.until) ?? { until: shot?.until, text: shot?.detail ?? "" };
}

export function openingDetailAt(elapsed) {
    const line = detailFor(paintings.find((shot) => elapsed < shot.until), elapsed);
    return line.speaker ? line.speaker + ": " + line.text : line.text;
}

export function playIllustratedOpening(screen, settings, onSkip, onCue = () => {}) {
    const frame = screen.querySelector(".opening-frame");
    const marker = screen.querySelector(".opening-marker");
    const title = screen.querySelector(".opening-title");
    const detail = screen.querySelector(".opening-detail");
    const subtitle = screen.querySelector(".opening-subtitle");
    const skip = screen.querySelector("#skip-film");
    const progress = screen.querySelector(".opening-progress");
    const synth = window.speechSynthesis;
    const calm = Boolean(settings.reducedCameraShake || settings.reducedFlashing);
    const volume = Math.max(0, Math.min(1, (settings.masterVolume ?? 1) * (settings.dialogueVolume ?? 1)));
    let activeVoice = null;
    let voiceTimer;
    let frameTimer;
    let elapsed = 0;
    let last = null;
    let shown = null;
    let spoken = null;
    let finished = false;
    const art = paintings.map((shot, index) => {
        const layer = document.createElement("div");
        const composite = document.createElement("div");
        composite.className = "opening-composite";
        composite.setAttribute("aria-hidden", "true");
        for (const [part, source] of [["base", shot.image], ...shot.motion]) {
            const img = document.createElement("img");
            img.alt = "";
            img.decoding = "async";
            img.fetchPriority = index === 0 ? "high" : "auto";
            img.className = "opening-plane opening-plane--" + part;
            img.src = source ?? shot.image;
            composite.append(img);
        }
        layer.className = "opening-art";
        layer.dataset.art = shot.cue;
        layer.style.setProperty("--hold", (shot.until - (paintings[index - 1]?.until ?? 0)) + "ms");
        layer.append(composite);
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
            clearTimeout(voiceTimer);
            if (activeVoice) {
                activeVoice.pause();
                activeVoice.removeAttribute("src");
                activeVoice.load();
                activeVoice = null;
            }
            if (synth?.speaking) synth.cancel();
        };
        const speak = (id, text, commercial, delay) => {
            stopVoice();
            if (volume <= 0 || !text || !id) return;
            voiceTimer = setTimeout(() => {
                if (finished || document.hidden || spoken !== id) return;
                const fallback = () => {
                    if (finished || document.hidden || spoken !== id || !synth || typeof SpeechSynthesisUtterance !== "function") return;
                    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("pt-br"));
                    if (!voice) return;
                    const words = new SpeechSynthesisUtterance(text);
                    words.lang = "pt-BR";
                    words.voice = voice;
                    words.rate = commercial ? 1.03 : .99;
                    words.pitch = commercial ? 1.02 : .88;
                    words.volume = volume;
                    synth.speak(words);
                };
                if (typeof Audio !== "function" || !voices[id]) { fallback(); return; }
                const audio = new Audio(voices[id]);
                activeVoice = audio;
                audio.volume = volume;
                audio.play().catch(() => {
                    if (activeVoice === audio) fallback();
                });
            }, delay);
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
            delete screen.dataset.suspended;
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
                shown = shot;
                spoken = null;
                stopVoice();
                art.forEach((layer, i) => layer.classList.toggle("opening-art-current", i === index));
                screen.dataset.cue = shot.cue;
                marker.textContent = shot.marker;
                title.textContent = shot.title;
                progress.textContent = String(index + 1).padStart(2, "0") + " / " + String(paintings.length).padStart(2, "0");
                signal(shot.cue);
            }
            const line = detailFor(shot, elapsed);
            const text = line.speaker ? line.speaker + ": " + line.text : line.text;
            if (detail.textContent !== text) detail.textContent = text;
            const caption = shot.narration || "";
            if (subtitle.textContent !== caption) subtitle.textContent = caption;
            subtitle.hidden = !caption || !settings.subtitles || caption === text;
            const voice = line.voice ?? (shot.narration ? (shot.voice ?? shot.cue) : null);
            if (voice !== spoken) {
                spoken = voice;
                speak(voice, shot.narration ?? line.text, index < 3, line.voice ? 90 : shot.cue === "quadro" ? 700 : 230);
            }
            frameTimer = setTimeout(advance, Math.max(1, line.until - elapsed));
        };
        const visibility = () => {
            screen.dataset.suspended = String(document.hidden);
            clearTimeout(frameTimer);
            if (document.hidden) {
                if (last !== null) elapsed += performance.now() - last;
                last = null;
                clearTimeout(voiceTimer);
                activeVoice?.pause();
                if (synth?.speaking) synth.pause();
            } else {
                if (synth?.paused) synth.resume();
                if (activeVoice && !activeVoice.ended) activeVoice.play().catch(() => {});
                else if (!activeVoice && !synth?.speaking) spoken = null;
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
