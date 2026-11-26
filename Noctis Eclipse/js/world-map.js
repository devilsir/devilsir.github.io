/* WEREWOLF BITE -> NOCTIS ECLIPSE — Mapa Cartográfico das 10 Regiões e Vinhetas Ilustradas de Eventos */
(function () {
  "use strict";

  var NODES = [
    { x: 108, y: 318, terrain: "village" },   // 0: Vila Blackthorn
    { x: 208, y: 205, terrain: "forest" },    // 1: Floresta Cinzenta
    { x: 326, y: 332, terrain: "rail" },      // 2: A Ferrovia Abandonada
    { x: 432, y: 202, terrain: "market" },    // 3: Distrito do Mercado de Sangue
    { x: 540, y: 334, terrain: "grave" },     // 4: Cemitério Hollowgrave
    { x: 640, y: 158, terrain: "mine" },      // 5: Passagem da Mina de Prata
    { x: 744, y: 342, terrain: "harbor" },    // 6: Porto Carmesim
    { x: 838, y: 146, terrain: "mountain" },  // 7: Montanhas da Queda Lunar
    { x: 926, y: 274, terrain: "capital" },   // 8: A Capital Amaldiçoada
    { x: 1030, y: 184, terrain: "rift" },     // 9: A Fenda Ancestral
  ];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>'"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c];
    });
  }

  function renderMap(regions, selectedIndex, playerLevel, storyFlags) {
    var flags = storyFlags || {};
    var routeSegments = "";
    for (var i = 0; i < NODES.length - 1; i++) {
      var a = NODES[i], b = NODES[i + 1];
      var unlockedNext = playerLevel >= (regions[i + 1]?.level || 1);
      var mx = (a.x + b.x) / 2;
      var my = (a.y + b.y) / 2 + (i % 2 === 0 ? -24 : 24);
      routeSegments +=
        '<path class="map-route ' + (unlockedNext ? "unlocked" : "locked") + '" d="M' + a.x + " " + a.y + " Q " + mx + " " + my + " " + b.x + " " + b.y + '"/>';
    }

    var pins = regions
      .map(function (r, idx) {
        var pos = NODES[idx] || { x: 100 + idx * 95, y: 240 };
        var unlocked = playerLevel >= r.level;
        var selected = idx === selectedIndex;
        var secretFound = !!flags["secret_" + r.id];
        var labelY = pos.y > 290 ? pos.y + 44 : pos.y - 36;
        var diffY = pos.y > 290 ? pos.y + 59 : pos.y - 21;
        var c0 = (r.colors && r.colors[0]) || "#4f83d1";
        return (
          '<g class="map-node ' +
          (unlocked ? "unlocked" : "locked") +
          (selected ? " selected" : "") +
          (secretFound ? " has-secret" : "") +
          '" tabindex="0" role="button" aria-label="' +
          esc(r.name) +
          " — Nível " +
          r.level +
          '" data-action="select-region" data-region="' +
          idx +
          '">' +
          (selected
            ? '<circle class="map-node-pulse" cx="' + pos.x + '" cy="' + pos.y + '" r="34"/>'
            : "") +
          '<circle class="map-node-halo" cx="' + pos.x + '" cy="' + pos.y + '" r="25" fill="' + c0 + '" fill-opacity="' + (unlocked ? ".28" : ".08") + '"/>' +
          '<circle class="map-node-disc" cx="' + pos.x + '" cy="' + pos.y + '" r="19"/>' +
          '<text class="map-node-num" x="' + pos.x + '" y="' + (pos.y + 5) + '">' +
          (unlocked ? idx + 1 : "✕") +
          "</text>" +
          (secretFound
            ? '<circle class="map-secret-dot" cx="' + (pos.x + 15) + '" cy="' + (pos.y - 14) + '" r="5"/>'
            : "") +
          '<text class="map-node-name" x="' + pos.x + '" y="' + labelY + '">' +
          esc(r.name) +
          "</text>" +
          '<text class="map-node-lvl" x="' + pos.x + '" y="' + diffY + '">' +
          (unlocked ? "Nv. " + r.level + "+" : "Bloq. Nv. " + r.level) +
          "</text>" +
          "</g>"
        );
      })
      .join("");

    return (
      '<div class="world-map-frame">' +
      '<svg class="world-map-svg" viewBox="0 0 1120 440" role="img" aria-label="Mapa Cartográfico do Eclipse Oco">' +
      "<defs>" +
      '<radialGradient id="wmParchment" cx="50%" cy="48%" r="64%"><stop offset="0%" stop-color="#1b1c28"/><stop offset="68%" stop-color="#11121a"/><stop offset="100%" stop-color="#08090e"/></radialGradient>' +
      '<radialGradient id="wmRift" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#b975ff" stop-opacity=".46"/><stop offset="55%" stop-color="#6b2fa8" stop-opacity=".14"/><stop offset="100%" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="wmSea" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a0e18" stop-opacity=".85"/><stop offset="100%" stop-color="#140c14" stop-opacity=".92"/></linearGradient>' +
      '<pattern id="wmGrid" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0v56" fill="none" stroke="rgba(213,178,110,.055)" stroke-width="1"/></pattern>' +
      "</defs>" +
      '<rect width="1120" height="440" rx="16" fill="url(#wmParchment)"/>' +
      '<rect width="1120" height="440" rx="16" fill="url(#wmGrid)"/>' +
      // Mar carmesim ao sul-sudeste
      '<path d="M620 440Q700 370 790 364T990 356L1120 340V440Z" fill="url(#wmSea)" stroke="rgba(213,178,110,.14)" stroke-width="1.5"/>' +
      '<path d="M676 408q45-10 90 0t90 0 90 0M726 426q42-8 84 0t84 0" fill="none" stroke="rgba(186,104,126,.2)" stroke-width="1.5"/>' +
      // Contorno de continente e relevo
      '<path d="M32 390Q95 270 140 165T320 96Q490 74 645 92T940 88Q1055 110 1088 212T1018 332Q840 342 740 372T470 398Q230 412 32 390Z" fill="rgba(255,255,255,.02)" stroke="rgba(213,178,110,.15)" stroke-width="1.6" stroke-dasharray="6 4"/>' +
      // Cordilheira ao norte (Mina de Prata e Queda Lunar)
      '<g fill="rgba(160,182,216,.11)" stroke="rgba(213,178,110,.22)" stroke-width="1.2">' +
      '<path d="M578 148l32-54 28 40 30-50 34 64Z"/><path d="M770 144l36-62 30 44 36-56 38 74Z"/>' +
      "</g>" +
      // Floresta Cinzenta a noroeste
      '<g fill="rgba(118,168,142,.15)" stroke="rgba(130,182,152,.22)" stroke-width="1.2">' +
      '<path d="M162 214l14-28 14 28Zm26-16l16-32 16 32Zm36 22l14-26 14 26Z"/>' +
      "</g>" +
      // Fenda Ancestral brilhando a leste
      '<circle cx="1030" cy="184" r="66" fill="url(#wmRift)"/>' +
      '<circle cx="1030" cy="184" r="34" fill="none" stroke="rgba(218,166,255,.32)" stroke-width="1.5" stroke-dasharray="5 5"/>' +
      // Rosa dos ventos gótica no canto inferior esquerdo
      '<g transform="translate(66 84)" opacity=".52" stroke="#d5b26e" fill="none">' +
      '<circle cx="0" cy="0" r="24" stroke-width="1"/><circle cx="0" cy="0" r="18" stroke-dasharray="2 4" stroke-width="1"/>' +
      '<path d="M0-30L5-6 30 0 5 6 0 30-5 6-30 0-5-6Z" fill="rgba(213,178,110,.16)" stroke-width="1.2"/>' +
      '<text x="0" y="-34" text-anchor="middle" fill="#d5b26e" font-family="Cinzel,Georgia,serif" font-size="10" stroke="none">N</text>' +
      "</g>" +
      // Título cartográfico
      '<text x="1086" y="42" text-anchor="end" fill="rgba(213,178,110,.5)" font-family="Cinzel,Georgia,serif" font-size="12" letter-spacing="4">DOMÍNIOS DO ECLIPSE OCO</text>' +
      '<rect x="12" y="12" width="1096" height="416" rx="10" fill="none" stroke="rgba(213,178,110,.16)" stroke-width="1"/>' +
      // Rotas e Pins
      routeSegments +
      pins +
      "</svg>" +
      '<div class="world-map-legend">' +
      '<span><i class="legend-dot unlocked"></i>Região aberta</span>' +
      '<span><i class="legend-dot selected"></i>Selecionada</span>' +
      '<span><i class="legend-dot secret"></i>Segredo descoberto</span>' +
      '<span><i class="legend-dot locked"></i>Bloqueada</span>' +
      "</div></div>"
    );
  }

  function eventArtwork(event, region) {
    var title = String((event && event.title) || "").toLowerCase();
    var c0 = (region && region.colors && region.colors[0]) || "#35435e";
    var c1 = (region && region.colors && region.colors[1]) || "#10121a";
    var motif = "";

    if (/caravana|carruagem/.test(title)) {
      motif =
        '<path d="M210 218h180l16-66H226Z" fill="#15131c" stroke="#d5b26e" stroke-width="3"/>' +
        '<rect x="260" y="168" width="28" height="28" rx="4" fill="#ffcf75" opacity=".78"/>' +
        '<rect x="314" y="168" width="28" height="28" rx="4" fill="#ffcf75" opacity=".78"/>' +
        '<circle cx="248" cy="226" r="24" fill="#0d0e14" stroke="#b89862" stroke-width="4"/>' +
        '<circle cx="354" cy="226" r="24" fill="#0d0e14" stroke="#b89862" stroke-width="4"/>';
    } else if (/lua|sombra|coro/.test(title)) {
      motif =
        '<circle cx="300" cy="116" r="76" fill="#c92944" opacity=".28"/>' +
        '<circle cx="300" cy="116" r="52" fill="#e63e59" opacity=".82"/>' +
        '<circle cx="316" cy="108" r="44" fill="#130910"/>' +
        '<path d="M160 232q140-62 280 0" fill="none" stroke="#ff8295" stroke-opacity=".42" stroke-width="3"/>';
    } else if (/santuário|círculo|totem|pomar/.test(title)) {
      motif =
        '<ellipse cx="300" cy="222" rx="140" ry="26" fill="none" stroke="#d5b26e" stroke-width="3" stroke-dasharray="10 6"/>' +
        '<path d="M276 220V98l24-34 24 34v122Z" fill="#191b26" stroke="#c2d4f0" stroke-width="3"/>' +
        '<circle cx="300" cy="128" r="14" fill="#8fb8ff" opacity=".85"/>';
    } else if (/alquimista|adega/.test(title)) {
      motif =
        '<path d="M278 72h44l-6 44 34 78q8 26-26 26h-48q-34 0-26-26l34-78Z" fill="#131620" stroke="#d5b26e" stroke-width="3.5"/>' +
        '<path d="M262 174h76l10 22q6 20-20 20h-56q-26 0-20-20Z" fill="#63d98b" opacity=".78"/>' +
        '<circle cx="290" cy="148" r="6" fill="#a8f5c0" opacity=".7"/><circle cx="314" cy="134" r="4" fill="#a8f5c0" opacity=".6"/>';
    } else if (/sino|guardião/.test(title)) {
      motif =
        '<path d="M210 236V102q90-72 180 0v134" fill="none" stroke="#7d8499" stroke-width="6"/>' +
        '<path d="M300 76v42m-46 0q46-54 92 0l14 78H240Z" fill="#231c1a" stroke="#d5b26e" stroke-width="3.5"/>' +
        '<circle cx="300" cy="204" r="11" fill="#e8c780"/>';
    } else {
      // Emboscada / Duelista / Metamorfo / Informante
      motif =
        '<path d="M214 236l36-112 50-24 50 24 36 112Z" fill="#12141e" stroke="#d5b26e" stroke-opacity=".55" stroke-width="3"/>' +
        '<circle cx="300" cy="84" r="24" fill="#141621" stroke="#b9c9e4" stroke-width="2.5"/>' +
        '<circle cx="291" cy="84" r="4" fill="#ffcf6b"/><circle cx="309" cy="84" r="4" fill="#ffcf6b"/>' +
        '<path d="M168 186l74-48m190 48-74-48" stroke="#d5b26e" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
    }

    return (
      '<svg class="event-vignette-svg" viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="evSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + c0 + '"/><stop offset="68%" stop-color="' + c1 + '"/><stop offset="100%" stop-color="#07080d"/></linearGradient></defs>' +
      '<rect width="600" height="260" fill="url(#evSky)"/>' +
      '<circle cx="468" cy="64" r="44" fill="rgba(255,244,220,.14)"/>' +
      '<circle cx="468" cy="64" r="24" fill="rgba(255,244,220,.3)"/>' +
      '<path d="M0 218Q150 184 300 206T600 198V260H0Z" fill="#08090f"/>' +
      motif +
      '<path d="M0 226q150-22 300 0t300 0v34H0Z" fill="rgba(182,196,226,.09)"/>' +
      "</svg>"
    );
  }

  window.WB_WORLD_MAP = {
    renderMap: renderMap,
    eventArtwork: eventArtwork,
  };
})();
