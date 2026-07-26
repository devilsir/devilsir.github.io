import { Color3 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ProceduralMaterials } from "../world/ProceduralMaterials";
import type { PlayerController } from "../core/PlayerController";
import type { FireSystem } from "../systems/FireSystem";
import type { AudioManager } from "../systems/AudioManager";
import type { GameUI } from "../ui/GameUI";

interface Projectile {
  mesh: Mesh;
  velocity: Vector3;
  age: number;
  colorIndex: number;
}

interface FallingDebris {
  mesh: Mesh;
  velocity: number;
  angularVelocity: Vector3;
  age: number;
}

export interface BodyBossCallbacks {
  onPhaseChanged: (phase: number) => void;
  onDefeated: () => void;
  onHint: (text: string) => void;
  canUseItem: () => boolean;
  onUseItem: () => boolean;
  onArenaDamage: (severity: number) => void;
}

export class BodyBoss {
  public readonly root: TransformNode;
  public phase = 0;
  public health = 100;
  public active = false;
  public stunned = false;
  private readonly scene: Scene;
  private readonly materials: ProceduralMaterials;
  private readonly player: PlayerController;
  private readonly fire: FireSystem;
  private readonly audio: AudioManager;
  private readonly ui: GameUI;
  private readonly callbacks: BodyBossCallbacks;
  private readonly torso: Mesh;
  private readonly head: Mesh;
  private readonly nose: Mesh;
  private readonly seam: Mesh;
  private readonly arms: TransformNode[] = [];
  private readonly projectiles: Projectile[] = [];
  private readonly debris: FallingDebris[] = [];
  private attackTimer = 0;
  private phaseTimer = 0;
  private tacticalTimer = 0;
  private tacticalOpen = false;
  private defense = 0;
  private spotlightHits = 0;
  private chargeTarget = Vector3.Zero();
  private charging = false;
  private defeated = false;
  private extendedReactionWindows = false;

  public constructor(
    scene: Scene,
    materials: ProceduralMaterials,
    player: PlayerController,
    fire: FireSystem,
    audio: AudioManager,
    ui: GameUI,
    callbacks: BodyBossCallbacks
  ) {
    this.scene = scene;
    this.materials = materials;
    this.player = player;
    this.fire = fire;
    this.audio = audio;
    this.ui = ui;
    this.callbacks = callbacks;

    this.root = new TransformNode("Body-root", scene);
    this.root.position = new Vector3(0, 0, 162);
    this.root.scaling.setAll(1.12);
    this.root.setEnabled(false);

    this.torso = MeshBuilder.CreateSphere("Body-torso", { diameter: 4.4, segments: 18 }, scene);
    this.torso.parent = this.root;
    this.torso.position.y = 3.1;
    this.torso.scaling = new Vector3(1.18, 1.12, 0.88);
    this.torso.material = materials.get("plush", 0);
    this.torso.checkCollisions = true;

    const bellyPatch = MeshBuilder.CreateSphere("Body-belly-patch", { diameter: 2.55, segments: 14 }, scene);
    bellyPatch.parent = this.torso;
    bellyPatch.position = new Vector3(0, -0.18, -1.84);
    bellyPatch.scaling = new Vector3(1.05, 1.15, 0.18);
    bellyPatch.material = materials.get("plush", 2);

    this.head = MeshBuilder.CreateSphere("Body-head", { diameter: 3.0, segments: 18 }, scene);
    this.head.parent = this.root;
    this.head.position.y = 6.1;
    this.head.scaling = new Vector3(1.08, 0.95, 0.98);
    this.head.material = materials.get("plush", 0);
    this.head.checkCollisions = true;

    for (const side of [-1, 1]) {
      const eye = MeshBuilder.CreateSphere(`Body-eye-${side}`, { diameter: 0.42, segments: 10 }, scene);
      eye.parent = this.head;
      eye.position = new Vector3(side * 0.57, 0.35, -1.36);
      eye.scaling.z = 0.35;
      eye.material = materials.solid(`Body-eye-${side}`, new Color3(0.88, 0.84, 0.67), 0.3);
      const pupil = MeshBuilder.CreateSphere(`Body-pupil-${side}`, { diameter: 0.16, segments: 8 }, scene);
      pupil.parent = eye;
      pupil.position.z = -0.32;
      pupil.material = materials.solid("Body-pupil", new Color3(0.02, 0.015, 0.012), 0.2);
    }

    this.nose = MeshBuilder.CreateSphere("Body-nose", { diameter: 0.83, segments: 14 }, scene);
    this.nose.parent = this.head;
    this.nose.position = new Vector3(0, -0.12, -1.52);
    this.nose.material = materials.get("plastic", 0);

    const mouth = MeshBuilder.CreateTorus("Body-mouth", { diameter: 1.15, thickness: 0.12, tessellation: 28 }, scene);
    mouth.parent = this.head;
    mouth.position = new Vector3(0, -0.68, -1.35);
    mouth.rotation.x = Math.PI / 2;
    mouth.scaling.y = 0.42;
    mouth.material = materials.solid("Body-mouth-dark", new Color3(0.04, 0.012, 0.01), 0.8);

    const hat = MeshBuilder.CreateCylinder("Body-hat", { height: 0.8, diameterTop: 0.9, diameterBottom: 1.5, tessellation: 12 }, scene);
    hat.parent = this.head;
    hat.position.y = 1.5;
    hat.rotation.z = -0.14;
    hat.material = materials.get("plastic", 1);

    this.createArms();
    this.createLegs();
    this.createStitches();

    this.seam = MeshBuilder.CreateBox("Body-burnable-seam", { width: 1.4, height: 2.7, depth: 0.12 }, scene);
    this.seam.parent = this.torso;
    this.seam.position = new Vector3(0, 0.05, 1.85);
    this.seam.material = materials.get("plush", 2);
    this.seam.isPickable = true;
    this.seam.setEnabled(false);
    fire.register(this.seam, {
      health: 120,
      spreadRadius: 1,
      onIgnite: () => {
        if (this.phase >= 2 && this.stunned) {
          this.callbacks.onHint("As costuras estão queimando!");
          this.audio.plushCry();
        }
      },
      onBurnTick: (damage) => {
        if (this.phase >= 2 && this.stunned) this.applyDamage(damage * 0.19, true);
      },
      onDestroyed: () => {
        this.applyDamage(22, true);
        this.seam.material = materials.get("burned", 0);
      }
    });

    scene.onBeforeRenderObservable.add(() => this.update(scene.getEngine().getDeltaTime() / 1000));
  }

