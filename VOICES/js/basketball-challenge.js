window.VoicesModules.define('basketball-challenge', function () {
  'use strict';
  const V=window.V,P=V.Playground,D=V.PlaygroundData,M=V.BasketballMatch,A=V.BasketballArt,Close=V.BasketballShotArt;
  const cup='basketball', comeback='basketball-virada';
  const stages=[
    {name:'Estreia',target:4,seconds:50,periods:1},
    {name:'Jogo de equipe',target:6,seconds:44,periods:2},
    {name:'Decisão no ginásio',target:8,seconds:39,periods:2}
  ];
  const endings=[
    {name:'Uma posse de diferença',seconds:42,periods:4,snapshot:{possession:0,points:[6,6,5,4,5,7,5,6,4,6]}},
    {name:'A defesa decide',seconds:60,periods:4,snapshot:{possession:1,points:[8,6,5,5,6,8,7,6,6,7]}},
    {name:'Virada da Aurora',seconds:75,periods:4,snapshot:{possession:0,points:[8,8,6,7,7,9,9,8,8,8]}}
  ];
  const phases=game=>game===comeback?endings:stages;
  const isBasketball=game=>game===cup||game===comeback;
  const keys='WASD/setas movem · Shift corre · Espaço arremessa · E passa · Q rouba · R bloqueia no rebote.';
  const rules='Faça o mínimo de pontos da fase pela Aurora. Na decisão, termine à frente do Tambor.';
  D.games.push({
    id:cup,title:'Basquete · Copa do Campus',catalogHidden:true,description:'Jogue de armadora da Aurora num 5 contra 5. Abra espaço, passe, marque e acerte o tempo do arremesso.',
    tag:'BASQUETE · ESPORTE DE EQUIPE',color:'#48bfa4',stages:stages.length,goal:rules,keys
  },{
    id:comeback,title:'Basquete - Virada no Ginásio',catalogAlternate:{id:cup,label:'Jogar a Copa do Campus',resume:'Continuar a Copa do Campus',saved:'Partida da Copa do Campus guardada'},
    description:'Assuma a armação da Aurora no último período. São três finais de partida com placares e posses iniciais diferentes.',
    tag:'BASQUETE · FINAIS DE PARTIDA',color:'#d19762',stages:endings.length,
    goal:'Vire o placar contra o Tambor. Um empate leva à prorrogação.',keys
  });
  D.guides[cup]=D.guides[comeback]=[
    {event:'move',title:'Encontre espaço',text:'Use WASD, as setas ou os botões de direção. Mova Dara até o círculo marcado. Cut é se deslocar sem a bola para abrir uma linha de passe.'},
    {event:'pass',title:'Passe a bola',text:'Aperte E ou toque em Passar. Dara procura uma companheira livre. É o pass.'},
    {event:'shoot',title:'Acerte o arremesso',text:'Toque em Arremessar duas vezes. O primeiro toque liga o indicador. Solte com o segundo toque quando ele passar pela faixa verde.'},
    {event:'steal',title:'Recupere a posse',text:'Chegue perto de quem está com a bola e aperte Q ou toque em Roubar. Em inglês, roubo de bola é steal.'}
  ];
  const buttonKeys={e:'pass',q:'steal',r:'boxout',f:'pass',' ':'shoot',enter:'shoot'};
  const directions={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
  const target={x:663,y:209};
  const selected=new WeakMap();
  const shots=new WeakMap(), sprinting=new WeakSet();
  const resultHold=3;
  const fraction=value=>(value*100).toFixed(2)+'%';

  function shortcut(button,label,key){
    if(button.firstElementChild?.textContent===label&&button.lastElementChild?.textContent===key)return;
    const title=document.createElement('span'),caption=document.createElement('kbd');
    title.textContent=label;
    caption.textContent=key;
    button.setAttribute('aria-label',label);
    button.setAttribute('aria-keyshortcuts',key==='Espaço'?'Space':key);
    button.replaceChildren(title,caption);
  }

  function shotPause(r){
    return shots.get(r)||null;
  }

  function showShotResult(moment){
    const label=V.$('#basket-shot-status');
    if(label)label.textContent=moment?Close.message(moment):'';
  }

  function updateShot(r,dt){
    const sequence=shotPause(r);
    if(!sequence)return false;
    const previous=sequence.elapsed;
    sequence.elapsed+=dt;
    if(previous<sequence.animation&&sequence.elapsed>=sequence.animation)showShotResult(sequence.moment);
    if(sequence.elapsed+1e-8<sequence.animation+resultHold)return true;
    shots.delete(r);
    return false;
  }

  function recordShot(r,moment){
    const animation=V.settings.reducedMotion?0:Close.dropDuration(moment.outcome);
    shots.set(r,{moment,animation,elapsed:0});
    showShotResult(animation?null:moment);
  }

  function passTarget(r){
    const s=r.data.match;
    if(s.status!=='play'||s.carrier!==0||s.shotMeter!==null)return null;
    const p=s.players[0], manual=s.players[selected.get(r)];
    const pick=manual&&manual.team===0&&manual.id>0?manual:M.selectPass(s,p);
    return pick?{id:pick.id,x:pick.x,y:pick.y,clear:M.passLane(s,p,pick)>=20}:null;
  }

  function meter(r){
    const el=V.$('#basket-meter');
    if(!el)return;
    const s=r.data.match,active=s.shotMeter!==null&&M.canShoot(s,0);
    el.dataset.active=String(active);
    el.setAttribute('aria-hidden',String(!active));
    if(!active)return;
    const timing=M.shotTiming(s);
    const window=M.shotWindow(s);
    el.firstElementChild.textContent=Close.styleName(window.style);
    el.style.setProperty('--zone-start',fraction(window.start));
    el.style.setProperty('--zone-width',fraction(window.end-window.start));
    el.style.setProperty('--needle',fraction(timing.gauge));
    el.dataset.good=String(timing.inside);
  }

  function scoreHeader(r){
    const s=r.data.match,el=V.$('#basket-strip');
    if(!el)return;
    const info=M.display(s);
    const [aurora,time,attack,tambor]=el.children;
    aurora.lastElementChild.textContent=String(s.score[0]).padStart(2,'0');
    tambor.lastElementChild.textContent=String(s.score[1]).padStart(2,'0');
    time.firstElementChild.textContent=info.period;
    time.lastElementChild.textContent=info.clock;
    attack.firstElementChild.textContent=s.status==='play'?'Posse '+M.teams[s.possession].short:'Posse';
    attack.lastElementChild.textContent=info.possession;
    attack.dataset.urgent=String(info.urgent);
  }


  function make(game,training,stage=0,seed=5247) {
    const table=phases(game);
    stage=M.clamp(stage,0,table.length-1);
    const rule=table[stage];
    return {stage,match:M.create({seed,period:rule.seconds,periods:rule.periods,human:true,drill:training,
      snapshot:training?null:rule.snapshot}),lastEvent:0,basket:0,missed:0,steals:0,retry:0};
  }

  function drill(r) {
    const s=r.data.match,p=s.players[0];
    s.status='play';
    s.elapsed=0;
    s.cooldown=0;
    s.flight=null;
    selected.delete(r);
    Object.assign(p,{vx:0,vy:0,pose:'idle',hold:0,mark:null});
    if(r.step===0){
      p.x=495;p.y=245;M.give(s,0);
    }else if(r.step===1){
      M.give(s,0);
    }else if(r.step===2){
      p.x=728;p.y=296;M.give(s,0);
    }else{
      p.x=485;p.y=285;
      Object.assign(s.players[5],{x:522,y:285});
      M.give(s,5);
      s.cooldown=0;
    }
  }

  function movement(r) {
    const p=r.data.match.players[0],held=P.held;
    let x=held.x,y=held.y;
    for(const [key,[dx,dy]] of Object.entries(directions)) {
      if(V.Input.keys.has(key)){x+=dx;y+=dy;}
    }
    if(x||y)return{x:p.x+Math.sign(x)*62,y:p.y+Math.sign(y)*62,sprint:sprinting.has(r)||V.Input.keys.has('shift')};
    return p;
  }

  function lose(r) {
    const d=r.data,s=d.match,rule=phases(r.game)[d.stage];
    const objective=rule.snapshot?'Termine à frente do Tambor.':'Meta da fase: '+rule.target+' pontos'+(d.stage===2?' e vitória da Aurora.':'.');
    V.UI.modal('Fim de jogo',rule.name+' · Aurora '+s.score[0]+' × '+s.score[1]+' Tambor',
      '<p>'+objective+' Você pode repetir a fase ou guardar a partida para tentar depois.</p>',
      '<button id="basket-retry" class="primary">Repetir fase</button><button id="basket-exit" class="secondary">Guardar e sair</button>');
    const leave=()=>{V.UI.onClose=null;V.UI.close();P.ensure().current=null;P.detach();P.save();};
    V.UI.onClose=leave;
    V.$('#basket-exit').onclick=leave;
    V.$('#basket-retry').onclick=()=>{
      V.UI.onClose=null;
      V.UI.close();
      r.score=d.initialScore;
      r.mistakes=d.initialMistakes;
      r.moves=d.initialMoves;
      r.bestCombo=d.initialBestCombo;
      r.combo=0;
      r.data=make(r.game,false,d.stage,s.seed);
      r.data.retry=d.retry+1;
      P.save();
      P.hud();
    };
  }

  function finish(r) {
    const d=r.data,s=d.match,rule=phases(r.game)[d.stage];
    const win=s.score[0]>s.score[1];
    if(rule.snapshot?!win:s.score[0]<rule.target||(d.stage===2&&!win))return lose(r);
    P.stageClear(r,d.stage);
    P.finish();
  }

  const C={
    guideStep:drill,
    update(r,dt) {
      const d=r.data,s=d.match;
      d.initialScore??=r.score;
      d.initialMistakes??=r.mistakes;
      d.initialMoves??=r.moves;
      d.initialBestCombo??=r.bestCombo||0;
      if(r.training&&s.status==='tip')drill(r);
      s.calm=!!r.calm;
      s.difficulty=r.difficulty??1;
      if(updateShot(r,dt))return;
      if(r.training&&r.step===2&&s.stats.basket>0&&P.event('shoot'))return;
      if(s.status==='final')return finish(r);
      const before=s.shotMoment;
      M.tick(s,dt,movement(r));
      if(s.shotMoment&&s.shotMoment!==before)recordShot(r,s.shotMoment);
      meter(r);
      A.whistle(s);
      if(d.lastEvent!==s.event&&['received','loose','rebound','turnover','basket'].includes(s.signal))r.feedback='';
      if(r.training){
        if(r.step===0&&M.distance(s.players[0],target)<27)P.event('move');
        if(r.step===1&&s.carrier>0&&s.lastPass?.from===0&&s.lastPass.to===s.carrier)P.event('pass');
      }else{
        if(d.basket<s.stats.basket){
          P.hit(100);
          V.Audio.sfx('correct');
          r.feedback='';
        }
        if(d.missed<s.stats.missed)P.feedback('Dispute o rebote.',true);
        if(d.steals<s.stats.steals){P.hit(45);r.feedback='';}
        if(d.lastEvent!==s.event)P.save();
      }
      d.basket=s.stats.basket;d.missed=s.stats.missed;d.steals=s.stats.steals;d.lastEvent=s.event;
    },
    action(r,name,id) {
      const s=r.data.match,p=s.players[0];
      if(shotPause(r))return;
      if(r.training&&s.status==='tip')drill(r);
      if(s.status!=='play'&&!(s.status==='free-throw'&&name==='shoot'))return;
      if(name==='boxout'||name==='shoot'&&M.canBoxOut(s,0)){
        if(M.boxOut(s,0)){r.moves++;r.feedback='Posição de rebote protegida.';}
        return;
      }
      if(name==='pass'){
        if(s.carrier===0){
          const receiver=s.players[id]||s.players[passTarget(r)?.id]||M.selectPass(s,p);
          if(receiver&&M.pass(s,0,receiver.id)){
            selected.delete(r);
            r.moves++;
            r.feedback='Passe para '+M.roster[receiver.id][1]+'.';
          }
        }else if(s.carrier!=null&&s.possession===0){
          const teammate=s.players[s.carrier];
          s.requestUntil=s.elapsed+2.8;
          const clear=M.passLane(s,teammate,p)>=21;
          if(clear)M.pass(s,teammate.id,0);
          else s.decision=Math.min(s.decision,.25);
          r.feedback=clear?'Passe a caminho.':'Passe pedido. Saia da linha da marcação.';
          r.moves++;
        }
        return;
      }
      if(name==='steal'){
        if(s.possession===0||s.carrier==null)return;
        const rival=s.players[s.carrier];
        if(M.steal(s,0)){
          r.moves++;r.feedback='Posse recuperada.';
          if(r.training)P.event('steal');
        }else r.feedback=M.distance(p,rival)>M.stealReach?'Chegue mais perto antes de tentar roubar.':'A marcação segurou a bola.';
        return;
      }
      if(name!=='shoot'||!M.canShoot(s,0))return;
      if(s.shotMeter==null){
        s.shotMeter=0;
        r.feedback='Acione de novo na faixa verde.';
        return;
      }
      const timing=M.shotTiming(s);
      const release=s.status==='free-throw'?M.releaseFreeThrow:M.shoot;
      if(release(s,0,timing.grade)){
        r.moves++;
        r.feedback=timing.inside?'Soltura precisa!':timing.early?'Soltou cedo.':'Soltou tarde.';
      }
    },
    pointer(r,type,at) {
      const s=r.data.match;
      if(type!=='down'||shotPause(r)||s.carrier!==0||s.status!=='play'||s.shotMeter!==null)return;
      const pick=s.players.slice(1,5).sort((a,b)=>M.distance(a,at)-M.distance(b,at))[0];
      if(M.distance(pick,at)>52)return;
      selected.set(r,pick.id);
      r.feedback='Passe preparado para '+M.roster[pick.id][1]+'.';
    },
    key(r,key,event) {
      if(directions[key]||key==='shift')return true;
      const action=buttonKeys[key];
      if(!action)return false;
      if(!event?.repeat)P.action(action);
      return true;
    },
    controls(r,host) {
      const pad=document.createElement('div'),acts=document.createElement('div'),scene=V.$('#pg-scene');
      pad.className='pg-basket-pad';
      acts.className='pg-basket-actions';
      const pressed=new Map();
      const sync=()=>{
        let x=0,y=0;
        for(const v of pressed.values()){x+=v[0];y+=v[1];}
        P.held={x:Math.sign(x),y:Math.sign(y)};
      };
      for(const [name,label,key] of [['up','↑','w'],['left','←','a'],['down','↓','s'],['right','→','d']]){
        const v=directions[key];
        const b=P.button('basket-'+name,label,()=>{
          if(b.pointerDriven)return;
          const [x,y]=v;
          const press={x,y};
          P.held=press;
          setTimeout(()=>{if(P.held===press)P.held={x:0,y:0};},180);
        });
        b.setAttribute('aria-label','Mover '+{up:'para cima',left:'à esquerda',down:'para baixo',right:'à direita'}[name]);
        b.setAttribute('aria-keyshortcuts',key.toUpperCase()+' Arrow'+name[0].toUpperCase()+name.slice(1));
        const cap=document.createElement('kbd');
        cap.textContent=key.toUpperCase();
        b.append(cap);
        b.dataset.direction=name;
        b.onpointerdown=e=>{b.pointerDriven=true;b.setPointerCapture?.(e.pointerId);pressed.set(e.pointerId,v);sync();};
        b.onpointerup=b.onpointercancel=b.onlostpointercapture=e=>{
          pressed.delete(e?.pointerId??1);
          sync();
          setTimeout(()=>b.pointerDriven=false,0);
        };
        pad.append(b);
      }
      const sprint=P.button('basket-sprint','Correr',()=>{});
      sprint.setAttribute('aria-label','Correr enquanto pressionado');
      sprint.setAttribute('aria-keyshortcuts','Shift');
      sprint.innerHTML='<span>Correr</span><kbd>Shift</kbd>';
      sprint.onpointerdown=e=>{sprint.setPointerCapture?.(e.pointerId);sprinting.add(r);};
      sprint.onpointerup=sprint.onpointercancel=sprint.onlostpointercapture=()=>sprinting.delete(r);
      sprint.onkeydown=e=>{if(e.key===' '||e.key==='Enter')sprinting.add(r);};
      sprint.onkeyup=sprint.onblur=()=>sprinting.delete(r);
      pad.append(sprint);
      acts.append(P.button('pg-action','Arremessar',()=>P.action('shoot'),'primary'),
        P.button('basket-pass','Passar',()=>P.action('pass')),
        P.button('basket-steal','Roubar',()=>P.action('steal')));
      host.append(pad,acts);
      scene.append(host);
      if(!V.$('#basket-strip')){
        const strip=document.createElement('div');
        strip.id='basket-strip';
        strip.className='pg-basket-strip';
        strip.setAttribute('role','group');
        strip.setAttribute('aria-label','Placar e relógios da partida');
        strip.innerHTML='<span class="basket-aurora"><small>Aurora</small><strong>00</strong></span>'
          +'<span><small>Período</small><strong>0:00</strong></span>'
          +'<span><small>Posse</small><strong>—</strong></span>'
          +'<span class="basket-tambor"><small>Tambor</small><strong>00</strong></span>';
        V.$('.pg-mission').prepend(strip);
      }
      if(!V.$('#basket-meter')){
        const gauge=document.createElement('div');
        gauge.id='basket-meter';
        gauge.className='pg-basket-meter';
        gauge.setAttribute('aria-hidden','true');
        gauge.innerHTML='<span>Soltura</span><div><i></i><b></b></div>';
        scene.append(gauge);
      }
      const status=document.createElement('span');
      status.id='basket-shot-status';
      status.setAttribute('role','status');
      status.className='pg-basket-announcement';
      scene.append(status);
    },
    model(r) {
      const d=r.data,s=d.match,rule=phases(r.game)[d.stage];
      const margin=s.score[0]-s.score[1],needed=rule.snapshot?rule.snapshot.points.slice(5).reduce((a,b)=>a+b,0)-rule.snapshot.points.slice(0,5).reduce((a,b)=>a+b,0)+1:0;
      const progress=r.training?r.step:rule.snapshot?M.clamp(needed+margin-1,0,needed):s.score[0];
      const option=s.carrier===0?passTarget(r):null;
      const short=option?.clear&&s.players[option.id].intent==='show';
      let support=s.carrier===0?short?M.roster[option.id][1]+' se apresentou. Use E ou Passar.':'Use E ou Passar. Toque num colega para escolher o alvo.'
        :s.possession===1?'Aproxime-se para tentar o roubo.':'Abra espaço e peça o passe.';
      if(s.flight?.type==='rebound'||s.flight?.type==='loose')support='Dispute o rebote. Use R para proteger sua posição.';
      if(s.status==='free-throw'&&M.canShoot(s,0))support='Seu lance livre. Use Espaço ou Arremessar.';
      else if(s.status!=='play')support=s.last;
      else if(rule.snapshot)support=(margin===0?'Empate':Math.abs(margin)+(margin>0?' à frente':' atrás'))+' · '+support;
      if(s.shotMeter!==null)support='Solte na faixa verde.';
      const goal=r.training?'Treino de basquete':rule.name+(rule.target?' · Meta '+rule.target+' pts':'');
      const box=M.canBoxOut(s,0);
      return {request:goal,support,progress,total:r.training?4:rule.target||needed,action:box?'Bloquear':s.shotMeter===null?'Arremessar':'Soltar',
        disabled:!!shotPause(r)||!box&&!M.canShoot(s,0),hint:s.last};
    },
    hud(r) {
      const s=r.data.match;
      const pass=V.$('#basket-pass'),steal=V.$('#basket-steal'),action=V.$('#pg-action'),sprint=V.$('#basket-sprint');
      if(pass){
        pass.disabled=!!shotPause(r)||s.status!=='play'||s.carrier==null||s.possession!==0;
        shortcut(pass,s.carrier===0?'Passar':'Pedir passe','E');
      }
      if(steal){steal.disabled=!!shotPause(r)||s.status!=='play'||s.carrier==null||s.possession===0;shortcut(steal,'Roubar','Q');}
      if(action)shortcut(action,action.textContent,M.canBoxOut(s,0)?'R':'Espaço');
      if(sprint)sprint.style.setProperty('--burst',fraction(s.players[0].burst??1));
      scoreHeader(r);
      meter(r);
    },
    hint(r) {
      r.feedback=r.data.match.possession===1?'Aproxime-se do rival com a bola, depois use Q.':'Use E para passar ou pedir a bola. Perto do aro, a faixa verde perdoa mais.';
    },
    spot(r) {
      const p=r.data.match.players[0];
      return {x:r.step===0?target.x:p.x,y:r.step===0?target.y:p.y-16,w:126,h:94};
    },
    draw(c,r) {
      const s=r.data.match;
      A.scene(c,s,{hud:false,pass:passTarget(r),challenge:true});
      if(r.training&&r.step===0){
        c.strokeStyle='#fff2a7';c.lineWidth=4;c.beginPath();c.ellipse(target.x,target.y,26,15,0,0,2*Math.PI);c.stroke();
      }
      Close.draw(c,s,shotPause(r));
    }
  };

  for(const game of [cup,comeback]){
    P.controllers[game]={...C,create:training=>make(game,training)};
  }

  const makeRun=P.make.bind(P);
  P.make=function(game,key,context){
    const r=makeRun(game,key,context);
    if(isBasketball(game))r.data=make(game,false,r.startStage,r.id.split('').reduce((seed,ch)=>Math.imul(31,seed)+ch.charCodeAt(0),5247)>>>0);
    return r;
  };

  const baseLayout=P.layout.bind(P);
  P.layout=function(){
    if(!isBasketball(this.active?.game))return baseLayout();
    const area=this.sceneBounds(),width=808,height=398;
    const scale=Math.max(.01,Math.min(Math.max(1,area.w-5)/width,Math.max(1,area.h-7)/height));
    return{scale,x:area.x+(area.w-width*scale)/2-76*scale,y:area.y+(area.h-height*scale)/2-55*scale};
  };

  const attach=P.attach.bind(P);
  P.attach=function(r){
    sprinting.delete(r);
    if(isBasketball(r.game)&&r.training&&r.step===1&&r.data.match.flight?.type==='pass')r.ack=false;
    const result=attach(r);
    if(isBasketball(r.game)){
      Close.load();
      V.MapAssets.ensure(['basketball'],'Preparando a quadra');
    }
    return result;
  };
});
