import { SIZE, SPACING } from './config.js';

function offset() {
  return ((SIZE - 1) * SPACING) / 2;
}

export function generateSC() {
  const atoms = [];
  const baseOffset = offset();
  for (let x = 0; x < SIZE; x += 1) {
    for (let y = 0; y < SIZE; y += 1) {
      for (let z = 0; z < SIZE; z += 1) {
        atoms.push({ id: `host-${x}-${y}-${z}`, position: [x * SPACING - baseOffset, y * SPACING - baseOffset, z * SPACING - baseOffset], type: 'host' });
      }
    }
  }
  for (let x = 0; x < SIZE - 1; x += 1) {
    for (let y = 0; y < SIZE - 1; y += 1) {
      for (let z = 0; z < SIZE - 1; z += 1) {
        atoms.push({ id: `interstitial-${x}-${y}-${z}`, position: [(x + 0.5) * SPACING - baseOffset, (y + 0.5) * SPACING - baseOffset, (z + 0.5) * SPACING - baseOffset], type: 'interstitial_site' });
      }
    }
  }
  return atoms;
}

export function generateBCC() {
  const atoms = [];
  const baseOffset = offset();
  for (let x = 0; x < SIZE; x += 1) {
    for (let y = 0; y < SIZE; y += 1) {
      for (let z = 0; z < SIZE; z += 1) {
        atoms.push({ id: `host-corner-${x}-${y}-${z}`, position: [x * SPACING - baseOffset, y * SPACING - baseOffset, z * SPACING - baseOffset], type: 'host' });
        if (x < SIZE - 1 && y < SIZE - 1 && z < SIZE - 1) {
          atoms.push({ id: `host-center-${x}-${y}-${z}`, position: [(x + 0.5) * SPACING - baseOffset, (y + 0.5) * SPACING - baseOffset, (z + 0.5) * SPACING - baseOffset], type: 'host' });
        }
      }
    }
  }
  for (let x = 0; x < SIZE - 1; x += 1) {
    for (let y = 0; y < SIZE - 1; y += 1) {
      for (let z = 0; z < SIZE - 1; z += 1) {
        atoms.push({ id: `interstitial-${x}-${y}-${z}`, position: [(x + 0.5) * SPACING - baseOffset, (y + 0.5) * SPACING - baseOffset, z * SPACING - baseOffset], type: 'interstitial_site' });
      }
    }
  }
  return atoms;
}

export function generateFCC() {
  const atoms = [];
  const baseOffset = offset();
  for (let x = 0; x < SIZE; x += 1) {
    for (let y = 0; y < SIZE; y += 1) {
      for (let z = 0; z < SIZE; z += 1) {
        atoms.push({ id: `host-corner-${x}-${y}-${z}`, position: [x * SPACING - baseOffset, y * SPACING - baseOffset, z * SPACING - baseOffset], type: 'host' });
        if (x < SIZE - 1 && y < SIZE - 1) {
          atoms.push({ id: `host-faceZ-${x}-${y}-${z}`, position: [(x + 0.5) * SPACING - baseOffset, (y + 0.5) * SPACING - baseOffset, z * SPACING - baseOffset], type: 'host' });
        }
        if (x < SIZE - 1 && z < SIZE - 1) {
          atoms.push({ id: `host-faceY-${x}-${y}-${z}`, position: [(x + 0.5) * SPACING - baseOffset, y * SPACING - baseOffset, (z + 0.5) * SPACING - baseOffset], type: 'host' });
        }
        if (y < SIZE - 1 && z < SIZE - 1) {
          atoms.push({ id: `host-faceX-${x}-${y}-${z}`, position: [x * SPACING - baseOffset, (y + 0.5) * SPACING - baseOffset, (z + 0.5) * SPACING - baseOffset], type: 'host' });
        }
      }
    }
  }
  for (let x = 0; x < SIZE - 1; x += 1) {
    for (let y = 0; y < SIZE - 1; y += 1) {
      for (let z = 0; z < SIZE - 1; z += 1) {
        atoms.push({ id: `interstitial-${x}-${y}-${z}`, position: [(x + 0.5) * SPACING - baseOffset, (y + 0.5) * SPACING - baseOffset, (z + 0.5) * SPACING - baseOffset], type: 'interstitial_site' });
      }
    }
  }
  return atoms;
}

export function generateLattice(type) {
  if (type === 'bcc') return generateBCC();
  if (type === 'fcc') return generateFCC();
  return generateSC();
}

export function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function findNearestInterstitial(atoms, position) {
  const sites = atoms.filter((atom) => atom.type === 'interstitial_site');
  if (!sites.length) return null;
  return sites.reduce((nearest, current) => distance(current.position, position) < distance(nearest.position, position) ? current : nearest, sites[0]);
}

export function findPairedHost(atoms, originId) {
  const hosts = atoms.filter((atom) => atom.type === 'host' && atom.id !== originId);
  if (!hosts.length) return null;
  return hosts[Math.floor(hosts.length / 2)];
}