  public setExtendedReactionWindows(enabled: boolean): void {
    this.extendedReactionWindows = enabled;
  }

  public markDefeatedForRestore(): void {
    this.active = false;
    this.defeated = true;
    this.health = 0;
    this.phase = 3;
    this.root.setEnabled(true);
    this.root.rotation.z = Math.PI / 2;
    this.root.position = new Vector3(0, 2.2, 162);
    this.seam.setEnabled(false);
    this.detachNose();
  }

  public start(phase = 1): void {
    this.active = true;
    this.defeated = false;
    this.root.setEnabled(true);
    this.root.position = new Vector3(0, 0, 162);
    this.health = phase === 1 ? 100 : phase === 2 ? 66 : 32;
    this.setPhase(phase);
    this.ui.showBossUI("BODY");
    this.ui.setBossHealth(this.health);
    this.audio.startHorrorDrone();
    this.callbacks.onHint("Use as fileiras de cadeiras como cobertura.");
  }

  public setPhase(phase: number): void {
    this.phase = Math.max(1, Math.min(3, phase));
    this.phaseTimer = 0;
    this.attackTimer = 1.2;
    this.tacticalTimer = 3.5;
    this.spotlightHits = 0;
    this.stunned = false;
    this.charging = false;
    this.seam.setEnabled(this.phase >= 2);
    if (this.phase === 2) {
      this.callbacks.onHint("Redirecione dois refletores e ataque as costuras nas costas.");
      this.callbacks.onArenaDamage(2);
    }
    if (this.phase === 3) {
      this.callbacks.onHint("O auditório está pegando fogo. Continue em movimento.");
      this.torso.material = this.materials.get("burned", 0);
      this.head.material = this.materials.get("burned", 0);
      this.fire.igniteAt(this.root.position.add(new Vector3(0, 2.2, 0)), 45, true);
      this.callbacks.onArenaDamage(3);
    }
    this.callbacks.onPhaseChanged(this.phase);
  }

