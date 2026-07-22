import { REGIONS } from "./data.js";

export const TOWER_CONFIG = Object.freeze({
  id:"tower-of-flesh",
  name:"Torre da Carne",
  mode:"tower",
  cellSize:64,
  chunkCells:8,
  minGrid:64,
  maxGrid:96,
  unlockPrimeCommands:1,
  maxParticles:42,
  maxVisiblePropsPerChunk:28,
  assetRoot:"./assets/pixel/tilesets_itens_nomeados_webp",
  currency:"Carne da Voz"
});

export const TOWER_FAMILIES = Object.freeze([
  {id:"medula-congelada",name:"Medula Congelada",region:0,folder:"regiao_01_glacial",palette:["#d9f8ff","#729fc2","#14273e"],surface:"neve e gelo preservado",pulse:"frio ósseo",hazard:"Gelo medular"},
  {id:"pulmao-fungico",name:"Pulmão Fúngico",region:1,folder:"regiao_02_floresta_ancestral",palette:["#b0f0a4","#3b8b68","#12291f"],surface:"musgo, água e esporos",pulse:"respiração micelial",hazard:"Esporos sufocantes"},
  {id:"estomago-da-forja",name:"Estômago da Forja",region:2,folder:"regiao_03_vulcanica",palette:["#ffb05f","#ba3829","#2b0b0c"],surface:"escória e lava digestiva",pulse:"calor peristáltico",hazard:"Lava digestiva"},
  {id:"ossario-da-lei",name:"Ossário da Lei",region:3,folder:"regiao_04_montanhosa",palette:["#e2c58c","#77684d","#24211f"],surface:"pedra, trilhos e leis mineralizadas",pulse:"rangido das costelas",hazard:"Precipício calcificado"},
  {id:"figado-parasita",name:"Fígado Parasita",region:4,folder:"regiao_05_selva_tropical",palette:["#c5e66d","#3d7140","#182517"],surface:"selva que devora templos",pulse:"seiva contaminada",hazard:"Água parasitada"},
  {id:"gordura-dourada",name:"Gordura Dourada",region:5,folder:"regiao_06_vale_outonal",palette:["#ffdc78","#b66b39","#42251c"],surface:"colheitas sobre tecido decadente",pulse:"fermentação dourada",hazard:"Podridão açucarada"},
  {id:"pulmao-afogado",name:"Pulmão Afogado",region:6,folder:"regiao_07_costa_oceanica",palette:["#8af5ec","#267f9f","#0d3040"],surface:"ilhas, recifes e vias inundadas",pulse:"maré respiratória",hazard:"Mar profundo"},
  {id:"sistema-nervoso-cristalino",name:"Sistema Nervoso Cristalino",region:7,folder:"regiao_08_cavernas_cristalinas",palette:["#91eaff","#5266c8","#151838"],surface:"cristais que conduzem ordens",pulse:"descarga sináptica",hazard:"Água neural"},
  {id:"coracao-necrosado",name:"Coração Necrosado",region:8,folder:"regiao_09_pantano_sombrio",palette:["#b6a3c8","#58405f","#1b111e"],surface:"pântano, ossos e mausoléus",pulse:"batimento necrosado",hazard:"Lodo cadavérico"},
  {id:"cerebro-arcano",name:"Cérebro Arcano",region:9,folder:"regiao_10_reino_arcano",palette:["#dba6ff","#7652bd","#1e1537"],surface:"plataformas, bibliotecas e magia pura",pulse:"pensamento sem mestre",hazard:"Vazio arcano"}
]);

export const TOWER_GRAMMARS = Object.freeze([
  {id:"arteria",name:"Artéria central",template:"fortress"},
  {id:"orgao-circular",name:"Órgão circular",template:"temple"},
  {id:"fortaleza",name:"Fortaleza de carne",template:"fortress"},
  {id:"povoado-ruinado",name:"Povoado reconstruído",template:"settlement"},
  {id:"rede-cavernosa",name:"Rede cavernosa",template:"cave"},
  {id:"mina-ferroviaria",name:"Mina e ferrovias",template:"mine"},
  {id:"ilhas-afogadas",name:"Ilhas afogadas",template:"port"},
  {id:"complexo-templo",name:"Complexo de templo",template:"temple"},
  {id:"clareiras",name:"Clareiras vivas",template:"forest"},
  {id:"espiral",name:"Espiral de descida",template:"ruins"},
  {id:"coluna-vertebral",name:"Coluna vertebral",template:"fortress"},
  {id:"plataformas-arcanas",name:"Plataformas partidas",template:"laboratory"}
]);

