/* Registered module: marine-behavior */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("marine-behavior", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  "use strict";
  const V = window.V, B = V.MarineLife, clamp = V.clamp, TAU = Math.PI * 2;
  const hash = (s) => [...s].reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const profiles = {
    whale: { speed: 19, acceleration: 13, turn: 0.43, range: 230, cycle: [["cruise", 9, 0.24, 0.9], ["rise", 2.6, 0, 0.65], ["breathe", 3.1, 0, 0.38], ["dive", 3.8, 1, 0.72], ["submerged", 13, 1, 1], ["rise", 3, 0, 0.75]] },
    dolphin: { speed: 43, acceleration: 39, turn: 1.05, range: 260, cycle: [["cruise", 7, 0.2, 0.9], ["dive", 2, 1, 1.1], ["submerged", 5, 1, 1.05], ["rise", 1.7, 0, 1.1], ["accelerate", 1.7, 0, 1.35], ["leap", 1.25, 0, 1.45], ["recover", 2, 0.17, 0.8]] },
    turtle: { speed: 12, acceleration: 9, turn: 0.65, range: 145, cycle: [["cruise", 10, 0.32, 0.8], ["rise", 3, 0, 0.6], ["breathe", 3.5, 0, 0.35], ["dive", 4, 1, 0.65], ["submerged", 15, 1, 0.8]] },
    diver: { speed: 27, acceleration: 24, turn: 1.3, range: 170, cycle: [["cruise", 7, 0.2, 0.9], ["dive", 2.6, 1, 1.1], ["submerged", 7, 1, 1.15], ["rise", 2.2, 0, 0.9], ["breathe", 3, 0, 0.5]] },
    fish: { speed: 24, acceleration: 24, turn: 1.3, range: 190, cycle: [["cruise", 12, 0.38, 1], ["dive", 2, 0.73, 0.85], ["forage", 5, 0.84, 0.65], ["rise", 2, 0.43, 1.1]] }
  };
  const poses = { surface: 0, rise: 1, dive: 2, underwater: 3 };
  const effectRows = { spout: 0, launch: 1, splash: 1, dive: 2, bubbles: 3 };
  const poseSheet = (s) => s.sheet.replace("marine-", "marine-poses-");
  const ease = (from, to, value) => {
    const t = clamp((value - from) / (to - from), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const progress = (brain) => clamp(brain.elapsed / brain.duration, 0, 1);
  function drawPose(c, s, pose, y, opacity) {
    if (opacity <= 0.01) return;
    c.save();
    c.globalAlpha *= opacity;
    c.translate(0, y);
    B.pose(c, poseSheet(s), s.row, poses[pose], s.size, pose === "surface" ? 0.82 : 0.5);
    c.restore();
  }
  function drawLeap(c, s, brain) {
    const t = progress(brain);
    const column = t < 0.2 ? 0 : t < 0.45 ? 1 : t < 0.74 ? 2 : 3;
    const row = s.id === "guiana-dolphin" ? 0 : 1;
    c.save();
    if (brain.air < s.size * 0.34) {
      c.beginPath();
      c.rect(-s.size, -s.size, s.size * 2, s.size * 1.04);
      c.clip();
    }
    c.translate(0, -brain.air);
    const drawn = B.pose(c, "marine-poses-leaps", row, column, s.size);
    c.restore();
    return drawn;
  }
  function drawSwimming(c, s, brain, time) {
    const depth = brain.depth;
    const state = brain.state;
    const bob = Math.sin(time * 3) * s.size * 9e-3;
    if (s.word === "fish" || s.word === "shoal") {
      const diving = state === "forage" || state === "submerged";
      const pose = diving ? "underwater" : poses[state] === void 0 ? "surface" : state;
      drawPose(c, s, pose, depth * s.size * 0.16 + bob, 0.81 - depth * 0.52);
      return;
    }
    if (state === "dive" || state === "rise") {
      const submerged = ease(0.63, 0.98, depth);
      const waterline = s.size * 0.06;
      const y = s.size * (0.02 + depth * 0.24);
      drawPose(c, s, "underwater", depth * s.size * 0.19 + bob, submerged * (0.6 - depth * 0.36));
      c.save();
      c.beginPath();
      c.rect(-s.size, waterline, s.size * 2, s.size * 1.15);
      c.clip();
      drawPose(c, s, state, y, (1 - submerged) * (0.4 - depth * 0.16));
      c.restore();
      c.save();
      c.beginPath();
      c.rect(-s.size, -s.size, s.size * 2, s.size + waterline);
      c.clip();
      drawPose(c, s, state, y, 1 - submerged);
      c.restore();
      c.save();
      c.translate(0, waterline);
      c.globalAlpha *= 0.45 * (1 - submerged);
      B.pose(c, "marine-poses-effects", 2, 1, s.size * 0.92);
      c.restore();
      return;
    }
    if (state === "submerged" || depth > 0.6) {
      drawPose(c, s, "underwater", depth * s.size * 0.19 + bob, 0.56 - depth * 0.34);
      return;
    }
    drawPose(c, s, "surface", depth * s.size * 0.11 + bob, 1 - depth * 0.25);
  }
  function drawEffectSprite(c, effect, x, y) {
    const t = clamp(effect.age / effect.duration, 0, 1);
    const row = effectRows[effect.type];
    const size = { spout: 28 + effect.size * 0.21, launch: effect.size * 0.48 + 12, splash: effect.size * 0.63 + 16, dive: effect.size * 0.52 + 16, bubbles: effect.size * 0.31 + 12 }[effect.type];
    const anchor = row === 2 ? 0.5 : row === 3 ? 0.7 : 0.87;
    const frame = t < 0.16 ? 0 : t < 0.39 ? 1 : t < 0.67 ? 2 : 3;
    c.save();
    c.translate(x, y);
    c.globalAlpha *= 1 - ease(0.47, 1, t);
    const drawn = B.pose(c, "marine-poses-effects", row, frame, size, anchor);
    c.restore();
    return drawn;
  }
  const observationStages = [
    ["rise", 1.2, 0.81, 0],
    ["breathe", 2.25, 0, 0],
    ["dive", 1.45, 0, 1],
    ["submerged", 1.7, 1, 1],
    ["rise", 1.25, 1, 0]
  ];
  const M = V.MarineBehavior = {
    profiles,
    maxEffects: 44,
    maxSightings: 5,
    random(b) {
      b.seed = Math.imul(b.seed, 1664525) + 1013904223 >>> 0;
      return b.seed / 4294967296;
    },
    kind(s) {
      return s.word === "whale" ? "whale" : s.word === "dolphin" ? "dolphin" : s.word === "sea turtle" ? "turtle" : ["seal", "penguin"].includes(s.word) ? "diver" : "fish";
    },
    prepare(m, a) {
      if (a.swimBrain?.version === 1) return a.swimBrain;
      const s = B.species(a.species), kind = this.kind(s), p = profiles[kind], seed2 = hash(a.id), b = a.swimBrain = { version: 1, kind, seed: seed2, state: "cruise", index: 0, elapsed: 0, duration: 1, depth: 0.18, heading: seed2 % 628 / 100, speed: 0, vx: 0, vy: 0, turnScale: a.facing || 1, target: null, targetClock: 0, leapCooldown: 8 + seed2 % 24, spouted: false, air: 0, pitch: 0, visits: {}, distance: 0 };
      this.enter(m, a, 0);
      b.duration *= 0.55 + seed2 % 50 / 100;
      b.elapsed = b.duration * 0.1;
      return b;
    },
    enter(m, a, index) {
      const b = a.swimBrain, p = profiles[b.kind], previous = b.state, row = p.cycle[index % p.cycle.length];
      b.index = index % p.cycle.length;
      b.state = row[0];
      b.elapsed = 0;
      b.duration = row[1] * (0.84 + this.random(b) * 0.32);
      b.targetDepth = row[2];
      b.pace = row[3];
      b.spouted = false;
      if (b.state === "leap" && b.leapCooldown > 0) {
        b.state = "breathe";
        b.duration = 1.5;
        b.pace = 0.7;
      } else if (b.state === "leap") {
        b.leapCooldown = 29 + this.random(b) * 20;
        this.effect(m, "launch", a);
      }
      b.visits[b.state] = (b.visits[b.state] || 0) + 1;
      if (previous === "leap") {
        this.effect(m, "splash", a);
        this.sighting(m, a, "dolphin-leap");
      }
      if (b.state === "dive") this.effect(m, "dive", a);
      if (b.state === "rise") this.effect(m, "bubbles", a);
    },
    effect(m, type, a) {
      m.marineEffects ||= [];
      const b = a.swimBrain, s = B.species(a.species), facing = Math.cos(b.heading) < 0 ? -1 : 1;
      const fx = { type, x: a.x + (type === "spout" ? facing * s.size * 0.27 : 0), y: a.y - (type === "spout" ? s.size * 0.13 : 0), age: 0, duration: type === "spout" ? 1.8 : type === "bubbles" ? 2.2 : 2.5, size: s.size, seed: b.seed };
      m.marineEffects.push(fx);
      if (m.marineEffects.length > this.maxEffects) m.marineEffects.splice(0, m.marineEffects.length - this.maxEffects);
    },
    sighting(m, a, type) {
      m.marineSightings ||= [];
      m.marineSightings.push({ id: a.id + "-" + type + "-" + Math.round(m.marineTime * 10), type, species: a.species, x: a.x, y: a.y, at: m.marineTime });
      m.marineSightings = m.marineSightings.filter((e) => m.marineTime - e.at < 18).slice(-this.maxSightings);
    },
    target(m, a) {
      const b = a.swimBrain, p = profiles[b.kind], s = B.species(a.species), home = a.home || a;
      for (let i = 0; i < 14; i++) {
        const angle = b.heading + (this.random(b) - 0.5) * (i < 7 ? 2.2 : TAU), radius = 65 + this.random(b) * p.range, q = { x: a.x + Math.cos(angle) * radius, y: a.y + Math.sin(angle) * radius * 0.65 };
        if (Math.hypot(q.x - home.x, q.y - home.y) > p.range * 1.65) {
          q.x = home.x + Math.cos(angle) * p.range * 0.65;
          q.y = home.y + Math.sin(angle) * p.range * 0.4;
        }
        if (B.water(m, q.x, q.y, s.size * 0.39)) {
          b.target = q;
          b.targetClock = 5 + this.random(b) * 7;
          return;
        }
      }
      b.target = { x: home.x, y: home.y };
      b.targetClock = 2;
    },
    segment(m, a, p) {
      const margin = B.species(a.species).size * 0.39, n = Math.max(1, Math.ceil(Math.hypot(p.x - a.x, p.y - a.y) / 6));
      for (let i = 1; i <= n; i++) if (!B.water(m, a.x + (p.x - a.x) * i / n, a.y + (p.y - a.y) * i / n, margin)) return false;
      return true;
    },
    steer(m, a, dt) {
      const b = a.swimBrain, p = profiles[b.kind], s = B.species(a.species);
      b.targetClock -= dt;
      if (!b.target || b.targetClock <= 0 || Math.hypot(b.target.x - a.x, b.target.y - a.y) < 24) this.target(m, a);
      let tx = b.target.x - a.x, ty = b.target.y - a.y;
      if (s.word === "shoal") {
        const peers = m.marineAnimals.filter((n) => n.species === a.species), leader = peers[0];
        if (leader !== a) {
          const i = peers.indexOf(a), angle = leader.swimBrain?.heading || 0, ox = -28 - Math.floor(i / 2) * 19, oy = (i % 2 ? 1 : -1) * (19 + i % 3 * 5), gx = leader.x + Math.cos(angle) * ox - Math.sin(angle) * oy, gy = leader.y + Math.sin(angle) * ox + Math.cos(angle) * oy;
          if (B.water(m, gx, gy, s.size * 0.39)) {
            tx = gx - a.x;
            ty = gy - a.y;
          }
        }
      }
      for (const n of m.marineAnimals) {
        if (n === a) continue;
        const dx = a.x - n.x, dy = a.y - n.y, d = Math.hypot(dx, dy), radius = (s.size + B.species(n.species).size) * 0.32;
        if (d > 0 && d < radius && Math.abs((n.swimBrain?.depth || 0) - b.depth) < 0.55) {
          tx += dx / d * (radius - d) * 2;
          ty += dy / d * (radius - d) * 2;
        }
      }
      const boat = V.SeaNavigation.boat;
      if (boat?.map === m.id) {
        const dx = a.x - boat.x, dy = a.y - boat.y, d = Math.hypot(dx, dy), r = s.size * 0.6 + 95;
        if (d > 0 && d < r) {
          tx += dx / d * (r - d) * 3;
          ty += dy / d * (r - d) * 3;
        }
      }
      let targetAngle = Math.atan2(ty, tx), delta = Math.atan2(Math.sin(targetAngle - b.heading), Math.cos(targetAngle - b.heading));
      b.heading += clamp(delta, -p.turn * dt, p.turn * dt);
      let desired = p.speed * b.pace;
      if (s.word === "shoal" && Math.hypot(tx, ty) > 90) desired *= 1.2;
      b.speed += clamp(desired - b.speed, -p.acceleration * dt, p.acceleration * dt);
      const step = b.speed * dt, next = { x: a.x + Math.cos(b.heading) * step, y: a.y + Math.sin(b.heading) * step };
      if (this.segment(m, a, next)) {
        a.x = next.x;
        a.y = next.y;
        b.distance += step;
        b.vx = Math.cos(b.heading) * b.speed;
        b.vy = Math.sin(b.heading) * b.speed;
      } else {
        b.speed = Math.max(0, b.speed - p.acceleration * dt * 3);
        b.vx = b.vy = 0;
        b.targetClock = 0;
        for (const turn of [0.35, -0.35, 0.8, -0.8, 1.5, -1.5]) {
          const angle = b.heading + turn, q = { x: a.x + Math.cos(angle) * 28, y: a.y + Math.sin(angle) * 28 };
          if (this.segment(m, a, q)) {
            b.heading += clamp(turn, -p.turn * dt * 2, p.turn * dt * 2);
            break;
          }
        }
      }
      const horizontal = Math.cos(b.heading);
      if (Math.abs(horizontal) > 0.2) a.facing = horizontal < 0 ? -1 : 1;
      b.turnScale += (a.facing - b.turnScale) * Math.min(1, dt * 3.6);
      b.pitch = Math.sin(b.heading) * 0.1;
    },
    update(m, dt) {
      if (!m?.marineAnimals) return;
      dt = clamp(dt, 0, 0.08);
      if (V.settings.reducedMotion || V.settings.npcMovement === false) return;
      m.marineTime = (m.marineTime || 0) + dt;
      m.marineEffects ||= [];
      for (const fx of m.marineEffects) fx.age += dt;
      m.marineEffects = m.marineEffects.filter((f) => f.age < f.duration);
      m.marineSightings = (m.marineSightings || []).filter((e) => m.marineTime - e.at < 18);
      for (const a of m.marineAnimals) {
        const b = this.prepare(m, a);
        a.time += dt;
        b.elapsed += dt;
        b.leapCooldown = Math.max(0, b.leapCooldown - dt);
        if (b.elapsed >= b.duration) this.enter(m, a, b.index + 1);
        b.depth += (b.targetDepth - b.depth) * Math.min(1, dt * (b.state === "dive" ? 0.95 : 1.6));
        if (b.targetDepth === 1 && b.depth > 0.985) b.depth = 1;
        if (b.state === "breathe" && b.kind === "whale" && !b.spouted && b.elapsed >= 0.35) {
          b.spouted = true;
          this.effect(m, "spout", a);
          this.sighting(m, a, "whale-blow");
        }
        const u = clamp(b.elapsed / b.duration, 0, 1);
        b.air = b.state === "leap" ? Math.sin(Math.PI * u) * (B.species(a.species).size * 0.7 + 30) : 0;
        this.steer(m, a, dt);
      }
    },
    body(c, a, x, y, staticView = false, sizeOverride) {
      const species = B.species(a.species);
      const s = sizeOverride ? { ...species, size: sizeOverride } : species;
      const brain = staticView || !a.swimBrain ? { depth: 0.18, state: "cruise", turnScale: a.facing || 1 } : a.swimBrain;
      c.save();
      c.imageSmoothingEnabled = false;
      c.translate(x, y);
      c.scale(brain.turnScale ?? a.facing ?? 1, 1);
      if (brain.state === "leap" && drawLeap(c, s, brain)) {
        c.restore();
        return;
      }
      if (B.images[poseSheet(s)]?.naturalWidth) {
        drawSwimming(c, s, brain, staticView ? 0 : a.time);
      } else {
        c.globalAlpha *= 1 - brain.depth;
        B.art(c, s, 0, -(brain.air || 0), s.size, staticView ? 0 : a.time, 1);
      }
      c.restore();
    },
    effectDraw(c, f, cam) {
      const u = f.age / f.duration, x = f.x - cam.x, y = f.y - cam.y, fade = 1 - u;
      if (drawEffectSprite(c, f, x, y)) return;
      c.save();
      c.lineCap = "round";
      if (f.type === "spout") {
        const h = 26 + f.size * 0.16, rise = Math.sin(Math.min(1, u * 2) * Math.PI / 2);
        for (let n = 0; n < 9; n++) {
          const spread = (n - 4) * 3.3, drift = Math.sin(n * 1.8 + f.seed) * 2;
          c.strokeStyle = n % 2 ? "#e3f5ef" : "#b4d9da";
          c.globalAlpha = fade * 0.75;
          c.lineWidth = n % 3 ? 1.7 : 3;
          c.beginPath();
          c.moveTo(x, y);
          c.quadraticCurveTo(x + spread * 0.4, y - h * rise * 0.65, x + spread * rise + drift, y - h * rise + u * u * 19);
          c.stroke();
        }
        c.globalAlpha = fade * 0.3;
        c.fillStyle = "#d9f2ed";
        c.beginPath();
        c.ellipse(x, y - 34 * rise, 15 * rise + 2, 5 * rise + 1, 0, 0, TAU);
        c.fill();
      } else {
        c.strokeStyle = "#d1eee5";
        c.lineWidth = 1.5;
        c.globalAlpha = fade * 0.5;
        const radius = 8 + u * (f.size * 0.35 + 18);
        for (let j = 0; j < 2; j++) {
          c.beginPath();
          c.ellipse(x, y, radius + j * 6, (radius + j * 6) * 0.31, 0, 0, TAU);
          c.stroke();
        }
        if (f.type === "splash" || f.type === "launch") for (let n = 0; n < 9; n++) {
          const spread = (n - 4) * 5, py = y - u * (27 + Math.abs(n - 4) * 3) + u * u * 60;
          c.globalAlpha = fade * 0.8;
          c.fillStyle = "#d5efe7";
          c.beginPath();
          c.ellipse(x + spread * u, py, 1.3 + fade, 2.3 * fade + 1, spread * 0.02, 0, TAU);
          c.fill();
        }
        if (f.type === "bubbles") for (let n = 0; n < 4; n++) {
          c.globalAlpha = fade * 0.5;
          c.beginPath();
          c.arc(x + Math.sin(n * 2) * 12, y - u * 20 + n * 3, 1 + fade * 2, 0, TAU);
          c.stroke();
        }
      }
      c.restore();
    },
    draw(c, m, cam) {
      if (!m?.marineAnimals) return;
      const still = V.settings.reducedMotion || V.settings.npcMovement === false;
      c.save();
      for (const a of [...m.marineAnimals].sort((a2, b) => (b.swimBrain?.depth || 0) - (a2.swimBrain?.depth || 0))) {
        const s = B.species(a.species), b = a.swimBrain, x = a.x - cam.x, y = a.y - cam.y;
        if (x < -s.size || x > c.canvas.width + s.size || y < -s.size || y > c.canvas.height + s.size) continue;
        const depth = still ? 0.18 : b?.depth || 0;
        if (depth < 0.65 || b?.air > 0) {
          c.save();
          c.globalAlpha = (b?.air > 0 ? 0.17 : 0.08) * (1 - depth);
          c.fillStyle = "#163f4c";
          c.beginPath();
          c.ellipse(x, y + 2, s.size * 0.4, s.size * 0.09, 0, 0, TAU);
          c.fill();
          c.restore();
          if ((b?.speed || 0) > 2 || still) {
            const time = still ? 0 : a.time;
            c.save();
            c.strokeStyle = "#b9e2d8";
            c.lineWidth = s.word === "whale" ? 1.8 : 1;
            c.globalAlpha = 0.24 * (1 - depth);
            for (let j = 0; j < 2; j++) {
              const wave = (time * 0.35 + j * 0.5) % 1;
              c.beginPath();
              c.ellipse(x - Math.cos(b?.heading || 0) * s.size * 0.21, y + s.size * 0.1, s.size * (0.34 + wave * 0.15), s.size * (0.08 + wave * 0.04), 0, 0, TAU);
              c.stroke();
            }
            c.restore();
          }
        }
        this.body(c, a, x, y, still);
      }
      if (!still) for (const f of m.marineEffects || []) this.effectDraw(c, f, cam);
      c.restore();
    },
    observation(c, s, time) {
      if (V.settings.reducedMotion || V.settings.npcMovement === false || !B.images[poseSheet(s)]?.naturalWidth) return false;
      const stages = s.word === "dolphin" ? [...observationStages, ["leap", 1.45, 0, 0], ["recover", 1.25, 0, 0.19]] : observationStages;
      let elapsed = time % stages.reduce((sum, stage) => sum + stage[1], 0);
      const [state, duration, start, end] = stages.find((stage) => {
        if (elapsed < stage[1]) return true;
        elapsed -= stage[1];
        return false;
      }) || stages[0];
      const t = elapsed / duration, size = s.word === "whale" ? 200 : 144;
      const air = state === "leap" ? Math.sin(Math.PI * t) * 66 : 0;
      const x = 180 + (state === "leap" ? (t - 0.5) * 46 : Math.sin(time * 1.2) * 12), y = 110;
      const depth = start + (end - start) * ease(0, 1, t);
      const subject = { species: s.id, time, facing: 1, swimBrain: { state, elapsed, duration, depth, air, turnScale: 1 } };
      c.save();
      c.strokeStyle = "#afd7cb5c";
      c.beginPath();
      c.ellipse(180, y + 5, 101 + Math.sin(time * 2) * 10, 21, 0, 0, TAU);
      c.stroke();
      this.body(c, subject, x, y, false, size);
      if (state === "breathe" && s.word === "whale" && elapsed > 0.25) {
        drawEffectSprite(c, { type: "spout", age: elapsed - 0.25, duration: 2, size }, x + size * 0.27, y - size * 0.13);
      }
      if (state === "recover") {
        drawEffectSprite(c, { type: "splash", age: elapsed, duration, size }, x, y);
      }
      c.restore();
      return true;
    }
  };
  const seed = B.seedMap.bind(B);
  B.seedMap = function(m) {
    seed(m);
    if (m?.marineAnimals) {
      m.marineEffects ||= [];
      m.marineSightings ||= [];
      for (const a of m.marineAnimals) M.prepare(m, a);
    }
  };
});