  public activateSpotlight(): void {
    if (!this.active || this.phase !== 2 || this.stunned) return;
    this.spotlightHits += 1;
    this.audio.impact(0.35);
    if (this.spotlightHits >= 2) {
      this.stunned = true;
      this.phaseTimer = 0;
      this.head.rotation.x = -0.45;
      this.callbacks.onHint("Body está cego. Vá para trás e queime as costuras!");
    }
  }

  public performTacticalAction(action: string): void {
    if (!this.tacticalOpen) return;
    this.tacticalOpen = false;
    this.ui.hideTacticalActions();
    if (action === "attack") {
      if (this.phase === 2 && !this.stunned) this.callbacks.onHint("O tecido frontal é grosso demais.");
      else this.applyDamage(this.phase === 1 ? 8 : 5, false);
    } else if (action === "defend") {
      this.defense = 0.65;
      this.callbacks.onHint("Você se prepara para absorver o próximo golpe.");
    } else if (action === "item") {
      if (this.callbacks.onUseItem()) {
        this.player.heal(24);
        this.callbacks.onHint("Você usa o curativo improvisado.");
      } else {
        this.callbacks.onHint("Você não tem nenhum curativo disponível.");
      }
    } else if (action === "examine") {
      const hint = this.phase === 1
        ? "Os braços antecipam o golpe pela direção dos ombros."
        : this.phase === 2
          ? "A luz o faz proteger os olhos e expor as costas."
          : "As chamas o deixam rápido, mas os ataques ficam previsíveis.";
      this.callbacks.onHint(hint);
    } else if (action === "environment") {
      if (this.phase === 2) this.activateSpotlight();
      else if (this.phase === 3) {
        this.fire.igniteAt(this.root.position.add(new Vector3((Math.random() - 0.5) * 3, 0.3, (Math.random() - 0.5) * 3)), 7, false);
        this.applyDamage(4, true);
      } else {
        this.callbacks.onHint("As cadeiras podem interromper uma investida.");
      }
    } else if (action === "react") {
      this.root.position.addInPlace(this.player.forward().scale(-1.2));
      this.callbacks.onHint("Você escapa por pouco.");
    }
    this.tacticalTimer = this.phase === 3 ? 5 : 7;
  }

  public getNose(): Mesh {
    return this.nose;
  }

  public detachNose(): void {
    this.nose.setParent(null);
    this.nose.position = this.root.position.add(new Vector3(0.6, 0.65, -1.2));
    this.nose.scaling.setAll(0.65);
    this.nose.checkCollisions = true;
  }

  public inspectState(): string {
    return `Body: active=${this.active} phase=${this.phase} health=${this.health.toFixed(1)} stunned=${this.stunned} projectiles=${this.projectiles.length}`;
  }

  private update(deltaSeconds: number): void {
    if (!this.active || this.defeated) return;
    this.phaseTimer += deltaSeconds;
    this.attackTimer -= deltaSeconds;
    this.tacticalTimer -= deltaSeconds;
    this.defense = Math.max(0, this.defense - deltaSeconds * 0.08);

    const playerPosition = this.player.collider.position;
    const toPlayer = playerPosition.subtract(this.root.position);
    toPlayer.y = 0;
    const distance = toPlayer.length();
    const direction = distance > 0.001 ? toPlayer.normalize() : Vector3.Zero();
    const targetRotation = Math.atan2(direction.x, direction.z);
    this.root.rotation.y += this.shortestAngle(this.root.rotation.y, targetRotation) * Math.min(1, deltaSeconds * (this.phase === 3 ? 5 : 2.3));

    this.animateBody(deltaSeconds);
    this.updateProjectiles(deltaSeconds);
    this.updateDebris(deltaSeconds);

    if (this.stunned) {
      if (this.phaseTimer > (this.phase === 2 ? 7.2 : 3.5)) {
        this.stunned = false;
        this.spotlightHits = 0;
        this.head.rotation.x = 0;
        this.callbacks.onHint("Body recuperou a visão.");
      }
      return;
    }

    if (this.charging) {
      const chargeDirection = this.chargeTarget.subtract(this.root.position);
      chargeDirection.y = 0;
      if (chargeDirection.length() > 0.3) {
        this.root.position.addInPlace(chargeDirection.normalize().scale(deltaSeconds * (this.phase === 3 ? 10 : 7.4)));
      } else {
        this.charging = false;
        this.audio.impact(1.4);
        this.callbacks.onArenaDamage(1);
      }
      if (Vector3.Distance(this.root.position, playerPosition) < 2.1) {
        this.hitPlayer(this.phase === 3 ? 26 : 19);
        this.charging = false;
      }
    } else if (this.attackTimer <= 0) {
      this.chooseAttack(distance, direction);
      this.attackTimer = this.phase === 1 ? 3.0 : this.phase === 2 ? 2.45 : 1.65;
    }

    if (this.tacticalTimer <= 0 && !this.tacticalOpen) this.openTacticalWindow();
    if (this.phase === 3 && Math.random() < deltaSeconds * 0.23) {
      const firePosition = this.root.position.add(new Vector3((Math.random() - 0.5) * 15, 0.1, (Math.random() - 0.5) * 11));
      this.fire.igniteAt(firePosition, 8 + Math.random() * 6, false);
    }
    if (this.phase === 3 && this.debris.length < 8 && Math.random() < deltaSeconds * 0.34) this.spawnCeilingDebris();
  }

