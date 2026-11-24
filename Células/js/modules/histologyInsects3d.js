import * as T from 'three';
import { group, mesh, organicDisplace, proteinMaterial, gelMaterial, sphere, tube, v } from '../core/geometry.js';

const profiles = {
  drosophila: {
    cuticle: '#a96d40', shade: '#5e3729', abdomen: [0.21, 0.084, 0.103], feet: 0.085
  },
  copris: {
    cuticle: '#353830', shade: '#1c1f1b', abdomen: [0.25, 0.136, 0.167], feet: 0.098
  },
  tenebrio: {
    cuticle: '#c99959', shade: '#976a40', abdomen: [0.28, 0.103, 0.129], feet: 0.098
  },
};

function chamber(parent, mat, radius, top = true) {
  const [x, y, z] = radius;
  const geo = new T.SphereGeometry(1, 26, 15, 0, Math.PI * 2, top ? 0 : Math.PI / 2, Math.PI / 2);
  geo.scale(x, y, z);
  return mesh(parent, organicDisplace(geo, 0.035, 10, 6), mat);
}

function makeOrgans(parent, species, radius, zOffset = 0) {
  const [rx, , rz] = radius;
  const digestive = proteinMaterial(species === 'tenebrio' ? '#b3a85f' : '#d09762', {
    roughness: 0.43, clearcoat: 0.47
  });
  const branches = proteinMaterial(species === 'copris' ? '#ded491' : '#d8e2d3', {
    roughness: 0.41, clearcoat: 0.3
  });
  const organs = {};
  organs.gut = group(parent, 0, 0, zOffset);
  const bends = species === 'copris' ? 3 : 2;
  const centerline = Array.from({ length: 23 }, (_, i) => {
    const u = i / 22;
    return v(rx * (0.87 - 1.74 * u), 0.014 + 0.018 * Math.sin(u * Math.PI),
      Math.sin(u * Math.PI * bends * 2) * rz * 0.39 * Math.sin(Math.PI * u));
  });
  tube(organs.gut, digestive, centerline, rz * 0.19, false, 33, 9);
  const crop = centerline[2];
  sphere(organs.gut, digestive, rz * 0.25, rz * 0.18, rz * 0.26, crop.x, crop.y, crop.z, 12);
  if (species === 'tenebrio') return organs;
  const name = species === 'copris' ? 'tubules' : 'trachea';
  organs[name] = group(parent, 0, 0, zOffset);
  for (const side of [-1, 1]) {
    if (name === 'tubules') {
      for (const bend of [0.53, 0.81]) {
        tube(organs[name], branches, [
          v(-rx * 0.53, 0.013, 0), v(-rx * 0.46, 0.03, rz * side * bend),
          v(rx * 0.38, 0.025, rz * side * bend), v(rx * 0.63, 0.01, rz * side * 0.48)
        ], 0.009, false, 21, 7);
      }
    } else {
      tube(organs[name], branches, [
        v(-rx * 0.70, 0.028, rz * side * 0.65), v(0, 0.042, rz * side * 0.62), v(rx * 0.72, 0.022, rz * side * 0.54)
      ], 0.008, false, 19, 7);
      for (const x of [-0.48, -0.1, 0.26, 0.53]) {
        const join = v(rx * x, 0.035, rz * side * 0.60);
        tube(organs[name], branches, [join, join.clone().add(v(0.022, 0.011, -side * 0.026)),
          v(rx * (x + 0.28), 0.037, rz * side * 0.11)], 0.0045, false, 9, 5);
      }
    }
  }
  return organs;
}

