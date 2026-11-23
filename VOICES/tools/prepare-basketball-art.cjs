'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createCanvas, loadImage, ImageData } = require('@napi-rs/canvas');

const art = path.resolve(__dirname, '../assets/basketball');
const cell = 88;
const clips = ['idle','run','dribble','pass','shoot','catch','defend','cheer','control'];
const count = { idle:3, run:6, dribble:6, pass:5, shoot:6, catch:4, defend:4, cheer:6, control:5, work:5 };
const sidelines = ['idle', 'run', 'defend', 'cheer', 'work'];

function context(canvas) {
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  return c;
}

function bounds(data, width, height) {
  let left = width, top = height, right = 0, bottom = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] <= 25) continue;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x + 1);
    bottom = Math.max(bottom, y + 1);
  }
  if (right <= left || bottom <= top) throw new Error('Empty sprite.');
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

function cut(image, row, column) {
  const sheet = createCanvas(cell, cell);
  context(sheet).drawImage(image, column * cell, row * cell, cell, cell, 0, 0, cell, cell);
  return sheet;
}

function mirror(sprite) {
  const target = createCanvas(cell, cell);
  const c = context(target);
  c.translate(cell, 0);
  c.scale(-1, 1);
  c.drawImage(sprite, 0, 0);
  return target;
}

function solidTorso(source, body, shoulder, hip, center) {
  const first = center - 12, last = center + 12;
  for (let y = shoulder + 3; y < hip + 3; y++) {
    const row = y * cell * 4;
    let left = first, right = last;
    while (left < right && source[row + left * 4 + 3] < 160) left++;
    while (right > left && source[row + right * 4 + 3] < 160) right--;
    const fabric = [];
    for (let x = left; x <= right; x++) {
      if (body[row + x * 4 + 3] >= 200) fabric.push(x);
    }
    for (let x = left + 1; x < right; x++) {
      const at = row + x * 4;
      if (source[at + 3] < 160 || body[at + 3] >= 240) continue;
      const before = fabric.findLast(sample => sample < x);
      const after = fabric.find(sample => sample > x);
      const a = (before ?? after ?? x) * 4 + row;
      const b = (after ?? before ?? x) * 4 + row;
      const t = before === undefined || after === undefined ? 0 : (x - before) / (after - before);
      body[at] = source[a] + (source[b] - source[a]) * t;
      body[at + 1] = source[a + 1] + (source[b + 1] - source[a + 1]) * t;
      body[at + 2] = source[a + 2] + (source[b + 2] - source[a + 2]) * t;
      body[at + 3] = 255;
    }
  }
}

function segments(sprite, direction) {
  const source = context(sprite).getImageData(0, 0, cell, cell).data;
  const box = bounds(source, cell, cell);
  const profile = direction === 1 || direction === 2;
  const forward = direction === 1 ? -1 : 1;
  const shoulder = Math.round(box.top + box.height * (profile ? .49 : .51));
  const hip = Math.round(box.top + box.height * .74);
  const wrist = Math.round(box.top + box.height * .82);
  const center = 44;
  const skinX = [];
  if (profile) for (let y = shoulder + 3; y < hip - 7; y++) {
    for (let x = 32; x <= 55; x++) {
      const at = (y * cell + x) * 4;
      const [r,g,b,a] = source.subarray(at, at + 4);
      if (a > 100 && r > 70 && r > g * 1.15 && g > Math.max(36, b * 1.13)) skinX.push(x);
    }
  }
  skinX.sort((a,b)=>a-b);
  const nearX = skinX.length ? skinX[Math.floor(skinX.length/2)] - forward : center - 3 * forward;
  const shoulderHalf = Math.round(Math.max(6, Math.min(10, box.width * .17)));
  const armLeft = profile ? nearX : center - shoulderHalf;
  const armRight = profile ? nearX : center + shoulderHalf;
  const width = profile ? Math.round(Math.max(4, Math.min(6, box.width * .15))) : shoulderHalf;
  const pixels = Array.from({ length: 5 }, () => new Uint8ClampedArray(source.length));

  for (let y = box.top; y < box.bottom; y++) for (let x = box.left; x < box.right; x++) {
    const at = (y * cell + x) * 4;
    if (!source[at + 3]) continue;
    let index = 0;
    if (y >= shoulder && y <= wrist) {
      if (profile && y < hip + 3 && Math.abs(x - nearX) <= width) index = direction === 1 ? 1 : 2;
      if (!profile && x < armLeft - (y < hip ? 0 : 1)) index = 1;
      if (!profile && x > armRight + (y < hip ? 0 : 1)) index = 2;
    }
    if (!index && y >= hip) index = x < center ? 3 : 4;
    const sample = source.subarray(at, at + 4);
    pixels[index].set(sample, at);
    if ((index === 1 || index === 2) && y <= shoulder + 4) pixels[0].set(sample, at);
    if (index >= 3 && y < hip + 4) pixels[0].set(sample, at);
  }
  if (profile) solidTorso(source, pixels[0], shoulder, hip, center);

  const layers = pixels.map(data => {
    const layer = createCanvas(cell, cell);
    context(layer).putImageData(new ImageData(data, cell, cell), 0, 0);
    return layer;
  });
  return { sprite, layers, box, pivots: [[armLeft, shoulder + 2], [armRight, shoulder + 2],
    [center - 4, hip], [center + 4, hip]] };
}

