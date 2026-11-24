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
  60:{name:"Forno de pedra",solid:true,tex:62,hard:1.75,icon:"#595d60"},61:{name:"Água corrente",solid:false,liquid:true,hidden:true,tex:35,hard:99,icon:"#42a9d0"},62:{name:"Fogo",solid:false,plant:true,tex:63,hard:.2,icon:"#ff9330"}
};
QuimiCraftFrontier.register(BLOCK,BDEF);
QuimiCraftRegions.register(BLOCK,BDEF);
QuimiCraftAlchemyWorld.register(BLOCK,BDEF);
QuimiCraftHabitats.register(BLOCK,BDEF);
QuimiCraftDepths.register(BLOCK,BDEF);
BDEF[BLOCK.SNOW].tex=[8,209,8];
const ITEM_COLORS={...Object.fromEntries(Object.entries(BDEF).map(([k,v])=>[k,v.icon||"#777"])),stick:"#94704a",wind_staff:"#63dce7",bow:"#b4814c",iron_sword:"#cdd7dc",arrow:"#ded8bd",hydrogen:"#bfe8ff",oxygen:"#83b9e8",water:"#4caed0",copper_ingot:"#c77b50",sulfur:"#d9cf3e",acid:"#9ddb62",indicator:"#bc77d8",fertilizer:"#8d6946",glow_solution:"#55e6c0",copper_sulfate:"#397ddd",lab_note:"#e9eee7",acid_gel:"#74d856",chitin:"#b98248",wind_essence:"#8cecf5",crystal_shard:"#a889ef",copper_core:"#d38152",bronze_ingot:"#c98542",voltaic_cell:"#d7c858",ceramic_plate:"#dcaa8c",feather:"#e8e2d2",hide:"#9f6848",gold_nugget:"#edca58",antidote:"#9ee78b",armor_plate:"#b79567",storm_focus:"#67e3ef",carbon_dioxide:"#d9e5e5",quicklime:"#e9dfbf",slaked_lime:"#eef2e5",alkali:"#b7d8eb",neutral_salt:"#e8e6dc",rust_pigment:"#a9583c",ammonia:"#a2dce8",tetraammine:"#315bc8",ethanol:"#d7eef1",plant_oil:"#d5bd5b",soap:"#e4d6b8",ph_kit:"#c46ed1",nitrate_mix:"#d8d3b8",bread:"#c88a4b",berries:"#bb405c",honey:"#dda83f",cheese:"#e7c96b",shield:"#86939a",chainmail:"#aeb9bf",liquid_nitrogen:"#a8e9f4",lucky_charm:"#e1bd62",prism_pendant:"#9c80df",lab_glassware:"#b8edf2",carbon_rod:"#343a3d",carbon_filter:"#48545a",distillation_flask:"#9fe2ea",spectrometer_lens:"#70d5e8",catalyst:"#d5a757",protective_goggles:"#78d7df",sample_case:"#d4b56a",sodium_chloride:"#f4f6ef",chlorine:"#a6db55",sodium_hydroxide:"#d9eef3",hydrochloric_acid:"#dbe9ef",hydrogen_peroxide:"#c8ecf7",activated_carbon:"#252b2e",purified_water:"#6dcce7",copper_oxide:"#2b2420",silver_dust:"#d5d9dc",silver_nitrate:"#eef1f4",silver_chloride:"#f3f0df",sodium_nitrate:"#ebe7dc",chromatography_strip:"#d5b4da",pure_ethanol:"#d9f0f1",carbonate_solution:"#b9d7dc",copper_crystal:"#3b83e6",spectral_data:"#73f1ce",plated_iron:"#d18c61",carbon_badge:"#63d6c8",periodic_key:"#d9c86a",cup:"#b9e8ef",water_cup:"#55bce1",bucket:"#aeb9bf",water_bucket:"#438fc1",lava_bucket:"#ef6b24",raw_venison:"#9d4240",cooked_venison:"#7c3229",raw_pork:"#e58a93",cooked_pork:"#a95b43",raw_beef:"#b7443e",cooked_beef:"#73352d",raw_rabbit:"#d49187",cooked_rabbit:"#a7654e",raw_chicken:"#e8b8a1",cooked_chicken:"#b8794c",raw_mutton:"#c86f72",cooked_mutton:"#8c4840",wool:"#e9e3d4",iron_helmet:"#9aa8ae",iron_chestplate:"#87969d",iron_leggings:"#7f8e95",iron_boots:"#76858c",lab_coat:"#e7f0ee",respirator_mask:"#5b7175",rubber_boots:"#d7bd42",oxygen_tank:"#6fa6b1",chitin_armor:"#9d7048"};

Object.assign(ITEM_COLORS,window.QuimiCraftScience?.itemColors||{},Object.fromEntries(Object.entries({...QuimiCraftFrontier.items,...QuimiCraftWorkshops.itemData,...QuimiCraftAlchemy.itemData,...QuimiCraftVehicles.itemData}).map(([id,entry])=>[id,entry[1]])));


const WORLD_SEED=(()=>{let s=Number(localStorage.qc_world_seed);if(!Number.isFinite(s)||s<1){s=Math.floor(100000+Math.random()*899999999);localStorage.qc_world_seed=String(s)}return s})();

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
    const mineralTile=id>=176&&id<=191||id>=204&&id<=206;
    if(mineralTile)[r,g,b,a]=QuimiCraftDepths.paint(id,px,py,hash);
    else if(id>=192&&id<=203||id>=207&&id<=209)[r,g,b,a]=QuimiCraftBlockModels.paint(id,px,py,hash);
    else if(id===56||id===BDEF[BLOCK.FROST_CRUST]?.tex){
      const frost=id!==56||hash(px>>2,py>>2,905)>.47||Math.abs(Math.sin(px*.23+py*.39))>.97;
      const tint=frost?[159,189,203]:[70,85,93];
      [r,g,b]=tint.map(v=>v+(hash(px,py,id)-.47)*(frost?26:35));
    }
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
  function face(tile,a,b,d,shade){
    if(tile===undefined)return;
    const sx=(tile%atlas.cols)*S,sy=Math.floor(tile/atlas.cols)*S;
    ctx.save();ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(b[0]+d[0]-a[0],b[1]+d[1]-a[1]);ctx.lineTo(...d);ctx.closePath();ctx.clip();
    ctx.transform((b[0]-a[0])/S,(b[1]-a[1])/S,(d[0]-a[0])/S,(d[1]-a[1])/S,a[0],a[1]);
    ctx.drawImage(atlas.canvas,sx,sy,S,S,0,0,S,S);ctx.restore();
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
  const source=typeof id==="number"&&BDEF[id]?.tex!==undefined?blockIconSource(id):playerModels.icon(id);
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
const chunks=new Map(),pending=[];
let wantedChunks=new Set(),chunkPriorities=new Map(),queueChanged=false;
const editedColumnTops=new Map(),roofCache=new Map();
const key3=(x,y,z)=>`${x}|${y}|${z}`, ckey=(cx,cz)=>`${cx},${cz}`;

const VILLAGE=QuimiCraftFrontier.villageFor(localStorage);
const ecology=QuimiCraftRegions.resourcePlan(BLOCK,hash,WORLD_SEED);
const depths=QuimiCraftDepths.create({B:BLOCK,seed:WORLD_SEED,hash,level:WATER_LEVEL});
const wildlife=QuimiCraftWildlife.create(THREE);
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
function hasRoofAbove(x,z,baseY,range=6){
  const ix=Math.floor(x),iz=Math.floor(z),start=Math.floor(baseY)+2,end=Math.min(MAX_Y-1,start+range);
  for(let y=start;y<=end;y++)if(BDEF[getBlock(ix,y,iz)]?.solid)return true;
  return false
}
function surfaceBlock(x,z,h=terrainHeight(x,z),b=biomeAt(x,z),habitat,lake=depths.lakeAt(x,z)){
  const site=remoteSiteAt(x,z);if(site&&Math.max(Math.abs(x-site.x),Math.abs(z-site.z))<=8)return [BLOCK.MARBLE,BLOCK.PLANK,BLOCK.ALCHEMY_BRICK][site.kind];
  const road=villageGround(x,z);if(road)return road;
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
  if(y<0||y>=MAX_Y)return BLOCK.AIR;if(y>h){if(y===WATER_LEVEL&&h<WATER_LEVEL&&(b==="taiga"||b==="tundra"||b==="fiordes glaciais")&&(!lake||lake.radius>.74)&&hash(x,z,707)>.12)return BLOCK.ICE;return BLOCK.AIR}if(y===0)return BLOCK.BEDROCK;if(caveAt(x,y,z,h)){if(y<=6&&noise.n3(x*.09+17,y*.11,z*.09-31)>.02)return BLOCK.LAVA;return BLOCK.AIR}
  if(y<h-3&&y>=4&&y<39){
    const deepOre=depths.ore(b,x,y,z,h,lake);
    if(deepOre)return deepOre;
    const localOre=habitats.ore(habitat,x,y,z)||ecology.ore(b,x,y,z);
    if(localOre)return localOre;
  }
  if(y<h-3&&y>6&&hash(Math.floor(x/3)+146,Math.floor(y/2)+219,Math.floor(z/3)+991)>.983){
     const culture=QuimiCraftRegions.culture(b);
     if(culture==="dry")return BLOCK.BAUXITE;
     if(culture==="snow"&&y<24)return BLOCK.COBALT_ORE;
     if(culture==="forest"||culture==="coast")return BLOCK.MALACHITE;
     if(y<30||culture==="volcanic")return BLOCK.PYRITE;
   }
   const deepVein=hash(Math.floor(x/2)+342,Math.floor(y/2)+119,Math.floor(z/2)-991);
   if(y<=h-5&&y>=6&&y<24&&deepVein>.985)return BLOCK.SILVER_ORE;
   if(y<=h-6&&y>=5&&y<16&&deepVein>.957&&deepVein<.974)return BLOCK.AQUAMARINE_ORE;
   const vent=y>=h-1&&b==="vulcânico"&&noise.n2(x*.061+720,z*.061-480)>.36;
   const top=y>=h-2?(surface??surfaceBlock(x,z,h,b,habitat,lake)):0;if(y===h){if(vent)return BLOCK.LAVA;if((top===BLOCK.SAND||top===BLOCK.RED_SAND)&&h<=WATER_LEVEL+2&&hash(x,z,221)>.94)return BLOCK.SALT;if(b==="pântano"&&hash(x,z,222)>.84)return BLOCK.CLAY;return top}if(y===h-1&&vent)return BLOCK.OBSIDIAN;if(y>h-3)return ecology.fertile.has(top)||variantSands.has(top)?top:[BLOCK.SAND,BLOCK.RED_SAND,BLOCK.MUD,BLOCK.CLAY,BLOCK.SALT,BLOCK.PEAT,BLOCK.FROSTED_SOIL,BLOCK.SILICA_SAND].includes(top)?top:top===BLOCK.SNOW?BLOCK.FROSTED_SOIL:top===BLOCK.LIMESTONE?BLOCK.LIMESTONE:BLOCK.DIRT;
  if(y<4&&hash(x,y,z)>.3)return BLOCK.BEDROCK;const ore=hash(Math.floor(x/2),Math.floor(y/2),Math.floor(z/2)),chemOre=hash(Math.floor(x/3)+41,Math.floor(y/2)-19,Math.floor(z/3)+8),rare=hash(Math.floor(x/3)-73,Math.floor(y/2)+57,Math.floor(z/3)+29);if(y<24&&ore>.966)return BLOCK.COAL;if(y<20&&ore<.026)return BLOCK.IRON;if(y<32&&chemOre>.944&&chemOre<.968)return BLOCK.COPPER;if(y<27&&chemOre>.902&&chemOre<.92)return BLOCK.SULFUR;if(y<30&&(b==="deserto"||b==="salinas"||b==="cânion calcário")&&chemOre>.875&&chemOre<.894)return BLOCK.NITER;if(y<13&&rare>.972)return BLOCK.GOLD;if(y<25&&rare<.024)return BLOCK.TIN;if(y<21&&rare>.936&&rare<.954)return BLOCK.ZINC;if((b==="bosque de cristais"||y<11)&&rare>.9&&rare<.916)return hash(x,y,z,306)>.45?BLOCK.AMETHYST:BLOCK.CRYSTAL;if(y<9&&b==="vulcânico"&&rare>.84&&rare<.87)return BLOCK.OBSIDIAN;if(y<11)return BLOCK.DEEPSTONE;if(b==="cânion calcário"&&y>h-14)return BLOCK.LIMESTONE;if((b==="montanha"||b==="prado alpino"||b==="tundra")&&y>h-11)return BLOCK.SLATE;return b==="vulcânico"&&y>h-8?BLOCK.BASALT:depths.rock(b,x,y,z)||ecology.stratum(b,x,y,z)||BLOCK.STONE;
}
function canGrowVegetation(x,z){
  return !villageFootprint(x,z,1)&&!labBoundsContains(x,z,LAB_PROTECTION_MARGIN)&&!inLabVillagePath(x,z)&&!remoteSiteAt(x,z);
}
function treeCandidates(x,z,veg,y=null){
  const trees=[];
  if(!(veg>0))return trees;
  const bx=x-positiveMod(x-1,5),bz=z-positiveMod(z-2,5);
  for(const tx of [bx,bx+5])for(const tz of [bz,bz+5]){if(Math.abs(tx-x)>4||Math.abs(tz-z)>4||villageFootprint(tx,tz,3)||labBoundsContains(tx,tz,LAB_PROTECTION_MARGIN+2))continue;const h=terrainHeight(tx,tz),b=biomeAt(tx,tz),seed=hash(tx>>1,tz>>1,41+WORLD_SEED%113),threshold=({floresta:.31,taiga:.37,tundra:.68,pântano:.5,savana:.57,"bosque de cerejeiras":.35,"selva tropical":.22,"prado alpino":.76,"planície florida":.82,planície:.89,"floresta de sequoias":.19,"manguezal":.32,"campina de aurora":.72,"fiordes glaciais":.8,"bosque lilás":.24,"delta salobro":.58,"termas minerais":.79}[b]??2)+(veg===1?.17:0);
    if(seed<threshold||(y!==null&&(y<=h||y>h+17)))continue;
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
  if(veg>0&&y===WATER_LEVEL+1&&h<WATER_LEVEL&&h>WATER_LEVEL-5&&["pântano","delta salobro","manguezal"].includes(b)&&hash(x,z,183)>.974)return BLOCK.WATER_LILY;
  if(veg>0&&y===h+1&&h>=WATER_LEVEL){
    const regional=habitats.vegetation(habitat,x,z,h)||ecology.cover(b,x,z);
    if(regional)return regional;
    const chance=hash(x,z,763+WORLD_SEED%127);
    const specialties={"floresta de sequoias":[BLOCK.FERN,BLOCK.BLUE_MUSHROOM],manguezal:[BLOCK.REED,BLOCK.ORCHID],"bosque lilás":[BLOCK.LAVENDER,BLOCK.BERRY_BUSH],"delta salobro":[BLOCK.SALT_REED,BLOCK.REED],"termas minerais":[BLOCK.LICHEN,BLOCK.ORCHID],floresta:[BLOCK.FERN,BLOCK.BERRY_BUSH],
      "campina de aurora":[BLOCK.WILD_WHEAT,BLOCK.ORCHID],"chapadas ocres":[BLOCK.LICHEN,BLOCK.WHITE_FLOWER],
      "fiordes glaciais":[BLOCK.LICHEN,BLOCK.BLUE_MUSHROOM],"caldeira vítrea":[BLOCK.LICHEN,BLOCK.BLUE_MUSHROOM]};
    if(specialties[b]&&chance>.78)return specialties[b][chance>.92?1:0];
    if(["planície","planície florida","floresta","bosque de cerejeiras","prado alpino"].includes(b)&&[BLOCK.GRASS,BLOCK.MOSS,BLOCK.SNOW].includes(top)&&chance>.947){
      return [BLOCK.WILD_WHEAT,BLOCK.WILD_CARROT,BLOCK.WILD_BEAN][Math.floor(hash(x,z,764)*3)];
    }
    if((b==="selva tropical"||b==="pântano")&&chance>.91)return b==="pântano"?BLOCK.REED:BLOCK.FERN;
  }
  if(veg>0&&(b==="deserto"||b==="badlands"||b==="cânion calcário")&&y>h&&y<=h+3+Math.floor(hash(x,z,3)*2)&&positiveMod(x,7)===2&&positiveMod(z,7)===4&&hash(x,z,9)>.45+(veg===1?.2:0))return BLOCK.CACTUS;
  if(veg>0&&b==="selva tropical"&&positiveMod(x,4)===1&&positiveMod(z,4)===2&&hash(x,z,911)>.48&&y>h&&y<=h+3+Math.floor(hash(x,z,912)*3))return BLOCK.BAMBOO;
  if(b==="bosque de cristais"&&positiveMod(x,8)===3&&positiveMod(z,8)===5&&y>h&&y<=h+2+Math.floor(hash(x,z,71)*5))return y===h+1&&hash(x,z,72)>.72?BLOCK.GLOWSTONE:BLOCK.CRYSTAL;
  if(b==="vulcânico"&&positiveMod(x,11)===6&&positiveMod(z,11)===3&&y>h&&y<=h+1+Math.floor(hash(x,z,73)*3))return BLOCK.BASALT;
  if(b==="badlands"){const rx=positiveMod(x,31),rz=positiveMod(z,31),pillar=(rx===5||rx===10)&&(rz===6||rz===11);if(pillar&&y>h&&y<=h+2+Math.floor(hash(rx,rz,74)*3))return y===h+1?BLOCK.ALCHEMY_BRICK:BLOCK.MARBLE;if(y===h+1&&rx>=5&&rx<=10&&rz>=6&&rz<=11&&(rx===5||rx===10||rz===6||rz===11)&&hash(x,z,75)>.45)return BLOCK.ALCHEMY_BRICK}
  if(veg>0&&y===h+1&&[BLOCK.GRASS,BLOCK.MOSS,BLOCK.PEAT,BLOCK.FROSTED_SOIL].includes(top)){const density=veg===1?.945:.86,q=hash(x,z,91+WORLD_SEED%67);if(q>density){if(b==="tundra"||b==="prado alpino")return q>.94?BLOCK.WHITE_FLOWER:BLOCK.TALL_GRASS;if(b==="bosque de cerejeiras"||b==="planície florida")return q>.955?BLOCK.POPPY:q>.91?BLOCK.BLUE_FLOWER:BLOCK.TALL_GRASS;if(b==="pântano")return q>.95?BLOCK.BLUE_FLOWER:BLOCK.TALL_GRASS;if(b==="selva tropical")return q>.965?BLOCK.POPPY:BLOCK.TALL_GRASS;return q>.965?BLOCK.POPPY:q>.935?BLOCK.WHITE_FLOWER:BLOCK.TALL_GRASS}}
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
  const max=Math.max(columnGenerationTop(x,z,terrainHeight(x,z)),alchemyColumnAt(x,z)?.top??0);
  const qualifies=id=>!!BDEF[id]?.solid&&(!BDEF[id].alpha||id===BLOCK.GLASS||id===BLOCK.ICE||[BLOCK.GLASS_AMBER,BLOCK.GLASS_COBALT,BLOCK.WINDOW_LEADED].includes(id));
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
    if(BDEF[id]?.solid&&![BLOCK.GLASS,BLOCK.ICE,BLOCK.WINDOW_LEADED,BLOCK.GLASS_AMBER,BLOCK.GLASS_COBALT].includes(id))return false;
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
  const h=terrainHeight(x,z),b=biomeAt(x,z),habitat=habitats.at(x,z,b),lake=depths.lakeAt(x,z);
  const ruin=lake&&h<WATER_LEVEL&&!inVillage(x,z,5)&&!remoteSiteAt(x,z)?depths.ruinBlock(depths.ruinAt(lake,x,z),y):0;
  if(ruin)return ruin;
  const natural=naturalBlock(x,y,z,h,b,undefined,habitat,lake);
  if(natural!==BLOCK.AIR||y<=h)return natural;
  if(y<=WATER_LEVEL&&canFloodColumn(x,z,h))return BLOCK.WATER;
  if(!canGrowVegetation(x,z))return BLOCK.AIR;
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
const fluidQueue=[],fluidPending=new Set(),fluidDirty=new Set(),fluidDirs=[[0,-1,0],[1,0,0],[-1,0,0],[0,0,1],[0,0,-1],[0,1,0]];
const FIRE_FUEL=new Set([BLOCK.WOOD,BLOCK.PLANK,BLOCK.LEAVES,BLOCK.PINE_LOG,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.CHERRY_LOG,BLOCK.CHERRY_LEAVES,BLOCK.PALM_LOG,BLOCK.PALM_LEAVES,BLOCK.BAMBOO]);
let fluidClock=0,fluidSaveClock=0,fireClock=0;

function enqueueFluid(x,y,z){
  x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);if(y<1||y>=MAX_Y-1||fluidQueue.length>2200)return;
  const k=key3(x,y,z);if(fluidPending.has(k))return;fluidPending.add(k);fluidQueue.push([x,y,z]);
}
function notifyFluidChange(x,y,z,id){
  const k=key3(x,y,z);if(id!==BLOCK.WATER&&id!==BLOCK.LAVA)fluidLevels.delete(k);
  enqueueFluid(x,y,z);
  for(const [dx,dy,dz] of fluidDirs)enqueueFluid(x+dx,y+dy,z+dz);
}
function fluidEdit(x,y,z,id,level=7){
  x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);
  if(y<1||y>=MAX_Y-1||isLabProtectedBlock(x,y,z))return false;
  const k=key3(x,y,z),existing=getBlock(x,y,z);
  if(existing===id)return false;
  if(id===BLOCK.WATER&&existing===BLOCK.LAVA||id===BLOCK.LAVA&&existing===BLOCK.WATER){id=BLOCK.OBSIDIAN;level=0;}
  if(id!==BLOCK.AIR&&BDEF[existing]?.solid)return false;
  mods.set(k,id);
  if(id===BLOCK.WATER||id===BLOCK.LAVA)fluidLevels.set(k,level);else fluidLevels.delete(k);
  fluidDirty.add(ckey(Math.floor(x/CHUNK),Math.floor(z/CHUNK)));
  if(x%CHUNK===0)fluidDirty.add(ckey(Math.floor(x/CHUNK)-1,Math.floor(z/CHUNK)));
  if(z%CHUNK===0)fluidDirty.add(ckey(Math.floor(x/CHUNK),Math.floor(z/CHUNK)-1));
  if((x+1)%CHUNK===0)fluidDirty.add(ckey(Math.floor(x/CHUNK)+1,Math.floor(z/CHUNK)));
  if((z+1)%CHUNK===0)fluidDirty.add(ckey(Math.floor(x/CHUNK),Math.floor(z/CHUNK)+1));
  notifyFluidChange(x,y,z,id);return true
}
function flowCell(x,y,z){
  const id=getBlock(x,y,z);
  if(id!==BLOCK.WATER&&id!==BLOCK.LAVA)return;
  if(Math.hypot(x-player.pos.x,z-player.pos.z)>80)return;
  const k=key3(x,y,z),limit=id===BLOCK.WATER?7:4,level=fluidLevels.get(k)??limit;
  const down=getBlock(x,y-1,z);
  if(down===BLOCK.AIR||down===(id===BLOCK.WATER?BLOCK.LAVA:BLOCK.WATER)){
    const bottom=getBlock(x,y-2,z);
    if(fluidEdit(x,y-1,z,id,BDEF[bottom]?.solid?limit:0))return;
  }
  if(down===id&&level<limit)return;
  if(level<=1)return;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,nz=z+dz,b=getBlock(nx,y,nz);
    if(b===BLOCK.AIR||b===(id===BLOCK.WATER?BLOCK.LAVA:BLOCK.WATER)){
      if(b===BLOCK.AIR&&getBlock(nx,y-1,nz)===BLOCK.AIR&&fluidQueue.length>1600)continue;
      fluidEdit(nx,y,nz,id,level-1)
    }
  }
}
function updateFluids(dt){
  fluidClock+=dt;fluidSaveClock+=dt;
  if(fluidClock>=.23){fluidClock=0;
    for(let i=0,n=Math.min(fluidQueue.length,30);i<n;i++){
      const [x,y,z]=fluidQueue.shift();fluidPending.delete(key3(x,y,z));flowCell(x,y,z)
    }
    let count=0;for(const key of fluidDirty){fluidDirty.delete(key);const [cx,cz]=key.split(",").map(Number);rebuildChunk(cx,cz);if(++count>=4)break}
  }
  if(fluidSaveClock>8){fluidSaveClock=0;saveMods();}
}
function liquidAim(){
  camera.getWorldDirection(_liquidDir);_liquidOrigin.copy(camera.position);
  for(let distance=.35;distance<=5.5;distance+=.26){
    const p=_liquidOrigin.clone().addScaledVector(_liquidDir,distance),x=Math.floor(p.x),y=Math.floor(p.y),z=Math.floor(p.z),id=getBlock(x,y,z);
    if(id===BLOCK.WATER||id===BLOCK.LAVA)return {x,y,z,id};
    if(BDEF[id]?.solid)return null;
  }
  const x=Math.floor(player.pos.x),z=Math.floor(player.pos.z),y=Math.floor(player.pos.y+.45),id=getBlock(x,y,z);
  return id===BLOCK.WATER||id===BLOCK.LAVA?{x,y,z,id}:null
}
const _liquidDir=new THREE.Vector3(),_liquidOrigin=new THREE.Vector3();
function useWorldBucket(id){
  const slot=invSlots[state.selected];if(!slot)return;
  if(id==="bucket"){
    const t=liquidAim();if(!t)return toast("Aponte o balde para água ou lava. Aproxime-se da superfície.");
    if(isLabProtectedBlock(t.x,t.y,t.z))return toast("Líquidos protegidos do laboratório não podem ser coletados");
    const result=t.id===BLOCK.WATER?"water_bucket":"lava_bucket";
    if(mods.has(key3(t.x,t.y,t.z)))setBlock(t.x,t.y,t.z,BLOCK.AIR);
    transformSelectedItem("bucket",result);
    sound("splash",.5);toast(result==="water_bucket"?"Balde cheio de água":"Balde cheio de lava");return
  }
  const t=state.target;if(!t)return toast("Aponte para a superfície onde deseja despejar o balde");
  const x=t.x+t.n[0],y=t.y+t.n[1],z=t.z+t.n[2],liquid=id==="water_bucket"?BLOCK.WATER:BLOCK.LAVA;
  if(y<1||isLabPlacementRestricted(x,y,z)||BDEF[getBlock(x,y,z)]?.solid)return toast("Não é possível despejar aqui");
  if(fluidEdit(x,y,z,liquid,liquid===BLOCK.WATER?7:4)){
    transformSelectedItem(id,"bucket");saveInventory();renderInventory();sound(liquid===BLOCK.WATER?"splash":"torch",.65);
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
const blockModels=QuimiCraftBlockModels.create(BLOCK,FACES);
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
function arrays(){return {p:[],n:[],uv:[],c:[],idx:[],refs:[]}}
function addQuad(a,verts,normal,tex,color=[1,1,1],ref=null,ao=[1,1,1,1]){
  const base=a.p.length/3;
  for(let i=0;i<4;i++){a.p.push(...verts[i]);a.n.push(...normal);a.uv.push(...uvTile(tex,...UV_CORNERS[i]));a.c.push(color[0]*ao[i],color[1]*ao[i],color[2]*ao[i])}
  for(const i of TRI)a.idx.push(base+i);a.refs.push(ref,ref);
}
function addPlant(a,x,y,z,id,ref){
  if(id===BLOCK.WATER_LILY){
    addQuad(a,[[x-.39,y-.14,z-.34],[x+.39,y-.14,z-.34],[x+.39,y-.14,z+.34],[x-.39,y-.14,z+.34]],[0,1,0],BDEF[id].tex,[1,1,1],ref);
    return;
  }
  const flower=id!==BLOCK.TALL_GRASS,ang=hash(x,z,55)*TAU,cs=Math.cos(ang)*(flower?.31:.42),sn=Math.sin(ang)*(flower?.31:.42),h=(flower?.55:.5)+hash(x,z,57)*(flower?.18:.34),t=BDEF[id].tex,col=BDEF[id].glow?[1.32,2.15,1.92]:id===BLOCK.WHITE_FLOWER?[.96,1,1]:[1,1,1];
  const quads=[[[x-cs,y,z-sn],[x-cs,y+h,z-sn],[x+cs,y+h,z+sn],[x+cs,y,z+sn]],[[x+sn,y,z-cs],[x+sn,y+h,z-cs],[x-sn,y+h,z+cs],[x-sn,y,z+cs]]];
  for(const q of quads)addQuad(a,q,[0,1,0],t,col,ref,[.78,1,1,.78]);
}
function addCuboid(a,x,y,z,sx,sy,sz,tex,ref,color=[.86,.86,.86]){for(let fi=0;fi<6;fi++){const f=FACES[fi],verts=f.v.map(v=>[x+v[0]*sx,y+v[1]*sy,z+v[2]*sz]),shade=fi===2?1:fi===3?.62:(fi<2?.84:.75),t=[color[0]*shade,color[1]*shade,color[2]*shade];addQuad(a,verts,f.n,tex,t,{...ref,n:f.n},[1,1,1,1])}}
function addDetailedBlock(a,id,x,y,z){
  for(const {vertices,normal,tile,color} of blockModels.models.get(id)){
    addQuad(a,vertices.map(([u,v,w])=>[x+u,y+v,z+w]),normal,tile,color,{x,y,z,id,n:normal});
  }
}
function detailedBlockMiniature(id){
  if(!blockModels.models.has(id))return null;
  if(!blockModelGeometry.has(id)){
    const shape=arrays();
    addDetailedBlock(shape,id,0,0,0);
    const geometry=geometryFrom(shape);
    geometry.translate(-.5,-.5,-.5);
    blockModelGeometry.set(id,geometry);
  }
  return new THREE.Mesh(blockModelGeometry.get(id),terrainMat);
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
    if(id===BLOCK.ALCHEMY_BENCH)box(.74,.66,.62,.14,.18,.22,texFor(BLOCK.AMETHYST,2));
  }
}

function addVillageDetail(a,x,y,z,id){
  const ref={x,y,z,id},tex=texFor(id,2),add=(ox,oy,oz,sx,sy,sz,tile=tex)=>addCuboid(a,x+ox,y+oy,z+oz,sx,sy,sz,tile,ref);
  if(id===BLOCK.FENCE_WOOD){
    add(.38,0,.38,.24,.99,.24);
    for(const level of [.36,.7]){add(0,level,.45,1,.10,.10);add(.45,level,0,.10,.10,1)}
  }else if(id===BLOCK.GARDEN_BOX){
    add(.06,.02,.08,.88,.49,.84);
    add(.14,.52,.16,.72,.08,.68,texFor(BLOCK.DIRT,2));
  }
}
function addDoorGeometry(a,x,y,z,id,preview=null){
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
    addQuad(a,verts,normal,face.tile,face.color,{x,y,z,id,n:normal});
  }
}

