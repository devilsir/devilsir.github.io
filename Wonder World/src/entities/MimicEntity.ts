import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ProceduralMaterials } from "../world/ProceduralMaterials";
import type { AudioManager } from "../systems/AudioManager";

export type MimicIdentity = "maya" | "daniel" | "employee" | "child" | "blank" | "composite";

interface IdentityPreset {
  headScale: Vector3;
  torsoScale: Vector3;
  limbScale: number;
  skin: string;
  hair: string;
  clothingVariant: number;
  eyeSpacing: number;
  expressionDelay: number;
}

interface LimbSet {
  leftArm: TransformNode;
  rightArm: TransformNode;
  leftLeg: TransformNode;
  rightLeg: TransformNode;
  arms: Mesh[];
  legs: Mesh[];
}

export class MimicEntity {
  public identity: MimicIdentity = "maya";
  public revealProgress = 0;
  public revealing = false;
  public visible = false;
  private readonly scene: Scene;
  private readonly materials: ProceduralMaterials;
  private readonly audio: AudioManager;
  private readonly root: TransformNode;
  private readonly torso: Mesh;
  private readonly pelvis: Mesh;
  private readonly neck: Mesh;
  private readonly head: Mesh;
  private readonly hair: Mesh;
  private readonly faceTexture: DynamicTexture;
  private readonly faceMaterial: PBRMaterial;
  private readonly clothing: Mesh[] = [];
  private readonly victimFragments: Mesh[] = [];
  private readonly limbs: LimbSet;
  private readonly reflectionRoot: TransformNode;
  private readonly reflectionHead: Mesh;
  private expressionClock = 0;
  private identityClock = 0;
  private currentPreset: IdentityPreset;
  private targetPreset: IdentityPreset;
  private reflectionDelay = 0.38;
  private reflectionOverrideTimer = 0;
  private reflectedIdentity: MimicIdentity = "maya";
  private onRevealComplete: (() => void) | null = null;

  private readonly presets: Record<MimicIdentity, IdentityPreset> = {
    maya: {
      headScale: new Vector3(0.92, 1.02, 0.88),
      torsoScale: new Vector3(0.88, 1, 0.72),
      limbScale: 1,
      skin: "#b88d73",
      hair: "#171417",
      clothingVariant: 0,
      eyeSpacing: 0.22,
      expressionDelay: 0.22
    },
    daniel: {
      headScale: new Vector3(1.02, 1.05, 0.92),
      torsoScale: new Vector3(1.08, 1.04, 0.82),
      limbScale: 1.03,
      skin: "#aa8069",
      hair: "#352a22",
      clothingVariant: 1,
      eyeSpacing: 0.24,
      expressionDelay: 0.34
    },
    employee: {
      headScale: new Vector3(0.96, 1.08, 0.86),
      torsoScale: new Vector3(0.94, 1.02, 0.76),
      limbScale: 1.08,
      skin: "#9d7662",
      hair: "#201d1c",
      clothingVariant: 2,
      eyeSpacing: 0.2,
      expressionDelay: 0.48
    },
    child: {
      headScale: new Vector3(1.18, 1.18, 1.02),
      torsoScale: new Vector3(0.7, 0.72, 0.64),
      limbScale: 0.68,
      skin: "#c7997d",
      hair: "#4b3022",
      clothingVariant: 3,
      eyeSpacing: 0.26,
      expressionDelay: 0.6
    },
    blank: {
      headScale: new Vector3(0.94, 1.1, 0.82),
      torsoScale: new Vector3(0.9, 1, 0.7),
      limbScale: 1,
      skin: "#c7c2b7",
      hair: "#c7c2b7",
      clothingVariant: 4,
      eyeSpacing: 0,
      expressionDelay: 0.8
    },
    composite: {
      headScale: new Vector3(1.14, 1.28, 0.96),
      torsoScale: new Vector3(1.18, 1.32, 0.86),
      limbScale: 1.62,
      skin: "#8c6356",
      hair: "#181218",
      clothingVariant: 5,
      eyeSpacing: 0.34,
      expressionDelay: 1.1
    }
  };

