import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
/**
 * Renders an emissive breadcrumb trail from the player to the current goal.
 * Authored waypoints are refined against live collision geometry so the trail
 * bends around closed doors and walls instead of passing through them.
 */
export class GuidePathSystem {
    enabled = false;
    scene;
    player;
    markers = [];
    routeProvider;
    accumulator = 0;
    animationTime = 0;
    maxMarkers = 48;
    cachedRoute = null;
    displayedRoute = null;
    cachedSignature = "";
    cacheUntil = 0;
    constructor(scene, materials, player, routeProvider) {
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
            marker.metadata = { interactionPassthrough: true, guideMarker: true, constructionLocked: true };
            this.markers.push(marker);
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled)
            this.hideAll();
        else {
            this.cachedSignature = "";
            this.refresh();
        }
    }
    toggle() {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }
    /** Rebuild the trail immediately after an objective or world state change. */
    invalidate() {
        this.accumulator = 0;
        this.cachedSignature = "";
        this.cachedRoute = null;
        if (this.enabled)
            this.refresh();
    }
    update(deltaSeconds) {
        this.animationTime += deltaSeconds;
        if (!this.enabled)
            return;
        this.accumulator += deltaSeconds;
        if (this.accumulator >= 0.16) {
            this.accumulator = 0;
            this.refresh();
        }
        this.markers.forEach((marker, index) => {
            if (!marker.isEnabled())
                return;
            marker.position.y = Number(marker.metadata?.baseY ?? marker.position.y)
                + Math.sin(this.animationTime * 3.1 + index * 0.58) * 0.06;
            const isDestination = marker.metadata?.guideDestination === true;
            const pulse = (isDestination ? 1.35 : 0.82) + Math.sin(this.animationTime * 4.4 + index * 0.72) * (isDestination ? 0.24 : 0.16);
            marker.scaling.set(pulse, isDestination ? 1.7 : 1, pulse);
            marker.rotation.y += deltaSeconds * 0.7;
        });
    }
    dispose() {
        this.markers.forEach((marker) => marker.dispose());
    }
    refresh() {
        const route = this.routeProvider();
        if (!route || route.length === 0 || !this.player.enabled) {
            this.hideAll();
            return;
        }
        const playerPoint = this.player.collider.getAbsolutePosition().clone();
        const authoredPoints = [playerPoint, ...route.map((point) => point.clone())];
        const points = this.getCollisionAwareRoute(authoredPoints);
        if (points === this.displayedRoute) return;
        this.displayedRoute = points;
        const segmentLengths = [];
        let totalLength = 0;
        for (let segment = 0; segment < points.length - 1; segment += 1) {
            const length = Vector3.Distance(points[segment], points[segment + 1]);
            segmentLengths.push(length);
            totalLength += length;
        }
        if (totalLength < 0.1) {
            this.hideAll();
            return;
        }
        const sampled = [];
        const spacing = Math.max(1.25, totalLength / Math.max(1, this.maxMarkers - 2));
        let nextDistance = Math.min(1.25, spacing);
        let traversed = 0;
        for (let segment = 0; segment < points.length - 1 && sampled.length < this.maxMarkers - 1; segment += 1) {
            const start = points[segment];
            const end = points[segment + 1];
            const length = segmentLengths[segment];
            if (length < 0.01)
                continue;
            while (nextDistance <= traversed + length && sampled.length < this.maxMarkers - 1) {
                const local = Math.max(0, Math.min(1, (nextDistance - traversed) / length));
                sampled.push(Vector3.Lerp(start, end, local));
                nextDistance += spacing;
            }
            traversed += length;
        }
        const destination = points[points.length - 1];
        if (Vector3.Distance(playerPoint, destination) > 0.85) {
            if (sampled.length >= this.maxMarkers)
                sampled[this.maxMarkers - 1] = destination.clone();
            else
                sampled.push(destination.clone());
        }
        this.markers.forEach((marker, index) => {
            const point = sampled[index];
            if (!point) {
                marker.setEnabled(false);
                return;
            }
            const terrainY = this.findFloorHeight(point);
            marker.position.set(point.x, terrainY + 0.19, point.z);
            marker.metadata = {
                ...(marker.metadata ?? {}),
                baseY: marker.position.y,
                guideDestination: index === sampled.length - 1,
                constructionLocked: true
            };
            marker.setEnabled(true);
        });
    }
    getCollisionAwareRoute(points) {
        const signature = (this.scene?.metadata?.guideObstacleRevision ?? 0) + "|" + points.map((point, index) => {
            const precision = index === 0 ? 1.2 : 0.25;
            return `${Math.round(point.x / precision)},${Math.round(point.y / precision)},${Math.round(point.z / precision)}`;
        }).join("|");
        const now = performance.now();
        if (this.cachedRoute && this.cachedSignature === signature && now < this.cacheUntil)
            return this.cachedRoute;
        const result = [points[0].clone()];
        const routeDeadline = now + 15;
        let partial = false;
        for (let index = 0; index < points.length - 1; index += 1) {
            const start = result[result.length - 1];
            const end = points[index + 1].clone();
            if (this.segmentIsClear(start, end, index === points.length - 2)) {
                result.push(end);
                continue;
            }
            const detour = this.findSimpleDetour(start, end, now + 8);
            if (detour) {
                result.push(...detour);
                continue;
            }
            const navigationPath = this.findNavigationPath(start, end, routeDeadline);
            if (navigationPath && navigationPath.length > 1) {
                result.push(...navigationPath.slice(1));
                continue;
            }
            // Do not point through an unchecked wall when the search runs out of budget.
            partial = true;
            break;
        }
        this.cachedSignature = signature;
        this.cachedRoute = result;
        this.cacheUntil = performance.now() + (partial ? 1500 : 950);
        return result;
    }
    findSimpleDetour(start, end, deadline) {
        const flat = new Vector3(end.x - start.x, 0, end.z - start.z);
        if (flat.lengthSquared() < 0.01)
            return null;
        flat.normalize();
        const perpendicular = new Vector3(-flat.z, 0, flat.x);
        for (const offset of [1.8, -1.8, 3.2, -3.2, 4.8, -4.8, 6.4, -6.4]) {
            if (performance.now() >= deadline) return null;
            const first = Vector3.Lerp(start, end, 0.28).add(perpendicular.scale(offset));
            const second = Vector3.Lerp(start, end, 0.72).add(perpendicular.scale(offset));
            first.y = this.findFloorHeight(first);
            second.y = this.findFloorHeight(second);
            if (this.segmentIsClear(start, first) && this.segmentIsClear(first, second) && this.segmentIsClear(second, end, true))
                return [first, second, end.clone()];
        }
        for (const corner of [new Vector3(start.x, start.y, end.z), new Vector3(end.x, end.y, start.z)]) {
            if (performance.now() >= deadline) return null;
            corner.y = this.findFloorHeight(corner);
            if (this.segmentIsClear(start, corner) && this.segmentIsClear(corner, end, true))
                return [corner, end.clone()];
        }
        return null;
    }
    findNavigationPath(start, end, deadline) {
        if (performance.now() >= deadline) return null;
        const step = 1.45;
        const margin = 5.2;
        const minX = Math.floor((Math.min(start.x, end.x) - margin) / step) * step;
        const maxX = Math.ceil((Math.max(start.x, end.x) + margin) / step) * step;
        const minZ = Math.floor((Math.min(start.z, end.z) - margin) / step) * step;
        const maxZ = Math.ceil((Math.max(start.z, end.z) + margin) / step) * step;
        const cols = Math.round((maxX - minX) / step) + 1;
        const rows = Math.round((maxZ - minZ) / step) + 1;
        if (cols < 1 || rows < 1 || cols * rows > 4200)
            return null;
        const floorCache = new Map();
        const key = (x, z) => `${x},${z}`;
        const pointAt = (x, z) => {
            const id = key(x, z);
            if (floorCache.has(id))
                return floorCache.get(id)?.clone() ?? null;
            const wx = minX + x * step;
            const wz = minZ + z * step;
            const dx = end.x - start.x;
            const dz = end.z - start.z;
            const denominator = Math.max(0.001, dx * dx + dz * dz);
            const interpolation = Math.max(0, Math.min(1, ((wx - start.x) * dx + (wz - start.z) * dz) / denominator));
            const expectedY = start.y + interpolation * (end.y - start.y);
            const floor = this.findFloorPoint(new Vector3(wx, expectedY, wz));
            floorCache.set(id, floor?.clone() ?? null);
            return floor;
        };
        const nearestCell = (point) => ({
            x: Math.max(0, Math.min(cols - 1, Math.round((point.x - minX) / step))),
            z: Math.max(0, Math.min(rows - 1, Math.round((point.z - minZ) / step)))
        });
        const startCell = nearestCell(start);
        const endCell = nearestCell(end);
        const startKey = key(startCell.x, startCell.z);
        const endKey = key(endCell.x, endCell.z);
        floorCache.set(startKey, start.clone());
        floorCache.set(endKey, end.clone());
        const open = [{ ...startCell, id: startKey, g: 0, f: Vector3.Distance(start, end) }];
        const cameFrom = new Map();
        const gScore = new Map([[startKey, 0]]);
        const closed = new Set();
        const directions = [
            [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
            [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]
        ];
        let iterations = 0;
        while (open.length > 0 && iterations < 5200) {
            iterations += 1;
            open.sort((a, b) => a.f - b.f);
            const current = open.shift();
            if (!current || closed.has(current.id))
                continue;
            if (current.id === endKey) {
                const path = [end.clone()];
                let cursor = current.id;
                while (cursor !== startKey) {
                    const previous = cameFrom.get(cursor);
                    if (!previous)
                        return null;
                    cursor = previous;
                    if (cursor !== startKey) {
                        const [cx, cz] = cursor.split(",").map(Number);
                        const point = pointAt(cx, cz);
                        if (point)
                            path.push(point);
                    }
                }
                path.push(start.clone());
                path.reverse();
                return path;
            }
            closed.add(current.id);
            const currentPoint = pointAt(current.x, current.z);
            if (!currentPoint)
                continue;
            for (const [dx, dz, cost] of directions) {
                if (performance.now() >= deadline) return null;
                const nx = current.x + dx;
                const nz = current.z + dz;
                if (nx < 0 || nx >= cols || nz < 0 || nz >= rows)
                    continue;
                const neighborId = key(nx, nz);
                if (closed.has(neighborId))
                    continue;
                const neighborPoint = pointAt(nx, nz);
                if (!neighborPoint || Math.abs(neighborPoint.y - currentPoint.y) > 1.35)
                    continue;
                const finalEdge = neighborId === endKey;
                if (!this.segmentIsClear(currentPoint, neighborPoint, finalEdge))
                    continue;
                const tentative = current.g + cost + Math.abs(neighborPoint.y - currentPoint.y) * 0.35;
                if (tentative >= (gScore.get(neighborId) ?? Number.POSITIVE_INFINITY))
                    continue;
                cameFrom.set(neighborId, current.id);
                gScore.set(neighborId, tentative);
                const heuristic = Math.hypot(neighborPoint.x - end.x, neighborPoint.z - end.z) / step;
                open.push({ x: nx, z: nz, id: neighborId, g: tentative, f: tentative + heuristic });
            }
        }
        return null;
    }
    segmentIsClear(start, end, allowDestinationContact = false) {
        const horizontal = new Vector3(end.x - start.x, 0, end.z - start.z);
        const length = horizontal.length();
        if (length < 0.12)
            return true;
        horizontal.normalize();
        const origin = new Vector3(start.x, Math.max(start.y, end.y) + 0.82, start.z).add(horizontal.scale(0.12));
        const rayLength = Math.max(0.05, length - 0.12);
        const pick = this.scene.pickWithRay(new Ray(origin, horizontal, rayLength), (mesh) => this.isNavigationBlocker(mesh)
            && this.overlapsXZ(mesh, start.x, start.z, end.x, end.z));
        if (!pick?.hit)
            return true;
        const tolerance = allowDestinationContact ? 0.78 : 0.18;
        return Number(pick.distance ?? 0) >= rayLength - tolerance;
    }
    overlapsXZ(mesh, x0, z0, x1 = x0, z1 = z0) {
        const { minimumWorld: min, maximumWorld: max } = mesh.getBoundingInfo().boundingBox;
        const margin = 0.75;
        return max.x >= Math.min(x0, x1) - margin && min.x <= Math.max(x0, x1) + margin
            && max.z >= Math.min(z0, z1) - margin && min.z <= Math.max(z0, z1) + margin;
    }
    isNavigationBlocker(mesh) {
        if (mesh === this.player.collider || !mesh.isEnabled() || !mesh.checkCollisions || mesh.metadata?.guideMarker || mesh.metadata?.guideFloor)
            return false;
        const name = mesh.name.toLowerCase();
        if (name.includes("floor") || name.includes("ground") || name.includes("foundation") || name.includes("ceiling") || name.includes("roof") || name.includes("stage") || name.includes("platform") || name.includes("ramp") || name.includes("track"))
            return false;
        return true;
    }
    findFloorPoint(point) {
        const expectedY = Number.isFinite(point.y) ? point.y : this.player.collider.position.y;
        const origin = new Vector3(point.x, expectedY + 2.8, point.z);
        const pick = this.scene.pickWithRay(new Ray(origin, new Vector3(0, -1, 0), 6.8), (mesh) => this.isGuideFloor(mesh) && this.overlapsXZ(mesh, point.x, point.z));
        if (pick?.hit && pick.pickedPoint)
            return pick.pickedPoint.clone();
        const fallback = this.scene.pickWithRay(new Ray(new Vector3(point.x, expectedY + 1.4, point.z), new Vector3(0, -1, 0), 4.2), (mesh) => mesh !== this.player.collider && mesh.checkCollisions && mesh.isEnabled() && !this.isGuideBlocker(mesh) && this.overlapsXZ(mesh, point.x, point.z));
        if (fallback?.hit && fallback.pickedPoint)
            return fallback.pickedPoint.clone();
        return null;
    }
    findFloorHeight(point) {
        const floor = this.findFloorPoint(point);
        if (floor)
            return floor.y;
        const expectedY = Number.isFinite(point.y) ? point.y : this.player.collider.position.y;
        return Math.max(0.02, expectedY - 0.08);
    }
    isGuideFloor(mesh) {
        if (mesh === this.player.collider || !mesh.checkCollisions || !mesh.isEnabled() || this.isGuideBlocker(mesh))
            return false;
        const name = mesh.name.toLowerCase();
        return Boolean(mesh.metadata?.guideFloor
            || mesh.metadata?.continuousInteriorFloor
            || name.includes("floor")
            || name.includes("ground")
            || name.includes("platform")
            || name.includes("stage")
            || name.includes("bridge-section")
            || name.includes("ramp")
            || name.includes("track"));
    }
    isGuideBlocker(mesh) {
        const name = mesh.name.toLowerCase();
        return Boolean(mesh.metadata?.mapBoundary
            || mesh.metadata?.roomCeiling
            || name.includes("ceiling")
            || name.includes("roof")
            || name.includes("lintel")
            || name.includes("wall")
            || name.includes("door")
            || name.includes("foundation"));
    }
    hideAll() {
        this.displayedRoute = null;
        this.markers.forEach((marker) => marker.setEnabled(false));
    }
}
