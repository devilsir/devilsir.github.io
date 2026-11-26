/* WEREWOLF BITE — Biblioteca de ícones SVG góticos autorais */
(function () {
  "use strict";

  var PATHS = {
    overview:
      '<path d="M12 3L4 9v11h5v-6h6v6h5V9l-8-6Z"/><path d="M9 11h6M12 7v4"/>',
    character:
      '<circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.8-4.2 3.4-6.5 6.5-6.5s5.7 2.3 6.5 6.5"/><path d="M8.5 4.2L12 2l3.5 2.2"/>',
    hunt:
      '<path d="M15.5 4.5a7.5 7.5 0 1 0 4 13.8A6 6 0 1 1 15.5 4.5Z"/><path d="M16 7l1.5 2.5L20 11l-2.5 1.5L16 15l-1.5-2.5L12 11l2.5-1.5Z"/>',
    city:
      '<path d="M4 20V10l3-3 3 3v10M10 20V6l2-3 2 3v14M14 20V11l3-3 3 3v9M2 20h20"/><path d="M12 10v3M7 14v2M17 14v2"/>',
    arena:
      '<path d="M5 19L19 5M15 5h4v4M19 19L5 5M9 5H5v4"/><path d="M8 14l2 2M14 16l2-2"/>',
    missions:
      '<path d="M6 3h10l3 3v15H6V3Z"/><path d="M9 9h7M9 13h7M9 17h4"/><path d="M4 6v14a1 1 0 0 0 1 1"/>',
    inventory:
      '<path d="M6 8h12l1.5 12h-15L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M9.5 13h5M12 11v4"/>',
    merchant:
      '<path d="M12 3v18M5 8h14"/><path d="M5 8l-2.5 5a3.5 3.5 0 0 0 5 0L5 8Zm14 0-2.5 5a3.5 3.5 0 0 0 5 0L19 8Z"/><path d="M8.5 21h7"/>',
    hideout:
      '<path d="M3 12l9-8 9 8"/><path d="M5 10.5V20h14v-9.5"/><path d="M9.5 20v-5.5a2.5 2.5 0 0 1 5 0V20"/><path d="M12 6.5v3"/>',
    clan:
      '<path d="M4 17l2-9 4 4 2-6 2 6 4-4 2 9H4Z"/><path d="M5 20h14"/>',
    bestiary:
      '<path d="M12 3c-4.4 0-7.5 3.1-7.5 7.2 0 2.5 1.2 4.4 2.8 5.5V19h9.4v-3.3c1.6-1.1 2.8-3 2.8-5.5C19.5 6.1 16.4 3 12 3Z"/><circle cx="9.2" cy="10.5" r="1.3" fill="currentColor"/><circle cx="14.8" cy="10.5" r="1.3" fill="currentColor"/><path d="M10.2 19v-2.2M13.8 19v-2.2M12 13l-1 1.6h2L12 13Z"/>',
    achievements:
      '<path d="M12 3l2.6 5.4 6 .8-4.3 4.2 1 6-5.3-2.8L6.7 19.4l1-6L3.4 9.2l6-.8L12 3Z"/>',
    ranking:
      '<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a2 2 0 0 0 2 4h1M16 6h3a2 2 0 0 1-2 4h-1"/><path d="M12 13v5M8.5 20h7"/>',
    messages:
      '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4.5 7l7.5 5.8L19.5 7"/><circle cx="12" cy="12.8" r="1.2" fill="currentColor"/>',
    settings:
      '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/>',
    health:
      '<path d="M12 20.4s-7.4-4.7-8.8-9.2C2.3 8 4.6 5 7.8 5c1.9 0 3.3 1 4.2 2.4C12.9 6 14.3 5 16.2 5c3.2 0 5.5 3 4.6 6.2-1.4 4.5-8.8 9.2-8.8 9.2Z" fill="currentColor" fill-opacity=".22"/>',
    energy:
      '<path d="M13.2 2.5L5.5 13h5.6l-.8 8.5L18.5 11h-5.6l.3-8.5Z" fill="currentColor" fill-opacity=".22"/>',
    gold:
      '<path d="M12 2.5L20 12l-8 9.5L4 12 12 2.5Z" fill="currentColor" fill-opacity=".2"/><path d="M12 6.8L16.2 12 12 17.2 7.8 12 12 6.8Z"/>',
    shards:
      '<path d="M12 2l2.6 6.4L21 11l-6.4 2.6L12 20l-2.6-6.4L3 11l6.4-2.6L12 2Z" fill="currentColor" fill-opacity=".24"/>',
    daily:
      '<path d="M15.8 4.4a7.8 7.8 0 1 0 3.8 14.2A6.2 6.2 0 1 1 15.8 4.4Z" fill="currentColor" fill-opacity=".18"/><path d="M17.5 6.5v3M16 8h3"/>',
    save:
      '<path d="M5 4h11l3 3v13H5V4Z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    audioOn:
      '<path d="M10 17.5V6.5l9-2v11"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
    audioOff:
      '<path d="M10 17.5V6.5l9-2v11"/><circle cx="7.5" cy="17.5" r="2.5"/><path d="M4 4l16 16"/>',
    menu:
      '<path d="M4 7h16M4 12h16M4 17h16"/>',
    moonborn:
      '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 15.4 6.8 6.8 0 1 1-5-15.4Z" fill="currentColor" fill-opacity=".22"/><path d="M14.5 9l1.5-3 1.5 3 2.5 1-2.5 1.2L16 14l-1.5-2.8L12 10l2.5-1Z"/>',
    bloodbound:
      '<path d="M12 2.5C12 2.5 6 9.5 6 14.2a6 6 0 0 0 12 0C18 9.5 12 2.5 12 2.5Z" fill="currentColor" fill-opacity=".24"/><path d="M12 7.5L9.5 13l2.5 4 2.5-4L12 7.5Z"/>',
    sword:
      '<path d="M18.5 3.5l2 2-9.5 9.5-2-2 9.5-9.5Z"/><path d="M7.5 11.5l5 5M5 19l3.5-3.5M4 18l2 2"/>',
    heavy:
      '<path d="M14 4l6 6-4 4-6-6 4-4Z" fill="currentColor" fill-opacity=".2"/><path d="M11 11L4.5 17.5M14 14l-1.5 1.5M18 4l2-1-1 2"/>',
    shield:
      '<path d="M12 3l7.5 3.2v5.4c0 4.6-3.1 8-7.5 9.6-4.4-1.6-7.5-5-7.5-9.6V6.2L12 3Z" fill="currentColor" fill-opacity=".18"/><path d="M12 6.5v11.2M8 10.5h8"/>',
    potion:
      '<path d="M9.5 3h5M10.5 3v4.2L6.2 14.5A3.6 3.6 0 0 0 9.3 20h5.4a3.6 3.6 0 0 0 3.1-5.5l-4.3-7.3V3"/><path d="M8 14.5h8" stroke-opacity=".8"/>',
    retreat:
      '<path d="M10 6L4 12l6 6"/><path d="M4 12h11a5 5 0 0 1 5 5v1"/>',
    skull:
      '<path d="M12 3.5c-4.2 0-7 2.9-7 6.8 0 2.3 1.1 4.1 2.7 5.2v3h8.6v-3c1.6-1.1 2.7-2.9 2.7-5.2 0-3.9-2.8-6.8-7-6.8Z"/><circle cx="9.3" cy="10.4" r="1.2" fill="currentColor"/><circle cx="14.7" cy="10.4" r="1.2" fill="currentColor"/><path d="M10.5 18.5v-2M13.5 18.5v-2"/>',
    dice:
      '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="8.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.1" fill="currentColor"/><circle cx="12" cy="12" r="1.1" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.1" fill="currentColor"/>',
    focus:
      '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/>',
    forge:
      '<path d="M4 14h16l-2 4H6l-2-4Z" fill="currentColor" fill-opacity=".18"/><path d="M7 14l2-4h6l2 4M9 10V6l3-2 3 2v4M5 20h14"/>',
    lock:
      '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.2" r="1.2" fill="currentColor"/>',
    check:
      '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    eclipse:
      '<circle cx="12" cy="12" r="7.5"/><circle cx="13.5" cy="11.2" r="5.5" fill="currentColor" fill-opacity=".35"/>',
    bleed:
      '<path d="M12 3s5 6.3 5 10.2a5 5 0 0 1-10 0C7 9.3 12 3 12 3Z" fill="currentColor" fill-opacity=".28"/>',
    poison:
      '<circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M5.1 8l2.6 1.5M16.3 14.5L18.9 16M18.9 8l-2.6 1.5M7.7 14.5L5.1 16"/>',
    burn:
      '<path d="M12 3c2 3.2 5 5.4 5 9.5a5 5 0 0 1-10 0c0-2.5 1.3-4.7 2.8-6.2.1 1.6 1.2 2.5 2.2 2.7-.6-2-.3-4 0-6Z" fill="currentColor" fill-opacity=".24"/>',
    stun:
      '<path d="M12 3l2 5 5 1-4 3.5 1.2 5.5-4.2-3-4.2 3L9 12.5 5 9l5-1 2-5Z"/>',
    weaken:
      '<path d="M12 4v15M6.5 13.5L12 19l5.5-5.5"/>',
    mark:
      '<circle cx="12" cy="12" r="6"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
    fear:
      '<path d="M12 4L3.5 19h17L12 4Z"/><path d="M12 10v4.5"/><circle cx="12" cy="16.8" r=".8" fill="currentColor"/>',
    stealth:
      '<path d="M2.5 12s3.8-6 9.5-6 9.5 6 9.5 6-3.8 6-9.5 6-9.5-6-9.5-6Z"/><path d="M4 4l16 16"/>',
    curse:
      '<path d="M12 3v18M7 8h10M8.5 14h7"/>',
    claw:
      '<path d="M6 18C7 12 10 8 15 4M10 19c1-5 3.5-8.5 7.5-12M14.5 19.5c.8-3.8 2.5-6.5 5.5-9"/>',
    crown:
      '<path d="M3.5 17.5L5.5 8l4.5 4.5L12 6l2 6.5L18.5 8l2 9.5H3.5Z" fill="currentColor" fill-opacity=".2"/>',
    dagger:
      '<path d="M18 4l2 2-8.5 8.5-2-2L18 4Z"/><path d="M8.5 11.5l4 4M5 19l3.5-3.5"/>',
    star:
      '<path d="M12 3l2.4 5.5L20 9.3l-4.2 3.8 1.2 5.7L12 16l-5 2.8 1.2-5.7L4 9.3l5.6-.8L12 3Z"/>',
    book:
      '<path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h12.5v16H7a2.5 2.5 0 0 0-2.5 2.5V5.5Z"/><path d="M7 16h12.5M9.5 7.5h6"/>',
    compass:
      '<circle cx="12" cy="12" r="8.5"/><path d="M15.2 8.8l-2 5.2-5.2 2 2-5.2 5.2-2Z" fill="currentColor" fill-opacity=".25"/>',
    bell:
      '<path d="M18 16H6c1.2-1.4 1.8-3.2 1.8-5.5a4.2 4.2 0 1 1 8.4 0c0 2.3.6 4.1 1.8 5.5Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    tree:
      '<path d="M12 3L6.5 11h3.2L5.5 17h13l-4.2-6h3.2L12 3Z" fill="currentColor" fill-opacity=".18"/><path d="M12 17v4"/>',
    rail:
      '<path d="M7 4l-2 16M17 4l2 16M6.5 8h11M6 12h12M5.5 16h13"/>',
    wave:
      '<path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
    mountain:
      '<path d="M3 19l6.5-11 4 6.5 2.5-3.5L21 19H3Z" fill="currentColor" fill-opacity=".18"/>',
    gem:
      '<path d="M7 4h10l4 5-9 11L3 9l4-5Z" fill="currentColor" fill-opacity=".2"/><path d="M3 9h18M12 20L8.5 9 10 4m2 16l3.5-11L14 4"/>',
    scroll:
      '<path d="M7 4h11a2 2 0 0 1 2 2v2h-2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2h2V6a2 2 0 0 1 1-2Z"/><path d="M9 9h6M9 13h6"/>',
    ring:
      '<circle cx="12" cy="13.5" r="5.5"/><path d="M9.5 7L12 4l2.5 3-2.5 2.2L9.5 7Z" fill="currentColor" fill-opacity=".28"/>',
  };

  var GLYPH_MAP = {
    "⌂": "overview",
    "♟": "character",
    "◒": "moonborn",
    "♦": "bloodbound",
    "♜": "city",
    "⚔": "arena",
    "◆": "gem",
    "▦": "inventory",
    "♧": "merchant",
    "♛": "clan",
    "♕": "crown",
    "☠": "bestiary",
    "★": "achievements",
    "▲": "ranking",
    "✉": "messages",
    "⚙": "settings",
    "♥": "health",
    "⚡": "energy",
    "◈": "gold",
    "✦": "shards",
    "☾": "daily",
    "▣": "save",
    "♪": "audioOn",
    "☰": "menu",
    "⬟": "shield",
    "†": "curse",
    "✝": "curse",
    "◐": "stealth",
    "⚗": "potion",
    "⌁": "retreat",
    "⚒": "forge",
    "◉": "eclipse",
    "⊙": "eclipse",
    "✧": "bleed",
    "☣": "poison",
    "♨": "burn",
    "↓": "weaken",
    "⌖": "mark",
    "!": "fear",
    "♠": "tree",
    "═": "rail",
    "≋": "wave",
    "△": "mountain",
    "♩": "bell",
    "♫": "bell",
    "✓": "check",
    "♙": "character",
    "♞": "claw",
    "♘": "claw",
    "◬": "curse",
    "☽": "moonborn",
    "Ψ": "burn",
    "⌬": "poison",
    "♢": "shield",
    "✣": "shards",
    "❄": "shards",
    "♉": "claw",
    "◇": "gem",
    "○": "ring",
    "♣": "tree",
  };

  function svg(name, className) {
    var key = PATHS[name] ? name : GLYPH_MAP[name] || "shards";
    var cls = className ? "wb-icon " + className : "wb-icon";
    return (
      '<svg class="' +
      cls +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      PATHS[key] +
      "</svg>"
    );
  }

  function fromGlyph(glyph, className) {
    if (!glyph) return svg("shards", className);
    if (String(glyph).trim().charAt(0) === "<") return glyph;
    return svg(glyph, className);
  }

  window.WB_ICONS = {
    svg: svg,
    fromGlyph: fromGlyph,
    has: function (name) {
      return !!(PATHS[name] || GLYPH_MAP[name]);
    },
  };
})();
