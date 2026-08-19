"use strict";
/* ------------------------------------------------------------
   QUIMICRAFT v7.0 — CIÊNCIA, RISCOS & PESQUISA · direct-browser voxel engine
   Three.js r128 + procedural assets only
------------------------------------------------------------- */
const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t), fract=x=>x-Math.floor(x), TAU=Math.PI*2;
const hash=(x,y=0,z=0)=>fract(Math.sin(x*127.1+y*311.7+z*74.7+19.19)*43758.5453);
const BLOCK_SIZE=1, CHUNK=16, MAX_Y=62, WATER_LEVEL=15, DAY_SECONDS=2400;

const BLOCK={AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,WOOD:5,LEAVES:6,SNOW:7,COAL:8,IRON:9,CACTUS:10,PLANK:11,TORCH:12,DOOR:13,BEDROCK:14,DOOR_OPEN:15,LAB:16,COPPER:17,SULFUR:18,GLASS:19,SPECTRAL:20,SALT:21,MUD:22,CLAY:23,BASALT:24,OBSIDIAN:25,GOLD:26,TIN:27,ZINC:28,CRYSTAL:29,ICE:30,MOSS:31,RED_SAND:32,LAVA:33,PINE_LOG:34,PINE_LEAVES:35,DRY_LEAVES:36,MARBLE:37,DEEPSTONE:38,ASH:39,GLOWSTONE:40,ALCHEMY_BRICK:41,CERAMIC:42,BRONZE_BLOCK:43,TALL_GRASS:44,POPPY:45,BLUE_FLOWER:46,WHITE_FLOWER:47,CHERRY_LOG:48,CHERRY_LEAVES:49,LIMESTONE:50,SLATE:51,AMETHYST:52,NITER:53,FROSTED_SOIL:54,PEAT:55,BAMBOO:56,PALM_LOG:57,PALM_LEAVES:58,VILLAGE_BRICK:59,FURNACE:60};
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
  60:{name:"Forno de pedra",solid:true,tex:62,hard:1.75,icon:"#595d60"}
};
const ITEM_COLORS={...Object.fromEntries(Object.entries(BDEF).map(([k,v])=>[k,v.icon||"#777"])),stick:"#94704a",wind_staff:"#63dce7",bow:"#b4814c",iron_sword:"#cdd7dc",arrow:"#ded8bd",hydrogen:"#bfe8ff",oxygen:"#83b9e8",water:"#4caed0",copper_ingot:"#c77b50",sulfur:"#d9cf3e",acid:"#9ddb62",indicator:"#bc77d8",fertilizer:"#8d6946",glow_solution:"#55e6c0",copper_sulfate:"#397ddd",lab_note:"#e9eee7",acid_gel:"#74d856",chitin:"#b98248",wind_essence:"#8cecf5",crystal_shard:"#a889ef",copper_core:"#d38152",bronze_ingot:"#c98542",voltaic_cell:"#d7c858",ceramic_plate:"#dcaa8c",feather:"#e8e2d2",hide:"#9f6848",gold_nugget:"#edca58",antidote:"#9ee78b",armor_plate:"#b79567",storm_focus:"#67e3ef",carbon_dioxide:"#d9e5e5",quicklime:"#e9dfbf",slaked_lime:"#eef2e5",alkali:"#b7d8eb",neutral_salt:"#e8e6dc",rust_pigment:"#a9583c",ammonia:"#a2dce8",tetraammine:"#315bc8",ethanol:"#d7eef1",plant_oil:"#d5bd5b",soap:"#e4d6b8",ph_kit:"#c46ed1",nitrate_mix:"#d8d3b8",bread:"#c88a4b",berries:"#bb405c",honey:"#dda83f",cheese:"#e7c96b",shield:"#86939a",chainmail:"#aeb9bf",liquid_nitrogen:"#a8e9f4",lucky_charm:"#e1bd62",prism_pendant:"#9c80df",lab_glassware:"#b8edf2",carbon_rod:"#343a3d",carbon_filter:"#48545a",distillation_flask:"#9fe2ea",spectrometer_lens:"#70d5e8",catalyst:"#d5a757",protective_goggles:"#78d7df",sample_case:"#d4b56a",sodium_chloride:"#f4f6ef",chlorine:"#a6db55",sodium_hydroxide:"#d9eef3",hydrochloric_acid:"#dbe9ef",hydrogen_peroxide:"#c8ecf7",activated_carbon:"#252b2e",purified_water:"#6dcce7",copper_oxide:"#2b2420",silver_dust:"#d5d9dc",silver_nitrate:"#eef1f4",silver_chloride:"#f3f0df",sodium_nitrate:"#ebe7dc",chromatography_strip:"#d5b4da",pure_ethanol:"#d9f0f1",carbonate_solution:"#b9d7dc",copper_crystal:"#3b83e6",spectral_data:"#73f1ce",plated_iron:"#d18c61",carbon_badge:"#63d6c8",periodic_key:"#d9c86a",cup:"#b9e8ef",water_cup:"#55bce1",bucket:"#aeb9bf",water_bucket:"#438fc1",raw_venison:"#9d4240",cooked_venison:"#7c3229",raw_pork:"#e58a93",cooked_pork:"#a95b43",raw_beef:"#b7443e",cooked_beef:"#73352d",raw_rabbit:"#d49187",cooked_rabbit:"#a7654e",raw_chicken:"#e8b8a1",cooked_chicken:"#b8794c",raw_mutton:"#c86f72",cooked_mutton:"#8c4840",wool:"#e9e3d4",iron_helmet:"#9aa8ae",iron_chestplate:"#87969d",iron_leggings:"#7f8e95",iron_boots:"#76858c",lab_coat:"#e7f0ee",respirator_mask:"#5b7175",rubber_boots:"#d7bd42",oxygen_tank:"#6fa6b1",chitin_armor:"#9d7048"};

Object.assign(ITEM_COLORS,window.QuimiCraftScience?.itemColors||{});

class Perlin{
  constructor(seed=1337){
    const p=[...Array(256).keys()];let s=seed>>>0;
    for(let i=255;i>0;i--){s=(s*1664525+1013904223)>>>0;const j=s%(i+1);[p[i],p[j]]=[p[j],p[i]]}
    this.p=new Uint16Array(512);for(let i=0;i<512;i++)this.p[i]=p[i&255];
  }
  fade(t){return t*t*t*(t*(t*6-15)+10)}
  grad(h,x,y,z){const q=h&15,u=q<8?x:y,v=q<4?y:q===12||q===14?x:z;return((q&1)?-u:u)+((q&2)?-v:v)}
  n3(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=this.fade(x),v=this.fade(y),w=this.fade(z),p=this.p,A=p[X]+Y,AA=p[A]+Z,AB=p[A+1]+Z,B=p[X+1]+Y,BA=p[B]+Z,BB=p[B+1]+Z;return lerp(lerp(lerp(this.grad(p[AA],x,y,z),this.grad(p[BA],x-1,y,z),u),lerp(this.grad(p[AB],x,y-1,z),this.grad(p[BB],x-1,y-1,z),u),v),lerp(lerp(this.grad(p[AA+1],x,y,z-1),this.grad(p[BA+1],x-1,y,z-1),u),lerp(this.grad(p[AB+1],x,y-1,z-1),this.grad(p[BB+1],x-1,y-1,z-1),u),v),w)}
  n2(x,z){return this.n3(x,0,z)}
  fbm2(x,z,oct=5){let a=.5,f=1,n=0,d=0;for(let i=0;i<oct;i++){n+=this.n2(x*f,z*f)*a;d+=a;a*=.5;f*=2.03}return n/d}
  fbm3(x,y,z,oct=3){let a=.55,f=1,n=0,d=0;for(let i=0;i<oct;i++){n+=this.n3(x*f,y*f,z*f)*a;d+=a;a*=.5;f*=2.01}return n/d}
}
const WORLD_SEED=(()=>{let s=Number(localStorage.qc_world_seed);if(!Number.isFinite(s)||s<1){s=Math.floor(100000+Math.random()*899999999);localStorage.qc_world_seed=String(s)}return s})();
const noise=new Perlin(WORLD_SEED);

function textureAtlas(){
  const S=32,COLS=8,ROWS=8,c=document.createElement("canvas");c.width=S*COLS;c.height=S*ROWS;const x=c.getContext("2d"),img=x.createImageData(c.width,c.height);
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
    [[84,87,88],[132,137,138],[38,41,42]]
  ];
  for(let id=0;id<palette.length;id++)for(let py=0;py<S;py++)for(let px=0;px<S;px++){
    const [base,hi,lo]=palette[id],h=hash(px+id*37,py+id*11),grain=(hash(px*7,py*13,id)-.5)*24;let col=h>.88?hi:h<.12?lo:base;let r=col[0]+grain,g=col[1]+grain,b=col[2]+grain,a=255;
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
    const gx=(id%COLS)*S+px,gy=Math.floor(id/COLS)*S+py,o=(gy*c.width+gx)*4;img.data[o]=clamp(r,0,255);img.data[o+1]=clamp(g,0,255);img.data[o+2]=clamp(b,0,255);img.data[o+3]=a;
  }
  x.putImageData(img,0,0);const tex=new THREE.CanvasTexture(c);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestMipMapLinearFilter;tex.wrapS=tex.wrapT=THREE.ClampToEdgeWrapping;tex.encoding=THREE.sRGBEncoding;tex.generateMipmaps=true;return {texture:tex,canvas:c,cols:COLS,rows:ROWS,size:S};
}
const atlas=textureAtlas();

const scene=new THREE.Scene();scene.background=new THREE.Color(0x8bc5e5);scene.fog=new THREE.FogExp2(0x8bc5e5,.0105);
const camera=new THREE.PerspectiveCamera(73,innerWidth/innerHeight,.07,420);camera.rotation.order="YXZ";
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance",alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;$("game").appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xbbe0ff,0x3a422c,.65);scene.add(hemi);
const sunLight=new THREE.DirectionalLight(0xfff1cf,1.2);sunLight.castShadow=true;sunLight.shadow.mapSize.set(2048,2048);sunLight.shadow.camera.left=-55;sunLight.shadow.camera.right=55;sunLight.shadow.camera.top=55;sunLight.shadow.camera.bottom=-55;sunLight.shadow.camera.near=.1;sunLight.shadow.camera.far=150;sunLight.shadow.bias=-.00045;scene.add(sunLight,sunLight.target);

const terrainMat=new THREE.MeshLambertMaterial({map:atlas.texture,vertexColors:true,alphaTest:.38,transparent:false,opacity:1,depthWrite:true,depthTest:true,colorWrite:true,side:THREE.FrontSide});
const mods=new Map(),doorMeta=new Map(),chunks=new Map(),pending=[],chunkMeshes=[],heightCache=new Map(),biomeCache=new Map();let wantedChunks=new Set();
const key3=(x,y,z)=>`${x}|${y}|${z}`, ckey=(cx,cz)=>`${cx},${cz}`;

const VILLAGE={x:48,z:-22,base:18,spacing:10,half:3};
const VILLAGE_SHOPS=[
  {role:"shop_food",name:"Dona Canela",shop:"food",label:"Mercearia da Colheita"},
  {role:"shop_armor",name:"Ferreiro Cobalto",shop:"armor",label:"Forja Cobalto"},
  {role:"shop_solid",name:"Dra. Sílica",shop:"solid",label:"Reagentes Sólidos"},
  {role:"shop_liquid",name:"Mestre Solvente",shop:"liquid",label:"Reagentes Líquidos"},
  {role:"shop_trinket",name:"Luma Prismática",shop:"trinket",label:"Berloques Prismáticos"}
];
const VILLAGE_BUILDINGS=[];for(let gz=-2;gz<=2;gz++)for(let gx=-2;gx<=2;gx++){const shop=gz===0?VILLAGE_SHOPS[gx+2]:null;VILLAGE_BUILDINGS.push({gx,gz,x:VILLAGE.x+gx*VILLAGE.spacing,z:VILLAGE.z+gz*VILLAGE.spacing,kind:shop?"shop":"house",shop,variant:Math.floor(hash(gx+19,gz-37,WORLD_SEED%997)*4)})}
const villageMod=(n,m)=>((n%m)+m)%m;
function villageCell(x,z){const gx=Math.round((x-VILLAGE.x)/VILLAGE.spacing),gz=Math.round((z-VILLAGE.z)/VILLAGE.spacing);if(Math.abs(gx)>2||Math.abs(gz)>2)return null;const cx=VILLAGE.x+gx*VILLAGE.spacing,cz=VILLAGE.z+gz*VILLAGE.spacing;if(Math.abs(x-cx)>4||Math.abs(z-cz)>4)return null;return VILLAGE_BUILDINGS[(gz+2)*5+gx+2]}
function inVillage(x,z,margin=0){return Math.abs(x-VILLAGE.x)<=27+margin&&Math.abs(z-VILLAGE.z)<=27+margin}
function villageGround(x,z){if(!inVillage(x,z))return 0;const rx=Math.abs(villageMod(Math.floor(x-VILLAGE.x),VILLAGE.spacing)-5),rz=Math.abs(villageMod(Math.floor(z-VILLAGE.z),VILLAGE.spacing)-5);return rx<1.55||rz<1.55||Math.hypot(x-(VILLAGE.x),z-(VILLAGE.z+5))<4.2?BLOCK.VILLAGE_BRICK:BLOCK.GRASS}
function villageBlock(x,y,z){const b=villageCell(x,z);if(!b)return BLOCK.AIR;const dx=x-b.x,dz=z-b.z,ly=y-VILLAGE.base,edge=Math.abs(dx)===3||Math.abs(dz)===3,front=dz===-3,door=front&&dx===0,window=ly===2&&((Math.abs(dx)===3&&Math.abs(dz)<=1)||(Math.abs(dz)===3&&Math.abs(dx)===2));if(ly===0&&Math.abs(dx)<=3&&Math.abs(dz)<=3)return b.kind==="shop"?BLOCK.VILLAGE_BRICK:BLOCK.PLANK;if(ly>=1&&ly<=3&&edge){if(door&&ly<=2)return BLOCK.AIR;if(window)return BLOCK.GLASS;const shopWall={food:BLOCK.CHERRY_LOG,armor:BLOCK.SLATE,solid:BLOCK.ALCHEMY_BRICK,liquid:BLOCK.CERAMIC,trinket:BLOCK.MARBLE}[b.shop?.shop];return shopWall||[BLOCK.PLANK,BLOCK.CHERRY_LOG,BLOCK.LIMESTONE,BLOCK.VILLAGE_BRICK][b.variant]}
  if(ly===4&&Math.abs(dx)<=4&&Math.abs(dz)<=4)return b.kind==="shop"?({food:BLOCK.CHERRY_LEAVES,armor:BLOCK.SLATE,solid:BLOCK.ALCHEMY_BRICK,liquid:BLOCK.GLASS,trinket:BLOCK.AMETHYST}[b.shop.shop]):[BLOCK.VILLAGE_BRICK,BLOCK.CHERRY_LEAVES,BLOCK.SLATE,BLOCK.PLANK][b.variant];if(ly===5&&Math.abs(dx)<=2&&Math.abs(dz)<=2)return b.kind==="shop"?BLOCK.VILLAGE_BRICK:[BLOCK.VILLAGE_BRICK,BLOCK.CHERRY_LEAVES,BLOCK.SLATE,BLOCK.PLANK][b.variant];
  if(b.kind==="shop"&&ly===1&&dz===2&&Math.abs(dx)<=2)return b.shop.shop==="liquid"?BLOCK.GLASS:b.shop.shop==="solid"?BLOCK.LAB:BLOCK.PLANK;if(b.kind==="house"&&ly===1&&dx===2&&dz===2)return b.variant===2?BLOCK.CERAMIC:BLOCK.PLANK;if(ly>=1&&ly<=2&&dx===-2&&dz===2&&b.variant===0)return BLOCK.GLOWSTONE;return BLOCK.AIR}
function lakeInfluence(x,z){if(inVillage(x,z,8)||Math.hypot(x+14,z+18)<24)return 0;const size=82,cx=Math.floor(x/size),cz=Math.floor(z/size);let best=0;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const gx=cx+dx,gz=cz+dz,px=(gx+.18+hash(gx,gz,WORLD_SEED%521)*.64)*size,pz=(gz+.18+hash(gx+71,gz-43,WORLD_SEED%733)*.64)*size,r=13+hash(gx-27,gz+59,WORLD_SEED%887)*17,d=Math.hypot(x-px,z-pz),shape=clamp(1-d/r,0,1);best=Math.max(best,shape)}return smooth(best)}

function biomeAt(x,z){
  x=Math.floor(x);z=Math.floor(z);const k=`${x},${z}`;if(biomeCache.has(k))return biomeCache.get(k);const temp=noise.fbm2(x*.0035+90,z*.0035-40,3),moist=noise.fbm2(x*.0042-180,z*.0042+80,3),weird=noise.fbm2(x*.0027+310,z*.0027-220,3),ridge=Math.abs(noise.fbm2(x*.003+10,z*.003+7,3));let b;
  if(weird>.34&&temp>.01)b="vulcânico";else if(weird<-.34&&moist<.09)b="bosque de cristais";else if(temp<-.31)b=moist<-.03?"tundra":"taiga";else if(temp>.27&&moist>.19)b="selva tropical";else if(temp>.24&&moist<-.12)b="deserto";else if(moist>.27&&temp>-.05)b="pântano";else if(weird<-.17&&moist<-.08&&temp>.02)b="salinas";else if(weird<-.08&&moist<.04&&temp<.16)b="cânion calcário";else if(moist>.15&&weird>.11&&temp>.01)b="bosque de cerejeiras";else if(ridge<.13&&temp<.05)b="prado alpino";else if(temp>.13&&moist<.03)b=weird>.05?"badlands":"savana";else if(ridge<.17&&weird>.04)b="montanha";else if(moist>.13)b="floresta";else if(moist>.02)b="planície florida";else b="planície";
  if(biomeCache.size>220000)biomeCache.clear();biomeCache.set(k,b);return b;
}
function terrainHeight(x,z){
  x=Math.floor(x);z=Math.floor(z);const k=`${x},${z}`;if(heightCache.has(k))return heightCache.get(k);const b=biomeAt(x,z),broad=noise.fbm2(x*.006,z*.006,4),detail=noise.fbm2(x*.025+50,z*.025-20,2),ridge=1-Math.abs(noise.fbm2(x*.004-30,z*.004+40,4));let h=17+broad*7+detail*2;
  const mountain=smooth(clamp((ridge-.56)/.3,0,1));h+=mountain*mountain*(b==="vulcânico"?32:27);const lakeD=Math.hypot((x-32)/1.2,z-9),lake=smooth(clamp(1-lakeD/31,0,1)),lakes=lakeInfluence(x,z);h=lerp(h,10+lakeD*.085,lake*.93);h=lerp(h,9.2+noise.fbm2(x*.035,z*.035,2)*1.15,lakes*.96);
  if(b==="deserto"||b==="savana"||b==="salinas")h=lerp(h,17+noise.fbm2(x*.012,z*.012,3)*3,.58);else if(b==="pântano")h=lerp(h,15+noise.fbm2(x*.015,z*.015,2)*1.6,.78);else if(b==="tundra")h=lerp(h,18+noise.fbm2(x*.011,z*.011,3)*4,.54);else if(b==="selva tropical")h+=noise.fbm2(x*.018+180,z*.018-90,3)*3.4;else if(b==="badlands")h=17+Math.floor((broad+1)*3)*2+detail;else if(b==="cânion calcário")h=19+Math.floor((broad+1.1)*2.4)*2+detail*.7;else if(b==="prado alpino")h+=mountain*9+noise.fbm2(x*.017,z*.017,2)*2;else if(b==="bosque de cristais")h+=noise.fbm2(x*.014-10,z*.014+40,2)*4;else if(b==="vulcânico")h+=Math.max(0,noise.fbm2(x*.009+400,z*.009-330,3))*8;
  const edge=Math.max(Math.abs(x-VILLAGE.x)-27,Math.abs(z-VILLAGE.z)-27),villageBlend=clamp(1-edge/8,0,1);if(villageBlend>0)h=lerp(h,VILLAGE.base,smooth(villageBlend));
  h=clamp(Math.floor(h),3,MAX_Y-2);if(heightCache.size>220000)heightCache.clear();heightCache.set(k,h);return h;
}
function labBoundsContains(x,z,pad=0){
  return x>=LAB_LAYOUT.cx-LAB_LAYOUT.halfW-pad&&x<=LAB_LAYOUT.cx+LAB_LAYOUT.halfW+pad&&z>=LAB_LAYOUT.cz-LAB_LAYOUT.halfD-pad&&z<=LAB_LAYOUT.cz+LAB_LAYOUT.halfD+pad
}
function villageBoundsContains(x,z,pad=0){
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
function surfaceBlock(x,z,h=terrainHeight(x,z)){
  const road=villageGround(x,z);if(road)return road;const b=biomeAt(x,z);if(h<=WATER_LEVEL+1)return b==="pântano"?BLOCK.PEAT:b==="badlands"?BLOCK.RED_SAND:b==="salinas"?BLOCK.SALT:b==="tundra"||b==="taiga"?BLOCK.FROSTED_SOIL:BLOCK.SAND;if(b==="deserto")return BLOCK.SAND;if(b==="salinas")return hash(x,z,808)>.24?BLOCK.SALT:BLOCK.LIMESTONE;if(b==="badlands")return BLOCK.RED_SAND;if(b==="cânion calcário")return hash(x,z,124)>.35?BLOCK.LIMESTONE:BLOCK.RED_SAND;if(b==="pântano")return hash(x,z,121)>.45?BLOCK.MOSS:BLOCK.PEAT;if(b==="vulcânico")return hash(x,z,122)>.68?BLOCK.BASALT:BLOCK.ASH;if(b==="bosque de cristais"&&hash(x,z,123)>.82)return hash(x,z,125)>.6?BLOCK.AMETHYST:BLOCK.MARBLE;if(b==="tundra")return hash(x,z,126)>.22?BLOCK.SNOW:BLOCK.FROSTED_SOIL;if(h>35||b==="taiga"&&h>24||b==="prado alpino"&&h>30)return BLOCK.SNOW;if(h>29)return b==="cânion calcário"?BLOCK.LIMESTONE:b==="montanha"||b==="prado alpino"?BLOCK.SLATE:BLOCK.STONE;return BLOCK.GRASS;
}
function caveAt(x,y,z,h){
  if(y<3||y>h-3||h-y>26)return false;const worm=Math.abs(noise.n3(x*.052,y*.068,z*.052)+noise.n3(x*.024+80,y*.035,z*.024-40)*.42);return worm<.105;
}
function naturalBlock(x,y,z){
  if(y<0||y>=MAX_Y)return BLOCK.AIR;const h=terrainHeight(x,z),b=biomeAt(x,z),vent=b==="vulcânico"&&noise.n2(x*.061+720,z*.061-480)>.36;if(y>h){if(y===WATER_LEVEL&&h<WATER_LEVEL&&(b==="taiga"||b==="tundra")&&hash(x,z,707)>.12)return BLOCK.ICE;return BLOCK.AIR}if(y===0)return BLOCK.BEDROCK;if(caveAt(x,y,z,h)){if(y<=6&&noise.n3(x*.09+17,y*.11,z*.09-31)>.02)return BLOCK.LAVA;return BLOCK.AIR}
  const top=surfaceBlock(x,z,h);if(y===h){if(vent)return BLOCK.LAVA;if((top===BLOCK.SAND||top===BLOCK.RED_SAND)&&h<=WATER_LEVEL+2&&hash(x,z,221)>.94)return BLOCK.SALT;if(b==="pântano"&&hash(x,z,222)>.84)return BLOCK.CLAY;return top}if(y===h-1&&vent)return BLOCK.OBSIDIAN;if(y>h-3)return [BLOCK.SAND,BLOCK.RED_SAND,BLOCK.MUD,BLOCK.CLAY,BLOCK.SALT,BLOCK.PEAT,BLOCK.FROSTED_SOIL].includes(top)?top:top===BLOCK.SNOW?BLOCK.FROSTED_SOIL:top===BLOCK.LIMESTONE?BLOCK.LIMESTONE:BLOCK.DIRT;
  if(y<4&&hash(x,y,z)>.3)return BLOCK.BEDROCK;const ore=hash(Math.floor(x/2),Math.floor(y/2),Math.floor(z/2)),chemOre=hash(Math.floor(x/3)+41,Math.floor(y/2)-19,Math.floor(z/3)+8),rare=hash(Math.floor(x/3)-73,Math.floor(y/2)+57,Math.floor(z/3)+29);if(y<24&&ore>.966)return BLOCK.COAL;if(y<20&&ore<.026)return BLOCK.IRON;if(y<32&&chemOre>.944&&chemOre<.968)return BLOCK.COPPER;if(y<27&&chemOre>.902&&chemOre<.92)return BLOCK.SULFUR;if(y<30&&(b==="deserto"||b==="salinas"||b==="cânion calcário")&&chemOre>.875&&chemOre<.894)return BLOCK.NITER;if(y<13&&rare>.972)return BLOCK.GOLD;if(y<25&&rare<.024)return BLOCK.TIN;if(y<21&&rare>.936&&rare<.954)return BLOCK.ZINC;if((b==="bosque de cristais"||y<11)&&rare>.9&&rare<.916)return hash(x,y,z,306)>.45?BLOCK.AMETHYST:BLOCK.CRYSTAL;if(y<9&&b==="vulcânico"&&rare>.84&&rare<.87)return BLOCK.OBSIDIAN;if(y<11)return BLOCK.DEEPSTONE;if(b==="cânion calcário"&&y>h-14)return BLOCK.LIMESTONE;if((b==="montanha"||b==="prado alpino"||b==="tundra")&&y>h-11)return BLOCK.SLATE;return b==="vulcânico"&&y>h-8?BLOCK.BASALT:BLOCK.STONE;
}
function treeBlock(x,y,z){
  const mod=(n,m)=>((n%m)+m)%m,veg=settings.vegetation??2;if(inVillage(x,z,3)||labBoundsContains(x,z,LAB_PROTECTION_MARGIN)||inLabVillagePath(x,z))return BLOCK.AIR;const bx=x-mod(x-1,5),bz=z-mod(z-2,5),xs=[bx,bx+5],zs=[bz,bz+5];
  if(veg>0)for(const tx of xs)for(const tz of zs){if(Math.abs(tx-x)>4||Math.abs(tz-z)>4||inVillage(tx,tz,3)||labBoundsContains(tx,tz,LAB_PROTECTION_MARGIN+2))continue;const h=terrainHeight(tx,tz),b=biomeAt(tx,tz),seed=hash(tx>>1,tz>>1,41+WORLD_SEED%113),threshold=({floresta:.31,taiga:.37,tundra:.68,pântano:.5,savana:.57,"bosque de cerejeiras":.35,"selva tropical":.22,"prado alpino":.76,"planície florida":.82,planície:.89}[b]??2)+(veg===1?.17:0);if(seed<threshold||![BLOCK.GRASS,BLOCK.MOSS,BLOCK.FROSTED_SOIL].includes(surfaceBlock(tx,tz,h)))continue;
    const pine=b==="taiga"||b==="tundra",dry=b==="savana",cherry=b==="bosque de cerejeiras",tropical=b==="selva tropical",palm=tropical&&hash(tx,tz,819)>.48,tall=(pine?7:palm?8:tropical?6:4)+Math.floor(hash(tx,tz,51)*(pine||palm?4:3)),trunk=cherry?BLOCK.CHERRY_LOG:palm?BLOCK.PALM_LOG:pine?BLOCK.PINE_LOG:BLOCK.WOOD,leaf=cherry?BLOCK.CHERRY_LEAVES:palm?BLOCK.PALM_LEAVES:pine?BLOCK.PINE_LEAVES:dry?BLOCK.DRY_LEAVES:BLOCK.LEAVES;if(x===tx&&z===tz&&y>h&&y<=h+tall)return trunk;
    const dy=y-(h+tall),dx=x-tx,dz=z-tz;if(pine){const radius=dy<=-4?2.6:dy<=-2?2.15:dy===-1?1.65:dy===0?1.1:.35;if(dy>=-5&&dy<=1&&Math.max(Math.abs(dx),Math.abs(dz))<=radius+hash(x,y,z)*.35&&!(dx===0&&dz===0&&dy<1))return leaf}else if(palm){if(dy>=-1&&dy<=1&&(Math.abs(dx)<=3&&Math.abs(dz)<=1||Math.abs(dz)<=3&&Math.abs(dx)<=1)&&Math.abs(dx)+Math.abs(dz)>0)return leaf}else{const radius=dry?(dy===0?3.15:2.45):tropical?(dy<=-2?2.8:dy===0?3.2:2.1):(dy<=-2?2.15:dy===0?2.65:1.75);if(dy>=-2&&dy<=1&&Math.hypot(dx,dz)<=radius+.2*hash(x,y,z)&&!(dx===0&&dz===0&&dy<1))return leaf}
  }
  const h=terrainHeight(x,z),b=biomeAt(x,z),top=surfaceBlock(x,z,h);if(veg>0&&(b==="deserto"||b==="badlands"||b==="cânion calcário")&&y>h&&y<=h+3+Math.floor(hash(x,z,3)*2)&&mod(x,7)===2&&mod(z,7)===4&&hash(x,z,9)>.45+(veg===1?.2:0))return BLOCK.CACTUS;
  if(veg>0&&b==="selva tropical"&&mod(x,4)===1&&mod(z,4)===2&&hash(x,z,911)>.48&&y>h&&y<=h+3+Math.floor(hash(x,z,912)*3))return BLOCK.BAMBOO;
  if(b==="bosque de cristais"&&mod(x,8)===3&&mod(z,8)===5&&y>h&&y<=h+2+Math.floor(hash(x,z,71)*5))return y===h+1&&hash(x,z,72)>.72?BLOCK.GLOWSTONE:BLOCK.CRYSTAL;
  if(b==="vulcânico"&&mod(x,11)===6&&mod(z,11)===3&&y>h&&y<=h+1+Math.floor(hash(x,z,73)*3))return BLOCK.BASALT;
  if(b==="badlands"){const rx=mod(x,31),rz=mod(z,31),pillar=(rx===5||rx===10)&&(rz===6||rz===11);if(pillar&&y>h&&y<=h+2+Math.floor(hash(rx,rz,74)*3))return y===h+1?BLOCK.ALCHEMY_BRICK:BLOCK.MARBLE;if(y===h+1&&rx>=5&&rx<=10&&rz>=6&&rz<=11&&(rx===5||rx===10||rz===6||rz===11)&&hash(x,z,75)>.45)return BLOCK.ALCHEMY_BRICK}
  if(veg>0&&y===h+1&&[BLOCK.GRASS,BLOCK.MOSS,BLOCK.PEAT,BLOCK.FROSTED_SOIL].includes(top)){const density=veg===1?.945:.86,q=hash(x,z,91+WORLD_SEED%67);if(q>density){if(b==="tundra"||b==="prado alpino")return q>.94?BLOCK.WHITE_FLOWER:BLOCK.TALL_GRASS;if(b==="bosque de cerejeiras"||b==="planície florida")return q>.955?BLOCK.POPPY:q>.91?BLOCK.BLUE_FLOWER:BLOCK.TALL_GRASS;if(b==="pântano")return q>.95?BLOCK.BLUE_FLOWER:BLOCK.TALL_GRASS;if(b==="selva tropical")return q>.965?BLOCK.POPPY:BLOCK.TALL_GRASS;return q>.965?BLOCK.POPPY:q>.935?BLOCK.WHITE_FLOWER:BLOCK.TALL_GRASS}}
  return BLOCK.AIR;
}
function getBlock(x,y,z){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);const authored=laboratoryBlockAt(x,y,z);if(authored!==null)return authored;const k=key3(x,y,z);if(mods.has(k))return mods.get(k);if(y>=0&&y<MAX_Y){const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),ch=chunks.get(ckey(cx,cz));if(ch?.vox){const gx=x-cx*CHUNK+1,gz=z-cz*CHUNK+1;return ch.vox[voxelIndex(gx,y,gz)]}}const vb=villageBlock(x,y,z);if(vb!==BLOCK.AIR)return vb;const h=terrainHeight(x,z),n=naturalBlock(x,y,z);if(n!==BLOCK.AIR||y<=h)return n;return treeBlock(x,y,z)}
function setBlock(x,y,z,id){x=Math.floor(x);y=Math.floor(y);z=Math.floor(z);mods.set(key3(x,y,z),id);saveMods();const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK);rebuildChunk(cx,cz);if((x%CHUNK+CHUNK)%CHUNK===0)rebuildChunk(cx-1,cz);if((x%CHUNK+CHUNK)%CHUNK===CHUNK-1)rebuildChunk(cx+1,cz);if((z%CHUNK+CHUNK)%CHUNK===0)rebuildChunk(cx,cz-1);if((z%CHUNK+CHUNK)%CHUNK===CHUNK-1)rebuildChunk(cx,cz+1)}
function saveMods(){try{localStorage.qc_mods=JSON.stringify([...mods].slice(-18000))}catch(e){}}
try{if(localStorage.qc_mods)for(const [k,v] of JSON.parse(localStorage.qc_mods))mods.set(k,v)}catch(e){}
try{if(localStorage.qc_doors)for(const [k,v] of JSON.parse(localStorage.qc_doors))doorMeta.set(k,v)}catch(e){}
function saveDoorMeta(){try{localStorage.qc_doors=JSON.stringify([...doorMeta].slice(-500))}catch(e){}}