  public constructor(scene: Scene, materials: ProceduralMaterials, audio: AudioManager) {
    this.scene = scene;
    this.materials = materials;
    this.audio = audio;
    this.currentPreset = this.clonePreset(this.presets.maya);
    this.targetPreset = this.clonePreset(this.presets.maya);
    this.root = new TransformNode("mimic-root", scene);

    this.pelvis = MeshBuilder.CreateSphere("mimic-pelvis", { diameter: 1.05, segments: 12 }, scene);
    this.pelvis.parent = this.root;
    this.pelvis.position.y = 2.15;
    this.pelvis.scaling = new Vector3(0.86, 0.72, 0.7);
    this.pelvis.material = materials.get("plush", 8);
    this.torso = MeshBuilder.CreateCapsule("mimic-torso", { height: 2.25, radius: 0.52, tessellation: 14 }, scene);
    this.torso.parent = this.root;
    this.torso.position.y = 3.55;
    this.torso.material = materials.get("plush", 8);
    this.neck = MeshBuilder.CreateCylinder("mimic-neck", { height: 0.52, diameterTop: 0.34, diameterBottom: 0.42, tessellation: 10 }, scene);
    this.neck.parent = this.root;
    this.neck.position.y = 4.95;
    this.neck.material = materials.get("plastic", 7);

    this.faceTexture = new DynamicTexture("mimic-face-texture", { width: 512, height: 512 }, scene, false);
    this.faceMaterial = new PBRMaterial("mimic-face-material", scene);
    this.faceMaterial.albedoTexture = this.faceTexture;
    this.faceMaterial.roughness = 0.66;
    this.faceMaterial.metallic = 0.02;
    this.head = MeshBuilder.CreateSphere("mimic-head", { diameter: 1.05, segments: 20 }, scene);
    this.head.parent = this.root;
    this.head.position.y = 5.65;
    this.head.material = this.faceMaterial;
    this.hair = MeshBuilder.CreateSphere("mimic-hair", { diameter: 1.1, segments: 14, slice: 0.54 }, scene);
    this.hair.parent = this.head;
    this.hair.position.y = 0.25;
    this.hair.material = materials.solid("mimic-hair-material", new Color3(0.07, 0.055, 0.065), 0.86);

    this.limbs = this.createLimbs();
    this.createClothing();
    this.createVictimFragments();

    this.reflectionRoot = new TransformNode("mimic-reflection-root", scene);
    this.reflectionRoot.parent = this.root;
    this.reflectionRoot.position = new Vector3(0, 0, 0.12);
    this.reflectionHead = MeshBuilder.CreateSphere("mimic-reflection-head", { diameter: 1.08, segments: 14 }, scene);
    this.reflectionHead.parent = this.reflectionRoot;
    this.reflectionHead.position.y = 5.65;
    this.reflectionHead.material = materials.get("glass", 7);
    this.reflectionHead.visibility = 0.13;
    this.reflectionHead.isPickable = false;

    this.redrawFace(this.identity, 0);
    this.setVisible(false);
  }

  public setPosition(position: Vector3, rotationY = 0): void {
    this.root.position.copyFrom(position);
    this.root.rotation.y = rotationY;
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.root.setEnabled(visible);
  }

  public setIdentity(identity: MimicIdentity, immediate = false): void {
    this.identity = identity;
    this.targetPreset = this.clonePreset(this.presets[identity]);
    this.identityClock = 0;
    if (immediate) {
      this.currentPreset = this.clonePreset(this.targetPreset);
      this.applyPreset(1);
      this.redrawFace(identity, 0);
      this.reflectedIdentity = identity;
    }
  }

  public startReveal(onComplete: () => void): void {
    this.setVisible(true);
    this.revealing = true;
    this.revealProgress = 0;
    this.onRevealComplete = onComplete;
    this.setIdentity("composite");
    this.audio.mimicVoice();
  }

