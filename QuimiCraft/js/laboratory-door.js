"use strict";

globalThis.QuimiCraftLaboratoryDoor = (() => {
  const rightAngle = Math.PI / 2;
  const frameTime = .28;
  const thickness = .22;

  function create(THREE, layout) {
    const center = layout.cx;
    const floor = layout.y;
    const front = layout.cz - layout.halfD;
    const plane = front + .5;
    const minX = center - 2;
    const maxX = center + 2;
    const height = 3;
    const width = (maxX - minX) / 2 - .04;
    const cells = [];
    for (let x = minX; x < maxX; x++) {
      for (let half = 0; half < height; half++) cells.push({x, y: floor + half, z: front, half});
    }

    let root = null;
    let angle = 0;
    let open = false;
    let target = 0;
    const leaves = [{hinge: minX, direction: 1}, {hinge: maxX, direction: -1}];

    function isCell(x, y, z) {
      return z === front && x >= minX && x < maxX && y >= floor && y < floor + height;
    }

    function nearby(pos) {
      return Math.abs(pos.x - center) < 3.8 && Math.abs(pos.z - plane) < 3.1 && Math.abs(pos.y - floor) < 3;
    }

    function hits(x0, x1, y0, y1, z0, z1, at = angle) {
      if (y1 <= floor + .04 || y0 >= floor + 2.96 || x1 <= minX - thickness ||
          x0 >= maxX + thickness || z1 <= plane - thickness || z0 >= plane + width + thickness) return false;
      const cx = (x0 + x1) / 2;
      const cz = (z0 + z1) / 2;
      const rx = (x1 - x0) / 2;
      const rz = (z1 - z0) / 2;
      const depth = thickness / 2;
      const cosine = Math.cos(at);
      const s = Math.sin(at);
      for (const {hinge, direction} of leaves) {
        const u = cosine * direction;
        const dx = cx - (hinge + u * width / 2);
        const dz = cz - (plane + s * width / 2);
        if (Math.abs(dx) < rx + cosine * width / 2 + s * depth &&
            Math.abs(dz) < rz + s * width / 2 + cosine * depth &&
            Math.abs(dx * u + dz * s) < width / 2 + rx * cosine + rz * s &&
            Math.abs(dx * s - dz * u) < depth + rx * s + rz * cosine) return true;
      }
      return false;
    }

    function syncVisual() {
      if (!root) return;
      for (const {group, direction} of leaves) group.rotation.y = -direction * angle;
      root.updateMatrixWorld(true);
    }

    function snap(savedOpen) {
      open = savedOpen;
      angle = target = open ? rightAngle : 0;
      syncVisual();
    }

    function attach(parent, materials) {
      root = new THREE.Group();
      root.name = "Carbon Grand Airlock";
      parent.add(root);
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      function part(group, material, x, y, z, w, h, d) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.scale.set(w, h, d);
        group.add(mesh);
      }

      for (const leaf of leaves) {
        const group = leaf.group = new THREE.Group();
        group.position.set(leaf.hinge, floor, plane);
        const x = leaf.direction * width / 2;
        part(group, materials.metal, x, 1.08, 0, width, 2.08, .15);
        part(group, materials.teal, x, 2.53, 0, width, .86, .15);
        part(group, materials.glass, x, 2.52, -.086, width - .34, .56, .028);
        part(group, materials.brass, x, .14, -.09, width - .2, .08, .04);
        part(group, materials.brass, x, 2.88, -.09, width - .2, .08, .04);
        for(const side of [-1,1]){
          const z=side*.085;
          part(group, materials.teal, x, 1.19, z, width-.30, 1.32, .039);
          for(const row of [.58,1.51])part(group, materials.brass,x,row,z+side*.022,width-.36,.052,.035);
          for(const offset of [-width*.31,width*.31]){
            part(group, materials.metal,x+offset,1.04,z+side*.025,.056,.93,.043);
            part(group, materials.brass,x+offset,.39,z+side*.027,.098,.098,.034);
          }
          const latch=leaf.direction*(width-.24);
          part(group, materials.brass,latch,1.20,z+side*.043,.12,.24,.08);
          part(group, materials.glass,latch,1.21,z+side*.088,.061,.12,.025);
        }
        root.add(group);
      }
      syncVisual();
    }

    function hitsBody(body, at, pad = 0) {
      return hits(body.x - body.radius - pad, body.x + body.radius + pad, body.y + .02,
        body.y + body.height - .02, body.z - body.radius - pad, body.z + body.radius + pad, at);
    }

    function closingBlocked(bodies) {
      const steps = 32;
      for (const body of bodies) {
        const inThreshold = body.x + body.radius > minX && body.x - body.radius < maxX &&
          Math.abs(body.z - plane) < body.radius + thickness / 2 &&
          body.y < floor + height && body.y + body.height > floor;
        if (inThreshold) return true;
        for (let i = 0; i <= steps; i++) {
          if (hitsBody(body, angle * i / steps, .055)) return true;
        }
      }
      return false;
    }

    function toggle(bodies) {
      if (open && closingBlocked(bodies)) return null;
      open = !open;
      target = open ? rightAngle : 0;
      return open;
    }

    function update(dt, bodies) {
      const distance = Math.min(Math.abs(target - angle), rightAngle * Math.max(0, dt) / frameTime);
      if (!distance) return false;
      const closing = target < angle;
      if (closing && closingBlocked(bodies)) {
        open = true;
        target = rightAngle;
        return true;
      }
      const next = angle + Math.sign(target - angle) * distance;
      const steps = Math.ceil(distance / .045);
      for (let i = 1; i <= steps; i++) {
        const at = angle + (next - angle) * i / steps;
        if (bodies.some(body => hitsBody(body, at, .025))) return false;
      }
      angle = next;
      syncVisual();
      return false;
    }

    function aim(raycaster, maxDistance) {
      if (!root) return false;
      const origin = raycaster.ray.origin;
      if (Math.abs(origin.z - plane) > maxDistance + width || Math.abs(origin.x - center) > maxDistance + width) return false;
      const hit = raycaster.intersectObject(root, true)[0];
      if (hit && hit.distance <= maxDistance) return true;
      if (Math.abs(raycaster.ray.direction.z) < .001) return false;
      const {direction} = raycaster.ray;
      const t = (plane - origin.z) / direction.z;
      if (t < 0 || t > maxDistance || t > 4.8) return false;
      const x = origin.x + t * direction.x;
      const y = origin.y + t * direction.y;
      return x > minX && x < maxX && y > floor && y < floor + height;
    }

    return {minX, maxX, center, floor, front, plane, height, cells, isCell, nearby, hits, snap, attach, toggle, update, aim,
      get isOpen() { return open; }, get angle() { return angle; }, get moving() { return target !== angle; }};
  }

  return {create};
})();