const FACES=[
  {n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],u:[0,0,1],w:[0,1,0]},
  {n:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],u:[0,0,-1],w:[0,1,0]},
  {n:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],u:[1,0,0],w:[0,0,-1]},
  {n:[0,-1,0],v:[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],u:[1,0,0],w:[0,0,1]},
  {n:[0,0,1],v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],u:[-1,0,0],w:[0,1,0]},
  {n:[0,0,-1],v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],u:[1,0,0],w:[0,1,0]}
];
const UV_CORNERS=[[0,0],[0,1],[1,1],[1,0]], TRI=[0,1,2,0,2,3];
function texFor(id,fi){const t=BDEF[id].tex;if(!Array.isArray(t))return t;return fi===2?t[0]:fi===3?t[2]:t[1]}
function solidAt(x,y,z){const b=getBlock(x,y,z);return !!(BDEF[b]&&BDEF[b].solid)}
function faceOccludes(id){const d=BDEF[id];return !!(d?.solid&&!d.alpha&&!d.partial&&!d.plant)}
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
  const flower=id!==BLOCK.TALL_GRASS,ang=hash(x,z,55)*TAU,cs=Math.cos(ang)*(flower?.31:.42),sn=Math.sin(ang)*(flower?.31:.42),h=(flower?.55:.5)+hash(x,z,57)*(flower?.18:.34),t=BDEF[id].tex,col=id===BLOCK.WHITE_FLOWER?[.96,1,1]:[1,1,1];
  const quads=[[[x-cs,y,z-sn],[x-cs,y+h,z-sn],[x+cs,y+h,z+sn],[x+cs,y,z+sn]],[[x+sn,y,z-cs],[x+sn,y+h,z-cs],[x-sn,y+h,z+cs],[x-sn,y,z+cs]]];
  for(const q of quads)addQuad(a,q,[0,1,0],t,col,ref,[.78,1,1,.78]);
}
function addCuboid(a,x,y,z,sx,sy,sz,tex,ref,color=[.86,.86,.86]){for(let fi=0;fi<6;fi++){const f=FACES[fi],verts=f.v.map(v=>[x+v[0]*sx,y+v[1]*sy,z+v[2]*sz]),shade=fi===2?1:fi===3?.62:(fi<2?.84:.75),t=[color[0]*shade,color[1]*shade,color[2]*shade];addQuad(a,verts,f.n,tex,t,{...ref,n:f.n},[1,1,1,1])}}
function addDoorGeometry(a,x,y,z,id){
  const meta=doorMeta.get(key3(x,y,z))||{axis:0,half:0,hinge:-1,swing:1},ref={x,y,z,id},open=id===BLOCK.DOOR_OPEN,axis=meta.axis??0,hinge=meta.hinge??-1,swing=meta.swing??1,lab=meta.style==="carbon";
  const tex=lab?19:15,color=lab?[.58,.92,.88]:[1,.92,.78];
  if(lab)return;
  if(axis===0&&!open){
    addCuboid(a,x+.035,y,z+.44,.93,1,.12,tex,ref,color);
    if(lab){
      addCuboid(a,x+.08,y+.06,z+.405,.84,.08,.04,45,ref,[.9,.68,.3]);
      addCuboid(a,x+.08,y+.86,z+.405,.84,.08,.04,23,ref,[.62,1,.92]);
      if((meta.half||0)===1)addCuboid(a,x+.16,y+.14,z+.397,.68,.62,.045,22,ref,[.82,1,1]);
      else{
        const hx=hinge<0?x+.77:x+.16;
        addCuboid(a,hx,y+.38,z+.39,.07,.25,.06,45,ref,[1,.78,.38]);
      }
    }
  }else if(axis===1&&!open){
    addCuboid(a,x+.44,y,z+.035,.12,1,.93,tex,ref,color);
  }else if(axis===0){
    const ox=hinge<0?x+.025:x+.855,oz=swing>0?z+.5:z+.06;
    addCuboid(a,ox,y,oz,.12,1,.88,tex,ref,color);
    if(lab&&(meta.half||0)===1)addCuboid(a,ox+(hinge<0?.008:-.014),y+.14,oz+.1,.125,.62,.66,22,ref,[.82,1,1]);
  }else{
    const oz=hinge<0?z+.025:z+.855,ox=swing>0?x+.5:x+.06;
    addCuboid(a,ox,y,oz,.88,1,.12,tex,ref,color);
  }
}
function geometryFrom(a){
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(a.p,3));g.setAttribute("normal",new THREE.Float32BufferAttribute(a.n,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(a.uv,2));g.setAttribute("color",new THREE.Float32BufferAttribute(a.c,3));g.setIndex(a.idx);g.computeBoundingSphere();return g;
}

const waterMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,uniforms:{uTime:{value:0},uQuality:{value:1},uUnderwater:{value:0},uSun:{value:new THREE.Vector3(.2,1,.1)},uDeep:{value:new THREE.Color(0x075675)},uShallow:{value:new THREE.Color(0x3fb6c4)}},vertexShader:`
  attribute float depthVal; varying float vDepth; varying vec3 vWorld; varying vec3 vNormal; uniform float uTime,uQuality;
  void main(){vec3 p=position;float w=(sin((p.x+uTime*1.2)*.42)*.045+sin((p.z-uTime*.8)*.58)*.035)*uQuality;p.y+=w;vec4 world=modelMatrix*vec4(p,1.0);vWorld=world.xyz;vDepth=depthVal;vNormal=normalize(mat3(modelMatrix)*vec3(-cos((p.x+uTime*1.2)*.42)*.018*uQuality,1.0,-cos((p.z-uTime*.8)*.58)*.02*uQuality));gl_Position=projectionMatrix*viewMatrix*world;}`,
fragmentShader:`
  uniform vec3 uSun,uDeep,uShallow; uniform float uUnderwater; varying float vDepth; varying vec3 vWorld,vNormal;
  void main(){vec3 V=normalize(cameraPosition-vWorld);vec3 N=normalize(vNormal);float facing=abs(dot(V,N));float fres=pow(1.0-clamp(facing,0.0,1.0),3.0);float spec=pow(max(dot(reflect(-normalize(uSun),N),V),0.0),72.0);vec3 col=mix(uShallow,uDeep,clamp(vDepth/12.0,0.0,1.0));float alpha=.52+fres*.19;if(uUnderwater>.5){col=mix(uDeep,uShallow,.28+fres*.2);col+=vec3(.04,.13,.16)*(1.0-facing);alpha=.34+fres*.24;}else{col=mix(col,vec3(.62,.86,.95),fres*.55)+spec*vec3(1.0,.86,.58)*1.4;}gl_FragColor=vec4(col,alpha);}`});

const lavaMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:`varying vec3 vWorld;void main(){vWorld=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec3 vWorld;uniform float uTime;void main(){float a=sin(vWorld.x*2.7+uTime*1.8)+sin(vWorld.z*3.4-uTime*1.3)+sin((vWorld.x+vWorld.z)*5.1+uTime*.7);float hot=smoothstep(-.4,1.65,a);vec3 col=mix(vec3(.32,.018,.004),vec3(1.0,.34,.015),hot);col+=pow(hot,4.0)*vec3(1.2,.62,.12);gl_FragColor=vec4(col,1.0);}`});
const GRID=CHUNK+2,GRID_COLS=GRID*GRID;
function newChunkBuild(cx,cz){return {cx,cz,k:ckey(cx,cz),phase:0,i:0,vox:new Uint8Array(GRID*GRID*MAX_Y),tops:new Uint8Array(GRID_COLS),a:arrays(),la:arrays(),wa:{p:[],n:[],uv:[],c:[],idx:[],refs:[],depth:[]}}}
function voxelIndex(gx,y,gz){return (gz*GRID+gx)*MAX_Y+y}
function fillVoxelColumn(b,i){const gx=i%GRID,gz=Math.floor(i/GRID),x=b.cx*CHUNK+gx-1,z=b.cz*CHUNK+gz-1,h=terrainHeight(x,z),top=columnGenerationTop(x,z,h);b.tops[i]=top;for(let y=0;y<=top;y++)b.vox[voxelIndex(gx,y,gz)]=getBlock(x,y,z)}
function localBlock(b,x,y,z){if(y<0||y>=MAX_Y)return BLOCK.AIR;const gx=x-b.cx*CHUNK+1,gz=z-b.cz*CHUNK+1;if(gx>=0&&gx<GRID&&gz>=0&&gz<GRID)return b.vox[voxelIndex(gx,y,gz)];return getBlock(x,y,z)}
function localSolid(b,x,y,z){return !!BDEF[localBlock(b,x,y,z)]?.solid}
function localOccludes(b,x,y,z){return faceOccludes(localBlock(b,x,y,z))}
function vertexAOLocal(b,x,y,z,f,corner){if(settings.ao===0)return 1;const uv=UV_CORNERS[corner],su=uv[0]?1:-1,sv=uv[1]?1:-1,n=f.n,u=f.u,w=f.w,p=[x+n[0],y+n[1],z+n[2]],s1=localOccludes(b,p[0]+u[0]*su,p[1]+u[1]*su,p[2]+u[2]*su),s2=localOccludes(b,p[0]+w[0]*sv,p[1]+w[1]*sv,p[2]+w[2]*sv),co=localOccludes(b,p[0]+u[0]*su+w[0]*sv,p[1]+u[1]*su+w[1]*sv,p[2]+u[2]*su+w[2]*sv),raw=s1&&s2?.53:1-(s1+s2+co)*.12;return lerp(1,raw,settings.ao===1?.55:1)}
function meshChunkColumn(b,i){
  const lx=Math.floor(i/CHUNK),lz=i%CHUNK,x=b.cx*CHUNK+lx,z=b.cz*CHUNK+lz,h=terrainHeight(x,z),scanTop=b.tops[(lz+1)*GRID+lx+1],a=b.a,wa=b.wa;
  for(let y=0;y<=scanTop;y++){const id=localBlock(b,x,y,z);if(id===BLOCK.AIR||id===BLOCK.TORCH||id===BLOCK.SPECTRAL)continue;if(BDEF[id]?.plant){addPlant(a,x+.5,y,z+.5,id,{x,y,z,id,n:[0,1,0]});continue}if(id===BLOCK.DOOR||id===BLOCK.DOOR_OPEN){addDoorGeometry(a,x,y,z,id);continue}const dest=id===BLOCK.LAVA?b.la:a;
    for(let fi=0;fi<6;fi++){const f=FACES[fi],nid=localBlock(b,x+f.n[0],y+f.n[1],z+f.n[2]);if(nid===id||faceOccludes(nid))continue;const ao=id===BLOCK.LAVA?[1,1,1,1]:f.v.map((_,q)=>vertexAOLocal(b,x,y,z,f,q)),shade=fi===2?1:fi===3?.61:(fi<2?.82:.72),leaf=[BLOCK.LEAVES,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.CHERRY_LEAVES,BLOCK.PALM_LEAVES].includes(id),tint=leaf?(id===BLOCK.PINE_LEAVES?[.67,.86,.72]:id===BLOCK.DRY_LEAVES?[.96,.9,.64]:id===BLOCK.CHERRY_LEAVES?[1,.8,.91]:id===BLOCK.PALM_LEAVES?[.68,.92,.7]:[.77+hash(x,y,z)*.11,.93,.74]):id===BLOCK.GLASS||id===BLOCK.ICE?[.78,.94,.98]:[shade,shade,shade];addQuad(dest,f.v.map(v=>[x+v[0],y+v[1],z+v[2]]),f.n,texFor(id,fi),tint,{x,y,z,id,n:f.n},ao)}
  }
  if(h<WATER_LEVEL&&localBlock(b,x,WATER_LEVEL,z)!==BLOCK.ICE){const y=WATER_LEVEL+.82,base=wa.p.length/3,d=WATER_LEVEL-h;wa.p.push(x,y,z,x+1,y,z,x+1,y,z+1,x,y,z+1);wa.n.push(0,1,0,0,1,0,0,1,0,0,1,0);wa.depth.push(d,d,d,d);for(const q of [0,2,1,0,3,2])wa.idx.push(base+q)}
}
function stepChunkBuild(b){if(b.phase===0){fillVoxelColumn(b,b.i++);if(b.i>=GRID_COLS){b.phase=1;b.i=0}return false}meshChunkColumn(b,b.i++);return b.i>=CHUNK*CHUNK}
function removeChunkMesh(old){if(!old)return;scene.remove(old.group);old.group.traverse(o=>{if(o.geometry)o.geometry.dispose()});const mi=chunkMeshes.indexOf(old.mesh);if(mi>=0)chunkMeshes.splice(mi,1)}
function finalizeChunk(b){
  removeChunkMesh(chunks.get(b.k));const group=new THREE.Group(),g=geometryFrom(b.a),mesh=new THREE.Mesh(g,terrainMat);mesh.castShadow=settings.shadows>0;mesh.receiveShadow=settings.shadows>0;mesh.userData.faceBlocks=b.a.refs;mesh.frustumCulled=true;group.add(mesh);chunkMeshes.push(mesh);
  if(b.la.p.length){const lg=geometryFrom(b.la),lm=new THREE.Mesh(lg,lavaMat);lm.renderOrder=1;group.add(lm)}if(b.wa.p.length){const wg=new THREE.BufferGeometry();wg.setAttribute("position",new THREE.Float32BufferAttribute(b.wa.p,3));wg.setAttribute("normal",new THREE.Float32BufferAttribute(b.wa.n,3));wg.setAttribute("depthVal",new THREE.Float32BufferAttribute(b.wa.depth,1));wg.setIndex(b.wa.idx);wg.computeBoundingSphere();const wm=new THREE.Mesh(wg,waterMat);wm.renderOrder=2;wm.receiveShadow=settings.shadows>0;group.add(wm)}scene.add(group);chunks.set(b.k,{group,mesh,cx:b.cx,cz:b.cz,vox:b.vox});return group;
}
function buildChunk(cx,cz){const b=newChunkBuild(cx,cz);while(!stepChunkBuild(b)){}return finalizeChunk(b)}
function rebuildChunk(cx,cz){const k=ckey(cx,cz);if(!chunks.has(k))return;if(activeBuild?.k===k)activeBuild=null;const prior=pending.find(p=>p.k===k);if(prior)prior.rebuild=true;else pending.unshift({cx,cz,k,d:-1,rebuild:true})}
function rebuildChunkImmediate(cx,cz){const k=ckey(cx,cz);if(activeBuild?.k===k)activeBuild=null;for(let i=pending.length-1;i>=0;i--)if(pending[i].k===k)pending.splice(i,1);if(chunks.has(k))buildChunk(cx,cz);else rebuildChunk(cx,cz)}
let loadTotal=1,loadDone=0,initialReady=false,activeBuild=null,centerChunk={x:999,z:999};
const PRELOAD_RADIUS=clamp(Math.round(Number(localStorage.qc_preload_radius)||4),3,6);
const BOOT_STAGES=Object.freeze([
  {id:"initializing",label:"Inicializando o mundo…",weight:.04},
  {id:"loading-save",label:"Carregando dados do mundo…",weight:.06},
  {id:"loading-assets",label:"Carregando texturas e materiais…",weight:.07},
  {id:"generating-terrain",label:"Gerando terreno inicial…",weight:.12},
  {id:"generating-laboratory",label:"Construindo o laboratório…",weight:.16},
  {id:"validating-laboratory",label:"Validando paredes do laboratório…",weight:.1},
  {id:"generating-village",label:"Preparando a vila…",weight:.1},
  {id:"generating-surroundings",label:"Carregando terreno próximo…",weight:.13},
  {id:"preparing-collisions",label:"Preparando colisões…",weight:.08},
  {id:"preparing-gameplay",label:"Preparando sistemas de química…",weight:.09},
  {id:"ready",label:"Quase pronto…",weight:.05}
]);
const worldBoot={running:false,attempt:0,stage:"idle",stageFraction:0,requiredChunks:new Map(),stageChunkKeys:new Set(),completedStages:new Set(),error:null,preferredSpawn:null,loadedState:null};
function effectivePreloadRadius(){return clamp(Math.max(PRELOAD_RADIUS,Number(settings.render)||PRELOAD_RADIUS),3,6)}
function setBootStage(id,fraction=0,detail=""){
  const index=BOOT_STAGES.findIndex(stage=>stage.id===id);if(index<0)return;
  const stage=BOOT_STAGES[index];worldBoot.stage=id;worldBoot.stageFraction=clamp(fraction,0,1);
  const completedWeight=BOOT_STAGES.slice(0,index).reduce((sum,item)=>sum+item.weight,0),progress=clamp(completedWeight+stage.weight*worldBoot.stageFraction,0,1);
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
  const radius=effectivePreloadRadius(),map=new Map(),push=q=>{const prev=map.get(q.k);if(!prev||q.d<prev.d)map.set(q.k,q)},spawnCx=Math.floor(spawn.x/CHUNK),spawnCz=Math.floor(spawn.z/CHUNK),villageCx=Math.floor(VILLAGE.x/CHUNK),villageCz=Math.floor(VILLAGE.z/CHUNK);
  for(const q of ringChunkKeys(spawnCx,spawnCz,radius))push({...q,d:q.d});
  if(worldBoot.preferredSpawn){const savedCx=Math.floor(worldBoot.preferredSpawn.x/CHUNK),savedCz=Math.floor(worldBoot.preferredSpawn.z/CHUNK);for(const q of ringChunkKeys(savedCx,savedCz,radius))push({...q,d:q.d})}
  for(const q of labChunkDescriptors())push(q);
  for(const q of ringChunkKeys(villageCx,villageCz,radius))push({...q,d:q.d+1});
  return [...map.values()]
}
function introChunkDescriptors(){return initialPreloadDescriptors()}
function introChunksReady(){return initialPreloadDescriptors().every(q=>chunks.has(q.k))}
function safeSpawnCandidate(x,z){
  const ix=Math.floor(x),iz=Math.floor(z),chunkReady=chunks.has(ckey(Math.floor(ix/CHUNK),Math.floor(iz/CHUNK)));if(!chunkReady)return null;
  const naturalSurface=terrainHeight(ix,iz),y=findStandingY(x,z,Math.max(LAB_LAYOUT.y,naturalSurface+2)),floorId=getBlock(ix,Math.floor(y)-1,iz),feetId=getBlock(ix,Math.floor(y),iz),headId=getBlock(ix,Math.floor(y)+1,iz),authoredArea=labBoundsContains(ix,iz,LAB_PROTECTION_MARGIN)||inLabEntranceCorridor(ix,iz,1)||inLabVillagePath(ix,iz)||inVillage(ix,iz,2);
  if(!BDEF[floorId]?.solid||[BLOCK.GLASS,BLOCK.ICE,BLOCK.LAVA].includes(floorId)||BDEF[feetId]?.solid||BDEF[headId]?.solid||BDEF[feetId]?.liquid||BDEF[headId]?.liquid||(naturalSurface<WATER_LEVEL&&y<=WATER_LEVEL+1.02)||(!authoredArea&&y<naturalSurface+.99))return null;
  const r=.31;if(aabbHitsLabDecor(x-r,x+r,y+.02,y+1.74,z-r,z+r))return null;
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
  chatMessage("GUARDIÃ ÍRIS","A Vila dos Elementos fica a leste, perto de X 48 · Z −22. Há vinte casas e cinco lojas.",{category:"dialogue"});
  chatMessage("SISTEMA","Fome e sede agora diminuem durante a exploração. Fabrique copos ou baldes, colete água nos lagos e asse carnes em um forno abastecido com carvão.",{category:"system"});
}
function enterLoadedWorld(){
  if(!state.started||state.loading||!state.awaitingEntry)return;
  state.awaitingEntry=false;state.paused=false;$("loaderReady").hidden=true;$("loading").classList.add("hidden");$("hud").classList.add("visible");setTimeout(()=>$("controls").classList.add("hide"),12000);requestPointer({notify:true})
}
function ensureChunks(force=false){
  const cx=Math.floor(player.pos.x/CHUNK),cz=Math.floor(player.pos.z/CHUNK),rd=settings.render;if(!force&&cx===centerChunk.x&&cz===centerChunk.z)return;centerChunk={x:cx,z:cz};
  const wanted=new Map(),push=q=>{if(!wanted.has(q.k)||q.d<wanted.get(q.k).d)wanted.set(q.k,q)};
  if(worldBoot.running||!initialReady){for(const q of worldBoot.requiredChunks.values())push(q)}
  else for(let dz=-rd;dz<=rd;dz++)for(let dx=-rd;dx<=rd;dx++)push({cx:cx+dx,cz:cz+dz,k:ckey(cx+dx,cz+dz),d:dx*dx+dz*dz});
  for(const q of labChunkDescriptors())push(q);
  const wantedKeys=new Set(wanted.keys()),todo=[];for(const q of wanted.values())if(!chunks.has(q.k)&&!pending.some(p=>p.k===q.k))todo.push(q);
  wantedChunks=wantedKeys;for(let i=pending.length-1;i>=0;i--)if(!wantedKeys.has(pending[i].k))pending.splice(i,1);todo.sort((a,b)=>a.d-b.d);pending.push(...todo);loadTotal=Math.max(1,wantedKeys.size);loadDone=loadTotal-pending.length;
  for(const [k,ch] of chunks)if(!wantedKeys.has(k)){removeChunkMesh(ch);chunks.delete(k)}
}
function processChunks(){
  if(activeBuild&&!wantedChunks.has(activeBuild.k))activeBuild=null;const start=performance.now(),budget=worldBoot.running?15:state.fps>56?5.2:state.fps>47?3.4:1.6;while(performance.now()-start<budget){if(!activeBuild){let p;while(pending.length&&!p){const q=pending.shift();if(wantedChunks.has(q.k)&&(!chunks.has(q.k)||q.rebuild))p=q}if(!p)break;activeBuild=newChunkBuild(p.cx,p.cz)}if(stepChunkBuild(activeBuild)){finalizeChunk(activeBuild);loadDone++;activeBuild=null}}
  if(worldBoot.running)updateBootChunkProgress()
}

