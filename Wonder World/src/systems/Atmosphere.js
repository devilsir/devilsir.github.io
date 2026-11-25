const samples = {
    drips: new URL("../../assets/atmosphere/drips.mp3", import.meta.url).href,
    steps: new URL("../../assets/atmosphere/steps.mp3", import.meta.url).href,
    metal: new URL("../../assets/atmosphere/metal.mp3", import.meta.url).href,
    machine: new URL("../../assets/atmosphere/machine.mp3", import.meta.url).href,
    sting: new URL("../../assets/atmosphere/sting.mp3", import.meta.url).href,
};

const cue = (name, x, y, z, gain, filter, caption) => ({ name, x, y, z, gain, filter, caption });
const zones = {
    chapter1: [
        { low: 35, high: 73, cues: [
            cue("steps", 7, 1, 56, .39, 1120, "passos abafados atrás da portaria"),
            cue("metal", -12, 1, 69, .22, 1450, "alguma coisa cai à distância"),
        ] },
        { low: 74, high: 128, bed: true, cues: [
            cue("drips", -18, 3, 96, .24, 3200, "água pinga na manutenção"),
            cue("metal", -27, 1, 106, .30, 1500, "metal bate do outro lado da sala"),
            cue("steps", -9, 1, 105, .39, 1120, "passos abafados do outro lado da parede"),
        ] },
    ],
    chapter2: [
        { low: 214, high: 366, bed: true, cues: [
            cue("steps", 3, 1, 243, .39, 1120, "passos afastados no corredor"),
            cue("metal", -15, 1, 309, .30, 1700, "uma peça de metal cai longe"),
            cue("drips", 7, 3, 347, .22, 2700, "água pinga de um cano"),
        ] },
    ],
    chapter3: [
        { low: 743, high: 953, bed: true, cues: [
            cue("drips", -12, 3, 778, .24, 3100, "gotas no corredor de serviço"),
            cue("metal", 14, 1, 821, .24, 1300, "um objeto cai atrás da divisória"),
            cue("drips", -14, 3, 859, .23, 2900, "água pinga junto às tubulações"),
            cue("steps", 9, 1, 937, .39, 1120, "passos abafados além da porta"),
        ] },
    ],
    chapter4: [
        { low: 1050, high: 1177, cues: [
            cue("drips", 4, 2, 1067, .26, 3200, "gotas pingam no bloco de celas"),
            cue("metal", -13, 1, 1118, .22, 1100, "um objeto cai atrás da parede"),
            cue("steps", 12, 1, 1153, .39, 1120, "passos no posto à distância"),
        ] },
        { low: 1404, high: 1444, cues: [
            cue("metal", 8, 1, 1429, .23, 1550, "uma peça cai no corredor dos arquivos"),
        ] },
    ],
    chapter5: [
        { low: 1495, high: 1652, bed: true, cues: [
            cue("steps", 6, 1, 1536, .39, 1120, "passos abafados no corredor do arquivo"),
            cue("metal", -11, 1, 1574, .27, 1500, "um objeto cai atrás das estantes"),
            cue("drips", 9, 4, 1620, .20, 2700, "água pinga acima das estantes"),
        ] },
    ],
};
const distance2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2;

export function atmosphereZone(stage, position) {
    return zones[stage]?.find(zone => position.z >= zone.low && position.z <= zone.high) ?? null;
}

// A single local recording bed and a single spatial event at a time. Fetch
// and decode are cached, and resolution of a late fetch cannot play after a pause.
export class Atmosphere {
    buffers = new Map();
    zone = null;
    epoch = 0;
    clock = 0;
    last = null;
    bed = null;
    loadingBed = false;
    active = null;
    sting = null;
    watching = false;
    stingEpoch = 0;

    constructor(random = Math.random, fetcher = (...args) => fetch(...args)) {
        this.random = random;
        this.fetcher = fetcher;
    }

    load(name, context) {
        if (!this.buffers.has(name)) {
            this.buffers.set(name, Promise.resolve().then(() => this.fetcher(samples[name]))
                .then(response => {
                    if (!response.ok) throw Error("atmosphere sample unavailable");
                    return response.arrayBuffer();
                })
                .then(data => context.decodeAudioData(data)).catch(() => null));
        }
        return this.buffers.get(name);
    }