function choreography(clip, step, direction) {
  const side = direction === 1 ? -1 : direction === 2 ? 1 : 0;
  const forward = (left, right) => side ? [-side * left, -side * right] : [left, -right];
  const phase = step / count[clip] * Math.PI * 2;
  const gait = Math.sin(phase), stepLoad = Math.cos(phase * 2);
  switch (clip) {
    case 'run': {
      const swing = (side ? .43 : .25) * gait;
      return { arms: [gait * .29, -gait * .29], armBends: [-.25, .25],
        legs: [-swing, swing], knees: [Math.max(0, -gait) * .36, -Math.max(0, gait) * .36],
        lift: .55 + .85 * stepLoad, lean: (side || gait) * .8 };
    }
    case 'dribble':
    case 'control': {
      const run = clip === 'dribble';
      const apex = Math.sin(phase / 2) ** 2;
      const handle = forward(.16 + apex * .59, .13 + apex * .73);
      const arms = side === -1 ? [handle[0], -gait * .18] : [gait * .18, handle[1]];
      return { arms, armBends: forward(.16 + apex * .35, .22 + apex * .34),
        legs: run ? [-gait * .30, gait * .30] : [.06, -.09],
        knees: run ? [Math.max(0, -gait) * .30, -Math.max(0, gait) * .30] : [0, 0],
        lift: run ? .5 + .75 * stepLoad : -.35 - apex * .65, lean: side * (run ? .85 : .25) };
    }
    case 'pass':
      return { arms: forward([.28,.75,1.28,1.03,.31][step],[.37,.88,1.36,1.18,.32][step]),
        armBends: forward([.48,.47,.08,-.12,.27][step],[.43,.42,.10,-.10,.31][step]),
        lean: side * [0,.4,1.9,1.35,.25][step], lift: [-.6,-1,0,.35,0][step] };
    case 'shoot':
      return { arms: forward([.28,1.26,1.96,2.11,1.69,.35][step],[.41,1.44,2.19,2.31,1.64,.45][step]),
        armBends: forward([.32,.61,.31,-.13,-.22,.19][step],[.46,.58,.26,-.16,-.15,.20][step]),
        lift:[-1.8,-.9,3.1,5.2,2.1,-.55][step],
        legs:[.08,-.11],knees:[-.13,.16],lean:side*[0,.3,.75,.9,.45,0][step] };
    case 'catch':
      return { arms: forward([.78,1.23,.82,.23][step],[.90,1.18,.80,.32][step]),
        armBends:forward([.18,.12,.46,.31][step],[.17,.08,.52,.27][step]),
        lift:[0,-.35,-1.5,0][step],lean:side*[.2,1.2,.62,0][step] };
    case 'defend':
      return { arms:[.68+gait*.20,-.72+gait*.21],armBends:[.29,-.24],
        legs:[.23+gait*.13,-.25+gait*.14],knees:[-.2,.2],lift:-1.8+stepLoad*.4,lean:gait*.60 };
    case 'cheer':
      return { arms:[[.4,.98,1.68,1.87,1.36,.66][step],-[.75,1.35,1.68,1.54,1.01,.48][step]],
        armBends:[.32,-.39],lift:[0,1.2,3.9,3.1,1.25,-.6][step],lean:gait*.65 };
    case 'work':
      return { arms:[-.18-.24*gait,.31+.30*gait],armBends:[-.34,.36],lift:.29*gait };
    default:
      return { lift:[0,.52,.18][step],lean:[0,.24,-.2][step] };
  }
}

