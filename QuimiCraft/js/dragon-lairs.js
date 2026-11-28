"use strict";

globalThis.QuimiCraftDragonLairs=(()=>{
  const flights=[
    {id:"tempo",name:"Covil da Revoada do Tempo",aspect:"aspect_time",followers:["bronze_drake","time_dragon","time_lost_protodrake"],
      biomes:["deserto","salinas","badlands","chapadas ocres"],rock:"OCHRE_STONE",trim:"BRONZE_BLOCK",gem:"OPAL_ORE",colors:[0x9e7547,0xe4c678],
      prop:"Anel das Eras",story:"As ampulhetas de bronze registram os juramentos de cada era."},
    {id:"sonho",name:"Covil da Revoada do Sonho",aspect:"aspect_dream",followers:["emerald_drake","nature_dragon"],
      biomes:["floresta de sequoias","selva tropical","bosque lilás","floresta"],rock:"FIELDSTONE",trim:"CANOPY_ROOT",gem:"EMERALD_ORE",colors:[0x39614e,0xa2d58e],
      prop:"Semente do Sonho",story:"O altar de raízes guarda uma semente que os dragões vigiam durante o sono."},
    {id:"vida",name:"Covil da Revoada da Vida",aspect:"aspect_life",followers:["ruby_drake","fire_dragon","elemental_lizard_fire"],
      biomes:["badlands","caldeira vítrea","termas minerais","chapadas ocres"],rock:"BASALT",trim:"CERAMIC",gem:"RUBY_ORE",colors:[0x8c453a,0xff9b67],
      prop:"Braseiro da Vida",story:"O fogo queima nas taças rubras para aquecer os ovos sob o cuidado da revoada."},
    {id:"magia",name:"Covil da Revoada da Magia",aspect:"aspect_magic",followers:["azure_drake","ice_dragon","elemental_lizard_storm"],
      biomes:["bosque de cristais","fiordes glaciais","campina de aurora","prado alpino"],rock:"SLATE",trim:"FROST_SPIRE",gem:"SAPPHIRE_ORE",colors:[0x3d517d,0xa4c9f9],
      prop:"Prisma da Magia",story:"Obeliscos lapidados convergem a luz arcana para os estudos do Aspecto."},
    {id:"cataclismo",name:"Covil da Revoada do Cataclismo",aspect:"aspect_cataclysm",followers:["obsidian_drake","earth_dragon","elemental_lizard_earth"],
      biomes:["vulcânico","caldeira vítrea","badlands","montanha"],rock:"DEEPSTONE",trim:"OBSIDIAN",gem:"AMETHYST",colors:[0x403938,0xe27643],
      prop:"Marco da Fratura",story:"Monólitos partidos registram os terremotos que abriram caminho à revoada."}
  ];
  const blockKeys=id=>["LAIR_"+id.toUpperCase(),"RELIC_"+id.toUpperCase()];
  const places=flights.map(flight=>{
    const {id,name,aspect,followers,biomes}=flight;
    return {id:"covil_"+id,name,flight,width:15,depth:15,height:18,biomes,
      aliases:["revoada_"+id,"covil_da_revoada_"+id],actors:[[aspect,0,-5],
        [followers[0],-6,4],[followers[1],6,4],[followers.at(-1),-7,-4],[followers[0],7,-4]]};
  });
  function register(B,defs){
    flights.forEach(({id,name,prop,colors,story},i)=>{
      const [stone,relic]=blockKeys(id),register=QuimiCraftDivineFactions.registerMaterial;
      register(B,defs,1260+i*2,502+i*2,stone,"Rocha da Revoada · "+id,colors[0],"ashlar",null,name);
      register(B,defs,1261+i*2,503+i*2,relic,prop,colors[1],"seal",null,story);
    });
  }
  function supplies(flight,B){
    const [,relic]=blockKeys(flight.id);
    return [[B[relic],2],[B[flight.gem],3],["dragon_hide",2],["crystal_shard",3]];
  }
  function build(B,site,platform,box){
    const {flight}=site.layout,{id}=flight;
    const [stone,relic]=blockKeys(id).map(key=>B[key]),rock=B[flight.rock],trim=B[flight.trim],gem=B[flight.gem];
    const put=(u,h,v,block)=>box(u,h,v,u,h,v,block);
    for(let v=-14;v<=14;v++)for(let u=-15;u<=15;u++){
      const d=(u/15.6)**2+(v/15.5)**2;
      if(d>1&&!(v>6&&Math.abs(u)<=5))continue;
      platform(u,v,site.y,d<.52?stone:rock,rock);
      const top=5+Math.floor(Math.sqrt(Math.max(0,1-d))*10);
      const inlet=v>7&&Math.abs(u)<=5;
      if(d>.85&&!inlet)box(u,1,v,u,top,v,rock);
      else{
        box(u,1,v,u,top-2,v,B.AIR);
        box(u,top-1,v,u,top,v,stone);
        if(d>.6&&(u+v)%4===0)put(u,top,v,trim);
      }
    }
    for(let v=14;v<=26;v++)for(let u=-4;u<=4;u++)
      platform(u,v,site.y+Math.round((v-14)*(site.approach-site.y)/12),rock,rock);
    for(const side of [-1,1]){
      for(let i=0;i<4;i++){
        const u=side*(7+i),v=8-i*2;
        box(u,1,v,u,2+i%3,v,trim);put(u,3+i%3,v,gem);
      }
      const x=side*5;
      if(id==="tempo"){
        for(let i=0;i<12;i++){
          const a=i*Math.PI/6;
          put(x+Math.round(Math.cos(a)*3),5+Math.round(Math.sin(a)*3),-10,i%3===0?relic:trim);
        }
        box(x,1,-10,x,3,-10,trim);put(x,5,-10,relic);
      }else if(id==="sonho"){
        for(let h=1;h<=7;h++)put(side*(4+Math.round(Math.sin(h*.55)*2)),h,-10,trim);
        box(x-2,6,-11,x+2,6,-9,B.CANOPY_SHINGLE);put(x,1,-10,relic);
      }else if(id==="vida"){
        box(x,1,-10,x,3,-10,trim);box(x-2,4,-11,x+2,4,-9,relic);
        put(x,5,-10,B.GLOWSTONE);
      }else if(id==="magia"){
        box(x,1,-10,x,7,-10,trim);box(x-1,5,-10,x+1,6,-10,relic);
        put(x,8,-10,B.SPECTRAL);
      }else{
        for(let h=1;h<=7;h++)put(x+side*Math.floor(h/3),h,-10,h%3===0?relic:trim);
        put(x,1,-8,B.MAGMA_ROCK);
      }
      put(side*5,2,11,B.SPECTRAL);
    }
    for(let u=-3;u<=3;u++)for(let v=-8;v<=-3;v++)put(u,0,v,(u+v)%3===0?relic:trim);
    const index=flights.indexOf(flight),ornaments=QuimiCraftFactionBuilding.ornamentIds(B,"revoadas");
    put(-6,1,-3,ornaments[index*2]);put(6,1,-3,ornaments[index*2+1]);
  }
  return {places,register,supplies,build};
})();
