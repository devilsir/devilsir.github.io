
"use strict";

globalThis.QuimiCraftSettlements=(()=>{
  const CELL=920,shops=["food","armor","solid","liquid","trinket"];
  const roles=["farmer","miner","botanist","glazier","ceramist","teacher","baker","fisher","geologist","weaver","cook","smith","gardener"];
  const first=["Alba","Bento","Cora","Dália","Érico","Gael","Iara","Jaci","Lina","Mara","Nara","Noé","Ravi","Téo","Zuri"];
  const youngNames=["Nina","Luan","Bia","Caíque","Yasmin","Tainá","Davi","Nalu","Joana","Rael"];
  const endings={field:"dos Campos",forest:"do Bosque",coast:"das Marés",dry:"da Chapada",snow:"da Serra",volcanic:"da Caldeira"};
  const skins=[0x704431,0xb37451,0xe2a47e,0x9c634b,0xce936a,0x5f3d30];
  const hair=[0x201c1a,0x49322a,0x734628,0x34333d,0xb38245,0xb0a3a0];

  const civicPlans={
    orchard:{name:"Estufa comunitária",role:"seed_curator",footprint:[4,3],rise:3,style:"glass",props:["SEED_BENCH","GARDEN_BOX"],plant:"LAVENDER"},
    quay:{name:"Entreposto das águas",role:"water_keeper",footprint:[4,3],rise:3,style:"open",props:["FISH_RACK","ASSAY_BENCH"],plant:"SALT_REED"},
    cistern:{name:"Casa da cisterna",role:"water_keeper",footprint:[3,3],rise:3,style:"closed",props:["ASSAY_BENCH","CERAMIC"],plant:"SALT_REED"},
    lookout:{name:"Mirante meteorológico",role:"cartographer",footprint:[3,2],rise:5,style:"tower",props:["ASSAY_BENCH","GARDEN_BOX"],plant:"FERN"},
    kiln:{name:"Pavilhão dos metais",role:"metalsmith",footprint:[4,3],rise:4,style:"closed",props:["METAL_FORGE","GLASS_KILN"],plant:"LICHEN"},
    market:{name:"Mercado de feira",role:"herbal_trader",footprint:[4,2],rise:3,style:"open",props:["SEED_BENCH","KITCHEN_STOVE"],plant:"BERRY_BUSH"}
  };
  const civicByCulture={
    field:["market","orchard"],forest:["orchard","lookout"],coast:["quay","orchard"],
    dry:["cistern","market"],snow:["lookout","orchard"],volcanic:["kiln","cistern"]
  };
  function civicDistrict({B,site,culture,theme,floor,road,structure,doors,buildings,people,roll,cell,paving,region,choose,add}){
    const {x,z,base}=site,civic=[];
    const borderX=site.main?32:24,borderZ=site.main?27:21;
    const taken=new Set([...floor.keys()]);
    for(const key of structure.keys()){
      const [u,,v]=key.split("|");
      taken.add(cell(u,v));
    }
    const bounds=(u,v)=>Math.abs(u-x)<=borderX&&Math.abs(v-z)<=borderZ;
    const regionPlans=civicByCulture[culture]||civicByCulture.field;
    const order=site.main?regionPlans:[regionPlans[roll(x,z,413)>.76?1:0]];
    const slots=[];
    for(const side of [-1,1])for(const u of [-17,-9,0,9,17]){
      slots.push({u,v:side*(borderZ-3),side,seeded:roll(x+u,z+side,410)});
    }
    slots.sort((a,b)=>a.seeded-b.seeded);
    function link(startX,startZ,lot){
      const start=cell(startX,startZ),queue=[[startX,startZ]],parents=new Map([[start,null]]);
      for(let head=0;head<queue.length;head++){
        const [u,v]=queue[head],key=cell(u,v);
        if(road.has(key)&&!structure.has(u+"|"+(road.get(key)+1)+"|"+v)){
          const points=[];
          for(let at=key;at!==null;at=parents.get(at))points.push(at.split(",").map(Number));
          return {points,y:road.get(key)};
        }
        for(const [dx,dz] of [[0,-lot.side],[-1,0],[1,0],[0,lot.side]]){
          const a=u+dx,b=v+dz,id=cell(a,b);
          if(!bounds(a,b)||parents.has(id)||Math.abs(a-lot.x)<=lot.width&&Math.abs(b-lot.z)<=lot.depth)continue;
          if(taken.has(id)&&!road.has(id))continue;
          parents.set(id,key);
          queue.push([a,b]);
        }
      }
      return null;
    }
    for(const kind of order){
      const plan=civicPlans[kind],[width,depth]=plan.footprint;
      let lot=null,route=null;
      for(const {u,v,side} of slots){
        const hx=x+u,hz=z+v;
        let free=true;
        for(let du=-width-1;du<=width+1&&free;du++)for(let dv=-depth;dv<=depth;dv++){
          if(!bounds(hx+du,hz+dv)||taken.has(cell(hx+du,hz+dv))){free=false;break;}
        }
        if(!free)continue;
        const doorZ=hz-side*depth,frontZ=doorZ-side;
        if(taken.has(cell(hx,frontZ)))continue;
        const plot={kind:"civic",civic:kind,title:plan.name,role:plan.role,x:hx,z:hz,width,depth,side,doorX:hx,doorZ,frontX:hx+.5,frontZ:frontZ+.5};
        const path=link(hx,frontZ,plot);
        if(path){lot={...plot,y:path.y};route=path;break;}
      }
      if(!lot)continue;
      const {x:hx,z:hz,y,side,doorX,doorZ}=lot;
      for(const [u,v] of route.points){
        const id=cell(u,v);
        if(!road.has(id))paving(u,v,y);
        taken.add(id);
      }
      const marker=B.CIVIC_MARKER??B.VILLAGE_BRICK;
      const mosaic=B.CIVIC_STONE??B.FIELDSTONE;
      const timber=B[theme.wood]??B.PLANK;
      const plaster=B[choose(theme.wall,roll(hx,hz,419))]??B.FIELDSTONE;
      const roof=B[choose(theme.roof,roll(hx,hz,420))]??B.PLANK;
      for(let du=-width;du<=width;du++)for(let dv=-depth;dv<=depth;dv++){
        const u=hx+du,v=hz+dv,edge=Math.abs(du)===width||Math.abs(dv)===depth;
        const key=cell(u,v),corners=Math.abs(du)===width&&Math.abs(dv)===depth;
        taken.add(key);
        floor.set(key,{y,id:edge?B.FIELDSTONE:plan.style==="open"?timber:mosaic});
        const front=v===doorZ;
        for(let dy=1;dy<=plan.rise&&edge;dy++){
          const door=u===doorX&&front&&dy<=2;
          if(door||plan.style==="open"&&!corners&&dv!==side*depth)continue;
          const pane=dy>=2&&dy<plan.rise&&!corners&&(plan.style==="glass"||du%2===0&&dv%2===0);
          add(u,y+dy,v,corners?timber:pane?B.WINDOW_LEADED:dy===1?plaster:timber);
        }
        const cap=plan.style==="glass"&&Math.abs(du)<width?B.GLASS_AMBER:roof;
        add(u,y+plan.rise+1,v,cap);
        if(plan.style==="tower"&&Math.max(Math.abs(du),Math.abs(dv))<=1)add(u,y+plan.rise+2,v,roof);
      }
      for(let half=0;half<2;half++){
        add(doorX,y+1+half,doorZ,B.DOOR);
        doors.set(doorX+"|"+(y+1+half)+"|"+doorZ,{axis:0,half,hinge:side,swing:side,style:"civic"});
      }
      add(doorX,y+3,doorZ,marker);
      add(hx-1,y+2,doorZ-side,B.VILLAGE_LANTERN);
      add(hx+1,y+2,doorZ-side,B.VILLAGE_LANTERN);
      taken.add(cell(hx-1,doorZ-side));
      taken.add(cell(hx+1,doorZ-side));
      for(let i=0;i<plan.props.length;i++)add(hx+(i?1:-1)*(width-1),y+1,hz+side*(depth-1),B[plan.props[i]]);
      if(plan.props.includes("GARDEN_BOX"))add(hx+width-1,y+2,hz+side*(depth-1),B[plan.plant]);
      if(kind==="cistern"&&B.WATER!==undefined){
        add(hx,y+1,hz+side,B.WATER);
        for(const [du,dv] of [[-1,0],[1,0],[0,-1],[0,1]])add(hx+du,y+1,hz+side+dv,B.FIELDSTONE);
      }
      if(kind==="orchard")for(const du of [-width+1,width-1]){
        add(hx+du,y+1,hz,B.GARDEN_BOX);
        add(hx+du,y+2,hz,du>0?B.LAVENDER:B.WILD_WHEAT);
      }
      civic.push(lot);
      buildings.push(lot);
      const {frontX,frontZ}=lot,name=choose(civicNames[kind],roll(hx,hz,423));
      people.push({site:site.id,id:site.id+":oficio:"+kind,role:plan.role,name:titlePerson(name,kind),region,culture,
        x:frontX,y:y+1,z:frontZ,civic:kind,title:plan.name,scale:.95+roll(hx,hz,431)*.18,skin:choose(skins,roll(hx,hz,432)),
        hair:choose(hair,roll(hx,hz,433)),trim:theme.trim,tint:theme.tint,variant:Math.floor(roll(hx,hz,434)*4)});
    }
    return civic;
  }
  const civicNames={
    orchard:["Cássia","Nuri","Estela"],quay:["Jurema","Bia","Iná"],cistern:["Ciro","Tainá","Miro"],
    lookout:["Ícaro","Alva","Céu"],kiln:["Raul","Luzia","Samir"],market:["Olívia","Luan","Zefa"]
  };
  const titles={orchard:"das Sementes",quay:"do Cais",cistern:"da Cisterna",lookout:"do Mirante",kiln:"da Forja",market:"da Feira"};
  const titlePerson=(name,kind)=>name+" "+titles[kind];


  function create({B,seed,hub,biome,hash}){
    const districts=new Map(),descriptors=new Map();
    const center={...hub,id:"central",main:true};
    const k=(x,z)=>x+","+z;
    const roll=(x,z,salt)=>hash(x+seed%997,z-seed%767,salt);
    function describe(ix,iz){
      const id=k(ix,iz);
      if(descriptors.has(id))return descriptors.get(id);
      if(descriptors.size>300)descriptors.clear();
      const x=Math.floor((ix+.35+roll(ix,iz,89)*.3)*CELL);
      const z=Math.floor((iz+.35+roll(ix,iz,90)*.3)*CELL);
      const omitted=Math.max(Math.abs(x),Math.abs(z))<480||roll(ix,iz,91)<.23;
      const site=omitted?null:{id,x,z,base:18+Math.floor(roll(ix,iz,92)*6),main:false};
      descriptors.set(id,site);
      return site;
    }
    function contains(site,x,z,pad=0){
      const width=site.main?32:24,depth=site.main?27:21;
      return Math.abs(x-site.x)<=width+pad&&Math.abs(z-site.z)<=depth+pad;
    }
    function getSite(x,z,pad=0){
      if(hub.version===3&&contains(center,x,z,pad))return main();
      const descriptor=describe(Math.floor(x/CELL),Math.floor(z/CELL));
      return descriptor&&contains(descriptor,x,z,pad)?build(descriptor):null;
    }
    function main(){return hub.version===3?build(center):null}
    function line(a,b,stroke){
      const dx=b.x-a.x,dz=b.z-a.z,steps=Math.max(Math.abs(dx),Math.abs(dz),1);
      for(let i=0;i<=steps;i++)stroke(Math.round(a.x+dx*i/steps),Math.round(a.z+dz*i/steps),Math.round(a.y+(b.y-a.y)*i/steps));
    }
    function build(site){
      if(districts.has(site.id))return districts.get(site.id);
      if(districts.size>96)districts.clear();
      const {x,z,base}=site;
      const region=biome(x,z),culture=QuimiCraftRegions.culture(region),theme=QuimiCraftRegions.skins[culture];
      const road=new Map(),floor=new Map(),structure=new Map(),doors=new Map(),buildings=[],people=[];
      const cell=(x,z)=>k(x,z);
      const choose=(list,n)=>list[Math.floor(n*list.length)];
      const hill=(u,v)=>base+Math.round(Math.sin(u*.17+roll(x,z,2)*5)*.8+Math.sin(v*.19)*1.15);
      const bend=roll(x,z,3)>.5?1:-1;
      const spine=u=>Math.round(Math.sin((u+27)*.14)*2.35*bend+Math.max(0,u-15)*bend*.17);
      const paving=(a,b,y)=>{
        const key=cell(a,b),draw=roll(a,b,301);
        road.set(key,y);
        floor.set(key,{y,id:draw<.25?B.FIELDSTONE:draw>.81?B.VILLAGE_BRICK:B.COBBLE_PATH});
      };
      const path=(a,b,wide)=>line(a,b,(u,v,y)=>{
        paving(u,v,y);
        if(wide){paving(u,v-1,y);paving(u,v+1,y)}
      });
      const left=site.main?-27:-19,right=site.main?27:19;
      for(let u=left;u<right;u++){
        const a={x:x+u,z:z+spine(u),y:u<=left+2?base:hill(u,0)};
        const b={x:x+u+1,z:z+spine(u+1),y:hill(u+1,0)};
        path(a,b,true);
      }
      for(let du=-3;du<=3;du++)for(let dv=-2;dv<=3;dv++){
        if(Math.abs(du)+Math.abs(dv)<6)paving(x+du,z+spine(0)+dv,base);
      }
      const add=(u,y,v,id)=>structure.set(u+"|"+y+"|"+v,id);
      const lots=site.main?[-22,-11,0,11,22]:[-14,-4,6,16];
      const roster=site.main?[...shops]:shops.filter((_,i)=>i===0||i===1&&roll(x,z,48)>.45);
      const size=lots.length*2;
      const skip=site.main?Math.floor(roll(x,z,51)*3):1+Math.floor(roll(x,z,51)*3);
      const order=Array.from({length:size},(_,i)=>i).sort((a,b)=>roll(x+a,z,95)-roll(x+b,z,95));
      const names=[...first].sort((a,b)=>roll(x+first.indexOf(a),z,191)-roll(x+first.indexOf(b),z,191));
      const unused=new Set(order.slice(roster.length+2,roster.length+2+skip));
      for(let i=0;i<size;i++){
        if(unused.has(i))continue;
        const u=lots[i>>1],side=i%2===0?-1:1;
        const width=2+Math.floor(roll(x+i,z,10)*3),depth=2+Math.floor(roll(x,z+i,11)*2);
        const hx=x+u,hz=z+spine(u)+side*(depth+5+Math.floor(roll(x+i,z,12)*2));
        const level=hill(u,hz-z),rise=3+Math.floor(roll(x+i,z,13)*2);
        const variant=Math.floor(roll(x,z+i,14)*4),shopIndex=order.indexOf(i),shop=roster[shopIndex];
        const doorZ=hz-side*depth,doorX=hx+(variant===2?1:0);
        const wood=B[theme.wood],wall=B[choose(theme.wall,roll(x+i,z,15))],roof=B[choose(theme.roof,roll(x,z+i,16))];
        const frontX=doorX+.5,frontZ=doorZ-side*2+.5;
        path({x:doorX,z:doorZ-side,y:level},{x:doorX,z:z+spine(doorX-x),y:hill(doorX-x,0)},false);
        const habitat={site:site.id,region,culture};
        const building={x:hx,z:hz,y:level,width,depth,side,doorX,doorZ,frontX,frontZ,variant,shop,kind:shop?"shop":"house"};
        buildings.push(building);
        for(let dx=-width-1;dx<=width+1;dx++)for(let dz=-depth-1;dz<=depth+1;dz++){
          const a=hx+dx,b=hz+dz;
          const footprint=Math.abs(dx)<=width&&Math.abs(dz)<=depth;
          const nearDoor=a===doorX&&b===doorZ-side;
          if(footprint)floor.set(cell(a,b),{y:level,id:shop?B.FIELDSTONE:wood});
          if(nearDoor)floor.set(cell(a,b),{y:level,id:B.FIELDSTONE});
          const wallEdge=Math.abs(dx)===width||Math.abs(dz)===depth;
          if(footprint&&wallEdge){
            for(let dy=1;dy<=rise;dy++){
              if(a===doorX&&b===doorZ&&dy<=2)continue;
              const corner=Math.abs(dx)===width&&Math.abs(dz)===depth;
              const window=dy===2&&!corner&&((Math.abs(dx)===width&&dz===0)||(Math.abs(dz)===depth&&Math.abs(dx)===width-1));
              add(a,level+dy,b,corner||dy===rise?wood:window?B.WINDOW_LEADED:dy===1&&variant===1?B.FIELDSTONE:wall);
            }
          }
          const slope=variant===0||variant===2?depth+1-Math.abs(dz):width+1-Math.abs(dx);
          const above=variant===3?0:variant===1?Math.floor(slope*.5):slope;
          add(a,level+rise+1+above,b,roof);
          if(footprint&&wallEdge&&above>0){
            for(let extra=1;extra<=above;extra++)add(a,level+rise+extra,b,extra===above&&extra>1?wood:wall);
          }
        }
        for(let half=0;half<2;half++){
          const y=level+1+half;
          add(doorX,y,doorZ,B.DOOR);
          doors.set(doorX+"|"+y+"|"+doorZ,{axis:0,half,hinge:variant%2?1:-1,swing:side,style:"village"});
        }
        if(shop){
          const station={food:B.KITCHEN_STOVE,armor:B.METAL_FORGE,solid:B.ASSAY_BENCH,liquid:B.GLASS_KILN,trinket:B.SEED_BENCH}[shop];
          add(hx+width-1,level+1,hz+side*(depth-1),station);
          for(let j=-1;j<=1;j++)add(doorX+j,level+rise,doorZ-side,B.WOVEN_AWNING);
        }else if(variant%2===0){
          add(hx-width-1,level+1,doorZ,B.GARDEN_BOX);
          add(hx-width-1,level+2,doorZ,culture==="dry"?B.SALT_REED:B.LAVENDER);
          add(hx+width+1,level+1,hz,B.FENCE_WOOD);
        }else{
          add(hx-width+1,level+1,hz+side*(depth-1),B.CERAMIC);
          add(hx+width-1,level+1,hz+side*(depth-1),culture==="coast"?B.FISH_RACK:B.SEED_BENCH);
        }
        add(doorX+1,level+2,doorZ-side,B.VILLAGE_LANTERN);
        const role=shop?"shop_"+shop:roles[(i+Math.floor(roll(x,z,103)*roles.length))%roles.length];
        people.push({...habitat,id:site.id+":"+i,role,x:frontX,z:frontZ,
          name:names[i]+" "+endings[culture],scale:.83+roll(x,z+i,104)*.27,skin:choose(skins,roll(x-i,z,105)),
          hair:choose(hair,roll(x,z-i,106)),trim:theme.trim,tint:theme.tint,variant:Math.floor(roll(x+i,z,107)*4)});
      }
      const props=[[-3,-3],[3,-3],[-3,3],[3,3]];
      for(const [du,dv] of props){
        const a=x+du,b=z+spine(0)+dv;
        floor.set(cell(a,b),{y:base,id:B.FIELDSTONE});
        add(a,base+1,b,B.FENCE_WOOD);
        add(a,base+2,b,B.VILLAGE_LANTERN);
      }
      const homes=buildings.filter(b=>b.kind==="house").sort((a,b)=>roll(a.x,a.z,691)-roll(b.x,b.z,691));
      for(const [i,house] of homes.slice(0,site.main?2:1).entries()){
        people.push({site:site.id,region,culture,id:site.id+":villager:"+i,role:"villager",
          name:(i===0?"Salomé":"Tomás")+" "+endings[culture],
          x:house.frontX+1.32,z:house.frontZ-house.side*.86,skin:choose(skins,roll(x+i,z,682)),
          hair:choose(hair,roll(x,z+i,683)),trim:theme.trim,tint:theme.tint,title:"Morador da vila"});
      }
      const childCount=homes.length?(site.main?8:4+Math.floor(roll(x,z,692)*2)):0;
      const offset=Math.floor(roll(x,z,693)*youngNames.length);
      for(let i=0;i<childCount;i++){
        const house=homes[i%homes.length];
        const childX=house.frontX+(i>=homes.length?.78:0),childZ=house.frontZ-house.side*1.06;
        const deck=floor.get(cell(Math.floor(childX),Math.floor(childZ)));
        const playZ=z+spine(0)+(i%2===0?-1:1),playX=x+i%4-2;
        const playDeck=floor.get(cell(playX,playZ));
        const play=i<3&&playDeck?{x:playX+.5,y:playDeck.y+1,z:playZ+.5}:null;
        people.push({site:site.id,region,culture,id:site.id+":child:"+i,role:"child",age:"child",
          name:youngNames[(i+offset)%youngNames.length]+" "+endings[culture],
          x:childX,z:childZ,y:deck?deck.y+1:undefined,play,interest:["insects","orchard","stones","water"][i%4],
          scale:.57+roll(x+i,z,694)*.13,skin:choose(skins,roll(x+i,z,695)),
          hair:choose(hair.slice(0,-1),roll(x,z-i,696)),trim:theme.trim,tint:theme.tint,
          variant:Math.floor(roll(x+i,z,697)*4),title:"Criança da comunidade"});
      }
      const civic=civicDistrict({B,site,culture,theme,floor,road,structure,doors,buildings,people,roll,cell,paving,region,choose,add});
      if(site.main){
        const master=QuimiCraftExtermination.master,px=x+1,pz=z+spine(0)+2;
        people.push({...master,id:site.id+":"+master.role,site:site.id,region,culture,x:px+.5,z:pz+.5,scale:1,
          y:floor.get(cell(px,pz)).y+1});
      }
      const district={...site,region,culture,buildings,people,doors,floor,road,structure,civic};
      districts.set(site.id,district);
      return district;
    }
    function blockAt(x,y,z){
      if(y<15||y>40)return B.AIR;
      const site=getSite(x,z);
      if(!site)return B.AIR;
      const explicit=site.structure.get(x+"|"+y+"|"+z);
      if(explicit!==undefined)return explicit;
      const floor=site.floor.get(k(x,z));
      return floor&&y===floor.y?floor.id:B.AIR;
    }
    function doorAt(x,y,z){return getSite(x,z)?.doors.get(x+"|"+y+"|"+z)}
    function surface(x,z,original){
      const site=getSite(x,z,4);
      if(!site)return original;
      const foundation=site.floor.get(k(x,z));
      if(foundation)return foundation.y;
      const dx=Math.abs(x-site.x),dz=Math.abs(z-site.z),edge=Math.max(dx/(site.main?32:24),dz/(site.main?27:21));
      const grade=Math.min(.82,Math.max(0,(1.10-edge)*2.65));
      const relief=Math.max(-2,Math.min(3,(original-site.base)*.19));
      return Math.round(original+(site.base+relief-original)*grade);
    }
    function occupied(x,z,pad=1){
      const site=getSite(x,z,pad);
      if(!site)return false;
      for(let dx=-pad;dx<=pad;dx++)for(let dz=-pad;dz<=pad;dz++){
        if(site.floor.has(k(x+dx,z+dz)))return true;
      }
      return false;
    }
    return {main,near:getSite,contains,blockAt,doorAt,surface,occupied};
  }
  return {create};
})();
