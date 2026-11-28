"use strict";

globalThis.QuimiCraftGrove=(()=>{
  const order="arvoroso",name="Conselho dos Arvorosos",reach=30;
  const biomes=["floresta","floresta de sequoias","selva tropical","bosque de cerejeiras","bosque lilás","taiga","planície florida","manguezal","delta salobro"];
  const pieces=[
    ["CANOPY_BARK","Casca Estriada das Copas",[101,65,44],"WOOD","Os Guardiões retiram esta casca dos troncos derrubados pelo vento."],
    ["CANOPY_PLANK","Tábuas de Sequoia Polida",[169,105,64],"REDWOOD_LOG","As tábuas largas são usadas nas casas dos Arvorosos adultos."],
    ["CANOPY_ROOT","Raízes Trançadas",[115,83,43],"WOOD","As raízes são entrelaçadas enquanto ainda crescem para reforçar as paredes."],
    ["CANOPY_SHINGLE","Telha de Folhagem Prensada",[65,116,69],"LEAVES","A folhagem impermeabilizada com resina forma os telhados da aldeia."],
    ["CANOPY_PATH","Mosaico de Sementes",[137,108,71],"FIELDSTONE","A disposição das sementes no piso indica caminhos entre os ofícios da aldeia."],
    ["CANOPY_RESIN","Painel de Âmbar da Copa",[209,140,59],"HONEYCOMB","Placas douradas registram as marcas deixadas por insetos na resina."],
    ["CANOPY_LANTERN","Lampião de Seiva",[218,212,109],"GLOWSTONE","Pequenos fungos mantidos na seiva acendem as trilhas durante a noite.","lantern",12],
    ["CANOPY_BENCH","Banco de Raiz Curvada",[137,111,57],"PLANK","As raízes que sustentam o banco foram moldadas ao longo de vários invernos.","bench"],
    ["CANOPY_NURSERY","Viveiro de Brotos",[130,174,77],"MOSS","Cada família cultiva seus brotos em uma mistura de casca e terra úmida.","nursery"],
    ["CANOPY_SAP_PRESS","Prensa de Seiva",[156,103,60],"CLAY","O fuso comprime pedaços de casca caída e conduz a seiva para um recipiente.","press"],
    ["CANOPY_CHIME","Sino de Sementes",[207,160,85],"stick","As vagens secas soam com o vento nas entradas da aldeia.","chime"],
    ["CANOPY_MEMORIAL","Memorial dos Anéis",[172,115,68],"WOOD","Os anéis entalhados registram secas, incêndios e a fundação do Conselho.","memorial"],
    ["CANOPY_LATTICE","Treliça de Raízes Vivas",[114,155,72],"CANOPY_ROOT","Os brotos se enroscam na treliça e deixam passar o ar e a luz.","lattice"],
    ["CANOPY_DRINKER","Bebedouro de Seiva",[158,108,59],"CANOPY_RESIN","A cuia de casca recolhe gotas de seiva para os moradores.","drinker"],
    ["CANOPY_SEED_RACK","Porta-Sementes da Copa",[175,145,80],"CANOPY_PLANK","As vagens ficam penduradas enquanto as sementes secam.","seeds"]
  ];
  const firstId=1210,firstTile=480;
  // Multi-voxel furniture and structural blocks. Existing public item IDs remain unchanged.
  const giants=new Map(),giantSegments=new Map();
  function giantParts(base,{x,y,z},heading=1){
    const unit=giants.get(base);if(!unit)return null;
    const parts=unit.variants[unit.bed?heading:1];
    return parts.map(p=>({x:x+p.x,y:y+p.y,z:z+p.z,id:p.id}));
  }
  function giantAt(read,{x,y,z,id},complete=false){
    const p=giantSegments.get(id);if(!p)return null;
    const cells=giantParts(p.unit.base,{x:x-p.x,y:y-p.y,z:z-p.z},p.heading);
    const matching=cells.filter(c=>read(c.x,c.y,c.z)===c.id);
    return complete&&matching.length!==cells.length?null:matching;
  }
  function registerGiants(B,defs){
    let next=2000;
    const units=pieces.map(([key,,,,,shape])=>({base:B[key],key,shape,w:shape?3:2,h:shape?3:2,d:shape?3:2,bed:false}));
    units.push({base:B.CANOPY_BED,key:"CANOPY_BED",w:4,h:4,d:8,bed:true});
    for(const unit of units){
      unit.variants={};giants.set(unit.base,unit);
      for(const heading of unit.bed?[0,1,2,3]:[1]){
        const cells=unit.variants[heading]=[],w=unit.bed&&heading%2===0?unit.d:unit.w,d=unit.bed&&heading%2===0?unit.w:unit.d;
        for(let y=0;y<unit.h;y++)for(let z=0;z<d;z++)for(let x=0;x<w;x++){
          const id=next++;if(defs[id])throw Error("ID gigante duplicado: "+id);
          const segment={id,unit,heading,x,y,z};cells.push(segment);giantSegments.set(id,segment);
          const original=defs[unit.base],bed=unit.bed?{...original.bed,head:!!(x||y||z),heading}:undefined;
          defs[id]={...original,hidden:true,giantPart:segment,bed,detail:undefined,
            partial:!!(unit.shape||unit.bed),solid:!unit.shape&&!unit.bed,collisionTop:undefined};
        }
      }
    }
  }
  // Clip each polygon to its own voxel: no oversized chunk bounds or phantom mesh hits.
  function splitFaces(faces,unit,heading,defs){
    const cells=unit.variants[heading],scale=unit.bed?4:3;
    const orient=([x,y,z])=>{
      if(!unit.bed)return [x*scale,y*scale,z*scale];
      const a=x*scale,b=z*scale;
      return heading===0?[b,y*scale,4-a]:heading===2?[8-b,y*scale,a]:heading===3?[4-a,y*scale,8-b]:[a,y*scale,b];
    };
    const normal=([x,y,z])=>!unit.bed?[x,y,z]:heading===0?[z,y,-x]:heading===2?[-z,y,x]:heading===3?[-x,y,-z]:[x,y,z];
    const transformed=faces.map(f=>({...f,vertices:f.vertices.map(orient),normal:normal(f.normal)}));
    function clip(poly,axis,limit,sign){
      const out=[];if(!poly.length)return out;
      for(let i=0;i<poly.length;i++){
        const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-limit)*sign,db=(b[axis]-limit)*sign;
        if(da>=-1e-7)out.push(a);
        if((da>1e-7&&db< -1e-7)||(da< -1e-7&&db>1e-7)){
          const t=da/(da-db);out.push(a.map((v,j)=>v+(b[j]-v)*t));
        }
      }
      return out;
    }
    const result=new Map();
    for(const cell of cells){
      const offset=[cell.x,cell.y,cell.z],out=[];
      for(const f of transformed){
        if(offset.some((v,i)=>Math.max(...f.vertices.map(p=>p[i]))<v-1e-7||Math.min(...f.vertices.map(p=>p[i]))>v+1+1e-7))continue;
        // A face exactly on an internal voxel boundary belongs to its solid side only.
        if(offset.some((v,i)=>f.vertices.every(p=>Math.abs(p[i]-v)<1e-7)&&f.normal[i]>.99||f.vertices.every(p=>Math.abs(p[i]-v-1)<1e-7)&&f.normal[i]<-.99))continue;
        let poly=f.vertices;
        for(let i=0;i<3&&poly.length>=3;i++){poly=clip(poly,i,offset[i],1);poly=clip(poly,i,offset[i]+1,-1);}
        if(poly.length<3)continue;
        const pts=poly.map(p=>p.map((v,i)=>Math.max(0,Math.min(1,v-offset[i]))));
        for(let i=1;i<pts.length-1;i++){
          const a=pts[0],b=pts[i],c=pts[i+1],u=b.map((v,j)=>v-a[j]),v=c.map((n,j)=>n-a[j]);
          if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])<1e-8)continue;
          out.push({...f,vertices:[a,b,c,c]});
        }
      }
      // Solid collision is limited to geometry-bearing voxels, rather than the whole bounding box.
      const def=defs[cell.id];def.solid=out.length>0;
      if(def.solid)def.collisionTop=Math.min(1,Math.max(.12,...out.flatMap(f=>f.vertices.map(p=>p[1]))));
      result.set(cell.id,out);
    }
    return result;
  }
  const tileAt=index=>index<12?firstTile+index:475+index-12;
  const actors=[
    ["living_tree_elder",0,-16], ["living_tree_sapling",-5,-12], ["living_tree_amber",14,7],
    ["living_tree_bloom",-13,8], ["living_tree_warden",7,1], ["living_tree_fig",-16,-13],
    ["living_tree",-6,4], ["living_tree_pine",18,-12], ["living_tree_cherry",6,15],
    ["living_tree_willow",-16,2], ["living_tree_mangrove",17,18], ["living_tree_sapling",-6,20],
    ["living_tree_bloom",9,18], ["living_tree_warden",-4,25]
  ];
  const place={id:"aldeia_das_copas",name:"Aldeia das Copas",order,width:27,depth:20,height:25,
    aliases:["arvorosos","conselho_dos_arvorosos","aldeia_arvorosa","copas"],biomes,actors};
  const loot=[[-3,-3],[-18,-10],[17,8],[0,21],[-22,11],[18,-9]];

  function register(B,defs){
    for(const [i,[key,label,color,,story,shape,range]] of pieces.entries()){
      const id=firstId+i,tile=tileAt(i);
      B[key]=id;
      const icon="#"+color.map(c=>c.toString(16).padStart(2,"0")).join("");
      defs[id]={name:label,solid:!shape||shape==="lattice",partial:!!shape,tex:tile,icon,hard:shape?.65:1.18,
        factionBuilding:{group:order,story,curiosity:range?"O lampião ilumina as trilhas sem precisar de chama.":null}};
      if(shape)defs[id].factionDecor={model:"grove",shape,tile,range};
    }
    defs[B.CANOPY_BED].factionBuilding={group:order,story:"Os tecelões da aldeia tingem a lã com folhas e montam a armação com casca de sequoia.",curiosity:"Durante o sono, a cama registra o local de retorno do viajante."};
    registerGiants(B,defs);
  }
  function paint(tile,x,y,hash){
    const index=tile-firstTile;
    const shadeColor=color(tile);
    if(!shadeColor)return null;
    const wave=Math.sin(x*.54+Math.sin(y*.27)*1.3),fine=(hash(x,y,tile)-.5)*20;
    const shade=index===0?wave*27+Math.sin(x*1.91)*10:index===1?(y%8<1?-40:Math.sin(x*.31+y*.7)*13):
      index===2?Math.sin(x*.59-y*.46)*19+Math.sin(x*.59+y*.46)*14:index===3?(Math.abs(x%8-4)+y%7<4?25:-13):
      index===4?((x%8-4)**2+(y%8-4)**2<7?22:-15):index===5?Math.sin(x*.19+y*.23+wave)*21:wave*12;
    return [...shadeColor.map(c=>c+shade+fine),255];
  }
  const color=tile=>tile===478?[78,123,59]:pieces[tile>=475&&tile<=477?tile-475+12:tile-firstTile]?.[2];
  function recipes(B){
    return pieces.map(([key,name,,material,,,range],i)=>({name,desc:i<6?"Material de construção das Copas":"Decoração da Aldeia das Copas",
      need:i<6?[[B[material]??(material==="HONEYCOMB"?"honey":material),4],[B.MOSS,2]]:
        [[B.CANOPY_PLANK,1],[B[material]??material,range?3:2]],out:[B[key],i<6?1:1]}));
  }
  function decorate({box,shell,rod},{shape,tile}){
    const bark=480,root=482,amber=485;
    const pillar=(x,z)=>box(root,x-.06,0,z-.06,x+.06,.72,z+.06);
    const bud=(material,x,y,z,rx,ry,rz)=>shell([
      [x,y-ry,z,rx*.44,rz*.44],[x,y,z,rx,rz],[x,y+ry,z,rx*.43,rz*.43]
    ],material,material,8,Math.PI/8);
    if(shape==="lantern"){
      box(bark,.22,0,.22,.78,.13,.78);box(bark,.39,.13,.39,.61,.82,.61);
      bud(tile,.5,.57,.5,.25,.22,.25);box(root,.31,.79,.31,.69,.91,.69);
    }else if(shape==="bench"){
      for(const x of [.14,.86]){box(root,x-.07,0,.22,x+.07,.43,.79);box(bark,x-.07,.38,.72,x+.07,.85,.87)}
      box(tile,.06,.38,.22,.94,.51,.79);box(bark,.08,.64,.72,.92,.76,.86);
    }else if(shape==="nursery"){
      box(bark,.12,0,.13,.88,.19,.86);
      for(const x of [.18,.82])box(root,x-.05,.14,.12,x+.05,.29,.89);
      for(const [x,z,h] of [[.29,.29,.57],[.67,.43,.74],[.39,.72,.67]]){
        rod([x,.19,z],[x+.05,h,z],.035,root);
        bud(tile,x+.1,h-.07,z,.19,.09,.11);
      }
    }else if(shape==="press"){
      box(bark,.09,0,.14,.91,.13,.87);for(const x of [.18,.82])pillar(x,.5);
      box(root,.11,.68,.38,.89,.80,.62);box(tile,.41,.29,.42,.59,.91,.58);
      box(bark,.28,.28,.28,.72,.41,.73);box(amber,.29,.14,.27,.71,.26,.74);
    }else if(shape==="chime"){
      box(bark,.23,0,.29,.77,.13,.71);box(root,.16,.13,.47,.23,.93,.54);
      box(bark,.15,.84,.43,.86,.94,.58);
      for(const [x,h] of [[.34,.51],[.55,.4],[.75,.55]]){
        rod([x,.86,.5],[x,h,.5],.013,root);bud(tile,x,h,.5,.078,.16,.073);
      }
    }else if(shape==="lattice"){
      const lattice=z=>{
        for(const t of [.085,.5,.915]){
          box(root,t-.045,0,z-.026,t+.045,1,z+.026);
          box(root,0,t-.046,z-.026,1,t+.046,z+.026);
        }
        rod([.10,.10,z],[.90,.90,z],.046,tile);
        rod([.10,.90,z],[.90,.10,z],.046,tile);
      };
      // Casas podem ser giradas na geração, mantendo a treliça legível dos dois eixos.
      lattice(.5);
      for(const t of [.085,.5,.915]){
        box(root,.474,0,t-.045,.526,1,t+.045);
        box(root,.474,t-.046,0,.526,t+.046,1);
      }
      rod([.5,.10,.10],[.5,.90,.90],.046,tile);
      rod([.5,.90,.10],[.5,.10,.90],.046,tile);
    }else if(shape==="drinker"){
      box(bark,.21,0,.21,.79,.14,.79);
      shell([[.5,.08,.5,.16,.16],[.5,.29,.5,.29,.29],[.5,.41,.5,.37,.37]],tile,root,10,0);
      bud(amber,.5,.41,.5,.27,.058,.27);
    }else if(shape==="seeds"){
      for(const x of [.16,.84])pillar(x,.5);
      box(bark,.105,.71,.42,.895,.82,.58);
      for(const [x,h] of [[.27,.47],[.48,.38],[.69,.53]]){
        rod([x,.73,.49],[x,h,.49],.016,root);bud(tile,x,h,.49,.08,.12,.065);
      }
    }else{
      box(root,.14,0,.22,.86,.15,.78);bud(bark,.5,.55,.53,.34,.40,.18);
      for(const [x,y,r] of [[.5,.53,.25],[.5,.53,.17],[.48,.55,.095]])
        for(let i=0;i<10;i++){
          const a=i*Math.PI/5,b=(i+1)*Math.PI/5;
          rod([x+Math.cos(a)*r,y+Math.sin(a)*r,.348],[x+Math.cos(b)*r,y+Math.sin(b)*r,.348],.019,tile);
        }
    }
  }
  function lights(B){
    const lamp={color:0xe2ef92,range:12,height:.62,steady:true};
    const center=giants.get(B.CANOPY_LANTERN)?.variants[1].find(p=>p.x===1&&p.y===1&&p.z===1);
    return [[B.CANOPY_LANTERN,lamp],...(center?[[center.id,{...lamp,range:15}]]:[])];
  }

  function build(B,site,project,platform,box){
    const {y}=site,routines=QuimiCraftFactionRoutines;
    const set=(u,h,v,id)=>box(u,h,v,u,h,v,id);
    function giant(u,h,v,id){
      const unit=giants.get(id);if(!unit)return set(u,h,v,id);
      const corners=[[u,v],[u+unit.w-1,v],[u,v+unit.d-1],[u+unit.w-1,v+unit.d-1]].map(([a,b])=>project(site,a,b));
      const x=Math.min(...corners.map(p=>p[0])),z=Math.min(...corners.map(p=>p[1]));
      const [ox,oz]=project(site,0,0),[ax,az]=project(site,1,0),[bx,bz]=project(site,0,1);
      const heading=[1,0,3,2][site.turn];
      for(const part of giantParts(id,{x,y:h,z},heading)){
        const dx=part.x-ox,dz=part.z-oz,lu=dx*(ax-ox)+dz*(az-oz),lv=dx*(bx-ox)+dz*(bz-oz);
        set(lu,part.y,lv,part.id);
      }
    }
    for(let v=-28;v<=29;v++)for(let u=-28;u<=28;u++){
      if(Math.abs(u)+Math.abs(v)>49)continue;
      const road=Math.abs(u)<=2||Math.abs(v)<=2||Math.abs(Math.abs(u)-15)<2||Math.abs(v-16)<2;
      platform(u,v,y,road?B.CANOPY_PATH:B.MOSS);
    }
    function lodge(u,v,w,d,h,kind,featured=false){
      box(u-w,0,v-d,u+w,0,v+d,B.CANOPY_PLANK);
      box(u-w,1,v-d,u+w,h-1,v+d,B.CANOPY_BARK);
      box(u-w+1,1,v-d+1,u+w-1,h-1,v+d-1,B.AIR);
      box(u-3,1,v+d,u+3,h-2,v+d,B.AIR);
      for(const du of [-w,w])for(const dv of [-d,d])box(u+du+(du<0?-1:0),1,v+dv+(dv<0?-1:0),u+du+(du>0?1:0),h+2,v+dv+(dv>0?1:0),B.CANOPY_ROOT);
      for(const du of [-w,w])for(const dv of [-2,2]){
        giant(u+du+(du>0?-2:0),7,v+dv-1,B.CANOPY_LATTICE);
        set(u+du,3,v+dv,B.CANOPY_RESIN);
      }
      for(let level=0;level<4;level++){
        const overhang=level===0?1:-level+1;
        box(u-w-overhang,h+level,v-d-overhang,u+w+overhang,h+level,v+d+overhang,B.CANOPY_SHINGLE);
      }
      // Full-size lodges: 4 x 8 beds, three-block ornaments, clear central corridors.
      if(kind==="quarters"){
        giant(u-w+1,1,v-d+1,B.CANOPY_BED);
        giant(u+w-4,1,v-d+1,B.CANOPY_BED);
      }else if(kind==="workshop"){
        giant(u-w+1,1,v-d+1,B.CANOPY_SAP_PRESS);
        giant(u+w-4,1,v-d+1,B.CANOPY_NURSERY);
        giant(u-w+1,1,v+d-3,B.CANOPY_SEED_RACK);
        giant(u+w-4,1,v+d-3,B.CANOPY_DRINKER);
      }else{
        box(u-3,0,v-3,u+3,0,v+1,B.CANOPY_RESIN);
        giant(u-7,1,v-4,B.CANOPY_MEMORIAL);
        giant(u+5,1,v-4,B.CANOPY_MEMORIAL);
        giant(u-7,1,v+2,B.CANOPY_BENCH);
        giant(u+5,1,v+2,B.CANOPY_BENCH);
      }
      // Roof-hung fixtures use a three-voxel lamp, not a human-sized lantern.
      giant(u-1,h-4,v-d+1,B.CANOPY_LANTERN);
      if(featured){
        const slots=kind==="hall"?[[-3,1],[3,1],[-3,3],[3,3],[0,3]]:[[-1,-2],[1,0],[0,2],[-1,3],[1,3]];
        const focus=kind==="workshop"?[u-2,v-2]:null;
        routines.addRoom(site,project,kind,0,y+1,slots.map(([a,b])=>[u+a,v+b]),focus,[u,v+d+1]);
      }
    }
    lodge(0,-15,9,6,13,"hall",true);
    lodge(-17,7,7,5,12,"quarters",true);
    lodge(17,7,7,5,12,"workshop",true);
    lodge(-18,-13,7,5,12,"quarters");
    lodge(18,-13,7,5,12,"quarters");
    lodge(0,19,7,5,11,"quarters");
    const [crossingX,crossingZ]=project(site,0,7);
    site.routineJunction={x:crossingX+.5,y:y+1,z:crossingZ+.5};
    for(const x of [-9,9]){
      box(x-2,0,6,x+2,0,11,B.CANOPY_PLANK);
      giant(x-1,1,7,B.CANOPY_NURSERY);
      for(const v of [-5,4,14,25]){
        box(x,1,v,x+1,3,v+1,B.CANOPY_ROOT);giant(x-1,4,v-1,B.CANOPY_LANTERN);
      }
    }
    giant(-5,1,12,B.CANOPY_CHIME);giant(3,1,12,B.CANOPY_CHIME);
    box(-1,1,-3,1,16,-1,B.CANOPY_BARK);
    for(let h=11;h<=18;h++){
      const radius=h<15?7:20-h;
      for(let u=-radius;u<=radius;u++)for(let v=-radius;v<=radius;v++){
        if(Math.hypot(u,v)<radius+.3&&(h>15||Math.abs(u)+Math.abs(v)>2))set(u,h,v-2,B.CANOPY_SHINGLE);
      }
    }
    for(const [u,v] of [[-5,-5],[5,-5],[-5,2],[5,2]]){
      giant(u-1,1,v-1,B.CANOPY_BENCH);
    }
  }
  return {order,name,reach,biomes,place,actors,loot,register,paint,color,recipes,decorate,lights,build,giants,giantSegments,giantParts,giantAt,splitFaces};
})();
