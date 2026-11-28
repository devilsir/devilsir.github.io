"use strict";

globalThis.QuimiCraftElementalRifts = (() => {
  const materials = [
    ["RIFT_FIRE", "Fissura de Fogo", [255, 118, 42], "fire", 14],
    ["RIFT_WATER", "Fissura de Água", [56, 206, 248], "water", 13],
    ["RIFT_EARTH", "Fissura de Terra", [224, 174, 86], "earth", 12],
    ["RIFT_WIND", "Fissura de Vento", [156, 250, 232], "wind", 13],
    ["RIFT_ARCANE", "Fissura Arcana", [198, 124, 255], "arcane", 14],
    ["RIFT_ICE", "Fissura de Gelo", [148, 236, 255], "ice", 13],
    ["RIFT_LIGHTNING", "Fissura de Raio", [250, 232, 92], "lightning", 14],
    ["RIFT_NATURE", "Fissura da Natureza", [104, 242, 128], "nature", 13],
    ["RIFT_CONVERGENCE", "Núcleo da Convergência Elemental", [222, 242, 255], "nexus", 16]
  ];

  const items = {
    elemental_core: ["Núcleo Elemental", "#7ef2ff", "Essência cristalizada colhida de fissuras elementais ou de Senhores Elementais. Usada em magias de invocação e equipamentos místicos."]
  };

  const places = [
    {
      id: "fissura_fogo", name: "Forja da Fissura Ígnea", element: "fire",
      width: 15, depth: 15, height: 22,
      aliases: ["fogo", "fissura_de_fogo", "elemental_fogo"],
      biomes: ["vulcânico", "caldeira vítrea", "badlands", "deserto", "chapadas ocres"],
      actors: [
        ["fire_lord", 0, -4, 1], ["forge_lord", 0, 5, 1],
        ["fire_elemental", -6, -5, 1], ["fire_elemental", 6, -5, 1],
        ["fire_elemental", -6, 5, 1], ["fire_elemental", 6, 5, 1],
        ["cobalt_elemental", -9, 0, 1], ["cobalt_elemental", 9, 0, 1]
      ]
    },
    {
      id: "fissura_agua", name: "Santuário da Fissura das Marés", element: "water",
      width: 15, depth: 15, height: 20,
      aliases: ["agua", "fissura_de_agua", "elemental_agua"],
      biomes: ["delta salobro", "manguezal", "fiordes glaciais", "termas minerais", "pântano"],
      actors: [
        ["water_lord", 0, -4, 1], ["current_lord", 0, 5, 1],
        ["water_elemental", -6, -5, 1], ["water_elemental", 6, -5, 1],
        ["water_elemental", -6, 5, 1], ["water_elemental", 6, 5, 1]
      ]
    },
    {
      id: "fissura_terra", name: "Bastilha da Fissura Telúrica", element: "earth",
      width: 15, depth: 15, height: 22,
      aliases: ["terra", "fissura_de_terra", "elemental_terra"],
      biomes: ["cânion calcário", "chapadas ocres", "montanha", "badlands"],
      actors: [
        ["earth_lord", 0, -4, 1], ["geode_matriarch", 0, 5, 1],
        ["earth_elemental", -6, -5, 1], ["earth_elemental", 6, -5, 1],
        ["earth_elemental", -6, 5, 1], ["amethyst_golem", 6, 5, 1],
        ["iron_golem", -9, 0, 1]
      ]
    },
    {
      id: "fissura_vento", name: "Pináculo da Fissura dos Ventos", element: "wind",
      width: 15, depth: 15, height: 25,
      aliases: ["vento", "fissura_de_vento", "elemental_vento"],
      biomes: ["prado alpino", "montanha", "campina de aurora", "planície"],
      actors: [
        ["wind_lord", 0, -4, 2], ["storm_lord", 0, 5, 2],
        ["wind_elemental", -6, -5, 2], ["wind_elemental", 6, -5, 2],
        ["wind_elemental", -6, 5, 2], ["wind_elemental", 6, 5, 2],
        ["wisp", 0, 9, 2]
      ]
    },
    {
      id: "fissura_arcana", name: "Observatório da Fissura Arcana", element: "arcane",
      width: 15, depth: 15, height: 23,
      aliases: ["arcano", "fissura_arcana", "elemental_arcano"],
      biomes: ["bosque de cristais", "campina de aurora", "bosque lilás", "planície florida"],
      actors: [
        ["arcane_sentinel", 0, -4, 1], ["arcane_sentinel", -6, 4, 1], ["arcane_sentinel", 6, 4, 1],
        ["arcane_wisp", -7, -6, 2], ["arcane_wisp", 7, -6, 2],
        ["arcane_wisp", -4, 8, 2], ["arcane_wisp", 4, 8, 2]
      ]
    },
    {
      id: "fissura_gelo", name: "Catedral da Fissura Glacial", element: "ice",
      width: 15, depth: 15, height: 23,
      aliases: ["gelo", "fissura_de_gelo", "elemental_gelo"],
      biomes: ["fiordes glaciais", "tundra", "taiga", "prado alpino"],
      actors: [
        ["ice_lord", 0, -4, 1],
        ["ice_elemental", -6, -5, 1], ["ice_elemental", 6, -5, 1],
        ["ice_elemental", -6, 5, 1], ["ice_elemental", 6, 5, 1],
        ["aurora_phantom", -8, 0, 2], ["aurora_phantom", 8, 0, 2]
      ]
    },
    {
      id: "fissura_raio", name: "Torre da Fissura Tempestuosa", element: "lightning",
      width: 15, depth: 15, height: 25,
      aliases: ["raio", "fissura_de_raio", "tempestade", "elemental_raio"],
      biomes: ["montanha", "prado alpino", "chapadas ocres", "savana"],
      actors: [
        ["lightning_lord", 0, -4, 2], ["storm_lord", 0, 5, 2],
        ["lightning_elemental", -6, -5, 2], ["lightning_elemental", 6, -5, 2],
        ["lightning_elemental", -6, 5, 2], ["lightning_elemental", 6, 5, 2]
      ]
    },
    {
      id: "fissura_natureza", name: "Santuário da Fissura Viva", element: "nature",
      width: 15, depth: 15, height: 22,
      aliases: ["natureza", "fissura_natureza", "elemental_natureza"],
      biomes: ["floresta", "planície florida", "bosque de cerejeiras", "bosque lilás", "manguezal"],
      actors: [
        ["nature_lord", 0, -4, 1],
        ["nature_elemental", -6, -5, 1], ["nature_elemental", 6, -5, 1],
        ["nature_elemental", -6, 5, 1], ["nature_elemental", 6, 5, 1]
      ]
    },
    {
      id: "convergencia_elemental", name: "Convergência de Todos os Elementais", element: "all",
      width: 23, depth: 23, height: 29,
      aliases: ["convergencia", "nexus_elemental", "todos_elementais", "elementais"],
      biomes: ["planície", "planície florida", "campina de aurora", "bosque de cristais", "prado alpino"],
      actors: [
        ["fire_lord", -11, -11, 1], ["water_lord", 11, -11, 1],
        ["earth_lord", -11, 11, 1], ["wind_lord", 11, 11, 2],
        ["ice_lord", 0, -14, 1], ["lightning_lord", 14, 0, 2],
        ["nature_lord", -14, 0, 1], ["arcane_sentinel", 0, 14, 1],
        ["fire_elemental", -6, -6, 1], ["water_elemental", 6, -6, 1],
        ["earth_elemental", -6, 6, 1], ["wind_elemental", 6, 6, 2],
        ["ice_elemental", 0, -8, 1], ["lightning_elemental", 8, 0, 2],
        ["nature_elemental", -8, 0, 1], ["arcane_wisp", 0, 8, 2]
      ]
    }
  ];

  const tiles = new Map();
  const rgbHex = rgb => "#" + colorNumber(rgb).toString(16).padStart(6, "0");
  function colorNumber([r, g, b]) { return (r << 16) + (g << 8) + b; }
  const riftPatterns = {
    fire: {rock:[50,26,30], mark:(x,y)=>Math.abs(x-Math.sin(y*.32)*3.5)<(y+15)*.31||
      y>2&&Math.abs(x+8-Math.sin(y*.4)*2)<1.4},
    water: {rock:[19,63,115], mark:(x,y)=>Math.abs(Math.sin((y-Math.sin(x*.33)*3)*.48))<.24},
    earth: {rock:[72,53,42], mark:(x,y)=>Math.abs(y-Math.floor((x+16)/5)*3+8)<1.4||Math.abs(y+7)<1.4&&x<0},
    wind: {rock:[61,107,112], mark:(x,y,r)=>r>2&&r<13&&Math.abs(Math.sin(Math.atan2(y,x)*1.5+r*.42))<.26},
    arcane: {rock:[45,24,83], mark:(x,y,r)=>Math.abs(r-9)<1.35||Math.abs(Math.abs(x)+Math.abs(y)-15)<1||
      Math.abs(x)<2&&Math.abs(y)<2},
    ice: {rock:[54,105,158], mark:(x,y,r)=>r<13&&(Math.abs(x)<1.1||Math.abs(y)<1.1||
      Math.abs(Math.abs(x)-Math.abs(y))<1.05)},
    lightning: {rock:[41,48,63], mark:(x,y)=>Math.abs(x-(y<0?3-y*.49:-3-y*.46))<1.45||
      Math.abs(y)<1.45&&Math.abs(x)<4},
    nature: {rock:[39,75,41], mark:(x,y)=>Math.abs(Math.sqrt((x*.9+y*.30)**2+(y*.64-x*.20)**2)-7.6)<.9||
      Math.abs(x+y*.50)<1.1&&Math.abs(y)<12}
  };

  function register(B, defs) {
    materials.forEach(([key, name, color, style, range], index) => {
      const id = 730 + index, tile = 256 + index;
      B[key] = id;
      defs[id] = { name, icon: rgbHex(color), solid: true, tex: tile, hard: 1.55 };
      tiles.set(tile, { color, style });
    });
  }

  function paint(tile, x, y, hash) {
    const entry = tiles.get(tile);
    if (!entry) return null;
    const { color, style } = entry;
    const cx = x - 15.5, cy = y - 15.5, dist = Math.hypot(cx, cy);
    const noise = (hash(x, y, tile) - 0.5) * 16;
    if (style === "nexus") {
      const ang = Math.atan2(cy, cx);
      const r = 165 + Math.sin(ang * 2 + dist * 0.25) * 85 + noise;
      const g = 175 + Math.sin(ang * 2 + 2.1 + dist * 0.25) * 80 + noise;
      const b = 205 + Math.sin(ang * 2 + 4.2 + dist * 0.25) * 50 + noise;
      const ring = Math.abs(dist - 10) < 2.2 || dist < 4.5;
      return [r + (ring ? 50 : -20), g + (ring ? 50 : -20), b + (ring ? 40 : -15), 255];
    }
    const {rock,mark}=riftPatterns[style];
    const edge=Math.max(Math.abs(cx),Math.abs(cy));
    const active=edge<14.5&&mark(cx,cy,dist);
    const fringe=edge<14.5&&!active&&[[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dy])=>mark(cx+dx,cy+dy,dist));
    const texture=(hash(x>>2,y>>2,tile+27)-.5)*26+noise;
    return [...color.map((channel,i)=>active?channel+27+noise:fringe?rock[i]*.50+channel*.54+noise:
      rock[i]+texture*(edge>14?.45:1)),255];
  }

  function glowTileIds() {
    return Array.from(tiles.keys());
  }

  function lights(B) {
    return materials.map(([key, , color, , range]) => [B[key], { color: colorNumber(color), range, height: 1.0, steady: true }]);
  }

  const recipes = B => [
    ...materials.map(([key, name]) => ({ name: "Núcleo Elemental (" + name + ")", need: [[B[key], 1]], out: ["elemental_core", 2] }))
  ];

  const turns = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  function point(site, u, v) {
    const [dx, dz] = turns[site.turn];
    return [site.x + u * dz + v * dx, site.z - u * dx + v * dz];
  }

  function themePalette(B, element) {
    switch (element) {
      case "fire": return { floor: B.BASALT, wall: B.OBSIDIAN, trim: B.MAGMA_ROCK || B.RED_SAND, rift: B.RIFT_FIRE, accent: B.GLOWSTONE, liquid: B.LAVA };
      case "water": return { floor: B.MARBLE, wall: B.LIMESTONE, trim: B.ICE, rift: B.RIFT_WATER, accent: B.GLASS, liquid: B.WATER };
      case "earth": return { floor: B.DEEPSTONE, wall: B.STONE, trim: B.AMETHYST, rift: B.RIFT_EARTH, accent: B.GOLD, liquid: null };
      case "wind": return { floor: B.MARBLE, wall: B.SNOW, trim: B.GLASS, rift: B.RIFT_WIND, accent: B.SPECTRAL, liquid: null };
      case "arcane": return { floor: B.OBSIDIAN, wall: B.SLATE, trim: B.AMETHYST, rift: B.RIFT_ARCANE, accent: B.CRYSTAL, liquid: null };
      case "ice": return { floor: B.FROSTED_SOIL || B.SNOW, wall: B.ICE, trim: B.SNOW, rift: B.RIFT_ICE, accent: B.CRYSTAL, liquid: B.WATER };
      case "lightning": return { floor: B.SLATE, wall: B.BASALT, trim: B.BRONZE_BLOCK, rift: B.RIFT_LIGHTNING, accent: B.COPPER, liquid: null };
      case "nature": return { floor: B.MOSS, wall: B.WOOD, trim: B.LEAVES, rift: B.RIFT_NATURE, accent: B.LUMEN_FLOWER || B.GLOWSTONE, liquid: B.WATER };
      default: return { floor: B.MARBLE, wall: B.OBSIDIAN, trim: B.AMETHYST, rift: B.RIFT_CONVERGENCE, accent: B.CRYSTAL, liquid: null };
    }
  }

  const sanctumOrnaments={
    fire:"CONFLUX_FIRE_VOLCANO",water:"CONFLUX_WATER_FLOW",earth:"CONFLUX_EARTH_GEODE",wind:"CONFLUX_WIND_SPIRAL",
    arcane:"CONFLUX_ARCANE_CUBES",ice:"CONFLUX_ICE_FLAKE",lightning:"CONFLUX_LIGHTNING_CONDUCTOR",nature:"CONFLUX_NATURE_LEAF"
  };

  function create({ B, seed, hash, terrain, biome, water, maxY, origin, blocked, overlap }) {
    const sites = [];
    let initialized = false;
    const rand = (x, z, salt) => hash(x, z, (seed % 15485863) + 913 + salt);

    function makeSite(layout, x, z, turn, check) {
      const { width: w, depth: d, height } = layout;
      const site = { id: "erift:" + layout.id, layout, x, z, turn, actors: [] };
      const corners = [-w - 3, w + 3].flatMap(u => [-d - 3, d + 8].map(v => point(site, u, v)));
      const bounds = {
        left: Math.min(...corners.map(p => p[0])), right: Math.max(...corners.map(p => p[0])),
        front: Math.min(...corners.map(p => p[1])), rear: Math.max(...corners.map(p => p[1]))
      };
      const base = terrain(x, z), entrance = point(site, 0, d + 5), approach = terrain(...entrance);
      if (base < water + 2 || approach < water + 1 || base + height >= maxY - 2 || Math.abs(base - approach) > 6) return null;
      const ground = Array.from({ length: 3 }, (_, i) => [-1, 0, 1].map(side => terrain(...point(site, side * (w - 2), (i - 1) * (d - 2))))).flat();
      if (Math.min(...ground) < water || Math.max(...ground) - Math.min(...ground) > 20) return null;
      if (check) {
        if (sites.some(other => Math.hypot(x - other.x, z - other.z) < 185 ||
          (bounds.left <= other.bounds.right + 18 && bounds.right >= other.bounds.left - 18 &&
            bounds.front <= other.bounds.rear + 18 && bounds.rear >= other.bounds.front - 18)) || overlap(bounds, x, z)) return null;
        for (let px = bounds.left; px <= bounds.right; px += 7) for (let pz = bounds.front; pz <= bounds.rear; pz += 7) {
          if (blocked(px, pz)) return null;
        }
      }
      site.y = base; site.bounds = bounds; site.region = biome(x, z); site.approach = approach;
      site.mouth = { x: entrance[0] + 0.5, y: approach + 1, z: entrance[1] + 0.5 };
      for (const [index, [type, u, v, rise = 1]] of layout.actors.entries()) {
        const [ax, az] = point(site, u, v);
        site.actors.push({ id: site.id + ":" + index, type, x: ax + 0.5, y: base + rise + 1, z: az + 0.5 });
      }
      return site;
    }

    function initialize(saved) {
      if (initialized) return;
      initialized = true;
      for (const row of Array.isArray(saved) ? saved : []) {
        if (!Array.isArray(row) || row.length !== 4) continue;
        const [id, x, z, turn] = row, layout = places.find(p => p.id === id);
        if (!layout || sites.some(s => s.layout === layout) || ![x, z, turn].every(Number.isSafeInteger) || !turns[turn] ||
          Math.abs(x - origin.x) > 9500 || Math.abs(z - origin.z) > 9500) continue;
        const site = makeSite(layout, x, z, turn, false);
        if (site) sites.push(site);
      }
      for (const layout of places) {
        if (sites.some(s => s.layout === layout)) continue;
        for (let ring = 5; ring <= 125; ring++) {
          const candidates = [];
          for (let i = -ring; i < ring; i++) for (const [gx, gz] of [[i, -ring], [ring, i], [-i, ring], [-ring, -i]]) {
            const x = origin.x + gx * 74 + Math.floor(rand(gx, gz, 31) * 29) - 14;
            const z = origin.z + gz * 74 + Math.floor(rand(gx, gz, 57) * 29) - 14;
            const rank = layout.biomes.indexOf(biome(x, z));
            if (rank < 0 && ring < 24) continue;
            candidates.push({ x, z, score: Math.hypot(gx, gz) + (rank < 0 ? 18 : rank * 0.65) });
          }
          candidates.sort((a, b) => a.score - b.score);
          let site = null;
          for (const { x, z } of candidates) {
            const toward = ([dx, dz]) => (origin.x - x) * dx + (origin.z - z) * dz;
            const order = [0, 1, 2, 3].sort((a, b) => toward(turns[b]) - toward(turns[a]));
            for (const turn of order) {
              site = makeSite(layout, x, z, turn, true);
              if (site) break;
            }
            if (site) { sites.push(site); break; }
          }
          if (site) break;
        }
      }
    }

    function blueprint(site) {
      const columns = new Map(), { layout, y } = site, { width: w, depth: d, element } = layout;
      const pal = themePalette(B, element);
      const routines=QuimiCraftFactionRoutines;
      site.routineRooms=[];
      const key = (u, v) => u + "," + v;
      function col(u, v) {
        const id = key(u, v);
        if (!columns.has(id)) columns.set(id, { blocks: [], top: 0 });
        return columns.get(id);
      }
      function set(u, dy, v, block) {
        const c = col(u, v), at = y + dy;
        if (at < 1 || at >= maxY - 1) return;
        c.blocks[at] = block;
        c.top = Math.max(c.top, at);
      }
      function box(u1, a1, v1, u2, a2, v2, block) {
        for (let v = v1; v <= v2; v++) for (let u = u1; u <= u2; u++) {
          for (let dy = a1; dy <= a2; dy++) set(u, dy, v, block);
        }
      }
      function platform(u, v, level, block) {
        const ground = terrain(...point(site, u, v)), c = col(u, v);
        const topClear = Math.max(ground, level + 16);
        for (let at = Math.min(ground, level - 3); at <= topClear; at++) {
          if (at < 1 || at >= maxY - 1) continue;
          c.blocks[at] = at < level ? pal.wall : at === level ? block : B.AIR;
        }
        c.top = Math.max(c.top, topClear);
      }
      function coveredRoom(u,v,kind,theme,pieces,station){
        for(let x=u-3;x<=u+3;x++)for(let z=v-3;z<=v+3;z++)
          platform(x,z,y,Math.abs(x-u)===3||Math.abs(z-v)===3?theme.trim:theme.floor);
        box(u-3,1,v-3,u+3,4,v+3,theme.wall);
        box(u-2,1,v-2,u+2,4,v+2,B.AIR);
        box(u-3,5,v-3,u+3,5,v+3,theme.trim);
        box(u-2,6,v-2,u+2,6,v+2,theme.wall);
        box(u-1,1,v+3,u+1,3,v+3,B.AIR);
        box(u-1,4,v+3,u+1,4,v+3,theme.trim);
        box(u-1,0,v+4,u+1,0,v+4,theme.floor);
        box(u-1,1,v+4,u+1,3,v+4,B.AIR);
        set(u,4,v-3,theme.rift);
        set(u,6,v+2,theme.rift);
        const slots=[[-2,-2],[2,-2],[-2,1],[2,1],[0,-2]];
        for(const [i,name] of pieces.entries()){
          const [x,z]=slots[i];
          set(u+x,1,v+z,B[name]);
        }
        if(station)set(u+2,1,v-1,station);
        routines.addChamber(site,point,kind,0,u,y+1,v,[u,v+4]);
      }

      const R = w - 2;
      // Circular / octagonal sculpted elemental sanctum floor
      for (let v = -R - 1; v <= R + 1; v++) for (let u = -R - 1; u <= R + 1; u++) {
        const dist = Math.hypot(u, v);
        if (dist > R + 0.5) continue;
        const rim = dist > R - 1.5;
        const cross = (Math.abs(u) <= 1 || Math.abs(v) <= 1) && dist < R - 1;
        const innerRing = Math.abs(dist - Math.floor(R * 0.55)) < 0.9;
        let blk = pal.floor;
        if (rim) blk = pal.wall;
        else if (innerRing) blk = pal.trim;
        else if (cross && dist > 3) blk = pal.accent;
        platform(u, v, y, blk);
      }
      // Entrance causeway
      for (let v = R; v <= d + 4; v++) for (let u = -2; u <= 2; u++) {
        const t = Math.max(0, Math.min(1, (v - R) / Math.max(1, d + 4 - R)));
        const level = Math.round(y + (site.approach - y) * t);
        platform(u, v, level, Math.abs(u) === 2 ? pal.trim : pal.floor);
      }

      // Flat plots beside the approach leave room for player-built structures.
      const plots = element === "all"
        ? [[-11, 4, "water"], [11, 4, "fire"], [-7, 12, "earth"], [7, 12, "wind"],
          [-11, -4, "nature"], [11, -4, "lightning"], [-7, -12, "ice"], [7, -12, "arcane"]]
        : [[-6, 2, element], [6, 2, element]];
      for (const [px, pz, kind] of plots) {
        const theme = themePalette(B, kind);
        for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
          const border = Math.abs(dx) === 2 || Math.abs(dz) === 2;
          platform(px + dx, pz + dz, y, border ? theme.trim : theme.floor);
        }
        set(px - 2, 0, pz + 2, theme.rift);
        set(px + 2, 0, pz + 2, theme.rift);
      }

      const display=QuimiCraftFactionBuilding.display(B,"elemental");
      for(const side of [-1,1]){
        const center=side*6;
        for(const [u,level,v,id] of display){
          const x=center+u,z=d+2+v;
          if(level===0)platform(x,z,y,id);
          else set(x,level,z,id);
        }
        for(let u=-2;u<=2;u++)for(let v=2;v<=3;v++)platform(center+u,d+2+v,y,pal.floor);
        for(const [u,v,id] of QuimiCraftFactionBuilding.courtyard(B,"elemental",side))
          set(center+u,1,d+2+v,id);
      }

      if (element === "all") {
        // GRAND ELEMENTAL CONVERGENCE: 8 themed elemental shrines ringing a colossal central Prismatic Rift!
        const allElems = ["fire", "water", "earth", "wind", "ice", "lightning", "nature", "arcane"];
        for (let i = 0; i < 8; i++) {
          const ang = i * (Math.PI / 4);
          const ep = themePalette(B, allElems[i]);
          const px = Math.round(Math.cos(ang) * 15), pz = Math.round(Math.sin(ang) * 15);
          // Stepped elemental shrine pedestal + themed towering obelisk + glowing elemental rift core
          box(px - 2, 0, pz - 2, px + 2, 0, pz + 2, ep.floor);
          box(px - 2, 1, pz - 2, px + 2, 1, pz + 2, ep.trim);
          box(px - 1, 2, pz - 1, px + 1, 2, pz + 1, ep.wall);
          // Twin framing spires
          const tx = Math.round(-Math.sin(ang) * 2), tz = Math.round(Math.cos(ang) * 2);
          box(px + tx, 2, pz + tz, px + tx, 11, pz + tz, ep.wall);
          box(px - tx, 2, pz - tz, px - tx, 11, pz - tz, ep.wall);
          set(px + tx, 12, pz + tz, ep.rift);
          set(px - tx, 12, pz - tz, ep.rift);
          // Central vertical rift fissure for this element
          for (let h = 3; h <= 9; h++) set(px, h, pz, h % 3 === 0 ? ep.accent : ep.rift);
          // Elemental energy conduit line running along the floor toward central Convergence!
          for (let s = 4; s <= 12; s++) {
            const lx = Math.round(Math.cos(ang) * s), lz = Math.round(Math.sin(ang) * s);
            set(lx, 0, lz, s % 2 === 0 ? ep.rift : ep.trim);
          }
        }
        // Central Grand Convergence Rift Arena: raised stepped dais + colossal floating 3-ring prismatic portal!
        box(-4, 1, -4, 4, 1, 4, B.OBSIDIAN);
        box(-3, 2, -3, 3, 2, 3, B.AMETHYST);
        box(-2, 2, -2, 2, 2, 2, B.RIFT_CONVERGENCE);
        // Colossal arching Convergence portal frame + floating vertical prismatic fissure!
        for (let h = 3; h <= 20; h++) {
          const spread = Math.round(Math.sin((h - 3) / 17 * Math.PI) * 3);
          for (const s of [-1, 1]) {
            set(s * (3 + Math.floor(spread * 0.5)), h, 0, h % 4 === 0 ? B.RIFT_CONVERGENCE : B.OBSIDIAN);
            set(0, h, s * (3 + Math.floor(spread * 0.5)), h % 4 === 0 ? B.RIFT_CONVERGENCE : B.AMETHYST);
          }
          if (h >= 5 && h <= 17) {
            const wRift = h >= 8 && h <= 14 ? 1 : 0;
            for (let rx = -wRift; rx <= wRift; rx++) set(rx, h, 0, B.RIFT_CONVERGENCE);
          }
        }
        box(-2, 21, -2, 2, 21, 2, B.OBSIDIAN);
        set(0, 22, 0, B.RIFT_CONVERGENCE);
        set(0, 23, 0, B.RIFT_CONVERGENCE);
        coveredRoom(-8,-d+2,"quarters",themePalette(B,"arcane"),[
          "CONFLUX_EIGHT_ALTAR","CONFLUX_EQUILIBRIUM_ARCH",sanctumOrnaments.ice,sanctumOrnaments.nature,sanctumOrnaments.water
        ]);
        coveredRoom(8,-d+2,"workshop",themePalette(B,"lightning"),[
          sanctumOrnaments.fire,sanctumOrnaments.earth,sanctumOrnaments.wind,sanctumOrnaments.arcane,sanctumOrnaments.lightning
        ],B.METAL_FORGE);
        routines.addRoom(site,point,"hall",0,y+1,[[-7,-8],[7,-8],[-5,-10],[5,-10],[0,-9]]);
        return columns;
      }

      // INDIVIDUAL THEMED ELEMENTAL RIFT & CONSTRUCTION SANCTUM
      // 1) Central Glowing Elemental Rift Fissure (cracked ground + floating vertical energy tear!)
      box(-2, 0, -2, 2, 0, 2, pal.trim);
      box(-1, 0, -1, 1, 0, 1, pal.rift);
      // Jagged vertical elemental fissure hanging above the dais
      for (let h = 2; h <= 11; h++) {
        const shift = Math.round(Math.sin(h * 0.9) * 1.1);
        set(shift, h, 0, pal.rift);
        if (h >= 4 && h <= 8) set(shift + 1, h, 0, h % 2 === 0 ? pal.rift : pal.accent);
      }
      // Arching framing portal pillars around the fissure
      for (const s of [-1, 1]) {
        box(s * 3, 1, -1, s * 3, 12, 1, pal.wall);
        box(s * 3, 13, 0, s * 2, 13, 0, pal.trim);
        set(s * 3, 7, 0, pal.rift);
      }
      box(-2, 14, 0, 2, 14, 0, pal.trim);
      set(0, 15, 0, pal.rift);

      // 2) 4 Corner Elemental Construction Towers + Thematic Architectural Details
      const cornerOff = 8;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const cx = sx * cornerOff, cz = sz * cornerOff;
        box(cx - 1, 1, cz - 1, cx + 1, 2, cz + 1, pal.wall);
        if (element === "fire") {
          // Magma forge chimneys with lava basins
          box(cx, 3, cz, cx, 10, cz, B.OBSIDIAN);
          set(cx, 11, cz, pal.rift);
          set(cx - sx * 2, 0, cz - sz * 2, B.LAVA);
          set(cx - sx * 2, 1, cz - sz * 2, B.AIR);
        } else if (element === "water") {
          // Cascading waterfall aqueduct pillars + turquoise pools
          box(cx, 3, cz, cx, 9, cz, pal.wall);
          set(cx, 10, cz, pal.rift);
          box(cx - sx * 2, 0, cz - sz * 2, cx - sx * 3, 0, cz - sz * 3, B.WATER);
        } else if (element === "earth") {
          // Stepped giant basalt & amethyst geode monoliths
          box(cx - 1, 3, cz - 1, cx + 1, 7, cz + 1, pal.wall);
          box(cx, 8, cz, cx, 12, cz, pal.trim);
          set(cx, 13, cz, pal.rift);
        } else if (element === "wind") {
          // Floating sky-stone spires hovering above air gaps!
          box(cx, 1, cz, cx, 3, cz, pal.wall);
          box(cx, 6, cz, cx, 11, cz, pal.floor);
          set(cx, 12, cz, pal.rift);
          box(cx - 1, 8, cz - 1, cx + 1, 8, cz + 1, pal.trim);
        } else if (element === "ice") {
          // Jagged crystalline frost spires & frozen arches
          box(cx, 3, cz, cx, 12, cz, B.ICE);
          set(cx, 13, cz, pal.rift);
          set(cx - sx, 5, cz, B.SNOW);
          set(cx, 7, cz - sz, B.SNOW);
        } else if (element === "lightning") {
          // Tall bronze/copper lightning conductor coils!
          box(cx, 3, cz, cx, 13, cz, B.BRONZE_BLOCK);
          for (const h of [6, 9, 12]) box(cx - 1, h, cz - 1, cx + 1, h, cz + 1, h === 12 ? pal.rift : B.COPPER);
          set(cx, 14, cz, pal.rift);
        } else if (element === "nature") {
          // Ancient mossy root-pillars crowned with foliage canopies & glowing blooms
          box(cx, 3, cz, cx, 9, cz, B.WOOD);
          box(cx - 2, 9, cz - 2, cx + 2, 10, cz + 2, B.LEAVES);
          set(cx, 11, cz, pal.rift);
          set(cx - sx * 2, 1, cz - sz * 2, B.LUMEN_FLOWER || B.POPPY);
        } else {
          // Arcane obsidian prism obelisks with amethyst rings
          box(cx, 3, cz, cx, 11, cz, B.OBSIDIAN);
          box(cx - 1, 7, cz - 1, cx + 1, 7, cz + 1, B.AMETHYST);
          set(cx, 12, cz, pal.rift);
        }
      }

      // 3) Perimeter Low Broken Walls / Archways (open on south entrance)
      for (let u = -7; u <= 7; u++) {
        if (Math.abs(u) > 2) {
          box(u, 1, -11, u, Math.abs(u) % 2 === 0 ? 4 : 3, -11, pal.wall);
          if (Math.abs(u) === 5) set(u, 5, -11, pal.rift);
        }
        box(-11, 1, u, -11, Math.abs(u) % 2 === 0 ? 4 : 3, u, pal.wall);
        box(11, 1, u, 11, Math.abs(u) % 2 === 0 ? 4 : 3, u, pal.wall);
        if (Math.abs(u) === 5) { set(-11, 5, u, pal.rift); set(11, 5, u, pal.rift); }
      }
      const companion={
        fire:"earth",water:"ice",earth:"nature",wind:"lightning",arcane:"wind",ice:"water",lightning:"fire",nature:"water"
      }[element];
      coveredRoom(-5,-d,"quarters",pal,["CONFLUX_EQUILIBRIUM_ARCH",sanctumOrnaments[element],"CONFLUX_EIGHT_ALTAR"]);
      const station=({fire:B.METAL_FORGE,earth:B.FURNACE,arcane:B.LAB,lightning:B.METAL_FORGE})[element];
      coveredRoom(5,-d,"workshop",pal,[sanctumOrnaments[companion],sanctumOrnaments[element]],station);
      routines.addRoom(site,point,"hall",0,y+1,[[-5,-7],[5,-7],[-2,-8],[2,-8],[0,-8]]);
      return columns;
    }

    function at(x, z, margin = 0) {
      return sites.find(({ bounds: b }) => x >= b.left - margin && x <= b.right + margin && z >= b.front - margin && z <= b.rear + margin);
    }
    function columnAt(x, z) {
      const site = at(x, z);
      if (!site) return null;
      const [dx, dz] = turns[site.turn], rx = x - site.x, rz = z - site.z;
      if (!site.columns) {
        site.columns = blueprint(site);
        for (const column of site.columns.values()) {
          while (column.top > 0 && !column.blocks[column.top]) column.top--;
        }
      }
      return site.columns.get((rx * dz - rz * dx) + "," + (rx * dx + rz * dz)) ?? null;
    }
    return {
      initialize, column: columnAt, at, list: () => sites,
      save: () => sites.map(({ layout, x, z, turn }) => [layout.id, x, z, turn]),
      nearby: (x, z, radius) => sites.filter(site => Math.hypot(site.x - x, site.z - z) <= radius)
    };
  }

  return { materials, items, places, register, paint, glowTileIds, lights, recipes, create };
})();
