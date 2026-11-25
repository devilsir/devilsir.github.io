"use strict";

globalThis.QuimiCraftFluidFlow = (() => {
  const falling = -1;

  function levelAt(limit, above, supportedNeighbors) {
    if (above) return falling;
    let level = 0;
    for (const neighbor of supportedNeighbors) {
      level = Math.max(level, (neighbor === falling ? limit : neighbor) - 1);
    }
    return level;
  }

  function height(limit, level, covered, top) {
    if (covered) return 1;
    if (level === falling) return top;
    return .15 + (top - .15) * Math.max(0, level) / limit;
  }

  function surface(corners,x,z) {
    const [[a,b],[c,d]]=corners;
    return x+z<=1?a+(c-a)*x+(b-a)*z:d+(b-d)*(1-x)+(c-d)*(1-z);
  }

  const fullCorners = [[1, 1], [1, 1]];
  function waterCorners(x, z, readHeight) {
    const center = readHeight(x, z);
    if (center === 1) return fullCorners;
    const west = readHeight(x - 1, z), east = readHeight(x + 1, z);
    const north = readHeight(x, z - 1), south = readHeight(x, z + 1);

    function corner(edgeX, edgeZ, dx, dz) {
      const diagonal = edgeX > 0 || edgeZ > 0 ? readHeight(x + dx, z + dz) : -1;
      let sum = 0, weights = 0;
      for (const sample of [center, edgeX, edgeZ, diagonal]) {
        if (sample === 1) return 1;
        if (sample < 0) continue;
        const weight = sample >= .8 ? 10 : 1;
        sum += sample * weight;
        weights += weight;
      }
      return sum / weights;
    }

    return [[corner(west, north, -1, -1), corner(west, south, -1, 1)],
      [corner(east, north, 1, -1), corner(east, south, 1, 1)]];
  }

  function blendWaterFog(x, z, readProfile) {
    const spacing = 4;
    const gx = Math.floor(x / spacing), gz = Math.floor(z / spacing);
    const tx = x / spacing - gx, tz = z / spacing - gz;
    const rgb = [0, 0, 0];
    let visibility = 0;
    for (let dz = 0; dz <= 1; dz++) {
      for (let dx = 0; dx <= 1; dx++) {
        const weight = (dx ? tx : 1 - tx) * (dz ? tz : 1 - tz);
        if (!weight) continue;
        const profile = readProfile((gx + dx) * spacing, (gz + dz) * spacing);
        for (let i = 0; i < 3; i++) rgb[i] += profile.rgb[i] * weight;
        visibility += profile.visibility * weight;
      }
    }
    return {rgb, visibility};
  }

  function faceVertices(face,heights,x,y,z,inset=0){
    const [nx,ny,nz]=face.n;
    return face.v.map(([vx,vy,vz])=>[
      x+vx-nx*inset,
      y+vy*heights[vx][vz]-ny*inset,
      z+vz-nz*inset
    ]);
  }

  return {falling, levelAt, height, surface, waterCorners, blendWaterFog, faceVertices};
})();