function articulate(c, layer, pivot, angle, bend, joint) {
  const [x, y] = pivot;
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.translate(-x, -y);
  if (!bend) c.drawImage(layer, 0, 0);
  else {
    const split = Math.min(cell - 3, y + joint);
    const overlap = 3;
    c.drawImage(layer, 0, 0, cell, split + overlap, 0, 0, cell, split + overlap);
    c.translate(x, split);
    c.rotate(bend);
    c.translate(-x, -split);
    c.drawImage(layer, 0, split - overlap, cell, cell - split + overlap, 0, split - overlap, cell, cell - split + overlap);
  }
  c.restore();
}

function removeSpecks(c) {
  const image = c.getImageData(0, 0, cell, cell);
  const data = image.data, visited = new Uint8Array(cell * cell);
  let changed = false;
  for (let i = 0; i < visited.length; i++) {
    if (visited[i] || data[i * 4 + 3] < 36) continue;
    visited[i] = 1;
    const component = [i];
    for (let k = 0; k < component.length; k++) {
      const at = component[k], x = at % cell, y = Math.floor(at / cell);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (x+dx<0 || x+dx>=cell || y+dy<0 || y+dy>=cell) continue;
        const next = at + dy * cell + dx;
        if (visited[next] || data[next * 4 + 3] < 36) continue;
        visited[next] = 1;
        component.push(next);
      }
    }
    if (component.length <= 19) {
      for (const pixel of component) data.fill(0, pixel * 4, pixel * 4 + 4);
      changed = true;
    }
  }
  if (changed) c.putImageData(image, 0, 0);
}

function frame(rig, direction, clip, step) {
  const canvas = createCanvas(cell, cell);
  const c = context(canvas);
  const movement = choreography(clip, step, direction);
  const { arms=[0,0], armBends=[0,0], legs=[0,0], knees=[0,0], lift=0, lean=0 } = movement;
  const raise = Math.min(lift, rig.box.top - 1);
  c.translate(lean, -raise);
  if (clip === 'idle') {
    c.drawImage(rig.sprite, 0, 0);
    return canvas;
  }
  articulate(c,rig.layers[3],rig.pivots[2],legs[0],knees[0],9);
  articulate(c,rig.layers[4],rig.pivots[3],legs[1],knees[1],9);
  const far = direction === 1 ? 2 : 1;
  const near = 3 - far;
  articulate(c,rig.layers[far],rig.pivots[far-1],arms[far-1],armBends[far-1],10);
  c.drawImage(rig.layers[0], 0, 0);
  articulate(c,rig.layers[near],rig.pivots[near-1],arms[near-1],armBends[near-1],10);
  removeSpecks(c);
  return canvas;
}

function pack(rows, animations) {
  const columns=animations.reduce((sum,clip)=>sum+count[clip],0);
  const canvas=createCanvas(columns*cell,rows.length*cell);
  const c=context(canvas);
  rows.forEach(({sprite,direction},y)=>{
    const rig=segments(sprite,direction);
    let column=0;
    for(const clip of animations){
      for(let step=0;step<count[clip];step++)c.drawImage(frame(rig,direction,clip,step),column++*cell,y*cell);
    }
  });
  return canvas;
}

function viewRows(sheet, index) {
  const front = cut(sheet, 0, index);
  const side = cut(sheet, 1, index);
  const rear = cut(sheet, 2, index);
  return [front, mirror(side), side, rear].map((sprite, direction) => ({ sprite, direction }));
}