// Procedural sky, celestial bodies and clouds.
// Procedural sky, celestial bodies and clouds.
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uTime:{value:.25}},vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
  varying vec3 vPos;uniform float uTime;vec3 noonTop=vec3(.12,.48,.78),noonHor=vec3(.62,.82,.93),nightTop=vec3(.008,.018,.07),nightHor=vec3(.035,.08,.15);
  void main(){float h=normalize(vPos).y*.5+.5;float sun=max(sin(uTime*6.28318),-.15);float day=smoothstep(-.16,.15,sun);float dusk=pow(1.0-abs(clamp(sun,-1.0,1.0)),7.0);vec3 top=mix(nightTop,noonTop,day),hor=mix(nightHor,noonHor,day);hor+=vec3(.72,.20,.08)*dusk;vec3 c=mix(hor,top,pow(h,.7));gl_FragColor=vec4(c,1.0);}`});
const sky=new THREE.Mesh(new THREE.SphereGeometry(220,32,16),skyMat);scene.add(sky);
const sunOrb=new THREE.Mesh(new THREE.SphereGeometry(4.3,20,12),new THREE.MeshBasicMaterial({color:0xffe0a0,fog:false}));const moonOrb=new THREE.Mesh(new THREE.SphereGeometry(3.1,20,12),new THREE.MeshBasicMaterial({color:0xd8e8f7,fog:false}));scene.add(sunOrb,moonOrb);
const starGeo=new THREE.BufferGeometry(),starP=[];for(let i=0;i<900;i++){const th=hash(i,1)*TAU,ph=Math.acos(lerp(-.05,1,hash(i,2)));starP.push(Math.sin(ph)*Math.cos(th)*190,Math.cos(ph)*190,Math.sin(ph)*Math.sin(th)*190)}starGeo.setAttribute("position",new THREE.Float32BufferAttribute(starP,3));const starMat=new THREE.PointsMaterial({color:0xdbeaff,size:.62,sizeAttenuation:true,transparent:true,opacity:0,fog:false,depthWrite:false});const stars=new THREE.Points(starGeo,starMat);scene.add(stars);
function cloudTexture(){const c=document.createElement("canvas");c.width=128;c.height=64;const x=c.getContext("2d"),g=x.createRadialGradient(64,32,2,64,32,62);g.addColorStop(0,"rgba(255,255,255,.86)");g.addColorStop(.45,"rgba(245,250,252,.66)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,128,64);for(let i=0;i<14;i++){const r=8+hash(i,8)*16;x.fillStyle=`rgba(255,255,255,${.05+hash(i,9)*.12})`;x.beginPath();x.arc(hash(i,10)*128,hash(i,11)*64,r,0,TAU);x.fill()}return new THREE.CanvasTexture(c)}
const cloudGroup=new THREE.Group(),cloudTex=cloudTexture();for(let i=0;i<34;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,transparent:true,opacity:.20+hash(i,2)*.16,depthWrite:false,fog:true,color:0xffffff}));m.position.set((hash(i,3)-.5)*260,45+hash(i,4)*28,(hash(i,5)-.5)*260);m.scale.set(25+hash(i,6)*36,8+hash(i,7)*10,1);cloudGroup.add(m)}scene.add(cloudGroup);

const LAB_PROTECTION_MARGIN=4,LAB_ENTRANCE_LENGTH=12,LAB_VALIDATION_VERSION=60;
const LAB_LAYOUT={cx:-6,cz:-6,halfW:18,halfD:14,height:12};
function determineLaboratoryElevation(layout){
  const heights=[];
  for(let x=layout.cx-layout.halfW-LAB_PROTECTION_MARGIN;x<=layout.cx+layout.halfW+LAB_PROTECTION_MARGIN;x++){
    for(let z=layout.cz-layout.halfD-LAB_PROTECTION_MARGIN;z<=layout.cz+layout.halfD+LAB_PROTECTION_MARGIN;z++)heights.push(terrainHeight(x,z))
  }
  heights.sort((a,b)=>a-b);
  const percentile=p=>heights[Math.min(heights.length-1,Math.max(0,Math.floor((heights.length-1)*p)))],minimum=heights[0],maximum=heights[heights.length-1],median=percentile(.5),upper=percentile(.75),maxBase=MAX_Y-layout.height-3;
  return {minimum,maximum,median,upper,base:Math.round(clamp(upper+1,WATER_LEVEL+4,maxBase)),sampleCount:heights.length}
}
LAB_LAYOUT.terrain=determineLaboratoryElevation(LAB_LAYOUT);
LAB_LAYOUT.y=LAB_LAYOUT.terrain.base;
LAB_LAYOUT.entranceSurfaces=new Map();
{
  const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD,startSurface=LAB_LAYOUT.y-1,endZ=front-LAB_ENTRANCE_LENGTH,endSurface=clamp(terrainHeight(LAB_LAYOUT.cx,endZ),startSurface-8,startSurface+3);
  let previous=startSurface;
  for(let step=1;step<=LAB_ENTRANCE_LENGTH;step++){
    const z=front-step,target=Math.round(lerp(startSurface,endSurface,step/LAB_ENTRANCE_LENGTH)),surface=clamp(target,previous-1,previous+1);
    LAB_LAYOUT.entranceSurfaces.set(z,surface);previous=surface
  }
}
LAB_LAYOUT.villagePathSurfaces=new Map();
{
  const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD,startZ=front-LAB_ENTRANCE_LENGTH,targetX=VILLAGE.x-27,targetZ=VILLAGE.z,centers=[];
  for(let x=LAB_LAYOUT.cx+1;x<=targetX;x++)centers.push({x,z:startZ,axis:"x"});
  const zDirection=Math.sign(targetZ-startZ)||1;for(let z=startZ+zDirection;z!==targetZ+zDirection;z+=zDirection)centers.push({x:targetX,z,axis:"z"});
  let previous=LAB_LAYOUT.entranceSurfaces.get(startZ)??LAB_LAYOUT.y-1;centers.forEach((center,index)=>{
    const target=Math.round(lerp(previous,VILLAGE.base,1/(centers.length-index))),surface=clamp(target,previous-1,previous+1),cross=center.axis==="x"?[[0,-1],[0,0],[0,1]]:[[-1,0],[0,0],[1,0]];
    for(const [dx,dz] of cross)LAB_LAYOUT.villagePathSurfaces.set(`${center.x+dx},${center.z+dz}`,surface);
    previous=surface
  })
}
const spawn={x:LAB_LAYOUT.cx+.5,z:LAB_LAYOUT.cz-LAB_LAYOUT.halfD-LAB_ENTRANCE_LENGTH+.5};
spawn.y=(LAB_LAYOUT.entranceSurfaces.get(Math.floor(spawn.z))??LAB_LAYOUT.y-1)+1.02;
const PERIODIC_STATION={x:LAB_LAYOUT.cx,z:LAB_LAYOUT.cz+LAB_LAYOUT.halfD-2.9};
let labDecorRoot=null,periodicWallRoot=null,labAtomRoot=null,labCryoCore=null,labDoorVisualRoot=null;
const labRepairOverrides=new Map(),labCollisionBoxes=[],periodicCollisionBoxes=[],labStationZones=[],labPropPlacements=[];const labColliderIds=new Set(),periodicColliderIds=new Set();let labProtectToastAt=0;
function labStructureBounds(pad=0){return {left:LAB_LAYOUT.cx-LAB_LAYOUT.halfW-pad,right:LAB_LAYOUT.cx+LAB_LAYOUT.halfW+pad,front:LAB_LAYOUT.cz-LAB_LAYOUT.halfD-pad,rear:LAB_LAYOUT.cz+LAB_LAYOUT.halfD+pad,bottom:0,top:LAB_LAYOUT.y+LAB_LAYOUT.height+2}}
function inLabEntranceCorridor(x,z,pad=0){const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD;return x>=LAB_LAYOUT.cx-4-pad&&x<=LAB_LAYOUT.cx+3+pad&&z<=front-1+pad&&z>=front-LAB_ENTRANCE_LENGTH-pad}
function labVillagePathSurface(x,z){const value=LAB_LAYOUT.villagePathSurfaces.get(`${Math.floor(x)},${Math.floor(z)}`);return value===undefined?null:value}
function inLabVillagePath(x,z){return labVillagePathSurface(x,z)!==null}
function laboratoryBlockAt(x,y,z){
  const repair=labRepairOverrides.get(key3(x,y,z));if(repair!==undefined)return repair;
  if(y<0||y>=MAX_Y)return null;
  const core=labBoundsContains(x,z,0),protectedArea=labBoundsContains(x,z,LAB_PROTECTION_MARGIN),corridor=inLabEntranceCorridor(x,z,0),villagePathSurface=labVillagePathSurface(x,z);
  if(!core&&!protectedArea&&!corridor&&villagePathSurface===null)return null;
  if(y===0)return BLOCK.BEDROCK;
  if(villagePathSurface!==null&&!corridor&&!core){
    if(y<villagePathSurface)return BLOCK.DEEPSTONE;if(y===villagePathSurface)return BLOCK.VILLAGE_BRICK;return BLOCK.AIR
  }
  if(corridor){
    const surface=LAB_LAYOUT.entranceSurfaces.get(z);if(surface===undefined)return null;
    if(y<surface)return BLOCK.DEEPSTONE;if(y===surface)return BLOCK.ALCHEMY_BRICK;return BLOCK.AIR
  }
  const {cx,cz,halfW,halfD,height}=LAB_LAYOUT,floorY=LAB_LAYOUT.y,roofY=floorY+height,left=cx-halfW,right=cx+halfW,front=cz-halfD,rear=cz+halfD;
  if(y<floorY-1)return BLOCK.DEEPSTONE;
  if(y===floorY-1){
    if(!core)return BLOCK.SLATE;
    const edge=x===left||x===right||z===front||z===rear,checker=((x-cx)+(z-cz))&1;return edge?BLOCK.SLATE:(checker?BLOCK.MARBLE:BLOCK.ALCHEMY_BRICK)
  }
  if(!core)return BLOCK.AIR;
  if(y>roofY)return BLOCK.AIR;
  if(y===roofY){const skylight=Math.abs(x-cx)<=12&&[0,1,2].includes(Math.abs((z-cz)%5))&&Math.abs(z-cz)<halfD-1;return skylight?BLOCK.GLASS:BLOCK.SLATE}
  const level=y-floorY,onFront=z===front,onRear=z===rear,onSide=x===left||x===right;
  if(onFront||onRear){
    const doorCell=onFront&&x>=cx-2&&x<=cx+1&&level<=2;
    if(doorCell){const stored=mods.get(key3(x,y,z));return stored===BLOCK.DOOR_OPEN?BLOCK.DOOR_OPEN:BLOCK.DOOR}
    const transom=onFront&&x>=cx-2&&x<=cx+1&&level===3,frontWindow=onFront&&level>=3&&level<=8&&Math.abs(x-cx)>5&&Math.abs(x-cx)<halfW-1,backTable=onRear&&Math.abs(x-cx)<=11;
    return transom||frontWindow?BLOCK.GLASS:(backTable?BLOCK.SLATE:(level===0?BLOCK.SLATE:BLOCK.MARBLE))
  }
  if(onSide){const window=level>=2&&level<=8&&z>front+2&&z<rear-2&&((z-front)%4!==0);return window?BLOCK.GLASS:(level===0?BLOCK.SLATE:BLOCK.MARBLE)}
  return BLOCK.AIR
}
function columnGenerationTop(x,z,naturalHeight){
  let top=Math.min(MAX_Y-1,naturalHeight+13);
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
const keys={},settings={preset:"high",render:5,sense:.5,volume:.7,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:2},state={playing:false,started:false,startQueued:false,loading:false,awaitingEntry:false,inventory:false,chemistry:false,periodic:false,shop:false,character:false,chat:false,devOpen:false,graphics:false,history:false,professor:false,scientificNotebook:false,researchTree:false,scienceStation:false,paused:false,selected:0,left:false,right:false,target:null,breakKey:"",breakTime:0,cameraMode:0,day:.23,dayCount:1,lastFrame:performance.now(),fps:60,frames:0,fpsTime:0};
const touchInput=matchMedia("(hover: none), (pointer: coarse)").matches;
state.attackAnim=0;state.combatTarget=null;state.combatTargetTime=0;
const dev={fly:false,speed:1,infinite:false,allRecipes:false};
let messageCenter=null,elementMissions=null,scienceSystem=null,scienceUI=null,scienceSnapshot=null,lastMissionBiome="",scienceHudClock=0,environmentScanClock=0,cachedEnvironmentHazards=null;
try{Object.assign(settings,JSON.parse(localStorage.qc_settings||"{}"))}catch(e){}
$("qualityPreset").value=settings.preset;$("renderDistance").value=settings.render;$("shadowQuality").value=settings.shadows;$("aoQuality").value=settings.ao;$("waterQuality").value=settings.water;$("particleQuality").value=settings.particles;$("vegetationQuality").value=settings.vegetation;$("resolutionScale").value=settings.resolution;$("cloudToggle").checked=settings.clouds;$("mobDensity").value=settings.mobs;$("sensitivity").value=Math.round(settings.sense*100);$("volume").value=Math.round(settings.volume*100);

const skinMat=new THREE.MeshLambertMaterial({color:0xb87550}),skinLightMat=new THREE.MeshLambertMaterial({color:0xd79a73}),skinShadeMat=new THREE.MeshLambertMaterial({color:0x9e5d43}),sleeveMat=new THREE.MeshLambertMaterial({color:0x2f7c72}),coatMat=new THREE.MeshLambertMaterial({color:0xe7ece8}),coatShadeMat=new THREE.MeshLambertMaterial({color:0xbccbc5}),pantsMat=new THREE.MeshLambertMaterial({color:0x273e49}),hairMat=new THREE.MeshLambertMaterial({color:0x382921}),bootMat=new THREE.MeshLambertMaterial({color:0x20282b}),eyeMat=new THREE.MeshBasicMaterial({color:0x182024}),metalMat=new THREE.MeshStandardMaterial({color:0xc7d0d4,roughness:.28,metalness:.7,emissive:0x101416}),windMat=new THREE.MeshStandardMaterial({color:0x59ced9,roughness:.16,metalness:.22,emissive:0x19555c,emissiveIntensity:1.15}),leatherMat=new THREE.MeshLambertMaterial({color:0x8d5c36}),goldMat=new THREE.MeshStandardMaterial({color:0xd9b34f,roughness:.25,metalness:.72,emissive:0x302309}),woodLightMat=new THREE.MeshLambertMaterial({color:0xb77a42}),woodDarkMat=new THREE.MeshLambertMaterial({color:0x54341f}),brassMat=new THREE.MeshStandardMaterial({color:0xe1bd62,roughness:.22,metalness:.8}),stringMat=new THREE.MeshLambertMaterial({color:0xe8e1cf}),windGlassMat=new THREE.MeshStandardMaterial({color:0x90f7ff,roughness:.05,metalness:.08,emissive:0x1f7f8c,emissiveIntensity:1.65,transparent:true,opacity:.88});
const pSkinMat=skinMat.clone(),pSkinLightMat=skinLightMat.clone(),pSkinShadeMat=skinShadeMat.clone(),pSleeveMat=sleeveMat.clone(),pCoatMat=coatMat.clone(),pCoatShadeMat=coatShadeMat.clone(),pPantsMat=pantsMat.clone(),pHairMat=hairMat.clone();
const cubeGeo=new THREE.BoxGeometry(BLOCK_SIZE,BLOCK_SIZE,BLOCK_SIZE),unitY=new THREE.Vector3(0,1,0);function part(parent,mat,pos,scale,rot=[0,0,0]){const m=new THREE.Mesh(cubeGeo,mat);m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);m.castShadow=settings.shadows>0;m.receiveShadow=settings.shadows>0;parent.add(m);return m}
function beam(parent,mat,a,b,width=.04,depth=width){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),dir=bv.clone().sub(av),m=new THREE.Mesh(cubeGeo,mat);m.position.copy(av).add(bv).multiplyScalar(.5);m.scale.set(width,dir.length(),depth);m.quaternion.setFromUnitVectors(unitY,dir.normalize());m.castShadow=settings.shadows>0;m.receiveShadow=settings.shadows>0;parent.add(m);return m}
function weaponModel(id,first=false){
  const g=new THREE.Group(),s=first?1:.72;g.userData.kind=id;g.userData.rings=[];
  if(id==="wind_staff"){
    part(g,woodDarkMat,[0,.12,0],[.105,1.02,.105],[0,0,-.13]);part(g,woodLightMat,[-.035,.18,-.096],[.035,.86,.025],[0,0,-.13]);
    for(let i=0;i<6;i++)part(g,leatherMat,[.018,-.23+i*.09,-.005],[.124,.035,.124],[0,0,-.13]);for(let i=0;i<3;i++)part(g,i===1?brassMat:windGlassMat,[-.085,.08+i*.19,-.105],[.035,.06,.018],[0,0,-.13]);
    part(g,brassMat,[.08,-.43,0],[.15,.12,.15],[0,0,-.13]);part(g,brassMat,[-.055,.64,0],[.23,.09,.19],[0,0,-.13]);
    const crown=new THREE.Group();crown.position.set(-.11,.79,0);g.add(crown);for(const sx of [-1,1]){beam(crown,brassMat,[sx*.05,-.12,0],[sx*.23,.17,0],.055,.07);part(crown,windGlassMat,[sx*.25,.2,0],[.065,.12,.065],[0,0,sx*.35])}beam(crown,brassMat,[0,-.13,.04],[0,.18,.18],.05,.06);
    const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.205,1),windGlassMat);gem.name="windCore";gem.position.set(0,.16,0);gem.rotation.z=.35;gem.castShadow=true;crown.add(gem);g.userData.core=gem;
    for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.255+i*.035,.014+i*.003,6,18),i===1?brassMat:windMat);ring.name="windRing";ring.position.set(-.11,.95,0);ring.rotation.set(Math.PI/2+i*.52,i*.35,0);ring.userData.phase=i*2.1;g.add(ring);g.userData.rings.push(ring)}
  }else if(id==="bow"){
    const upper=[[0,.07,0],[.11,.23,0],[.22,.44,0],[.29,.69,0]],lower=upper.map(p=>[p[0],-p[1],p[2]]);for(const curve of [upper,lower])for(let i=0;i<curve.length-1;i++){beam(g,woodDarkMat,curve[i],curve[i+1],.09,.075);beam(g,woodLightMat,[curve[i][0]-.018,curve[i][1],-.042],[curve[i+1][0]-.018,curve[i+1][1],-.042],.035,.018)}
    part(g,leatherMat,[-.01,0,0],[.13,.24,.12]);for(const y of [-.09,-.03,.03,.09])part(g,stringMat,[-.015,y,-.065],[.145,.018,.018],[0,0,.16]);part(g,brassMat,[.18,.56,0],[.12,.055,.1],[0,0,-.35]);part(g,brassMat,[.18,-.56,0],[.12,.055,.1],[0,0,.35]);
    const stringRoot=new THREE.Group();stringRoot.name="bowStringRoot";g.add(stringRoot);beam(stringRoot,stringMat,[.29,.69,0],[-.06,0,-.16],.014,.014);beam(stringRoot,stringMat,[-.06,0,-.16],[.29,-.69,0],.014,.014);g.userData.string=stringRoot;
    const arrow=new THREE.Group();arrow.name="nockedArrow";arrow.position.set(-.055,.01,-.17);g.add(arrow);beam(arrow,woodLightMat,[0,0,-.47],[0,0,.37],.018,.018);const tip=new THREE.Mesh(new THREE.OctahedronGeometry(.055,0),metalMat);tip.position.z=-.51;tip.scale.z=1.45;arrow.add(tip);for(const sx of [-1,1])part(arrow,sx<0?sleeveMat:coatShadeMat,[sx*.035,0,.32],[.025,.08,.13],[0,0,sx*.28]);g.userData.arrow=arrow;
  }else if(id==="iron_sword"){part(g,metalMat,[0,.35,0],[.105,.72,.045]);part(g,new THREE.MeshStandardMaterial({color:0xe8eef0,roughness:.18,metalness:.8}),[0,.78,0],[.05,.18,.025]);part(g,goldMat,[0,-.04,0],[.42,.07,.12]);part(g,leatherMat,[0,-.3,0],[.09,.28,.09]);part(g,goldMat,[0,-.49,0],[.14,.1,.14])}else if(typeof id==="number"){part(g,new THREE.MeshLambertMaterial({color:new THREE.Color(itemColor(id))}),[0,.15,0],[.32,.32,.32])}
  g.scale.setScalar(s);return g
}
function animateWeapon(model,now,attack){if(!model)return;if(model.userData.core){model.userData.core.rotation.y=now*.0022;const p=1+Math.sin(now*.006)*.07;model.userData.core.scale.setScalar(p)}for(const r of model.userData.rings||[]){r.rotation.z=now*.0012+r.userData.phase;r.rotation.y+=.006}if(model.userData.arrow)model.userData.arrow.position.z=-.17-attack*.08}
scene.add(camera);const firstHands=new THREE.Group();camera.add(firstHands);const leftHand=new THREE.Group(),rightHand=new THREE.Group();firstHands.add(leftHand,rightHand);leftHand.position.set(-.48,-.48,-.78);rightHand.position.set(.48,-.48,-.78);for(const hand of [leftHand,rightHand]){part(hand,pSleeveMat,[0,.14,0],[.23,.4,.25]);part(hand,pCoatShadeMat,[0,-.045,0],[.245,.105,.265]);part(hand,pSkinLightMat,[0,-.23,-.03],[.205,.22,.225]);part(hand,pSkinShadeMat,[0,-.345,-.055],[.21,.055,.23]);for(let f=-1;f<=1;f++)part(hand,pSkinMat,[f*.065,-.255,-.145],[.048,.18,.055],[.08,0,0])}leftHand.rotation.z=-.12;rightHand.rotation.z=.12;const heldFirst=new THREE.Group();heldFirst.position.set(.025,-.18,-.04);heldFirst.rotation.set(-.2,0,-.25);rightHand.add(heldFirst);
const playerBody=new THREE.Group();scene.add(playerBody);const bodyTorso=part(playerBody,pCoatMat,[0,1.16,0],[.6,.72,.31]);part(playerBody,pCoatShadeMat,[0,1.16,-.325],[.54,.61,.035]);part(playerBody,pSleeveMat,[0,1.12,-.365],[.2,.21,.028]);part(playerBody,leatherMat,[0,.84,-.35],[.61,.09,.065]);part(playerBody,brassMat,[0,.84,-.42],[.1,.13,.045]);part(playerBody,pSleeveMat,[-.18,1.31,-.365],[.055,.42,.028],[0,0,-.34]);part(playerBody,pSleeveMat,[.18,1.31,-.365],[.055,.42,.028],[0,0,.34]);for(const x of [-.16,.16])part(playerBody,brassMat,[x,1.17,-.39],[.05,.05,.025]);part(playerBody,woodDarkMat,[0,1.12,.35],[.48,.55,.14]);part(playerBody,leatherMat,[-.24,1.16,.5],[.075,.62,.055],[0,0,-.08]);part(playerBody,leatherMat,[.24,1.16,.5],[.075,.62,.055],[0,0,.08]);part(playerBody,windGlassMat,[0,1.23,.505],[.16,.2,.035]);
const playerHairStyles=[],bodyHeadGroup=new THREE.Group();bodyHeadGroup.position.set(0,1.81,0);playerBody.add(bodyHeadGroup);part(bodyHeadGroup,pSkinMat,[0,0,0],[.43,.43,.43]);
function hairPart(group,pos,scale,rot=[0,0,0]){return part(group,pHairMat,pos,scale,rot)}
function addHairStyle(name,builder){const group=new THREE.Group();group.name=`player-hair-${name}`;group.visible=false;bodyHeadGroup.add(group);builder(group);playerHairStyles.push(group);return group}
addHairStyle("short",g=>{hairPart(g,[0,.285,.02],[.47,.15,.47]);hairPart(g,[0,.18,.405],[.4,.17,.08]);for(const sx of [-1,1])hairPart(g,[sx*.39,.13,.02],[.07,.25,.4]);hairPart(g,[-.2,.17,-.445],[.15,.1,.035],[0,0,.08]);hairPart(g,[0,.15,-.448],[.17,.11,.035]);hairPart(g,[.2,.17,-.445],[.15,.1,.035],[0,0,-.08])});
addHairStyle("long",g=>{hairPart(g,[0,.285,.02],[.48,.16,.48]);hairPart(g,[0,-.09,.4],[.4,.72,.1]);for(const sx of [-1,1]){hairPart(g,[sx*.39,-.07,.02],[.09,.68,.42]);hairPart(g,[sx*.3,-.09,-.44],[.08,.58,.04],[0,0,sx*.035])}hairPart(g,[-.18,.16,-.446],[.18,.12,.035],[0,0,.07]);hairPart(g,[.04,.145,-.449],[.17,.13,.035]);hairPart(g,[.22,.17,-.446],[.13,.1,.035],[0,0,-.08])});
addHairStyle("bun",g=>{hairPart(g,[0,.28,.02],[.47,.15,.47]);hairPart(g,[0,.16,.405],[.38,.18,.08]);for(const sx of [-1,1])hairPart(g,[sx*.39,.12,.02],[.07,.27,.4]);hairPart(g,[0,.5,.2],[.28,.28,.28],[.08,.18,.12]);hairPart(g,[-.14,.46,.21],[.14,.2,.2],[.12,0,-.2]);hairPart(g,[.14,.46,.21],[.14,.2,.2],[-.12,0,.2])});
addHairStyle("mohawk",g=>{const segments=[[-.34,.27,-.22],[-.18,.36,-.1],[0,.46,0],[.18,.38,.1],[.34,.29,.2]];for(const [z,h,tilt] of segments)hairPart(g,[0,.31+h*.48,z],[.15,h,.14],[tilt,0,0])});
for(const sx of [-1,1]){part(bodyHeadGroup,pSkinLightMat,[sx*.45,.01,0],[.055,.13,.12]);part(bodyHeadGroup,eyeMat,[sx*.15,.055,-.438],[.07,.055,.025]);part(bodyHeadGroup,pHairMat,[sx*.15,.145,-.444],[.12,.025,.025],[0,0,sx*.08])}part(bodyHeadGroup,pSkinLightMat,[0,-.005,-.465],[.07,.105,.045]);part(bodyHeadGroup,pSkinShadeMat,[0,-.15,-.45],[.11,.045,.025]);
function playerArm(x){const g=new THREE.Group();g.position.set(x,1.52,0);playerBody.add(g);part(g,pSleeveMat,[0,-.17,0],[.225,.38,.24]);part(g,pCoatShadeMat,[0,-.36,0],[.235,.08,.25]);part(g,pSkinLightMat,[0,-.53,-.02],[.2,.27,.22]);part(g,pSkinShadeMat,[0,-.68,-.06],[.205,.05,.225]);return g}const bodyArmL=playerArm(-.44),bodyArmR=playerArm(.44);
function playerLeg(x){const g=new THREE.Group();g.position.set(x,.84,0);playerBody.add(g);part(g,pPantsMat,[0,-.28,0],[.245,.45,.26]);part(g,pCoatShadeMat,[0,-.49,-.06],[.26,.1,.28]);part(g,bootMat,[0,-.68,-.055],[.27,.28,.34]);part(g,metalMat,[0,-.69,-.235],[.16,.06,.035]);return g}const bodyLegL=playerLeg(-.17),bodyLegR=playerLeg(.17);const equipmentVisualRoot=new THREE.Group();playerBody.add(equipmentVisualRoot);const heldThird=new THREE.Group();heldThird.position.set(.56,1.03,-.2);heldThird.rotation.set(.1,0,-.28);playerBody.add(heldThird);
let heldId=Symbol("none"),firstWeaponModel=null,thirdWeaponModel=null;function refreshHeldItem(){const id=invSlots?.[state.selected]?.id;if(id===heldId)return;heldId=id;heldFirst.clear();heldThird.clear();firstWeaponModel=thirdWeaponModel=null;if(id!==undefined){firstWeaponModel=weaponModel(id,true);thirdWeaponModel=weaponModel(id,false);heldFirst.add(firstWeaponModel);heldThird.add(thirdWeaponModel)}}
function cameraClear(from,to){const steps=12;for(let i=2;i<=steps;i++){const p=from.clone().lerp(to,i/steps);if(solidAt(p.x,p.y,p.z))return from.clone().lerp(to,(i-2)/steps)}return to}
function updatePlayerCamera(dt,moving){
  const now=performance.now(),reducedMotion=document.documentElement.classList.contains("reduced-motion"),motionScale=reducedMotion ? .18 : 1,eye=new THREE.Vector3(player.pos.x,player.pos.y+(player.crouch?1.1:1.57),player.pos.z),dir=new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch));camera.fov=lerp(camera.fov,reducedMotion?73:player.sprint?82:73,1-Math.pow(.002,dt));camera.updateProjectionMatrix();playerBody.position.set(player.pos.x,player.pos.y-(player.crouch?.24:0),player.pos.z);playerBody.rotation.y=player.yaw;playerBody.visible=state.started&&state.cameraMode!==0;firstHands.visible=state.started&&state.cameraMode===0;
  if(state.cameraMode===0){camera.position.copy(eye);camera.rotation.set(player.pitch,player.yaw,0)}else{const front=state.cameraMode===2,desired=eye.clone().addScaledVector(dir,front?4.2:-4.2);desired.y+=.65;camera.position.copy(cameraClear(eye,desired));camera.lookAt(eye.clone().add(new THREE.Vector3(0,.05,0)))}
  state.attackAnim=Math.max(0,state.attackAnim-dt);const bob=(moving?Math.sin(player.step*13)*.025:Math.sin(now*.0018)*.004)*motionScale,swing=(moving?Math.sin(player.step*8)*.34:Math.sin(now*.0015)*.018)*motionScale,attack=state.attackAnim>0?Math.sin((1-state.attackAnim/.3)*Math.PI):0;firstHands.position.y=lerp(firstHands.position.y,bob,.18);firstHands.rotation.z=lerp(firstHands.rotation.z,moving?Math.sin(player.step*6)*.012*motionScale:0,.14);leftHand.rotation.x=lerp(leftHand.rotation.x,-swing*.38,.2);rightHand.rotation.x=lerp(rightHand.rotation.x,attack?-1.35*attack:swing*.38,.24);rightHand.rotation.z=.12-attack*.38;heldFirst.rotation.y=attack*.38;heldThird.rotation.x=.1-attack*.72;bodyArmL.rotation.x=-swing;bodyArmR.rotation.x=swing-attack*1.5;bodyLegL.rotation.x=swing;bodyLegR.rotation.x=-swing;bodyHeadGroup.rotation.x=lerp(bodyHeadGroup.rotation.x,clamp(player.pitch*.28,-.22,.22),.15);bodyTorso.rotation.z=moving?Math.sin(player.step*8)*.014*motionScale:0;animateWeapon(firstWeaponModel,now,attack);animateWeapon(thirdWeaponModel,now,attack);
}
function cycleCamera(){state.cameraMode=(state.cameraMode+1)%3;const names=["1ª PESSOA · MÃOS","3ª PESSOA · COSTAS","3ª PESSOA · FRENTE"];$("viewChip").textContent=`C · ${names[state.cameraMode]}`;toast(`Câmera: ${names[state.cameraMode]}`)}

const CHARACTER_OPTIONS={skin:["#f1c7a6","#d99a73","#b87550","#986044","#754532","#4e3026"],hair:["#17181b","#382921","#6d432d","#a86b3d","#d0aa70","#6a2f38","#31596c","#dad9d0"],coat:["#e7ece8","#2f7c72","#446b94","#7a526f","#9b6548","#4c5c45","#d1b052","#3b3e49"],accent:["#2f7c72","#56a4a8","#b66d4f","#8d6bb1","#c49c48","#55774d","#bf5262","#e5e7e2"],pants:["#273e49","#20242d","#4e443a","#344d41","#4a3a56","#5c6670"],hairStyle:["Curto","Longo","Coque","Moicano"]};
let characterStyle={skin:2,hair:1,coat:0,accent:0,pants:0,hairStyle:0},equipmentReady=false;try{Object.assign(characterStyle,JSON.parse(localStorage.qc_character||"{}"))}catch(e){}
function shadeColor(hex,light){const c=new THREE.Color(hex);c.offsetHSL(0,light>0?.015:0,light);return c}
function applyCharacterStyle(nextStyle=characterStyle){characterStyle={...characterStyle,...nextStyle};applyCharacterStyleBase();playerHairStyles.forEach((group,index)=>group.visible=index===characterStyle.hairStyle);if(equipmentReady)applyEquipmentVisuals();else syncInventoryAvatar()}
const characterCustomizer=window.QuimiCharacterCustomizer.createCharacterCustomizer({options:CHARACTER_OPTIONS,initialStyle:characterStyle,controlsElement:$("customGroups"),previewElement:$("avatarPreview"),onChange:applyCharacterStyle});
function renderCharacter(){characterCustomizer.render()}
function openCharacter(){state.character=true;state.playing=false;$("character").classList.add("open");document.exitPointerLock();renderCharacter()}
function closeCharacter(){state.character=false;$("character").classList.remove("open");if(state.started)requestPointer()}

function collides(pos,height=player.crouch?1.24:1.72){
  const r=.29,minX=Math.floor(pos.x-r),maxX=Math.floor(pos.x+r),minY=Math.floor(pos.y+.02),maxY=Math.floor(pos.y+height-.02),minZ=Math.floor(pos.z-r),maxZ=Math.floor(pos.z+r);
  for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++)for(let z=minZ;z<=maxZ;z++)if(BDEF[getBlock(x,y,z)]?.solid)return true;
  return playerHitsLabDecor(pos,height);
}
function supportedAt(pos){const y=Math.floor(pos.y-.08),r=.24;return solidAt(pos.x-r,y,pos.z-r)||solidAt(pos.x+r,y,pos.z-r)||solidAt(pos.x-r,y,pos.z+r)||solidAt(pos.x+r,y,pos.z+r)||labDecorSupports(pos)}
function moveAxis(axis,delta){if(!delta)return;const before=player.pos[axis],test=player.pos.clone();test[axis]+=delta;if(!collides(test)){if(player.crouch&&player.onGround&&(axis==="x"||axis==="z")&&!supportedAt(test))return;player.pos.copy(test);return}let lo=0,hi=1;for(let i=0;i<7;i++){const m=(lo+hi)/2,test2=player.pos.clone();test2[axis]=before+delta*m;if(collides(test2))hi=m;else lo=m}player.pos[axis]=before+delta*lo;if(axis==="y"){if(delta<0){player.onGround=true;const fall=player.fallStart-player.pos.y;if(fall>5.2&&!player.inWater){damagePlayer(Math.floor((fall-4.6)*4),"queda");dustBurst(player.pos.clone(),Math.min(18,Math.floor(fall*1.5)));sound("land",Math.min(1,fall/12))}player.fallStart=player.pos.y}else player.fallStart=player.pos.y;player.vel.y=0}}
function waterSurfaceAt(x,z){return terrainHeight(x,z)<WATER_LEVEL?WATER_LEVEL+.82:-Infinity}
function isInWater(){return player.pos.y+.12<waterSurfaceAt(player.pos.x,player.pos.z)}
function isHeadUnderwater(){const eyeY=player.pos.y+(player.crouch?1.1:1.57);return eyeY<waterSurfaceAt(player.pos.x,player.pos.z)-.035}
function isCameraUnderwater(){return camera.position.y<waterSurfaceAt(camera.position.x,camera.position.z)-.035}
function isInLava(){return getBlock(player.pos.x,player.pos.y+.15,player.pos.z)===BLOCK.LAVA||getBlock(player.pos.x,player.pos.y+.85,player.pos.z)===BLOCK.LAVA}
function currentWeather(){
  const biome=biomeAt(player.pos.x,player.pos.z),daySeed=Math.floor(state.dayCount+WORLD_SEED%997),roll=hash(daySeed,Math.floor(player.pos.x/48),Math.floor(player.pos.z/48)),night=state.day>.53&&state.day<.93;
  if(["tundra","taiga","prado alpino"].includes(biome)&&roll>.72)return"snow";
  if(["floresta","pântano","selva tropical","planície florida"].includes(biome)&&roll>.66&&!night)return"rain";
  return"clear"
}
function scanEnvironmentHazards(){
  const px=Math.floor(player.pos.x),py=Math.floor(player.pos.y),pz=Math.floor(player.pos.z),biome=biomeAt(px,pz),surface=terrainHeight(px,pz)+1,undergroundDepth=Math.max(0,surface-player.pos.y),counts={lava:0,sulfur:0,coal:0,furnace:0,crystal:0,amethyst:0,mud:0,peat:0,torch:0};
  for(let x=px-4;x<=px+4;x+=2)for(let y=Math.max(1,py-3);y<=Math.min(MAX_Y-1,py+3);y+=2)for(let z=pz-4;z<=pz+4;z+=2){const id=getBlock(x,y,z);if(id===BLOCK.LAVA)counts.lava++;else if(id===BLOCK.SULFUR)counts.sulfur++;else if(id===BLOCK.COAL)counts.coal++;else if(id===BLOCK.FURNACE)counts.furnace++;else if(id===BLOCK.CRYSTAL)counts.crystal++;else if(id===BLOCK.AMETHYST)counts.amethyst++;else if(id===BLOCK.MUD)counts.mud++;else if(id===BLOCK.PEAT)counts.peat++;else if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL)counts.torch++}
  const meteorX=190+Math.floor(hash(WORLD_SEED,31)*130),meteorZ=-180-Math.floor(hash(WORLD_SEED,67)*120),meteorDistance=Math.hypot(player.pos.x-meteorX,player.pos.z-meteorZ),caveGas=undergroundDepth>6?clamp(12+counts.sulfur*13+counts.coal*2+(biome==="vulcânico"?28:0),0,92):0,smoke=clamp(counts.lava*10+counts.furnace*7+counts.torch*2,0,86),industrialWater=biome==="badlands"&&Math.hypot(px-220,pz+165)<46,waterProfile=scienceSystem?.waterProfileFor({biome,hot:counts.lava>1,cold:["tundra","taiga"].includes(biome),contaminated:["pântano","selva tropical"].includes(biome),acidic:biome==="vulcânico",alkaline:biome==="badlands"&&!industrialWater,industrial:industrialWater})||{id:"fresh",temperature:18,contamination:0};
  const weather=currentWeather(),wind=clamp(.12+hash(Math.floor(state.dayCount),Math.floor(px/40),Math.floor(pz/40))*.72+(weather!=="clear" ? .16 : 0),0,1);
  return{
    biome,undergroundDepth,weather,wind,waterProfile,
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
  environmentScanClock-=dt;if(environmentScanClock<=0||!cachedEnvironmentHazards){environmentScanClock=.55;cachedEnvironmentHazards=scanEnvironmentHazards()}
  const env=cachedEnvironmentHazards;scienceSnapshot=scienceSystem?.updateEnvironment(dt,{...env,day:state.day,inWater:player.inWater,waterTemperature:env.waterProfile.temperature,activity:player.sprint&&moving?1.7:moving?.55:0},equippedItemIds())||scienceSnapshot;
  scienceHudClock-=dt;if(scienceHudClock<=0){scienceHudClock=.18;scienceUI?.updateHUD(scienceSnapshot)}
  return scienceSnapshot
}
function waterCurrentAt(x,z){const angle=hash(Math.floor(x/24),Math.floor(z/24),WORLD_SEED%991)*TAU,strength=.16+hash(Math.floor(x/38),Math.floor(z/38),71)*.34;return{x:Math.cos(angle)*strength,z:Math.sin(angle)*strength}}
function updatePhysics(dt){
  player.attackCooldown=Math.max(0,player.attackCooldown-dt);const wasInWater=player.inWater,wasHeadUnderwater=player.headUnderwater;player.inWater=isInWater();player.crouch=!dev.fly&&!player.inWater&&!!keys.ShiftLeft;player.sprint=!!(keys.ControlLeft||keys.ControlRight)&&!player.crouch&&!player.inWater;player.headUnderwater=isHeadUnderwater();player.mana=Math.min(100,player.mana+dt*(player.inWater?5:9)*(countItem("prism_pendant")?1.28:1));player.inLava=isInLava();player.lavaClock=Math.max(0,player.lavaClock-dt);if(player.inLava&&player.lavaClock<=0){player.lavaClock=.62;damagePlayer(8,"lava")}
  const fwd=(keys.KeyW?1:0)-(keys.KeyS?1:0),side=(keys.KeyD?1:0)-(keys.KeyA?1:0),moving=Math.abs(fwd)+Math.abs(side)>.001;updateScienceEnvironment(dt,moving);updateSurvival(dt,moving);updateBreath(dt,moving);const len=Math.hypot(fwd,side)||1,survivalSlow=(player.hunger<=15||player.thirst<=15)?.72:1,waterGear=scienceSnapshot?.modifiers?.waterSpeed||1,scienceMove=scienceSnapshot?.modifiers?.movement||1,speed=(dev.fly?(player.sprint?11:6):player.inLava?1.55:player.inWater?2.75*waterGear:player.crouch?2.1:player.sprint?7.2:4.4)*dev.speed*survivalSlow*scienceMove,sy=Math.sin(player.yaw),cy=Math.cos(player.yaw);let dx=(side*cy-fwd*sy)/len*speed*dt,dz=(-side*sy-fwd*cy)/len*speed*dt;
  if(dev.fly){player.vel.set(0,0,0);player.pos.x+=dx;player.pos.z+=dz;player.pos.y+=((keys.Space?1:0)-(keys.ShiftLeft?1:0))*speed*dt;player.onGround=false;updatePlayerCamera(dt,Math.abs(dx)+Math.abs(dz)>.001);player.cameraUnderwater=isCameraUnderwater();updateUnderwaterUI(player.cameraUnderwater);updateVitals();return}
  if(player.inWater){const current=waterCurrentAt(player.pos.x,player.pos.z),currentResistance=clamp((scienceSnapshot?.protections?.protection?.pressure||0)*.35,0,.3);dx+=current.x*dt*(1-currentResistance);dz+=current.z*dt*(1-currentResistance)}
  player.onGround=supportedAt(player.pos);moveAxis("x",dx);moveAxis("z",dz);
  if(player.inWater){const surface=waterSurfaceAt(player.pos.x,player.pos.z),depth=Math.max(0,surface-player.pos.y),submersion=clamp(depth/1.72,0,1),lookSwim=fwd*Math.sin(player.pitch)*3.15,manual=(keys.Space?3.35:0)-(keys.ShiftLeft?2.8:0),buoyancy=(submersion-.52)*1.55,targetY=clamp(lookSwim+manual+buoyancy,-3.2,3.6),blend=1-Math.exp(-4.8*dt);player.vel.y=lerp(player.vel.y,targetY,blend);player.fallStart=player.pos.y;player.pressureDamageClock=Math.max(0,(player.pressureDamageClock||0)-dt);const pressureProtection=scienceSnapshot?.protections?.protection?.pressure||0,effectiveDepth=depth*(1-pressureProtection);if(effectiveDepth>7&&player.pressureDamageClock<=0){player.pressureDamageClock=2.6;damagePlayer(Math.ceil((effectiveDepth-5)/3),"pressão da água","pressure");if(isEquipped("depth_gauge"))toast(`Profundidade ${depth.toFixed(1)} m · pressão ${Math.round(effectiveDepth/7*100)}%`)}}else{player.vel.y-=18.5*dt;player.vel.y=Math.max(player.vel.y,-28)}player.onGround=false;moveAxis("y",player.vel.y*dt);
  if((Math.abs(dx)+Math.abs(dz))>.001&&(player.onGround||player.inWater)){player.step+=dt*speed;if(player.step>.42){player.step=0;sound(player.inWater?"splash":"step",.34)}}
  if(!player.onGround&&player.vel.y<-.2&&!player.inWater)player.fallStart=Math.max(player.fallStart,player.pos.y-player.vel.y*.02);
  if(player.inWater!==wasInWater){sound("splash",.72);dustBurst(new THREE.Vector3(player.pos.x,waterSurfaceAt(player.pos.x,player.pos.z),player.pos.z),5);player.fallStart=player.pos.y}if(wasHeadUnderwater&&!player.headUnderwater)sound("splash",.35);
  updatePlayerCamera(dt,Math.abs(dx)+Math.abs(dz)>.001);player.cameraUnderwater=isCameraUnderwater();updateUnderwaterUI(player.cameraUnderwater);updateVitals();
}
function respawn(){if(!syncPlayerToSafeGround(spawn.x,spawn.z)){player.pos.set(spawn.x,spawn.y,spawn.z);player.vel.set(0,0,0)}player.fallStart=player.pos.y;player.health=100;player.mana=100;player.hunger=80;player.thirst=80;player.breath=playerBreathMax();player.survivalDamageClock=0;player.breathDamageClock=0;closeModals();updateVitals();saveWorldState();requestPointer()}
function isEmbeddedLocalFile(){try{return location.protocol==="file:"&&window.self!==window.top}catch(error){return location.protocol==="file:"}}
function openStandaloneLocalFile(){
  if(!isEmbeddedLocalFile())return false;
  const opened=window.open(location.href,"_blank");
  if(opened){try{opened.opener=null}catch(error){}return true}
  const notice=$("localFrameNotice");if(notice){notice.hidden=false;notice.textContent="O navegador bloqueou a nova aba. Abra o arquivo index.html diretamente no Chrome ou Edge, fora da prévia."}
  return false
}
function reloadPageSafely(){if(openStandaloneLocalFile())return;location.reload()}
function restartWorld(){if(!confirm("Recomeçar o mundo? Construções, inventário, descobertas e progresso serão apagados. Suas configurações gráficas e aparência serão preservadas."))return;for(const k of ["qc_mods","qc_doors","qc_inventory","qc_equipment_v70","qc_equipment_v62","qc_science_v70","qc_chem","qc_camp_v5","qc_lab_v46","qc_lab_v47","qc_lab_v48","qc_lab_v49","qc_lab_v50","qc_lab_v51","qc_lab_validation_v60","qc_world_state_v70","qc_world_state_v60","qc_village_state_v60","qc_element_missions_v60","qc_message_history_v60","qc_carbon_intro_gift_v60","qc_periodic_mission_v46","qc_periodic_mission_v47","qc_village_v44","qc_rangerGift","qc_v44_wallet"])localStorage.removeItem(k);localStorage.qc_world_seed=String(Math.floor(100000+Math.random()*899999999));reloadPageSafely()}
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
  if(dev.fly)return;
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
    const activity=moving?1.16:1,tankId=equippedItemIds().find(id=>EQUIPMENT_DEFS[id]?.oxygenCapacity),tank=tankId?scienceSystem?.useOxygen(equippedItemIds(),dt*activity*.62):null,assisted=!!tank?.available,drain=(assisted?2.15:5.4)*activity*breathDrainMultiplier();
    max=playerBreathMax();player.breath=clamp(player.breath-dt*drain,0,max);if(player.breath<=0&&player.breathDamageClock<=0){player.breathDamageClock=2;damagePlayer(5,"afogamento","air")}
  }else player.breath=clamp(player.breath+dt*24,0,max)
}
function updateUnderwaterUI(submerged){const overlay=$("waterOverlay");if(!overlay)return;const max=playerBreathMax(),ratio=max?player.breath/max:1;overlay.classList.toggle("on",submerged);overlay.classList.toggle("low-air",submerged&&ratio<=.25);overlay.style.setProperty("--clarity",underwaterClarity().toFixed(2))}
function updateSurvival(dt,moving){
  if(dev.fly)return;const activity=(player.sprint&&moving?1.7:0)+(moving?.45:0)+(player.inLava?.7:0),heat=["deserto","savana","badlands","vulcânico","salinas"].includes(biomeAt(player.pos.x,player.pos.z))?.55:0;
  const hungerRate=scienceSnapshot?.modifiers?.hungerRate||1,thirstRate=scienceSnapshot?.modifiers?.thirstRate||1;player.hunger=clamp(player.hunger-dt*(.035+activity*.018)*hungerRate,0,100);player.thirst=clamp(player.thirst-dt*(.052+activity*.026+heat*.025)*thirstRate,0,100);
  player.survivalDamageClock=Math.max(0,player.survivalDamageClock-dt);if(player.survivalDamageClock<=0&&(player.hunger<=0||player.thirst<=0)){player.survivalDamageClock=player.thirst<=0?2.8:4.5;damagePlayer(player.thirst<=0?5:3,player.thirst<=0?"desidratação":"fome")}
}

const highlight=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(BLOCK_SIZE*1.012,BLOCK_SIZE*1.012,BLOCK_SIZE*1.012)),new THREE.LineBasicMaterial({color:0xe4f8bd,transparent:true,opacity:.85,depthTest:false}));highlight.visible=false;highlight.renderOrder=8;scene.add(highlight);
function crackTextures(){const out=[];for(let stage=0;stage<3;stage++){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");x.strokeStyle=`rgba(20,25,21,${.45+stage*.18})`;x.lineWidth=1.3+stage*.4;for(let q=0;q<4+stage*4;q++){let px=32+(hash(q,stage)-.5)*20,py=32+(hash(q,stage,2)-.5)*20;x.beginPath();x.moveTo(px,py);for(let j=0;j<3+stage;j++){px+=(hash(q,j,stage)-.5)*21;py+=(hash(q+17,j,stage)-.5)*21;x.lineTo(px,py)}x.stroke()}out.push(new THREE.CanvasTexture(c))}return out}
const cracks=crackTextures(),crackMat=new THREE.MeshBasicMaterial({map:cracks[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const crackMesh=new THREE.Mesh(new THREE.BoxGeometry(BLOCK_SIZE*1.015,BLOCK_SIZE*1.015,BLOCK_SIZE*1.015),crackMat);crackMesh.visible=false;crackMesh.renderOrder=7;scene.add(crackMesh);
const raycaster=new THREE.Raycaster();raycaster.far=6;
function targetBlock(){raycaster.setFromCamera({x:0,y:0},camera);const hit=raycaster.intersectObjects(chunkMeshes,false)[0];if(!hit)return null;const ref=hit.object.userData.faceBlocks?.[hit.faceIndex];return ref?{...ref,point:hit.point}:null}
function aimedEntity(){const eye=attackOrigin(),dir=aimDirection();return entities.filter(e=>!e.persistent&&!e.dead).map(e=>{const v=new THREE.Vector3(e.x,e.y+(e.flying?1.45:.7),e.z).sub(eye),d=v.length();return {e,d,dot:v.normalize().dot(dir)}}).filter(q=>q.d<22&&q.dot>1-clamp(.24/q.d,.012,.12)).sort((a,b)=>b.dot-a.dot||a.d-b.d)[0]?.e||null}
function updateTarget(dt){
  const raw=targetBlock(),t=raw&&getBlock(raw.x,raw.y,raw.z)===raw.id?raw:null,ae=aimedEntity();state.target=t;state.aimEntity=ae;highlight.visible=!!t;$("crosshair").classList.toggle("target",!!t||!!ae);if(t)highlight.position.set(t.x+.5,t.y+.5,t.z+.5);
  const protectedLab=t&&isLabProtectedBlock(t.x,t.y,t.z);
  if(state.left&&protectedLab){state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false;const now=performance.now();if(now-labProtectToastAt>950){labProtectToastAt=now;toast("Os blocos do Laboratório Carbono são indestrutíveis")}}
  else if(state.left&&t&&t.id!==BLOCK.BEDROCK){const k=key3(t.x,t.y,t.z);if(k!==state.breakKey){state.breakKey=k;state.breakTime=0}const toolSpeed=scienceSnapshot?.modifiers?.toolSpeed||1,waterMining=player.inWater?(isEquipped("diving_suit")||isEquipped("pressure_suit")?1:.62):1;state.breakTime+=dt*toolSpeed*waterMining;const prog=state.breakTime/BDEF[t.id].hard;$("breakWrap").classList.add("visible");$("breakFill").style.width=clamp(prog*100,0,100)+"%";crackMesh.visible=true;crackMesh.position.copy(highlight.position);crackMat.map=cracks[Math.min(2,Math.floor(prog*3))];crackMat.needsUpdate=true;if(prog>=1){breakBlock(t);state.breakTime=0;state.breakKey=""}}
  else{state.breakTime=0;state.breakKey="";$("breakWrap").classList.remove("visible");crackMesh.visible=false}
}
function breakBlock(t){
  if(isLabProtectedBlock(t.x,t.y,t.z))return toast("Os blocos do Laboratório Carbono são indestrutíveis");
  if(t.id===BLOCK.DOOR||t.id===BLOCK.DOOR_OPEN){const m=doorMeta.get(key3(t.x,t.y,t.z))||{half:0},baseY=t.y-(m.half||0),levels=m.group==="carbon-main-airlock"?[baseY,baseY+1,baseY+2]:[baseY,baseY+1];for(const yy of levels){mods.set(key3(t.x,yy,t.z),BLOCK.AIR);doorMeta.delete(key3(t.x,yy,t.z))}saveMods();saveDoorMeta();rebuildChunk(Math.floor(t.x/CHUNK),Math.floor(t.z/CHUNK));addItem(BLOCK.DOOR,1)}
  else{setBlock(t.x,t.y,t.z,BLOCK.AIR);addItem(t.id,1);discoverFromBlock(t.id);const resourceKey=missionResourceKeyForId(t.id);if(resourceKey)elementMissions?.recordEvent("mine",{key:resourceKey,quantity:1});const minerals=[BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.SULFUR,BLOCK.SALT,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.CRYSTAL,BLOCK.AMETHYST,BLOCK.LIMESTONE];if(minerals.includes(t.id))scienceSystem?.registerDiscovery("minerals",resourceKey||String(t.id),{name:itemName(t.id),source:`Extraído em ${biomeAt(t.x,t.z)}`,amountCollected:1,researchProgress:25})}
  const tool=selectedItem();if(EQUIPMENT_DEFS[tool]?.slot==="tool")scienceSystem?.damageEquipment(tool,.55,"mineração");
  burstBlock(t);sound("break",.65);highlight.visible=false;if(t.id===BLOCK.TORCH||t.id===BLOCK.SPECTRAL)updateTorches()
}
function blockHitsPlayer(x,y,z){const r=.29,h=player.crouch?1.24:1.72;return x+1>player.pos.x-r&&x<player.pos.x+r&&z+1>player.pos.z-r&&z<player.pos.z+r&&y+1>player.pos.y&&y<player.pos.y+h}
function toggleDoor(t){
  const m=doorMeta.get(key3(t.x,t.y,t.z))||{axis:0,half:0},open=getBlock(t.x,t.y,t.z)===BLOCK.DOOR_OPEN,next=open?BLOCK.DOOR:BLOCK.DOOR_OPEN,chunksToRebuild=new Set(),instant=m.group==="carbon-main-airlock";
  if(m.group){
    for(const [k,meta] of doorMeta){if(meta.group!==m.group)continue;const [x,y,z]=k.split("|").map(Number);mods.set(k,next);if(!instant)chunksToRebuild.add(ckey(Math.floor(x/CHUNK),Math.floor(z/CHUNK)))}
  }else{
    const baseY=t.y-(m.half||0);for(const yy of [baseY,baseY+1])mods.set(key3(t.x,yy,t.z),next);chunksToRebuild.add(ckey(Math.floor(t.x/CHUNK),Math.floor(t.z/CHUNK)));
  }
  saveMods();state.target={...t,id:next};for(const k of chunksToRebuild){const [cx,cz]=k.split(",").map(Number);rebuildChunkImmediate(cx,cz)}sound("place",.42);toast(open?(instant?"Porta do laboratório fechada":"Porta fechada"):(instant?"Porta do laboratório aberta":"Porta aberta"));
}
function nearLabDoor(){const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD;return Math.abs(player.pos.x-(LAB_LAYOUT.cx-.5))<3.8&&Math.abs(player.pos.z-front)<3.1&&Math.abs(player.pos.y-LAB_LAYOUT.y)<4}
function toggleLabMainDoor(){const x=LAB_LAYOUT.cx-2,y=LAB_LAYOUT.y,z=LAB_LAYOUT.cz-LAB_LAYOUT.halfD,id=getBlock(x,y,z);toggleDoor({x,y,z,id,n:[0,0,-1]})}
const FOOD_VALUES={bread:{hunger:25,health:3},berries:{hunger:12,thirst:5},honey:{hunger:18,health:2},cheese:{hunger:27,health:4},raw_venison:{hunger:11,raw:true},cooked_venison:{hunger:34,health:7},raw_pork:{hunger:10,raw:true},cooked_pork:{hunger:32,health:6},raw_beef:{hunger:12,raw:true},cooked_beef:{hunger:38,health:8},raw_rabbit:{hunger:8,raw:true},cooked_rabbit:{hunger:25,health:5},raw_chicken:{hunger:8,raw:true},cooked_chicken:{hunger:29,health:6},raw_mutton:{hunger:10,raw:true},cooked_mutton:{hunger:33,health:7}};
const DRINK_VALUES={water:{thirst:42},distilled_water:{thirst:38},purified_water:{thirst:35},salt_water:{thirst:-14},contaminated_water:{thirst:14},water_cup:{thirst:36,returns:"cup"},water_bucket:{thirst:75,returns:"bucket"}};
const RAW_TO_COOKED={raw_venison:"cooked_venison",raw_pork:"cooked_pork",raw_beef:"cooked_beef",raw_rabbit:"cooked_rabbit",raw_chicken:"cooked_chicken",raw_mutton:"cooked_mutton"};
function transformSelectedItem(from,to,metadata=null){
  const slot=invSlots[state.selected];if(!slot||slot.id!==from||slot.count<1)return false;
  const canStack=!metadata&&!slot.liquid,same=canStack?invSlots.find(item=>item?.id===to&&!item.liquid):null,free=invSlots.findIndex(item=>!item);
  if(slot.count>1&&!same&&free<0)return toast("Abra espaço na mochila para o recipiente"),false;
  const transformed={id:to,count:1,...metadata};
  slot.count--;if(slot.count<=0)invSlots[state.selected]=transformed;else if(same)same.count++;else invSlots[free]=transformed;
  saveInventory();renderInventory();return true
}
function canCollectWater(){const t=state.target;return player.inWater||!!(t&&terrainHeight(t.x,t.z)<WATER_LEVEL&&t.y<=WATER_LEVEL)}
const SOIL_SAMPLE_BLOCKS=new Set([BLOCK.GRASS,BLOCK.DIRT,BLOCK.SAND,BLOCK.RED_SAND,BLOCK.MUD,BLOCK.CLAY,BLOCK.FROSTED_SOIL,BLOCK.PEAT]);
const PLANT_SAMPLE_BLOCKS=new Set([BLOCK.WOOD,BLOCK.LEAVES,BLOCK.CACTUS,BLOCK.MOSS,BLOCK.PINE_LOG,BLOCK.PINE_LEAVES,BLOCK.DRY_LEAVES,BLOCK.TALL_GRASS,BLOCK.POPPY,BLOCK.BLUE_FLOWER,BLOCK.WHITE_FLOWER,BLOCK.CHERRY_LOG,BLOCK.CHERRY_LEAVES,BLOCK.BAMBOO,BLOCK.PALM_LOG,BLOCK.PALM_LEAVES]);
const MINERAL_SAMPLE_BLOCKS=new Set([BLOCK.STONE,BLOCK.COAL,BLOCK.IRON,BLOCK.COPPER,BLOCK.SULFUR,BLOCK.SALT,BLOCK.BASALT,BLOCK.OBSIDIAN,BLOCK.GOLD,BLOCK.TIN,BLOCK.ZINC,BLOCK.CRYSTAL,BLOCK.MARBLE,BLOCK.DEEPSTONE,BLOCK.LIMESTONE,BLOCK.SLATE,BLOCK.AMETHYST,BLOCK.NITER]);
const SAMPLE_DISCOVERY_KEYS=new Map([[BLOCK.CACTUS,"cactus"],[BLOCK.MOSS,"moss"],[BLOCK.POPPY,"poppy"],[BLOCK.BLUE_FLOWER,"blue_flower"],[BLOCK.WHITE_FLOWER,"white_flower"],[BLOCK.BAMBOO,"bamboo"],[BLOCK.CRYSTAL,"crystal_tree"]]);
function collectScientificSample(){
  if(!state.playing||!scienceSystem)return false;
  const target=state.target,creature=state.aimEntity&&!state.aimEntity.dead&&Math.hypot(state.aimEntity.x-player.pos.x,state.aimEntity.z-player.pos.z)<4.5?state.aimEntity:null;
  const biome=biomeAt(player.pos.x,player.pos.z),environment=cachedEnvironmentHazards||scanEnvironmentHazards(),position=target?{x:target.x,y:target.y,z:target.z}:{x:player.pos.x,y:player.pos.y,z:player.pos.z};
  let metadata;
  if(creature){
    metadata={kind:"animal",name:`Material biológico — ${creature.name}`,source:creature.name,sourceCreature:creature.type,discoveryId:creature.type,appearance:`Vestígio coletado de ${creature.name}`,contamination:creature.hostile?32:12,biologicalContamination:creature.hostile?38:16,composition:"material biológico"};
  }else if(canCollectWater()){
    const profile=environment.waterProfile||scienceSystem.waterProfileFor({biome});
    const hazardous=["acidic","alkaline","industrial"].includes(profile.id);
    metadata={kind:hazardous?"liquid":"water",name:`Amostra — ${profile.label}`,source:`Corpo d'água em ${biome}`,discoveryId:profile.id,waterProfileId:profile.id,appearance:profile.description,pH:profile.pH,purity:profile.purity,contamination:profile.contamination,biologicalContamination:profile.contamination,temperature:profile.temperature,composition:profile.label,suspendedMaterial:profile.contamination>40?"sedimentos e matéria orgânica":"partículas finas"};
  }else if(target){
    const meteorDistance=Math.hypot(target.x-(190+Math.floor(hash(WORLD_SEED,31)*130)),target.z-(-180-Math.floor(hash(WORLD_SEED,67)*120))),blockName=itemName(target.id),resourceKey=missionResourceKeyForId(target.id)||SAMPLE_DISCOVERY_KEYS.get(target.id)||String(target.id);
    const fungi=target.id===BLOCK.PEAT&&["pântano","selva tropical"].includes(biome),meteorite=meteorDistance<18&&[BLOCK.CRYSTAL,BLOCK.AMETHYST,BLOCK.OBSIDIAN].includes(target.id);
    const kind=meteorite?"meteorite":fungi?"fungi":SOIL_SAMPLE_BLOCKS.has(target.id)?"soil":PLANT_SAMPLE_BLOCKS.has(target.id)?"plant":MINERAL_SAMPLE_BLOCKS.has(target.id)?"mineral":"residue";
    metadata={kind,name:`Amostra de ${blockName}`,source:blockName,sourceBlock:resourceKey,discoveryId:meteorite?"meteorite":resourceKey,appearance:BDEF[target.id]?.alpha?"translúcida ou porosa":"fragmento voxelizado",contamination:kind==="fungi"?58:kind==="residue"?24:6,temperature:scienceSnapshot?.ambientTemperature,composition:blockName,radioactivity:meteorite?"elevada":"não medida",magneticBehavior:target.id===BLOCK.IRON?"atração provável":"não medido"};
  }else{
    metadata={kind:"air",name:`Amostra de ar — ${biome}`,source:`Atmosfera de ${biome}`,discoveryId:`air-${biome}`,appearance:"gás incolor em recipiente selado",contamination:Math.round(Math.max(environment.hazards?.air||0,environment.hazards?.smoke||0,environment.hazards?.toxicity||0)),temperature:scienceSnapshot?.ambientTemperature,composition:"mistura gasosa desconhecida"};
  }
  const result=scienceSystem.collectSample({...metadata,...position,biome,temperature:metadata.temperature??scienceSnapshot?.ambientTemperature??20});
  if(!result.ok){toast(result.message);return false}
  sound("pickup",.55);toast(result.message);saveInventory();renderInventory();scienceUI?.renderNotebook?.();return true
}
function fillWaterContainer(id){
  if(!canCollectWater())return toast("Aproxime-se de um lago para encher o recipiente");
  if(invSlots[state.selected]?.liquid)return toast("Este recipiente já contém uma substância");
  const biome=biomeAt(player.pos.x,player.pos.z),profile=cachedEnvironmentHazards?.waterProfile||scienceSystem?.waterProfileFor({biome})||{id:"fresh",label:"Água doce",purity:72,contamination:8,temperature:19,pH:7.1},requiresReinforced=["acidic","alkaline","industrial"].includes(profile.id);
  if(requiresReinforced&&id!=="hazardous_container")return toast(`${profile.label} exige um recipiente reforçado; copos e baldes comuns são incompatíveis`);
  const filled=id==="bucket"?"water_bucket":id==="cup"?"water_cup":"hazardous_container",liquid={...profile,amount:id==="bucket"?1000:id==="cup"?250:500,unit:"mL",concentration:profile.id==="salt"?"salina":profile.id==="acidic"?"ácida":profile.id==="alkaline"?"alcalina":"natural"};
  if(transformSelectedItem(id,filled,{liquid})){sound("splash",.5);toast(`${id==="bucket"?"Balde":id==="cup"?"Copo":"Recipiente reforçado"} com ${profile.name||profile.label}`)}
}
function consumeFood(id,data){if(player.hunger>=100&&player.health>=100&&!data.thirst)return toast("Você já está satisfeito");removeItem(id,1);player.hunger=clamp(player.hunger+data.hunger,0,100);player.thirst=clamp(player.thirst+(data.thirst||0),0,100);player.health=clamp(player.health+(data.health||0),0,100);if(data.raw&&Math.random()<.18)damagePlayer(4,"carne crua");saveInventory();renderInventory();updateVitals();sound("pickup",.7);toast(`${itemName(id)} consumido · +${data.hunger} fome`)}
function consumeDrink(id,data){
  if(player.thirst>=100)return toast("Sua sede já está cheia");
  const selected=invSlots[state.selected],liquid=selected?.liquid,profiles=scienceSystem?.waterProfiles||{},fallback=id==="water"||id==="distilled_water"?profiles.distilled:id==="salt_water"?profiles.salt:id==="contaminated_water"?profiles.contaminated:id==="purified_water"?{...profiles.fresh,id:"fresh",label:"Água purificada",name:"água purificada",purity:92,contamination:2,hydration:35}:profiles.fresh;
  if(data.returns){if(!transformSelectedItem(id,data.returns))return}else{removeItem(id,1);saveInventory();renderInventory()}
  const result=scienceSystem?.drinkLiquid(liquid||fallback),hydration=Number.isFinite(result?.hydration)?result.hydration:data.thirst;
  player.thirst=clamp(player.thirst+hydration,0,100);updateVitals();sound("splash",.55);
  toast(`${result?.profile?.label||itemName(id)} consumida · ${hydration>=0?"+":""}${hydration} sede${result?.status?` · ${result.status}`:""}`)
}
function cookWithFurnace(){let raw=RAW_TO_COOKED[selectedItem()]?selectedItem():Object.keys(RAW_TO_COOKED).find(id=>countItem(id)>0);if(!raw)return toast("Coloque carne crua na mochila para assar");if(countItem(BLOCK.COAL)<1)return toast("O forno precisa de 1 carvão");removeItem(raw,1);removeItem(BLOCK.COAL,1);addItem(RAW_TO_COOKED[raw],1);sound("torch",.65);toast(`${itemName(RAW_TO_COOKED[raw])} assada no forno`)}
function useOrPlace(){
  const t=state.target,n=nearestNPC();
  if(nearPeriodicTable()||nearLabDoor()||n||nearLabStation()||(t&&(t.id===BLOCK.DOOR||t.id===BLOCK.DOOR_OPEN))||(t&&(t.id===BLOCK.LAB||t.id===BLOCK.FURNACE)))return interact();
  const id=selectedItem();if(id==="cup"||id==="bucket"||id==="hazardous_container")return fillWaterContainer(id);if(WEAPONS.has(id))return attackSelected(true);
  if(FOOD_VALUES[id])return consumeFood(id,FOOD_VALUES[id]);if(DRINK_VALUES[id])return consumeDrink(id,DRINK_VALUES[id]);
  if(id==="antidote"){if(player.health>=100)return toast("Sua vida já está cheia");removeItem("antidote",1);player.health=Math.min(100,player.health+38);saveInventory();renderInventory();updateVitals();sound("pickup",.7);return toast("Antídoto utilizado · +38 vida")}
  placeSelected()
}
function placeSelected(){const t=state.target,slot=invSlots[state.selected];if(!t||!slot||typeof slot.id!=="number"||slot.count<1)return;const x=t.x+t.n[0],y=t.y+t.n[1],z=t.z+t.n[2],id=slot.id;if(isLabPlacementRestricted(x,y,z))return toast("Não é permitido colocar blocos dentro do Laboratório Carbono");if(y<1||getBlock(x,y,z)!==BLOCK.AIR||(BDEF[id].solid&&blockHitsPlayer(x,y,z)))return toast("Sem espaço para colocar aqui");if(id===BLOCK.DOOR){if(getBlock(x,y+1,z)!==BLOCK.AIR)return toast("A porta precisa de dois blocos livres");const axis=Math.abs(Math.sin(player.yaw))>.7?0:1;for(const [yy,half] of [[y,0],[y+1,1]]){mods.set(key3(x,yy,z),BLOCK.DOOR);doorMeta.set(key3(x,yy,z),{axis,half,hinge:-1,swing:1})}saveMods();saveDoorMeta();rebuildChunk(Math.floor(x/CHUNK),Math.floor(z/CHUNK))}else setBlock(x,y,z,id);if(!dev.infinite){slot.count--;if(slot.count<=0)invSlots[state.selected]=null}saveInventory();renderInventory();sound(id===BLOCK.TORCH||id===BLOCK.SPECTRAL?"torch":"place",.52);if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL)updateTorches()}