export const TOWER_MUTATIONS = Object.freeze([
  {id:"pulsante",name:"Pulsante",description:"Elites regeneram uma pequena parcela de PV no início da rodada.",enemy:{regen:.025}},
  {id:"nervoso",name:"Nervoso",description:"Criaturas aceleram quando são feridas.",enemy:{speed:.12}},
  {id:"ossificado",name:"Ossificado",description:"As criaturas recebem uma camada adicional de armadura.",enemy:{defense:.16}},
  {id:"hemorragico",name:"Hemorrágico",description:"Ataques especiais podem aplicar Sangramento.",status:"Sangramento"},
  {id:"parasitado",name:"Parasitado",description:"Encontros podem conter um eco menor adicional.",enemy:{extra:true}},
  {id:"ecoante",name:"Ecoante",description:"A torre repete padrões ofensivos com maior frequência.",enemy:{echo:true}},
  {id:"faminto",name:"Faminto",description:"Golpes de elite drenam parte da vida causada.",enemy:{drain:.08}},
  {id:"contraditorio",name:"Contraditório",description:"As resistências oscilam a cada nova rodada.",enemy:{shift:true}},
  {id:"vigilante",name:"Vigilante",description:"Uma criatura protege o aliado mais vulnerável.",enemy:{guard:true}},
  {id:"instavel",name:"Instável",description:"Elites liberam uma descarga ao perder a forma.",enemy:{burst:.06}}
]);

export const TOWER_OBJECTIVES = Object.freeze([
  {id:"reach",label:"Alcance a saída viva.",verb:"Saída alcançada",targets:0},
  {id:"guardian",label:"Derrote o guardião da passagem.",verb:"Guardião derrotado",targets:1},
  {id:"valves",label:"Ative duas válvulas orgânicas.",verb:"Válvula ativada",targets:2},
  {id:"nodes",label:"Destrua três nós de comando corrompidos.",verb:"Nó rompido",targets:3},
  {id:"rescue",label:"Liberte o eco aprisionado.",verb:"Eco libertado",targets:1},
  {id:"memory",label:"Encontre a memória frágil e leve-a à saída.",verb:"Memória preservada",targets:1},
  {id:"ambush",label:"Sobreviva à emboscada da torre.",verb:"Emboscada vencida",targets:1},
  {id:"key",label:"Encontre a chave viva que abre a saída.",verb:"Chave encontrada",targets:1},
  {id:"choice",label:"Escolha qual lembrança continuará existindo.",verb:"Escolha registrada",targets:1},
  {id:"disable",label:"Desative o foco de risco ambiental.",verb:"Foco desativado",targets:2},
  {id:"explore",label:"Revele 55% da geometria deste andar.",verb:"Geometria mapeada",targets:55},
  {id:"altar",label:"Localize e desperte o altar vivo.",verb:"Altar desperto",targets:1},
  {id:"runes",label:"Toque as três runas na sequência indicada.",verb:"Runa reconhecida",targets:3},
  {id:"escape",label:"Escape antes que a câmara termine de fechar.",verb:"Câmara escapada",targets:0}
]);

export const TOWER_RUN_UPGRADES = Object.freeze([
  {id:"vitalidade",name:"Carne Persistente",description:"PV máximo +10% durante esta incursão.",stat:"hp",value:.10},
  {id:"foco",name:"Nervo Reservado",description:"Foco máximo +12% durante esta incursão.",stat:"focus",value:.12},
  {id:"ataque",name:"Mandíbula do Verbo",description:"Ataque +9% durante esta incursão.",stat:"attack",value:.09},
  {id:"defesa",name:"Costela Contraditória",description:"Defesa +11% durante esta incursão.",stat:"defense",value:.11},
  {id:"velocidade",name:"Impulso Sináptico",description:"Velocidade +10% e deslocamento mais rápido.",stat:"speed",value:.10,movement:.10},
  {id:"cura-defesa",name:"Cicatriz Vigilante",description:"Curas também concedem proteção temporária.",effect:"healBarrier"},
  {id:"critico-foco",name:"Eco da Precisão",description:"Acertos críticos recuperam Foco.",effect:"criticalFocus"},
  {id:"barreira",name:"Membrana Inicial",description:"O grupo começa batalhas com uma Barreira.",effect:"openingBarrier"},
  {id:"carne",name:"Glândula Coletora",description:"Carne da Voz encontrada +20%.",effect:"currency",value:.20},
  {id:"perigo",name:"Pele Cauterizada",description:"Dano ambiental reduzido em 35%.",effect:"hazard",value:.35},
  {id:"renascer",name:"Lembrança de Forma",description:"Revive automaticamente uma vez nesta incursão.",effect:"revive",uses:1},
  {id:"elite",name:"Fome de Sentinela",description:"Elites concedem uma recompensa adicional.",effect:"eliteLoot"}
]);

