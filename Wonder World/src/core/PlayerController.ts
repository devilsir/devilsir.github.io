import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GameSettings } from "../systems/Settings";
import type { AudioManager } from "../systems/AudioManager";

export interface PlayerCallbacks {
  onPause: () => void;
  onTorchToggle: () => void;
  onInteract: () => void;
  onFireUse: () => void;
  onThrow: () => void;
  onSoundDevice: () => void;
  onRearDoor: () => void;
  onHeavyAttack: () => void;
  onContextAction: () => void;
  onFootstep: (position: Vector3, intensity: number, surface: "concrete" | "tile" | "wood", sprinting: boolean, crouching: boolean) => void;
}

export class PlayerController {
  public readonly camera: FreeCamera;
  public readonly collider: AbstractMesh;
  public health = 100;
  public armor = 0;
  public enabled = false;
  public invulnerable = false;
  public stamina = 100;
  private readonly scene: Scene;
  private readonly canvas: HTMLCanvasElement;
  private readonly audio: AudioManager;
  private settings: GameSettings;
  private readonly callbacks: PlayerCallbacks;
  private readonly keys = new Set<string>();
  private velocity = Vector3.Zero();
  private verticalVelocity = 0;
  private sprintToggled = false;
  private crouchToggled = false;
  private isGrounded = false;
  private stepDistance = 0;
  private lastPosition = Vector3.Zero();
  private bobTime = 0;
  private readonly baseEyeHeight = 1.62;
  private currentEyeHeight = 1.62;
  private surface: "concrete" | "tile" | "wood" = "concrete";

