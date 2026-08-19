import * as THREE from '../vendor/three.module.js';

export class AnimationController {
  constructor(root, clips, onSound = () => {}) {
    this.root = root;
    this.mixer = new THREE.AnimationMixer(root);
    this.actions = new Map();
    this.currentName = null;
    this.currentAction = null;
    this.sequenceToken = 0;
    this.onSound = onSound;

    clips.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      action.enabled = true;
      action.clampWhenFinished = true;
      this.actions.set(clip.name, action);
    });
  }

  has(name) { return this.actions.has(name); }

  list() {
    return [...this.actions.entries()]
      .map(([name, action]) => ({ name, duration: Number(action.getClip()?.duration) || 0 }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  play(name, { fade = 0.28, loop = true, timeScale = 1, force = false } = {}) {
    const next = this.actions.get(name);
    if (!next) return null;
    if (!force && this.currentName === name && next.isRunning()) return next;

    this.sequenceToken += 1;
    next.enabled = true;
    next.setEffectiveTimeScale(timeScale);
    next.setEffectiveWeight(1);
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    next.clampWhenFinished = !loop;
    next.reset();
    next.play();

    if (this.currentAction && this.currentAction !== next) {
      this.currentAction.crossFadeTo(next, fade, false);
    } else {
      next.fadeIn(fade);
    }

    this.currentAction = next;
    this.currentName = name;
    return next;
  }

  async playOnce(name, options = {}) {
    const action = this.play(name, { ...options, loop: false, force: true });
    if (!action) return;
    const token = this.sequenceToken;
    await new Promise((resolve) => {
      const handler = (event) => {
        if (event.action !== action) return;
        this.mixer.removeEventListener('finished', handler);
        resolve();
      };
      this.mixer.addEventListener('finished', handler);
    });
    return token === this.sequenceToken;
  }

  async jumpSequence() {
    const token = ++this.sequenceToken;
    this.onSound('jump');
    if (this.has('jump_start')) await this.playOnceInternal('jump_start', token, 0.12);
    if (token !== this.sequenceToken) return;
    if (this.has('jump')) await this.playOnceInternal('jump', token, 0.12, 1.25);
    if (token !== this.sequenceToken) return;
    if (this.has('jump_fall')) await this.playOnceInternal('jump_fall', token, 0.1, 1.35);
    if (token !== this.sequenceToken) return;
    if (this.has('jump_end')) await this.playOnceInternal('jump_end', token, 0.08, 1.15);
    if (token !== this.sequenceToken) return;
    this.onSound('land');
    this.play('idle', { fade: 0.22, force: true });
  }

  playOnceInternal(name, token, fade, timeScale = 1) {
    const action = this.actions.get(name);
    if (!action) return Promise.resolve();
    action.enabled = true;
    action.setEffectiveTimeScale(timeScale);
    action.setEffectiveWeight(1);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.reset().play();
    if (this.currentAction && this.currentAction !== action) this.currentAction.crossFadeTo(action, fade, false);
    this.currentAction = action;
    this.currentName = name;
    return new Promise((resolve) => {
      const handler = (event) => {
        if (event.action !== action) return;
        this.mixer.removeEventListener('finished', handler);
        resolve(token === this.sequenceToken);
      };
      this.mixer.addEventListener('finished', handler);
    });
  }

  update(delta) { this.mixer.update(delta); }

  stop() {
    this.sequenceToken += 1;
    this.mixer.stopAllAction();
    this.currentAction = null;
    this.currentName = null;
  }

  dispose() {
    this.stop();
    this.actions.forEach((action) => this.mixer.uncacheAction(action.getClip(), this.root));
    this.mixer.uncacheRoot(this.root);
    this.actions.clear();
  }
}
