import * as THREE from '../vendor/three.module.js';
globalThis.THREE = THREE;

import { MINIGAMES, PETS } from './config.js';
import { clamp, randomBetween, wait } from './utils.js';

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
};

export class MinigameManager {
  constructor({ root, scene, store, audio, onComplete, onCaption }) {
    this.root = root;
    this.scene = scene;
    this.store = store;
    this.audio = audio;
    this.onComplete = onComplete;
    this.onCaption = onCaption;
    this.active = null;
    this.cleanups = [];
  }

  getGame(id) { return MINIGAMES.find((game) => game.id === id); }

  async start(id) {
    this.stop();
    const game = this.getGame(id);
    if (!game) return;
    this.active = { id, game, score: 0, completed: false, metrics: {} };
    this.root.innerHTML = '';
    this.root.dataset.game = id;
    this.root.classList.remove('is-complete');
    const intro = document.createElement('div');
    intro.className = 'game-intro';
    intro.innerHTML = `
      <span class="game-intro-kicker">${game.type || 'Quick activity'}</span>
      <strong>${game.name}</strong>
      <span>${game.description}</span>
      <small>${game.controls || 'Mouse, keyboard, or touch'}</small>
    `;
    this.root.append(intro);
    await wait(this.store.settings.reducedMotion ? 180 : 650);
    intro.remove();
    if (!this.active || this.active.id !== id) return;
    const handler = this[`run_${id}`]?.bind(this);
    if (handler) await handler();
  }

  flushCleanups() {
    this.cleanups.splice(0).forEach((cleanup) => {
      try { cleanup(); } catch {}
    });
  }

  stop() {
    this.flushCleanups();
    this.active = null;
    this.root.innerHTML = '';
    this.root.removeAttribute('data-game');
    this.root.classList.remove('is-complete');
    this.scene.playAnimation('idle', { fade: 0.25, force: true });
  }

  register(cleanup) { this.cleanups.push(cleanup); }

  schedule(callback, milliseconds) {
    const timeout = setTimeout(callback, milliseconds);
    this.register(() => clearTimeout(timeout));
    return timeout;
  }

  complete(success = true, options = {}) {
    if (!this.active || this.active.completed) return;
    this.active.completed = true;
    this.flushCleanups();
    this.root.classList.add('is-complete');
    const { game, id } = this.active;
    const personality = PETS[this.store.active.companionId]?.modifiers || {};
    const personalityMultiplier = id === 'obstacle' ? personality.obstacle || 1 : 1;
    const bonus = Number(options.bonus) || 0;
    const rating = clamp(Number(options.rating) || (success ? 2 : 1), 1, 3);
    const currency = success
      ? Math.round((game.reward + bonus + rating * 2) * personalityMultiplier)
      : Math.round(game.reward * 0.35);
    const xp = success
      ? Math.round((game.xp + rating * 2) * personalityMultiplier)
      : Math.round(game.xp * 0.4);

    this.store.modifyStats({
      happiness: success ? 12 + rating : 5,
      energy: success ? -5 : -3,
      bond: success ? 3 + rating * 0.35 : 1.2,
      hygiene: -1.1
    }, `game-${id}`);
    this.store.gainProgress(xp, currency);
    this.store.track('play');
    if (!this.store.active.achievements.includes('first-game')) this.store.active.achievements.push('first-game');
    if (id === 'hidden' && success) this.store.track('play-hidden');
    this.scene.spawnParticles(success ? 'star' : 'heart', success ? 10 + rating * 2 : 5);
    this.audio.play(success ? 'positive' : 'toy', { rate: success ? 0.96 + rating * 0.06 : 0.8 });
    if (success) this.scene.triggerJump();
    else this.scene.playAnimation('idle', { fade: 0.25, force: true });
    this.onComplete?.({ success, currency, xp, game, rating, detail: options.detail || '' });
  }

  createHud(instruction, durationSeconds = 30) {
    const hud = document.createElement('div');
    hud.className = 'game-hud';
    hud.innerHTML = `
      <span class="game-instruction">${instruction}</span>
      <span class="game-status" aria-live="polite"></span>
      <span class="game-score">0</span>
      <span class="game-timer">${durationSeconds}</span>
    `;
    this.root.append(hud);
    return {
      hud,
      instruction: hud.querySelector('.game-instruction'),
      status: hud.querySelector('.game-status'),
      score: hud.querySelector('.game-score'),
      timer: hud.querySelector('.game-timer')
    };
  }

  runTimer(seconds, onEnd, timerElement) {
    const startedAt = performance.now();
    let lastShown = seconds;
    timerElement.textContent = String(seconds);
    const interval = setInterval(() => {
      if (!this.active || this.active.completed) return;
      const remaining = Math.max(0, seconds - (performance.now() - startedAt) / 1000);
      const shown = Math.ceil(remaining);
      if (shown !== lastShown) {
        lastShown = shown;
        timerElement.textContent = String(shown);
        timerElement.classList.toggle('is-urgent', shown <= 5);
      }
      if (remaining <= 0) onEnd();
    }, 100);
    this.register(() => clearInterval(interval));
  }

