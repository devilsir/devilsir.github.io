/* Registered module: combat-gear */
(function(init){if(window.VoicesModules)window.VoicesModules.define('combat-gear',init);else init();})(function(){
  'use strict';
  const V=window.V,P=V.Progress,T=V.Team,B=V.Combat,D=V.AdventureData;
  const slots={
    hands:'Mãos',head:'Cabeça',feet:'Pés',legs:'Pernas',chest:'Tronco',neck:'Pescoço',weapon:'Arma',offhand:'Escudo'
  };
  const labels={health:'Vida',focus:'Foco',attack:'Ataque',defense:'Defesa',knowledge:'Conhecimento',agility:'Agilidade',resolve:'Determinação'};
  const grades=['Comum','Reforçado','Raro'];
  const definitions=[
    ['wraps','Faixas de lona','hands',0,{agility:2}],
    ['gloves','Luvas de couro','hands',1,{attack:4,agility:2}],
    ['gauntlets','Manoplas de aço','hands',2,{attack:6,defense:3}],
    ['cap','Touca de caminhada','head',0,{resolve:3,health:4}],
    ['helm','Elmo de batedor','head',1,{defense:4,health:8}],
    ['crest','Elmo da Vigília','head',2,{resolve:7,defense:4}],
    ['boots','Botas de caminhada','feet',0,{agility:3}],
    ['greentread','Botas de trilheiro','feet',1,{agility:5,resolve:2}],
    ['steelboots','Botas de placas','feet',2,{defense:5,health:12}],
    ['linen','Calças de linho','legs',0,{health:8,agility:1}],
    ['leggings','Calças de couro','legs',1,{health:12,defense:3}],
    ['greaves','Grevas do Guardião','legs',2,{health:18,defense:5}],
    ['vest','Colete acolchoado','chest',0,{health:16,defense:4}],
    ['coat','Casaco do Bosque','chest',1,{health:24,defense:6}],
    ['plate','Couraça do Eco','chest',2,{health:32,defense:9,agility:-2}],
    ['seed','Pingente de semente','neck',0,{knowledge:3,focus:5}],
    ['moon','Amuleto da Lua','neck',1,{knowledge:5,focus:9}],
    ['amber','Colar de âmbar','neck',2,{knowledge:7,focus:12,resolve:3}],
    ['baton','Bastão de raiz','weapon',0,{attack:4},1],
    ['saber','Sabre de batedor','weapon',1,{attack:7,agility:2},1],
    ['staff','Cajado da Bruma','weapon',1,{knowledge:10,focus:10},2],
    ['greatsword','Montante da Vigília','weapon',2,{attack:14,health:10,agility:-2},2],
    ['round','Escudo de madeira','offhand',0,{defense:4,resolve:1}],
    ['kite','Escudo do Arquivo','offhand',2,{defense:9,resolve:4}]
  ];
  const items=new Map(definitions.map(([key,name,slot,tier,stats,hands],art)=>{
    const id='gear-'+key;
    return [id,{id,name,slot,tier,stats,hands,art}];
  }));
  const consumables={
    'gear-sap':{name:'Tônico de seiva',icon:'water',effect:'heal',power:70,description:'Recupera 70 de vida.'},
    'gear-mint':{name:'Chá de broto',icon:'tea',effect:'focus',power:50,description:'Recupera 50 de foco.'},
    'gear-antidote':{name:'Antídoto da trilha',icon:'kit',effect:'cleanse',power:25,description:'Remove efeitos negativos e recupera 25 de vida.'}
  };
  const statText=stats=>Object.entries(stats||{}).map(([key,n])=>(n>0?'+':'')+n+' '+labels[key]).join(' · ');
  const subtitle=item=>item.hands?item.hands===2?'Arma de duas mãos':'Arma de uma mão':slots[item.slot];
  for(const item of items.values()){
    D.items[item.id]={name:item.name,category:'equipment',stack:4,stats:item.stats,
      description:subtitle(item)+' · '+grades[item.tier]+'. Equipe na ficha de equipamento.'};
  }
  for(const [id,item] of Object.entries(consumables))D.items[id]={...item,category:'consumable',stack:12};

  const isRecord=value=>value&&typeof value==='object'&&!Array.isArray(value);
  const amount=(bag,id)=>Number.isSafeInteger(bag?.[id])?Math.max(0,bag[id]):0;
  const active=()=>!!V.state&&V.Game.mode==='explore'&&!B.active&&!V.SceneEditor?.active;
  const originalStats=P.stats.bind(P),originalTeamStats=T.stats.bind(T),originalIcon=P.icon.bind(P);
  const bases=new WeakMap(),normalized=new WeakSet();
  function data(a=P.ensure()){
    if(!a)return null;
    if(!isRecord(a.combatGear)||a.combatGear.version!==1)a.combatGear={version:1,loadouts:{},wins:0};
    const g=a.combatGear;
    if(!normalized.has(g)){
      const loadouts={},taken={};
      for(const [member,current] of Object.entries(g.loadouts||{})){
        if(!/^[a-z0-9-]{1,64}$/i.test(member)||!isRecord(current))continue;
        const fit={};
        for(const slot of Object.keys(slots)){
          const id=current[slot],item=items.get(id);
          if(item?.slot!==slot||slot==='offhand'&&items.get(fit.weapon)?.hands!==1||amount(a.inventory,id)<=(taken[id]||0))continue;
          fit[slot]=id;taken[id]=(taken[id]||0)+1;
        }
        if(Object.keys(fit).length)Object.defineProperty(loadouts,member,{value:fit,writable:true,enumerable:true,configurable:true});
      }
      g.loadouts=loadouts;
      g.wins=Number.isSafeInteger(g.wins)&&g.wins>=0?g.wins:0;
      normalized.add(g);
    }
    return g;
  }
  function roster(){
    if(!V.state)return [];
    const second=V.DuoWorld?.enabled()?V.DuoWorld.actors.map(actor=>actor.character):[];
    return [...new Set([V.state.character,...second,...T.unlocked()])];
  }
  const memberName=id=>id===V.state.character?V.state.name:(V.content.characters[id]?.name||id.replaceAll('-',' '));
  function loadout(member,a=P.ensure()){
    const g=data(a);
    return g&&Object.hasOwn(g.loadouts,member)?g.loadouts[member]:{};
  }
  function inUse(id,a=P.ensure()){
    const g=data(a);
    return g?Object.values(g.loadouts).filter(gear=>Object.values(gear).includes(id)).length:0;
  }
  function apply(base,gear){
    const stats={...base};
    for(const id of Object.values(gear)){
      for(const [key,n] of Object.entries(items.get(id)?.stats||{})){
        stats[key]=Math.max(1,(stats[key]||0)+n);
      }
    }
    return stats;
  }
  function withoutCoat(base,a){
    const coat=D.items[a.equipped?.clothing]?.stats;
    if(!coat)return base;
    const stats={...base};
    for(const [key,value] of Object.entries(coat))stats[key]=(stats[key]||0)-value;
    return stats;
  }
  function refresh(a,member){
    if(member===V.state.character){
      const stats=P.stats(a);
      a.health=Math.min(a.health??stats.health,stats.health);
      a.focus=Math.min(a.focus??stats.focus,stats.focus);
    }
    V.Save.save();P.hud();
  }
  function blocked(member,slot,id,a=P.ensure()){
    const item=items.get(id),gear=loadout(member,a);
    if(!active())return 'Troque entre combates.';
    if(!Object.hasOwn(slots,slot)||item?.slot!==slot||!roster().includes(member))return 'Equipamento incompatível.';
    if(gear[slot]===id)return 'Já equipado.';
    if(slot==='offhand'&&items.get(gear.weapon)?.hands!==1)return 'Equipe uma arma de uma mão.';
    if(amount(a.inventory,id)<=inUse(id,a))return 'Todas as cópias da mochila estão equipadas.';
    return '';
  }
  function equip(member,slot,id){
    const a=P.ensure();
    if(blocked(member,slot,id,a))return false;
    const gear={...loadout(member,a),[slot]:id};
    if(slot==='weapon'&&items.get(id).hands===2)delete gear.offhand;
    data(a).loadouts[member]=gear;
    refresh(a,member);
    return true;
  }
  function remove(member,slot){
    if(!active()||!roster().includes(member)||!Object.hasOwn(slots,slot))return false;
    const a=P.ensure(),gear=loadout(member,a);
    if(!gear[slot])return false;
    delete gear[slot];
    if(slot==='weapon')delete gear.offhand;
    refresh(a,member);
    return true;
  }
  function icon(id){
    const item=items.get(id);
    if(!item)return originalIcon(id,40);
    const x=(item.art%4)*100/3,y=Math.floor(item.art/4)%3*50;
    return `<span aria-hidden="true" class="gear-art" data-gear-sheet="${item.art<12?1:2}" style="--gear-x:${x}%;--gear-y:${y}%"></span>`;
  }
  P.icon=function(id,size){return items.has(id)?icon(id):originalIcon(id,size);};
  P.stats=function(a=this.ensure()){
    const base=originalStats(a),gear=loadout(V.state?.character,a);
    if(!a||!Object.keys(gear).length)return base;
    const stats=apply(gear.chest?withoutCoat(base,a):base,gear);
    bases.set(stats,base);
    return stats;
  };
  T.stats=function(member,base){
    const a=P.ensure(),gear=loadout(member,a),raw=bases.get(base)||base;
    const stats=originalTeamStats(member,gear.chest&&a?withoutCoat(raw,a):raw);
    return Object.keys(gear).length?apply(stats,gear):stats;
  };
  const spend=P.remove.bind(P);
  P.remove=function(id,count=1){
    const a=P.ensure();
    if(items.has(id)&&amount(a?.inventory,id)-inUse(id,a)<count)return false;
    return spend(id,count);
  };

  const roll=(key,index)=>{
    let n=2166136261;
    for(const c of key+'|'+index)n=Math.imul(n^c.charCodeAt(0),16777619);
    n=Math.imul(n^(n>>>16),0x7feb352d);
    n=Math.imul(n^(n>>>15),0x846ca68b);
    return ((n^(n>>>16))>>>0)/4294967296;
  };
  const supplies=['water','tea','kit',...Object.keys(consumables)];
  const pools=grades.map((_,tier)=>[...items.values()].filter(item=>item.tier===tier));
  function drops(battle,progress,wins){
    const expedition=battle.expedition,trail=expedition?.infinity,depth=trail?.depth||0;
    const guardian=trail?depth%5===0&&battle.enemies.some(enemy=>enemy.boss||enemy.enemy==='stag'):battle.enemies.some(enemy=>enemy.boss);
    const difficulty=trail?.difficulty==='hard'?3:trail?.difficulty==='normal'?1:0;
    const key=[battle.key,expedition?.id,depth,trail?.slot,trail?V.state.infinityTrails?.run?.seed:0].join(':');
    const loot={[supplies[Math.floor(roll(key,0)*(guardian||depth>4?supplies.length:4))]]:1};
    if(!wins)return {...loot,'gear-baton':1,'gear-round':1};
    if(guardian||roll(key,1)<.55+difficulty*.09){
      const strength=depth?Math.min(25,depth)+difficulty:expedition?guardian?13:6:battle.id*3;
      const chance=roll(key,2);
      const tier=strength>=12&&chance<(guardian?.52:.31)?2:strength>=4&&chance<.8?1:0;
      const pool=pools[tier],available=pool.filter(item=>!amount(progress.inventory,item.id)&&!amount(progress.storage,item.id));
      const options=available.length&&roll(key,4)<.8?available:pool;
      loot[options[Math.floor(roll(key,3)*options.length)].id]=1;
    }
    return loot;
  }

  // Use the same claim and save as the ordinary XP reward, including trail wins.
  let resultBattle=null;
  const result=B.result.bind(B),reward=P.reward.bind(P);
  B.result=function(type){
    const previous=resultBattle,a=this.active;
    resultBattle=type==='victory'&&a&&!a.rewarded&&!a.practice&&!['victory','defeat','retreat','returned'].includes(a.phase)?a:null;
    try{return result(type);}finally{resultBattle=previous;}
  };
  const rewardKey=battle=>{
    const e=battle.expedition,t=e?.infinity;
    return t?'infinity-win-'+t.serial+'-'+t.depth+'-'+t.slot:e?'forest-'+e.serial+'-'+e.site:'battle-'+battle.key;
  };
  P.reward=function(key,xp,original={}){
    const battle=resultBattle;
    if(!battle||battle.gearLoot||key!==rewardKey(battle))return reward(key,xp,original);
    const a=P.ensure(),g=data(a),extra=drops(battle,a,g.wins);
    const merged={...original};
    for(const [id,count] of Object.entries(extra))merged[id]=(merged[id]||0)+count;
    const saved=Object.fromEntries(Object.keys(extra).map(id=>[id,amount(a.inventory,id)]));
    if(!reward(key,xp,merged))return false;
    g.wins++;
    battle.gearLoot=Object.entries(extra).map(([id,count])=>({
      id,count,stored:Math.min(count,Math.max(0,count-(amount(a.inventory,id)-saved[id])))
    }));
    return true;
  };

  V.CombatGear={slots,items,grades,active,roster,memberName,loadout,inUse,blocked,equip,remove,statText,subtitle,icon};
});
