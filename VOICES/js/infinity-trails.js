/* Registered module: infinity-trails */
(function(init){if(window.VoicesModules)window.VoicesModules.define('infinity-trails',init);else init();})(function(){
  'use strict';
  const V=window.V,W=V.World,C=V.Cozy,P=V.Progress,F=V.FastTravel,rooms=V.InfinityTrailRooms;
  const {map,title,modes}=rooms,forest=V.FragmentData.map,T=48;
  const gatePoint={x:34*T,y:4.2*T},esc=V.escape;
  const tiers=Object.keys(modes);
  const positive=value=>Number.isSafeInteger(value)&&value>0;
  const validRun=r=>r&&positive(r.serial)&&positive(r.depth)&&Number.isInteger(r.seed)
    &&r.seed>=0&&r.seed<=4294967295&&tiers.includes(r.difficulty)
    &&Array.isArray(r.cleared)&&r.cleared.length<=4&&r.cleared.every(slot=>Number.isInteger(slot)&&slot>=0&&slot<4);
  const btn=(id,name,primary=false)=>`<button type="button" id="${id}" class="${primary?'primary':'secondary'}">${name}</button>`;
  function state(){
    if(!V.state)return null;
    const current=V.state.infinityTrails;
    if(current?.version===1&&current.best&&Number.isSafeInteger(current.serial)&&current.serial>=0){
      if(current.run&&!validRun(current.run))current.run=null;
      return current;
    }
    return V.state.infinityTrails={version:1,serial:0,best:{},run:null};
  }
  const atForest=()=>W.current?.id===forest&&V.FragmentForest.available()&&V.Game.mode==='explore'&&!V.Combat.active;
  const exploring=()=>W.current?.id===map&&V.Game.mode==='explore'&&!V.Combat.active;
  const activeRoom=()=>W.current?.id===map?W.current.infinity:null;
  const openPack=(o,run)=>!run?.cleared.includes(o.slot);
  const remaining=(room=activeRoom())=>room?.packs.filter(o=>openPack(o,V.state?.infinityTrails?.run))||[];
  function modal(name,sub,body,actions){
    V.UI.modal(name,sub,body,actions,true);
    V.$('.modal')?.classList.add('infinity-trail-modal');
  }
  function refresh(room=activeRoom()){
    if(!room)return;
    const count=remaining(room).length;
    room.next.label=count?'Passagem selada · '+count+' encontro(s)':'Avançar para a próxima sala';
    W.nearest=null;V.ObjectiveGuide.invalidate();
  }
  function movePlayer(to,position){
    V.UI.close();
    V.Cozy.playerStand();
    V.Input.clear();
    W.load(to,position);
    return W.current?.id===to;
  }
  function travel(to,position){
    const duo=V.DuoWorld;
    if(!duo?.enabled()||duo.actors.length!==2||to!==map&&!duo.actors.every(actor=>actor.map===map)){
      return movePlayer(to,position);
    }
    const first=duo.context===1?1:0;
    if(!duo.withActor(first,()=>movePlayer(to,position)))return false;
    const {x,y}=duo.actors[first].data;
    const second=V.Rooms.safe(W.maps[to],{x:x+50,y},14);
    return duo.withActor(1-first,()=>movePlayer(to,second));
  }
  function returnPosition(){
    const m=W.maps[forest],gate=m?.objects.find(o=>o.id==='infinity-entrance')||gatePoint;
    return m?V.Rooms.safe(m,{x:gate.x,y:gate.y+58},14):null;
  }

  const guidePages=[
    ['Raiz e o arco vivo','A história da entrada',
      '<p>Um leão de juba verde empurra uma folha para fora do arco. É Raiz. Ele guardava o antigo acampamento até o dia em que as árvores começaram a mudar de lugar. Hoje, suas pegadas indicam por onde voltar.</p><p>Escolha <b>Fácil, Médio ou Difícil</b> no arco do nordeste da Floresta do Fragmento Histórico. Cada sala gera outro caminho, com diferentes biomas e inimigos que acompanham seu nível, seus atributos e sua equipe.</p>'],
    ['Abra caminho pela floresta','Combates, saídas e descanso',
      '<ul><li>Aproxime-se de um grupo e use <b>E</b> ou toque em <b>Interagir</b>. Veja os adversários e edite a equipe antes da luta.</li><li>Vença todos os grupos para abrir o arco seguinte. A seta do <b>guia de caminho</b> aponta para o próximo encontro ou saída.</li><li>A cada cinco salas, derrote um guardião e os outros grupos para poder usar a nascente de descanso.</li><li>Use o arco de entrada da sala para pausar e voltar à floresta. Retome pela entrada com a sala e os grupos vencidos guardados.</li></ul>'],
    ['Faça amizade com as companhias','Equipe e desbloqueios',
      '<p>Raiz se oferece para acompanhar você. Em <b>Personagem → Formação → Companhia animal</b>, escolha um animal, veja sua história, teste seus movimentos e troque o vínculo entre lutas.</p><p>Durante o combate, abra <b>Apoio</b> para usar o poder do animal vinculado. Ele consome uma carga. Vença três encontros das Trilhas com o mesmo animal para ganhar uma carga extra por combate.</p><p>Concluir as salas 5, 10, 15, 20 e 25 abre novos vínculos. As descobertas na Floresta do Fragmento Histórico também liberam animais.</p>']
  ];

  const trails=V.InfinityTrails={
    map,title,state,
    menu(){
      if(!atForest())return false;
      const s=state(),run=s.run;
      const cards=tiers.map(key=>{
        const mode=modes[key],best=positive(s.best[key])?s.best[key]:0;
        return `<button type="button" class="infinity-tier" data-infinity-tier="${key}"><strong>${mode.name}</strong><span>${mode.description}</span><small>${best?'Recorde · '+best+' sala(s)':'Nenhuma sala concluída'}</small></button>`;
      }).join('');
      const duoNote=V.DuoWorld?.enabled()?'<p>A dupla avança junta pelas salas e compartilha a expedição.</p>':'';
      const resume=run?`<p class="infinity-resume"><strong>Trilha em andamento</strong><span>Sala ${run.depth} · ${modes[run.difficulty].name}</span></p>`:'';
      modal(title,'Entrada no canto nordeste da Floresta do Fragmento Histórico',
        `<div class="infinity-banner"></div><p>Escolha a dificuldade da expedição. Derrote os grupos de cada sala para abrir a próxima passagem. Os inimigos acompanham seu nível, seus atributos e o tamanho da equipe. A cada cinco salas, um guardião protege uma nascente de descanso.</p>${duoNote}${resume}<div class="infinity-tiers">${cards}</div>`,
        (run?btn('infinity-resume','Retomar trilha',true):'')+btn('infinity-guide','Guia das Trilhas'));
      V.$('#infinity-guide').onclick=()=>this.guide(0,false,()=>this.menu());
      for(const button of V.$$('[data-infinity-tier]'))button.onclick=()=>{
        const key=button.dataset.infinityTier;
        if(state().run)V.UI.confirm('Começar outra trilha?','A nova expedição substitui a sala salva. Os recordes e as recompensas recebidas ficam no seu progresso.',()=>this.start(key));
        else this.start(key);
      };
      if(run)V.$('#infinity-resume').onclick=()=>this.resume();
      return true;
    },
    guide(index=0,intro=false,back=()=>V.UI.close()){
      const s=state();
      if(!s)return;
      const [name,sub,body]=guidePages[index],last=index===guidePages.length-1;
      const complete=link=>{
        if(intro&&link)V.FragmentForest.equip(V.TrailCompanions.list[0].id);
        back();
      };
      modal(name,sub,
        `<div class="infinity-banner"></div><section class="infinity-guide-content"><p class="infinity-guide-step">Guia das Trilhas · ${index+1} / ${guidePages.length}</p>${body}</section>`,
        (intro?btn('infinity-guide-skip',last?'Explorar agora':'Pular tutorial'):btn('infinity-guide-close','Fechar guia'))
        +(index?btn('infinity-guide-back','Anterior'):'')
        +btn('infinity-guide-next',last?(intro?'Vincular Raiz e explorar':'Concluir'):'Próximo',true));
      const previous=V.$('#infinity-guide-back');
      if(previous)previous.onclick=()=>this.guide(index-1,intro,back);
      V.$(intro?'#infinity-guide-skip':'#infinity-guide-close').onclick=()=>complete(false);
      V.$('#infinity-guide-next').onclick=()=>last?complete(intro):this.guide(index+1,intro,back);
      if(intro){
        const close=V.$('.close-modal');
        if(close)close.onclick=()=>complete(false);
      }
    },
    firstGuide(){
      const s=state();
      if(!s||s.guideSeen||!exploring()||V.MapAssets.busy||V.modal||V.Dialogue.active||V.SceneEditor.active)return false;
      s.guideSeen=true;
      V.Save.save();
      this.guide(0,true);
      return true;
    },
    start(key,seed=Math.floor(Math.random()*4294967296)){
      if(!atForest()||!tiers.includes(key))return false;
      const s=state();
      s.run={serial:++s.serial,seed:seed>>>0,difficulty:key,depth:1,cleared:[],rested:false,position:null};
      return this.resume();
    },
    resume(){
      const run=state()?.run;
      if(!atForest()||!run)return false;
      const s=state(),ok=travel(map,run.position);
      if(ok&&!s.guideSeen)V.MapAssets.whenReady().then(()=>{if(V.state?.infinityTrails===s)this.firstGuide();});
      return ok;
    },
    inspect(o){
      const run=state()?.run,room=activeRoom();
      if(!exploring()||!run||!room?.packs.includes(o)||!openPack(o,run))return;
      const list=o.foes.map(id=>{
        const e=rooms.lookup(id);
        return `<article>${V.FragmentArt.tile(e.sheet||'creatures',e.art,'fragment-foe-art')}<strong>${esc(e.name)}</strong></article>`;
      }).join('');
      modal(o.guardian?'Guardião da trilha':o.primary.name,
        `Sala ${run.depth} · ${room.biome.name} · ${modes[run.difficulty].name}`,
        `<p>${esc(o.primary.tip)}</p><div class="fragment-foe-list">${list}</div><p class="fragment-gain">+${o.xp} XP · +${o.shards} fragmento(s) se vencer</p>`,
        btn('infinity-edit','Editar equipe')+btn('infinity-fight','Enfrentar',true));
      V.$('#infinity-edit').onclick=()=>V.Team.panel('lineup',V.state.character,()=>this.inspect(o));
      V.$('#infinity-fight').onclick=()=>this.fight(o);
    },
    fight(o){
      const run=state()?.run,room=activeRoom();
      if(!exploring()||!run||!room?.packs.includes(o)||!openPack(o,run))return false;
      return V.Combat.begin(1,V.settings.assist,{expedition:{
        id:'infinity-'+run.serial+'-'+run.depth+'-'+o.slot,serial:run.serial,site:'infinity-'+run.depth+'-'+o.slot,
        title:(o.guardian?'Guardião':'Trilhas do Infinito')+' · Sala '+run.depth,foes:o.foes,xp:o.xp,shards:o.shards,
        arena:room.biome.arena,tint:room.biome.veil,
        infinity:{serial:run.serial,depth:run.depth,difficulty:run.difficulty,slot:o.slot}
      }});
    },
    finishFight(battle){
      const s=state(),run=s?.run,details=battle.expedition?.infinity;
      if(!run||!details||details.serial!==run.serial||details.depth!==run.depth||details.difficulty!==run.difficulty)return false;
      const room=W.maps[map]?.infinity;
      if(battle.origin?.map!==map||room?.depth!==run.depth)return false;
      const pack=room.packs.find(o=>o.slot===details.slot);
      if(!pack||!openPack(pack,run))return false;
      const animals=V.TrailCompanions;
      const unlocked=new Set(animals.list.filter(item=>animals.known(item)).map(item=>item.id));
      run.cleared.push(pack.slot);
      animals.win(battle.spirit);
      const key='infinity-win-'+run.serial+'-'+run.depth+'-'+pack.slot;
      P.reward(key,pack.xp,{fragments:pack.shards,...(pack.guardian?{water:1,tea:1}:{})});
      // The saved pack state prevents duplicate payouts without an ever-growing reward log.
      delete P.ensure().ledger[key];
      battle.rewardXP=pack.xp;battle.rewardShards=pack.shards;
      if(!remaining(room).length){
        s.best[run.difficulty]=Math.max(positive(s.best[run.difficulty])?s.best[run.difficulty]:0,run.depth);
        for(const item of animals.list.filter(item=>!unlocked.has(item.id)&&animals.known(item))){
          V.UI.toast(item.name+' disponível em Companhia animal.');
        }
      }
      refresh(room);
      return true;
    },
    advance(){
      const run=state()?.run;
      if(!exploring()||!run||remaining().length)return false;
      run.depth++;run.cleared=[];run.rested=false;run.position=null;
      const ok=travel(map);
      if(ok)V.UI.toast(activeRoom().biome.name+' · Sala '+run.depth);
      return ok;
    },
    rest(){
      const run=state()?.run;
      if(!exploring()||!run||!activeRoom()?.elite||run.rested||remaining().length)return false;
      run.rested=true;
      const progress=P.ensure(),stats=P.stats();
      progress.health=stats.health;
      progress.focus=stats.focus;
      progress.overload=Math.max(0,progress.overload-20);
      V.Save.save();
      P.hud();
      V.UI.toast('Nascente de descanso · vida e foco recuperados.');
      return true;
    },
    leave(end=false){
      if(!exploring()||!state()?.run)return false;
      if(end)state().run=null;
      return travel(forest,returnPosition());
    },
    leaveMenu(){
      const run=state()?.run;
      if(!run||!exploring())return;
      modal('Retorno à floresta','Sala '+run.depth+' · '+modes[run.difficulty].name,
        '<p>Pause para retomar nesta sala pela entrada da floresta ou encerre esta expedição.</p>',
        btn('infinity-guide','Guia das Trilhas')+btn('infinity-end','Encerrar trilha')+btn('infinity-pause','Pausar e voltar à floresta',true));
      V.$('#infinity-guide').onclick=()=>this.guide(0,false,()=>this.leaveMenu());
      V.$('#infinity-pause').onclick=()=>this.leave();
      V.$('#infinity-end').onclick=()=>V.UI.confirm('Encerrar esta trilha?','Ao entrar novamente, você poderá começar uma nova expedição. Os recordes e as recompensas já recebidas ficam guardados.',()=>this.leave(true));
    }
  };

  function seedEntrance(){
    const m=W.maps[forest];
    if(!m||m.objects.some(o=>o.id==='infinity-entrance'))return;
    const position=V.Rooms.safe(m,gatePoint,18);
    m.objects.push({type:'infinity-trail',kind:'entry',id:'infinity-entrance',to:map,prop:3,
      label:'Entrar nas Trilhas do Infinito',interactionRange:94,...position});
    for(const [dx,dy,prop,size] of [[-136,-5,2,205],[135,7,0,214],[-106,72,11,86],[106,82,5,92],[-201,18,0,184],[86,-42,2,177]]){
      m.decor.push({x:position.x+dx-size/2,y:position.y+dy-size,size,prop,family:'trail-props'});
    }
  }

  V.Hooks.around(W,'init','infinity-trails:entrance',next=>function(...args){
    const result=next(...args);
    seedEntrance();
    return result;
  });
  const load=W.load.bind(W);
  let generatedFor=null;
  W.load=function(id,position,...args){
    if(id!==map){
      const run=V.state?.infinityTrails?.run,p=V.Player.data;
      if(W.current?.id===map&&validRun(run)&&Number.isFinite(p?.x)&&Number.isFinite(p?.y))run.position={x:p.x,y:p.y};
      return load(id,position,...args);
    }
    const run=state()?.run;
    if(!run||!V.FragmentForest.available())return load(forest,returnPosition(),...args);
    let m=W.maps[map];
    const key=run.serial+'-'+run.depth+'-'+run.seed;
    if(generatedFor!==V.state||m?.geometryRevision!==key){
      m=W.maps[map]=rooms.build(run);
      generatedFor=V.state;
      V.Atlas.cache.delete(map);V.ObjectiveGuide.invalidate();
    }
    const spawn=position&&F.clear(m,position,14)?position:m.spawnPoint;
    const result=load(map,spawn,...args);
    refresh();
    return result;
  };
  F.names[map]=title;
  const root=F.root.bind(F),travelStatus=F.status.bind(F),waypoint=F.point.bind(F);
  F.root=id=>id===map?forest:root(id);
  F.status=id=>id===map?{allowed:false,label:'Entrada pela floresta',reason:'Entre pelo arco de raízes no canto nordeste da Floresta do Fragmento Histórico.'}:travelStatus(id);
  F.point=id=>id===map?null:waypoint(id);

  const update=W.update.bind(W);
  W.update=function(dt){
    const run=V.state?.infinityTrails?.run;
    if(run&&this.current?.id===map&&!V.state.infinityTrails.guideSeen&&trails.firstGuide())return;
    if(run&&activeRoom()&&!V.settings.reducedMotion)for(const o of remaining()){
      o.anchorX??=o.x;
      const x=o.anchorX+Math.sin(V.Engine.time*.8+o.phase)*o.patrol;
      if(!W.collides(x,o.y,12))o.x=x;
    }
    return update(dt);
  };
  const interactables=W.interactables.bind(W);
  W.interactables=function(){
    const result=interactables();
    if(W.current?.id!==map)return result;
    const run=V.state?.infinityTrails?.run;
    return result.filter(o=>o.kind!=='pack'||openPack(o,run));
  };
  V.Hooks.around(V.Game,'interact','infinity-trails:interact',next=>function(o){
    if(o?.type!=='infinity-trail')return next(o);
    if(this.mode!=='explore'||V.Combat.active||V.modal||V.Dialogue.active||!W.current?.objects.includes(o))return;
    if(o.kind==='entry')return trails.menu();
    if(o.kind==='return')return trails.leaveMenu();
    if(o.kind==='pack')return trails.inspect(o);
    if(o.kind==='rest'){
      if(!trails.rest())V.UI.toast(remaining().length?'Vença todos os encontros para usar a nascente.':'A nascente desta sala já foi usada.');
      return;
    }
    if(o.kind==='next'&&!trails.advance())V.UI.toast('Derrote os '+remaining().length+' encontro(s) restantes para abrir a passagem.');
  });
  const guide=V.ObjectiveGuide,objective=guide.objective.bind(guide);
  guide.objective=function(){
    const room=activeRoom(),player=V.Player.data;
    if(!room||!player)return objective();
    const packs=remaining().sort((a,b)=>V.dist(a,player)-V.dist(b,player));
    const object=packs[0]||room.next;
    return {map,object,key:map+'-'+room.depth+'-'+object.id,label:object.label};
  };
  const assetGroups=V.MapAssets.groups.bind(V.MapAssets);
  V.MapAssets.groups=function(m){
    const groups=assetGroups(m);
    if(!m?.infinity)return groups;
    const scenery=m.decor.map(o=>o.family).filter(V.FragmentArt.isTrailDecor);
    return [...new Set([...groups,...scenery])];
  };
  const ground=C.ground.bind(C),prop=C.prop.bind(C),draw=C.drawObject.bind(C);
  C.ground=m=>m.infinity?rooms.ground(m):ground(m);
  C.prop=function(ctx,family,index,x,y,size,...args){
    if(family==='trail-props'||V.FragmentArt.isTrailDecor(family))return V.FragmentArt.draw(ctx,family,index,x+size/2,y+size,size);
    return prop(ctx,family,index,x,y,size,...args);
  };
  C.drawObject=function(ctx,o,cam,...args){
    if(o.type!=='infinity-trail')return draw(ctx,o,cam,...args);
    const run=V.state?.infinityTrails?.run;
    if(o.kind==='pack'&&!openPack(o,run))return;
    const x=o.x-cam.x,y=o.y-cam.y;
    if(x<-170||y<-95||x>ctx.canvas.width+170||y>ctx.canvas.height+180)return;
    const isPack=o.kind==='pack',isRest=o.kind==='rest',size=isPack?(o.guardian?125:91):isRest?93:167;
    const lock=o.kind==='next'&&remaining().length>0;
    const tint=isPack?(o.guardian?'#e9abed':'#f8ae83'):lock?'#eeb17a':isRest&&run?.rested?'#a0ada5':'#9edcc2';
    V.SceneShadows.contact(ctx,x,y+3,size*.24,size*.055);
    if(isPack){
      const lift=V.settings.reducedMotion?0:Math.sin(V.Engine.time*2.1+o.phase)*2.5;
      V.FragmentArt.draw(ctx,o.primary.sheet||'creatures',o.primary.art,x,y-lift,size);
    }else V.FragmentArt.draw(ctx,'trail-props',o.prop,x,y,size);
    F.diamond(ctx,x,y-size*.74,lock?6:8,tint);
    if(o.kind==='entry'||W.nearest?.id===o.id){
      V.Engine.text(ctx,o.kind==='entry'?title:o.label,x,y+23,'#f3e4b6',12,'center');
    }
  };
  const paint=V.Atlas.paint.bind(V.Atlas);
  V.Atlas.paint=function(canvas,m,opts){
    const result=paint(canvas,m,opts);
    if(!canvas||m?.id!==map&&m?.id!==forest)return result;
    const run=V.state?.infinityTrails?.run,c=canvas.getContext('2d'),p=this.projection(canvas,m);
    for(const o of m.objects.filter(o=>o.type==='infinity-trail'&&(o.kind!=='pack'||openPack(o,run)))){
      F.diamond(c,p.x+o.x*p.scale,p.y+o.y*p.scale,opts?.details?6:4,o.kind==='pack'?'#f8ae83':'#9edcc2');
    }
    return result;
  };
});
