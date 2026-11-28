"use strict";

globalThis.QuimiCraftFolklore = (() => {
  const strike = (name, damage, range, windup, cooldown, effect = "physical") =>
    ({kind: "lunge", name, damage, range, windup, cooldown, effect});
  const profile = (temperament, hp, walk, run, sense, roam, attack, loot = []) =>
    ({temperament, hp, walk, run, sense, roam, strike: attack, loot});
  const tools = {
    folklore_sieve: {name:"Peneira de Cruzeta",color:"#caa075",needs:[["stick",4],["wool",1]],detail:"Use durante a formação do redemoinho para prender o Saci por alguns segundos."},
    curupira_knot: {name:"Nó de Cipó",color:"#81a653",needs:[["stick",2]],detail:"Mostre ao Curupira para distraí-lo enquanto ele tenta desfazer o nó."}
  };

  const creatures = {
    curupira: {
      name: "Curupira", radius: .32, height: 1.62,
      detail: "Guardião das matas de tradição indígena. Com pés voltados para trás, engana quem derruba árvores ou caça na mata. Use um Nó de Cipó para distraí-lo.",
      profile: profile("neutral", 340, 1.75, 6.1, 17, 21, strike("Investida da Trilha Invertida", 32, 2.7, .43, 1.78))
    },
    pink_boto: {
      name: "Boto-cor-de-rosa", radius: .48, height: 1.79,
      detail: "Encantado dos rios amazônicos. À noite, o rapaz de branco atrai viajantes para a água. Revelar o que há sob o chapéu faz o boto voltar ao rio, onde se defende com a cauda.",
      profile: profile("neutral", 295, 1.45, 4.6, 12, 12, {...strike("Encanto das Águas", 29, 6, .95, 3.8, "sonic"),kind:"lure"})
    },
    saci: {
      name: "Saci-Pererê", radius: .32, height: 1.4,
      detail: "Travesso de gorro vermelho e uma perna só. Apaga fogueiras e levanta redemoinhos. Uma Peneira de Cruzeta prende o Saci enquanto ele prepara a rajada.",
      profile: profile("neutral", 270, 1.9, 5.1, 12, 19,
        {kind:"wind",name:"Redemoinho do Saci",damage:28,range:5.2,vertical:1.8,windup:1.15,cooldown:2.8,effect:"wind"})
    },
    boitata: {
      name: "Boitatá", radius: .48, height: 1.30,
      detail: "Serpente de fogo de tradição indígena que protege os campos de incêndios. Enfrenta incendiários com o clarão dos olhos. Fique imóvel e desvie o olhar para escapar do clarão.",
      profile: profile("neutral", 395, 1.5, 5.4, 19, 22,
        {...strike("Olhos do Boitatá", 39, 10, 1.1, 3.1, "fire"),kind:"shot",elemental:"fire",speed:13,color:0xff9a32,slow:1.1})
    },
    headless_mule: {
      name: "Mula sem Cabeça", radius: .62, height: 1.99,
      detail: "Nas noites de quinta para sexta, a mula amaldiçoada galopa nas estradas e dá coices em chamas. Enfraqueça-a e retire o freio de ferro pela lateral entre duas investidas.",
      profile: profile("hostile", 445, 2.05, 6.8, 18, 27, strike("Coice em Chamas", 45, 3.1, .64, 2.8, "fire"))
    },
    werewolf: {
      name: "Lobisomem", radius: .54, height: 2.16, silverOnly: true,
      detail: "Na versão de lua cheia da lenda, a maldição transforma um homem em fera. Aparece somente nas noites de lua cheia e só sofre dano de ataques de prata.",
      profile: profile("hostile", 490, 2.05, 6.6, 21, 28,
        strike("Garras da Lua Cheia", 42, 3, .48, 1.95), [["hide", 2, 4]])
    }
  };
  const phases = [
    ["Lua nova", "🌑"], ["Crescente", "🌒"], ["Quarto crescente", "🌓"], ["Gibosa crescente", "🌔"],
    ["Lua cheia", "🌕"], ["Gibosa minguante", "🌖"], ["Quarto minguante", "🌗"], ["Minguante", "🌘"]
  ];
  const phase = day => (Math.max(1, day) - 1) % phases.length;
  const isNight = time => time >= .54 && time < .995;
  const active = (type, time, day) => {
    if (type === "werewolf") return isNight(time) && phase(day) === 4;
    if (type === "headless_mule") return isNight(time) && (day - 1) % 7 === 3;
    return type !== "boitata" || isNight(time);
  };
  const forest = /floresta|selva|bosque|manguezal/;
  const wetland = /pântano|brejo|delta|manguezal/;
  const field = /planície|savana|prado|campina|chapada/;
  function habitat(type, biome, road) {
    if (type === "curupira" || type === "saci") return forest.test(biome);
    if (type === "boitata") return field.test(biome) || wetland.test(biome);
    if (type === "headless_mule") return road;
    if (type === "werewolf") return road || field.test(biome) || forest.test(biome);
    return type === "pink_boto" && (wetland.test(biome) || /selva tropical|floresta|planície/.test(biome));
  }
  const canDamage = (type, attack) => !creatures[type]?.silverOnly || attack?.silver === true;
  return {creatures, tools, phases, phase, isNight, active, habitat, canDamage};
})();
