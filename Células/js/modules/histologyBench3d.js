import * as T from 'three';
import {
  v, group, mesh, box, sphere, cylinder, capsule, lathe, torus, rod, tube,
  material, glow, platform, labelSprite, organicDisplace, tintGeometry,
  glassMaterial, frostedGlassMaterial, gelMaterial, proteinMaterial,
  metalMaterial, enamelMaterial, anodizedMaterial, organelleMaterial
} from '../core/geometry.js';

function roundedSlab(parent, mat, w, d, h, r, bevel = 0.038, x = 0, y = 0, z = 0) {
  const hw = w / 2, hd = d / 2, cr = Math.min(r, hw * 0.48, hd * 0.48);
  const s = new T.Shape();
  s.moveTo(-hw + cr, -hd);
  s.lineTo(hw - cr, -hd);
  s.quadraticCurveTo(hw, -hd, hw, -hd + cr);
  s.lineTo(hw, hd - cr);
  s.quadraticCurveTo(hw, hd, hw - cr, hd);
  s.lineTo(-hw + cr, hd);
  s.quadraticCurveTo(-hw, hd, -hw, hd - cr);
  s.lineTo(-hw, -hd + cr);
  s.quadraticCurveTo(-hw, -hd, -hw + cr, -hd);
  const geo = new T.ExtrudeGeometry(s, {
    depth: Math.max(0.01, h - bevel * 2),
    bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 10
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -h / 2 + bevel, 0);
  geo.computeVertexNormals();
  return mesh(parent, geo, mat, x, y, z);
}

// Live glowing green 7-segment LED panel matching the real Leica RM2255 in the course video!
function makeMicrotomeLEDPanel() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 384;
  const ctx = c.getContext('2d');
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  tex.anisotropy = 4;

  function draw(thicknessUm = 3, cutCount = 98) {
    ctx.fillStyle = '#d4d0c2';
    ctx.fillRect(0, 0, 256, 384);
    ctx.strokeStyle = '#8b887b';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 236, 364);

    // Top status strip (RETRACT / E-STOP)
    ctx.fillStyle = '#c4c0b2';
    ctx.fillRect(22, 24, 212, 34);
    ctx.fillStyle = '#e89638';
    ctx.beginPath(); ctx.arc(38, 41, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#383a36';
    ctx.font = '700 13px Consolas, monospace';
    ctx.fillText('RETRACT   E-STOP', 52, 46);

    // Two dark recessed emerald-green 7-segment digital displays (03.0 um & 0098 cuts!)
    const boxes = [
      [82, String(thicknessUm.toFixed(1)).padStart(4, '0'), 'μm'],
      [168, String(cutCount).padStart(4, '0'), '∑']
    ];
    for (const [y, val, unit] of boxes) {
      ctx.fillStyle = '#0c1f16';
      ctx.fillRect(24, y, 166, 62);
      ctx.strokeStyle = '#5f685e';
      ctx.lineWidth = 3;
      ctx.strokeRect(24, y, 166, 62);
      ctx.shadowColor = '#3dff88';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#48ff94';
      ctx.font = '700 44px Consolas, monospace';
      ctx.fillText(val, 36, y + 46);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#3c4540';
      ctx.font = '700 17px Inter, sans-serif';
      ctx.fillText(unit, 198, y + 38);
      ctx.fillStyle = '#3ad678';
      ctx.beginPath(); ctx.arc(210, y + 52, 5, 0, Math.PI * 2); ctx.fill();
    }

    // Two membrane buttons (MENU/MODE and CLEAR)
    for (const [bx, lines] of [[24, ['MENU', 'MODE']], [136, ['CLEAR']]]) {
      ctx.fillStyle = '#ccc8ba';
      ctx.fillRect(bx, 260, 96, 86);
      ctx.strokeStyle = '#52544e';
      ctx.lineWidth = 4;
      ctx.strokeRect(bx, 260, 96, 86);
      ctx.fillStyle = '#252826';
      ctx.font = '700 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      if (lines.length === 2) {
        ctx.fillText(lines[0], bx + 48, 297);
        ctx.fillText(lines[1], bx + 48, 322);
      } else {
        ctx.fillText(lines[0], bx + 48, 310);
      }
      ctx.textAlign = 'left';
    }
    tex.needsUpdate = true;
  }
  draw(3, 98);
  return { texture: tex, update: draw };
}

function makeLeicaBadgeTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#dcd7c8';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#6f7476';
  ctx.font = '800 54px Inter, Segoe UI, sans-serif';
  ctx.fillText('LEICA', 26, 78);
  ctx.fillStyle = '#474c50';
  ctx.font = '700 46px Inter, Segoe UI, sans-serif';
  ctx.fillText('RM2255', 226, 78);
  ctx.fillStyle = '#b4353c';
  ctx.fillRect(26, 94, 440, 6);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// Live Samsung Lab Monitor Canvas connected to the Zeiss Stemi 2000-C top CCD camera (Course Photo 1!)
