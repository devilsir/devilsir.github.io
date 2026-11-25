"use strict";

globalThis.QuimiCraftDepths=(()=>{
  const blocks=[
    ["DIAMOND_ORE","Minério de diamante",0x51d8ee,"ore",3.9],
    ["EMERALD_ORE","Minério de esmeralda",0x31bd70,"ore",3.4],
    ["RUBY_ORE","Minério de rubi",0xd54462,"ore",3.4],
    ["SAPPHIRE_ORE","Minério de safira",0x456bdf,"ore",3.5],
    ["OPAL_ORE","Minério de opala",0xaeeae8,"ore",3.2],
    ["GARNET_ORE","Minério de granada",0xa33662,"ore",3.1],
    ["MAGNETITE","Magnetita",0x6c7a81,"ore",2.45],
    ["RED_EARTH","Terra vermelha",0xa3543e,"soil",.67],
    ["BLACK_EARTH","Terra preta",0x544239,"soil",.75],
    ["BROWN_EARTH","Terra marrom",0x80573d,"soil",.64],
    ["GRANITE","Granito",0x9f7773,"rock",2.02],
    ["GNEISS","Gnaisse",0x88909a,"rock",2.15],
    ["BLACK_SHALE","Folhelho escuro",0x59575e,"rock",1.76],
    ["PINK_SAND","Areia rosada",0xdba394,"sand",.56],
    ["BLACK_SAND","Areia vulcânica",0x5b5355,"sand",.58],
    ["RIVER_SAND","Areia de rio",0xc5aa78,"sand",.55],
    ["SUNKEN_BRICK","Tijolo submerso",0x607f7e,"ruin",1.7],
    ["SUNKEN_MOSAIC","Mosaico das ruínas",0x87adaa,"ruin",1.7],
    ["SUNKEN_BEACON","Farol das ruínas",0x73ceb7,"ruin",1.55]
  ];
  const slots=[176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,204,205,206];
  const tiles=new Map(slots.map((id,i)=>[id,blocks[i]]));
  const rgb=color=>[color>>16&255,color>>8&255,color&255];
  const clamp=(n,l,h)=>Math.min(h,Math.max(l,n));
  const smooth=n=>n*n*(3-2*n);
  const kindFallback=new Set(["cold","salt","fresh","tannin","acid","thermal","mineral"]);
  const marineProfiles={
    marine:{id:"salt",label:"Água marinha",rgb:[.10,.38,.56],chem:{id:"salt",salt:3.5}},
    glacial:{id:"cold",label:"Água marinha glacial",rgb:[.19,.47,.58],chem:{id:"cold",salt:3.1,cold:true}},
    fresh:{id:"fresh",label:"Água doce profunda",rgb:[.16,.47,.53],chem:{id:"fresh"}}
  };
  const fauna=Object.freeze({
    leatherback:{name:"Tartaruga-de-couro gigante",scientific:"Dermochelys coriacea",habitat:"Mar aberto e águas costeiras",speed:1.27,extent:.73,minDepth:5,swim:.3,mode:"cruise",hp:75,damage:0,bodySize:1.78,waters:["salt"]},
    seahorse_red:{name:"Cavalo-marinho vermelho espinhoso",habitat:"Águas costeiras e vegetação submersa",speed:.33,extent:.09,minDepth:2,swim:.71,mode:"drift",hp:6,damage:0,bodySize:.18,sizeAxis:"y",small:true,waters:["salt"]},
    seahorse_gold:{name:"Cavalo-marinho dourado rajado",habitat:"Águas costeiras rasas",speed:.37,extent:.10,minDepth:2,swim:.69,mode:"drift",hp:7,damage:0,bodySize:.19,sizeAxis:"y",small:true,waters:["salt"]},
    shrimp_pink:{name:"Camarão-rosa",scientific:"Farfantepenaeus brasiliensis",habitat:"Fundos arenosos costeiros",speed:.55,extent:.14,minDepth:2,swim:.87,mode:"bottom",hp:5,damage:0,bodySize:.21,small:true,waters:["salt"],drop:"raw_shrimp"},
    shrimp_seabob:{name:"Camarão-sete-barbas",scientific:"Xiphopenaeus kroyeri",habitat:"Fundos rasos de areia e lama",speed:.47,extent:.11,minDepth:2,swim:.9,mode:"bottom",hp:4,damage:0,bodySize:.14,small:true,waters:["salt"],drop:"raw_shrimp"},
    shrimp_white:{name:"Camarão-branco",scientific:"Litopenaeus schmitti",habitat:"Costas e desembocaduras salobras",speed:.52,extent:.13,minDepth:2,swim:.87,mode:"bottom",hp:9,damage:0,bodySize:.19,small:true,waters:["salt"],drop:"raw_shrimp"},
    shrimp_pitu:{name:"Camarão-pitu",scientific:"Macrobrachium carcinus",habitat:"Rios e remansos de água doce tropical",speed:.49,extent:.17,minDepth:2,swim:.91,mode:"bottom",hp:11,damage:0,bodySize:.26,small:true,waters:["fresh","tannin"],tropical:true,drop:"raw_shrimp"},
    orca:{name:"Orca",habitat:"Mar glacial e águas costeiras frias",speed:2.82,extent:1.67,minDepth:8,swim:.35,mode:"pod",hp:86,damage:0},
    humpback:{name:"Baleia-jubarte",habitat:"Águas marinhas profundas, nas bacias costeiras e glaciais",speed:1.72,extent:2.45,minDepth:10,swim:.36,mode:"whale",hp:180,damage:0},
    dolphin:{name:"Golfinho",habitat:"Mar aberto e costa",speed:3.14,extent:.79,minDepth:5,swim:.43,mode:"curious",hp:39,damage:0},
    mermaid:{name:"Sereia",habitat:"Costas e bacias marinhas",speed:2.33,extent:.68,minDepth:4,swim:.49,baseClearance:1.48,surfaceClearance:.92,mode:"curious",hp:57,damage:0},
    fishfolk_tail:{name:"Homem-peixe de Cauda",habitat:"Águas costeiras e estuários",speed:2.17,extent:.72,minDepth:4,swim:.55,baseClearance:1.48,surfaceClearance:.92,mode:"curious",hp:66,damage:9,
      attack:{kind:"tail",range:1.48,notice:3.6,windup:.45,strike:.29,recover:.56,cooldown:2.6}},
    fishfolk_head:{name:"Homem-peixe de Cabeça",habitat:"Pântanos, manguezais e deltas",speed:1.83,extent:.66,minDepth:3,swim:.72,baseClearance:1.10,surfaceClearance:1.02,mode:"ambush",hp:62,damage:12,
      attack:{kind:"bite",range:1.50,notice:4.65,windup:.55,strike:.27,recover:.55,cooldown:2.7}},
    caiman:{name:"Jacaré",habitat:"Manguezal, delta e pântano",speed:1.30,extent:.80,minDepth:3,swim:.21,mode:"ambush",damage:11,hp:47,drop:"raw_game",
      attack:{kind:"bite",range:1.55,notice:5.2,windup:.67,strike:.34,recover:.66,cooldown:3.35}},
    piranha:{name:"Piranha",habitat:"Água doce tropical",speed:2.04,extent:.27,minDepth:3,swim:.50,mode:"school",damage:4,hp:12,drop:"raw_piranha",
      attack:{kind:"bite",range:.85,notice:4.5,windup:.24,strike:.22,recover:.34,cooldown:1.65}},
    reef_shark:{name:"Cação",habitat:"Água marinha",speed:2.48,extent:1.02,minDepth:6,swim:.65,mode:"cruise",hp:58,damage:15,drop:"raw_fish",
      attack:{kind:"bite",range:1.66,notice:7.5,windup:.49,strike:.34,recover:.69,cooldown:3.05}},
    ray:{name:"Raia",habitat:"Fundo marinho e estuários",speed:1.52,extent:.63,minDepth:4,swim:.82,mode:"bottom",hp:25,damage:6,drop:"raw_fish",
      attack:{kind:"tail",range:1.12,notice:3.2,windup:.39,strike:.29,recover:.54,cooldown:2.55}},
    venom_ray:{name:"Arraia Venenosa",habitat:"Estuários salobros e fundo marinho",speed:1.42,extent:.61,minDepth:4,swim:.83,mode:"bottom",hp:29,damage:8,drop:"venom",
      attack:{kind:"tail",venom:true,range:1.28,notice:3.5,windup:.42,strike:.31,recover:.56,cooldown:2.65}},
    pufferfish:{name:"Baiacu",habitat:"Águas costeiras",speed:.86,extent:.33,minDepth:3,swim:.53,mode:"defensive",hp:14,damage:3,drop:"venom",
      attack:{kind:"sting",venom:true,range:.64,notice:1.26,windup:.46,strike:.21,recover:.45,cooldown:2.30}},
    jelly:{name:"Água-viva",habitat:"Águas marinhas profundas",speed:.55,extent:.32,minDepth:6,swim:.65,mode:"drift",hp:8,damage:2.5,
      attack:{kind:"sting",range:.69,notice:1.04,windup:.34,strike:.24,recover:.35,cooldown:2.10}}
  });

  function register(B,defs){
    blocks.forEach(([key,name,color,type,hard],i)=>{
      const id=slots[i];
      if(defs[id])throw Error("Registro duplicado de bloco "+key);
      B[key]=id;
      defs[id]={name,solid:true,tex:id,hard,icon:"#"+color.toString(16).padStart(6,"0"),depths:type};
    });
  }
  function paint(tile,x,y,hash){
    const row=tiles.get(tile);
    if(!row)return null;
    const [key,,color,type]=row;
    const grit=(hash(x,y,tile+54)-.5)*(type==="sand"?37:22),grain=(hash(x>>1,y>>1,tile+700)-.5)*21;
    let c=rgb(color),shade=grit+grain;
    if(type==="ore"){
      const bx=x>>3,by=y>>3,px=2+hash(bx,by,tile)*4,py=2+hash(bx+17,by+11,tile)*4;
      const dx=x%8-px,dy=y%8-py,cut=Math.abs(dx)*.79+Math.abs(dy)*1.31;
      if(cut<2.85&&hash(bx-3,by+31,tile)>.18){
        const gleam=dy<-.5?41:dx>1?-19:5;
        shade=gleam+grit*.55;
        if(key==="OPAL_ORE")c=[162+Math.sin(bx*2.9)*62,212+Math.cos(by*2)*36,205+Math.sin(by*1.75+bx)*42];
      }else{
        c=key==="MAGNETITE"?[83,67,61]:[59,64,71];
        shade+=Math.sin(x*.41+y*.23)*9;
      }
    }else if(type==="sand")shade+=Math.sin(y*.53+Math.sin(x*.30))*8+hash(x>>2,y>>2,tile)*6;
    else if(type==="soil")shade+=hash(x>>2,y>>2,tile)>.81?19:-3;
    else if(type==="rock"){
      const flow=Math.sin(y*.7+Math.sin(x*.25)*2);
      shade+=key==="GRANITE"?(hash(x>>1,y>>1,tile)>.73?26:-9):flow*(key==="GNEISS"?27:18);
    }else{
      const line=key==="SUNKEN_BRICK"?y%8<1||(x+(y>>3)%2*8)%16<1:key==="SUNKEN_MOSAIC"?Math.abs(x-15)+Math.abs(y-15)>17:x<4||y<4||x>27||y>27;
      shade+=line?-26:13;
      if(hash(x>>2,y>>2,tile+6)>.78)c=c.map((v,i)=>v+[0,18,2][i]);
    }
    return [...c.map(v=>clamp(v+shade,0,255)),255];
  }

  const hot=new Set(["selva tropical","savana","pântano","manguezal","delta salobro"]);
  const polar=new Set(["fiordes glaciais","taiga","tundra","campina de aurora"]);
  const volcanic=new Set(["vulcânico","caldeira vítrea","badlands","chapadas ocres"]);
  const mountain=new Set(["montanha","prado alpino","bosque de cristais","cânion calcário"]);
  function create({B,seed,hash,level=15}){
    const cell=448,cache=new Map(),salt=seed%104729;
    function basinFor(cx,cz){
      const key=cx+","+cz;
      if(cache.has(key))return cache.get(key);
      const x=Math.floor((cx+.40+hash(cx,cz,salt)*.20)*cell);
      const z=Math.floor((cz+.40+hash(cx+27,cz-5,salt)*.20)*cell);
      const r=102+hash(cx-97,cz+19,salt)*59;
      const roll=hash(cx+4,cz+13,salt);
      const basin=Math.hypot(x,z)>280?{key,x,z,rx:r*(.93+hash(cx,cz,salt+13)*.16),rz:r*(.85+hash(cx,cz,salt+21)*.24),roll,
        floor:level-11,ruin:Math.floor(hash(cx-9,cz+2,salt)*3),phase:hash(cx+1,cz-71,salt)*6.283}:null;
      if(cache.size>384)cache.clear();
      cache.set(key,basin);
      return basin;
    }
    function lakeAt(x,z){
      const basin=basinFor(Math.floor(x/cell),Math.floor(z/cell));
      if(!basin)return null;
      const dx=(x-basin.x)/basin.rx,dz=(z-basin.z)/basin.rz,d=Math.hypot(dx,dz);
      if(d>1.065)return null;
      const bend=.028*Math.sin(Math.atan2(dz,dx)*5+basin.phase)+.018*Math.sin(Math.atan2(dz,dx)*8-basin.phase);
      const radius=d+bend;
      return radius<1?{basin,radius}:null;
    }
    function lakeHeight(height,lake,x,z,rough=0){
      if(!lake)return height;
      const {basin,radius}=lake;
      const depth=smooth(clamp((.90-radius)/.73,0,1));
      const floor=level-1-(level-1-basin.floor)*depth+rough*depth;
      const weight=smooth(clamp((1-radius)/.23,0,1));
      const ruined=Math.max(Math.abs(x-basin.x),Math.abs(z-basin.z))<13;
      return ruined?Math.min(height,basin.floor):Math.min(height,height+(floor-height)*weight);
    }
    function waterKind(lake,biome){
      if(!lake)return null;
      const {roll}=lake.basin;
      if(polar.has(biome))return "glacial";
      if(biome==="manguezal"||biome==="delta salobro"||biome==="salinas")return "marine";
      return !hot.has(biome)&&roll<.35?"marine":"fresh";
    }
    function ruinAt(lake,x,z){
      if(!lake)return null;
      const {basin}=lake;
      const dx=x-basin.x,dz=z-basin.z;
      return Math.abs(dx)<=10&&Math.abs(dz)<=9?{basin,dx,dz}:null;
    }
    function ruinBlock(ruin,y){
      if(!ruin)return 0;
      const {basin,dx,dz}=ruin,x=Math.abs(dx),z=Math.abs(dz),h=y-basin.floor;
      if(h<0||h>6)return 0;
      const material=B.SUNKEN_BRICK,trim=B.SUNKEN_MOSAIC;
      if(h===0&&x<=9&&z<=8)return x===9||z===8||x%3===0&&z%3===0?trim:material;
      if((x===7||x===3)&&z===5&&h>=1&&h<=4+(x===3?1:0))return h===4+(x===3?1:0)?B.SUNKEN_BEACON:material;
      if(h===1&&z===8&&x<=8&&x>=2&&hash(dx,dz,basin.phase)>.28)return material;
      if(dz===4&&x<=3&&h===5)return trim;
      if(basin.ruin===0&&x<=2&&z<=2&&h===1)return trim;
      if(basin.ruin===1&&dx===0&&dz===0&&h>=1&&h<=3)return h===3?B.OPAL_ORE:trim;
      if(basin.ruin===2&&h===1&&x>=3&&x<=5&&z<=1)return x===5?B.SAPPHIRE_ORE:material;
      if(h===1&&x===9&&z<8&&hash(dx+27,dz+9,basin.phase)>.68)return material;
      return 0;
    }
    function surface(biome,x,z,delta,lake){
      const r=hash(x>>3,z>>3,salt+319);
      if(delta<=1){
        if(volcanic.has(biome)&&r>.30)return B.BLACK_SAND;
        if(waterKind(lake,biome)==="marine"&&r>.52)return B.PINK_SAND;
        if(!polar.has(biome)&&!hot.has(biome)&&r>.62)return B.RIVER_SAND;
        return 0;
      }
      if(volcanic.has(biome)&&r>.63)return B.RED_EARTH;
      if(hot.has(biome)&&r>.71)return biome==="selva tropical"||biome==="savana"?B.RED_EARTH:B.BLACK_EARTH;
      if((biome==="floresta"||biome==="floresta de sequoias"||biome==="bosque lilás")&&r>.68)return B.BLACK_EARTH;
      if((biome==="planície"||biome==="planície florida")&&r>.74)return B.BROWN_EARTH;
      if(mountain.has(biome)&&delta>12&&r>.65)return r>.83?B.GNEISS:B.GRANITE;
      return 0;
    }
    function ore(biome,x,y,z,h,lake){
      if(y<4||y>38||h-y<4)return 0;
      const band=hash(Math.floor(x/3)+251,Math.floor(y/2)+783,Math.floor(z/3)+salt);
      if(band<.028&&(y<=18||mountain.has(biome)))return B.IRON;
      if(band<.040&&(y<=20||mountain.has(biome)))return B.MAGNETITE;
      if(band>.989&&y<=10)return B.DIAMOND_ORE;
      if(band>.974&&y<=23&&mountain.has(biome))return B.EMERALD_ORE;
      if(band>.965&&y<=20&&volcanic.has(biome))return B.RUBY_ORE;
      if(band>.967&&y<=21&&(polar.has(biome)||lake&&lake.radius<.8))return B.SAPPHIRE_ORE;
      if(band>.970&&y<=24&&(biome==="termas minerais"||biome==="cânion calcário"||lake))return B.OPAL_ORE;
      if(band>.980&&y<=26)return B.GARNET_ORE;
      return 0;
    }
    function rock(biome,x,y,z){
      const chance=hash(x>>4,z>>4,Math.floor(y/5)+salt);
      if(chance<.18&&y>10)return volcanic.has(biome)?B.BLACK_SHALE:mountain.has(biome)||polar.has(biome)?B.GNEISS:B.GRANITE;
      if(chance>.91&&y<24)return B.BLACK_SHALE;
      return 0;
    }
    function eligible(biome,lake,water,depth){
      const references=Object.entries(fauna).filter(([,p])=>p.waters?.includes(water)&&depth>=p.minDepth&&
        (!p.tropical||hot.has(biome))).map(([id])=>id);
      return [...residentFauna(biome,lake,water,depth),...references];
    }
    function residentFauna(biome,lake,water,depth){
      if(water==="acid"||water==="thermal"||!lake&&!kindFallback.has(water))return [];
      const zone=lake?(water==="cold"?"glacial":water==="salt"?"marine":"fresh"):null;
      const wetland=biome==="manguezal"||biome==="delta salobro"||biome==="pântano";
      if(wetland&&depth>=3&&zone!=="glacial"&&(!lake||lake.radius>.46||zone!=="marine")){
        return depth>=4&&water==="salt"?["caiman","ray","venom_ray","pufferfish","fishfolk_head","fishfolk_tail"]:["caiman","fishfolk_head"];
      }
      if(zone==="glacial"||!lake&&water==="cold"&&polar.has(biome)){
        return depth>=8?["orca","orca","jelly",...(depth>=fauna.humpback.minDepth?["humpback"]:[])]:depth>=6?["jelly"]:[];
      }
      if(zone==="marine"||water==="salt"&&!hot.has(biome)){
        if(depth>=8&&zone==="marine")return ["dolphin","dolphin","reef_shark","ray","jelly","venom_ray","pufferfish","mermaid","fishfolk_tail",
          ...(depth>=fauna.humpback.minDepth?["humpback","humpback"]:[])];
        if(depth>=6)return ["dolphin","reef_shark","ray","venom_ray","pufferfish","mermaid","fishfolk_tail"];
        return depth>=4?["ray","venom_ray","pufferfish","fishfolk_tail","mermaid"]:depth>=3?["pufferfish"]:[];
      }
      if(depth<3||!hot.has(biome))return [];
      if(water==="salt"||water==="cold")return [];
      return ["piranha"];
    }
    return {lakeAt,lakeHeight,waterKind,ruinAt,ruinBlock,surface,ore,rock,eligible};
  }
  return {register,paint,create,fauna,marineProfiles,
    minerals:blocks.filter(row=>row[3]==="ore").map(row=>row[0]),
    soils:blocks.filter(row=>row[3]==="soil").map(row=>row[0]),
    sands:blocks.filter(row=>row[3]==="sand").map(row=>row[0])};
})();

