/* WEREWOLF BITE — Artes SVG dedicadas por família de inimigo e 10 Chefes Regionais */
(function () {
  "use strict";

  var artSerial = 0;

  function lower(v) {
    return String(v || "").toLowerCase();
  }

  function paletteFor(enemy) {
    var beh = lower(enemy && enemy.behavior);
    var type = lower(enemy && enemy.type);
    var id = String((enemy && enemy.id) || "");
    if (enemy && (enemy.boss || /^boss_/.test(id))) {
      var bossPalettes = {
        boss_0: { a: "#7f96b8", b: "#e6f0ff", c: "#151a26", glow: "#9bd2ff" }, // Inquisidor de Prata
        boss_1: { a: "#5d996d", b: "#bdecc2", c: "#121f17", glow: "#7cf29c" }, // Mãe Oca
        boss_2: { a: "#9c8d74", b: "#eee2c8", c: "#1c1814", glow: "#ffad52" }, // Coletor de Ossos
        boss_3: { a: "#b82d46", b: "#f0c979", c: "#260c14", glow: "#ff4f70" }, // Corretor Velado
        boss_4: { a: "#7988b8", b: "#e2be76", c: "#141624", glow: "#8ceeff" }, // Santo Vesper
        boss_5: { a: "#8da6c2", b: "#eff6ff", c: "#121822", glow: "#80d8ff" }, // Viúva Argêntea
        boss_6: { a: "#b83644", b: "#e6a59e", c: "#241215", glow: "#ff4e63" }, // Açougueiro
        boss_7: { a: "#5d84c4", b: "#d8e9ff", c: "#101624", glow: "#8cbfff" }, // Devorador da Lua
        boss_8: { a: "#8d63b8", b: "#ecd08b", c: "#1a1124", glow: "#c68dff" }, // Rainha sem Rosto
        boss_9: { a: "#b04be0", b: "#f3cf86", c: "#150a1f", glow: "#e07bff" }, // Coração do Eclipse
      };
      return bossPalettes[id] || { a: "#c93d57", b: "#f0c979", c: "#26101a", glow: "#ff4e6d" };
    }
    if (beh === "poison") return { a: "#62b578", b: "#b9f0a4", c: "#122117", glow: "#63e688" };
    if (beh === "burn") return { a: "#e36c3c", b: "#ffd178", c: "#29140d", glow: "#ff7733" };
    if (beh === "bleed" || beh === "berserk") return { a: "#c43448", b: "#ff8c9b", c: "#231016", glow: "#ff455f" };
    if (beh === "shield" || beh === "defensive") return { a: "#7b98bf", b: "#dce8f8", c: "#141a26", glow: "#8fb8ff" };
    if (beh === "healer" || beh === "summoner" || beh === "control") return { a: "#9b72d4", b: "#e0c4ff", c: "#191228", glow: "#bb8aff" };
    if (type === "undead") return { a: "#62b0b8", b: "#c8f4f2", c: "#111c21", glow: "#74e8ec" };
    if (type === "demon") return { a: "#d95638", b: "#ffc470", c: "#24110f", glow: "#ff6238" };
    if (type === "ancient") return { a: "#a86fe0", b: "#f2d6ff", c: "#1a1026", glow: "#c688ff" };
    if (type === "hunter") return { a: "#9eb4cc", b: "#eef5ff", c: "#151a24", glow: "#b8d6ff" };
    return { a: "#7d88a8", b: "#d8dfed", c: "#161822", glow: "#9fb2de" };
  }

  function wrapSvg(body, p, uid, isBoss) {
    var ring = isBoss
      ? '<g class="wb-boss-aura" opacity=".52"><circle cx="200" cy="220" r="148" fill="none" stroke="' +
        p.b +
        '" stroke-width="2.5" stroke-dasharray="10 12"/><circle cx="200" cy="220" r="124" fill="none" stroke="' +
        p.a +
        '" stroke-width="1.5" opacity=".7"/></g>'
      : "";
    return (
      '<svg class="portrait-svg wb-enemy-art' +
      (isBoss ? " wb-boss-art" : "") +
      '" viewBox="0 0 400 500" role="img" aria-label="Inimigo" preserveAspectRatio="xMidYMid meet">' +
      "<defs>" +
      '<radialGradient id="' + uid + 'aura" cx="50%" cy="44%" r="52%"><stop offset="0%" stop-color="' + p.glow + '" stop-opacity="' + (isBoss ? ".38" : ".24") + '"/><stop offset="62%" stop-color="' + p.a + '" stop-opacity=".08"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + uid + 'metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="' + p.b + '"/><stop offset="48%" stop-color="' + p.a + '"/><stop offset="100%" stop-color="#171922"/></linearGradient>' +
      '<linearGradient id="' + uid + 'cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + p.c + '"/><stop offset="55%" stop-color="#11121a"/><stop offset="100%" stop-color="#07080d"/></linearGradient>' +
      '<filter id="' + uid + 'glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      "</defs>" +
      '<circle cx="200" cy="220" r="176" fill="url(#' + uid + 'aura)"/>' +
      ring +
      '<g class="wb-character-core">' +
      body +
      "</g></svg>"
    );
  }

  /* ===================== 10 CHEFES REGIONAIS ===================== */
  function bossBody(id, p, uid) {
    var m = "url(#" + uid + "metal)";
    var cl = "url(#" + uid + "cloth)";
    var gl = "url(#" + uid + "glow)";

    if (id === "boss_0") {
      // O Inquisidor de Prata
      return (
        '<path d="M98 468L130 198l70-30 70 30 32 270-58-24-44 26-44-26Z" fill="' + cl + '" stroke="' + p.b + '" stroke-width="3.5"/>' +
        '<path d="M126 205l-34 22 18 52 38-18Zm148 0 34 22-18 52-38-18Z" fill="' + m + '" stroke="#f4f8ff" stroke-width="3"/>' +
        '<path d="M154 202h92l-14 148-32 22-32-22Z" fill="#1b1f2c" stroke="' + p.b + '" stroke-width="3.5"/>' +
        '<path d="M200 218v126M166 254h68" stroke="' + p.b + '" stroke-width="6" stroke-linecap="round"/>' +
        // Mitra / Elmo de prata
        '<path d="M156 172l8-90 36-52 36 52 8 90-44 26Z" fill="' + m + '" stroke="#fff" stroke-width="3"/>' +
        '<path d="M170 128h60M200 42v144" stroke="#111520" stroke-width="5"/>' +
        '<path d="M174 128h18m16 0h18" stroke="#9be0ff" stroke-width="5" filter="' + gl + '"/>' +
        // Alabarda-Cruz Prateada
        '<path d="M312 48v428" stroke="#cfdcf0" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="M270 112h84M312 42l22 52-22 36-22-36Z" fill="' + m + '" stroke="#fff" stroke-width="3" filter="' + gl + '"/>'
      );
    }
    if (id === "boss_1") {
      // Mãe Oca (entidade arbórea)
      return (
        '<g stroke="#29382f" stroke-width="11" stroke-linecap="round" fill="none">' +
        '<path d="M176 116C140 74 114 48 82 28m46 58c-26 2-46-6-62-22m90 22c-16-36-20-58-12-78"/>' +
        '<path d="M224 116c36-42 62-68 94-88m-46 58c26 2 46-6 62-22m-90 22c16-36 20-58 12-78"/>' +
        "</g>" +
        '<path d="M90 472c18-92 34-184 52-262 24-28 92-28 116 0 18 78 34 170 52 262-34-18-62-24-110-4-48-20-76-14-110 4Z" fill="#17201b" stroke="#6d9c7a" stroke-width="4"/>' +
        '<path d="M150 232c22 40 78 40 100 0l-14 146-36 30-36-30Z" fill="#0d1410" stroke="#96d6a2" stroke-width="2.5"/>' +
        '<circle cx="200" cy="288" r="22" fill="#8df0a5" opacity=".72" filter="' + gl + '"/>' +
        '<path d="M162 118q38-42 76 0l8 64q-38 42-92 0Z" fill="#253029" stroke="#93d4a0" stroke-width="3.5"/>' +
        '<ellipse cx="182" cy="148" rx="9" ry="5" fill="#9cffb5" filter="' + gl + '"/>' +
        '<ellipse cx="218" cy="148" rx="9" ry="5" fill="#9cffb5" filter="' + gl + '"/>' +
        '<path d="M188 176q12 16 24 0" fill="none" stroke="#9cffb5" stroke-width="4" filter="' + gl + '"/>'
      );
    }
    if (id === "boss_2") {
      // O Coletor de Ossos
      return (
        '<path d="M96 474l26-256 78-36 78 36 26 256-68-30-36 28-36-28Z" fill="' + cl + '" stroke="#9e9280" stroke-width="3.5"/>' +
        // Correntes cruzadas e crânios
        '<path d="M124 236L278 358M276 236L122 358" stroke="#c8b99e" stroke-width="7" stroke-dasharray="10 7"/>' +
        '<g fill="#e6dcc6" stroke="#474036" stroke-width="2.5"><circle cx="152" cy="260" r="14"/><circle cx="248" cy="260" r="14"/><circle cx="200" cy="300" r="17"/></g>' +
        // Capuz e crânio do Coletor
        '<path d="M148 186q52-122 104 0l-16 26h-72Z" fill="#13141c" stroke="#c9b694" stroke-width="3.5"/>' +
        '<path d="M170 132q30-30 60 0l-6 46q-24 20-48 0Z" fill="#ded4be"/>' +
        '<circle cx="186" cy="146" r="6" fill="#ff9e42" filter="' + gl + '"/><circle cx="214" cy="146" r="6" fill="#ff9e42" filter="' + gl + '"/>' +
        // Lanterna fantasma + Foice
        '<path d="M86 84v386" stroke="#857867" stroke-width="7"/>' +
        '<path d="M86 84c66-28 118-10 144 36-56-16-102-8-144 10Z" fill="' + m + '" stroke="#f2e6cf" stroke-width="3"/>' +
        '<rect x="306" y="256" width="34" height="52" rx="6" fill="#1e2430" stroke="#e4c686" stroke-width="3"/>' +
        '<circle cx="323" cy="282" r="11" fill="#7beeff" filter="' + gl + '"/>'
      );
    }
    if (id === "boss_3") {
      // O Corretor Velado
      return (
        '<path d="M84 474l36-264 80-32 80 32 36 264-116-30Z" fill="#2c0b16" stroke="#e6ba6e" stroke-width="3.5"/>' +
        '<path d="M132 198L92 102l68 58 40-18 40 18 68-58-40 96Z" fill="#5e1126" stroke="#f0c979" stroke-width="3"/>' +
        '<path d="M164 206h72l-10 156-26 22-26-22Z" fill="#140c14" stroke="#e6ba6e" stroke-width="3"/>' +
        // Máscara dourada dupla
        '<path d="M162 110q38-36 76 0l-8 72-30 24-30-24Z" fill="' + m + '" stroke="#fff0c9" stroke-width="3"/>' +
        '<path d="M200 84v122" stroke="#2d171c" stroke-width="3"/>' +
        '<path d="M174 134l18 4-6 8Zm52 0-18 4 6 8Z" fill="#ff3b5c" filter="' + gl + '"/>' +
        // Balança de memórias rubi
        '<path d="M286 244h82M327 216v68" stroke="#f0c979" stroke-width="4"/>' +
        '<circle cx="294" cy="276" r="14" fill="#ff3d63" opacity=".82" filter="' + gl + '"/>' +
        '<circle cx="360" cy="276" r="14" fill="#90d6ff" opacity=".82" filter="' + gl + '"/>'
      );
    }
    if (id === "boss_4") {
      // Santo Vesper
      return (
        '<circle cx="200" cy="134" r="68" fill="none" stroke="#e2be76" stroke-width="5" stroke-dasharray="14 6" filter="' + gl + '"/>' +
        '<path d="M110 462l22-254 68-28 68 28 22 254-46-26-44 34-44-34Z" fill="#171724" stroke="#a6b2d6" stroke-width="3.5"/>' +
        '<path d="M162 204l38 56 38-56v186l-38 24-38-24Z" fill="#232438" stroke="#e2be76" stroke-width="3"/>' +
        '<path d="M168 118q32-38 64 0l-4 58q-28 24-56 0Z" fill="#ced4e4" stroke="#474d64" stroke-width="3"/>' +
        '<path d="M174 138h52" stroke="#181924" stroke-width="10"/>' +
        '<circle cx="186" cy="138" r="5" fill="#92f3ff" filter="' + gl + '"/><circle cx="214" cy="138" r="5" fill="#92f3ff" filter="' + gl + '"/>' +
        '<path d="M98 258l-16 86m0 0l-18 28h36Z" fill="#89e8ff" stroke="#e2be76" stroke-width="3" filter="' + gl + '"/>'
      );
    }
    if (id === "boss_5") {
      // A Viúva Argêntea
      return (
        // Teia prateada atrás
        '<g stroke="#b8cde4" stroke-opacity=".38" stroke-width="2" fill="none"><circle cx="200" cy="210" r="110"/><circle cx="200" cy="210" r="68"/><path d="M200 95v230M88 210h224M122 132l156 156M278 132L122 288"/></g>' +
        '<path d="M118 470l28-260 54-26 54 26 28 260-82-22Z" fill="#141923" stroke="#d4e4f7" stroke-width="3.5"/>' +
        '<path d="M150 104q50-56 100 0l22 122q-72 28-144 0Z" fill="#1c2433" fill-opacity=".86" stroke="#d8e9ff" stroke-width="3"/>' +
        '<path d="M170 120q30-26 60 0l-6 52q-24 22-48 0Z" fill="#dce4f0"/>' +
        '<circle cx="186" cy="138" r="5" fill="#63d7ff" filter="' + gl + '"/><circle cx="214" cy="138" r="5" fill="#63d7ff" filter="' + gl + '"/>' +
        // Lâminas gêmeas prateadas
        '<path d="M124 282L46 184l26 116 48 22Zm152 0 78-98-26 116-48 22Z" fill="' + m + '" stroke="#fff" stroke-width="3"/>'
      );
    }
    if (id === "boss_6") {
      // O Açougueiro do Porto Vermelho
      return (
        '<path d="M74 470l18-246 42-52h132l42 52 18 246-72-18-54 22-54-22Z" fill="#231a1d" stroke="#cf5362" stroke-width="4"/>' +
        '<path d="M126 190h148l16 218H110Z" fill="#3a1920" stroke="#9e3947" stroke-width="3.5"/>' +
        '<path d="M138 224l124 52m-124 38l124-44" stroke="#d9c6b0" stroke-width="3" stroke-dasharray="6 6"/>' +
        '<path d="M158 106q42-34 84 0l10 74q-52 34-104 0Z" fill="#5e4b4c" stroke="#181214" stroke-width="4"/>' +
        '<circle cx="182" cy="136" r="7" fill="#ff485e" filter="' + gl + '"/><circle cx="218" cy="136" r="7" fill="#ff485e" filter="' + gl + '"/>' +
        // Gancho âncora + Cutelo
        '<path d="M72 284L38 148l48-24 28 118Z" fill="' + m + '" stroke="#ff8291" stroke-width="4"/>' +
        '<path d="M326 244v112q0 42 36 42 22 0 26-22-30 4-30-26" fill="none" stroke="#d5dde8" stroke-width="11" stroke-linecap="round"/>'
      );
    }
    if (id === "boss_7") {
      // O Devorador da Lua
      return (
        '<circle cx="200" cy="108" r="56" fill="#dce9ff" opacity=".24" filter="' + gl + '"/>' +
        '<path d="M156 84l26 18 18-32 18 32 26-18-10 38h-68Z" fill="#8db6f5" opacity=".7"/>' +
        '<path d="M62 468l22-180-26-74 68-82 74-26 74 26 68 82-26 74 22 180-86-38-52 34-52-34Z" fill="#131926" stroke="#8fb8ff" stroke-width="4"/>' +
        '<path d="M142 108L108 38l60 44m90 26 34-70-60 44" fill="#1f293d" stroke="#a8c9ff" stroke-width="4"/>' +
        '<path d="M146 116q54-36 108 0l12 76q-66 48-132 0Z" fill="#232d42" stroke="#8fb8ff" stroke-width="3.5"/>' +
        '<path d="M164 148l22 6-14 10Zm72 0-22 6 14 10Z" fill="#b8e2ff" filter="' + gl + '"/>' +
        '<path d="M166 196l16 26 18-18 18 18 16-26" fill="#f3ebd8"/>'
      );
    }
    if (id === "boss_8") {
      // A Rainha sem Rosto
      return (
        '<path d="M96 476l42-254 62-28 62 28 42 254-104-20Z" fill="#1a1224" stroke="#d9b472" stroke-width="3.5"/>' +
        '<path d="M142 216l-36-78 58 32 36-18 36 18 58-32-36 78Z" fill="#2e1d3d" stroke="#d9b472" stroke-width="3"/>' +
        // Coroa flutuante sobre espelho vazio
        '<path d="M154 78l14-40 20 24 12-34 12 34 20-24 14 40Z" fill="' + m + '" stroke="#fff0c2" stroke-width="3" filter="' + gl + '"/>' +
        '<ellipse cx="200" cy="146" rx="34" ry="48" fill="#07050c" stroke="#e4c587" stroke-width="4"/>' +
        '<ellipse cx="200" cy="146" rx="22" ry="34" fill="none" stroke="#c38cff" stroke-opacity=".65" stroke-width="2" filter="' + gl + '"/>' +
        '<path d="M312 126v330" stroke="#e4c587" stroke-width="6"/><circle cx="312" cy="116" r="18" fill="#a86dff" stroke="#fff0c2" stroke-width="3" filter="' + gl + '"/>'
      );
    }
    // boss_9: O Coração do Eclipse
    return (
      '<g opacity=".9">' +
      '<path d="M200 220L52 96l34 116-54 64 118 22Zm0 0l148-124-34 116 54 64-118 22Z" fill="#1a1026" stroke="#c688ff" stroke-width="3.5"/>' +
      '<path d="M200 220L88 380l74-52 38 142 38-142 74 52Z" fill="#120a1c" stroke="#e9c178" stroke-width="3"/>' +
      "</g>" +
      '<circle cx="200" cy="188" r="68" fill="#ff5478" opacity=".32" filter="' + gl + '"/>' +
      '<circle cx="200" cy="188" r="50" fill="#06040a" stroke="#f3cf86" stroke-width="4.5"/>' +
      '<circle cx="200" cy="188" r="62" fill="none" stroke="#c78aff" stroke-width="2.5" stroke-dasharray="8 8"/>' +
      '<path d="M200 148l16 40-16 40-16-40Z" fill="#ff5b7e" stroke="#fff3da" stroke-width="2.5" filter="' + gl + '"/>'
    );
  }

  /* ===================== 9 FAMÍLIAS DE INIMIGOS ===================== */
  function familyBody(enemy, p, uid) {
    var type = lower(enemy && enemy.type);
    var name = lower(enemy && enemy.name);
    var m = "url(#" + uid + "metal)";
    var cl = "url(#" + uid + "cloth)";
    var gl = "url(#" + uid + "glow)";

    if (type === "human") {
      return (
        '<path d="M120 468l24-224 56-24 56 24 24 224-80-16Z" fill="' + cl + '" stroke="#736c66" stroke-width="3.5"/>' +
        '<path d="M150 198q50-98 100 0l-18 24h-64Z" fill="#1e1c24" stroke="#857d75" stroke-width="3"/>' +
        '<ellipse cx="200" cy="162" rx="28" ry="34" fill="#c7b2a6" stroke="#473c3a" stroke-width="3"/>' +
        '<circle cx="190" cy="158" r="4" fill="' + p.glow + '" filter="' + gl + '"/><circle cx="210" cy="158" r="4" fill="' + p.glow + '" filter="' + gl + '"/>' +
        // Lanterna acesa na mão direita
        '<path d="M262 246l48 16v30" fill="none" stroke="#6c5d4c" stroke-width="6" stroke-linecap="round"/>' +
        '<rect x="294" y="292" width="32" height="46" rx="6" fill="#231c15" stroke="#e4be73" stroke-width="3"/>' +
        '<circle cx="310" cy="315" r="10" fill="#ffcf6b" filter="' + gl + '"/>'
      );
    }

    if (type === "hunter") {
      return (
        '<path d="M104 470l30-246 66-26 66 26 30 246-54-22-42 22-42-22Z" fill="' + cl + '" stroke="' + p.a + '" stroke-width="3.5"/>' +
        '<path d="M148 214l52 44 52-44v130l-52 18-52-18Z" fill="#191d28" stroke="' + p.b + '" stroke-width="2.5"/>' +
        // Chapéu gótico de caçador
        '<path d="M116 142q84-26 168 0-84 18-168 0Z" fill="#101219" stroke="' + p.b + '" stroke-width="3"/>' +
        '<path d="M156 136l14-62 30 10 30-10 14 62Z" fill="#171923" stroke="' + p.a + '" stroke-width="3"/>' +
        '<path d="M170 144h60l-6 46q-24 22-48 0Z" fill="#c4b8b4"/>' +
        '<path d="M172 162h56v24l-28 16-28-16Z" fill="#161822" stroke="' + p.a + '" stroke-width="2.5"/>' +
        '<circle cx="186" cy="154" r="4.5" fill="#9ee2ff" filter="' + gl + '"/><circle cx="214" cy="154" r="4.5" fill="#9ee2ff" filter="' + gl + '"/>' +
        // Besta / Lâmina de prata
        '<path d="M74 286l56-24M52 246q28 40 0 80M82 226v120" stroke="' + m + '" stroke-width="6" stroke-linecap="round"/>'
      );
    }

    if (type === "beast") {
      if (/cervo|raiz/.test(name)) {
        return (
          '<g stroke="#928674" stroke-width="8" stroke-linecap="round" fill="none">' +
          '<path d="M174 126L122 46m28 42l-36-6m14-18l8-34M226 126l52-80m-28 42l36-6m-14-18l-8-34"/></g>' +
          '<path d="M118 468l16-170 66-54 66 54 16 170-48-26-34 26-34-26Z" fill="#19211d" stroke="#7aa885" stroke-width="3.5"/>' +
          '<path d="M160 124q40-26 80 0l-14 96-26 24-26-24Z" fill="#dfd5c0" stroke="#474036" stroke-width="3.5"/>' +
          '<circle cx="182" cy="160" r="6" fill="' + p.glow + '" filter="' + gl + '"/><circle cx="218" cy="160" r="6" fill="' + p.glow + '" filter="' + gl + '"/>'
        );
      }
      if (/harpia/.test(name)) {
        return (
          '<path d="M200 226L40 124l26 98-24 58 118-10Zm0 0l160-102-26 98 24 58-118-10Z" fill="#1a1d28" stroke="' + p.b + '" stroke-width="3.5"/>' +
          '<path d="M158 206q42-22 84 0l-12 184-30 34-30-34Z" fill="#252836" stroke="' + p.a + '" stroke-width="3"/>' +
          '<ellipse cx="200" cy="144" rx="30" ry="38" fill="#d8d6df" stroke="#3c3f52" stroke-width="3"/>' +
          '<path d="M182 140l14 4-8 8Zm36 0-14 4 8 8Z" fill="' + p.glow + '" filter="' + gl + '"/>'
        );
      }
      // Cão de Cinzas / Mandíbula de Geada
      return (
        '<path d="M84 452l14-142 38-72 64-28 64 28 38 72 14 142-56-34-60 28-60-28Z" fill="#181b24" stroke="' + p.a + '" stroke-width="4"/>' +
        '<path d="M148 156L114 88l58 40m80 28 34-68-58 40" fill="#232736" stroke="' + p.b + '" stroke-width="3.5"/>' +
        '<path d="M146 154q54-36 108 0l12 72q-66 44-132 0Z" fill="#272c3a" stroke="' + p.a + '" stroke-width="3.5"/>' +
        '<path d="M168 182l18 6-12 8Zm64 0-18 6 12 8Z" fill="' + p.glow + '" filter="' + gl + '"/>' +
        '<path d="M168 228l14 22 18-14 18 14 14-22" fill="#f0e8d8"/>'
      );
    }

    if (type === "mercenary") {
      return (
        '<path d="M108 470l26-238 66-26 66 26 26 238-82-18Z" fill="#1e1c20" stroke="' + p.a + '" stroke-width="3.5"/>' +
        '<path d="M114 220q32-38 74-10l-14 60-48-10Zm172 0q-32-38-74-10l14 60 48-10Z" fill="' + m + '" stroke="' + p.b + '" stroke-width="3"/>' +
        '<ellipse cx="200" cy="150" rx="34" ry="42" fill="#282a34" stroke="' + p.b + '" stroke-width="3.5"/>' +
        '<path d="M172 146h56" stroke="' + p.glow + '" stroke-width="6" stroke-linecap="round" filter="' + gl + '"/>' +
        '<path d="M308 110l24 22-40 202-18-8Z" fill="' + m + '" stroke="#fff" stroke-width="3"/>'
      );
    }

    if (type === "cultist") {
      return (
        '<path d="M108 474l34-252 58-28 58 28 34 252-92-22Z" fill="' + cl + '" stroke="' + p.a + '" stroke-width="3.5"/>' +
        '<path d="M142 198l58-126 58 126-58 24Z" fill="#151020" stroke="' + p.b + '" stroke-width="3.5"/>' +
        '<path d="M178 156l22-18 22 18-22 30Z" fill="' + p.glow + '" opacity=".85" filter="' + gl + '"/>' +
        '<path d="M200 232v144M170 278h60" stroke="' + p.b + '" stroke-width="3.5" stroke-opacity=".75"/>' +
        '<path d="M98 110v340" stroke="#7c6d8a" stroke-width="6"/><circle cx="98" cy="96" r="20" fill="' + p.glow + '" fill-opacity=".35" stroke="' + p.b + '" stroke-width="3" filter="' + gl + '"/>'
      );
    }

    if (type === "undead") {
      return (
        '<path d="M114 470l26-242 60-24 60 24 26 242-46-24-40 30-40-30Z" fill="#141a20" stroke="' + p.a + '" stroke-width="3.5"/>' +
        // Costelas expostas
        '<g stroke="#d2d8d0" stroke-width="4.5" stroke-linecap="round"><path d="M168 244q32 14 64 0M172 268q28 14 56 0M176 292q24 12 48 0M200 226v86"/></g>' +
        '<path d="M166 122q34-40 68 0l-6 58q-28 24-56 0Z" fill="#d8dfd4" stroke="#364047" stroke-width="3.5"/>' +
        '<circle cx="186" cy="144" r="7" fill="' + p.glow + '" filter="' + gl + '"/><circle cx="214" cy="144" r="7" fill="' + p.glow + '" filter="' + gl + '"/>' +
        '<path d="M188 182v14m12-14v14m12-14v14" stroke="#182026" stroke-width="3"/>'
      );
    }

    if (type === "demon") {
      return (
        '<path d="M200 226L54 114l38 118-30 58 106-14Zm0 0l146-112-38 118 30 58-106-14Z" fill="#2c1014" stroke="#ff7a45" stroke-width="3.5"/>' +
        '<path d="M132 468l16-242 52-26 52 26 16 242-68-22Z" fill="#241010" stroke="#e86238" stroke-width="4"/>' +
        // Chifres curvos
        '<path d="M168 128C136 96 126 62 152 38c-6 30 6 54 32 72Zm64 0c32-32 42-66 16-90 6 30-6 54-32 72Z" fill="#140b0c" stroke="#ffae5c" stroke-width="3"/>' +
        '<path d="M164 126q36-32 72 0l-8 66-28 22-28-22Z" fill="#3b1616" stroke="#ff7a45" stroke-width="3.5"/>' +
        '<path d="M174 152l18 6-14 8Zm52 0-18 6 14 8Z" fill="#ffe169" filter="' + gl + '"/>'
      );
    }

    if (type === "mutant") {
      return (
        '<path d="M78 470l24-246 44-50h108l44 50 24 246-74-20-48 22-48-22Z" fill="#222521" stroke="' + p.a + '" stroke-width="4"/>' +
        '<path d="M136 218l128 96m-116-8l108-78" stroke="#c8d6a8" stroke-width="3" stroke-dasharray="6 6"/>' +
        '<ellipse cx="200" cy="144" rx="44" ry="48" fill="#3a4038" stroke="#181c17" stroke-width="4"/>' +
        '<circle cx="180" cy="136" r="8" fill="' + p.glow + '" filter="' + gl + '"/>' +
        '<circle cx="216" cy="130" r="10" fill="' + p.glow + '" filter="' + gl + '"/>' +
        '<circle cx="202" cy="154" r="5" fill="' + p.glow + '" filter="' + gl + '"/>'
      );
    }

    // ancient (Ser Ancestral)
    return (
      '<circle cx="200" cy="196" r="96" fill="none" stroke="' + p.b + '" stroke-width="2.5" stroke-dasharray="7 9" opacity=".6"/>' +
      '<path d="M126 468l28-252 46-48 46 48 28 252-74-30Z" fill="#140c22" stroke="' + p.b + '" stroke-width="3.5"/>' +
      '<path d="M168 134l32-56 32 56-32 62Z" fill="#090612" stroke="' + p.b + '" stroke-width="3.5"/>' +
      '<circle cx="200" cy="142" r="16" fill="' + p.glow + '" filter="' + gl + '"/>' +
      '<circle cx="200" cy="142" r="7" fill="#090612"/>'
    );
  }

  function shouldUseFactionPreset(enemy, context) {
    if (context && context.source === "arena") return true;
    var type = lower(enemy && enemy.type);
    return type === "rival werewolf" || type === "rival vampire";
  }

  function render(enemy, context) {
    if (!enemy) return "";
    var uid = "wbe" + ++artSerial;
    var p = paletteFor(enemy);
    var isBoss = !!(enemy.boss || /^boss_/.test(String(enemy.id || "")));
    var body = isBoss
      ? bossBody(enemy.id, p, uid)
      : familyBody(enemy, p, uid);
    return wrapSvg(body, p, uid, isBoss);
  }

  window.WB_ENEMY_ART = {
    render: render,
    shouldUseFactionPreset: shouldUseFactionPreset,
  };
})();