function ground(c) {
  c.fillStyle = '#203b39';
  c.fillRect(0, 0, 640, 360);
  c.fillStyle = '#395c52';
  c.fillRect(20, 20, 600, 319);
  for (let i = 0; i < 4; i++) {
    c.fillStyle = i % 2 ? '#916d57' : '#73594d';
    c.fillRect(39, 31 + i * 17, 562, 13);
  }
  for (let row = 0; row < 17; row++) {
    const y = 110 + row * 14;
    c.fillStyle = ['#bc875e', '#c89262', '#d19d6a'][row % 3];
    c.fillRect(29, y, 582, 14);
    c.fillStyle = '#9a613e35';
    c.fillRect(29, y, 582, 1);
    for (let x = 29 + row % 2 * 43; x < 610; x += 86) c.fillRect(x, y, 1, 14);
  }
  c.strokeStyle = '#f7dfb4';
  c.lineWidth = 3;
  c.strokeRect(37, 117, 566, 221);
  c.beginPath();
  c.moveTo(320, 117);
  c.lineTo(320, 338);
  c.stroke();
  c.fillStyle = '#2a6657';
  c.beginPath();
  c.arc(320, 226, 49, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = '#805757';
  c.fillRect(507, 179, 95, 96);
  c.strokeRect(507, 179, 95, 96);
  c.beginPath();
  c.arc(507, 226, 48, Math.PI / 2, Math.PI * 1.5);
  c.stroke();
  const arc = 166, corner = 98, angle = Math.asin(corner/arc);
  const joint = 570 - Math.sqrt(arc ** 2 - corner ** 2);
  c.beginPath();
  c.moveTo(603,226-corner);
  c.lineTo(joint,226-corner);
  c.moveTo(joint,226+corner);
  c.lineTo(603,226+corner);
  c.stroke();
  c.beginPath();
  c.arc(570,226,arc,Math.PI-angle,Math.PI+angle);
  c.stroke();
}

function cover(rows, fans, props, comeback) {
  const canvas = createCanvas(640, 360);
  const c = context(canvas);
  ground(c);
  c.save();
  c.translate(615, 100);
  c.scale(-1, 1);
  c.drawImage(props, 128, 0, 128, 128, 0, 0, 101, 101);
  c.restore();
  const crowd = Array.from({ length: 8 }, (_, i) => [i + 7, 92 + i * 65, 96 + (i % 2) * 3, 'cheer', 0, i % 4]);
  for (const [id, x, y, pose, direction, phase] of crowd) {
    const actor = fans[id];
    c.drawImage(frame(segments(actor, direction), direction, pose, phase), x - 24, y - 48, 48, 48);
  }
  const lineup = comeback
    ? [[3, 137, 260, 'run', 2, 1], [6, 208, 270, 'defend', 2, 2], [7, 268, 298, 'run', 1, 1], [0, 390, 252, 'shoot', 2, 2], [9, 450, 266, 'defend', 1, 3], [2, 521, 292, 'catch', 1, 1]]
    : [[8, 92, 273, 'defend', 2, 1], [1, 156, 247, 'run', 2, 0], [7, 201, 293, 'run', 1, 1], [0, 343, 260, 'shoot', 2, 2], [9, 415, 271, 'defend', 1, 2], [4, 500, 288, 'catch', 1, 2]];
  for (const [id, x, y, pose, direction, phase] of lineup.sort((a, b) => a[2] - b[2])) {
    const actor = rows[id * 4 + direction].sprite;
    c.fillStyle = '#65422e55';
    c.beginPath();
    c.ellipse(x, y - 1, 17, 4, 0, 0, Math.PI * 2);
    c.fill();
    c.drawImage(frame(segments(actor, direction), direction, pose, phase), x - 48, y - 94, 96, 96);
  }
  c.drawImage(props, 0, 0, 128, 128, comeback ? 480 : 457, 121, 30, 30);
  return canvas;
}

function save(name, canvas) {
  fs.writeFileSync(path.join(art, name + '.webp'), canvas.encodeSync('webp', 98));
}

async function main() {
  const [aurora, tambor, bench, props] = await Promise.all(
    ['art-source/aurora', 'art-source/tambor', 'art-source/ginasio', 'equipamentos']
      .map(name => loadImage(path.join(art, name + '.webp')))
  );
  const a = Array.from({ length: 5 }, (_, i) => viewRows(aurora, i)).flat();
  const b = Array.from({ length: 5 }, (_, i) => viewRows(tambor, i)).flat();
  const fans = Array.from({ length: 15 }, (_, i) => cut(bench, Math.floor(i / 5), i % 5));
  const benchRows = fans.map(sprite => ({ sprite, direction: 0 }));
  const referee = cut(bench, 3, 1);
  benchRows.push({ sprite: mirror(referee), direction: 1 }, { sprite: referee, direction: 2 });
  save('campus-roster', pack(a, clips));
  save('campus-tambor', pack(b, clips));
  save('campus-arquibancada', pack(benchRows, sidelines));
  save('cover', cover([...a, ...b], fans, props, false));
  save('virada-cover', cover([...a, ...b], fans, props, true));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