function makeLupaMonitorPanel() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 336;
  const ctx = c.getContext('2d');
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  tex.anisotropy = 4;

  let lastDraw = -99;
  let lastStage = '';

  function drawBeeTop(x, y, scale, t, frozen, opened) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Translucent veined wings
    for (const s of [-1, 1]) {
      ctx.save();
      ctx.translate(10, s * 10);
      ctx.rotate(s * (0.48 + (frozen ? 0 : Math.sin(t * 2.4) * 0.04)));
      ctx.fillStyle = 'rgba(218, 245, 255, 0.34)';
      ctx.strokeStyle = 'rgba(235, 250, 255, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(-26, s * 22, 34, 11, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2, s * 14); ctx.lineTo(-48, s * 26);
      ctx.moveTo(-14, s * 19); ctx.lineTo(-36, s * 30);
      ctx.stroke();
      ctx.restore();
    }

    // Jointed legs
    ctx.strokeStyle = '#251a14';
    ctx.lineWidth = 2.6;
    for (const s of [-1, 1]) {
      for (let l = 0; l < 3; l++) {
        const lx = 24 - l * 15;
        ctx.beginPath();
        ctx.moveTo(lx, s * 12);
        ctx.lineTo(lx - 6, s * 30);
        ctx.lineTo(lx - 15, s * 40);
        ctx.stroke();
      }
    }

    // Striped abdomen
    const abdGrad = ctx.createLinearGradient(-56, -22, -6, 22);
    abdGrad.addColorStop(0, '#1e1612');
    abdGrad.addColorStop(0.5, '#30231c');
    abdGrad.addColorStop(1, '#18110e');
    ctx.fillStyle = abdGrad;
    ctx.beginPath();
    ctx.ellipse(-30, 0, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Amber tergite bands
    ctx.fillStyle = frozen ? '#b69852' : '#e6a62c';
    for (const bx of [-42, -29, -16]) {
      ctx.beginPath();
      ctx.ellipse(bx, 0, 4.6, 16.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fuzzy golden-brown thorax
    const thGrad = ctx.createRadialGradient(14, -4, 3, 14, 0, 20);
    thGrad.addColorStop(0, '#c8923e');
    thGrad.addColorStop(1, '#684418');
    ctx.fillStyle = thGrad;
    ctx.beginPath();
    ctx.ellipse(14, 0, 19, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head + compound eyes + antennae
    ctx.fillStyle = '#1b1412';
    ctx.beginPath();
    ctx.ellipse(37, 0, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0d0c14';
    ctx.beginPath();
    ctx.ellipse(40, -10, 5, 7, 0.25, 0, Math.PI * 2);
    ctx.ellipse(40, 10, 5, 7, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#241a16';
    ctx.lineWidth = 2;
    for (const s of [-1, 1]) {
      const wag = frozen ? 0 : Math.sin(t * 3 + s) * 2.5;
      ctx.beginPath();
      ctx.moveTo(45, s * 4);
      ctx.quadraticCurveTo(56, s * 12, 62, s * (16 + wag));
      ctx.stroke();
    }

    // If opened on red wax, show exposed dorsal incision (glowing during dissection, hollow dark cavity after organ removal!)
    if (opened === 'active') {
      ctx.fillStyle = 'rgba(246, 232, 118, 0.48)';
      ctx.beginPath();
      ctx.ellipse(-38, 0, 18, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (opened === 'empty') {
      ctx.fillStyle = '#380914';
      ctx.beginPath();
      ctx.ellipse(-36, 0, 19, 9.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220, 140, 150, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    ctx.restore();
  }

  function update(stageKey, t, resinMode, tissueName = 'Amostra', afterDissect = false, force = false) {
    const stateTag = `${stageKey}|${resinMode ? 1 : 0}|${afterDissect ? 1 : 0}`;
    if (!force && stateTag === lastStage && Math.abs(t - lastDraw) < 0.08) return;
    lastDraw = t;
    lastStage = stateTag;

    // Dark clinical AxioVision desktop frame
    ctx.fillStyle = '#0a1219';
    ctx.fillRect(0, 0, 512, 336);

    // Top acquisition software header bar
    ctx.fillStyle = '#132230';
    ctx.fillRect(0, 0, 512, 34);
    ctx.fillStyle = '#254258';
    ctx.fillRect(0, 33, 512, 1.5);

    const pulse = 0.55 + 0.45 * Math.sin(t * 4.5);
    ctx.fillStyle = `rgba(74, 245, 148, ${pulse.toFixed(2)})`;
    ctx.beginPath(); ctx.arc(16, 17, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#dff6ff';
    ctx.font = '700 13px Inter, Segoe UI, sans-serif';
    ctx.fillText('ZEISS Stemi 2000-C  ·  CCD AO VIVO', 28, 22);

    const isCapture = resinMode && stageKey === 'bee_capture';
    const isFreeze = resinMode && stageKey === 'bee_freeze';
    const isDissectActive = resinMode && stageKey === 'bee_dissect';
    const isPostExtract = resinMode && !isCapture && !isFreeze && !isDissectActive && afterDissect;
    const zoomLabel = isDissectActive
      ? '32× · DISSECÇÃO ATIVA'
      : isPostExtract
        ? '32× · ÓRGÃO RETIRADO'
        : isFreeze
          ? '20× · PLATINA AGUARDANDO'
          : isCapture
            ? '20× · CERA VAZIA (PRÉ-ABELHA)'
            : '12× · MACROSCOPIA';

    ctx.fillStyle = isPostExtract ? '#6ef7b8' : '#7de6f8';
    ctx.font = '700 11.5px Consolas, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(zoomLabel, 500, 22);
    ctx.textAlign = 'left';

    // Optical circular viewport centered in left-middle
    const cx = 216, cy = 184, rad = 132;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.clip();

    if (isCapture || isFreeze) {
      // BEFORE PLACING THE BEE ON LUPA 01: Empty glossy crimson red-wax dish + fresh glistening 0.9% saline droplet!
      const bg = ctx.createRadialGradient(cx, cy, 16, cx, cy, rad);
      bg.addColorStop(0, '#a62a40');
      bg.addColorStop(0.68, '#6e1628');
      bg.addColorStop(1, '#2c0810');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

      // Subtle micro-scratches on laboratory dissection wax
      ctx.strokeStyle = 'rgba(255, 195, 205, 0.12)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(cx - 88 + i * 24, cy - 72 + (i % 2) * 30);
        ctx.lineTo(cx - 32 + i * 24, cy + 54 - (i % 3) * 22);
        ctx.stroke();
      }

      // Glistening clear 0.9% NaCl saline drop ready for specimen!
      const sh = Math.sin(t * 1.8) * 3;
      const sal = ctx.createRadialGradient(cx + 4, cy, 6, cx + 4, cy, 86);
      sal.addColorStop(0, 'rgba(148, 236, 255, 0.30)');
      sal.addColorStop(0.84, 'rgba(98, 202, 232, 0.16)');
      sal.addColorStop(1, 'rgba(215, 250, 255, 0.62)');
      ctx.fillStyle = sal;
      ctx.beginPath();
      ctx.arc(cx + 4, cy, 86, 0, Math.PI * 2);
      ctx.fill();
      // Specular crescent reflection on droplet meniscus
      ctx.strokeStyle = 'rgba(240, 252, 255, 0.72)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx + 4, cy, 74, -2.5 + sh * 0.01, -1.6 + sh * 0.01);
      ctx.stroke();

      // Clear status badge showing specimen is NOT YET under Lupa!
      ctx.fillStyle = 'rgba(8, 16, 24, 0.80)';
      ctx.strokeStyle = isFreeze ? 'rgba(130, 226, 255, 0.75)' : 'rgba(250, 204, 92, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cx - 102, cy - 22, 204, 44, 8); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = isFreeze ? '#9eeeff' : '#ffe082';
      ctx.font = '700 12px Consolas, monospace';
      ctx.fillText(isFreeze ? 'AGUARDANDO ABELHA' : 'PLATINA VAZIA · SEM ABELHA', cx, cy - 4);
      ctx.fillStyle = '#d8eef8';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillText(isFreeze ? 'Espécime em crioeutanásia (−20 °C)' : 'Abelha no favo (Petri) · Salina pronta', cx, cy + 14);
      ctx.textAlign = 'left';
    } else if (isDissectActive) {
      // ACTIVE DISSECTION ON RED WAX + SALINE + GLOWING VENTRICULUS / MALPIGHIAN / HEART + REALISTIC FLAT TWEEZERS TIPS!
      const bg = ctx.createRadialGradient(cx, cy, 16, cx, cy, rad);
      bg.addColorStop(0, '#9e263c');
      bg.addColorStop(0.68, '#691525');
      bg.addColorStop(1, '#2d0810');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

      // Refractive saline drop meniscus
      const sal = ctx.createRadialGradient(cx + 8, cy, 8, cx + 8, cy, 96);
      sal.addColorStop(0, 'rgba(135, 228, 248, 0.28)');
      sal.addColorStop(0.82, 'rgba(92, 196, 226, 0.16)');
      sal.addColorStop(1, 'rgba(205, 248, 255, 0.55)');
      ctx.fillStyle = sal;
      ctx.beginPath();
      ctx.arc(cx + 8, cy, 96, 0, Math.PI * 2);
      ctx.fill();

      // Pinned bee body on left side of saline pool
      drawBeeTop(cx - 56, cy - 6, 1.18, t, true, 'active');

      // Dissected glowing translucent Midgut / Ventriculus (ribbed curved tube — matches real Course Photo 3!)
      const lift = Math.sin(t * 2.6) * 6;
      ctx.save();
      ctx.shadowColor = '#f4f06c';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#eae25c';
      ctx.lineWidth = 11;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 6);
      ctx.bezierCurveTo(cx + 10, cy - 36 - lift * 0.4, cx + 44, cy + 28 - lift * 0.5, cx + 76, cy - 10 - lift);
      ctx.stroke();

      // Circular muscular rings along the ventriculus wall
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(112, 92, 16, 0.72)';
      ctx.lineWidth = 1.6;
      for (let k = 0; k <= 12; k++) {
        const u = k / 12;
        const px = cx - 12 + u * 84;
        const py = cy - 8 + Math.sin(u * Math.PI * 2) * 14 - lift * u;
        ctx.beginPath();
        ctx.moveTo(px - 2, py - 6);
        ctx.lineTo(px + 2, py + 6);
        ctx.stroke();
      }

      // Radiating fine golden Malpighian tubules & silvery tracheal filaments
      ctx.strokeStyle = 'rgba(242, 236, 118, 0.85)';
      ctx.lineWidth = 1.8;
      for (let m = 0; m < 7; m++) {
        const ang = (m / 7) * Math.PI * 2 + 0.4;
        const mx = cx + 24, my = cy + 6 - lift * 0.4;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.quadraticCurveTo(
          mx + Math.cos(ang) * 26, my + Math.sin(ang) * 26,
          mx + Math.cos(ang + 0.35) * 48, my + Math.sin(ang + 0.35) * 42
        );
        ctx.stroke();
      }

      // Pulsing dorsal heart vessel near thorax/abdomen junction
      const heartPulse = 1 + Math.sin(t * 5.2) * 0.16;
      ctx.fillStyle = 'rgba(255, 242, 130, 0.78)';
      ctx.beginPath();
      ctx.ellipse(cx + 76, cy - 12 - lift, 14 * heartPulse, 9 * heartPulse, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Tapered brushed-steel Dumont #5 forceps blades entering cleanly from bottom-right!
      const fx = cx + 76, fy = cy - 10 - lift;
      const pinch = Math.sin(t * 2.6) * 2.5;
      ctx.fillStyle = '#dce9f2';
      ctx.strokeStyle = '#5c7280';
      ctx.lineWidth = 1.1;
      for (const [ox, oy, w1] of [[156, 86, 10], [172, 66, 10]]) {
        ctx.beginPath();
        ctx.moveTo(fx + (ox > 160 ? 3 : -1), fy + (ox > 160 ? -3 - pinch : 2 + pinch));
        ctx.lineTo(cx + ox - w1 * 0.4, cy + oy + w1 * 0.4);
        ctx.lineTo(cx + ox + w1 * 0.4, cy + oy - w1 * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    } else if (isPostExtract) {
      // AFTER ORGAN REMOVAL: Dissected open bee carcass remaining on red wax with EMPTY abdominal cavity (organ moved to fixative!)
      const bg = ctx.createRadialGradient(cx, cy, 16, cx, cy, rad);
      bg.addColorStop(0, '#962338');
      bg.addColorStop(0.68, '#621322');
      bg.addColorStop(1, '#29070e');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

      // Slightly cloudy post-dissection saline pool with residual hemolymph trace
      const sal = ctx.createRadialGradient(cx + 8, cy, 8, cx + 8, cy, 94);
      sal.addColorStop(0, 'rgba(162, 224, 232, 0.25)');
      sal.addColorStop(0.75, 'rgba(130, 185, 200, 0.14)');
      sal.addColorStop(1, 'rgba(205, 245, 252, 0.48)');
      ctx.fillStyle = sal;
      ctx.beginPath();
      ctx.arc(cx + 8, cy, 94, 0, Math.PI * 2);
      ctx.fill();

      // Open bee carcass WITHOUT ventriculus / Malpighian tubules / heart!
      drawBeeTop(cx - 46, cy - 10, 1.18, t, true, 'empty');

      // Tiny detached tergite shell fragment resting beside the empty cavity
      ctx.fillStyle = '#241914';
      ctx.strokeStyle = '#d49a2a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(cx + 42, cy - 18, 12, 6, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Clear green confirmation banner inside monitor: Organ already extracted!
      ctx.fillStyle = 'rgba(8, 22, 18, 0.84)';
      ctx.strokeStyle = 'rgba(94, 238, 172, 0.8)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.roundRect(cx - 106, cy + 44, 212, 42, 8); ctx.fill(); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6ff7bc';
      ctx.font = '700 12px Consolas, monospace';
      ctx.fillText('ÓRGÃO RETIRADO ✓', cx, cy + 61);
      ctx.fillStyle = '#dcf8ee';
      ctx.font = '600 10.5px Inter, sans-serif';
      ctx.fillText('Ventrículo/coração no processamento', cx, cy + 78);
      ctx.textAlign = 'left';
    } else {
      // Macroscopic biopsy specimen on dark contrast stage for classical/Gram/fresh protocols
      const bg = ctx.createRadialGradient(cx, cy, 12, cx, cy, rad);
      bg.addColorStop(0, '#2d3b46');
      bg.addColorStop(0.85, '#161e26');
      bg.addColorStop(1, '#090d12');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      ctx.fillStyle = '#db849f';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 42, 26, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 210, 224, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Subtle optical reticle crosshair + vignette
    ctx.strokeStyle = 'rgba(180, 244, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - rad, cy); ctx.lineTo(cx + rad, cy);
    ctx.moveTo(cx, cy - rad); ctx.lineTo(cx, cy + rad);
    ctx.stroke();

    const vig = ctx.createRadialGradient(cx, cy, rad * 0.72, cx, cy, rad);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.68)');
    ctx.fillStyle = vig;
    ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    ctx.restore();

    // Circular ocular bezel ring
    ctx.strokeStyle = '#3d667e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Calibrated optical scale bar inside ocular bottom-left
    ctx.fillStyle = 'rgba(6, 14, 20, 0.74)';
    ctx.fillRect(122, 274, 86, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(130, 289, 54, 3);
    ctx.font = '700 11px Consolas, monospace';
    ctx.fillText(isDissectActive || isPostExtract ? '500 μm' : '1,0 mm', 132, 285);

    // Right side telemetry & anatomical legend panel on monitor
    ctx.fillStyle = '#0e1a24';
    ctx.fillRect(362, 46, 140, 276);
    ctx.strokeStyle = '#233f52';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(362, 46, 140, 276);

    ctx.fillStyle = '#6fe6f5';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.fillText('IMAGEM DA LUPA', 372, 66);

    const rows = isDissectActive
      ? [
        ['Amostra', 'Apis · Dissecção'],
        ['Meio', 'Salina NaCl 0,9%'],
        ['Base', 'Cera vermelha'],
        ['Órgãos', 'Ventrículo +'],
        ['', 'Túb. Malpighi'],
        ['', 'Vaso dorsal'],
        ['Aumento', '32× (Zoom)']
      ]
      : isPostExtract
        ? [
          ['Status', 'Órgão retirado ✓'],
          ['Na cera', 'Carcaça aberta'],
          ['Cavidade', 'Sem vísceras'],
          ['Destino', 'Fixador / Resina'],
          ['Aumento', '32× (Zoom)']
        ]
        : isFreeze
          ? [
            ['Platina', 'Cera vazia'],
            ['Abelha', 'Crio −20 °C'],
            ['Tempo', '3–5 min (gelo)'],
            ['Meio', 'Salina pronta'],
            ['Aumento', '20× (LED)']
          ]
          : isCapture
            ? [
              ['Platina', 'Cera vazia'],
              ['Abelha', 'No favo (Petri)'],
              ['Meio', 'Salina NaCl 0,9%'],
              ['Status', 'Pré-dissecção'],
              ['Aumento', '20× (LED)']
            ]
            : [
              ['Amostra', tissueName.slice(0, 15)],
              ['Modo', 'Macroscopia'],
              ['Fundo', 'Platina escura'],
              ['Aumento', '12× (LED)']
            ];

    let ry = 92;
    for (const [k, val] of rows) {
      if (k) {
        ctx.fillStyle = '#7ea3b8';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.fillText(k.toUpperCase(), 372, ry);
        ry += 14;
      }
      ctx.fillStyle = '#eaf7ff';
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillText(val, 372, ry);
      ry += 20;
    }

    // Bottom Samsung SyncMaster status line
    ctx.fillStyle = '#5ee8b6';
    ctx.font = '700 10px Consolas, monospace';
    ctx.fillText('CCD 1280×960 · OK', 372, 310);

    tex.needsUpdate = true;
  }

  update('bee_capture', 0, true, 'Abelha', false, true);
  return { texture: tex, update };
}

// Sculpted Realistic Dumont #5 Stainless-Steel Precision Laboratory Tweezers (Flat Tapered Arms, Spring Heel, Serrated Grip, Fine Pinching Tips!)
function makeTweezers(parent, steelMat, darkMat) {
  const root = group(parent);
  const heelPivot = group(root, 0.94, 0, 0);

  // Welded rounded spring U-butt connecting the two flat stainless-steel blades
  const buttGeo = new T.CylinderGeometry(0.036, 0.036, 0.056, 14, 1, false, -Math.PI * 0.5, Math.PI);
  buttGeo.rotateX(Math.PI / 2);
  mesh(heelPivot, buttGeo, steelMat, 0.015, 0, 0);
  box(heelPivot, darkMat, 0.055, 0.038, 0.058, -0.02, 0, 0); // laser-etched precision collar

  // Build one sculpted flat tapered blade profile (from welded heel at x=0 down to razor-sharp curved tip at x=-0.94)
  function buildBlade(sign) {
    const pivot = group(heelPivot, 0, sign * 0.016, 0);
    // Tapered flat steel blade silhouette extruded thinly along Y (blade thickness)
    const shape = new T.Shape();
    shape.moveTo(0, -0.028);
    shape.lineTo(-0.34, -0.038);
    shape.lineTo(-0.72, -0.022);
    shape.lineTo(-0.94, -0.0045);
    shape.lineTo(-0.94, 0.0045);
    shape.lineTo(-0.72, 0.022);
    shape.lineTo(-0.34, 0.038);
    shape.lineTo(0, 0.028);
    shape.closePath();

    const bladeGeo = new T.ExtrudeGeometry(shape, {
      depth: 0.012, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.0025, bevelSegments: 2
    });
    bladeGeo.rotateX(Math.PI / 2);
    bladeGeo.translate(0, 0.006, 0);
    bladeGeo.computeVertexNormals();
    mesh(pivot, bladeGeo, steelMat);

    // Subtle inward bent precision tip section (last 0.18 units) so the two tips meet flush at (0,0,0)!
    const tip = box(pivot, steelMat, 0.16, 0.009, 0.012, -0.87, -sign * 0.009, 0);
    tip.rotation.z = sign * 0.095;

    // 8 machined transverse ergonomic grip serrations along the outer mid-shaft!
    for (let i = 0; i < 8; i++) {
      const gx = -0.26 - i * 0.038;
      box(pivot, darkMat, 0.014, 0.007, 0.068, gx, sign * 0.010, 0);
    }
    return pivot;
  }

  const upperArm = buildBlade(1);
  const lowerArm = buildBlade(-1);
  // Central alignment guide pin between the two blades
  cylinder(heelPivot, steelMat, 0.009, 0.009, 0.044, -0.42, 0, 0, 10);

  // Set opening angle: 0 = tips pinched tight together; 1 = sprung comfortably open!
  root.setPinch = function setPinch(openFrac = 0.25) {
    const ang = 0.015 + Math.max(0, Math.min(1, openFrac)) * 0.085;
    upperArm.rotation.z = -ang;
    lowerArm.rotation.z = ang;
  };
  root.setPinch(0.35);
  return root;
}

// Sculpted curved-shoulder borosilicate reagent bottle (LatheGeometry — optional amber glass or crinkled aluminum foil wrap!)
function makeReagentBottle(parent, x, z, liquidHex, labelText, { height = 1.04, radius = 0.29, amber = false, foil = false, tagYOffset = 0 } = {}) {
  const jar = group(parent, x, 0, z);
  const glass = amber
    ? glassMaterial('#9c5618', { opacity: 0.62, clearcoat: 1.0, roughness: 0.06, iridescence: 0.2 })
    : glassMaterial('#d0f2f8', { opacity: 0.30, clearcoat: 1.0, roughness: 0.05 });
  const liquid = gelMaterial(liquidHex, { opacity: 0.84, emissive: liquidHex, emissiveIntensity: 0.16, iridescence: 0.3 });

  const profile = [
    [0.01, 0.24], [radius * 0.96, 0.24], [radius * 1.02, 0.30], [radius, 0.24 + height * 0.68],
    [radius * 0.54, 0.24 + height * 0.88], [radius * 0.48, 0.24 + height], [radius * 0.56, 0.24 + height + 0.04]
  ];
  lathe(jar, glass, profile, 24);

  if (foil) {
    // Authentic crinkled aluminum foil wrap protecting light-sensitive stains (Schiff, Eosina, Hematoxilina — Course Photo 13!)
    const foilGeo = new T.CylinderGeometry(radius * 0.96, radius * 1.06, height * 0.78, 22, 8);
    organicDisplace(foilGeo, 0.075, 11, x * 13 + z * 7);
    mesh(jar, foilGeo, metalMaterial('#cfd9e0', { metalness: 0.94, roughness: 0.24 }), 0, 0.26 + height * 0.4, 0);
  } else {
    const liqH = height * 0.56;
    lathe(jar, liquid, [
      [0.01, 0.27], [radius * 0.88, 0.27], [radius * 0.90, 0.27 + liqH], [radius * 0.84, 0.27 + liqH + 0.02], [0.01, 0.27 + liqH + 0.02]
    ], 22);
    torus(jar, glow(liquidHex, 0.36), radius * 0.86, 0.014, 0, 0.28 + liqH, 0).rotation.x = Math.PI / 2;
  }

  // Ribbed black screw cap
  lathe(jar, anodizedMaterial('#1c2430'), [
    [0.01, 0.24 + height + 0.02], [radius * 0.58, 0.24 + height + 0.02],
    [radius * 0.58, 0.24 + height + 0.16], [radius * 0.5, 0.24 + height + 0.19], [0.01, 0.24 + height + 0.19]
  ], 20);

  // Clinical lab paper label band wrapped on front
  const bandGeo = new T.CylinderGeometry(radius * 1.05, radius * 1.05, 0.28, 16, 1, true, -0.75, 1.5);
  mesh(jar, bandGeo, enamelMaterial('#edf2f4', { roughness: 0.68 }), 0, 0.24 + height * 0.42, 0);

  const tag = labelSprite(labelText, { scale: 0.29, border: liquidHex, color: '#eef7fa' });
  tag.position.set(0, height + 0.66 + tagYOffset, 0.05);
  jar.add(tag);
  return { jar, liquid };
}

// Sculpted 3D Worker Bee model (head, compound eyes, antennae, striped thorax/abdomen, translucent wings & legs!)
function makeBee(parent) {
  const bee = group(parent);
  const darkChitin = proteinMaterial('#211916', { roughness: 0.26, clearcoat: 0.92, iridescence: 0.22 });
  const amberBand = proteinMaterial('#e6a82e', { emissive: '#754608', emissiveIntensity: 0.2, roughness: 0.32, clearcoat: 0.8 });
  const wingMat = gelMaterial('#e0f6ff', { opacity: 0.42, iridescence: 0.55, clearcoat: 1.0, roughness: 0.04 });

  // Head + compound eyes + curved antennae
  sphere(bee, darkChitin, 0.078, 0.072, 0.072, 0.21, 0.02, 0, 14);
  sphere(bee, proteinMaterial('#141016', { clearcoat: 1.0, roughness: 0.08 }), 0.036, 0.044, 0.032, 0.245, 0.03, 0.052, 10);
  sphere(bee, proteinMaterial('#141016', { clearcoat: 1.0, roughness: 0.08 }), 0.036, 0.044, 0.032, 0.245, 0.03, -0.052, 10);
  for (const s of [-1, 1]) {
    tube(bee, darkChitin, [v(0.26, 0.04, s * 0.02), v(0.32, 0.07, s * 0.06), v(0.36, 0.03, s * 0.1)], 0.008, false, 10, 5);
  }
  // Fuzzy golden-brown thorax
  const thoraxGeo = organicDisplace(new T.SphereGeometry(0.11, 16, 12), 0.06, 9, 2);
  mesh(bee, thoraxGeo, proteinMaterial('#9c6822', { roughness: 0.52, clearcoat: 0.35 }), 0.07, 0.028, 0).scale.set(1.12, 0.95, 0.92);

  // Striped ovoid abdomen with switchable intact dorsal tergites vs. realistic 3D open surgical cavity!
  const abd = group(bee, -0.15, 0.015, 0);
  const abdProfile = [
    new T.Vector2(0.005, -0.19), new T.Vector2(0.068, -0.14), new T.Vector2(0.115, -0.04),
    new T.Vector2(0.112, 0.07), new T.Vector2(0.068, 0.15), new T.Vector2(0.012, 0.17)
  ];
  // 1) Intact full closed abdomen (shown during capture & cryo-freezing)
  const intactAbd = group(abd);
  const fullGeo = new T.LatheGeometry(abdProfile, 20);
  fullGeo.rotateZ(Math.PI / 2);
  mesh(intactAbd, fullGeo, darkChitin);
  for (const bx of [-0.07, 0.0, 0.07]) {
    const r = bx === 0 ? 0.116 : 0.104;
    const band = torus(intactAbd, amberBand, r, 0.018, bx, 0, 0);
    band.rotation.y = Math.PI / 2;
  }

  // 2) Dissected open abdomen (lower curved shell + recessed dark-crimson hollow cavity + peeled dorsal tergite flaps!)
  const openAbd = group(abd);
  // Lower ventral half-shell (open on dorsal +Y face so you can peer straight into the hollow abdominal cavity!)
  const lowerGeo = new T.LatheGeometry(abdProfile, 20, Math.PI * 0.14, Math.PI * 1.18);
  lowerGeo.rotateZ(Math.PI / 2);
  lowerGeo.rotateX(Math.PI * 0.72);
  const lowerMat = proteinMaterial('#211916', { roughness: 0.28, clearcoat: 0.9, side: T.DoubleSide });
  mesh(openAbd, lowerGeo, lowerMat);
  // Ventral amber stripe half-rings wrapping only the underside
  for (const bx of [-0.07, 0.0, 0.07]) {
    const r = bx === 0 ? 0.116 : 0.104;
    const band = torus(openAbd, amberBand, r, 0.017, bx, 0, 0, Math.PI * 1.12);
    band.rotation.y = Math.PI / 2;
    band.rotation.x = Math.PI * 0.94;
  }
  // Deep recessed dark-crimson open surgical cavity lining inside the abdomen!
  const cavityMat = material('#2c0710', { roughness: 0.72, clearcoat: 0.3, side: T.DoubleSide });
  const cav = mesh(openAbd, new T.SphereGeometry(1, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), cavityMat, 0, 0.025, 0);
  cav.scale.set(0.155, 0.095, 0.092);
  // Crisp surgical rim + two peeled-back lateral tergite cuticle flaps flanking the open cavity!
  const rim = torus(openAbd, proteinMaterial('#c97a82', { roughness: 0.45 }), 0.105, 0.011, 0, 0.048, 0);
  rim.rotation.x = Math.PI / 2;
  rim.scale.set(1.32, 0.78, 1);
  for (const s of [-1, 1]) {
    const flap = box(openAbd, darkChitin, 0.18, 0.012, 0.052, 0, 0.068, s * 0.088);
    flap.rotation.x = s * 0.52;
    box(openAbd, amberBand, 0.032, 0.014, 0.054, -0.04, 0.070, s * 0.088).rotation.x = s * 0.52;
    box(openAbd, amberBand, 0.032, 0.014, 0.054, 0.04, 0.070, s * 0.088).rotation.x = s * 0.52;
  }
  // Detached dorsal tergite chip resting slightly behind on the red wax
  const chip = box(openAbd, darkChitin, 0.075, 0.012, 0.048, -0.18, -0.085, 0.12);
  chip.rotation.y = 0.48;
  // Glowing internal viscera core (visible ONLY during active dissection — disappears once organ is extracted!)
  const cavityViscera = sphere(openAbd, glow('#e8df58', 0.85), 0.11, 0.042, 0.058, 0, 0.022, 0, 12);
  openAbd.visible = false;

  bee.setDissectionState = function setDissectionState(mode = 'intact') {
    intactAbd.visible = mode === 'intact';
    openAbd.visible = mode !== 'intact';
    cavityViscera.visible = mode === 'active';
  };

  // Pair of translucent iridescent veined wings
  for (const s of [-1, 1]) {
    const wing = group(bee, 0.06, 0.095, s * 0.05);
    wing.rotation.set(s * 0.18, s * 0.42, 0.14);
    const wGeo = new T.SphereGeometry(1, 14, 10);
    const wm = mesh(wing, wGeo, wingMat, -0.14, 0, s * 0.12);
    wm.scale.set(0.22, 0.008, 0.078);
    // 3 jointed insect legs per side
    for (let l = 0; l < 3; l++) {
      const lx = 0.13 - l * 0.08;
      tube(bee, darkChitin, [v(lx, -0.02, s * 0.06), v(lx - 0.03, -0.08, s * 0.14), v(lx - 0.07, -0.11, s * 0.18)], 0.008, false, 8, 5);
    }
  }
  return bee;
}

export function buildHistologyBench(scene) {
  platform(scene);

  // Subtle dedicated overhead & warm accent studio lights for crisp shadows & glistening glass!
  const benchWarm = new T.PointLight('#ffe0b5', 1.4, 14, 1.8);
  benchWarm.position.set(3.2, 2.8, 1.4);
  const lupaSpot = new T.PointLight('#fff3d4', 1.6, 8, 1.7);
  lupaSpot.position.set(-7.1, 2.4, 1.1);
  scene.add(benchWarm, lupaSpot);

  const steel = metalMaterial('#b4c4cf', { roughness: 0.22, metalness: 0.9 });
  const chrome = metalMaterial('#e4edf2', { metalness: 0.95, roughness: 0.11 });
  const enamel = enamelMaterial('#e0e4e7', { roughness: 0.30, clearcoat: 0.52 });
  const zeissCream = enamelMaterial('#e4d5ad', { roughness: 0.34, clearcoat: 0.42 }); // iconic Zeiss Stemi cream-beige from Photo 1!
  const zeissBlue = anodizedMaterial('#2a58a8', { roughness: 0.32, metalness: 0.45 }); // iconic blue knob from Photo 1!
  const dark = anodizedMaterial('#1b232e', { roughness: 0.34, metalness: 0.56 });
  const black = anodizedMaterial('#10161e', { roughness: 0.28, metalness: 0.5 });
  const woodMat = material('#c99f68', { roughness: 0.72, metalness: 0.02 });
  const waxMat = new T.MeshPhysicalMaterial({
    color: '#f2e3bd', roughness: 0.38, clearcoat: 0.4, transparent: true, opacity: 0.92, envMapIntensity: 0.95
  });
  const resinBlockMat = gelMaterial('#e6f4f8', { opacity: 0.62, ior: 1.49, iridescence: 0.3, clearcoat: 1.0, roughness: 0.06 });
  const ribbonWax = gelMaterial('#f5ead2', { opacity: 0.74, iridescence: 0.28 });
  const glass = glassMaterial('#cdeef5', { opacity: 0.34, clearcoat: 1.0 });
  const frosted = frostedGlassMaterial('#d8e6eb');
  const tissueMat = organelleMaterial('#dc86a2', { roughness: 0.38, clearcoat: 0.56 });

  const interactives = new Map();

  // =========================================================================
  // STATION 0: ESTEREOMICROSCÓPIO ZEISS ("LUPA 01"), FAVO EM PETRI, GELO,
  //            CERA VERMELHA, ABELHA 3D & PINÇA ENTOMOLÓGICA (Fotos 1, 8, 9!)
  // =========================================================================
  const lupaStation = group(scene, -7.25, 0, 0.35);
  lupaStation.userData.pickKey = 'lupa';

  // Zeiss Stemi stereomicroscope base + black specimen plate + vertical column + blue focus dial + cream binocular head!
  roundedSlab(lupaStation, enamel, 2.2, 2.6, 0.22, 0.22, 0.04, 0, 0.11, 0.2);
  roundedSlab(lupaStation, black, 1.24, 1.24, 0.04, 0.08, 0.01, 0, 0.23, 0.55);
  // Vertical square column + blue Zeiss cap & coaxial focus dials
  roundedSlab(lupaStation, enamel, 0.58, 0.58, 2.55, 0.06, 0.025, 0, 1.48, -0.78);
  roundedSlab(lupaStation, zeissBlue, 0.62, 0.62, 0.24, 0.06, 0.025, 0, 2.82, -0.78);
  for (const sx of [-0.46, 0.46]) {
    const fKnob = cylinder(lupaStation, zeissBlue, 0.25, 0.25, 0.22, sx, 1.68, -0.74, 20);
    fKnob.rotation.z = Math.PI / 2;
  }
  // Cream-beige Zeiss Stemi zoom pod & binocular head + dual tilted eyepieces + top CCD camera (Photo 1!)
  roundedSlab(lupaStation, enamel, 0.96, 1.05, 0.42, 0.16, 0.04, 0, 1.56, 0.12);
  cylinder(lupaStation, dark, 0.32, 0.26, 0.38, 0, 1.24, 0.42, 20);
  roundedSlab(lupaStation, zeissCream, 1.18, 1.12, 0.72, 0.22, 0.08, 0, 2.04, 0.32);
  box(lupaStation, zeissBlue, 0.24, 0.18, 0.04, 0, 1.98, 0.89); // Zeiss blue badge!
  for (const sx of [-0.34, 0.34]) {
    const ep = group(lupaStation, sx, 2.38, 0.52);
    ep.rotation.x = 0.68;
    cylinder(ep, dark, 0.17, 0.19, 0.58, 0, 0.28, 0, 18);
    cylinder(ep, black, 0.21, 0.17, 0.15, 0, 0.62, 0, 20);
    cylinder(ep, glassMaterial('#58b4d4', { opacity: 0.88, iridescence: 0.55 }), 0.15, 0.14, 0.02, 0, 0.69, 0, 16);
  }
  // Top C-mount CCD microscopy camera box (Photo 1!)
  cylinder(lupaStation, chrome, 0.18, 0.18, 0.28, 0, 2.52, 0.22, 18);
  roundedSlab(lupaStation, metalMaterial('#b8b0a2', { roughness: 0.34, metalness: 0.72 }), 0.58, 0.52, 0.68, 0.06, 0.025, 0, 2.98, 0.22);

  // =========================================================================
  // LIVE LAB MONITOR BESIDE STEREOMICROSCOPE (SAMSUNG + COAXIAL CABLE TO CCD!)
  // Displays real-time magnified stereomicroscope feed of bee & dissection!
  // =========================================================================
  const lupaMonitorPanel = makeLupaMonitorPanel();
  const lupaMonitor = group(lupaStation, 1.46, 0, -1.26);
  lupaMonitor.rotation.y = -0.36;
  lupaMonitor.userData.pickKey = 'lupaMonitor';
  const bezelMat = anodizedMaterial('#141921', { roughness: 0.26, metalness: 0.36 });
  // Weighted oval pedestal base + neck pillar + angled matte-black monitor chassis
  cylinder(lupaMonitor, bezelMat, 0.52, 0.56, 0.075, 0, 0.038, 0.04, 24).scale.set(1.18, 1, 0.78);
  roundedSlab(lupaMonitor, bezelMat, 0.24, 0.18, 0.88, 0.04, 0.015, 0, 0.48, -0.08);
  const monHead = group(lupaMonitor, 0, 1.56, 0.04);
  monHead.rotation.x = -0.05;
  roundedSlab(monHead, bezelMat, 2.08, 0.15, 1.42, 0.07, 0.024, 0, 0, -0.04);
  // Subtle recessed metallic back housing + vents
  roundedSlab(monHead, dark, 1.48, 0.12, 0.92, 0.06, 0.02, 0, 0.02, -0.11);
  // Active high-contrast self-luminous LCD screen mounted cleanly in front of the bezel face (z = +0.068)!
  const monScreenMat = new T.MeshStandardMaterial({
    map: lupaMonitorPanel.texture,
    emissiveMap: lupaMonitorPanel.texture,
    emissive: new T.Color('#ffffff'),
    emissiveIntensity: 0.96,
    roughness: 0.16,
    metalness: 0.02
  });
  mesh(monHead, new T.PlaneGeometry(1.90, 1.24), monScreenMat, 0, 0.02, 0.068);
  // Crisp thin inner recess trim frame around the active LCD screen
  const frameTrim = anodizedMaterial('#090d12', { roughness: 0.45 });
  box(monHead, frameTrim, 1.96, 0.032, 0.02, 0, 0.655, 0.062);
  box(monHead, frameTrim, 1.96, 0.032, 0.02, 0, -0.615, 0.062);
  box(monHead, frameTrim, 0.032, 1.30, 0.02, -0.965, 0.02, 0.062);
  box(monHead, frameTrim, 0.032, 1.30, 0.02, 0.965, 0.02, 0.062);
  // Green LED power indicator dot on bottom-right bezel
  sphere(monHead, glow('#48ff9c', 1.3), 0.024, 0.024, 0.016, 0.84, -0.66, 0.066, 8);
  const monTag = labelSprite('Monitor · Imagem da Lupa', { scale: 0.23, border: '#58e4f5', color: '#e6fbff' });
  monTag.position.set(-0.22, 0.88, 0.06);
  monHead.add(monTag);

  // Authentic curved black coaxial video cable routed cleanly BEHIND the monitor into rear input jack!
  tube(lupaStation, black, [
    v(0.06, 3.32, 0.18), v(0.26, 3.58, -0.35), v(0.68, 2.75, -1.28),
    v(1.18, 1.85, -1.68), v(1.52, 1.48, -1.52)
  ], 0.028, false, 28, 7);

  // External fiber-optic light box & rheostat on left of Lupa (Photo 1!)
  const lightBox = group(lupaStation, -1.78, 0, 0.92);
  roundedSlab(lightBox, zeissCream, 0.94, 1.16, 0.46, 0.08, 0.03, 0, 0.23, 0);
  cylinder(lightBox, dark, 0.13, 0.13, 0.1, 0.18, 0.5, 0.18, 16);
  cylinder(lightBox, black, 0.2, 0.2, 0.36, -0.08, 0.66, -0.1, 16).rotation.z = Math.PI / 2;
  tube(lightBox, black, [v(0.1, 0.66, -0.1), v(0.65, 1.15, -0.05), v(1.22, 1.02, -0.25)], 0.032, false, 18, 7);

  // Glass Petri Dish with Brown Hexagonal Bee Brood Comb (Photo 8!)
  const petri = group(lupaStation, -1.45, 0.02, 2.32);
  lathe(petri, glass, [[0.01, 0], [0.76, 0], [0.78, 0.02], [0.78, 0.18], [0.75, 0.18], [0.75, 0.03], [0.01, 0.03]], 30);
  const combMat = organelleMaterial('#784e30', { roughness: 0.62, clearcoat: 0.2 });
  for (let i = 0; i < 18; i++) {
    const a = -0.4 + (i / 17) * 4.5;
    const rad = 0.42 + (i % 2) * 0.08;
    cylinder(petri, combMat, 0.062, 0.058, 0.095, Math.cos(a) * rad, 0.08, Math.sin(a) * rad, 6);
  }
  const petriTag = labelSprite('Favo · Captura', { scale: 0.26, border: '#e0a958', color: '#fff0d4' });
  petriTag.position.set(0, 0.48, 0);
  petri.add(petriTag);

  // Translucent Red-Wax Dissection Dish sitting cleanly on Lupa stage (Photo 9!)
  const waxDish = group(lupaStation, 0, 0.26, 0.55);
  lathe(waxDish, glass, [[0.01, 0], [0.54, 0], [0.56, 0.02], [0.56, 0.16], [0.53, 0.16], [0.53, 0.03], [0.01, 0.03]], 28);
  cylinder(waxDish, gelMaterial('#b8243a', { opacity: 0.92, clearcoat: 0.95, roughness: 0.18 }), 0.52, 0.52, 0.085, 0, 0.065, 0, 26);
  // Glistening 0.9% saline droplet right in center of red wax
  const salineDrop = sphere(waxDish, gelMaterial('#94efff', { opacity: 0.46, iridescence: 0.42 }), 0.22, 0.036, 0.22, 0, 0.115, 0, 20);

  // Cryo-freezing mist / frost crystals envelope (visible during Step 2 Congelamento!)
  const iceChamber = group(lupaStation, -0.78, 0.04, 1.85);
  const iceMat = gelMaterial('#8ee8ff', { opacity: 0.34, emissive: '#38a8db', emissiveIntensity: 0.42, iridescence: 0.5 });
  roundedSlab(iceChamber, iceMat, 0.95, 0.85, 0.42, 0.12, 0.04, 0, 0.21, 0);
  const iceCrystals = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cr = mesh(iceChamber, new T.OctahedronGeometry(0.065, 0), glow('#c2f6ff', 0.9, { transparent: true, opacity: 0.72 }),
      Math.cos(a) * 0.28, 0.32 + (i % 2) * 0.12, Math.sin(a) * 0.28);
    iceCrystals.push(cr);
  }
  iceChamber.visible = false;

  // Sculpted 3D Worker Bee + Dissected Midgut/Ventriculus Organ (Photo 3!) + Animated Steel Entomological Forceps (Photo 9!)
  const bee = makeBee(lupaStation);
  bee.position.set(-1.35, 0.18, 2.32);

  const beeOrgan = group(lupaStation, 0, 0.4, 0.55);
  const orgMat = proteinMaterial('#d8cf4a', { emissive: '#8f8414', emissiveIntensity: 0.42, clearcoat: 0.88 });
  tube(beeOrgan, orgMat, [v(-0.14, 0, 0.04), v(-0.04, 0.03, -0.02), v(0.06, 0.01, 0.04), v(0.14, 0.02, -0.01)], 0.028, false, 18, 8);
  for (let m = 0; m < 4; m++) {
    const a = m * 1.5;
    tube(beeOrgan, glow('#f0ea6e', 0.55), [v(0.02, 0.01, 0), v(0.02 + Math.cos(a) * 0.09, 0.02, Math.sin(a) * 0.1)], 0.008, false, 8, 5);
  }
  beeOrgan.visible = false;

  // Realistic Sculpted Dumont #5 Stainless-Steel Entomological Tweezers for Lupa 01 Dissection!
  const forceps = makeTweezers(lupaStation, chrome, dark);
  forceps.position.set(0.06, 0.48, 0.55);
  forceps.rotation.set(0.22, -0.45, 0.58);
  forceps.scale.setScalar(0.95);
  forceps.visible = false;

  interactives.set('lupa', {
    object: lupaStation, view: 'lupa', title: 'Estereomicroscópio (Lupa 01) e Dissecção',
    subtitle: 'Captura da abelha, crioeutanásia em gelo e dissecção sobre cera vermelha com pinça', color: '#e4d5ad'
  });
  interactives.set('lupaMonitor', {
    object: lupaMonitor, view: 'lupaMonitor', title: 'Monitor de vídeo · Câmera CCD (Lupa 01)',
    subtitle: 'Imagem ampliada ao vivo do estereomicroscópio (favo, gelo e dissecção sobre cera vermelha)', color: '#58e4f5'
  });

  // =========================================================================
  // STATION 1: BANHOS DE PROCESSAMENTO, ÁLCOOIS GRADUADOS & HISTORESINA LEICA
  //            (Molde 9 poços Foto 10 + Frasco Hardener Foto 7 + Cubo de Madeira Foto 6!)
  // =========================================================================
  const rack = group(scene, -3.55, 0, 0.52);
  rack.userData.pickKey = 'baths';
  roundedSlab(rack, dark, 4.18, 1.56, 0.22, 0.14, 0.03, 0, 0.11, 0);
  roundedSlab(rack, steel, 4.12, 1.50, 0.03, 0.12, 0.008, 0, 0.225, 0);

  const bathSpecs = [
    ['Fixador 4–10%', '#6fd6c4', true],
    ['Álcool 70–80%', '#62b2eb', false],
    ['Álcool 95–100%', '#4298f5', false],
    ['Xilol / Res. 1:1', '#b492e0', false],
    ['Historesin', '#e6b85c', true]
  ];
  const bottles = bathSpecs.map(([name, dye, isAmber], index) => {
    const x = (index - 2) * 0.78;
    const { liquid } = makeReagentBottle(rack, x, 0, dye, name, { height: 1.02, radius: 0.27, amber: isAmber });
    return { x: x - 3.55, liquid };
  });

  // White 9-Well Polyethylene Historesin Embedding Mold Tray (EXACT match to Photo 10!)
  const resinMold = group(rack, -0.62, 0.04, 1.62);
  roundedSlab(resinMold, enamelMaterial('#eceff2', { roughness: 0.35, clearcoat: 0.4 }), 1.48, 1.48, 0.18, 0.08, 0.025, 0, 0.09, 0);
  const moldWells = [];
  for (let gx = -1; gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      torus(resinMold, enamelMaterial('#cfd8de', { roughness: 0.4 }), 0.175, 0.026, gx * 0.44, 0.185, gz * 0.44).rotation.x = Math.PI / 2;
      const fill = cylinder(resinMold, resinBlockMat.clone(), 0.145, 0.115, 0.09, gx * 0.44, 0.145, gz * 0.44, 16);
      fill.visible = false;
      moldWells.push(fill);
    }
  }
  const moldTag = labelSprite('Molde Historesina (9 poços)', { scale: 0.25, border: '#e6b85c', color: '#fff3d4' });
  moldTag.position.set(0, 0.54, 0);
  resinMold.add(moldTag);

  // Wooden Mounting Block with White/Red ID Paper Band & Translucent Historesin Pyramid (EXACT match to Photo 6!)
  const woodBlockPreview = group(rack, 1.15, 0.02, 1.62);
  roundedSlab(woodBlockPreview, woodMat, 0.52, 0.52, 0.56, 0.03, 0.015, 0, 0.28, 0);
  box(woodBlockPreview, enamelMaterial('#f4f4f0', { roughness: 0.72 }), 0.54, 0.26, 0.54, 0, 0.26, 0);
  box(woodBlockPreview, material('#d9383a', { roughness: 0.55 }), 0.546, 0.032, 0.546, 0, 0.38, 0);
  box(woodBlockPreview, material('#d9383a', { roughness: 0.55 }), 0.546, 0.032, 0.546, 0, 0.14, 0);
  // Translucent trapezoidal Historesin block glued on top with tiny bee organ inside!
  cylinder(woodBlockPreview, resinBlockMat, 0.14, 0.21, 0.24, 0, 0.68, 0, 4).rotation.y = Math.PI / 4;
  sphere(woodBlockPreview, orgMat, 0.055, 0.035, 0.045, 0, 0.67, 0, 10);
  const woodTag = labelSprite('Bloco madeira + Resina', { scale: 0.24, border: '#d98c5a', color: '#ffe8d4' });
  woodTag.position.set(0, 1.05, 0);
  woodBlockPreview.add(woodTag);

  // Biopsy specimen floating/dipping into baths
  const specimen = sphere(scene, tissueMat, 0.26, 0.14, 0.2, -3.9, 0.22, 2.0, 18);

  interactives.set('baths', {
    object: rack, view: 'baths', title: 'Banhos químicos, Álcoois e Historesina',
    subtitle: 'Fixação, desidratação gradual (70%→100%), pré-infiltração, molde de 9 poços e polimerização', color: '#6fd6c4'
  });

  // =========================================================================
  // STATION 2: MICRÓTOMO ROTATIVO LEICA RM2255 (FIEL AO VÍDEO DO CURSO!)
  //            Chassi creme, LED verde 03.0 / contador, E-STOP, volante sólido,
  //            mandíbulas serrilhadas, base de alumínio, navalha de vidro
  //            triangular esverdeada + copinho preto com água e cortes!
  // =========================================================================
  const micro = group(scene, -0.05, 0.02, -0.68);
  micro.userData.pickKey = 'micro';

  const leicaCream = enamelMaterial('#ddd8c9', { roughness: 0.30, clearcoat: 0.48 });
  const leicaTrim = enamelMaterial('#cbc6b6', { roughness: 0.36, clearcoat: 0.36 });
  const machinedAlu = metalMaterial('#c7d0d6', { metalness: 0.88, roughness: 0.24 });
  const knurledBlack = anodizedMaterial('#14181e', { roughness: 0.54, metalness: 0.32 });
  const eStopRed = enamelMaterial('#cc2832', { roughness: 0.25, clearcoat: 0.72 });

  // Lower dark-charcoal base plinth + iconic wrap-around cream U-shaped front waste tray!
  roundedSlab(micro, dark, 2.75, 3.05, 0.24, 0.16, 0.035, 0.04, 0.12, 0.16);
  // Front & side cream wrap-around waste tray rim (matches course video frames!)
  roundedSlab(micro, leicaCream, 2.42, 1.56, 0.34, 0.22, 0.04, -0.04, 0.32, 1.18);
  roundedSlab(micro, dark, 1.98, 1.18, 0.12, 0.12, 0.02, -0.04, 0.45, 1.06); // recessed black knife track bed!

  // Sculpted sloped Leica RM2255 main housing (aerodynamic cream-beige profile extruded cleanly!)
  const bodyShape = new T.Shape();
  bodyShape.moveTo(-1.38, 0);
  bodyShape.lineTo(0.84, 0);
  bodyShape.lineTo(0.84, 1.72);
  bodyShape.bezierCurveTo(0.84, 2.28, 0.48, 2.58, -0.04, 2.60);
  bodyShape.lineTo(-1.05, 2.54);
  bodyShape.bezierCurveTo(-1.36, 2.50, -1.42, 2.18, -1.42, 1.75);
  bodyShape.lineTo(-1.38, 0);
  const microBodyGeo = new T.ExtrudeGeometry(bodyShape, {
    depth: 2.04, bevelEnabled: true, bevelThickness: 0.11, bevelSize: 0.09, bevelSegments: 5, curveSegments: 18
  });
  microBodyGeo.rotateY(-Math.PI / 2);
  microBodyGeo.translate(1.02, 0.26, -0.18);
  microBodyGeo.computeVertexNormals();
  mesh(micro, microBodyGeo, leicaCream);

  // Subtle top instrument tray lid on the RM2255 crown
  roundedSlab(micro, leicaTrim, 1.88, 1.48, 0.08, 0.14, 0.02, 0, 2.92, -0.45);
  // Recessed dark vertical specimen slot + top "LABORATÓRIO" dark badge + upper-left Red E-STOP button!
  roundedSlab(micro, black, 0.62, 0.26, 1.95, 0.06, 0.02, -0.18, 1.62, 0.68);
  box(micro, anodizedMaterial('#2a3038', { roughness: 0.4 }), 0.72, 0.12, 0.04, -0.18, 2.66, 0.77);
  const eStopBase = cylinder(micro, black, 0.14, 0.16, 0.09, -0.96, 2.48, 0.74, 18);
  eStopBase.rotation.x = Math.PI / 2;
  const eStopBtn = cylinder(micro, eStopRed, 0.12, 0.11, 0.18, -0.96, 2.48, 0.84, 18);
  eStopBtn.rotation.x = Math.PI / 2;

  // LIVE Glowing Emerald-Green 7-Segment LED Panel (03.0 um + 0098 cut counter) flush on front-right cheek!
  const ledPanel = makeMicrotomeLEDPanel();
  const ledMat = new T.MeshStandardMaterial({
    map: ledPanel.texture, emissiveMap: ledPanel.texture,
    emissive: new T.Color('#88ffbb'), emissiveIntensity: 0.58, roughness: 0.32, metalness: 0.08
  });
  const ledMesh = mesh(micro, new T.PlaneGeometry(0.68, 1.02), ledMat, 0.62, 1.92, 0.78);
  ledMesh.rotation.x = -0.04;

  // Side "LEICA RM2255" nameplate graphic on right cheek
  const leicaBadge = mesh(micro, new T.PlaneGeometry(1.12, 0.28),
    new T.MeshStandardMaterial({ map: makeLeicaBadgeTexture(), roughness: 0.36 }), 1.145, 2.38, -0.58);
  leicaBadge.rotation.y = Math.PI / 2;

  // =========================================================================
  // BRUSHED-ALUMINUM UNIVERSAL SPECIMEN CLAMP (SERRATED JAWS + KNURLED KNOB!)
  // =========================================================================
  const feeder = group(micro, -0.18, 2.18, 0.88);
  // Vertical aluminum dovetail carriage block
  roundedSlab(feeder, machinedAlu, 0.76, 0.52, 0.84, 0.05, 0.02, 0, -0.02, -0.08);
  // Top orientation lock red/black thumb lever + side black orientation knob (exact match to frames 1 & 2!)
  cylinder(feeder, knurledBlack, 0.11, 0.11, 0.26, 0.06, 0.54, -0.04, 16);
  box(feeder, eStopRed, 0.12, 0.22, 0.12, -0.05, 0.52, -0.14);
  cylinder(feeder, knurledBlack, 0.095, 0.095, 0.26, 0.48, 0.14, 0.02, 16).rotation.z = Math.PI / 2;

  // Serrated alligator-jaw brushed-aluminum chuck holding the block from top & bottom!
  const jawGroup = group(feeder, 0, 0.02, 0.34);
  roundedSlab(jawGroup, machinedAlu, 0.68, 0.48, 0.11, 0.03, 0.014, 0, 0.34, 0.04);  // upper jaw
  roundedSlab(jawGroup, machinedAlu, 0.68, 0.48, 0.11, 0.03, 0.014, 0, -0.34, 0.04); // lower jaw
  roundedSlab(jawGroup, machinedAlu, 0.68, 0.18, 0.72, 0.03, 0.014, 0, 0, -0.16);    // back spine
  // Serrated gripping teeth along upper & lower jaw edges (frame 3 close-up!)
  for (let t = -3; t <= 3; t++) {
    box(jawGroup, chrome, 0.045, 0.032, 0.34, t * 0.085, 0.28, 0.08);
    box(jawGroup, chrome, 0.045, 0.032, 0.34, t * 0.085, -0.28, 0.08);
  }
  // Iconic knurled cylindrical aluminum top clamping screw knob (frame 1!)
  cylinder(jawGroup, chrome, 0.075, 0.075, 0.18, 0, 0.46, 0.06, 14);
  cylinder(jawGroup, machinedAlu, 0.19, 0.19, 0.16, 0, 0.58, 0.06, 8); // fluted clamping wheel!

  // 1) Paraffin cassette + wax block (classical protocols)
  const paraffin = group(jawGroup, 0, 0, 0.12);
  roundedSlab(paraffin, enamel, 0.60, 0.12, 0.48, 0.03, 0.012, 0, 0, -0.14);
  roundedSlab(paraffin, waxMat, 0.56, 0.38, 0.44, 0.03, 0.015, 0, 0, 0.08);
  box(paraffin, tissueMat, 0.34, 0.22, 0.028, 0, 0, 0.275);

  // 2) Wooden support cube + transparent Historesin pyramid block gripped tightly in jaws (frame 1 & 3!)
  const resinHolder = group(jawGroup, 0, 0, 0.14);
  roundedSlab(resinHolder, woodMat, 0.48, 0.44, 0.48, 0.025, 0.012, 0, 0, -0.04);
  box(resinHolder, enamelMaterial('#f4f4f0', { roughness: 0.72 }), 0.495, 0.20, 0.455, 0, 0, -0.04);
  box(resinHolder, material('#d9383a', { roughness: 0.5 }), 0.502, 0.025, 0.462, 0, 0.09, -0.04);
  const resinPrism = cylinder(resinHolder, resinBlockMat, 0.12, 0.20, 0.28, 0, 0, 0.28, 4);
  resinPrism.rotation.x = Math.PI / 2;
  resinPrism.rotation.y = Math.PI / 4;
  sphere(resinHolder, orgMat, 0.058, 0.042, 0.042, 0, 0, 0.33, 12);
  resinHolder.visible = false;

  // =========================================================================
  // HEAVY TIERED MACHINED-ALUMINUM KNIFE BASE + GREEN TRIANGULAR GLASS KNIFE!
  // (Exact visual match to frames 1, 3, 5, 8 of the course video!)
  // =========================================================================
  const bladeStage = group(micro, -0.18, 0.58, 1.32);
  // Tier 1: Heavy machined-aluminum sliding base plate + big front black knurled locking dial
  roundedSlab(bladeStage, machinedAlu, 1.56, 0.96, 0.26, 0.06, 0.02, 0, 0.04, 0.06);
  const frontDial = cylinder(bladeStage, knurledBlack, 0.17, 0.17, 0.16, 0.0, 0.08, 0.56, 22);
  frontDial.rotation.x = Math.PI / 2;
  cylinder(bladeStage, chrome, 0.045, 0.045, 0.18, 0.0, 0.08, 0.57, 12).rotation.x = Math.PI / 2;
  // Twin left-side black horizontal adjustment rods (visible on left of frame 1!)
  for (const rz of [-0.14, 0.16]) {
    cylinder(bladeStage, knurledBlack, 0.055, 0.055, 0.44, -0.92, 0.22, rz, 14).rotation.z = Math.PI / 2;
  }
  // Tier 2: Stepped silver carriage block + cylindrical goniometer arc turret!
  roundedSlab(bladeStage, machinedAlu, 1.12, 0.72, 0.24, 0.05, 0.018, 0, 0.28, -0.02);
  cylinder(bladeStage, machinedAlu, 0.34, 0.38, 0.28, 0, 0.52, -0.04, 24);
  // Upper machined knife clamp head with twin black side micrometer pins (frame 3!)
  roundedSlab(bladeStage, chrome, 0.64, 0.48, 0.22, 0.04, 0.015, 0, 0.72, -0.04);
  cylinder(bladeStage, knurledBlack, 0.068, 0.068, 0.28, 0.44, 0.73, -0.02, 16).rotation.z = Math.PI / 2;
  cylinder(bladeStage, knurledBlack, 0.058, 0.058, 0.24, -0.42, 0.73, -0.04, 16).rotation.z = Math.PI / 2;

  // 1) Stainless Steel Disposable Blade + red finger guard (classical paraffin protocols)
  const steelBlade = group(bladeStage, 0, 0.88, -0.06);
  const sbMesh = box(steelBlade, chrome, 1.48, 0.052, 0.38, 0, 0, 0);
  sbMesh.rotation.x = -0.34;
  box(steelBlade, eStopRed, 0.26, 0.06, 0.05, 0.64, 0.10, 0.12);

  // 2) AUTHENTIC GREENISH SODA-LIME TRIANGULAR GLASS KNIFE (Navalha de vidro triangular — frames 3 & 8!)
  const glassKnife = group(bladeStage, 0, 0.84, -0.06);
  const triShape = new T.Shape();
  triShape.moveTo(-0.26, 0.0);
  triShape.lineTo(0.26, 0.0);
  triShape.lineTo(0.0, 0.44);
  triShape.closePath();
  const gkGeo = new T.ExtrudeGeometry(triShape, {
    depth: 0.24, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2
  });
  gkGeo.rotateY(Math.PI / 2);
  gkGeo.translate(-0.12, -0.02, 0.06);
  gkGeo.rotateX(-0.36);
  // Real green-tinted float-glass optical prism material!
  const gkMat = glassMaterial('#8fe8cf', { opacity: 0.66, ior: 1.52, iridescence: 0.52, clearcoat: 1.0, roughness: 0.02 });
  mesh(glassKnife, gkGeo, gkMat);
  // Razor-bright optical cutting edge gleam along the upper glass apex
  box(glassKnife, glow('#dcfff6', 1.35), 0.26, 0.012, 0.012, 0, 0.40, -0.10);
  glassKnife.visible = false;

  // =========================================================================
  // SOLID CREAM-BEIGE LEICA RM2255 DISC FLYWHEEL + BLACK ERGONOMIC HANDLE!
  // (Exact match to frame 2 — still 100% draggable in 3D!)
  // =========================================================================
  const crank = group(micro, 1.18, 1.42, -0.12);
  crank.userData.pickKey = 'crank';
  const disc = cylinder(crank, leicaCream, 0.72, 0.72, 0.24, 0, 0, 0, 32);
  disc.rotation.z = Math.PI / 2;
  const rimBevel = torus(crank, leicaTrim, 0.68, 0.055, 0.10, 0, 0);
  rimBevel.rotation.y = Math.PI / 2;
  const centerCap = cylinder(crank, knurledBlack, 0.085, 0.085, 0.28, 0.02, 0, 0, 16);
  centerCap.rotation.z = Math.PI / 2;
  // Matte-black ergonomic RM2255 crank handle sticking cleanly outwards on the flywheel rim!
  const handle = lathe(crank, knurledBlack, [
    [0.01, 0], [0.085, 0.02], [0.115, 0.16], [0.13, 0.44], [0.11, 0.58], [0.05, 0.63], [0.01, 0.64]
  ], 20, 0.12, -0.34, 0.34);
  handle.rotation.z = -Math.PI / 2;

  // =========================================================================
  // AUTHENTIC COURSE BENCH PROPS IN FRONT OF LEICA RM2255 (frames 2, 4, 6, 8!)
  //   1) Black Cylindrical Contrast Water Cup with floating translucent cuts!
  //   2) Folded White Tissue with Spare Triangular Glass Knife & Pickup Needle!
  // =========================================================================
  const blackCup = group(micro, 0.88, 0.0, 2.38);
  const cupBodyMat = anodizedMaterial('#14171c', { roughness: 0.42, metalness: 0.22 });
  lathe(blackCup, cupBodyMat, [
    [0.01, 0], [0.46, 0], [0.48, 0.04], [0.50, 0.62], [0.47, 0.62], [0.45, 0.05], [0.01, 0.05]
  ], 28);
  // Dark high-contrast glossy water meniscus right at the top rim!
  cylinder(blackCup, glassMaterial('#1a2832', { opacity: 0.92, clearcoat: 1.0, roughness: 0.03 }), 0.465, 0.465, 0.03, 0, 0.585, 0, 26);
  // 3 ultra-thin translucent Historesin sections floating clearly on the black water meniscus (frame 4 & 8!)
  const cupSlices = [];
  for (const [cx, cz] of [[-0.14, 0.06], [0.10, -0.10], [0.04, 0.16]]) {
    const cs = mesh(blackCup, new T.CylinderGeometry(0.068, 0.068, 0.008, 12),
      gelMaterial('#d8eef5', { opacity: 0.68, emissive: '#94c4d4', emissiveIntensity: 0.22 }), cx, 0.606, cz);
    cs.scale.set(1.25, 1, 0.82);
    cupSlices.push(cs);
  }
  const cupRippleMat = glow('#8ee8ff', 0.85, { transparent: true, opacity: 0, depthWrite: false });
  const cupRipple = torus(blackCup, cupRippleMat, 0.14, 0.009, 0, 0.608, 0);
  cupRipple.rotation.x = Math.PI / 2;
  const cupTag = labelSprite('Copo preto · Cortes na água', { scale: 0.21, border: '#8ee8ff', color: '#e8f9ff' });
  cupTag.position.set(0.08, 0.26, 0.58);
  blackCup.add(cupTag);

  // Realistic Dumont #5 Precision Tweezers at Leica RM2255 + Translucent Cut Film + Fishing Glass Slide!
  const microForceps = makeTweezers(micro, chrome, dark);
  microForceps.position.set(-0.18, 1.84, 1.18);
  microForceps.rotation.set(0.18, -0.58, 0.52);
  microForceps.scale.setScalar(1.08);
  microForceps.visible = false;

  const transferFilm = group(micro, -0.18, 1.82, 1.18);
  const filmMat = gelMaterial('#e6f8ff', { opacity: 0.78, emissive: '#9ee4f8', emissiveIntensity: 0.32, iridescence: 0.45 });
  mesh(transferFilm, new T.BoxGeometry(0.16, 0.008, 0.12), filmMat);
  box(transferFilm, material('#e4d45e', { transparent: true, opacity: 0.65 }), 0.06, 0.011, 0.045);
  transferFilm.visible = false;

  // Clean Glass Slide that dips into the black contrast water cup to fish the stretched Historesin film!
  const cupPickSlide = group(micro, 0.92, 0.86, 2.38);
  roundedSlab(cupPickSlide, glass, 1.18, 0.52, 0.036, 0.02, 0.006, 0, 0, 0);
  box(cupPickSlide, frosted, 0.26, 0.04, 0.48, 0.44, 0.002, 0);
  const cupSlideSections = group(cupPickSlide, -0.14, 0.024, 0);
  for (const [sx, sz] of [[-0.20, 0.04], [0.02, -0.06], [0.22, 0.05]]) {
    mesh(cupSlideSections, new T.CylinderGeometry(0.065, 0.065, 0.009, 12), filmMat, sx, 0, sz).scale.set(1.2, 1, 0.85);
  }
  cupSlideSections.visible = false;
  cupPickSlide.visible = false;

  // Folded white bench tissue holding a spare green triangular glass knife & insulin syringe needle!
  const microTissue = group(micro, -0.45, 0.01, 2.48);
  roundedSlab(microTissue, enamelMaterial('#eceee8', { roughness: 0.92, clearcoat: 0.03 }), 1.25, 0.72, 0.018, 0.04, 0.005, 0, 0.009, 0);
  // Spare green triangular glass knife lying flat on the white tissue (frame 2 & 8!)
  const spareKnife = mesh(microTissue, gkGeo.clone(), gkMat, -0.24, 0.06, -0.02);
  spareKnife.rotation.set(Math.PI / 2, 0.35, 0.5);
  spareKnife.scale.setScalar(0.75);
  // Fine insulin syringe / pickup needle lying beside the spare glass knife (frame 6 & 8!)
  const syr = group(microTissue, 0.22, 0.045, 0.12);
  syr.rotation.y = 0.24;
  cylinder(syr, glass, 0.036, 0.036, 0.54, 0, 0, 0, 14).rotation.z = Math.PI / 2;
  cylinder(syr, enamelMaterial('#d99e3e', { roughness: 0.35 }), 0.028, 0.018, 0.11, -0.32, 0, 0, 12).rotation.z = Math.PI / 2;
  cylinder(syr, chrome, 0.005, 0.005, 0.24, -0.48, 0, 0, 8).rotation.z = Math.PI / 2;

  interactives.set('micro', {
    object: micro, view: 'micro', title: 'Micrótomo rotativo Leica RM2255',
    subtitle: 'Painel LED verde, mandíbulas serrilhadas, navalha de vidro triangular e copo preto com água', color: '#ddd8c9'
  });
  interactives.set('crank', {
    object: crank, view: 'micro', title: 'Volante do Leica RM2255',
    subtitle: 'Clique e arraste o volante para fatiar o bloco!', color: '#52e0f0'
  });

  // Translucent articulated section ribbon peeling off the blade
  const ribbon = group(scene);
  const ribbonSlices = [];
  for (let i = 0; i < 6; i++) {
    const slice = group(ribbon, 0, Math.sin(i * 1.05) * 0.032, i * 0.22);
    box(slice, ribbonWax, 0.54, 0.014, 0.21);
    box(slice, material('#e8a3b8', { transparent: true, opacity: 0.6 }), 0.32, 0.017, 0.14);
    slice.rotation.x = Math.cos(i * 1.18) * 0.15;
    ribbonSlices.push(slice);
  }

  // =========================================================================
  // STATION 3: BANHO-MARIA ILUMINADO COM VAPOR, PLACA AQUECEDORA DIGITAL &
  //            PAPEL TOALHA ABSORVENTE (Fotos 4 e 14!)
  // =========================================================================
  const hotplate = group(scene, 3.15, 0, -1.68);
  hotplate.userData.pickKey = 'water';
  roundedSlab(hotplate, enamel, 1.88, 1.56, 0.30, 0.16, 0.04, 0, 0.15, 0);
  roundedSlab(hotplate, anodizedMaterial('#131820', { roughness: 0.2, clearcoat: 0.8 }), 1.48, 1.22, 0.05, 0.1, 0.012, 0, 0.32, -0.04);
  const heatGlowMat = glow('#ff894c', 0.95, { transparent: true, opacity: 0.45, depthWrite: false });
  const heatGlow = torus(hotplate, heatGlowMat, 0.56, 0.022, 0, 0.355, -0.04);
  heatGlow.rotation.x = Math.PI / 2;
  sphere(hotplate, glow('#ff894c', 1.0), 0.045, 0.045, 0.045, -0.58, 0.16, 0.78, 10);
  cylinder(hotplate, dark, 0.11, 0.11, 0.08, 0.52, 0.16, 0.78, 16).rotation.x = Math.PI / 2;
  const hotTag = labelSprite('Placa secagem 48–58°C', { scale: 0.28, border: '#e2965c', color: '#fae0c4' });
  hotTag.position.set(0, 0.96, 0);
  hotplate.add(hotTag);

  const water = group(scene, 3.12, 0, 0.92);
  water.userData.pickKey = 'water';
  lathe(water, dark, [[0.01, 0], [1.14, 0], [1.18, 0.08], [1.10, 0.46], [1.02, 0.50], [0.96, 0.44], [0.96, 0.08], [0.01, 0.08]], 36);
  torus(water, chrome, 1.04, 0.055, 0, 0.49, 0).rotation.x = Math.PI / 2;
  sphere(water, glow('#4ee0b0', 0.9), 0.044, 0.044, 0.044, 0.76, 0.24, 0.84, 10);
  const waterSurface = cylinder(water, gelMaterial('#56bcd6', { opacity: 0.76, iridescence: 0.44, clearcoat: 1.0 }), 0.96, 0.96, 0.045, 0, 0.44, 0, 32);
  const ripples = [0, 1, 2].map(() => {
    const r = torus(water, glow('#a4f0ff', 0.52, { transparent: true, opacity: 0.42, depthWrite: false }), 0.46, 0.012, 0, 0.472, 0);
    r.rotation.x = Math.PI / 2;
    return r;
  });
  // Gentle rising warm steam wisps over the heated water bath!
  const steamPuffs = [];
  for (let i = 0; i < 6; i++) {
    const puff = mesh(water, new T.SphereGeometry(0.11, 10, 8),
      glow('#d6f6ff', 0.28, { transparent: true, opacity: 0.14, depthWrite: false }),
      Math.cos(i * 1.3) * 0.34, 0.65 + i * 0.16, Math.sin(i * 1.3) * 0.34);
    steamPuffs.push(puff);
  }
  interactives.set('water', {
    object: water, view: 'water', title: 'Banho-maria, placa aquecedora e secagem',
    subtitle: 'Estende cortes (45°C), seca e adere à lâmina na placa aquecedora (48–58°C)', color: '#6ac3d4'
  });

  // =========================================================================
  // STATION 4: FRASCOS EM PAPEL ALUMÍNIO (Foto 13), FUNIL + FILTRO (Foto 12/15),
  //            CUBA DE VIDRO (Foto 11), PAPEL TOALHA (Foto 4/14) & LAMÍNULA 45°!
  // =========================================================================
  const stain = group(scene, 6.28, 0, 0.18);
  stain.userData.pickKey = 'stain';
  roundedSlab(stain, dark, 3.85, 2.86, 0.20, 0.16, 0.03, 0, 0.10, 0.18);
  roundedSlab(stain, steel, 3.79, 2.80, 0.028, 0.14, 0.008, 0, 0.205, 0.18);

  // Back row: Light-sensitive stain bottles wrapped in crinkled Aluminum Foil + Amber glass (Photo 13!)
  const stainBottleSpecs = [
    ['Hematox.', '#5e358f', true, false],
    ['Eosina', '#df6c93', true, false],
    ['Schiff (PAS)', '#c92a7f', true, false],
    ['Toluidina', '#3574cc', false, true],
    ['Gram/Masson', '#7b48b0', false, true]
  ];
  const stainBottles = stainBottleSpecs.map(([name, dye, isFoil, isAmber], i) => {
    const x = (i - 2) * 0.76;
    const { liquid } = makeReagentBottle(stain, x, -0.82, dye, name, {
      height: 0.78, radius: 0.21, foil: isFoil, amber: isAmber, tagYOffset: i % 2 ? 0.26 : 0
    });
    return { name, liquid };
  });

  // Glass Filtration Funnel + Pleated White Filter Paper + Erlenmeyer Flask (Course Photos 12 & 15!)
  const filterStation = group(stain, -1.25, 0.22, 0.62);
  lathe(filterStation, glass, [
    [0.01, 0], [0.32, 0], [0.34, 0.05], [0.11, 0.56], [0.11, 0.72], [0.14, 0.75]
  ], 24);
  const filteredLiqMat = gelMaterial('#5e358f', { opacity: 0.88, emissive: '#3e1e68', emissiveIntensity: 0.28 });
  lathe(filterStation, filteredLiqMat, [[0.01, 0.02], [0.28, 0.02], [0.22, 0.24], [0.01, 0.24]], 20);
  // Glass funnel & stained white filter paper cone on top of Erlenmeyer
  lathe(filterStation, glass, [[0.04, 0.56], [0.04, 0.76], [0.32, 1.12], [0.30, 1.13], [0.03, 0.77]], 22);
  lathe(filterStation, enamelMaterial('#f2e4ec', { roughness: 0.8 }), [[0.03, 0.78], [0.29, 1.11], [0.28, 1.12], [0.02, 0.79]], 18);
  const filterDrop = mesh(filterStation, new T.SphereGeometry(0.032, 10, 8), glow('#8848c4', 0.9), 0, 0.45, 0);
  filterDrop.visible = false;
  const filterTag = labelSprite('Filtração em funil', { scale: 0.23, border: '#b285e8', color: '#f0e4ff' });
  filterTag.position.set(0, 1.44, 0);
  filterStation.add(filterTag);

  // Grooved Borosilicate Glass Staining Dish ("Cuba de vidro de coloração" — Photo 11!)
  const stainingDish = group(stain, 1.24, 0.22, 0.58);
  roundedSlab(stainingDish, glassMaterial('#d8f4fa', { opacity: 0.36, clearcoat: 1.0 }), 0.88, 0.66, 0.46, 0.08, 0.025, 0, 0.23, 0);
  const dishLiqMat = gelMaterial('#b82442', { opacity: 0.84, emissive: '#6e1026', emissiveIntensity: 0.28, iridescence: 0.35 });
  roundedSlab(stainingDish, dishLiqMat, 0.76, 0.54, 0.34, 0.05, 0.015, 0, 0.20, 0);
  // Vertical dipping glass slide inside the staining dish!
  const dipSlide = box(stainingDish, glassMaterial('#e8fbff', { opacity: 0.52 }), 0.035, 0.56, 0.44, 0, 0.38, 0);
  dipSlide.visible = false;
  const dishTag = labelSprite('Cuba de coloração', { scale: 0.23, border: '#df6c93', color: '#ffe0eb' });
  dishTag.position.set(0, 0.95, 0);
  stainingDish.add(dishTag);

  // Textured White Absorbent Paper Towel sheet in front of the staining deck (Photos 4 & 14!)
  const paperTowel = group(stain, 0.0, 0.225, 0.78);
  roundedSlab(paperTowel, enamelMaterial('#eceee8', { roughness: 0.92, clearcoat: 0.04 }), 1.88, 1.02, 0.024, 0.04, 0.008, 0, 0.012, 0);

  // Hero Glass Microscope Slide (frosted end + 3 serial blue/pink tissue sections + stain diffusion wave + 45° coverslip!)
  const slide = group(scene, 6.28, 0.285, 0.96);
  slide.userData.pickKey = 'stain';
  roundedSlab(slide, glass, 1.56, 0.68, 0.052, 0.025, 0.008, 0, 0, 0);
  box(slide, frosted, 0.34, 0.056, 0.64, -0.58, 0.004, 0);
  // 3 distinct serial resin/paraffin sections arranged neatly on the glass slide (EXACT match to Photos 4 & 14!)
  const patchMat = organelleMaterial('#6ea8dc', { roughness: 0.36, clearcoat: 0.55 });
  const patch = group(slide, 0.14, 0.032, 0);
  for (const [px, pz, sx, sz] of [[-0.22, 0.06, 0.22, 0.16], [0.06, -0.09, 0.24, 0.17], [0.28, 0.1, 0.21, 0.16]]) {
    const secGeo = organicDisplace(new T.CylinderGeometry(0.11, 0.11, 0.014, 16), 0.08, 6, px * 15);
    mesh(patch, secGeo, patchMat, px, 0, pz).scale.set(sx / 0.22, 1, sz / 0.16);
  }
  // Radial staining diffusion wave overlay on the sections
  const stainWaveMat = glow('#6ea8dc', 0.9, { transparent: true, opacity: 0, depthWrite: false });
  const stainWave = torus(slide, stainWaveMat, 0.28, 0.022, 0.14, 0.048, 0);
  stainWave.rotation.x = Math.PI / 2;

  // Iridescent Borosilicate Coverslip pivoted on its left edge so it lowers at a REAL 45° bubble-free angle!
  const coverslipPivot = group(slide, -0.26, 0.058, 0);
  const coverslip = box(coverslipPivot, glassMaterial('#def9ff', { opacity: 0.42, iridescence: 0.36 }), 0.86, 0.016, 0.56, 0.43, 0, 0);
  // Shimmering Entellan/mounting resin droplet placed right before coverslip lowers!
  const mountDrop = sphere(slide, gelMaterial('#fff5cc', { opacity: 0.68, iridescence: 0.4, clearcoat: 1.0 }), 0.12, 0.045, 0.12, 0.14, 0.052, 0, 16);
  mountDrop.visible = false;

  // Sleek Glass Pasteur Pipette Dropper above slide
  const dropper = group(scene, 6.42, 1.75, 0.96);
  lathe(dropper, anodizedMaterial('#2a3442'), [[0.01, 0.28], [0.09, 0.30], [0.085, 0.52], [0.04, 0.58], [0.01, 0.59]], 16);
  lathe(dropper, glass, [[0.012, -0.34], [0.028, -0.14], [0.058, 0.06], [0.062, 0.29]], 16);
  dropper.visible = false;
  const dropMat = glow('#6ea8dc', 0.55, { transparent: true, opacity: 0.92 });
  const drop = mesh(scene, new T.SphereGeometry(0.068, 14, 12), dropMat, 6.42, 1.32, 0.96);
  drop.visible = false;

  interactives.set('stain', {
    object: stain, view: 'stain', title: 'Estação de coloração, filtração e montagem da lamínula',
    subtitle: 'Frascos em papel alumínio, funil de filtração, cuba de vidro, papel absorvente e lamínula a 45°', color: '#df6c93'
  });

  return {
    lupaStation, lupaMonitor, updateLupaMonitor: lupaMonitorPanel.update,
    bee, beeOrgan, forceps, iceChamber, iceCrystals, waxDish, salineDrop,
    rack, bottles, resinMold, moldWells, woodBlockPreview, specimen,
    micro, feeder, paraffin, resinHolder, steelBlade, glassKnife, crank, ribbon, ribbonSlices,
    blackCup, cupSlices, cupRipple, cupRippleMat, microForceps, transferFilm, cupPickSlide, cupSlideSections,
    updateMicrotomeLED: ledPanel.update,
    hotplate, heatGlow, heatGlowMat, water, waterSurface, ripples, steamPuffs,
    stain, stainBottles, filterStation, filteredLiqMat, filterDrop, stainingDish, dishLiqMat, dipSlide,
    paperTowel, slide, patch, patchMat, stainWave, stainWaveMat, coverslipPivot, coverslip, mountDrop,
    dropper, drop, dropMat, interactives
  };
}