const particleGroup=new THREE.Group();scene.add(particleGroup);const particleGeo=new THREE.BoxGeometry(.1,.1,.1),particles=[];
function burstBlock(t){if(settings.particles===0)return;const col=new THREE.Color(BDEF[t.id]?.icon||"#888"),count=settings.particles===1?6:12;for(let i=0;i<count;i++){const m=new THREE.Mesh(particleGeo,new THREE.MeshLambertMaterial({color:col.clone().multiplyScalar(.75+hash(i,t.x,t.z)*.4)}));m.position.set(t.x+.5+(hash(i,1)-.5)*.55,t.y+.5+(hash(i,2)-.5)*.55,t.z+.5+(hash(i,3)-.5)*.55);m.scale.setScalar(.6+hash(i,4)*1.2);m.userData.v=new THREE.Vector3((hash(i,5)-.5)*3,1+hash(i,6)*3,(hash(i,7)-.5)*3);m.userData.life=.65+hash(i,8)*.4;particleGroup.add(m);particles.push(m)}}
function dustBurst(pos,count=8){if(settings.particles===0)return;count=settings.particles===1?Math.ceil(count/2):count;for(let i=0;i<count;i++){const m=new THREE.Mesh(particleGeo,new THREE.MeshBasicMaterial({color:0xb59b73,transparent:true,opacity:.42}));m.position.set(pos.x+(hash(i,33)-.5)*.8,pos.y+.04,pos.z+(hash(i,34)-.5)*.8);m.scale.setScalar(.45+hash(i,35));m.userData.v=new THREE.Vector3((hash(i,36)-.5)*1.8,.4+hash(i,37),(hash(i,38)-.5)*1.8);m.userData.life=.45+hash(i,39)*.4;particleGroup.add(m);particles.push(m)}}
function updateParticles(dt){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.userData.life-=dt;p.userData.v.y-=7*dt;p.position.addScaledVector(p.userData.v,dt);p.rotation.x+=dt*5;p.rotation.z+=dt*3;if(p.material.transparent)p.material.opacity=Math.max(0,p.userData.life*.6);if(p.userData.life<=0){particleGroup.remove(p);p.material.dispose();particles.splice(i,1)}}}

const projectileRoot=new THREE.Group(),projectiles=[],dropRoot=new THREE.Group(),worldDrops=[];scene.add(projectileRoot,dropRoot);
function aimDirection(){return new THREE.Vector3(-Math.sin(player.yaw)*Math.cos(player.pitch),Math.sin(player.pitch),-Math.cos(player.yaw)*Math.cos(player.pitch)).normalize()}
function attackOrigin(){return new THREE.Vector3(player.pos.x,player.pos.y+1.42,player.pos.z)}
function combatParticles(pos,color=0xffffff,count=8){if(settings.particles===0)return;count=settings.particles===1?Math.ceil(count/2):count;for(let i=0;i<count;i++){const m=new THREE.Mesh(particleGeo,new THREE.MeshBasicMaterial({color,transparent:true,opacity:.82}));m.position.copy(pos);m.scale.setScalar(.5+Math.random()*1.1);m.userData.v=new THREE.Vector3((Math.random()-.5)*3,(Math.random()-.1)*2.5,(Math.random()-.5)*3);m.userData.life=.3+Math.random()*.45;particleGroup.add(m);particles.push(m)}}
function launchProjectile(kind,origin,dir,enemy=false){const g=new THREE.Group();let speed=22,damage=12,ttl=2.6;if(kind==="wind"){const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.16,1),new THREE.MeshBasicMaterial({color:0x8cf5ff,transparent:true,opacity:.8}));const shell=new THREE.Mesh(new THREE.TorusGeometry(.25,.025,5,14),new THREE.MeshBasicMaterial({color:0xb9fbff,transparent:true,opacity:.62}));shell.rotation.x=Math.PI/2;g.add(core,shell);speed=17;damage=8;ttl=2.2}else if(kind==="enemy"){g.add(new THREE.Mesh(new THREE.OctahedronGeometry(.12,0),new THREE.MeshBasicMaterial({color:0xbd65ef})));speed=9;damage=7;ttl=3}else{part(g,metalMat,[0,0,-.2],[.028,.028,.52]);part(g,leatherMat,[0,0,.32],[.11,.035,.12],[0,0,.6]);speed=27;damage=13;ttl=3.1}g.position.copy(origin);g.lookAt(origin.clone().add(dir));projectileRoot.add(g);projectiles.push({kind,group:g,vel:dir.clone().multiplyScalar(speed),damage,ttl,enemy,hit:new Set()});return g}
function castWind(alt=false){if(player.attackCooldown>0)return;const focus=countItem("storm_focus")>0,cost=alt?28:12;if(player.mana<cost)return toast("Mana insuficiente");player.mana-=cost;player.attackCooldown=alt?1.45:.42;state.attackAnim=.3;sound("magic",.7);const dir=aimDirection();if(alt){combatParticles(player.pos.clone().add(new THREE.Vector3(0,1,0)),0x8cecf5,22);for(const e of entities){if(e.persistent||e.dead)continue;const dx=e.x-player.pos.x,dz=e.z-player.pos.z,d=Math.hypot(dx,dz);if(d<6+(focus?1.5:0)){hitEntity(e,focus?10:6,"ciclone",new THREE.Vector3(dx,0,dz).normalize().multiplyScalar(focus?11:8))}}toast(focus?"Ciclone prismático":"Ciclone expansivo")}else{const mesh=launchProjectile("wind",attackOrigin().addScaledVector(dir,.65),dir);if(focus){const data=projectiles.find(q=>q.group===mesh);data.damage=12;data.vel.multiplyScalar(1.12)}}updateVitals()}
function shootArrow(){if(player.attackCooldown>0)return;if(!dev.infinite&&countItem("arrow")<1)return toast("Sem flechas");player.attackCooldown=.54;state.attackAnim=.3;const dir=aimDirection();launchProjectile("arrow",attackOrigin().addScaledVector(dir,.75),dir);if(!dev.infinite){removeItem("arrow",1);saveInventory();renderHotbar()}sound("bow",.7)}
function meleeAttack(){if(player.attackCooldown>0)return;player.attackCooldown=.38;state.attackAnim=.3;sound("sword",.7);const dir=aimDirection(),eye=attackOrigin(),best=entities.filter(e=>!e.persistent&&!e.dead).map(e=>{const p=new THREE.Vector3(e.x,e.y+(e.flying?1.4:.75),e.z),v=p.clone().sub(eye),d=v.length();return {e,d,dot:v.normalize().dot(dir)}}).filter(q=>q.d<3.25&&q.dot>.48).sort((a,b)=>a.d-b.d)[0];if(best)hitEntity(best.e,15,"espada",dir.clone().multiplyScalar(4));else combatParticles(eye.clone().addScaledVector(dir,1.7),0xdde8eb,3)}
function attackSelected(alt=false){
  const id=selectedItem(),condition=scienceSystem?.equipmentCondition(id);if(condition?.broken)return toast(`${itemName(id)} está quebrado · repare no laboratório`);
  const previousCooldown=player.attackCooldown;if(id==="wind_staff")castWind(alt);else if(id==="bow")shootArrow();else if(id==="iron_sword")meleeAttack();
  if(player.attackCooldown>previousCooldown)scienceSystem?.damageEquipment(id,alt?2.2:1,id==="bow"?"disparo":id==="wind_staff"?"conjuração":"ataque")
}
function hitEntity(e,damage,source="ataque",knock=null){
  if(!e||e.persistent||e.dead)return;
  e.hp=Math.max(0,e.hp-damage);state.combatTarget=e;state.combatTargetTime=2.8;
  combatParticles(new THREE.Vector3(e.x,e.y+.7,e.z),e.hostile?0xff766c:0xdce8bd,8);
  if(knock){e.vx=(e.vx||0)+knock.x;e.vz=(e.vz||0)+knock.z}
  if(isPassiveMob(e)&&e.hp>0){
    const awayX=e.x-player.pos.x,awayZ=e.z-player.pos.z;
    e.fleeTimer=Math.max(e.fleeTimer||0,5+Math.random()*2.4);
    e.fleeBias=(Math.random()-.5)*.38;
    if(Math.hypot(awayX,awayZ)>.001)e.angle=Math.atan2(awayX,awayZ)+e.fleeBias;
    e.timer=.12;e.jumpCooldown=Math.min(e.jumpCooldown||0,.08)
  }
  sound("hit",.55);if(e.hp<=0)killEntity(e,source)
}
const DROP_TABLE={slime:[["acid_gel",1,2]],cobrete:[["copper_core",1,1],[BLOCK.COPPER,1,2]],cristalume:[["crystal_shard",1,2],[BLOCK.CRYSTAL,1,1]],capivara:[["hide",1,2]],scorpion:[["chitin",1,2]],golem:[[BLOCK.OBSIDIAN,1,2],["gold_nugget",1,2]],wisp:[["wind_essence",1,2]],magma:[[BLOCK.BASALT,1,2],[BLOCK.SULFUR,1,1]],deer:[["raw_venison",2,4],["hide",1,2]],pig:[["raw_pork",2,4]],cow:[["raw_beef",3,5],["hide",1,2]],rabbit:[["raw_rabbit",1,2]],chicken:[["raw_chicken",1,2],["feather",1,2]],sheep:[["raw_mutton",2,4],["wool",1,3]],owl:[["feather",1,2]]};
function killEntity(e,source){
  e.dead=true;combatParticles(new THREE.Vector3(e.x,e.y+.8,e.z),0xffd889,18);
  for(const [id,min,max] of DROP_TABLE[e.type]||[]){
    const lucky=countItem("lucky_charm")&&Math.random()<.28?1:0,sample=isEquipped("sample_case")&&!String(id).startsWith("raw_")&&Math.random()<(equipmentDefinition("offhand")?.sampleBonus||0)?1:0;
    spawnDrop(id,min+Math.floor(Math.random()*(max-min+1))+lucky+sample,new THREE.Vector3(e.x,e.y+.5,e.z));
    if(id==="acid_gel")discover("antidote","Neutralização do gel ácido");if(id==="chitin")discover("chitin","Biomateriais de quitina");if(id==="wind_essence")discover("storm_focus","Energia eólica condensada")
  }
  scienceSystem?.registerDiscovery("animals",e.type,{name:e.name,source:`Observado em ${biomeAt(e.x,e.z)}`,knownRisks:e.hostile?"comportamento hostil":"baixo",amountCollected:1,researchProgress:35});
  chatMessage("COMBATE",`${e.name} derrotado com ${source}.`);removeEntity(e)
}
function spawnDrop(id,count,pos){const g=new THREE.Group(),mat=new THREE.MeshLambertMaterial({color:new THREE.Color(itemColor(id)),emissive:new THREE.Color(itemColor(id)).multiplyScalar(.12)}),m=new THREE.Mesh(cubeGeo,mat);m.scale.setScalar(.18);m.rotation.set(.35,.4,0);m.castShadow=true;g.add(m);g.position.copy(pos);dropRoot.add(g);worldDrops.push({id,count,group:g,baseY:pos.y,life:45,phase:Math.random()*TAU})}
function updateDrops(dt,now){for(let i=worldDrops.length-1;i>=0;i--){const d=worldDrops[i];d.life-=dt;d.group.rotation.y+=dt*2.2;d.group.position.y=d.baseY+.2+Math.sin(now*.004+d.phase)*.12;if(d.group.position.distanceTo(player.pos)<1.45){if(addItem(d.id,d.count)){toast(`+${d.count} ${itemName(d.id)}`);dropRoot.remove(d.group);worldDrops.splice(i,1);sound("pickup",.4)}else d.group.position.add(new THREE.Vector3((Math.random()-.5)*2,.2,(Math.random()-.5)*2))}else if(d.life<=0){dropRoot.remove(d.group);worldDrops.splice(i,1)}}}
function updateProjectiles(dt){for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.ttl-=dt;if(p.kind==="arrow")p.vel.y-=6.5*dt;p.group.position.addScaledVector(p.vel,dt);if(p.kind==="wind")p.group.rotation.z+=dt*7;if(p.kind==="enemy"){if(p.group.position.distanceTo(player.pos.clone().add(new THREE.Vector3(0,.85,0)))<.65){damagePlayer(p.damage,"magia inimiga");p.ttl=0}}else for(const e of entities){if(e.persistent||e.dead||p.hit.has(e))continue;if(p.group.position.distanceTo(new THREE.Vector3(e.x,e.y+(e.flying?1.4:.65),e.z))<.72){p.hit.add(e);hitEntity(e,p.damage,p.kind==="arrow"?"arco":"magia do vento",p.vel.clone().setY(0).normalize().multiplyScalar(p.kind==="wind"?6:2));p.ttl=0;break}}const b=getBlock(p.group.position.x,p.group.position.y,p.group.position.z);if(BDEF[b]?.solid)p.ttl=0;if(p.ttl<=0){if(p.kind!=="enemy")combatParticles(p.group.position,p.kind==="wind"?0x8cecf5:0xc9c8bd,5);projectileRoot.remove(p.group);projectiles.splice(i,1)}}}
function updateEnemyHud(dt){const aimed=state.aimEntity&&!state.aimEntity.dead?state.aimEntity:null;if(state.combatTargetTime>0)state.combatTargetTime-=dt;const e=aimed||(state.combatTargetTime>0&&state.combatTarget&&!state.combatTarget.dead?state.combatTarget:null);if(e){$("enemyHud").classList.add("show");$("enemyName").textContent=e.name.toUpperCase();$("enemyHp").textContent=`${Math.ceil(e.hp)} / ${e.maxHp}`;$("enemyFill").style.width=clamp(e.hp/e.maxHp*100,0,100)+"%"}else $("enemyHud").classList.remove("show")}