  public update(deltaSeconds: number): void {
    if (!this.visible) return;
    this.expressionClock += deltaSeconds;
    this.identityClock += deltaSeconds;
    this.reflectionOverrideTimer = Math.max(0, this.reflectionOverrideTimer - deltaSeconds);
    const identityBlend = Math.min(1, this.identityClock / 1.15);
    this.applyPreset(identityBlend);
    if (this.identityClock > this.targetPreset.expressionDelay && this.expressionClock > this.targetPreset.expressionDelay) {
      this.redrawFace(this.identity, this.revealing ? this.revealProgress : 0);
      this.expressionClock = 0;
    }
    if (this.reflectionOverrideTimer <= 0 && this.identityClock > this.reflectionDelay && this.reflectedIdentity !== this.identity) {
      this.reflectedIdentity = this.identity;
      const preset = this.presets[this.reflectedIdentity];
      this.reflectionHead.scaling.copyFrom(preset.headScale);
    }
    if (this.revealing) this.updateReveal(deltaSeconds);
    else this.updateIdle(deltaSeconds);
  }

  public previewIdentity(identity: MimicIdentity): void {
    this.setVisible(true);
    this.setIdentity(identity, true);
  }

  public setMayaInjuredPose(): void {
    this.torso.rotation.z = 0.08;
    this.head.rotation.z = -0.1;
    this.limbs.leftArm.rotation.z = -0.42;
    this.limbs.rightArm.rotation.z = 0.2;
    this.limbs.leftLeg.rotation.z = -0.14;
    this.limbs.rightLeg.rotation.z = 0.08;
  }

  public setReflectionAnomaly(identity: MimicIdentity, duration = 2.4): void {
    this.reflectedIdentity = identity;
    this.reflectionOverrideTimer = Math.max(0.2, duration);
    this.reflectionHead.scaling.copyFrom(this.presets[identity].headScale);
    this.reflectionHead.visibility = identity === "blank" ? 0.28 : 0.18;
  }

  public getRoot(): TransformNode {
    return this.root;
  }

  public getReflectableMeshes(): Mesh[] {
    return this.root.getChildMeshes(false) as Mesh[];
  }

  public inspect(): string {
    return `mimic identity=${this.identity} revealing=${this.revealing} progress=${this.revealProgress.toFixed(2)} reflection=${this.reflectedIdentity}`;
  }

  private updateReveal(deltaSeconds: number): void {
    this.revealProgress = Math.min(1, this.revealProgress + deltaSeconds / 5.6);
    const p = this.revealProgress;
    const unfold = 1 - Math.pow(1 - p, 3);
    this.root.scaling.y = 1 + unfold * 0.28;
    this.neck.scaling.y = 1 + unfold * 2.8;
    this.head.position.y = 5.65 + unfold * 1.15;
    this.limbs.leftArm.scaling.y = 1 + unfold * 0.78;
    this.limbs.rightArm.scaling.y = 1 + unfold * 1.04;
    this.limbs.leftLeg.scaling.y = 1 + unfold * 0.55;
    this.limbs.rightLeg.scaling.y = 1 + unfold * 0.72;
    this.limbs.leftArm.rotation.z = -0.2 - unfold * 0.48;
    this.limbs.rightArm.rotation.z = 0.2 + unfold * 0.66;
    this.head.rotation.z = Math.sin(p * Math.PI * 7) * 0.11 * p;
    this.torso.rotation.z = Math.sin(p * Math.PI * 4) * 0.08;
    this.victimFragments.forEach((fragment, index) => {
      fragment.isVisible = p > 0.28 + index * 0.035;
      fragment.visibility = Math.min(1, (p - 0.25 - index * 0.035) * 4);
      fragment.position.z = -0.45 - Math.sin(p * 5 + index) * 0.12;
    });
    this.clothing.forEach((piece, index) => {
      piece.scaling.x = 1 + unfold * (0.08 + (index % 3) * 0.06);
      piece.rotation.z = Math.sin(p * 7 + index) * 0.06 * unfold;
    });
    if (p > 0.34 && p < 0.43 && this.identity !== "daniel") this.setIdentity("daniel");
    if (p > 0.5 && p < 0.59 && this.identity !== "child") this.setIdentity("child");
    if (p > 0.66 && p < 0.75 && this.identity !== "employee") this.setIdentity("employee");
    if (p > 0.8 && this.identity !== "composite") this.setIdentity("composite");
    if (p >= 1) {
      this.revealing = false;
      this.onRevealComplete?.();
      this.onRevealComplete = null;
    }
  }

