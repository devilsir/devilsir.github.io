import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";

export interface InteractionContext {
  mesh: AbstractMesh;
}

export interface InteractionDefinition {
  prompt: string | (() => string);
  enabled?: () => boolean;
  onInteract: (context: InteractionContext) => void;
  maxDistance?: number;
  /**
   * Kept for compatibility with the chapter definitions. Nearby interaction is
   * now deterministic and no longer depends on a fragile scene-picking ray.
   */
  ignoreLineOfSight?: boolean;
  /** Lower values win when two usable objects occupy the same space. */
  priority?: number;
  /** Objectives for which this interaction is an explicit guide destination. */
  guideObjectives?: string[];
  /** Lower values make an eligible interaction more attractive to the guide. */
  guidePriority?: number;
  /** Decorative/optional interactions that must never attract the guide. */
  excludeFromGuide?: boolean;
}

interface RegisteredInteraction {
  mesh: AbstractMesh;
  definition: InteractionDefinition;
}

export class InteractionSystem {
  private readonly scene: Scene;
  private readonly camera: Camera;
  private readonly getPlayerPosition: () => Vector3;
  private readonly definitions = new Map<number, RegisteredInteraction>();
  private readonly highlight: HighlightLayer;
  private current: RegisteredInteraction | null = null;
  private readonly onPrompt: (prompt: string | null) => void;
  private highContrast = true;
  private lastInteractionAt = 0;

  public constructor(
    scene: Scene,
    camera: Camera,
    getPlayerPosition: () => Vector3,
    onPrompt: (prompt: string | null) => void
  ) {
    this.scene = scene;
    this.camera = camera;
    this.getPlayerPosition = getPlayerPosition;
    this.onPrompt = onPrompt;
    this.highlight = new HighlightLayer("interaction-highlight", scene, {
      blurHorizontalSize: 0.7,
      blurVerticalSize: 0.7
    });
    this.highlight.outerGlow = true;
    this.highlight.innerGlow = false;
  }

  public register(mesh: AbstractMesh, definition: InteractionDefinition): void {
    mesh.isPickable = true;
    this.definitions.set(mesh.uniqueId, { mesh, definition });
  }

  public unregister(mesh: AbstractMesh): void {
    this.definitions.delete(mesh.uniqueId);
    if (this.current?.mesh === mesh) this.clearCurrent();
  }

  public setHighContrast(enabled: boolean): void {
    this.highContrast = enabled;
  }

  public update(_deltaSeconds: number): void {
    // Refresh every rendered frame. The former timer-based scan could miss the
    // short moment in which the player entered an object's usable radius.
    this.refreshCurrent();
  }

  public interact(): boolean {
    // E always performs a fresh proximity scan. This does not depend on the HUD
    // having refreshed first, so pickups and doors respond immediately.
    this.refreshCurrent();
    const selected = this.current;
    if (!selected || selected.definition.enabled?.() === false) return false;

    // The input is intentionally listened to at the game level as well as by the
    // canvas. Guard against browsers dispatching the same physical press twice.
    const now = performance.now();
    if (now - this.lastInteractionAt < 120) return true;
    this.lastInteractionAt = now;

    selected.definition.onInteract({ mesh: selected.mesh });
    this.refreshCurrent();
    return true;
  }

  public dispose(): void {
    this.highlight.dispose();
    this.definitions.clear();
  }

