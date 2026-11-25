"use strict";

globalThis.QuimiCraftFieldLab=(()=>{
  const items={
    venom:["Veneno","#8ac75a"],venom_arrow:["Flecha envenenada","#afd36c"],
    petrifying_vial:["Frasco petrificante","#aaa995"],medusa_tear:["Lágrima de Medusa","#c4e3ae"],
    magnesium_oxide:["Óxido de magnésio calcinado (MgO)","#e5e1d3"],
    phosphoric_acid:["Ácido fosfórico (H₃PO₄)","#d7e2aa"],
    dragon_saliva_fire:["Saliva de Dragão de Fogo","#f68952"],
    dragon_saliva_ice:["Saliva de Dragão de Gelo","#a5ebfb"],
    dragon_saliva_nature:["Saliva de Dragão da Natureza","#a4ce78"],
    dragon_saliva_time:["Saliva de Dragão do Tempo","#dfa876"],
    dragon_saliva_earth:["Saliva de Dragão da Terra","#ab9b83"],
    draconic_ember:["Óxido de ferro(III) dracônico","#bd6249"],
    draconic_frost:["Concentrado frigorífico dracônico","#9bdaef"],
    draconic_chlorophyll:["Concentrado fotossintético","#87b954"],
    draconic_clock:["Pigmento oscilante","#bc8ed4"],
    draconic_silicate:["Silicato de sódio (Na₂SiO₃)","#a6aaa4"],
    tempered_alloy:["Liga dracônica temperada","#edb47d"],
    frost_crystal:["Cristal frigorífico","#a2e5f8"],
    growth_medium:["Meio nutritivo dracônico","#b9c980"],
    oscillating_solution:["Solução oscilante dracônica","#d29bcd"],
    silicate_gel:["Gel de silicato de cálcio","#b2b4ab"],
    soil_exchange:["Concentrado mineral para solo","#bdab87"],
    draconic_graphite:["Grafite dracônica","#64616b"],
    instant_resin:["Resina de cura rápida","#c9bdac"]
  };
  const equipment=[
    {key:"FIELD_ANALYZER",id:"field_analyzer",name:"Analisador de Amostras",length:2,depth:1,color:"#62aeb2",icon:"⌕",
      purpose:"Mede composição, pH, pureza, densidade e ponto de ebulição das amostras.",need:[["iron_ingot",2],["spectrometer_lens",1],["GLASS",2]]},
    {key:"FIELD_EXTRACTOR",id:"field_extractor",name:"Extrator Químico",length:3,depth:1,color:"#75a881",icon:"⌁",
      purpose:"Separa os componentes das lágrimas e salivas. A extração libera vapores no ar.",need:[["iron_ingot",3],["lab_glassware",1],["carbon_filter",1]]},
    {key:"FIELD_BOILER",id:"field_boiler",name:"Estação de Ebulição",length:3,depth:1,color:"#c19561",icon:"♨",
      purpose:"Ferve e condensa líquidos. A saída de vapor precisa de ventilação.",need:[["copper_ingot",3],["distillation_flask",1],["FURNACE",1]]},
    {key:"FIELD_REFINER",id:"field_refiner",name:"Refinador de Amostras",length:4,depth:1,color:"#9b86bc",icon:"◇",
      purpose:"Refina concentrados dracônicos e produz compostos minerais.",need:[["iron_ingot",4],["ceramic_plate",3],["carbon_filter",1]]},
    {key:"FUME_HOOD",id:"fume_hood",name:"Capela de Exaustão",length:4,depth:2,color:"#76b9bd",icon:"≋",
      purpose:"O exaustor industrial ocupa todo o teto e capta vapores pelos oito módulos superiores. Mantenha as grelhas livres. A bancada comporta seis blocos no espaço de trabalho.",
      need:[["iron_ingot",6],["GLASS",4],["carbon_filter",3],["CERAMIC",4]]}
  ].map((row,i)=>({...row,base:520+i*20}));
  const byBlock=new Map(),axes=[[1,0],[0,1],[-1,0],[0,-1]];
  for(const unit of equipment)for(let axis=0;axis<4;axis++){
    for(let z=0;z<unit.depth;z++)for(let x=0;x<unit.length;x++){
      const id=unit.base+axis*unit.length*unit.depth+z*unit.length+x;
      byBlock.set(id,{unit,axis,x,z,id});
    }
  }
  function register(B,defs){
    for(const unit of equipment)B[unit.key]=unit.base;
    for(const [id,{unit}] of byBlock){
      if(defs[id])throw Error("Registro duplicado de bloco: "+id);
      defs[id]={name:unit.name,solid:true,station:true,partial:true,hard:1.3,tex:62,icon:unit.color,hidden:id!==unit.base};
    }
  }
  function footprint(unit,site,axis){
    const [dx,dz]=axes[axis],size=unit.length*unit.depth,cells=[];
    for(let z=0;z<unit.depth;z++)for(let x=0;x<unit.length;x++){
      cells.push({x:site.x+x*dx-z*dz,y:site.y,z:site.z+x*dz+z*dx,id:unit.base+axis*size+z*unit.length+x});
    }
    return cells;
  }
  function locate(site){
    const part=byBlock.get(site.id);
    if(!part)return null;
    const {unit,axis,x,z}=part,[dx,dz]=axes[axis];
    const origin={x:site.x-x*dx+z*dz,y:site.y,z:site.z-x*dz-z*dx};
    return {unit,axis,origin,cells:footprint(unit,origin,axis)};
  }
  const recipes=B=>equipment.map(unit=>({
    name:unit.name,need:unit.need.map(([id,n])=>[B[id]??id,n]),out:[unit.base,1]
  })).concat([
    {name:"Flechas envenenadas",need:[["arrow",6],["venom",1]],out:["venom_arrow",6]},
    {name:"Fertilizante dracônico",need:[["growth_medium",1],["soil_exchange",1]],out:["fertilizer",4]},
    {name:"Filtro de grafite dracônica",need:[["draconic_graphite",1],[B.GLASS,1]],out:["carbon_filter",2]}
  ]);
  const analyses={field_analyzer:["composition","pH","purity","density","boilingPoint"]};
  const stations=Object.fromEntries(equipment.map(({id,name,icon,purpose})=>[id,{id,name,icon,purpose,maxTemperature:400,maxPressure:1.4}]));
  const reaction=(id,name,equation,station,need,out,gas=0)=>({
    id,name,equation,stations:[station],need,out,gas,duration:1300,feedback:gas?"vapor":"crystal",
    description:gas?"O processo libera vapor no mundo. Use a capela ou coloque o equipamento ao ar livre.":equation
  });
  const reactions=[
    reaction("extract_medusa_tear","Separar Lágrima de Medusa","Lágrima → MgO + H₃PO₄","field_extractor",
      [["medusa_tear",1]],[["magnesium_oxide",1],["phosphoric_acid",1]],45),
    reaction("magnesium_cement","Cimento de fosfato de magnésio","MgO + H₃PO₄ → cimento de fosfato de magnésio","field_refiner",
      [["magnesium_oxide",1],["phosphoric_acid",1]],[["MAGNESIUM_CEMENT",4]],24),
    reaction("petrifying_vial","Envasar petrificante","Lágrima de Medusa + frasco → carga petrificante","field_refiner",
      [["medusa_tear",1],["lab_glassware",1]],[["petrifying_vial",2]],62),
    reaction("field_water","Destilar água em campo","Água → água purificada","field_boiler",[["water",2]],[["purified_water",2]]),
    ...[
      ["fire","fogo","draconic_ember","Óxido de ferro(III) dracônico","tempered_alloy","Liga temperada","Liga inspirada na liberação de calor",86],
      ["ice","gelo","draconic_frost","Concentrado frigorífico","frost_crystal","Cristal frigorífico","Mistura endotérmica → cristal frigorífico",72],
      ["nature","natureza","draconic_chlorophyll","Concentrado fotossintético","growth_medium","Meio nutritivo","Modelo de fotossíntese e fixação do nitrogênio",27],
      ["time","tempo","draconic_clock","Pigmento oscilante","oscillating_solution","Solução oscilante","Ciclo cromático inspirado na reação de Belousov–Zhabotinsky",66],
      ["earth","terra","draconic_silicate","Silicato de sódio","silicate_gel","Gel de silicato","Silicato → gel mineral inspirado no processo Joosten",38]
    ].flatMap(([element,label,component,componentName,product,name,equation,gas])=>[
      reaction("extract_dragon_"+element,"Extrair saliva de "+label,"Saliva → "+componentName,"field_extractor",
        [["dragon_saliva_"+element,1]],[[component,2]],gas),
      reaction("refine_dragon_"+element,name,equation,element==="ice"||element==="time"?"field_boiler":"field_refiner",
        [[component,1]],[[product,2]],gas*.55)
    ]),
    reaction("draconic_resin","Resina de cura rápida","Gel mineral → resina inspirada em polímeros de cura instantânea","field_refiner",
      [["silicate_gel",1],["plant_oil",1]],[["instant_resin",2]],42),
    reaction("draconic_graphite","Grafitização dracônica","Cristal de carbono → grafite por aceleração temporal","field_refiner",
      [["oscillating_solution",1],["DIAMOND_ORE",1]],[["draconic_graphite",4]],30),
    reaction("soil_exchange","Concentrado mineral para solo","Silicato e calcário → concentrado inspirado na troca catiônica e no intemperismo","field_refiner",
      [["draconic_silicate",1],["LIMESTONE",1]],[["soil_exchange",2]],20)
  ];
  function registerCement(B,defs){
    B.MAGNESIUM_CEMENT=516;
    defs[516]={name:"Cimento de fosfato de magnésio",solid:true,hard:1.65,tex:39,icon:"#d0cbb8"};
  }
  // Rays stop at every impermeable voxel, including clear glass.
  function airLink(from,to,open){
    const axes=["x","y","z"],cell=axes.map(key=>Math.floor(from[key])),end=axes.map(key=>Math.floor(to[key]));
    const delta=axes.map(key=>to[key]-from[key]),step=delta.map(Math.sign);
    const period=delta.map(v=>v?Math.abs(1/v):Infinity);
    const crossing=axes.map((key,i)=>step[i]?(cell[i]+Number(step[i]>0)-from[key])/delta[i]:Infinity);
    while(open(...cell)){
      if(cell.every((v,i)=>v===end[i]))return true;
      const nearest=Math.min(...crossing.map((time,i)=>cell[i]===end[i]?Infinity:time));
      for(let i=0;i<3;i++)if(cell[i]!==end[i]&&crossing[i]===nearest){
        cell[i]+=step[i];crossing[i]+=period[i];
      }
    }
    return false;
  }
  function ventilation(origin,open,sky,angle,strength){
    const x=Math.floor(origin.x),y=Math.floor(origin.y),z=Math.floor(origin.z);
    if(!open(x,y,z))return 0;
    if(sky(x,y,z))return strength;
    const directions=[[1,0],[-1,0],[0,1],[0,-1]];
    let best=0;
    const access=new Map();
    for(const dy of [0,1,-1,2]){
      if(!airLink(origin,{x:x+.5,y:y+dy+.5,z:z+.5},open))continue;
      for(const [index,[dx,dz]] of directions.entries()){
        for(let n=1;n<=9;n++){
          const px=x+dx*n,pz=z+dz*n;
          if(!open(px,y+dy,pz))break;
          if(!sky(px,y+dy,pz))continue;
          const windward=Math.abs(Math.cos(angle)*dx+Math.sin(angle)*dz);
          access.set(index,Math.max(access.get(index)||0,(1-n*.065)*(.45+.55*windward)));
          best=Math.max(best,access.get(index));
          break;
        }
      }
    }
    return strength*best*(access.size>1?1:.72);
  }
  return {items,equipment,byBlock,register,registerCement,footprint,locate,recipes,stations,analyses,reactions,airLink,ventilation};
})();