    clearZone() {
        this.epoch++;
        this.zone = null;
        this.loadingBed = false;
        this.last = null;
        this.close(this.bed);
        this.close(this.active);
        this.bed = this.active = null;
    }

    reset() {
        this.clearZone();
        this.watching = false;
        this.stingEpoch++;
        this.close(this.sting);
        this.sting = null;
    }

    update(dt, stage, position, mode, context, output, caption) {
        this.watching = mode !== "off";
        if (!this.watching && this.sting) {
            this.close(this.sting);
            this.sting = null;
        }
        if (this.watching && ["chapter1", "chapter4"].includes(stage)) this.load("sting", context);
        const zone = mode === "normal" ? atmosphereZone(stage, position) : null;
        if (zone !== this.zone) {
            this.clearZone();
            this.zone = zone;
            this.clock = 1.7 + this.random() * 2.5;
        }
        if (!zone) return;
        const epoch = this.epoch;
        if (zone.bed && !this.bed && !this.loadingBed) {
            this.loadingBed = true;
            this.load("machine", context).then(buffer => {
                if (epoch !== this.epoch || !buffer || context.state !== "running") return;
                this.bed = this.voice(context, output, buffer, { gain: .12, filter: 985 }, true);
            });
        }
        this.clock -= Number.isFinite(dt) ? Math.max(0, dt) : 0;
        if (this.clock > 0 || this.active) return;
        const nearby = zone.cues.filter(item => distance2(item, position) < 30 ** 2);
        const fresh = nearby.filter(item => item !== this.last);
        const choices = fresh.length ? fresh : nearby;
        const item = choices[Math.floor(this.random() * choices.length)];
        this.clock = item ? 7.5 + this.random() * 10 : 1.4;
        if (!item) return;
        this.last = item;
        this.load(item.name, context).then(buffer => {
            if (epoch !== this.epoch || !buffer || this.active || context.state !== "running") return;
            const voice = this.voice(context, output, buffer, item, false, true);
            this.active = voice;
            voice.source.onended = () => {
                this.close(voice, false);
                if (this.active === voice) this.active = null;
            };
            caption?.(item.caption);
        });
    }

    async playSting(strength, context, output) {
        const requestTime = context.currentTime;
        const requestEpoch = this.stingEpoch;
        const buffer = await this.load("sting", context);
        if (requestEpoch !== this.stingEpoch || !this.watching || !buffer || this.sting || context.state !== "running" || context.currentTime - requestTime > .32) return;
        const gain = Math.max(0, Math.min(.44, strength * .52));
        if (!gain) return;
        const voice = this.voice(context, output, buffer, { gain, filter: 4600 }, false);
        this.sting = voice;
        voice.source.onended = () => {
            this.close(voice, false);
            if (this.sting === voice) this.sting = null;
        };
    }

    voice(context, output, buffer, spec, loop, spatial = false) {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = loop;
        if (spatial) source.playbackRate.value = .92 + this.random() * .14;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = spec.filter;
        filter.Q.value = .18;
        const gain = context.createGain();
        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(spec.gain, context.currentTime + (loop ? .65 : .012));
        source.connect(filter).connect(gain);
        const nodes = [source, filter, gain];
        if (spatial) {
            // Equal-power 3D panning without HRTF convolution.
            const panner = context.createPanner();
            panner.panningModel = "equalpower";
            panner.distanceModel = "inverse";
            panner.refDistance = 6;
            panner.maxDistance = 30;
            panner.rolloffFactor = .87;
            panner.positionX.value = spec.x;
            panner.positionY.value = spec.y;
            panner.positionZ.value = spec.z;
            gain.connect(panner).connect(output);
            nodes.push(panner);
        } else {
            gain.connect(output);
        }
        source.start();
        return { source, nodes };
    }

    close(voice, stop = true) {
        if (!voice) return;
        voice.source.onended = null;
        if (stop) voice.source.stop();
        for (const node of voice.nodes) node.disconnect();
    }
}
