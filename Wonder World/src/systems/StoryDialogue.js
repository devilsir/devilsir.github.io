// Serializes essential story beats using game time, not independent browser timers.
export class StoryDialogue {
    queue = [];
    current = null;
    remainingMs = 0;
    suspended = false;

    constructor(show, hide) {
        this.show = show;
        this.hide = hide;
    }

    enqueue(beats, after) {
        this.queue.push(...beats);
        if (after) this.queue.push(after);
        if (!this.current) this.update(0);
    }

    update(dt) {
        if (this.suspended) return;
        if (this.current) {
            this.remainingMs -= Math.max(0, dt) * 1000;
            if (this.remainingMs > 0.001) return;
            this.current = null;
            this.hide();
        }
        while (this.queue.length) {
            const next = this.queue.shift();
            if (typeof next === "function") {
                next();
                if (this.current) return;
                continue;
            }
            this.current = next;
            const [speaker, text, duration, onShow] = next;
            this.remainingMs = duration;
            this.show(speaker, text);
            onShow?.();
            return;
        }
    }

    suspend(suspended) {
        if (this.suspended === suspended) return;
        this.suspended = suspended;
        if (!this.current) {
            if (!suspended) this.update(0);
            return;
        }
        if (suspended) this.hide();
        else this.show(this.current[0], this.current[1]);
    }

    clear() {
        if (this.current && !this.suspended) this.hide();
        this.queue.length = 0;
        this.current = null;
        this.remainingMs = 0;
        this.suspended = false;
    }
}