function geometryFrom(a){
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(a.p,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(a.n,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(a.uv,2));g.setAttribute("color",new THREE.Float32BufferAttribute(a.c,3));g.setIndex(a.idx);g.computeBoundingSphere();return g;
}

const liquidFog=()=>({
  uFogColor:{value:new THREE.Color()},
  uFogNear:{value:scene.fog.near},
  uFogFar:{value:scene.fog.far}
});
const liquidFogFragment=
  "uniform vec3 uFogColor; uniform float uFogNear,uFogFar;"+
  "float fogAlpha(vec3 point){return smoothstep(uFogNear,uFogFar,distance(cameraPosition,point));}";
const waterMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,uniforms:{uTime:{value:0},uQuality:{value:1},uUnderwater:{value:0},uSun:{value:new THREE.Vector3(.2,1,.1)},...liquidFog()},vertexShader:`
  attribute float depthVal; attribute vec3 waterTint; varying vec3 vTint; varying float vDepth; varying vec3 vWorld; varying vec3 vNormal; uniform float uTime,uQuality;
  void main(){vec3 p=position;float w=(sin((p.x+uTime*1.2)*.42)*.045+sin((p.z-uTime*.8)*.58)*.035)*uQuality;p.y+=w*max(0.0,normal.y);vec4 world=modelMatrix*vec4(p,1.0);vWorld=world.xyz;vDepth=depthVal;vTint=waterTint;vNormal=normalize(mat3(modelMatrix)*(normal.y>.5?vec3(-cos((p.x+uTime*1.2)*.42)*.018*uQuality,1.0,-cos((p.z-uTime*.8)*.58)*.02*uQuality):normal));gl_Position=projectionMatrix*viewMatrix*world;}`,
fragmentShader:`
  ${liquidFogFragment}
  uniform vec3 uSun; uniform float uUnderwater; varying vec3 vTint; varying float vDepth; varying vec3 vWorld,vNormal;
  void main(){vec3 V=normalize(cameraPosition-vWorld);vec3 N=normalize(vNormal);float facing=abs(dot(V,N));float fres=pow(1.0-clamp(facing,0.0,1.0),3.0);float spec=pow(max(dot(reflect(-normalize(uSun),N),V),0.0),72.0);vec3 col=mix(vTint,vTint*.34,clamp(vDepth/12.0,0.0,1.0));float alpha=.52+fres*.19;if(uUnderwater>.5){col=mix(vTint*.36,vTint,.28+fres*.2);col+=vec3(.04,.13,.16)*(1.0-facing);alpha=.34+fres*.24;}else{col=mix(col,vec3(.62,.86,.95),fres*.55)+spec*vec3(1.0,.86,.58)*1.4;}float fog=fogAlpha(vWorld);gl_FragColor=vec4(mix(col,uFogColor,fog),alpha*(1.0-fog));}`});