  private chooseAttack(distance: number, direction: Vector3): void {
    const roll = Math.random();
    if (distance < 3.2 && roll < 0.55) {
      this.fourArmStrike(direction);
    } else if (roll < 0.78) {
      this.spawnProjectileVolley(this.phase === 1 ? 3 : this.phase === 2 ? 4 : 6);
    } else {
      this.chargeTarget = this.player.collider.position.clone();
      this.charging = true;
      this.audio.impact(0.55);
      this.callbacks.onHint("Body abaixa os quatro ombros para investir!");
    }
  }

  private fourArmStrike(direction: Vector3): void {
    this.audio.impact(0.8);
    this.callbacks.onArenaDamage(1);
    this.arms.forEach((arm, index) => {
      arm.rotation.x = index % 2 ? -1.2 : 1.2;
      arm.rotation.z += (index < 2 ? -1 : 1) * 0.8;
    });
    if (Vector3.Distance(this.root.position, this.player.collider.position) < 4.1) {
      this.hitPlayer(this.phase === 3 ? 22 : 15);
      this.player.collider.position.addInPlace(direction.scale(1.15));
    }
  }

  private spawnProjectileVolley(count: number): void {
    const colors = [new Color3(0.8, 0.08, 0.06), new Color3(0.07, 0.45, 0.78), new Color3(0.88, 0.68, 0.05), new Color3(0.36, 0.75, 0.18)];
    for (let i = 0; i < count; i += 1) {
      const colorIndex = i % colors.length;
      const projectile = MeshBuilder.CreateSphere(`Body-projectile-${Date.now()}-${i}`, { diameter: 0.42, segments: 8 }, this.scene);
      projectile.position = this.root.position.add(new Vector3((i - count / 2) * 0.4, 4.2 + Math.sin(i) * 0.4, -0.6));
      projectile.material = this.materials.emissive(`projectile-${colorIndex}`, colors[colorIndex]!, 1.3);
      projectile.isPickable = false;
      const target = this.player.collider.position.add(new Vector3((i - count / 2) * 0.6, 0.9, 0));
      const velocity = target.subtract(projectile.position).normalize().scale(this.phase === 3 ? 8.5 : 6.3);
      this.projectiles.push({ mesh: projectile, velocity, age: 0, colorIndex });
    }
    this.audio.plushCry();
  }

  private updateProjectiles(deltaSeconds: number): void {
    for (let index = this.projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.projectiles[index]!;
      projectile.age += deltaSeconds;
      projectile.mesh.position.addInPlace(projectile.velocity.scale(deltaSeconds));
      projectile.mesh.rotation.x += deltaSeconds * (4 + projectile.colorIndex);
      if (Vector3.Distance(projectile.mesh.position, this.player.collider.position.add(new Vector3(0, 0.8, 0))) < 0.75) {
        this.hitPlayer(8 + projectile.colorIndex * 1.5);
        projectile.mesh.dispose();
        this.projectiles.splice(index, 1);
      } else if (projectile.age > 6) {
        projectile.mesh.dispose();
        this.projectiles.splice(index, 1);
      }
    }
  }

