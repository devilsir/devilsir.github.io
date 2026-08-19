import { Color3 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
export class ProceduralMaterials {
    scene;
    cache = new Map();
    size;
    constructor(scene, textureSize = 512) {
        this.scene = scene;
        this.size = textureSize;
    }
    get(kind, variant = 0) {
        const key = `${kind}-${variant}`;
        const existing = this.cache.get(key);
        if (existing)
            return existing;
        const material = new PBRMaterial(key, this.scene);
        material.albedoTexture = this.makeTexture(kind, variant, false);
        material.bumpTexture = this.makeTexture(kind, variant, true);
        material.bumpTexture.level = kind === "plush" ? 0.42 : 0.65;
        material.useParallax = false;
        material.metallic = kind === "metal" ? 0.56 : kind === "glass" ? 0.04 : 0.02;
        material.roughness = this.roughness(kind);
        material.environmentIntensity = 0.45;
        if (kind === "glass") {
            material.alpha = 0.38;
            material.indexOfRefraction = 1.45;
            material.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
            material.backFaceCulling = false;
        }
        if (kind === "burned") {
            material.emissiveColor = new Color3(0.08, 0.018, 0.005);
        }
        this.cache.set(key, material);
        return material;
    }
    floor(kind, variant = 0) {
        const key = `floor-${kind}-${variant}`;
        const existing = this.cache.get(key);
        if (existing)
            return existing;
        const material = this.get(kind, variant).clone(key);
        // Large horizontal surfaces exposed a GPU/driver-dependent tangent seam that
        // rendered whole triangles black. Floors keep the authored albedo but do not
        // use a tangent-space normal map, eliminating the artifact deterministically.
        material.bumpTexture = null;
        material.useParallax = false;
        material.alpha = 1;
        material.transparencyMode = PBRMaterial.PBRMATERIAL_OPAQUE;
        material.forceDepthWrite = true;
        material.backFaceCulling = false;
        material.useAlphaFromAlbedoTexture = false;
        if (material.albedoTexture)
            material.albedoTexture.hasAlpha = false;
        this.cache.set(key, material);
        return material;
    }
    emissive(name, color, intensity = 1) {
        const key = `emissive-${name}-${color.toHexString()}-${intensity}`;
        const existing = this.cache.get(key);
        if (existing)
            return existing;
        const material = new PBRMaterial(key, this.scene);
        material.albedoColor = color.scale(0.25);
        material.emissiveColor = color.scale(intensity);
        material.roughness = 0.45;
        this.cache.set(key, material);
        return material;
    }
    solid(name, color, roughness = 0.7, metallic = 0) {
        const key = `solid-${name}-${color.toHexString()}-${roughness}-${metallic}`;
        const existing = this.cache.get(key);
        if (existing)
            return existing;
        const material = new PBRMaterial(key, this.scene);
        material.albedoColor = color;
        material.roughness = roughness;
        material.metallic = metallic;
        this.cache.set(key, material);
        return material;
    }
    makeTexture(kind, variant, bump) {
        const texture = new DynamicTexture(`${kind}-${variant}-${bump ? "bump" : "albedo"}`, { width: this.size, height: this.size }, this.scene, false);
        texture.wrapU = 1;
        texture.wrapV = 1;
        const context = texture.getContext();
        const image = context.createImageData(this.size, this.size);
        const palette = this.palette(kind, variant);
        const random = this.seeded(this.hash(`${kind}:${variant}:${bump}`));
        for (let y = 0; y < this.size; y += 1) {
            for (let x = 0; x < this.size; x += 1) {
                const index = (y * this.size + x) * 4;
                const u = x / this.size;
                const v = y / this.size;
                // Babylon expects bumpTexture to contain tangent-space normal data.
                // The previous grayscale height image was interpreted as a normal map,
                // producing giant black triangles and shimmering patches on flat floors.
                const color = bump
                    ? this.normalColor(kind, u, v, variant)
                    : (() => {
                        const value = this.sample(kind, u, v, random, variant);
                        return this.mixPalette(palette, value.base, value.damage, value.wet);
                    })();
                image.data[index] = color[0];
                image.data[index + 1] = color[1];
                image.data[index + 2] = color[2];
                image.data[index + 3] = kind === "glass" && !bump ? 210 : 255;
            }
        }
        context.putImageData(image, 0, 0);
        if (!bump) {
            this.drawAuthoredDetails(context, kind, variant, random);
        }
        texture.update(false);
        return texture;
    }
    sample(kind, u, v, random, variant) {
        const grain = this.fbm(u * 8 + variant, v * 8 - variant, 4);
        const fine = this.fbm(u * 44, v * 44, 2);
        const edge = Math.min(u, v, 1 - u, 1 - v);
        const cornerWear = Math.max(0, 0.055 - edge) * 12;
        const randomJitter = (random() - 0.5) * 0.08;
        let base = 0.5 + grain * 0.32 + fine * 0.12 + randomJitter;
        let damage = cornerWear;
        let wet = 0;
        if (kind === "concrete") {
            const aggregate = Math.max(0, this.noise(u * 90, v * 90) - 0.72) * 1.8;
            const floorDamp = Math.max(0, (v - 0.72) * 2.2) * (0.45 + this.fbm(u * 5, v * 4, 3));
            const crack = this.crackField(u, v, variant);
            base += aggregate * 0.18 - floorDamp * 0.28;
            damage += crack + aggregate * 0.2;
            wet = floorDamp;
        }
        else if (kind === "metal") {
            const seam = Math.max(0, 0.035 - Math.abs(u - 0.5)) * 9;
            const boltRust = this.circleMask(u, v, 0.14, 0.14, 0.05) + this.circleMask(u, v, 0.86, 0.86, 0.05);
            const streak = Math.max(0, this.noise(u * 9, 0.2) - 0.55) * Math.max(0, v - 0.18);
            damage += seam * 0.38 + boltRust + streak * 0.8;
            base += this.noise(u * 60, v * 4) * 0.1;
        }
        else if (kind === "plush") {
            const weave = (Math.sin(u * Math.PI * 150) * Math.sin(v * Math.PI * 120)) * 0.08;
            const seam = Math.max(0, 0.018 - Math.abs(u - 0.5)) * 16;
            base += weave;
            damage += seam * 0.45 + Math.max(0, this.fbm(u * 3, v * 3, 3) - 0.46) * 0.28;
        }
        else if (kind === "plastic") {
            const molding = Math.max(0, 0.012 - Math.abs(u - 0.5)) * 25;
            const stress = Math.max(0, this.noise(u * 35, v * 35) - 0.86) * 2.4;
            base += 0.12 - this.fbm(u * 6, v * 6, 2) * 0.08;
            damage += molding * 0.24 + stress;
        }
        else if (kind === "tile") {
            const tiles = 8;
            const groutX = Math.min((u * tiles) % 1, 1 - ((u * tiles) % 1));
            const groutY = Math.min((v * tiles) % 1, 1 - ((v * tiles) % 1));
            const grout = groutX < 0.045 || groutY < 0.045 ? 1 : 0;
            const tileVariation = this.noise(Math.floor(u * tiles), Math.floor(v * tiles)) * 0.18;
            base += tileVariation - grout * 0.34;
            damage += grout * 0.36 + this.crackField(u, v, variant) * 0.6;
            wet = Math.max(0, this.fbm(u * 4, v * 4, 3) - 0.56) * 0.6;
        }
        else if (kind === "wood") {
            const grainDirection = Math.sin((u * 35 + this.fbm(u * 2, v * 9, 3) * 4) * Math.PI) * 0.11;
            base += grainDirection;
            damage += Math.max(0, v - 0.78) * this.fbm(u * 5, v * 5, 2) * 0.55;
        }
        else if (kind === "glass") {
            base = 0.72 + fine * 0.04;
            damage += this.crackField(u, v, variant) * 0.7;
            wet = Math.max(0, this.noise(u * 5, v * 5) - 0.62) * 0.3;
        }
        else if (kind === "burned") {
            base = 0.15 + grain * 0.13;
            damage = 0.75 + fine * 0.2;
            wet = 0;
        }
        return { base: this.clamp01(base), damage: this.clamp01(damage), wet: this.clamp01(wet) };
    }
    drawAuthoredDetails(context, kind, variant, random) {
        context.save();
        if (kind === "concrete") {
            context.strokeStyle = "rgba(48,42,37,.38)";
            context.lineWidth = 2;
            for (let i = 0; i < 7; i += 1) {
                let x = random() * this.size;
                let y = random() * this.size * 0.6;
                context.beginPath();
                context.moveTo(x, y);
                for (let j = 0; j < 9; j += 1) {
                    x += (random() - 0.5) * 34;
                    y += random() * 24;
                    context.lineTo(x, y);
                }
                context.stroke();
            }
            const gradient = context.createLinearGradient(0, 0, 0, this.size);
            gradient.addColorStop(0, "rgba(0,0,0,0)");
            gradient.addColorStop(1, "rgba(35,47,42,.42)");
            context.fillStyle = gradient;
            context.fillRect(0, 0, this.size, this.size);
        }
        if (kind === "metal") {
            context.fillStyle = "rgba(96,42,20,.48)";
            const boltPositions = [[52, 52], [this.size - 52, 52], [52, this.size - 52], [this.size - 52, this.size - 52]];
            for (const [x, y] of boltPositions) {
                context.beginPath();
                context.arc(x, y, 19, 0, Math.PI * 2);
                context.fill();
                context.fillRect(x - 5, y, 10, 90 + random() * 80);
            }
            context.strokeStyle = "rgba(235,225,202,.16)";
            for (let i = 0; i < 16; i += 1) {
                context.beginPath();
                context.moveTo(random() * this.size, random() * this.size);
                context.lineTo(random() * this.size, random() * this.size);
                context.stroke();
            }
        }
        if (kind === "plush") {
            context.strokeStyle = "rgba(40,20,18,.55)";
            context.lineWidth = 3;
            context.setLineDash([5, 6]);
            context.beginPath();
            context.moveTo(this.size / 2, 0);
            context.lineTo(this.size / 2 + Math.sin(variant) * 15, this.size);
            context.stroke();
            context.setLineDash([]);
            if (variant % 3 === 2) {
                context.fillStyle = "rgba(245,234,208,.7)";
                context.beginPath();
                context.ellipse(this.size * 0.72, this.size * 0.63, 55, 22, -0.4, 0, Math.PI * 2);
                context.fill();
            }
        }
        if (kind === "plastic") {
            context.strokeStyle = "rgba(255,255,255,.28)";
            context.lineWidth = 2;
            for (let i = 0; i < 22; i += 1) {
                const x = random() * this.size;
                const y = random() * this.size;
                context.beginPath();
                context.moveTo(x, y);
                context.lineTo(x + 10 + random() * 45, y + (random() - 0.5) * 10);
                context.stroke();
            }
        }
        if (kind === "glass") {
            context.strokeStyle = "rgba(255,255,255,.18)";
            context.lineWidth = 4;
            for (let i = 0; i < 5; i += 1) {
                context.beginPath();
                context.moveTo(0, random() * this.size);
                context.bezierCurveTo(this.size * 0.3, random() * this.size, this.size * 0.7, random() * this.size, this.size, random() * this.size);
                context.stroke();
            }
        }
        context.restore();
    }
    palette(kind, variant) {
        const palettes = {
            concrete: [
                { base: [105, 102, 92], accent: [132, 122, 104], dark: [53, 56, 51] },
                { base: [84, 89, 91], accent: [119, 113, 101], dark: [39, 44, 45] }
            ],
            metal: [
                { base: [91, 104, 107], accent: [151, 62, 37], dark: [43, 34, 31] },
                { base: [111, 91, 70], accent: [142, 52, 29], dark: [42, 31, 25] }
            ],
            plush: [
                { base: [151, 33, 28], accent: [194, 67, 41], dark: [60, 27, 24] },
                { base: [66, 94, 111], accent: [112, 132, 139], dark: [36, 44, 48] },
                { base: [162, 126, 66], accent: [196, 158, 86], dark: [69, 51, 31] }
            ],
            plastic: [
                { base: [176, 143, 70], accent: [224, 191, 103], dark: [83, 67, 39] },
                { base: [68, 116, 129], accent: [112, 157, 161], dark: [35, 58, 64] }
            ],
            tile: [
                { base: [177, 172, 155], accent: [202, 194, 171], dark: [70, 69, 62] },
                { base: [116, 146, 139], accent: [155, 175, 163], dark: [53, 69, 66] }
            ],
            wood: [
                { base: [104, 68, 39], accent: [139, 91, 50], dark: [45, 28, 18] },
                { base: [77, 53, 38], accent: [113, 76, 50], dark: [35, 23, 18] }
            ],
            glass: [{ base: [151, 171, 170], accent: [197, 207, 197], dark: [78, 91, 92] }],
            burned: [{ base: [35, 26, 22], accent: [89, 31, 13], dark: [8, 8, 8] }]
        };
        const options = palettes[kind];
        return options[Math.abs(variant) % options.length] ?? options[0];
    }
    mixPalette(palette, base, damage, wet) {
        const accentMix = this.clamp01(base);
        const damageMix = this.clamp01(damage);
        const wetDarken = 1 - wet * 0.35;
        const result = [0, 0, 0];
        for (let i = 0; i < 3; i += 1) {
            const baseValue = palette.base[i] * (1 - accentMix * 0.35) + palette.accent[i] * accentMix * 0.35;
            result[i] = Math.round((baseValue * (1 - damageMix * 0.65) + palette.dark[i] * damageMix * 0.65) * wetDarken);
        }
        return result;
    }
    normalColor(kind, u, v, variant) {
        const frequency = kind === "plush" ? 55 : kind === "wood" ? 26 : kind === "metal" ? 34 : 42;
        const strength = kind === "glass" ? 0.32 : kind === "plush" ? 0.95 : kind === "concrete" ? 1.15 : 0.72;
        const epsilon = 1 / Math.max(128, this.size);
        const heightAt = (sampleU, sampleV) => {
            const broad = this.fbm(sampleU * (frequency * 0.22) + variant, sampleV * (frequency * 0.22) - variant, 3);
            const fine = this.fbm(sampleU * frequency, sampleV * frequency, 2);
            let authored = 0;
            if (kind === "tile") {
                const tiles = 8;
                const groutX = Math.min((sampleU * tiles) % 1, 1 - ((sampleU * tiles) % 1));
                const groutY = Math.min((sampleV * tiles) % 1, 1 - ((sampleV * tiles) % 1));
                authored = groutX < 0.045 || groutY < 0.045 ? -0.24 : 0.04;
            }
            else if (kind === "wood") {
                authored = Math.sin((sampleU * 35 + this.fbm(sampleU * 2, sampleV * 9, 2) * 4) * Math.PI) * 0.09;
            }
            else if (kind === "metal") {
                authored = Math.max(0, 0.03 - Math.abs(sampleU - 0.5)) * -2.2;
            }
            else if (kind === "plush") {
                authored = Math.sin(sampleU * Math.PI * 150) * Math.sin(sampleV * Math.PI * 120) * 0.035;
            }
            return broad * 0.62 + fine * 0.28 + authored;
        };
        const dx = (heightAt(u + epsilon, v) - heightAt(u - epsilon, v)) * strength;
        const dy = (heightAt(u, v + epsilon) - heightAt(u, v - epsilon)) * strength;
        const length = Math.hypot(dx, dy, 1) || 1;
        const nx = -dx / length;
        const ny = -dy / length;
        const nz = 1 / length;
        return [
            Math.round((nx * 0.5 + 0.5) * 255),
            Math.round((ny * 0.5 + 0.5) * 255),
            Math.round((nz * 0.5 + 0.5) * 255)
        ];
    }
    roughness(kind) {
        return {
            concrete: 0.91,
            metal: 0.55,
            plush: 0.94,
            plastic: 0.58,
            tile: 0.7,
            wood: 0.82,
            glass: 0.22,
            burned: 0.97
        }[kind];
    }
    crackField(u, v, variant) {
        const centerX = 0.2 + (this.hash(`cx${variant}`) % 600) / 1000;
        const centerY = 0.18 + (this.hash(`cy${variant}`) % 550) / 1000;
        const angle = Math.atan2(v - centerY, u - centerX);
        const radius = Math.hypot(u - centerX, v - centerY);
        const branch = Math.abs(Math.sin(angle * 5 + radius * 17 + variant));
        return branch > 0.965 && radius < 0.55 ? 0.85 : 0;
    }
    circleMask(u, v, cx, cy, radius) {
        const distance = Math.hypot(u - cx, v - cy);
        return this.clamp01((radius - distance) / radius);
    }
    fbm(x, y, octaves) {
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1;
        let total = 0;
        for (let i = 0; i < octaves; i += 1) {
            value += this.noise(x * frequency, y * frequency) * amplitude;
            total += amplitude;
            amplitude *= 0.5;
            frequency *= 2.03;
        }
        return value / total;
    }
    noise(x, y) {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;
        const smoothX = xf * xf * (3 - 2 * xf);
        const smoothY = yf * yf * (3 - 2 * yf);
        const a = this.hash2(xi, yi);
        const b = this.hash2(xi + 1, yi);
        const c = this.hash2(xi, yi + 1);
        const d = this.hash2(xi + 1, yi + 1);
        const top = a + (b - a) * smoothX;
        const bottom = c + (d - c) * smoothX;
        return top + (bottom - top) * smoothY;
    }
    hash2(x, y) {
        let value = x * 374761393 + y * 668265263;
        value = (value ^ (value >> 13)) * 1274126177;
        return ((value ^ (value >> 16)) >>> 0) / 4294967295;
    }
    hash(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i += 1) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
    seeded(seed) {
        let state = seed || 1;
        return () => {
            state = (state * 1664525 + 1013904223) >>> 0;
            return state / 4294967296;
        };
    }
    clamp01(value) {
        return Math.min(1, Math.max(0, value));
    }
}
