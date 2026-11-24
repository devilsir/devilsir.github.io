import * as T from 'three';
import {
  v, group, mesh, sphere, torus, tube,
  glow, instances, instanceUpdater, organicDisplace,
  membraneMaterial, gelMaterial, proteinMaterial
} from '../core/geometry.js';

// Shared living intracellular 3D backdrop: translucent gelatinous cytosol, cytoskeleton microtubules,
// floating soluble macromolecule/ribosome crowding & optional Nucleoplasm ↔ Cytosol split!
export function buildBioEnvironment(scene, { mode = 'cytosol' } = {}) {
  const envGroup = group(scene);

  if (mode === 'cytosol') {
    // Translucent curved cytosolic chamber dome in background so mitochondria/chloroplasts sit INSIDE a living cell
    // Uses deep neutral-warm slate so it never adds unwanted electric blue haze around the mitochondrion!
    const domeGeo = organicDisplace(new T.SphereGeometry(17.5, 36, 24, 0, Math.PI * 2, 0.15, Math.PI * 0.85), 0.03, 2.4, 17);
    const domeMat = gelMaterial('#131b22', {
      opacity: 0.22, side: T.BackSide, iridescence: 0.16, roughness: 0.24, depthWrite: false
    });
    const dome = mesh(envGroup, domeGeo, domeMat, 0.2, 0.2, -2.8);
    dome.renderOrder = -2;

    // Translucent curved plasma membrane boundary arc deep behind the cytosol
    const memRim = torus(envGroup, glow('#4e6e78', 0.14, { transparent: true, opacity: 0.14, depthWrite: false }), 12.6, 0.055, 0.2, 0.2, -5.6);
    memRim.scale.set(1.22, 0.78, 1);

    // Sculpted 3D Cytoskeleton network (curving α/β-tubulin microtubules & F-actin filaments deep behind)
    const cytoTubMat = gelMaterial('#45616d', { opacity: 0.20, emissive: '#22343d', emissiveIntensity: 0.16, depthWrite: false });
    const actinMat = gelMaterial('#5c6f6c', { opacity: 0.16, emissive: '#2c3d3a', emissiveIntensity: 0.14, depthWrite: false });
    const filaments = [
      [v(-12, -5.2, -6.2), v(-5.5, -2.4, -5.2), v(1.5, -3.6, -5.8), v(9.5, -1.2, -5.4), v(14, 2.2, -6.2)],
      [v(-13, 3.8, -6.6), v(-6.0, 4.6, -5.6), v(1.0, 2.8, -5.1), v(8.0, 4.4, -5.8), v(14.5, 3.0, -6.6)],
      [v(-11, 0.5, -6.8), v(-4.2, -4.2, -6.0), v(3.8, 1.5, -6.4), v(11.5, -4.5, -5.8)],
      [v(-9.5, -6.0, -5.0), v(-2.0, 3.6, -6.4), v(5.5, -4.8, -6.2), v(12.2, 1.4, -5.2)]
    ];
    filaments.forEach((pts, i) => {
      tube(envGroup, i < 2 ? cytoTubMat : actinMat, pts, i < 2 ? 0.08 : 0.045, false, 36, 7);
    });

    // Softly drifting cytosolic macromolecules (warm neutral glycogen/enzymes pushed deep behind & OUTSIDE the mitochondrion silhouette
    // so they are NEVER confused with cyan H+ protons inside the mitochondrion!)
    const count = 64;
    const soluteMat = proteinMaterial('#7c766d', {
      emissive: '#38332c', emissiveIntensity: 0.18, transparent: true, opacity: 0.26, roughness: 0.42
    });
    const solutes = instances(envGroup, new T.SphereGeometry(0.095, 8, 6), soluteMat, count, true);
    const putSolute = instanceUpdater(solutes);
    const seeds = Array.from({ length: count }, (_, i) => {
      const a = i * 2.39996;
      const rad = 6.6 + (i % 10) * 0.65;
      let sx = Math.cos(a) * rad * 1.38;
      let sy = Math.sin(a) * rad * 0.68;
      // Keep foreground area around the mitochondrion (center 2.18, -0.12) visually clean!
      const dx = (sx - 2.18) / 6.8;
      const dy = (sy + 0.12) / 3.7;
      const ell = Math.hypot(dx, dy);
      if (ell < 1.08) {
        const push = 1.16 / Math.max(0.15, ell);
        sx = 2.18 + (sx - 2.18) * push;
        sy = -0.12 + (sy + 0.12) * push;
      }
      return {
        x: sx,
        y: sy,
        z: -4.4 - (i % 7) * 0.65,
        s: 0.42 + (i % 5) * 0.18,
        ph: i * 1.13
      };
    });

    // Floating background vesicles / subtle intracellular depth spheres (muted neutral slate)
    const vesMat = gelMaterial('#4d5f68', { opacity: 0.11, iridescence: 0.18, depthWrite: false });
    const bgVesicles = [];
    for (const [vx, vy, vz, vr] of [
      [-9.2, 3.6, -5.2, 0.82], [9.2, 3.3, -5.6, 0.72], [-9.4, -3.7, -4.8, 0.68],
      [9.8, -3.4, -5.1, 0.80], [0.2, 4.7, -6.2, 0.62], [-2.8, -4.7, -5.8, 0.74]
    ]) {
      const vm = mesh(envGroup, organicDisplace(new T.SphereGeometry(vr, 16, 12), 0.08, 4, vx * 3), vesMat, vx, vy, vz);
      bgVesicles.push({ mesh: vm, baseY: vy, ph: vx + vy });
    }

    return {
      group: envGroup,
      setTint(hex) {
        domeMat.color.set(hex);
      },
      update(clock) {
        for (let i = 0; i < count; i++) {
          const d = seeds[i];
          putSolute(
            i,
            d.x + Math.sin(clock * 0.34 + d.ph) * 0.38,
            d.y + Math.cos(clock * 0.42 + d.ph * 0.7) * 0.28,
            d.z + Math.sin(clock * 0.26 + d.ph) * 0.18,
            d.s
          );
        }
        solutes.instanceMatrix.needsUpdate = true;
        for (const bv of bgVesicles) {
          bv.mesh.position.y = bv.baseY + Math.sin(clock * 0.48 + bv.ph) * 0.24;
          bv.mesh.rotation.y = clock * 0.12;
        }
      }
    };
  }

  // MODE = 'dogma' (Split Nucleoplasm [left, violet] <-> Nuclear Envelope <-> Cytosol + Rough ER [right, teal]!)
  const nucDomeMat = gelMaterial('#291c4e', { opacity: 0.26, side: T.BackSide, iridescence: 0.32, depthWrite: false });
  mesh(envGroup, new T.SphereGeometry(10.5, 28, 20), nucDomeMat, -6.2, 0.1, -2.2).scale.set(1.05, 0.72, 0.75);

  const cytoDomeMat = gelMaterial('#133a4a', { opacity: 0.24, side: T.BackSide, iridescence: 0.34, depthWrite: false });
  mesh(envGroup, new T.SphereGeometry(10.5, 28, 20), cytoDomeMat, 5.8, 0.1, -2.2).scale.set(1.05, 0.72, 0.75);

  // Nuclear chromatin fiber arcs deep in the nucleoplasm (left background)
  const chromMat = gelMaterial('#7e68cc', { opacity: 0.24, emissive: '#47368c', emissiveIntensity: 0.26, depthWrite: false });
  for (const pts of [
    [v(-12.5, 3.2, -4.4), v(-8.8, 1.8, -3.6), v(-5.5, 3.5, -4.2), v(-2.2, 2.2, -3.8)],
    [v(-12.2, -2.8, -4.2), v(-8.2, -3.8, -3.5), v(-4.6, -2.1, -4.0), v(-2.0, -3.2, -3.6)],
    [v(-11.0, 0.2, -4.8), v(-7.4, -1.2, -4.4), v(-3.6, 0.9, -4.6)]
  ]) {
    tube(envGroup, chromMat, pts, 0.068, false, 32, 7);
  }

  // Sculpted Rough ER cisternae membrane folds & cytoskeleton curving behind the Ribosome in the Cytosol (right background!)
  const erMat = membraneMaterial('#3ca8ba', { opacity: 0.20, clearcoat: 0.85, iridescence: 0.38, depthWrite: false });
  for (const [ey, ez, sc] of [[2.2, -3.2, 1.0], [-2.1, -3.4, 0.92], [0.2, -4.4, 1.15]]) {
    const erTube = tube(envGroup, erMat, [
      v(1.6, ey - 0.5, ez), v(4.2, ey + 0.4, ez - 0.3), v(7.4, ey - 0.2, ez + 0.2), v(10.2, ey + 0.5, ez - 0.4)
    ], 0.34 * sc, false, 32, 12);
    erTube.scale.set(1, 0.42, 1);
  }

  // Drifting nucleoplasm nucleotides (left, lavender) & cytosolic free amino acids/solutes (right, aqua)
  const count = 72;
  const nucDots = instances(envGroup, new T.SphereGeometry(0.085, 8, 6),
    glow('#9e88f0', 0.45, { transparent: true, opacity: 0.46 }), count / 2, true);
  const cytoDots = instances(envGroup, new T.SphereGeometry(0.09, 8, 6),
    glow('#64dce8', 0.45, { transparent: true, opacity: 0.46 }), count / 2, true);
  const putNuc = instanceUpdater(nucDots);
  const putCyto = instanceUpdater(cytoDots);

  const nucSeeds = Array.from({ length: count / 2 }, (_, i) => ({
    x: -10.8 + ((i * 37) % 92) * 0.10,
    y: -3.6 + ((i * 53) % 72) * 0.10,
    z: -1.8 - (i % 6) * 0.58,
    s: 0.55 + (i % 4) * 0.22,
    ph: i * 0.91
  }));
  const cytoSeeds = Array.from({ length: count / 2 }, (_, i) => ({
    x: 1.2 + ((i * 41) % 96) * 0.10,
    y: -3.6 + ((i * 59) % 72) * 0.10,
    z: -1.8 - (i % 6) * 0.58,
    s: 0.55 + (i % 4) * 0.22,
    ph: i * 1.17
  }));

  return {
    group: envGroup,
    update(clock) {
      for (let i = 0; i < nucSeeds.length; i++) {
        const d = nucSeeds[i];
        putNuc(i, d.x + Math.sin(clock * 0.35 + d.ph) * 0.3, d.y + Math.cos(clock * 0.42 + d.ph) * 0.24, d.z, d.s);
      }
      for (let i = 0; i < cytoSeeds.length; i++) {
        const d = cytoSeeds[i];
        putCyto(i, d.x + Math.cos(clock * 0.38 + d.ph) * 0.32, d.y + Math.sin(clock * 0.44 + d.ph) * 0.26, d.z, d.s);
      }
      nucDots.instanceMatrix.needsUpdate = true;
      cytoDots.instanceMatrix.needsUpdate = true;
    }
  };
}
