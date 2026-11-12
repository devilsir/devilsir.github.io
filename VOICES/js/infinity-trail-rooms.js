/* Registered module: infinity-trail-rooms */
(function(init){if(window.VoicesModules)window.VoicesModules.define('infinity-trail-rooms',init);else init();})(function(){
  'use strict';
  const V=window.V,T=48,map='infinity-trails',title='Trilhas do Infinito';
  const modes={
    easy:{name:'Fácil',description:'Grupos menores e avanço mais gradual.',power:.83,ramp:.025,xp:.8,packs:2},
    normal:{name:'Médio',description:'Equilíbrio entre encontros e recompensas.',power:1,ramp:.039,xp:1,packs:3},
    hard:{name:'Difícil',description:'Mais inimigos e guardiões mais fortes.',power:1.23,ramp:.055,xp:1.35,packs:3}
  };
  function enemy(id,name,art,health,attack,defense,agility,move,spell,tip,boss=false){
    return {id,name,art,sheet:'trail-mobs',health,attack,defense,agility,move,spell,tip,boss};
  }
  const enemies={
    boar:enemy('boar','Javali de Raízes',0,73,18,10,13,'burn',4,'O javali avança antes de soltar brasas das raízes.'),
    frog:enemy('frog','Sapo de Esporos',1,57,17,7,16,'poison',0,'Os esporos envenenam. Leve alguém que remova condições.'),
    crow:enemy('crow','Corvo do Crepúsculo',2,62,19,8,22,'shock',1,'O corvo drena foco com suas descargas.'),
    stone:enemy('stone','Sentinela de Musgo',3,89,16,16,9,'barrier',6,'A sentinela ergue uma barreira. Técnicas de ruptura abrem passagem.'),
    lynx:enemy('lynx','Lince da Geada',4,69,18,9,20,'freeze',3,'O lince congela um aliado. Uma proteção evita a perda de turno.'),
    stag:enemy('stag','Cervo das Raízes',5,148,21,13,16,'stun',2,'Ao perder metade da vida, o guardião ergue um escudo e lança descargas no grupo.',true)
  };
  const biomes=[
    {name:'Dossel de Jade',decor:'jade',landmarks:['ruins','water','relics'],palette:['#182f26','#7c6650','#a0d693'],veil:'#0a382639',ground:0,accent:[1,4,5,6,8],trees:[0,2,0],pool:['boar','wolf','beetle','stone','frog'],arena:'trail-arena'},
    {name:'Brejo dos Esporos',decor:'marsh',landmarks:['water','water','wayside'],palette:['#142d2b','#5a6957','#83e0cf'],veil:'#06465053',ground:3,accent:[4,5,7,11],trees:[2,0,2],pool:['frog','crow','beetle','lantern','wolf'],arena:'trail-arena'},
    {name:'Pedras da Bruma',decor:'mist',landmarks:['ruins','relics','water'],palette:['#202c37','#59615f','#b8d9ef'],veil:'#222e714b',ground:2,accent:[5,7,8,10,11],trees:[2,0,2],pool:['lynx','stone','heron','crow','clock'],arena:'clearing'},
    {name:'Bosque de Âmbar',decor:'amber',landmarks:['wayside','relics','ruins'],palette:['#352d28','#876847','#efbf84'],veil:'#69371540',ground:0,accent:[1,6,8,9],trees:[0,0,2],pool:['boar','lantern','clock','stone','wolf'],arena:'clearing'}
  ];

  const point=(x,y)=>({x:x*T,y:y*T});
  const random=seed=>{
    let value=seed>>>0||1;
    return ()=>{
      value^=value<<13;value^=value>>>17;value^=value<<5;
      return (value>>>0)/4294967296;
    };
  };
  function roomSeed(seed,depth){
    const low=depth>>>0,high=Math.floor(depth/4294967296)>>>0;
    let x=(seed^Math.imul(low,0x9e3779b1)^Math.imul(high,0x85ebca6b))>>>0;
    x=Math.imul(x^(x>>>16),0x7feb352d);
    x=Math.imul(x^(x>>>15),0x846ca68b);
    return (x^(x>>>16))>>>0;
  }
  const lookup=id=>enemies[id]||V.FragmentData.enemies[id];
  function distanceToPath(x,y,path){
    let min=Infinity;
    for(let i=1;i<path.length;i++){
      const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y;
      const t=V.clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy),0,1);
      min=Math.min(min,Math.hypot(x-a.x-t*dx,y-a.y-t*dy));
    }
    return min;
  }
  function object(m,kind,id,position,label,info={}){
    const o={type:'infinity-trail',kind,id:'infinity-'+id,label,interactionRange:84,...position,...info};
    m.objects.push(o);
    return o;
  }
  function place(m,sheet,prop,p,size,solid=false){
    m.decor.push({x:p.x-size/2,y:p.y-size,size,family:sheet,prop});
    if(solid)m.solids.push({x:p.x-size*.15,y:p.y-size*.19,w:size*.30,h:size*.21});
  }

  const landmarkProps={
    ruins:{main:[0,1,2,3],detail:[3,4,5]},
    water:{main:[0,1,2],detail:[3,4,5]},
    wayside:{main:[0,2,3],detail:[1,2,4,5]},
    relics:{main:[0,1,2],detail:[3,4,5]}
  };
  const sceneryKey=group=>'trail-decor-'+group;
  function decorate(m,protectedSpots,rng,int,pick){
    const {width,height}=m,{biome,path}=m.infinity;
    const placed=[];
    const nearProtected=(p,margin)=>protectedSpots.some(o=>V.dist(o,p)<margin);
    function add(group,index,p,size,solid=false){
      place(m,group,index,p,size,solid);
      placed.push({...p,size});
    }
    const packed=(p,size)=>placed.some(o=>V.dist(o,p)<(o.size+size)*.29);
    function clear(p,size,pathGap){
      return p.x>2.1*T&&p.y>2.25*T&&p.x<(width-2.1)*T&&p.y<(height-2.1)*T
        &&distanceToPath(p.x,p.y,path)>=pathGap&&!nearProtected(p,55+size*.44)&&!packed(p,size);
    }
    const local=sceneryKey(biome.decor);
    const localTrees=biome.decor==='jade'||biome.decor==='amber'?[0,0,1]:[0];
    function tree(x,y,size){
      const p={x,y};
      if(distanceToPath(x,y,path)<size*.30||nearProtected(p,size*.56))return;
      const style=int(0,6);
      if(style<4)add(local,pick(localTrees),p,size,true);
      else if(style<6)add(sceneryKey('trunks'),pick([0,1]),p,size,true);
      else add('trail-props',pick(biome.trees),p,size,true);
    }
    for(let x=1;x<width;x+=2.35){
      tree((x+rng()*.5)*T,(2.2+rng()*.7)*T,int(152,230));
      tree((x+rng()*.5)*T,(height-.76-rng()*.72)*T,int(130,191));
    }
    for(let y=4;y<height-2;y+=2.35){
      tree(1.9*T,y*T,int(160,234));
      tree((width-1.6)*T,y*T,int(160,234));
    }

    // Place a landmark just off the trail, then dress its edges with related props.
    const theme=pick(biome.landmarks),landmark=landmarkProps[theme],size=int(144,179);
    const spots=[];
    for(let y=4;y<height-3;y+=2.4)for(let x=4;x<width-3;x+=2.4){
      const p=point(x+rng()*.7,y+rng()*.7),distance=distanceToPath(p.x,p.y,path);
      if(distance<295&&clear(p,size,122))spots.push(p);
    }
    if(spots.length){
      const p=pick(spots),key=sceneryKey(theme);
      add(key,pick(landmark.main),p,size,true);
      for(const [dx,dy] of [[-83,29],[79,35],[65,-49],[-64,-50]]){
        const detail={x:p.x+dx,y:p.y+dy},scale=int(52,83);
        if(clear(detail,scale,67))add(key,pick(landmark.detail),detail,scale);
      }
    }

    // Keep useful sightlines around bends and the interaction points.
    for(const p of path.slice(1,-1)){
      const choices=[[88,39],[-88,39],[71,-72],[-71,-72]];
      const marker=choices.map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).find(q=>clear(q,73,61));
      if(marker)add(sceneryKey('wayside'),pick([1,2,4,5]),marker,int(59,83));
    }
    const accents=[sceneryKey('ruins'),sceneryKey('water'),sceneryKey('relics'),sceneryKey('wayside')];
    for(let i=0;i<Math.floor(width*height/5.6);i++){
      const p=point(int(3,width-3)+rng(),int(3,height-3)+rng()),size=int(45,103);
      if(!clear(p,size,59))continue;
      const distance=distanceToPath(p.x,p.y,path);
      const style=int(0,18);
      if(style<2&&distance>157&&!packed(p,157)){
        tree(p.x,p.y,int(141,192));
      }else if(style<9){
        add(local,int(1,5),p,size,distance>120&&size>86);
      }else if(style<13){
        add(sceneryKey('understory'),int(0,5),p,size);
      }else if(style<15){
        add(sceneryKey('trunks'),int(2,5),p,size,distance>145&&size>89);
      }else if(style===15&&distance>93){
        add(pick(accents),int(0,5),p,size,distance>130&&size>85);
      }else if(style===16){
        add('fragment-wood',pick([2,3,5,6]),p,size,distance>120&&size>89);
      }else{
        add('trail-props',pick(biome.accent),p,size,distance>124&&size>91);
      }
    }
  }

  function build(run){
    const {seed,depth,difficulty}=run,mode=modes[difficulty],rng=random(roomSeed(seed,depth));
    const int=(min,max)=>min+Math.floor(rng()*(max-min+1));
    const pick=list=>list[int(0,list.length-1)];
    const width=int(23,41),height=int(17,30),biome=pick(biomes),shape=int(0,2);
    const entry=point(int(6,width-6),height-3.3),exit=point(int(5,width-5),3.5);
    const middle=(height-3.3+3.5)/2;
    const bends=shape===0?[point(int(5,width-5),middle)]:shape===1?[
      point(int(5,Math.floor(width/2)),height*.66),
      point(int(Math.ceil(width/2),width-5),height*.46),
      point(int(5,width-5),height*.28)
    ]:[point(int(7,width-7),height*.64),point(int(7,width-7),height*.36)];
    const path=[entry,...bends,exit],elite=depth%5===0;
    const m=V.World.base(map,'community',width,height);
    m.name=title+' · Sala '+depth;
    m.infinity={depth,biome,shape,path,elite};
    const design={name:m.name,width,height,spawn:[entry.x/T-.5,entry.y/T-.5],floor:'grass',palette:biome.palette,
      paths:[],decor:[],anchors:[],scenes:[]};
    V.Cozy.layouts[map]=design;
    V.Cozy.compose(m);
    m.spawnPoint={x:entry.x,y:entry.y-111};
    m.geometryRevision=run.serial+'-'+depth+'-'+seed;
    const returnGate=object(m,'return','return',{x:entry.x,y:entry.y+43},'Voltar à floresta',{prop:3});
    const nextGate=object(m,'next','next',exit,'Avançar para a próxima sala',{prop:3});
    const packCount=elite?mode.packs:mode.packs+int(0,difficulty==='hard'?1:0);
    const packs=[];
    for(let i=0;i<packCount;i++){
      const fraction=(i+1)/(packCount+1),step=fraction*(path.length-1),segment=Math.floor(step),blend=step-segment;
      const a=path[segment],b=path[segment+1],side=(i%2===0?1:-1)*int(19,44);
      const position={x:a.x+(b.x-a.x)*blend+side,y:a.y+(b.y-a.y)*blend};
      const guardian=elite&&i===packCount-1;
      const size=guardian?(difficulty==='easy'?1:2):int(1,difficulty==='easy'?2:difficulty==='hard'?3:2);
      const foes=Array.from({length:size},()=>pick(biome.pool));
      if(guardian)foes[0]='stag';
      const primary=lookup(foes[0]);
      const xp=Math.round((18+Math.min(90,depth*2)+8*size+(guardian?32:0))*mode.xp);
      const shards=guardian?(difficulty==='hard'?3:2):(difficulty==='hard'&&size===3?2:1);
      const label=guardian?'Guardião da sala':size===1?primary.name:'Grupo de '+primary.name;
      packs.push(object(m,'pack','pack-'+i,position,'Enfrentar '+label,{slot:i,foes,primary,xp,shards,guardian,
        patrol:guardian?0:int(10,23),phase:rng()*Math.PI*2}));
    }
    const rest=elite?object(m,'rest','rest',{x:exit.x+(exit.x>width*T*.5?-102:102),y:exit.y+38},'Nascente de descanso',{prop:7}):null;
    const protectedSpots=[m.spawnPoint,returnGate,nextGate,...packs,...(rest?[rest]:[])];
    decorate(m,protectedSpots,rng,int,pick);
    m.infinity.packs=packs;
    m.infinity.next=nextGate;
    return m;
  }

  function strength(enemy,run,allies,level){
    const mode=modes[run.difficulty],hero=allies[0].stats;
    const depth=1+mode.ramp*(run.depth-1)+.072*Math.log2(run.depth);
    const levelFactor=1+.105*Math.max(0,level-1);
    const offense=(hero.attack+hero.knowledge)/30;
    const endurance=(hero.health/110+(hero.defense+hero.resolve)/20)/2;
    const support=(hero.agility/10+hero.focus/70)/2;
    const team=1+Math.max(0,allies.length-1)*.155;
    const pressure=mode.power*depth;
    const health=Math.round(enemy.health*(.46*levelFactor+.54*offense)*team*pressure);
    const attack=Math.round(enemy.attack*(.44*levelFactor+.56*endurance)*pressure*(.92+.045*(allies.length-1)));
    const defense=Math.round(enemy.defense*(.59*levelFactor+.41*offense)*Math.sqrt(pressure));
    return {health:Math.max(16,health),attack:Math.max(4,attack),defense:Math.max(1,defense),
      knowledge:Math.max(4,Math.round(attack*.89)),agility:Math.max(1,Math.round(enemy.agility*(.55+.45*support)*Math.sqrt(pressure))),
      focus:Math.max(20,Math.round(30*support)),resolve:Math.max(2,Math.round(8*Math.sqrt(levelFactor*pressure)))};
  }
  function ground(m){
    const {biome,path,shape}=m.infinity,cache=V.GroundCache.create(m,m.width*T,m.height*T),c=cache.getContext('2d');
    const w=V.GroundCache.width(cache),h=V.GroundCache.height(cache);
    const [moss,earth,stone,brush]=[0,1,2,3].map(i=>V.FragmentArt.texture(c,i));
    const textures=[moss,earth,stone,brush];
    c.fillStyle=textures[biome.ground]||biome.palette[0];c.fillRect(0,0,w,h);
    c.fillStyle=biome.veil;c.fillRect(0,0,w,h);
    c.lineCap='round';c.lineJoin='round';
    const trace=()=>{
      c.beginPath();c.moveTo(path[0].x,path[0].y+64);
      for(const p of path)c.lineTo(p.x,p.y);
    };
    const widths=[112,82,139];
    trace();c.lineWidth=widths[shape]+26;c.strokeStyle=brush||'#344938';c.stroke();
    trace();c.lineWidth=widths[shape];c.strokeStyle=(biome.ground===2?stone:earth)||biome.palette[1];c.stroke();
    if(shape!==1){
      const p=path[1];
      c.beginPath();c.ellipse(p.x,p.y,shape===2?170:98,shape===2?100:62,-.18,0,Math.PI*2);
      c.fillStyle=stone||biome.palette[1];c.fill();
    }
    const edge=c.createLinearGradient(0,0,0,h);
    edge.addColorStop(0,'#04161399');edge.addColorStop(.26,'#06181415');edge.addColorStop(.78,'#06181410');edge.addColorStop(1,'#0618149c');
    c.fillStyle=edge;c.fillRect(0,0,w,h);
    m.cache=cache;
  }
  V.InfinityTrailRooms={map,title,modes,lookup,build,strength,ground};
});
