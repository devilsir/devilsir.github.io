"use strict";

globalThis.QuimiCraftFolklore = (() => {
  const strike = (damage, range, windup, cooldown, effect = "physical") =>
    ({kind: "lunge", damage, range, windup: Math.max(.2, Number((windup * .62).toFixed(2))), cooldown: Math.max(1.0, Number((cooldown * .7).toFixed(2))), effect});
  const profile = (temperament, hp, walk, run, sense, roam, attack = null, loot = []) =>
    ({temperament, hp, walk, run, sense, roam, strike: attack, loot});

  const creatures = {
    curupira: {
      name: "Curupira", radius: .32, height: 1.62,
      detail: "Guardião das matas de tradição indígena. Tem cabelo de fogo e pés voltados para trás. Persegue quem derruba árvores ou ataca animais silvestres por perto.",
      profile: profile("neutral", 64, 1.6, 5.9, 13, 16, strike(18, 2.15, .34, 1.5))
    },
    pink_boto: {
      name: "Boto-cor-de-rosa", radius: .48, height: 1.79,
      detail: "Encantado dos rios amazônicos. À noite sai da água como um rapaz de branco com chapéu, lembrando as histórias das festas ribeirinhas. Volta ao rio ao amanhecer.",
      profile: profile("calm", 54, 1.28, 3.4, 7, 8)
    },
    saci: {
      name: "Saci-Pererê", radius: .32, height: 1.4,
      detail: "Travesso de gorro vermelho e uma perna só. Anda aos pulos e usa redemoinhos para empurrar viajantes e apagar fogueiras.",
      profile: profile("calm", 34, 1.65, 4.7, 9, 17)
    },
    boitata: {
      name: "Boitatá", radius: .48, height: 1.30,
      detail: "Serpente de fogo do folclore de origem indígena. Vaga à noite e protege os campos de quem ateia fogo, apagando as chamas próximas.",
      profile: profile("neutral", 92, 1.36, 4.9, 14, 19, strike(21, 2.4, .52, 2, "fire"))
    },
    headless_mule: {
      name: "Mula sem Cabeça", radius: .62, height: 1.99,
      detail: "Nas lendas de tradição ibérica e brasileira, uma mulher amaldiçoada assume a forma da mula. Na noite de quinta para sexta, galopa nas estradas com fogo no lugar da cabeça.",
      profile: profile("hostile", 102, 1.8, 6.4, 15, 22, strike(24, 2.65, .45, 2, "fire"))
    },
    werewolf: {
      name: "Lobisomem", radius: .54, height: 2.16, silverOnly: true,
      detail: "Na versão de lua cheia da lenda, a maldição transforma um homem em fera. Aparece somente nas noites de lua cheia e só sofre dano de ataques de prata.",
      profile: profile("hostile", 132, 1.9, 6.2, 17, 26, strike(27, 2.75, .36, 1.55), [["hide", 2, 4]])
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
  return {creatures, phases, phase, isNight, active, habitat, canDamage};
})();
