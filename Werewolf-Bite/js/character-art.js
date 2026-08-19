(function () {
  "use strict";

  var D = window.WB_DATA;
  var U = window.WB_UTIL;
  var PT = window.WB_I18N || { label: function (value) { return value; } };
  var portraitSerial = 0;
  var staticPresets = window.WB_SVG_PRESETS || [];

  var appearance = {
    skin: [
      "Ash",
      "Umber",
      "Pale",
      "Onyx",
      "Russet",
      "Silver",
      "Sable",
      "Alabaster",
    ],
    eyes: [
      "Amber",
      "Crimson",
      "Ice",
      "Violet",
      "Emerald",
      "White",
      "Gold",
      "Moonstone",
    ],
    eyeGlow: ["Dormant", "Gleaming", "Radiant", "Eclipse"],
    hairColor: [
      "Raven",
      "Ashen",
      "Silver",
      "Umber",
      "Russet",
      "Blood",
      "Moonlight",
      "Obsidian",
    ],
    accessories: [
      "None",
      "Silver Ear Cuffs",
      "Blood Crystal Earrings",
      "Ritual Veil",
      "Raven Feather",
      "Chain Halo",
      "Reliquary Brooch",
      "Thorn Crown",
    ],
    metals: [
      "Blackened Silver",
      "Grave Iron",
      "Moon Silver",
      "Blood Bronze",
      "Ancient Gold",
      "Obsidian",
    ],
    accents: [
      "Night Blue",
      "Crimson",
      "Bone",
      "Moss",
      "Violet",
      "Ash",
      "Ember",
      "Teal",
    ],
    backgrounds: [
      "Exile",
      "Survivor",
      "Acolyte",
      "Outrider",
      "Heir",
      "Bell Warden",
      "Grave Pilgrim",
      "Rift Touched",
    ],
    portraits: [],
  };

  var factionAppearance = {
    moonborn: {
      skin: ["Ash", "Umber", "Onyx", "Russet", "Silver", "Sable", "Alabaster"],
      accessories: ["None"],
      metals: ["Blackened Silver", "Grave Iron", "Moon Silver", "Ancient Gold", "Obsidian"],
      accents: ["Night Blue", "Bone", "Moss", "Violet", "Ash", "Ember", "Teal"]
    },
    bloodbound: {
      skin: ["Ash", "Umber", "Pale", "Onyx", "Russet", "Sable", "Alabaster"],
      accessories: ["None", "Silver Ear Cuffs", "Blood Crystal Earrings", "Ritual Veil", "Raven Feather", "Chain Halo", "Reliquary Brooch", "Thorn Crown"],
      metals: ["Blackened Silver", "Grave Iron", "Blood Bronze", "Ancient Gold", "Obsidian"],
      accents: ["Crimson", "Bone", "Violet", "Ash", "Ember", "Teal"]
    }
  };

  function optionsFor(source, faction) {
    var bloodline = faction === "bloodbound" ? "bloodbound" : "moonborn";
    var curated = factionAppearance[bloodline] && factionAppearance[bloodline][source];
    return (curated || appearance[source] || []).slice();
  }

  // Campos visuais antigos permanecem apenas como valores internos fixos para
  // compatibilidade com o renderer e saves existentes; não são personalizáveis.
  var fixedVisual = {
    moonborn: {
      hair: "feral crown",
      beard: "none",
      marking: "none",
      outfit: "wanderer",
      cloak: "none",
    },
    bloodbound: {
      hair: "razor crop",
      beard: "none",
      marking: "none",
      outfit: "wanderer",
      cloak: "none",
    },
  };

  var defaults = {
    moonborn: {
      skin: "ash",
      eyes: "amber",
      eyeGlow: "radiant",
      hairColor: "obsidian",
      accessory: "none",
      metal: "moon silver",
      accent: "night blue",
      background: "survivor",
      portrait: "moonborn_howlwarden",
    },
    bloodbound: {
      skin: "pale",
      eyes: "crimson",
      eyeGlow: "dormant",
      hairColor: "raven",
      accessory: "none",
      metal: "blood bronze",
      accent: "crimson",
      background: "heir",
      portrait: "bloodbound_crimson_moon",
    },
  };

  var rarityColors = {
    common: "#9aa0aa",
    uncommon: "#72b67a",
    rare: "#5b9cf0",
    epic: "#af74e4",
    legendary: "#e0aa52",
    mythic: "#ff6f83",
    cursed: "#8052b5",
  };
  var skinColors = {
    ash: ["#898992", "#555661", "#b8b8bf"],
    umber: ["#805a49", "#4c332f", "#aa7a62"],
    pale: ["#c8b4b7", "#7e626d", "#ead7d5"],
    onyx: ["#3b3944", "#1e1d26", "#666270"],
    russet: ["#9a5547", "#5b2d2c", "#c4775f"],
    silver: ["#a7b0b8", "#5d6872", "#d6dde0"],
    sable: ["#56483f", "#27231f", "#817065"],
    alabaster: ["#d8d0c8", "#8c7e7b", "#f2ebe2"],
  };
  var eyeColors = {
    amber: "#ffc85f",
    crimson: "#ff4058",
    ice: "#8edcff",
    violet: "#bd8dff",
    emerald: "#6ff3a7",
    white: "#ffffff",
    gold: "#ffe28b",
    moonstone: "#b7c9ff",
  };
  var hairColors = {
    raven: ["#13161d", "#262c36"],
    ashen: ["#242932", "#3d4552"],
    silver: ["#3a4654", "#667383"],
    umber: ["#30211c", "#4c352d"],
    russet: ["#3c1f1b", "#65352e"],
    blood: ["#37111a", "#5e1d2b"],
    moonlight: ["#243544", "#42596c"],
    obsidian: ["#0d1016", "#1e2530"],
  };
  var accentColors = {
    "night blue": ["#345b91", "#82a9dd"],
    crimson: ["#8f1d31", "#e3596d"],
    bone: ["#8d806b", "#d7c8aa"],
    moss: ["#3f6653", "#83a77c"],
    violet: ["#62447e", "#b48bd0"],
    ash: ["#555a64", "#aab0b8"],
    ember: ["#89412e", "#e58554"],
    teal: ["#276a6b", "#6fc5bd"],
  };
  var metalColors = {
    "blackened silver": ["#3d414b", "#9ba5b2", "#d5dbe0"],
    "grave iron": ["#414149", "#747681", "#b0b0b4"],
    "moon silver": ["#7f91a4", "#c6d4e1", "#f2f5f2"],
    "blood bronze": ["#6c352e", "#aa654f", "#e0a07a"],
    "ancient gold": ["#6c512a", "#af8445", "#ebce85"],
    obsidian: ["#252331", "#514b63", "#8d81a6"],
  };

  D.appearance = appearance;

  function esc(value) {
    return String(value == null ? "" : value).replace(
      /[&<>'"]/g,
      function (ch) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        }[ch];
      },
    );
  }

  var presetById = {};
  staticPresets.forEach(function (preset) {
    presetById[preset.id] = preset;
  });

  function presetsForFaction(faction) {
    var bloodline = faction === "bloodbound" ? "bloodbound" : "moonborn";
    return staticPresets.filter(function (preset) {
      return preset.faction === bloodline;
    });
  }

  function presetOptions(faction) {
    return presetsForFaction(faction).map(function (preset) {
      return { id: preset.id, label: preset.label };
    });
  }

  function presetLabel(id) {
    return presetById[id] ? presetById[id].label : id;
  }

  function defaultPresetId(faction) {
    var list = presetsForFaction(faction);
    return list.length ? list[0].id : "";
  }

  function normalizePreset(rawPortrait, faction) {
    var allowed = presetOptions(faction).map(function (entry) {
      return entry.id;
    });
    var candidate = lower(rawPortrait);
    if (allowed.indexOf(candidate) >= 0) return candidate;
    return defaultPresetId(faction);
  }

  function lower(value) {
    return String(value == null ? "" : value)
      .trim()
      .toLowerCase();
  }

  var appearanceValueAliases = {
    hair: {
      "wild": "feral crown",
      "feral crown": "feral crown",
      "braided": "war braids",
      "war braids": "war braids",
      "cropped": "razor crop",
      "razor crop": "razor crop",
      "crested": "cathedral crest",
      "cathedral crest": "cathedral crest",
      "long": "velvet lengths",
      "velvet lengths": "velvet lengths",
      "shorn": "ritual shave",
      "ritual shave": "ritual shave",
      "ritual knots": "reliquary knots",
      "reliquary knots": "reliquary knots",
      "moon mane": "moon mane",
      "swept": "noble sweep",
      "noble sweep": "noble sweep",
    },
    beards: {
      "none": "none",
      "stubble": "ash stubble",
      "ash stubble": "ash stubble",
      "goatee": "dagger goatee",
      "dagger goatee": "dagger goatee",
      "full beard": "court beard",
      "court beard": "court beard",
      "braided beard": "chain braids",
      "chain braids": "chain braids",
      "imperial": "imperial fang",
      "imperial fang": "imperial fang",
      "feral ruff": "feral ruff",
      "moon braids": "moon braids",
    },
  };

  function remapAppearanceValue(sourceKey, value) {
    var candidate = lower(value);
    var aliases = appearanceValueAliases[sourceKey];
    return aliases && aliases[candidate] ? aliases[candidate] : candidate;
  }

  function hairStyleToken(value) {
    var token = lower(value);
    return {
      "feral crown": "wild",
      "war braids": "braided",
      "razor crop": "cropped",
      "cathedral crest": "crested",
      "velvet lengths": "long",
      "ritual shave": "shorn",
      "reliquary knots": "ritual knots",
      "moon mane": "moon mane",
      "noble sweep": "swept",
      "wild": "wild",
      "braided": "braided",
      "cropped": "cropped",
      "crested": "crested",
      "long": "long",
      "shorn": "shorn",
      "ritual knots": "ritual knots",
      "swept": "swept",
    }[token] || token;
  }

  function beardStyleToken(value) {
    var token = lower(value);
    return {
      "ash stubble": "stubble",
      "dagger goatee": "goatee",
      "court beard": "full beard",
      "chain braids": "braided beard",
      "imperial fang": "imperial",
      "feral ruff": "feral ruff",
      "moon braids": "moon braids",
      "stubble": "stubble",
      "goatee": "goatee",
      "full beard": "full beard",
      "braided beard": "braided beard",
      "imperial": "imperial",
    }[token] || token;
  }

  function valuesFor(key) {
    var source = appearance[key] || appearance[key + "s"] || [];
    return source.map(lower);
  }

  function normalizeAppearance(raw, faction) {
    var bloodline = faction === "bloodbound" ? "bloodbound" : "moonborn";
    var source = raw || {};
    var result = {};
    var fields = {
      skin: "skin",
      eyes: "eyes",
      eyeGlow: "eyeGlow",
      hairColor: "hairColor",
      metal: "metals",
      accent: "accents",
      background: "backgrounds",
    };
    Object.keys(fields).forEach(function (key) {
      var allowed = optionsFor(fields[key], bloodline).map(lower);
      var candidate = lower(
        source[key] !== undefined ? source[key] : defaults[bloodline][key],
      );
      result[key] =
        allowed.indexOf(candidate) >= 0 ? candidate : defaults[bloodline][key];
    });

    if (bloodline === "bloodbound") {
      var allowedAccessories = optionsFor("accessories", bloodline).map(lower);
      var accessoryCandidate = lower(
        source.accessory !== undefined
          ? source.accessory
          : defaults[bloodline].accessory,
      );
      result.accessory =
        allowedAccessories.indexOf(accessoryCandidate) >= 0
          ? accessoryCandidate
          : defaults[bloodline].accessory;
    } else {
      result.accessory = "none";
    }

    Object.assign(result, fixedVisual[bloodline]);
    result.portrait = normalizePreset(
      source.portrait !== undefined
        ? source.portrait
        : defaults[bloodline].portrait,
      bloodline,
    );
    return result;
  }

  function randomAppearance(faction) {
    var bloodline = faction === "bloodbound" ? "bloodbound" : "moonborn";
    var result = {};
    var fields = {
      skin: "skin",
      eyes: "eyes",
      eyeGlow: "eyeGlow",
      hairColor: "hairColor",
      metal: "metals",
      accent: "accents",
      background: "backgrounds",
    };
    Object.keys(fields).forEach(function (key) {
      result[key] = lower(U.pick(optionsFor(fields[key], bloodline)));
    });
    result.accessory =
      bloodline === "bloodbound"
        ? lower(U.pick(optionsFor("accessories", bloodline)))
        : "none";
    var portraitChoices = presetOptions(bloodline);
    result.portrait = portraitChoices.length
      ? normalizePreset(U.pick(portraitChoices).id, bloodline)
      : defaults[bloodline].portrait || "";
    return normalizeAppearance(result, bloodline);
  }

  function defaultAppearance(faction) {
    var bloodline = faction === "bloodbound" ? "bloodbound" : "moonborn";
    return normalizeAppearance(defaults[bloodline], bloodline);
  }

  var presetAnchors = {
    moonborn_howlwarden: { viewBox: "0 0 512 512", x: 256, y: 108, gap: 42, unit: 1 },
    moonborn_moonghost: { viewBox: "0 0 512 512", x: 256, y: 117, gap: 38, unit: 1 },
    moonborn_frostfang: { viewBox: "0 0 512 512", x: 256, y: 120, gap: 68, unit: 1 },
    moonborn_eclipsehowl: { viewBox: "0 0 512 512", x: 256, y: 108, gap: 42, unit: 1 },
    moonborn_stonefur: { viewBox: "0 0 512 512", x: 256, y: 116, gap: 48, unit: 1 },
    moonborn_goldfang: { viewBox: "0 0 512 512", x: 256, y: 140, gap: 48, unit: 1 },
    bloodbound_crimson_moon: { viewBox: "0 0 800 1000", x: 400, y: 171, gap: 44, unit: 1 },
    bloodbound_nocturne_heir: { viewBox: "0 0 512 512", x: 256, y: 108, gap: 24, unit: 1 },
    bloodbound_crimsonveil: { viewBox: "0 0 512 512", x: 256, y: 88, gap: 34, unit: 1 },
    bloodbound_bloodhalo: { viewBox: "0 0 512 512", x: 256, y: 86, gap: 36, unit: 1 },
    bloodbound_dark_prince: { viewBox: "0 0 512 512", x: 256, y: 113, gap: 36, unit: 1 },
    bloodbound_royal_dusk: { viewBox: "0 0 512 512", x: 256, y: 90, gap: 28, unit: 1 },
    moonborn_ironmaw: { viewBox: "0 0 512 512", x: 256, y: 110, gap: 54, unit: 1 },
    moonborn_bloodscratch: { viewBox: "0 0 512 512", x: 256, y: 118, gap: 50, unit: 1 },
    moonborn_stormpelt: { viewBox: "0 0 512 512", x: 256, y: 150, gap: 44, unit: 1 },
    bloodbound_mooncourt: { viewBox: "0 0 512 512", x: 256, y: 92, gap: 34, unit: 1 },
    bloodbound_nightwing: { viewBox: "0 0 512 512", x: 256, y: 98, gap: 34, unit: 1 },
    bloodbound_velvetfang: { viewBox: "0 0 512 512", x: 256, y: 88, gap: 32, unit: 1 },
    bloodbound_blackveil: { viewBox: "0 0 512 512", x: 256, y: 98, gap: 34, unit: 1 },
  };

  function presetColors(a) {
    var skin = skinColors[a.skin] || skinColors.ash;
    var hair = hairColors[a.hairColor] || hairColors.obsidian;
    var accents = accentColors[a.accent] || accentColors["night blue"];
    var metals = metalColors[a.metal] || metalColors["blackened silver"];
    var visibleHairDark = svgDarken(hair[0], 0.04);
    var visibleHairLight = svgMix(svgDarken(hair[1], 0.02), visibleHairDark, 0.52);
    return {
      skin: skin[0],
      skinShadow: skin[1],
      skinLight: skin[2],
      eye: eyeColors[a.eyes] || eyeColors.amber,
      hairDark: visibleHairDark,
      hairLight: visibleHairLight,
      accentDark: accents[0],
      accentLight: accents[1],
      metalDark: metals[0],
      metalMid: metals[1],
      metalLight: metals[2],
    };
  }

  function presetHairGeometry(a, faction, anchor, colors) {
    var x = anchor.x, y = anchor.y, u = anchor.unit || 1;
    var style = a.hair;
    if (faction === "bloodbound") {
      if (style === "shorn") return '<path d="M'+(x-28*u)+' '+(y-11*u)+' Q '+x+' '+(y-31*u)+' '+(x+28*u)+' '+(y-11*u)+'" fill="none" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(5*u)+'" opacity=".97"/>';
      if (style === "long" || style === "moon mane") return '<path d="M'+(x-36*u)+' '+(y-7*u)+' Q '+x+' '+(y-56*u)+' '+(x+36*u)+' '+(y-7*u)+' L '+(x+24*u)+' '+(y+7*u)+' Q '+x+' '+(y-13*u)+' '+(x-24*u)+' '+(y+7*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(2.5*u)+'"/><path d="M'+(x-31*u)+' '+(y-2*u)+' Q '+(x-51*u)+' '+(y+28*u)+' '+(x-43*u)+' '+(y+71*u)+' L '+(x-25*u)+' '+(y+49*u)+' L '+(x-22*u)+' '+(y+9*u)+' Z M '+(x+31*u)+' '+(y-2*u)+' Q '+(x+51*u)+' '+(y+28*u)+' '+(x+43*u)+' '+(y+71*u)+' L '+(x+25*u)+' '+(y+49*u)+' L '+(x+22*u)+' '+(y+9*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(2*u)+'"/>';
      if (style === "braided") return '<path d="M'+(x-35*u)+' '+(y-8*u)+' Q '+x+' '+(y-48*u)+' '+(x+35*u)+' '+(y-8*u)+' L '+(x+22*u)+' '+(y+10*u)+' Q '+x+' '+(y-4*u)+' '+(x-22*u)+' '+(y+10*u)+' Z" fill="'+colors.hairDark+'"/><path d="M'+(x+28*u)+' '+(y+5*u)+' Q '+(x+48*u)+' '+(y+30*u)+' '+(x+35*u)+' '+(y+78*u)+'" fill="none" stroke="'+colors.hairDark+'" stroke-width="'+(12*u)+'" stroke-linecap="round"/><path d="M'+(x+28*u)+' '+(y+5*u)+' Q '+(x+48*u)+' '+(y+30*u)+' '+(x+35*u)+' '+(y+78*u)+'" fill="none" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'" stroke-dasharray="'+(4*u)+' '+(8*u)+'"/>';
      if (style === "crested") return '<path d="M'+(x-25*u)+' '+(y-12*u)+' L '+(x-18*u)+' '+(y-55*u)+' L '+(x-5*u)+' '+(y-26*u)+' L '+(x+5*u)+' '+(y-70*u)+' L '+(x+14*u)+' '+(y-28*u)+' L '+(x+30*u)+' '+(y-48*u)+' L '+(x+25*u)+' '+(y-8*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(3*u)+'"/>';
      if (style === "ritual knots") return '<path d="M'+(x-34*u)+' '+(y-8*u)+' Q '+x+' '+(y-45*u)+' '+(x+34*u)+' '+(y-8*u)+' L '+(x+18*u)+' '+(y+8*u)+' Q '+x+' '+(y-5*u)+' '+(x-18*u)+' '+(y+8*u)+' Z" fill="'+colors.hairDark+'"/><g fill="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke="'+colors.metalLight+'" stroke-width="'+(1.5*u)+'"><circle cx="'+(x-25*u)+'" cy="'+(y-20*u)+'" r="'+(8*u)+'"/><circle cx="'+x+'" cy="'+(y-31*u)+'" r="'+(9*u)+'"/><circle cx="'+(x+25*u)+'" cy="'+(y-20*u)+'" r="'+(8*u)+'"/></g>';
      if (style === "swept") return '<path d="M'+(x-36*u)+' '+(y-4*u)+' Q '+(x-5*u)+' '+(y-57*u)+' '+(x+42*u)+' '+(y-30*u)+' L '+(x+17*u)+' '+(y-17*u)+' L '+(x+40*u)+' '+(y-10*u)+' L '+(x+2*u)+' '+(y-2*u)+' L '+(x-22*u)+' '+(y+12*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(2*u)+'"/>';
      return '<path d="M'+(x-38*u)+' '+(y-7*u)+' L '+(x-27*u)+' '+(y-48*u)+' L '+(x-10*u)+' '+(y-30*u)+' L '+x+' '+(y-60*u)+' L '+(x+12*u)+' '+(y-28*u)+' L '+(x+35*u)+' '+(y-47*u)+' L '+(x+31*u)+' '+(y-6*u)+' L '+(x+12*u)+' '+(y+5*u)+' L '+(x-8*u)+' '+(y-1*u)+' L '+(x-25*u)+' '+(y+9*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(2.5*u)+'" opacity=".95"/>';
    }
    if (style === "shorn") return '<path d="M'+(x-anchor.gap*.7)+' '+(y-14*u)+' Q '+x+' '+(y-35*u)+' '+(x+anchor.gap*.7)+' '+(y-14*u)+'" fill="none" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(4*u)+'" opacity=".97"/>';
    if (style === "cropped") return '<path d="M'+(x-42*u)+' '+(y-18*u)+' L '+(x-25*u)+' '+(y-43*u)+' L '+(x-8*u)+' '+(y-27*u)+' L '+(x+8*u)+' '+(y-48*u)+' L '+(x+24*u)+' '+(y-25*u)+' L '+(x+43*u)+' '+(y-42*u)+' L '+(x+38*u)+' '+(y-12*u)+' Z" fill="'+colors.hairDark+'" opacity=".97"/>';
    if (style === "braided" || style === "moon braids") return '<path d="M'+(x-62*u)+' '+(y-20*u)+' Q '+x+' '+(y-92*u)+' '+(x+62*u)+' '+(y-20*u)+' L '+(x+42*u)+' '+(y+24*u)+' Q '+x+' '+(y-5*u)+' '+(x-42*u)+' '+(y+24*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(3*u)+'" opacity=".97"/><g fill="'+colors.hairDark+'" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'"><circle cx="'+(x-53*u)+'" cy="'+(y+20*u)+'" r="'+(10*u)+'"/><circle cx="'+(x-58*u)+'" cy="'+(y+42*u)+'" r="'+(9*u)+'"/><circle cx="'+(x+53*u)+'" cy="'+(y+20*u)+'" r="'+(10*u)+'"/><circle cx="'+(x+58*u)+'" cy="'+(y+42*u)+'" r="'+(9*u)+'"/></g>';
    if (style === "crested") return '<path d="M'+(x-20*u)+' '+(y-18*u)+' L '+(x-13*u)+' '+(y-95*u)+' L '+(x+2*u)+' '+(y-60*u)+' L '+(x+17*u)+' '+(y-112*u)+' L '+(x+25*u)+' '+(y-28*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(4*u)+'"/>';
    if (style === "ritual knots") return '<g fill="'+colors.hairDark+'" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'"><circle cx="'+(x-50*u)+'" cy="'+(y-38*u)+'" r="'+(12*u)+'"/><circle cx="'+(x-20*u)+'" cy="'+(y-58*u)+'" r="'+(13*u)+'"/><circle cx="'+(x+17*u)+'" cy="'+(y-61*u)+'" r="'+(13*u)+'"/><circle cx="'+(x+50*u)+'" cy="'+(y-37*u)+'" r="'+(12*u)+'"/></g>';
    if (style === "swept") return '<path d="M'+(x-68*u)+' '+(y-9*u)+' Q '+(x-20*u)+' '+(y-96*u)+' '+(x+76*u)+' '+(y-60*u)+' L '+(x+34*u)+' '+(y-29*u)+' L '+(x+76*u)+' '+(y-16*u)+' L '+(x+10*u)+' '+(y-3*u)+' L '+(x-42*u)+' '+(y+20*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(3*u)+'" opacity=".97"/>';
    return '<path d="M'+(x-74*u)+' '+(y-8*u)+' L '+(x-88*u)+' '+(y-62*u)+' L '+(x-51*u)+' '+(y-48*u)+' L '+(x-44*u)+' '+(y-94*u)+' L '+(x-12*u)+' '+(y-62*u)+' L '+(x+8*u)+' '+(y-108*u)+' L '+(x+27*u)+' '+(y-61*u)+' L '+(x+65*u)+' '+(y-88*u)+' L '+(x+60*u)+' '+(y-47*u)+' L '+(x+91*u)+' '+(y-58*u)+' L '+(x+72*u)+' '+(y-5*u)+' L '+(x+39*u)+' '+(y+21*u)+' Q '+x+' '+(y-8*u)+' '+(x-39*u)+' '+(y+21*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(3*u)+'" opacity=".97"/>';
  }

  function presetBeardGeometry(a, faction, anchor, colors) {
    var beard = a.beard;
    if (!beard || beard === "none") return "";
    var x = anchor.x, y = anchor.y, u = anchor.unit || 1;
    if (faction === "moonborn") {
      if (beard === "stubble") return '<path d="M'+(x-34*u)+' '+(y+19*u)+' Q '+x+' '+(y+47*u)+' '+(x+34*u)+' '+(y+19*u)+'" fill="none" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(8*u)+'" opacity=".97"/>';
      if (beard === "goatee") return '<path d="M'+(x-14*u)+' '+(y+30*u)+' L '+x+' '+(y+72*u)+' L '+(x+14*u)+' '+(y+30*u)+' Q '+x+' '+(y+43*u)+' '+(x-14*u)+' '+(y+30*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(2*u)+'" opacity=".97"/>';
      if (beard === "braided beard" || beard === "moon braids") return '<path d="M'+(x-43*u)+' '+(y+18*u)+' Q '+x+' '+(y+58*u)+' '+(x+43*u)+' '+(y+18*u)+' L '+(x+26*u)+' '+(y+54*u)+' L '+x+' '+(y+92*u)+' L '+(x-26*u)+' '+(y+54*u)+' Z" fill="'+colors.hairDark+'" opacity=".97"/><path d="M'+x+' '+(y+47*u)+' L '+x+' '+(y+96*u)+'" stroke="'+colors.metalLight+'" stroke-width="'+(4*u)+'" stroke-dasharray="'+(5*u)+' '+(7*u)+'"/>';
      if (beard === "imperial") return '<path d="M'+(x-48*u)+' '+(y+25*u)+' Q '+(x-20*u)+' '+(y+8*u)+' '+x+' '+(y+30*u)+' Q '+(x+20*u)+' '+(y+8*u)+' '+(x+48*u)+' '+(y+25*u)+'" fill="none" stroke="'+colors.hairDark+'" stroke-width="'+(10*u)+'" stroke-linecap="round"/><path d="M'+x+' '+(y+31*u)+' L '+x+' '+(y+67*u)+'" stroke="'+colors.hairDark+'" stroke-width="'+(12*u)+'" stroke-linecap="round"/>';
      return '<path d="M'+(x-63*u)+' '+(y+9*u)+' L '+(x-78*u)+' '+(y+44*u)+' L '+(x-48*u)+' '+(y+38*u)+' L '+(x-58*u)+' '+(y+72*u)+' L '+(x-20*u)+' '+(y+53*u)+' L '+x+' '+(y+89*u)+' L '+(x+20*u)+' '+(y+53*u)+' L '+(x+58*u)+' '+(y+72*u)+' L '+(x+48*u)+' '+(y+38*u)+' L '+(x+78*u)+' '+(y+44*u)+' L '+(x+63*u)+' '+(y+9*u)+' Q '+x+' '+(y+58*u)+' '+(x-63*u)+' '+(y+9*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(3*u)+'" opacity=".97"/>';
    }
    if (beard === "stubble") return '<path d="M'+(x-22*u)+' '+(y+18*u)+' Q '+x+' '+(y+45*u)+' '+(x+22*u)+' '+(y+18*u)+' Q '+x+' '+(y+54*u)+' '+(x-22*u)+' '+(y+18*u)+' Z" fill="'+colors.hairDark+'" opacity=".97"/>';
    if (beard === "goatee") return '<path d="M'+(x-8*u)+' '+(y+26*u)+' L '+x+' '+(y+61*u)+' L '+(x+8*u)+' '+(y+26*u)+' Q '+x+' '+(y+35*u)+' '+(x-8*u)+' '+(y+26*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(1.5*u)+'"/>';
    if (beard === "braided beard" || beard === "moon braids") return '<path d="M'+(x-23*u)+' '+(y+20*u)+' Q '+x+' '+(y+51*u)+' '+(x+23*u)+' '+(y+20*u)+' L '+(x+14*u)+' '+(y+52*u)+' L '+x+' '+(y+76*u)+' L '+(x-14*u)+' '+(y+52*u)+' Z" fill="'+colors.hairDark+'"/><path d="M'+x+' '+(y+42*u)+' L '+x+' '+(y+79*u)+'" stroke="'+colors.metalLight+'" stroke-width="'+(3*u)+'" stroke-dasharray="'+(4*u)+' '+(6*u)+'"/>';
    if (beard === "imperial") return '<path d="M'+(x-26*u)+' '+(y+25*u)+' Q '+(x-10*u)+' '+(y+15*u)+' '+x+' '+(y+29*u)+' Q '+(x+10*u)+' '+(y+15*u)+' '+(x+26*u)+' '+(y+25*u)+'" fill="none" stroke="'+colors.hairDark+'" stroke-width="'+(7*u)+'" stroke-linecap="round"/><path d="M'+x+' '+(y+30*u)+' L '+x+' '+(y+55*u)+'" stroke="'+colors.hairDark+'" stroke-width="'+(8*u)+'" stroke-linecap="round"/>';
    return '<path d="M'+(x-28*u)+' '+(y+16*u)+' Q '+x+' '+(y+54*u)+' '+(x+28*u)+' '+(y+16*u)+' L '+(x+20*u)+' '+(y+50*u)+' L '+x+' '+(y+70*u)+' L '+(x-20*u)+' '+(y+50*u)+' Z" fill="'+colors.hairDark+'" stroke="'+svgMix(colors.hairLight, colors.hairDark, .45)+'" stroke-width="'+(2*u)+'" opacity=".97"/>';
  }

  function presetMarkingGeometry(a, faction, anchor, colors) {
    var m = a.marking;
    if (!m || m === "none") return "";
    var x = anchor.x, y = anchor.y, u = anchor.unit || 1;
    var stroke = m === "silver brands" ? colors.metalLight : (m === "blood sigil" ? "#ff4058" : colors.accentLight);
    if (m === "moon sigil") return '<path d="M'+(x-3*u)+' '+(y-25*u)+' A '+(12*u)+' '+(12*u)+' 0 1 0 '+(x+8*u)+' '+(y-10*u)+' A '+(9*u)+' '+(9*u)+' 0 1 1 '+(x-3*u)+' '+(y-25*u)+' Z" fill="'+stroke+'" opacity=".97"/>';
    if (m === "blood sigil") return '<path d="M'+x+' '+(y-29*u)+' L '+(x-10*u)+' '+(y-8*u)+' L '+x+' '+(y+1*u)+' L '+(x+10*u)+' '+(y-8*u)+' Z" fill="none" stroke="'+stroke+'" stroke-width="'+(3*u)+'"/><circle cx="'+x+'" cy="'+(y-13*u)+'" r="'+(3*u)+'" fill="'+stroke+'"/>';
    if (m === "claw marks") return '<path d="M'+(x-30*u)+' '+(y-7*u)+' L '+(x-12*u)+' '+(y+26*u)+' M '+(x-21*u)+' '+(y-12*u)+' L '+(x-3*u)+' '+(y+21*u)+' M '+(x-12*u)+' '+(y-15*u)+' L '+(x+6*u)+' '+(y+18*u)+'" stroke="'+stroke+'" stroke-width="'+(3*u)+'" stroke-linecap="round" opacity=".9"/>';
    if (m === "eclipse cracks") return '<path d="M'+x+' '+(y-27*u)+' L '+(x-8*u)+' '+(y-12*u)+' L '+(x+1*u)+' '+(y-2*u)+' L '+(x-6*u)+' '+(y+12*u)+' M '+(x+1*u)+' '+(y-2*u)+' L '+(x+15*u)+' '+(y+8*u)+' L '+(x+9*u)+' '+(y+23*u)+'" fill="none" stroke="'+stroke+'" stroke-width="'+(2*u)+'" opacity=".97"/>';
    if (m === "war paint") return '<path d="M'+(x-34*u)+' '+(y-6*u)+' L '+(x-9*u)+' '+(y+5*u)+' L '+(x-31*u)+' '+(y+12*u)+' Z M '+(x+34*u)+' '+(y-6*u)+' L '+(x+9*u)+' '+(y+5*u)+' L '+(x+31*u)+' '+(y+12*u)+' Z" fill="'+stroke+'" opacity=".97"/>';
    if (m === "constellation") return '<g fill="'+stroke+'" stroke="'+stroke+'" stroke-width="'+u+'" opacity=".88"><circle cx="'+(x-21*u)+'" cy="'+(y-13*u)+'" r="'+(2.4*u)+'"/><circle cx="'+(x-8*u)+'" cy="'+(y+3*u)+'" r="'+(2*u)+'"/><circle cx="'+(x+10*u)+'" cy="'+(y-7*u)+'" r="'+(2.5*u)+'"/><circle cx="'+(x+23*u)+'" cy="'+(y+13*u)+'" r="'+(2*u)+'"/><path d="M'+(x-21*u)+' '+(y-13*u)+' L '+(x-8*u)+' '+(y+3*u)+' L '+(x+10*u)+' '+(y-7*u)+' L '+(x+23*u)+' '+(y+13*u)+'" fill="none"/></g>';
    return '<path d="M'+(x-22*u)+' '+(y-20*u)+' L '+(x-9*u)+' '+(y-7*u)+' L '+(x-18*u)+' '+(y+8*u)+' M '+(x+22*u)+' '+(y-20*u)+' L '+(x+9*u)+' '+(y-7*u)+' L '+(x+18*u)+' '+(y+8*u)+'" fill="none" stroke="'+stroke+'" stroke-width="'+(2.4*u)+'" opacity=".8"/>';
  }

  function presetAccessoryGeometry(a, faction, anchor, colors) {
    var item = a.accessory;
    if (!item || item === "none") return "";
    var x = anchor.x, y = anchor.y, u = anchor.unit || 1;
    if (item === "chain halo") return '<ellipse cx="'+x+'" cy="'+(y-5*u)+'" rx="'+(61*u)+'" ry="'+(72*u)+'" fill="none" stroke="'+colors.metalLight+'" stroke-width="'+(3*u)+'" stroke-dasharray="'+(3*u)+' '+(8*u)+'" opacity=".76"/>';
    if (item === "thorn crown") return '<path d="M'+(x-47*u)+' '+(y-34*u)+' L '+(x-27*u)+' '+(y-55*u)+' L '+(x-10*u)+' '+(y-39*u)+' L '+x+' '+(y-66*u)+' L '+(x+13*u)+' '+(y-39*u)+' L '+(x+31*u)+' '+(y-57*u)+' L '+(x+48*u)+' '+(y-33*u)+'" fill="none" stroke="'+colors.metalLight+'" stroke-width="'+(4*u)+'" stroke-linejoin="round"/>';
    if (item === "blood crystal earrings") return '<g fill="#ff4058" stroke="'+colors.metalLight+'" stroke-width="'+(1.5*u)+'"><path d="M'+(x-anchor.gap*.72)+' '+(y+8*u)+' l '+(-6*u)+' '+(15*u)+' l '+(6*u)+' '+(10*u)+' l '+(6*u)+' '+(-10*u)+' Z"/><path d="M'+(x+anchor.gap*.72)+' '+(y+8*u)+' l '+(-6*u)+' '+(15*u)+' l '+(6*u)+' '+(10*u)+' l '+(6*u)+' '+(-10*u)+' Z"/></g>';
    if (item === "silver ear cuffs") return '<path d="M'+(x-anchor.gap*.78)+' '+(y-4*u)+' Q '+(x-anchor.gap*.95)+' '+(y+8*u)+' '+(x-anchor.gap*.78)+' '+(y+25*u)+' M '+(x+anchor.gap*.78)+' '+(y-4*u)+' Q '+(x+anchor.gap*.95)+' '+(y+8*u)+' '+(x+anchor.gap*.78)+' '+(y+25*u)+'" fill="none" stroke="'+colors.metalLight+'" stroke-width="'+(3*u)+'"/>';
    if (item === "raven feather") return '<path d="M'+(x+35*u)+' '+(y-38*u)+' Q '+(x+72*u)+' '+(y-92*u)+' '+(x+86*u)+' '+(y-75*u)+' Q '+(x+78*u)+' '+(y-35*u)+' '+(x+40*u)+' '+(y-8*u)+' Z" fill="#15131c" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'"/><path d="M'+(x+42*u)+' '+(y-12*u)+' L '+(x+80*u)+' '+(y-78*u)+'" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'"/>';
    if (item === "ritual veil") return '<path d="M'+(x-43*u)+' '+(y-7*u)+' Q '+x+' '+(y-42*u)+' '+(x+43*u)+' '+(y-7*u)+' L '+(x+35*u)+' '+(y+57*u)+' Q '+x+' '+(y+78*u)+' '+(x-35*u)+' '+(y+57*u)+' Z" fill="'+colors.accentDark+'" opacity=".46" stroke="'+colors.accentLight+'" stroke-width="'+(2*u)+'"/>';
    if (item === "trophy fangs") return '<path d="M'+(x-33*u)+' '+(y+45*u)+' L '+(x-22*u)+' '+(y+74*u)+' L '+(x-14*u)+' '+(y+42*u)+' M '+(x+33*u)+' '+(y+45*u)+' L '+(x+22*u)+' '+(y+74*u)+' L '+(x+14*u)+' '+(y+42*u)+'" fill="#efe5cd" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'"/>';
    return '<g><path d="M'+(x-28*u)+' '+(y+47*u)+' Q '+x+' '+(y+62*u)+' '+(x+28*u)+' '+(y+47*u)+'" fill="none" stroke="'+colors.metalLight+'" stroke-width="'+(4*u)+'"/><circle cx="'+x+'" cy="'+(y+58*u)+'" r="'+(8*u)+'" fill="'+colors.accentLight+'" stroke="'+colors.metalLight+'" stroke-width="'+(3*u)+'"/></g>';
  }

  function presetEquipmentGeometry(entity, faction, anchor, colors) {
    var equipment = entity && (entity.equipment || (entity.player && entity.player.equipment));
    if (!equipment) return "";
    var x = anchor.x, y = anchor.y, u = anchor.unit || 1, out = "";
    if (equipment.head) out += '<path d="M'+(x-52*u)+' '+(y-31*u)+' L '+(x-33*u)+' '+(y-59*u)+' L '+(x-12*u)+' '+(y-45*u)+' L '+x+' '+(y-74*u)+' L '+(x+14*u)+' '+(y-45*u)+' L '+(x+35*u)+' '+(y-60*u)+' L '+(x+52*u)+' '+(y-31*u)+' L '+(x+42*u)+' '+(y-21*u)+' L '+(x-42*u)+' '+(y-21*u)+' Z" fill="'+colors.metalDark+'" stroke="'+rarityColor(equipment.head, colors.metalLight)+'" stroke-width="'+(3*u)+'" opacity=".97"/>';
    if (equipment.amulet) out += '<path d="M'+(x-31*u)+' '+(y+52*u)+' Q '+x+' '+(y+78*u)+' '+(x+31*u)+' '+(y+52*u)+'" fill="none" stroke="'+colors.metalLight+'" stroke-width="'+(3*u)+'"/><circle cx="'+x+'" cy="'+(y+72*u)+'" r="'+(8*u)+'" fill="'+rarityColor(equipment.amulet, colors.accentLight)+'" stroke="'+colors.metalLight+'" stroke-width="'+(2*u)+'"/>';
    return out;
  }

  var presetPartProfiles = {
    moonborn_howlwarden: { fur: ["furDark", "furMid", "furLight"], skin: ["skinDark"], outfit: ["pantsGrad"], bone: ["boneGrad"], eyes: ["eyeGlowGrad"] },
    moonborn_moonghost: { fur: ["furDark", "furMid", "furLight"], skin: ["skin", "flesh"], outfit: ["pants"], bone: ["claw"], eyes: ["eyeGrad"] },
    moonborn_frostfang: { eyes: ["eyeGlow"] },
    moonborn_eclipsehowl: { eyes: ["eye-grad"] },
    moonborn_stonefur: { fur: ["furDark", "furMid", "furLight", "chestGrad"], outfit: ["pantsGrad"], eyes: ["eyeGlow"] },
    moonborn_goldfang: { fur: ["furDark", "furMid", "furLight"], skin: ["skin"], outfit: ["pants"], bone: ["claw"], eyes: ["glow", "subtleGlow"] },
    bloodbound_crimson_moon: { skin: ["skin"], cloak: ["cape-inner", "cape-outer"], outfit: ["vest", "pants"], metal: ["gold"] },
    bloodbound_nocturne_heir: { skin: ["skinGrad"], cloak: ["capeRed", "capeBlack"], outfit: ["vestGrad", "pantsGrad"], metal: ["goldGrad"] },
    bloodbound_crimsonveil: { skin: ["skin-grad"], cloak: ["cape-inner", "cape-dark", "cape-outer"], outfit: ["vest-grad", "suit-grad", "pants-grad"], metal: ["gold-grad"] },
    bloodbound_bloodhalo: { skin: ["skin-grad"], cloak: ["cape-inner", "cape-outer"], outfit: ["vest-grad"], metal: ["gold-grad", "cane-grad"] },
    bloodbound_dark_prince: { skin: ["skinGrad"], cloak: ["capeInner", "capeOuter"], outfit: ["vestGrad"], metal: ["goldGrad"] },
    bloodbound_royal_dusk: { skin: ["skinGrad"], cloak: ["capeOuterGrad", "capeInnerGrad"], outfit: ["vestGrad", "bootGrad"], metal: ["goldGrad", "caneGrad"] },
    moonborn_ironmaw: { fur: ["fur-dark", "fur-mid", "fur-light"], skin: ["skin-dark"], outfit: ["pants-grad"], bone: ["claw-grad"], metal: ["gold"] },
    moonborn_bloodscratch: { fur: ["fur-base"], outfit: ["pants-base"], eyes: ["eye-glow"] },
    moonborn_stormpelt: { fur: ["torsoGrad"], outfit: ["pantsGrad"] },
    bloodbound_mooncourt: { skin: ["skin-grad"], cloak: ["cape-inner"], outfit: ["vest-grad"], metal: ["gold-grad"] },
    bloodbound_nightwing: { skin: ["skin"], hair: ["hair-grad"], cloak: ["cape-grad", "collar-grad"], outfit: ["vest-grad"] },
    bloodbound_velvetfang: { skin: ["skinGrad"], cloak: ["capeOuter", "capeInner", "redGrad"], outfit: ["vestGrad"], metal: ["goldGrad"] },
    bloodbound_blackveil: { skin: ["skin"], cloak: ["cape-outer-left", "cape-outer-right", "cape-inner"], outfit: ["vest-grad", "pants"], metal: ["gold"] },
  };

  function svgHex(value) {
    value = String(value || "").trim();
    var match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
    if (!match) return null;
    var hex = match[1];
    if (hex.length === 3)
      hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  function svgColor(rgb) {
    function channel(value) {
      var text = Math.max(0, Math.min(255, Math.round(value))).toString(16);
      return text.length < 2 ? "0" + text : text;
    }
    return "#" + channel(rgb.r) + channel(rgb.g) + channel(rgb.b);
  }

  function svgMix(a, b, amount) {
    var ca = svgHex(a) || { r: 0, g: 0, b: 0 };
    var cb = svgHex(b) || ca;
    amount = Math.max(0, Math.min(1, amount));
    return svgColor({
      r: ca.r + (cb.r - ca.r) * amount,
      g: ca.g + (cb.g - ca.g) * amount,
      b: ca.b + (cb.b - ca.b) * amount,
    });
  }

  function svgLuminance(value) {
    var c = svgHex(value);
    if (!c) return 0.5;
    return (c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722) / 255;
  }

  function svgDarken(value, amount) {
    return svgMix(value, "#000000", amount == null ? 0.35 : amount);
  }

  function svgHairVisibilityTone(value, extra) {
    var lum = svgLuminance(value);
    var amount = lum > 0.72 ? 0.48 : lum > 0.58 ? 0.36 : lum > 0.45 ? 0.26 : lum > 0.32 ? 0.18 : 0.1;
    if (extra) amount += extra;
    return svgDarken(value, Math.max(0.06, Math.min(0.58, amount)));
  }

  function svgFindId(root, id) {
    var nodes = root.querySelectorAll("[id]");
    for (var i = 0; i < nodes.length; i++)
      if (nodes[i].getAttribute("id") === id) return nodes[i];
    return null;
  }

  function svgEnsureDefs(root) {
    var defs = root.querySelector("defs");
    if (defs) return defs;
    defs = root.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs");
    root.insertBefore(defs, root.firstChild);
    return defs;
  }

  function svgRecolorGradientElement(gradient, palette) {
    if (!gradient || !palette) return;
    var stops = gradient.querySelectorAll("stop");
    for (var i = 0; i < stops.length; i++) {
      var oldColor = stops[i].getAttribute("stop-color") || "#808080";
      var amount = stops.length > 1 ? i / (stops.length - 1) : svgLuminance(oldColor);
      amount = Math.max(0.04, Math.min(0.96, amount * 0.82 + svgLuminance(oldColor) * 0.18));
      stops[i].setAttribute("stop-color", svgMix(palette[0], palette[1], amount));
    }
  }

  function svgRecolorGradient(root, id, palette) {
    var gradient = svgFindId(root, id);
    if (gradient) svgRecolorGradientElement(gradient, palette);
  }

  function svgClassifyComment(text, faction) {
    var t = lower(text).replace(/[^a-z0-9à-ÿ]+/g, " ");
    if (!t) return "";
    if (/background|moon|sky|star|mist|fog|cloud|castle|tree|bat|floor|shadow under|atmosphere|window|crater/.test(t)) return "";
    if (/eye/.test(t)) return "eyes";
    if (/hair|widow/.test(t)) return "hair";
    if (/mane|fur|tuft/.test(t)) return /mane/.test(t) ? "hair" : "fur";
    if (/scar|rune|sigil|mark|paint|brand|crack|constellation/.test(t)) return "markings";
    if (/claw|fang|teeth|tooth|bone/.test(t)) return "bone";
    if (/cape|cloak|collar|mantle|veil/.test(t)) return "cloak";
    if (/gold|medallion|chain|buckle|belt|cane|ring|brooch|jewel|metal|button|pin/.test(t)) return "metal";
    if (/shirt|vest|jacket|suit|pant|trouser|boot|shoe|clothing|outfit|sleeve|cravat|sash|coat/.test(t)) return "outfit";
    if (/skin|flesh|neck|hand|ear|face base/.test(t)) return "skin";
    if (faction === "moonborn" && /head|snout|jaw|mouth|nose|torso|chest|pec|abs|arm|shoulder|bicep|forearm|leg|thigh|calf|foot|tail|body/.test(t)) return "fur";
    return "";
  }

  function svgTagParts(root, faction) {
    function walk(parent) {
      if (!parent || parent.nodeType !== 1 || lower(parent.localName) === "defs") return;
      var active = "";
      var children = Array.prototype.slice.call(parent.childNodes || []);
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node.nodeType === 8) {
          active = svgClassifyComment(node.nodeValue || "", faction);
          continue;
        }
        if (node.nodeType !== 1) continue;
        if (active && !node.getAttribute("data-wb-part")) node.setAttribute("data-wb-part", active);
        walk(node);
      }
    }
    walk(root);
    var named = root.querySelectorAll("[id], [class]");
    for (var i = 0; i < named.length; i++) {
      var node = named[i];
      if (node.getAttribute("data-wb-part")) continue;
      var label = (node.getAttribute("id") || "") + " " + (node.getAttribute("class") || "");
      var part = svgClassifyComment(label, faction);
      if (part) node.setAttribute("data-wb-part", part);
    }
  }

  function svgPaletteForOutfit(a, colors) {
    var style = a.outfit;
    if (style === "warplate" || style === "silver reliquary") return [colors.metalDark, colors.metalLight];
    if (style === "bloodweave") return ["#2a0710", colors.accentLight];
    if (style === "moonhide") return [svgDarken(colors.skinShadow, 0.35), colors.skinLight];
    if (style === "ritualist") return [svgDarken(colors.accentDark, 0.48), colors.accentLight];
    if (style === "noble") return [svgDarken(colors.accentDark, 0.62), svgMix(colors.accentLight, colors.metalLight, 0.35)];
    if (style === "warden") return [svgDarken(colors.metalDark, 0.18), colors.accentLight];
    if (style === "night corsair") return ["#10111b", colors.accentLight];
    return [svgDarken(colors.accentDark, 0.58), colors.accentLight];
  }

  function svgPaletteForCloak(a, colors) {
    if (a.cloak === "crimson court") return ["#270008", "#b6263e"];
    if (a.cloak === "wolf pelt") return [colors.skinShadow, colors.skinLight];
    if (a.cloak === "grave shroud") return ["#08090d", "#555a68"];
    if (a.cloak === "moon veil") return ["#243a54", "#b7d3f0"];
    if (a.cloak === "bone mantle") return ["#645b4c", "#e6d6b5"];
    if (a.cloak === "eclipse mantle") return ["#0b0711", "#7650a0"];
    return [svgDarken(colors.accentDark, 0.68), colors.accentLight];
  }

  function svgCloneGradientForPart(root, id, palette, key, cache) {
    var cacheKey = key + "|" + id;
    if (cache[cacheKey]) return cache[cacheKey];
    var original = svgFindId(root, id);
    if (!original) return id;
    var clone = original.cloneNode(true);
    var newId = id + "-wb-" + key;
    clone.setAttribute("id", newId);
    svgRecolorGradientElement(clone, palette);
    svgEnsureDefs(root).appendChild(clone);
    cache[cacheKey] = newId;
    return newId;
  }

  function svgRecolorPart(root, part, palette, cache) {
    var groups = root.querySelectorAll('[data-wb-part="' + part + '"]');
    for (var g = 0; g < groups.length; g++) {
      var nodes = [groups[g]].concat(Array.prototype.slice.call(groups[g].querySelectorAll("*")));
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (lower(node.localName) === "stop") continue;
        var attrs = ["fill", "stroke"];
        for (var aIndex = 0; aIndex < attrs.length; aIndex++) {
          var attr = attrs[aIndex];
          var value = node.getAttribute(attr);
          if (!value || value === "none" || value === "transparent") continue;
          var urlMatch = /^url\(#([^\)]+)\)$/.exec(value);
          if (urlMatch) {
            node.setAttribute(attr, "url(#" + svgCloneGradientForPart(root, urlMatch[1], palette, part, cache) + ")");
            continue;
          }
          if (!svgHex(value)) continue;
          var amount = Math.max(0.02, Math.min(0.98, svgLuminance(value)));
          node.setAttribute(attr, svgMix(palette[0], palette[1], amount));
        }
      }
    }
  }

  function svgSetPartStyle(root, part, styleText) {
    var groups = root.querySelectorAll('[data-wb-part="' + part + '"]');
    for (var i = 0; i < groups.length; i++) {
      var previous = groups[i].getAttribute("style") || "";
      groups[i].setAttribute("style", previous + (previous && previous.charAt(previous.length - 1) !== ";" ? ";" : "") + styleText);
    }
  }

  function svgAppendFragment(root, className, markup) {
    if (!markup) return null;
    var parser = new DOMParser();
    var fragmentDoc = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><g class="' + className + '">' + markup + "</g></svg>", "image/svg+xml");
    if (fragmentDoc.querySelector("parsererror")) return null;
    var source = fragmentDoc.documentElement.firstElementChild;
    var imported = root.ownerDocument.importNode ? root.ownerDocument.importNode(source, true) : source.cloneNode(true);
    imported.setAttribute("data-wb-internal", "true");
    root.appendChild(imported);
    return imported;
  }

  function svgApplyHair(root, a, faction, presetId, colors) {
    var style = hairStyleToken(a.hair);
    svgRecolorPart(root, "hair", [colors.hairDark, svgMix(colors.hairLight, colors.hairDark, .45)], {});
    if (style === "shorn") svgSetPartStyle(root, "hair", "transform-box:fill-box;transform-origin:center;transform:scaleY(.62)");
    else if (style === "cropped") svgSetPartStyle(root, "hair", "transform-box:fill-box;transform-origin:center;transform:scaleY(.76)");
    else if (style === "long" || style === "moon mane") svgSetPartStyle(root, "hair", "transform-box:fill-box;transform-origin:center;transform:scaleY(1.16)");
    else if (style === "crested") svgSetPartStyle(root, "hair", "transform-box:fill-box;transform-origin:center;transform:scaleX(.72) scaleY(1.16)");
    else if (style === "swept") svgSetPartStyle(root, "hair", "transform-box:fill-box;transform-origin:center;transform:skewX(-8deg)");
  }

  function svgApplyEyes(root, a, colors, profile) {
    var eyeIds = (profile && profile.eyes) || [];
    for (var i = 0; i < eyeIds.length; i++) svgRecolorGradient(root, eyeIds[i], [svgDarken(colors.eye, 0.35), colors.eye]);
    var eyeGroups = root.querySelectorAll('[data-wb-part="eyes"]');
    var glowSize = a.eyeGlow === "dormant" ? 0 : a.eyeGlow === "gleaming" ? 4 : a.eyeGlow === "radiant" ? 8 : 13;
    for (var g = 0; g < eyeGroups.length; g++) {
      var nodes = [eyeGroups[g]].concat(Array.prototype.slice.call(eyeGroups[g].querySelectorAll("*")));
      for (var n = 0; n < nodes.length; n++) {
        var node = nodes[n];
        var tag = lower(node.localName);
        if (!/^(circle|ellipse|path|polygon|rect)$/.test(tag)) continue;
        var fill = node.getAttribute("fill");
        var idClass = lower((node.getAttribute("id") || "") + " " + (node.getAttribute("class") || ""));
        var likely = /eye|iris|pupil|glow/.test(idClass) || tag === "circle" || tag === "ellipse" || (svgHex(fill) && svgLuminance(fill) > 0.32);
        if (!likely) continue;
        if (fill && fill !== "none") node.setAttribute("fill", colors.eye);
        if (glowSize) {
          var previous = node.getAttribute("style") || "";
          node.setAttribute("style", previous + (previous && previous.charAt(previous.length - 1) !== ";" ? ";" : "") + "filter:drop-shadow(0 0 " + glowSize + "px " + colors.eye + ")");
        }
      }
    }
  }

  function svgApplyVariants(root, a, faction, presetId, entity, colors) {
    var anchor = presetAnchors[presetId] || { viewBox: "0 0 512 512", x: 256, y: faction === "bloodbound" ? 98 : 125, gap: faction === "bloodbound" ? 34 : 54, unit: 1 };
    svgRecolorPart(root, "hair", [colors.hairDark, svgMix(colors.hairLight, colors.hairDark, .45)], {});
    svgSetPartStyle(root, "markings", "display:none");
    if (faction === "bloodbound")
      svgAppendFragment(root, "wb-svg-part wb-svg-accessory", presetAccessoryGeometry(a, faction, anchor, colors));
    svgAppendFragment(root, "wb-svg-part wb-svg-equipment", presetEquipmentGeometry(entity, faction, anchor, colors));
  }

  function svgPrefixIds(root, prefix) {
    var map = {};
    var nodes = root.querySelectorAll("[id]");
    for (var i = 0; i < nodes.length; i++) {
      var oldId = nodes[i].getAttribute("id");
      var newId = prefix + oldId;
      map[oldId] = newId;
      nodes[i].setAttribute("id", newId);
    }
    var all = root.querySelectorAll("*");
    var attrs = ["fill", "stroke", "filter", "clip-path", "mask", "marker-start", "marker-mid", "marker-end", "href", "xlink:href", "style"];
    for (var n = 0; n < all.length; n++) {
      for (var aIndex = 0; aIndex < attrs.length; aIndex++) {
        var attr = attrs[aIndex];
        var value = all[n].getAttribute(attr);
        if (!value) continue;
        Object.keys(map).forEach(function (oldId) {
          value = value.split("url(#" + oldId + ")").join("url(#" + map[oldId] + ")");
          if ((attr === "href" || attr === "xlink:href") && value === "#" + oldId) value = "#" + map[oldId];
        });
        all[n].setAttribute(attr, value);
      }
    }
  }


  /* Refined inline-SVG atelier: semantic leaf tagging, tonal recoloring and fitted vector details. */
  var refinedPresetFit = {
    moonborn_howlwarden: { x: 256, top: 34, mouth: 182, face: 62, s: 1 },
    moonborn_moonghost: { x: 256, top: 42, mouth: 178, face: 58, s: 1 },
    moonborn_frostfang: { x: 256, top: 26, mouth: 198, face: 72, s: 1 },
    moonborn_eclipsehowl: { x: 256, top: 42, mouth: 176, face: 64, s: 1 },
    moonborn_stonefur: { x: 256, top: 34, mouth: 190, face: 68, s: 1 },
    moonborn_goldfang: { x: 256, top: 26, mouth: 190, face: 68, s: 1 },
    bloodbound_crimson_moon: { x: 400, top: 112, mouth: 230, face: 46, s: 1.25 },
    bloodbound_nocturne_heir: { x: 256, top: 43, mouth: 128, face: 24, s: 0.78 },
    bloodbound_crimsonveil: { x: 256, top: 22, mouth: 119, face: 29, s: 0.82 },
    bloodbound_bloodhalo: { x: 256, top: 10, mouth: 118, face: 35, s: 0.86 },
    bloodbound_dark_prince: { x: 256, top: 34, mouth: 151, face: 34, s: 0.9 },
    bloodbound_royal_dusk: { x: 256, top: 24, mouth: 122, face: 29, s: 0.82 },
    moonborn_ironmaw: { x: 256, top: 44, mouth: 186, face: 72, s: 1 },
    moonborn_bloodscratch: { x: 256, top: 40, mouth: 190, face: 74, s: 1 },
    moonborn_stormpelt: { x: 256, top: 96, mouth: 194, face: 58, s: 0.95 },
    bloodbound_mooncourt: { x: 256, top: 34, mouth: 124, face: 34, s: 0.9 },
    bloodbound_nightwing: { x: 256, top: 30, mouth: 122, face: 34, s: 0.9 },
    bloodbound_velvetfang: { x: 256, top: 18, mouth: 118, face: 32, s: 0.88 },
    bloodbound_blackveil: { x: 256, top: 26, mouth: 124, face: 33, s: 0.88 },
  };

  var refinedFurPalettes = {
    ash: ["#181b23", "#4d5360", "#939aa7"],
    umber: ["#211815", "#5b4036", "#a27660"],
    pale: ["#34313a", "#77717c", "#c5bec5"],
    onyx: ["#090a0f", "#252733", "#5a5e70"],
    russet: ["#271312", "#6d302b", "#b45d4d"],
    silver: ["#1b252e", "#586979", "#b3c2ce"],
    sable: ["#15120f", "#453a32", "#827064"],
    alabaster: ["#303037", "#777783", "#d0d0d5"],
  };

  function refinedFit(presetId, faction) {
    return refinedPresetFit[presetId] || {
      x: 256,
      top: faction === "bloodbound" ? 30 : 35,
      mouth: faction === "bloodbound" ? 125 : 185,
      face: faction === "bloodbound" ? 30 : 65,
      s: 1,
    };
  }

  function refinedPalette3(palette) {
    if (!palette || !palette.length) return ["#15151a", "#555963", "#c5cad1"];
    if (palette.length >= 3) return palette.slice(0, 3);
    return [svgDarken(palette[0], 0.25), palette[0], palette[1] || palette[0]];
  }

  function refinedTone(palette, amount) {
    palette = refinedPalette3(palette);
    amount = Math.max(0, Math.min(1, amount));
    return amount < 0.5
      ? svgMix(palette[0], palette[1], amount * 2)
      : svgMix(palette[1], palette[2], (amount - 0.5) * 2);
  }

  function svgRecolorGradientElement(gradient, palette) {
    if (!gradient || !palette) return;
    var stops = gradient.querySelectorAll("stop");
    for (var i = 0; i < stops.length; i++) {
      var oldColor = stops[i].getAttribute("stop-color") || "#808080";
      var amount = svgLuminance(oldColor);
      stops[i].setAttribute("stop-color", refinedTone(palette, Math.max(0.04, Math.min(0.96, amount))));
    }
  }

  function svgTagParts(root, faction) {
    var drawable = /^(path|circle|ellipse|rect|polygon|polyline|line|text)$/;
    function walk(parent, inherited) {
      if (!parent || parent.nodeType !== 1 || lower(parent.localName) === "defs") return;
      var active = inherited || "";
      var children = Array.prototype.slice.call(parent.childNodes || []);
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node.nodeType === 8) {
          active = svgClassifyComment(node.nodeValue || "", faction);
          continue;
        }
        if (node.nodeType !== 1) continue;
        var tag = lower(node.localName);
        if (tag === "g" || tag === "a" || tag === "svg") {
          walk(node, active);
          continue;
        }
        if (drawable.test(tag) && active && !node.getAttribute("data-wb-part"))
          node.setAttribute("data-wb-part", active);
      }
    }
    walk(root, "");
    var named = root.querySelectorAll("[id], [class]");
    for (var i = 0; i < named.length; i++) {
      var node = named[i];
      if (node.getAttribute("data-wb-part") || !drawable.test(lower(node.localName))) continue;
      var label = (node.getAttribute("id") || "") + " " + (node.getAttribute("class") || "");
      var part = svgClassifyComment(label, faction);
      if (part) node.setAttribute("data-wb-part", part);
    }
  }

  function svgRecolorPart(root, part, palette, cache) {
    var nodes = root.querySelectorAll('[data-wb-part="' + part + '"]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var attrs = ["fill", "stroke"];
      for (var aIndex = 0; aIndex < attrs.length; aIndex++) {
        var attr = attrs[aIndex];
        var value = node.getAttribute(attr);
        if (!value || value === "none" || value === "transparent") continue;
        var urlMatch = /^url\(#([^\)]+)\)$/.exec(value);
        if (urlMatch) {
          node.setAttribute(attr, "url(#" + svgCloneGradientForPart(root, urlMatch[1], palette, part, cache || {}) + ")");
          continue;
        }
        var rgb = svgHex(value);
        if (!rgb) continue;
        node.setAttribute(attr, refinedTone(palette, svgLuminance(value)));
      }
    }
  }

  function svgFaceParent(root) {
    var priority = root.querySelectorAll('[data-wb-part="hair"], [data-wb-part="eyes"]');
    var node = priority.length ? priority[priority.length - 1] : null;
    if (!node) return root;
    var parent = node.parentNode;
    return parent && parent.nodeType === 1 ? parent : root;
  }

  function svgInsertFragment(root, className, markup, placement) {
    if (!markup) return null;
    var parser = new DOMParser();
    var fragmentDoc = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><g class="' + className + '">' + markup + "</g></svg>", "image/svg+xml");
    if (fragmentDoc.querySelector("parsererror")) return null;
    var source = fragmentDoc.documentElement.firstElementChild;
    var imported = root.ownerDocument.importNode ? root.ownerDocument.importNode(source, true) : source.cloneNode(true);
    imported.setAttribute("data-wb-internal", "true");
    var parent = svgFaceParent(root);
    if (placement === "behind") {
      var first = parent.querySelector('[data-wb-part="hair"], [data-wb-part="skin"], [data-wb-part="fur"]');
      if (first && first.parentNode === parent) parent.insertBefore(imported, first);
      else parent.insertBefore(imported, parent.firstChild);
    } else parent.appendChild(imported);
    return imported;
  }

  function refinedHairBack(a, faction, fit, colors) {
    var x = fit.x, t = fit.top, m = fit.mouth, f = fit.face, s = fit.s;
    var style = hairStyleToken(a.hair);
    var dark = colors.hairDark;
    var light = svgMix(colors.hairLight, colors.hairDark, .45);
    var bright = svgMix(light, dark, 0.72);
    if (faction === "bloodbound") {
      if (style === "long" || style === "moon mane")
        return '<path d="M '+(x-f*.86)+' '+(t+f*.34)+' C '+(x-f*1.16)+' '+(t+f*.62)+', '+(x-f*1.14)+' '+(m+f*.92)+', '+(x-f*.62)+' '+(m+f*1.18)+' C '+(x-f*.74)+' '+(m+f*.46)+', '+(x-f*.6)+' '+(t+f*.88)+', '+(x-f*.38)+' '+(t+f*.52)+' Z M '+(x+f*.86)+' '+(t+f*.34)+' C '+(x+f*1.16)+' '+(t+f*.62)+', '+(x+f*1.14)+' '+(m+f*.92)+', '+(x+f*.62)+' '+(m+f*1.18)+' C '+(x+f*.74)+' '+(m+f*.46)+', '+(x+f*.6)+' '+(t+f*.88)+', '+(x+f*.38)+' '+(t+f*.52)+' Z" fill="'+dark+'" opacity=".98"/><path d="M '+(x-f*.72)+' '+(t+f*.56)+' C '+(x-f*.94)+' '+(t+f*.96)+', '+(x-f*.84)+' '+(m+f*.7)+', '+(x-f*.62)+' '+(m+f*.98)+' M '+(x+f*.72)+' '+(t+f*.56)+' C '+(x+f*.94)+' '+(t+f*.96)+', '+(x+f*.84)+' '+(m+f*.7)+', '+(x+f*.62)+' '+(m+f*.98)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1.4,s*1.5)+'" opacity=".97"/><path d="M '+(x-f*.56)+' '+(t+f*.54)+' C '+(x-f*.64)+' '+(m+f*.12)+', '+(x-f*.56)+' '+(m+f*.72)+', '+(x-f*.42)+' '+(m+f*.94)+' M '+(x+f*.56)+' '+(t+f*.54)+' C '+(x+f*.64)+' '+(m+f*.12)+', '+(x+f*.56)+' '+(m+f*.72)+', '+(x+f*.42)+' '+(m+f*.94)+'" fill="none" stroke="'+bright+'" stroke-width="'+Math.max(.9,s*1.0)+'" opacity=".97"/>';
      if (style === "ritual knots")
        return '<path d="M '+(x-f*.74)+' '+(t+f*.36)+' q '+(-f*.14)+' '+(f*.1)+' '+(-f*.2)+' '+(f*.16)+' M '+(x-f*.68)+' '+(t+f*.5)+' q '+(-f*.12)+' '+(f*.08)+' '+(-f*.18)+' '+(f*.12)+' M '+(x+f*.74)+' '+(t+f*.36)+' q '+(f*.14)+' '+(f*.1)+' '+(f*.2)+' '+(f*.16)+' M '+(x+f*.68)+' '+(t+f*.5)+' q '+(f*.12)+' '+(f*.08)+' '+(f*.18)+' '+(f*.12)+'" fill="none" stroke="'+colors.metalMid+'" stroke-width="'+Math.max(1.2,s*1.2)+'" stroke-linecap="round" opacity=".97"/>';
      if (style === "braided")
        return '<path d="M '+(x-f*.78)+' '+(t+f*.68)+' C '+(x-f*.98)+' '+(t+f*1.08)+', '+(x-f*.88)+' '+(m+f*.48)+', '+(x-f*.78)+' '+(m+f*.9)+' M '+(x+f*.78)+' '+(t+f*.68)+' C '+(x+f*.98)+' '+(t+f*1.08)+', '+(x+f*.88)+' '+(m+f*.48)+', '+(x+f*.78)+' '+(m+f*.9)+'" fill="none" stroke="'+dark+'" stroke-width="'+Math.max(7,s*8)+'" stroke-linecap="round"/><path d="M '+(x-f*.78)+' '+(t+f*.68)+' C '+(x-f*.98)+' '+(t+f*1.08)+', '+(x-f*.88)+' '+(m+f*.48)+', '+(x-f*.78)+' '+(m+f*.9)+' M '+(x+f*.78)+' '+(t+f*.68)+' C '+(x+f*.98)+' '+(t+f*1.08)+', '+(x+f*.88)+' '+(m+f*.48)+', '+(x+f*.78)+' '+(m+f*.9)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1.1,s*1.2)+'" stroke-dasharray="'+(s*3)+' '+(s*7)+'" opacity=".97"/>';
      if (style === "cropped" || style === "shorn")
        return '<path d="M '+(x-f*.48)+' '+(t+f*.56)+' Q '+x+' '+(t+f*.22)+' '+(x+f*.48)+' '+(t+f*.56)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s*1.0)+'" opacity="'+(style === "shorn" ? '.34' : '.42')+'"/>';
      return '<path d="M '+(x-f*.66)+' '+(t+f*.52)+' C '+(x-f*.82)+' '+(t+f*.92)+', '+(x-f*.74)+' '+(m+f*.36)+', '+(x-f*.64)+' '+(m+f*.72)+' M '+(x+f*.66)+' '+(t+f*.52)+' C '+(x+f*.82)+' '+(t+f*.92)+', '+(x+f*.74)+' '+(m+f*.36)+', '+(x+f*.64)+' '+(m+f*.72)+'" fill="none" stroke="'+dark+'" stroke-width="'+Math.max(5,s*5.5)+'" stroke-linecap="round" opacity=".97"/><path d="M '+(x-f*.66)+' '+(t+f*.52)+' C '+(x-f*.82)+' '+(t+f*.92)+', '+(x-f*.74)+' '+(m+f*.36)+', '+(x-f*.64)+' '+(m+f*.72)+' M '+(x+f*.66)+' '+(t+f*.52)+' C '+(x+f*.82)+' '+(t+f*.92)+', '+(x+f*.74)+' '+(m+f*.36)+', '+(x+f*.64)+' '+(m+f*.72)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s*1.0)+'" opacity=".97"/>';
    }
    if (style === "braided")
      return '<path d="M '+(x-f*.82)+' '+(m-f*.14)+' C '+(x-f*1.02)+' '+(m+f*.16)+', '+(x-f*.94)+' '+(m+f*.62)+', '+(x-f*.78)+' '+(m+f*.9)+' M '+(x+f*.82)+' '+(m-f*.14)+' C '+(x+f*1.02)+' '+(m+f*.16)+', '+(x+f*.94)+' '+(m+f*.62)+', '+(x+f*.78)+' '+(m+f*.9)+'" fill="none" stroke="'+dark+'" stroke-width="'+Math.max(7,s*7.5)+'" stroke-linecap="round"/><path d="M '+(x-f*.82)+' '+(m-f*.14)+' C '+(x-f*1.02)+' '+(m+f*.16)+', '+(x-f*.94)+' '+(m+f*.62)+', '+(x-f*.78)+' '+(m+f*.9)+' M '+(x+f*.82)+' '+(m-f*.14)+' C '+(x+f*1.02)+' '+(m+f*.16)+', '+(x+f*.94)+' '+(m+f*.62)+', '+(x+f*.78)+' '+(m+f*.9)+'" fill="none" stroke="'+colors.metalMid+'" stroke-width="'+Math.max(1.2,s*1.2)+'" stroke-dasharray="'+(s*4)+' '+(s*8)+'" opacity=".97"/>';
    if (style === "long" || style === "moon mane")
      return '<path d="M '+(x-f*.84)+' '+(m-f*.3)+' C '+(x-f*1.04)+' '+(m+f*.08)+', '+(x-f*.96)+' '+(m+f*.56)+', '+(x-f*.78)+' '+(m+f*.92)+' M '+(x+f*.84)+' '+(m-f*.3)+' C '+(x+f*1.04)+' '+(m+f*.08)+', '+(x+f*.96)+' '+(m+f*.56)+', '+(x+f*.78)+' '+(m+f*.92)+'" fill="none" stroke="'+dark+'" stroke-width="'+Math.max(8,s*8)+'" stroke-linecap="round" opacity=".97"/><path d="M '+(x-f*.84)+' '+(m-f*.3)+' C '+(x-f*1.04)+' '+(m+f*.08)+', '+(x-f*.96)+' '+(m+f*.56)+', '+(x-f*.78)+' '+(m+f*.92)+' M '+(x+f*.84)+' '+(m-f*.3)+' C '+(x+f*1.04)+' '+(m+f*.08)+', '+(x+f*.96)+' '+(m+f*.56)+', '+(x+f*.78)+' '+(m+f*.92)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1.1,s*1.1)+'" opacity=".97"/>';
    return '<path d="M '+(x-f*.72)+' '+(m-f*.12)+' C '+(x-f*.9)+' '+(m+f*.16)+', '+(x-f*.84)+' '+(m+f*.46)+', '+(x-f*.68)+' '+(m+f*.72)+' M '+(x+f*.72)+' '+(m-f*.12)+' C '+(x+f*.9)+' '+(m+f*.16)+', '+(x+f*.84)+' '+(m+f*.46)+', '+(x+f*.68)+' '+(m+f*.72)+'" fill="none" stroke="'+dark+'" stroke-width="'+Math.max(6,s*6.5)+'" stroke-linecap="round" opacity=".97"/>';
  }

  function refinedHairFront(a, faction, fit, colors) {
    var x = fit.x, t = fit.top, f = fit.face, s = fit.s;
    var style = hairStyleToken(a.hair);
    var dark = colors.hairDark;
    var light = svgMix(colors.hairLight, colors.hairDark, .45);
    var bright = svgMix(light, dark, 0.76);
    if (faction === "bloodbound") {
      if (style === "shorn")
        return '<path d="M '+(x-f*.58)+' '+(t+f*.42)+' Q '+x+' '+(t+f*.02)+' '+(x+f*.58)+' '+(t+f*.42)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1.2,s*1.4)+'" opacity=".97"/>';
      if (style === "crested")
        return '<path d="M '+(x-f*.3)+' '+(t+f*.46)+' C '+(x-f*.18)+' '+(t-f*.7)+', '+(x+f*.12)+' '+(t-f*.8)+', '+(x+f*.3)+' '+(t+f*.44)+' C '+(x+f*.08)+' '+(t+f*.16)+', '+(x-f*.1)+' '+(t+f*.18)+', '+(x-f*.3)+' '+(t+f*.46)+' Z" fill="'+dark+'" opacity=".98"/><path d="M '+x+' '+(t-f*.5)+' C '+(x+f*.08)+' '+(t-f*.22)+', '+(x+f*.14)+' '+(t+f*.02)+', '+(x+f*.12)+' '+(t+f*.3)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1.1,s*1.3)+'" opacity=".97"/>';
      if (style === "swept")
        return '<path d="M '+(x-f*.74)+' '+(t+f*.56)+' C '+(x-f*.18)+' '+(t-f*.62)+', '+(x+f*.48)+' '+(t-f*.24)+', '+(x+f*.96)+' '+(t+f*.18)+' C '+(x+f*.46)+' '+(t+f*.08)+', '+(x+f*.16)+' '+(t+f*.36)+', '+(x-f*.32)+' '+(t+f*.64)+' Z" fill="'+dark+'" opacity=".98"/><path d="M '+(x-f*.44)+' '+(t+f*.24)+' C '+(x-f*.02)+' '+(t-f*.12)+', '+(x+f*.44)+' '+(t-f*.02)+', '+(x+f*.72)+' '+(t+f*.22)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1.1,s*1.2)+'" opacity=".97"/>';
      if (style === "wild")
        return '<path d="M '+(x-f*.62)+' '+(t+f*.48)+' L '+(x-f*.38)+' '+(t-f*.16)+' L '+(x-f*.1)+' '+(t+f*.08)+' L '+(x+f*.04)+' '+(t-f*.3)+' L '+(x+f*.26)+' '+(t+f*.12)+' L '+(x+f*.58)+' '+(t-f*.08)+' L '+(x+f*.66)+' '+(t+f*.48)+' Z" fill="'+dark+'" opacity=".98"/><path d="M '+(x-f*.24)+' '+(t+f*.02)+' L '+(x-f*.06)+' '+(t-f*.12)+' M '+(x+f*.12)+' '+(t-f*.08)+' L '+(x+f*.3)+' '+(t+f*.08)+'" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.05)+'" opacity=".97" stroke-linecap="round"/>';
      if (style === "cropped")
        return '<path d="M '+(x-f*.58)+' '+(t+f*.42)+' C '+(x-f*.36)+' '+(t-f*.08)+', '+(x+f*.36)+' '+(t-f*.12)+', '+(x+f*.58)+' '+(t+f*.42)+' L '+(x+f*.3)+' '+(t+f*.36)+' Q '+x+' '+(t+f*.16)+' '+(x-f*.3)+' '+(t+f*.36)+' Z" fill="'+dark+'" opacity=".96"/><path d="M '+(x-f*.28)+' '+(t+f*.18)+' Q '+x+' '+(t-f*.02)+' '+(x+f*.24)+' '+(t+f*.18)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".97"/>';
      if (style === "ritual knots")
        return '<path d="M '+(x-f*.5)+' '+(t+f*.42)+' Q '+x+' '+(t+f*.06)+' '+(x+f*.5)+' '+(t+f*.42)+' L '+(x+f*.28)+' '+(t+f*.42)+' Q '+x+' '+(t+f*.18)+' '+(x-f*.28)+' '+(t+f*.42)+' Z" fill="'+dark+'" opacity=".95"/><g fill="'+light+'" opacity=".97"><circle cx="'+(x-f*.26)+'" cy="'+(t+f*.1)+'" r="'+Math.max(4,s*4)+'"/><circle cx="'+x+'" cy="'+(t-f*.02)+'" r="'+Math.max(4.5,s*4.5)+'"/><circle cx="'+(x+f*.26)+'" cy="'+(t+f*.1)+'" r="'+Math.max(4,s*4)+'"/></g>';
      if (style === "long" || style === "moon mane")
        return '<path d="M '+(x-f*.54)+' '+(t+f*.46)+' C '+(x-f*.36)+' '+(t-f*.24)+', '+(x+f*.36)+' '+(t-f*.28)+', '+(x+f*.56)+' '+(t+f*.46)+' L '+(x+f*.36)+' '+(t+f*.52)+' Q '+x+' '+(t+f*.22)+' '+(x-f*.36)+' '+(t+f*.52)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x-f*.24)+' '+(t+f*.18)+' Q '+x+' '+(t-f*.1)+' '+(x+f*.28)+' '+(t+f*.18)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.1)+'" opacity=".97"/>';
      return '<path d="M '+(x-f*.56)+' '+(t+f*.44)+' Q '+x+' '+(t+f*.08)+' '+(x+f*.56)+' '+(t+f*.44)+' L '+(x+f*.24)+' '+(t+f*.42)+' Q '+x+' '+(t+f*.16)+' '+(x-f*.24)+' '+(t+f*.42)+' Z" fill="'+dark+'" opacity=".95"/>';
    }
    if (style === "crested")
      return '<path d="M '+(x-f*.2)+' '+(t+f*.28)+' L '+(x-f*.1)+' '+(t-f*.62)+' L '+(x+f*.04)+' '+(t-f*.18)+' L '+(x+f*.22)+' '+(t-f*.76)+' L '+(x+f*.28)+' '+(t+f*.32)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x+f*.04)+' '+(t-f*.24)+' L '+(x+f*.18)+' '+(t-f*.56)+'" stroke="'+light+'" stroke-width="'+Math.max(1.4,s*1.4)+'" opacity=".97"/>';
    if (style === "swept")
      return '<path d="M '+(x-f*.68)+' '+(t+f*.38)+' C '+(x-f*.08)+' '+(t-f*.62)+', '+(x+f*.68)+' '+(t-f*.24)+', '+(x+f*.92)+' '+(t+f*.12)+' C '+(x+f*.42)+' '+(t+f*.02)+', '+(x+f*.12)+' '+(t+f*.28)+', '+(x-f*.34)+' '+(t+f*.52)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x-f*.28)+' '+(t+f*.14)+' C '+(x+f*.12)+' '+(t-f*.14)+', '+(x+f*.48)+' '+(t-f*.08)+', '+(x+f*.68)+' '+(t+f*.12)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.15)+'" opacity=".97"/>';
    if (style === "ritual knots")
      return '<path d="M '+(x-f*.5)+' '+(t+f*.38)+' Q '+x+' '+(t+f*.08)+' '+(x+f*.5)+' '+(t+f*.38)+' L '+(x+f*.2)+' '+(t+f*.38)+' Q '+x+' '+(t+f*.2)+' '+(x-f*.2)+' '+(t+f*.38)+' Z" fill="'+dark+'" opacity=".97"/><g fill="'+colors.metalMid+'" opacity=".97"><circle cx="'+(x-f*.3)+'" cy="'+(t+f*.1)+'" r="'+Math.max(4,s*4)+'"/><circle cx="'+x+'" cy="'+(t+f*.02)+'" r="'+Math.max(4.6,s*4.6)+'"/><circle cx="'+(x+f*.3)+'" cy="'+(t+f*.1)+'" r="'+Math.max(4,s*4)+'"/></g>';
    if (style === "long" || style === "moon mane")
      return '<path d="M '+(x-f*.58)+' '+(t+f*.44)+' C '+(x-f*.34)+' '+(t-f*.2)+', '+(x+f*.34)+' '+(t-f*.26)+', '+(x+f*.58)+' '+(t+f*.44)+' L '+(x+f*.28)+' '+(t+f*.5)+' Q '+x+' '+(t+f*.18)+' '+(x-f*.28)+' '+(t+f*.5)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x-f*.22)+' '+(t+f*.18)+' Q '+x+' '+(t-f*.08)+' '+(x+f*.26)+' '+(t+f*.18)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.1)+'" opacity=".97"/>';
    if (style === "cropped" || style === "shorn")
      return '<path d="M '+(x-f*.52)+' '+(t+f*.4)+' C '+(x-f*.3)+' '+(t-f*.02)+', '+(x+f*.3)+' '+(t-f*.04)+', '+(x+f*.52)+' '+(t+f*.4)+' L '+(x+f*.22)+' '+(t+f*.34)+' Q '+x+' '+(t+f*.18)+' '+(x-f*.22)+' '+(t+f*.34)+' Z" fill="'+dark+'" opacity="'+(style === "shorn" ? '.74' : '.88')+'"/><path d="M '+(x-f*.2)+' '+(t+f*.16)+' Q '+x+' '+(t+f*.02)+' '+(x+f*.2)+' '+(t+f*.16)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.8,s*.9)+'" opacity=".97"/>';
    if (style === "braided")
      return '<path d="M '+(x-f*.48)+' '+(t+f*.42)+' Q '+x+' '+(t+f*.08)+' '+(x+f*.48)+' '+(t+f*.42)+' L '+(x+f*.22)+' '+(t+f*.4)+' Q '+x+' '+(t+f*.2)+' '+(x-f*.22)+' '+(t+f*.4)+' Z" fill="'+dark+'" opacity=".97"/>';
    return '<path d="M '+(x-f*.56)+' '+(t+f*.44)+' L '+(x-f*.3)+' '+(t-f*.08)+' L '+(x-f*.06)+' '+(t+f*.14)+' L '+(x+f*.04)+' '+(t-f*.2)+' L '+(x+f*.22)+' '+(t+f*.14)+' L '+(x+f*.52)+' '+(t-f*.02)+' L '+(x+f*.6)+' '+(t+f*.44)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x-f*.24)+' '+(t+f*.04)+' L '+(x-f*.06)+' '+(t-f*.08)+' M '+(x+f*.1)+' '+(t-f*.04)+' L '+(x+f*.24)+' '+(t+f*.08)+'" stroke="'+bright+'" stroke-width="'+Math.max(.8,s)+'" opacity=".97" stroke-linecap="round"/>';
  }

  function presetBeardGeometry(a, faction, fit, colors) {
    var beard = beardStyleToken(a.beard);
    if (!beard || beard === "none") return "";
    var x = fit.x, y = fit.mouth, f = fit.face, s = fit.s;
    var dark = colors.hairDark, light = svgMix(colors.hairLight, colors.hairDark, .45);
    if (faction === "bloodbound") {
      if (beard === "stubble")
        return '<path d="M '+(x-f*.54)+' '+(y-f*.02)+' C '+(x-f*.44)+' '+(y+f*.52)+', '+(x-f*.18)+' '+(y+f*.74)+', '+x+' '+(y+f*.8)+' C '+(x+f*.18)+' '+(y+f*.74)+', '+(x+f*.44)+' '+(y+f*.52)+', '+(x+f*.54)+' '+(y-f*.02)+' C '+(x+f*.32)+' '+(y+f*.42)+', '+(x-f*.32)+' '+(y+f*.42)+', '+(x-f*.54)+' '+(y-f*.02)+' Z" fill="'+dark+'" opacity=".46"/>';
      if (beard === "goatee")
        return '<path d="M '+(x-f*.16)+' '+(y+f*.16)+' Q '+x+' '+(y+f*.3)+' '+(x+f*.16)+' '+(y+f*.16)+' L '+(x+f*.1)+' '+(y+f*.8)+' L '+x+' '+(y+f*1.02)+' L '+(x-f*.1)+' '+(y+f*.8)+' Z" fill="'+dark+'" opacity=".96"/><path d="M '+(x-f*.04)+' '+(y+f*.34)+' L '+x+' '+(y+f*.82)+'" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".42"/>';
      if (beard === "imperial")
        return '<path d="M '+(x-f*.48)+' '+(y+f*.02)+' C '+(x-f*.24)+' '+(y-f*.16)+', '+(x-f*.08)+' '+(y+f*.02)+', '+x+' '+(y+f*.16)+' C '+(x+f*.08)+' '+(y+f*.02)+', '+(x+f*.24)+' '+(y-f*.16)+', '+(x+f*.48)+' '+(y+f*.02)+' C '+(x+f*.28)+' '+(y+f*.2)+', '+(x+f*.1)+' '+(y+f*.24)+', '+x+' '+(y+f*.2)+' C '+(x-f*.1)+' '+(y+f*.24)+', '+(x-f*.28)+' '+(y+f*.2)+', '+(x-f*.48)+' '+(y+f*.02)+' Z" fill="'+dark+'" opacity=".96"/><path d="M '+(x-f*.1)+' '+(y+f*.28)+' Q '+x+' '+(y+f*.48)+' '+(x+f*.1)+' '+(y+f*.28)+' L '+(x+f*.06)+' '+(y+f*.72)+' L '+x+' '+(y+f*.82)+' L '+(x-f*.06)+' '+(y+f*.72)+' Z" fill="'+dark+'" opacity=".98"/>';
      if (beard === "full beard")
        return '<path d="M '+(x-f*.58)+' '+(y-f*.02)+' C '+(x-f*.5)+' '+(y+f*.58)+', '+(x-f*.26)+' '+(y+f*.88)+', '+x+' '+(y+f*1.06)+' C '+(x+f*.26)+' '+(y+f*.88)+', '+(x+f*.5)+' '+(y+f*.58)+', '+(x+f*.58)+' '+(y-f*.02)+' L '+(x+f*.38)+' '+(y+f*.12)+' C '+(x+f*.24)+' '+(y+f*.5)+', '+(x-f*.24)+' '+(y+f*.5)+', '+(x-f*.38)+' '+(y+f*.12)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x-f*.36)+' '+(y+f*.22)+' Q '+x+' '+(y+f*.76)+' '+(x+f*.36)+' '+(y+f*.22)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.05)+'" opacity=".46"/>';
      if (beard === "braided beard" || beard === "moon braids")
        return '<path d="M '+(x-f*.56)+' '+(y-f*.02)+' C '+(x-f*.48)+' '+(y+f*.54)+', '+(x-f*.24)+' '+(y+f*.8)+', '+x+' '+(y+f*.94)+' C '+(x+f*.24)+' '+(y+f*.8)+', '+(x+f*.48)+' '+(y+f*.54)+', '+(x+f*.56)+' '+(y-f*.02)+' L '+(x+f*.34)+' '+(y+f*.12)+' C '+(x+f*.22)+' '+(y+f*.44)+', '+(x-f*.22)+' '+(y+f*.44)+', '+(x-f*.34)+' '+(y+f*.12)+' Z" fill="'+dark+'" opacity=".96"/><path d="M '+x+' '+(y+f*.48)+' l '+(-f*.12)+' '+(f*.18)+' l '+(f*.12)+' '+(f*.18)+' l '+(f*.12)+' '+(-f*.18)+' l '+(-f*.12)+' '+(-f*.18)+' l '+(-f*.1)+' '+(f*.16)+' l '+(f*.1)+' '+(f*.18)+' l '+(f*.1)+' '+(-f*.18)+'" fill="none" stroke="'+colors.metalMid+'" stroke-width="'+Math.max(1.3,s*1.4)+'" stroke-linejoin="round"/><path d="M '+(x-f*.34)+' '+(y+f*.22)+' Q '+x+' '+(y+f*.68)+' '+(x+f*.34)+' '+(y+f*.22)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".4"/>';
      if (beard === "feral ruff")
        return '<path d="M '+(x-f*.62)+' '+(y+f*.02)+' L '+(x-f*.78)+' '+(y+f*.42)+' L '+(x-f*.48)+' '+(y+f*.36)+' L '+(x-f*.56)+' '+(y+f*.76)+' L '+(x-f*.18)+' '+(y+f*.58)+' L '+x+' '+(y+f*1.08)+' L '+(x+f*.18)+' '+(y+f*.58)+' L '+(x+f*.56)+' '+(y+f*.76)+' L '+(x+f*.48)+' '+(y+f*.36)+' L '+(x+f*.78)+' '+(y+f*.42)+' L '+(x+f*.62)+' '+(y+f*.02)+' C '+(x+f*.34)+' '+(y+f*.52)+', '+(x-f*.34)+' '+(y+f*.52)+', '+(x-f*.62)+' '+(y+f*.02)+' Z" fill="'+dark+'" opacity=".94"/><path d="M '+(x-f*.24)+' '+(y+f*.26)+' Q '+x+' '+(y+f*.66)+' '+(x+f*.24)+' '+(y+f*.26)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".46"/>';
      return '<path d="M '+(x-f*.56)+' '+(y-f*.02)+' C '+(x-f*.48)+' '+(y+f*.56)+', '+(x-f*.24)+' '+(y+f*.82)+', '+x+' '+(y+f*.98)+' C '+(x+f*.24)+' '+(y+f*.82)+', '+(x+f*.48)+' '+(y+f*.56)+', '+(x+f*.56)+' '+(y-f*.02)+' L '+(x+f*.34)+' '+(y+f*.12)+' C '+(x+f*.22)+' '+(y+f*.46)+', '+(x-f*.22)+' '+(y+f*.46)+', '+(x-f*.34)+' '+(y+f*.12)+' Z" fill="'+dark+'" opacity=".94"/>';
    }
    if (beard === "stubble")
      return '<path d="M '+(x-f*.44)+' '+(y+f*.02)+' Q '+x+' '+(y+f*.52)+' '+(x+f*.44)+' '+(y+f*.02)+' Q '+x+' '+(y+f*.36)+' '+(x-f*.44)+' '+(y+f*.02)+' Z" fill="'+dark+'" opacity=".42"/>';
    if (beard === "goatee")
      return '<path d="M '+(x-f*.14)+' '+(y+f*.12)+' L '+x+' '+(y+f*.72)+' L '+(x+f*.14)+' '+(y+f*.12)+' Q '+x+' '+(y+f*.34)+' '+(x-f*.14)+' '+(y+f*.12)+' Z" fill="'+dark+'" opacity=".94"/><path d="M '+x+' '+(y+f*.22)+' L '+x+' '+(y+f*.58)+'" stroke="'+light+'" stroke-width="'+Math.max(1,s)+'" opacity=".4"/>';
    if (beard === "imperial")
      return '<path d="M '+(x-f*.52)+' '+(y-f*.02)+' Q '+(x-f*.25)+' '+(y-f*.2)+' '+x+' '+(y+f*.08)+' Q '+(x+f*.25)+' '+(y-f*.2)+' '+(x+f*.52)+' '+(y-f*.02)+'" fill="none" stroke="'+dark+'" stroke-width="'+Math.max(5.5,s*5.5)+'" stroke-linecap="round"/><path d="M '+(x-f*.1)+' '+(y+f*.18)+' L '+x+' '+(y+f*.62)+' L '+(x+f*.1)+' '+(y+f*.18)+' Z" fill="'+dark+'" opacity=".96"/>';
    if (beard === "full beard")
      return '<path d="M '+(x-f*.58)+' '+(y-f*.02)+' L '+(x-f*.72)+' '+(y+f*.32)+' L '+(x-f*.42)+' '+(y+f*.26)+' L '+(x-f*.5)+' '+(y+f*.62)+' L '+(x-f*.2)+' '+(y+f*.5)+' L '+x+' '+(y+f*.88)+' L '+(x+f*.2)+' '+(y+f*.5)+' L '+(x+f*.5)+' '+(y+f*.62)+' L '+(x+f*.42)+' '+(y+f*.26)+' L '+(x+f*.72)+' '+(y+f*.32)+' L '+(x+f*.58)+' '+(y-f*.02)+' Q '+x+' '+(y+f*.46)+' '+(x-f*.58)+' '+(y-f*.02)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+(x-f*.28)+' '+(y+f*.24)+' Q '+x+' '+(y+f*.68)+' '+(x+f*.28)+' '+(y+f*.24)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".97"/>';
    if (beard === "braided beard" || beard === "moon braids")
      return '<path d="M '+(x-f*.56)+' '+(y-f*.02)+' L '+(x-f*.68)+' '+(y+f*.28)+' L '+(x-f*.4)+' '+(y+f*.24)+' L '+(x-f*.46)+' '+(y+f*.54)+' L '+(x-f*.18)+' '+(y+f*.42)+' L '+x+' '+(y+f*.82)+' L '+(x+f*.18)+' '+(y+f*.42)+' L '+(x+f*.46)+' '+(y+f*.54)+' L '+(x+f*.4)+' '+(y+f*.24)+' L '+(x+f*.68)+' '+(y+f*.28)+' L '+(x+f*.56)+' '+(y-f*.02)+' Q '+x+' '+(y+f*.42)+' '+(x-f*.56)+' '+(y-f*.02)+' Z" fill="'+dark+'" opacity=".97"/><path d="M '+x+' '+(y+f*.38)+' l '+(-f*.1)+' '+(f*.14)+' l '+(f*.1)+' '+(f*.14)+' l '+(f*.1)+' '+(-f*.14)+' l '+(-f*.1)+' '+(-f*.14)+' l '+(-f*.08)+' '+(f*.13)+' l '+(f*.08)+' '+(f*.13)+' l '+(f*.08)+' '+(-f*.13)+'" fill="none" stroke="'+colors.metalMid+'" stroke-width="'+Math.max(1.4,s*1.4)+'"/>';
    if (beard === "feral ruff")
      return '<path d="M '+(x-f*.6)+' '+(y-f*.02)+' L '+(x-f*.74)+' '+(y+f*.3)+' L '+(x-f*.42)+' '+(y+f*.26)+' L '+(x-f*.5)+' '+(y+f*.62)+' L '+(x-f*.18)+' '+(y+f*.46)+' L '+x+' '+(y+f*.84)+' L '+(x+f*.18)+' '+(y+f*.46)+' L '+(x+f*.5)+' '+(y+f*.62)+' L '+(x+f*.42)+' '+(y+f*.26)+' L '+(x+f*.74)+' '+(y+f*.3)+' L '+(x+f*.6)+' '+(y-f*.02)+' Q '+x+' '+(y+f*.44)+' '+(x-f*.6)+' '+(y-f*.02)+' Z" fill="'+dark+'" opacity=".9"/>';
    return '<path d="M '+(x-f*.56)+' '+(y-f*.02)+' L '+(x-f*.7)+' '+(y+f*.3)+' L '+(x-f*.42)+' '+(y+f*.24)+' L '+(x-f*.48)+' '+(y+f*.56)+' L '+(x-f*.18)+' '+(y+f*.43)+' L '+x+' '+(y+f*.78)+' L '+(x+f*.18)+' '+(y+f*.43)+' L '+(x+f*.48)+' '+(y+f*.56)+' L '+(x+f*.42)+' '+(y+f*.24)+' L '+(x+f*.7)+' '+(y+f*.3)+' L '+(x+f*.56)+' '+(y-f*.02)+' Q '+x+' '+(y+f*.42)+' '+(x-f*.56)+' '+(y-f*.02)+' Z" fill="'+dark+'" opacity=".84"/>';
  }

  function presetMarkingGeometry(a, faction, fit, colors) {
    var m = a.marking;
    if (!m || m === "none") return "";
    var x = fit.x, top = fit.top, mouth = fit.mouth, f = fit.face, s = fit.s;
    var y = top + (mouth - top) * .52;
    var stroke = m === "silver brands" ? colors.metalLight : (m === "blood sigil" ? "#ff5268" : colors.accentLight);
    var darkStroke = m === "silver brands" ? colors.metalDark : colors.accentDark;
    var sw = Math.max(1.2, s * 1.35);
    if (m === "moon sigil")
      return '<g opacity=".96"><path d="M '+(x-f*.1)+' '+(y-f*.42)+' A '+(f*.24)+' '+(f*.24)+' 0 1 0 '+(x+f*.12)+' '+(y-f*.14)+' A '+(f*.18)+' '+(f*.18)+' 0 1 1 '+(x-f*.1)+' '+(y-f*.42)+' Z" fill="'+stroke+'"/><path d="M '+(x-f*.22)+' '+(y-f*.06)+' q '+(f*.08)+' '+(f*.12)+' '+(f*.18)+' '+(f*.02)+' M '+(x+f*.04)+' '+(y-f*.02)+' q '+(f*.08)+' '+(f*.08)+' '+(f*.18)+' '+(-f*.02)+'" fill="none" stroke="'+stroke+'" stroke-width="'+Math.max(.9,s)+'" stroke-linecap="round" opacity=".78"/></g>';
    if (m === "blood sigil")
      return '<g><path d="M '+x+' '+(y-f*.44)+' L '+(x-f*.15)+' '+(y-f*.14)+' L '+x+' '+(y+f*.05)+' L '+(x+f*.15)+' '+(y-f*.14)+' Z" fill="none" stroke="'+stroke+'" stroke-width="'+sw+'"/><circle cx="'+x+'" cy="'+(y-f*.18)+'" r="'+Math.max(1.7,s*1.7)+'" fill="'+stroke+'"/><path d="M '+x+' '+(y+f*.04)+' q '+(-f*.03)+' '+(f*.16)+' 0 '+(f*.28)+' M '+x+' '+(y+f*.18)+' q '+(f*.1)+' '+(f*.14)+' '+(f*.04)+' '+(f*.28)+'" fill="none" stroke="'+stroke+'" stroke-width="'+Math.max(.95,s*.95)+'" stroke-linecap="round" opacity=".9"/></g>';
    if (m === "claw marks")
      return '<g><path d="M '+(x-f*.54)+' '+(y-f*.12)+' l '+(f*.24)+' '+(f*.56)+' M '+(x-f*.38)+' '+(y-f*.2)+' l '+(f*.24)+' '+(f*.56)+' M '+(x-f*.22)+' '+(y-f*.24)+' l '+(f*.24)+' '+(f*.56)+'" stroke="'+darkStroke+'" stroke-width="'+(sw*1.9)+'" stroke-linecap="round" opacity=".34"/><path d="M '+(x-f*.54)+' '+(y-f*.12)+' l '+(f*.24)+' '+(f*.56)+' M '+(x-f*.38)+' '+(y-f*.2)+' l '+(f*.24)+' '+(f*.56)+' M '+(x-f*.22)+' '+(y-f*.24)+' l '+(f*.24)+' '+(f*.56)+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" opacity=".98"/></g>';
    if (m === "war paint")
      return '<g opacity=".96"><path d="M '+(x-f*.58)+' '+(y-f*.08)+' L '+(x-f*.08)+' '+(y+f*.08)+' L '+(x-f*.44)+' '+(y+f*.22)+' Z M '+(x+f*.58)+' '+(y-f*.08)+' L '+(x+f*.08)+' '+(y+f*.08)+' L '+(x+f*.44)+' '+(y+f*.22)+' Z" fill="'+stroke+'"/><path d="M '+(x-f*.44)+' '+(y-f*.28)+' q '+(f*.14)+' '+(f*.16)+' '+(f*.28)+' 0 M '+(x+f*.16)+' '+(y-f*.28)+' q '+(f*.14)+' '+(f*.16)+' '+(f*.28)+' 0" fill="none" stroke="'+stroke+'" stroke-width="'+Math.max(.9,s)+'" stroke-linecap="round" opacity=".76"/></g>';
    if (m === "constellation")
      return '<g fill="'+stroke+'" stroke="'+stroke+'" stroke-width="'+Math.max(.8,s*.8)+'" opacity=".92"><circle cx="'+(x-f*.4)+'" cy="'+(y-f*.24)+'" r="'+Math.max(1.4,s*1.4)+'"/><circle cx="'+(x-f*.14)+'" cy="'+(y+f*.02)+'" r="'+Math.max(1.1,s*1.1)+'"/><circle cx="'+(x+f*.1)+'" cy="'+(y-f*.12)+'" r="'+Math.max(1.2,s*1.2)+'"/><circle cx="'+(x+f*.34)+'" cy="'+(y+f*.12)+'" r="'+Math.max(1,s)+'"/><circle cx="'+(x+f*.5)+'" cy="'+(y-f*.18)+'" r="'+Math.max(1.1,s*1.1)+'"/><path d="M '+(x-f*.4)+' '+(y-f*.24)+' L '+(x-f*.14)+' '+(y+f*.02)+' L '+(x+f*.1)+' '+(y-f*.12)+' L '+(x+f*.34)+' '+(y+f*.12)+' L '+(x+f*.5)+' '+(y-f*.18)+'" fill="none"/></g>';
    if (m === "ritual runes")
      return '<g fill="none" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" opacity=".96"><path d="M '+(x-f*.22)+' '+(y-f*.42)+' l '+(f*.08)+' '+(f*.16)+' l '+(f*.12)+' 0 l '+(f*.06)+' '+(f*.16)+' l '+(-f*.1)+' '+(f*.12)+' l '+(-f*.16)+' 0"/><path d="M '+(x+f*.12)+' '+(y-f*.16)+' l '+(f*.12)+' '+(f*.16)+' l '+(-f*.06)+' '+(f*.16)+' l '+(-f*.14)+' '+(f*.02)+'"/><path d="M '+(x-f*.42)+' '+(y+f*.02)+' l '+(f*.16)+' '+(f*.12)+' l '+(f*.02)+' '+(f*.16)+'"/></g>';
    if (m === "silver brands")
      return '<g opacity=".98"><path d="M '+(x-f*.42)+' '+(y-f*.14)+' q '+(f*.12)+' '+(-f*.12)+' '+(f*.24)+' 0 q '+(f*.1)+' '+(f*.1)+' '+(f*.22)+' 0" fill="none" stroke="'+stroke+'" stroke-width="'+Math.max(1.1,s*1.15)+'"/><path d="M '+(x-f*.18)+' '+(y+f*.08)+' q '+(f*.12)+' '+(f*.12)+' '+(f*.26)+' '+(f*.04)+'" fill="none" stroke="'+stroke+'" stroke-width="'+Math.max(1,s*1.05)+'"/><path d="M '+(x-f*.44)+' '+(y-f*.16)+' q '+(f*.12)+' '+(-f*.12)+' '+(f*.24)+' 0 q '+(f*.1)+' '+(f*.1)+' '+(f*.22)+' 0 M '+(x-f*.18)+' '+(y+f*.08)+' q '+(f*.12)+' '+(f*.12)+' '+(f*.26)+' '+(f*.04)+'" fill="none" stroke="'+darkStroke+'" stroke-width="'+Math.max(2.2,s*2.2)+'" opacity=".22"/></g>';
    if (m === "eclipse cracks")
      return '<g fill="none" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round" opacity=".96"><path d="M '+(x-f*.12)+' '+(y-f*.44)+' l '+(-f*.08)+' '+(f*.14)+' l '+(f*.1)+' '+(f*.14)+' l '+(-f*.06)+' '+(f*.16)+' l '+(f*.18)+' '+(f*.08)+' l '+(-f*.08)+' '+(f*.18)+'"/><path d="M '+(x+f*.1)+' '+(y-f*.08)+' l '+(f*.16)+' '+(f*.12)+' l '+(-f*.08)+' '+(f*.18)+'"/></g>';
    return '<path d="M '+x+' '+(y-f*.42)+' l '+(-f*.12)+' '+(f*.22)+' l '+(f*.14)+' '+(f*.16)+' l '+(-f*.08)+' '+(f*.22)+' M '+(x+f*.02)+' '+(y-f*.04)+' l '+(f*.2)+' '+(f*.16)+' l '+(-f*.08)+' '+(f*.24)+'" fill="none" stroke="'+stroke+'" stroke-width="'+sw+'" opacity=".92" stroke-linecap="round" stroke-linejoin="round"/>';
  }

  function presetOutfitGeometry(a, faction, fit, colors) {
    var style = a.outfit || "wanderer";
    if (faction === "moonborn" && style === "wanderer") return "";
    var x = fit.x, top = fit.top, y = fit.mouth, f = fit.face, s = fit.s;
    var chestTop = y + f * .18;
    var chestMid = y + f * .72;
    var chestBottom = y + f * 1.62;
    var dark = svgDarken(colors.accentDark, .2);
    var light = colors.accentLight;
    var metal = colors.metalMid;
    var pale = colors.metalLight;
    if (style === "warplate")
      return '<g><path d="M '+(x-f*.62)+' '+chestTop+' Q '+x+' '+(y-f*.02)+' '+(x+f*.62)+' '+chestTop+' L '+(x+f*.46)+' '+chestBottom+' Q '+x+' '+(chestBottom+f*.2)+' '+(x-f*.46)+' '+chestBottom+' Z" fill="'+colors.metalDark+'" stroke="'+pale+'" stroke-width="'+Math.max(1.2,s*1.3)+'" opacity=".98"/><path d="M '+x+' '+(y+f*.06)+' L '+x+' '+(chestBottom+f*.08)+' M '+(x-f*.38)+' '+(chestMid)+' Q '+x+' '+(chestMid+f*.14)+' '+(x+f*.38)+' '+(chestMid)+'" fill="none" stroke="'+pale+'" stroke-width="'+Math.max(.9,s)+'" opacity=".5"/><path d="M '+(x-f*.72)+' '+(chestTop+f*.02)+' Q '+(x-f*.46)+' '+(y+f*.02)+' '+(x-f*.18)+' '+(chestTop+f*.16)+' M '+(x+f*.72)+' '+(chestTop+f*.02)+' Q '+(x+f*.46)+' '+(y+f*.02)+' '+(x+f*.18)+' '+(chestTop+f*.16)+'" fill="none" stroke="'+metal+'" stroke-width="'+Math.max(4,s*4.5)+'" stroke-linecap="round"/></g>';
    if (style === "hunter")
      return '<g><path d="M '+(x-f*.5)+' '+(chestTop+f*.06)+' L '+(x-f*.12)+' '+(chestBottom)+' L '+(x+f*.18)+' '+(chestBottom)+' L '+(x-f*.22)+' '+(chestTop-f*.02)+' Z" fill="'+dark+'" opacity=".95"/><path d="M '+(x+f*.06)+' '+(chestTop)+' L '+(x+f*.34)+' '+(chestTop+f*.08)+' L '+(x+f*.24)+' '+(chestBottom+f*.06)+' L '+(x-f*.02)+' '+(chestBottom-f*.04)+' Z" fill="'+svgMix(dark, light, .22)+'" opacity=".9"/><path d="M '+(x-f*.18)+' '+(chestMid+f*.1)+' l '+(f*.12)+' '+(f*.14)+' l '+(f*.14)+' '+(-f*.12)+' l '+(-f*.1)+' '+(-f*.16)+' Z" fill="#d8c8aa" stroke="'+metal+'" stroke-width="'+Math.max(.7,s*.75)+'"/></g>';
    if (style === "ritualist")
      return '<g><path d="M '+(x-f*.28)+' '+(chestTop-f*.04)+' L '+(x+f*.28)+' '+(chestTop-f*.04)+' L '+(x+f*.12)+' '+(chestBottom)+' L '+(x-f*.12)+' '+(chestBottom)+' Z" fill="'+dark+'" opacity=".95"/><path d="M '+x+' '+(chestTop-f*.08)+' L '+x+' '+(chestBottom+f*.1)+'" stroke="'+light+'" stroke-width="'+Math.max(2,s*2.1)+'" opacity=".7"/><path d="M '+(x-f*.36)+' '+(chestTop+f*.1)+' Q '+x+' '+(y+f*.24)+' '+(x+f*.36)+' '+(chestTop+f*.1)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.05)+'" opacity=".9"/></g>';
    if (style === "noble")
      return '<g><path d="M '+(x-f*.54)+' '+(chestTop)+' L '+(x-f*.12)+' '+(chestTop+f*.24)+' L '+(x-f*.02)+' '+(chestBottom)+' L '+(x-f*.38)+' '+(chestBottom-f*.06)+' Z M '+(x+f*.54)+' '+(chestTop)+' L '+(x+f*.12)+' '+(chestTop+f*.24)+' L '+(x+f*.02)+' '+(chestBottom)+' L '+(x+f*.38)+' '+(chestBottom-f*.06)+' Z" fill="'+dark+'" opacity=".96"/><path d="M '+(x-f*.12)+' '+(chestTop+f*.22)+' L '+x+' '+(chestMid)+' L '+(x+f*.12)+' '+(chestTop+f*.22)+'" fill="'+pale+'" opacity=".9"/><circle cx="'+x+'" cy="'+(chestMid+f*.04)+'" r="'+Math.max(3.2,s*3.3)+'" fill="'+light+'" stroke="'+metal+'" stroke-width="'+Math.max(.7,s*.75)+'"/></g>';
    if (style === "warden")
      return '<g><path d="M '+(x-f*.58)+' '+(chestTop+f*.04)+' Q '+x+' '+(y+f*.22)+' '+(x+f*.58)+' '+(chestTop+f*.04)+' L '+(x+f*.28)+' '+(chestBottom)+' L '+(x-f*.28)+' '+(chestBottom)+' Z" fill="'+svgMix(colors.metalDark, dark, .4)+'" opacity=".96"/><path d="M '+(x-f*.2)+' '+(y+f*.22)+' Q '+x+' '+(y+f*.02)+' '+(x+f*.2)+' '+(y+f*.22)+'" fill="none" stroke="'+pale+'" stroke-width="'+Math.max(1.1,s*1.2)+'"/><path d="M '+(x-f*.42)+' '+(chestMid)+' Q '+x+' '+(chestMid+f*.18)+' '+(x+f*.42)+' '+(chestMid)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(1,s*1.1)+'" opacity=".8"/></g>';
    if (style === "bloodweave")
      return '<g><path d="M '+(x-f*.5)+' '+(chestTop)+' Q '+x+' '+(y+f*.12)+' '+(x+f*.5)+' '+(chestTop)+' L '+(x+f*.32)+' '+(chestBottom)+' L '+(x-f*.32)+' '+(chestBottom)+' Z" fill="#2d0b14" opacity=".96"/><path d="M '+(x-f*.32)+' '+(chestTop+f*.08)+' L '+(x+f*.26)+' '+(chestBottom-f*.06)+' M '+(x-f*.12)+' '+(chestTop+f*.02)+' L '+(x+f*.42)+' '+(chestMid+f*.28)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".6"/></g>';
    if (style === "moonhide")
      return '<g><path d="M '+(x-f*.62)+' '+(chestTop-f*.04)+' Q '+x+' '+(y-f*.02)+' '+(x+f*.62)+' '+(chestTop-f*.04)+' L '+(x+f*.3)+' '+(chestMid)+' Q '+x+' '+(chestMid+f*.14)+' '+(x-f*.3)+' '+(chestMid)+' Z" fill="'+svgMix(colors.skinLight, colors.skinShadow, .26)+'" opacity=".96"/><path d="M '+(x-f*.44)+' '+(chestTop+f*.02)+' L '+(x-f*.26)+' '+(chestTop+f*.26)+' L '+(x-f*.08)+' '+(chestTop+f*.04)+' L '+x+' '+(chestTop+f*.28)+' L '+(x+f*.12)+' '+(chestTop+f*.06)+' L '+(x+f*.32)+' '+(chestTop+f*.28)+' L '+(x+f*.44)+' '+(chestTop+f*.04)+'" fill="none" stroke="'+svgMix(colors.skinLight, "#ffffff", .12)+'" stroke-width="'+Math.max(1.3,s*1.45)+'" stroke-linecap="round" stroke-linejoin="round"/></g>';
    if (style === "silver reliquary")
      return '<g><path d="M '+(x-f*.44)+' '+(chestTop)+' Q '+x+' '+(y+f*.12)+' '+(x+f*.44)+' '+(chestTop)+' L '+(x+f*.22)+' '+(chestBottom)+' Q '+x+' '+(chestBottom+f*.1)+' '+(x-f*.22)+' '+(chestBottom)+' Z" fill="'+colors.metalDark+'" stroke="'+pale+'" stroke-width="'+Math.max(1.1,s*1.2)+'" opacity=".97"/><path d="M '+x+' '+(chestMid)+' l '+(-f*.14)+' '+(f*.18)+' l '+(f*.14)+' '+(f*.18)+' l '+(f*.14)+' '+(-f*.18)+' Z" fill="'+pale+'" stroke="'+metal+'" stroke-width="'+Math.max(.8,s*.85)+'"/><path d="M '+(x-f*.34)+' '+(chestMid-f*.12)+' Q '+x+' '+(chestMid+f*.02)+' '+(x+f*.34)+' '+(chestMid-f*.12)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.95,s)+'" opacity=".7"/></g>';
    if (style === "night corsair")
      return '<g><path d="M '+(x-f*.56)+' '+(chestTop-f*.02)+' L '+(x-f*.16)+' '+(chestBottom)+' L '+(x+f*.12)+' '+(chestBottom)+' L '+(x-f*.24)+' '+(chestTop+f*.04)+' Z" fill="#0d1017" opacity=".96"/><path d="M '+(x+f*.02)+' '+(chestTop)+' L '+(x+f*.36)+' '+(chestTop+f*.08)+' L '+(x+f*.22)+' '+(chestBottom-f*.02)+' L '+(x-f*.02)+' '+(chestBottom-f*.06)+' Z" fill="'+svgMix(dark, "#0d1017", .35)+'" opacity=".96"/><path d="M '+(x-f*.42)+' '+(chestMid+f*.06)+' Q '+x+' '+(chestMid+f*.18)+' '+(x+f*.36)+' '+(chestMid-f*.04)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.95,s)+'" stroke-dasharray="'+Math.max(2,s*2)+' '+Math.max(4,s*4)+'" opacity=".8"/></g>';
    return '<g><path d="M '+(x-f*.48)+' '+(chestTop)+' Q '+x+' '+(y+f*.12)+' '+(x+f*.48)+' '+(chestTop)+' L '+(x+f*.3)+' '+(chestBottom)+' L '+(x-f*.3)+' '+(chestBottom)+' Z" fill="'+dark+'" opacity=".94"/><path d="M '+(x-f*.28)+' '+(chestMid)+' Q '+x+' '+(chestMid+f*.14)+' '+(x+f*.28)+' '+(chestMid)+'" fill="none" stroke="'+light+'" stroke-width="'+Math.max(.9,s)+'" opacity=".55"/></g>';
  }

  function presetAccessoryGeometry(a, faction, fit, colors) {
    var item = a.accessory;
    if (!item || item === "none") return "";
    var x = fit.x, top = fit.top, y = fit.mouth, f = fit.face, s = fit.s;
    var sw = Math.max(1, s * 1.1);
    var metal = colors.metalMid;
    var pale = colors.metalLight;
    var accent = colors.accentLight;
    var dark = colors.accentDark;
    if (item === "chain halo") return '<g><ellipse cx="'+x+'" cy="'+(top+f*.82)+'" rx="'+(f*1.18)+'" ry="'+(f*1.38)+'" fill="none" stroke="'+pale+'" stroke-width="'+Math.max(1.5,s*1.6)+'" stroke-dasharray="'+(s*1.7)+' '+(s*6)+'" opacity=".96"/><ellipse cx="'+x+'" cy="'+(top+f*.82)+'" rx="'+(f*.98)+'" ry="'+(f*1.18)+'" fill="none" stroke="'+accent+'" stroke-width="'+Math.max(.9,s*1.0)+'" opacity=".58"/><circle cx="'+x+'" cy="'+(top-f*.48)+'" r="'+Math.max(3,s*3.1)+'" fill="'+accent+'" stroke="'+pale+'" stroke-width="'+Math.max(.7,s*.75)+'"/></g>';
    if (item === "thorn crown") return '<g><path d="M '+(x-f*.74)+' '+(top+f*.22)+' L '+(x-f*.5)+' '+(top-f*.06)+' L '+(x-f*.28)+' '+(top+f*.14)+' L '+x+' '+(top-f*.22)+' L '+(x+f*.28)+' '+(top+f*.14)+' L '+(x+f*.54)+' '+(top-f*.06)+' L '+(x+f*.76)+' '+(top+f*.22)+'" fill="none" stroke="'+metal+'" stroke-width="'+Math.max(1.4,s*1.45)+'" stroke-linejoin="round" opacity=".98"/><path d="M '+(x-f*.5)+' '+(top-f*.06)+' l '+(-f*.16)+' '+(-f*.12)+' M '+x+' '+(top-f*.22)+' l 0 '+(-f*.18)+' M '+(x+f*.54)+' '+(top-f*.06)+' l '+(f*.18)+' '+(-f*.12)+'" fill="none" stroke="'+accent+'" stroke-width="'+Math.max(1,s*1.05)+'" stroke-linecap="round" opacity=".9"/></g>';
    if (item === "blood crystal earrings") return '<g><path d="M '+(x-f*.88)+' '+(y-f*.7)+' v '+(f*.26)+' M '+(x+f*.88)+' '+(y-f*.7)+' v '+(f*.26)+'" fill="none" stroke="'+pale+'" stroke-width="'+Math.max(.8,s*.8)+'"/><path d="M '+(x-f*.88)+' '+(y-f*.42)+' l '+(-f*.08)+' '+(f*.18)+' l '+(f*.08)+' '+(f*.16)+' l '+(f*.08)+' '+(-f*.16)+' Z M '+(x+f*.88)+' '+(y-f*.42)+' l '+(-f*.08)+' '+(f*.18)+' l '+(f*.08)+' '+(f*.16)+' l '+(f*.08)+' '+(-f*.16)+' Z" fill="#c92d49" stroke="#ff98a7" stroke-width="'+Math.max(.7,s*.7)+'"/></g>';
    if (item === "silver ear cuffs") return '<g fill="none" stroke="'+pale+'"><path d="M '+(x-f*.92)+' '+(y-f*.78)+' q '+(-f*.16)+' '+(f*.22)+' 0 '+(f*.42)+' M '+(x+f*.92)+' '+(y-f*.78)+' q '+(f*.16)+' '+(f*.22)+' 0 '+(f*.42)+'" stroke-width="'+Math.max(1.2,s*1.25)+'" opacity=".98"/><path d="M '+(x-f*.98)+' '+(y-f*.42)+' q '+(f*.08)+' '+(f*.08)+' '+(f*.16)+' 0 M '+(x+f*.98)+' '+(y-f*.42)+' q '+(-f*.08)+' '+(f*.08)+' '+(-f*.16)+' 0" stroke-width="'+Math.max(.8,s*.85)+'" opacity=".82"/></g>';
    if (item === "raven feather") return '<g><path d="M '+(x+f*.5)+' '+(top+f*.08)+' C '+(x+f*.92)+' '+(top-f*.7)+', '+(x+f*1.28)+' '+(top-f*.54)+', '+(x+f*1.08)+' '+(top+f*.18)+' C '+(x+f*.9)+' '+(top+f*.6)+', '+(x+f*.7)+' '+(top+f*.56)+', '+(x+f*.5)+' '+(top+f*.08)+' Z" fill="#11141b" stroke="#6e7583" stroke-width="'+Math.max(.9,s*.9)+'"/><path d="M '+(x+f*.58)+' '+(top+f*.12)+' L '+(x+f*1.12)+' '+(top-f*.5)+' M '+(x+f*.72)+' '+(top-f*.08)+' l '+(f*.14)+' '+(-f*.12)+' M '+(x+f*.82)+' '+(top+f*.08)+' l '+(f*.16)+' '+(-f*.08)+'" fill="none" stroke="#98a0af" stroke-width="'+Math.max(.7,s*.72)+'" opacity=".62"/></g>';
    if (item === "ritual veil") return '<g><path d="M '+(x-f*.64)+' '+(top+f*.64)+' Q '+x+' '+(top+f*.16)+' '+(x+f*.64)+' '+(top+f*.64)+' L '+(x+f*.5)+' '+(y+f*.58)+' Q '+x+' '+(y+f*.88)+' '+(x-f*.5)+' '+(y+f*.58)+' Z" fill="'+dark+'" opacity=".26" stroke="'+accent+'" stroke-width="'+Math.max(.8,s*.85)+'"/><path d="M '+(x-f*.36)+' '+(y-f*.08)+' h '+(f*.72)+' M '+(x-f*.28)+' '+(y+f*.12)+' h '+(f*.56)+' M '+(x-f*.2)+' '+(y+f*.32)+' h '+(f*.4)+'" fill="none" stroke="'+pale+'" stroke-opacity=".42" stroke-width="'+Math.max(.7,s*.72)+'"/></g>';
    if (item === "trophy fangs") return '<g><path d="M '+(x-f*.48)+' '+(y+f*.56)+' Q '+x+' '+(y+f*.82)+' '+(x+f*.48)+' '+(y+f*.56)+'" fill="none" stroke="'+metal+'" stroke-width="'+sw+'"/><path d="M '+(x-f*.24)+' '+(y+f*.68)+' l '+(-f*.06)+' '+(f*.24)+' l '+(f*.11)+' '+(f*.16)+' l '+(f*.08)+' '+(-f*.32)+' M '+(x+f*.24)+' '+(y+f*.68)+' l '+(f*.06)+' '+(f*.24)+' l '+(-f*.11)+' '+(f*.16)+' l '+(-f*.08)+' '+(-f*.32)+'" fill="#eadbc2" stroke="'+metal+'" stroke-width="'+Math.max(.7,s*.72)+'"/></g>';
    if (item === "moonstone torque") return '<g><path d="M '+(x-f*.48)+' '+(y+f*.52)+' Q '+x+' '+(y+f*.82)+' '+(x+f*.48)+' '+(y+f*.52)+'" fill="none" stroke="'+pale+'" stroke-width="'+Math.max(1.3,s*1.35)+'"/><path d="M '+(x-f*.36)+' '+(y+f*.58)+' q '+(f*.1)+' '+(f*.08)+' '+(f*.22)+' 0 q '+(f*.1)+' '+(f*.08)+' '+(f*.22)+' 0" fill="none" stroke="'+metal+'" stroke-width="'+Math.max(.8,s*.82)+'" opacity=".8"/><path d="M '+x+' '+(y+f*.72)+' l '+(-f*.14)+' '+(f*.14)+' l '+(f*.14)+' '+(f*.2)+' l '+(f*.14)+' '+(-f*.2)+' Z" fill="#9dc3ff" stroke="'+pale+'" stroke-width="'+Math.max(.7,s*.75)+'"/></g>';
    if (item === "bone charms") return '<g><path d="M '+(x-f*.5)+' '+(y+f*.54)+' Q '+x+' '+(y+f*.78)+' '+(x+f*.5)+' '+(y+f*.54)+'" fill="none" stroke="#78614d" stroke-width="'+Math.max(1.1,s*1.15)+'"/><path d="M '+(x-f*.34)+' '+(y+f*.62)+' l '+(-f*.06)+' '+(f*.2)+' l '+(f*.08)+' '+(f*.12)+' l '+(f*.1)+' '+(-f*.24)+' M '+x+' '+(y+f*.66)+' l '+(-f*.04)+' '+(f*.24)+' l '+(f*.04)+' '+(f*.12)+' l '+(f*.04)+' '+(-f*.12)+' l '+(-f*.04)+' '+(-f*.24)+' M '+(x+f*.34)+' '+(y+f*.62)+' l '+(f*.06)+' '+(f*.2)+' l '+(-f*.08)+' '+(f*.12)+' l '+(-f*.1)+' '+(-f*.24)+'" fill="#decaa8" stroke="#685748" stroke-width="'+Math.max(.7,s*.72)+'"/></g>';
    var gem = item === "reliquary brooch" ? colors.accentLight : accent;
    return '<g><path d="M '+(x-f*.16)+' '+(y+f*.7)+' h '+(f*.32)+'" fill="none" stroke="'+metal+'" stroke-width="'+Math.max(1,s*1.02)+'" opacity=".85"/><circle cx="'+x+'" cy="'+(y+f*.72)+'" r="'+Math.max(4,s*4.2)+'" fill="'+colors.metalDark+'" stroke="'+pale+'" stroke-width="'+Math.max(.9,s*.92)+'"/><path d="M '+x+' '+(y+f*.58)+' l '+(-f*.08)+' '+(f*.14)+' l '+(f*.08)+' '+(f*.18)+' l '+(f*.08)+' '+(-f*.18)+' Z" fill="'+gem+'" stroke="'+pale+'" stroke-width="'+Math.max(.7,s*.72)+'"/></g>';
  }

  function presetEquipmentGeometry(entity, faction, fit, colors) {
    var equipment = entity && (entity.equipment || (entity.player && entity.player.equipment));
    if (!equipment) return "";
    var x = fit.x, top = fit.top, y = fit.mouth, f = fit.face, s = fit.s, out = "";
    if (equipment.head)
      out += '<path d="M '+(x-f*.62)+' '+(top+f*.22)+' Q '+x+' '+(top-f*.02)+' '+(x+f*.62)+' '+(top+f*.22)+'" fill="none" stroke="'+rarityColor(equipment.head, colors.metalLight)+'" stroke-width="'+Math.max(1.4,s*1.5)+'"/><path d="M '+x+' '+(top+f*.02)+' l '+(-f*.1)+' '+(f*.16)+' l '+(f*.1)+' '+(f*.16)+' l '+(f*.1)+' '+(-f*.16)+' Z" fill="'+colors.metalDark+'" stroke="'+rarityColor(equipment.head, colors.metalLight)+'" stroke-width="'+Math.max(.7,s*.7)+'"/>';
    if (equipment.amulet)
      out += '<path d="M '+(x-f*.34)+' '+(y+f*.54)+' Q '+x+' '+(y+f*.76)+' '+(x+f*.34)+' '+(y+f*.54)+'" fill="none" stroke="'+colors.metalMid+'" stroke-width="'+Math.max(1,s)+'"/><circle cx="'+x+'" cy="'+(y+f*.72)+'" r="'+Math.max(3,s*3)+'" fill="'+rarityColor(equipment.amulet, colors.accentLight)+'" stroke="'+colors.metalLight+'" stroke-width="'+Math.max(.7,s*.7)+'"/>';
    return out;
  }

  function svgApplyHair(root, a, faction, presetId, colors) {
    var style = hairStyleToken(a.hair);
    var palette = [svgDarken(colors.hairDark, .04), colors.hairDark, svgMix(colors.hairLight, colors.hairDark, .54)];
    svgRecolorPart(root, "hair", palette, {});
    if (faction === "bloodbound" && style === "shorn") svgSetPartStyle(root, "hair", "opacity:.92");
    else if (faction === "bloodbound" && style === "cropped") svgSetPartStyle(root, "hair", "opacity:.96");
    else if (faction === "moonborn" && style === "shorn") svgSetPartStyle(root, "hair", "opacity:.94");
  }

  function svgApplyEyes(root, a, colors, profile) {
    var eyeIds = (profile && profile.eyes) || [];
    for (var i = 0; i < eyeIds.length; i++) svgRecolorGradient(root, eyeIds[i], [svgDarken(colors.eye, .45), colors.eye, "#ffffff"]);
    var eyes = root.querySelectorAll('[data-wb-part="eyes"]');
    var glowSize = a.eyeGlow === "dormant" ? 0 : a.eyeGlow === "gleaming" ? 2.5 : a.eyeGlow === "radiant" ? 5 : 8;
    for (var e = 0; e < eyes.length; e++) {
      var node = eyes[e];
      var fill = node.getAttribute("fill");
      var lum = svgLuminance(fill);
      if (fill && fill !== "none" && svgHex(fill) && lum > .12 && lum < .92) node.setAttribute("fill", colors.eye);
      if (glowSize && fill && fill !== "none") {
        var previous = node.getAttribute("style") || "";
        node.setAttribute("style", previous + (previous && previous.slice(-1) !== ";" ? ";" : "") + "filter:drop-shadow(0 0 " + glowSize + "px " + colors.eye + ")");
      }
    }
  }


  function svgForceOpaqueNodes(root, selector) {
    var nodes = root.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!node || node.nodeType !== 1) continue;
      if (node.hasAttribute("opacity")) node.setAttribute("opacity", "1");
      if (node.hasAttribute("fill-opacity")) node.setAttribute("fill-opacity", "1");
      if (node.hasAttribute("stroke-opacity")) node.setAttribute("stroke-opacity", "1");
      var style = node.getAttribute("style") || "";
      if (style) {
        style = style.replace(/(?:^|;)\s*opacity\s*:[^;]+/gi, "");
        style = style.replace(/(?:^|;)\s*fill-opacity\s*:[^;]+/gi, "");
        style = style.replace(/(?:^|;)\s*stroke-opacity\s*:[^;]+/gi, "");
        style = style.replace(/^;+|;+$/g, "");
        if (style) style += ";";
        style += "opacity:1;fill-opacity:1;stroke-opacity:1";
        node.setAttribute("style", style);
      }
      var attrs = ["fill", "stroke"];
      for (var a = 0; a < attrs.length; a++) {
        var value = node.getAttribute(attrs[a]) || "";
        var m = /^url\(#([^\)]+)\)$/.exec(value);
        if (!m) continue;
        var grad = svgFindId(root, m[1]);
        if (!grad) continue;
        var stops = grad.querySelectorAll("stop");
        for (var s = 0; s < stops.length; s++) {
          stops[s].setAttribute("stop-opacity", "1");
        }
      }
    }
  }



  function svgRemoveFirstWerewolfRimLight(root, presetId) {
    if (presetId !== "moonborn_howlwarden") return;
    var groups = root.querySelectorAll('g[opacity="0.15"]');
    for (var i = 0; i < groups.length; i++) {
      var group = groups[i];
      var fill = lower(group.getAttribute("fill") || "");
      if (fill === "#e0e5ec" || fill === "rgb(224, 229, 236)") {
        if (group.parentNode) group.parentNode.removeChild(group);
      }
    }
  }

  function svgRemoveFirstWerewolfFog(root, presetId) {
    if (presetId !== "moonborn_howlwarden") return;
    var fogGroups = root.querySelectorAll('g[filter="url(#blurMist)"], g[filter*="blurMist"]');
    for (var i = 0; i < fogGroups.length; i++) {
      var group = fogGroups[i];
      var op = group.getAttribute("opacity") || "";
      if (op === "0.6" || group.querySelector('ellipse[fill="#A0A0C0"], ellipse[fill="#8080A0"], ellipse[fill="#C0C0E0"]')) {
        if (group.parentNode) group.parentNode.removeChild(group);
      }
    }
  }

  function svgSolidifyFirstWerewolf(root, a, presetId, colors) {    if (presetId !== "moonborn_howlwarden") return;
    var solidHair = [svgDarken(colors.hairDark, 0.02), colors.hairDark, svgMix(colors.hairLight, colors.hairDark, 0.82)];
    svgRecolorPart(root, "hair", solidHair, {});
    svgForceOpaqueNodes(root, '[data-wb-part="hair"], .wb-svg-hair-back *, .wb-svg-hair-detail *, .wb-svg-beard *');

    var flatten = root.querySelectorAll('[data-wb-part="hair"], .wb-svg-hair-back *, .wb-svg-hair-detail *, .wb-svg-beard *');
    for (var i = 0; i < flatten.length; i++) {
      var node = flatten[i];
      if (!node || node.nodeType !== 1) continue;
      var fill = node.getAttribute("fill");
      if (fill && fill !== "none") {
        var amount = svgLuminance(fill);
        node.setAttribute("fill", amount > 0.52 ? colors.hairLight : colors.hairDark);
      }
      var stroke = node.getAttribute("stroke");
      if (stroke && stroke !== "none") {
        node.setAttribute("stroke", svgMix(colors.hairDark, colors.hairLight, 0.18));
      }
      node.removeAttribute("filter");
    }

    var back = root.querySelector('.wb-svg-hair-back');
    if (back) {
      back.setAttribute('style', 'opacity:1;fill-opacity:1;stroke-opacity:1');
    }
  }

  function svgApplyVariants(root, a, faction, presetId, entity, colors) {
    var fit = refinedFit(presetId, faction);
    svgRecolorPart(root, "hair", [colors.hairDark, svgMix(colors.hairLight, colors.hairDark, .45), colors.hairLight], {});
    svgSolidifyFirstWerewolf(root, a, presetId, colors);
    svgSetPartStyle(root, "markings", "display:none");
    if (faction === "bloodbound") {
      var accessoryBehind = a.accessory === "chain halo" || a.accessory === "raven feather" || a.accessory === "ritual veil";
      svgInsertFragment(root, "wb-svg-part wb-svg-accessory", presetAccessoryGeometry(a, faction, fit, colors), accessoryBehind ? "behind" : "front");
    }
    svgInsertFragment(root, "wb-svg-part wb-svg-equipment", presetEquipmentGeometry(entity, faction, fit, colors), "front");
  }

  function isUntouchedBloodboundAppearance(a) {
    return !!a &&
      a.hair === "razor crop" &&
      a.beard === "none" &&
      a.skin === "pale" &&
      a.eyes === "crimson" &&
      a.eyeGlow === "dormant" &&
      a.hairColor === "raven" &&
      a.marking === "none" &&
      a.outfit === "wanderer" &&
      a.cloak === "none" &&
      a.accessory === "none";
  }


  function isUntouchedMoonbornAppearance(a) {
    return !!a &&
      a.hair === "feral crown" &&
      a.beard === "none" &&
      a.skin === "ash" &&
      a.eyes === "amber" &&
      a.eyeGlow === "radiant" &&
      a.hairColor === "obsidian" &&
      a.marking === "moon sigil" &&
      (a.outfit === "hunter" || a.outfit === "wanderer") &&
      a.cloak === "none" &&
      (a.accessory === "bone charms" || a.accessory === "none");
  }

  function serializeExactPresetRoot(root, label, presetId, serial) {
    svgPrefixIds(root, "wbp" + serial + "-");
    root.setAttribute("class", ((root.getAttribute("class") || "") + " wb-preset-inline").trim());
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", label);
    root.setAttribute("preserveAspectRatio", root.getAttribute("preserveAspectRatio") || "xMidYMid meet");
    root.setAttribute("data-wb-preset", presetId);
    root.removeAttribute("width");
    root.removeAttribute("height");
    return new XMLSerializer().serializeToString(root);
  }

  function svgStripBattleBackground(root) {
    if (!root) return;
    var backgroundPattern = /(?:^|\b)(background|backdrop|sky|stars?|moon(?:\s+and\s+glow|\s+craters?|\s+texture|\s+glow)?|glowing\s+(?:full\s+)?moon|clouds?|bats?|distant\s+castle|castle\s+windows?|landscape|ground|floor\s+(?:mist|shadow)|shadow\s+under|foreground\s+(?:mist|fog)|atmospher(?:e|ic)|fog|mist|scenery)(?:\b|$)/i;
    var characterPattern = /(?:vampire|werewolf)\s+character|character\s+group|symmetrical\s+werewolf\s+body|core\s+werewolf\s+body|werewolf\s+body|character\s+body|head\s*&?\s*neck|torso\s*&?\s*musculature/i;

    function prune(parent) {
      if (!parent || parent.nodeType !== 1 || lower(parent.localName) === "defs") return;
      var children = Array.prototype.slice.call(parent.childNodes || []);
      var removeSection = false;
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node.nodeType === 8) {
          var comment = String(node.nodeValue || "").replace(/\s+/g, " ").trim();
          if (characterPattern.test(comment) || /moonlight\s+rim|rim\s+lighting/i.test(comment)) {
            removeSection = false;
            continue;
          }
          if (backgroundPattern.test(comment)) {
            removeSection = true;
            if (node.parentNode) node.parentNode.removeChild(node);
            continue;
          }
          if (/face|snout|jaw|eyes?|hair|mane|body|arms?|legs?|hands?|feet|claws?|outfit|shirt|vest|jacket|pants|boots/i.test(comment))
            removeSection = false;
          continue;
        }
        if (node.nodeType !== 1) continue;
        if (lower(node.localName) === "defs") continue;
        if (removeSection) {
          if (node.parentNode) node.parentNode.removeChild(node);
          continue;
        }
        prune(node);
      }
    }

    prune(root);

    var explicit = root.querySelectorAll(
      '.wb-stage, [data-wb-part="background"], [data-wb-background="true"], [id*="background" i], [class*="background" i], [id*="backdrop" i], [class*="backdrop" i], [id*="sky" i], [class*="sky" i], [id*="moon" i], [class*="moon" i], [id*="fog" i], [class*="fog" i], [id*="mist" i], [class*="mist" i]'
    );
    for (var e = 0; e < explicit.length; e++) {
      if (explicit[e].parentNode && lower(explicit[e].localName) !== "defs")
        explicit[e].parentNode.removeChild(explicit[e]);
    }

    var viewBox = String(root.getAttribute("viewBox") || "0 0 512 512")
      .trim()
      .split(/\s+/)
      .map(Number);
    var width = Math.abs(viewBox[2] || 512);
    var height = Math.abs(viewBox[3] || 512);
    var direct = Array.prototype.slice.call(root.children || []);
    for (var d = 0; d < direct.length; d++) {
      var element = direct[d];
      var tag = lower(element.localName);
      if (tag === "defs") continue;
      if (tag === "rect") {
        var rw = parseFloat(element.getAttribute("width") || "0");
        var rh = parseFloat(element.getAttribute("height") || "0");
        if (rw >= width * 0.78 && rh >= height * 0.78 && element.parentNode)
          element.parentNode.removeChild(element);
      } else if (tag === "circle") {
        var cr = parseFloat(element.getAttribute("r") || "0");
        if (cr >= Math.max(width, height) * 0.2 && element.parentNode)
          element.parentNode.removeChild(element);
      } else if (tag === "ellipse") {
        var erx = parseFloat(element.getAttribute("rx") || "0");
        var ery = parseFloat(element.getAttribute("ry") || "0");
        if (erx >= width * 0.22 && ery >= height * 0.08 && element.parentNode)
          element.parentNode.removeChild(element);
      }
    }

    root.setAttribute(
      "class",
      ((root.getAttribute("class") || "") + " wb-battle-transparent").trim(),
    );
    root.setAttribute(
      "style",
      ((root.getAttribute("style") || "") + ";background:transparent").replace(/^;/, ""),
    );
  }

  function customizePresetSvg(svg, faction, label, a, presetId, entity, serial, size) {
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(String(svg || ""), "image/svg+xml");
      if (doc.querySelector("parsererror")) throw new Error("SVG inválido");
      var root = doc.documentElement;
      if (size === "battle") svgStripBattleBackground(root);
      if (faction === "bloodbound" && isUntouchedBloodboundAppearance(a))
        return serializeExactPresetRoot(root, label, presetId, serial);
      var colors = presetColors(a);
      var profile = presetPartProfiles[presetId] || {};
      var outfitPalette = refinedPalette3(svgPaletteForOutfit(a, colors));
      var cloakPalette = refinedPalette3(svgPaletteForCloak(a, colors));
      var skinPalette = [colors.skinShadow, colors.skin, colors.skinLight];
      var furPalette = refinedFurPalettes[a.skin] || refinedFurPalettes.ash;
      var metalPalette = [colors.metalDark, colors.metalMid, colors.metalLight];
      svgTagParts(root, faction);
      var i;
      for (i = 0; i < (profile.fur || []).length; i++) svgRecolorGradient(root, profile.fur[i], furPalette);
      for (i = 0; i < (profile.skin || []).length; i++) svgRecolorGradient(root, profile.skin[i], skinPalette);
      for (i = 0; i < (profile.hair || []).length; i++) svgRecolorGradient(root, profile.hair[i], [colors.hairDark, colors.hairLight]);
      for (i = 0; i < (profile.outfit || []).length; i++) svgRecolorGradient(root, profile.outfit[i], outfitPalette);
      for (i = 0; i < (profile.cloak || []).length; i++) svgRecolorGradient(root, profile.cloak[i], cloakPalette);
      for (i = 0; i < (profile.metal || []).length; i++) svgRecolorGradient(root, profile.metal[i], metalPalette);
      for (i = 0; i < (profile.bone || []).length; i++) svgRecolorGradient(root, profile.bone[i], ["#8d806b", "#f4ead2"]);
      var cache = {};
      svgRecolorPart(root, "fur", furPalette, cache);
      svgRecolorPart(root, "skin", skinPalette, cache);
      svgRecolorPart(root, "outfit", outfitPalette, cache);
      svgRecolorPart(root, "cloak", cloakPalette, cache);
      svgSetPartStyle(root, "cloak", "display:none");
      svgRecolorPart(root, "metal", metalPalette, cache);
      svgRecolorPart(root, "bone", ["#8d806b", "#f4ead2"], cache);
      svgApplyEyes(root, a, colors, profile);
      svgApplyVariants(root, a, faction, presetId, entity, colors);
      svgRemoveFirstWerewolfRimLight(root, presetId);
      svgRemoveFirstWerewolfFog(root, presetId);
      if (size === "battle") svgStripBattleBackground(root);
      svgPrefixIds(root, "wbp" + serial + "-");
      root.setAttribute("class", ((root.getAttribute("class") || "") + " wb-preset-inline").trim());
      root.setAttribute("role", "img");
      root.setAttribute("aria-label", label);
      root.setAttribute("preserveAspectRatio", root.getAttribute("preserveAspectRatio") || "xMidYMid meet");
      root.setAttribute("data-wb-preset", presetId);
      root.removeAttribute("width");
      root.removeAttribute("height");
      return new XMLSerializer().serializeToString(root);
    } catch (error) {
      return String(svg || "").replace(/<svg\b/, '<svg class="wb-preset-inline" role="img" aria-label="' + esc(label) + '"');
    }
  }

  function inlinePresetSvg(svg, faction, label, appearanceData, presetId, entity, size) {
    var serial = ++portraitSerial;
    var customizedSvg = customizePresetSvg(svg, faction, label, appearanceData, presetId, entity, serial, size);
    return (
      '<span class="portrait-svg wb-character-portrait wb-static-preset wb-customized-preset wb-faction-' +
      faction +
      '" role="img" aria-label="' + esc(label) + '">' +
      '<span class="wb-preset-canvas">' + customizedSvg + "</span></span>"
    );
  }

  function rarityColor(item, fallback) {
    return item && rarityColors[item.rarity]
      ? rarityColors[item.rarity]
      : fallback;
  }

  function hashString(value) {
    value = String(value || "");
    var hash = 0;
    for (var i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
    return Math.abs(hash);
  }

  var equipmentPalettes = {
    weapon: [["#3f2721", "#7e5d4a", "#d7bca0"], ["#223243", "#60748f", "#cad8ef"], ["#453126", "#9a633b", "#f2c57c"], ["#2b2f3e", "#67577d", "#c5a5ef"]],
    secondary: [["#2d3945", "#5c8294", "#9de2e0"], ["#443026", "#8c5a49", "#f0b198"], ["#2f293d", "#6f5f93", "#d2baf7"]],
    head: [["#2c2a37", "#64567a", "#c7b2e7"], ["#3f2d25", "#9a5e41", "#f0ba82"], ["#233241", "#56779f", "#b9d2f4"]],
    chest: [["#40262a", "#9a5647", "#f1b389"], ["#263646", "#55779d", "#bfd9f4"], ["#2f3e31", "#61805f", "#c3e2b4"], ["#332c42", "#715f93", "#d7bef8"]],
    hands: [["#32283a", "#775b85", "#d8b8ea"], ["#3f2d25", "#95644e", "#edb58d"], ["#203846", "#558497", "#a9e0e9"]],
    legs: [["#2f2f3d", "#676d8c", "#c9d0ee"], ["#3d3129", "#8b6a4d", "#e7c39a"], ["#2b3a2f", "#668467", "#bce0ba"]],
    feet: [["#2d313b", "#647186", "#c1d1e7"], ["#413027", "#9b654d", "#f0bd95"], ["#2a3536", "#588286", "#a7dbd8"]],
    amulet: [["#342b45", "#705f93", "#dfc5ff"], ["#423223", "#987446", "#f3d38f"], ["#213e44", "#5f8f8c", "#b4f0ea"]],
    ring1: [["#3f3124", "#987145", "#efcc88"], ["#2f2940", "#6f5f95", "#d2bbff"], ["#243642", "#607e95", "#c7dcef"]],
    ring2: [["#3f3124", "#987145", "#efcc88"], ["#2f2940", "#6f5f95", "#d2bbff"], ["#243642", "#607e95", "#c7dcef"]],
    relic: [["#2d263b", "#695681", "#ccaff0"], ["#3d2e22", "#956749", "#f3bf8d"], ["#273343", "#557293", "#b7d2f5"], ["#2c3b30", "#5f845d", "#c2e2b6"]],
    consumable: [["#2c3d29", "#63835f", "#c4e2b2"], ["#253446", "#557798", "#c1dbf2"], ["#412a35", "#8e5471", "#e4b1cc"]],
    default: [["#2f3240", "#68748a", "#c6d1df"], ["#3b2e27", "#8e654d", "#e6c09f"], ["#30293d", "#6d6190", "#d1c0f5"]],
  };

  function equipmentPalette(item, colors) {
    if (!item)
      return {
        dark: colors.metalDark,
        mid: colors.metalMid,
        light: colors.metalLight,
        edge: colors.metalMid,
        gem: colors.accentLight,
      };
    var slot = item.slot || item.type || "default";
    var group = equipmentPalettes[slot] || equipmentPalettes.default;
    var swatch = group[hashString((item.templateId || item.name || slot) + (item.rarity || "common")) % group.length];
    return {
      dark: swatch[0],
      mid: swatch[1],
      light: swatch[2],
      edge: rarityColor(item, swatch[2]),
      gem: rarityColor(item, colors.accentLight),
    };
  }

  function equipmentTone(item, colors) {
    return equipmentPalette(item, colors).edge;
  }

  function title(value) {
    return String(value || "").replace(
      /(^|\s)(\w)/g,
      function (_, gap, letter) {
        return gap + letter.toUpperCase();
      },
    );
  }

  function describe(entity) {
    var faction = entity.faction === "bloodbound" ? "bloodbound" : "moonborn";
    var a = normalizeAppearance(entity.appearance, faction);
    var accessoryText =
      faction === "bloodbound" && a.accessory !== "none"
        ? ", acessório " + PT.label(a.accessory).toLowerCase()
        : "";
    return (
      D.factions[faction].name +
      ", olhos " +
      PT.label(a.eyes).toLowerCase() +
      ", acabamento " +
      PT.label(a.metal).toLowerCase() +
      accessoryText +
      (a.portrait ? ", retrato " + presetLabel(a.portrait).toLowerCase() : "")
    );
  }

  function stageArt(a, faction, ids, colors) {
    var bg = a.background;
    var moonX = faction === "moonborn" ? 306 : 110;
    var moonFill = faction === "moonborn" ? "#dce8ff" : "#e9c4c9";
    var scenery = "";
    if (bg === "survivor") {
      scenery =
        '<path d="M0 490L42 405 61 444 94 344 126 421 167 323 203 430 251 345 292 424 339 315 381 418 420 366V640H0Z" fill="#0a1116"/>' +
        '<path d="M31 514V330m73 192V303m238 211V284m49 238V361" stroke="#182328" stroke-width="13"/>';
    } else if (bg === "acolyte") {
      scenery =
        '<circle cx="210" cy="348" r="166" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-opacity=".15" stroke-width="2"/>' +
        '<circle cx="210" cy="348" r="125" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-opacity=".12" stroke-width="1"/>' +
        '<path d="M210 182l34 63 72 10-52 50 13 72-67-34-67 34 13-72-52-50 72-10Z" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-opacity=".12" stroke-width="2"/>';
    } else if (bg === "out rider" || bg === "outrider") {
      scenery =
        '<path d="M0 468L74 345l43 53 76-151 62 130 50-76 115 167v172H0Z" fill="#111621"/>' +
        '<path d="M103 375l14 23 76-151 31 64" fill="none" stroke="#64748e" stroke-opacity=".4" stroke-width="7"/>';
    } else if (bg === "heir") {
      scenery =
        '<path d="M34 520V196h96v324M290 520V196h96v324" fill="#0d0c13" stroke="#38303e" stroke-width="7"/>' +
        '<path d="M34 201q48-92 96 0M290 201q48-92 96 0" fill="none" stroke="#4b3d4c" stroke-width="7"/>' +
        '<path d="M64 218v185m36-185v185m220-185v185m36-185v185" stroke="#5d4952" stroke-opacity=".5" stroke-width="4"/>';
    } else if (bg === "bell warden") {
      scenery =
        '<path d="M88 488V184h244v304" fill="#0e0f15" stroke="#343745" stroke-width="9"/>' +
        '<path d="M104 184q106-148 212 0" fill="none" stroke="#3b4051" stroke-width="9"/>' +
        '<path d="M210 152v118m-52-54q52-80 104 0l-13 68h-78Z" fill="#201b1d" stroke="#8a6d4a" stroke-width="5"/>' +
        '<circle cx="210" cy="286" r="9" fill="#c19a5c"/>';
    } else if (bg === "grave pilgrim") {
      scenery =
        '<path d="M0 535q90-80 183-7 82-94 237 4v108H0Z" fill="#0d1115"/>' +
        '<path d="M58 508v-94m-27 25h54m274 72v-118m-31 31h62M119 529v-70m-18 20h36" stroke="#30333e" stroke-width="9"/>';
    } else if (bg === "rift touched") {
      scenery =
        '<path d="M218 88l-48 112 42 72-59 106 60 77-36 132" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-opacity=".45" stroke-width="6"/>' +
        '<path d="M226 92l21 115-31 69 48 103-42 77 27 128" fill="none" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>';
    } else {
      scenery =
        '<path d="M38 518V298h91v220m162 0V259h92v259" fill="#0d1016" stroke="#30323d" stroke-width="7"/>' +
        '<path d="M38 300l46-78 45 78m162-39 46-91 46 91" fill="#11131b" stroke="#343641" stroke-width="7"/>';
    }
    return (
      '<g class="wb-stage">' +
      '<rect width="420" height="640" rx="18" fill="url(#' +
      ids.bg +
      ')"/>' +
      '<circle cx="' +
      moonX +
      '" cy="105" r="72" fill="' +
      moonFill +
      '" opacity=".16" filter="url(#' +
      ids.blur +
      ')"/>' +
      '<circle cx="' +
      moonX +
      '" cy="105" r="54" fill="' +
      moonFill +
      '" opacity=".46"/>' +
      '<circle cx="' +
      (moonX - 14) +
      '" cy="92" r="6" fill="#4f5261" opacity=".42"/>' +
      '<circle cx="' +
      (moonX + 18) +
      '" cy="120" r="10" fill="#4f5261" opacity=".46"/>' +
      scenery +
      '<path d="M0 545q89-34 180 2 107-48 240 2v91H0Z" fill="#080a0f"/>' +
      '<path d="M-20 570q126-68 254 0t218 0v70H-20Z" fill="url(#' +
      ids.fog +
      ')" opacity=".65"/>' +
      "</g>"
    );
  }

  function cloakLayer(a, colors) {
    var cloak = a.cloak;
    if (cloak === "none") return "";
    if (cloak === "wolf pelt") {
      return (
        '<g class="wb-cloak wb-cloak-pelt"><path d="M128 278q82-53 164 0l41 238-57-34-22 80-44-42-45 42-22-80-57 34Z" fill="' +
        colors.hairDark +
        '" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-opacity=".48" stroke-width="5"/>' +
        '<path d="M127 286l23-36 24 29 36-45 36 45 25-29 23 36-35 39-49-20-50 20Z" fill="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" opacity=".58"/></g>'
      );
    }
    if (cloak === "crimson court") {
      return (
        '<g class="wb-cloak wb-cloak-court"><path d="M111 279q99-60 198 0l46 287-77-45-68 73-68-73-77 45Z" fill="#2b0d17" stroke="' +
        colors.accentLight +
        '" stroke-opacity=".55" stroke-width="5"/>' +
        '<path d="M127 290l28-72 55 63 55-63 28 72-35 29-48-20-48 20Z" fill="#4b1322" stroke="' +
        colors.metalLight +
        '" stroke-width="3"/></g>'
      );
    }
    if (cloak === "grave shroud") {
      return '<g class="wb-cloak wb-cloak-shroud" opacity=".76"><path d="M105 278q105-46 210 0l33 288-48-34-31 57-59-36-58 36-32-57-48 34Z" fill="#373744" stroke="#777889" stroke-width="3" stroke-dasharray="10 8"/></g>';
    }
    if (cloak === "moon veil") {
      return (
        '<g class="wb-cloak wb-cloak-veil" opacity=".68"><path d="M113 276q97-55 194 0l57 286-75-43-27 73-52-57-52 57-27-73-75 43Z" fill="' +
        colors.accentDark +
        '" stroke="' +
        colors.accentLight +
        '" stroke-width="3"/><path d="M91 431q119-74 238 0" fill="none" stroke="#d8e7ff" stroke-opacity=".4" stroke-width="3"/></g>'
      );
    }
    if (cloak === "bone mantle") {
      return (
        '<g class="wb-cloak wb-cloak-bone"><path d="M95 288l55-45 60 38 60-38 55 45-34 39-42-20-39 29-39-29-42 20Z" fill="#4a4038" stroke="#cbbd9e" stroke-width="4"/>' +
        '<path d="M120 268l-30-42 53 20m157 22 30-42-53 20M155 255l-11-53 38 47m83 6 11-53-38 47" fill="none" stroke="#d5c7aa" stroke-width="9"/></g>'
      );
    }
    if (cloak === "eclipse mantle") {
      return (
        '<g class="wb-cloak wb-cloak-eclipse"><path d="M108 278l-44-74 82 45 64-67 64 67 82-45-44 74 36 275-87-42-51 76-51-76-87 42Z" fill="#17131f" stroke="' +
        colors.accentLight +
        '" stroke-opacity=".52" stroke-width="5"/></g>'
      );
    }
    return '<g class="wb-cloak wb-cloak-tattered"><path d="M113 278q97-45 194 0l41 275-54-25-26 57-58-46-58 46-26-57-54 25Z" fill="#25232c" stroke="#55535d" stroke-width="4" stroke-dasharray="16 8"/></g>';
  }

  function hairParts(a, faction, colors) {
    return { back: "", front: "" };
    var style = a.hair;
    var back = "";
    var front = "";
    if (style === "shorn") {
      front =
        '<path d="M151 121q59-38 118 0" fill="none" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-opacity=".45" stroke-width="6"/>';
    } else if (style === "long" || style === "moon mane") {
      back =
        '<path d="M132 123q78-83 156 0l26 170-43-39-22 78-39-57-40 57-22-78-43 39Z" fill="' +
        colors.hairDark +
        '" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-opacity=".48" stroke-width="5"/>';
      front =
        '<path d="M146 127q64-68 128 0l-15 44-23-30-26 17-28-17-23 30Z" fill="' +
        colors.hairDark +
        '"/>';
      if (style === "moon mane")
        front +=
          '<path d="M139 170l-25 68 48-30 48 54 48-54 48 30-25-68" fill="' +
          svgMix(colors.hairLight, colors.hairDark, .45) +
          '" opacity=".44"/>';
    } else if (style === "braided") {
      back =
        '<path d="M139 128q70-72 142 0l-8 91-28-50-68 12-31 40Z" fill="' +
        colors.hairDark +
        '"/>' +
        '<g fill="' +
        colors.hairDark +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="2"><circle cx="276" cy="186" r="14"/><circle cx="282" cy="211" r="13"/><circle cx="278" cy="236" r="12"/><circle cx="284" cy="259" r="10"/></g>';
      front =
        '<path d="M146 125q62-64 125-2l-15 42-31-27-30 17-39 18Z" fill="' +
        colors.hairDark +
        '"/>';
    } else if (style === "crested") {
      front =
        '<path d="M183 124l7-90 20 38 21-53 18 55 31-26-11 84Z" fill="' +
        colors.hairDark +
        '" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-width="4"/>';
    } else if (style === "cropped") {
      front =
        '<path d="M146 126q64-61 128 0l-12 29-25-18-25 13-27-15-26 21Z" fill="' +
        colors.hairDark +
        '"/>';
    } else if (style === "ritual knots") {
      front =
        '<path d="M148 127q62-61 124 0l-8 32-27-20-27 16-27-16-27 20Z" fill="' +
        colors.hairDark +
        '"/>' +
        '<g fill="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="2"><circle cx="155" cy="113" r="12"/><circle cx="182" cy="89" r="12"/><circle cx="213" cy="82" r="12"/><circle cx="244" cy="90" r="12"/><circle cx="270" cy="114" r="12"/></g>';
    } else if (style === "swept") {
      front =
        '<path d="M143 134q60-80 140-24l-24 8 27 14-51 5-31 27-46 10Z" fill="' +
        colors.hairDark +
        '" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-opacity=".4" stroke-width="4"/>';
    } else {
      back =
        faction === "moonborn"
          ? '<path d="M137 132l-25-42 43 11-3-50 37 31 21-55 22 55 38-31-4 50 44-11-26 42Z" fill="' +
            colors.hairDark +
            '" stroke="' +
            svgMix(colors.hairLight, colors.hairDark, .45) +
            '" stroke-width="4"/>'
          : "";
      front =
        '<path d="M143 132l17-46 18 15 20-38 22 33 32-39 2 42 36-12-21 61-33-14-27 22-30-18-29 20Z" fill="' +
        colors.hairDark +
        '"/>';
    }
    return { back: back, front: front };
  }

  function accessoryBack(a, colors) {
    if (a.accessory === "chain halo") {
      return '<g class="wb-accessory-back"><circle cx="210" cy="165" r="96" fill="none" stroke="'+colors.metalLight+'" stroke-width="5" stroke-dasharray="4 12" opacity=".97"/><circle cx="210" cy="165" r="78" fill="none" stroke="'+colors.accentLight+'" stroke-width="2" opacity=".56"/><circle cx="210" cy="66" r="8" fill="'+colors.accentLight+'" stroke="'+colors.metalLight+'" stroke-width="2"/></g>';
    }
    if (a.accessory === "raven feather") {
      return '<g class="wb-accessory-back" transform="rotate(-18 270 116)"><path d="M269 134q41-83 68-77-5 47-59 91Z" fill="#14141c" stroke="#686273" stroke-width="3"/><path d="M276 144l43-73" stroke="#a196a7" stroke-width="3"/><path d="M287 113l25-24m-8 37 21-15" stroke="#7e8796" stroke-width="2" opacity=".7"/></g>';
    }
    return "";
  }

  function faceAndHead(a, faction, colors, ids) {
    var moon = faction === "moonborn";
    var head = "";
    if (moon) {
      head +=
        '<path d="M151 129L119 49l59 43m91 37 32-80-59 43" fill="' +
        colors.skin +
        '" stroke="' +
        colors.skinShadow +
        '" stroke-width="6"/>';
      head +=
        '<path d="M158 119l-22-43 35 25m91 18 22-43-35 25" fill="' +
        colors.accentDark +
        '" opacity=".55"/>';
      head +=
        '<path d="M145 115q65-55 130 0l14 75q-12 88-79 92-67-4-79-92Z" fill="url(#' +
        ids.skin +
        ')" stroke="' +
        colors.skinShadow +
        '" stroke-width="6"/>';
      head +=
        '<path d="M163 191q47-22 94 0l14 48q-61 72-122 0Z" fill="' +
        colors.skinLight +
        '" opacity=".58" stroke="' +
        colors.skinShadow +
        '" stroke-width="4"/>';
      head += '<path d="M194 207q16-12 32 0l-16 15Z" fill="#15141a"/>';
      head +=
        '<path d="M174 240l15 24 21-17 21 17 15-24-4 35h-64Z" fill="#e9dfca"/>';
      head +=
        '<path d="M150 183q28-19 49 0m22 0q22-19 49 0" fill="none" stroke="' +
        colors.skinShadow +
        '" stroke-width="7"/>';
    } else {
      head +=
        '<path d="M148 153l-26 23 32 10m118-33 26 23-32 10" fill="' +
        colors.skin +
        '" stroke="' +
        colors.skinShadow +
        '" stroke-width="4"/>';
      head +=
        '<path d="M148 111q62-45 124 0l9 82q-14 77-71 82-57-5-71-82Z" fill="url(#' +
        ids.skin +
        ')" stroke="' +
        colors.skinShadow +
        '" stroke-width="5"/>';
      head +=
        '<path d="M162 185q24-17 43 0m10 0q21-17 44 0" fill="none" stroke="' +
        colors.skinShadow +
        '" stroke-width="6"/>';
      head +=
        '<path d="M205 190l-7 35 18 2" fill="none" stroke="' +
        colors.skinShadow +
        '" stroke-width="4"/>';
      head += '<path d="M181 240q29 17 58 0-29 35-58 0Z" fill="#51222d"/>';
      head += '<path d="M188 244l8 22 8-19m28-3-8 22-8-19" fill="#f3e8dc"/>';
    }
    var glowOpacity =
      { dormant: 0.25, gleaming: 0.65, radiant: 0.9, eclipse: 1 }[a.eyeGlow] ||
      0.65;
    var eyeRadius =
      a.eyeGlow === "eclipse" ? 11 : a.eyeGlow === "radiant" ? 8 : 6;
    head +=
      '<g class="wb-eyes" opacity="' +
      glowOpacity +
      '" filter="url(#' +
      ids.eyeGlow +
      ')"><ellipse cx="180" cy="190" rx="' +
      eyeRadius +
      '" ry="' +
      Math.max(3, eyeRadius - 2) +
      '" fill="' +
      colors.eye +
      '"/><ellipse cx="240" cy="190" rx="' +
      eyeRadius +
      '" ry="' +
      Math.max(3, eyeRadius - 2) +
      '" fill="' +
      colors.eye +
      '"/></g>';
    if (a.eyeGlow === "eclipse") {
      head +=
        '<circle cx="180" cy="190" r="18" fill="none" stroke="' +
        colors.eye +
        '" stroke-opacity=".44" stroke-width="2"/><circle cx="240" cy="190" r="18" fill="none" stroke="' +
        colors.eye +
        '" stroke-opacity=".44" stroke-width="2"/>';
    }
    return head;
  }

  function headLinework(colors) {
    return (
      '<path d="M157 171l39-12m67 12-39-12" fill="none" stroke="' +
      colors.skinShadow +
      '" stroke-width="6"/>'
    );
  }

  function markingLayer(a, colors) {
    var mark = a.marking;
    if (mark === "none") return "";
    if (mark === "moon sigil") {
      return (
        '<path d="M210 137q-18 13-7 33 10 17 29 8-12 19-34 6-27-16-12-45 8-15 24-20Z" fill="' +
        colors.accentLight +
        '" opacity=".97"/>'
      );
    }
    if (mark === "blood sigil") {
      return (
        '<path d="M210 113c-9 15-16 25-16 35 0 11 7 19 16 19s16-8 16-19c0-10-7-20-16-35Zm0 23c5 6 8 10 8 14a8 8 0 0 1-16 0c0-4 3-8 8-14Z" fill="' +
        colors.accentLight +
        '" opacity=".58"/>'
      );
    }
    if (mark === "ritual runes") {
      return (
        '<g fill="none" stroke="' +
        colors.accentLight +
        '" stroke-width="3" opacity=".72"><path d="M171 146l12 13-15 13 14 12M249 146l-12 13 15 13-14 12M199 117l11 14 11-14"/></g>'
      );
    }
    if (mark === "claw marks") {
      return '<path d="M166 139l19 73m-1-78 17 70m-1-78 16 69" stroke="#74283a" stroke-width="5" stroke-linecap="round" opacity=".8"/>';
    }
    if (mark === "eclipse cracks") {
      return (
        '<g fill="none" stroke="' +
        colors.eye +
        '" stroke-width="3" opacity=".6"><path d="M211 121l-8 26 14 17-11 29 16 22-10 34"/><path d="M203 147l-20 7m34 10 19-8m-30 37-19 12m35 10 18 10"/></g>'
      );
    }
    if (mark === "war paint") {
      return (
        '<path d="M150 169l53 11-10 21-47-13m124-19-53 11 10 21 47-13" fill="' +
        colors.accentDark +
        '" opacity=".97"/>'
      );
    }
    if (mark === "silver brands") {
      return (
        '<g fill="none" stroke="' +
        colors.metalLight +
        '" stroke-width="4" opacity=".76"><circle cx="176" cy="155" r="12"/><path d="M176 143v24m-12-12h24"/><circle cx="244" cy="155" r="12"/></g>'
      );
    }
    return (
      '<g fill="' +
      colors.eye +
      '" opacity=".72"><circle cx="171" cy="144" r="3"/><circle cx="188" cy="157" r="2"/><circle cx="210" cy="131" r="3"/><circle cx="232" cy="157" r="2"/><circle cx="249" cy="144" r="3"/></g>'
    );
  }

  var characterProfile = {
    "shoulder": 76,
    "chest": 66,
    "waist": 39,
    "hip": 49,
    "bottom": 46,
    "shoulderY": 287,
    "chestY": 336,
    "waistY": 398,
    "hipY": 440,
    "bottomY": 462,
    "neck": 30,
    "upperArm": 25,
    "forearm": 19,
    "hand": 11,
    "legCenter": 32,
    "thigh": 31,
    "knee": 22,
    "calf": 18,
    "foot": 30,
    "legTopY": 452,
    "kneeY": 529,
    "ankleY": 583,
    "footY": 615,
    "torso": {
      "base": "M134 288 C150 267 179 263 210 271 C241 263 270 267 286 288 C281 318 270 343 258 363 C247 381 247 403 259 430 C265 446 257 458 246 464 Q210 475 174 464 C163 458 155 446 161 430 C173 403 173 381 162 363 C150 343 139 318 134 288 Z",
      "noble": "M134 288 C150 267 179 263 210 271 C241 263 270 267 286 288 C281 321 268 351 257 379 C249 402 263 444 275 497 Q210 518 145 497 C157 444 171 402 163 379 C152 351 139 321 134 288 Z",
      "blood": "M134 288 C150 267 179 263 210 271 C241 263 270 267 286 288 C281 325 267 358 256 389 C250 418 269 461 282 518 Q210 540 138 518 C151 461 170 418 164 389 C153 358 139 325 134 288 Z",
      "robe": "M134 288 C150 267 179 263 210 271 C241 263 270 267 286 288 C281 330 266 367 255 402 L292 538 Q210 565 128 538 L165 402 C154 367 139 330 134 288 Z"
    },
    "neckPath": "M180 250 L175 286 Q210 309 245 286 L240 250 Z",
    "legs": {
      "left": "M147 450 C145 480 151 506 158 530 C164 551 156 578 148 615 L193 615 C197 584 201 556 199 530 C196 498 201 473 207 453 Z",
      "right": "M273 450 C275 480 269 506 262 530 C256 551 264 578 272 615 L227 615 C223 584 219 556 221 530 C224 498 219 473 213 453 Z"
    },
    "feet": {
      "left": "M155 579 L146 615 L196 615 L192 579 Z",
      "right": "M265 579 L274 615 L224 615 L228 579 Z"
    },
    "arms": {
      "left": "M136 302 C113 328 91.75 345 99.32 370 C98.18 400 94 440 94 470 Q105 481 116 471 C112.7 443 122.5 378 121.55 364 C152 360 159 336 159 324 Z",
      "right": "M284 302 C307 328 328.25 345 320.68 370 C321.82 400 326 440 326 470 Q315 481 304 471 C307.3 443 297.5 378 298.45 364 C268 360 261 336 261 324 Z"
    },
    "hands": {
      "left": {
        "x": 105,
        "y": 470,
        "angle": -8
      },
      "right": {
        "x": 315,
        "y": 470,
        "angle": 8
      }
    }
  };


  function torsoPath(p, extension) {
    var extra = Number(extension || 0);
    if (extra >= 60) return p.torso.robe;
    if (extra >= 45) return p.torso.blood;
    if (extra >= 30) return p.torso.noble;
    return p.torso.base;
  }

  function neckLayer(p, colors, ids) {
    return (
      '<path class="wb-neck" d="' +
      p.neckPath +
      '" fill="url(#' +
      ids.skin +
      ')" stroke="' +
      colors.skinShadow +
      '" stroke-width="4"/>'
    );
  }

  function handPosition(p, side) {
    return p.hands[side];
  }

  function armPath(p, side) {
    return p.arms[side];
  }

  function legPath(p, side) {
    return p.legs[side];
  }

  function footOverlay(p, side) {
    return p.feet[side];
  }
  function bodyBase(a, faction, colors, p) {
    var moon = faction === "moonborn";
    var legFill = moon ? colors.skinShadow : "#24232d";
    var legStroke = moon ? colors.skinShadow : "#494752";
    var legs =
      '<g class="wb-legs wb-anatomy-legs"><path d="' +
      legPath(p, "left") +
      '" fill="' +
      legFill +
      '" stroke="' +
      legStroke +
      '" stroke-width="5"/><path d="' +
      legPath(p, "right") +
      '" fill="' +
      legFill +
      '" stroke="' +
      legStroke +
      '" stroke-width="5"/>' +
      (moon
        ? '<path d="' +
          footOverlay(p, "left") +
          '" fill="' +
          colors.skin +
          '" stroke="' +
          colors.skinShadow +
          '" stroke-width="4"/><path d="' +
          footOverlay(p, "right") +
          '" fill="' +
          colors.skin +
          '" stroke="' +
          colors.skinShadow +
          '" stroke-width="4"/>'
        : "") +
      "</g>";
    var tail = moon
      ? '<path class="wb-tail" d="M' +
        (210 - p.hip + 4) +
        " " +
        (p.hipY + 5) +
        " Q" +
        Math.max(35, 108 - p.hip) +
        " " +
        (p.hipY - 30) +
        " " +
        Math.max(47, 93 - p.hip * 0.45) +
        ' 510 q5 55 69 35-43-12-28-52 12-34 61-19" fill="' +
        colors.skin +
        '" stroke="' +
        colors.skinShadow +
        '" stroke-width="7"/>'
      : "";
    return tail + legs;
  }

  function outfitLayer(a, faction, colors, ids, p) {
    var outfit = a.outfit;
    if (faction === "moonborn") {
      var waistL = 210 - p.waist;
      var waistR = 210 + p.waist;
      var beltY = p.waistY + 16;
      var bottomY = p.bottomY;
      return '<g class="wb-outfit wb-outfit-pants-only"><path d="M'+waistL+' '+(beltY-10)+' H'+waistR+' L'+(waistR-8)+' '+(bottomY+12)+' L210 '+(bottomY-3)+' L'+(waistL+8)+' '+(bottomY+12)+' Z" fill="#171d29" stroke="#303a4b" stroke-width="4"/><path d="M'+(waistL-5)+' '+beltY+' H'+(waistR+5)+'" stroke="#6e7886" stroke-width="9"/><rect x="198" y="'+(beltY-8)+'" width="24" height="16" rx="2" fill="#8d98a7" stroke="#d1d8e0" stroke-width="2"/></g>';
    }
    var outer = torsoPath(p, 0);
    var robe = torsoPath(p, 68);
    var shoulderL = 210 - p.shoulder;
    var shoulderR = 210 + p.shoulder;
    var chestL = 210 - p.chest;
    var chestR = 210 + p.chest;
    var waistL = 210 - p.waist;
    var waistR = 210 + p.waist;
    var beltY = p.waistY + 16;
    var bottomY = p.bottomY;
    var base =
      '<path d="' +
      outer +
      '" fill="url(#' +
      ids.cloth +
      ')" stroke="' +
      colors.accentLight +
      '" stroke-width="4"/>';

    if (outfit === "warplate") {
      return (
        '<g class="wb-outfit"><path d="' +
        outer +
        '" fill="' +
        colors.metalDark +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="6"/><path d="M' +
        (210 - Math.round(p.chest * 0.72)) +
        " " +
        (p.shoulderY + 17) +
        " L210 " +
        (p.shoulderY + 61) +
        " L" +
        (210 + Math.round(p.chest * 0.72)) +
        " " +
        (p.shoulderY + 17) +
        " L" +
        (210 + Math.round(p.waist * 0.78)) +
        " " +
        (beltY - 23) +
        " H" +
        (210 - Math.round(p.waist * 0.78)) +
        'Z" fill="' +
        colors.metalMid +
        '" stroke="' +
        colors.accentLight +
        '" stroke-width="3"/><path d="M' +
        waistL +
        " " +
        beltY +
        " H" +
        waistR +
        " M" +
        (waistL + 7) +
        " " +
        (beltY + 34) +
        " H" +
        (waistR - 7) +
        '" stroke="' +
        colors.metalLight +
        '" stroke-opacity=".58" stroke-width="5"/></g>'
      );
    }
    if (outfit === "hunter") {
      return (
        '<g class="wb-outfit">' +
        base +
        '<path d="M' +
        (shoulderL + 11) +
        " " +
        (p.shoulderY + 15) +
        " L210 " +
        (p.waistY - 12) +
        " L" +
        (shoulderR - 11) +
        " " +
        (p.shoulderY + 15) +
        '" fill="none" stroke="#7d5a3e" stroke-width="13"/><path d="M' +
        (waistL - 9) +
        " " +
        beltY +
        " H" +
        (waistR + 9) +
        '" stroke="#30251f" stroke-width="13"/><circle cx="210" cy="' +
        beltY +
        '" r="13" fill="' +
        colors.metalMid +
        '"/></g>'
      );
    }
    if (outfit === "ritualist") {
      return (
        '<g class="wb-outfit"><path d="' +
        robe +
        '" fill="' +
        colors.accentDark +
        '" stroke="' +
        colors.accentLight +
        '" stroke-width="4"/><path d="M210 ' +
        (p.shoulderY + 22) +
        " V" +
        (p.bottomY + 54) +
        " M" +
        (210 - Math.round(p.waist * 0.75)) +
        " " +
        (p.waistY - 38) +
        " L210 " +
        (p.waistY - 64) +
        " L" +
        (210 + Math.round(p.waist * 0.75)) +
        " " +
        (p.waistY - 38) +
        " L210 " +
        (p.waistY - 12) +
        'Z" fill="none" stroke="' +
        colors.metalLight +
        '" stroke-width="4"/><circle cx="210" cy="' +
        (beltY + 18) +
        '" r="27" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-width="4" stroke-dasharray="7 6"/></g>'
      );
    }
    if (outfit === "noble") {
      return (
        '<g class="wb-outfit"><path d="' +
        torsoPath(p, 38) +
        '" fill="#25151e" stroke="' +
        colors.accentLight +
        '" stroke-width="5"/><path d="M' +
        (shoulderL + 15) +
        " " +
        (p.shoulderY + 13) +
        " L210 " +
        (p.waistY - 18) +
        " L" +
        (shoulderR - 15) +
        " " +
        (p.shoulderY + 13) +
        " L" +
        (210 + Math.round(p.waist * 0.62)) +
        " " +
        (bottomY + 21) +
        " L210 " +
        (bottomY + 45) +
        " L" +
        (210 - Math.round(p.waist * 0.62)) +
        " " +
        (bottomY + 21) +
        'Z" fill="' +
        colors.accentDark +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="3"/><path d="M' +
        (waistL - 5) +
        " " +
        beltY +
        " Q210 " +
        (beltY + 25) +
        " " +
        (waistR + 5) +
        " " +
        beltY +
        '" fill="none" stroke="' +
        colors.metalLight +
        '" stroke-opacity=".42" stroke-width="3"/></g>'
      );
    }
    if (outfit === "warden") {
      return (
        '<g class="wb-outfit"><path d="' +
        outer +
        '" fill="' +
        colors.metalDark +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="6"/><path d="M' +
        shoulderL +
        " " +
        (p.shoulderY + 11) +
        " Q" +
        (shoulderL - 22) +
        " " +
        (p.shoulderY + 38) +
        " " +
        chestL +
        " " +
        (p.chestY + 24) +
        " L210 " +
        (p.shoulderY + 50) +
        " L" +
        chestR +
        " " +
        (p.chestY + 24) +
        " Q" +
        (shoulderR + 22) +
        " " +
        (p.shoulderY + 38) +
        " " +
        shoulderR +
        " " +
        (p.shoulderY + 11) +
        '" fill="' +
        colors.metalMid +
        '" stroke="' +
        colors.accentLight +
        '" stroke-width="4"/><path d="M' +
        waistL +
        " " +
        (beltY - 12) +
        " H" +
        waistR +
        " V" +
        (bottomY - 3) +
        " H" +
        waistL +
        'Z" fill="url(#' +
        ids.chain +
        ')" opacity=".8"/></g>'
      );
    }
    if (outfit === "bloodweave") {
      return (
        '<g class="wb-outfit"><path d="' +
        torsoPath(p, 48) +
        '" fill="#4a1020" stroke="#b83a4e" stroke-width="5"/><path d="M' +
        (chestL + 9) +
        " " +
        (p.shoulderY + 24) +
        " Q210 " +
        (p.chestY + 24) +
        " " +
        (chestR - 9) +
        " " +
        (p.shoulderY + 24) +
        " Q" +
        (210 + p.waist) +
        " " +
        (p.waistY + 2) +
        " 210 " +
        (p.bottomY + 31) +
        " Q" +
        (210 - p.waist) +
        " " +
        (p.waistY + 2) +
        " " +
        (chestL + 9) +
        " " +
        (p.shoulderY + 24) +
        'Z" fill="#72172c" opacity=".8"/><path d="M' +
        waistL +
        " " +
        (beltY + 29) +
        " Q210 " +
        (beltY - 12) +
        " " +
        waistR +
        " " +
        (beltY + 29) +
        '" fill="none" stroke="#e36b78" stroke-opacity=".5" stroke-width="4"/></g>'
      );
    }
    if (outfit === "moonhide") {
      return (
        '<g class="wb-outfit"><path d="' +
        outer +
        '" fill="#3b3635" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-width="7"/><path d="M' +
        shoulderL +
        " " +
        (p.shoulderY + 14) +
        " L" +
        (shoulderL + Math.round(p.shoulder * 0.35)) +
        " " +
        (p.shoulderY - 23) +
        " L210 " +
        (p.shoulderY + 23) +
        " L" +
        (shoulderR - Math.round(p.shoulder * 0.35)) +
        " " +
        (p.shoulderY - 23) +
        " L" +
        shoulderR +
        " " +
        (p.shoulderY + 14) +
        " L" +
        (210 + Math.round(p.chest * 0.52)) +
        " " +
        (p.chestY + 12) +
        " L210 " +
        (p.chestY - 2) +
        " L" +
        (210 - Math.round(p.chest * 0.52)) +
        " " +
        (p.chestY + 12) +
        'Z" fill="' +
        colors.hairDark +
        '" stroke="' +
        svgMix(colors.hairLight, colors.hairDark, .45) +
        '" stroke-width="4"/><path d="M' +
        waistL +
        " " +
        (beltY - 4) +
        " L210 " +
        (bottomY - 4) +
        " L" +
        waistR +
        " " +
        (beltY - 4) +
        '" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-width="6"/></g>'
      );
    }
    if (outfit === "silver reliquary") {
      return (
        '<g class="wb-outfit"><path d="' +
        outer +
        '" fill="' +
        colors.metalDark +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="6"/><path d="M' +
        (210 - Math.round(p.chest * 0.62)) +
        " " +
        (p.shoulderY + 19) +
        " L210 " +
        (p.shoulderY + 48) +
        " L" +
        (210 + Math.round(p.chest * 0.62)) +
        " " +
        (p.shoulderY + 19) +
        " L" +
        (210 + Math.round(p.waist * 0.68)) +
        " " +
        (bottomY - 9) +
        " L210 " +
        (bottomY + 17) +
        " L" +
        (210 - Math.round(p.waist * 0.68)) +
        " " +
        (bottomY - 9) +
        'Z" fill="' +
        colors.metalMid +
        '"/><circle cx="210" cy="' +
        (beltY - 2) +
        '" r="' +
        Math.max(26, Math.round(p.waist * 0.66)) +
        '" fill="none" stroke="' +
        colors.accentLight +
        '" stroke-width="5"/><path d="M210 ' +
        (beltY - 37) +
        " V" +
        (beltY + 33) +
        " M" +
        (210 - Math.round(p.waist * 0.65)) +
        " " +
        (beltY - 2) +
        " H" +
        (210 + Math.round(p.waist * 0.65)) +
        '" stroke="' +
        colors.metalLight +
        '" stroke-width="4"/></g>'
      );
    }
    if (outfit === "night corsair") {
      return (
        '<g class="wb-outfit">' +
        base +
        '<path d="M' +
        (shoulderL + 11) +
        " " +
        (p.shoulderY + 15) +
        " L210 " +
        (p.chestY + 32) +
        " L" +
        (shoulderR - 6) +
        " " +
        (p.shoulderY + 9) +
        " L" +
        (210 + Math.round(p.chest * 0.58)) +
        " " +
        (p.chestY + 49) +
        " L210 " +
        (p.chestY + 69) +
        " L" +
        (210 - Math.round(p.chest * 0.56)) +
        " " +
        (p.chestY + 49) +
        'Z" fill="#191922" stroke="' +
        colors.metalLight +
        '" stroke-width="4"/><path d="M' +
        (waistL - 8) +
        " " +
        beltY +
        " H" +
        (waistR + 8) +
        '" stroke="#6d4634" stroke-width="15"/><circle cx="' +
        (waistR - 4) +
        '" cy="' +
        beltY +
        '" r="16" fill="' +
        colors.metalMid +
        '"/></g>'
      );
    }
    return (
      '<g class="wb-outfit">' +
      base +
      '<path d="M' +
      (shoulderL + 12) +
      " " +
      (p.shoulderY + 18) +
      " L210 " +
      (p.waistY - 12) +
      " L" +
      (shoulderR - 12) +
      " " +
      (p.shoulderY + 18) +
      " M" +
      (waistL - 7) +
      " " +
      beltY +
      " H" +
      (waistR + 7) +
      '" fill="none" stroke="#6e5341" stroke-width="9"/><path d="M' +
      (210 - Math.round(p.waist * 0.62)) +
      " " +
      (p.shoulderY + 14) +
      " V" +
      (bottomY + 2) +
      " M" +
      (210 + Math.round(p.waist * 0.62)) +
      " " +
      (p.shoulderY + 14) +
      " V" +
      (bottomY + 2) +
      '" stroke="#201d22" stroke-opacity=".65" stroke-width="5"/></g>'
    );
  }

  function armLayer(colors, p) {
    var left = armPath(p, "left");
    var right = armPath(p, "right");
    return (
      '<g class="wb-arms wb-anatomy-arms"><path d="' +
      left +
      '" fill="' +
      colors.skin +
      '" stroke="' +
      colors.skinShadow +
      '" stroke-width="6"/><path d="' +
      right +
      '" fill="' +
      colors.skin +
      '" stroke="' +
      colors.skinShadow +
      '" stroke-width="6"/></g>'
    );
  }


  function accessoryFront(a, colors) {
    var acc = a.accessory;
    if (acc === "none" || acc === "chain halo" || acc === "raven feather")
      return "";
    if (acc === "moonstone torque") {
      return '<g class="wb-accessory-front"><path d="M166 281q44 45 88 0" fill="none" stroke="'+colors.metalLight+'" stroke-width="8"/><path d="M176 292q34 18 68 0" fill="none" stroke="'+colors.metalMid+'" stroke-width="3" opacity=".75"/><path d="M210 318l-18 18 18 26 18-26Z" fill="#a8c9ff" stroke="'+colors.metalLight+'" stroke-width="3"/></g>';
    }
    if (acc === "bone charms") {
      return '<g class="wb-accessory-front"><path d="M164 283q46 42 92 0" fill="none" stroke="#7b6751" stroke-width="6"/><path d="M176 300l-9 23 12 12 14-29m17 10-4 27 14 8 14-8-4-27m27-16 9 23-12 12-14-29" fill="#d8c8a9" stroke="#635548" stroke-width="3"/></g>';
    }
    if (acc === "silver ear cuffs") {
      return '<g class="wb-accessory-front" fill="none" stroke="'+colors.metalLight+'" stroke-width="6"><path d="M139 169q-21 18-6 42m148-42q21 18 6 42"/><circle cx="136" cy="207" r="7"/><circle cx="284" cy="207" r="7"/><path d="M129 188q7 4 14 0m133 0q7 4 14 0" stroke-width="3" opacity=".78"/></g>';
    }
    if (acc === "blood crystal earrings") {
      return '<g class="wb-accessory-front"><path d="M139 192v35m142-35v35" stroke="'+colors.metalLight+'" stroke-width="3"/><path d="M139 225l-11 18 11 18 11-18Zm142 0-11 18 11 18 11-18Z" fill="#c52d4b" stroke="#ff9bad" stroke-width="3"/><path d="M133 241h12m130 0h12" stroke="#ffd0d8" stroke-width="2" opacity=".5"/></g>';
    }
    if (acc === "ritual veil") {
      return '<g class="wb-accessory-front" opacity=".9"><path d="M147 200q63 38 126 0l-13 71-50 29-50-29Z" fill="'+colors.accentDark+'" fill-opacity=".28" stroke="'+colors.accentLight+'" stroke-width="3"/><path d="M165 228h90m-81 22h72m-63 20h54" stroke="'+colors.metalLight+'" stroke-opacity=".45" stroke-width="2"/></g>';
    }
    if (acc === "trophy fangs") {
      return '<g class="wb-accessory-front"><path d="M159 285q51 43 102 0" fill="none" stroke="#6d513d" stroke-width="7"/><path d="M177 302l8 26 12 14 12-34m42-6-8 26-12 14-12-34" fill="#e6d6b8" stroke="#68594b" stroke-width="3"/></g>';
    }
    if (acc === "reliquary brooch") {
      return '<g class="wb-accessory-front"><circle cx="210" cy="326" r="24" fill="'+colors.metalDark+'" stroke="'+colors.metalLight+'" stroke-width="5"/><circle cx="210" cy="326" r="12" fill="'+colors.accentLight+'" opacity=".35"/><path d="M210 309v34m-17-17h34" stroke="'+colors.accentLight+'" stroke-width="4"/></g>';
    }
    if (acc === "thorn crown") {
      return '<g class="wb-accessory-front"><path d="M150 129l18-38 18 28 24-49 24 49 18-28 18 38" fill="none" stroke="#6d5042" stroke-width="9"/><path d="M168 95l-14-11m48 1-8-18m58 28 14-11m-104 38 10-17m38-23 8 17m38 23-10-17" stroke="#a87060" stroke-width="5" stroke-linecap="round"/></g>';
    }
    return "";
  }

  function headEquipment(item, colors) {
    if (!item) return "";
    var name = lower(item.name);
    var rare = equipmentTone(item, colors);
    var palette = equipmentPalette(item, colors);
    if (name.indexOf("crown") >= 0 || name.indexOf("coroa") >= 0) {
      return (
        '<g class="wb-equipped wb-head"><path d="M145 132l13-67 36 38 17-67 19 67 34-38 12 67Z" fill="' +
        palette.dark +
        '" stroke="' +
        rare +
        '" stroke-width="6"/><circle cx="211" cy="81" r="9" fill="' +
        palette.gem +
        '"/></g>'
      );
    }
    if (name.indexOf("hood") >= 0 || name.indexOf("capuz") >= 0) {
      return (
        '<g class="wb-equipped wb-head"><path d="M128 174q7-105 82-116 75 11 82 116l-27 19q-5-85-55-92-50 7-55 92Z" fill="' +
        palette.dark +
        '" stroke="' +
        rare +
        '" stroke-width="5"/></g>'
      );
    }
    if (name.indexOf("mask") >= 0 || name.indexOf("visor") >= 0 || name.indexOf("máscara") >= 0) {
      return (
        '<g class="wb-equipped wb-head"><path d="M146 165q64-42 128 0l-9 76-55 30-55-30Z" fill="' +
        palette.dark +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M166 190h35m18 0h35" stroke="' +
        palette.light +
        '" stroke-width="8"/></g>'
      );
    }
    return (
      '<g class="wb-equipped wb-head"><path d="M137 167q6-100 73-110 67 10 73 110l-20-15-8-41-45-28-45 28-8 41Z" fill="' +
      palette.dark +
      '" stroke="' +
      rare +
      '" stroke-width="6"/><path d="M210 58v59" stroke="' +
      palette.light +
      '" stroke-width="5"/></g>'
    );
  }

  function armorEquipment(equipment, colors, p) {
    var item = equipment && equipment.chest;
    if (!item) return "";
    p = p || characterProfile;
    var rare = equipmentTone(item, colors);
    var palette = equipmentPalette(item, colors);
    var outer = torsoPath(p, -3);
    var chestHalf = Math.round(p.chest * 0.7);
    var waistHalf = Math.round(p.waist * 0.78);
    return (
      '<g class="wb-equipped wb-chest"><path d="' +
      outer +
      '" fill="' +
      palette.dark +
      '" fill-opacity=".96" stroke="' +
      rare +
      '" stroke-width="6"/><path d="M' +
      (210 - chestHalf) +
      " " +
      (p.shoulderY + 18) +
      " L210 " +
      (p.shoulderY + 58) +
      " L" +
      (210 + chestHalf) +
      " " +
      (p.shoulderY + 18) +
      " L" +
      (210 + waistHalf) +
      " " +
      (p.waistY - 4) +
      " L210 " +
      (p.waistY + 18) +
      " L" +
      (210 - waistHalf) +
      " " +
      (p.waistY - 4) +
      'Z" fill="' +
      palette.mid +
      '" stroke="' +
      palette.light +
      '" stroke-width="3"/><path d="M210 ' +
      (p.shoulderY + 56) +
      " V" +
      (p.bottomY - 1) +
      " M" +
      (210 - p.waist) +
      " " +
      (p.waistY + 14) +
      " H" +
      (210 + p.waist) +
      '" stroke="' +
      palette.light +
      '" stroke-opacity=".58" stroke-width="4"/></g>'
    );
  }

  function limbEquipment(equipment, colors, p) {
    if (!equipment) return "";
    p = p || characterProfile;
    var out = "";
    if (equipment.hands) {
      var handRare = equipmentTone(equipment.hands, colors);
      var handPalette = equipmentPalette(equipment.hands, colors);
      ["left", "right"].forEach(function (side) {
        var hand = handPosition(p, side);
        var width = p.hand * 2 + 15;
        out +=
          '<g class="wb-equipped wb-hands" transform="translate(' +
          hand.x +
          " " +
          (hand.y - 5) +
          ") rotate(" +
          hand.angle +
          ')"><path d="M' +
          -Math.round(width * 0.46) +
          ' -30 Q0 -39 ' +
          Math.round(width * 0.46) +
          " -30 L" +
          Math.round(width * 0.56) +
          " 18 Q0 31 " +
          -Math.round(width * 0.56) +
          ' 18Z" fill="' +
          handPalette.dark +
          '" stroke="' +
          handRare +
          '" stroke-width="5"/><path d="M' +
          -Math.round(width * 0.36) +
          " -7 H" +
          Math.round(width * 0.36) +
          '" stroke="' +
          handPalette.light +
          '" stroke-opacity=".7" stroke-width="3"/></g>';
      });
    }
    if (equipment.legs) {
      var legRare = equipmentTone(equipment.legs, colors);
      var legPalette = equipmentPalette(equipment.legs, colors);
      out +=
        '<g class="wb-equipped wb-legs"><path d="' +
        legPath(p, "left") +
        '" fill="' +
        legPalette.dark +
        '" fill-opacity=".95" stroke="' +
        legRare +
        '" stroke-width="5"/><path d="' +
        legPath(p, "right") +
        '" fill="' +
        legPalette.dark +
        '" fill-opacity=".95" stroke="' +
        legRare +
        '" stroke-width="5"/></g>';
    }
    if (equipment.feet) {
      var footRare = equipmentTone(equipment.feet, colors);
      var footPalette = equipmentPalette(equipment.feet, colors);
      out +=
        '<g class="wb-equipped wb-feet"><path d="' +
        footOverlay(p, "left") +
        '" fill="' +
        footPalette.dark +
        '" stroke="' +
        footRare +
        '" stroke-width="5"/><path d="' +
        footOverlay(p, "right") +
        '" fill="' +
        footPalette.dark +
        '" stroke="' +
        footRare +
        '" stroke-width="5"/></g>';
    }
    return out;
  }

  function jewelryEquipment(equipment, colors, p) {
    if (!equipment) return "";
    p = p || characterProfile;
    var out = "";
    if (equipment.amulet) {
      var amuletRare = equipmentTone(equipment.amulet, colors);
      var amuletPalette = equipmentPalette(equipment.amulet, colors);
      out +=
        '<g class="wb-equipped wb-amulet"><path d="M' +
        (210 - p.neck - 8) +
        " " +
        (p.shoulderY + 2) +
        " Q210 " +
        (p.shoulderY + 68) +
        " " +
        (210 + p.neck + 8) +
        " " +
        (p.shoulderY + 2) +
        '" fill="none" stroke="' +
        amuletPalette.light +
        '" stroke-width="5"/><path d="M210 ' +
        (p.shoulderY + 51) +
        " l-14 20 14 22 14-22Z" +
        '" fill="' +
        amuletPalette.gem +
        '" stroke="#eee7dc" stroke-width="3"/></g>';
    }
    if (equipment.relic) {
      var relicRare = equipmentTone(equipment.relic, colors);
      var relicPalette = equipmentPalette(equipment.relic, colors);
      out +=
        '<g class="wb-equipped wb-relic"><circle cx="210" cy="' +
        (p.waistY + 18) +
        '" r="27" fill="' +
        relicPalette.dark +
        '" stroke="' +
        relicRare +
        '" stroke-width="6"/><path d="M210 ' +
        (p.waistY - 2) +
        " l14 20-14 20-14-20Z" +
        '" fill="' +
        relicPalette.gem +
        '"/></g>';
    }
    if (equipment.ring1) {
      var leftHand = handPosition(p, "left");
      var ring1Palette = equipmentPalette(equipment.ring1, colors);
      out +=
        '<circle class="wb-equipped wb-ring" cx="' +
        leftHand.x +
        '" cy="' +
        leftHand.y +
        '" r="' +
        (p.hand + 4) +
        '" fill="none" stroke="' +
        ring1Palette.edge +
        '" stroke-width="5"/>';
    }
    if (equipment.ring2) {
      var rightHand = handPosition(p, "right");
      var ring2Palette = equipmentPalette(equipment.ring2, colors);
      out +=
        '<circle class="wb-equipped wb-ring" cx="' +
        rightHand.x +
        '" cy="' +
        rightHand.y +
        '" r="' +
        (p.hand + 4) +
        '" fill="none" stroke="' +
        ring2Palette.edge +
        '" stroke-width="5"/>';
    }
    return out;
  }


  function weaponEquipment(item, side, colors, p) {
    if (!item) return "";
    p = p || characterProfile;
    var palette = equipmentPalette(item, colors);
    var rare = palette.edge;
    var name = lower(item.name);
    var hand = handPosition(p, side);
    var x = hand.x;
    var y = hand.y - 50;
    var rotate = side === "left" ? 18 : -18;
    var flip = side === "left" ? " scale(-1 1)" : "";
    var shape = "";
    if (name.indexOf("pistol") >= 0 || name.indexOf("pistola") >= 0) {
      shape =
        '<path d="M-12-8h58v20H12l-8 43h-22l5-63Z" fill="' +
        palette.dark +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M46-3h31v10H46" fill="' +
        palette.light +
        '"/>';
    } else if (name.indexOf("focus") >= 0 || name.indexOf("foco") >= 0 || name.indexOf("talisman") >= 0 || name.indexOf("talismã") >= 0 || name.indexOf("talisma") >= 0) {
      shape =
        '<circle class="wb-focus-orb" cx="4" cy="-32" r="28" fill="' +
        palette.gem +
        '" opacity=".97"/><circle cx="4" cy="-32" r="14" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4"/><path d="M4-4v114" stroke="' +
        palette.light +
        '" stroke-width="8"/>';
    } else if (name.indexOf("hook") >= 0 || name.indexOf("gancho") >= 0) {
      shape =
        '<path d="M0 112V-30q0-62 47-65 19 0 28 15-45-7-43 36 1 25 22 28" fill="none" stroke="' +
        rare +
        '" stroke-width="17"/><path d="M0 35v80" stroke="#4b3228" stroke-width="11"/>';
    } else if (name.indexOf("claw") >= 0 || name.indexOf("talon") >= 0 || name.indexOf("garra") >= 0) {
      shape =
        '<path d="M-24 25l12-92L0 23 18-99l-2 126 39-110-17 128Z" fill="' +
        palette.light +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M-31 32h77v50h-77Z" fill="' +
        palette.dark +
        '" stroke="' +
        rare +
        '" stroke-width="5"/>';
    } else if (name.indexOf("cleaver") >= 0 || name.indexOf("cutelo") >= 0) {
      shape =
        '<rect x="-7" y="16" width="14" height="112" rx="6" fill="#4d3328"/><path d="M0 24l-38-74 18-91 67 25 8 90Z" fill="' +
        palette.mid +
        '" stroke="' +
        rare +
        '" stroke-width="6"/><path d="M-13-105l41 15" stroke="' +
        palette.light +
        '" stroke-width="4"/>';
    } else if (name.indexOf("dagger") >= 0 || name.indexOf("adaga") >= 0 || name.indexOf("presa") >= 0) {
      shape =
        '<rect x="-6" y="18" width="12" height="85" rx="5" fill="#4b3329"/><path d="M0 21l-24-42L0-102l24 81Z" fill="' +
        palette.light +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M-28 17h56" stroke="' +
        rare +
        '" stroke-width="9"/>';
    } else {
      shape =
        '<g class="wb-sword"><path d="M0 150V49" stroke="#4b3128" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="161" r="11" fill="' +
        palette.dark +
        '" stroke="' +
        rare +
        '" stroke-width="4"/><path d="M-38 46H38" stroke="' +
        rare +
        '" stroke-width="11" stroke-linecap="round"/><path d="M0 40l-18-34L0-152 18 6Z" fill="' +
        palette.light +
        '" stroke="' +
        rare +
        '" stroke-width="6"/><path d="M0-120V8" stroke="#ffffff" stroke-opacity=".46" stroke-width="3"/></g>';
    }
    return (
      '<g class="wb-equipped wb-weapon" transform="translate(' +
      x +
      " " +
      y +
      ") rotate(" +
      rotate +
      ")" +
      flip +
      '">' +
      shape +
      "</g>"
    );
  }

  function render(entity, size) {
    size = size || "full";
    var faction =
      entity && entity.faction === "bloodbound" ? "bloodbound" : "moonborn";
    var a = normalizeAppearance(entity && entity.appearance, faction);
    var preset = presetById[a.portrait];
    if (preset && preset.svg)
      return inlinePresetSvg(
        preset.svg,
        faction,
        (entity && entity.name ? entity.name + " — " : "") + preset.label,
        a,
        preset.id,
        entity,
        size,
      );
    var f = D.factions[faction];
    var skin = skinColors[a.skin] || skinColors.ash;
    var hair = hairColors[a.hairColor] || hairColors.obsidian;
    var accents = accentColors[a.accent] || accentColors["night blue"];
    var metals = metalColors[a.metal] || metalColors["blackened silver"];
    var colors = {
      skin: skin[0],
      skinShadow: skin[1],
      skinLight: skin[2],
      eye: eyeColors[a.eyes] || eyeColors.amber,
      hairDark: hair[0],
      hairLight: hair[1],
      accentDark: accents[0],
      accentLight: accents[1],
      metalDark: metals[0],
      metalMid: metals[1],
      metalLight: metals[2],
    };
    var serial = ++portraitSerial;
    var prefix = "wbp" + serial;
    var ids = {
      bg: prefix + "bg",
      fog: prefix + "fog",
      skin: prefix + "skin",
      cloth: prefix + "cloth",
      chain: prefix + "chain",
      eyeGlow: prefix + "eyes",
      blur: prefix + "blur",
      shadow: prefix + "shadow",
    };
    var equipment =
      (entity &&
        (entity.equipment || (entity.player && entity.player.equipment))) ||
      {};
    var profile = characterProfile;
    var viewBox =
      size === "mini" || size === "avatar" || size === "bust"
        ? "72 40 276 318"
        : "0 0 420 640";
    var hairShape = hairParts(a, faction, colors);
    var label =
      (entity && entity.name ? entity.name + ", " : "") +
      describe({ faction: faction, appearance: a });
    var svg =
      '<svg class="portrait-svg wb-character-portrait wb-faction-' +
      faction +
      '" viewBox="' +
      viewBox +
      '" role="img" aria-labelledby="' +
      prefix +
      "title " +
      prefix +
      'desc" preserveAspectRatio="xMidYMid meet">' +
      '<title id="' +
      prefix +
      'title">' +
      esc(entity && entity.name ? entity.name : f.name + " character") +
      "</title>" +
      '<desc id="' +
      prefix +
      'desc">' +
      esc(label) +
      "</desc>" +
      "<defs>" +
      '<linearGradient id="' +
      ids.bg +
      '" x1="0" y1="0" x2="0" y2="1"><stop stop-color="' +
      colors.accentDark +
      '"/><stop offset=".46" stop-color="#151722"/><stop offset="1" stop-color="#07090e"/></linearGradient>' +
      '<linearGradient id="' +
      ids.fog +
      '" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#95a2b3" stop-opacity="0"/><stop offset=".5" stop-color="#bac4cf" stop-opacity=".24"/><stop offset="1" stop-color="#95a2b3" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' +
      ids.skin +
      '" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' +
      colors.skinLight +
      '"/><stop offset=".42" stop-color="' +
      colors.skin +
      '"/><stop offset="1" stop-color="' +
      colors.skinShadow +
      '"/></linearGradient>' +
      '<linearGradient id="' +
      ids.cloth +
      '" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' +
      colors.accentLight +
      '"/><stop offset=".34" stop-color="' +
      colors.accentDark +
      '"/><stop offset="1" stop-color="#17141b"/></linearGradient>' +
      '<pattern id="' +
      ids.chain +
      '" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="3" fill="none" stroke="' +
      colors.metalLight +
      '" stroke-width="1.5"/><circle cx="9" cy="9" r="3" fill="none" stroke="' +
      colors.metalLight +
      '" stroke-width="1.5"/></pattern>' +
      '<filter id="' +
      ids.eyeGlow +
      '" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="' +
      (a.eyeGlow === "eclipse" ? 8 : 4) +
      '" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="' +
      ids.blur +
      '"><feGaussianBlur stdDeviation="13"/></filter>' +
      '<filter id="' +
      ids.shadow +
      '" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>' +
      "</defs>" +
      (size === "battle" ? "" : stageArt(a, faction, ids, colors)) +
      (size === "battle" ? "" : '<ellipse cx="210" cy="605" rx="128" ry="23" fill="#000" opacity=".66" filter="url(#' +
      ids.shadow +
      ')"/>') +
      '<g class="wb-character-core"><g class="wb-body-build">' +
      accessoryBack(a, colors) +
      cloakLayer(a, colors) +
      hairShape.back +
      bodyBase(a, faction, colors, profile) +
      armLayer(colors, profile) +
      outfitLayer(a, faction, colors, ids, profile) +
      neckLayer(profile, colors, ids) +
      faceAndHead(a, faction, colors, ids) +
      hairShape.front +
      markingLayer(a, colors) +
      headLinework(colors) +
      armorEquipment(equipment, colors, profile) +
      limbEquipment(equipment, colors, profile) +
      jewelryEquipment(equipment, colors, profile) +
      accessoryFront(a, colors) +
      headEquipment(equipment.head, colors) +
      weaponEquipment(equipment.secondary, "left", colors, profile) +
      weaponEquipment(equipment.weapon, "right", colors, profile) +
      "</g></g>" +
      '<g class="wb-runes" fill="none" stroke="' +
      colors.accentLight +
      '" stroke-width="2" opacity=".42"><circle cx="68" cy="238" r="16"/><path d="M68 222v32m-16-16h32"/><circle cx="351" cy="311" r="13"/><path d="M351 298l11 20h-22Z"/></g>' +
      '<path d="M8 610h404" stroke="' +
      colors.accentLight +
      '" stroke-opacity=".2"/>' +
      "</svg>";
    return svg;
  }

  function itemShape(slot, colors, rare) {
    if (slot === "weapon")
      return (
        '<path d="M58 91l-9-10 7-47L75 7l7 34-15 43Z" fill="' +
        colors[1] +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M45 84h32M55 87l-8 23m22-23 7 23" stroke="' +
        colors[2] +
        '" stroke-width="6"/>'
      );
    if (slot === "secondary")
      return (
        '<path d="M32 77q9-47 50-55 22-4 30 12-42-4-43 31-1 20 20 22" fill="none" stroke="' +
        rare +
        '" stroke-width="12"/><path d="M32 67v41" stroke="' +
        colors[1] +
        '" stroke-width="9"/>'
      );
    if (slot === "head")
      return (
        '<path d="M24 79q3-52 40-62 37 10 40 62L86 69l-8-25-14-9-14 9-8 25Z" fill="' +
        colors[0] +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M64 17v50" stroke="' +
        colors[2] +
        '" stroke-width="4"/>'
      );
    if (slot === "chest")
      return (
        '<path d="M25 29l24-13 15 12 15-12 24 13-9 74-30 15-30-15Z" fill="' +
        colors[0] +
        '" stroke="' +
        rare +
        '" stroke-width="5"/><path d="M42 37l22 18 22-18M38 78h52" fill="none" stroke="' +
        colors[2] +
        '" stroke-width="4"/>'
      );
    if (slot === "hands")
      return (
        '<path d="M20 34l30 9-4 59-28 9Zm88 0-30 9 4 59 28 9Z" fill="' +
        colors[0] +
        '" stroke="' +
        rare +
        '" stroke-width="5"/>'
      );
    if (slot === "legs")
      return (
        '<path d="M31 18h66l-9 96H65L60 59l-8 55H28Z" fill="' +
        colors[0] +
        '" stroke="' +
        rare +
        '" stroke-width="5"/>'
      );
    if (slot === "feet")
      return (
        '<path d="M23 42h35l-3 48-35 20H8Zm47 0h35l15 68H73Z" fill="' +
        colors[0] +
        '" stroke="' +
        rare +
        '" stroke-width="5"/>'
      );
    if (slot === "amulet")
      return (
        '<path d="M28 26q36 61 72 0" fill="none" stroke="' +
        colors[2] +
        '" stroke-width="6"/><path d="M64 64L47 87l17 29 17-29Z" fill="' +
        rare +
        '" stroke="#eee" stroke-width="4"/>'
      );
    if (slot === "ring1" || slot === "ring2")
      return (
        '<circle cx="64" cy="69" r="35" fill="none" stroke="' +
        colors[1] +
        '" stroke-width="12"/><path d="M48 35l16-22 16 22-16 16Z" fill="' +
        rare +
        '" stroke="#eee" stroke-width="3"/>'
      );
    if (slot === "relic")
      return (
        '<circle cx="64" cy="64" r="42" fill="' +
        colors[0] +
        '" stroke="' +
        rare +
        '" stroke-width="7"/><path d="M64 28l21 36-21 36-21-36Z" fill="' +
        rare +
        '"/><circle cx="64" cy="64" r="8" fill="#fff"/>'
      );
    return (
      '<path d="M44 22h40l-4 24 18 53q4 16-16 16H46q-20 0-16-16l18-53Z" fill="' +
      rare +
      '" opacity=".72" stroke="#e8e0d5" stroke-width="5"/><path d="M39 82h50" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>'
    );
  }

  function itemIcon(item) {
    item = item || {};
    var serial = ++portraitSerial;
    var rare = rarityColor(item, "#9aa0aa");
    var slot = item.slot || item.type || "consumable";
    var palette = equipmentPalette(item, {
      metalDark: "#2e3340",
      metalMid: "#6d788c",
      metalLight: "#d0d7e2",
      accentLight: rare,
    });
    return (
      '<svg class="equipment-icon" viewBox="0 0 128 128" aria-hidden="true" focusable="false"><defs><radialGradient id="itemGlow' +
      serial +
      '"><stop stop-color="' +
      rare +
      '" stop-opacity=".42"/><stop offset="1" stop-color="' +
      rare +
      '" stop-opacity="0"/></radialGradient></defs><circle cx="64" cy="64" r="60" fill="url(#itemGlow' +
      serial +
      ')"/><g>' +
      itemShape(slot, [palette.dark, palette.mid, palette.light], palette.edge) +
      '</g><circle cx="109" cy="109" r="8" fill="' +
      palette.edge +
      '" stroke="#11131a" stroke-width="3"/></svg>'
    );
  }

  var originalOpponentFactory = D.generateOpponent;
  D.generateOpponent = function (player) {
    var opponent = originalOpponentFactory(player);
    opponent.appearance = randomAppearance(opponent.faction);
    return opponent;
  };

  window.WB_CHARACTER_ART = {
    options: appearance,
    optionsFor: optionsFor,
    normalizeAppearance: normalizeAppearance,
    randomAppearance: randomAppearance,
    defaultAppearance: defaultAppearance,
    render: render,
    itemIcon: itemIcon,
    describe: describe,
    presetOptions: presetOptions,
    presetLabel: presetLabel,
  };
})();