const torchGroup=new THREE.Group();scene.add(torchGroup);const torchLights=[];
function updateTorches(){for(const l of torchLights)scene.remove(l);torchGroup.clear();torchLights.length=0;const entries=[];for(const [k,id] of mods)if(id===BLOCK.TORCH||id===BLOCK.SPECTRAL){const [x,y,z]=k.split("|").map(Number);entries.push({x,y,z,id,d:(x-player.pos.x)**2+(z-player.pos.z)**2})}entries.sort((a,b)=>a.d-b.d);for(const [i,t] of entries.slice(0,22).entries()){const spectral=t.id===BLOCK.SPECTRAL,col=spectral?0x66efbd:0xffc55d;const stick=new THREE.Mesh(new THREE.BoxGeometry(spectral?.18:.11,spectral?.34:.56,spectral?.18:.11),new THREE.MeshLambertMaterial({color:spectral?0x397b6d:0x8e5e35,emissive:spectral?0x173d31:0x331500}));stick.position.set(t.x+.5,t.y+(spectral?.18:.3),t.z+.5);torchGroup.add(stick);const flame=new THREE.Mesh(new THREE.SphereGeometry(spectral?.13:.085,7,5),new THREE.MeshBasicMaterial({color:col}));flame.position.set(t.x+.5,t.y+(spectral?.46:.64),t.z+.5);torchGroup.add(flame);if(i<(settings.shadows===0?5:10)){const l=new THREE.PointLight(spectral?0x55eab2:0xff9f45,spectral?1.55:1.25,spectral?12:10,2);l.position.copy(flame.position);l.userData.seed=i*1.7;scene.add(l);torchLights.push(l)}}}

let audioCtx=null,master=null,lastCricket=0;
function initAudio(){if(audioCtx){audioCtx.resume();return}audioCtx=new (window.AudioContext||window.webkitAudioContext)();master=audioCtx.createGain();master.gain.value=settings.volume*.32;master.connect(audioCtx.destination)}
function osc(freq,dur,type="sine",gain=.08,slide=0){if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime;o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(master);o.start(t);o.stop(t+dur+.02)}
function noiseBurst(dur=.1,gain=.08,cut=1200){if(!audioCtx)return;const len=Math.floor(audioCtx.sampleRate*dur),b=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const s=audioCtx.createBufferSource(),f=audioCtx.createBiquadFilter(),g=audioCtx.createGain();s.buffer=b;f.type="lowpass";f.frequency.value=cut;g.gain.value=gain;s.connect(f).connect(g).connect(master);s.start()}
function sound(type,power=1){if(!audioCtx)return;if(type==="step"){const id=getBlock(player.pos.x,player.pos.y-.12,player.pos.z),stone=[BLOCK.STONE,BLOCK.COAL,BLOCK.IRON,BLOCK.BASALT,BLOCK.DEEPSTONE,BLOCK.FURNACE].includes(id);noiseBurst(.055,.045*power,stone?620:[BLOCK.SAND,BLOCK.RED_SAND].includes(id)?360:900);osc(stone?105:[BLOCK.SAND,BLOCK.RED_SAND].includes(id)?72:125,.05,"triangle",.025*power,-30)}else if(type==="break"){noiseBurst(.22,.15*power,780);osc(135,.14,"square",.04*power,-90)}else if(type==="place"){osc(92,.09,"triangle",.075*power,-32);noiseBurst(.045,.04,460)}else if(type==="splash"){noiseBurst(.22,.08*power,1550);osc(190,.18,"sine",.025,-100)}else if(type==="land"){osc(64,.18,"triangle",.12*power,-25);noiseBurst(.13,.1*power,320)}else if(type==="torch"){osc(640,.09,"sine",.035,120);noiseBurst(.05,.025,2200)}else if(type==="magic"){osc(370,.22,"sine",.05*power,620);osc(720,.16,"triangle",.025*power,260);noiseBurst(.12,.025,3200)}else if(type==="bow"){noiseBurst(.045,.04,1800);osc(185,.13,"triangle",.045*power,-110)}else if(type==="sword"){noiseBurst(.1,.055*power,2600);osc(310,.08,"sawtooth",.022,-130)}else if(type==="hit"){noiseBurst(.09,.07*power,900);osc(95,.08,"square",.028,-35)}else if(type==="pickup"){osc(660,.07,"sine",.035,180);osc(920,.1,"sine",.022,120)}else if(type==="reaction"){noiseBurst(.18,.045*power,2100);osc(240,.22,"sine",.035*power,160);osc(510,.15,"triangle",.018*power,120)}else if(type==="alert"){osc(780,.1,"square",.045*power,-80);setTimeout(()=>osc(620,.14,"square",.04*power,-70),115);noiseBurst(.08,.026*power,2800)}}
function cricket(){if(!audioCtx)return;const t=audioCtx.currentTime,o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type="sine";o.frequency.value=3600+Math.random()*850;g.gain.setValueAtTime(.0001,t);for(let i=0;i<4;i++){g.gain.linearRampToValueAtTime(.018,t+i*.065+.015);g.gain.exponentialRampToValueAtTime(.0001,t+i*.065+.045)}o.connect(g).connect(master);o.start(t);o.stop(t+.3)}

let invSlots=Array(36).fill(null);const starter=[["wind_staff",1],["bow",1],["iron_sword",1],["arrow",32],[BLOCK.GRASS,28],[BLOCK.STONE,32],[BLOCK.WOOD,12],[BLOCK.TORCH,8],[BLOCK.DOOR,2],[BLOCK.DIRT,24],[BLOCK.SAND,18],[BLOCK.LEAVES,12],[BLOCK.PLANK,18],[BLOCK.COAL,6],["stick",8],[BLOCK.CACTUS,3],["water",4],["gold_nugget",10]];starter.forEach(([id,count],i)=>invSlots[i]={id,count});
try{const saved=JSON.parse(localStorage.qc_inventory||"null");if(Array.isArray(saved)&&saved.length>=30){invSlots=Array(36).fill(null);saved.slice(0,36).forEach((v,i)=>invSlots[i]=v)}}catch(e){}
function pinStarter(id,slot,count=1){let at=invSlots.findIndex(s=>s?.id===id);if(at<0){at=invSlots.findIndex(s=>!s);if(at<0)at=invSlots.length-1;invSlots[at]={id,count}}[invSlots[slot],invSlots[at]]=[invSlots[at],invSlots[slot]]}pinStarter("wind_staff",0);pinStarter("bow",1);pinStarter("iron_sword",2);if(!invSlots.some(s=>s?.id==="arrow")){const i=invSlots.findIndex(s=>!s);if(i>=0)invSlots[i]={id:"arrow",count:32}}
const ITEM_NAMES={stick:"Bastão",wind_staff:"Cajado do Vento",bow:"Arco comum",iron_sword:"Espada de ferro",arrow:"Flecha",hydrogen:"Hidrogênio",oxygen:"Oxigênio",water:"Água destilada",copper_ingot:"Cobre refinado",sulfur:"Enxofre",acid:"Ácido sulfúrico",indicator:"Indicador natural",fertilizer:"Fertilizante mineral",glow_solution:"Solução luminescente",copper_sulfate:"Sulfato de cobre",lab_note:"Caderno de laboratório",acid_gel:"Gel ácido",chitin:"Quitina",wind_essence:"Essência do vento",crystal_shard:"Fragmento prismático",copper_core:"Núcleo de cobre",bronze_ingot:"Lingote de bronze",voltaic_cell:"Célula voltaica",ceramic_plate:"Placa cerâmica",feather:"Pena",hide:"Couro",gold_nugget:"Pepita de ouro",antidote:"Antídoto alcalino",armor_plate:"Placa de quitina",storm_focus:"Foco da tempestade",carbon_dioxide:"Dióxido de carbono",quicklime:"Óxido de cálcio",slaked_lime:"Hidróxido de cálcio",alkali:"Solução alcalina",neutral_salt:"Sal neutralizado",rust_pigment:"Pigmento de óxido de ferro",ammonia:"Solução de amônia",tetraammine:"Complexo de cobre",ethanol:"Etanol",plant_oil:"Óleo vegetal",soap:"Sabão artesanal",ph_kit:"Kit de pH",nitrate_mix:"Mistura de nitratos",bread:"Pão rústico",berries:"Frutas silvestres",honey:"Mel da serra",cheese:"Queijo curado",shield:"Escudo de bronze",chainmail:"Cota de malha",liquid_nitrogen:"Nitrogênio líquido",lucky_charm:"Berloque da sorte",prism_pendant:"Pingente prismático",lab_glassware:"Vidrarias de laboratório",carbon_rod:"Bastão de carbono",carbon_filter:"Filtro de carvão ativado",distillation_flask:"Balão de destilação",spectrometer_lens:"Lente espectrométrica",catalyst:"Catalisador metálico",protective_goggles:"Óculos de proteção",sample_case:"Maleta de amostras",sodium_chloride:"Cloreto de sódio",chlorine:"Cloro",sodium_hydroxide:"Hidróxido de sódio",hydrochloric_acid:"Ácido clorídrico",hydrogen_peroxide:"Peróxido de hidrogênio",activated_carbon:"Carvão ativado",purified_water:"Água purificada",copper_oxide:"Óxido de cobre",silver_dust:"Pó de prata",silver_nitrate:"Nitrato de prata",silver_chloride:"Cloreto de prata",sodium_nitrate:"Nitrato de sódio",chromatography_strip:"Cromatograma",pure_ethanol:"Etanol purificado",carbonate_solution:"Solução de carbonato",copper_crystal:"Cristal de sulfato de cobre",spectral_data:"Registro espectral",plated_iron:"Ferro cobreado",carbon_badge:"Insígnia do Prof. Carbono",periodic_key:"Chave da Tabela Periódica",cup:"Copo vazio",water_cup:"Copo com água",bucket:"Balde vazio",water_bucket:"Balde com água",raw_venison:"Carne crua de cervo",cooked_venison:"Carne assada de cervo",raw_pork:"Carne suína crua",cooked_pork:"Carne suína assada",raw_beef:"Carne bovina crua",cooked_beef:"Carne bovina assada",raw_rabbit:"Carne crua de coelho",cooked_rabbit:"Carne assada de coelho",raw_chicken:"Carne crua de frango",cooked_chicken:"Frango assado",raw_mutton:"Carne crua de ovelha",cooked_mutton:"Carne assada de ovelha",wool:"Lã",iron_helmet:"Capacete de ferro",iron_chestplate:"Peitoral de ferro",iron_leggings:"Calças de ferro",iron_boots:"Botas de ferro",lab_coat:"Jaleco científico",respirator_mask:"Máscara respiratória",rubber_boots:"Botas de borracha",oxygen_tank:"Cilindro de oxigênio",chitin_armor:"Armadura de quitina"};
Object.assign(ITEM_NAMES,window.QuimiCraftScience?.itemNames||{});
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
  equipmentVisualRoot.clear();applyCharacterStyleBase();const head=equipped.head?.id,face=equipped.face?.id,chest=equipped.chest?.id,hands=equipped.hands?.id,legs=equipped.legs?.id,feet=equipped.feet?.id,back=equipped.back?.id,offhand=equipped.offhand?.id;
  if(chest==="lab_coat"||chest==="chemical_lab_coat"){pCoatMat.color.set(chest==="chemical_lab_coat"?0xd5eee7:0xe8f0ee);pCoatShadeMat.color.set(chest==="chemical_lab_coat"?0x8fbeb2:0xb9cbc8)}
  else if(chest==="chainmail"||chest==="iron_chestplate"){pCoatMat.color.set(chest==="iron_chestplate"?0x8b9aa0:0x9aa5a8);pCoatShadeMat.color.set(0x65747b);part(equipmentVisualRoot,metalMat,[0,1.18,-.34],[.5,.55,.045])}
  else if(chest==="chitin_armor"){pCoatMat.color.set(0x9b704b);pCoatShadeMat.color.set(0x67462f);part(equipmentVisualRoot,leatherMat,[0,1.18,-.35],[.52,.58,.055])}
  else if(chest==="thermal_coat"){pCoatMat.color.set(0x55799b);pCoatShadeMat.color.set(0x344f6a);part(equipmentVisualRoot,pCoatMat,[0,1.2,-.35],[.54,.62,.05])}
  else if(chest==="cooling_vest"){pCoatMat.color.set(0x4fb7c5);pCoatShadeMat.color.set(0x2f7786);for(const x of[-.22,0,.22])part(equipmentVisualRoot,windGlassMat,[x,1.2,-.36],[.08,.46,.04])}
  else if(chest==="radiation_suit"){pCoatMat.color.set(0xc8bb45);pCoatShadeMat.color.set(0x756c26);part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:0x302f22}),[0,1.2,-.36],[.12,.12,.04])}
  else if(chest==="fire_suit"){pCoatMat.color.set(0x9b493a);pCoatShadeMat.color.set(0x5b2924);part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:0xd6aa51}),[0,1.2,-.36],[.08,.5,.035])}
  else if(chest==="diving_suit"||chest==="pressure_suit"){pCoatMat.color.set(chest==="pressure_suit"?0x344958:0x205169);pCoatShadeMat.color.set(0x142f3c);part(equipmentVisualRoot,metalMat,[0,1.2,-.35],[chest==="pressure_suit" ? .5 : .12,chest==="pressure_suit" ? .53 : .45,.04])}
  if(legs==="iron_leggings")pPantsMat.color.set(0x718087);
  if(head==="protective_goggles"){for(const x of [-.14,.14])part(equipmentVisualRoot,windGlassMat,[x,1.86,-.455],[.12,.08,.025]);part(equipmentVisualRoot,metalMat,[0,1.86,-.47],[.06,.025,.018])}
  else if(head==="iron_helmet"){part(equipmentVisualRoot,metalMat,[0,2.02,0],[.48,.16,.47]);for(const x of [-.43,.43])part(equipmentVisualRoot,metalMat,[x,1.88,0],[.055,.25,.4])}
  else if(head==="diving_mask"){part(equipmentVisualRoot,windGlassMat,[0,1.86,-.46],[.32,.13,.035]);part(equipmentVisualRoot,metalMat,[0,1.86,-.49],[.36,.025,.018])}
  else if(head==="face_shield"){part(equipmentVisualRoot,windGlassMat,[0,1.78,-.5],[.38,.31,.025]);part(equipmentVisualRoot,metalMat,[0,2.02,-.04],[.43,.055,.42])}
  if(face==="respirator_mask"||face==="gas_mask"){part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:face==="gas_mask"?0x40524e:0x596e72}),[0,1.72,-.46],[face==="gas_mask" ? .31 : .25,.16,.055]);for(const x of [-.22,.22])part(equipmentVisualRoot,metalMat,[x,1.72,-.48],[.07,.08,.035])}
  if(hands)for(const x of[-.44,.44])part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:hands==="chemical_gloves"?0x78a83e:hands==="heat_gloves"?0xb9653f:0xd6eef1}),[x,.91,-.02],[.2,.18,.22]);
  if(feet==="iron_boots")for(const x of [-.17,.17])part(equipmentVisualRoot,metalMat,[x,.15,-.055],[.27,.22,.34]);
  else if(feet==="rubber_boots"||feet==="insulated_boots")for(const x of [-.17,.17])part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:feet==="insulated_boots"?0x394957:0xd3b93e}),[x,.15,-.055],[.27,.22,.34]);
  else if(feet==="fins")for(const x of[-.17,.17])part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:0x3a9d94}),[x,.08,-.2],[.3,.08,.5]);
  if(back==="oxygen_tank"||back==="reinforced_oxygen_tank"){const reinforced=back==="reinforced_oxygen_tank",tankMat=new THREE.MeshStandardMaterial({color:reinforced?0x527a8d:0x6b9faa,roughness:.3,metalness:.5});for(const x of reinforced?[-.18,.18]:[.2]){part(equipmentVisualRoot,tankMat,[x,1.18,.49],[reinforced ? .15 : .18,.54,.16]);part(equipmentVisualRoot,metalMat,[x,1.52,.49],[.1,.07,.1])}}
  if(offhand==="shield"){part(equipmentVisualRoot,brassMat,[-.62,1.13,-.06],[.12,.58,.42]);part(equipmentVisualRoot,metalMat,[-.7,1.13,-.06],[.025,.43,.29])}
  else if(offhand==="sample_case")part(equipmentVisualRoot,leatherMat,[-.43,.88,.35],[.32,.23,.14]);
  else if(offhand==="underwater_flashlight"){part(equipmentVisualRoot,metalMat,[-.5,1.0,-.18],[.1,.28,.1]);part(equipmentVisualRoot,windGlassMat,[-.5,.82,-.18],[.13,.1,.13])}
  else if(offhand==="thermal_blanket")part(equipmentVisualRoot,new THREE.MeshLambertMaterial({color:0xd7b568}),[-.38,1.1,.05],[.08,.7,.48]);
  syncInventoryAvatar();player.breath=Math.min(player.breath,playerBreathMax())
}
function applyCharacterStyleBase(){const skin=CHARACTER_OPTIONS.skin[characterStyle.skin]||CHARACTER_OPTIONS.skin[2],hair=CHARACTER_OPTIONS.hair[characterStyle.hair]||CHARACTER_OPTIONS.hair[1],coat=CHARACTER_OPTIONS.coat[characterStyle.coat]||CHARACTER_OPTIONS.coat[0],accent=CHARACTER_OPTIONS.accent[characterStyle.accent]||CHARACTER_OPTIONS.accent[0],pants=CHARACTER_OPTIONS.pants[characterStyle.pants]||CHARACTER_OPTIONS.pants[0];pSkinMat.color.set(skin);pSkinLightMat.color.copy(shadeColor(skin,.11));pSkinShadeMat.color.copy(shadeColor(skin,-.1));pHairMat.color.set(hair);pCoatMat.color.set(coat);pCoatShadeMat.color.copy(shadeColor(coat,-.13));pSleeveMat.color.set(accent);pPantsMat.color.set(pants)}

function saveInventory(){try{localStorage.qc_inventory=JSON.stringify(invSlots)}catch(e){}}
function addItem(id,count=1){let s=invSlots.find(x=>x&&x.id===id);if(s)s.count+=count;else{const i=invSlots.findIndex(x=>!x);if(i>=0)invSlots[i]={id,count};else{toast("Mochila cheia");chatMessage("SISTEMA","Mochila cheia.",{category:"system"});return false}}saveInventory();renderInventory();elementMissions?.sync();return true}
function countItem(id){return invSlots.reduce((n,s)=>n+(s&&s.id===id?s.count:0),0)}
function removeItem(id,count){for(const s of invSlots){if(!s||s.id!==id)continue;const take=Math.min(count,s.count);s.count-=take;count-=take;if(!count)break}for(let i=0;i<invSlots.length;i++)if(invSlots[i]&&invSlots[i].count<=0)invSlots[i]=null;const removed=count===0;if(removed)elementMissions?.sync();return removed}
const LIQUID_REAGENT_PROFILES=Object.freeze({salt_water:["salt"],contaminated_water:["contaminated","industrial","acidic","alkaline"],distilled_water:["distilled"],water:["fresh","cold","hot"]});
function scienceInventoryCount(id){
  const profiles=LIQUID_REAGENT_PROFILES[id];if(!profiles)return countItem(id);
  return countItem(id)+invSlots.reduce((total,item)=>total+(item?.liquid&&profiles.includes(item.liquid.id)?item.count:0),0)
}
function removeScienceInventoryItem(id,quantity){
  let remaining=Math.max(0,Math.floor(quantity));if(!remaining)return true;
  const profiles=LIQUID_REAGENT_PROFILES[id],plain=Math.min(remaining,countItem(id));if(plain){removeItem(id,plain);remaining-=plain}
  if(!remaining||!profiles)return remaining===0;
  for(let i=0;i<invSlots.length&&remaining;i++){
    const item=invSlots[i];if(!item?.liquid||!profiles.includes(item.liquid.id))continue;
    const take=Math.min(remaining,item.count),empty=item.id==="water_bucket"?"bucket":item.id==="water_cup"?"cup":item.id==="hazardous_container"?"hazardous_container":null;if(!empty)continue;
    item.count-=take;remaining-=take;
    if(item.count<=0)invSlots[i]={id:empty,count:take};else insertInventoryItem(empty,take)
  }
  saveInventory();renderInventory();elementMissions?.sync();return remaining===0
}
const WEAPONS=new Set(["wind_staff","bow","iron_sword"]);function iconHTML(item){return item?`<span class="voxel-icon ${WEAPONS.has(item.id)?"weapon-icon":""}" style="--icon:${itemColor(item.id)}"></span><span class="slot-count">${item.count}</span>`:""}
function selectedItem(){return invSlots[state.selected]?.id}
function renderHotbar(){
  $("hotbar").innerHTML=invSlots.slice(0,9).map((it,i)=>`<div class="slot ${i===state.selected?"active":""}" data-hotbar="${i}" role="button" aria-label="Slot ${i+1}: ${itemDisplayName(it)}"><span class="slot-key">${i+1}</span>${iconHTML(it)}</div>`).join("");
  $("hotbar").querySelectorAll("[data-hotbar]").forEach(slot=>slot.addEventListener("pointerdown",event=>{if(!touchInput)return;event.preventDefault();chooseSlot(+slot.dataset.hotbar)}));
  refreshHeldItem();const id=selectedItem(),tips={wind_staff:"Cajado do Vento · clique: orbe · direito: ciclone",bow:`Arco comum · ${countItem("arrow")} flechas`,iron_sword:"Espada de ferro · golpe corpo a corpo"};$("combatChip").textContent=tips[id]||`${itemName(id??BLOCK.AIR)} · clique para quebrar`
}
let dragIndex=-1,dragEquipmentSlot="",touchInventoryIndex=-1,selectedRecipeIndex=0,recipeBookOpen=innerWidth>=980;
function syncInventoryAvatar(){
  const el=$("inventoryAvatar");if(!el)return;
  el.style.setProperty("--skin",CHARACTER_OPTIONS.skin[characterStyle.skin]||CHARACTER_OPTIONS.skin[2]);
  el.style.setProperty("--hair",CHARACTER_OPTIONS.hair[characterStyle.hair]||CHARACTER_OPTIONS.hair[1]);
  el.style.setProperty("--coat",CHARACTER_OPTIONS.coat[characterStyle.coat]||CHARACTER_OPTIONS.coat[0]);
  el.style.setProperty("--accent",CHARACTER_OPTIONS.accent[characterStyle.accent]||CHARACTER_OPTIONS.accent[0]);
  el.style.setProperty("--pants",CHARACTER_OPTIONS.pants[characterStyle.pants]||CHARACTER_OPTIONS.pants[0]);
  el.dataset.hairStyle=String(characterStyle.hairStyle||0);if(equipmentReady)for(const slot of EQUIPMENT_SLOTS)el.dataset[slot]=equipped[slot]?.id||"";
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
  {name:"Balde de ferro",desc:"3 ferros  →  1 balde",need:[[BLOCK.IRON,3]],out:["bucket",1]}
]
recipes.push(...window.QuimiCraftScience.createCraftingRecipes(BLOCK));
function recipeResearchReady(r){return !r.research||!!scienceSystem?.isResearchUnlocked(r.research)}
function recipeResearchLabel(r){return r.research?(scienceSystem?.researchNodes?.find(node=>node.id===r.research)?.name||r.research):""}
function canCraft(r){return recipeResearchReady(r)&&r.need.every(([id,n])=>scienceInventoryCount(id)>=n)}
function recipeNeedsLabel(r){return r.need.map(([id,n])=>`${n}× ${itemName(id)}`).join(" + ")}
function renderCraftPreview(){
  const r=recipes[selectedRecipeIndex]||recipes[0],grid=$("craftGrid"),out=$("craftOutput"),label=$("craftRecipeName");if(!grid||!out||!label)return;
  const ingredients=r?r.need.slice(0,4):[];grid.innerHTML=Array.from({length:4},(_,i)=>{const need=ingredients[i];return `<div class="mc-craft-slot" title="${need?`${need[1]}× ${itemName(need[0])}`:"Slot de criação"}">${need?`<span class="voxel-icon" style="--icon:${itemColor(need[0])}"></span><span class="slot-count">${need[1]}</span>`:""}</div>`}).join("");
  if(!r){out.innerHTML="";out.disabled=true;label.textContent="Selecione uma receita";return}
  const researchReady=recipeResearchReady(r),possible=canCraft(r);out.innerHTML=`<span class="voxel-icon" style="--icon:${itemColor(r.out[0])}"></span><span class="slot-count">${r.out[1]}</span>`;out.disabled=!possible;out.title=possible?`Criar ${r.name}`:researchReady?`Faltam materiais: ${recipeNeedsLabel(r)}`:`Pesquisa necessária: ${recipeResearchLabel(r)}`;label.textContent=`${r.name} · ${researchReady?r.desc:`Requer ${recipeResearchLabel(r)}`}`;label.classList.toggle("unavailable",!possible);
}
function renderRecipes(){
  const available=recipes.findIndex(canCraft);if(!recipes[selectedRecipeIndex])selectedRecipeIndex=available>=0?available:0;
  $("recipes").innerHTML=recipes.map((r,i)=>{const researchReady=recipeResearchReady(r),possible=canCraft(r);return `<button class="mc-recipe ${i===selectedRecipeIndex?"selected":""} ${possible?"available":"locked"} ${researchReady?"":"research-locked"}" data-recipe="${i}" type="button" title="${researchReady?r.desc:`Requer pesquisa: ${recipeResearchLabel(r)}`}"><span class="mc-recipe-icon"><span class="voxel-icon" style="--icon:${itemColor(r.out[0])}"></span><span class="slot-count">${r.out[1]}</span></span><span><strong>${r.name}</strong><small>${researchReady?recipeNeedsLabel(r):`Pesquisa · ${recipeResearchLabel(r)}`}</small></span><i>${possible?"✓":researchReady?"":"⌁"}</i></button>`}).join("");
  $("recipes").querySelectorAll("[data-recipe]").forEach(b=>b.onclick=()=>{selectedRecipeIndex=+b.dataset.recipe;renderRecipes()});renderCraftPreview();
}
function craft(i=selectedRecipeIndex){const r=recipes[i];if(!r)return;if(!recipeResearchReady(r))return toast(`Desbloqueie ${recipeResearchLabel(r)} na Árvore de Pesquisa`);if(!canCraft(r))return toast("Faltam materiais para essa receita");for(const [id,n] of r.need)removeScienceInventoryItem(id,n);addItem(r.out[0],r.out[1]);scienceSystem?.registerDiscovery("recipes",String(r.out[0]),{name:r.name,source:`Criada com ${recipeNeedsLabel(r)}`,relatedRecipes:[r.name],amountCollected:r.out[1],researchProgress:100});if(EQUIPMENT_DEFS[r.out[0]])scienceSystem?.registerDiscovery("missions","protective_equipment",{name:"Equipamento de proteção",source:r.name,researchProgress:100});sound("place",.35);toast(`${r.name} criada${r.out[1]>1?"s":""}`);saveInventory();renderInventory()}

const CHEM=[
  {id:"glass",name:"Fusão do vidro",eq:"SiO₂(s) + calor → SiO₂(vítreo)",need:[[BLOCK.SAND,4],[BLOCK.COAL,1]],out:[[BLOCK.GLASS,4]],next:"electrolysis",result:"Vidro translúcido para construções e laboratório."},
  {id:"electrolysis",name:"Eletrólise da água",eq:"2 H₂O(l) → 2 H₂(g) + O₂(g)",need:[["water",2],[BLOCK.IRON,1]],out:[["hydrogen",2],["oxygen",1]],next:"water",result:"Separa a molécula de água usando eletrodos de ferro."},
  {id:"water",name:"Síntese da água",eq:"2 H₂(g) + O₂(g) → 2 H₂O(l)",need:[["hydrogen",2],["oxygen",1]],out:[["water",2]],next:"indicator",result:"Reação exotérmica controlada dentro da bancada."},
  {id:"indicator",name:"Indicador natural",eq:"Pigmento vegetal + H₂O → indicador",need:[[BLOCK.LEAVES,2],["water",1]],out:[["indicator",3]],next:"acid",result:"Muda de cor na presença de ácidos e bases."},
  {id:"acid",name:"Ácido sulfúrico",eq:"S + O₂ + H₂O → H₂SO₄(aq)",need:[[BLOCK.SULFUR,1],["oxygen",1],["water",1]],out:[["acid",2]],next:"copper_sulfate",result:"Reagente forte. Manuseie apenas na bancada."},
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
  $("chemRecipes").innerHTML=CHEM.map((r,i)=>{const unlocked=dev.allRecipes||unlockedChem.has(r.id),possible=unlocked&&canChem(r);return `<button class="chem-recipe ${unlocked?"":"locked"}" data-chem="${i}" ${possible?"":"disabled"}><strong>${unlocked?r.name:"Reação não descoberta"}</strong><span class="chem-eq">${unlocked?r.eq:"??? + ??? → ???"}</span><span class="chem-result">${unlocked?r.result:"Explore minérios e converse com o Prof. Carbono."}</span></button>`}).join("");$("chemRecipes").querySelectorAll("[data-chem]").forEach(b=>b.onclick=()=>craftChem(+b.dataset.chem));updateChemHud()
}
function craftChem(i){const r=CHEM[i];if(!(dev.allRecipes||unlockedChem.has(r.id))||!canChem(r))return;for(const [id,n] of r.need)removeItem(id,n);for(const [id,n] of r.out)addItem(id,n);if(r.next)discover(r.next,r.name);saveInventory();renderChemistry();renderInventory();sound("torch",.7);reactionParticles(r.id);$("labNote").innerHTML=`<span class="discovery">REAÇÃO CONCLUÍDA</span><br>${r.eq}`;elementMissions?.recordEvent("reaction",{id:r.id});chatMessage("QUÍMICA",`Reação concluída: ${r.name}.`,{category:"chemistry"});updateMissionHud()}
function openChemistry(){state.chemistry=true;state.playing=false;state.left=false;$("chemistry").classList.add("open");document.exitPointerLock();elementMissions?.recordEvent("activate_station",{id:"chemistry"});renderChemistry();updateMissionHud()}
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
function openPeriodicTable(){state.periodic=true;state.playing=false;state.left=false;$("periodicTable").classList.add("open");$("periodicTable").setAttribute("aria-hidden","false");document.exitPointerLock();elementMissions.recordEvent("activate_station",{id:"periodic"});renderPeriodicTable()}
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
function openProfessor(){state.professor=true;state.playing=false;state.left=false;$("professor").classList.add("open");$("professor").setAttribute("aria-hidden","false");document.exitPointerLock();const first=!elementMissions.getStats().introduced;elementMissions.introduce();elementMissions.recordEvent("talk_npc",{id:"carbon"});if(first)messageCenter.add({category:"dialogue",speaker:"PROF. CARBONO",text:"Quero transformar esta tabela em um arquivo vivo dos 118 elementos. Vamos começar pelos elementos essenciais."});renderProfessor(first?"talk":professorView)}
function closeProfessor(){state.professor=false;$("professor").classList.remove("open");$("professor").setAttribute("aria-hidden","true");requestPointer()}
function reactionParticles(kind){if(settings.particles===0)return;const col=kind==="copper_sulfate"?0x3478e5:kind==="acid"?0x9edb54:0x62e5c0;for(let i=0;i<(settings.particles===1?7:14);i++){const p={x:player.pos.x+.5,y:player.pos.y+1,z:player.pos.z+.5,id:BLOCK.GLASS};const m=new THREE.Mesh(new THREE.SphereGeometry(.035+hash(i,2)*.045,5,4),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.8}));m.position.set(p.x+(hash(i,3)-.5),p.y+hash(i,4),p.z+(hash(i,5)-.5));m.userData.v=new THREE.Vector3((hash(i,6)-.5)*.6,.5+hash(i,7),(hash(i,8)-.5)*.6);m.userData.life=.8+hash(i,9);particleGroup.add(m);particles.push(m)}}

const SHOP_CATALOG={
  food:{title:"Mercearia da Colheita",subtitle:"Comidas preparadas e ingredientes da região.",goods:[["bread",3,2],["berries",2,3],["honey",4,2],["cheese",5,2],["plant_oil",5,1]]},
  armor:{title:"Forja Cobalto",subtitle:"Proteções, ferramentas e peças reforçadas.",goods:[["shield",10,1],["chainmail",14,1],["iron_helmet",12,1],["iron_boots",11,1],["armor_plate",8,1],["iron_sword",12,1],[BLOCK.BRONZE_BLOCK,9,2]]},
  solid:{title:"Reagentes Sólidos",subtitle:"Minerais e substâncias secas para novas reações.",goods:[[BLOCK.LIMESTONE,3,4],[BLOCK.NITER,5,2],[BLOCK.SULFUR,4,2],[BLOCK.SALT,3,3],[BLOCK.AMETHYST,8,1],[BLOCK.ZINC,6,1],["silver_dust",9,1],[BLOCK.COPPER,5,2]]},
  liquid:{title:"Reagentes Líquidos",subtitle:"Soluções preparadas em frascos selados.",goods:[["water",2,3],["acid",7,1],["indicator",5,2],["ammonia",6,2],["ethanol",6,2],["liquid_nitrogen",12,1],["hydrogen_peroxide",9,1],["purified_water",5,2]]},
  trinket:{title:"Berloques Prismáticos",subtitle:"Pequenos artefatos raros com propriedades especiais.",goods:[["lucky_charm",9,1],["prism_pendant",14,1],["wind_essence",8,1],["crystal_shard",7,2],["storm_focus",22,1],[BLOCK.SPECTRAL,6,2]]}
};
let currentShop="";
function openShop(kind){const s=SHOP_CATALOG[kind];if(!s)return;currentShop=kind;state.shop=true;state.playing=false;state.left=false;$('shopTitle').textContent=s.title;$('shopSubtitle').textContent=s.subtitle;$('shop').classList.add('open');document.exitPointerLock();renderShop()}
function renderShop(){const s=SHOP_CATALOG[currentShop];if(!s)return;$('shopWallet').textContent=`${countItem('gold_nugget')} pepitas de ouro`;$('shopGrid').innerHTML=s.goods.map(([id,price,count],i)=>`<button class="shop-item" data-buy="${i}" ${countItem('gold_nugget')>=price?'':'disabled'}><span class="shop-icon"><span class="voxel-icon" style="--icon:${itemColor(id)}"></span></span><span><strong>${itemName(id)} ×${count}</strong><small>${price} pepitas</small></span></button>`).join('');$('shopGrid').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyShop(+b.dataset.buy))}
function buyShop(i){const g=SHOP_CATALOG[currentShop]?.goods[i];if(!g)return;const [id,price,count]=g;if(countItem('gold_nugget')<price)return toast('Pepitas insuficientes');if(!invSlots.some(s=>s?.id===id)&&!invSlots.some(s=>!s)){toast('Mochila cheia');chatMessage("SISTEMA","Mochila cheia.",{category:"system"});return}removeItem('gold_nugget',price);addItem(id,count);saveInventory();renderInventory();renderShop();sound('pickup',.7);toast(`${itemName(id)} adquirido`)}
function closeShop(){state.shop=false;$('shop').classList.remove('open');requestPointer()}

