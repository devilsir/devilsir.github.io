/* Registered module: trail-companions */
(function(init){if(window.VoicesModules)window.VoicesModules.define('trail-companions',init);else init();})(function(){
  'use strict';
  const V=window.V,art=V.FragmentArt,forest=V.FragmentForest,esc=V.escape;
  const definitions=V.FragmentData.spirits;
  const lore=[
    ['Leão Raiz','Rugido de Raiz','Proteção',
      'Dá escudo à equipe e atrai ataques para quem chamou o leão.',
      'Raiz guardava o antigo acampamento quando a floresta começou a mudar. Ele reconhece pelo som dos passos quem encontrou o caminho de volta.'],
    ['Lontra do Riacho','Mergulho restaurador','Cura',
      'Remove condições negativas e cura os aliados de pé.',
      'A lontra desobstruiu a nascente quando as raízes desviaram a água. Ela aparece onde a correnteza volta a correr.'],
    ['Pássaro Faísca','Asas da tempestade','Dano elétrico',
      'Atinge o grupo inimigo e aplica eletrificação por 2 turnos.',
      'Faísca aprendeu a seguir a luz dos cristais nas tempestades. Seu chamado avisa quando é seguro sair do abrigo.'],
    ['Raposa Fagulha','Rastro de brasas','Dano de fogo',
      'Atinge o grupo inimigo e aplica queimadura por 2 turnos.',
      'Fagulha guardou a última brasa do antigo acampamento. Sua cauda acende quando alguém volta pela trilha depois de escurecer.'],
    ['Casco de Musgo','Carapaça viva','Escudo e imunidade',
      'Dá escudo à equipe e protege contra condições negativas por 2 turnos.',
      'Casco de Musgo carrega pedras do velho caminho nas costas. Onde ele para para descansar, a vegetação volta a crescer.'],
    ['Mariposa Lamparina','Luz de lembrança','Recuperação de foco',
      'Devolve 18 de foco aos aliados de pé.',
      'Lamparina passava pelas frestas do Arquivo das Raízes. Quando os cadernos foram apagados, iluminou as marcas que ainda restavam no papel.']
  ];
  const list=definitions.map(definition=>{
    const [name,power,role,description,story]=lore[definition.art];
    definition.name=power;definition.description=description;
    return {...definition,name,powerName:power,role,description,story,floor:definition.art*5};
  });
  const clips={idle:'Descanso',walk:'Movimento',cast:'Poder',victory:'Comemoração'};
  const tracks=new WeakMap(),cell=192,atlas='assets/adventure/fragment/trail-companion-motion.webp';
  let sheet;
  const load=V.Assets.load.bind(V.Assets);
  V.Assets.load=async function(...args){
    const ready=new Promise(resolve=>{
      const img=V.Assets.image();
      img.onload=()=>{sheet=img;resolve();};img.onerror=resolve;img.src=atlas;
      V.AssetLoader.register(img,resolve);
    });
    const [result]=await Promise.all([load(...args),ready]);
    return result;
  };

  const animals=V.TrailCompanions={
    list,
    unlockedInTrail(item){
      const s=V.state?.infinityTrails;
      return item.floor?Object.values(s?.best||{}).some(depth=>Number.isSafeInteger(depth)&&depth>=item.floor):!!s?.guideSeen;
    },
    known(item){return forest.has(item.unlock)||this.unlockedInTrail(item);},
    requirement(item){
      const site=forest.marks[item.unlock].toLowerCase();
      const trail=item.floor?'Conclua a sala '+item.floor+' das Trilhas':'Conheça Raiz no tutorial das Trilhas';
      return trail+' ou faça a descoberta “'+site+'” na Floresta do Fragmento.';
    },
    bond(id){return V.state?.fragmentForest?.bonds?.[id]||0;},
    win(id){
      if(!list.some(item=>item.id===id)||this.bond(id)>=3)return;
      const state=forest.state();
      (state.bonds||={})[id]=this.bond(id)+1;
      if(state.bonds[id]===3)V.UI.toast('Vínculo fortalecido · +1 carga de Apoio por combate.');
    },
    draw(c,item,x,y,size,clip='idle',t=0,flip=false){
      const still=V.settings.reducedMotion,flying=item.art===2||item.art===5;
      let pose=-1,lift=0,dx=0,scale=1;
      if(clip==='walk'&&!still){
        const step=t*(flying?1.5:1)*2*Math.PI;
        if(Math.sin(step)>0)pose=0;
        lift=Math.abs(Math.sin(step))*size*(flying?.12:.055);
      }else if(clip==='cast'){
        const phase=V.clamp(t,0,1);
        if(still||phase>.21&&phase<.81)pose=1;
        if(!still){
          const push=Math.sin(Math.PI*phase);
          dx=size*.23*push;lift=size*.08*push;scale=1+push*.045;
        }
      }else if(clip==='victory'){
        const jump=still?0:Math.max(0,Math.sin(t*8));
        if(still||jump>.19)pose=2;
        lift=size*.19*jump;
      }else if(!still){
        lift=flying?size*.11+Math.sin(t*4)*size*.045:0;
        scale=1+Math.sin(t*3)*.018;
      }
      c.save();c.translate(Math.round(x+(flip?-dx:dx)),Math.round(y-lift));c.scale(1,scale);
      c.imageSmoothingEnabled=false;
      let painted;
      if(pose>=0&&sheet?.naturalWidth){
        if(flip)c.scale(-1,1);
        c.drawImage(sheet,pose*cell,item.art*cell,cell,cell,-size/2,-size,size,size);
        painted=true;
      }else painted=art.draw(c,'creatures',item.art,0,0,size,flip);
      c.restore();
      return painted;
    },
    follow(c){
      const p=V.Player.data,map=V.World.current;
      if(!p||!map||V.SceneEditor.active||V.Game.mode!=='explore'||(map.id!==V.FragmentData.map&&!map.infinity))return;
      const item=forest.spirit();
      if(!item){tracks.delete(p);return;}
      const time=V.Engine.time,cam=V.World.camera,target=V.FollowerPositions.ground('animal',p,map,8);
      if(!target){tracks.delete(p);return;}
      let track=tracks.get(p);
      if(!track||track.map!==map||track.id!==item.id||V.dist(track,p)>245||V.dist(track,p)<45){
        track={...target,map,id:item.id,time,flip:true,stride:0};
        tracks.set(p,track);
      }
      const dt=V.clamp(time-track.time,0,.1),distance=V.dist(track,target);
      track.time=time;
      const step=distance>5?Math.min(distance,dt*180,distance*dt*10):0;
      let moving=false;
      if(step>0){
        const dx=target.x-track.x,dy=target.y-track.y,x=track.x+dx*step/distance,y=track.y+dy*step/distance;
        if(!V.Living.blocked(map,x,y,8)){
          track.x=x;track.y=y;track.stride+=step/26;moving=true;
          if(Math.abs(dx)>8)track.flip=dx<0;
        }else if(V.dist(track,p)>115)Object.assign(track,target);
      }
      const x=track.x-cam.x,y=track.y-cam.y;
      V.SceneShadows.contact(c,x,y+2,15,4,.25);
      this.draw(c,item,x,y,54,moving?'walk':'idle',moving?track.stride:time,track.flip);
    },
    panel(id){
      const item=list.find(item=>item.id===id)||forest.spirit()||list[0];
      const active=forest.spirit()?.id===item.id,known=this.known(item),wins=this.bond(item.id);
      const editing=V.Game.mode==='explore'&&!V.Combat.active;
      const cards=list.map(animal=>`<button type="button" data-team-animal="${animal.id}" aria-pressed="${animal.id===item.id}" class="fragment-spirit-card"><span>${art.tile('creatures',animal.art,'fragment-spirit-art')}<strong>${esc(animal.name)}</strong></span><small>${forest.spirit()?.id===animal.id?'Vinculado':this.known(animal)?'Disponível':'A desbloquear'}</small></button>`).join('');
      const bond=wins>=3?'Vínculo fortalecido. +1 carga de Apoio por combate.':wins+' / 3 vitórias nas Trilhas com este animal para ganhar +1 carga de Apoio por combate.';
      return `<div class="trail-animal-panel"><div class="trail-animal-cards">${cards}</div><section class="trail-animal-detail">
        <div><canvas id="trail-animal-preview" width="230" height="164" aria-label="Animação de ${esc(item.name)}"></canvas>
          <div class="trail-animal-actions" aria-label="Prévia de movimentos">${Object.entries(clips).map(([clip,label])=>`<button type="button" class="secondary" data-animal-clip="${clip}" aria-pressed="${clip==='idle'}">${label}</button>`).join('')}</div></div>
        <div><small>${esc(item.role)}</small><h3>${esc(item.name)}</h3><p>${esc(item.story)}</p>
          <h4>${esc(item.powerName)}</h4><p>${esc(item.description)} Use em <b>Apoio</b> por 1 carga. Quando vinculado, o animal acompanha você na Floresta do Fragmento e nas Trilhas.</p>
          <p>${esc(known?bond:this.requirement(item))}</p>
          <button type="button" class="${active?'secondary':'primary'}" id="team-animal-toggle" data-id="${item.id}" ${editing&&known?'':'disabled'}>${active?'Desvincular':known?'Vincular companhia':'Companhia bloqueada'}</button>
        </div></section></div>`;
    },
    preview(id){
      const item=list.find(item=>item.id===id),canvas=V.$('#trail-animal-preview');
      if(!item||!canvas)return;
      const c=canvas.getContext('2d'),buttons=V.$$('[data-animal-clip]');
      let clip='idle',start=performance.now();
      for(const button of buttons)button.onclick=()=>{
        clip=button.dataset.animalClip;start=performance.now();
        for(const choice of buttons)choice.setAttribute('aria-pressed',String(button===choice));
      };
      const draw=now=>{
        if(!canvas.isConnected)return;
        const elapsed=Math.max(0,(now-start)/1000),t=clip==='cast'?elapsed%1.4/1.4:elapsed;
        c.clearRect(0,0,canvas.width,canvas.height);
        V.SceneShadows.contact(c,115,144,47,9,.35);
        this.draw(c,item,clip==='walk'&&!V.settings.reducedMotion?115+Math.sin(t*3)*20:115,145,137,clip,t);
        if(clip==='cast')art.spell(c,item.spell,145,87,88,V.settings.reducedMotion?.4:t,1);
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    }
  };

  forest.spirit=function(){
    const selected=V.state?.fragmentForest?.equipped;
    return list.find(item=>item.id===selected&&animals.known(item));
  };
  forest.equip=function(id){
    const item=list.find(item=>item.id===id);
    if(!V.state||V.Game.mode!=='explore'||V.Combat.active||id&&(!item||!animals.known(item)))return false;
    this.state().equipped=id||null;V.Save.save();return true;
  };
  const board=forest.board.bind(forest);
  forest.board=function(...args){
    const result=board(...args);
    for(const b of V.$$('[data-fragment-spirit]')){
      const item=list.find(item=>item.id===b.dataset.fragmentSpirit);
      if(!item)continue;
      b.disabled=!animals.known(item);
      b.querySelector('strong').textContent=item.name;
      b.querySelector('small').textContent=b.disabled?animals.requirement(item):item.description;
    }
    return result;
  };

  const team=V.Team,panel=team.panel.bind(team);
  team.panel=function(tab='lineup',member=V.state?.character,back=null,animalId=null,onPick=null){
    const result=panel(tab==='animal'?'lineup':tab,member,back);
    const modal=V.$('.team-modal'),nav=modal?.querySelector('.character-tabs');
    if(!nav)return result;
    const selected=animalId||forest.spirit()?.id||list[0].id;
    const show=id=>this.panel('animal',member,back,id||selected,onPick);
    const b=document.createElement('button');b.type='button';
    b.innerHTML=V.TurnArt.icon('support')+'Companhia animal';
    b.setAttribute('aria-pressed',String(tab==='animal'));b.onclick=()=>show();nav.append(b);
    const shortcut=V.$('#fragment-companions');
    if(shortcut){shortcut.textContent='Editar companhia animal';shortcut.onclick=()=>show();}
    if(tab!=='animal')return result;
    modal.classList.add('trail-animal-modal');
    const body=modal.querySelector('.modal-body');
    body.replaceChildren(nav);
    body.insertAdjacentHTML('beforeend',animals.panel(selected));
    nav.querySelector('[data-team-tab="lineup"]')?.setAttribute('aria-pressed','false');
    for(const option of body.querySelectorAll('[data-team-animal]'))option.onclick=()=>show(option.dataset.teamAnimal);
    const toggle=body.querySelector('#team-animal-toggle');
    toggle.onclick=()=>{if(forest.equip(forest.spirit()?.id===selected?null:selected)){if(onPick)onPick();else show(selected);}};
    if(back){
      const returnButton=document.createElement('button');
      returnButton.type='button';returnButton.className='secondary';returnButton.textContent='Voltar ao confronto';
      returnButton.onclick=back;body.append(returnButton);
    }
    animals.preview(selected);
    return result;
  };

  const B=V.Combat,prepare=V.FragmentCombat.prepare.bind(V.FragmentCombat);
  V.FragmentCombat.prepare=function(battle){
    prepare(battle);
    if(battle.spirit&&animals.bond(battle.spirit)>=3)battle.supportCharges++;
  };
  const commit=B.commit.bind(B);
  B.commit=function(action,target){
    const result=commit(action,target),battle=this.active;
    if(result&&action.type==='supportAction'&&battle?.visual&&action.id===battle.spirit)battle.visual.animal=true;
    return result;
  };
  const drawCompanion=B.drawBattleCompanion.bind(B);
  B.drawBattleCompanion=function(c,geometry){
    const a=this.active,item=list.find(item=>item.id===a?.spirit);
    if(!item)return drawCompanion(c,geometry);
    const hero=this.position(a.allies[0],geometry),size=geometry.size*(geometry.narrow?.63:.81);
    const x=Math.max(size*.32,hero.x-geometry.size*.75),y=hero.y-geometry.size*.20;
    const cast=!!a.visual?.animal,clip=cast?'cast':a.phase==='victory'?'victory':'idle';
    const time=cast?a.visual.age/a.visual.duration:a.clock;
    V.SceneShadows.contact(c,x,y+3,size*.29,size*.08,.20);
    if(!animals.draw(c,item,x,y+3,size*1.04,clip,time))return drawCompanion(c,geometry);
  };
  const render=V.Player.render.bind(V.Player);
  V.Player.render=function(ctx){animals.follow(ctx);return render(ctx);};
});
