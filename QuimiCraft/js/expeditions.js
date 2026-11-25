
"use strict";

globalThis.QuimiCraftExpeditions=(()=>{
  const names={den:"Covil dracônico",temple:"Templo das Dunas",lab:"Laboratório Soterrado",grove:"Aldeia das Copas"};
  const table={
    den:{chance:.68,reach:15},
    temple:{chance:.57,reach:13,regions:["deserto","salinas","badlands","chapadas ocres","savana","cânion calcário"]},
    lab:{chance:.64,reach:24},
    grove:{chance:.72,reach:19,regions:["floresta","floresta de sequoias","selva tropical","bosque de cerejeiras","bosque lilás","taiga","planície florida","manguezal","delta salobro"]}
  };
  const spacing=144,slots=[[35,35],[108,35],[35,108],[108,108]],kinds=Object.keys(table);
  const denGuards={
    ice_dragon:["sapphire_sentinel","silver_sentinel","SAPPHIRE_ORE","SILVER_ORE"],
    fire_dragon:["ruby_sentinel","gold_sentinel","RUBY_ORE","GOLD"],
    nature_dragon:["emerald_sentinel","gold_sentinel","EMERALD_ORE","GOLD"],
    time_dragon:["opal_sentinel","gold_sentinel","OPAL_ORE","GOLD"],
    earth_dragon:["amethyst_sentinel","silver_sentinel","AMETHYST","SILVER_ORE"]
  };
  const loot={
    den:[["raw_beef",3,6],["hide",2,5],["gold_nugget",4,8],["crystal_shard",2,5],["bronze_ingot",2,4]],
    temple:[["gold_nugget",5,9],["bolt",8,14],["copper_ingot",2,5],["bread",2,4],["prism_pendant",1,1]],
    lab:[["protective_goggles",1,1],["spectral_data",1,3],["copper_sulfate",2,4],["antidote",1,2],["carbon_filter",1,2]],
    grove:[["honey",3,5],["berries",4,7],["fertilizer",1,3],["potato_seed",2,4],["beet_seed",2,4]]
  };
  function register(B,defs){
    B.EXPEDITION_CHEST=300;B.EXPEDITION_CHEST_OPEN=301;
    defs[300]={name:"Baú de expedição",solid:true,tex:13,hard:.85,icon:"#b1804e",detail:true};
    defs[301]={...defs[300],name:"Baú aberto",hidden:true};
  }
  function create({B,seed,terrain,biome,blocked,cave,dragons,water=15,maxY=96}){
    const grid=new Map();
    const rand=(x,z,salt)=>{
      let n=Math.imul(x|0,0x6c8e9cf5)^Math.imul(z|0,0x5d588b65)^Math.imul(seed|0,0x27d4eb2d)^Math.imul(salt,0x9e3779b1);
      n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);
      return ((n^(n>>>16))>>>0)/4294967296;
    };
    const key=(x,z)=>x+","+z;
    function coordinates(site,u,v){
      if(site.turn===1)return [site.x-v,site.z+u];
      if(site.turn===2)return [site.x-u,site.z-v];
      if(site.turn===3)return [site.x+v,site.z-u];
      return [site.x+u,site.z+v];
    }
    function blueprint(site){
      const columns=new Map(),treasures=new Map(),actors=[];
      function put(u,y,v,block){
        if(block==null||y<1||y>=maxY-1)return;
        const [x,z]=coordinates(site,u,v),k=key(x,z);
        let c=columns.get(k);
        if(!c){c={low:y,top:y,blocks:[],surface:site.kind!=="lab"};columns.set(k,c);}
        c.low=Math.min(c.low,y);c.top=Math.max(c.top,y);c.blocks[y]=block;
      }
      function box(x1,y1,z1,x2,y2,z2,block){
        for(let x=x1;x<=x2;x++)for(let z=z1;z<=z2;z++)for(let y=y1;y<=y2;y++)put(x,y,z,block);
      }
      function room(w,y,z,d,h,floor,wall,roof=wall){
        box(-w,y,z,w,y+h,z+d,wall);
        box(1-w,y+1,z+1,w-1,y+h-1,z+d-1,B.AIR);
        box(-w,y,z,w,y,z+d,floor);box(-w,y+h,z,w,y+h,z+d,roof);
        box(-1,y+1,z,1,y+3,z,B.AIR);
      }
      function chest(u,y,v,index){
        put(u,y,v,B.EXPEDITION_CHEST);
        const [x,z]=coordinates(site,u,v);
        const list=loot[site.kind],offset=Math.floor(rand(x,z,113+index)*list.length);
        const chosen=site.kind==="grove"?list.slice(0,3):Array.from({length:3},(_,i)=>list[(offset+i)%list.length]);
        const items=chosen.map(([item,min,max],i)=>[B[item]??item,min+Math.floor(rand(x,z,45+i)*(max-min+1))]);
        treasures.set(x+"|"+y+"|"+z,{name:site.kind==="grove"?"Oferendas da aldeia":site.name,items});
      }
      function actor(u,y,v,type){
        const [x,z]=coordinates(site,u,v);
        actors.push({id:site.id+":"+actors.length,x:x+.5,y,z:z+.5,type});
      }
      function approach(from,to,material,width){
        const [x,z]=coordinates(site,0,from),outside=terrain(x,z);
        for(let v=from;v<=to;v++)for(let u=-width;u<=width;u++){
          const [cx,cz]=coordinates(site,u,v),base=terrain(cx,cz);
          const level=Math.round(outside+(site.y-outside)*(v-from)/(to-from));
          for(let a=Math.min(base,level);a<=Math.max(base,level+3);a++){
            put(u,a,v,a<level?B.STONE:a===level?material:B.AIR);
          }
        }
      }
      const y=site.y;
      if(site.kind==="den"){
        const variant={
          ice_dragon:[B.SLATE,B.FROSTED_SOIL,B.ICE,B.GLACIAL_MORAINE],
          fire_dragon:[B.BASALT,B.OBSIDIAN,B.GLOWSTONE,B.SCORIA],
          nature_dragon:[B.FIELDSTONE,B.MOSS,B.REDWOOD_LEAF,B.FOREST_LOAM],
          time_dragon:[B.OCHRE_STONE,B.LIMESTONE,B.BRONZE_BLOCK,B.SILICA_SAND],
          earth_dragon:[B.DEEPSTONE,B.BASALT,B.AMETHYST,B.GNEISS]
        }[site.dragon];
        const [rock,floor,decor,trim]=variant;
        for(let u=-12;u<=12;u++)for(let v=-10;v<=11;v++){
          const d=(u/12.7)**2+((v-1)/11.2)**2;
          if(d>1)continue;
          put(u,y-1,v,rock);put(u,y,v,d<.74?floor:trim);
          const ceiling=1+Math.floor(9*Math.sqrt(1-d)+rand(site.x+u,site.z+v,9)*1.4);
          for(let a=1;a<=ceiling;a++){
            const opening=Math.abs(u)<=4&&v<0&&a<=6;
            put(u,y+a,v,opening||d<.85&&a<ceiling-1?B.AIR:a===ceiling&&rand(u,v,12)>.48?trim:rock);
          }
        }
        box(-4,y+1,-12,4,y+6,-6,B.AIR);
        approach(-14,-7,rock,4);
        box(-2,y+1,3,2,y+1,7,floor);
        for(const side of [-1,1]){
          for(let j=0;j<4;j++)box(side*(6+j),y+1,3+j,side*(6+j),y+2+(j%3),3+j,decor);
          put(side*6,y+1,-3,B.SPECTRAL);
        }
        chest(-4,y+1,4,0);chest(4,y+1,4,1);
        const [gemGuard,metalGuard,gemOre,metalOre]=denGuards[site.dragon];
        put(-6,y+3,3,B[gemOre]);put(6,y+3,3,B[metalOre]);
        actor(0,y+1,1,site.dragon);
        actor(-5,y+1,-2,gemGuard);actor(5,y+1,1,metalGuard);
      }else if(site.kind==="temple"){
        room(8,y,-7,15,5,B.LIMESTONE,B.OCHRE_PLASTER,B.TRAVERTINE);
        for(let tier=1;tier<=4;tier++)box(-8+tier*2,y+5+tier,-7+tier*2,8-tier*2,y+5+tier,8-tier*2,tier%2?B.LIMESTONE:B.SILICA_SAND);
        box(-3,y,-11,3,y,-7,B.TRAVERTINE);
        box(-2,y+1,-11,2,y+4,-7,B.AIR);
        approach(-13,-7,B.TRAVERTINE,2);
        for(const side of [-1,1]){
          for(const v of [-10,-7,-2,3,7]){
            box(side*6,y+1,v,side*6,y+4,v,B.LIMESTONE);
            put(side*6,y+2,v,B.GLOWSTONE);
            put(side*6,y+4,v,B.BRASS_BLOCK);
          }
          box(side*7,y+1,-3,side*7,y+3,4,B.AIR);
          box(side*8,y+1,-1,side*8,y+3,2,B.OCHRE_PLASTER);
          put(side*5,y+2,6,B.TORCH);
        }
        for(let v=-6;v<=7;v++)for(let u=-2;u<=2;u++)put(u,y,v,(u+v)%2?B.CERAMIC:B.SILICA_SAND);
        box(-4,y+1,5,4,y+1,7,B.TRAVERTINE);
        chest(0,y+2,6,0);chest(-5,y+1,3,1);chest(5,y+1,3,2);
        actor(-4,y+1,-1,"dune_sentinel");actor(4,y+1,2,"dune_sentinel");
      }else if(site.kind==="lab"){
        room(7,y,-6,14,5,B.SLATE,B.ALCHEMY_BRICK,B.DEEPSTONE);
        box(-2,y,-11,2,y,-6,B.STEEL_BLOCK);
        box(-2,y+1,-11,2,y+3,-6,B.AIR);
        for(let v=-7;v>=-site.tunnel;v--){
          const floor=y+Math.round((site.mouthY-y)*(Math.abs(v)-7)/(site.tunnel-7));
          box(-1,floor,v,1,floor,v,B.SLATE);
          box(-1,floor+1,v,1,floor+3,v,B.AIR);
          if(v%4===0)put(1,floor+3,v,B.SPECTRAL);
        }
        for(const side of [-1,1]){
          for(const v of [-4,0,4,7]){
            box(side*6,y+1,v,side*6,y+4,v,B.STEEL_BLOCK);
            put(side*5,y+4,v,B.GLOWSTONE);
          }
          for(const v of [-2,2])box(side*5,y+1,v,side*6,y+3,v,B.GLASS_COBALT);
          for(const v of [-4,0,4])put(side*5,y+1,v,v===0?B.LAB:B.CERAMIC);
        }
        box(-3,y+1,5,3,y+1,7,B.BRONZE_BLOCK);
        put(0,y+2,7,B.AMETHYST);put(-1,y+2,7,B.GLASS);put(1,y+2,7,B.GLASS);
        chest(-3,y+2,6,0);chest(3,y+2,6,1);
        actor(-3,y+1,-1,"lab_sentinel");actor(3,y+1,4,"lab_sentinel");
      }else{
        for(let u=-17;u<=17;u++)for(let v=-17;v<=17;v++){
          if(Math.hypot(u,v)>17.7)continue;
          const [x,z]=coordinates(site,u,v),base=terrain(x,z);
          for(let a=Math.min(y-2,base);a<=Math.max(y+5,base+4);a++)put(u,a,v,a===y?(
            Math.abs(u)<2||Math.abs(v)<2||Math.abs(Math.hypot(u,v)-8)<1.1?B.COBBLE_PATH:B.MOSS
          ):a<y?B.DIRT:B.AIR);
        }
        for(const [u,v] of [[-10,-9],[10,8],[-10,9],[10,-8]]){
          box(u-3,y+1,v-3,u+3,y+2,v+3,B.REDWOOD_LOG);
          box(u-2,y+3,v-2,u+2,y+5,v+2,B.WOOD);
          box(u-1,y+3,v-1,u+1,y+5,v+1,B.AIR);
          box(u-1,y+3,v-3,u+1,y+5,v-2,B.AIR);
          for(let a=0;a<4;a++)box(u-4+a,y+6+a,v-4+a,u+4-a,y+6+a,v+4-a,a%2?B.BIRCH_LEAF:B.REDWOOD_LEAF);
          box(u-1,y+1,v-5,u+1,y+1,v-4,B.PLANK);box(u-1,y+2,v-4,u+1,y+2,v-3,B.PLANK);
          put(u-2,y+3,v-2,B.SPECTRAL);
        }
        box(-1,y+1,-1,1,y+11,1,B.REDWOOD_LOG);
        for(let a=8;a<=14;a++){
          const r=a<12?5:15-a;
          for(let u=-r;u<=r;u++)for(let v=-r;v<=r;v++)if(u*u+v*v<(r+.5)**2&&Math.abs(u)+Math.abs(v)>1)put(u,y+a,v,a%2?B.BIRCH_LEAF:B.REDWOOD_LEAF);
        }
        for(const [u,v] of [[-3,0],[3,0],[0,-3],[0,3]]){
          put(u,y+1,v,B.FIELDSTONE);put(u,y+2,v,B.SPECTRAL);
        }
        chest(-3,y+1,-3,0);
        actor(-6,y+1,-3,"living_tree");actor(5,y+1,1,"living_tree_warden");actor(3,y+1,-7,"living_tree_elder");
        const home=biome(site.x,site.z),trees=["living_tree_pine","living_tree_cherry","living_tree_willow","living_tree_mangrove"];
        const preferred={taiga:0,"floresta de sequoias":0,"bosque de cerejeiras":1,"bosque lilás":1,"selva tropical":2,manguezal:3,"delta salobro":3};
        const choice=preferred[home]??Math.floor(rand(site.x,site.z,141)*trees.length);
        actor(-7,y+1,1,trees[choice]);
        actor(0,y+1,7,trees[(choice+1+Math.floor(rand(site.x,site.z,142)*3))%trees.length]);
      }
      if(site.kind==="den"||site.kind==="temple"){
        for(const [k,column] of columns){
          if(column.blocks[y]===undefined||column.blocks[y]===B.AIR)continue;
          const [x,z]=k.split(",").map(Number),base=terrain(x,z);
          for(let level=base;level<y-1;level++){
            column.blocks[level]??=B.STONE;
            column.low=Math.min(column.low,level);
          }
        }
      }
      return Object.assign(site,{columns,treasures,actors});
    }
    function candidate(gx,gz,kind,i,position){
      const {chance,regions,reach}=table[kind];
      if(rand(gx,gz,24+i)>chance)return null;
      const [ox,oz]=position;
      for(let attempt=0;attempt<5;attempt++){
        const x=gx*spacing+ox+Math.floor(rand(gx,gz,50+i*11+attempt*131)*19)-9;
        const z=gz*spacing+oz+Math.floor(rand(gx,gz,51+i*11+attempt*131)*19)-9;
        const biomeName=biome(x,z),h=terrain(x,z);
        if(h<water+3||h+16>=maxY||regions&&!regions.includes(biomeName))continue;
        if([[0,0],[-reach,0],[reach,0],[0,-reach],[0,reach],[-reach,-reach],[reach,reach],[-reach,reach],[reach,-reach]]
          .some(([u,v])=>blocked(x+u,z+v)||kind!=="lab"&&Math.abs(terrain(x+u,z+v)-h)>(kind==="den"?8:kind==="grove"?7:5)))continue;
        const y=kind==="temple"||kind==="grove"?h+1:h;
        const site={id:kind+":"+gx+":"+gz,kind,name:names[kind],x,z,y,turn:Math.floor(rand(x,z,64)*4)};
        if(kind==="den"){
          const choices=dragons(biomeName);
          if(!choices.length)continue;
          site.dragon=choices[Math.floor(rand(x,z,68)*choices.length)];
        }
        if(kind==="lab"){
          site.y=Math.max(8,h-18);
          let mouth=null;
          const startTurn=site.turn;
          for(let side=0;side<4&&!mouth;side++){
            site.turn=(startTurn+side)%4;
            for(const distance of [12,16,20,23]){
              const [mx,mz]=coordinates(site,0,-distance),ground=terrain(mx,mz);
              for(const rise of [0,1,-1,2,-2,3,-3,4,-4]){
                const level=site.y+rise;
                if(level>5&&level+3<ground&&cave(mx,level+1,mz,ground)&&cave(mx,level+2,mz,ground)){
                  mouth={distance,level};break;
                }
              }
              if(mouth)break;
            }
          }
          if(!mouth)continue;
          site.tunnel=mouth.distance;site.mouthY=mouth.level;
        }
        return site;
      }
      return null;
    }
    function region(gx,gz){
      const id=key(gx,gz);
      if(grid.has(id))return grid.get(id);
      const mix=Math.floor(rand(gx,gz,8)*kinds.length);
      const sites=kinds.map((kind,i)=>candidate(gx,gz,kind,i,slots[(i+mix)%kinds.length])).filter(Boolean);
      if(grid.size>=180)grid.delete(grid.keys().next().value);
      grid.set(id,sites);
      return sites;
    }
    function column(x,z){
      const k=key(x,z);
      for(const site of region(Math.floor(x/spacing),Math.floor(z/spacing))){
        if(Math.max(Math.abs(x-site.x),Math.abs(z-site.z))>table[site.kind].reach)continue;
        if(!site.columns)blueprint(site);
        const part=site.columns.get(k);
        if(part)return part;
      }
      return null;
    }
    function nearby(x,z,radius){
      const sites=[];
      for(let gx=Math.floor((x-radius)/spacing);gx<=Math.floor((x+radius)/spacing);gx++){
        for(let gz=Math.floor((z-radius)/spacing);gz<=Math.floor((z+radius)/spacing);gz++){
          for(const site of region(gx,gz)){
            if(Math.hypot(site.x-x,site.z-z)>radius)continue;
            if(!site.columns)blueprint(site);
            sites.push(site);
          }
        }
      }
      return sites;
    }
    function treasureAt(x,y,z){
      const k=x+"|"+y+"|"+z;
      for(const site of nearby(x,z,table.lab.reach+2)){
        const treasure=site.treasures.get(k);
        if(treasure)return treasure;
      }
      return null;
    }
    return {column,nearby,treasureAt};
  }
  return {register,create,names};
})();

