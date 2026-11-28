/* Registered module: cooking-workshop */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("cooking-workshop", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function() {
    "use strict";
    const V = window.V, P = V.Playground, K = V.Cooking, A = V.CookingArt, D = V.CookingWorkshopData, Art = V.CookingWorkshopArtData, C = P.controllers[V.CookingData.id], heat = new Set(["fry", "simmer", "steam", "bake"]);
    const effects = {
      scale: { colors: ["#fdf4d6", "#b9d1da", "#e8dec5"], count: 17, spread: 168, lift: 152, gravity: 270 },
      wash: { colors: ["#d0f6f3", "#83c6d5", "#f3fbe6"], count: 5, spread: 100, lift: 88, gravity: 205 },
      cut: { colors: ["#fff4d6", "#cfac77", "#e5cfac"], count: 8, spread: 110, lift: 75, gravity: 230 },
      grate: { colors: ["#fff4dd", "#ead4ba"], count: 9, spread: 105, lift: 75, gravity: 175 },
      grind: { colors: ["#eac489", "#d69e58", "#f2d69f"], count: 4, spread: 78, lift: 65, gravity: 160 },
      stir: { colors: ["#f2dda3", "#d6ac61"], count: 4, spread: 76, lift: 55, gravity: 155 },
      knead: { colors: ["#fff6df", "#e8d7ba"], count: 8, spread: 88, lift: 54, gravity: 85 },
      season: { colors: ["#e7d7a0", "#a6b972", "#cc8054"], count: 11, spread: 76, lift: 38, gravity: 210 },
      fold: { colors: ["#afc982", "#d5dd98"], count: 4, spread: 60, lift: 47, gravity: 125 },
      shape: { colors: ["#ffedc1", "#d9b77f"], count: 6, spread: 84, lift: 52, gravity: 135 },
      layer: { colors: ["#c9dc96", "#e4c982", "#e39d75"], count: 5, spread: 70, lift: 58, gravity: 165 }
    };
    const W = V.CookingWorkshop = {
      images: {},
      shades: new Map(),
      recipe: null,
      run: null,
      visualScale: 0.74,
      plateScale: 0.76,
      load() {
        if (this.ready) return this.ready;
        this.ready = Promise.all(Object.entries(Art).map(([id, s]) => new Promise((resolve) => {
          const image = V.Assets.image();
          this.images[id] = image;
          image.onload = image.onerror = resolve;
          image.src = s.file + "?v=20261102-workshop1";
          V.AssetLoader.register(image, resolve);
        })));
        return this.ready;
      },
      plan(r) {
        return D.plans[K.recipe(r).id];
      },
      ensure(r) {
        const d = r.data;
        if (d.platingRevision !== D.revision) {
          if (K.step(r).kind === "plate") {
            d.placed = d.phase === "done" ? this.plan(r).parts.map((_, i) => i) : [];
            d.progress = d.phase === "done" ? 1 : 0;
          }
          d.platingRevision = D.revision;
          d.platingMotion = [];
          d.dragServing = null;
        }
        d.platingMotion ||= [];
      },
      fit(sheet, frame, x, y, w, h, maxScale = 1.8) {
        const f = Art[sheet]?.frames[frame];
        if (!f) return null;
        const scale = Math.min(w / f.w, h / f.h, maxScale), dw = f.w * scale, dh = f.h * scale;
        return { x: Math.round(x + (w - dw) / 2), y: Math.round(y + (h - dh) / 2), w: Math.round(dw), h: Math.round(dh) };
      },
      art(c, sheet, frame, x, y, w, h, maxScale = 1.8) {
        const image = this.images[sheet], f = Art[sheet]?.frames[frame], rect = this.fit(sheet, frame, x, y, w, h, maxScale);
        if (!image?.naturalWidth || !rect) return rect;
        c.save();
        c.imageSmoothingEnabled = false;
        c.drawImage(image, f.x, f.y, f.w, f.h, rect.x, rect.y, rect.w, rect.h);
        c.restore();
        return rect;
      },
      stageRect(x, y, w, h) {
        const k = this.visualScale;
        return [x + w * (1 - k) / 2, y + h * (1 - k) / 2, w * k, h * k];
      },
      food(c, id, x, y, size = 118) {
        const f = D.foods[id];
        return f && this.art(c, f.sheet, f.frame, x - size / 2, y - size / 2, size, size);
      },
      shadedFood(c, id, x, y, size, doneness, scorch) {
        const f = D.foods[id], image = this.images[f.sheet];
        if (!image?.naturalWidth) return;
        const raw = Math.max(0, 10 - Math.round(doneness * 10)), char = Math.round(V.clamp(scorch, 0, 1) * 12), key = id + ":" + raw + ":" + char;
        if (!raw && !char) return this.food(c, id, x, y, size);
        let tile = this.shades.get(key);
        const cell = Art[f.sheet].frames[f.frame];
        if (!tile) {
          tile = document.createElement("canvas");
          tile.width = cell.w;
          tile.height = cell.h;
          const ctx = tile.getContext("2d");
          ctx.drawImage(image, cell.x, cell.y, cell.w, cell.h, 0, 0, cell.w, cell.h);
          const pale = raw / 10, damage = char / 12;
          ctx.globalCompositeOperation = "source-atop";
          if (pale) {
            const flour = ctx.createLinearGradient(0, 0, 0, cell.h);
            flour.addColorStop(0, "#fff5db");
            flour.addColorStop(0.6, "#f5ebd2");
            flour.addColorStop(1, "#bd9a72");
            ctx.globalAlpha = pale * 0.77;
            ctx.fillStyle = flour;
            ctx.fillRect(0, 0, cell.w, cell.h);
          }
          if (damage) {
            ctx.globalAlpha = damage * 0.92;
            ctx.fillStyle = "#211d19";
            ctx.fillRect(0, 0, cell.w, cell.h);
            ctx.globalAlpha = damage * 0.54;
            ctx.fillStyle = "#140f0c";
            for (let n = 0; n < 31; n++) {
              const x2 = n * 53 % cell.w, y2 = n * 41 % cell.h, size2 = 3 + n % 7 * damage;
              ctx.beginPath();
              ctx.ellipse(x2, y2, size2, size2 * 0.54, n, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          if (this.shades.size >= 55) this.shades.delete(this.shades.keys().next().value);
          this.shades.set(key, tile);
        }
        const rect = this.fit(f.sheet, f.frame, x - size / 2, y - size / 2, size, size);
        c.save();
        c.imageSmoothingEnabled = false;
        c.drawImage(tile, rect.x, rect.y, rect.w, rect.h);
        c.restore();
      },
      effect(r, origin) {
        const s = K.step(r), e = effects[s.kind], d = r.data;
        if (!e || V.settings.reducedMotion || !origin) return;
        if (["wash", "stir", "grind"].includes(s.kind) && d.t < (d.effectAt ?? -1)) return;
        d.effectAt = d.t + 0.07;
        const x = V.clamp(origin.x, 267, 684), y = V.clamp(origin.y, 163, 365);
        for (let i = 0; i < e.count; i++) {
          const seed = (i * 73 + r.moves * 31) % 101 / 100, side = i % 2 ? 1 : -1, life = 0.31 + seed * 0.39;
          d.particles.push({ x: x + (seed - 0.5) * 16, y: y + (i % 3 - 1) * 5, vx: s.kind === "scale" ? 33 + seed * e.spread : side * e.spread * seed, vy: -e.lift * (0.4 + seed * 0.7), life, max: life, gravity: e.gravity, color: e.colors[i % e.colors.length], kind: s.kind, size: 2 + seed * 3.5, rotation: i, spin: side * (3 + seed * 8) });
        }
        if (d.particles.length > 64) d.particles.splice(0, d.particles.length - 64);
      },
      drawEffects(c, r) {
        c.save();
        c.beginPath();
        c.rect(204, 122, 552, 281);
        c.clip();
        for (const p of r.data.particles) {
          const size = p.size || 3;
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rotation || 0);
          c.globalAlpha = Math.min(1, p.life / (p.max || 0.65) * 1.6);
          c.fillStyle = p.color;
          c.beginPath();
          if (p.kind === "scale") {
            c.moveTo(-size, 0);
            c.quadraticCurveTo(0, -size * 1.35, size, -size * 0.25);
            c.quadraticCurveTo(size * 0.55, size * 0.85, -size, 0);
            c.fill();
            c.strokeStyle = "#647986";
            c.lineWidth = 0.65;
            c.stroke();
          } else if (p.kind === "wash" || p.kind === "stir") {
            c.ellipse(0, 0, size * 0.56, size * 0.94, 0, 0, Math.PI * 2);
            c.fill();
          } else if (p.kind === "knead") {
            c.globalAlpha *= 0.4;
            c.arc(0, 0, size * (1.7 - p.life), 0, Math.PI * 2);
            c.fill();
          } else c.fillRect(-size * 0.5, -size * 0.5, size, size * 0.86);
          c.restore();
        }
        c.restore();
      },
      sources(r) {
        const groups = [];
        for (const [i, part] of this.plan(r).parts.entries()) {
          let g = groups.find((g2) => g2.food === part.food);
          if (!g) {
            g = { food: part.food, indices: [], label: D.foods[part.food].label };
            groups.push(g);
          }
          g.indices.push(i);
        }
        const h = groups.length === 1 ? 218 : groups.length === 2 ? 128 : 88, gap = 12, start = groups.length === 1 ? 155 : groups.length === 2 ? 142 : 132;
        return groups.map((g, i) => ({ ...g, x: 154, y: start + i * (h + gap), w: 208, h, index: g.indices.find((i2) => !r.data.placed.includes(i2)), remaining: g.indices.filter((i2) => !r.data.placed.includes(i2)).length }));
      },
      target(r, index) {
        const part = this.plan(r).parts[index], k = this.plateScale;
        return part && { x: 622 + part.x * k, y: 272 + part.y * k, w: Math.max(76, part.size * 0.8 * k), h: Math.max(48, part.size * 0.48 * k) };
      },
      selected(r) {
        this.ensure(r);
        return this.plan(r).parts[r.data.selected] || this.plan(r).parts[0];
      },
      select(r, delta) {
        const list = this.plan(r).parts.map((_, i) => i).filter((i) => !r.data.placed.includes(i));
        if (!list.length) return;
        const at = list.indexOf(r.data.selected);
        r.data.selected = list[(Math.max(0, at) + delta + list.length) % list.length];
        P.controls();
      },
      place(r, index, from = null) {
        this.ensure(r);
        const d = r.data, part = this.plan(r).parts[index];
        if (d.phase !== "work" || !part || d.placed.includes(index)) return false;
        if (part.after?.some((i) => !d.placed.includes(i))) {
          K.mistake(r, part.sauce ? "Coloque as fatias no prato antes de regar com a calda." : "Sirva primeiro a base preparada, depois coloque esta por\xE7\xE3o por cima.");
          return false;
        }
        const source = this.sources(r).find((g) => g.indices.includes(index)), to = this.target(r, index);
        d.placed.push(index);
        d.platingMotion.push({ index, age: 0, from: from || { x: source.x + source.w / 2, y: source.y + source.h / 2 }, to: { x: to.x, y: to.y } });
        d.dragServing = null;
        V.Audio.sfx("collect");
        K.spark(r, to.x, to.y, "#f2d48a");
        K.gain(r, 1 / this.plan(r).parts.length);
        d.selected = this.plan(r).parts.findIndex((_, i) => !d.placed.includes(i));
        if (d.selected < 0) d.selected = 0;
        if (d.phase === "work") P.feedback("\u2713 " + D.foods[part.food].label + " servido. " + d.placed.length + "/" + this.plan(r).parts.length + " por\xE7\xF5es no prato.");
        P.controls();
        P.save();
        return true;
      },
      servingPointer(r, type, p) {
        this.ensure(r);
        const d = r.data;
        if (d.phase !== "work") return;
        d.tool = { ...p };
        if (type === "down") {
          const g = this.sources(r).find((g2) => g2.remaining && p.x >= g2.x && p.x <= g2.x + g2.w && p.y >= g2.y && p.y <= g2.y + g2.h);
          if (g) {
            d.selected = g.index;
            d.dragServing = { index: g.index, x: p.x, y: p.y, start: { x: p.x, y: p.y } };
            P.controls();
          }
          return;
        }
        if (type === "cancel") {
          d.dragServing = null;
          return;
        }
        if (!d.dragServing) return;
        if (type === "move") {
          d.dragServing.x = p.x;
          d.dragServing.y = p.y;
          return;
        }
        if (type === "up") {
          const drag = d.dragServing, target = this.target(r, drag.index);
          d.dragServing = null;
          if (Math.hypot(p.x - drag.start.x, p.y - drag.start.y) < 8) return;
          if (target && Math.hypot((p.x - target.x) / (target.w * 0.7), (p.y - target.y) / (target.h * 0.8)) <= 1.15) this.place(r, drag.index, p);
          else {
            K.mistake(r, "Leve esta por\xE7\xE3o ao contorno dourado do prato. Ela continua na bandeja.");
            d.returnServing = { index: drag.index, x: p.x, y: p.y, age: 0 };
          }
        }
      },
      foldPoint(r) {
        const rect = this.fit("complete-preparation", 12, ...this.stageRect(280, 148, 400, 234)), points = [[0.19, 0.2], [0.81, 0.2], [0.81, 0.8], [0.19, 0.8]];
        const [x, y] = points[r.data.placed.length % 4];
        return { x: rect.x + rect.w * x, y: rect.y + rect.h * y };
      },
      fishZones() {
        const rect = this.fit("complete-preparation", 0, ...this.stageRect(280, 148, 400, 234)), x = rect.x + rect.w * 0.24, y = rect.y + rect.h * 0.28, w = rect.w * 0.64, h = rect.h * 0.5;
        return Array.from({ length: 6 }, (_, i) => ({ x: x + i % 3 * w / 3, y: y + Math.floor(i / 3) * h / 2, w: w / 3, h: h / 2 }));
      },
      drawFishMarks(c, r) {
        for (const [i, z] of this.fishZones().entries()) {
          c.strokeStyle = r.data.zones[i] ? "#77ad8b" : "#e6bd64";
          c.lineWidth = r.data.zones[i] ? 1 : 2;
          c.strokeRect(z.x, z.y, z.w - 3, z.h - 2);
        }
        const p = K.point(r);
        this.text(c, "\u2192", p.x, p.y, 22, "#315840");
        this.text(c, "CAUDA \u2192 CABE\xC7A", 480, 389, 12, "#315840");
      },
      scrapePointer(r, type, p) {
        const d = r.data;
        d.tool = { ...p };
        if (d.phase !== "work") return;
        if (type === "down") {
          d.stroke = { ...p };
          return;
        }
        if (type === "cancel") {
          d.stroke = null;
          return;
        }
        if (type !== "up" || !d.stroke) return;
        const a = d.stroke;
        d.stroke = null;
        const zones = this.fishZones(), i = zones.findIndex((z) => a.x >= z.x && a.x <= z.x + z.w && a.y >= z.y && a.y <= z.y + z.h);
        if (i >= 0 && !d.zones[i] && p.x - a.x >= zones[i].w * 0.45 && Math.abs(p.y - a.y) < zones[i].h * 1.2) {
          d.zones[i] = true;
          K.gain(r, 1 / 6, { x: zones[i].x + zones[i].w * 0.62, y: a.y });
        } else if (p.x < a.x) K.mistake(r, "Raspe da cauda \xE0 cabe\xE7a, seguindo a seta para a direita.");
      },
      rounded(c, x, y, w, h, fill, stroke = "#799e94", radius = 12) {
        c.save();
        c.fillStyle = fill;
        c.strokeStyle = stroke;
        c.lineWidth = 2;
        c.beginPath();
        c.roundRect(x, y, w, h, radius);
        c.fill();
        if (stroke) c.stroke();
        c.restore();
      },
      text(c, text, x, y, size = 15, color = "#f0e6c8", align = "center") {
        c.save();
        c.font = "600 " + size + 'px "VOICES Sans",sans-serif';
        c.fillStyle = color;
        c.textAlign = align;
        c.textBaseline = "middle";
        c.fillText(text, x, y);
        c.restore();
      },
      background(c, r) {
        c.fillStyle = "#193f38";
        c.fillRect(0, 0, 960, 540);
        const cover = A.images.cover;
        if (cover?.naturalWidth) {
          c.globalAlpha = 0.12;
          c.drawImage(cover, 0, 0, 960, 540);
          c.globalAlpha = 1;
        }
        this.text(c, K.recipe(r).name, 480, 33, 24);
        this.text(c, "MONTAGEM \xB7 " + r.data.placed.length + "/" + this.plan(r).parts.length + " por\xE7\xF5es", 480, 64, 14, "#b8d6c3");
        this.rounded(c, 126, 100, 708, 359, "#b0bcb2", "#dce1c9");
        c.fillStyle = "#899f96";
        c.fillRect(139, 438, 682, 7);
        for (const x of [146, 805]) {
          c.fillStyle = "#788d83";
          c.fillRect(x, 114, 3, 314);
        }
      },
      plate(c, r, cx = 622, cy = 272, scale = this.plateScale, complete = false) {
        const plan = this.plan(r), d = r.data;
        c.save();
        c.translate(cx, cy);
        c.scale(scale, scale);
        this.art(c, "prepared-sweets-tools", plan.vessel === "bowl" ? 14 : 13, -177, -103, 354, 206);
        const selected = d.phase === "work" && !complete ? this.target(r, d.dragServing?.index ?? d.selected) : null;
        if (selected) {
          c.strokeStyle = "#b89143";
          c.lineWidth = 3;
          c.setLineDash([6, 5]);
          c.beginPath();
          c.ellipse((selected.x - 622) / this.plateScale, (selected.y - 272) / this.plateScale + 12, selected.w * 0.48 / this.plateScale, selected.h * 0.4 / this.plateScale, 0, 0, Math.PI * 2);
          c.stroke();
          c.setLineDash([]);
        }
        const placed = complete ? plan.parts.map((_, i) => i) : d.placed;
        const depth = (i) => plan.parts[i].sauce ? 100 : plan.parts[i].after?.length ? 60 : plan.parts[i].y;
        const flying = (i) => !complete && !V.settings.reducedMotion && d.platingMotion.some((m) => m.index === i && m.age < 0.32);
        const ordered = [...placed].sort((a, b) => depth(a) - depth(b) || a - b);
        for (const i of ordered) {
          const part = plan.parts[i];
          if (flying(i)) continue;
          if (part.fill && placed.some((j) => j > i && plan.parts[j].food === part.food && !flying(j))) continue;
          if (part.sauce) {
            c.fillStyle = "#f6d89acc";
            for (let n = 0; n < 5; n++) {
              c.beginPath();
              c.ellipse(-77 + n * 34, -10 + Math.sin(n) * 6, 12, 3, Math.PI * 0.1, 0, Math.PI * 2);
              c.fill();
            }
          } else this.food(c, part.food, part.x, part.y, part.size);
        }
        c.restore();
      },
      drawServing(c, r) {
        this.ensure(r);
        const d = r.data;
        this.background(c, r);
        this.plate(c, r);
        for (const g of this.sources(r)) {
          const selected = g.indices.includes(d.selected) && d.phase === "work", fill = !g.remaining ? "#c4d0bf" : selected ? "#f7edcf" : "#e3e6d6";
          this.rounded(c, g.x, g.y, g.w, g.h, fill, selected ? "#b08d42" : "#7f9a89");
          const large = g.h > 150, size = large ? 119 : g.h > 100 ? 83 : 64, iy = g.y + (large ? 79 : g.h > 100 ? 45 : 31);
          if (g.remaining) this.food(c, g.food, g.x + g.w / 2, iy, size * this.visualScale);
          else this.text(c, "\u2713", g.x + g.w / 2, iy, 32, "#56826c");
          this.text(c, g.label, g.x + g.w / 2, g.y + g.h - 32, 13, "#264d40");
          this.text(c, g.remaining ? g.remaining + " " + (g.remaining > 1 ? "por\xE7\xF5es prontas" : "por\xE7\xE3o pronta") : "\u2713 servido", g.x + g.w / 2, g.y + g.h - 13, 12, "#47715d");
        }
        if (d.phase === "work") {
          const part = this.selected(r), target = this.target(r, d.selected);
          this.text(c, part.sauce ? "Regue as fatias com a calda preparada" : "Solte a por\xE7\xE3o no contorno dourado", 607, 414, 14, "#214c3d");
          if (d.dragServing) {
            c.save();
            c.globalAlpha = 0.9;
            this.food(c, part.food, d.dragServing.x, d.dragServing.y, 114 * this.plateScale);
            c.restore();
          } else if (!V.settings.reducedMotion) {
            const source = this.sources(r).find((g) => g.indices.includes(d.selected)), t = d.t * 0.6 % 1;
            const x = (source.x + source.w + 14) * (1 - t) + (target.x - target.w * 0.45) * t, y = (source.y + source.h / 2) * (1 - t) + (target.y - 12) * t;
            c.fillStyle = "#436f5a99";
            c.beginPath();
            c.arc(x, y, 3, 0, Math.PI * 2);
            c.fill();
          }
        }
        for (const motion of d.platingMotion) {
          if (V.settings.reducedMotion || motion.age >= 0.32) continue;
          const t = Math.min(1, motion.age / 0.32), ease = 1 - (1 - t) ** 3, part = this.plan(r).parts[motion.index], x = motion.from.x + (motion.to.x - motion.from.x) * ease, y = motion.from.y + (motion.to.y - motion.from.y) * ease - Math.sin(t * Math.PI) * 28;
          this.food(c, part.food, x, y, part.size * this.plateScale * (0.8 + 0.2 * t));
        }
        if (d.returnServing && !V.settings.reducedMotion) {
          const m = d.returnServing, g = this.sources(r).find((g2) => g2.indices.includes(m.index));
          if (g) {
            const t = Math.min(1, m.age / 0.24);
            this.food(c, this.plan(r).parts[m.index].food, m.x + (g.x + g.w / 2 - m.x) * t, m.y + (g.y + g.h / 2 - m.y) * t, 96 * this.plateScale);
          }
        }
        this.drawEffects(c, r);
        const total = this.plan(r).parts.length;
        P.box(c, 234, 485, 492, 12, "#31594b");
        P.box(c, 234, 485, 492 * d.placed.length / total, 12, "#a3cfa5");
        this.text(c, d.phase === "done" ? "\u2713 PRATO MONTADO \xB7 SERVINDO SUA RECEITA" : d.placed.length + " de " + total + " por\xE7\xF5es servidas", 480, 518, 14);
      },
      prepFrame(r, s, progress) {
        const kind = s.kind, title = s.title.toLowerCase(), done = progress >= 0.52;
        if (kind === "scale") return progress >= 1 ? 1 : 0;
        if (kind === "cut") return /cebola/.test(title) ? done ? 3 : 2 : done ? 15 : 14;
        if (kind === "grate") return done ? 5 : 4;
        if (kind === "fold") return progress >= 1 ? 13 : 12;
        if (kind === "knead" || kind === "shape") return 11;
        if (kind === "grind") return 10;
        if (kind === "wash") return /peixe/.test(title) ? 1 : /arroz|milho|grão|samp/.test(title) ? 6 : done ? 7 : 6;
        if (kind === "stir") return /feijão|massa|mistura|aerar|flocos/.test(title) ? 9 : /coco/.test(title) ? 5 : /funge|pap|angu|creme/.test(title) ? 9 : 15;
        if (kind === "season") return /galinha/.test(title) ? 15 : /peixe|postas/.test(title) ? 1 : /arroz/.test(title) ? 7 : 15;
        return 9;
      },
      cookware(r, s) {
        const id = K.recipe(r).id, title = s.title.toLowerCase();
        if (id === "calulu" && !/funge|farinha/.test(title)) return 0;
        if (/funge|pap|angu|creme/.test(title)) return 1;
        if (["umngqusho", "mungunza", "baiao", "geelrys"].includes(id) || /grãos|feijão|arroz/.test(title)) return 3;
        return 2;
      },
      opening(rect, frame) {
        const [x, y, w, h] = [[0.41, 0.605, 0.365, 0.275], [0.5, 0.345, 0.345, 0.217], [0.5, 0.355, 0.325, 0.23], [0.5, 0.515, 0.34, 0.28]][frame];
        return { x: rect.x + rect.w * x, y: rect.y + rect.h * y, rx: rect.w * w, ry: rect.h * h };
      },
      surface(c, { x, y, rx, ry }) {
        c.beginPath();
        c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      },
      vessel(c, r, s, progress, x, y, w, h) {
        const d = r.data, kind = s.kind, title = s.title.toLowerCase(), id = K.recipe(r).id;
        const frame = kind === "fry" ? 0 : kind === "steam" ? 2 : kind === "bake" ? 3 : 1;
        const rect = this.fit("empty-cookware", frame, x, y, w, h), rim = this.opening(rect, frame);
        const time = V.settings.reducedMotion ? 0 : d.t, scorch = d.scorch || 0;
        if (heat.has(kind) && kind !== "bake") this.burner(c, rect, d.heat, time, rim.x);
        this.art(c, "empty-cookware", frame, x, y, w, h);
        c.save();
        this.surface(c, rim);
        c.clip();
        const { x: cx, y: cy, rx, ry } = rim;
        if (kind === "fry") {
          c.fillStyle = id === "acaraje" ? "#9a4b1fde" : "#ae792ccf";
          this.surface(c, { ...rim, y: cy + ry * 0.29, ry: ry * 0.81 });
          c.fill();
          const food = id === "red-red" ? "savory-11" : this.plan(r).parts[0].food;
          const flip = d.flipped && !V.settings.reducedMotion ? V.clamp(1 - d.animation / 0.65, 0, 1) : 1;
          const doneness = V.clamp(d.flipped && flip > 0.5 ? (progress - 0.18) / 0.82 : progress / 0.65, 0, 1);
          for (const [dx, dy] of [[-0.41, -0.27], [0.38, -0.14], [0, 0.34]]) {
            const xx = cx + dx * rx, yy = cy + dy * ry, turn = flip < 1 ? Math.sin(flip * Math.PI) : 0;
            c.save();
            c.translate(xx, yy - turn * 9);
            c.scale(1, 1 - turn * 0.73);
            this.shadedFood(c, food, 0, 0, Math.min(rx * 0.84, ry * 1.19), doneness, scorch);
            c.restore();
          }
        } else if (kind === "layer") {
          const materials = this.materials(r);
          for (const [i, index] of d.placed.entries()) {
            const ingredient = materials[index], drop = i === d.placed.length - 1 && !V.settings.reducedMotion ? d.animation * 75 : 0;
            if (ingredient) this.art(c, "complete-preparation", ingredient.frame, cx + (i - 1) * rx * 0.5 - ry * 0.68, cy - ry * 0.84 + i * 5 - drop, ry * 1.36, ry * 1.47);
          }
        } else if (kind === "pour") {
          const liquid = /calda|dendê/.test(title) ? "#be8a4f" : /caldo/.test(title) ? "#ae6c3b" : "#efe0b6";
          if (/coco/.test(title) && id === "moqueca") this.food(c, "savory-2", cx, cy, rx * 1.16);
          c.fillStyle = liquid;
          this.surface(c, { x: cx, y: cy + ry * (0.67 - d.fill * 0.45), rx: rx * (0.42 + d.fill * 0.58), ry: ry * (0.12 + d.fill * 0.69) });
          c.fill();
        } else if (kind === "steam" && id === "abara") {
          for (const dx of [-0.43, 0.43]) this.art(c, "complete-preparation", 13, cx + dx * rx - ry * 0.78, cy - ry * 0.75, ry * 1.56, ry * 1.46);
        } else {
          const f = /calda/.test(title) ? "sweet-8" : /funge/.test(title) ? "savory-15" : this.plan(r).parts[0].food;
          if (kind === "bake") this.shadedFood(c, f, cx, cy, rx * 1.63, progress, scorch);
          else this.food(c, f, cx, cy, Math.min(rx * 1.44, ry * 2.45));
        }
        if (heat.has(kind)) this.bubbles(c, rim, kind, time, d.heat);
        c.restore();
        if (heat.has(kind)) this.vapor(c, rim, time, d.heat, scorch, kind);
        if (kind === "pour" && d.pouring) this.stream(c, rim, d, time);
        return rect;
      },
      bubbles(c, rim, kind, time, heatLevel) {
        if (!["fry", "simmer"].includes(kind) || V.settings.reducedMotion) return;
        const { x, y, rx, ry } = rim;
        for (let n = 0; n < 12; n++) {
          const life = (time * (0.52 + heatLevel * 0.88) + n * 0.39) % 1, a = n * 2.399;
          const radius = n % 3 === 0 ? 0.38 : 0.69, px = x + Math.cos(a) * rx * radius, py = y + Math.sin(a) * ry * radius * 0.76;
          c.globalAlpha = (1 - life) * 0.6;
          c.strokeStyle = kind === "fry" ? "#ffe2a4" : "#efe7c6";
          c.lineWidth = 1.3;
          c.beginPath();
          c.ellipse(px, py, 1.6 + life * 3.2, 1 + life * 1.6, 0, 0, Math.PI * 2);
          c.stroke();
        }
        c.globalAlpha = 1;
      },
      vapor(c, rim, time, heatLevel, scorch, kind) {
        if (V.settings.reducedMotion || heatLevel < 0.27) return;
        const { x, y, rx, ry } = rim, smoke = scorch > 0.28;
        c.save();
        c.beginPath();
        c.rect(270, 131, 420, 265);
        c.clip();
        for (let n = 0; n < (smoke ? 8 : 5); n++) {
          const life = (time * (0.32 + heatLevel * 0.23) + n * 0.19) % 1, px = x + (n / 4 - 0.5) * rx * (smoke ? 0.61 : 1.2) + Math.sin(life * 6 + n) * 11, py = y - ry * 0.4 - life * (smoke ? 96 : 58);
          c.globalAlpha = Math.sin(life * Math.PI) * (smoke ? 0.56 : kind === "fry" ? 0.23 : 0.46);
          if (smoke) {
            c.fillStyle = "#343630";
            c.beginPath();
            c.ellipse(px, py, 4 + life * 13, 4 + life * 6, -0.2, 0, Math.PI * 2);
            c.fill();
          } else {
            c.strokeStyle = "#f1e9d5";
            c.lineWidth = 2 + life;
            c.beginPath();
            c.moveTo(px, py + 13);
            c.quadraticCurveTo(px - 9, py + 5, px, py);
            c.stroke();
          }
        }
        c.restore();
      },
      stream(c, { x, y, rx, ry }, d, t) {
        const from = { x: x + rx * 0.78, y: y - ry - 62 }, to = { x: x + rx * 0.14, y: y + ry * (0.67 - d.fill * 0.45) };
        c.save();
        c.lineCap = "round";
        for (const [width, color] of [[9, "#bf9c6c"], [5, "#f4dfb2"], [1.7, "#fff3ce"]]) {
          c.strokeStyle = color;
          c.lineWidth = width;
          c.beginPath();
          c.moveTo(from.x, from.y);
          c.quadraticCurveTo(from.x - 32, from.y + 22, to.x, to.y);
          c.stroke();
        }
        const ripple = V.settings.reducedMotion ? 0.3 : t * 1.9 % 1;
        c.strokeStyle = "#fff3cb";
        c.globalAlpha = 1 - ripple;
        c.lineWidth = 2;
        this.surface(c, { x: to.x, y: to.y, rx: 5 + ripple * 15, ry: 2 + ripple * 5 });
        c.stroke();
        c.restore();
      },
      burner(c, rect, heat2, time, cx = rect.x + rect.w / 2) {
        const level = V.clamp(heat2, 0, 1), y = rect.y + rect.h + 6, width = rect.w * 0.49, t = V.settings.reducedMotion ? 0 : time;
        c.save();
        const glow = c.createRadialGradient(cx, y - 2, 3, cx, y - 2, width * 0.67);
        glow.addColorStop(0, "rgba(239,164,64," + (0.09 + level * 0.16) + ")");
        glow.addColorStop(1, "#eeb04b00");
        c.fillStyle = glow;
        c.fillRect(cx - width, y - width * 0.6, width * 2, width * 1.1);
        c.fillStyle = "#263c36";
        c.beginPath();
        c.ellipse(cx, y + 4, width * 0.61, 9, 0, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#91a39a";
        c.lineWidth = 2;
        c.stroke();
        const tongue = (x, base, w, h, lean, color) => {
          c.fillStyle = color;
          c.beginPath();
          c.moveTo(x - w / 2, base);
          c.bezierCurveTo(x - w * 0.65, base - h * 0.4, x + lean - w * 0.25, base - h * 0.72, x + lean, base - h);
          c.bezierCurveTo(x + lean + w * 0.2, base - h * 0.55, x + w * 0.6, base - h * 0.24, x + w / 2, base);
          c.closePath();
          c.fill();
        };
        for (let n = 0; n < 9; n++) {
          const x = cx - width / 2 + n * width / 8, sway = Math.sin(t * 3.6 + n * 1.7), h = 7 + level * (12 + Math.sin(t * 4 + n) * 3);
          tongue(x, y, 9, h, sway * 2.5, "#e3a04e");
          tongue(x, y, 6, h * 0.68, sway * 1.4, "#f8d386");
          tongue(x, y + 1, 8, 5 + level * 3, 0, "#6abbd0");
          tongue(x, y + 1, 3, 4, 0, "#ccedf0");
        }
        c.strokeStyle = "#364e44";
        c.lineWidth = 4;
        for (const dx of [-width * 0.38, width * 0.38]) {
          c.beginPath();
          c.moveTo(cx + dx, y + 9);
          c.lineTo(cx + dx * 0.7, y - 3);
          c.stroke();
        }
        c.restore();
      },
      stage(c, s, progress, x, y, w, h) {
        const r = this.run;
        if (!r) return false;
        const d = r.data, kind = s.kind, t = V.settings.reducedMotion ? 0 : d.t;
        this.rounded(c, 190, 82, 580, 386, "#adb9af", "#dfe5ce");
        c.fillStyle = "#879d93";
        c.fillRect(203, 452, 554, 5);
        this.rounded(c, 224, 122, 512, 282, heat.has(kind) ? "#596e65" : "#e8dfc5", "#7b8c72", 9);
        [x, y, w, h] = this.stageRect(x, y, w, h);
        let rect;
        if (heat.has(kind) || kind === "pour" || kind === "layer") {
          const row = this.cookware(r, s), frame = Math.min(3, Math.floor(progress * 4));
          if (kind === "bake") {
            this.rounded(c, 302, 135, 356, 260, "#4a6059", "#d5dfd0", 10);
            this.rounded(c, 319, 151, 322, 225, "#253d35", "#90a393", 5);
            const glow = c.createRadialGradient(480, 295, 12, 480, 295, 160);
            glow.addColorStop(0, "rgba(232,145,61," + (0.2 + d.heat * 0.3) + ")");
            glow.addColorStop(1, "#e39a3c00");
            c.fillStyle = glow;
            c.fillRect(320, 152, 320, 222);
            c.strokeStyle = "#d39a59";
            c.lineWidth = 3;
            for (const yy of [351, 359]) {
              c.beginPath();
              c.moveTo(341, yy);
              c.lineTo(619, yy);
              c.stroke();
            }
          }
          const dedicated = kind === "simmer" && ((id) => id === "calulu" && !/funge|farinha/.test(s.title.toLowerCase()) || id === "moqueca" || id === "umngqusho" || ["pap", "angu"].includes(id) && /pap|angu|milho/.test(s.title.toLowerCase()))(K.recipe(r).id);
          if (dedicated) {
            rect = this.fit("complete-cookware", row * 4 + frame, x, y, w, h);
            const rim = this.opening(rect, 1);
            this.burner(c, rect, d.heat, t);
            this.art(c, "complete-cookware", row * 4 + frame, x, y, w, h);
            c.save();
            this.surface(c, rim);
            c.clip();
            this.bubbles(c, rim, kind, t, d.heat);
            c.restore();
            this.vapor(c, rim, t, d.heat, d.heat > 0.85 ? 0.3 : 0, kind);
          } else rect = this.vessel(c, r, s, progress, x, y, w, h);
        } else {
          const frame = this.prepFrame(r, s, progress), bounce = V.settings.reducedMotion ? 0 : d.animation > 0 ? Math.sin((0.35 - d.animation) * 24) * 2 : 0;
          if (kind === "stir" && /funge/.test(s.title.toLowerCase())) return !!this.vessel(c, r, s, progress, x, y, w, h);
          if (kind === "season" && ["mungunza", "koesister", "baiao", "geelrys"].includes(K.recipe(r).id)) {
            const f = this.plan(r).parts[0].food;
            this.food(c, f, 480, 264, 245 * this.visualScale);
            return true;
          }
          if (kind === "scale" && progress < 1) {
            rect = this.art(c, "complete-preparation", 0, x, y, w, h);
            for (const [index, z] of this.fishZones().entries()) {
              if (!d.zones[index]) continue;
              c.save();
              c.beginPath();
              c.rect(z.x, z.y, z.w + 0.5, z.h + 0.5);
              c.clip();
              const clean = Art["complete-preparation"].frames[1], image = this.images["complete-preparation"];
              if (image?.naturalWidth) c.drawImage(image, clean.x, clean.y, clean.w, clean.h, rect.x, rect.y, rect.w, rect.h);
              c.restore();
            }
          } else if (kind === "fold" && progress < 1) {
            rect = this.art(c, "complete-preparation", 12, x, y, w, h);
            const corners = [[0, 0], [1, 0], [1, 1], [0, 1]];
            for (const index of d.placed) {
              const [cx, cy] = corners[index], px = rect.x + rect.w * (cx ? 0.81 : 0.19), py = rect.y + rect.h * (cy ? 0.8 : 0.2);
              c.fillStyle = "#7b985b";
              c.strokeStyle = "#385b3b";
              c.lineWidth = 2;
              c.beginPath();
              c.moveTo(px, py);
              c.lineTo(480 + (cx ? 36 : -36), 265);
              c.lineTo(480, 265 + (cy ? 27 : -27));
              c.closePath();
              c.fill();
              c.stroke();
            }
          } else if (kind === "shape") {
            c.save();
            c.globalAlpha = 1 - d.progress * 0.73;
            this.art(c, "complete-preparation", 11, x - 15, y, w * 0.57, h);
            c.restore();
            const food = this.plan(r).parts[0].food;
            for (let i = 0; i < d.placed.length; i++) {
              const targetX = 508 + i % 2 * 69, targetY = i === 2 ? 306 : 238;
              this.shadedFood(c, food, targetX, targetY - (i === d.placed.length - 1 ? bounce : 0), 74, 0, 0);
            }
            rect = true;
          } else {
            c.save();
            if (kind === "knead" && d.animation > 0 && !V.settings.reducedMotion) {
              c.translate(480, 270);
              c.scale(1 + Math.sin(d.animation * 15) * 0.045, 1 - Math.sin(d.animation * 15) * 0.045);
              c.translate(-480, -270);
            }
            rect = this.art(c, "complete-preparation", frame, x, y + bounce, w, h);
            c.restore();
          }
          if (kind === "wash" && d.phase === "work") {
            c.save();
            c.strokeStyle = "#9bcacb99";
            c.lineWidth = 2;
            for (let n = 0; n < 3; n++) {
              const phase = V.settings.reducedMotion ? n * 0.3 : (t * 0.7 + n / 3) % 1;
              c.beginPath();
              c.ellipse(480, 282, 40 + phase * 52, 12 + phase * 22, 0, 0, Math.PI * 2);
              c.stroke();
            }
            c.restore();
          }
        }
        return !!rect;
      },
      materials(r) {
        const s = K.step(r), title = s.title.toLowerCase();
        if (s.kind === "shape") return [{ frame: 11, label: "Massa preparada" }, { frame: 11, label: "Por\xE7\xE3o de massa" }, { frame: 11, label: "Por\xE7\xE3o de massa" }];
        if (/postas|peixe/.test(title)) return [{ frame: 1, label: "Peixe limpo" }, { frame: 3, label: "Cebola picada" }, { frame: 15, label: "Legumes picados" }];
        if (/folha|calulu|quiabo/.test(title)) return [{ frame: 1, label: "Peixe preparado" }, { frame: 15, label: "Quiabo cortado" }, { frame: 14, label: "Folhas e temperos" }];
        if (/massa/.test(title)) return [{ frame: 9, label: "Massa misturada" }, { frame: 9, label: "Massa misturada" }, { frame: 9, label: "Massa misturada" }];
        return [{ frame: 7, label: "Ingredientes separados" }, { frame: 3, label: "Cebola picada" }, { frame: 15, label: "Legumes preparados" }];
      },
      drawMaterials(c, r) {
        const parts = this.materials(r);
        for (let i = 0; i < 3; i++) {
          const x = 296 + i * 141;
          this.rounded(c, x, 378, 86, 59, r.data.placed.includes(i) ? "#9bad96" : i === r.data.selected ? "#f3e1ad" : "#c5d0bf", "#547b66", 6);
          if (!r.data.placed.includes(i)) this.art(c, "complete-preparation", parts[i].frame, x + 12, 380, 62, 41);
          this.text(c, String(i + 1), x + 43, 445, 12, "#284d3d");
        }
        this.text(c, parts[r.data.selected].label, 480, 463, 12, "#254c3d");
      }
    };
    V.Assets.addLoader("cooking-workshop:load:1", function() {
      return W.load();
    });
    const dish = A.dish.bind(A);
    A.dish = function(id, size = 48) {
      const index = V.CookingData.recipes.findIndex((r) => r.output === id);
      if (index < 0) return dish(id, size);
      return '<span class="cooking-dish-art cooking-prepared-dish-art adv-icon" aria-hidden="true" style="--dish-size:' + Math.max(16, Number(size) || 48) + "px;--dish-x:" + index % 4 + ";--dish-y:" + Math.floor(index / 4) + `;background-image:url('assets/cooking/workshop/finished-plates.webp?v=20261102-workshop1')"></span>`;
    };
    V.AssetLoader.addGroupRule("cooking-workshop:group:1", function(key) {
      return key.startsWith("assets/cooking/workshop/") ? "cooking-workshop" : void 0;
    });
    A.ensure = function(world = false) {
      return V.MapAssets.ensure(world ? ["cooking-world"] : ["cooking", "cooking-workshop", "nature-food"], "Preparando a cozinha");
    };
    const reset = K.reset.bind(K);
    K.reset = function(r) {
      const out = reset(r);
      r.data.platingRevision = D.revision;
      r.data.platingMotion = [];
      r.data.dragServing = null;
      r.data.returnServing = null;
      r.data.effectAt = 0;
      return out;
    };
    const direction = K.direction.bind(K);
    K.direction = function(r, key) {
      if (K.step(r).kind !== "plate") return direction(r, key);
      W.ensure(r);
      if (["a", "arrowleft", "w", "arrowup"].includes(key)) {
        W.select(r, -1);
        return true;
      }
      if (["d", "arrowright", "s", "arrowdown"].includes(key)) {
        W.select(r, 1);
        return true;
      }
      return false;
    };
    const place = K.place.bind(K);
    K.place = function(r, index) {
      return K.step(r).kind === "plate" ? W.place(r, index) : place(r, index);
    };
    const point = K.point.bind(K);
    K.point = function(r) {
      if (K.step(r).kind === "plate") {
        W.ensure(r);
        return W.target(r, r.data.selected) || { x: 622, y: 272 };
      }
      if (K.step(r).kind === "scale") {
        const z = W.fishZones()[Math.max(0, r.data.zones.indexOf(false))];
        return { x: z.x + z.w / 2, y: z.y + z.h / 2 };
      }
      if (K.step(r).kind === "cut") return { x: 480 + (-88 + Math.min(4, Math.floor(r.data.progress * 5)) * 44) * W.visualScale, y: 265 };
      return point(r);
    };
    const stage = A.stage.bind(A);
    A.stage = function(c, s, p, ...rect) {
      return W.run ? W.stage(c, s, p, ...rect) : stage(c, s, p, ...rect);
    };
    const draw = C.draw.bind(C);
    C.draw = function(c, r) {
      W.ensure(r);
      if (K.step(r).kind === "plate") return W.drawServing(c, r);
      const before = W.run;
      W.run = r;
      try {
        return draw(c, r);
      } finally {
        W.run = before;
      }
    };
    const pointer = C.pointer.bind(C);
    C.pointer = function(r, type, p) {
      if (K.step(r).kind === "plate") return W.servingPointer(r, type, p);
      if (K.step(r).kind === "scale") return W.scrapePointer(r, type, p);
      return pointer(r, type, p);
    };
    const update = C.update.bind(C);
    C.update = function(r, dt) {
      const out = update(r, dt);
      W.ensure(r);
      for (const m of r.data.platingMotion) m.age += dt;
      r.data.platingMotion = r.data.platingMotion.filter((m) => m.age < 0.4);
      if (r.data.returnServing) {
        r.data.returnServing.age += dt;
        if (r.data.returnServing.age > 0.24) r.data.returnServing = null;
      }
      return out;
    };
    const controls = C.controls.bind(C);
    C.controls = function(r, h) {
      if (K.step(r).kind !== "plate") {
        const out = controls(r, h), kind = K.step(r).kind;
        if (kind === "bake" || kind === "steam") for (const button of h.querySelectorAll("button")) button.textContent = button.textContent.replace("Fogo", kind === "bake" ? "Calor" : "Vapor");
        return out;
      }
      W.ensure(r);
      if (r.data.phase === "done") return controls(r, h);
      const right = V.DuoChallenges.isChild && +new URLSearchParams(location.search).get("player") === 1, part = W.selected(r);
      h.append(P.button("cook-select-prev", right ? "\u2190 Escolher" : "A \xB7 Escolher", () => P.action("dir", "a")), P.button("cook-place", (right ? "Enter" : "E") + " \xB7 Servir " + D.foods[part.food].label, () => P.action("place")), P.button("cook-select-next", right ? "Escolher \u2192" : "Escolher \xB7 D", () => P.action("dir", "d")));
      if (r.data.placed.length) h.append(P.button("cook-undo", "Recolher \xFAltima por\xE7\xE3o", () => P.action("plate-undo")));
    };
    const action = C.action.bind(C);
    C.action = function(r, name, arg) {
      if (name === "plate-undo" && K.step(r).kind === "plate" && r.data.phase === "work" && r.data.placed.length) {
        const index = r.data.placed.pop();
        r.data.selected = index;
        r.data.progress = r.data.placed.length / W.plan(r).parts.length;
        r.data.platingMotion = [];
        P.controls();
        P.save();
        return;
      }
      return action(r, name, arg);
    };
    const model = C.model.bind(C);
    C.model = function(r) {
      const m = model(r);
      if (K.step(r).kind !== "plate") return m;
      W.ensure(r);
      const right = V.DuoChallenges.isChild && +new URLSearchParams(location.search).get("player") === 1;
      return { ...m, progress: r.data.step + (r.data.phase === "done" ? 1 : 0), support: m.support + " \xB7 " + r.data.placed.length + "/" + W.plan(r).parts.length + " por\xE7\xF5es", hint: "Arraste uma por\xE7\xE3o preparada at\xE9 o contorno dourado do prato. " + (right ? "\u2190/\u2192 escolhe; Enter serve." : "A/D escolhe; E serve.") };
    };
    const result = P.result.bind(P);
    P.result = function(r) {
      const out = result(r);
      if (r.game === V.CookingData.id) {
        const box = V.$(".pg-result");
        if (box) {
          box.querySelector(":scope > .cooking-dish-art, :scope > .nature-art")?.remove();
          const canvas = document.createElement("canvas");
          canvas.width = 400;
          canvas.height = 220;
          canvas.className = "cooking-finished-plate";
          canvas.setAttribute("aria-label", K.recipe(r).name + " montado com os ingredientes preparados");
          box.prepend(canvas);
          W.plate(canvas.getContext("2d"), r, 200, 113, 0.8, true);
        }
      }
      return out;
    };
  })();
});