  public constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    audio: AudioManager,
    settings: GameSettings,
    callbacks: PlayerCallbacks
  ) {
    this.scene = scene;
    this.canvas = canvas;
    this.audio = audio;
    this.settings = settings;
    this.callbacks = callbacks;

    this.collider = MeshBuilder.CreateBox("player-collider", { width: 0.75, height: 1.8, depth: 0.75 }, scene);
    this.collider.isVisible = false;
    this.collider.isPickable = false;
    this.collider.checkCollisions = true;
    this.collider.ellipsoid = new Vector3(0.38, 0.88, 0.38);
    this.collider.ellipsoidOffset = new Vector3(0, 0.9, 0);

    this.camera = new FreeCamera("player-camera", new Vector3(0, this.currentEyeHeight, 0), scene);
    this.camera.parent = this.collider;
    this.camera.minZ = 0.05;
    this.camera.maxZ = 280;
    this.camera.fov = 1.05;
    this.camera.inertia = 0.16;
    this.camera.angularSensibility = this.sensitivityToAngular(settings.mouseSensitivity);
    this.camera.keysUp = [];
    this.camera.keysDown = [];
    this.camera.keysLeft = [];
    this.camera.keysRight = [];
    this.camera.attachControl(canvas, true);
    scene.activeCamera = this.camera;

    this.bindInput();
    this.lastPosition.copyFrom(this.collider.position);
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.velocity.setAll(0);
      this.verticalVelocity = 0;
      this.keys.clear();
    }
  }

  public applySettings(settings: GameSettings): void {
    this.settings = settings;
    this.camera.angularSensibility = this.sensitivityToAngular(settings.mouseSensitivity);
  }

  public teleport(position: Vector3, rotationY = 0): void {
    this.collider.position.copyFrom(position);
    this.camera.position.set(0, this.currentEyeHeight, 0);
    this.camera.rotation.set(0, rotationY, 0);
    this.velocity.setAll(0);
    this.verticalVelocity = 0;
    this.isGrounded = false;
    this.stepDistance = 0;
    this.lastPosition.copyFrom(position);
    this.collider.computeWorldMatrix(true);
    this.camera.computeWorldMatrix(true);
  }

  public lookAtWorld(target: Vector3): void {
    const origin = this.collider.position.add(new Vector3(0, this.currentEyeHeight, 0));
    const direction = target.subtract(origin).normalize();
    const horizontal = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    this.camera.rotation.x = -Math.atan2(direction.y, Math.max(0.0001, horizontal));
    this.camera.rotation.y = Math.atan2(direction.x, direction.z);
    this.camera.rotation.z = 0;
  }

  public requestPointerLock(): void {
    if (document.pointerLockElement !== this.canvas) {
      const request = this.canvas.requestPointerLock();
      if (request && typeof request.catch === "function") void request.catch(() => undefined);
    }
  }

  public releasePointerLock(): void {
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  public damage(amount: number): void {
    if (this.invulnerable || amount <= 0) return;
    const absorbed = Math.min(this.armor, amount * 0.65);
    this.armor = Math.max(0, this.armor - absorbed);
    this.health = Math.max(0, this.health - Math.max(0, amount - absorbed));
  }

  public addArmor(amount: number): void {
    this.armor = Math.min(100, this.armor + Math.max(0, amount));
  }

  public heal(amount: number): void {
    this.health = Math.min(100, this.health + amount);
  }

  public forward(): Vector3 {
    const direction = this.camera.getForwardRay().direction.clone();
    direction.y = 0;
    return direction.lengthSquared() > 0.0001 ? direction.normalize() : new Vector3(0, 0, 1);
  }

  public setSurface(surface: "concrete" | "tile" | "wood"): void {
    this.surface = surface;
  }

  public isMoving(): boolean {
    return this.velocity.lengthSquared() > 0.05;
  }

  public isSprinting(): boolean {
    if (this.stamina <= 0.05) return false;
    return this.settings.sprintMode === "toggle" ? this.sprintToggled : this.keys.has("ShiftLeft") || this.keys.has("ShiftRight");
  }

  public consumeStamina(amount: number): boolean {
    if (this.stamina < amount) return false;
    this.stamina = Math.max(0, this.stamina - amount);
    return true;
  }

  public isCrouching(): boolean {
    return this.settings.crouchMode === "toggle" ? this.crouchToggled : this.keys.has("ControlLeft") || this.keys.has("KeyC");
  }

  public getDebugSnapshot(): {
    enabled: boolean;
    grounded: boolean;
    collider: string;
    cameraLocal: string;
    velocity: string;
    verticalVelocity: number;
    activeCamera: boolean;
    pointerLocked: boolean;
  } {
    const format = (value: Vector3): string => `${value.x.toFixed(2)}, ${value.y.toFixed(2)}, ${value.z.toFixed(2)}`;
    return {
      enabled: this.enabled,
      grounded: this.isGrounded,
      collider: format(this.collider.position),
      cameraLocal: format(this.camera.position),
      velocity: format(this.velocity),
      verticalVelocity: Number(this.verticalVelocity.toFixed(2)),
      activeCamera: this.scene.activeCamera === this.camera,
      pointerLocked: document.pointerLockElement === this.canvas
    };
  }

  public update(rawDeltaSeconds: number): void {
    const deltaSeconds = Number.isFinite(rawDeltaSeconds) ? Math.max(0, Math.min(0.05, rawDeltaSeconds)) : 0;

    // Render-target cameras and context recovery can temporarily replace the active
    // camera. Reasserting it here prevents a fully simulated player from being shown
    // through a stale camera, which looked exactly like a frozen screen with footsteps.
    if (this.scene.activeCamera !== this.camera) this.scene.activeCamera = this.camera;

    if (!this.enabled || deltaSeconds <= 0) {
      this.syncCameraAndListener(0);
      return;
    }

    const forward = this.forward();
    const right = Vector3.Cross(Vector3.Up(), forward).normalize();
    const desired = Vector3.Zero();
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) desired.addInPlace(forward);
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) desired.subtractInPlace(forward);
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) desired.subtractInPlace(right);
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) desired.addInPlace(right);
    if (desired.lengthSquared() > 0) desired.normalize();

    const crouching = this.isCrouching();
    const sprinting = this.isSprinting();
    const staminaRegen = sprinting && desired.lengthSquared() > 0.05 ? -15 : 19;
    this.stamina = Math.max(0, Math.min(100, this.stamina + staminaRegen * deltaSeconds));
    const targetEyeHeight = crouching ? 1.08 : this.baseEyeHeight;
    this.currentEyeHeight += (targetEyeHeight - this.currentEyeHeight) * Math.min(1, deltaSeconds * 9);

    // Babylon collision uses this ellipsoid, so crouching changes the collision body
    // without scaling the mesh that parents the camera.
    const targetEllipsoidY = crouching ? 0.55 : 0.88;
    const targetOffsetY = crouching ? 0.57 : 0.9;
    this.collider.ellipsoid.y += (targetEllipsoidY - this.collider.ellipsoid.y) * Math.min(1, deltaSeconds * 12);
    this.collider.ellipsoidOffset.y += (targetOffsetY - this.collider.ellipsoidOffset.y) * Math.min(1, deltaSeconds * 12);

    const movingBackward = desired.lengthSquared() > 0.01 && Vector3.Dot(desired, forward) < -0.25;
    const targetSpeed = crouching ? 1.75 : movingBackward ? (sprinting ? 3.6 : 2.7) : sprinting ? 5.7 : 3.25;
    const targetVelocity = desired.scale(targetSpeed);
    const acceleration = desired.lengthSquared() > 0 ? 11 : 16;
    const blend = 1 - Math.exp(-acceleration * deltaSeconds);
    this.velocity = Vector3.Lerp(this.velocity, targetVelocity, blend);

    const rayOrigin = this.collider.position.add(new Vector3(0, 0.42, 0));
    const groundPick = this.scene.pickWithRay(
      new Ray(rayOrigin, Vector3.Down(), 0.72),
      (mesh: AbstractMesh) => mesh.checkCollisions && mesh !== this.collider
    );
    this.isGrounded = Boolean(groundPick?.hit && groundPick.distance <= 0.58);
    if (this.isGrounded && this.verticalVelocity <= 0) this.verticalVelocity = -0.08;
    else this.verticalVelocity = Math.max(-22, this.verticalVelocity - 18 * deltaSeconds);

    const movement = this.velocity.scale(deltaSeconds);
    movement.y = this.verticalVelocity * deltaSeconds;
    const beforeMove = this.collider.position.clone();
    this.collider.moveWithCollisions(movement);

    // Safety clamp behind the invisible wall meshes. It only activates at the
    // extreme campaign border and prevents a missed collision frame from letting
    // the player fall outside the authored maps.
    const clampedX = Math.max(-48.6, Math.min(48.6, this.collider.position.x));
    const clampedZ = Math.max(-31.5, Math.min(2127.5, this.collider.position.z));
    if (clampedX !== this.collider.position.x || clampedZ !== this.collider.position.z) {
      this.collider.position.x = clampedX;
      this.collider.position.z = clampedZ;
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // A downward collision with almost no vertical displacement is authoritative
    // evidence that the feet are on a floor. This avoids an ever-growing downward
    // velocity cancelling horizontal movement when ray tolerances differ by browser.
    const actualVertical = this.collider.position.y - beforeMove.y;
    const downwardBlocked = movement.y < -0.0001 && actualVertical > movement.y * 0.35;
    if (downwardBlocked) {
      this.isGrounded = true;
      this.verticalVelocity = -0.08;
    }

    if (this.collider.position.y < -8) {
      this.teleport(new Vector3(0, 1, 0));
      this.damage(20);
    }

    const horizontalDistance = Vector3.Distance(
      new Vector3(this.collider.position.x, 0, this.collider.position.z),
      new Vector3(this.lastPosition.x, 0, this.lastPosition.z)
    );
    this.stepDistance += horizontalDistance;
    if (this.isGrounded && this.stepDistance > (sprinting ? 1.25 : 1.65)) {
      this.audio.footstep(this.surface);
      this.callbacks.onFootstep(this.collider.position.clone(), crouching ? 0.18 : sprinting ? 0.92 : 0.42, this.surface, sprinting, crouching);
      this.stepDistance = 0;
    }
    this.lastPosition.copyFrom(this.collider.position);

    let bob = 0;
    if (!this.settings.reducedHeadBob && desired.lengthSquared() > 0.05 && this.isGrounded) {
      this.bobTime += deltaSeconds * (sprinting ? 12 : 8);
      bob = Math.sin(this.bobTime) * (sprinting ? 0.035 : 0.022);
      this.camera.rotation.z = Math.sin(this.bobTime * 0.5) * 0.004;
    } else {
      this.camera.rotation.z *= 0.85;
    }

    this.syncCameraAndListener(bob);
  }

  private syncCameraAndListener(bob: number): void {
    this.camera.position.set(0, this.currentEyeHeight + bob, 0);
    this.collider.computeWorldMatrix(true);
    this.camera.computeWorldMatrix(true);
    const listenerPosition = this.collider.position.add(this.camera.position);
    this.audio.updateListener(listenerPosition, this.camera.getForwardRay().direction);
  }

  private bindInput(): void {
    window.addEventListener("keydown", (event) => {
      if (event.repeat && ["KeyE", "KeyF", "KeyG", "KeyQ", "KeyR", "Escape", "Backquote"].includes(event.code)) return;
      this.keys.add(event.code);
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.code === "Escape") {
        event.preventDefault();
        this.callbacks.onPause();
      }
      if (event.code === "KeyF") this.callbacks.onTorchToggle();
      if (event.code === "KeyG") this.callbacks.onThrow();
      if (event.code === "KeyQ") this.callbacks.onSoundDevice();
      if (event.code === "KeyR") this.callbacks.onRearDoor();
      if (event.code === "Space") this.callbacks.onContextAction();
      if (event.code === "ShiftLeft" && this.settings.sprintMode === "toggle") this.sprintToggled = !this.sprintToggled;
      if ((event.code === "ControlLeft" || event.code === "KeyC") && this.settings.crouchMode === "toggle") {
        this.crouchToggled = !this.crouchToggled;
      }
    });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    this.canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    this.canvas.addEventListener("pointerdown", (event) => {
      if (!this.enabled) return;
      if (document.pointerLockElement !== this.canvas) {
        this.requestPointerLock();
        return;
      }
      if (event.button === 0) this.callbacks.onFireUse();
      if (event.button === 2) this.callbacks.onHeavyAttack();
    });
    window.addEventListener("blur", () => this.keys.clear());
  }

  private sensitivityToAngular(value: number): number {
    return 4200 / Math.max(0.1, value);
  }
}
