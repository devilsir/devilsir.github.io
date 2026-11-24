'use strict';
/**
 * svg-portrait.js — Prancheta de Retrato Falado e Heredogramas Clássicos de Genética.
 * Suporta renderização facial para 12 traços visuais (incluindo tom de pele poligênico,
 * cor dos olhos, cor e textura do cabelo, sobrancelhas, calvície e epistasia de albinismo)
 * e heredogramas com simbologia padrão (□ ○ ■ ● ◧ ◐ ⊙ ↗) e legenda inferior contextual.
 */
const PortraitBoard = (() => {
  const PALETTE = {
    typical: {
      hairBase: '#2C231D',
      hairMid: '#3B2F27',
      hairStroke: '#17120F',
      hairHi: 'rgba(225, 200, 168, 0.28)',
      skinTop: '#EDD0B2',
      skinMid: '#E0BA96',
      skinBot: '#CCA07A',
      skinStroke: '#593F2D',
      earInner: '#9D7458',
      brow: '#2C221B',
      lips: '#8C4E42',
      freckle: '#864829',
    },
    albino: {
      hairBase: '#EBE5D8',
      hairMid: '#F4EFE4',
      hairStroke: '#8F877A',
      hairHi: 'rgba(255, 255, 255, 0.65)',
      skinTop: '#FBF5EC',
      skinMid: '#F5EBDC',
      skinBot: '#E8DAC6',
      skinStroke: '#8E7D6B',
      earInner: '#B8A592',
      brow: '#CFC6B6',
      lips: '#BA8880',
      freckle: 'transparent',
    },
  };

  const SKIN_TONES = {
    clara: {
      skinTop: '#FCE4D0',
      skinMid: '#F3D2B6',
      skinBot: '#DFB695',
      skinStroke: '#7A5942',
      earInner: '#B4886B',
      lips: '#B36961',
      freckle: '#9E5A38',
    },
    morena_clara: {
      skinTop: '#EDD0B2',
      skinMid: '#E0BA96',
      skinBot: '#CCA07A',
      skinStroke: '#593F2D',
      earInner: '#9D7458',
      lips: '#945247',
      freckle: '#864829',
    },
    morena_media: {
      skinTop: '#D3A378',
      skinMid: '#C08A5E',
      skinBot: '#A67047',
      skinStroke: '#4D3220',
      earInner: '#825334',
      lips: '#7C423A',
      freckle: '#6E3B20',
    },
    morena_escura: {
      skinTop: '#A46E47',
      skinMid: '#8F5A36',
      skinBot: '#744526',
      skinStroke: '#382012',
      earInner: '#5E351D',
      lips: '#63332C',
      freckle: '#4E2614',
    },
    retinta: {
      skinTop: '#71462D',
      skinMid: '#5B3620',
      skinBot: '#462615',
      skinStroke: '#241209',
      earInner: '#3E2011',
      lips: '#4E2620',
      freckle: '#32160A',
    },
  };

  const HAIR_COLORS = {
    escuro: {
      hairBase: '#2C231D',
      hairMid: '#3B2F27',
      hairStroke: '#17120F',
      hairHi: 'rgba(225, 200, 168, 0.28)',
      brow: '#2C221B',
    },
    loiro: {
      hairBase: '#D6AE52',
      hairMid: '#E3BF6A',
      hairStroke: '#785B1E',
      hairHi: 'rgba(255, 246, 208, 0.56)',
      brow: '#96742C',
    },
    ruivo: {
      hairBase: '#A64222',
      hairMid: '#C25832',
      hairStroke: '#59200E',
      hairHi: 'rgba(255, 204, 162, 0.42)',
      brow: '#833319',
    },
  };

  const IRIS_COLORS = {
    castanho: '#5B3921',
    verde: '#3F7852',
    azul: '#3E79A8',
    albino: '#9CB0C4',
  };

  function hairBack(texture, pal, sex, isBald) {
    const isF = sex === 'F';
    if (isBald) {
      if (isF) {
        return `<g class="hair-back hair-bald-f">
          <path d="M84,126 C81,148 80,178 86,210 L102,210 L102,130 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.6"/>
          <path d="M196,126 C199,148 200,178 194,210 L178,210 L178,130 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.6"/>
        </g>`;
      }
      return `<g class="hair-back hair-bald-m">
        <path d="M84,122 C80,136 81,152 88,162 L96,158 L95,122 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.5"/>
        <path d="M196,122 C200,136 199,152 192,162 L184,158 L185,122 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.5"/>
      </g>`;
    }
    const lenY = isF ? 242 : 216;
    if (texture === 'cacheado') {
      return `<g class="hair-back">
        <path d="M74,136 C56,126 52,96 66,78 C68,52 92,36 118,36 C130,26 152,26 164,36 C190,36 212,52 214,78 C228,96 224,126 206,136
                 C218,154 218,186 200,200 C198,218 184,230 168,224 L112,224 C96,230 82,218 80,200 C62,186 62,154 74,136 Z"
              fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="2"/>
        <g fill="${pal.hairMid}" stroke="${pal.hairStroke}" stroke-width="1.3">
          <circle cx="72" cy="106" r="14"/><circle cx="208" cy="106" r="14"/>
          <circle cx="80" cy="74" r="15"/><circle cx="200" cy="74" r="15"/>
          <circle cx="105" cy="52" r="16"/><circle cx="175" cy="52" r="16"/>
          <circle cx="140" cy="44" r="17"/>
          <circle cx="76" cy="184" r="12"/><circle cx="204" cy="184" r="12"/>
          ${isF ? '<circle cx="84" cy="212" r="13"/><circle cx="196" cy="212" r="13"/>' : ''}
        </g>
        <g fill="none" stroke="${pal.hairHi}" stroke-width="1.6" stroke-linecap="round">
          <path d="M75,71 C80,65 87,67 86,74"/>
          <path d="M103,48 C109,42 116,46 113,53"/>
          <path d="M135,40 C143,35 150,41 145,48"/>
          <path d="M169,48 C176,43 183,48 179,55"/>
          <path d="M196,71 C202,67 207,73 203,79"/>
        </g>
      </g>`;
    }
    if (texture === 'ondulado') {
      return `<g class="hair-back">
        <path d="M78,136 C68,104 72,60 104,44 C125,34 155,34 176,44 C208,60 212,104 202,136
                 C210,156 204,176 210,${lenY - 18} C213,${lenY} 200,${lenY + 12} 182,${lenY + 12}
                 L98,${lenY + 12} C80,${lenY + 12} 67,${lenY} 70,${lenY - 18} C76,176 70,156 78,136 Z"
              fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="2"/>
        <g fill="none" stroke="${pal.hairHi}" stroke-width="1.8" stroke-linecap="round">
          <path d="M84,74 Q74,98 84,122 Q74,154 84,186 Q76,204 88,216"/>
          <path d="M196,74 Q206,98 196,122 Q206,154 196,186 Q204,204 192,216"/>
        </g>
      </g>`;
    }
    return `<g class="hair-back">
      <path d="M82,126 C80,82 92,46 140,44 C188,46 200,82 198,126 L204,${lenY} L76,${lenY} Z"
            fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="2"/>
      <g fill="none" stroke="${pal.hairHi}" stroke-width="1.6" stroke-linecap="round">
        <line x1="90" y1="68" x2="84" y2="${lenY - 8}"/>
        <line x1="99" y1="58" x2="94" y2="${lenY - 8}"/>
        <line x1="190" y1="68" x2="196" y2="${lenY - 8}"/>
        <line x1="181" y1="58" x2="186" y2="${lenY - 8}"/>
      </g>
    </g>`;
  }

  function ears(earlobe, pal) {
    if (earlobe === 'solto') {
      return `<g class="ears">
        <path d="M89,144 C73,138 69,162 74,179 C76,192 84,197 90,193 C94,190 94,185 93,181"
              fill="${pal.skinMid}" stroke="${pal.skinStroke}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M85,152 C78,153 77,166 82,176 C84,180 88,181 89,178" fill="none" stroke="${pal.earInner}" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M191,144 C207,138 211,162 206,179 C204,192 196,197 190,193 C186,190 186,185 187,181"
              fill="${pal.skinMid}" stroke="${pal.skinStroke}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M195,152 C202,153 203,166 198,176 C196,180 192,181 191,178" fill="none" stroke="${pal.earInner}" stroke-width="1.5" stroke-linecap="round"/>
      </g>`;
    }
    return `<g class="ears">
      <path d="M89,144 C74,139 71,160 77,173 L93,183" fill="${pal.skinMid}" stroke="${pal.skinStroke}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M85,152 C79,153 79,165 86,172" fill="none" stroke="${pal.earInner}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M191,144 C206,139 209,160 203,173 L187,183" fill="${pal.skinMid}" stroke="${pal.skinStroke}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M195,152 C201,153 201,165 194,172" fill="none" stroke="${pal.earInner}" stroke-width="1.5" stroke-linecap="round"/>
    </g>`;
  }

  function hairFront(hairline, texture, pal, sex, isBald) {
    if (isBald) {
      if (sex === 'F') {
        return `<g class="hair-front hair-bald-f">
          <path d="M88,136 C89,112 98,94 114,91 C106,104 100,118 96,138 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.4"/>
          <path d="M192,136 C191,112 182,94 166,91 C174,104 180,118 184,138 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.4"/>
          <path d="M108,87 Q140,78 172,87" fill="none" stroke="${pal.hairBase}" stroke-width="2.4" stroke-dasharray="6 4" opacity="0.55" stroke-linecap="round"/>
          <ellipse cx="132" cy="98" rx="15" ry="5.5" transform="rotate(-8 132 98)" fill="rgba(255,255,255,0.20)"/>
        </g>`;
      }
      return `<g class="hair-front hair-bald-m">
        <path d="M88,144 C85,127 89,114 96,113 C95,125 94,135 92,147 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M192,144 C195,127 191,114 184,113 C185,125 186,135 188,147 Z" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.4" stroke-linejoin="round"/>
        <ellipse cx="127" cy="99" rx="16" ry="6.2" transform="rotate(-14 127 99)" fill="rgba(255,255,255,0.24)"/>
        <ellipse cx="147" cy="94" rx="7" ry="2.6" transform="rotate(-6 147 94)" fill="rgba(255,255,255,0.16)"/>
      </g>`;
    }
    const frontEdge = hairline === 'pico'
      ? 'M88,136 C89,108 102,94 123,97 C132,98 137,108 140,119 C143,108 148,98 157,97 C178,94 191,108 192,136'
      : 'M88,136 C89,106 100,98 140,98 C180,98 191,106 192,136';
    const crownTop = 'C196,94 188,58 164,51 C150,45 130,45 116,51 C92,58 84,94 88,136 Z';
    const detail = texture === 'cacheado'
      ? `<g fill="none" stroke="${pal.hairHi}" stroke-width="1.5" stroke-linecap="round">
          <path d="M104,76 C109,68 118,69 116,78"/><path d="M131,67 C137,60 146,62 143,72"/><path d="M158,72 C164,66 173,69 170,78"/>
        </g>`
      : texture === 'ondulado'
        ? `<g fill="none" stroke="${pal.hairHi}" stroke-width="1.6" stroke-linecap="round"><path d="M98,91 Q118,74 140,80 Q162,74 182,91"/></g>`
        : `<g fill="none" stroke="${pal.hairHi}" stroke-width="1.4" stroke-linecap="round">
            <path d="M140,56 L140,94"/><path d="M120,60 L114,94"/><path d="M160,60 L166,94"/>
          </g>`;
    return `<g class="hair-front"><path d="${frontEdge} ${crownTop}" fill="${pal.hairBase}" stroke="${pal.hairStroke}" stroke-width="1.9" stroke-linejoin="round"/>${detail}</g>`;
  }

  function eyebrowsLayer(eyebrowShape, pal, sex) {
    if (eyebrowShape === 'espessas') {
      return `<g class="eyebrows">
        <path d="M102,138 C108,131 121,129 132,134 C131,139 120,137 104,140 Z" fill="${pal.brow}" stroke="${pal.brow}" stroke-width="1.1" stroke-linejoin="round"/>
        <path d="M178,138 C172,131 159,129 148,134 C149,139 160,137 176,140 Z" fill="${pal.brow}" stroke="${pal.brow}" stroke-width="1.1" stroke-linejoin="round"/>
      </g>`;
    }
    if (eyebrowShape === 'finas') {
      return `<g class="eyebrows">
        <path d="M105,137 Q117,132 130,136" fill="none" stroke="${pal.brow}" stroke-width="1.55" stroke-linecap="round"/>
        <path d="M150,136 Q163,132 175,137" fill="none" stroke="${pal.brow}" stroke-width="1.55" stroke-linecap="round"/>
      </g>`;
    }
    const w = sex === 'F' ? 2.5 : 3.2;
    return `<g class="eyebrows">
      <path d="M104,137 Q117,131 130,136" fill="none" stroke="${pal.brow}" stroke-width="${w}" stroke-linecap="round"/>
      <path d="M150,136 Q163,131 176,137" fill="none" stroke="${pal.brow}" stroke-width="${w}" stroke-linecap="round"/>
    </g>`;
  }

  function lipsLayer(lipWidth, pal) {
    if (lipWidth === 'largos') {
      return `<g class="lips">
        <path d="M120,196 Q130,189 140,192 Q150,189 160,196 Q140,200 120,196 Z" fill="${pal.lips}" opacity="0.72" stroke="${pal.lips}" stroke-width="1.2"/>
        <path d="M121,196 Q140,208 159,196 Q140,199 121,196 Z" fill="${pal.lips}" opacity="0.58" stroke="${pal.lips}" stroke-width="1.3"/>
      </g>`;
    }
    if (lipWidth === 'medios') {
      return `<g class="lips">
        <path d="M123,196 Q132,192 140,194 Q148,192 157,196 Q140,198 123,196 Z" fill="${pal.lips}" opacity="0.55" stroke="${pal.lips}" stroke-width="1.2"/>
        <path d="M124,196 Q140,204 156,196" fill="none" stroke="${pal.lips}" stroke-width="1.8" stroke-linecap="round"/>
      </g>`;
    }
    return `<g class="lips"><path d="M125,196 Q140,200 155,196" fill="none" stroke="${pal.lips}" stroke-width="2" stroke-linecap="round"/></g>`;
  }

  function dimplesLayer(hasDimples, pal) {
    if (!hasDimples) return '';
    return `<g class="dimples" fill="none" stroke="${pal.earInner}" stroke-linecap="round">
      <path d="M111,190 C108,196 109,202 113,205" stroke-width="2"/>
      <path d="M169,190 C172,196 171,202 167,205" stroke-width="2"/>
      <ellipse cx="111" cy="197" rx="3" ry="5" fill="rgba(90,60,40,0.12)" stroke="none"/>
      <ellipse cx="169" cy="197" rx="3" ry="5" fill="rgba(90,60,40,0.12)" stroke="none"/>
    </g>`;
  }

  function cleftChinLayer(hasCleft, pal) {
    if (!hasCleft) return '';
    return `<g class="cleft-chin">
      <path d="M140,221 L140,231" stroke="${pal.skinStroke}" stroke-width="2.1" stroke-linecap="round"/>
      <path d="M136,227 Q140,232 144,227" fill="none" stroke="${pal.earInner}" stroke-width="1.4" stroke-linecap="round"/>
    </g>`;
  }

  function frecklesLayer(hasFreckles, isAlbino, pal) {
    if (!hasFreckles || isAlbino) return '';
    const dots = [
      [108, 168, 1.4], [114, 173, 1.2], [103, 175, 1.1], [119, 169, 1.3], [111, 179, 1.0],
      [126, 167, 1.1], [134, 164, 1.2], [140, 162, 1.3], [146, 164, 1.2], [154, 167, 1.1],
      [161, 169, 1.3], [166, 173, 1.2], [172, 168, 1.4], [177, 175, 1.1], [169, 179, 1.0],
      [121, 176, 1.1], [159, 176, 1.1],
    ];
    return `<g class="freckles" fill="${pal.freckle}" opacity="0.80">${dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
  }

  function render(traits = {}, opts = {}) {
    const isAlbino = traits.albinism === 'albino';
    const skinOverride = !isAlbino && traits.skinTone && SKIN_TONES[traits.skinTone] ? SKIN_TONES[traits.skinTone] : null;
    const hairOverride = !isAlbino && traits.hairColor && HAIR_COLORS[traits.hairColor] ? HAIR_COLORS[traits.hairColor] : null;
    const pal = isAlbino
      ? PALETTE.albino
      : { ...PALETTE.typical, ...(skinOverride || {}), ...(hairOverride || {}) };
    const sex = opts.sex || 'M';
    const isBald = traits.baldness === 'calvo';
    const t = {
      earlobe: traits.earlobe || 'solto',
      hairline: traits.hairline || 'reta',
      dimples: traits.dimples || 'ausentes',
      cleftChin: traits.cleftChin || 'ausente',
      freckles: traits.freckles || 'ausentes',
      hairTexture: traits.hairTexture || 'liso',
      lipWidth: traits.lipWidth || 'medios',
      eyeColor: traits.eyeColor || 'castanho',
      eyebrowShape: traits.eyebrowShape || null,
    };
    const irisHex = isAlbino ? IRIS_COLORS.albino : (IRIS_COLORS[t.eyeColor] || IRIS_COLORS.castanho);
    const code = opts.code || 'PRANCHETA PERICIAL';
    const uid = opts.uid || 'p0';

    return `<svg class="portrait-graphic ${opts.pulse ? 'pulse-update' : ''}" viewBox="0 0 280 326" role="img" aria-label="Retrato falado do investigado">
      <defs>
        <radialGradient id="paperBg-${uid}" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stop-color="#F5EFE1"/><stop offset="72%" stop-color="#E8DEC9"/><stop offset="100%" stop-color="#D7C8AE"/>
        </radialGradient>
        <linearGradient id="skin-${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${pal.skinTop}"/><stop offset="65%" stop-color="${pal.skinMid}"/><stop offset="100%" stop-color="${pal.skinBot}"/>
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="274" height="320" rx="8" fill="url(#paperBg-${uid})" stroke="#8C7B63" stroke-width="1.5"/>
      <g stroke="rgba(53, 75, 94, 0.14)" stroke-width="0.9">
        <line x1="3" y1="68" x2="277" y2="68"/><line x1="3" y1="128" x2="277" y2="128"/>
        <line x1="3" y1="188" x2="277" y2="188"/><line x1="3" y1="248" x2="277" y2="248"/>
        <line x1="70" y1="3" x2="70" y2="323"/><line x1="140" y1="3" x2="140" y2="323"/><line x1="210" y1="3" x2="210" y2="323"/>
      </g>
      <g fill="none" stroke="#962E2A" stroke-width="1.4" opacity="0.65">
        <path d="M14,26 L14,14 L26,14"/><path d="M254,14 L266,14 L266,26"/>
        <path d="M14,300 L14,312 L26,312"/><path d="M254,312 L266,312 L266,300"/>
      </g>
      ${hairBack(t.hairTexture, pal, sex, isBald)}
      <g class="shoulders">
        <path d="${sex === 'F'
          ? 'M68,314 C72,272 98,256 122,250 L158,250 C182,256 208,272 212,314 Z'
          : 'M56,314 C60,268 88,252 118,248 L162,248 C192,252 220,268 224,314 Z'}"
          fill="#2F3B45" stroke="#192026" stroke-width="1.9"/>
        <path d="M120,248 L140,280 L160,248 Z" fill="#EFE6D5" stroke="#7A6E5D" stroke-width="1.1"/>
        <path d="M115,249 L136,290 L102,268 Z" fill="#232D35" stroke="#141A1F" stroke-width="1.2"/>
        <path d="M165,249 L144,290 L178,268 Z" fill="#232D35" stroke="#141A1F" stroke-width="1.2"/>
        ${sex === 'M' ? '<path d="M135,263 L145,263 L147,298 L140,308 L133,298 Z" fill="#8C322C" stroke="#4D1916" stroke-width="0.9"/>' : ''}
      </g>
      <path d="M123,222 L123,254 Q140,263 157,254 L157,222 Z" fill="${pal.skinBot}" stroke="${pal.skinStroke}" stroke-width="1.7"/>
      ${ears(t.earlobe, pal)}
      <path d="M89,134 C89,96 108,82 140,82 C172,82 191,96 191,134 C191,176 184,204 166,222 C156,232 148,236 140,236 C132,236 124,232 114,222 C96,204 89,176 89,134 Z"
            fill="url(#skin-${uid})" stroke="${pal.skinStroke}" stroke-width="2"/>
      ${eyebrowsLayer(t.eyebrowShape, pal, sex)}
      <g class="eyes">
        <ellipse cx="117" cy="150" rx="10.2" ry="5.8" fill="#FAF7F0" stroke="#362A22" stroke-width="1.5"/>
        <circle cx="117" cy="150" r="4.9" fill="${irisHex}" stroke="rgba(22,18,14,0.42)" stroke-width="0.7"/>
        <circle cx="117" cy="150" r="2.2" fill="#141210"/>
        <circle cx="118.9" cy="148.2" r="1.25" fill="#FFFFFF"/>
        <ellipse cx="163" cy="150" rx="10.2" ry="5.8" fill="#FAF7F0" stroke="#362A22" stroke-width="1.5"/>
        <circle cx="163" cy="150" r="4.9" fill="${irisHex}" stroke="rgba(22,18,14,0.42)" stroke-width="0.7"/>
        <circle cx="163" cy="150" r="2.2" fill="#141210"/>
        <circle cx="164.9" cy="148.2" r="1.25" fill="#FFFFFF"/>
      </g>
      <path d="M140,147 L137,171 Q140,175 146,172" fill="none" stroke="${pal.earInner}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      ${frecklesLayer(t.freckles === 'presentes', isAlbino, pal)}
      ${lipsLayer(t.lipWidth, pal)}
      ${dimplesLayer(t.dimples === 'presentes', pal)}
      ${cleftChinLayer(t.cleftChin === 'presente', pal)}
      ${hairFront(t.hairline, t.hairTexture, pal, sex, isBald)}
      ${isAlbino ? `<rect x="18" y="16" width="244" height="22" rx="3" fill="rgba(53,75,94,0.92)"/>
        <text x="140" y="30" text-anchor="middle" fill="#F2E9D8" font-family="monospace" font-size="9.2" font-weight="700" letter-spacing="0.8">EPISTASIA (aa): PIGMENTAÇÃO MASCARADA</text>` : ''}
      <text x="140" y="316" text-anchor="middle" fill="#574E42" font-family="monospace" font-size="9.5" font-weight="700" letter-spacing="1.6">${code}</text>
    </svg>`;
  }

  // =========================================================================
  // HEREDOGRAMA CLÁSSICO DE GENÉTICA (SIMBOLOGIA PADRÃO: □ ○ ■ ● ◧ ◐ ⊙ ↗)
  // =========================================================================
  const INK = '#22262E';
  const MUTED = '#756C60';
  const ACCENT_RED = '#A62E26';
  let pedSeq = 0;

  const SKIN_SWATCH = {
    skin0: '#F7DFC9',
    skin1: '#E2B890',
    skin2: '#BE865A',
    skin3: '#8D5734',
    skin4: '#59341E',
  };

  const HAIR_SWATCH = {
    hairDark: '#2B221C',
    hairBlonde: '#D8AE4E',
    hairRed: '#AA4320',
  };

  const EYE_SWATCH = {
    eyeBrown: '#6E462A',
    eyeGreen: '#3C7A54',
    eyeBlue: '#3D78A8',
  };

  function resolveSymbolKind(rawState, tag, traitKey) {
    if (rawState === 'suspect') return 'proband';
    const t = String(tag || '').toLowerCase().trim();
    if (rawState === 'unknown' || t === '?' || t === 's/ reg.' || t === '') return 'unknown';

    if (traitKey === 'abo') {
      if (t.includes('ab') || rawState === 'typeAB') return 'aboAB';
      if (t.includes('tipo a') || t === 'a' || t.includes('iᵃ') || rawState === 'typeA') return 'aboA';
      if (t.includes('tipo b') || t === 'b' || t.includes('iᵇ') || rawState === 'typeB') return 'aboB';
      return 'aboO';
    }
    if (traitKey === 'eyeColor') {
      if (t.includes('cast') || rawState === 'eyeBrown') return 'eyeBrown';
      if (t.includes('verd') || rawState === 'eyeGreen') return 'eyeGreen';
      return 'eyeBlue';
    }
    if (traitKey === 'skinTone') {
      if (rawState === 'skin4' || t.includes('retint') || t.includes('4 dom')) return 'skin4';
      if (rawState === 'skin3' || t.includes('esc') || t.includes('3 dom')) return 'skin3';
      if (rawState === 'skin2' || t.includes('méd') || t.includes('med') || t.includes('2 dom')) return 'skin2';
      if (rawState === 'skin1' || t.includes('morena cl') || t.includes('m. clara') || t.includes('1 dom')) return 'skin1';
      return 'skin0';
    }
    if (traitKey === 'hairColor') {
      if (rawState === 'hairRed' || t.includes('ruiv')) return 'hairRed';
      if (rawState === 'hairBlonde' || t.includes('loir')) return 'hairBlonde';
      return 'hairDark';
    }
    if (traitKey === 'colorVision') {
      if (rawState === 'clinical' || rawState === 'affected' || t.includes('dalt')) return 'filled';
      if (rawState === 'carrier' || t.includes('port')) return 'xcarrier';
      return 'empty';
    }
    if (traitKey === 'albinism') {
      if (rawState === 'clinical' || rawState === 'affected' || t.includes('albin')) return 'filled';
      if (rawState === 'carrier' || t.includes('típic') || t.includes('port')) return 'half';
      return 'empty';
    }
    if (traitKey === 'baldness') {
      if (rawState === 'affected' || rawState === 'dom' || t.includes('calv')) return 'filled';
      if (rawState === 'carrier' || rawState === 'half' || t.includes('port')) return 'half';
      return 'empty';
    }
    if (traitKey === 'hairTexture' || traitKey === 'lipWidth') {
      if (rawState === 'carrier' || rawState === 'inter' || t.includes('ond') || t.includes('méd')) return 'half';
      if (rawState === 'affected' || rawState === 'dom' || t.includes('cach') || t.includes('larg') || t === 'tt' || t === 'mm') return 'filled';
      return 'empty';
    }
    if (rawState === 'affected' || rawState === 'dom') return 'filled';
    if (rawState === 'carrier' || rawState === 'inter') return 'half';
    return 'empty';
  }

  /** Retorna a notação de alelos (ex.: ff, F_, Aa, XᴰXᵈ, IᴬIᴮ, KK NN) para exibir sob o indivíduo */
  function inferAlleleText(traitKey, kind, tag, shape, explicit) {
    if (explicit) return explicit;
    if (kind === 'proband' || kind === 'unknown') return '';
    const raw = String(tag || '').trim();
    if (/^(FF|QQ|SS|TT|MM|WW|BB|Bb|bb|IᴮIᴮ|IᴬIᴬ|Iᴬi|Iᴮi|XᴰXᴰ|XᵈY|XᴰY|(KK|Kk|kk|HH|Hh|hh|EE|Ee|ee)\s?(NN|Nn|nn|UU|Uu|uu|GG|Gg|gg))$/.test(raw)) return raw;

    const autoDom = {
      earlobe: ['F', 'f'], hairline: ['P', 'p'], dimples: ['C', 'c'],
      cleftChin: ['Q', 'q'], freckles: ['S', 's'], rh: ['R', 'r'],
      eyebrowShape: ['W', 'w'],
    };
    if (autoDom[traitKey]) {
      const [D, r] = autoDom[traitKey];
      if (kind === 'filled') return `${D}_`;
      if (kind === 'half') return `${D}${r}`;
      return `${r}${r}`;
    }
    if (traitKey === 'baldness') {
      if (shape === 'sq') return kind === 'filled' ? 'B_' : (kind === 'half' ? 'Bb' : 'bb');
      if (kind === 'filled') return 'BB';
      if (kind === 'half') return 'Bb';
      return '_b';
    }
    if (traitKey === 'hairTexture') return kind === 'filled' ? 'TT' : (kind === 'half' ? 'Tt' : 'tt');
    if (traitKey === 'lipWidth') return kind === 'filled' ? 'MM' : (kind === 'half' ? 'Mm' : 'mm');
    if (traitKey === 'abo') {
      if (kind === 'aboAB') return 'IᴬIᴮ';
      if (kind === 'aboO') return 'ii';
      if (kind === 'aboA') return 'Iᴬ_';
      if (kind === 'aboB') return 'Iᴮ_';
    }
    if (traitKey === 'colorVision') {
      if (shape === 'sq') return kind === 'filled' ? 'XᵈY' : 'XᴰY';
      if (kind === 'filled') return 'XᵈXᵈ';
      if (kind === 'xcarrier') return 'XᴰXᵈ';
      return 'XᴰX_';
    }
    if (traitKey === 'eyeColor') {
      if (kind === 'eyeBrown') return 'E_ __';
      if (kind === 'eyeGreen') return 'ee G_';
      return 'ee gg';
    }
    if (traitKey === 'hairColor') {
      if (kind === 'hairDark') return 'H_ __';
      if (kind === 'hairBlonde') return 'hh U_';
      return 'hh uu';
    }
    if (traitKey === 'skinTone') {
      if (kind === 'skin4') return 'KK NN';
      if (kind === 'skin3') return '3 dom.';
      if (kind === 'skin2') return '2 dom.';
      if (kind === 'skin1') return '1 dom.';
      return 'kk nn';
    }
    if (traitKey === 'albinism') {
      if (kind === 'filled') return 'aa';
      if (kind === 'half') return 'Aa';
      return 'A_';
    }
    return '';
  }

  /** Legenda dos símbolos de fenótipo (exibida apenas na base, fiel à simbologia padrão) */
  function traitLegendEntries(traitKey, usedKinds) {
    const defs = {
      earlobe: [
        { kind: 'filled', label: 'Lóbulo solto (FF ou Ff)' },
        { kind: 'empty', label: 'Lóbulo preso (ff)' },
      ],
      hairline: [
        { kind: 'filled', label: 'Pico de viúva (PP ou Pp)' },
        { kind: 'empty', label: 'Linha reta (pp)' },
      ],
      dimples: [
        { kind: 'filled', label: 'Com covinhas (CC ou Cc)' },
        { kind: 'empty', label: 'Sem covinhas (cc)' },
      ],
      cleftChin: [
        { kind: 'filled', label: 'Queixo fendido (QQ ou Qq)' },
        { kind: 'empty', label: 'Queixo liso (qq)' },
      ],
      freckles: [
        { kind: 'filled', label: 'Com sardas (SS ou Ss)' },
        { kind: 'empty', label: 'Sem sardas (ss)' },
      ],
      eyebrowShape: [
        { kind: 'filled', label: 'Sobrancelhas espessas (WW ou Ww)' },
        { kind: 'empty', label: 'Sobrancelhas finas (ww)' },
      ],
      rh: [
        { kind: 'filled', label: 'Rh positivo (RR ou Rr)' },
        { kind: 'empty', label: 'Rh negativo (rr)' },
      ],
      baldness: [
        { kind: 'filled', label: 'Calvície (♂ BB, Bb · ♀ BB)' },
        ...(usedKinds.has('half') ? [{ kind: 'half', label: 'Heterozigota não-calva (♀ Bb)' }] : []),
        { kind: 'empty', label: 'Cabelo denso (♂ bb · ♀ Bb, bb)' },
      ],
      hairTexture: [
        { kind: 'filled', label: 'Cacheado (TT)' },
        { kind: 'half', label: 'Ondulado — heterozigoto (Tt)' },
        { kind: 'empty', label: 'Liso (tt)' },
      ],
      lipWidth: [
        { kind: 'filled', label: 'Lábios largos (MM)' },
        { kind: 'half', label: 'Lábios médios — heterozigoto (Mm)' },
        { kind: 'empty', label: 'Lábios finos (mm)' },
      ],
      colorVision: [
        { kind: 'filled', label: 'Afetado — Daltonismo (XᵈY / XᵈXᵈ)' },
        { kind: 'xcarrier', label: 'Portadora ligada ao X (XᴰXᵈ)' },
        { kind: 'empty', label: 'Visão normal (XᴰY / XᴰX_)' },
      ],
      albinism: [
        { kind: 'filled', label: 'Afetado — Albinismo (aa)' },
        { kind: 'half', label: 'Heterozigoto autossômico (Aa)' },
        { kind: 'empty', label: 'Pigmentação típica (A_)' },
      ],
      abo: [
        { kind: 'aboA', label: 'Tipo A (Iᴬ_)' },
        { kind: 'aboB', label: 'Tipo B (Iᴮ_)' },
        { kind: 'aboAB', label: 'Tipo AB (IᴬIᴮ)' },
        { kind: 'aboO', label: 'Tipo O (ii)' },
      ],
      eyeColor: [
        { kind: 'eyeBrown', label: 'Castanho (E_)' },
        { kind: 'eyeGreen', label: 'Verde (ee G_)' },
        { kind: 'eyeBlue', label: 'Azul (ee gg)' },
      ],
      hairColor: [
        { kind: 'hairDark', label: 'Escuro (H_ __)' },
        { kind: 'hairBlonde', label: 'Loiro (hh U_)' },
        { kind: 'hairRed', label: 'Ruivo (hh uu)' },
      ],
      skinTone: [
        { kind: 'skin4', label: 'Retinta (4 dom.)' },
        { kind: 'skin3', label: 'Morena esc. (3)' },
        { kind: 'skin2', label: 'Morena méd. (2)' },
        { kind: 'skin1', label: 'Morena cl. (1)' },
        { kind: 'skin0', label: 'Clara (0 dom.)' },
      ],
    };
    const list = defs[traitKey] || [];
    const extras = [];
    if (usedKinds.has('unknown')) extras.push({ kind: 'unknown', label: 'Sem registro' });
    return [...list, ...extras];
  }

  function miniLegendSVG(kind, uidBase = 'lg') {
    const sq = (inner) => `<svg class="ped-lg-svg" viewBox="0 0 18 18" aria-hidden="true">${inner}</svg>`;
    if (kind === 'filled') {
      return `<span class="ped-lg-pair">${sq(`<rect x="2" y="2" width="14" height="14" rx="1.5" fill="${INK}" stroke="${INK}" stroke-width="1.5"/>`)}${sq(`<circle cx="9" cy="9" r="7" fill="${INK}" stroke="${INK}" stroke-width="1.5"/>`)}</span>`;
    }
    if (kind === 'empty') {
      return `<span class="ped-lg-pair">${sq(`<rect x="2" y="2" width="14" height="14" rx="1.5" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/>`)}${sq(`<circle cx="9" cy="9" r="7" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/>`)}</span>`;
    }
    if (kind === 'half') {
      const cid = `${uidBase}-hc`;
      return `<span class="ped-lg-pair">${sq(`<rect x="2" y="2" width="7" height="14" fill="${INK}"/><rect x="9" y="2" width="7" height="14" fill="#FFFFFF"/><rect x="2" y="2" width="14" height="14" rx="1.5" fill="none" stroke="${INK}" stroke-width="1.5"/>`)}${sq(`<defs><clipPath id="${cid}"><circle cx="9" cy="9" r="7"/></clipPath></defs><g clip-path="url(#${cid})"><rect x="2" y="2" width="7" height="14" fill="${INK}"/><rect x="9" y="2" width="7" height="14" fill="#FFFFFF"/></g><circle cx="9" cy="9" r="7" fill="none" stroke="${INK}" stroke-width="1.5"/>`)}</span>`;
    }
    if (kind === 'xcarrier') {
      return sq(`<circle cx="9" cy="9" r="7" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/><circle cx="9" cy="9" r="2.7" fill="${INK}"/>`);
    }
    if (kind === 'unknown') {
      return sq(`<rect x="2" y="2" width="14" height="14" rx="1.5" fill="#F4F1EA" stroke="${MUTED}" stroke-width="1.4" stroke-dasharray="3 2"/><text x="9" y="12.5" text-anchor="middle" fill="${MUTED}" font-size="9" font-weight="700">?</text>`);
    }
    if (kind === 'aboA') return sq(`<rect x="2" y="2" width="14" height="14" rx="1.5" fill="#2B587A" stroke="${INK}" stroke-width="1.4"/><text x="9" y="12.5" text-anchor="middle" fill="#FFFFFF" font-size="9" font-weight="800">A</text>`);
    if (kind === 'aboB') return sq(`<rect x="2" y="2" width="14" height="14" rx="1.5" fill="#BA7722" stroke="${INK}" stroke-width="1.4"/><text x="9" y="12.5" text-anchor="middle" fill="#FFFFFF" font-size="9" font-weight="800">B</text>`);
    if (kind === 'aboAB') return sq(`<rect x="2" y="2" width="7" height="14" fill="#2B587A"/><rect x="9" y="2" width="7" height="14" fill="#BA7722"/><rect x="2" y="2" width="14" height="14" rx="1.5" fill="none" stroke="${INK}" stroke-width="1.4"/><text x="9" y="12.2" text-anchor="middle" fill="#FFFFFF" font-size="7.2" font-weight="800">AB</text>`);
    if (kind === 'aboO') return sq(`<rect x="2" y="2" width="14" height="14" rx="1.5" fill="#FFFFFF" stroke="${INK}" stroke-width="1.4"/><text x="9" y="12.5" text-anchor="middle" fill="${INK}" font-size="9" font-weight="800">O</text>`);
    if (EYE_SWATCH[kind]) return sq(`<circle cx="9" cy="9" r="7" fill="${EYE_SWATCH[kind]}" stroke="${INK}" stroke-width="1.4"/>`);
    if (HAIR_SWATCH[kind]) return sq(`<circle cx="9" cy="9" r="7" fill="${HAIR_SWATCH[kind]}" stroke="${INK}" stroke-width="1.4"/>`);
    if (SKIN_SWATCH[kind]) return sq(`<rect x="2" y="2" width="14" height="14" rx="2.5" fill="${SKIN_SWATCH[kind]}" stroke="${INK}" stroke-width="1.35"/>`);
    return '';
  }

  function renderPedigree(ped, traitKey = '') {
    if (!ped) return '';
    pedSeq += 1;
    const puid = `ped${pedSeq}`;
    const W = 436;
    const R = 16.5;
    const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
    const MONO = "ui-monospace, 'Cascadia Mono', 'SFMono-Regular', Consolas, monospace";
    const usedKinds = new Set();

    const drawNode = (x, y, shape, indNum, role, tag, rawState, explicitAllele = '', note = '') => {
      const kind = resolveSymbolKind(rawState, tag, traitKey);
      usedKinds.add(kind);
      const clipId = `${puid}-c-${indNum}-${Math.round(x)}-${Math.round(y)}`;
      const isSq = shape === 'sq';
      const baseGeom = isSq
        ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2"/>`
        : `<circle cx="${x}" cy="${y}" r="${R}"/>`;

      let shapeMarkup = '';
      let insideText = '';
      let insideColor = INK;

      if (kind === 'filled') {
        shapeMarkup = isSq
          ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="url(#${puid}-ink)" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`
          : `<circle cx="${x}" cy="${y}" r="${R}" fill="url(#${puid}-ink)" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`;
      } else if (kind === 'empty') {
        shapeMarkup = isSq
          ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="url(#${puid}-wht)" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`
          : `<circle cx="${x}" cy="${y}" r="${R}" fill="url(#${puid}-wht)" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`;
      } else if (kind === 'half') {
        shapeMarkup = `
          <defs><clipPath id="${clipId}">${baseGeom}</clipPath></defs>
          <g filter="url(#${puid}-sh)">
            <g clip-path="url(#${clipId})">
              <rect x="${x - R}" y="${y - R}" width="${R}" height="${R * 2}" fill="url(#${puid}-ink)"/>
              <rect x="${x}" y="${y - R}" width="${R}" height="${R * 2}" fill="url(#${puid}-wht)"/>
            </g>
            ${isSq
              ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="none" stroke="${INK}" stroke-width="2"/>`
              : `<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${INK}" stroke-width="2"/>`}
          </g>`;
      } else if (kind === 'xcarrier') {
        shapeMarkup = `
          <g filter="url(#${puid}-sh)">
            <circle cx="${x}" cy="${y}" r="${R}" fill="url(#${puid}-wht)" stroke="${INK}" stroke-width="2"/>
            <circle cx="${x}" cy="${y}" r="5.3" fill="${INK}"/>
          </g>`;
      } else if (kind === 'unknown') {
        shapeMarkup = isSq
          ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="#F5F1E8" stroke="${MUTED}" stroke-width="1.6" stroke-dasharray="4 3"/>`
          : `<circle cx="${x}" cy="${y}" r="${R}" fill="#F5F1E8" stroke="${MUTED}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
        insideText = '?';
        insideColor = MUTED;
      } else if (kind === 'proband') {
        const halo = isSq
          ? `<rect x="${x - R - 3}" y="${y - R - 3}" width="${R * 2 + 6}" height="${R * 2 + 6}" rx="4" fill="none" stroke="rgba(166, 46, 38, 0.22)" stroke-width="3.5"/>`
          : `<circle cx="${x}" cy="${y}" r="${R + 3}" fill="none" stroke="rgba(166, 46, 38, 0.22)" stroke-width="3.5"/>`;
        shapeMarkup = `
          ${halo}
          ${isSq
            ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="#FEF6F4" stroke="${ACCENT_RED}" stroke-width="2.3" filter="url(#${puid}-sh)"/>`
            : `<circle cx="${x}" cy="${y}" r="${R}" fill="#FEF6F4" stroke="${ACCENT_RED}" stroke-width="2.3" filter="url(#${puid}-sh)"/>`}`;
        const ax1 = x - R - 25, ay1 = y + R + 1;
        const ax2 = x - R - 6, ay2 = y + R - 7;
        shapeMarkup += `
          <line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="${ACCENT_RED}" stroke-width="2.1" stroke-linecap="round"/>
          <polygon points="${ax2},${ay2} ${ax2 - 7.6},${ay2 - 0.5} ${ax2 - 5.0},${ay2 + 5.7}" fill="${ACCENT_RED}"/>`;
        insideText = '?';
        insideColor = ACCENT_RED;
      } else if (kind === 'aboAB') {
        shapeMarkup = `
          <defs><clipPath id="${clipId}">${baseGeom}</clipPath></defs>
          <g filter="url(#${puid}-sh)">
            <g clip-path="url(#${clipId})">
              <rect x="${x - R}" y="${y - R}" width="${R}" height="${R * 2}" fill="#2B587A"/>
              <rect x="${x}" y="${y - R}" width="${R}" height="${R * 2}" fill="#BA7722"/>
            </g>
            ${isSq
              ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="none" stroke="${INK}" stroke-width="2"/>`
              : `<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${INK}" stroke-width="2"/>`}
          </g>`;
        insideText = 'AB';
        insideColor = '#FFFFFF';
      } else if (kind === 'aboA' || kind === 'aboB' || kind === 'aboO') {
        const fillMap = { aboA: '#2B587A', aboB: '#BA7722', aboO: '#FFFFFF' };
        shapeMarkup = isSq
          ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="${fillMap[kind]}" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`
          : `<circle cx="${x}" cy="${y}" r="${R}" fill="${fillMap[kind]}" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`;
        insideText = kind.replace('abo', '');
        insideColor = kind === 'aboO' ? INK : '#FFFFFF';
      } else if (EYE_SWATCH[kind] || HAIR_SWATCH[kind] || SKIN_SWATCH[kind]) {
        const fillHex = EYE_SWATCH[kind] || HAIR_SWATCH[kind] || SKIN_SWATCH[kind];
        shapeMarkup = isSq
          ? `<rect x="${x - R}" y="${y - R}" width="${R * 2}" height="${R * 2}" rx="2" fill="${fillHex}" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`
          : `<circle cx="${x}" cy="${y}" r="${R}" fill="${fillHex}" stroke="${INK}" stroke-width="2" filter="url(#${puid}-sh)"/>`;
      }

      const alleles = inferAlleleText(traitKey, kind, tag, shape, explicitAllele);
      const numX = x - R - 7;
      const numY = y - R + 7.5;

      let allelePill = '';
      if (alleles) {
        const aw = Math.max(26, alleles.length * 6.1 + 12);
        const ay = y + R + 16.5;
        allelePill = `
          <rect x="${x - aw / 2}" y="${ay}" width="${aw}" height="14.5" rx="3.5" fill="#EFE9DB" stroke="rgba(138, 118, 86, 0.36)" stroke-width="0.9"/>
          <text x="${x}" y="${ay + 10.4}" text-anchor="middle" fill="#322C24" font-family="${MONO}" font-size="9.3" font-weight="700">${alleles}</text>`;
      }

      let noteMarkup = '';
      if (kind === 'proband' && note) {
        const nw = Math.min(286, Math.max(140, note.length * 5.6 + 22));
        const nx = Math.max(42 + nw / 2, Math.min(W - 10 - nw / 2, x));
        const ny = y + R + 18;
        noteMarkup = `
          <rect x="${nx - nw / 2}" y="${ny}" width="${nw}" height="19.5" rx="4.5" fill="#FDF3DC" stroke="#BC8426" stroke-width="1.15"/>
          <text x="${nx}" y="${ny + 13}" text-anchor="middle" fill="#5D3B08" font-family="${SANS}" font-size="9.4" font-weight="700">${note}</text>`;
      }

      return `<g class="ped-node">
        <text x="${numX}" y="${numY}" text-anchor="end" fill="${MUTED}" font-family="${SANS}" font-size="10" font-weight="700">${indNum}</text>
        ${shapeMarkup}
        ${insideText ? `<text x="${x}" y="${y + 4.8}" text-anchor="middle" fill="${insideColor}" font-family="${SANS}" font-size="${insideText.length >= 2 ? 11.5 : 14.5}" font-weight="800">${insideText}</text>` : ''}
        <text x="${x}" y="${y + R + 12.5}" text-anchor="middle" fill="${INK}" font-family="${SANS}" font-size="10.2" font-weight="700">${role}</text>
        ${allelePill}
        ${noteMarkup}
      </g>`;
    };

    const genBand = (y, bh, odd) => odd
      ? `<rect x="40" y="${y - 26}" width="${W - 46}" height="${bh}" rx="8" fill="rgba(168, 138, 92, 0.085)"/>`
      : '';

    const genNum = (roman, y) => `
      <text x="19" y="${y + 5}" text-anchor="middle" fill="#4E4233" font-family="Georgia, 'Times New Roman', serif" font-size="15.5" font-weight="700">${roman}</text>
    `;

    const jDot = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="2.3" fill="${INK}"/>`;

    const susShape = ped.suspectSex === 'F' ? 'ci' : 'sq';
    const spShape = ped.suspectSex === 'F' ? 'sq' : 'ci';
    const sNote = ped.suspectNote || '';
    let h = 186;
    let body = '';

    if (ped.layout === 'parents') {
      h = sNote ? 208 : 186;
      const midX = 230;
      body = `
        ${genBand(40, 74, true)}
        ${genNum('I', 40)}
        ${genNum('II', 132)}
        <g stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="158" y1="40" x2="302" y2="40"/>
          <line x1="${midX}" y1="40" x2="${midX}" y2="${132 - R}"/>
        </g>
        ${jDot(midX, 40)}
        ${drawNode(158, 40, 'sq', '1', ped.fatherRole || 'Pai', ped.fatherTag, ped.fatherState, ped.fatherAlleles)}
        ${drawNode(302, 40, 'ci', '2', ped.motherRole || 'Mãe', ped.motherTag, ped.motherState, ped.motherAlleles)}
        ${drawNode(midX, 132, susShape, '1', 'Investigado(a)', '?', 'suspect', '', sNote)}
      `;
    } else if (ped.layout === 'siblings') {
      h = sNote ? 222 : 198;
      const midX = 230;
      body = `
        ${genBand(40, 74, true)}
        ${genNum('I', 40)}
        ${genNum('II', 142)}
        <g stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="158" y1="40" x2="302" y2="40"/>
          <line x1="${midX}" y1="40" x2="${midX}" y2="98"/>
          <line x1="158" y1="98" x2="302" y2="98"/>
          <line x1="158" y1="98" x2="158" y2="${142 - R}"/>
          <line x1="302" y1="98" x2="302" y2="${142 - R}"/>
        </g>
        ${jDot(midX, 40)}
        ${drawNode(158, 40, 'sq', '1', ped.fatherRole || 'Pai', ped.fatherTag, ped.fatherState, ped.fatherAlleles)}
        ${drawNode(302, 40, 'ci', '2', ped.motherRole || 'Mãe', ped.motherTag, ped.motherState, ped.motherAlleles)}
        ${drawNode(158, 142, susShape, '1', 'Investigado(a)', '?', 'suspect', '', sNote)}
        ${drawNode(302, 142, ped.sibShape || 'ci', '2', ped.sibRole || 'Irmão(ã)', ped.sibTag, ped.sibState, ped.sibAlleles)}
      `;
    } else if (ped.layout === 'offspring') {
      h = 304;
      const hasSib = !!ped.sibRole;
      const hasTwoChildren = !!ped.child2Role;
      const p1X = 118;
      const p2X = 246;
      const pMid = (p1X + p2X) / 2;
      const susX = hasSib ? 208 : pMid;
      const spX = hasSib ? 348 : 332;
      const cMid = (susX + spX) / 2;

      const parentDrop = hasSib
        ? `<line x1="${pMid}" y1="38" x2="${pMid}" y2="94"/>
           <line x1="98" y1="94" x2="${susX}" y2="94"/>
           <line x1="98" y1="94" x2="98" y2="${138 - R}"/>
           <line x1="${susX}" y1="94" x2="${susX}" y2="${138 - R}"/>`
        : `<line x1="${pMid}" y1="38" x2="${pMid}" y2="${138 - R}"/>`;

      const childrenLines = hasTwoChildren
        ? `<line x1="${cMid}" y1="138" x2="${cMid}" y2="196"/>
           <line x1="${cMid - 58}" y1="196" x2="${cMid + 58}" y2="196"/>
           <line x1="${cMid - 58}" y1="196" x2="${cMid - 58}" y2="${240 - R}"/>
           <line x1="${cMid + 58}" y1="196" x2="${cMid + 58}" y2="${240 - R}"/>`
        : `<line x1="${cMid}" y1="138" x2="${cMid}" y2="${240 - R}"/>`;

      const childrenNodes = hasTwoChildren
        ? `${drawNode(cMid - 58, 240, ped.childShape || 'sq', '1', ped.childRole || 'Filho 1', ped.childTag, ped.childState, ped.childAlleles)}
           ${drawNode(cMid + 58, 240, ped.child2Shape || 'ci', '2', ped.child2Role, ped.child2Tag, ped.child2State, ped.child2Alleles)}`
        : `${drawNode(cMid, 240, ped.childShape || 'ci', '1', ped.childRole || 'Filho(a)', ped.childTag, ped.childState, ped.childAlleles)}`;

      body = `
        ${genBand(38, 72, true)}
        ${genBand(240, 74, true)}
        ${genNum('I', 38)}
        ${genNum('II', 138)}
        ${genNum('III', 240)}
        <g stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="${p1X}" y1="38" x2="${p2X}" y2="38"/>
          ${parentDrop}
          <line x1="${susX}" y1="138" x2="${spX}" y2="138"/>
          ${childrenLines}
        </g>
        ${jDot(pMid, 38)}
        ${jDot(cMid, 138)}
        ${drawNode(p1X, 38, 'sq', '1', ped.fatherRole || 'Pai', ped.fatherTag, ped.fatherState, ped.fatherAlleles)}
        ${drawNode(p2X, 38, 'ci', '2', ped.motherRole || 'Mãe', ped.motherTag, ped.motherState, ped.motherAlleles)}
        ${hasSib ? drawNode(98, 138, ped.sibShape || 'ci', '1', ped.sibRole, ped.sibTag, ped.sibState, ped.sibAlleles) : ''}
        ${drawNode(susX, 138, susShape, hasSib ? '2' : '1', 'Investigado(a)', '?', 'suspect', '', sNote)}
        ${drawNode(spX, 138, spShape, hasSib ? '3' : '2', ped.spouseRole || 'Cônjuge', ped.spouseTag, ped.spouseState, ped.spouseAlleles)}
        ${childrenNodes}
      `;
    } else if (ped.layout === 'threeGen') {
      h = sNote ? 316 : 296;
      body = `
        ${genBand(38, 72, true)}
        ${genBand(236, sNote ? 86 : 66, true)}
        ${genNum('I', 38)}
        ${genNum('II', 138)}
        ${genNum('III', 236)}
        <g stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="90" y1="38" x2="180" y2="38"/>
          <line x1="135" y1="38" x2="135" y2="${138 - R}"/>
          <line x1="278" y1="38" x2="368" y2="38"/>
          <line x1="323" y1="38" x2="323" y2="${138 - R}"/>
          <line x1="135" y1="138" x2="323" y2="138"/>
          <line x1="229" y1="138" x2="229" y2="${236 - R}"/>
        </g>
        ${jDot(135, 38)}
        ${jDot(323, 38)}
        ${jDot(229, 138)}
        ${drawNode(90, 38, 'sq', '1', ped.gp1Role || 'Avô P.', ped.gp1Tag, ped.gp1State, ped.gp1Alleles)}
        ${drawNode(180, 38, 'ci', '2', ped.gp2Role || 'Avó P.', ped.gp2Tag, ped.gp2State, ped.gp2Alleles)}
        ${drawNode(278, 38, 'sq', '3', ped.gp3Role || 'Avô M.', ped.gp3Tag, ped.gp3State, ped.gp3Alleles)}
        ${drawNode(368, 38, 'ci', '4', ped.gp4Role || 'Avó M.', ped.gp4Tag, ped.gp4State, ped.gp4Alleles)}
        ${drawNode(135, 138, 'sq', '1', ped.fatherRole || 'Pai', ped.fatherTag, ped.fatherState, ped.fatherAlleles)}
        ${drawNode(323, 138, 'ci', '2', ped.motherRole || 'Mãe', ped.motherTag, ped.motherState, ped.motherAlleles)}
        ${drawNode(229, 236, susShape, '1', 'Investigado(a)', '?', 'suspect', '', sNote)}
      `;
    }

    const traitLegendHTML = traitLegendEntries(traitKey, usedKinds)
      .map((item, idx) => `<span class="ped-lg-item">${miniLegendSVG(item.kind, `${puid}-${idx}`)}<span>${item.label}</span></span>`)
      .join('');

    return `<div class="pedigree-complete">
      <svg class="pedigree-graphic" viewBox="0 0 ${W} ${h}" role="img" aria-label="Heredograma familiar em simbologia genética padrão">
        <defs>
          <filter id="${puid}-sh" x="-20%" y="-20%" width="140%" height="145%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="1.4" flood-color="#1A1612" flood-opacity="0.17"/>
          </filter>
          <linearGradient id="${puid}-ink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#313742"/><stop offset="100%" stop-color="#1A1E26"/>
          </linearGradient>
          <linearGradient id="${puid}-wht" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#F6F2EA"/>
          </linearGradient>
        </defs>
        <line x1="35" y1="10" x2="35" y2="${h - 10}" stroke="rgba(148, 118, 74, 0.34)" stroke-width="1"/>
        ${body}
      </svg>
      <div class="ped-legend" aria-label="Legenda do heredograma">
        <div class="ped-lg-row ped-lg-base">
          <span class="ped-lg-item"><svg class="ped-lg-svg" viewBox="0 0 18 18"><rect x="2" y="2" width="14" height="14" rx="1.5" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/></svg>Homem</span>
          <span class="ped-lg-item"><svg class="ped-lg-svg" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/></svg>Mulher</span>
          <span class="ped-lg-item"><svg class="ped-lg-svg wide" viewBox="0 0 34 18"><rect x="1.5" y="3.5" width="11" height="11" rx="1.2" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/><line x1="12.5" y1="9" x2="21.5" y2="9" stroke="${INK}" stroke-width="1.6"/><circle cx="27" cy="9" r="5.5" fill="#FFFFFF" stroke="${INK}" stroke-width="1.5"/></svg>Reprodução</span>
          <span class="ped-lg-item"><svg class="ped-lg-svg" viewBox="0 0 20 18"><line x1="2" y1="16" x2="10" y2="9" stroke="${ACCENT_RED}" stroke-width="1.8" stroke-linecap="round"/><polygon points="10,9 4.5,9.5 7.5,14" fill="${ACCENT_RED}"/><rect x="10" y="2" width="8" height="8" rx="1.2" fill="#FEF6F4" stroke="${ACCENT_RED}" stroke-width="1.4"/></svg>Propósito (Investigado)</span>
        </div>
        <div class="ped-lg-row ped-lg-traits">${traitLegendHTML}</div>
      </div>
    </div>`;
  }

  return { render, renderPedigree };
})();
