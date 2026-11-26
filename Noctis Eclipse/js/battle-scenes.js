/* WEREWOLF BITE — Cenários de batalha multicamadas com profundidade e partículas regionais */
(function () {
  "use strict";

  function sceneData(regionId, isArena, colors) {
    var c0 = (colors && colors[0]) || "#35435e";
    var c1 = (colors && colors[1]) || "#11141c";
    var c2 = (colors && colors[2]) || "#0b0d13";

    if (isArena) {
      return {
        weather: "embers",
        style:
          "radial-gradient(circle at 50% 24%, rgba(212,162,89,.24), transparent 36%), linear-gradient(180deg, #261b29 0%, #120e17 58%, #1a1112 100%)",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<defs><radialGradient id="arMoon" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff1cf" stop-opacity=".42"/><stop offset="60%" stop-color="#d8a25e" stop-opacity=".1"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient>' +
          '<linearGradient id="arFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#191217"/><stop offset="100%" stop-color="#080609"/></linearGradient></defs>' +
          '<circle cx="600" cy="118" r="145" fill="url(#arMoon)"/>' +
          '<circle cx="600" cy="118" r="48" fill="#efe2c4" opacity=".24"/>' +
          // Coliseu gótico distante
          '<path d="M0 365V185h1200v180Z" fill="#0d0a12" opacity=".82"/>' +
          '<g fill="#191321" stroke="rgba(226,184,110,.22)" stroke-width="2">' +
          '<path d="M80 365V220q60-66 120 0v145M260 365V220q60-66 120 0v145M440 365V220q60-66 120 0v145M640 365V220q60-66 120 0v145M820 365V220q60-66 120 0v145M1000 365V220q60-66 120 0v145"/>' +
          "</g>" +
          // Braseiros com chamas
          '<g><rect x="216" y="268" width="28" height="96" fill="#1e171c" stroke="#85653d" stroke-width="2"/><ellipse cx="230" cy="256" rx="18" ry="26" fill="#ff9442" opacity=".68"/><ellipse cx="230" cy="260" rx="9" ry="15" fill="#fff0a6" opacity=".85"/>' +
          '<rect x="956" y="268" width="28" height="96" fill="#1e171c" stroke="#85653d" stroke-width="2"/><ellipse cx="970" cy="256" rx="18" ry="26" fill="#ff9442" opacity=".68"/><ellipse cx="970" cy="260" rx="9" ry="15" fill="#fff0a6" opacity=".85"/></g>' +
          // Piso em perspectiva
          '<path d="M0 365h1200v175H0Z" fill="url(#arFloor)"/>' +
          '<ellipse cx="600" cy="456" rx="460" ry="62" fill="none" stroke="rgba(218,176,104,.26)" stroke-width="3"/>' +
          '<ellipse cx="600" cy="456" rx="290" ry="36" fill="none" stroke="rgba(218,176,104,.14)" stroke-width="2" stroke-dasharray="10 8"/>' +
          "</svg>",
      };
    }

    var map = {
      blackthorn: {
        weather: "rain",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="220" cy="96" r="118" fill="rgba(182,208,255,.12)"/>' +
          '<circle cx="220" cy="96" r="46" fill="rgba(232,242,255,.32)"/>' +
          // Montanhas distantes
          '<path d="M0 380L150 260l140 70 190-115 210 105 180-90 190 95 140-65v120Z" fill="#0d111b" opacity=".82"/>' +
          // Silhueta da vila gótica e campanário
          '<g fill="#121622" stroke="rgba(166,188,225,.14)" stroke-width="1.5">' +
          '<path d="M88 380V265l46-54 46 54v115Z"/><path d="M210 380V235l58-68 58 68v145Z"/>' +
          '<path d="M555 380V172l45-88 45 88v208Z"/>' +
          '<path d="M860 380V242l56-62 56 62v138Z"/><path d="M994 380V268l44-48 44 48v112Z"/>' +
          "</g>" +
          // Janelas acesas âmbar
          '<g fill="#f0c370" opacity=".68"><rect x="126" y="294" width="14" height="24" rx="2"/><rect x="256" y="272" width="16" height="28" rx="2"/><rect x="590" y="218" width="20" height="36" rx="10"/><rect x="908" y="282" width="16" height="28" rx="2"/></g>' +
          // Estrada de pedra em perspectiva + névoa
          '<path d="M0 380h1200v160H0Z" fill="#0a0c12"/>' +
          '<path d="M475 380L250 540h700L725 380Z" fill="#141822" opacity=".78"/>' +
          '<path d="M0 370q300-26 600 0t600 0v32H0Z" fill="rgba(164,186,222,.09)"/>' +
          "</svg>",
      },
      ashen: {
        weather: "ash",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="960" cy="94" r="110" fill="rgba(176,225,204,.12)"/>' +
          '<circle cx="960" cy="94" r="44" fill="rgba(224,244,230,.28)"/>' +
          '<path d="M0 390Q300 326 620 368t580-12v184H0Z" fill="#0b1210"/>' +
          '<g stroke="#18231e" stroke-width="22" stroke-linecap="round" fill="none">' +
          '<path d="M120 400V120m0 110l-52-58m52 24l60-64"/><path d="M310 395V155m0 90l-44-48m44 16l48-52"/>' +
          '<path d="M890 396V138m0 100l-54-56m54 18l56-62"/><path d="M1070 402V165m0 88l-46-48m46 16l48-50"/>' +
          "</g>" +
          '<path d="M0 404q260-36 520 0t680-10v146H0Z" fill="#070c0a"/>' +
          '<path d="M220 468q160-34 320 0t320 0" fill="none" stroke="rgba(146,214,172,.16)" stroke-width="5"/>' +
          "</svg>",
      },
      railway: {
        weather: "ash",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="240" cy="96" r="42" fill="rgba(244,218,184,.22)"/>' +
          '<path d="M440 390V235q160-130 320 0v155Z" fill="#09090d" stroke="rgba(182,158,136,.22)" stroke-width="6"/>' +
          '<circle cx="600" cy="270" r="22" fill="rgba(148,220,255,.32)"/>' +
          '<path d="M0 390h1200v150H0Z" fill="#0c0b0c"/>' +
          '<path d="M510 390L240 540M690 390l270 150" stroke="rgba(196,170,145,.34)" stroke-width="7"/>' +
          '<g stroke="rgba(130,104,84,.36)" stroke-width="10"><path d="M475 415h250M430 448h340M372 486h456M305 524h590"/></g>' +
          "</svg>",
      },
      bloodmarket: {
        weather: "embers",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<g fill="#180a10" stroke="rgba(235,108,128,.16)" stroke-width="2">' +
          '<rect x="70" y="180" width="150" height="205"/><rect x="260" y="150" width="190" height="235"/><rect x="750" y="160" width="185" height="225"/><rect x="970" y="190" width="160" height="195"/>' +
          "</g>" +
          // Fios e lanternas vermelhas
          '<path d="M60 150Q600 240 1140 150" fill="none" stroke="rgba(255,160,170,.24)" stroke-width="2.5"/>' +
          '<g><circle cx="240" cy="184" r="34" fill="rgba(255,62,92,.22)"/><circle cx="240" cy="184" r="12" fill="#ff5470"/>' +
          '<circle cx="480" cy="204" r="38" fill="rgba(255,62,92,.22)"/><circle cx="480" cy="204" r="13" fill="#ff5470"/>' +
          '<circle cx="720" cy="204" r="38" fill="rgba(255,62,92,.22)"/><circle cx="720" cy="204" r="13" fill="#ff5470"/>' +
          '<circle cx="960" cy="184" r="34" fill="rgba(255,62,92,.22)"/><circle cx="960" cy="184" r="12" fill="#ff5470"/></g>' +
          '<path d="M0 385h1200v155H0Z" fill="#0d070a"/>' +
          '<ellipse cx="600" cy="465" rx="440" ry="38" fill="rgba(220,42,72,.12)"/>' +
          "</svg>",
      },
      hollowgrave: {
        weather: "mist",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="930" cy="108" r="115" fill="rgba(202,216,255,.12)"/>' +
          '<circle cx="930" cy="108" r="52" fill="rgba(238,242,255,.32)"/>' +
          '<path d="M510 388V230l90-64 90 64v158Z" fill="#141622" stroke="rgba(182,190,224,.22)" stroke-width="3"/>' +
          '<g fill="#1c1f2e" stroke="rgba(182,190,224,.18)" stroke-width="2">' +
          '<path d="M120 392v-78q26-34 52 0v78Z"/><path d="M240 392v-60q22-28 44 0v60Z"/><path d="M840 392v-74q26-30 52 0v74Z"/><path d="M970 392v-64q24-28 48 0v64Z"/>' +
          "</g>" +
          '<path d="M0 388h1200v152H0Z" fill="#090a10"/>' +
          '<path d="M0 392q320-34 640 0t560-8v55H0Z" fill="rgba(170,190,230,.09)"/>' +
          "</svg>",
      },
      silvermine: {
        weather: "snow",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<path d="M0 540V190l180 95 160-115 260 120 260-120 160 115 180-95v350Z" fill="#0e141a"/>' +
          '<path d="M440 410V235q160-115 320 0v175Z" fill="#070b0f" stroke="rgba(196,222,245,.24)" stroke-width="4"/>' +
          '<g fill="rgba(164,218,255,.34)"><polygon points="180,360 212,282 244,360"/><polygon points="348,342 374,274 400,342"/><polygon points="826,348 854,276 882,348"/><polygon points="962,366 994,292 1026,366"/></g>' +
          '<path d="M0 398h1200v142H0Z" fill="#090e13"/>' +
          "</svg>",
      },
      harbor: {
        weather: "rain",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="240" cy="96" r="46" fill="rgba(255,212,196,.25)"/>' +
          // Galeão fantasma no horizonte
          '<path d="M740 356h270l36-46-66-12-40 16-46-88-90 130Z" fill="#13121b" stroke="rgba(218,128,148,.2)" stroke-width="2"/>' +
          '<path d="M845 200v150M918 220v130" stroke="#221e2b" stroke-width="6"/>' +
          '<path d="M851 206h88l-68 64Zm73 18h70l-52 54Z" fill="rgba(42,24,34,.88)"/>' +
          // Água e píer
          '<path d="M0 364h1200v176H0Z" fill="#0b0c13"/>' +
          '<path d="M0 388q150-16 300 0t300 0 300 0 300 0" fill="none" stroke="rgba(186,62,88,.24)" stroke-width="14"/>' +
          '<path d="M0 442h1200v98H0Z" fill="#141115" stroke="rgba(255,255,255,.08)" stroke-width="2"/>' +
          "</svg>",
      },
      mountains: {
        weather: "snow",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="910" cy="106" r="68" fill="rgba(220,236,255,.28)"/>' +
          '<path d="M882 54l26 42-14 28 32 36" fill="none" stroke="#0e1422" stroke-width="5"/>' +
          '<path d="M0 440L190 210l120 128 165-190 140 172 155-204 165 215 120-128 145 237Z" fill="#101624"/>' +
          '<path d="M190 210l42 54-26 12-16-66Zm285-62l48 64-32 14-16-78Zm295-32l54 72-36 16-18-88Z" fill="rgba(196,220,255,.22)"/>' +
          '<path d="M0 400h1200v140H0Z" fill="#090d16"/>' +
          "</svg>",
      },
      capital: {
        weather: "mist",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="600" cy="112" r="130" fill="rgba(182,130,224,.15)"/>' +
          '<g fill="#16111e" stroke="rgba(218,184,126,.18)" stroke-width="2">' +
          '<path d="M120 394V184l58-76 58 76v210Z"/><path d="M460 394V128l140-96 140 96v266Z"/><path d="M964 394V184l58-76 58 76v210Z"/>' +
          "</g>" +
          '<circle cx="600" cy="176" r="36" fill="none" stroke="rgba(226,184,116,.36)" stroke-width="3"/>' +
          '<path d="M0 394h1200v146H0Z" fill="#0a080f"/>' +
          "</svg>",
      },
      rift: {
        weather: "rift",
        svg:
          '<svg viewBox="0 0 1200 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<circle cx="600" cy="166" r="158" fill="rgba(164,86,232,.2)"/>' +
          '<circle cx="600" cy="166" r="78" fill="#07040c" stroke="rgba(226,174,255,.58)" stroke-width="4"/>' +
          '<circle cx="600" cy="166" r="108" fill="none" stroke="rgba(232,188,116,.32)" stroke-width="2" stroke-dasharray="10 10"/>' +
          '<path d="M600 12L572 134l44 62-42 126 52-94-26-54 36-102Z" fill="rgba(226,162,255,.26)"/>' +
          '<path d="M0 396Q300 344 600 380t600-10v170H0Z" fill="#07040b"/>' +
          "</svg>",
      },
    };

    var chosen = map[regionId] || map.blackthorn;
    return {
      weather: chosen.weather || "mist",
      style:
        "radial-gradient(circle at 50% 24%, " +
        c0 +
        "66, transparent 36%), linear-gradient(180deg, " +
        c0 +
        " 0%, " +
        c1 +
        " 60%, " +
        c2 +
        " 100%)",
      svg: chosen.svg,
    };
  }

  window.WB_BATTLE_SCENES = {
    get: sceneData,
  };
})();
