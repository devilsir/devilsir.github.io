const scenes = [
    {
        id: "fita-portaria", stage: "chapter1", label: "FITA 01  /  CÂMERA DA PORTARIA", look: "lobby",
        when: (p, checkpoint, objective) => checkpoint === "chapter1-entry" && objective === "search-friends"
            && Math.abs(p.x) < 6 && p.z > 46 && p.z < 54,
        duration: 7.7,
        beats: [
            { at: 0, image: "empty", line: "23:07. Último teste. A câmera mostra uma prateleira vazia." },
            { at: 2.3, image: "watch", line: "O Vigia aparece de pé. Olhe para ele e ele para.", sound: "o gravador engasga e o brinquedo bate no vidro", impact: 0.48 },
            { at: 4.65, image: "empty", line: "Daniel anotou: a voz é minha. Mas eu não disse isso." }
        ]
    },
    {
        id: "retorno-circuito", stage: "chapter1", label: "FITA 02  /  RETORNO DO CIRCUITO", look: "power",
        when: (p, checkpoint, objective) => checkpoint === "electrical-restored" && objective === "solve-body-puzzles"
            && p.x > -29 && p.x < -8 && p.z > 92 && p.z < 112,
        duration: 9.8, delay: 1.35, quietUntil: 2.9,
        beats: [
            { at: 0, image: "empty", line: "O interfone volta a funcionar. Ninguém está segurando o botão." },
            { at: 2.35, image: "close", line: "«Ei! Vocês estão aí?» É a sua voz, gravada antes de você entrar.", sound: "um estalo seco vindo do interfone", impact: 0.76, sting: true },
            { at: 5.65, image: "watch", line: "Costurado: espere o bote, desvie de lado. O fogo no chão o repele." }
        ]
    },
    {
        id: "reflexo-atrasado", stage: "chapter4", label: "MONITOR 04  /  SALA DE OBSERVAÇÃO", look: "glass",
        when: (p, checkpoint, objective) => (objective === "reach-archives"
            || (checkpoint === "mimic-stopped" && objective === "search-mimic-remains"))
            && Math.abs(p.x) < 4.8 && p.z > 1415 && p.z < 1442,
        duration: 6.25, delay: 0.32, quietUntil: 2.35,
        beats: [
            { at: 0, image: "empty", line: "23:07. Daniel sai. O reflexo fica." },
            { at: 1.8, image: "close", line: "O reflexo vira o rosto para a câmera.", sound: "uma batida do outro lado do vidro", impact: 0.68, sting: true },
            { at: 3.1, image: "empty", line: "Maya, no verso da fita: mude a pergunta. Veja o que ele responde." }
        ]
    },
    {
        id: "prova-de-voz", stage: "chapter5", label: "ARQUIVO M-04  /  REGISTRO RECUPERADO", look: "archive",
        when: (p) => Math.abs(p.x) < 12 && p.z > 1644 && p.z < 1666,
        duration: 9.1,
        beats: [
            { at: 0, image: "watch", line: "23:07. A fita da portaria e a do vidro têm a mesma voz, gravada em duas salas ao mesmo tempo." },
            { at: 4.6, image: "empty", line: "Maya: perguntei o que ele tinha visto. Ele repetiu a minha pergunta. Daniel teria respondido.", sound: "a fita para; fica só o ruído da sala" }
        ]
    }
];

// Simulation-time sequencer. Never mutates movement, objectives, inventory or saves.
export class HorrorDirector {
    constructor(view, audio, ui) {
        this.view = view;
        this.audio = audio;
        this.ui = ui;
        this.seen = new Set();
        this.active = null;
        this.visible = false;
        this.playing = false;
    }
    get quietWindow() {
        return Boolean(this.playing && this.active?.elapsed < (this.active?.scene.quietUntil ?? -Infinity));
    }
    reset() {
        this.stop();
        this.seen.clear();
    }
    stop() {
        this.active = null;
        this.playing = false;
        this.hide();
    }
    hide() {
        if (this.visible) this.view.hide();
        this.visible = false;
    }
    update(dt, stage, position, checkpoint, objective, allowed, settings) {
        if (this.active && this.active.scene.stage !== stage) this.stop();
        this.playing = allowed;
        if (!allowed) {
            this.hide();
            return;
        }
        if (!this.active) {
            const scene = scenes.find((candidate) => candidate.stage === stage
                && !this.seen.has(candidate.id) && candidate.when(position, checkpoint, objective));
            if (!scene) return;
            this.active = { scene, elapsed: -(scene.delay ?? 0), lastBeat: -1 };
            this.seen.add(scene.id);
        }
        const current = this.active;
        current.elapsed += Number.isFinite(dt) ? Math.max(0, dt) : 0;
        if (current.elapsed < 0) return;
        if (current.elapsed >= current.scene.duration) {
            this.stop();
            return;
        }
        let beatIndex = 0;
        while (current.scene.beats[beatIndex + 1]?.at <= current.elapsed) beatIndex++;
        const beat = current.scene.beats[beatIndex];
        const changed = beatIndex !== current.lastBeat;
        if (!this.visible || changed) {
            this.view.show(current.scene, beat, settings, changed);
            this.visible = true;
        }
        current.lastBeat = beatIndex;
        if (!changed || !beat.sound) return;
        if (settings.soundCaptions) this.ui.showSoundCaption(beat.sound, 1800);
        const gentle = settings.reducedFlashing || settings.reducedCameraShake;
        if (!beat.impact) return;
        const strength = beat.impact * (gentle ? 0.43 : 1);
        if (beat.sting && this.audio.playHorrorSting) this.audio.playHorrorSting(strength);
        else this.audio.impact(strength);
    }
}