const entityRoot=new THREE.Group(),entities=[],npcs=[];scene.add(entityRoot);let mobClock=0,hitClock=0;
const mobMats={
  copper:new THREE.MeshStandardMaterial({color:0xb96d43,roughness:.34,metalness:.66,emissive:0x241006}),copperDark:new THREE.MeshStandardMaterial({color:0x613826,roughness:.3,metalness:.72}),dark:new THREE.MeshLambertMaterial({color:0x26343a}),slime:new THREE.MeshStandardMaterial({color:0x70c95b,transparent:true,opacity:.82,roughness:.18,emissive:0x102d0c}),slimeDark:new THREE.MeshLambertMaterial({color:0x3d8039,transparent:true,opacity:.9}),cyan:new THREE.MeshStandardMaterial({color:0x63d7ce,roughness:.16,emissive:0x19443f}),brown:new THREE.MeshLambertMaterial({color:0x8f6242}),furDark:new THREE.MeshLambertMaterial({color:0x593b2c}),furLight:new THREE.MeshLambertMaterial({color:0xb9855b}),cream:new THREE.MeshLambertMaterial({color:0xd2bd98}),eye:new THREE.MeshBasicMaterial({color:0x0b1012}),iris:new THREE.MeshBasicMaterial({color:0xd9f5dc}),purple:new THREE.MeshStandardMaterial({color:0x7e5aa9,roughness:.22,emissive:0x24183a}),obsidian:new THREE.MeshStandardMaterial({color:0x292638,roughness:.3,metalness:.34,emissive:0x110b1b}),lava:new THREE.MeshStandardMaterial({color:0xf15b22,roughness:.2,emissive:0x7a1d05,emissiveIntensity:1.4}),sand:new THREE.MeshLambertMaterial({color:0xc79655}),sandDark:new THREE.MeshLambertMaterial({color:0x765238}),green:new THREE.MeshLambertMaterial({color:0x527349}),moss:new THREE.MeshLambertMaterial({color:0x48603e}),white:new THREE.MeshLambertMaterial({color:0xe8e1cf}),antler:new THREE.MeshLambertMaterial({color:0x765336}),bone:new THREE.MeshLambertMaterial({color:0xd9ceb0}),red:new THREE.MeshLambertMaterial({color:0x9d3f35}),pink:new THREE.MeshLambertMaterial({color:0xd98b92}),pinkDark:new THREE.MeshLambertMaterial({color:0xa95f66}),cowBlack:new THREE.MeshLambertMaterial({color:0x282b2d}),wool:new THREE.MeshLambertMaterial({color:0xe5dfcf}),sheepWool:new THREE.MeshLambertMaterial({color:0xf1ede1}),sheepWoolShade:new THREE.MeshLambertMaterial({color:0xd6cdbd}),sheepFace:new THREE.MeshLambertMaterial({color:0x4b4742}),sheepMuzzle:new THREE.MeshLambertMaterial({color:0xb8a18b}),sheepNose:new THREE.MeshLambertMaterial({color:0x2d2928}),sheepEarInner:new THREE.MeshLambertMaterial({color:0xc88986}),sheepHoof:new THREE.MeshLambertMaterial({color:0x262628}),beak:new THREE.MeshLambertMaterial({color:0xe0a23c})
};
Object.assign(mobMats,{eyeBrown:new THREE.MeshBasicMaterial({color:0x6b3f24}),eyeGreen:new THREE.MeshBasicMaterial({color:0x72b985}),eyeAmber:new THREE.MeshBasicMaterial({color:0xe1a83f}),eyeAcid:new THREE.MeshBasicMaterial({color:0x9cf06e}),eyeCrystal:new THREE.MeshBasicMaterial({color:0x70e8f0}),eyeViolet:new THREE.MeshBasicMaterial({color:0xb68cff}),eyeEmber:new THREE.MeshBasicMaterial({color:0xff7a2f})});
const NPC_PROFILES={
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
function createEntity(type,x,z,persistent=false){
  if(type==="npc")type="npc_carbon";const g=new THREE.Group(),h=findStandingY(x,z,terrainHeight(x,z)+2),rig={legs:[],arms:[],wings:[],tails:[],rotors:[],eyes:[],head:null,body:null};g.position.set(x,h,z);let speed=.45,hp=20,hostile=false,damage=0,name="Criatura",flying=false,role="";
  if(type==="npc_carbon"||type==="npc_ranger"){
    role=type==="npc_carbon"?"carbon":"ranger";name=role==="carbon"?"Prof. Carbono":"Guardiã Íris";hp=999;const cloth=role==="carbon"?coatMat:mobMats.green,hair=role==="carbon"?hairMat:mobMats.furDark;
    rig.body=part(g,cloth,[0,1.13,0],[.58,.72,.32]);part(g,role==="carbon"?coatShadeMat:mobMats.moss,[0,1.13,-.177],[.52,.62,.035]);part(g,leatherMat,[0,.83,-.19],[.61,.1,.07]);part(g,brassMat,[0,.83,-.226],[.1,.13,.045]);
    const head=new THREE.Group();head.position.set(0,1.79,0);g.add(head);rig.head=head;part(head,skinMat,[0,0,0],[.43,.43,.43]);part(head,hair,[0,.235,.015],[.47,.1,.45]);part(head,hair,[-.205,.06,.015],[.07,.29,.42]);for(const sx of [-1,1]){part(head,skinLightMat,[sx*.232,0,0],[.055,.13,.12]);brightEye(head,sx*.09,.045,-.226,.055,role==="carbon"?mobMats.eyeBrown:mobMats.eyeGreen);part(head,hair,[sx*.09,.13,-.232],[.11,.025,.018],[0,0,sx*.08])}part(head,skinLightMat,[0,-.005,-.241],[.065,.1,.05]);part(head,skinShadeMat,[0,-.145,-.232],[.1,.04,.018]);
    part(g,skinShadeMat,[0,1.54,0],[.18,.16,.18]);for(const sx of [-1,1]){part(g,cloth,[sx*.36,1.43,0],[.2,.22,.32]);jointArm(g,rig,sx*.45,1.5,0,cloth,skinLightMat,.7,.21);jointLeg(g,rig,sx*.17,0,.78,.82,.22,pantsMat,bootMat,sx>0?Math.PI:0)}
    if(role==="carbon"){
      part(g,coatMat,[-.2,1.18,-.181],[.24,.54,.028],[0,0,-.035]);part(g,coatMat,[.2,1.18,-.181],[.24,.54,.028],[0,0,.035]);part(g,mobMats.red,[0,1.35,-.198],[.08,.3,.025]);glassesFrame(g,-.09,1.835,-.258,.13,.1);glassesFrame(g,.09,1.835,-.258,.13,.1);part(g,metalMat,[0,1.835,-.26],[.05,.018,.014]);part(g,mobMats.cyan,[.2,1.03,-.19],[.15,.14,.018]);const flask=new THREE.Mesh(new THREE.OctahedronGeometry(.085,0),windGlassMat);flask.position.set(-.46,.77,-.08);g.add(flask)
    }else{
      part(g,mobMats.green,[0,2.02,.05],[.52,.22,.52]);part(g,mobMats.moss,[0,1.6,.205],[.68,.5,.09]);part(g,leatherMat,[.39,1.12,.25],[.17,.65,.22]);for(let q=0;q<5;q++)beam(g,metalMat,[.36,1.38-q*.12,.18],[.36,1.38-q*.12,-.3],.022,.022);for(let q=0;q<4;q++)part(g,hair,[-.26,1.62-q*.13,.18],[.09,.16,.1],[q*.12,0,-.2]);const backBow=weaponModel("bow",false);backBow.position.set(-.34,1.16,.35);backBow.rotation.set(.12,0,-.34);backBow.scale.multiplyScalar(.78);g.add(backBow)
    }
    const label=nameSprite(name+" · F",role==="carbon"?"#b8e5d6":"#d8e7a8");label.position.set(0,2.58,0);g.add(label);speed=0;persistent=true
  }else if(type.startsWith("npc_")){
    const p=NPC_PROFILES[type]||NPC_PROFILES.npc_farmer,cloth=new THREE.MeshLambertMaterial({color:p.color}),accent=new THREE.MeshStandardMaterial({color:p.accent,roughness:.38,metalness:p.accessory==="helm"?.58:.08}),npcSkin=new THREE.MeshLambertMaterial({color:p.skin}),npcSkinLight=npcSkin.clone(),npcHair=new THREE.MeshLambertMaterial({color:p.hair});npcSkinLight.color.offsetHSL(0,.015,.095);role=p.role;name=p.name;hp=999;rig.body=part(g,cloth,[0,1.12,0],[.58,.72,.32]);part(g,accent,[0,1.13,-.178],[.5,.16,.035]);part(g,leatherMat,[0,.83,-.19],[.61,.1,.07]);part(g,accent,[0,.83,-.226],[.1,.13,.045]);part(g,npcSkin,[0,1.55,0],[.18,.15,.18]);
    const head=new THREE.Group();head.position.set(0,1.79,0);g.add(head);rig.head=head;part(head,npcSkin,[0,0,0],[.43,.43,.43]);part(head,npcHair,[0,.245,.025],[.47,.12,.45]);part(head,npcHair,[-.205,.07,.025],[.075,.28,.42]);for(const sx of [-1,1]){part(head,npcSkinLight,[sx*.232,0,0],[.055,.13,.12]);brightEye(head,sx*.09,.045,-.226,.055,[mobMats.eyeBrown,mobMats.eyeGreen,mobMats.eyeAmber,mobMats.eyeViolet][Math.abs(Math.floor(p.color))%4]);part(head,npcHair,[sx*.09,.14,-.232],[.11,.025,.018],[0,0,sx*.08]);part(g,cloth,[sx*.36,1.43,0],[.2,.22,.32]);jointArm(g,rig,sx*.45,1.5,0,cloth,npcSkinLight,.7,.21);jointLeg(g,rig,sx*.17,0,.78,.82,.22,pantsMat,bootMat,sx>0?Math.PI:0)}part(head,npcSkinLight,[0,-.005,-.241],[.065,.1,.05]);part(head,npcSkin,[0,-.145,-.232],[.1,.04,.018]);
    if(p.accessory==="apron"){part(g,mobMats.cream,[0,1.08,-.202],[.43,.55,.025]);for(let q=-1;q<=1;q++)part(g,accent,[q*.14,.92,-.228],[.08,.11,.025])}
    if(p.accessory==="helm"||p.accessory==="lamp"){part(g,p.accessory==="helm"?metalMat:mobMats.dark,[0,2.04,.02],[.54,.2,.5]);if(p.accessory==="lamp")part(g,windGlassMat,[0,2.07,-.28],[.13,.12,.08])}
    if(p.accessory==="goggles"){glassesFrame(g,-.09,1.835,-.258,.13,.1);glassesFrame(g,.09,1.835,-.258,.13,.1);part(g,accent,[0,1.835,-.26],[.05,.018,.014])}
    if(p.accessory==="vials")for(let q=-1;q<=1;q++){const vial=new THREE.Mesh(new THREE.OctahedronGeometry(.065,0),q===0?windGlassMat:q<0?mobMats.purple:mobMats.slime);vial.position.set(q*.15,1.0,-.24);g.add(vial)}
    if(p.accessory==="crown"||p.accessory==="crystal"){for(let q=-1;q<=1;q++){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.085+Math.abs(q)*.015,0),q===0?windGlassMat:mobMats.purple);gem.position.set(q*.15,p.accessory==="crown"?2.12:1.12,-.08);gem.rotation.z=q*.25;g.add(gem)}}
    if(p.accessory==="hat"){part(g,accent,[0,2.05,0],[.67,.07,.64]);part(g,accent,[0,2.18,.02],[.38,.25,.38])}
    if(p.accessory==="flowers")for(let q=-2;q<=2;q++){const bud=new THREE.Mesh(new THREE.OctahedronGeometry(.055,0),q%2?mobMats.purple:mobMats.red);bud.position.set(q*.11,2.04-Math.abs(q)*.018,-.25);g.add(bud)}
    if(p.accessory==="book"){part(g,mobMats.red,[.27,1.08,-.24],[.23,.31,.06],[0,0,.18]);part(g,mobMats.cream,[.27,1.08,-.31],[.18,.25,.018],[0,0,.18])}
    if(p.accessory==="sash")part(g,accent,[0,1.22,-.205],[.12,.78,.028],[0,0,.45]);
    const label=nameSprite(name+" · F",p.shop?"#f1d985":"#c9e7c0");label.position.set(0,2.58,0);g.add(label);speed=0;persistent=true
  }else if(type==="slime"){
    name="Slime Ácido";hp=24;hostile=true;damage=7;speed=.82;const blob=new THREE.Group();g.add(blob);rig.body=blob;part(blob,mobMats.slime,[0,.4,0],[.88,.7,.8]);part(blob,mobMats.slime,[0,.82,.04],[.65,.3,.61]);part(blob,mobMats.slimeDark,[0,.18,-.41],[.6,.14,.04]);for(const sx of [-1,1]){brightEye(blob,sx*.23,.58,-.414,.075,mobMats.eyeAcid,true);part(blob,mobMats.dark,[sx*.2,.34,-.416],[.045,.04,.02])}for(let q=0;q<3;q++)part(blob,windGlassMat,[-.3+q*.29,.73+(q%2)*.12,.22],[.07,.08,.065]);for(let q=0;q<4;q++)part(g,mobMats.slime,[(q<2?-1:1)*.54,.09,(q%2?-.31:.31)],[.24,.18,.26])
  }else if(type==="cobrete"){
    name="Cobrete";hp=30;speed=.42;rig.body=part(g,mobMats.copper,[0,.86,0],[.62,.73,.44]);part(g,mobMats.copperDark,[0,.87,-.237],[.43,.5,.035]);part(g,brassMat,[0,.86,-.258],[.2,.27,.025]);part(g,mobMats.copper,[0,1.47,0],[.5,.44,.42]);part(g,mobMats.dark,[0,1.49,-.228],[.38,.26,.035]);for(const sx of [-1,1]){brightEye(g,sx*.14,1.52,-.247,.065,mobMats.eyeCrystal,true);jointArm(g,rig,sx*.48,1.18,0,mobMats.copper,mobMats.copperDark,.66,.19);jointLeg(g,rig,sx*.2,0,.62,.65,.2,mobMats.copper,mobMats.dark,sx>0?Math.PI:0);part(g,brassMat,[sx*.4,1.26,0],[.18,.22,.24])}part(g,brassMat,[0,1.78,0],[.17,.11,.18]);beam(g,brassMat,[0,1.79,0],[.15,2.02,-.04],.025);part(g,windGlassMat,[.17,2.05,-.05],[.055,.055,.055]);for(const sx of [-1,1]){const gear=new THREE.Mesh(new THREE.TorusGeometry(.18,.035,5,10),mobMats.copperDark);gear.position.set(sx*.33,.86,.46);gear.rotation.y=Math.PI/2;g.add(gear);rig.rotors.push(gear)}
  }else if(type==="cristalume"){
    name="Cristalume";hp=18;speed=.7;flying=true;const core=new THREE.Mesh(new THREE.OctahedronGeometry(.42,1),windGlassMat);core.position.y=.82;core.castShadow=true;g.add(core);rig.body=core;part(g,mobMats.purple,[0,.82,.18],[.22,.28,.22]);for(const sx of [-1,1]){brightEye(g,sx*.1,.9,-.35,.05,mobMats.eyeViolet);const wing=new THREE.Group();wing.position.set(sx*.24,.86,.04);wing.userData.side=sx;g.add(wing);beam(wing,brassMat,[0,0,0],[sx*.5,.09,.08],.025);beam(wing,brassMat,[0,0,0],[sx*.42,-.18,.1],.025);part(wing,windGlassMat,[sx*.3,-.02,.1],[.42,.055,.28],[0,0,sx*.24]);part(wing,mobMats.purple,[sx*.57,.02,.1],[.18,.04,.14],[0,0,sx*.45]);rig.wings.push(wing)}let crystalTail=[0,.63,.2];for(let q=0;q<3;q++){const next=[(q-1)*.12,.5-q*.1,.36+q*.12];beam(g,mobMats.purple,crystalTail,next,.026);const shard=new THREE.Mesh(new THREE.OctahedronGeometry(.12-q*.018,0),q===1?mobMats.purple:windGlassMat);shard.position.set(...next);shard.rotation.x=.5;g.add(shard);crystalTail=next}
  }else if(type==="scorpion"){
    name="Escorpião das Dunas";hp=20;hostile=true;damage=8;speed=1.05;for(let q=0;q<4;q++)part(g,q%2?mobMats.sandDark:mobMats.sand,[0,.27,-.34+q*.21],[.52-q*.045,.24,.28]);for(const sx of [-1,1])part(g,mobMats.sandDark,[sx*.1,.22,-.535],[.1,.08,.12],[0,sx*.25,sx*.2]);for(const sx of [-1,1]){brightEye(g,sx*.13,.36,-.495,.045,mobMats.eyeAmber,true);for(let q=0;q<4;q++){const leg=new THREE.Group();leg.position.set(sx*.3,.17,-.27+q*.18);leg.userData.phase=(q%2)*Math.PI;leg.userData.side=sx;g.add(leg);part(leg,mobMats.sandDark,[sx*.2,0,0],[.34,.055,.075],[0,0,sx*.38]);const tip=new THREE.Group();tip.position.set(sx*.36,-.04,0);leg.add(tip);part(tip,mobMats.dark,[sx*.17,-.12,0],[.32,.06,.06],[0,0,sx*.48]);rig.legs.push(leg)}const claw=new THREE.Group();claw.position.set(sx*.3,.32,-.48);claw.userData.side=sx;g.add(claw);beam(claw,mobMats.sandDark,[0,0,0],[sx*.28,.02,-.18],.1,.11);part(claw,mobMats.sand,[sx*.35,.03,-.23],[.22,.16,.2]);part(claw,mobMats.dark,[sx*.47,.11,-.34],[.16,.07,.08],[0,sx*.25,sx*.35]);part(claw,mobMats.dark,[sx*.47,-.05,-.34],[.16,.07,.08],[0,-sx*.25,-sx*.35]);rig.arms.push(claw)}
    let tail=new THREE.Group();tail.position.set(0,.38,.42);g.add(tail);for(let q=0;q<4;q++){tail.rotation.x=-.28+q*.08;part(tail,q%2?mobMats.sandDark:mobMats.sand,[0,.1,.1],[.18-q*.018,.2,.2-q*.018]);rig.tails.push(tail);const next=new THREE.Group();next.position.set(0,.18,.16);tail.add(next);tail=next}const sting=new THREE.Mesh(new THREE.OctahedronGeometry(.14,0),mobMats.dark);sting.position.set(0,.16,.12);sting.scale.z=1.45;tail.add(sting)
  }else if(type==="golem"){
    name="Golem de Obsidiana";hp=58;hostile=true;damage=14;speed=.34;rig.body=part(g,mobMats.obsidian,[0,1.14,0],[.9,.94,.52]);part(g,mobMats.obsidian,[0,1.66,0],[.38,.18,.36]);part(g,mobMats.purple,[0,1.18,-.282],[.3,.38,.045]);part(g,mobMats.moss,[-.3,1.63,-.3],[.25,.08,.24]);part(g,mobMats.obsidian,[0,1.94,0],[.65,.55,.56]);part(g,mobMats.dark,[0,1.77,-.302],[.4,.12,.04]);for(const sx of [-1,1]){brightEye(g,sx*.18,2.02,-.315,.075,mobMats.eyeViolet);jointArm(g,rig,sx*.72,1.56,0,mobMats.obsidian,mobMats.obsidian,.98,.34);jointLeg(g,rig,sx*.3,0,.78,.82,.36,mobMats.obsidian,mobMats.dark,sx>0?Math.PI:0);part(g,mobMats.obsidian,[sx*.7,1.62,0],[.42,.35,.46]);part(g,mobMats.purple,[sx*.23,1.13,-.286],[.07,.25,.035],[0,0,sx*.22])}for(let q=0;q<4;q++)part(g,mobMats.purple,[-.29+q*.19,.91+q*.12,-.286],[.08,.035,.025],[0,0,(q-2)*.35])
  }else if(type==="wisp"){
    name="Espectro da Tempestade";hp=19;hostile=true;damage=7;speed=.72;flying=true;const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.34,1),mobMats.purple);core.position.y=.76;g.add(core);rig.body=core;for(const sx of [-1,1])brightEye(g,sx*.11,.8,-.325,.05,mobMats.eyeCrystal);for(let q=0;q<3;q++){const ring=new THREE.Mesh(new THREE.TorusGeometry(.43+q*.1,.024,6,16),q===1?brassMat:windMat);ring.position.y=.76;ring.rotation.set(q*.7,q*.45,0);g.add(ring);ring.userData.phase=q;rig.rotors.push(ring)}for(const sx of [-1,1])beam(g,windMat,[sx*.12,.52,.12],[sx*.28,.05,.42],.035);const crown=new THREE.Mesh(new THREE.OctahedronGeometry(.12,0),windGlassMat);crown.position.set(0,1.18,0);g.add(crown)
  }else if(type==="magma"){
    name="Elemental de Magma";hp=42;hostile=true;damage=12;speed=.5;rig.body=part(g,mobMats.obsidian,[0,1.02,0],[.72,.83,.48]);part(g,mobMats.lava,[0,1.02,-.262],[.36,.5,.04]);part(g,mobMats.obsidian,[0,1.69,0],[.54,.46,.44]);part(g,mobMats.dark,[0,1.54,-.242],[.35,.1,.035]);for(const sx of [-1,1]){brightEye(g,sx*.16,1.75,-.255,.065,mobMats.eyeEmber,true);part(g,mobMats.obsidian,[sx*.43,1.4,0],[.24,.25,.32]);jointArm(g,rig,sx*.57,1.35,0,mobMats.obsidian,mobMats.lava,.78,.25);jointLeg(g,rig,sx*.24,0,.68,.72,.27,mobMats.obsidian,mobMats.dark,sx>0?Math.PI:0);beam(g,mobMats.obsidian,[sx*.18,1.93,0],[sx*.4,2.12,.05],.07);part(g,mobMats.lava,[sx*.23,1.03,-.267],[.06,.3,.025],[0,0,sx*.25])}for(let q=0;q<3;q++)part(g,mobMats.lava,[-.22+q*.22,.72+q*.17,-.267],[.08,.035,.025],[0,0,(q-1)*.5])
  }else if(type==="pig"){
    name="Porco";hp=18;speed=.52;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.pink,[0,.56,.06],[.82,.55,.52]);const head=new THREE.Group();head.position.set(0,.66,-.55);g.add(head);rig.head=head;part(head,mobMats.pink,[0,0,0],[.52,.45,.43]);part(head,mobMats.pinkDark,[0,-.08,-.39],[.3,.2,.16]);for(const sx of [-1,1]){brightEye(head,sx*.17,.09,-.235,.042,mobMats.eyeBrown);part(head,mobMats.pinkDark,[sx*.25,.28,-.03],[.15,.17,.08],[0,0,sx*.35]);part(head,mobMats.dark,[sx*.09,-.08,-.49],[.035,.045,.025]);for(const zOff of [-.25,.28])jointLeg(g,rig,sx*.31,zOff,.43,.43,.16,mobMats.pink,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI)}const tail=new THREE.Mesh(new THREE.TorusGeometry(.13,.025,5,12,Math.PI*1.55),mobMats.pinkDark);tail.position.set(0,.72,.5);tail.rotation.set(0,Math.PI/2,.4);g.add(tail)
  }else if(type==="cow"){
    name="Vaca";hp=30;speed=.45;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.82,.06],[1.02,.72,.58]);part(body,mobMats.cowBlack,[-.34,.9,-.3],[.33,.39,.04]);part(body,mobMats.cowBlack,[.26,.67,.33],[.4,.27,.04]);const head=new THREE.Group();head.position.set(0,1.05,-.72);g.add(head);rig.head=head;part(head,mobMats.cowBlack,[0,0,0],[.58,.55,.5]);part(head,mobMats.cream,[0,-.16,-.43],[.4,.23,.16]);for(const sx of [-1,1]){brightEye(head,sx*.2,.08,-.28,.052,mobMats.eyeBrown);beam(head,mobMats.antler,[sx*.2,.27,-.02],[sx*.42,.44,.02],.045);part(head,mobMats.cowBlack,[sx*.33,.22,-.02],[.18,.14,.1],[0,0,sx*.25]);for(const zOff of [-.33,.34])jointLeg(g,rig,sx*.38,zOff,.6,.65,.18,mobMats.white,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI)}part(g,mobMats.pinkDark,[0,.39,.1],[.3,.17,.25]);for(const sx of [-1,1])part(g,mobMats.pinkDark,[sx*.1,.25,.08],[.035,.18,.035]);const tail=new THREE.Group();tail.position.set(0,1.0,.55);g.add(tail);beam(tail,mobMats.cowBlack,[0,0,0],[0,-.55,.08],.035);part(tail,mobMats.cowBlack,[0,-.62,.09],[.12,.17,.1]);rig.tails.push(tail)
  }else if(type==="rabbit"){
    name="Coelho";hp=9;speed=1.0;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.cream,[0,.33,.05],[.52,.45,.48]);const head=new THREE.Group();head.position.set(0,.62,-.35);g.add(head);rig.head=head;part(head,mobMats.cream,[0,0,0],[.38,.37,.34]);for(const sx of [-1,1]){brightEye(head,sx*.13,.05,-.19,.043,mobMats.eyeBrown);part(head,mobMats.cream,[sx*.13,.4,.03],[.11,.55,.12],[0,0,sx*.08]);part(head,mobMats.pink,[sx*.13,.41,-.04],[.045,.4,.03]);jointLeg(g,rig,sx*.18,-.05,.26,.3,.12,mobMats.cream,mobMats.dark,sx>0?0:Math.PI);jointLeg(g,rig,sx*.22,.25,.25,.25,.16,mobMats.cream,mobMats.dark,sx>0?Math.PI:0)}part(head,mobMats.pinkDark,[0,-.08,-.25],[.07,.06,.04]);part(g,mobMats.white,[0,.4,.42],[.22,.22,.2])
  }else if(type==="chicken"){
    name="Galinha";hp=10;speed=.58;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.48,.04],[.58,.58,.52]);const head=new THREE.Group();head.position.set(0,.9,-.24);g.add(head);rig.head=head;part(head,mobMats.white,[0,0,0],[.34,.34,.32]);part(head,mobMats.beak,[0,-.03,-.3],[.18,.12,.14],[.2,0,0]);part(head,mobMats.red,[0,.3,0],[.12,.18,.1]);part(head,mobMats.red,[0,-.25,-.18],[.1,.18,.08]);for(const sx of [-1,1]){brightEye(head,sx*.12,.07,-.18,.04,mobMats.eyeAmber);jointLeg(g,rig,sx*.13,.02,.25,.28,.08,mobMats.beak,mobMats.dark,sx>0?Math.PI:0);const wing=new THREE.Group();wing.position.set(sx*.34,.5,.04);wing.userData.side=sx;g.add(wing);part(wing,mobMats.cream,[sx*.08,0,0],[.24,.36,.34],[0,0,sx*.18]);rig.wings.push(wing)}for(let q=-1;q<=1;q++)part(g,q===0?mobMats.red:mobMats.cowBlack,[q*.11,.61,.42],[.1,.34,.12],[.45,0,-q*.12])
  }else if(type==="sheep"){
    name="Ovelha";hp=24;speed=.48;
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
    name="Cervo da Taiga";hp=22;speed=.7;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.brown,[0,.75,.02],[.82,.54,.39]);part(body,mobMats.furLight,[0,.66,-.19],[.52,.22,.035]);part(g,mobMats.brown,[0,.96,-.37],[.36,.56,.32],[.38,0,0]);const head=new THREE.Group();head.position.set(0,1.22,-.55);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.4,.4,.38]);part(head,mobMats.furLight,[0,-.12,-.34],[.3,.2,.27]);part(head,mobMats.dark,[0,-.13,-.5],[.15,.11,.08]);for(const sx of [-1,1]){brightEye(head,sx*.14,.08,-.205,.047,mobMats.eyeBrown);part(head,mobMats.brown,[sx*.28,.22,-.08],[.18,.12,.1],[0,0,sx*.35]);jointLeg(g,rig,sx*.3,-.25,.53,.57,.15,mobMats.brown,mobMats.dark,sx>0?0:Math.PI);jointLeg(g,rig,sx*.3,.3,.53,.57,.15,mobMats.brown,mobMats.dark,sx>0?Math.PI:0);beam(head,mobMats.antler,[sx*.13,.18,0],[sx*.18,.63,.03],.035);beam(head,mobMats.antler,[sx*.18,.45,.02],[sx*.37,.58,.02],.03);beam(head,mobMats.antler,[sx*.18,.58,.02],[sx*.3,.75,.04],.03)}const tail=new THREE.Group();tail.position.set(0,.82,.22);tail.rotation.x=-.35;g.add(tail);part(tail,mobMats.white,[0,.13,.08],[.18,.32,.14]);rig.tails.push(tail)
  }else if(type==="owl"){
    name="Coruja Boreal";hp=12;speed=.55;flying=true;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.white,[0,.65,0],[.52,.62,.4]);for(let q=0;q<4;q++)part(body,q%2?mobMats.cream:mobMats.white,[0,.46+q*.13,-.215],[.36-q*.035,.08,.035]);const head=new THREE.Group();head.position.set(0,1.06,-.04);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.5,.42,.4]);for(const sx of [-1,1]){part(head,mobMats.cream,[sx*.16,.03,-.215],[.19,.2,.035]);brightEye(head,sx*.16,.05,-.232,.075,mobMats.eyeAmber);beam(head,mobMats.brown,[sx*.22,.25,0],[sx*.34,.45,.02],.05);const wing=new THREE.Group();wing.position.set(sx*.38,.72,.08);wing.userData.side=sx;g.add(wing);part(wing,mobMats.furDark,[-sx*.08,0,0],[.2,.18,.3]);for(let q=0;q<4;q++)part(wing,q%2?mobMats.furDark:mobMats.brown,[sx*(.12+q*.09),-.06-q*.06,.03],[.26,.11,.34-q*.04],[0,0,sx*(.22+q*.08)]);rig.wings.push(wing)}part(head,goldMat,[0,-.05,-.26],[.1,.09,.09]);for(const sx of [-1,1]){beam(g,mobMats.antler,[sx*.12,.38,-.04],[sx*.16,.17,-.11],.025);part(g,mobMats.dark,[sx*.17,.12,-.15],[.1,.045,.16])}for(let q=-1;q<=1;q++)part(g,mobMats.furDark,[q*.12,.3,.28],[.11,.36,.15],[.35,0,-q*.08])
  }else{
    type="capivara";name="Capivara";hp=20;speed=.46;const body=new THREE.Group();g.add(body);rig.body=body;part(body,mobMats.brown,[0,.57,.08],[.88,.58,.52]);part(body,mobMats.furLight,[0,.42,-.195],[.55,.2,.035]);part(g,mobMats.brown,[0,.68,-.3],[.46,.42,.42],[.15,0,0]);const head=new THREE.Group();head.position.set(0,.78,-.58);g.add(head);rig.head=head;part(head,mobMats.brown,[0,0,0],[.58,.5,.45]);part(head,mobMats.furLight,[0,-.08,-.34],[.38,.24,.24]);part(head,mobMats.dark,[0,-.08,-.47],[.2,.14,.08]);for(const sx of [-1,1]){part(head,mobMats.furDark,[sx*.23,.27,-.08],[.13,.14,.1]);brightEye(head,sx*.2,.11,-.238,.045,mobMats.eyeBrown);part(head,mobMats.cream,[sx*.09,-.2,-.462],[.07,.1,.04]);for(const zOff of [-.25,.28])jointLeg(g,rig,sx*.32,zOff,.45,.48,.17,mobMats.brown,mobMats.dark,(sx>0)===(zOff>0)?0:Math.PI);for(const yy of [-.06,.02])beam(head,mobMats.cream,[sx*.08,yy,-.44],[sx*.46,yy-.04,-.54],.012)}part(head,mobMats.cream,[0,-.23,-.46],[.13,.08,.035])
  }
  g.traverse(o=>{if(o.userData.entityEye)rig.eyes.push(o);if(o.isMesh){o.castShadow=settings.shadows>0;o.receiveShadow=settings.shadows>0}});const angle=hash(x,z,311)*TAU;g.rotation.y=angle+Math.PI;const e={type,name,group:g,x,z,y:flying?h+1.15:h,angle,walkPhase:hash(x,z,719)*TAU,timer:1+hash(x,z,312)*3,speed,persistent,phase:hash(x,z,313)*TAU,hp,maxHp:hp,hostile,damage,flying,attackCd:hash(x,z,817)*1.3,vx:0,vy:0,vz:0,onGround:!flying,jumpCooldown:hash(x,z,921)*.7,fleeTimer:0,fleeBias:0,rig,role,dead:false};g.position.y=e.y;entities.push(e);entityRoot.add(g);if(persistent)npcs.push(e);return e
}
function removeEntity(e){entityRoot.remove(e.group);let i=entities.indexOf(e);if(i>=0)entities.splice(i,1);i=npcs.indexOf(e);if(i>=0)npcs.splice(i,1);if(state.combatTarget===e){state.combatTarget=null;state.combatTargetTime=0}}
function mobPool(b,night=false){const pools={deserto:["scorpion","cobrete","chicken"],salinas:["scorpion","cobrete","wisp"],"cânion calcário":["golem","cobrete","scorpion","sheep"],badlands:["scorpion","cobrete","golem"],vulcânico:["magma","golem","wisp"],"bosque de cristais":["cristalume","wisp","cobrete"],taiga:["deer","owl","rabbit","sheep"],tundra:["deer","owl","golem","sheep"],"prado alpino":["deer","owl","rabbit","sheep"],"bosque de cerejeiras":["deer","owl","pig","rabbit"],"selva tropical":["capivara","slime","pig","chicken"],pântano:["slime","capivara","pig","wisp"],floresta:["deer","owl","pig","rabbit"],montanha:["golem","cobrete","owl","sheep"],"planície florida":["cow","pig","rabbit","chicken","sheep","deer"],planície:["cow","pig","rabbit","chicken","sheep","capivara"],savana:["cow","chicken","capivara","scorpion","deer"]};const p=[...(pools[b]||pools.planície)];if(night)p.push("slime","wisp","golem");return p}
function spawnMob(type){
  const pool=mobPool(biomeAt(player.pos.x,player.pos.z),state.day>.53&&state.day<.93);
  for(let tries=0;tries<24;tries++){
    const a=Math.random()*TAU,r=10+Math.random()*22,x=Math.floor(player.pos.x+Math.cos(a)*r)+.5,z=Math.floor(player.pos.z+Math.sin(a)*r)+.5;
    if(labBoundsContains(x,z,2)||villageBoundsContains(x,z,1))continue;
    const h=findStandingY(x,z,terrainHeight(x,z)+2);
    if(h<=WATER_LEVEL+1||getBlock(Math.floor(x),h-1,Math.floor(z))===BLOCK.LAVA)continue;
    if(hasRoofAbove(x,z,h,6))continue;
    if(BDEF[getBlock(Math.floor(x),h,Math.floor(z))]?.solid||BDEF[getBlock(Math.floor(x),h+1,Math.floor(z))]?.solid)continue;
    return createEntity(type||pool[Math.floor(Math.random()*pool.length)],x,z)
  }
  return null
}
function ensureProfessorCarbono(){
  const professorAnchor=LAB_ANCHORS["professor-position"];let professor=npcs.find(npc=>npc.role==="carbon");if(!professor)professor=createEntity("npc_carbon",professorAnchor.x,professorAnchor.z,true);professor.x=professorAnchor.x;professor.z=professorAnchor.z;professor.y=findStandingY(professor.x,professor.z,LAB_LAYOUT.y);professor.group.position.set(professor.x,professor.y,professor.z);return professor
}
function initWorldLife(){
  ensureProfessorCarbono();
  let ranger=npcs.find(n=>n.role==="ranger");if(!ranger)ranger=createEntity("npc_ranger",spawn.x-3.5,spawn.z+4.5,true);ranger.x=spawn.x-3.5;ranger.z=spawn.z+4.5;ranger.y=findStandingY(ranger.x,ranger.z,terrainHeight(ranger.x,ranger.z)+2);ranger.group.position.set(ranger.x,ranger.y,ranger.z);
  const shopTypes=["npc_food","npc_armor","npc_solid","npc_liquid","npc_trinket"];shopTypes.forEach((type,i)=>{const role=NPC_PROFILES[type].role;if(!npcs.some(n=>n.role===role))createEntity(type,VILLAGE.x+(i-2)*VILLAGE.spacing+.5,VILLAGE.z-4.5,true)});
  const residentTypes=["npc_farmer","npc_miner","npc_botanist","npc_glazier","npc_ceramist","npc_teacher","npc_mayor","npc_baker","npc_fisher","npc_geologist"],homes=VILLAGE_BUILDINGS.filter(b=>b.kind==="house");residentTypes.forEach((type,i)=>{const role=NPC_PROFILES[type].role,b=homes[(i*3)%homes.length];if(!npcs.some(n=>n.role===role))createEntity(type,b.x+.5,b.z-4.35,true)});
  const desiredMobCount=[0,5,10,16][settings.mobs],currentMobCount=entities.filter(entity=>!entity.persistent).length;for(let i=currentMobCount;i<desiredMobCount;i++)spawnMob()
}
function turnToward(a,b,t){const d=Math.atan2(Math.sin(b-a),Math.cos(b-a));return a+d*clamp(t,0,1)}
function animateEntityRig(e,dt,now,pace,dist){
  const r=e.rig;if(!r)return;e.walkPhase+=dt*(1.4+pace*7.5);const gait=e.walkPhase,engaged=e.hostile&&dist<2.1;
  const airborne=!e.flying&&!e.onGround;
  r.legs.forEach((leg,i)=>{const phase=leg.userData.phase??(i%2?Math.PI:0),s=Math.sin(gait+phase);if(e.type==="scorpion"){leg.rotation.z=leg.userData.side*(.08+s*.14);leg.rotation.y=s*.1}else if(airborne){leg.rotation.x=(i%2?-.34:.34);leg.rotation.z=0;if(leg.userData.lower)leg.userData.lower.rotation.x=.42}else{leg.rotation.x=s*(pace>0?.48:.015);leg.rotation.z=0;if(leg.userData.lower)leg.userData.lower.rotation.x=Math.max(0,-s)*.35}});
  r.arms.forEach((arm,i)=>{const side=arm.userData.side||((i%2)*2-1);if(e.type==="scorpion"){arm.rotation.y=side*(.05+Math.sin(now*.004+i)*.08);arm.rotation.x=engaged?-.22:0}else{const attack=engaged?Math.sin(now*.012)*.48:0;arm.rotation.x=Math.sin(gait+(i%2?0:Math.PI))*(pace>0?.32:.025)-attack;arm.rotation.z=side*(e.type==="golem"?-.08:0);if(arm.userData.lower)arm.userData.lower.rotation.x=engaged?-.38:Math.max(0,Math.sin(gait+i*Math.PI))*.18}});
  r.wings.forEach((wing,i)=>{const side=wing.userData.side||((i%2)*2-1),flap=Math.sin(now*(e.type==="owl"?.0095:e.type==="chicken"?.005:.012)+e.phase),amount=e.type==="chicken"?.18:.68;wing.rotation.z=side*(.2+flap*amount);wing.rotation.x=flap*.08});
  r.tails.forEach((tail,i)=>{tail.rotation.y=Math.sin(now*.0028+e.phase+i*.55)*(.1+i*.025);tail.rotation.z=Math.sin(now*.0031+e.phase+i)*(.035+i*.008)});
  r.rotors.forEach((rotor,i)=>{rotor.rotation.z+=dt*(1.7+i*.55);rotor.rotation.x+=dt*(i%2?.35:-.28)});
  const blinkPhase=(now*.001+e.phase*.71)%4.8,blink=blinkPhase>4.58?Math.max(.08,Math.abs(blinkPhase-4.69)*9):1;r.eyes.forEach((eye,i)=>{eye.scale.y=lerp(eye.scale.y,blink,.45);if(eye.userData.pupil)eye.userData.pupil.position.x=Math.sin(now*.0011+e.phase+i*.35)*eye.userData.size*.09});
  if(r.head){r.head.rotation.y=Math.sin(now*.0014+e.phase)*(.05+(e.persistent?.06:.02));r.head.rotation.x=e.hostile&&dist<6?-.04:Math.sin(now*.0018+e.phase)*.018}
  if(e.type==="slime"&&r.body){const squash=1+Math.sin(now*.007+e.phase)*.09;r.body.scale.set(1+(1-squash)*.32,squash,1+(1-squash)*.32);r.body.position.y=(1-squash)*.19}
  else if((e.type==="wisp"||e.type==="cristalume")&&r.body){r.body.rotation.y+=dt*1.3;r.body.rotation.x=Math.sin(now*.0025+e.phase)*.18}
}
function entityRadius(e){return e.type==="golem"?.62:e.type==="cow"?.62:e.type==="capivara"?.56:e.type==="deer"?.5:(e.type==="pig"||e.type==="sheep")?.48:e.type==="rabbit"?.28:e.type==="chicken"?.3:e.type==="owl"?.34:e.flying?.4:e.persistent?.42:.4}
function findEntityGroundY(x,z,currentY,maxRise=.12){
  const ix=Math.floor(x),iz=Math.floor(z),rise=Math.max(.02,maxRise||0),top=Math.min(MAX_Y-3,Math.floor(currentY+rise)-1);
  for(let floorY=top;floorY>=0;floorY--){
    if(!BDEF[getBlock(ix,floorY,iz)]?.solid)continue;
    if(BDEF[getBlock(ix,floorY+1,iz)]?.solid||BDEF[getBlock(ix,floorY+2,iz)]?.solid)continue;
    return floorY+1
  }
  return 0
}
function entityCollidesWorld(e,x,z,baseY=e.y){
  const r=entityRadius(e),collisionY=e.flying?baseY+.18:baseY+.02,minX=Math.floor(x-r),maxX=Math.floor(x+r),minY=Math.floor(collisionY),maxY=Math.floor(collisionY+(e.flying?1.55:1.9)),minZ=Math.floor(z-r),maxZ=Math.floor(z+r);
  for(let xx=minX;xx<=maxX;xx++)for(let yy=minY;yy<=maxY;yy++)for(let zz=minZ;zz<=maxZ;zz++)if(BDEF[getBlock(xx,yy,zz)]?.solid)return true;
  if(aabbHitsLabDecor(x-r,x+r,collisionY,collisionY+(e.flying?1.55:1.9),z-r,z+r))return true;
  return false
}
function moveEntityWithCollision(e,nx,nz,nh,dt){
  const tryAxis=(ax,az)=>{
    const nextY=e.flying?Math.max(nh+1.15,e.y):e.y;
    if(entityCollidesWorld(e,ax,az,nextY))return false;
    e.x=ax;e.z=az;
    if(e.flying)e.y=lerp(e.y,nextY,1-Math.pow(.0006,dt));
    return true
  };
  if(tryAxis(nx,nz))return true;
  if(tryAxis(nx,e.z))return true;
  if(tryAxis(e.x,nz))return true;
  return false
}
function isPassiveMob(e){return !!e&&!e.persistent&&!e.hostile}
function passiveFleeMultiplier(e){return {rabbit:3.8,chicken:3.45,deer:3.25,pig:3.05,sheep:2.95,capivara:2.85,cow:2.65,cobrete:2.8,cristalume:3.1,owl:3.15}[e.type]||2.75}
function entityJumpPower(e){return {rabbit:6.9,deer:5.9,sheep:5.45,pig:5.25,cow:5.05,chicken:5.2,capivara:5.2,slime:5.5,scorpion:4.9,golem:4.45,magma:5,cobrete:4.9}[e.type]||5.15}
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
  if(!e.onGround||(e.vy||0)!==0||e.y>ground+.045){
    e.vy=Math.max(-28,(e.vy||0)-18.5*dt);
    const nextY=e.y+e.vy*dt;
    if(e.vy>0&&entityCollidesWorld(e,e.x,e.z,nextY)){e.vy=0;e.onGround=false}
    else if(e.vy<=0&&nextY<=ground){e.y=ground;e.vy=0;e.onGround=true}
    else{e.y=nextY;e.onGround=false}
  }else e.y=ground
}
function updateEntities(dt,now){
  mobClock+=dt;hitClock=Math.max(0,hitClock-dt);
  const cap=[0,7,13,20][settings.mobs];
  if(mobClock>2.2){mobClock=0;if(entities.filter(e=>!e.persistent).length<cap)spawnMob()}
  for(const e of [...entities]){
    if(e.dead)continue;
    const dx=player.pos.x-e.x,dz=player.pos.z-e.z,dist=Math.hypot(dx,dz);
    if(!e.persistent&&labBoundsContains(e.x,e.z,1)&&e.y<=LAB_LAYOUT.y+4){removeEntity(e);continue}
    if(!e.persistent&&dist>settings.render*CHUNK*1.5){removeEntity(e);continue}
    e.attackCd=Math.max(0,e.attackCd-dt);
    e.jumpCooldown=Math.max(0,(e.jumpCooldown||0)-dt);
    e.fleeTimer=Math.max(0,(e.fleeTimer||0)-dt);
    if(e.persistent){
      const desiredY=e.role==="carbon"?LAB_LAYOUT.y:findStandingY(e.x,e.z,e.y);
      e.y=lerp(e.y,desiredY,1-Math.pow(.0001,dt));e.group.position.set(e.x,e.y,e.z);
      e.group.rotation.y=turnToward(e.group.rotation.y,Math.atan2(dx,dz)+Math.PI,1-Math.pow(.0001,dt));
      animateEntityRig(e,dt,now,0,dist);continue
    }
    const fleeing=isPassiveMob(e)&&e.fleeTimer>0;
    e.timer-=dt;
    if(e.timer<=0){
      e.timer=fleeing?.45+Math.random()*.75:1.4+Math.random()*3.7;
      if(fleeing)e.fleeBias=clamp((e.fleeBias||0)+(Math.random()-.5)*.42,-1.05,1.05);
      else e.angle+=(-1+Math.random()*2)*1.9
    }
    if(e.hostile&&dist<11)e.angle=Math.atan2(dx,dz);
    else if(fleeing){
      const awayAngle=Math.atan2(-dx,-dz)+(e.fleeBias||0);
      e.angle=turnToward(e.angle,awayAngle,1-Math.pow(.000003,dt))
    }
    const pace=e.speed*(e.hostile&&dist<11?1.18:fleeing?passiveFleeMultiplier(e):1);
    const nx=e.x+Math.sin(e.angle)*pace*dt+e.vx*dt,nz=e.z+Math.cos(e.angle)*pace*dt+e.vz*dt;
    e.vx*=Math.pow(.08,dt);e.vz*=Math.pow(.08,dt);
    let moved=false;
    if(e.flying){
      const nh=terrainHeight(nx,nz)+1;
      if(nh>WATER_LEVEL&&Math.abs(nh-e.y)<2.2)moved=moveEntityWithCollision(e,nx,nz,nh,dt);
    }else{
      const currentGround=findEntityGroundY(e.x,e.z,e.y,.12),targetGround=findEntityGroundY(nx,nz,e.y,1.42);
      if(e.y<=currentGround+.045&&(e.vy||0)<=0){e.y=currentGround;e.vy=0;e.onGround=true}
      else if(e.y>currentGround+.045)e.onGround=false;
      const blockedAhead=entityCollidesWorld(e,nx,nz,e.y),stepUp=targetGround-e.y;
      if((blockedAhead||stepUp>.34)&&stepUp>0&&stepUp<1.45)requestEntityJump(e,true);
      else if(fleeing&&e.onGround&&e.jumpCooldown<=0&&((e.type==="rabbit"&&Math.random()<dt*.9)||(e.type==="deer"&&Math.random()<dt*.13)))requestEntityJump(e,false);
      if(!blockedAhead)moved=moveEntityWithCollision(e,nx,nz,targetGround,dt);
      updateEntityVerticalMotion(e,dt)
    }
    if(!moved){
      const direction=Math.random()<.5?-1:1,turn=Math.PI*(.42+Math.random()*.32)*direction;
      e.angle+=turn;
      if(fleeing)e.fleeBias=clamp((e.fleeBias||0)+turn*.42,-1.25,1.25)
    }
    const float=e.flying?.76+Math.sin(now*.003+e.phase)*.24:0;
    e.group.position.set(e.x,e.y+float,e.z);
    e.group.rotation.y=turnToward(e.group.rotation.y,e.angle+Math.PI,1-Math.pow(.00005,dt));
    animateEntityRig(e,dt,now,moved?pace:0,dist);
    if(e.hostile&&dist<1.25&&e.attackCd<=0){
      e.attackCd=e.type==="golem"?1.8:1.05;damagePlayer(e.damage,e.name);sound("land",.3);
      player.vel.add(new THREE.Vector3(dx,0,dz).normalize().multiplyScalar(e.type==="golem"?5:2.5))
    }else if(e.type==="wisp"&&dist<8&&e.attackCd<=0){
      e.attackCd=2.2;const from=new THREE.Vector3(e.x,e.y+1.4,e.z),dir=player.pos.clone().add(new THREE.Vector3(0,.8,0)).sub(from).normalize();launchProjectile("enemy",from,dir,true)
    }
  }
}
function nearestNPC(){return npcs.map(n=>({n,d:Math.hypot(player.pos.x-n.x,player.pos.z-n.z)})).filter(q=>q.d<4).sort((a,b)=>a.d-b.d)[0]?.n||null}
function updateInteraction(){const t=state.target,n=nearestNPC(),station=nearestLabStation(),el=$("interaction");let text="";if(n?.role==="carbon")text="Aperte E para falar com o Prof. Carbono";else if(nearPeriodicTable())text="E · Consultar Tabela Periódica";else if(nearLabDoor())text="E ou botão direito · Abrir/fechar porta do laboratório";else if(n)text=n.role.startsWith("shop_")?`E · Abrir ${SHOP_CATALOG[n.role.slice(5)]?.title||"loja"}`:`E · Conversar com ${n.name}`;else if(t&&(t.id===BLOCK.DOOR||t.id===BLOCK.DOOR_OPEN))text="Botão direito · Abrir/fechar porta";else if(t&&t.id===BLOCK.FURNACE)text="E ou botão direito · Assar carne (usa carvão)";else if(station)text=`E ou botão direito · Usar ${scienceSystem?.stations[station.stationIds[0]]?.name||"estação científica"}`;else if(t&&t.id===BLOCK.LAB)text="E ou botão direito · Usar Bancada Química";el.textContent=text;el.classList.toggle("show",!!text)}
function interact(){const n=nearestNPC();if(n?.role==="carbon"){if(!localStorage.qc_carbon_intro_gift_v60){addItem("water",2);localStorage.qc_carbon_intro_gift_v60="1";chatMessage("PROF. CARBONO","Separei duas amostras de água destilada para suas primeiras pesquisas.",{category:"dialogue"})}discover("indicator","Indicadores naturais");discover("salt_solution","Soluções iônicas");discover("copper_oxide","Óxidos metálicos");scienceSystem?.registerDiscovery("missions","carbon_tutorial",{name:"Primeiros passos com Prof. Carbono",source:"Laboratório Carbono",researchProgress:100});return openProfessor()}if(nearPeriodicTable())return openPeriodicTable();if(nearLabDoor())return toggleLabMainDoor();if(n?.role==="ranger"){chatMessage("GUARDIÃ ÍRIS","Criaturas hostis aparecem à noite e em regiões vulcânicas. O cajado empurra inimigos; o arco mantém distância.",{category:"dialogue"});if(!localStorage.qc_rangerGift){addItem("arrow",20);addItem("wind_essence",1);localStorage.qc_rangerGift="1";chatMessage("GUARDIÃ ÍRIS","Leve estas flechas e uma essência do vento.",{category:"dialogue"})}return}if(n?.role?.startsWith("shop_")){const kind=n.role.slice(5),profile=Object.values(NPC_PROFILES).find(p=>p.role===n.role);chatMessage(n.name.toUpperCase(),profile?.talk||"Veja o que chegou hoje.",{category:"dialogue"});if(kind==="solid"){discover("calcination","Química dos carbonatos");discover("nitrate","Química dos nitratos")}if(kind==="liquid"){discover("ammonia_complex","Complexos de coordenação");discover("cryogenics","Mudanças de estado")}if(kind==="food")discover("fermentation","Fermentação");return openShop(kind)}if(n){const profile=Object.values(NPC_PROFILES).find(p=>p.role===n.role);chatMessage(n.name.toUpperCase(),profile?.talk||"A Vila dos Elementos está sempre mudando.",{category:"dialogue"});if(n.role==="botanist")discover("ph_kit","Escala de pH");if(n.role==="geologist")discover("spectroscopy","Espectroscopia de cristais");return}if(state.target?.id===BLOCK.FURNACE)return cookWithFurnace();const station=nearestLabStation();if(station){elementMissions?.recordEvent("activate_station",{id:station.stationIds.includes("chemistry_workbench")?"chemistry":station.stationIds[0]});return scienceUI?.openStation(station.stationIds)}if(state.target?.id===BLOCK.LAB)return openChemistry();if(state.target&&(state.target.id===BLOCK.DOOR||state.target.id===BLOCK.DOOR_OPEN))toggleDoor(state.target)}
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
const LAB_ANCHORS=Object.freeze({
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
  labCollisionBoxes.length=0;periodicCollisionBoxes.length=0;labStationZones.length=0;labPropPlacements.length=0;labColliderIds.clear();periodicColliderIds.clear();labAtomRoot=labCryoCore=labDoorVisualRoot=null;
  const root=new THREE.Group();root.name="Professor Carbono · Authored Laboratory";labDecorRoot=root;scene.add(root);periodicWallRoot=new THREE.Group();periodicWallRoot.name="Periodic Element Block Wall";root.add(periodicWallRoot);
  const {cx,cz,halfW,halfD,y}=LAB_LAYOUT,front=cz-halfD,metal=labMaterial(0x29373e,.72,.28),white=labMaterial(0xe5ecea,.12,.28),counter=labMaterial(0x17282e,.58,.2),teal=labMaterial(0x4ec8b4,.18,.2,0x123f39),brass=labMaterial(0xd6aa51,.78,.22),dark=labMaterial(0x111b20,.58,.22),ceramic=labMaterial(0xe4d7c7,.04,.42),violet=labMaterial(0x8069ba,.18,.25,0x211842),glass=new THREE.MeshStandardMaterial({color:0x9ee8ee,transparent:true,opacity:.28,roughness:.05,metalness:.08,depthWrite:false,depthTest:true,colorWrite:true,side:THREE.DoubleSide});
  glass.userData.intentionalTransparency=true;
  const addBox=(parent,x1,y1,z1,sx,sy,sz,material=white,ry=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);mesh.position.set(x1,y1,z1);mesh.rotation.y=ry;parent.add(mesh);return mesh};
  const addCylinder=(parent,x1,y1,z1,rt,rb,h,material=metal,segments=16)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);mesh.position.set(x1,y1,z1);parent.add(mesh);return mesh};
  const addBottleSet=(parent,x1,y1,z1,count=4)=>{for(let index=0;index<count;index++)makeBottle(parent,x1+(index-(count-1)/2)*.72,y1,z1,[0x4ed0b3,0xd46799,0x6f8ee8,0xe2c64d][index%4],.7)};
  const buildProp=placement=>{
    const {definition:def,x,z}=placement,group=new THREE.Group();group.name=def.id;group.userData={stableId:def.id,placement:{...def},anchor:def.anchor};root.add(group);
    if(def.kind==="reception"){addBox(group,x,y+.55,z,6,1.05,1.35,counter);addBox(group,x,y+1.14,z,6.15,.14,1.48,white);makeScreen(group,x+1.6,y+1.63,z-.72,1.18,.55,0,0x70f2cf);makeBottle(group,x-1.8,y+1.38,z-.2,0x57cde2,.82);addLabStation(x,z,3.3,["sample_storage"],def.id)}
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
  const portalCenter=cx-.5,portalHalf=2,doorwayZ=front+.5;addBox(root,portalCenter-(portalHalf+.58),y+2.15,front+.08,.28,4.3,.4,metal);addBox(root,portalCenter+(portalHalf+.58),y+2.15,front+.08,.28,4.3,.4,metal);addBox(root,portalCenter,y+4.2,front+.08,5.46,.32,.4,metal);addBox(root,portalCenter,y+3.96,front-.14,5.14,.1,.46,teal);
  const doorRoot=new THREE.Group(),doorCubeGeometry=new THREE.BoxGeometry(1,1,1);doorRoot.name="Carbon Grand Airlock";labDoorVisualRoot=doorRoot;root.add(doorRoot);const doorPart=(parent,material,pos,scale)=>{const mesh=new THREE.Mesh(doorCubeGeometry,material);mesh.position.set(...pos);mesh.scale.set(...scale);parent.add(mesh);return mesh},makeLeaf=side=>{const leaf=new THREE.Group(),dir=side<0?1:-1,panelW=1.96,center=dir*panelW*.5;leaf.position.set(side<0?portalCenter-portalHalf:portalCenter+portalHalf,y,doorwayZ);doorPart(leaf,metal,[center,1.08,0],[panelW,2.08,.15]);doorPart(leaf,teal,[center,2.35,0],[panelW,1.06,.15]);doorPart(leaf,glass,[center,2.35,-.084],[panelW-.34,.78,.026]);doorPart(leaf,brass,[center,.14,-.096],[panelW-.2,.08,.04]);doorPart(leaf,brass,[center,3,-.096],[panelW-.2,.08,.04]);doorRoot.add(leaf);return leaf};
  doorRoot.userData.left=makeLeaf(-1);doorRoot.userData.right=makeLeaf(1);const doorOpen=getBlock(cx-2,y,front)===BLOCK.DOOR_OPEN;doorRoot.userData.left.rotation.y=doorOpen?-Math.PI/2:0;doorRoot.userData.right.rotation.y=doorOpen?Math.PI/2:0;
  refreshPeriodicWall();
  recordLabGenerationStep("generate-periodic-table");
  for(const definition of LAB_PROP_DEFINITIONS.filter(item=>item.kind==="atom")){const placement=resolveLabPropPlacement(definition);if(placement)buildProp(placement);else console.warn(`[QuimiCraft][Laboratório] Prop decorativo ignorado: ${definition.id}`)}
  recordLabGenerationStep("generate-decorative-equipment");
  for(const definition of LAB_PROP_DEFINITIONS.filter(item=>item.kind==="light")){const placement=resolveLabPropPlacement(definition);if(placement)buildProp(placement);else console.warn(`[QuimiCraft][Laboratório] Luminária ignorada: ${definition.id}`)}
  recordLabGenerationStep("generate-lighting");
  recordLabGenerationStep("generate-collision-data");
  root.traverse(object=>{if(object.isMesh){object.castShadow=settings.shadows>0;object.receiveShadow=settings.shadows>0;object.visible=true;if(object.material&&!Array.isArray(object.material)&&!object.material.transparent){object.material.opacity=1;object.material.depthWrite=true;object.material.depthTest=true;object.material.colorWrite=true}}})
}
function updateLabDecor(now){if(labAtomRoot){labAtomRoot.rotation.y=now*.00035;labAtomRoot.children.slice(1).forEach((r,i)=>r.rotation.z+=.002+i*.0008)}if(labCryoCore){labCryoCore.rotation.y=now*.0007;const s=1+Math.sin(now*.003)*.06;labCryoCore.scale.setScalar(s)}if(labDoorVisualRoot){const open=getBlock(LAB_LAYOUT.cx-2,LAB_LAYOUT.y,LAB_LAYOUT.cz-LAB_LAYOUT.halfD)===BLOCK.DOOR_OPEN,l=labDoorVisualRoot.userData.left,r=labDoorVisualRoot.userData.right,t=open?Math.PI/2:0;l.rotation.y=lerp(l.rotation.y,-t,.24);r.rotation.y=lerp(r.rotation.y,t,.24)}}
function buildLaboratoryRequirements(){
  const {cx,cz,halfW,halfD,y,height}=LAB_LAYOUT,left=cx-halfW,right=cx+halfW,front=cz-halfD,rear=cz+halfD,requirements=[],foundationCells=new Set();
  const add=(component,x,yy,z,id)=>requirements.push({component,x,y:yy,z,id});
  const addFoundation=(x,z)=>{const key=`${x},${z}`;if(!foundationCells.has(key)){foundationCells.add(key);add("foundation",x,1,z,BLOCK.DEEPSTONE)}};
  for(let x=left-LAB_PROTECTION_MARGIN;x<=right+LAB_PROTECTION_MARGIN;x++)for(let z=front-LAB_PROTECTION_MARGIN;z<=rear+LAB_PROTECTION_MARGIN;z++)addFoundation(x,z);
  for(let x=left;x<=right;x++)for(let z=front;z<=rear;z++){
    const edge=x===left||x===right||z===front||z===rear,checker=((x-cx)+(z-cz))&1;
    add("floor",x,y-1,z,edge?BLOCK.SLATE:(checker?BLOCK.MARBLE:BLOCK.ALCHEMY_BRICK));
    const skylight=Math.abs(x-cx)<=12&&[0,1,2].includes(Math.abs((z-cz)%5))&&Math.abs(z-cz)<halfD-1;
    add("ceiling",x,y+height,z,skylight?BLOCK.GLASS:BLOCK.SLATE)
  }
  for(let level=0;level<height;level++){
    for(let x=left;x<=right;x++)for(const z of [front,rear]){
      const doorCell=z===front&&x>=cx-2&&x<=cx+1&&level<=2,transom=z===front&&x>=cx-2&&x<=cx+1&&level===3,frontWindow=z===front&&level>=3&&level<=8&&Math.abs(x-cx)>5&&Math.abs(x-cx)<halfW-1,backTable=z===rear&&Math.abs(x-cx)<=11;
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
  const {cx,cz,halfD,y}=LAB_LAYOUT,front=cz-halfD,doorMetadata=[cx-2,cx-1,cx,cx+1].flatMap(x=>[y,y+1,y+2].map(yy=>doorMeta.get(key3(x,yy,front)))),doorMetadataValid=doorMetadata.length===12&&doorMetadata.every(meta=>meta?.group==="carbon-main-airlock"),doorApproaches=[front-1,front+1].every(z=>BDEF[getBlock(cx-1,y-1,z)]?.solid&&!BDEF[getBlock(cx-1,y,z)]?.solid&&!BDEF[getBlock(cx-1,y+1,z)]?.solid&&!aabbHitsLabDecor(cx-1.8,cx-.2,y,y+1.75,z-.4,z+.4)),doorAccessible=doorMetadataValid&&doorApproaches;
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
  if(repair&&!doorMetadataValid){const isOpen=[cx-2,cx-1,cx,cx+1].some(x=>getBlock(x,y,front)===BLOCK.DOOR_OPEN);for(const doorX of [cx-2,cx-1,cx,cx+1])for(const [yy,half] of [[y,0],[y+1,1],[y+2,2]]){const key=key3(doorX,yy,front);mods.set(key,isOpen?BLOCK.DOOR_OPEN:BLOCK.DOOR);doorMeta.set(key,{axis:0,half,hinge:doorX<cx?-1:1,swing:1,style:"carbon",group:"carbon-main-airlock"})}saveMods();saveDoorMeta();repairedComponents.add("main-airlock")}
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
  const doorWasOpen=[cx-2,cx-1,cx,cx+1].some(x=>mods.get(key3(x,y,front))===BLOCK.DOOR_OPEN);
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
  for(const doorX of [cx-2,cx-1,cx,cx+1])for(const [yy,half] of [[y,0],[y+1,1],[y+2,2]]){const k=key3(doorX,yy,front);mods.set(k,doorWasOpen?BLOCK.DOOR_OPEN:BLOCK.DOOR);doorMeta.set(k,{axis:0,half,hinge:doorX<cx?-1:1,swing:1,style:"carbon",group:"carbon-main-airlock"})}
  recordLabGenerationStep("generate-doors-windows-entrances-corridors");
  saveMods();saveDoorMeta();createLaboratoryDecor();
  const validation=validateLaboratory();
  localStorage.qc_lab_validation_v60=JSON.stringify({version:LAB_VALIDATION_VERSION,seed:WORLD_SEED,origin:{x:cx,y,z:cz},terrain:LAB_LAYOUT.terrain,propIds:labPropPlacements.map(placement=>placement.definition.id),validation,order:labGenerationReport.order});
  rebuildLaboratoryChunks();
  return validation
}
function seedVillage(){
  for(const building of VILLAGE_BUILDINGS){
    const x=building.x,z=building.z-3,y=VILLAGE.base+1,wasOpen=[y,y+1].some(yy=>mods.get(key3(x,yy,z))===BLOCK.DOOR_OPEN);
    for(const [yy,half] of [[y,0],[y+1,1]]){const k=key3(x,yy,z);mods.set(k,wasOpen?BLOCK.DOOR_OPEN:BLOCK.DOOR);doorMeta.set(k,{axis:0,half,hinge:-1,swing:1,group:`village-${building.gx}-${building.gz}`})}
  }
  for(let i=-2;i<=2;i++)for(const side of [-1,1]){const x=VILLAGE.x+i*VILLAGE.spacing+side*4,z=VILLAGE.z+5,y=VILLAGE.base+1;mods.set(key3(x,y,z),BLOCK.SPECTRAL)}
  localStorage.qc_village_v44="1";saveMods();saveDoorMeta();return validateVillage()
}
function validateVillage(){
  const failures=[];
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
  if(saved.player){player.health=clamp(Number(saved.player.health)||100,1,100);player.mana=clamp(Number(saved.player.mana)||100,0,100);player.hunger=clamp(Number(saved.player.hunger??100),0,100);player.thirst=clamp(Number(saved.player.thirst??100),0,100);player.breath=clamp(Number(saved.player.breath??playerBreathMax()),0,playerBreathMax())}
  if(Number.isFinite(saved.day))state.day=clamp(saved.day,0,.999999);
  if(Number.isInteger(saved.dayCount)&&saved.dayCount>0)state.dayCount=saved.dayCount;
  if(saved.science){try{scienceSystem?.importState(saved.science)}catch(error){console.warn("[QuimiCraft][Ciência] Estado científico inválido; usando valores padrão sem alterar o save original.",error);messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"Os dados científicos deste mundo não puderam ser migrados. O restante do mundo foi carregado normalmente."})}}
  if(sourceVersion<70)messageCenter?.add({category:"system",speaker:"SALVAMENTO",text:"Mundo anterior carregado com migração segura para o sistema científico v7.0."});
  return saved
}
function saveWorldState(){
  const data={version:70,seed:WORLD_SEED,player:{x:player.pos.x,y:player.pos.y,z:player.pos.z,health:player.health,mana:player.mana,hunger:player.hunger,thirst:player.thirst,breath:player.breath},day:state.day,dayCount:state.dayCount,laboratory:{validationVersion:LAB_VALIDATION_VERSION,origin:{x:LAB_LAYOUT.cx,y:LAB_LAYOUT.y,z:LAB_LAYOUT.cz},valid:!!labGenerationReport.validation?.valid,props:labPropPlacements.map(placement=>placement.definition.id)},village:{version:60,generated:true},periodicTable:elementMissions?.exportState?.()||null,science:scienceSystem?.exportState?.()||null,savedAt:Date.now()};
  try{localStorage.qc_world_state_v70=JSON.stringify(data);scienceSystem?.persist?.();return true}catch(error){console.warn("[QuimiCraft] Não foi possível salvar o estado consolidado do mundo.",error);return false}
}
function nextRenderFrame(){return new Promise(resolve=>(window.requestAnimationFrame||window.setTimeout)(resolve))}
function addBootRequiredChunks(stageId,descriptors){
  worldBoot.stageChunkKeys=new Set(descriptors.map(descriptor=>descriptor.k));
  for(const descriptor of descriptors){const previous=worldBoot.requiredChunks.get(descriptor.k);if(!previous||descriptor.d<previous.d)worldBoot.requiredChunks.set(descriptor.k,descriptor)}
  setBootStage(stageId,0,`0 / ${worldBoot.stageChunkKeys.size} chunks`);centerChunk.x=999;centerChunk.z=999;ensureChunks(true);updateBootChunkProgress()
}
function waitForBootChunks(stageId,descriptors,timeoutMs=45000){
  addBootRequiredChunks(stageId,descriptors);
  return new Promise((resolve,reject)=>{
    const started=performance.now(),check=()=>{
      if(!worldBoot.running)return reject(new Error("carregamento cancelado"));
      const missing=descriptors.filter(descriptor=>!chunks.has(descriptor.k));updateBootChunkProgress();
      if(!missing.length)return resolve();
      if(performance.now()-started>timeoutMs)return reject(new Error(`${missing.length} chunks não ficaram prontos`));
      (window.requestAnimationFrame||window.setTimeout)(check)
    };check()
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
  return ringChunkKeys(cx,cz,effectivePreloadRadius())
}
function villageAreaDescriptors(){return ringChunkKeys(Math.floor(VILLAGE.x/CHUNK),Math.floor(VILLAGE.z/CHUNK),effectivePreloadRadius())}
function validateReadyWorld(){
  const lab=validateLaboratory({repair:false}),village=validateVillage(),missions=elementMissions.validateDefinitions(),allChunks=initialPreloadDescriptors().every(descriptor=>chunks.has(descriptor.k)),professor=npcs.find(npc=>npc.role==="carbon");
  return {valid:lab.valid&&village.valid&&missions.valid&&allChunks&&!!professor&&labStationZones.length>=4,lab,village,missions,allChunks,professorReady:!!professor,chemistryReady:labStationZones.length>=4}
}
async function startWorldLoading(){
  if(worldBoot.running)return;
  state.startQueued=true;state.loading=true;state.awaitingEntry=false;state.playing=false;state.left=false;state.right=false;state.started=false;state.paused=false;initialReady=false;document.exitPointerLock?.();
  $("loading").classList.remove("hidden");$("loaderError").hidden=true;$("loaderFill").style.width="0%";$("loaderTip").textContent="O jogo começa somente depois que o laboratório, a vila, os arredores e todas as colisões forem validados.";$("hud").classList.remove("visible");
  worldBoot.running=true;worldBoot.error=null;worldBoot.attempt=0;worldBoot.stage="initializing";worldBoot.stageFraction=0;worldBoot.requiredChunks.clear();worldBoot.stageChunkKeys.clear();worldBoot.completedStages.clear();worldBoot.preferredSpawn=null;
  try{
    await runBootStage("initializing",async()=>{if(!Number.isInteger(WORLD_SEED)||WORLD_SEED<1)throw new Error("semente de mundo inválida");await nextRenderFrame();return WORLD_SEED});
    await runBootStage("loading-save",async()=>{worldBoot.loadedState=parseWorldState();saveInventory();elementMissions.sync();await nextRenderFrame()});
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
    await runBootStage("generating-surroundings",()=>waitForBootChunks("generating-surroundings",initialPreloadDescriptors()));
    await runBootStage("preparing-collisions",async()=>{
      const report=validateLaboratory({repair:false}),village=validateVillage();
      if(!report.valid||!village.valid||periodicCollisionBoxes.length!==118||labCollisionBoxes.length!==labColliderIds.size)throw new Error("dados de colisão incompletos ou duplicados");
      await nextRenderFrame()
    });
    await runBootStage("preparing-gameplay",async()=>{
      initWorldLife();
      const preferred=worldBoot.preferredSpawn||spawn;if(!syncPlayerToSafeGround(preferred.x,preferred.z)&&!syncPlayerToSafeGround(spawn.x,spawn.z))throw new Error("nenhum ponto de spawn seguro foi encontrado");
      const professor=npcs.find(npc=>npc.role==="carbon");if(!professor)throw new Error("Prof. Carbono não foi criado");
      updateTorches();applyCharacterStyle();updateMissionHud();renderInventory();updateChemHud();updateVitals();await nextRenderFrame()
    });
    await runBootStage("ready",async()=>{
      const ready=validateReadyWorld();if(!ready.valid)throw new Error("a verificação final do mundo falhou");
      recordLabGenerationStep("ready-for-player");labGenerationReport.completedAt=Date.now();
      if(labGenerationReport.order.some((step,index)=>LAB_GENERATION_ORDER[index]!==step)||labGenerationReport.order.length!==LAB_GENERATION_ORDER.length)throw new Error("pipeline final do laboratório fora de ordem");
      saveWorldState();$("loaderTip").textContent="Laboratório, vila, arredores, missões e colisões verificados.";await nextRenderFrame()
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
function uiBlocking(){return state.loading||state.awaitingEntry||state.inventory||state.chemistry||state.periodic||state.shop||state.character||state.chat||state.devOpen||state.graphics||state.history||state.professor||state.scientificNotebook||state.researchTree||state.scienceStation}
function requestPointer({notify=false}={}){
  if(!state.started||state.loading||uiBlocking()||state.paused)return false;
  if(touchInput){state.playing=true;state.paused=false;$("mobileControls")?.classList.add("active");$("pause").classList.remove("open");return true}
  if(document.pointerLockElement===renderer.domElement)return false;
  try{
    const result=renderer.domElement.requestPointerLock();
    if(result&&typeof result.catch==="function")result.catch(error=>handlePointerLockFailure(error,notify));
    return true
  }catch(error){handlePointerLockFailure(error,notify);return false}
}
function handlePointerLockFailure(error,notify=false){
  state.playing=false;state.left=false;
  console.warn("[QuimiCraft] O navegador bloqueou a captura do mouse. Um clique direto no botão Continuar é necessário.",error);
  if(state.started&&!state.loading&&!uiBlocking()){
    $("pauseCopy").textContent=location.protocol==="file:"&&window.self!==window.top?"Este arquivo foi aberto dentro de uma prévia/iframe. Abra o index.html diretamente em uma aba do navegador e clique em Continuar.":"O navegador não autorizou a captura automática do mouse. Clique em Continuar para entrar novamente.";
    showPause()
  }
  if(notify)toast("Clique em Continuar para capturar o mouse")
}
function openInventory(){state.inventory=true;state.playing=false;state.left=false;$("inventory").classList.add("open");$("inventory").setAttribute("aria-hidden","false");document.exitPointerLock();renderInventory()}
function closeInventory(){state.inventory=false;$("inventory").classList.remove("open");$("inventory").setAttribute("aria-hidden","true");if(state.started)requestPointer()}
function closeModals(){state.inventory=state.chemistry=state.periodic=state.shop=state.character=state.chat=state.devOpen=state.graphics=state.history=state.professor=state.scientificNotebook=state.researchTree=state.scienceStation=false;state.paused=false;for(const id of ["inventory","chemistry","periodicTable","shop","character","devMenu","graphics","professor","messageHistory","scientificNotebook","researchTree","scienceStation","pause"])$(id).classList.remove("open");$("chat").classList.remove("open")}
function openScienceModal(id){
  const flags={scientificNotebook:"scientificNotebook",researchTree:"researchTree",scienceStation:"scienceStation"},flag=flags[id],modal=$(id);if(!flag||!modal)return false;
  state[flag]=true;state.playing=false;state.left=false;state.right=false;modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.exitPointerLock?.();return true
}
function closeScienceModal(id,resume=true){
  const flags={scientificNotebook:"scientificNotebook",researchTree:"researchTree",scienceStation:"scienceStation"},flag=flags[id],modal=$(id);if(!flag||!modal)return false;
  state[flag]=false;modal.classList.remove("open");modal.setAttribute("aria-hidden","true");if(resume&&state.started)requestPointer();return true
}
function showPause(){if(state.loading||!state.started||uiBlocking())return;state.playing=false;state.left=false;state.paused=true;$("pause").classList.add("open")}
let historyReturnToPause=false;
function openMessageHistory(fromPause=false){
  if(state.loading)return;historyReturnToPause=!!fromPause||state.paused;state.history=true;state.playing=false;state.left=false;state.paused=historyReturnToPause;$("pause").classList.remove("open");$("messageHistory").classList.add("open");$("messageHistory").setAttribute("aria-hidden","false");document.exitPointerLock();messageCenter.renderHistory(messageCenter.getFilter())
}
function closeMessageHistory(){
  state.history=false;$("messageHistory").classList.remove("open");$("messageHistory").setAttribute("aria-hidden","true");
  if(historyReturnToPause){state.paused=true;$("pause").classList.add("open")}else{state.paused=false;requestPointer()}
  historyReturnToPause=false
}
function openChat(){if(!state.started||uiBlocking())return;state.chat=true;state.playing=false;state.left=false;$("chat").classList.add("open");document.exitPointerLock();setTimeout(()=>$("chatInput").focus(),30)}
function closeChat(){state.chat=false;$("chat").classList.remove("open");$("chatInput").value="";requestPointer()}
function submitChat(){const text=$("chatInput").value.trim();if(!text)return closeChat();if(text.toLowerCase()==="-mododev"){state.chat=false;$("chat").classList.remove("open");$("chatInput").value="";return openDev()}chatMessage("VOCÊ",text);if(text.startsWith("/")&&dev.allRecipes)runDevCommand(text.slice(1));closeChat()}
function openDev(){state.devOpen=true;state.playing=false;state.left=false;$("devMenu").classList.add("open");document.exitPointerLock();renderDev()}
function closeDev(){state.devOpen=false;$("devMenu").classList.remove("open");requestPointer()}
function renderDev(){const buttons=[['fly','Voar'],['infinite','Blocos infinitos'],['recipes','Todas as receitas'],['speed','Speed walk +'],['day','Meio-dia'],['night','Noite'],['golem','Spawn Golem'],['wisp','Spawn Espectro'],['magma','Spawn Magma'],['scorpion','Spawn Escorpião'],['cristalume','Spawn Cristalume'],['slime','Spawn Slime Ácido']];$("devStatus").innerHTML=`<span class="dev-pill">FLY ${dev.fly?'ON':'OFF'}</span><span class="dev-pill">SPEED ${dev.speed}×</span><span class="dev-pill">INFINITO ${dev.infinite?'ON':'OFF'}</span><span class="dev-pill">RECEITAS ${dev.allRecipes?'TODAS':'PROGRESSÃO'}</span>`;$("devGrid").innerHTML=buttons.map(([id,n])=>`<button class="dev-btn ${(id==='fly'&&dev.fly)||(id==='infinite'&&dev.infinite)||(id==='recipes'&&dev.allRecipes)?'on':''}" data-dev="${id}">${n}</button>`).join("");$("devGrid").querySelectorAll("[data-dev]").forEach(b=>b.onclick=()=>runDevCommand(b.dataset.dev))}
function runDevCommand(raw){const p=String(raw).trim().toLowerCase().split(/\s+/),cmd=p[0],mobTypes=["slime","cobrete","cristalume","capivara","scorpion","golem","wisp","magma","deer","owl","pig","cow","rabbit","chicken","sheep"];if(cmd==="fly")dev.fly=!dev.fly;else if(cmd==="infinite"){dev.infinite=!dev.infinite;if(dev.infinite)for(const id of [...Object.values(BLOCK).filter(id=>typeof id==="number"&&id>0&&id!==BLOCK.LAVA),"arrow"])if(countItem(id)===0)addItem(id,99)}else if(cmd==="recipes"){dev.allRecipes=true;for(const r of CHEM)unlockedChem.add(r.id);saveChem();renderChemistry()}else if(cmd==="heal"){player.health=player.mana=player.hunger=player.thirst=100;player.breath=playerBreathMax();updateVitals()}else if(cmd==="speed")dev.speed=clamp(+(p[1]||dev.speed%5+1),1,5);else if(cmd==="day")state.day=.25;else if(cmd==="night")state.day=.72;else if(cmd==="time")state.day={day:.25,noon:.25,sunset:.49,night:.72}[p[1]]??state.day;else if(cmd==="tp"&&p.length>=4){player.pos.set(+p[1],+p[2],+p[3]);player.vel.set(0,0,0)}else if(cmd==="spawn")spawnMob(p[1]);else if(mobTypes.includes(cmd))spawnMob(cmd);else if(cmd==="clear"&&p[1]==="mobs"){for(const e of [...entities])if(!e.persistent)removeEntity(e)}else if(cmd==="give"){const aliases={grass:BLOCK.GRASS,stone:BLOCK.STONE,sand:BLOCK.SAND,redsand:BLOCK.RED_SAND,wood:BLOCK.WOOD,glass:BLOCK.GLASS,lab:BLOCK.LAB,door:BLOCK.DOOR,torch:BLOCK.TORCH,copper:BLOCK.COPPER,sulfur:BLOCK.SULFUR,salt:BLOCK.SALT,spectral:BLOCK.SPECTRAL,gold:BLOCK.GOLD,tin:BLOCK.TIN,zinc:BLOCK.ZINC,crystal:BLOCK.CRYSTAL,obsidian:BLOCK.OBSIDIAN,basalt:BLOCK.BASALT,marble:BLOCK.MARBLE,clay:BLOCK.CLAY,alchemy:BLOCK.ALCHEMY_BRICK,ceramic:BLOCK.CERAMIC,bronze:BLOCK.BRONZE_BLOCK,limestone:BLOCK.LIMESTONE,slate:BLOCK.SLATE,amethyst:BLOCK.AMETHYST,niter:BLOCK.NITER,cherry:BLOCK.CHERRY_LOG,bamboo:BLOCK.BAMBOO,palm:BLOCK.PALM_LOG,village:BLOCK.VILLAGE_BRICK,flower:BLOCK.POPPY,water:"water",hydrogen:"hydrogen",oxygen:"oxygen",acid:"acid",ammonia:"ammonia",ethanol:"ethanol",goldnugget:"gold_nugget",arrow:"arrow",staff:"wind_staff",bow:"bow",sword:"iron_sword",furnace:BLOCK.FURNACE,cup:"cup",bucket:"bucket",watercup:"water_cup",waterbucket:"water_bucket",rawbeef:"raw_beef",cookedbeef:"cooked_beef",rawpork:"raw_pork",cookedpork:"cooked_pork",goggles:"protective_goggles",respirator:"respirator_mask",labcoat:"lab_coat",helmet:"iron_helmet",chestplate:"iron_chestplate",leggings:"iron_leggings",ironboots:"iron_boots",rubberboots:"rubber_boots",oxygentank:"oxygen_tank",chitinarmor:"chitin_armor"},id=aliases[p[1]]??(+p[1]);if(id!==undefined&&!Number.isNaN(id))addItem(id,clamp(+(p[2]||64),1,999))}else return toast("Comando não reconhecido");renderDev();toast(`DEV · ${cmd} aplicado`)}
function refreshChunkGraphics(){activeBuild=null;pending.length=0;for(const [,ch] of chunks)removeChunkMesh(ch);chunks.clear();centerChunk.x=999;ensureChunks(true)}
function syncGraphicControls(){for(const [id,v] of [["qualityPreset",settings.preset],["renderDistance",settings.render],["shadowQuality",settings.shadows],["aoQuality",settings.ao],["waterQuality",settings.water],["particleQuality",settings.particles],["vegetationQuality",settings.vegetation],["resolutionScale",settings.resolution],["mobDensity",settings.mobs]])$(id).value=v;$("cloudToggle").checked=settings.clouds;$("renderOut").value=`${settings.render} chunks`;$("senseOut").value=`${Math.round(settings.sense*100)}%`;$("volumeOut").value=`${Math.round(settings.volume*100)}%`}
function applyGraphics(rebuild=false){renderer.shadowMap.enabled=settings.shadows>0;sunLight.castShadow=settings.shadows>0;const size=settings.shadows===1?1024:2048;if(sunLight.shadow.mapSize.x!==size){sunLight.shadow.mapSize.set(size,size);if(sunLight.shadow.map){sunLight.shadow.map.dispose();sunLight.shadow.map=null}}renderer.setPixelRatio(Math.min(devicePixelRatio*(+settings.resolution||1),1.6));waterMat.uniforms.uQuality.value=settings.water===0?.12:settings.water===1?.58:1;cloudGroup.visible=!!settings.clouds;stars.visible=!!settings.clouds;for(const [,ch] of chunks)ch.group.traverse(o=>{if(o.isMesh){o.castShadow=settings.shadows>0;o.receiveShadow=settings.shadows>0}});entityRoot.traverse(o=>{if(o.isMesh)o.castShadow=settings.shadows>0});playerBody.traverse(o=>{if(o.isMesh)o.castShadow=settings.shadows>0});const cap=[0,7,13,20][settings.mobs],extras=entities.filter(e=>!e.persistent);while(extras.length>cap)removeEntity(extras.pop());updateTorches();saveSettings();syncGraphicControls();if(rebuild)refreshChunkGraphics()}
function applyPreset(name){const p={low:{render:3,shadows:0,ao:0,water:0,particles:0,vegetation:0,resolution:.65,clouds:false,mobs:1},medium:{render:4,shadows:1,ao:1,water:1,particles:1,vegetation:1,resolution:.85,clouds:true,mobs:1},high:{render:5,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:2},cinematic:{render:6,shadows:2,ao:2,water:2,particles:2,vegetation:2,resolution:1,clouds:true,mobs:3}}[name]||{};const rebuild=p.ao!==settings.ao||p.vegetation!==settings.vegetation;Object.assign(settings,p,{preset:name});centerChunk.x=999;ensureChunks(true);applyGraphics(rebuild)}
function renderGraphicsQuick(){$("graphicsControls").innerHTML=`<div class="setting"><label>Preset atual</label><select id="quickPreset" class="compact-select"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="cinematic">Cinemática</option><option value="custom">Personalizada</option></select></div><div class="setting"><label>Sombras</label><button class="secondary" data-cycle="shadows">${['Off','Baixas','Altas'][settings.shadows]}</button></div><div class="setting"><label>Ambient occlusion</label><button class="secondary" data-cycle="ao">${['Off','Suave','Completo'][settings.ao]}</button></div><div class="setting"><label>Partículas</label><button class="secondary" data-cycle="particles">${['Off','Reduzidas','Completas'][settings.particles]}</button></div><div class="setting"><label>Vegetação</label><button class="secondary" data-cycle="vegetation">${['Essencial','Reduzida','Completa'][settings.vegetation]}</button></div>`;$("quickPreset").value=settings.preset;$("quickPreset").onchange=e=>{applyPreset(e.target.value);renderGraphicsQuick()};$("graphicsControls").querySelectorAll("[data-cycle]").forEach(b=>b.onclick=()=>{const k=b.dataset.cycle,old=settings[k];settings[k]=(old+1)%3;settings.preset="custom";applyGraphics(k==="ao"||k==="vegetation");renderGraphicsQuick()})}
function openGraphics(){state.graphics=true;state.paused=false;$("pause").classList.remove("open");$("graphics").classList.add("open");renderGraphicsQuick()}
function closeGraphics(){state.graphics=false;$("graphics").classList.remove("open");state.paused=true;$("pause").classList.add("open")}
function saveSettings(){localStorage.qc_settings=JSON.stringify(settings)}

$("playBtn").onclick=()=>{if(openStandaloneLocalFile())return;initAudio();$("loaderReady").hidden=true;startWorldLoading()};
$("loaderRetry").onclick=()=>{$("loaderReady").hidden=true;startWorldLoading()};
$("loaderEnter").onclick=enterLoadedWorld;
$("customizeBtn").onclick=openCharacter;$("newWorldTitleBtn").onclick=restartWorld;$("newWorldBtn").onclick=restartWorld;
$("resumeBtn").onclick=()=>{state.paused=false;$("pause").classList.remove("open");$("pauseCopy").textContent="O laboratório, a vila e as criaturas esperam por você.";requestPointer({notify:true})};$("pauseHistoryBtn").onclick=()=>openMessageHistory(true);$("graphicsBtn").onclick=openGraphics;$("restartBtn").onclick=respawn;
$("titleBtn").onclick=()=>{saveWorldState();state.started=false;state.startQueued=false;state.awaitingEntry=false;state.playing=false;state.paused=false;$("pause").classList.remove("open");$("hud").classList.remove("visible");$("titleScreen").classList.remove("hidden");messageCenter.clearVisible()};
document.querySelector("[data-close=inventory]").onclick=closeInventory;$("recipeBookToggle").onclick=()=>{recipeBookOpen=!recipeBookOpen;updateRecipeBookState()};$("recipeBookClose").onclick=()=>{recipeBookOpen=false;updateRecipeBookState()};$("craftOutput").onclick=()=>craft();document.querySelector("[data-close=chemistry]").onclick=closeChemistry;$("periodicTableBtn").onclick=openPeriodicTable;document.querySelector("[data-close=periodicTable]").onclick=closePeriodicTable;document.querySelector("[data-close=shop]").onclick=closeShop;document.querySelector("[data-close=character]").onclick=closeCharacter;document.querySelector("[data-close=devMenu]").onclick=closeDev;document.querySelector("[data-close=graphics]").onclick=closeGraphics;document.querySelector("[data-close=professor]").onclick=closeProfessor;document.querySelector("[data-close=messageHistory]").onclick=closeMessageHistory;
$("historyHudBtn").onclick=()=>openMessageHistory(false);
$("professorActions").querySelectorAll("[data-professor-view]").forEach(button=>button.onclick=()=>renderProfessor(button.dataset.professorView));
$("historyFilters").querySelectorAll("[data-history-filter]").forEach(button=>button.onclick=()=>{$("historyFilters").querySelectorAll("[data-history-filter]").forEach(item=>item.classList.toggle("active",item===button));messageCenter.setFilter(button.dataset.historyFilter)});
$("settingsToggle").onclick=()=>{$("settingsToggle").classList.toggle("open");$("settings").classList.toggle("open")};
$("qualityPreset").onchange=e=>applyPreset(e.target.value);$("renderDistance").oninput=e=>$("renderOut").value=`${e.target.value} chunks`;$("renderDistance").onchange=e=>{settings.render=+e.target.value;settings.preset="custom";saveSettings();centerChunk.x=999;ensureChunks(true)};
for(const [id,key,rebuild] of [["shadowQuality","shadows",false],["aoQuality","ao",true],["waterQuality","water",false],["particleQuality","particles",false],["vegetationQuality","vegetation",true],["resolutionScale","resolution",false],["mobDensity","mobs",false]])$(id).onchange=e=>{settings[key]=+e.target.value;settings.preset="custom";applyGraphics(rebuild)};
$("cloudToggle").onchange=e=>{settings.clouds=e.target.checked;settings.preset="custom";applyGraphics()};$("sensitivity").oninput=e=>{settings.sense=+e.target.value/100;$("senseOut").value=`${e.target.value}%`;saveSettings()};$("volume").oninput=e=>{settings.volume=+e.target.value/100;$("volumeOut").value=`${e.target.value}%`;if(master)master.gain.value=settings.volume*.32;saveSettings()};
$("runCommand").onclick=()=>{runDevCommand($("devCommand").value);$("devCommand").value=""};$("devCommand").onkeydown=e=>{if(e.key==="Enter"){$("runCommand").click();e.stopPropagation()}};$("chatInput").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();e.stopPropagation();submitChat()}else if(e.key==="Escape"){e.stopPropagation();closeChat()}};

document.addEventListener("pointerlockchange",()=>{if(touchInput)return;const locked=document.pointerLockElement===renderer.domElement;if(locked&&!state.loading){state.playing=true;state.paused=false;$("pauseCopy").textContent="O laboratório, a vila e as criaturas esperam por você.";$("pause").classList.remove("open")}else if(locked&&state.loading)document.exitPointerLock();else if(state.started&&!uiBlocking())showPause()});
document.addEventListener("pointerlockerror",event=>handlePointerLockFailure(event,false));
document.addEventListener("mousemove",e=>{if(!state.playing)return;player.yaw-=e.movementX*.00155*settings.sense;player.pitch=clamp(player.pitch-e.movementY*.00155*settings.sense,-Math.PI/2+.02,Math.PI/2-.02)});
document.addEventListener("keydown",e=>{
  if(state.loading||state.awaitingEntry){e.preventDefault();return}
  if(state.chat)return;
  if(e.code==="Escape"){
    e.preventDefault();
    if(state.scientificNotebook)return closeScienceModal("scientificNotebook");if(state.researchTree)return closeScienceModal("researchTree");if(state.scienceStation)return closeScienceModal("scienceStation");if(state.history)return closeMessageHistory();if(state.professor)return closeProfessor();if(state.periodic)return closePeriodicTable();if(state.inventory)return closeInventory();if(state.chemistry)return closeChemistry();if(state.shop)return closeShop();if(state.character)return closeCharacter();if(state.devOpen)return closeDev();if(state.graphics)return closeGraphics();if(state.paused){state.paused=false;$("pause").classList.remove("open");return requestPointer()}if(state.started)return showPause()
  }
  if(e.code==="Enter"&&state.started){e.preventDefault();return openChat()}
  if(e.code==="Tab"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return state.inventory?closeInventory():openInventory()}
  if(e.code==="KeyM"&&state.started&&!uiBlocking()){e.preventDefault();const stats=elementMissions.getStats();if(stats.introduced){elementMissions.setTrackerHidden(!stats.trackerHidden);updateMissionHud()}return}
  if(e.code==="KeyN"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return scienceUI?.openNotebook()}
  if(e.code==="KeyR"&&state.started&&!uiBlocking()&&!state.paused){e.preventDefault();return scienceUI?.openResearch()}
  if(e.code==="KeyG"&&state.playing){e.preventDefault();return collectScientificSample()}
  keys[e.code]=true;if(e.code.startsWith("Digit")){const n=+e.code.slice(5);if(n>=1&&n<=9)chooseSlot(n-1)}if(e.code==="KeyC"&&state.playing){e.preventDefault();cycleCamera()}if(e.code==="KeyE"&&state.playing){e.preventDefault();interact()}if(e.code==="Space"&&!dev.fly){e.preventDefault();if(state.playing){if(player.inWater)player.vel.y=Math.max(player.vel.y,2.6);else if(player.onGround){player.vel.y=7.2;player.onGround=false;player.fallStart=player.pos.y}}}
});
document.addEventListener("keyup",e=>keys[e.code]=false);renderer.domElement.addEventListener("click",()=>{if(state.started&&!state.loading&&!state.playing&&!state.paused&&!uiBlocking())requestPointer({notify:true})});renderer.domElement.addEventListener("mousedown",e=>{if(!state.playing)return;if(e.button===0){if(WEAPONS.has(selectedItem()))attackSelected(false);else state.left=true}if(e.button===2)useOrPlace()});document.addEventListener("mouseup",e=>{if(e.button===0)state.left=false});renderer.domElement.addEventListener("contextmenu",e=>e.preventDefault());renderer.domElement.addEventListener("wheel",e=>{if(state.playing){e.preventDefault();chooseSlot(state.selected+(e.deltaY>0?1:-1))}},{passive:false});
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
    if(action==="jump"){keys.Space=true;if(player.inWater)player.vel.y=Math.max(player.vel.y,2.6);else if(player.onGround){player.vel.y=7.2;player.onGround=false;player.fallStart=player.pos.y}}
    else if(action==="attack"){if(WEAPONS.has(selectedItem()))attackSelected(false);else state.left=true}
    else if(action==="use")useOrPlace();else if(action==="interact")interact();else if(action==="sample")collectScientificSample();else if(action==="inventory")openInventory()
  });
  for(const eventName of ["pointerup","pointercancel","lostpointercapture"])button.addEventListener(eventName,release)
});
let mobileLook=null;
renderer.domElement.addEventListener("touchstart",event=>{if(!touchInput||!state.playing||event.touches.length!==1)return;const touch=event.touches[0];mobileLook={id:touch.identifier,x:touch.clientX,y:touch.clientY}},{passive:true});
renderer.domElement.addEventListener("touchmove",event=>{if(!mobileLook||!state.playing)return;const touch=[...event.touches].find(entry=>entry.identifier===mobileLook.id);if(!touch)return;event.preventDefault();const dx=touch.clientX-mobileLook.x,dy=touch.clientY-mobileLook.y;mobileLook.x=touch.clientX;mobileLook.y=touch.clientY;player.yaw-=dx*.0042*settings.sense;player.pitch=clamp(player.pitch-dy*.0042*settings.sense,-Math.PI/2+.02,Math.PI/2-.02)},{passive:false});
renderer.domElement.addEventListener("touchend",event=>{if(mobileLook&&![...event.touches].some(entry=>entry.identifier===mobileLook.id))mobileLook=null},{passive:true});
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio*(+settings.resolution||1),1.6))});syncGraphicControls();applyGraphics();

