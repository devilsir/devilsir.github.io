"use strict";
/* ------------------------------------------------------------
   QUIMICRAFT v7.3 — EXPANSÃO DO MUNDO · direct-browser voxel engine
   Three.js r128 + procedural assets only
------------------------------------------------------------- */
const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t), fract=x=>x-Math.floor(x), TAU=Math.PI*2;
const hash=(x,y=0,z=0)=>fract(Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453);
const horizon=QuimiCraftHorizon;
const BLOCK_SIZE=1, CHUNK=16, MAX_Y=96, WATER_LEVEL=15, DAY_SECONDS=2400;

const BLOCK={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,WOOD:5,LEAVES:6,SNOW:7,COAL:8,IRON:9,CACTUS:10,PLANK:11,TORCH:12,DOOR:13,BEDROCK:14,DOOR_OPEN:15,LAB:16,COPPER:17,SULFUR:18,GLASS:19,SPECTRAL:20,SALT:21,MUD:22,CLAY:23,BASALT:24,OBSIDIAN:25,GOLD:26,TIN:27,ZINC:28,CRYSTAL:29,ICE:30,MOSS:31,RED_SAND:32,LAVA:33,PINE_LOG:34,PINE_LEAVES:35,DRY_LEAVES:36,MARBLE:37,DEEPSTONE:38,ASH:39,GLOWSTONE:40,ALCHEMY_BRICK:41,CERAMIC:42,BRONZE_BLOCK:43,TALL_GRASS:44,POPPY:45,BLUE_FLOWER:46,WHITE_FLOWER:47,CHERRY_LOG:48,CHERRY_LEAVES:49,LIMESTONE:50,SLATE:51,AMETHYST:52,NITER:53,FROSTED_SOIL:54,PEAT:55,BAMBOO:56,PALM_LOG:57,PALM_LEAVES:58,VILLAGE_BRICK:59,FURNACE:60,WATER:61,FIRE:62};
const BDEF={
  0:{name:"Ar",solid:false},1:{name:"Grama",solid:true,tex:[0,1,2],hard:.65,icon:"#67a84f"},2:{name:"Terra",solid:true,tex:2,hard:.7,icon:"#8b5938"},
  3:{name:"Pedra",solid:true,tex:3,hard:1.55,icon:"#7f8585"},4:{name:"Areia",solid:true,tex:4,hard:.55,icon:"#d8c27b"},5:{name:"Madeira",solid:true,tex:[6,5,6],hard:1.1,icon:"#8b633d"},
  6:{name:"Folhas",solid:true,tex:7,hard:.35,icon:"#477f42",alpha:true},7:{name:"Neve",solid:true,tex:[8,3,8],hard:.45,icon:"#e7eef0"},8:{name:"Carvão",solid:true,tex:9,hard:1.8,icon:"#33383a"},
  9:{name:"Ferro",solid:true,tex:10,hard:2.05,icon:"#a78773"},10:{name:"Cacto",solid:true,tex:[12,11,12],hard:.75,icon:"#4e8a4f"},11:{name:"Tábuas",solid:true,tex:13,hard:.9,icon:"#b1804e"},
  12:{name:"Tocha",solid:false,tex:14,hard:.15,icon:"#f0ad55"},13:{name:"Porta",solid:true,tex:15,hard:.8,icon:"#936236",partial:true},14:{name:"Rocha-mãe",solid:true,tex:16,hard:99,icon:"#303638"},
  15:{name:"Porta aberta",solid:false,tex:15,hard:.8,icon:"#936236",hidden:true,partial:true},16:{name:"Bancada Química",solid:true,tex:19,hard:1.2,icon:"#4b9b92"},17:{name:"Minério de cobre",solid:true,tex:20,hard:1.8,icon:"#b66e45"},
  18:{name:"Cristal de enxofre",solid:true,tex:21,hard:1.45,icon:"#d5ca43"},19:{name:"Vidro de laboratório",solid:true,tex:22,hard:.35,icon:"#91d9df",alpha:true},20:{name:"Luz espectral",solid:false,tex:23,hard:.2,icon:"#66e6b2"},21:{name:"Bloco de sal",solid:true,tex:8,hard:.6,icon:"#eef2ef"},
  22:{name:"Lama",solid:true,tex:24,hard:.45,icon:"#675240"},23:{name:"Argila",solid:true,tex:25,hard:.65,icon:"#a77c6a"},24:{name:"Basalto",solid:true,tex:26,hard:2.1,icon:"#3d4245"},25:{name:"Obsidiana",solid:true,tex:27,hard:3.4,icon:"#312b43"},
  26:{name:"Minério de ouro",solid:true,tex:28,hard:2.35,icon:"#ddb84f"},27:{name:"Minério de estanho",solid:true,tex:29,hard:1.8,icon:"#b8c1c5"},28:{name:"Minério de zinco",solid:true,tex:30,hard:1.9,icon:"#8ea69c"},29:{name:"Cristal prismático",solid:true,tex:31,hard:1.35,icon:"#9a78df"},
  30:{name:"Gelo",solid:true,tex:32,hard:.4,icon:"#9bdbe8",alpha:true},31:{name:"Musgo",solid:true,tex:33,hard:.35,icon:"#4e7b42"},32:{name:"Areia vermelha",solid:true,tex:34,hard:.6,icon:"#bd6e43"},33:{name:"Lava",solid:false,tex:35,hard:99,icon:"#ff5a1f",liquid:true,hidden:true},
  34:{name:"Tronco de pinheiro",solid:true,tex:[6,36,6],hard:1.2,icon:"#65513b"},35:{name:"Folhas de pinheiro",solid:true,tex:37,hard:.35,icon:"#315d47",alpha:true},36:{name:"Folhas secas",solid:true,tex:38,hard:.35,icon:"#9a8144",alpha:true},37:{name:"Mármore",solid:true,tex:39,hard:1.75,icon:"#d4d1ca"},
  38:{name:"Pedra profunda",solid:true,tex:40,hard:2.4,icon:"#343b42"},39:{name:"Cinzas vulcânicas",solid:true,tex:41,hard:.45,icon:"#625d59"},40:{name:"Pedra luminosa",solid:true,tex:42,hard:1.25,icon:"#d7b75b"},41:{name:"Tijolo alquímico",solid:true,tex:43,hard:1.4,icon:"#4e8e88"},
  42:{name:"Cerâmica",solid:true,tex:44,hard:1.05,icon:"#d29a79"},43:{name:"Bloco de bronze",solid:true,tex:45,hard:2.2,icon:"#b8783d"},
  44:{name:"Tufo de grama",solid:false,tex:46,hard:.12,icon:"#65a74e",plant:true},45:{name:"Papoula rubra",solid:false,tex:47,hard:.12,icon:"#db4f58",plant:true},46:{name:"Flor-cobalto",solid:false,tex:48,hard:.12,icon:"#688ddd",plant:true},47:{name:"Estrela-das-neves",solid:false,tex:49,hard:.12,icon:"#e9eff1",plant:true},
  48:{name:"Tronco de cerejeira",solid:true,tex:[6,50,6],hard:1.15,icon:"#8d5960"},49:{name:"Folhas de cerejeira",solid:true,tex:51,hard:.34,icon:"#d98eaa",alpha:true},50:{name:"Calcário",solid:true,tex:52,hard:1.45,icon:"#c8c2aa"},51:{name:"Ardósia",solid:true,tex:53,hard:1.95,icon:"#4c5962"},
  52:{name:"Geodo de ametista",solid:true,tex:54,hard:1.55,icon:"#9b72c9"},53:{name:"Minério de nitrato",solid:true,tex:55,hard:1.35,icon:"#d9d4bd"},54:{name:"Solo congelado",solid:true,tex:56,hard:.78,icon:"#728d91"},55:{name:"Turfa",solid:true,tex:57,hard:.5,icon:"#493d34"},
  56:{name:"Bambu",solid:true,tex:[12,58,12],hard:.45,icon:"#78a947"},57:{name:"Tronco de palmeira",solid:true,tex:[6,59,6],hard:1.05,icon:"#9e7548"},58:{name:"Folhas de palmeira",solid:true,tex:60,hard:.32,icon:"#3f8b51",alpha:true},59:{name:"Tijolo da vila",solid:true,tex:61,hard:1.2,icon:"#a8654f"},
  60:{name:"Forno de pedra",solid:true,tex:62,hard:1.75,icon:"#595d60"},61:{name:"Água corrente",solid:false,liquid:true,hidden:true,tex:35,hard:99,icon:"#62c9f4"},62:{name:"Fogo",solid:false,plant:true,tex:63,hard:.2,icon:"#ff9330"}
};
QuimiCraftFrontier.register(BLOCK,BDEF);
QuimiCraftRegions.register(BLOCK,BDEF);
QuimiCraftAlchemyWorld.register(BLOCK,BDEF);
QuimiCraftHabitats.register(BLOCK,BDEF);
QuimiCraftDepths.register(BLOCK,BDEF);
QuimiCraftExpeditions.register(BLOCK,BDEF);
const fieldLab=QuimiCraftFieldLab;
fieldLab.register(BLOCK,BDEF);
fieldLab.registerCement(BLOCK,BDEF);
fieldLab.registerLamp(BLOCK,BDEF);
const folklore=QuimiCraftFolklore,fluidFlow=QuimiCraftFluidFlow;
const spectral=QuimiCraftSpectral,screamer=QuimiCraftScreamer;
const barriers=[
  ["FENCE_BAMBOO","Cerca de bambu",58,"#9bad5d","fence","BAMBOO"],
  ["FENCE_IRON","Grade de ferro",194,"#667983","fence","iron_ingot"],
  ["STONE_WALL","Mureta de pedra",192,"#81857d","wall","STONE"],
  ["BRICK_WALL","Mureta de tijolos",193,"#a45e49","wall","VILLAGE_BRICK"]
];
for(const [i,[key,name,tex,icon,detail]] of barriers.entries()){
  const id=640+i;
  BLOCK[key]=id;
  BDEF[id]={name,tex,icon,detail,solid:true,partial:true,barrier:true,hard:detail==="wall"?1.45:1};
}
BDEF[BLOCK.FENCE_WOOD].barrier=true;
const survival=QuimiCraftSurvival;
survival.register(BLOCK,BDEF);
BLOCK.MAGMA_ROCK=510;
BDEF[BLOCK.MAGMA_ROCK]={name:"Rocha magmática",solid:true,tex:225,hard:2.15,icon:"#8d4731"};
BDEF[BLOCK.BEDROCK].tex=226;
const CROP_DEFS=QuimiCraftFrontier.crops(BLOCK);
const CROP_BLOCKS=new Map(CROP_DEFS.flatMap(crop=>[crop.wild,...crop.stages].map(id=>[id,crop])));
const PLANTING_ITEMS=new Map(CROP_DEFS.map(crop=>[crop.seed,crop]));
const translucentBlocks=QuimiCraftSurfaceArt.configure(BLOCK,BDEF);
const windPermeableLeaves=new Set(Object.entries(BLOCK)
  .filter(([name])=>/(?:^|_)(?:LEAF|LEAVES)$/.test(name)).map(([,id])=>id));
const ITEM_COLORS={bolt:"#cbb08d",...Object.fromEntries(Object.entries(BDEF).map(([k,v])=>[k,v.icon||"#777"])),stick:"#94704a",wind_staff:"#63dce7",bow:"#b4814c",iron_sword:"#cdd7dc",arrow:"#ded8bd",hydrogen:"#bfe8ff",oxygen:"#83b9e8",water:"#4caed0",copper_ingot:"#c77b50",sulfur:"#d9cf3e",acid:"#9ddb62",indicator:"#bc77d8",fertilizer:"#8d6946",glow_solution:"#55e6c0",copper_sulfate:"#397ddd",lab_note:"#e9eee7",acid_gel:"#74d856",chitin:"#b98248",wind_essence:"#8cecf5",crystal_shard:"#a889ef",copper_core:"#d38152",bronze_ingot:"#c98542",voltaic_cell:"#d7c858",ceramic_plate:"#dcaa8c",feather:"#e8e2d2",hide:"#9f6848",gold_nugget:"#edca58",antidote:"#9ee78b",armor_plate:"#b79567",storm_focus:"#67e3ef",carbon_dioxide:"#d9e5e5",quicklime:"#e9dfbf",slaked_lime:"#eef2e5",alkali:"#b7d8eb",neutral_salt:"#e8e6dc",rust_pigment:"#a9583c",ammonia:"#a2dce8",tetraammine:"#315bc8",ethanol:"#d7eef1",plant_oil:"#d5bd5b",soap:"#e4d6b8",ph_kit:"#c46ed1",nitrate_mix:"#d8d3b8",bread:"#c88a4b",berries:"#bb405c",honey:"#dda83f",cheese:"#e7c96b",shield:"#86939a",chainmail:"#aeb9bf",liquid_nitrogen:"#a8e9f4",lucky_charm:"#e1bd62",prism_pendant:"#9c80df",lab_glassware:"#b8edf2",carbon_rod:"#343a3d",carbon_filter:"#48545a",distillation_flask:"#9fe2ea",spectrometer_lens:"#70d5e8",catalyst:"#d5a757",protective_goggles:"#78d7df",sample_case:"#d4b56a",sodium_chloride:"#f4f6ef",chlorine:"#a6db55",sodium_hydroxide:"#d9eef3",hydrochloric_acid:"#dbe9ef",hydrogen_peroxide:"#c8ecf7",activated_carbon:"#252b2e",purified_water:"#6dcce7",copper_oxide:"#2b2420",silver_dust:"#d5d9dc",silver_nitrate:"#eef1f4",silver_chloride:"#f3f0df",sodium_nitrate:"#ebe7dc",chromatography_strip:"#d5b4da",pure_ethanol:"#d9f0f1",carbonate_solution:"#b9d7dc",copper_crystal:"#3b83e6",spectral_data:"#73f1ce",plated_iron:"#d18c61",carbon_badge:"#63d6c8",periodic_key:"#d9c86a",cup:"#b9e8ef",water_cup:"#55bce1",bucket:"#aeb9bf",water_bucket:"#438fc1",lava_bucket:"#ef6b24",raw_venison:"#9d4240",cooked_venison:"#7c3229",raw_pork:"#e58a93",cooked_pork:"#a95b43",raw_beef:"#b7443e",cooked_beef:"#73352d",raw_rabbit:"#d49187",cooked_rabbit:"#a7654e",raw_chicken:"#e8b8a1",cooked_chicken:"#b8794c",raw_mutton:"#c86f72",cooked_mutton:"#8c4840",wool:"#e9e3d4",iron_helmet:"#9aa8ae",iron_chestplate:"#87969d",iron_leggings:"#7f8e95",iron_boots:"#76858c",lab_coat:"#e7f0ee",respirator_mask:"#5b7175",rubber_boots:"#d7bd42",oxygen_tank:"#6fa6b1",chitin_armor:"#9d7048"};

Object.assign(ITEM_COLORS,window.QuimiCraftScience?.itemColors||{},Object.fromEntries(Object.entries({...QuimiCraftFrontier.items,...QuimiCraftWorkshops.itemData,...QuimiCraftAlchemy.itemData,...QuimiCraftVehicles.itemData}).map(([id,entry])=>[id,entry[1]])));


const WORLD_SEED=(()=>{let s=Number(localStorage.qc_world_seed);if(!Number.isFinite(s)||s<1){s=Math.floor(100000+Math.random()*899999999);localStorage.qc_world_seed=String(s)}return s})();
const wildFruitAt=QuimiCraftFrontier.wildFruitPicker(BLOCK,hash,WORLD_SEED);

function textureAtlas(){
  const S=32,COLS=8,ROWS=32,c=document.createElement("canvas");c.width=S*COLS;c.height=S*ROWS;const x=c.getContext("2d"),img=x.createImageData(c.width,c.height);
  const palette=[
    [[74,137,59],[99,164,67],[49,111,48]],[[80,137,58],[101,161,69],[50,103,43]],[[117,77,48],[151,99,59],[88,57,40]],[[105,111,111],[145,147,143],[75,82,83]],
    [[207,185,116],[231,213,148],[176,150,92]],[[126,88,53],[166,119,71],[92,62,40]],[[130,91,54],[178,127,72],[89,59,36]],[[52,108,46],[77,137,61],[31,79,36]],
    [[218,230,231],[249,252,250],[175,198,205]],[[76,80,79],[124,128,124],[27,31,31]],[[118,111,104],[158,143,128],[95,74,59]],[[48,121,57],[72,153,71],[29,91,43]],
    [[59,141,64],[86,166,78],[34,105,48]],[[153,103,58],[190,137,77],[111,71,43]],[[174,116,55],[239,173,73],[96,62,35]],[[132,83,43],[178,118,59],[91,54,31]],
    [[43,47,46],[66,70,67],[25,28,28]],[[65,132,48],[98,165,67],[38,101,39]],[[215,96,133],[246,153,176],[82,137,54]],
    [[39,105,106],[73,149,143],[27,67,73]],[[120,93,81],[193,112,65],[75,67,65]],[[183,172,49],[238,221,76],[121,111,37]],[[112,176,187],[183,229,235],[64,112,126]],[[63,181,136],[113,247,186],[29,93,76]],
    [[84,65,51],[111,88,68],[55,43,36]],[[151,109,91],[184,139,117],[122,83,73]],[[52,57,61],[79,84,87],[29,33,37]],[[37,31,51],[75,55,96],[20,18,29]],[[112,103,78],[232,190,62],[75,74,69]],[[142,151,152],[205,214,211],[91,102,106]],[[112,126,117],[169,185,172],[74,84,80]],[[93,66,137],[179,126,232],[52,42,82]],
    [[126,185,202],[209,245,251],[70,131,157]],[[62,103,53],[94,139,68],[36,72,39]],[[172,87,51],[207,120,68],[125,59,40]],[[230,74,18],[255,185,38],[132,24,14]],[[82,67,48],[115,91,60],[51,43,35]],[[35,82,56],[61,118,72],[20,58,40]],[[133,111,54],[176,145,69],[91,75,40]],[[204,202,193],[243,241,232],[151,153,151]],
    [[43,49,56],[69,75,82],[23,27,32]],[[87,81,77],[117,110,104],[51,48,47]],[[173,139,57],[242,204,92],[104,84,41]],[[53,119,113],[82,158,147],[31,77,77]],[[185,119,82],[225,157,113],[137,82,63]],[[159,93,46],[207,137,64],[107,66,39]],
    [[61,123,50],[91,161,66],[34,91,39]],[[189,49,62],[235,89,101],[71,125,51]],[[73,105,188],[112,145,232],[61,119,56]],[[224,232,232],[255,255,252],[72,128,65]],[[126,77,82],[177,111,117],[88,51,57]],[[184,108,139],[229,153,181],[55,105,52]],
    [[189,184,163],[225,219,195],[137,134,122]],[[66,77,84],[91,105,113],[41,49,56]],[[117,78,158],[182,132,222],[64,50,94]],[[203,199,180],[244,241,225],[141,136,120]],[[91,117,119],[151,181,185],[57,78,82]],[[63,52,43],[93,76,58],[35,30,28]],
    [[91,139,55],[142,183,79],[52,100,41]],[[126,91,52],[176,130,75],[82,58,39]],[[42,111,58],[75,154,78],[25,76,43]],[[145,82,64],[190,112,84],[101,57,47]],
    [[84,87,88],[132,137,138],[38,41,42]],[[235,108,18],[255,201,65],[180,39,5]]
  ];
  const lastTile=Math.max(63,...Object.values(BDEF).flatMap(def=>def.tex??[]));
  for(let id=0;id<=lastTile;id++)for(let py=0;py<S;py++)for(let px=0;px<S;px++){
    const [base,hi,lo]=palette[id]||palette[3],h=hash(px+id*37,py+id*11),grain=(hash(px*7,py*13,id)-.5)*24;let col=h>.88?hi:h<.12?lo:base;let r=col[0]+grain,g=col[1]+grain,b=col[2]+grain,a=255;
    if(id===0){const blade=hash(px*3,py*5,id);g+=blade>.76?18:0;r-=blade>.76?8:0}
    if(id===1&&py>10+(Math.sin(px*1.7)+1)*3){col=palette[2][0];r=col[0]+grain;g=col[1]+grain;b=col[2]+grain;if(hash(px,py,81)>.82){g+=20;r-=10}}
    if(id===3&&hash(Math.floor(px/4),Math.floor(py/4),id)>.73){r-=18;g-=18;b-=16}
    if(id===4&&hash(px,py,id)>.84){r+=20;g+=16;b+=7}
    if(id===5||id===6){const ring=Math.abs(Math.sin((id===5?px:Math.hypot(px-16,py-16))*.45));r+=ring*18;g+=ring*10;b+=ring*5;if(id===6&&Math.abs(Math.hypot(px-16,py-16)-9)<1.2){r-=35;g-=25;b-=12}}
    if(id===7&&hash(px,py,id)>.79)a=0;
    if(id===8&&hash(px,py,id)>.72){r+=12;g+=14;b+=16}
    if(id===9&&hash(Math.floor(px/3),Math.floor(py/3),id)>.7){r-=55;g-=56;b-=55}
    if(id===10&&hash(Math.floor(px/3),Math.floor(py/3),id)>.7){r+=54;g+=25;b+=7}
    if(id===11||id===12){if(px%9===0){r+=26;g+=24;b+=10}if(id===12&&py<4){r+=25;g+=19}}
    if(id===13){if(py%8===0){r-=25;g-=18;b-=10}if(px%16===0){r+=10;g+=5}}
    if(id===14){const flame=Math.hypot(px-16,(py-10)*.75);if(flame<5){r=255;g=160+Math.random()*70;b=45;a=255}else if(Math.abs(px-16)<2&&py>12){r=102;g=67;b=40}else a=0}
    if(id===15){if(px%15===0||py%15===0){r-=26;g-=20;b-=10}if(Math.hypot(px-25,py-16)<2){r=210;g=160;b=67}}
    if(id===17){a=(Math.abs(px-16-(py-28)*.18)<1.5||Math.abs(px-12+(py-26)*.28)<1.2||Math.abs(px-20-(py-24)*.3)<1.2)&&py>5?255:0}
    if(id===63){const shape=12+Math.sin(px*.58+py*.29)*3+(Math.abs(px-16)*.62);a=py>shape?255:0;const hot=clamp((py-10)/22,0,1);r=255;g=clamp(220-hot*160+(hash(px,py,712)-.5)*35,25,255);b=clamp(65-hot*62,0,255)}
    if(id===18){const flower=Math.hypot(px-16,py-8)<5,stem=Math.abs(px-16)<1.5&&py>8;a=flower||stem?255:0;if(flower){r=225+grain;g=94+grain*.4;b=140+grain*.5}else{r=65;g=139;b=58}}
    if(id===19){if(px%8===0||py%8===0){r+=30;g+=35;b+=32}if(py>19){r-=28;g-=20;b-=17}}
    if(id===20&&hash(Math.floor(px/3),Math.floor(py/3),id)>.68){r+=70;g+=22;b-=8}
    if(id===21){const crystal=Math.abs(Math.sin(px*.42+py*.28));if(crystal>.82){r+=40;g+=37;b-=18}}
    if(id===22){const frame=px<2||py<2||px>29||py>29;a=frame?235:hash(px,py,id)>.88?45:125;if(!frame){r+=35;g+=50;b+=55}}
    if(id===23){const glow=Math.hypot(px-16,py-16);a=glow<13?255:0;r+=glow<7?85:20;g+=glow<10?70:15;b+=glow<8?50:5}
    if(id===24&&hash(px,py,id)>.82){r+=18;g+=13;b+=8}
    if(id===25&&py%7===0){r+=13;g+=8;b+=5}
    if(id===26&&Math.abs(Math.sin(px*.5+py*.23))>.92){r+=26;g+=28;b+=30}
    if(id===27&&hash(Math.floor(px/3),Math.floor(py/3),id)>.8){r+=38;g+=19;b+=55}
    if(id>=28&&id<=30&&hash(Math.floor(px/3),Math.floor(py/3),id)>.72){r+=id===28?92:40;g+=id===28?72:44;b+=id===28?5:46}
    if(id===31){const facet=Math.abs(Math.sin(px*.33+py*.51));if(facet>.72){r+=55;g+=38;b+=66}}
    if(id===32){a=185;if(Math.abs(Math.sin(px*.18+py*.31))>.92){r+=55;g+=58;b+=62;a=235}}
    if(id===33&&hash(px*2,py*3,id)>.72){g+=27;r-=9}
    if(id===34&&hash(px,py,id)>.82){r+=24;g+=10;b-=3}
    if(id===35){const flow=Math.sin(px*.27+Math.sin(py*.22)*2.1);if(flow>.25){r+=28;g+=54;b-=12}else{r-=38;g-=20}}
    if(id===36){if(px%7===0){r+=24;g+=17;b+=8}if(py%11===0){r-=18;g-=12;b-=6}}
    if((id===37||id===38)&&hash(px,py,id)>.78)a=0;
    if(id===39&&Math.abs(Math.sin(px*.24+py*.11))>.94){r-=49;g-=46;b-=42}
    if(id===40&&hash(Math.floor(px/3),Math.floor(py/3),id)>.72){r-=17;g-=14;b-=8}
    if(id===41&&hash(px,py,id)>.78){r+=18;g+=15;b+=14}
    if(id===42&&hash(Math.floor(px/4),Math.floor(py/4),id)>.7){r+=41;g+=38;b+=12}
    if(id===43&&(px%8===0||py%8===0)){r-=34;g-=24;b-=19}
    if(id===44&&Math.abs(Math.sin(px*.16+py*.08))>.95){r+=28;g+=19;b+=12}
    if(id===45&&hash(Math.floor(px/3),Math.floor(py/3),id)>.76){r+=40;g+=25;b+=8}
    if(id===46){const blade=Math.abs(px-16-(py-30)*Math.sin(px*.37)*.3)<1.4||Math.abs(px-10+(py-28)*.18)<1.2||Math.abs(px-22-(py-27)*.2)<1.2;a=blade&&py>5?255:0}
    if(id>=47&&id<=49){const stem=Math.abs(px-16)<1.35&&py>10,petal=Math.hypot(px-16,py-8)<4.8||Math.hypot(px-12,py-10)<3.2||Math.hypot(px-20,py-10)<3.2;a=stem||petal?255:0;if(stem&&!petal){r=61;g=128;b=55}}
    if(id===50){const ring=Math.abs(Math.sin(Math.hypot(px-16,py-16)*.48));r+=ring*24;g+=ring*11;b+=ring*14}
    if(id===51&&hash(px,py,id)>.76)a=0;
    if(id===52&&Math.abs(Math.sin(px*.19+py*.13))>.94){r-=35;g-=34;b-=29}
    if(id===53&&py%6===0){r+=18;g+=20;b+=22}
    if(id===54){const facet=Math.abs(Math.sin(px*.36+py*.49));if(facet>.7){r+=58;g+=43;b+=70}}
    if(id===55&&hash(Math.floor(px/3),Math.floor(py/3),id)>.72){r+=34;g+=35;b+=38}
    if(id===56&&hash(px,py,id)>.76){r+=45;g+=50;b+=52}
    if(id===57&&hash(px,py,id)>.7){r-=20;g-=17;b-=12}
    if(id===58){if(px%8===0){r+=35;g+=31;b+=8}if(py%11===0){r-=18;g-=13;b-=5}}
    if(id===59&&Math.abs(Math.sin(px*.42+py*.08))>.9){r+=27;g+=18;b+=8}
    if(id===60){const vein=Math.abs(px-16-(py-16)*.75)<3||Math.abs(px-16+(py-16)*.75)<3;a=vein?255:(hash(px,py,id)>.89?255:0)}
    if(id===61){if(py%9<2||((Math.floor(py/9)%2?px+5:px)%14)<2){r-=37;g-=30;b-=24}}
    if(id===62){const seam=px%8<1||py%8<1,mouth=px>7&&px<25&&py>12&&py<26,ember=mouth&&hash(px,py,620)>.72;if(seam){r-=25;g-=24;b-=23}if(mouth){r=ember?205:28;g=ember?82:30;b=ember?30:31}}
    const updatedSurface=QuimiCraftSurfaceArt.paint(id,px,py,hash);
    const mineralTile=id>=176&&id<=191||id>=204&&id<=206;
    if(updatedSurface)[r,g,b,a]=updatedSurface;
    else if(mineralTile)[r,g,b,a]=QuimiCraftDepths.paint(id,px,py,hash);
    else if(id>=192&&id<=203||id>=207&&id<=209)[r,g,b,a]=QuimiCraftBlockModels.paint(id,px,py,hash);
    else if(id>QuimiCraftHabitats.firstBlock)[r,g,b,a]=QuimiCraftHabitats.paint(id,px,py,hash);
    else if(id>BLOCK.ALCHEMY_BORDER)[r,g,b,a]=QuimiCraftAlchemyWorld.paint(id,px,py,hash);
    else if(id>=96)[r,g,b,a]=QuimiCraftRegions.paint(id,px,py,hash);
    else if(id>=64)[r,g,b,a]=QuimiCraftFrontier.paint(id,px,py,hash);
    const gx=(id%COLS)*S+px,gy=Math.floor(id/COLS)*S+py,o=(gy*c.width+gx)*4;img.data[o]=clamp(r,0,255);img.data[o+1]=clamp(g,0,255);img.data[o+2]=clamp(b,0,255);img.data[o+3]=a;
  }
  x.putImageData(img,0,0);const tex=new THREE.CanvasTexture(c);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestMipMapLinearFilter;tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;tex.encoding=THREE.sRGBEncoding;tex.generateMipmaps=true;return {texture:tex,canvas:c,cols:COLS,rows:ROWS,size:S};
}
const atlas=textureAtlas();
const blockIconCache=new Map();
function blockIconSource(id){
  if(typeof id!=="number"||BDEF[id]?.tex===undefined)return "";
  if(blockIconCache.has(id))return blockIconCache.get(id);
  const c=document.createElement("canvas");c.width=c.height=64;const ctx=c.getContext("2d");ctx.imageSmoothingEnabled=false;
  const S=atlas.size;
  let waterTile;
  if(id===BLOCK.WATER){
    waterTile=document.createElement("canvas");waterTile.width=waterTile.height=S;
    const paint=waterTile.getContext("2d"),colors=["#4ea9dc","#5fbde9","#68c8ef","#91dcf6"];
    for(let y=0;y<S;y+=2)for(let x=0;x<S;x+=2){
      const band=hash(Math.floor((x+Math.floor(y/2)*3)/6),Math.floor(y/2),491);
      paint.fillStyle=colors[Math.min(3,Math.floor(band*4))];
      paint.fillRect(x,y,2,2);
    }
  }
  function face(tile,a,b,d,shade){
    if(tile===undefined)return;
    const sx=(tile%atlas.cols)*S,sy=Math.floor(tile/atlas.cols)*S;
    ctx.save();ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(b[0]+d[0]-a[0],b[1]+d[1]-a[1]);ctx.lineTo(...d);ctx.closePath();ctx.clip();
    ctx.transform((b[0]-a[0])/S,(b[1]-a[1])/S,(d[0]-a[0])/S,(d[1]-a[1])/S,a[0],a[1]);
    ctx.drawImage(waterTile??atlas.canvas,waterTile?0:sx,waterTile?0:sy,S,S,0,0,S,S);ctx.restore();
    if(shade){ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(b[0]+d[0]-a[0],b[1]+d[1]-a[1]);ctx.lineTo(...d);ctx.closePath();ctx.fillStyle=`rgba(0,0,0,${shade})`;ctx.fill()}
  }
  if(blockModels.icon(id,ctx)){
    const src=c.toDataURL("image/png");blockIconCache.set(id,src);return src;
  }
  if(BDEF[id].plant||id===BLOCK.TORCH||id===BLOCK.SPECTRAL||BDEF[id].partial){
    const tile=texFor(id,0),w=BDEF[id].partial?24:38,h=BDEF[id].partial?48:42;
    ctx.drawImage(atlas.canvas,(tile%atlas.cols)*S,Math.floor(tile/atlas.cols)*S,S,S,(64-w)/2,(64-h)/2,w,h);
  }else{
    face(texFor(id,0),[8,17],[32,29],[8,43],.16);
    face(texFor(id,4),[32,29],[56,17],[32,55],.30);
    face(texFor(id,2),[8,17],[32,5],[32,29],0);
  }
  const src=c.toDataURL("image/png");blockIconCache.set(id,src);return src;
}
function itemIconMarkup(id){
  const source=typeof id==="number"&&BDEF[id]?.tex!==undefined?blockIconSource(id):produceIconSource(id)||playerModels.icon(id);
  if(source)return '<img class="block-preview" src="'+source+'" alt="" draggable="false">';
  return '<span class="voxel-icon" style="--icon:'+itemColor(id)+'"></span>';
}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8bc5e5);scene.fog=new THREE.Fog(0x8bc5e5,192,200.32);
const camera=new THREE.PerspectiveCamera(73,innerWidth/innerHeight,.07,520);camera.rotation.order="YXZ";
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance",alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;$("game").appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xbbe0ff,0x3a422c,.65);scene.add(hemi);
const sunLight=new THREE.DirectionalLight(0xfff1cf,1.2);sunLight.castShadow=true;sunLight.shadow.mapSize.set(2048,2048);sunLight.shadow.camera.left=-55;sunLight.shadow.camera.right=55;sunLight.shadow.camera.top=55;sunLight.shadow.camera.bottom=-55;sunLight.shadow.camera.near=.1;sunLight.shadow.camera.far=150;sunLight.shadow.bias=-.00045;scene.add(sunLight,sunLight.target);

function radialFog(shader){
  const radial=THREE.ShaderChunk.fog_vertex.replace(/-\s*mvPosition\.z\b/,"length(mvPosition.xyz)");
  shader.vertexShader=shader.vertexShader.replace("#include <fog_vertex>",radial);
}
const terrainMat=new THREE.MeshLambertMaterial({map:atlas.texture,vertexColors:true,alphaTest:.38,transparent:false,opacity:1,depthWrite:true,depthTest:true,colorWrite:true,side:THREE.FrontSide});
const clearMat=new THREE.MeshLambertMaterial({
  map:atlas.texture,vertexColors:true,alphaTest:.022,transparent:true,depthWrite:false,side:THREE.FrontSide,
  emissive:0x0e2328,emissiveIntensity:.31
});
clearMat.onBeforeCompile=shader=>{
  radialFog(shader);
  const header="varying vec3 vPaneWorld; varying vec3 vPaneNormal;\n";
  shader.vertexShader=header+shader.vertexShader.replace("#include <worldpos_vertex>",
    "#include <worldpos_vertex>\nvPaneWorld=(modelMatrix*vec4(transformed,1.0)).xyz; vPaneNormal=normalize(mat3(modelMatrix)*objectNormal);");
  shader.fragmentShader=header+shader.fragmentShader.replace("#include <map_fragment>",
    "#include <map_fragment>\nfloat edge=pow(1.0-abs(dot(normalize(cameraPosition-vPaneWorld),normalize(vPaneNormal))),2.6);\n"+
    "float base=diffuseColor.a; diffuseColor.rgb+=vec3(.022,.045,.06)*edge; diffuseColor.a=base+(.91-base)*edge*.27;");
};
const blockGlowTime={value:0};
terrainMat.onBeforeCompile=shader=>{
  radialFog(shader);
  shader.uniforms.uBlockGlowTime=blockGlowTime;
  const modelsGlow=QuimiCraftBlockModels.glowTiles.map(tile=>{
    const x=(tile%atlas.cols).toFixed(1),y=Math.floor(tile/atlas.cols).toFixed(1);
    return "(surfaceTile.x=="+x+"&&surfaceTile.y=="+y+")";
  }).join("||");
  const tile=BDEF[BLOCK.GLOW_FUNGUS].tex;
  const tx=(tile%atlas.cols).toFixed(1),ty=Math.floor(tile/atlas.cols).toFixed(1);
  shader.fragmentShader="uniform float uBlockGlowTime;\n"+shader.fragmentShader.replace("#include <emissivemap_fragment>",
    "#include <emissivemap_fragment>\n#ifdef USE_MAP\n"+
    "vec2 fungusTile=vec2(vUv.x*"+atlas.cols+".0,(1.0-vUv.y)*"+atlas.rows+".0);\n"+
    "if(floor(fungusTile.x)=="+tx+"&&floor(fungusTile.y)=="+ty+"){\n"+
    "float glow=1.0-smoothstep(0.48,0.62,fract(fungusTile.y));\n"+
    "totalEmissiveRadiance+=diffuseColor.rgb*vec3(0.16,0.48,0.39)*glow;\n}\n"+
    "vec2 surfaceTile=floor(fungusTile);\n"+
    "if("+modelsGlow+"){\n"+
    "float pulse=0.91+0.12*sin(uBlockGlowTime*9.0+vUv.x*61.0)+0.065*sin(uBlockGlowTime*17.0+vUv.y*183.0);\n"+
    "totalEmissiveRadiance+=diffuseColor.rgb*pulse;\n}\n#endif");
};
let saveIssue = "";
const worldStorage = QuimiCraftWorldStorage.create({storage:localStorage, idb:globalThis.indexedDB, seed:WORLD_SEED, chunkSize:CHUNK, onError:reportSaveIssue});
const {mods, doors:doorMeta, fluids:fluidLevels} = worldStorage.maps;
const explorationSurvey=QuimiCraftExplorationMap.createSurvey();
const explorationWaypoints=QuimiCraftExplorationMap.createWaypoints(explorationSurvey);
const chunks=new Map(),pending=[];
let terrainVisibility=null;
let wantedChunks=new Set(),chunkPriorities=new Map(),queueChanged=false;
const editedColumnTops=new Map(),roofCache=new Map();
const key3=(x,y,z)=>`${x}|${y}|${z}`, ckey=(cx,cz)=>`${cx},${cz}`;

const VILLAGE=QuimiCraftFrontier.villageFor(localStorage);
const ecology=QuimiCraftRegions.resourcePlan(BLOCK,hash,WORLD_SEED);
const depths=QuimiCraftDepths.create({B:BLOCK,seed:WORLD_SEED,hash,level:WATER_LEVEL});
const wildlife=QuimiCraftWildlife.create(THREE),faunaModels=QuimiCraftFaunaModels.create(THREE),DRAGONS=QuimiCraftDragons.species;
const natureFolk=QuimiCraftMounts.trees,siteWardens=QuimiCraftMounts.wardens;
const bondedMounts=new Map(),defeatedSiteActors=new Set(),groveAlarm=new Map(),discoveredSites=new Set();
let riding=null,mountClock=0;
const placementsWithLight=new Map([
  [BLOCK.TORCH,{color:0xffab54,range:9,height:.71}],
  [BLOCK.SPECTRAL,{color:0x66ebc8,range:11,height:.47}],
  [BLOCK.MYCELIUM_LAMP,{color:0x7cedba,range:12,height:.41,steady:true}]
]);
const spawnLightPowers=new Uint8Array(Math.max(255,BLOCK.MYCELIUM_LAMP)+1);
for(const [name,power] of Object.entries(QuimiCraftMobSpawn.emitters)){
  if(Number.isInteger(BLOCK[name]))spawnLightPowers[BLOCK[name]]=power;
}
const variantSoils=new Set(QuimiCraftDepths.soils.map(key=>BLOCK[key]));
const variantSands=new Set(QuimiCraftDepths.sands.map(key=>BLOCK[key]));
const variantMinerals=new Set(QuimiCraftDepths.minerals.map(key=>BLOCK[key]));
for(const id of variantSoils)ecology.fertile.add(id);
for(const id of variantMinerals)ecology.ores.add(id);
const villages=QuimiCraftSettlements.create({B:BLOCK,seed:WORLD_SEED,hub:VILLAGE,biome:(x,z)=>biomeAt(x,z),hash});
function regionalWater(x,z){
  const biome=biomeAt(x,z);
  const local=habitats.water(habitats.at(x,z,biome))||QuimiCraftRegions.water(biome);
  if(local.id==="acid"||local.id==="thermal")return local;
  const lake=depths.lakeAt(x,z);
  if(!lake||terrainHeight(x,z)>=WATER_LEVEL)return local;
  const {basin}=lake;
  const kind=depths.waterKind(lake,biomeAt(basin.x,basin.z));
  return QuimiCraftDepths.marineProfiles[kind]||local;
}
const VILLAGE_SHOPS=[
  {role:"shop_food",name:"Dona Canela",shop:"food",label:"Mercearia da Colheita"},
  {role:"shop_armor",name:"Ferreiro Cobalto",shop:"armor",label:"Forja Cobalto"},
  {role:"shop_solid",name:"Dra. Sílica",shop:"solid",label:"Reagentes Sólidos"},
  {role:"shop_liquid",name:"Mestre Solvente",shop:"liquid",label:"Reagentes Líquidos"},
  {role:"shop_trinket",name:"Luma Prismática",shop:"trinket",label:"Berloques Prismáticos"}
];
const LEGACY_VILLAGE_BUILDINGS=[];if(VILLAGE.version!==3)for(let gz=-2;gz<=2;gz++)for(let gx=-2;gx<=2;gx++){const shop=gz===0?VILLAGE_SHOPS[gx+2]:null;LEGACY_VILLAGE_BUILDINGS.push({gx,gz,x:VILLAGE.x+gx*VILLAGE.spacing,z:VILLAGE.z+gz*VILLAGE.spacing,kind:shop?"shop":"house",shop,variant:Math.floor(hash(gx+19,gz-37,WORLD_SEED%997)*4)})}
const positiveMod=(n,m)=>((n%m)+m)%m;
function villageCell(x,z){const gx=Math.round((x-VILLAGE.x)/VILLAGE.spacing),gz=Math.round((z-VILLAGE.z)/VILLAGE.spacing);if(Math.abs(gx)>2||Math.abs(gz)>2)return null;const cx=VILLAGE.x+gx*VILLAGE.spacing,cz=VILLAGE.z+gz*VILLAGE.spacing;if(Math.abs(x-cx)>4||Math.abs(z-cz)>4)return null;return LEGACY_VILLAGE_BUILDINGS[(gz+2)*5+gx+2]}
function legacyVillageArea(x,z,margin=0){return VILLAGE.version!==3&&Math.abs(x-VILLAGE.x)<=27+margin&&Math.abs(z-VILLAGE.z)<=27+margin}
function inVillage(x,z,margin=0){return legacyVillageArea(x,z,margin)||!!villages.near(x,z,margin)}
function villageFootprint(x,z,pad=1){return legacyVillageArea(x,z,pad)||villages.occupied(x,z,pad)}
function worldDoorMeta(x,y,z){return doorMeta.get(key3(x,y,z))||villages.doorAt(x,y,z)||(alchemyWorldReady?alchemyWorld.doorAt(x,y,z):null)}
function villageGround(x,z){if(!legacyVillageArea(x,z))return 0;const rx=Math.abs(positiveMod(Math.floor(x-VILLAGE.x),VILLAGE.spacing)-5),rz=Math.abs(positiveMod(Math.floor(z-VILLAGE.z),VILLAGE.spacing)-5);return rx<1.55||rz<1.55||Math.hypot(x-(VILLAGE.x),z-(VILLAGE.z+5))<4.2?BLOCK.VILLAGE_BRICK:BLOCK.GRASS}
function villageBlock(x,y,z){const local=villages.blockAt(x,y,z);if(local!==BLOCK.AIR)return local;if(!legacyVillageArea(x,z))return BLOCK.AIR;const b=villageCell(x,z);if(!b)return BLOCK.AIR;const dx=x-b.x,dz=z-b.z,ly=y-VILLAGE.base,edge=Math.abs(dx)===3||Math.abs(dz)===3,front=dz===-3,door=front&&dx===0,window=ly===2&&((Math.abs(dx)===3&&Math.abs(dz)<=1)||(Math.abs(dz)===3&&Math.abs(dx)===2));if(ly===0&&Math.abs(dx)<=3&&Math.abs(dz)<=3)return b.kind==="shop"?BLOCK.VILLAGE_BRICK:BLOCK.PLANK;if(ly>=1&&ly<=3&&edge){if(door&&ly<=2)return BLOCK.AIR;if(window)return BLOCK.GLASS;const shopWall={food:BLOCK.CHERRY_LOG,armor:BLOCK.SLATE,solid:BLOCK.ALCHEMY_BRICK,liquid:BLOCK.CERAMIC,trinket:BLOCK.MARBLE}[b.shop?.shop];return shopWall||[BLOCK.PLANK,BLOCK.CHERRY_LOG,BLOCK.LIMESTONE,BLOCK.VILLAGE_BRICK][b.variant]}
  if(ly===4&&Math.abs(dx)<=4&&Math.abs(dz)<=4)return b.kind==="shop"?({food:BLOCK.CHERRY_LEAVES,armor:BLOCK.SLATE,solid:BLOCK.ALCHEMY_BRICK,liquid:BLOCK.GLASS,trinket:BLOCK.AMETHYST}[b.shop.shop]):[BLOCK.VILLAGE_BRICK,BLOCK.CHERRY_LEAVES,BLOCK.SLATE,BLOCK.PLANK][b.variant];if(ly===5&&Math.abs(dx)<=2&&Math.abs(dz)<=2)return b.kind==="shop"?BLOCK.VILLAGE_BRICK:[BLOCK.VILLAGE_BRICK,BLOCK.CHERRY_LEAVES,BLOCK.SLATE,BLOCK.PLANK][b.variant];
  if(b.kind==="shop"&&ly===1&&dz===2&&Math.abs(dx)<=2)return b.shop.shop==="liquid"?BLOCK.GLASS:b.shop.shop==="solid"?BLOCK.LAB:BLOCK.PLANK;if(b.kind==="house"&&ly===1&&dx===2&&dz===2)return b.variant===2?BLOCK.CERAMIC:BLOCK.PLANK;if(ly>=1&&ly<=2&&dx===-2&&dz===2&&b.variant===0)return BLOCK.GLOWSTONE;return BLOCK.AIR}
const {noise, biomeAt, terrainHeight, remoteSiteAt, remoteStructureBlock}=QuimiCraftTerrain.create({
  WORLD_SEED, VILLAGE, BLOCK, MAX_Y, WATER_LEVEL, inVillage, ckey, hash, clamp, lerp, smooth, settleSurface:villages.surface,depths
});
const habitats=QuimiCraftHabitats.create({
  B:BLOCK,hash,noise,seed:WORLD_SEED,biomeAt,waterLevel:WATER_LEVEL,
  excluded:(x,z)=>labBoundsContains(x,z,LAB_PROTECTION_MARGIN+1)||inVillage(x,z,1)||!!remoteSiteAt(x,z)
});
const geology=QuimiCraftGeology.create({
  blocks:BLOCK,seed:WORLD_SEED,hash,noise,culture:QuimiCraftRegions.culture,region:ecology.region,habitats,
});
const expeditions=QuimiCraftExpeditions.create({
  B:BLOCK,seed:WORLD_SEED,terrain:terrainHeight,biome:biomeAt,cave:caveAt,dragons:QuimiCraftDragons.regional,water:WATER_LEVEL,maxY:MAX_Y,
  blocked:(x,z)=>labBoundsContains(x,z,LAB_PROTECTION_MARGIN+9)||inLabEntranceCorridor(x,z,5)||
    villageBoundsContains(x,z,8)||inLabVillagePath(x,z)||!!remoteSiteAt(x,z)||!!alchemyColumnAt(x,z)
});
for(const profile of Object.values(QuimiCraftHabitats.profiles))ecology.ores.add(BLOCK[profile.vein]);
for(const block of [BLOCK.AMBER_PEAT,BLOCK.GLOW_LOAM,BLOCK.GLACIAL_GRAVEL])ecology.fertile.add(block);

function labBoundsContains(x,z,pad=0){
  return x>=LAB_LAYOUT.cx-LAB_LAYOUT.halfW-pad&&x<=LAB_LAYOUT.cx+LAB_LAYOUT.halfW+pad&&z>=LAB_LAYOUT.cz-LAB_LAYOUT.halfD-pad&&z<=LAB_LAYOUT.cz+LAB_LAYOUT.halfD+pad
}
function villageBoundsContains(x,z,pad=0){
  if(villages.near(x,z,pad))return true;
  if(VILLAGE.version===3)return false;
  return x>=VILLAGE.x-16-pad&&x<=VILLAGE.x+16+pad&&z>=VILLAGE.z-18-pad&&z<=VILLAGE.z+10+pad
}
function findStandingY(x,z,guess=terrainHeight(x,z)+2){
  const ix=Math.floor(x),iz=Math.floor(z),start=Math.min(MAX_Y-3,Math.max(4,Math.floor(guess)+10));
  for(let y=start;y>=1;y--){
    const floor=getBlock(ix,y,iz),feet=getBlock(ix,y+1,iz),head=getBlock(ix,y+2,iz);
    if(BDEF[floor]?.solid&&!BDEF[feet]?.solid&&!BDEF[head]?.solid)return y+1
  }
  return terrainHeight(ix,iz)+1
}
function surfaceBlock(x,z,h=terrainHeight(x,z),b=biomeAt(x,z),habitat,lake=depths.lakeAt(x,z)){
  const site=remoteSiteAt(x,z);if(site&&Math.max(Math.abs(x-site.x),Math.abs(z-site.z))<=8)return [BLOCK.MARBLE,BLOCK.PLANK,BLOCK.ALCHEMY_BRICK][site.kind];
  const road=villageGround(x,z);if(road)return road;
  if(lake&&h<WATER_LEVEL&&WATER_LEVEL-h<=7&&lake.radius<.86){
    const {basin}=lake,kind=depths.waterKind(lake,biomeAt(basin.x,basin.z));
    if((kind==="marine"||kind==="subantarctic")&&noise.n2(x*.086+51,z*.086-72)>.13)return BLOCK.LIMESTONE;
  }
  const extra=depths.surface(b,x,z,h-WATER_LEVEL,lake);
  if(extra)return extra;
  const regional=habitats.surface(habitat===undefined?habitats.at(x,z,b):habitat,x,z,h)||ecology.surface(b,x,z,h-WATER_LEVEL);
  if(regional)return regional;
  if(h<=WATER_LEVEL+1)return b==="termas minerais"||b==="salinas"&&hash(x,z,83)>.68?BLOCK.SILICA_SAND:b==="manguezal"||b==="delta salobro"?BLOCK.MUD:b==="fiordes glaciais"?BLOCK.ICE:b==="pântano"?BLOCK.PEAT:b==="badlands"?BLOCK.RED_SAND:b==="salinas"?BLOCK.SALT:b==="tundra"||b==="taiga"?BLOCK.FROSTED_SOIL:BLOCK.SAND;if(b==="manguezal"||b==="delta salobro")return h<=WATER_LEVEL+2?BLOCK.MUD:BLOCK.PEAT;
   if(b==="termas minerais")return h<=WATER_LEVEL+4?BLOCK.SILICA_SAND:hash(x,z,557)>.5?BLOCK.FIELDSTONE:BLOCK.GRASS;
   if(b==="chapadas ocres")return hash(x,z,571)>.25?BLOCK.OCHRE_STONE:BLOCK.RED_SAND;
   if(b==="fiordes glaciais")return h>24?BLOCK.SNOW:h<=WATER_LEVEL+2?BLOCK.ICE:BLOCK.SLATE;
   if(b==="caldeira vítrea")return hash(x,z,573)>.37?BLOCK.BASALT_GLASS:BLOCK.BASALT;
   if(b==="deserto")return BLOCK.SAND;if(b==="salinas")return hash(x,z,808)>.24?BLOCK.SALT:BLOCK.LIMESTONE;if(b==="badlands")return BLOCK.RED_SAND;if(b==="cânion calcário")return hash(x,z,124)>.35?BLOCK.LIMESTONE:BLOCK.RED_SAND;if(b==="pântano")return hash(x,z,121)>.45?BLOCK.MOSS:BLOCK.PEAT;if(b==="vulcânico")return hash(x,z,122)>.68?BLOCK.BASALT:BLOCK.ASH;if(b==="bosque de cristais"&&hash(x,z,123)>.82)return hash(x,z,125)>.6?BLOCK.AMETHYST:BLOCK.MARBLE;if(b==="tundra")return hash(x,z,126)>.22?BLOCK.SNOW:BLOCK.FROSTED_SOIL;if(h>35||b==="taiga"&&h>24||b==="prado alpino"&&h>30)return BLOCK.SNOW;if(h>29)return b==="cânion calcário"?BLOCK.LIMESTONE:b==="montanha"||b==="prado alpino"?BLOCK.SLATE:BLOCK.STONE;return BLOCK.GRASS;
}
function caveAt(x,y,z,h){
  if(y<3||y>h-3||h-y>26)return false;const worm=Math.abs(noise.n3(x*.052,y*.068,z*.052)+noise.n3(x*.024+80,y*.035,z*.024-40)*.42);return worm<.105;
}
function naturalBlock(x,y,z,h,b,surface,habitat=null,lake=null){
  if(y<0||y>=MAX_Y)return BLOCK.AIR;
  if(y>h){
    if(y===WATER_LEVEL&&h<WATER_LEVEL){
      if(["taiga","tundra","fiordes glaciais"].includes(b)&&(!lake||lake.radius>.74)&&hash(x,z,707)>.12)return BLOCK.ICE;
      if(lake&&lake.radius>=.24&&lake.radius<.78){
        const {basin}=lake;
        const kind=depths.waterKind(lake,biomeAt(basin.x,basin.z)),zone=depths.polarZone(lake,kind);
        const floe=noise.n2(x*.126+617,z*.126-394);
        if((zone==="pack_edge"&&floe>.29)||(zone==="ice_channels"&&floe>-.02)||
          (kind==="arctic"&&lake.radius>.34&&floe>.035))return BLOCK.ICE;
      }
    }
    return BLOCK.AIR;
  }
  if(y===0)return BLOCK.BEDROCK;
  const hotCave=y<=6&&noise.n2(x*.047+17,z*.047-31)>.14;
  if(caveAt(x,y,z,h))return hotCave&&y<=5?BLOCK.LAVA:BLOCK.AIR;
  const vent=y>=h-2&&b==="vulcânico"&&noise.n2(x*.061+720,z*.061-480)>.36;
  if(vent)return y===h?BLOCK.LAVA:BLOCK.MAGMA_ROCK;
  if(y>=h-2){
    const top=surface??surfaceBlock(x,z,h,b,habitat,lake);
    if(y===h){
      if((top===BLOCK.SAND||top===BLOCK.RED_SAND)&&h<=WATER_LEVEL+2&&hash(x,z,221)>.94)return BLOCK.SALT;
      if(b==="pântano"&&hash(x,z,222)>.84)return BLOCK.CLAY;
      return top;
    }
    if(ecology.fertile.has(top)||variantSands.has(top))return top;
    if([BLOCK.SAND,BLOCK.RED_SAND,BLOCK.MUD,BLOCK.CLAY,BLOCK.SALT,BLOCK.PEAT,BLOCK.FROSTED_SOIL,BLOCK.SILICA_SAND,BLOCK.LIMESTONE].includes(top))return top;
    if([BLOCK.BASALT,BLOCK.SCORIA,BLOCK.BASALT_GLASS,BLOCK.PUMICE].includes(top))return BLOCK.BASALT;
    return top===BLOCK.SNOW?BLOCK.FROSTED_SOIL:BLOCK.DIRT;
  }
  if(y===1||y===2&&hash(x,y,z)>.45)return BLOCK.BEDROCK;
  if(hotCave&&caveAt(x,y+1,z,h)&&y<5)return BLOCK.MAGMA_ROCK;
  const ore=y<=h-4?geology.ore(x,y,z,b,habitat):0;
  return ore||geology.rock(x,y,z,h,b);
}
function canGrowVegetation(x,z){
  return !villageFootprint(x,z,1)&&!labBoundsContains(x,z,LAB_PROTECTION_MARGIN)&&!inLabVillagePath(x,z)&&!remoteSiteAt(x,z);
}
function treeCandidates(x,z,veg,y=null){
  const trees=[];
  if(!(veg>0))return trees;
  const bx=x-positiveMod(x-1,5),bz=z-positiveMod(z-2,5);
  for(const tx of [bx,bx+5])for(const tz of [bz,bz+5]){if(Math.abs(tx-x)>4||Math.abs(tz-z)>4||villageFootprint(tx,tz,3)||labBoundsContains(tx,tz,LAB_PROTECTION_MARGIN+2))continue;const h=terrainHeight(tx,tz),b=biomeAt(tx,tz),seed=hash(tx>>1,tz>>1,41+WORLD_SEED%113),threshold=({floresta:.31,taiga:.37,tundra:.68,pântano:.5,savana:.57,"bosque de cerejeiras":.35,"selva tropical":.22,"prado alpino":.76,"planície florida":.82,planície:.89,"floresta de sequoias":.19,"manguezal":.32,"campina de aurora":.72,"fiordes glaciais":.8,"bosque lilás":.24,"delta salobro":.58,"termas minerais":.79}[b]??2)+(veg===1?.17:0);
    if(h<WATER_LEVEL||seed<threshold||(y!==null&&(y<=h||y>h+17)))continue;
    const soil=surfaceBlock(tx,tz,h,b);
    if(!ecology.fertile.has(soil)&&![BLOCK.GRASS,BLOCK.MOSS,BLOCK.FROSTED_SOIL,BLOCK.PEAT,BLOCK.MUD].includes(soil))continue;
    const giant=b==="floresta de sequoias",mangrove=b==="manguezal"||b==="delta salobro",pine=b==="taiga"||b==="tundra"||giant,dry=b==="savana",cherry=b==="bosque de cerejeiras",tropical=b==="selva tropical",birch=b==="floresta"&&seed>.59||b==="campina de aurora",jacaranda=b==="bosque lilás"||cherry&&seed>.83,palm=tropical&&hash(tx,tz,819)>.48,tall=(giant?11:mangrove?5:pine?7:palm?8:tropical?6:4)+Math.floor(hash(tx,tz,51)*(pine||palm?4:3)),trunk=giant?BLOCK.REDWOOD_LOG:mangrove?BLOCK.MANGROVE_LOG:jacaranda?BLOCK.JACARANDA_LOG:birch?BLOCK.BIRCH_LOG:dry?BLOCK.ACACIA_LOG:cherry?BLOCK.CHERRY_LOG:palm?BLOCK.PALM_LOG:pine?BLOCK.PINE_LOG:BLOCK.WOOD,leaf=giant?BLOCK.REDWOOD_LEAF:mangrove?BLOCK.MANGROVE_LEAF:jacaranda?BLOCK.JACARANDA_LEAF:birch?BLOCK.BIRCH_LEAF:dry?BLOCK.ACACIA_LEAF:cherry?BLOCK.CHERRY_LEAVES:palm?BLOCK.PALM_LEAVES:pine?BLOCK.PINE_LEAVES:BLOCK.LEAVES;
    trees.push({dx:x-tx,dz:z-tz,h,tall,pine,palm,dry,tropical,trunk,leaf});
  }
  return trees;
}
function vegetationBlock(x,y,z,h,b,top,veg,trees,habitat=null){
  for(const tree of trees){
    if(y<=tree.h||y>tree.h+17)continue;
    const {dx,dz,tall,pine,palm,dry,tropical,trunk,leaf}=tree;
    const dy=y-(tree.h+tall);
    if(dx===0&&dz===0&&dy<=0)return trunk;
    if(pine){
      const radius=dy<=-4?2.6:dy<=-2?2.15:dy===-1?1.65:dy===0?1.1:.35;
      if(dy>=-5&&dy<=1&&Math.max(Math.abs(dx),Math.abs(dz))<=radius+hash(x,y,z)*.35&&!(dx===0&&dz===0&&dy<1))return leaf;
    }else if(palm){
      const spread=Math.max(Math.abs(dx),Math.abs(dz)),side=Math.min(Math.abs(dx),Math.abs(dz));
      if((spread===0&&dy===1)||(spread>=1&&spread<=4&&side<=1&&dy===(spread>=3?-1:0)))return leaf;
    }else{
      const radius=dry?(dy===0?3.15:2.45):tropical?(dy<=-2?2.8:dy===0?3.2:2.1):(dy<=-2?2.15:dy===0?2.65:1.75);
      if(dy>=-2&&dy<=1&&Math.hypot(dx,dz)<=radius+.2*hash(x,y,z)&&!(dx===0&&dz===0&&dy<1))return leaf;
    }
  }
  const growsOnLand=veg>0&&h>=WATER_LEVEL;
  const bambooColumn=growsOnLand&&b==="selva tropical"&&positiveMod(x,4)===1&&positiveMod(z,4)===2&&hash(x,z,911)>.48;
  if(growsOnLand&&y===h+1){
    const fruit=bambooColumn?0:wildFruitAt(b,top,x,z,veg);
    if(fruit)return fruit;
    const regional=habitats.vegetation(habitat,x,z,h)||ecology.cover(b,x,z);
    if(regional)return regional;
    const chance=hash(x,z,763+WORLD_SEED%127);
    const specialties={"floresta de sequoias":[BLOCK.FERN,BLOCK.BLUE_MUSHROOM],manguezal:[BLOCK.REED,BLOCK.ORCHID],"bosque lilás":[BLOCK.LAVENDER,BLOCK.BERRY_BUSH],"delta salobro":[BLOCK.SALT_REED,BLOCK.REED],"termas minerais":[BLOCK.LICHEN,BLOCK.ORCHID],floresta:[BLOCK.FERN,BLOCK.BERRY_BUSH],
      "campina de aurora":[BLOCK.WILD_WHEAT,BLOCK.ORCHID],"chapadas ocres":[BLOCK.LICHEN,BLOCK.WHITE_FLOWER],
      "fiordes glaciais":[BLOCK.LICHEN,BLOCK.BLUE_MUSHROOM],"caldeira vítrea":[BLOCK.LICHEN,BLOCK.BLUE_MUSHROOM]};
    if(specialties[b]&&chance>.78)return specialties[b][chance>.92?1:0];
    if(["planície","planície florida","floresta","bosque de cerejeiras","prado alpino"].includes(b)&&[BLOCK.GRASS,BLOCK.MOSS].includes(top)&&chance>.911&&chance<=.947){
      return hash(x,z,765)>.49?BLOCK.WILD_BEET:BLOCK.WILD_POTATO;
    }
    if(["planície","planície florida","floresta","bosque de cerejeiras","prado alpino"].includes(b)&&[BLOCK.GRASS,BLOCK.MOSS,BLOCK.SNOW].includes(top)&&chance>.947){
      return [BLOCK.WILD_WHEAT,BLOCK.WILD_CARROT,BLOCK.WILD_BEAN][Math.floor(hash(x,z,764)*3)];
    }
    if((b==="selva tropical"||b==="pântano")&&chance>.91)return b==="pântano"?BLOCK.REED:BLOCK.FERN;
  }
  if(growsOnLand&&(b==="deserto"||b==="badlands"||b==="cânion calcário")&&y>h&&y<=h+3+Math.floor(hash(x,z,3)*2)&&positiveMod(x,7)===2&&positiveMod(z,7)===4&&hash(x,z,9)>.45+(veg===1?.2:0))return BLOCK.CACTUS;
  if(bambooColumn&&y>h&&y<=h+3+Math.floor(hash(x,z,912)*3))return BLOCK.BAMBOO;
  if(b==="bosque de cristais"&&positiveMod(x,8)===3&&positiveMod(z,8)===5&&y>h&&y<=h+2+Math.floor(hash(x,z,71)*5))return y===h+1&&hash(x,z,72)>.72?BLOCK.GLOWSTONE:BLOCK.CRYSTAL;
  if(b==="vulcânico"&&positiveMod(x,11)===6&&positiveMod(z,11)===3&&y>h&&y<=h+1+Math.floor(hash(x,z,73)*3))return BLOCK.BASALT;
  if(b==="badlands"){const rx=positiveMod(x,31),rz=positiveMod(z,31),pillar=(rx===5||rx===10)&&(rz===6||rz===11);if(pillar&&y>h&&y<=h+2+Math.floor(hash(rx,rz,74)*3))return y===h+1?BLOCK.ALCHEMY_BRICK:BLOCK.MARBLE;if(y===h+1&&rx>=5&&rx<=10&&rz>=6&&rz<=11&&(rx===5||rx===10||rz===6||rz===11)&&hash(x,z,75)>.45)return BLOCK.ALCHEMY_BRICK}
  if(growsOnLand&&y===h+1&&[BLOCK.GRASS,BLOCK.MOSS,BLOCK.PEAT,BLOCK.FROSTED_SOIL].includes(top)){const density=veg===1?.945:.86,q=hash(x,z,91+WORLD_SEED%67);if(q>density){if(b==="tundra"||b==="prado alpino")return q>.94?BLOCK.WHITE_FLOWER:BLOCK.TALL_GRASS;if(b==="bosque de cerejeiras"||b==="planície florida")return q>.955?BLOCK.POPPY:q>.91?BLOCK.BLUE_FLOWER:BLOCK.TALL_GRASS;if(b==="pântano")return q>.95?BLOCK.BLUE_FLOWER:BLOCK.TALL_GRASS;if(b==="selva tropical")return q>.965?BLOCK.POPPY:BLOCK.TALL_GRASS;return q>.965?BLOCK.POPPY:q>.935?BLOCK.WHITE_FLOWER:BLOCK.TALL_GRASS}}
  return BLOCK.AIR;
}
function recordColumnEdit(x,y,z,id){
  const column=x+","+z;
  if(id!==BLOCK.AIR)editedColumnTops.set(column,Math.max(y,editedColumnTops.get(column)??0));
  roofCache.delete(column);
}
function restoreEditedColumns(){
  editedColumnTops.clear();
  roofCache.clear();
  for(const [key,id] of mods){
    const [x,y,z]=key.split("|").map(Number);
    recordColumnEdit(x,y,z,id);
  }
}
function labSafe(x=player.pos.x,y=player.pos.y,z=player.pos.z){
  return QuimiCraftFrontier.safeInterior(LAB_LAYOUT,x,y,z);
}
function roofAt(x,z){
  x=Math.floor(x);z=Math.floor(z);
  const key=x+","+z;
  const cached=roofCache.get(key);
  if(cached!==undefined)return cached;
  const max=Math.max(columnGenerationTop(x,z,terrainHeight(x,z)),alchemyColumnAt(x,z)?.top??0,expeditions.column(x,z)?.top??0);
  const qualifies=id=>!!BDEF[id]?.solid&&(!BDEF[id].alpha||translucentBlocks.has(id));
  const top=QuimiCraftFrontier.roofScan(x,z,MAX_Y,max,getBlock,qualifies);
  if(roofCache.size>=4300)roofCache.clear();
  roofCache.set(key,top);
  return top;
}
function plantSunlit(x,y,z){
  const surface=roofAt(x,z);
  if(surface<=y+1)return true;
  for(let at=surface-1;at>y;at--){
    const id=getBlock(x,at,z);
    if(BDEF[id]?.solid&&!translucentBlocks.has(id))return false;
  }
  return true;
}
function getBlock(x,y,z){
  x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);
  const authored=laboratoryBlockAt(x,y,z);
  if(authored!==null)return authored;
  const edit=mods.get(key3(x,y,z));
  if(edit!==undefined)return edit;
  if(y>=0&&y<MAX_Y){
    const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),owner=chunks.get(ckey(cx,cz))?.vox;
    if(owner)return owner[voxelIndex(x-cx*CHUNK+1,y,z-cz*CHUNK+1)];
  }
  const office=alchemyColumnAt(x,z);
  if(office&&y>=office.low)return y<=office.top?office.blocks[y-office.low]:BLOCK.AIR;
  const villageBlockId=villageBlock(x,y,z);
  if(villageBlockId!==BLOCK.AIR)return villageBlockId;
  const landmark=inVillage(x,z)?BLOCK.AIR:remoteStructureBlock(x,y,z);
  if(landmark!==BLOCK.AIR)return landmark;
  const expedition=expeditions.column(x,z),generated=expedition?.blocks[y];
  if(generated!==undefined)return generated;
  const h=terrainHeight(x,z),b=biomeAt(x,z),habitat=habitats.at(x,z,b),lake=depths.lakeAt(x,z);
  const ruin=lake&&h<WATER_LEVEL&&!inVillage(x,z,5)&&!remoteSiteAt(x,z)?depths.ruinBlock(depths.ruinAt(lake,x,z),y):0;
  if(ruin)return ruin;
  const natural=naturalBlock(x,y,z,h,b,undefined,habitat,lake);
  if(natural!==BLOCK.AIR||y<=h)return natural;
  if(y<=WATER_LEVEL&&canFloodColumn(x,z,h))return BLOCK.WATER;
  if(expedition?.surface||!canGrowVegetation(x,z))return BLOCK.AIR;
  const veg=settings.vegetation??2;
  return vegetationBlock(x,y,z,h,b,surfaceBlock(x,z,h,b,habitat),veg,treeCandidates(x,z,veg,y),habitat);
}
function canFloodColumn(x,z,h){
  return h<WATER_LEVEL&&!labBoundsContains(x,z,1)&&!inVillage(x,z,1);
}
function editVoxel(x,y,z,id,dirty){
  mods.set(key3(x,y,z),id);
  recordColumnEdit(x,y,z,id);
  notifyFluidChange(x,y,z,id);
  const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),lx=x-cx*CHUNK,lz=z-cz*CHUNK;
  const emissions=chunks.get(ckey(cx,cz))?.spawnLights,power=spawnLightPowers[id],key=key3(x,y,z);
  if(emissions){
    if(power)emissions.set(key,{x:x+.5,y:y+.54,z:z+.5,power});
    else emissions.delete(key);
  }
  dirty.set(ckey(cx,cz),[cx,cz]);
  if(lx===0)dirty.set(ckey(cx-1,cz),[cx-1,cz]);
  if(lx===CHUNK-1)dirty.set(ckey(cx+1,cz),[cx+1,cz]);
  if(lz===0)dirty.set(ckey(cx,cz-1),[cx,cz-1]);
  if(lz===CHUNK-1)dirty.set(ckey(cx,cz+1),[cx,cz+1]);
  if((lx===0||lx===CHUNK-1)&&(lz===0||lz===CHUNK-1)){
    const ax=cx+(lx===0?-1:1),az=cz+(lz===0?-1:1);
    dirty.set(ckey(ax,az),[ax,az]);
  }
}
function commitVoxelEdits(dirty){
  if(!dirty.size)return;
  for(const coords of dirty.values())rebuildChunk(...coords);
  saveMods();
}
function setBlock(x,y,z,id){
  const dirty=new Map();
  editVoxel(Math.floor(x),Math.floor(y),Math.floor(z),id,dirty);
  commitVoxelEdits(dirty);
}
const fluidQueue=[],fluidPending=new Set(),fluidDirty=new Map(),fluidSides=[[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]];
const fluidDirs=[[0,-1,0],...fluidSides,[0,1,0]];
const FIRE_FUEL=new Set([BLOCK.WOOD,BLOCK.PLANK,BLOCK.LEAVES,BLOCK.PINE_LOG,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.CHERRY_LOG,BLOCK.CHERRY_LEAVES,BLOCK.PALM_LOG,BLOCK.PALM_LEAVES,BLOCK.BAMBOO]);
let fluidClock=0,fluidSaveClock=0,fluidChanged=false;
const isLiquid=id=>id===BLOCK.WATER||id===BLOCK.LAVA;
const fluidLimit=id=>id===BLOCK.WATER?8:4;
const cellFluidLevel=(id,x,y,z)=>fluidLevels.get(key3(x,y,z))??fluidLimit(id);
const isFluidSource=(id,x,y,z)=>isLiquid(id)&&cellFluidLevel(id,x,y,z)===fluidLimit(id);
function fluidCanFill(id){return id===BLOCK.AIR||id===BLOCK.FIRE}
function waterCanSource(x,y,z){
  let sources=0;
  for(const [dx,,dz] of fluidSides){
    if(getBlock(x+dx,y,z+dz)===BLOCK.WATER&&isFluidSource(BLOCK.WATER,x+dx,y,z+dz))sources++;
    if(sources>=2)break;
  }
  if(sources<2)return false;
  const below=getBlock(x,y-1,z);
  return below===BLOCK.WATER||below===BLOCK.AIR?below===BLOCK.WATER:!fluidCanFill(below);
}

function enqueueFluid(x,y,z){
  x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(y<1||y>=MAX_Y-1||fluidQueue.length>2200)return;
  const k=key3(x,y,z);if(fluidPending.has(k))return;fluidPending.add(k);fluidQueue.push([x,y,z]);
}
function notifyFluidChange(x,y,z,id){
  const k=key3(x,y,z);if(!isLiquid(id))fluidLevels.delete(k);
  enqueueFluid(x,y,z);
  for(const [dx,dy,dz] of fluidDirs)enqueueFluid(x+dx,y+dy,z+dz);
  if(isLiquid(getBlock(x,y+1,z)))for(const [dx,,dz] of fluidSides)enqueueFluid(x+dx,y+1,z+dz);
}
function fluidEdit(x,y,z,id,level=fluidLimit(id)){
  if(y<1||y>=MAX_Y-1||isLabPlacementRestricted(x,y,z))return false;
  const k=key3(x,y,z),existing=getBlock(x,y,z);
  if(existing===id&&(!isLiquid(id)||cellFluidLevel(id,x,y,z)===level))return false;
  if(isLiquid(existing)&&isLiquid(id)&&id!==existing)id=BLOCK.OBSIDIAN;
  if(BDEF[existing]?.solid||isLiquid(id)&&!fluidCanFill(existing)&&existing!==id)return false;
  editVoxel(x,y,z,id,fluidDirty);
  if(isLiquid(id))fluidLevels.set(k,level);
  fluidChanged=true;
  return true;
}
function flowCell(x,y,z,allowLava){
  if(!chunks.has(ckey(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))||isLabPlacementRestricted(x,y,z))return;
  const id=getBlock(x,y,z);
  if(id===BLOCK.LAVA&&fluidDirs.some(([dx,dy,dz])=>getBlock(x+dx,y+dy,z+dz)===BLOCK.WATER)){
    fluidEdit(x,y,z,BLOCK.OBSIDIAN);
    return;
  }
  if(isFluidSource(id,x,y,z)||!isLiquid(id)&&!fluidCanFill(id))return;
  const above=getBlock(x,y+1,z),neighbors=fluidSides.map(([dx,,dz])=>[x+dx,z+dz,getBlock(x+dx,y,z+dz)]);
  for(const liquid of [BLOCK.WATER,BLOCK.LAVA]){
    if(!allowLava&&liquid===BLOCK.LAVA){
      if(id===liquid||above===liquid||neighbors.some(([,,kind])=>kind===liquid)){
        enqueueFluid(x,y,z);
        return;
      }
      break;
    }
    const levels=[];
    for(const [nx,nz,kind] of neighbors){
      if(kind!==liquid)continue;
      const below=getBlock(nx,y-1,nz);
      if(!isLiquid(below)&&!fluidCanFill(below))levels.push(cellFluidLevel(liquid,nx,y,nz));
    }
    if(liquid===BLOCK.WATER&&above!==BLOCK.WATER&&waterCanSource(x,y,z)){
      fluidEdit(x,y,z,BLOCK.WATER,fluidLimit(BLOCK.WATER));
      return
    }
    const level=fluidFlow.levelAt(fluidLimit(liquid),above===liquid,levels);
    if(level!==0){fluidEdit(x,y,z,liquid,level);return}
  }
  if(isLiquid(id))fluidEdit(x,y,z,BLOCK.AIR);
}
let fluidTick=0;
function updateFluids(dt){
  fluidClock+=dt;fluidSaveClock+=dt;
  if(fluidClock>=.15){fluidClock=0;
    const allowLava=++fluidTick%3===0;
    for(let i=0,n=Math.min(fluidQueue.length,30);i<n;i++){
      const [x,y,z]=fluidQueue.shift();fluidPending.delete(key3(x,y,z));flowCell(x,y,z,allowLava);
    }
    let count=0;for(const [key,coords] of fluidDirty){fluidDirty.delete(key);rebuildChunk(...coords);if(++count>=4)break}
  }
  if(fluidChanged&&fluidSaveClock>1){fluidSaveClock=0;fluidChanged=false;saveMods();}
}
function liquidAim(){
  camera.getWorldDirection(_liquidDir);_liquidOrigin.copy(camera.position);
  for(let distance=.35;distance<=5.5;distance+=.26){
    const p=_liquidOrigin.clone().addScaledVector(_liquidDir,distance),x=Math.floor(p.x),y=Math.floor(p.y),z=Math.floor(p.z),id=getBlock(x,y,z);
    if(isLiquid(id)&&liquidContains(id,p.x,p.y,p.z))return {x,y,z,id};
    if(BDEF[id]?.solid)return null;
  }
  const x=Math.floor(player.pos.x),z=Math.floor(player.pos.z),y=Math.floor(player.pos.y+.45),id=getBlock(x,y,z);
  return isLiquid(id)?{x,y,z,id}:null
}
const _liquidDir=new THREE.Vector3(),_liquidOrigin=new THREE.Vector3();
function useWorldBucket(id){
  const slot=invSlots[state.selected];if(!slot)return;
  if(id==="bucket"){
    const t=liquidAim();if(!t)return toast("Aponte o balde para água ou lava. Aproxime-se da superfície.");
    if(isLabPlacementRestricted(t.x,t.y,t.z))return toast("Líquidos protegidos do laboratório não podem ser coletados");
    if(!isFluidSource(t.id,t.x,t.y,t.z))return toast("Procure a fonte do fluxo para encher o balde.");
    const result=t.id===BLOCK.WATER?"water_bucket":"lava_bucket";
    if(!transformSelectedItem("bucket",result))return;
    setBlock(t.x,t.y,t.z,BLOCK.AIR);
    sound("splash",.5);toast(result==="water_bucket"?"Balde cheio de água":"Balde cheio de lava");return
  }
  const t=state.target,aim=liquidAim(),liquid=id==="water_bucket"?BLOCK.WATER:BLOCK.LAVA;
  const target=aim&&aim.id!==liquid?{...aim,n:[0,0,0]}:t;
  if(!target)return toast("Aponte para a superfície onde deseja despejar o balde");
  const {n}=target,x=target.x+n[0],y=target.y+n[1],z=target.z+n[2],existing=getBlock(x,y,z);
  if(y<1||y>=MAX_Y-1||isLabPlacementRestricted(x,y,z)||(!fluidCanFill(existing)&&!isLiquid(existing))||
    existing===liquid&&isFluidSource(liquid,x,y,z))return toast("Não é possível despejar aqui");
  if(!transformSelectedItem(id,"bucket"))return;
  if(fluidEdit(x,y,z,liquid)){
    saveMods();sound(liquid===BLOCK.WATER?"splash":"torch",.65);
    toast(liquid===BLOCK.WATER?"Água despejada · fluxo ativado":"Lava despejada · cuidado com o calor")
  }
}
function reportSaveIssue(message, error){
  if(saveIssue===message)return;
  saveIssue=message;
  console.warn("[QuimiCraft][Salvamento]",message,error||"");
  $("worldSaveStatus").textContent=message;
  $("pauseSaveStatus").textContent=message;
  if(!state.loading)toast(message);
}
function saveMods(){return worldStorage.flush()}
const FACES=[
  {n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],u:[0,0,1],w:[0,1,0]},
  {n:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],u:[0,0,-1],w:[0,1,0]},
  {n:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],u:[1,0,0],w:[0,0,-1]},
  {n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],u:[1,0,0],w:[0,0,1]},
  {n:[0,0,1],v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],u:[-1,0,0],w:[0,1,0]},
  {n:[0,0,-1],v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],u:[1,0,0],w:[0,1,0]}
];
const UV_CORNERS=[[0,0],[0,1],[1,1],[1,0]], TRI=[0,1,2,0,2,3];
const blockModels=QuimiCraftBlockModels.create(BLOCK,FACES,BDEF);
const blockModelGeometry=new Map();
function texFor(id,fi){const t=BDEF[id].tex;if(!Array.isArray(t))return t;return fi===2?t[0]:fi===3?t[2]:t[1]}
function solidAt(x,y,z){const b=getBlock(x,y,z);return !labDoor.isCell(Math.floor(x),Math.floor(y),Math.floor(z))&&!!BDEF[b]?.solid}
function faceOccludes(id){const d=BDEF[id];return !!(d?.solid&&!d.alpha&&!d.partial&&!d.plant&&!d.station&&!d.detail&&!blockModels.models.has(id))}
function vertexAO(x,y,z,f,corner){
  const uv=UV_CORNERS[corner],su=uv[0]?1:-1,sv=uv[1]?1:-1,n=f.n,u=f.u,w=f.w;
  const p=[x+n[0],y+n[1],z+n[2]],s1=solidAt(p[0]+u[0]*su,p[1]+u[1]*su,p[2]+u[2]*su),s2=solidAt(p[0]+w[0]*sv,p[1]+w[1]*sv,p[2]+w[2]*sv),co=solidAt(p[0]+u[0]*su+w[0]*sv,p[1]+u[1]*su+w[1]*sv,p[2]+u[2]*su+w[2]*sv);
  const raw=s1&&s2 ? .53 : 1-(s1+s2+co)*.12,strength=settings.ao===0?0:settings.ao===1?.55:1;return lerp(1,raw,strength);
}
function uvTile(id,u,v){const pad=.035,tx=id%atlas.cols,ty=Math.floor(id/atlas.cols);return[(tx+pad+u*(1-pad*2))/atlas.cols,1-(ty+pad+(1-v)*(1-pad*2))/atlas.rows]}
const quadTileUV=new Map();
function arrays(){return {p:[],n:[],uv:[],c:[],idx:[],refs:[]}}
function addQuad(a,verts,normal,tex,color=[1,1,1],ref=null,ao=[1,1,1,1]){
  const base=a.p.length/3;
  let uv=quadTileUV.get(tex);
  if(!uv){uv=UV_CORNERS.flatMap(([u,v])=>uvTile(tex,u,v));quadTileUV.set(tex,uv)}
  for(let i=0;i<4;i++){
    a.p.push(...verts[i]);a.n.push(...normal);a.uv.push(uv[i*2],uv[i*2+1]);
    a.c.push(color[0]*ao[i],color[1]*ao[i],color[2]*ao[i]);
  }
  for(const i of TRI)a.idx.push(base+i);
  a.refs.push(ref);
}
function attachChunkFaces(mesh,bucket,x,z){
  const blocks=new Uint32Array(bucket.refs.length),details=[];
  let previous=null,index=-1;
  for(let i=0;i<bucket.refs.length;i++){
    const ref=bucket.refs[i];
    if(typeof ref==="number")blocks[i]=ref;
    else if(ref){
      if(ref!==previous){index=details.push(ref)-1;previous=ref}
      blocks[i]=0x80000000|index;
    }
  }
  mesh.userData.blockFaces={blocks,details,x,z};
}
function readChunkFace(mesh,faceIndex){
  const info=mesh.userData.blockFaces;
  if(!info||!Number.isInteger(faceIndex))return null;
  const quad=faceIndex>>>1,ref=info.blocks[quad];
  if(!ref)return null;
  if(ref>=0x80000000)return info.details[ref&0x7fffffff];
  return {x:info.x+(ref&15),y:(ref>>>8)&127,z:info.z+((ref>>>4)&15),id:ref>>>18,n:FACES[(ref>>>15)&7].n};
}
function addCuboid(a,x,y,z,sx,sy,sz,tex,ref,color=[.86,.86,.86]){for(let fi=0;fi<6;fi++){const f=FACES[fi],verts=f.v.map(v=>[x+v[0]*sx,y+v[1]*sy,z+v[2]*sz]),shade=fi===2?1:fi===3?.62:(fi<2?.84:.75),t=[color[0]*shade,color[1]*shade,color[2]*shade];addQuad(a,verts,f.n,tex,t,{...ref,n:f.n},[1,1,1,1])}}
const transparentTiles=QuimiCraftSurfaceArt.transparentTiles;
function addModelFaces(a,clear,faces,x,y,z,id,variation=false,blockCode=0){
  const rotate=variation?hash(x,z,CROP_BLOCKS.get(id)?.wild??id)*TAU:0,cs=Math.cos(rotate),sn=Math.sin(rotate);
  const lift=id===BLOCK.WATER_LILY&&variation?-.22:0;
  const plantRef=BDEF[id]?.plant?(blockCode?blockCode|(2<<15):{x,y,z,id,n:FACES[2].n}):null;
  for(const {vertices,normal,tile,color} of faces){
    const [nx,ny,nz]=normal,n=variation?[cs*nx-sn*nz,ny,sn*nx+cs*nz]:normal;
    const points=vertices.map(([u,v,w])=>{
      if(!variation)return [x+u,y+v,z+w];
      const dx=u-.5,dz=w-.5;
      return [x+.5+cs*dx-sn*dz,y+v+lift,z+.5+sn*dx+cs*dz];
    });
    addQuad(clear&&transparentTiles.has(tile)?clear:a,points,n,tile,color,plantRef||{x,y,z,id,n});
  }
}
function clearBlockMesh(bucket,packed=false){
  const mesh=new THREE.Mesh(geometryFrom(bucket,packed),clearMat);
  mesh.userData.translucentBlock=true;
  mesh.renderOrder=3;
  return mesh;
}
function detailedBlockMiniature(id){
  const faces=blockModels.models.get(id)||blockModels.produce.get(id);
  if(!faces&&!translucentBlocks.has(id))return null;
  if(!blockModelGeometry.has(id)){
    const solid=arrays(),clear=arrays();
    if(faces)addModelFaces(solid,clear,faces,0,0,0,id);
    else appendOpticalCube(clear,id);
    const geometry=solid.p.length?geometryFrom(solid).translate(-.5,-.5,-.5):null;
    const optical=clear.p.length?geometryFrom(clear).translate(-.5,-.5,-.5):null;
    blockModelGeometry.set(id,{geometry,optical});
  }
  const {geometry,optical}=blockModelGeometry.get(id);
  if(!optical)return new THREE.Mesh(geometry,terrainMat);
  const group=new THREE.Group(),glass=new THREE.Mesh(optical,clearMat);
  glass.userData.translucentBlock=true;glass.renderOrder=3;
  if(geometry)group.add(new THREE.Mesh(geometry,terrainMat));
  group.add(glass);
  return group;
}
const produceIcons=new Map();
function produceIconSource(id){
  if(!blockModels.produce.has(id))return "";
  if(!produceIcons.has(id)){
    const canvas=document.createElement("canvas");
    canvas.width=canvas.height=64;
    blockModels.icon(id,canvas.getContext("2d"));
    produceIcons.set(id,canvas.toDataURL("image/png"));
  }
  return produceIcons.get(id);
}
function appendOpticalCube(a,id){
  for(const [i,f] of FACES.entries())addQuad(a,f.v,f.n,texFor(id,i));
}
function addFrontierFurniture(a,x,y,z,id){
  if(BDEF[id].alchemy){addAlchemyFurniture(a,x,y,z,id);return;}
  const tile=texFor(id,0),wood=texFor(BLOCK.PLANK,0),metal=texFor(BLOCK.SLATE,0),ref={x,y,z,id,n:[0,1,0]};
  for(const [u,v] of [[.07,.09],[.76,.09],[.07,.73],[.76,.73]])addCuboid(a,x+u,y,z+v,.17,.78,.17,wood,ref);
  addCuboid(a,x+.035,y+.69,z+.04,.93,.16,.92,tile,ref);
  addCuboid(a,x+.08,y+.38,z+.1,.84,.095,.8,wood,ref);
  if(id===BLOCK.ASSAY_BENCH){
    addCuboid(a,x+.18,y+.84,z+.21,.51,.12,.43,metal,ref);
    addCuboid(a,x+.43,y+.94,z+.28,.19,.055,.23,texFor(BLOCK.CRYSTAL,0),ref);
  }else if(id===BLOCK.SEED_BENCH){
    for(const u of [.12,.42,.71])addCuboid(a,x+u,y+.84,z+.22,.19,.135,.46,tile,ref);
  }else{
    for(const u of [.16,.77])addCuboid(a,x+u,y+.83,z+.57,.07,.16,.1,wood,ref);
    addCuboid(a,x+.15,y+.95,z+.54,.7,.044,.13,texFor(BLOCK.IRON,0),ref);
  }
}
function addAlchemyFurniture(a,x,y,z,id){
  const ref={x,y,z,id},tile=texFor(id,2),wood=texFor(BLOCK.PLANK,2),iron=texFor(BLOCK.IRON,2);
  const glass=texFor(BLOCK.GLASS_COBALT,2),amber=texFor(BLOCK.GLASS_AMBER,2);
  const box=(u,v,w,sx,sy,sz,texture=tile)=>addCuboid(a,x+u,y+v,z+w,sx,sy,sz,texture,ref);
  const bottle=(u,w,h=.64,color=glass)=>{
    box(u,h,w,.16,.24,.16,color);box(u+.04,h+.24,w+.04,.08,.08,.08,iron);
  };
  if(id===BLOCK.ALCHEMY_SAMPLE){
    box(.15,.035,.16,.7,.5,.68,wood);box(.10,.51,.1,.8,.12,.8);
    for(const u of [.22,.43,.65])bottle(u,.45,.63,u===.43?amber:glass);
    return;
  }
  for(const u of [.08,.77])for(const w of [.08,.77])box(u,0,w,.15,.57,.15,wood);
  box(.035,.55,.035,.93,.11,.93);
  if(id===BLOCK.ALCHEMY_FILTER){
    box(.18,.66,.20,.06,.29,.52,iron);box(.24,.82,.30,.2,.085,.37,amber);
    box(.35,.70,.40,.38,.17,.21,glass);
  }else if(id===BLOCK.ALCHEMY_MOLD){
    box(.20,.66,.24,.59,.19,.50,iron);box(.27,.83,.31,.45,.027,.37,texFor(BLOCK.BRONZE_BLOCK,2));
  }else if(id===BLOCK.ALCHEMY_CELL){
    for(const [u,color] of [[.17,amber],[.64,glass]]){box(u,.66,.29,.20,.24,.29,color);box(u+.08,.82,.42,.055,.16,.055,iron);}
    box(.27,.9,.50,.46,.07,.055,iron);box(.44,.79,.18,.12,.12,.12,texFor(BLOCK.GLOWSTONE,2));
  }else if(id===BLOCK.ALCHEMY_CALORIMETER){
    box(.27,.66,.26,.46,.28,.45,iron);box(.30,.90,.29,.4,.055,.39,glass);
    box(.48,.70,.39,.055,.28,.06,amber);
  }else if(id===BLOCK.ALCHEMY_CRYSTAL_TRAY){
    box(.18,.66,.20,.65,.08,.58,glass);
    for(const [u,v,h] of [[.29,.29,.17],[.44,.46,.21],[.6,.34,.12],[.57,.6,.144]])box(u,.74,v,.1,h,.11,texFor(BLOCK.AMETHYST,2));
  }else{
    if(id===BLOCK.ALCHEMY_VIAL_RACK)box(.11,.81,.65,.77,.075,.26,wood);
    for(const u of [.16,.38,.61])bottle(u,.36,.66,u===.38?amber:glass);
  }
}

function addVillageDetail(a,x,y,z,id,read=getBlock){
  const ref={x,y,z,id},tex=texFor(id,2),add=(ox,oy,oz,sx,sy,sz,tile=tex)=>addCuboid(a,x+ox,y+oy,z+oz,sx,sy,sz,tile,ref);
  const def=BDEF[id];
  if(def?.gate){
    for(const [u,v,w,sx,sy,sz,finish] of survival.gateBoxes(def.gate))
      add(u,v,w,sx,sy,sz,finish==="metal"?texFor(BLOCK.IRON,2):tex);
  }else if(def?.bed){
    const textiles={wood:13,linen:227,blanket:228};
    for(const [u,v,w,sx,sy,sz,finish] of survival.bedBoxes(def.bed))add(u,v,w,sx,sy,sz,textiles[finish]);
  }else if(def?.barrier){
    const wall=BDEF[id].detail==="wall",iron=id===BLOCK.FENCE_IRON,thin=iron?.055:.085;
    const links=fluidSides.map(([dx,,dz])=>{
      const def=BDEF[read(x+dx,y,z+dz)];
      return def?.gate?def.gate.axis===Number(!!dz):def?.barrier||def?.solid&&!def.partial;
    });
    if(!links.some(Boolean))links[0]=links[1]=true;
    if(wall)add(.235,0,.235,.53,.59,.53);
    else{
      add(.5-thin*1.45,0,.5-thin*1.45,thin*2.9,.99,thin*2.9);
      if(iron)add(.458,.97,.458,.084,.14,.084,texFor(BLOCK.IRON,0));
    }
    for(const [i,[dx,,dz]] of fluidSides.entries()){
      if(!links[i])continue;
      const width=wall?.47:thin*1.62,u=dx<0?0:dx>0?.5:.5-width/2,v=dz<0?0:dz>0?.5:.5-width/2;
      for(const height of wall?[0]:[.31,.72])add(u,height,v,dx?.5:width,wall?.50:thin*1.5,dz?.5:width);
      if(iron)add(.47+dx*.32,0,.47+dz*.32,.06,.88,.06);
    }
  }else if(id===BLOCK.GARDEN_BOX){
    add(.06,.02,.08,.88,.49,.84);
    add(.14,.52,.16,.72,.08,.68,texFor(BLOCK.DIRT,2));
  }
}
function addDoorGeometry(a,x,y,z,id,preview=null,clear=null){
  const meta=preview||worldDoorMeta(x,y,z)||{};
  if(!preview&&(labDoor.isCell(x,y,z)||meta.style==="carbon"))return;
  const open=id===BLOCK.DOOR_OPEN,axis=meta.axis??0,hinge=meta.hinge??-1,swing=meta.swing??1;
  const swap=open?axis===0:axis===1,mirror=hinge>0,direction=(mirror?-1:1)*(open?swing:1);
  const half=meta.half??(getBlock(x,y-1,z)===id?1:0);
  for(const face of blockModels.doors[half===1?1:0]){
    const verts=face.vertices.map(([u,v,w])=>{
      const lateral=mirror?1-u:u;
      const thin=open?(hinge<0?.035:.847)+(w-.40)*.62:w;
      const along=open?.50+swing*(lateral-.035):lateral;
      return swap?[x+thin,y+v,z+along]:[x+along,y+v,z+thin];
    });
    if((direction<0)!==swap)verts.reverse();
    const n=[face.normal[0]*direction,face.normal[1],face.normal[2]],normal=swap?[n[2],n[1],n[0]]:n;
    addQuad(clear&&transparentTiles.has(face.tile)?clear:a,verts,normal,face.tile,face.color,{x,y,z,id,n:normal});
  }
}

function encodeAttribute(values,ArrayType,itemSize,scale){
  const encoded=new ArrayType(values.length);
  for(let i=0;i<values.length;i++)encoded[i]=Math.round(values[i]*scale);
  return new THREE.BufferAttribute(encoded,itemSize,true);
}
function packedNormals(values){return encodeAttribute(values,Int8Array,3,127)}
function geometryFrom(a,packed=false){
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(a.p,3));
  g.setAttribute("normal",packed?packedNormals(a.n):new THREE.Float32BufferAttribute(a.n,3));
  g.setAttribute("uv",packed?encodeAttribute(a.uv,Uint16Array,2,65535):
    new THREE.Float32BufferAttribute(a.uv,2));
  g.setAttribute("color",new THREE.Float32BufferAttribute(a.c,3));
  g.setIndex(a.idx);g.computeBoundingSphere();return g;
}

const liquidFog=()=>({
  uFogColor:{value:new THREE.Color()},
  uFogNear:{value:scene.fog.near},
  uFogFar:{value:scene.fog.far}
});
const liquidFogFragment=
  "uniform vec3 uFogColor; uniform float uFogNear,uFogFar;"+
  "float fogAlpha(vec3 point){return smoothstep(uFogNear,uFogFar,distance(cameraPosition,point));}";
const waterMat=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,
  uniforms:{uTime:{value:0},uQuality:{value:1},uWorldWater:{value:true},uUnderwater:{value:0},uSun:{value:new THREE.Vector3(.2,1,.1)},uSurfaceLight:{value:new THREE.Color()},...liquidFog()},
  vertexShader:`
    attribute float depthVal;
    attribute vec3 waterTint;
    varying vec3 vTint,vWorld,vNormal;
    varying float vDepth;
    void main(){
      vec4 world=modelMatrix*vec4(position,1.0);
      vWorld=world.xyz;vDepth=depthVal;vTint=waterTint;
      vNormal=normalize(mat3(modelMatrix)*normal);
      gl_Position=projectionMatrix*viewMatrix*world;
    }`,
  fragmentShader:`
    ${liquidFogFragment}
    uniform vec3 uSun,uSurfaceLight;
    uniform bool uWorldWater;
    uniform float uTime,uQuality,uUnderwater;
    varying vec3 vTint,vWorld,vNormal;
    varying float vDepth;
    float waterCell(vec2 p){
      return fract(sin(dot(mod(p,48.0),vec2(83.53,19.17)))*21541.37);
    }
    float waterRipple(vec2 p,float movement,float phase){
      vec2 pixels=floor(p*15.0);
      float row=pixels.y;
      float wave=sin(row*.47-phase)*1.3+cos(row*.93+phase)*.7;
      float along=pixels.x*.39+row*.27+wave+movement;
      float stripe=floor(along);
      return mix(waterCell(vec2(stripe,row)),waterCell(vec2(stripe+1.0,row)),smoothstep(0.0,1.0,fract(along)));
    }
    void main(){
      bool innerFace=uWorldWater?!gl_FrontFacing:uUnderwater>.5;
      if(!uWorldWater&&innerFace==gl_FrontFacing)discard;
      vec3 face=normalize(vNormal);
      vec3 view=normalize(cameraPosition-vWorld);
      float top=step(.5,face.y);
      float vertical=dot(abs(face.xz),vec2(1.0));
      vec2 side=vec2(vWorld.z*abs(face.x)+vWorld.x*abs(face.z),-vWorld.y);
      vec2 uv=mix(side.yx,vWorld.xz,top);
      float loop=mod(uTime,6.0),phase=loop*1.04719755;
      float ripple=waterRipple(uv,loop*8.0,phase);
      float sheen=smoothstep(.61,.91,ripple);
      vec3 normal=normalize(face+top*uQuality*vec3(
        cos(vWorld.x*2.1+phase)*.045,0.0,sin(vWorld.z*1.8-phase)*.052));
      float facing=clamp(abs(dot(view,normal)),0.0,1.0);
      float fresnel=pow(1.0-facing,3.0);
      float depth=clamp((vDepth-1.0)/11.0,0.0,1.0);
      vec3 pale=mix(vTint*1.12+vec3(.055,.126,.153),vec3(.29,.70,.93),.29);
      vec3 color=mix(pale,pale*.78,depth)*mix(.94,1.02,top);
      float alpha=.43+fresnel*.17+sheen*.035;
      color+=vec3(.07,.12,.15)*sheen*mix(.58,1.0,top);
      if(innerFace){
        if(uWorldWater){
          float skylight=top*smoothstep(.61,.81,facing);
          vec3 filteredSky=uSurfaceLight*.74+pale*.22;
          color=mix(pale*.65,filteredSky,skylight)+vec3(.08,.12,.14)*sheen*top;
          alpha=.13+.51*skylight+sheen*.08*top;
        }else{
          color=mix(pale,pale*.83,depth)+vec3(.025,.045,.06)*sheen;
          alpha=mix(.23,.34,top)+fresnel*.14+sheen*.025;
        }
      }else{
        float highlight=pow(max(dot(reflect(-normalize(uSun),normal),view),0.0),56.0);
        color=mix(color,vec3(.69,.88,.98),fresnel*.36);
        color+=vec3(.35,.34,.26)*highlight*top*uQuality;
      }
      alpha*=mix(.80,1.0,max(top,vertical));
      float fog=fogAlpha(vWorld);
      gl_FragColor=vec4(mix(color,uFogColor,fog),alpha*(1.0-fog));
    }`
});

const lavaMat=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0},...liquidFog()},
  vertexShader:`varying vec3 vWorld; varying vec3 vNormal;
    void main(){vNormal=normal;vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`${liquidFogFragment}
    varying vec3 vWorld; varying vec3 vNormal; uniform float uTime;
    float lavaCell(vec2 p){
      return fract(sin(dot(mod(p,12.0),vec2(28.63,91.17)))*21601.33);
    }
    float magma(vec2 p){
      vec2 cell=floor(p),f=fract(p);
      f=f*f*(3.0-2.0*f);
      return mix(mix(lavaCell(cell),lavaCell(cell+vec2(1,0)),f.x),
        mix(lavaCell(cell+vec2(0,1)),lavaCell(cell+1.0),f.x),f.y);
    }
    void main(){
      vec3 normal=normalize(vNormal);
      float top=max(0.0,normal.y);
      vec2 face=vec2(vWorld.x*abs(normal.z)+vWorld.z*abs(normal.x),vWorld.y);
      vec2 p=floor(mix(face,vWorld.xz,top)*16.0)/16.0;
      float loop=mod(uTime,6.0)/6.0,phase=loop*6.2831853;
      vec2 drift=mix(vec2(0,1),vec2(-1,0),top)*loop;
      float broad=magma(p*1.45+drift*12.0);
      float ripple=sin(p.x*5.1+p.y*3.4+phase+2.2*broad);
      float fine=magma(p*4.0+vec2(4,7)+drift*24.0);
      float heat=broad*.74+fine*.26+ripple*.11;
      float channels=smoothstep(.29,.58,heat);
      float core=smoothstep(.56,.85,heat);
      vec3 crust=vec3(.31,.043,.021),orange=vec3(.95,.235,.016),yellow=vec3(1.0,.77,.22);
      vec3 color=mix(crust,orange,channels);
      color=mix(color,yellow,core);
      float spark=step(.89,lavaCell(floor(p*8.0)))*smoothstep(.45,.93,fine+.17*ripple);
      color+=vec3(.24,.12,.035)*spark*channels;
      vec3 view=normalize(cameraPosition-vWorld);
      float sheen=pow(1.0-abs(dot(normal,view)),3.0);
      color*=mix(.72,1.0,top);
      color+=vec3(.15,.048,.012)*sheen*top;
      gl_FragColor=vec4(mix(color,uFogColor,fogAlpha(vWorld)),1.0);
    }`
});
const GRID=CHUNK+2,GRID_COLS=GRID*GRID;
function newChunkBuild(cx,cz){return {cx,cz,k:ckey(cx,cz),phase:0,i:0,vox:new Uint16Array(GRID*GRID*MAX_Y),tops:new Uint8Array(GRID_COLS),lights:[],spawnLights:new Map(),a:arrays(),la:arrays(),clear:arrays(),wa:{p:[],n:[],uv:[],c:[],idx:[],refs:[],depth:[],tint:[]}}}
function voxelIndex(gx,y,gz){return (gz*GRID+gx)*MAX_Y+y}
function fillVoxelColumn(build,i){
  const x=build.cx*CHUNK+i%GRID-1,z=build.cz*CHUNK+Math.floor(i/GRID)-1;
  const h=terrainHeight(x,z),office=alchemyColumnAt(x,z),offset=i*MAX_Y;
  const expedition=expeditions.column(x,z);
  const top=Math.max(columnGenerationTop(x,z,h),office?.top??0,expedition?.top??0);
  if(office)alchemyWorld.remember(office.site);
  const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),owner=chunks.get(ckey(cx,cz))?.vox;
  const ownerOffset=voxelIndex(x-cx*CHUNK+1,0,z-cz*CHUNK+1);
  const labColumn=laboratoryColumnAt(x,z),checkLab=labColumn!==null||labRepairOverrides.size>0;
  const checkEdits=mods.size>0,veg=settings.vegetation??2;
  const village=!owner&&inVillage(x,z);
  const landmark=!owner&&!village&&remoteSiteAt(x,z);
  const lake=!owner?depths.lakeAt(x,z):null;
  const ruin=lake&&h<WATER_LEVEL&&!owner&&!village&&!landmark?depths.ruinAt(lake,x,z):null;
  let biome,surface,flood,trees,habitat;
  build.tops[i]=top;
  for(let y=0;y<=top;y++){
    const authored=checkLab?laboratoryBlockAt(x,y,z,labColumn):null;
    if(authored!==null){
      build.vox[offset+y]=authored;
      continue;
    }
    const edit=checkEdits?mods.get(key3(x,y,z)):undefined;
    if(edit!==undefined){
      build.vox[offset+y]=edit;
      continue;
    }
    if(owner){
      build.vox[offset+y]=owner[ownerOffset+y];
      continue;
    }
    if(office&&y>=office.low){
      build.vox[offset+y]=y<=office.top?office.blocks[y-office.low]:BLOCK.AIR;
      continue;
    }
    const structure=village?villageBlock(x,y,z):landmark?remoteStructureBlock(x,y,z):BLOCK.AIR;
    if(structure!==BLOCK.AIR){
      build.vox[offset+y]=structure;
      continue;
    }
    const expeditionBlock=expedition?.blocks[y];
    if(expeditionBlock!==undefined){
      build.vox[offset+y]=expeditionBlock;
      continue;
    }
    const sunken=depths.ruinBlock(ruin,y);
    if(sunken){
      build.vox[offset+y]=sunken;
      continue;
    }
    if(biome===undefined){
      biome=biomeAt(x,z);
      habitat=habitats.at(x,z,biome);
      surface=surfaceBlock(x,z,h,biome,habitat,lake);
      flood=canFloodColumn(x,z,h);
    }
    const natural=naturalBlock(x,y,z,h,biome,surface,habitat,lake);
    if(natural!==BLOCK.AIR||y<=h){
      build.vox[offset+y]=natural;
      continue;
    }
    if(flood&&y<=WATER_LEVEL){
      build.vox[offset+y]=BLOCK.WATER;
      continue;
    }
    if(trees===undefined)trees=!expedition?.surface&&canGrowVegetation(x,z)?treeCandidates(x,z,veg):null;
    build.vox[offset+y]=trees===null?BLOCK.AIR:vegetationBlock(x,y,z,h,biome,surface,veg,trees,habitat);
  }
}
function localBlock(b,x,y,z){if(y<0||y>=MAX_Y)return BLOCK.AIR;const gx=x-b.cx*CHUNK+1,gz=z-b.cz*CHUNK+1;if(gx>=0&&gx<GRID&&gz>=0&&gz<GRID)return b.vox[voxelIndex(gx,y,gz)];return getBlock(x,y,z)}
function localSolid(b,x,y,z){return !!BDEF[localBlock(b,x,y,z)]?.solid}
function localOccludes(b,x,y,z){return faceOccludes(localBlock(b,x,y,z))}
function vertexAOLocal(b,x,y,z,f,corner){if(settings.ao===0)return 1;const uv=UV_CORNERS[corner],su=uv[0]?1:-1,sv=uv[1]?1:-1,n=f.n,u=f.u,w=f.w,p=[x+n[0],y+n[1],z+n[2]],s1=localOccludes(b,p[0]+u[0]*su,p[1]+u[1]*su,p[2]+u[2]*su),s2=localOccludes(b,p[0]+w[0]*sv,p[1]+w[1]*sv,p[2]+w[2]*sv),co=localOccludes(b,p[0]+u[0]*su+w[0]*sv,p[1]+u[1]*su+w[1]*sv,p[2]+u[2]*su+w[2]*sv),raw=s1&&s2?.53:1-(s1+s2+co)*.12;return lerp(1,raw,settings.ao===1?.55:1)}
const SEASONS=["Primavera","Verão","Outono","Inverno"];
const climateState={elapsed:0,season:-1,override:null,lastWeather:"clear",weatherPeriod:-1,lightning:0};
function currentSeason(){return climateState.season>=0?climateState.season:Math.floor(climateState.elapsed/420)%4}
function seasonalBlockTint(id,tint){
  const season=currentSeason();
  if(season===2&&[BLOCK.LEAVES,BLOCK.CHERRY_LEAVES,BLOCK.DRY_LEAVES,BLOCK.PALM_LEAVES].includes(id))return[tint[0]*1.18,tint[1]*.74,tint[2]*.39];
  if(season===3&&[BLOCK.GRASS,BLOCK.LEAVES,BLOCK.TALL_GRASS,BLOCK.MOSS].includes(id))return[tint[0]*.81,tint[1]*.84,tint[2]*.86];
  if(season===0&&[BLOCK.GRASS,BLOCK.LEAVES,BLOCK.MOSS].includes(id))return[tint[0]*.94,tint[1]*1.07,tint[2]*.94];
  return tint
}
function seasonalBlockTex(id,fi){if(currentSeason()===3&&id===BLOCK.GRASS&&fi===2)return 8;return texFor(id,fi)}
const uniformFaceLight=[1,1,1,1],leafBlockIds=new Set([BLOCK.LEAVES,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.CHERRY_LEAVES,BLOCK.PALM_LEAVES]);
function meshChunkColumn(b,i){
  const lx=Math.floor(i/CHUNK),lz=i%CHUNK,x=b.cx*CHUNK+lx,z=b.cz*CHUNK+lz,scanTop=b.tops[(lz+1)*GRID+lx+1],a=b.a;
  for(let y=0;y<=scanTop;y++){const id=localBlock(b,x,y,z);if(id===BLOCK.AIR)continue;
    // The top bit marks custom face references. The remaining fields hold ID, face, height and local X/Z.
    const encoded=id<8192?(id<<18)|(y<<8)|(lz<<4)|lx:0;
    const power=spawnLightPowers[id];
    if(power)b.spawnLights.set(key3(x,y,z),{x:x+.5,y:y+.54,z:z+.5,power});
    if(id===BLOCK.WATER){addWaterVoxelFaces(b,x,y,z);continue;}
    if(id===BLOCK.LAVA){addLavaVoxelFaces(b,x,y,z);continue;}
    if(blockModels.models.has(id)){
      const flowers=blockModels.plantIds.has(id)&&!BDEF[id]?.solid;
      addModelFaces(a,b.clear,blockModels.models.get(id),x,y,z,id,flowers,encoded);
      if(placementsWithLight.has(id))b.lights.push({x,y,z,id});
      continue;
    }if(BDEF[id]?.detail){addVillageDetail(a,x,y,z,id,(px,py,pz)=>localBlock(b,px,py,pz));continue}if(BDEF[id]?.station){addFrontierFurniture(a,x,y,z,id);continue}if(id===BLOCK.DOOR||id===BLOCK.DOOR_OPEN){addDoorGeometry(a,x,y,z,id,null,b.clear);continue}const optical=translucentBlocks.has(id),dest=optical?b.clear:a;
    const leaf=leafBlockIds.has(id),flatLight=optical||settings.ao===0;
    for(let fi=0;fi<6;fi++){const f=FACES[fi],nid=localBlock(b,x+f.n[0],y+f.n[1],z+f.n[2]);if(nid===id||faceOccludes(nid)||optical&&translucentBlocks.has(nid)&&nid<id)continue;const ao=flatLight?uniformFaceLight:f.v.map((_,q)=>vertexAOLocal(b,x,y,z,f,q)),shade=fi===2?1:fi===3?.61:(fi<2?.82:.72),tint=leaf?(id===BLOCK.PINE_LEAVES?[.67,.86,.72]:id===BLOCK.DRY_LEAVES?[.96,.9,.64]:id===BLOCK.CHERRY_LEAVES?[1,.8,.91]:id===BLOCK.PALM_LEAVES?[.68,.92,.7]:[.77+hash(x,y,z)*.11,.93,.74]):optical?[.94,.99,1.03]:[shade,shade,shade];addQuad(dest,f.v.map(v=>[x+v[0],y+v[1],z+v[2]]),f.n,seasonalBlockTex(id,fi),seasonalBlockTint(id,tint),encoded?encoded|(fi<<15):{x,y,z,id,n:f.n},ao)}
  }
}
function liquidCellHeight(id,x,y,z,read=getBlock){
  const above=read(x,y+1,z);
  const level=cellFluidLevel(id,x,y,z),limit=fluidLimit(id),water=id===BLOCK.WATER;
  const covered=above===id||water&&level===limit&&faceOccludes(above);
  return fluidFlow.height(limit,level,covered,water?.88:.9);
}
function liquidCornerHeights(id,x,y,z,read){
  if(id===BLOCK.WATER)return fluidFlow.waterCorners(x,z,(px,pz)=>{
    const neighbor=read(px,y,pz);
    if(neighbor===id)return liquidCellHeight(id,px,y,pz,read);
    return BDEF[neighbor]?.solid?-1:0;
  });
  const at=(vx,vz)=>{
    let height=0;
    for(const dx of [vx-1,vx])for(const dz of [vz-1,vz]){
      if(read(x+dx,y,z+dz)===id)height=Math.max(height,liquidCellHeight(id,x+dx,y,z+dz,read));
    }
    return height;
  };
  return [[at(0,0),at(0,1)],[at(1,0),at(1,1)]];
}
function liquidSurfaceHeight(id,x,y,z){
  return fluidFlow.surface(liquidCornerHeights(id,Math.floor(x),y,Math.floor(z),getBlock),fract(x),fract(z));
}
function liquidContains(id,x,y,z){
  const bx=Math.floor(x),by=Math.floor(y),bz=Math.floor(z);
  if(getBlock(bx,by,bz)!==id)return false;
  return y-by<fluidFlow.surface(liquidCornerHeights(id,bx,by,bz,getBlock),x-bx,z-bz);
}
function addLavaVoxelFaces(b,x,y,z){
  const heights=liquidCornerHeights(BLOCK.LAVA,x,y,z,(px,py,pz)=>localBlock(b,px,py,pz));
  for(const face of FACES){
    const [dx,dy,dz]=face.n,other=localBlock(b,x+dx,y+dy,z+dz);
    if(other===BLOCK.LAVA||faceOccludes(other))continue;
    const vertices=face.v.map(([vx,vy,vz])=>[x+vx,y+vy*heights[vx][vz],z+vz]);
    addQuad(b.la,vertices,face.n,35);
  }
}

function addWaterVoxelFaces(b,x,y,z){
  const read=(px,py,pz)=>localBlock(b,px,py,pz);
  let visibleFaces=0;
  for(let i=0;i<FACES.length;i++){
    const [dx,dy,dz]=FACES[i].n,other=read(x+dx,y+dy,z+dz);
    if(other!==BLOCK.WATER&&(dy===1||!faceOccludes(other)))visibleFaces|=1<<i;
  }
  if(!visibleFaces)return;
  const heights=liquidCornerHeights(BLOCK.WATER,x,y,z,read);
  const water=b.wa,depth=clamp(WATER_LEVEL-y+1,1,12),tint=regionalWater(x,z).rgb,push=(vertices,normal)=>{
    const base=water.p.length/3;
    for(const pt of vertices){water.p.push(...pt);water.n.push(...normal);water.depth.push(depth);water.tint.push(...tint)}
    for(const q of TRI)water.idx.push(base+q)
  };
  for(let i=0;i<FACES.length;i++){
    if(!(visibleFaces&1<<i))continue;
    const face=FACES[i],[dx,dy,dz]=face.n,other=read(x+dx,y+dy,z+dz);
    if(dy===1&&faceOccludes(other)&&Math.min(...heights[0],...heights[1])===1)continue;
    const inset=dy!==1&&BDEF[other]?.solid?.004:0;
    push(fluidFlow.faceVertices(face,heights,x,y,z,inset),face.n);
  }
}
function stepChunkBuild(b){if(b.phase===0){fillVoxelColumn(b,b.i++);if(b.i>=GRID_COLS){b.phase=1;b.i=0}return false}meshChunkColumn(b,b.i++);return b.i>=CHUNK*CHUNK}
function removeChunkMesh(old){if(!old)return;scene.remove(old.group);old.group.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
function geometryFromWater(water){
  const wg=new THREE.BufferGeometry();
  wg.setAttribute("position",new THREE.Float32BufferAttribute(water.p,3));
  wg.setAttribute("normal",packedNormals(water.n));
  wg.setAttribute("depthVal",new THREE.BufferAttribute(Uint8Array.from(water.depth),1));
  wg.setAttribute("waterTint",encodeAttribute(water.tint,Uint8Array,3,255));
  wg.setIndex(water.idx);wg.computeBoundingSphere();return wg;
}
function finalizeChunk(b){
  const previous=chunks.get(b.k);
  if(b.lights.length||previous?.lights?.length)torchDirty=true;
  removeChunkMesh(previous);
  const x=b.cx*CHUNK,z=b.cz*CHUNK,group=new THREE.Group(),mesh=new THREE.Mesh(geometryFrom(b.a,true),terrainMat);
  mesh.castShadow=mesh.receiveShadow=settings.shadows>0;
  attachChunkFaces(mesh,b.a,x,z);group.add(mesh);
  const glass=b.clear.p.length?clearBlockMesh(b.clear,true):null;
  if(glass){attachChunkFaces(glass,b.clear,x,z);group.add(glass)}
  if(b.la.p.length){const lg=geometryFrom(b.la,true),lm=new THREE.Mesh(lg,lavaMat);lm.renderOrder=1;group.add(lm)}
  if(b.wa.p.length){
    const wg=geometryFromWater(b.wa),wm=new THREE.Mesh(wg,waterMat);
    wm.position.copy(wg.boundingSphere.center);
    const position=wg.getAttribute("position");
    for(let i=0;i<position.array.length;i+=3){
      position.array[i]-=wm.position.x;
      position.array[i+1]-=wm.position.y;
      position.array[i+2]-=wm.position.z;
    }
    wg.boundingSphere.center.set(0,0,0);
    wm.renderOrder=2;wm.receiveShadow=settings.shadows>0;group.add(wm);
  }
  group.visible=chunkWithinFog(b.cx,b.cz,terrainVisibility);
  scene.add(group);
  chunks.set(b.k,{group,mesh,glass,cx:b.cx,cz:b.cz,vox:b.vox,lights:b.lights,spawnLights:b.spawnLights});
  if(!previous){
    for(let vx=x-1;vx<=x+CHUNK;vx++)for(let vz=z-1;vz<=z+CHUNK;vz++){
      const top=editedColumnTops.get(vx+","+vz)??0;
      for(let y=1;y<=top;y++){
        const id=mods.get(key3(vx,y,vz));
        if(isLiquid(id))notifyFluidChange(vx,y,vz,id);
      }
    }
  }
  return group;
}
function buildChunk(cx,cz){const b=newChunkBuild(cx,cz);while(!stepChunkBuild(b)){}return finalizeChunk(b)}
function rebuildChunk(cx,cz){
  const k=ckey(cx,cz),loaded=chunks.has(k),inProgress=activeBuild?.k===k;
  if(!loaded&&!inProgress)return;
  if(inProgress)activeBuild=null;
  const task=pending.find(q=>q.k===k);
  if(task)task.rebuild=loaded;
  else pending.push({cx,cz,k,d:-1,rebuild:loaded});
  queueChanged=true;
}
function rebuildChunkImmediate(cx,cz){
  const k=ckey(cx,cz);
  if(!chunks.has(k)){rebuildChunk(cx,cz);return}
  if(activeBuild?.k===k)activeBuild=null;
  const index=pending.findIndex(q=>q.k===k);
  if(index>=0)pending.splice(index,1);
  buildChunk(cx,cz);
}
let initialReady=false,activeBuild=null,centerChunk={x:999,z:999};
let forwardChunks={x:0,z:0};
const hasChunk=(x,z)=>chunks.has(ckey(x,z));
const chunkPosition=pos=>({x:Math.floor(pos.x/CHUNK),z:Math.floor(pos.z/CHUNK)});
const areaReady=({x,z})=>horizon.coreReady(x,z,hasChunk);
const BOOT_STAGES=Object.freeze([
  {id:"initializing",label:"Inicializando o mundo…",weight:.04},
  {id:"loading-save",label:"Carregando dados do mundo…",weight:.06},
  {id:"loading-assets",label:"Carregando texturas e materiais…",weight:.07},
  {id:"generating-terrain",label:"Gerando terreno inicial…",weight:.12},
  {id:"generating-laboratory",label:"Construindo o laboratório…",weight:.16},
  {id:"validating-laboratory",label:"Validando paredes do laboratório…",weight:.1},
  {id:"generating-village",label:"Preparando a vila…",weight:.1},
  {id:"generating-surroundings",label:"Gerando uma área maior ao redor da entrada.",weight:.29},
  {id:"preparing-collisions",label:"Preparando colisões…",weight:.08},
  {id:"preparing-gameplay",label:"Preparando sistemas de química…",weight:.09},
  {id:"ready",label:"Quase pronto…",weight:.05}
]);
const worldBoot={running:false,attempt:0,stage:"idle",stageFraction:0,requiredChunks:new Map(),stageChunkKeys:new Set(),completedStages:new Set(),error:null,preferredSpawn:null,entryCenter:null,loadedState:null};
function effectivePreloadRadius(){return horizon.preloadRadius(settings.render)}
function setBootStage(id,fraction=0,detail=""){
  const index=BOOT_STAGES.findIndex(stage=>stage.id===id);if(index<0)return;
  const stage=BOOT_STAGES[index];worldBoot.stage=id;worldBoot.stageFraction=clamp(fraction,0,1);
  const completedWeight=BOOT_STAGES.slice(0,index).reduce((sum,item)=>sum+item.weight,0),totalWeight=BOOT_STAGES.reduce((sum,item)=>sum+item.weight,0),progress=clamp((completedWeight+stage.weight*worldBoot.stageFraction)/totalWeight,0,1);
  $("loaderFill").style.width=`${(progress*100).toFixed(1)}%`;
  $("loaderCopy").textContent=stage.label;
  $("loaderChunks").textContent=`ETAPA ${index+1} / ${BOOT_STAGES.length}${detail?` · ${detail}`:""}`;
}
function updateBootChunkProgress(){
  if(!worldBoot.running||!["generating-terrain","generating-laboratory","generating-village","generating-surroundings"].includes(worldBoot.stage)||!worldBoot.stageChunkKeys.size)return;
  let ready=0;for(const key of worldBoot.stageChunkKeys)if(chunks.has(key))ready++;
  setBootStage(worldBoot.stage,ready/worldBoot.stageChunkKeys.size,`${ready} / ${worldBoot.stageChunkKeys.size} chunks`)
}
function ringChunkKeys(cx,cz,r){const out=[];for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++)out.push({cx:cx+dx,cz:cz+dz,k:ckey(cx+dx,cz+dz),d:dx*dx+dz*dz});return out}
function labChunkDescriptors(){
  const b=labStructureBounds(LAB_PROTECTION_MARGIN+1),corridorFront=LAB_LAYOUT.cz-LAB_LAYOUT.halfD-LAB_ENTRANCE_LENGTH-1,minCx=Math.floor(b.left/CHUNK),maxCx=Math.floor(b.right/CHUNK),minCz=Math.floor(Math.min(b.front,corridorFront)/CHUNK),maxCz=Math.floor(b.rear/CHUNK),out=[];
  for(let cz=minCz;cz<=maxCz;cz++)for(let cx=minCx;cx<=maxCx;cx++)out.push({cx,cz,k:ckey(cx,cz),d:-4});
  return out
}
function initialPreloadDescriptors(){
  const center=worldBoot.entryCenter||worldBoot.preferredSpawn||spawn;
  const cx=Math.floor(center.x/CHUNK),cz=Math.floor(center.z/CHUNK);
  const preload=new Map(horizon.disk(cx,cz,effectivePreloadRadius()).map(q=>[q.k,q]));
  for(const q of [...labChunkDescriptors(),...villageAreaDescriptors()])if(!preload.has(q.k))preload.set(q.k,q);
  return [...preload.values()];
}
function safeSpawnCandidate(x,z){
  const ix=Math.floor(x),iz=Math.floor(z),chunkReady=chunks.has(ckey(Math.floor(ix/CHUNK),Math.floor(iz/CHUNK)));if(!chunkReady)return null;
  const naturalSurface=terrainHeight(ix,iz),y=findStandingY(x,z,Math.max(LAB_LAYOUT.y,naturalSurface+2)),floorId=getBlock(ix,Math.floor(y)-1,iz),feetId=getBlock(ix,Math.floor(y),iz),headId=getBlock(ix,Math.floor(y)+1,iz),authoredArea=labBoundsContains(ix,iz,LAB_PROTECTION_MARGIN)||inLabEntranceCorridor(ix,iz,1)||inLabVillagePath(ix,iz)||inVillage(ix,iz,2);
  if(!BDEF[floorId]?.solid||[BLOCK.GLASS,BLOCK.ICE,BLOCK.LAVA].includes(floorId)||BDEF[feetId]?.solid||BDEF[headId]?.solid||BDEF[feetId]?.liquid||BDEF[headId]?.liquid||(naturalSurface<WATER_LEVEL&&y<=WATER_LEVEL+1.02)||(!authoredArea&&y<naturalSurface+.99))return null;
  const r=.31;if(aabbHitsLabDecor(x-r,x+r,y+.02,y+1.74,z-r,z+r)||labDoor.hits(x-r,x+r,y+.02,y+1.74,z-r,z+r))return null;
  return {x,z,y:y+.02,floorId}
}
function findSafeSpawnPosition(preferredX=spawn.x,preferredZ=spawn.z){
  const direct=safeSpawnCandidate(preferredX,preferredZ);if(direct)return direct;
  for(let radius=1;radius<=14;radius++)for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==radius)continue;const candidate=safeSpawnCandidate(Math.floor(preferredX)+dx+.5,Math.floor(preferredZ)+dz+.5);if(candidate)return candidate}
  return null
}
function syncPlayerToSafeGround(x=spawn.x,z=spawn.z){const safe=findSafeSpawnPosition(x,z);if(!safe)return false;player.pos.set(safe.x,safe.y,safe.z);player.vel.set(0,0,0);player.onGround=false;player.lastGroundY=safe.y;player.fallStart=safe.y;return true}
function finishInitialLoad(){initialReady=true;worldBoot.running=false;state.loading=false;state.startQueued=false;beginGame()}
function beginGame(){
  initAudio();state.started=true;state.playing=false;state.paused=true;state.awaitingEntry=true;$("titleScreen").classList.add("hidden");$("hud").classList.remove("visible");
  $("loaderFill").style.width="100%";$("loaderCopy").textContent="Mundo pronto";$("loaderChunks").textContent=`ETAPA ${BOOT_STAGES.length} / ${BOOT_STAGES.length}`;$("loaderReady").hidden=false;
  chatMessage("PROF. CARBONO","O mundo foi validado. O Laboratório Carbono, a vila e os arredores estão prontos para a exploração.",{category:"dialogue"});
  chatMessage("GUARDIÃ ÍRIS","A Vila dos Elementos fica a leste. Siga a trilha de tijolos até X "+VILLAGE.x+" · Z "+VILLAGE.z+". Procure as oficinas e os comerciantes da vila.",{category:"dialogue"});
  chatMessage("SISTEMA","O mundo se estende em todas as direções. Explore regiões distantes para encontrar grandes lagos, novas cordilheiras, observatórios, abrigos e ruínas antigas.",{category:"system"});
  chatMessage("SISTEMA","Fome e sede agora diminuem durante a exploração. Fabrique copos ou baldes, colete água nos lagos e asse carnes em um forno abastecido com carvão.",{category:"system"});
  chatMessage("SISTEMA","Para criar filhotes, segure a comida certa, aponte para dois adultos da mesma espécie e alimente cada um com E ou botão direito. Vacas e ovelhas gostam de trigo, porcos de cenouras e galinhas de sementes.",{category:"system"});
}
function enterLoadedWorld(guided=false){
  if(!state.started||state.loading||!state.awaitingEntry)return;
  ensureChunks(true);
  state.awaitingEntry=false;state.paused=false;if(guided)startFieldwork();renderFieldwork();$("loaderReady").hidden=true;$("loading").classList.add("hidden");$("hud").classList.add("visible");setTimeout(()=>$("controls").classList.add("hide"),12000);requestPointer({notify:true})
}
function sortChunkQueue(){
  const {x,z}=centerChunk;
  const priority=q=>{
    if(q.rebuild){
      if(worldBoot.running)return -2000;
      const near=(q.cx-x)**2+(q.cz-z)**2;
      return near<=2?-1300:near;
    }
    return chunkPriorities.get(q.k)??q.d;
  };
  for(const q of pending)q.priority=priority(q);
  pending.sort((a,b)=>a.priority-b.priority);
  queueChanged=false;
}
function ensureChunks(force=false){
  const streaming=initialReady&&!worldBoot.running,range=settings.render;
  const next=streaming?horizon.streamCenter(player.pos,CHUNK,centerChunk):{
    ...chunkPosition(player.pos),aheadX:0,aheadZ:0
  };
  const attention=forwardChunks.x+","+forwardChunks.z;
  if(!force&&next.x===centerChunk.x&&next.z===centerChunk.z&&next.aheadX===centerChunk.aheadX&&
     next.aheadZ===centerChunk.aheadZ&&attention===centerChunk.attention)return;
  centerChunk={...next,attention};
  const wanted=new Map();
  const push=(q,priority=q.d)=>{
    const existing=wanted.get(q.k);
    if(!existing||existing.priority>priority)wanted.set(q.k,{...q,priority});
  };
  const prioritize=(center,radius,bonus)=>{
    for(const q of horizon.disk(center.x,center.z,radius))push(q,q.d-bonus);
  };
  if(streaming){
    for(const q of horizon.streamWindow(next,range))push(q);
    for(const [k,ch] of chunks){
      if(!wanted.has(k)&&horizon.retainChunk(ch.cx,ch.cz,next,range)){
        const d=(ch.cx-next.x)**2+(ch.cz-next.z)**2;
        push({cx:ch.cx,cz:ch.cz,k,d});
      }
    }
    prioritize(next,horizon.minimumRadius+1,550);
    const direction=forwardChunks.x||forwardChunks.z?forwardChunks:{x:next.aheadX,z:next.aheadZ};
    for(const center of horizon.nextCenters(next.x,next.z,direction))prioritize(center,horizon.minimumRadius,950);
    prioritize(next,horizon.minimumRadius,1450);
  }else for(const q of worldBoot.requiredChunks.values())push(q);
  for(const q of labChunkDescriptors())push(q);
  wantedChunks=new Set(wanted.keys());
  chunkPriorities=new Map([...wanted.values()].map(q=>[q.k,q.priority]));
  for(let i=pending.length-1;i>=0;i--)if(!wantedChunks.has(pending[i].k))pending.splice(i,1);
  const pendingKeys=new Set(pending.map(q=>q.k));
  for(const q of wanted.values()){
    if(!chunks.has(q.k)&&!pendingKeys.has(q.k)&&activeBuild?.k!==q.k)pending.push(q);
  }
  sortChunkQueue();
  for(const [k,ch] of chunks)if(!wantedChunks.has(k)){removeChunkMesh(ch);chunks.delete(k)}
}
function processChunks(){
  if(activeBuild&&!wantedChunks.has(activeBuild.k))activeBuild=null;
  if(queueChanged)sortChunkQueue();
  const start=performance.now();
  const urgent=pending[0]?.priority<-500||activeBuild?.priority<-500;
  const budget=worldBoot.running?15:urgent?state.fps>47?9:5.2:state.fps>56?5.2:state.fps>47?3.4:1.6;
  while(performance.now()-start<budget){
    if(!activeBuild){
      const job=pending.shift();
      if(!job)break;
      if(!wantedChunks.has(job.k)||(chunks.has(job.k)&&!job.rebuild))continue;
      activeBuild=newChunkBuild(job.cx,job.cz);
      activeBuild.priority=job.priority;
    }
    if(stepChunkBuild(activeBuild)){finalizeChunk(activeBuild);activeBuild=null}
  }
  if(worldBoot.running)updateBootChunkProgress()
}

// Procedural sky, celestial bodies and clouds.
// Procedural sky, celestial bodies and clouds.
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uTime:{value:.25},uOvercast:{value:0},uHorizon:{value:new THREE.Color()}},vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
  varying vec3 vPos;uniform float uTime;uniform float uOvercast;uniform vec3 uHorizon;vec3 noonTop=vec3(.12,.48,.78),noonHor=vec3(.62,.82,.93),nightTop=vec3(.008,.018,.07),nightHor=vec3(.035,.08,.15);
  void main(){float h=normalize(vPos).y*.5+.5;float sun=max(sin(uTime*6.28318),-.15);float day=smoothstep(-.16,.15,sun);float dusk=pow(1.0-abs(clamp(sun,-1.0,1.0)),7.0);vec3 top=mix(nightTop,noonTop,day),hor=mix(nightHor,noonHor,day);hor+=vec3(.72,.20,.08)*dusk;vec3 c=mix(uHorizon,mix(hor,top,pow(h,.7)),smoothstep(.025,.56,abs(normalize(vPos).y)));vec3 cloud=mix(vec3(.037,.047,.064),mix(vec3(.33,.38,.45),vec3(.18,.22,.30),h),day);gl_FragColor=vec4(mix(c,cloud,uOvercast),1.0);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(425,32,16),skyMat);scene.add(sky);
function celestialTexture(isMoon,phase=4){
  const c=document.createElement("canvas");c.width=c.height=32;const x=c.getContext("2d");
  x.imageSmoothingEnabled=false;
  x.fillStyle=isMoon?"#d2e0e3":"#ffe7a1";x.fillRect(2,2,28,28);
  x.fillStyle=isMoon?"#eaf4f4":"#fff6cd";x.fillRect(4,4,23,23);
  if(isMoon){
    for(let k=0;k<12;k++){
      const px=5+Math.floor(hash(k,58)*21),py=5+Math.floor(hash(k,77)*20),r=1+Math.floor(hash(k,89)*2);
      x.fillStyle=k%2?"#b7c9d4":"#aebbc9";x.fillRect(px,py,r+2,r+1);
      x.fillStyle="#f2f8f5";x.fillRect(px+1,py+1,r,r);
    }
    const sunAngle=phase*Math.PI/4,dir=Math.sin(sunAngle),light=-Math.cos(sunAngle);
    for(let py=0;py<32;py++)for(let px=0;px<32;px++){
      const u=(px-15.5)/13.5,v=(py-15.5)/13.5,r=u*u+v*v;
      if(r>1||u*dir+Math.sqrt(Math.max(0,1-r))*light<=0)x.clearRect(px,py,1,1);
    }
  }else{
    x.fillStyle="rgba(255,255,255,.55)";x.fillRect(8,7,15,14);
  }
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.encoding=THREE.sRGBEncoding;return t;
}
function celestialGlow(isMoon){
  const c=document.createElement("canvas");c.width=c.height=64;const ctx=c.getContext("2d"),g=ctx.createRadialGradient(32,32,4,32,32,32);
  g.addColorStop(0,isMoon?"rgba(179,210,252,.31)":"rgba(255,232,161,.4)");g.addColorStop(.55,isMoon?"rgba(159,190,245,.12)":"rgba(255,179,88,.15)");g.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
  const t=new THREE.CanvasTexture(c);return new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,opacity:1,depthWrite:false,fog:false}));
}
function celestialBody(isMoon){
  const g=new THREE.Group(),face=new THREE.Mesh(new THREE.PlaneGeometry(isMoon?10:12,isMoon?10:12),new THREE.MeshBasicMaterial({map:celestialTexture(isMoon),transparent:true,alphaTest:.05,depthWrite:false,side:THREE.DoubleSide,fog:false})),halo=celestialGlow(isMoon);
  face.renderOrder=9;halo.renderOrder=8;halo.scale.setScalar(isMoon?28:43);g.add(halo,face);return g;
}
const sunOrb=celestialBody(false),moonOrb=celestialBody(true);scene.add(sunOrb,moonOrb);
const moonTextures=folklore.phases.map((_,phase)=>phase===4?moonOrb.children[1].material.map:celestialTexture(true,phase));
let shownMoonPhase=-1;
const starGeo=new THREE.BufferGeometry(),starP=[];for(let i=0;i<900;i++){const th=hash(i,1)*TAU,ph=Math.acos(lerp(-.05,1,hash(i,2)));starP.push(Math.sin(ph)*Math.cos(th)*190,Math.cos(ph)*190,Math.sin(ph)*Math.sin(th)*190)}starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starP,3));const starMat=new THREE.PointsMaterial({color:0xdbeaff,size:.62,sizeAttenuation:true,transparent:true,opacity:0,fog:false,depthWrite:false});const stars=new THREE.Points(starGeo,starMat);scene.add(stars);
const cloudGroup=new THREE.Group(),cloudMaterial=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.82,depthWrite:false,depthTest:true,fog:false});
const cloudGeometry=new THREE.BoxGeometry(1,1,1),cloudCount=224,cloudBody=new THREE.InstancedMesh(cloudGeometry,cloudMaterial,cloudCount),cloudDummy=new THREE.Object3D();
for(let i=0;i<cloudCount;i++){
  const cluster=Math.floor(i/4),layer=i%4;
  const x=(hash(cluster,11)-.5)*345,z=(hash(cluster,12)-.5)*345,y=72+hash(cluster,13)*31;
  const px=x+(layer===0?0:(hash(i,21)-.5)*29),pz=z+(layer===0?0:(hash(i,22)-.5)*24);
  const sx=(layer===0?27:12+hash(i,23)*24),sz=(layer===0?20:10+hash(i,24)*20),sy=layer===0?3:1.3+hash(i,25)*2.3;
  cloudDummy.position.set(px,y+layer*1.25,pz);cloudDummy.scale.set(sx,sy,sz);cloudDummy.updateMatrix();cloudBody.setMatrixAt(i,cloudDummy.matrix);
  cloudBody.setColorAt(i,new THREE.Color().setRGB(layer===0?.89:1,layer===0?.92:1,layer===0?.96:1));
}
cloudBody.instanceMatrix.needsUpdate=true;if(cloudBody.instanceColor)cloudBody.instanceColor.needsUpdate=true;
cloudBody.frustumCulled=false;cloudGroup.add(cloudBody);scene.add(cloudGroup);

const LAB_PROTECTION_MARGIN=4,LAB_ENTRANCE_LENGTH=12,LAB_VALIDATION_VERSION=60;
const LAB_LAYOUT=QuimiCraftLaboratory.createLayout({
  terrainHeight,VILLAGE,MAX_Y,WATER_LEVEL,LAB_PROTECTION_MARGIN,LAB_ENTRANCE_LENGTH,clamp,lerp
});
const spawn={x:LAB_LAYOUT.cx+.5,z:LAB_LAYOUT.cz-LAB_LAYOUT.halfD-LAB_ENTRANCE_LENGTH+.5};
spawn.y=(LAB_LAYOUT.entranceSurfaces.get(Math.floor(spawn.z))??LAB_LAYOUT.y-1)+1.02;
const PERIODIC_STATION={x:LAB_LAYOUT.cx,z:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-2.9};
const storedAlchemy=(()=>{
  try{const version=JSON.parse(localStorage.qc_alchemy_v1||"null");return version?.version===1&&version.seed===WORLD_SEED?version:null;}
  catch{return null;}
})();
const legacyAlchemyOrigin=storedAlchemy?storedAlchemy.legacyOrigin:(()=>{
  for(const key of ["qc_world_state_v70","qc_world_state_v60"]){
    try{
      const old=JSON.parse(localStorage[key]||"null");
      if(old?.seed===WORLD_SEED)return Number.isFinite(old.player?.x)&&Number.isFinite(old.player?.z)?{x:old.player.x,z:old.player.z}:{x:spawn.x,z:spawn.z};
    }catch{}
  }
  return null;
})();
const alchemySitePositions={...storedAlchemy?.sites};
let alchemyWorldReady=false;
const alchemyWorld=QuimiCraftAlchemyWorld.create({
  B:BLOCK,seed:WORLD_SEED,hash,biomeAt,terrainHeight,culture:QuimiCraftRegions.culture,
  blocked:(x,z)=>labBoundsContains(x,z,LAB_PROTECTION_MARGIN+2)||inLabEntranceCorridor(x,z,2)||inLabVillagePath(x,z)||inVillage(x,z,3)||!!remoteSiteAt(x,z),
  hasEdits:worldStorage.hasBlockEdits,legacyOrigin:legacyAlchemyOrigin,spawn,waterLevel:WATER_LEVEL,sitePositions:alchemySitePositions
});
function alchemyColumnAt(x,z){return alchemyWorldReady?alchemyWorld.columnAt(x,z):null}
const labDoor=QuimiCraftLaboratoryDoor.create(THREE,LAB_LAYOUT);
let labDecorRoot=null,periodicWallRoot=null,labAtomRoot=null,labCryoCore=null;
const labRepairOverrides=new Map(),labCollisionBoxes=[],periodicCollisionBoxes=[],labStationZones=[],labPropPlacements=[];const labColliderIds=new Set(),periodicColliderIds=new Set();let labProtectToastAt=0;
const {labStructureBounds,inLabEntranceCorridor,labVillagePathSurface,inLabVillagePath,laboratoryColumnAt,laboratoryBlockAt}
  =QuimiCraftLaboratory.createWorld({LAB_LAYOUT,labDoor,labRepairOverrides,mods,key3,MAX_Y,BLOCK,LAB_ENTRANCE_LENGTH,LAB_PROTECTION_MARGIN,labBoundsContains});
function columnGenerationTop(x,z,naturalHeight){
  let top=Math.min(MAX_Y-1,Math.max(naturalHeight+15,editedColumnTops.get(x+','+z)??0));
  if(labBoundsContains(x,z,LAB_PROTECTION_MARGIN)||inLabEntranceCorridor(x,z,1))top=Math.max(top,Math.min(MAX_Y-1,LAB_LAYOUT.y+LAB_LAYOUT.height+2));
  const pathSurface=labVillagePathSurface(x,z);if(pathSurface!==null)top=Math.max(top,Math.min(MAX_Y-1,pathSurface+4));
  return top
}
function isLabProtectedBlock(x,y,z){const b=labStructureBounds(LAB_PROTECTION_MARGIN),pathSurface=labVillagePathSurface(x,z);return (((x>=b.left&&x<=b.right&&z>=b.front&&z<=b.rear)||inLabEntranceCorridor(x,z,1))&&y>=b.bottom&&y<=b.top)||(pathSurface!==null&&y>=0&&y<=pathSurface+4)}
function isLabPlacementRestricted(x,y,z){return isLabProtectedBlock(x,y,z)}
function makeCollisionBox(x,y,z,sx,sy,sz,ry=0){const c=Math.abs(Math.cos(ry)),sn=Math.abs(Math.sin(ry)),ex=(c*sx+sn*sz)/2,ez=(sn*sx+c*sz)/2;return {minX:x-ex,maxX:x+ex,minY:y-sy/2,maxY:y+sy/2,minZ:z-ez,maxZ:z+ez}}
function registerLabCollision(x,y,z,sx,sy,sz,ry=0,id=`lab:${x}:${y}:${z}:${sx}:${sy}:${sz}:${ry}`){if(labColliderIds.has(id))return false;labColliderIds.add(id);labCollisionBoxes.push({...makeCollisionBox(x,y,z,sx,sy,sz,ry),id});return true}
function registerPeriodicCollision(x,y,z,id=`periodic:${x}:${y}:${z}`){if(periodicColliderIds.has(id))return false;periodicColliderIds.add(id);periodicCollisionBoxes.push({...makeCollisionBox(x,y,z,BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE),id});return true}
function aabbHitsBoxes(boxes,minX,maxX,minY,maxY,minZ,maxZ){for(const b of boxes)if(maxX>b.minX&&minX<b.maxX&&maxY>b.minY&&minY<b.maxY&&maxZ>b.minZ&&minZ<b.maxZ)return true;return false}
function aabbHitsLabDecor(minX,maxX,minY,maxY,minZ,maxZ){return aabbHitsBoxes(labCollisionBoxes,minX,maxX,minY,maxY,minZ,maxZ)||aabbHitsBoxes(periodicCollisionBoxes,minX,maxX,minY,maxY,minZ,maxZ)}
function playerHitsLabDecor(pos,height=player.crouch?1.24:1.72){const r=.29;return aabbHitsLabDecor(pos.x-r,pos.x+r,pos.y+.02,pos.y+height-.02,pos.z-r,pos.z+r)}
function labDecorSupports(pos){const r=.24,feet=pos.y-.08;for(const boxes of [labCollisionBoxes,periodicCollisionBoxes])for(const b of boxes)if(pos.x+r>b.minX&&pos.x-r<b.maxX&&pos.z+r>b.minZ&&pos.z-r<b.maxZ&&Math.abs(feet-b.maxY)<.16)return true;return false}
function addLabStation(x,z,r=2.4,stationIds=["chemistry_workbench"],id=`station-${labStationZones.length}`){labStationZones.push({x,z,r,stationIds:[...stationIds],id})}
function nearestLabStation(){if(Math.abs(player.pos.y-LAB_LAYOUT.y)>3.5)return null;return labStationZones.map(zone=>({zone,distance:Math.hypot(player.pos.x-zone.x,player.pos.z-zone.z)})).filter(entry=>entry.distance<entry.zone.r).sort((a,b)=>a.distance-b.distance)[0]?.zone||null}
function nearLabStation(){return !!nearestLabStation()}
const player={pos:new THREE.Vector3(spawn.x+.5,spawn.y,spawn.z+.5),vel:new THREE.Vector3(),yaw:-.65,pitch:-.12,onGround:false,crouch:false,sprint:false,inWater:false,headUnderwater:false,inLava:false,step:0,lastGroundY:spawn.y,fallStart:spawn.y,health:100,mana:100,hunger:100,thirst:100,breath:100,attackCooldown:0,crossbowArmed:false,dragonSlow:0,petrified:0,lavaClock:0,survivalDamageClock:0,breathDamageClock:0};
const keys={},settings={preset:"high",render:horizon.presetRange.high,sense:.5,volume:.7,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:2},state={playing:false,started:false,startQueued:false,loading:false,awaitingEntry:false,inventory:false,chemistry:false,periodic:false,shop:false,character:false,chat:false,devOpen:false,graphics:false,history:false,professor:false,scientificNotebook:false,researchTree:false,scienceStation:false,paused:false,gamemode:"survival",selected:0,left:false,right:false,target:null,breakKey:"",breakTime:0,cameraMode:0,day:.23,dayCount:1,lastFrame:performance.now(),fps:60,frames:0,fpsTime:0};
const touchInput=matchMedia("(hover: none), (pointer: coarse)").matches;
state.attackAnim=0;state.offhandAnim=0;state.focusCooldown=0;state.combatTarget=null;state.combatTargetTime=0;
const isCreative=()=>state.gamemode==="creative";
let lastSpaceTapAt=0,creativeBreakCooldown=0;
function updateGamemodeHud(){
  const chip=$("gamemodeChip");
  if(!chip)return;
  const creative=isCreative();
  chip.hidden=!creative;
  if(creative){
    chip.classList.toggle("flying",dev.fly);
    chip.textContent=dev.fly?"CRIATIVO · Voando (Espaço×2 pousar)":"CRIATIVO · Espaço×2 voar";
  }
}
function setGamemode(mode){
  const next=mode==="creative"?"creative":"survival";
  const prev=state.gamemode;
  state.gamemode=next;
  if(next==="creative"){
    dev.fly=true;
    player.health=100;player.mana=100;player.hunger=100;player.thirst=100;
    player.breath=playerBreathMax();player.dragonSlow=0;playerVenom=null;
    gasExposure=0;gasBlackout=0;setPetrified(0);
    player.vel.set(0,0,0);player.fallStart=player.pos.y;
    for(const e of [...entities,...fishSchool]){
      if(e.ai?.engagement?.target===playerActor)QuimiCraftAI.disengage(e);
    }
  }else{
    dev.fly=false;
    player.vel.set(0,0,0);player.fallStart=player.pos.y;
  }
  updateVitals();updateGamemodeHud();if(state.devOpen)renderDev();
  if(initialReady)saveWorldState();
  const label=next==="creative"?"Criativo":"Sobrevivência";
  return {ok:true,msg:prev===next?`Você já está no modo ${label}.`:`Modo de jogo alterado para ${label}.`};
}
const dragonGuardPose={hold:0,lift:0,impact:0,sparks:null};
const mirrorGuardPose={hold:0,lift:0,impact:0,sparks:null};
const petrifiedMaterial=new THREE.MeshStandardMaterial({color:0x777a72,roughness:.98,flatShading:true});
const petrifiedSkin=petrifiedMaterial.clone();petrifiedSkin.skinning=true;
const petrifiedParts=new Map();
const dev={fly:false,speed:1,infinite:false,allRecipes:false};
let messageCenter=null,elementMissions=null,scienceSystem=null,scienceUI=null,scienceSnapshot=null,lastMissionBiome="",scienceHudClock=0,environmentScanClock=0,cachedEnvironmentHazards=null;
try{Object.assign(settings,JSON.parse(localStorage.qc_settings||"{}"))}catch(e){}if(settings.viewRevision!==2&&settings.preset!=="custom")settings.render=horizon.presetRange[settings.preset]||horizon.presetRange.high;
settings.viewRevision=2;
settings.render=horizon.normalizeRange(settings.render);
$("qualityPreset").value=settings.preset;$("renderDistance").value=settings.render;$("renderOut").value=settings.render+" chunks";$("shadowQuality").value=settings.shadows;$("aoQuality").value=settings.ao;$("waterQuality").value=settings.water;$("particleQuality").value=settings.particles;$("vegetationQuality").value=settings.vegetation;$("resolutionScale").value=settings.resolution;$("cloudToggle").checked=settings.clouds;$("mobDensity").value=settings.mobs;$("sensitivity").value=Math.round(settings.sense*100);$("volume").value=Math.round(settings.volume*100);

const skinMat=new THREE.MeshLambertMaterial({color:0xb87550}),skinLightMat=new THREE.MeshLambertMaterial({color:0xd79a73}),skinShadeMat=new THREE.MeshLambertMaterial({color:0x9e5d43}),sleeveMat=new THREE.MeshLambertMaterial({color:0x2f7c72}),coatMat=new THREE.MeshLambertMaterial({color:0xe7ece8}),coatShadeMat=new THREE.MeshLambertMaterial({color:0xbccbc5}),pantsMat=new THREE.MeshLambertMaterial({color:0x273e49}),hairMat=new THREE.MeshLambertMaterial({color:0x382921}),bootMat=new THREE.MeshLambertMaterial({color:0x20282b}),eyeMat=new THREE.MeshBasicMaterial({color:0x182024}),metalMat=new THREE.MeshStandardMaterial({color:0xc7d0d4,roughness:.28,metalness:.7,emissive:0x101416}),windMat=new THREE.MeshStandardMaterial({color:0x59ced9,roughness:.16,metalness:.22,emissive:0x19555c,emissiveIntensity:1.15}),leatherMat=new THREE.MeshLambertMaterial({color:0x8d5c36}),goldMat=new THREE.MeshStandardMaterial({color:0xd9b34f,roughness:.25,metalness:.72,emissive:0x302309}),woodLightMat=new THREE.MeshLambertMaterial({color:0xb77a42}),woodDarkMat=new THREE.MeshLambertMaterial({color:0x54341f}),brassMat=new THREE.MeshStandardMaterial({color:0xe1bd62,roughness:.22,metalness:.8}),stringMat=new THREE.MeshLambertMaterial({color:0xe8e1cf}),windGlassMat=new THREE.MeshStandardMaterial({color:0x90f7ff,roughness:.05,metalness:.08,emissive:0x1f7f8c,emissiveIntensity:1.65,transparent:true,opacity:.88});
const pSkinMat=skinMat.clone(),pSkinLightMat=skinLightMat.clone(),pSkinShadeMat=skinShadeMat.clone(),pSleeveMat=sleeveMat.clone(),pCoatMat=coatMat.clone(),pCoatShadeMat=coatShadeMat.clone(),pPantsMat=pantsMat.clone(),pHairMat=hairMat.clone();
const cubeGeo=new THREE.BoxGeometry(BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE),unitY=new THREE.Vector3(0,1,0);function part(parent,mat,pos,scale,rot=[0,0,0]){const m=new THREE.Mesh(cubeGeo,mat);m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);m.castShadow=settings.shadows>0;m.receiveShadow=settings.shadows>0;parent.add(m);return m}
function beam(parent,mat,a,b,width=.04,depth=width){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dir=bv.clone().sub(av),m=new THREE.Mesh(cubeGeo,mat);m.position.copy(av).add(bv).multiplyScalar(.5);m.scale.set(width,dir.length(),depth);m.quaternion.setFromUnitVectors(unitY,dir.normalize());m.castShadow=settings.shadows>0;m.receiveShadow=settings.shadows>0;parent.add(m);return m}
const playerModels=QuimiCraftModels.create(THREE,{
  blocks:BDEF,block:BLOCK,atlas,texFor,uvTile,itemColor:id=>itemColor(id),shadows:()=>settings.shadows>0,detailedBlockMiniature,produceMiniature:id=>blockModels.produce.has(id)?detailedBlockMiniature(id):null
});
const playerRig=playerModels.avatar({
  skin:pSkinMat,skinLight:pSkinLightMat,skinShade:pSkinShadeMat,sleeve:pSleeveMat,coat:pCoatMat,
  coatShade:pCoatShadeMat,pants:pPantsMat,hair:pHairMat,boot:bootMat
});
const {root:playerBody,first:firstHands,gear:equipmentVisualRoot,headGear,leftWrist,heldFirst,heldOffFirst,heldThird,chestFit,backFit}=playerRig;
const firstShield=new THREE.Group();firstShield.position.set(-.44,-.50,-.79);firstShield.rotation.set(-.21,.23,-.14);firstHands.add(firstShield);
const gloveFirst=new THREE.Group(),gloveThird=new THREE.Group();
gloveFirst.position.copy(heldFirst.position);
gloveFirst.scale.x=gloveThird.scale.x=-1;
heldOffFirst.parent.add(gloveFirst);leftWrist.parent.add(gloveThird);
const shieldDown=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI*.49);
const shieldWrist=new THREE.Quaternion(),shieldFront=new THREE.Quaternion(),shieldTilt=new THREE.Quaternion();
scene.add(camera,playerBody);
camera.add(firstHands);
const avatarViews=QuimiCraftAvatarPreview.create(THREE,playerBody,renderer);

let playerActivity=null,fishingActivity=null;
let heldId;
let heldLiquid;
let firstWeaponModel=null;
let thirdWeaponModel=null;
function weaponModel(id,first=false){
  const model=playerModels.item(id,first?"first":"third");
  playerModels.animateItem(model,0,0,1,false);
  return model;
}
function refreshHeldItem(){
  const slot=invSlots[state.selected];
  const id=vehicles.current()||riding?null:playerActivity?.prop??slot?.id,liquid=playerActivity?.liquid?.id??(playerActivity?null:slot?.liquid?.id);
  if(id===heldId&&liquid===heldLiquid)return;
  heldId=id;
  heldLiquid=liquid;
  heldFirst.clear();
  heldThird.clear();
  gloveFirst.clear();
  gloveThird.clear();
  firstWeaponModel=thirdWeaponModel=null;
  if(id==null)return;
  firstWeaponModel=playerModels.item(id,"first",playerActivity?.liquid??slot?.liquid);
  thirdWeaponModel=playerModels.item(id,"third",playerActivity?.liquid??slot?.liquid);
  heldFirst.add(firstWeaponModel);
  heldThird.add(thirdWeaponModel);
  if(QuimiCraftArsenal.weapons[id]?.family==="gauntlet"){
    gloveFirst.add(playerModels.item(id,"first"));
    gloveThird.add(playerModels.item(id,"third"));
  }
  if(player.petrified>0)updatePetrifiedAppearance();
}
function cameraClear(from,to){const steps=12;for(let i=2;i<=steps;i++){const p=from.clone().lerp(to,i/steps);if(solidAt(p.x,p.y,p.z))return from.clone().lerp(to,(i-2)/steps)}return to}
function updatePlayerCamera(dt,moving){
  const now=performance.now(),reducedMotion=document.documentElement.classList.contains("reduced-motion"),motionScale=reducedMotion ? .18 : 1,eye=new THREE.Vector3(player.pos.x,player.pos.y+(player.crouch?1.1:1.57),player.pos.z),dir=new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch));camera.fov=lerp(camera.fov,reducedMotion?73:player.sprint?82:73,1-Math.pow(.002,dt));camera.updateProjectionMatrix();playerBody.position.set(player.pos.x,player.pos.y-(player.crouch?.12:0),player.pos.z);playerBody.rotation.y=player.yaw;playerBody.visible=state.started&&state.cameraMode!==0;firstHands.visible=state.started&&state.cameraMode===0;
  const ride=vehicles.current();
  if(riding){
    const mount=riding.actor,anchor=eye.clone().add(new THREE.Vector3(0,.42,0));
    const dragon=DRAGONS[mount.type],distance=dragon?5.55+dragon.scale*1.15:8.1;
    playerBody.visible=state.started;firstHands.visible=false;playerBody.rotation.y=mount.angle+Math.PI;
    const trailing=new THREE.Vector3(Math.sin(player.yaw),.30+Math.sin(player.pitch)*.24,Math.cos(player.yaw));
    camera.position.copy(cameraClear(anchor,anchor.clone().addScaledVector(trailing,distance)));
    camera.lookAt(anchor.clone().addScaledVector(dir,dragon?3.2:2.6));
  }else if(ride){
    playerBody.visible=state.started;
    firstHands.visible=false;
    playerBody.rotation.y=ride.yaw;
    playerBody.position.y+=ride.renderY-ride.y;
    playerBody.position.x+=Math.sin(ride.yaw)*.36;
    playerBody.position.z+=Math.cos(ride.yaw)*.36;
    const boat=QuimiCraftVehicles.isBoat(ride.kind);
    const anchor=new THREE.Vector3(ride.x,ride.renderY+(ride.kind==="ship"?1.66:1.2),ride.z);
    const follow=new THREE.Vector3(Math.sin(player.yaw),.37,Math.cos(player.yaw));
    const distance=boat?3.2+QuimiCraftVehicles.types[ride.kind].halfZ*.91:ride.kind==="glider"?5.6:3.85;
    const desired=anchor.clone().addScaledVector(follow,distance);
    desired.y+=Math.sin(player.pitch)*2.0;
    if(state.cabinCamera&&ride.rig.cockpitView){
      playerBody.visible=false;
      ride.rig.cockpitView.getWorldPosition(camera.position);
      camera.lookAt(camera.position.clone().add(dir));
    }else{
      camera.position.copy(cameraClear(anchor,desired));
      const focus=anchor.clone().addScaledVector(dir,ride.kind==="glider"?3.3:2.1);
      camera.lookAt(focus);
    }
  }else if(state.cameraMode===0){camera.position.copy(eye);camera.rotation.set(player.pitch,player.yaw,0)}else{const front=state.cameraMode===2,desired=eye.clone().addScaledVector(dir,front?4.2:-4.2);desired.y+=.65;camera.position.copy(cameraClear(eye,desired));camera.lookAt(eye.clone().add(new THREE.Vector3(0,.05,0)))}
  if(gasExposure>.24&&!reducedMotion){
    const dizzy=(gasExposure-.24)*.105;
    camera.rotateZ(Math.sin(now*.004)*dizzy);
    camera.rotateX(Math.cos(now*.0033)*dizzy*.63);
  }
  if(gasBlackout>0&&state.cameraMode===0)camera.position.y-=.42;
state.attackAnim=Math.max(0,state.attackAnim-dt);
  state.offhandAnim=Math.max(0,state.offhandAnim-dt);
  const offhandAction=Math.sin(state.offhandAnim/.4*Math.PI);
  const hit=state.attackAnim>0?Math.sin((1-state.attackAnim/.3)*Math.PI):0;
  const work=state.left&&state.breakTime>0?(.44+.4*Math.sin(now*.016))*motionScale:0;
  const action=Math.max(hit,work);
  const dragonShield=equipped.offhand?.id==="shield_dragon"&&equipmentDefinition("offhand");
  const mirrorShield=equipped.offhand?.id==="shield_mirror"&&equipmentDefinition("offhand");
  for(const [pose,enabled] of [[dragonGuardPose,dragonShield],[mirrorGuardPose,mirrorShield]]){
    pose.hold=Math.max(0,pose.hold-dt);pose.impact=Math.max(0,pose.impact-dt);
    pose.lift=lerp(pose.lift,enabled&&pose.hold>0?1:0,1-Math.exp(-dt*(pose.hold>0?40:11)));
    if(!enabled)pose.sparks=null;
  }
  const guard=dragonShield?dragonGuardPose:mirrorShield?mirrorGuardPose:null;
  const shieldLift=guard?.lift??0,recoil=guard?shieldLift*(guard.impact/.18)**2*(reducedMotion?.38:1):0;
  const activeOffhand=!!equipmentDefinition("offhand")&&!riding&&!ride;
  firstShield.visible=heldOffFirst.visible=activeOffhand;
  leftWrist.visible=activeOffhand||shieldLift>.05;
  playerRig.animate({dt:player.petrified>0?0:dt,now,motion:player.petrified>0?0:motionScale,moving,sprint:player.sprint,crouch:player.crouch,offhand:activeOffhand,offhandAction,shieldLift,shieldRecoil:recoil,
    swim:player.inWater,airborne:!player.onGround&&state.playing,pitch:player.pitch,action,firstType:heldId,punchHand:player.punchHand,
    activity:riding||ride?{kind:"ride",pedaling:ride?.pedaling}:playerActivity?{kind:playerActivity.kind,phase:clamp(1-playerActivity.left/playerActivity.life,0,1)}:fishingActivity,aspect:camera.aspect});
  if(guard)poseGuardShield(guard,shieldLift,recoil);
  const family=QuimiCraftArsenal.weapons[heldId]?.family;
  const hasArrow=family==="crossbow"?player.crossbowArmed&&player.attackCooldown<=0:
    family!=="bow"||dev.infinite||isCreative()||countItem("arrow")+countItem("venom_arrow")>0;
  const itemMotion=family==="gauntlet"&&settings.particles===0?0:motionScale;
  playerModels.animateItem(firstWeaponModel,now,hit,itemMotion,hasArrow);
  playerModels.animateItem(thirdWeaponModel,now,hit,itemMotion,hasArrow);
  playerModels.animateItem(gloveFirst.children[0],now,hit,itemMotion);
  playerModels.animateItem(gloveThird.children[0],now,hit,itemMotion);
  if(activeOffhand&&QuimiCraftArsenal.focuses[equipped.offhand?.id]){
    playerModels.animateItem(heldOffFirst.children[0],now,offhandAction,motionScale);
    playerModels.animateItem(leftWrist.children[0],now,offhandAction,motionScale);
  }
  if(playerActivity?.kind==="reel")for(const model of [firstWeaponModel,thirdWeaponModel]){
    if(model?.userData.reel)model.userData.reel.rotation.y=now*.019*motionScale;
  }
}
function poseGuardShield(guard,lift,recoil){
  firstShield.position.set(lerp(-.44,-.18,lift)-recoil*.032,lerp(-.50,-.17,lift)-recoil*.04,lerp(-.79,-.81,lift)+recoil*.14);
  firstShield.rotation.set(lerp(-.21,.045,lift)-recoil*.19,lerp(.23,-.045,lift),lerp(-.14,.09,lift)+recoil*.09);
  const worn=leftWrist.children[0];
  if(worn){
    worn.position.set(lerp(-.17,.022,lift),lerp(.065,.104,lift),lerp(-.083,-.135,lift));
    leftWrist.getWorldQuaternion(shieldWrist);
    playerBody.getWorldQuaternion(shieldFront);
    shieldTilt.setFromEuler(new THREE.Euler(.08-recoil*.24,-.09,.12));
    shieldWrist.invert().multiply(shieldFront).multiply(shieldTilt);
    worn.quaternion.copy(shieldDown).slerp(shieldWrist,lift);
  }
  const impact=guard.sparks;
  if(impact){
    guard.sparks=null;
    const shield=guardShieldMesh();
    if(shield){
      shield.updateWorldMatrix(true,false);
      const point=shield.localToWorld(new THREE.Vector3(0,.045,impact==="mirror"?-.085:-.26));
      const normal=new THREE.Vector3(0,0,-1).transformDirection(shield.matrixWorld);
      frontierFx.dragonShield(impact,point,normal);
    }
  }
}
function guardShieldMesh(){
  return firstHands.visible?firstShield.children[0]:leftWrist.children[0];
}
function cycleCamera(){if(riding)return;const ride=vehicles.current();if(ride){
    state.cabinCamera=!state.cabinCamera;
    return toast(state.cabinCamera?"Câmera na cabine":"Câmera externa");
  }state.cameraMode=(state.cameraMode+1)%3;const names=["1ª PESSOA · MÃOS","3ª PESSOA · COSTAS","3ª PESSOA · FRENTE"];$("viewChip").textContent=`C · ${names[state.cameraMode]}`;toast(`Câmera: ${names[state.cameraMode]}`)}

const CHARACTER_OPTIONS={skin:["#f1c7a6","#d99a73","#b87550","#986044","#754532","#4e3026"],hair:["#17181b","#382921","#6d432d","#a86b3d","#d0aa70","#6a2f38","#31596c","#dad9d0"],coat:["#e7ece8","#2f7c72","#446b94","#7a526f","#9b6548","#4c5c45","#d1b052","#3b3e49"],accent:["#2f7c72","#56a4a8","#b66d4f","#8d6bb1","#c49c48","#55774d","#bf5262","#e5e7e2"],pants:["#273e49","#20242d","#4e443a","#344d41","#4a3a56","#5c6670"],hairStyle:["Curto","Longo","Coque","Moicano","Crespo","Tranças","Rente","Chanel","Rabo de cavalo","Repartido","Afro","Locs","Raspado"],silhouette:["Masculina","Feminina"],badge:["Expedição","Laboratório","Trilha","Prisma"],outfit:["Uniforme","Colete de campo","Avental","Lenço nômade","Manto alquímico","Jaqueta de trilha"],beard:["Sem barba","Bigode","Por fazer","Cavanhaque","Cheia","Trançada"],shoes:["Botinas","Tênis","Botas de trilha","Sapatos sociais","Sandálias"]};
let characterStyle={skin:2,hair:1,coat:0,accent:0,pants:0,hairStyle:0,silhouette:0,badge:0,outfit:0,beard:0,shoes:0},equipmentReady=false;try{Object.assign(characterStyle,JSON.parse(localStorage.qc_character||"{}"))}catch(e){}
function shadeColor(hex,light){const c=new THREE.Color(hex);c.offsetHSL(0,light>0?.015:0,light);return c}
function applyCharacterStyle(nextStyle=characterStyle){characterStyle={...characterStyle,...nextStyle};applyCharacterStyleBase();playerRig.setAppearance(characterStyle);if(equipmentReady)applyEquipmentVisuals();else syncInventoryAvatar()}
const characterCustomizer=window.QuimiCharacterCustomizer.createCharacterCustomizer({options:CHARACTER_OPTIONS,initialStyle:characterStyle,controlsElement:$("customGroups"),previewElement:$("avatarPreview"),onChange:applyCharacterStyle});
function renderCharacter(){characterCustomizer.render();paintAvatarViews()}
function openCharacter(){state.character=true;state.playing=false;$("character").classList.add("open");document.exitPointerLock?.();renderCharacter()}
function closeCharacter(){state.character=false;$("character").classList.remove("open");if(state.started)requestPointer()}

function collides(pos,height=player.crouch?1.24:1.72){
  const r=.29,minY=pos.y+.02,maxY=pos.y+height-.02;
  if(voxelBodyBlocked(pos.x-r,pos.x+r,minY,maxY,pos.z-r,pos.z+r))return true;
  return vehicles.blocksPlayer(pos,height)||playerHitsLabDecor(pos,height)||labDoor.hits(pos.x-r,pos.x+r,pos.y+.02,pos.y+height-.02,pos.z-r,pos.z+r);
}
const barrierHeight=1.72;
function hoodUpperPart(x,y,z){
  const segment=fieldLab.byBlock.get(getBlock(x,y,z));
  return segment?.unit.id==="fume_hood"?segment:null;
}
function voxelBodyBlocked(minX,maxX,low,top,minZ,maxZ){
  for(let x=Math.floor(minX);x<=Math.floor(maxX);x++)for(let z=Math.floor(minZ);z<=Math.floor(maxZ);z++){
    for(let y=Math.floor(low);y<=Math.floor(top);y++){
      if(!solidAt(x,y,z))continue;
      if(low<y+(BDEF[getBlock(x,y,z)]?.collisionTop??1))return true;
    }
    const below=Math.floor(low)-1;
    if(low<below+barrierHeight&&BDEF[getBlock(x,below,z)]?.barrier)return true;
    for(let y=Math.floor(low)-3;y<=Math.floor(top)-2;y++){
      if(top<=y+2.50||low>=y+3.79)continue;
      if(hoodUpperPart(x,y,z))return true;
    }
  }
  return false;
}
function supportedAt(pos){
  const r=.24;
  return voxelBodyBlocked(pos.x-r,pos.x+r,pos.y-.075,pos.y-.027,pos.z-r,pos.z+r)||vehicles.supportsPlayer(pos)||labDecorSupports(pos);
}
function moveAxis(axis,delta){if(!delta)return;const before=player.pos[axis],test=player.pos.clone();test[axis]+=delta;if(!collides(test)){if(player.crouch&&player.onGround&&(axis==="x"||axis==="z")&&!supportedAt(test))return;player.pos.copy(test);return}let lo=0,hi=1;for(let i=0;i<7;i++){const m=(lo+hi)/2,test2=player.pos.clone();test2[axis]=before+delta*m;if(collides(test2))hi=m;else lo=m}player.pos[axis]=before+delta*lo;if(axis==="y"){if(delta<0){player.onGround=true;const fall=player.fallStart-player.pos.y;if(fall>5.2&&!player.inWater){damagePlayer(Math.floor((fall-4.6)*4),"queda");dustBurst(player.pos.clone(),Math.min(18,Math.floor(fall*1.5)));sound("land",Math.min(1,fall/12));wakeNearbyScreamers(player.pos,9)}player.fallStart=player.pos.y}else player.fallStart=player.pos.y;player.vel.y=0}}
function waterColumnSurface(x,y,z,maxY=MAX_Y-1){
  const bx=Math.floor(x),bz=Math.floor(z);
  let top=Math.floor(y);
  while(top<maxY&&getBlock(bx,top+1,bz)===BLOCK.WATER)top++;
  return top+liquidSurfaceHeight(BLOCK.WATER,x,top,z);
}
function waterSurfaceAt(x,z){
  const bx=Math.floor(x),bz=Math.floor(z),feet=Math.floor(player.pos.y);
  for(let yy=Math.min(MAX_Y-2,feet+3);yy>=Math.max(0,feet-3);yy--){
    if(getBlock(bx,yy,bz)===BLOCK.WATER)return waterColumnSurface(x,yy,z,Math.min(MAX_Y-2,yy+18));
  }
  return -Infinity
}
function isWaterAt(x,y,z){return liquidContains(BLOCK.WATER,x,y,z)}
function isInWater(){return isWaterAt(player.pos.x,player.pos.y+.12,player.pos.z)||isWaterAt(player.pos.x,player.pos.y+.9,player.pos.z)}
function isHeadUnderwater(){return isWaterAt(player.pos.x,player.pos.y+(player.crouch?1.1:1.57),player.pos.z)}
function isCameraUnderwater(){return isWaterAt(camera.position.x,camera.position.y,camera.position.z)}
function isInLava(){return liquidContains(BLOCK.LAVA,player.pos.x,player.pos.y+.12,player.pos.z)}
function currentWeather(){
  if(climateState.elapsed<state.bedClearUntil)return "clear";
  if(climateState.override)return climateState.override;
  const biome=biomeAt(player.pos.x,player.pos.z),season=currentSeason(),period=Math.floor(climateState.elapsed/85),roll=hash(period+WORLD_SEED%997,Math.floor(player.pos.x/128),Math.floor(player.pos.z/128));
  const cold=season===3||["tundra","taiga","prado alpino","fiordes glaciais"].includes(biome);
  const wet=["floresta","pântano","selva tropical","planície florida","taiga","manguezal","floresta de sequoias"].includes(biome);
  if(roll>.88&&(!["deserto","badlands","vulcânico"].includes(biome)))return cold?"snow":"storm";
  if(roll>(wet?.43:.64))return cold?"snow":"rain";
  return"clear"
}
const gasClouds=new Map();
let gasExposure=0,gasBlackout=0,gasVisualClock=0,fieldAir=0,fieldAirClock=0,fieldWind=0,gustClock=0;
function airPasses(x,y,z){
  const id=getBlock(x,y,z);
  return id===BLOCK.AIR||id===BLOCK.DOOR_OPEN||id===BLOCK.SPECTRAL||windPermeableLeaves.has(id)||!!BDEF[id]?.plant;
}
function skyForWind(x,y,z){
  const roof=roofAt(x,z);
  for(let py=y;py<=roof;py++)if(!airPasses(x,py,z))return false;
  return true;
}
function windAngle(){return (state.dayCount*.37+state.day*.54)*TAU}
function localWind(origin){
  const storm=currentWeather()!=="clear";
  const strength=clamp(.32+hash(Math.floor(state.dayCount),Math.floor(origin.x/40),Math.floor(origin.z/40))*.55+(storm?.16:0),0,1);
  return fieldLab.ventilation(origin,airPasses,skyForWind,windAngle(),strength);
}
function fieldIntact(site){return site.cells.every(cell=>getBlock(cell.x,cell.y,cell.z)===cell.id)}
function fieldOutlet(site){
  const cell=site.cells[Math.floor(site.unit.length/2)];
  return {x:cell.x+.5,y:cell.y+1.4,z:cell.z+.5};
}
function hoodExhaustOpen(site){
  return fieldIntact(site)&&site.cells.every(({x,y,z})=>airPasses(x,y+3,z)&&airPasses(x,y+4,z));
}
function hoodNear(origin){
  const x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);
  for(let dy=-2;dy<=0;dy++)for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){
    const vx=x+dx,vy=y+dy,vz=z+dz,id=getBlock(vx,vy,vz),segment=fieldLab.byBlock.get(id);
    if(segment?.unit.id!=="fume_hood"||segment.x===3||Math.hypot(dx,dz)>4.2)continue;
    const intake={x:vx+.5,y:vy+2.43,z:vz+.5};
    if(fieldLab.airLink(origin,intake,airPasses)&&hoodExhaustOpen(fieldLab.locate({x:vx,y:vy,z:vz,id})))return true;
  }
  return false;
}
function fieldInfo(site){
  const outlet=fieldOutlet(site);
  if(site.unit.id==="fume_hood"){
    const used=site.cells.filter((cell,i)=>i%site.unit.length<3&&getBlock(cell.x,cell.y+1,cell.z)!==BLOCK.AIR).length;
    return `${hoodExhaustOpen(site)?"Exaustor ativo":"Exaustor obstruído · libere a saída por cima"} · ${used}/6 espaços ocupados.`;
  }
  return `Ventilação ${Math.round(localWind(outlet)*100)}% · ${hoodNear(outlet)?"Capela ao alcance":"Sem capela ao alcance"}`;
}
function releaseFieldGas(site,amount){
  const pos=fieldOutlet(site),id=key3(pos.x,pos.y,pos.z);
  const cloud=gasClouds.get(id)??{pos,amount:0,clock:0,vent:0,hood:false};
  cloud.amount=Math.min(200,cloud.amount+amount);cloud.clock=0;
  gasClouds.set(id,cloud);
}
function updateFieldAir(dt){
  const head={x:player.pos.x,y:player.pos.y+(player.crouch?1.15:1.54),z:player.pos.z};
  let concentration=0;
  gasVisualClock-=dt;fieldAirClock-=dt;
  if(fieldAirClock<=0){
    fieldAirClock=.7;
    fieldWind=localWind(head);
    $("windStatus").textContent=fieldWind<.12?"Ar parado":`Vento ${Math.round(fieldWind*100)}%`;
  }
  for(const [id,cloud] of gasClouds){
    cloud.clock-=dt;
    if(cloud.clock<=0){
      cloud.clock=.72;
      cloud.vent=localWind(cloud.pos);
      cloud.hood=hoodNear(cloud.pos);
    }
    cloud.amount-=dt*(.95+cloud.vent*39+(cloud.hood?82:0));
    if(cloud.amount<=0){gasClouds.delete(id);continue}
    const distance=Math.hypot(head.x-cloud.pos.x,head.y-cloud.pos.y,head.z-cloud.pos.z);
    if(distance<6&&!cloud.hood&&fieldLab.airLink(cloud.pos,head,airPasses)){
      concentration+=cloud.amount*(1-distance/6)*(1-cloud.vent*.86);
    }
    if(gasVisualClock<=0&&distance<16&&!cloud.hood){
      combatParticles(new THREE.Vector3(cloud.pos.x,cloud.pos.y,cloud.pos.z),0xb6c575,3,"vapor");
    }
  }
  if(gasVisualClock<=0)gasVisualClock=.43;
  gustClock-=dt;
  if(gustClock<=0&&fieldWind>.55&&settings.particles>0){
    gustClock=.44;
    const [dx,dz]=[Math.cos(windAngle()),Math.sin(windAngle())],range=2+fieldWind*2;
    const at=new THREE.Vector3(head.x-dx*2+(Math.random()-.5)*7,head.y+(Math.random()-.5)*3,head.z-dz*2+(Math.random()-.5)*7);
    const end=at.clone().add(new THREE.Vector3(dx*range,0,dz*range));
    if(fieldLab.airLink(at,end,airPasses))windMote(at,dx,dz,fieldWind);
  }
  const respirator=scienceSnapshot?.protections?.protection?.toxicity||0;
  fieldAir=labSafe()||dev.fly||isCreative()?0:clamp(concentration,0,100);
  gasBlackout=Math.max(0,gasBlackout-dt);
  gasExposure=clamp(gasExposure+dt*(fieldAir*(1-respirator)*.009-.11),0,1);
  if(gasExposure>=1&&!gasBlackout){
    gasBlackout=3.15;gasExposure=.25;
    if(riding)leaveMount(true);
    if(vehicles.current())leaveVehicle(true);
    toast("Você desmaiou por inalar vapores.");
  }
  const dizzy=gasExposure>.24;
  const overlay=$("gasOverlay");
  overlay.classList.toggle("dizzy",dizzy);
  overlay.classList.toggle("fainted",gasBlackout>0);
  $("gasStatus").hidden=!dizzy&&!gasBlackout;
  if(dizzy||gasBlackout)$("gasStatus").textContent=gasBlackout?"DESMAIO":"TONTURA";
}
function scanEnvironmentHazards(){
  const px=Math.floor(player.pos.x),py=Math.floor(player.pos.y),pz=Math.floor(player.pos.z),biome=biomeAt(px,pz),surface=terrainHeight(px,pz)+1,undergroundDepth=Math.max(0,surface-player.pos.y),counts={lava:0,sulfur:0,coal:0,furnace:0,crystal:0,amethyst:0,mud:0,peat:0,torch:0};
  for(let x=px-4;x<=px+4;x+=2)for(let y=Math.max(1,py-3);y<=Math.min(MAX_Y-1,py+3);y+=2)for(let z=pz-4;z<=pz+4;z+=2){const id=getBlock(x,y,z);if(id===BLOCK.LAVA)counts.lava++;else if(id===BLOCK.SULFUR)counts.sulfur++;else if(id===BLOCK.COAL)counts.coal++;else if(id===BLOCK.FURNACE)counts.furnace++;else if(id===BLOCK.CRYSTAL)counts.crystal++;else if(id===BLOCK.AMETHYST)counts.amethyst++;else if(id===BLOCK.MUD)counts.mud++;else if(id===BLOCK.PEAT)counts.peat++;else if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL)counts.torch++}
  const meteorX=190+Math.floor(hash(WORLD_SEED,31)*130),meteorZ=-180-Math.floor(hash(WORLD_SEED,67)*120),meteorDistance=Math.hypot(player.pos.x-meteorX,player.pos.z-meteorZ),caveGas=undergroundDepth>6?clamp(12+counts.sulfur*13+counts.coal*2+(biome==="vulcânico"?28:0),0,92):0,smoke=clamp(counts.lava*10+counts.furnace*7+counts.torch*2,0,86),industrialWater=biome==="badlands"&&Math.hypot(px-220,pz+165)<46,waterProfile=scienceSystem?.waterProfileFor({biome,hot:counts.lava>1,alkaline:biome==="badlands"&&!industrialWater,industrial:industrialWater,...regionalWater(px,pz).chem})||{id:"fresh",temperature:18,contamination:0};
  const sheltered=roofAt(px,pz)>player.pos.y+1.1,safe=labSafe();
  const weather=sheltered?"clear":currentWeather(),wind=localWind({x:player.pos.x,y:player.pos.y+1.35,z:player.pos.z});
  return{
    biome,undergroundDepth,weather,wind,waterProfile,sheltered,safe,
    nearFire:clamp((counts.torch+counts.furnace*2)/8,0,1),nearLava:clamp(counts.lava/5,0,1),hotStation:nearLabStation()&&nearestLabStation()?.stationIds.some(id=>["bunsen_burner","laboratory_furnace","chemical_reactor"].includes(id)) ? .35 : 0,
    hazards:{
      toxicity:caveGas,
      radiation:clamp((counts.crystal*3+counts.amethyst*5)+(meteorDistance<20?(20-meteorDistance)*4:0),0,100),
      corrosion:clamp((player.inWater&&["vulcânico","badlands"].includes(biome)?48:0)+counts.sulfur*5,0,100),
      air:clamp(caveGas*.62+smoke*.42,0,100),
      biological:clamp((player.inWater?waterProfile.contamination:0)+counts.mud*5+counts.peat*6,0,100),
      smoke
    }
  }
}
function updateScienceEnvironment(dt,moving){
  environmentScanClock-=dt;if(environmentScanClock<=0||!cachedEnvironmentHazards||cachedEnvironmentHazards.safe!==labSafe()){environmentScanClock=.55;cachedEnvironmentHazards=scanEnvironmentHazards()}
  const env=cachedEnvironmentHazards,hazards={...env.hazards,toxicity:env.hazards.toxicity+fieldAir,air:env.hazards.air+fieldAir*.55};
  scienceSnapshot=scienceSystem?.updateEnvironment(dt,{...env,safe:env.safe||isCreative(),hazards,alchemyWarmth:alchemyProgress.activeEffect("warmth"),day:state.day,inWater:player.inWater,waterTemperature:env.waterProfile.temperature,activity:player.sprint&&moving?1.7:moving?.55:0},equippedItemIds())||scienceSnapshot;
  scienceHudClock-=dt;if(scienceHudClock<=0){scienceHudClock=.18;scienceUI?.updateHUD(scienceSnapshot)}
  return scienceSnapshot
}
function waterCurrentAt(x,z,atY=player.pos.y+.12){
  const bx=Math.floor(x),y=Math.floor(atY),bz=Math.floor(z),key=key3(bx,y,bz);
  if(fluidLevels.has(key)){
    const level=cellFluidLevel(BLOCK.WATER,bx,y,bz),current={x:0,z:0};
    for(const [dx,,dz] of fluidSides){
      if(getBlock(bx+dx,y,bz+dz)!==BLOCK.WATER)continue;
      const next=cellFluidLevel(BLOCK.WATER,bx+dx,y,bz+dz);
      const drop=next===fluidFlow.falling?2.6:Math.max(0,level-next)*.68;
      current.x+=dx*drop;current.z+=dz*drop;
    }
    return current;
  }
  const angle=hash(Math.floor(x/24),Math.floor(z/24),WORLD_SEED%991)*TAU,strength=.16+hash(Math.floor(x/38),Math.floor(z/38),71)*.34;
  return {x:Math.cos(angle)*strength,z:Math.sin(angle)*strength};
}
function updatePhysics(dt){
  if(updateSleep(dt))return;
  if(player.petrified>0){
    player.petrified=Math.max(0,player.petrified-dt);
    if(!player.petrified)setPetrified(0);
  }
  const focusReady=state.focusCooldown>0;
  state.focusCooldown=Math.max(0,state.focusCooldown-dt);
  if(focusReady&&!state.focusCooldown&&!riding&&!vehicles.current())updateCombatHint();
  if(riding)return updateMountPhysics(dt);
  if(vehicles.current())return updateVehiclePhysics(dt);
  const reloading=player.crossbowArmed&&player.attackCooldown>0;
  player.attackCooldown=Math.max(0,player.attackCooldown-dt);player.dragonSlow=Math.max(0,player.dragonSlow-dt);
  if(reloading&&!player.attackCooldown&&selectedItem()==="crossbow")updateCrossbowHint();
  const wasInWater=player.inWater,wasHeadUnderwater=player.headUnderwater;player.inWater=isInWater();player.crouch=!dev.fly&&!player.inWater&&!!keys.ShiftLeft;player.sprint=!!(keys.ControlLeft||keys.ControlRight)&&!player.crouch&&!player.inWater;player.headUnderwater=isHeadUnderwater();player.mana=Math.min(100,player.mana+dt*(player.inWater?5:9)*(countItem("prism_pendant")?1.28:1)*(1+equipmentStat("manaRegen")));player.inLava=isInLava();player.lavaClock=Math.max(0,player.lavaClock-dt);if(player.inLava&&player.lavaClock<=0){player.lavaClock=.62;damagePlayer(8,"lava")}
  const immobilized=player.petrified>0||gasBlackout>0;
  const fwd=immobilized?0:Number(!!keys.KeyW)-Number(!!keys.KeyS),side=immobilized?0:Number(!!keys.KeyD)-Number(!!keys.KeyA),moving=Math.abs(fwd)+Math.abs(side)>.001;updateScienceEnvironment(dt,moving);updateSurvival(dt,moving);updateBreath(dt,moving);const len=Math.hypot(fwd,side)||1,survivalSlow=(player.hunger<=15||player.thirst<=15)?.72:1,waterGear=scienceSnapshot?.modifiers?.waterSpeed||1,scienceMove=scienceSnapshot?.modifiers?.movement||1,speed=(dev.fly?(player.sprint?11:6):player.inLava?1.55:player.inWater?2.75*waterGear:player.crouch?2.1:player.sprint?7.2:4.4)*dev.speed*survivalSlow*scienceMove*(player.dragonSlow>0&&!dev.fly?.66:1),sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);let dx=(side*cy-fwd*sy)/len*speed*dt,dz=(-side*sy-fwd*cy)/len*speed*dt;
  if(player.folkloreWind&&!immobilized){
    dx+=player.folkloreWind.x*dt;dz+=player.folkloreWind.z*dt;
    player.folkloreWind.multiplyScalar(Math.exp(-4.5*dt));
    if(player.folkloreWind.lengthSq()<.025)player.folkloreWind=null;
  }
  if(!dev.fly&&player.inWater&&!immobilized){const current=waterCurrentAt(player.pos.x,player.pos.z),currentResistance=clamp((scienceSnapshot?.protections?.protection?.pressure||0)*.35,0,.3);dx+=current.x*dt*(1-currentResistance);dz+=current.z*dt*(1-currentResistance)}
  forwardChunks=horizon.movementDirection(dx,dz);
  if(dev.fly){
    player.vel.set(0,0,0);player.fallStart=player.pos.y;
    const dy=((keys.Space?1:0)-(keys.ShiftLeft?1:0))*speed*dt;
    if(isCreative()&&!collides(player.pos)){
      moveAxis("x",dx);moveAxis("z",dz);
      player.onGround=false;
      moveAxis("y",dy);
      if(dy<0&&player.onGround){dev.fly=false;updateGamemodeHud()}
    }else{
      player.pos.x+=dx;player.pos.z+=dz;player.pos.y=Math.max(1.5,player.pos.y+dy);
      player.onGround=false;
    }
    updatePlayerCamera(dt,Math.abs(dx)+Math.abs(dz)>.001);updateVitals();return
  }
  player.onGround=supportedAt(player.pos);const oldX=player.pos.x,oldZ=player.pos.z;moveAxis("x",dx);moveAxis("z",dz);
  const shoreBlocked=player.inWater&&moving&&Math.hypot(player.pos.x-oldX-dx,player.pos.z-oldZ-dz)>.03;
  if(shoreBlocked&&keys.Space&&player.pos.y>waterSurfaceAt(player.pos.x,player.pos.z)-2.2){
    const candidate=player.pos.clone();candidate.y+=.85;
    if(!collides(candidate)){player.pos.copy(candidate);moveAxis("x",dx*.8);moveAxis("z",dz*.8);player.vel.y=Math.max(player.vel.y,4.7);player.swimExitBoost=.45}
    else player.swimExitBoost=.45;
  }
  player.swimExitBoost=Math.max(0,(player.swimExitBoost||0)-dt);
  if(player.inWater){const surface=waterSurfaceAt(player.pos.x,player.pos.z),depth=Math.max(0,surface-player.pos.y),submersion=clamp(depth/1.72,0,1),lookSwim=fwd*Math.sin(player.pitch)*3.15,manual=immobilized?0:(keys.Space?4.85:0)-(keys.ShiftLeft?2.8:0),buoyancy=(submersion-.52)*2.15,targetY=clamp(lookSwim+manual+buoyancy,-3.2,5.4),blend=1-Math.exp(-5.8*dt);player.vel.y=player.swimExitBoost>0?Math.max(player.vel.y,5.0):lerp(player.vel.y,targetY,blend);player.fallStart=player.pos.y;player.pressureDamageClock=Math.max(0,(player.pressureDamageClock||0)-dt);const pressureProtection=scienceSnapshot?.protections?.protection?.pressure||0,effectiveDepth=depth*(1-pressureProtection);if(effectiveDepth>7&&player.pressureDamageClock<=0){player.pressureDamageClock=2.6;damagePlayer(Math.ceil((effectiveDepth-5)/3),"pressão da água","pressure");if(isEquipped("depth_gauge"))toast(`Profundidade ${depth.toFixed(1)} m · pressão ${Math.round(effectiveDepth/7*100)}%`)}}else{player.vel.y-=18.5*dt;player.vel.y=Math.max(player.vel.y,-28)}player.onGround=false;moveAxis("y",player.vel.y*dt);
  if((Math.abs(dx)+Math.abs(dz))>.001&&(player.onGround||player.inWater)){player.step+=dt*speed;if(player.step>.42){player.step=0;sound(player.inWater?"splash":"step",.34);if(!player.crouch)wakeNearbyScreamers(player.pos,player.sprint?7:3.4)}}
  if(!player.onGround&&player.vel.y<-.2&&!player.inWater)player.fallStart=Math.max(player.fallStart,player.pos.y-player.vel.y*.02);
  if(player.inWater!==wasInWater){sound("splash",.72);const splashY=waterSurfaceAt(player.pos.x,player.pos.z);if(Number.isFinite(splashY))dustBurst(new THREE.Vector3(player.pos.x,splashY,player.pos.z),5);player.fallStart=player.pos.y}if(wasHeadUnderwater&&!player.headUnderwater)sound("splash",.35);
  updatePlayerCamera(dt,Math.abs(dx)+Math.abs(dz)>.001);updateVitals();
}
let fieldwork={step:0,sample:null};
try {
  const saved=JSON.parse(localStorage.qc_fieldwork_v73||"null");
  if(saved&&[1,2,3,4].includes(saved.step))fieldwork=saved;
} catch {}

const fieldworkInstructions=[
  "", "Mire ardósia, mármore ou pedra no caminho ou no laboratório. Pressione G ou toque em Coletar.",
  "Entre no laboratório e abra a bancada analítica à esquerda. Selecione a amostra e faça a análise.",
  "Abra o Caderno Científico, selecione Observações e registre uma propriedade medida e o que ela indica.",
  "Prática concluída. Seu registro está no Caderno Científico."
];

function renderFieldwork(){
  const panel=$("fieldworkPanel");
  panel.hidden=fieldwork.step===0;
  $("fieldworkStep").textContent=fieldwork.step===4?"Prática concluída":"Prática guiada · "+fieldwork.step+"/3";
  $("fieldworkCopy").textContent=fieldworkInstructions[fieldwork.step];
  $("fieldworkNotebook").hidden=fieldwork.step!==3;
}
function advanceFieldwork(step,sample=fieldwork.sample){
  fieldwork={step,sample};
  try {localStorage.qc_fieldwork_v73=JSON.stringify(fieldwork)}
  catch(error){reportSaveIssue("Não foi possível gravar o progresso da prática guiada.",error)}
  renderFieldwork();
}
function startFieldwork(){
  if(fieldwork.step&&!(fieldwork.step===2&&!scienceSystem?.getSamples().some(sample=>sample.id===fieldwork.sample)))return renderFieldwork();
  if(countItem("sample_vial")===0&&!addItem("sample_vial",1)){
    toast("Libere espaço na mochila para começar a prática guiada.");
    return;
  }
  advanceFieldwork(1,null);
}

function respawn(){endSleep();setPetrified(0);gasExposure=gasBlackout=0;playerVenom=null;updateFieldAir(0);updateAfflictions(0);leaveMount(true);leaveVehicle(true);const bed=bedReturnPosition();if(bed){player.pos.copy(bed);player.vel.set(0,0,0);player.onGround=false}else if(!syncPlayerToSafeGround(spawn.x,spawn.z)){player.pos.set(spawn.x,spawn.y,spawn.z);player.vel.set(0,0,0)}player.fallStart=player.pos.y;player.health=100;player.mana=100;player.hunger=80;player.thirst=80;player.breath=playerBreathMax();player.survivalDamageClock=0;player.breathDamageClock=0;closeModals();forwardChunks={x:0,z:0};ensureChunks(true);updateVitals();saveWorldState();requestPointer()}

let switchingWorld=false;
let importingWorld=false;
async function exportCurrentWorld(){
  try{
    await worldStorage.load();
    if(initialReady)saveWorldState();
    const backup=worldStorage.exportWorld();
    const url=URL.createObjectURL(new Blob([JSON.stringify(backup)],{type:"application/json"}));
    const link=document.createElement("a");
    link.href=url;
    link.download="QuimiCraft-"+WORLD_SEED+".json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    toast("Cópia do mundo exportada.");
  }catch(error){toast("Não foi possível exportar o mundo.");console.error(error)}
}
async function importCurrentWorld(file){
  if(!file||importingWorld||state.loading)return;
  importingWorld=true;
  try {
    const backup=JSON.parse(await file.text());
    if(!confirm("Restaurar este mundo do QuimiCraft? Ele substituirá o progresso em uso. Exporte uma cópia do mundo atual para mantê-lo."))return;
    await worldStorage.importWorld(backup,id=>Number.isInteger(id)&&Object.hasOwn(BDEF,id),MAX_Y);
    switchingWorld=true;
    location.reload();
  }catch(error){toast(error instanceof SyntaxError?"O arquivo selecionado não é um save válido.":error.message||"Não foi possível restaurar o mundo.")}
  finally {importingWorld=false;$("worldImportFile").value=""}
}
function restartWorld(){
  if(!confirm("Recomeçar o mundo? Construções, inventário, descobertas e progresso serão apagados. Suas configurações gráficas e aparência serão preservadas."))return;
  switchingWorld=true;
  worldStorage.discard();
  localStorage.qc_world_seed=String(Math.floor(100000+Math.random()*899999999));
  location.reload();
}
function flashDamage(){$("damage").classList.add("flash");setTimeout(()=>$("damage").classList.remove("flash"),80)}
function inferDamageType(source){
  const lower=String(source||"").toLowerCase();
  if(/lava|fogo|chama|magma/.test(lower))return"fire";
  if(/ácid|corros/.test(lower))return"corrosion";
  if(/elétr|raio|choque/.test(lower))return"electric";
  if(/radia|meteor/.test(lower))return"radiation";
  if(/carne crua|infec|microrgan/.test(lower))return"biological";
  if(/tóx|intox|gás|vapor/.test(lower))return"toxicity";
  if(/afog|fumaça|ar contaminado/.test(lower))return"air";
  if(/hipoterm|hiperterm|frio|calor/.test(lower))return"thermal";
  if(/fome|desidrata/.test(lower))return"internal";
  return"physical"
}
function damagePlayer(amount,source="criatura",damageType="",attack=null){
  if(isCreative()||dev.fly||labSafe()||player.health<=0)return;
  if(attack?.spirit){
    const ward=equipmentStat("spectralWard");
    for(const slot of EQUIPMENT_SLOTS){
      if(equipmentDefinition(slot)?.spectralWard>0&&!scienceSystem?.equipmentCondition(equipped[slot].id)?.broken)
        scienceSystem?.damageEquipment(equipped[slot].id,Math.max(.35,amount*.07),"ataque fantasmagórico");
    }
    if(attack.slow&&ward<.80)player.dragonSlow=Math.max(player.dragonSlow,attack.slow);
    applyPlayerDamage(spectral.wardDamage(amount,ward),source);
    return;
  }
  if(attack?.venom){
    playerVenom={left:7.5,next:.65};
    toast("Envenenado · use um antídoto");
  }
  if(attack?.burst){
    const shield=equipmentDefinition("offhand")&&equipped.offhand;
    const condition=shield&&scienceSystem?.equipmentCondition(shield.id);
    if(QuimiCraftDragons.burstProtection(shield?.id,condition?.broken)){
      registerShieldImpact(dragonGuardPose,attack.element);
      scienceSystem?.damageEquipment(shield.id,Math.ceil(amount*.8),"bloqueio de rajada dracônica");
      if(!player.lastDragonBlock||performance.now()-player.lastDragonBlock>1500){
        player.lastDragonBlock=performance.now();
        toast("Escudo antidragão segurou a rajada");
      }
      return true;
    }
    if(attack.slow)player.dragonSlow=Math.max(player.dragonSlow,attack.slow);
    applyPlayerDamage(amount,source);
    return;
  }
  const lower=String(source).toLowerCase(),type=damageType||inferDamageType(source);let reduction=1;
  if(type==="corrosion"&&equipped.chest?.id===survival.bufferArmor&&
    !scienceSystem?.equipmentCondition(survival.bufferArmor)?.broken){
    scienceSystem?.damageEquipment(survival.bufferArmor,Math.max(1,amount*.18),"consumo da solução tampão");
    applyPlayerDamage(Math.max(1,Math.ceil(survival.corrosionDamage(amount,true))),source);
    return;
  }
  const hearing=type==="sonic"?equipmentStat("hearingProtection"):0;
  if(hearing){
    reduction*=1-hearing;
    scienceSystem?.damageEquipment(equipped.head.id,1.8,"proteção auditiva");
  }
  if(type==="physical")reduction*=clamp(1-equipmentStat("armor"),.28,1);
  if(["corrosion","toxicity","air","biological","smoke"].includes(type)||/quím|intox|vapor/.test(lower))reduction*=clamp(equipmentStat("chemical",1,"multiply"),.3,1);
  if(lower.includes("queda"))reduction*=clamp(equipmentStat("fall",1,"multiply"),.35,1);
  const protections=twoHandedWeapon()?scienceSystem?.protectionSummary(equippedItemIds()):scienceSnapshot?.protections;
  const scientificProtection=protections?.protection?.[type]||0;
  reduction*=1-clamp(scientificProtection,0,.94);
  const shield=equipmentDefinition("offhand"),shieldCondition=equipped.offhand&&scienceSystem?.equipmentCondition(equipped.offhand.id);
  const dragonGuard=attack?.dragon&&!shieldCondition?.broken?shield?.dragonGuard||0:0;
  const blocked=type==="physical"&&shield?.blockChance&&!shieldCondition?.broken&&Math.random()<shield.blockChance;
  if(blocked){reduction*=shield.blockReduction??.38;scienceSystem?.damageEquipment(equipped.offhand.id,1.7,"bloqueio");toast("Escudo bloqueou parte do dano")}
  if(dragonGuard){reduction*=1-dragonGuard;scienceSystem?.damageEquipment(equipped.offhand.id,Math.max(2,amount*.24),"baforada dracônica")}
  if((blocked||dragonGuard)&&equipped.offhand?.id==="shield_dragon")registerShieldImpact(dragonGuardPose,attack?.element);
  if(attack?.slow&&!dragonGuard)player.dragonSlow=Math.max(player.dragonSlow,attack.slow);
  amount=Math.max(1,Math.ceil(amount*reduction));
  for(const slot of EQUIPMENT_SLOTS){
    const item=equipped[slot],definition=equipmentDefinition(slot);if(!item||!definition||slot==="offhand"&&blocked)continue;
    if((type==="physical"&&definition.armor)||(definition.protections?.[type]||0)>0)scienceSystem?.damageEquipment(item.id,Math.max(.18,amount*.055),"proteção contra dano")
  }
  applyPlayerDamage(amount,source);
}
function registerShieldImpact(guard,element){
  guard.hold=.44;guard.lift=Math.max(.73,guard.lift);guard.impact=.18;
  if(!guard.sparks)dragonGuardClang();
  guard.sparks=element||"guard";
}
function updatePetrifiedAppearance(){
  if(player.petrified>0){
    for(const rig of [playerBody,firstHands])rig.traverse(node=>{
      if(!node.isMesh||node.material.transparent||petrifiedParts.has(node))return;
      petrifiedParts.set(node,node.material);node.material=petrifiedMaterial;
    });
  }else{
    for(const [part,material] of petrifiedParts)if(part.material===petrifiedMaterial)part.material=material;
    petrifiedParts.clear();
  }
}
function setPetrified(seconds){
  player.petrified=seconds;
  $("petrifiedStatus").hidden=!seconds;
  $("petrificationOverlay").classList.toggle("on",seconds>0);
  updatePetrifiedAppearance();
  if(seconds>0){
    clearInput();player.vel.x=player.vel.z=0;
    playerActivity=null;player.swimExitBoost=0;
  }
}
function applyPlayerDamage(amount,source){
  player.health=Math.max(0,player.health-amount);flashDamage();updateVitals();
  if(player.health<=0){chatMessage("SISTEMA",`Você foi derrotado por ${source}. Retornando ao laboratório…`);setTimeout(respawn,260)}
  else if(amount>=8)toast(`−${amount} vida · ${source}`)
}
function updateVitals(){
  const maxBreath=playerBreathMax(),values=[["health",player.health,100],["mana",player.mana,100],["hunger",player.hunger,100],["thirst",player.thirst,100],["breath",player.breath,maxBreath]];
  for(const [id,value,max] of values){const fill=$(id+"Fill"),num=$(id+"Num"),pct=clamp(value/max*100,0,100);if(fill){fill.style.width=pct+"%";fill.classList.toggle("critical",pct<=15)}if(num)num.textContent=id==="breath"?`${Math.ceil(value)}/${max}`:Math.ceil(value)}const row=$("breathRow");if(row)row.classList.toggle("show",player.inWater||player.headUnderwater||player.breath<maxBreath-.5)
}

function updateBreath(dt,moving){
  let max=playerBreathMax();player.breathDamageClock=Math.max(0,player.breathDamageClock-dt);
  if(isCreative()){player.breath=max;return}
  if(player.headUnderwater){
    if(alchemyProgress.activeEffect("air")){player.breath=Math.min(max,player.breath+dt*24);return;}
    const activity=moving?1.16:1,tankId=equippedItemIds().find(id=>EQUIPMENT_DEFS[id]?.oxygenCapacity),tank=tankId?scienceSystem?.useOxygen(equippedItemIds(),dt*activity*.62):null,assisted=!!tank?.available,drain=(assisted?2.15:5.4)*activity*breathDrainMultiplier();
    max=playerBreathMax();player.breath=clamp(player.breath-dt*drain,0,max);if(player.breath<=0&&player.breathDamageClock<=0){player.breathDamageClock=2;damagePlayer(5,"afogamento","air")}
  }else player.breath=clamp(player.breath+dt*24,0,max)
}
const regionalWaterVisibility={fresh:1,salt:1.12,cold:1.15,tannin:.58,acid:.66,thermal:.82,mineral:.94};
function waterFogProfile(x,z){
  const {rgb,id}=regionalWater(x,z);
  return {rgb,visibility:regionalWaterVisibility[id]??1};
}
function updateUnderwaterUI(clarity,tint){
  const overlay=$("waterOverlay"),submerged=clarity!==null;
  overlay.classList.toggle("on",submerged);
  overlay.classList.toggle("low-air",submerged&&player.headUnderwater&&player.breath<=playerBreathMax()*.25);
  if(submerged){
    overlay.style.setProperty("--water-rgb",tint.toArray().map(c=>Math.round(c*255)).join(","));
    overlay.style.setProperty("--clarity",clarity.toFixed(2));
  }
}
function updateSurvival(dt,moving){
  if(isCreative()){player.health=100;player.mana=100;player.hunger=100;player.thirst=100;player.survivalDamageClock=0;return}
  if(labSafe()){player.health=Math.min(100,player.health+dt*1.5);player.survivalDamageClock=0;return}
  if(dev.fly)return;const activity=(player.sprint&&moving?1.7:0)+(moving?.45:0)+(player.inLava?.7:0),heat=["deserto","savana","badlands","vulcânico","salinas"].includes(biomeAt(player.pos.x,player.pos.z))?.55:0;
  const hungerRate=scienceSnapshot?.modifiers?.hungerRate||1,thirstRate=scienceSnapshot?.modifiers?.thirstRate||1;player.hunger=clamp(player.hunger-dt*(.035+activity*.018)*hungerRate,0,100);player.thirst=clamp(player.thirst-dt*(.052+activity*.026+heat*.025)*thirstRate,0,100);
  player.survivalDamageClock=Math.max(0,player.survivalDamageClock-dt);if(player.survivalDamageClock<=0&&(player.hunger<=0||player.thirst<=0)){player.survivalDamageClock=player.thirst<=0?2.8:4.5;damagePlayer(player.thirst<=0?5:3,player.thirst<=0?"desidratação":"fome")}
}

const highlight=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(BLOCK_SIZE*1.012,BLOCK_SIZE*1.012,BLOCK_SIZE*1.012)),new THREE.LineBasicMaterial({color:0xe4f8bd,transparent:true,opacity:.85,depthTest:false}));highlight.visible=false;highlight.renderOrder=8;scene.add(highlight);
function crackTextures(){const out=[];for(let stage=0;stage<3;stage++){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");x.strokeStyle=`rgba(20,25,21,${.45+stage*.18})`;x.lineWidth=1.3+stage*.4;for(let q=0;q<4+stage*4;q++){let px=32+(hash(q,stage)-.5)*20,py=32+(hash(q,stage,2)-.5)*20;x.beginPath();x.moveTo(px,py);for(let j=0;j<3+stage;j++){px+=(hash(q,j,stage)-.5)*21;py+=(hash(q+17,j,stage)-.5)*21;x.lineTo(px,py)}x.stroke()}out.push(new THREE.CanvasTexture(c))}return out}
const cracks=crackTextures(),crackMat=new THREE.MeshBasicMaterial({map:cracks[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const crackMesh=new THREE.Mesh(new THREE.BoxGeometry(BLOCK_SIZE*1.015,BLOCK_SIZE*1.015,BLOCK_SIZE*1.015),crackMat);crackMesh.visible=false;crackMesh.renderOrder=7;scene.add(crackMesh);
const raycaster=new THREE.Raycaster();raycaster.far=6;
function targetBlock(){
  raycaster.setFromCamera({x:0,y:0},camera);
  const origin=raycaster.ray.origin,end=raycaster.ray.at(raycaster.far,new THREE.Vector3()),meshes=[];
  const minX=Math.floor(Math.min(origin.x,end.x)/CHUNK),maxX=Math.floor(Math.max(origin.x,end.x)/CHUNK);
  const minZ=Math.floor(Math.min(origin.z,end.z)/CHUNK),maxZ=Math.floor(Math.max(origin.z,end.z)/CHUNK);
  for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){
    const chunk=chunks.get(ckey(x,z));
    if(chunk?.mesh)meshes.push(chunk.mesh);
    if(chunk?.glass)meshes.push(chunk.glass);
  }
  const hit=raycaster.intersectObjects(meshes,false)[0];
  state.deckTarget=vehicles.deckTarget(raycaster.ray,Math.min(raycaster.far,hit?.distance??Infinity));
  if(labDoor.aim(raycaster,hit?.distance??raycaster.far)){
    const {x,y,z}=labDoor.cells[0];
    return {x,y,z,id:labDoor.isOpen?BLOCK.DOOR_OPEN:BLOCK.DOOR,labDoor:true,n:[0,0,-1]};
  }
  const ref=hit&&readChunkFace(hit.object,hit.faceIndex);
  return ref?{...ref,point:hit.point}:null;
}
function aimedEntity(){const eye=attackOrigin(),dir=aimDirection();return attackableActors().filter(e=>!e.dead).map(e=>{const v=entityAimPoint(e).sub(eye),d=v.length();return {e,d,dot:v.normalize().dot(dir)}}).filter(q=>q.d<22&&q.dot>1-clamp(.24/q.d,.012,.12)).sort((a,b)=>b.dot-a.dot||a.d-b.d).find(q=>combatSegmentClear(eye,entityAimPoint(q.e)))?.e||null}
function updateTarget(dt){
  if(player.petrified>0||gasBlackout>0){
    state.left=false;state.target=state.aimEntity=state.deckTarget=null;state.breakKey="";state.breakTime=0;
    highlight.visible=crackMesh.visible=false;
    $("breakWrap").classList.remove("visible");$("crosshair").classList.remove("target");
    return;
  }
  if(vehicles.current()||riding)state.left=false;
  const raw=targetBlock(),deck=state.deckTarget,t=!deck&&raw&&getBlock(raw.x,raw.y,raw.z)===raw.id?raw:null,ae=aimedEntity();
  state.target=t;state.aimEntity=ae;
  highlight.visible=!!t&&!t.labDoor||!!deck?.cell;
  $("crosshair").classList.toggle("target",!!t||!!ae||!!deck);
  highlight.rotation.set(0,0,0);highlight.scale.setScalar(1);
  if(t)highlight.position.set(t.x+.5,t.y+.5,t.z+.5);
  else if(deck?.cell){
    const {cell,vehicle,kind}=deck,built=kind==="deckBlock";
    highlight.position.set(cell.x,cell.y+(built?cell.size/2:.012),cell.z);
    vehicle.rig.root.localToWorld(highlight.position);
    highlight.quaternion.copy(vehicle.rig.root.quaternion);
    highlight.scale.set(cell.size,built?cell.size:.026,cell.size);
  }
  const protectedLab=t&&isLabProtectedBlock(t.x,t.y,t.z);
  creativeBreakCooldown=Math.max(0,creativeBreakCooldown-dt);
  if(!state.left)creativeBreakCooldown=0;
  if(state.left&&protectedLab){state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false;const now=performance.now();if(now-labProtectToastAt>950){labProtectToastAt=now;toast("Os blocos do Laboratório Carbono são indestrutíveis")}}
  else if(state.left&&isCreative()&&t&&(t.id!==BLOCK.BEDROCK||t.y>0)){
    state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false;
    if(creativeBreakCooldown<=0){breakBlock(t);creativeBreakCooldown=.18}
  }
  else if(state.left&&t&&requiredPick(t.id)>miningLevel()){
    state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false;
    if(performance.now()-labProtectToastAt>1200){labProtectToastAt=performance.now();toast(requiredPick(t.id)===3?"Use uma picareta de ferro em bom estado.":"Use uma picareta de cobre ou ferro em bom estado.")}
  }
  else if(state.left&&t&&t.id!==BLOCK.BEDROCK){const k=key3(t.x,t.y,t.z);if(k!==state.breakKey){state.breakKey=k;state.breakTime=0}const toolSpeed=(scienceSnapshot?.modifiers?.toolSpeed||1)*selectedMiningSpeed(t.id),waterMining=player.inWater?(isEquipped("diving_suit")||isEquipped("pressure_suit")?1:.62):1;state.breakTime+=dt*toolSpeed*waterMining;const prog=state.breakTime/BDEF[t.id].hard;$("breakWrap").classList.add("visible");$("breakFill").style.width=clamp(prog*100,0,100)+"%";crackMesh.visible=true;crackMesh.position.copy(highlight.position);crackMat.map=cracks[Math.min(2,Math.floor(prog*3))];crackMat.needsUpdate=true;if(prog>=1){breakBlock(t);state.breakTime=0;state.breakKey=""}}
  else{state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false}
}
const PICKAXE_STONE=new Set([BLOCK.MAGMA_ROCK,...ecology.ores,BLOCK.HORNBLENDE_ROCK,BLOCK.QUARTZITE,BLOCK.AMBER_SHALE,BLOCK.TUFF,BLOCK.MALACHITE,BLOCK.PYRITE,BLOCK.BAUXITE,BLOCK.COBALT_ORE,BLOCK.FIELDSTONE,BLOCK.SILVER_ORE,BLOCK.AQUAMARINE_ORE,BLOCK.OCHRE_STONE,BLOCK.BASALT_GLASS,BLOCK.STONE,BLOCK.DEEPSTONE,BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,
  BLOCK.BASALT,BLOCK.OBSIDIAN,BLOCK.GOLD,BLOCK.LIMESTONE,BLOCK.SLATE,BLOCK.AMETHYST,BLOCK.TIN,BLOCK.ZINC,
  BLOCK.SULFUR,BLOCK.MARBLE,BLOCK.CRYSTAL,BLOCK.NITER,BLOCK.FURNACE]);
for(const id of variantMinerals)PICKAXE_STONE.add(id);
for(const id of [BLOCK.GRANITE,BLOCK.GNEISS,BLOCK.BLACK_SHALE,BLOCK.SUNKEN_BRICK,BLOCK.SUNKEN_MOSAIC])PICKAXE_STONE.add(id);
function requiredPick(blockId){
  if(variantMinerals.has(blockId))return blockId===BLOCK.MAGNETITE?1:blockId===BLOCK.GARNET_ORE||blockId===BLOCK.OPAL_ORE?2:3;
  if(blockId===BLOCK.SILVER_ORE)return 2;
  if(blockId===BLOCK.AQUAMARINE_ORE||blockId===BLOCK.NICKEL_ORE)return 3;
  return 0;
}
function miningLevel(){
  const id=selectedItem();
  if(scienceSystem?.equipmentCondition(id)?.broken)return 0;
  return {stone_pickaxe:1,copper_pickaxe:2,iron_pickaxe:3}[id]||0;
}
function selectedMiningSpeed(blockId){
  const id=selectedItem();
  const def=EQUIPMENT_DEFS[id];
  if(!def?.miningSpeed||!PICKAXE_STONE.has(blockId)||scienceSystem?.equipmentCondition(id)?.broken)return 1;
  return def.miningSpeed;
}
function breakBlock(t,operation=null){
  if(isLabProtectedBlock(t.x,t.y,t.z))return toast("Os blocos do Laboratório Carbono são indestrutíveis");
  const creativeBreak=isCreative()&&!operation;
  if(!creativeBreak&&requiredPick(t.id)>(operation?.level??miningLevel()))return;
  const fixture=BDEF[t.id];
  if(fixture?.gate||fixture?.bed){
    const cells=survival.bedAt(BLOCK,BDEF,getBlock,t)||[t],id=fixture.gate?.first??BLOCK.BED;
    const dirty=new Map();
    for(const cell of cells)editVoxel(cell.x,cell.y,cell.z,BLOCK.AIR,dirty);
    commitVoxelEdits(dirty);
    if(!creativeBreak)receiveFrontier(id,1);sound("break",.55);burstBlock(t);
    return;
  }
  if(t.id===BLOCK.EXPEDITION_CHEST&&expeditions.treasureAt(t.x,t.y,t.z)){
    if(!operation)openExpeditionChest(t);
    return;
  }
  wakeNearbyScreamers({x:t.x+.5,y:t.y+.5,z:t.z+.5},9);
  if(treeTrunks.has(t.id)&&!creativeBreak){
    provokeGrove(t.x,t.y,t.z);
    angerFolklore("curupira",t,15,playerActor);
  }
  const excavate=()=>operation?editVoxel(t.x,t.y,t.z,BLOCK.AIR,operation.dirty):setBlock(t.x,t.y,t.z,BLOCK.AIR);
  const receive=(id,n)=>{
    if(creativeBreak)return;
    if(operation)operation.drops.set(id,(operation.drops.get(id)||0)+n);
    else receiveFrontier(id,n,player.pos);
  };
  const field=fieldLab.locate(t);
  if(field){
    const ownDirty=operation?.dirty??new Map();
    for(const cell of field.cells){
      if(getBlock(cell.x,cell.y,cell.z)===cell.id)editVoxel(cell.x,cell.y,cell.z,BLOCK.AIR,ownDirty);
    }
    if(!operation)commitVoxelEdits(ownDirty);
    receive(field.unit.base,1);
    if(!operation){burstBlock(t);sound("pickup",.5)}
    return;
  }
  if(professions.isCrop(t.id)){professions.harvest(t,true);return}
  if(professions.soil(t.id))professions.clearPlot(t);
  const ingredient=ecology.produce.get(t.id);
  if(ingredient){
    excavate();
    const quantity=1+Math.floor(hash(t.x,t.z,1201)*3);
    receive(ingredient,quantity);
    scienceSystem?.registerDiscovery(ingredient==="forest_mushroom"?"fungi":"plants",ingredient,{
      name:itemName(ingredient),source:biomeAt(t.x,t.z),amountCollected:quantity,researchProgress:25
    });
    if(!operation){burstBlock(t);sound("pickup",.5);}
    return;
  }
  if(t.id===BLOCK.SILVER_ORE||t.id===BLOCK.AQUAMARINE_ORE||ecology.ores.has(t.id)){
    scienceSystem?.registerDiscovery("minerals",String(t.id),{name:itemName(t.id),source:"Veio subterrâneo",amountCollected:1,researchProgress:35});
  }
  if(t.id===BLOCK.BERRY_BUSH)receive("berries",1+Math.floor(hash(t.x,t.z,803)*3));
  if(t.id===BLOCK.TALL_GRASS){
    const roll=hash(t.x,t.y+17,t.z+23);
    if(roll>.74)receive(["wheat_seed","carrot_seed","bean_seed"][Math.floor(roll*717)%3],1);
  }
  if(t.id===BLOCK.DOOR||t.id===BLOCK.DOOR_OPEN){const m=worldDoorMeta(t.x,t.y,t.z)||{half:0},baseY=t.y-(m.half||0),levels=m.group==="carbon-main-airlock"?[baseY,baseY+1,baseY+2]:[baseY,baseY+1];for(const yy of levels){mods.set(key3(t.x,yy,t.z),BLOCK.AIR);doorMeta.delete(key3(t.x,yy,t.z))}saveMods();rebuildChunk(Math.floor(t.x/CHUNK),Math.floor(t.z/CHUNK));if(!creativeBreak)addItem(BLOCK.DOOR,1)}
  else{excavate();if(![BLOCK.FIRE,BLOCK.WATER,BLOCK.LAVA,BLOCK.EXPEDITION_CHEST_OPEN].includes(t.id))receive(professions.soil(t.id)?BLOCK.DIRT:t.id,1);discoverFromBlock(t.id);const resourceKey=missionResourceKeyForId(t.id);if(resourceKey)elementMissions?.recordEvent("mine",{key:resourceKey,quantity:1});const minerals=[BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.SULFUR,BLOCK.SALT,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.CRYSTAL,BLOCK.AMETHYST,BLOCK.LIMESTONE];if(minerals.includes(t.id))scienceSystem?.registerDiscovery("minerals",resourceKey||String(t.id),{name:itemName(t.id),source:`Extraído em ${biomeAt(t.x,t.z)}`,amountCollected:1,researchProgress:25})}
  if(operation)return;
  const tool=selectedItem();if(!creativeBreak&&selectedMiningSpeed(t.id)>1)scienceSystem?.damageEquipment(tool,t.id===BLOCK.OBSIDIAN?1.7:1,"mineração");
  burstBlock(t);sound("break",.65);highlight.visible=false;if(placementsWithLight.has(t.id))updateTorches()
}
let queuedPlacement=null;
function blockHitsPlayer(x,y,z){
  return horizon.overlapsPlayer(player.pos,player.crouch?1.24:1.72,x,y,z);
}
function toggleDoor(t){
  if(t.labDoor||labDoor.isCell(t.x,t.y,t.z))return toggleLabMainDoor();
  const m=worldDoorMeta(t.x,t.y,t.z)||{axis:0,half:0};
  const closed=getBlock(t.x,t.y,t.z)===BLOCK.DOOR_OPEN;
  const next=closed?BLOCK.DOOR:BLOCK.DOOR_OPEN;
  const keys=m.group?[...doorMeta].filter(([,meta])=>meta.group===m.group).map(([key])=>key):
    [0,1].map(half=>key3(t.x,t.y-(m.half||0)+half,t.z));
  const chunksToRebuild=new Set();
  for(const key of keys){
    const [x,,z]=key.split("|").map(Number);
    mods.set(key,next);
    chunksToRebuild.add(ckey(Math.floor(x/CHUNK),Math.floor(z/CHUNK)));
  }
  saveMods();
  for(const key of chunksToRebuild)rebuildChunkImmediate(...key.split(",").map(Number));
  sound("place",.42);
  toast(closed?"Porta fechada":"Porta aberta");
}
function labDoorBodies(){
  const bodies=[{x:player.pos.x,y:player.pos.y,z:player.pos.z,radius:.29,height:player.crouch?1.24:1.72}];
  for(const entity of entities){
    if(!entity.dead&&!entity.ai?.recovering&&labDoor.nearby(entity))bodies.push({x:entity.x,y:entity.y,z:entity.z,radius:entityRadius(entity),height:entity.flying?1.55:1.9});
  }
  return bodies;
}
function storeLabDoor(open, includeMetadata=false){
  for(const {x,y,z,half} of labDoor.cells){
    const key=key3(x,y,z);
    mods.set(key,open?BLOCK.DOOR_OPEN:BLOCK.DOOR);
    if(includeMetadata)doorMeta.set(key,{axis:0,half,hinge:x<labDoor.center?-1:1,swing:1,style:"carbon",group:"carbon-main-airlock"});
  }
  if(!includeMetadata)saveMods();
}
function readLabDoor(){
  return labDoor.cells.some(({x,y,z,half})=>half===0&&mods.get(key3(x,y,z))===BLOCK.DOOR_OPEN);
}
function toggleLabMainDoor(){
  const open=labDoor.toggle(labDoorBodies());
  if(open===null)return toast("Libere a passagem para fechar a porta.");
  storeLabDoor(open);
  sound("place",.42);
  toast(open?"Abrindo a porta do laboratório":"Fechando a porta do laboratório");
}
const FOOD_VALUES={...QuimiCraftWorkshops.food,...QuimiCraftFrontier.fruitFoods,carrot:{hunger:11,thirst:3},beans:{hunger:8},beet:{hunger:12,thirst:3},potato:{hunger:7},baked_potato:{hunger:23,health:3},cooked_trout:{hunger:29,health:6},
  cooked_perch:{hunger:24,health:4},cooked_catfish:{hunger:31,health:5},cooked_fish:{hunger:26,health:4},
  raw_trout:{hunger:8,raw:true},raw_perch:{hunger:8,raw:true},raw_catfish:{hunger:9,raw:true},raw_fish:{hunger:7,raw:true},bread:{hunger:25,health:3},berries:{hunger:12,thirst:5},honey:{hunger:18,health:2},cheese:{hunger:27,health:4},raw_venison:{hunger:11,raw:true},cooked_venison:{hunger:34,health:7},raw_pork:{hunger:10,raw:true},cooked_pork:{hunger:32,health:6},raw_beef:{hunger:12,raw:true},cooked_beef:{hunger:38,health:8},raw_rabbit:{hunger:8,raw:true},cooked_rabbit:{hunger:25,health:5},raw_chicken:{hunger:8,raw:true},cooked_chicken:{hunger:29,health:6},raw_mutton:{hunger:10,raw:true},cooked_mutton:{hunger:33,health:7}};
const DRINK_VALUES={water:{thirst:42},distilled_water:{thirst:38},purified_water:{thirst:35},salt_water:{thirst:-14},contaminated_water:{thirst:14},water_cup:{thirst:36,returns:"cup"},water_bucket:{thirst:75,returns:"bucket"}};
const RAW_TO_COOKED={...QuimiCraftWorkshops.rawMap,potato:"baked_potato",raw_trout:"cooked_trout",raw_perch:"cooked_perch",raw_catfish:"cooked_catfish",raw_fish:"cooked_fish",raw_venison:"cooked_venison",raw_pork:"cooked_pork",raw_beef:"cooked_beef",raw_rabbit:"cooked_rabbit",raw_chicken:"cooked_chicken",raw_mutton:"cooked_mutton"};
function transformSelectedItem(from,to,metadata=null){
  const slot=invSlots[state.selected];if(!slot||slot.id!==from||slot.count<1)return false;
  const canStack=!metadata&&!slot.liquid,same=canStack?invSlots.find(item=>QuimiCraftInventory.canStack(item,to)):null,free=invSlots.findIndex(item=>!item);
  if(slot.count>1&&!same&&free<0)return toast("Abra espaço na mochila para o recipiente"),false;
  const transformed={id:to,count:1,...metadata};
  slot.count--;if(slot.count<=0)invSlots[state.selected]=transformed;else if(same)same.count++;else invSlots[free]=transformed;
  saveInventory();renderInventory();return true
}
function canCollectWater(){const t=state.target;return player.inWater||!!(t&&[BLOCK.WATER,BLOCK.ICE].includes(getBlock(t.x+t.n[0],t.y+t.n[1],t.z+t.n[2])))}
const SOIL_SAMPLE_BLOCKS=new Set([...ecology.fertile,...variantSands,BLOCK.SHELL_SAND,BLOCK.SALT_CRUST,BLOCK.GRASS,BLOCK.DIRT,BLOCK.SAND,BLOCK.RED_SAND,BLOCK.MUD,BLOCK.CLAY,BLOCK.FROSTED_SOIL,BLOCK.PEAT]);
const PLANT_SAMPLE_BLOCKS=new Set([...ecology.produce.keys(),BLOCK.WOOD,BLOCK.LEAVES,BLOCK.CACTUS,BLOCK.MOSS,BLOCK.PINE_LOG,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.TALL_GRASS,BLOCK.POPPY,BLOCK.BLUE_FLOWER,BLOCK.WHITE_FLOWER,BLOCK.CHERRY_LOG,BLOCK.CHERRY_LEAVES,BLOCK.BAMBOO,BLOCK.PALM_LOG,BLOCK.PALM_LEAVES,BLOCK.REDWOOD_LOG,BLOCK.REDWOOD_LEAF,BLOCK.MANGROVE_LOG,BLOCK.MANGROVE_LEAF,
  BLOCK.FERN,BLOCK.REED,BLOCK.ORCHID,BLOCK.LICHEN,BLOCK.BIRCH_LOG,BLOCK.ACACIA_LOG,BLOCK.JACARANDA_LOG,BLOCK.LAVENDER,BLOCK.SALT_REED,BLOCK.WATER_LILY,
  ...CROP_BLOCKS.keys()]);
const MINERAL_SAMPLE_BLOCKS=new Set([...ecology.ores,BLOCK.CHALK,BLOCK.TRAVERTINE,BLOCK.AMBER_SHALE,BLOCK.QUARTZITE,BLOCK.STONE,BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.SULFUR,BLOCK.SALT,BLOCK.BASALT,BLOCK.OBSIDIAN,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.CRYSTAL,BLOCK.MARBLE,BLOCK.DEEPSTONE,BLOCK.LIMESTONE,BLOCK.SLATE,BLOCK.AMETHYST,BLOCK.NITER,BLOCK.SILVER_ORE,BLOCK.AQUAMARINE_ORE,BLOCK.OCHRE_STONE,BLOCK.BASALT_GLASS,BLOCK.PYRITE,BLOCK.MALACHITE,BLOCK.BAUXITE,BLOCK.COBALT_ORE,BLOCK.SILICA_SAND]);
const SAMPLE_DISCOVERY_KEYS=new Map([[BLOCK.CACTUS,"cactus"],[BLOCK.MOSS,"moss"],[BLOCK.POPPY,"poppy"],[BLOCK.BLUE_FLOWER,"blue_flower"],[BLOCK.WHITE_FLOWER,"white_flower"],[BLOCK.BAMBOO,"bamboo"],[BLOCK.CRYSTAL,"crystal_tree"]]);
function collectScientificSample(){
  if(player.petrified>0)return;
  if(!state.playing||!scienceSystem)return false;
  const target=state.target,creature=state.aimEntity&&!state.aimEntity.dead&&Math.hypot(state.aimEntity.x-player.pos.x,state.aimEntity.z-player.pos.z)<4.5?state.aimEntity:null;
  const biome=biomeAt(player.pos.x,player.pos.z),environment=cachedEnvironmentHazards||scanEnvironmentHazards(),position=target?{x:target.x,y:target.y,z:target.z}:{x:player.pos.x,y:player.pos.y,z:player.pos.z};
  let metadata;
  if(creature){
    metadata={kind:"animal",name:`Material biológico — ${creature.name}`,source:creature.name,sourceCreature:creature.type,discoveryId:creature.type,appearance:`Vestígio coletado de ${creature.name}`,contamination:creature.hostile?32:12,biologicalContamination:creature.hostile?38:16,composition:regionalFauna[creature.type]?.composition??"material biológico"};
  }else if(canCollectWater()){
    const at=target?{x:target.x+target.n[0],z:target.z+target.n[2]}:player.pos;
    const profile=scienceSystem.waterProfileFor({biome:biomeAt(at.x,at.z),...regionalWater(at.x,at.z).chem});
    const hazardous=["acidic","alkaline","industrial"].includes(profile.id);
    metadata={kind:hazardous?"liquid":"water",name:`Amostra — ${profile.label}`,source:`Corpo d'água em ${biome}`,discoveryId:profile.id,waterProfileId:profile.id,appearance:profile.description,pH:profile.pH,purity:profile.purity,contamination:profile.contamination,biologicalContamination:profile.contamination,temperature:profile.temperature,composition:profile.label,suspendedMaterial:profile.contamination>40?"sedimentos e matéria orgânica":"partículas finas"};
  }else if(target){
    const meteorDistance=Math.hypot(target.x-(190+Math.floor(hash(WORLD_SEED,31)*130)),target.z-(-180-Math.floor(hash(WORLD_SEED,67)*120))),blockName=itemName(target.id),resourceKey=missionResourceKeyForId(target.id)||SAMPLE_DISCOVERY_KEYS.get(target.id)||String(target.id);
    const fungi=target.id===BLOCK.FOREST_MUSHROOM||target.id===BLOCK.BLUE_MUSHROOM||target.id===BLOCK.PEAT&&["pântano","selva tropical"].includes(biome),meteorite=meteorDistance<18&&[BLOCK.CRYSTAL,BLOCK.AMETHYST,BLOCK.OBSIDIAN].includes(target.id);
    const kind=meteorite?"meteorite":fungi?"fungi":SOIL_SAMPLE_BLOCKS.has(target.id)?"soil":PLANT_SAMPLE_BLOCKS.has(target.id)?"plant":MINERAL_SAMPLE_BLOCKS.has(target.id)?"mineral":"residue";
    metadata={kind,name:`Amostra de ${blockName}`,source:blockName,sourceBlock:resourceKey,discoveryId:meteorite?"meteorite":resourceKey,appearance:BDEF[target.id]?.alpha?"translúcida ou porosa":"fragmento voxelizado",contamination:kind==="fungi"?58:kind==="residue"?24:6,temperature:scienceSnapshot?.ambientTemperature,composition:blockName,radioactivity:meteorite?"elevada":"não medida",magneticBehavior:target.id===BLOCK.IRON?"atração provável":"não medido"};
  }else{
    metadata={kind:"air",name:`Amostra de ar — ${biome}`,source:`Atmosfera de ${biome}`,discoveryId:`air-${biome}`,appearance:"gás incolor em recipiente selado",contamination:Math.round(Math.max(environment.hazards?.air||0,environment.hazards?.smoke||0,environment.hazards?.toxicity||0)),temperature:scienceSnapshot?.ambientTemperature,composition:"mistura gasosa desconhecida"};
  }
  const result=scienceSystem.collectSample({...metadata,...position,biome,temperature:metadata.temperature??scienceSnapshot?.ambientTemperature??20});
  if(!result.ok){toast(result.message);return false}
  if(fieldwork.step===1&&result.sample.kind==="mineral")advanceFieldwork(2,result.sample.id);
  sound("pickup",.55);toast(result.message);saveInventory();renderInventory();scienceUI?.renderNotebook?.();return true
}
function fillWaterContainer(id){
  if(!canCollectWater())return toast("Aponte para a água ou entre nela para encher o recipiente");
  if(invSlots[state.selected]?.liquid)return toast("Este recipiente já contém uma substância");
  const aim=state.target,at=aim?{x:aim.x+aim.n[0],z:aim.z+aim.n[2]}:player.pos;
  const biome=biomeAt(at.x,at.z),profile=scienceSystem?.waterProfileFor({biome,...regionalWater(at.x,at.z).chem})||{id:"fresh",label:"Água doce",purity:72,contamination:8,temperature:19,pH:7.1},requiresReinforced=["acidic","alkaline","industrial"].includes(profile.id);
  if(requiresReinforced&&id!=="hazardous_container")return toast(`${profile.label} exige um recipiente reforçado; copos e baldes comuns são incompatíveis`);
  const filled=id==="bucket"?"water_bucket":id==="cup"?"water_cup":"hazardous_container",liquid={...profile,amount:id==="bucket"?1000:id==="cup"?250:500,unit:"mL",concentration:profile.id==="salt"?"salina":profile.id==="acidic"?"ácida":profile.id==="alkaline"?"alcalina":"natural"};
  if(transformSelectedItem(id,filled,{liquid})){sound("splash",.5);toast(`${id==="bucket"?"Balde":id==="cup"?"Copo":"Recipiente reforçado"} com ${profile.name||profile.label}`)}
}
function consumeFood(id,data){if(player.hunger>=100&&player.health>=100&&!data.thirst)return toast("Você já está satisfeito");startPlayerActivity("eat",1.18,id);
  removeItem(id,1);player.hunger=clamp(player.hunger+data.hunger,0,100);player.thirst=clamp(player.thirst+(data.thirst||0),0,100);player.health=clamp(player.health+(data.health||0),0,100);if(data.raw&&Math.random()<.18)damagePlayer(4,"carne crua");saveInventory();renderInventory();updateVitals();sound("pickup",.7);toast(`${itemName(id)} consumido · +${data.hunger} fome`)}
function consumeDrink(id,data){
  if(player.thirst>=100)return toast("Sua sede já está cheia");
  const selected=invSlots[state.selected],liquid=selected?.liquid,profiles=scienceSystem?.waterProfiles||{},fallback=id==="water"||id==="distilled_water"?profiles.distilled:id==="salt_water"?profiles.salt:id==="contaminated_water"?profiles.contaminated:id==="purified_water"?{...profiles.fresh,id:"fresh",label:"Água purificada",name:"água purificada",purity:92,contamination:2,hydration:35}:profiles.fresh;
  if(data.returns){if(!transformSelectedItem(id,data.returns))return}else{removeItem(id,1);saveInventory();renderInventory()}
  startPlayerActivity("drink",.98,id,null,liquid||fallback);
  const result=scienceSystem?.drinkLiquid(liquid||fallback),hydration=Number.isFinite(result?.hydration)?result.hydration:data.thirst;
  player.thirst=clamp(player.thirst+hydration,0,100);updateVitals();sound("splash",.55);
  toast(`${result?.profile?.label||itemName(id)} consumida · ${hydration>=0?"+":""}${hydration} sede${result?.status?` · ${result.status}`:""}`)
}
function cookWithFurnace(){
  const raw=RAW_TO_COOKED[selectedItem()]?selectedItem():Object.keys(RAW_TO_COOKED).find(id=>countItem(id)>0);
  if(!raw)return toast("Coloque alimento cru na mochila para assar");
  const target=state.target;
  if(!target||target.id!==BLOCK.FURNACE)return;
  const id=RAW_TO_COOKED[raw];
  const result=production.enqueue(target,{name:itemName(id),need:[[raw,1],[BLOCK.COAL,1]],out:[[id,1]],kind:"cook",seconds:2.35});
  if(!result.ok)toast(result.message);
}
const activeHuntUtilities=new Set(["quartz_whetstone","soot_filter","vein_probe"]);
const probeMinerals=new Set(Object.entries(BLOCK).filter(([name])=>name.endsWith("_ORE")||
  ["IRON","COPPER","GOLD","TIN","ZINC","CRYSTAL","AMETHYST","HEMATITE","CASSITERITE","SPHALERITE","RUTILE","FLUORITE","MAGNETITE","PYRITE","MALACHITE","BAUXITE"].includes(name))
  .map(([,id])=>id));
function nearestProbedVein(origin){
  const radius=12,px=Math.floor(origin.x),py=Math.floor(origin.y),pz=Math.floor(origin.z);
  let nearest=null,best=radius**2;
  for(let x=px-radius;x<=px+radius;x++)for(let z=pz-radius;z<=pz+radius;z++){
    if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))continue;
    const planar=(x+.5-origin.x)**2+(z+.5-origin.z)**2;
    if(planar>best)continue;
    for(let y=Math.max(1,py-radius);y<=Math.min(MAX_Y-1,py+radius);y++){
      const distance=planar+(y+.5-origin.y)**2;
      if(distance>best)continue;
      const id=getBlock(x,y,z);
      if(!probeMinerals.has(id))continue;
      best=distance;nearest={x,y,z,id,distance:Math.sqrt(distance)};
    }
  }
  return nearest;
}
function useHuntUtility(id){
  if(id==="vein_probe"){
    const vein=nearestProbedVein(attackOrigin());
    sound("magic",vein&&vein.distance<6?.57:.34);
    return toast(vein?`${itemName(vein.id)} a ${Math.round(vein.distance)} m · X ${vein.x} · Y ${vein.y} · Z ${vein.z}`:"A sonda não encontrou um veio a até 12 m.");
  }
  let result;
  if(id==="soot_filter"){
    const mask=equipped.face?.id,condition=scienceSystem.equipmentCondition(mask);
    if(!condition?.filterMaximum)return toast("Equipe uma máscara com filtro.");
    if(condition.broken)return toast("Repare a máscara antes de trocar o filtro.");
    if(condition.filter>=condition.filterMaximum)return toast("O filtro da máscara já está cheio.");
    result=scienceSystem.refillEquipment(mask,"filter",id);
  }else{
    const pickaxe=invSlots.slice(0,9).filter(slot=>EQUIPMENT_DEFS[slot?.id]?.miningSpeed)
      .map(slot=>scienceSystem.equipmentCondition(slot.id))
      .reduce((lowest,condition)=>!lowest||condition.ratio<lowest.ratio?condition:lowest,null);
    if(!pickaxe||pickaxe.ratio>=1)return toast("Coloque uma picareta gasta na barra rápida.");
    result=scienceSystem.sharpenPickaxe(pickaxe.id);
  }
  if(result.ok){updateVitals();renderInventory();sound("pickup",.56)}
  toast(result.message);
}
function useOrPlace(){
  if(player.petrified>0||gasBlackout>0||sleeping)return;
  if(riding)return attackWithMount();
  const deckTarget=state.deckTarget;
  if(deckTarget?.kind==="cargo")return openBoatCargo(deckTarget.vehicle);
  if(deckTarget?.kind==="sail")return vehicles.toggleSail(deckTarget.vehicle);
  if(deckTarget?.kind==="deckBlock")return toast("Construa apenas nas partes livres do piso do barco.");
  if(deckTarget?.kind==="deck"){
    const id=selectedItem();
    if(typeof id!=="number")return toast("Selecione um bloco e mire um espaço livre do piso.");
    const built=vehicles.buildOnDeck(deckTarget,id,()=>dev.infinite||isCreative()||transactInventory([[id,1]],[]).ok);
    if(built)sound("place",.52);
    return built;
  }
  if(vehicles.current())return vehicles.operate(state.target);
  const vehicleItem=selectedItem();
  if(Object.hasOwn(exterminationTools,vehicleItem))return useExterminationTool(vehicleItem);
  if(activeHuntUtilities.has(vehicleItem))return useHuntUtility(vehicleItem);
  if(["bucket","water_bucket","lava_bucket"].includes(vehicleItem))return useWorldBucket(vehicleItem);
  if(QuimiCraftVehicles.kindOf(vehicleItem))return vehicles.deploy(vehicleItem,vehiclePlacementTarget(vehicleItem));
  if(vehicleItem===QuimiCraftVehicles.motor)return vehicles.install();
  if(QuimiCraftAlchemy.potions[selectedItem()])return useAlchemyPotion(selectedItem());
  if(selectedItem()==="petrifying_vial")return throwPetrifier();
  const active=professionFishingActive&&QuimiCraftWorkshops.fishingRods.has(selectedItem());
  if(active)return professions.use({kind:"fish"});
  const target=state.target;
  if(target?.n[1]===1&&typeof selectedItem()==="number"&&fieldLab.byBlock.has(target.id))return placeSelected();
  if(player.vel.y>0&&typeof selectedItem()==="number"&&target?.n[1]===1&&BDEF[target.id]?.solid&&
     !BDEF[target.id].station&&![BLOCK.DOOR,BLOCK.FURNACE,BLOCK.LAB].includes(target.id))return placeSelected();
  const action=interactionAction();
  if(action)return interact(action);
  const id=selectedItem();if(id==="cup"||id==="hazardous_container")return fillWaterContainer(id);if(WEAPONS.has(id))return attackSelected(true);
  if(FOOD_VALUES[id])return consumeFood(id,FOOD_VALUES[id]);if(DRINK_VALUES[id])return consumeDrink(id,DRINK_VALUES[id]);
  if(id==="antidote"){if(player.health>=100&&!playerVenom)return toast("Sua vida já está cheia");removeItem("antidote",1);playerVenom=null;player.health=Math.min(100,player.health+38);saveInventory();renderInventory();updateVitals();sound("pickup",.7);return toast("Antídoto utilizado · veneno neutralizado e até 38 de vida recuperados")}
  placeSelected()
}
const replaceableBlocks=new Set([BLOCK.AIR,BLOCK.WATER,BLOCK.LAVA,BLOCK.FIRE]);
function isFenceSupport(x,y,z){
  const block=BDEF[getBlock(x,y,z)];
  return !!(block?.gate||block?.barrier);
}
function toggleGate(t){
  const gate=BDEF[getBlock(t.x,t.y,t.z)]?.gate;
  if(!gate)return false;
  if(gate.open&&(blockHitsPlayer(t.x,t.y,t.z)||blockHitsPlayer(t.x,t.y+1,t.z)||
    entities.some(e=>!e.dead&&Math.abs(e.x-t.x-.5)<.68&&Math.abs(e.z-t.z-.5)<.68&&Math.abs(e.y-t.y)<1.4)))
    return toast("Deixe a passagem livre para fechar o portão.");
  setBlock(t.x,t.y,t.z,gate.first+gate.axis+(gate.open?0:2));
  sound("place",.48);
  return true;
}
let bedSpawn=null,sleeping=null;
function bedReturnPosition(){
  if(!bedSpawn)return null;
  const id=getBlock(bedSpawn.x,bedSpawn.y,bedSpawn.z),parts=id===bedSpawn.id&&survival.bedAt(BLOCK,BDEF,getBlock,bedSpawn);
  if(!parts){bedSpawn=null;return null}
  for(const {x,y,z} of parts)for(const [dx,dz] of survival.headings){
    const exit=new THREE.Vector3(x+.5+dx,y,z+.5+dz);
    if(!collides(exit,1.72)&&supportedAt(exit)&&!isWaterAt(exit.x,y+.1,exit.z)&&!liquidContains(BLOCK.LAVA,exit.x,y+.1,exit.z))return exit;
  }
  return null;
}
function bedHasHostile({x,y,z}){
  return [...entities,...fishSchool].some(e=>e.hostile&&!e.dead&&Math.hypot(e.x-x-.5,e.z-z-.5)<8.5&&Math.abs(e.y-y)<5);
}
function beginSleep(t){
  const parts=survival.bedAt(BLOCK,BDEF,getBlock,t);
  if(sleeping||!parts||player.inWater)return false;
  bedSpawn={...parts[0]};
  const reason=survival.sleepIssue({night:folklore.isNight(state.day),storm:currentWeather()==="storm",hostile:bedHasHostile(bedSpawn)});
  saveWorldState();
  if(reason)return toast("Ponto de retorno marcado. "+reason);
  sleeping={parts,left:1.35};
  player.vel.set(0,0,0);state.left=false;queuedPlacement=null;
  $("sleepScreen").classList.add("active");
  return true;
}
function endSleep(){
  sleeping=null;$("sleepScreen").classList.remove("active");
}
function updateSleep(dt){
  if(!sleeping)return false;
  if(player.health<=0||bedHasHostile(sleeping.parts[0])||
    sleeping.parts.some(cell=>getBlock(cell.x,cell.y,cell.z)!==cell.id)){
    endSleep();toast("O descanso foi interrompido.");return false;
  }
  sleeping.left-=dt;
  if(sleeping.left>0)return true;
  state.dayCount++;state.day=.008;
  climateState.elapsed+=85;
  state.bedClearUntil=climateState.elapsed+65;
  const exit=bedReturnPosition();
  if(exit)player.pos.copy(exit);
  player.fallStart=player.pos.y;endSleep();saveWorldState();
  toast("Amanheceu. Ponto de retorno marcado na cama.");
  return true;
}
function placementIssue({x,y,z,id}){
  if(id===BLOCK.BED){
    for(const cell of survival.bedParts(BLOCK,{x,y,z},fieldPlacementAxis())){
      if(cell.y<1||cell.y>=MAX_Y||isLabPlacementRestricted(cell.x,cell.y,cell.z)||getBlock(cell.x,cell.y,cell.z)!==BLOCK.AIR||
        !BDEF[getBlock(cell.x,cell.y-1,cell.z)]?.solid)return "A cama precisa de dois espaços livres com chão firme.";
    }
    return null;
  }
  const hoodPart=fieldLab.byBlock.get(getBlock(x,y-1,z));
  if(hoodPart?.unit.id==="fume_hood"&&hoodPart.x>=3)return "Use um dos seis espaços da bancada da capela.";
  if(hoodUpperPart(x,y-2,z)||hoodUpperPart(x,y-3,z))
    return "Libere a cobertura e a saída do exaustor da capela.";
  const structure=fieldLab.byBlock.get(id)?.unit;
  if(structure){
    const site={x,y,z},axis=fieldPlacementAxis();
    for(const cell of fieldLab.footprint(structure,site,axis)){
      const height=structure.id==="fume_hood"?4:structure.id==="field_analyzer"?1:2;
      for(let dy=0;dy<height;dy++){
        const py=y+dy;
        if(py<1||py>=MAX_Y||isLabPlacementRestricted(cell.x,py,cell.z)||getBlock(cell.x,py,cell.z)!==BLOCK.AIR)
          return "Libere toda a área para instalar "+structure.name+".";
      }
      const base=fieldLab.byBlock.get(getBlock(cell.x,y-1,cell.z));
      if(base?.unit.id==="fume_hood"&&base.x>=3)return "Use os seis espaços da bancada da capela.";
    }
    return null;
  }
  if(isLabPlacementRestricted(x,y,z)||id===BLOCK.DOOR&&isLabPlacementRestricted(x,y+1,z))
    return "Não é permitido construir dentro do Laboratório Carbono.";
  if(y<1||y>=MAX_Y||!replaceableBlocks.has(getBlock(x,y,z)))return "Sem espaço para colocar aqui.";
  if(BDEF[id]?.barrier&&BDEF[getBlock(x,y+1,z)]?.solid)return "Deixe um bloco livre acima da cerca ou mureta.";
  if(id===BLOCK.DOOR&&(y+1>=MAX_Y||getBlock(x,y+1,z)!==BLOCK.AIR))return "A porta precisa de dois blocos livres.";
  return null;
}
function placementOverlaps({x,y,z,id}){
  if(id===BLOCK.BED)return survival.bedParts(BLOCK,{x,y,z},fieldPlacementAxis()).some(cell=>blockHitsPlayer(cell.x,cell.y,cell.z));
  const structure=fieldLab.byBlock.get(id)?.unit;
  if(structure)return fieldLab.footprint(structure,{x,y,z},fieldPlacementAxis()).some(cell=>blockHitsPlayer(cell.x,cell.y,cell.z));
  return BDEF[id].solid&&(blockHitsPlayer(x,y,z)||(id===BLOCK.DOOR||BDEF[id].barrier)&&blockHitsPlayer(x,y+1,z));
}
function fieldPlacementAxis(){
  const x=-Math.sin(player.yaw),z=-Math.cos(player.yaw);
  return Math.abs(x)>Math.abs(z)?x>0?0:2:z>0?1:3;
}
function settlePlacement(site){
  const {x,y,z,id,slotIndex}=site,slot=invSlots[slotIndex];
  if(!slot||slot.id!==id||slot.count<1||placementIssue(site)||placementOverlaps(site))return false;
  const structure=fieldLab.byBlock.get(id)?.unit;
  if(structure){
    const dirty=new Map();
    for(const cell of fieldLab.footprint(structure,site,fieldPlacementAxis()))editVoxel(cell.x,cell.y,cell.z,cell.id,dirty);
    commitVoxelEdits(dirty);
  }else if(id===BLOCK.BED){
    const dirty=new Map();
    for(const cell of survival.bedParts(BLOCK,site,fieldPlacementAxis()))editVoxel(cell.x,cell.y,cell.z,cell.id,dirty);
    commitVoxelEdits(dirty);
  }else if(BDEF[id].gate){
    const eastWest=[-1,1].filter(dx=>isFenceSupport(x+dx,y,z)).length;
    const northSouth=[-1,1].filter(dz=>isFenceSupport(x,y,z+dz)).length;
    const axis=eastWest===northSouth?Number(Math.abs(Math.sin(player.yaw))>.707):Number(northSouth>eastWest);
    setBlock(x,y,z,BDEF[id].gate.first+axis);
  }else if(id===BLOCK.DOOR){
    const axis=Math.abs(Math.sin(player.yaw))>.7?0:1;
    for(let half=0;half<=1;half++){
      doorMeta.set(key3(x,y+half,z),{axis,half,hinge:-1,swing:1});
      setBlock(x,y+half,z,id);
    }
  }else setBlock(x,y,z,id);
  wakeNearbyScreamers({x:x+.5,y:y+.5,z:z+.5},4.4);
  if(id===BLOCK.FIRE)angerFolklore("boitata",{x,y,z},17,playerActor);
  if(!dev.infinite&&!isCreative()&&--slot.count===0)invSlots[slotIndex]=null;
  saveInventory();renderInventory();
  sound(placementsWithLight.has(id)?"torch":"place",.52);
  if(placementsWithLight.has(id))updateTorches();
  return true;
}
function placeSelected(){
  const target=state.target,slot=invSlots[state.selected],id=slot?.id;
  queuedPlacement=null;
  if(!target||typeof id!=="number"||!BDEF[id]||slot.count<1)return false;
  const [dx,dy,dz]=target.n;
  const site={x:target.x+dx,y:target.y+dy,z:target.z+dz,id,slotIndex:state.selected};
  const problem=placementIssue(site);
  if(problem){toast(problem);return false}
  if(placementOverlaps(site)){
    const {x,y,z}=site;
    if(id!==BLOCK.DOOR&&!fieldLab.byBlock.has(id)&&dy===1&&BDEF[target.id]?.solid&&horizon.canBufferUnderfoot(player.pos,x,y,z,player.vel.y)){
      queuedPlacement={...site,support:target.id,left:.37};
      return true;
    }
    toast("Sem espaço para colocar aqui.");
    return false;
  }
  return settlePlacement(site);
}
function updateQueuedPlacement(dt){
  if(!queuedPlacement)return;
  const site=queuedPlacement,{x,y,z,id,slotIndex,support}=site;
  site.left-=dt;
  if(site.left<=0||player.inWater||dev.fly||player.health<=0||state.selected!==slotIndex||invSlots[slotIndex]?.id!==id||
     !horizon.overFootprint(player.pos,x,z,.17)||getBlock(x,y-1,z)!==support||placementIssue(site)){
    queuedPlacement=null;
    return;
  }
  if(placementOverlaps(site)&&player.vel.y>0)return;
  queuedPlacement=null;
  settlePlacement(site);
}

const particleGroup=new THREE.Group();scene.add(particleGroup);const particleGeo=new THREE.BoxGeometry(.1,.1,.1),particles=[];
function burstBlock(t){if(settings.particles===0)return;const col=new THREE.Color(BDEF[t.id]?.icon||"#888"),count=settings.particles===1?6:12;for(let i=0;i<count;i++){const m=new THREE.Mesh(particleGeo,new THREE.MeshLambertMaterial({color:col.clone().multiplyScalar(.75+hash(i,t.x,t.z)*.4)}));m.position.set(t.x+.5+(hash(i,1)-.5)*.55,t.y+.5+(hash(i,2)-.5)*.55,t.z+.5+(hash(i,3)-.5)*.55);m.scale.setScalar(.6+hash(i,4)*1.2);m.userData.v=new THREE.Vector3((hash(i,5)-.5)*3,1+hash(i,6)*3,(hash(i,7)-.5)*3);m.userData.life=.65+hash(i,8)*.4;particleGroup.add(m);particles.push(m)}}
function dustBurst(pos,count=8){if(settings.particles===0)return;count=settings.particles===1?Math.ceil(count/2):count;for(let i=0;i<count;i++){const m=new THREE.Mesh(particleGeo,new THREE.MeshBasicMaterial({color:0xb59b73,transparent:true,opacity:.42}));m.position.set(pos.x+(hash(i,33)-.5)*.8,pos.y+.04,pos.z+(hash(i,34)-.5)*.8);m.scale.setScalar(.45+hash(i,35));m.userData.v=new THREE.Vector3((hash(i,36)-.5)*1.8,.4+hash(i,37),(hash(i,38)-.5)*1.8);m.userData.life=.45+hash(i,39)*.4;particleGroup.add(m);particles.push(m)}}
function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.userData.life-=dt;if(!p.userData.floating){p.userData.v.y-=7*dt;p.rotation.x+=dt*5;p.rotation.z+=dt*3}p.position.addScaledVector(p.userData.v,dt);if(p.material.transparent)p.material.opacity=Math.max(0,p.userData.life*.6);if(p.userData.life<=0){particleGroup.remove(p);p.material.dispose();particles.splice(i,1)}}}

const projectileRoot=new THREE.Group(),projectiles=[],dropRoot=new THREE.Group(),worldDrops=[];scene.add(projectileRoot,dropRoot);
function aimDirection(){return new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch)).normalize()}
function attackOrigin(){return new THREE.Vector3(player.pos.x,player.pos.y+1.42,player.pos.z)}
const elementalParticles={
  fire:{geo:new THREE.OctahedronGeometry(.068),shape:[.62,1.66,.62],lift:1.7,scatter:2.4,float:true},
  magma:{geo:new THREE.DodecahedronGeometry(.087),shape:[1,1,.82],lift:1.7,scatter:2.6},
  stone:{geo:new THREE.BoxGeometry(.12,.095,.10),shape:[1,1,1],lift:1.35,scatter:4},
  ice:{geo:new THREE.OctahedronGeometry(.081),shape:[.50,1.88,.63],lift:1.3,scatter:3.3},
  lightning:{geo:new THREE.BoxGeometry(.035,.215,.037),shape:[1,1,1],lift:1.3,scatter:5,float:true,short:true},
  venom:{geo:new THREE.SphereGeometry(.057,7,5),shape:[.75,1.26,.75],lift:1.30,scatter:2.25},
  vapor:{geo:new THREE.SphereGeometry(.14,7,5),shape:[1.3,1,1.26],lift:.38,scatter:1.1,float:true}
};
const gustGeometry=new THREE.BoxGeometry(.34,.013,.018);
function windMote(position,dx,dz,strength){
  const mote=new THREE.Mesh(gustGeometry,new THREE.MeshBasicMaterial({color:0xcdedd9,transparent:true,depthWrite:false}));
  mote.position.copy(position);mote.rotation.y=-Math.atan2(dz,dx);
  mote.userData={v:new THREE.Vector3(dx*strength*4,0,dz*strength*4),life:.51,floating:true};
  particleGroup.add(mote);particles.push(mote);
}
function combatParticles(pos,color=0xffffff,count=8,style=""){
  if(settings.particles===0)return;
  count=settings.particles===1?Math.ceil(count/2):count;
  const fx=elementalParticles[style];
  for(let i=0;i<count;i++){
    const m=new THREE.Mesh(fx?.geo??particleGeo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.82}));
    m.position.copy(pos);
    m.scale.set(...(fx?.shape??[1,1,1])).multiplyScalar(.5+Math.random()*1.1);
    if(fx)m.rotation.set(Math.random()*TAU,Math.random()*TAU,Math.random()*TAU);
    const spread=fx?.scatter??3;
    m.userData.v=new THREE.Vector3((Math.random()-.5)*spread,(Math.random()-.1)*2.5+(fx?.lift??0),(Math.random()-.5)*spread);
    m.userData.life=fx?.short?.16+Math.random()*.16:.3+Math.random()*.45;
    m.userData.floating=!!fx?.float;
    particleGroup.add(m);particles.push(m);
  }
}
const projectileForward=new THREE.Vector3(0,0,-1);
const frontierFx=QuimiCraftEffects.create(THREE,scene,()=>settings.particles,()=>document.documentElement.classList.contains("reduced-motion"));
const aquaticFx=QuimiCraftAquatic.createSplashEffects(THREE,scene,()=>settings.particles);
const dragonShotLight=new THREE.PointLight(0xffffff,0,4.8,2);
const dragonBursts=new Map();
projectileRoot.add(dragonShotLight);

function launchProjectile(kind,origin,dir,attack=null,owner=null){
  const breath=attack?.dragon?QuimiCraftDragons.breathStyles[attack.element]:null;
  const effect=breath?frontierFx.dragonShot(attack,breath):null;
  const group=effect?.group??new THREE.Group();
  let speed=22,damage=13,ttl=3.1;
  if(kind==="wind"){
    const style=attack?.style,color=attack?.color||0x8cf5ff,trim=attack?.trim||0xaafaff;
    const small=style==="wand",orb=style==="frost"||small?new THREE.OctahedronGeometry(small?.091:.19,0):new THREE.IcosahedronGeometry(.16,style==="prism"?0:1);
    const core=new THREE.Mesh(orb,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.87}));
    if(small)core.scale.z=2.1;
    group.add(core);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(small?.13:.25,small?.013:.022,6,style?8:14),new THREE.MeshBasicMaterial({color:trim,transparent:true,opacity:.66}));
    group.add(ring);
    if(style){
      const halo=ring.clone();halo.geometry=ring.geometry.clone();halo.material=ring.material.clone();halo.rotation.y=Math.PI/2;group.add(halo);
    }
    speed=attack?.speed??17;damage=attack?.damage??8;ttl=2.2;
  }else if(kind==="enemy"||kind==="mount"){
    if(!effect){
      const ember=owner?.type==="furnace_weaver";
      group.add(new THREE.Mesh(new THREE.OctahedronGeometry(.13,0),ember?mobMats.lava:mobMats.purple));
      group.add(new THREE.Mesh(new THREE.TorusGeometry(.19,.014,5,12),ember?mobMats.red:windMat));
    }
    speed=attack.speed??10;damage=attack.damage;ttl=2.7;
    if(breath)ttl=kind==="mount"?2.2:Math.max(1.4,attack.range*breath.range/speed);
  }else{
    const model=playerModels.item(kind==="petrifier"?"petrifying_vial":attack?.ammo||"arrow","first");
    model.scale.setScalar(1);
    group.add(model);
    speed=attack?.speed??26;
    if(attack)damage=attack.damage;
  }
  group.position.copy(origin);
  group.quaternion.setFromUnitVectors(projectileForward,dir);
  projectileRoot.add(group);
  const trail=frontierFx.trail(effect?attack.element:attack?.venom?"venom":kind);
  trail?.move(origin);
  projectiles.push({kind,group,owner,attack,vel:dir.clone().multiplyScalar(speed),damage,ttl,trail,breath,effect});
  return group;
}
function launchDragonBreath(kind,e,start,direction,attack,target=null){
  const origin=start.clone().addScaledVector(direction,.27);
  if(!combatSegmentClear(start,origin))return;
  const burst=QuimiCraftDragons.rollBurst(attack);
  if(burst){
    if(target)direction=entityAimPoint(target).sub(start).normalize();
    else if(kind==="mount")direction=aimDirection();
    burst.kind=kind;burst.target=target;burst.direction=direction.clone();
    burst.attack={...attack,burst:true};
    burst.precharge=frontierFx.dragonCharge(QuimiCraftDragons.breathStyles[attack.element]);
    dragonBursts.set(e,burst);e.dragonBurst=burst;
    if(e.ai)e.ai.aim=0;
    e.mountedStrike=0;
    chargeBreathSound(start);
    if(kind==="mount"||target===playerActor)toast(e.name+" · Carregando rajada…");
    return;
  }
  launchProjectile(kind,origin,direction,attack,e);
  frontierFx.dragonBurst(attack.element,start,direction,false);
  sound("magic",kind==="mount"?.82:.88);
}
function closeDragonBurst(e){
  const burst=dragonBursts.get(e);
  if(!burst)return;
  burst.precharge?.close();burst.effect?.close();dragonBursts.delete(e);e.dragonBurst=null;
}
function updateDragonBursts(dt){
  for(const [e,burst] of dragonBursts){
    if(e.dead||(burst.kind==="mount"?riding?.actor!==e:!QuimiCraftAI.canPursue(e,combatTargetAvailable))){
      closeDragonBurst(e);continue;
    }
    const direction=burst.direction,start=e.rig.nose.getWorldPosition(new THREE.Vector3());
    const aim=burst.kind==="mount"?aimDirection():burst.target&&!burst.target.dead?
      entityAimPoint(burst.target).sub(start).normalize():null;
    if(aim&&aim.dot(direction)>-.1)direction.lerp(aim,1-Math.exp(-dt*(burst.kind==="mount"?6:2.05))).normalize();
    else if(aim&&burst.kind==="mount")direction.copy(aim);
    const style=QuimiCraftDragons.breathStyles[burst.attack.element];
    const near=start.distanceToSquared(player.pos)<14**2;
    const streamTime=QuimiCraftDragons.advanceCharge(burst,dt);
    if(burst.precharge&&!burst.roared&&burst.chargeLeft<=.61){
      burst.roared=true;
      dragonRoarSound(start,e.type,burst.chargeLeft);
    }
    if(burst.chargeLeft>0){
      const load=1-burst.chargeLeft/QuimiCraftDragons.burstRules.charge;
      burst.precharge.move(start,direction,load);
      if(near){
        dragonShotLight.position.copy(start).addScaledVector(direction,.24);
        dragonShotLight.color.setHex(style.light);
        dragonShotLight.intensity=.45+load*load*4.1;
      }
      continue;
    }
    if(burst.precharge){
      burst.precharge.close();burst.precharge=null;
      burst.effect=frontierFx.dragonStream(burst.attack.element,style);
      frontierFx.dragonBurst(burst.attack.element,start,direction,false);
      e.dragonRelease=.34;
      if(near){sound("magic",1.1);noiseBurst(.29,.084,510)}
    }
    const end=start.clone().addScaledVector(direction,burst.range),steps=Math.ceil(burst.range/.22);
    let length=burst.range;
    for(let i=1;i<=steps;i++){
      const distance=burst.range*i/steps,x=start.x+direction.x*distance,y=start.y+direction.y*distance,z=start.z+direction.z*distance;
      if(combatPointBlocked(x,y,z)||burst.kind==="enemy"&&labSafe(x,y,z)){
        length=burst.range*(i-1)/steps;break;
      }
    }
    if(near){
      dragonShotLight.position.copy(start).lerp(end,.11);
      dragonShotLight.color.setHex(style.light);
      dragonShotLight.intensity=5.5;
    }
    const active=QuimiCraftDragons.advanceBurst(burst,streamTime,damage=>{
      const victims=burst.kind==="enemy"?[playerActor,...npcs.filter(n=>n.role!=="child")]:attackableActors();
      for(const target of victims){
        if(target===e||target.dead||target.ai?.recovering>0||burst.kind==="mount"&&target.bonded)continue;
        const point=entityAimPoint(target),delta=point.clone().sub(start),along=delta.dot(direction);
        if(along<0||along>length||delta.lengthSq()-along*along>(.20+along*.105+entityProjectileRadius(target))**2||
          !combatSegmentClear(start,point))continue;
        if(target===playerActor)burst.shielding=damagePlayer(damage,e.name+" · rajada",burst.attack.effect,burst.attack)===true;
        else if(burst.kind==="enemy")hitNPC(target,damage,e);
        else{
          if(hitEntity(target,damage,e.name+" · rajada",null,e,burst.attack))slowCreature(target,burst.attack.slow);
        }
      }
    });
    let visibleLength=length,shieldContact=null;
    if(burst.shielding&&dragonGuardPose.hold>0&&equipped.offhand?.id==="shield_dragon"&&equipmentDefinition("offhand")){
      const delta=entityAimPoint(playerActor).sub(start),along=delta.dot(direction);
      if(along>0&&along<=length&&delta.lengthSq()-along*along<(.8+along*.105)**2){
        const shield=guardShieldMesh(),surface=shield&&shield.localToWorld(new THREE.Vector3(0,.045,-.19));
        const hit=surface?surface.sub(start).dot(direction):along-.53;
        visibleLength=clamp(hit,Math.max(0,along-1.05),Math.max(0,along-.12));
        shieldContact=shield;
      }
    }
    burst.effect.move(start,direction,visibleLength,streamTime,visibleLength===length&&length<burst.range,shieldContact);
    if(!active)closeDragonBurst(e);
  }
}
function slowCreature(e,seconds){
  if(seconds&&!e.dead)e.frostTime=Math.max(e.frostTime||0,seconds);
}
const creatureAfflictions=new Map();
let playerVenom=null;
const meleeElements={
  fire:{burn:3.4,trim:"#ffc174",style:"fire"},magma:{burn:6.2,trim:"#ff724b",style:"magma"},
  stone:{stun:.65,trim:"#d1af85",style:"stone"},ice:{slow:3.8,trim:"#aeeaff",style:"ice"},
  lightning:{stun:.95,trim:"#fff192",style:"lightning"},venom:{venom:true,trim:"#a5e674",style:"venom"},
  spectral:{trim:"#89ffe9",style:"vapor"}
};
function afflictCreature(e,effect,attacker=playerActor){
  if(!effect||e.dead||e.persistent)return;
  if(effect.slow)slowCreature(e,effect.slow);
  if(effect.stun)e.stunned=Math.max(e.stunned||0,effect.stun);
  if(effect.petrify){
    restoreMobColor(e);
    e.vx=e.vz=0;
    e.stunned=Math.max(e.stunned||0,effect.petrify);
    if(!e.stoneSkin){
      e.stoneSkin=new Map();
      e.group.traverse(node=>{
        if(!node.isMesh||node.material.transparent)return;
        e.stoneSkin.set(node,node.material);
      node.material=node.isSkinnedMesh?petrifiedSkin:petrifiedMaterial;
      });
    }
    creatureAfflictions.set(e,creatureAfflictions.get(e)??{});
  }
  if(effect.venom||effect.burn){
    const statuses=creatureAfflictions.get(e)??{};
    const id=effect.venom?"venom":"burn",left=effect.venom?6.4:effect.burn;
    statuses[id]={left,next:statuses[id]?.next??.7,attacker};
    creatureAfflictions.set(e,statuses);
  }
}
function clearCreatureStone(e){
  if(!e.stoneSkin)return;
  restoreMobColor(e);
  for(const [node,material] of e.stoneSkin)node.material=material;
  e.stoneSkin=null;
}
function stepCreatureStun(e,dt){
  if(!(e.stunned>0))return false;
  e.stunned=Math.max(0,e.stunned-dt);
  if(!e.stunned)clearCreatureStone(e);
  if(e.ai.swing)e.ai.swing=null;
  if(e.dragonBurst)closeDragonBurst(e);
  if(e.aquatic)e.strike=null;
  e.ai.mode=e.stoneSkin?"stone":"stun";
  return true;
}
function updateAfflictions(dt){
  if(playerVenom){
    playerVenom.left-=dt;playerVenom.next-=dt;
    if(playerVenom.next<=0){playerVenom.next+=1.2;damagePlayer(3,"veneno","toxicity")}
    if(playerVenom.left<=0||player.health<=0)playerVenom=null;
  }
  $("venomStatus").hidden=!playerVenom;
  for(const [e,statuses] of creatureAfflictions){
    if(e.dead){clearCreatureStone(e);creatureAfflictions.delete(e);continue}
    for(const [id,dose] of Object.entries(statuses)){
      dose.left-=dt;dose.next-=dt;
      if(dose.next<=0&&!e.dead){
        dose.next+=1.05;
        const tint=id==="venom"?meleeElements.venom:meleeElements.fire;
        combatParticles(entityAimPoint(e),tint.trim,4,tint.style);
        hitEntity(e,id==="venom"?2:3,id==="venom"?"veneno":"queimadura",new THREE.Vector3(),dose.attacker);
      }
      if(dose.left<=0)delete statuses[id];
    }
    if(!statuses.venom&&!statuses.burn&&!e.stoneSkin)creatureAfflictions.delete(e);
  }
}
function throwPetrifier(){
  if(labSafe()||player.attackCooldown>0)return;
  if(!removeItem("petrifying_vial",1))return;
  const dir=aimDirection();
  launchProjectile("petrifier",attackOrigin().addScaledVector(dir,.48),dir,{speed:17,damage:2,petrify:4.8});
  player.attackCooldown=.72;state.attackAnim=.3;
  saveInventory();renderInventory();sound("splash",.54);
}
function castStaff(w,alt){
  if(player.attackCooldown>0)return;
  const cost=magicCost(alt?w.altMana:w.mana),power=1+equipmentStat("magicPower");
  if(player.mana<cost)return toast("Mana insuficiente");
  player.mana-=cost;player.attackCooldown=alt?w.altDelay:w.cooldown;
  state.attackAnim=.3;sound("magic",.7);wakeNearbyScreamers(player.pos,8);
  const dir=aimDirection(),from=attackOrigin(),focus=!w.style&&countItem("storm_focus")>0;
  const orb=(heading,damage)=>launchProjectile("wind",from.clone().addScaledVector(heading,.65),heading,
    {...w,damage:damage*power,speed:w.speed*(focus?1.12:1)});
  if(!alt){
    frontierFx.cast(from.clone().addScaledVector(dir,.7),dir);
    orb(dir,focus?12:w.damage);
  }else if(w.style==="prism"||w.spectralWeapon){
    for(const angle of [-.16,0,.16])orb(dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle),9);
    toast(w.special);
  }else if(w.style==="wand"){
    for(const angle of [-.074,.074])orb(dir.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle),w.damage+1);
    toast(w.special);
  }else{
    const frost=w.style==="frost",lunar=w.style==="silver",radius=frost?5.2:6+(focus?1.5:0);
    frontierFx.cast(player.pos.clone().add(new THREE.Vector3(0,.28,0)),dir,true);
    combatParticles(player.pos.clone().add(new THREE.Vector3(0,1,0)),frost||lunar?w.color:0x8cecf5,22);
    for(const e of attackableActors()){
      if(e.dead)continue;
      const dx=e.x-player.pos.x,dz=e.z-player.pos.z,d=Math.hypot(dx,dz),point=entityAimPoint(e);
      if(d>=radius||Math.abs(point.y-from.y)>3.6||!combatSegmentClear(from,point))continue;
      const push=new THREE.Vector3(dx,0,dz).normalize().multiplyScalar(frost?3:focus?11:8);
      if(hitEntity(e,(lunar?20:frost?5:focus?10:6)*power,w.special,push,playerActor,w))slowCreature(e,w.slow);
    }
    toast(focus?"Ciclone prismático":w.special);
  }
  updateVitals();
}
function useOffhandFocus(){
  if(player.petrified>0||gasBlackout>0)return false;
  if(riding||vehicles.current()||labSafe())return false;
  const id=equipped.offhand?.id,focus=QuimiCraftArsenal.focuses[id];
  if(!focus)return false;
  if(twoHandedWeapon()){toast("A arma ocupa as duas mãos.");return false}
  if(state.focusCooldown>0)return false;
  if(scienceSystem?.equipmentCondition(id)?.broken){toast(itemName(id)+" está danificado. Repare no laboratório.");return false}
  const cost=magicCost(focus.mana),damage=focus.damage*(1+equipmentStat("magicPower"));
  if(player.mana<cost){toast("Mana insuficiente");return false}
  player.mana-=cost;state.focusCooldown=focus.cooldown;state.offhandAnim=.4;
  const from=attackOrigin(),dir=aimDirection();
  if(focus.shape==="orb"){
    launchProjectile("wind",from.clone().addScaledVector(dir,.58),dir,{...focus,damage,style:"resonant"});
    frontierFx.cast(from,dir);
  }else{
    frontierFx.cast(player.pos.clone().add(new THREE.Vector3(0,.25,0)),dir,true);
    combatParticles(player.pos.clone().add(new THREE.Vector3(0,.75,0)),focus.trim,26);
    for(const e of attackableActors()){
      const point=entityAimPoint(e),delta=point.clone().sub(from);
      if(e.dead||e.bonded||Math.abs(delta.y)>3.1||delta.length()>focus.reach||!combatSegmentClear(from,point))continue;
      if(hitEntity(e,damage,focus.special,delta.setY(0).normalize().multiplyScalar(4.6)))slowCreature(e,focus.slow);
    }
  }
  scienceSystem?.damageEquipment(id,1.25,"conjuração");
  sound("magic",.72);wakeNearbyScreamers(player.pos,7);updateVitals();updateCombatHint();
  return true;
}
function crossbowHint(){
  const action=player.crossbowArmed?(player.attackCooldown>0?"Armando…":"Pronta para disparar"):"Clique para armar";
  return "Balestra · "+action+" · "+countItem("bolt")+" comuns · "+countItem("silver_bolt")+" prateados";
}
function updateCrossbowHint(){updateCombatHint()}
function shootArrow(w){
  if(player.attackCooldown>0)return false;
  const crossbow=w.family==="crossbow",poisoned=!crossbow&&countItem("venom_arrow")>0;
  const silverAmmo=crossbow?"silver_bolt":"silver_arrow";
  const ammo=countItem(silverAmmo)?silverAmmo:poisoned?"venom_arrow":w.ammo||"arrow";
  const cycle=1-equipmentStat("archeryCycle");
  if(!dev.infinite&&!isCreative()&&countItem(ammo)<1){toast("Sem "+(crossbow?"virotes":"flechas"));return false}
  if(crossbow&&!player.crossbowArmed){
    player.crossbowArmed=true;player.attackCooldown=w.reload*cycle;state.attackAnim=.3;
    sound("bow",.31);updateCrossbowHint();
    return false;
  }
  if(crossbow)player.crossbowArmed=false;
  player.attackCooldown=w.cooldown*cycle;state.attackAnim=.3;
  const dir=aimDirection();
  launchProjectile("arrow",attackOrigin().addScaledVector(dir,.75),dir,
    {...w,ammo,silver:w.silver||ammo===silverAmmo,venom:ammo==="venom_arrow",speed:w.speed*(1+equipmentStat("archerySpeed")),damage:w.damage*(1+equipmentStat("archeryPower"))});
  if(!dev.infinite&&!isCreative()){removeItem(ammo,1);saveInventory();renderHotbar()}
  else if(crossbow)updateCrossbowHint();
  sound("bow",crossbow?.92:.7);wakeNearbyScreamers(player.pos,4.5);
  return true;
}
function meleeAttack(w){
  if(player.attackCooldown>0)return;
  player.attackCooldown=w.cooldown;state.attackAnim=.3;sound(w.family==="mace"?"land":"sword",w.twoHanded?.99:.7);wakeNearbyScreamers(player.pos,5);
  const dir=aimDirection(),eye=attackOrigin();
  const damage=w.damage*(1+equipmentStat("meleePower"));
  const slot=invSlots[state.selected],coating=slot?.venomCharges>0;
  const element=w.family==="gauntlet"?meleeElements[w.element]:null;
  if(element){
    player.punchHand=-(player.punchHand??-1);
    combatParticles(eye.clone().addScaledVector(dir,.94),element.trim,8,element.style);
  }
  const hits=attackableActors().filter(e=>!e.dead).map(entity=>{
    const point=entityAimPoint(entity),reach=point.clone().sub(eye);
    return {entity,point,distance:reach.length(),dot:reach.normalize().dot(dir)};
  }).filter(hit=>hit.distance<w.reach&&hit.dot>(w.arc??.48)).sort((a,b)=>a.distance-b.distance);
  let landed=0;
  for(const {entity,point} of hits){
    if(!combatSegmentClear(eye,point))continue;
    if(!hitEntity(entity,damage,w.name,point.clone().sub(eye).setY(0).normalize().multiplyScalar(w.knockback??(w.element==="stone"?8:w.style==="obsidian"?5.5:4)),playerActor,w))continue;
    slowCreature(entity,w.slow);
    if(element){
      afflictCreature(entity,element);
      combatParticles(point,element.trim,15,element.style);
    }
    if(coating){
      afflictCreature(entity,meleeElements.venom);
      combatParticles(point,meleeElements.venom.trim,6,"venom");
    }
    if(++landed>=(w.targets??1))break;
  }
  if(!landed)combatParticles(eye.clone().addScaledVector(dir,1.6),w.color,3);
  else if(coating){slot.venomCharges--;saveInventory();renderHotbar()}
}
function attackSelected(alt=false){
  if(player.petrified>0||gasBlackout>0)return;
  if(labSafe())return toast("Combate desativado no Laboratório Carbono.");
  const id=selectedItem(),weapon=QuimiCraftArsenal.weapons[id];
  if(!weapon)return;
  const w=invSlots[state.selected].silvered?{...weapon,silver:true}:weapon;
  if(scienceSystem?.equipmentCondition(id)?.broken)return toast(itemName(id)+" está quebrado · repare no laboratório");
  const previous=player.attackCooldown;
  if(w.family==="staff")castStaff(w,alt);
  else if(w.family==="bow"||w.family==="crossbow"){if(!shootArrow(w))return}
  else meleeAttack(w);
  const staff=w.family==="staff";
  if(player.attackCooldown>previous)scienceSystem?.damageEquipment(id,staff&&alt?2.2:1,staff?"conjuração":w.reach?"ataque":"disparo");
}
const mobDamageFlashes=new Map(),mobMoveMultiplier=1.30;
function restoreMobColor(e){
  const flash=mobDamageFlashes.get(e);
  if(!flash)return;
  for(const [mesh,original] of flash.parts)mesh.material=original;
  for(const material of flash.materials.values())material.dispose();
  mobDamageFlashes.delete(e);
}

function flashMobDamage(e){
  const previous=mobDamageFlashes.get(e);
  const until=performance.now()+500;
  if(previous){previous.until=until;return}
  const parts=[],materials=new Map();
  const strength=document.documentElement.classList.contains("reduced-flashing")?.54:1;
  const hitColor=new THREE.Color(0xf93c32);
  const tint=material=>{
    if(!material.color)return material;
    if(!materials.has(material)){
      const red=material.clone();
      if(strength===1)red.color.copy(hitColor);else red.color.lerp(hitColor,strength);
      red.vertexColors=false;
      if(red.emissive){red.emissive.lerp(hitColor,strength*.68);red.emissiveIntensity=.50*strength}
      materials.set(material,red);
    }
    return materials.get(material);
  };
  e.group.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const original=mesh.material;
    parts.push([mesh,original]);
    mesh.material=Array.isArray(original)?original.map(tint):tint(original);
  });
  mobDamageFlashes.set(e,{until,parts,materials});
}

function mobKnockback(e,attacker,knock){
  const dx=knock?.x??(e.x-attacker.x),dz=knock?.z??(e.z-attacker.z);
  const distance=Math.hypot(dx,dz);
  if(knock&&distance<.001)return;
  const strength=knock?clamp(distance,1.55,3.15):1.85;
  const x=distance>.001?dx/distance:-Math.sin(e.angle||0);
  const z=distance>.001?dz/distance:-Math.cos(e.angle||0);
  e.vx=x*strength;e.vz=z*strength;
}

function moveMobAfterHit(e,dt){
  if(Math.hypot(e.vx||0,e.vz||0)<.02)return;
  const x=e.x+e.vx*dt,z=e.z+e.vz*dt;
  if(!entityCollidesWorld(e,x,z)&&(e.flying||entityTraversal.standing(e,x,z,e.y+.12,e.y-.2,entityRadius(e))!=null)){
    e.x=x;e.z=z;e.group.position.x=x;e.group.position.z=z;
  }
  const decay=Math.pow(.004,dt);
  e.vx*=decay;e.vz*=decay;
}

function updateMobDamageFlashes(now,dt){
  for(const [e,flash] of mobDamageFlashes){
    if(now>=flash.until){
      restoreMobColor(e);
      if(e.dead&&!e.aquatic)removeEntity(e);
    }else if(state.playing&&!e.aquatic&&(e.dead||e.ai.recovering||e.bonded&&e!==riding?.actor)){
      moveMobAfterHit(e,dt);
    }
  }
}

const vulnerableToFinisher=e=>e.hp<=Math.floor(e.maxHp*QuimiCraftBiomeFauna.finishFraction);
function useExterminationTool(id){
  if(labSafe())return toast("Combate desativado no Laboratório Carbono.");
  const e=aimedEntity(),from=attackOrigin();
  if(!e||e.dead||entityAimPoint(e).distanceTo(from)>3.25)return toast("Aproxime-se e mire na criatura.");
  const finisher=regionalFauna[e.type]?.finisher;
  if(finisher!==id)return toast(finisher?e.name+" exige "+itemName(finisher)+".":"Este equipamento é para criaturas de extermínio.");
  if(!vulnerableToFinisher(e))return toast("Enfraqueça "+e.name+" até 20% de vida.");
  if(player.attackCooldown>0)return;
  const tool=exterminationTools[id];
  if(tool.consumable&&!dev.infinite&&!isCreative()){
    const slot=invSlots[state.selected];
    if(--slot.count===0)invSlots[state.selected]=null;
    saveInventory();renderInventory();
  }
  player.attackCooldown=.55;state.attackAnim=.33;
  combatParticles(entityAimPoint(e),tool.color,14,tool.effect);
  sound(tool.consumable?"hit":id==="echo_fork"?"magic":"land",.68);
  e.hp=0;killEntity(e,itemName(id),playerActor);
}
function hitEntity(e,damage,source="ataque",knock=null,attacker=playerActor,attack=null){
  if(!e||e.persistent||e.dead)return false;
  const wildHunt=source==="caça natural";
  if(!spectral.canHurt(e,attack)){
    if(attacker===playerActor&&(!e.spectralHint||performance.now()-e.spectralHint>1750)){
      e.spectralHint=performance.now();
      toast("Use uma arma fantasmagórica para ferir esta criatura.");
      combatParticles(entityAimPoint(e),0x9df9ee,6,"vapor");
    }
    return false;
  }
  if(!folklore.canDamage(e.type,attack)){
    if(attacker===playerActor&&(!e.silverHint||performance.now()-e.silverHint>1900)){
      e.silverHint=performance.now();toast("Só a prata fere o Lobisomem.");
    }
    return false;
  }
  if(e.plant)wakeNearbyScreamers(e,2);
  if(attacker===playerActor&&QuimiCraftBreeding.diet(e))angerFolklore("curupira",e,13,attacker);
  if(e.aquatic){hitAquatic(e,damage,attacker,knock,wildHunt);return true}
  if(attacker===playerActor&&natureFolk[e.type])provokeGrove(e.x,e.y,e.z,e);
  if(attacker===playerActor&&DRAGONS[e.type]&&!e.bonded){e.trust=0;e.feedingPause=0}
  const finisher=regionalFauna[e.type]?.finisher;
  const willResist=finisher&&e.hp<=damage;
  e.hp=Math.max(willResist?Math.min(1,e.hp):0,e.hp-damage);
  if(willResist&&attacker===playerActor&&performance.now()-(e.finishHint??-Infinity)>2200){
    e.finishHint=performance.now();toast("Use "+itemName(finisher)+" para finalizar.");
  }
  if(attacker===playerActor){state.combatTarget=e;state.combatTargetTime=2.8}
  combatParticles(entityAimPoint(e),e.hostile?0xff766c:0xdce8bd,7);
  flashMobDamage(e);
  mobKnockback(e,attacker,knock);
  if(e.hp>0){
    if(wildHunt){
      const sameTerritorial=attacker&&!attacker.aquatic&&attacker.type===e.type&&wildlifeBehavior.sameSpeciesOf(e.type)==="territorial";
      if(sameTerritorial&&e.hp<=e.maxHp*.60){
        QuimiCraftAI.disengage(e);
        if(attacker.ai?.engagement?.target===e)QuimiCraftAI.disengage(attacker);
        e.clashRest=34;attacker.clashRest=34;
        Object.assign(e.ai,{fear:4.5,panic:{x:attacker.x,y:attacker.y,z:attacker.z},think:0});
      }else if(wildlifeBehavior.retaliates(e.type)&&e.profile.strike&&attacker&&!attacker.dead){
        QuimiCraftAI.engage(e,attacker);
      }else{
        Object.assign(e.ai,{fear:4,panic:{x:attacker.x,y:attacker.y,z:attacker.z},think:0});
      }
      if(e.naturalGroup&&attacker&&!attacker.dead){
        for(const ally of e.naturalGroup.members){
          if(ally===e||ally.dead||QuimiCraftAI.range(e,ally)>12)continue;
          if(wildlifeBehavior.groupDefenders.has(e.type)&&ally.profile.strike)QuimiCraftAI.engage(ally,attacker);
          else Object.assign(ally.ai,{fear:3.6,panic:{x:attacker.x,y:attacker.y,z:attacker.z},think:0});
        }
      }
    }else if(!e.bonded||e.groveRage)QuimiCraftAI.alarm(e,attacker);
    e.jumpCooldown=Math.min(e.jumpCooldown,.12);
  }
  sound("hit",.55);
  if(e.hp===0)killEntity(e,source,attacker);
  return true;
}

function killEntity(e,source,attacker){
  if(e.dead)return;
  e.dead=true;
  if(e.plantKey)harvestedScreamers.add(e.plantKey);
  if(e.spectral)spawnDrop("ectoplasm",1+(Math.random()<.36?1:0),entityAimPoint(e));
  if(folklore.creatures[e.type])folkloreCooldowns.set(e.type,performance.now()+90000);
  if(e===riding?.actor)leaveMount(true);
  if(e.siteActor)defeatedSiteActors.add(e.siteActor);
  if(e.bonded)bondedMounts.delete(e.bonded);
  breeding.forget(e);
  combatParticles(entityAimPoint(e),0xffd889,15);
  const assisted=attacker!==playerActor;
  const hunt=regionalFauna[e.type]?.finisher;
  if(source!=="caça natural"&&!e.young&&(!assisted||QuimiCraftAI.range(e,playerActor)<16)){
    const bonus=key=>{
      const lucky=countItem("lucky_charm")>0&&Math.random()<.28?1:0;
      const sample=!String(key).startsWith("raw_")&&isEquipped("sample_case")&&Math.random()<(equipmentDefinition("offhand")?.sampleBonus||0)?1:0;
      const insignia=!assisted&&hunt&&key===e.profile.loot[0][0]&&countItem("hunt_badge")>0?1:0;
      return lucky+sample+insignia;
    };
    for(const {id:key,count} of QuimiCraftAI.loot(e.profile,Math.random,bonus)){
      const id=BLOCK[key]??key;
      spawnDrop(id,count,new THREE.Vector3(e.x,e.y+.34,e.z));
      if(id==="acid_gel")discover("antidote","Neutralização do gel ácido");
      if(id==="chitin")discover("chitin","Biomateriais de quitina");
      if(id==="wind_essence")discover("storm_focus","Energia eólica condensada");
    }
  }
  if(!assisted){
    if(hunt&&!e.young&&!e.spectral)recordExtermination(e);
    offerRescueReward(e);
    const discovery=e.plant?"screamer:"+(e.resident?.variant??"forest"):e.spectral&&!spectral.isNative(e.type)?e.type+":ghost":e.type;
    scienceSystem?.registerDiscovery(e.plant?"plants":"animals",discovery,{name:e.name,source:"Observado em "+biomeAt(e.x,e.z),
      knownRisks:e.hostile?"comportamento hostil":e.profile.temperament==="neutral"?"revida quando provocado":"baixo",
      amountCollected:1,researchProgress:35});
    chatMessage("COMBATE",e.name+" derrotado com "+source+".");
  }else if(attacker?.role==="ranger"&&QuimiCraftAI.range(e,playerActor)<14){
    chatMessage("GUARDIÃ ÍRIS",e.name+" foi afastado da patrulha.");
  }
}

function spawnDrop(id,count,pos){
  const group=new THREE.Group();
  group.add(playerModels.item(id,"drop"));
  group.position.copy(pos);
  const angle=Math.random()*TAU;
  const radius=.85+Math.random()*.56;
  dropRoot.add(group);
  worldDrops.push({id,count,group,baseY:findStandingY(pos.x,pos.z,pos.y),
    motion:new THREE.Vector3(Math.sin(angle)*radius,1.25,Math.cos(angle)*radius),
    life:65,phase:Math.random()*TAU,pickup:0,age:0});
}
function updateDrops(dt,now){
  for(let i=worldDrops.length-1;i>=0;i--){
    const d=worldDrops[i],p=d.group.position;
    d.life-=dt;
    d.age+=dt;
    d.pickup-=dt;
    d.group.rotation.y+=dt*1.65;
    if(d.age<.48){
      const nextX=p.x+d.motion.x*dt,nextZ=p.z+d.motion.z*dt;
      if(!solidAt(nextX,p.y,nextZ)){p.x=nextX;p.z=nextZ}
      d.motion.y-=dt*6;
      p.y=Math.max(d.baseY+.17,p.y+d.motion.y*dt);
    }else{
      p.y=d.baseY+.22+Math.sin(now*.004+d.phase)*.08;
      if(d.pickup<=0&&p.distanceTo(player.pos)<1.52){
        if(addItem(d.id,d.count)){
          toast("+"+d.count+" "+itemName(d.id));
          sound("pickup",.4);
          d.life=0;
        }else d.pickup=1.2;
      }
    }
    if(d.life<=0){dropRoot.remove(d.group);worldDrops.splice(i,1)}
  }
}

function combatPointBlocked(x,y,z){
  return solidAt(x,y,z)||labDoor.hits(x-.02,x+.02,y-.02,y+.02,z-.02,z+.02);
}
function combatSegmentClear(from,to){
  const count=Math.max(1,Math.ceil(from.distanceTo(to)/.27));
  for(let step=1;step<=count;step++){
    const t=step/count;
    if(combatPointBlocked(lerp(from.x,to.x,t),lerp(from.y,to.y,t),lerp(from.z,to.z,t)))return false;
  }
  return true;
}
function consumeProjectile(p,impact){
  if(p.effect){
    if(impact)frontierFx.dragonBurst(p.attack.element,p.group.position,p.vel,true);
    p.effect.dispose();
  }else{
    if(p.kind!=="enemy")combatParticles(p.group.position,p.kind==="wind"?(p.attack?.color||0x8cecf5):0xc9c8bd,4);
    frontierFx.impact(p.kind,p.group.position,p.vel);
    p.group.traverse(node=>{
      if(p.kind==="wind"||p.kind==="enemy")node.geometry?.dispose();
      if(p.kind==="wind")node.material?.dispose();
    });
  }
  p.trail?.close();
  projectileRoot.remove(p.group);
}
function breathBlocked({x,y,z},radius){
  return combatPointBlocked(x+radius,y,z)||combatPointBlocked(x-radius,y,z)||
    combatPointBlocked(x,y+radius,z)||combatPointBlocked(x,y-radius,z)||
    combatPointBlocked(x,y,z+radius)||combatPointBlocked(x,y,z-radius);
}
function updateProjectiles(dt){
  const sample=new THREE.Vector3(),previous=new THREE.Vector3(),next=new THREE.Vector3();
  let nearest=null,lightDistance=13*13;
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i],current=p.group.position;
    const stepTime=Math.min(dt,p.ttl);
    p.ttl-=stepTime;
    let impact=false;
    if(p.kind==="arrow"||p.kind==="guard"||p.kind==="petrifier")p.vel.y-=6.5*dt;
    previous.copy(current);next.copy(previous).addScaledVector(p.vel,stepTime);
    if(p.breath){
      next.y-=p.breath.gravity*stepTime**2*.5;
      p.vel.y-=p.breath.gravity*stepTime;
    }
    const steps=Math.max(1,Math.ceil(previous.distanceTo(next)/(p.breath?p.breath.radius*.75:.26)));
    const targets=p.kind==="enemy"?[playerActor,...npcs.filter(n=>n.role!=="child")]:p.kind==="guard"?entities.filter(e=>!e.persistent&&e.hostile):attackableActors();
    for(let step=1;step<=steps;step++){
      sample.copy(previous).lerp(next,step/steps);
      if(p.kind==="enemy"&&labSafe(sample.x,sample.y,sample.z)||combatPointBlocked(sample.x,sample.y,sample.z)||
        p.breath&&breathBlocked(sample,p.breath.radius*.74)){
        if(!p.breath)current.copy(sample);
        p.ttl=0;impact=true;break;
      }
      current.copy(sample);
      for(const target of targets){
        if(target.dead||target===p.owner||target.ai?.recovering>0)continue;
        if(p.kind==="mount"&&target.bonded)continue;
        const reach=entityProjectileRadius(target)+(p.breath?.radius??0);
        if(Math.abs(target.x-sample.x)>reach||Math.abs(target.z-sample.z)>reach)continue;
        const center=entityAimPoint(target);
        if(natureFolk[target.type])center.y=clamp(sample.y,target.y+.45,target.y+7.75);
        if(sample.distanceToSquared(center)>reach**2)continue;
        if(p.kind==="enemy"){
          if(target===playerActor)damagePlayer(p.damage,p.owner?.name||"Espectro",p.attack?.effect,p.attack);
          else hitNPC(target,p.damage,p.owner);
        }else{
          const owner=p.owner||playerActor;
          if(hitEntity(target,p.damage,p.breath?p.owner.name:p.kind==="guard"?"flecha da Guardiã":p.attack?.name||(p.kind==="arrow"?"arco":"magia do vento"),
            p.vel.clone().setY(0).normalize().multiplyScalar(p.kind==="wind"?5.4:2),owner,p.attack)){
            slowCreature(target,p.attack?.slow);
            if(p.attack?.venom||p.attack?.petrify)afflictCreature(target,p.attack,owner);
          }
        }
        p.ttl=0;
        impact=true;
        break;
      }
    }
    if(p.kind==="arrow"||p.kind==="guard"||p.breath)p.group.quaternion.setFromUnitVectors(projectileForward,sample.copy(p.vel).normalize());
    if(p.kind==="wind"){p.group.rotateZ(dt*7);p.group.rotateX(dt*4)}
    p.trail?.move(current);
    if(p.ttl<=0){consumeProjectile(p,impact);projectiles.splice(i,1)}
    else if(p.effect){
      p.effect.update(dt);
      const distance=current.distanceToSquared(player.pos);
      if(distance<lightDistance){lightDistance=distance;nearest=p}
    }
  }
  if(nearest){
    dragonShotLight.position.copy(nearest.group.position);
    dragonShotLight.color.setHex(nearest.breath.light);
    dragonShotLight.intensity=nearest.attack.element==="earth"?1.45:3.3;
  }else{
    dragonShotLight.intensity=0;
  }
}
const MOB_STATUS = {stone:"PETRIFICADO",stun:"ATORDOADO",windup:"PREPARANDO ATAQUE",breathCharge:"CARREGANDO RAJADA",breath:"CANALIZANDO RAJADA",flee:"EM FUGA",chase:"PERSEGUINDO",search:"PROCURANDO",kite:"RECUANDO",evade:"RETORNANDO"};
function updateEnemyHud(dt){
  const aimed=state.aimEntity&&!state.aimEntity.dead?state.aimEntity:null;
  if(state.combatTargetTime>0)state.combatTargetTime-=dt;
  const e=aimed||(state.combatTargetTime>0&&state.combatTarget&&!state.combatTarget.dead?state.combatTarget:null);
  $("enemyHud").classList.toggle("show",!!e);
  if(!e)return;
  const finisher=regionalFauna[e.type]?.finisher;
  const status=finisher&&vulnerableToFinisher(e)?"Use "+itemName(finisher):MOB_STATUS[e.ai.mode];
  $("enemyName").textContent=e.name.toUpperCase()+(status?" · "+status:"");
  $("enemyHp").textContent=`${Math.ceil(e.hp)} / ${e.maxHp}`;
  $("enemyFill").style.width=clamp(e.hp/e.maxHp*100,0,100)+"%";
}

const torchLights=[];
let torchCenter="",lightClock=0,torchDirty=true;
function updateTorches(){
  for(const lamp of torchLights)scene.remove(lamp);
  torchLights.length=0;
  const cx=Math.floor(player.pos.x/CHUNK),cz=Math.floor(player.pos.z/CHUNK),spots=[];
  torchCenter=cx+","+cz;torchDirty=false;
  for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){
    for(const placed of chunks.get(ckey(cx+dx,cz+dz))?.lights||[]){
      if(getBlock(placed.x,placed.y,placed.z)!==placed.id)continue;
      const d=(placed.x-player.pos.x)**2+(placed.z-player.pos.z)**2+(placed.y-player.pos.y)**2;
      if(d<26*26)spots.push({...placed,d});
    }
  }
  spots.sort((a,b)=>a.d-b.d);
  for(const [i,t] of spots.slice(0,settings.shadows===0?5:10).entries()){
    const {color,range,height,steady}=placementsWithLight.get(t.id);
    const lamp=new THREE.PointLight(color,1,range,2);
    lamp.position.set(t.x+.5,t.y+height,t.z+.5);
    lamp.userData.seed=i*1.7;
    lamp.userData.steady=steady;
    scene.add(lamp);torchLights.push(lamp);
  }
}

let audioCtx=null,master=null,lastCricket=0;
function initAudio(){
  if(audioCtx){audioCtx.resume();return}
  const Context=window.AudioContext||window.webkitAudioContext;
  if(!Context)return;
  audioCtx=new Context();
  master=audioCtx.createGain();
  master.gain.value=settings.volume*.32;
  master.connect(audioCtx.destination);
}
function osc(freq,dur,type="sine",gain=.08,slide=0){if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(master);o.start(t);o.stop(t+dur+.02)}
function noiseBurst(dur=.1,gain=.08,cut=1200){if(!audioCtx)return;const len=Math.floor(audioCtx.sampleRate*dur),b=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const s=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();s.buffer=b;f.type="lowpass";f.frequency.value=cut;g.gain.value=gain;s.connect(f).connect(g).connect(master);s.start()}
function dragonGuardClang(){
  osc(246,.11,"triangle",.088,-92);osc(830,.18,"triangle",.075,-57);
  osc(1460,.12,"sine",.048,-80);noiseBurst(.096,.10,3900);
}
function chargeBreathSound(start){
  if(start.distanceToSquared(player.pos)>20**2)return;
  osc(91,.99,"triangle",.063,212);osc(226,.76,"sine",.04,424);noiseBurst(.42,.049,970);
}
function dragonRoarSound(start,type,left){
  const distance=start.distanceTo(player.pos);
  if(!audioCtx||distance>25)return;
  const base=({fire_dragon:73,earth_dragon:57,ice_dragon:96,nature_dragon:84,time_dragon:77})[type]??74;
  const duration=Math.max(.18,Math.min(.56,left-.035)),now=audioCtx.currentTime,weight=1-distance/28;
  const voice=audioCtx.createOscillator(),formant=audioCtx.createBiquadFilter(),volume=audioCtx.createGain();
  voice.type="sawtooth";formant.type="bandpass";formant.Q.value=.74;
  voice.frequency.setValueAtTime(base*.75,now);
  voice.frequency.exponentialRampToValueAtTime(base*1.30,now+duration*.23);
  voice.frequency.exponentialRampToValueAtTime(base*.61,now+duration);
  formant.frequency.setValueAtTime(265,now);
  formant.frequency.exponentialRampToValueAtTime(710,now+duration*.26);
  formant.frequency.exponentialRampToValueAtTime(235,now+duration);
  volume.gain.setValueAtTime(.0001,now);
  volume.gain.linearRampToValueAtTime(.34*weight,now+duration*.17);
  volume.gain.exponentialRampToValueAtTime(.0001,now+duration);
  voice.connect(formant).connect(volume).connect(master);voice.start(now);voice.stop(now+duration+.02);
  noiseBurst(duration*.91,.108*weight,730);osc(base*.51,duration,"triangle",.21*weight,-7);
}
function sound(type,power=1){if(!audioCtx)return;if(type==="step"){const id=getBlock(player.pos.x,player.pos.y-.12,player.pos.z),stone=[BLOCK.STONE,BLOCK.COAL,BLOCK.IRON,BLOCK.BASALT,BLOCK.DEEPSTONE,BLOCK.FURNACE].includes(id);noiseBurst(.055,.045*power,stone?620:[BLOCK.SAND,BLOCK.RED_SAND].includes(id)?360:900);osc(stone?105:[BLOCK.SAND,BLOCK.RED_SAND].includes(id)?72:125,.05,"triangle",.025*power,-30)}else if(type==="break"){noiseBurst(.22,.15*power,780);osc(135,.14,"square",.04*power,-90)}else if(type==="place"){osc(92,.09,"triangle",.075*power,-32);noiseBurst(.045,.04,460)}else if(type==="splash"){noiseBurst(.22,.08*power,1550);osc(190,.18,"sine",.025,-100)}else if(type==="land"){osc(64,.18,"triangle",.12*power,-25);noiseBurst(.13,.1*power,320)}else if(type==="torch"){osc(640,.09,"sine",.035,120);noiseBurst(.05,.025,2200)}else if(type==="magic"){osc(370,.22,"sine",.05*power,620);osc(720,.16,"triangle",.025*power,260);noiseBurst(.12,.025,3200)}else if(type==="bow"){noiseBurst(.045,.04,1800);osc(185,.13,"triangle",.045*power,-110)}else if(type==="sword"){noiseBurst(.1,.055*power,2600);osc(310,.08,"sawtooth",.022,-130)}else if(type==="hit"){noiseBurst(.09,.07*power,900);osc(95,.08,"square",.028,-35)}else if(type==="pickup"){osc(660,.07,"sine",.035,180);osc(920,.1,"sine",.022,120)}else if(type==="reaction"){noiseBurst(.18,.045*power,2100);osc(240,.22,"sine",.035*power,160);osc(510,.15,"triangle",.018*power,120)}else if(type==="alert"){osc(780,.1,"square",.045*power,-80);setTimeout(()=>osc(620,.14,"square",.04*power,-70),115);noiseBurst(.08,.026*power,2800)}}
function screamerSound(power){
  if(!audioCtx||power<=0)return;
  osc(580,.49,"sawtooth",.077*power,510);
  osc(980,.61,"triangle",.069*power,-410);
  noiseBurst(.54,.055*power,1720);
}
function cricket(){if(!audioCtx)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type="sine";o.frequency.value=3600+Math.random()*850;g.gain.setValueAtTime(.0001,t);for(let i=0;i<4;i++){g.gain.linearRampToValueAtTime(.018,t+i*.065+.015);g.gain.exponentialRampToValueAtTime(.0001,t+i*.065+.045)}o.connect(g).connect(master);o.start(t);o.stop(t+.3)}

let invSlots=Array(36).fill(null);const starter=[["wind_staff",1],["bow",1],["iron_sword",1],["arrow",32],[BLOCK.GRASS,28],[BLOCK.STONE,32],[BLOCK.WOOD,12],[BLOCK.TORCH,8],[BLOCK.DOOR,2],[BLOCK.DIRT,24],[BLOCK.SAND,18],[BLOCK.LEAVES,12],[BLOCK.PLANK,18],[BLOCK.COAL,6],["stick",8],[BLOCK.CACTUS,3],["water",4],["bucket",1],[BLOCK.FIRE,2]];starter.forEach(([id,count],i)=>invSlots[i]={id,count});
try{const saved=JSON.parse(localStorage.qc_inventory||"null");if(Array.isArray(saved)&&saved.length>=30){invSlots=Array(36).fill(null);saved.slice(0,36).forEach((v,i)=>invSlots[i]=v)}}catch(e){}
function pinStarter(id,slot,count=1){let at=invSlots.findIndex(s=>s?.id===id);if(at<0){at=invSlots.findIndex(s=>!s);if(at<0)at=invSlots.length-1;invSlots[at]={id,count}}[invSlots[slot],invSlots[at]]=[invSlots[at],invSlots[slot]]}pinStarter("wind_staff",0);pinStarter("bow",1);pinStarter("iron_sword",2);if(!invSlots.some(s=>s?.id==="arrow")){const i=invSlots.findIndex(s=>!s);if(i>=0)invSlots[i]={id:"arrow",count:32}}
const ITEM_NAMES={bolt:"Virote",stick:"Bastão",wind_staff:"Cajado do Vento",bow:"Arco comum",iron_sword:"Espada de ferro",arrow:"Flecha",hydrogen:"Hidrogênio",oxygen:"Oxigênio",water:"Água destilada",copper_ingot:"Cobre refinado",sulfur:"Enxofre",acid:"Ácido sulfúrico",indicator:"Indicador natural",fertilizer:"Fertilizante mineral",glow_solution:"Solução luminescente",copper_sulfate:"Sulfato de cobre",lab_note:"Caderno de laboratório",acid_gel:"Gel ácido",chitin:"Quitina",wind_essence:"Essência do vento",crystal_shard:"Fragmento prismático",copper_core:"Núcleo de cobre",bronze_ingot:"Lingote de bronze",voltaic_cell:"Célula voltaica",ceramic_plate:"Placa cerâmica",feather:"Pena",hide:"Couro",gold_nugget:"Pepita de ouro",antidote:"Antídoto alcalino",armor_plate:"Placa de quitina",storm_focus:"Foco da tempestade",carbon_dioxide:"Dióxido de carbono",quicklime:"Óxido de cálcio",slaked_lime:"Hidróxido de cálcio",alkali:"Solução alcalina",neutral_salt:"Sal neutralizado",rust_pigment:"Pigmento de óxido de ferro",ammonia:"Solução de amônia",tetraammine:"Complexo de cobre",ethanol:"Etanol",plant_oil:"Óleo vegetal",soap:"Sabão artesanal",ph_kit:"Kit de pH",nitrate_mix:"Mistura de nitratos",bread:"Pão rústico",berries:"Frutas silvestres",honey:"Mel da serra",cheese:"Queijo curado",shield:"Escudo de bronze",chainmail:"Cota de malha",liquid_nitrogen:"Nitrogênio líquido",lucky_charm:"Berloque da sorte",prism_pendant:"Pingente prismático",lab_glassware:"Vidrarias de laboratório",carbon_rod:"Bastão de carbono",carbon_filter:"Filtro de carvão ativado",distillation_flask:"Balão de destilação",spectrometer_lens:"Lente espectrométrica",catalyst:"Catalisador metálico",protective_goggles:"Óculos de proteção",sample_case:"Maleta de amostras",sodium_chloride:"Cloreto de sódio",chlorine:"Cloro",sodium_hydroxide:"Hidróxido de sódio",hydrochloric_acid:"Ácido clorídrico",hydrogen_peroxide:"Peróxido de hidrogênio",activated_carbon:"Carvão ativado",purified_water:"Água purificada",copper_oxide:"Óxido de cobre",silver_dust:"Pó de prata",silver_nitrate:"Nitrato de prata",silver_chloride:"Cloreto de prata",sodium_nitrate:"Nitrato de sódio",chromatography_strip:"Cromatograma",pure_ethanol:"Etanol purificado",carbonate_solution:"Solução de carbonato",copper_crystal:"Cristal de sulfato de cobre",spectral_data:"Registro espectral",plated_iron:"Ferro cobreado",carbon_badge:"Insígnia do Prof. Carbono",periodic_key:"Chave da Tabela Periódica",cup:"Copo vazio",water_cup:"Copo com água",bucket:"Balde vazio",water_bucket:"Balde com água",lava_bucket:"Balde com lava",raw_venison:"Carne crua de cervo",cooked_venison:"Carne assada de cervo",raw_pork:"Carne suína crua",cooked_pork:"Carne suína assada",raw_beef:"Carne bovina crua",cooked_beef:"Carne bovina assada",raw_rabbit:"Carne crua de coelho",cooked_rabbit:"Carne assada de coelho",raw_chicken:"Carne crua de frango",cooked_chicken:"Frango assado",raw_mutton:"Carne crua de ovelha",cooked_mutton:"Carne assada de ovelha",wool:"Lã",iron_helmet:"Capacete de ferro",iron_chestplate:"Peitoral de ferro",iron_leggings:"Calças de ferro",iron_boots:"Botas de ferro",lab_coat:"Jaleco científico",respirator_mask:"Máscara respiratória",rubber_boots:"Botas de borracha",oxygen_tank:"Cilindro de oxigênio",chitin_armor:"Armadura de quitina"};
Object.assign(ITEM_NAMES,window.QuimiCraftScience?.itemNames||{});
for(const [id,[name,color]] of Object.entries(fieldLab.items)){ITEM_NAMES[id]=name;ITEM_COLORS[id]=color}
const {exterminationTools}=QuimiCraftBiomeFauna;
for(const [id,{name,color}] of Object.entries(exterminationTools)){ITEM_NAMES[id]=name;ITEM_COLORS[id]=color}
const {master:exterminationMaster,contracts:exterminationContracts,stock:exterminationStock}=QuimiCraftExtermination;
const huntBadge={name:"Insígnia do Batedor",color:"#e5b86d",
  detail:"Carregue na mochila para colher uma unidade adicional do primeiro material de cada criatura de extermínio que você finalizar."};
ITEM_NAMES.hunt_badge=huntBadge.name;ITEM_COLORS.hunt_badge=huntBadge.color;
let savedExtermination;
try{savedExtermination=JSON.parse(localStorage.qc_extermination_v1||"null")}catch{}
const extermination=QuimiCraftExtermination.create(savedExtermination?.seed===WORLD_SEED?savedExtermination:null);
Object.assign(ITEM_NAMES,Object.fromEntries(Object.entries({...QuimiCraftFrontier.items,...QuimiCraftWorkshops.itemData,...QuimiCraftAlchemy.itemData,...QuimiCraftVehicles.itemData}).map(([id,entry])=>[id,entry[0]])));
const APPAREL=QuimiCraftArsenal.apparel;
Object.assign(ITEM_NAMES,{silver_bath:"Banho de prata",silver_arrow:"Flecha prateada",silver_bolt:"Virote prateado",ectoplasm:"Ectoplasma"});
Object.assign(ITEM_COLORS,{silver_bath:"#bdd4e4",silver_arrow:"#eef4ff",silver_bolt:"#d9effc",ectoplasm:"#69e2db"});
ITEM_NAMES[survival.bufferSolution]="Solução tampão";
ITEM_COLORS[survival.bufferSolution]="#b8d26b";
ITEM_NAMES.dragon_hide="Couro de dragão";
ITEM_COLORS.dragon_hide="#9a6476";
for(const [id,w] of Object.entries({...QuimiCraftArsenal.weapons,...QuimiCraftArsenal.shields,...QuimiCraftArsenal.focuses,...APPAREL})){ITEM_NAMES[id]=w.name;ITEM_COLORS[id]=w.color}
const itemName=id=>typeof id==="number"?(BDEF[id]?.name||"Bloco"):(ITEM_NAMES[id]||String(id));
const itemColor=id=>ITEM_COLORS[id]||"#777";
const SCIENCE_ITEM_ALIASES=Object.freeze({iron:BLOCK.IRON,glass:BLOCK.GLASS,plank:BLOCK.PLANK,coal:BLOCK.COAL,copper:BLOCK.COPPER,tin:BLOCK.TIN,limestone:BLOCK.LIMESTONE,sulfur:BLOCK.SULFUR,salt:BLOCK.SALT,wood:BLOCK.WOOD,clay:BLOCK.CLAY,stone:BLOCK.STONE});
const resolveScienceItemId=id=>SCIENCE_ITEM_ALIASES[id]??(Object.hasOwn(BLOCK,id)?BLOCK[id]:id);
const EQUIPMENT_SLOTS=Object.freeze(["head","face","chest","hands","legs","feet","back","offhand"]);
const EQUIPMENT_DEFS=Object.freeze({...window.QuimiCraftScience.equipmentDefinitions});
let equipped=Object.fromEntries(EQUIPMENT_SLOTS.map(slot=>[slot,null]));
try{
  const savedEquipment=JSON.parse(localStorage.qc_equipment_v70||localStorage.qc_equipment_v62||"null");
  if(savedEquipment&&typeof savedEquipment==="object"){
    for(const slot of EQUIPMENT_SLOTS){const item=savedEquipment[slot];if(item&&EQUIPMENT_DEFS[item.id]?.slot===slot)equipped[slot]={id:item.id,count:1}}
    const legacyOffhand=savedEquipment.offhand;if(!equipped.back&&legacyOffhand&&EQUIPMENT_DEFS[legacyOffhand.id]?.slot==="back")equipped.back={id:legacyOffhand.id,count:1}
  }
}catch(e){console.warn("[QuimiCraft][Equipamentos] Migração segura aplicada.",e)}equipmentReady=true;
function twoHandedWeapon(){return !!QuimiCraftArsenal.weapons[selectedItem()]?.twoHanded}
function equipmentDefinition(slot){const item=equipped[slot];return item&&(slot!=="offhand"||!twoHandedWeapon())?EQUIPMENT_DEFS[item.id]||null:null}
function isEquipped(id){return EQUIPMENT_SLOTS.some(slot=>equipped[slot]?.id===id)}
function equippedItemIds(){return EQUIPMENT_SLOTS.filter(slot=>equipmentDefinition(slot)).map(slot=>equipped[slot].id)}
function equipmentStat(key,identity=0,mode="sum"){let value=identity;for(const slot of EQUIPMENT_SLOTS){const item=equipped[slot],condition=item&&scienceSystem?.equipmentCondition(item.id);if(condition?.broken)continue;const raw=equipmentDefinition(slot)?.[key];if(typeof raw!=="number")continue;value=mode==="multiply"?value*raw:value+raw}return value}
function magicCost(cost){return Math.ceil(cost*(1-equipmentStat("manaDiscount")))}
function playerBreathMax(){const activeTank=equippedItemIds().find(id=>EQUIPMENT_DEFS[id]?.oxygenCapacity),tankReady=!activeTank||scienceSystem?.equipmentCondition(activeTank)?.oxygen>0;return 100+equipmentStat("breathMax")*(tankReady?1:0)}
function breathDrainMultiplier(){return clamp(equipmentStat("breathDrain",1,"multiply"),.25,1)}
function underwaterClarity(){return clamp(.12+equipmentStat("clarity")+(scienceSnapshot?.protections?.clarity||0),.12,.9)}
function saveEquipment(){try{localStorage.qc_equipment_v70=JSON.stringify(equipped)}catch(e){}}
function insertInventoryItem(id,count=1,preferred=-1){if(preferred>=0&&!invSlots[preferred]){invSlots[preferred]={id,count};return true}const stack=invSlots.find(item=>QuimiCraftInventory.canStack(item,id));if(stack){stack.count+=count;return true}const free=invSlots.findIndex(item=>!item);if(free<0)return false;invSlots[free]={id,count};return true}
function equipFromInventory(index,targetSlot=null){
  const item=invSlots[index],def=item&&EQUIPMENT_DEFS[item.id];if(!item||!def)return false;
  const slot=targetSlot||def.slot;if(slot!==def.slot)return toast(`${itemName(item.id)} não pode ser equipado nesse slot`),false;
  const outgoing=equipped[slot],willFree=item.count===1,canStore=!outgoing||willFree||invSlots.some(entry=>!entry)||invSlots.some(entry=>QuimiCraftInventory.canStack(entry,outgoing.id));
  if(!canStore)return toast("Abra espaço na mochila para trocar o equipamento"),false;
  item.count--;if(item.count<=0)invSlots[index]=null;if(outgoing&&!insertInventoryItem(outgoing.id,1,index))return false;
  equipped[slot]={id:item.id,count:1};scienceSystem?.ensureEquipment(item.id);saveInventory();saveEquipment();applyEquipmentVisuals();renderInventory();sound("place",.38);toast(`${itemName(item.id)} equipado`);return true
}
function unequipSlot(slot,preferred=-1){const item=equipped[slot];if(!item)return false;if(!insertInventoryItem(item.id,1,preferred))return toast("Mochila cheia"),false;equipped[slot]=null;saveInventory();saveEquipment();applyEquipmentVisuals();renderInventory();sound("pickup",.32);toast(`${itemName(item.id)} removido`);return true}
function equipmentTooltip(slot){
  const item=equipped[slot],def=item&&EQUIPMENT_DEFS[item.id],condition=item&&scienceSystem?.equipmentCondition(item.id);
  if(!item)return `Slot de ${({head:"cabeça",face:"rosto",chest:"peitoral",hands:"mãos",legs:"pernas",feet:"pés",back:"costas",offhand:"mão secundária"})[slot]}`;
  const hazardBonuses=Object.entries(def.protections||{}).filter(([,value])=>value>0).map(([key,value])=>`${scienceSystem?.hazardLabels?.[key]||key} ${Math.round(value*100)}%`).join(" · ");
  const durability=condition?`Durabilidade ${Math.ceil(condition.durability)}/${condition.maximum}${condition.broken?" · QUEBRADO":""}`:"";
  const consumables=[condition?.filter!==null&&condition?.filter!==undefined?`Filtro ${Math.ceil(condition.filter)}/${condition.filterMaximum}`:"",condition?.oxygen!==null&&condition?.oxygen!==undefined?`O₂ ${Math.ceil(condition.oxygen)}/${condition.oxygenMaximum}`:""].filter(Boolean).join(" · ");
  return [itemName(item.id),def.effect,hazardBonuses,durability,consumables].filter(Boolean).join(" · ")
}

function applyEquipmentVisuals(){
  equipmentVisualRoot.clear();headGear.clear();backFit.clear();leftWrist.clear();firstShield.clear();heldOffFirst.clear();chestFit.clear();applyCharacterStyleBase();const head=equipped.head?.id,face=equipped.face?.id,chest=equipped.chest?.id,hands=equipped.hands?.id,legs=equipped.legs?.id,feet=equipped.feet?.id,back=equipped.back?.id,offhand=equipped.offhand?.id;
  playerRig.setEquipment(hands,feet,back,head,face,chest,legs);
  if(APPAREL[chest]){
    const apparel=APPAREL[chest];
    const group=new THREE.Group();chestFit.add(playerModels.classApparel(group,apparel));
    pCoatMat.color.set(apparel.color);pCoatShadeMat.color.copy(shadeColor(pCoatMat.color,-.15));
  }else if(chest==="lab_coat"||chest==="chemical_lab_coat"){pCoatMat.color.set(chest==="chemical_lab_coat"?0xd5eee7:0xe8f0ee);pCoatShadeMat.color.set(chest==="chemical_lab_coat"?0x8fbeb2:0xb9cbc8)}
  else if(chest==="chainmail"||chest==="iron_chestplate"){pCoatMat.color.set(chest==="iron_chestplate"?0x8b9aa0:0x9aa5a8);pCoatShadeMat.color.set(0x65747b);part(chestFit,metalMat,[0,.04,-.211],[.5,.55,.045])}
  else if(chest==="chitin_armor"){pCoatMat.color.set(0x9b704b);pCoatShadeMat.color.set(0x67462f);part(chestFit,leatherMat,[0,.04,-.219],[.52,.58,.055])}
  else if(chest==="thermal_coat"){pCoatMat.color.set(0x55799b);pCoatShadeMat.color.set(0x344f6a);part(chestFit,pCoatMat,[0,.06,-.219],[.54,.62,.05])}
  else if(chest==="cooling_vest"){pCoatMat.color.set(0x4fb7c5);pCoatShadeMat.color.set(0x2f7786);for(const x of[-.22,0,.22])part(chestFit,windGlassMat,[x,.06,-.223],[.08,.46,.04])}
  else if(chest==="radiation_suit"){pCoatMat.color.set(0xc8bb45);pCoatShadeMat.color.set(0x756c26);part(chestFit,new THREE.MeshLambertMaterial({color:0x302f22}),[0,.06,-.223],[.12,.12,.04])}
  else if(chest==="fire_suit"){pCoatMat.color.set(0x9b493a);pCoatShadeMat.color.set(0x5b2924);part(chestFit,new THREE.MeshLambertMaterial({color:0xd6aa51}),[0,.06,-.223],[.08,.5,.035])}
  else if(chest==="diving_suit"||chest==="pressure_suit"){pCoatMat.color.set(chest==="pressure_suit"?0x344958:0x205169);pCoatShadeMat.color.set(0x142f3c);part(chestFit,metalMat,[0,.06,-.219],[chest==="pressure_suit" ? .5 : .12,chest==="pressure_suit" ? .53 : .45,.04])}
  if(APPAREL[legs])pPantsMat.color.set(APPAREL[legs].color);
  else if(legs==="iron_leggings")pPantsMat.color.set(0x718087);
  if(APPAREL[head])playerModels.classApparel(headGear,APPAREL[head]);
  else if(head==="protective_goggles"){
    for(const x of [-.096,.096]){
      for(const y of [.087,.004])part(headGear,metalMat,[x,y,-.284],[.153,.019,.027]);
      for(const side of [-1,1])part(headGear,metalMat,[x+side*.071,.046,-.284],[.018,.093,.028]);
      part(headGear,windGlassMat,[x,.045,-.294],[.127,.07,.012]);
    }
    part(headGear,leatherMat,[0,.046,-.285],[.06,.025,.02]);
    for(const side of [-1,1]){
      beam(headGear,leatherMat,[side*.168,.050,-.284],[side*.262,.063,-.202],.026,.033);
      beam(headGear,leatherMat,[side*.262,.063,-.202],[side*.237,.079,.177],.026,.032);
    }
  }else if(head==="iron_helmet"){
    part(headGear,metalMat,[0,.245,.014],[.565,.117,.525]);
    part(headGear,metalMat,[0,.151,.163],[.534,.156,.233]);
    part(headGear,leatherMat,[0,.179,-.204],[.515,.055,.129]);
    for(const x of [-.274,.274]){
      part(headGear,metalMat,[x,.1,.012],[.066,.25,.422]);
      part(headGear,brassMat,[x,.019,-.108],[.075,.058,.152]);
    }
  }else if(head==="diving_mask"){
    part(headGear,windGlassMat,[0,.043,-.299],[.354,.139,.035]);
    for(const y of [.122,-.035])part(headGear,bootMat,[0,y,-.285],[.386,.031,.079]);
    for(const x of [-.193,.193])part(headGear,bootMat,[x,.043,-.274],[.039,.162,.084]);
    for(const side of [-1,1]){
      beam(headGear,leatherMat,[side*.201,.051,-.28],[side*.264,.058,-.169],.035,.038);
      beam(headGear,leatherMat,[side*.264,.058,-.169],[side*.235,.074,.176],.025,.038);
    }
  }else if(head==="face_shield"){
    const clearance=face ? .112 : 0;
    part(headGear,windGlassMat,[0,-.009,-.317-clearance],[.449,.351,.022]);
    part(headGear,metalMat,[0,.194,-.219-clearance*.5],[.467,.056,.223+clearance]);
    for(const side of [-1,1])beam(headGear,leatherMat,[side*.225,.184,-.225-clearance*.5],[side*.237,.166,.171],.032,.047);
  }
  if(face==="respirator_mask"||face==="gas_mask"){
    const full=face==="gas_mask";
    part(headGear,bootMat,[0,-.101,-.305],[full?.345:.269,.179,.105]);
    part(headGear,metalMat,[0,-.122,-.366],[full?.122:.095,.067,.032]);
    for(const x of [-.149,.149]){
      part(headGear,metalMat,[x,-.119,-.339],[.083,.083,.061]);
      part(headGear,leatherMat,[x*1.49,-.08,-.174],[.031,.043,.29]);
    }
  }
  if(APPAREL[back])backFit.add(playerModels.classApparel(new THREE.Group(),APPAREL[back]));
  else if(back==="oxygen_tank"||back==="reinforced_oxygen_tank"){const reinforced=back==="reinforced_oxygen_tank",tankMat=new THREE.MeshStandardMaterial({color:reinforced?0x527a8d:0x6b9faa,roughness:.3,metalness:.5});for(const x of reinforced?[-.18,.18]:[.2]){part(equipmentVisualRoot,tankMat,[x,1.18,.49],[reinforced ? .15 : .18,.54,.16]);part(equipmentVisualRoot,metalMat,[x,1.52,.49],[.1,.07,.1])}}
  if(offhand==="shield"){part(leftWrist,brassMat,[-.09,.06,-.09],[.11,.54,.37]);part(leftWrist,metalMat,[-.142,.081,-.09],[.031,.425,.27])}
  else if(QuimiCraftArsenal.shields[offhand]){
    const shield=playerModels.item(offhand,"third");shield.scale.setScalar(.70);shield.position.set(-.17,.065,-.083);shield.rotation.y=Math.PI*.49;leftWrist.add(shield);
    const first=playerModels.item(offhand,"first");first.scale.setScalar(.57);firstShield.add(first);
  }
  else if(QuimiCraftArsenal.focuses[offhand]){
    const focus=playerModels.item(offhand,"third");
    focus.position.set(-.075,-.015,-.134);focus.scale.setScalar(.62);focus.rotation.x-=.37;leftWrist.add(focus);
    const first=playerModels.item(offhand,"first");
    first.position.set(.016,.081,-.012);first.rotation.x+=.28;heldOffFirst.add(first);
  }
  else if(offhand==="sample_case")part(leftWrist,leatherMat,[-.01,-.058,.087],[.29,.20,.135]);
  else if(offhand==="underwater_flashlight"){part(leftWrist,metalMat,[-.012,.05,-.138],[.092,.105,.231]);part(leftWrist,windGlassMat,[-.012,.05,-.259],[.113,.121,.061])}
  else if(offhand==="thermal_blanket")part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:0xd7b568}),[-.38,1.1,.05],[.08,.7,.48]);
  if(player.petrified>0)updatePetrifiedAppearance();
  syncInventoryAvatar();player.breath=Math.min(player.breath,playerBreathMax())
}
function applyCharacterStyleBase(){const skin=CHARACTER_OPTIONS.skin[characterStyle.skin]||CHARACTER_OPTIONS.skin[2],hair=CHARACTER_OPTIONS.hair[characterStyle.hair]||CHARACTER_OPTIONS.hair[1],coat=CHARACTER_OPTIONS.coat[characterStyle.coat]||CHARACTER_OPTIONS.coat[0],accent=CHARACTER_OPTIONS.accent[characterStyle.accent]||CHARACTER_OPTIONS.accent[0],pants=CHARACTER_OPTIONS.pants[characterStyle.pants]||CHARACTER_OPTIONS.pants[0];pSkinMat.color.set(skin);pSkinLightMat.color.copy(shadeColor(skin,.11));pSkinShadeMat.color.copy(shadeColor(skin,-.1));pHairMat.color.set(hair);pCoatMat.color.set(coat);pCoatShadeMat.color.copy(shadeColor(coat,-.13));pSleeveMat.color.set(accent);pPantsMat.color.set(pants)}

function saveInventory(){try{localStorage.qc_inventory=JSON.stringify(invSlots)}catch(error){reportSaveIssue("Não foi possível gravar a mochila.",error)}}
function addItem(id,count=1){let s=invSlots.find(item=>QuimiCraftInventory.canStack(item,id));if(s)s.count+=count;else{const i=invSlots.findIndex(x=>!x);if(i>=0)invSlots[i]={id,count};else{toast("Mochila cheia");chatMessage("SISTEMA","Mochila cheia.",{category:"system"});return false}}saveInventory();renderInventory();elementMissions?.sync();return true}
function countItem(id){return invSlots.reduce((n,s)=>n+(s&&s.id===id?s.count:0),0)}
function removeItem(id,count){for(const s of invSlots){if(!s||s.id!==id)continue;const take=Math.min(count,s.count);s.count-=take;count-=take;if(!count)break}for(let i=0;i<invSlots.length;i++)if(invSlots[i]&&invSlots[i].count<=0)invSlots[i]=null;const removed=count===0;if(removed)elementMissions?.sync();return removed}
const LIQUID_REAGENT_PROFILES=Object.freeze({salt_water:["salt"],contaminated_water:["contaminated","industrial","acidic","alkaline"],distilled_water:["distilled"],water:["fresh","cold","hot"]});
function scienceInventoryCount(id){
  const profiles=LIQUID_REAGENT_PROFILES[id];if(!profiles)return countItem(id);
  return countItem(id)+invSlots.reduce((total,item)=>total+(item?.liquid&&profiles.includes(item.liquid.id)?item.count:0),0)
}
function planInventory(consumed,produced,profiles={},reserved=[]){
  return QuimiCraftInventory.plan(invSlots,consumed,produced,profiles,reserved);
}
function transactInventory(consumed,produced,profiles={},reserved=[],preview=false){
  const plan=planInventory(consumed,produced,profiles,reserved);
  if(!plan.ok){
    const message=plan.reason==="full"?QuimiCraftInventory.full:"Faltam materiais para essa operação.";
    return {ok:false,message};
  }
  if(!preview){
    invSlots=plan.slots;
    saveInventory();
    elementMissions?.sync();
    renderInventory();
  }
  return {ok:true};
}
function removeScienceInventoryItem(id,quantity){
  return transactInventory([[id,quantity]],[],LIQUID_REAGENT_PROFILES).ok;
}
const WEAPONS=new Set(Object.keys(QuimiCraftArsenal.weapons));function iconHTML(item){return item?`${itemIconMarkup(item.id)}<span class="slot-count">${item.count}</span>`:""}
function selectedItem(){return invSlots[state.selected]?.id}
function applyVenomToSlot(from,to){
  const dose=invSlots[from],weapon=invSlots[to];
  if(dose?.id!=="venom"||!QuimiCraftArsenal.melee(QuimiCraftArsenal.weapons[weapon?.id]))return false;
  if((weapon.venomCharges||0)>0){toast("Essa arma ainda tem golpes envenenados.");return true}
  if(--dose.count===0)invSlots[from]=null;
  weapon.venomCharges=8;
  saveInventory();renderInventory();sound("splash",.45);
  toast(itemName(weapon.id)+" · 8 golpes envenenados");
  return true;
}
function applyInventoryTreatment(from,to){
  const dose=invSlots[from],item=invSlots[to];
  if(dose?.id!=="silver_bath")return applyVenomToSlot(from,to);
  const ammo={arrow:"silver_arrow",bolt:"silver_bolt"}[item?.id],weapon=QuimiCraftArsenal.weapons[item?.id];
  if(!ammo&&!weapon)return false;
  if(item.silvered||weapon?.silver){toast("Este equipamento já usa prata.");return true}
  const count=ammo?Math.min(8,item.count):1;
  const same=ammo?invSlots.find(entry=>QuimiCraftInventory.canStack(entry,ammo)):null;
  const free=dose.count===1?from:invSlots.indexOf(null);
  if(count<item.count&&!same&&free<0){toast("Abra espaço na mochila para o item prateado.");return true}
  const result=ammo?{id:ammo,count}:{...item,count,silvered:true};
  if(--dose.count===0)invSlots[from]=null;
  item.count-=count;
  if(!item.count)invSlots[to]=same?null:result;
  if(same)same.count+=count;
  else if(item.count)invSlots[free]=result;
  saveInventory();renderInventory();sound("splash",.55);
  toast(ammo?`${count} × ${itemName(ammo)}`:itemName(item.id)+" recebeu banho de prata");
  return true;
}
function renderHotbar(){
  $("hotbar").innerHTML=invSlots.slice(0,9).map((it,i)=>`<div class="slot ${i===state.selected?"active":""}" data-hotbar="${i}" role="button" aria-label="Slot ${i+1}: ${itemDisplayName(it)}"><span class="slot-key">${i+1}</span>${iconHTML(it)}</div>`).join("");
  $("hotbar").querySelectorAll("[data-hotbar]").forEach(slot=>slot.addEventListener("pointerdown",event=>{if(!touchInput)return;event.preventDefault();chooseSlot(+slot.dataset.hotbar)}));
  refreshHeldItem();
  updateCombatHint();
}
function updateCombatHint(){
  const id=selectedItem(),tips={stone_pickaxe:"Picareta de pedra · mineração",iron_pickaxe:"Picareta de ferro · mineração rápida",copper_pickaxe:"Picareta de cobre · extrai prata",hoe:"Enxada · use no topo do solo",fishing_rod:"Vara de pesca · mire na água e interaja",reinforced_rod:"Vara reforçada · recolha a linha na fisgada"};
  const weapon=QuimiCraftArsenal.weapons[id],focus=QuimiCraftArsenal.focuses[equipped.offhand?.id];
  const coating=invSlots[state.selected]?.venomCharges;
  const weaponTip=weapon?.family==="crossbow"?crossbowHint():weapon?.family==="bow"?weapon.name+" · "+countItem("arrow")+" comuns · "+countItem("venom_arrow")+" envenenadas · "+countItem("silver_arrow")+" prateadas":
    weapon?.family==="staff"?weapon.name+" · clique: "+(weapon.style==="wand"?"centelha":"orbe")+" · direito: "+weapon.special:
    weapon?.reach?weapon.name+(coating?" · "+coating+" golpes envenenados":weapon.family==="gauntlet"?" · soco elemental":" · golpe corpo a corpo"):"";
  const crop=PLANTING_ITEMS.get(id),fruit=QuimiCraftFrontier.fruitFoods[id];
  const itemTip=crop?itemName(id)+" · interaja com terra arada"+(crop.support?" · leve 1 cerca de madeira":""):
    fruit?itemName(id)+" · use para comer":id==="petrifying_vial"?"Frasco petrificante · use para lançar":id==="venom"?"Veneno · no inventário, combine com uma arma corpo a corpo":id==="silver_bath"?"Banho de prata · arraste sobre uma arma, cajado, flecha ou virote":"";
  const utilityTip=activeHuntUtilities.has(id)?{quartz_whetstone:"Use para afiar a picareta mais gasta da barra",
    soot_filter:"Use para renovar o filtro da máscara equipada",vein_probe:"Use para sondar minérios num raio de 12 m"}[id]:null;
  const primary=weaponTip||tips[id]||(exterminationTools[id]&&itemName(id)+" · use ao mirar na criatura enfraquecida")||utilityTip||itemTip||`${itemName(id??BLOCK.AIR)} · clique para quebrar`;
  const enabled=!!focus&&!weapon?.twoHanded&&!riding&&!vehicles.current();
  $("offhandAction").hidden=!enabled;
  $("combatChip").textContent=primary+(invSlots[state.selected]?.silvered?" · Banho de prata":"")+(enabled?" · "+(state.focusCooldown?"Foco em recarga":(touchInput?"✧":"X")+" · "+focus.special):"");
}
let dragIndex=-1,dragEquipmentSlot="",touchInventoryIndex=-1,selectedRecipeIndex=0,recipeBookOpen=innerWidth>=980;
function paintAvatarViews(){
  if(state.character)avatarViews.paint($("customAvatar3d"));
  if(state.inventory)avatarViews.paint($("inventoryAvatar3d"));
}
function syncInventoryAvatar(){
  const el=$("inventoryAvatar");if(!el)return;
  el.style.setProperty("--skin",CHARACTER_OPTIONS.skin[characterStyle.skin]||CHARACTER_OPTIONS.skin[2]);
  el.style.setProperty("--hair",CHARACTER_OPTIONS.hair[characterStyle.hair]||CHARACTER_OPTIONS.hair[1]);
  el.style.setProperty("--coat",CHARACTER_OPTIONS.coat[characterStyle.coat]||CHARACTER_OPTIONS.coat[0]);
  el.style.setProperty("--accent",CHARACTER_OPTIONS.accent[characterStyle.accent]||CHARACTER_OPTIONS.accent[0]);
  el.style.setProperty("--pants",CHARACTER_OPTIONS.pants[characterStyle.pants]||CHARACTER_OPTIONS.pants[0]);
  for(const key of ["hairStyle","silhouette","badge","outfit","beard","shoes"])el.dataset[key]=String(characterStyle[key]||0);
  if(equipmentReady)for(const slot of EQUIPMENT_SLOTS)el.dataset[slot]=equipped[slot]?.id||"";
  paintAvatarViews();
}
function itemDisplayName(item){if(!item)return"Slot vazio";if(item.liquid){const vessel=item.id==="water_bucket"?"Balde":item.id==="water_cup"?"Copo":itemName(item.id);return`${vessel} com ${item.liquid.name||item.liquid.label||"líquido"}`}return itemName(item.id)+(item.silvered?" · Banho de prata":"")+(item.venomCharges>0?" · "+item.venomCharges+" golpes envenenados":"")}
function inventorySlotHTML(it,i,hotbar=false){
  const condition=it&&scienceSystem?.equipmentCondition(it.id),ratio=condition?Math.round(condition.ratio*100):null,durability=ratio===null?"":`<i class="item-durability ${condition.broken?"broken":""}" style="--durability:${ratio}%"></i>`;
  return `<div class="inv-slot mc-item-slot ${hotbar&&i===state.selected?"selected":""}" draggable="${!!it}" data-index="${i}" title="${it?`${itemDisplayName(it)}${condition?` · Durabilidade ${Math.ceil(condition.durability)}/${condition.maximum}${condition.broken?" · QUEBRADO":""}`:""}`:"Slot vazio"}">${iconHTML(it)}${durability}${hotbar?`<span class="mc-hotbar-key">${i+1}</span>`:""}</div>`
}
function bindInventorySlots(){
  document.querySelectorAll("#inventory .inv-slot[data-index]").forEach(el=>{
    el.addEventListener("dragstart",e=>{dragIndex=+el.dataset.index;dragEquipmentSlot="";el.classList.add("drag-source");e.dataTransfer.effectAllowed="move"});
    el.addEventListener("dragend",()=>{dragIndex=-1;document.querySelectorAll("#inventory .drag-source").forEach(x=>x.classList.remove("drag-source"))});
    el.addEventListener("dragover",e=>{e.preventDefault();e.dataTransfer.dropEffect="move";el.classList.add("drag-over")});
    el.addEventListener("dragleave",()=>el.classList.remove("drag-over"));
    el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drag-over");const to=+el.dataset.index;if(dragEquipmentSlot){unequipSlot(dragEquipmentSlot,to);dragEquipmentSlot=""}else if(dragIndex>=0&&to!==dragIndex&&!applyInventoryTreatment(dragIndex,to))[invSlots[dragIndex],invSlots[to]]=[invSlots[to],invSlots[dragIndex]];dragIndex=-1;saveInventory();renderInventory()});
    el.addEventListener("click",()=>{const index=+el.dataset.index,slot=EQUIPMENT_DEFS[invSlots[index]?.id]?.slot;if(touchInput&&touchInventoryIndex>=0&&applyInventoryTreatment(touchInventoryIndex,index)){touchInventoryIndex=-1;return}if(EQUIPMENT_SLOTS.includes(slot))return equipFromInventory(index);if(!touchInput)return;if(touchInventoryIndex<0){touchInventoryIndex=index;el.classList.add("touch-selected");return}if(touchInventoryIndex!==index)[invSlots[touchInventoryIndex],invSlots[index]]=[invSlots[index],invSlots[touchInventoryIndex]];touchInventoryIndex=-1;saveInventory();renderInventory()});
  });
}
function renderEquipmentSlots(){for(const slot of EQUIPMENT_SLOTS){const el=document.querySelector(`[data-equip-slot="${slot}"]`);if(!el)continue;const item=equipped[slot],def=item&&EQUIPMENT_DEFS[item.id],condition=item&&scienceSystem?.equipmentCondition(item.id),ratio=condition?Math.round(condition.ratio*100):null;el.innerHTML=item?`${iconHTML(item)}${ratio===null?"":`<i class="item-durability ${condition.broken?"broken":""}" style="--durability:${ratio}%"></i>`}`:"";el.classList.toggle("equipped",!!item);el.classList.toggle("broken",!!condition?.broken);el.dataset.abbr=def?.abbr||"";el.title=equipmentTooltip(slot);el.setAttribute("aria-label",equipmentTooltip(slot));el.draggable=!!item}}
function bindEquipmentSlots(){document.querySelectorAll("#inventory [data-equip-slot]").forEach(el=>{const slot=el.dataset.equipSlot;el.addEventListener("dragstart",e=>{if(!equipped[slot])return e.preventDefault();dragEquipmentSlot=slot;dragIndex=-1;e.dataTransfer.effectAllowed="move"});el.addEventListener("dragend",()=>dragEquipmentSlot="");el.addEventListener("dragover",e=>{e.preventDefault();el.classList.add("drag-over")});el.addEventListener("dragleave",()=>el.classList.remove("drag-over"));el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drag-over");if(dragIndex>=0)equipFromInventory(dragIndex,slot);else if(dragEquipmentSlot&&dragEquipmentSlot!==slot){const source=equipped[dragEquipmentSlot],def=source&&EQUIPMENT_DEFS[source.id];if(def?.slot===slot){equipped[slot]=source;equipped[dragEquipmentSlot]=null;saveEquipment();applyEquipmentVisuals();renderInventory()}}dragIndex=-1;dragEquipmentSlot=""});el.addEventListener("click",()=>unequipSlot(slot));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();unequipSlot(slot)}})})}

function updateRecipeBookState(){const book=$("recipeBook"),toggle=$("recipeBookToggle");if(!book||!toggle)return;book.classList.toggle("open",recipeBookOpen);book.setAttribute("aria-hidden",String(!recipeBookOpen));toggle.setAttribute("aria-expanded",String(recipeBookOpen));}
function renderInventory(){
  renderHotbar();syncInventoryAvatar();renderEquipmentSlots();
  $("inventoryGrid").innerHTML=invSlots.slice(9,36).map((it,j)=>inventorySlotHTML(it,j+9)).join("");
  $("inventoryHotbar").innerHTML=invSlots.slice(0,9).map((it,i)=>inventorySlotHTML(it,i,true)).join("");
  bindInventorySlots();bindEquipmentSlots();renderRecipes();updateRecipeBookState();
}

const recipes=[
  ...survival.recipes(BLOCK),
  {name:"Solução tampão",desc:"Reserva alcalina que amortece o dano de ácidos",
    need:[["carbonate_solution",1],["carbon_dioxide",1],["water",1]],out:[survival.bufferSolution,2]},
  {name:"Tábuas",desc:"1 madeira  →  4 tábuas",need:[[BLOCK.WOOD,1]],out:[BLOCK.PLANK,4]},
  {name:"Bastões",desc:"2 tábuas  →  4 bastões",need:[[BLOCK.PLANK,2]],out:["stick",4]},
  {name:"Tochas",desc:"1 bastão + 1 carvão  →  4",need:[["stick",1],[BLOCK.COAL,1]],out:[BLOCK.TORCH,4]},
  {name:"Porta",desc:"6 tábuas  →  1 porta funcional",need:[[BLOCK.PLANK,6]],out:[BLOCK.DOOR,1]},
  {name:"Bancada Química",desc:"4 tábuas + 2 ferros",need:[[BLOCK.PLANK,4],[BLOCK.IRON,2]],out:[BLOCK.LAB,1]},
  {name:"Flechas",desc:"1 bastão + 1 pedra  →  8 flechas",need:[["stick",1],[BLOCK.STONE,1]],out:["arrow",8]},
  {name:"Cerâmica",desc:"3 argilas + 1 carvão  →  3 blocos",need:[[BLOCK.CLAY,3],[BLOCK.COAL,1]],out:[BLOCK.CERAMIC,3]},
  {name:"Tijolos alquímicos",desc:"2 mármores + 1 cristal  →  4",need:[[BLOCK.MARBLE,2],[BLOCK.CRYSTAL,1]],out:[BLOCK.ALCHEMY_BRICK,4]},
  {name:"Vidrarias",desc:"3 vidros  →  4 peças de laboratório",need:[[BLOCK.GLASS,3]],out:["lab_glassware",4]},
  {name:"Bastões de carbono",desc:"2 carvões + 1 bastão  →  2 eletrodos",need:[[BLOCK.COAL,2],["stick",1]],out:["carbon_rod",2]},
  {name:"Balão de destilação",desc:"3 vidros + 1 placa cerâmica",need:[[BLOCK.GLASS,3],["ceramic_plate",1]],out:["distillation_flask",1]},
  {name:"Lente espectrométrica",desc:"2 vidros + 1 cristal prismático",need:[[BLOCK.GLASS,2],[BLOCK.CRYSTAL,1]],out:["spectrometer_lens",1]},
  {name:"Catalisador metálico",desc:"1 ferro + 1 cobre + 1 enxofre",need:[[BLOCK.IRON,1],[BLOCK.COPPER,1],[BLOCK.SULFUR,1]],out:["catalyst",2]},
  {name:"Óculos de proteção",desc:"2 vidros + 2 bastões",need:[[BLOCK.GLASS,2],["stick",2]],out:["protective_goggles",1]},
  {name:"Máscara respiratória",desc:"1 filtro + 1 ferro + 1 lã",need:[["carbon_filter",1],[BLOCK.IRON,1],["wool",1]],out:["respirator_mask",1]},
  {name:"Capacete de ferro",desc:"5 ferros  →  proteção de cabeça",need:[[BLOCK.IRON,5]],out:["iron_helmet",1]},
  {name:"Jaleco científico",desc:"4 lãs + 1 vidro",need:[["wool",4],[BLOCK.GLASS,1]],out:["lab_coat",1]},
  {name:"Peitoral de ferro",desc:"8 ferros  →  alta proteção",need:[[BLOCK.IRON,8]],out:["iron_chestplate",1]},
  {name:"Armadura de quitina",desc:"3 placas de quitina + 1 cerâmica",need:[["armor_plate",3],["ceramic_plate",1]],out:["chitin_armor",1]},
  {name:"Calças de ferro",desc:"7 ferros  →  proteção das pernas",need:[[BLOCK.IRON,7]],out:["iron_leggings",1]},
  {name:"Botas de ferro",desc:"4 ferros  →  proteção e queda",need:[[BLOCK.IRON,4]],out:["iron_boots",1]},
  {name:"Botas de borracha",desc:"2 couros + 1 óleo vegetal",need:[["hide",2],["plant_oil",1]],out:["rubber_boots",1]},
  {name:"Cilindro de oxigênio",desc:"4 ferros + 1 oxigênio + 1 vidro",need:[[BLOCK.IRON,4],["oxygen",1],[BLOCK.GLASS,1]],out:["oxygen_tank",1]},
  {name:"Filtro de carbono",desc:"2 carvões + 1 ferro + 1 vidro",need:[[BLOCK.COAL,2],[BLOCK.IRON,1],[BLOCK.GLASS,1]],out:["carbon_filter",1]},
  {name:"Maleta de amostras",desc:"2 tábuas + 1 vidro + 1 caderno",need:[[BLOCK.PLANK,2],[BLOCK.GLASS,1],["lab_note",1]],out:["sample_case",1]},
  {name:"Caderno de laboratório",desc:"2 tábuas + 1 indicador",need:[[BLOCK.PLANK,2],["indicator",1]],out:["lab_note",1]},
  {name:"Forno de pedra",desc:"8 pedras  →  1 forno",need:[[BLOCK.STONE,8]],out:[BLOCK.FURNACE,1]},
  {name:"Copo de vidro",desc:"3 vidros  →  2 copos",need:[[BLOCK.GLASS,3]],out:["cup",2]},
  {name:"Balde de ferro",desc:"3 ferros  →  1 balde",need:[[BLOCK.IRON,3]],out:["bucket",1]},
  {name:"Fogueira",desc:"1 madeira + 1 tocha  →  2 focos de fogo",need:[[BLOCK.WOOD,1],[BLOCK.TORCH,1]],out:[BLOCK.FIRE,2]}
]
recipes.push(...QuimiCraftFrontier.recipes(BLOCK),...QuimiCraftWorkshops.recipes(BLOCK).map(row=>({...row,desc:row.need.map(([id,n])=>n+" × "+itemName(id)).join(" + ")})),...window.QuimiCraftScience.createCraftingRecipes(BLOCK),...QuimiCraftVehicles.recipes(BLOCK).map(row=>({...row,desc:row.need.map(([id,n])=>n+" × "+itemName(id)).join(" + ")})));
recipes.push(...fieldLab.recipes(BLOCK).map(row=>({...row,desc:recipeNeedsLabel(row)})));
recipes.push(
  {name:"Condensar ectoplasma",desc:"Condense luz espectral com vidro para preparar o primeiro equipamento.",
    need:[[BLOCK.SPECTRAL,1],[BLOCK.GLASS,1]],out:["ectoplasm",2]},
  {name:"Banho de prata",desc:"Combine com 1 arma, 1 cajado ou até 8 flechas ou virotes.",need:[["silver_ingot",1],["lab_glassware",1]],out:["silver_bath",1]},
  {name:"Tijolos de argila",desc:"3 argilas e 1 carvão rendem 4 blocos de tijolo.",need:[[BLOCK.CLAY,3],[BLOCK.COAL,1]],out:[BLOCK.VILLAGE_BRICK,4]},
  ...barriers.map(([key,name,,,,material])=>({name,desc:"3 unidades do material rendem 4 barreiras.",need:[[BLOCK[material]??material,3]],out:[BLOCK[key],4]}))
);
recipes.push(...[...QuimiCraftArsenal.recipes(BLOCK),...QuimiCraftArsenal.shieldRecipes(BLOCK),...QuimiCraftArsenal.focusRecipes(BLOCK),...QuimiCraftArsenal.apparelRecipes(BLOCK),
  {name:"Virotes",need:[["iron_ingot",1],["stick",2],["feather",1]],out:["bolt",8]}].map(row=>({...row,desc:recipeNeedsLabel(row)})));
function recipeResearchReady(r){return !r.research||!!scienceSystem?.isResearchUnlocked(r.research)}
function recipeResearchLabel(r){return r.research?(scienceSystem?.researchNodes?.find(node=>node.id===r.research)?.name||r.research):""}
function canCraft(r){return recipeResearchReady(r)&&r.need.every(([id,n])=>scienceInventoryCount(id)>=n)}
function recipeNeedsLabel(r){return r.need.map(([id,n])=>`${n}× ${itemName(id)}`).join(" + ")}
function renderCraftPreview(){
  const r=recipes[selectedRecipeIndex]||recipes[0],grid=$("craftGrid"),out=$("craftOutput"),label=$("craftRecipeName");if(!grid||!out||!label)return;
  const ingredients=r?r.need.slice(0,4):[];grid.innerHTML=Array.from({length:4},(_,i)=>{const need=ingredients[i];return `<div class="mc-craft-slot" title="${need?`${need[1]}× ${itemName(need[0])}`:"Slot de criação"}">${need?`${itemIconMarkup(need[0])}<span class="slot-count">${need[1]}</span>`:""}</div>`}).join("");
  if(!r){out.innerHTML="";out.disabled=true;label.textContent="Selecione uma receita";return}
  const researchReady=recipeResearchReady(r),possible=canCraft(r);out.innerHTML=`${itemIconMarkup(r.out[0])}<span class="slot-count">${r.out[1]}</span>`;out.disabled=!possible;out.title=possible?`Criar ${r.name}`:researchReady?`Faltam materiais: ${recipeNeedsLabel(r)}`:`Pesquisa necessária: ${recipeResearchLabel(r)}`;label.textContent=`${r.name} · ${researchReady?r.desc:`Requer ${recipeResearchLabel(r)}`}`;label.classList.toggle("unavailable",!possible);
}
function renderRecipes(){
  const available=recipes.findIndex(canCraft);if(!recipes[selectedRecipeIndex])selectedRecipeIndex=available>=0?available:0;
  $("recipes").innerHTML=recipes.map((r,i)=>{const researchReady=recipeResearchReady(r),possible=canCraft(r);return `<button class="mc-recipe ${i===selectedRecipeIndex?"selected":""} ${possible?"available":"locked"} ${researchReady?"":"research-locked"}" data-recipe="${i}" type="button" title="${researchReady?r.desc:`Requer pesquisa: ${recipeResearchLabel(r)}`}"><span class="mc-recipe-icon">${itemIconMarkup(r.out[0])}<span class="slot-count">${r.out[1]}</span></span><span><strong>${r.name}</strong><small>${researchReady?recipeNeedsLabel(r):`Pesquisa · ${recipeResearchLabel(r)}`}</small></span><i>${possible?"✓":researchReady?"":"⌁"}</i></button>`}).join("");
  $("recipes").querySelectorAll("[data-recipe]").forEach(b=>b.onclick=()=>{selectedRecipeIndex=+b.dataset.recipe;renderRecipes()});renderCraftPreview();
}
function craft(i=selectedRecipeIndex){
  const r=recipes[i];
  if(!r)return;
  if(!recipeResearchReady(r))return toast("Desbloqueie "+recipeResearchLabel(r)+" na Árvore de Pesquisa");
  const result=transactInventory(r.need,[r.out],LIQUID_REAGENT_PROFILES);
  if(!result.ok)return toast(result.message);
  scienceSystem?.registerDiscovery("recipes",String(r.out[0]),{name:r.name,source:"Criada com "+recipeNeedsLabel(r),relatedRecipes:[r.name],amountCollected:r.out[1],researchProgress:100});
  if(EQUIPMENT_DEFS[r.out[0]])scienceSystem?.registerDiscovery("missions","protective_equipment",{name:"Equipamento de proteção",source:r.name,researchProgress:100});
  sound("place",.35);
  toast(r.name+" criada"+(r.out[1]>1?"s":""));
}

const CHEM=[
  {id:"glass",name:"Fusão do vidro",eq:"SiO₂(s) + calor → SiO₂(vítreo)",need:[[BLOCK.SAND,4],[BLOCK.COAL,1]],out:[[BLOCK.GLASS,4]],next:"electrolysis",result:"Vidro translúcido para construções e laboratório."},
  {id:"electrolysis",name:"Eletrólise da água",eq:"2 H₂O(l) → 2 H₂(g) + O₂(g)",need:[["water",2],[BLOCK.IRON,1]],out:[["hydrogen",2],["oxygen",1]],next:"water",result:"Separa a molécula de água usando eletrodos de ferro."},
  {id:"water",name:"Síntese da água",eq:"2 H₂(g) + O₂(g) → 2 H₂O(l)",need:[["hydrogen",2],["oxygen",1]],out:[["water",2]],next:"indicator",result:"Reação exotérmica controlada dentro da bancada."},
  {id:"indicator",name:"Indicador natural",eq:"Pigmento vegetal + H₂O → indicador",need:[[BLOCK.LEAVES,2],["water",1]],out:[["indicator",3]],next:"acid",result:"Muda de cor na presença de ácidos e bases."},
  {id:"acid",name:"Ácido sulfúrico",eq:"2 S(s) + 3 O₂(g) + 2 H₂O(l) → 2 H₂SO₄(aq)",need:[[BLOCK.SULFUR,1],["oxygen",1],["water",1]],out:[["acid",2]],next:"copper_sulfate",result:"Equação global simplificada. Os itens da receita representam a mecânica do jogo."},
  {id:"copper_sulfate",name:"Sulfato de cobre",eq:"Cu + H₂SO₄ → CuSO₄ + H₂",need:[[BLOCK.COPPER,1],["acid",1]],out:[["copper_sulfate",2],["hydrogen",1]],next:"spectral",result:"Cristais azuis intensos de CuSO₄."},
  {id:"spectral",name:"Luz espectral verde",eq:"CuSO₄ + chama → emissão verde",need:[["copper_sulfate",1],[BLOCK.TORCH,1]],out:[[BLOCK.SPECTRAL,2]],next:"fertilizer",result:"O cobre excitado colore a chama de verde."},
  {id:"fertilizer",name:"Fertilizante mineral",eq:"Sais minerais → mistura nutritiva",need:[[BLOCK.SALT,1],[BLOCK.SULFUR,1],[BLOCK.COAL,1]],out:[["fertilizer",3]],result:"Mistura mineral para futuras plantações."},
  {id:"bronze",name:"Liga de bronze",eq:"Cu(s) + Sn(s) → bronze(s)",need:[[BLOCK.COPPER,2],[BLOCK.TIN,1]],out:[["bronze_ingot",3]],next:"voltaic",result:"Uma liga mais resistente que os metais de origem."},
  {id:"voltaic",name:"Célula voltaica",eq:"Zn | H₂SO₄ | Cu → corrente elétrica",need:[[BLOCK.ZINC,1],[BLOCK.COPPER,1],["acid",1]],out:[["voltaic_cell",2]],next:"luminescence",result:"Converte uma reação redox em energia utilizável."},
  {id:"luminescence",name:"Solução prismática",eq:"cristal + S + H₂O → solução luminescente",need:[[BLOCK.CRYSTAL,1],[BLOCK.SULFUR,1],["water",1]],out:[["glow_solution",2]],next:"alchemy_brick",result:"Suspensão brilhante que armazena energia espectral."},
  {id:"alchemy_brick",name:"Tijolo alquímico",eq:"mármore + solução prismática → compósito",need:[[BLOCK.MARBLE,2],["glow_solution",1]],out:[[BLOCK.ALCHEMY_BRICK,4]],result:"Material arquitetônico resistente e levemente luminoso."},
  {id:"ceramic",name:"Cerâmica técnica",eq:"argila + calor → cerâmica + H₂O(g)",need:[[BLOCK.CLAY,3],[BLOCK.COAL,1]],out:[[BLOCK.CERAMIC,4],["ceramic_plate",1]],result:"Isolante útil para equipamentos e construções."},
  {id:"antidote",name:"Antídoto alcalino",eq:"gel ácido + indicador + H₂O → solução tampão",need:[["acid_gel",1],["indicator",1],["water",1]],out:[["antidote",2]],result:"Consumível que restaura vida e neutraliza toxinas."},
  {id:"chitin",name:"Compósito de quitina",eq:"quitina + cerâmica → biocompósito",need:[["chitin",2],["ceramic_plate",1]],out:[["armor_plate",1]],result:"Material estrutural para criar a Armadura de Quitina."},
  {id:"storm_focus",name:"Foco da tempestade",eq:"essência eólica + cristal + célula → foco",need:[["wind_essence",2],[BLOCK.CRYSTAL,1],["voltaic_cell",1]],out:[["storm_focus",1]],result:"Amplifica o dano e o empurrão do Cajado do Vento."},
  {id:"calcination",name:"Calcinação do calcário",eq:"CaCO₃(s) + calor → CaO(s) + CO₂(g)",need:[[BLOCK.LIMESTONE,2],[BLOCK.COAL,1]],out:[["quicklime",2],["carbon_dioxide",1]],next:"slaking",result:"Decompõe o carbonato de cálcio e libera dióxido de carbono."},
  {id:"slaking",name:"Hidratação da cal",eq:"CaO(s) + H₂O(l) → Ca(OH)₂(aq)",need:[["quicklime",1],["water",1]],out:[["slaked_lime",2]],next:"neutralization",result:"Forma hidróxido de cálcio em uma reação exotérmica controlada."},
  {id:"neutralization",name:"Neutralização ácido-base",eq:"H₂SO₄ + Ca(OH)₂ → CaSO₄ + 2 H₂O",need:[["acid",1],["slaked_lime",1]],out:[["neutral_salt",2],["water",1]],next:"ph_kit",result:"Ácido e base reagem para formar sal e água."},
  {id:"iron_oxide",name:"Oxidação do ferro",eq:"4 Fe(s) + 3 O₂(g) → 2 Fe₂O₃(s)",need:[[BLOCK.IRON,2],["oxygen",1]],out:[["rust_pigment",3]],result:"Produz um pigmento terroso de óxido de ferro."},
  {id:"ammonia_complex",name:"Complexo de cobre",eq:"Cu²⁺ + 4 NH₃ → [Cu(NH₃)₄]²⁺",need:[["copper_sulfate",1],["ammonia",2]],out:[["tetraammine",2]],result:"Um complexo de coordenação com coloração azul profunda."},
  {id:"fermentation",name:"Fermentação das frutas",eq:"C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂",need:[["berries",3],["water",1]],out:[["ethanol",2],["carbon_dioxide",1]],next:"saponification",result:"Converte açúcares em etanol e dióxido de carbono."},
  {id:"saponification",name:"Saponificação",eq:"óleo vegetal + base → sabão + glicerol",need:[["plant_oil",1],["alkali",1]],out:[["soap",3]],result:"Transforma lipídios em sais de ácidos graxos."},
  {id:"alkali",name:"Extração alcalina das cinzas",eq:"cinzas + H₂O → solução alcalina",need:[[BLOCK.ASH,2],["water",1]],out:[["alkali",2]],next:"saponification",result:"Extrai compostos alcalinos solúveis presentes nas cinzas."},
  {id:"ph_kit",name:"Kit de escala de pH",eq:"indicador + padrões ácido/base → escala de pH",need:[["indicator",2],["acid",1],["alkali",1],[BLOCK.GLASS,1]],out:[["ph_kit",1]],result:"Compara cores para estimar a acidez de novas soluções."},
  {id:"nitrate",name:"Fertilizante nitrogenado",eq:"NO₃⁻ + sais minerais → mistura nutritiva",need:[[BLOCK.NITER,2],[BLOCK.SALT,1],["water",1]],out:[["nitrate_mix",2],["fertilizer",2]],result:"Combina nitratos e sais para enriquecer o solo."},
  {id:"spectroscopy",name:"Espectroscopia da ametista",eq:"ametista + luz → espectro de emissão",need:[[BLOCK.AMETHYST,1],[BLOCK.SPECTRAL,1]],out:[["prism_pendant",1]],result:"Um pingente calibrado pelas bandas de luz do cristal."},
  {id:"cryogenics",name:"Resfriamento criogênico",eq:"N₂(l) + H₂O(l) → H₂O(s) + N₂(g)",need:[["liquid_nitrogen",1],["water",2]],out:[[BLOCK.ICE,4]],result:"Uma mudança física rápida de estado, sem criar nova substância."},
  {id:"lime_mortar",name:"Argamassa de cal",eq:"Ca(OH)₂ + SiO₂ + CO₂ → compósito mineral",need:[["slaked_lime",1],[BLOCK.SAND,2],["carbon_dioxide",1]],out:[[BLOCK.VILLAGE_BRICK,5]],result:"Liga mineral usada nas ruas e casas da Vila dos Elementos."},
  {id:"salt_solution",name:"Preparação de solução salina",eq:"NaCl(s) + H₂O(l) → Na⁺(aq) + Cl⁻(aq)",need:[[BLOCK.SALT,1],["water",1]],out:[["sodium_chloride",3]],next:"chlor_alkali",result:"Dissolve e padroniza o sal para reações eletroquímicas."},
  {id:"chlor_alkali",name:"Processo cloro-álcali",eq:"2 NaCl + 2 H₂O → Cl₂ + H₂ + 2 NaOH",need:[["sodium_chloride",2],["water",2],["voltaic_cell",1]],out:[["chlorine",1],["hydrogen",1],["sodium_hydroxide",2]],next:"hydrochloric",result:"Eletrólise industrial simplificada com produtos separados em câmaras."},
  {id:"hydrochloric",name:"Síntese do ácido clorídrico",eq:"H₂(g) + Cl₂(g) → 2 HCl(aq)",need:[["hydrogen",1],["chlorine",1],["lab_glassware",1]],out:[["hydrochloric_acid",2]],next:"sodium_neutralization",result:"Forma uma solução ácida em sistema fechado e controlado."},
  {id:"sodium_neutralization",name:"Neutralização com soda",eq:"HCl + NaOH → NaCl + H₂O",need:[["hydrochloric_acid",1],["sodium_hydroxide",1]],out:[["sodium_chloride",1],["water",1]],result:"Demonstra conservação de matéria em uma neutralização simples."},
  {id:"peroxide",name:"Síntese catalítica de peróxido",eq:"H₂ + O₂ → H₂O₂",need:[["hydrogen",2],["oxygen",2],["catalyst",1]],out:[["hydrogen_peroxide",2]],next:"peroxide_decomp",result:"Produz peróxido diluído com auxílio de um catalisador reutilizável."},
  {id:"peroxide_decomp",name:"Decomposição do peróxido",eq:"2 H₂O₂ → 2 H₂O + O₂",need:[["hydrogen_peroxide",2],["catalyst",1]],out:[["water",2],["oxygen",1],["catalyst",1]],result:"Libera oxigênio e evidencia a ação de um catalisador."},
  {id:"activated_carbon",name:"Ativação do carbono",eq:"C(s) + vapor → C ativado",need:[[BLOCK.COAL,3],["water",1]],out:[["activated_carbon",3]],next:"water_purification",result:"Aumenta a área superficial do carbono para adsorção."},
  {id:"water_purification",name:"Purificação por adsorção",eq:"H₂O impura + C ativado → H₂O purificada",need:[["water",2],["activated_carbon",1],["carbon_filter",1]],out:[["purified_water",2],["carbon_filter",1]],result:"Remove impurezas usando um filtro reutilizável de carvão ativado."},
  {id:"copper_oxide",name:"Formação de óxido de cobre",eq:"2 Cu + O₂ → 2 CuO",need:[[BLOCK.COPPER,2],["oxygen",1]],out:[["copper_oxide",2]],next:"copper_reduction",result:"Escurece o cobre por oxidação controlada."},
  {id:"copper_reduction",name:"Redução do óxido de cobre",eq:"2 CuO + C → 2 Cu + CO₂",need:[["copper_oxide",2],["carbon_rod",1]],out:[["copper_ingot",2],["carbon_dioxide",1]],result:"Recupera cobre metálico por uma reação de redução."},
  {id:"silver_nitrate",name:"Preparação de nitrato de prata",eq:"Ag + NO₃⁻ → AgNO₃(aq)",need:[["silver_dust",1],["nitrate_mix",1],["purified_water",1]],out:[["silver_nitrate",2]],next:"silver_precipitation",result:"Gera um reagente fotossensível para testes de precipitação."},
  {id:"silver_precipitation",name:"Precipitação do cloreto de prata",eq:"AgNO₃ + NaCl → AgCl↓ + NaNO₃",need:[["silver_nitrate",1],["sodium_chloride",1]],out:[["silver_chloride",1],["sodium_nitrate",1]],result:"Forma um precipitado claro ao encontrar íons cloreto."},
  {id:"chromatography",name:"Cromatografia de pigmentos",eq:"mistura de pigmentos + solvente → bandas separadas",need:[["indicator",1],["ethanol",1],["lab_glassware",1]],out:[["chromatography_strip",2]],result:"Separa pigmentos pela diferença de afinidade com o solvente."},
  {id:"distillation",name:"Destilação do etanol",eq:"mistura líquida + calor → frações por ebulição",need:[["ethanol",2],["water",1],["distillation_flask",1]],out:[["pure_ethanol",2],["distillation_flask",1]],result:"Concentra o etanol usando diferenças de ponto de ebulição."},
  {id:"carbon_capture",name:"Captura de dióxido de carbono",eq:"CO₂ + 2 NaOH → Na₂CO₃ + H₂O",need:[["carbon_dioxide",1],["sodium_hydroxide",2]],out:[["carbonate_solution",2],["water",1]],result:"Converte dióxido de carbono em uma solução de carbonato."},
  {id:"crystal_growth",name:"Crescimento de cristais azuis",eq:"CuSO₄(aq) → CuSO₄·5H₂O(s)",need:[["copper_sulfate",2],["purified_water",1],["lab_glassware",1]],out:[["copper_crystal",1]],next:"spectral_analysis",result:"Cristaliza lentamente uma solução concentrada de sulfato de cobre."},
  {id:"spectral_analysis",name:"Análise espectrométrica",eq:"amostra excitada → linhas de emissão",need:[["copper_crystal",1],["spectrometer_lens",1],[BLOCK.SPECTRAL,1]],out:[["spectral_data",1],["spectrometer_lens",1]],result:"Registra o padrão de emissão da amostra em um espectrômetro."},
  {id:"electroplating",name:"Eletrodeposição de cobre",eq:"Fe + Cu²⁺ + e⁻ → Fe/Cu",need:[[BLOCK.IRON,1],["copper_sulfate",1],["voltaic_cell",1]],out:[["plated_iron",2]],result:"Reveste ferro com uma camada fina de cobre metálico."}
];
let unlockedChem=new Set(["glass","electrolysis","salt_solution","activated_carbon"]);try{const s=JSON.parse(localStorage.qc_chem||"null");if(Array.isArray(s))unlockedChem=new Set(s)}catch(e){}
function saveChem(){localStorage.qc_chem=JSON.stringify([...unlockedChem]);updateChemHud()}
function discover(id,msg){if(unlockedChem.has(id))return;unlockedChem.add(id);saveChem();toast(`Nova reação: ${CHEM.find(r=>r.id===id)?.name||msg}`);chatMessage("SISTEMA",`Descoberta registrada no caderno: ${msg||id}.`,{category:"discovery"})}
function discoverFromBlock(id){if(id===BLOCK.COPPER){discover("copper_sulfate","Reatividade do cobre");discover("copper_oxide","Óxidos metálicos")}if(id===BLOCK.SULFUR)discover("acid","Química do enxofre");if(id===BLOCK.SALT){discover("fertilizer","Sais minerais");discover("salt_solution","Soluções iônicas")}if(id===BLOCK.TIN)discover("bronze","Ligas de estanho");if(id===BLOCK.ZINC)discover("voltaic","Reações de oxirredução");if(id===BLOCK.CRYSTAL)discover("luminescence","Luminescência cristalina");if(id===BLOCK.CLAY)discover("ceramic","Transformações da argila");if(id===BLOCK.LIMESTONE)discover("calcination","Química dos carbonatos");if(id===BLOCK.NITER){discover("nitrate","Química dos nitratos");discover("silver_nitrate","Reações com nitratos")}if(id===BLOCK.AMETHYST)discover("spectroscopy","Espectroscopia de cristais");if(id===BLOCK.IRON)discover("iron_oxide","Oxidação dos metais");if(id===BLOCK.ASH){discover("alkali","Extração alcalina");discover("activated_carbon","Adsorção por carbono")}}
function updateChemHud(){$("chemHud").textContent=`DESCOBERTAS ${Math.min(CHEM.length,dev.allRecipes?CHEM.length:unlockedChem.size)} / ${CHEM.length}`}
function canChem(r){return r.need.every(([id,n])=>countItem(id)>=n)}
function renderChemistry(){
  const els=[{n:1,s:"H",name:"Hidrogênio"},{n:6,s:"C",name:"Carbono"},{n:7,s:"N",name:"Nitrogênio"},{n:8,s:"O",name:"Oxigênio"},{n:11,s:"Na",name:"Sódio"},{n:12,s:"Mg",name:"Magnésio"},{n:13,s:"Al",name:"Alumínio"},{n:14,s:"Si",name:"Silício"},{n:16,s:"S",name:"Enxofre"},{n:17,s:"Cl",name:"Cloro"},{n:19,s:"K",name:"Potássio"},{n:20,s:"Ca",name:"Cálcio"},{n:26,s:"Fe",name:"Ferro"},{n:29,s:"Cu",name:"Cobre"},{n:30,s:"Zn",name:"Zinco"},{n:47,s:"Ag",name:"Prata"},{n:50,s:"Sn",name:"Estanho"},{n:79,s:"Au",name:"Ouro"},{n:15,s:"P",name:"Fósforo"},{n:35,s:"Br",name:"Bromo"}];$("elementBoard").innerHTML=els.map(e=>`<div class="element"><span>${e.n}</span><b>${e.s}</b><small>${e.name}</small></div>`).join("");
  $("chemRecipes").innerHTML=CHEM.map((r,i)=>{const unlocked=dev.allRecipes||unlockedChem.has(r.id),possible=unlocked&&canChem(r);return `<button class="chem-recipe ${unlocked?"":"locked"}" data-chem="${i}" ${possible?"":unlocked?"aria-disabled=\"true\"":"disabled"}><strong>${unlocked?r.name:"Reação não descoberta"}</strong><span class="chem-eq">${unlocked?r.eq:"??? + ??? → ???"}</span><span class="chem-result">${unlocked?r.result:"Explore minérios e converse com o Prof. Carbono."}</span></button>`}).join("");$("chemRecipes").querySelectorAll("[data-chem]").forEach(b=>b.onclick=()=>craftChem(+b.dataset.chem));updateChemHud()
}
function craftChem(i){
  const r=CHEM[i];
  if(!r||!(dev.allRecipes||unlockedChem.has(r.id)))return;
  const result=transactInventory(r.need,r.out);
  if(!result.ok)return toast(result.message);
  if(r.next)discover(r.next,r.name);
  renderChemistry();
  sound("torch",.7);
  reactionParticles(r.id);
  $("labNote").innerHTML='<span class="discovery">REAÇÃO CONCLUÍDA</span><br>'+r.eq;
  elementMissions?.recordEvent("reaction",{id:r.id});
  chatMessage("QUÍMICA","Reação concluída: "+r.name+".",{category:"chemistry"});
  updateMissionHud();
}
function openChemistry(){state.chemistry=true;state.playing=false;state.left=false;$("chemistry").classList.add("open");document.exitPointerLock?.();elementMissions?.recordEvent("activate_station",{id:"chemistry"});renderChemistry();updateMissionHud()}
function closeChemistry(){state.chemistry=false;$("chemistry").classList.remove("open");requestPointer()}

const PERIODIC_ELEMENTS=Object.freeze([
[1,"H","Hidrogênio",1,1,1,1,"nonmetal"],[2,"He","Hélio",1,18,18,1,"noble"],
[3,"Li","Lítio",2,1,1,2,"alkali"],[4,"Be","Berílio",2,2,2,2,"alkaline"],[5,"B","Boro",2,13,13,2,"metalloid"],[6,"C","Carbono",2,14,14,2,"nonmetal"],[7,"N","Nitrogênio",2,15,15,2,"nonmetal"],[8,"O","Oxigênio",2,16,16,2,"nonmetal"],[9,"F","Flúor",2,17,17,2,"halogen"],[10,"Ne","Neônio",2,18,18,2,"noble"],
[11,"Na","Sódio",3,1,1,3,"alkali"],[12,"Mg","Magnésio",3,2,2,3,"alkaline"],[13,"Al","Alumínio",3,13,13,3,"post"],[14,"Si","Silício",3,14,14,3,"metalloid"],[15,"P","Fósforo",3,15,15,3,"nonmetal"],[16,"S","Enxofre",3,16,16,3,"nonmetal"],[17,"Cl","Cloro",3,17,17,3,"halogen"],[18,"Ar","Argônio",3,18,18,3,"noble"],
[19,"K","Potássio",4,1,1,4,"alkali"],[20,"Ca","Cálcio",4,2,2,4,"alkaline"],[21,"Sc","Escândio",4,3,3,4,"transition"],[22,"Ti","Titânio",4,4,4,4,"transition"],[23,"V","Vanádio",4,5,5,4,"transition"],[24,"Cr","Cromo",4,6,6,4,"transition"],[25,"Mn","Manganês",4,7,7,4,"transition"],[26,"Fe","Ferro",4,8,8,4,"transition"],[27,"Co","Cobalto",4,9,9,4,"transition"],[28,"Ni","Níquel",4,10,10,4,"transition"],[29,"Cu","Cobre",4,11,11,4,"transition"],[30,"Zn","Zinco",4,12,12,4,"transition"],[31,"Ga","Gálio",4,13,13,4,"post"],[32,"Ge","Germânio",4,14,14,4,"metalloid"],[33,"As","Arsênio",4,15,15,4,"metalloid"],[34,"Se","Selênio",4,16,16,4,"nonmetal"],[35,"Br","Bromo",4,17,17,4,"halogen"],[36,"Kr","Criptônio",4,18,18,4,"noble"],
[37,"Rb","Rubídio",5,1,1,5,"alkali"],[38,"Sr","Estrôncio",5,2,2,5,"alkaline"],[39,"Y","Ítrio",5,3,3,5,"transition"],[40,"Zr","Zircônio",5,4,4,5,"transition"],[41,"Nb","Nióbio",5,5,5,5,"transition"],[42,"Mo","Molibdênio",5,6,6,5,"transition"],[43,"Tc","Tecnécio",5,7,7,5,"transition"],[44,"Ru","Rutênio",5,8,8,5,"transition"],[45,"Rh","Ródio",5,9,9,5,"transition"],[46,"Pd","Paládio",5,10,10,5,"transition"],[47,"Ag","Prata",5,11,11,5,"transition"],[48,"Cd","Cádmio",5,12,12,5,"transition"],[49,"In","Índio",5,13,13,5,"post"],[50,"Sn","Estanho",5,14,14,5,"post"],[51,"Sb","Antimônio",5,15,15,5,"metalloid"],[52,"Te","Telúrio",5,16,16,5,"metalloid"],[53,"I","Iodo",5,17,17,5,"halogen"],[54,"Xe","Xenônio",5,18,18,5,"noble"],
[55,"Cs","Césio",6,1,1,6,"alkali"],[56,"Ba","Bário",6,2,2,6,"alkaline"],
[57,"La","Lantânio",6,null,3,8,"lanthanide"],[58,"Ce","Cério",6,null,4,8,"lanthanide"],[59,"Pr","Praseodímio",6,null,5,8,"lanthanide"],[60,"Nd","Neodímio",6,null,6,8,"lanthanide"],[61,"Pm","Promécio",6,null,7,8,"lanthanide"],[62,"Sm","Samário",6,null,8,8,"lanthanide"],[63,"Eu","Európio",6,null,9,8,"lanthanide"],[64,"Gd","Gadolínio",6,null,10,8,"lanthanide"],[65,"Tb","Térbio",6,null,11,8,"lanthanide"],[66,"Dy","Disprósio",6,null,12,8,"lanthanide"],[67,"Ho","Hólmio",6,null,13,8,"lanthanide"],[68,"Er","Érbio",6,null,14,8,"lanthanide"],[69,"Tm","Túlio",6,null,15,8,"lanthanide"],[70,"Yb","Itérbio",6,null,16,8,"lanthanide"],[71,"Lu","Lutécio",6,null,17,8,"lanthanide"],
[72,"Hf","Háfnio",6,4,4,6,"transition"],[73,"Ta","Tântalo",6,5,5,6,"transition"],[74,"W","Tungstênio",6,6,6,6,"transition"],[75,"Re","Rênio",6,7,7,6,"transition"],[76,"Os","Ósmio",6,8,8,6,"transition"],[77,"Ir","Irídio",6,9,9,6,"transition"],[78,"Pt","Platina",6,10,10,6,"transition"],[79,"Au","Ouro",6,11,11,6,"transition"],[80,"Hg","Mercúrio",6,12,12,6,"transition"],[81,"Tl","Tálio",6,13,13,6,"post"],[82,"Pb","Chumbo",6,14,14,6,"post"],[83,"Bi","Bismuto",6,15,15,6,"post"],[84,"Po","Polônio",6,16,16,6,"metalloid"],[85,"At","Astato",6,17,17,6,"halogen"],[86,"Rn","Radônio",6,18,18,6,"noble"],
[87,"Fr","Frâncio",7,1,1,7,"alkali"],[88,"Ra","Rádio",7,2,2,7,"alkaline"],
[89,"Ac","Actínio",7,null,3,9,"actinide"],[90,"Th","Tório",7,null,4,9,"actinide"],[91,"Pa","Protactínio",7,null,5,9,"actinide"],[92,"U","Urânio",7,null,6,9,"actinide"],[93,"Np","Netúnio",7,null,7,9,"actinide"],[94,"Pu","Plutônio",7,null,8,9,"actinide"],[95,"Am","Amerício",7,null,9,9,"actinide"],[96,"Cm","Cúrio",7,null,10,9,"actinide"],[97,"Bk","Berquélio",7,null,11,9,"actinide"],[98,"Cf","Califórnio",7,null,12,9,"actinide"],[99,"Es","Einstênio",7,null,13,9,"actinide"],[100,"Fm","Férmio",7,null,14,9,"actinide"],[101,"Md","Mendelévio",7,null,15,9,"actinide"],[102,"No","Nobélio",7,null,16,9,"actinide"],[103,"Lr","Laurêncio",7,null,17,9,"actinide"],
[104,"Rf","Rutherfórdio",7,4,4,7,"transition"],[105,"Db","Dúbnio",7,5,5,7,"transition"],[106,"Sg","Seabórgio",7,6,6,7,"transition"],[107,"Bh","Bóhrio",7,7,7,7,"transition"],[108,"Hs","Hássio",7,8,8,7,"transition"],[109,"Mt","Meitnério",7,9,9,7,"transition"],[110,"Ds","Darmstádtio",7,10,10,7,"transition"],[111,"Rg","Roentgênio",7,11,11,7,"transition"],[112,"Cn","Copernício",7,12,12,7,"transition"],[113,"Nh","Nihônio",7,13,13,7,"post"],[114,"Fl","Fleróvio",7,14,14,7,"post"],[115,"Mc","Moscóvio",7,15,15,7,"post"],[116,"Lv","Livermório",7,16,16,7,"post"],[117,"Ts","Tenessino",7,17,17,7,"halogen"],[118,"Og","Oganessônio",7,18,18,7,"noble"]
].map(([atomicNumber,symbol,name,period,group,displayColumn,displayRow,category])=>Object.freeze({atomicNumber,symbol,name,period,group,displayColumn,displayRow,category})));
const MISSION_ITEM_IDS=Object.freeze({stone:BLOCK.STONE,sand:BLOCK.SAND,coal:BLOCK.COAL,iron:BLOCK.IRON,copper:BLOCK.COPPER,sulfur:BLOCK.SULFUR,salt:BLOCK.SALT,clay:BLOCK.CLAY,basalt:BLOCK.BASALT,obsidian:BLOCK.OBSIDIAN,gold:BLOCK.GOLD,tin:BLOCK.TIN,zinc:BLOCK.ZINC,crystal:BLOCK.CRYSTAL,marble:BLOCK.MARBLE,deepstone:BLOCK.DEEPSTONE,amethyst:BLOCK.AMETHYST,niter:BLOCK.NITER,spectral:BLOCK.SPECTRAL,glass:BLOCK.GLASS,limestone:BLOCK.LIMESTONE,water:"water",indicator:"indicator",sodium_chloride:"sodium_chloride"});
const MISSION_RESOURCE_KEYS=new Map(Object.entries(MISSION_ITEM_IDS).map(([key,id])=>[id,key]));
function missionResourceKeyForId(id){return MISSION_RESOURCE_KEYS.get(id)||null}
let legacyPeriodicMission=null;try{legacyPeriodicMission=JSON.parse(localStorage.qc_periodic_mission_v47||localStorage.qc_periodic_mission_v46||"null")}catch(e){}
messageCenter=window.QuimiCraftSystems.createMessageCenter({visibleContainer:$("notificationStack"),historyList:$("historyList"),emptyState:$("historyEmpty"),getGameTime:()=>`Dia ${state.dayCount} · ${$("timeLabel")?.textContent||"00:00"}`});
elementMissions=window.QuimiCraftSystems.createElementMissionSystem({
  elements:PERIODIC_ELEMENTS,
  inventoryCount:countItem,
  removeInventoryItem:(id,quantity)=>{const ok=removeItem(id,quantity);if(ok){saveInventory();renderInventory()}return ok},
  grantItem:addItem,
  itemIds:MISSION_ITEM_IDS,
  itemName,
  reactionIds:CHEM.map(reaction=>reaction.id),
  unlockReaction:id=>{if(!unlockedChem.has(id)){unlockedChem.add(id);saveChem()}},
  notify:data=>messageCenter.add(data),
  onChange:()=>updateMissionHud(),
  legacyPeriodicMission,
  worldSeed:WORLD_SEED
});
scienceSystem=window.QuimiCraftScience.createScienceSystem({
  worldSeed:WORLD_SEED,
  notify:data=>{const message=messageCenter.add(data);if(data?.critical)sound("alert",.9);return message},
  damagePlayer:(amount,source,type)=>damagePlayer(amount,source,type),
  resolveItemId:resolveScienceItemId,
  countItem:scienceInventoryCount,
  removeItem:(id,quantity)=>{const ok=removeScienceInventoryItem(id,quantity);if(ok){saveInventory();renderInventory()}return ok},
  addItem,
  exchangeItems:(need,out,reserve,preview)=>transactInventory(need,out,LIQUID_REAGENT_PROFILES,reserve,preview),
  itemName,
  getSampleCapacity:()=>8+(isEquipped("sample_case")?(EQUIPMENT_DEFS.sample_case.sampleCapacity||12):0),
  onChange:api=>{if(scienceUI)scienceUI.updateHUD(api.getSnapshot())}
});
function huntChemistryGuide(){
  const reactions=new Map(fieldLab.reactions.map(reaction=>[reaction.id,reaction]));
  const itemLabel=key=>itemName(resolveScienceItemId(key));
  const amounts=entries=>entries.map(([key,count])=>`${count}× ${itemLabel(key)}`).join(" + ");
  return Object.entries(fieldLab.huntChemistry).map(([type,ids])=>{
    const creature=QuimiCraftBiomeFauna.species[type],steps=ids.map(id=>reactions.get(id));
    const product=resolveScienceItemId(steps.at(-1).out[0][0]);
    return {
      creature:creature.name,
      material:itemLabel(steps[0].need[0][0]),
      level:creature.contractOnly?exterminationContracts[type].level:null,
      product:itemName(product),
      use:fieldLab.huntUtilities[product]??BDEF[product]?.description,
      steps:steps.map(reaction=>({
        name:reaction.name,
        station:reaction.stations.map(id=>scienceSystem.stations[id].name).join(" ou "),
        inputs:amounts(reaction.need),
        outputs:amounts(reaction.out),
        fuel:reaction.fuel?amounts([reaction.fuel]):null
      }))
    };
  });
}
scienceUI=window.QuimiCraftScienceUI.createScienceUI({
  system:scienceSystem,
  elements:PERIODIC_ELEMENTS,
  bridge:{
    itemName,
    huntChemistryGuide:huntChemistryGuide(),
    getEquippedIds:equippedItemIds,
    toast,
    openModal:openScienceModal,
    closeModal:closeScienceModal,
    refreshInventory:()=>{saveInventory();saveEquipment();renderInventory();updateVitals()},
    recordAnalysis:result=>{
      if(fieldwork.step===2&&result.ok&&result.sample.id===fieldwork.sample&&result.newlyRevealed.length)advanceFieldwork(3);
    },
    recordObservation:()=>{if(fieldwork.step===3)advanceFieldwork(4)},
    recordReaction:id=>{elementMissions?.recordEvent("reaction",{id});updateMissionHud()},
    fieldInfo,fieldIntact,releaseGas:releaseFieldGas,
    playFeedback:(phase,feedback)=>sound(phase==="reaction-failed"?"alert":feedback==="electric"?"magic":feedback==="smoke"||feedback==="steam"?"splash":"reaction",phase==="reaction-start" ? .45 : .75),
    openLegacyChemistry:()=>{closeScienceModal("scienceStation",false);openChemistry()}
  }
});
for(const atomicNumber of elementMissions.exportState().completedElements||[]){const element=PERIODIC_ELEMENTS.find(entry=>entry.atomicNumber===atomicNumber);if(element)scienceSystem.registerDiscovery("elements",String(atomicNumber),{name:element.name,symbol:element.symbol,source:"Tabela Periódica",researchProgress:100,silent:true})}
let periodicQuestion=null,professorView="talk",periodicVisualSignature="";
function periodicProgress(){return elementMissions.getStats().completed}
function startPeriodicMission(){elementMissions.introduce();elementMissions.setTrackerHidden(false);refreshPeriodicWall();updateMissionHud()}
function missionVisualSignature(){const stats=elementMissions.getStats(),active=elementMissions.getActiveMission();return `${stats.introduced}|${stats.completed}|${stats.currentStage}|${active?.id||""}|${active?.state||""}`}
function syncPeriodicMissionVisuals(){if(!periodicWallRoot)return;const signature=missionVisualSignature();if(signature!==periodicVisualSignature){periodicVisualSignature=signature;refreshPeriodicWall()}}
function updateMissionHud(){
  const el=$("missionHud");if(!el||!elementMissions)return;const stats=elementMissions.getStats(),mission=elementMissions.getActiveMission();
  if(!stats.introduced||stats.trackerHidden){el.classList.remove("show");syncPeriodicMissionVisuals();return}
  if(mission){const pct=mission.progress.total?mission.progress.current/mission.progress.total*100:0;el.innerHTML=`<button type="button" data-hide-mission aria-label="Ocultar missão">×</button><span>MISSÃO · ${mission.elementSymbol}</span><b>${mission.title}</b><small>${mission.objective.description}</small><progress max="100" value="${pct}"></progress><small>${mission.progress.current} / ${mission.progress.total}</small>`}
  else el.innerHTML=`<button type="button" data-hide-mission aria-label="Ocultar missão">×</button><span>PROJETO DA TABELA PERIÓDICA</span><b>${stats.completed} / 118 elementos</b><small>${stats.tableCompleted?"Tabela restaurada":"Fale com o Prof. Carbono para escolher a próxima missão."}</small>`;
  el.classList.add("show");el.classList.toggle("complete",stats.tableCompleted);el.querySelector("[data-hide-mission]").onclick=()=>elementMissions.setTrackerHidden(true);syncPeriodicMissionVisuals()
}
function elementFamily(e){return e.category}
function renderPeriodicTable(){
  const board=$("periodicGrid"),stats=elementMissions.getStats(),done=stats.completed,total=stats.total,activeMission=elementMissions.getActiveMission();
  $("periodicProgress").textContent=stats.tableCompleted?"Tabela concluída":`${done} de ${total} elementos concluídos`;$("periodicBarFill").style.width=`${done/total*100}%`;$("periodicIntro").textContent=stats.introduced?"Os blocos mostram o estado de cada pesquisa. Missões de identificação e análise são respondidas aqui.":"Fale com o Prof. Carbono para iniciar o projeto dos 118 elementos.";
  const cells=[];for(const e of PERIODIC_ELEMENTS){const mission=elementMissions.getMissionForElement(e.atomicNumber),missionState=mission.state,clickable=missionState==="active"||missionState==="ready-to-complete"||missionState==="available";cells.push(`<button class="periodic-cell family-${elementFamily(e)} state-${missionState}" style="grid-column:${e.displayColumn};grid-row:${e.displayRow}" data-element="${e.atomicNumber}" data-clickable="${clickable}" ${clickable?"":"disabled"}><span>${e.atomicNumber}</span><b>${e.symbol}</b><small>${e.name}</small></button>`)}
  board.innerHTML=cells.join("");board.querySelectorAll("[data-element]:not(:disabled)").forEach(button=>button.onclick=()=>askPeriodicElement(+button.dataset.element));
  if(stats.tableCompleted)$("periodicQuiz").innerHTML='<div class="periodic-complete"><b>ARQUIVO COMPLETO</b><span>Os 118 elementos foram restaurados e permanecem salvos neste mundo.</span></div>';
  else if(!periodicQuestion)$("periodicQuiz").innerHTML=activeMission?`<div class="periodic-idle">${activeMission.objectiveType==="identify"||activeMission.objectiveType==="analyze"?"Selecione o bloco da missão ativa para analisar o elemento.":"A missão ativa usa outro tipo de objetivo. Consulte o rastreador ou o Prof. Carbono."}</div>`:'<div class="periodic-idle">Escolha uma missão com o Prof. Carbono para ativar um elemento.</div>'
}
function askPeriodicElement(n){
  const mission=elementMissions.getMissionForElement(n),active=elementMissions.getActiveMission();if(!mission)return;
  if(mission.state==="available")return toast("Inicie esta missão falando com o Prof. Carbono");
  if(!active||active.elementAtomicNumber!==n)return toast("Este não é o elemento da missão ativa");
  if(!["identify","analyze"].includes(active.objectiveType))return toast(active.hint);
  const e=PERIODIC_ELEMENTS.find(element=>element.atomicNumber===n);periodicQuestion={element:e,objectiveType:active.objectiveType};const pool=PERIODIC_ELEMENTS.filter(element=>element.atomicNumber!==n).sort(()=>Math.random()-.5).slice(0,3).map(element=>element.symbol),options=[...pool,e.symbol].sort(()=>Math.random()-.5);
  $("periodicQuiz").innerHTML=`<div class="periodic-question"><span>NÚMERO ATÔMICO ${e.atomicNumber}</span><h3>${e.name}</h3><p>Qual símbolo completa esta posição?</p><div>${options.map(symbol=>`<button data-symbol="${symbol}">${symbol}</button>`).join("")}</div></div>`;$("periodicQuiz").querySelectorAll("[data-symbol]").forEach(button=>button.onclick=()=>answerPeriodic(button.dataset.symbol))
}
function answerPeriodic(symbol){
  if(!periodicQuestion)return;const {element,objectiveType}=periodicQuestion;if(symbol!==element.symbol){sound("hit",.35);toast("Símbolo incorreto — tente novamente");$("periodicQuiz").classList.add("wrong");setTimeout(()=>$("periodicQuiz").classList.remove("wrong"),320);return}
  elementMissions.recordEvent(objectiveType==="analyze"?"analyze_element":"identify_element",{atomicNumber:element.atomicNumber});messageCenter.add({category:"mission",text:`Objetivo concluído: ${element.name} identificado. Volte ao Prof. Carbono para registrar a entrega.`});sound("pickup",.75);reactionParticles("spectral_analysis");periodicQuestion=null;refreshPeriodicWall();renderPeriodicTable();updateMissionHud()
}
function openPeriodicTable(){state.periodic=true;state.playing=false;state.left=false;$("periodicTable").classList.add("open");$("periodicTable").setAttribute("aria-hidden","false");document.exitPointerLock?.();elementMissions.recordEvent("activate_station",{id:"periodic"});renderPeriodicTable()}
function closePeriodicTable(){state.periodic=false;$("periodicTable").classList.remove("open");$("periodicTable").setAttribute("aria-hidden","true");periodicQuestion=null;requestPointer()}
function nearPeriodicTable(){return Math.abs(player.pos.x-PERIODIC_STATION.x)<10.6&&player.pos.z>PERIODIC_STATION.z-2.6&&player.pos.z<PERIODIC_STATION.z+1.45&&Math.abs(player.pos.y-LAB_LAYOUT.y)<5}
function missionCardHTML(mission,actionLabel="Iniciar"){
  const pct=mission.progress.total?mission.progress.current/mission.progress.total*100:0;return `<article class="mission-card"><span class="mission-card-symbol">${mission.elementSymbol}</span><div><b>${mission.title}</b><small>${mission.objective.description}</small><div class="mission-progress-track"><i style="width:${pct}%"></i></div><small>${mission.progress.current} / ${mission.progress.total} · ${mission.stageTitle}</small></div><button type="button" data-mission-action="${mission.id}">${actionLabel}</button></article>`
}
function renderProfessor(view=professorView){
  professorView=view;const content=$("professorContent"),stats=elementMissions.getStats(),active=elementMissions.getActiveMission();$("professorProgress").textContent=`Elementos concluídos: ${stats.completed} / 118 · Etapa ${stats.currentStage}: ${stats.currentStageTitle}`;$("professorActions").querySelectorAll("[data-professor-view]").forEach(button=>button.classList.toggle("active",button.dataset.professorView===view));
  if(view==="exit")return closeProfessor();
  if(view==="talk")content.innerHTML=`<h3>Projeto da Tabela Periódica</h3><p>${stats.completed?"Continuamos avançando. Cada bloco restaurado registra uma pesquisa permanente neste mundo.":"A Tabela Periódica tem 118 blocos de pesquisa. Vamos restaurá-los em etapas, usando exploração, mineração, reações seguras e análise científica."}</p><div class="professor-summary"><div class="professor-stat"><span>Elementos</span><b>${stats.completed} / 118</b></div><div class="professor-stat"><span>Etapa atual</span><b>${stats.currentStage} / 9</b></div><div class="professor-stat"><span>Missão</span><b>${active?active.elementSymbol:"Nenhuma"}</b></div></div><button class="professor-cta" type="button" data-jump-view="available">Ver missões disponíveis</button>`;
  else if(view==="available"){const available=elementMissions.getAvailableMissions();content.innerHTML=`<h3>Missões disponíveis</h3><p>Escolha uma pesquisa da etapa atual. Apenas uma missão fica ativa por vez.</p><div class="mission-list">${available.length?available.map(mission=>missionCardHTML(mission)).join(""):'<p>Nenhuma missão disponível enquanto a missão atual estiver ativa.</p>'}</div>`}
  else if(view==="current")content.innerHTML=active?`<h3>${active.title}</h3><p>${active.description}</p><div class="mission-list">${missionCardHTML(active,active.state==="ready-to-complete"?"Pronta":"Em andamento")}</div>`:`<h3>Nenhuma missão ativa</h3><p>Abra “Missões disponíveis” para selecionar um elemento da etapa atual.</p>`;
  else if(view==="deliver")content.innerHTML=active?`<h3>Entregar materiais e pesquisa</h3><p>${active.state==="ready-to-complete"?"O objetivo foi concluído. Registre o elemento e receba a recompensa.":`Ainda falta concluir o objetivo: ${active.objective.description}`}</p><div class="mission-list">${missionCardHTML(active,active.state==="ready-to-complete"?"Concluir missão":"Ainda incompleta")}</div>`:`<h3>Nada para entregar</h3><p>Inicie uma missão para acompanhar sua pesquisa.</p>`;
  else if(view==="progress")content.innerHTML=`<h3>Progresso da Tabela Periódica</h3><p>Elementos concluídos: ${stats.completed} / 118</p><div class="stage-progress-list">${elementMissions.getStages().map(stage=>`<div class="stage-progress-row"><span>Etapa ${stage.id} — ${stage.title}</span><span>${stage.completed} / ${stage.total}</span></div>`).join("")}</div>`;
  else if(view==="hints")content.innerHTML=active?`<h3>Dica — ${active.title}</h3><p>${active.hint}</p><p>Progresso atual: ${active.progress.current} / ${active.progress.total}. Itens já obtidos são reconhecidos sempre que o objetivo permitir.</p>`:`<h3>Dicas</h3><p>Escolha uma missão. O rastreador mostra o objetivo ativo. Use Shift + M para ocultá-lo ou reexibi-lo.</p>`;
  content.querySelectorAll("[data-jump-view]").forEach(button=>button.onclick=()=>renderProfessor(button.dataset.jumpView));
  content.querySelectorAll("[data-mission-action]").forEach(button=>button.onclick=()=>{const mission=elementMissions.getMissionForElement(Number(button.dataset.missionAction.match(/\d+/)?.[0]));if(!mission)return;if(mission.state==="available"){elementMissions.startMission(mission.id);elementMissions.setTrackerHidden(false);messageCenter.add({category:"mission",speaker:"PROF. CARBONO",text:`${mission.title}: ${mission.objective.description}`});refreshPeriodicWall();renderProfessor("current")}else if(mission.state==="ready-to-complete"){const completed=elementMissions.completeActiveMission();if(completed){scienceSystem?.registerDiscovery("elements",String(completed.elementAtomicNumber),{name:completed.elementName,symbol:completed.elementSymbol,source:completed.objective?.description||"Missão do Prof. Carbono",researchProgress:100});scienceSystem?.registerDiscovery("missions","periodic_elements",{name:"Restauração da Tabela Periódica",source:`${completed.elementName} (${completed.elementSymbol})`,researchProgress:Math.round(elementMissions.getStats().completed/118*100)});scienceSystem?.grantResearchPoints(3,`missão do elemento ${completed.elementSymbol}`);saveInventory();renderInventory();refreshPeriodicWall();renderProfessor("progress")}}else toast(mission.hint);updateMissionHud()})
}
function openProfessor(){state.professor=true;state.playing=false;state.left=false;$("professor").classList.add("open");$("professor").setAttribute("aria-hidden","false");document.exitPointerLock?.();const first=!elementMissions.getStats().introduced;elementMissions.introduce();elementMissions.recordEvent("talk_npc",{id:"carbon"});if(first)messageCenter.add({category:"dialogue",speaker:"PROF. CARBONO",text:"Quero transformar esta tabela em um arquivo vivo dos 118 elementos. Vamos começar pelos elementos essenciais."});renderProfessor(first?"talk":professorView)}
function closeProfessor(){state.professor=false;$("professor").classList.remove("open");$("professor").setAttribute("aria-hidden","true");requestPointer()}
function reactionParticles(kind){if(settings.particles===0)return;const col=kind==="copper_sulfate"?0x3478e5:kind==="acid"?0x9edb54:0x62e5c0;for(let i=0;i<(settings.particles===1?7:14);i++){const p={x:player.pos.x+.5,y:player.pos.y+1,z:player.pos.z+.5,id:BLOCK.GLASS};const m=new THREE.Mesh(new THREE.SphereGeometry(.035+hash(i,2)*.045,5,4),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8}));m.position.set(p.x+(hash(i,3)-.5),p.y+hash(i,4),p.z+(hash(i,5)-.5));m.userData.v=new THREE.Vector3((hash(i,6)-.5)*.6,.5+hash(i,7),(hash(i,8)-.5)*.6);m.userData.life=.8+hash(i,9);particleGroup.add(m);particles.push(m)}}

const SHOP_CATALOG={
  civic_market:{title:"Mercado de Feira",subtitle:"Sementes, ervas e mantimentos da vila.",
    goods:[["wheat_seed",2,4],["bean_seed",2,3],["beet_seed",2,3],["potato_seed",3,3],["wild_mint",3,3],["honey",4,2],["bait",2,4]]},
  food:{title:"Mercearia da Colheita",subtitle:"Comidas preparadas e ingredientes da região.",goods:[["bread",3,2],["berries",2,3],["honey",4,2],["cheese",5,2],["plant_oil",5,1]]},
  armor:{title:"Forja Cobalto",subtitle:"Proteções, ferramentas e peças reforçadas.",goods:[["shield",10,1],["shield_oval",12,1],["shield_tower",19,1],["chainmail",14,1],["iron_helmet",12,1],["iron_boots",11,1],["armor_plate",8,1],["iron_sword",12,1],[BLOCK.BRONZE_BLOCK,9,2]]},
  solid:{title:"Reagentes Sólidos",subtitle:"Minerais e substâncias secas para novas reações.",goods:[[BLOCK.LIMESTONE,3,4],[BLOCK.NITER,5,2],[BLOCK.SULFUR,4,2],[BLOCK.SALT,3,3],[BLOCK.AMETHYST,8,1],[BLOCK.ZINC,6,1],["silver_dust",9,1],[BLOCK.COPPER,5,2]]},
  liquid:{title:"Reagentes Líquidos",subtitle:"Soluções preparadas em frascos selados.",goods:[["water",2,3],["acid",7,1],["indicator",5,2],["ammonia",6,2],["ethanol",6,2],["liquid_nitrogen",12,1],["hydrogen_peroxide",9,1],["purified_water",5,2]]},
  trinket:{title:"Berloques Prismáticos",subtitle:"Pequenos artefatos raros com propriedades especiais.",goods:[["lucky_charm",9,1],["prism_pendant",14,1],["wind_essence",8,1],["crystal_shard",7,2],["storm_focus",22,1],[BLOCK.SPECTRAL,6,2]]}
};
let currentShop="";
function openShop(kind){const s=SHOP_CATALOG[kind];if(!s)return;currentShop=kind;state.shop=true;state.playing=false;state.left=false;$('shopTitle').textContent=s.title;$('shopSubtitle').textContent=s.subtitle;$('shop').classList.add('open');document.exitPointerLock?.();renderShop()}
function renderShop(){const s=SHOP_CATALOG[currentShop];if(!s)return;$('shopWallet').textContent=`${countItem('gold_nugget')} pepitas de ouro`;$('shopGrid').innerHTML=s.goods.map(([id,price,count],i)=>`<button class="shop-item" data-buy="${i}" ${countItem('gold_nugget')>=price?'':'disabled'}><span class="shop-icon"><span class="voxel-icon" style="--icon:${itemColor(id)}"></span></span><span><strong>${itemName(id)} ×${count}</strong><small>${price} pepitas</small></span></button>`).join('');$('shopGrid').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyShop(+b.dataset.buy))}
function buyShop(i){const g=SHOP_CATALOG[currentShop]?.goods[i];if(!g)return;const [id,price,count]=g;if(countItem('gold_nugget')<price)return toast('Pepitas insuficientes');if(!invSlots.some(s=>s?.id===id)&&!invSlots.some(s=>!s)){toast('Mochila cheia');chatMessage("SISTEMA","Mochila cheia.",{category:"system"});return}removeItem('gold_nugget',price);addItem(id,count);saveInventory();renderInventory();renderShop();sound('pickup',.7);toast(`${itemName(id)} adquirido`)}
function closeShop(){state.shop=false;$('shop').classList.remove('open');requestPointer()}

function persistExtermination(){
  if(switchingWorld)return;
  try{localStorage.qc_extermination_v1=JSON.stringify({seed:WORLD_SEED,...extermination.snapshot()})}
  catch(error){reportSaveIssue("O progresso de extermínio não pôde ser gravado.",error)}
}
function updateExterminationTracker(){
  const tracker=$("exterminationTracker"),{assignment}=extermination.snapshot();
  const {level,xp}=extermination.progress(),label="Extermínio Nv. "+level;
  tracker.hidden=!assignment&&xp===0;
  if(!assignment){tracker.textContent=xp>0?label+" · "+xp.toLocaleString("pt-BR")+" XP":"";return}
  const {type,kills}=assignment,total=exterminationContracts[type].count;
  tracker.textContent=label+" · "+(kills===total?"Volte ao Mestre Gael":`${regionalFauna[type].name} ${kills}/${total}`);
}
function recordExtermination(entity){
  const progress=extermination.record(entity.type);
  if(!progress)return;
  persistExtermination();updateExterminationTracker();
  const {level,previousLevel,gainedXp}=progress,leveledUp=level>previousLevel;
  const xpLabel=`+${gainedXp} XP de Extermínio`;
  if(gainedXp>0)toast(leveledUp?xpLabel+` · Nível ${level}!`:xpLabel);
  if(leveledUp){
    const unlocked=Object.entries(exterminationContracts).filter(([,contract])=>contract.level>previousLevel&&contract.level<=level)
      .map(([type])=>regionalFauna[type].name);
    const reward=unlocked.length?" Nova caçada com Gael · "+unlocked.join(", ")+".":"";
    chatMessage(exterminationMaster.name,`Você chegou ao nível ${level} de Extermínio.`+reward,{category:"mission"});
  }
  if(progress.ready){
    chatMessage(exterminationMaster.name,"Tarefa pronta para entrega. Volte à praça da Vila dos Elementos para receber seus pontos.",{category:"mission"});
  }
  if(progress.ready||leveledUp)sound("pickup",.65);
}
function renderExtermination(){
  const {assignment,points,completed,starterTaken}=extermination.snapshot();
  const {level,xp,startXp,nextXp}=extermination.progress(),atMax=nextXp===null;
  $("exterminationLevel").textContent=`Nível ${level} de Extermínio`;
  $("exterminationXp").textContent=xp.toLocaleString("pt-BR")+" XP";
  const levelBar=$("exterminationProgress");
  levelBar.max=atMax?1:nextXp-startXp;
  levelBar.value=atMax?1:xp-startXp;
  $("exterminationNext").textContent=atMax?"Nível máximo atingido":`${(nextXp-xp).toLocaleString("pt-BR")} XP para o nível ${level+1}`;
  const countLabel=(count,one,many)=>count+" "+(count===1?one:many);
  $("exterminationPoints").textContent=countLabel(points,"ponto de extermínio","pontos de extermínio");
  $("exterminationCompleted").textContent=countLabel(completed,"tarefa entregue","tarefas entregues");
  $("exterminationKit").hidden=starterTaken;
  const nameOf=type=>regionalFauna[type].name;
  if(assignment){
    const {type,kills}=assignment,data=regionalFauna[type],{count,points:reward,xp:killXp}=exterminationContracts[type],ready=kills===count;
    const tool=itemName(data.finisher),recipe=recipes.find(row=>row.out[0]===data.finisher);
    $("exterminationContracts").innerHTML=`<div class="extermination-active">
      <h3>${nameOf(type)}</h3>
      <p>${kills} de ${count} abates · ${killXp} XP por abate · ${countLabel(reward,"ponto","pontos")} na entrega</p>
      <progress max="${count}" value="${kills}" aria-label="Abates da tarefa"></progress>
      ${ready?'<p>Gael pode registrar a tarefa e entregar os pontos.</p><button type="button" class="primary" data-hunt="claim">Entregar tarefa</button>':
        `<p>Procure à noite ou em cavernas de ${data.regions.join(", ")}.</p>
        <p>Finalize com <strong>${tool}</strong>. Receita na mochila · ${recipeNeedsLabel(recipe)}.</p>
        <button type="button" class="secondary danger" data-hunt="abandon">Abandonar tarefa</button>`}
    </div>`;
  }else{
    $("exterminationContracts").innerHTML=`<p>Ganhe XP abatendo as criaturas da sua tarefa. Volte à praça para entregar a tarefa e receber os pontos.</p>
      <div class="extermination-contracts">${Object.entries(exterminationContracts).map(([type,{count,points:reward,level:required,xp:killXp}])=>{
        const {finisher,regions}=regionalFauna[type];
        const locked=level<required;
        return `<button type="button" class="shop-item${locked?" extermination-locked":""}" data-contract="${type}" ${locked?"disabled":""}>
          <span class="shop-icon" aria-hidden="true">${itemIconMarkup(finisher)}</span><span><strong>${nameOf(type)}</strong>
          <small>${locked?"Bloqueada · nível ":"Nível "}${required}</small>
          <small>${count} abates · ${killXp} XP por abate · ${reward} pontos</small><small>${regions.join(", ")}</small></span></button>`;
      }).join("")}</div>`;
  }
  $("exterminationStock").innerHTML=Object.entries(exterminationStock).map(([id,{points:price,count}])=>{
    const item=exterminationTools[id]||huntBadge;
    return `<button type="button" class="shop-item" data-reward="${id}" ${price>points?"disabled":""}>
      <span class="shop-icon" aria-hidden="true">${itemIconMarkup(id)}</span><span><strong>${itemName(id)} ×${count}</strong>
      <small>${countLabel(price,"ponto","pontos")}</small><small>${item.detail}</small></span></button>`;
  }).join("");
}
function showExterminationTab(rewards){
  $("exterminationTasksTab").setAttribute("aria-pressed",String(!rewards));
  $("exterminationRewardsTab").setAttribute("aria-pressed",String(rewards));
  $("exterminationTasks").hidden=rewards;
  $("exterminationRewards").hidden=!rewards;
  $("exterminationFeedback").textContent="";
}
function openExtermination(){
  state.extermination=true;state.playing=false;clearInput();document.exitPointerLock?.();
  $("extermination").classList.add("open");$("extermination").setAttribute("aria-hidden","false");
  showExterminationTab(false);renderExtermination();$("exterminationTasksTab").focus();
}
function closeExtermination(resume=true){
  state.extermination=false;
  $("extermination").classList.remove("open");$("extermination").setAttribute("aria-hidden","true");
  if(resume)requestPointer();
}
function updateExterminationPanel(message){
  persistExtermination();renderExtermination();updateExterminationTracker();
  $("exterminationFeedback").textContent=message;
}
function grantExterminationItems(items){
  const result=transactInventory([],items);
  if(!result.ok)$("exterminationFeedback").textContent=result.message;
  return result.ok;
}
$("exterminationClose").onclick=()=>closeExtermination();
$("exterminationTasksTab").onclick=()=>showExterminationTab(false);
$("exterminationRewardsTab").onclick=()=>showExterminationTab(true);
$("exterminationKit").onclick=()=>{
  if(state.extermination&&extermination.kit(grantExterminationItems)){
    updateExterminationPanel("Kit recebido. Confira o martelo, os sachês e as bolsas na mochila.");
    $("exterminationTasksTab").focus();
  }
};
$("exterminationContracts").onclick=event=>{
  if(!state.extermination)return;
  const type=event.target.closest("[data-contract]")?.dataset.contract;
  const action=event.target.closest("[data-hunt]")?.dataset.hunt;
  if(type&&extermination.accept(type)){
    const message="Tarefa aceita. Leve "+itemName(regionalFauna[type].finisher)+".";
    updateExterminationPanel(message);chatMessage(exterminationMaster.name,message,{category:"mission"});
  }else if(action==="claim"){
    const reward=extermination.claim();
    if(reward>0){updateExterminationPanel(`Tarefa entregue. Você recebeu ${reward} pontos de extermínio.`);sound("pickup",.65)}
  }else if(action==="abandon"&&confirm("Abandonar a tarefa atual? A contagem de abates será zerada. O XP obtido será mantido.")&&extermination.abandon()){
    updateExterminationPanel("Tarefa abandonada. Escolha outra criatura.");
  }else return;
  $("exterminationTasksTab").focus();
};
$("exterminationStock").onclick=event=>{
  const id=event.target.closest("[data-reward]")?.dataset.reward;
  if(state.extermination&&id&&extermination.buy(id,grantExterminationItems)){
    updateExterminationPanel(itemName(id)+" na mochila.");
    $("exterminationRewardsTab").focus();sound("pickup",.65);
  }
};

const entityRoot=new THREE.Group(),entities=[],npcs=[];scene.add(entityRoot);
const breeding=QuimiCraftBreeding.create();
let birthLoadClock=0,heartTexture=null;
const regionalFauna=QuimiCraftBiomeFauna.species,npcLooks=QuimiCraftNPCLooks.create(THREE,part,beam);
let entityPathBudget=0;
const mobMats={
  copper:new THREE.MeshStandardMaterial({color:0xb96d43,roughness:.34,metalness:.66,emissive:0x241006}),copperDark:new THREE.MeshStandardMaterial({color:0x613826,roughness:.3,metalness:.72}),dark:new THREE.MeshLambertMaterial({color:0x26343a}),slime:new THREE.MeshStandardMaterial({color:0x70c95b,transparent:true,opacity:.82,roughness:.18,emissive:0x102d0c}),slimeDark:new THREE.MeshLambertMaterial({color:0x3d8039,transparent:true,opacity:.9}),cyan:new THREE.MeshStandardMaterial({color:0x63d7ce,roughness:.16,emissive:0x19443f}),brown:new THREE.MeshLambertMaterial({color:0x8f6242}),furDark:new THREE.MeshLambertMaterial({color:0x593b2c}),furLight:new THREE.MeshLambertMaterial({color:0xb9855b}),cream:new THREE.MeshLambertMaterial({color:0xd2bd98}),eye:new THREE.MeshBasicMaterial({color:0x0b1012}),iris:new THREE.MeshBasicMaterial({color:0xd9f5dc}),purple:new THREE.MeshStandardMaterial({color:0x7e5aa9,roughness:.22,emissive:0x24183a}),obsidian:new THREE.MeshStandardMaterial({color:0x292638,roughness:.3,metalness:.34,emissive:0x110b1b}),lava:new THREE.MeshStandardMaterial({color:0xf15b22,roughness:.2,emissive:0x7a1d05,emissiveIntensity:1.4}),sand:new THREE.MeshLambertMaterial({color:0xc79655}),sandDark:new THREE.MeshLambertMaterial({color:0x765238}),green:new THREE.MeshLambertMaterial({color:0x527349}),moss:new THREE.MeshLambertMaterial({color:0x48603e}),white:new THREE.MeshLambertMaterial({color:0xe8e1cf}),antler:new THREE.MeshLambertMaterial({color:0x765336}),bone:new THREE.MeshLambertMaterial({color:0xd9ceb0}),red:new THREE.MeshLambertMaterial({color:0x9d3f35}),pink:new THREE.MeshLambertMaterial({color:0xd98b92}),pinkDark:new THREE.MeshLambertMaterial({color:0xa95f66}),cowBlack:new THREE.MeshLambertMaterial({color:0x282b2d}),wool:new THREE.MeshLambertMaterial({color:0xe5dfcf}),sheepWool:new THREE.MeshLambertMaterial({color:0xf1ede1}),sheepWoolShade:new THREE.MeshLambertMaterial({color:0xd6cdbd}),sheepFace:new THREE.MeshLambertMaterial({color:0x4b4742}),sheepMuzzle:new THREE.MeshLambertMaterial({color:0xb8a18b}),sheepNose:new THREE.MeshLambertMaterial({color:0x2d2928}),sheepEarInner:new THREE.MeshLambertMaterial({color:0xc88986}),sheepHoof:new THREE.MeshLambertMaterial({color:0x262628}),beak:new THREE.MeshLambertMaterial({color:0xe0a23c})
};
Object.assign(mobMats,{eyeBrown:new THREE.MeshBasicMaterial({color:0x6b3f24}),eyeGreen:new THREE.MeshBasicMaterial({color:0x72b985}),eyeAmber:new THREE.MeshBasicMaterial({color:0xe1a83f}),eyeAcid:new THREE.MeshBasicMaterial({color:0x9cf06e}),eyeCrystal:new THREE.MeshBasicMaterial({color:0x70e8f0}),eyeViolet:new THREE.MeshBasicMaterial({color:0xb68cff}),eyeEmber:new THREE.MeshBasicMaterial({color:0xff7a2f})});
const NPC_PROFILES={
  npc_extermination_master:{...exterminationMaster,color:0x526469,accent:0xe4ae66,skin:0xac7356,hair:0x3b3338,accessory:"helm"},
  npc_child:{role:"child",name:"Criança da vila",color:0x778f6c,accent:0xf3ca89,skin:0xc38764,hair:0x392b28},
  npc_villager:{role:"villager",name:"Morador da vila",color:0x80885c,accent:0xe6bd82,skin:0xbc835d,hair:0x49362c,
    talk:"Se você trouxer pão para dois adultos da comunidade, eles podem formar uma família."},

  npc_seed_curator:{role:"seed_curator",name:"Curadoria de Sementes",color:0x64834f,accent:0xf0ad73,skin:0xb87957,hair:0x322725,accessory:"flowers",talk:"Cada canteiro guarda plantas de uma estação. Use a bancada de sementes para preparar as próximas colheitas."},
  npc_water_keeper:{role:"water_keeper",name:"Guarda das Águas",color:0x5b9799,accent:0x90d9ba,skin:0xb0765b,hair:0x242029,accessory:"vials",talk:"Colete de novo depois da chuva e compare as amostras. Cor, salinidade e pH revelam informações diferentes."},
  npc_cartographer:{role:"cartographer",name:"Cartógrafo",color:0x62477d,accent:0xf2cc88,skin:0xbe7a5b,hair:0x382828,accessory:"book",talk:"Mapeio os lugares onde o terreno muda em poucos passos."},
  npc_metalsmith:{role:"metalsmith",name:"Mestre das Ligas",color:0x6e5049,accent:0xd2a461,skin:0xa46b4a,hair:0x443823,accessory:"apron",talk:"Antes de levar um minério à forja, confirme o que ele contém. Cor parecida não garante composição igual."},
  npc_herbal_trader:{role:"herbal_trader",name:"Mercador da Feira",color:0x824e68,accent:0xf0bf76,skin:0x80553e,hair:0x332d25,accessory:"sash",talk:"A feira vende ingredientes para cultivo e cozinha. Procure também o fogão no fundo do pavilhão."},
  npc_lab_hydrologist:{role:"lab_hydrologist",name:"Iara Maré",color:0x3c8595,accent:0x93d4df,skin:0x8e5843,hair:0x201b21,accessory:"vials",talk:"Investigo como o sal, o sedimento e os compostos orgânicos alteram a água. Traga uma amostra para tratamento ou destilação."},
  npc_lab_mineralogist:{role:"lab_mineralogist",name:"Noemi Cristal",color:0x7d694d,accent:0xe1af65,skin:0xca8966,hair:0x612f2c,accessory:"goggles",talk:"Leio os minerais pela estrutura e pelo traço. As amostras dos cinco sub-biomas já podem entrar na coleção."},
  npc_lab_ecologist:{role:"lab_ecologist",name:"Maya Musgo",color:0x497459,accent:0xa8d67f,skin:0x754932,hair:0x2d2229,accessory:"book",talk:"Brilho de fungos, pigmentos vegetais e sinais de animais contam histórias diferentes. Use o microscópio para investigar os vestígios."},
  npc_alchemist:{role:"alchemist",name:"Alquimista",color:0x846faa,accent:0x8dc7bb,skin:0xb87550,hair:0x382921,accessory:"vials"},
  npc_weaver:{role:"weaver",name:"Tecelã",color:0x935f7a,accent:0xe4b87e,skin:0xb27652,hair:0x2e241c,accessory:"sash",talk:"Lã e bastões rendem toldos. As cores dos tecidos acompanham os pigmentos que encontro por aqui."},
  npc_cook:{role:"cook",name:"Cozinheira",color:0x995743,accent:0xf5c988,skin:0x89583e,hair:0x3e2a20,accessory:"apron",talk:"Use o fogão de pedra para preparar pratos com pescado, frutas e colheitas. Compare a saciedade que cada receita oferece."},
  npc_smith:{role:"smith",name:"Fundidor",color:0x536270,accent:0xd7975d,skin:0xc9835b,hair:0x252524,accessory:"helm",talk:"Cobre e estanho formam bronze. Cobre e zinco formam latão. Procure a forja da vila para produzir e moldar as ligas."},
  npc_gardener:{role:"gardener",name:"Jardineira",color:0x6c8a57,accent:0xce8cad,skin:0x9e613f,hair:0x4f3425,accessory:"flowers",talk:"Os canteiros da vila seguem a água. Nos lugares secos guardo as sementes perto dos caminhos irrigados."},
  npc_food:{role:"shop_food",name:"Dona Canela",color:0x9c5b48,accent:0xe4b45f,skin:0x925a3e,hair:0x34231d,accessory:"apron",talk:"As frutas da floresta e o mel da serra dão energia para qualquer expedição."},
  npc_armor:{role:"shop_armor",name:"Ferreiro Cobalto",color:0x566a73,accent:0xb67945,skin:0x6f4332,hair:0x202529,accessory:"helm",talk:"Uma boa liga metálica começa na proporção certa — e termina na bigorna."},
  npc_solid:{role:"shop_solid",name:"Dra. Sílica",color:0x9b7c63,accent:0xd6d0b5,skin:0xc98d67,hair:0x55382f,accessory:"goggles",talk:"Calcário, nitratos e cristais: sólidos diferentes, estruturas diferentes."},
  npc_liquid:{role:"shop_liquid",name:"Mestre Solvente",color:0x397f87,accent:0x65d4c9,skin:0x9f684b,hair:0x233b45,accessory:"vials",talk:"Em solução, as partículas ganham liberdade para se encontrar e reagir."},
  npc_trinket:{role:"shop_trinket",name:"Luma Prismática",color:0x6f5792,accent:0xd6b75b,skin:0xb87757,hair:0x271c31,accessory:"crown",talk:"Cada berloque guarda uma pequena história — alguns guardam energia também."},
  npc_farmer:{role:"farmer",name:"Ari do Campo",color:0x627a43,accent:0xcaa45c,skin:0x986044,hair:0x4e3422,accessory:"hat",talk:"A planície florida muda a cada semente. Leve o que precisar, mas replante quando puder."},
  npc_miner:{role:"miner",name:"Nilo Ardósia",color:0x4e5d67,accent:0xd5a74d,skin:0x754938,hair:0x251d19,accessory:"lamp",talk:"Nas camadas profundas há ardósia, ametista e nitrato. Escute a pedra antes de cavar."},
  npc_botanist:{role:"botanist",name:"Flora Rubra",color:0x557b5b,accent:0xda667c,skin:0xc48765,hair:0x5b2e26,accessory:"flowers",talk:"Papoulas, flores-cobalto e estrelas-das-neves agora podem ser coletadas e replantadas."},
  npc_glazier:{role:"glazier",name:"Vitro",color:0x4d7883,accent:0xa8e5e9,skin:0xa96f50,hair:0x322c2b,accessory:"goggles",talk:"Vidro parece sólido, mas sua estrutura é amorfa. É isso que o torna tão fascinante."},
  npc_ceramist:{role:"ceramist",name:"Maya Argila",color:0x9c6655,accent:0xe0aa85,skin:0x7e4c38,hair:0x2e201d,accessory:"apron",talk:"Argila, água e calor: três etapas simples, centenas de possibilidades."},
  npc_teacher:{role:"teacher",name:"Prof. Íon",color:0x4a668c,accent:0x8ec9ec,skin:0xb87757,hair:0x28313c,accessory:"book",talk:"Íons positivos e negativos parecem opostos, mas juntos constroem novos materiais."},
  npc_mayor:{role:"mayor",name:"Alcalina",color:0x71557f,accent:0xd2bd67,skin:0x8d563f,hair:0x3b253b,accessory:"sash",talk:"Bem-vindo à Vila dos Elementos: vinte casas, cinco lojas e muitas histórias para descobrir."},
  npc_baker:{role:"baker",name:"Pão de Mel",color:0xd2a061,accent:0xf0d19a,skin:0xc18461,hair:0x5c3724,accessory:"hat",talk:"Fermentação também é química. O aroma só avisa que os microrganismos trabalharam bem."},
  npc_fisher:{role:"fisher",name:"Maré",color:0x46768a,accent:0x82c5d5,skin:0x6e4433,hair:0x202b30,accessory:"hat",talk:"Agora há lagos por todo o mundo. Cada margem tem um silêncio diferente."},
  npc_geologist:{role:"geologist",name:"Dra. Geodo",color:0x675278,accent:0xa986d8,skin:0xa66d50,hair:0x2f2434,accessory:"crystal",talk:"Ametistas crescem em cavidades. O cristal registra tempo em sua própria geometria."}
};
function nameSprite(text,color="#b8e5d6"){const c=document.createElement("canvas");c.width=256;c.height=64;const x=c.getContext("2d");x.fillStyle="rgba(3,10,13,.7)";if(x.roundRect){x.beginPath();x.roundRect(8,8,240,46,14);x.fill()}else x.fillRect(8,8,240,46);x.fillStyle=color;x.font="700 20px system-ui";x.textAlign="center";x.fillText(text,128,38);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.scale.set(2.8,.7,1);return s}
function jointLeg(parent,rig,x,z,hipY,total,thick,mat,footMat,phase=0){
  const upper=new THREE.Group();upper.position.set(x,hipY,z);upper.userData.phase=phase;parent.add(upper);part(upper,mat,[0,-total*.2,0],[thick,total*.42,thick]);
  const lower=new THREE.Group();lower.position.set(0,-total*.39,0);upper.add(lower);part(lower,mat,[0,-total*.27,0],[thick*.88,total*.54,thick*.88]);part(lower,footMat,[0,-total*.57,-thick*.25],[thick*1.14,.1,thick*1.5]);upper.userData.lower=lower;rig.legs.push(upper);return upper
}
function jointArm(parent,rig,x,y,z,mat,handMat,total=.68,thick=.2){
  const upper=new THREE.Group();upper.position.set(x,y,z);upper.userData.side=Math.sign(x)||1;parent.add(upper);part(upper,mat,[0,-total*.22,0],[thick,total*.44,thick]);
  const lower=new THREE.Group();lower.position.set(0,-total*.41,0);upper.add(lower);part(lower,mat,[0,-total*.24,0],[thick*.88,total*.48,thick*.88]);part(lower,handMat,[0,-total*.53,-.025],[thick*.9,.18,thick*.92]);upper.userData.lower=lower;rig.arms.push(upper);return upper
}
function brightEye(parent,x,y,z,size=.06,iris=mobMats.eyeBrown,slit=false){const eye=new THREE.Group();eye.position.set(x,y,z);eye.userData.entityEye=true;eye.userData.size=size;parent.add(eye);part(eye,mobMats.dark,[0,0,.012],[size*2.05,size*1.62,.018]);part(eye,mobMats.white,[0,0,0],[size*1.68,size*1.28,.016]);part(eye,iris,[0,0,-.012],[size*.82,size*.92,.012]);const pupil=part(eye,mobMats.eye,[0,0,-.022],[size*(slit?.2:.38),size*(slit?1.05:.62),.01]);part(eye,mobMats.white,[size*.23,size*.22,-.03],[size*.22,size*.22,.008]);const lid=part(eye,mobMats.dark,[0,size*.72,-.032],[size*1.86,size*.16,.008]);eye.userData.pupil=pupil;eye.userData.lid=lid;return eye}
function glassesFrame(parent,x,y,z,w=.14,h=.11){part(parent,metalMat,[x,y+h*.5,z],[w,.018,.014]);part(parent,metalMat,[x,y-h*.5,z],[w,.018,.014]);part(parent,metalMat,[x-w*.5,y,z],[.018,h,.014]);part(parent,metalMat,[x+w*.5,y,z],[.018,h,.014])}
const FAUNA_VARIANTS={
  amber_ibis:{model:"owl",name:"Íbis Âmbar",tint:0xd1a766,scale:.96,height:1.49,radius:.36},
  peat_slime:{model:"slime",name:"Geleia de Turfa",tint:0x875330,scale:.87,height:1.0,radius:.48},
  lumen_moth:{model:"moth",name:"Mariposa Lúmen",tint:0x67d7bb,scale:.52,height:.8,radius:.29},
  rime_fox:{model:"fox",name:"Raposa do Gelo Azul",coat:0x9aaebd,trim:0xf3e7d8,shape:"dog",pattern:"ears",scale:.96,height:1.0,radius:.38},
  travertine_guard:{model:"golem",name:"Sentinela de Travertino",tint:0xd7b790,scale:.87,height:1.87,radius:.57},
  iron_armadillo:{model:"armadillo",name:"Tatu de Hematita",scale:.91,height:.87,radius:.49},
  wild_boar:{model:"pig",name:"Javali do Bosque",tint:0x62483c,scale:1.22,height:1.07,radius:.54},
  flower_hare:{model:"rabbit",name:"Lebre-dos-Prados",tint:0xb8997c,scale:1.08,height:.79,radius:.30},
  snow_hare:{model:"rabbit",name:"Lebre-da-Neve",tint:0xe4e9f3,scale:.97,height:.74,radius:.28},
  mountain_goat:{model:"sheep",name:"Cabra-das-Cristas",tint:0xaa9a8a,scale:1.17,height:1.48,radius:.51},
  scoria_ram:{model:"sheep",name:"Carneiro da Escória",tint:0x694d49,scale:1.22,height:1.57,radius:.55},
  savanna_gazelle:{model:"deer",name:"Gazela da Savana",tint:0xc99a54,scale:.87,height:1.5,radius:.47},
  cacao_tapir:{model:"capivara",name:"Anta-do-Cacau",tint:0x6e514f,scale:1.29,height:1.31,radius:.60},
  marsh_heron:{model:"owl",name:"Garça-do-Estuário",tint:0xe4ebde,scale:.95,height:1.45,radius:.37},
  crystal_heron:{model:"owl",name:"Garça Cristalina",tint:0x86bda9,scale:1.05,height:1.52,radius:.39},
  lilac_songbird:{model:"owl",name:"Cantor-lilás",tint:0xb78bd3,scale:.71,height:.96,radius:.28},
  salt_marsh_rabbit:{model:"rabbit",name:"Lebre das Salinas",tint:0xb3ab82,scale:1.12,height:.82,radius:.32},
  pyrite_crawler:{model:"scorpion",name:"Rastejante de Pirita",tint:0xc89542,scale:1.13,height:.89,radius:.47},
  forest_deer:{model:"deer",name:"Cervo das Sequoias",tint:0xb7784e,scale:1.09,height:1.9,radius:.56},
  mangrove_capivara:{model:"capivara",name:"Capivara do Mangue",tint:0x927c51,scale:.96,height:1,radius:.54},
  frost_owl:{model:"owl",name:"Coruja dos Fiordes",tint:0xcbdff4,scale:1.05,height:1.42,radius:.36},
  glass_scorpion:{model:"scorpion",name:"Escorpião Vítreo",tint:0x5d65ac,scale:1.18,height:.91,radius:.49}
};
const faunaMaterials=new Map();
function faunaDetails(type,variant,g,rig){
  g.scale.setScalar(variant.scale);
  g.traverse(node=>{
    if(!node.isMesh||!node.material.color)return;
    const key=type+":"+node.material.uuid;
    if(!faunaMaterials.has(key)){
      const mat=node.material.clone();
      mat.color.lerp(new THREE.Color(variant.tint),["frost_owl","snow_hare","marsh_heron","wild_boar","scoria_ram","amber_ibis","rime_fox","travertine_guard","peat_slime"].includes(type)?.69:.42);
      faunaMaterials.set(key,mat);
    }
    node.material=faunaMaterials.get(key);
  });
  if(type==="wild_boar"){
    for(const side of [-1,1])beam(rig.head,mobMats.cream,[side*.154,-.071,-.36],[side*.23,.046,-.53],.054);
    for(let i=0;i<4;i++)part(rig.body,mobMats.furDark,[0,.84,.34-i*.16],[.155,.10,.132],[i*.05,0,0]);
  }
  if(type==="mountain_goat"||type==="scoria_ram")for(const side of [-1,1]){
    const material=type==="scoria_ram"?mobMats.furDark:mobMats.antler;
    beam(rig.head,material,[side*.131,.2,.02],[side*.24,.43,.075],.064);
    beam(rig.head,material,[side*.24,.43,.075],[side*.27,.53,.23],.046);
    if(type==="mountain_goat")part(rig.head,mobMats.furDark,[0,-.25,-.131],[.105,.245,.093],[.35,0,0]);
  }
  if(type==="cacao_tapir"){
    part(rig.head,mobMats.furDark,[0,-.145,-.48],[.208,.176,.162],[.27,0,0]);
    part(rig.head,mobMats.brown,[0,-.21,-.545],[.184,.125,.13],[.43,0,0]);
  }
  if(type==="marsh_heron"||type==="crystal_heron"){
    const material=type==="marsh_heron"?mobMats.cream:windGlassMat;
    beam(rig.head,mobMats.beak,[0,-.061,-.24],[0,-.093,-.58],.051);
    for(const side of [-1,1]){
      const foot=[side*.14,.012,.12];
      beam(g,mobMats.beak,[side*.106,.37,.003],foot,.027);
      beam(g,mobMats.beak,foot,[side*.15,.026,-.125],.019);
      if(type==="crystal_heron")part(rig.head,material,[side*.192,.189,.06],[.095,.15,.13]);
    }
  }
  if(type==="mangrove_capivara")for(const side of [-1,1]){
    part(rig.head,mobMats.furDark,[side*.235,.04,-.245],[.088,.19,.03],[0,0,side*.28]);
    part(rig.body,mobMats.moss,[-.1,.78,side*.265],[.31,.094,.026],[0,0,side*.12]);
  }
  if(type==="amber_ibis"){
    beam(rig.head,mobMats.dark,[0,-.091,-.24],[0,-.185,-.53],.057);
    beam(rig.head,mobMats.beak,[0,-.181,-.53],[0,-.295,-.68],.041);
    for(const side of [-1,1]){
      beam(g,mobMats.beak,[side*.14,.42,.02],[side*.14,.025,.18],.036);
      beam(g,mobMats.beak,[side*.14,.025,.18],[side*.14,.033,-.03],.027);
    }
  }
  if(type==="lumen_moth"){
    for(const side of [-1,1]){
      const wing=new THREE.Group();
      wing.userData.side=side;
      wing.position.set(side*.1,.78,.03);
      part(wing,windGlassMat,[side*.47,.07,.0],[.88,.08,.55],[0,0,side*.19]);
      part(wing,mobMats.purple,[side*.32,-.14,.24],[.62,.06,.36],[0,0,side*.33]);
      part(wing,mobMats.slime,[side*.56,.1,-.08],[.19,.085,.18]);
      beam(g,mobMats.dark,[side*.09,.93,-.2],[side*.26,1.26,-.37],.029);
      g.add(wing);rig.wings.push(wing);
    }
  }
  if(type==="travertine_guard"){
    for(let i=0;i<3;i++)part(g,i%2?mobMats.furLight:mobMats.cream,[0,.75+i*.23,-.37],[.77,.12,.14]);
    for(const side of [-1,1])part(g,brassMat,[side*.50,1.43,.015],[.33,.15,.48]);
  }
  if(type==="peat_slime"){
    for(const [x,z] of [[-.22,-.12],[.19,.06],[0,.18]])part(g,mobMats.moss,[x,.95,z],[.23,.075,.20]);
  }
  if(type==="glass_scorpion"||type==="pyrite_crawler")for(let i=0;i<4;i++){
    const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.13-i*.014,0),windGlassMat);
    crystal.position.set(0,.44,-.31+i*.2);
    crystal.rotation.set(.2,0,.14);
    g.add(crystal);
  }
}
function createEntity(type,x,z,persistent=false,resident=null,young=false,form){
  if(type==="npc")type="npc_carbon";
  const species=type,regional=regionalFauna[species],dragon=DRAGONS[species];
  const plant=type==="screamer"?screamer.plants[resident?.variant]??screamer.plants.forest:null;
  const nativeGhost=spectral.isNative(species),ghost=nativeGhost||(!regional?.finisher&&(form??(!persistent&&!plant&&spectral.roll())));
  const variant=FAUNA_VARIANTS[species]||(regional?.model?regional:null);
  if(variant)type=variant.model;const g=new THREE.Group(),h=Number.isFinite(resident?.y)?resident.y:findStandingY(x,z,terrainHeight(x,z)+2),rig={legs:[],arms:[],wings:[],tails:[],rotors:[],eyes:[],head:null,body:null};g.position.set(x,h,z);let name="Criatura",flying=false,role="",look=null;
  const tree=natureFolk[species],warden=siteWardens[species],legend=folklore.creatures[species];
  const forged=regional?.alloy,gem=regional?.gem;
  const polygonal=QuimiCraftFaunaModels.has(species)||QuimiCraftFaunaModels.has(regional?.shape);
  const special=!!(polygonal||forged||gem||regional?.finisher||["magma","ghost","crab","armadillo","medusa","serpent","spider"].includes(type));
  if(dragon){name=dragon.name;flying=true;wildlife.dragon(dragon,g,rig,jointLeg)}
  else if(plant){name=plant.name;wildlife.screamer(g,rig,plant)}
  else if(legend){name=legend.name;wildlife.folklore(species,g,rig)}
  else if(tree){name=tree.name;role="nature_folk";wildlife.livingTree(tree,g,rig)}
  else if(warden){name=warden.name;wildlife.siteWarden(warden,g,rig,jointLeg)}
  else if(regional?.finisher)wildlife.exterminationCreature(g,rig,regional);
  else if(polygonal){
    const style=regional??variant;
    name=style.name;flying=style.flying===true;
    faunaModels.terrestrial(species,style,g,rig,hash(x,z,WORLD_SEED%997));
  }
  else if(forged||gem){
    wildlife.siteWarden({aspect:gem?"gem":"metal",color:regional.tint,secondary:gem??regional.glow,alloy:forged},g,rig,jointLeg);
  }else if(type==="ghost"){
    flying=true;wildlife.ghost(g,rig,regional);
  }else if(type==="crab"){
    wildlife.crab(g,rig,regional);
  }else if(type==="magma"){
    name="Elemental de Magma";wildlife.magma(g,rig,jointLeg,regional);
  }else if(type==="armadillo"){
    wildlife.armadillo(g,rig);
  }else if(type==="medusa"){
    wildlife.medusa(g,rig,regional);
  }else if(type==="serpent"||type==="spider"){
    wildlife.venomFauna(g,rig,regional);
  }
  else if(type==="npc_carbon"||type==="npc_ranger"){
    role=type==="npc_carbon"?"carbon":"ranger";name=role==="carbon"?"Prof. Carbono":"Guardiã Íris";
    const cloth=role==="carbon"?coatMat:mobMats.green,hair=role==="carbon"?hairMat:mobMats.furDark;
    look=QuimiCraftNPCLooks.describe(WORLD_SEED,role,{uniform:true,color:cloth.color.getHex(),scale:1});
    if(role==="carbon")Object.assign(look,{hair:"parted",faceW:1,faceH:1,faceD:1});
    else Object.assign(look,{hair:"braid",faceW:.96,faceH:1.04,faceD:1});
    g.scale.set(look.width,look.height,look.depth);
    rig.body=part(g,cloth,[0,1.13,0],[.58,.72,.32]);part(g,role==="carbon"?coatShadeMat:mobMats.moss,[0,1.13,-.177],[.52,.62,.035]);part(g,leatherMat,[0,.83,-.19],[.61,.1,.07]);part(g,brassMat,[0,.83,-.226],[.1,.13,.045]);
    const head=new THREE.Group();head.position.set(0,1.79,0);g.add(head);rig.head=head;
    npcLooks.face(head,look,skinMat,skinLightMat,hair,brightEye,{hideHair:role==="ranger"});
    part(g,skinShadeMat,[0,1.54,0],[.18,.16,.18]);for(const sx of [-1,1]){part(g,cloth,[sx*.36,1.43,0],[.2,.22,.32]);jointArm(g,rig,sx*.45,1.5,0,cloth,skinLightMat,.7,.21);jointLeg(g,rig,sx*.17,0,.78,.82,.22,pantsMat,bootMat,sx>0?Math.PI:0)}
    if(role==="carbon"){
      part(g,coatMat,[-.2,1.18,-.181],[.24,.54,.028],[0,0,-.035]);part(g,coatMat,[.2,1.18,-.181],[.24,.54,.028],[0,0,.035]);part(g,mobMats.red,[0,1.35,-.198],[.08,.3,.025]);glassesFrame(g,-.09,1.835,-.258,.13,.1);glassesFrame(g,.09,1.835,-.258,.13,.1);part(g,metalMat,[0,1.835,-.26],[.05,.018,.014]);part(g,mobMats.cyan,[.2,1.03,-.19],[.15,.14,.018]);const flask=new THREE.Mesh(new THREE.OctahedronGeometry(.085,0),windGlassMat);flask.position.set(-.46,.77,-.08);g.add(flask)
    }else{
      npcLooks.rangerHelmet(head,mobMats.green,bootMat,brassMat);
      beam(g,leatherMat,[-.24,1.49,-.205],[.28,.91,-.207],.065,.029);
      const quiver=new THREE.Group();
      quiver.position.set(.29,1.20,.25);quiver.rotation.z=-.27;g.add(quiver);
      part(quiver,leatherMat,[0,0,0],[.18,.67,.19]);
      part(quiver,bootMat,[0,.306,0],[.20,.085,.21]);
      for(const [x,y,z] of [[-.043,.462,-.023],[.036,.48,.018],[.005,.515,-.041]]){
        beam(quiver,brassMat,[x,.25,z],[x,y,z],.012,.012);
        part(quiver,coatShadeMat,[x,y-.035,z],[.032,.069,.024],[0,.52,0]);
      }
      const bow=weaponModel("bow",false);
      bow.name="Arco da Guardiã";
      bow.position.set(0,-.371,-.098);bow.rotation.set(-.1,0,-.12);
      bow.scale.setScalar(.66);rig.arms[0].userData.lower.add(bow);rig.bow=bow;
    }
    const label=nameSprite(name,role==="carbon"?"#b8e5d6":"#d8e7a8");label.position.set(0,2.58,0);g.add(label);persistent=true
  }else if(type.startsWith("npc_")){
    const original=NPC_PROFILES[type]||NPC_PROFILES.npc_farmer;
    const alchemist=original.role==="alchemist",apprentice=!!resident?.apprentice,school=resident?.office?.kind||resident?.school||"wandering";
    const uniform=alchemist||original.role===exterminationMaster.role||!resident&&["lab_ecologist","lab_hydrologist","lab_mineralogist","shop_armor"].includes(original.role);
    look=QuimiCraftNPCLooks.describe(WORLD_SEED,resident?.id||type,{
      age:resident?.age,culture:resident?.culture,color:original.color,uniform,scale:resident?.scale
    });
    const p=resident?{...original,...resident,accent:resident.trim??original.accent}:original;
    const cloth=new THREE.MeshLambertMaterial({color:look.coat});
    const accent=new THREE.MeshStandardMaterial({color:p.accent,roughness:.38,metalness:p.accessory==="helm"?.58:.08});
    const npcSkin=new THREE.MeshLambertMaterial({color:p.skin??original.skin}),npcSkinLight=npcSkin.clone(),
      npcHair=new THREE.MeshLambertMaterial({color:p.hair??original.hair});
    npcSkinLight.color.offsetHSL(0,.015,.095);
    role=p.role;name=p.name;
    if(!alchemist){
      rig.body=part(g,cloth,[0,1.12,0],look.child?[.50,.68,.30]:[.58,.72,.32]);
      if(!look.child){
        part(g,leatherMat,[0,.83,-.19],[.58,.073,.07]);
        part(g,accent,[0,.83,-.226],[.088,.09,.04]);
      }
    }
    part(g,npcSkin,[0,1.55,0],[.18,.15,.18]);
    const head=new THREE.Group();head.position.set(0,1.79,0);g.add(head);rig.head=head;
    const caps=["hat","helm","lamp","crown"];
    npcLooks.face(head,look,npcSkin,npcSkinLight,npcHair,brightEye,{
      cap:caps.includes(p.accessory),hideHair:alchemist&&school!=="pigment"
    });
    for(const sx of [-1,1]){
      part(g,cloth,[sx*.36,1.43,0],[.2,.22,.32]);
      jointArm(g,rig,sx*(look.child?.39:.45),1.5,0,cloth,npcSkinLight,look.child?.61:.7,look.child?.165:.21);
      jointLeg(g,rig,sx*(look.child?.14:.17),0,.78,.82,look.child?.176:.22,pantsMat,bootMat,sx>0?Math.PI:0);
    }
    npcLooks.dress(g,rig,look,cloth,accent,p.accessory);
    if(alchemist)rig.cape=playerModels.alchemistAttire(g,head,rig.arms,school);
    if(apprentice){
      part(g,accent,[0,1.091,-.178],[.362,.409,.045]);
      part(g,leatherMat,[0,.89,-.196],[.379,.067,.046]);
      for(const [x,color] of [[-.116,mobMats.purple],[.026,windGlassMat]]){
        part(g,color,[x,1.037,-.219],[.065,.136,.047]);
        part(g,brassMat,[x,1.114,-.219],[.040,.044,.045]);
      }
      part(g,brassMat,[.108,1.241,-.212],[.057,.052,.023],[0,0,Math.PI/4]);
    }
    if(!alchemist&&p.accessory==="apron"){part(g,mobMats.cream,[0,1.08,-.202],[.43,.55,.025]);for(let q=-1;q<=1;q++)part(g,accent,[q*.14,.92,-.228],[.08,.11,.025])}
    if(p.accessory==="helm"||p.accessory==="lamp"){part(head,p.accessory==="helm"?metalMat:mobMats.dark,[0,.31,.02],[.54,.2,.53]);if(p.accessory==="lamp")part(head,windGlassMat,[0,.33,-.28],[.13,.12,.08])}
    if(role===exterminationMaster.role){
      part(head,accent,[0,.31,-.262],[.23,.068,.05]);
      part(g,leatherMat,[0,1.25,-.185],[.52,.21,.06],[0,0,-.12]);
      part(g,accent,[.12,1.27,-.225],[.15,.15,.045],[0,0,Math.PI/4]);
    }
    if(!alchemist&&p.accessory==="goggles"){glassesFrame(head,-.09,.045,-.258,.13,.1);glassesFrame(head,.09,.045,-.258,.13,.1);part(head,accent,[0,.045,-.26],[.05,.018,.014])}
    if(p.accessory==="vials")for(let q=-1;q<=1;q++){const vial=new THREE.Mesh(new THREE.OctahedronGeometry(.065,0),q===0?windGlassMat:q<0?mobMats.purple:mobMats.slime);vial.position.set(q*.15,1.0,-.24);g.add(vial)}
    if(p.accessory==="crown"||p.accessory==="crystal"){for(let q=-1;q<=1;q++){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.085+Math.abs(q)*.015,0),q===0?windGlassMat:mobMats.purple);const crown=p.accessory==="crown";gem.position.set(q*.15,crown?.33:1.12,-.08);gem.rotation.z=q*.25;(crown?head:g).add(gem)}}
    if(p.accessory==="hat"){part(head,accent,[0,.31,0],[.67,.07,.64]);part(head,accent,[0,.45,.02],[.42,.25,.40])}
    if(!alchemist&&p.accessory==="flowers")for(let q=-2;q<=2;q++){const bud=new THREE.Mesh(new THREE.OctahedronGeometry(.055,0),q%2?mobMats.purple:mobMats.red);bud.position.set(q*.11,.25-Math.abs(q)*.018,-.25);head.add(bud)}
    if(p.accessory==="book"){part(g,mobMats.red,[.27,1.08,-.24],[.23,.31,.06],[0,0,.18]);part(g,mobMats.cream,[.27,1.08,-.31],[.18,.25,.018],[0,0,.18])}
    if(!alchemist&&p.accessory==="sash")part(g,accent,[0,1.22,-.205],[.12,.78,.028],[0,0,.45]);
    const scale=look.scale;
    g.scale.set(scale*look.width,scale*look.height,scale*look.depth);
    if(resident&&!alchemist){
      if(resident.culture==="snow"){
        part(g,accent,[0,1.50,0],[.63,.15,.37]);
        part(g,cloth,[0,.76,.19],[.56,.40,.08]);
      }else if(resident.culture==="coast"){
        part(g,accent,[.24,1.26,-.209],[.125,.39,.041],[0,0,-.24]);
        part(g,leatherMat,[.25,.75,-.11],[.18,.19,.14]);
      }else if(resident.culture==="dry"){
        part(head,accent,[0,.308,.024],[.58,.085,.51]);
        part(head,cloth,[0,.027,.244],[.455,.38,.034]);
      }else{
        for(let q=-1;q<=1;q++)part(g,accent,[q*.11,1.39,-.17],[.064,.071,.039]);
      }
    }
    if(look.child){
      const legs=new Set(rig.legs);
      for(const node of g.children){
        if(legs.has(node)){node.position.y*=.79;node.scale.y=.79}
        else node.position.y-=.16;
      }
    }
    const label=nameSprite(name,alchemist||apprentice?"#dec9fc":p.shop||role===exterminationMaster.role?"#f1d985":"#c9e7c0");label.position.set(0,alchemist?2.67:look.child?2.40:2.58,0);g.add(label);persistent=true
  }else if(regional&&!regional.model||type==="fox"){
    const style=regional||variant;
    name=style.name;
    wildlife.regional(species,style,g,rig,jointLeg,hash(x,z,WORLD_SEED%997));
  }else if(type==="moth"){
    name="Mariposa Lúmen";flying=true;
  }else if(type==="slime"){
    name="Slime Ácido";const blob=new THREE.Group();g.add(blob);rig.body=blob;part(blob,mobMats.slime,[0,.4,0],[.88,.7,.8]);part(blob,mobMats.slime,[0,.82,.04],[.65,.3,.61]);part(blob,mobMats.slimeDark,[0,.18,-.41],[.6,.14,.04]);for(const sx of [-1,1]){brightEye(blob,sx*.23,.58,-.414,.075,mobMats.eyeAcid,true);part(blob,mobMats.dark,[sx*.2,.34,-.416],[.045,.04,.02])}for(let q=0;q<3;q++)part(blob,windGlassMat,[-.3+q*.29,.73+(q%2)*.12,.22],[.07,.08,.065]);for(let q=0;q<4;q++)part(g,mobMats.slime,[(q<2?-1:1)*.54,.09,(q%2?-.31:.31)],[.24,.18,.26])
  }else if(type==="cobrete"){
    name="Cobrete";rig.body=part(g,mobMats.copper,[0,.86,0],[.62,.73,.44]);part(g,mobMats.copperDark,[0,.87,-.237],[.43,.5,.035]);part(g,brassMat,[0,.86,-.258],[.2,.27,.025]);part(g,mobMats.copper,[0,1.47,0],[.5,.44,.42]);part(g,mobMats.dark,[0,1.49,-.228],[.38,.26,.035]);for(const sx of [-1,1]){brightEye(g,sx*.14,1.52,-.247,.065,mobMats.eyeCrystal,true);jointArm(g,rig,sx*.48,1.18,0,mobMats.copper,mobMats.copperDark,.66,.19);jointLeg(g,rig,sx*.2,0,.62,.65,.2,mobMats.copper,mobMats.dark,sx>0?Math.PI:0);part(g,brassMat,[sx*.4,1.26,0],[.18,.22,.24])}part(g,brassMat,[0,1.78,0],[.17,.11,.18]);beam(g,brassMat,[0,1.79,0],[.15,2.02,-.04],.025);part(g,windGlassMat,[.17,2.05,-.05],[.055,.055,.055]);for(const sx of [-1,1]){const gear=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,5,10),mobMats.copperDark);gear.position.set(sx*.33,.86,.46);gear.rotation.y=Math.PI/2;g.add(gear);rig.rotors.push(gear)}
  }else if(type==="cristalume"){
    name="Cristalume";flying=true;const core=new THREE.Mesh(new THREE.OctahedronGeometry(.42,1),windGlassMat);core.position.y=.82;core.castShadow=true;g.add(core);rig.body=core;part(g,mobMats.purple,[0,.82,.18],[.22,.28,.22]);for(const sx of [-1,1]){brightEye(g,sx*.1,.9,-.35,.05,mobMats.eyeViolet);const wing=new THREE.Group();wing.position.set(sx*.24,.86,.04);wing.userData.side=sx;g.add(wing);beam(wing,brassMat,[0,0,0],[sx*.5,.09,.08],.025);beam(wing,brassMat,[0,0,0],[sx*.42,-.18,.1],.025);part(wing,windGlassMat,[sx*.3,-.02,.1],[.42,.055,.28],[0,0,sx*.24]);part(wing,mobMats.purple,[sx*.57,.02,.1],[.18,.04,.14],[0,0,sx*.45]);rig.wings.push(wing)}let crystalTail=[0,.63,.2];for(let q=0;q<3;q++){const next=[(q-1)*.12,.5-q*.1,.36+q*.12];beam(g,mobMats.purple,crystalTail,next,.026);const shard=new THREE.Mesh(new THREE.OctahedronGeometry(.12-q*.018,0),q===1?mobMats.purple:windGlassMat);shard.position.set(...next);shard.rotation.x=.5;g.add(shard);crystalTail=next}
  }else if(type==="scorpion"){
    name="Escorpião das Dunas";wildlife.scorpion(g,rig);
  }else if(type==="golem"){
    name="Golem de Obsidiana";rig.body=part(g,mobMats.obsidian,[0,1.14,0],[.9,.94,.52]);part(g,mobMats.obsidian,[0,1.66,0],[.38,.18,.36]);part(g,mobMats.purple,[0,1.18,-.282],[.3,.38,.045]);part(g,mobMats.moss,[-.3,1.63,-.3],[.25,.08,.24]);part(g,mobMats.obsidian,[0,1.94,0],[.65,.55,.56]);part(g,mobMats.dark,[0,1.77,-.302],[.4,.12,.04]);for(const sx of [-1,1]){brightEye(g,sx*.18,2.02,-.315,.075,mobMats.eyeViolet);jointArm(g,rig,sx*.72,1.56,0,mobMats.obsidian,mobMats.obsidian,.98,.34);jointLeg(g,rig,sx*.3,0,.78,.82,.36,mobMats.obsidian,mobMats.dark,sx>0?Math.PI:0);part(g,mobMats.obsidian,[sx*.7,1.62,0],[.42,.35,.46]);part(g,mobMats.purple,[sx*.23,1.13,-.286],[.07,.25,.035],[0,0,sx*.22])}for(let q=0;q<4;q++)part(g,mobMats.purple,[-.29+q*.19,.91+q*.12,-.286],[.08,.035,.025],[0,0,(q-2)*.35])
  }else if(type==="wisp"){
    name="Espectro da Tempestade";flying=true;const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.34,1),mobMats.purple);core.position.y=.76;g.add(core);rig.body=core;for(const sx of [-1,1])brightEye(g,sx*.11,.8,-.325,.05,mobMats.eyeCrystal);for(let q=0;q<3;q++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.43+q*.1,.024,6,16),q===1?brassMat:windMat);ring.position.y=.76;ring.rotation.set(q*.7,q*.45,0);g.add(ring);ring.userData.phase=q;rig.rotors.push(ring)}for(const sx of [-1,1])beam(g,windMat,[sx*.12,.52,.12],[sx*.28,.05,.42],.035);const crown=new THREE.Mesh(new THREE.OctahedronGeometry(.12,0),windGlassMat);crown.position.set(0,1.18,0);g.add(crown)
  }else if(type==="pig"){
    name="Porco";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.pink,[0,.56,.06],[.82,.55,.52]);const head=new THREE.Group();head.position.set(0,.66,-.55);g.add(head);rig.head=head;part(head,mobMats.pink,[0,0,0],[.52,.45,.43]);part(head,mobMats.pinkDark,[0,-.08,-.39],[.3,.2,.16]);for(const sx of [-1,1]){brightEye(head,sx*.17,.09,-.235,.042,mobMats.eyeBrown);part(head,mobMats.dark,[sx*.09,-.08,-.49],[.035,.045,.025]);for(const zOff of [-.25,.28])jointLeg(g,rig,sx*.31,zOff,.43,.43,.16,mobMats.pink,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI)}const tail=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,5,12,Math.PI*1.55),mobMats.pinkDark);tail.position.set(0,.72,.5);tail.rotation.set(0,Math.PI/2,.4);g.add(tail)
  }else if(type==="cow"){
    name="Vaca";
    const body=new THREE.Group();g.add(body);rig.body=body;wildlife.cowCoat(body);
    const head=new THREE.Group();head.position.set(0,1.01,-.60);g.add(head);rig.head=head;
    part(head,mobMats.cowBlack,[0,.003,.04],[.55,.50,.48]);
    part(head,mobMats.pinkDark,[0,-.123,-.274],[.395,.216,.159]);
    for(const side of [-1,1]){
      brightEye(head,side*.164,.065,-.209,.042,mobMats.eyeBrown);
      part(head,mobMats.cowBlack,[side*.103,-.101,-.355],[.06,.036,.017],[0,0,side*.14]);
      part(head,mobMats.cowBlack,[side*.287,.139,-.019],[.212,.115,.102],[0,0,side*.32]);
      part(head,mobMats.pinkDark,[side*.312,.138,-.073],[.103,.048,.023],[0,0,side*.32]);
      const horn=new THREE.Group();horn.position.set(side*.168,.209,.027);head.add(horn);
      (rig.horns??=[]).push(horn);
      beam(horn,mobMats.antler,[0,0,0],[side*.129,.108,.021],.045);
      beam(horn,mobMats.antler,[side*.129,.108,.021],[side*.151,.190,.021],.027);
      for(const offset of [-.365,.365]){
        const leg=jointLeg(g,rig,side*(offset<0?.289:.319),offset,.61,.60,.159,mobMats.white,mobMats.dark,
          (side>0)===(offset>0)?0:Math.PI);
        if((offset<0)!==(side<0))part(leg,mobMats.cowBlack,[side*.001,-.075,.008],[.161,.122,.166]);
      }
    }
    const udder=new THREE.Group();g.add(udder);rig.adultFeatures=[udder];
    part(udder,mobMats.pinkDark,[0,.475,.166],[.26,.135,.24]);
    for(const side of [-1,1])part(udder,mobMats.pinkDark,[side*.070,.389,.153],[.038,.083,.037]);
    const tail=new THREE.Group();tail.position.set(0,1.00,.648);g.add(tail);rig.tails.push(tail);
    beam(tail,mobMats.cowBlack,[0,0,0],[0,-.47,.090],.041);
    part(tail,mobMats.cowBlack,[0,-.47,.090],[.104,.144,.096]);
  }else if(type==="rabbit"){
    name="Coelho";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.cream,[0,.33,.05],[.52,.45,.48]);const head=new THREE.Group();head.position.set(0,.62,-.35);g.add(head);rig.head=head;part(head,mobMats.cream,[0,0,0],[.38,.37,.34]);for(const sx of [-1,1]){brightEye(head,sx*.13,.05,-.19,.043,mobMats.eyeBrown);part(head,mobMats.cream,[sx*.13,.4,.03],[.11,.55,.12],[0,0,sx*.08]);part(head,mobMats.pink,[sx*.13,.41,-.04],[.045,.4,.03]);jointLeg(g,rig,sx*.18,-.05,.26,.3,.12,mobMats.cream,mobMats.dark,sx>0?0:Math.PI);jointLeg(g,rig,sx*.22,.25,.25,.25,.16,mobMats.cream,mobMats.dark,sx>0?Math.PI:0)}part(head,mobMats.pinkDark,[0,-.08,-.25],[.07,.06,.04]);part(g,mobMats.white,[0,.4,.42],[.22,.22,.2])
  }else if(type==="chicken"){
    name="Galinha";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.48,.04],[.58,.58,.52]);const head=new THREE.Group();head.position.set(0,.9,-.24);g.add(head);rig.head=head;part(head,mobMats.white,[0,0,0],[.34,.34,.32]);part(head,mobMats.beak,[0,-.03,-.3],[.18,.12,.14],[.2,0,0]);part(head,mobMats.red,[0,.3,0],[.12,.18,.1]);part(head,mobMats.red,[0,-.25,-.18],[.1,.18,.08]);for(const sx of [-1,1]){brightEye(head,sx*.12,.07,-.18,.04,mobMats.eyeAmber);jointLeg(g,rig,sx*.13,.02,.25,.28,.08,mobMats.beak,mobMats.dark,sx>0?Math.PI:0);const wing=new THREE.Group();wing.position.set(sx*.34,.5,.04);wing.userData.side=sx;g.add(wing);part(wing,mobMats.cream,[sx*.08,0,0],[.24,.36,.34],[0,0,sx*.18]);rig.wings.push(wing)}for(let q=-1;q<=1;q++)part(g,q===0?mobMats.red:mobMats.cowBlack,[q*.11,.61,.42],[.1,.34,.12],[.45,0,-q*.12])
  }else if(type==="sheep"){
    name="Ovelha";
    const body=new THREE.Group();g.add(body);rig.body=body;
    part(body,mobMats.sheepWool,[0,.72,.04],[.86,.56,.7]);
    part(body,mobMats.sheepWool,[0,.99,.03],[.7,.22,.6]);
    part(body,mobMats.sheepWoolShade,[0,.76,.43],[.68,.38,.16]);
    part(body,mobMats.sheepWoolShade,[0,.76,-.36],[.66,.38,.15]);
    for(const sx of [-1,1]){
      part(body,mobMats.sheepWoolShade,[sx*.45,.72,.04],[.14,.38,.57]);
      part(body,mobMats.sheepWool,[sx*.39,.96,-.18],[.18,.17,.24]);
      part(body,mobMats.sheepWool,[sx*.39,.96,.2],[.18,.17,.24]);
      for(const zOff of [-.24,.28])jointLeg(g,rig,sx*.29,zOff,.48,.45,.115,mobMats.sheepFace,mobMats.sheepHoof,(sx>0)===(zOff>0)?0:Math.PI);
    }
    const neck=new THREE.Group();neck.position.set(0,.78,-.49);g.add(neck);part(neck,mobMats.sheepWoolShade,[0,0,0],[.54,.42,.24]);
    const head=new THREE.Group();head.position.set(0,.87,-.67);g.add(head);rig.head=head;
    part(head,mobMats.sheepFace,[0,-.01,0],[.38,.43,.33]);
    part(head,mobMats.sheepWool,[0,.25,.045],[.44,.18,.36]);
    part(head,mobMats.sheepWoolShade,[-.2,.12,.025],[.1,.19,.27]);
    part(head,mobMats.sheepWoolShade,[.2,.12,.025],[.1,.19,.27]);
    part(head,mobMats.sheepMuzzle,[0,-.13,-.225],[.27,.19,.16]);
    part(head,mobMats.sheepNose,[0,-.17,-.315],[.12,.07,.035]);
    for(const sx of [-1,1]){
      part(head,mobMats.sheepFace,[sx*.28,.14,.025],[.18,.105,.08],[0,0,-sx*.25]);
      part(head,mobMats.sheepEarInner,[sx*.29,.14,-.045],[.105,.05,.025],[0,0,-sx*.25]);
      part(head,mobMats.sheepNose,[sx*.13,.055,-.178],[.052,.052,.018]);
      part(head,mobMats.eyeAmber,[sx*.13,.058,-.197],[.023,.025,.009]);
      part(head,mobMats.white,[sx*.142,.071,-.208],[.01,.01,.005]);
      part(head,mobMats.sheepNose,[sx*.04,-.16,-.337],[.018,.014,.007]);
    }
    const tail=new THREE.Group();tail.position.set(0,.78,.49);tail.rotation.x=-.28;g.add(tail);part(tail,mobMats.sheepWool,[0,.06,.09],[.18,.22,.2]);rig.tails.push(tail);
  }else if(type==="deer"){
    name="Cervo da Taiga";wildlife.deer(g,rig,jointLeg,species);
  }else if(species==="owl"||species==="frost_owl"){
    name=variant?.name??"Coruja Boreal";flying=true;
    wildlife.owl(g,rig,species==="frost_owl");
  }else if(type==="owl"){
    name="Coruja Boreal";flying=true;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.65,0],[.52,.62,.4]);for(let q=0;q<4;q++)part(body,q%2?mobMats.cream:mobMats.white,[0,.46+q*.13,-.215],[.36-q*.035,.08,.035]);const head=new THREE.Group();head.position.set(0,1.06,-.04);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.5,.42,.4]);for(const sx of [-1,1]){part(head,mobMats.cream,[sx*.16,.03,-.215],[.19,.2,.035]);brightEye(head,sx*.16,.05,-.232,.075,mobMats.eyeAmber);beam(head,mobMats.brown,[sx*.22,.25,0],[sx*.34,.45,.02],.05);const wing=new THREE.Group();wing.position.set(sx*.38,.72,.08);wing.userData.side=sx;g.add(wing);part(wing,mobMats.furDark,[-sx*.08,0,0],[.2,.18,.3]);for(let q=0;q<4;q++)part(wing,q%2?mobMats.furDark:mobMats.brown,[sx*(.12+q*.09),-.06-q*.06,.03],[.26,.11,.34-q*.04],[0,0,sx*(.22+q*.08)]);rig.wings.push(wing)}part(head,goldMat,[0,-.05,-.26],[.1,.09,.09]);for(const sx of [-1,1]){beam(g,mobMats.antler,[sx*.12,.38,-.04],[sx*.16,.17,-.11],.025);part(g,mobMats.dark,[sx*.17,.12,-.15],[.1,.045,.16])}for(let q=-1;q<=1;q++)part(g,mobMats.furDark,[q*.12,.3,.28],[.11,.36,.15],[.35,0,-q*.08])
  }else{
    type="capivara";name="Capivara";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.brown,[0,.57,.08],[.88,.58,.52]);part(body,mobMats.furLight,[0,.42,-.195],[.55,.2,.035]);part(g,mobMats.brown,[0,.68,-.3],[.46,.42,.42],[.15,0,0]);const head=new THREE.Group();head.position.set(0,.78,-.58);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.58,.5,.45]);part(head,mobMats.furLight,[0,-.08,-.34],[.38,.24,.24]);part(head,mobMats.dark,[0,-.08,-.47],[.2,.14,.08]);for(const sx of [-1,1]){part(head,mobMats.furDark,[sx*.23,.27,-.08],[.13,.14,.1]);brightEye(head,sx*.2,.11,-.238,.045,mobMats.eyeBrown);part(head,mobMats.cream,[sx*.09,-.2,-.462],[.07,.1,.04]);for(const zOff of [-.25,.28])jointLeg(g,rig,sx*.32,zOff,.45,.48,.17,mobMats.brown,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI);for(const yy of [-.06,.02])beam(head,mobMats.cream,[sx*.08,yy,-.44],[sx*.46,yy-.04,-.54],.012)}part(head,mobMats.cream,[0,-.23,-.46],[.13,.08,.035])
  }
  if(!special&&!legend&&!plant&&species!=="owl"&&species!=="frost_owl")wildlife.refine(type,g,rig);
  if(species==="golem"){
    wildlife.geode(g,0,1.19,-.333,.180,0x3a3245,0xb486d7);
    for(const side of [-1,1])wildlife.geode(g,side*.56,1.60,-.104,.099,0x3a3245,0xb486d7,-side*.34);
  }
  if(variant){
    if(special||species==="frost_owl")g.scale.setScalar(variant.scale);
    else if(type!=="fox")faunaDetails(species,variant,g,rig);
    type=species;name=variant.name;
  }
  if(rig.boto){
    g.updateMatrixWorld(true);
    rig.boto.breachBounds=new THREE.Box3().setFromObject(rig.boto.group).translate(g.position.clone().negate());
    g.rotation.order="YXZ";
  }
  if(regional?.shape==="fantasy"&&!special)wildlife.regionalThreat(species,g,rig);
  if(special)wildlife.ambientEffects(rig,0,0,0,1);
  if(ghost&&!nativeGhost)name=spectral.name(species,name);
  if(ghost&&!rig.ghostMist)spectral.apply(THREE,g);
  g.traverse(node=>{
    if(node.userData.entityEye)rig.eyes.push(node);
    if(node.isMesh){node.castShadow=settings.shadows>0&&!node.material.transparent&&!node.userData.noShadow;node.receiveShadow=settings.shadows>0&&!node.material.transparent}
  });
  const angle=hash(x,z,311)*TAU,phase=hash(x,z,313)*TAU,profile=dragon?QuimiCraftDragons.profile(dragon):
    tree?QuimiCraftMounts.treeProfile():plant?screamer.profile:legend?.profile||warden||QuimiCraftAI.getProfile(type,role);
  const y=h+(dragon?.hover??(flying?regional?.hover??1.15:0));
  const e={type,name,group:g,x,y,z,angle,walkPhase:phase,persistent,phase,profile,hp:profile.hp,maxHp:profile.hp,spectral:ghost,plant,
    hostile:profile.temperament==="hostile",flying,vx:0,vy:0,vz:0,
    onGround:!flying,jumpCooldown:hash(x,z,921)*.7,rig,role,dead:false,resident};
  e.ai=QuimiCraftAI.brain(e,phase);
  if(plant)e.dimensions={radius:.40,height:1.34*plant.shape};
  if(legend)e.dimensions={radius:legend.radius,height:legend.height};
  if(tree)e.dimensions={radius:QuimiCraftMounts.treeBody.width,height:QuimiCraftMounts.treeBody.height};
  if(warden)e.dimensions={radius:.55,height:1.98};
  e.young=young||look?.child||false;
  e.community=resident?.community||(resident?.office?"office:"+resident.office.key:resident?.site?"village:"+resident.site:null);
  if(look){
    e.appearance=look;
    e.dimensions={radius:Math.max(.25,.398*Math.max(g.scale.x,g.scale.z)),height:(look.child?2.02:2.18)*g.scale.y};
  }
  if(young&&!look){
    e.adult={scale:g.scale.clone(),head:rig.head?.scale.clone(),height:entityHeight(e),radius:entityRadius(e),name,profile};
    const legs=new Set(rig.legs);
    e.adult.legs=rig.legs.map(leg=>[leg,leg.position.y]);
    e.adult.bodyParts=g.children.filter(part=>!legs.has(part)).map(part=>[part,part.position.y]);
    e.adult.hip=Math.max(0,...rig.legs.map(leg=>leg.position.y));
    setYoungAnimalGrowth(e,0);
  }
  g.rotation.y=angle+Math.PI;
  g.position.y=y;
  entities.push(e);
  entityRoot.add(g);
  if(persistent)npcs.push(e);
  return e;
}
function disposeEntityDetails(group){group.userData.previewJet?.close();spectral.dispose(group);
  group.traverse(node=>{
  if(node.userData.ownGeometry)node.geometry.dispose();
  if(node.userData.ownMaterial)node.material.dispose();
  if(node.isSkinnedMesh&&!node.userData.sharedSkeleton)node.skeleton.dispose();
  if(node.isSprite){node.material.map?.dispose();node.material.dispose()}
});group.userData.previewGaze?.close()}
function removeEntity(e,keepModel=false){closeDragonBurst(e);clearCreatureStone(e);creatureAfflictions.delete(e);restoreMobColor(e);entityRoot.remove(e.group);if(!keepModel)disposeEntityDetails(e.group);
  if(e.naturalGroup){
    const members=e.naturalGroup.members,index=members.indexOf(e);
    if(index>=0)members.splice(index,1);
    e.naturalGroup=null;
  }
  const companion=bondedMounts.get(e.bonded);
  if(companion&&!e.dead)Object.assign(companion,{x:e.x,y:e.y,z:e.z,hp:e.hp,angle:e.angle});
  let i=entities.indexOf(e);if(i>=0)entities.splice(i,1);i=npcs.indexOf(e);if(i>=0)npcs.splice(i,1);
  if(state.combatTarget===e){state.combatTarget=null;state.combatTargetTime=0}
}

function setYoungAnimalGrowth(e,age){
  const adult=e.adult,growth=lerp(.51,1,age),legRatio=lerp(.73,1,age);
  const drop=e.rig.connectedQuadruped?0:Math.max(0,adult.hip-.032)*(1-legRatio);
  e.group.scale.copy(adult.scale).multiplyScalar(growth);
  if(adult.head)e.rig.head.scale.copy(adult.head).multiplyScalar(lerp(1.07,1,age));
  for(const [part,y] of adult.bodyParts)part.position.y=y-drop;
  if(!e.rig.connectedQuadruped)for(const [leg,hip] of adult.legs){leg.position.y=hip*legRatio+(1-legRatio)*.032;leg.scale.y=legRatio}
  for(const horn of e.rig.horns??[])horn.scale.setScalar(lerp(e.rig.youngFeatures?.length?.06:.26,1,age));
  for(const feature of e.rig.youngFeatures??[])feature.visible=e.type==="forest_deer"||age<.66;
  for(const eye of e.rig.youngEyes??[])eye.scale.setScalar(lerp(1.19,1,age));
  for(const eye of e.rig.eyes)eye.scale.x=lerp(1.16,1,age);
  for(const feature of e.rig.adultFeatures??[])feature.visible=age>=.90;
  if(e.rig.mane)e.rig.mane.visible=age>=.85;
  e.dimensions={radius:adult.radius*growth,height:Math.max(.23,adult.height-drop)*growth};
  if(age>=1){
    e.young=false;e.name=adult.name;e.profile=adult.profile;
    e.hp=Math.min(adult.profile.hp,e.hp/e.maxHp*adult.profile.hp);e.maxHp=adult.profile.hp;
    return;
  }
  if(e.profile===adult.profile){
    e.name="Filhote · "+adult.name;
    e.profile={...adult.profile,temperament:adult.profile.temperament==="calm"?"calm":"skittish",
      strike:null,loot:[],walk:adult.profile.walk*.88,run:adult.profile.run*.80};
    e.hp=e.maxHp=Math.ceil(adult.profile.hp*.48);
  }
}
function breedingHearts(e,count=5){
  if(!settings.particles)return;
  if(!heartTexture){
    const canvas=document.createElement("canvas");canvas.width=canvas.height=32;
    const ctx=canvas.getContext("2d");
    ctx.fillStyle="#ff86ae";ctx.strokeStyle="#974666";ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(16,27);ctx.bezierCurveTo(8,21,3,15,4,10);ctx.bezierCurveTo(4,4,12,3,16,9);
    ctx.bezierCurveTo(20,3,28,4,28,10);ctx.bezierCurveTo(29,15,24,21,16,27);ctx.fill();ctx.stroke();
    ctx.fillStyle="#ffd9e7";ctx.fillRect(8,8,3,3);
    heartTexture=new THREE.CanvasTexture(canvas);
  }
  const y=e.y+entityHeight(e)*.93;
  for(let i=0;i<(settings.particles===1?Math.ceil(count/2):count);i++){
    const p=new THREE.Sprite(new THREE.SpriteMaterial({map:heartTexture,transparent:true,depthWrite:false}));
    p.scale.setScalar(.13+Math.random()*.12);p.position.set(e.x+(Math.random()-.5)*.65,y+Math.random()*.30,e.z+(Math.random()-.5)*.65);
    p.userData.v=new THREE.Vector3((Math.random()-.5)*.27,.50+Math.random()*.37,(Math.random()-.5)*.27);
    p.userData.life=1.28+Math.random()*.40;p.userData.floating=true;
    particleGroup.add(p);particles.push(p);
  }
}
function spawnOffspring(record){
  const young=breeding.age({birth:record})<1;
  let e;
  if(record.family){
    const role=young?"child":record.family;
    const office=record.family==="alchemist"?alchemyWorld.around(record.x,record.z,42)
      .find(site=>"office:"+site.key===record.community):null;
    const resident={...record.look,id:record.id,name:record.name,role,community:record.community,y:record.y,office,
      age:young?"child":undefined,apprentice:young&&record.family==="alchemist"};
    e=createEntity("npc_"+role,record.x,record.z,true,resident);
  }else{
    e=createEntity(record.type,record.x,record.z,false,{y:record.y},young,record.spectral??(record.spectral=spectral.roll()));
    if(young)setYoungAnimalGrowth(e,breeding.age({birth:record}));
  }
  e.birth=record;
  return e;
}
function updateOffspring(dt){
  breeding.tick(dt);
  birthLoadClock-=dt;
  if(birthLoadClock>0)return;
  birthLoadClock=1.4;
  const loaded=new Set(entities.filter(e=>e.birth).map(e=>e.birth.id));
  const distance=Math.min(46,settings.render*CHUNK);
  for(const record of breeding.offspring.values()){
    if(loaded.has(record.id)||Math.hypot(player.pos.x-record.x,player.pos.z-record.z)>distance||
      !hasChunk(Math.floor(record.x/CHUNK),Math.floor(record.z/CHUNK)))continue;
    spawnOffspring(record);
  }
}
function courtshipBehavior(e,behavior,dt){
  if(e.ai.engagement||e.ai.returnTo||behavior.mode==="flee")return behavior;
  const mate=breeding.mate(e,entities,visibleActor);
  if(mate){
    const gap=QuimiCraftAI.range(e,mate);
    if(e.courtship?.mate!==mate)e.courtship={mate,close:0};
    if(gap>1.7||Math.abs(e.y-mate.y)>.45){
      e.courtship.close=0;
      return {mode:"courtship",goal:mate,speed:e.profile.walk*1.18};
    }
    e.courtship.close+=dt;
    if(e.courtship.close>1.05){
      const x=(e.x+mate.x)*.5,z=(e.z+mate.z)*.5,y=(e.y+mate.y)*.5;
      const place=[[x,z],[x-.58,z],[x+.58,z],[x,z-.58],[x,z+.58]].map(([px,pz])=>
        [px,pz,entityTraversal.standing(e,px,pz,y+.50,y-.63,entityRadius(e))])
        .find(([px,pz,floor])=>!labBoundsContains(px,pz,1)&&validMobPlacement(e,px,pz,floor));
      if(place){
        const family=e.community?(e.community.startsWith("office:")?"alchemist":"villager"):null;
        const names=["Ari","Lia","Davi","Nina","Bento","Eva","Ravi","Luna","Iara","Caio"];
        const look=e.resident&&{skin:e.resident.skin,hair:mate.resident?.hair??e.resident.hair,
          culture:e.resident.culture,trim:e.resident.trim,school:e.resident.office?.kind??e.resident.school};
        const record=breeding.born(e,mate,{x:place[0],y:place[2],z:place[1]},
          {family,community:e.community,look,name:names[Math.floor(Math.random()*names.length)]});
        if(record){
          const child=spawnOffspring(record);
          child.parent=e;
          breedingHearts(child,8);
          sound("pickup",.65);
          toast(family?"Nasceu "+child.name+"!":"Nasceu um filhote de "+e.name+"!");
          if(initialReady)saveWorldState();
        }
      }
      e.courtship.close=0;
    }
    return {mode:"courtship",aim:mate,speed:0};
  }
  e.courtship=null;
  if(e.persistent)return behavior;
  const gap=QuimiCraftAI.range(e,playerActor);
  if(!e.young&&gap<6.4&&QuimiCraftBreeding.diet(e)?.items.includes(selectedItem())&&visibleActor(e,playerActor)){
    return {mode:"follow",goal:gap>1.7?playerActor:null,aim:playerActor,speed:gap>1.7?e.profile.walk*1.27:0};
  }
  if(e.young&&e.parent&&!e.parent.dead&&entities.includes(e.parent)&&QuimiCraftAI.range(e,e.parent)>1.4){
    return {mode:"follow",goal:e.parent,speed:e.profile.walk*1.18};
  }
  return behavior;
}
function ambientMobPool(b,habitat){
  const residents=wildlifeBehavior.landResidents[b]??[],specialties=habitats.fauna(habitat,false);
  const regional=QuimiCraftBiomeFauna.ambient(b).filter(type=>{
    if(type==="polar_bear")return b==="tundra"||b==="campina de aurora";
    if(type==="lion"||type==="jaguar"||type==="capivara")return residents.includes(type);
    return true;
  });
  const local=QuimiCraftRegions.localFauna(b);
  const pool=[...residents,...residents,...regional,...specialties];
  if(local&&(!residents.length||residents.includes(local)))pool.push(local);
  return pool.filter(type=>QuimiCraftAI.getProfile(type).temperament!=="hostile");
}
function validMobPlacement(type,x,z,h){
  const actor=typeof type==="string"?{type}:type,radius=entityRadius(actor);
  if(!Number.isFinite(h)||h<2||h>=MAX_Y-3)return false;
  const ground=getBlock(x,h-.07,z);
  if(!BDEF[ground]?.solid||[BLOCK.LEAVES,BLOCK.PINE_LEAVES,BLOCK.CHERRY_LEAVES,BLOCK.PALM_LEAVES,BLOCK.LAVA].includes(ground))return false;
  if(entityCollidesWorld(actor,x,z,h))return false;
  for(const [dx,dz] of [[0,0],[radius*.77,0],[-radius*.77,0],[0,radius*.77],[0,-radius*.77]]){
    const feet=getBlock(x+dx,h+.1,z+dz);
    if(feet===BLOCK.WATER||feet===BLOCK.LAVA||feet===BLOCK.FIRE)return false;
  }
  return true;
}
const spawnDirector=QuimiCraftMobSpawn.create(CHUNK);
function canSpawnHostile(point){
  return spawnDirector.canSpawnHostile(point,player.pos,[...entities,...fishSchool],settings.mobs);
}
function hostileSpecies(type){
  return (DRAGONS[type]??folklore.creatures[type]?.profile??siteWardens[type]??QuimiCraftAI.getProfile(type)).temperament==="hostile";
}
const flyingMobTypes=new Set(["owl","wisp","cristalume","moth","ghost"]);
function spawnLightOpaque(x,y,z){
  const id=getBlock(x,y,z),def=BDEF[id];
  return !!def?.solid&&!def.alpha&&!translucentBlocks.has(id);
}
function spawnLightClear(from,to){
  const steps=Math.ceil(Math.hypot(from.x-to.x,from.y-to.y,from.z-to.z)*2.45);
  for(let step=1;step<steps;step++){
    const t=step/steps;
    const x=lerp(from.x,to.x,t),y=lerp(from.y,to.y,t),z=lerp(from.z,to.z,t);
    if(Math.floor(x)===Math.floor(to.x)&&Math.floor(y)===Math.floor(to.y)&&Math.floor(z)===Math.floor(to.z))break;
    if(spawnLightOpaque(x,y,z))return false;
  }
  return true;
}
function spawnSkyOpen(x,y,z){
  const roof=roofAt(x,z);
  for(let high=Math.floor(y)+1;high<roof;high++)if(spawnLightOpaque(x,high,z))return false;
  return true;
}
function spawnExposure(point){
  if(spawnSkyOpen(point.x,point.y,point.z))return 1;
  if(QuimiCraftMobSpawn.civilTwilight(state.day)<=5)return 0;
  let exposure=0;
  for(const [dx,dz] of [[0,1],[0,-1],[1,0],[-1,0]]){
    for(const distance of [2.5,5.5]){
      const to={x:point.x+dx*distance,y:point.y+.39,z:point.z+dz*distance};
      if(spawnSkyOpen(to.x,to.y,to.z)&&spawnLightClear(point,to)){
        exposure=Math.max(exposure,distance<3?.68:.44);
        break;
      }
    }
    if(exposure>.66)break;
  }
  return exposure;
}
function mobLightAt(x,y,z){
  const point={x,y:y+.58,z},exposure=spawnExposure(point),lights=[];
  const sky=exposure*QuimiCraftMobSpawn.civilTwilight(state.day);
  if(sky>6)return sky;
  const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),search=Math.ceil(9/CHUNK);
  for(let ix=cx-search;ix<=cx+search;ix++)for(let iz=cz-search;iz<=cz+search;iz++){
    const sources=chunks.get(ckey(ix,iz))?.spawnLights;
    if(!sources)continue;
    for(const lamp of sources.values())if(Math.abs(lamp.y-point.y)<9&&Math.hypot(lamp.x-x,lamp.z-z)<9.1)lights.push(lamp);
  }
  return QuimiCraftMobSpawn.lightLevel(point,state.day,exposure,lights,spawnLightClear);
}
function spawnProtected(x,y,z){
  return labBoundsContains(x,z,3)||inVillage(x,z,3)||
    !!alchemyColumnAt(Math.floor(x),Math.floor(z))||labSafe(x,y,z);
}
function nearbySpawnFloors(x,z,terrain,kind){
  const top=findStandingY(x,z,kind==="natural"?terrain+2:Math.max(terrain+2,player.pos.y+2));
  if(kind==="natural")return top>1?[top]:[];
  const spots=[];
  const hi=Math.min(MAX_Y-4,Math.max(terrain+2,top-2),Math.floor(player.pos.y+10)),lo=Math.max(3,Math.floor(player.pos.y-13));
  if(top>1&&Math.abs(top-player.pos.y)<15)spots.push(top);
  for(let y=hi;y>=lo;y--){
    if(y===top||!solidAt(x,y-.05,z)||solidAt(x,y+.05,z)||solidAt(x,y+1.05,z))continue;
    const feet=getBlock(x,y,z);
    if(feet!==BLOCK.WATER&&feet!==BLOCK.LAVA&&feet!==BLOCK.FIRE)spots.push(y);
    if(spots.length>=4)break;
  }
  return spots.sort((a,b)=>Math.abs(a-player.pos.y)-Math.abs(b-player.pos.y));
}
function attemptMobSpawn(kind,eligible=()=>true,record=()=>{}){
  const hostile=kind==="hostile",attempts=hostile?18:20;
  if(!hostile&&spawnDirector.wildlifeCount(entities)>=QuimiCraftMobSpawn.limits[settings.mobs].natural)return null;
  const tracked=hostile?extermination.hunting():null;
  const prioritize=tracked&&entities.filter(e=>e.type===tracked&&!e.dead&&QuimiCraftAI.range(e,playerActor)<55).length<2;
  const maySpawnDragon=!hostile&&settings.mobs>0&&Math.random()<.19&&!entities.some(e=>DRAGONS[e.type]&&!e.dead);
  for(let tries=0;tries<attempts;tries++){
    const a=Math.random()*TAU,wide=tries%3===2;
    const min=hostile?13:9,max=wide?Math.max(42,Math.min(settings.render*CHUNK-4,hostile?16*CHUNK:85)):hostile?48:44;
    const r=min+(max-min)*(wide?Math.sqrt(Math.random()):Math.random());
    const x=Math.floor(player.pos.x+Math.cos(a)*r)+.5,z=Math.floor(player.pos.z+Math.sin(a)*r)+.5;
    if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK))||spawnProtected(x,player.pos.y,z))continue;
    const terrain=terrainHeight(x,z),biome=biomeAt(x,z),habitat=habitats.at(x,z,biome);
    for(const y of nearbySpawnFloors(x,z,terrain,kind)){
      const floor={x,y,z,light:0};
      if(Math.abs(y-player.pos.y)>17)continue;
      const underground=y<=terrain-2;
      if(hostile){
        floor.light=mobLightAt(x,y,z);
        if(floor.light>5||!eligible(floor))continue;
      }else if(!spawnSkyOpen(x,y+.6,z)||entities.some(e=>!e.dead&&Math.hypot(e.x-x,e.z-z)<2.7))continue;
      const dragonPool=maySpawnDragon?QuimiCraftDragons.regional(biome):[];
      const huntHere=prioritize&&regionalFauna[tracked].regions.includes(biome);
      const haunt=hostile&&!huntHere&&!underground&&Math.random()<.16?
        Object.keys(spectral.names).filter(id=>regionalFauna[id]?.regions.includes(biome)):[];
      const pool=huntHere?[tracked]:dragonPool.length?dragonPool:haunt.length?haunt:hostile?QuimiCraftBiomeFauna.hostile(biome,underground):ambientMobPool(biome,habitat);
      if(!pool.length)continue;
      const type=pool[Math.floor(Math.random()*pool.length)];
      if(!hostile&&wildlifeBehavior.landDiets[type]&&entities.some(other=>!other.dead&&other.type===type&&
        Math.hypot(other.x-x,other.z-z)<(wildlifeBehavior.social[type]?14:22)))continue;
      if(type==="hippopotamus"&&![[0,3],[3,0],[0,-3],[-3,0],[0,8],[8,0],[0,-8],[-8,0]].some(([dx,dz])=>
        ["fresh","tannin"].includes(regionalWater(x+dx,z+dz).id)&&findFishWater(x+dx,z+dz)))continue;
      if(type==="polar_bear"&&![[0,7],[7,0],[0,-7],[-7,0],[12,4],[-12,-4],[4,-12],[-4,12]].some(([dx,dz])=>
        regionalWater(x+dx,z+dz).zone==="arctic"&&findFishWater(x+dx,z+dz)))continue;
      if((hostile||hostileSpecies(type))&&!canSpawnHostile(floor))continue;
      const dragon=DRAGONS[type];
      if(dragon){
        if(!spawnSkyOpen(x,y+.8,z)||entityCollidesWorld({type},x,z,y+dragon.hover)||
          ![-2.2,2.2].every(offset=>spawnSkyOpen(x+offset,y+dragon.hover,z)))continue;
      }else if(!validMobPlacement(type,x,z,y))continue;
      const model=regionalFauna[type]?.model||FAUNA_VARIANTS[type]?.model||type;
      const flying=!!dragon||regionalFauna[type]?.flying===true||flyingMobTypes.has(model);
      const hover=regionalFauna[type]?.hover??1.15;
      const altitude=dragon?.hover??(flying?(entityCollidesWorld({type},x,z,y+hover)?.38:hover):0);
      if(flying&&entityCollidesWorld({type},x,z,y+altitude))continue;
      const e=createEntity(type,x,z,false,{y},false,haunt.length>0||undefined);
      if(haunt.length){
        e.profile={...e.profile,temperament:"hostile"};
        e.hostile=true;
      }
      if(habitats.fauna(habitat,false).includes(type)||habitats.fauna(habitat,true).includes(type))e.habitat=habitat;
      e.spawnKind=dragon?"dragon":kind;
      if(hostile){e.spawnRest=0;e.sunClock=2+Math.random()*3;e.sunTime=0;record(floor)}
      e.y=y+altitude;e.group.position.y=e.y;e.ai.home.y=e.y;
      const social=wildlifeBehavior.social[type];
      const paired=!hostile&&!e.hostile&&!e.spectral&&social;
      const limit=QuimiCraftMobSpawn.limits[settings.mobs].natural;
      if(paired){
        const [label,minimum,maximum]=social,count=minimum-1+Math.floor(Math.random()*(maximum-minimum+1));
        let companions=0;
        const group={label,home:{x,y,z},members:[e]};e.naturalGroup=group;
        const spacing=Math.max(1,entityRadius(e)*1.23);
        for(const [dx,dz] of [[1.85,.45],[-1.85,-.45],[.45,-1.85],[-.45,1.85],[2.45,-1.65],[-2.45,1.65]]){
          if(spawnDirector.wildlifeCount(entities)>=limit)break;
          const px=x+dx*spacing,pz=z+dz*spacing;
          if(!hasChunk(Math.floor(px/CHUNK),Math.floor(pz/CHUNK))||biomeAt(px,pz)!==biome||spawnProtected(px,y,pz)||
            entities.some(other=>!other.dead&&Math.hypot(other.x-px,other.z-pz)<1.25))continue;
          const floor=entityTraversal.standing(e,px,pz,y+1.02,y-1.1,entityRadius(e));
          if(floor===null||!validMobPlacement(type,px,pz,floor))continue;
          const young=!!QuimiCraftBreeding.diet(e)&&Math.random()<.21,companion=createEntity(type,px,pz,false,{y:floor},young,false);
          companion.spawnKind="natural";
          companion.naturalGroup=group;group.members.push(companion);
          if(young){companion.wildAge=.001;companion.parent=e}
          if(++companions>=count)break;
        }
      }
      return e;
    }
  }
  return null;
}
function retireDarkMob(e,dt,distance){
  e.spawnRest=distance>79?e.spawnRest+dt:0;
  if(e.spawnRest>18)return true;
  e.sunClock-=dt;
  if(e.sunClock>0)return false;
  e.sunClock=4.1;
  const daytime=QuimiCraftMobSpawn.civilTwilight(state.day)>=10;
  e.sunTime=daytime&&spawnExposure({x:e.x,y:e.y+.56,z:e.z})>=.67?e.sunTime+4.1:0;
  return e.sunTime>18&&distance>16;
}
function ensureProfessorCarbono(){
  const professorAnchor=LAB_ANCHORS["professor-position"];let professor=npcs.find(npc=>npc.role==="carbon");if(professor)return professor;professor=createEntity("npc_carbon",professorAnchor.x,professorAnchor.z,true);professor.x=professorAnchor.x;professor.z=professorAnchor.z;professor.y=findStandingY(professor.x,professor.z,LAB_LAYOUT.y);professor.group.position.set(professor.x,professor.y,professor.z);professor.ai.home.y=professor.y;return professor
}
const visitingResidents=new Map(),villageSigns=new Map(),visitingPets=new Map();
const legacyPetSite=VILLAGE.version===3?null:{id:"legacy-pets",buildings:LEGACY_VILLAGE_BUILDINGS.filter(b=>b.kind==="house")
  .map(b=>({...b,side:1,y:VILLAGE.base,frontX:b.x+.5,frontZ:b.z-4.3}))};
const villageSignColors={orchard:"#d8eda2",cistern:"#a9e3e4",quay:"#a9e3e4",lookout:"#d6c5f2",kiln:"#ffce9b",market:"#fae0a4"};
function updateVillageSigns(site){
  for(const [id,signs] of villageSigns){
    if(id===site?.id)continue;
    for(const sign of signs){
      scene.remove(sign);sign.material.map.dispose();sign.material.dispose();
    }
    villageSigns.delete(id);
  }
  if(!site||villageSigns.has(site.id))return;
  const signs=site.civic.map(lot=>{
    const label=nameSprite(lot.title,villageSignColors[lot.civic]);
    label.position.set(lot.doorX+.5,lot.y+3.67,lot.doorZ+.5-lot.side*.7);
    label.scale.set(2.65,.63,1);scene.add(label);
    return label;
  });
  villageSigns.set(site.id,signs);
}
let villageLifeClock=0;
function syncVillagePets(site){
  for(const [key,pet] of visitingPets)if(pet.petsite!==site?.id||settings.mobs===0){
    removeEntity(pet);
    visitingPets.delete(key);
  }
  if(!site||settings.mobs===0)return;
  const homes=site.buildings.filter(b=>b.kind==="house");
  const pets=QuimiCraftBiomeFauna.pets;
  for(const [i,type] of [...pets,...pets].entries()){
    const key=site.id+":"+type+":"+i,lot=homes[i*2]||homes[i%homes.length];
    if(!lot||visitingPets.has(key))continue;
    for(const [dx,dz] of [[.65,1.15],[-.58,1.15],[0,.54],[0,2.25]]){
      const x=lot.frontX+dx,z=lot.frontZ-lot.side*dz;
      if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))continue;
      const y=findStandingY(x,z,lot.y+1);
      if(!validMobPlacement(type,x,z,y)||entities.some(e=>!e.dead&&Math.hypot(e.x-x,e.z-z)<.9))continue;
      const pet=createEntity(type,x,z,false,{y});
      pet.petsite=site.id;
      visitingPets.set(key,pet);
      break;
    }
  }
}
function spawnVillageResident(resident){
  const existing=npcs.find(n=>n.resident?.id===resident.id);
  if(existing)return existing;
  let type="npc_"+resident.role;
  if(resident.role.startsWith("shop_"))type="npc_"+resident.role.slice(5);
  return createEntity(type,resident.x,resident.z,true,resident);
}
function updateVillageResidents(dt){
  villageLifeClock-=dt;
  if(villageLifeClock>0)return;
  villageLifeClock=1.4;
  const site=villages.near(player.pos.x,player.pos.z,51);
  updateVillageSigns(site);
  syncVillagePets(site||(legacyVillageArea(player.pos.x,player.pos.z,13)?legacyPetSite:null));
  const wanted=site&&!site.main?site.id:null;
  for(const [id,mob] of visitingResidents)if(mob.resident.site!==wanted){removeEntity(mob);visitingResidents.delete(id)}
  if(wanted)for(const resident of site.people){
    if(!visitingResidents.has(resident.id))visitingResidents.set(resident.id,spawnVillageResident(resident));
  }
}
function initWorldLife(){
  ensureProfessorCarbono();
  ensureLaboratoryStaff();
  let ranger=npcs.find(n=>n.role==="ranger");if(!ranger)ranger=createEntity("npc_ranger",spawn.x-3.5,spawn.z+4.5,true);ranger.x=spawn.x-3.5;ranger.z=spawn.z+4.5;ranger.y=findStandingY(ranger.x,ranger.z,terrainHeight(ranger.x,ranger.z)+2);ranger.group.position.set(ranger.x,ranger.y,ranger.z);Object.assign(ranger.ai.home,{x:ranger.x,y:ranger.y,z:ranger.z});
  if(VILLAGE.version===3){for(const resident of villages.main().people)spawnVillageResident(resident)}else{
  spawnVillageResident({...exterminationMaster,id:"legacy:"+exterminationMaster.role,site:"legacy",x:VILLAGE.x+1.5,z:VILLAGE.z+5.5,scale:1});
  const shopTypes=["npc_food","npc_armor","npc_solid","npc_liquid","npc_trinket"];shopTypes.forEach((type,i)=>{const role=NPC_PROFILES[type].role;if(!npcs.some(n=>n.role===role))createEntity(type,VILLAGE.x+(i-2)*VILLAGE.spacing+.5,VILLAGE.z-4.5,true)});
  const residentTypes=["npc_farmer","npc_miner","npc_botanist","npc_glazier","npc_ceramist","npc_teacher","npc_mayor","npc_baker","npc_fisher","npc_geologist"],homes=LEGACY_VILLAGE_BUILDINGS.filter(b=>b.kind==="house");residentTypes.forEach((type,i)=>{const role=NPC_PROFILES[type].role,b=homes[(i*3)%homes.length];spawnVillageResident({id:"legacy:"+role,role,site:"legacy",x:b.x+.5,z:b.z-4.35})});
  for(const [i,house] of homes.slice(0,5).entries()){
    const region=biomeAt(house.x,house.z),culture=QuimiCraftRegions.culture(region),theme=QuimiCraftRegions.skins[culture];
    spawnVillageResident({
      id:"legacy-child:"+i,site:"legacy",x:house.x+.54,z:house.z-5.15,name:["Nina","Caíque","Tainá","Davi","Joana"][i],role:"child",age:"child",culture,tint:theme.tint,trim:theme.trim,scale:i?.64:.60
    });
  }
  }
  const startingCount=[0,10,16,24][settings.mobs];
  for(let i=0;i<startingCount&&spawnDirector.wildlifeCount(entities)<startingCount;i++)attemptMobSpawn("natural");
}
function turnToward(a,b,t){const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));return a+d*clamp(t,0,1)}
function playDragonPreview(group,clip,elapsed,dt){
  const {creatureRig:rig,creatureType:type}=group.userData;
  const frame=QuimiCraftCreaturePoses.dragonPreviewFrame(clip,elapsed,dt||1/30);
  group.position.y=frame.elevation;
  QuimiCraftCreaturePoses.dragon(rig,frame);
  if(frame.channel){
    const {element}=(DRAGONS[type].strike??QuimiCraftDragons.natureBreath);
    const jet=group.userData.previewJet??=frontierFx.dragonStream(element,QuimiCraftDragons.breathStyles[element],group);
    const origin=group.worldToLocal(rig.nose.getWorldPosition(new THREE.Vector3()));
    const facing=group.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(rig.nose.getWorldQuaternion(new THREE.Quaternion()));
    const direction=new THREE.Vector3(0,0,-1).applyQuaternion(facing);
    jet.move(origin,direction,2.36,frame.dt,false);
  }else group.userData.previewJet?.hide();
}
function animateEntityRig(e,dt,now,pace,preview=null){
  const r=e.rig,a=e.ai;
  if(r.bud){
    const open=preview?.charge??(e.scream>0?Math.min(1,(screamer.sound.windup+screamer.sound.duration-e.scream)*1.55):0);
    const t=now*.001;
    r.bud.rotation.x=.44*(1-open)+Math.sin(t*15)*.09*open;
    r.throat.scale.y=.019+open*(.126+Math.sin(t*18)*.023);
    for(const petal of r.petals)petal.rotation.x=.76-open*1.37;
    return;
  }
  if(r.flames)for(const [i,flame] of r.flames.entries()){
    flame.userData.baseFlame??=flame.scale.y;
    flame.scale.y=flame.userData.baseFlame*(1+Math.sin(now*.012+i*1.76)*.22);
    flame.rotation.z=Math.sin(now*.008+i*2)*.24;
  }
  QuimiCraftCreaturePoses.resetWave(r);
  const regional=regionalFauna[e.type],modelType=regional?.model||FAUNA_VARIANTS[e.type]?.model||e.type;
  const crawler=["scorpion","crab","spider","soot_weaver"].includes(modelType);
  const flight=preview?.flight??e.flying;
  const airborne=preview?.airborne??(!flight&&!e.onGround);
  const stride=clamp(pace/e.profile.run,0,1);
  const load=preview?.charge??e.mountedCharge??(a.swing&&e.profile.strike?1-a.swing.remaining/e.profile.strike.windup:0);
  e.mountedStrike=Math.max(0,(e.mountedStrike||0)-dt);
  e.dragonRelease=Math.max(0,(e.dragonRelease||0)-dt);
  const release=preview?.release??Math.max(a.aim/.16,e.mountedStrike/.58,e.dragonRelease/.34);
  const bracing=preview?preview.charge>0||preview.release>0:a.mode==="windup"||a.mode==="strike";
  const motion=preview?1:document.documentElement.classList.contains("reduced-motion")?.45:1;
  const warden=siteWardens[e.type]||regional?.gem||regional?.alloy,expeditionRig=DRAGONS[e.type]||natureFolk[e.type]||warden;
  e.walkPhase+=dt*(expeditionRig?1.3+pace*(natureFolk[e.type]?1.9:2.8):1.1+pace*5.25);
  const gait=preview?.gait??e.walkPhase,reach=(.19+stride*.61)*motion;
  if(r.cape){
    r.cape.rotation.x=.08+stride*.18+Math.sin(gait)*motion*(.018+stride*.035);
    r.cape.rotation.z=Math.sin(now*.002+e.phase)*motion*.04;
  }
  if(expeditionRig){
    const frame={now,dt,phase:e.phase,gait,motion,flight:preview?.flight??!e.onGround,stride,charge:load,release,
      climbing:preview?.climbing??!!e.climbing};
    if(DRAGONS[e.type]){
      const target=e.dragonBurst?.target??e.ai.swing?.target??e.dragonAim;
      const originY=e.y+1.45*DRAGONS[e.type].scale;
      const distance=target?QuimiCraftAI.range(e,target):1;
      const aimPitch=e===riding?.actor?player.pitch:target?Math.atan2(entityAimPoint(target).y-originY,distance):0;
      const offset=target?QuimiCraftAI.heading(e,target)-e.angle:0;
      const aimYaw=e===riding?.actor?0:clamp(Math.atan2(Math.sin(offset),Math.cos(offset)),-.52,.52);
      const burst=e.dragonBurst,charging=burst?.chargeLeft>0;
      QuimiCraftCreaturePoses.dragon(r,{...frame,...e.dragonFlight,aimPitch:clamp(aimPitch,-.68,.68),aimYaw,
        charge:charging?0:frame.charge,release:charging?0:frame.release,
        burstCharge:charging?1-burst.chargeLeft/QuimiCraftDragons.burstRules.charge:0,channel:burst&&!charging?1:0});
    }else if(warden)QuimiCraftCreaturePoses.warden(r,frame);
    else QuimiCraftCreaturePoses.tree(r,frame);
    return;
  }
  r.legs.forEach((leg,index)=>{
    const phase=r.mule&&stride>.36?leg.userData.gallop:leg.userData.phase;
    const wave=Math.sin(gait+(phase??(index%2?Math.PI:0)));
    if(crawler){
      leg.rotation.z=leg.userData.side*(.08+wave*stride*.24*motion);
      leg.rotation.y=wave*stride*.23;
    }else{
      leg.rotation.x=airborne?(index%2?-.36:.26):pace>.04?wave*reach:.015*wave;
      if(leg.userData.lower)leg.userData.lower.rotation.x=airborne?.53:Math.max(0,-wave)*stride*.7;
      if(r.werewolf){
        leg.rotation.x-=.16;
        leg.rotation.z=leg.userData.stance;
        leg.userData.lower.rotation.x+=.29;
      }
    }
  });
  if(r.primate){
    const crouch=1-clamp(pace/e.profile.walk,0,1);
    r.body.position.y=.315-crouch*.061;
    r.body.rotation.x=crouch*.19;
    r.head.position.y=.457-crouch*.045;
    for(const leg of r.legs){
      const {front,height}=leg.userData.primateRest;
      leg.position.y=height-crouch*(front?.063:.074);
      leg.rotation.x=lerp(leg.rotation.x,front?-.54:.72,crouch);
      const lower=leg.userData.lower;
      lower.rotation.x=lerp(lower.rotation.x,front?.83:-1.24,crouch);
    }
  }
  r.arms.forEach((arm,index)=>{
    const side=arm.userData.side||((index%2)*2-1);
    const wave=Math.sin(gait+(index%2?0:Math.PI));
    if(crawler){
      arm.rotation.y=side*(.08+load*.62-release*.18);
      arm.rotation.x=-load*.48+release*.15;
    }else{
      const heavy=["golem","magma"].includes(modelType);
      arm.rotation.x=wave*(pace>.04?reach*.71:.02)+load*(heavy?2.15:1.55)+release*(heavy?.65:.78);
      arm.rotation.z=side*((e.type==="golem"?-.08:r.werewolf?.58:0)-load*.14);
      if(arm.userData.lower)arm.userData.lower.rotation.x=bracing?.38+load*.42:Math.max(0,wave)*stride*.36+(r.werewolf?.42:0);
    }
  });
  if(r.bow){
    const grip=r.arms[0],draw=r.arms[1],aim=bracing?clamp(Math.max(load,release)+.30,0,1):0;
    const pull=bracing?clamp(load,0,1):0;
    grip.rotation.x=lerp(grip.rotation.x,1.42,aim);
    grip.userData.lower.rotation.x=lerp(grip.userData.lower.rotation.x,.18,aim);
    draw.rotation.x=lerp(draw.rotation.x,1.18,aim);
    draw.rotation.y=lerp(0,.46,aim);
    draw.rotation.z=lerp(draw.rotation.z,-.26,aim);
    draw.userData.lower.rotation.x=lerp(draw.userData.lower.rotation.x,.92,aim);
    r.bow.rotation.x=lerp(-.10,-1.60,aim);
    playerModels.animateItem(r.bow,now,pull*.85,motion,load>0);
  }
  for(const wing of r.wings){
    const flap=Math.sin(now*(e.type==="chicken"?.006:.009+stride*.013)+e.phase)*(preview?.wings??1);
    wing.rotation.z=(wing.userData.side||1)*((preview?.glide??0)*.19+.15+flap*(e.type==="chicken"?.15:.62+stride*.19)*motion);
    wing.rotation.x=flap*.08;
  }
  r.tails.forEach((tail,index)=>{
    const sway=tail.userData.sway??1;
    tail.rotation.y=Math.sin(now*.0028+e.phase+index*.55)*(.1+stride*.15)*sway;
    tail.rotation.z=Math.sin(now*.0031+e.phase+index)*(.035+index*.008)*sway;
    tail.rotation.x=tail.userData.restX??=tail.rotation.x;
    if((FAUNA_VARIANTS[e.type]?.model??e.type)==="scorpion")tail.rotation.x-=load*.24-release*.1;
  });
  r.rotors.forEach((rotor,index)=>{
    if(preview){
      const [x,z]=rotor.userData.catalogRest??=[rotor.rotation.x,rotor.rotation.z];
      rotor.rotation.x=x+now*.001*(index%2?.35:-.28);
      rotor.rotation.z=z+now*.001*(1.7+index*.55+stride);
    }else{
      rotor.rotation.z+=dt*(1.7+index*.55+stride);rotor.rotation.x+=dt*(index%2?.35:-.28);
    }
  });
  const sleeping=!preview&&a.mode==="sleep";
  const blinkPhase=(now*.001+e.phase*.71)%4.8,blink=sleeping?.08:blinkPhase>4.58?Math.max(.08,Math.abs(blinkPhase-4.69)*9):1;
  for(const eye of r.eyes){
    const baseY=eye.userData.restScaleY??=eye.scale.y;
    eye.scale.y=lerp(eye.scale.y,baseY*blink,sleeping?.22:.44);
  }
  if(r.head){
    r.head.rotation.y=sleeping?0:Math.sin(now*.0014+e.phase)*.06*motion;
    const grazing=!preview&&a.mode==="forage",resting=!preview&&a.mode==="rest";
    r.head.rotation.x=bracing?-.11*load:grazing?-.42+Math.sin(now*.008+e.phase)*.12:
      sleeping?-.34+Math.sin(now*.0018+e.phase)*.024:resting?-.14:Math.sin(now*.0018+e.phase)*.028;
  }
  if(r.body&&!r.primate&&modelType!=="slime"&&modelType!=="tide_ooze"&&modelType!=="wisp"&&modelType!=="cristalume"){
    const base=r.body.userData.restScale??=r.body.scale.clone();
    if(sleeping){
      const breath=1+Math.sin(now*.0022+e.phase)*.028*motion;
      r.body.scale.set(base.x*1.02,base.y*breath,base.z*1.02);
    }else if(r.body.userData.sleepScaled){
      r.body.scale.copy(base);
    }
    r.body.userData.sleepScaled=sleeping;
  }
  if(r.jaw)QuimiCraftCreaturePoses.bite(r,load,release,dt);
  if((modelType==="slime"||modelType==="tide_ooze")&&r.body){
    const squash=1+Math.sin(now*.007+e.phase)*(.07+stride*.12)*motion-load*.19+release*.15;
    r.body.scale.set(1+(1-squash)*.37,squash,1+(1-squash)*.37);
    r.body.position.y=(1-squash)*.19;
  }else if((modelType==="wisp"||modelType==="cristalume")&&r.body){
    if(preview)r.body.rotation.y=now*.001*(1.1+load*3);
    else r.body.rotation.y+=dt*(1.1+load*3);
    r.body.rotation.x=Math.sin(now*.0025+e.phase)*.18;
  }
  if(r.embers||r.claws||r.gazeOrigin||r.slither)wildlife.ambientEffects(r,now,load,release,motion,stride);
  if(r.folkParticles){
    r.whirlPower=preview?.whirl??Math.max(0,(r.whirlPower||0)-dt*.8);
    wildlife.folkloreEffects(r,now,stride,!!preview||settings.particles>0);
  }
  if(!preview&&e.role){
    e.greetTime=a.mode==="greet"?(e.greetTime??0)+dt:0;
    if(e.greetTime>0)QuimiCraftCreaturePoses.wave(r,e.greetTime%4.6,motion);
  }
}
function entityRadius(e){if(e.dimensions)return e.dimensions.radius;if(DRAGONS[e.type])return DRAGONS[e.type].width;if(regionalFauna[e.type])return regionalFauna[e.type].width;if(FAUNA_VARIANTS[e.type])return FAUNA_VARIANTS[e.type].radius;return e.type==="golem"?.62:e.type==="cow"?.62:e.type==="capivara"?.56:e.type==="deer"?.5:(e.type==="pig"||e.type==="sheep")?.48:e.type==="rabbit"?.28:e.type==="chicken"?.3:e.type==="owl"?.34:e.flying?.4:e.persistent?.42:.4}
const ENTITY_HEIGHT={rabbit:.72,chicken:1.08,pig:.87,sheep:1.27,capivara:1.02,cow:1.6,owl:1.35,deer:1.72,
  slime:1.08,scorpion:.77,golem:2.28,wisp:1.23,cristalume:1.38};
function entityHeight(e){return e.dimensions?.height??DRAGONS[e.type]?.height??regionalFauna[e.type]?.height??FAUNA_VARIANTS[e.type]?.height??ENTITY_HEIGHT[e.type]??1.85}
const playerActor={
  get x(){return player.pos.x},get y(){return player.pos.y},get z(){return player.pos.z},
  get dead(){return player.health<=0}
};
function entityAimPoint(target){
  if(target.aquatic)return target.group.position.clone();
  if(target.rig?.boto&&!target.botoOnLand)return target.group.position.clone().add(new THREE.Vector3(0,.33,0));
  const y=target===playerActor?(player.crouch?.78:1.12):natureFolk[target.type]?1.68:entityHeight(target)*.59+(target.flying?.55:0);
  return new THREE.Vector3(target.x,target.y+y,target.z);
}
function entityProjectileRadius(actor){
  if(actor.aquatic)return Math.max(.29,actor.profile.extent*.73);
  return actor===playerActor?.59:Math.max(.39,entityRadius(actor)+.13);
}
function entityCollidesWorld(e,x,z,baseY=e.y){
  const r=entityRadius(e),low=baseY+.025,top=low+entityHeight(e);
  if(voxelBodyBlocked(x-r,x+r,low,top,z-r,z+r))return true;
  return aabbHitsLabDecor(x-r,x+r,low,top,z-r,z+r)||labDoor.hits(x-r,x+r,low,top,z-r,z+r);
}
const entityTraversal=QuimiCraftAI.createTraversal({
  solid:solidAt,blocked:entityCollidesWorld,maxY:MAX_Y-3,
  hazard(e,x,y,z){
    const id=getBlock(x,y+.09,z);
    return id===BLOCK.WATER||id===BLOCK.LAVA||id===BLOCK.FIRE||
      (!e.persistent&&labBoundsContains(x,z,.75)&&y<LAB_LAYOUT.y+4.2);
  }
});
function entityTerrainLimits(e){
  if(e.type==="mountain_goat"||e.type==="scoria_ram")return {up:2,down:3};
  const type=FAUNA_VARIANTS[e.type]?.model??e.type;
  return {up:1,down:type==="rabbit"||type==="deer"||type==="scorpion"?3:2};
}
function moveEntityWithCollision(e,dx,dz,goal=null){
  const limits=entityTerrainLimits(e),radius=entityRadius(e);
  for(const [ax,az] of [[dx,dz],[dx,0],[0,dz]]){
    const length=Math.hypot(ax,az);
    if(length<.00005)continue;
    const x=e.x+ax,z=e.z+az;
    if(e.flying&&!e.onGround){
      const obstruction=getBlock(x,e.y+.08,z);
      if((!e.persistent&&labBoundsContains(x,z,1)&&e.y<=LAB_LAYOUT.y+4)||obstruction===BLOCK.WATER||obstruction===BLOCK.LAVA)continue;
      for(const lift of [0,.55,1.15]){
        if(entityCollidesWorld(e,e.x,e.z,e.y+lift)||entityCollidesWorld(e,x,z,e.y+lift))continue;
        e.x=x;e.z=z;e.y+=lift;return true;
      }
      continue;
    }
    const ground=entityTraversal.standing(e,x,z,e.y+.10,e.y-limits.down-.12,radius);
    if(ground!==null&&!entityCollidesWorld(e,x,z)){e.x=x;e.z=z;return true}
    if(!e.onGround||e.jumpCooldown>.02)continue;
    const probe=radius+.64;
    const from={x:e.x,y:e.y,z:e.z};
    const ahead={x:e.x+ax/length*probe,z:e.z+az/length*probe};
    const target=goal&&QuimiCraftAI.range(e,goal)<probe+.27?goal:ahead;
    const rise=entityTraversal.edge(e,from,target.x,target.z,limits,radius);
    if(rise===null||rise<=e.y+.16)continue;
    e.hop={from,to:{x:target.x,y:rise,z:target.z},elapsed:0,duration:.26+.105*(rise-e.y)};
    e.vy=0;e.onGround=false;e.jumpCooldown=.47;
    return true;
  }
  return false;
}
function advanceEntityHop(e,dt){
  const hop=e.hop;
  hop.elapsed+=dt;
  const t=Math.min(1,hop.elapsed/hop.duration),at=entityTraversal.hopPoint(hop.from,hop.to,t);
  if(entityCollidesWorld(e,at.x,at.z,at.y)){e.hop=null;return 0}
  const distance=QuimiCraftAI.range(e,at);
  Object.assign(e,at);
  if(t===1){
    e.hop=null;
    e.onGround=entityTraversal.supports(e.x,e.y,e.z,entityRadius(e));
  }
  return distance/dt;
}
function entityJumpPower(e){return {rabbit:6.9,deer:5.9,sheep:5.45,pig:5.25,cow:5.05,chicken:5.2,capivara:5.2,slime:5.5,scorpion:4.9,golem:4.45,magma:5,cobrete:4.9}[FAUNA_VARIANTS[e.type]?.model??e.type]||5.15}
function requestEntityJump(e,urgent=false){
  if(!e||e.flying||!e.onGround||(e.jumpCooldown||0)>0)return false;
  if(entityCollidesWorld(e,e.x,e.z,e.y+.42))return false;
  e.vy=entityJumpPower(e);e.onGround=false;e.jumpCooldown=urgent?.58:.82;
  return true
}
function updateEntityVerticalMotion(e,dt){
  if(e.flying)return;
  const r=entityRadius(e);
  const ground=entityTraversal.standing(e,e.x,e.z,e.y+.09,e.y-2.65,r,false)??-Infinity;
  if(e.y<=ground+.045&&(e.vy||0)<=0){e.y=ground;e.vy=0;e.onGround=true}
  if(!Number.isFinite(ground))e.onGround=false;
  if(!e.onGround||(e.vy||0)!==0||e.y>ground+.045){
    e.vy=Math.max(-28,(e.vy||0)-18.5*dt);
    const nextY=e.y+e.vy*dt;
    if(e.vy>0&&entityCollidesWorld(e,e.x,e.z,nextY)){e.vy=0;e.onGround=false}
    else if(e.vy<=0&&nextY<=ground){e.y=ground;e.vy=0;e.onGround=true}
    else{e.y=nextY;e.onGround=false}
  }else e.y=ground
}
const fishRoot=new THREE.Group();scene.add(fishRoot);
const fishSchool=[];let fishSpawnClock=0;
const fishColors={
  raw_fish:0x76bfcb,raw_carp:0xe6ac58,raw_perch:0x91b976,raw_mullets:0x6f9ece,raw_trout:0xb4b1d8,
  raw_catfish:0x708776,raw_char:0xd398a0,raw_shrimp:0xea957e,raw_eel:0x837e66
};
for(const [name,[,,tint]] of Object.entries(QuimiCraftWorkshops.fishSpecies))fishColors["raw_"+name]=tint;
const sharedFishGeometry=new Set(Object.values(wildlife.shared));
const wildlifeBehavior=QuimiCraftWildlifeBehavior;
const aquaticHostile=profile=>!!profile.attack&&!profile.defensiveOnly&&(profile.attack.kind!=="tail"||profile.attack.venom);
const fishStyle=id=>QuimiCraftWorkshops.fishSpecies[id.slice(4)]?.[3]||
  (id==="raw_eel"||id==="raw_catfish"?"long":id==="raw_mullets"?"slim":undefined);
const fishName=id=>itemName(id).replace(/\s+cru(?:a)?\b/gi,"").replace(/\s*\(cru(?:a)?\)/gi,"").replace(/^Filé de\s+/i,"");
function aquaticProfile(id){
  return QuimiCraftDepths.fauna[id]||QuimiCraftAquatic.fishProfile(id,fishName(id),fishStyle(id));
}
function scaleAquaticModel(model,scale){
  model.group.scale.multiplyScalar(scale);
  model.bounds.min.multiplyScalar(scale);model.bounds.max.multiplyScalar(scale);
}
function aquaticModel(id,detail=false){
  const profile=QuimiCraftDepths.fauna[id];
  const freshwater=["green_anaconda","arapaima","amazon_manatee"].includes(id);
  const model=freshwater?faunaModels.freshwater(id):profile?wildlife.creature(id,detail):wildlife.fish(id,fishColors[id]||fishColors.raw_fish,fishStyle(id));
  model.bounds=new THREE.Box3().setFromObject(model.group);
  const size=profile?.length??profile?.bodySize;
  if(size){
    const axis=profile.sizeAxis??"z";
    scaleAquaticModel(model,size/(model.bounds.max[axis]-model.bounds.min[axis]));
  }
  return model;
}
const catalogAquaticLengths={dolphin:2.8,pink_boto:2.4,reef_shark:2.2,caiman:2.5};
function inspectedAquaticModel(id,ghost=false){
  const model=aquaticModel(id,true);
  model.group.name=id;
  model.group.userData.aquaticRig=model;
  model.ghost=ghost;
  const length=QuimiCraftDepths.fauna[id]?.catalogLength??catalogAquaticLengths[id];
  if(length)scaleAquaticModel(model,length/(model.bounds.max.z-model.bounds.min.z));
  if(model.breach)model.breachBounds=model.bounds;
  if(ghost)spectral.apply(THREE,model.group);
  return model.group;
}
function buildFish(x,y,z,water,species=null,ghost=spectral.roll()){
  const base=species??QuimiCraftWorkshops.fishingYield({biome:biomeAt(x,z),kind:regionalWater(x,z).id,depth:water.depth},
    "fishing_rod",null,()=>clamp(Math.random(),.14,.89))[0][0];
  const id=typeof base==="string"&&base!=="raw_piranha"&&(base.startsWith("raw_")||QuimiCraftDepths.fauna[base])?base:"raw_fish";
  const profile=aquaticProfile(id),large=!!QuimiCraftDepths.fauna[id]&&!profile.small,model=aquaticModel(id);
  const {group}=model;
  if(!large)scaleAquaticModel(model,(id==="raw_shrimp"?.73:1)*(.84+Math.random()*.32));
  const bounds=model.bounds;
  const surfaceClearance=Math.max(profile.surfaceClearance??.35,bounds.max.y+.18);
  const floorClearance=Math.max(profile.baseClearance??.43,-bounds.min.y+.16);
  y=aquaticDepth(water,y,profile,surfaceClearance,floorClearance);
  group.position.set(x,y,z);
  group.name=ghost?spectral.name(id,profile.name):profile.name;
  if(ghost)spectral.apply(THREE,group);
  fishRoot.add(group);
  const heading=Math.random()*TAU;
  group.rotation.order="YXZ";
  group.rotation.y=heading+Math.PI;
  const record={...model,id,profile,large,aquatic:true,hostile:aquaticHostile(profile),spectral:ghost,name:group.name,hp:profile.hp,maxHp:profile.hp,dead:false,
    ai:{mode:"idle"},angle:heading,speed:profile.speed*mobMoveMultiplier,timer:Math.random()*2,baseY:y,phase:Math.random()*TAU,
    cooldown:0,strike:null,alarm:0,water,surfaceClearance,floorClearance,stock:profile.stock,
    surfaceAt:model.spouts||model.breathHeight?8+Math.random()*12:Infinity,surfacings:0,shoreAt:profile.shore?12+Math.random()*17:Infinity,
    breachBounds:model.breach?bounds:null,
    get x(){return group.position.x},get y(){return group.position.y},get z(){return group.position.z}};
  fishSchool.push(record);
  return record;
}
function findFishWater(x,z){
  const sampleX=x,sampleZ=z;
  x=Math.floor(x);z=Math.floor(z);
  const terrain=terrainHeight(x,z);
  for(let y=Math.min(MAX_Y-3,Math.max(WATER_LEVEL,terrain+3));y>=Math.max(2,terrain+1);y--){
    if(getBlock(x,y,z)!==BLOCK.WATER)continue;
    let bottom=y;
    while(bottom>terrain+1&&getBlock(x,bottom-1,z)===BLOCK.WATER)bottom--;
    return {y:y+.37,top:y+liquidSurfaceHeight(BLOCK.WATER,sampleX,y,sampleZ),bottom,depth:y-bottom+1};
  }
  return null;
}
function aquaticWater(x,y,z,extent,angle){
  if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK))||getBlock(x,y,z)!==BLOCK.WATER)return false;
  if(extent<.37)return true;
  const stepX=Math.sin(angle)*extent,stepZ=Math.cos(angle)*extent,flank=extent>2?.63:.33;
  return getBlock(x+stepX,y,z+stepZ)===BLOCK.WATER&&getBlock(x-stepX*.66,y,z-stepZ*.66)===BLOCK.WATER
    &&getBlock(x+stepZ*flank,y,z-stepX*flank)===BLOCK.WATER&&getBlock(x-stepZ*flank,y,z+stepX*flank)===BLOCK.WATER;
}
function planAquaticBreach(bounds,x,y,z,heading,duration,travel,extent){
  const dx=Math.sin(heading),dz=Math.cos(heading);
  const first=findFishWater(x,z),last=findFishWater(x+dx*travel,z+dz*travel);
  if(!first||!last||Math.abs(first.top-last.top)>.30)return null;
  const start=Math.min(y,QuimiCraftAquatic.breachStart(bounds,first.top));
  const end=QuimiCraftAquatic.breachStart(bounds,last.top);
  const span=Math.max(-bounds.min.z,bounds.max.z),width=Math.max(-bounds.min.x,bounds.max.x);
  const rx=Math.abs(dx)*span+Math.abs(dz)*width,rz=Math.abs(dz)*span+Math.abs(dx)*width;
  for(let i=0;i<=6;i++){
    const t=i/6,nx=x+dx*travel*t,nz=z+dz*travel*t;
    const surface=lerp(first.top,last.top,t);
    if(!aquaticWater(nx,surface-.65,nz,extent,heading))return null;
    const frame=QuimiCraftAquatic.breachPose(t,bounds,surface,start,end);
    if(voxelBodyBlocked(nx-rx,nx+rx,frame.low,frame.high,nz-rz,nz+rz))return null;
  }
  return {x,z,dx,dz,heading,duration,travel,first,last,start,end,time:0,contact:null};
}
function moveAquaticBreach(group,bounds,jump,dt){
  jump.time=Math.min(jump.duration,jump.time+dt);
  const progress=jump.time/jump.duration,surface=lerp(jump.first.top,jump.last.top,progress);
  const frame=QuimiCraftAquatic.breachPose(progress,bounds,surface,jump.start,jump.end);
  group.position.set(jump.x+jump.dx*jump.travel*progress,frame.y,jump.z+jump.dz*jump.travel*progress);
  group.rotation.set(frame.pitch,jump.heading+Math.PI,0);
  const contact=QuimiCraftAquatic.breachContact(jump,frame,surface);
  if(contact){
    const noseX=group.position.x+jump.dx*frame.front,noseZ=group.position.z+jump.dz*frame.front;
    const water=findFishWater(noseX,noseZ);
    const atNose=water&&Math.abs(water.top-surface)<.30;
    const x=atNose?noseX:group.position.x,z=atNose?noseZ:group.position.z;
    const size=clamp((bounds.max.z-bounds.min.z)*.36,.66,3.60);
    aquaticFx.splash(new THREE.Vector3(x,(atNose?water.top:findFishWater(x,z)?.top??surface)+.016,z),size,contact,{x:jump.dx,z:jump.dz});
    const distance=Math.hypot(player.pos.x-x,player.pos.y-surface,player.pos.z-z);
    if(distance<24)sound("splash",(contact==="entry"?1.2:.76)*(1-distance/28));
  }
  return progress>=1;
}
function disposeAquatic(f){
  fishRoot.remove(f.group);
  spectral.dispose(f.group);
  QuimiCraftAquatic.releaseSpray(f);
  f.group.traverse(n=>{
    if(n.geometry&&!n.userData.spectralHalo&&!sharedFishGeometry.has(n.geometry))n.geometry.dispose();
    if(n.isSkinnedMesh)n.skeleton.dispose();
    if(n.userData.ownMarineMaterial)n.material.dispose();
  });
}
function attackableActors(){
  return [...entities.filter(e=>!e.persistent&&e!==riding?.actor),...fishSchool.filter(f=>!f.dead)];
}
function hitAquatic(f,damage,attacker,knock,natural=false){
  flashMobDamage(f);
  mobKnockback(f,attacker,knock);
  f.hp=Math.max(0,f.hp-damage);
  if(!natural){state.combatTarget=f;state.combatTargetTime=2.8}
  combatParticles(f.group.position,0xd3f3ff,f.large&&attacker?.large?14:7);
  if(f.large&&attacker?.large&&f.water&&f.water.top-f.y<4.5){
    aquaticFx.splash(new THREE.Vector3(f.x,f.water.top+.016,f.z),clamp((f.profile.length??5)*.22,1.1,2.8),"entry");
  }
  sound("hit",.42);
  if(f.hp>0){
    if(wildlifeBehavior.hasInkDefense(f.id)&&(f.inkCooldown??0)<=0&&(f.hp<=f.maxHp*.78||!f.profile.counter)){
      f.inkCooldown=9.5;
      combatParticles(f.group.position,0x171326,16,"vapor");
      if(attacker?.aquatic&&(!f.grip?.attack?.lockedGrip||f.hp<=f.maxHp*.40)){
        attacker.inkBlinded=2.8;
        if(f.grip?.predator===attacker)f.grip=null;
      }
    }
    if(natural&&attacker?.aquatic&&attacker.id===f.id&&wildlifeBehavior.sameSpeciesOf(f.id)==="territorial"&&f.hp<=f.maxHp*.60){
      f.clashRest=34;attacker.clashRest=34;
      if(attacker.wildRival===f)attacker.wildRival=null;
      if(f.wildRival===attacker)f.wildRival=null;
    }
    if(!natural)f.alarm=f.profile.attack?.kind==="tail"?5.2:2.8;
    if(f.profile.attack&&(attacker===playerActor||attacker===riding?.actor)&&!labSafe()&&!isCreative()){
      QuimiCraftAI.engage(f,playerActor);
    }
    return;
  }
  f.dead=true;
  f.death={elapsed:0,roll:f.group.rotation.z,pitch:f.group.rotation.x};
  if(f.spectral)spawnDrop("ectoplasm",1,f.group.position.clone());
  if(f.profile.drop&&!natural)spawnDrop(f.profile.drop,1,f.group.position.clone());
}
function aquaticDepth(water,value,profile,clearance=profile?.surfaceClearance??.23,floor=profile?.baseClearance??.43){
  if(profile?.anchored||profile?.benthic)return water.bottom+.10;
  const high=water.top-clearance;
  return clamp(value,Math.min(high,water.bottom+floor),high);
}
const softSeafloor=new Set([BLOCK.SAND,BLOCK.SHELL_SAND,BLOCK.SILICA_SAND,BLOCK.RED_SAND,BLOCK.CLAY,BLOCK.MUD,
  BLOCK.PEAT,BLOCK.DIRT,BLOCK.GRASS,BLOCK.GLACIAL_GRAVEL,BLOCK.GRAVEL,...variantSands]);
const rockySeafloor=new Set([BLOCK.STONE,BLOCK.LIMESTONE,BLOCK.SLATE,BLOCK.FIELDSTONE,BLOCK.BASALT,
  BLOCK.MARBLE,BLOCK.GRANITE,BLOCK.GNEISS,BLOCK.BLACK_SHALE,BLOCK.SANDSTONE].filter(Number.isInteger));
function aquaticSubstrate(profile,x,z,bath){
  if(!profile?.substrate)return true;
  const floor=getBlock(x,bath.bottom-.06,z);
  return (profile.substrate==="rock"?rockySeafloor:softSeafloor).has(floor);
}
function aquaticPlacement(id,x,z,angle,water=findFishWater(x,z)){
  const p=aquaticProfile(id);
  if(!water||water.depth<(p.minDepth??2)||!aquaticSubstrate(p,x,z,water))return null;
  const y=aquaticDepth(water,water.top-water.depth*p.swim,p);
  return aquaticWater(x,y,z,p.extent,angle)?{x,y,z,water}:null;
}
function placeAquatic(id,spot,angle,ghost){
  const f=buildFish(spot.x,spot.y,spot.z,spot.water,id,ghost);
  f.angle=angle;
  f.group.rotation.y=angle+Math.PI;
  return f;
}
function spawnOrcaPod(species,home,angle,lake,zone,slots,largeSlots){
  const profile=aquaticProfile(species),preyId=profile.diet[0],preyProfile=aquaticProfile(preyId);
  const availablePrey=fishSchool.some(f=>f.id===preyId&&!f.dead&&!f.spectral&&QuimiCraftAI.range(f,home)<20);
  const reserve=availablePrey?0:1;
  const count=Math.min(slots-reserve,largeSlots-(preyProfile.small?0:reserve),3);
  if(count<2||fishSchool.some(f=>f.id===species&&!f.dead&&f.pod))return false;
  const habitat=depths.polarZone(lake,zone);
  const findSpot=(id,distance,direction)=>{
    const x=home.x+Math.sin(direction)*distance,z=home.z+Math.cos(direction)*distance;
    if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))return null;
    const local=depths.lakeAt(x,z);
    if(local?.basin.key!==lake.basin.key||depths.polarZone(local,zone)!==habitat||regionalWater(x,z).zone!==zone)return null;
    return aquaticPlacement(id,x,z,angle);
  };
  const formation=[home];
  for(const side of [-1,1]){
    const spot=findSpot(species,3.75,angle+Math.PI+side*.90);
    if(spot&&formation.length<count)formation.push(spot);
  }
  if(formation.length<2)return false;
  let preySpot=null;
  if(!availablePrey){
    for(const offset of [0,.82,-.82,1.65,-1.65,Math.PI]){
      preySpot=findSpot(preyId,10,angle+offset);
      if(preySpot)break;
    }
    if(!preySpot)return false;
    placeAquatic(preyId,preySpot,angle+.28,false);
  }
  const pod={home,rest:2.5,pursuit:0,prey:null,members:[]},ghost=spectral.roll();
  for(const spot of formation){
    const orca=placeAquatic(species,spot,angle,ghost);
    orca.pod=pod;
    pod.members.push(orca);
  }
  return true;
}
function spawnDeepSeaHunt(home,angle,eligible,remaining){
  const preyId=eligible.find(id=>aquaticProfile(id).counter);
  let prey=fishSchool.find(f=>f.id===preyId&&!f.dead&&!f.spectral&&QuimiCraftAI.range(home,f)<22);
  const alreadySpawned=fishSchool.some(f=>f.id===preyId&&!f.dead);
  if(!prey&&!alreadySpawned&&preyId&&remaining>1){
    for(const bearing of [angle,angle+.59,angle-.59,angle+1.15,angle-1.15]){
      const x=home.x+Math.sin(bearing)*12,z=home.z+Math.cos(bearing)*12;
      const spot=aquaticPlacement(preyId,x,z,bearing+Math.PI);
      if(!spot)continue;
      const water=regionalWater(x,z);
      if(!depths.eligible(biomeAt(x,z),depths.lakeAt(x,z),water.id,spot.water.depth,water.zone).includes(preyId))continue;
      prey=placeAquatic(preyId,spot,bearing+Math.PI,false);
      break;
    }
  }
  const hunter=placeAquatic("sperm_whale",home,prey?QuimiCraftAI.heading(home,prey):angle,false);
  if(prey)hunter.wildPrey=prey;
}
function spawnAquatic(largeCount){
  const cap=QuimiCraftMobSpawn.limits[settings.mobs].aquatic,bigCap=Math.ceil(cap*.26);
  const foundations=fishSchool.filter(f=>!f.dead&&(f.profile.anchored||f.stock!==undefined)).length;
  for(let tries=0;tries<30;tries++){
    const angle=Math.random()*TAU,dist=tries<18?6+Math.random()*44:Math.random()*12;
    const x=Math.floor(player.pos.x+Math.cos(angle)*dist)+.5,z=Math.floor(player.pos.z+Math.sin(angle)*dist)+.5;
    if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))continue;
    const water=findFishWater(x,z);
    if(!water||water.depth<2)continue;
    const biome=biomeAt(x,z),lake=depths.lakeAt(x,z),liquid=regionalWater(x,z),pool=depths.eligible(biome,lake,liquid.id,water.depth,liquid.zone);
    const allowed=pool.filter(id=>{
      const p=aquaticProfile(id),marine=QuimiCraftMarineLife.profiles[id];
      if((!p.small&&largeCount>=bigCap)||!aquaticSubstrate(p,x,z,water))return false;
      if(!marine)return true;
      const foundation=p.anchored||p.stock!==undefined;
      return (!foundation||foundations<Math.ceil(cap*.50))&&
        !fishSchool.some(actor=>!actor.dead&&actor.id===id&&QuimiCraftAI.range(actor,{x,z})<(p.solo?9:foundation?2.8:2));
    });
    const localStock=allowed.filter(id=>aquaticProfile(id).stock!==undefined);
    const choices=localStock.length&&foundations<cap*.30&&Math.random()<.72?localStock:allowed;
    const toHunt=allowed.includes("sperm_whale")&&!fishSchool.some(f=>f.id==="sperm_whale"&&!f.dead)&&
      Math.min(cap-fishSchool.length,bigCap-largeCount)>1&&Math.random()<.42;
    const species=toHunt?"sperm_whale":choices.length&&(Math.random()<.74||largeCount===0)?choices[Math.floor(Math.random()*choices.length)]:null;
    const profile=species?aquaticProfile(species):null;
    if(profile&&aquaticHostile(profile)&&!canSpawnHostile({x,z}))continue;
    const quota=profile?.group?profile.group[1]*2:profile?.stock!==undefined?5:(profile?.mode==="whale"||profile?.deepSea)?1:species==="piranha"?5:3;
    if(species&&fishSchool.filter(f=>f.id===species&&!f.dead).length>=quota)continue;
    const y=aquaticDepth(water,water.top-water.depth*(profile?.swim??(.20+Math.random()*.59)),profile);
    if(!aquaticWater(x,y,z,profile?.extent??.22,angle))continue;
    if(profile?.mode==="pod"){
      if(spawnOrcaPod(species,{x,y,z,water},angle,lake,liquid.zone,cap-fishSchool.length,bigCap-largeCount))return;
      continue;
    }
    if(species==="sperm_whale"||(species==="giant_squid"||species==="colossal_squid")&&allowed.includes("sperm_whale")&&
      !fishSchool.some(f=>f.id==="sperm_whale"&&!f.dead)&&Math.min(cap-fishSchool.length,bigCap-largeCount)>1&&Math.random()<.45){
      spawnDeepSeaHunt({x,y,z,water},angle,pool,Math.min(cap-fishSchool.length,bigCap-largeCount));
      return;
    }
    const creature=placeAquatic(species,{x,y,z,water},angle,QuimiCraftMarineLife.profiles[species]||profile?.scientific&&liquid.zone?false:undefined);
    if((!species&&creature.id!=="raw_shrimp")||profile?.mode==="school"){
      const [minimum,maximum]=profile?.group??[2,4];
      const companions=minimum-1+Math.floor(Math.random()*(maximum-minimum+1));
      const school={members:[creature]};
      creature.school=school;
      for(let i=0;i<companions&&fishSchool.length<cap;i++){
        const bearing=angle+(i+1)*2.399,r=.7+i*.33,px=x+Math.cos(bearing)*r,pz=z+Math.sin(bearing)*r;
        const bath=findFishWater(px,pz),py=y+(Math.random()-.5)*.48;
        if(bath?.depth>=(creature.profile.minDepth??2)&&aquaticWater(px,py,pz,creature.profile.extent,angle)){
          if(QuimiCraftMarineLife.profiles[creature.id]){
            const local=regionalWater(px,pz);
            if(!QuimiCraftMarineLife.eligible(biomeAt(px,pz),depths.lakeAt(px,pz),local.id,bath.depth,local.zone).includes(creature.id))continue;
          }
          if(creature.large&&largeCount+school.members.length>=bigCap)break;
          const fish=placeAquatic(creature.id,{x:px,y:py,z:pz,water:bath},angle+(Math.random()-.5)*.41,creature.spectral);
          fish.school=school;
          school.members.push(fish);
        }
      }
    }
    return;
  }
}
function updateAquaticDeath(f,dt,motion){
  const {group,death}=f;
  death.elapsed+=dt;
  const time=clamp(death.elapsed/(f.swimStyle==="pulse"?1.60:1.25),0,1);
  const ease=time*time*(3-2*time),side=f.phase%2<1?1:-1;
  const fall=group.position.y-dt*(.11+ease*.72);
  if(getBlock(group.position.x,fall,group.position.z)===BLOCK.WATER)group.position.y=fall;
  group.rotation.z=lerp(death.roll,side*(f.swimStyle==="pulse"?.57:1.68)*motion,ease);
  group.rotation.x=lerp(death.pitch,.56*motion,ease);
  f.phase+=dt*(4+time*11)*(1-time);
  QuimiCraftAquatic.pose(f,f.phase,.65*motion,null,time);
  return time>=1;
}
let aquaticEcologyClock=0;
function aquaticLineOfSight(a,b){
  return Math.abs(a.y-b.y)<(a.large||b.large?11:6)&&combatSegmentClear(a.group.position,b.group.position);
}
function breathingLead(f){
  for(const radius of [0,2.5,5,8]){
    for(let i=0;i<(radius?8:1);i++){
      const angle=f.angle+i*TAU/8,x=f.x+Math.sin(angle)*radius,z=f.z+Math.cos(angle)*radius;
      if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))continue;
      const bath=findFishWater(x,z);
      if(!bath||bath.depth<(f.profile.minDepth??2)||getBlock(x,Math.ceil(bath.top),z)!==BLOCK.AIR||
        getBlock(x,WATER_LEVEL,z)===BLOCK.ICE)continue;
      return {x,y:bath.top-.43,z};
    }
  }
  return null;
}
function orcaHuntWave(f,prey,now){
  const pod=f.pod;
  if(f.id!=="orca_b"||!pod||now<(pod.waveAt??0)||prey.water.top-prey.y>1.2||
    !pod.members.some(other=>other!==f&&!other.dead&&QuimiCraftAI.range(other,prey)<5))return;
  for(let i=0;i<8;i++){
    const angle=i*TAU/8,dx=Math.sin(angle),dz=Math.cos(angle);
    if(getBlock(prey.x+dx*2.4,WATER_LEVEL,prey.z+dz*2.4)!==BLOCK.ICE)continue;
    pod.waveAt=now+9000;
    prey.vx=(prey.vx??0)-dx*2.6;
    prey.vz=(prey.vz??0)-dz*2.6;
    aquaticFx.splash(new THREE.Vector3(prey.x,prey.water.top+.016,prey.z),1.6,"entry");
    break;
  }
}
function shoreRestSite(f){
  for(const distance of [1.9,3.1,4.6]){
    for(let i=0;i<8;i++){
      const angle=f.angle+i*TAU/8,dx=Math.sin(angle),dz=Math.cos(angle);
      const x=Math.floor(f.x+dx*distance)+.5,z=Math.floor(f.z+dz*distance)+.5;
      const ice=getBlock(x,WATER_LEVEL,z)===BLOCK.ICE;
      const floor=ice?WATER_LEVEL:terrainHeight(x,z);
      if(f.profile.shore==="ice"&&!ice&&!rockySeafloor.has(getBlock(x,floor,z)))continue;
      if(floor<WATER_LEVEL-1||floor>WATER_LEVEL+1||!solidAt(x,floor,z)||
        getBlock(x,floor+1,z)!==BLOCK.AIR||getBlock(x,floor+2,z)!==BLOCK.AIR)continue;
      const wx=x-dx*1.28,wz=z-dz*1.28,bath=findFishWater(wx,wz);
      if(!bath||getBlock(wx,Math.ceil(bath.top),wz)!==BLOCK.AIR||Math.abs(bath.top-(floor+1))>1.2)continue;
      const height=f.id==="adelie_penguin"?.37:.14;
      return {shore:{x,y:floor+1+height,z},entry:{x:wx,y:bath.top-.35,z:wz},bath,angle,ttl:9};
    }
  }
  return null;
}
function updateShoreRest(f,dt,motion){
  const rest=f.haulout,g=f.group,upright=f.id==="adelie_penguin",hold=upright?4.1:6.0;
  rest.time+=dt;
  const entry=rest.time<.70,exit=rest.time>.70+hold;
  const t=entry?rest.time/.70:exit?clamp((rest.time-.70-hold)/.70,0,1):1;
  const from=exit?rest.shore:rest.entry,to=exit?rest.entry:rest.shore;
  const blend=smooth(t);
  g.position.set(lerp(from.x,to.x,blend),lerp(from.y,to.y,blend)+(entry||exit?Math.sin(t*Math.PI)*.50:0),lerp(from.z,to.z,blend));
  if(upright)g.rotation.x=(exit?1-blend:blend)*Math.PI/2;
  else g.rotation.x=0;
  g.rotation.y=rest.angle+Math.PI+(exit?Math.PI:0);
  f.ashore=!entry&&!exit;
  f.phase+=dt*(f.ashore?1.1:4.8);
  QuimiCraftAquatic.pose(f,f.phase,(f.ashore?.26:.92)*motion);
  if(exit&&t===1){
    f.haulout=null;f.ashore=false;f.water=rest.bath;f.angle=rest.angle+Math.PI;
    f.baseY=aquaticDepth(rest.bath,rest.bath.top-rest.bath.depth*f.profile.swim,f.profile);
    f.shoreAt=19+Math.random()*17;
  }
}
function updateFish(dt,now){
  fishSpawnClock+=dt;
  if(fishSpawnClock>.85&&fishSchool.length<QuimiCraftMobSpawn.limits[settings.mobs].aquatic){
    fishSpawnClock=0;
    spawnAquatic(fishSchool.filter(f=>f.large&&!f.dead).length);
  }
  aquaticEcologyClock+=dt;
  if(aquaticEcologyClock>=.32){
    const solar=clamp(Math.sin(state.day*TAU)*1.65,0,1),weather=currentWeather();
    wildlifeBehavior.refreshAquatic(fishSchool,aquaticLineOfSight,aquaticEcologyClock,f=>{
      const depth=Math.max(0,f.water.top-f.y);
      const ice=getBlock(f.x,WATER_LEVEL,f.z)===BLOCK.ICE;
      return {light:solar*Math.exp(-depth*.21)*(ice?.38:1),weather,day:state.day};
    });
    aquaticEcologyClock=0;
  }
  const motion=document.documentElement.classList.contains("reduced-motion")?.58:1;
  const target=new THREE.Vector3(player.pos.x,player.pos.y+.58,player.pos.z);
  for(let i=fishSchool.length-1;i>=0;i--){
    const f=fishSchool[i],g=f.group,p=f.profile,attack=p.attack;
    const dx=target.x-f.x,dz=target.z-f.z,distance=Math.hypot(dx,dz);
    const unload=distance>76||!hasChunk(Math.floor(f.x/CHUNK),Math.floor(f.z/CHUNK))||
      p.anchored&&(getBlock(f.x,f.y,f.z)!==BLOCK.WATER||!aquaticSubstrate(p,f.x,f.z,f.water));
    if(unload||f.dead&&updateAquaticDeath(f,dt,motion)){
      f.dead=true;clearCreatureStone(f);creatureAfflictions.delete(f);restoreMobColor(f);disposeAquatic(f);fishSchool.splice(i,1);
      continue;
    }
    if(!f.dead&&f.breaching){
      f.phase+=dt*5;
      QuimiCraftAquatic.pose(f,f.phase,.52*motion);
      if(moveAquaticBreach(g,f.breachBounds,f.breaching,dt)){
        f.water=f.breaching.last;
        f.baseY=aquaticDepth(f.water,f.water.top-f.water.depth*p.swim,p);
        f.breaching=null;
        f.surfaceAt=15+Math.random()*16;
      }
      continue;
    }
    if(Math.hypot(f.vx||0,f.vz||0)>.02){
      const x=f.x+f.vx*dt,z=f.z+f.vz*dt;
      if(aquaticWater(x,f.y-(f.surfaceLift??0),z,p.extent,f.angle)){g.position.x=x;g.position.z=z}
      const decay=Math.pow(.004,dt);
      f.vx*=decay;f.vz*=decay;
    }
    if(f.dead)continue;
    if(stepCreatureStun(f,dt))continue;
    if(f.haulout){updateShoreRest(f,dt,motion);continue}
    f.alarm=Math.max(0,f.alarm-dt);
    f.frostTime=Math.max(0,(f.frostTime||0)-dt);
    const heightGap=Math.abs(target.y-f.y),inside=player.inWater&&heightGap<2.55;
    const totalGap=Math.hypot(distance,heightGap);
    if(f.ai.engagement&&!QuimiCraftAI.canPursue(f,combatTargetAvailable)){
      QuimiCraftAI.disengage(f);
      f.strike=null;
    }
    const returning=QuimiCraftAI.returnGoal(f);
    const canDetect=attack&&inside&&distance<attack.notice*1.25&&aquaticHostile(p);
    const seen=player.inWater&&(f.ai.engagement||canDetect)&&combatSegmentClear(g.position,target);
    if(!f.ai.engagement&&!returning&&canDetect&&seen&&combatTargetAvailable(playerActor)){
      QuimiCraftAI.engage(f,playerActor);
    }
    const combat=f.ai.engagement;
    if(combat){
      if(seen){
        combat.lastSeen={x:target.x,y:target.y,z:target.z};
        combat.searching=false;
      }else if(QuimiCraftAI.range(f,combat.lastSeen)<.75&&Math.abs(f.y-combat.lastSeen.y)<1){
        combat.searching=true;
      }
    }
    const rearAttack=combat&&attack.kind==="tail"&&seen&&totalGap<=attack.range+.36;
    const chaseGoal=combat&&(seen||player.inWater&&combat.searching?target:combat.lastSeen);
    f.surfaceAt-=dt;
    const wild=!combat&&!returning&&!(p.dives&&f.surfaceAt<-14)?wildlifeBehavior.aquaticIntent(f):null;
    const free=!combat&&!returning&&(!wild||wild.mode==="school");
    f.shoreAt-=dt;
    if(!free)f.shorePlan=null;
    if(f.shorePlan&&(f.shorePlan.ttl-=dt)<=0){f.shorePlan=null;f.shoreAt=5}
    if(free&&!f.shorePlan&&f.shoreAt<0){
      f.shorePlan=shoreRestSite(f);
      if(!f.shorePlan)f.shoreAt=5;
    }
    const shoreGoal=f.shorePlan?.entry;
    if(shoreGoal&&QuimiCraftAI.range(f,shoreGoal)<.45&&Math.abs(f.y-shoreGoal.y)<.36){
      f.haulout={...f.shorePlan,time:0};f.shorePlan=null;
      f.surfaceAt=17;f.surfaceAction=null;f.surfaceLift=0;
      continue;
    }
    const surfacing=f.surfaceAt<0&&free&&!shoreGoal;
    if(surfacing&&!f.breathGoal){
      f.breathGoal=breathingLead(f);
      if(!f.breathGoal)f.surfaceAt=3;
    }
    if(!surfacing)f.breathGoal=null;
    const waterGoal=surfacing?f.breathGoal:null;
    const destination=returning||chaseGoal||shoreGoal||waterGoal||wild?.goal;
    const pursuing=!!chaseGoal&&!rearAttack&&(seen||QuimiCraftAI.range(f,chaseGoal)>.65||Math.abs(f.y-chaseGoal.y)>.85);
    const fleeing=inside&&(f.alarm>0&&!attack||!f.large&&distance<2.45)&&wild?.mode!=="flee";
    const heading=destination?QuimiCraftAI.heading(f,destination):Math.atan2(dx,dz);
    const previous=f.angle;
    f.timer-=dt;
    if(f.timer<=0){
      f.timer=1.2+Math.random()*2.5;
      f.angle+=(Math.random()-.5)*(p.mode==="pod"?.65:1.37);
      const bath=findFishWater(f.x,f.z);
      if(bath&&bath.depth>=(p.minDepth??1)){
        f.water=bath;
        f.baseY=aquaticDepth(bath,bath.top-bath.depth*p.swim,p);
      }
    }
    const prey=wild?.prey,activeAttack=wild?.attack??attack,strikeTarget=combat?.target??prey;
    const wildTailCounter=wild?.mode==="counter"&&activeAttack?.kind==="tail"&&prey&&Math.hypot(f.x-prey.x,f.y-prey.y,f.z-prey.z)<=activeAttack.range+.6;
    if(rearAttack||wildTailCounter)f.angle=turnToward(f.angle,heading+Math.PI,dt*5);
    else if(pursuing||returning)f.angle=turnToward(f.angle,heading,dt*(f.id==="piranha"?6.3:4.15));
    else if(fleeing)f.angle=turnToward(f.angle,Math.atan2(dx,dz)+Math.PI,dt*4.3);
    else if(destination)f.angle=turnToward(f.angle,heading,dt*(wild?.mode==="hunt"||wild?.mode==="counter"?4.9:3.6));
    else if(inside&&distance>3&&distance<9&&p.mode==="curious")f.angle=turnToward(f.angle,heading,dt*.46);
    if(f.strikeTarget!==strikeTarget){f.strike=null;f.strikeTarget=strikeTarget}
    const preyGap=prey?Math.hypot(f.x-prey.x,f.y-prey.y,f.z-prey.z):Infinity;
    const wildAimDir=activeAttack?.kind==="tail"?f.angle+Math.PI:f.angle;
    const preyFacing=prey?Math.cos(wildAimDir-QuimiCraftAI.heading(f,prey)):-1;
    const wildStrike=!!prey&&preyFacing>.25&&preyGap<activeAttack.range&&aquaticLineOfSight(f,prey);
    const approach=activeAttack?.kind==="bite"?.40:.13;
    const pose=QuimiCraftAquatic.stepStrike(f,dt,wildStrike||!!combat&&seen&&totalGap<activeAttack.range+approach,activeAttack);
    f.ai.mode=pose?.stage??(returning?"evade":combat?(seen?"chase":"search"):fleeing?"flee":shoreGoal?"haulout":waterGoal?"breathe":wild?.mode??"idle");
    const stroke=p.mode==="drift"?.65+.35*Math.max(0,Math.sin(f.phase)):1;
    const lunge=activeAttack?.kind==="bite"?(pose?.stage==="windup"?(prey?.85:.33):1+(pose?.burst??0)*(prey?1.15:1.67)):1;
    const bracing=activeAttack?.kind!=="bite"&&activeAttack?.kind!=="grasp"&&pose&&pose.stage!=="recover";
    const pace=f.speed*stroke*lunge*(bracing?.16:pursuing?1.54:returning?1.26:fleeing?1.35:wild?.speed??1)*(f.frostTime>0?.52:1);
    const facingOff=wild?.mode==="counter"||wild?.mode==="hunt"&&p.dives&&prey?.profile.counter;
    const approachLimit=facingOff?activeAttack.range*.81:.15;
    const travel=destination&&!fleeing?Math.min(pace*dt,Math.max(0,QuimiCraftAI.range(f,destination)-approachLimit)):pace*dt;
    const current=p.current&&!destination?waterCurrentAt(f.x,f.z,f.y):null;
    const nx=f.x+Math.sin(f.angle)*travel+(current?.x??0)*(p.current??0)*dt,nz=f.z+Math.cos(f.angle)*travel+(current?.z??0)*(p.current??0)*dt;
    const atLead=surfacing&&waterGoal&&QuimiCraftAI.range(f,waterGoal)<.58;
    const wantsJump=atLead&&!f.surfaceAction&&f.breachBounds&&f.surfacings%(p.breachEvery??(f.id==="dolphin"?2:3))===1;
    const bob=p.mode==="curious"?.49:p.mode==="bottom"?.11:.22;
    const nearSurface=atLead||!!f.surfaceAction;
    const readyY=wantsJump?QuimiCraftAquatic.breachStart(f.breachBounds,f.water.top):
      f.water.top-Math.max(.42,(f.spouts?.[0]?.[1]??0)*g.scale.y-.035);
    const bath=f.shorePlan?.bath??f.water;
    const ty=aquaticDepth(bath,nearSurface?readyY:destination?destination.y:f.baseY+Math.sin(now*.0018+f.phase*.13)*bob,
      p,nearSurface||shoreGoal?.35:f.surfaceClearance,f.floorClearance);
    const previousLift=f.surfaceLift??0;
    const ny=lerp(f.y-previousLift,ty,Math.min(1,dt*2.4));
    const clear=aquaticWater(nx,ny,nz,p.extent,f.angle);
    if(clear)g.position.set(nx,ny,nz);
    else{
      g.position.y-=previousLift;
      f.angle+=Math.PI*.61;
      f.timer=.13;
    }
    if(surfacing&&!f.surfaceAction&&(atLead&&f.y>=readyY-.07||f.surfaceAt<-7)){
      if(atLead&&clear&&f.y>=readyY-.07&&distance<36){
        f.surfacings++;
        if(wantsJump){
          const duration=p.mode==="whale"?1.48+p.extent*.17:p.mode==="pod"?1.52:1.34;
          f.breaching=planAquaticBreach(f.breachBounds,f.x,f.y,f.z,f.angle,duration,f.speed*duration,p.extent);
          if(f.breaching){
            moveAquaticBreach(g,f.breachBounds,f.breaching,0);
            f.breathGoal=null;
            continue;
          }
        }
        const top=Math.ceil(f.water.top);
        if(getBlock(f.x,top,f.z)===BLOCK.AIR){
          f.surfaceAction={time:0,duration:1.04};
          if(distance<14)sound("splash",.62);
        }else f.surfaceAt=13+Math.random()*15;
      }else f.surfaceAt=13+Math.random()*15;
      if(!f.surfaceAction)f.breathGoal=null;
    }
    const display=f.surfaceAction;
    const blowhole=f.spouts?.[0]?.[1]??f.breathHeight;
    f.surfaceLift=display&&blowhole!=null?Math.max(0,f.water.top-ny-blowhole*g.scale.y+.035)*Math.min(1,display.time*9,Math.max(0,(display.duration-display.time)*9)):0;
    g.position.y+=f.surfaceLift;
    const armsForward=(f.swimStyle==="octopus"||f.swimStyle==="squid")&&preyGap<Math.max(3.5,(activeAttack?.range??0)+1.4);
    g.rotation.y=turnToward(g.rotation.y,f.angle+(armsForward?0:Math.PI),dt*4);
    const pitch=wild?.verticalRest?.90:p.dives?clamp((ty-f.y)*.26,-.70,.61):clamp((f.y-ty)*.27,-.32,.32);
    g.rotation.x=lerp(g.rotation.x,pitch*motion,Math.min(1,dt*3.2));
    const turn=Math.atan2(Math.sin(f.angle-previous),Math.cos(f.angle-previous));
    g.rotation.z=lerp(g.rotation.z,clamp(-turn*1.42,-.27,.27)*motion,Math.min(1,dt*4.7));
    f.phase+=dt*(p.mode==="drift"?4.5:3.5+pace*3.2);
    const swimPose=pose&&activeAttack?.lockedGrip?{...pose,burst:Math.min(1,pose.burst*1.28)}:pose;
    QuimiCraftAquatic.pose(f,f.phase,clamp(.47+pace*.35,.42,1.6)*motion,swimPose);
    if(f.stockVisual){
      const stockScale=clamp(f.stock/p.stock,.13,1);
      f.stockVisual.scale.setScalar(.50+.50*stockScale);
    }
    if(display){
      QuimiCraftAquatic.spray(THREE,f,settings.particles?display.time:-1,f.spectral);
      display.time+=dt;
      if(display.time>=display.duration){
        f.surfaceAction=null;f.breathGoal=null;f.surfaceAt=15+Math.random()*16;
        QuimiCraftAquatic.spray(THREE,f,-1);
      }
    }
    if(f.id==="pufferfish")g.scale.setScalar(lerp(g.scale.x,pose?.stage==="windup"||pose?.stage==="strike"?1.48:1,dt*6));
    if(pose?.hit&&prey&&!prey.dead&&preyFacing>.05&&
      Math.hypot(f.x-prey.x,f.y-prey.y,f.z-prey.z)<=activeAttack.range+.30&&aquaticLineOfSight(f,prey)){
      if(wildlifeBehavior.consumeStock(f,prey,4)){
        f.wildPrey=null;f.feedRest=8;
        continue;
      }
      hitAquatic(prey,activeAttack.damage??p.damage??7,f,null,true);
      if(!prey.dead)orcaHuntWave(f,prey,now);
      wildlifeBehavior.finishAquaticHunt(f,prey);
    }
    const biteDirection=attack?.kind==="tail"?f.angle+Math.PI:f.angle;
    const facing=Math.cos(biteDirection-Math.atan2(target.x-f.x,target.z-f.z));
    if(pose?.hit&&combat&&player.inWater&&(attack.kind==="sting"||facing>.25)&&
      Math.hypot(target.x-f.x,target.y-f.y,target.z-f.z)<=attack.range&&combatSegmentClear(g.position,target)){
      damagePlayer(p.damage,f.name,attack.venom||attack.kind==="sting"?"toxicity":"",spectral.markAttack(f,attack));
      sound("splash",.40);
    }
  }
}
function visibleActor(a,b){
  return Math.abs(a.y-b.y)<(DRAGONS[a.type]||DRAGONS[b.type]?8.5:5.2)&&combatSegmentClear(entityAimPoint(a),entityAimPoint(b));
}
function nearbyActor(origin,candidates,maxDistance,filter){
  let winner=null,dist=maxDistance;
  for(const candidate of candidates){
    const distance=QuimiCraftAI.range(origin,candidate);
    if(distance>=dist||!filter(candidate)||!visibleActor(origin,candidate))continue;
    winner=candidate;dist=distance;
  }
  return winner ? {actor:winner,dist,visible:true} : null;
}
function combatTargetAvailable(target){
  if(target===playerActor)return !labSafe()&&!isCreative();
  return target.group?.parent===(target.aquatic?fishRoot:entityRoot);
}
function senseEntity(e,tracked){
  const p=e.profile;
  const liveThreat=target=>target!==e&&!target.dead&&target.hostile;
  if(e.feedingPause>0||e.bonded&&!e.hostile)return {};
  if(tracked)return {enemy:{actor:tracked,visible:visibleActor(e,tracked)&&alchemyPlay.distantSight(e,tracked)}};
  const notice=QuimiCraftAI.detectionRange(p);
  if(e.persistent){
    const greet=QuimiCraftAI.range(e,playerActor)<2.75&&visibleActor(e,playerActor)?playerActor:null;
    if(p.temperament==="guard"){
      return {enemy:nearbyActor(e,entities,notice,liveThreat),greet};
    }
    const threat=nearbyActor(e,entities,p.sense,liveThreat);
    return {threat:threat?{...threat,alarming:true}:null,greet};
  }
  if(e.hostile||p.temperament==="hostile"){
    const seen=nearbyActor(e,[playerActor],notice,target=>!target.dead&&!labSafe()&&!isCreative()&&alchemyPlay.distantSight(e,target));
    const resident=p.temperament==="neutral"?null:nearbyActor(e,npcs,notice*.72,target=>!target.dead&&!target.ai.recovering&&target.role!=="carbon"&&target.role!=="child"&&alchemyPlay.distantSight(e,target));
    return {enemy:resident&&(!seen||resident.dist+1.3<seen.dist)?resident:seen};
  }
  const wild=e.spectral||e.bonded?null:landPrey(e,notice);
  const hunter=wildlifeBehavior.landPreyTypes.has(e.type)&&!e.spectral?
    nearbyActor(e,entities,p.sense,target=>wildlifeBehavior.canHuntLand(target,e)&&!target.feedRest&&!inVillage(target.x,target.z,2)):null;
  if(hunter)return {threat:{...hunter,alarming:true}};
  if(p.temperament==="skittish"||p.temperament==="calm"){
    const close=p.temperament==="calm"?Math.min(p.sense,player.sprint?3:1.3):p.sense*(player.crouch?.33:1);
    const lured=!player.sprint&&QuimiCraftBreeding.diet(e)?.items.includes(selectedItem());
    const nearbyPlayer=lured?null:nearbyActor(e,[playerActor],close,target=>!target.dead);
    const predator=nearbyActor(e,entities,p.sense*.75,liveThreat);
    const threat=predator&&(!nearbyPlayer||predator.dist<nearbyPlayer.dist)?predator:nearbyPlayer;
    return {enemy:wild,threat:threat?{...threat,alarming:threat.actor!==playerActor||player.sprint}:null};
  }
  return {enemy:wild};
}
function landPrey(e,notice){
  if(!e.profile.strike||inVillage(e.x,e.z,2)||wildlifeBehavior.isSleeping(e.type,state.day))return null;
  const prey=target=>wildlifeBehavior.canHuntLand(e,target)&&!inVillage(target.x,target.z,2);
  if(wildlifeBehavior.landDiets[e.type]&&e.feedRest<=0){
    if(e.type==="wolf"||e.type==="lion"){
      const packmate=nearbyActor(e,e.naturalGroup?.members??entities,11,target=>target!==e&&!target.dead&&!target.spectral&&target.type===e.type&&
        target.ai.engagement?.target&&prey(target.ai.engagement.target))?.actor;
      const quarry=packmate?.ai.engagement?.target;
      if(quarry&&QuimiCraftAI.range(e,quarry)<notice*1.35&&visibleActor(e,quarry)){
        return {actor:quarry,visible:true,dist:QuimiCraftAI.range(e,quarry)};
      }
    }
    const pool=e.type==="polar_bear"?fishSchool:e.type==="jaguar"?[...entities,...fishSchool]:entities;
    const found=nearbyActor(e,pool,notice,prey);
    if(found)return found;
  }
  if((e.clashRest??0)<=0){
    const rival=nearbyActor(e,entities,Math.min(9.5,notice),target=>wildlifeBehavior.canRivalLand(e,target)&&!inVillage(target.x,target.z,2));
    if(rival)return rival;
    const same=nearbyActor(e,entities,5.5,target=>wildlifeBehavior.canClashSameLand(e,target)&&!inVillage(target.x,target.z,2));
    if(same)return same;
  }
  return null;
}
function naturalLandBehavior(e,behavior,dt){
  const {grazers,herds,groundForagers,canHuntLand}=wildlifeBehavior;
  if(e.persistent||e.spectral||e.bonded||e.feedingPause>0||e.courtship)return behavior;
  const prey=e.ai.engagement?.target;
  if(behavior.mode==="chase"&&(e.type==="wolf"||e.type==="lion")&&prey&&canHuntLand(e,prey)&&QuimiCraftAI.range(e,prey)>3.5){
    const partner=(e.naturalGroup?.members??entities).find(other=>other!==e&&!other.dead&&other.type===e.type&&other.ai.engagement?.target===prey);
    if(partner&&partner.phase<e.phase){
      const side=Math.sin(e.phase)>0?1:-1,angle=prey.angle;
      return {...behavior,goal:{x:prey.x+Math.cos(angle)*side*2.1,y:prey.y,z:prey.z-Math.sin(angle)*side*2.1}};
    }
  }
  if(behavior.mode!=="idle"&&behavior.mode!=="wander")return behavior;
  if(wildlifeBehavior.isSleeping(e.type,state.day,e))return {mode:"sleep",speed:0};
  if(e.feedRest>14)return {mode:"rest",speed:0};
  const family=e.naturalGroup?.members.find(other=>!other.dead&&!other.ai.fear&&!other.ai.engagement);
  if(family&&family!==e&&QuimiCraftAI.range(e,family)>3.4&&QuimiCraftAI.range(e,e.naturalGroup.home)<e.profile.roam+8){
    return {mode:"follow",goal:family,speed:e.profile.walk*1.14};
  }
  if(herds.has(e.type)&&QuimiCraftAI.range(e,e.ai.home)<e.profile.roam*.9){
    const herd=nearbyActor(e,entities,10,other=>other!==e&&!other.dead&&!other.spectral&&other.type===e.type&&
      !other.ai.fear&&other.phase<e.phase&&QuimiCraftAI.range(e.ai.home,other)<e.profile.roam);
    if(herd?.dist>4.3)return {mode:"follow",goal:herd.actor,speed:e.profile.walk*1.1};
  }
  if(!e.onGround||!grazers.has(e.type)&&!groundForagers.has(e.type))return behavior;
  e.forageClock=(e.forageClock??4+e.phase)-dt;
  if(e.forageClock<-2.4)e.forageClock=5+Math.random()*6;
  if(e.forageClock>0)return behavior;
  const ground=getBlock(e.x,e.y-.12,e.z);
  const leaves=e.type==="deer"||e.type==="forest_deer"||e.type==="cacao_tapir";
  const food=leaves?[BLOCK.GRASS,BLOCK.MOSS,BLOCK.ROOTED_DIRT,BLOCK.DIRT,BLOCK.PODZOL].includes(ground):
    grazers.has(e.type)?ecology.fertile.has(ground)||ground===BLOCK.MOSS:
    ecology.fertile.has(ground)||ground===BLOCK.SAND||ground===BLOCK.DRY_LEAVES||ground===BLOCK.MUD;
  return food?{mode:"forage",speed:0}:behavior;
}
const NPC_SUPPLIES={ranger:["arrow",4],shop_food:["bread",1],shop_armor:[BLOCK.IRON,1],shop_liquid:["water",1],
  shop_solid:[BLOCK.LIMESTONE,1],shop_trinket:["gold_nugget",1],miner:[BLOCK.COAL,1],botanist:["berries",2],
  geologist:[BLOCK.SLATE,1],fisher:["raw_fish",1],baker:["bread",2]};
function offerRescueReward(enemy){
  const npc=enemy.lastVictim;
  const now=performance.now();
  if(!npc||npc.ai.recovering||QuimiCraftAI.range(npc,playerActor)>12||now-enemy.lastInjury>12000||now<(npc.rewardReadyAt||0))return;
  const [id,count]=NPC_SUPPLIES[npc.role]||["bread",1];
  npc.rewardReadyAt=now+75000;
  spawnDrop(id,count,new THREE.Vector3(npc.x,npc.y+.24,npc.z));
  chatMessage(npc.name,"Valeu pela ajuda. Deixei um suprimento para você.");
}
function hitNPC(npc,damage,source){
  if(!npc.persistent||npc.role==="child"||npc.ai.recovering>0)return;
  source.lastVictim=npc;
  source.lastInjury=performance.now();
  npc.hp=Math.max(0,npc.hp-damage);
  flashMobDamage(npc);
  mobKnockback(npc,source);
  combatParticles(entityAimPoint(npc),0xffc590,4);
  if(npc.hp<=0){
    Object.assign(npc.ai,{recovering:9,mode:"down",swing:null,fear:0,route:[],pace:0});
    return;
  }
  if(npc.profile.temperament!=="guard"){
    npc.ai.fear=3.8;
    npc.ai.panic={x:source.x,y:source.y,z:source.z};
  }
}
function finishEntityStrike(e,target){
  if(!e.profile.strike||e.ai.engagement?.target!==target||!QuimiCraftAI.canPursue(e,combatTargetAvailable))return;
  const strike=spectral.markAttack(e,e.profile.strike);
  const start=strike.dragon?e.rig.nose.getWorldPosition(new THREE.Vector3()):entityAimPoint(e),finish=entityAimPoint(target);
  const planar=QuimiCraftAI.range(e,target);
  if(!visibleActor(e,target)||planar>strike.range*(strike.kind==="shot"?1.18:1.26))return;
  if(strike.kind==="gaze")return finishMedusaGaze(e,target);
  if(strike.kind==="shot"){
    if(strike.dragon){
      const direction=QuimiCraftDragons.shotDirection(THREE,start,finish,strike);
      if(direction.dot(new THREE.Vector3(Math.sin(e.angle),0,Math.cos(e.angle)))<.24)return;
      launchDragonBreath("enemy",e,start,direction,strike,target);
      return;
    }
    const direction=finish.sub(start);
    if(e.persistent)direction.y+=planar*.065;
    direction.normalize();
    launchProjectile(e.persistent?"guard":"enemy",start.addScaledVector(direction,.34),direction,strike,e);
    sound(e.persistent?"bow":"magic",.54);
    return;
  }
  if(Math.abs(start.y-finish.y)>(strike.vertical??1.75))return;
  if(strike.kind==="lunge")requestEntityJump(e,true);
  const direction=finish.clone().sub(start).setY(0).normalize();
  if(strike.kind==="lunge"){e.vx+=direction.x*2.75;e.vz+=direction.z*2.75}
  if(strike.kind==="slam")combatParticles(new THREE.Vector3(e.x,e.y+.08,e.z),0xf5ab75,13);
  if(target===playerActor){
    damagePlayer(strike.damage,e.name,strike.effect,strike);
    player.vel.addScaledVector(direction,strike.kind==="slam"?4.6:2.25);
  }else if(target.persistent)hitNPC(target,strike.damage,e);
  else if((wildlifeBehavior.canHuntLand(e,target)||wildlifeBehavior.canRivalLand(e,target)||
    wildlifeBehavior.canClashSameLand(e,target)||wildlifeBehavior.retaliates(e.type)&&target.ai?.engagement?.target===e)&&
    !inVillage(target.x,target.z,2)&&hitEntity(target,strike.damage,"caça natural",direction,e,strike)&&target.dead){
    if(wildlifeBehavior.canHuntLand(e,target))e.feedRest=28;
    else e.clashRest=28;
  }
  sound("land",strike.kind==="slam"?.61:.31);
}
function usableMirror(){
  const shield=equipmentDefinition("offhand");
  return !!shield?.mirrorGuard&&!scienceSystem?.equipmentCondition(equipped.offhand.id)?.broken;
}
function warnMedusaGaze(e){
  if(e.profile.strike?.kind!=="gaze")return;
  const aimedAtPlayer=e.ai.swing?.target===playerActor;
  if(aimedAtPlayer&&!e.gazeWarning){
    toast(e.name+" · Olhar petrificante!");
    sound("magic",.28);
  }
  e.gazeWarning=aimedAtPlayer;
  if(aimedAtPlayer&&!e.spectral&&usableMirror()&&visibleActor(e,playerActor))mirrorGuardPose.hold=Math.max(mirrorGuardPose.hold,.20);
}
function finishMedusaGaze(e,target){
  const {strike}=e.profile,source=e.rig.gazeOrigin.getWorldPosition(new THREE.Vector3());
  const point=target===playerActor?attackOrigin():entityAimPoint(target);
  if(Math.abs(source.y-point.y)>2.3||!combatSegmentClear(source,point))return;
  if(target!==playerActor){
    frontierFx.petrifyingGaze(source,point,strike.color,null);
    hitNPC(target,strike.damage,e);
    return;
  }
  if(isCreative()||dev.fly||player.health<=0)return;
  if(e.spectral){
    frontierFx.petrifyingGaze(source,point,0x8df8ef,null);
    if(player.petrified<=0){
      const ward=equipmentStat("spectralWard");
      damagePlayer(strike.damage,e.name+" · olhar petrificante","",spectral.markAttack(e,strike));
      if(player.health>0&&ward<.8)setPetrified(strike.stoneSeconds*(1-ward));
    }
    return;
  }
  const guard=equipmentDefinition("offhand"),condition=guard&&scienceSystem?.equipmentCondition(equipped.offhand.id);
  const result=QuimiCraftBiomeFauna.gazeProtection(guard&&{mirrorGuard:guard.mirrorGuard,broken:condition?.broken},player.petrified);
  if(result==="reflect"){
    registerShieldImpact(mirrorGuardPose,"mirror");
    const shield=guardShieldMesh(),contact=point.clone().lerp(source,.105);
    if(shield&&leftWrist.visible){
      shield.updateWorldMatrix(true,false);
      contact.set(0,.02,-.085);shield.localToWorld(contact);
    }
    const reflected=source.clone();reflected.y+=.54;
    frontierFx.petrifyingGaze(source,contact,strike.color,reflected);
    scienceSystem?.damageEquipment(equipped.offhand.id,11,"reflexo do olhar petrificante");
    toast("Escudo de Espelho refletiu o olhar");
    return;
  }
  frontierFx.petrifyingGaze(source,point,strike.color,null);
  if(result==="stoned")return;
  applyPlayerDamage(strike.damage,e.name+" · olhar petrificante");
  if(player.health>0){
    setPetrified(strike.stoneSeconds);
    noiseBurst(.26,.12,395);
  }
}
function planEntityRoute(e,goal,matchHeight){
  const a=e.ai;
  if(!e.onGround||a.routeDelay>0||entityPathBudget<=0)return;
  entityPathBudget--;
  a.routeDelay=.44+Math.random()*.37;
  const limits=entityTerrainLimits(e),radius=entityRadius(e);
  a.routeGoal={x:goal.x,y:goal.y,z:goal.z};
  a.route=QuimiCraftAI.findPath(e,goal,(px,pz,h,from)=>entityTraversal.edge(e,from,px,pz,limits,radius),66,matchHeight);
}
function steerEntity(e,behavior,dt){
  if(DRAGONS[e.type])return steerDragon(e,behavior,dt);
  const a=e.ai;
  const previousMode=a.mode;
  if(e.hop){a.mode=behavior.mode;return advanceEntityHop(e,dt)}
  a.mode=behavior.mode;
  const ease=1-Math.exp(-dt*(behavior.mode==="flee"?11:6.5));
  a.pace=lerp(a.pace,behavior.speed*mobMoveMultiplier*(e.frostTime>0?.52:1),ease);
  const goal=behavior.goal;
  if(!goal||previousMode!==a.mode){a.route=[];a.stalled=0}
  const matchHeight=!!goal&&["chase","search","return","evade","courtship","follow"].includes(behavior.mode);
  if(goal&&a.routeGoal&&(QuimiCraftAI.range(a.routeGoal,goal)>2.3||matchHeight&&Math.abs(a.routeGoal.y-goal.y)>1.2))a.route=[];
  while(a.route.length&&QuimiCraftAI.range(e,a.route[0])<.26&&Math.abs(e.y-a.route[0].y)<.22)a.route.shift();
  if(matchHeight&&!a.route.length&&Math.abs(e.y-goal.y)>.82&&QuimiCraftAI.range(e,goal)<3.5){
    planEntityRoute(e,goal,true);
  }
  let originalAngle=e.angle;
  if(goal)originalAngle=QuimiCraftAI.heading(e,a.route[0]||goal);
  const pushX=e.vx,pushZ=e.vz;
  e.vx*=Math.pow(.045,dt);e.vz*=Math.pow(.045,dt);
  const pace=goal?a.pace:0;
  let dx=Math.sin(originalAngle)*pace*dt+pushX*dt,dz=Math.cos(originalAngle)*pace*dt+pushZ*dt;
  if(pace>.15){
    for(const neighbor of entities){
      if(neighbor===e||neighbor.dead||neighbor.ai.recovering||Math.abs(neighbor.y-e.y)>1.3)continue;
      const sx=e.x-neighbor.x,sz=e.z-neighbor.z,d=sx*sx+sz*sz;
      if(d<=.0008||d>=.94*.94)continue;
      const distance=Math.sqrt(d),separation=(.94-distance)*dt*.78/distance;
      dx+=sx*separation;dz+=sz*separation;
    }
  }
  const x=e.x,z=e.z;
  let moved=moveEntityWithCollision(e,dx,dz,a.route[0]);
  if(e.hop){e.angle=originalAngle;return advanceEntityHop(e,dt)}
  const progress=(e.x-x)*Math.sin(originalAngle)+(e.z-z)*Math.cos(originalAngle);
  const stalled=!moved||progress<pace*dt*.36;
  if(stalled&&goal&&a.pace>.1){
    a.stalled+=dt;
    if(a.stalled>.10)planEntityRoute(e,goal,matchHeight);
    if(!moved&&!a.route.length){
      const side=Math.sin(e.phase)>0?1:-1;
      for(const offset of [side*.74,-side*.74,side*1.47,-side*1.47]){
        const angle=originalAngle+offset;
        if(moveEntityWithCollision(e,Math.sin(angle)*pace*dt,Math.cos(angle)*pace*dt)){moved=true;break}
      }
    }
  }else if(moved)a.stalled=Math.max(0,a.stalled-dt);
  if(a.stalled>2.1&&(a.mode==="wander"||a.mode==="patrol")){
    a.goal=null;a.wait=.4;a.stalled=0;a.route=[];
  }
  if(e.flying){
    const floor=entityTraversal.standing(e,e.x,e.z,e.y+1.65,e.y-7,entityRadius(e));
    if(floor!==null){
      const hover=a.mode==="sleep"?.06:a.mode==="rest"?.30:regionalFauna[e.type]?.hover??1.15;
      const next=lerp(e.y,floor+hover,1-Math.exp(-dt*3.8));
      if(!entityCollidesWorld(e,e.x,e.z,next))e.y=next;
    }
  }else{
    if(e.hop)return advanceEntityHop(e,dt);
    if(a.mode==="flee"&&e.type==="rabbit"&&e.onGround&&Math.random()<dt*.75)requestEntityJump(e);
    updateEntityVerticalMotion(e,dt);
  }
  const movedX=e.x-x,movedZ=e.z-z;
  const movedDistance=Math.hypot(movedX,movedZ);
  if(behavior.aim)e.angle=QuimiCraftAI.heading(e,behavior.aim);
  else if(movedDistance>.0005)e.angle=Math.atan2(movedX,movedZ);
  return movedDistance/dt;
}
const dragonAirspace={
  ceiling:MAX_Y-5,
  ground:(e,x,z,top,bottom)=>entityTraversal.standing(e,x,z,top,bottom,entityRadius(e)),
  clear(e,x,y,z){
    const block=getBlock(x,y+.075,z);
    return (y>LAB_LAYOUT.y+4.2||!labBoundsContains(x,z,1.25))&&block!==BLOCK.WATER&&
      block!==BLOCK.LAVA&&block!==BLOCK.FIRE&&!entityCollidesWorld(e,x,z,y);
  },
  wingClear(e,x,y,z,angle){
    const d=DRAGONS[e.type],span=d.form.span*d.scale*1.57,dx=Math.cos(angle)*span,dz=-Math.sin(angle)*span;
    return !combatPointBlocked(x+dx,y+1.06,z+dz)&&!combatPointBlocked(x-dx,y+1.06,z-dz);
  }
};
function steerDragon(e,behavior,dt){
  const onGround=e.onGround;
  e.ai.mode=behavior.mode;
  e.dragonAim=behavior.aim;
  const pace=QuimiCraftDragons.fly(e,DRAGONS[e.type],{...behavior,speed:behavior.speed*mobMoveMultiplier,
    rest:e.feedingPause>0||!!behavior.rest},dt,dragonAirspace);
  if(!onGround&&e.onGround)dustBurst(new THREE.Vector3(e.x,e.y,e.z),12);
  return pace;
}
let folkloreSpawnClock=0;
const folkloreCooldowns=new Map();
let screamerSpawnClock=0;
const harvestedScreamers=new Set();
function seedScreamers(dt){
  screamerSpawnClock-=dt;
  if(screamerSpawnClock>0)return;
  screamerSpawnClock=3.2;
  const size=18,px=Math.floor(player.pos.x/size),pz=Math.floor(player.pos.z/size);
  const present=new Set(entities.flatMap(e=>e.plantKey?[e.plantKey]:[]));
  if(present.size>=7)return;
  for(let cx=px-2;cx<=px+2;cx++)for(let cz=pz-2;cz<=pz+2;cz++){
    const key=cx+","+cz;
    if(present.has(key)||harvestedScreamers.has(key)||hash(cx,cz,WORLD_SEED%1073)>.38)continue;
    const x=cx*size+Math.floor(hash(cx,cz,891)*size)+.5,z=cz*size+Math.floor(hash(cx,cz,747)*size)+.5;
    const distance=Math.hypot(player.pos.x-x,player.pos.z-z);
    if(distance<8||distance>38||!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))continue;
    const y=terrainHeight(x,z)+1,variant=screamer.variant(biomeAt(x,z));
    if(!variant||Math.abs(player.pos.y-y)>11||spawnProtected(x,y,z)||!validMobPlacement("screamer",x,z,y))continue;
    const growth=getBlock(x,y-.08,z);
    if(!BDEF[growth]?.solid||BDEF[growth].detail||BDEF[growth].station||BDEF[growth].alpha)continue;
    createEntity("screamer",x,z,false,{y,variant}).plantKey=key;
    return;
  }
}
function botoShore(x,y,z){
  for(const [dx,,dz] of fluidSides){
    const landX=x+dx,landZ=z+dz;
    for(const height of [y+1,y+2]){
      if(validMobPlacement("pink_boto",landX,landZ,height))return {x:landX,y:height,z:landZ};
    }
  }
  return null;
}
function spawnFolklore(dt){
  if(!settings.mobs)return;
  folkloreSpawnClock-=dt;
  if(folkloreSpawnClock>0)return;
  folkloreSpawnClock=settings.mobs===1?9:5.5;
  const available=Object.keys(folklore.creatures).filter(type=>folklore.active(type,state.day,state.dayCount)&&
    (folkloreCooldowns.get(type)||0)<performance.now()&&!entities.some(e=>e.type===type));
  if(!available.length)return;
  for(let i=0;i<20;i++){
    const angle=Math.random()*TAU,r=12+Math.random()*24;
    const x=Math.floor(player.pos.x+Math.cos(angle)*r)+.5,z=Math.floor(player.pos.z+Math.sin(angle)*r)+.5;
    if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK))||labBoundsContains(x,z,3))continue;
    const h=terrainHeight(x,z),biome=biomeAt(x,z);
    if(Math.abs(h-player.pos.y)>16||entities.some(e=>!e.dead&&Math.hypot(e.x-x,e.z-z)<2))continue;
    const y=findStandingY(x,z,h+2),road=inVillage(x,z,11)&&!villageFootprint(x,z,0)||getBlock(x,y-.08,z)===BLOCK.COBBLE_PATH;
    for(const type of available){
      if(!folklore.habitat(type,biome,road))continue;
      if(type==="pink_boto"){
        const profile=regionalWater(x,z);
        if(getBlock(x,WATER_LEVEL,z)!==BLOCK.WATER||getBlock(x,WATER_LEVEL-1,z)!==BLOCK.WATER||
          (profile.id&&!["fresh","tannin"].includes(profile.id))||profile.chem?.salt||profile.chem?.acidic||profile.chem?.hot)continue;
        const shore=botoShore(x,WATER_LEVEL,z);
        if(!shore)continue;
        const water={x,y:WATER_LEVEL-.13,z};
        const actor=createEntity(type,x,z,false,water);
        actor.botoHome={water,shore};
        return;
      }
      if(!validMobPlacement(type,x,z,y)||type==="werewolf"&&mobLightAt(x,y,z)>8)continue;
      if(hostileSpecies(type)&&!canSpawnHostile({x,y,z}))continue;
      if(!["werewolf","headless_mule"].includes(type)&&Math.random()>.35)continue;
      createEntity(type,x,z,false,{y});
      return;
    }
  }
}
function angerFolklore(type,origin,range,target){
  for(const e of entities){
    if(e.dead||e.type!==type||Math.hypot(e.x-origin.x,e.y-origin.y,e.z-origin.z)>range)continue;
    QuimiCraftAI.alarm(e,target);
  }
}
function wakeNearbyScreamers(origin,range){
  for(const e of entities){
    if(!e.plant||e.dead||e.scream>0||e.screamRest>0)continue;
    if(Math.hypot(e.x-origin.x,e.y+.75-origin.y,e.z-origin.z)>range)continue;
    e.scream=screamer.sound.windup+screamer.sound.duration;
    e.screamPulse=0;
    if(QuimiCraftAI.range(e,playerActor)<10)toast("O Gritador está despertando!");
  }
}
function updateScreamer(e,dt,now){
  e.screamRest=Math.max(0,(e.screamRest||0)-dt);
  if(e.scream>0){
    const s=screamer.sound;
    e.scream=Math.max(0,e.scream-dt);
    if(e.scream<=s.duration&&e.scream>0){
      e.screamPulse-=dt;
      if(e.screamPulse<=0){
        e.screamPulse=s.pulse;
        const at=new THREE.Vector3(e.x,e.y+1.04,e.z),distance=at.distanceTo(entityAimPoint(playerActor));
        combatParticles(at,e.plant.light,13,"vapor");
        if(distance<=s.range&&!labSafe()&&!isCreative()){
          const protection=equipmentStat("hearingProtection");
          screamerSound((1-distance/s.range*.57)*(1-protection*.78));
          damagePlayer(s.damage,"grito do Gritador","sonic");
        }
      }
    }
    if(!e.scream)e.screamRest=s.cooldown;
  }
  animateEntityRig(e,dt,now,0);
}
function updateBoto(e,dt,now){
  const {water,shore}=e.botoHome,night=folklore.isNight(state.day),rig=e.rig;
  const swap=night!==e.botoOnLand;
  if(swap){
    if(!night||validMobPlacement(e,shore.x,shore.z,shore.y)){
      const place=night?shore:water;
      Object.assign(e,place,{botoOnLand:night,vy:0,onGround:night,hop:null});
      Object.assign(e.ai.home,place);
      rig.human.visible=night;rig.boto.group.visible=!night;
      e.botoBreach=null;e.botoLanding=null;
      e.group.rotation.x=0;
      e.group.position.set(e.x,e.y,e.z);
      combatParticles(e.group.position,0xe8b9d3,9,"vapor");
    }
  }
  if(e.botoOnLand)return false;
  const t=now*.001+e.phase,cycleIndex=Math.floor(t/15);
  const model=rig.boto,cycle=t%15,breaching=cycleIndex%2!==0;
  const heading=Math.atan2(water.x-shore.x,water.z-shore.z);
  const approach=breaching?Math.min(1,cycle/1.45)*clamp((5.3-cycle)/1.6,0,1):0;
  const swimOut=(.58-model.breachBounds.min.z)*approach;
  const x=water.x+Math.sin(t*.92)*.37+Math.sin(heading)*swimOut;
  const z=water.z+Math.cos(t*.92)*.37+Math.cos(heading)*swimOut;
  const {group}=e;
  if(breaching&&cycle>=1.45&&cycle<1.9&&e.botoBreachCycle!==cycleIndex){
    e.botoBreachCycle=cycleIndex;
    for(const offset of [0,.68,-.68]){
      e.botoBreach=planAquaticBreach(model.breachBounds,e.x,e.y,e.z,heading+offset,1.34,1.9,.62);
      if(e.botoBreach)break;
    }
  }
  if(e.botoBreach){
    const landed=moveAquaticBreach(group,model.breachBounds,e.botoBreach,dt);
    Object.assign(e,group.position);
    QuimiCraftAquatic.pose(model,t*5.3,.55);
    if(landed){e.botoBreach=null;e.botoLanding=group.position.clone()}
    return true;
  }
  const surface=Math.min(1,cycle*2,Math.max(0,(3.2-cycle)*1.4));
  const y=water.y+Math.sin(t*1.8)*.16;
  if(isWaterAt(x,y,z)){
    const room=getBlock(x,WATER_LEVEL+1,z)===BLOCK.AIR&&getBlock(x,WATER_LEVEL+2,z)===BLOCK.AIR;
    const crest=room&&!breaching?(findFishWater(x,z)?.top??WATER_LEVEL+.88)-model.spouts[0][1]-model.group.position.y:y;
    if(e.botoLanding){
      e.botoLanding.lerp(new THREE.Vector3(x,y,z),1-Math.exp(-dt*3));
      Object.assign(e,e.botoLanding);
      if(Math.hypot(e.x-x,e.z-z)<.11)e.botoLanding=null;
    }else Object.assign(e,{x,z,y:lerp(y,crest,surface)});
    group.rotation.x=0;
    QuimiCraftAquatic.spray(THREE,model,room&&!breaching&&settings.particles?cycle-.83:-1,e.spectral);
  }else QuimiCraftAquatic.spray(THREE,model,-1);
  e.group.position.set(e.x,e.y,e.z);
  e.group.rotation.y=turnToward(e.group.rotation.y,approach>0&&cycle<1.9?heading+Math.PI:-t*.92-Math.PI*.5,dt*5);
  QuimiCraftAquatic.pose(rig.boto,t*5.3,.7);
  wildlife.folkloreEffects(rig,now,.24,settings.particles>0);
  return true;
}
function updateFolklore(e,dt,now,dist){
  if(!e.ai.engagement&&!e.ai.returnTo&&!folklore.active(e.type,state.day,state.dayCount)){
    removeEntity(e);
    return true;
  }
  if(e.type==="pink_boto"&&e.botoHome)return updateBoto(e,dt,now);
  if(e.type!=="saci"&&e.type!=="boitata")return false;
  e.prankClock=(e.prankClock??7)-dt;
  if(e.prankClock>0)return false;
  e.prankClock=e.type==="saci"?11+Math.random()*8:3.2;
  const range=e.type==="saci"?5:10;
  if(dist>range+6)return false;
  const dirty=new Map();
  for(const [key,id] of mods){
    if(id!==BLOCK.FIRE)continue;
    const [x,y,z]=key.split("|").map(Number);
    if(Math.hypot(e.x-x,e.y-y,e.z-z)>range||isLabProtectedBlock(x,y,z))continue;
    if(e.type==="boitata"&&Math.hypot(player.pos.x-x,player.pos.z-z)<10&&!labSafe()&&!isCreative())angerFolklore("boitata",{x,y,z},range,playerActor);
    editVoxel(x,y,z,BLOCK.AIR,dirty);
  }
  commitVoxelEdits(dirty);
  if(e.type==="saci"&&dist<5&&Math.abs(e.y-player.pos.y)<2.6&&!labSafe()&&!isCreative()&&visibleActor(e,playerActor)){
    e.rig.whirlPower=1;
    const at=entityAimPoint(e),direction=player.pos.clone().sub(at).setY(0).normalize();
    player.folkloreWind=direction.multiplyScalar(5.75);
    if(settings.particles>0)for(let i=0;i<9;i++){
      const angle=i*TAU/4.5,radius=.25+i*.052,point=at.clone().add(new THREE.Vector3(Math.cos(angle)*radius,i*.12-.48,Math.sin(angle)*radius));
      windMote(point,-Math.sin(angle),Math.cos(angle),.92);
    }
    if(e.onGround)requestEntityJump(e);
    sound("splash",.38);
    toast("O redemoinho do Saci empurrou você.");
  }
  return false;
}
function updateEntities(dt,now){
  updateVillageResidents(dt);
  alchemyPlay.updateLife(dt);
  updateOffspring(dt);
  syncExpeditionActors(dt);
  entityPathBudget=2;
  spawnDirector.tick(dt,settings.mobs,player.pos,[...entities,...fishSchool],attemptMobSpawn);
  spawnFolklore(dt);
  seedScreamers(dt);
  for(const e of [...entities]){
    if(e.dead)continue;
    if(e===riding?.actor)continue;
    e.feedingPause=Math.max(0,(e.feedingPause||0)-dt);
    e.feedRest=Math.max(0,(e.feedRest||0)-dt);
    e.clashRest=Math.max(0,(e.clashRest||0)-dt);
    if(natureFolk[e.type]){
      e.groveRage=Math.max(0,(e.groveRage||0)-dt);
      e.hostile=e.groveRage>0||!!e.ai.engagement;
    }
    const dist=QuimiCraftAI.range(e,playerActor);
    if(e.hostile&&!e.persistent&&!spawnDirector.inRange(e,player.pos)){removeEntity(e);continue}
    if(e.plant){
      if(dist>53||!hasChunk(Math.floor(e.x/CHUNK),Math.floor(e.z/CHUNK)))removeEntity(e);
      else updateScreamer(e,dt,now);
      continue;
    }
    if(folklore.creatures[e.type]&&dist<settings.render*CHUNK*1.5&&updateFolklore(e,dt,now,dist))continue;
    if(e.spawnKind==="hostile"&&!e.ai.engagement&&!e.ai.returnTo&&retireDarkMob(e,dt,Math.hypot(dist,e.y-player.pos.y))){
      removeEntity(e);
      continue;
    }
    if(e.birth&&dist>Math.min(60,settings.render*CHUNK*1.4)){removeEntity(e);continue}
    if(!e.persistent&&(dist>settings.render*CHUNK*1.5||e.y<1||labBoundsContains(e.x,e.z,1)&&e.y<=LAB_LAYOUT.y+4)){
      removeEntity(e);continue;
    }
    if(stepCreatureStun(e,dt)){if(!e.stoneSkin)moveMobAfterHit(e,dt);continue}
    if(e.young&&(e.birth||e.wildAge)){
      const age=e.birth?breeding.age(e):Math.min(1,e.wildAge+=dt/QuimiCraftBreeding.childhood);
      if(e.adult)setYoungAnimalGrowth(e,age);
      else if(age>=1){removeEntity(e);spawnOffspring(e.birth);continue}
    }
    if(breeding.ready(e)){
      e.heartClock=(e.heartClock??1)-dt;
      if(e.heartClock<=0){breedingHearts(e,2);e.heartClock=2.4}
    }
    const a=e.ai;
    if(a.recovering>0){
      a.recovering=Math.max(0,a.recovering-dt);
      e.group.rotation.z=lerp(e.group.rotation.z,1.21,Math.min(1,7*dt));
      if(!a.recovering){
        Object.assign(e,a.home,{hp:e.maxHp,onGround:true,vy:0,vx:0,vz:0,hop:null});
        e.ai=QuimiCraftAI.brain(e,e.phase);
        e.group.position.set(e.x,e.y,e.z);
      }
      continue;
    }
    if(e.persistent&&dist>Math.min(settings.render*CHUNK+12,72))continue;
    e.group.rotation.z=lerp(e.group.rotation.z,0,Math.min(1,8*dt));
    e.jumpCooldown=Math.max(0,e.jumpCooldown-dt);
    e.frostTime=Math.max(0,(e.frostTime||0)-dt);
    e.stuckCheck=(e.stuckCheck||0)-dt;
    if(e.stuckCheck<=0&&!e.flying&&!e.hop){
      e.stuckCheck=1.6+Math.random()*.4;
      if(e.y<1||entityCollidesWorld(e,e.x,e.z)){
        const h=e.alchemy?e.ai.home.y:findStandingY(e.x,e.z,Math.max(2,e.y+1));
        if(validMobPlacement(e,e.x,e.z,h)){
          e.y=h;e.vy=0;e.onGround=true;
        }else if(e.persistent)Object.assign(e,a.home,{vy:0,vx:0,vz:0,onGround:true});
        else if(e.birth)Object.assign(e,{x:e.birth.x,y:e.birth.y,z:e.birth.z,vy:0,vx:0,vz:0,onGround:true});
        else{removeEntity(e);continue}
      }
    }
    if(e.bonded&&!e.hostile&&!a.returnTo){
      if(DRAGONS[e.type]){
        steerDragon(e,{mode:"idle",speed:0,rest:true},dt);
        e.group.position.set(e.x,e.y,e.z);
        e.group.rotation.y=e.angle+Math.PI;
      }
      animateEntityRig(e,dt,now,0);
      continue;
    }
    if(e.dragonBurst?.kind==="enemy"&&!QuimiCraftAI.canPursue(e,combatTargetAvailable))closeDragonBurst(e);
    let behavior=e.dragonBurst?{mode:e.dragonBurst.chargeLeft>0?"breathCharge":"breath",speed:0,aim:e.dragonBurst.target}:
      e.feedingPause>0?{mode:"idle",speed:0}:alchemyPlay.npcBehavior(e,QuimiCraftAI.tick(e,dt,target=>senseEntity(e,target),combatTargetAvailable),dt);
    behavior=courtshipBehavior(e,behavior,dt);
    behavior=naturalLandBehavior(e,behavior,dt);
    if((e.resident?.civic||e.role==="child")&&state.day>.6&&state.day<.90&&["wander","patrol","idle"].includes(behavior.mode)){
      const home=e.ai.home;
      behavior=QuimiCraftAI.range(e,home)>.58?{mode:"return",goal:home,speed:e.profile.walk}:{mode:"idle",speed:0};
    }
    if(e.resident?.play&&state.day>.13&&state.day<.54&&["wander","patrol","idle","return"].includes(behavior.mode)){
      const goal=e.resident.play;
      if(QuimiCraftAI.range(e,goal)>1.25)behavior={mode:"return",goal,speed:e.profile.walk*1.08};
    }
    const pace=steerEntity(e,behavior,dt);
    if(e.birth&&e.onGround&&!entityCollidesWorld(e,e.x,e.z)){
      Object.assign(e.birth,{x:e.x,y:e.y,z:e.z});
    }
    const gaze=e.profile.strike?.kind==="gaze";
    if(behavior.strike&&!DRAGONS[e.type]&&!gaze)finishEntityStrike(e,behavior.strike);
    if(e.dead)continue;
    if(e.persistent&&!a.fear&&a.mode!=="windup")e.hp=Math.min(e.maxHp,e.hp+dt*1.85);
    const flutter=e.type==="lumen_moth";
    const float=e.type==="saci"&&pace>.1?Math.abs(Math.sin(e.walkPhase))*.23:!e.flying||e.onGround||DRAGONS[e.type]?0:
      .5+Math.sin(now*(flutter?.0085:.004)+e.phase)*(flutter?.23:.17);
    e.group.position.set(e.x,e.y+float,e.z);
    e.group.rotation.y=DRAGONS[e.type]?e.angle+Math.PI:
      turnToward(e.group.rotation.y,e.angle+Math.PI,1-Math.exp(-dt*(behavior.aim?18:pace>.07?10.5:6)));
    animateEntityRig(e,dt,now,pace);
    warnMedusaGaze(e);
    if(behavior.strike&&(DRAGONS[e.type]||gaze))finishEntityStrike(e,behavior.strike);
    alchemyPlay.animateKeeper(e,now);
  }
}
function nearestNPC(){
  return nearbyActor(playerActor,npcs,4,n=>!n.dead&&n.ai.recovering<=0)?.actor||null;
}
const treeTrunks=new Set(Object.entries(BLOCK).filter(([key])=>key==="WOOD"||key==="BAMBOO"||key.endsWith("_LOG")).map(([,id])=>id));
const mountGround=(e,x,z,top,bottom)=>entityTraversal.standing(e,x,z,top,bottom,entityRadius(e));
function mountClear(e,x,y,z){
  const seat=mountSeat(e);
  return y>=1&&y+Math.max(entityHeight(e),seat+1.75)<MAX_Y-1&&
    !labBoundsContains(x,z,1.1)&&!entityCollidesWorld(e,x,z,y)&&!collides(new THREE.Vector3(x,y+seat,z),1.72);
}
function mountSeat(e){return natureFolk[e.type]?QuimiCraftMounts.treeBody.seat:1.03*DRAGONS[e.type].scale}
function mountKey(e){return e.siteActor||"creature:"+Date.now().toString(36)+":"+e.type+":"+bondedMounts.size}
function snapshotMounts(){
  for(const e of entities){
    const record=bondedMounts.get(e.bonded);
    if(record&&!e.dead)Object.assign(record,{x:e.x,y:e.y,z:e.z,hp:e.hp,angle:e.angle});
  }
  const companions=[...bondedMounts.values()].map(info=>{
    if(!riding||riding.actor.onGround||riding.actor.bonded!==info.id)return info;
    const {x,y,z}=riding.safe;
    return {...info,x,y,z};
  });
  return {companions,cleared:[...defeatedSiteActors],discovered:[...discoveredSites]};
}
function restoreMounts(saved){
  for(const id of saved?.cleared||[])if(typeof id==="string")defeatedSiteActors.add(id);
  for(const id of saved?.discovered||[])if(typeof id==="string")discoveredSites.add(id);
  for(const info of saved?.companions||[]){
    if(typeof info?.id!=="string"||!(DRAGONS[info.type]||natureFolk[info.type])||
      ![info.x,info.y,info.z].every(Number.isFinite))continue;
    bondedMounts.set(info.id,{...info,angle:Number(info.angle)||0});
  }
}
function spawnBonded(info){
  const e=createEntity(info.type,info.x,info.z,false,{y:info.y},false,!!info.spectral);
  e.bonded=info.id;e.siteActor=info.siteActor;e.grove=info.grove;
  e.hp=clamp(Number(info.hp)||e.maxHp,1,e.maxHp);
  e.y=info.y;e.angle=info.angle;e.group.rotation.y=e.angle+Math.PI;
  if(!mountClear(e,e.x,e.y,e.z)){
    for(const [dx,dz] of [[0,0],[3,0],[-3,0],[0,3],[0,-3],[3,3],[-3,-3]]){
      const x=e.x+dx,z=e.z+dz,y=mountGround(e,x,z,e.y+5,e.y-9);
      if(y==null||!mountClear(e,x,y,z))continue;
      Object.assign(e,{x,y,z});
      break;
    }
  }
  e.group.position.set(e.x,e.y,e.z);
  e.hostile=false;e.rig.saddle&&(e.rig.saddle.visible=true);
  return e;
}
function syncExpeditionActors(dt){
  for(const [id,time] of groveAlarm){
    if(time>dt)groveAlarm.set(id,time-dt);
    else groveAlarm.delete(id);
  }
  if((mountClock-=dt)>0)return;
  mountClock=1.1;
  const loaded=(x,z)=>hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK));
  const range=(x,z)=>Math.hypot(x-player.pos.x,z-player.pos.z);
  for(const info of bondedMounts.values()){
    if(range(info.x,info.z)<72&&loaded(info.x,info.z)&&!entities.some(e=>e.bonded===info.id))spawnBonded(info);
  }
  for(const site of expeditions.nearby(player.pos.x,player.pos.z,52)){
    if(!discoveredSites.has(site.id)&&range(site.x,site.z)<19&&Math.abs(player.pos.y-site.y)<(site.kind==="lab"?7:15)){
      discoveredSites.add(site.id);
      chatMessage("EXPLORAÇÃO",site.name+" descoberto.",{category:"discovery"});
      toast(site.name);
    }
    for(const spec of site.actors){
      if(range(spec.x,spec.z)>42||Math.abs(player.pos.y-spec.y)>14||!loaded(spec.x,spec.z)||
        defeatedSiteActors.has(spec.id)||bondedMounts.has(spec.id)||entities.some(e=>e.siteActor===spec.id))continue;
      if(hostileSpecies(spec.type)&&!canSpawnHostile(spec))continue;
      const e=createEntity(spec.type,spec.x,spec.z,false,{y:spec.y},false,
        spectral.roll(()=>hash(spec.x,spec.z,WORLD_SEED%757+spec.y)));
      if(entityCollidesWorld(e,e.x,e.z)){
        const floor=mountGround(e,e.x,e.z,spec.y+(e.flying?5:2),spec.y-2);
        if(floor==null){removeEntity(e);continue}
        const hover=DRAGONS[e.type]?.hover||0;
        e.y=entityCollidesWorld(e,e.x,e.z,floor+hover)?floor:floor+hover;
        e.group.position.y=e.y;e.ai.home.y=e.y;
      }
      e.siteActor=spec.id;e.habitat=site.id;
      if(site.kind==="grove"){e.grove=site.id;e.groveRage=groveAlarm.get(site.id)||0}
    }
  }
}
function openExpeditionChest(t){
  if(getBlock(t.x,t.y,t.z)!==BLOCK.EXPEDITION_CHEST)return;
  const treasure=expeditions.treasureAt(t.x,t.y,t.z);
  if(!treasure)return;
  const result=transactInventory([],treasure.items);
  if(!result.ok)return toast(result.message);
  setBlock(t.x,t.y,t.z,BLOCK.EXPEDITION_CHEST_OPEN);
  sound("pickup",.8);
  toast(treasure.name+" · "+treasure.items.map(([id,n])=>n+" × "+itemName(id)).join(" · "));
  if(initialReady)saveWorldState();
}
function provokeGrove(x,y,z,victim=null){
  const villages=expeditions.nearby(x,z,25).filter(site=>site.kind==="grove"&&Math.abs(y-site.y)<19);
  const nearby=entities.filter(e=>natureFolk[e.type]&&!e.dead&&Math.abs(e.y-y)<15&&Math.hypot(e.x-x,e.z-z)<22);
  const groves=new Set([...villages.map(site=>site.id),...nearby.map(e=>e.grove).filter(Boolean)]);
  if(victim?.grove)groves.add(victim.grove);
  if(!nearby.length&&!groves.size)return;
  const first=nearby.some(e=>!e.groveRage)||[...groves].some(id=>!groveAlarm.has(id));
  for(const id of groves)groveAlarm.set(id,65);
  for(const e of entities){
    if(!natureFolk[e.type]||e.dead||!nearby.includes(e)&&!groves.has(e.grove))continue;
    e.groveRage=65;e.hostile=true;QuimiCraftAI.alarm(e,playerActor);
    if(riding?.actor===e)leaveMount(true);
  }
  if(first){toast("As árvores vivas estão defendendo o bosque!");sound("alert",.61)}
}
function mountInteraction(){
  const eye=attackOrigin(),dir=aimDirection(),selected=selectedItem();
  let action=null,best=Infinity;
  for(const e of entities){
    const dragon=!!DRAGONS[e.type],tree=natureFolk[e.type],diet=QuimiCraftMounts.diet(e.type,dragon);
    if(!diet||e.dead||e.groveRage||e.young)continue;
    const gap=QuimiCraftAI.range(e,playerActor),height=e.y-player.pos.y;
    if(gap>(dragon?5.9:5.15)||height>(dragon?5.2:7.4)||height<-(dragon?4:9))continue;
    const focus=entityAimPoint(e);
    if(tree)focus.y=clamp(eye.y,e.y+.52,e.y+6.6);
    const delta=focus.clone().sub(eye),aligned=delta.clone().normalize().dot(dir);
    if((!e.bonded&&aligned<.61||e.bonded&&aligned<.05&&gap>2.8)||!combatSegmentClear(eye,focus))continue;
    const score=delta.length()+(1-aligned)*2;
    if(score>=best)continue;
    if(e.bonded)action={kind:"mountBoard",value:e,label:"Montar · "+e.name};
    else if(diet.food.includes(selected)){
      const trust=e.trust||0;
      action={kind:"mountOffer",value:e,label:(dragon?"Oferecer ":"Amizade · ")+itemName(selected)+(dragon?" · "+trust+"/"+diet.required:"")};
    }else if(tree)action={kind:"natureTalk",value:e,label:"Conversar com "+e.name};
    else if(!e.hostile)action={kind:"natureTalk",value:e,label:e.name+" · "+(e.type==="nature_dragon"?"ofereça frutos ou mel":"ofereça carne crua")};
    else continue;
    best=score;
  }
  return action;
}
function talkToNature(e){
  const actor=natureFolk[e.type];
  if(actor)return chatMessage(e.name,actor.line,{category:"dialogue"});
  return toast(e.type==="nature_dragon"?"Ofereça frutas silvestres ou mel três vezes.":"Ofereça carne crua três vezes para conquistar a confiança.");
}
function offerMountFood(e){
  const food=selectedItem(),diet=QuimiCraftMounts.diet(e.type,!!DRAGONS[e.type]);
  if(e.dead||e.bonded||e.groveRage||!diet?.food.includes(food)||QuimiCraftAI.range(e,playerActor)>6)return;
  if(!transactInventory([[food,1]],[]).ok)return;
  e.trust=(e.trust||0)+1;
  e.feedingPause=12;e.ai=QuimiCraftAI.brain(e,e.phase);
  combatParticles(entityAimPoint(e),0xc6ec9d,9);
  sound("pickup",.48);
  if(e.trust<diet.required)return toast(e.name+" · confiança "+e.trust+"/"+diet.required);
  e.bonded=mountKey(e);e.hostile=false;e.feedingPause=0;
  if(e.rig.saddle)e.rig.saddle.visible=true;
  bondedMounts.set(e.bonded,{id:e.bonded,type:e.type,siteActor:e.siteActor,grove:e.grove,x:e.x,y:e.y,z:e.z,hp:e.hp,angle:e.angle,spectral:e.spectral});
  toast(e.name+" é seu companheiro. Aponte para ele e pressione E para montar.");
  if(initialReady)saveWorldState();
}
function boardMount(e){
  if(riding||vehicles.current()||e.dead||!e.bonded||e.groveRage||QuimiCraftAI.range(e,playerActor)>6)return false;
  if(!mountClear(e,e.x,e.y,e.z)){toast("A montaria precisa de espaço livre.");return false}
  const dragon=!!DRAGONS[e.type];
  riding={actor:e,safe:player.pos.clone(),cooldown:0};
  e.angle=player.yaw+Math.PI;e.vx=e.vy=e.vz=0;e.ai.swing=null;
  player.pos.set(e.x,e.y+mountSeat(e),e.z);player.vel.set(0,0,0);
  state.left=false;queuedPlacement=null;playerActivity=null;
  refreshHeldItem();
  $("mountDescend").hidden=!dragon;
  updateCombatHint();
  toast(dragon?"Espaço sobe · Shift desce · Clique ataca · E desmonta":"Espaço + movimento escala paredes · Clique golpeia · E desmonta");
  return true;
}
function mountExitPosition(e){
  const r=entityRadius(e)+.62;
  for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r],[r,r],[-r,-r],[r,-r],[-r,r]]){
    const x=e.x+dx,z=e.z+dz,y=findStandingY(x,z,e.y+1);
    const p=new THREE.Vector3(x,y,z);
    if(Math.abs(y-e.y)<2.2&&!collides(p)&&supportedAt(p)&&!isWaterAt(x,y+.1,z)&&getBlock(x,y+.1,z)!==BLOCK.LAVA)return p;
  }
  return null;
}
function leaveMount(force=false){
  if(!riding)return false;
  const {actor:e,safe}=riding;
  const exit=e.onGround?mountExitPosition(e):null;
  if(!force&&!e.onGround){toast("Toque o chão antes de desmontar.");return false}
  if(!force&&!exit){toast("Procure espaço ao lado da montaria.");return false}
  riding=null;
  closeDragonBurst(e);
  e.climbing=false;
  e.mountedCharge=null;
  e.dragonFlight=null;
  player.pos.copy(exit||safe);player.vel.set(0,0,0);player.fallStart=player.pos.y;
  $("mountDescend").hidden=true;refreshHeldItem();updateCombatHint();
  return true;
}
function attackWithMount(){
  if(player.petrified>0)return false;
  if(!riding||riding.cooldown>0||riding.actor.dragonBurst||labSafe())return false;
  const e=riding.actor,dragon=DRAGONS[e.type];
  if(dragon){
    const attack=dragon.strike||QuimiCraftDragons.natureBreath;
    riding.cooldown=attack.cooldown;
    riding.breath=.24;
    e.mountedCharge=0;
    return true;
  }else{
    const strike=QuimiCraftMounts.treeStrike,angle=player.yaw;
    const direction=new THREE.Vector3(-Math.sin(angle),0,-Math.cos(angle));
    const from=new THREE.Vector3(e.x,e.y+.92,e.z);
    riding.cooldown=strike.cooldown;
    for(const target of attackableActors()){
      if(target.dead||target.bonded||natureFolk[target.type])continue;
      const point=entityAimPoint(target),delta=point.clone().sub(from);
      if(Math.abs(delta.y)>2.65||Math.hypot(delta.x,delta.z)>strike.range+.55||
        delta.setY(0).normalize().dot(direction)<.12||!combatSegmentClear(from,point))continue;
      hitEntity(target,strike.damage,e.name,direction.clone().multiplyScalar(3.3));
    }
    combatParticles(from.clone().addScaledVector(direction,2.2),0xb2a16d,25);sound("land",1);
  }
  e.ai.aim=.27;
  e.mountedStrike=.58;
  return true;
}
function updateMountPhysics(dt){
  const e=riding.actor,dragon=DRAGONS[e.type],now=performance.now();
  riding.cooldown=Math.max(0,riding.cooldown-dt);
  const active=player.petrified<=0;
  const input={yaw:active?player.yaw:e.angle-Math.PI,throttle:active?Number(!!keys.KeyW)-Number(!!keys.KeyS):0,
    side:active?Number(!!keys.KeyD)-Number(!!keys.KeyA):0,up:active&&!!keys.Space,down:active&&!!(keys.ShiftLeft||keys.ShiftRight)};
  const oldY=e.y,oldAngle=e.angle,wasGrounded=e.onGround;
  const moved=QuimiCraftMounts.motion(e,dt,input,{kind:dragon?"dragon":"tree",
    speed:dragon?dragon.run*1.97:QuimiCraftMounts.treeBody.groundSpeed,clear:mountClear,ground:mountGround,ceiling:MAX_Y-10});
  const pace=Math.hypot(moved.dx,moved.dz)/Math.max(.001,dt);
  e.angle=turnToward(e.angle,input.yaw+Math.PI,1-Math.exp(-dt*9));
  e.group.position.set(e.x,e.y,e.z);e.group.rotation.y=e.angle+Math.PI;
  e.group.rotation.x=lerp(e.group.rotation.x,e.climbing?-.15:0,Math.min(1,dt*8));
  e.ai.aim=Math.max(0,e.ai.aim-dt);
  if(dragon){
    const f=e.dragonFlight??={bank:0,glide:0,landing:0,climb:0};
    const vertical=(e.y-oldY)/dt/5.55,turn=(e.angle-oldAngle)/dt;
    f.bank=lerp(f.bank,e.onGround?0:clamp(input.side*.56-turn*.21,-1,1),Math.min(1,dt*6));
    f.climb=lerp(f.climb,clamp(vertical,-1,1),Math.min(1,dt*7));
    f.glide=lerp(f.glide,!e.onGround&&!input.up&&!input.down&&pace>1?.86:0,Math.min(1,dt*4));
    const floor=!e.onGround&&input.down?mountGround(e,e.x,e.z,e.y+.12,e.y-2):null;
    f.landing=lerp(f.landing,floor===null?0:clamp(1-(e.y-floor)/2,0,1),Math.min(1,dt*7));
    if(!wasGrounded&&e.onGround)dustBurst(new THREE.Vector3(e.x,e.y,e.z),13);
    if(riding.breath>0){
      riding.breath=Math.max(0,riding.breath-dt);
      e.mountedCharge=1-riding.breath/.24;
      if(!riding.breath){e.ai.aim=.27;e.mountedStrike=.58}
    }
  }
  animateEntityRig(e,dt,now,e.climbing?4.2:pace);
  if(dragon&&e.mountedCharge===1){
    e.mountedCharge=null;
    if(!labSafe(e.x,e.y,e.z)){
      const attack=dragon.strike||QuimiCraftDragons.natureBreath;
      const start=e.rig.nose.getWorldPosition(new THREE.Vector3()),aim=aimDirection();
      const direction=QuimiCraftDragons.shotDirection(THREE,start,start.clone().addScaledVector(aim,attack.range),attack);
      launchDragonBreath("mount",e,start,direction,attack);
    }
  }
  player.pos.set(e.x,e.y+mountSeat(e),e.z);player.vel.set(0,0,0);
  player.onGround=e.onGround;player.crouch=player.sprint=player.inWater=player.headUnderwater=player.inLava=false;
  forwardChunks=horizon.movementDirection(moved.dx,moved.dz);
  if(e.onGround&&(!riding.lastRest||now-riding.lastRest>1350)){
    const exit=mountExitPosition(e);
    if(exit){riding.safe.copy(exit);riding.lastRest=now;}
  }
  updateScienceEnvironment(dt,pace>.1);updateSurvival(dt,pace>.1);
  updateBreath(dt,false);updatePlayerCamera(dt,pace>.1);updateVitals();
  $("combatChip").textContent=e.name+" · "+(e.dragonBurst?e.dragonBurst.chargeLeft>0?"Carregando rajada":"Canalizando rajada":
    riding.cooldown>0?"Ataque em recarga":dragon?"Baforada pronta":"Golpe de raízes pronto");
}
function feedingAction(){
  const id=selectedItem();
  if(id==null||!entities.length)return null;
  const eye=attackOrigin(),direction=aimDirection();
  let result=null,nearest=4.15;
  for(const actor of entities){
    const offer=breeding.offer(actor,id);
    if(!offer)continue;
    const target=entityAimPoint(actor),delta=target.clone().sub(eye),distance=delta.dot(direction);
    const radius=clamp(entityRadius(actor)*.86,.23,.56);
    if(distance<=0||distance>nearest||delta.addScaledVector(direction,-distance).lengthSq()>radius*radius||
      !combatSegmentClear(eye,target))continue;
    const label=offer.kind==="cooldown"?actor.name+" · aguarde "+offer.seconds+" s":
      offer.kind==="ready"?actor.name+" · procurando par":
      (offer.kind==="grow"?"Ajudar a crescer":"Alimentar "+actor.name)+" · "+offer.count+" × "+itemName(id);
    result={kind:"breed",value:actor,label};nearest=distance;
  }
  return result;
}
function feedActor(actor){
  const slot=invSlots[state.selected],id=slot?.id,offer=breeding.offer(actor,id);
  if(!offer)return;
  if(offer.kind==="ready")return toast("Alimente outro adulto compatível que esteja por perto.");
  if(offer.kind==="cooldown")return toast("Aguarde "+offer.seconds+" s para alimentar de novo.");
  if(slot.count<offer.count)return toast("Selecione uma pilha com "+offer.count+" × "+itemName(id)+".");
  slot.count-=offer.count;
  if(!slot.count)invSlots[state.selected]=null;
  breeding.feed(actor,offer);
  actor.heartClock=2.4;
  if(offer.kind==="feed")breedingHearts(actor);
  else combatParticles(entityAimPoint(actor),0xcdeaa0,5);
  saveInventory();renderInventory();elementMissions?.sync();sound("pickup",.49);
  toast(offer.kind==="grow"?"O filhote cresceu um pouco.":"Alimente outro adulto compatível que esteja por perto.");
}
function interactionAction(){
  if(riding)return {kind:"mountExit",label:riding.actor.onGround?"Desmontar":"Desmonte após tocar o chão"};
  const deck=state.deckTarget,t=state.target;
  if(deck?.kind==="cargo")return {kind:"boatCargo",value:deck.vehicle,label:"Abrir baú de bordo"};
  if(deck?.kind==="sail")return {kind:"boatSail",value:deck.vehicle,label:deck.vehicle.deck.sail?"Recolher vela":"Içar vela"};
  if(t&&BDEF[t.id]?.gate)return {kind:"gate",value:t,label:BDEF[t.id].gate.open?"Fechar portão":"Abrir portão"};
  if(t&&BDEF[t.id]?.bed)return {kind:"bed",value:t,label:"Dormir ou marcar ponto de retorno"};
  const ride=vehicles.current();
  if(ride)return {kind:"vehicleExit",label:ride.flying||ride.airborne||ride.climb?"Aguarde o pouso":"Desmontar"};
  const nearbyVehicle=vehicleInteractable();
  if(nearbyVehicle)return {kind:"vehicleMount",value:nearbyVehicle,label:"Montar · "+QuimiCraftVehicles.types[nearbyVehicle.kind].name};
  if(t?.id===BLOCK.EXPEDITION_CHEST&&expeditions.treasureAt(t.x,t.y,t.z))return {kind:"expeditionChest",value:t,label:"Abrir baú"};
  if(t?.id===BLOCK.EXPEDITION_CHEST_OPEN)return {kind:"emptyChest",label:"Baú vazio"};
  const mounting=mountInteraction();
  if(mounting)return mounting;
  if(professionFishingActive&&QuimiCraftWorkshops.fishingRods.has(selectedItem())){
    const action=professions.action(null);
    return {kind:"profession",label:action.label,value:action};
  }
  const feeding=feedingAction();
  if(feeding)return feeding;
  const n=nearestNPC();
  const station=nearestLabStation();
  const caption=(kind,label,value)=>({kind,label,value});
  if(n?.role===exterminationMaster.role)return caption("npc","Tarefas e recompensas de "+n.name,n);
  const occupation=professions.action(t);
  const field=t&&fieldLab.locate(t);
  if(field&&fieldIntact(field))return caption("fieldStation","Usar "+field.unit.name,field);
  if(t?.labDoor)return caption("labDoor","Abrir/fechar porta do laboratório");
  if(t&&(t.id===BLOCK.DOOR||t.id===BLOCK.DOOR_OPEN))return caption("door","Abrir/fechar porta",t);
  if(t&&BDEF[t.id]?.alchemy){
    const site=alchemyColumnAt(t.x,t.z)?.site;
    if(site)return caption("alchemy",t.id===BLOCK.ALCHEMY_SAMPLE?"Coletar amostra da oficina":"Usar "+itemName(t.id),{site,id:t.id});
  }
  if(occupation&&occupation.kind!=="fish")return caption("profession",occupation.label,occupation);
  if(t?.id===BLOCK.FURNACE)return caption("furnace","Assar alimento (usa carvão)");
  if(t?.id===BLOCK.LAB)return caption("bench","Usar Bancada Química");
  if(nearPeriodicTable())return caption("periodic","Consultar Tabela Periódica");
  if(n?.role.startsWith("lab_")&&QuimiCraftAI.range(n,playerActor)<1.95)return caption("npc","Conversar com "+n.name,n);
  if(station)return caption("station","Usar "+(scienceSystem?.stations[station.stationIds[0]]?.name||"estação científica"),station);
  if(n){const action=n.role.startsWith("shop_")?"Abrir "+(SHOP_CATALOG[n.role.slice(5)]?.title||"loja"):"Conversar com "+n.name;return caption("npc",action+(n.hp<n.maxHp-1?" · "+Math.ceil(n.hp)+"/"+n.maxHp+" PV":""),n);}
  if(labDoor.nearby(player.pos))return caption("labDoor","Abrir/fechar porta do laboratório");
  if(occupation)return caption("profession",occupation.label,occupation);
  return null;
}
function updateInteraction(){
  const action=interactionAction(),el=$("interaction");
  const held=selectedItem();
  const prefix=touchInput?"Interagir":action?.kind.startsWith("vehicle")||QuimiCraftAlchemy.potions[held]||exterminationTools[held]||activeHuntUtilities.has(held)?"E":"E ou botão direito";
  const deck=state.deckTarget,build=deck?.kind==="deck"?"Colocar no piso do barco":deck?.kind==="deckBlock"?"Quebrar bloco do convés":null;
  el.textContent=build?(touchInput?"Usar":deck.kind==="deck"?"Botão direito":"F ou clique")+" · "+build:action?prefix+" · "+action.label:"";
  el.classList.toggle("show",!!action||!!build);
}
function interact(action=interactionAction()){
  if(player.petrified>0||gasBlackout>0||sleeping)return;
  if(!action)return;
  switch(action.kind){
    case "gate":return toggleGate(action.value);
    case "bed":return beginSleep(action.value);
    case "boatCargo":return openBoatCargo(action.value);
    case "boatSail":return vehicles.toggleSail(action.value);
    case "expeditionChest":return openExpeditionChest(action.value);
    case "emptyChest":return toast("Você já recolheu os itens deste baú.");
    case "mountExit":return leaveMount();
    case "mountOffer":return offerMountFood(action.value);
    case "mountBoard":return boardMount(action.value);
    case "natureTalk":return talkToNature(action.value);
    case "vehicleMount":return boardVehicle(action.value);
    case "vehicleExit":return leaveVehicle();
    case "alchemy":return useAlchemyStation(action.value);
    case "fieldStation":return scienceUI?.openStation([action.value.unit.id],action.value);
    case "breed":return feedActor(action.value);
    case "profession":return professions.use(action.value);
    case "labDoor":return toggleLabMainDoor();
    case "door":return toggleDoor(action.value);
    case "periodic":return openPeriodicTable();
    case "furnace":return cookWithFurnace();
    case "bench":return openChemistry();
    case "npc":return interactNPC(action.value);
    case "station":{
      const ids=action.value.stationIds;
      elementMissions?.recordEvent("activate_station",{id:ids.includes("chemistry_workbench")?"chemistry":ids[0]});
      return scienceUI?.openStation(ids);
    }
  }
}
function interactNPC(n){
  if(n?.ai)n.ai.think=0;
  if(n?.role===exterminationMaster.role)return openExtermination();
  if(n?.role==="child"){
    const lines=["Eu conheço três tipos de pedra pelo caminho de casa.","Quando chove, eu vejo os sapos perto da água.",
      "A gente brinca de contar os cristais nas pedras. Cada um tem um desenho diferente!",
      "Sempre olho se as lanternas da vila estão acesas quando começa a escurecer."];
    const lessons=["Aprendi a medir as gotas antes de misturar os extratos.","Estou separando os frascos pelo rótulo. Assim ninguém troca os ingredientes.",
      "Hoje vou desenhar as folhas que usamos para preparar os pigmentos."];
    const dialogue=n.resident?.apprentice?lessons:lines;
    const interests={insects:"Na pracinha eu conto quantas borboletas passam antes de aparecer uma de outra cor.",
      orchard:"As acerolas amadurecem em grupos. Procuro as vermelhinhas por baixo dos galhos.",
      stones:"Guardei uma pedra bem lisinha que encontrei no caminho da praça.",
      water:"Fico na margem olhando as nadadeiras brilharem quando os peixes viram."};
    chatMessage(n.name,interests[n.resident?.interest]||dialogue[n.appearance.marker%dialogue.length],{category:"dialogue"});
    return;
  }
  if(n?.resident?.office)return alchemyUI.open(n.resident.office);
  if(n&&interactHabitatResident(n))return;
  if(n?.role==="carbon"){if(!localStorage.qc_carbon_intro_gift_v60){addItem("water",2);localStorage.qc_carbon_intro_gift_v60="1";chatMessage("PROF. CARBONO","Separei duas amostras de água destilada para suas primeiras pesquisas.",{category:"dialogue"})}discover("indicator","Indicadores naturais");discover("salt_solution","Soluções iônicas");discover("copper_oxide","Óxidos metálicos");scienceSystem?.registerDiscovery("missions","carbon_tutorial",{name:"Primeiros passos com Prof. Carbono",source:"Laboratório Carbono",researchProgress:100});return openProfessor()}if(n?.role==="ranger"){chatMessage("GUARDIÃ ÍRIS","Criaturas hostis aparecem à noite e em lugares escuros. Acenda tochas antes de atravessar uma caverna. O cajado empurra inimigos; o arco mantém distância.",{category:"dialogue"});if(!localStorage.qc_rangerGift){addItem("arrow",20);addItem("wind_essence",1);localStorage.qc_rangerGift="1";chatMessage("GUARDIÃ ÍRIS","Leve estas flechas e uma essência do vento.",{category:"dialogue"})}return}if(n?.role?.startsWith("shop_")){const kind=n.role.slice(5),profile=Object.values(NPC_PROFILES).find(p=>p.role===n.role);chatMessage(n.name.toUpperCase(),profile?.talk||"Veja o que chegou hoje.",{category:"dialogue"});if(kind==="solid"){discover("calcination","Química dos carbonatos");discover("nitrate","Química dos nitratos")}if(kind==="liquid"){discover("ammonia_complex","Complexos de coordenação");discover("cryogenics","Mudanças de estado")}if(kind==="food")discover("fermentation","Fermentação");return openShop(kind)}if(n){const profile=Object.values(NPC_PROFILES).find(p=>p.role===n.role);chatMessage(n.name.toUpperCase(),profile?.talk||"A Vila dos Elementos está sempre mudando.",{category:"dialogue"});if(n.role==="botanist")discover("ph_kit","Escala de pH");if(n.role==="geologist")discover("spectroscopy","Espectroscopia de cristais");return}}
function interactHabitatResident(npc){
  const profile=NPC_PROFILES["npc_"+npc.role];
  const stations={
    lab_hydrologist:["water_purification","distillation"],
    lab_mineralogist:["spectrometer","precision_balance"],
    lab_ecologist:["microscope","sample_storage"],
    water_keeper:["water_purification"],
    metalsmith:["precision_balance","laboratory_furnace"]
  };
  const menus=stations[npc.role];
  if(!menus&&!["cartographer","herbal_trader","seed_curator"].includes(npc.role))return false;
  chatMessage(npc.name,profile.talk,{category:"dialogue"});
  if(npc.role==="cartographer"){
    const [x,z]=[Math.floor(npc.x),Math.floor(npc.z)];
    let nearest=null;
    for(let dz=-192;dz<=192;dz+=24)for(let dx=-192;dx<=192;dx+=24){
      const d=dx*dx+dz*dz;
      if(d>192**2||nearest&&d>=nearest.distance)continue;
      const patch=habitats.profile(habitats.at(x+dx,z+dz));
      if(patch)nearest={patch,distance:d,x:x+dx,z:z+dz};
    }
    if(nearest)chatMessage(npc.name,nearest.patch.name+" · X "+nearest.x+", Z "+nearest.z+". "+nearest.patch.note,{category:"dialogue"});
    else chatMessage(npc.name,"Siga além dos arredores da vila para encontrar transições entre os terrenos.",{category:"dialogue"});
  }
  if(npc.role==="herbal_trader")openShop("civic_market");
  if(npc.role==="seed_curator"){
    const plots=villages.near(npc.x,npc.z)?.civic||[];
    const plot=plots.find(b=>b.civic==="orchard");
    if(plot)chatMessage(npc.name,"A estufa fica em X "+plot.x+", Z "+plot.z+".",{category:"dialogue"});
  }
  if(npc.role==="lab_mineralogist"){
    const notebook=scienceSystem.getNotebook(),seen=notebook.discoveries?.minerals||{};
    for(const [key,patch] of Object.entries(QuimiCraftHabitats.profiles)){
      const block=BLOCK[patch.specimen],discovery="habitat-"+key;
      if(!countItem(block)||seen[discovery])continue;
      scienceSystem.registerDiscovery("minerals",discovery,{name:itemName(block),source:patch.name,researchProgress:100,notes:patch.note});
      scienceSystem.addObservation(itemName(block)+" · "+patch.note,"mineralogia");
      chatMessage(npc.name,patch.note,{category:"dialogue"});
    }
  }
  if(menus)scienceUI.openStation(menus);
  return true;
}
function labMaterial(color,metalness=.08,roughness=.45,emissive=0){return new THREE.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity:emissive?1.15:0,transparent:false,opacity:1,depthWrite:true,depthTest:true,colorWrite:true,side:THREE.FrontSide})}
function makeBottle(parent,x,y,z,color,scale=1){const glass=new THREE.MeshStandardMaterial({color:0xbdeef2,transparent:true,opacity:.38,roughness:.08,metalness:.02,depthWrite:false,depthTest:true,colorWrite:true}),liquid=new THREE.MeshStandardMaterial({color,transparent:true,opacity:.82,roughness:.2,emissive:color,emissiveIntensity:.18,depthWrite:false,depthTest:true,colorWrite:true});glass.userData.intentionalTransparency=true;liquid.userData.intentionalTransparency=true;const body=new THREE.Mesh(new THREE.CylinderGeometry(.11*scale,.14*scale,.36*scale,10),glass);body.position.set(x,y,z);parent.add(body);const fill=new THREE.Mesh(new THREE.CylinderGeometry(.095*scale,.12*scale,.2*scale,10),liquid);fill.position.set(x,y-.055*scale,z);parent.add(fill);const neck=new THREE.Mesh(new THREE.CylinderGeometry(.055*scale,.065*scale,.15*scale,9),glass);neck.position.set(x,y+.25*scale,z);parent.add(neck);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.067*scale,.067*scale,.055*scale,8),labMaterial(0x26383e,.35,.28));cap.position.set(x,y+.35*scale,z);parent.add(cap)}
function makeScreen(parent,x,y,z,w,h,rotY=0,color=0x55e8ce){const frame=new THREE.Mesh(new THREE.BoxGeometry(w+.12,h+.12,.09),labMaterial(0x202a30,.72,.25));frame.position.set(x,y,z);frame.rotation.y=rotY;parent.add(frame);const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,transparent:false,opacity:1,depthWrite:true,depthTest:true,side:THREE.FrontSide}));screen.position.set(x-Math.sin(rotY)*.051,y,z-Math.cos(rotY)*.051);screen.rotation.y=rotY;parent.add(screen);return screen}
function familyColor(f){return {alkali:0xd87563,alkaline:0xe2a85f,transition:0x63a6b8,post:0x8ca6a7,metalloid:0x6dbb8d,nonmetal:0x6f8fd2,halogen:0xb87bc1,noble:0x8d80d5,lanthanide:0xc7849d,actinide:0xb06f78}[f]||0x78979a}
const PERIODIC_COLUMNS=18,PERIODIC_ROWS=9,PERIODIC_FLOOR_MARGIN=BLOCK_SIZE;
const PERIODIC_CATEGORY_LABELS={alkali:"METAL ALCALINO",alkaline:"ALCALINO-TERROSO",transition:"METAL DE TRANSIÇÃO",post:"PÓS-TRANSIÇÃO",metalloid:"SEMIMETAL",nonmetal:"NÃO METAL",halogen:"HALOGÊNIO",noble:"GÁS NOBRE",lanthanide:"LANTANÍDEO",actinide:"ACTINÍDEO"};
function periodicGridMetrics(){
  const rear=LAB_LAYOUT.cz+LAB_LAYOUT.halfD;
  return {
    originX:PERIODIC_STATION.x-(PERIODIC_COLUMNS-1)*BLOCK_SIZE/2,
    originY:LAB_LAYOUT.y+PERIODIC_FLOOR_MARGIN+BLOCK_SIZE/2,
    originZ:rear-BLOCK_SIZE/2,
    floorSurface:LAB_LAYOUT.y,
    ceilingSurface:LAB_LAYOUT.y+LAB_LAYOUT.height
  }
}
function periodicBlockPosition(e,grid=periodicGridMetrics()){
  const worldColumn=PERIODIC_COLUMNS-e.displayColumn,worldRow=PERIODIC_ROWS-e.displayRow;
  return new THREE.Vector3(
    grid.originX+worldColumn*BLOCK_SIZE,
    grid.originY+worldRow*BLOCK_SIZE,
    grid.originZ
  )
}
function drawFittedPeriodicText(ctx,text,maxWidth,maxSize,minSize,weight,y){
  let size=maxSize;
  do{ctx.font=`${weight} ${size}px Arial, sans-serif`;if(ctx.measureText(text).width<=maxWidth)break;size--}while(size>minSize);
  ctx.fillText(text,128,y,maxWidth)
}
function periodicElementTexture(e){
  const missionState=elementMissions?.getElementState(e.atomicNumber)||"locked",sideColor=new THREE.Color(familyColor(e.category));if(missionState==="locked")sideColor.multiplyScalar(.36);else if(missionState==="available")sideColor.offsetHSL(0,.02,.04);else if(missionState==="ready-to-complete")sideColor.offsetHSL(0,.08,.13);const light=sideColor.clone().offsetHSL(0,.04,.12),dark=sideColor.clone().multiplyScalar(.28);
  const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d"),g=x.createLinearGradient(0,0,256,256);
  g.addColorStop(0,`#${light.getHexString()}`);g.addColorStop(.58,`#${sideColor.getHexString()}`);g.addColorStop(1,`#${dark.getHexString()}`);x.fillStyle=g;x.fillRect(0,0,256,256);
  x.fillStyle="rgba(5,13,18,.28)";x.fillRect(14,14,228,46);x.fillRect(14,199,228,43);
  x.strokeStyle=missionState==="active"?"#ffe28a":missionState==="ready-to-complete"?"#baff9d":missionState==="available"?"#9ce9d8":"rgba(235,255,250,.9)";x.lineWidth=9;x.strokeRect(7,7,242,242);
  x.strokeStyle="rgba(255,255,255,.22)";x.lineWidth=2;x.strokeRect(17,17,222,222);
  x.textAlign="center";x.textBaseline="middle";
  x.fillStyle="#effffc";x.font="800 25px Arial, sans-serif";x.fillText(String(e.atomicNumber),128,37);
  x.fillStyle="#ffffff";x.shadowColor="rgba(0,0,0,.35)";x.shadowBlur=5;x.font="900 82px Arial, sans-serif";x.fillText(e.symbol,128,116);
  x.shadowBlur=0;x.fillStyle="#f5fffc";drawFittedPeriodicText(x,e.name.toUpperCase(),214,28,18,800,174);
  x.fillStyle="rgba(239,255,250,.78)";drawFittedPeriodicText(x,PERIODIC_CATEGORY_LABELS[e.category]||e.category.toUpperCase(),208,17,11,700,220);
  const texture=new THREE.CanvasTexture(c);texture.name=`Elemento ${e.atomicNumber} · ${e.symbol}`;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipMapLinearFilter;texture.generateMipmaps=true;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.encoding=THREE.sRGBEncoding;return texture
}
function periodicBlocksMesh(){
  const group=new THREE.Group(),grid=periodicGridMetrics(),elementGeometry=new THREE.BoxGeometry(BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE);
  const indexCount=elementGeometry.index.count;elementGeometry.clearGroups();elementGeometry.addGroup(0,indexCount-6,0);elementGeometry.addGroup(indexCount-6,6,1);
  group.name="Periodic Table · 118 Standard Blocks";
  for(const e of PERIODIC_ELEMENTS){
    const missionState=elementMissions?.getElementState(e.atomicNumber)||"locked",sideColor=new THREE.Color(familyColor(e.category));if(missionState==="locked")sideColor.multiplyScalar(.42);const position=periodicBlockPosition(e,grid),sideMaterial=new THREE.MeshStandardMaterial({color:sideColor,roughness:.42,metalness:.08,transparent:false,opacity:1,depthWrite:true,depthTest:true}),frontMaterial=new THREE.MeshBasicMaterial({map:periodicElementTexture(e),transparent:false,opacity:1,depthWrite:true,depthTest:true});
    const cube=new THREE.Mesh(elementGeometry,[sideMaterial,frontMaterial]);
    cube.name=`Elemento ${e.atomicNumber} · ${e.symbol}`;cube.position.copy(position);cube.scale.set(1,1,1);cube.castShadow=settings.shadows>0;cube.receiveShadow=true;
    registerPeriodicCollision(position.x,position.y,position.z,`element:${e.atomicNumber}`);cube.userData={atomicNumber:e.atomicNumber,symbol:e.symbol,blockSize:BLOCK_SIZE,colliderIndex:periodicCollisionBoxes.length-1,missionState};group.add(cube)
  }
  group.userData={periodicElementBlocks:PERIODIC_ELEMENTS.length,blockSize:BLOCK_SIZE,colliderCount:periodicCollisionBoxes.length};return group
}
function textPanelTexture(title,subtitle){
  // The texture and the in-world panel now share nearly the same aspect ratio,
  // preventing the heading from being stretched into a thin, blurred strip.
  const c=document.createElement("canvas");c.width=2048;c.height=160;
  const x=c.getContext("2d"),g=x.createLinearGradient(0,0,c.width,0);
  g.addColorStop(0,"#0b252b");g.addColorStop(.5,"#175651");g.addColorStop(1,"#0b252b");
  x.fillStyle=g;x.fillRect(0,0,c.width,c.height);
  x.strokeStyle="#d7ae59";x.lineWidth=7;x.strokeRect(4,4,c.width-8,c.height-8);
  x.textAlign="center";x.textBaseline="middle";
  x.shadowColor="rgba(0,0,0,.48)";x.shadowBlur=8;x.shadowOffsetY=3;
  x.fillStyle="#f2fffb";x.font='900 72px "Arial Black", Arial, sans-serif';x.fillText(title,c.width/2,58,c.width-120);
  x.shadowBlur=3;x.shadowOffsetY=1;x.fillStyle="rgba(226,255,248,.82)";x.font='700 27px Arial, sans-serif';x.fillText(subtitle,c.width/2,119,c.width-140);
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipMapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());t.encoding=THREE.sRGBEncoding;return t
}
function disposeObject(root){
  const geometries=new Set(),materials=new Set(),textures=new Set();root?.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of Array.isArray(object.material)?object.material:[object.material])if(material){materials.add(material);if(material.map)textures.add(material.map)}});
  for(const texture of textures)texture.dispose?.();for(const material of materials)material.dispose?.();for(const geometry of geometries)geometry.dispose?.()
}
function refreshPeriodicWall(){
  if(!periodicWallRoot)return;periodicCollisionBoxes.length=0;periodicColliderIds.clear();for(const child of [...periodicWallRoot.children]){periodicWallRoot.remove(child);disposeObject(child)}
  const grid=periodicGridMetrics(),rear=LAB_LAYOUT.cz+LAB_LAYOUT.halfD,topBlockCenter=grid.originY+(PERIODIC_ROWS-1)*BLOCK_SIZE;
  const title=new THREE.Mesh(new THREE.PlaneGeometry(15.8,1.22),new THREE.MeshBasicMaterial({map:textPanelTexture("TABELA PERIÓDICA","118 ELEMENTOS · 1 BLOCO PADRÃO CADA"),side:THREE.FrontSide}));title.position.set(PERIODIC_STATION.x,topBlockCenter+BLOCK_SIZE*1.18,rear-.015);title.rotation.y=Math.PI;periodicWallRoot.add(title);
  periodicWallRoot.add(periodicBlocksMesh());
  periodicWallRoot.userData={blockSize:BLOCK_SIZE,elementCount:PERIODIC_ELEMENTS.length,colliderCount:periodicCollisionBoxes.length};periodicVisualSignature=missionVisualSignature()
}
const LAB_WINGS=Object.freeze([
  {id:"lab-mineralogia",role:"lab_mineralogist",title:"Mineralogia",x:-12.5,z:-4,trim:0xe4b968,sign:"#f4d59b",kind:"minerals",
    stations:["precision_balance","spectrometer"],bounds:[4.2,2.1,1.64]},
  {id:"lab-hidrologia",role:"lab_hydrologist",title:"Hidrologia",x:-12,z:5.7,trim:0x68bce9,sign:"#addef5",kind:"water",
    stations:["water_purification","distillation"],bounds:[4.2,2.1,1.72]},
  {id:"lab-ecologia",role:"lab_ecologist",title:"Ecologia de Campo",x:13,z:-4,trim:0x6ccf9d,sign:"#bceccd",kind:"ecology",
    stations:["microscope","sample_storage"],bounds:[4.2,2.1,1.64]}
]);
function ensureLaboratoryStaff(){
  for(const wing of LAB_WINGS){
    if(npcs.some(npc=>npc.role===wing.role))continue;
    const role="npc_"+wing.role,profile=NPC_PROFILES[role];
    const x=LAB_LAYOUT.cx+wing.x+.35,z=LAB_LAYOUT.cz+wing.z-1.9,y=LAB_LAYOUT.y;
    createEntity(role,x,z,true,{id:wing.id,role:wing.role,lab:true,title:wing.title,x,y,z,scale:1,
      name:profile.name,trim:wing.trim,tint:profile.color,skin:profile.skin,hair:profile.hair,variant:0});
  }
}
const LAB_ANCHORS=Object.freeze({
  ...Object.fromEntries(LAB_WINGS.map(wing=>[wing.id,Object.freeze({
    x:LAB_LAYOUT.cx+wing.x,z:LAB_LAYOUT.cz+wing.z,support:"floor",zone:wing.id
  })])),
  "lab-desk-left":Object.freeze({x:LAB_LAYOUT.cx-7,z:LAB_LAYOUT.cz-LAB_LAYOUT.halfD+7,support:"floor",zone:"ala-analitica"}),
  "lab-desk-right":Object.freeze({x:LAB_LAYOUT.cx+7,z:LAB_LAYOUT.cz-LAB_LAYOUT.halfD+7,support:"floor",zone:"ala-instrumental"}),
  "chemistry-bench-main":Object.freeze({x:LAB_LAYOUT.cx-6,z:LAB_LAYOUT.cz-1,support:"floor",zone:"quimica"}),
  "chemistry-bench-secondary":Object.freeze({x:LAB_LAYOUT.cx+6,z:LAB_LAYOUT.cz-1,support:"floor",zone:"quimica"}),
  "reception-left":Object.freeze({x:LAB_LAYOUT.cx-LAB_LAYOUT.halfW+5,z:LAB_LAYOUT.cz-LAB_LAYOUT.halfD+3.5,support:"floor",zone:"recepcao"}),
  "cabinet-left":Object.freeze({x:LAB_LAYOUT.cx-LAB_LAYOUT.halfW+1.55,z:LAB_LAYOUT.cz+2,support:"floor",zone:"armazenamento"}),
  "cabinet-right":Object.freeze({x:LAB_LAYOUT.cx+LAB_LAYOUT.halfW-.75,z:LAB_LAYOUT.cz+2,support:"floor",zone:"armazenamento"}),
  "reactor-left":Object.freeze({x:LAB_LAYOUT.cx-7,z:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-5,support:"floor",zone:"reatores"}),
  "cryo-right":Object.freeze({x:LAB_LAYOUT.cx+7,z:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-5,support:"floor",zone:"reatores"}),
  "display-pedestal-01":Object.freeze({x:LAB_LAYOUT.cx+LAB_LAYOUT.halfW-4,z:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-5,support:"floor",zone:"exposicao"}),
  "servers-rear-left":Object.freeze({x:LAB_LAYOUT.cx-LAB_LAYOUT.halfW+3,z:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-2,support:"floor",zone:"servidores"}),
  "professor-position":Object.freeze({x:LAB_LAYOUT.cx-5,z:LAB_LAYOUT.cz-LAB_LAYOUT.halfD+3,support:"floor",zone:"recepcao"}),
  "periodic-table-origin":Object.freeze({x:PERIODIC_STATION.x,z:PERIODIC_STATION.z,support:"wall",zone:"tabela"}),
  "ceiling-light-01":Object.freeze({x:LAB_LAYOUT.cx-8,z:LAB_LAYOUT.cz-7,support:"ceiling",zone:"iluminacao"}),
  "ceiling-light-02":Object.freeze({x:LAB_LAYOUT.cx,z:LAB_LAYOUT.cz-7,support:"ceiling",zone:"iluminacao"}),
  "ceiling-light-03":Object.freeze({x:LAB_LAYOUT.cx+8,z:LAB_LAYOUT.cz-7,support:"ceiling",zone:"iluminacao"}),
  "ceiling-light-04":Object.freeze({x:LAB_LAYOUT.cx-8,z:LAB_LAYOUT.cz+2,support:"ceiling",zone:"iluminacao"}),
  "ceiling-light-05":Object.freeze({x:LAB_LAYOUT.cx,z:LAB_LAYOUT.cz+2,support:"ceiling",zone:"iluminacao"}),
  "ceiling-light-06":Object.freeze({x:LAB_LAYOUT.cx+8,z:LAB_LAYOUT.cz+2,support:"ceiling",zone:"iluminacao"})
});
const LAB_PROP_DEFINITIONS=Object.freeze([
  ...LAB_WINGS.map(wing=>({id:wing.id,kind:"research-wing",wing,anchor:wing.id,bounds:wing.bounds,
    allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:wing.id,
    rotation:0,scale:[1,1,1],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,
    contents:[wing.kind]})),
  {id:"reception-main",kind:"reception",anchor:"reception-left",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"recepcao",rotation:0,scale:[1,1,1],bounds:[6.2,1.4,1.5],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["monitor","frasco"]},
  {id:"desk-analytical",kind:"console",anchor:"lab-desk-left",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"ala-analitica",rotation:0,scale:[1,1,1],bounds:[4.5,1.5,1.5],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["computador","analisador"]},
  {id:"desk-instrumental",kind:"console",anchor:"lab-desk-right",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"ala-instrumental",rotation:0,scale:[1,1,1],bounds:[4.5,1.5,1.5],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["computador","espectrometro"]},
  {id:"chemistry-main",kind:"bench",anchor:"chemistry-bench-main",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"quimica",rotation:0,scale:[1,1,1],bounds:[5.5,1.25,1.6],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["vidrarias","frascos"]},
  {id:"chemistry-secondary",kind:"bench",anchor:"chemistry-bench-secondary",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"quimica",rotation:0,scale:[1,1,1],bounds:[5.5,1.25,1.6],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["vidrarias","centrifuga"]},
  {id:"storage-left",kind:"cabinet",anchor:"cabinet-left",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"armazenamento",rotation:0,scale:[1,1,1],bounds:[1.1,3.1,3.2],floorOffset:0,wallOffset:.05,collision:true,decorative:false,interactive:false,contents:["reagentes"]},
  {id:"storage-right",kind:"cabinet",anchor:"cabinet-right",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"armazenamento",rotation:0,scale:[1,1,1],bounds:[1.1,3.1,3.2],floorOffset:0,wallOffset:.05,collision:true,decorative:false,interactive:false,contents:["reagentes"]},
  {id:"reactor-main",kind:"reactor",anchor:"reactor-left",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"reatores",rotation:0,scale:[1,1,1],bounds:[2.4,3.5,2.4],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["camara-de-reacao"]},
  {id:"cryo-main",kind:"cryo",anchor:"cryo-right",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"reatores",rotation:0,scale:[1,1,1],bounds:[2.2,3.3,2.2],floorOffset:0,wallOffset:0,collision:true,decorative:false,interactive:true,contents:["nucleo-criogenico"]},
  {id:"atom-display",kind:"atom",anchor:"display-pedestal-01",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"exposicao",rotation:0,scale:[1,1,1],bounds:[1.8,2.6,1.8],floorOffset:0,wallOffset:0,collision:true,decorative:true,interactive:false,contents:["modelo-atomico"]},
  {id:"server-bank",kind:"servers",anchor:"servers-rear-left",allowedSupport:"floor",requiredSupportSurface:"laboratory-floor",allowedRoom:"servidores",rotation:0,scale:[1,1,1],bounds:[3.6,3.2,1],floorOffset:0,wallOffset:.05,collision:true,decorative:false,interactive:false,contents:["servidores"]},
  ...["01","02","03","04","05","06"].map(id=>({id:`ceiling-light-${id}`,kind:"light",anchor:`ceiling-light-${id}`,allowedSupport:"ceiling",requiredSupportSurface:"laboratory-ceiling",allowedRoom:"iluminacao",rotation:0,scale:[1,1,1],bounds:[3,.15,.24],floorOffset:0,wallOffset:0,collision:false,decorative:true,interactive:false,contents:["luminaria"]}))
].map(definition=>Object.freeze(definition)));
const LAB_GENERATION_ORDER=Object.freeze([
  "determine-safe-origin","reserve-protected-footprint","clear-conflicting-world-content","generate-foundation","generate-floor",
  "generate-exterior-walls","generate-interior-walls","generate-ceiling-and-roof","generate-doors-windows-entrances-corridors",
  "generate-laboratory-furniture","generate-functional-stations","generate-periodic-table","generate-decorative-equipment",
  "generate-lighting","generate-collision-data","validate-and-repair-structure","ready-for-player"
]);
const labGenerationReport={version:LAB_VALIDATION_VERSION,seed:WORLD_SEED,order:[],repairs:[],validation:null,completedAt:0};
function resetLabGenerationReport(){labGenerationReport.version=LAB_VALIDATION_VERSION;labGenerationReport.seed=WORLD_SEED;labGenerationReport.order.length=0;labGenerationReport.repairs.length=0;labGenerationReport.validation=null;labGenerationReport.completedAt=0}
function recordLabGenerationStep(step){if(!LAB_GENERATION_ORDER.includes(step))throw new Error(`Etapa de laboratório desconhecida: ${step}`);if(!labGenerationReport.order.includes(step))labGenerationReport.order.push(step)}
const LAB_RESERVED_PATHS=Object.freeze([
  Object.freeze({id:"entrada-principal",minX:LAB_LAYOUT.cx-3,maxX:LAB_LAYOUT.cx+2,minZ:LAB_LAYOUT.cz-LAB_LAYOUT.halfD-1,maxZ:LAB_LAYOUT.cz-LAB_LAYOUT.halfD+5}),
  Object.freeze({id:"corredor-central",minX:LAB_LAYOUT.cx-2.2,maxX:LAB_LAYOUT.cx+2.2,minZ:LAB_LAYOUT.cz-LAB_LAYOUT.halfD+4,maxZ:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-2.7}),
  Object.freeze({id:"acesso-tabela",minX:LAB_LAYOUT.cx-10.8,maxX:LAB_LAYOUT.cx+10.8,minZ:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-3.1,maxZ:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-1})
]);
function boxesOverlapXZ(a,b,margin=.08){return a.minX<b.maxX-margin&&a.maxX>b.minX+margin&&a.minZ<b.maxZ-margin&&a.maxZ>b.minZ+margin}
function resolveLabPropPlacement(definition){
  const anchor=LAB_ANCHORS[definition.anchor];if(!anchor||anchor.support!==definition.allowedSupport)return null;
  const [sx,sy,sz]=definition.bounds,x=anchor.x,z=anchor.z,y=anchor.support==="ceiling"?LAB_LAYOUT.y+LAB_LAYOUT.height-sy/2-definition.floorOffset:LAB_LAYOUT.y+sy/2+definition.floorOffset,box=makeCollisionBox(x,y,z,sx,sy,sz,definition.rotation);
  const bounds=labStructureBounds(0),inside=box.minX>=bounds.left+BLOCK_SIZE&&box.maxX<=bounds.right&&box.minZ>=bounds.front+BLOCK_SIZE&&box.maxZ<=bounds.rear&&box.minY>=LAB_LAYOUT.y&&box.maxY<=LAB_LAYOUT.y+LAB_LAYOUT.height;
  if(!inside)return null;
  if(anchor.support==="floor"){for(const [px,pz] of [[box.minX+.05,box.minZ+.05],[box.maxX-.05,box.minZ+.05],[box.minX+.05,box.maxZ-.05],[box.maxX-.05,box.maxZ-.05]])if(!BDEF[getBlock(Math.floor(px),LAB_LAYOUT.y-1,Math.floor(pz))]?.solid)return null}
  if(definition.collision&&(LAB_RESERVED_PATHS.some(path=>boxesOverlapXZ(box,path))||labPropPlacements.some(placement=>placement.collision&&boxesOverlapXZ(box,placement.box))))return null;
  return {definition,anchor,x,y,z,box,collision:definition.collision}
}
function createLaboratoryDecor(){
  if(labDecorRoot){scene.remove(labDecorRoot);disposeObject(labDecorRoot)}
  labCollisionBoxes.length=0;periodicCollisionBoxes.length=0;labStationZones.length=0;labPropPlacements.length=0;labColliderIds.clear();periodicColliderIds.clear();labAtomRoot=labCryoCore=null;
  const root=new THREE.Group();root.name="Professor Carbono · Authored Laboratory";labDecorRoot=root;scene.add(root);periodicWallRoot=new THREE.Group();periodicWallRoot.name="Periodic Element Block Wall";root.add(periodicWallRoot);
  const {cx,cz,halfW,halfD,y}=LAB_LAYOUT,front=cz-halfD,metal=labMaterial(0x29373e,.72,.28),white=labMaterial(0xe5ecea,.12,.28),counter=labMaterial(0x17282e,.58,.2),teal=labMaterial(0x4ec8b4,.18,.2,0x123f39),brass=labMaterial(0xd6aa51,.78,.22),dark=labMaterial(0x111b20,.58,.22),ceramic=labMaterial(0xe4d7c7,.04,.42),violet=labMaterial(0x8069ba,.18,.25,0x211842),glass=new THREE.MeshStandardMaterial({color:0x9ee8ee,transparent:true,opacity:.28,roughness:.05,metalness:.08,depthWrite:false,depthTest:true,colorWrite:true,side:THREE.DoubleSide});
  glass.userData.intentionalTransparency=true;
  const addBox=(parent,x1,y1,z1,sx,sy,sz,material=white,ry=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);mesh.position.set(x1,y1,z1);mesh.rotation.y=ry;parent.add(mesh);return mesh};
  const addCylinder=(parent,x1,y1,z1,rt,rb,h,material=metal,segments=16)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);mesh.position.set(x1,y1,z1);parent.add(mesh);return mesh};
  const addBottleSet=(parent,x1,y1,z1,count=4)=>{for(let index=0;index<count;index++)makeBottle(parent,x1+(index-(count-1)/2)*.72,y1,z1,[0x4ed0b3,0xd46799,0x6f8ee8,0xe2c64d][index%4],.7)};
  const buildProp=placement=>{
    const {definition:def,x,z}=placement,group=new THREE.Group();group.name=def.id;group.userData={stableId:def.id,placement:{...def},anchor:def.anchor};root.add(group);
    if(def.kind==="research-wing"){
      const wing=def.wing,w=wing.bounds[0]-.15,d=wing.bounds[2]-.12,trim=labMaterial(wing.trim,.28,.31);
      addBox(group,x,y+.49,z,w,.93,d,metal);
      addBox(group,x,y+1.02,z,w,.13,d,ceramic);
      addBox(group,x,y+.65,z-d/2-.015,w,.18,.032,trim);
      makeScreen(group,x+w/2-.65,y+1.53,z+.15,.74,.49,0,wing.trim);
      const sign=nameSprite(wing.title,wing.sign);
      const subtitle=nameSprite(wing.kind==="minerals"?"Espectrometria · acervo":wing.kind==="water"?"Purificação · destilação":"Microscopia · amostras",wing.sign);
      subtitle.position.set(x,y+2.06,z+.05);subtitle.scale.set(2.6,.50,1);group.add(subtitle);
      sign.position.set(x,y+2.4,z+.05);sign.scale.set(3.05,.74,1);group.add(sign);
      if(wing.kind==="minerals"){
        for(const [i,form] of [0,1,2].entries()){
          const xx=x-1.43+i*.53;
          addBox(group,xx,y+1.14,z-.16,.39,.12,.46,dark);
          const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.16+form*.025,0),[brass,violet,trim][i]);
          crystal.position.set(xx,y+1.38,z-.16);crystal.rotation.z=.25+form*.19;group.add(crystal);
        }
        addCylinder(group,x+.28,y+1.21,z-.19,.24,.28,.17,metal,12);
      }else if(wing.kind==="water"){
        for(const [i,color] of [0x995a36,0x6a9cae,0x58ceeb].entries()){
          const xx=x-1.3+i*.59;
          makeBottle(group,xx,y+1.36,z-.16,color,.8);
          addCylinder(group,xx,y+1.18,z-.16,.14,.18,.06,metal,8);
        }
        addBox(group,x+.03,y+1.71,z-.14,1.05,.075,.13,trim);
        addCylinder(group,x+.36,y+1.42,z-.16,.13,.13,.48,glass,8);
      }else{
        addBox(group,x-1.45,y+1.24,z-.07,.61,.29,.63,dark);
        addBox(group,x-1.2,y+1.53,z+.05,.13,.55,.16,metal);
        addCylinder(group,x-1.4,y+1.73,z-.09,.095,.14,.36,trim,9);
        for(const [i,color] of [0x6aa36b,0xbf8ec1,0x65ddad].entries()){
          const xx=x-.38+i*.33;
          addBox(group,xx,y+1.14,z-.12,.27,.09,.53,trim);
          addBox(group,xx,y+1.26,z-.12,.20,.10,.43,labMaterial(color,.05,.5));
        }
      }
      addLabStation(x,z,2.72,wing.stations,def.id);
    }
    else if(def.kind==="reception"){addBox(group,x,y+.55,z,6,1.05,1.35,counter);addBox(group,x,y+1.14,z,6.15,.14,1.48,white);makeScreen(group,x+1.6,y+1.63,z-.72,1.18,.55,0,0x70f2cf);makeBottle(group,x-1.8,y+1.38,z-.2,0x57cde2,.82);addLabStation(x,z,3.3,["sample_storage"],def.id)}
    else if(def.kind==="bench"){addBox(group,x,y+.5,z,5.35,.94,1.48,dark);addBox(group,x,y+1.04,z,5.5,.14,1.6,ceramic);addBottleSet(group,x,y+1.35,z-.15,5);addLabStation(x,z,3,def.id==="chemistry-main"?["chemistry_workbench","bunsen_burner","ventilation_hood"]:["centrifuge","microscope","precision_balance"],def.id)}
    else if(def.kind==="console"){addBox(group,x,y+.52,z,4.35,.98,1.35,metal);addBox(group,x,y+1.08,z,4.48,.14,1.48,counter);makeScreen(group,x,y+1.62,z-.74,1.6,.65,0,def.id.includes("instrumental")?0x8797ff:0x63ecd3);addLabStation(x,z,2.6,def.id.includes("instrumental")?["spectrometer","electrolysis"]:["distillation","water_purification"],def.id)}
    else if(def.kind==="cabinet"){addBox(group,x,y+1.55,z,1,3,3.05,white);addBox(group,x+(x<cx?.51:-.51),y+1.55,z,.045,2.6,2.7,glass);for(let row=0;row<3;row++)makeBottle(group,x+(x<cx?.57:-.57),y+.65+row*.76,z-.7,[0x4ed0b3,0xd46799,0x6f8ee8][row],.55)}
    else if(def.kind==="reactor"){addCylinder(group,x,y+1.65,z,1.05,1.15,3.15,metal,20);addCylinder(group,x,y+1.7,z,.72,.72,1.75,glass,20);for(let index=0;index<3;index++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.9,.045,8,32),index===1?brass:teal);ring.rotation.x=Math.PI/2;ring.position.set(x,y+.75+index*.93,z);group.add(ring)}addLabStation(x,z,2.3,["chemical_reactor","laboratory_furnace"],def.id)}
    else if(def.kind==="cryo"){addCylinder(group,x,y+1.58,z,.94,1.04,3,white,20);addCylinder(group,x,y+1.6,z,.75,.75,2.35,glass,20);const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.46,1),violet);core.position.set(x,y+1.62,z);core.userData.cryoCore=true;labCryoCore=core;group.add(core);addLabStation(x,z,2.2,["refrigeration"],def.id)}
    else if(def.kind==="atom"){addBox(group,x,y+.32,z,1.75,.64,1.75,dark);addBox(group,x,y+.7,z,1.82,.1,1.82,brass);const atom=new THREE.Group();atom.position.set(x,y+1.65,z);group.add(atom);const nucleus=new THREE.Mesh(new THREE.IcosahedronGeometry(.24,1),teal);atom.add(nucleus);for(let index=0;index<3;index++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.022,8,42),index===1?brass:teal);ring.rotation.set(index*.92,index*.61,index*.38);atom.add(ring)}atom.userData.labAtom=true;labAtomRoot=atom}
    else if(def.kind==="servers"){for(let index=0;index<3;index++){const xx=x-1.15+index*1.15;addBox(group,xx,y+1.55,z,1.02,3.05,.9,metal);makeScreen(group,xx,y+1.95,z-.46,.7,.42,0,[0x63ecd3,0x8797ff,0xe28ad0][index])}}
    else if(def.kind==="light"){addBox(group,x,LAB_LAYOUT.y+LAB_LAYOUT.height-.18,z,3,.08,.22,teal);const light=new THREE.PointLight(0x79e8d3,.5,9,2);light.position.set(x,LAB_LAYOUT.y+LAB_LAYOUT.height-.55,z);group.add(light)}
    if(def.collision)registerLabCollision(placement.x,placement.y,placement.z,...def.bounds,def.rotation,def.id);
    labPropPlacements.push({...placement,group})
  };
  for(const definition of LAB_PROP_DEFINITIONS.filter(item=>!["atom","light"].includes(item.kind))){const placement=resolveLabPropPlacement(definition);if(!placement){console.warn(`[QuimiCraft][Laboratório] Prop ignorado por validação: ${definition.id}`);continue}buildProp(placement)}
  recordLabGenerationStep("generate-laboratory-furniture");
  recordLabGenerationStep("generate-functional-stations");
addBox(root,labDoor.minX-.42,y+1.62,front+.12,.26,3.24,.42,metal);
  addBox(root,labDoor.maxX+.42,y+1.62,front+.12,.26,3.24,.42,metal);
  addBox(root,labDoor.center,y+3.76,front+.08,5.1,.22,.36,metal);
  addBox(root,labDoor.center,y+3.58,front-.14,4.9,.09,.42,teal);
  labDoor.attach(root,{metal,teal,brass,glass});
  const entrySign=nameSprite("LABORATÓRIO CARBONO","#d4fff2");
  entrySign.position.set(labDoor.center,y+4.38,front-.22);
  entrySign.scale.set(5.1,1.25,1);
  root.add(entrySign);
  refreshPeriodicWall();
  recordLabGenerationStep("generate-periodic-table");
  for(const definition of LAB_PROP_DEFINITIONS.filter(item=>item.kind==="atom")){const placement=resolveLabPropPlacement(definition);if(placement)buildProp(placement);else console.warn(`[QuimiCraft][Laboratório] Prop decorativo ignorado: ${definition.id}`)}
  recordLabGenerationStep("generate-decorative-equipment");
  for(const definition of LAB_PROP_DEFINITIONS.filter(item=>item.kind==="light")){const placement=resolveLabPropPlacement(definition);if(placement)buildProp(placement);else console.warn(`[QuimiCraft][Laboratório] Luminária ignorada: ${definition.id}`)}
  recordLabGenerationStep("generate-lighting");
  recordLabGenerationStep("generate-collision-data");
  root.traverse(object=>{if(object.isMesh){object.castShadow=settings.shadows>0;object.receiveShadow=settings.shadows>0;object.visible=true;if(object.material&&!Array.isArray(object.material)&&!object.material.transparent){object.material.opacity=1;object.material.depthWrite=true;object.material.depthTest=true;object.material.colorWrite=true}}})
}
function updateLabDecor(now,dt){
  if(labAtomRoot){
    labAtomRoot.rotation.y=now*.00035;
    labAtomRoot.children.slice(1).forEach((r,i)=>r.rotation.z+=(.12+i*.048)*dt);
  }
  if(labCryoCore){
    labCryoCore.rotation.y=now*.0007;
    labCryoCore.scale.setScalar(1+Math.sin(now*.003)*.06);
  }
  if(labDoor.moving&&labDoor.update(dt,labDoorBodies())){
    storeLabDoor(true);
    toast("A porta reabriu para liberar a passagem.");
  }
}
function buildLaboratoryRequirements(){
  const {cx,cz,halfW,halfD,y,height}=LAB_LAYOUT,left=cx-halfW,right=cx+halfW,front=cz-halfD,rear=cz+halfD,requirements=[],foundationCells=new Set();
  const add=(component,x,yy,z,id)=>requirements.push({component,x,y:yy,z,id});
  const addFoundation=(x,z)=>{const key=`${x},${z}`;if(!foundationCells.has(key)){foundationCells.add(key);add("foundation",x,1,z,BLOCK.DEEPSTONE)}};
  for(let x=left-LAB_PROTECTION_MARGIN;x<=right+LAB_PROTECTION_MARGIN;x++)for(let z=front-LAB_PROTECTION_MARGIN;z<=rear+LAB_PROTECTION_MARGIN;z++)addFoundation(x,z);
  for(let x=left;x<=right;x++)for(let z=front;z<=rear;z++){
    add("floor",x,y-1,z,QuimiCraftLaboratory.floorBlock(LAB_LAYOUT,BLOCK,x,z));
    const skylight=Math.abs(x-cx)<=12&&[0,1,2].includes(Math.abs((z-cz)%5))&&Math.abs(z-cz)<halfD-1;
    add("ceiling",x,y+height,z,skylight?BLOCK.GLASS:BLOCK.SLATE)
  }
  for(let level=0;level<height;level++){
    for(let x=left;x<=right;x++)for(const z of [front,rear]){
      const doorCell=labDoor.isCell(x,y+level,z),transom=z===front&&x>=labDoor.minX&&x<labDoor.maxX&&level===labDoor.height,frontWindow=z===front&&level>=3&&level<=8&&Math.abs(x-cx)>5&&Math.abs(x-cx)<halfW-1,backTable=z===rear&&Math.abs(x-cx)<=11;
      add(doorCell?"door":"exterior-wall",x,y+level,z,doorCell?null:(transom||frontWindow?BLOCK.GLASS:(backTable?BLOCK.SLATE:(level===0?BLOCK.SLATE:BLOCK.MARBLE))))
    }
    for(let z=front+1;z<rear;z++)for(const x of [left,right]){
      const window=level>=2&&level<=8&&z>front+2&&z<rear-2&&((z-front)%4!==0);
      add("exterior-wall",x,y+level,z,window?BLOCK.GLASS:(level===0?BLOCK.SLATE:BLOCK.MARBLE))
    }
  }
  for(let step=1;step<=LAB_ENTRANCE_LENGTH;step++){
    const z=front-step,surface=LAB_LAYOUT.entranceSurfaces.get(z);
    for(let x=cx-4;x<=cx+3;x++){addFoundation(x,z);add("entrance-corridor",x,surface,z,BLOCK.ALCHEMY_BRICK)}
  }
  for(const [coordinate,surface] of LAB_LAYOUT.villagePathSurfaces){
    const [x,z]=coordinate.split(",").map(Number);addFoundation(x,z);if(!inLabEntranceCorridor(x,z)&&!labBoundsContains(x,z,0))add("village-transition",x,surface,z,BLOCK.VILLAGE_BRICK)
  }
  return requirements
}
function rebuildLaboratoryChunks(){
  for(const descriptor of labChunkDescriptors())if(chunks.has(descriptor.k))rebuildChunk(descriptor.cx,descriptor.cz)
}
function validateLaboratory({repair=true,recordStep=true}={}){
  const requirements=buildLaboratoryRequirements(),requirementCoordinates=new Set(requirements.map(required=>key3(required.x,required.y,required.z))),failures=[],repairedComponents=new Set();
  for(const required of requirements){
    const actual=getBlock(required.x,required.y,required.z),valid=required.component==="door"?[BLOCK.DOOR,BLOCK.DOOR_OPEN].includes(actual):actual===required.id;
    if(valid)continue;
    failures.push({...required,actual});
    if(repair){
      const replacement=required.component==="door"?BLOCK.DOOR:required.id;
      labRepairOverrides.set(key3(required.x,required.y,required.z),replacement);
      repairedComponents.add(required.component)
    }
  }
  const periodicMeshes=[];periodicWallRoot?.traverse(object=>{if(object.isMesh&&Number.isInteger(object.userData?.atomicNumber))periodicMeshes.push(object)});
  const periodicNumbers=new Set(periodicMeshes.map(mesh=>mesh.userData.atomicNumber)),periodicPositions=new Set(periodicMeshes.map(mesh=>`${mesh.position.x}|${mesh.position.y}|${mesh.position.z}`));
  const periodicDimensionsValid=periodicMeshes.every(mesh=>{
    mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox,size=new THREE.Vector3();box.getSize(size);
    return mesh.scale.x===1&&mesh.scale.y===1&&mesh.scale.z===1&&Math.abs(size.x-BLOCK_SIZE)<1e-8&&Math.abs(size.y-BLOCK_SIZE)<1e-8&&Math.abs(size.z-BLOCK_SIZE)<1e-8
  });
  const periodicColliderById=new Map(periodicCollisionBoxes.map(box=>[box.id,box])),periodicColliderDimensionsValid=periodicCollisionBoxes.every(box=>Math.abs(box.maxX-box.minX-BLOCK_SIZE)<1e-8&&Math.abs(box.maxY-box.minY-BLOCK_SIZE)<1e-8&&Math.abs(box.maxZ-box.minZ-BLOCK_SIZE)<1e-8),periodicColliderAlignmentValid=periodicMeshes.every(mesh=>{const collider=periodicColliderById.get(`element:${mesh.userData.atomicNumber}`);return collider&&Math.abs((collider.minX+collider.maxX)/2-mesh.position.x)<1e-8&&Math.abs((collider.minY+collider.maxY)/2-mesh.position.y)<1e-8&&Math.abs((collider.minZ+collider.maxZ)/2-mesh.position.z)<1e-8});
  const propsInsideAndSupported=labPropPlacements.every(placement=>{
    const def=placement.definition,bounds=labStructureBounds(0),inside=placement.box.minX>=bounds.left+BLOCK_SIZE&&placement.box.maxX<=bounds.right&&placement.box.minZ>=bounds.front+BLOCK_SIZE&&placement.box.maxZ<=bounds.rear;
    const supported=def.allowedSupport==="ceiling"?Math.abs(placement.box.maxY-(LAB_LAYOUT.y+LAB_LAYOUT.height))<1e-7:Math.abs(placement.box.minY-LAB_LAYOUT.y)<1e-7;
    return inside&&supported&&!LAB_RESERVED_PATHS.some(path=>placement.collision&&boxesOverlapXZ(placement.box,path))
  });
  const propIds=labPropPlacements.map(placement=>placement.definition.id),uniquePropIds=new Set(propIds),requiredPropIds=LAB_PROP_DEFINITIONS.map(definition=>definition.id);
  const collidingProps=labPropPlacements.filter(placement=>placement.collision),labColliderById=new Map(labCollisionBoxes.map(box=>[box.id,box])),labColliderAlignmentValid=collidingProps.every(placement=>{const collider=labColliderById.get(placement.definition.id),expected=placement.box;return collider&&["minX","maxX","minY","maxY","minZ","maxZ"].every(key=>Math.abs(collider[key]-expected[key])<1e-8)});
  const materialsValid=(()=>{
    let valid=true;
    labDecorRoot?.traverse(object=>{
      if(!object.isMesh)return;
      if(!object.visible||object.scale.x===0||object.scale.y===0||object.scale.z===0){valid=false;return}
      const materials=Array.isArray(object.material)?object.material:[object.material];
      for(const material of materials){
        if(!material||material.visible===false||material.depthTest===false||material.colorWrite===false){valid=false;continue}
        if(!material.userData?.intentionalTransparency&&(material.transparent||material.opacity!==1||material.depthWrite===false))valid=false
      }
    });
    return valid
  })();
  const terrainMaterialValid=terrainMat.visible!==false&&terrainMat.opacity===1&&terrainMat.transparent===false&&terrainMat.depthWrite===true&&terrainMat.depthTest===true&&terrainMat.colorWrite===true&&terrainMat.side===THREE.FrontSide;
  const {cx,cz,halfD,y}=LAB_LAYOUT,front=cz-halfD,doorMetadataValid=labDoor.cells.every(({x,y,z,half})=>{const meta=doorMeta.get(key3(x,y,z));return meta?.group==="carbon-main-airlock"&&meta.half===half}),doorApproaches=[front-1,front+1].every(z=>BDEF[getBlock(cx-1,y-1,z)]?.solid&&!BDEF[getBlock(cx-1,y,z)]?.solid&&!BDEF[getBlock(cx-1,y+1,z)]?.solid&&!aabbHitsLabDecor(cx-1.8,cx-.2,y,y+1.75,z-.4,z+.4)),doorAccessible=doorMetadataValid&&doorApproaches;
  const professorAnchor=LAB_ANCHORS["professor-position"],professorRouteStart={x:cx-1,z:front+2},professorReachable=Array.from({length:12},(_,index)=>{const t=index/11,x=lerp(professorRouteStart.x,professorAnchor.x,t),z=lerp(professorRouteStart.z,professorAnchor.z,t);return !aabbHitsLabDecor(x-.32,x+.32,y,y+1.75,z-.32,z+.32)&&!BDEF[getBlock(Math.floor(x),y,Math.floor(z))]?.solid&&!BDEF[getBlock(Math.floor(x),y+1,Math.floor(z))]?.solid}).every(Boolean);
  const chemistryBench=labPropPlacements.find(placement=>placement.definition.id==="chemistry-main"),chemistryWorkbenchReachable=!!chemistryBench&&[[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dz])=>{const offset=(Math.max(chemistryBench.definition.bounds[0],chemistryBench.definition.bounds[2])/2)+.8,x=chemistryBench.x+dx*offset,z=chemistryBench.z+dz*offset;return !aabbHitsLabDecor(x-.3,x+.3,y,y+1.75,z-.3,z+.3)&&!BDEF[getBlock(Math.floor(x),y,Math.floor(z))]?.solid});
  const checks={
    originGridAligned:Number.isInteger(LAB_LAYOUT.cx)&&Number.isInteger(LAB_LAYOUT.cz)&&Number.isInteger(LAB_LAYOUT.y),
    baseElevationSafe:LAB_LAYOUT.y>WATER_LEVEL&&LAB_LAYOUT.y+LAB_LAYOUT.height<MAX_Y,
    footprintSamples:LAB_LAYOUT.terrain.sampleCount,
    requiredVoxelCount:requirements.length,
    uniqueRequiredVoxelCoordinates:requirementCoordinates.size,
    duplicateRequiredVoxelCoordinates:requirements.length-requirementCoordinates.size,
    structuralFailures:failures.length,
    foundationCount:requirements.filter(item=>item.component==="foundation").length,
    floorCount:requirements.filter(item=>item.component==="floor").length,
    ceilingCount:requirements.filter(item=>item.component==="ceiling").length,
    exteriorWallCount:requirements.filter(item=>item.component==="exterior-wall").length,
    interiorWallCount:0,
    interiorLayout:"open-plan",
    doorAccessible,
    periodicElementCount:periodicMeshes.length,
    uniquePeriodicElements:periodicNumbers.size,
    uniquePeriodicPositions:periodicPositions.size,
    periodicColliderCount:periodicCollisionBoxes.length,
    periodicDimensionsValid,
    periodicColliderDimensionsValid,
    periodicColliderAlignmentValid,
    periodicFloorClearance:Math.min(...periodicMeshes.map(mesh=>mesh.position.y-BLOCK_SIZE/2))-LAB_LAYOUT.y,
    periodicCeilingClearance:LAB_LAYOUT.y+LAB_LAYOUT.height-Math.max(...periodicMeshes.map(mesh=>mesh.position.y+BLOCK_SIZE/2)),
    labColliderCount:labCollisionBoxes.length,
    uniqueLabColliders:labColliderIds.size,
    labColliderAlignmentValid,
    labColliderCountMatchesProps:labCollisionBoxes.length===collidingProps.length,
    propCount:propIds.length,
    uniquePropCount:uniquePropIds.size,
    propsInsideAndSupported,
    allRequiredPropsPlaced:requiredPropIds.every(id=>uniquePropIds.has(id)),
    materialsValid,
    terrainMaterialValid,
    chemistryWorkbenchReady:labStationZones.length>=4,
    chemistryWorkbenchReachable,
    professorReachable
  };
  const periodicInvalid=periodicMeshes.length!==118||periodicNumbers.size!==118||periodicPositions.size!==118||periodicCollisionBoxes.length!==118||!periodicDimensionsValid||!periodicColliderDimensionsValid||!periodicColliderAlignmentValid||checks.periodicFloorClearance<PERIODIC_FLOOR_MARGIN||checks.periodicCeilingClearance<0;
  const decorInvalid=labCollisionBoxes.length!==labColliderIds.size||labCollisionBoxes.length!==collidingProps.length||!labColliderAlignmentValid||uniquePropIds.size!==propIds.length||!checks.allRequiredPropsPlaced||!propsInsideAndSupported||!materialsValid||!checks.chemistryWorkbenchReady;
  if(repair&&!doorMetadataValid){
    const open=readLabDoor();
    storeLabDoor(open,true);
    labDoor.snap(open);
    saveMods();
    repairedComponents.add("main-airlock");
  }
  if(repair&&decorInvalid){createLaboratoryDecor();repairedComponents.add("laboratory-props-and-collisions")}
  else if(repair&&periodicInvalid){refreshPeriodicWall();repairedComponents.add("periodic-table")}
  const valid=failures.length===0&&requirementCoordinates.size===requirements.length&&checks.originGridAligned&&checks.baseElevationSafe&&doorAccessible&&!periodicInvalid&&labCollisionBoxes.length===labColliderIds.size&&labCollisionBoxes.length===collidingProps.length&&labColliderAlignmentValid&&uniquePropIds.size===propIds.length&&checks.allRequiredPropsPlaced&&propsInsideAndSupported&&materialsValid&&terrainMaterialValid&&checks.chemistryWorkbenchReady&&chemistryWorkbenchReachable&&professorReachable;
  if(repairedComponents.size){
    for(const component of repairedComponents){labGenerationReport.repairs.push(component);console.warn(`[QuimiCraft][Laboratório] Componente reparado: ${component}`)}
    rebuildLaboratoryChunks()
  }
  const report={valid:valid&&(!repair||repairedComponents.size===0),repaired:repairedComponents.size>0,checks,failures:failures.slice(0,20),repairCount:repairedComponents.size};
  labGenerationReport.validation=report;if(recordStep)recordLabGenerationStep("validate-and-repair-structure");
  return report
}
function seedLaboratory(){
  resetLabGenerationReport();labRepairOverrides.clear();
  const {cx,cz,halfW,halfD,y,height}=LAB_LAYOUT,front=cz-halfD,left=cx-halfW,right=cx+halfW,rear=cz+halfD;
  recordLabGenerationStep("determine-safe-origin");
  recordLabGenerationStep("reserve-protected-footprint");
  const doorWasOpen=readLabDoor();
  for(const k of [...mods.keys()]){
    const [x,yy,z]=k.split("|").map(Number);
    if(((x>=left-LAB_PROTECTION_MARGIN&&x<=right+LAB_PROTECTION_MARGIN&&z>=front-LAB_PROTECTION_MARGIN&&z<=rear+LAB_PROTECTION_MARGIN)||inLabEntranceCorridor(x,z,1)||inLabVillagePath(x,z))&&yy>=0&&yy<MAX_Y)mods.delete(k)
  }
  for(const [k] of [...doorMeta]){
    const [x,yy,z]=k.split("|").map(Number);
    if(((x>=left-LAB_PROTECTION_MARGIN&&x<=right+LAB_PROTECTION_MARGIN&&z>=front-LAB_PROTECTION_MARGIN&&z<=rear+LAB_PROTECTION_MARGIN)||inLabEntranceCorridor(x,z,1)||inLabVillagePath(x,z))&&yy>=0&&yy<MAX_Y)doorMeta.delete(k)
  }
  recordLabGenerationStep("clear-conflicting-world-content");
  recordLabGenerationStep("generate-foundation");
  recordLabGenerationStep("generate-floor");
  recordLabGenerationStep("generate-exterior-walls");
  recordLabGenerationStep("generate-interior-walls");
  recordLabGenerationStep("generate-ceiling-and-roof");
  storeLabDoor(doorWasOpen,true);
  labDoor.snap(doorWasOpen);
  recordLabGenerationStep("generate-doors-windows-entrances-corridors");
  saveMods();createLaboratoryDecor();
  const validation=validateLaboratory();
  localStorage.qc_lab_validation_v60=JSON.stringify({version:LAB_VALIDATION_VERSION,seed:WORLD_SEED,origin:{x:cx,y,z:cz},terrain:LAB_LAYOUT.terrain,propIds:labPropPlacements.map(placement=>placement.definition.id),validation,order:labGenerationReport.order});
  rebuildLaboratoryChunks();
  return validation
}
function seedVillage(){
  if(VILLAGE.version===3)return validateVillage();
  for(const building of LEGACY_VILLAGE_BUILDINGS){
    const x=building.x,z=building.z-3,y=VILLAGE.base+1,wasOpen=[y,y+1].some(yy=>mods.get(key3(x,yy,z))===BLOCK.DOOR_OPEN);
    for(const [yy,half] of [[y,0],[y+1,1]]){const k=key3(x,yy,z);mods.set(k,wasOpen?BLOCK.DOOR_OPEN:BLOCK.DOOR);doorMeta.set(k,{axis:0,half,hinge:-1,swing:1,group:`village-${building.gx}-${building.gz}`})}
  }
  for(let i=-2;i<=2;i++)for(const side of [-1,1]){const x=VILLAGE.x+i*VILLAGE.spacing+side*4,z=VILLAGE.z+5,y=VILLAGE.base+1;mods.set(key3(x,y,z),BLOCK.SPECTRAL)}
  localStorage.qc_village_v44="1";saveMods();return validateVillage()
}
function validateVillage(){
  const failures=[];
  const main=villages.main();
  if(main){
    for(const b of main.buildings){
      for(let y=b.y+1;y<=b.y+2;y++){
        if(villages.blockAt(b.doorX,y,b.doorZ)!==BLOCK.DOOR||!villages.doorAt(b.doorX,y,b.doorZ))failures.push({component:"door",x:b.doorX,y,z:b.doorZ});
      }
      if(!BDEF[villages.blockAt(b.x,b.y,b.z)]?.solid)failures.push({component:"foundation",x:b.x,y:b.y,z:b.z});
    }
    return {version:75,valid:!failures.length&&main.buildings.filter(b=>b.shop).length===5&&main.road.size>60,
      buildingCount:main.buildings.length,houseCount:main.buildings.filter(b=>b.kind==="house").length,civicCount:main.civic.length,shopCount:5,failures};
  }
  const VILLAGE_BUILDINGS=LEGACY_VILLAGE_BUILDINGS;
  for(const building of VILLAGE_BUILDINGS){
    const x=building.x,z=building.z-3,y=VILLAGE.base+1;
    for(const yy of [y,y+1])if(![BLOCK.DOOR,BLOCK.DOOR_OPEN].includes(getBlock(x,yy,z)))failures.push({component:"door",x,y:yy,z});
    const wallChecks=[[building.x-3,VILLAGE.base+2,building.z],[building.x+3,VILLAGE.base+2,building.z],[building.x,VILLAGE.base+2,building.z+3]];
    for(const [wx,wy,wz] of wallChecks)if(!BDEF[getBlock(wx,wy,wz)]?.solid)failures.push({component:"wall",x:wx,y:wy,z:wz})
  }
  const roadChecks=[];for(let x=VILLAGE.x-25;x<=VILLAGE.x+25;x+=5)roadChecks.push([x,VILLAGE.z]);for(let z=VILLAGE.z-25;z<=VILLAGE.z+25;z+=5)roadChecks.push([VILLAGE.x,z]);
  for(const [x,z] of roadChecks)if(!BDEF[getBlock(x,VILLAGE.base,z)]?.solid)failures.push({component:"road",x,y:VILLAGE.base,z});
  const report={version:60,valid:failures.length===0,buildingCount:VILLAGE_BUILDINGS.length,houseCount:VILLAGE_BUILDINGS.filter(building=>building.kind==="house").length,shopCount:VILLAGE_BUILDINGS.filter(building=>building.kind==="shop").length,doorColliderCount:VILLAGE_BUILDINGS.length*2,failures:failures.slice(0,20)};
  localStorage.qc_village_state_v60=JSON.stringify(report);return report
}
function parseWorldState(){
  let saved=null,sourceVersion=70;
  try{saved=JSON.parse(localStorage.qc_world_state_v70||"null")}catch(error){console.warn("[QuimiCraft][Carregamento] O save v7 está intacto, mas não pôde ser lido; tentando a versão anterior.",error);messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"O salvamento científico não pôde ser migrado. A cópia original foi preservada e o jogo tentará carregar o mundo anterior."})}
  if(!saved){sourceVersion=60;try{saved=JSON.parse(localStorage.qc_world_state_v60||"null")}catch(error){console.warn("[QuimiCraft][Carregamento] Save de mundo anterior inválido; usando valores seguros sem apagar o arquivo.",error);messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"O salvamento anterior não pôde ser lido. Os dados originais foram preservados."})}}
  if(!saved||saved.seed!==WORLD_SEED)return null;
  const anchor=saved.bedSpawn;
  if(anchor&&[anchor.x,anchor.y,anchor.z,anchor.id].every(Number.isSafeInteger)&&anchor.y>0&&anchor.y<MAX_Y&&
    Math.abs(anchor.x)<8e6&&Math.abs(anchor.z)<8e6&&BDEF[anchor.id]?.bed?.head===false)
    bedSpawn={x:anchor.x,y:anchor.y,z:anchor.z,id:anchor.id};
  for(const key of Array.isArray(saved.harvestedScreamers)?saved.harvestedScreamers:[]){
    if(typeof key==="string"&&/^-?\d+,-?\d+$/.test(key))harvestedScreamers.add(key);
  }
  if(saved.player&&Number.isFinite(saved.player.x)&&Number.isFinite(saved.player.z))worldBoot.preferredSpawn={x:saved.player.x,z:saved.player.z};
  if(saved.player){player.health=clamp(Number(saved.player.health)||100,1,100);const mana=saved.player.mana;player.mana=clamp(mana==null||mana===""||!Number.isFinite(Number(mana))?100:Number(mana),0,100);player.hunger=clamp(Number(saved.player.hunger??100),0,100);player.thirst=clamp(Number(saved.player.thirst??100),0,100);player.breath=clamp(Number(saved.player.breath??playerBreathMax()),0,playerBreathMax())}
  if(Number.isFinite(saved.day))state.day=clamp(saved.day,0,.999999);
  if(Number.isInteger(saved.dayCount)&&saved.dayCount>0)state.dayCount=saved.dayCount;
  if(Number.isFinite(saved.climateElapsed))climateState.elapsed=Math.max(0,saved.climateElapsed);
  if(saved.gamemode==="creative"||saved.gamemode==="survival"){state.gamemode=saved.gamemode;if(state.gamemode==="creative")dev.fly=true}
  explorationSurvey.load(saved.explorationMap);
  explorationWaypoints.load(saved.explorationWaypoints);
  if(saved.science){try{scienceSystem?.importState(saved.science)}catch(error){console.warn("[QuimiCraft][Ciência] Estado científico inválido; usando valores padrão sem alterar o save original.",error);messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"Os dados científicos deste mundo não puderam ser migrados. O restante do mundo foi carregado normalmente."})}}
  if(sourceVersion<70)messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"Mundo anterior carregado com migração segura para o sistema científico v7.0."});
  return saved
}
function saveWorldState(){
  professions.persist();
  const data={version:70,seed:WORLD_SEED,player:{x:player.pos.x,y:player.pos.y,z:player.pos.z,health:player.health,mana:player.mana,hunger:player.hunger,thirst:player.thirst,breath:player.breath},day:state.day,dayCount:state.dayCount,climateElapsed:climateState.elapsed,laboratory:{validationVersion:LAB_VALIDATION_VERSION,origin:{x:LAB_LAYOUT.cx,y:LAB_LAYOUT.y,z:LAB_LAYOUT.cz},valid:!!labGenerationReport.validation?.valid,props:labPropPlacements.map(placement=>placement.definition.id)},village:{version:60,generated:true},periodicTable:elementMissions?.exportState?.()||null,science:scienceSystem?.exportState?.()||null,breeding:breeding.save(),savedAt:Date.now()};
  if(riding)Object.assign(data.player,{x:riding.safe.x,y:riding.safe.y,z:riding.safe.z});
  data.expeditions=snapshotMounts();
  data.bedSpawn=bedSpawn;
  data.harvestedScreamers=[...harvestedScreamers];
  data.explorationMap=explorationSurvey.save();
  data.explorationWaypoints=explorationWaypoints.save();
  data.gamemode=state.gamemode;
  if(switchingWorld)return false;
  alchemyProgress.persist();
  persistVehicles();
  saveMods();
  try{localStorage.qc_landscape=String(VILLAGE.version);localStorage.qc_world_state_v70=JSON.stringify(data);scienceSystem?.persist?.(true);return true}
  catch(error){reportSaveIssue("O estado do mundo ainda não foi gravado. Exporte uma cópia antes de sair.",error);return false}
}
function nextRenderFrame(){return new Promise(resolve=>(window.requestAnimationFrame||window.setTimeout)(resolve))}
function addBootRequiredChunks(stageId,descriptors){
  worldBoot.stageChunkKeys=new Set(descriptors.map(descriptor=>descriptor.k));
  for(const descriptor of descriptors){const previous=worldBoot.requiredChunks.get(descriptor.k);if(!previous||descriptor.d<previous.d)worldBoot.requiredChunks.set(descriptor.k,descriptor)}
  setBootStage(stageId,0,`0 / ${worldBoot.stageChunkKeys.size} chunks`);centerChunk.x=999;centerChunk.z=999;ensureChunks(true);updateBootChunkProgress()
}
function waitForBootChunks(stageId,descriptors,idleTimeoutMs=45000){
  addBootRequiredChunks(stageId,descriptors);
  return new Promise((resolve,reject)=>{
    let lastProgress=performance.now(),previousMissing=descriptors.length+1;
    const check=()=>{
      if(!worldBoot.running)return reject(new Error("carregamento cancelado"));
      let missing=0;
      for(const q of descriptors)if(!chunks.has(q.k))missing++;
      const now=performance.now();
      if(missing<previousMissing||document.hidden){lastProgress=now;previousMissing=missing}
      if(!missing)return resolve();
      if(now-lastProgress>idleTimeoutMs)return reject(new Error(`${missing} chunks pendentes sem progresso`));
      (window.requestAnimationFrame||window.setTimeout)(check)
    };
    check();
  })
}
async function runBootStage(stageId,task,maxRetries=2){
  let lastError=null;
  for(let attempt=0;attempt<=maxRetries;attempt++){
    worldBoot.attempt=attempt+1;setBootStage(stageId,0,attempt?`tentativa ${attempt+1}`:"");
    try{const result=await task(attempt);worldBoot.completedStages.add(stageId);setBootStage(stageId,1);return result}
    catch(error){lastError=error;console.warn(`[QuimiCraft][Carregamento] Falha na etapa “${stageId}” (tentativa ${attempt+1}/${maxRetries+1}).`,error);if(attempt<maxRetries)await nextRenderFrame()}
  }
  throw lastError||new Error(`Falha na etapa ${stageId}`)
}
function playerAreaDescriptors(){
  const preferred=worldBoot.preferredSpawn||spawn,cx=Math.floor(preferred.x/CHUNK),cz=Math.floor(preferred.z/CHUNK);
    const initial=ringChunkKeys(cx,cz,2);
  const fallbackX=Math.floor(spawn.x/CHUNK),fallbackZ=Math.floor(spawn.z/CHUNK);
  if(Math.abs(cx-fallbackX)>1||Math.abs(cz-fallbackZ)>1){
    const keys=new Set(initial.map(q=>q.k));
    for(const q of ringChunkKeys(fallbackX,fallbackZ,1))if(!keys.has(q.k))initial.push(q);
  }
  return initial
}
function villageAreaDescriptors(){
  const chunksByKey=new Map(),main=villages.main();
  const buildings=main?.buildings||LEGACY_VILLAGE_BUILDINGS;
  for(const building of buildings){
    for(let x=Math.floor((building.x-4)/CHUNK);x<=Math.floor((building.x+4)/CHUNK);x++){
      for(let z=Math.floor((building.z-4)/CHUNK);z<=Math.floor((building.z+4)/CHUNK);z++){
        const k=ckey(x,z);
        chunksByKey.set(k,{cx:x,cz:z,k,d:1});
      }
    }
  }
  if(main)for(const coord of main.road.keys()){
    const [x,z]=coord.split(",").map(Number),cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),k=ckey(cx,cz);
    if(!chunksByKey.has(k))chunksByKey.set(k,{cx,cz,k,d:2});
  }
  return [...chunksByKey.values()];
}
function validateReadyWorld(){
  const lab=validateLaboratory({repair:false}),village=validateVillage(),missions=elementMissions.validateDefinitions(),allChunks=initialPreloadDescriptors().every(descriptor=>chunks.has(descriptor.k))&&areaReady(chunkPosition(player.pos)),professor=npcs.find(npc=>npc.role==="carbon");
  return {valid:lab.valid&&village.valid&&missions.valid&&allChunks&&!!professor&&labStationZones.length>=4,lab,village,missions,allChunks,professorReady:!!professor,chemistryReady:labStationZones.length>=4}
}
async function startWorldLoading(){
  if(worldBoot.running)return;
  state.startQueued=true;state.loading=true;state.awaitingEntry=false;state.playing=false;state.left=false;state.right=false;state.started=false;state.paused=false;initialReady=false;document.exitPointerLock?.();
  $("loading").classList.remove("hidden");$("loaderError").hidden=true;$("loaderFill").style.width="0%";$("loaderTip").textContent="O jogo começa somente depois que o laboratório, a vila, os arredores e todas as colisões forem validados.";$("hud").classList.remove("visible");
  worldBoot.startedAt=performance.now();worldBoot.running=true;worldBoot.error=null;worldBoot.attempt=0;worldBoot.stage="initializing";worldBoot.stageFraction=0;worldBoot.requiredChunks.clear();worldBoot.stageChunkKeys.clear();worldBoot.completedStages.clear();worldBoot.preferredSpawn=null;worldBoot.entryCenter=null;
  forwardChunks={x:0,z:0};
  try{
    await runBootStage("initializing",async()=>{if(!Number.isInteger(WORLD_SEED)||WORLD_SEED<1)throw new Error("semente de mundo inválida");await nextRenderFrame();return WORLD_SEED});
    await runBootStage("loading-save",async()=>{await worldStorage.load();restoreEditedColumns();alchemyWorldReady=true;restoreVehicles();worldBoot.loadedState=parseWorldState();saveInventory();elementMissions.sync();await nextRenderFrame()});
    if(!worldBoot.breedingReady){breeding.restore(worldBoot.loadedState?.breeding);worldBoot.breedingReady=true}
    if(!worldBoot.mountsReady){restoreMounts(worldBoot.loadedState?.expeditions);worldBoot.mountsReady=true}
    await runBootStage("loading-assets",async()=>{const materialReady=atlas.texture&&terrainMat&&waterMat&&lavaMat,systemsReady=window.QuimiCraftSystems&&PERIODIC_ELEMENTS.length===118;if(!materialReady||!systemsReady)throw new Error("texturas, materiais ou sistemas essenciais indisponíveis");atlas.texture.needsUpdate=true;await nextRenderFrame()});
    await runBootStage("generating-terrain",()=>waitForBootChunks("generating-terrain",playerAreaDescriptors()));
    await runBootStage("generating-laboratory",async()=>{
      const generated=seedLaboratory(),verified=generated.repaired?validateLaboratory({repair:false}):generated;
      if(!verified.valid)throw new Error(`laboratório inválido: ${verified.checks.structuralFailures} falhas estruturais`);
      await waitForBootChunks("generating-laboratory",labChunkDescriptors())
    });
    await runBootStage("validating-laboratory",async()=>{
      const report=validateLaboratory();const verified=report.repaired?validateLaboratory({repair:false}):report;
      if(!verified.valid)throw new Error("a validação do laboratório não convergiu para um estado seguro");
      const expected=LAB_GENERATION_ORDER.slice(0,-1);if(!expected.every((step,index)=>labGenerationReport.order[index]===step))throw new Error("ordem de geração do laboratório incompleta");
      await nextRenderFrame()
    });
    await runBootStage("generating-village",async()=>{const report=seedVillage();if(!report.valid)throw new Error(`vila inválida: ${report.failures.length} componentes ausentes`);await waitForBootChunks("generating-village",villageAreaDescriptors())});
    await runBootStage("generating-surroundings",async()=>{
      const preferred=worldBoot.preferredSpawn||spawn;
      const position=findSafeSpawnPosition(preferred.x,preferred.z)||findSafeSpawnPosition(spawn.x,spawn.z);
      if(!position)throw new Error("nenhum ponto de entrada seguro encontrado");
      worldBoot.entryCenter=position;
      await waitForBootChunks("generating-surroundings",initialPreloadDescriptors());
    });
    await runBootStage("preparing-collisions",async()=>{
      const report=validateLaboratory({repair:false}),village=validateVillage();
      if(!report.valid||!village.valid||periodicCollisionBoxes.length!==118||labCollisionBoxes.length!==labColliderIds.size)throw new Error("dados de colisão incompletos ou duplicados");
      await nextRenderFrame()
    });
    await runBootStage("preparing-gameplay",async()=>{
      initWorldLife();
      const preferred=worldBoot.entryCenter||worldBoot.preferredSpawn||spawn;
      if(!syncPlayerToSafeGround(preferred.x,preferred.z)&&!syncPlayerToSafeGround(spawn.x,spawn.z))throw new Error("nenhum ponto de spawn seguro foi encontrado");
      if(!worldBoot.preferredSpawn){
        player.yaw=Math.atan2(player.pos.x-labDoor.center,player.pos.z-labDoor.plane);
        player.pitch=-.05;
      }
      const professor=npcs.find(npc=>npc.role==="carbon");if(!professor)throw new Error("Prof. Carbono não foi criado");
      updateTorches();applyCharacterStyle();updateMissionHud();renderInventory();updateChemHud();updateVitals();await nextRenderFrame()
    });
    await runBootStage("ready",async()=>{
      const ready=validateReadyWorld();if(!ready.valid)throw new Error("a verificação final do mundo falhou");
      recordLabGenerationStep("ready-for-player");labGenerationReport.completedAt=Date.now();
      if(labGenerationReport.order.some((step,index)=>LAB_GENERATION_ORDER[index]!==step)||labGenerationReport.order.length!==LAB_GENERATION_ORDER.length)throw new Error("pipeline final do laboratório fora de ordem");
      saveWorldState();performance.measure("QuimiCraft · preparar mundo",{start:worldBoot.startedAt,end:performance.now(),detail:{preset:settings.preset,chunks:worldBoot.requiredChunks.size}});$("loaderTip").textContent="Laboratório, vila, arredores, missões e colisões verificados.";await nextRenderFrame()
    });
    finishInitialLoad()
  }catch(error){
    worldBoot.running=false;worldBoot.error=error;state.loading=true;state.playing=false;state.started=false;$("loaderCopy").textContent="Geração interrompida com segurança";$("loaderErrorCopy").textContent=`A etapa “${worldBoot.stage}” não pôde ser concluída. Nenhum mundo incompleto foi liberado.`;$("loaderError").hidden=false;console.error(`[QuimiCraft][Carregamento] Mundo não liberado. Etapa: ${worldBoot.stage}.`,error)
  }
}

let toastTimer;function toast(msg){const e=$("toast");e.textContent=msg;e.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove("show"),1700)}
function chatMessage(author,text,options={}){
  const speaker=String(author||""),fallbackCategory=speaker==="SISTEMA"?"system":speaker==="QUÍMICA"?"chemistry":"dialogue";
  return messageCenter?.add({speaker,text,category:options.category||fallbackCategory,...options})
}
function chooseSlot(i){state.selected=(i+9)%9;renderHotbar()}
const explorationMapModal=$("explorationMap");
const mapGuide=$("mapGuide"),mapGuideArrow=$("mapGuideArrow"),mapGuideName=$("mapGuideName"),mapGuideInfo=$("mapGuideInfo");
const mapGuideDirection=new THREE.Vector3();
const mapGuideKm=new Intl.NumberFormat("pt-BR",{minimumFractionDigits:1,maximumFractionDigits:1});
const mapBiomeColors={
  planície:[128,156,95],"planície florida":[150,167,103],floresta:[77,123,89],taiga:[84,130,118],
  tundra:[165,180,177],"fiordes glaciais":[163,197,205],"campina de aurora":[136,173,177],
  savana:[173,153,90],deserto:[194,159,104],"selva tropical":[63,130,83],manguezal:[92,136,105],
  pântano:[111,128,87],"delta salobro":[132,148,110],"bosque de cerejeiras":[155,129,137],
  "bosque lilás":[142,126,161],"floresta de sequoias":[82,126,93],"prado alpino":[148,166,137],
  montanha:[139,148,137],badlands:[164,104,72],"chapadas ocres":[181,130,83],
  "cânion calcário":[177,157,114],"termas minerais":[174,155,125],salinas:[195,182,151],
  vulcânico:[104,93,89],"caldeira vítrea":[106,97,115],"bosque de cristais":[127,129,162]
};
const explorationMapView=QuimiCraftExplorationMap.createView(explorationMapModal,explorationSurvey,{
  position:()=>({x:player.pos.x,z:player.pos.z,yaw:player.yaw,biome:biomeAt(player.pos.x,player.pos.z)}),
  surface(x,z){
    const height=terrainHeight(x,z),biome=biomeAt(x,z);
    if(height<WATER_LEVEL){
      const surface=getBlock(x,WATER_LEVEL,z);
      if(surface===BLOCK.ICE)return {height,color:[149,183,201],wet:true};
      if(surface===BLOCK.WATER){
        const depth=WATER_LEVEL-height,shade=Math.min(21,depth*2);
        return {height,color:[70-shade,126-shade,148-shade],wet:true};
      }
    }
    return {height,color:mapBiomeColors[biome]??[126,149,102],wet:false};
  },
  landmarks:()=>[{x:LAB_LAYOUT.cx,z:LAB_LAYOUT.cz,name:"Laboratório Carbono"},
    {x:VILLAGE.x,z:VILLAGE.z,name:"Vila dos Elementos"}],
  waypoints:explorationWaypoints,
  onWaypointChange(){if(initialReady)saveWorldState()}
});
function updateMapGuide(){
  const target=explorationWaypoints.current();
  const visible=!!(target&&state.started&&!state.paused&&!uiBlocking());
  if(mapGuide.hidden===visible)mapGuide.hidden=!visible;
  if(!visible)return;
  camera.getWorldDirection(mapGuideDirection);
  const yaw=Math.hypot(mapGuideDirection.x,mapGuideDirection.z)>.01?
    Math.atan2(-mapGuideDirection.x,-mapGuideDirection.z):player.yaw;
  const guide=QuimiCraftExplorationMap.guideTo(target,{x:player.pos.x,z:player.pos.z,yaw});
  const arrived=guide.distance<=2.25;
  const distance=guide.distance>=1000?mapGuideKm.format(guide.distance/1000)+" km":Math.round(guide.distance)+" m";
  const description=distance+" · "+(arrived?"Você chegou":guide.heading);
  const rotation="rotate("+Math.round(guide.angle*180/Math.PI)+"deg)";
  if(mapGuideArrow.style.transform!==rotation)mapGuideArrow.style.transform=rotation;
  if(mapGuideName.textContent!==target.name)mapGuideName.textContent=target.name;
  if(mapGuideInfo.textContent!==description)mapGuideInfo.textContent=description;
  mapGuide.classList.toggle("arrived",arrived);
}
function openExplorationMap(){
  if(!state.started||state.paused||uiBlocking())return;
  explorationSurvey.reveal(player.pos.x,player.pos.z);
  state.map=true;state.playing=false;clearInput();
  explorationMapModal.classList.add("open");explorationMapModal.setAttribute("aria-hidden","false");
  document.exitPointerLock?.();
  explorationMapView.open();
}
function closeExplorationMap(resume=true){
  if(!state.map)return;
  state.map=false;
  explorationMapView.close();explorationMapModal.classList.remove("open");explorationMapModal.setAttribute("aria-hidden","true");
  if(resume)requestPointer();
}
$("mapHudBtn").onclick=openExplorationMap;
$("mapClose").onclick=()=>closeExplorationMap();
function uiBlocking(){return state.map||state.catalog||state.alchemyWorkshop||state.frontierWorkshop||state.loading||state.awaitingEntry||state.inventory||state.chemistry||state.periodic||state.shop||state.extermination||state.character||state.chat||state.devOpen||state.graphics||state.history||state.professor||state.scientificNotebook||state.researchTree||state.scienceStation}
const playerInput=QuimiCraftInput.create({
  canvas:renderer.domElement,
  document,
  touch:touchInput,
  canPlay:()=>state.started&&!uiBlocking()&&!state.paused,
  isPlaying:()=>state.playing,
  onPlay:mode=>{
    state.playing=true;
    state.paused=false;
    $("pause").classList.remove("open");
    $("dragHint").hidden=mode!=="drag";
    $("cameraModeBtn").textContent=mode==="drag"?"Tentar captura do mouse":"Usar câmera por arraste";
  },
  onPause:showPause,
  onFallback:()=>toast("Câmera por arraste ativada. Também é possível olhar com as setas."),
  look:(dx,dy,scale)=>{
    if(gasBlackout>0)return;
    player.yaw-=dx*scale*settings.sense;
    player.pitch=clamp(player.pitch-dy*scale*settings.sense,-Math.PI/2+.02,Math.PI/2-.02);
  },
  attack:held=>{
    if(player.petrified>0||gasBlackout>0||sleeping)return;
    if(state.deckTarget?.kind==="deckBlock")return breakDeckTarget();
    if(riding)return attackWithMount();
    if(vehicles.current())return vehicles.operate(state.target);
    if(WEAPONS.has(selectedItem()))attackSelected(false);
    else if(held)state.left=true;
  },
  use:useOrPlace
});
function requestPointer(options){return playerInput.request(options)}
function clearInput(){
  for(const key of Object.keys(keys))keys[key]=false;
  state.left=state.right=false;
  queuedPlacement=null;
  forwardChunks={x:0,z:0};
  playerInput.clear();
}
const fishingRoot=new THREE.Group();
const bobber=new THREE.Group();
const fishingRed=new THREE.MeshLambertMaterial({color:0xd7474e});
const fishingWhite=new THREE.MeshLambertMaterial({color:0xe7ebd4});
const fishingCap=new THREE.OctahedronGeometry(.102,0);
const fishingBody=new THREE.Mesh(fishingCap,fishingRed),fishingTop=new THREE.Mesh(fishingCap,fishingWhite);
fishingTop.position.y=.053;
fishingTop.scale.set(.82,.42,.82);
bobber.add(fishingBody,fishingTop);
const fishingLineGeo=new THREE.BufferGeometry();
fishingLineGeo.setAttribute("position",new THREE.BufferAttribute(new Float32Array(27),3));
const fishingLine=new THREE.Line(fishingLineGeo,new THREE.LineBasicMaterial({color:0xd9f1e0,transparent:true,opacity:.73,depthWrite:false}));
fishingLine.frustumCulled=false;
fishingRoot.add(fishingLine,bobber);
fishingRoot.visible=false;
scene.add(fishingRoot);
let professionFishingActive=false;
let workshopJobs=[];

function aimFishingWater(){
  const eye=attackOrigin(),direction=aimDirection();
  for(let distance=.62;distance<=13.1;distance+=.17){
    const x=eye.x+direction.x*distance,y=eye.y+direction.y*distance,z=eye.z+direction.z*distance;
    if(combatPointBlocked(x,y,z))return null;
    if(getBlock(x,y,z)!==BLOCK.WATER)continue;
    let top=Math.floor(y);
    while(top+1<MAX_Y&&getBlock(x,top+1,z)===BLOCK.WATER)top++;
    let bottom=top;
    while(bottom>top-9&&getBlock(x,bottom-1,z)===BLOCK.WATER)bottom--;
    if(getBlock(x,top+1,z)!==BLOCK.AIR||labSafe(x,top,z))return null;
    return {x,y:top+liquidSurfaceHeight(BLOCK.WATER,x,top,z)+.01,z,depth:top-bottom+1,biome:biomeAt(x,z),kind:regionalWater(x,z).id};
  }
  return null;
}
function updateFishingDisplay(data){
  const hud=$("fishingHud");
  fishingActivity=data?{kind:data.stage==="flying"?"cast":data.stage,phase:.5}:null;
  professionFishingActive=!!data;
  fishingRoot.visible=!!data;
  hud.hidden=!data;
  if(!data)return;
  const rod=state.cameraMode===0?firstWeaponModel:thirdWeaponModel;
  const localTip=rod?.userData.rodTip;
  if(localTip)rod.updateWorldMatrix(true,false);
  const tip=localTip?rod.localToWorld(localTip.clone()):attackOrigin().addScaledVector(aimDirection(),.92);
  if(!localTip)tip.y+=.24;
  const end=new THREE.Vector3(data.water.x,data.water.y,data.water.z);
  if(data.stage==="flying"){
    const frac=clamp(1-data.timer/.42,0,1);
    end.set(data.start.x, data.start.y+1.4, data.start.z).lerp(new THREE.Vector3(data.water.x,data.water.y,data.water.z),frac);
    end.y+=Math.sin(frac*Math.PI)*1.24;
  }else end.y+=Math.sin(data.age*(data.stage==="bite"?22:4.2))*(data.stage==="bite"?.14:.033);
  bobber.position.copy(end);
  const buffer=fishingLineGeo.attributes.position;
  for(let i=0;i<9;i++){
    const fraction=i/8;
    const point=tip.clone().lerp(end,fraction);
    point.y-=Math.sin(fraction*Math.PI)*(data.stage==="bite"?.06:.25);
    buffer.setXYZ(i,point.x,point.y,point.z);
  }
  buffer.needsUpdate=true;
  const line=data.stage==="bite"?"Fisgou! Recolha a linha agora":data.stage==="flying"?"Lançando a linha":"Aguardando uma fisgada";
  if($("fishingCopy").textContent!==line)$("fishingCopy").textContent=line;
  $("fishingFill").style.width=100*clamp(data.timer/(data.stage==="bite"?data.window:data.stage==="flying"?.42:data.wait),0,1)+"%";
  hud.classList.toggle("bite",data.stage==="bite");
}
function receiveFrontier(id,count,at){
  if(transactInventory([],[[id,count]]).ok)return;
  const x=at.x,y=at.y+.42,z=at.z;
  spawnDrop(id,count,new THREE.Vector3(x,y,z));
}
let workshopTarget=null;
function openFrontierWorkshop(target,jobs){
  workshopTarget=target;
  workshopJobs=jobs;
  $("frontierTitle").textContent=itemName(target.id);
  state.frontierWorkshop=true;
  state.playing=false;
  clearInput();
  document.exitPointerLock?.();
  $("frontierWorkshop").classList.add("open");
  $("frontierWorkshop").setAttribute("aria-hidden","false");
  refreshFrontierWorkshop();
}
function refreshFrontierWorkshop(){
  const panel=$("frontierJobs");
  const list=items=>items.map(([id,quantity])=>quantity+" × "+itemName(id)).join(" + ");
  panel.replaceChildren();
  const forge=workshopTarget?.id===BLOCK.METAL_FORGE;
  const jobs=forge?[
    ["Fundição e redução",workshopJobs.filter(job=>!job.section||job.section==="smelt")],
    ["Ligas metálicas",workshopJobs.filter(job=>job.section==="alloy")],
    ["Moldagem",workshopJobs.filter(job=>job.section==="mold")]
  ]:[["",workshopJobs]];
  for(const [name,recipes] of jobs){
    if(!recipes.length)continue;
    if(name){
      const heading=document.createElement("h3");
      heading.className="forge-section";
      heading.textContent=name;
      panel.appendChild(heading);
    }
    for(const job of recipes){
    const button=document.createElement("button");
    button.type="button";
    button.className="secondary frontier-job";
    button.textContent=job.name+" · "+list(job.need)+" → "+list(job.out);
    button.onclick=()=>{
      if(job.kind){
        const tool=job.kind==="cook"?"pan":job.kind==="forge"?"mallet":null;
        const faster=!!tool&&countItem(tool)>0;
        const outcome=production.enqueue(workshopTarget,{...job,seconds:job.seconds*(faster?.79:1)});
        if(!outcome.ok){toast(outcome.message);return}
        closeFrontierWorkshop();
        return;
      }
      const outcome=transactInventory(job.need,job.out);
      toast(outcome.ok?list(job.out)+" pronto.":outcome.message);
      refreshFrontierWorkshop();
    };
    panel.appendChild(button);
    }
  }
}
function closeFrontierWorkshop(resume=true){
  if(!state.frontierWorkshop)return;
  state.frontierWorkshop=false;
  $("frontierWorkshop").classList.remove("open");
  $("frontierWorkshop").setAttribute("aria-hidden","true");
  workshopJobs=[];workshopTarget=null;
  if(resume)requestPointer({notify:true});
}
$("frontierClose").onclick=()=>closeFrontierWorkshop();
function startPlayerActivity(kind,life,prop,site=null,liquid=null){
  playerActivity={kind,life,left:life,prop,site,liquid,fx:0};
  refreshHeldItem();
}
const actionTools={cook:"pan",forge:"mallet",glass:"glass_tool"};
function tickPlayerActivities(dt){
  production.tick(dt);
  if(playerActivity){
    const a=playerActivity;
    a.left-=dt;
    if(a.site&&!production.current)a.left=0;
    if(a.left<=0){playerActivity=null;refreshHeldItem()}
    else if(a.site){
      a.fx-=dt;
      if(a.fx<=0){
        a.fx=a.kind==="forge"?.51:.29;
        const at=new THREE.Vector3(a.site.x+(a.kind==="forge"?.39:.5),a.site.y+.91,a.site.z+(a.kind==="forge"?.43:.5));
        frontierFx.work(a.kind,at);
        if(a.kind==="forge")sound("hit",.20);
      }
    }
  }
  const hud=$("productionHud"),current=production.current;
  hud.hidden=!current;
  if(current){
    const name=current.job.name;
    if($("productionCopy").textContent!==name)$("productionCopy").textContent=name;
    $("productionFill").style.width=(100*(1-current.left/current.job.seconds)).toFixed(0)+"%";
  }
}
const production=QuimiCraftWorkshops.createJobQueue({
  position:()=>player.pos,getBlock,
  exchange:(need,out,preview)=>transactInventory(need,out,{},[],preview),
  notice:toast,
  play:(kind,life,site)=>startPlayerActivity(kind,life,actionTools[kind],site),
  finish:(job,site)=>{
    const at=new THREE.Vector3(site.x+.5,site.y+1,site.z+.5);
    frontierFx.work(job.kind,at,true);
    sound("pickup",.65);
    toast(job.out.map(([id,n])=>n+" × "+itemName(id)).join(" + ")+" pronto.");
  }
});
const professions=QuimiCraftProfessions.create({
  B:BLOCK,maxY:MAX_Y,getBlock,setBlock,exchange:transactInventory,selected:selectedItem,count:countItem,notify:toast,
  blocked:isLabPlacementRestricted,roof:roofAt,sunlit:plantSunlit,weather:currentWeather,season:currentSeason,
  name:itemName,wear:(id,amount,reason)=>scienceSystem?.damageEquipment(id,amount,reason),
  working:id=>!scienceSystem?.equipmentCondition(id)?.broken,receive:receiveFrontier,findWater:aimFishingWater,
  position:()=>player.pos.clone(),showFishing:updateFishingDisplay,
  splash:(p,kind)=>frontierFx.splash(new THREE.Vector3(p.x,p.y,p.z),kind),
  reward:(kind,id,p)=>scienceSystem?.registerDiscovery(kind==="pesca"?"animals":"plants",id,{
    name:itemName(id),source:kind==="pesca"?biomeAt(p.x,p.z):"Cultivo e coleta",amountCollected:1,researchProgress:35
  }),
  load:()=>{try{return JSON.parse(localStorage.qc_homestead||"[]")}catch{return []}},
  save:data=>{try{localStorage.qc_homestead=JSON.stringify(data)}catch(error){reportSaveIssue("Não foi possível salvar os cultivos.",error)}},
  fishing:QuimiCraftWorkshops.fishingYield,animate:startPlayerActivity,
  launchWorkshop:openFrontierWorkshop
});
function openInventory(){if(sleeping)return;state.inventory=true;state.playing=false;state.left=false;$("inventory").classList.add("open");$("inventory").setAttribute("aria-hidden","false");document.exitPointerLock?.();renderInventory();paintAvatarViews()}
let cargoBoat=null;
function openBoatCargo(vehicle){
  if(!vehicle?.deck||sleeping)return false;
  cargoBoat=vehicle;vehicle.deck.chestOpen=true;vehicle.rig.furniture.lid.rotation.x=1.27;
  state.inventory=true;state.playing=false;state.left=false;
  const overlay=$("boatCargo");overlay.classList.add("open");overlay.setAttribute("aria-hidden","false");
  document.exitPointerLock?.();renderBoatCargo();$("closeBoatCargo").focus();
  sound("place",.57);
  return true;
}
function renderBoatCargo(){
  if(!cargoBoat)return;
  const cargo=cargoBoat.deck;
  $("boatCargoName").textContent="Baú de bordo · "+QuimiCraftVehicles.types[cargoBoat.kind].name;
  const slots=(items,into)=>items.map((item,index)=>item?
    `<button type="button" class="mc-slot cargo-slot" data-cargo-direction="${into?"in":"out"}" data-cargo-slot="${index}">${iconHTML(item)}</button>`:
    '<span class="mc-slot cargo-slot" aria-hidden="true"></span>').join("");
  $("boatCargoHold").innerHTML=slots(cargo.cargoSlots,false);
  $("boatCargoBackpack").innerHTML=slots(invSlots,true);
  $("boatCargo").querySelectorAll("[data-cargo-slot]").forEach(btn=>{
    const into=btn.dataset.cargoDirection==="in",index=Number(btn.dataset.cargoSlot);
    const item=(into?invSlots:cargo.cargoSlots)[index];
    const label=(into?"Guardar ":"Retirar ")+itemDisplayName(item)+" · "+item.count;
    btn.setAttribute("aria-label",label);btn.title=label;
    btn.onclick=()=>{
      if(vehicles.moveCargo(cargoBoat,invSlots,into,index)){
        saveInventory();renderHotbar();refreshHeldItem();renderBoatCargo();sound("pickup",.55);
        $("boatCargo").querySelector(`[data-cargo-direction="${into?"in":"out"}"][data-cargo-slot="${index}"]`)?.focus();
        if(!$("boatCargo").contains(document.activeElement))$("closeBoatCargo").focus();
      }
    };
  });
}
function closeBoatCargo(){
  if(!cargoBoat)return;
  cargoBoat.deck.chestOpen=false;cargoBoat.rig.furniture.lid.rotation.x=0;cargoBoat=null;
  const overlay=$("boatCargo");overlay.classList.remove("open");overlay.setAttribute("aria-hidden","true");
}
$("closeBoatCargo").onclick=()=>closeInventory();
function closeInventory(){closeBoatCargo();state.inventory=false;$("inventory").classList.remove("open");$("inventory").setAttribute("aria-hidden","true");if(state.started)requestPointer()}
function closeModals(){closeExplorationMap(false);closeBoatCargo();catalog.close();alchemyUI.close(false);closeFrontierWorkshop(false);closeExtermination(false);state.inventory=state.chemistry=state.periodic=state.shop=state.character=state.chat=state.devOpen=state.graphics=state.history=state.professor=state.scientificNotebook=state.researchTree=state.scienceStation=false;state.paused=false;for(const id of ["inventory","chemistry","periodicTable","shop","character","devMenu","graphics","professor","messageHistory","scientificNotebook","researchTree","scienceStation","pause"])$(id).classList.remove("open");$("chat").classList.remove("open");chatCmdUI?.reset();devCmdUI?.reset()}
function openScienceModal(id){
  const flags={scientificNotebook:"scientificNotebook",researchTree:"researchTree",scienceStation:"scienceStation",alchemyWorkshop:"alchemyWorkshop"},flag=flags[id],modal=$(id);if(!flag||!modal)return false;
  state[flag]=true;state.playing=false;state.left=false;state.right=false;modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.exitPointerLock?.();return true
}
function closeScienceModal(id,resume=true){
  const flags={scientificNotebook:"scientificNotebook",researchTree:"researchTree",scienceStation:"scienceStation",alchemyWorkshop:"alchemyWorkshop"},flag=flags[id],modal=$(id);if(!flag||!modal)return false;
  state[flag]=false;modal.classList.remove("open");modal.setAttribute("aria-hidden","true");if(resume&&state.started)requestPointer();return true
}
function showPause(){if(state.loading||!state.started||uiBlocking())return;state.playing=false;clearInput();state.paused=true;$("pause").classList.add("open")}
let historyReturnToPause=false;
function openMessageHistory(fromPause=false){
  if(state.loading)return;historyReturnToPause=!!fromPause||state.paused;state.history=true;state.playing=false;state.left=false;state.paused=historyReturnToPause;$("pause").classList.remove("open");$("messageHistory").classList.add("open");$("messageHistory").setAttribute("aria-hidden","false");document.exitPointerLock?.();messageCenter.renderHistory(messageCenter.getFilter())
}
function closeMessageHistory(){
  state.history=false;$("messageHistory").classList.remove("open");$("messageHistory").setAttribute("aria-hidden","true");
  if(historyReturnToPause){state.paused=true;$("pause").classList.add("open")}else{state.paused=false;requestPointer()}
  historyReturnToPause=false
}
let chatCmdUI=null,devCmdUI=null;
function buildCommandRegistries(){
  const blockKeyById=new Map();
  for(const [k,v] of Object.entries(BLOCK))if(typeof v==="number"&&!blockKeyById.has(v))blockKeyById.set(v,k);
  const blockAliases={
    [BLOCK.AIR]:["ar","vazio"],[BLOCK.GRASS]:["grama","relva"],[BLOCK.DIRT]:["terra"],
    [BLOCK.STONE]:["pedra","rocha"],[BLOCK.SAND]:["areia"],[BLOCK.WOOD]:["madeira","tronco"],
    [BLOCK.LEAVES]:["folhas"],[BLOCK.PLANK]:["tabua","tabuas"],[BLOCK.TORCH]:["tocha"],
    [BLOCK.DOOR]:["porta"],[BLOCK.BEDROCK]:["rocha_matriz"],[BLOCK.LAB]:["laboratorio"],
    [BLOCK.GLASS]:["vidro"],[BLOCK.WATER]:["agua"],[BLOCK.LAVA]:["magma_liquido"],
    [BLOCK.FIRE]:["fogo","chama"],[BLOCK.FURNACE]:["fornalha","forno"],[BLOCK.OBSIDIAN]:["obsidiana"],
    [BLOCK.COAL]:["carvao"],[BLOCK.IRON]:["ferro"],[BLOCK.GOLD]:["ouro"],[BLOCK.COPPER]:["cobre"],
    [BLOCK.CRYSTAL]:["cristal"],[BLOCK.BED]:["cama"],[BLOCK.POPPY]:["flor","papoula"]
  };
  const blocks=[],usedBlockTokens=new Set();
  for(const [rawId,def] of Object.entries(BDEF)){
    const id=Number(rawId);
    if(!Number.isInteger(id)||!def?.name)continue;
    if(def.hidden&&(def.bed||def.gate))continue;
    const field=fieldLab.byBlock.get(id)?.unit;
    if(field&&id!==field.base)continue;
    let token=(blockKeyById.get(id)||QuimiCraftCommands.slugify(def.name)||`block_${id}`).toLowerCase();
    if(usedBlockTokens.has(token))token=`${token}_${id}`;
    usedBlockTokens.add(token);
    blocks.push({
      token,numId:id,name:def.name,badge:"Bloco",
      placeable:true,
      aliases:[...(blockAliases[id]||[]),`block:${token}`,`block:${id}`,`id:${id}`],
      priority:id<64?12:24
    });
  }
  const itemAliases={
    iron_sword:["sword","espada"],wind_staff:["staff","cajado"],bow:["arco"],arrow:["flecha"],
    bolt:["virote"],iron_pickaxe:["pickaxe","picareta"],bucket:["balde"],water_bucket:["waterbucket"],
    lava_bucket:["lavabucket"],gold_nugget:["goldnugget","pepita"],protective_goggles:["goggles","oculos"],
    respirator_mask:["respirator","mascara"],lab_coat:["labcoat","jaleco"],oxygen_tank:["oxygentank"],
    chitin_armor:["chitinarmor"],iron_helmet:["helmet","capacete"],iron_chestplate:["chestplate","peitoral"],
    iron_leggings:["leggings","calcas"],iron_boots:["ironboots","botas"],rubber_boots:["rubberboots"]
  };
  const items=[];
  for(const [id,name] of Object.entries(ITEM_NAMES)){
    if(!id||!name)continue;
    const isWeapon=!!QuimiCraftArsenal.weapons[id]||id==="bolt"||id==="venom_arrow"||id==="petrifying_vial"||!!exterminationTools[id];
    const isShield=!!QuimiCraftArsenal.shields[id];
    const isFocus=!!QuimiCraftArsenal.focuses[id];
    const isGear=!!APPAREL[id]||!!EQUIPMENT_DEFS[id]||id==="hunt_badge";
    const isVehicleKit=!!QuimiCraftVehicles.itemData[id];
    const isPotion=!!QuimiCraftAlchemy.potions[id];
    const isFood=!!FOOD_VALUES[id]||!!DRINK_VALUES[id];
    const badge=isWeapon?"Arma":isShield?"Escudo":isFocus?"Artefato":isGear?"Equipamento":
      isVehicleKit?"Kit de veículo":isPotion?"Alquimia":isFood?"Alimento":"Item";
    const single=isWeapon||isShield||isFocus||isGear||isVehicleKit;
    items.push({
      token:id,id,name,badge,
      defaultCount:single?1:(isPotion||isFood?16:64),
      aliases:itemAliases[id]||[],
      priority:single?20:30
    });
  }
  const entitiesList=[],seenEntity=new Set();
  const pushEntity=(entry)=>{
    if(seenEntity.has(entry.token))return;
    seenEntity.add(entry.token);
    entitiesList.push(entry);
  };
  const baseMobs={pig:"Porco",cow:"Vaca",rabbit:"Coelho",chicken:"Galinha",sheep:"Ovelha",deer:"Cervo da Taiga",
    owl:"Coruja Boreal",capivara:"Capivara",slime:"Slime Ácido",cobrete:"Cobrete",cristalume:"Cristalume",
    scorpion:"Escorpião das Dunas",golem:"Golem de Obsidiana",wisp:"Espectro da Tempestade",magma:"Elemental de Magma"};
  const fantasySet=new Set(["slime","cobrete","cristalume","golem","wisp","magma","peat_slime","travertine_guard"]);
  for(const [id,name] of Object.entries(baseMobs)){
    const cat=fantasySet.has(id)?"Criatura":"Fauna";
    pushEntity({token:id,id,name,kind:"mob",badge:cat,priority:15});
    if(QuimiCraftBreeding.diet({type:id}))pushEntity({token:`${id}:baby`,id,baby:true,name:`Filhote · ${name}`,kind:"mob",badge:"Filhote",priority:55});
    if(!spectral.isNative(id))pushEntity({token:`${id}:ghost`,id,ghost:true,name:spectral.name(id,name),kind:"mob",badge:"Fantasma",priority:65});
  }
  for(const [id,v] of Object.entries(FAUNA_VARIANTS)){
    const cat=fantasySet.has(id)?"Criatura":"Fauna";
    pushEntity({token:id,id,name:v.name,kind:"mob",badge:cat,priority:18});
    if(QuimiCraftBreeding.diet({type:id}))pushEntity({token:`${id}:baby`,id,baby:true,name:`Filhote · ${v.name}`,kind:"mob",badge:"Filhote",priority:58});
    if(!spectral.isNative(id))pushEntity({token:`${id}:ghost`,id,ghost:true,name:spectral.name(id,v.name),kind:"mob",badge:"Fantasma",priority:68});
  }
  for(const [id,p] of Object.entries(regionalFauna)){
    const cat=p.shape==="fantasy"?"Criatura":"Fauna";
    pushEntity({token:id,id,name:p.name,kind:"mob",badge:cat,priority:16});
    if(QuimiCraftBreeding.diet({type:id}))pushEntity({token:`${id}:baby`,id,baby:true,name:`Filhote · ${p.name}`,kind:"mob",badge:"Filhote",priority:56});
    if(!p.finisher&&!spectral.isNative(id))pushEntity({token:`${id}:ghost`,id,ghost:true,name:spectral.name(id,p.name),kind:"mob",badge:"Fantasma",priority:66});
  }
  for(const [id,p] of Object.entries(DRAGONS)){
    pushEntity({token:id,id,name:p.name,kind:"mob",badge:"Dragão",aliases:["dragao","dragon"],priority:14});
    pushEntity({token:`${id}:ghost`,id,ghost:true,name:spectral.name(id,p.name),kind:"mob",badge:"Fantasma",priority:64});
  }
  for(const [id,p] of Object.entries(natureFolk)){
    pushEntity({token:id,id,name:p.name,kind:"mob",badge:"Árvore viva",priority:25});
  }
  for(const [id,p] of Object.entries(siteWardens)){
    pushEntity({token:id,id,name:p.name,kind:"mob",badge:"Guardião",priority:24});
  }
  for(const [id,p] of Object.entries(folklore.creatures)){
    pushEntity({token:id,id,name:p.name,kind:"mob",badge:"Folclore",aliases:["folclore"],priority:18});
  }
  for(const [variant,plant] of Object.entries(screamer.plants)){
    pushEntity({token:`screamer:${variant}`,id:`screamer:${variant}`,name:plant.name,kind:"mob",badge:"Planta",priority:30});
  }
  for(const [id,p] of Object.entries(QuimiCraftDepths.fauna)){
    const extra=id==="brain_coral"?["coral_cerebro","coral"]:id==="sperm_whale"?["cachalote","baleia"]:
      id==="giant_squid"?["lula_gigante","lula"]:id==="colossal_squid"?["lula_colossal","lula"]:
      id.startsWith("orca")?["orca","baleia_assassina"]:[];
    pushEntity({token:id,id,name:p.name,kind:"aquatic",badge:"Aquático",aliases:extra,priority:14});
    if(!QuimiCraftMarineLife.profiles[id])pushEntity({token:`${id}:ghost`,id,ghost:true,name:spectral.name(id,p.name),kind:"aquatic",badge:"Fantasma",priority:67});
  }
  for(const id of Object.keys(fishColors)){
    if(id==="raw_piranha"||id==="raw_shrimp")continue;
    const name=fishName(id);
    pushEntity({token:id,id,name,kind:"aquatic",badge:"Peixe",priority:26});
  }
  for(const [kind,p] of Object.entries(QuimiCraftVehicles.types)){
    pushEntity({token:kind,id:kind,name:p.name,kind:"vehicle",badge:"Veículo",aliases:[p.item],priority:22});
  }
  for(const [type,p] of Object.entries({npc_carbon:{name:"Prof. Carbono"},npc_ranger:{name:"Guardiã Íris"},...NPC_PROFILES})){
    if(type==="npc_child")continue;
    pushEntity({token:type,id:type,name:p.name,kind:"npc",badge:"NPC",priority:32});
  }
  return {blocks,items,entities:entitiesList};
}
function findSummonWaterSpot(profile,coords){
  const minDepth=Math.min(profile?.minDepth??1,2);
  if(coords){
    const w=findFishWater(coords[0],coords[2]);
    if(w)return {x:coords[0],y:aquaticDepth(w,coords[1],profile),z:coords[2],water:w};
  }
  const eye=attackOrigin(),dir=aimDirection();
  let fallback=null;
  for(let d=2;d<=26;d+=1.2){
    const px=eye.x+dir.x*d,pz=eye.z+dir.z*d;
    if(!hasChunk(Math.floor(px/CHUNK),Math.floor(pz/CHUNK)))continue;
    const w=findFishWater(px,pz);
    if(!w)continue;
    const spot={x:px,y:aquaticDepth(w,w.top-w.depth*(profile?.swim??.45),profile),z:pz,water:w};
    if(w.depth>=minDepth)return spot;
    if(!fallback)fallback=spot;
  }
  for(let r=0;r<=26;r+=2){
    const steps=r===0?1:16;
    for(let i=0;i<steps;i++){
      const a=player.yaw+Math.PI+i*TAU/steps,px=player.pos.x+Math.sin(a)*r,pz=player.pos.z+Math.cos(a)*r;
      if(!hasChunk(Math.floor(px/CHUNK),Math.floor(pz/CHUNK)))continue;
      const w=findFishWater(px,pz);
      if(!w)continue;
      const spot={x:px,y:aquaticDepth(w,w.top-w.depth*(profile?.swim??.45),profile),z:pz,water:w};
      if(w.depth>=minDepth)return spot;
      if(!fallback)fallback=spot;
    }
  }
  return fallback;
}
function summonCommandEntity(entry,coords,count=1){
  const qty=clamp(Math.floor(count||1),1,20);
  if(entry.kind==="vehicle"){
    return vehicles.spawn(entry.id,coords);
  }
  if(entry.kind==="aquatic"){
    const profile=aquaticProfile(entry.id);
    const baseSpot=findSummonWaterSpot(profile,coords);
    if(!baseSpot)return {ok:false,msg:`Nenhuma água próxima para invocar ${entry.name}. Aproxime-se da água ou use /setblock ~ ~ ~ water.`};
    let spawned=0;
    for(let i=0;i<qty;i++){
      const spread=qty>1?1.2:0,ang=i*2.399;
      const px=baseSpot.x+Math.cos(ang)*spread,pz=baseSpot.z+Math.sin(ang)*spread;
      const w=findFishWater(px,pz)||baseSpot.water;
      const sx=w===baseSpot.water&&qty>1?baseSpot.x:px,sz=w===baseSpot.water&&qty>1?baseSpot.z:pz;
      const f=buildFish(sx,baseSpot.y,sz,w,entry.id,!!entry.ghost);
      f.angle=player.yaw+Math.PI;
      f.group.rotation.y=f.angle+Math.PI;
      spawned++;
    }
    sound("splash",.5);
    return {ok:true,msg:`Invocado: ${spawned>1?spawned+" × ":""}${entry.name} (${Math.round(baseSpot.x)}, ${Math.round(baseSpot.y)}, ${Math.round(baseSpot.z)})`};
  }
  const dist=DRAGONS[entry.id]?7.5:3.8;
  const bx=coords?coords[0]:player.pos.x-Math.sin(player.yaw)*dist;
  const bz=coords?coords[2]:player.pos.z-Math.cos(player.yaw)*dist;
  const by=coords?coords[1]:findStandingY(bx,bz,Math.max(player.pos.y+3,terrainHeight(bx,bz)+2));
  let spawned=0;
  for(let i=0;i<qty;i++){
    const r=qty>1?(0.9+Math.floor(i/6)*1.1):0,ang=i*2.399;
    const x=bx+Math.cos(ang)*r,z=bz+Math.sin(ang)*r;
    const y=coords?by:findStandingY(x,z,Math.max(by+2,terrainHeight(x,z)+2));
    if(entry.id.startsWith("screamer:")){
      createEntity("screamer",x,z,false,{y,variant:entry.id.split(":")[1]},false,false);
    }else{
      const e=createEntity(entry.id,x,z,entry.kind==="npc",{y},!!entry.baby,entry.ghost?true:false);
      if(e&&DRAGONS[entry.id]&&!coords){e.y=y+2.5;e.group.position.y=e.y}
    }
    spawned++;
  }
  combatParticles(new THREE.Vector3(bx,by+.9,bz),0xa7f2d6,10,"vapor");
  sound("magic",.42);
  return {ok:true,msg:`Invocado: ${spawned>1?spawned+" × ":""}${entry.name}`};
}
const commandEngine=QuimiCraftCommands.create({
  buildRegistries:buildCommandRegistries,
  getGamemode:()=>state.gamemode,
  setGamemode,
  playerPos:()=>({x:player.pos.x,y:player.pos.y,z:player.pos.z}),
  playerBlockPos:()=>({x:Math.floor(player.pos.x),y:Math.floor(player.pos.y),z:Math.floor(player.pos.z)}),
  aimedBlockPos:()=>state.target?{x:state.target.x,y:state.target.y,z:state.target.z}:null,
  aimedPlacePos:()=>{
    if(state.target&&state.target.n){
      const [dx,dy,dz]=state.target.n;
      return {x:state.target.x+dx,y:state.target.y+dy,z:state.target.z+dz};
    }
    return {
      x:Math.floor(player.pos.x-Math.sin(player.yaw)*2.5),
      y:Math.floor(player.pos.y),
      z:Math.floor(player.pos.z-Math.cos(player.yaw)*2.5)
    };
  },
  giveEntry(entry,count,fromSummon){
    const id=entry.kind==="block"?entry.numId:entry.id;
    const ok=addItem(id,count);
    if(!ok)return {ok:false,msg:"Mochila cheia — libere um espaço para receber o item."};
    renderHotbar();refreshHeldItem();sound("pickup",.55);
    const idNote=entry.kind==="block"?` (ID ${entry.numId})`:"";
    const hint=fromSummon&&entry.kind==="block"?` · use /setblock ~ ~ ~ ${entry.token} para colocar no mundo`:"";
    return {ok:true,msg:`Recebido: ${count} × ${entry.name}${idNote}${hint}`};
  },
  setBlockAt(x,y,z,entry){
    x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);
    if(y<1||y>=MAX_Y)return {ok:false,msg:`Altura Y deve ficar entre 1 e ${MAX_Y-1}.`};
    if(isLabProtectedBlock(x,y,z))return {ok:false,msg:"O Laboratório Carbono é protegido contra edição."};
    setBlock(x,y,z,entry.numId);
    if(placementsWithLight.has(entry.numId))updateTorches();
    sound("place",.55);
    return {ok:true,msg:`Bloco colocado: ${entry.name} (ID ${entry.numId}) em ${x}, ${y}, ${z}`};
  },
  fillBlocks([x1,y1,z1,x2,y2,z2],entry){
    const minX=Math.min(x1,x2),maxX=Math.max(x1,x2);
    const minY=Math.max(1,Math.min(y1,y2)),maxY=Math.min(MAX_Y-1,Math.max(y1,y2));
    const minZ=Math.min(z1,z2),maxZ=Math.max(z1,z2);
    const vol=(maxX-minX+1)*(maxY-minY+1)*(maxZ-minZ+1);
    if(vol>4096)return {ok:false,msg:`Área muito grande (${vol} blocos). Limite: 4096 blocos.`};
    const dirty=new Map();let placed=0;
    for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++){
      if(isLabProtectedBlock(x,y,z))continue;
      editVoxel(x,y,z,entry.numId,dirty);placed++;
    }
    commitVoxelEdits(dirty);
    if(placementsWithLight.has(entry.numId))updateTorches();
    sound("place",.6);
    return {ok:true,msg:`Preenchidos ${placed} blocos com ${entry.name} (ID ${entry.numId}).`};
  },
  summonEntity:summonCommandEntity,
  teleportTo(x,y,z){
    player.pos.set(x,clamp(y,1,MAX_Y+32),z);player.vel.set(0,0,0);player.fallStart=player.pos.y;
    forwardChunks={x:0,z:0};ensureChunks(true);
    return {ok:true,msg:`Teleportado para ${x.toFixed(1)}, ${player.pos.y.toFixed(1)}, ${z.toFixed(1)}`};
  },
  teleportNamed(place){
    const dest=place==="lab"?{x:LAB_LAYOUT.cx,y:LAB_LAYOUT.y+1,z:LAB_LAYOUT.cz,label:"Laboratório Carbono"}:
      place==="vila"?{x:VILLAGE.x,y:terrainHeight(VILLAGE.x,VILLAGE.z)+2,z:VILLAGE.z,label:"Vila dos Elementos"}:
      {x:spawn.x+.5,y:spawn.y,z:spawn.z+.5,label:"Ponto inicial"};
    player.pos.set(dest.x,dest.y,dest.z);player.vel.set(0,0,0);player.fallStart=player.pos.y;
    forwardChunks={x:0,z:0};ensureChunks(true);
    return {ok:true,msg:`Teleportado para ${dest.label} (${Math.round(dest.x)}, ${Math.round(dest.y)}, ${Math.round(dest.z)})`};
  },
  setTime(v,label){state.day=v;return {ok:true,msg:`Horário ajustado para ${label}.`}},
  setWeather(v,label){climateState.override=v;return {ok:true,msg:`Clima ajustado para ${label}.`}},
  setSeason(v,label){
    climateState.elapsed=v*420;climateState.season=-1;
    for(const ch of chunks.values())rebuildChunk(ch.cx,ch.cz);
    return {ok:true,msg:`Estação ajustada para ${label}.`};
  },
  setFly(v){
    dev.fly=v===null?!dev.fly:!!v;
    player.vel.set(0,0,0);player.fallStart=player.pos.y;
    updateGamemodeHud();if(state.devOpen)renderDev();
    return {ok:true,msg:`Voo livre ${dev.fly?"ativado":"desativado"}.`};
  },
  setSpeed(v){
    dev.speed=clamp(v??(dev.speed%5+1),1,5);
    if(state.devOpen)renderDev();
    return {ok:true,msg:`Velocidade ajustada para ${dev.speed}×.`};
  },
  healPlayer(){
    player.health=player.mana=player.hunger=player.thirst=100;
    player.breath=playerBreathMax();player.dragonSlow=0;playerVenom=null;
    gasExposure=0;gasBlackout=0;setPetrified(0);updateVitals();
    return {ok:true,msg:"Vida, mana, fome, sede e fôlego restaurados."};
  },
  clearWorld(scope){
    if(scope==="inventory"){
      invSlots.fill(null);saveInventory();renderInventory();renderHotbar();refreshHeldItem();
      return {ok:true,msg:"Inventário esvaziado."};
    }
    let removed=0;
    if(scope==="mobs"||scope==="all"){
      for(const e of [...entities])if(!e.persistent&&!e.bonded){breeding.forget(e);removeEntity(e);removed++}
    }
    if(scope==="aquatic"||scope==="all"){
      for(const f of [...fishSchool]){
        f.dead=true;clearCreatureStone(f);creatureAfflictions.delete(f);restoreMobColor(f);disposeAquatic(f);
        const idx=fishSchool.indexOf(f);if(idx>=0)fishSchool.splice(idx,1);removed++;
      }
    }
    return {ok:true,msg:`Removidas ${removed} criaturas.`};
  },
  killSpecies(entry){
    let removed=0;
    if(entry.kind==="aquatic"){
      for(const f of [...fishSchool])if(f.id===entry.id){
        f.dead=true;clearCreatureStone(f);creatureAfflictions.delete(f);restoreMobColor(f);disposeAquatic(f);
        const idx=fishSchool.indexOf(f);if(idx>=0)fishSchool.splice(idx,1);removed++;
      }
    }else{
      for(const e of [...entities])if(!e.persistent&&!e.bonded&&e.type===entry.id){breeding.forget(e);removeEntity(e);removed++}
    }
    return {ok:true,msg:removed?`Removidos ${removed} × ${entry.name}.`:`Nenhum exemplar de ${entry.name} encontrado.`};
  },
  unlockRecipes(){
    dev.allRecipes=true;for(const r of CHEM)unlockedChem.add(r.id);saveChem();renderChemistry();
    if(state.devOpen)renderDev();
    return {ok:true,msg:"Todas as receitas químicas liberadas."};
  }
});
function openChat(initial=""){
  if(!state.started||uiBlocking())return;
  clearInput();
  state.chat=true;state.playing=false;state.left=false;state.right=false;
  $("chat").classList.add("open");
  document.exitPointerLock?.();
  const inp=$("chatInput");
  inp.value=initial;
  inp.focus();
  inp.setSelectionRange(inp.value.length,inp.value.length);
  chatCmdUI?.refresh();
}
function closeChat(){state.chat=false;$("chat").classList.remove("open");$("chatInput").value="";chatCmdUI?.reset();requestPointer()}
function submitChat(raw=$("chatInput").value){
  const text=String(raw||"").trim();
  if(!text)return closeChat();
  if(text.toLowerCase()==="-mododev"){state.chat=false;$("chat").classList.remove("open");$("chatInput").value="";chatCmdUI?.reset();return openDev()}
  if(text.startsWith("/")){
    const res=commandEngine.execute(text);
    if(res?.msg){chatMessage("COMANDO",res.msg,{category:"system"});toast(res.msg)}
    return closeChat();
  }
  chatMessage("VOCÊ",text);
  closeChat();
}
function openDev(){state.devOpen=true;state.playing=false;state.left=false;$("devMenu").classList.add("open");document.exitPointerLock?.();renderDev();setTimeout(()=>{$("devCommand").focus();devCmdUI?.refresh()},20)}
function closeDev(){state.devOpen=false;$("devMenu").classList.remove("open");devCmdUI?.reset();requestPointer()}
function renderDev(){const buttons=[['gamemode creative','Modo Criativo'],['gamemode survival','Modo Sobrevivência'],['fly','Voar'],['infinite','Blocos infinitos'],['recipes','Todas as receitas'],['speed','Speed walk +'],['time day','Meio-dia'],['time night','Noite'],['summon golem','Invocar Golem'],['summon orca','Invocar Orca'],['summon sperm_whale','Invocar Cachalote'],['summon giant_squid','Invocar Lula Gigante']];$("devStatus").innerHTML=`<span class="dev-pill">MODO ${isCreative()?'CRIATIVO':'SOBREVIVÊNCIA'}</span><span class="dev-pill">FLY ${dev.fly?'ON':'OFF'}</span><span class="dev-pill">SPEED ${dev.speed}×</span><span class="dev-pill">INFINITO ${dev.infinite||isCreative()?'ON':'OFF'}</span><span class="dev-pill">RECEITAS ${dev.allRecipes?'TODAS':'PROGRESSÃO'}</span>`;$("devGrid").innerHTML=buttons.map(([id,n])=>`<button class="dev-btn ${(id==='gamemode creative'&&isCreative())||(id==='gamemode survival'&&!isCreative())||(id==='fly'&&dev.fly)||(id==='infinite'&&dev.infinite)||(id==='recipes'&&dev.allRecipes)?'on':''}" data-dev="${id}">${n}</button>`).join("");$("devGrid").querySelectorAll("[data-dev]").forEach(b=>b.onclick=()=>runDevCommand(b.dataset.dev))}
function runDevCommand(raw){
  const text=String(raw||"").trim();
  if(!text)return;
  const low=text.replace(/^\/+/,"").toLowerCase();
  if(low==="infinite"){
    dev.infinite=!dev.infinite;
    if(dev.infinite)for(const id of [...Object.values(BLOCK).filter(id=>typeof id==="number"&&id>0&&id!==BLOCK.LAVA),"arrow"])if(countItem(id)===0)addItem(id,99);
    renderDev();return toast(`DEV · blocos infinitos ${dev.infinite?"ON":"OFF"}`);
  }
  if(low==="day"||low==="night"){
    const res=commandEngine.execute("time "+low);
    renderDev();return toast(res.msg);
  }
  const res=commandEngine.execute(text);
  renderDev();
  if(res?.msg){chatMessage("COMANDO",res.msg,{category:"system"});toast(res.msg)}
}
function refreshChunkGraphics(){
  activeBuild=null;
  pending.length=0;
  for(const ch of chunks.values())rebuildChunk(ch.cx,ch.cz);
  ensureChunks(true);
}
function syncGraphicControls(){for(const [id,v] of [["qualityPreset",settings.preset],["renderDistance",settings.render],["shadowQuality",settings.shadows],["aoQuality",settings.ao],["waterQuality",settings.water],["particleQuality",settings.particles],["vegetationQuality",settings.vegetation],["resolutionScale",settings.resolution],["mobDensity",settings.mobs]])$(id).value=v;$("cloudToggle").checked=settings.clouds;$("renderOut").value=`${settings.render} chunks`;$("senseOut").value=`${Math.round(settings.sense*100)}%`;$("volumeOut").value=`${Math.round(settings.volume*100)}%`}
function trimPopulation(){
  const quota=QuimiCraftMobSpawn.limits[settings.mobs];
  const distance=e=>Math.hypot(player.pos.x-e.x,player.pos.z-e.z);
  const live=e=>!e.dead&&!e.persistent&&!e.petsite&&!e.bonded;
  function remove(e){
    if(!e.aquatic){removeEntity(e);return}
    e.dead=true;
    clearCreatureStone(e);creatureAfflictions.delete(e);restoreMobColor(e);disposeAquatic(e);
    fishSchool.splice(fishSchool.indexOf(e),1);
    if(state.combatTarget===e){state.combatTarget=null;state.combatTargetTime=0}
  }
  const groups=[
    [[...entities,...fishSchool].filter(e=>live(e)&&e.hostile),quota.hostile],
    [entities.filter(e=>live(e)&&!e.hostile&&!e.plant&&!e.birth),quota.natural],
    [fishSchool.filter(e=>!e.dead),quota.aquatic]
  ];
  for(const [actors,cap] of groups){
    for(const actor of actors.sort((a,b)=>distance(a)-distance(b)).slice(cap)){
      if(!actor.dead)remove(actor);
    }
  }
}
function applyGraphics(rebuild=false){renderer.shadowMap.enabled=settings.shadows>0;sunLight.castShadow=settings.shadows>0;const size=settings.shadows===1?1024:2048;if(sunLight.shadow.mapSize.x!==size){sunLight.shadow.mapSize.set(size,size);if(sunLight.shadow.map){sunLight.shadow.map.dispose();sunLight.shadow.map=null}}renderer.setPixelRatio(Math.min(devicePixelRatio*(+settings.resolution||1),1.6));waterMat.uniforms.uQuality.value=settings.water===0?.12:settings.water===1?.58:1;cloudGroup.visible=!!settings.clouds;stars.visible=!!settings.clouds;for(const [,ch] of chunks)ch.group.traverse(o=>{if(o.isMesh){o.castShadow=settings.shadows>0&&!o.userData.translucentBlock;o.receiveShadow=settings.shadows>0&&!o.userData.translucentBlock}});entityRoot.traverse(o=>{if(o.isMesh)o.castShadow=settings.shadows>0&&!o.material.transparent&&!o.userData.noShadow});playerBody.traverse(o=>{if(o.isMesh)o.castShadow=settings.shadows>0});trimPopulation();if(settings.mobs===0)syncVillagePets(null);updateTorches();saveSettings();syncGraphicControls();if(rebuild)refreshChunkGraphics()}
function applyPreset(name){const p={low:{render:horizon.presetRange.low,shadows:0,ao:0,water:0,particles:0,vegetation:0,resolution:.65,clouds:false,mobs:1},medium:{render:horizon.presetRange.medium,shadows:1,ao:1,water:1,particles:1,vegetation:1,resolution:.85,clouds:true,mobs:1},high:{render:horizon.presetRange.high,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:2},cinematic:{render:horizon.presetRange.cinematic,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:3}}[name]||{};const rebuild=p.ao!==settings.ao||p.vegetation!==settings.vegetation;Object.assign(settings,p,{preset:name});centerChunk.x=999;ensureChunks(true);applyGraphics(rebuild)}
function renderGraphicsQuick(){$("graphicsControls").innerHTML=`<div class="setting"><label>Preset atual</label><select id="quickPreset" class="compact-select"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="cinematic">Cinemática</option><option value="custom">Personalizada</option></select></div><div class="setting"><label>Sombras</label><button class="secondary" data-cycle="shadows">${['Off','Baixas','Altas'][settings.shadows]}</button></div><div class="setting"><label>Ambient occlusion</label><button class="secondary" data-cycle="ao">${['Off','Suave','Completo'][settings.ao]}</button></div><div class="setting"><label>Partículas</label><button class="secondary" data-cycle="particles">${['Off','Reduzidas','Completas'][settings.particles]}</button></div><div class="setting"><label>Vegetação</label><button class="secondary" data-cycle="vegetation">${['Essencial','Reduzida','Completa'][settings.vegetation]}</button></div>`;$("quickPreset").value=settings.preset;$("quickPreset").onchange=e=>{applyPreset(e.target.value);renderGraphicsQuick()};$("graphicsControls").querySelectorAll("[data-cycle]").forEach(b=>b.onclick=()=>{const k=b.dataset.cycle,old=settings[k];settings[k]=(old+1)%3;settings.preset="custom";applyGraphics(k==="ao"||k==="vegetation");renderGraphicsQuick()})}
function openGraphics(){state.graphics=true;state.paused=false;$("pause").classList.remove("open");$("graphics").classList.add("open");renderGraphicsQuick()}
function closeGraphics(){state.graphics=false;$("graphics").classList.remove("open");state.paused=true;$("pause").classList.add("open")}
function saveSettings(){localStorage.qc_settings=JSON.stringify(settings)}

for(const id of ["exportWorldTitle","exportWorldPause"])$(id).onclick=exportCurrentWorld;
for(const id of ["importWorldTitle","importWorldPause"])$(id).onclick=()=>$("worldImportFile").click();
$("worldImportFile").onchange=e=>importCurrentWorld(e.target.files[0]);
$("fieldworkClose").onclick=()=>{$("fieldworkPanel").hidden=true};
$("fieldworkNotebook").onclick=()=>scienceUI?.openNotebook("observations");
$("fieldworkResume").onclick=()=>{
  startFieldwork();
  state.paused=false;
  $("pause").classList.remove("open");
  requestPointer();
};
$("playBtn").onclick=()=>{if(importingWorld)return;initAudio();$("loaderReady").hidden=true;startWorldLoading()};
$("loaderRetry").onclick=()=>{$("loaderReady").hidden=true;startWorldLoading()};
$("loaderEnter").onclick=()=>enterLoadedWorld();
$("loaderGuided").onclick=()=>enterLoadedWorld(true);
$("customizeBtn").onclick=openCharacter;$("newWorldTitleBtn").onclick=restartWorld;$("newWorldBtn").onclick=restartWorld;
$("cameraModeBtn").hidden=touchInput;
$("cameraModeBtn").onclick=()=>{
  state.paused=false;
  if(playerInput.mode==="drag")playerInput.retryLock();
  else playerInput.useDrag();
};
$("resumeBtn").onclick=()=>{state.paused=false;$("pause").classList.remove("open");$("pauseCopy").textContent="O laboratório, a vila e as criaturas esperam por você.";requestPointer({notify:true})};$("pauseHistoryBtn").onclick=()=>openMessageHistory(true);$("graphicsBtn").onclick=openGraphics;$("restartBtn").onclick=respawn;
$("titleBtn").onclick=()=>{saveWorldState();state.started=false;state.startQueued=false;state.awaitingEntry=false;state.playing=false;state.paused=false;$("pause").classList.remove("open");$("hud").classList.remove("visible");$("titleScreen").classList.remove("hidden");messageCenter.clearVisible()};
document.querySelector("[data-close=inventory]").onclick=closeInventory;$("recipeBookToggle").onclick=()=>{recipeBookOpen=!recipeBookOpen;updateRecipeBookState()};$("recipeBookClose").onclick=()=>{recipeBookOpen=false;updateRecipeBookState()};$("craftOutput").onclick=()=>craft();document.querySelector("[data-close=chemistry]").onclick=closeChemistry;$("periodicTableBtn").onclick=openPeriodicTable;document.querySelector("[data-close=periodicTable]").onclick=closePeriodicTable;document.querySelector("[data-close=shop]").onclick=closeShop;document.querySelector("[data-close=character]").onclick=closeCharacter;document.querySelector("[data-close=devMenu]").onclick=closeDev;document.querySelector("[data-close=graphics]").onclick=closeGraphics;document.querySelector("[data-close=professor]").onclick=closeProfessor;document.querySelector("[data-close=messageHistory]").onclick=closeMessageHistory;
$("historyHudBtn").onclick=()=>openMessageHistory(false);
$("professorActions").querySelectorAll("[data-professor-view]").forEach(button=>button.onclick=()=>renderProfessor(button.dataset.professorView));
$("historyFilters").querySelectorAll("[data-history-filter]").forEach(button=>button.onclick=()=>{$("historyFilters").querySelectorAll("[data-history-filter]").forEach(item=>item.classList.toggle("active",item===button));messageCenter.setFilter(button.dataset.historyFilter)});
$("settingsToggle").onclick=()=>{$("settingsToggle").classList.toggle("open");$("settings").classList.toggle("open")};
$("qualityPreset").onchange=e=>applyPreset(e.target.value);$("renderDistance").oninput=e=>$("renderOut").value=`${e.target.value} chunks`;$("renderDistance").onchange=e=>{settings.render=horizon.normalizeRange(e.target.value);settings.preset="custom";saveSettings();centerChunk.x=999;ensureChunks(true)};
for(const [id,key,rebuild] of [["shadowQuality","shadows",false],["aoQuality","ao",true],["waterQuality","water",false],["particleQuality","particles",false],["vegetationQuality","vegetation",true],["resolutionScale","resolution",false],["mobDensity","mobs",false]])$(id).onchange=e=>{settings[key]=+e.target.value;settings.preset="custom";applyGraphics(rebuild)};
$("cloudToggle").onchange=e=>{settings.clouds=e.target.checked;settings.preset="custom";applyGraphics()};$("sensitivity").oninput=e=>{settings.sense=+e.target.value/100;$("senseOut").value=`${e.target.value}%`;saveSettings()};$("volume").oninput=e=>{settings.volume=+e.target.value/100;$("volumeOut").value=`${e.target.value}%`;if(master)master.gain.value=settings.volume*.32;saveSettings()};
chatCmdUI=commandEngine.attachUI({
  input:$("chatInput"),listEl:$("cmdSuggest"),hintEl:$("cmdHint"),requireSlash:true,
  onSubmit:raw=>submitChat(raw),onEscape:closeChat
});
devCmdUI=commandEngine.attachUI({
  input:$("devCommand"),listEl:$("devCmdSuggest"),hintEl:$("devCmdHint"),requireSlash:false,
  onSubmit:raw=>{runDevCommand(raw);$("devCommand").value=""},onEscape:closeDev
});
$("runCommand").onclick=()=>{runDevCommand($("devCommand").value);$("devCommand").value="";devCmdUI?.hide()};


document.addEventListener("keydown",e=>{
  if(state.loading||state.awaitingEntry)return;
  if(state.chat)return;
  if(state.map){
    const typing=e.target?.matches?.("input, textarea, select, [contenteditable]");
    if(e.code==="Escape"||e.code==="KeyM"&&!typing){
      e.preventDefault();
      if(!e.repeat){
        if(e.code==="Escape"&&explorationMapView.cancelPlacement())$("mapWaypointNew").focus();
        else closeExplorationMap();
      }
    }
    return;
  }
  if(e.target?.matches?.("input, textarea, select, button")&&e.code!=="Escape"&&!state.playing)return;
  if(e.code==="Escape"){
    e.preventDefault();
    if(state.catalog){catalog.close();return}
    if(state.alchemyWorkshop){alchemyUI.close();return;}
    if(state.frontierWorkshop){closeFrontierWorkshop();return}
    if(state.extermination)return closeExtermination();
    if(state.scientificNotebook)return closeScienceModal("scientificNotebook");if(state.researchTree)return closeScienceModal("researchTree");if(state.scienceStation)return closeScienceModal("scienceStation");if(state.history)return closeMessageHistory();if(state.professor)return closeProfessor();if(state.periodic)return closePeriodicTable();if(state.inventory)return closeInventory();if(state.chemistry)return closeChemistry();if(state.shop)return closeShop();if(state.character)return closeCharacter();if(state.devOpen)return closeDev();if(state.graphics)return closeGraphics();if(state.paused){state.paused=false;$("pause").classList.remove("open");return requestPointer()}if(state.started)return showPause()
  }
  if((e.key==="/"||e.code==="KeyT"||e.code==="Enter")&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();e.stopPropagation();return openChat(e.key==="/"?"/":"")}
  if(e.code==="Tab"&&state.started&&(state.inventory||!uiBlocking())&&!state.paused){e.preventDefault();return state.inventory?closeInventory():openInventory()}
  if(e.code==="KeyM"&&state.started&&!uiBlocking()&&!state.paused&&!e.repeat){
    e.preventDefault();
    if(!e.shiftKey)return openExplorationMap();
    const stats=elementMissions.getStats();
    if(stats.introduced){elementMissions.setTrackerHidden(!stats.trackerHidden);updateMissionHud()}
    return;
  }
  if(e.code==="KeyN"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return scienceUI?.openNotebook()}
  if(e.code==="KeyR"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return scienceUI?.openResearch()}
  if(e.code==="KeyG"&&state.playing&&!e.repeat&&!vehicles.current()&&!riding){e.preventDefault();return collectScientificSample()}
  if(e.code==="KeyV"&&state.playing&&!e.repeat){e.preventDefault();return vehicleQuickAction()}
  if(e.code==="KeyX"&&state.playing&&!e.repeat){e.preventDefault();return useOffhandFocus()}
  if(sleeping)return;
  if(e.code==="KeyQ"&&state.playing&&!e.repeat&&(state.deckTarget||riding||vehicles.current()||QuimiCraftVehicles.itemData[selectedItem()])){
    e.preventDefault();return useOrPlace();
  }
  if(state.playing&&playerInput.mode==="drag"){
    if(e.code.startsWith("Arrow"))e.preventDefault();
    if(e.code==="KeyF"&&!e.repeat){
      if(player.petrified>0)return;
      if(state.deckTarget?.kind==="deckBlock")return breakDeckTarget();
      if(riding)return attackWithMount();
      if(vehicles.current())return vehicles.operate(state.target);
      if(WEAPONS.has(selectedItem()))attackSelected(false);
      else state.left=true;
    }
    if(e.code==="KeyQ"&&!e.repeat){e.preventDefault();return useOrPlace()}
  }
  keys[e.code]=true;if(e.code.startsWith("Digit")){const n=+e.code.slice(5);if(n>=1&&n<=9)chooseSlot(n-1)}if(e.code==="KeyC"&&state.playing){e.preventDefault();cycleCamera()}if(e.code==="KeyE"&&state.playing&&!e.repeat){e.preventDefault();interact()}if(e.code==="Space"){e.preventDefault();if(state.playing&&!e.repeat){if(isCreative()&&!riding&&!vehicles.current()){const now=performance.now();if(now-lastSpaceTapAt<300){dev.fly=!dev.fly;lastSpaceTapAt=0;player.vel.y=0;player.fallStart=player.pos.y;updateGamemodeHud();return}lastSpaceTapAt=now}if(!dev.fly)jumpOrGlide()}}
});
document.addEventListener("keyup",e=>{keys[e.code]=false;if(e.code==="KeyF")state.left=false});
document.addEventListener("mouseup",e=>{if(e.button===0&&!keys.KeyF)state.left=false});
window.addEventListener("blur",clearInput);
renderer.domElement.addEventListener("wheel",e=>{if(state.playing){e.preventDefault();chooseSlot(state.selected+(e.deltaY>0?1:-1))}},{passive:false});
document.querySelectorAll("[data-mobile-key]").forEach(button=>{
  const setPressed=pressed=>{keys[button.dataset.mobileKey]=pressed;button.classList.toggle("pressed",pressed)};
  button.addEventListener("pointerdown",event=>{event.preventDefault();button.setPointerCapture?.(event.pointerId);setPressed(true)});
  for(const eventName of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(eventName,()=>setPressed(false))
});
document.querySelectorAll("[data-mobile-action]").forEach(button=>{
  const release=()=>{button.classList.remove("pressed");if(button.dataset.mobileAction==="attack")state.left=false;if(button.dataset.mobileAction==="jump")keys.Space=false};
  button.addEventListener("pointerdown",event=>{
    event.preventDefault();if(!state.playing)return;button.classList.add("pressed");button.setPointerCapture?.(event.pointerId);
    const action=button.dataset.mobileAction;
    if(sleeping||(player.petrified>0||gasBlackout>0)&&action!=="inventory")return;
    if(action==="jump"){keys.Space=true;jumpOrGlide()}
    else if(action==="attack"){if(state.deckTarget?.kind==="deckBlock")breakDeckTarget();else if(riding)attackWithMount();else if(vehicles.current())vehicles.operate(state.target);else if(WEAPONS.has(selectedItem()))attackSelected(false);else state.left=true}
    else if(action==="use")useOrPlace();else if(action==="focus")useOffhandFocus();else if(action==="interact")interact();else if(action==="sample"&&!vehicles.current()&&!riding)collectScientificSample();else if(action==="vehicle")vehicleQuickAction();else if(action==="inventory")openInventory()
  });
  for(const eventName of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(eventName,release)
});

window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio*(+settings.resolution||1),1.6))});syncGraphicControls();applyGraphics();

let bubbleClock=0,lastWorldSaveAt=0,wasNearLaboratory=false,mobileControlsVisible=false;
function syncMobileControls(){
  if(!touchInput)return;const visible=!!(state.playing&&!uiBlocking());if(visible===mobileControlsVisible)return;mobileControlsVisible=visible;$("mobileControls")?.classList.toggle("active",visible)
}
const colorNight=new THREE.Color(0x071326),colorDawn=new THREE.Color(0xd8795c),colorDay=new THREE.Color(0x8bc8e7),colorFog=new THREE.Color(),waterTint=new THREE.Color();
const climateGroup=new THREE.Group();scene.add(climateGroup);
const precipMax=230,precipPositions=new Float32Array(precipMax*6),snowPositions=new Float32Array(precipMax*3);
const rainGeo=new THREE.BufferGeometry(),snowGeo=new THREE.BufferGeometry();
rainGeo.setAttribute("position",new THREE.BufferAttribute(precipPositions,3).setUsage(THREE.DynamicDrawUsage));
snowGeo.setAttribute("position",new THREE.BufferAttribute(snowPositions,3).setUsage(THREE.DynamicDrawUsage));
const rainVisual=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0x9fd2eb,transparent:true,opacity:.59,depthWrite:false}));
const snowVisual=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xebf8ff,size:.13,transparent:true,opacity:.82,depthWrite:false,sizeAttenuation:true}));
for(const obj of [rainVisual,snowVisual]){obj.visible=false;obj.frustumCulled=false;climateGroup.add(obj)}
let lastPrecipitationFrame=0,lastPrecipitationWeather="",lightningMesh=null,lightningLife=0,lightningClock=7,fireSpreadClock=0;
function updateFire(dt,weather){
  fireSpreadClock+=dt;if(fireSpreadClock<1.2)return;fireSpreadClock=0;
  const nearby=[];
  for(const [k,id] of mods){if(id!==BLOCK.FIRE)continue;const [x,y,z]=k.split("|").map(Number);
    if(Math.hypot(x-player.pos.x,z-player.pos.z)>70)continue;
    nearby.push([x,y,z]);if(nearby.length>80)break;
  }
  for(const [x,y,z] of nearby){
    if(getBlock(x,y,z)===BLOCK.WATER||weather==="rain"||weather==="storm"){
      if(Math.random()<.5)setBlock(x,y,z,BLOCK.AIR);continue
    }
    if(Math.random()<.22)setBlock(x,y,z,BLOCK.AIR);
    if(Math.random()<.36)for(const [dx,dy,dz] of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,-1,0]]){
      const bx=x+dx,by=y+dy,bz=z+dz,id=getBlock(bx,by,bz);
      if(FIRE_FUEL.has(id)&&Math.random()<.23&&!isLabProtectedBlock(bx,by,bz)){
        setBlock(bx,by,bz,BLOCK.FIRE);break
      }
    }
  }
  if(getBlock(player.pos.x,player.pos.y+.4,player.pos.z)===BLOCK.FIRE){
    player.fireDamageClock=(player.fireDamageClock||0)-1.2;
    if(player.fireDamageClock<=0){damagePlayer(4,"fogo");player.fireDamageClock=2}
  }
}
function updatePrecipitation(dt,now,weather){
  const rain=weather==="rain"||weather==="storm",snow=weather==="snow";
  rainVisual.visible=rain;
  snowVisual.visible=snow;
  if((rain||snow)&&(now-lastPrecipitationFrame>46||weather!==lastPrecipitationWeather)){
    lastPrecipitationFrame=now;
    lastPrecipitationWeather=weather;
    const clock=now*(rain?.0008:.00016),span=23,baseX=player.pos.x,baseY=player.pos.y+12,baseZ=player.pos.z;
    let count=0;
    for(let i=0;i<precipMax;i++){
      const a=hash(i,911),b=hash(i,279),c=hash(i,113),wind=rain?clock*2:clock*.4;
      const x=baseX+(fract(a+wind*.037)-.5)*span,z=baseZ+(fract(b+wind*.02)-.5)*span;
      const y=baseY-fract(c+clock*(rain?2.9:.52))*20;
      const bottom=QuimiCraftFrontier.rainSpan(y,rain?.73:.16,roofAt(x,z));
      if(bottom===null)continue;
      if(rain)precipPositions.set([x,y,z,x,bottom,z],count*6);
      else snowPositions.set([x,y,z],count*3);
      count++;
    }
    rainGeo.setDrawRange(0,rain?count*2:0);
    snowGeo.setDrawRange(0,snow?count:0);
    rainGeo.attributes.position.needsUpdate=true;
    snowGeo.attributes.position.needsUpdate=true;
  }
  if(weather==="storm"&&state.playing){
    lightningClock-=dt;
    if(lightningClock<0){
      lightningClock=8+Math.random()*12;lightningLife=.44;
      const forward=21+Math.random()*17,side=(Math.random()-.5)*forward*.90;
      const fx=-Math.sin(player.yaw),fz=-Math.cos(player.yaw);
      const sx=player.pos.x+fx*forward-fz*side,sz=player.pos.z+fz*forward+fx*side;
      const floor=roofAt(sx,sz)+.10,top=Math.max(player.pos.y+26,floor+25),verts=[];
      let x=sx+(Math.random()-.5)*8,y=top,z=sz+(Math.random()-.5)*8;
      for(let n=1;n<=13;n++){
        const t=n/13,jitter=n===13?0:2.8,nx=sx+(Math.random()-.5)*jitter,nz=sz+(Math.random()-.5)*jitter;
        const ny=Math.max(lerp(top,floor,t),roofAt(nx,nz)+.08);
        verts.push(x,y,z,nx,ny,nz);
        if(n===4||n===7){
          const sign=n===4?1:-1,bx=nx+sign*(4+Math.random()*3),bz=nz+sign*(2+Math.random()*2);
          const by=Math.max(ny-6,roofAt(bx,bz)+.1);
          if(by<ny)verts.push(nx,ny,nz,(nx+bx)/2,ny-1,(nz+bz)/2,(nx+bx)/2,ny-1,(nz+bz)/2,bx,by,bz);
        }
        x=nx;y=ny;z=nz;
      }
      if(lightningMesh){climateGroup.remove(lightningMesh);lightningMesh.geometry.dispose();lightningMesh.material.dispose()}
      const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));lightningMesh=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xf8fcff,transparent:true,opacity:1,depthWrite:false,toneMapped:false}));climateGroup.add(lightningMesh);
      if(Math.random()<.26){const tx=Math.floor(sx),tz=Math.floor(sz),ty=terrainHeight(tx,tz)+1;if(ty>WATER_LEVEL&&!isLabProtectedBlock(tx,ty,tz)&&roofAt(tx,tz)<=ty&&getBlock(tx,ty,tz)===BLOCK.AIR){if(FIRE_FUEL.has(getBlock(tx,ty-1,tz)))setBlock(tx,ty,tz,BLOCK.FIRE)}}
    }
  }
  if(lightningLife>0){lightningLife-=dt;if(!document.documentElement.classList.contains("reduced-flashing")&&!labSafe()&&roofAt(player.pos.x,player.pos.z)<=player.pos.y+1.4)renderer.toneMappingExposure+=Math.max(0,lightningLife)*.55;if(lightningMesh){lightningMesh.material.opacity=clamp(lightningLife*3.9,0,1);if(lightningLife<=0){climateGroup.remove(lightningMesh);lightningMesh.geometry.dispose();lightningMesh.material.dispose();lightningMesh=null}}}
  updateFire(dt,weather)
}
function updateClimateState(dt,now){
  if(state.playing&&!state.paused)climateState.elapsed+=dt;
  const season=currentSeason();if(season!==climateState.season){
    climateState.season=season;if(initialReady){for(const ch of chunks.values())rebuildChunk(ch.cx,ch.cz);toast(`Nova estação: ${SEASONS[season]}`)}
  }
  const weather=currentWeather();if(weather!==climateState.lastWeather){climateState.lastWeather=weather;const txt={clear:"Céu aberto",rain:"Chuva",snow:"Neve",storm:"Tempestade elétrica"}[weather];if(initialReady)toast(`Clima: ${txt}`)}
  const badge=$("climateBadge");if(badge&&state.started&&labSafe())badge.textContent="Laboratório Carbono · Área segura";else if(badge)badge.textContent=`${SEASONS[season]} · ${{clear:"Ensolarado",rain:"Chuva",snow:"Neve",storm:"Tempestade"}[weather]}`;
  if(state.started)updatePrecipitation(dt,now,weather);
  return weather
}
let horizonClock=0,horizonVisible=null,horizonWanted=0,horizonOrigin="",horizonSetting=0;
let submergedSeconds=0;
function visibleRenderRange(dt){
  const pos=camera.position,key=ckey(Math.floor(pos.x/CHUNK),Math.floor(pos.z/CHUNK));
  horizonClock-=dt;
  if(horizonClock<=0||horizonOrigin!==key||horizonSetting!==settings.render){
    horizonWanted=horizon.loadedRange(pos,settings.render,CHUNK,(x,z)=>chunks.has(ckey(x,z)));
    horizonOrigin=key;horizonSetting=settings.render;horizonClock=.14;
  }
  if(horizonVisible===null||horizonWanted<horizonVisible)horizonVisible=horizonWanted;
  else{
    horizonVisible=lerp(horizonVisible,horizonWanted,1-Math.exp(-dt*4));
    if(horizonWanted-horizonVisible<.025)horizonVisible=horizonWanted;
  }
  return horizonVisible;
}
function chunkWithinFog(cx,cz,view){
  if(!view)return true;
  const x=cx*CHUNK,z=cz*CHUNK;
  const dx=Math.max(x-view.x,view.x-x-CHUNK,0),dz=Math.max(z-view.z,view.z-z-CHUNK,0);
  return dx*dx+dz*dz<=view.range*view.range;
}
function updateTerrainVisibility(fogDistance){
  const step=CHUNK/2,x=Math.floor(camera.position.x/step)*step+step*.5,z=Math.floor(camera.position.z/step)*step+step*.5;
  const range=Math.ceil(fogDistance/step)*step+step;
  if(terrainVisibility?.x===x&&terrainVisibility.z===z&&terrainVisibility.range===range)return;
  terrainVisibility={x,z,range};
  for(const ch of chunks.values())ch.group.visible=chunkWithinFog(ch.cx,ch.cz,terrainVisibility);
}
function updateCycle(dt,now){
  if(!state.paused){
    state.day+=dt/DAY_SECONDS;
    if(state.day>=1){state.day-=1;state.dayCount++}
  }
  const phase=folklore.phase(state.dayCount);
  if(phase!==shownMoonPhase){
    shownMoonPhase=phase;
    moonOrb.children[1].material.map=moonTextures[phase];
    const [name,icon]=folklore.phases[phase],label=$("moonLabel");
    label.textContent=icon;label.title=name;label.setAttribute("aria-label",name);
  }
  const weather=updateClimateState(dt,now),season=currentSeason();
  const ang=state.day*TAU,solar=Math.sin(ang),day=clamp((solar+.12)/.32,0,1),dusk=Math.pow(1-Math.abs(clamp(solar,-1,1)),6),cx=state.started?player.pos.x:spawn.x,cz=state.started?player.pos.z:spawn.z;
  const sunPos=new THREE.Vector3(Math.cos(ang)*105,solar*105,Math.sin(ang*.73)*55);sunOrb.position.set(cx+sunPos.x,player.pos.y+sunPos.y,cz+sunPos.z);moonOrb.position.set(cx-sunPos.x,player.pos.y-sunPos.y,cz-sunPos.z);
  sunLight.position.set(cx+(solar>=-.06?sunPos.x:-sunPos.x),player.pos.y+Math.abs(sunPos.y)+18,cz+(solar>=-.06?sunPos.z:-sunPos.z));sunLight.target.position.set(cx,player.pos.y,cz);sunLight.target.updateMatrixWorld();sunLight.intensity=lerp(.16,1.35,day);sunLight.color.set(day>.3?0xffedce:0x8ca9d8);hemi.intensity=lerp(.19,.72,day);hemi.color.set(day>.3?0xbde4ff:0x324a78);hemi.groundColor.set(day>.25?0x3a422c:0x11172a);
  colorFog.copy(colorNight).lerp(colorDay,day);if(dusk>.05)colorFog.lerp(colorDawn,dusk*.56);renderer.toneMappingExposure=lerp(.69,1.08,day);
  if(season===3)colorFog.lerp(new THREE.Color(0xc2d4e4),day*.26);
  if(season===2)colorFog.lerp(new THREE.Color(0xb78b69),day*.16);
  if(weather==="rain"||weather==="storm"){colorFog.lerp(new THREE.Color(0x465a74),.38);renderer.toneMappingExposure*=.84}
  if(weather==="snow"){colorFog.lerp(new THREE.Color(0xb5c8d5),.2);}
  sky.position.copy(camera.position);skyMat.uniforms.uTime.value=state.day;
  const overcast=weather==="storm"?.94:weather==="rain"?.64:weather==="snow"?.58:0;
  skyMat.uniforms.uOvercast.value=lerp(skyMat.uniforms.uOvercast.value,overcast,Math.min(1,dt*3.3));
  stars.position.copy(camera.position);starMat.opacity=clamp((-.04-solar)*2.2,0,.88)*(1-overcast);sunOrb.visible=solar>-.18;moonOrb.visible=solar<.17&&phase!==0;
  cloudGroup.position.set(cx+Math.sin(now*.000026)*19,player.pos.y,cz+Math.cos(now*.000023)*16);cloudMaterial.opacity=weather==="storm"?.72:weather==="rain"?.83:lerp(.36,.88,day);cloudMaterial.color.set(weather==="storm"?0x7c8da8:weather==="rain"?0xb3bfca:0xffffff);sunOrb.children[0].material.opacity=weather==="storm"?.24:weather==="rain"?.5:1;moonOrb.children[0].material.opacity=weather==="storm"?.3:1;sunOrb.children[1].lookAt(camera.position);moonOrb.children[1].lookAt(camera.position);waterMat.uniforms.uTime.value=now*(document.documentElement.classList.contains("reduced-motion")?.00024:.001);lavaMat.uniforms.uTime.value=now*(document.documentElement.classList.contains("reduced-motion")?.00024:.001);blockGlowTime.value=now*.001;waterMat.uniforms.uSun.value.copy(sunPos).normalize();
  waterMat.uniforms.uSurfaceLight.value.copy(colorFog);
  const cameraSubmerged=state.started&&isCameraUnderwater();
  const clarity=cameraSubmerged?underwaterClarity():null;
  const waterFog=cameraSubmerged?fluidFlow.blendWaterFog(camera.position.x,camera.position.z,waterFogProfile):null;
  submergedSeconds=cameraSubmerged?submergedSeconds+(state.playing?dt:0):0;
  sky.visible=!cameraSubmerged;
  stars.visible=cloudGroup.visible=!cameraSubmerged&&settings.clouds;
  if(lightningMesh)lightningMesh.visible=!cameraSubmerged;
  if(cameraSubmerged){
    sunOrb.visible=moonOrb.visible=rainVisual.visible=snowVisual.visible=false;
    const {x,y,z}=camera.position,depth=waterColumnSurface(x,y,z)-y;
    const lightThroughWater=Math.exp(-depth/(11*waterFog.visibility));
    const daylight=day*(weather==="storm"?.58:weather==="clear"?1:.78);
    waterTint.setRGB(...waterFog.rgb);
    colorFog.copy(waterTint).multiplyScalar(.23+daylight*(.25+.34*lightThroughWater)+clarity*.10);
    hemi.color.lerp(waterTint,.62);
    hemi.groundColor.lerp(colorFog,.55);
    sunLight.color.lerp(waterTint,.55);
    sunLight.intensity*=lerp(.33,.88,lightThroughWater);
  }
  updateUnderwaterUI(clarity,colorFog);
  const fog=horizon.fogRange(visibleRenderRange(dt),CHUNK,weather,clarity,submergedSeconds,waterFog?.visibility);
  scene.fog.near=fog.near;scene.fog.far=fog.far;
  if(state.started)updateTerrainVisibility(fog.far);
  scene.fog.color.copy(colorFog);scene.background.copy(colorFog);
  skyMat.uniforms.uHorizon.value.copy(colorFog);
  for(const material of [waterMat,lavaMat]){
    material.uniforms.uFogColor.value.copy(colorFog);
    material.uniforms.uFogNear.value=fog.near;
    material.uniforms.uFogFar.value=fog.far;
  }
  const hours=(state.day*24+6)%24,hh=Math.floor(hours),mm=Math.floor((hours-hh)*60);$("timeLabel").textContent=`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;$("dayLabel").textContent=`DIA ${state.dayCount}`;const arcX=clamp((Math.cos(ang-Math.PI)+1)*50,4,96),arcY=Math.max(0,Math.abs(solar)*17);$("orb").style.left=arcX+"%";$("orb").style.bottom=(arcY-4)+"px";$("orb").style.background=solar>=0?"#ffd77a":"#d9eaff";$("orb").style.boxShadow=`0 0 10px ${solar>=0?"#ffd77a":"#d9eaff"}`;
  lightClock+=dt;
  if(state.started&&lightClock>1.2){
    lightClock=0;
    if(torchDirty||torchCenter!==Math.floor(player.pos.x/CHUNK)+","+Math.floor(player.pos.z/CHUNK))updateTorches();
  }
  for(const l of torchLights)if(!l.userData.steady)l.intensity=1.05+Math.sin(now*.011+l.userData.seed)*.18+hash(Math.floor(now/75),l.userData.seed)*.12;
  if(solar<-.2&&audioCtx&&now-lastCricket>1800+Math.random()*3600){lastCricket=now;cricket()}
}
let menuBackdrop;
function updateMenu(now){
  playerBody.visible=false;firstHands.visible=false;
  menuBackdrop??=QuimiCraftMenuBackdrop.create(THREE,{terrain:terrainHeight,biome:biomeAt,seed:WORLD_SEED,water:WATER_LEVEL});
  menuBackdrop.pose(now,camera.aspect,document.documentElement.classList.contains("reduced-motion"));
}
let gameplayFPS={start:0,frames:0,preset:""};
function updateGameplayFPS(now){
  if(!state.playing){gameplayFPS.start=0;return}
  if(!gameplayFPS.start||gameplayFPS.preset!==settings.preset)gameplayFPS={start:now,frames:0,preset:settings.preset};
  gameplayFPS.frames++;
  if(now-gameplayFPS.start>=10000){
    const detail={preset:gameplayFPS.preset,fps:Math.round(gameplayFPS.frames*1000/(now-gameplayFPS.start)),renderDistance:settings.render};
    performance.measure("QuimiCraft · exploração",{start:gameplayFPS.start,end:now,detail});
    gameplayFPS={start:now,frames:0,preset:settings.preset};
  }
}
function updateHud(){state.frames++;const now=performance.now();if(now-state.fpsTime>500){state.fps=Math.round(state.frames*1000/(now-state.fpsTime||1));state.frames=0;state.fpsTime=now;const biome=biomeAt(player.pos.x,player.pos.z);$("fps").textContent=`FPS ${state.fps}`;$("coords").innerHTML=`X ${Math.floor(player.pos.x)} &nbsp; Y ${Math.floor(player.pos.y)} &nbsp; Z ${Math.floor(player.pos.z)}`;const patch=habitats.profile(habitats.at(player.pos.x,player.pos.z,biome));$("biome").textContent=(patch?patch.name+" · "+biome:biome).toUpperCase()+(player.inWater?" · "+regionalWater(player.pos.x,player.pos.z).label:"");if(state.playing&&biome!==lastMissionBiome){lastMissionBiome=biome;elementMissions?.recordEvent("visit_biome",{id:biome})}}}
function verifyLaboratoryOnEntry(){
  ensureLaboratoryStaff();
  if(!npcs.some(npc=>npc.role==="carbon")){console.warn("[QuimiCraft][Laboratório] Prof. Carbono ausente; NPC restaurado no socket professor-position.");ensureProfessorCarbono()}
  let report=validateLaboratory({recordStep:false});if(report.repaired)report=validateLaboratory({repair:false,recordStep:false});
  if(!report.valid){console.warn("[QuimiCraft][Laboratório] Verificação de entrada detectou conteúdo inconsistente; reconstruindo apenas a decoração e as colisões.");createLaboratoryDecor();report=validateLaboratory({recordStep:false});if(report.repaired)report=validateLaboratory({repair:false,recordStep:false})}
  if(report.valid&&labGenerationReport.repairs.length)messageCenter.add({category:"system",text:"O Laboratório Carbono foi verificado e um componente foi reparado com segurança."});
  return report.valid
}
function bubble(pos){if(settings.particles===0)return;const m=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.045,6,5),new THREE.MeshBasicMaterial({color:0xa7eaff,transparent:true,opacity:.48,wireframe:true}));m.position.set(pos.x+(Math.random()-.5)*.55,pos.y+.4+Math.random(),pos.z+(Math.random()-.5)*.55);m.userData.v=new THREE.Vector3((Math.random()-.5)*.08,.38+Math.random()*.3,(Math.random()-.5)*.08);m.userData.life=.7+Math.random()*.8;particleGroup.add(m);particles.push(m)}
function animate(now){
  requestAnimationFrame(animate);const elapsed=Math.max(0,(now-state.lastFrame)/1000),dt=clamp(elapsed,.001,.035);state.lastFrame=now;processChunks();
  if(state.catalog)return;
  if(state.playing){updateFieldAir(dt);updateAfflictions(dt);if(!gasBlackout)playerInput.turn(keys,dt);updateLabDecor(now,Math.min(.28,elapsed));updatePhysics(dt);updateQueuedPlacement(dt);updateFluids(dt);alchemyPlay.tick(dt);tickPlayerActivities(dt);professions.update(dt);updateFish(dt,now);ensureChunks();updateTarget(dt);updateEntities(dt,now);updateProjectiles(dt);updateDragonBursts(dt);updateDrops(dt,now);updateEnemyHud(dt);updateInteraction();const nearLab=labBoundsContains(player.pos.x,player.pos.z,3);if(nearLab&&!wasNearLaboratory)verifyLaboratoryOnEntry();wasNearLaboratory=nearLab;bubbleClock+=dt;if(player.inWater&&bubbleClock>.17){bubbleClock=0;bubble(player.pos)}if(now-lastWorldSaveAt>10000){lastWorldSaveAt=now;saveWorldState()}}else if(!state.started)updateMenu(now);else updatePlayerCamera(dt,false);
  updateMobDamageFlashes(now,dt);
  if(state.playing)explorationSurvey.reveal(player.pos.x,player.pos.z);
  syncMobileControls();updateVehicleHud();updateMapGuide();updateGameplayFPS(now);updateCycle(dt,now);frontierFx.update(dt);aquaticFx.update(dt);updateParticles(dt);updateHud();
  if(!state.started&&!state.loading&&menuBackdrop){
    renderer.toneMappingExposure=1.02;
    renderer.render(menuBackdrop.scene,menuBackdrop.camera);
  }else renderer.render(scene,camera);
}
const alchemyExchange=(need,out)=>transactInventory(need,out,LIQUID_REAGENT_PROFILES);
const alchemyProgress=QuimiCraftAlchemy.createProgress({
  restore:storedAlchemy,sitePositions:alchemySitePositions,legacyOrigin:legacyAlchemyOrigin,exchange:alchemyExchange,count:scienceInventoryCount,
  observe:(text,category)=>scienceSystem.addObservation(text,category),
  discover:(category,id,entry)=>scienceSystem.registerDiscovery(category,id,entry),
  save(data){try{localStorage.qc_alchemy_v1=JSON.stringify({...data,seed:WORLD_SEED});}
    catch(error){reportSaveIssue("Não foi possível salvar o progresso de alquimia.",error);}
  }
});
const alchemyUI=QuimiCraftAlchemyUI.create({
  panel:$("alchemyWorkshop"),progress:alchemyProgress,openModal:openScienceModal,closeModal:closeScienceModal,
  itemName,itemIcon:itemIconMarkup,count:scienceInventoryCount,exchange:alchemyExchange,glassId:BLOCK.GLASS,toast,
  bottleYield:()=>scienceSystem.isResearchUnlocked("field_alchemy")?3:2,
  feedback:result=>sound("reaction",result==="success"?.62:.31),remember:alchemyWorld.remember
});
const alchemyOres=new Set([...ecology.ores,BLOCK.COPPER,BLOCK.COAL,BLOCK.IRON,BLOCK.SULFUR,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.AMETHYST,BLOCK.CRYSTAL,BLOCK.SALT,BLOCK.NITER]);
const alchemyPlay=QuimiCraftAlchemyPlay.create({
  THREE,scene,world:alchemyWorld,progress:alchemyProgress,player,biomeAt,culture:QuimiCraftRegions.culture,
  isLoaded:(x,z)=>hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)),blockAt:getBlock,solidAt,
  isOre:id=>alchemyOres.has(id),
  spawnKeeper:spawnVillageResident,removeKeeper:removeEntity,models:playerModels,
  visible:(from,x,y,z)=>{
    const eye=from.clone().add(new THREE.Vector3(0,1.55,0)),end=new THREE.Vector3(x,y,z);
    const delta=end.clone().sub(eye).normalize();
    return combatSegmentClear(eye,end.addScaledVector(delta,-.75));
  },
  touchDoor:(site,npc)=>{
    const {x,y,z}=site.door;
    if(Math.hypot(npc.x-x-.5,npc.z-z-.5)<1.6&&getBlock(x,y,z)===BLOCK.DOOR){
      setBlock(x,y,z,BLOCK.DOOR_OPEN);
      setBlock(x,y+1,z,BLOCK.DOOR_OPEN);
    }
  },
  particles:combatParticles,play:sound,notify:toast,hud:$("alchemyEffects"),locator:$("alchemyLocator")
});
function useAlchemyPotion(id){
  if(playerActivity)return;
  if(id==="potion_mist"&&labSafe())return toast("Arremesse a poção do lado de fora do laboratório.");
  const result=alchemyProgress.use(id);
  if(!result.ok)return toast(result.message||"Não foi possível usar a poção.");
  const {potion}=result;
  if(potion.effect==="mist"){
    startPlayerActivity("throw_vial",.6,id);
    const dir=aimDirection();
    alchemyPlay.launch(attackOrigin().addScaledVector(dir,.23),dir);
  }else{
    startPlayerActivity("drink",.96,id);
    sound("splash",.52);
    const color=parseInt(potion.color.slice(1),16);
    combatParticles(new THREE.Vector3(player.pos.x,player.pos.y+1.3,player.pos.z),color,8);
  }
  toast(potion.name);
  updateVitals();
}
function useAlchemyStation({site,id}){
  if(id===BLOCK.ALCHEMY_SAMPLE){
    alchemyWorld.remember(site);
    alchemyProgress.visit(site);
    const result=alchemyProgress.collect(site.kind);
    if(!result.ok)return toast(result.message);
    sound("pickup",.52);
    return toast(site.config.sample+" · na mochila");
  }
  if(id===BLOCK.ALCHEMY_BENCH)return alchemyUI.open(site,"brew");
  const study=id===BLOCK.ALCHEMY_CELL?"cell":id===BLOCK.ALCHEMY_BALANCE&&site.kind==="crystal"?"yield":site.config.studies[0];
  alchemyUI.open(site,study);
}

const vehicles=QuimiCraftVehicles.create({
  THREE,scene,models:QuimiCraftVehicleModels.create(THREE),player,
  solid:vehicleSolid,ground:vehicleGround,liquid:(x,y,z)=>!!BDEF[getBlock(x,y,z)]?.liquid,
  water:vehicleWater,
  deckBlock:buildDeckMesh,
  cargoItem:id=>typeof id==="number"?!!BDEF[id]&&id!==BLOCK.AIR&&id!==BLOCK.WATER&&id!==BLOCK.LAVA:Object.hasOwn(ITEM_NAMES,id),
  wind:v=>{
    const angle=hash(Math.floor(v.x/40),Math.floor(v.z/40),WORLD_SEED%233)*TAU+Math.floor(climateState.elapsed/44)*.19;
    const power=currentWeather()==="storm"?1.42:.68+fieldWind*.42;
    return {x:Math.cos(angle)*power,z:Math.sin(angle)*power};
  },
  protectedPosition:(x,y,z)=>labBoundsContains(x,z,1)&&y<=LAB_LAYOUT.y+LAB_LAYOUT.height+1||inLabEntranceCorridor(x,z)&&y<=LAB_LAYOUT.y+4,
  exchange:(need,out)=>isCreative()&&!out.length&&need.length?{ok:true}:transactInventory(need,out),breakArea:excavateWithVehicle,inspect:inspectVehicleCut,surface:vehicleSurface,notice:toast,persist:persistVehicles
});
function buildDeckMesh(id,size){
  const def=BDEF[id];
  if(!def?.solid||def.hidden||def.partial||def.station||def.plant||id===BLOCK.BEDROCK||fieldLab.byBlock.has(id))return null;
  const data=arrays();
  for(const [index,face] of FACES.entries())addQuad(data,face.v,face.n,texFor(id,index));
  const geometry=geometryFrom(data);
  geometry.translate(-.5,0,-.5);geometry.scale(size,size,size);
  const clear=translucentBlocks.has(id),mesh=new THREE.Mesh(geometry,clear?clearMat:terrainMat);
  if(clear){mesh.userData.translucentBlock=true;mesh.renderOrder=3;}
  mesh.castShadow=mesh.receiveShadow=true;return mesh;
}
function breakDeckTarget(){
  const target=state.deckTarget,id=target?.vehicle.deck?.blocks.get(target.cell?.key)?.id;
  if(id&&requiredPick(id)>miningLevel())return toast("Use uma picareta adequada para retirar este bloco.");
  if(!vehicles.breakOnDeck(target,block=>transactInventory([],[[block,1]]).ok)){
    if(id)toast("Libere espaço na mochila para recolher o bloco.");
    return false;
  }
  state.deckTarget=null;sound("break",.56);return true;
}
function vehicleSolid(x,y,z){
  if(solidAt(x,y,z))return true;
  if(!labBoundsContains(x,z,1))return false;
  return aabbHitsLabDecor(x-.04,x+.04,y-.04,y+.04,z-.04,z+.04)||
    labDoor.hits(x-.04,x+.04,y-.04,y+.04,z-.04,z+.04);
}
function vehicleGround(x,z,top,bottom){
  const lo=Math.max(1,Math.ceil(bottom)),hi=Math.min(MAX_Y-1,Math.floor(top));
  for(let y=hi;y>=lo;y--){
    if(!BDEF[getBlock(x,y-1,z)]?.solid)continue;
    if(!vehicleSolid(x,y+.07,z)&&!vehicleSolid(x,y+1.04,z))return y;
  }
  return null;
}
function vehicleWater(x,z,reference){
  if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))return null;
  const guess=Math.floor(reference);
  for(let top=Math.min(MAX_Y-2,guess+2);top>=Math.max(1,guess-4);top--){
    if(getBlock(x,top,z)!==BLOCK.WATER||getBlock(x,top+1,z)===BLOCK.WATER)continue;
    let bottom=top;
    while(bottom>Math.max(1,top-4)&&getBlock(x,bottom-1,z)===BLOCK.WATER)bottom--;
    const y=top+liquidSurfaceHeight(BLOCK.WATER,x,top,z);
    return {y,depth:y-bottom};
  }
  return null;
}
function persistVehicles(){
  if(switchingWorld)return;
  try{localStorage.qc_vehicles_v1=JSON.stringify({...vehicles.snapshot(),seed:WORLD_SEED});}
  catch(error){reportSaveIssue("Não foi possível salvar os veículos.",error);}
}
function restoreVehicles(){
  try{
    const data=JSON.parse(localStorage.qc_vehicles_v1||"null");
    if(data?.seed===WORLD_SEED)vehicles.restore(data);
  }catch(error){reportSaveIssue("Não foi possível carregar os veículos.",error);}
}
const vehicleMud=new Set([BLOCK.MUD,BLOCK.CLAY,BLOCK.PEAT,BLOCK.AMBER_PEAT,BLOCK.FARMLAND_WET].filter(Number.isInteger));
const vehicleLoose=new Set([BLOCK.SAND,BLOCK.RED_SAND,BLOCK.SILICA_SAND,BLOCK.GRAVEL,BLOCK.GLACIAL_GRAVEL,BLOCK.SNOW,BLOCK.ASH].filter(Number.isInteger));
const vehicleIce=new Set([BLOCK.ICE,BLOCK.BLUE_ICE_VEIN].filter(Number.isInteger));
const scoopable=new Set([...vehicleMud,...vehicleLoose,BLOCK.DIRT,BLOCK.GRASS,BLOCK.GLOW_LOAM,BLOCK.MOSS,
  BLOCK.FROSTED_SOIL,BLOCK.SALT,BLOCK.ROOTED_DIRT,BLOCK.FARMLAND_DRY,...variantSoils,...variantSands].filter(Number.isInteger));
function vehicleSurface(x,y,z){
  const base=getBlock(x,y-.04,z);
  if(vehicleIce.has(base))return "slip";
  if(vehicleMud.has(base))return "mud";
  return vehicleLoose.has(base)?"loose":"normal";
}
function inspectVehicleCut({x,y,z},vehicle){
  if(y<1||y>=MAX_Y||!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))return "blocked";
  const office=alchemyColumnAt(x,z);
  if(isLabProtectedBlock(x,y,z)||office&&y>=office.low&&y<=office.top||
     inVillage(x,z)&&villageBlock(x,y,z)!==BLOCK.AIR||remoteStructureBlock(x,y,z)!==BLOCK.AIR)return "blocked";
  const id=getBlock(x,y,z),def=BDEF[id];
  if(!def||def.liquid||def.station||def.partial||def.hard>=99||id===BLOCK.LAB)return "blocked";
  if(!def.solid)return "open";
  if(vehicle.kind==="bucket")return scoopable.has(id)||professions.soil(id)?"cut":"blocked";
  return requiredPick(id)<=3?"cut":"blocked";
}
function excavateWithVehicle(cells,vehicle){
  const operation={dirty:new Map(),drops:new Map(),level:vehicle.kind==="drill"?3:1};
  let cut=0,example=null;
  for(const cell of cells){
    if(inspectVehicleCut(cell,vehicle)!=="cut")continue;
    const {x,y,z}=cell,t={x,y,z,id:getBlock(x,y,z)};
    breakBlock(t,operation);
    if(mods.get(key3(x,y,z))!==BLOCK.AIR)continue;
    cut++;
    example??=t;
  }
  if(cut){
    commitVoxelEdits(operation.dirty);
    const loot=[...operation.drops];
    if(loot.length&&!transactInventory([],loot).ok){
      for(const [id,n] of loot)receiveFrontier(id,n,player.pos);
    }
    if(example)burstBlock(example);
    sound("break",.67);
  }
  return cut;
}
function vehiclePlacementTarget(id){
  const kind=QuimiCraftVehicles.kindOf(id);
  if(QuimiCraftVehicles.isBoat(kind)){
    const hit=aimFishingWater();
    if(hit&&Math.hypot(hit.x-player.pos.x,hit.z-player.pos.z)<11)return hit;
    if(!QuimiCraftVehicles.types[kind].wheels)return null;
  }
  const t=state.target;
  return t&&t.n?.[1]===1?t:null;
}
function vehicleInteractable(){
  const v=vehicles.nearest();
  if(!v)return null;
  const dx=v.x-player.pos.x,dz=v.z-player.pos.z,distance=Math.hypot(dx,dz);
  const aligned=distance<1.9||(-dx*Math.sin(player.yaw)-dz*Math.cos(player.yaw))/distance>.32;
  const from=attackOrigin(),to=new THREE.Vector3(v.x,v.y+.84,v.z);
  return aligned&&combatSegmentClear(from,to)?v:null;
}
function boardVehicle(v){
  if(player.petrified>0)return false;
  if(!vehicles.mount(v))return false;
  queuedPlacement=null;state.left=state.right=false;
  playerActivity=null;refreshHeldItem();
  renderHotbar();
  return true;
}
function leaveVehicle(force=false){
  if(!vehicles.dismount(force))return false;
  refreshHeldItem();renderHotbar();
  return true;
}
function vehicleQuickAction(){
  if(player.petrified>0)return;
  if(riding)return leaveMount();
  if(vehicles.current())return leaveVehicle();
  const id=selectedItem();
  if(id===QuimiCraftVehicles.motor)return vehicles.install();
  if(id==="kit_glider"&&!player.inWater&&!player.onGround&&player.vel.y<-.55){
    if(vehicles.deploy(id,null,true)){queuedPlacement=null;playerActivity=null;refreshHeldItem();}
    return;
  }
  if(vehicles.nearest())return vehicles.stash();
  if(QuimiCraftVehicles.kindOf(id))return vehicles.deploy(id,vehiclePlacementTarget(id));
  toast("Selecione um kit ou se aproxime de um veículo para recolhê-lo.");
}
function jumpOrGlide(){
  if(player.petrified>0)return;
  if(riding)return;
  if(vehicles.current())return;
  if(player.inWater)player.vel.y=Math.max(player.vel.y,2.6);
  else if(player.onGround){player.vel.y=7.2;player.onGround=false;player.fallStart=player.pos.y;}
  else if(selectedItem()==="kit_glider"&&player.vel.y<-.55)vehicleQuickAction();
}
function updateVehiclePhysics(dt){
  const kind=vehicles.current().kind,glider=kind==="glider",boat=QuimiCraftVehicles.isBoat(kind);
  const input=player.petrified>0?{throttle:0,turn:0,pitch:0,brake:!glider}:{throttle:Number(!!keys.KeyW)-Number(!!keys.KeyS),turn:Number(!!keys.KeyA)-Number(!!keys.KeyD),
    pitch:player.pitch,brake:glider||boat?!!keys.Space||boat&&!!(keys.ControlLeft||keys.ControlRight):!!(keys.ControlLeft||keys.ControlRight),
    takeoff:glider&&!!keys.Space,jump:!glider&&!boat&&!!keys.Space,nitro:!glider&&!boat&&!!(keys.ShiftLeft||keys.ShiftRight)};
  const {vehicle,dx,dz}=vehicles.update(dt,input,state.target);
  const moving=Math.abs(dx)+Math.abs(dz)>.001;
  if(boat){
    player.yaw+=vehicle.yawRate*dt;
    vehicle.wakeClock=(vehicle.wakeClock??0)-dt;
    if(!vehicle.onLand&&vehicle.wakeClock<=0&&Math.abs(vehicle.speed)>.85){
      vehicle.wakeClock=.11+Math.max(0,2-Math.abs(vehicle.speed))*.08;
      const stern=QuimiCraftVehicles.types[kind].halfZ*.89,yaw=vehicle.yaw;
      combatParticles(new THREE.Vector3(vehicle.x+Math.sin(yaw)*stern,vehicle.y+.021,vehicle.z+Math.cos(yaw)*stern),
        0xd1f5ef,QuimiCraftVehicles.hullKind(kind)==="speedboat"?6:3,"vapor");
    }
  }
  player.crouch=player.sprint=player.inWater=player.headUnderwater=player.inLava=false;
  forwardChunks=horizon.movementDirection(dx,dz);
  updateScienceEnvironment(dt,moving||vehicle.pedaling);
  updateSurvival(dt,moving||vehicle.pedaling);
  updateBreath(dt,false);
  updatePlayerCamera(dt,moving);
  updateVitals();
}
const drivingButtons=Array.from(document.querySelectorAll("[data-drive]"));
let shownVehicle=null,shownSpeed=-1,shownCharge=-1;
function updateVehicleHud(){
  const v=state.started?vehicles.current():null,hud=$("vehicleHud"),cameraPosition=state.started?player.pos:camera.position;
  vehicles.updateVisibility(cameraPosition.x,cameraPosition.z,settings.render*CHUNK+24);
  const switched=v!==shownVehicle;
  if(switched){
    shownVehicle=v;
    shownSpeed=shownCharge=-1;
    hud.hidden=!v;
    const boat=QuimiCraftVehicles.isBoat(v?.kind),ground=!!v&&v.kind!=="glider"&&!boat;
    $("vehicleNitroPanel").hidden=!ground;
    $("vehicleAltitude").hidden=!v||ground||boat;
    for(const button of drivingButtons){
      const available=ground||boat&&button.dataset.mobileKey==="ControlLeft";
      button.hidden=!available;
      if(!available){keys[button.dataset.mobileKey]=false;button.classList.remove("pressed");}
    }
  }
  if(!v)return;
  const data=QuimiCraftVehicles.types[v.kind],glider=v.kind==="glider",boat=QuimiCraftVehicles.isBoat(v.kind);
  const set=(id,value)=>{
    const element=$(id);
    if(element.textContent!==value)element.textContent=value;
  };
  const max=glider?85:boat?Math.ceil(data.top*3.6/5)*5:v.kind==="cart"?75:25;
  const speed=Math.round(v.meterSpeed*3.6);
  if(switched){
    hud.style.setProperty("--vehicle-accent",data.color);
    set("vehicleName",data.name);
    set("vehicleDialMax",String(max));
  }
  if(shownSpeed!==speed){
    shownSpeed=speed;
    const fill=clamp(speed/max,0,1);
    set("vehicleSpeed",String(speed));
    $("vehicleNeedle").setAttribute("transform","rotate("+(-113+226*fill).toFixed(1)+" 60 61)");
    $("vehicleDialLevel").style.strokeDasharray=(fill*100).toFixed(1)+" 100";
  }
  const gear=glider&&v.flying?"VOO":v.climb?"SUBIDA":v.airborne?"AR":v.speed<-.12?"R":speed>0?"D":"N";
  set("vehicleGear",gear);
  hud.classList.toggle("boosting",v.nitroActive);
  if(glider){
    const rise=(v.dy>=0?"+":"")+v.dy.toFixed(1);
    set("vehicleAltitude",Math.floor(v.y)+" m · "+rise+" m/s");
    set("vehicleStatus",v.report||(v.motor?"Hélice a pedal":"Planador"));
    set("vehicleControls",touchInput?"Setas dirigem · arraste para inclinar · ↑ decola · E sai":"W/S velocidade · A/D direção · Espaço decola · E sai no solo");
  }else if(boat){
    set("vehicleStatus",v.report||(v.onLand?"Tração de trator":Math.abs(v.steer)>.10?"Leme acionado":"Navegação"));
    set("vehicleControls",v.onLand?
      (touchInput?"Setas dirigem · Freio · E sai":"W/S avança e recua · A/D dirige · Espaço freia · E sai"):
      (touchInput?"Setas controlam o barco · Freio · E desembarca":"W/S avança e recua · A/D pedais do leme · Espaço freia · E desembarca"));
  }else{
    const charge=Math.round(v.nitro);
    if(shownCharge!==charge){
      shownCharge=charge;
      $("vehicleNitro").value=charge;
    }
    const recovering=v.nitroDelay===0&&charge<100;
    set("vehicleNitroText",v.nitroActive?charge+"% · ativo":charge+"%"+(recovering?" · recarregando":""));
    const footing={normal:"Piso firme",slip:"Gelo",mud:"Lama",loose:"Solo solto"}[v.grip]||"Piso firme";
    const ready=v.kind==="cart"?"":(v.cutCount||0)+" "+(v.cutCount===1?"bloco no corte":"blocos no corte")+" · ";
    set("vehicleStatus",v.report||(ready+footing));
    const digging=v.kind==="cart"?"":" · Q escava";
    set("vehicleControls",touchInput?"Setas dirigem · ↑ pula · Nitro · Freio · E sai":
      "Espaço pula · Shift nitro · Ctrl freia · C câmera"+digging+" · E sai");
  }
}


function catalogBlock(id){
  if(id===BLOCK.AIR){
    const shape=new THREE.BoxGeometry(.91,.91,.91),edges=new THREE.EdgesGeometry(shape);
    shape.dispose();
    const air=new THREE.LineSegments(edges,new THREE.LineDashedMaterial({color:0x506975,dashSize:.10,gapSize:.052}));
    air.computeLineDistances();
    return air;
  }
  const b=newChunkBuild(0,0);
  const equipment=fieldLab.byBlock.get(id)?.unit;
  if(equipment){
    for(const cell of fieldLab.footprint(equipment,{x:0,y:0,z:0},0))b.vox[voxelIndex(cell.x+1,0,cell.z+1)]=cell.id;
  }else b.vox[voxelIndex(1,0,1)]=id;
  if(BDEF[id]?.bed){
    for(const part of survival.bedParts(BLOCK,{x:0,y:0,z:0},1))addVillageDetail(b.a,part.x,part.y,part.z,part.id);
  }else if(id===BLOCK.DOOR||id===BLOCK.DOOR_OPEN){
    for(const half of [0,1])addDoorGeometry(b.a,0,half,0,id,{half},b.clear);
  }else if(equipment){
    for(let z=0;z<equipment.depth;z++)for(let x=0;x<equipment.length;x++)meshChunkColumn(b,x*CHUNK+z);
  }else meshChunkColumn(b,0);
  if(b.la.p.length)return new THREE.Mesh(geometryFrom(b.la),lavaMat);
  const solid=b.a.p.length?new THREE.Mesh(geometryFrom(b.a),terrainMat):null;
  if(!b.clear.p.length)return solid;
  const glass=clearBlockMesh(b.clear);
  if(!solid)return glass;
  const group=new THREE.Group();
  group.add(solid,glass);
  return group;
}
function catalogHingedBlock(id,door,open){
  const root=new THREE.Group(),hinge=new THREE.Group(),solid=arrays(),clear=arrays();
  if(door){
    for(const half of [0,1])addDoorGeometry(solid,0,half,0,BLOCK.DOOR,{half},clear);
    hinge.position.set(.035,0,.49);
  }else{
    const faces=blockModels.models.get(BLOCK.EXPEDITION_CHEST);
    const isLid=face=>face.vertices.every(([,y])=>y>=.47)&&face.vertices.some(([,y])=>y>.49);
    const base=arrays();
    addModelFaces(base,clear,faces.filter(face=>!isLid(face)),0,0,0,id);
    root.add(new THREE.Mesh(geometryFrom(base),terrainMat));
    addModelFaces(solid,clear,faces.filter(isLid),0,0,0,id);
    hinge.position.set(0,.47,.85);
  }
  const plate=new THREE.Mesh(geometryFrom(solid),terrainMat);
  plate.position.copy(hinge.position).negate();hinge.add(plate);
  if(clear.p.length){
    const pane=clearBlockMesh(clear);pane.position.copy(plate.position);hinge.add(pane);
  }
  const axis=door?"y":"x",angle=door?-Math.PI/2:1.17;
  root.userData.swing={hinge,axis,angle};
  hinge.rotation[axis]=open?angle:0;root.add(hinge);
  return root;
}
function catalogWaterMesh(geometry){
  const count=geometry.attributes.position.count,tint=[];
  for(let i=0;i<count;i++)tint.push(.18,.53,.80);
  geometry.setAttribute("depthVal",new THREE.Float32BufferAttribute(new Float32Array(count).fill(1),1));
  geometry.setAttribute("waterTint",new THREE.Float32BufferAttribute(tint,3));
  const material=waterMat.clone(),uniforms=material.uniforms;
  uniforms.uTime.value=0;uniforms.uWorldWater.value=false;uniforms.uUnderwater.value=0;uniforms.uQuality.value=.72;
  uniforms.uFogNear.value=100;uniforms.uFogFar.value=200;
  const mesh=new THREE.Mesh(geometry,material);mesh.userData.noShadow=true;
  return mesh;
}
function catalogBlockView(id){
  const poses=QuimiCraftCreaturePoses;
  if(id===BLOCK.WATER){
    return {clips:poses.clips("flow"),model:()=>catalogWaterMesh(new THREE.BoxGeometry(1,.82,1)),
      animate:(model,clip,elapsed)=>{model.material.uniforms.uTime.value=poses.clipTime(clip,elapsed)}};
  }
  const door=id===BLOCK.DOOR||id===BLOCK.DOOR_OPEN,treasure=id===BLOCK.EXPEDITION_CHEST||id===BLOCK.EXPEDITION_CHEST_OPEN;
  if(door||treasure){
    const open=id===BLOCK.DOOR_OPEN||id===BLOCK.EXPEDITION_CHEST_OPEN;
    return {model:()=>catalogHingedBlock(id,door,open),clips:poses.clips(open?"open":"closed","opening","closing",open?"closed":"open"),
      animate:(model,clip,elapsed)=>{
        const {hinge,axis,angle}=model.userData.swing;
        hinge.rotation[axis]=angle*poses.doorSwing(clip,poses.clipTime(clip,elapsed));
      }};
  }
  if(id===BLOCK.LAVA){
    return {model:()=>{
      const mesh=catalogBlock(id);
      mesh.material=mesh.material.clone();
      mesh.material.uniforms.uFogNear.value=990;mesh.material.uniforms.uFogFar.value=1000;
      return mesh;
    },clips:poses.clips("flow","idle"),animate:(mesh,clip,elapsed)=>{
      mesh.material.uniforms.uTime.value=clip==="flow"?elapsed:0;
    }};
  }
  const glowing=blockModels.models.get(id)?.some(face=>QuimiCraftBlockModels.glowTiles.includes(face.tile));
  return glowing?{clips:poses.clips("idle","glow"),animate:(_,clip,elapsed)=>{blockGlowTime.value=clip==="glow"?elapsed:0}}:{};
}
function catalogLandscape(habitat){
  const root=new THREE.Group(),batches=new Map(),matrix=new THREE.Matrix4();
  const harbor=habitat==="harbor",water=habitat==="water"||harbor;
  const surfaces=new Map(),bedBlocks=new Map();
  function voxel(id,x,y,z,w,h=w,d=w,batch=batches){
    if(!batch.has(id))batch.set(id,[]);
    batch.get(id).push([x,y,z,w,h,d]);
  }
  function addBatch(parent,placementsByBlock){
    for(const [id,placements] of placementsByBlock){
      if(!surfaces.has(id)){
        const faces=arrays(),material=terrainMat.clone();
        for(const [index,face] of FACES.entries()){
          const shade=index===2?1:index===3?.63:index<2?.85:.74;
          addQuad(faces,face.v,face.n,texFor(id,index),[shade,shade,shade]);
        }
        if(id===BLOCK.GRASS)material.color.setHex(0x819377);
        if(id===BLOCK.LEAVES)material.color.setHex(0xa6b49d);
        if(id===BLOCK.CLAY&&water)material.color.setHex(0x578e9a);
        if(id===BLOCK.SLATE&&habitat==="display")material.color.setHex(0x53616b);
        surfaces.set(id,{geometry:geometryFrom(faces),material});
      }
      const {geometry,material}=surfaces.get(id);
      const batch=new THREE.InstancedMesh(geometry,material,placements.length);
      for(const [i,[x,y,z,w,h,d]] of placements.entries()){
        matrix.makeScale(w,h,d);matrix.setPosition(x,y,z);batch.setMatrixAt(i,matrix);
      }
      batch.castShadow=batch.receiveShadow=true;batch.frustumCulled=false;parent.add(batch);
    }
  }
  const span=water?22:habitat==="display"?4:8;
  for(let z=-span;!harbor&&z<=span;z++)for(let x=-span;x<=span;x++){
    const channel=water;
    const rise=Math.hypot(x,z)<4?0:Math.max(0,Math.floor(Math.sin(x*.63+z*.39)+Math.cos(z*.44-x*.49)))*.22;
    const top=channel?-1.36+Math.sin(x*.31+z*.27)*.36+Math.cos(z*.39-x*.22)*.25:habitat==="display"?-.40+rise:rise;
    voxel(channel?(hash(x,z,816)>.70?BLOCK.CLAY:BLOCK.SAND):habitat==="display"?BLOCK.SLATE:BLOCK.GRASS,water?x*3-1.5:x-.5,
      top-(water?2.1:1),water?z*3-1.5:z-.5,water?3:1,water?2.1:1,water?3:1,channel?bedBlocks:batches);
    if(channel&&hash(x,z,911)>.91)voxel(BLOCK.FIELDSTONE,x*3-.5,top,z*3-.6,.85,.25+hash(x,z,912)*.65,1.15,bedBlocks);
    if(habitat!=="display"&&!channel&&Math.hypot(x,z)>2.5&&hash(x,z,816)>.81){
      const rock=hash(z,x,825)>.61;
      voxel(rock?BLOCK.FIELDSTONE:BLOCK.LEAVES,x-.17,top,z-.23,.34,rock?.18:.28,.46);
    }
  }
  if(habitat==="display")voxel(BLOCK.SLATE,-.7,-.40,-.7,1.40,.40);
  const trees=water?[]:
    [[-2.55,2.42,4.25],[-4.8,.35,5.4],[-3.8,5.65,5.1],[1.5,4.3,4.45],[5.7,1.9,5.25],[5.8,-4.7,4.4]];
  root.userData.trees=[];
  for(const [x,z,height] of habitat==="display"?[]:trees){
    const tree=new THREE.Group(),parts=new Map(),width=height*.106,leaf=height*.175;
    tree.position.set(x,-.02,z);tree.userData.crownRadius=leaf*2.5;
    voxel(BLOCK.WOOD,-width*.5,0,-width*.5,width,height*.78,width,parts);
    for(let layer=0;layer<3;layer++){
      const radius=layer===2?1:2;
      for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){
        if(Math.hypot(dx,dz)>radius+.25)continue;
        voxel(BLOCK.LEAVES,(dx-.5)*leaf,height*.55+layer*leaf,(dz-.5)*leaf,leaf,leaf,leaf,parts);
      }
    }
    voxel(BLOCK.LEAVES,-leaf*.5,height*.55+3*leaf,-leaf*.5,leaf,leaf,leaf,parts);
    addBatch(tree,parts);root.add(tree);root.userData.trees.push(tree);
  }
  addBatch(root,batches);
  if(water){
    const bed=new THREE.Group();addBatch(bed,bedBlocks);root.add(bed);root.userData.bed=bed;
    const surface=catalogWaterMesh(new THREE.PlaneGeometry(135,135).rotateX(-Math.PI/2));
    surface.name="Superfície da água do catálogo";
    const sides=new THREE.BoxGeometry(135,1,135);
    sides.clearGroups();
    const sideIndices=[];
    for(const group of [0,1,4,5])for(let i=group*6;i<group*6+6;i++)sideIndices.push(sides.index.getX(i));
    sides.setIndex(sideIndices);
    const body=catalogWaterMesh(sides);
    body.scale.y=12;body.position.y=-6;
    body.name="Volume de água do catálogo";
    root.add(body,surface);
    root.userData.waterBody=body;
    root.userData.setDepth=depth=>{bed.position.y=1.36-depth;body.scale.y=depth;body.position.y=-depth*.5;};
    root.userData.animate=elapsed=>{
      surface.material.uniforms.uTime.value=elapsed;
      body.material.uniforms.uTime.value=elapsed;
    };
    root.userData.submerge=(inside,near=100,far=200,color=null)=>{
      const state=inside?1:0;
      body.visible=!inside;
      for(const mesh of [surface,body]){
        const uniforms=mesh.material.uniforms;
        uniforms.uUnderwater.value=state;
        uniforms.uFogNear.value=near;
        uniforms.uFogFar.value=far;
        if(color)uniforms.uFogColor.value.copy(color).convertLinearToSRGB();
      }
    };
  }
  return root;
}
const catalogActors=new WeakMap();
function catalogActor(type,resident=null,young=false,ghost=false){
  const e=createEntity(type,0,0,!!resident&&type!=="screamer",resident,young,ghost);
  removeEntity(e,true);
  const group=e.group;
  group.position.set(0,0,0);group.rotation.set(0,0,0);
  if(DRAGONS[type])QuimiCraftCreaturePoses.dragon(e.rig,{now:0,dt:1,flight:false});
  group.userData.creatureRig=e.rig;group.userData.creatureType=type;
  catalogActors.set(group,e);
  for(const child of [...group.children])if(child.isSprite){
    group.remove(child);child.material.map?.dispose();child.material.dispose();
  }
  return group;
}
function catalogActorClips(group){
  const {type,rig,profile,flying,role}=catalogActors.get(group),ids=["idle"];
  const tree=!!natureFolk[type],strike=profile.strike?.kind;
  if(rig.legs.length)ids.push("walk","run");
  if(rig.boto)ids.push("swim","spout","breach");
  if(rig.saciVortex)ids.push("hop","whirl");
  if(rig.bud)ids.push("attack");
  if(rig.gazeOrigin)ids.push("slither","gaze","reflection");
  if(rig.slither)ids.push("slither","tongue");
  if(tree)ids.push("climb");
  if(flying)ids.push(...(rig.wings.length?["flight","glide","land"]:["float"]));
  else if(rig.wings.length)ids.push("flap");
  if(!flying&&!role&&!tree&&!rig.saciVortex&&(rig.legs.length||type==="tide_ooze"||(FAUNA_VARIANTS[type]?.model??type)==="slime"))ids.push("hop");
  if(rig.jaw)ids.push("bite");
  if(strike==="slam")ids.push("slam");
  else if(strike==="shot")ids.push("shot");
  else if(strike&&strike!=="gaze"&&!rig.jaw)ids.push("attack");
  if(role&&rig.arms.length&&!tree)ids.push("signal");
  return QuimiCraftCreaturePoses.clips(...ids);
}
function playActorPreview(group,clip,elapsed,dt,splash){
  const e=catalogActors.get(group),poses=QuimiCraftCreaturePoses;
  const t=poses.clipTime(clip,elapsed),flight=["flight","glide","land","float"].includes(clip);
  const landing=clip==="land"?clamp((t-.45)/1.52,0,1):0;
  const lift=clip==="float"?.22+Math.sin(t*3)*.11:flight?(1-landing)*(.55+Math.sin(t*2.7)*.13):0;
  const hop=clip==="hop"?Math.sin(Math.PI*clamp((t-.23)/.94,0,1))*.59:clip==="whirl"?Math.sin(Math.PI*clamp((t-.17)/1.85,0,1))*.21:0;
  const power=clip==="run"?.92:clip==="walk"||clip==="slither"?.47:clip==="hop"?.44:clip==="flight"?.63:0;
  const gaze=clip==="gaze"||clip==="reflection",striking=gaze||["bite","slam","attack","shot"].includes(clip);
  const {charge,release}=striking?poses.previewStrike(Math.max(0,t-.32),e.profile.strike?.windup,gaze?.48:undefined):{charge:0,release:0};
  group.position.y=lift+hop+(clip==="climb"?.16*Math.sin(t*3)**2:0);
  group.position.z=clip==="bite"||clip==="attack"?-Math.sin(release*Math.PI*.78)*.24:0;
  group.rotation.z=clip==="glide"?Math.sin(t*2)*.17:0;
  if(e.rig.boto){
    const human=clip==="walk"||clip==="run";
    e.rig.human.visible=human;e.rig.boto.group.visible=!human;
    group.rotation.x=0;
    e.rig.boto.group.rotation.x=0;
    if(!human){
      const arc=clip==="swim"?Math.max(0,Math.sin(t*Math.PI/2.5))**3:0;
      if(clip==="breach")previewAquaticBreach(group,e.rig.boto,(t-.58)/1.62,splash);
      else{
        e.rig.boto.previewBreach=null;
        e.rig.boto.group.rotation.x=arc*-.31*Math.cos(t*2.2);
        group.position.y+=arc*.33;
        if(clip==="spout"&&Number.isFinite(group.userData.previewWaterSurface)){
          group.position.y=(group.userData.previewWaterSurface-e.rig.boto.group.position.y-e.rig.boto.spouts[0][1]+.045)*
            clamp(t/.55,0,1)*clamp((2.55-t)/.65,0,1);
        }
      }
      QuimiCraftAquatic.pose(e.rig.boto,t*5.3,.7+arc*.37);
    }
    QuimiCraftAquatic.spray(THREE,e.rig.boto,clip==="spout"?t-.56:-1);
  }
  animateEntityRig(e,dt||.18,t*1000,e.profile.run*power,{gait:t*(clip==="run"?10.5:6.5),charge:e.rig.bud&&clip==="attack"?Math.sin(Math.PI*clamp(t*.42,0,1)):charge,release,
    flight,airborne:hop>.06,whirl:clip==="whirl"?Math.sin(Math.PI*clamp((t-.11)/2.4,0,1)):undefined,climbing:clip==="climb",glide:clip==="glide"?1:0,
    wings:clip==="glide"?.10:flight?1-landing*.68:clip==="flap"?.82:0});
  if(clip==="signal")poses.wave(e.rig,t);
  if(e.rig.gazeOrigin)playGazePreview(e,clip,charge,release,t);
}
function playGazePreview(e,clip,charge,release,t){
  const {group,rig,profile}=e;
  let shield=group.userData.previewShield;
  const target=new THREE.Vector3(.86,1.20,-1.34);
  if(clip==="reflection"&&!shield){
    shield=playerModels.item("shield_mirror","catalog");
    shield.scale.setScalar(.72);group.add(shield);group.userData.previewShield=shield;
  }
  if(shield){
    shield.visible=clip==="reflection";
    shield.position.copy(target);shield.position.y-=.29*(1-Math.max(charge,release));
    shield.rotation.set(.08,Math.PI-.67,0);
  }
  if(release>0&&(clip==="gaze"||clip==="reflection")){
    const from=group.worldToLocal(rig.gazeOrigin.getWorldPosition(new THREE.Vector3()));
    const beam=group.userData.previewGaze??=frontierFx.gazeRay(profile.strike.color,group);
    const reflected=clip==="reflection";
    if(reflected){target.copy(shield.position);target.z+=.064;}
    const rebound=reflected?from.clone().add(new THREE.Vector3(0,.43,0)):null;
    beam.set(from,target,rebound,release,t);
  }else group.userData.previewGaze?.hide();
}
function playCatalogItem(group,clip,elapsed){
  const t=QuimiCraftCreaturePoses.clipTime(clip,elapsed);
  const ease=amount=>THREE.MathUtils.smoothstep(amount,0,1);
  let pull=0,arrow=false,clock=0;
  if(clip==="draw"||clip==="bowShot"){
    const load=ease((t-.23)/.55);
    pull=clip==="draw"?load:load*(1-ease((t-.93)/.13));arrow=clip==="draw"||t<.99;
  }else if(clip==="reload"||clip==="boltShot"){
    arrow=clip==="reload"?t>.72:t<.79;
  }else if(clip==="orbit"||clip==="glow")clock=elapsed*1000;
  group.rotation.y=(group.userData.catalogYaw??=group.rotation.y)+
    (clip==="boltShot"||clip==="bowShot"?Math.sin(Math.PI*ease((t-.88)/.31))*.13:0);
  playerModels.animateItem(group,clock,pull,clip==="glow"?1.55:1,arrow);
}
function previewAquaticBreach(group,model,progress,splash){
  const surface=group.userData.previewWaterSurface;
  if(!Number.isFinite(surface))return;
  const bounds=model.breachBounds,frame=QuimiCraftAquatic.breachPose(progress,bounds,surface);
  const length=bounds.max.z-bounds.min.z;
  group.position.y=frame.y;
  group.position.z=(.5-frame.progress)*length*.92;
  group.rotation.x=frame.pitch;
  if(frame.progress===0)model.previewBreach=null;
  const contact=QuimiCraftAquatic.breachContact(model.previewBreach??={},frame,surface);
  if(contact)splash?.(new THREE.Vector3(group.position.x,surface+.016,group.position.z-frame.front),length*.37,contact,{x:0,z:-1});
}
function catalogEntries(){
  const entries=[],blockAngle=[1.36,1.23,-1.78],personAngle=[.76,.30,-2.6],
    vehicleAngle=[1.38,.72,-1.85],animalAngle=[1.48,.51,-1.82],fishAngle=[1.92,.48,-.92];
  const byName=new Intl.Collator("pt-BR");
  const {clips,clipTime,previewStrike}=QuimiCraftCreaturePoses;
  const actorView={clips:catalogActorClips,animate:playActorPreview,release:disposeEntityDetails,compare:true};
  const add=(category,key,name,detail,model,angle,more={})=>entries.push({category,key,name,detail,model,angle,...more});
  const ghostEntries=new Set();
  const ghostNote="Só aceita dano de armas fantasmagóricas. Só armadura fantasmagórica reduz seus ataques.";
  function addGhost(type,name,angle,view,model,category="fantasy"){
    if(spectral.isNative(type)||ghostEntries.has(type))return;
    ghostEntries.add(type);
    const extra=type==="werewolf"?" Use prata na arma fantasmagórica.":"";
    add(category,type+":ghost",spectral.name(type,name),ghostNote+extra,model??(()=>catalogActor(type,null,false,true)),
      angle,{...view,alias:"fantasma fantasmagórico espectral "+name});
  }
  const keys=Object.fromEntries(Object.entries(BLOCK).map(([name,id])=>[id,name]));
  function huntProductRecipe(id){
    const reaction=fieldLab.reactions.find(row=>row.out.some(([key])=>resolveScienceItemId(key)===id));
    const station=scienceSystem.stations[reaction.stations[0]].name;
    const ingredients=recipeNeedsLabel({need:reaction.need.map(([key,amount])=>[resolveScienceItemId(key),amount])});
    return station+" · "+reaction.name+" · "+ingredients;
  }
  const mineralDetails={
    DIAMOND_ORE:"Depósitos muito profundos",EMERALD_ORE:"Montanhas e cânions",RUBY_ORE:"Regiões vulcânicas e chapadas",
    SAPPHIRE_ORE:"Subsolo glacial e grandes bacias",OPAL_ORE:"Termas, cânions e bacias",GARNET_ORE:"Veios profundos",
    MAGNETITE:"Minério de ferro · redutível na forja",IRON:"Veios de ferro · fundição",SUNKEN_BEACON:"Ruínas de bacias profundas",
    SUNKEN_BRICK:"Ruínas de bacias profundas",SUNKEN_MOSAIC:"Piso das ruínas submersas"
  };
  const extraMinerals=new Set([BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.SULFUR,BLOCK.CRYSTAL,BLOCK.AMETHYST,BLOCK.NITER,BLOCK.MALACHITE,BLOCK.PYRITE,BLOCK.BAUXITE,BLOCK.LUMEN_GEODE,BLOCK.BLUE_ICE_VEIN,BLOCK.BANDED_CALCITE,BLOCK.HEMATITE_VEIN,BLOCK.SALT].filter(Number.isInteger));
  const extraBuildings=new Set([BLOCK.TORCH,BLOCK.SPECTRAL,BLOCK.GLOWSTONE,BLOCK.CERAMIC,BLOCK.FIELDSTONE,BLOCK.THATCH,BLOCK.WINDOW_LEADED,BLOCK.GARDEN_BOX,BLOCK.ALCHEMY_BORDER,BLOCK.ALCHEMY_SIGN,BLOCK.CIVIC_STONE,BLOCK.CIVIC_MARKER,BLOCK.LAB_GUIDE_GOLD,BLOCK.LAB_GUIDE_BLUE,BLOCK.LAB_GUIDE_GREEN,BLOCK.MAGNESIUM_CEMENT,BLOCK.MYCELIUM_LAMP].filter(Number.isInteger));
  for(const [value,def] of Object.entries(BDEF).sort((a,b)=>byName.compare(a[1].name,b[1].name))){
    const id=Number(value),key=keys[id]||value;
    if(def.hidden&&(def.bed||def.gate))continue;
    const field=fieldLab.byBlock.get(id)?.unit;
    if(field&&id!==field.base)continue;
    const crop=CROP_BLOCKS.get(id);
    const plant=blockModels.plantIds.has(id)||!!crop||/LEAVES|_LEAF|_FLOWER|_LOG$|_END$/.test(key)||id===BLOCK.WOOD||id===BLOCK.BAMBOO||id===BLOCK.CACTUS;
    const treasure=id===BLOCK.EXPEDITION_CHEST||id===BLOCK.EXPEDITION_CHEST_OPEN;
    const station=def.station||def.alchemy||id===BLOCK.LAB||id===BLOCK.FURNACE;
    const mineral=ecology.ores.has(id)||variantMinerals.has(id)||/_ORE$/.test(key)||extraMinerals.has(id);
    const building=def.bed||def.gate||extraBuildings.has(id)||/BRICK|PLANK|GLASS|PLASTER|ROOF|TILE|BLOCK$|FENCE|WALL|DOOR|AWNING|LANTERN|MOSAIC|STAIR|SUNKEN|PATH/.test(key);
    const blockType=treasure?"treasure":station?"station":plant?"plant":mineral?"mineral":building?"building":"natural";
    const notes=field?`${field.length} × ${field.depth} blocos. ${field.purpose}`:treasure?(id===BLOCK.EXPEDITION_CHEST?"Abra com E em covis, templos, laboratórios soterrados e aldeias das árvores vivas.":"O baú fica aberto depois que o saque é recolhido."):
      crop?(id===crop.wild&&crop.biomes?"Biomas: "+crop.biomes.join(", ")+". ":QuimiCraftFrontier.cropStage(crop,id)+". ")+crop.guide:
      def.bed?"Use E para marcar o retorno e dormir à noite ou durante tempestades.":
      def.gate?"Use E para abrir ou fechar. Fechado, bloqueia o jogador e as criaturas.":
      id===BLOCK.MYCELIUM_LAMP?def.description+" "+huntProductRecipe(id):mineralDetails[key];
    const pick=requiredPick(id),hardness=Number.isFinite(def.hard)&&def.hard<99?"Dureza "+def.hard.toLocaleString("pt-BR"):null;
    const material=def.liquid?"Fluido":def.solid?(def.alpha||translucentBlocks.has(id)?"Sólido translúcido":"Sólido"):def.plant?"Vegetação atravessável":"Atravessável";
    const detail=[notes,material,hardness,pick?("Picareta de "+(pick===3?"ferro":"cobre")+" ou melhor"):null,"ID "+value].filter(Boolean).join(" · ");
    const {model=()=>catalogBlock(id),...view}=catalogBlockView(id);
    add("block","block:"+key,def.name,detail,model,blockAngle,{
      ...view,
      plant,blockType,extermination:id===BLOCK.MYCELIUM_LAMP,alias:[crop&&itemName(crop.food),treasure?"baú cofre tesouro estrutura":null].filter(Boolean).join(" "),
      loreData:crop?{food:crop.food,seed:crop.seed,phase:id===crop.wild?"wild":["sprout","growing","ripe"][crop.stages.indexOf(id)]}:
        {texture:def.tex,shade:def.icon},
      fallback:()=>blockIconSource(id),
      release:object=>object.traverse(part=>{part.geometry?.dispose();if([BLOCK.AIR,BLOCK.WATER,BLOCK.LAVA].includes(id))part.material?.dispose()})
    });
  }
  const catalogedIds=new Set();
  const track=(category,key,name,detail,model,angle,more={})=>{catalogedIds.add(key);add(category,key,name,detail,model,angle,more)};
  for(const crop of CROP_DEFS){
    const seed=crop.seed,food=crop.food;
    track("produce",seed,itemName(seed),QuimiCraftFrontier.plantingInstructions(crop)+" "+crop.guide,
      ()=>detailedBlockMiniature(seed),blockAngle,{plant:true,alias:itemName(food),loreData:{food,seed},fallback:()=>produceIconSource(seed)});
    track("produce",food,itemName(food),"Item de colheita. "+crop.guide,
      ()=>detailedBlockMiniature(food),blockAngle,{plant:true,food:true,loreData:{food,seed},fallback:()=>produceIconSource(food)});
  }
  const weaponRecipes=new Map(QuimiCraftArsenal.recipes(BLOCK).map(row=>[row.out[0],row]));
  for(const [id,w] of Object.entries(QuimiCraftArsenal.weapons)){
    const recipe=weaponRecipes.get(id);
    const detail=w.detail||w.special||w.damage+" de dano.";
    track("weapon",id,w.name,recipe?detail+" "+recipeNeedsLabel(recipe):detail,()=>{
      const model=playerModels.item(id,"catalog");
      playerModels.animateItem(model,600,0,1,false);
      return model;
    },w.family==="bow"?[2.56,.24,-.84]:w.family==="crossbow"?[1.65,1.54,-1.70]:[1.22,.38,-1.95],{
      ...(["bow","crossbow","staff","gauntlet"].includes(w.family)?{
        clips:w.family==="bow"?clips("idle","draw","bowShot"):w.family==="crossbow"?clips("idle","reload","boltShot"):w.family==="gauntlet"?clips("idle","glow"):clips("idle","orbit","glow"),
        animate:playCatalogItem
      }:{}),
      alias:id==="iron_sword"?"espada de ferro":id==="greatsword"?"espada de 2 mãos":id==="mace"?"maça clava":null,
      loreData:{family:w.family,element:w.element},fallback:()=>playerModels.icon(id)
    });
  }
  track("weapon","arrow","Flecha","Munição padrão dos arcos.",()=>playerModels.item("arrow","catalog"),[1.4,.46,-1.9],{fallback:()=>playerModels.icon("arrow")});
  track("weapon","bolt","Virote","Munição da balestra.",()=>playerModels.item("bolt","catalog"),[1.4,.46,-1.9],{fallback:()=>playerModels.icon("bolt")});
  track("weapon","venom_arrow","Flecha envenenada","Combine seis flechas comuns com uma dose de veneno. Arcos usam esta munição primeiro.",
    ()=>playerModels.item("venom_arrow","catalog"),[1.4,.46,-1.9]);
  track("weapon","silver_arrow","Flecha prateada","Flecha tratada com banho de prata para ferir lobisomens e criaturas lunares à distância.",
    ()=>playerModels.item("silver_arrow","catalog"),[1.4,.46,-1.9]);
  track("weapon","silver_bolt","Virote prateado","Virote de balestra revestido de prata, eficaz contra lobisomens.",
    ()=>playerModels.item("silver_bolt","catalog"),[1.4,.46,-1.9]);
  track("weapon","petrifying_vial","Frasco petrificante","Arremesse para petrificar o alvo atingido por alguns segundos.",
    ()=>playerModels.item("petrifying_vial","catalog"),blockAngle);
  const fieldRecipes=fieldLab.recipes(BLOCK);
  for(const [id,tool] of Object.entries(exterminationTools)){
    const recipe=fieldRecipes.find(row=>row.out[0]===id);
    track("weapon",id,tool.name,tool.detail+" Selecione na barra rápida e use a até 3,25 m quando o alvo estiver com 20% de vida ou menos. "+recipeNeedsLabel(recipe)+".",
      ()=>playerModels.item(id,"catalog"),blockAngle,{extermination:true,alias:"equipamento de extermínio",fallback:()=>playerModels.icon(id)});
  }
  track("gear","hunt_badge",huntBadge.name,huntBadge.detail+" Disponível por pontos com Mestre Gael.",
    ()=>playerModels.item("hunt_badge","catalog"),blockAngle,{extermination:true,alias:"equipamento de extermínio",fallback:()=>playerModels.icon("hunt_badge")});
  for(const [id,usage] of Object.entries(fieldLab.huntUtilities)){
    track("gear",id,itemName(id),usage+" "+huntProductRecipe(id),
      ()=>playerModels.item(id,"catalog"),blockAngle,{extermination:true,alias:"química de extermínio",fallback:()=>playerModels.icon(id)});
  }
  const huntMaterials=new Set(["sentinel_crust","tide_mucus","ember_scale","shell_carbonate","sodium_alginate","alginate_beads"]);
  for(const stages of Object.values(fieldLab.huntChemistry)){
    for(const [i,key] of stages.entries()){
      const reaction=fieldLab.reactions.find(row=>row.id===key);
      if(i===0)huntMaterials.add(reaction.need[0][0]);
      if(i<stages.length-1)huntMaterials.add(reaction.out[0][0]);
    }
  }
  for(const id of huntMaterials){
    const source=Object.values(regionalFauna).find(fauna=>fauna.finisher&&fauna.profile.loot.some(([item])=>item===id));
    const detail=source?"Material obtido de "+source.name+".":huntProductRecipe(id);
    track("produce",id,itemName(id),detail,()=>playerModels.item(id,"catalog"),blockAngle,
      {extermination:true,alias:"química de extermínio",fallback:()=>playerModels.icon(id)});
  }
  const shieldRecipes=new Map(QuimiCraftArsenal.shieldRecipes(BLOCK).map(row=>[row.out[0],row]));
  track("shield","shield",itemName("shield"),(EQUIPMENT_DEFS.shield?.effect||"Bloqueia parte dos ataques físicos na mão secundária."),
    ()=>playerModels.item("shield","catalog"),[.78,.36,-2.8],{fallback:()=>playerModels.icon("shield")});
  for(const [id,p] of Object.entries(QuimiCraftArsenal.shields))track("shield",id,p.name,p.detail+" "+recipeNeedsLabel(shieldRecipes.get(id)),
    ()=>playerModels.item(id,"catalog"),[.78,.36,-2.8],{
      fallback:()=>playerModels.icon(id)
    });
  for(const recipe of QuimiCraftArsenal.apparelRecipes(BLOCK)){
    const [id]=recipe.out,p=APPAREL[id];
    track("gear",id,p.name,p.detail+" "+recipeNeedsLabel(recipe),()=>playerModels.item(id,"catalog"),
      [.93,.44,-2.45],{alias:p.role,fallback:()=>playerModels.icon(id)});
  }
  const focusRecipes=new Map(QuimiCraftArsenal.focusRecipes(BLOCK).map(row=>[row.out[0],row]));
  for(const [id,focus] of Object.entries(QuimiCraftArsenal.focuses))track("focus",id,focus.name,focus.detail+" "+recipeNeedsLabel(focusRecipes.get(id)),
    ()=>playerModels.item(id,"catalog"),[1.19,focus.shape==="book"?2.04:.74,-1.92],{
      alias:focus.shape==="book"?"livro magia mão secundária":"orbe esfera magia mão secundária",fallback:()=>playerModels.icon(id),
      ...(focus.shape==="orb"?{clips:clips("idle","orbit","glow"),animate:playCatalogItem}:{})
    });
  const slotLabels={head:"Cabeça",face:"Rosto",chest:"Peitoral",hands:"Mãos",legs:"Pernas",feet:"Pés",back:"Costas",offhand:"Mão secundária",tool:"Ferramenta"};
  for(const [id,def] of Object.entries(EQUIPMENT_DEFS).sort((a,b)=>byName.compare(itemName(a[0]),itemName(b[0])))){
    if(catalogedIds.has(id)||!ITEM_NAMES[id])continue;
    const hazards=Object.entries(def.protections||{}).filter(([,v])=>v>0).map(([k,v])=>`${scienceSystem?.hazardLabels?.[k]||k} ${Math.round(v*100)}%`).join(", ");
    const slotText=slotLabels[def.slot]||"Equipamento";
    const detail=[slotText,def.effect,def.armor?`Armadura ${Math.round(def.armor*100)}%`:null,def.miningSpeed?`Mineração ${def.miningSpeed}×`:null,hazards?"Proteção: "+hazards:null].filter(Boolean).join(" · ");
    track("gear",id,itemName(id),detail,()=>playerModels.item(id,"catalog"),[.98,.44,-2.25],{alias:slotText+" equipamento ferramenta",fallback:()=>playerModels.icon(id)});
  }
  for(const [id,potion] of Object.entries(QuimiCraftAlchemy.potions)){
    const detail=["Poção alquímica",potion.detail||potion.effect||""].filter(Boolean).join(" · ");
    track("item",id,itemName(id),detail,()=>playerModels.item(id,"catalog"),blockAngle,{alias:"poção alquimia frasco",fallback:()=>playerModels.icon(id)});
  }
  const vehicleKitIds=new Set(Object.values(QuimiCraftVehicles.types).map(v=>v.item));
  const chemRecipeOut=new Map(CHEM.map(r=>[r.out?.[0],r]));
  const isFoodOrDrink=id=>!!FOOD_VALUES[id]||!!DRINK_VALUES[id]||/^(raw_|cooked_)/.test(id)||["wild_mint","alpine_berries","prickly_fruit","wild_cherries","samphire","wild_rice","cacao","pine_nuts","forest_mushroom"].includes(id);
  for(const [id,name] of Object.entries(ITEM_NAMES).sort((a,b)=>byName.compare(a[1],b[1]))){
    if(catalogedIds.has(id)||vehicleKitIds.has(id)||id===QuimiCraftVehicles.motor)continue;
    catalogedIds.add(id);
    if(isFoodOrDrink(id)){
      const f=FOOD_VALUES[id],d=DRINK_VALUES[id];
      const stats=[f?.hunger?`+${f.hunger} fome`:null,f?.health?`+${f.health} vida`:null,(f?.thirst||d?.thirst)?`+${f?.thirst||d?.thirst} sede`:null,d?.health?`+${d.health} vida`:null].filter(Boolean).join(" · ");
      const detail=stats||(id.startsWith("raw_")?"Ingrediente cru — asse em um forno ou fogão para maior nutrição.":"Ingrediente culinário ou bebida coletável.");
      const key=(Object.hasOwn(fishColors,id)&&id!=="raw_piranha"&&id!=="raw_shrimp")?"food:"+id:id;
      add("food",key,name,detail,()=>playerModels.item(id,"catalog"),blockAngle,{food:true,alias:"comida alimento bebida culinária "+id,fallback:()=>produceIconSource(id)||playerModels.icon(id)});
    }else{
      const chem=chemRecipeOut.get(id);
      const sciInfo=scienceSystem?.itemCatalog?.[id];
      const detail=[chem?`Reação química · ${chem.eq}`:sciInfo?.role||"Material, reagente ou utensílio de exploração e laboratório."].filter(Boolean).join(" · ");
      const key=Object.hasOwn(QuimiCraftVehicles.types,id)?"item:"+id:id;
      add("item",key,name,detail,()=>playerModels.item(id,"catalog"),blockAngle,{alias:"item química material reagente "+id,fallback:()=>produceIconSource(id)||playerModels.icon(id)});
    }
  }
  for(const [type,p] of Object.entries({npc_carbon:{name:"Prof. Carbono",role:"Laboratório Carbono"},npc_ranger:{name:"Guardiã Íris",role:"Guarda de campo"},...NPC_PROFILES})){
    if(type!=="npc_child")add("npc",type,p.name,p.title||p.role.replace(/_/g," "),()=>catalogActor(type),personAngle,{...actorView,extermination:p.role===exterminationMaster.role,loreData:{role:p.role}});
  }
  for(const [school,p] of Object.entries(QuimiCraftAlchemy.specialties)){
    const resident={name:p.person,id:"catalog:"+school,role:"alchemist",x:0,y:0,z:0,office:{kind:school},
      tint:parseInt(p.color.slice(1),16),trim:parseInt(p.color.slice(1),16),scale:p.scale,skin:p.skin,hair:p.hair,accessory:p.accessory,variant:1};
    add("npc","alchemy:"+school,p.person,p.title,()=>catalogActor("npc_alchemist",resident),personAngle,{...actorView,loreData:{school}});
    const apprentice={...resident,id:resident.id+":apprentice",name:"Aprendiz de alquimia",role:"child",
      age:"child",scale:.63,apprentice:true,accessory:null};
    add("npc","apprentice:"+school,apprentice.name,p.title,()=>catalogActor("npc_child",apprentice),personAngle,{...actorView,loreData:{school}});
  }
  const catalogRegions=[["planície","Campos"],["floresta","Bosque"],["manguezal","Costa"],["deserto","Chapada"],["tundra","Serra"],["vulcânico","Caldeira"]];
  for(const [index,[region,label]] of catalogRegions.entries()){
    const hub={x:880,z:880,base:30,version:3};
    const {people}=QuimiCraftSettlements.create({B:BLOCK,seed:106488241+index*863,hub,biome:()=>region,hash}).main();
    const choices=people.filter(p=>p.civic),local=people.find(p=>p.role==="villager");
    choices.push(...people.filter(p=>p.age==="child").slice(0,3));
    if(local)choices.push(local);
    for(const p of choices){
      const type="npc_"+(p.role.startsWith("shop_")?p.role.slice(5):p.role);
      add("npc",region+":"+p.id,p.name,[label,p.title].filter(Boolean).join(" · "),
        ()=>catalogActor(type,{...p,id:p.id+":"+region}),personAngle,{...actorView,extermination:p.role===exterminationMaster.role,loreData:{region,role:p.role,title:p.title}});
    }
  }
  const models=QuimiCraftVehicleModels.create(THREE);
  const catalogVehicles=new WeakMap();
  function vehicle(kind,motor=false){
    const rig=models.build(kind);
    if(rig.drive)rig.drive.visible=motor;
    catalogVehicles.set(rig.root,{rig,motor});
    return rig.root;
  }
  function playVehicle(group,clip,elapsed,dt){
    const {rig,motor}=catalogVehicles.get(group);
    models.preview(rig,motor,clip,clipTime(clip,elapsed),dt,elapsed===0);
  }
  for(const [kind,p] of Object.entries(QuimiCraftVehicles.types)){
    const boat=QuimiCraftVehicles.isBoat(kind);
    const sail=QuimiCraftVehicles.sails[QuimiCraftVehicles.hullKind(kind)];
    const land=p.wheels?` · Até 3 blocos de desnível · ${(p.dirtTop*3.6).toLocaleString("pt-BR",{maximumFractionDigits:1})} km/h em terra`:"";
    const detail=boat?`Pedais e leme articulado · Baú e piso edificável · ${sail.name} · Calado de ${p.draft.toLocaleString("pt-BR")} m${land}`:
      {cart:"Cabine de vidro · exploração",drill:"Cabine de vidro · perfuração",bucket:"Cabine de vidro · escavação",glider:"Planador biplano"}[kind];
    const modes=boat?["idle","marinePedal","turn","sail","cargo",...(p.wheels?["tractorWheels"]:[])]:kind==="glider"?["idle","takeoff","soar","land"]:["idle","drive","turn","hop","nitro"];
    if(kind==="drill")modes.push("drill");
    if(kind==="bucket")modes.push("dig");
    add("vehicle",kind,p.name,detail,()=>vehicle(kind),vehicleAngle,{boat,alias:p.item+" kit veículo",clips:clips(...modes),animate:playVehicle,loreData:{hull:p.hull,wheels:!!p.wheels}});
  }
  add("vehicle","glider_motor","14-bis de Campo motorizado","Módulo de pedal e hélice",()=>vehicle("glider",true),[-1.55,.75,1.64],
    {clips:clips("idle","pedal","takeoff","soar","land"),animate:playVehicle});
  add("vehicle","pedal_drive",itemName("pedal_drive"),"Instale no 14-bis de Campo para impulsionar a hélice com pedais e decolar de pistas planas.",
    ()=>playerModels.item("pedal_drive","catalog"),blockAngle,{alias:"módulo pedal correia hélice kit",fallback:()=>playerModels.icon("pedal_drive")});
  const base={pig:"Porco",cow:"Vaca",rabbit:"Coelho",chicken:"Galinha",sheep:"Ovelha",deer:"Cervo da Taiga",
    owl:"Coruja Boreal",capivara:"Capivara",slime:"Slime Ácido",cobrete:"Cobrete",cristalume:"Cristalume",
    scorpion:"Escorpião das Dunas",golem:"Golem de Obsidiana",wisp:"Espectro da Tempestade",magma:"Elemental de Magma"};
  const fantasy=new Set(["slime","cobrete","cristalume","golem","wisp","magma","peat_slime","travertine_guard"]);
  const feedingGuide=type=>QuimiCraftBreeding.diet({type})?.items.map(itemName).join(", ");
  const bioNameOf=id=>regionalFauna[id]?.name||FAUNA_VARIANTS[id]?.name||QuimiCraftDepths.fauna[id]?.name||base[id]||(id.startsWith("raw_")?fishName(id):id);
  const realWildlife=new Set(["grass_snake","pit_viper","cave_spider","venom_spider","scorpion","glass_scorpion","pyrite_crawler"]);
  const landFieldGuide=type=>{
    const social=wildlifeBehavior.social[type];
    const group=social?social[0]+" de "+social[1]+" a "+social[2]:"Geralmente solitário";
    const prey=wildlifeBehavior.landDiets[type]?.map(bioNameOf);
    const food=[wildlifeBehavior.landFoods[type],prey?.length?"Caça "+prey.join(", "):null].filter(Boolean).join(" · ")||
      (wildlifeBehavior.grazers.has(type)?"Folhas, ervas e brotos":null);
    return [group,food].filter(Boolean).join(" · ");
  };
  for(const type of [...Object.keys(base),...Object.keys(FAUNA_VARIANTS)]){
    const variant=FAUNA_VARIANTS[type];
    const category=fantasy.has(type)?"fantasy":"animal";
    const name=variant?.name||base[type],diet=feedingGuide(type);
    const regions=Object.entries(wildlifeBehavior.landResidents).filter(([,ids])=>ids.includes(type)).map(([biome])=>biome);
    const hasBio=category==="animal"||realWildlife.has(type);
    add(category,type,name,[category==="animal"?landFieldGuide(type):"",regions.join(", "),diet?"Reprodução com "+diet:"",spectral.isNative(type)?ghostNote:""].filter(Boolean).join(" · "),
      ()=>catalogActor(type),animalAngle,{...actorView,loreData:{source:variant?.model},
        ...(hasBio?{biology:wildlifeBehavior.ecologyOf(type,{nameOf:bioNameOf,aquatic:false})}:{})});
    addGhost(type,name,animalAngle,actorView);
    if(diet)add(category,type+":baby","Filhote · "+name,"Cresce mais rápido com "+diet,
      ()=>catalogActor(type,null,true),animalAngle,actorView);
  }
  for(const [id,p] of Object.entries(regionalFauna)){
    const monster=p.shape==="fantasy";
    const habitat=p.regions.length?p.regions.map(region=>region[0].toUpperCase()+region.slice(1)).join(" · "):monster?"Cavernas e minas":"Vilas e povoados";
    const contract=exterminationContracts[id];
    const requirement=contract?`Nível ${contract.level} para aceitar a caçada${p.contractOnly?" · Apenas com a tarefa ativa":""} · `:"";
    const detail=p.finisher?`Extermínio · ${requirement}${habitat} · ${p.profile.hp} PV. Com 20% de vida ou menos, finalize com ${itemName(p.finisher)}. Rende ${p.profile.loot.map(([key])=>itemName(BLOCK[key]??key)).join(", ")}.`:
      p.profile.strike?.kind==="gaze"?"Olhar petrificante · bloqueado pelo Escudo de Espelho · "+habitat:habitat;
    const diet=feedingGuide(id);
    const field=monster?"":" · "+landFieldGuide(id);
    const hasBio=!monster||realWildlife.has(id);
    add(monster?"fantasy":"animal",id,p.name,detail+field+(diet?" · Reprodução com "+diet:"")+(spectral.isNative(id)?" · "+ghostNote:""),
      ()=>catalogActor(id),animalAngle,{...actorView,...(p.shape==="tamarin"?{zoom:2.2}:{}),
        extermination:!!contract,loreData:{regions:p.regions},
        ...(hasBio?{biology:wildlifeBehavior.ecologyOf(id,{nameOf:bioNameOf,aquatic:false})}:{})});
    if(!p.finisher)addGhost(id,p.name,animalAngle,actorView);
    if(diet)add("animal",id+":baby","Filhote · "+p.name,"Cresce mais rápido com "+diet,
      ()=>catalogActor(id,null,true),animalAngle,actorView);
  }
  const dragonMood={calm:"Pacífico",neutral:"Defende-se quando provocado",hostile:"Agressivo"};
  for(const [type,p] of Object.entries(DRAGONS)){
    const burst=p.strike?"Rajada elemental: 10% de chance por ataque, dura 3 s":"Rajada elemental disponível na montaria";
    const detail=[p.silhouette,p.element,dragonMood[p.temperament],p.hp+" PV",burst,...p.regions].join(" · ");
    const angle=[1.60,1.04,-2.35],view={
      zoom:1.74,lighting:{ambient:.45,key:1.18,fill:.87,rim:p.eye},
      release:disposeEntityDetails,animate:playDragonPreview,clips:QuimiCraftCreaturePoses.dragonClips
    };
    add("fantasy",type,p.name,detail,()=>catalogActor(type),angle,view);
    addGhost(type,p.name,angle,view);
  }
  for(const [type,p] of Object.entries(natureFolk)){
    const detail=["Aldeia das Copas",p.habitat,"155 PV","Pacífico","Aceita mel e escala paredes"].filter(Boolean).join(" · ");
    add("fantasy",type,p.name,detail,()=>catalogActor(type),
      [1.02,.36,-2.6],{...actorView,resident:true,loreData:{habitat:p.habitat}});
    addGhost(type,p.name,[1.02,.36,-2.6],actorView);
  }
  for(const [type,p] of Object.entries(siteWardens)){
    const home=QuimiCraftExpeditions.names[p.territory];
    add("fantasy",type,p.name,home+" · "+p.hp+" PV · agressivo",()=>catalogActor(type),[1.35,.41,-2.4],{...actorView,loreData:{habitat:home}});
    addGhost(type,p.name,[1.35,.41,-2.4],actorView);
  }
  for(const [type,p] of Object.entries(folklore.creatures)){
    add("fantasy",type,p.name,p.detail,()=>catalogActor(type),animalAngle,{...actorView,alias:"folclore lendas brasileiras"});
    addGhost(type,p.name,animalAngle,actorView);
  }
  for(const [variant,plant] of Object.entries(screamer.plants)){
    add("plants","screamer:"+variant,plant.name,
      "Planta adormecida. O barulho e a vibração de blocos quebrados provocam seu grito. Protetores de ouvido reduzem o dano.",
      ()=>catalogActor("screamer",{y:1,variant}),animalAngle,{...actorView,plant:true});
  }
  const releaseFish=group=>disposeAquatic(group.userData.aquaticRig);
  const aquaticView=id=>{
    const p=aquaticProfile(id),strike=p.counter??p.attack??p.forage;
    const attack={bite:"bite",grasp:"tentacles",tail:"attack",sting:"attack"}[strike?.kind];
    return {release:releaseFish,clips:group=>{
      const model=group.userData.aquaticRig;
      if(p.anchored)return clips("idle");
      return clips("idle",model.swimStyle==="pulse"?"pulse":"swim","dart",...(model.spouts?["spout"]:[]),
        ...(model.breach?["breach"]:[]),...(p.dives?["dive"]:[]),...(attack?[attack]:[]));
    },animate:swimPreview,compare:true};
  };
  const swimPreview=(group,clip,elapsed,dt,splash)=>{
    const model=group.userData.aquaticRig,p=aquaticProfile(group.name);
    const t=clipTime(clip,elapsed),striking=["bite","attack","tentacles"].includes(clip);
    const attack=p.counter??p.attack??p.forage;
    const frame=striking?previewStrike(Math.max(0,t-.35),attack?.windup??.52,attack?.strike):null;
    const burst=frame?Math.sin(frame.release*Math.PI):0;
    const pace=clip==="idle"?.26:clip==="dart"?1.52:.82;
    const scale=group.scale.x;
    group.position.z=(clip==="dart"?-Math.sin(t*2.16)*.32:-burst*.25)*scale;
    const surfaceY=group.userData.previewWaterSurface;
    const spoutLift=clip==="spout"&&model.spouts?.length&&Number.isFinite(surfaceY)?Math.max(0,surfaceY-model.spouts[0][1]*scale+.045)*clamp(t/.55,0,1)*clamp((2.55-t)/.65,0,1):0;
    group.position.y=(clip==="idle"||clip==="spout"?0:Math.sin(t*2.35)*.09)*scale+spoutLift;
    const dive=clip==="dive"?Math.sin(Math.PI*clamp((t-.25)/3.25,0,1)):0;
    group.rotation.x=-dive*1.42;
    group.position.y-=dive*(p.length??0)*.16;
    if(clip==="breach")previewAquaticBreach(group,model,(t-.44)/2.05,splash);
    else model.previewBreach=null;
    QuimiCraftAquatic.pose(model,t*(model.swimStyle==="pulse"?4.5:3.5+p.speed*3.2)*pace,pace,
      frame&&{open:Math.max(frame.charge,frame.release),burst});
    QuimiCraftAquatic.spray(THREE,model,clip==="spout"?t-.56:-1,model.ghost);
  };
  const aquaticDetails=(p,id)=>{
    const format=n=>n.toLocaleString("pt-BR",{maximumFractionDigits:2});
    const attacks={bite:"Mordida",tail:"Defesa com a cauda",sting:"Ferroada de contato"};
    const diet=wildlifeBehavior.dietOf({id,profile:p})?.map(food=>aquaticProfile(food).name).join(", ");
    const role=p.mode==="pod"?"Caça em grupo":p.mode==="school"?"Nada em grupo":
      p.anchored?"Fixo ao fundo":p.solo?"Solitário":p.mode==="drift"?"À deriva":null;
    const food=[p.photosynthesis?(p.diet?"Simbiose fotossintética":"Fotossíntese"):null,diet?"Alimentação: "+diet:null].filter(Boolean).join(" · ");
    const rawLen=p.length??p.catalogLength??catalogAquaticLengths[id]??(!p.anchored&&p.stock===undefined?p.bodySize:null);
    const sizeText=rawLen?(rawLen>=1?format(rawLen)+" m de comprimento":Math.round(rawLen*100)+" cm de comprimento"):null;
    const counterText=p.counter?(p.counter.kind==="grasp"?"Contra-ataca predadores com os tentáculos e nuvem de tinta":
      p.counter.kind==="tail"?"Defende-se de predadores com golpes de cauda":"Defende-se em grupo contra predadores"):null;
    return [p.scientific,p.habitat||"Pescado",sizeText,p.hp+" PV",format(p.speed)+" m/s",
      role,food,p.attack?attacks[p.attack.kind]+" · "+format(p.attack.damage??p.damage)+" de dano":null,
      counterText].filter(Boolean).join(" · ");
  };
  const fantasyAquatic=new Set(["mermaid","fishfolk_tail","fishfolk_head","fishwoman_tail","fishwoman_head"]);
  for(const id of Object.keys(fishColors)){
    if(id==="raw_piranha"||id==="raw_shrimp")continue;
    const name=fishName(id),view=aquaticView(id);
    const profile=aquaticProfile(id);
    add("aquatic",id,name,aquaticDetails(profile,id),()=>inspectedAquaticModel(id),fishAngle,
      {...view,loreData:{habitat:profile.habitat},biology:wildlifeBehavior.ecologyOf(id,{profile,nameOf:bioNameOf,aquatic:true})});
    addGhost(id,name,fishAngle,view,()=>inspectedAquaticModel(id,true),"aquatic");
  }
  for(const [id,p] of Object.entries(QuimiCraftDepths.fauna)){
    const angle=id==="ray"?[1.35,1.14,-1.62]:fishAngle,view=aquaticView(id);
    const bio=fantasyAquatic.has(id)?{}:{biology:wildlifeBehavior.ecologyOf(id,{profile:p,nameOf:bioNameOf,aquatic:true})};
    add("aquatic",id,p.name,aquaticDetails(p,id),()=>inspectedAquaticModel(id),angle,{...view,loreData:{habitat:p.habitat},...bio});
    if(!QuimiCraftMarineLife.profiles[id])addGhost(id,p.name,angle,view,()=>inspectedAquaticModel(id,true),"aquatic");
  }
  return entries;
}
function catalogCharacter(){
  const avatar=playerModels.avatar({
    skin:pSkinMat,skinLight:pSkinLightMat,skinShade:pSkinShadeMat,sleeve:pSleeveMat,coat:pCoatMat,
    coatShade:pCoatShadeMat,pants:pPantsMat,hair:pHairMat,boot:bootMat
  });
  avatar.setAppearance(characterStyle);
  avatar.root.name="Personagem do jogador";
  avatar.root.traverse(node=>{if(node.isMesh&&!node.material.transparent)node.castShadow=node.receiveShadow=true});
  return avatar.root;
}
const catalog=QuimiCraftCatalog.create({THREE,root:$("catalog"),entries:catalogEntries,scenery:catalogLandscape,character:catalogCharacter,
  onClose:()=>{state.catalog=false}});
for(const id of ["catalogTitleBtn","catalogPauseBtn"])$(id).onclick=()=>{
  state.catalog=true;
  catalog.open($(id));
};

applyCharacterStyle();applyEquipmentVisuals();updateMissionHud();updateExterminationTracker();updateGamemodeHud();saveInventory();saveEquipment();renderInventory();updateChemHud();updateVitals();window.addEventListener("pagehide",()=>{if(initialReady&&!switchingWorld)saveWorldState()});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){clearInput();if(initialReady&&!switchingWorld)saveWorldState()}
});requestAnimationFrame(animate);
