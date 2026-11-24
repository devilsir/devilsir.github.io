'use strict';
/**
 * svg-plants.js — Ilustrações botânicas vetoriais modulares para todas as 8 espécies:
 *  - Flores: Flor-de-Mendel, Orquídea-Prisma
 *  - Árvores: Cerejeira Bonsai, Macieira Imperial
 *  - Cactos: Cacto-Estrela
 *  - Alimentícias: Milho-do-Campo, Soja-de-Cultivo, Ervilha-de-Mendel
 */
const PlantArt = (() => {
  const BASE_Y = 134;

  const leafPath = s =>
    `M0,0 C${s * 0.28},${-s * 0.42} ${s * 0.74},${-s * 0.36} ${s},0 C${s * 0.74},${s * 0.36} ${s * 0.28},${s * 0.42} 0,0Z`;

  function stemX(y, top, ctrlX) {
    const t = Math.min(1, Math.max(0, (BASE_Y - y) / (BASE_Y - top)));
    return 60 + 2 * t * (1 - t) * (ctrlX - 60);
  }

  // Vaso cerâmico contemporâneo com detalhe metálico (ou silhueta fosca)
  function pot(sil, style = 'classic') {
    if (sil) {
      if (style === 'bonsai') {
        return `<g class="pot">
          <ellipse cx="60" cy="166" rx="38" ry="3.2" fill="rgba(0,0,0,0.28)"/>
          <path d="M24,142 L96,142 L90,162 L30,162 Z" fill="rgba(148,163,184,0.2)" stroke="rgba(148,163,184,0.42)" stroke-width="1"/>
          <rect x="20" y="136" width="80" height="7" rx="2" fill="rgba(148,163,184,0.26)" stroke="rgba(148,163,184,0.45)" stroke-width="1"/>
        </g>`;
      }
      return `<g class="pot">
        <ellipse cx="60" cy="167" rx="30" ry="3.2" fill="rgba(0,0,0,0.28)"/>
        <path d="M39,140 L81,140 L76,166 L44,166 Z" fill="rgba(148,163,184,0.2)" stroke="rgba(148,163,184,0.42)" stroke-width="1"/>
        <rect x="34" y="131" width="52" height="11" rx="3" fill="rgba(148,163,184,0.26)" stroke="rgba(148,163,184,0.45)" stroke-width="1"/>
      </g>`;
    }
    if (style === 'bonsai') {
      return `<g class="pot">
        <ellipse cx="60" cy="166" rx="39" ry="3.5" fill="rgba(0,0,0,0.44)"/>
        <path d="M24,142 L96,142 L90,162 L30,162 Z" fill="#232220" stroke="#4F4B44" stroke-width="1"/>
        <rect x="20" y="135" width="80" height="8" rx="2.5" fill="#32302C" stroke="#625C52" stroke-width="1"/>
        <ellipse cx="60" cy="136" rx="34" ry="3.2" fill="#241B14"/>
        <line x1="34" y1="152" x2="86" y2="152" stroke="rgba(216,177,106,0.55)" stroke-width="1.2"/>
      </g>`;
    }
    if (style === 'ceramic') {
      return `<g class="pot">
        <ellipse cx="60" cy="167" rx="31" ry="3.4" fill="rgba(0,0,0,0.44)"/>
        <path d="M38,140 L82,140 L76,166 L44,166 Z" fill="#252422" stroke="#504B44" stroke-width="1"/>
        <rect x="33" y="131" width="54" height="11" rx="3" fill="#34322E" stroke="#645D53" stroke-width="1"/>
        <ellipse cx="60" cy="133" rx="23" ry="3" fill="#231914"/>
        <path d="M41,150 L79,150" stroke="rgba(216,177,106,0.6)" stroke-width="1.4"/>
        <path d="M43,155 L77,155" stroke="rgba(244,243,238,0.22)" stroke-width="0.9"/>
      </g>`;
    }
    if (style === 'soil') {
      return `<g class="pot">
        <ellipse cx="60" cy="167" rx="34" ry="3.5" fill="rgba(0,0,0,0.44)"/>
        <path d="M35,140 L85,140 L79,166 L41,166 Z" fill="#463226" stroke="#755642" stroke-width="1"/>
        <rect x="31" y="131" width="58" height="11" rx="3" fill="#593F2F" stroke="#8C6850" stroke-width="1"/>
        <ellipse cx="60" cy="133" rx="25" ry="3.4" fill="#221710"/>
        <rect x="48" y="147" width="24" height="9" rx="2" fill="rgba(244,243,238,0.16)" stroke="rgba(216,177,106,0.55)" stroke-width="0.9"/>
      </g>`;
    }
    return `<g class="pot">
      <ellipse cx="60" cy="167" rx="31" ry="3.4" fill="rgba(0,0,0,0.44)"/>
      <path d="M39,140 L81,140 L76,166 L44,166 Z" fill="url(#potGrad)" stroke="#5b2b14" stroke-width=".85"/>
      <rect x="34" y="131" width="52" height="11" rx="3" fill="url(#potRimGrad)" stroke="#5b2b14" stroke-width=".85"/>
      <ellipse cx="60" cy="133" rx="23" ry="3" fill="#321e11"/>
      <rect x="49" y="147" width="22" height="10" rx="2" fill="rgba(244,243,238,0.22)" stroke="rgba(216,177,106,0.65)" stroke-width=".8"/>
      <line x1="53" y1="152" x2="67" y2="152" stroke="rgba(244,243,238,0.45)" stroke-width=".9"/>
    </g>`;
  }

  let auraSeq = 0;

  function auraEffects(cx, cy, colorHex = '#38BDF8') {
    const gid = `bio-rad-${++auraSeq}`;
    const spores = [
      [-24, -14, 1.8, 0], [22, -20, 1.5, 0.7], [-14, -30, 1.3, 1.5],
      [26, 4, 1.6, 2.2], [-28, 10, 1.3, 1.0], [6, -34, 1.4, 2.8],
    ].map(([dx, dy, r, d]) =>
      `<circle class="spore" cx="${(cx + dx).toFixed(1)}" cy="${cy + dy}" r="${r}" fill="${colorHex}" style="animation-delay:${d}s"/>`
    ).join('');
    return {
      halo: `<defs><radialGradient id="${gid}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${colorHex}" stop-opacity="0.52"/>
          <stop offset="55%" stop-color="${colorHex}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${colorHex}" stop-opacity="0"/>
        </radialGradient></defs>
        <circle class="bio-halo" cx="${cx.toFixed(1)}" cy="${cy}" r="46" fill="url(#${gid})"/>`,
      soil: `<ellipse class="bio-soil" cx="60" cy="133" rx="25" ry="4.5" fill="url(#${gid})"/>`,
      spores,
    };
  }

  // =========================================================================
  // 1. FLOR-DE-MENDEL (Vermelha/Rosa/Branca · Alta/Anã · Bioluminescente)
  // =========================================================================
  function renderFlorMendel(ph, sil) {
    const tall = ph.height === 'alta';
    const bio = ph.glow === 'bio';
    const top = tall ? 40 : 94;
    const ctrlX = tall ? 53 : 56;
    const stemW = tall ? 4.1 : 5.4;

    const leafSpecs = tall
      ? [[120, -1, 24], [106, 1, 22], [91, -1, 19], [76, 1, 16], [61, -1, 13]]
      : [[127, -1, 26], [124, 1, 26], [116, -1, 22], [110, 1, 21], [103, -1, 15]];

    const leaves = leafSpecs.map(([y, side, size]) => {
      const x = stemX(y, top, ctrlX);
      const ang = side < 0 ? -152 : -28;
      if (sil) {
        return `<g transform="translate(${x.toFixed(1)} ${y}) rotate(${ang})"><path d="${leafPath(size)}" fill="rgba(148,163,184,0.22)" stroke="rgba(148,163,184,0.45)" stroke-width="0.9"/></g>`;
      }
      const vein = bio
        ? `<path d="M1,0 L${(size * 0.88).toFixed(1)},0" stroke="#7DD3FC" stroke-width="1.2" stroke-linecap="round" filter="url(#bioGlowSoft)"/>`
        : `<path d="M1,0 L${(size * 0.88).toFixed(1)},0" stroke="#1E3A2F" stroke-width="0.85" stroke-linecap="round"/>`;
      return `<g transform="translate(${x.toFixed(1)} ${y}) rotate(${ang})"><path d="${leafPath(size)}" fill="url(#leafGrad)" stroke="#1E3A2F" stroke-width="0.65"/>${vein}</g>`;
    }).join('');

    const stem = sil
      ? `<path d="M60,${BASE_Y} Q${ctrlX},${(BASE_Y + top) / 2} 60,${top}" stroke="rgba(148,163,184,0.42)" stroke-width="${stemW}" stroke-linecap="round" fill="none"/>`
      : `<path d="M60,${BASE_Y} Q${ctrlX},${(BASE_Y + top) / 2} 60,${top}" stroke="url(#stemGrad)" stroke-width="${stemW}" stroke-linecap="round" fill="none"/>
         ${bio ? `<path d="M60,${BASE_Y} Q${ctrlX},${(BASE_Y + top) / 2} 60,${top}" stroke="#67E8F9" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".85" filter="url(#bioGlowSoft)"/>` : ''}`;

    const back = [], front = [], rims = [];
    for (let i = 0; i < 6; i++) {
      if (sil) {
        front.push(`<ellipse cx="0" cy="-12" rx="7.6" ry="12.6" transform="rotate(${i * 60})" fill="rgba(148,163,184,0.24)" stroke="rgba(148,163,184,0.5)" stroke-width=".9"/>`);
      } else {
        back.push(`<ellipse cx="0" cy="-11" rx="7.1" ry="11.6" transform="rotate(${i * 60 + 30})" fill="url(#petalDark-${ph.color})"/>`);
        front.push(`<ellipse cx="0" cy="-12" rx="7.7" ry="12.8" transform="rotate(${i * 60})" fill="url(#petal-${ph.color})" stroke="${ph.color === 'branca' ? '#cbd5e1' : 'rgba(0,0,0,.2)'}" stroke-width=".6"/>`);
        if (bio) rims.push(`<ellipse cx="0" cy="-12" rx="7.7" ry="12.8" transform="rotate(${i * 60})" fill="none" stroke="#67E8F9" stroke-width="1.3" opacity=".92"/>`);
      }
    }
    const flowerSvg = sil
      ? `<g class="flower" transform="translate(60 ${top})">${front.join('')}<circle r="6" fill="rgba(148,163,184,0.34)" stroke="rgba(148,163,184,0.55)" stroke-width=".9"/></g>`
      : `<g class="flower" transform="translate(60 ${top})">
          <path d="M0,4 L-9,12 L-2,6Z M0,4 L9,12 L2,6Z" fill="#3B6E52"/>
          <g ${bio ? 'filter="url(#bioGlow)"' : ''}><g>${back.join('')}</g><g>${front.join('')}</g>${bio ? `<g>${rims.join('')}</g>` : ''}</g>
          <circle r="6.5" fill="url(#centerGrad)"/>
        </g>`;

    const fx = (!sil && bio) ? auraEffects(60, top, '#38BDF8') : null;
    return { body: `${stem}${leaves}${flowerSvg}`, pot: pot(sil, 'classic'), fx, bio };
  }

  // =========================================================================
  // 2. ORQUÍDEA-PRISMA (Violeta/Lavanda/Dourada · Pintalgada/Lisa · Luminescente)
  // =========================================================================
  function renderOrquidea(ph, sil) {
    const bio = ph.glow === 'bio';
    const spotted = ph.pattern === 'pintalgada';
    const pal = {
      violeta: { main: '#9333EA', dark: '#581C87', lip: '#F43F5E', spot: '#FDE047' },
      lavanda: { main: '#C084FC', dark: '#7E22CE', lip: '#EC4899', spot: '#4C1D95' },
      perola: { main: '#F8FAFC', dark: '#CBD5E1', lip: '#F59E0B', spot: '#9333EA' },
    }[ph.color] || { main: '#9333EA', dark: '#581C87', lip: '#F43F5E', spot: '#FDE047' };

    const blossom = (x, y, sc, rot) => {
      if (sil) {
        return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
          <ellipse cx="0" cy="-12" rx="6" ry="12" fill="rgba(148,163,184,0.22)" stroke="rgba(148,163,184,0.48)" stroke-width="0.9"/>
          <ellipse cx="-13" cy="-2" rx="12" ry="8" transform="rotate(-14 -13 -2)" fill="rgba(148,163,184,0.25)" stroke="rgba(148,163,184,0.5)" stroke-width="0.9"/>
          <ellipse cx="13" cy="-2" rx="12" ry="8" transform="rotate(14 13 -2)" fill="rgba(148,163,184,0.25)" stroke="rgba(148,163,184,0.5)" stroke-width="0.9"/>
          <circle cx="0" cy="4" r="5" fill="rgba(148,163,184,0.36)"/>
        </g>`;
      }
      const spots = spotted ? `
        <circle cx="-11" cy="-4" r="1.4" fill="${pal.spot}" opacity="0.9"/>
        <circle cx="-16" cy="0" r="1.2" fill="${pal.spot}" opacity="0.85"/>
        <circle cx="-9" cy="1" r="1.1" fill="${pal.spot}" opacity="0.85"/>
        <circle cx="11" cy="-4" r="1.4" fill="${pal.spot}" opacity="0.9"/>
        <circle cx="16" cy="0" r="1.2" fill="${pal.spot}" opacity="0.85"/>
        <circle cx="9" cy="1" r="1.1" fill="${pal.spot}" opacity="0.85"/>
        <circle cx="0" cy="-12" r="1.3" fill="${pal.spot}" opacity="0.85"/>
        <circle cx="-3" cy="-16" r="1" fill="${pal.spot}" opacity="0.8"/>
        <circle cx="3" cy="-16" r="1" fill="${pal.spot}" opacity="0.8"/>` : '';
      return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})" ${bio ? 'filter="url(#bioGlow)"' : ''}>
        <ellipse cx="0" cy="-12" rx="6.2" ry="12.5" fill="${pal.dark}" stroke="${bio ? '#A5F3FC' : 'rgba(255,255,255,0.2)'}" stroke-width="0.8"/>
        <ellipse cx="-8" cy="10" rx="5.5" ry="10" transform="rotate(32 -8 10)" fill="${pal.dark}"/>
        <ellipse cx="8" cy="10" rx="5.5" ry="10" transform="rotate(-32 8 10)" fill="${pal.dark}"/>
        <ellipse cx="-13" cy="-2" rx="12.5" ry="8.5" transform="rotate(-14 -13 -2)" fill="${pal.main}" stroke="${bio ? '#E879F9' : 'rgba(255,255,255,0.22)'}" stroke-width="0.9"/>
        <ellipse cx="13" cy="-2" rx="12.5" ry="8.5" transform="rotate(14 13 -2)" fill="${pal.main}" stroke="${bio ? '#E879F9' : 'rgba(255,255,255,0.22)'}" stroke-width="0.9"/>
        <path d="M-5,2 Q0,14 5,2 Q0,-3 -5,2 Z" fill="${pal.lip}" stroke="#FDE68A" stroke-width="0.7"/>
        <circle cx="0" cy="2" r="2.6" fill="#FEF08A"/>
        ${spots}
      </g>`;
    };

    const baseLeaves = sil
      ? `<path d="M60,132 C38,124 24,110 26,104 C36,108 50,118 60,132 Z M60,132 C82,124 96,110 94,104 C84,108 70,118 60,132 Z" fill="rgba(148,163,184,0.22)" stroke="rgba(148,163,184,0.45)" stroke-width="0.9"/>`
      : `<path d="M60,132 C34,126 18,112 22,102 C34,106 50,118 60,132 Z" fill="#15803D" stroke="#052E16" stroke-width="0.8"/>
         <path d="M60,132 C86,126 102,112 98,102 C86,106 70,118 60,132 Z" fill="#16A34A" stroke="#052E16" stroke-width="0.8"/>`;

    const stem = `<path d="M60,132 C54,96 48,66 64,40 C74,24 88,28 92,42" fill="none" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#22C55E'}" stroke-width="3.2" stroke-linecap="round"/>`;
    const body = `${baseLeaves}${stem}${blossom(56, 68, 0.88, -12)}${blossom(66, 40, 0.96, 8)}${blossom(88, 48, 0.78, 22)}`;
    const fx = (!sil && bio) ? auraEffects(68, 48, '#C084FC') : null;
    return { body, pot: pot(sil, 'ceramic'), fx, bio };
  }

  // =========================================================================
  // 3. CEREJEIRA BONSAI (Carmim/Rosada/Neve · Alta/Bonsai · Folha Jade/Dourada)
  // =========================================================================
  function renderCerejeira(ph, sil) {
    const bonsai = ph.height === 'bonsai';
    const goldLeaf = ph.foliage === 'dourada';
    const flowerPal = {
      carmim: { a: '#E11D48', b: '#FB7185' },
      rosada: { a: '#F472B6', b: '#FBCFE8' },
      neve: { a: '#E2E8F0', b: '#FFFFFF' },
    }[ph.color] || { a: '#F472B6', b: '#FBCFE8' };

    const leafFill = sil ? 'rgba(148,163,184,0.22)' : (goldLeaf ? '#F59E0B' : '#10B981');
    const leafDark = sil ? 'rgba(148,163,184,0.16)' : (goldLeaf ? '#B45309' : '#047857');
    const bark = sil ? 'rgba(148,163,184,0.38)' : '#5C3A28';

    const trunk = bonsai
      ? `<path d="M58,136 C54,118 42,114 48,100 C54,88 74,90 76,78" fill="none" stroke="${bark}" stroke-width="8.5" stroke-linecap="round"/>
         <path d="M52,102 C38,94 32,88 28,82" fill="none" stroke="${bark}" stroke-width="5" stroke-linecap="round"/>
         <path d="M62,92 C76,84 88,84 94,76" fill="none" stroke="${bark}" stroke-width="4.5" stroke-linecap="round"/>`
      : `<path d="M60,136 C56,104 64,78 58,48" fill="none" stroke="${bark}" stroke-width="8" stroke-linecap="round"/>
         <path d="M59,86 C42,74 34,64 28,54" fill="none" stroke="${bark}" stroke-width="4.8" stroke-linecap="round"/>
         <path d="M60,76 C78,64 86,56 92,48" fill="none" stroke="${bark}" stroke-width="4.6" stroke-linecap="round"/>`;

    const clusters = bonsai
      ? [[30, 78, 17], [58, 70, 22], [88, 72, 18], [46, 84, 15], [74, 82, 15]]
      : [[30, 52, 18], [58, 36, 24], [88, 48, 19], [42, 60, 17], [76, 58, 17]];

    const canopy = clusters.map(([cx, cy, r], i) => {
      const f1 = sil ? 'rgba(148,163,184,0.26)' : (i % 2 === 0 ? flowerPal.a : flowerPal.b);
      return `<g>
        <ellipse cx="${cx - r * 0.45}" cy="${cy + r * 0.35}" rx="${r * 0.52}" ry="${r * 0.36}" fill="${leafDark}"/>
        <ellipse cx="${cx + r * 0.45}" cy="${cy + r * 0.3}" rx="${r * 0.52}" ry="${r * 0.36}" fill="${leafFill}"/>
        <circle cx="${cx}" cy="${cy}" r="${r * 0.68}" fill="${f1}" stroke="${sil ? 'rgba(148,163,184,0.45)' : 'rgba(255,255,255,0.22)'}" stroke-width="0.7"/>
        ${!sil ? `<circle cx="${cx - 4}" cy="${cy - 4}" r="${r * 0.34}" fill="${flowerPal.b}" opacity="0.88"/>
          <circle cx="${cx + 5}" cy="${cy + 2}" r="2.2" fill="#FEF08A"/>` : ''}
      </g>`;
    }).join('');

    return { body: `${trunk}${canopy}`, pot: pot(sil, 'bonsai'), fx: null, bio: false };
  }

  // =========================================================================
  // 4. MACIEIRA IMPERIAL (Rubra/Rajada/Verde · Alta/Anã · Fruto Gigante/Mini)
  // =========================================================================
  function renderMacieira(ph, sil) {
    const dwarf = ph.height === 'ana';
    const isMini = ph.fruitSize === 'mini';
    const cyBase = dwarf ? 80 : 48;
    const bark = sil ? 'rgba(148,163,184,0.38)' : '#6B4226';

    const trunk = dwarf
      ? `<path d="M60,136 L60,92 M60,104 L42,88 M60,100 L78,86" stroke="${bark}" stroke-width="6.8" stroke-linecap="round" fill="none"/>`
      : `<path d="M60,136 Q57,96 60,56 M59,84 L38,62 M60,78 L82,58" stroke="${bark}" stroke-width="7.4" stroke-linecap="round" fill="none"/>`;

    const crown = sil
      ? `<circle cx="40" cy="${cyBase + 6}" r="20" fill="rgba(148,163,184,0.22)" stroke="rgba(148,163,184,0.45)"/>
         <circle cx="80" cy="${cyBase + 6}" r="20" fill="rgba(148,163,184,0.22)" stroke="rgba(148,163,184,0.45)"/>
         <circle cx="60" cy="${cyBase - 10}" r="24" fill="rgba(148,163,184,0.26)" stroke="rgba(148,163,184,0.45)"/>`
      : `<circle cx="38" cy="${cyBase + 8}" r="21" fill="#1E5F3A"/>
         <circle cx="82" cy="${cyBase + 8}" r="21" fill="#1E5F3A"/>
         <circle cx="60" cy="${cyBase - 10}" r="25" fill="#2A7A4B"/>
         <circle cx="52" cy="${cyBase + 2}" r="18" fill="#3A945E" opacity="0.72"/>
         <circle cx="70" cy="${cyBase - 2}" r="17" fill="#3A945E" opacity="0.68"/>`;

    const rApple = isMini ? 3.5 : 10.2;
    const applePos = isMini
      ? [[36, cyBase + 4], [46, cyBase + 13], [58, cyBase - 12], [69, cyBase - 4], [80, cyBase + 5], [70, cyBase + 14], [48, cyBase - 4]]
      : [[41, cyBase + 8], [60, cyBase - 11], [79, cyBase + 8], [60, cyBase + 13]];

    const apples = applePos.map(([ax, ay]) => {
      if (sil) return `<circle cx="${ax}" cy="${ay}" r="${rApple}" fill="rgba(148,163,184,0.38)"/>`;
      const mainFill = ph.color === 'rubra' ? '#C92A2A' : ph.color === 'verde' ? '#70B83D' : '#D94032';
      const stripe = ph.color === 'rajada'
        ? `<path d="M${ax - rApple * 0.35},${ay - rApple * 0.82} Q${ax + 1.2},${ay} ${ax - 1.2},${ay + rApple * 0.82}" stroke="#7BC448" stroke-width="${isMini ? 1.2 : 2.8}" fill="none"/>
           <path d="M${ax + rApple * 0.3},${ay - rApple * 0.72} Q${ax + rApple * 0.56},${ay} ${ax + rApple * 0.25},${ay + rApple * 0.72}" stroke="#EAB308" stroke-width="${isMini ? 0.95 : 2.1}" fill="none"/>`
        : '';
      const giantLeaf = !isMini
        ? `<path d="M${ax + 1},${ay - rApple - 1.4} Q${ax + 6.5},${ay - rApple - 5.5} ${ax + 7.2},${ay - rApple - 0.5} Q${ax + 3.5},${ay - rApple - 0.2} ${ax + 1},${ay - rApple - 1.4} Z" fill="#4ADE80" stroke="#14532D" stroke-width="0.6"/>`
        : '';
      return `<g>
        <circle cx="${ax}" cy="${ay}" r="${rApple}" fill="${mainFill}" stroke="rgba(0,0,0,0.34)" stroke-width="${isMini ? 0.65 : 0.95}"/>
        ${stripe}
        <circle cx="${ax - rApple * 0.32}" cy="${ay - rApple * 0.32}" r="${(rApple * 0.24).toFixed(1)}" fill="rgba(255,255,255,0.62)"/>
        <path d="M${ax},${ay - rApple} L${ax + 1.2},${ay - rApple - (isMini ? 2.2 : 3.4)}" stroke="#451A03" stroke-width="${isMini ? 1.0 : 1.4}"/>
        ${giantLeaf}
      </g>`;
    }).join('');

    return { body: `${trunk}${crown}${apples}`, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 4B. TULIPA-HOLANDESA (Rubro/Laranja-Chama/Amarela · Rajada/Lisa · Longa/Compacta)
  // =========================================================================
  function renderTulipa(ph, sil) {
    const tall = ph.height === 'longa';
    const striped = ph.pattern === 'rajada';
    const topY = tall ? 40 : 86;
    const pal = {
      rubra: { main: '#C92A2A', dark: '#8A1C1C', stripe: '#FDE047' },
      chama: { main: '#E86F2D', dark: '#B84414', stripe: '#FEF08A' },
      amarela: { main: '#E5B82E', dark: '#B38514', stripe: '#C92A2A' },
    }[ph.color] || { main: '#C92A2A', dark: '#8A1C1C', stripe: '#FDE047' };

    const stem = `<path d="M60,134 Q57,${(134 + topY) / 2} 60,${topY + 12}" fill="none" stroke="${sil ? 'rgba(148,163,184,0.44)' : '#2E8B57'}" stroke-width="4.2" stroke-linecap="round"/>`;
    const leaves = sil
      ? `<path d="M58,133 C36,112 30,86 38,68 C42,88 48,110 60,132 Z M62,133 C84,114 88,90 80,74 C76,94 70,112 60,132 Z" fill="rgba(148,163,184,0.22)" stroke="rgba(148,163,184,0.44)"/>`
      : `<path d="M58,133 C34,112 28,${topY + 28} 38,${topY + 14} C42,${topY + 42} 48,110 60,132 Z" fill="#2A7A4B" stroke="#164A2B" stroke-width="0.8"/>
         <path d="M62,133 C84,114 90,${topY + 34} 80,${topY + 20} C76,${topY + 48} 70,112 60,132 Z" fill="#3A945E" stroke="#164A2B" stroke-width="0.8"/>`;

    const flames = (!sil && striped) ? `
      <path d="M-8,12 Q-6,0 -11,-14 M0,13 Q1,-2 0,-17 M8,12 Q6,0 11,-14" stroke="${pal.stripe}" stroke-width="2.1" stroke-linecap="round" fill="none" opacity="0.92"/>` : '';

    const cup = `<g transform="translate(60 ${topY})">
      <path d="M-15,-12 C-17,6 -10,16 0,16 C10,16 17,6 15,-12 C9,-4 4,-8 0,-18 C-4,-8 -9,-4 -15,-12 Z" fill="${sil ? 'rgba(148,163,184,0.28)' : pal.dark}" stroke="${sil ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.2)'}" stroke-width="0.8"/>
      <path d="M-13,-9 C-14,7 -8,16 0,16 C8,16 14,7 13,-9 C8,-2 3,-6 0,-16 C-3,-6 -8,-2 -13,-9 Z" fill="${sil ? 'rgba(148,163,184,0.34)' : pal.main}"/>
      ${flames}
    </g>`;

    return { body: `${leaves}${stem}${cup}`, pot: pot(sil, 'ceramic'), fx: null, bio: false };
  }

  // =========================================================================
  // 4C. LARANJEIRA-CÍTRICA (Laranja-Sangue/Âmbar/Ouro · Copa Alta/Anã · Com/Sem Sementes)
  // =========================================================================
  function renderLaranjeira(ph, sil) {
    const dwarf = ph.height === 'ana';
    const seedless = ph.seeds === 'sem_semente';
    const cyBase = dwarf ? 80 : 48;
    const bark = sil ? 'rgba(148,163,184,0.38)' : '#5C3B24';
    const fruitCol = {
      sangue: { fill: '#C23828', rim: '#7F1D1D' },
      ambar: { fill: '#E07A22', rim: '#9A3412' },
      ouro: { fill: '#E6C235', rim: '#A16207' },
    }[ph.color] || { fill: '#E07A22', rim: '#9A3412' };

    const trunk = dwarf
      ? `<path d="M60,136 L60,94 M60,104 L44,90 M60,102 L76,88" stroke="${bark}" stroke-width="6.5" stroke-linecap="round" fill="none"/>`
      : `<path d="M60,136 Q62,96 60,56 M60,84 L40,64 M60,78 L80,60" stroke="${bark}" stroke-width="7.2" stroke-linecap="round" fill="none"/>`;

    const canopy = sil
      ? `<ellipse cx="60" cy="${cyBase}" rx="34" ry="26" fill="rgba(148,163,184,0.24)" stroke="rgba(148,163,184,0.45)"/>`
      : `<circle cx="38" cy="${cyBase + 6}" r="19" fill="#175438"/>
         <circle cx="82" cy="${cyBase + 6}" r="19" fill="#175438"/>
         <circle cx="60" cy="${cyBase - 8}" r="24" fill="#1F6E4A"/>
         <circle cx="48" cy="${cyBase + 2}" r="16" fill="#2A8A5D" opacity="0.72"/>
         <circle cx="72" cy="${cyBase}" r="16" fill="#2A8A5D" opacity="0.72"/>`;

    const citrusPts = [[40, cyBase + 7], [58, cyBase - 9], [77, cyBase + 6], [62, cyBase + 12], [46, cyBase - 6]];
    const fruits = citrusPts.map(([fx, fy]) => {
      if (sil) return `<circle cx="${fx}" cy="${fy}" r="6" fill="rgba(148,163,184,0.4)"/>`;
      return `<g>
        <circle cx="${fx}" cy="${fy}" r="6.3" fill="${fruitCol.fill}" stroke="${seedless ? '#FDE68A' : fruitCol.rim}" stroke-width="${seedless ? 1.2 : 0.8}"/>
        <circle cx="${fx - 2}" cy="${fy - 2}" r="1.5" fill="rgba(255,255,255,0.55)"/>
        ${!seedless ? `<circle cx="${fx + 1.5}" cy="${fy + 1.8}" r="0.9" fill="#451A03" opacity="0.65"/>` : ''}
      </g>`;
    }).join('');

    return { body: `${trunk}${canopy}${fruits}`, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 5B. PITAIA-DO-DESERTO (Cacto Frutífero — Pitaia Rubra/Rosada/Amarela · Espinhos · Porte)
  // =========================================================================
  function renderPitaia(ph, sil) {
    const tall = ph.height === 'alto';
    const spiny = ph.spines === 'espinhoso';
    const topY = tall ? 40 : 76;
    const fruitCol = {
      rubra: { fill: '#C92A54', fin: '#4ADE80' },
      coral: { fill: '#F97316', fin: '#86EFAC' },
      amarela: { fill: '#E5B82E', fin: '#65A30D' },
    }[ph.color] || { fill: '#C92A54', fin: '#4ADE80' };

    const stemFill = sil ? 'rgba(148,163,184,0.24)' : '#23865B';
    const stemStroke = sil ? 'rgba(148,163,184,0.45)' : '#114A31';

    const stake = tall ? `<line x1="60" y1="134" x2="60" y2="34" stroke="${sil ? 'rgba(148,163,184,0.3)' : '#785037'}" stroke-width="3.2" stroke-linecap="round"/>` : '';
    const arms = `
      <path d="M54,134 L54,${topY + 12} C54,${topY + 2} 32,${topY + 4} 28,${topY + 26}" fill="none" stroke="${stemFill}" stroke-width="11" stroke-linecap="round"/>
      <path d="M66,134 L66,${topY + 18} C66,${topY + 6} 88,${topY + 8} 92,${topY + 30}" fill="none" stroke="${stemFill}" stroke-width="11" stroke-linecap="round"/>
      <path d="M54,134 L54,${topY + 12} C54,${topY + 2} 32,${topY + 4} 28,${topY + 26}" fill="none" stroke="${stemStroke}" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M66,134 L66,${topY + 18} C66,${topY + 6} 88,${topY + 8} 92,${topY + 30}" fill="none" stroke="${stemStroke}" stroke-width="1.3" stroke-linecap="round"/>`;

    const spines = spiny ? [[48, topY + 24], [48, topY + 48], [72, topY + 30], [72, topY + 54], [30, topY + 16], [90, topY + 20]].map(([sx, sy]) =>
      `<g stroke="${sil ? 'rgba(203,213,225,0.5)' : '#FEF3C7'}" stroke-width="1.1">
        <line x1="${sx}" y1="${sy}" x2="${sx - 4}" y2="${sy - 2.5}"/><line x1="${sx}" y1="${sy}" x2="${sx + 4}" y2="${sy - 2.5}"/>
      </g>`
    ).join('') : '';

    const drawDragonFruit = (fx, fy, rot) => {
      if (sil) return `<ellipse cx="${fx}" cy="${fy}" rx="9" ry="12" transform="rotate(${rot} ${fx} ${fy})" fill="rgba(148,163,184,0.36)"/>`;
      return `<g transform="translate(${fx} ${fy}) rotate(${rot})">
        <ellipse cx="0" cy="0" rx="8.5" ry="11.5" fill="${fruitCol.fill}" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/>
        <!-- Escamas folhosas características da pitaia -->
        <path d="M-8,-2 L-12,-7 L-5,-5 Z M8,-2 L12,-7 L5,-5 Z M-7,5 L-11,1 L-4,2 Z M7,5 L11,1 L4,2 Z M0,-11 L-3,-16 L3,-16 Z" fill="${fruitCol.fin}" stroke="#14532D" stroke-width="0.5"/>
        <circle cx="-2.5" cy="-3" r="1.4" fill="rgba(255,255,255,0.45)"/>
      </g>`;
    };

    const fruits = `${drawDragonFruit(28, topY + 30, 14)}${drawDragonFruit(92, topY + 34, -14)}${drawDragonFruit(60, topY + 4, 0)}`;
    return { body: `${stake}${arms}${spines}${fruits}`, pot: pot(sil, 'ceramic'), fx: null, bio: false };
  }

  // =========================================================================
  // 8B. TOMATEIRO-CEREJA (Vermelho/Laranja/Amarelo · Grande/Cacho Cereja · Alto/Anão)
  // =========================================================================
  function renderTomate(ph, sil) {
    const tall = ph.height === 'alto';
    const cherry = ph.fruitSize === 'cereja';
    const topY = tall ? 28 : 66;
    const tCol = {
      vermelho: '#D1342F',
      laranja: '#E57A25',
      amarelo: '#E8C434',
    }[ph.color] || '#D1342F';

    const stake = `<line x1="60" y1="134" x2="60" y2="${topY}" stroke="${sil ? 'rgba(148,163,184,0.32)' : '#8C6239'}" stroke-width="2.6" stroke-linecap="round"/>`;
    const foliage = `
      <path d="M60,134 Q56,${(134 + topY) / 2} 60,${topY + 8}" fill="none" stroke="${sil ? 'rgba(148,163,184,0.42)' : '#2A7A4B'}" stroke-width="3.6"/>
      <path d="M60,${topY + 24} L36,${topY + 14} M60,${topY + 38} L86,${topY + 26} M60,${topY + 52} L34,${topY + 44}" stroke="${sil ? 'rgba(148,163,184,0.4)' : '#2A7A4B'}" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="36" cy="${topY + 12}" rx="13" ry="7" transform="rotate(-18 36 ${topY + 12})" fill="${sil ? 'rgba(148,163,184,0.22)' : '#2E8B57'}"/>
      <ellipse cx="84" cy="${topY + 24}" rx="13" ry="7" transform="rotate(18 84 ${topY + 24})" fill="${sil ? 'rgba(148,163,184,0.22)' : '#2E8B57'}"/>
      <ellipse cx="38" cy="${topY + 44}" rx="12" ry="6.5" transform="rotate(-12 38 ${topY + 44})" fill="${sil ? 'rgba(148,163,184,0.22)' : '#1E6B3E'}"/>
      <ellipse cx="78" cy="${topY + 50}" rx="12" ry="6.5" transform="rotate(14 78 ${topY + 50})" fill="${sil ? 'rgba(148,163,184,0.22)' : '#1E6B3E'}"/>`;

    let tomatoes = '';
    if (cherry) {
      // Cachos fartos de mini tomates cereja pendurados!
      const pts = [
        [36, topY + 24], [44, topY + 30], [37, topY + 36], [45, topY + 42],
        [78, topY + 34], [86, topY + 40], [79, topY + 46], [85, topY + 53], [60, topY + 20],
      ];
      tomatoes = pts.map(([tx, ty]) => sil
        ? `<circle cx="${tx}" cy="${ty}" r="4.3" fill="rgba(148,163,184,0.38)"/>`
        : `<g>
            <circle cx="${tx}" cy="${ty}" r="4.4" fill="${tCol}" stroke="rgba(0,0,0,0.28)" stroke-width="0.6"/>
            <circle cx="${tx - 1.3}" cy="${ty - 1.4}" r="1.1" fill="rgba(255,255,255,0.6)"/>
            <path d="M${tx - 2},${ty - 4.2} L${tx},${ty - 3} L${tx + 2},${ty - 4.2}" stroke="#166534" stroke-width="1" fill="none"/>
          </g>`
      ).join('');
    } else {
      // 3 tomates grandes robustos com cálice estrelado!
      const pts = [[40, topY + 30], [78, topY + 38], [56, topY + 56]];
      tomatoes = pts.map(([tx, ty]) => sil
        ? `<ellipse cx="${tx}" cy="${ty}" rx="9.5" ry="8.5" fill="rgba(148,163,184,0.38)"/>`
        : `<g>
            <ellipse cx="${tx}" cy="${ty}" rx="9.5" ry="8.4" fill="${tCol}" stroke="rgba(0,0,0,0.3)" stroke-width="0.75"/>
            <circle cx="${tx - 3}" cy="${ty - 2.4}" r="2" fill="rgba(255,255,255,0.52)"/>
            <path d="M${tx - 4},${ty - 8} L${tx},${ty - 6} L${tx + 4},${ty - 8} M${tx},${ty - 10} L${tx},${ty - 6}" stroke="#166534" stroke-width="1.4" stroke-linecap="round" fill="none"/>
          </g>`
      ).join('');
    }

    return { body: `${stake}${foliage}${tomatoes}`, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 5. CACTO-ESTRELA (Flor Magenta/Coral/Amarela · Com/Sem Espinhos · Colunar/Globoso)
  // =========================================================================
  function renderCacto(ph, sil) {
    const glob = ph.shape === 'globoso';
    const spiny = ph.spines === 'espinhoso';
    const flColor = {
      magenta: { outer: '#EC4899', inner: '#F9A8D4' },
      coral: { outer: '#FB7185', inner: '#FDBA74' },
      amarela: { outer: '#EAB308', inner: '#FEF08A' },
    }[ph.color] || { outer: '#EC4899', inner: '#F9A8D4' };

    const bodyFill = sil ? 'rgba(148,163,184,0.24)' : '#10B981';
    const ribStroke = sil ? 'rgba(148,163,184,0.45)' : '#065F46';

    let cactusBody = '';
    let flowerY = 44;
    let spinePts = [];

    if (glob) {
      flowerY = 74;
      cactusBody = `
        <ellipse cx="60" cy="108" rx="30" ry="27" fill="${bodyFill}" stroke="${ribStroke}" stroke-width="1.4"/>
        <path d="M60,81 L60,134 M47,84 Q42,108 48,132 M73,84 Q78,108 72,132 M36,92 Q32,108 38,124 M84,92 Q88,108 82,124" fill="none" stroke="${ribStroke}" stroke-width="1.15" opacity="0.72"/>`;
      spinePts = [[33, 100], [32, 114], [44, 92], [44, 110], [45, 124], [60, 94], [60, 112], [76, 92], [76, 110], [75, 124], [87, 100], [88, 114]];
    } else {
      flowerY = 42;
      cactusBody = `
        <path d="M46,104 L30,104 Q24,104 24,96 L24,78 Q24,70 31,70 Q38,70 38,78 L38,91 L46,91 Z" fill="${bodyFill}" stroke="${ribStroke}" stroke-width="1.3"/>
        <path d="M74,94 L90,94 Q96,94 96,86 L96,68 Q96,60 89,60 Q82,60 82,68 L82,81 L74,81 Z" fill="${bodyFill}" stroke="${ribStroke}" stroke-width="1.3"/>
        <rect x="46" y="44" width="28" height="92" rx="14" fill="${bodyFill}" stroke="${ribStroke}" stroke-width="1.4"/>
        <line x1="60" y1="46" x2="60" y2="134" stroke="${ribStroke}" stroke-width="1.2" opacity="0.7"/>
        <line x1="52" y1="49" x2="52" y2="134" stroke="${ribStroke}" stroke-width="1" opacity="0.55"/>
        <line x1="68" y1="49" x2="68" y2="134" stroke="${ribStroke}" stroke-width="1" opacity="0.55"/>`;
      spinePts = [[46, 58], [46, 74], [46, 92], [46, 114], [74, 58], [74, 74], [74, 98], [74, 116], [60, 66], [60, 88], [60, 110], [24, 78], [96, 68]];
    }

    const spines = spiny ? spinePts.map(([sx, sy]) =>
      `<g stroke="${sil ? 'rgba(203,213,225,0.55)' : '#FEF3C7'}" stroke-width="1.15" stroke-linecap="round">
        <line x1="${sx}" y1="${sy}" x2="${sx - 4}" y2="${sy - 3}"/>
        <line x1="${sx}" y1="${sy}" x2="${sx + 4}" y2="${sy - 3}"/>
        <line x1="${sx}" y1="${sy}" x2="${sx}" y2="${sy - 4.5}"/>
      </g>`
    ).join('') : '';

    const petals = Array.from({ length: 8 }, (_, i) =>
      `<ellipse cx="0" cy="-9" rx="4.2" ry="9.2" transform="rotate(${i * 45})" fill="${sil ? 'rgba(148,163,184,0.3)' : (i % 2 === 0 ? flColor.outer : flColor.inner)}" stroke="${sil ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.16)'}" stroke-width="0.6"/>`
    ).join('');
    const bloom = `<g transform="translate(60 ${flowerY})">${petals}<circle r="4.5" fill="${sil ? 'rgba(148,163,184,0.45)' : '#FEF08A'}"/></g>`;

    return { body: `${cactusBody}${spines}${bloom}`, pot: pot(sil, 'ceramic'), fx: null, bio: false };
  }

  // =========================================================================
  // 6. MILHO-DO-CAMPO (Zea mays — Roxo/Mesclado/Amarelo · Liso/Doce · Alto/Anão)
  // =========================================================================
  function renderMilho(ph, sil) {
    const tall = ph.height === 'alto';
    const sweet = ph.starch === 'doce';
    const topY = tall ? 24 : 58;
    const cobY = tall ? 66 : 82;
    const leafCol = sil ? 'rgba(148,163,184,0.22)' : '#16A34A';
    const stalkCol = sil ? 'rgba(148,163,184,0.4)' : '#22C55E';

    // Colmo, folhas arqueadas e pendão (flor masculina) no topo
    const stalk = `
      <path d="M56,134 L56,${topY + 12}" stroke="${stalkCol}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M56,${topY + 12} L50,${topY} M56,${topY + 12} L56,${topY - 2} M56,${topY + 12} L62,${topY + 1}" stroke="${sil ? 'rgba(148,163,184,0.4)' : '#FACC15'}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M56,${cobY + 34} C32,${cobY + 26} 18,${cobY + 36} 16,${cobY + 46} C28,${cobY + 40} 44,${cobY + 38} 56,${cobY + 40} Z" fill="${leafCol}"/>
      <path d="M56,${cobY + 18} C82,${cobY + 8} 98,${cobY + 18} 102,${cobY + 30} C88,${cobY + 22} 72,${cobY + 22} 56,${cobY + 26} Z" fill="${leafCol}"/>
      <path d="M56,${cobY - 4} C34,${cobY - 16} 22,${cobY - 8} 20,${cobY + 4} C32,${cobY - 2} 44,${cobY} 56,${cobY + 4} Z" fill="${leafCol}"/>`;

    // Espiga detalhada com fileiras de grãos (roxo / mesclado / amarelo + liso ou enrugado su1)
    const kernels = [];
    const cols = 4;
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const kx = 54 + c * 5.6;
        const ky = cobY - 12 + r * 6.2;
        let fill = 'rgba(148,163,184,0.34)';
        if (!sil) {
          if (ph.color === 'roxo') fill = (r + c) % 2 === 0 ? '#6B21A8' : '#7E22CE';
          else if (ph.color === 'amarelo') fill = (r + c) % 2 === 0 ? '#EAB308' : '#FACC15';
          else fill = ((r * 3 + c * 5) % 3 === 0) ? '#7E22CE' : (((r + c) % 2 === 0) ? '#FACC15' : '#9333EA');
        }
        // Grão doce enrugado (su1) tem recorte/dentadura característica
        const dimple = (!sil && sweet)
          ? `<path d="M${kx + 1.2},${ky + 2.4} Q${kx + 2.5},${ky + 3.6} ${kx + 3.8},${ky + 2.4}" stroke="rgba(0,0,0,0.45)" stroke-width="0.9" fill="none"/>`
          : `<circle cx="${kx + 1.8}" cy="${ky + 1.8}" r="0.9" fill="rgba(255,255,255,0.42)"/>`;
        kernels.push(`<rect x="${kx.toFixed(1)}" y="${ky.toFixed(1)}" width="5" height="5.4" rx="${sweet ? 1.2 : 2.3}" fill="${fill}" stroke="rgba(15,23,42,0.35)" stroke-width="0.55"/>${dimple}`);
      }
    }

    const cob = `<g transform="rotate(14 66 ${cobY + 8})">
      <!-- Cabelo do milho -->
      <path d="M62,${cobY - 16} Q65,${cobY - 26} 70,${cobY - 28} M66,${cobY - 15} Q72,${cobY - 24} 75,${cobY - 22}" stroke="${sil ? 'rgba(148,163,184,0.4)' : '#FDE68A'}" stroke-width="1.1" fill="none"/>
      <rect x="52.5" y="${cobY - 14}" width="25.5" height="41" rx="11" fill="${sil ? 'rgba(148,163,184,0.2)' : '#422006'}"/>
      ${kernels.join('')}
      <!-- Palha aberta nas laterais -->
      <path d="M52,${cobY + 28} C44,${cobY + 14} 44,${cobY - 6} 52,${cobY - 10} C49,${cobY + 4} 50,${cobY + 18} 58,${cobY + 28} Z" fill="${sil ? 'rgba(148,163,184,0.28)' : '#4ADE80'}" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#15803D'}" stroke-width="0.7"/>
      <path d="M78,${cobY + 28} C86,${cobY + 14} 86,${cobY - 4} 78,${cobY - 8} C81,${cobY + 4} 80,${cobY + 18} 72,${cobY + 28} Z" fill="${sil ? 'rgba(148,163,184,0.28)' : '#4ADE80'}" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#15803D'}" stroke-width="0.7"/>
    </g>`;

    return { body: `${stalk}${cob}`, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 7. SOJA-DE-CULTIVO (Glycine max — Flor Roxa/Lilás/Branca · Grão Amarelo/Verde · Vagem Peluda/Lisa)
  // =========================================================================
  function renderSoja(ph, sil) {
    const greenBean = ph.seedColor === 'verde';
    const hairy = ph.pod === 'peluda';
    const flColor = {
      roxa: '#7C3AED',
      lilas: '#C4B5FD',
      branca: '#F8FAFC',
    }[ph.color] || '#C4B5FD';

    const beanCol = sil ? 'rgba(148,163,184,0.4)' : (greenBean ? '#4ADE80' : '#FACC15');
    const podCol = sil ? 'rgba(148,163,184,0.25)' : '#15803D';

    const stemAndLeaves = `
      <path d="M60,134 Q56,96 60,52 M59,102 L38,82 M60,88 L82,70 M59,70 L42,52" fill="none" stroke="${sil ? 'rgba(148,163,184,0.42)' : '#16A34A'}" stroke-width="3.6" stroke-linecap="round"/>
      <ellipse cx="34" cy="76" rx="14" ry="8" transform="rotate(-24 34 76)" fill="${sil ? 'rgba(148,163,184,0.22)' : '#22C55E'}" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#14532D'}" stroke-width="0.8"/>
      <ellipse cx="86" cy="64" rx="14" ry="8" transform="rotate(24 86 64)" fill="${sil ? 'rgba(148,163,184,0.22)' : '#22C55E'}" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#14532D'}" stroke-width="0.8"/>
      <ellipse cx="44" cy="48" rx="12" ry="7" transform="rotate(-18 44 48)" fill="${sil ? 'rgba(148,163,184,0.22)' : '#16A34A'}" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#14532D'}" stroke-width="0.8"/>
      <ellipse cx="74" cy="44" rx="12" ry="7" transform="rotate(18 74 44)" fill="${sil ? 'rgba(148,163,184,0.22)' : '#16A34A'}" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#14532D'}" stroke-width="0.8"/>`;

    // Vagens com corte visual mostrando os grãos de soja + tricomas (pelugem) quando peluda
    const drawPod = (x, y, rot) => {
      const hairs = hairy ? `
        <g stroke="${sil ? 'rgba(203,213,225,0.45)' : '#FDE68A'}" stroke-width="1" stroke-linecap="round">
          <line x1="-10" y1="-6" x2="-13" y2="-9"/><line x1="-3" y1="-7" x2="-4" y2="-11"/>
          <line x1="4" y1="-7" x2="5" y2="-11"/><line x1="11" y1="-6" x2="14" y2="-9"/>
          <line x1="-8" y1="6" x2="-10" y2="10"/><line x1="0" y1="7" x2="0" y2="11"/>
          <line x1="8" y1="6" x2="10" y2="10"/>
        </g>` : '';
      return `<g transform="translate(${x} ${y}) rotate(${rot})">
        <path d="M-16,0 Q-12,-8 0,-7 Q12,-8 16,0 Q12,8 0,7 Q-12,8 -16,0 Z" fill="${podCol}" stroke="${sil ? 'rgba(148,163,184,0.5)' : '#86EFAC'}" stroke-width="0.9"/>
        <circle cx="-8" cy="0" r="4.1" fill="${beanCol}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>
        <circle cx="0" cy="0" r="4.3" fill="${beanCol}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>
        <circle cx="8" cy="0" r="4.1" fill="${beanCol}" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/>
        ${hairs}
      </g>`;
    };

    const flower = (x, y) => sil
      ? `<circle cx="${x}" cy="${y}" r="5.5" fill="rgba(148,163,184,0.34)"/>`
      : `<g transform="translate(${x} ${y})">
          <circle cx="-3.5" cy="-2" r="4.2" fill="${flColor}"/>
          <circle cx="3.5" cy="-2" r="4.2" fill="${flColor}"/>
          <circle cx="0" cy="2.5" r="3.8" fill="${flColor}"/>
          <circle cx="0" cy="0" r="2" fill="#FEF08A"/>
        </g>`;

    const body = `${stemAndLeaves}${drawPod(44, 102, 26)}${drawPod(78, 94, -22)}${drawPod(64, 72, 12)}${flower(58, 42)}${flower(36, 58)}${flower(80, 50)}`;
    return { body, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 8. ERVILHA-DE-MENDEL (Pisum sativum — Flor Púrpura/Lilás/Branca · Semente Amarela/Verde · Lisa/Rugosa)
  // =========================================================================
  function renderErvilha(ph, sil) {
    const greenSeed = ph.seedColor === 'verde';
    const wrinkled = ph.texture === 'rugosa';
    const flColor = {
      purpura: '#9333EA',
      lilas: '#D8B4FE',
      branca: '#F8FAFC',
    }[ph.color] || '#9333EA';
    const seedCol = sil ? 'rgba(148,163,184,0.4)' : (greenSeed ? '#22C55E' : '#FACC15');

    // Tutor de madeira + rama trepadeira com gavinhas
    const vine = `
      <line x1="60" y1="134" x2="60" y2="28" stroke="${sil ? 'rgba(148,163,184,0.32)' : '#92400E'}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M60,132 C46,118 74,104 54,88 C38,74 74,60 58,42" fill="none" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#22C55E'}" stroke-width="3" stroke-linecap="round"/>
      <path d="M44,82 C34,78 30,70 36,68 C40,67 38,73 34,72" fill="none" stroke="${sil ? 'rgba(148,163,184,0.4)' : '#4ADE80'}" stroke-width="1.3"/>
      <path d="M70,62 C82,58 86,50 80,48 C76,47 78,53 82,52" fill="none" stroke="${sil ? 'rgba(148,163,184,0.4)' : '#4ADE80'}" stroke-width="1.3"/>
      <ellipse cx="42" cy="108" rx="11" ry="6.5" transform="rotate(-20 42 108)" fill="${sil ? 'rgba(148,163,184,0.22)' : '#16A34A'}"/>
      <ellipse cx="78" cy="78" rx="11" ry="6.5" transform="rotate(20 78 78)" fill="${sil ? 'rgba(148,163,184,0.22)' : '#16A34A'}"/>`;

    // Vagem aberta em destaque exibindo 4 sementes lisas ou rugosas
    const seeds = [-12, -4, 4, 12].map(dx => {
      if (sil) return `<circle cx="${dx}" cy="0" r="3.8" fill="rgba(148,163,184,0.42)"/>`;
      if (wrinkled) {
        return `<g transform="translate(${dx} 0)">
          <path d="M-3.5,-1.5 L-2,-3.6 L0,-2.6 L2.2,-3.6 L3.6,-1.2 L2.6,1.2 L3.4,3 L0.8,3.6 L-1.6,2.8 L-3.6,2.2 Z" fill="${seedCol}" stroke="rgba(0,0,0,0.4)" stroke-width="0.65"/>
          <path d="M-1.5,-0.5 Q0,1.2 1.6,-0.4" stroke="rgba(0,0,0,0.38)" stroke-width="0.7" fill="none"/>
        </g>`;
      }
      return `<g transform="translate(${dx} 0)">
        <circle r="3.9" fill="${seedCol}" stroke="rgba(0,0,0,0.28)" stroke-width="0.6"/>
        <circle cx="-1.3" cy="-1.3" r="1.1" fill="rgba(255,255,255,0.6)"/>
      </g>`;
    }).join('');

    const pod = `<g transform="translate(64 96) rotate(-14)">
      <path d="M-21,0 C-16,-10 16,-10 21,0 C16,10 -16,10 -21,0 Z" fill="${sil ? 'rgba(148,163,184,0.24)' : '#15803D'}" stroke="${sil ? 'rgba(148,163,184,0.5)' : '#86EFAC'}" stroke-width="1"/>
      ${seeds}
    </g>`;

    const peaBloom = (x, y, sc = 1) => sil
      ? `<circle cx="${x}" cy="${y}" r="${7 * sc}" fill="rgba(148,163,184,0.3)"/>`
      : `<g transform="translate(${x} ${y}) scale(${sc})">
          <ellipse cx="0" cy="-5" rx="8" ry="6.5" fill="${flColor}" stroke="rgba(0,0,0,0.16)" stroke-width="0.6"/>
          <ellipse cx="-5" cy="2" rx="4.8" ry="4" fill="${flColor}" opacity="0.9"/>
          <ellipse cx="5" cy="2" rx="4.8" ry="4" fill="${flColor}" opacity="0.9"/>
          <circle cx="0" cy="1" r="2.2" fill="#FEF08A"/>
        </g>`;

    const body = `${vine}${pod}${peaBloom(58, 38, 1.05)}${peaBloom(42, 62, 0.85)}${peaBloom(76, 52, 0.82)}`;
    return { body, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 13. GIRASSOL-REAL (Ouro/Âmbar/Creme · Miolo Escuro/Esmeralda · Gigante/Anão)
  // =========================================================================
  function renderGirassol(ph, sil) {
    const tall = ph.height === 'gigante';
    const emerald = ph.center === 'esmeralda';
    const fy = tall ? 44 : 74;
    const pr = tall ? 25 : 21;
    const petalCol = sil ? 'rgba(148,163,184,0.34)' : ({ ouro: '#FACC15', ambar: '#F97316', creme: '#FEF3C7' }[ph.color] || '#FACC15');
    const petalBack = sil ? 'rgba(148,163,184,0.22)' : ({ ouro: '#CA8A04', ambar: '#C2410C', creme: '#E5D3A1' }[ph.color] || '#CA8A04');
    const centerCol = sil ? 'rgba(148,163,184,0.52)' : (emerald ? '#10B981' : '#451A03');
    const centerRing = sil ? 'rgba(148,163,184,0.35)' : (emerald ? '#A7F3D0' : '#92400E');

    const stem = `
      <path d="M60,134 Q${tall ? 56 : 58},${(134 + fy) / 2} 60,${fy + 10}" fill="none" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#16A34A'}" stroke-width="${tall ? 6.2 : 5.4}" stroke-linecap="round"/>
      <path d="M58,${tall ? 102 : 114} C36,${tall ? 94 : 108} 30,${tall ? 114 : 122} 57,${tall ? 114 : 124}" fill="${sil ? 'rgba(148,163,184,0.25)' : '#15803D'}"/>
      <path d="M62,${tall ? 88 : 106} C84,${tall ? 80 : 100} 90,${tall ? 100 : 114} 63,${tall ? 100 : 116}" fill="${sil ? 'rgba(148,163,184,0.25)' : '#22C55E'}"/>`;

    const backPetals = Array.from({ length: 12 }, (_, i) => {
      const a = i * 30 + 15;
      return `<ellipse cx="60" cy="${fy - pr}" rx="4.4" ry="11.5" fill="${petalBack}" transform="rotate(${a} 60 ${fy})"/>`;
    }).join('');
    const frontPetals = Array.from({ length: 12 }, (_, i) => {
      const a = i * 30;
      return `<ellipse cx="60" cy="${fy - pr}" rx="4.8" ry="12" fill="${petalCol}" stroke="${sil ? 'none' : 'rgba(120,53,15,0.22)'}" stroke-width="0.6" transform="rotate(${a} 60 ${fy})"/>`;
    }).join('');

    const seeds = !sil ? [-5, 0, 5].flatMap(dx => [-4, 4].map(dy => `<circle cx="${60 + dx}" cy="${fy + dy}" r="1.2" fill="${centerRing}"/>`)).join('') : '';
    const head = `${backPetals}${frontPetals}
      <circle cx="60" cy="${fy}" r="${tall ? 14 : 12}" fill="${centerCol}" stroke="${centerRing}" stroke-width="1.6"/>
      ${seeds}`;

    return { body: stem + head, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 14. ROSA-DO-JARDIM (Escarlate/Salmão/Marfim · Espinhos/Liso · Dobrada/Simples)
  // =========================================================================
  function renderRosa(ph, sil) {
    const thorny = ph.thorns === 'espinhos';
    const full = ph.petals === 'dobrada';
    const pal = {
      escarlate: ['#991B1B', '#DC2626', '#F87171'],
      salmao: ['#BE123C', '#FB7185', '#FDE2E4'],
      marfim: ['#CBD5E1', '#F8FAFC', '#FFFBEB'],
    }[ph.color] || ['#991B1B', '#DC2626', '#F87171'];
    const c1 = sil ? 'rgba(148,163,184,0.24)' : pal[0];
    const c2 = sil ? 'rgba(148,163,184,0.34)' : pal[1];
    const c3 = sil ? 'rgba(148,163,184,0.46)' : pal[2];

    const thorns = thorny ? `
      <polygon points="57,114 49,110 57,108" fill="${sil ? 'rgba(148,163,184,0.48)' : '#78350F'}"/>
      <polygon points="63,98 71,94 63,92" fill="${sil ? 'rgba(148,163,184,0.48)' : '#78350F'}"/>
      <polygon points="58,82 50,78 58,76" fill="${sil ? 'rgba(148,163,184,0.48)' : '#78350F'}"/>` : '';

    const stem = `
      <path d="M60,134 Q57,96 60,56" fill="none" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#15803D'}" stroke-width="4.6" stroke-linecap="round"/>
      ${thorns}
      <ellipse cx="42" cy="100" rx="12" ry="6.5" transform="rotate(-24 42 100)" fill="${sil ? 'rgba(148,163,184,0.25)' : '#16A34A'}"/>
      <ellipse cx="78" cy="86" rx="12" ry="6.5" transform="rotate(24 78 86)" fill="${sil ? 'rgba(148,163,184,0.25)' : '#22C55E'}"/>
      <path d="M48,66 Q60,74 72,66 L60,76 Z" fill="${sil ? 'rgba(148,163,184,0.34)' : '#15803D'}"/>`;

    const roseHead = full
      ? `<g transform="translate(60 50)">
          <circle cx="-12" cy="4" r="11" fill="${c1}"/><circle cx="12" cy="4" r="11" fill="${c1}"/>
          <circle cx="0" cy="-9" r="12" fill="${c1}"/><circle cx="0" cy="7" r="12" fill="${c2}"/>
          <circle cx="-8" cy="-3" r="9.5" fill="${c2}"/><circle cx="8" cy="-3" r="9.5" fill="${c2}"/>
          <circle cx="0" cy="0" r="8" fill="${c3}"/>
          <path d="M-4,-1 C-4,-6 4,-6 4,0 C4,5 -5,5 -5,-1 C-5,-8 6,-8 7,1" fill="none" stroke="${c1}" stroke-width="1.6" stroke-linecap="round"/>
        </g>`
      : `<g transform="translate(60 52)">
          ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-11" rx="8.5" ry="10.5" fill="${c2}" stroke="${c1}" stroke-width="0.7" transform="rotate(${a})"/>`).join('')}
          <circle r="5.5" fill="${sil ? 'rgba(148,163,184,0.48)' : '#F59E0B'}"/>
        </g>`;

    return { body: stem + roseHead, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 15. MORANGUEIRO-DOCE (Rubro/Rosado/Branco-Abacaxi · Graúdo/Silvestre · Verde/Variegada)
  // =========================================================================
  function renderMorango(ph, sil) {
    const big = ph.fruitSize === 'graudo';
    const varieg = ph.foliage === 'variegada';
    const berryCol = sil ? 'rgba(148,163,184,0.4)' : ({ rubro: '#E11D48', rosado: '#FDA4AF', branco: '#FEF9C3' }[ph.color] || '#E11D48');
    const seedCol = sil ? 'rgba(203,213,225,0.4)' : (ph.color === 'branco' ? '#DC2626' : '#FEF08A');
    const leafCol = sil ? 'rgba(148,163,184,0.24)' : (varieg ? '#86EFAC' : '#16A34A');
    const leafEdge = sil ? 'rgba(148,163,184,0.42)' : (varieg ? '#FEF08A' : '#14532D');

    const leaves = `
      <path d="M60,132 Q42,108 32,88 M60,132 Q60,104 60,76 M60,132 Q78,108 88,88" fill="none" stroke="${sil ? 'rgba(148,163,184,0.4)' : '#15803D'}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="32" cy="84" rx="14" ry="9" transform="rotate(-24 32 84)" fill="${leafCol}" stroke="${leafEdge}" stroke-width="1.4"/>
      <ellipse cx="60" cy="70" rx="15" ry="10" fill="${leafCol}" stroke="${leafEdge}" stroke-width="1.4"/>
      <ellipse cx="88" cy="84" rx="14" ry="9" transform="rotate(24 88 84)" fill="${leafCol}" stroke="${leafEdge}" stroke-width="1.4"/>
      <circle cx="48" cy="64" r="4.5" fill="${sil ? 'rgba(148,163,184,0.34)' : '#FFFFFF'}"/><circle cx="48" cy="64" r="1.8" fill="#FACC15"/>
      <circle cx="74" cy="62" r="4" fill="${sil ? 'rgba(148,163,184,0.34)' : '#FFFFFF'}"/><circle cx="74" cy="62" r="1.6" fill="#FACC15"/>`;

    const drawBerry = (x, y, sc, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
      <path d="M-9,-7 C-11,2 -4,12 0,13 C4,12 11,2 9,-7 C6,-10 -6,-10 -9,-7 Z" fill="${berryCol}" stroke="rgba(0,0,0,0.2)" stroke-width="0.7"/>
      <path d="M-7,-8 L-3,-4 L0,-9 L3,-4 L7,-8 L0,-11 Z" fill="${sil ? 'rgba(148,163,184,0.45)' : '#15803D'}"/>
      <circle cx="-4" cy="-1" r="1" fill="${seedCol}"/><circle cx="3.5" cy="-1" r="1" fill="${seedCol}"/>
      <circle cx="0" cy="3" r="1" fill="${seedCol}"/><circle cx="-2.5" cy="7" r="0.9" fill="${seedCol}"/><circle cx="2.5" cy="7" r="0.9" fill="${seedCol}"/>
    </g>`;

    const berries = big
      ? `${drawBerry(42, 110, 1.12, 10)}${drawBerry(78, 108, 1.12, -12)}${drawBerry(60, 102, 1.05, 2)}`
      : `${drawBerry(34, 110, 0.72, 14)}${drawBerry(50, 100, 0.72, -6)}${drawBerry(68, 102, 0.72, 8)}${drawBerry(84, 110, 0.72, -14)}${drawBerry(60, 118, 0.68, 0)}`;

    return { body: leaves + berries, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // 16. DIONEIA-CARNÍVORA (Rubi/Coral/Lima · Dentes Longos/Borda Lisa · Luminescente)
  // =========================================================================
  function renderDioneia(ph, sil) {
    const teeth = ph.teeth === 'longos';
    const bio = ph.glow === 'luminescente';
    const mouthCol = sil ? 'rgba(148,163,184,0.42)' : ({ rubi: '#BE123C', coral: '#FB7185', marfim: '#FEF3C7' }[ph.color] || '#BE123C');
    const outerCol = sil ? 'rgba(148,163,184,0.28)' : '#22C55E';

    const drawTrap = (x, y, rot, sc = 1) => {
      const spikes = teeth ? `
        <g stroke="${sil ? 'rgba(203,213,225,0.5)' : '#BEF264'}" stroke-width="1.4" stroke-linecap="round">
          <line x1="-12" y1="-5" x2="-15" y2="-13"/><line x1="-6" y1="-8" x2="-7" y2="-16"/>
          <line x1="0" y1="-9" x2="0" y2="-17"/><line x1="6" y1="-8" x2="7" y2="-16"/>
          <line x1="12" y1="-5" x2="15" y2="-13"/>
        </g>` : '';
      return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})">
        <path d="M-16,2 C-16,-11 16,-11 16,2 C10,12 -10,12 -16,2 Z" fill="${outerCol}" stroke="${sil ? 'rgba(148,163,184,0.5)' : '#14532D'}" stroke-width="1"/>
        <ellipse cx="0" cy="-1" rx="12.5" ry="6.2" fill="${mouthCol}"/>
        ${spikes}
      </g>`;
    };

    const body = `
      <path d="M60,134 Q42,108 38,76 M60,134 Q60,100 60,54 M60,134 Q78,108 82,76" fill="none" stroke="${sil ? 'rgba(148,163,184,0.42)' : '#16A34A'}" stroke-width="5.2" stroke-linecap="round"/>
      ${drawTrap(36, 72, -26, 0.92)}
      ${drawTrap(84, 72, 26, 0.92)}
      ${drawTrap(60, 50, 0, 1.12)}`;

    const fx = (!sil && bio) ? auraEffects(60, 62, '#A3E635') : null;
    return { body, pot: pot(sil, 'soil'), fx, bio };
  }

  // =========================================================================
  // 17. SUCULENTA-LÓTUS (Ametista/Rosa-Quartzo/Jade · Aberta/Fechada · Orvalho Cristalino)
  // =========================================================================
  function renderSuculenta(ph, sil) {
    const open = ph.rosette === 'aberta';
    const crystal = ph.dew === 'cristal';
    const pal = {
      ametista: ['#6B21A8', '#9333EA', '#D8B4FE'],
      safira: ['#1D4ED8', '#3B82F6', '#BFDBFE'],
      jade: ['#0F766E', '#14B8A6', '#99F6E4'],
    }[ph.color] || ['#0F766E', '#14B8A6', '#99F6E4'];
    const c1 = sil ? 'rgba(148,163,184,0.22)' : pal[0];
    const c2 = sil ? 'rgba(148,163,184,0.34)' : pal[1];
    const c3 = sil ? 'rgba(148,163,184,0.46)' : pal[2];

    const cy = 104;
    const spread = open ? 1.12 : 0.82;
    const outer = Array.from({ length: 8 }, (_, i) => {
      const a = i * 45;
      return `<ellipse cx="60" cy="${cy - 22 * spread}" rx="${11 * spread}" ry="${17 * spread}" fill="${c1}" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" transform="rotate(${a} 60 ${cy})"/>`;
    }).join('');
    const mid = Array.from({ length: 8 }, (_, i) => {
      const a = i * 45 + 22.5;
      return `<ellipse cx="60" cy="${cy - 14 * spread}" rx="${8.5 * spread}" ry="${13 * spread}" fill="${c2}" stroke="rgba(255,255,255,0.26)" stroke-width="0.7" transform="rotate(${a} 60 ${cy})"/>`;
    }).join('');
    const inner = Array.from({ length: 6 }, (_, i) => {
      const a = i * 60;
      return `<ellipse cx="60" cy="${cy - 7 * spread}" rx="6" ry="9" fill="${c3}" transform="rotate(${a} 60 ${cy})"/>`;
    }).join('');
    const dew = (!sil && crystal)
      ? `<g fill="#FFFFFF" opacity="0.92"><circle cx="44" cy="96" r="2.2"/><circle cx="76" cy="94" r="2"/><circle cx="60" cy="82" r="2.4"/><circle cx="52" cy="112" r="1.8"/><circle cx="70" cy="114" r="1.8"/></g>`
      : '';

    return { body: outer + mid + inner + `<circle cx="60" cy="${cy}" r="5.5" fill="${c3}"/>` + dew, pot: pot(sil, 'sand'), fx: null, bio: false };
  }

  // =========================================================================
  // 18. PIMENTEIRA-ORNAMENTAL (Vermelha/Laranja/Roxa · Alongada/Biquinho · Verde/Variegada)
  // =========================================================================
  function renderPimenta(ph, sil) {
    const longShape = ph.shape === 'alongada';
    const varieg = ph.foliage === 'variegada';
    const pepCol = sil ? 'rgba(148,163,184,0.44)' : ({ vermelha: '#DC2626', laranja: '#F97316', amarela: '#FACC15' }[ph.color] || '#DC2626');
    const leafCol = sil ? 'rgba(148,163,184,0.24)' : (varieg ? '#86EFAC' : '#15803D');
    const leafStroke = sil ? 'rgba(148,163,184,0.42)' : (varieg ? '#FEF08A' : '#14532D');

    const bush = `
      <path d="M60,134 L60,64 M60,104 L38,76 M60,96 L82,70" fill="none" stroke="${sil ? 'rgba(148,163,184,0.45)' : '#78350F'}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="36" cy="78" rx="14" ry="8" transform="rotate(-20 36 78)" fill="${leafCol}" stroke="${leafStroke}" stroke-width="1.3"/>
      <ellipse cx="84" cy="72" rx="14" ry="8" transform="rotate(20 84 72)" fill="${leafCol}" stroke="${leafStroke}" stroke-width="1.3"/>
      <ellipse cx="52" cy="58" rx="13" ry="7.5" transform="rotate(-12 52 58)" fill="${leafCol}" stroke="${leafStroke}" stroke-width="1.3"/>
      <ellipse cx="70" cy="56" rx="13" ry="7.5" transform="rotate(14 70 56)" fill="${leafCol}" stroke="${leafStroke}" stroke-width="1.3"/>
      <ellipse cx="60" cy="84" rx="15" ry="8.5" fill="${leafCol}" stroke="${leafStroke}" stroke-width="1.3"/>`;

    const drawPepper = (x, y, rot) => longShape
      ? `<g transform="translate(${x} ${y}) rotate(${rot})">
          <path d="M-3,-8 C-6,0 -4,11 2,16 C5,10 6,-2 3,-8 Z" fill="${pepCol}" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
          <path d="M-3,-8 Q0,-12 3,-8" fill="none" stroke="#15803D" stroke-width="2"/>
        </g>`
      : `<g transform="translate(${x} ${y}) rotate(${rot})">
          <path d="M-6,-4 C-8,4 -2,8 0,11 C2,8 8,4 6,-4 C4,-8 -4,-8 -6,-4 Z" fill="${pepCol}" stroke="rgba(0,0,0,0.22)" stroke-width="0.7"/>
          <line x1="0" y1="-7" x2="0" y2="-11" stroke="#15803D" stroke-width="1.8"/>
        </g>`;

    const peppers = `${drawPepper(38, 92, 14)}${drawPepper(60, 74, -6)}${drawPepper(80, 88, -16)}${drawPepper(50, 98, -10)}${drawPepper(70, 62, 12)}`;
    return { body: bush + peppers, pot: pot(sil, 'soil'), fx: null, bio: false };
  }

  // =========================================================================
  // RENDERIZADOR UNIVERSAL MULTI-ESPÉCIES
  // =========================================================================
  function renderSpecies(speciesId, genotype, opts = {}) {
    const spId = speciesId || 'flor_mendel';
    const ph = Genetics.phenotypeFor(spId, genotype);
    const sil = !!opts.silhouette;

    const map = {
      flor_mendel: renderFlorMendel,
      orquidea: renderOrquidea,
      tulipa: renderTulipa,
      cerejeira: renderCerejeira,
      macieira: renderMacieira,
      laranjeira: renderLaranjeira,
      cacto: renderCacto,
      pitaia: renderPitaia,
      milho: renderMilho,
      soja: renderSoja,
      ervilha: renderErvilha,
      tomate: renderTomate,
      girassol: renderGirassol,
      rosa: renderRosa,
      morango: renderMorango,
      dioneia: renderDioneia,
      suculenta: renderSuculenta,
      pimenta: renderPimenta,
    };
    const drawFn = map[spId] || renderFlorMendel;
    const parts = drawFn(ph, sil);
    const sp = Genetics.getSpecies(spId);
    const label = sil
      ? `${sp.name} — variedade não catalogada`
      : (opts.title || `${sp.name}: ${Genetics.phenoLabelFor(spId, ph, ', ')}`);

    return `<svg class="plant-art-graphic sp-${spId} ${parts.bio && !sil ? 'is-bio' : ''} ${sil ? 'is-sil' : ''} ${opts.cls || ''}" viewBox="0 0 120 172" role="img" aria-label="${label}">
      <title>${label}</title>
      ${parts.fx ? parts.fx.halo : ''}
      <g class="${sil ? '' : 'plant-sway'}">
        ${parts.body}
      </g>
      ${parts.pot}
      ${parts.fx ? parts.fx.soil + parts.fx.spores : ''}
    </svg>`;
  }

  // Retrocompatibilidade com Estufa clássica
  function render(genotype, opts = {}) {
    return renderSpecies(opts.speciesId || 'flor_mendel', genotype, opts);
  }

  return { render, renderSpecies };
})();