let prevDay=state.day,bubbleClock=0,lastWorldSaveAt=0,wasNearLaboratory=false,mobileControlsVisible=false;
function syncMobileControls(){
  if(!touchInput)return;const visible=!!(state.playing&&!uiBlocking());if(visible===mobileControlsVisible)return;mobileControlsVisible=visible;$("mobileControls")?.classList.toggle("active",visible)
}
const colorNight=new THREE.Color(0x071326),colorDawn=new THREE.Color(0xd8795c),colorDay=new THREE.Color(0x8bc8e7),colorFog=new THREE.Color();
function updateCycle(dt,now){
  if(!state.paused){state.day=(state.day+dt/DAY_SECONDS)%1;if(state.day<prevDay)state.dayCount++;prevDay=state.day}
  const ang=state.day*TAU,solar=Math.sin(ang),day=clamp((solar+.12)/.32,0,1),dusk=Math.pow(1-Math.abs(clamp(solar,-1,1)),6),cx=state.started?player.pos.x:spawn.x,cz=state.started?player.pos.z:spawn.z;
  const sunPos=new THREE.Vector3(Math.cos(ang)*105,solar*105,Math.sin(ang*.73)*55);sunOrb.position.set(cx+sunPos.x,player.pos.y+sunPos.y,cz+sunPos.z);moonOrb.position.set(cx-sunPos.x,player.pos.y-sunPos.y,cz-sunPos.z);
  sunLight.position.set(cx+(solar>=-.06?sunPos.x:-sunPos.x),player.pos.y+Math.abs(sunPos.y)+18,cz+(solar>=-.06?sunPos.z:-sunPos.z));sunLight.target.position.set(cx,player.pos.y,cz);sunLight.target.updateMatrixWorld();sunLight.intensity=lerp(.16,1.35,day);sunLight.color.set(day>.3?0xffedce:0x8ca9d8);hemi.intensity=lerp(.19,.72,day);hemi.color.set(day>.3?0xbde4ff:0x324a78);hemi.groundColor.set(day>.25?0x3a422c:0x11172a);
  colorFog.copy(colorNight).lerp(colorDay,day);if(dusk>.05)colorFog.lerp(colorDawn,dusk*.56);scene.fog.color.copy(colorFog);scene.background.copy(colorFog);scene.fog.density=lerp(.016,.0085,day);renderer.toneMappingExposure=lerp(.69,1.08,day);
  sky.position.copy(camera.position);skyMat.uniforms.uTime.value=state.day;stars.position.copy(camera.position);starMat.opacity=clamp((-.04-solar)*2.2,0,.88);sunOrb.visible=solar>-.18;moonOrb.visible=solar<.17;
  cloudGroup.position.x=cx+((now*.00065)%90)-45;cloudGroup.position.z=cz;cloudGroup.children.forEach(s=>s.material.opacity=(.11+.22*day)*(s.userData.base||1));waterMat.uniforms.uTime.value=now*.001;lavaMat.uniforms.uTime.value=now*.001;waterMat.uniforms.uSun.value.copy(sunPos).normalize();const cameraSubmerged=state.started&&player.cameraUnderwater;waterMat.uniforms.uUnderwater.value=cameraSubmerged?1:0;if(cameraSubmerged){const clarity=underwaterClarity(),underColor=new THREE.Color(0x0a6580).lerp(new THREE.Color(0x228da0),clarity);scene.fog.color.copy(underColor);scene.background.copy(underColor);scene.fog.density=lerp(.052,.021,clarity);renderer.toneMappingExposure=lerp(.64,.84,clarity)}
  const hours=(state.day*24+6)%24,hh=Math.floor(hours),mm=Math.floor((hours-hh)*60);$("timeLabel").textContent=`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;$("dayLabel").textContent=`DIA ${state.dayCount}`;const arcX=clamp((Math.cos(ang-Math.PI)+1)*50,4,96),arcY=Math.max(0,Math.abs(solar)*17);$("orb").style.left=arcX+"%";$("orb").style.bottom=(arcY-4)+"px";$("orb").style.background=solar>=0?"#ffd77a":"#d9eaff";$("orb").style.boxShadow=`0 0 10px ${solar>=0?"#ffd77a":"#d9eaff"}`;
  for(const l of torchLights)l.intensity=1.05+Math.sin(now*.011+l.userData.seed)*.18+hash(Math.floor(now/75),l.userData.seed)*.12;
  if(solar<-.2&&audioCtx&&now-lastCricket>1800+Math.random()*3600){lastCricket=now;cricket()}
}
function updateMenu(now){playerBody.visible=false;firstHands.visible=false;const a=now*.000045,r=34,focus=new THREE.Vector3(spawn.x+7,terrainHeight(spawn.x+7,spawn.z+5)+4,spawn.z+5);camera.position.set(focus.x+Math.cos(a)*r,focus.y+14+Math.sin(a*.7)*4,focus.z+Math.sin(a)*r);camera.lookAt(focus);camera.fov=57;camera.updateProjectionMatrix()}
function updateHud(){state.frames++;const now=performance.now();if(now-state.fpsTime>500){state.fps=Math.round(state.frames*1000/(now-state.fpsTime||1));state.frames=0;state.fpsTime=now;const biome=biomeAt(player.pos.x,player.pos.z);$("fps").textContent=`FPS ${state.fps}`;$("coords").innerHTML=`X ${Math.floor(player.pos.x)} &nbsp; Y ${Math.floor(player.pos.y)} &nbsp; Z ${Math.floor(player.pos.z)}`;$("biome").textContent=biome.toUpperCase();if(state.playing&&biome!==lastMissionBiome){lastMissionBiome=biome;elementMissions?.recordEvent("visit_biome",{id:biome})}}}
function verifyLaboratoryOnEntry(){
  if(!npcs.some(npc=>npc.role==="carbon")){console.warn("[QuimiCraft][Laboratório] Prof. Carbono ausente; NPC restaurado no socket professor-position.");ensureProfessorCarbono()}
  let report=validateLaboratory({recordStep:false});if(report.repaired)report=validateLaboratory({repair:false,recordStep:false});
  if(!report.valid){console.warn("[QuimiCraft][Laboratório] Verificação de entrada detectou conteúdo inconsistente; reconstruindo apenas a decoração e as colisões.");createLaboratoryDecor();report=validateLaboratory({recordStep:false});if(report.repaired)report=validateLaboratory({repair:false,recordStep:false})}
  if(report.valid&&labGenerationReport.repairs.length)messageCenter.add({category:"system",text:"O Laboratório Carbono foi verificado e um componente foi reparado com segurança."});
  return report.valid
}
function bubble(pos){if(settings.particles===0)return;const m=new THREE.Mesh(new THREE.SphereGeometry(.035+Math.random()*.045,6,5),new THREE.MeshBasicMaterial({color:0xa7eaff,transparent:true,opacity:.48,wireframe:true}));m.position.set(pos.x+(Math.random()-.5)*.55,pos.y+.4+Math.random(),pos.z+(Math.random()-.5)*.55);m.userData.v=new THREE.Vector3((Math.random()-.5)*.08,.38+Math.random()*.3,(Math.random()-.5)*.08);m.userData.life=.7+Math.random()*.8;particleGroup.add(m);particles.push(m)}
function animate(now){
  requestAnimationFrame(animate);const dt=Math.min(.035,Math.max(.001,(now-state.lastFrame)/1000));state.lastFrame=now;processChunks();
  if(state.playing){updatePhysics(dt);ensureChunks();updateTarget(dt);updateEntities(dt,now);updateProjectiles(dt);updateDrops(dt,now);updateEnemyHud(dt);updateInteraction();updateLabDecor(now);const nearLab=labBoundsContains(player.pos.x,player.pos.z,3);if(nearLab&&!wasNearLaboratory)verifyLaboratoryOnEntry();wasNearLaboratory=nearLab;bubbleClock+=dt;if(player.inWater&&bubbleClock>.17){bubbleClock=0;bubble(player.pos)}if(now-lastWorldSaveAt>10000){lastWorldSaveAt=now;saveWorldState()}}else if(!state.started)updateMenu(now);else updatePlayerCamera(dt,false);
  syncMobileControls();updateCycle(dt,now);updateParticles(dt);updateHud();renderer.render(scene,camera);
}
applyCharacterStyle();applyEquipmentVisuals();updateMissionHud();saveInventory();saveEquipment();renderInventory();updateChemHud();updateVitals();if(isEmbeddedLocalFile())$("localFrameNotice").hidden=false;window.addEventListener("beforeunload",()=>{if(initialReady)saveWorldState()});requestAnimationFrame(animate);