  private openTacticalWindow(): void {
    this.tacticalOpen = true;
    const extended = this.extendedReactionWindows ? 1.65 : 1;
    this.ui.showTacticalActions([
      { id: "attack", label: "ATACAR" },
      { id: "defend", label: "DEFENDER" },
      { id: "item", label: "USAR ITEM", enabled: this.player.health < 88 && this.callbacks.canUseItem() },
      { id: "examine", label: "EXAMINAR" },
      { id: "environment", label: "AÇÃO AMBIENTAL" },
      { id: "react", label: "REAÇÃO CONTEXTUAL" }
    ], (action) => this.performTacticalAction(action));
    window.setTimeout(() => {
      if (this.tacticalOpen) {
        this.tacticalOpen = false;
        this.ui.hideTacticalActions();
        this.tacticalTimer = 4;
      }
    }, 3600 * extended);
  }


  private spawnCeilingDebris(): void {
    const target = this.player.collider.position.add(new Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5));
    target.x = Math.max(-15, Math.min(15, target.x));
    target.z = Math.max(140, Math.min(170, target.z));
    const mesh = MeshBuilder.CreateBox(`ceiling-debris-${Date.now()}-${this.debris.length}`, {
      width: 0.45 + Math.random() * 0.8,
      height: 0.28 + Math.random() * 0.5,
      depth: 0.45 + Math.random() * 0.8
    }, this.scene);
    mesh.position = new Vector3(target.x, 9.4 + Math.random() * 2.4, target.z);
    mesh.material = this.materials.get(Math.random() > 0.45 ? "concrete" : "metal", this.debris.length);
    mesh.isPickable = false;
    this.debris.push({
      mesh,
      velocity: 1.8 + Math.random() * 2.4,
      angularVelocity: new Vector3(Math.random() * 4, Math.random() * 4, Math.random() * 4),
      age: 0
    });
    this.callbacks.onHint("Poeira cai do teto — saia da área!");
  }

  private updateDebris(deltaSeconds: number): void {
    for (let index = this.debris.length - 1; index >= 0; index -= 1) {
      const piece = this.debris[index]!;
      piece.age += deltaSeconds;
      piece.velocity += deltaSeconds * 10.5;
      piece.mesh.position.y -= piece.velocity * deltaSeconds;
      piece.mesh.rotation.addInPlace(piece.angularVelocity.scale(deltaSeconds));
      if (piece.mesh.position.y <= 0.35) {
        if (Vector3.Distance(piece.mesh.position, this.player.collider.position) < 1.65) this.hitPlayer(14);
        this.audio.impact(0.8);
        this.callbacks.onArenaDamage(1);
        piece.mesh.dispose();
        this.debris.splice(index, 1);
      } else if (piece.age > 5) {
        piece.mesh.dispose();
        this.debris.splice(index, 1);
      }
    }
  }

  private applyDamage(amount: number, environmental: boolean): void {
    if (!this.active || this.defeated) return;
    if (this.phase === 2 && !environmental && !this.stunned) return;
    this.health = Math.max(0, this.health - amount);
    this.ui.setBossHealth(this.health);
    this.root.scaling.setAll(1.12 + Math.sin(performance.now() * 0.03) * 0.04);
    this.audio.impact(0.35);
    if (this.health <= 66 && this.phase === 1) this.setPhase(2);
    else if (this.health <= 33 && this.phase === 2) this.setPhase(3);
    else if (this.health <= 0) this.defeat();
  }

  private hitPlayer(amount: number): void {
    const reduced = amount * (1 - Math.min(0.75, this.defense));
    this.player.damage(reduced);
    this.ui.flashDamage(reduced / 20);
    this.audio.impact(0.65);
    this.defense = 0;
  }

  private defeat(): void {
    if (this.defeated) return;
    this.defeated = true;
    this.active = false;
    this.ui.hideTacticalActions();
    this.ui.setBossHealth(0);
    this.audio.stopLoop("drone");
    this.root.rotation.z = Math.PI / 2;
    this.root.position.y = 2.2;
    this.fire.igniteAt(this.root.position.add(new Vector3(0, 0.5, 0)), 18, true);
    this.projectiles.forEach((projectile) => projectile.mesh.dispose());
    this.projectiles.length = 0;
    this.debris.forEach((piece) => piece.mesh.dispose());
    this.debris.length = 0;
    window.setTimeout(() => this.callbacks.onDefeated(), 1800);
  }

  private animateBody(deltaSeconds: number): void {
    const time = performance.now() * 0.001;
    this.torso.scaling.y = 1.12 + Math.sin(time * 2.2) * 0.035;
    this.head.rotation.z = Math.sin(time * 1.4) * 0.045;
    this.arms.forEach((arm, index) => {
      const speed = this.phase === 3 ? 4.4 : 2.1;
      arm.rotation.x += (Math.sin(time * speed + index * 1.4) * 0.3 - arm.rotation.x) * Math.min(1, deltaSeconds * 5);
      arm.rotation.z += (Math.cos(time * speed * 0.8 + index) * 0.16 - arm.rotation.z) * Math.min(1, deltaSeconds * 4);
    });
  }

  private createArms(): void {
    const positions = [
      new Vector3(-2.1, 4.25, 0),
      new Vector3(-2.0, 2.55, 0.1),
      new Vector3(2.1, 4.25, 0),
      new Vector3(2.0, 2.55, 0.1)
    ];
    positions.forEach((position, index) => {
      const pivot = new TransformNode(`Body-arm-pivot-${index}`, this.scene);
      pivot.parent = this.root;
      pivot.position = position;
      pivot.rotation.z = index < 2 ? 0.42 : -0.42;
      const upper = MeshBuilder.CreateCapsule(`Body-upper-arm-${index}`, { height: 2.6, radius: 0.48, tessellation: 12 }, this.scene);
      upper.parent = pivot;
      upper.position.y = -0.75;
      upper.material = this.materials.get("plush", 0);
      upper.checkCollisions = true;
      const forearm = MeshBuilder.CreateCapsule(`Body-forearm-${index}`, { height: 2.35, radius: 0.42, tessellation: 12 }, this.scene);
      forearm.parent = pivot;
      forearm.position = new Vector3(0, -2.35, -0.1);
      forearm.rotation.z = index % 2 ? 0.28 : -0.28;
      forearm.material = this.materials.get("plush", 0);
      const hand = MeshBuilder.CreateSphere(`Body-hand-${index}`, { diameter: 1.15, segments: 10 }, this.scene);
      hand.parent = pivot;
      hand.position = new Vector3(index % 2 ? 0.35 : -0.35, -3.55, -0.08);
      hand.scaling = new Vector3(0.85, 1.15, 0.65);
      hand.material = this.materials.get("plush", 0);
      this.arms.push(pivot);
    });
  }

  private createLegs(): void {
    for (const side of [-1, 1]) {
      const leg = MeshBuilder.CreateCapsule(`Body-leg-${side}`, { height: 3.2, radius: 0.65, tessellation: 12 }, this.scene);
      leg.parent = this.root;
      leg.position = new Vector3(side * 1.15, 0.7, 0.2);
      leg.rotation.z = side * -0.12;
      leg.material = this.materials.get("plush", 0);
      leg.checkCollisions = true;
      const foot = MeshBuilder.CreateSphere(`Body-foot-${side}`, { diameter: 1.5, segments: 10 }, this.scene);
      foot.parent = this.root;
      foot.position = new Vector3(side * 1.22, -0.75, -0.55);
      foot.scaling = new Vector3(0.8, 0.55, 1.3);
      foot.material = this.materials.get("plush", 0);
      foot.checkCollisions = true;
    }
  }

  private createStitches(): void {
    for (let i = 0; i < 8; i += 1) {
      const stitch = MeshBuilder.CreateBox(`Body-stitch-${i}`, { width: 0.58, height: 0.06, depth: 0.06 }, this.scene);
      stitch.parent = this.torso;
      stitch.position = new Vector3(0, -1.15 + i * 0.33, 1.82);
      stitch.rotation.z = (i % 2 ? 1 : -1) * 0.24;
      stitch.material = this.materials.solid("stitch-thread", new Color3(0.12, 0.05, 0.035), 0.9);
    }
  }

  private shortestAngle(from: number, to: number): number {
    let difference = (to - from + Math.PI) % (Math.PI * 2) - Math.PI;
    if (difference < -Math.PI) difference += Math.PI * 2;
    return difference;
  }
}
