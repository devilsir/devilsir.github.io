"use strict";

globalThis.QuimiCraftAI = (() => {
  const attack = (kind, damage, range, windup, cooldown, effect = "") =>
    Object.freeze({kind, damage, range, windup, cooldown, effect});
  const profile = (temperament, hp, walk, run, sense, roam, strike, loot = []) =>
    Object.freeze({temperament, hp, walk, run, sense, roam, strike, loot: Object.freeze(loot.map(Object.freeze))});
  const guard = attack("shot", 11, 9, .38, 1.7, "guard");
  const species = Object.freeze({
    amber_ibis: profile("skittish",22,1.35,5.4,9,19,null,[["feather",2,3],["RUST_REED",1,1,.28]]),
    peat_slime: profile("hostile",32,.82,3.24,11,12,attack("lunge",9,2.25,.63,2.05,"corrosion"),
      [["acid_gel",1,3],["AMBER_PEAT",1,2]]),
    lumen_moth: profile("skittish",12,1.05,5.9,12,18,null,[["GLOW_FUNGUS",1,1],["crystal_shard",1,1,.24]]),
    rime_fox: profile("neutral",27,1.75,5.7,10,23,attack("lunge",8,1.8,.37,1.9),
      [["hide",1,2],["FROST_LICHEN",1,1,.27]]),
    travertine_guard: profile("hostile",61,.75,2.48,10,13,attack("slam",15,2.25,.96,3.2),
      [["TRAVERTINE",2,4],["BANDED_CALCITE",1,2]]),
    iron_armadillo: profile("neutral",42,1.08,4.45,7,17,attack("lunge",10,1.7,.41,2.5),
      [["hide",1,2],["HEMATITE_VEIN",1,1,.32]]),
    wild_boar: profile("neutral", 38, 1.14, 4.8, 9, 16, attack("lunge", 10, 1.9, .41, 1.92),
      [["raw_game", 2, 3], ["hide", 1, 2]]),
    flower_hare: profile("skittish", 10, 1.5, 5.4, 8, 16, null,[["raw_rabbit", 1, 2],["wild_mint", 1, 1,.21]]),
    snow_hare: profile("skittish", 13, 1.28, 5.15, 9, 19, null,[["raw_rabbit", 1, 2],["hide", 1, 1,.25]]),
    mountain_goat: profile("neutral", 39, 1.1, 4.7, 9, 20, attack("lunge", 9, 1.8, .44, 2.1),
      [["raw_game", 2, 3], ["wool", 1, 2]]),
    scoria_ram: profile("neutral", 52, .91, 3.95, 10, 15, attack("lunge", 13, 1.95, .53, 2.3),
      [["raw_game", 2, 3], ["SCORIA", 1, 2],["wool", 1, 2]]),
    savanna_gazelle: profile("skittish", 23, 1.55, 6.15, 10, 25, null,[["raw_game", 2, 3],["hide", 1, 2]]),
    cacao_tapir: profile("calm", 42, .98, 3.48, 5, 15, null,[["raw_game", 2, 4],["hide", 1, 2]]),
    marsh_heron: profile("skittish", 17, 1.16, 4.45, 9, 22, null,[["feather", 1, 3],["raw_seabass", 1, 1,.17]]),
    crystal_heron: profile("skittish", 21, 1.23, 4.78, 10, 23, null,[["feather", 1, 3],["FLUORITE", 1, 1,.15]]),
    lilac_songbird: profile("skittish", 12, 1.2, 5.2, 8, 20, null,
      [["feather", 1, 2], ["LAVENDER", 1, 1, .33]]),
    salt_marsh_rabbit: profile("skittish", 12, 1.43, 5.65, 8.2, 18, null,
      [["raw_rabbit", 1, 2], ["SALT_REED", 1, 2, .38]]),
    pyrite_crawler: profile("neutral", 42, 1.03, 4.35, 11, 18, attack("lunge", 10, 2.24, .55, 2.04),
      [["PYRITE", 1, 2], ["chitin", 1, 2]]),
    forest_deer: profile("skittish", 34, 1.55, 5.9, 11, 24, null,
      [["raw_venison", 3, 5], ["hide", 1, 2]]),
    mangrove_capivara: profile("calm", 31, 1.07, 3.3, 5.8, 16, null,
      [["hide", 2, 3], ["REED", 1, 1, .30]]),
    frost_owl: profile("skittish", 19, 1.25, 4.85, 10, 21, null,
      [["feather", 2, 3], ["bait", 1, 1, .18]]),
    glass_scorpion: profile("hostile", 37, 1.21, 5.05, 13, 19, attack("lunge", 13, 2.45, .48, 1.72, "toxicity"),
      [["chitin", 2, 3], ["BASALT_GLASS", 1, 2], ["aquamarine", 1, 1, .12]]),
    slime: profile("hostile", 26, .83, 2.6, 11, 15, attack("lunge", 7, 2.1, .48, 1.6, "corrosion"),
      [["acid_gel", 1, 2], ["unknown_residue", 1, 1, .22]]),
    cobrete: profile("neutral", 34, .85, 2.15, 8, 13, attack("melee", 8, 1.58, .38, 1.45),
      [["copper_core", 1, 1], ["COPPER", 1, 2], ["copper_ingot", 1, 1, .18]]),
    cristalume: profile("skittish", 17, 1.25, 3.7, 9, 17, null,
      [["crystal_shard", 1, 2], ["CRYSTAL", 1, 1], ["prism_pendant", 1, 1, .035]]),
    scorpion: profile("hostile", 23, 1.32, 4.75, 12, 17, attack("lunge", 9, 2.35, .37, 1.55, "toxicity"),
      [["chitin", 1, 2], ["acid_gel", 1, 1, .16]]),
    golem: profile("hostile", 76, .64, 1.85, 9, 12, attack("slam", 18, 2.25, .83, 2.7),
      [["OBSIDIAN", 1, 3], ["gold_nugget", 1, 2], ["CRYSTAL", 1, 1, .19]]),
    wisp: profile("hostile", 20, 1.1, 3.05, 15, 19, attack("shot", 8, 8.5, .62, 2.3, "electric"),
      [["wind_essence", 1, 2], ["crystal_shard", 1, 1, .14]]),
    magma: profile("hostile", 49, .79, 2.25, 12, 14, attack("slam", 13, 2.05, .62, 2.15, "fire"),
      [["BASALT", 1, 3], ["SULFUR", 1, 2], ["OBSIDIAN", 1, 1, .23]]),
    capivara: profile("calm", 25, .85, 2.9, 4.5, 14, null,
      [["hide", 1, 2]]),
    deer: profile("skittish", 28, 1.4, 5.55, 9, 20, null,
      [["raw_venison", 2, 4], ["hide", 1, 2]]),
    owl: profile("skittish", 14, 1.1, 4.1, 7, 19, null, [["feather", 1, 2]]),
    pig: profile("calm", 19, .95, 3.3, 4.25, 13, null, [["raw_pork", 2, 4], ["hide", 1, 1, .14]]),
    cow: profile("calm", 40, .69, 2.65, 4, 12, null, [["raw_beef", 3, 5], ["hide", 1, 2]]),
    rabbit: profile("skittish", 9, 1.62, 5.8, 8.5, 16, null, [["raw_rabbit", 1, 2]]),
    chicken: profile("skittish", 11, .92, 3.45, 5, 11, null, [["raw_chicken", 1, 2], ["feather", 1, 3]]),
    sheep: profile("calm", 26, .76, 2.85, 5, 12, null, [["raw_mutton", 2, 4], ["wool", 1, 3]])
  });
  const civilians = Object.freeze({
    seed_curator: profile("civilian",35,1.05,3.8,8,3.6,null),
    water_keeper: profile("civilian",46,1.21,3.86,8,3.5,null),
    cartographer: profile("civilian",40,1.35,4.2,10,4.7,null),
    metalsmith: profile("civilian",58,1.02,3.25,9,3.4,null),
    herbal_trader: profile("shop",39,1.19,3.51,8,3.6,null),
    lab_hydrologist: profile("civilian",41,.95,3.32,6,1.25,null),
    lab_mineralogist: profile("civilian",47,.83,3.1,6,1.45,null),
    lab_ecologist: profile("civilian",38,1.15,3.55,7,1.40,null),
    carbon: profile("civilian", 42, .76, 2.25, 5, 2.3, null),
    ranger: profile("guard", 64, 1.65, 4.65, 14, 11, guard),
    shop_armor: profile("shop", 58, .86, 2.65, 7, 2.5, null),
    shop_food: profile("shop", 36, 1.06, 3.35, 7, 2.3, null),
    shop_liquid: profile("shop", 40, .96, 3.1, 7, 2.3, null),
    shop_solid: profile("shop", 43, .93, 2.9, 7, 2.3, null),
    shop_trinket: profile("shop", 32, 1.14, 3.45, 7, 2.3, null),
    miner: profile("civilian", 52, 1.07, 3.45, 8, 6.4, null),
    farmer: profile("civilian", 45, 1.24, 3.6, 8, 7.5, null),
    fisher: profile("civilian", 37, 1.17, 3.85, 8, 6.3, null),
    botanist: profile("civilian", 34, 1.18, 3.65, 8, 7.5, null),
    teacher: profile("civilian", 38, 1.03, 3.15, 7, 5.8, null),
    glazier: profile("civilian", 39, 1.05, 3.22, 7.6, 5.8, null),
    ceramist: profile("civilian", 43, .99, 3.3, 7.4, 6.2, null),
    baker: profile("civilian", 35, 1.14, 3.53, 7.3, 5.2, null),
    geologist: profile("civilian", 48, .97, 3.17, 8.2, 6.8, null),
    mayor: profile("civilian", 44, 1.07, 3.4, 8, 6, null)
  });
  const resident = profile("civilian", 41, 1.08, 3.35, 7.5, 6, null);
  const heading = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
  const range = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const point = a => ({x: a.x, y: a.y, z: a.z});

  function getProfile(type, role) {
    return role ? civilians[role] || resident : species[type] || species.capivara;
  }

  function brain(home, phase = 0) {
    return {home: point(home), mode: "idle", goal: null, wait: .7 + phase * .22, memoryTime: 0,
      memory: null, retaliate: 0, fear: 0, swing: null, cooldown: 0, think: (phase % 3) * .1,
      pace: 0, route: [], routeDelay: 0, stalled: 0, panic: null, vision: null, recovering: 0, aim: 0};
  }

  function alarm(ai, type, threat) {
    if (type.temperament === "neutral") ai.retaliate = 8;
    if (type.temperament === "calm" || type.temperament === "skittish") {
      ai.fear = 5;
      ai.panic = point(threat);
    }
    if (type.strike) {
      ai.memoryTime = 4.5;
      ai.memory = point(threat);
    }
    ai.think = 0;
  }

  function tick(e, dt, sense, random = Math.random) {
    const a = e.ai;
    const p = e.profile;
    a.cooldown = Math.max(0, a.cooldown - dt);
    a.memoryTime = Math.max(0, a.memoryTime - dt);
    a.fear = Math.max(0, a.fear - dt);
    a.retaliate = Math.max(0, a.retaliate - dt);
    a.routeDelay -= dt;
    a.aim = Math.max(0, a.aim - dt);
    if ((a.think -= dt) <= 0) {
      a.think = .19 + random() * .13;
      a.vision = sense();
      const {enemy, threat} = a.vision;
      if (enemy?.visible) {
        a.memory = point(enemy.actor);
        a.memoryTime = 4.2;
      }
      if (threat?.visible) {
        a.panic = point(threat.actor);
        a.fear = Math.max(a.fear, threat.alarming ? 2.8 : .6);
      }
    }
    const perceived = a.vision || {};
    const enemy = perceived.enemy;
    if (a.swing) {
      const swing = a.swing;
      if (!swing.target.dead && !swing.target.ai?.recovering && (swing.remaining -= dt) <= 0) {
        a.swing = null;
        a.cooldown = p.strike.cooldown;
        a.aim = .27;
        return {mode: "strike", goal: null, aim: swing.target, speed: 0, strike: swing.target};
      }
      if (swing.target.dead || swing.target.ai?.recovering > 0) a.swing = null;
      else return {mode: "windup", goal: null, aim: swing.target, speed: 0};
    }
    if (a.fear > 0 && a.panic) {
      const away = heading(a.panic, e);
      const goal = {x: e.x + Math.sin(away) * 5, y: e.y, z: e.z + Math.cos(away) * 5};
      if (e.persistent && range(e, a.home) > p.roam * 1.5 + 1 && range(a.panic, a.home) > range(a.panic, e) + 1) {
        return {mode: "flee", goal: a.home, speed: p.run};
      }
      return {mode: "flee", goal, speed: p.run};
    }
    const homeDistance=range(e,a.home);
    const leash=p.roam+(e.persistent?6:18);
    if(!e.persistent&&e.habitat&&homeDistance>p.roam*1.15&&!enemy?.visible&&a.memoryTime<=0){
      a.goal=null;
      return {mode:"return",goal:a.home,speed:p.walk*1.32};
    }
    if (homeDistance > leash && !(e.persistent && p.temperament !== "guard" && a.fear)) {
      a.memoryTime = 0;
      return {mode: "return", goal: a.home, speed: p.run * .72};
    }
    if (p.strike && enemy?.visible && !enemy.actor.dead && enemy.dist <= p.strike.range) {
      if (p.strike.kind === "shot" && enemy.dist < 2.7 && a.cooldown > .2) {
        const angle = heading(enemy.actor, e);
        return {mode: "kite", goal: {x: e.x + Math.sin(angle) * 3, y: e.y, z: e.z + Math.cos(angle) * 3},
          aim: enemy.actor, speed: p.walk * 1.38};
      }
      if (a.cooldown <= 0) {
        a.swing = {target: enemy.actor, remaining: p.strike.windup};
        return {mode: "windup", goal: null, aim: enemy.actor, speed: 0};
      }
      if (a.aim > 0 || enemy.dist < p.strike.range * .78 || p.strike.kind === "shot") {
        return {mode: "recover", goal: null, aim: enemy.actor, speed: 0};
      }
    }
    if (a.memoryTime > 0 && a.memory && range(e, a.memory) > .65 &&
        (p.temperament === "hostile" || p.temperament === "guard" || a.retaliate > 0)) {
      return {mode: enemy?.visible ? "chase" : "search", goal: a.memory, speed: enemy?.visible ? p.run : Math.min(p.run,p.walk*1.52)};
    }
    if (perceived.greet && e.persistent) return {mode: "greet", goal: null, aim: perceived.greet, speed: 0};
    if (e.persistent && range(e, a.home) > p.roam + .7) return {mode: "return", goal: a.home, speed: p.walk};
    if (a.goal && range(e, a.goal) < .7) {
      a.goal = null;
      a.wait = .85 + random() * 2.3;
    }
    a.wait -= dt;
    if (a.goal && a.wait > 0) return {mode: e.persistent ? "patrol" : "wander", goal: a.goal, speed: p.walk};
    if (a.wait > 0) return {mode: "idle", goal: null, speed: 0};
    const angle = random() * Math.PI * 2;
    const radius = p.roam * (.33 + random() * .57);
    a.goal = {x: a.home.x + Math.sin(angle) * radius, y: a.home.y, z: a.home.z + Math.cos(angle) * radius};
    a.wait = 3 + radius / p.walk + random() * 1.5;
    return {mode: e.persistent ? "patrol" : "wander", goal: a.goal, speed: p.walk};
  }

  function findPath(start, destination, inspect, maxVisits = 66) {
    const sx = Math.floor(start.x);
    const sz = Math.floor(start.z);
    const length = range(start, destination);
    if (length < .6) return [];
    const scale = Math.min(1, 9 / length);
    const gx = Math.floor(start.x + (destination.x - start.x) * scale);
    const gz = Math.floor(start.z + (destination.z - start.z) * scale);
    const estimate = (x, z) => Math.hypot(gx - x, gz - z);
    const origin = {x: sx, z: sz, y: start.y, g: 0, h: estimate(sx, sz), from: null};
    const open = [origin];
    const cost = new Map([[sx + "," + sz, 0]]);
    const steps = [[1,0],[-1,0],[0,1],[0,-1]];
    let best = origin;

    for (let visits = 0; open.length && visits < maxVisits; visits++) {
      open.sort((a, b) => a.g + a.h - b.g - b.h || a.h - b.h);
      const node = open.shift();
      if (node.h < best.h) best = node;
      if (node.h === 0) break;
      for (const [dx, dz] of steps) {
        const x = node.x + dx;
        const z = node.z + dz;
        if (Math.abs(x - sx) > 10 || Math.abs(z - sz) > 10) continue;
        const key = x + "," + z;
        const y = inspect(x + .5, z + .5, node.y);
        if (!Number.isFinite(y)) continue;
        const g = node.g + 1 + Math.abs(y - node.y) * .48;
        if (g >= (cost.get(key) ?? Infinity)) continue;
        cost.set(key, g);
        open.push({x, y, z, g, h: estimate(x, z), from: node});
      }
    }
    const route = [];
    for (let node = best; node.from; node = node.from) route.unshift({x: node.x + .5, y: node.y, z: node.z + .5});
    return route;
  }

  function loot(p, random = Math.random, bonus = () => 0) {
    const result = [];
    for (const [id, min, max, chance = 1] of p.loot) {
      if (chance < 1 && random() >= chance) continue;
      result.push({id, count: min + Math.floor(random() * (max - min + 1)) + bonus(id)});
    }
    return result;
  }

  return {getProfile, brain, tick, alarm, findPath, loot, range, heading, types: Object.keys(species)};
})();
