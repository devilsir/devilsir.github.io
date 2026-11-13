/* Registered module: city-battle */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('city-battle', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V,B=V.Combat,P=V.Progress,D=V.AdventureData,A=V.Animations;
  const esc=V.escape,icon=V.TurnArt.icon;
  const terminal=new Set(['victory','defeat','retreat','returned']);
  const commands=[
    ['attack','Atacar','Recupera 6 de foco'],
    ['defend','Defender','Recupera 13 de foco'],
    ['skills','Habilidades','Use foco e ressonância'],
    ['items','Itens','Consumíveis da mochila'],
    ['support','Apoio','Proteção da companhia'],
    ['context','Contexto','Apresente as fontes']
  ];
  const backgrounds=['battle-courtyard','battle-studio','battle-gallery','battle-lab','battle-city','battle-city','battle-archive'];
  const button=(id,symbol,label,extra='')=>{
    const name=extra.includes('aria-label=')?'':'aria-label="'+esc(label)+'"';
    return `<button type="button" id="${id}" ${name} ${extra}>${icon(symbol)}<span>${label}</span></button>`;
  };
  const percent=(value,max)=>V.clamp(value/Math.max(1,max)*100,0,100);
  const meter=(symbol,value,max,kind,label)=>
    `<span class="turn-meter ${kind}" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}">${icon(symbol)}<span class="turn-meter-track"><i style="width:${percent(value,max)}%"></i></span><b>${value}<small>/${max}</small></b></span>`;
  const actionName=action=>B.definition(action)?.name||commands.find(row=>row[0]===action.type)?.[1]||'Ação';

  function mainCommands(a){
    const clickable=a.phase==='command';
    return `<div class="turn-actions">${commands.map(([id,label,hint],i)=>{
      const reason=id==='context'&&clickable?B.availability({type:id}):'';
      const support=clickable&&id==='support'&&(a.supportCharges===0||a.supportCooldown>0);
      const disabled=!clickable||reason||support;
      const caption=reason||(support?(a.supportCooldown?'Recarga '+a.supportCooldown:'Sem cargas'):id==='support'?a.supportCharges+' cargas':hint);
      return `<button type="button" class="turn-action ${id==='attack'?'turn-primary':''}" data-battle-command="${id}" data-turn-focus="command-${id}" title="${esc(caption)}" ${disabled?'disabled':''}>
        ${icon(id)}<span><b>${label}</b><small>${esc(caption)}</small></span><kbd>${i+1}</kbd>
      </button>`;
    }).join('')}</div>`;
  }

  function tray(a,actor){
    const r=P.ensure();
    const kinds={skills:'skill',items:'item',support:'supportAction'};
    const type=kinds[a.menu],list={
      skills:B.skillList(actor),
      items:Object.keys(r.inventory).filter(id=>r.inventory[id]>0&&D.items[id]?.category==='consumable').map(id=>({id,...D.items[id]})),
      support:D.support.filter(entry=>entry.art==null||a.spirit===entry.id)
    }[a.menu];
    const title={skills:'Habilidades',items:'Itens',support:'Apoio'}[a.menu];
    return `<div class="turn-tray"><div class="turn-tray-head"><strong>${title}</strong><button type="button" id="battle-back" data-turn-focus="back">Voltar <kbd>Esc</kbd></button></div>
      <div class="turn-tray-list">${list.map(entry=>{
        const reason=B.availability({type,id:entry.id},actor);
        const cost=type==='skill'?B.skillCost(entry,B.skillRank(entry,actor))+' foco · Recarga '+entry.cooldown:type==='item'?'×'+r.inventory[entry.id]:entry.cost+' carga(s)';
        const art=entry.spell!=null&&V.FragmentArt?V.FragmentArt.tile('spells',entry.spell,'fragment-icon'):type==='supportAction'?icon('support'):Number.isInteger(entry.icon)&&V.Team?.skills.has(entry.id)?V.TeamArt.icon(entry.icon):P.icon(entry.id,29);
        return `<button type="button" data-turn-kind="${type}" data-turn-id="${entry.id}" data-turn-focus="tray-${entry.id}" title="${esc(entry.description||'')}" ${reason?'disabled':''}>
          ${art}<span><b>${esc(entry.name)}</b><small>${esc(reason||cost)}</small></span>
        </button>`;
      }).join('')||'<p>Sem itens disponíveis.</p>'}</div></div>`;
  }

  function targetTray(a){
    return `<div class="turn-tray"><div class="turn-tray-head"><strong>${esc(actionName(a.selectedAction))} · escolha um alvo</strong><button type="button" id="battle-back" data-turn-focus="back">Voltar <kbd>Esc</kbd></button></div>
      <div class="turn-tray-list">${B.targets(a.selectedAction).map(actor=>`<button type="button" data-battle-target="${actor.id}" data-turn-focus="pick-${actor.id}" aria-pressed="${a.selectedTarget===actor.id}">
        ${icon(actor.side==='enemy'?'attack':'health')}<span><b>${esc(actor.name)}</b><small>${actor.health} / ${actor.stats.health} vida</small></span>
      </button>`).join('')}</div></div>`;
  }

  function battleLoot(a){
    // Older saved victories recorded only their additional gear rolls.
    const loot=(a.loot||a.gearLoot||[]).filter(item=>Object.hasOwn(D.items,item.id)&&item.count>0);
    if(!loot.length)return '';
    return `<section class="gear-drops" aria-label="Itens recebidos"><h3>Itens recebidos</h3><ul tabindex="0">${loot.map(({id,count,stored})=>{
      const destination=D.items[id].unique?'No arquivo':stored===count?'No depósito':stored?(count-stored)+' na mochila · '+stored+' no depósito':'Na mochila';
      return `<li data-battle-loot="${esc(id)}">${P.icon(id,32)}<span><b>${esc(D.items[id].name)}</b><small>${destination}</small></span><strong aria-label="Quantidade: ${count}">×${count}</strong></li>`;
    }).join('')}</ul></section>`;
  }

  function prompt(a,actor){
    if(a.phase==='intro')return `<div class="turn-prompt"><p>${esc(a.enemies[0].tip)}</p><div>
      ${button('battle-start','attack','Iniciar confronto','class="turn-primary" data-turn-focus="start"')}
      ${button('battle-start-auto','auto','Iniciar automático','data-turn-focus="start-auto"')}
    </div></div>`;
    if(terminal.has(a.phase)){
      const title=a.phase==='victory'?(a.contextualized?'As fontes desfizeram a rasura.':'A manifestação perdeu sua força.'):a.phase==='defeat'?'A equipe recuou.':'A equipe está em segurança.';
      const won=a.phase==='victory';
      const xp=won&&a.rewardXP>0?' · +'+a.rewardXP+' XP':'';
      const legacyFragments=won&&!a.loot&&a.rewardShards?' · +'+a.rewardShards+' fragmento(s)':'';
      const loot=won?battleLoot(a):'';
      return `<div class="turn-prompt turn-result${loot?' has-loot':''}">
        <p><strong>${title}</strong>${xp}${legacyFragments}</p>
        ${loot|| (won&&a.practice?'<p>Treino concluído.</p>':'')}
        <div class="turn-result-actions">
          ${a.phase==='defeat'?button('battle-retry','health','Tentar novamente','class="turn-primary" data-turn-focus="retry"'):''}
          ${button('battle-finish','track',won?'Continuar investigação':'Voltar à exploração','data-turn-focus="finish"')}
        </div>
      </div>`;
    }
    if(a.phase==='target')return targetTray(a);
    if(a.phase==='command'&&a.menu!=='main')return tray(a,actor);
    return mainCommands(a);
  }

  function portrait(actor){
    return V.FragmentArt?.portrait(actor.character)||`<canvas class="turn-face" width="48" height="48" data-turn-portrait="${esc(actor.character)}" aria-hidden="true"></canvas>`;
  }

  function team(a){
    return `<div class="turn-team ${a.allies.length>3?'turn-team-expanded':''}" aria-label="Equipe">${a.allies.map(actor=>{
      const targetable=a.phase==='target'&&B.targets(a.selectedAction).includes(actor);
      const picked=(a.phase==='target'?a.selectedTarget:a.aimTarget)===actor.id;
      const statuses=B.statusText(actor);
      const role=V.Team?.kits[actor.character]?.role;
      return `<div class="turn-member ${actor.id===a.actor?'is-current':''}" title="${esc([actor.name,role,statuses].filter(Boolean).join(' · '))}">
        ${portrait(actor)}<div><b>${esc(actor.name)}${actor.shield?` <small title="Escudo">${icon('defend')}${actor.shield}</small>`:''}</b>
        ${meter('health',actor.health,actor.stats.health,'health','Vida')}${meter('focus',actor.focus,actor.stats.focus,'focus','Foco')}${V.FragmentArt?.conditions(actor)||''}</div>
        ${targetable?`<button type="button" class="turn-ally-pick" data-battle-target="${actor.id}" data-turn-focus="ally-${actor.id}" aria-pressed="${picked}" aria-label="Escolher ${esc(actor.name)}"></button>`:''}
      </div>`;
    }).join('')}</div>`;
  }

  function turnOrder(a){
    if(!a.order.length)return '';
    const i=Math.max(0,a.turnIndex),order=[...a.order.slice(i),...a.order.slice(0,i)];
    return `<ol class="turn-order" aria-label="Ordem dos turnos">${order.map(id=>B.get(id)).filter(actor=>actor?.health>0).map(actor=>
      `<li class="${actor.side} ${actor.id===a.actor?'is-current':''}" ${actor.id===a.actor?'aria-current="step"':''}>${icon(actor.side==='enemy'?'attack':'health')}<span>${esc(actor.name)}</span></li>`).join('')}</ol>`;
  }

  function hitboxes(a){
    const targets=B.targets(a.selectedAction);
    return `<div class="turn-hitboxes">${B.all().filter(actor=>actor.health>0||targets.includes(actor)).map(actor=>{
      const enemy=actor.side==='enemy';
      const picked=(a.phase==='target'?a.selectedTarget:a.aimTarget)===actor.id;
      const canPick=a.phase==='target'?targets.includes(actor):a.phase==='command'&&enemy;
      return `<button class="turn-hit ${enemy?'enemy':'ally'}" type="button" data-turn-hit="${actor.id}" data-turn-focus="field-${actor.id}"
        aria-label="${esc(actor.name)}, ${actor.health} de ${actor.stats.health} de vida" aria-pressed="${picked}" ${canPick?'':'disabled'}>
        ${enemy?`<span class="turn-enemy-name"><b>${esc(actor.name)}</b><span class="turn-enemy-track"><i style="width:${percent(actor.health,actor.stats.health)}%"></i></span>
          <small>${actor.health}/${actor.stats.health}${actor.shield?` · ${icon('defend')}${actor.shield}`:''}</small>${V.FragmentArt?.conditions(actor)||''}</span>`:''}
      </button>`;
    }).join('')}</div>`;
  }

  function paintPortraits(root){
    for(const canvas of root.querySelectorAll('[data-turn-portrait]'))V.UI.drawPortrait(canvas,canvas.dataset.turnPortrait);
  }

  B.ui=function(){
    const a=this.active,root=V.$('#battle-root');
    if(!a||!root)return;
    const actor=this.get(a.actor),r=P.ensure();
    const focus=root.contains(document.activeElement)?document.activeElement.dataset.turnFocus:null;
    const enemy=(actor?.side==='enemy'&&actor.health>0?actor:null)||a.enemies.find(item=>item.health>0);
    const label={
      intro:'Escolha como começar',command:'Vez de '+(actor?.name||'sua equipe'),
      target:'Escolha o alvo',enemy:'Vez de '+(actor?.name||'Rasura'),
      victory:'Vitória',defeat:'Derrota',retreat:'Recuo'
    }[a.phase]||'Ação em andamento';
    const canAuto=!terminal.has(a.phase),suggested=this.suggestion();
    const target=suggested?.target?this.get(suggested.target):null;
    const suggestedLabel=suggested?esc(actionName(suggested.action)+(target?' · '+target.name:'')):'';
    const shown=a.phase==='command'&&a.menu==='main';
    const battleText=a.log.at(-1)||'';
    root.classList.add('battle-console');
    root.dataset.phase=a.phase;
    root.dataset.auto=a.auto?'on':'off';
    root.innerHTML=`<header class="turn-top">
      <div class="turn-heading"><small>${a.intro?'Primeira Vigília':a.expedition?esc(a.expedition.title):'Confronto · Capítulo '+a.id}${a.round?' · Rodada '+a.round:''}</small><strong title="${esc(label)}">${esc(label)}</strong></div>
      <div class="turn-tools">
        ${canAuto?button('battle-auto','auto',a.auto?'Auto ligado':'Automático',`aria-pressed="${!!a.auto}" title="Alternar automático (A)" data-turn-focus="auto"`):''}
        ${button('battle-intents','intents','Intenções','data-turn-focus="intents"')}
        ${button('battle-mask','context','Máscara',`aria-label="Máscara, ressonância ${Math.round(r.resonance)}, sobrecarga ${Math.round(r.overload)}" data-turn-focus="mask"`)}
        ${button('battle-speed','speed',(V.settings.battleSpeed||1)+'×','aria-label="Velocidade da animação" data-turn-focus="speed"')}
      </div>
    </header>
    <section id="battle-field" class="turn-field" aria-label="Arena">
      ${turnOrder(a)}
      ${enemy&&a.phase!=='intro'?`<button type="button" id="battle-intent-preview" class="turn-intent-preview" title="${esc(enemy.intent)}">${icon('intents')}<span>${esc(enemy.intent)}</span></button>`:''}
      ${hitboxes(a)}
    </section>
    <section class="turn-dock">
      ${terminal.has(a.phase)?'':team(a)}
      <div class="turn-work">${prompt(a,actor)}</div>
      <div class="turn-foot">
        ${a.auto&&canAuto?`<span class="turn-auto-note">${icon('auto')}<span>${shown&&suggested?'Automático · '+esc(suggested.why):'Automático ligado'}</span></span>`:shown&&suggested?`<button type="button" id="battle-suggest" data-turn-focus="suggest" title="${esc(suggested.why)}">${icon('skills')}<span>Sugestão <b>${suggestedLabel}</b></span></button>`:''}
        <span class="turn-log-line" role="status" title="${esc(battleText)}">${esc(battleText)}</span>
        ${button('battle-review','records','Registros','data-turn-focus="records"')}
        ${a.canRetreat&&canAuto&&a.phase!=='intro'?button('battle-retreat','retreat','Recuar','data-turn-focus="retreat"'):''}
      </div>
    </section>`;
    this.bindControls(root,a);
    paintPortraits(root);
    this.syncHitboxes(root);
    if(focus){
      const next=[...root.querySelectorAll('[data-turn-focus]')].find(el=>el.dataset.turnFocus===focus&&!el.disabled);
      const fallback=root.querySelector(a.phase==='target'?'[data-battle-target]':a.phase==='command'?'#battle-back,[data-battle-command]:not(:disabled)':terminal.has(a.phase)?'#battle-finish':a.auto?'#battle-auto':'#battle-intents');
      (next||fallback)?.focus({preventScroll:true});
    }
    V.$('#life-hud')?.setAttribute('hidden','');
    V.$('#guide-toggle-button')?.setAttribute('disabled','');
  };

  B.bindControls=function(root,a){
    const on=(id,fn)=>{const el=root.querySelector('#'+id);if(el)el.onclick=fn;};
    const start=auto=>{
      if(this.active!==a||a.phase!=='intro')return;
      this.setAuto(auto||a.auto,false);
      a.phase='initiative';
      this.advance();
    };
    on('battle-start',()=>start(false));
    on('battle-start-auto',()=>start(true));
    on('battle-auto',()=>this.setAuto(!a.auto));
    on('battle-suggest',()=>this.useSuggestion());
    on('battle-back',()=>this.back());
    on('battle-finish',()=>this.finish());
    on('battle-retry',()=>this.retry());
    on('battle-intents',()=>this.intentions());
    on('battle-intent-preview',()=>this.intentions());
    on('battle-mask',()=>{if(V.Historio)V.Historio.panel('current');else V.Game.gallery();});
    on('battle-review',()=>this.records());
    on('battle-retreat',()=>this.retreatPrompt());
    on('battle-speed',()=>{
      V.settings.battleSpeed=({1:2,2:3,3:1})[V.settings.battleSpeed]||2;
      V.Save.applySettings();
      this.ui();
    });
    for(const el of root.querySelectorAll('[data-battle-command]'))el.onclick=()=>this.choose(el.dataset.battleCommand);
    for(const el of root.querySelectorAll('[data-turn-kind]'))el.onclick=()=>this.choose(el.dataset.turnKind,el.dataset.turnId);
    for(const el of root.querySelectorAll('[data-battle-target],[data-turn-hit]'))el.onclick=()=>this.pick(el.dataset.battleTarget||el.dataset.turnHit);
  };

  B.pick=function(id){
    const a=this.active,actor=this.get(id);
    if(!a||!actor)return false;
    if(a.phase==='target'&&this.targets(a.selectedAction).includes(actor)){
      if(actor.side==='enemy')a.aimTarget=id;
      return this.commit(a.selectedAction,id);
    }
    if(a.phase!=='command'||actor.side!=='enemy'||actor.health<=0)return false;
    if(a.auto)this.setAuto(false,false);
    a.aimTarget=a.aimTarget===id?null:id;
    this.ui();
    return true;
  };

  B.key=function(k,e){
    const a=this.active;
    if(!a||V.modal||V.Dialogue.active||e.repeat)return false;
    if(k==='a'&&!terminal.has(a.phase)){e.preventDefault?.();return this.setAuto(!a.auto);}
    if(k==='escape'&&(a.phase==='target'||a.menu!=='main')){e.preventDefault?.();this.back();return true;}
    if(a.phase==='target'){
      const targets=this.targets(a.selectedAction);
      const index=targets.findIndex(actor=>actor.id===a.selectedTarget);
      if(targets.length&&['arrowleft','arrowup','arrowright','arrowdown'].includes(k)){
        e.preventDefault?.();
        const delta=['arrowleft','arrowup'].includes(k)?-1:1;
        a.selectedTarget=targets[(index+delta+targets.length)%targets.length].id;
        this.ui();
        return true;
      }
      if(['enter','e'].includes(k)&&e.target?.tagName!=='BUTTON'){e.preventDefault?.();return this.pick(a.selectedTarget);}
    }
    if(a.phase==='command'&&/^[1-6]$/.test(k)){
      e.preventDefault?.();
      return this.choose(commands[Number(k)-1][0]);
    }
    return false;
  };

  B.intentions=function(){
    const enemies=this.active?.enemies.filter(actor=>actor.health>0)||[];
    V.UI.modal('Intenções da Rasura','PRÓXIMAS AÇÕES',enemies.map(actor=>
      `<article class="turn-inspect"><h3>${esc(actor.name)}</h3><p>${icon('intents')} ${esc(actor.intent)}</p>
      <p>${actor.health} / ${actor.stats.health} vida${actor.shield?' · Escudo '+actor.shield:''}</p>
      <p>${esc(actor.tip)}</p>${actor.revealed?`<small>Ataque ${Math.round(this.stat(actor,'attack'))} · Defesa ${actor.stats.defense} · Agilidade ${Math.round(this.stat(actor,'agility'))}</small>`:''}
      ${this.statusText(actor)?`<p>${esc(this.statusText(actor))}</p>`:''}</article>`).join('')||'<p>A equipe encerrou o confronto.</p>',
      '<button type="button" id="battle-intents-close" class="primary">Voltar à batalha</button>');
    V.$('#battle-intents-close').onclick=()=>V.UI.close();
  };
  B.analysis=function(){return this.intentions();};

  B.records=function(){
    const a=this.active;
    if(!a)return;
    V.UI.modal('Registros da batalha','AÇÕES RECENTES',`<ol class="turn-records">${a.log.map(line=>`<li>${esc(line)}</li>`).join('')}</ol>`,
      '<button id="battle-case-records" class="secondary">Consultar evidências</button><button id="battle-log-close" class="primary">Voltar à batalha</button>');
    V.$('#battle-case-records').onclick=()=>V.Game.gallery();
    V.$('#battle-log-close').onclick=()=>V.UI.close();
  };

  B.retreatPrompt=function(){
    if(!this.active?.canRetreat||terminal.has(this.active.phase))return;
    V.UI.modal('Recuar do confronto','', '<p>A equipe volta à exploração. Você poderá tentar o confronto de novo.</p>',
      '<button id="battle-retreat-cancel" class="secondary">Continuar batalha</button><button id="battle-retreat-ok" class="primary">Recuar</button>');
    V.$('#battle-retreat-cancel').onclick=()=>V.UI.close();
    V.$('#battle-retreat-ok').onclick=()=>{V.UI.close();this.cancel();};
  };

  const finish=B.finish.bind(B);
  B.finish=function(){
    finish();
    if(V.Game.mode==='explore'){
      V.$('#guide-toggle-button')?.removeAttribute('disabled');
      V.Life.hud();
    }
  };
  const martialEffects=new Set(['strike','strikeMark','break','poison']);
  function recruitHealth(battle){
    return (battle?.allies||[]).filter(ally=>ally.health>0&&V.Team?.kits[ally.character]?.fragmentArt!=null)
      .map(ally=>[ally,ally.health]);
  }
  const injuredRecruits=before=>before.filter(([ally,health])=>ally.health<health).map(([ally])=>ally.id);

  const commit=B.commit.bind(B);
  B.commit=function(action,target){
    const a=this.active,actor=a?.actor,definition=this.definition(action);
    const before=recruitHealth(a);
    const ok=commit(action,target);
    if(!ok||!this.active||action.type==='retreat')return ok;
    const recruit=V.Team?.kits[this.get(actor)?.character]?.fragmentArt!=null;
    const martial=action.type==='skill'&&recruit&&martialEffects.has(definition?.effect);
    const clip=action.type==='attack'||martial?'attack':action.type==='defend'?'guard':action.type==='item'||['heal','cleanse'].includes(definition?.effect)?'heal':'cast';
    const fx=clip==='attack'?0:clip==='heal'?3:clip==='guard'||definition?.effect==='shield'?2:definition?.effect==='ultimate'?5:1;
    const hit=definition?.target==='allies'?a.allies:definition?.target==='enemies'?a.enemies:null;
    const duration=V.settings.reducedMotion?.28:.68;
    a.visual={actor,targets:hit?hit.map(actor=>actor.id):[target||actor],clip,fx,spell:definition?.spell,teamFx:V.Team?.skills.has(definition?.id)?definition.fx:null,age:0,duration,guardian:action.type==='supportAction',recruitHits:injuredRecruits(before)};
    if(action.type==='item')V.Life.diet(definition);
    if(a.phase==='resolving')a.timer=duration;
    return true;
  };
  const enemy=B.enemyAction.bind(B);
  B.enemyAction=function(){
    const a=this.active,actor=this.get(a?.actor),plan=actor?.plan;
    const before=recruitHealth(a);
    enemy();
    if(!a||!actor||this.active!==a)return;
    const targets=a.enemyHit||[plan?.target||a.allies[0].id];
    const duration=V.settings.reducedMotion?.28:.68;
    a.visual={actor:actor.id,targets,clip:'attack',fx:4,spell:plan?.type==='attack'?null:actor.spell,age:0,duration,recruitHits:injuredRecruits(before)};
    if(a.phase==='resolving')a.timer=duration;
  };
  const update=B.update.bind(B);
  B.update=function(dt){
    if(V.modal||V.Dialogue.active||document.hidden)return;
    const a=this.active;
    if(a?.visual){
      a.visual.age+=dt*(V.settings.battleSpeed||1);
      if(a.visual.age>=a.visual.duration)a.visual=null;
    }
    return update(dt);
  };

  B.geometry=function(canvas=V.Engine.canvas){
    const stage=V.$('#stage'),field=V.$('#battle-field');
    const width=stage?.clientWidth||canvas?.width||960,height=stage?.clientHeight||canvas?.height||540;
    const top=field?.clientHeight?field.offsetTop:Math.min(65,height*.17);
    const depth=field?.clientHeight||height-top-Math.min(180,height*.33);
    const narrow=width<590,short=depth<205;
    const size=Math.max(27,Math.min(120,width*(narrow?.226:.137),depth*(short?.48:.36)));
    return {width,height,top,depth,narrow,short,size};
  };

  function formation(group,g,enemy){
    const left=g.width*(enemy?.64:.10),span=g.width*(enemy?.345:.525);
    const topInset=Math.min(enemy?70:78,g.depth*.31),bottomInset=Math.min(enemy?45:12,g.depth*.20);
    const height=Math.max(1,g.depth-topInset-bottomInset),count=group.length;
    const maxSize=Math.min(g.size,enemy?112:106);
    let best=null;
    for(let columns=1;columns<=count;columns++){
      const rows=Math.ceil(count/columns),stepX=span/columns,stepY=height/rows;
      const size=Math.min(maxSize,stepX/(enemy?1.40:1.60),stepY/(enemy?1.52:1.70));
      if(!best||size>best.size||size===best.size&&rows<best.rows){
        best={columns,rows,stepX,stepY,size};
      }
    }
    if(!best)return [];
    const {columns,stepX,stepY,size}=best;
    return group.map((actor,index)=>{
      const row=Math.floor(index/columns),col=index%columns,inRow=Math.min(columns,count-row*columns);
      const margin=(span-inRow*stepX)/2;
      const sizeInCell=size*(enemy&&actor.boss?1.08:1);
      return {
        x:left+margin+(col+.5)*stepX,
        y:g.top+topInset+(row+.90)*stepY,
        size:sizeInCell,
        hitWidth:Math.min(stepX-2,Math.max(34,sizeInCell*1.15)),
        hitHeight:Math.min(stepY-2,Math.max(34,sizeInCell*1.10)),
        labelWidth:Math.min(124,stepX-5)
      };
    });
  }

  B.position=function(actor,g=this.geometry()){
    const enemy=actor.side==='enemy',group=enemy?this.active.enemies:this.active.allies;
    return formation(group,g,enemy)[group.indexOf(actor)];
  };

  B.supportPosition=function(g){
    const hero=this.position(this.active.allies[0],g);
    const size=Math.min(hero.size*.78,g.width*.081);
    const y=Math.max(g.top+g.depth*.59,hero.y);
    return {x:g.width*.048,y,size};
  };

  B.syncHitboxes=function(root=V.$('#battle-root'),g=this.geometry()){
    if(!root)return;
    const field=root.querySelector('#battle-field');
    for(const hit of root.querySelectorAll('[data-turn-hit]')){
      const actor=this.get(hit.dataset.turnHit);
      if(!actor)continue;
      const p=this.position(actor,g);
      hit.style.left=p.x+'px';
      hit.style.top=p.y-(field?.clientHeight?g.top:0)+'px';
      hit.style.width=p.hitWidth+'px';
      hit.style.height=p.hitHeight+'px';
      hit.style.setProperty('--turn-label-width',p.labelWidth+'px');
    }
  };

  B.pointer=function(x,y){
    const a=this.active;
    if(!a||V.modal||!['command','target'].includes(a.phase))return false;
    const g=this.geometry(),canvas=V.Engine.canvas,viewport=V.Viewport.arcade();
    const sx=(x*viewport.scale+viewport.x)*g.width/canvas.width;
    const sy=(y*viewport.scale+viewport.y)*g.height/canvas.height;
    const targets=a.phase==='target'?this.targets(a.selectedAction):a.enemies.filter(actor=>actor.health>0);
    const match=targets.find(actor=>{
      const p=this.position(actor,g);
      return Math.abs(sx-p.x)<=p.hitWidth/2&&sy<=p.y&&sy>=p.y-p.hitHeight;
    });
    return match?this.pick(match.id):false;
  };

  B.render=function(ctx){
    const a=this.active;
    if(!a)return;
    const g=this.geometry(ctx.canvas),root=V.$('#battle-root');
    const key=[g.width,g.height,g.top,g.depth].join(':');
    if(root&&root.dataset.arenaGeometry!==key){root.dataset.arenaGeometry=key;this.syncHitboxes(root,g);}
    const {width,height}=g,art=a.expedition?V.FragmentArt.images[a.expedition.arena||'clearing']:a.intro&&V.TurnArt.arena?.naturalWidth?V.TurnArt.arena:V.Assets.images[backgrounds[a.id]||'battle-city'];
    ctx.save();
    ctx.scale(ctx.canvas.width/width,ctx.canvas.height/height);
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#1a362e';
    ctx.fillRect(0,0,width,height);
    if(art?.naturalWidth){
      const scale=Math.max(width/art.naturalWidth,height/art.naturalHeight);
      const w=art.naturalWidth*scale,h=art.naturalHeight*scale;
      const horizon=a.expedition?Math.min(0,g.top+g.depth*.64-h*.56):(height-h)*.42;
      ctx.drawImage(art,(width-w)/2,horizon,w,h);
    }
    if(a.expedition?.tint){ctx.fillStyle=a.expedition.tint;ctx.fillRect(0,0,width,height);}
    const shade=ctx.createLinearGradient(0,0,0,height);
    shade.addColorStop(0,'#081a19a8');shade.addColorStop(.39,'#11252209');shade.addColorStop(1,'#091e1beb');
    ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    const visual=a.visual,still=V.settings.reducedMotion,clock=still?0:a.clock;
    const actors=[...formation(a.allies,g,false).map((p,i)=>[a.allies[i],p]),
      ...formation(a.enemies,g,true).map((p,i)=>[a.enemies[i],p])];
    for(const [actor,p] of actors.sort((left,right)=>left[1].y-right[1].y)){
      if(actor.side==='enemy'&&actor.health<=0)continue;
      const {x,y,size}=p,active=visual?.actor===actor.id,enemy=actor.side==='enemy';
      V.SceneShadows.contact(ctx,x,y+4,size*.29,size*.073,.31);
      ctx.globalAlpha=actor.health<=0?.36:1;
      const hit=!!visual?.recruitHits?.includes(actor.id);
      const progress=(active||hit)&&visual?visual.age/visual.duration:0;
      const animation={
        clip:active?visual.clip:!visual&&a.phase==='victory'?'victory':'ready',
        progress,clock,hit,guarded:!!this.has(actor,'guard'),still
      };
      if(!V.FragmentArt?.drawActor(ctx,actor,x,y+4,size,animation)){
        if(enemy){
          const image=V.Assets.images['rasura-enemies'];
          const frame=still?0:active?2:Math.floor(clock*2)%2;
          if(image?.naturalWidth)ctx.drawImage(image,frame*128,actor.row*144,128,144,x-size*.58,y-size*1.10,size*1.16,size*1.16);
        }else{
          const clip=still?'ready':active?visual.clip:a.phase==='victory'?'dance':'ready';
          if(!A.draw(ctx,actor.character,clip,x,y+6,size,still?0:active?visual.age:clock,false)){
            const t=active&&!still?Math.sin(Math.PI*V.clamp(progress,0,1)):0;
            V.Assets.sprite(ctx,actor.character,x+(clip==='attack'?t*size*.23:0),y+7-t*size*.07,2,t>.1?Math.floor(visual.age*10)%4:0,size*.88);
          }
        }
      }
      ctx.globalAlpha=1;
      const aimed=(a.phase==='target'?a.selectedTarget:a.aimTarget)===actor.id;
      if(aimed||a.actor===actor.id){
        ctx.strokeStyle=aimed?'#ffdc87':'#83ddc2';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(x,y+5,size*.34,size*.089,0,0,Math.PI*2);ctx.stroke();
      }
      if(actor.id==='player'&&V.AncestralMask&&P.ensure().story.awakened){
        const mask=V.AncestralMask,row=active&&visual.clip==='cast'&&!V.settings.reducedFlash&&!still?mask.rows.pulse:0;
        const support=this.supportPosition(g);
        const maskSize=Math.min(size*.74,g.width*.083);
        mask.frame(ctx,row,still?0:Math.floor(clock*3)%4,support.x,support.y-support.size*.86-maskSize*.53,maskSize,mask.variant());
      }
      if(visual?.targets.includes(actor.id)&&(!still||visual.spell!=null)){
        let drawn=V.FragmentArt?.spell(ctx,visual.spell,x,y-size*.53,size*1.42,still?visual.duration*.45:visual.age,visual.duration);
        if(!drawn&&visual.teamFx!=null&&V.TeamArt){
          ctx.save();if(V.settings.reducedFlash)ctx.globalAlpha=.58;
          drawn=V.TeamArt.draw(ctx,visual.teamFx,x,y-size*.50,size*1.46,visual.age,visual.duration);ctx.restore();
        }
        if(!drawn&&!still)A.fx(ctx,visual.fx,x,y-size*.54,size*(visual.fx===5?1.72:1.23),visual.age);
      }
    }
    this.drawBattleCompanion(ctx,g);
    const floating=new Map();
    for(const effect of [...a.effects].reverse()){
      const actor=this.get(effect.target);
      if(!actor)continue;
      const count=floating.get(actor.id)||0;
      if(count>=3)continue;
      floating.set(actor.id,count+1);
      const p=this.position(actor,g),step=g.narrow?14:18;
      const rise=still?0:(1.3-effect.life)*14;
      V.Engine.text(ctx,effect.text,p.x,p.y-p.size*.9-rise-count*step,effect.color,step-1,'center');
    }
    ctx.restore();
  };

  B.drawBattleCompanion=function(ctx,g){
    const a=this.active,r=P.ensure();
    const companion=a.id===0?null:V.Companions?.selected(),spirit=V.FragmentData?.spirits.find(item=>item.id===a.spirit);
    if(!r.story.met&&a.id!==0&&!companion&&!spirit)return;
    const {x,y,size}=this.supportPosition(g);
    const active=a.visual?.guardian,clock=V.settings.reducedMotion?0:active?a.visual.age:a.clock;
    const clip=active?'cast':'ready';
    V.SceneShadows.contact(ctx,x,y+3,size*.29,size*.08,.20);
    if(spirit&&V.FragmentArt.draw(ctx,'creatures',spirit.art,x,y+3,size*(active?1.28:1.1)))return;
    if(companion&&companion.id!=='zambeto'){
      if(!V.Presences?.draw(ctx,companion.id,clip,x,y,size,clock,false,true,!active)){
        V.AncestralArt.draw(ctx,'characters',companion.sprite,x,y,size);
      }
    }else A.draw(ctx,'zambeto',clip,x,y,size,clock);
  };
});