  /**
   * Returns a live interaction point near the room-level destination. This lets
   * the luminous guide continue all the way to the active lever, pickup or
   * puzzle control instead of stopping at the centre of the room.
   */
  public getGuideTarget(objectiveId: string, expectedTarget: Vector3, searchRadius = 16): Vector3 | null {
    let best: Vector3 | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    const objective = objectiveId.toLowerCase();
    const keywords = this.guideKeywordsForObjective(objective);
    const allowDoor = objective.includes("door") || objective.includes("entry") || objective.includes("auditorium") || objective.includes("cell-lock") || objective.includes("underground") || objective.includes("exit");
    const allowLoot = objective.includes("fuel") || objective.includes("recover") || objective.includes("collect") || objective.includes("equipment") || objective.includes("cell") || objective.includes("item");
    const allowDocument = objective.includes("file") || objective.includes("archive") || objective.includes("evidence") || objective.includes("inspect") || objective.includes("memory");

    for (const candidate of this.definitions.values()) {
      const { mesh, definition } = candidate;
      if (!mesh.isEnabled() || definition.enabled?.() === false || definition.excludeFromGuide) continue;
      mesh.computeWorldMatrix(true);
      const point = mesh.getBoundingInfo().boundingBox.centerWorld.clone();
      const explicit = definition.guideObjectives?.includes(objectiveId) ?? false;
      const distanceToExpected = Vector3.Distance(point, expectedTarget);
      if (!explicit && distanceToExpected > searchRadius) continue;

      const name = mesh.name.toLowerCase();
      const prompt = (typeof definition.prompt === "function" ? definition.prompt() : definition.prompt).toLowerCase();
      const searchable = `${name} ${prompt}`;
      const isCheckpoint = name.includes("checkpoint") || prompt.includes("checkpoint");
      const isDoor = name.includes("door") || prompt.includes("porta");
      const isLoot = name.includes("chest") || name.includes("loot") || name.includes("locker") || name.includes("trunk") || prompt.includes("baú") || prompt.includes("armário") || prompt.includes("porta-malas");
      const isDocument = name.includes("document") || prompt.includes("documento") || prompt.includes("ler");
      const completed = ["concluíd", "estável", "resolvid", "ativado", "abertas", "já colet", "já recuper", "vazio", "sem conteúdo"].some((token) => prompt.includes(token));
      if (!explicit && completed) continue;
      if (!explicit && (isCheckpoint || (isDoor && !allowDoor) || (isLoot && !allowLoot) || (isDocument && !allowDocument))) continue;

      const keywordMatches = keywords.reduce((count, keyword) => count + (searchable.includes(keyword) ? 1 : 0), 0);
      const playerDistance = Vector3.Distance(point, this.getPlayerPosition());
      const semanticPenalty = keywords.length > 0 && keywordMatches === 0 ? 9 : -keywordMatches * 4.5;
      const score = (explicit ? -50 : 0) + distanceToExpected + playerDistance * 0.06 + semanticPenalty + (definition.guidePriority ?? 0);
      if (score < bestScore) {
        bestScore = score;
        best = point;
      }
    }
    return best;
  }

  private guideKeywordsForObjective(objectiveId: string): string[] {
    const aliases: Record<string, string[]> = {
      "find-fuel": ["fuel", "combust", "galão", "porta-malas"],
      "reach-side-door": ["side-entrance", "entrada lateral", "porta"],
      "restore-power": ["fuse", "cable", "crank", "painel", "quadro", "energia"],
      "solve-body-puzzles": ["hand", "eye", "heart", "foot", "mão", "olho", "coração", "pé", "válvula", "espelho", "placa"],
      "enter-auditorium": ["auditorium-door", "auditório", "porta"],
      "unlock-underground": ["body-card-reader", "cartão", "elevador"],
      "recover-cells": ["energy-cell", "célula"],
      "blackout-control": ["blackout", "reserva", "switch", "chave"],
      "activate-machine": ["machine", "máquina", "socket", "pressure", "track", "lock"],
      "sphere-return": ["winch", "guincho", "retorno"],
      "watch-jack-box": ["jack", "caixa", "melody", "melodia"],
      "inspect-daniel-room": ["daniel"],
      "collect-daniel-items": ["daniel", "torch", "recorder", "club", "card"],
      "activate-five-generators": ["generator", "gerador", "breaker", "cable", "console"],
      "ventilate-gas-room": ["gas", "vent", "válvula", "repair"],
      "synchronize-generator5": ["generator5", "lever", "alavanca"],
      "repair-intercom": ["intercom", "fio"],
      "open-cell-lock": ["mechanical-lock", "mecanismo", "haste"],
      "recover-equipment": ["equipment", "locker", "armário", "equipamento"],
      "identify-mimic": ["identity", "evidence", "console", "identidade", "evidência"],
      "search-mimic-remains": ["body-inspect", "corpo", "restos"],
      "reach-archives": ["archive-exit", "arquivo", "saída"],
      "prove-life": ["proof", "mirror", "recorder", "token", "prova"],
      "search-archives": ["archive-record", "record", "arquivo"],
      "find-own-file": ["childhood", "projector", "token", "arquivo"],
      "recover-memory": ["archive-core", "memory", "memória"],
      "synchronized-exit": ["reader", "leitor", "exit"]
    };
    const explicit = aliases[objectiveId];
    if (explicit) return explicit;
    return objectiveId.split("-").filter((token) => !["find", "reach", "enter", "escape", "survive", "follow", "watch", "approach", "search", "recover", "activate", "open", "inspect", "collect", "talk", "choose", "defeat", "return", "current"].includes(token));
  }