export function createHorrorTapeView(root) {
    const element = document.createElement("aside");
    element.className = "ww-horror-tape";
    element.hidden = true;
    element.setAttribute("aria-label", "Gravação do Wonder World");
    element.innerHTML = `
      <div class="ww-horror-tape-label"></div>
      <div class="ww-horror-tape-picture" aria-hidden="true">
        <svg viewBox="0 0 400 174" preserveAspectRatio="none">
          <path class="ww-horror-room" d="M0 0h400v174H0z M0 0l123 37h151L400 0 M0 174l123-43h151l126 43 M123 37v94m151-94v94 M205 38v93"/>
          <path class="ww-horror-counter" d="M31 124l66-23h200l70 23v34H31z M88 125h221m-167 6v19m117-19v19"/>
          <path class="ww-horror-door" d="M152 126V45h98v81h-20V64h-58v62z"/>
          <g class="ww-horror-glass">
            <path class="ww-horror-glass-frame" d="M112 26h239v121H112z M124 36h215v102H124z M184 36v102m96-102v102 M118 143h228"/>
            <path class="ww-horror-glass-scratches" d="m133 68 34-25m-27 39 50-37m98 74 43-38m-35 51 34-31 M240 43l-8 24 4 13-10 18 2 14-9 22"/>
          </g>
          <g class="ww-horror-reflection">
            <path class="ww-horror-reflection-body" d="M204 143l6-23 11-13 19-7 4-9q-11-9-13-32l7-14 15-5 18 5 7 16-2 8 7 13-12 6-2 13 15 5 17 25 3 12zm75-18 9-6 22 6 5-15 1-9 5 2 2 10 3-9 4 1-1 10 6-7 3 3-6 10 2 3-13 10-12 1z"/>
            <path class="ww-horror-reflection-detail" d="M244 64q7-7 15 0m4 3 8 0m-23 15 17 3m-19 19 14 12 9-15"/>
          </g>
          <g class="ww-horror-shape">
            <path class="ww-horror-shell" d="M130 171c-4-20 7-35 30-38l9-9c-19-14-23-38-21-58l-8-27 14-18 24 8 48-2 22-10 18 12-4 42c0 25-6 42-23 53l9 11c21 6 30 18 29 36z"/>
            <path class="ww-horror-seam" d="m197 37 5 15-8 17 13 16-4 15m-31 10 19 6 34-4m-18 1v13m-28-12v7m53-9v9"/>
            <path class="ww-horror-eyes" d="M164 74q13-8 20 1l-4 10-15-1zm55 1q13-10 20-1v10l-16 1z"/>
          </g>
        </svg>
        <span class="ww-horror-tape-rec">▶ PLAY</span>
      </div>
      <p class="ww-horror-tape-transcript" aria-live="polite"></p>`;
    const label = element.querySelector(".ww-horror-tape-label");
    const transcript = element.querySelector(".ww-horror-tape-transcript");
    root.append(element);
    return {
        show(scene, beat, settings, animate = true) {
            element.dataset.scene = scene.id;
            element.dataset.look = scene.look;
            element.dataset.image = beat.image;
            element.dataset.animate = String(animate);
            element.dataset.calm = String(Boolean(settings.reducedFlashing || settings.reducedCameraShake));
            label.textContent = scene.label;
            transcript.textContent = beat.line;
            element.hidden = false;
        },
        hide() { element.hidden = true; }
    };
}

