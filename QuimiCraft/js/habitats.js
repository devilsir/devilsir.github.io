"use strict";

globalThis.QuimiCraftHabitats = (() => {
  const FIRST=224;
  const blocks=[
    ["AMBER_PEAT","Turfa âmbar","#735242","soil"],
    ["RUST_REED","Junco ferrugíneo","#ad9258","reed"],
    ["WET_IRONSTONE","Concreção ferruginosa","#985437","ore"],
    ["GLOW_LOAM","Húmus violeta","#524753","soil"],
    ["GLOW_FUNGUS","Cogumelo-lúmen","#8bebc5","cap"],
    ["LUMEN_GEODE","Geodo de calcita violeta","#8071a7","ore"],
    ["GLACIAL_GRAVEL","Cascalho glacial","#a3c5d2","soil"],
    ["FROST_LICHEN","Líquen-azul","#7cc8df","lichen"],
    ["BLUE_ICE_VEIN","Veio de gelo azul","#5c9fc6","ice"],
    ["TRAVERTINE","Travertino bandado","#ddc49b","bands"],
    ["CALCITE_REED","Ceríntia das termas","#93a96b","reed"],
    ["BANDED_CALCITE","Calcita mel","#dea55e","ore"],
    ["IRON_TERRACE","Arenito ferruginoso","#a76343","bands"],
    ["VERMILION_AGAVE","Agave rubra","#c37062","reed"],
    ["HEMATITE_VEIN","Veio de hematita","#7d4242","ore"],
    ["CIVIC_STONE","Piso de mosaico","#7e9d98","mosaic"],
    ["CIVIC_MARKER","Brasão dos ofícios","#e2ae69","mosaic"],
    ["LAB_GUIDE_GOLD","Trilha da Mineralogia","#c69e5a","mosaic"],
    ["LAB_GUIDE_BLUE","Trilha das Águas","#5696c9","mosaic"],
    ["LAB_GUIDE_GREEN","Trilha da Ecologia","#63ad8e","mosaic"]
  ];
  const profiles = {
    amber:{name:"Brejo Âmbar",soil:"AMBER_PEAT",plant:"RUST_REED",vein:"WET_IRONSTONE",
      water:{id:"tannin",label:"Água âmbar rica em taninos",rgb:[.59,.40,.24],chem:{contaminated:true}},
      note:"A cor âmbar pode vir de compostos orgânicos dissolvidos. A cor sozinha não mede a contaminação.",
      residents:["amber_ibis","amber_ibis","peat_slime"],night:["peat_slime","peat_slime"],specimen:"WET_IRONSTONE"},
    lumen:{name:"Bosque Lúmen",soil:"GLOW_LOAM",plant:"GLOW_FUNGUS",vein:"LUMEN_GEODE",
      note:"No jogo, os cogumelos emitem luz própria. A fluorescência de minerais é outro fenômeno e depende de luz incidente.",
      residents:["lumen_moth","lumen_moth"],night:["lumen_moth","lumen_moth"],specimen:"LUMEN_GEODE"},
    glacial:{name:"Cristas de Gelo Azul",soil:"GLACIAL_GRAVEL",plant:"FROST_LICHEN",vein:"BLUE_ICE_VEIN",
      water:{id:"cold",label:"Água de degelo azul",rgb:[.36,.68,.88],chem:{cold:true}},
      note:"Compare a cor do gelo compacto com a do gelo cheio de bolhas. A espessura da camada também altera a cor que se vê.",
      residents:["rime_fox","rime_fox"],night:["rime_fox"],specimen:"BLUE_ICE_VEIN"},
    terrace:{name:"Jardins de Travertino",soil:"TRAVERTINE",plant:"CALCITE_REED",vein:"BANDED_CALCITE",
      water:{id:"mineral",label:"Água carbonatada dos terraços",rgb:[.61,.76,.64],chem:{alkaline:true}},
      note:"Quando uma água rica em bicarbonato perde parte do CO₂ dissolvido, o carbonato de cálcio pode precipitar.",
      residents:["travertine_guard","travertine_guard"],night:["travertine_guard"],specimen:"BANDED_CALCITE"},
    iron:{name:"Encostas de Hematita",soil:"IRON_TERRACE",plant:"VERMILION_AGAVE",vein:"HEMATITE_VEIN",
      note:"A hematita contém ferro na forma de óxido. Sua marca em uma placa de porcelana tende a ser vermelho-acastanhada.",
      residents:["iron_armadillo","iron_armadillo"],night:["iron_armadillo"],specimen:"HEMATITE_VEIN"}
  };
  const colors=blocks.map(([, ,color])=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)));
  const register=(B,defs)=>{
    blocks.forEach(([key,name,icon,style],index)=>{
      const id=FIRST+index,plant=["reed","cap","lichen"].includes(style);
      if(defs[id])throw Error("Bloco de habitat já registrado.");
      B[key]=id;
      defs[id]={name,icon,tex:id+1,hard:plant?.2:style==="soil"?.65:style==="ore"?2.1:1.28,
        solid:!plant,plant,alpha:style==="ice"};
      if(key==="GLOW_FUNGUS")defs[id].glow=true;
    });
  };
  function paint(tile,x,y,hash){
    const i=tile-FIRST-1,row=blocks[i],base=colors[i];
    if(!row)return [108,113,117,255];
    const style=row[3],grain=(hash(x>>1,y>>1,tile)-.5)*39;
    let value=base,light=grain,opacity=255;
    if(style==="reed"){
      const stem=y>7&&Math.abs(x-16-Math.sin(y*.22)*2)<1.5;
      const leaf=y>11&&y<29&&[0,1,2].some(n=>{
        const dx=x-16,side=n%2===0?1:-1;
        return side*dx>0&&side*dx<12&&Math.abs(y-15-n*4+side*dx*.55)<1.6;
      });
      const tip=Math.abs(x-16)<3&&y>2&&y<12;
      opacity=stem||leaf||tip?255:0;
      if(stem||leaf)value=[88,123,69];
    }else if(style==="cap"){
      const a=Math.hypot((x-16)*.65,(y-13)*1.2),cap=a<7.3&&y<=16;
      opacity=cap||y>=14&&y<=30&&Math.abs(x-16)<3?255:0;
      if(!cap)value=[124,128,141];
      if(cap&&hash(x,y,tile)>.76)light+=45;
    }else if(style==="lichen"){
      const fringe=y>21+Math.sin(x*.5)*5;
      opacity=fringe&&hash(x>>1,y>>1,tile)>.24?255:0;
    }else if(style==="bands"){
      light+=Math.sin(y*.77+Math.sin(x*.31)*.8)*20;
    }else if(style==="ore"){
      const deposit=hash(x>>2,y>>1,tile);
      value=deposit<.60?[57,62,66]:base;
      if(deposit>.87)light+=45;
    }else if(style==="ice"){
      const streak=(x*2+y+Math.round(Math.sin(y*.43)*5))%13;
      light+=streak<2?36:-8;
    }else if(style==="mosaic"){
      const edge=x%8===0||y%8===0;
      light+=edge?-44:(x>>3)%2===(y>>3)%2?19:-12;
      if(row[0]==="CIVIC_MARKER"&&Math.abs(x-15)+Math.abs(y-15)<10)light+=52;
    }
    return [...value.map(v=>v+light),opacity];
  }
  const groups={
    amber:new Set(["pântano","manguezal","delta salobro","selva tropical"]),
    lumen:new Set(["bosque de cristais","bosque lilás","floresta","floresta de sequoias","bosque de cerejeiras"]),
    glacial:new Set(["fiordes glaciais","tundra","taiga","prado alpino","montanha","campina de aurora"]),
    terrace:new Set(["cânion calcário","termas minerais","salinas"]),
    iron:new Set(["chapadas ocres","badlands","deserto","savana","vulcânico","caldeira vítrea"])
  };
  const byBiome=new Map(Object.entries(groups).flatMap(([name,biomes])=>[...biomes].map(b=>[b,name])));
  function create({B,hash,noise,seed,biomeAt,waterLevel,excluded}){
    const salt=seed%1103;
    const caches=new Map();
    function at(x,z,biome=biomeAt(x,z)){
      const category=byBiome.get(biome);
      if(!category)return null;
      x=Math.floor(x);z=Math.floor(z);
      const k=x+","+z;
      if(caches.has(k))return caches.get(k);
      const bands=noise.n2(x*.021+salt,z*.021-salt)+.36*noise.n2(x*.053-241,z*.053+113);
      const result=bands>(category==="amber"?.075:.12)&&!excluded(x,z)?category:null;
      if(caches.size>32000)caches.clear();
      caches.set(k,result);
      return result;
    }
    function surface(kind,x,z,height){
      if(!kind)return 0;
      if(height<waterLevel-2&&kind!=="amber"&&kind!=="terrace")return 0;
      const value=noise.n2(x*.105+salt,z*.105-salt);
      return value>-.25?B[profiles[kind].soil]:0;
    }
    function vegetation(kind,x,z,h){
      if(!kind||h<waterLevel-1)return 0;
      const chance=hash(x,z,1581+salt),cluster=noise.n2(x*.13+39,z*.13-salt);
      const threshold=kind==="lumen"?.915:kind==="glacial"?.948:.958;
      return chance>threshold-Math.max(0,cluster)*.1?B[profiles[kind].plant]:0;
    }
    function ore(kind,x,y,z){
      if(!kind)return 0;
      const {vein}=profiles[kind];
      const roll=hash(Math.floor(x/3)+596,Math.floor(y/2)+salt,Math.floor(z/3)-327);
      return roll>.968?B[vein]:0;
    }
    function fauna(kind,night){
      const p=profiles[kind];
      return p ? (night?p.night:p.residents) : [];
    }
    return {at,surface,vegetation,ore,fauna,
      water:kind=>profiles[kind]?.water,profile:kind=>profiles[kind]};
  }
  return {firstBlock:FIRST,profiles,register,paint,create};
})();

