import { Color3 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";

const COLUMNS = 8;
const ROWS = 4;
const WIDTH = 64;
const HEIGHT = 128;
const CYCLE_SECONDS = 1.35;
const TAU = Math.PI * 2;

function drawFrame(ctx, phase) {
    const wave = (shift) => Math.sin(phase + shift);
    const lean = wave(0.25) * 5 + Math.sin(phase * 2 - 0.8) * 2.5;
    const height = 18 + wave(1.15) * 7 + Math.sin(phase * 3) * 3;
    const root = 107;
    const halo = ctx.createRadialGradient(32, 78, 4, 32, 78, 29);
    halo.addColorStop(0, "rgba(255,95,5,0.21)");
    halo.addColorStop(0.55, "rgba(255,69,0,0.10)");
    halo.addColorStop(1, "rgba(255,45,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(2, 49, 60, 59);

    function tongue(center, width, tip, tilt, palette) {
        const shade = ctx.createLinearGradient(0, root, 0, tip);
        for (const [offset, color] of palette) shade.addColorStop(offset, color);
        ctx.beginPath();
        ctx.moveTo(center - width * 0.46, root);
        ctx.bezierCurveTo(center - width * 1.12, root - 17, center + tilt - width * 0.95, tip + 37, center + tilt, tip);
        ctx.bezierCurveTo(center + tilt - width * 0.15, tip + 30, center + width * 1.62, root - 26, center + width * 0.45, root - 2);
        ctx.quadraticCurveTo(center, root + 4, center - width * 0.46, root);
        ctx.fillStyle = shade;
        ctx.fill();
    }

    tongue(30, 13, height + 12, -9 + wave(2.8) * 6, [
        [0, "#dc4112"], [0.22, "#ff6e14"], [0.61, "rgba(255,89,8,0.9)"], [1, "rgba(204,35,0,0)"]
    ]);
    tongue(33, 13 + wave(4.3) * 1.9, height, lean, [
        [0, "#fb6816"], [0.26, "#ffa22e"], [0.54, "#ffc75a"], [0.78, "rgba(255,122,24,0.8)"], [1, "rgba(255,67,0,0)"]
    ]);
    tongue(33, 6.5 + wave(4) * 1.1, 40 + height * 0.55, lean * 0.52 + 2, [
        [0, "#ffaa34"], [0.29, "#fff1bb"], [0.48, "#fff4c5"], [0.85, "rgba(255,216,117,0.78)"], [1, "rgba(255,153,40,0)"]
    ]);

    for (let i = 0; i < 5; i += 1) {
        const life = (phase / TAU + i / 5) % 1;
        const x = 32 + (i - 2) * life * 7 + Math.sin(phase + i * 2) * 3;
        const y = 88 - life * (64 + i * 3);
        const size = (1 - life) * 1.25 + 0.3;
        const alpha = Math.sin(Math.PI * life) * (0.85 - i * 0.08);
        ctx.strokeStyle = "rgba(255,135,33," + alpha * 0.54 + ")";
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(x, y + size * 3);
        ctx.lineTo(x + 0.6, y);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,218,133," + alpha + ")";
        ctx.beginPath();
        ctx.arc(x + 0.6, y, size * 0.6, 0, TAU);
        ctx.fill();
    }
}

export function makeTorchFlame(scene, parent, material) {
    // One canvas upload for the life of the torch, then UV changes only.
    if (!material) {
        const atlas = new DynamicTexture("torch-flame-atlas", { width: WIDTH * COLUMNS, height: HEIGHT * ROWS }, scene, false);
        const ctx = atlas.getContext();
        for (let frame = 0; frame < COLUMNS * ROWS; frame += 1) {
            ctx.save();
            ctx.translate(frame % COLUMNS * WIDTH, Math.floor(frame / COLUMNS) * HEIGHT);
            drawFrame(ctx, frame / (COLUMNS * ROWS) * TAU);
            ctx.restore();
        }
        atlas.update(true);
        atlas.hasAlpha = true;
        atlas.wrapU = atlas.wrapV = 0; // Clamp to the edge, never wrap a frame.
        atlas.uScale = (WIDTH - 2) / (WIDTH * COLUMNS);
        atlas.vScale = (HEIGHT - 2) / (HEIGHT * ROWS);
        material = new StandardMaterial("torch-flame-material", scene);
        material.disableLighting = true;
        material.backFaceCulling = false;
        material.diffuseColor = Color3.Black();
        material.specularColor = Color3.Black();
        material.emissiveColor = new Color3(1, 1, 1);
        material.emissiveTexture = atlas;
        material.opacityTexture = atlas;
    }
    const flame = MeshBuilder.CreatePlane("torch-flame", { width: 0.39, height: 0.54 }, scene);
    flame.material = material;
    flame.parent = parent;
    flame.position.set(0.054, 0.343, 0.002);
    flame.isPickable = false;
    flame.alwaysSelectAsActiveMesh = true;
    flame.metadata = { constructionLocked: true, torchRig: true };
    flame.setEnabled(false);
    return flame;
}

export function animateTorchFlame(flame, seconds) {
    const frame = Math.floor((seconds % CYCLE_SECONDS) / CYCLE_SECONDS * COLUMNS * ROWS);
    const atlas = flame.material.emissiveTexture;
    atlas.uOffset = (frame % COLUMNS * WIDTH + 1) / (WIDTH * COLUMNS);
    atlas.vOffset = 1 - ((Math.floor(frame / COLUMNS) + 1) * HEIGHT - 1) / (HEIGHT * ROWS);
    flame.rotation.z = Math.sin(seconds * 4.4) * 0.035 + Math.sin(seconds * 8.5) * 0.016;
}
