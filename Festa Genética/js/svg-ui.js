'use strict';
/**
 * svg-ui.js — Biblioteca completa de ilustrações editoriais, brasão, medalhas de patente
 * e ícones vetoriais exclusivos do Dossiê 46 e da Estufa de Mendel.
 */
const UIArt = (() => {
  // =========================================================================
  // 1. BRASÃO OFICIAL DO DOSSIÊ 46
  // =========================================================================
  function logo(cls = 'brand-crest') {
    return `<svg class="${cls}" viewBox="0 0 120 120" role="img" aria-label="Brasão Dossiê 46">
      <defs>
        <linearGradient id="brassRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#E4C178"/>
          <stop offset="48%" stop-color="#B5893D"/>
          <stop offset="100%" stop-color="#6E4E1B"/>
        </linearGradient>
        <radialGradient id="slateField" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stop-color="#4A657C"/>
          <stop offset="70%" stop-color="#2D4152"/>
          <stop offset="100%" stop-color="#1C2935"/>
        </radialGradient>
        <linearGradient id="crimsonBand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#B53C37"/>
          <stop offset="100%" stop-color="#6E1E1B"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="#171513" stroke="url(#brassRing)" stroke-width="3.2"/>
      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(228,193,120,0.45)" stroke-width="1" stroke-dasharray="3 2.5"/>
      <circle cx="60" cy="60" r="45.5" fill="url(#crimsonBand)" stroke="#4A1210" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="39" fill="url(#slateField)" stroke="url(#brassRing)" stroke-width="2"/>
      <!-- Hachura forense sutil -->
      <g stroke="rgba(239,230,213,0.08)" stroke-width="0.8">
        <line x1="25" y1="45" x2="95" y2="45"/><line x1="25" y1="60" x2="95" y2="60"/><line x1="25" y1="75" x2="95" y2="75"/>
        <line x1="45" y1="25" x2="45" y2="95"/><line x1="60" y1="25" x2="60" y2="95"/><line x1="75" y1="25" x2="75" y2="95"/>
      </g>
      <!-- Dupla hélice esculpida em creme e latão -->
      <g stroke-linecap="round">
        <line x1="48" y1="40" x2="72" y2="40" stroke="#EFE6D5" stroke-width="1.9" opacity="0.85"/>
        <line x1="51" y1="47" x2="69" y2="47" stroke="#E4C178" stroke-width="1.9" opacity="0.85"/>
        <line x1="51" y1="65" x2="69" y2="65" stroke="#E4C178" stroke-width="1.9" opacity="0.85"/>
        <line x1="48" y1="72" x2="72" y2="72" stroke="#EFE6D5" stroke-width="1.9" opacity="0.85"/>
        <path d="M46,32 C46,48 74,50 74,60 C74,70 46,72 46,84" fill="none" stroke="url(#brassRing)" stroke-width="3.4"/>
        <path d="M74,32 C74,48 46,50 46,60 C46,70 74,72 74,84" fill="none" stroke="#EFE6D5" stroke-width="2.6"/>
      </g>
      <!-- Lupa de latão sobreposta -->
      <g>
        <line x1="43" y1="77" x2="26" y2="94" stroke="#6E4E1B" stroke-width="8" stroke-linecap="round"/>
        <line x1="43" y1="77" x2="27" y2="93" stroke="url(#brassRing)" stroke-width="5.2" stroke-linecap="round"/>
        <circle cx="62" cy="56" r="24" fill="rgba(239,230,213,0.08)" stroke="url(#brassRing)" stroke-width="3.6"/>
        <circle cx="62" cy="56" r="20.8" fill="none" stroke="#4D3510" stroke-width="0.9"/>
        <path d="M48,44 A19,19 0 0,1 67,38" fill="none" stroke="rgba(255,250,240,0.55)" stroke-width="2" stroke-linecap="round"/>
      </g>
      <!-- Pontos cardeais de latão -->
      <g fill="#E4C178">
        <circle cx="60" cy="8.5" r="2.2"/><circle cx="111.5" cy="60" r="2.2"/>
        <circle cx="60" cy="111.5" r="2.2"/><circle cx="8.5" cy="60" r="2.2"/>
      </g>
    </svg>`;
  }

  // =========================================================================
  // 2. MEDALHAS DE PATENTE (ESTAGIÁRIO, PERITO, CHEFE)
  // =========================================================================
  function badge(tier = 'estagiario', cls = 'rank-badge-svg') {
    if (tier === 'chefe') {
      return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="Medalha Perito-Chefe">
        <defs>
          <linearGradient id="bgGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F1D28B"/><stop offset="50%" stop-color="#C4933E"/><stop offset="100%" stop-color="#76531A"/>
          </linearGradient>
          <radialGradient id="bgCrim" cx="45%" cy="38%" r="60%">
            <stop offset="0%" stop-color="#BD403A"/><stop offset="100%" stop-color="#6B1B18"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#171513"/>
        <!-- Coroa de louros dourada -->
        <g fill="none" stroke="url(#bgGold)" stroke-width="2.4" stroke-linecap="round">
          <path d="M22,72 C10,56 12,30 30,18"/><path d="M78,72 C90,56 88,30 70,18"/>
        </g>
        <g fill="url(#bgGold)">
          <ellipse cx="16" cy="52" rx="5.5" ry="2.6" transform="rotate(-30 16 52)"/>
          <ellipse cx="18" cy="38" rx="5.5" ry="2.6" transform="rotate(-55 18 38)"/>
          <ellipse cx="25" cy="25" rx="5.5" ry="2.6" transform="rotate(-75 25 25)"/>
          <ellipse cx="22" cy="66" rx="5.5" ry="2.6" transform="rotate(15 22 66)"/>
          <ellipse cx="84" cy="52" rx="5.5" ry="2.6" transform="rotate(30 84 52)"/>
          <ellipse cx="82" cy="38" rx="5.5" ry="2.6" transform="rotate(55 82 38)"/>
          <ellipse cx="75" cy="25" rx="5.5" ry="2.6" transform="rotate(75 75 25)"/>
          <ellipse cx="78" cy="66" rx="5.5" ry="2.6" transform="rotate(-15 78 66)"/>
          <polygon points="50,6 54,14 62,14 55.5,19 58,27 50,22 42,27 44.5,19 38,14 46,14"/>
        </g>
        <circle cx="50" cy="54" r="30" fill="url(#bgCrim)" stroke="url(#bgGold)" stroke-width="3.2"/>
        <circle cx="50" cy="54" r="24.5" fill="none" stroke="rgba(241,210,139,0.55)" stroke-width="1" stroke-dasharray="2.5 2"/>
        <!-- Hélice + estrela central -->
        <path d="M40,38 C40,48 60,48 60,54 C60,60 40,60 40,70" fill="none" stroke="#F5DFAA" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M60,38 C60,48 40,48 40,54 C40,60 60,60 60,70" fill="none" stroke="#EFE6D5" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="43" y1="43" x2="57" y2="43" stroke="#F5DFAA" stroke-width="1.5"/>
        <line x1="43" y1="65" x2="57" y2="65" stroke="#F5DFAA" stroke-width="1.5"/>
        <circle cx="50" cy="54" r="4" fill="#F1D28B"/>
      </svg>`;
    }
    if (tier === 'perito') {
      return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="Medalha Perito Hereditário">
        <defs>
          <linearGradient id="bgSilv" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E5E1D8"/><stop offset="50%" stop-color="#A6A39B"/><stop offset="100%" stop-color="#5E5C56"/>
          </linearGradient>
          <radialGradient id="bgSlate" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stop-color="#567691"/><stop offset="100%" stop-color="#223240"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#171513"/>
        <rect x="38" y="4" width="24" height="17" rx="2" fill="#354B5E" stroke="#B5893D" stroke-width="1.4"/>
        <polygon points="50,18 76,27 84,54 74,78 50,89 26,78 16,54 24,27" fill="url(#bgSilv)" stroke="#383530" stroke-width="2"/>
        <polygon points="50,24 71,32 77,54 69,73 50,82 31,73 23,54 29,32" fill="url(#bgSlate)" stroke="#D1AA62" stroke-width="1.8"/>
        <!-- Grade Punnett sutil + dupla hélice prateada -->
        <g stroke="rgba(239,230,213,0.28)" stroke-width="1.2">
          <rect x="35" y="39" width="30" height="30" rx="2" fill="none"/>
          <line x1="50" y1="39" x2="50" y2="69"/><line x1="35" y1="54" x2="65" y2="54"/>
        </g>
        <path d="M40,36 C40,48 60,48 60,54 C60,60 40,60 40,72" fill="none" stroke="#E8C67A" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M60,36 C60,48 40,48 40,54 C40,60 60,60 60,72" fill="none" stroke="#F4EFE2" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`;
    }
    // estagiario (bronze antigo)
    return `<svg class="${cls}" viewBox="0 0 100 100" role="img" aria-label="Medalha Estagiário de Perícia">
      <defs>
        <linearGradient id="bgBrz" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#D4A66E"/><stop offset="52%" stop-color="#9A6D3C"/><stop offset="100%" stop-color="#583C1E"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#171513"/>
      <rect x="38" y="4" width="24" height="18" rx="2" fill="#4A3C2E" stroke="#9A6D3C" stroke-width="1.4"/>
      <circle cx="50" cy="56" r="34" fill="url(#bgBrz)" stroke="#3B2714" stroke-width="2"/>
      <circle cx="50" cy="56" r="28" fill="#27201A" stroke="#D4A66E" stroke-width="1.6"/>
      <circle cx="50" cy="56" r="23" fill="none" stroke="rgba(212,166,110,0.4)" stroke-width="1" stroke-dasharray="3 2.5"/>
      <!-- Broto/lupa gravado em bronze -->
      <path d="M50,70 C50,58 50,50 57,43" fill="none" stroke="#E0B882" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M51,55 C41,53 38,45 42,40 C48,42 52,48 51,55 Z" fill="#C4925A"/>
      <path d="M52,51 C61,48 64,41 60,36 C54,39 51,45 52,51 Z" fill="#E0B882"/>
      <circle cx="34" cy="56" r="2.6" fill="#E0A048"/>
      <circle cx="66" cy="56" r="2.6" fill="#E0A048"/>
    </svg>`;
  }

  // =========================================================================
  // 3. ILUSTRAÇÕES EDITORIAIS DOS CARTÕES DE MENU E SETORES (100% VETORIAL)
  // =========================================================================
  function art(kind, cls = 'card-art-svg') {
    if (kind === 'arquivo') {
      return `<svg class="${cls}" viewBox="0 0 360 210" role="img" aria-label="Pasta do Arquivo de Casos">
        <defs>
          <linearGradient id="deskG1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#29221D"/><stop offset="100%" stop-color="#141210"/>
          </linearGradient>
          <linearGradient id="manila1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#DFCFAE"/><stop offset="100%" stop-color="#C5AF88"/>
          </linearGradient>
        </defs>
        <rect width="360" height="210" fill="url(#deskG1)"/>
        <rect x="8" y="8" width="344" height="194" fill="none" stroke="rgba(181,137,61,0.28)" stroke-width="1"/>
        <!-- Pasta traseira -->
        <path d="M44,38 L162,32 L176,46 L316,42 L322,186 L48,190 Z" fill="#B59D77" stroke="#6E5B40" stroke-width="1.4"/>
        <!-- Folha de dossiê creme -->
        <path d="M58,48 L302,44 L306,174 L60,178 Z" fill="#F3ECE0" stroke="#A6967B" stroke-width="1.2"/>
        <!-- Cabeçalho + linhas de fichário -->
        <rect x="74" y="60" width="96" height="11" rx="2" fill="#962E2A" opacity="0.88"/>
        <g stroke="rgba(53,75,94,0.22)" stroke-width="1">
          <line x1="74" y1="84" x2="212" y2="83"/><line x1="74" y1="96" x2="212" y2="95"/>
          <line x1="74" y1="108" x2="196" y2="107"/><line x1="74" y1="120" x2="208" y2="119"/>
        </g>
        <!-- Mini heredograma colorido na ficha -->
        <g transform="translate(76 128)">
          <rect x="4" y="0" width="16" height="16" rx="2" fill="#2D516C" stroke="#1F1C18" stroke-width="1.2"/>
          <circle cx="52" cy="8" r="8" fill="#C2852E" stroke="#1F1C18" stroke-width="1.2"/>
          <line x1="20" y1="8" x2="44" y2="8" stroke="#1F1C18" stroke-width="1.2"/>
          <line x1="32" y1="8" x2="32" y2="25" stroke="#962E2A" stroke-width="1.3" stroke-dasharray="2.5 2"/>
          <rect x="24" y="25" width="16" height="16" rx="2" fill="rgba(150,46,42,0.16)" stroke="#962E2A" stroke-width="1.5"/>
          <text x="32" y="37" text-anchor="middle" fill="#962E2A" font-family="monospace" font-size="10" font-weight="700">?</text>
        </g>
        <!-- Foto retrato clipada -->
        <g transform="translate(220 50) rotate(4)">
          <rect x="0" y="0" width="74" height="88" rx="2" fill="#F8F3E8" stroke="#8C7B63" stroke-width="1.2"/>
          <rect x="6" y="6" width="62" height="62" fill="#463E36"/>
          <circle cx="37" cy="29" r="13" fill="#C7B69B"/>
          <path d="M16,68 C18,50 28,45 37,45 C46,45 56,50 58,68 Z" fill="#8C7B65"/>
          <!-- Clipe de latão -->
          <path d="M29,-9 L29,12 C29,17 37,17 37,12 L37,-4 C37,-8 32,-8 32,-4 L32,8" fill="none" stroke="#CFA55A" stroke-width="2.6" stroke-linecap="round"/>
        </g>
        <!-- Aba frontal da pasta + lacre carmesim -->
        <path d="M40,142 L320,136 L324,188 L44,192 Z" fill="url(#manila1)" stroke="#7A6548" stroke-width="1.4"/>
        <path d="M254,137 L268,137 L274,190 L260,190 Z" fill="#7D2320" opacity="0.88"/>
        <circle cx="264" cy="162" r="19" fill="#962E2A" stroke="#5E1714" stroke-width="2"/>
        <circle cx="264" cy="162" r="13.5" fill="none" stroke="#D97A74" stroke-width="1.1"/>
        <path d="M258,155 C258,162 270,162 270,169 M270,155 C270,162 258,162 258,169" fill="none" stroke="#F3E5CE" stroke-width="1.6" stroke-linecap="round"/>
      </svg>`;
    }

    if (kind === 'estufa') {
      return `<svg class="${cls}" viewBox="0 0 360 210" role="img" aria-label="Prancha Botânica da Estufa de Mendel">
        <defs>
          <linearGradient id="deskG2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#27211C"/><stop offset="100%" stop-color="#141210"/>
          </linearGradient>
        </defs>
        <rect width="360" height="210" fill="url(#deskG2)"/>
        <rect x="8" y="8" width="344" height="194" fill="none" stroke="rgba(181,137,61,0.28)" stroke-width="1"/>
        <!-- Prancha herbário creme -->
        <rect x="46" y="20" width="268" height="170" rx="4" fill="#EFE6D5" stroke="#8C7B63" stroke-width="1.5"/>
        <rect x="54" y="28" width="252" height="154" fill="none" stroke="rgba(181,137,61,0.55)" stroke-width="1"/>
        <!-- Espécime central carmesim -->
        <g transform="translate(180 18)">
          <path d="M0,126 Q-5,86 0,46" fill="none" stroke="#476643" stroke-width="4" stroke-linecap="round"/>
          <path d="M-2,108 C-26,96 -34,84 -18,86 C-8,88 -2,98 -2,108 Z" fill="#5D8056" stroke="#365033" stroke-width="1"/>
          <path d="M2,94 C28,82 34,70 18,72 C8,74 2,84 2,94 Z" fill="#5D8056" stroke="#365033" stroke-width="1"/>
          <g transform="translate(0 46)">
            <ellipse cx="0" cy="-14" rx="8" ry="13" fill="#A82C32" transform="rotate(0)"/>
            <ellipse cx="0" cy="-14" rx="8" ry="13" fill="#A82C32" transform="rotate(60)"/>
            <ellipse cx="0" cy="-14" rx="8" ry="13" fill="#A82C32" transform="rotate(120)"/>
            <ellipse cx="0" cy="-14" rx="8" ry="13" fill="#A82C32" transform="rotate(180)"/>
            <ellipse cx="0" cy="-14" rx="8" ry="13" fill="#A82C32" transform="rotate(240)"/>
            <ellipse cx="0" cy="-14" rx="8" ry="13" fill="#A82C32" transform="rotate(300)"/>
            <ellipse cx="0" cy="-10" rx="5.5" ry="9" fill="#DE88A3" transform="rotate(30)"/>
            <ellipse cx="0" cy="-10" rx="5.5" ry="9" fill="#DE88A3" transform="rotate(90)"/>
            <ellipse cx="0" cy="-10" rx="5.5" ry="9" fill="#DE88A3" transform="rotate(150)"/>
            <ellipse cx="0" cy="-10" rx="5.5" ry="9" fill="#DE88A3" transform="rotate(210)"/>
            <ellipse cx="0" cy="-10" rx="5.5" ry="9" fill="#DE88A3" transform="rotate(270)"/>
            <ellipse cx="0" cy="-10" rx="5.5" ry="9" fill="#DE88A3" transform="rotate(330)"/>
            <circle r="7" fill="#D4A43C" stroke="#855E14" stroke-width="1"/>
          </g>
          <!-- Vaso terracota -->
          <path d="M-22,126 L22,126 L17,156 L-17,156 Z" fill="#B56035" stroke="#6E351A" stroke-width="1.3"/>
          <rect x="-27" y="118" width="54" height="10" rx="2.5" fill="#C97345" stroke="#6E351A" stroke-width="1.3"/>
          <rect x="-11" y="136" width="22" height="9" rx="1.5" fill="#E4C178" stroke="#856021" stroke-width="0.9"/>
        </g>
        <!-- Flor branca menor à esquerda -->
        <g transform="translate(104 96)">
          <line x1="0" y1="12" x2="0" y2="62" stroke="#476643" stroke-width="2.6"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8.5" fill="#FFFDF8" stroke="#AFA48F" stroke-width="0.9" transform="rotate(0)"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8.5" fill="#FFFDF8" stroke="#AFA48F" stroke-width="0.9" transform="rotate(60)"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8.5" fill="#FFFDF8" stroke="#AFA48F" stroke-width="0.9" transform="rotate(120)"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8.5" fill="#FFFDF8" stroke="#AFA48F" stroke-width="0.9" transform="rotate(180)"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8.5" fill="#FFFDF8" stroke="#AFA48F" stroke-width="0.9" transform="rotate(240)"/>
          <ellipse cx="0" cy="-9" rx="5" ry="8.5" fill="#FFFDF8" stroke="#AFA48F" stroke-width="0.9" transform="rotate(300)"/>
          <circle r="4.8" fill="#D4A43C"/>
        </g>
        <!-- Lupa de latão à direita -->
        <g transform="translate(262 128)">
          <line x1="15" y1="15" x2="34" y2="34" stroke="#5A3C20" stroke-width="8" stroke-linecap="round"/>
          <line x1="12" y1="12" x2="21" y2="21" stroke="#CFA55A" stroke-width="6.5" stroke-linecap="round"/>
          <circle cx="0" cy="0" r="22" fill="rgba(53,75,94,0.14)" stroke="#B5893D" stroke-width="4"/>
          <path d="M-13,-9 A16,16 0 0,1 5,-15" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
        </g>
      </svg>`;
    }

    if (kind === 'retrato') {
      return `<svg class="${cls}" viewBox="0 0 240 160" role="img" aria-label="Prancheta de Retrato Falado">
        <rect width="240" height="160" fill="#1C1916"/>
        <rect x="46" y="14" width="122" height="134" rx="8" fill="#4B3729" stroke="#261B13" stroke-width="1.6"/>
        <rect x="84" y="8" width="46" height="16" rx="4" fill="#B5893D" stroke="#6E4E1B" stroke-width="1.2"/>
        <circle cx="107" cy="16" r="3.5" fill="#1C1916"/>
        <rect x="56" y="24" width="102" height="116" fill="#F2EAD8" stroke="#9C8B70" stroke-width="1"/>
        <g stroke="rgba(53,75,94,0.16)" stroke-width="0.8">
          <line x1="56" y1="48" x2="158" y2="48"/><line x1="56" y1="74" x2="158" y2="74"/><line x1="56" y1="100" x2="158" y2="100"/>
          <line x1="82" y1="24" x2="82" y2="140"/><line x1="107" y1="24" x2="107" y2="140"/><line x1="132" y1="24" x2="132" y2="140"/>
        </g>
        <line x1="62" y1="74" x2="152" y2="74" stroke="rgba(150,46,42,0.45)" stroke-width="1"/>
        <!-- Esboço facial limpo -->
        <path d="M84,66 C84,48 94,40 107,40 C120,40 130,48 130,66 C130,86 122,102 107,104 C92,102 84,86 84,66 Z" fill="#E8D8BC" stroke="#2D2722" stroke-width="1.7"/>
        <path d="M84,64 C84,46 94,42 101,44 L107,51 L113,44 C120,42 130,46 130,64 C132,48 124,35 107,35 C90,35 82,48 84,64 Z" fill="#2D241E"/>
        <circle cx="97" cy="69" r="2.6" fill="#354B5E"/><circle cx="117" cy="69" r="2.6" fill="#354B5E"/>
        <path d="M107,69 L105,81 L109,82" fill="none" stroke="#6E5B48" stroke-width="1.3"/>
        <path d="M99,90 Q107,95 115,90" fill="none" stroke="#6E4239" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M74,138 C76,118 90,112 107,112 C124,112 138,118 140,138" fill="#354B5E" stroke="#1E2B36" stroke-width="1.4"/>
        <!-- Lápis diagonal -->
        <g transform="translate(198 84) rotate(18)">
          <rect x="-5" y="-44" width="10" height="72" fill="#B87E3C" stroke="#5A3A18" stroke-width="1.1"/>
          <polygon points="-5,28 5,28 0,40" fill="#E6CFA8" stroke="#5A3A18" stroke-width="1"/>
          <polygon points="-1.8,35 1.8,35 0,40" fill="#221E1B"/>
          <rect x="-5" y="-52" width="10" height="8" fill="#962E2A"/>
          <rect x="-5" y="-44" width="10" height="5" fill="#CFA55A"/>
        </g>
      </svg>`;
    }

    if (kind === 'sangue') {
      return `<svg class="${cls}" viewBox="0 0 240 160" role="img" aria-label="Laboratório Hemático">
        <rect width="240" height="160" fill="#1C1916"/>
        <!-- Lâmina de tipagem -->
        <rect x="20" y="88" width="130" height="44" rx="3" fill="rgba(232,238,242,0.88)" stroke="#98A5B0" stroke-width="1.3"/>
        <g transform="translate(46 110)">
          <circle r="13" fill="none" stroke="#354B5E" stroke-width="1.1"/>
          <circle r="8.5" fill="#962E2A"/>
          <circle cx="-3" cy="-2" r="2" fill="#5A1412"/><circle cx="3" cy="2" r="2" fill="#5A1412"/><circle cx="2" cy="-3" r="1.8" fill="#5A1412"/>
        </g>
        <g transform="translate(85 110)">
          <circle r="13" fill="none" stroke="#354B5E" stroke-width="1.1"/>
          <circle r="8.5" fill="#962E2A"/>
        </g>
        <g transform="translate(124 110)">
          <circle r="13" fill="none" stroke="#354B5E" stroke-width="1.1"/>
          <circle r="8.5" fill="#962E2A"/>
          <circle cx="-2" cy="2" r="2" fill="#5A1412"/><circle cx="3" cy="-1" r="2" fill="#5A1412"/>
        </g>
        <!-- Cartão de laudo azul-ardósia -->
        <rect x="22" y="22" width="112" height="56" rx="3" fill="#EFE6D5" stroke="#8C7B63" stroke-width="1.1"/>
        <rect x="22" y="22" width="112" height="14" rx="2" fill="#354B5E"/>
        <line x1="32" y1="48" x2="118" y2="48" stroke="#6E6252" stroke-width="2.2"/>
        <line x1="32" y1="60" x2="96" y2="60" stroke="#9C8E7A" stroke-width="2"/>
        <!-- Rack de tubos -->
        <rect x="160" y="122" width="66" height="12" rx="2" fill="#5A3E2A"/>
        <rect x="162" y="64" width="62" height="8" rx="2" fill="#6E4D35"/>
        <g>
          <rect x="170" y="34" width="12" height="86" rx="6" fill="rgba(235,240,244,0.8)" stroke="#9AA5AE" stroke-width="1"/>
          <rect x="172" y="72" width="8" height="46" rx="4" fill="#962E2A"/>
          <rect x="172" y="28" width="8" height="8" rx="1" fill="#A67A4B"/>
        </g>
        <g>
          <rect x="188" y="34" width="12" height="86" rx="6" fill="rgba(235,240,244,0.8)" stroke="#9AA5AE" stroke-width="1"/>
          <rect x="190" y="82" width="8" height="36" rx="4" fill="#B5893D"/>
          <rect x="190" y="28" width="8" height="8" rx="1" fill="#A67A4B"/>
        </g>
        <g>
          <rect x="206" y="34" width="12" height="86" rx="6" fill="rgba(235,240,244,0.8)" stroke="#9AA5AE" stroke-width="1"/>
          <rect x="208" y="68" width="8" height="50" rx="4" fill="#354B5E"/>
          <rect x="208" y="28" width="8" height="8" rx="1" fill="#A67A4B"/>
        </g>
      </svg>`;
    }

    if (kind === 'manual') {
      return `<svg class="${cls}" viewBox="0 0 240 160" role="img" aria-label="Manual de Perícia e Quadro de Punnett">
        <rect width="240" height="160" fill="#1C1916"/>
        <rect x="20" y="20" width="200" height="120" rx="6" fill="#3B2C22" stroke="#1E1510" stroke-width="1.6"/>
        <rect x="28" y="26" width="90" height="108" rx="2" fill="#EFE6D5" stroke="#A6967B" stroke-width="1"/>
        <rect x="122" y="26" width="90" height="108" rx="2" fill="#E6DAC2" stroke="#A6967B" stroke-width="1"/>
        <!-- Grade Punnett 2x2 na página esquerda -->
        <g transform="translate(46 46)">
          <rect x="10" y="10" width="48" height="48" fill="#FAF6EC" stroke="#2A2520" stroke-width="1.6"/>
          <line x1="34" y1="2" x2="34" y2="58" stroke="#2A2520" stroke-width="1.4"/>
          <line x1="2" y1="34" x2="58" y2="34" stroke="#2A2520" stroke-width="1.4"/>
          <rect x="35" y="35" width="22" height="22" fill="rgba(150,46,42,0.18)"/>
          <rect x="13" y="0" width="18" height="6" rx="1.5" fill="#B5893D"/>
          <rect x="37" y="0" width="18" height="6" rx="1.5" fill="#B5893D"/>
          <rect x="0" y="13" width="6" height="18" rx="1.5" fill="#354B5E"/>
          <rect x="0" y="37" width="6" height="18" rx="1.5" fill="#354B5E"/>
        </g>
        <!-- Pautas + lacre + caneta na página direita -->
        <g stroke="rgba(53,75,94,0.28)" stroke-width="1">
          <line x1="132" y1="42" x2="200" y2="42"/><line x1="132" y1="54" x2="196" y2="54"/>
          <line x1="132" y1="66" x2="200" y2="66"/><line x1="132" y1="78" x2="188" y2="78"/>
        </g>
        <polygon points="116,134 124,134 126,154 120,148 114,154" fill="#962E2A"/>
        <circle cx="188" cy="112" r="12" fill="#962E2A" stroke="#5E1714" stroke-width="1.4"/>
        <g transform="translate(166 78) rotate(38)">
          <rect x="-4" y="-34" width="8" height="58" rx="2" fill="#231F1C"/>
          <rect x="-4" y="-4" width="8" height="5" fill="#CFA55A"/>
          <polygon points="-4,24 4,24 0,36" fill="#CFA55A"/>
        </g>
      </svg>`;
    }

    if (kind === 'loja') {
      return `<svg class="${cls}" viewBox="0 0 360 210" role="img" aria-label="Vitrine da Loja Mudança Genética">
        <defs>
          <linearGradient id="lojaBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#141518"/><stop offset="55%" stop-color="#1B1C20"/><stop offset="100%" stop-color="#101114"/>
          </linearGradient>
          <linearGradient id="studioRail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#D8B16A"/><stop offset="35%" stop-color="#E8E4DC"/><stop offset="68%" stop-color="#2FA37C"/><stop offset="100%" stop-color="#D95F48"/>
          </linearGradient>
          <radialGradient id="studioGlow" cx="50%" cy="46%" r="54%">
            <stop offset="0%" stop-color="#D8B16A" stop-opacity="0.18"/>
            <stop offset="58%" stop-color="#2FA37C" stop-opacity="0.09"/>
            <stop offset="100%" stop-color="#101114" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="360" height="210" fill="url(#lojaBg)"/>
        <circle cx="180" cy="104" r="126" fill="url(#studioGlow)"/>
        <!-- Vitrine arquitetônica em vidro fumê com filete metálico -->
        <rect x="24" y="18" width="312" height="174" rx="12" fill="rgba(20,21,25,0.72)" stroke="url(#studioRail)" stroke-width="1.4"/>
        <line x1="24" y1="158" x2="336" y2="158" stroke="url(#studioRail)" stroke-width="1.2" opacity="0.72"/>
        <!-- Arco estrutural de estufa minimalista -->
        <path d="M54,158 L54,66 Q180,18 306,66 L306,158" fill="none" stroke="rgba(232,228,220,0.16)" stroke-width="1.1"/>
        <!-- Hélice discreta gravada no vidro ao fundo -->
        <g opacity="0.22">
          <path d="M168,36 C168,62 192,66 192,90 C192,114 168,118 168,144" fill="none" stroke="#D8B16A" stroke-width="1.8"/>
          <path d="M192,36 C192,62 168,66 168,90 C168,114 192,118 192,144" fill="none" stroke="#E8E4DC" stroke-width="1.5"/>
        </g>
        <!-- 1. Cerejeira Bonsai -->
        <g transform="translate(80 144)">
          <rect x="-24" y="0" width="48" height="12" rx="3" fill="#232220" stroke="#D8B16A" stroke-width="0.85"/>
          <path d="M0,0 C-4,-18 -14,-24 -8,-38 C-2,-48 14,-44 16,-54" fill="none" stroke="#6E4730" stroke-width="5.5" stroke-linecap="round"/>
          <circle cx="-14" cy="-42" r="14" fill="#D96B58" opacity="0.92"/>
          <circle cx="4" cy="-54" r="17" fill="#F2B5A7"/>
          <circle cx="18" cy="-44" r="13" fill="#D96B58" opacity="0.88"/>
          <ellipse cx="-18" cy="-32" rx="8" ry="4.5" fill="#2A7A4B"/>
          <ellipse cx="18" cy="-34" rx="8" ry="4.5" fill="#D8B16A"/>
        </g>
        <!-- 2. Tulipa Rajada -->
        <g transform="translate(148 144)">
          <path d="M-13,0 L13,0 L10,14 L-10,14 Z" fill="#262523" stroke="#625C52" stroke-width="0.9"/>
          <path d="M0,0 Q-3,-30 0,-56" fill="none" stroke="#2E8B57" stroke-width="3.2" stroke-linecap="round"/>
          <path d="M-1,-12 C-16,-24 -18,-42 -12,-50 C-10,-34 -6,-22 0,-12 Z" fill="#2A7A4B"/>
          <g transform="translate(0 -62)">
            <path d="M-12,-10 C-13,5 -7,13 0,13 C7,13 13,5 12,-10 C7,-3 3,-6 0,-14 C-3,-6 -7,-3 -12,-10 Z" fill="#C92A2A"/>
            <path d="M-6,10 Q-5,0 -8,-11 M0,11 L0,-13 M6,10 Q5,0 8,-11" stroke="#F4D06F" stroke-width="1.6" fill="none"/>
          </g>
        </g>
        <!-- 3. Espiga de Milho Mesclado -->
        <g transform="translate(212 144)">
          <path d="M-15,0 L15,0 L12,14 L-12,14 Z" fill="#463226" stroke="#755642" stroke-width="0.9"/>
          <line x1="-2" y1="0" x2="-2" y2="-72" stroke="#2E8B57" stroke-width="4.2" stroke-linecap="round"/>
          <path d="M-2,-24 C-22,-32 -28,-22 -24,-12 C-16,-18 -8,-18 -2,-18 Z" fill="#2A7A4B"/>
          <g transform="translate(4 -44) rotate(12)">
            <rect x="-10" y="-18" width="20" height="34" rx="8" fill="#E5B82E" stroke="#6B4A14" stroke-width="0.8"/>
            <rect x="-7" y="-12" width="4.5" height="4.5" rx="1.5" fill="#6D2E6F"/>
            <rect x="2" y="-6" width="4.5" height="4.5" rx="1.5" fill="#6D2E6F"/>
            <rect x="-6" y="0" width="4.5" height="4.5" rx="1.5" fill="#823B85"/>
            <rect x="1" y="6" width="4.5" height="4.5" rx="1.5" fill="#6D2E6F"/>
            <path d="M-10,16 C-16,4 -16,-10 -9,-12 C-11,0 -10,10 -4,16 Z" fill="#4C9F68"/>
            <path d="M10,16 C16,4 16,-10 9,-12 C11,0 10,10 4,16 Z" fill="#4C9F68"/>
          </g>
        </g>
        <!-- 4. Cacto Pitaia com Frutos -->
        <g transform="translate(278 144)">
          <path d="M-15,0 L15,0 L12,14 L-12,14 Z" fill="#262523" stroke="#2FA37C" stroke-width="0.85"/>
          <rect x="-10" y="-56" width="20" height="56" rx="10" fill="#23865B" stroke="#114A31" stroke-width="1.1"/>
          <path d="M-10,-24 L-20,-24 Q-24,-24 -24,-30 L-24,-40 Q-24,-45 -19,-45 Q-14,-45 -14,-40 L-14,-33 L-10,-33 Z" fill="#23865B" stroke="#114A31" stroke-width="1"/>
          <path d="M10,-30 L20,-30 Q24,-30 24,-36 L24,-46 Q24,-51 19,-51 Q14,-51 14,-46 L14,-38 L10,-38 Z" fill="#23865B" stroke="#114A31" stroke-width="1"/>
          <ellipse cx="0" cy="-62" rx="7.5" ry="9.5" fill="#C92A54" stroke="#5A1024" stroke-width="0.7"/>
          <path d="M-6,-62 L-10,-66 L-4,-64 Z M6,-62 L10,-66 L4,-64 Z" fill="#4ADE80"/>
        </g>
        <!-- Pontos de luz de galeria -->
        <circle cx="62" cy="46" r="1.8" fill="#D8B16A" opacity="0.75"/>
        <circle cx="180" cy="30" r="1.6" fill="#F2EFE9" opacity="0.7"/>
        <circle cx="298" cy="48" r="1.8" fill="#2FA37C" opacity="0.75"/>
      </svg>`;
    }

    // herbario
    return `<svg class="${cls}" viewBox="0 0 240 160" role="img" aria-label="Álbum do Herbário">
      <rect width="240" height="160" fill="#1C1916"/>
      <rect x="26" y="18" width="188" height="124" rx="5" fill="#EFE6D5" stroke="#8C7B63" stroke-width="1.4"/>
      <rect x="34" y="26" width="172" height="108" fill="none" stroke="rgba(181,137,61,0.5)" stroke-width="1"/>
      <!-- 3 espécimes prensados -->
      <g transform="translate(74 84)">
        <line x1="0" y1="-22" x2="0" y2="34" stroke="#476643" stroke-width="2.4"/>
        <circle cx="0" cy="-24" r="11" fill="#A82C32"/><circle cx="0" cy="-24" r="4.5" fill="#D4A43C"/>
        <rect x="-12" y="8" width="24" height="5" fill="rgba(218,200,165,0.85)" transform="rotate(-14)"/>
      </g>
      <g transform="translate(120 82)">
        <line x1="0" y1="-26" x2="0" y2="36" stroke="#476643" stroke-width="2.4"/>
        <circle cx="0" cy="-28" r="12" fill="#DE88A3"/><circle cx="0" cy="-28" r="4.5" fill="#D4A43C"/>
        <rect x="-12" y="10" width="24" height="5" fill="rgba(218,200,165,0.85)" transform="rotate(10)"/>
      </g>
      <g transform="translate(166 88)">
        <line x1="0" y1="-16" x2="0" y2="30" stroke="#476643" stroke-width="2.4"/>
        <circle cx="0" cy="-18" r="10" fill="#FFFDF8" stroke="#ABA08A" stroke-width="1"/><circle cx="0" cy="-18" r="4" fill="#D4A43C"/>
        <rect x="-11" y="8" width="22" height="5" fill="rgba(218,200,165,0.85)" transform="rotate(-8)"/>
      </g>
      <rect x="150" y="34" width="44" height="12" rx="2" fill="#962E2A"/>
    </svg>`;
  }

  // =========================================================================
  // 3B. AVATARES VETORIAIS DOS CLIENTES DA LOJA "MUDANÇA GENÉTICA"
  // =========================================================================
  const CUSTOMER_STYLES = [
    { bg: '#211E1C', rim: '#D96B58', skin: '#EAB897', hair: '#2D1B14', hairStyle: 'bun', shirt: '#8C3B30', glasses: true },
    { bg: '#1A2024', rim: '#5A8FA8', skin: '#C68B59', hair: '#23262A', hairStyle: 'short', shirt: '#2E4C5E', glasses: false },
    { bg: '#1A221E', rim: '#2FA37C', skin: '#F1C5A8', hair: '#7C2D12', hairStyle: 'wavy', shirt: '#1E5C45', glasses: false },
    { bg: '#231F18', rim: '#D8B16A', skin: '#E2B48D', hair: '#CBD5E1', hairStyle: 'short', shirt: '#3B3935', glasses: true },
    { bg: '#221C1E', rim: '#C7785E', skin: '#8D5524', hair: '#18181B', hairStyle: 'curly', shirt: '#6E3B2E', glasses: false },
    { bg: '#1B2026', rim: '#6C8EA4', skin: '#D99E73', hair: '#3F2A1D', hairStyle: 'parted', shirt: '#2A3F52', glasses: true },
    { bg: '#251C1D', rim: '#D95F48', skin: '#F3C6AA', hair: '#4A2622', hairStyle: 'bob', shirt: '#8A302B', glasses: false },
    { bg: '#192220', rim: '#3D9C82', skin: '#B57B50', hair: '#27272A', hairStyle: 'short', shirt: '#24584A', glasses: false },
  ];

  function customerAvatar(idx = 0, cls = 'cust-avatar-svg') {
    const c = CUSTOMER_STYLES[Math.abs(idx) % CUSTOMER_STYLES.length];
    let hairBack = '';
    let hairFront = '';
    if (c.hairStyle === 'bun') {
      hairBack = `<circle cx="32" cy="14" r="9" fill="${c.hair}"/>`;
      hairFront = `<path d="M18,28 C18,16 25,13 32,13 C39,13 46,16 46,28 C42,21 37,20 32,20 C27,20 22,21 18,28 Z" fill="${c.hair}"/>`;
    } else if (c.hairStyle === 'wavy') {
      hairBack = `<path d="M15,32 C14,16 22,12 32,12 C42,12 50,16 49,32 C50,42 46,48 42,48 L22,48 C18,48 14,42 15,32 Z" fill="${c.hair}"/>`;
      hairFront = `<path d="M18,26 C21,18 27,17 32,19 C37,17 43,18 46,26 C44,16 39,13 32,13 C25,13 20,16 18,26 Z" fill="${c.hair}"/>`;
    } else if (c.hairStyle === 'curly') {
      hairBack = `<circle cx="19" cy="24" r="7" fill="${c.hair}"/><circle cx="45" cy="24" r="7" fill="${c.hair}"/><circle cx="24" cy="17" r="7" fill="${c.hair}"/><circle cx="40" cy="17" r="7" fill="${c.hair}"/><circle cx="32" cy="15" r="7.5" fill="${c.hair}"/>`;
    } else if (c.hairStyle === 'bob') {
      hairBack = `<path d="M16,28 C16,15 23,12 32,12 C41,12 48,15 48,28 L47,42 L17,42 Z" fill="${c.hair}"/>`;
      hairFront = `<path d="M18,24 L46,24 C45,15 39,13 32,13 C25,13 19,15 18,24 Z" fill="${c.hair}"/>`;
    } else {
      hairFront = `<path d="M18,27 C18,16 24,12 32,12 C40,12 46,16 46,27 C43,21 37,19 32,19 C26,19 21,21 18,27 Z" fill="${c.hair}"/>`;
    }

    const glasses = c.glasses
      ? `<g fill="rgba(56,189,248,0.14)" stroke="#E2E8F0" stroke-width="1.3">
          <rect x="21" y="27" width="9" height="6.5" rx="2.5"/>
          <rect x="34" y="27" width="9" height="6.5" rx="2.5"/>
          <line x1="30" y1="30" x2="34" y2="30"/>
        </g>` : '';

    return `<svg class="${cls}" viewBox="0 0 64 64" role="img" aria-label="Retrato do cliente">
      <circle cx="32" cy="32" r="30" fill="${c.bg}" stroke="${c.rim}" stroke-width="2.2"/>
      ${hairBack}
      <path d="M12,60 C14,47 22,43 32,43 C42,43 50,47 52,60 Z" fill="${c.shirt}"/>
      <rect x="28" y="39" width="8" height="7" rx="3" fill="${c.skin}"/>
      <ellipse cx="32" cy="30" rx="13" ry="14" fill="${c.skin}"/>
      ${hairFront}
      <circle cx="26.5" cy="30" r="1.8" fill="#0F172A"/>
      <circle cx="37.5" cy="30" r="1.8" fill="#0F172A"/>
      <path d="M28,37 Q32,40.5 36,37" fill="none" stroke="#7C2D12" stroke-width="1.5" stroke-linecap="round"/>
      ${glasses}
    </svg>`;
  }

  // =========================================================================
  // 4. CONJUNTO COMPLETO DE ÍCONES VETORIAIS (ZERO EMOJIS!)
  // =========================================================================
  const ICONS = {
    desk: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 16h20M6 16v4M18 16v4"/>',
    home: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5z"/>',
    shop: '<path d="M3 9l1.5-5h15L21 9M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.5 10c0-1.1 1.1-1.8 2.5-1.8s2.5.7 2.5 1.8c0 2-5 1.5-5 3.6 0 1.2 1.1 1.9 2.5 1.9s2.5-.7 2.5-1.9"/>',
    star: '<polygon points="12 3 14.8 8.7 21 9.6 16.5 14 17.6 20.2 12 17.3 6.4 20.2 7.5 14 3 9.6 9.2 8.7 12 3"/>',
    seed: '<path d="M12 21c5-2 8-7 8-13C14 8 9 11 7 16c-1 2.5-1 5-1 5h6z"/><path d="M6 21c2-4 5-7 9-10"/>',
    package: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    zap: '<polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/><path d="M8 12h8M8 15.5h5"/>',
    leaf: '<path d="M19 5c-7 0-12 4-13 11 0 1 0 2 1 2 7-1 12-6 12-13z"/><path d="M5 19c2-4 5-7 10-10"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M9 7h7M9 11h5"/>',
    flask: '<path d="M9 3h6M10 3v5.5L5.2 17a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3L14 8.5V3"/><path d="M7.5 14h9"/>',
    manual: '<path d="M2 5.5C4.5 4.5 7.5 4.5 12 6.5c4.5-2 7.5-2 10-1v13c-2.5-1-5.5-1-10 1-4.5-2-7.5-2-10-1v-13z"/><path d="M12 6.5v13"/>',
    soundOn: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>',
    soundOff: '<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/>',
    musicOn: '<path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    musicOff: '<path d="M9 18V6l11-2v8"/><circle cx="6.5" cy="18" r="2.5"/><path d="M15 14l6 6M21 14l-6 6"/>',
    magnifier: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    pin: '<path d="M14 4l6 6-4 4-2 5-3-3-5 5-1-1 5-5-3-3 5-2 4-4z"/>',
    stamp: '<path d="M5 19h14M6 16h12v3H6zM9 16v-2.5a3 3 0 0 1 1.4-2.5 2.5 2.5 0 1 1 3.2 0A3 3 0 0 1 15 13.5V16"/>',
    grid: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/>',
    xray: '<circle cx="12" cy="12" r="8"/><path d="M9 8c0 3 6 3 6 4s-6 1-6 4M15 8c0 3-6 3-6 4s6 1 6 4"/>',
    dna: '<path d="M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/><path d="M8.5 6.5h7M9 12h6M8.5 17.5h7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    refresh: '<path d="M4 12a8 8 0 0 1 14-5l2 2M20 4v5h-5M20 12a8 8 0 0 1-14 5l-2-2M4 20v-5h5"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    spark: '<path d="M12 3l2.2 6.2L20 12l-5.8 2.8L12 21l-2.2-6.2L4 12l5.8-2.8z"/>',
    list: '<path d="M4 6h16M4 12h16M4 18h10"/>',
    hint: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.8c.7.5 1 1.2 1 2.2h5c0-1 .3-1.7 1-2.2A6 6 0 0 0 12 3z"/>',
  };

  function icon(name, size = 16, cls = '') {
    const paths = ICONS[name] || ICONS.folder;
    return `<svg class="ui-ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  }

  return { logo, badge, art, customerAvatar, icon };
})();