  private updateIdle(deltaSeconds: number): void {
    const breathing = Math.sin(performance.now() * 0.0017) * 0.025;
    this.torso.scaling.y += ((this.currentPreset.torsoScale.y + breathing) - this.torso.scaling.y) * Math.min(1, deltaSeconds * 5);
    this.head.rotation.y = Math.sin(performance.now() * 0.0008) * 0.045;
  }

  private applyPreset(blend: number): void {
    const b = Math.max(0, Math.min(1, blend));
    this.currentPreset.headScale = Vector3.Lerp(this.currentPreset.headScale, this.targetPreset.headScale, b * 0.16);
    this.currentPreset.torsoScale = Vector3.Lerp(this.currentPreset.torsoScale, this.targetPreset.torsoScale, b * 0.16);
    this.currentPreset.limbScale += (this.targetPreset.limbScale - this.currentPreset.limbScale) * b * 0.16;
    this.head.scaling.copyFrom(this.currentPreset.headScale);
    this.torso.scaling.copyFrom(this.currentPreset.torsoScale);
    const limbScale = this.currentPreset.limbScale;
    [this.limbs.leftArm, this.limbs.rightArm, this.limbs.leftLeg, this.limbs.rightLeg].forEach((root) => root.scaling.y = limbScale);
    this.clothing.forEach((piece, index) => piece.isVisible = index % 6 === this.targetPreset.clothingVariant || index < 2);
  }

