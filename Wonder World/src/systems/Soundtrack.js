const tracks = {
    factory: { url: new URL("../../assets/atmosphere/factory.mp3", import.meta.url).href, gain: 0.27 },
    chase: { url: new URL("../../assets/atmosphere/chase.mp3", import.meta.url).href, gain: 0.37 },
    dread: { url: new URL("../../assets/soundtrack/dread.mp3", import.meta.url).href, gain: 0.36 },
    dream: { url: new URL("../../assets/soundtrack/dream.mp3", import.meta.url).href, gain: 0.32 },
    pursuit: { url: new URL("../../assets/soundtrack/pursuit.mp3", import.meta.url).href, gain: 0.44 },
};
const FADE_SECONDS = 1.1;

// Only the current and incoming/fading files are streamed, locally. No score is
// fetched on startup or until the browser has unlocked the game's audio.
export class Soundtrack {
    current = null;
    pending = null;
    outgoing = null;
    retireTimer = null;

    update(mood, context, output) {
        if (this.pending?.mood === mood)
            return;
        if (this.pending) {
            this.dispose(this.pending);
            this.pending = null;
        }
        if (this.current?.mood === mood)
            return;
        if (mood === null) {
            if (this.current)
                this.retire(this.current, context);
            this.current = null;
            return;
        }
        const track = Object.hasOwn(tracks, mood) ? tracks[mood] : null;
        if (!track)
            return;
        this.releaseOutgoing();
        const element = new Audio();
        element.loop = true;
        element.preload = "none";
        const source = context.createMediaElementSource(element);
        const gain = context.createGain();
        gain.gain.value = 0;
        source.connect(gain).connect(output);
        const next = { mood, element, source, gain };
        this.pending = next;
        element.src = track.url;
        element.play().then(() => {
            if (this.pending !== next)
                return;
            this.pending = null;
            if (this.current)
                this.retire(this.current, context);
            this.current = next;
            this.fade(next.gain.gain, track.gain, context.currentTime);
        }, () => {
            if (this.pending !== next)
                return;
            this.pending = null;
            this.dispose(next);
        });
    }

    fade(parameter, target, now) {
        if (typeof parameter.cancelAndHoldAtTime === "function") {
            parameter.cancelAndHoldAtTime(now);
        } else {
            const current = parameter.value;
            parameter.cancelScheduledValues(now);
            parameter.setValueAtTime(current, now);
        }
        parameter.linearRampToValueAtTime(target, now + FADE_SECONDS);
    }

    retire(track, context) {
        this.releaseOutgoing();
        this.outgoing = track;
        this.fade(track.gain.gain, 0, context.currentTime);
        this.retireTimer = setTimeout(() => this.releaseOutgoing(), FADE_SECONDS * 1000 + 50);
    }

    releaseOutgoing() {
        if (this.retireTimer !== null)
            clearTimeout(this.retireTimer);
        this.retireTimer = null;
        if (this.outgoing)
            this.dispose(this.outgoing);
        this.outgoing = null;
    }

    dispose(track) {
        track.element.pause();
        track.element.removeAttribute("src");
        track.element.load();
        track.source.disconnect();
        track.gain.disconnect();
    }

    stop() {
        this.releaseOutgoing();
        if (this.pending)
            this.dispose(this.pending);
        if (this.current)
            this.dispose(this.current);
        this.pending = null;
        this.current = null;
    }
}
