"use strict";

globalThis.QuimiCraftAlchemyWorld = (() => {
  const CELL=176, FIRST_BLOCK=210;
  const furniture=[
    ["ALCHEMY_BORDER","Tijolo da guilda","#4c7573"],
    ["ALCHEMY_SIGN","Brasão alquímico","#d2ba7b"],
    ["ALCHEMY_SAMPLE","Posto de coleta","#76999f"],
    ["ALCHEMY_BENCH","Bancada de poções","#80679b"],
    ["ALCHEMY_VIAL_RACK","Estante de frascos","#a3639a"],
    ["ALCHEMY_BALANCE","Balança de laboratório","#c29e64"],
    ["ALCHEMY_FILTER","Filtro de bancada","#5daba6"],
    ["ALCHEMY_STILL","Alambique de bancada","#92bac3"],
    ["ALCHEMY_MOLD","Molde de ligas","#a97558"],
    ["ALCHEMY_CELL","Bancada eletroquímica","#d6a66d"],
    ["ALCHEMY_CRYSTAL_TRAY","Cuba de cristalização","#ad92c6"],
    ["ALCHEMY_CALORIMETER","Calorímetro","#778dbb"],
  ];
  const styles={
    pigment:{size:[5,3,3],wall:["PLANK","JACARANDA_LOG"],roof:["GLASS_AMBER","GLASS"],post:"BIRCH_LOG",floor:"PLANK",type:"greenhouse"},
    crystal:{size:[4,4,3],wall:["LIMESTONE","OCHRE_PLASTER"],roof:["RED_SAND","ROOF_RED"],post:"ACACIA_LOG",floor:"MARBLE",type:"terrace"},
    alloy:{size:[5,4,4],wall:["BASALT","SLATE"],roof:["SLATE","ROOF_RED"],post:"DEEPSTONE",floor:"FIELDSTONE",type:"gable"},
    water:{size:[4,5,3],wall:["PLANK","MANGROVE_LOG"],roof:["ROOF_BLUE","ROOF_MOSS"],post:"MANGROVE_LOG",floor:"PLANK",type:"hip"},
    thermal:{size:[3,4,4],wall:["SLATE","ALCHEMY_BRICK"],roof:["SNOW","SLATE"],post:"PINE_LOG",floor:"MARBLE",type:"tower"},
  };
  const palette=furniture.map(([, ,color])=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)));
  function register(B,defs){
    furniture.forEach(([key,name,icon],i)=>{
      const id=FIRST_BLOCK+i;
      if(defs[id])throw Error("ID de bloco alquímico já registrado.");
      B[key]=id;
      defs[id]={name,icon,tex:id+1,hard:i<2?1.3:1,solid:true,alchemy:i>=2,station:i>=2};
    });
  }
  function paint(tile,x,y,hash){
    const color=palette[tile-FIRST_BLOCK-1]||palette[0],seam=x%16===0||y%8===0;
    const seal=tile===FIRST_BLOCK+2&&(Math.abs(x-16)+Math.abs(y-15)<8);
    const grain=(hash(x,y,tile)-.5)*23;
    return [...color.map((v,i)=>v+grain+(seal?[31,45,62][i]:seam?-19:0)),255];
  }
  function specialization(region,culture,height){
    if(culture==="dry"||region==="salinas"||region==="chapadas ocres")return "crystal";
    if(region==="montanha"||culture==="volcanic")return "alloy";
    if(culture==="snow"||region==="prado alpino"&&height>29)return "thermal";
    if(culture==="coast"||region==="pântano"||region==="termas minerais")return "water";
    if(height>35)return "alloy";
    return "pigment";
  }
  function create({B,seed,hash,biomeAt,terrainHeight,culture,blocked,hasEdits,legacyOrigin,spawn,waterLevel,sitePositions}){
    const regions=new Map(),sites=new Map();
    const roll=(x,z,salt)=>hash(x+seed%1901,z-seed%2579,salt);
    const key=(x,z)=>x+","+z;
    const starter=legacyOrigin?null:[
      [spawn.x+48,spawn.z+5],[spawn.x+47,spawn.z+22],[spawn.x-43,spawn.z+16],[spawn.x-36,spawn.z-31],
    ].map(pair=>pair.map(Math.floor));
    function anchor(ix,iz){
      const k=key(ix,iz);
      if(regions.has(k))return regions.get(k);
      const x=ix*CELL+Math.floor((.33+roll(ix,iz,511)*.34)*CELL);
      const z=iz*CELL+Math.floor((.32+roll(ix,iz,512)*.36)*CELL);
      const base={x,z,key:k};
      if(regions.size>512)regions.delete(regions.keys().next().value);
      regions.set(k,base);
      return base;
    }
    function makeSite(id,x,z,starterSite,established=false){
      const h=terrainHeight(x,z);
      if(h<waterLevel+1||h>74)return null;
      const region=biomeAt(x,z),climate=culture(region),kind=specialization(region,climate,h);
      const config=QuimiCraftAlchemy.specialties[kind],style=styles[kind],rotation=Math.floor(roll(x,z,514)*4);
      const [w0,d0,rise]=style.size;
      const w=w0+(roll(z,x,515)>.72?1:0),d=d0;
      const point=(u,v)=>[
        x+(rotation===0?u:rotation===1?-v:rotation===2?-u:v),
        z+(rotation===0?v:rotation===1?u:rotation===2?-v:-u)
      ];
      const [gx,gz]=point(0,-d-3);
      const base=terrainHeight(gx,gz);
      if(base<waterLevel+1||base>74||Math.abs(base-h)>4)return null;
      const points=[point(-w-1,-d-3),point(w+1,d+1),point(w+1,-d-3),point(-w-1,d+1)];
      const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);
      const bounds={left:Math.min(...xs),right:Math.max(...xs),front:Math.min(...zs),rear:Math.max(...zs)};
      if(points.some(([px,pz])=>blocked(px,pz)||Math.abs(terrainHeight(px,pz)-base)>7)||blocked(x,z))return null;
      if(!starterSite&&legacyOrigin&&Math.hypot(x-legacyOrigin.x,z-legacyOrigin.z)<112)return null;
      if(!established&&hasEdits(bounds))return null;
      const columns=new Map(),doors=new Map();
      const wall=B[style.wall[Math.floor(roll(x,z,516)*2)]]??B.ALCHEMY_BRICK;
      const roof=B[style.roof[Math.floor(roll(x,z,517)*2)]]??B.SLATE;
      const post=B[style.post]??B.WOOD;
      const floor=B[style.floor]??B.MARBLE;
      const site={key:id,x,z,y:base,region,climate,kind,config,bounds,columns,doors,top:base+rise+4,resident:null};
      const build=(u,v,level,top)=>{
        const [xx,zz]=point(u,v);
        const low=Math.max(1,Math.min(terrainHeight(xx,zz),level)-1);
        const blocks=new Uint8Array(top-low+1);
        for(let y=low;y<level;y++)blocks[y-low]=B.FIELDSTONE;
        blocks[level-low]=floor;
        const entry={site,low,top,blocks};
        columns.set(key(xx,zz),entry);
        return blocks;
      };
      const set=(u,v,y,id)=>{
        const [xx,zz]=point(u,v),entry=columns.get(key(xx,zz));
        if(entry&&y>=entry.low&&y<=entry.top)entry.blocks[y-entry.low]=id;
      };
      for(let u=-w-1;u<=w+1;u++)for(let v=-d-3;v<=d+1;v++){
        const [xx,zz]=point(u,v);
        if(blocked(xx,zz))return null;
        const room=Math.abs(u)<=w&&Math.abs(v)<=d;
        const entrance=Math.abs(u)<=2&&v<-d;
        if(!room&&!entrance&&!(Math.abs(u)<=w+1&&Math.abs(v)<=d&&kind==="water"))continue;
        const level=entrance&&v===-d-3?terrainHeight(xx,zz):base;
        if(Math.abs(terrainHeight(xx,zz)-base)>9)return null;
        build(u,v,level,room?Math.max(site.top,terrainHeight(xx,zz)+1):Math.max(base+4, terrainHeight(xx,zz)+1));
        if(!room){
          set(u,v,level,kind==="water"?B.PLANK:B.COBBLE_PATH);
          if(v===-d-2&&Math.abs(u)===2)set(u,v,base+1,B.ALCHEMY_BORDER);
          continue;
        }
        const end=Math.abs(v)===d,side=Math.abs(u)===w;
        const outside=end||side;
        const window=!(!u&&v===-d)&&(style.type==="greenhouse"?Math.abs(u)!==w||Math.abs(v)<d:(side&&v%2===0)||(end&&Math.abs(u)===w-2));
        if(outside){
          set(u,v,base,B.ALCHEMY_BORDER);
          for(let dy=1;dy<=rise;dy++){
            const pillar=side&&end||(!u&&end);
            set(u,v,base+dy,window&&dy>=2&&dy<rise&&!pillar?B.WINDOW_LEADED:pillar?post:wall);
          }
        }
        let pitch=0;
        if(style.type==="greenhouse"||style.type==="gable")pitch=Math.floor((w-Math.abs(u))/2);
        if(style.type==="hip")pitch=Math.floor(Math.min(w-Math.abs(u),d-Math.abs(v))/2);
        if(style.type==="terrace")pitch=outside?1:0;
        if(style.type==="tower")pitch=Math.abs(u)<=1&&Math.abs(v)<=2?2:0;
        const roofY=base+rise+1+pitch;
        set(u,v,roofY,style.type==="greenhouse"&&u%3===0?post:roof);
        if(end||side)for(let y=base+rise+1;y<roofY;y++)set(u,v,y,wall);
        if(style.type==="tower"&&pitch===2&&Math.abs(v)===2)for(let y=base+rise+1;y<roofY;y++)set(u,v,y,B.WINDOW_LEADED);
      }
      const [doorX,doorZ]=point(0,-d);
      const [inX,inZ]=point(0,-d+1);
      site.door={x:doorX,y:base+1,z:doorZ};
      for(let half=0;half<2;half++){
        const y=base+1+half;
        set(0,-d,y,B.DOOR);
        doors.set(doorX+"|"+y+"|"+doorZ,{axis:rotation%2,half,hinge:rotation<2?-1:1,swing:rotation%2?Math.sign(inX-doorX):Math.sign(inZ-doorZ),style:"alchemy"});
      }
      set(0,-d,base+3,B.ALCHEMY_SIGN);
      set(w-1,d-1,base+1,B.ALCHEMY_BENCH);
      set(-1,-d-1,base+1,B.ALCHEMY_SAMPLE);
      set(2,-d-2,base+2,B.VILLAGE_LANTERN);
      set(-2,-d-2,base+2,B.VILLAGE_LANTERN);
      config.props.forEach((id,i)=>set(-w+1+i,d-1,base+1,B[id]));
      if(kind==="alloy")set(w-1,1,base+1,B.METAL_FORGE);
      if(kind==="pigment"){
        for(const u of [-w+1,w-1])for(const v of [-1,1]){
          set(u,v,base+1,B.GARDEN_BOX);
          set(u,v,base+2,u<0?B.ORCHID:B.LAVENDER);
        }
      }
      const checkpoints=[[1,d-2],[0,-d+1],[0,-d-3]].map(([u,v])=>{
        const [px,pz]=point(u,v);
        return {x:px+.5,y:(v===-d-3?terrainHeight(px,pz):base)+1,z:pz+.5};
      });
      site.resident={...checkpoints[0],id:"alchemy:"+id,role:"alchemist",name:config.person,
        tint:parseInt(config.color.slice(1),16),trim:parseInt(config.color.slice(1),16),scale:config.scale,
        skin:config.skin,hair:config.hair,accessory:config.accessory,culture:climate,variant:rotation,office:site,checkpoints};
      return site;
    }
    function resolve(id,candidates){
      if(sites.has(id))return sites.get(id);
      const established=sitePositions[id];
      let site=null;
      if(Array.isArray(established))site=makeSite(id,established[0],established[1],id==="starter",true);
      else for(const [x,z] of candidates){
        site=makeSite(id,x,z,id==="starter");
        if(site)break;
      }
      if(sites.size>=128)sites.delete(sites.keys().next().value);
      sites.set(id,site);
      return site;
    }
    function locationNear(x,z,range=0){
      const nearby=[];
      const limit=16+range;
      const within=(sx,sz,dist)=>Math.abs(x-sx)<=dist&&Math.abs(z-sz)<=dist;
      if(starter?.some(([sx,sz])=>within(sx,sz,limit))){
        const site=resolve("starter",starter);
        if(site&&within(site.x,site.z,limit))nearby.push(site);
      }
      const cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);
      const radius=range>100?2:range>0?1:0;
      for(let ix=cx-radius;ix<=cx+radius;ix++)for(let iz=cz-radius;iz<=cz+radius;iz++){
        const base=anchor(ix,iz);
        if(!within(base.x,base.z,limit+23))continue;
        const {x:sx,z:sz,key:id}=base;
        const site=resolve(id,[[sx,sz],[sx+20,sz],[sx-20,sz],[sx,sz+20],[sx,sz-20],[sx+15,sz+15]]);
        if(site&&within(site.x,site.z,limit))nearby.push(site);
      }
      return nearby;
    }
    function columnAt(x,z){
      const within=(sx,sz,limit)=>Math.abs(x-sx)<=limit&&Math.abs(z-sz)<=limit;
      if(starter?.some(([sx,sz])=>within(sx,sz,16))){
        const column=resolve("starter",starter)?.columns.get(key(x,z));
        if(column)return column;
      }
      const base=anchor(Math.floor(x/CELL),Math.floor(z/CELL));
      if(!within(base.x,base.z,39))return null;
      const {x:sx,z:sz,key:id}=base;
      const site=resolve(id,[[sx,sz],[sx+20,sz],[sx-20,sz],[sx,sz+20],[sx,sz-20],[sx+15,sz+15]]);
      return site?.columns.get(key(x,z))??null;
    }
    function blockAt(column,y){return column&&y>=column.low&&y<=column.top?column.blocks[y-column.low]:null}
    function doorAt(x,y,z){return columnAt(x,z)?.site.doors.get(x+"|"+y+"|"+z)}
    function remember(site){if(!sitePositions[site.key])sitePositions[site.key]=[site.x,site.z]}
    return {around:locationNear,columnAt,blockAt,doorAt,remember};
  }
  return {register,paint,create,specialization};
})();

