"use strict";

globalThis.QuimiCraftSummons = (() => {
  const MAX_ACTIVE = 4;
  const DEFAULT_DURATION = 180; // seconds

  const categories = [
    { id: "all", label: "Todos" },
    { id: "elemental", label: "Elementais" },
    { id: "fel", label: "Infernais & Cães" },
    { id: "golem", label: "Golens" },
    { id: "light", label: "Seres de Luz" },
    { id: "chaos", label: "Seres do Caos" },
    { id: "spirit", label: "Espíritos & Feras" }
  ];

  const spells = [
    // Elementais
    { id: "fire_elemental", name: "Elemental do Fogo", category: "elemental", mana: 22, hp: 110, color: "#ff8c42", desc: "Dispara descargas ígneas contra inimigos próximos." },
    { id: "water_elemental", name: "Elemental da Água", category: "elemental", mana: 22, hp: 110, color: "#5ce6ff", desc: "Lança jatos frios que desaceleram os alvos." },
    { id: "earth_elemental", name: "Elemental da Terra", category: "elemental", mana: 26, hp: 155, color: "#d8ad66", desc: "Vanguarda rochosa resistente com impacto sísmico." },
    { id: "wind_elemental", name: "Elemental do Vento", category: "elemental", mana: 20, hp: 95, color: "#9cfce8", desc: "Ágil e veloz, empurra inimigos com rajadas de vento." },
    { id: "ice_elemental", name: "Elemental do Gelo", category: "elemental", mana: 24, hp: 115, color: "#9eeeff", desc: "Congela e desacelera inimigos com estilhaços glaciais." },
    { id: "lightning_elemental", name: "Elemental do Raio", category: "elemental", mana: 26, hp: 105, color: "#fff078", desc: "Dispara relâmpagos velozes de longo alcance." },
    { id: "nature_elemental", name: "Elemental da Natureza", category: "elemental", mana: 22, hp: 120, color: "#72f58a", desc: "Protetor da mata que desacelera inimigos com esporos." },
    { id: "arcane_sentinel", name: "Sentinela Arcana", category: "elemental", mana: 28, hp: 145, color: "#d694ff", desc: "Descargas prismáticas arcanas de alto dano." },
    // Infernais & Cães Infernais
    { id: "fel_infernal", name: "Infernal da Fenda", category: "fel", mana: 36, hp: 205, color: "#8cff38", meteor: true, felCost: 6, desc: "Cai dos céus em um meteoro verde vil e luta como seu aliado!" },
    { id: "fel_hound", name: "Cão Infernal (Cão da Fenda)", category: "fel", mana: 20, hp: 98, color: "#a8ff4f", felCost: 3, desc: "Fera infernal veloz de presas e tentáculos que rasga inimigos." },
    { id: "fel_felguard", name: "Guarda Vil (Mo'arg)", category: "fel", mana: 28, hp: 168, color: "#ff6b4a", felCost: 5, desc: "Guerreiro demoníaco de machado duplo em chamas de Fel." },
    { id: "fel_imp", name: "Diabrete Vil", category: "fel", mana: 14, hp: 65, color: "#ff9b42", felCost: 2, desc: "Conjura bolas de fogo vil à distância por pouca mana." },
    { id: "fel_abyssal_lord", name: "Lorde Abissal (Supremus)", category: "fel", mana: 48, hp: 280, color: "#4effc8", felCost: 10, desc: "Titã vulcânico de chamas azul-esmeralda com erupções devastadoras." },
    // Golens
    { id: "golem", name: "Golem de Obsidiana", category: "golem", mana: 26, hp: 160, color: "#9b72c9", desc: "Colosso de obsidiana com golpes sísmicos pesados." },
    { id: "iron_golem", name: "Golem de Ferro", category: "golem", mana: 28, hp: 175, color: "#b0bec8", desc: "Guardião blindado de aço para segurar a linha de frente." },
    { id: "amethyst_golem", name: "Golem de Ametista", category: "golem", mana: 28, hp: 160, color: "#be82ff", desc: "Golem cristalino de geodos com grande resistência." },
    { id: "copper_golem", name: "Golem de Cobre", category: "golem", mana: 22, hp: 135, color: "#d68452", desc: "Constructo metálico ágil de cobre luminescente." },
    { id: "alchemist_sentinel", name: "Constructo Alquímico", category: "golem", mana: 30, hp: 185, color: "#68f0e0", desc: "Autômato de latão e vidro pressurizado da Ordem dos Alquimistas." },
    // Seres de Luz
    { id: "light_naaru", name: "Naaru Guardião", category: "light", mana: 38, hp: 230, color: "#ffe688", sanityAura: true, desc: "Ser de Luz cristalina que ataca o mal, restaura sua sanidade e dissipa visões!" },
    { id: "light_sentinel", name: "Sentinela Áurea", category: "light", mana: 24, hp: 140, color: "#ffd966", desc: "Constructo forjado à Luz de espada solar e égide." },
    { id: "light_seraph", name: "Serafim de Âmbar", category: "light", mana: 26, hp: 125, color: "#ffec9e", desc: "Guerreira alada que arremessa lanças solares à distância." },
    { id: "light_vindicator", name: "Vindicante Draeneico", category: "light", mana: 32, hp: 175, color: "#d8a4ff", desc: "Campeão da Luz armado com o Martelo de Cristal dos Naaru." },
    { id: "light_valkyr", name: "Val'kyr da Alvorada", category: "light", mana: 30, hp: 155, color: "#fff1b8", desc: "Guerreira celestial alada de combate rápido." },
    // Seres do Caos / Vazio & Flagelo
    { id: "void_horror", name: "Horror do Vazio", category: "chaos", mana: 28, hp: 145, color: "#c96eff", sanityCost: 6, desc: "Entidade tentacular flutuante do Caos que dispara setas psíquicas." },
    { id: "sem_rosto", name: "Sem-Rosto do Caos", category: "chaos", mana: 30, hp: 165, color: "#a852e8", sanityCost: 7, desc: "Guerreiro abissal de tentáculos faciais e lâmina sombria." },
    { id: "kthir_harbinger", name: "Arauto K'thir", category: "chaos", mana: 34, hp: 175, color: "#e67aff", sanityCost: 8, desc: "Sacerdote do Caos que bombardeia inimigos com energia do Vazio." },
    { id: "olho_errante", name: "Olho Errante do Caos", category: "chaos", mana: 20, hp: 90, color: "#ff72c6", sanityCost: 4, desc: "Globo ocular abissal que dispara raios mentais." },
    { id: "scourge_deathknight", name: "Cavaleiro da Morte", category: "chaos", mana: 32, hp: 170, color: "#70e2ff", desc: "Campeão rúnico gélido que desacelera inimigos com aço saronítico." },
    // Espíritos & Feras Druídicas
    { id: "wolf", name: "Lobo Espiritual", category: "spirit", mana: 16, hp: 85, color: "#8ff2c6", desc: "Companheiro lupino veloz invocado pelos espíritos da mata." },
    { id: "brown_bear", name: "Urso Guardião", category: "spirit", mana: 24, hp: 145, color: "#a88058", desc: "Fera guardiã druídica de alta vitalidade e garras poderosas." },
    { id: "druid_shaman", name: "Xamã Elemental Aliado", category: "spirit", mana: 30, hp: 150, color: "#68f09c", desc: "Xamã do Círculo que conjura raios elementais e se transforma em combate!" }
  ];

  const byId = Object.fromEntries(spells.map(s => [s.id, s]));
  return { MAX_ACTIVE, DEFAULT_DURATION, categories, spells, byId };
})();
