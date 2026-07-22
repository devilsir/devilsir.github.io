#!/usr/bin/env python3
"""Synchronize the patch-only ES module sources with the shipped browser bundle.

The complete project sources are not part of this overlay ZIP, while game.bundle.js
is the file loaded by the static build.  This script replaces the patched Tower
modules with isolated IIFE modules, embeds the editor/dev modules, then applies the
small integration hooks needed in the original exploration/combat/main code.
"""

from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BUNDLE = ROOT / "js/game.bundle.js"


def source(name: str) -> str:
    return (ROOT / "js" / name).read_text(encoding="utf-8")


def strip_module(text: str) -> str:
    text = re.sub(r"^import\s+[^;]+;\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"^export\s*\{[^;]+\};\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\bexport\s+(?=(?:async\s+function|class|function|const|let|var)\b)", "", text)
    return text.strip()


def module_wrapper(
    variable: str,
    filename: str,
    exports: list[str],
    dependencies: dict[str, str] | None = None,
    aliases: dict[str, str] | None = None,
) -> str:
    dependencies = dependencies or {}
    aliases = aliases or {}
    dependency_line = ""
    invocation = "()"
    if dependencies:
        dependency_line = f"  const {{{', '.join(dependencies)}}}=deps;\n"
        invocation = "({" + ", ".join(f"{name}: {value}" for name, value in dependencies.items()) + "})"
    exported = []
    for name in exports:
        exported.append(f"{aliases.get(name, name)}: {name}" if name in aliases else name)
    body = strip_module(source(filename))
    return (
        f"  // js/{filename}\n"
        f"  var {variable}=((deps)=>{{\n"
        f"{dependency_line}{body}\n"
        f"  return {{{', '.join(exported)}}};\n"
        f"  }}){invocation};\n"
    )


def replace_section(text: str, start: str, end: str, replacement: str) -> str:
    start_at = text.index(start)
    end_at = text.index(end, start_at)
    return text[:start_at] + replacement + "\n" + text[end_at:]


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    integrated_count = text.count(new)
    # Check the integrated form first because some hooks intentionally contain
    # their original snippet as a suffix.
    if integrated_count == 1:
        return text
    if count == 1:
        return text.replace(old, new, 1)
    # Re-running the synchronizer over an already integrated bundle must remain
    # safe: source-module sections above are refreshed, while hooks that are
    # already present are intentionally left in place.
    raise RuntimeError(f"{label}: expected one original or integrated match, found {count}")


def main() -> None:
    text = BUNDLE.read_text(encoding="utf-8")

    manifest = module_wrapper(
        "TowerManifestModule",
        "tower_manifest.js",
        ["TOWER_MANIFEST_META", "TOWER_ASSETS", "towerAssets", "towerVisualAssets"],
    ) + (
        "  var TOWER_MANIFEST_META=TowerManifestModule.TOWER_MANIFEST_META;\n"
        "  var TOWER_ASSETS=TowerManifestModule.TOWER_ASSETS;\n"
    )
    prop = module_wrapper(
        "PropPresentationModule",
        "prop_presentation.js",
        [
            "presentationFromAsset", "normalizePropPresentation", "propCollisionBounds",
            "propVisualBounds", "propShadowSpec", "propSortY", "rectangleOverlap",
            "propBlocksPoint",
        ],
    )
    map_overrides = module_wrapper(
        "MapOverridesModule", "map_overrides.js",
        [
            "WORLD_MAP_OVERRIDES", "TOWER_FLOOR_OVERRIDES", "worldMapOverride",
            "towerFloorOverride", "worldNavigationValue", "applyWorldEntityOverride",
            "applyTowerFloorOverride",
        ],
    )
    text = replace_section(
        text,
        "  // js/tower_manifest.js",
        "  // js/tower_visual.js",
        manifest + prop + map_overrides,
    )

    visual = module_wrapper(
        "TowerVisualModule",
        "tower_visual.js",
        [
            "createVisualTerrainPlan", "visualTerrainSignature", "validateTowerManifestVisuals",
            "validateVisualTerrainPlan", "towerManifestAsset",
        ],
        {
            "TOWER_ASSETS": "TOWER_ASSETS",
            "TOWER_MANIFEST_META": "TOWER_MANIFEST_META",
            "TOWER_CONFIG": "TOWER_CONFIG",
        },
    ) + "\n".join(
        f"  var {name}=TowerVisualModule.{name};"
        for name in [
            "createVisualTerrainPlan", "visualTerrainSignature", "validateTowerManifestVisuals",
            "validateVisualTerrainPlan", "towerManifestAsset",
        ]
    ) + "\n"
    text = replace_section(
        text,
        "  // js/tower_visual.js",
        "  // js/tower_generator.js",
        visual,
    )

    generator_dependencies = {
        "TOWER_ASSETS": "TOWER_ASSETS",
        "TOWER_MANIFEST_META": "TOWER_MANIFEST_META",
        "TOWER_CONFIG": "TOWER_CONFIG",
        "TOWER_FAMILIES": "TOWER_FAMILIES",
        "TOWER_GRAMMARS": "TOWER_GRAMMARS",
        "TOWER_MUTATIONS": "TOWER_MUTATIONS",
        "TOWER_OBJECTIVES": "TOWER_OBJECTIVES",
        "TOWER_WHISPERS": "TOWER_WHISPERS",
        "towerBossName": "towerBossName",
        "towerEnemyPool": "towerEnemyPool",
        "createVisualTerrainPlan": "createVisualTerrainPlan",
        "validateTowerManifestVisuals": "validateTowerManifestVisuals",
        "validateVisualTerrainPlan": "validateVisualTerrainPlan",
        "visualTerrainSignature": "visualTerrainSignature",
        "presentationFromAsset": "PropPresentationModule.presentationFromAsset",
        "propCollisionBounds": "PropPresentationModule.propCollisionBounds",
        "rectangleOverlap": "PropPresentationModule.rectangleOverlap",
        "applyTowerFloorOverride": "MapOverridesModule.applyTowerFloorOverride",
    }
    generator = module_wrapper(
        "TowerGeneratorModule",
        "tower_generator.js",
        [
            "hashString", "TowerRandom", "towerFloorSeed", "validateTowerFloor",
            "generateTowerFloor", "rebuildTowerVisualPlan", "validateTowerSeeds",
        ],
        generator_dependencies,
    ) + "\n".join(
        f"  var {alias}=TowerGeneratorModule.{name};"
        for alias, name in [
            ("hashString2", "hashString"), ("TowerRandom", "TowerRandom"),
            ("towerFloorSeed", "towerFloorSeed"), ("validateTowerFloor", "validateTowerFloor"),
            ("generateTowerFloor", "generateTowerFloor"),
            ("rebuildTowerVisualPlan", "rebuildTowerVisualPlan"),
            ("validateTowerSeeds", "validateTowerSeeds"),
        ]
    ) + "\n"
    text = replace_section(
        text,
        "  // js/tower_generator.js",
        "  // js/tower.js",
        generator,
    )

    tower_dependencies = {
        "REGIONS": "REGIONS", "ROUTES": "ROUTES", "asset": "asset",
        "characterArt": "characterArt", "formSprite": "formSprite", "mobSprite": "mobSprite",
        "TOWER_CONFIG": "TOWER_CONFIG", "generateTowerFloor": "generateTowerFloor",
        "normalizePropPresentation": "PropPresentationModule.normalizePropPresentation",
        "propBlocksPoint": "PropPresentationModule.propBlocksPoint",
        "propCollisionBounds": "PropPresentationModule.propCollisionBounds",
        "propShadowSpec": "PropPresentationModule.propShadowSpec",
        "propSortY": "PropPresentationModule.propSortY",
        "propVisualBounds": "PropPresentationModule.propVisualBounds",
    }
    tower = module_wrapper("TowerEngineModule", "tower.js", ["TowerEngine"], tower_dependencies)
    tower += "  var TowerEngine=TowerEngineModule.TowerEngine;\n"

    history = module_wrapper(
        "EditorHistoryModule", "editor_history.js", ["EditorHistory", "cloneValue"],
        aliases={"cloneValue": "cloneEditorValue"},
    )
    editor_export = module_wrapper(
        "EditorExportModule", "editor_export.js",
        [
            "stableClean", "stableStringify", "buildWorldExport", "buildTowerDelta",
            "asJavaScriptModule", "downloadText", "copyText", "cloneExportValue",
        ],
    )
    map_editor = module_wrapper(
        "MapEditorModule", "map_editor.js", ["MapEditor"],
        {
            "EditorHistory": "EditorHistoryModule.EditorHistory",
            "cloneEditorValue": "EditorHistoryModule.cloneEditorValue",
            "buildTowerDelta": "EditorExportModule.buildTowerDelta",
            "buildWorldExport": "EditorExportModule.buildWorldExport",
            "stableStringify": "EditorExportModule.stableStringify",
            "presentationFromAsset": "PropPresentationModule.presentationFromAsset",
            "normalizePropPresentation": "PropPresentationModule.normalizePropPresentation",
            "propBlocksPoint": "PropPresentationModule.propBlocksPoint",
            "propCollisionBounds": "PropPresentationModule.propCollisionBounds",
            "propShadowSpec": "PropPresentationModule.propShadowSpec",
            "propSortY": "PropPresentationModule.propSortY",
            "propVisualBounds": "PropPresentationModule.propVisualBounds",
            "rebuildTowerVisualPlan": "TowerGeneratorModule.rebuildTowerVisualPlan",
            "validateTowerFloor": "TowerGeneratorModule.validateTowerFloor",
        },
    )
    dev = module_wrapper(
        "DeveloperModeModule", "dev_mode.js", ["DeveloperMode", "createDeveloperMode"],
        {
            "MapEditor": "MapEditorModule.MapEditor", "TOWER_ASSETS": "TOWER_ASSETS",
            "asJavaScriptModule": "EditorExportModule.asJavaScriptModule",
            "copyText": "EditorExportModule.copyText",
            "downloadText": "EditorExportModule.downloadText",
            "stableStringify": "EditorExportModule.stableStringify",
        },
    )
    integrated = tower + history + editor_export + map_editor + dev
    integrated += "  var VozDevPatch={...DeveloperModeModule,MapEditor:MapEditorModule.MapEditor,MapOverridesModule};\n"
    text = replace_section(text, "  // js/tower.js", "  // js/main.js", integrated)

    # Normal saves never inherit the temporary developer snapshot or unlocks.
    text = replace_once(
        text,
        '  function saveGame(state2, slot = "auto") {\n    const payload = { ...state2, version: SAVE_VERSION, updatedAt: Date.now() };',
        '  function saveGame(state2, slot = "auto") {\n    const persistable = globalThis.__VOZ_DEV__?.sanitizeState?.(state2) || state2;\n    const payload = { ...persistable, version: SAVE_VERSION, updatedAt: Date.now() };',
        "save isolation",
    )
    text = replace_once(
        text,
        '  function saveMeta(meta) {\n    localStorage.setItem(META_KEY, JSON.stringify(meta));\n  }',
        '  function saveMeta(meta) {\n    if (globalThis.__VOZ_DEV__?.enabled) return false;\n    localStorage.setItem(META_KEY, JSON.stringify(meta));\n    return true;\n  }',
        "developer meta isolation",
    )
    text = replace_once(
        text,
        '  function deleteSave(slot) {\n    localStorage.removeItem(`${SAVE_PREFIX}${slot}`);\n  }',
        '  function deleteSave(slot) {\n    if (globalThis.__VOZ_DEV__?.enabled) return false;\n    localStorage.removeItem(`${SAVE_PREFIX}${slot}`);\n    return true;\n  }',
        "developer save deletion guard",
    )

    # AssetCache keeps a visible, already decoded fallback on screen while a newly
    # selected skin/form is loading.
    text = replace_once(
        text,
        '      this.missing = /* @__PURE__ */ new Set();\n    }',
        '      this.missing = /* @__PURE__ */ new Set();\n      this.pendingFirst = /* @__PURE__ */ new Set();\n    }',
        "asset pending set",
    )
    text = replace_once(
        text,
        '    get(src) {\n      const resolved = this.aliases.get(src) || src;',
        '''    resolveFirst(requested, candidates = []) {
      const direct = this.images.get(requested), directImage = direct?.image;
      if (direct?.valid && directImage?.complete && directImage.naturalWidth > 0 && directImage.naturalHeight > 0) {
        direct.lastUsed = now();
        this.aliases.set(requested, requested);
        return directImage;
      }
      const alias = this.aliases.get(requested), aliasImage = alias && alias !== requested ? this.get(alias) : null;
      let fallback = aliasImage;
      if (!fallback) for (const path of unique(candidates)) {
        fallback = this.get(path);
        if (fallback) {
          this.aliases.set(requested, path);
          break;
        }
      }
      if (!this.missing.has(requested) && !this.pendingFirst.has(requested)) {
        this.pendingFirst.add(requested);
        this.loadFirst(requested, candidates).finally(() => this.pendingFirst.delete(requested));
      }
      return fallback || null;
    }
    get(src) {
      const resolved = this.aliases.get(src) || src;''',
        "asset live fallback",
    )
    text = replace_once(
        text,
        '      this.moving = false;\n      this.bindEvents();',
        '      this.moving = false;\n      this.lastPlayerImage = null;\n      this.bindEvents();',
        "world retained player visual",
    )
    text = replace_once(
        text,
        'const spec = this.playerCandidates(state2, state2.facing), image = this.cache.get(spec.exact), x =',
        'const spec = this.playerCandidates(state2, state2.facing), loadedImage = this.cache.resolveFirst(spec.exact, spec.candidates), image = loadedImage || this.lastPlayerImage, x =',
        "world skin fallback",
    )
    text = replace_once(
        text,
        '      this.ctx.fillStyle = "rgba(0,0,0,.48)";\n      this.ctx.beginPath();',
        '      if (loadedImage) this.lastPlayerImage = loadedImage;\n      this.ctx.fillStyle = "rgba(0,0,0,.48)";\n      this.ctx.beginPath();',
        "world remember decoded player visual",
    )

    # The world editor and developer collision switch feed the real movement query.
    text = replace_once(
        text,
        '    collides(position, index = this.getState()?.regionIndex || 0) {\n      const radius = 21, border = 64;',
        '''    collides(position, index = this.getState()?.regionIndex || 0) {
      if (globalThis.__VOZ_DEV__?.enabled && globalThis.__VOZ_DEV__.flags?.playerCollision === false) return false;
      const editorCollision = globalThis.__VOZ_DEV__?.enabled ? globalThis.__VOZ_DEV__.editor?.worldCollisionAt?.(position, index) : null;
      if (typeof editorCollision === "boolean") return editorCollision;
      const radius = 21, border = 64;
      if (position.x < border + radius || position.y < border + radius || position.x > this.world.w - border - radius || position.y > this.world.h - border - radius) return true;
      const shippedOverride = MapOverridesModule.worldMapOverride(index);
      const shippedNavigation = MapOverridesModule.worldNavigationValue(index, position.x, position.y, shippedOverride?.metadata?.gridSize || 64);
      if (["blocked", "hazard", "void"].includes(shippedNavigation)) return true;
      if ((shippedOverride?.props || []).some((prop) => PropPresentationModule.propBlocksPoint(prop, position.x, position.y, radius))) return true;
      if (["walkable", "path", "bridge"].includes(shippedNavigation)) return false;''',
        "world editor collision",
    )
    text = replace_once(
        text,
        '      if (position.x < border + radius || position.y < border + radius || position.x > this.world.w - border - radius || position.y > this.world.h - border - radius) return true;\n      return this.obstacles(index).some((box) => position.x + radius > box.x && position.x - radius < box.x + box.w && position.y + radius > box.y && position.y - radius < box.y + box.h);',
        '      const shippedObstacles = MapOverridesModule.worldMapOverride(index)?.obstacles;\n      const obstacles = Array.isArray(shippedObstacles) ? shippedObstacles : this.obstacles(index);\n      return obstacles.some((box) => position.x + radius > box.x && position.x - radius < box.x + box.w && position.y + radius > box.y && position.y - radius < box.y + box.h);',
        "world shipped obstacles",
    )
    text = replace_once(
        text,
        '    spawnPoint(index = this.getState()?.regionIndex || 0) {\n      return this.toWorld((REGION_LAYOUTS[index] || REGION_LAYOUTS[0]).spawn);\n    }',
        '    spawnPoint(index = this.getState()?.regionIndex || 0) {\n      const override = MapOverridesModule.worldMapOverride(index);\n      return override?.spawn ? { x: Number(override.spawn.x), y: Number(override.spawn.y) } : this.toWorld((REGION_LAYOUTS[index] || REGION_LAYOUTS[0]).spawn);\n    }',
        "world shipped spawn",
    )
    text = replace_once(
        text,
        '      const core = [asset(region.biome), asset(region.map), asset(region.battle), asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"), ...region.tileObjects.map((file) => tileSprite(region, file)), this.npcSprite(index)];',
        '      const core = [asset(region.biome), asset(region.map), asset(region.battle), asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"), ...region.tileObjects.map((file) => tileSprite(region, file)), this.npcSprite(index), ...(MapOverridesModule.worldMapOverride(index)?.props || []).map((prop) => prop.path)];',
        "world override asset preload",
    )
    text = replace_once(
        text,
        '      const objective = this.entities.find((entity) => entity.type === "encounter" && !entity.locked) || this.entities.find((entity) => entity.type === "portal") || this.entities.find((entity) => entity.type === "npc");',
        '      this.entities = MapOverridesModule.applyWorldEntityOverride(state2.regionIndex, this.entities);\n      const objective = this.entities.find((entity) => entity.type === "encounter" && !entity.locked) || this.entities.find((entity) => entity.type === "portal") || this.entities.find((entity) => entity.type === "npc");',
        "world entity overrides",
    )
    text = replace_once(
        text,
        '      [...this.entities].sort((a, b) => a.y - b.y).forEach((entity) => this.drawEntity(entity, region));',
        '      const shippedProps = (MapOverridesModule.worldMapOverride(state2.regionIndex)?.props || []).map((prop) => ({ ...prop, type: "shipped-prop" }));\n      [...this.entities, ...shippedProps].sort((a, b) => (a.type === "shipped-prop" ? PropPresentationModule.propSortY(a) : a.y) - (b.type === "shipped-prop" ? PropPresentationModule.propSortY(b) : b.y)).forEach((entity) => entity.type === "shipped-prop" ? this.drawRuntimeProp(entity) : this.drawEntity(entity, region));',
        "world prop overrides",
    )
    text = replace_once(
        text,
        '    drawWorldObjects(region) {',
        '''    drawRuntimeProp(rawProp) {
      const prop = PropPresentationModule.normalizePropPresentation(rawProp);
      const image = this.cache.get(prop.path);
      if (!image) return;
      const shadow = PropPresentationModule.propShadowSpec(prop), box = PropPresentationModule.propVisualBounds(prop), bounds = prop.sourceBounds;
      if (shadow.opacity > 0) {
        this.ctx.fillStyle = `rgba(0,0,0,${shadow.opacity})`;
        this.ctx.beginPath();
        this.ctx.ellipse(shadow.x - this.camera.x, shadow.y - this.camera.y, shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      const anchorX = prop.x + prop.anchorOffsetX - this.camera.x, anchorY = prop.y + prop.anchorOffsetY - this.camera.y;
      this.ctx.save();
      this.ctx.translate(anchorX, anchorY);
      if (prop.rotation && prop.canRotate !== false) this.ctx.rotate(Number(prop.rotation) * Math.PI / 180);
      if (prop.mirror && prop.canMirror !== false) this.ctx.scale(-1, 1);
      this.ctx.drawImage(image, bounds[0], bounds[1], bounds[2], bounds[3], box.x - this.camera.x - anchorX, box.y - this.camera.y - anchorY, box.w, box.h);
      this.ctx.restore();
    }
    drawWorldObjects(region) {''',
        "world runtime prop renderer",
    )
    text = replace_once(
        text,
        '      const marker = (entity) => {',
        '''      globalThis.__VOZ_DEV__?.editor?.drawWorldMinimapOverlay?.(ctx, { w, h, world: this.world, scale, ox, oy });
      const shippedProps = MapOverridesModule.worldMapOverride(state2.regionIndex)?.props || [];
      for (const prop of shippedProps) { ctx.fillStyle = "#d8a7ff"; ctx.fillRect(ox + prop.x * scale - 1, oy + prop.y * scale - 1, 3, 3); }
      const marker = (entity) => {''',
        "world minimap editor overlay",
    )

    # Combat sprite nodes get an immediate visual fallback and swap atomically after
    # decoding, avoiding transparent actors during transformations.
    text = replace_once(
        text,
        '    constructor({ screen, getState, audio: audio2, onVictory, onDefeat, onFlee, onHelp }) {',
        '    constructor({ screen, getState, cache: cache2, audio: audio2, onVictory, onDefeat, onFlee, onHelp }) {',
        "combat cache argument",
    )
    text = replace_once(
        text,
        '    constructor({ screen, getState, cache: cache2, audio: audio2, onVictory, onDefeat, onFlee, onHelp }) {\n      this.screen = screen;\n      this.getState = getState;\n      this.audio = audio2;',
        '    constructor({ screen, getState, cache: cache2, audio: audio2, onVictory, onDefeat, onFlee, onHelp }) {\n      this.screen = screen;\n      this.getState = getState;\n      this.cache = cache2;\n      this.pendingSprites = /* @__PURE__ */ new Set();\n      this.audio = audio2;',
        "combat cache assignment",
    )
    text = replace_once(
        text,
        '        img: formSprite(state2.route, state2.activeForm, "front", state2.visualVariant),\n        skills: heroSkills,',
        '        img: formSprite(state2.route, state2.activeForm, "front", state2.visualVariant),\n        imgFallbacks: [characterArt(state2.route, state2.visualVariant)],\n        skills: heroSkills,',
        "combat hero fallbacks",
    )
    # There are two identical buildParty bodies in neither source nor bundle; assert
    # the first occurrence only above, then transformation keeps the fallback current.
    text = replace_once(
        text,
        '      actor.img = formSprite(state2.route, form.id, "front", state2.visualVariant);\n      this.audio.transform();',
        '''      const previousSprite = this.actorSprite(actor);
      actor.img = formSprite(state2.route, form.id, "front", state2.visualVariant);
      actor.lastVisibleImg = previousSprite;
      actor.imgFallbacks = unique([previousSprite, characterArt(state2.route, state2.visualVariant)]);
      this.preloadActorSprite(actor);
      this.audio.transform();''',
        "combat transform preload",
    )
    text = replace_once(
        text,
        '    render() {\n      this.renderStage(this.partyStage, this.party);',
        '''    actorSprite(actor) {
      const candidates = unique([...(actor.imgFallbacks || []), actor.lastVisibleImg]);
      const image = this.cache?.resolveFirst?.(actor.img, candidates);
      const resolved = image ? (this.cache.aliases.get(actor.img) || candidates.find((path) => this.cache?.get?.(path)) || actor.img) : null;
      if (resolved && this.cache?.get?.(resolved)) actor.lastVisibleImg = resolved;
      return actor.lastVisibleImg || resolved || actor.img;
    }
    preloadActorSprite(actor) {
      if (!actor?.img || this.pendingSprites.has(actor.img)) return;
      this.pendingSprites.add(actor.img);
      this.cache?.loadFirst?.(actor.img, actor.imgFallbacks || []).then(() => {
        if (!this.battle?.ended) this.render();
      }).finally(() => this.pendingSprites.delete(actor.img));
    }
    render() {
      [...this.party, ...this.enemies].forEach((actor) => this.preloadActorSprite(actor));
      this.renderStage(this.partyStage, this.party);''',
        "combat sprite resolver",
    )
    text = replace_once(
        text,
        '<img src="${actor.img}" alt="${actor.name}">',
        '<img src="${this.actorSprite(actor)}" alt="${actor.name}" data-actor-sprite="${actor.id}">',
        "combat resolved sprite",
    )
    text = replace_once(
        text,
        '<img src="${current.img}" alt="">',
        '<img src="${this.actorSprite(current)}" alt="">',
        "combat active actor resolved sprite",
    )
    text = replace_once(
        text,
        '      const fallenBoss = this.enemies.find((enemy) => enemy.boss && enemy.hp <= 0);',
        '''      const devFlags = globalThis.__VOZ_DEV__?.enabled ? globalThis.__VOZ_DEV__.flags : null;
      if (devFlags?.instantVictory) this.enemies.forEach((enemy) => enemy.hp = 0);
      if (devFlags?.invulnerable) this.party.forEach((actor) => actor.hp = Math.max(1, actor.hp));
      const fallenBoss = this.enemies.find((enemy) => enemy.boss && enemy.hp <= 0);''',
        "combat developer flags",
    )
    text = replace_once(
        text,
        '    getState: () => state,\n    audio,\n    onVictory:',
        '    getState: () => state,\n    cache,\n    audio,\n    onVictory:',
        "main combat cache",
    )

    # Keep a single dev controller bound to live instances. It is dormant unless
    # explicitly enabled by ?dev=1 or the allowed local shortcut.
    developer_bootstrap = '''
  function createDeveloperTowerRun(input) {
    return {
      seed: input.seed,
      floor: input.floor,
      difficulty: input.difficulty,
      floorSeed: null,
      playerPosition: null,
      explored: [],
      clearedEncounters: [],
      openedChests: [],
      activatedAltars: [],
      activatedObjectives: [],
      completedEvents: [],
      upgrades: [],
      resources: { towerCurrency: state.tower?.currency || 0, materials: {}, keys: 0 },
      currentObjective: null,
      mutation: null,
      family: null,
      lastSavedAt: Date.now(),
      developerOverrides: input.overrides || null,
      hp: state.hp,
      focus: state.focus,
      authority: state.authority,
      companionHp: {
        eliara: state.companions?.eliara?.hp || 1,
        dagra: state.companions?.dagra?.hp || 1
      }
    };
  }
  var developerMode = VozDevPatch.createDeveloperMode({
    canvas: worldCanvas,
    getState: () => state,
    setState: (next) => state = next,
    getEngine: () => activeEngine(),
    cache,
    regions: REGIONS,
    forms: FORMS,
    skills: SKILLS,
    items: ITEMS,
    companions: COMPANIONS,
    towerFamilies: TOWER_FAMILIES,
    towerGrammars: TOWER_GRAMMARS,
    towerMutations: TOWER_MUTATIONS,
    towerPermanentUpgrades: TOWER_PERMANENT_UPGRADES,
    normalDisplay: NORMAL_DISPLAY,
    characterArt,
    formSprite,
    mobSprite,
    getPlayerStats,
    addXp,
    combat,
    transitionRegion,
    continueTowerRun,
    startFinalBattle,
    startWorldBattle: (regionIndex, type) => {
      if (state.gameMode === "tower") return;
      state.regionIndex = Math.max(0, Math.min(REGIONS.length - 1, Number(regionIndex) || 0));
      startBattle(type || "normal");
    },
    createDevTowerRun: createDeveloperTowerRun,
    updateHud,
    refreshCharacterVisuals: async () => {
      updateGlobalCharacterArt();
      const engine = activeEngine();
      const spec = engine.playerCandidates?.(state, state.facing || "front");
      if (spec) await cache.loadFirst(spec.exact, spec.candidates || []);
      updateHud(true);
    },
    notify: toast,
    reloadState: loadState
  });
'''
    text = replace_once(
        text,
        '  function activeEngine() {\n    return state?.gameMode === "tower" ? towerEngine : exploration;\n  }',
        '  function activeEngine() {\n    return state?.gameMode === "tower" ? towerEngine : exploration;\n  }\n' + developer_bootstrap,
        "developer bootstrap",
    )
    text = replace_once(
        text,
        '  async function beginGame(firstTime = false) {\n    setTheme();',
        '  async function beginGame(firstTime = false) {\n    developerMode?.onStateChanged?.();\n    setTheme();',
        "developer state refresh",
    )
    text = replace_once(
        text,
        '      state = createNewState("lucas");\n      state.flags.draft = true;\n    }\n    updateGlobalCharacterArt();',
        '      state = createNewState("lucas");\n      state.flags.draft = true;\n    }\n    developerMode?.onStateChanged?.();\n    updateGlobalCharacterArt();',
        "developer title state refresh",
    )

    BUNDLE.write_text(text, encoding="utf-8")
    print(f"Synchronized {BUNDLE} ({len(text):,} bytes)")


if __name__ == "__main__":
    main()