const lavaMat=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0},...liquidFog()},
  vertexShader:`varying vec3 vWorld;varying float top;
    void main(){top=max(0.0,normal.y);vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
  fragmentShader:`${liquidFogFragment}
    varying vec3 vWorld;varying float top;uniform float uTime;
    vec2 seed(vec2 p){return vec2(fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453),fract(sin(dot(p,vec2(269.5,183.3)))*43758.5453));}
    void main(){
      vec2 p=vec2(vWorld.x+vWorld.y*.55,vWorld.z+vWorld.y*.63)*1.8;
      p+=.15*vec2(sin(p.y*1.5+uTime*.63),cos(p.x*1.38-uTime*.47));
      vec2 h=floor(p),f=fract(p);float first=8.0,second=8.0,pulse=0.0;
      for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
        vec2 d=vec2(float(i),float(j));vec2 random=seed(h+d),q=d+.19+random*.62-f;
        float r=dot(q,q);
        if(r<first){second=first;first=r;pulse=random.x;}
        else if(r<second){second=r;}
      }
      float rim=second-first;
      float surge=.83+.15*sin(uTime*1.66+pulse*7.0+p.x*.28);
      float heat=(1.0-smoothstep(.035,.31,rim))*surge;
      float fissure=1.0-smoothstep(.005,.077,rim);
      float granule=seed(floor(p*14.0)).y;
      vec3 crust=mix(vec3(.016,.013,.017),vec3(.16,.047,.028),granule*.69+first*.19);
      vec3 dye=mix(vec3(.42,.056,.006),vec3(1.14,.37,.031),heat);
      vec3 col=mix(crust,dye,smoothstep(.04,.59,heat))+vec3(.57,.26,.043)*fissure*surge;
      col*=.77+top*.23;
      gl_FragColor=vec4(mix(col,uFogColor,fogAlpha(vWorld)),1.0);
    }`
});
const GRID=CHUNK+2,GRID_COLS=GRID*GRID;
function newChunkBuild(cx,cz){return {cx,cz,k:ckey(cx,cz),phase:0,i:0,vox:new Uint8Array(GRID*GRID*MAX_Y),tops:new Uint8Array(GRID_COLS),lights:[],a:arrays(),la:arrays(),wa:{p:[],n:[],uv:[],c:[],idx:[],refs:[],depth:[],tint:[]}}}
function voxelIndex(gx,y,gz){return (gz*GRID+gx)*MAX_Y+y}
function fillVoxelColumn(build,i){
  const x=build.cx*CHUNK+i%GRID-1,z=build.cz*CHUNK+Math.floor(i/GRID)-1;
  const h=terrainHeight(x,z),office=alchemyColumnAt(x,z),offset=i*MAX_Y;
  const top=Math.max(columnGenerationTop(x,z,h),office?.top??0);
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
    if(trees===undefined)trees=canGrowVegetation(x,z)?treeCandidates(x,z,veg):null;
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
function meshChunkColumn(b,i){
  const lx=Math.floor(i/CHUNK),lz=i%CHUNK,x=b.cx*CHUNK+lx,z=b.cz*CHUNK+lz,scanTop=b.tops[(lz+1)*GRID+lx+1],a=b.a;
  for(let y=0;y<=scanTop;y++){const id=localBlock(b,x,y,z);if(id===BLOCK.AIR)continue;if(id===BLOCK.WATER){addWaterVoxelFaces(b,x,y,z);continue;}if(blockModels.models.has(id)){
      addDetailedBlock(a,id,x,y,z);
      if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL)b.lights.push({x,y,z,id});
      continue;
    }if(BDEF[id]?.detail){addVillageDetail(a,x,y,z,id);continue}if(BDEF[id]?.station){addFrontierFurniture(a,x,y,z,id);continue}if(BDEF[id]?.plant){addPlant(a,x+.5,y,z+.5,id,{x,y,z,id,n:[0,1,0]});continue}if(id===BLOCK.DOOR||id===BLOCK.DOOR_OPEN){addDoorGeometry(a,x,y,z,id);continue}const dest=id===BLOCK.LAVA?b.la:a;
    for(let fi=0;fi<6;fi++){const f=FACES[fi],nid=localBlock(b,x+f.n[0],y+f.n[1],z+f.n[2]);if(nid===id||faceOccludes(nid))continue;const ao=id===BLOCK.LAVA?[1,1,1,1]:f.v.map((_,q)=>vertexAOLocal(b,x,y,z,f,q)),shade=fi===2?1:fi===3?.61:(fi<2?.82:.72),leaf=[BLOCK.LEAVES,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.CHERRY_LEAVES,BLOCK.PALM_LEAVES].includes(id),tint=leaf?(id===BLOCK.PINE_LEAVES?[.67,.86,.72]:id===BLOCK.DRY_LEAVES?[.96,.9,.64]:id===BLOCK.CHERRY_LEAVES?[1,.8,.91]:id===BLOCK.PALM_LEAVES?[.68,.92,.7]:[.77+hash(x,y,z)*.11,.93,.74]):id===BLOCK.GLASS||id===BLOCK.ICE?[.78,.94,.98]:[shade,shade,shade];addQuad(dest,f.v.map(v=>[x+v[0],y+v[1],z+v[2]]),f.n,seasonalBlockTex(id,fi),seasonalBlockTint(id,tint),{x,y,z,id,n:f.n},ao)}
  }
}
function addWaterVoxelFaces(b,x,y,z){
  const water=b.wa,depth=clamp(WATER_LEVEL-y+1,1,12),tint=regionalWater(x,z).rgb,push=(vertices,normal)=>{
    const base=water.p.length/3;
    for(const pt of vertices){water.p.push(...pt);water.n.push(...normal);water.depth.push(depth);water.tint.push(...tint)}
    for(const q of [0,1,2,0,2,3])water.idx.push(base+q)
  };
  const above=localBlock(b,x,y+1,z),top=y+.82,bottom=y;
  if(above!==BLOCK.WATER&&!BDEF[above]?.solid)push([[x,top,z],[x+1,top,z],[x+1,top,z+1],[x,top,z+1]],[0,1,0]);
  for(const [dx,dz,n] of [[1,0,[1,0,0]],[-1,0,[-1,0,0]],[0,1,[0,0,1]],[0,-1,[0,0,-1]]]){
    const other=localBlock(b,x+dx,y,z+dz);if(other===BLOCK.WATER||BDEF[other]?.solid)continue;
    if(dx===1)push([[x+1,bottom,z],[x+1,top,z],[x+1,top,z+1],[x+1,bottom,z+1]],n);
    else if(dx===-1)push([[x,bottom,z+1],[x,top,z+1],[x,top,z],[x,bottom,z]],n);
    else if(dz===1)push([[x+1,bottom,z+1],[x+1,top,z+1],[x,top,z+1],[x,bottom,z+1]],n);
    else push([[x,bottom,z],[x,top,z],[x+1,top,z],[x+1,bottom,z]],n);
  }
}
function stepChunkBuild(b){if(b.phase===0){fillVoxelColumn(b,b.i++);if(b.i>=GRID_COLS){b.phase=1;b.i=0}return false}meshChunkColumn(b,b.i++);return b.i>=CHUNK*CHUNK}
function removeChunkMesh(old){if(!old)return;scene.remove(old.group);old.group.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
function geometryFromWater(water){
  const wg=new THREE.BufferGeometry();wg.setAttribute("position",new THREE.Float32BufferAttribute(water.p,3));wg.setAttribute("normal",new THREE.Float32BufferAttribute(water.n,3));wg.setAttribute("depthVal",new THREE.Float32BufferAttribute(water.depth,1));wg.setAttribute("waterTint",new THREE.Float32BufferAttribute(water.tint,3));wg.setIndex(water.idx);wg.computeBoundingSphere();return wg;
}
function finalizeChunk(b){
  const previous=chunks.get(b.k);
  if(b.lights.length||previous?.lights?.length)torchDirty=true;
  removeChunkMesh(previous);const group=new THREE.Group(),g=geometryFrom(b.a),mesh=new THREE.Mesh(g,terrainMat);mesh.castShadow=settings.shadows>0;mesh.receiveShadow=settings.shadows>0;mesh.userData.faceBlocks=b.a.refs;mesh.frustumCulled=true;group.add(mesh);
  if(b.la.p.length){const lg=geometryFrom(b.la),lm=new THREE.Mesh(lg,lavaMat);lm.renderOrder=1;group.add(lm)}if(b.wa.p.length){const wg=geometryFromWater(b.wa);const wm=new THREE.Mesh(wg,waterMat);wm.renderOrder=2;wm.receiveShadow=settings.shadows>0;group.add(wm)}scene.add(group);chunks.set(b.k,{group,mesh,cx:b.cx,cz:b.cz,vox:b.vox,lights:b.lights});return group;
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
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uTime:{value:.25},uHorizon:{value:new THREE.Color()}},vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
  varying vec3 vPos;uniform float uTime;uniform vec3 uHorizon;vec3 noonTop=vec3(.12,.48,.78),noonHor=vec3(.62,.82,.93),nightTop=vec3(.008,.018,.07),nightHor=vec3(.035,.08,.15);
  void main(){float h=normalize(vPos).y*.5+.5;float sun=max(sin(uTime*6.28318),-.15);float day=smoothstep(-.16,.15,sun);float dusk=pow(1.0-abs(clamp(sun,-1.0,1.0)),7.0);vec3 top=mix(nightTop,noonTop,day),hor=mix(nightHor,noonHor,day);hor+=vec3(.72,.20,.08)*dusk;vec3 c=mix(uHorizon,mix(hor,top,pow(h,.7)),smoothstep(.025,.56,abs(normalize(vPos).y)));gl_FragColor=vec4(c,1.0);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(425,32,16),skyMat);scene.add(sky);
function celestialTexture(isMoon){
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
const player={pos:new THREE.Vector3(spawn.x+.5,spawn.y,spawn.z+.5),vel:new THREE.Vector3(),yaw:-.65,pitch:-.12,onGround:false,crouch:false,sprint:false,inWater:false,headUnderwater:false,cameraUnderwater:false,inLava:false,step:0,lastGroundY:spawn.y,fallStart:spawn.y,health:100,mana:100,hunger:100,thirst:100,breath:100,attackCooldown:0,lavaClock:0,survivalDamageClock:0,breathDamageClock:0};
const keys={},settings={preset:"high",render:horizon.presetRange.high,sense:.5,volume:.7,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:2},state={playing:false,started:false,startQueued:false,loading:false,awaitingEntry:false,inventory:false,chemistry:false,periodic:false,shop:false,character:false,chat:false,devOpen:false,graphics:false,history:false,professor:false,scientificNotebook:false,researchTree:false,scienceStation:false,paused:false,selected:0,left:false,right:false,target:null,breakKey:"",breakTime:0,cameraMode:0,day:.23,dayCount:1,lastFrame:performance.now(),fps:60,frames:0,fpsTime:0};
const touchInput=matchMedia("(hover: none), (pointer: coarse)").matches;
state.attackAnim=0;state.combatTarget=null;state.combatTargetTime=0;
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
  blocks:BDEF,block:BLOCK,atlas,texFor,uvTile,itemColor:id=>itemColor(id),shadows:()=>settings.shadows>0,detailedBlockMiniature
});
const playerRig=playerModels.avatar({
  skin:pSkinMat,skinLight:pSkinLightMat,skinShade:pSkinShadeMat,sleeve:pSleeveMat,coat:pCoatMat,
  coatShade:pCoatShadeMat,pants:pPantsMat,hair:pHairMat,boot:bootMat
});
const {root:playerBody,first:firstHands,gear:equipmentVisualRoot,headGear,leftWrist,heldFirst,heldThird,chestFit}=playerRig;
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
  const id=vehicles.current()?null:playerActivity?.prop??slot?.id,liquid=playerActivity?.liquid?.id??(playerActivity?null:slot?.liquid?.id);
  if(id===heldId&&liquid===heldLiquid)return;
  heldId=id;
  heldLiquid=liquid;
  heldFirst.clear();
  heldThird.clear();
  firstWeaponModel=thirdWeaponModel=null;
  if(id==null)return;
  firstWeaponModel=playerModels.item(id,"first",playerActivity?.liquid??slot?.liquid);
  thirdWeaponModel=playerModels.item(id,"third",playerActivity?.liquid??slot?.liquid);
  heldFirst.add(firstWeaponModel);
  heldThird.add(thirdWeaponModel);
}
function cameraClear(from,to){const steps=12;for(let i=2;i<=steps;i++){const p=from.clone().lerp(to,i/steps);if(solidAt(p.x,p.y,p.z))return from.clone().lerp(to,(i-2)/steps)}return to}
function updatePlayerCamera(dt,moving){
  const now=performance.now(),reducedMotion=document.documentElement.classList.contains("reduced-motion"),motionScale=reducedMotion ? .18 : 1,eye=new THREE.Vector3(player.pos.x,player.pos.y+(player.crouch?1.1:1.57),player.pos.z),dir=new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch));camera.fov=lerp(camera.fov,reducedMotion?73:player.sprint?82:73,1-Math.pow(.002,dt));camera.updateProjectionMatrix();playerBody.position.set(player.pos.x,player.pos.y-(player.crouch?.12:0),player.pos.z);playerBody.rotation.y=player.yaw;playerBody.visible=state.started&&state.cameraMode!==0;firstHands.visible=state.started&&state.cameraMode===0;
  const ride=vehicles.current();
  if(ride){
    playerBody.visible=state.started;
    firstHands.visible=false;
    playerBody.rotation.y=ride.yaw;
    playerBody.position.y+=ride.renderY-ride.y;
    playerBody.position.x+=Math.sin(ride.yaw)*.36;
    playerBody.position.z+=Math.cos(ride.yaw)*.36;
    const anchor=new THREE.Vector3(ride.x,ride.renderY+1.2,ride.z);
    const follow=new THREE.Vector3(Math.sin(player.yaw),.37,Math.cos(player.yaw));
    const distance=ride.kind==="glider"?5.6:3.85;
    const desired=anchor.clone().addScaledVector(follow,distance);
    desired.y+=Math.sin(player.pitch)*2.0;
    if(state.cabinCamera&&ride.kind!=="glider"){
      playerBody.visible=false;
      camera.position.copy(playerBody.position).add(new THREE.Vector3(0,1.62,0));
      camera.lookAt(camera.position.clone().add(dir));
    }else{
      camera.position.copy(cameraClear(anchor,desired));
      const focus=anchor.clone().addScaledVector(dir,ride.kind==="glider"?3.3:2.1);
      camera.lookAt(focus);
    }
  }else if(state.cameraMode===0){camera.position.copy(eye);camera.rotation.set(player.pitch,player.yaw,0)}else{const front=state.cameraMode===2,desired=eye.clone().addScaledVector(dir,front?4.2:-4.2);desired.y+=.65;camera.position.copy(cameraClear(eye,desired));camera.lookAt(eye.clone().add(new THREE.Vector3(0,.05,0)))}
state.attackAnim=Math.max(0,state.attackAnim-dt);
  const hit=state.attackAnim>0?Math.sin((1-state.attackAnim/.3)*Math.PI):0;
  const work=state.left&&state.breakTime>0?(.44+.4*Math.sin(now*.016))*motionScale:0;
  const action=Math.max(hit,work);
  playerRig.animate({dt,now,motion:motionScale,moving,sprint:player.sprint,crouch:player.crouch,
    swim:player.inWater,airborne:!player.onGround&&state.playing,pitch:player.pitch,action,firstType:heldId,activity:ride?{kind:"ride",pedaling:ride.pedaling}:playerActivity?{kind:playerActivity.kind,phase:clamp(1-playerActivity.left/playerActivity.life,0,1)}:fishingActivity,aspect:camera.aspect});
  const hasArrow=heldId!=="bow"||dev.infinite||countItem("arrow")>0;
  playerModels.animateItem(firstWeaponModel,now,hit,motionScale,hasArrow);
  playerModels.animateItem(thirdWeaponModel,now,hit,motionScale,hasArrow);
  if(playerActivity?.kind==="reel")for(const model of [firstWeaponModel,thirdWeaponModel]){
    if(model?.userData.reel)model.userData.reel.rotation.y=now*.019*motionScale;
  }
}
function cycleCamera(){const ride=vehicles.current();if(ride){
    if(ride.kind==="glider")return toast("Olhe ao redor para ajustar a câmera de voo.");
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
  const r=.29,minX=Math.floor(pos.x-r),maxX=Math.floor(pos.x+r),minY=Math.floor(pos.y+.02),maxY=Math.floor(pos.y+height-.02),minZ=Math.floor(pos.z-r),maxZ=Math.floor(pos.z+r);
  for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)if(solidAt(x,y,z))return true;
  return vehicles.blocksPlayer(pos,height)||playerHitsLabDecor(pos,height)||labDoor.hits(pos.x-r,pos.x+r,pos.y+.02,pos.y+height-.02,pos.z-r,pos.z+r);
}
function supportedAt(pos){const y=Math.floor(pos.y-.08),r=.24;return solidAt(pos.x-r,y,pos.z-r)||solidAt(pos.x+r,y,pos.z-r)||solidAt(pos.x-r,y,pos.z+r)||solidAt(pos.x+r,y,pos.z+r)||labDecorSupports(pos)}
function moveAxis(axis,delta){if(!delta)return;const before=player.pos[axis],test=player.pos.clone();test[axis]+=delta;if(!collides(test)){if(player.crouch&&player.onGround&&(axis==="x"||axis==="z")&&!supportedAt(test))return;player.pos.copy(test);return}let lo=0,hi=1;for(let i=0;i<7;i++){const m=(lo+hi)/2,test2=player.pos.clone();test2[axis]=before+delta*m;if(collides(test2))hi=m;else lo=m}player.pos[axis]=before+delta*lo;if(axis==="y"){if(delta<0){player.onGround=true;const fall=player.fallStart-player.pos.y;if(fall>5.2&&!player.inWater){damagePlayer(Math.floor((fall-4.6)*4),"queda");dustBurst(player.pos.clone(),Math.min(18,Math.floor(fall*1.5)));sound("land",Math.min(1,fall/12))}player.fallStart=player.pos.y}else player.fallStart=player.pos.y;player.vel.y=0}}
function waterSurfaceAt(x,z){
  const bx=Math.floor(x),bz=Math.floor(z),feet=Math.floor(player.pos.y);
  for(let yy=Math.min(MAX_Y-2,feet+3);yy>=Math.max(0,feet-3);yy--){
    if(getBlock(bx,yy,bz)!==BLOCK.WATER)continue;
    let top=yy;
    while(top<Math.min(MAX_Y-2,yy+18)&&getBlock(bx,top+1,bz)===BLOCK.WATER)top++;
    return top+.82;
  }
  return -Infinity
}
function isWaterAt(x,y,z){return getBlock(Math.floor(x),Math.floor(y),Math.floor(z))===BLOCK.WATER}
function isInWater(){return isWaterAt(player.pos.x,player.pos.y+.12,player.pos.z)||isWaterAt(player.pos.x,player.pos.y+.9,player.pos.z)}
function isHeadUnderwater(){return isWaterAt(player.pos.x,player.pos.y+(player.crouch?1.1:1.57),player.pos.z)}
function isCameraUnderwater(){return isWaterAt(camera.position.x,camera.position.y,camera.position.z)}
function isInLava(){return getBlock(player.pos.x,player.pos.y+.15,player.pos.z)===BLOCK.LAVA||getBlock(player.pos.x,player.pos.y+.85,player.pos.z)===BLOCK.LAVA}
function currentWeather(){
  if(climateState.override)return climateState.override;
  const biome=biomeAt(player.pos.x,player.pos.z),season=currentSeason(),period=Math.floor(climateState.elapsed/85),roll=hash(period+WORLD_SEED%997,Math.floor(player.pos.x/128),Math.floor(player.pos.z/128));
  const cold=season===3||["tundra","taiga","prado alpino","fiordes glaciais"].includes(biome);
  const wet=["floresta","pântano","selva tropical","planície florida","taiga","manguezal","floresta de sequoias"].includes(biome);
  if(roll>.88&&(!["deserto","badlands","vulcânico"].includes(biome)))return cold?"snow":"storm";
  if(roll>(wet?.43:.64))return cold?"snow":"rain";
  return"clear"
}
function scanEnvironmentHazards(){
  const px=Math.floor(player.pos.x),py=Math.floor(player.pos.y),pz=Math.floor(player.pos.z),biome=biomeAt(px,pz),surface=terrainHeight(px,pz)+1,undergroundDepth=Math.max(0,surface-player.pos.y),counts={lava:0,sulfur:0,coal:0,furnace:0,crystal:0,amethyst:0,mud:0,peat:0,torch:0};
  for(let x=px-4;x<=px+4;x+=2)for(let y=Math.max(1,py-3);y<=Math.min(MAX_Y-1,py+3);y+=2)for(let z=pz-4;z<=pz+4;z+=2){const id=getBlock(x,y,z);if(id===BLOCK.LAVA)counts.lava++;else if(id===BLOCK.SULFUR)counts.sulfur++;else if(id===BLOCK.COAL)counts.coal++;else if(id===BLOCK.FURNACE)counts.furnace++;else if(id===BLOCK.CRYSTAL)counts.crystal++;else if(id===BLOCK.AMETHYST)counts.amethyst++;else if(id===BLOCK.MUD)counts.mud++;else if(id===BLOCK.PEAT)counts.peat++;else if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL)counts.torch++}
  const meteorX=190+Math.floor(hash(WORLD_SEED,31)*130),meteorZ=-180-Math.floor(hash(WORLD_SEED,67)*120),meteorDistance=Math.hypot(player.pos.x-meteorX,player.pos.z-meteorZ),caveGas=undergroundDepth>6?clamp(12+counts.sulfur*13+counts.coal*2+(biome==="vulcânico"?28:0),0,92):0,smoke=clamp(counts.lava*10+counts.furnace*7+counts.torch*2,0,86),industrialWater=biome==="badlands"&&Math.hypot(px-220,pz+165)<46,waterProfile=scienceSystem?.waterProfileFor({biome,hot:counts.lava>1,alkaline:biome==="badlands"&&!industrialWater,industrial:industrialWater,...regionalWater(px,pz).chem})||{id:"fresh",temperature:18,contamination:0};
  const sheltered=roofAt(px,pz)>player.pos.y+1.1,safe=labSafe();
  const weather=sheltered?"clear":currentWeather(),wind=sheltered?0:clamp(.12+hash(Math.floor(state.dayCount),Math.floor(px/40),Math.floor(pz/40))*.72+(weather!=="clear" ? .16 : 0),0,1);
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
  const env=cachedEnvironmentHazards;scienceSnapshot=scienceSystem?.updateEnvironment(dt,{...env,alchemyWarmth:alchemyProgress.activeEffect("warmth"),day:state.day,inWater:player.inWater,waterTemperature:env.waterProfile.temperature,activity:player.sprint&&moving?1.7:moving?.55:0},equippedItemIds())||scienceSnapshot;
  scienceHudClock-=dt;if(scienceHudClock<=0){scienceHudClock=.18;scienceUI?.updateHUD(scienceSnapshot)}
  return scienceSnapshot
}
function waterCurrentAt(x,z){const angle=hash(Math.floor(x/24),Math.floor(z/24),WORLD_SEED%991)*TAU,strength=.16+hash(Math.floor(x/38),Math.floor(z/38),71)*.34;return{x:Math.cos(angle)*strength,z:Math.sin(angle)*strength}}
function updatePhysics(dt){
  if(vehicles.current())return updateVehiclePhysics(dt);
  player.attackCooldown=Math.max(0,player.attackCooldown-dt);const wasInWater=player.inWater,wasHeadUnderwater=player.headUnderwater;player.inWater=isInWater();player.crouch=!dev.fly&&!player.inWater&&!!keys.ShiftLeft;player.sprint=!!(keys.ControlLeft||keys.ControlRight)&&!player.crouch&&!player.inWater;player.headUnderwater=isHeadUnderwater();player.mana=Math.min(100,player.mana+dt*(player.inWater?5:9)*(countItem("prism_pendant")?1.28:1));player.inLava=isInLava();player.lavaClock=Math.max(0,player.lavaClock-dt);if(player.inLava&&player.lavaClock<=0){player.lavaClock=.62;damagePlayer(8,"lava")}
  const fwd=(keys.KeyW?1:0)-(keys.KeyS?1:0),side=(keys.KeyD?1:0)-(keys.KeyA?1:0),moving=Math.abs(fwd)+Math.abs(side)>.001;updateScienceEnvironment(dt,moving);updateSurvival(dt,moving);updateBreath(dt,moving);const len=Math.hypot(fwd,side)||1,survivalSlow=(player.hunger<=15||player.thirst<=15)?.72:1,waterGear=scienceSnapshot?.modifiers?.waterSpeed||1,scienceMove=scienceSnapshot?.modifiers?.movement||1,speed=(dev.fly?(player.sprint?11:6):player.inLava?1.55:player.inWater?2.75*waterGear:player.crouch?2.1:player.sprint?7.2:4.4)*dev.speed*survivalSlow*scienceMove,sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);let dx=(side*cy-fwd*sy)/len*speed*dt,dz=(-side*sy-fwd*cy)/len*speed*dt;
  if(!dev.fly&&player.inWater){const current=waterCurrentAt(player.pos.x,player.pos.z),currentResistance=clamp((scienceSnapshot?.protections?.protection?.pressure||0)*.35,0,.3);dx+=current.x*dt*(1-currentResistance);dz+=current.z*dt*(1-currentResistance)}
  forwardChunks=horizon.movementDirection(dx,dz);
  if(dev.fly){player.vel.set(0,0,0);player.pos.x+=dx;player.pos.z+=dz;player.pos.y+=((keys.Space?1:0)-(keys.ShiftLeft?1:0))*speed*dt;player.onGround=false;updatePlayerCamera(dt,Math.abs(dx)+Math.abs(dz)>.001);player.cameraUnderwater=isCameraUnderwater();updateUnderwaterUI(player.cameraUnderwater);updateVitals();return}
  player.onGround=supportedAt(player.pos);const oldX=player.pos.x,oldZ=player.pos.z;moveAxis("x",dx);moveAxis("z",dz);
  const shoreBlocked=player.inWater&&moving&&Math.hypot(player.pos.x-oldX-dx,player.pos.z-oldZ-dz)>.03;
  if(shoreBlocked&&keys.Space&&player.pos.y>waterSurfaceAt(player.pos.x,player.pos.z)-2.2){
    const candidate=player.pos.clone();candidate.y+=.85;
    if(!collides(candidate)){player.pos.copy(candidate);moveAxis("x",dx*.8);moveAxis("z",dz*.8);player.vel.y=Math.max(player.vel.y,4.7);player.swimExitBoost=.45}
    else player.swimExitBoost=.45;
  }
  player.swimExitBoost=Math.max(0,(player.swimExitBoost||0)-dt);
  if(player.inWater){const surface=waterSurfaceAt(player.pos.x,player.pos.z),depth=Math.max(0,surface-player.pos.y),submersion=clamp(depth/1.72,0,1),lookSwim=fwd*Math.sin(player.pitch)*3.15,manual=(keys.Space?4.85:0)-(keys.ShiftLeft?2.8:0),buoyancy=(submersion-.52)*2.15,targetY=clamp(lookSwim+manual+buoyancy,-3.2,5.4),blend=1-Math.exp(-5.8*dt);player.vel.y=player.swimExitBoost>0?Math.max(player.vel.y,5.0):lerp(player.vel.y,targetY,blend);player.fallStart=player.pos.y;player.pressureDamageClock=Math.max(0,(player.pressureDamageClock||0)-dt);const pressureProtection=scienceSnapshot?.protections?.protection?.pressure||0,effectiveDepth=depth*(1-pressureProtection);if(effectiveDepth>7&&player.pressureDamageClock<=0){player.pressureDamageClock=2.6;damagePlayer(Math.ceil((effectiveDepth-5)/3),"pressão da água","pressure");if(isEquipped("depth_gauge"))toast(`Profundidade ${depth.toFixed(1)} m · pressão ${Math.round(effectiveDepth/7*100)}%`)}}else{player.vel.y-=18.5*dt;player.vel.y=Math.max(player.vel.y,-28)}player.onGround=false;moveAxis("y",player.vel.y*dt);
  if((Math.abs(dx)+Math.abs(dz))>.001&&(player.onGround||player.inWater)){player.step+=dt*speed;if(player.step>.42){player.step=0;sound(player.inWater?"splash":"step",.34)}}
  if(!player.onGround&&player.vel.y<-.2&&!player.inWater)player.fallStart=Math.max(player.fallStart,player.pos.y-player.vel.y*.02);
  if(player.inWater!==wasInWater){sound("splash",.72);const splashY=waterSurfaceAt(player.pos.x,player.pos.z);if(Number.isFinite(splashY))dustBurst(new THREE.Vector3(player.pos.x,splashY,player.pos.z),5);player.fallStart=player.pos.y}if(wasHeadUnderwater&&!player.headUnderwater)sound("splash",.35);
  updatePlayerCamera(dt,Math.abs(dx)+Math.abs(dz)>.001);player.cameraUnderwater=isCameraUnderwater();updateUnderwaterUI(player.cameraUnderwater);updateVitals();
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

function respawn(){leaveVehicle(true);if(!syncPlayerToSafeGround(spawn.x,spawn.z)){player.pos.set(spawn.x,spawn.y,spawn.z);player.vel.set(0,0,0)}player.fallStart=player.pos.y;player.health=100;player.mana=100;player.hunger=80;player.thirst=80;player.breath=playerBreathMax();player.survivalDamageClock=0;player.breathDamageClock=0;closeModals();forwardChunks={x:0,z:0};ensureChunks(true);updateVitals();saveWorldState();requestPointer()}

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
function damagePlayer(amount,source="criatura",damageType=""){
  if(dev.fly||labSafe())return;
  const lower=String(source).toLowerCase(),type=damageType||inferDamageType(source);let reduction=1;
  if(type==="physical")reduction*=clamp(1-equipmentStat("armor"),.28,1);
  if(["corrosion","toxicity","air","biological","smoke"].includes(type)||/quím|intox|vapor/.test(lower))reduction*=clamp(equipmentStat("chemical",1,"multiply"),.3,1);
  if(lower.includes("queda"))reduction*=clamp(equipmentStat("fall",1,"multiply"),.35,1);
  const scientificProtection=scienceSnapshot?.protections?.protection?.[type]||0;
  reduction*=1-clamp(scientificProtection,0,.94);
  const shield=equipmentDefinition("offhand"),shieldCondition=equipped.offhand&&scienceSystem?.equipmentCondition(equipped.offhand.id),blocked=type==="physical"&&shield?.blockChance&&!shieldCondition?.broken&&Math.random()<shield.blockChance;
  if(blocked){reduction*=.38;scienceSystem?.damageEquipment(equipped.offhand.id,1.7,"bloqueio");toast("Escudo bloqueou parte do dano")}
  amount=Math.max(1,Math.ceil(amount*reduction));
  for(const slot of EQUIPMENT_SLOTS){
    const item=equipped[slot],definition=item&&EQUIPMENT_DEFS[item.id];if(!item||!definition||slot==="offhand"&&blocked)continue;
    if((type==="physical"&&definition.armor)||(definition.protections?.[type]||0)>0)scienceSystem?.damageEquipment(item.id,Math.max(.18,amount*.055),"proteção contra dano")
  }
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
  if(player.headUnderwater){
    if(alchemyProgress.activeEffect("air")){player.breath=Math.min(max,player.breath+dt*24);return;}
    const activity=moving?1.16:1,tankId=equippedItemIds().find(id=>EQUIPMENT_DEFS[id]?.oxygenCapacity),tank=tankId?scienceSystem?.useOxygen(equippedItemIds(),dt*activity*.62):null,assisted=!!tank?.available,drain=(assisted?2.15:5.4)*activity*breathDrainMultiplier();
    max=playerBreathMax();player.breath=clamp(player.breath-dt*drain,0,max);if(player.breath<=0&&player.breathDamageClock<=0){player.breathDamageClock=2;damagePlayer(5,"afogamento","air")}
  }else player.breath=clamp(player.breath+dt*24,0,max)
}
function updateUnderwaterUI(submerged){const overlay=$("waterOverlay");if(!overlay)return;const max=playerBreathMax(),ratio=max?player.breath/max:1;overlay.classList.toggle("on",submerged);overlay.classList.toggle("low-air",submerged&&ratio<=.25);overlay.style.setProperty("--clarity",underwaterClarity().toFixed(2))}
function updateSurvival(dt,moving){
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
    const mesh=chunks.get(ckey(x,z))?.mesh;
    if(mesh)meshes.push(mesh);
  }
  const hit=raycaster.intersectObjects(meshes,false)[0];
  if(labDoor.aim(raycaster,hit?.distance??raycaster.far)){
    const {x,y,z}=labDoor.cells[0];
    return {x,y,z,id:labDoor.isOpen?BLOCK.DOOR_OPEN:BLOCK.DOOR,labDoor:true,n:[0,0,-1]};
  }
  const ref=hit?.object.userData.faceBlocks?.[hit.faceIndex];
  return ref?{...ref,point:hit.point}:null;
}
function aimedEntity(){const eye=attackOrigin(),dir=aimDirection();return attackableActors().filter(e=>!e.dead).map(e=>{const v=entityAimPoint(e).sub(eye),d=v.length();return {e,d,dot:v.normalize().dot(dir)}}).filter(q=>q.d<22&&q.dot>1-clamp(.24/q.d,.012,.12)).sort((a,b)=>b.dot-a.dot||a.d-b.d).find(q=>combatSegmentClear(eye,entityAimPoint(q.e)))?.e||null}
function updateTarget(dt){
  if(vehicles.current())state.left=false;
  const raw=targetBlock(),t=raw&&getBlock(raw.x,raw.y,raw.z)===raw.id?raw:null,ae=aimedEntity();state.target=t;state.aimEntity=ae;highlight.visible=!!t&&!t.labDoor;$("crosshair").classList.toggle("target",!!t||!!ae);if(t)highlight.position.set(t.x+.5,t.y+.5,t.z+.5);
  const protectedLab=t&&isLabProtectedBlock(t.x,t.y,t.z);
  if(state.left&&protectedLab){state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false;const now=performance.now();if(now-labProtectToastAt>950){labProtectToastAt=now;toast("Os blocos do Laboratório Carbono são indestrutíveis")}}
  else if(state.left&&t&&requiredPick(t.id)>miningLevel()){
    state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false;
    if(performance.now()-labProtectToastAt>1200){labProtectToastAt=performance.now();toast(requiredPick(t.id)===3?"Use uma picareta de ferro em bom estado.":"Use uma picareta de cobre ou ferro em bom estado.")}
  }
  else if(state.left&&t&&t.id!==BLOCK.BEDROCK){const k=key3(t.x,t.y,t.z);if(k!==state.breakKey){state.breakKey=k;state.breakTime=0}const toolSpeed=(scienceSnapshot?.modifiers?.toolSpeed||1)*selectedMiningSpeed(t.id),waterMining=player.inWater?(isEquipped("diving_suit")||isEquipped("pressure_suit")?1:.62):1;state.breakTime+=dt*toolSpeed*waterMining;const prog=state.breakTime/BDEF[t.id].hard;$("breakWrap").classList.add("visible");$("breakFill").style.width=clamp(prog*100,0,100)+"%";crackMesh.visible=true;crackMesh.position.copy(highlight.position);crackMat.map=cracks[Math.min(2,Math.floor(prog*3))];crackMat.needsUpdate=true;if(prog>=1){breakBlock(t);state.breakTime=0;state.breakKey=""}}
  else{state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false}
}
const PICKAXE_STONE=new Set([...ecology.ores,BLOCK.HORNBLENDE_ROCK,BLOCK.QUARTZITE,BLOCK.AMBER_SHALE,BLOCK.TUFF,BLOCK.MALACHITE,BLOCK.PYRITE,BLOCK.BAUXITE,BLOCK.COBALT_ORE,BLOCK.FIELDSTONE,BLOCK.SILVER_ORE,BLOCK.AQUAMARINE_ORE,BLOCK.OCHRE_STONE,BLOCK.BASALT_GLASS,BLOCK.STONE,BLOCK.DEEPSTONE,BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,
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
  if(requiredPick(t.id)>(operation?.level??miningLevel()))return;
  const excavate=()=>operation?editVoxel(t.x,t.y,t.z,BLOCK.AIR,operation.dirty):setBlock(t.x,t.y,t.z,BLOCK.AIR);
  const receive=(id,n)=>{
    if(operation)operation.drops.set(id,(operation.drops.get(id)||0)+n);
    else receiveFrontier(id,n,player.pos);
  };
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
  if(t.id===BLOCK.DOOR||t.id===BLOCK.DOOR_OPEN){const m=worldDoorMeta(t.x,t.y,t.z)||{half:0},baseY=t.y-(m.half||0),levels=m.group==="carbon-main-airlock"?[baseY,baseY+1,baseY+2]:[baseY,baseY+1];for(const yy of levels){mods.set(key3(t.x,yy,t.z),BLOCK.AIR);doorMeta.delete(key3(t.x,yy,t.z))}saveMods();rebuildChunk(Math.floor(t.x/CHUNK),Math.floor(t.z/CHUNK));addItem(BLOCK.DOOR,1)}
  else{excavate();if(![BLOCK.FIRE,BLOCK.WATER,BLOCK.LAVA].includes(t.id))receive(professions.soil(t.id)?BLOCK.DIRT:t.id,1);discoverFromBlock(t.id);const resourceKey=missionResourceKeyForId(t.id);if(resourceKey)elementMissions?.recordEvent("mine",{key:resourceKey,quantity:1});const minerals=[BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.SULFUR,BLOCK.SALT,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.CRYSTAL,BLOCK.AMETHYST,BLOCK.LIMESTONE];if(minerals.includes(t.id))scienceSystem?.registerDiscovery("minerals",resourceKey||String(t.id),{name:itemName(t.id),source:`Extraído em ${biomeAt(t.x,t.z)}`,amountCollected:1,researchProgress:25})}
  if(operation)return;
  const tool=selectedItem();if(selectedMiningSpeed(t.id)>1)scienceSystem?.damageEquipment(tool,t.id===BLOCK.OBSIDIAN?1.7:1,"mineração");
  burstBlock(t);sound("break",.65);highlight.visible=false;if(t.id===BLOCK.TORCH||t.id===BLOCK.SPECTRAL)updateTorches()
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
const FOOD_VALUES={...QuimiCraftWorkshops.food,carrot:{hunger:11,thirst:3},beans:{hunger:8},cooked_trout:{hunger:29,health:6},
  cooked_perch:{hunger:24,health:4},cooked_catfish:{hunger:31,health:5},cooked_fish:{hunger:26,health:4},
  raw_trout:{hunger:8,raw:true},raw_perch:{hunger:8,raw:true},raw_catfish:{hunger:9,raw:true},raw_fish:{hunger:7,raw:true},bread:{hunger:25,health:3},berries:{hunger:12,thirst:5},honey:{hunger:18,health:2},cheese:{hunger:27,health:4},raw_venison:{hunger:11,raw:true},cooked_venison:{hunger:34,health:7},raw_pork:{hunger:10,raw:true},cooked_pork:{hunger:32,health:6},raw_beef:{hunger:12,raw:true},cooked_beef:{hunger:38,health:8},raw_rabbit:{hunger:8,raw:true},cooked_rabbit:{hunger:25,health:5},raw_chicken:{hunger:8,raw:true},cooked_chicken:{hunger:29,health:6},raw_mutton:{hunger:10,raw:true},cooked_mutton:{hunger:33,health:7}};
const DRINK_VALUES={water:{thirst:42},distilled_water:{thirst:38},purified_water:{thirst:35},salt_water:{thirst:-14},contaminated_water:{thirst:14},water_cup:{thirst:36,returns:"cup"},water_bucket:{thirst:75,returns:"bucket"}};
const RAW_TO_COOKED={...QuimiCraftWorkshops.rawMap,raw_trout:"cooked_trout",raw_perch:"cooked_perch",raw_catfish:"cooked_catfish",raw_fish:"cooked_fish",raw_venison:"cooked_venison",raw_pork:"cooked_pork",raw_beef:"cooked_beef",raw_rabbit:"cooked_rabbit",raw_chicken:"cooked_chicken",raw_mutton:"cooked_mutton"};
function transformSelectedItem(from,to,metadata=null){
  const slot=invSlots[state.selected];if(!slot||slot.id!==from||slot.count<1)return false;
  const canStack=!metadata&&!slot.liquid,same=canStack?invSlots.find(item=>item?.id===to&&!item.liquid):null,free=invSlots.findIndex(item=>!item);
  if(slot.count>1&&!same&&free<0)return toast("Abra espaço na mochila para o recipiente"),false;
  const transformed={id:to,count:1,...metadata};
  slot.count--;if(slot.count<=0)invSlots[state.selected]=transformed;else if(same)same.count++;else invSlots[free]=transformed;
  saveInventory();renderInventory();return true
}
function canCollectWater(){const t=state.target;return player.inWater||!!(t&&[BLOCK.WATER,BLOCK.ICE].includes(getBlock(t.x+t.n[0],t.y+t.n[1],t.z+t.n[2])))}
const SOIL_SAMPLE_BLOCKS=new Set([...ecology.fertile,...variantSands,BLOCK.SHELL_SAND,BLOCK.SALT_CRUST,BLOCK.GRASS,BLOCK.DIRT,BLOCK.SAND,BLOCK.RED_SAND,BLOCK.MUD,BLOCK.CLAY,BLOCK.FROSTED_SOIL,BLOCK.PEAT]);
const PLANT_SAMPLE_BLOCKS=new Set([...ecology.produce.keys(),BLOCK.WOOD,BLOCK.LEAVES,BLOCK.CACTUS,BLOCK.MOSS,BLOCK.PINE_LOG,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.TALL_GRASS,BLOCK.POPPY,BLOCK.BLUE_FLOWER,BLOCK.WHITE_FLOWER,BLOCK.CHERRY_LOG,BLOCK.CHERRY_LEAVES,BLOCK.BAMBOO,BLOCK.PALM_LOG,BLOCK.PALM_LEAVES,BLOCK.REDWOOD_LOG,BLOCK.REDWOOD_LEAF,BLOCK.MANGROVE_LOG,BLOCK.MANGROVE_LEAF,
  BLOCK.FERN,BLOCK.REED,BLOCK.ORCHID,BLOCK.LICHEN,BLOCK.BIRCH_LOG,BLOCK.ACACIA_LOG,BLOCK.JACARANDA_LOG,BLOCK.LAVENDER,BLOCK.SALT_REED,BLOCK.WATER_LILY,BLOCK.WILD_WHEAT,BLOCK.WILD_CARROT,BLOCK.WILD_BEAN]);
const MINERAL_SAMPLE_BLOCKS=new Set([...ecology.ores,BLOCK.CHALK,BLOCK.TRAVERTINE,BLOCK.AMBER_SHALE,BLOCK.QUARTZITE,BLOCK.STONE,BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.SULFUR,BLOCK.SALT,BLOCK.BASALT,BLOCK.OBSIDIAN,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.CRYSTAL,BLOCK.MARBLE,BLOCK.DEEPSTONE,BLOCK.LIMESTONE,BLOCK.SLATE,BLOCK.AMETHYST,BLOCK.NITER,BLOCK.SILVER_ORE,BLOCK.AQUAMARINE_ORE,BLOCK.OCHRE_STONE,BLOCK.BASALT_GLASS,BLOCK.PYRITE,BLOCK.MALACHITE,BLOCK.BAUXITE,BLOCK.COBALT_ORE,BLOCK.SILICA_SAND]);
const SAMPLE_DISCOVERY_KEYS=new Map([[BLOCK.CACTUS,"cactus"],[BLOCK.MOSS,"moss"],[BLOCK.POPPY,"poppy"],[BLOCK.BLUE_FLOWER,"blue_flower"],[BLOCK.WHITE_FLOWER,"white_flower"],[BLOCK.BAMBOO,"bamboo"],[BLOCK.CRYSTAL,"crystal_tree"]]);
function collectScientificSample(){
  if(!state.playing||!scienceSystem)return false;
  const target=state.target,creature=state.aimEntity&&!state.aimEntity.dead&&Math.hypot(state.aimEntity.x-player.pos.x,state.aimEntity.z-player.pos.z)<4.5?state.aimEntity:null;
  const biome=biomeAt(player.pos.x,player.pos.z),environment=cachedEnvironmentHazards||scanEnvironmentHazards(),position=target?{x:target.x,y:target.y,z:target.z}:{x:player.pos.x,y:player.pos.y,z:player.pos.z};
  let metadata;
  if(creature){
    metadata={kind:"animal",name:`Material biológico — ${creature.name}`,source:creature.name,sourceCreature:creature.type,discoveryId:creature.type,appearance:`Vestígio coletado de ${creature.name}`,contamination:creature.hostile?32:12,biologicalContamination:creature.hostile?38:16,composition:"material biológico"};
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
function useOrPlace(){
  if(vehicles.current())return vehicles.operate(state.target);
  const vehicleItem=selectedItem();
  if(QuimiCraftVehicles.kindOf(vehicleItem))return vehicles.deploy(vehicleItem,vehiclePlacementTarget());
  if(vehicleItem===QuimiCraftVehicles.motor)return vehicles.install();
  if(QuimiCraftAlchemy.potions[selectedItem()])return useAlchemyPotion(selectedItem());
  const active=professionFishingActive&&QuimiCraftWorkshops.fishingRods.has(selectedItem());
  if(active)return professions.use({kind:"fish"});
  const target=state.target;
  if(player.vel.y>0&&typeof selectedItem()==="number"&&target?.n[1]===1&&BDEF[target.id]?.solid&&
     !BDEF[target.id].station&&![BLOCK.DOOR,BLOCK.FURNACE,BLOCK.LAB].includes(target.id))return placeSelected();
  const action=interactionAction();
  if(action)return interact(action);
  const id=selectedItem();if(id==="bucket"||id==="water_bucket"||id==="lava_bucket")return useWorldBucket(id);if(id==="cup"||id==="hazardous_container")return fillWaterContainer(id);if(WEAPONS.has(id))return attackSelected(true);
  if(FOOD_VALUES[id])return consumeFood(id,FOOD_VALUES[id]);if(DRINK_VALUES[id])return consumeDrink(id,DRINK_VALUES[id]);
  if(id==="antidote"){if(player.health>=100)return toast("Sua vida já está cheia");removeItem("antidote",1);player.health=Math.min(100,player.health+38);saveInventory();renderInventory();updateVitals();sound("pickup",.7);return toast("Antídoto utilizado · +38 vida")}
  placeSelected()
}
const replaceableBlocks=new Set([BLOCK.AIR,BLOCK.WATER,BLOCK.LAVA,BLOCK.FIRE]);
function placementIssue({x,y,z,id}){
  if(isLabPlacementRestricted(x,y,z)||id===BLOCK.DOOR&&isLabPlacementRestricted(x,y+1,z))
    return "Não é permitido construir dentro do Laboratório Carbono.";
  if(y<1||y>=MAX_Y||!replaceableBlocks.has(getBlock(x,y,z)))return "Sem espaço para colocar aqui.";
  if(id===BLOCK.DOOR&&(y+1>=MAX_Y||getBlock(x,y+1,z)!==BLOCK.AIR))return "A porta precisa de dois blocos livres.";
  return null;
}
function placementOverlaps({x,y,z,id}){
  return BDEF[id].solid&&(blockHitsPlayer(x,y,z)||id===BLOCK.DOOR&&blockHitsPlayer(x,y+1,z));
}
function settlePlacement(site){
  const {x,y,z,id,slotIndex}=site,slot=invSlots[slotIndex];
  if(!slot||slot.id!==id||slot.count<1||placementIssue(site)||placementOverlaps(site))return false;
  if(id===BLOCK.DOOR){
    const axis=Math.abs(Math.sin(player.yaw))>.7?0:1;
    for(let half=0;half<=1;half++){
      doorMeta.set(key3(x,y+half,z),{axis,half,hinge:-1,swing:1});
      setBlock(x,y+half,z,id);
    }
  }else setBlock(x,y,z,id);
  if(!dev.infinite&&--slot.count===0)invSlots[slotIndex]=null;
  saveInventory();renderInventory();
  sound(id===BLOCK.TORCH||id===BLOCK.SPECTRAL?"torch":"place",.52);
  if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL)updateTorches();
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
    if(id!==BLOCK.DOOR&&dy===1&&BDEF[target.id]?.solid&&horizon.canBufferUnderfoot(player.pos,x,y,z,player.vel.y)){
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
function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.userData.life-=dt;p.userData.v.y-=7*dt;p.position.addScaledVector(p.userData.v,dt);p.rotation.x+=dt*5;p.rotation.z+=dt*3;if(p.material.transparent)p.material.opacity=Math.max(0,p.userData.life*.6);if(p.userData.life<=0){particleGroup.remove(p);p.material.dispose();particles.splice(i,1)}}}

const projectileRoot=new THREE.Group(),projectiles=[],dropRoot=new THREE.Group(),worldDrops=[];scene.add(projectileRoot,dropRoot);
function aimDirection(){return new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch)).normalize()}
function attackOrigin(){return new THREE.Vector3(player.pos.x,player.pos.y+1.42,player.pos.z)}
function combatParticles(pos,color=0xffffff,count=8){if(settings.particles===0)return;count=settings.particles===1?Math.ceil(count/2):count;for(let i=0;i<count;i++){const m=new THREE.Mesh(particleGeo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.82}));m.position.copy(pos);m.scale.setScalar(.5+Math.random()*1.1);m.userData.v=new THREE.Vector3((Math.random()-.5)*3,(Math.random()-.1)*2.5,(Math.random()-.5)*3);m.userData.life=.3+Math.random()*.45;particleGroup.add(m);particles.push(m)}}
const projectileForward=new THREE.Vector3(0,0,-1);
const frontierFx=QuimiCraftEffects.create(THREE,scene,()=>settings.particles,()=>document.documentElement.classList.contains("reduced-motion"));

function launchProjectile(kind,origin,dir,attack=null,owner=null){
  const group=new THREE.Group();
  let speed=22,damage=13,ttl=3.1;
  if(kind==="wind"){
    group.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),new THREE.MeshBasicMaterial({color:0x8cf5ff,transparent:true,opacity:.82})));
    group.add(new THREE.Mesh(new THREE.TorusGeometry(.25,.025,6,14),new THREE.MeshBasicMaterial({color:0xaafaff,transparent:true,opacity:.66})));
    speed=17;damage=8;ttl=2.2;
  }else if(kind==="enemy"){
    group.add(new THREE.Mesh(new THREE.OctahedronGeometry(.13,0),mobMats.purple));
    group.add(new THREE.Mesh(new THREE.TorusGeometry(.19,.014,5,12),windMat));
    speed=10;damage=attack.damage;ttl=2.7;
  }else{
    const model=playerModels.item("arrow","first");
    model.scale.setScalar(1);
    group.add(model);
    speed=26;
    if(attack)damage=attack.damage;
  }
  group.position.copy(origin);
  group.quaternion.setFromUnitVectors(projectileForward,dir);
  projectileRoot.add(group);
  const trail=frontierFx.trail(kind);
  trail?.move(origin);
  projectiles.push({kind,group,owner,attack,vel:dir.clone().multiplyScalar(speed),damage,ttl,trail});
  return group;
}
function castWind(alt=false){if(player.attackCooldown>0)return;const focus=countItem("storm_focus")>0,cost=alt?28:12;if(player.mana<cost)return toast("Mana insuficiente");player.mana-=cost;player.attackCooldown=alt?1.45:.42;state.attackAnim=.3;sound("magic",.7);const dir=aimDirection();if(alt){frontierFx.cast(player.pos.clone().add(new THREE.Vector3(0,.28,0)),dir,true);combatParticles(player.pos.clone().add(new THREE.Vector3(0,1,0)),0x8cecf5,22);for(const e of attackableActors()){if(e.dead)continue;const dx=e.x-player.pos.x,dz=e.z-player.pos.z,d=Math.hypot(dx,dz);if(d<6+(focus?1.5:0)&&combatSegmentClear(attackOrigin(),entityAimPoint(e))){hitEntity(e,focus?10:6,"ciclone",new THREE.Vector3(dx,0,dz).normalize().multiplyScalar(focus?11:8))}}toast(focus?"Ciclone prismático":"Ciclone expansivo")}else{frontierFx.cast(attackOrigin().addScaledVector(dir,.7),dir);const mesh=launchProjectile("wind",attackOrigin().addScaledVector(dir,.65),dir);if(focus){const data=projectiles.find(q=>q.group===mesh);data.damage=12;data.vel.multiplyScalar(1.12)}}updateVitals()}
function shootArrow(){if(player.attackCooldown>0)return;if(!dev.infinite&&countItem("arrow")<1)return toast("Sem flechas");player.attackCooldown=.54;state.attackAnim=.3;const dir=aimDirection();launchProjectile("arrow",attackOrigin().addScaledVector(dir,.75),dir);if(!dev.infinite){removeItem("arrow",1);saveInventory();renderHotbar()}sound("bow",.7)}
function meleeAttack(){
  if(player.attackCooldown>0)return;
  player.attackCooldown=.38;
  state.attackAnim=.3;
  sound("sword",.7);
  const dir=aimDirection(),eye=attackOrigin();
  const best=attackableActors().filter(e=>!e.dead).map(entity=>{
    const point=entityAimPoint(entity);
    const reach=point.clone().sub(eye);
    return {entity,point,distance:reach.length(),dot:reach.normalize().dot(dir)};
  }).filter(hit=>hit.distance<3.25&&hit.dot>.48).sort((a,b)=>a.distance-b.distance)
    .find(hit=>combatSegmentClear(eye,hit.point));
  if(best)hitEntity(best.entity,15,"espada",dir.clone().multiplyScalar(4));
  else combatParticles(eye.clone().addScaledVector(dir,1.6),0xdde8eb,3);
}
function attackSelected(alt=false){
  if(labSafe())return toast("Combate desativado no Laboratório Carbono.");
  const id=selectedItem(),condition=scienceSystem?.equipmentCondition(id);if(condition?.broken)return toast(`${itemName(id)} está quebrado · repare no laboratório`);
  const previousCooldown=player.attackCooldown;if(id==="wind_staff")castWind(alt);else if(id==="bow")shootArrow();else if(id==="iron_sword")meleeAttack();
  if(player.attackCooldown>previousCooldown)scienceSystem?.damageEquipment(id,alt?2.2:1,id==="bow"?"disparo":id==="wind_staff"?"conjuração":"ataque")
}
function hitEntity(e,damage,source="ataque",knock=null,attacker=playerActor){
  if(!e||e.persistent||e.dead)return;
  if(e.aquatic){hitAquatic(e,damage);return}
  e.hp=Math.max(0,e.hp-damage);
  if(attacker===playerActor){state.combatTarget=e;state.combatTargetTime=2.8}
  combatParticles(entityAimPoint(e),e.hostile?0xff766c:0xdce8bd,7);
  if(knock){e.vx+=knock.x;e.vz+=knock.z}
  if(e.hp>0){
    QuimiCraftAI.alarm(e.ai,e.profile,attacker);
    e.ai.vision=null;
    e.jumpCooldown=Math.min(e.jumpCooldown,.12);
  }
  sound("hit",.55);
  if(e.hp===0)killEntity(e,source,attacker);
}

function killEntity(e,source,attacker){
  e.dead=true;
  combatParticles(entityAimPoint(e),0xffd889,15);
  const assisted=attacker!==playerActor;
  if(!assisted||QuimiCraftAI.range(e,playerActor)<16){
    const bonus=key=>{
      const lucky=countItem("lucky_charm")>0&&Math.random()<.28?1:0;
      const sample=!String(key).startsWith("raw_")&&isEquipped("sample_case")&&Math.random()<(equipmentDefinition("offhand")?.sampleBonus||0)?1:0;
      return lucky+sample;
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
    offerRescueReward(e);
    scienceSystem?.registerDiscovery("animals",e.type,{name:e.name,source:"Observado em "+biomeAt(e.x,e.z),
      knownRisks:e.hostile?"comportamento hostil":e.profile.temperament==="neutral"?"revida quando provocado":"baixo",
      amountCollected:1,researchProgress:35});
    chatMessage("COMBATE",e.name+" derrotado com "+source+".");
  }else if(QuimiCraftAI.range(e,playerActor)<14){
    chatMessage("GUARDIÃ ÍRIS",e.name+" foi afastado da patrulha.");
  }
  removeEntity(e);
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
function consumeProjectile(p){
  if(p.kind!=="enemy")combatParticles(p.group.position,p.kind==="wind"?0x8cecf5:0xc9c8bd,4);
  frontierFx.impact(p.kind,p.group.position,p.vel);
  p.trail?.close();
  projectileRoot.remove(p.group);
  p.group.traverse(node=>{
    if(p.kind==="wind"||p.kind==="enemy")node.geometry?.dispose();
    if(p.kind==="wind")node.material?.dispose();
  });
}
function updateProjectiles(dt){
  const sample=new THREE.Vector3();
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i],current=p.group.position;
    p.ttl-=dt;
    if(p.kind==="arrow"||p.kind==="guard")p.vel.y-=6.5*dt;
    const previous=current.clone();
    const next=previous.clone().addScaledVector(p.vel,dt);
    const steps=Math.max(1,Math.ceil(previous.distanceTo(next)/.26));
    const targets=p.kind==="enemy"?[playerActor,...npcs]:p.kind==="guard"?entities.filter(e=>!e.persistent&&e.hostile):attackableActors();
    for(let step=1;step<=steps&&p.ttl>0;step++){
      sample.copy(previous).lerp(next,step/steps);
      current.copy(sample);
      if(p.kind==="enemy"&&labSafe(sample.x,sample.y,sample.z)||combatPointBlocked(sample.x,sample.y,sample.z)){p.ttl=0;break}
      for(const target of targets){
        if(target.dead||target===p.owner||target.ai?.recovering>0||Math.abs(target.x-sample.x)>1.2||Math.abs(target.z-sample.z)>1.2)continue;
        if(sample.distanceToSquared(entityAimPoint(target))>entityProjectileRadius(target)**2)continue;
        if(p.kind==="enemy"){
          if(target===playerActor)damagePlayer(p.damage,p.owner?.name||"Espectro",p.attack?.effect);
          else hitNPC(target,p.damage,p.owner);
        }else{
          const owner=p.owner||playerActor;
          hitEntity(target,p.damage,p.kind==="guard"?"flecha da Guardiã":p.kind==="arrow"?"arco":"magia do vento",
            p.vel.clone().setY(0).normalize().multiplyScalar(p.kind==="wind"?5.4:2),owner);
        }
        p.ttl=0;
        break;
      }
    }
    if(p.kind==="arrow"||p.kind==="guard")p.group.quaternion.setFromUnitVectors(projectileForward,p.vel.clone().normalize());
    if(p.kind==="wind"){p.group.rotateZ(dt*7);p.group.rotateX(dt*4)}
    p.trail?.move(current);
    if(p.ttl<=0){consumeProjectile(p);projectiles.splice(i,1)}
  }
}
const MOB_STATUS = {windup:"PREPARANDO ATAQUE",flee:"EM FUGA",chase:"PERSEGUINDO",search:"PROCURANDO",kite:"RECUANDO"};
function updateEnemyHud(dt){const aimed=state.aimEntity&&!state.aimEntity.dead?state.aimEntity:null;if(state.combatTargetTime>0)state.combatTargetTime-=dt;const e=aimed||(state.combatTargetTime>0&&state.combatTarget&&!state.combatTarget.dead?state.combatTarget:null);if(e){$("enemyHud").classList.add("show");$("enemyName").textContent=e.name.toUpperCase()+(MOB_STATUS[e.ai.mode]?" · "+MOB_STATUS[e.ai.mode]:"");$("enemyHp").textContent=`${Math.ceil(e.hp)} / ${e.maxHp}`;$("enemyFill").style.width=clamp(e.hp/e.maxHp*100,0,100)+"%"}else $("enemyHud").classList.remove("show")}

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
    const spectral=t.id===BLOCK.SPECTRAL;
    const lamp=new THREE.PointLight(spectral?0x66ebc8:0xffab54,1,spectral?11:9,2);
    lamp.position.set(t.x+.5,t.y+(spectral?.47:.71),t.z+.5);
    lamp.userData.seed=i*1.7;
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
function sound(type,power=1){if(!audioCtx)return;if(type==="step"){const id=getBlock(player.pos.x,player.pos.y-.12,player.pos.z),stone=[BLOCK.STONE,BLOCK.COAL,BLOCK.IRON,BLOCK.BASALT,BLOCK.DEEPSTONE,BLOCK.FURNACE].includes(id);noiseBurst(.055,.045*power,stone?620:[BLOCK.SAND,BLOCK.RED_SAND].includes(id)?360:900);osc(stone?105:[BLOCK.SAND,BLOCK.RED_SAND].includes(id)?72:125,.05,"triangle",.025*power,-30)}else if(type==="break"){noiseBurst(.22,.15*power,780);osc(135,.14,"square",.04*power,-90)}else if(type==="place"){osc(92,.09,"triangle",.075*power,-32);noiseBurst(.045,.04,460)}else if(type==="splash"){noiseBurst(.22,.08*power,1550);osc(190,.18,"sine",.025,-100)}else if(type==="land"){osc(64,.18,"triangle",.12*power,-25);noiseBurst(.13,.1*power,320)}else if(type==="torch"){osc(640,.09,"sine",.035,120);noiseBurst(.05,.025,2200)}else if(type==="magic"){osc(370,.22,"sine",.05*power,620);osc(720,.16,"triangle",.025*power,260);noiseBurst(.12,.025,3200)}else if(type==="bow"){noiseBurst(.045,.04,1800);osc(185,.13,"triangle",.045*power,-110)}else if(type==="sword"){noiseBurst(.1,.055*power,2600);osc(310,.08,"sawtooth",.022,-130)}else if(type==="hit"){noiseBurst(.09,.07*power,900);osc(95,.08,"square",.028,-35)}else if(type==="pickup"){osc(660,.07,"sine",.035,180);osc(920,.1,"sine",.022,120)}else if(type==="reaction"){noiseBurst(.18,.045*power,2100);osc(240,.22,"sine",.035*power,160);osc(510,.15,"triangle",.018*power,120)}else if(type==="alert"){osc(780,.1,"square",.045*power,-80);setTimeout(()=>osc(620,.14,"square",.04*power,-70),115);noiseBurst(.08,.026*power,2800)}}
function cricket(){if(!audioCtx)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type="sine";o.frequency.value=3600+Math.random()*850;g.gain.setValueAtTime(.0001,t);for(let i=0;i<4;i++){g.gain.linearRampToValueAtTime(.018,t+i*.065+.015);g.gain.exponentialRampToValueAtTime(.0001,t+i*.065+.045)}o.connect(g).connect(master);o.start(t);o.stop(t+.3)}

let invSlots=Array(36).fill(null);const starter=[["wind_staff",1],["bow",1],["iron_sword",1],["arrow",32],[BLOCK.GRASS,28],[BLOCK.STONE,32],[BLOCK.WOOD,12],[BLOCK.TORCH,8],[BLOCK.DOOR,2],[BLOCK.DIRT,24],[BLOCK.SAND,18],[BLOCK.LEAVES,12],[BLOCK.PLANK,18],[BLOCK.COAL,6],["stick",8],[BLOCK.CACTUS,3],["water",4],["bucket",1],[BLOCK.FIRE,2]];starter.forEach(([id,count],i)=>invSlots[i]={id,count});
try{const saved=JSON.parse(localStorage.qc_inventory||"null");if(Array.isArray(saved)&&saved.length>=30){invSlots=Array(36).fill(null);saved.slice(0,36).forEach((v,i)=>invSlots[i]=v)}}catch(e){}
function pinStarter(id,slot,count=1){let at=invSlots.findIndex(s=>s?.id===id);if(at<0){at=invSlots.findIndex(s=>!s);if(at<0)at=invSlots.length-1;invSlots[at]={id,count}}[invSlots[slot],invSlots[at]]=[invSlots[at],invSlots[slot]]}pinStarter("wind_staff",0);pinStarter("bow",1);pinStarter("iron_sword",2);if(!invSlots.some(s=>s?.id==="arrow")){const i=invSlots.findIndex(s=>!s);if(i>=0)invSlots[i]={id:"arrow",count:32}}
const ITEM_NAMES={stick:"Bastão",wind_staff:"Cajado do Vento",bow:"Arco comum",iron_sword:"Espada de ferro",arrow:"Flecha",hydrogen:"Hidrogênio",oxygen:"Oxigênio",water:"Água destilada",copper_ingot:"Cobre refinado",sulfur:"Enxofre",acid:"Ácido sulfúrico",indicator:"Indicador natural",fertilizer:"Fertilizante mineral",glow_solution:"Solução luminescente",copper_sulfate:"Sulfato de cobre",lab_note:"Caderno de laboratório",acid_gel:"Gel ácido",chitin:"Quitina",wind_essence:"Essência do vento",crystal_shard:"Fragmento prismático",copper_core:"Núcleo de cobre",bronze_ingot:"Lingote de bronze",voltaic_cell:"Célula voltaica",ceramic_plate:"Placa cerâmica",feather:"Pena",hide:"Couro",gold_nugget:"Pepita de ouro",antidote:"Antídoto alcalino",armor_plate:"Placa de quitina",storm_focus:"Foco da tempestade",carbon_dioxide:"Dióxido de carbono",quicklime:"Óxido de cálcio",slaked_lime:"Hidróxido de cálcio",alkali:"Solução alcalina",neutral_salt:"Sal neutralizado",rust_pigment:"Pigmento de óxido de ferro",ammonia:"Solução de amônia",tetraammine:"Complexo de cobre",ethanol:"Etanol",plant_oil:"Óleo vegetal",soap:"Sabão artesanal",ph_kit:"Kit de pH",nitrate_mix:"Mistura de nitratos",bread:"Pão rústico",berries:"Frutas silvestres",honey:"Mel da serra",cheese:"Queijo curado",shield:"Escudo de bronze",chainmail:"Cota de malha",liquid_nitrogen:"Nitrogênio líquido",lucky_charm:"Berloque da sorte",prism_pendant:"Pingente prismático",lab_glassware:"Vidrarias de laboratório",carbon_rod:"Bastão de carbono",carbon_filter:"Filtro de carvão ativado",distillation_flask:"Balão de destilação",spectrometer_lens:"Lente espectrométrica",catalyst:"Catalisador metálico",protective_goggles:"Óculos de proteção",sample_case:"Maleta de amostras",sodium_chloride:"Cloreto de sódio",chlorine:"Cloro",sodium_hydroxide:"Hidróxido de sódio",hydrochloric_acid:"Ácido clorídrico",hydrogen_peroxide:"Peróxido de hidrogênio",activated_carbon:"Carvão ativado",purified_water:"Água purificada",copper_oxide:"Óxido de cobre",silver_dust:"Pó de prata",silver_nitrate:"Nitrato de prata",silver_chloride:"Cloreto de prata",sodium_nitrate:"Nitrato de sódio",chromatography_strip:"Cromatograma",pure_ethanol:"Etanol purificado",carbonate_solution:"Solução de carbonato",copper_crystal:"Cristal de sulfato de cobre",spectral_data:"Registro espectral",plated_iron:"Ferro cobreado",carbon_badge:"Insígnia do Prof. Carbono",periodic_key:"Chave da Tabela Periódica",cup:"Copo vazio",water_cup:"Copo com água",bucket:"Balde vazio",water_bucket:"Balde com água",lava_bucket:"Balde com lava",raw_venison:"Carne crua de cervo",cooked_venison:"Carne assada de cervo",raw_pork:"Carne suína crua",cooked_pork:"Carne suína assada",raw_beef:"Carne bovina crua",cooked_beef:"Carne bovina assada",raw_rabbit:"Carne crua de coelho",cooked_rabbit:"Carne assada de coelho",raw_chicken:"Carne crua de frango",cooked_chicken:"Frango assado",raw_mutton:"Carne crua de ovelha",cooked_mutton:"Carne assada de ovelha",wool:"Lã",iron_helmet:"Capacete de ferro",iron_chestplate:"Peitoral de ferro",iron_leggings:"Calças de ferro",iron_boots:"Botas de ferro",lab_coat:"Jaleco científico",respirator_mask:"Máscara respiratória",rubber_boots:"Botas de borracha",oxygen_tank:"Cilindro de oxigênio",chitin_armor:"Armadura de quitina"};
Object.assign(ITEM_NAMES,window.QuimiCraftScience?.itemNames||{});
Object.assign(ITEM_NAMES,Object.fromEntries(Object.entries({...QuimiCraftFrontier.items,...QuimiCraftWorkshops.itemData,...QuimiCraftAlchemy.itemData,...QuimiCraftVehicles.itemData}).map(([id,entry])=>[id,entry[0]])));
const itemName=id=>typeof id==="number"?(BDEF[id]?.name||"Bloco"):(ITEM_NAMES[id]||String(id));
const itemColor=id=>ITEM_COLORS[id]||"#777";
const SCIENCE_ITEM_ALIASES=Object.freeze({iron:BLOCK.IRON,glass:BLOCK.GLASS,plank:BLOCK.PLANK,coal:BLOCK.COAL,copper:BLOCK.COPPER,tin:BLOCK.TIN,limestone:BLOCK.LIMESTONE,sulfur:BLOCK.SULFUR,salt:BLOCK.SALT,wood:BLOCK.WOOD,clay:BLOCK.CLAY,stone:BLOCK.STONE});
const resolveScienceItemId=id=>SCIENCE_ITEM_ALIASES[id]??id;
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
function equipmentDefinition(slot){const item=equipped[slot];return item?EQUIPMENT_DEFS[item.id]||null:null}
function isEquipped(id){return EQUIPMENT_SLOTS.some(slot=>equipped[slot]?.id===id)}
function equippedItemIds(){return EQUIPMENT_SLOTS.map(slot=>equipped[slot]?.id).filter(Boolean)}
function equipmentStat(key,identity=0,mode="sum"){let value=identity;for(const slot of EQUIPMENT_SLOTS){const item=equipped[slot],condition=item&&scienceSystem?.equipmentCondition(item.id);if(condition?.broken)continue;const raw=equipmentDefinition(slot)?.[key];if(typeof raw!=="number")continue;value=mode==="multiply"?value*raw:value+raw}return value}
function playerBreathMax(){const activeTank=equippedItemIds().find(id=>EQUIPMENT_DEFS[id]?.oxygenCapacity),tankReady=!activeTank||scienceSystem?.equipmentCondition(activeTank)?.oxygen>0;return 100+equipmentStat("breathMax")*(tankReady?1:0)}
function breathDrainMultiplier(){return clamp(equipmentStat("breathDrain",1,"multiply"),.25,1)}
function underwaterClarity(){return clamp(.12+equipmentStat("clarity")+(scienceSnapshot?.protections?.clarity||0),.12,.9)}
function saveEquipment(){try{localStorage.qc_equipment_v70=JSON.stringify(equipped)}catch(e){}}
function insertInventoryItem(id,count=1,preferred=-1){if(preferred>=0&&!invSlots[preferred]){invSlots[preferred]={id,count};return true}const stack=invSlots.find(item=>item?.id===id);if(stack){stack.count+=count;return true}const free=invSlots.findIndex(item=>!item);if(free<0)return false;invSlots[free]={id,count};return true}
function equipFromInventory(index,targetSlot=null){
  const item=invSlots[index],def=item&&EQUIPMENT_DEFS[item.id];if(!item||!def)return false;
  const slot=targetSlot||def.slot;if(slot!==def.slot)return toast(`${itemName(item.id)} não pode ser equipado nesse slot`),false;
  const outgoing=equipped[slot],willFree=item.count===1,canStore=!outgoing||willFree||invSlots.some(entry=>!entry)||invSlots.some(entry=>entry?.id===outgoing.id);
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
  equipmentVisualRoot.clear();headGear.clear();leftWrist.clear();chestFit.clear();applyCharacterStyleBase();const head=equipped.head?.id,face=equipped.face?.id,chest=equipped.chest?.id,hands=equipped.hands?.id,legs=equipped.legs?.id,feet=equipped.feet?.id,back=equipped.back?.id,offhand=equipped.offhand?.id;
  playerRig.setEquipment(hands,feet,back,head,face,chest);
  if(chest==="lab_coat"||chest==="chemical_lab_coat"){pCoatMat.color.set(chest==="chemical_lab_coat"?0xd5eee7:0xe8f0ee);pCoatShadeMat.color.set(chest==="chemical_lab_coat"?0x8fbeb2:0xb9cbc8)}
  else if(chest==="chainmail"||chest==="iron_chestplate"){pCoatMat.color.set(chest==="iron_chestplate"?0x8b9aa0:0x9aa5a8);pCoatShadeMat.color.set(0x65747b);part(chestFit,metalMat,[0,.04,-.211],[.5,.55,.045])}
  else if(chest==="chitin_armor"){pCoatMat.color.set(0x9b704b);pCoatShadeMat.color.set(0x67462f);part(chestFit,leatherMat,[0,.04,-.219],[.52,.58,.055])}
  else if(chest==="thermal_coat"){pCoatMat.color.set(0x55799b);pCoatShadeMat.color.set(0x344f6a);part(chestFit,pCoatMat,[0,.06,-.219],[.54,.62,.05])}
  else if(chest==="cooling_vest"){pCoatMat.color.set(0x4fb7c5);pCoatShadeMat.color.set(0x2f7786);for(const x of[-.22,0,.22])part(chestFit,windGlassMat,[x,.06,-.223],[.08,.46,.04])}
  else if(chest==="radiation_suit"){pCoatMat.color.set(0xc8bb45);pCoatShadeMat.color.set(0x756c26);part(chestFit,new THREE.MeshLambertMaterial({color:0x302f22}),[0,.06,-.223],[.12,.12,.04])}
  else if(chest==="fire_suit"){pCoatMat.color.set(0x9b493a);pCoatShadeMat.color.set(0x5b2924);part(chestFit,new THREE.MeshLambertMaterial({color:0xd6aa51}),[0,.06,-.223],[.08,.5,.035])}
  else if(chest==="diving_suit"||chest==="pressure_suit"){pCoatMat.color.set(chest==="pressure_suit"?0x344958:0x205169);pCoatShadeMat.color.set(0x142f3c);part(chestFit,metalMat,[0,.06,-.219],[chest==="pressure_suit" ? .5 : .12,chest==="pressure_suit" ? .53 : .45,.04])}
  if(legs==="iron_leggings")pPantsMat.color.set(0x718087);
  if(head==="protective_goggles"){
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
  if(back==="oxygen_tank"||back==="reinforced_oxygen_tank"){const reinforced=back==="reinforced_oxygen_tank",tankMat=new THREE.MeshStandardMaterial({color:reinforced?0x527a8d:0x6b9faa,roughness:.3,metalness:.5});for(const x of reinforced?[-.18,.18]:[.2]){part(equipmentVisualRoot,tankMat,[x,1.18,.49],[reinforced ? .15 : .18,.54,.16]);part(equipmentVisualRoot,metalMat,[x,1.52,.49],[.1,.07,.1])}}
  if(offhand==="shield"){part(leftWrist,brassMat,[-.09,.06,-.09],[.11,.54,.37]);part(leftWrist,metalMat,[-.142,.081,-.09],[.031,.425,.27])}
  else if(offhand==="sample_case")part(leftWrist,leatherMat,[-.01,-.058,.087],[.29,.20,.135]);
  else if(offhand==="underwater_flashlight"){part(leftWrist,metalMat,[-.012,.05,-.138],[.092,.105,.231]);part(leftWrist,windGlassMat,[-.012,.05,-.259],[.113,.121,.061])}
  else if(offhand==="thermal_blanket")part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:0xd7b568}),[-.38,1.1,.05],[.08,.7,.48]);
  syncInventoryAvatar();player.breath=Math.min(player.breath,playerBreathMax())
}
function applyCharacterStyleBase(){const skin=CHARACTER_OPTIONS.skin[characterStyle.skin]||CHARACTER_OPTIONS.skin[2],hair=CHARACTER_OPTIONS.hair[characterStyle.hair]||CHARACTER_OPTIONS.hair[1],coat=CHARACTER_OPTIONS.coat[characterStyle.coat]||CHARACTER_OPTIONS.coat[0],accent=CHARACTER_OPTIONS.accent[characterStyle.accent]||CHARACTER_OPTIONS.accent[0],pants=CHARACTER_OPTIONS.pants[characterStyle.pants]||CHARACTER_OPTIONS.pants[0];pSkinMat.color.set(skin);pSkinLightMat.color.copy(shadeColor(skin,.11));pSkinShadeMat.color.copy(shadeColor(skin,-.1));pHairMat.color.set(hair);pCoatMat.color.set(coat);pCoatShadeMat.color.copy(shadeColor(coat,-.13));pSleeveMat.color.set(accent);pPantsMat.color.set(pants)}

function saveInventory(){try{localStorage.qc_inventory=JSON.stringify(invSlots)}catch(error){reportSaveIssue("Não foi possível gravar a mochila.",error)}}
function addItem(id,count=1){let s=invSlots.find(x=>x&&x.id===id);if(s)s.count+=count;else{const i=invSlots.findIndex(x=>!x);if(i>=0)invSlots[i]={id,count};else{toast("Mochila cheia");chatMessage("SISTEMA","Mochila cheia.",{category:"system"});return false}}saveInventory();renderInventory();elementMissions?.sync();return true}
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
const WEAPONS=new Set(["wind_staff","bow","iron_sword"]);function iconHTML(item){return item?`${itemIconMarkup(item.id)}<span class="slot-count">${item.count}</span>`:""}
function selectedItem(){return invSlots[state.selected]?.id}
function renderHotbar(){
  $("hotbar").innerHTML=invSlots.slice(0,9).map((it,i)=>`<div class="slot ${i===state.selected?"active":""}" data-hotbar="${i}" role="button" aria-label="Slot ${i+1}: ${itemDisplayName(it)}"><span class="slot-key">${i+1}</span>${iconHTML(it)}</div>`).join("");
  $("hotbar").querySelectorAll("[data-hotbar]").forEach(slot=>slot.addEventListener("pointerdown",event=>{if(!touchInput)return;event.preventDefault();chooseSlot(+slot.dataset.hotbar)}));
  refreshHeldItem();const id=selectedItem(),tips={wind_staff:"Cajado do Vento · clique: orbe · direito: ciclone",bow:`Arco comum · ${countItem("arrow")} flechas`,iron_sword:"Espada de ferro · golpe corpo a corpo",stone_pickaxe:"Picareta de pedra · mineração",iron_pickaxe:"Picareta de ferro · mineração rápida",copper_pickaxe:"Picareta de cobre · extrai prata",hoe:"Enxada · use no topo do solo",fishing_rod:"Vara de pesca · mire na água e interaja",reinforced_rod:"Vara reforçada · recolha a linha na fisgada"};$("combatChip").textContent=tips[id]||`${itemName(id??BLOCK.AIR)} · clique para quebrar`
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
function itemDisplayName(item){if(!item)return"Slot vazio";if(item.liquid){const vessel=item.id==="water_bucket"?"Balde":item.id==="water_cup"?"Copo":itemName(item.id);return`${vessel} com ${item.liquid.name||item.liquid.label||"líquido"}`}return itemName(item.id)}
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
    el.addEventListener("drop",e=>{e.preventDefault();el.classList.remove("drag-over");const to=+el.dataset.index;if(dragEquipmentSlot){unequipSlot(dragEquipmentSlot,to);dragEquipmentSlot=""}else if(dragIndex>=0&&to!==dragIndex)[invSlots[dragIndex],invSlots[to]]=[invSlots[to],invSlots[dragIndex]];dragIndex=-1;saveInventory();renderInventory()});
    el.addEventListener("click",()=>{const index=+el.dataset.index,slot=EQUIPMENT_DEFS[invSlots[index]?.id]?.slot;if(EQUIPMENT_SLOTS.includes(slot))return equipFromInventory(index);if(!touchInput)return;if(touchInventoryIndex<0){touchInventoryIndex=index;el.classList.add("touch-selected");return}if(touchInventoryIndex!==index)[invSlots[touchInventoryIndex],invSlots[index]]=[invSlots[index],invSlots[touchInventoryIndex]];touchInventoryIndex=-1;saveInventory();renderInventory()});
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
scienceUI=window.QuimiCraftScienceUI.createScienceUI({
  system:scienceSystem,
  elements:PERIODIC_ELEMENTS,
  bridge:{
    itemName,
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
  else if(view==="hints")content.innerHTML=active?`<h3>Dica — ${active.title}</h3><p>${active.hint}</p><p>Progresso atual: ${active.progress.current} / ${active.progress.total}. Itens já obtidos são reconhecidos sempre que o objetivo permitir.</p>`:`<h3>Dicas</h3><p>Escolha uma missão. O rastreador mostrará somente o objetivo ativo; você pode ocultá-lo com × e reexibi-lo com a tecla M.</p>`;
  content.querySelectorAll("[data-jump-view]").forEach(button=>button.onclick=()=>renderProfessor(button.dataset.jumpView));
  content.querySelectorAll("[data-mission-action]").forEach(button=>button.onclick=()=>{const mission=elementMissions.getMissionForElement(Number(button.dataset.missionAction.match(/\d+/)?.[0]));if(!mission)return;if(mission.state==="available"){elementMissions.startMission(mission.id);elementMissions.setTrackerHidden(false);messageCenter.add({category:"mission",speaker:"PROF. CARBONO",text:`${mission.title}: ${mission.objective.description}`});refreshPeriodicWall();renderProfessor("current")}else if(mission.state==="ready-to-complete"){const completed=elementMissions.completeActiveMission();if(completed){scienceSystem?.registerDiscovery("elements",String(completed.elementAtomicNumber),{name:completed.elementName,symbol:completed.elementSymbol,source:completed.objective?.description||"Missão do Prof. Carbono",researchProgress:100});scienceSystem?.registerDiscovery("missions","periodic_elements",{name:"Restauração da Tabela Periódica",source:`${completed.elementName} (${completed.elementSymbol})`,researchProgress:Math.round(elementMissions.getStats().completed/118*100)});scienceSystem?.grantResearchPoints(3,`missão do elemento ${completed.elementSymbol}`);saveInventory();renderInventory();refreshPeriodicWall();renderProfessor("progress")}}else toast(mission.hint);updateMissionHud()})
}
function openProfessor(){state.professor=true;state.playing=false;state.left=false;$("professor").classList.add("open");$("professor").setAttribute("aria-hidden","false");document.exitPointerLock?.();const first=!elementMissions.getStats().introduced;elementMissions.introduce();elementMissions.recordEvent("talk_npc",{id:"carbon"});if(first)messageCenter.add({category:"dialogue",speaker:"PROF. CARBONO",text:"Quero transformar esta tabela em um arquivo vivo dos 118 elementos. Vamos começar pelos elementos essenciais."});renderProfessor(first?"talk":professorView)}
function closeProfessor(){state.professor=false;$("professor").classList.remove("open");$("professor").setAttribute("aria-hidden","true");requestPointer()}
function reactionParticles(kind){if(settings.particles===0)return;const col=kind==="copper_sulfate"?0x3478e5:kind==="acid"?0x9edb54:0x62e5c0;for(let i=0;i<(settings.particles===1?7:14);i++){const p={x:player.pos.x+.5,y:player.pos.y+1,z:player.pos.z+.5,id:BLOCK.GLASS};const m=new THREE.Mesh(new THREE.SphereGeometry(.035+hash(i,2)*.045,5,4),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8}));m.position.set(p.x+(hash(i,3)-.5),p.y+hash(i,4),p.z+(hash(i,5)-.5));m.userData.v=new THREE.Vector3((hash(i,6)-.5)*.6,.5+hash(i,7),(hash(i,8)-.5)*.6);m.userData.life=.8+hash(i,9);particleGroup.add(m);particles.push(m)}}

const SHOP_CATALOG={
  civic_market:{title:"Mercado de Feira",subtitle:"Sementes, ervas e mantimentos da vila.",
    goods:[["wheat_seed",2,4],["bean_seed",2,3],["wild_mint",3,3],["honey",4,2],["bait",2,4]]},
  food:{title:"Mercearia da Colheita",subtitle:"Comidas preparadas e ingredientes da região.",goods:[["bread",3,2],["berries",2,3],["honey",4,2],["cheese",5,2],["plant_oil",5,1]]},
  armor:{title:"Forja Cobalto",subtitle:"Proteções, ferramentas e peças reforçadas.",goods:[["shield",10,1],["chainmail",14,1],["iron_helmet",12,1],["iron_boots",11,1],["armor_plate",8,1],["iron_sword",12,1],[BLOCK.BRONZE_BLOCK,9,2]]},
  solid:{title:"Reagentes Sólidos",subtitle:"Minerais e substâncias secas para novas reações.",goods:[[BLOCK.LIMESTONE,3,4],[BLOCK.NITER,5,2],[BLOCK.SULFUR,4,2],[BLOCK.SALT,3,3],[BLOCK.AMETHYST,8,1],[BLOCK.ZINC,6,1],["silver_dust",9,1],[BLOCK.COPPER,5,2]]},
  liquid:{title:"Reagentes Líquidos",subtitle:"Soluções preparadas em frascos selados.",goods:[["water",2,3],["acid",7,1],["indicator",5,2],["ammonia",6,2],["ethanol",6,2],["liquid_nitrogen",12,1],["hydrogen_peroxide",9,1],["purified_water",5,2]]},
  trinket:{title:"Berloques Prismáticos",subtitle:"Pequenos artefatos raros com propriedades especiais.",goods:[["lucky_charm",9,1],["prism_pendant",14,1],["wind_essence",8,1],["crystal_shard",7,2],["storm_focus",22,1],[BLOCK.SPECTRAL,6,2]]}
};
let currentShop="";
function openShop(kind){const s=SHOP_CATALOG[kind];if(!s)return;currentShop=kind;state.shop=true;state.playing=false;state.left=false;$('shopTitle').textContent=s.title;$('shopSubtitle').textContent=s.subtitle;$('shop').classList.add('open');document.exitPointerLock?.();renderShop()}
function renderShop(){const s=SHOP_CATALOG[currentShop];if(!s)return;$('shopWallet').textContent=`${countItem('gold_nugget')} pepitas de ouro`;$('shopGrid').innerHTML=s.goods.map(([id,price,count],i)=>`<button class="shop-item" data-buy="${i}" ${countItem('gold_nugget')>=price?'':'disabled'}><span class="shop-icon"><span class="voxel-icon" style="--icon:${itemColor(id)}"></span></span><span><strong>${itemName(id)} ×${count}</strong><small>${price} pepitas</small></span></button>`).join('');$('shopGrid').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyShop(+b.dataset.buy))}
function buyShop(i){const g=SHOP_CATALOG[currentShop]?.goods[i];if(!g)return;const [id,price,count]=g;if(countItem('gold_nugget')<price)return toast('Pepitas insuficientes');if(!invSlots.some(s=>s?.id===id)&&!invSlots.some(s=>!s)){toast('Mochila cheia');chatMessage("SISTEMA","Mochila cheia.",{category:"system"});return}removeItem('gold_nugget',price);addItem(id,count);saveInventory();renderInventory();renderShop();sound('pickup',.7);toast(`${itemName(id)} adquirido`)}
function closeShop(){state.shop=false;$('shop').classList.remove('open');requestPointer()}

const entityRoot=new THREE.Group(),entities=[],npcs=[];scene.add(entityRoot);let mobClock=0,entityPathBudget=0;
const mobMats={
  copper:new THREE.MeshStandardMaterial({color:0xb96d43,roughness:.34,metalness:.66,emissive:0x241006}),copperDark:new THREE.MeshStandardMaterial({color:0x613826,roughness:.3,metalness:.72}),dark:new THREE.MeshLambertMaterial({color:0x26343a}),slime:new THREE.MeshStandardMaterial({color:0x70c95b,transparent:true,opacity:.82,roughness:.18,emissive:0x102d0c}),slimeDark:new THREE.MeshLambertMaterial({color:0x3d8039,transparent:true,opacity:.9}),cyan:new THREE.MeshStandardMaterial({color:0x63d7ce,roughness:.16,emissive:0x19443f}),brown:new THREE.MeshLambertMaterial({color:0x8f6242}),furDark:new THREE.MeshLambertMaterial({color:0x593b2c}),furLight:new THREE.MeshLambertMaterial({color:0xb9855b}),cream:new THREE.MeshLambertMaterial({color:0xd2bd98}),eye:new THREE.MeshBasicMaterial({color:0x0b1012}),iris:new THREE.MeshBasicMaterial({color:0xd9f5dc}),purple:new THREE.MeshStandardMaterial({color:0x7e5aa9,roughness:.22,emissive:0x24183a}),obsidian:new THREE.MeshStandardMaterial({color:0x292638,roughness:.3,metalness:.34,emissive:0x110b1b}),lava:new THREE.MeshStandardMaterial({color:0xf15b22,roughness:.2,emissive:0x7a1d05,emissiveIntensity:1.4}),sand:new THREE.MeshLambertMaterial({color:0xc79655}),sandDark:new THREE.MeshLambertMaterial({color:0x765238}),green:new THREE.MeshLambertMaterial({color:0x527349}),moss:new THREE.MeshLambertMaterial({color:0x48603e}),white:new THREE.MeshLambertMaterial({color:0xe8e1cf}),antler:new THREE.MeshLambertMaterial({color:0x765336}),bone:new THREE.MeshLambertMaterial({color:0xd9ceb0}),red:new THREE.MeshLambertMaterial({color:0x9d3f35}),pink:new THREE.MeshLambertMaterial({color:0xd98b92}),pinkDark:new THREE.MeshLambertMaterial({color:0xa95f66}),cowBlack:new THREE.MeshLambertMaterial({color:0x282b2d}),wool:new THREE.MeshLambertMaterial({color:0xe5dfcf}),sheepWool:new THREE.MeshLambertMaterial({color:0xf1ede1}),sheepWoolShade:new THREE.MeshLambertMaterial({color:0xd6cdbd}),sheepFace:new THREE.MeshLambertMaterial({color:0x4b4742}),sheepMuzzle:new THREE.MeshLambertMaterial({color:0xb8a18b}),sheepNose:new THREE.MeshLambertMaterial({color:0x2d2928}),sheepEarInner:new THREE.MeshLambertMaterial({color:0xc88986}),sheepHoof:new THREE.MeshLambertMaterial({color:0x262628}),beak:new THREE.MeshLambertMaterial({color:0xe0a23c})
};
Object.assign(mobMats,{eyeBrown:new THREE.MeshBasicMaterial({color:0x6b3f24}),eyeGreen:new THREE.MeshBasicMaterial({color:0x72b985}),eyeAmber:new THREE.MeshBasicMaterial({color:0xe1a83f}),eyeAcid:new THREE.MeshBasicMaterial({color:0x9cf06e}),eyeCrystal:new THREE.MeshBasicMaterial({color:0x70e8f0}),eyeViolet:new THREE.MeshBasicMaterial({color:0xb68cff}),eyeEmber:new THREE.MeshBasicMaterial({color:0xff7a2f})});
const NPC_PROFILES={
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
  rime_fox:{model:"capivara",name:"Raposa do Gelo Azul",tint:0xd6e5ee,scale:.80,height:.9,radius:.39},
  travertine_guard:{model:"golem",name:"Sentinela de Travertino",tint:0xd7b790,scale:.87,height:1.87,radius:.57},
  iron_armadillo:{model:"pig",name:"Tatu de Hematita",tint:0xa45a46,scale:.72,height:.84,radius:.38},
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
      mat.color.lerp(new THREE.Color(variant.tint),["frost_owl","snow_hare","marsh_heron","wild_boar","scoria_ram","amber_ibis","rime_fox","travertine_guard","iron_armadillo","peat_slime"].includes(type)?.69:.42);
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
  if(type==="savanna_gazelle")for(const side of [-1,1]){
    beam(rig.head,mobMats.antler,[side*.16,.23,.01],[side*.24,.62,.11],.04);
    part(rig.body,mobMats.furDark,[0,.83,side*.285],[.56,.083,.035]);
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
  if(type==="forest_deer")for(const side of [-1,1]){
    for(let i=0;i<3;i++)part(rig.body,mobMats.cream,[-.29+i*.22,.96-i*.04,side*.29],[.091,.071,.02]);
    beam(rig.head,mobMats.antler,[side*.19,.38,.03],[side*.49,.76,.10],.045);
    beam(rig.head,mobMats.antler,[side*.34,.57,.07],[side*.54,.61,-.09],.04);
  }
  if(type==="mangrove_capivara")for(const side of [-1,1]){
    part(rig.head,mobMats.furDark,[side*.235,.04,-.245],[.088,.19,.03],[0,0,side*.28]);
    part(rig.body,mobMats.moss,[-.1,.78,side*.265],[.31,.094,.026],[0,0,side*.12]);
  }
  if(type==="frost_owl")for(const wing of rig.wings){
    const side=wing.userData.side;
    for(let i=0;i<3;i++)part(wing,mobMats.white,[side*(.48+i*.063),-.24-i*.036,.067],[.22,.09,.19],[0,0,side*.49]);
  }
  if(type==="amber_ibis"){
    beam(rig.head,mobMats.dark,[0,-.091,-.24],[0,-.185,-.53],.057);
    beam(rig.head,mobMats.beak,[0,-.181,-.53],[0,-.295,-.68],.041);
    for(const side of [-1,1]){
      beam(g,mobMats.beak,[side*.14,.42,.02],[side*.14,.025,.18],.036);
      beam(g,mobMats.beak,[side*.14,.025,.18],[side*.14,.033,-.03],.027);
    }
  }
  if(type==="rime_fox"){
    part(rig.head,mobMats.cream,[0,-.095,-.404],[.28,.174,.20]);
    part(rig.head,mobMats.dark,[0,-.105,-.52],[.104,.08,.08]);
    for(const side of [-1,1]){
      part(rig.head,mobMats.white,[side*.19,.32,.035],[.14,.30,.12],[0,0,side*.22]);
      part(rig.head,mobMats.cream,[side*.19,.347,-.032],[.08,.18,.026],[0,0,side*.22]);
    }
    const tail=new THREE.Group();
    tail.position.set(0,.63,.42);tail.userData.side=1;
    part(tail,mobMats.white,[0,.05,.23],[.23,.27,.59],[.2,0,0]);
    part(tail,mobMats.furLight,[0,-.06,.53],[.19,.20,.16]);
    g.add(tail);rig.tails.push(tail);
  }
  if(type==="iron_armadillo"){
    for(let i=0;i<5;i++)part(g,i%2?metalMat:mobMats.copper,[0,.89,-.24+i*.16],[.665-i*.027,.18,.13],[i*.031,0,0]);
    if(rig.head)part(rig.head,mobMats.copperDark,[0,-.084,-.34],[.22,.11,.29]);
    const tail=new THREE.Group();tail.position.set(0,.48,.46);
    beam(tail,mobMats.copperDark,[0,0,0],[0,-.105,.46],.087);
    g.add(tail);rig.tails.push(tail);
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
function createEntity(type,x,z,persistent=false,resident=null){
  if(type==="npc")type="npc_carbon";
  const species=type,variant=FAUNA_VARIANTS[species];
  if(variant)type=variant.model;const g=new THREE.Group(),h=Number.isFinite(resident?.y)?resident.y:findStandingY(x,z,terrainHeight(x,z)+2),rig={legs:[],arms:[],wings:[],tails:[],rotors:[],eyes:[],head:null,body:null};g.position.set(x,h,z);let name="Criatura",flying=false,role="";
  if(type==="npc_carbon"||type==="npc_ranger"){
    role=type==="npc_carbon"?"carbon":"ranger";name=role==="carbon"?"Prof. Carbono":"Guardiã Íris";const cloth=role==="carbon"?coatMat:mobMats.green,hair=role==="carbon"?hairMat:mobMats.furDark;
    rig.body=part(g,cloth,[0,1.13,0],[.58,.72,.32]);part(g,role==="carbon"?coatShadeMat:mobMats.moss,[0,1.13,-.177],[.52,.62,.035]);part(g,leatherMat,[0,.83,-.19],[.61,.1,.07]);part(g,brassMat,[0,.83,-.226],[.1,.13,.045]);
    const head=new THREE.Group();head.position.set(0,1.79,0);g.add(head);rig.head=head;part(head,skinMat,[0,0,0],[.43,.43,.43]);part(head,hair,[0,.235,.015],[.47,.1,.45]);part(head,hair,[-.205,.06,.015],[.07,.29,.42]);for(const sx of [-1,1]){part(head,skinLightMat,[sx*.232,0,0],[.055,.13,.12]);brightEye(head,sx*.09,.045,-.226,.055,role==="carbon"?mobMats.eyeBrown:mobMats.eyeGreen);part(head,hair,[sx*.09,.13,-.232],[.11,.025,.018],[0,0,sx*.08])}part(head,skinLightMat,[0,-.005,-.241],[.065,.1,.05]);part(head,skinShadeMat,[0,-.145,-.232],[.1,.04,.018]);
    part(g,skinShadeMat,[0,1.54,0],[.18,.16,.18]);for(const sx of [-1,1]){part(g,cloth,[sx*.36,1.43,0],[.2,.22,.32]);jointArm(g,rig,sx*.45,1.5,0,cloth,skinLightMat,.7,.21);jointLeg(g,rig,sx*.17,0,.78,.82,.22,pantsMat,bootMat,sx>0?Math.PI:0)}
    if(role==="carbon"){
      part(g,coatMat,[-.2,1.18,-.181],[.24,.54,.028],[0,0,-.035]);part(g,coatMat,[.2,1.18,-.181],[.24,.54,.028],[0,0,.035]);part(g,mobMats.red,[0,1.35,-.198],[.08,.3,.025]);glassesFrame(g,-.09,1.835,-.258,.13,.1);glassesFrame(g,.09,1.835,-.258,.13,.1);part(g,metalMat,[0,1.835,-.26],[.05,.018,.014]);part(g,mobMats.cyan,[.2,1.03,-.19],[.15,.14,.018]);const flask=new THREE.Mesh(new THREE.OctahedronGeometry(.085,0),windGlassMat);flask.position.set(-.46,.77,-.08);g.add(flask)
    }else{
      part(g,mobMats.green,[0,2.09,.045],[.54,.17,.53]);part(g,mobMats.moss,[0,1.6,.205],[.68,.5,.09]);part(g,leatherMat,[.39,1.12,.25],[.17,.65,.22]);for(let q=0;q<5;q++)beam(g,metalMat,[.36,1.38-q*.12,.18],[.36,1.38-q*.12,-.3],.022,.022);for(let q=0;q<4;q++)part(g,hair,[-.26,1.62-q*.13,.18],[.09,.16,.1],[q*.12,0,-.2]);const backBow=weaponModel("bow",false);backBow.position.set(-.34,1.16,.35);backBow.rotation.set(.12,0,-.34);backBow.scale.multiplyScalar(.78);g.add(backBow)
    }
    const label=nameSprite(name,role==="carbon"?"#b8e5d6":"#d8e7a8");label.position.set(0,2.58,0);g.add(label);persistent=true
  }else if(type.startsWith("npc_")){
    const original=NPC_PROFILES[type]||NPC_PROFILES.npc_farmer;
    const alchemist=original.role==="alchemist",school=resident?.office?.kind||"wandering";
    const p=resident?{...original,...resident,color:new THREE.Color(original.color).lerp(new THREE.Color(resident.tint),.63),accent:resident.trim}:original;
    const cloth=new THREE.MeshLambertMaterial({color:p.color}),accent=new THREE.MeshStandardMaterial({color:p.accent,roughness:.38,metalness:p.accessory==="helm"?.58:.08}),npcSkin=new THREE.MeshLambertMaterial({color:p.skin}),npcSkinLight=npcSkin.clone(),npcHair=new THREE.MeshLambertMaterial({color:p.hair});npcSkinLight.color.offsetHSL(0,.015,.095);role=p.role;name=p.name;if(!alchemist){rig.body=part(g,cloth,[0,1.12,0],[.58,.72,.32]);part(g,accent,[0,1.13,-.178],[.5,.16,.035]);part(g,leatherMat,[0,.83,-.19],[.61,.1,.07]);part(g,accent,[0,.83,-.226],[.1,.13,.045])}part(g,npcSkin,[0,1.55,0],[.18,.15,.18]);
    const head=new THREE.Group();head.position.set(0,1.79,0);g.add(head);rig.head=head;part(head,npcSkin,[0,0,0],[.43,.43,.43]);if(!alchemist||school==="pigment"){part(head,npcHair,[0,.22,.025],[.447,.097,.427]);part(head,npcHair,[-.205,.07,.025],[.075,.28,.42])}for(const sx of [-1,1]){part(head,npcSkinLight,[sx*.232,0,0],[.055,.13,.12]);brightEye(head,sx*.09,.045,-.226,.055,[mobMats.eyeBrown,mobMats.eyeGreen,mobMats.eyeAmber,mobMats.eyeViolet][(resident?.variant??Math.abs(Math.floor(p.color)))%4]);part(head,npcHair,[sx*.09,.14,-.232],[.11,.025,.018],[0,0,sx*.08]);part(g,cloth,[sx*.36,1.43,0],[.2,.22,.32]);jointArm(g,rig,sx*.45,1.5,0,cloth,npcSkinLight,.7,.21);jointLeg(g,rig,sx*.17,0,.78,.82,.22,pantsMat,bootMat,sx>0?Math.PI:0)}part(head,npcSkinLight,[0,-.005,-.241],[.065,.1,.05]);part(head,npcSkin,[0,-.145,-.232],[.1,.04,.018]);
    if(alchemist)rig.cape=playerModels.alchemistAttire(g,head,rig.arms,school);
    if(!alchemist&&p.accessory==="apron"){part(g,mobMats.cream,[0,1.08,-.202],[.43,.55,.025]);for(let q=-1;q<=1;q++)part(g,accent,[q*.14,.92,-.228],[.08,.11,.025])}
    if(p.accessory==="helm"||p.accessory==="lamp"){part(g,p.accessory==="helm"?metalMat:mobMats.dark,[0,2.10,.02],[.54,.2,.53]);if(p.accessory==="lamp")part(g,windGlassMat,[0,2.12,-.28],[.13,.12,.08])}
    if(!alchemist&&p.accessory==="goggles"){glassesFrame(g,-.09,1.835,-.258,.13,.1);glassesFrame(g,.09,1.835,-.258,.13,.1);part(g,accent,[0,1.835,-.26],[.05,.018,.014])}
    if(p.accessory==="vials")for(let q=-1;q<=1;q++){const vial=new THREE.Mesh(new THREE.OctahedronGeometry(.065,0),q===0?windGlassMat:q<0?mobMats.purple:mobMats.slime);vial.position.set(q*.15,1.0,-.24);g.add(vial)}
    if(p.accessory==="crown"||p.accessory==="crystal"){for(let q=-1;q<=1;q++){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.085+Math.abs(q)*.015,0),q===0?windGlassMat:mobMats.purple);gem.position.set(q*.15,p.accessory==="crown"?2.12:1.12,-.08);gem.rotation.z=q*.25;g.add(gem)}}
    if(p.accessory==="hat"){part(g,accent,[0,2.10,0],[.67,.07,.64]);part(g,accent,[0,2.24,.02],[.42,.25,.40])}
    if(!alchemist&&p.accessory==="flowers")for(let q=-2;q<=2;q++){const bud=new THREE.Mesh(new THREE.OctahedronGeometry(.055,0),q%2?mobMats.purple:mobMats.red);bud.position.set(q*.11,2.04-Math.abs(q)*.018,-.25);g.add(bud)}
    if(p.accessory==="book"){part(g,mobMats.red,[.27,1.08,-.24],[.23,.31,.06],[0,0,.18]);part(g,mobMats.cream,[.27,1.08,-.31],[.18,.25,.018],[0,0,.18])}
    if(!alchemist&&p.accessory==="sash")part(g,accent,[0,1.22,-.205],[.12,.78,.028],[0,0,.45]);
    if(resident)g.scale.setScalar(resident.scale);
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
        if(resident.variant>1)part(head,npcHair,[.16,-.102,.189],[.13,.365,.101],[0,0,-.12]);
      }
    }
    const label=nameSprite(name,alchemist?"#dec9fc":p.shop?"#f1d985":"#c9e7c0");label.position.set(0,alchemist?2.67:2.58,0);g.add(label);persistent=true
  }else if(type==="moth"){
    name="Mariposa Lúmen";flying=true;
  }else if(type==="slime"){
    name="Slime Ácido";const blob=new THREE.Group();g.add(blob);rig.body=blob;part(blob,mobMats.slime,[0,.4,0],[.88,.7,.8]);part(blob,mobMats.slime,[0,.82,.04],[.65,.3,.61]);part(blob,mobMats.slimeDark,[0,.18,-.41],[.6,.14,.04]);for(const sx of [-1,1]){brightEye(blob,sx*.23,.58,-.414,.075,mobMats.eyeAcid,true);part(blob,mobMats.dark,[sx*.2,.34,-.416],[.045,.04,.02])}for(let q=0;q<3;q++)part(blob,windGlassMat,[-.3+q*.29,.73+(q%2)*.12,.22],[.07,.08,.065]);for(let q=0;q<4;q++)part(g,mobMats.slime,[(q<2?-1:1)*.54,.09,(q%2?-.31:.31)],[.24,.18,.26])
  }else if(type==="cobrete"){
    name="Cobrete";rig.body=part(g,mobMats.copper,[0,.86,0],[.62,.73,.44]);part(g,mobMats.copperDark,[0,.87,-.237],[.43,.5,.035]);part(g,brassMat,[0,.86,-.258],[.2,.27,.025]);part(g,mobMats.copper,[0,1.47,0],[.5,.44,.42]);part(g,mobMats.dark,[0,1.49,-.228],[.38,.26,.035]);for(const sx of [-1,1]){brightEye(g,sx*.14,1.52,-.247,.065,mobMats.eyeCrystal,true);jointArm(g,rig,sx*.48,1.18,0,mobMats.copper,mobMats.copperDark,.66,.19);jointLeg(g,rig,sx*.2,0,.62,.65,.2,mobMats.copper,mobMats.dark,sx>0?Math.PI:0);part(g,brassMat,[sx*.4,1.26,0],[.18,.22,.24])}part(g,brassMat,[0,1.78,0],[.17,.11,.18]);beam(g,brassMat,[0,1.79,0],[.15,2.02,-.04],.025);part(g,windGlassMat,[.17,2.05,-.05],[.055,.055,.055]);for(const sx of [-1,1]){const gear=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,5,10),mobMats.copperDark);gear.position.set(sx*.33,.86,.46);gear.rotation.y=Math.PI/2;g.add(gear);rig.rotors.push(gear)}
  }else if(type==="cristalume"){
    name="Cristalume";flying=true;const core=new THREE.Mesh(new THREE.OctahedronGeometry(.42,1),windGlassMat);core.position.y=.82;core.castShadow=true;g.add(core);rig.body=core;part(g,mobMats.purple,[0,.82,.18],[.22,.28,.22]);for(const sx of [-1,1]){brightEye(g,sx*.1,.9,-.35,.05,mobMats.eyeViolet);const wing=new THREE.Group();wing.position.set(sx*.24,.86,.04);wing.userData.side=sx;g.add(wing);beam(wing,brassMat,[0,0,0],[sx*.5,.09,.08],.025);beam(wing,brassMat,[0,0,0],[sx*.42,-.18,.1],.025);part(wing,windGlassMat,[sx*.3,-.02,.1],[.42,.055,.28],[0,0,sx*.24]);part(wing,mobMats.purple,[sx*.57,.02,.1],[.18,.04,.14],[0,0,sx*.45]);rig.wings.push(wing)}let crystalTail=[0,.63,.2];for(let q=0;q<3;q++){const next=[(q-1)*.12,.5-q*.1,.36+q*.12];beam(g,mobMats.purple,crystalTail,next,.026);const shard=new THREE.Mesh(new THREE.OctahedronGeometry(.12-q*.018,0),q===1?mobMats.purple:windGlassMat);shard.position.set(...next);shard.rotation.x=.5;g.add(shard);crystalTail=next}
  }else if(type==="scorpion"){
    name="Escorpião das Dunas";for(let q=0;q<4;q++)part(g,q%2?mobMats.sandDark:mobMats.sand,[0,.27,-.34+q*.21],[.52-q*.045,.24,.28]);for(const sx of [-1,1])part(g,mobMats.sandDark,[sx*.1,.22,-.535],[.1,.08,.12],[0,sx*.25,sx*.2]);for(const sx of [-1,1]){brightEye(g,sx*.13,.36,-.495,.045,mobMats.eyeAmber,true);for(let q=0;q<4;q++){const leg=new THREE.Group();leg.position.set(sx*.3,.17,-.27+q*.18);leg.userData.phase=(q%2)*Math.PI;leg.userData.side=sx;g.add(leg);part(leg,mobMats.sandDark,[sx*.2,0,0],[.34,.055,.075],[0,0,sx*.38]);const tip=new THREE.Group();tip.position.set(sx*.36,-.04,0);leg.add(tip);part(tip,mobMats.dark,[sx*.17,-.12,0],[.32,.06,.06],[0,0,sx*.48]);rig.legs.push(leg)}const claw=new THREE.Group();claw.position.set(sx*.3,.32,-.48);claw.userData.side=sx;g.add(claw);beam(claw,mobMats.sandDark,[0,0,0],[sx*.28,.02,-.18],.1,.11);part(claw,mobMats.sand,[sx*.35,.03,-.23],[.22,.16,.2]);part(claw,mobMats.dark,[sx*.47,.11,-.34],[.16,.07,.08],[0,sx*.25,sx*.35]);part(claw,mobMats.dark,[sx*.47,-.05,-.34],[.16,.07,.08],[0,-sx*.25,-sx*.35]);rig.arms.push(claw)}
    let tail=new THREE.Group();tail.position.set(0,.38,.42);g.add(tail);for(let q=0;q<4;q++){tail.rotation.x=-.28+q*.08;part(tail,q%2?mobMats.sandDark:mobMats.sand,[0,.1,.1],[.18-q*.018,.2,.2-q*.018]);rig.tails.push(tail);const next=new THREE.Group();next.position.set(0,.18,.16);tail.add(next);tail=next}const sting=new THREE.Mesh(new THREE.OctahedronGeometry(.14,0),mobMats.dark);sting.position.set(0,.16,.12);sting.scale.z=1.45;tail.add(sting)
  }else if(type==="golem"){
    name="Golem de Obsidiana";rig.body=part(g,mobMats.obsidian,[0,1.14,0],[.9,.94,.52]);part(g,mobMats.obsidian,[0,1.66,0],[.38,.18,.36]);part(g,mobMats.purple,[0,1.18,-.282],[.3,.38,.045]);part(g,mobMats.moss,[-.3,1.63,-.3],[.25,.08,.24]);part(g,mobMats.obsidian,[0,1.94,0],[.65,.55,.56]);part(g,mobMats.dark,[0,1.77,-.302],[.4,.12,.04]);for(const sx of [-1,1]){brightEye(g,sx*.18,2.02,-.315,.075,mobMats.eyeViolet);jointArm(g,rig,sx*.72,1.56,0,mobMats.obsidian,mobMats.obsidian,.98,.34);jointLeg(g,rig,sx*.3,0,.78,.82,.36,mobMats.obsidian,mobMats.dark,sx>0?Math.PI:0);part(g,mobMats.obsidian,[sx*.7,1.62,0],[.42,.35,.46]);part(g,mobMats.purple,[sx*.23,1.13,-.286],[.07,.25,.035],[0,0,sx*.22])}for(let q=0;q<4;q++)part(g,mobMats.purple,[-.29+q*.19,.91+q*.12,-.286],[.08,.035,.025],[0,0,(q-2)*.35])
  }else if(type==="wisp"){
    name="Espectro da Tempestade";flying=true;const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.34,1),mobMats.purple);core.position.y=.76;g.add(core);rig.body=core;for(const sx of [-1,1])brightEye(g,sx*.11,.8,-.325,.05,mobMats.eyeCrystal);for(let q=0;q<3;q++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.43+q*.1,.024,6,16),q===1?brassMat:windMat);ring.position.y=.76;ring.rotation.set(q*.7,q*.45,0);g.add(ring);ring.userData.phase=q;rig.rotors.push(ring)}for(const sx of [-1,1])beam(g,windMat,[sx*.12,.52,.12],[sx*.28,.05,.42],.035);const crown=new THREE.Mesh(new THREE.OctahedronGeometry(.12,0),windGlassMat);crown.position.set(0,1.18,0);g.add(crown)
  }else if(type==="magma"){
    name="Elemental de Magma";rig.body=part(g,mobMats.obsidian,[0,1.02,0],[.72,.83,.48]);part(g,mobMats.lava,[0,1.02,-.262],[.36,.5,.04]);part(g,mobMats.obsidian,[0,1.69,0],[.54,.46,.44]);part(g,mobMats.dark,[0,1.54,-.242],[.35,.1,.035]);for(const sx of [-1,1]){brightEye(g,sx*.16,1.75,-.255,.065,mobMats.eyeEmber,true);part(g,mobMats.obsidian,[sx*.43,1.4,0],[.24,.25,.32]);jointArm(g,rig,sx*.57,1.35,0,mobMats.obsidian,mobMats.lava,.78,.25);jointLeg(g,rig,sx*.24,0,.68,.72,.27,mobMats.obsidian,mobMats.dark,sx>0?Math.PI:0);beam(g,mobMats.obsidian,[sx*.18,1.93,0],[sx*.4,2.12,.05],.07);part(g,mobMats.lava,[sx*.23,1.03,-.267],[.06,.3,.025],[0,0,sx*.25])}for(let q=0;q<3;q++)part(g,mobMats.lava,[-.22+q*.22,.72+q*.17,-.267],[.08,.035,.025],[0,0,(q-1)*.5])
  }else if(type==="pig"){
    name="Porco";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.pink,[0,.56,.06],[.82,.55,.52]);const head=new THREE.Group();head.position.set(0,.66,-.55);g.add(head);rig.head=head;part(head,mobMats.pink,[0,0,0],[.52,.45,.43]);part(head,mobMats.pinkDark,[0,-.08,-.39],[.3,.2,.16]);for(const sx of [-1,1]){brightEye(head,sx*.17,.09,-.235,.042,mobMats.eyeBrown);part(head,mobMats.pinkDark,[sx*.25,.28,-.03],[.15,.17,.08],[0,0,sx*.35]);part(head,mobMats.dark,[sx*.09,-.08,-.49],[.035,.045,.025]);for(const zOff of [-.25,.28])jointLeg(g,rig,sx*.31,zOff,.43,.43,.16,mobMats.pink,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI)}const tail=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,5,12,Math.PI*1.55),mobMats.pinkDark);tail.position.set(0,.72,.5);tail.rotation.set(0,Math.PI/2,.4);g.add(tail)
  }else if(type==="cow"){
    name="Vaca";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.82,.06],[1.02,.72,.58]);part(body,mobMats.cowBlack,[-.34,.9,-.3],[.33,.39,.04]);part(body,mobMats.cowBlack,[.26,.67,.33],[.4,.27,.04]);const head=new THREE.Group();head.position.set(0,1.05,-.72);g.add(head);rig.head=head;part(head,mobMats.cowBlack,[0,0,0],[.58,.55,.5]);part(head,mobMats.cream,[0,-.16,-.43],[.4,.23,.16]);for(const sx of [-1,1]){brightEye(head,sx*.2,.08,-.28,.052,mobMats.eyeBrown);beam(head,mobMats.antler,[sx*.2,.27,-.02],[sx*.42,.44,.02],.045);part(head,mobMats.cowBlack,[sx*.33,.22,-.02],[.18,.14,.1],[0,0,sx*.25]);for(const zOff of [-.33,.34])jointLeg(g,rig,sx*.38,zOff,.6,.65,.18,mobMats.white,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI)}part(g,mobMats.pinkDark,[0,.39,.1],[.3,.17,.25]);for(const sx of [-1,1])part(g,mobMats.pinkDark,[sx*.1,.25,.08],[.035,.18,.035]);const tail=new THREE.Group();tail.position.set(0,1.0,.55);g.add(tail);beam(tail,mobMats.cowBlack,[0,0,0],[0,-.55,.08],.035);part(tail,mobMats.cowBlack,[0,-.62,.09],[.12,.17,.1]);rig.tails.push(tail)
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
    name="Cervo da Taiga";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.brown,[0,.75,.02],[.82,.54,.39]);part(body,mobMats.furLight,[0,.66,-.19],[.52,.22,.035]);part(g,mobMats.brown,[0,.96,-.37],[.36,.56,.32],[.38,0,0]);const head=new THREE.Group();head.position.set(0,1.22,-.55);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.4,.4,.38]);part(head,mobMats.furLight,[0,-.12,-.34],[.3,.2,.27]);part(head,mobMats.dark,[0,-.13,-.5],[.15,.11,.08]);for(const sx of [-1,1]){brightEye(head,sx*.14,.08,-.205,.047,mobMats.eyeBrown);part(head,mobMats.brown,[sx*.28,.22,-.08],[.18,.12,.1],[0,0,sx*.35]);jointLeg(g,rig,sx*.3,-.25,.53,.57,.15,mobMats.brown,mobMats.dark,sx>0?0:Math.PI);jointLeg(g,rig,sx*.3,.3,.53,.57,.15,mobMats.brown,mobMats.dark,sx>0?Math.PI:0);beam(head,mobMats.antler,[sx*.13,.18,0],[sx*.18,.63,.03],.035);beam(head,mobMats.antler,[sx*.18,.45,.02],[sx*.37,.58,.02],.03);beam(head,mobMats.antler,[sx*.18,.58,.02],[sx*.3,.75,.04],.03)}const tail=new THREE.Group();tail.position.set(0,.82,.22);tail.rotation.x=-.35;g.add(tail);part(tail,mobMats.white,[0,.13,.08],[.18,.32,.14]);rig.tails.push(tail)
  }else if(type==="owl"){
    name="Coruja Boreal";flying=true;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.65,0],[.52,.62,.4]);for(let q=0;q<4;q++)part(body,q%2?mobMats.cream:mobMats.white,[0,.46+q*.13,-.215],[.36-q*.035,.08,.035]);const head=new THREE.Group();head.position.set(0,1.06,-.04);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.5,.42,.4]);for(const sx of [-1,1]){part(head,mobMats.cream,[sx*.16,.03,-.215],[.19,.2,.035]);brightEye(head,sx*.16,.05,-.232,.075,mobMats.eyeAmber);beam(head,mobMats.brown,[sx*.22,.25,0],[sx*.34,.45,.02],.05);const wing=new THREE.Group();wing.position.set(sx*.38,.72,.08);wing.userData.side=sx;g.add(wing);part(wing,mobMats.furDark,[-sx*.08,0,0],[.2,.18,.3]);for(let q=0;q<4;q++)part(wing,q%2?mobMats.furDark:mobMats.brown,[sx*(.12+q*.09),-.06-q*.06,.03],[.26,.11,.34-q*.04],[0,0,sx*(.22+q*.08)]);rig.wings.push(wing)}part(head,goldMat,[0,-.05,-.26],[.1,.09,.09]);for(const sx of [-1,1]){beam(g,mobMats.antler,[sx*.12,.38,-.04],[sx*.16,.17,-.11],.025);part(g,mobMats.dark,[sx*.17,.12,-.15],[.1,.045,.16])}for(let q=-1;q<=1;q++)part(g,mobMats.furDark,[q*.12,.3,.28],[.11,.36,.15],[.35,0,-q*.08])
  }else{
    type="capivara";name="Capivara";const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.brown,[0,.57,.08],[.88,.58,.52]);part(body,mobMats.furLight,[0,.42,-.195],[.55,.2,.035]);part(g,mobMats.brown,[0,.68,-.3],[.46,.42,.42],[.15,0,0]);const head=new THREE.Group();head.position.set(0,.78,-.58);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.58,.5,.45]);part(head,mobMats.furLight,[0,-.08,-.34],[.38,.24,.24]);part(head,mobMats.dark,[0,-.08,-.47],[.2,.14,.08]);for(const sx of [-1,1]){part(head,mobMats.furDark,[sx*.23,.27,-.08],[.13,.14,.1]);brightEye(head,sx*.2,.11,-.238,.045,mobMats.eyeBrown);part(head,mobMats.cream,[sx*.09,-.2,-.462],[.07,.1,.04]);for(const zOff of [-.25,.28])jointLeg(g,rig,sx*.32,zOff,.45,.48,.17,mobMats.brown,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI);for(const yy of [-.06,.02])beam(head,mobMats.cream,[sx*.08,yy,-.44],[sx*.46,yy-.04,-.54],.012)}part(head,mobMats.cream,[0,-.23,-.46],[.13,.08,.035])
  }
  wildlife.refine(type,g,rig);
  if(variant){faunaDetails(species,variant,g,rig);type=species;name=variant.name}
  g.traverse(node=>{
    if(node.userData.entityEye)rig.eyes.push(node);
    if(node.isMesh){node.castShadow=settings.shadows>0&&!node.material.transparent;node.receiveShadow=settings.shadows>0&&!node.material.transparent}
  });
  const angle=hash(x,z,311)*TAU,phase=hash(x,z,313)*TAU,profile=QuimiCraftAI.getProfile(type,role);
  const y=h+(flying?1.15:0);
  const e={type,name,group:g,x,y,z,angle,walkPhase:phase,persistent,phase,profile,hp:profile.hp,maxHp:profile.hp,
    hostile:profile.temperament==="hostile",flying,vx:0,vy:0,vz:0,
    onGround:!flying,jumpCooldown:hash(x,z,921)*.7,rig,role,dead:false,resident};
  e.ai=QuimiCraftAI.brain(e,phase);
  g.rotation.y=angle+Math.PI;
  g.position.y=y;
  entities.push(e);
  entityRoot.add(g);
  if(persistent)npcs.push(e);
  return e;
}
function removeEntity(e){entityRoot.remove(e.group);let i=entities.indexOf(e);if(i>=0)entities.splice(i,1);i=npcs.indexOf(e);if(i>=0)npcs.splice(i,1);if(state.combatTarget===e){state.combatTarget=null;state.combatTargetTime=0}}
function mobPool(b,night=false,habitat=null){const pools={
  "bosque lilás":["lilac_songbird","lilac_songbird","rabbit","forest_deer"],
  "delta salobro":["salt_marsh_rabbit","mangrove_capivara","chicken","slime"],
  "termas minerais":["pyrite_crawler","cristalume","deer","owl"],
  "floresta de sequoias":["forest_deer","forest_deer","owl","rabbit"],
  manguezal:["mangrove_capivara","mangrove_capivara","chicken","slime"],
  "chapadas ocres":["scorpion","cobrete","chicken","forest_deer"],
  "fiordes glaciais":["frost_owl","frost_owl","sheep","golem"],
  "campina de aurora":["frost_owl","cristalume","forest_deer","sheep"],
  "caldeira vítrea":["glass_scorpion","glass_scorpion","magma","cristalume"],
  deserto:["scorpion","cobrete","chicken"],salinas:["salt_marsh_rabbit","scorpion","cobrete","wisp"],"cânion calcário":["golem","cobrete","scorpion","sheep"],badlands:["scorpion","cobrete","golem"],vulcânico:["magma","golem","wisp"],"bosque de cristais":["cristalume","wisp","cobrete"],taiga:["deer","owl","rabbit","sheep"],tundra:["deer","owl","golem","sheep"],"prado alpino":["deer","owl","rabbit","sheep"],"bosque de cerejeiras":["deer","owl","pig","rabbit"],"selva tropical":["capivara","slime","pig","chicken"],pântano:["slime","capivara","pig","wisp"],floresta:["deer","owl","pig","rabbit"],montanha:["golem","cobrete","owl","sheep"],"planície florida":["cow","pig","rabbit","chicken","sheep","deer"],planície:["cow","pig","rabbit","chicken","sheep","capivara"],savana:["cow","chicken","capivara","scorpion","deer"]};const p=[...(pools[b]||pools.planície)];const resident=QuimiCraftRegions.localFauna(b);
  if(resident)p.push(resident,resident);
  if(night)p.push("slime","wisp","golem");
  const specialties=habitats.fauna(habitat,night);
  if(specialties.length)p.push(...specialties,...specialties);
  return p
}
function validMobPlacement(type,x,z,h){
  const rr=FAUNA_VARIANTS[type]?.radius??(type==="golem"||type==="cow"?.65:type==="deer"||type==="capivara"?.55:.43);
  if(!Number.isFinite(h)||h<2||h>=MAX_Y-3||h<=WATER_LEVEL&&getBlock(Math.floor(x),Math.floor(h),Math.floor(z))===BLOCK.WATER)return false;
  for(const [ox,oz] of [[0,0],[rr,rr],[rr,-rr],[-rr,rr],[-rr,-rr]]){
    const sx=x+ox,sz=z+oz,gy=Math.floor(h-.08),g=getBlock(sx,gy,sz);
    if(!BDEF[g]?.solid||g===BLOCK.LEAVES||g===BLOCK.PINE_LEAVES||g===BLOCK.CHERRY_LEAVES||g===BLOCK.LAVA)return false;
    for(const py of [h+.06,h+.9,h+1.72]){
      const b=getBlock(sx,py,sz);if(BDEF[b]?.solid||b===BLOCK.LAVA||b===BLOCK.WATER)return false;
    }
  }
  return !aabbHitsLabDecor(x-rr,x+rr,h,h+1.9,z-rr,z+rr)
}
function spawnMob(type){
  const night=state.day>.53&&state.day<.93;
  for(let tries=0;tries<24;tries++){
    const a=Math.random()*TAU,r=10+Math.random()*22,x=Math.floor(player.pos.x+Math.cos(a)*r)+.5,z=Math.floor(player.pos.z+Math.sin(a)*r)+.5;
    if(labBoundsContains(x,z,2)||villageBoundsContains(x,z,1)||alchemyColumnAt(Math.floor(x),Math.floor(z)))continue;
    const h=findStandingY(x,z,terrainHeight(x,z)+2);
    if(h<=WATER_LEVEL||getBlock(Math.floor(x),h-1,Math.floor(z))===BLOCK.LAVA)continue;
    if(hasRoofAbove(x,z,h,6))continue;
    const biome=biomeAt(x,z),habitat=habitats.at(x,z,biome),pool=mobPool(biome,night,habitat);
    const mobType=type||pool[Math.floor(Math.random()*pool.length)];
    if(h<=WATER_LEVEL+1&&mobType!=="amber_ibis"&&mobType!=="peat_slime")continue;
    if(!validMobPlacement(mobType,x,z,h))continue;
    const e=createEntity(mobType,x,z);
    if(habitats.fauna(habitat,false).includes(mobType)||habitats.fauna(habitat,true).includes(mobType))e.habitat=habitat;
    e.y=h+(e.flying?1.15:0);e.group.position.y=e.y;e.ai.home.y=e.y;return e
  }
  return null
}
function ensureProfessorCarbono(){
  const professorAnchor=LAB_ANCHORS["professor-position"];let professor=npcs.find(npc=>npc.role==="carbon");if(professor)return professor;professor=createEntity("npc_carbon",professorAnchor.x,professorAnchor.z,true);professor.x=professorAnchor.x;professor.z=professorAnchor.z;professor.y=findStandingY(professor.x,professor.z,LAB_LAYOUT.y);professor.group.position.set(professor.x,professor.y,professor.z);professor.ai.home.y=professor.y;return professor
}
const visitingResidents=new Map(),villageSigns=new Map();
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
function spawnVillageResident(resident){
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
  const shopTypes=["npc_food","npc_armor","npc_solid","npc_liquid","npc_trinket"];shopTypes.forEach((type,i)=>{const role=NPC_PROFILES[type].role;if(!npcs.some(n=>n.role===role))createEntity(type,VILLAGE.x+(i-2)*VILLAGE.spacing+.5,VILLAGE.z-4.5,true)});
  const residentTypes=["npc_farmer","npc_miner","npc_botanist","npc_glazier","npc_ceramist","npc_teacher","npc_mayor","npc_baker","npc_fisher","npc_geologist"],homes=LEGACY_VILLAGE_BUILDINGS.filter(b=>b.kind==="house");residentTypes.forEach((type,i)=>{const role=NPC_PROFILES[type].role,b=homes[(i*3)%homes.length];if(!npcs.some(n=>n.role===role))createEntity(type,b.x+.5,b.z-4.35,true)});
  }
  const desiredMobCount=[0,5,10,16][settings.mobs],currentMobCount=entities.filter(entity=>!entity.persistent).length;for(let i=currentMobCount;i<desiredMobCount;i++)spawnMob()
}
function turnToward(a,b,t){const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));return a+d*clamp(t,0,1)}
function animateEntityRig(e,dt,now,pace){
  const r=e.rig,a=e.ai;
  const flight=e.flying;
  const airborne=!flight&&!e.onGround;
  const stride=clamp(pace/e.profile.run,0,1);
  const load=a.swing ? 1-a.swing.remaining/e.profile.strike.windup : 0;
  const release=a.aim>0 ? a.aim/.27 : 0;
  const bracing=a.mode==="windup"||a.mode==="strike";
  const motion=document.documentElement.classList.contains("reduced-motion")?.45:1;
  e.walkPhase+=dt*(1.1+pace*5.25);
  const gait=e.walkPhase,reach=(.19+stride*.61)*motion;
  if(r.cape){
    r.cape.rotation.x=.08+stride*.18+Math.sin(gait)*motion*(.018+stride*.035);
    r.cape.rotation.z=Math.sin(now*.002+e.phase)*motion*.04;
  }
  r.legs.forEach((leg,index)=>{
    const wave=Math.sin(gait+(leg.userData.phase??(index%2?Math.PI:0)));
    if((FAUNA_VARIANTS[e.type]?.model??e.type)==="scorpion"){
      leg.rotation.z=leg.userData.side*(.08+wave*stride*.24*motion);
      leg.rotation.y=wave*stride*.23;
    }else{
      leg.rotation.x=airborne?(index%2?-.36:.26):pace>.04?wave*reach:.015*wave;
      if(leg.userData.lower)leg.userData.lower.rotation.x=airborne?.53:Math.max(0,-wave)*stride*.7;
    }
  });
  r.arms.forEach((arm,index)=>{
    const side=arm.userData.side||((index%2)*2-1);
    const wave=Math.sin(gait+(index%2?0:Math.PI));
    if((FAUNA_VARIANTS[e.type]?.model??e.type)==="scorpion"){
      arm.rotation.y=side*(.08+load*.62-release*.18);
      arm.rotation.x=-load*.48+release*.15;
    }else{
      arm.rotation.x=wave*(pace>.04?reach*.71:.02)-load*(e.type==="golem"?1.55:1)-release*.52;
      arm.rotation.z=side*((e.type==="golem"?-.08:0)+load*.22);
      if(arm.userData.lower)arm.userData.lower.rotation.x=bracing?-.44-load*.58:Math.max(0,wave)*stride*.36;
    }
  });
  for(const wing of r.wings){
    const flap=Math.sin(now*(e.type==="chicken"?.006:.009+stride*.013)+e.phase);
    wing.rotation.z=(wing.userData.side||1)*(.15+flap*(e.type==="chicken"?.15:.62+stride*.19)*motion);
    wing.rotation.x=flap*.08;
  }
  r.tails.forEach((tail,index)=>{
    tail.rotation.y=Math.sin(now*.0028+e.phase+index*.55)*(.1+stride*.15);
    tail.rotation.z=Math.sin(now*.0031+e.phase+index)*(.035+index*.008);
    tail.rotation.x=tail.userData.restX??=tail.rotation.x;
    if((FAUNA_VARIANTS[e.type]?.model??e.type)==="scorpion")tail.rotation.x-=load*.24-release*.1;
  });
  r.rotors.forEach((rotor,index)=>{rotor.rotation.z+=dt*(1.7+index*.55+stride);rotor.rotation.x+=dt*(index%2?.35:-.28)});
  const blinkPhase=(now*.001+e.phase*.71)%4.8,blink=blinkPhase>4.58?Math.max(.08,Math.abs(blinkPhase-4.69)*9):1;
  for(const eye of r.eyes)eye.scale.y=lerp(eye.scale.y,blink,.44);
  if(r.head){
    r.head.rotation.y=Math.sin(now*.0014+e.phase)*.06*motion;
    r.head.rotation.x=bracing?-.11*load:Math.sin(now*.0018+e.phase)*.028;
  }
  if(e.type==="slime"&&r.body){
    const squash=1+Math.sin(now*.007+e.phase)*(.07+stride*.12)*motion-load*.19+release*.15;
    r.body.scale.set(1+(1-squash)*.37,squash,1+(1-squash)*.37);
    r.body.position.y=(1-squash)*.19;
  }else if((e.type==="wisp"||e.type==="cristalume")&&r.body){
    r.body.rotation.y+=dt*(1.1+load*3);
    r.body.rotation.x=Math.sin(now*.0025+e.phase)*.18;
  }
}
function entityRadius(e){if(FAUNA_VARIANTS[e.type])return FAUNA_VARIANTS[e.type].radius;return e.type==="golem"?.62:e.type==="cow"?.62:e.type==="capivara"?.56:e.type==="deer"?.5:(e.type==="pig"||e.type==="sheep")?.48:e.type==="rabbit"?.28:e.type==="chicken"?.3:e.type==="owl"?.34:e.flying?.4:e.persistent?.42:.4}
const ENTITY_HEIGHT={rabbit:.72,chicken:1.08,pig:.87,sheep:1.27,capivara:1.02,cow:1.6,owl:1.35,deer:1.72,
  slime:1.08,scorpion:.77,golem:2.28,wisp:1.23,cristalume:1.38};
const ENTITY_FOOTPRINT=[[0,0],[-.24,-.24],[.24,.24],[-.24,.24],[.24,-.24]];
function entityHeight(e){return (FAUNA_VARIANTS[e.type]?.height||ENTITY_HEIGHT[e.type]||1.85)*(e.resident?.scale||1)}
const playerActor={
  get x(){return player.pos.x},get y(){return player.pos.y},get z(){return player.pos.z},
  get dead(){return player.health<=0}
};
function entityAimPoint(target){
  if(target.aquatic)return target.group.position.clone();
  const y=target===playerActor?(player.crouch?.78:1.12):entityHeight(target)*.59+(target.flying?.55:0);
  return new THREE.Vector3(target.x,target.y+y,target.z);
}
function entityProjectileRadius(actor){
  if(actor.aquatic)return Math.max(.29,actor.profile.extent*.73);
  return actor===playerActor?.59:Math.max(.39,entityRadius(actor)+.13);
}
function findEntityGroundY(x,z,currentY,maxRise=.12){
  const top=Math.min(MAX_Y-3,Math.floor(currentY+maxRise)-1);
  const bottom=Math.max(1,Math.floor(currentY)-6);
  for(let floor=top;floor>=bottom;floor--){
    if(ENTITY_FOOTPRINT.every(([dx,dz])=>solidAt(x+dx,floor,z+dz)&&!solidAt(x+dx,floor+1,z+dz)))return floor+1;
  }
  return -Infinity;
}
function entityCollidesWorld(e,x,z,baseY=e.y){
  const r=entityRadius(e),low=baseY+.025,top=low+entityHeight(e);
  for(let xx=Math.floor(x-r);xx<=Math.floor(x+r);xx++){
    for(let yy=Math.floor(low);yy<=Math.floor(top);yy++){
      for(let zz=Math.floor(z-r);zz<=Math.floor(z+r);zz++)if(solidAt(xx,yy,zz))return true;
    }
  }
  return aabbHitsLabDecor(x-r,x+r,low,top,z-r,z+r)||labDoor.hits(x-r,x+r,low,top,z-r,z+r);
}
function safeEntityFloor(e,x,z,y){
  const floor=findEntityGroundY(x,z,y,1.22);
  if(!Number.isFinite(floor)||floor-y>1.24||y-floor>2.15)return null;
  const material=getBlock(x,floor+.08,z);
  if(material===BLOCK.WATER||material===BLOCK.LAVA||material===BLOCK.FIRE)return null;
  if(!e.persistent&&labBoundsContains(x,z,.75)&&floor<LAB_LAYOUT.y+4.2)return null;
  return floor;
}
function moveEntityWithCollision(e,dx,dz){
  for(const [ax,az] of [[dx,dz],[dx,0],[0,dz]]){
    if(Math.abs(ax)+Math.abs(az)<.00005)continue;
    const x=e.x+ax,z=e.z+az;
    if(e.flying){
      const block=getBlock(x,e.y+.08,z);
      if((!e.persistent&&labBoundsContains(x,z,1)&&e.y<=LAB_LAYOUT.y+4)||block===BLOCK.WATER||
          block===BLOCK.LAVA||entityCollidesWorld(e,x,z))continue;
      e.x=x;e.z=z;return true;
    }
    const floor=safeEntityFloor(e,x,z,e.y);
    if(floor===null)continue;
    if(entityCollidesWorld(e,x,z)){
      if(floor>e.y+.18)requestEntityJump(e,true);
      continue;
    }
    e.x=x;e.z=z;return true;
  }
  return false;
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
  const ground=findEntityGroundY(e.x,e.z,e.y);
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
const FAUNA_CAP=6;
function inspectedAquaticModel(id){
  if(QuimiCraftDepths.fauna[id])return wildlife.creature(id).group;
  return wildlife.fish(id,fishColors[id]||fishColors.raw_fish,QuimiCraftWorkshops.fishSpecies[id.slice(4)]?.[3]).group;
}
function buildFish(x,y,z,water,species=null){
  const biome=biomeAt(x,z),waterKind=regionalWater(x,z).id;
  const base=species??QuimiCraftWorkshops.fishingYield({biome,kind:waterKind,depth:water.depth},"fishing_rod",null,()=>clamp(Math.random(),.14,.89))[0][0];
  const id=typeof base==="string"&&base.startsWith("raw_")&&base!=="raw_piranha"?base:species||"raw_fish";
  const profile=QuimiCraftDepths.fauna[id]||null;
  const model=profile?wildlife.creature(id):wildlife.fish(id,fishColors[id]||fishColors.raw_fish,QuimiCraftWorkshops.fishSpecies[id.slice(4)]?.[3]);
  const {group}=model;
  if(!profile)group.scale.setScalar((id==="raw_shrimp"?.63:1)*(.75+Math.random()*.49));
  group.position.set(x,y,z);
  fishRoot.add(group);
  const record={...model,id,profile,angle:Math.random()*TAU,speed:profile?.speed??(.57+Math.random()*.47),timer:Math.random()*2,
    phase:Math.random()*TAU,baseY:y,flap:Math.random()*TAU,cooldown:0,water};
  if(profile?.hp){
    Object.assign(record,{aquatic:true,name:profile.name,hp:profile.hp,maxHp:profile.hp,dead:false,ai:{mode:"idle"}});
    Object.defineProperties(record,{
      x:{get:()=>group.position.x},y:{get:()=>group.position.y},z:{get:()=>group.position.z}
    });
  }
  fishSchool.push(record);
  return record;
}
function findFishWater(x,z){
  x=Math.floor(x);z=Math.floor(z);
  const terrain=terrainHeight(x,z);
  for(let y=Math.min(MAX_Y-3,Math.max(WATER_LEVEL,terrain+3));y>=Math.max(2,terrain+1);y--){
    if(getBlock(x,y,z)!==BLOCK.WATER)continue;
    let bottom=y;
    while(bottom>terrain+1&&getBlock(x,bottom-1,z)===BLOCK.WATER)bottom--;
    return {y:y+.37,top:y+.82,bottom,depth:y-bottom+1};
  }
  return null;
}
function aquaticWater(x,y,z,extent,angle){
  if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK))||getBlock(x,y,z)!==BLOCK.WATER)return false;
  if(extent<.37)return true;
  const stepX=Math.sin(angle)*extent,stepZ=Math.cos(angle)*extent;
  return getBlock(x+stepX,y,z+stepZ)===BLOCK.WATER&&getBlock(x-stepX*.66,y,z-stepZ*.66)===BLOCK.WATER
    &&getBlock(x+stepZ*.33,y,z-stepX*.33)===BLOCK.WATER&&getBlock(x-stepZ*.33,y,z+stepX*.33)===BLOCK.WATER;
}
function disposeAquatic(f){
  fishRoot.remove(f.group);
  f.group.traverse(n=>{if(n.geometry&&!sharedFishGeometry.has(n.geometry))n.geometry.dispose()});
}
function attackableActors(){
  return [...entities.filter(e=>!e.persistent),...fishSchool.filter(f=>f.aquatic)];
}
function hitAquatic(f,damage){
  f.hp=Math.max(0,f.hp-damage);
  state.combatTarget=f;state.combatTargetTime=2.8;
  combatParticles(f.group.position,0xd3f3ff,7);
  sound("hit",.42);
  if(f.hp>0){f.timer=0;f.cooldown=Math.max(f.cooldown,.65);return}
  f.dead=true;
  spawnDrop(f.profile.drop,1,f.group.position.clone());
  disposeAquatic(f);
  fishSchool.splice(fishSchool.indexOf(f),1);
}
function spawnAquatic(largeCount){
  for(let tries=0;tries<26;tries++){
    const angle=Math.random()*TAU,dist=tries<16?7+Math.random()*29:Math.random()*8;
    const x=Math.floor(player.pos.x+Math.cos(angle)*dist)+.5,z=Math.floor(player.pos.z+Math.sin(angle)*dist)+.5;
    if(!hasChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))continue;
    const water=findFishWater(x,z);
    if(!water||water.depth<2)continue;
    const biome=biomeAt(x,z),lake=depths.lakeAt(x,z),liquid=regionalWater(x,z),pool=depths.eligible(biome,lake,liquid.id,water.depth);
    const species=largeCount<FAUNA_CAP&&pool.length&&(Math.random()<.55||largeCount===0)?pool[Math.floor(Math.random()*pool.length)]:null;
    const profile=QuimiCraftDepths.fauna[species];
    if(species&&fishSchool.filter(f=>f.id===species).length>=(species==="piranha"?3:2))continue;
    const y=clamp(water.top-water.depth*(profile?.swim??(.23+Math.random()*.53)),water.bottom+.42,water.top-.23);
    if(!aquaticWater(x,y,z,profile?.extent??.18,angle))continue;
    const creature=buildFish(x,y,z,water,species);
    creature.angle=angle;
    if(profile)creature.group.name=profile.name;
    return;
  }
}
function updateFish(dt,now){
  fishSpawnClock+=dt;
  if(fishSpawnClock>2.1&&fishSchool.length<22){
    fishSpawnClock=0;
    spawnAquatic(fishSchool.filter(f=>f.profile).length);
  }
  for(let i=fishSchool.length-1;i>=0;i--){
    const f=fishSchool[i],g=f.group,p=f.profile,extent=p?.extent??.17;
    const dx=player.pos.x-g.position.x,dz=player.pos.z-g.position.z,distance=Math.hypot(dx,dz);
    if(distance>76||!hasChunk(Math.floor(g.position.x/CHUNK),Math.floor(g.position.z/CHUNK))){
      f.dead=true;disposeAquatic(f);fishSchool.splice(i,1);continue;
    }
    f.cooldown=Math.max(0,f.cooldown-dt);
    const spy=player.pos.y+.58,inside=player.inWater&&Math.abs(spy-g.position.y)<2.55;
    const desired=Math.atan2(dx,dz);
    f.timer-=dt;
    if(f.timer<0){
      f.timer=1.15+Math.random()*3;
      f.angle+=(Math.random()-.5)*(p?.mode==="pod"?.72:1.5);
      const bath=findFishWater(g.position.x,g.position.z);
      if(bath&&p){
        f.water=bath;
        f.baseY=clamp(bath.top-bath.depth*p.swim,bath.bottom+.47,bath.top-.21);
      }
    }
    const hunting=inside&&distance<7&&p?.damage&&!labSafe();
    if(f.aquatic)f.ai.mode=hunting?"chase":"idle";
    if(hunting)f.angle=turnToward(f.angle,desired,dt*1.75);
    else if(inside&&distance>3&&distance<9&&p?.mode==="curious")f.angle=turnToward(f.angle,desired,dt*.4);
    else if(inside&&distance<2.4&&!p)f.angle=turnToward(f.angle,desired+Math.PI,dt*4);
    const pace=f.speed*(p?.damage&&inside&&distance<5?1.35:1);
    const nx=g.position.x+Math.sin(f.angle)*pace*dt,nz=g.position.z+Math.cos(f.angle)*pace*dt;
    const targetY=p?.damage&&inside&&distance<6?clamp(spy,f.water.bottom+.38,f.water.top-.21):f.baseY+Math.sin(now*.0019+f.phase)*(p?.mode==="curious"?.68:.22);
    const ny=lerp(g.position.y,targetY,Math.min(1,dt*2));
    if(aquaticWater(nx,ny,nz,extent,f.angle)){
      g.position.set(nx,ny,nz);
    }else{
      f.angle+=Math.PI*.61;
      f.timer=.45;
    }
    g.rotation.y=turnToward(g.rotation.y,f.angle+Math.PI,dt*3);
    const beat=Math.sin(now*(p?.mode==="drift"?.004:.0095)*f.speed+f.flap);
    if(f.verticalTail)f.tail.rotation.x=beat*.36;
    else f.tail.rotation.y=beat*.47;
    for(const [index,wing] of f.wings.entries())wing.rotation.z=beat*.19*(index%2===0?-1:1);
    if(hunting&&distance<extent+.59&&f.cooldown<=0&&combatSegmentClear(g.position,new THREE.Vector3(player.pos.x,spy,player.pos.z))){
      f.cooldown=p.mode==="school"?2.1:3.0;
      damagePlayer(p.damage,p.name);
    }
  }
}
function visibleActor(a,b){
  return Math.abs(a.y-b.y)<5.2&&combatSegmentClear(entityAimPoint(a),entityAimPoint(b));
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
function senseEntity(e){
  const p=e.profile,a=e.ai;
  const liveThreat=target=>target!==e&&!target.dead&&target.hostile;
  if(e.persistent){
    const greet=QuimiCraftAI.range(e,playerActor)<2.75&&visibleActor(e,playerActor)?playerActor:null;
    if(p.temperament==="guard"){
      return {enemy:nearbyActor(e,entities,p.sense,liveThreat),greet};
    }
    const threat=nearbyActor(e,entities,p.sense,liveThreat);
    return {threat:threat?{...threat,alarming:true}:null,greet};
  }
  if(p.temperament==="hostile"||a.retaliate>0){
    const seen=nearbyActor(e,[playerActor],p.sense,target=>!target.dead&&!labSafe()&&alchemyPlay.distantSight(e,target));
    if(p.temperament==="neutral")return {enemy:seen};
    const resident=nearbyActor(e,npcs,p.sense*.72,target=>!target.dead&&!target.ai.recovering&&target.role!=="carbon"&&alchemyPlay.distantSight(e,target));
    return {enemy:resident&&(!seen||resident.dist+1.3<seen.dist)?resident:seen};
  }
  if(p.temperament==="skittish"||p.temperament==="calm"){
    const close=p.temperament==="calm"?Math.min(p.sense,player.sprint?3:1.3):p.sense*(player.crouch?.33:1);
    const nearbyPlayer=nearbyActor(e,[playerActor],close,target=>!target.dead);
    const predator=nearbyActor(e,entities,p.sense*.75,liveThreat);
    const threat=predator&&(!nearbyPlayer||predator.dist<nearbyPlayer.dist)?predator:nearbyPlayer;
    return {threat:threat?{...threat,alarming:threat.actor!==playerActor||player.sprint}:null};
  }
  return {};
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
  if(!npc.persistent||npc.ai.recovering>0)return;
  source.lastVictim=npc;
  source.lastInjury=performance.now();
  npc.hp=Math.max(0,npc.hp-damage);
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
  const strike=e.profile.strike;
  if(!strike||target.dead||target.ai?.recovering>0||(target===playerActor&&labSafe()))return;
  const start=entityAimPoint(e),finish=entityAimPoint(target);
  const planar=QuimiCraftAI.range(e,target);
  if(!visibleActor(e,target)||planar>strike.range*(strike.kind==="shot"?1.06:1.015))return;
  if(strike.kind==="shot"){
    const direction=finish.sub(start);
    if(e.persistent)direction.y+=planar*.065;
    direction.normalize();
    launchProjectile(e.persistent?"guard":"enemy",start.addScaledVector(direction,.34),direction,strike,e);
    sound(e.persistent?"bow":"magic",.54);
    return;
  }
  if(Math.abs(start.y-finish.y)>1.38)return;
  if(strike.kind==="lunge")requestEntityJump(e,true);
  const direction=finish.clone().sub(start).setY(0).normalize();
  if(strike.kind==="lunge"){e.vx+=direction.x*2.75;e.vz+=direction.z*2.75}
  if(strike.kind==="slam")combatParticles(new THREE.Vector3(e.x,e.y+.08,e.z),0xf5ab75,13);
  if(target===playerActor){
    damagePlayer(strike.damage,e.name,strike.effect);
    player.vel.addScaledVector(direction,strike.kind==="slam"?4.6:2.25);
  }else hitNPC(target,strike.damage,e);
  sound("land",strike.kind==="slam"?.61:.31);
}
function steerEntity(e,behavior,dt){
  const a=e.ai;
  const previousMode=a.mode;
  a.mode=behavior.mode;
  const ease=1-Math.exp(-dt*(behavior.mode==="flee"?11:6.5));
  a.pace=lerp(a.pace,behavior.speed,ease);
  const goal=behavior.goal;
  if(!goal||previousMode!==a.mode){a.route=[];a.stalled=0}
  while(a.route.length&&QuimiCraftAI.range(e,a.route[0])<.26)a.route.shift();
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
  let moved=moveEntityWithCollision(e,dx,dz);
  if(!moved&&goal&&a.pace>.1){
    a.stalled+=dt;
    if(a.routeDelay<=0&&entityPathBudget>0&&!e.flying){
      entityPathBudget--;
      a.routeDelay=.44+Math.random()*.37;
      a.route=QuimiCraftAI.findPath(e,goal,(px,pz,h)=>{
        const floor=safeEntityFloor(e,px,pz,h);
        return floor!==null&&!entityCollidesWorld(e,px,pz,floor+.03)?floor:null;
      });
    }
    if(!a.route.length){
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
    const floor=findEntityGroundY(e.x,e.z,e.y,1.65);
    if(Number.isFinite(floor)){
      const next=lerp(e.y,floor+1.15,1-Math.exp(-dt*3.8));
      if(!entityCollidesWorld(e,e.x,e.z,next))e.y=next;
    }
  }else{
    if(a.mode==="flee"&&e.type==="rabbit"&&e.onGround&&Math.random()<dt*.75)requestEntityJump(e);
    updateEntityVerticalMotion(e,dt);
  }
  const movedX=e.x-x,movedZ=e.z-z;
  const movedDistance=Math.hypot(movedX,movedZ);
  if(behavior.aim)e.angle=QuimiCraftAI.heading(e,behavior.aim);
  else if(movedDistance>.0005)e.angle=Math.atan2(movedX,movedZ);
  return movedDistance/dt;
}
function updateEntities(dt,now){
  updateVillageResidents(dt);
  alchemyPlay.updateLife(dt);
  mobClock+=dt;
  entityPathBudget=2;
  const cap=[0,7,13,20][settings.mobs];
  if(mobClock>2.2){
    mobClock=0;
    if(entities.filter(e=>!e.persistent).length<cap)spawnMob();
  }
  for(const e of [...entities]){
    if(e.dead)continue;
    const dist=QuimiCraftAI.range(e,playerActor);
    if(!e.persistent&&(dist>settings.render*CHUNK*1.5||e.y<1||labBoundsContains(e.x,e.z,1)&&e.y<=LAB_LAYOUT.y+4)){
      removeEntity(e);continue;
    }
    const a=e.ai;
    if(a.recovering>0){
      a.recovering=Math.max(0,a.recovering-dt);
      e.group.rotation.z=lerp(e.group.rotation.z,1.21,Math.min(1,7*dt));
      if(!a.recovering){
        Object.assign(e,a.home,{hp:e.maxHp,onGround:true,vy:0,vx:0,vz:0});
        e.ai=QuimiCraftAI.brain(e,e.phase);
        e.group.position.set(e.x,e.y,e.z);
      }
      continue;
    }
    if(e.persistent&&dist>Math.min(settings.render*CHUNK+12,72))continue;
    e.group.rotation.z=lerp(e.group.rotation.z,0,Math.min(1,8*dt));
    e.jumpCooldown=Math.max(0,e.jumpCooldown-dt);
    e.stuckCheck=(e.stuckCheck||0)-dt;
    if(e.stuckCheck<=0&&!e.flying){
      e.stuckCheck=1.6+Math.random()*.4;
      if(e.y<1||entityCollidesWorld(e,e.x,e.z)){
        const h=e.alchemy?e.ai.home.y:findStandingY(e.x,e.z,Math.max(2,e.y+1));
        if(validMobPlacement(e.type,e.x,e.z,h)&&!entityCollidesWorld(e,e.x,e.z,h)){
          e.y=h;e.vy=0;e.onGround=true;
        }else if(e.persistent)Object.assign(e,a.home,{vy:0,vx:0,vz:0,onGround:true});
        else{removeEntity(e);continue}
      }
    }
    let behavior=alchemyPlay.npcBehavior(e,QuimiCraftAI.tick(e,dt,()=>senseEntity(e)),dt);
    if(e.resident?.civic&&state.day>.6&&state.day<.90&&["wander","patrol","idle"].includes(behavior.mode)){
      const home=e.ai.home;
      behavior=QuimiCraftAI.range(e,home)>.58?{mode:"return",goal:home,speed:e.profile.walk}:{mode:"idle",speed:0};
    }
    const pace=steerEntity(e,behavior,dt);
    if(behavior.strike)finishEntityStrike(e,behavior.strike);
    if(e.dead)continue;
    if(e.persistent&&!a.fear&&a.mode!=="windup")e.hp=Math.min(e.maxHp,e.hp+dt*1.85);
    const flutter=e.type==="lumen_moth";
    const float=e.flying?.5+Math.sin(now*(flutter?.0085:.004)+e.phase)*(flutter?.23:.17):0;
    e.group.position.set(e.x,e.y+float,e.z);
    e.group.rotation.y=turnToward(e.group.rotation.y,e.angle+Math.PI,1-Math.exp(-dt*(pace>.07?10.5:6)));
    animateEntityRig(e,dt,now,pace);
    alchemyPlay.animateKeeper(e,now);
  }
}
function nearestNPC(){
  return nearbyActor(playerActor,npcs,4,n=>!n.dead&&n.ai.recovering<=0)?.actor||null;
}
function interactionAction(){
  const ride=vehicles.current();
  if(ride)return {kind:"vehicleExit",label:ride.flying||ride.airborne||ride.climb?"Aguarde o pouso":"Desmontar"};
  const nearbyVehicle=vehicleInteractable();
  if(nearbyVehicle)return {kind:"vehicleMount",value:nearbyVehicle,label:"Montar · "+QuimiCraftVehicles.types[nearbyVehicle.kind].name};
  const t=state.target;
  if(professionFishingActive&&QuimiCraftWorkshops.fishingRods.has(selectedItem())){
    const action=professions.action(null);
    return {kind:"profession",label:action.label,value:action};
  }
  const n=nearestNPC();
  const station=nearestLabStation();
  const caption=(kind,label,value)=>({kind,label,value});
  const occupation=professions.action(t);
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
  const prefix=touchInput?"Interagir":action?.kind.startsWith("vehicle")||QuimiCraftAlchemy.potions[selectedItem()]?"E":"E ou botão direito";
  el.textContent=action?prefix+" · "+action.label:"";
  el.classList.toggle("show",!!action);
}
function interact(action=interactionAction()){
  if(!action)return;
  switch(action.kind){
    case "vehicleMount":return boardVehicle(action.value);
    case "vehicleExit":return leaveVehicle();
    case "alchemy":return useAlchemyStation(action.value);
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
  if(n?.resident?.office)return alchemyUI.open(n.resident.office);
  if(n&&interactHabitatResident(n))return;
  if(n?.role==="carbon"){if(!localStorage.qc_carbon_intro_gift_v60){addItem("water",2);localStorage.qc_carbon_intro_gift_v60="1";chatMessage("PROF. CARBONO","Separei duas amostras de água destilada para suas primeiras pesquisas.",{category:"dialogue"})}discover("indicator","Indicadores naturais");discover("salt_solution","Soluções iônicas");discover("copper_oxide","Óxidos metálicos");scienceSystem?.registerDiscovery("missions","carbon_tutorial",{name:"Primeiros passos com Prof. Carbono",source:"Laboratório Carbono",researchProgress:100});return openProfessor()}if(n?.role==="ranger"){chatMessage("GUARDIÃ ÍRIS","Criaturas hostis aparecem à noite e em regiões vulcânicas. O cajado empurra inimigos; o arco mantém distância.",{category:"dialogue"});if(!localStorage.qc_rangerGift){addItem("arrow",20);addItem("wind_essence",1);localStorage.qc_rangerGift="1";chatMessage("GUARDIÃ ÍRIS","Leve estas flechas e uma essência do vento.",{category:"dialogue"})}return}if(n?.role?.startsWith("shop_")){const kind=n.role.slice(5),profile=Object.values(NPC_PROFILES).find(p=>p.role===n.role);chatMessage(n.name.toUpperCase(),profile?.talk||"Veja o que chegou hoje.",{category:"dialogue"});if(kind==="solid"){discover("calcination","Química dos carbonatos");discover("nitrate","Química dos nitratos")}if(kind==="liquid"){discover("ammonia_complex","Complexos de coordenação");discover("cryogenics","Mudanças de estado")}if(kind==="food")discover("fermentation","Fermentação");return openShop(kind)}if(n){const profile=Object.values(NPC_PROFILES).find(p=>p.role===n.role);chatMessage(n.name.toUpperCase(),profile?.talk||"A Vila dos Elementos está sempre mudando.",{category:"dialogue"});if(n.role==="botanist")discover("ph_kit","Escala de pH");if(n.role==="geologist")discover("spectroscopy","Espectroscopia de cristais");return}}
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
  if(saved.player&&Number.isFinite(saved.player.x)&&Number.isFinite(saved.player.z))worldBoot.preferredSpawn={x:saved.player.x,z:saved.player.z};
  if(saved.player){player.health=clamp(Number(saved.player.health)||100,1,100);const mana=saved.player.mana;player.mana=clamp(mana==null||mana===""||!Number.isFinite(Number(mana))?100:Number(mana),0,100);player.hunger=clamp(Number(saved.player.hunger??100),0,100);player.thirst=clamp(Number(saved.player.thirst??100),0,100);player.breath=clamp(Number(saved.player.breath??playerBreathMax()),0,playerBreathMax())}
  if(Number.isFinite(saved.day))state.day=clamp(saved.day,0,.999999);
  if(Number.isInteger(saved.dayCount)&&saved.dayCount>0)state.dayCount=saved.dayCount;
  if(Number.isFinite(saved.climateElapsed))climateState.elapsed=Math.max(0,saved.climateElapsed);
  if(saved.science){try{scienceSystem?.importState(saved.science)}catch(error){console.warn("[QuimiCraft][Ciência] Estado científico inválido; usando valores padrão sem alterar o save original.",error);messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"Os dados científicos deste mundo não puderam ser migrados. O restante do mundo foi carregado normalmente."})}}
  if(sourceVersion<70)messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"Mundo anterior carregado com migração segura para o sistema científico v7.0."});
  return saved
}
function saveWorldState(){
  professions.persist();
  const data={version:70,seed:WORLD_SEED,player:{x:player.pos.x,y:player.pos.y,z:player.pos.z,health:player.health,mana:player.mana,hunger:player.hunger,thirst:player.thirst,breath:player.breath},day:state.day,dayCount:state.dayCount,climateElapsed:climateState.elapsed,laboratory:{validationVersion:LAB_VALIDATION_VERSION,origin:{x:LAB_LAYOUT.cx,y:LAB_LAYOUT.y,z:LAB_LAYOUT.cz},valid:!!labGenerationReport.validation?.valid,props:labPropPlacements.map(placement=>placement.definition.id)},village:{version:60,generated:true},periodicTable:elementMissions?.exportState?.()||null,science:scienceSystem?.exportState?.()||null,savedAt:Date.now()};
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
function uiBlocking(){return state.catalog||state.alchemyWorkshop||state.frontierWorkshop||state.loading||state.awaitingEntry||state.inventory||state.chemistry||state.periodic||state.shop||state.character||state.chat||state.devOpen||state.graphics||state.history||state.professor||state.scientificNotebook||state.researchTree||state.scienceStation}
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
    player.yaw-=dx*scale*settings.sense;
    player.pitch=clamp(player.pitch-dy*scale*settings.sense,-Math.PI/2+.02,Math.PI/2-.02);
  },
  attack:held=>{
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
    return {x,y:top+.83,z,depth:top-bottom+1,biome:biomeAt(x,z),kind:regionalWater(x,z).id};
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
  B:BLOCK,getBlock,setBlock,exchange:transactInventory,selected:selectedItem,count:countItem,notify:toast,
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
function openInventory(){state.inventory=true;state.playing=false;state.left=false;$("inventory").classList.add("open");$("inventory").setAttribute("aria-hidden","false");document.exitPointerLock?.();renderInventory();paintAvatarViews()}
function closeInventory(){state.inventory=false;$("inventory").classList.remove("open");$("inventory").setAttribute("aria-hidden","true");if(state.started)requestPointer()}
function closeModals(){catalog.close();alchemyUI.close(false);closeFrontierWorkshop(false);state.inventory=state.chemistry=state.periodic=state.shop=state.character=state.chat=state.devOpen=state.graphics=state.history=state.professor=state.scientificNotebook=state.researchTree=state.scienceStation=false;state.paused=false;for(const id of ["inventory","chemistry","periodicTable","shop","character","devMenu","graphics","professor","messageHistory","scientificNotebook","researchTree","scienceStation","pause"])$(id).classList.remove("open");$("chat").classList.remove("open")}
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
function openChat(){if(!state.started||uiBlocking())return;state.chat=true;state.playing=false;state.left=false;$("chat").classList.add("open");document.exitPointerLock?.();setTimeout(()=>$("chatInput").focus(),30)}
function closeChat(){state.chat=false;$("chat").classList.remove("open");$("chatInput").value="";requestPointer()}
function submitChat(){const text=$("chatInput").value.trim();if(!text)return closeChat();if(text.toLowerCase()==="-mododev"){state.chat=false;$("chat").classList.remove("open");$("chatInput").value="";return openDev()}chatMessage("VOCÊ",text);if(text.startsWith("/")&&dev.allRecipes)runDevCommand(text.slice(1));closeChat()}
function openDev(){state.devOpen=true;state.playing=false;state.left=false;$("devMenu").classList.add("open");document.exitPointerLock?.();renderDev()}
function closeDev(){state.devOpen=false;$("devMenu").classList.remove("open");requestPointer()}
function renderDev(){const buttons=[['fly','Voar'],['infinite','Blocos infinitos'],['recipes','Todas as receitas'],['speed','Speed walk +'],['day','Meio-dia'],['night','Noite'],['golem','Spawn Golem'],['wisp','Spawn Espectro'],['magma','Spawn Magma'],['scorpion','Spawn Escorpião'],['cristalume','Spawn Cristalume'],['slime','Spawn Slime Ácido']];$("devStatus").innerHTML=`<span class="dev-pill">FLY ${dev.fly?'ON':'OFF'}</span><span class="dev-pill">SPEED ${dev.speed}×</span><span class="dev-pill">INFINITO ${dev.infinite?'ON':'OFF'}</span><span class="dev-pill">RECEITAS ${dev.allRecipes?'TODAS':'PROGRESSÃO'}</span>`;$("devGrid").innerHTML=buttons.map(([id,n])=>`<button class="dev-btn ${(id==='fly'&&dev.fly)||(id==='infinite'&&dev.infinite)||(id==='recipes'&&dev.allRecipes)?'on':''}" data-dev="${id}">${n}</button>`).join("");$("devGrid").querySelectorAll("[data-dev]").forEach(b=>b.onclick=()=>runDevCommand(b.dataset.dev))}
function runDevCommand(raw){const p=String(raw).trim().toLowerCase().split(/\s+/),cmd=p[0],mobTypes=["slime","cobrete","cristalume","capivara","scorpion","golem","wisp","magma","deer","owl","pig","cow","rabbit","chicken","sheep"];if(cmd==="fly")dev.fly=!dev.fly;else if(cmd==="infinite"){dev.infinite=!dev.infinite;if(dev.infinite)for(const id of [...Object.values(BLOCK).filter(id=>typeof id==="number"&&id>0&&id!==BLOCK.LAVA),"arrow"])if(countItem(id)===0)addItem(id,99)}else if(cmd==="recipes"){dev.allRecipes=true;for(const r of CHEM)unlockedChem.add(r.id);saveChem();renderChemistry()}else if(cmd==="heal"){player.health=player.mana=player.hunger=player.thirst=100;player.breath=playerBreathMax();updateVitals()}else if(cmd==="speed")dev.speed=clamp(+(p[1]||dev.speed%5+1),1,5);else if(cmd==="day")state.day=.25;else if(cmd==="night")state.day=.72;
  else if(cmd==="season"){const names={spring:0,primavera:0,summer:1,verao:1,autumn:2,outono:2,winter:3,inverno:3};const n=names[p[1]]??Number(p[1]);if(Number.isInteger(n)&&n>=0&&n<4){climateState.elapsed=n*420;climateState.season=-1;for(const ch of chunks.values())rebuildChunk(ch.cx,ch.cz)}else return toast("Use: season primavera/verao/outono/inverno")}
  else if(cmd==="weather"){const names={clear:"clear",sol:"clear",rain:"rain",chuva:"rain",snow:"snow",neve:"snow",storm:"storm",tempestade:"storm",auto:null};if(!(p[1] in names))return toast("Use: weather sol/chuva/neve/tempestade/auto");climateState.override=names[p[1]]}else if(cmd==="time")state.day={day:.25,noon:.25,sunset:.49,night:.72}[p[1]]??state.day;else if(cmd==="tp"&&p.length>=4){const [x,y,z]=p.slice(1,4).map(Number);if(![x,y,z].every(Number.isFinite))return toast("Coordenadas inválidas");player.pos.set(x,y,z);player.vel.set(0,0,0);forwardChunks={x:0,z:0};ensureChunks(true)}else if(cmd==="spawn")spawnMob(p[1]);else if(mobTypes.includes(cmd))spawnMob(cmd);else if(cmd==="clear"&&p[1]==="mobs"){for(const e of [...entities])if(!e.persistent)removeEntity(e)}else if(cmd==="give"){const aliases={grass:BLOCK.GRASS,stone:BLOCK.STONE,sand:BLOCK.SAND,redsand:BLOCK.RED_SAND,wood:BLOCK.WOOD,glass:BLOCK.GLASS,lab:BLOCK.LAB,door:BLOCK.DOOR,torch:BLOCK.TORCH,copper:BLOCK.COPPER,sulfur:BLOCK.SULFUR,salt:BLOCK.SALT,spectral:BLOCK.SPECTRAL,gold:BLOCK.GOLD,tin:BLOCK.TIN,zinc:BLOCK.ZINC,crystal:BLOCK.CRYSTAL,obsidian:BLOCK.OBSIDIAN,basalt:BLOCK.BASALT,marble:BLOCK.MARBLE,clay:BLOCK.CLAY,alchemy:BLOCK.ALCHEMY_BRICK,ceramic:BLOCK.CERAMIC,bronze:BLOCK.BRONZE_BLOCK,limestone:BLOCK.LIMESTONE,slate:BLOCK.SLATE,amethyst:BLOCK.AMETHYST,niter:BLOCK.NITER,cherry:BLOCK.CHERRY_LOG,bamboo:BLOCK.BAMBOO,palm:BLOCK.PALM_LOG,village:BLOCK.VILLAGE_BRICK,flower:BLOCK.POPPY,water:"water",hydrogen:"hydrogen",oxygen:"oxygen",acid:"acid",ammonia:"ammonia",ethanol:"ethanol",goldnugget:"gold_nugget",arrow:"arrow",staff:"wind_staff",bow:"bow",sword:"iron_sword",furnace:BLOCK.FURNACE,fire:BLOCK.FIRE,cup:"cup",bucket:"bucket",watercup:"water_cup",waterbucket:"water_bucket",lavabucket:"lava_bucket",rawbeef:"raw_beef",cookedbeef:"cooked_beef",rawpork:"raw_pork",cookedpork:"cooked_pork",goggles:"protective_goggles",respirator:"respirator_mask",labcoat:"lab_coat",helmet:"iron_helmet",chestplate:"iron_chestplate",leggings:"iron_leggings",ironboots:"iron_boots",rubberboots:"rubber_boots",oxygentank:"oxygen_tank",chitinarmor:"chitin_armor"},id=aliases[p[1]]??(+p[1]);if(id!==undefined&&!Number.isNaN(id))addItem(id,clamp(+(p[2]||64),1,999))}else return toast("Comando não reconhecido");renderDev();toast(`DEV · ${cmd} aplicado`)}
function refreshChunkGraphics(){
  activeBuild=null;
  pending.length=0;
  for(const ch of chunks.values())rebuildChunk(ch.cx,ch.cz);
  ensureChunks(true);
}
function syncGraphicControls(){for(const [id,v] of [["qualityPreset",settings.preset],["renderDistance",settings.render],["shadowQuality",settings.shadows],["aoQuality",settings.ao],["waterQuality",settings.water],["particleQuality",settings.particles],["vegetationQuality",settings.vegetation],["resolutionScale",settings.resolution],["mobDensity",settings.mobs]])$(id).value=v;$("cloudToggle").checked=settings.clouds;$("renderOut").value=`${settings.render} chunks`;$("senseOut").value=`${Math.round(settings.sense*100)}%`;$("volumeOut").value=`${Math.round(settings.volume*100)}%`}
function applyGraphics(rebuild=false){renderer.shadowMap.enabled=settings.shadows>0;sunLight.castShadow=settings.shadows>0;const size=settings.shadows===1?1024:2048;if(sunLight.shadow.mapSize.x!==size){sunLight.shadow.mapSize.set(size,size);if(sunLight.shadow.map){sunLight.shadow.map.dispose();sunLight.shadow.map=null}}renderer.setPixelRatio(Math.min(devicePixelRatio*(+settings.resolution||1),1.6));waterMat.uniforms.uQuality.value=settings.water===0?.12:settings.water===1?.58:1;cloudGroup.visible=!!settings.clouds;stars.visible=!!settings.clouds;for(const [,ch] of chunks)ch.group.traverse(o=>{if(o.isMesh){o.castShadow=settings.shadows>0;o.receiveShadow=settings.shadows>0}});entityRoot.traverse(o=>{if(o.isMesh)o.castShadow=settings.shadows>0});playerBody.traverse(o=>{if(o.isMesh)o.castShadow=settings.shadows>0});const cap=[0,7,13,20][settings.mobs],extras=entities.filter(e=>!e.persistent);while(extras.length>cap)removeEntity(extras.pop());updateTorches();saveSettings();syncGraphicControls();if(rebuild)refreshChunkGraphics()}
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
$("runCommand").onclick=()=>{runDevCommand($("devCommand").value);$("devCommand").value=""};$("devCommand").onkeydown=e=>{if(e.key==="Enter"){$("runCommand").click();e.stopPropagation()}};$("chatInput").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();e.stopPropagation();submitChat()}else if(e.key==="Escape"){e.stopPropagation();closeChat()}};


document.addEventListener("keydown",e=>{
  if(state.loading||state.awaitingEntry)return;
  if(state.chat)return;
  if(e.target?.matches?.("input, textarea, select, button")&&e.code!=="Escape"&&!state.playing)return;
  if(e.code==="Escape"){
    e.preventDefault();
    if(state.catalog){catalog.close();return}
    if(state.alchemyWorkshop){alchemyUI.close();return;}
    if(state.frontierWorkshop){closeFrontierWorkshop();return}
    if(state.scientificNotebook)return closeScienceModal("scientificNotebook");if(state.researchTree)return closeScienceModal("researchTree");if(state.scienceStation)return closeScienceModal("scienceStation");if(state.history)return closeMessageHistory();if(state.professor)return closeProfessor();if(state.periodic)return closePeriodicTable();if(state.inventory)return closeInventory();if(state.chemistry)return closeChemistry();if(state.shop)return closeShop();if(state.character)return closeCharacter();if(state.devOpen)return closeDev();if(state.graphics)return closeGraphics();if(state.paused){state.paused=false;$("pause").classList.remove("open");return requestPointer()}if(state.started)return showPause()
  }
  if(e.code==="Enter"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return openChat()}
  if(e.code==="Tab"&&state.started&&(state.inventory||!uiBlocking())&&!state.paused){e.preventDefault();return state.inventory?closeInventory():openInventory()}
  if(e.code==="KeyM"&&state.started&&!uiBlocking()){e.preventDefault();const stats=elementMissions.getStats();if(stats.introduced){elementMissions.setTrackerHidden(!stats.trackerHidden);updateMissionHud()}return}
  if(e.code==="KeyN"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return scienceUI?.openNotebook()}
  if(e.code==="KeyR"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return scienceUI?.openResearch()}
  if(e.code==="KeyG"&&state.playing&&!e.repeat&&!vehicles.current()){e.preventDefault();return collectScientificSample()}
  if(e.code==="KeyV"&&state.playing&&!e.repeat){e.preventDefault();return vehicleQuickAction()}
  if(e.code==="KeyQ"&&state.playing&&!e.repeat&&(vehicles.current()||QuimiCraftVehicles.itemData[selectedItem()])){
    e.preventDefault();return useOrPlace();
  }
  if(state.playing&&playerInput.mode==="drag"){
    if(e.code.startsWith("Arrow"))e.preventDefault();
    if(e.code==="KeyF"&&!e.repeat){
      if(vehicles.current())return vehicles.operate(state.target);
      if(WEAPONS.has(selectedItem()))attackSelected(false);
      else state.left=true;
    }
    if(e.code==="KeyQ"&&!e.repeat){e.preventDefault();return useOrPlace()}
  }
  keys[e.code]=true;if(e.code.startsWith("Digit")){const n=+e.code.slice(5);if(n>=1&&n<=9)chooseSlot(n-1)}if(e.code==="KeyC"&&state.playing){e.preventDefault();cycleCamera()}if(e.code==="KeyE"&&state.playing&&!e.repeat){e.preventDefault();interact()}if(e.code==="Space"&&!dev.fly){e.preventDefault();if(state.playing&&!e.repeat)jumpOrGlide()}
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
    if(action==="jump"){keys.Space=true;jumpOrGlide()}
    else if(action==="attack"){if(vehicles.current())vehicles.operate(state.target);else if(WEAPONS.has(selectedItem()))attackSelected(false);else state.left=true}
    else if(action==="use")useOrPlace();else if(action==="interact")interact();else if(action==="sample"&&!vehicles.current())collectScientificSample();else if(action==="vehicle")vehicleQuickAction();else if(action==="inventory")openInventory()
  });
  for(const eventName of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(eventName,release)
});

window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio*(+settings.resolution||1),1.6))});syncGraphicControls();applyGraphics();

let prevDay=state.day,bubbleClock=0,lastWorldSaveAt=0,wasNearLaboratory=false,mobileControlsVisible=false;
function syncMobileControls(){
  if(!touchInput)return;const visible=!!(state.playing&&!uiBlocking());if(visible===mobileControlsVisible)return;mobileControlsVisible=visible;$("mobileControls")?.classList.toggle("active",visible)
}
const colorNight=new THREE.Color(0x071326),colorDawn=new THREE.Color(0xd8795c),colorDay=new THREE.Color(0x8bc8e7),colorFog=new THREE.Color();
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
    if(lightningClock<0){lightningClock=8+Math.random()*12;lightningLife=.33;const verts=[],sx=player.pos.x+(Math.random()-.5)*35,sz=player.pos.z+(Math.random()-.5)*35;
      let x=sx,y=Math.max(player.pos.y+30,roofAt(sx,sz)+20),z=sz;
      for(let n=0;n<9;n++){
        const nx=x+(Math.random()-.5)*3,nz=z+(Math.random()-.5)*3;
        const floor=Math.max(roofAt(x,z),roofAt(nx,z),roofAt(x,nz),roofAt(nx,nz))+.06;
        if(y<=floor)break;
        const ny=Math.max(y-4,floor);
        verts.push(x,y,z,nx,ny,nz);x=nx;y=ny;z=nz;
        if(ny===floor)break;
      }
      if(lightningMesh){climateGroup.remove(lightningMesh);lightningMesh.geometry.dispose();lightningMesh.material.dispose()}
      const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));lightningMesh=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xe6f7ff,transparent:true,opacity:1}));climateGroup.add(lightningMesh);
      if(Math.random()<.26){const tx=Math.floor(sx),tz=Math.floor(sz),ty=terrainHeight(tx,tz)+1;if(ty>WATER_LEVEL&&!isLabProtectedBlock(tx,ty,tz)&&roofAt(tx,tz)<=ty&&getBlock(tx,ty,tz)===BLOCK.AIR){if(FIRE_FUEL.has(getBlock(tx,ty-1,tz)))setBlock(tx,ty,tz,BLOCK.FIRE)}}
    }
  }
  if(lightningLife>0){lightningLife-=dt;if(!labSafe()&&roofAt(player.pos.x,player.pos.z)<=player.pos.y+1.4)renderer.toneMappingExposure+=Math.max(0,lightningLife)*.72;if(lightningMesh){lightningMesh.material.opacity=clamp(lightningLife*3,0,1);if(lightningLife<=0){climateGroup.remove(lightningMesh);lightningMesh.geometry.dispose();lightningMesh.material.dispose();lightningMesh=null}}}
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
function updateCycle(dt,now){
  if(!state.paused){state.day=(state.day+dt/DAY_SECONDS)%1;if(state.day<prevDay)state.dayCount++;prevDay=state.day}
  const weather=updateClimateState(dt,now),season=currentSeason();
  const ang=state.day*TAU,solar=Math.sin(ang),day=clamp((solar+.12)/.32,0,1),dusk=Math.pow(1-Math.abs(clamp(solar,-1,1)),6),cx=state.started?player.pos.x:spawn.x,cz=state.started?player.pos.z:spawn.z;
  const sunPos=new THREE.Vector3(Math.cos(ang)*105,solar*105,Math.sin(ang*.73)*55);sunOrb.position.set(cx+sunPos.x,player.pos.y+sunPos.y,cz+sunPos.z);moonOrb.position.set(cx-sunPos.x,player.pos.y-sunPos.y,cz-sunPos.z);
  sunLight.position.set(cx+(solar>=-.06?sunPos.x:-sunPos.x),player.pos.y+Math.abs(sunPos.y)+18,cz+(solar>=-.06?sunPos.z:-sunPos.z));sunLight.target.position.set(cx,player.pos.y,cz);sunLight.target.updateMatrixWorld();sunLight.intensity=lerp(.16,1.35,day);sunLight.color.set(day>.3?0xffedce:0x8ca9d8);hemi.intensity=lerp(.19,.72,day);hemi.color.set(day>.3?0xbde4ff:0x324a78);hemi.groundColor.set(day>.25?0x3a422c:0x11172a);
  colorFog.copy(colorNight).lerp(colorDay,day);if(dusk>.05)colorFog.lerp(colorDawn,dusk*.56);renderer.toneMappingExposure=lerp(.69,1.08,day);
  if(season===3)colorFog.lerp(new THREE.Color(0xc2d4e4),day*.26);
  if(season===2)colorFog.lerp(new THREE.Color(0xb78b69),day*.16);
  if(weather==="rain"||weather==="storm"){colorFog.lerp(new THREE.Color(0x465a74),.38);renderer.toneMappingExposure*=.84}
  if(weather==="snow"){colorFog.lerp(new THREE.Color(0xb5c8d5),.2);}
  sky.position.copy(camera.position);skyMat.uniforms.uTime.value=state.day;stars.position.copy(camera.position);starMat.opacity=clamp((-.04-solar)*2.2,0,.88);sunOrb.visible=solar>-.18;moonOrb.visible=solar<.17;
  cloudGroup.position.set(cx+Math.sin(now*.000026)*19,player.pos.y,cz+Math.cos(now*.000023)*16);cloudMaterial.opacity=weather==="storm"?.72:weather==="rain"?.83:lerp(.36,.88,day);cloudMaterial.color.set(weather==="storm"?0x7c8da8:weather==="rain"?0xb3bfca:0xffffff);sunOrb.children[0].material.opacity=weather==="storm"?.24:weather==="rain"?.5:1;moonOrb.children[0].material.opacity=weather==="storm"?.3:1;sunOrb.children[1].lookAt(camera.position);moonOrb.children[1].lookAt(camera.position);waterMat.uniforms.uTime.value=now*.001;lavaMat.uniforms.uTime.value=now*.001;blockGlowTime.value=now*.001;waterMat.uniforms.uSun.value.copy(sunPos).normalize();const cameraSubmerged=state.started&&player.cameraUnderwater;waterMat.uniforms.uUnderwater.value=cameraSubmerged?1:0;const clarity=cameraSubmerged?underwaterClarity():null;
  if(clarity!==null){
    colorFog.setRGB(...regionalWater(player.pos.x,player.pos.z).rgb).multiplyScalar(.25+clarity*.28);
    renderer.toneMappingExposure=lerp(.64,.84,clarity);
  }
  const fog=horizon.fogRange(visibleRenderRange(dt),CHUNK,weather,clarity);
  scene.fog.near=fog.near;scene.fog.far=fog.far;
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
  for(const l of torchLights)l.intensity=1.05+Math.sin(now*.011+l.userData.seed)*.18+hash(Math.floor(now/75),l.userData.seed)*.12;
  if(solar<-.2&&audioCtx&&now-lastCricket>1800+Math.random()*3600){lastCricket=now;cricket()}
}
function updateMenu(now){playerBody.visible=false;firstHands.visible=false;const a=now*.000045,r=34,focus=new THREE.Vector3(spawn.x+7,terrainHeight(spawn.x+7,spawn.z+5)+4,spawn.z+5);camera.position.set(focus.x+Math.cos(a)*r,focus.y+14+Math.sin(a*.7)*4,focus.z+Math.sin(a)*r);camera.lookAt(focus);camera.fov=57;camera.updateProjectionMatrix()}
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
  if(state.playing){playerInput.turn(keys,dt);updateLabDecor(now,Math.min(.28,elapsed));updatePhysics(dt);updateQueuedPlacement(dt);updateFluids(dt);alchemyPlay.tick(dt);tickPlayerActivities(dt);professions.update(dt);updateFish(dt,now);ensureChunks();updateTarget(dt);updateEntities(dt,now);updateProjectiles(dt);updateDrops(dt,now);updateEnemyHud(dt);updateInteraction();const nearLab=labBoundsContains(player.pos.x,player.pos.z,3);if(nearLab&&!wasNearLaboratory)verifyLaboratoryOnEntry();wasNearLaboratory=nearLab;bubbleClock+=dt;if(player.inWater&&bubbleClock>.17){bubbleClock=0;bubble(player.pos)}if(now-lastWorldSaveAt>10000){lastWorldSaveAt=now;saveWorldState()}}else if(!state.started)updateMenu(now);else updatePlayerCamera(dt,false);
  syncMobileControls();updateVehicleHud();updateGameplayFPS(now);updateCycle(dt,now);frontierFx.update(dt);updateParticles(dt);updateHud();renderer.render(scene,camera);
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
  protectedPosition:(x,y,z)=>labBoundsContains(x,z,1)&&y<=LAB_LAYOUT.y+LAB_LAYOUT.height+1||inLabEntranceCorridor(x,z)&&y<=LAB_LAYOUT.y+4,
  exchange:transactInventory,breakArea:excavateWithVehicle,inspect:inspectVehicleCut,surface:vehicleSurface,notice:toast,persist:persistVehicles
});
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
function vehiclePlacementTarget(){
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
  if(vehicles.current())return leaveVehicle();
  const id=selectedItem();
  if(id===QuimiCraftVehicles.motor)return vehicles.install();
  if(id==="kit_glider"&&!player.inWater&&!player.onGround&&player.vel.y<-.55){
    if(vehicles.deploy(id,null,true)){queuedPlacement=null;playerActivity=null;refreshHeldItem();}
    return;
  }
  if(vehicles.nearest())return vehicles.stash();
  if(QuimiCraftVehicles.kindOf(id))return vehicles.deploy(id,vehiclePlacementTarget());
  toast("Selecione um kit ou se aproxime de um veículo para recolhê-lo.");
}
function jumpOrGlide(){
  if(vehicles.current())return;
  if(player.inWater)player.vel.y=Math.max(player.vel.y,2.6);
  else if(player.onGround){player.vel.y=7.2;player.onGround=false;player.fallStart=player.pos.y;}
  else if(selectedItem()==="kit_glider"&&player.vel.y<-.55)vehicleQuickAction();
}
function updateVehiclePhysics(dt){
  const glider=vehicles.current().kind==="glider";
  const input={throttle:Number(!!keys.KeyW)-Number(!!keys.KeyS),turn:Number(!!keys.KeyA)-Number(!!keys.KeyD),
    pitch:player.pitch,brake:glider?!!keys.Space:!!(keys.ControlLeft||keys.ControlRight),
    takeoff:glider&&!!keys.Space,jump:!glider&&!!keys.Space,nitro:!glider&&!!(keys.ShiftLeft||keys.ShiftRight)};
  const {vehicle,dx,dz}=vehicles.update(dt,input,state.target);
  const moving=Math.abs(dx)+Math.abs(dz)>.001;
  player.crouch=player.sprint=player.inWater=player.headUnderwater=player.inLava=false;
  forwardChunks=horizon.movementDirection(dx,dz);
  updateScienceEnvironment(dt,moving||vehicle.pedaling);
  updateSurvival(dt,moving||vehicle.pedaling);
  updateBreath(dt,false);
  updatePlayerCamera(dt,moving);
  player.cameraUnderwater=false;updateUnderwaterUI(false);updateVitals();
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
    const ground=!!v&&v.kind!=="glider";
    $("vehicleNitroPanel").hidden=!ground;
    $("vehicleAltitude").hidden=!v||ground;
    for(const button of drivingButtons){
      button.hidden=!ground;
      if(!ground){keys[button.dataset.mobileKey]=false;button.classList.remove("pressed");}
    }
  }
  if(!v)return;
  const data=QuimiCraftVehicles.types[v.kind],glider=v.kind==="glider";
  const set=(id,value)=>{
    const element=$(id);
    if(element.textContent!==value)element.textContent=value;
  };
  const max=glider?85:v.kind==="cart"?75:25;
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
  b.vox[voxelIndex(1,0,1)]=id;
  if(id===BLOCK.DOOR||id===BLOCK.DOOR_OPEN){
    for(const half of [0,1])addDoorGeometry(b.a,0,half,0,id,{half});
  }else meshChunkColumn(b,0);
  if(b.wa.p.length)return new THREE.Mesh(geometryFromWater(b.wa),waterMat);
  if(b.la.p.length)return new THREE.Mesh(geometryFrom(b.la),lavaMat);
  return b.a.p.length?new THREE.Mesh(geometryFrom(b.a),terrainMat):null;
}
function catalogActor(type,resident=null){
  const e=createEntity(type,0,0,!!resident,resident);
  removeEntity(e);
  const group=e.group;
  group.position.set(0,0,0);group.rotation.set(0,0,0);
  for(const child of [...group.children])if(child.isSprite){
    group.remove(child);child.material.map?.dispose();child.material.dispose();
  }
  return group;
}
function catalogEntries(){
  const entries=[],blockAngle=[1.26,1.04,-1.75],personAngle=[.76,.30,-2.6],
    vehicleAngle=[1.38,.72,-1.85],animalAngle=[1.48,.51,-1.82],fishAngle=[1.92,.48,-.92];
  const byName=new Intl.Collator("pt-BR");
  const add=(category,key,name,detail,model,angle,more={})=>entries.push({category,key,name,detail,model,angle,...more});
  const keys=Object.fromEntries(Object.entries(BLOCK).map(([name,id])=>[id,name]));
  const mineralDetails={
    DIAMOND_ORE:"Depósitos muito profundos",EMERALD_ORE:"Montanhas e cânions",RUBY_ORE:"Regiões vulcânicas e chapadas",
    SAPPHIRE_ORE:"Subsolo glacial e grandes bacias",OPAL_ORE:"Termas, cânions e bacias",GARNET_ORE:"Veios profundos",
    MAGNETITE:"Minério de ferro · redutível na forja",IRON:"Veios de ferro · fundição",SUNKEN_BEACON:"Ruínas de bacias profundas",
    SUNKEN_BRICK:"Ruínas de bacias profundas",SUNKEN_MOSAIC:"Piso das ruínas submersas"
  };
  for(const [value,def] of Object.entries(BDEF).sort((a,b)=>byName.compare(a[1].name,b[1].name))){
    const id=Number(value),key=keys[id]||value;
    add("block","block:"+key,def.name,[mineralDetails[key],"Bloco "+value].filter(Boolean).join(" · "),()=>catalogBlock(id),blockAngle,{
      fallback:()=>blockIconSource(id),
      release:object=>{object.geometry.dispose();if(id===BLOCK.AIR)object.material.dispose()}
    });
  }
  for(const [type,p] of Object.entries({npc_carbon:{name:"Prof. Carbono",role:"Laboratório Carbono"},npc_ranger:{name:"Guardiã Íris",role:"Guarda de campo"},...NPC_PROFILES})){
    add("npc",type,p.name,p.role.replace(/_/g," "),()=>catalogActor(type),personAngle);
  }
  for(const [school,p] of Object.entries(QuimiCraftAlchemy.specialties)){
    const resident={name:p.person,id:"catalog:"+school,role:"alchemist",x:0,y:0,z:0,office:{kind:school},
      tint:parseInt(p.color.slice(1),16),trim:parseInt(p.color.slice(1),16),scale:p.scale,skin:p.skin,hair:p.hair,accessory:p.accessory,variant:1};
    add("npc","alchemy:"+school,p.person,p.title,()=>catalogActor("npc_alchemist",resident),personAngle);
  }
  for(const [region,label] of [["planície","Campos"],["floresta","Bosque"],["manguezal","Costa"],["deserto","Chapada"],["tundra","Serra"],["vulcânico","Caldeira"]]){
    const hub={x:880,z:880,base:30,version:3};
    const {people}=QuimiCraftSettlements.create({B:BLOCK,seed:106488241,hub,biome:()=>region,hash}).main();
    const choices=people.filter(p=>p.civic),local=people.find(p=>!p.civic&&!p.role.startsWith("shop_"));
    if(local)choices.push(local);
    for(const p of choices){
      const type="npc_"+(p.role.startsWith("shop_")?p.role.slice(5):p.role);
      add("npc",region+":"+p.id,p.name,[label,p.title].filter(Boolean).join(" · "),()=>catalogActor(type,p),personAngle);
    }
  }
  const models=QuimiCraftVehicleModels.create(THREE);
  for(const [kind,p] of Object.entries(QuimiCraftVehicles.types)){
    const detail={cart:"Cabine de vidro · exploração",drill:"Cabine de vidro · perfuração",bucket:"Cabine de vidro · escavação",glider:"Planador biplano"}[kind];
    add("vehicle",kind,p.name,detail,()=>models.build(kind).root,vehicleAngle);
  }
  add("vehicle","glider_motor","14-bis de Campo motorizado","Módulo de pedal e hélice",()=>{
    const model=models.build("glider");model.drive.visible=true;return model.root;
  },[-1.55,.75,1.64]);
  const base={pig:"Porco",cow:"Vaca",rabbit:"Coelho",chicken:"Galinha",sheep:"Ovelha",deer:"Cervo da Taiga",
    owl:"Coruja Boreal",capivara:"Capivara",slime:"Geleia corrosiva",cobrete:"Cobrete",cristalume:"Cristalume",
    scorpion:"Escorpião",golem:"Golem",wisp:"Fagulha espectral",magma:"Criatura de magma"};
  const fantasy=new Set(["slime","cobrete","cristalume","golem","wisp","magma","peat_slime","travertine_guard"]);
  for(const type of [...Object.keys(base),...Object.keys(FAUNA_VARIANTS)]){
    const variant=FAUNA_VARIANTS[type];
    const category=fantasy.has(type)?"fantasy":"animal";
    add(category,type,variant?.name||base[type],variant?"Variante regional":"",()=>catalogActor(type),animalAngle);
  }
  const releaseFish=group=>group.traverse(n=>{if(n.geometry&&!sharedFishGeometry.has(n.geometry))n.geometry.dispose()});
  for(const id of Object.keys(fishColors)){
    if(id==="raw_piranha")continue;
    const label=itemName(id).replace(/^Peixe cru\b/i,"Peixe").replace(/\s+cru(?:a)?\b/gi,"").replace(/\s*\(cru(?:a)?\)/gi,"").replace(/^Filé de\s+/i,"");
    add("aquatic",id,label,"Pescado",()=>inspectedAquaticModel(id),fishAngle,{tint:0xcbdfe4,release:releaseFish});
  }
  for(const [id,p] of Object.entries(QuimiCraftDepths.fauna)){
    add("aquatic",id,p.name,p.habitat,()=>inspectedAquaticModel(id),fishAngle,{tint:0xcbdfe4,release:releaseFish});
  }
  return entries;
}
const catalog=QuimiCraftCatalog.create({THREE,root:$("catalog"),entries:catalogEntries,onClose:()=>{state.catalog=false}});
for(const id of ["catalogTitleBtn","catalogPauseBtn"])$(id).onclick=()=>{
  state.catalog=true;
  catalog.open($(id));
};

applyCharacterStyle();applyEquipmentVisuals();updateMissionHud();saveInventory();saveEquipment();renderInventory();updateChemHud();updateVitals();window.addEventListener("pagehide",()=>{if(initialReady&&!switchingWorld)saveWorldState()});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){clearInput();if(initialReady&&!switchingWorld)saveWorldState()}
});requestAnimationFrame(animate);