  async run_chase() {
    const simplified = this.store.settings.simplifiedGames;
    const targetHits = simplified ? 8 : 12;
    const { score, timer, status } = this.createHud(`Catch the glowing toy ${targetHits} times`, 28);
    const arena = document.createElement('div');
    arena.className = 'toy-dash-arena';
    this.root.append(arena);
    const targets = Array.from({ length: simplified ? 2 : 3 }, (_, index) => {
      const target = document.createElement('button');
      target.type = 'button';
      target.className = 'toy-dash-target';
      target.setAttribute('aria-label', `Toy ${index + 1}`);
      target.innerHTML = '<span></span>';
      arena.append(target);
      return target;
    });
    let realIndex = 0;
    let hits = 0;
    let misses = 0;
    let combo = 0;
    let bestCombo = 0;
    let roundResolved = true;
    let roundTimeout = null;

    const refresh = () => {
      if (!this.active || this.active.completed) return;
      if (!roundResolved) {
        misses += 1;
        combo = 0;
        if (misses >= 4) {
          this.complete(false, { detail: `${hits} toys caught` });
          return;
        }
      }
      roundResolved = false;
      realIndex = Math.floor(Math.random() * targets.length);
      const positions = shuffle([
        [12, 24], [45, 18], [76, 25], [18, 62], [49, 67], [78, 60]
      ]);
      targets.forEach((target, index) => {
        target.classList.toggle('is-real', index === realIndex);
        target.classList.toggle('is-decoy', index !== realIndex);
        target.style.left = `${positions[index][0]}%`;
        target.style.top = `${positions[index][1]}%`;
      });
      status.textContent = combo > 1 ? `Combo ×${combo}` : `${Math.max(0, 4 - misses)} lives`;
      clearTimeout(roundTimeout);
      roundTimeout = setTimeout(refresh, simplified ? 1550 : 1200);
    };
    this.register(() => clearTimeout(roundTimeout));

    const onHit = (event) => {
      const index = targets.indexOf(event.currentTarget);
      if (!this.active || this.active.completed || roundResolved) return;
      roundResolved = true;
      clearTimeout(roundTimeout);
      if (index === realIndex) {
        hits += 1;
        combo += 1;
        bestCombo = Math.max(bestCombo, combo);
        event.currentTarget.classList.add('is-hit');
        this.audio.play('toy', { rate: 0.95 + combo * 0.03, volume: 0.65 });
        this.scene.moveTo(randomBetween(-3.3, 3.3), randomBetween(-1.7, 1.7), true);
        if (combo % 4 === 0) this.scene.triggerJump();
      } else {
        misses += 1;
        combo = 0;
        event.currentTarget.classList.add('is-wrong');
        this.audio.play('land', { rate: 0.75, volume: 0.5 });
      }
      score.textContent = `${hits}/${targetHits}`;
      status.textContent = combo > 1 ? `Combo ×${combo}` : `${Math.max(0, 4 - misses)} lives`;
      this.schedule(() => event.currentTarget.classList.remove('is-hit', 'is-wrong'), 180);
      if (hits >= targetHits) {
        this.complete(true, { bonus: bestCombo, rating: misses === 0 ? 3 : misses <= 2 ? 2 : 1, detail: `Best combo ×${bestCombo}` });
      } else if (misses >= 4) {
        this.complete(false, { detail: `${hits} toys caught` });
      } else {
        this.schedule(refresh, 220);
      }
    };

    targets.forEach((target) => {
      target.addEventListener('pointerdown', onHit);
      this.register(() => target.removeEventListener('pointerdown', onHit));
    });
    this.runTimer(28, () => this.complete(hits >= targetHits, {
      bonus: bestCombo,
      rating: hits >= targetHits ? (misses <= 1 ? 3 : 2) : 1,
      detail: `Best combo ×${bestCombo}`
    }), timer);
    this.scene.playAnimation('run', { fade: 0.24, force: true });
    score.textContent = `0/${targetHits}`;
    refresh();
  }