export const TOWER_PERMANENT_UPGRADES = Object.freeze([
  {id:"mutacao-inicial",name:"Cicatriz Herdada",description:"Comece cada incursão com uma melhoria temporária aleatória.",cost:18,max:1},
  {id:"escolha-extra",name:"Três Vozes",description:"Melhora a variedade das escolhas de recompensa.",cost:24,max:2},
  {id:"repouso",name:"Medula Restauradora",description:"Câmaras de repouso curam 8% a mais por nível.",cost:16,max:3},
  {id:"salas-raras",name:"Memória Incomum",description:"Melhora Ecos, materiais e itens encontrados nos tesouros da torre.",cost:20,max:3},
  {id:"mapa",name:"Nervo Cartógrafo",description:"Revela uma área maior do minimapa.",cost:14,max:4},
  {id:"retencao",name:"Carne que Recorda",description:"Retém mais Carne da Voz quando a incursão termina em derrota.",cost:22,max:4},
  {id:"hibridos",name:"Órgão Impossível",description:"Andares híbridos concedem Carne da Voz adicional.",cost:34,max:1},
  {id:"reliquias",name:"Receita do Ferimento",description:"Elites passam a produzir um componente regional adicional para criação.",cost:40,max:1}
]);

export const TOWER_WHISPERS = Object.freeze([
  "A torre lembra uma resposta que você nunca chegou a ler.",
  "Cada porta é uma ferida tentando parecer arquitetura.",
  "O mapa pulsa porque sabe que está sendo observado.",
  "Lucas e Timbó doem no mesmo lugar, embora usem nomes diferentes.",
  "Uma frase apagada ainda pode aprender a morder.",
  "A saída não conduz para fora; conduz para a próxima memória.",
  "O chão soletra seu nome com veias que não estavam aqui antes.",
  "A Voz recusou esta paisagem. A paisagem não recusou a Voz.",
  "O silêncio entre dois comandos também é uma ordem.",
  "A torre não sobe. O mundo é que continua descendo.",
  "Toda escolha deixa um órgão para trás.",
  "Você reconhece o corredor antes de ele terminar de nascer."
]);

export const TOWER_BOSS_TITLES = Object.freeze([
  "Coração que Aprende",
  "Pulmão dos Comandos Afogados",
  "Medula da Primeira Contradição",
  "Estômago que Digere Mundos",
  "Cérebro sem Mestre"
]);

const BOSS_PREFIXES=["Órgão","Nervo","Coração","Mandíbula","Arquivo","Cicatriz","Ventre","Olho"];
const BOSS_SUFFIXES=["das Respostas Perdidas","da Lei Faminta","do Nome Apagado","que Recusa o Fim","das Vozes Incompatíveis","sem Dono","da Última Ferida","que Sonha Comandos"];

export function towerBossName(floor,randomValue=0) {
  if(floor%10!==0)return`Sentinela do Andar ${floor}`;
  const milestone=floor/10;if(milestone<=TOWER_BOSS_TITLES.length)return TOWER_BOSS_TITLES[milestone-1];
  const a=BOSS_PREFIXES[Math.abs(Math.floor(randomValue*997+floor))%BOSS_PREFIXES.length];
  const b=BOSS_SUFFIXES[Math.abs(Math.floor(randomValue*1597+floor*3))%BOSS_SUFFIXES.length];
  return`${a} ${b}`;
}

export function towerEnemyPool(familyIndex,hybridIndex=null) {
  const indexes=[familyIndex];if(Number.isInteger(hybridIndex)&&hybridIndex!==familyIndex)indexes.push(hybridIndex);
  return indexes.flatMap((index)=>{
    const region=REGIONS[index];
    return [
      ...region.normal.map((id)=>({id,region:index,kind:"normal"})),
      {id:region.miniboss,region:index,kind:"miniboss"},
      ...region.bosses.map((id)=>({id,region:index,kind:"boss"}))
    ];
  });
}
