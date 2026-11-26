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
    instant_resin:["Resina de cura rápida","#c9bdac"],
    sentinel_crust:["Placa carbonática da sentinela","#d4bb91"],
    tide_mucus:["Muco do Limo de Maré","#9eb769"],
    ember_scale:["Escama de Brasa","#9d6e53"],
    shell_carbonate:["Carbonato de cálcio (CaCO₃)","#e6d8b5"],
    sodium_alginate:["Alginato de sódio","#c4d092"],
    alginate_beads:["Grânulos de alginato de cálcio","#8cb379"],
    glass_myc_field_sample:["Tecido vítreo do fungo","#85dbc0"],
    fungal_lumen:["Extrato luminescente do fungo","#84f3d3"],
    geode_carapace:["Carapaça do Escavador de Geodo","#8a799f"],
    quartz_abrasive:["Grãos abrasivos de quartzo","#ded6e5"],
    soot_silk:["Seda impregnada de fuligem","#555265"],
    soot_adsorbent:["Carbono poroso da fuligem","#494b60"],
    resonance_nodule:["Nódulo ressonante","#db8ee3"],
    resonant_quartz:["Cristal piezoelétrico","#d29dec"],
    furnace_carapace:["Fragmento de carapaça da Fornalha","#9f6a50"],
    refractory_plate:["Placa cerâmica refratária","#d49d77"],
    quartz_whetstone:["Pedra de Afiar de Quartzo","#bfb1cb"],
    soot_filter:["Filtro de Fuligem","#67717d"],
    vein_probe:["Sonda de Veios","#be88dd"],
    refractory_boots:["Botas Refratárias","#b47655"]
  };
  const huntUtilities={
    quartz_whetstone:"Use na barra rápida para recuperar até 25% da condição máxima da picareta mais gasta na barra. Serve para pedra, cobre e ferro.",
    soot_filter:"Use na barra rápida para renovar o filtro da máscara equipada em campo.",
    vein_probe:"Use na barra rápida para localizar o veio metálico ou gema mais próximo num raio de 12 m. Mostra as coordenadas e pode ser reutilizada.",
    refractory_boots:"Equipe nos pés para reduzir o dano de fogo e lava e proteger do calor ambiental."
  };
  const huntChemistry={
    glass_mycelium:["separate_glass_mycelium","encapsulate_fungal_light"],
    echo_burrower:["extract_geode_abrasive","bind_quartz_whetstone"],
    soot_weaver:["extract_soot_adsorbent","pack_soot_filter"],
    resonant_burrower:["isolate_resonant_quartz","build_vein_probe"],
    furnace_weaver:["sinter_furnace_shell","assemble_refractory_boots"]
  };
  const equipment=[
    {key:"FIELD_ANALYZER",id:"field_analyzer",name:"Analisador de Amostras",length:2,depth:1,color:"#62aeb2",icon:"⌕",
      purpose:"Mede composição, pH, pureza, densidade e ponto de ebulição das amostras.",need:[["iron_ingot",2],["spectrometer_lens",1],["GLASS",2]]},
    {key:"FIELD_EXTRACTOR",id:"field_extractor",name:"Extrator Químico",length:3,depth:1,color:"#75a881",icon:"⌁",
      purpose:"Separa componentes de lágrimas, salivas, tecidos e carapaças. Algumas extrações liberam vapores.",need:[["iron_ingot",3],["lab_glassware",1],["carbon_filter",1]]},
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
    {name:"Filtro de grafite dracônica",need:[["draconic_graphite",1],[B.GLASS,1]],out:["carbon_filter",2]},
    {name:"Martelo de Fratura",need:[["iron_ingot",3],["stick",2]],out:["fracture_hammer",1]},
    {name:"Sachê Osmótico",need:[[B.SALT,1],["hide",1]],out:["osmotic_salt",3]},
    {name:"Bolsa de Gelo Salino",need:[[B.ICE,1],[B.SALT,1],["hide",1]],out:["brine_cold_pack",3]},
    {name:"Ampola Cúprica",need:[["copper_sulfate",1],[B.GLASS,1]],out:["copper_ampoule",4]},
    {name:"Diapasão de Ruptura",need:[["iron_ingot",2],[B.COPPER,1]],out:["echo_fork",1]},
    {name:"Cartucho de Vedação",need:[[B.CLAY,1],["plant_oil",1],[B.PLANK,1]],out:["sealing_cartridge",4]}
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
    reaction("shell_carbonate","Separar a placa da sentinela","Placa carbonática → CaCO₃","field_extractor",
      [["sentinel_crust",1]],[["shell_carbonate",2]]),
    {...reaction("sentinel_calcium","Dissolver carbonato da sentinela","CaCO₃ + 2 HCl → CaCl₂ + CO₂ + H₂O","field_refiner",
      [["shell_carbonate",1],["hydrochloric_acid",1]],[["calcium_chloride",2],["carbon_dioxide",1],["water",1]],22),feedback:"bubbles"},
    reaction("tide_alginate","Extrair alginato do muco","Muco de maré → alginato de sódio","field_extractor",
      [["tide_mucus",1]],[["sodium_alginate",2]]),
    {...reaction("alginate_gel","Gelificar alginato","Alginato de sódio + Ca²⁺ → gel de alginato de cálcio","field_refiner",
      [["sodium_alginate",1],["calcium_chloride",1]],[["alginate_beads",3]]),
      description:"Os íons de cálcio unem as cadeias do alginato e formam grânulos de gel."},
    {...reaction("alginate_filter","Filtrar água com alginato e carvão","Água contaminada → água purificada","field_refiner",
      [["contaminated_water",3],["alginate_beads",1],["activated_carbon",1]],[["purified_water",3]]),
      description:"Os grânulos retêm partículas em suspensão e o carvão adsorve parte dos compostos dissolvidos."},
    {...reaction("ember_copper","Calcinar Escama de Brasa","Cu₂CO₃(OH)₂ → 2 CuO + CO₂ + H₂O","laboratory_furnace",
      [["ember_scale",1],["coal",1]],[["copper_oxide",2],["carbon_dioxide",1],["water",1]],22),temperature:325,feedback:"heat"},
    {...reaction("separate_glass_mycelium","Separar o tecido vítreo do fungo","Tecido vítreo → extrato luminescente + sílica","field_extractor",
      [["glass_myc_field_sample",1]],[["fungal_lumen",2],["SILICA_SAND",1]]),
      description:"A fase líquida concentra o sistema luminescente do fungo. A sílica permanece na fração sólida."},
    {...reaction("encapsulate_fungal_light","Encapsular luz fúngica","Extrato luminescente + vidro → luminária selada","field_refiner",
      [["fungal_lumen",1],["glass",1]],[["MYCELIUM_LAMP",2]]),feedback:"color",
      description:"A luminária mantém a bioluminescência do extrato e ilumina sem chama."},
    {...reaction("extract_geode_abrasive","Separar o quartzo da carapaça","Carapaça de geodo → grãos de SiO₂","field_extractor",
      [["geode_carapace",1]],[["quartz_abrasive",2]]),
      description:"Da carapaça mineral, separam-se grãos duros de quartzo que servem como abrasivo."},
    {...reaction("bind_quartz_whetstone","Consolidar pedra de afiar","Grãos de quartzo + ligante cerâmico → compósito abrasivo","field_refiner",
      [["quartz_abrasive",1],["clay",1]],[["quartz_whetstone",2]]),
      description:"A matriz fixa os grãos. Na picareta, eles removem irregularidades da aresta."},
    {...reaction("extract_soot_adsorbent","Separar carbono poroso da seda","Seda com fuligem → fração carbonácea porosa","field_extractor",
      [["soot_silk",1]],[["soot_adsorbent",2]]),
      description:"A rede de poros do carbono concentra uma grande área superficial para adsorção."},
    {...reaction("pack_soot_filter","Montar filtro de fuligem","Carbono poroso + lã → cartucho adsorvente","field_refiner",
      [["soot_adsorbent",1],["wool",1]],[["soot_filter",2]]),
      description:"O tecido retém partículas e mantém os grãos no cartucho. Compostos do ar aderem à superfície do carbono."},
    {...reaction("isolate_resonant_quartz","Isolar cristais do nódulo ressonante","Nódulo → quartzo piezoelétrico + granada","field_extractor",
      [["resonance_nodule",1]],[["resonant_quartz",1],["GARNET_ORE",1]]),
      description:"O quartzo gera um sinal elétrico ao ser deformado. A granada é recuperada como fração separada."},
    {...reaction("build_vein_probe","Montar sonda piezoelétrica","Cristal + eletrodos de cobre + célula → sonda de veios","field_refiner",
      [["resonant_quartz",1],["copper_ingot",1],["voltaic_cell",1]],[["vein_probe",1]]),
      description:"No jogo, a sonda usa o cristal para emitir e ler pulsos nas rochas e indicar um veio próximo."},
    {...reaction("sinter_furnace_shell","Sinterizar a carapaça da Fornalha","Carapaça aluminosa + argila → placa refratária","laboratory_furnace",
      [["furnace_carapace",1],["clay",1]],[["refractory_plate",2]]),temperature:1250,fuel:["coal",1],feedback:"heat",
      description:"O tratamento térmico consolida os grãos em uma cerâmica que mantém a forma sob calor intenso."},
    {...reaction("assemble_refractory_boots","Revestir botas com cerâmica refratária","Botas de ferro + placas refratárias → botas isolantes","field_refiner",
      [["iron_boots",1],["refractory_plate",2]],[["refractory_boots",1]]),
      description:"A camada cerâmica reduz a transferência de calor para os pés. Equipe as botas no inventário."},
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
  function registerLamp(B,defs){
    B.MYCELIUM_LAMP=517;
    defs[517]={name:"Luminária de Micélio",solid:false,partial:true,hard:.32,tex:208,icon:"#7ce9bf",
      description:"Luminária selada que ilumina cavernas e reduz o surgimento de criaturas hostis nas proximidades."};
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
  return {items,huntUtilities,huntChemistry,equipment,byBlock,register,registerCement,registerLamp,footprint,locate,recipes,stations,analyses,reactions,airLink,ventilation};
})();
