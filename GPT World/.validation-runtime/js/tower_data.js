import {REGIONS} from "./data.js";
var TOWER_CONFIG = Object.freeze({
  id: "tower-of-flesh",
  name: "Torre da Carne",
  mode: "tower",
  cellSize: 64,
  chunkCells: 8,
  minGrid: 64,
  maxGrid: 96,
  unlockPrimeCommands: 1,
  maxParticles: 42,
  maxVisiblePropsPerChunk: 28,
  assetRoot: "./assets/pixel/tilesets_itens_nomeados_webp",
  currency: "Carne da Voz"
});
var TOWER_FAMILIES = Object.freeze([
  { id: "medula-congelada", name: "Medula Congelada", region: 0, folder: "regiao_01_glacial", palette: ["#d9f8ff", "#729fc2", "#14273e"], surface: "neve e gelo preservado", pulse: "frio \xF3sseo", hazard: "Gelo medular" },
  { id: "pulmao-fungico", name: "Pulm\xE3o F\xFAngico", region: 1, folder: "regiao_02_floresta_ancestral", palette: ["#b0f0a4", "#3b8b68", "#12291f"], surface: "musgo, \xE1gua e esporos", pulse: "respira\xE7\xE3o micelial", hazard: "Esporos sufocantes" },
  { id: "estomago-da-forja", name: "Est\xF4mago da Forja", region: 2, folder: "regiao_03_vulcanica", palette: ["#ffb05f", "#ba3829", "#2b0b0c"], surface: "esc\xF3ria e lava digestiva", pulse: "calor perist\xE1ltico", hazard: "Lava digestiva" },
  { id: "ossario-da-lei", name: "Oss\xE1rio da Lei", region: 3, folder: "regiao_04_montanhosa", palette: ["#e2c58c", "#77684d", "#24211f"], surface: "pedra, trilhos e leis mineralizadas", pulse: "rangido das costelas", hazard: "Precip\xEDcio calcificado" },
  { id: "figado-parasita", name: "F\xEDgado Parasita", region: 4, folder: "regiao_05_selva_tropical", palette: ["#c5e66d", "#3d7140", "#182517"], surface: "selva que devora templos", pulse: "seiva contaminada", hazard: "\xC1gua parasitada" },
  { id: "gordura-dourada", name: "Gordura Dourada", region: 5, folder: "regiao_06_vale_outonal", palette: ["#ffdc78", "#b66b39", "#42251c"], surface: "colheitas sobre tecido decadente", pulse: "fermenta\xE7\xE3o dourada", hazard: "Podrid\xE3o a\xE7ucarada" },
  { id: "pulmao-afogado", name: "Pulm\xE3o Afogado", region: 6, folder: "regiao_07_costa_oceanica", palette: ["#8af5ec", "#267f9f", "#0d3040"], surface: "ilhas, recifes e vias inundadas", pulse: "mar\xE9 respirat\xF3ria", hazard: "Mar profundo" },
  { id: "sistema-nervoso-cristalino", name: "Sistema Nervoso Cristalino", region: 7, folder: "regiao_08_cavernas_cristalinas", palette: ["#91eaff", "#5266c8", "#151838"], surface: "cristais que conduzem ordens", pulse: "descarga sin\xE1ptica", hazard: "\xC1gua neural" },
  { id: "coracao-necrosado", name: "Cora\xE7\xE3o Necrosado", region: 8, folder: "regiao_09_pantano_sombrio", palette: ["#b6a3c8", "#58405f", "#1b111e"], surface: "p\xE2ntano, ossos e mausol\xE9us", pulse: "batimento necrosado", hazard: "Lodo cadav\xE9rico" },
  { id: "cerebro-arcano", name: "C\xE9rebro Arcano", region: 9, folder: "regiao_10_reino_arcano", palette: ["#dba6ff", "#7652bd", "#1e1537"], surface: "plataformas, bibliotecas e magia pura", pulse: "pensamento sem mestre", hazard: "Vazio arcano" }
]);
var TOWER_GRAMMARS = Object.freeze([
  { id: "arteria", name: "Art\xE9ria central", template: "fortress" },
  { id: "orgao-circular", name: "\xD3rg\xE3o circular", template: "temple" },
  { id: "fortaleza", name: "Fortaleza de carne", template: "fortress" },
  { id: "povoado-ruinado", name: "Povoado reconstru\xEDdo", template: "settlement" },
  { id: "rede-cavernosa", name: "Rede cavernosa", template: "cave" },
  { id: "mina-ferroviaria", name: "Mina e ferrovias", template: "mine" },
  { id: "ilhas-afogadas", name: "Ilhas afogadas", template: "port" },
  { id: "complexo-templo", name: "Complexo de templo", template: "temple" },
  { id: "clareiras", name: "Clareiras vivas", template: "forest" },
  { id: "espiral", name: "Espiral de descida", template: "ruins" },
  { id: "coluna-vertebral", name: "Coluna vertebral", template: "fortress" },
  { id: "plataformas-arcanas", name: "Plataformas partidas", template: "laboratory" }
]);
var TOWER_MUTATIONS = Object.freeze([
  { id: "pulsante", name: "Pulsante", description: "Elites regeneram uma pequena parcela de PV no in\xEDcio da rodada.", enemy: { regen: 0.025 } },
  { id: "nervoso", name: "Nervoso", description: "Criaturas aceleram quando s\xE3o feridas.", enemy: { speed: 0.12 } },
  { id: "ossificado", name: "Ossificado", description: "As criaturas recebem uma camada adicional de armadura.", enemy: { defense: 0.16 } },
  { id: "hemorragico", name: "Hemorr\xE1gico", description: "Ataques especiais podem aplicar Sangramento.", status: "Sangramento" },
  { id: "parasitado", name: "Parasitado", description: "Encontros podem conter um eco menor adicional.", enemy: { extra: true } },
  { id: "ecoante", name: "Ecoante", description: "A torre repete padr\xF5es ofensivos com maior frequ\xEAncia.", enemy: { echo: true } },
  { id: "faminto", name: "Faminto", description: "Golpes de elite drenam parte da vida causada.", enemy: { drain: 0.08 } },
  { id: "contraditorio", name: "Contradit\xF3rio", description: "As resist\xEAncias oscilam a cada nova rodada.", enemy: { shift: true } },
  { id: "vigilante", name: "Vigilante", description: "Uma criatura protege o aliado mais vulner\xE1vel.", enemy: { guard: true } },
  { id: "instavel", name: "Inst\xE1vel", description: "Elites liberam uma descarga ao perder a forma.", enemy: { burst: 0.06 } }
]);
var TOWER_OBJECTIVES = Object.freeze([
  { id: "reach", label: "Alcance a sa\xEDda viva.", verb: "Sa\xEDda alcan\xE7ada", targets: 0 },
  { id: "guardian", label: "Derrote o guardi\xE3o da passagem.", verb: "Guardi\xE3o derrotado", targets: 1 },
  { id: "valves", label: "Ative duas v\xE1lvulas org\xE2nicas.", verb: "V\xE1lvula ativada", targets: 2 },
  { id: "nodes", label: "Destrua tr\xEAs n\xF3s de comando corrompidos.", verb: "N\xF3 rompido", targets: 3 },
  { id: "rescue", label: "Liberte o eco aprisionado.", verb: "Eco libertado", targets: 1 },
  { id: "memory", label: "Encontre a mem\xF3ria fr\xE1gil e leve-a \xE0 sa\xEDda.", verb: "Mem\xF3ria preservada", targets: 1 },
  { id: "ambush", label: "Sobreviva \xE0 emboscada da torre.", verb: "Emboscada vencida", targets: 1 },
  { id: "key", label: "Encontre a chave viva que abre a sa\xEDda.", verb: "Chave encontrada", targets: 1 },
  { id: "choice", label: "Escolha qual lembran\xE7a continuar\xE1 existindo.", verb: "Escolha registrada", targets: 1 },
  { id: "disable", label: "Desative o foco de risco ambiental.", verb: "Foco desativado", targets: 2 },
  { id: "explore", label: "Revele 55% da geometria deste andar.", verb: "Geometria mapeada", targets: 55 },
  { id: "altar", label: "Localize e desperte o altar vivo.", verb: "Altar desperto", targets: 1 },
  { id: "runes", label: "Toque as tr\xEAs runas na sequ\xEAncia indicada.", verb: "Runa reconhecida", targets: 3 },
  { id: "escape", label: "Escape antes que a c\xE2mara termine de fechar.", verb: "C\xE2mara escapada", targets: 0 }
]);
var TOWER_RUN_UPGRADES = Object.freeze([
  { id: "vitalidade", name: "Carne Persistente", description: "PV m\xE1ximo +10% durante esta incurs\xE3o.", stat: "hp", value: 0.1 },
  { id: "foco", name: "Nervo Reservado", description: "Foco m\xE1ximo +12% durante esta incurs\xE3o.", stat: "focus", value: 0.12 },
  { id: "ataque", name: "Mand\xEDbula do Verbo", description: "Ataque +9% durante esta incurs\xE3o.", stat: "attack", value: 0.09 },
  { id: "defesa", name: "Costela Contradit\xF3ria", description: "Defesa +11% durante esta incurs\xE3o.", stat: "defense", value: 0.11 },
  { id: "velocidade", name: "Impulso Sin\xE1ptico", description: "Velocidade +10% e deslocamento mais r\xE1pido.", stat: "speed", value: 0.1, movement: 0.1 },
  { id: "cura-defesa", name: "Cicatriz Vigilante", description: "Curas tamb\xE9m concedem prote\xE7\xE3o tempor\xE1ria.", effect: "healBarrier" },
  { id: "critico-foco", name: "Eco da Precis\xE3o", description: "Acertos cr\xEDticos recuperam Foco.", effect: "criticalFocus" },
  { id: "barreira", name: "Membrana Inicial", description: "O grupo come\xE7a batalhas com uma Barreira.", effect: "openingBarrier" },
  { id: "carne", name: "Gl\xE2ndula Coletora", description: "Carne da Voz encontrada +20%.", effect: "currency", value: 0.2 },
  { id: "perigo", name: "Pele Cauterizada", description: "Dano ambiental reduzido em 35%.", effect: "hazard", value: 0.35 },
  { id: "renascer", name: "Lembran\xE7a de Forma", description: "Revive automaticamente uma vez nesta incurs\xE3o.", effect: "revive", uses: 1 },
  { id: "elite", name: "Fome de Sentinela", description: "Elites concedem uma recompensa adicional.", effect: "eliteLoot" }
]);
var TOWER_PERMANENT_UPGRADES = Object.freeze([
  { id: "mutacao-inicial", name: "Cicatriz Herdada", description: "Comece cada incurs\xE3o com uma melhoria tempor\xE1ria aleat\xF3ria.", cost: 18, max: 1 },
  { id: "escolha-extra", name: "Tr\xEAs Vozes", description: "Melhora a variedade das escolhas de recompensa.", cost: 24, max: 2 },
  { id: "repouso", name: "Medula Restauradora", description: "C\xE2maras de repouso curam 8% a mais por n\xEDvel.", cost: 16, max: 3 },
  { id: "salas-raras", name: "Mem\xF3ria Incomum", description: "Melhora Ecos, materiais e itens encontrados nos tesouros da torre.", cost: 20, max: 3 },
  { id: "mapa", name: "Nervo Cart\xF3grafo", description: "Revela uma \xE1rea maior do minimapa.", cost: 14, max: 4 },
  { id: "retencao", name: "Carne que Recorda", description: "Ret\xE9m mais Carne da Voz quando a incurs\xE3o termina em derrota.", cost: 22, max: 4 },
  { id: "hibridos", name: "\xD3rg\xE3o Imposs\xEDvel", description: "Andares h\xEDbridos concedem Carne da Voz adicional.", cost: 34, max: 1 },
  { id: "reliquias", name: "Receita do Ferimento", description: "Elites passam a produzir um componente regional adicional para cria\xE7\xE3o.", cost: 40, max: 1 }
]);
var TOWER_WHISPERS = Object.freeze([
  "A torre lembra uma resposta que voc\xEA nunca chegou a ler.",
  "Cada porta \xE9 uma ferida tentando parecer arquitetura.",
  "O mapa pulsa porque sabe que est\xE1 sendo observado.",
  "Lucas e Timb\xF3 doem no mesmo lugar, embora usem nomes diferentes.",
  "Uma frase apagada ainda pode aprender a morder.",
  "A sa\xEDda n\xE3o conduz para fora; conduz para a pr\xF3xima mem\xF3ria.",
  "O ch\xE3o soletra seu nome com veias que n\xE3o estavam aqui antes.",
  "A Voz recusou esta paisagem. A paisagem n\xE3o recusou a Voz.",
  "O sil\xEAncio entre dois comandos tamb\xE9m \xE9 uma ordem.",
  "A torre n\xE3o sobe. O mundo \xE9 que continua descendo.",
  "Toda escolha deixa um \xF3rg\xE3o para tr\xE1s.",
  "Voc\xEA reconhece o corredor antes de ele terminar de nascer."
]);
var TOWER_BOSS_TITLES = Object.freeze([
  "Cora\xE7\xE3o que Aprende",
  "Pulm\xE3o dos Comandos Afogados",
  "Medula da Primeira Contradi\xE7\xE3o",
  "Est\xF4mago que Digere Mundos",
  "C\xE9rebro sem Mestre"
]);
var BOSS_PREFIXES = ["\xD3rg\xE3o", "Nervo", "Cora\xE7\xE3o", "Mand\xEDbula", "Arquivo", "Cicatriz", "Ventre", "Olho"];
var BOSS_SUFFIXES = ["das Respostas Perdidas", "da Lei Faminta", "do Nome Apagado", "que Recusa o Fim", "das Vozes Incompat\xEDveis", "sem Dono", "da \xDAltima Ferida", "que Sonha Comandos"];
function towerBossName(floor, randomValue = 0) {
  if (floor % 10 !== 0) return `Sentinela do Andar ${floor}`;
  const milestone = floor / 10;
  if (milestone <= TOWER_BOSS_TITLES.length) return TOWER_BOSS_TITLES[milestone - 1];
  const a = BOSS_PREFIXES[Math.abs(Math.floor(randomValue * 997 + floor)) % BOSS_PREFIXES.length];
  const b = BOSS_SUFFIXES[Math.abs(Math.floor(randomValue * 1597 + floor * 3)) % BOSS_SUFFIXES.length];
  return `${a} ${b}`;
}
function towerEnemyPool(familyIndex, hybridIndex = null) {
  const indexes = [familyIndex];
  if (Number.isInteger(hybridIndex) && hybridIndex !== familyIndex) indexes.push(hybridIndex);
  return indexes.flatMap((index) => {
    const region = REGIONS[index];
    return [
      ...region.normal.map((id) => ({ id, region: index, kind: "normal" })),
      { id: region.miniboss, region: index, kind: "miniboss" },
      ...region.bosses.map((id) => ({ id, region: index, kind: "boss" }))
    ];
  });
}
export {TOWER_CONFIG,TOWER_FAMILIES,TOWER_GRAMMARS,TOWER_MUTATIONS,TOWER_OBJECTIVES,TOWER_WHISPERS,towerBossName,towerEnemyPool};