  async run_stars() {
    const simplified = this.store.settings.simplifiedGames;
    const targetScore = simplified ? 14 : 22;
    const { score, timer, status } = this.createHud(`Scoop ${targetScore} points of starlight`, 32);
    const field = document.createElement('div');
    field.className = 'star-scoop-field';
    field.tabIndex = 0;
    field.innerHTML = '<div class="star-scoop-sky"></div><div class="star-catcher"><span></span></div>';
    this.root.append(field);
    const catcher = field.querySelector('.star-catcher');
    let catcherX = 50;
    let targetX = 50;
    let points = 0;
    let lives = 3;
    let combo = 0;
    let bestCombo = 0;
    let lastFrame = performance.now();
    let lastSpawn = 0;
    const objects = [];

    const updateHud = () => {
      score.textContent = `${points}/${targetScore}`;
      status.textContent = `${'●'.repeat(lives)}${'○'.repeat(3 - lives)}${combo > 1 ? ` · ×${combo}` : ''}`;
    };

    const spawn = () => {
      const dangerChance = simplified ? 0.12 : 0.2;
      const roll = Math.random();
      const type = roll < dangerChance ? 'cloud' : roll > 0.9 ? 'gold' : 'star';
      const element = document.createElement('div');
      element.className = `scoop-object is-${type}`;
      element.setAttribute('aria-hidden', 'true');
      element.innerHTML = '<span></span>';
      field.append(element);
      objects.push({
        element,
        type,
        x: randomBetween(7, 93),
        y: -8,
        speed: randomBetween(simplified ? 35 : 44, simplified ? 52 : 68),
        sway: randomBetween(-8, 8),
        phase: randomBetween(0, Math.PI * 2)
      });
    };

    const movePointer = (event) => {
      const rect = field.getBoundingClientRect();
      targetX = clamp(((event.clientX - rect.left) / rect.width) * 100, 8, 92);
    };
    const keyDown = (event) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') targetX = clamp(targetX - 10, 8, 92);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') targetX = clamp(targetX + 10, 8, 92);
    };
    field.addEventListener('pointermove', movePointer);
    window.addEventListener('keydown', keyDown);
    this.register(() => field.removeEventListener('pointermove', movePointer));
    this.register(() => window.removeEventListener('keydown', keyDown));

    const frame = (now) => {
      if (!this.active || this.active.completed) return;
      const delta = Math.min(0.034, (now - lastFrame) / 1000);
      lastFrame = now;
      catcherX += (targetX - catcherX) * Math.min(1, delta * 12);
      catcher.style.left = `${catcherX}%`;
      if (now - lastSpawn > (simplified ? 720 : 520)) {
        lastSpawn = now;
        spawn();
      }
      for (let index = objects.length - 1; index >= 0; index -= 1) {
        const object = objects[index];
        object.y += object.speed * delta;
        const x = object.x + Math.sin(now * 0.002 + object.phase) * object.sway;
        object.element.style.left = `${x}%`;
        object.element.style.top = `${object.y}%`;
        object.element.style.transform = `rotate(${object.y * 2}deg)`;
        if (object.y >= 78 && object.y <= 94 && Math.abs(x - catcherX) < 8) {
          if (object.type === 'cloud') {
            lives -= 1;
            combo = 0;
            field.classList.add('is-storm-hit');
            this.schedule(() => field.classList.remove('is-storm-hit'), 220);
            this.audio.play('land', { rate: 0.68, volume: 0.55 });
          } else {
            const value = object.type === 'gold' ? 3 : 1;
            points += value;
            combo += 1;
            bestCombo = Math.max(bestCombo, combo);
            this.audio.play('positive', { rate: object.type === 'gold' ? 1.3 : 1.08 + combo * 0.01, volume: 0.45 });
            if (combo % 6 === 0) this.scene.triggerJump();
          }
          object.element.remove();
          objects.splice(index, 1);
          updateHud();
          if (points >= targetScore) {
            this.complete(true, { bonus: bestCombo + lives, rating: lives === 3 ? 3 : lives === 2 ? 2 : 1, detail: `Best combo ×${bestCombo}` });
            return;
          }
          if (lives <= 0) {
            this.complete(false, { detail: `${points} starlight points` });
            return;
          }
        } else if (object.y > 112) {
          if (object.type !== 'cloud') combo = 0;
          object.element.remove();
          objects.splice(index, 1);
          updateHud();
        }
      }
      frameId = requestAnimationFrame(frame);
    };
    let frameId = requestAnimationFrame(frame);
    this.register(() => cancelAnimationFrame(frameId));
    this.runTimer(32, () => this.complete(points >= targetScore, {
      bonus: bestCombo,
      rating: points >= targetScore ? (lives === 3 ? 3 : 2) : 1,
      detail: `${points} starlight points`
    }), timer);
    this.scene.playAnimation('run', { fade: 0.25, force: true });
    updateHud();
  }

  async run_light() {
    const simplified = this.store.settings.simplifiedGames;
    const roundsNeeded = simplified ? 4 : 6;
    const { score, timer, status, instruction } = this.createHud('Watch the lanterns, then repeat the trail', 42);
    const board = document.createElement('div');
    board.className = 'lantern-board';
    const colors = ['sun', 'mint', 'rose', 'violet'];
    const buttons = colors.map((color, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `lantern-pad is-${color}`;
      button.dataset.index = String(index);
      button.setAttribute('aria-label', `${color} lantern`);
      button.innerHTML = '<span></span>';
      board.append(button);
      return button;
    });
    this.root.append(board);
    const sequence = [];
    let inputIndex = 0;
    let rounds = 0;
    let lives = 3;
    let acceptingInput = false;

    const updateHud = () => {
      score.textContent = `${rounds}/${roundsNeeded}`;
      status.textContent = `${'●'.repeat(lives)}${'○'.repeat(3 - lives)}`;
    };
    const flash = async (index, user = false) => {
      const button = buttons[index];
      button.classList.add(user ? 'is-user-lit' : 'is-lit');
      this.audio.play(user ? 'positive' : 'click', { rate: 0.8 + index * 0.13, volume: user ? 0.38 : 0.42 });
      await wait(this.store.settings.reducedMotion ? 180 : 320);
      button.classList.remove('is-user-lit', 'is-lit');
      await wait(this.store.settings.reducedMotion ? 60 : 120);
    };
    const presentSequence = async () => {
      acceptingInput = false;
      inputIndex = 0;
      instruction.textContent = 'Watch carefully…';
      board.classList.add('is-presenting');
      await wait(320);
      for (const index of sequence) {
        if (!this.active || this.active.completed) return;
        await flash(index, false);
      }
      board.classList.remove('is-presenting');
      instruction.textContent = 'Your turn — repeat the trail';
      acceptingInput = true;
    };
    const nextRound = async () => {
      sequence.push(Math.floor(Math.random() * buttons.length));
      await presentSequence();
    };
    const clickPad = async (event) => {
      if (!acceptingInput || !this.active || this.active.completed) return;
      const index = Number(event.currentTarget.dataset.index);
      acceptingInput = false;
      await flash(index, true);
      if (index !== sequence[inputIndex]) {
        lives -= 1;
        board.classList.add('is-error');
        this.audio.play('land', { rate: 0.7, volume: 0.55 });
        this.schedule(() => board.classList.remove('is-error'), 260);
        updateHud();
        if (lives <= 0) {
          this.complete(false, { detail: `${rounds} trails completed` });
          return;
        }
        instruction.textContent = 'Almost — watch that trail again';
        await wait(500);
        await presentSequence();
        return;
      }
      inputIndex += 1;
      if (inputIndex >= sequence.length) {
        rounds += 1;
        updateHud();
        this.scene.moveTo(randomBetween(-2, 2), randomBetween(-1.4, 1.4), false);
        if (rounds >= roundsNeeded) {
          this.complete(true, { bonus: lives * 2, rating: lives === 3 ? 3 : lives === 2 ? 2 : 1, detail: `${rounds} perfect trails` });
          return;
        }
        instruction.textContent = 'Trail complete! Adding one more lantern…';
        await wait(650);
        await nextRound();
      } else {
        acceptingInput = true;
      }
    };
    buttons.forEach((button) => {
      button.addEventListener('click', clickPad);
      this.register(() => button.removeEventListener('click', clickPad));
    });
    this.runTimer(42, () => this.complete(rounds >= roundsNeeded, {
      bonus: lives,
      rating: rounds >= roundsNeeded ? (lives === 3 ? 3 : 2) : 1,
      detail: `${rounds} trails completed`
    }), timer);
    updateHud();
    await nextRound();
  }

  async run_hidden() {
    const simplified = this.store.settings.simplifiedGames;
    const gridSize = simplified ? 3 : 4;
    const maxGuesses = simplified ? 6 : 7;
    const { score, timer, status, instruction } = this.createHud('Use hot-and-cold clues to find the treat', 38);
    const panel = document.createElement('div');
    panel.className = 'detective-panel';
    const clue = document.createElement('div');
    clue.className = 'detective-clue';
    clue.innerHTML = '<span class="clue-orb"></span><strong>Choose a hiding spot</strong><small>Closer guesses glow warmer.</small>';
    const grid = document.createElement('div');
    grid.className = 'detective-grid';
    grid.style.setProperty('--grid-size', gridSize);
    panel.append(clue, grid);
    this.root.append(panel);
    const answer = Math.floor(Math.random() * gridSize * gridSize);
    let guesses = 0;
    let previousDistance = null;

    const distanceToAnswer = (index) => {
      const row = Math.floor(index / gridSize);
      const column = index % gridSize;
      const answerRow = Math.floor(answer / gridSize);
      const answerColumn = answer % gridSize;
      return Math.abs(row - answerRow) + Math.abs(column - answerColumn);
    };
    const updateHud = () => {
      score.textContent = `${Math.max(0, maxGuesses - guesses)} guesses`;
      status.textContent = previousDistance === null ? '' : previousDistance === 0 ? 'Found!' : previousDistance === 1 ? 'Very hot' : previousDistance === 2 ? 'Warm' : 'Cold';
    };
    for (let index = 0; index < gridSize * gridSize; index += 1) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'detective-cell';
      card.setAttribute('aria-label', `Hiding spot ${index + 1}`);
      card.innerHTML = '<span></span>';
      card.addEventListener('click', () => {
        if (!this.active || this.active.completed || card.disabled) return;
        guesses += 1;
        card.disabled = true;
        const distance = distanceToAnswer(index);
        const trend = previousDistance === null ? '' : distance < previousDistance ? 'Getting warmer!' : distance > previousDistance ? 'Getting colder.' : 'Same distance.';
        previousDistance = distance;
        if (distance === 0) {
          card.classList.add('is-found');
          clue.className = 'detective-clue is-hot';
          clue.querySelector('strong').textContent = 'Treat found!';
          clue.querySelector('small').textContent = trend || 'Excellent detective work.';
          this.audio.play('treat');
          this.scene.moveTo(randomBetween(-1, 1), randomBetween(-1, 1), true);
          this.complete(true, {
            bonus: Math.max(0, maxGuesses - guesses) * 2,
            rating: guesses <= 2 ? 3 : guesses <= 4 ? 2 : 1,
            detail: `Found in ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}`
          });
          return;
        }
        card.classList.add(distance === 1 ? 'is-hot' : distance === 2 ? 'is-warm' : 'is-cold');
        clue.className = `detective-clue ${distance === 1 ? 'is-hot' : distance === 2 ? 'is-warm' : 'is-cold'}`;
        clue.querySelector('strong').textContent = distance === 1 ? 'Very hot!' : distance === 2 ? 'Warm…' : 'Cold trail';
        clue.querySelector('small').textContent = trend || `${distance} steps away.`;
        instruction.textContent = trend || 'Try another nearby spot';
        updateHud();
        if (guesses >= maxGuesses) {
          grid.children[answer].classList.add('is-found');
          this.complete(false, { detail: 'The treat was revealed' });
        }
      });
      grid.append(card);
    }
    this.runTimer(38, () => this.complete(false, { detail: `${guesses} clues used` }), timer);
    updateHud();
  }

  async run_rhythm() {
    const simplified = this.store.settings.simplifiedGames;
    const totalNotes = simplified ? 18 : 28;
    const beatGap = simplified ? 760 : 610;
    const travelTime = simplified ? 1900 : 1650;
    const timing = simplified
      ? { perfect: 110, early: 260, late: 280 }
      : { perfect: 75, early: 170, late: 195 };
    const duration = Math.ceil((totalNotes * beatGap + travelTime + timing.late + 850) / 1000);
    const { score, timer, status, instruction } = this.createHud('Tap the matching lane when notes reach the line', duration);
    const stage = document.createElement('div');
    stage.className = 'rhythm-stage';
    const lanes = document.createElement('div');
    lanes.className = 'rhythm-lanes';
    const hitLine = document.createElement('div');
    hitLine.className = 'rhythm-hit-line';
    const controls = document.createElement('div');
    controls.className = 'rhythm-controls';
    const laneLabels = ['A', 'S', 'K', 'L'];
    const laneButtons = laneLabels.map((label, index) => {
      const lane = document.createElement('div');
      lane.className = `rhythm-lane lane-${index}`;
      lanes.append(lane);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `rhythm-key lane-${index}`;
      button.dataset.lane = String(index);
      button.innerHTML = `<span></span><small>${label}</small>`;
      controls.append(button);
      return button;
    });
    stage.append(lanes, hitLine, controls);
    this.root.append(stage);

    const startAt = performance.now() + 900;
    const notes = [];
    for (let index = 0; index < totalNotes; index += 1) {
      let lane = Math.floor(Math.random() * 4);
      if (index > 1 && lane === notes[index - 1].lane && Math.random() > 0.55) lane = (lane + 1 + Math.floor(Math.random() * 3)) % 4;
      const note = document.createElement('div');
      note.className = `rhythm-note lane-${lane}`;
      note.innerHTML = '<span></span>';
      lanes.append(note);
      notes.push({
        lane,
        note,
        hitAt: startAt + index * beatGap + travelTime,
        spawnAt: startAt + index * beatGap,
        resolved: false
      });
    }

    let points = 0;
    let hits = 0;
    let misses = 0;
    let combo = 0;
    let bestCombo = 0;

    const updateHud = () => {
      const accuracy = hits + misses ? Math.round((hits / (hits + misses)) * 100) : 100;
      score.textContent = `${points} pts`;
      status.textContent = `×${combo} · ${accuracy}%`;
    };
    const pulseLane = (lane, className) => {
      const button = laneButtons[lane];
      button.classList.add(className);
      this.schedule(() => button.classList.remove(className), 150);
    };
    const hitLane = (lane) => {
      if (!this.active || this.active.completed) return;
      const now = performance.now();
      const candidates = notes
        .filter((entry) => {
          if (entry.resolved || entry.lane !== lane) return false;
          const delta = now - entry.hitAt;
          return delta >= -timing.early && delta <= timing.late;
        })
        .sort((a, b) => Math.abs(a.hitAt - now) - Math.abs(b.hitAt - now));
      const closest = candidates[0];
      if (!closest) {
        misses += 1;
        combo = 0;
        pulseLane(lane, 'is-miss');
        instruction.textContent = 'Wait for the note to reach the line';
        this.audio.play('land', { rate: 0.8, volume: 0.25 });
        updateHud();
        return;
      }
      closest.resolved = true;
      closest.note.classList.add('is-hit');
      const difference = Math.abs(closest.hitAt - now);
      const perfect = difference <= timing.perfect;
      points += perfect ? 120 + combo * 4 : 75 + combo * 2;
      hits += 1;
      combo += 1;
      bestCombo = Math.max(bestCombo, combo);
      pulseLane(lane, perfect ? 'is-perfect' : 'is-good');
      instruction.textContent = perfect ? 'Perfect!' : 'Good';
      this.audio.play('positive', { rate: 0.92 + lane * 0.1 + Math.min(combo, 12) * 0.01, volume: 0.38 });
      if (combo > 0 && combo % 8 === 0) this.scene.triggerJump();
      updateHud();
    };

    laneButtons.forEach((button) => {
      const handler = () => hitLane(Number(button.dataset.lane));
      button.addEventListener('pointerdown', handler);
      this.register(() => button.removeEventListener('pointerdown', handler));
    });
    const keyHandler = (event) => {
      if (event.repeat) return;
      const map = { a: 0, s: 1, k: 2, l: 3, ArrowLeft: 0, ArrowDown: 1, ArrowUp: 2, ArrowRight: 3 };
      const lane = map[event.key] ?? map[event.key.toLowerCase?.()];
      if (lane === undefined) return;
      event.preventDefault();
      hitLane(lane);
    };
    window.addEventListener('keydown', keyHandler);
    this.register(() => window.removeEventListener('keydown', keyHandler));

    let frameId = 0;
    const frame = (now) => {
      if (!this.active || this.active.completed) return;
      const lanesRect = lanes.getBoundingClientRect();
      const lineRect = hitLine.getBoundingClientRect();
      const startY = -24;
      const targetY = lineRect.top + lineRect.height * 0.5 - lanesRect.top;
      const endY = lanesRect.height + 26;

      for (const entry of notes) {
        if (entry.resolved) continue;
        if (now < entry.spawnAt) {
          entry.note.style.opacity = '0';
          continue;
        }
        entry.note.style.opacity = '1';
        if (now <= entry.hitAt) {
          const progress = clamp((now - entry.spawnAt) / travelTime, 0, 1);
          entry.note.style.top = `${startY + (targetY - startY) * progress}px`;
        } else {
          const after = clamp((now - entry.hitAt) / Math.max(1, timing.late + 210), 0, 1);
          entry.note.style.top = `${targetY + (endY - targetY) * after}px`;
        }
        if (now > entry.hitAt + timing.late) {
          entry.resolved = true;
          entry.note.classList.add('is-missed');
          misses += 1;
          combo = 0;
          updateHud();
        }
      }

      if (notes.every((entry) => entry.resolved)) {
        const accuracy = hits / totalNotes;
        this.complete(accuracy >= (simplified ? 0.55 : 0.62), {
          bonus: Math.floor(points / 400) + bestCombo,
          rating: accuracy >= 0.9 ? 3 : accuracy >= 0.72 ? 2 : 1,
          detail: `${Math.round(accuracy * 100)}% accuracy · combo ×${bestCombo}`
        });
        return;
      }
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
    this.register(() => cancelAnimationFrame(frameId));
    this.runTimer(duration, () => {
      const accuracy = hits / totalNotes;
      this.complete(accuracy >= (simplified ? 0.55 : 0.62), {
        rating: accuracy >= 0.88 ? 3 : accuracy >= 0.7 ? 2 : 1,
        detail: `${Math.round(accuracy * 100)}% accuracy`
      });
    }, timer);
    this.scene.playAnimation('run', { fade: 0.25, force: true, timeScale: 0.9 });
    updateHud();
  }

  async run_obstacle() {
    const simplified = this.store.settings.simplifiedGames;
    const avatarUrl = this.scene.getPetAvatarDataUrl();
    const totalObstacles = simplified ? 8 : 12;
    const reactionWindows = simplified
      ? { jump: 620, duck: 500 }
      : { jump: 460, duck: 360 };
    const { score, timer, status, instruction } = this.createHud('Jump over crates and duck under ribbons', 34);
    const stage = document.createElement('div');
    stage.className = 'agility-stage';
    stage.innerHTML = `
      <div class="agility-sky"><span></span><span></span><span></span></div>
      <div class="agility-track"><div class="agility-avatar"><img alt="" draggable="false"></div></div>
      <div class="agility-controls">
        <button type="button" data-action="jump"><strong>Jump</strong><small>Space / ↑</small></button>
        <button type="button" data-action="duck"><strong>Duck</strong><small>↓</small></button>
      </div>
    `;
    this.root.append(stage);
    const track = stage.querySelector('.agility-track');
    const avatar = stage.querySelector('.agility-avatar');
    const avatarImage = avatar.querySelector('img');
    avatarImage.src = avatarUrl;
    avatarImage.alt = this.store.active.petName || 'Selected companion';
    const controls = [...stage.querySelectorAll('[data-action]')];
    const obstacles = [];
    let spawned = 0;
    let cleared = 0;
    let lives = 3;
    let action = 'run';
    let actionStartedAt = 0;
    let actionUntil = 0;
    const lastActionAt = { jump: -Infinity, duck: -Infinity };
    const jumpDuration = simplified ? 980 : 900;
    const duckDuration = simplified ? 760 : 650;
    let lastFrame = performance.now();
    let lastSpawn = 0;

    const updateHud = () => {
      score.textContent = `${cleared}/${totalObstacles}`;
      status.textContent = `${'●'.repeat(lives)}${'○'.repeat(3 - lives)}`;
    };
    const setAction = (nextAction) => {
      if (!this.active || this.active.completed) return;
      const now = performance.now();
      if (now - actionStartedAt < 90) return;
      action = nextAction;
      actionStartedAt = now;
      lastActionAt[nextAction] = now;
      actionUntil = now + (nextAction === 'jump' ? jumpDuration : duckDuration);
      avatar.style.setProperty('--jump-duration', `${jumpDuration}ms`);
      avatar.style.setProperty('--duck-duration', `${duckDuration}ms`);
      avatar.classList.remove('is-jumping', 'is-ducking');
      void avatar.offsetWidth;
      avatar.classList.add(nextAction === 'jump' ? 'is-jumping' : 'is-ducking');
      if (nextAction === 'jump') {
        this.scene.triggerJump();
        this.audio.play('jump', { volume: 0.45 });
      } else {
        this.scene.playAnimation('idle', { fade: 0.12, force: true, timeScale: 1.2 });
        this.audio.play('click', { rate: 0.68, volume: 0.3 });
      }
    };
    controls.forEach((button) => {
      const handler = () => setAction(button.dataset.action);
      button.addEventListener('pointerdown', handler);
      this.register(() => button.removeEventListener('pointerdown', handler));
    });
    const keyHandler = (event) => {
      if (event.repeat) return;
      if ([' ', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        setAction('jump');
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setAction('duck');
      }
    };
    window.addEventListener('keydown', keyHandler);
    this.register(() => window.removeEventListener('keydown', keyHandler));

    const spawn = () => {
      if (spawned >= totalObstacles) return;
      const type = Math.random() > 0.48 ? 'jump' : 'duck';
      const element = document.createElement('div');
      element.className = `agility-obstacle is-${type}`;
      element.innerHTML = '<span></span>';
      track.append(element);
      obstacles.push({
        element,
        type,
        progress: 0,
        resolved: false,
        speed: randomBetween(simplified ? 0.245 : 0.27, simplified ? 0.285 : 0.32)
      });
      spawned += 1;
      instruction.textContent = type === 'jump' ? 'Crate ahead — jump!' : 'Ribbon ahead — duck!';
    };

    let frameId = 0;
    const frame = (now) => {
      if (!this.active || this.active.completed) return;
      const delta = Math.min(0.04, (now - lastFrame) / 1000);
      lastFrame = now;
      if (action !== 'run' && now >= actionUntil) {
        action = 'run';
        actionStartedAt = 0;
        avatar.classList.remove('is-jumping', 'is-ducking');
        this.scene.playAnimation('run', { fade: 0.18, force: true });
      }
      if (spawned < totalObstacles && now - lastSpawn > (simplified ? 2200 : 1850)) {
        lastSpawn = now;
        spawn();
      }

      const avatarRect = avatar.getBoundingClientRect();
      const judgeX = avatarRect.left + avatarRect.width * 0.72;
      for (let index = obstacles.length - 1; index >= 0; index -= 1) {
        const obstacle = obstacles[index];
        obstacle.progress += obstacle.speed * delta;
        const x = 105 - obstacle.progress * 102;
        obstacle.element.style.left = `${x}%`;
        const obstacleRect = obstacle.element.getBoundingClientRect();

        if (!obstacle.resolved && obstacleRect.left <= judgeX) {
          obstacle.resolved = true;
          const responseTime = now - lastActionAt[obstacle.type];
          const correctlyTimed = responseTime >= 0 && responseTime <= reactionWindows[obstacle.type];
          if (correctlyTimed) {
            cleared += 1;
            obstacle.element.classList.add('is-cleared');
            instruction.textContent = responseTime < 230 ? 'Perfect timing!' : 'Cleared!';
            this.audio.play('positive', { rate: 1.0 + cleared * 0.02, volume: 0.42 });
          } else {
            lives -= 1;
            const hadMatchingInput = Number.isFinite(lastActionAt[obstacle.type]);
            instruction.textContent = hadMatchingInput && responseTime > reactionWindows[obstacle.type]
              ? 'Too early — react closer to the obstacle'
              : 'Too late';
            avatar.classList.add('is-hit');
            this.schedule(() => avatar.classList.remove('is-hit'), 260);
            this.audio.play('land', { rate: 0.7, volume: 0.6 });
          }
          updateHud();
          if (lives <= 0) {
            this.complete(false, { detail: `${cleared} obstacles cleared` });
            return;
          }
        }
        if (x < -12) {
          obstacle.element.remove();
          obstacles.splice(index, 1);
        }
      }
      if (spawned >= totalObstacles && obstacles.length === 0) {
        const success = cleared >= Math.ceil(totalObstacles * (simplified ? 0.62 : 0.7));
        this.complete(success, {
          bonus: cleared + lives,
          rating: cleared === totalObstacles ? 3 : lives >= 2 ? 2 : 1,
          detail: `${cleared}/${totalObstacles} obstacles cleared`
        });
        return;
      }
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
    this.register(() => cancelAnimationFrame(frameId));
    this.runTimer(34, () => this.complete(cleared >= Math.ceil(totalObstacles * (simplified ? 0.62 : 0.7)), {
      bonus: cleared,
      rating: lives === 3 ? 3 : lives === 2 ? 2 : 1,
      detail: `${cleared}/${totalObstacles} obstacles cleared`
    }), timer);
    this.scene.playAnimation('run', { fade: 0.2, force: true });
    updateHud();
    spawn();
    lastSpawn = performance.now();
  }

  async run_memory() {
    const simplified = this.store.settings.simplifiedGames;
    const pairCount = simplified ? 4 : 6;
    const { score, timer, status, instruction } = this.createHud('Match every toy pair', simplified ? 42 : 55);
    const symbols = ['✦', '●', '▲', '◆', '☾', '✿', '⬟', '✧'].slice(0, pairCount);
    const values = shuffle([...symbols, ...symbols]);
    const board = document.createElement('div');
    board.className = 'memory-board';
    board.style.setProperty('--memory-columns', pairCount <= 4 ? 4 : 4);
    this.root.append(board);
    let first = null;
    let second = null;
    let locked = false;
    let matches = 0;
    let moves = 0;
    let streak = 0;
    let bestStreak = 0;

    const updateHud = () => {
      score.textContent = `${matches}/${pairCount}`;
      status.textContent = `${moves} moves${streak > 1 ? ` · ×${streak}` : ''}`;
    };
    values.forEach((value, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.dataset.value = value;
      card.setAttribute('aria-label', `Memory card ${index + 1}`);
      card.innerHTML = `<span class="memory-card-back"></span><span class="memory-card-face">${value}</span>`;
      const flip = async () => {
        if (locked || card.classList.contains('is-flipped') || card.classList.contains('is-matched') || !this.active || this.active.completed) return;
        card.classList.add('is-flipped');
        this.audio.play('click', { rate: 0.85 + index * 0.012, volume: 0.3 });
        if (!first) {
          first = card;
          return;
        }
        second = card;
        moves += 1;
        locked = true;
        if (first.dataset.value === second.dataset.value) {
          first.classList.add('is-matched');
          second.classList.add('is-matched');
          matches += 1;
          streak += 1;
          bestStreak = Math.max(bestStreak, streak);
          this.audio.play('positive', { rate: 1 + streak * 0.04, volume: 0.45 });
          this.scene.moveTo(randomBetween(-2, 2), randomBetween(-1.2, 1.2), false);
          first = null;
          second = null;
          locked = false;
          instruction.textContent = streak > 1 ? `Memory streak ×${streak}!` : 'Match found!';
          updateHud();
          if (matches >= pairCount) {
            const idealMoves = pairCount + 2;
            this.complete(true, {
              bonus: Math.max(0, idealMoves * 2 - moves) + bestStreak,
              rating: moves <= idealMoves ? 3 : moves <= idealMoves + 4 ? 2 : 1,
              detail: `${moves} moves · streak ×${bestStreak}`
            });
          }
        } else {
          streak = 0;
          this.audio.play('land', { rate: 0.85, volume: 0.25 });
          await wait(this.store.settings.reducedMotion ? 260 : 650);
          first?.classList.remove('is-flipped');
          second?.classList.remove('is-flipped');
          first = null;
          second = null;
          locked = false;
          instruction.textContent = 'Not a pair — remember those symbols';
          updateHud();
        }
      };
      card.addEventListener('click', flip);
      this.register(() => card.removeEventListener('click', flip));
      board.append(card);
    });
    this.runTimer(simplified ? 42 : 55, () => this.complete(matches >= pairCount, {
      bonus: matches,
      rating: matches === pairCount && moves <= pairCount + 3 ? 3 : matches === pairCount ? 2 : 1,
      detail: `${matches}/${pairCount} pairs matched`
    }), timer);
    updateHud();
  }

  async run_maze() {
    const simplified = this.store.settings.simplifiedGames;
    const avatarUrl = this.scene.getPetAvatarDataUrl();
    const size = simplified ? 5 : 7;
    const { score, timer, status, instruction } = this.createHud('Guide the glow from the entrance to the garden gate', simplified ? 48 : 65);
    const maze = this.generateMaze(size, size);
    const shell = document.createElement('div');
    shell.className = 'maze-shell';
    const board = document.createElement('div');
    board.className = 'maze-board';
    board.style.setProperty('--maze-size', size);
    const controls = document.createElement('div');
    controls.className = 'maze-controls';
    controls.innerHTML = `
      <button type="button" data-direction="up" aria-label="Move up">↑</button>
      <button type="button" data-direction="left" aria-label="Move left">←</button>
      <button type="button" data-direction="down" aria-label="Move down">↓</button>
      <button type="button" data-direction="right" aria-label="Move right">→</button>
    `;
    shell.append(board, controls);
    this.root.append(shell);
    let row = 0;
    let column = 0;
    let moves = 0;
    let bumps = 0;
    const cells = [];
    const petAvatar = document.createElement('img');
    petAvatar.className = 'maze-pet-avatar';
    petAvatar.src = avatarUrl;
    petAvatar.alt = this.store.active.petName || 'Selected companion';
    petAvatar.draggable = false;

    for (let cellRow = 0; cellRow < size; cellRow += 1) {
      for (let cellColumn = 0; cellColumn < size; cellColumn += 1) {
        const cell = maze[cellRow][cellColumn];
        const element = document.createElement('div');
        element.className = 'maze-cell';
        element.style.borderTopWidth = cell.walls.top ? '3px' : '0';
        element.style.borderRightWidth = cell.walls.right ? '3px' : '0';
        element.style.borderBottomWidth = cell.walls.bottom ? '3px' : '0';
        element.style.borderLeftWidth = cell.walls.left ? '3px' : '0';
        if (cellRow === 0 && cellColumn === 0) element.classList.add('is-start');
        if (cellRow === size - 1 && cellColumn === size - 1) element.classList.add('is-goal');
        board.append(element);
        cells.push(element);
      }
    }
    const getCellElement = (r, c) => cells[r * size + c];
    getCellElement(0, 0).append(petAvatar);
    const updateHud = () => {
      score.textContent = `${moves} moves`;
      status.textContent = bumps ? `${bumps} bumps` : 'Clear trail';
    };
    const move = (direction) => {
      if (!this.active || this.active.completed) return;
      const current = maze[row][column];
      const vectors = {
        up: [-1, 0, 'top'], right: [0, 1, 'right'], down: [1, 0, 'bottom'], left: [0, -1, 'left']
      };
      const [dr, dc, wall] = vectors[direction];
      if (current.walls[wall]) {
        bumps += 1;
        board.classList.add('is-bump');
        this.schedule(() => board.classList.remove('is-bump'), 160);
        this.audio.play('land', { rate: 0.8, volume: 0.28 });
        updateHud();
        return;
      }
      getCellElement(row, column).classList.add('is-visited');
      row += dr;
      column += dc;
      moves += 1;
      const destinationCell = getCellElement(row, column);
      destinationCell.append(petAvatar);
      petAvatar.classList.remove('is-moving');
      void petAvatar.offsetWidth;
      petAvatar.classList.add('is-moving');
      this.audio.play('click', { rate: 0.85 + ((row + column) % 5) * 0.06, volume: 0.24 });
      this.scene.moveTo(-3 + (column / Math.max(1, size - 1)) * 6, -1.8 + (row / Math.max(1, size - 1)) * 3.6, false);
      updateHud();
      if (row === size - 1 && column === size - 1) {
        const efficient = size * 2 + 6;
        this.complete(true, {
          bonus: Math.max(0, efficient * 2 - moves) + Math.max(0, 5 - bumps),
          rating: moves <= efficient && bumps <= 2 ? 3 : moves <= efficient + 8 ? 2 : 1,
          detail: `${moves} moves · ${bumps} bumps`
        });
      }
    };
    controls.querySelectorAll('[data-direction]').forEach((button) => {
      const handler = () => move(button.dataset.direction);
      button.addEventListener('pointerdown', handler);
      this.register(() => button.removeEventListener('pointerdown', handler));
    });
    const keyHandler = (event) => {
      const direction = { ArrowUp: 'up', w: 'up', ArrowRight: 'right', d: 'right', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left' }[event.key] || { w: 'up', d: 'right', s: 'down', a: 'left' }[event.key.toLowerCase?.()];
      if (!direction) return;
      event.preventDefault();
      move(direction);
    };
    window.addEventListener('keydown', keyHandler);
    this.register(() => window.removeEventListener('keydown', keyHandler));
    let startX = 0;
    let startY = 0;
    const touchStart = (event) => {
      startX = event.clientX;
      startY = event.clientY;
    };
    const touchEnd = (event) => {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.hypot(dx, dy) < 24) return;
      move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    };
    board.addEventListener('pointerdown', touchStart);
    board.addEventListener('pointerup', touchEnd);
    this.register(() => board.removeEventListener('pointerdown', touchStart));
    this.register(() => board.removeEventListener('pointerup', touchEnd));
    this.runTimer(simplified ? 48 : 65, () => this.complete(false, { detail: `${moves} moves through the maze` }), timer);
    instruction.textContent = 'Swipe, use arrows, or tap the direction buttons';
    updateHud();
  }

  generateMaze(rows, columns) {
    const grid = Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => ({
      row,
      column,
      visited: false,
      walls: { top: true, right: true, bottom: true, left: true }
    })));
    const stack = [];
    let current = grid[0][0];
    current.visited = true;
    let visited = 1;
    const directions = [
      [-1, 0, 'top', 'bottom'], [0, 1, 'right', 'left'], [1, 0, 'bottom', 'top'], [0, -1, 'left', 'right']
    ];
    while (visited < rows * columns) {
      const neighbors = shuffle(directions).map(([dr, dc, wall, opposite]) => ({
        row: current.row + dr,
        column: current.column + dc,
        wall,
        opposite
      })).filter(({ row, column }) => row >= 0 && row < rows && column >= 0 && column < columns && !grid[row][column].visited);
      if (neighbors.length) {
        const nextInfo = neighbors[0];
        const next = grid[nextInfo.row][nextInfo.column];
        current.walls[nextInfo.wall] = false;
        next.walls[nextInfo.opposite] = false;
        stack.push(current);
        current = next;
        current.visited = true;
        visited += 1;
      } else {
        current = stack.pop();
      }
    }
    grid.flat().forEach((cell) => { delete cell.visited; });
    return grid;
  }
}