  private redrawFace(identity: MimicIdentity, corruption: number): void {
    const context = this.faceTexture.getContext();
    const preset = this.presets[identity];
    context.clearRect(0, 0, 512, 512);
    const gradient = context.createRadialGradient(256, 210, 40, 256, 256, 320);
    gradient.addColorStop(0, preset.skin);
    gradient.addColorStop(0.72, preset.skin);
    gradient.addColorStop(1, "#34282a");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 512);
    if (identity !== "blank") {
      const spacing = preset.eyeSpacing * 512;
      context.fillStyle = "#e5dfd6";
      context.beginPath();
      context.ellipse(256 - spacing, 205, 42, 25 + corruption * 18, corruption * 0.2, 0, Math.PI * 2);
      context.ellipse(256 + spacing, 205, 42, 25 + corruption * 11, -corruption * 0.2, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#141117";
      context.beginPath();
      context.arc(256 - spacing + corruption * 18, 207, 13 + corruption * 8, 0, Math.PI * 2);
      context.arc(256 + spacing - corruption * 10, 207, 13 + corruption * 5, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = corruption > 0.5 ? "#2a1217" : "#6c3f42";
      context.lineWidth = 13 + corruption * 10;
      context.beginPath();
      context.moveTo(155, 350);
      context.bezierCurveTo(220, 330 - corruption * 90, 305, 410 + corruption * 65, 370, 335);
      context.stroke();
    }
    context.strokeStyle = "rgba(42,24,29,0.65)";
    context.lineWidth = 5;
    const lineCount = 5 + Math.floor(corruption * 18);
    for (let index = 0; index < lineCount; index += 1) {
      const y = 60 + index * (390 / Math.max(1, lineCount));
      context.beginPath();
      context.moveTo(20 + (index % 4) * 18, y);
      context.lineTo(492 - (index % 3) * 24, y + Math.sin(index * 2.1) * 35);
      context.stroke();
    }
    this.faceTexture.update();
  }

  private createLimbs(): LimbSet {
    const material = this.materials.get("plush", 8);
    const plastic = this.materials.get("plastic", 7);
    const leftArm = new TransformNode("mimic-left-arm-root", this.scene);
    const rightArm = new TransformNode("mimic-right-arm-root", this.scene);
    const leftLeg = new TransformNode("mimic-left-leg-root", this.scene);
    const rightLeg = new TransformNode("mimic-right-leg-root", this.scene);
    leftArm.parent = rightArm.parent = leftLeg.parent = rightLeg.parent = this.root;
    leftArm.position = new Vector3(-0.55, 4.25, 0);
    rightArm.position = new Vector3(0.55, 4.25, 0);
    leftLeg.position = new Vector3(-0.28, 2.15, 0);
    rightLeg.position = new Vector3(0.28, 2.15, 0);
    const makeSegments = (root: TransformNode, name: string, arm: boolean): Mesh[] => {
      const segments: Mesh[] = [];
      let parent: TransformNode | Mesh = root;
      const lengths = arm ? [1.25, 1.15, 0.46] : [1.35, 1.25, 0.62];
      lengths.forEach((length, index) => {
        const mesh = index < 2
          ? MeshBuilder.CreateCapsule(`${name}-${index}`, { height: length, radius: arm ? 0.16 : 0.2, tessellation: 10 }, this.scene)
          : MeshBuilder.CreateBox(`${name}-${index}`, arm ? { width: 0.34, height: 0.48, depth: 0.18 } : { width: 0.38, height: 0.24, depth: 0.68 }, this.scene);
        mesh.parent = parent;
        mesh.position.y = -length * 0.52;
        if (!arm && index === 2) mesh.position.z = -0.24;
        mesh.material = index === 1 ? plastic : material;
        segments.push(mesh);
        parent = mesh;
      });
      return segments;
    };
    return {
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      arms: [...makeSegments(leftArm, "mimic-left-arm", true), ...makeSegments(rightArm, "mimic-right-arm", true)],
      legs: [...makeSegments(leftLeg, "mimic-left-leg", false), ...makeSegments(rightLeg, "mimic-right-leg", false)]
    };
  }

  private createClothing(): void {
    for (let index = 0; index < 12; index += 1) {
      const piece = MeshBuilder.CreateBox(`mimic-clothing-${index}`, {
        width: 0.32 + (index % 3) * 0.12,
        height: 0.4 + (index % 4) * 0.15,
        depth: 0.08
      }, this.scene);
      piece.parent = this.root;
      piece.position = new Vector3((index % 3 - 1) * 0.35, 2.7 + Math.floor(index / 3) * 0.52, -0.48 - (index % 2) * 0.04);
      piece.rotation.z = (index % 2 ? 1 : -1) * 0.08;
      piece.material = this.materials.get("plush", 8 + index % 4);
      this.clothing.push(piece);
    }
  }

  private createVictimFragments(): void {
    for (let index = 0; index < 9; index += 1) {
      const fragment = index % 3 === 0
        ? MeshBuilder.CreateSphere(`mimic-victim-fragment-${index}`, { diameter: 0.28 + index * 0.015, segments: 8 }, this.scene)
        : MeshBuilder.CreateCapsule(`mimic-victim-fragment-${index}`, { height: 0.46 + index * 0.04, radius: 0.09, tessellation: 8 }, this.scene);
      fragment.parent = this.torso;
      fragment.position = new Vector3((index % 3 - 1) * 0.36, (Math.floor(index / 3) - 1) * 0.52, -0.45);
      fragment.rotation.z = index * 0.47;
      fragment.material = index % 2 ? this.materials.get("plastic", 7) : this.materials.get("plush", 9);
      fragment.isVisible = false;
      this.victimFragments.push(fragment);
    }
  }

  private clonePreset(preset: IdentityPreset): IdentityPreset {
    return {
      ...preset,
      headScale: preset.headScale.clone(),
      torsoScale: preset.torsoScale.clone()
    };
  }
}