  private refreshCurrent(): void {
    const next = this.findBestCandidate();
    if (!next) {
      this.clearCurrent();
      return;
    }

    if (this.current?.mesh !== next.mesh) {
      this.clearCurrent();
      this.current = next;
      if (this.highContrast && next.mesh.isVisible && next.mesh.visibility > 0.01) {
        this.highlight.addMesh(next.mesh, new Color3(1, 0.73, 0.25));
      }
    }

    // The user-facing instruction is deliberately consistent. The specific
    // action remains available in the registered definition for documents/tests.
    this.onPrompt("Aperte E para interagir");
  }

  private findBestCandidate(): RegisteredInteraction | null {
    this.camera.computeWorldMatrix(true);
    const playerPosition = this.getPlayerPosition().clone();
    const cameraPosition = this.camera.globalPosition.clone();
    const forward = this.camera.getForwardRay(1).direction.normalize();
    let best: RegisteredInteraction | null = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const candidate of this.definitions.values()) {
      const { mesh, definition } = candidate;
      if (!mesh.isEnabled() || definition.enabled?.() === false) continue;

      mesh.computeWorldMatrix(true);
      const box = mesh.getBoundingInfo().boundingBox;
      const nearestToPlayer = this.closestPointInBox(playerPosition, box.minimumWorld, box.maximumWorld);
      const nearestToCamera = this.closestPointInBox(cameraPosition, box.minimumWorld, box.maximumWorld);
      const distance = Vector3.Distance(playerPosition, nearestToPlayer);
      const maxDistance = definition.maxDistance ?? 4.5;
      if (!Number.isFinite(distance) || distance > maxDistance) continue;

      const aimPoint = Vector3.DistanceSquared(cameraPosition, nearestToCamera) > 0.0001
        ? nearestToCamera
        : box.centerWorld;
      const offset = aimPoint.subtract(cameraPosition);
      const direction = offset.lengthSquared() > 0.0001 ? offset.normalize() : forward;
      const facing = Vector3.Dot(forward, direction);

      // At close range proximity is authoritative. Farther away, the object only
      // needs to be broadly in front instead of under a pixel-perfect crosshair.
      if (distance > 3.25 && facing < -0.35) continue;

      const facingPenalty = distance <= 2.25 ? 0 : (1 - Math.max(-1, Math.min(1, facing))) * 0.25;
      const score = distance + facingPenalty + (definition.priority ?? 0);
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    return best;
  }

  private closestPointInBox(point: Vector3, minimum: Vector3, maximum: Vector3): Vector3 {
    return new Vector3(
      Math.max(minimum.x, Math.min(maximum.x, point.x)),
      Math.max(minimum.y, Math.min(maximum.y, point.y)),
      Math.max(minimum.z, Math.min(maximum.z, point.z))
    );
  }

  private clearCurrent(): void {
    if (this.current) this.highlight.removeMesh(this.current.mesh);
    this.current = null;
    this.onPrompt(null);
  }
}
