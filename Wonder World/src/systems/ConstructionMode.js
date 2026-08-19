import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { SpotLight } from "@babylonjs/core/Lights/spotLight";
import { GizmoManager } from "@babylonjs/core/Gizmos/gizmoManager";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { Ray } from "@babylonjs/core/Culling/ray";
const STORAGE_KEY = "atracao-final-construction-layout-v2";
const DEG = Math.PI / 180;
export class ConstructionMode {
    active = false;
    scene;
    canvas;
    player;
    materials;
    interaction;
    inventory;
    fire;
    getItemCatalog;
    callbacks;
    gizmos;
    custom = new Map();
    nodeByKey = new Map();
    canonicalByNodeId = new Map();
    lightHelpers = new Map();
    lightKeyById = new Map();
    lightByKey = new Map();
    mapByKey = new Map();
    originalTransforms = new Map();
    layout = { version: 2, modified: {}, added: [] };
    selected = null;
    selectedKey = null;
    selectedCustomId = null;
    mode = "position";
    history = [];
    future = [];
    dragSnapshot = null;
    listSearch = "";
    ui;
    constructor(scene, canvas, player, materials, interaction, inventory, fire, getItemCatalog, callbacks) {
        this.scene = scene;
        this.canvas = canvas;
        this.player = player;
        this.materials = materials;
        this.interaction = interaction;
        this.inventory = inventory;
        this.fire = fire;
        this.getItemCatalog = getItemCatalog;
        this.callbacks = callbacks;
        this.layout = this.loadLayout();
        this.gizmos = new GizmoManager(scene);
        this.gizmos.positionGizmoEnabled = true;
        this.gizmos.rotationGizmoEnabled = false;
        this.gizmos.scaleGizmoEnabled = false;
        this.gizmos.boundingBoxGizmoEnabled = false;
        this.gizmos.usePointerToAttachGizmos = false;
        this.gizmos.clearGizmoOnEmptyPointerEvent = false;
        this.ui = this.createUI();
        this.bindUI();
        this.bindScenePicking();
        this.bindKeyboard();
        this.bindGizmoHistory();
        this.populateLootOptions();
        this.createCustomObjectsFromLayout();
        this.rescanAndApply();
    }
    toggle() {
        this.setActive(!this.active);
    }
    setActive(active) {
        if (this.active === active)
            return;
        this.active = active;
        this.ui.root.classList.toggle("is-open", active);
        this.ui.launcher.classList.toggle("is-active", active);
        this.ui.launcher.textContent = active ? "FECHAR CONSTRUÇÃO · F2" : "MODO CONSTRUÇÃO · F2";
        this.gizmos.attachToNode(null);
        this.selected = null;
        this.selectedKey = null;
        this.selectedCustomId = null;
        this.refreshSelectionUI();
        this.refreshLightHelpers();
        this.callbacks.onActiveChanged(active);
        if (active) {
            this.rescanAndApply();
            this.refreshSceneList();
            this.callbacks.onToast("MODO CONSTRUÇÃO · clique em qualquer objeto para editar", 2400);
        }
        else {
            this.hideLightHelpers();
            this.saveLayout();
        }
    }
    rescanAndApply() {
        const counts = new Map();
        const registered = new Set();
        this.nodeByKey.clear();
        this.canonicalByNodeId.clear();
        this.mapByKey.clear();
        const candidates = [...this.scene.transformNodes, ...this.scene.meshes];
        for (const node of candidates) {
            if (!this.isEditableNode(node))
                continue;
            const canonical = this.resolveLogicalRoot(node);
            if (!canonical || !this.isEditableNode(canonical))
                continue;
            this.canonicalByNodeId.set(node.uniqueId, canonical);
            if (registered.has(canonical.uniqueId))
                continue;
            registered.add(canonical.uniqueId);
            const key = this.ensureEditorKey(canonical, counts);
            this.nodeByKey.set(key, canonical);
            this.mapByKey.set(key, this.resolveMapForNode(canonical));
            if (!this.originalTransforms.has(key))
                this.originalTransforms.set(key, this.captureTransform(canonical));
            const saved = this.layout.modified[key];
            if (saved)
                this.applyTransform(canonical, saved);
        }
        const lightCounts = new Map();
        this.lightKeyById.clear();
        this.lightByKey.clear();
        for (const light of this.scene.lights) {
            if (light.metadata?.constructionEditorLight)
                continue;
            const position = light.getAbsolutePosition?.() ?? light.position ?? Vector3.Zero();
            const base = `Light:${light.name}@${position.x.toFixed(3)},${position.y.toFixed(3)},${position.z.toFixed(3)}`;
            const count = lightCounts.get(base) ?? 0;
            lightCounts.set(base, count + 1);
            const key = count === 0 ? base : `${base}#${count}`;
            this.lightKeyById.set(light.uniqueId, key);
            this.lightByKey.set(key, light);
            this.mapByKey.set(key, this.resolveMapForLight(light));
            const saved = this.layout.modified[key];
            if (saved)
                this.applyLightTransform(light, saved);
        }
        this.applyPendingClones();
        if (this.active) {
            this.refreshSceneList();
            this.refreshLightHelpers();
        }
    }
    update(deltaSeconds) {
        this.updateCustomLights(deltaSeconds);
        if (this.active) {
            this.syncSelectedFromGizmo();
            return;
        }
        this.updateCustomMobs(deltaSeconds);
    }
    handlePrimaryAttack(charged) {
        if (this.active)
            return false;
        const origin = this.player.collider.position;
        const forward = this.player.forward();
        let best = null;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const runtime of this.custom.values()) {
            if (!runtime.mob || runtime.mob.dead || !runtime.root.isEnabled())
                continue;
            const direction = runtime.root.getAbsolutePosition().subtract(origin);
            const distance = direction.length();
            if (distance > (charged ? 3.1 : 2.35))
                continue;
            if (Vector3.Dot(direction.normalize(), forward) < 0.45)
                continue;
            if (distance < bestDistance) {
                best = runtime;
                bestDistance = distance;
            }
        }
        if (!best?.mob)
            return false;
        best.mob.health -= charged ? 55 : 28;
        best.root.scaling.scaleInPlace(0.94);
        window.setTimeout(() => best?.root.scaling.scaleInPlace(1 / 0.94), 90);
        if (best.mob.health <= 0) {
            best.mob.dead = true;
            best.record.properties.dead = true;
            best.root.setEnabled(false);
            this.saveLayout();
            this.callbacks.onToast("CRIATURA ABATIDA", 1300);
        }
        return true;
    }
    resetMobsForRespawn() {
        for (const runtime of this.custom.values()) {
            if (!runtime.mob || runtime.mob.dead)
                continue;
            runtime.root.position.copyFrom(runtime.mob.spawn);
            runtime.mob.damageCooldown = 0;
        }
    }
    createUI() {
        const launcher = document.createElement("button");
        launcher.id = "construction-launcher";
        launcher.type = "button";
        launcher.textContent = "MODO CONSTRUÇÃO · F2";
        document.body.appendChild(launcher);
        const root = document.createElement("div");
        root.id = "construction-editor";
        root.innerHTML = `
      <div class="construction-editor__header">
        <div><strong>MODO CONSTRUÇÃO</strong><span>editor completo da cena</span></div>
        <button type="button" data-editor-action="close" aria-label="Fechar">×</button>
      </div>
      <div class="construction-editor__toolbar">
        <button type="button" data-editor-mode="position" class="is-active">Mover <kbd>W</kbd></button>
        <button type="button" data-editor-mode="rotation">Rotacionar <kbd>E</kbd></button>
        <button type="button" data-editor-mode="scale">Escala <kbd>R</kbd></button>
      </div>
      <div class="construction-editor__scroll">
        <section>
          <h3>Adicionar objeto</h3>
          <label>Tipo<select id="construction-catalog"></select></label>
          <label>Conteúdo / item<select id="construction-loot"></select></label>
          <button type="button" class="construction-editor__primary" data-editor-action="add">Adicionar na frente do jogador</button>
        </section>
        <section>
          <h3>Objeto selecionado</h3>
          <p id="construction-selected">Nenhum objeto selecionado</p>
          <label>Nome<input id="construction-name" type="text" autocomplete="off"></label>
          <div class="construction-editor__row construction-editor__actions">
            <button type="button" data-editor-action="parent">Selecionar pai</button>
            <button type="button" data-editor-action="duplicate">Duplicar</button>
            <button type="button" data-editor-action="delete">Excluir</button>
          </div>
          <div class="construction-editor__grid-label">Posição</div>
          <div class="construction-editor__grid"><input id="construction-px" type="number" step="0.1"><input id="construction-py" type="number" step="0.1"><input id="construction-pz" type="number" step="0.1"></div>
          <div class="construction-editor__grid-label">Rotação em graus</div>
          <div class="construction-editor__grid"><input id="construction-rx" type="number" step="1"><input id="construction-ry" type="number" step="1"><input id="construction-rz" type="number" step="1"></div>
          <div class="construction-editor__grid-label">Escala</div>
          <div class="construction-editor__grid"><input id="construction-sx" type="number" step="0.05"><input id="construction-sy" type="number" step="0.05"><input id="construction-sz" type="number" step="0.05"></div>
          <div id="construction-properties"></div>
        </section>
        <section>
          <h3>Encaixe</h3>
          <label class="construction-editor__check"><input id="construction-snap" type="checkbox" checked> Usar snap</label>
          <div class="construction-editor__grid"><label>Mov.<input id="construction-snap-move" type="number" value="0.25" min="0" step="0.05"></label><label>Rot.<input id="construction-snap-rotate" type="number" value="15" min="0" step="1"></label><label>Esc.<input id="construction-snap-scale" type="number" value="0.1" min="0" step="0.05"></label></div>
        </section>
        <section>
          <h3>Objetos da cena</h3>
          <input id="construction-search" type="search" aria-label="Buscar parede, porta ou luz">
          <select id="construction-scene-list" size="8"></select>
        </section>
        <section>
          <h3>Layout</h3>
          <div class="construction-editor__row construction-editor__actions">
            <button type="button" data-editor-action="undo">Desfazer</button>
            <button type="button" data-editor-action="redo">Refazer</button>
            <button type="button" data-editor-action="save">Salvar</button>
          </div>
          <div class="construction-editor__row construction-editor__actions">
            <button type="button" data-editor-action="export">Exportar todos os mapas (.json)</button>
            <button type="button" data-editor-action="import">Importar mapas (.json)</button>
            <button type="button" data-editor-action="reset">Restaurar original</button>
          </div>
          <input id="construction-file" type="file" accept="application/json,.json" hidden>
          <p id="construction-status">Alterações são salvas neste navegador e podem ser exportadas em um único JSON.</p>
        </section>
      </div>
      <div class="construction-editor__footer">F2 fecha · clique seleciona · Delete exclui · Ctrl+D duplica · Ctrl+Z/Y desfaz/refaz</div>
    `;
        document.body.appendChild(root);
        const byId = (id) => {
            const element = document.getElementById(id);
            if (!element)
                throw new Error(`Elemento do editor não encontrado: ${id}`);
            return element;
        };
        const catalog = byId("construction-catalog");
        const entries = [
            ["floor", "Piso / laje"], ["wall", "Parede"], ["ceiling", "Teto"], ["door", "Porta funcional"],
            ["chest", "Baú oco"], ["cabinet", "Armário oco"], ["crate", "Caixote"], ["barrel", "Barril"],
            ["point-light", "Luz pontual"], ["spot-light", "Holofote"], ["flicker-light", "Lâmpada piscando"],
            ["item", "Item coletável"], ["checkpoint", "Checkpoint"], ["mob-plush", "Mob de pelúcia"],
            ["mob-mannequin", "Mob manequim"], ["mob-creature", "Mob criatura"]
        ];
        for (const [value, label] of entries)
            catalog.add(new Option(label, value));
        return {
            root,
            launcher,
            objectName: byId("construction-name"),
            selectedLabel: byId("construction-selected"),
            sceneSearch: byId("construction-search"),
            sceneList: byId("construction-scene-list"),
            catalog,
            loot: byId("construction-loot"),
            snap: byId("construction-snap"),
            snapMove: byId("construction-snap-move"),
            snapRotate: byId("construction-snap-rotate"),
            snapScale: byId("construction-snap-scale"),
            px: byId("construction-px"), py: byId("construction-py"), pz: byId("construction-pz"),
            rx: byId("construction-rx"), ry: byId("construction-ry"), rz: byId("construction-rz"),
            sx: byId("construction-sx"), sy: byId("construction-sy"), sz: byId("construction-sz"),
            propertyPanel: byId("construction-properties"),
            status: byId("construction-status"),
            file: byId("construction-file")
        };
    }
    bindUI() {
        this.ui.launcher.addEventListener("click", () => this.toggle());
        this.ui.root.querySelectorAll("[data-editor-action]").forEach((button) => {
            button.addEventListener("click", () => this.handleAction(button.dataset.editorAction ?? ""));
        });
        this.ui.root.querySelectorAll("[data-editor-mode]").forEach((button) => {
            button.addEventListener("click", () => this.setMode(button.dataset.editorMode));
        });
        this.ui.sceneSearch.addEventListener("input", () => {
            this.listSearch = this.ui.sceneSearch.value.trim().toLowerCase();
            this.refreshSceneList();
        });
        this.ui.sceneList.addEventListener("change", () => {
            const key = this.ui.sceneList.value;
            if (key.startsWith("custom:"))
                this.selectCustom(key.slice(7));
            else if (key.startsWith("light:"))
                this.selectLight(Number(key.slice(6)));
            else
                this.selectNode(this.nodeByKey.get(key) ?? null);
        });
        this.ui.objectName.addEventListener("change", () => {
            if (!this.selected)
                return;
            this.pushHistory();
            this.selected.name = this.ui.objectName.value.trim() || this.selected.name;
            if (this.selectedCustomId) {
                const runtime = this.custom.get(this.selectedCustomId);
                if (runtime)
                    runtime.record.name = this.selected.name;
            }
            this.commitSelectedTransform();
            this.refreshSceneList();
        });
        const transformInputs = [this.ui.px, this.ui.py, this.ui.pz, this.ui.rx, this.ui.ry, this.ui.rz, this.ui.sx, this.ui.sy, this.ui.sz];
        transformInputs.forEach((input) => input.addEventListener("change", () => this.applyTransformInputs()));
        [this.ui.snap, this.ui.snapMove, this.ui.snapRotate, this.ui.snapScale].forEach((input) => input.addEventListener("change", () => this.applySnap()));
        this.ui.catalog.addEventListener("change", () => this.updateCatalogPropertyVisibility());
        this.ui.file.addEventListener("change", () => void this.importSelectedFile());
        this.applySnap();
        this.updateCatalogPropertyVisibility();
    }
    bindScenePicking() {
        this.scene.onPointerObservable.add((info) => {
            if (!this.active || info.type !== PointerEventTypes.POINTERDOWN)
                return;
            const event = info.event;
            if (event.button !== 0 || this.ui.root.contains(event.target) || this.ui.launcher.contains(event.target))
                return;
            const picked = info.pickInfo?.pickedMesh;
            if (!picked) {
                this.selectNode(null);
                return;
            }
            const lightId = Number(picked.metadata?.editorLightId ?? 0);
            if (lightId) {
                this.selectLight(lightId);
                return;
            }
            const customId = this.findCustomId(picked);
            if (customId)
                this.selectCustom(customId);
            else
                this.selectNode(this.resolveLogicalRoot(picked));
        });
    }
    bindKeyboard() {
        window.addEventListener("keydown", (event) => {
            if (event.code === "F2" && !event.repeat) {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.toggle();
                return;
            }
            if (!this.active)
                return;
            const target = event.target;
            const editingText = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement;
            if (event.code === "Escape") {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.setActive(false);
                return;
            }
            if (editingText)
                return;
            if (event.code === "KeyW")
                this.setMode("position");
            else if (event.code === "KeyE")
                this.setMode("rotation");
            else if (event.code === "KeyR")
                this.setMode("scale");
            else if (event.code === "Delete")
                this.handleAction("delete");
            else if (event.code === "KeyD" && event.ctrlKey)
                this.handleAction("duplicate");
            else if (event.code === "KeyZ" && event.ctrlKey)
                this.undo();
            else if (event.code === "KeyY" && event.ctrlKey)
                this.redo();
            else
                return;
            event.preventDefault();
            event.stopImmediatePropagation();
        }, { capture: true });
    }
    bindGizmoHistory() {
        const gizmos = this.gizmos.gizmos;
        const all = [gizmos.positionGizmo, gizmos.rotationGizmo, gizmos.scaleGizmo].filter(Boolean);
        for (const gizmo of all) {
            gizmo.onDragStartObservable?.add(() => {
                if (this.selected)
                    this.dragSnapshot = this.cloneLayout(this.layout);
            });
            gizmo.onDragEndObservable?.add(() => {
                if (!this.selected || !this.dragSnapshot)
                    return;
                this.history.push(this.dragSnapshot);
                this.history = this.history.slice(-60);
                this.future = [];
                this.dragSnapshot = null;
                this.commitSelectedTransform();
            });
        }
    }
    handleAction(action) {
        if (action === "close")
            this.setActive(false);
        else if (action === "add")
            this.addSelectedCatalogObject();
        else if (action === "delete")
            this.deleteSelected();
        else if (action === "duplicate")
            this.duplicateSelected();
        else if (action === "parent")
            this.selectParent();
        else if (action === "undo")
            this.undo();
        else if (action === "redo")
            this.redo();
        else if (action === "save") {
            this.saveLayout();
            this.setStatus("Layout salvo neste navegador.");
        }
        else if (action === "export")
            this.exportLayout();
        else if (action === "import")
            this.ui.file.click();
        else if (action === "reset")
            this.resetLayout();
    }
    setMode(mode) {
        this.mode = mode;
        this.gizmos.positionGizmoEnabled = mode === "position";
        this.gizmos.rotationGizmoEnabled = mode === "rotation";
        this.gizmos.scaleGizmoEnabled = mode === "scale";
        this.ui.root.querySelectorAll("[data-editor-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.editorMode === mode));
        if (this.selected)
            this.gizmos.attachToNode(this.selected);
        this.applySnap();
    }
    applySnap() {
        const enabled = this.ui.snap.checked;
        const gizmos = this.gizmos.gizmos;
        if (gizmos.positionGizmo)
            gizmos.positionGizmo.snapDistance = enabled ? Math.max(0, Number(this.ui.snapMove.value) || 0.25) : 0;
        if (gizmos.rotationGizmo)
            gizmos.rotationGizmo.snapDistance = enabled ? Math.max(0, Number(this.ui.snapRotate.value) || 15) * DEG : 0;
        if (gizmos.scaleGizmo)
            gizmos.scaleGizmo.snapDistance = enabled ? Math.max(0, Number(this.ui.snapScale.value) || 0.1) : 0;
    }
    populateLootOptions() {
        this.ui.loot.replaceChildren(new Option("Sem item", ""));
        const catalog = Object.values(this.getItemCatalog()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        for (const item of catalog)
            this.ui.loot.add(new Option(item.name, item.id));
        if (!catalog.some((item) => item.id === "fuelCan"))
            this.ui.loot.add(new Option("Galão de combustível", "fuelCan"));
    }
    updateCatalogPropertyVisibility() {
        const type = this.ui.catalog.value;
        this.ui.loot.parentElement?.classList.toggle("is-hidden", !["chest", "cabinet", "item"].includes(type));
    }
    addSelectedCatalogObject() {
        const type = this.ui.catalog.value;
        const position = this.spawnPositionFor(type);
        const id = this.newId(type);
        const record = {
            id,
            type,
            name: this.defaultName(type),
            position: [position.x, position.y, position.z],
            rotation: [0, 0, 0],
            scaling: [1, 1, 1],
            map: this.currentMapId(),
            properties: {
                lootId: this.ui.loot.value,
                looted: false,
                open: false,
                intensity: type.includes("light") ? 3.2 : undefined,
                color: type.includes("light") ? "#ffb36b" : undefined,
                dead: false
            }
        };
        this.pushHistory();
        this.layout.added.push(record);
        const runtime = this.createCustomObject(record);
        this.custom.set(id, runtime);
        this.saveLayout();
        this.selectCustom(id);
        this.refreshSceneList();
    }
    spawnPositionFor(type) {
        const base = this.player.collider.position.add(this.player.forward().scale(4));
        const floorY = Math.max(0, this.player.collider.position.y - 0.92);
        if (type === "wall" || type === "door")
            return new Vector3(base.x, floorY, base.z);
        if (type === "ceiling")
            return new Vector3(base.x, floorY + 3.2, base.z);
        if (type.includes("light"))
            return new Vector3(base.x, floorY + 2.8, base.z);
        return new Vector3(base.x, floorY, base.z);
    }
    defaultName(type) {
        const names = {
            floor: "Piso", wall: "Parede", ceiling: "Teto", door: "Porta", chest: "Baú", cabinet: "Armário",
            crate: "Caixote", barrel: "Barril", "point-light": "Luz pontual", "spot-light": "Holofote",
            "flicker-light": "Lâmpada instável", item: "Item", checkpoint: "Checkpoint", "mob-plush": "Criatura de pelúcia",
            "mob-mannequin": "Manequim", "mob-creature": "Criatura", clone: "Cópia"
        };
        return names[type];
    }
    createCustomObjectsFromLayout() {
        for (const record of this.layout.added) {
            if (this.custom.has(record.id))
                continue;
            const runtime = this.createCustomObject(record);
            this.custom.set(record.id, runtime);
        }
    }
    createCustomObject(record) {
        const root = new TransformNode(`editor-root-${record.id}`, this.scene);
        root.position = Vector3.FromArray(record.position);
        root.rotation = Vector3.FromArray(record.rotation);
        root.scaling = Vector3.FromArray(record.scaling);
        root.metadata = { ...(root.metadata ?? {}), editorObjectId: record.id, editorCustom: true };
        const runtime = { record, root, nodes: [], interactions: [] };
        const node = (mesh) => {
            mesh.parent = root;
            mesh.metadata = { ...(mesh.metadata ?? {}), editorObjectId: record.id, editorCustom: true };
            mesh.isPickable = true;
            runtime.nodes.push(mesh);
            return mesh;
        };
        const solid = (name, width, height, depth, position, kind = "metal", collisions = true) => {
            const mesh = node(MeshBuilder.CreateBox(`${name}-${record.id}`, { width, height, depth }, this.scene));
            mesh.position.copyFrom(position);
            mesh.material = kind === "concrete" ? this.materials.floor("concrete", 2) : this.materials.get(kind, 2);
            mesh.checkCollisions = collisions;
            return mesh;
        };
        if (record.type === "floor") {
            solid("editor-floor", 6, 0.28, 6, new Vector3(0, -0.14, 0), "concrete");
        }
        else if (record.type === "wall") {
            solid("editor-wall", 6, 3.2, 0.28, new Vector3(0, 1.6, 0), "concrete");
        }
        else if (record.type === "ceiling") {
            solid("editor-ceiling", 6, 0.22, 6, Vector3.Zero(), "concrete");
        }
        else if (record.type === "crate") {
            solid("editor-crate", 1.35, 1.25, 1.35, new Vector3(0, 0.625, 0), "wood");
        }
        else if (record.type === "barrel") {
            const barrel = node(MeshBuilder.CreateCylinder(`editor-barrel-${record.id}`, { height: 1.55, diameter: 0.9, tessellation: 16 }, this.scene));
            barrel.position.y = 0.775;
            barrel.material = this.materials.get("metal", 4);
            barrel.checkCollisions = true;
        }
        else if (record.type === "door") {
            this.buildDoor(runtime, solid, node);
        }
        else if (record.type === "chest") {
            this.buildChest(runtime, solid, node);
        }
        else if (record.type === "cabinet") {
            this.buildCabinet(runtime, solid, node);
        }
        else if (["point-light", "spot-light", "flicker-light"].includes(record.type)) {
            this.buildLight(runtime, node);
        }
        else if (record.type === "item") {
            this.buildItem(runtime, node);
        }
        else if (record.type === "checkpoint") {
            this.buildCheckpoint(runtime, node);
        }
        else if (record.type.startsWith("mob-")) {
            this.buildMob(runtime, node);
        }
        else if (record.type === "clone") {
            this.buildClone(runtime);
        }
        return runtime;
    }
    buildDoor(runtime, solid, node) {
        const { record, root } = runtime;
        solid("door-frame-left", 0.24, 3.15, 0.42, new Vector3(-1.62, 1.575, 0), "metal");
        solid("door-frame-right", 0.24, 3.15, 0.42, new Vector3(1.62, 1.575, 0), "metal");
        solid("door-frame-top", 3.48, 0.24, 0.42, new Vector3(0, 3.03, 0), "metal");
        const hinge = new TransformNode(`door-hinge-${record.id}`, this.scene);
        hinge.parent = root;
        hinge.position = new Vector3(-1.48, 0, 0);
        hinge.metadata = { editorObjectId: record.id, editorCustom: true };
        runtime.nodes.push(hinge);
        const leaf = node(MeshBuilder.CreateBox(`door-leaf-${record.id}`, { width: 2.95, height: 2.82, depth: 0.18 }, this.scene));
        leaf.parent = hinge;
        leaf.position = new Vector3(1.475, 1.43, 0);
        leaf.material = this.materials.get("metal", 6);
        const apply = () => {
            const open = Boolean(record.properties.open);
            hinge.rotation.y = open ? -Math.PI * 0.52 : 0;
            leaf.checkCollisions = !open;
        };
        apply();
        this.interaction.register(leaf, {
            prompt: () => Boolean(record.properties.open) ? "Fechar porta" : "Abrir porta",
            maxDistance: 3.2,
            ignoreLineOfSight: true,
            excludeFromGuide: true,
            onInteract: () => {
                record.properties.open = !Boolean(record.properties.open);
                apply();
                this.saveLayout();
            }
        });
        runtime.interactions.push(leaf);
    }
    buildChest(runtime, solid, node) {
        const { record, root } = runtime;
        solid("chest-bottom", 1.8, 0.12, 1.12, new Vector3(0, 0.08, 0), "wood");
        solid("chest-back", 1.8, 0.72, 0.12, new Vector3(0, 0.42, 0.5), "wood");
        solid("chest-left", 0.12, 0.72, 1.0, new Vector3(-0.84, 0.42, 0), "wood");
        solid("chest-right", 0.12, 0.72, 1.0, new Vector3(0.84, 0.42, 0), "wood");
        const front = solid("chest-front", 1.8, 0.72, 0.12, new Vector3(0, 0.42, -0.5), "wood");
        const hinge = new TransformNode(`chest-hinge-${record.id}`, this.scene);
        hinge.parent = root;
        hinge.position = new Vector3(0, 0.8, 0.5);
        hinge.metadata = { editorObjectId: record.id, editorCustom: true };
        runtime.nodes.push(hinge);
        const lid = node(MeshBuilder.CreateBox(`chest-lid-${record.id}`, { width: 1.86, height: 0.14, depth: 1.14 }, this.scene));
        lid.parent = hinge;
        lid.position = new Vector3(0, 0, -0.57);
        lid.material = this.materials.get("wood", 3);
        const apply = () => { hinge.rotation.x = Boolean(record.properties.open) ? -Math.PI * 0.62 : 0; };
        apply();
        this.interaction.register(front, {
            prompt: () => this.containerPrompt(record, "baú"),
            maxDistance: 3,
            ignoreLineOfSight: true,
            excludeFromGuide: true,
            onInteract: () => {
                if (!record.properties.open) {
                    record.properties.open = true;
                    apply();
                }
                else if (!record.properties.looted && String(record.properties.lootId ?? "")) {
                    this.collectConfiguredLoot(record);
                }
                else {
                    record.properties.open = false;
                    apply();
                }
                this.saveLayout();
            }
        });
        runtime.interactions.push(front);
    }
    buildCabinet(runtime, solid, node) {
        const { record, root } = runtime;
        solid("cabinet-back", 2.15, 3.1, 0.14, new Vector3(0, 1.55, 0.45), "metal");
        solid("cabinet-left", 0.14, 3.1, 0.9, new Vector3(-1, 1.55, 0), "metal");
        solid("cabinet-right", 0.14, 3.1, 0.9, new Vector3(1, 1.55, 0), "metal");
        solid("cabinet-top", 2.15, 0.14, 0.9, new Vector3(0, 3.03, 0), "metal");
        solid("cabinet-bottom", 2.15, 0.14, 0.9, new Vector3(0, 0.07, 0), "metal");
        solid("cabinet-shelf", 1.9, 0.08, 0.78, new Vector3(0, 1.45, 0.02), "metal", false);
        const pivots = [];
        const doors = [];
        for (const side of [-1, 1]) {
            const pivot = new TransformNode(`cabinet-pivot-${side}-${record.id}`, this.scene);
            pivot.parent = root;
            pivot.position = new Vector3(side * 0.96, 0, -0.47);
            pivot.metadata = { editorObjectId: record.id, editorCustom: true };
            const door = node(MeshBuilder.CreateBox(`cabinet-door-${side}-${record.id}`, { width: 0.96, height: 2.88, depth: 0.1 }, this.scene));
            door.parent = pivot;
            door.position = new Vector3(-side * 0.48, 1.53, 0);
            door.material = this.materials.get("metal", 5);
            door.checkCollisions = true;
            pivots.push(pivot);
            doors.push(door);
            runtime.nodes.push(pivot);
        }
        const apply = () => {
            const open = Boolean(record.properties.open);
            pivots[0].rotation.y = open ? Math.PI * 0.55 : 0;
            pivots[1].rotation.y = open ? -Math.PI * 0.55 : 0;
            doors.forEach((door) => { door.checkCollisions = !open; });
        };
        apply();
        this.interaction.register(doors[0], {
            prompt: () => this.containerPrompt(record, "armário"),
            maxDistance: 3.1,
            ignoreLineOfSight: true,
            excludeFromGuide: true,
            onInteract: () => {
                if (!record.properties.open) {
                    record.properties.open = true;
                    apply();
                }
                else if (!record.properties.looted && String(record.properties.lootId ?? "")) {
                    this.collectConfiguredLoot(record);
                }
                else {
                    record.properties.open = false;
                    apply();
                }
                this.saveLayout();
            }
        });
        runtime.interactions.push(doors[0]);
    }
    buildLight(runtime, node) {
        const { record, root } = runtime;
        const color = Color3.FromHexString(String(record.properties.color ?? "#ffb36b"));
        const bulb = node(MeshBuilder.CreateSphere(`editor-light-bulb-${record.id}`, { diameter: 0.28, segments: 10 }, this.scene));
        bulb.material = this.materials.emissive(`editor-light-${record.id}`, color, 2.2);
        bulb.isPickable = true;
        if (record.type === "spot-light") {
            const light = new SpotLight(`editor-spot-${record.id}`, Vector3.Zero(), new Vector3(0, -0.25, 1), Math.PI / 3, 2.4, this.scene);
            light.parent = root;
            light.range = 24;
            light.diffuse = color;
            runtime.light = light;
        }
        else {
            const light = new PointLight(`editor-point-${record.id}`, Vector3.Zero(), this.scene);
            light.parent = root;
            light.range = 15;
            light.diffuse = color;
            runtime.light = light;
        }
        runtime.light.intensity = Number(record.properties.intensity ?? 3.2);
    }
    buildItem(runtime, node) {
        const { record } = runtime;
        const lootId = String(record.properties.lootId ?? "fuelCan");
        const item = this.resolveItem(lootId);
        const mesh = lootId.toLowerCase().includes("fuel")
            ? node(MeshBuilder.CreateCylinder(`editor-item-${record.id}`, { height: 0.72, diameter: 0.42, tessellation: 12 }, this.scene))
            : node(MeshBuilder.CreateBox(`editor-item-${record.id}`, { size: 0.48 }, this.scene));
        mesh.position.y = 0.42;
        mesh.material = this.materials.emissive(`editor-item-${record.id}`, new Color3(0.95, 0.42, 0.12), 1.3);
        this.interaction.register(mesh, {
            prompt: () => record.properties.looted ? "Item já coletado" : `Coletar ${item.name}`,
            maxDistance: 3,
            ignoreLineOfSight: true,
            excludeFromGuide: true,
            enabled: () => !record.properties.looted,
            onInteract: () => {
                if (this.inventory.add(item))
                    this.callbacks.onToast(`${item.name} adicionado ao inventário.`, 1700);
                if (lootId.toLowerCase().includes("fuel"))
                    this.fire.addFuel(35);
                record.properties.looted = true;
                mesh.setEnabled(false);
                this.saveLayout();
            }
        });
        runtime.interactions.push(mesh);
        if (record.properties.looted)
            mesh.setEnabled(false);
    }
    buildCheckpoint(runtime, node) {
        const { record, root } = runtime;
        const base = node(MeshBuilder.CreateCylinder(`editor-checkpoint-${record.id}`, { height: 0.22, diameter: 1.4, tessellation: 24 }, this.scene));
        base.position.y = 0.11;
        base.material = this.materials.emissive(`editor-checkpoint-${record.id}`, new Color3(0.12, 0.72, 0.86), 1.8);
        const ring = node(MeshBuilder.CreateTorus(`editor-checkpoint-ring-${record.id}`, { diameter: 1.1, thickness: 0.08, tessellation: 24 }, this.scene));
        ring.position.y = 0.24;
        ring.material = base.material;
        const light = new PointLight(`editor-checkpoint-light-${record.id}`, new Vector3(0, 0.65, 0), this.scene);
        light.parent = root;
        light.diffuse = new Color3(0.12, 0.72, 0.86);
        light.range = 6;
        light.intensity = 1.6;
        runtime.light = light;
        this.interaction.register(base, {
            prompt: "Ativar checkpoint",
            maxDistance: 3,
            ignoreLineOfSight: true,
            excludeFromGuide: true,
            onInteract: () => this.callbacks.onCheckpoint(`editor-${record.id}`, root.getAbsolutePosition())
        });
        runtime.interactions.push(base);
    }
    buildMob(runtime, node) {
        const { record, root } = runtime;
        const mannequin = record.type === "mob-mannequin";
        const plush = record.type === "mob-plush";
        const body = node(MeshBuilder.CreateCapsule(`editor-mob-body-${record.id}`, { height: mannequin ? 2.1 : 1.55, radius: mannequin ? 0.34 : 0.48, tessellation: 10 }, this.scene));
        body.position.y = mannequin ? 1.05 : 0.78;
        body.material = this.materials.get(plush ? "plush" : mannequin ? "plastic" : "burned", 4);
        body.checkCollisions = true;
        const head = node(MeshBuilder.CreateSphere(`editor-mob-head-${record.id}`, { diameter: mannequin ? 0.62 : 0.82, segments: 10 }, this.scene));
        head.position.y = mannequin ? 2.16 : 1.72;
        head.material = body.material;
        const eyeMaterial = this.materials.emissive(`editor-mob-eye-${record.id}`, plush ? new Color3(0.95, 0.08, 0.03) : new Color3(0.55, 0.75, 1), 1.8);
        for (const side of [-1, 1]) {
            const eye = node(MeshBuilder.CreateSphere(`editor-mob-eye-${side}-${record.id}`, { diameter: 0.09, segments: 6 }, this.scene));
            eye.parent = head;
            eye.position = new Vector3(side * 0.14, 0.06, -0.35);
            eye.material = eyeMaterial;
            eye.isPickable = false;
        }
        runtime.mob = {
            health: Number(record.properties.health ?? (mannequin ? 90 : 70)),
            maxHealth: Number(record.properties.health ?? (mannequin ? 90 : 70)),
            speed: Number(record.properties.speed ?? (mannequin ? 1.35 : 1.8)),
            damageCooldown: 0,
            spawn: root.position.clone(),
            dead: Boolean(record.properties.dead)
        };
        if (runtime.mob.dead)
            root.setEnabled(false);
    }
    buildClone(runtime) {
        const sourceKey = String(runtime.record.properties.sourceKey ?? "");
        const source = this.nodeByKey.get(sourceKey);
        if (!source?.clone)
            return;
        const clone = source.clone(`editor-clone-${runtime.record.id}`, runtime.root, false);
        if (clone) {
            clone.position.setAll?.(0);
            clone.rotation?.setAll?.(0);
            clone.scaling?.setAll?.(1);
            clone.metadata = { ...(clone.metadata ?? {}), editorObjectId: runtime.record.id, editorCustom: true };
            runtime.nodes.push(clone);
        }
    }
    applyPendingClones() {
        for (const runtime of this.custom.values()) {
            if (runtime.record.type !== "clone" || runtime.nodes.length > 0)
                continue;
            this.buildClone(runtime);
        }
    }
    containerPrompt(record, label) {
        if (!record.properties.open)
            return `Abrir ${label}`;
        if (!record.properties.looted && String(record.properties.lootId ?? ""))
            return `Pegar item do ${label}`;
        return `Fechar ${label}`;
    }
    collectConfiguredLoot(record) {
        const id = String(record.properties.lootId ?? "");
        if (!id)
            return;
        const item = this.resolveItem(id);
        if (this.inventory.add(item))
            this.callbacks.onToast(`${item.name} encontrado.`, 1800);
        if (id.toLowerCase().includes("fuel"))
            this.fire.addFuel(35);
        record.properties.looted = true;
    }
    resolveItem(id) {
        const fromCatalog = this.getItemCatalog()[id];
        if (fromCatalog)
            return fromCatalog;
        if (id.toLowerCase().includes("fuel"))
            return { id: "fuelCan", name: "Galão de combustível", description: "Combustível para manter a tocha acesa." };
        return { id, name: id || "Item", description: "Item adicionado pelo modo construção." };
    }
    updateCustomLights(_deltaSeconds) {
        const now = performance.now() * 0.001;
        for (const runtime of this.custom.values()) {
            if (!runtime.light)
                continue;
            const intensity = Number(runtime.record.properties.intensity ?? 3.2);
            runtime.light.intensity = runtime.record.type === "flicker-light"
                ? intensity * (0.72 + Math.random() * 0.28) * (Math.sin(now * 1.7 + runtime.record.id.length) > 0.94 ? 0.28 : 1)
                : intensity;
        }
    }
    updateCustomMobs(deltaSeconds) {
        const playerPosition = this.player.collider.position;
        for (const runtime of this.custom.values()) {
            const mob = runtime.mob;
            if (!mob || mob.dead || !runtime.root.isEnabled())
                continue;
            mob.damageCooldown = Math.max(0, mob.damageCooldown - deltaSeconds);
            const position = runtime.root.position;
            const toPlayer = playerPosition.subtract(position);
            const distance = toPlayer.length();
            if (distance > 24 || distance < 0.001)
                continue;
            const direction = toPlayer.normalize();
            const repelled = this.fire.isTorchThreatNear(position);
            const speed = mob.speed * (repelled ? -2.35 : distance < 1.2 ? 0 : 1);
            const movement = direction.scale(speed * deltaSeconds);
            movement.y = 0;
            this.moveCustomMobSafely(runtime, movement);
            runtime.root.rotation.y = Math.atan2(direction.x, direction.z);
            if (!repelled && distance < 1.25 && mob.damageCooldown <= 0) {
                this.player.damage(10);
                mob.damageCooldown = 1.15;
                if (this.player.health <= 0)
                    this.callbacks.onPlayerDeath();
            }
        }
    }
    moveCustomMobSafely(runtime, movement) {
        const horizontal = movement.clone();
        horizontal.y = 0;
        if (horizontal.lengthSquared() < 0.000001)
            return false;
        const canMove = (delta) => {
            const distance = delta.length();
            if (distance < 0.0001)
                return true;
            const direction = delta.scale(1 / distance);
            const side = new Vector3(-direction.z, 0, direction.x).scale(0.38);
            const base = runtime.root.position.add(new Vector3(0, 0.78, 0));
            const origins = [base, base.add(side), base.subtract(side)];
            return origins.every((origin) => {
                const pick = this.scene.pickWithRay(new Ray(origin, direction, distance + 0.46), (mesh) => {
                    if (!mesh.checkCollisions || !mesh.isEnabled() || mesh === this.player.collider)
                        return false;
                    return mesh.metadata?.editorObjectId !== runtime.record.id;
                });
                return !pick?.hit || pick.distance > distance + 0.34;
            });
        };
        if (canMove(horizontal)) {
            runtime.root.position.addInPlace(horizontal);
            return true;
        }
        const axes = [new Vector3(horizontal.x, 0, 0), new Vector3(0, 0, horizontal.z)]
            .sort((a, b) => b.lengthSquared() - a.lengthSquared());
        let moved = false;
        for (const axis of axes) {
            if (axis.lengthSquared() > 0.000001 && canMove(axis)) {
                runtime.root.position.addInPlace(axis);
                moved = true;
            }
        }
        return moved;
    }
    selectNode(node) {
        const resolved = node ? this.resolveLogicalRoot(node) : null;
        if (!resolved || !this.isEditableNode(resolved)) {
            this.selected = null;
            this.selectedKey = null;
            this.selectedCustomId = null;
            this.gizmos.attachToNode(null);
            this.refreshSelectionUI();
            return;
        }
        const customId = this.findCustomId(resolved);
        if (customId) {
            this.selectCustom(customId);
            return;
        }
        this.selected = resolved;
        this.selectedKey = String(resolved.metadata?.editorKey ?? "");
        this.selectedCustomId = null;
        this.gizmos.attachToNode(resolved);
        this.refreshSelectionUI();
    }
    selectCustom(id) {
        const runtime = this.custom.get(id);
        if (!runtime)
            return;
        this.selected = runtime.root;
        this.selectedCustomId = id;
        this.selectedKey = null;
        this.gizmos.attachToNode(runtime.root);
        this.refreshSelectionUI();
    }
    selectLight(uniqueId) {
        const helper = this.lightHelpers.get(uniqueId);
        const key = this.lightKeyById.get(uniqueId);
        if (!helper || !key)
            return;
        this.selected = helper;
        this.selectedKey = key;
        this.selectedCustomId = null;
        this.gizmos.attachToNode(helper);
        this.refreshSelectionUI();
    }
    selectParent() {
        if (!this.selected?.parent || this.selectedCustomId)
            return;
        this.selectNode(this.selected.parent);
    }
    duplicateSelected() {
        if (!this.selected)
            return;
        this.pushHistory();
        if (this.selectedCustomId) {
            const source = this.custom.get(this.selectedCustomId);
            if (!source)
                return;
            const record = this.cloneRecord(source.record);
            record.id = this.newId(source.record.type);
            record.name = `${source.record.name} (cópia)`;
            record.position[0] += 1;
            record.position[2] += 1;
            record.map = this.normalizeMapId(record.map ?? this.currentMapId());
            this.layout.added.push(record);
            const runtime = this.createCustomObject(record);
            this.custom.set(record.id, runtime);
            this.selectCustom(record.id);
        }
        else if (this.selectedKey) {
            const state = this.captureTransform(this.selected);
            const record = {
                id: this.newId("clone"), type: "clone", name: `${this.selected.name} (cópia)`,
                position: [state.position[0] + 1, state.position[1], state.position[2] + 1],
                rotation: [...state.rotation], scaling: [...state.scaling], map: this.mapForKey(this.selectedKey, state), properties: { sourceKey: this.selectedKey }
            };
            this.layout.added.push(record);
            const runtime = this.createCustomObject(record);
            this.custom.set(record.id, runtime);
            this.selectCustom(record.id);
        }
        this.saveLayout();
        this.refreshSceneList();
    }
    deleteSelected() {
        if (!this.selected)
            return;
        this.pushHistory();
        if (this.selectedCustomId) {
            const id = this.selectedCustomId;
            this.disposeCustomRuntime(id);
            this.layout.added = this.layout.added.filter((record) => record.id !== id);
        }
        else if (this.selectedKey) {
            const state = this.captureTransform(this.selected);
            state.deleted = true;
            this.layout.modified[this.selectedKey] = state;
            this.selected.setEnabled?.(false);
            const light = this.lightByKey.get(this.selectedKey);
            if (light)
                light.setEnabled?.(false);
        }
        this.selectNode(null);
        this.saveLayout();
        this.refreshSceneList();
    }
    applyTransformInputs() {
        if (!this.selected)
            return;
        this.pushHistory();
        this.selected.position.set(this.number(this.ui.px, 0), this.number(this.ui.py, 0), this.number(this.ui.pz, 0));
        this.selected.rotation.set(this.number(this.ui.rx, 0) * DEG, this.number(this.ui.ry, 0) * DEG, this.number(this.ui.rz, 0) * DEG);
        this.selected.scaling.set(Math.max(0.02, this.number(this.ui.sx, 1)), Math.max(0.02, this.number(this.ui.sy, 1)), Math.max(0.02, this.number(this.ui.sz, 1)));
        this.commitSelectedTransform();
    }
    syncSelectedFromGizmo() {
        if (!this.selected)
            return;
        this.fillTransformInputs(this.selected);
    }
    commitSelectedTransform() {
        if (!this.selected)
            return;
        if (this.selectedCustomId) {
            const runtime = this.custom.get(this.selectedCustomId);
            if (runtime)
                Object.assign(runtime.record, this.captureTransform(runtime.root));
        }
        else if (this.selectedKey) {
            const state = this.captureTransform(this.selected);
            state.map = this.mapForKey(this.selectedKey, state);
            this.layout.modified[this.selectedKey] = state;
            if (this.selected.metadata?.editorLightId) {
                const light = this.lightByKey.get(this.selectedKey);
                if (light)
                    this.applyLightTransform(light, state);
            }
        }
        this.saveLayout();
        this.refreshSelectionUI();
    }
    refreshSelectionUI() {
        const disabled = !this.selected;
        const inputs = [this.ui.objectName, this.ui.px, this.ui.py, this.ui.pz, this.ui.rx, this.ui.ry, this.ui.rz, this.ui.sx, this.ui.sy, this.ui.sz];
        inputs.forEach((input) => { input.disabled = disabled; });
        if (!this.selected) {
            this.ui.selectedLabel.textContent = "Nenhum objeto selecionado";
            this.ui.objectName.value = "";
            this.ui.propertyPanel.replaceChildren();
            return;
        }
        this.ui.selectedLabel.textContent = this.selectedCustomId
            ? `Objeto adicionado · ${this.custom.get(this.selectedCustomId)?.record.type ?? "objeto"}`
            : `Objeto original completo · ${this.selected.getClassName?.() ?? "nó"}`;
        this.ui.objectName.value = this.selected.name ?? "Objeto";
        this.fillTransformInputs(this.selected);
        this.renderCustomProperties();
    }
    fillTransformInputs(node) {
        const position = node.position ?? Vector3.Zero();
        const rotation = node.rotation ?? Vector3.Zero();
        const scaling = node.scaling ?? Vector3.One();
        this.ui.px.value = position.x.toFixed(2);
        this.ui.py.value = position.y.toFixed(2);
        this.ui.pz.value = position.z.toFixed(2);
        this.ui.rx.value = (rotation.x / DEG).toFixed(1);
        this.ui.ry.value = (rotation.y / DEG).toFixed(1);
        this.ui.rz.value = (rotation.z / DEG).toFixed(1);
        this.ui.sx.value = scaling.x.toFixed(2);
        this.ui.sy.value = scaling.y.toFixed(2);
        this.ui.sz.value = scaling.z.toFixed(2);
    }
    renderCustomProperties() {
        this.ui.propertyPanel.replaceChildren();
        if (!this.selectedCustomId)
            return;
        const runtime = this.custom.get(this.selectedCustomId);
        if (!runtime)
            return;
        const record = runtime.record;
        if (["chest", "cabinet", "item"].includes(record.type)) {
            const label = document.createElement("label");
            label.textContent = "Item / conteúdo";
            const select = this.ui.loot.cloneNode(true);
            select.id = "";
            select.value = String(record.properties.lootId ?? "");
            select.addEventListener("change", () => {
                this.pushHistory();
                record.properties.lootId = select.value;
                record.properties.looted = false;
                this.saveLayout();
            });
            label.appendChild(select);
            this.ui.propertyPanel.appendChild(label);
        }
        if (record.type.includes("light")) {
            const intensity = document.createElement("input");
            intensity.type = "number";
            intensity.min = "0";
            intensity.max = "30";
            intensity.step = "0.1";
            intensity.value = String(record.properties.intensity ?? 3.2);
            const label = document.createElement("label");
            label.textContent = "Intensidade da luz";
            label.appendChild(intensity);
            intensity.addEventListener("change", () => {
                this.pushHistory();
                record.properties.intensity = Math.max(0, Number(intensity.value) || 0);
                this.saveLayout();
            });
            this.ui.propertyPanel.appendChild(label);
        }
    }
    refreshSceneList() {
        const selectedValue = this.ui.sceneList.value;
        this.ui.sceneList.replaceChildren();
        const query = this.listSearch;
        const options = [];
        for (const [key, node] of this.nodeByKey) {
            const label = `${node.name || "objeto"} · ${node.getClassName?.() ?? "Node"}`;
            if (!query || label.toLowerCase().includes(query))
                options.push({ value: key, label });
        }
        for (const [id, runtime] of this.custom) {
            const label = `★ ${runtime.record.name} · ${runtime.record.type}`;
            if (!query || label.toLowerCase().includes(query))
                options.push({ value: `custom:${id}`, label });
        }
        for (const light of this.scene.lights) {
            if (light.metadata?.constructionEditorLight)
                continue;
            const label = `☼ ${light.name} · luz`;
            if (!query || label.toLowerCase().includes(query))
                options.push({ value: `light:${light.uniqueId}`, label });
        }
        options.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
        for (const option of options.slice(0, 600))
            this.ui.sceneList.add(new Option(option.label, option.value));
        if ([...this.ui.sceneList.options].some((option) => option.value === selectedValue))
            this.ui.sceneList.value = selectedValue;
    }
    refreshLightHelpers() {
        if (!this.active)
            return;
        for (const light of this.scene.lights) {
            if (light.metadata?.constructionEditorLight)
                continue;
            if (this.lightHelpers.has(light.uniqueId))
                continue;
            const helper = MeshBuilder.CreateSphere(`editor-light-helper-${light.uniqueId}`, { diameter: 0.34, segments: 8 }, this.scene);
            helper.position.copyFrom(light.getAbsolutePosition?.() ?? light.position ?? Vector3.Zero());
            helper.material = this.materials.emissive(`editor-helper-${light.uniqueId}`, new Color3(1, 0.78, 0.22), 1.7);
            helper.metadata = { editorLightId: light.uniqueId, editorHelper: true, editorKey: this.lightKeyById.get(light.uniqueId) ?? `light-helper:${light.uniqueId}` };
            const saved = this.layout.modified[String(helper.metadata.editorKey)];
            if (saved)
                this.applyTransform(helper, saved);
            helper.isPickable = true;
            helper.checkCollisions = false;
            this.lightHelpers.set(light.uniqueId, helper);
            this.scene.onBeforeRenderObservable.add(() => {
                if (!this.active || helper.isDisposed())
                    return;
                if (this.selected === helper) {
                    const key = this.lightKeyById.get(light.uniqueId);
                    if (key)
                        this.applyLightTransform(light, this.captureTransform(helper));
                }
                else {
                    helper.position.copyFrom(light.getAbsolutePosition?.() ?? light.position ?? Vector3.Zero());
                }
            });
        }
        for (const helper of this.lightHelpers.values())
            helper.setEnabled(true);
    }
    hideLightHelpers() {
        for (const helper of this.lightHelpers.values())
            helper.setEnabled(false);
    }
    resolveLogicalRoot(node) {
        if (!node)
            return null;
        const cached = this.canonicalByNodeId.get(node.uniqueId);
        if (cached && !cached.isDisposed?.())
            return cached;
        const customId = this.findCustomId(node);
        if (customId)
            return this.custom.get(customId)?.root ?? node;
        let current = node;
        let best = node;
        while (current?.parent) {
            const parent = current.parent;
            if (this.isSceneContainer(parent))
                break;
            if (this.isEditableNode(parent) && this.isLogicalAssembly(parent))
                best = parent;
            current = parent;
        }
        this.canonicalByNodeId.set(node.uniqueId, best);
        return best;
    }
    isSceneContainer(node) {
        if (!node)
            return true;
        if (node.metadata?.chapterRoot || node.metadata?.worldRoot || node.metadata?.editorSceneContainer)
            return true;
        const name = String(node.name ?? "").toLowerCase();
        return [
            "chapter1-root", "chapter2-root", "chapter3-root", "chapter4-root", "chapter5-root",
            "chapter-1-root", "chapter-2-root", "chapter-3-root", "chapter-4-root", "chapter-5-root",
            "world-root", "campaign-root", "scene-root", "environment-root", "architecture-root",
            "menu-root", "menu-backdrop", "prologue-root"
        ].some((token) => name === token || name.includes(token))
            || /(?:room|hall|corridor|sector|level|floor)-root$/.test(name);
    }
    isLogicalAssembly(node) {
        if (!node)
            return false;
        const metadata = node.metadata ?? {};
        if (metadata.editorGroupRoot || metadata.lootContainerRoot || metadata.containerId || metadata.vehicleRoot || metadata.mobRoot || metadata.checkpointRoot)
            return true;
        const name = String(node.name ?? "").toLowerCase();
        if (/^car-\d+$/.test(name) || name === "security-fence")
            return true;
        if (/(?:chest|cabinet|locker|wardrobe|trunk|vehicle|car|cart|crate|barrel|door|gate|elevator|checkpoint|generator|machine|console|panel|mob|enemy|monster|creature|mannequin|plush|boss|statue|lamp|fixture|shelf|desk|table|chair|bench|projector).*(?:root|rig|pivot|hinge)$/.test(name))
            return true;
        const children = node.getChildren?.() ?? [];
        if (node.getClassName?.() !== "TransformNode" && node.getClassName?.() !== "Mesh")
            return false;
        if (children.length < 2)
            return false;
        return !/(?:chapter|world|scene|environment|architecture|room|hall|corridor|sector|level)/.test(name);
    }
    findCustomId(node) {
        let current = node;
        while (current) {
            const id = current.metadata?.editorObjectId;
            if (typeof id === "string")
                return id;
            current = current.parent;
        }
        return null;
    }
    isEditableNode(node) {
        if (!node || node === this.player.collider || node === this.player.camera || node.metadata?.constructionLocked)
            return false;
        const name = String(node.name ?? "").toLowerCase();
        if (!name || name.startsWith("editor-root-") || node.metadata?.editorCustom || node.metadata?.editorHelper)
            return false;
        if (["player-camera", "player-collider", "torch-root", "menu-backdrop"].some((token) => name.includes(token)))
            return false;
        if (name.startsWith("guide-") || name.startsWith("interaction-") || name.startsWith("movement-"))
            return false;
        return Boolean(node.position && node.rotation && node.scaling);
    }
    ensureEditorKey(node, counts) {
        if (typeof node.metadata?.editorKey === "string")
            return node.metadata.editorKey;
        const position = node.position ?? Vector3.Zero();
        const parent = node.parent?.name ?? "scene";
        const className = node.getClassName?.() ?? "Node";
        const base = `${className}:${parent}/${node.name}@${position.x.toFixed(3)},${position.y.toFixed(3)},${position.z.toFixed(3)}`;
        const count = counts.get(base) ?? 0;
        counts.set(base, count + 1);
        const key = count === 0 ? base : `${base}#${count}`;
        node.metadata = { ...(node.metadata ?? {}), editorKey: key };
        return key;
    }
    captureTransform(node) {
        const position = node.position ?? Vector3.Zero();
        const rotation = node.rotation ?? Vector3.Zero();
        const scaling = node.scaling ?? Vector3.One();
        return {
            position: [position.x, position.y, position.z],
            rotation: [rotation.x, rotation.y, rotation.z],
            scaling: [scaling.x, scaling.y, scaling.z],
            deleted: node.isEnabled ? !node.isEnabled() : false,
            name: String(node.name ?? "Objeto"),
            objectType: String(node.getClassName?.() ?? "Node")
        };
    }
    applyTransform(node, state) {
        node.position?.copyFromFloats(state.position[0], state.position[1], state.position[2]);
        node.rotation?.copyFromFloats(state.rotation[0], state.rotation[1], state.rotation[2]);
        node.scaling?.copyFromFloats(state.scaling[0], state.scaling[1], state.scaling[2]);
        if (typeof state.name === "string" && state.name.trim())
            node.name = state.name.trim();
        node.setEnabled?.(!state.deleted);
    }
    applyLightTransform(light, state) {
        if (light.parent)
            light.parent = null;
        light.position?.copyFromFloats(state.position[0], state.position[1], state.position[2]);
        if (light.direction) {
            const pitch = state.rotation[0];
            const yaw = state.rotation[1];
            const cosPitch = Math.cos(pitch);
            light.direction.copyFromFloats(Math.sin(yaw) * cosPitch, -Math.sin(pitch), Math.cos(yaw) * cosPitch);
        }
        light.setEnabled?.(!state.deleted);
    }
    pushHistory() {
        this.history.push(this.cloneLayout(this.layout));
        this.history = this.history.slice(-60);
        this.future = [];
    }
    undo() {
        const previous = this.history.pop();
        if (!previous)
            return;
        this.future.push(this.cloneLayout(this.layout));
        this.layout = previous;
        this.reloadLayout();
        this.setStatus("Alteração desfeita.");
    }
    redo() {
        const next = this.future.pop();
        if (!next)
            return;
        this.history.push(this.cloneLayout(this.layout));
        this.layout = next;
        this.reloadLayout();
        this.setStatus("Alteração refeita.");
    }
    reloadLayout() {
        this.selectNode(null);
        for (const id of [...this.custom.keys()])
            this.disposeCustomRuntime(id);
        for (const [key, node] of this.nodeByKey) {
            const original = this.originalTransforms.get(key);
            if (original)
                this.applyTransform(node, original);
            const modified = this.layout.modified[key];
            if (modified)
                this.applyTransform(node, modified);
        }
        for (const [key, light] of this.lightByKey) {
            const modified = this.layout.modified[key];
            if (modified)
                this.applyLightTransform(light, modified);
            else
                light.setEnabled?.(true);
        }
        this.createCustomObjectsFromLayout();
        this.applyPendingClones();
        this.saveLayout();
        this.refreshSceneList();
    }
    resetLayout() {
        if (!window.confirm("Restaurar todos os objetos, apagar construções e remover alterações salvas?"))
            return;
        this.pushHistory();
        this.layout = { version: 2, modified: {}, added: [] };
        this.reloadLayout();
        this.setStatus("Cena original restaurada.");
    }
    disposeCustomRuntime(id) {
        const runtime = this.custom.get(id);
        if (!runtime)
            return;
        runtime.interactions.forEach((mesh) => this.interaction.unregister(mesh));
        runtime.light?.dispose?.();
        runtime.root.dispose(false, true);
        this.custom.delete(id);
    }
    exportLayout() {
        this.saveLayout();
        const bundle = this.createAllMapsBundle();
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        const now = new Date();
        const stamp = `${now.toISOString().slice(0, 10)}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
        anchor.download = `atracao-final-todos-os-mapas-${stamp}.json`;
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.setStatus(`JSON exportado · ${bundle.summary.modified} modificados · ${bundle.summary.added} adicionados · ${bundle.summary.deleted} removidos`);
    }
    createAllMapsBundle() {
        const mapIds = ["chapter1", "chapter2", "chapter3", "chapter4", "chapter5", "global"];
        const maps = Object.fromEntries(mapIds.map((id) => [id, { modified: {}, added: [] }]));
        for (const [key, rawState] of Object.entries(this.layout.modified)) {
            const state = this.cloneRecord(rawState);
            const map = this.mapForKey(key, state);
            state.map = map;
            maps[map].modified[key] = state;
        }
        for (const rawRecord of this.layout.added) {
            const record = this.cloneRecord(rawRecord);
            const map = this.mapForRecord(record);
            record.map = map;
            maps[map].added.push(record);
        }
        const summary = { modified: 0, added: 0, deleted: 0, byMap: {} };
        for (const id of mapIds) {
            const modified = Object.values(maps[id].modified);
            const added = maps[id].added;
            const deleted = modified.filter((state) => state.deleted).length;
            summary.modified += modified.length;
            summary.added += added.length;
            summary.deleted += deleted;
            summary.byMap[id] = { modified: modified.length, added: added.length, deleted };
        }
        return {
            format: "atracao-final-construction-maps",
            version: 3,
            gameVersion: "5.2.6",
            exportedAt: new Date().toISOString(),
            maps,
            summary
        };
    }
    flattenImportedLayout(parsed) {
        if (parsed?.format === "atracao-final-construction-maps" && parsed.version === 3 && parsed.maps && typeof parsed.maps === "object") {
            const layout = { version: 2, modified: {}, added: [] };
            for (const [rawMap, content] of Object.entries(parsed.maps)) {
                const map = this.normalizeMapId(rawMap);
                if (!content || typeof content !== "object")
                    continue;
                if (content.modified && typeof content.modified === "object") {
                    for (const [key, rawState] of Object.entries(content.modified)) {
                        if (!rawState || typeof rawState !== "object")
                            continue;
                        layout.modified[key] = { ...rawState, map };
                    }
                }
                if (Array.isArray(content.added)) {
                    for (const rawRecord of content.added) {
                        if (!rawRecord || typeof rawRecord !== "object" || typeof rawRecord.id !== "string")
                            continue;
                        layout.added.push({ ...rawRecord, map });
                    }
                }
            }
            return layout;
        }
        if (parsed?.version === 2 && parsed.modified && typeof parsed.modified === "object" && Array.isArray(parsed.added))
            return parsed;
        throw new Error("Formato de mapas inválido");
    }
    async importSelectedFile() {
        const file = this.ui.file.files?.[0];
        this.ui.file.value = "";
        if (!file)
            return;
        this.callbacks.onLoadingStart?.("Importando mapas…", "Lendo o JSON e preparando as alterações de todos os capítulos.");
        try {
            await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
            const parsed = JSON.parse(await file.text());
            const imported = this.flattenImportedLayout(parsed);
            this.callbacks.onLoadingUpdate?.("Aplicando os mapas…", "Movendo objetos, recriando itens e atualizando as luzes.", 68);
            this.pushHistory();
            this.layout = imported;
            this.normalizeLayoutMaps();
            this.reloadLayout();
            await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
            this.callbacks.onLoadingUpdate?.("Mapas carregados.", "Finalizando a seleção e os gizmos.", 96);
            this.setStatus("JSON de todos os mapas importado.");
        }
        catch (error) {
            this.setStatus(`Não foi possível importar: ${error instanceof Error ? error.message : String(error)}`);
        }
        finally {
            this.callbacks.onLoadingEnd?.();
        }
    }
    loadLayout() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw)
                return { version: 2, modified: {}, added: [] };
            const parsed = JSON.parse(raw);
            const layout = this.flattenImportedLayout(parsed);
            this.layout = layout;
            this.normalizeLayoutMaps();
            return this.layout;
        }
        catch {
            return { version: 2, modified: {}, added: [] };
        }
    }
    saveLayout() {
        for (const runtime of this.custom.values()) {
            Object.assign(runtime.record, this.captureTransform(runtime.root));
            runtime.record.map = this.mapForRecord(runtime.record);
        }
        for (const [key, state] of Object.entries(this.layout.modified))
            state.map = this.mapForKey(key, state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.layout));
        this.setStatus(`Salvo · ${Object.keys(this.layout.modified).length} objetos alterados · ${this.layout.added.length} adicionados`);
    }
    normalizeLayoutMaps() {
        for (const [key, state] of Object.entries(this.layout.modified))
            state.map = this.mapForKey(key, state);
        for (const record of this.layout.added)
            record.map = this.mapForRecord(record);
    }
    currentMapId() {
        const callbackMap = this.callbacks.getCurrentMap?.();
        return this.normalizeMapId(callbackMap);
    }
    normalizeMapId(value) {
        const raw = String(value ?? "").toLowerCase().replace(/[_\s-]+/g, "");
        if (raw.includes("chapter5") || raw === "5")
            return "chapter5";
        if (raw.includes("chapter4") || raw === "4")
            return "chapter4";
        if (raw.includes("chapter3") || raw === "3")
            return "chapter3";
        if (raw.includes("chapter2") || raw === "2")
            return "chapter2";
        if (raw.includes("global") || raw.includes("menu"))
            return "global";
        return "chapter1";
    }
    resolveMapForNode(node) {
        let current = node;
        while (current) {
            const metadataMap = current.metadata?.mapId ?? current.metadata?.chapterId ?? current.metadata?.chapter;
            if (metadataMap)
                return this.normalizeMapId(metadataMap);
            const name = String(current.name ?? "").toLowerCase();
            if (name.includes("chapter5"))
                return "chapter5";
            if (name.includes("chapter4"))
                return "chapter4";
            if (name.includes("chapter3"))
                return "chapter3";
            if (name.includes("chapter2"))
                return "chapter2";
            if (name.includes("menu") || name.includes("backdrop"))
                return "global";
            current = current.parent;
        }
        const position = node?.getAbsolutePosition?.() ?? node?.position;
        return this.mapFromPosition(position);
    }
    resolveMapForLight(light) {
        const parentMap = light.parent ? this.resolveMapForNode(light.parent) : null;
        if (parentMap && parentMap !== "chapter1")
            return parentMap;
        const name = String(light.name ?? "").toLowerCase();
        if (name.includes("chapter5"))
            return "chapter5";
        if (name.includes("chapter4"))
            return "chapter4";
        if (name.includes("chapter3"))
            return "chapter3";
        if (name.includes("chapter2"))
            return "chapter2";
        if (["ambient", "storm-directional"].some((token) => name.includes(token)))
            return "global";
        return this.mapFromPosition(light.getAbsolutePosition?.() ?? light.position);
    }
    mapFromPosition(position) {
        const z = Number(position?.z);
        if (!Number.isFinite(z))
            return "chapter1";
        if (z >= 1470)
            return "chapter5";
        if (z >= 1035)
            return "chapter4";
        if (z >= 535)
            return "chapter3";
        if (z >= 190)
            return "chapter2";
        return "chapter1";
    }
    mapForKey(key, state = null) {
        const explicit = state?.map;
        if (explicit)
            return this.normalizeMapId(explicit);
        const mapped = this.mapByKey.get(key);
        if (mapped)
            return this.normalizeMapId(mapped);
        const lower = String(key).toLowerCase();
        if (lower.includes("chapter5"))
            return "chapter5";
        if (lower.includes("chapter4"))
            return "chapter4";
        if (lower.includes("chapter3"))
            return "chapter3";
        if (lower.includes("chapter2"))
            return "chapter2";
        if (state?.position)
            return this.mapFromPosition({ z: state.position[2] });
        return "chapter1";
    }
    mapForRecord(record) {
        if (record.map)
            return this.normalizeMapId(record.map);
        const sourceKey = record.properties?.sourceKey;
        if (sourceKey)
            return this.mapForKey(sourceKey, record);
        if (record.position)
            return this.mapFromPosition({ z: record.position[2] });
        return this.currentMapId();
    }
    cloneLayout(layout) {
        return JSON.parse(JSON.stringify(layout));
    }
    cloneRecord(record) {
        return JSON.parse(JSON.stringify(record));
    }
    newId(type) {
        return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }
    number(input, fallback) {
        const value = Number(input.value);
        return Number.isFinite(value) ? value : fallback;
    }
    setStatus(message) {
        this.ui.status.textContent = message;
    }
}
