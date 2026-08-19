import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import type { ProceduralMaterials } from "../world/ProceduralMaterials";
import type { PlayerController } from "../core/PlayerController";

export type GuideRouteProvider = () => Vector3[] | null;

/**
 * Renders a lightweight breadcrumb trail from the player to the current goal.
 * The path is intentionally made from emissive physical markers instead of a
 * screen-space arrow, so it remains readable through fog and while turning.
 */
export class GuidePathSystem {
  public enabled = false;
  private readonly scene: Scene;
  private readonly player: PlayerController;
  private readonly markers: Mesh[] = [];
  private readonly routeProvider: GuideRouteProvider;
  private accumulator = 0;
  private animationTime = 0;
  private readonly maxMarkers = 42;

  public constructor(
    scene: Scene,
    materials: ProceduralMaterials,
    player: PlayerController,
    routeProvider: GuideRouteProvider
  ) {
    this.scene = scene;
    this.player = player;
    this.routeProvider = routeProvider;
    const material = materials.emissive("guide-path-light", new Color3(0.98, 0.58, 0.12), 2.4);
    for (let index = 0; index < this.maxMarkers; index += 1) {
      const marker = MeshBuilder.CreateCylinder(`guide-path-marker-${index}`, {
        height: 0.16,
        diameterTop: 0.24,
        diameterBottom: 0.56,
        tessellation: 10
      }, scene);
      marker.material = material;
      marker.isPickable = false;
      marker.checkCollisions = false;
      marker.setEnabled(false);
      marker.metadata = { interactionPassthrough: true, guideMarker: true };
      this.markers.push(marker);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.hideAll();
    else this.refresh();
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  /** Rebuild the trail immediately after an objective or world state change. */
  public invalidate(): void {
    this.accumulator = 0;
    if (this.enabled) this.refresh();
  }

  public update(deltaSeconds: number): void {
    this.animationTime += deltaSeconds;
    if (!this.enabled) return;
    this.accumulator += deltaSeconds;
    if (this.accumulator >= 0.12) {
      this.accumulator = 0;
      this.refresh();
    }
    this.markers.forEach((marker, index) => {
      if (!marker.isEnabled()) return;
      marker.position.y = Number(marker.metadata?.baseY ?? marker.position.y)
        + Math.sin(this.animationTime * 3.1 + index * 0.58) * 0.06;
      const pulse = 0.82 + Math.sin(this.animationTime * 4.4 + index * 0.72) * 0.16;
      marker.scaling.set(pulse, 1, pulse);
      marker.rotation.y += deltaSeconds * 0.7;
    });
  }

  public dispose(): void {
    this.markers.forEach((marker) => marker.dispose());
  }

  private refresh(): void {
    const route = this.routeProvider();
    if (!route || route.length === 0 || !this.player.enabled) {
      this.hideAll();
      return;
    }

    const points = [this.player.collider.position.clone(), ...route.map((point) => point.clone())];
    const segmentLengths: number[] = [];
    let totalLength = 0;
    for (let segment = 0; segment < points.length - 1; segment += 1) {
      const length = Vector3.Distance(points[segment]!, points[segment + 1]!);
      segmentLengths.push(length);
      totalLength += length;
    }

    // Sample the complete route, not just the first forty metres. The old fixed
    // spacing exhausted every marker before distant goals, so the trail appeared
    // to ignore a newly selected objective. Dynamic spacing always reserves the
    // final marker for the live destination.
    const sampled: Vector3[] = [];
    const spacing = Math.max(1.55, totalLength / Math.max(1, this.maxMarkers - 2));
    let nextDistance = Math.min(1.65, spacing);
    let traversed = 0;
    for (let segment = 0; segment < points.length - 1 && sampled.length < this.maxMarkers - 1; segment += 1) {
      const start = points[segment]!;
      const end = points[segment + 1]!;
      const length = segmentLengths[segment]!;
      if (length < 0.01) continue;
      while (nextDistance <= traversed + length && sampled.length < this.maxMarkers - 1) {
        const local = Math.max(0, Math.min(1, (nextDistance - traversed) / length));
        sampled.push(Vector3.Lerp(start, end, local));
        nextDistance += spacing;
      }
      traversed += length;
    }

    const destination = points[points.length - 1]!;
    if (Vector3.Distance(this.player.collider.position, destination) > 1.15) {
      if (sampled.length >= this.maxMarkers) sampled[this.maxMarkers - 1] = destination.clone();
      else sampled.push(destination.clone());
    }

    this.markers.forEach((marker, index) => {
      const point = sampled[index];
      if (!point) {
        marker.setEnabled(false);
        return;
      }
      const terrainY = this.findFloorHeight(point);
      marker.position.set(point.x, terrainY + 0.19, point.z);
      marker.metadata = { ...(marker.metadata ?? {}), baseY: marker.position.y };
      marker.setEnabled(true);
    });
  }

  private findFloorHeight(point: Vector3): number {
    // Casting from the roof down made the guide land on ceilings inside the
    // building. Cast from player-height instead and only accept meshes that are
    // actually walkable surfaces.
    const expectedY = Number.isFinite(point.y) ? point.y : this.player.collider.position.y;
    const origin = new Vector3(point.x, Math.max(expectedY, this.player.collider.position.y) + 2.2, point.z);
    const pick = this.scene.pickWithRay(
      new Ray(origin, new Vector3(0, -1, 0), 6.5),
      (mesh: AbstractMesh) => this.isGuideFloor(mesh)
    );
    if (pick?.hit && pick.pickedPoint) return pick.pickedPoint.y;

    const fallback = this.scene.pickWithRay(
      new Ray(new Vector3(point.x, expectedY + 1.2, point.z), new Vector3(0, -1, 0), 3.5),
      (mesh: AbstractMesh) => mesh.checkCollisions && mesh.isEnabled() && !this.isGuideBlocker(mesh)
    );
    if (fallback?.hit && fallback.pickedPoint) return fallback.pickedPoint.y;
    return Math.max(0.02, expectedY - 0.08);
  }

  private isGuideFloor(mesh: AbstractMesh): boolean {
    if (!mesh.checkCollisions || !mesh.isEnabled() || this.isGuideBlocker(mesh)) return false;
    const name = mesh.name.toLowerCase();
    return Boolean(
      mesh.metadata?.guideFloor
      || mesh.metadata?.continuousInteriorFloor
      || name.includes("floor")
      || name.includes("ground")
      || name.includes("platform")
      || name.includes("stage")
      || name.includes("bridge-section")
      || name.includes("ramp")
      || name.includes("track")
    );
  }

  private isGuideBlocker(mesh: AbstractMesh): boolean {
    const name = mesh.name.toLowerCase();
    return Boolean(
      mesh.metadata?.mapBoundary
      || mesh.metadata?.roomCeiling
      || name.includes("ceiling")
      || name.includes("roof")
      || name.includes("lintel")
      || name.includes("wall")
      || name.includes("door")
      || name.includes("foundation")
    );
  }

  private hideAll(): void {
    this.markers.forEach((marker) => marker.setEnabled(false));
  }
}