export function buildInsect(parent, species) {
  const profile = profiles[species];
  const body = group(parent);
  const [rx, ry, rz] = profile.abdomen;
  const isPupa = species === 'tenebrio';
  const isFly = species === 'drosophila';
  const cuticle = proteinMaterial(profile.cuticle, { roughness: isPupa ? 0.55 : 0.36, clearcoat: 0.66, side: T.DoubleSide });
  const shade = proteinMaterial(profile.shade, { roughness: 0.52, side: T.DoubleSide });
  const abdomen = group(body, -0.15, 0.007, 0);
  chamber(abdomen, cuticle, profile.abdomen, false);
  const roof = chamber(abdomen, cuticle, profile.abdomen);
  const lining = chamber(abdomen, gelMaterial('#8c6046', { opacity: 0.78, roughness: 0.5 }),
    [rx * 0.98, ry * 0.63, rz * 0.97], false);
  const organs = makeOrgans(abdomen, species, profile.abdomen);
  body.dissectionOrgans = organs;

  const shellDetails = group(abdomen);
  if (species === 'copris') {
    for (const side of [-1, 1]) {
      const elytron = sphere(shellDetails, cuticle, rx * 0.97, ry * 0.47, rz * 0.51, 0, ry * 0.67, rz * side * 0.49, 24);
      elytron.rotation.y = side * 0.047;
      for (const stripe of [0.18, 0.48, 0.73]) {
        tube(shellDetails, shade, [v(-rx * 0.84, ry * 0.67, side * rz * stripe),
          v(-rx * 0.34, ry * 1.01, side * rz * stripe), v(rx * 0.46, ry * 1.01, side * rz * stripe),
          v(rx * 0.76, ry * 0.73, side * rz * stripe)], 0.004, false, 16, 6);
      }
    }
  } else {
    const count = isPupa ? 7 : 4;
    for (let i = 0; i < count; i++) {
      const a = -0.74 + (i / (count - 1)) * 1.44;
      const width = Math.sqrt(1 - a * a);
      const points = Array.from({ length: 17 }, (_, j) => {
        const angle = j * Math.PI / 16;
        return v(rx * a - 0.009 * Math.sin(angle), ry * width * Math.sin(angle), rz * width * Math.cos(angle));
      });
      tube(shellDetails, shade, points, isPupa ? 0.009 : 0.006, false, 21, 6);
    }
  }

  sphere(body, cuticle, isPupa ? 0.145 : 0.124, isFly ? 0.104 : 0.114, isFly ? 0.095 : 0.132, 0.115, 0.024, 0, 20);
  sphere(body, shade, 0.074, 0.078, 0.089, 0.244, 0.028, 0, 20);
  const eyes = proteinMaterial(isFly ? '#9f2824' : '#262322', { roughness: 0.29, clearcoat: 0.86 });
  for (const side of [-1, 1]) {
    sphere(body, eyes, isFly ? 0.054 : 0.029, isFly ? 0.063 : 0.035, 0.025, 0.247, 0.045, side * 0.069, 17);
    if (!isPupa) {
      tube(body, shade, [v(0.284, 0.07, side * 0.052), v(0.323, 0.075, side * 0.075), v(0.35, 0.05, side * 0.094)],
        isFly ? 0.006 : 0.01, false, 12, 6);
    }
    for (let i = 0; i < 3; i++) {
      const x = 0.17 - i * 0.087;
      const z = side * (0.13 + i * 0.018);
      tube(body, shade, [v(x, 0.006, side * 0.067), v(x + 0.054 - i * 0.033, -0.044, z),
        v(x - 0.030, isPupa ? -0.070 : -profile.feet, z * (isPupa ? 0.76 : 1.40))],
      isFly ? 0.007 : 0.013, false, 12, 7);
    }
    if (isFly) {
      const wing = sphere(body, gelMaterial('#d5e6e4', { opacity: 0.47, roughness: 0.18 }),
        0.208, 0.008, 0.075, -0.07, 0.114, side * 0.15, 20);
      wing.rotation.y = side * 0.51;
      const vein = gelMaterial('#9bb5b1', { opacity: 0.58 });
      tube(body, vein, [v(0.088, 0.113, side * 0.069), v(-0.063, 0.121, side * 0.154),
        v(-0.223, 0.116, side * 0.222)], 0.0043, false, 14, 6);
    }
  }

  body.setDissectionState = (mode, removed = new Set()) => {
    const open = mode !== 'intact';
    roof.visible = !open;
    shellDetails.visible = !open;
    lining.visible = open;
    for (const [key, organ] of Object.entries(organs)) organ.visible = open && !removed.has(key);
  };
  body.userData.feet = profile.feet;
  body.setDissectionState('intact');
  body.visible = false;
  return body;
}

export function buildInsectExtracts(parent) {
  const tray = group(parent);
  // Detached regions share a preparation dish and are shown individually.
  const tissues = makeOrgans(tray, 'copris', [0.16, 0.06, 0.105]);
  const flyOrgans = makeOrgans(tray, 'drosophila', [0.17, 0.06, 0.115]);
  flyOrgans.gut.visible = false;
  tissues.trachea = flyOrgans.trachea;
  tray.showRegion = region => {
    for (const [key, tissue] of Object.entries(tissues)) tissue.visible = key === region;
    tray.visible = Boolean(region);
  };
  tray.showRegion(null);
  return tray;
}
