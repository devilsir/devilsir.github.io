export function readCampaignTiming(save) {
    const seconds = save?.campaignPlaySeconds;
    const valid = typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0;
    return { seconds: valid ? seconds : 0, complete: valid && save.campaignPlayTimeComplete === true };
}

// Counts foreground play using monotonic time, independently of FPS and simulated delta.
export class CampaignClock {
    seconds = 0;
    complete = true;
    started = false;
    last = null;
    frozen = false;

    start(now) {
        this.seconds = 0;
        this.complete = true;
        this.started = true;
        this.frozen = false;
        this.last = now;
    }

    restore(timing, frozen = false) {
        this.seconds = timing.seconds;
        this.complete = timing.complete;
        this.started = true;
        this.frozen = frozen;
        this.last = null;
    }

    sample(now, eligible) {
        if (!this.started || this.frozen || !Number.isFinite(now)) return;
        if (this.last !== null && now >= this.last) this.seconds += (now - this.last) / 1000;
        this.last = eligible ? now : null;
    }

    snapshot(now, frozen = false) {
        if (frozen && !this.frozen) {
            this.sample(now, false);
            this.frozen = true;
        }
        const pending = this.last === null || !Number.isFinite(now) ? 0 : Math.max(0, now - this.last) / 1000;
        return { seconds: this.seconds + pending, complete: this.complete };
    }
}
