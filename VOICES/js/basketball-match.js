window.VoicesModules.define('basketball-match', function () {
  'use strict';

  const court={x:96,y:130,w:768,h:310}, baskets=[{x:139,y:285},{x:821,y:285}];
  const teams=[{name:'Aurora',color:'#49d7bd',short:'AUR'},{name:'Tambor',color:'#ffad80',short:'TAM'}];
  const roster=[
    ['dara','Dara','Armadora',4],['maicon','Maicon','Ala-armador',8],['jaci','Jaci','Ala',11],
    ['breno','Breno','Ala-pivô',15],['ayodele','Ayodele','Pivô',23],['luma','Luma','Armadora',5],
    ['jorge','Jorge','Ala-armador',9],['maiara','Maiara','Ala',12],['caue','Cauê','Ala-pivô',18],['nala','Nala','Pivô',27]
  ];
  const community=[
    ['joana','Joana','Treinadora',472,486,'coach','Na defesa, olha o quadril de quem está com a bola. No ataque, passa e corta para o espaço livre.'],
    ['samuel','Samuel','Árbitro',469,418,'ref','Cesta de dentro do arco vale dois. Além do arco, vale três. Se a bola sai, a posse muda de equipe.'],
    ['isa','Isa','Mesária',571,487,'table','Eu anoto os pontos e as posses. No placar você acompanha os períodos e o tempo de ataque.'],
    ['zuri','Zuri','Torcida',250,484,'cheer','Eu puxo o coro para a Aurora. Quando a defesa aperta, os passes rápidos fazem diferença.'],
    ['amaro','Amaro','Torcida',292,485,'cheer','A graça de torcer é vibrar pela jogada e respeitar quem está do outro lado.'],
    ['jana','Jana','Torcida',676,485,'cheer','Eu torço pelo Tambor. Repara como a Nala procura o rebote quando alguém arremessa.'],
    ['malik','Malik','Torcida',716,484,'cheer','O passe que desmonta a defesa às vezes vale um aplauso tão grande quanto a cesta.'],
    ['renata','Renata','Torcida',225,91,'fan','Gosto de vir mais cedo para ver as equipes aquecendo. Tem lugar aqui na arquibancada.'],
    ['eva','Eva','Torcida',294,94,'fan','Daqui dá para ver quem abriu espaço na ala.'],
    ['davi','Davi','Torcida',361,89,'fan','Quando dá empate no fim dos quatro períodos, a partida vai para a prorrogação.'],
    ['bianca','Bianca','Torcida',425,94,'fan','Dar espaço a quem está sem a bola também é trabalho de equipe.'],
    ['hugo','Hugo','Torcida',555,94,'fan','As equipes combinam a troca na marcação com um sinal. Repara na próxima posse.'],
    ['lia','Lia','Torcida',621,89,'fan','Em inglês, rebote é rebound. É recuperar a bola depois de um arremesso errado.'],
    ['ives','Ives','Torcida',687,94,'fan','Cestas de três mudam o jogo, mas um bom arremesso de perto também vale muito.'],
    ['noemia','Noêmia','Torcida',754,91,'fan','A Joana fica na lateral. Se quiser jogar, ela explica como entrar no desafio.']
  ];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const other=team=>1-team;
  const goal=team=>baskets[other(team)];
  const elapsedSince=(s,key)=>s.elapsed-(s[key]??-100);
  const courtCenter={x:480,y:285};
  const lanes=[285,167,403,218,354];
  const arcRadius=220, cornerLine=132, shotLimit=24, stealReach=52;
  const catchReach=24, catchHeight=34, reboundHeight=43;
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>{const u=clamp(t,0,1);return u*u*(3-2*u);};
  const directions=[{x:0,y:1},{x:-1,y:0},{x:1,y:0},{x:0,y:-1}];
  const AI=window.V.BasketballAI.create({court,baskets,goal,clamp,distance,pressure,passLane,shotValue,hand});

  function random(s) {
    s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;
    return s.seed/4294967296;
  }

  function create({seed=4219,period=45,periods=4,difficulty=1,human=false,drill=false,calm=false,snapshot=null}={}) {
    const players=roster.map((_,id)=>({id,team:Math.floor(id/5),slot:id%5,x:480,y:lanes[id%5],dir:id<5?2:1,pose:'idle',pace:0,handle:0,hold:0,vx:0,vy:0}));
    const s={
      seed,period,periods,difficulty,human,drill,calm,players,score:[0,0],points:Array(10).fill(0),
      elapsed:0,quarter:1,clock:period,shotClock:shotLimit,status:'tip',wait:1.45,possession:0,carrier:null,possessionId:0,
      ball:{...courtCenter,z:0},flight:null,play:0,passes:0,decision:.65,cooldown:0,shotMeter:null,
      last:'Bola ao alto',event:0,signal:'tip',age:0,lastPass:null,
      stats:{basket:0,passer:0,missed:0,steals:0,rebounds:[0,0],shots:[0,0],made:[0,0],assists:[0,0],fouls:[0,0],freeThrows:[0,0],turnovers:[0,0]}
    };
    if(!human)s.possession=random(s)<.5?0:1;
    s.alternate=other(s.possession);
    s.official={x:480,y:449,vx:0,vy:0,pace:0,dir:0,pose:'idle',hold:0};
    layout(s,s.possession,true);
    if(snapshot){
      s.quarter=periods;
      s.points=[...snapshot.points];
      s.score=teams.map((_,team)=>s.points.slice(team*5,team*5+5).reduce((a,b)=>a+b,0));
      const team=snapshot.possession;
      s.possession=team;
      layout(s,team,false);
      s.age=2.9;
      s.players.forEach(p=>{
        const formation=AI.move(s,p);
        place(p,formation);
      });
      if(team===0)Object.assign(s.players[0],{x:568,y:214});
      inbound(s,team,'Bola em jogo no último período');
    }
    return s;
  }

  function place(p,at){
    p.x=at.x;
    p.y=at.y;
    p.vx=0;
    p.vy=0;
    p.pace=0;
    p.handle=0;
    p.pose='idle';
    p.hold=0;
    p.mark=null;
  }

  function layout(s,team,tip,walk=false) {
    for(const p of s.players) {
      const sign=p.team===team?-1:1, direction=team===0?1:-1;
      const spot={x:courtCenter.x+direction*sign*(tip&&p.slot===0?22:55+p.slot*36),y:lanes[p.slot]};
      if(walk){p.mark=spot;p.hold=0;}
      else {place(p,spot);p.dir=p.team===0?2:1;}
    }
  }

  function announce(s,message,signal='live') {
    s.last=message;
    s.signal=signal;
    s.event++;
    s.announcedAt=s.elapsed;
  }

  function give(s,id,reset=true) {
    const p=s.players[id];
    if(reset){
      s.shotClock=shotLimit;
      s.age=0;
      s.possessionId=(s.possessionId||0)+1;
      s.passes=0;
      s.lastPass=null;
      s.requestUntil=0;
    }
    s.possession=p.team;
    s.carrier=id;
    s.flight=null;
    s.shotMeter=null;
    s.decision=.55+AI.profile(p).reaction*1.22+random(s)*.34;
    p.handle=.45;
    s.cooldown=.48;
    s.ball={x:p.x,y:p.y,z:18};
  }

  function inbound(s,team,message,signal='inbound',spot=null) {
    const rim=baskets[team], direction=team===0?1:-1;
    s.status='inbound';
    s.possession=team;
    s.carrier=null;
    s.flight=null;
    s.shotMeter=null;
    s.lastPass=null;
    s.wait=1.38;
    s.inbound=s.human&&team===0?{x:s.players[0].x,y:s.players[0].y}:spot||{x:rim.x+direction*17,y:299};
    s.ball={...s.inbound,z:0};
    s.inboundId=inboundReceiver(s).id;
    s.play++;
    announce(s,message,signal);
  }

  function inboundReceiver(s){
    const lineup=s.players.slice(s.possession*5,s.possession*5+5);
    if(s.human&&s.possession===0)return lineup[0];
    const time=p=>distance(p,s.inbound)/AI.profile(p).speed+(p.slot===0?0:.22);
    return lineup.reduce((best,p)=>time(p)<time(best)?p:best);
  }

  function animate(p,pose,duration) {
    p.pose=pose;
    p.hold=duration;
    p.poseLength=duration;
    p.poseAge=0;
  }

  function face(p,dx,dy,decisive=false){
    if(Math.hypot(dx,dy)<5)return;
    const x=Math.abs(dx),y=Math.abs(dy),side=p.dir===1||p.dir===2;
    if(decisive||!directions[p.dir])p.dir=x>=y?(dx>0?2:1):(dy>0?0:3);
    else if(side?x>=y*.74:x>y*1.27)p.dir=dx>0?2:1;
    else p.dir=dy>0?0:3;
  }

  function move(p,at,speed,dt,mode='idle',limits=court,stride=74) {
    const dx=at.x-p.x,dy=at.y-p.y,length=Math.hypot(dx,dy);
    const desired=length>3?Math.min(speed,length*5.3):0;
    const targetX=desired?dx/length*desired:0,targetY=desired?dy/length*desired:0;
    p.vx??=0;
    p.vy??=0;
    const ax=targetX-p.vx,ay=targetY-p.vy;
    const driving=(p.vx*ax+p.vy*ay)>=0;
    const acceleration=driving?650:1000;
    const velocityChange=Math.min(1,acceleration*dt/Math.max(1,Math.hypot(ax,ay)));
    p.vx+=ax*velocityChange;
    p.vy+=ay*velocityChange;
    const x=p.x,y=p.y;
    const nextX=x+p.vx*dt,nextY=y+p.vy*dt;
    p.x=clamp(nextX,limits.x+14,limits.x+limits.w-14);
    p.y=clamp(nextY,limits.y+12,limits.y+limits.h-12);
    if(p.x!==nextX)p.vx=0;
    if(p.y!==nextY)p.vy=0;
    const step=Math.hypot(p.x-x,p.y-y);
    const speedNow=Math.hypot(p.vx,p.vy);
    p.pace=(p.pace||0)+step/stride;
    if(mode==='dribble')p.handle=((p.handle||0)+dt*(1.65+speedNow*.0052))%1;
    if(p.hold>0)return;
    if(at.look&&(mode==='guard'||speedNow<27||at.intent==='receive'))face(p,at.look.x-p.x,at.look.y-p.y);
    else if(step>dt*14)face(p,p.vx,p.vy);
    p.pose=mode==='dribble'?(speedNow>23?'dribble':'control')
      :mode==='guard'?'defend':speedNow>14?'run':'idle';
  }

  function separate(s,dt) {
    const players=s.players;
    for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
      const a=players[i],b=players[j],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
      const aBox=a.team!==b.team&&a.intent==='boxout'&&a.boxUntil>s.elapsed;
      const bBox=a.team!==b.team&&b.intent==='boxout'&&b.boxUntil>s.elapsed;
      const gap=aBox||bBox?34:24;
      if(length>=gap||a.hold>0&&b.hold>0)continue;
      const push=(gap-length)*Math.min(.36,dt*5);
      const sx=length?dx/length*push:push,sy=length?dy/length*push:0;
      if(!a.hold){
        a.x=clamp(a.x-sx*(aBox?.18:1),court.x+14,court.x+court.w-14);
        a.y=clamp(a.y-sy*(aBox?.18:1),court.y+12,court.y+court.h-12);
      }
      if(!b.hold){
        b.x=clamp(b.x+sx*(bBox?.18:1),court.x+14,court.x+court.w-14);
        b.y=clamp(b.y+sy*(bBox?.18:1),court.y+12,court.y+court.h-12);
      }
    }
  }

  const officialsArea={x:185,y:435,w:590,h:28};

  function moveOfficial(s,dt){
    const p=s.official??={x:480,y:449,vx:0,vy:0,pace:0,dir:0,pose:'idle',hold:0};
    const active=s.status==='play'||s.status==='inbound';
    const at=active?{x:clamp(480+(s.ball.x-480)*.62,210,750),y:449}:p;
    move(p,at,103,dt,'idle',officialsArea);
    if(p.pose==='idle'&&s.status==='play')face(p,s.ball.x-p.x,s.ball.y-p.y);
    if(p.dir===3)p.dir=0;
    moveCrew(s,dt);
  }

  function moveCrew(s,dt){
    const crew=s.crew??=community.map((row,index)=>({x:row[3],y:row[4],pose:'idle',phase:index*.11%1}));
    for(const [i,row] of community.entries()){
      if(row[5]==='ref')continue;
      const target=AI.reaction(s,row,i),p=crew[i];
      const amount=Math.min(1,dt*(row[5]==='coach'?3.8:6.4));
      p.x=mix(p.x,target.x,amount);p.y=mix(p.y,target.y,amount);
      p.pose=target.pose;p.phase=target.phase;
    }
  }

  function nearest(s,p,team) {
    let best=null, range=Infinity;
    for(const q of s.players){
      if(q.team!==team)continue;
      const d=distance(p,q);
      if(d<range){best=q;range=d;}
    }
    return {player:best,range};
  }

  function pressure(s,p) {
    return nearest(s,p,other(p.team)).range;
  }

  function hand(p,z){
    const dir=directions[p.dir]||directions[0];
    const reach=z>27?12:16;
    return {x:p.x+(dir.x||.48)*reach,y:p.y+dir.y*reach*.79,z};
  }

  function ballInHand(s,p,dt){
    const holding=s.shotMeter!==null||p.pose==='catch';
    const phase=p.handle??.42;
    const z=holding?30:5+22*4*phase*(1-phase);
    const at=hand(p,z);
    const blend=Math.min(1,dt*22);
    s.ball.x=mix(s.ball.x,at.x,blend);
    s.ball.y=mix(s.ball.y,at.y,blend);
    s.ball.z=mix(s.ball.z,at.z,blend);
  }

  function travel(s,type,end,z,duration,extra={}) {
    s.flight={type,end,from:{...s.ball},z,duration,time:0,...extra};
    s.carrier=null;
  }

  function pass(s,id,receiver) {
    const from=s.players[id],to=s.players[receiver];
    if(!from||!to||id===receiver||from.team!==to.team||s.carrier!==id||s.status!=='play'||s.clock<=0)return false;
    face(from,to.x-from.x,to.y-from.y,true);
    animate(from,'pass',.43);
    const duration=clamp(distance(from,to)/660,.18,.74);
    const lead=s.human&&to.id===0?Math.min(.62,(duration+.10)*.81)
      :Math.min(.39,.07+duration*(to.intent==='cut'||to.intent==='break'?.64:.48));
    const spot={x:clamp(to.x+(to.vx||0)*lead,court.x+14,court.x+court.w-14),
      y:clamp(to.y+(to.vy||0)*lead,court.y+12,court.y+court.h-12)};
    s.ball=hand(from,23);
    travel(s,'pass',spot,11,duration,{receiver,id,release:.10});
    s.lastPass=null;
    s.shotMeter=null;
    s.passes++;
    if(s.human&&id===0)s.stats.passer++;
    announce(s,roster[id][1]+' passa para '+roster[receiver][1]);
    return true;
  }

  function shotValue(p) {
    const rim=goal(p.team),depth=(p.x-rim.x)*(p.team===0?-1:1);
    return (depth<=Math.sqrt(arcRadius**2-cornerLine**2)?Math.abs(p.y-rim.y)>cornerLine:distance(p,rim)>arcRadius)?3:2;
  }

  function shotStyle(p,rim,value){
    if(value===1)return 'free';
    return value===3?'three':distance(p,rim)<111?'layup':'jumper';
  }

  function shotResult(f){
    const style=f.style||(f.type==='free-throw'?'free':f.value===3?'three':'jumper');
    const rim=goal(f.team),separation=distance(f.end,rim);
    if(f.made)return style==='layup'&&f.bank?'bank-in':(f.timing??.72)>.79?'clean':'rim-in';
    if(f.bank)return 'bank-out';
    return separation>29&&(f.timing??.4)<.46?'airball':'rim-out';
  }

  function impact(s,f){
    s.shotMoment={id:f.id,team:f.team,outcome:shotResult(f),value:f.value??1,
      side:f.end.y===goal(f.team).y?(f.team===0?1:-1):Math.sign(f.end.y-goal(f.team).y),
      style:f.style||(f.type==='free-throw'?'free':'jumper'),at:s.elapsed,foul:Boolean(f.foul)};
  }

  function shoot(s,id,timing) {
    const p=s.players[id];
    if(!p||s.carrier!==id||s.status!=='play'||s.clock<=0)return false;
    const rim=goal(p.team),range=distance(p,rim),defender=nearest(s,p,other(p.team)),value=shotValue(p);
    const user=p.id===0&&s.human;
    const chance=clamp(user?.27+.67*timing+clamp((defender.range-40)*.005,-.17,.14)-Math.max(0,range-83)*.00235
      :AI.shotRead(s,p).shot+(timing-.65)*.10+(p.team===1?(s.difficulty-1)*.045:0),.07,.97);
    const style=shotStyle(p,rim,value);
    const bank=style==='layup'&&Math.abs(p.y-rim.y)>29;
    const foul=!s.drill&&defender.range<38&&range<195&&random(s)<.15;
    const made=s.drill||(range<160&&defender.range>29&&timing>=.9&&user)||random(s)<chance;
    const end=made?{...rim}:{x:rim.x+(random(s)-.5)*48,y:rim.y+(random(s)-.5)*51};
    face(p,rim.x-p.x,rim.y-p.y,true);
    animate(p,'shoot',.72);
    if(defender.range<56)animate(defender.player,'defend',.47);
    s.shotMeter=null;
    s.stats.shots[p.team]++;
    s.ball=hand(p,23);
    travel(s,'shot',end,53+Math.min(43,range*.16),clamp(range/445+.33,.44,1.11),{id,team:p.team,value,made,foul,style,bank,timing,release:.19});
    announce(s,roster[id][1]+(value===3?' tentou de três':' foi para a cesta'));
    return true;
  }

  function steal(s,id) {
    const p=s.players[id],carrier=s.players[s.carrier];
    if(!p||!carrier||carrier.team===p.team||s.status!=='play'||s.cooldown>0)return false;
    const range=distance(p,carrier);
    if(range>stealReach||s.elapsed<(p.stealAfter||0))return false;
    p.stealAfter=s.elapsed+1.55;
    animate(p,'defend',.42);
    if(!s.drill&&random(s)>(range<28?.82:.52)){
      s.cooldown=.55;
      return false;
    }
    s.stats.turnovers[carrier.team]++;
    if(id===0)s.stats.steals++;
    give(s,id);
    animate(p,'catch',.32);
    announce(s,roster[id][1]+' roubou a bola','turnover');
    return true;
  }

  function turnover(s,message,spot) {
    s.stats.turnovers[s.possession]++;
    inbound(s,other(s.possession),message,'turnover',spot);
  }

  function freeThrows(s,f) {
    s.stats.fouls[other(f.team)]++;
    s.status='free-throw';
    s.freeThrow={id:f.id,left:f.made?1:f.value};
    s.restartUntil=s.elapsed+3.25;
    s.flight=null;
    s.carrier=f.id;
    s.shotMeter=null;
    s.wait=1.1;
    const rim=goal(f.team),direction=f.team===0?1:-1;
    for(const p of s.players){
      const edge=p.team===f.team?1:-1;
      p.mark={x:rim.x-direction*(p.slot>1?52+(p.slot-2)*28:237),y:rim.y+edge*(p.slot>1?68:100-p.slot*30)};
      p.hold=0;
    }
    const shooter=s.players[f.id];
    shooter.mark={x:rim.x-direction*122,y:rim.y};
    s.ball=hand(shooter,20);
    announce(s,(f.made?'Cesta e falta. ':'Falta no arremesso. ')+s.freeThrow.left+' lance'+(s.freeThrow.left>1?'s livres':' livre'),'foul');
  }

  function canShoot(s,id) {
    return s.carrier===id&&(s.status==='play'||s.status==='free-throw'&&s.wait<=0&&!s.flight);
  }

  function releaseFreeThrow(s,id,timing) {
    if(s.status!=='free-throw'||!canShoot(s,id))return false;
    const p=s.players[id],rim=goal(p.team);
    const made=(s.human&&id===0&&timing>.86)||random(s)<.48+.44*timing;
    const end=made?rim:{x:rim.x-10,y:rim.y+21};
    face(p,rim.x-p.x,rim.y-p.y,true);
    animate(p,'shoot',.72);
    s.shotMeter=null;
    s.ball=hand(p,25);
    travel(s,'free-throw',end,62,.65,{id,team:p.team,made,value:1,style:'free',timing,release:.19});
    return true;
  }

  function advanceFreeThrows(s,dt) {
    if(s.flight){advanceFlight(s,dt);return;}
    const shooter=s.players[s.freeThrow.id];
    for(const p of s.players)if(p.mark)move(p,p.mark,p===shooter?171:148,dt);
    if(shooter.mark&&distance(shooter,shooter.mark)>12&&s.elapsed<(s.restartUntil??0))s.wait=Math.max(.03,s.wait);
    else if(shooter.mark){
      for(const p of s.players){p.mark=null;p.vx=0;p.vy=0;p.pose='idle';}
      face(shooter,goal(shooter.team).x-shooter.x,goal(shooter.team).y-shooter.y,true);
    }
    s.ball=hand(shooter,s.shotMeter!==null?31:23);
    if(s.shotMeter!==null)s.shotMeter=(s.shotMeter+dt*(s.calm?.64:.95))%2;
    if(s.wait>0)return;
    const id=s.freeThrow.id;
    if(!s.human||id!==0)releaseFreeThrow(s,id,.64);
  }

  function resolveFreeThrow(s,f) {
    if(f.made){
      s.score[f.team]++;
      s.points[f.id]++;
      s.stats.freeThrows[f.team]++;
      if(f.id===0)s.stats.basket++;
      s.scoredAt=s.elapsed;
      s.lastScorer=f.id;
    }
    const result=f.made?'Lance livre convertido':'Lance livre perdido';
    if(--s.freeThrow.left>0){
      const p=s.players[f.id];
      s.flight=null;
      s.carrier=f.id;
      s.wait=.92;
      s.ball={x:p.x,y:p.y,z:20};
      announce(s,result+'. Resta um lance livre.');
      return;
    }
    s.freeThrow=null;
    if(f.made||s.clock<=0){inbound(s,other(f.team),result,f.made?'basket':'inbound');return;}
    s.status='play';
    const direction=f.team===0?-1:1;
    travel(s,'rebound',{x:f.end.x+direction*49,y:f.end.y+(random(s)-.5)*75},40,.56,{board:true});
    announce(s,result+'. Rebote!','loose');

  }

  function resolveFlight(s,f) {
    if(f.type==='shot'||f.type==='free-throw')impact(s,f);
    if(f.type==='free-throw'){resolveFreeThrow(s,f);return;}
    if(f.type==='shot'&&f.made){
      s.score[f.team]+=f.value;
      s.points[f.id]+=f.value;
      s.stats.made[f.team]++;
      if(s.lastPass?.to===f.id&&s.elapsed-s.lastPass.at<4)s.stats.assists[f.team]++;
      if(f.id===0)s.stats.basket++;
      animate(s.players[f.id],'cheer',.8);
      s.scoredAt=s.elapsed;
      s.lastScorer=f.id;
      if(f.foul)freeThrows(s,f);
      else inbound(s,other(f.team),roster[f.id][1]+' marcou '+f.value,'basket');
      return;
    }
    if(f.type==='shot'){
      if(f.foul){s.stats.shots[f.team]--;freeThrows(s,f);return;}
      if(f.id===0)s.stats.missed++;
      s.flight=null;
      if(s.clock<=0)return;
      const direction=f.team===0?-1:1;
      const outcome=s.shotMoment.outcome;
      const reach=32+random(s)*85,scatter=(random(s)-.5)*151;
      const end=outcome==='airball'?{x:f.end.x-direction*45,y:f.end.y+scatter*.72}
        :{x:f.end.x+direction*reach*(outcome==='bank-out'?1.24:1),y:f.end.y+scatter};
      travel(s,'rebound',end,outcome==='airball'?7:43,outcome==='airball'?.47:.68,{board:true});
      const call=outcome==='airball'?'Não tocou no aro.':outcome==='bank-out'?'A bola voltou da tabela.':'A bola bateu no aro.';
      announce(s,call+' Rebote!','loose');
      return;
    }
    const dx=f.end.x-f.from.x,dy=f.end.y-f.from.y,length=Math.max(1,Math.hypot(dx,dy));
    const roll=f.type==='pass'?50:34;
    const stop={x:f.end.x+dx/length*roll,y:f.end.y+dy/length*roll};
    travel(s,'loose',stop,18,.79,{board:f.type==='rebound'||Boolean(f.board)});
    if(f.type==='pass')announce(s,'Passe escapou. Bola solta!','loose');
  }

  function recover(s,f,p){
    const oldTeam=s.possession,change=p.team!==oldTeam,name=roster[p.id][1];
    const board=f.type==='rebound'||Boolean(f.board);
    const at=s.ball;
    const intended=f.type==='pass'&&f.receiver===p.id;
    if(intended)face(p,f.from.x-f.end.x,f.from.y-f.end.y,true);
    else face(p,at.x-p.x,at.y-p.y,true);
    if(change&&!board){
      s.stats.turnovers[oldTeam]++;
      if(p.id===0)s.stats.steals++;
    }
    give(s,p.id,change||board);
    s.ball=at;
    p.vx*=.62;
    p.vy*=.62;
    animate(p,'catch',board?.36:.29);
    if(board){
      s.stats.rebounds[p.team]++;
      if(!change)s.shotClock=14;
      announce(s,name+' pegou o rebote','rebound');
    }else if(change)announce(s,name+(f.type==='pass'?' interceptou o passe':' recuperou a bola'),'turnover');
    else if(f.type==='pass'){
      s.lastPass={from:f.id,to:p.id,at:s.elapsed};
      announce(s,name+' recebeu o passe','received');
    }else announce(s,name+' recuperou a bola','received');
  }

  function tryRecovery(s,f,t){
    const pass=f.type==='pass',rebound=f.type==='rebound';
    if(s.ball.z>(rebound?reboundHeight:catchHeight)||pass&&t<.19||rebound&&t<.43)return false;
    let catcher=null,nearestReach=Infinity;
    for(const p of s.players){
      const intended=pass&&p.id===f.receiver;
      if(!intended&&p.hold>0&&p.pose!=='catch'&&p.pose!=='defend')continue;
      const teammate=pass&&p.team===s.possession;
      if(pass&&(p.id===f.id||teammate&&!intended&&t<.94||intended&&t<.64||s.drill&&!intended))continue;
      const range=distance(p,s.ball);
      const reserve=(rebound||f.board)&&p.intent==='boxout'&&p.boxUntil>s.elapsed?8:0;
      const reach=intended?catchReach+7:pass&&!teammate?16:catchReach+(rebound?AI.profile(p).boards*3:0)+reserve;
      if(range>reach)continue;
      const arrival=range-(intended?5:reserve*.65);
      if(arrival<nearestReach){catcher=p;nearestReach=arrival;}
    }
    if(!catcher)return false;
    recover(s,f,catcher);
    return true;
  }

  function advanceFlight(s,dt) {
    const f=s.flight;
    const release=f.release||0,shooter=s.players[f.id];
    const endTime=f.duration+release;
    f.time=Math.min(endTime,f.time+dt);
    const pass=f.type==='pass',shot=f.type==='shot'||f.type==='free-throw';
    if(release&&f.time<release&&shooter){
      s.ball=hand(shooter,mix(pass?23:24,shot?47:28,smooth(f.time/release)));
      return;
    }
    if(release&&!f.released){
      f.released=true;
      if(shooter)f.from=hand(shooter,shot?47:28);
    }
    const arrived=f.time>=endTime;
    const t=arrived?1:clamp((f.time-release)/f.duration,0,1);
    const loose=f.type==='loose';
    const progress=loose?t*(2-t):t;
    s.ball.x=mix(f.from.x,f.end.x,progress);
    s.ball.y=mix(f.from.y,f.end.y,progress);
    s.ball.z=loose?6+Math.abs(Math.sin(t*Math.PI*2.7))*f.z*(1-t)
      :Math.max(6,mix(f.from.z,shot?38:pass?20:6,t)+4*f.z*t*(1-t));
    if(!shot){
      if(s.ball.x<court.x||s.ball.x>court.x+court.w||s.ball.y<court.y||s.ball.y>court.y+court.h){
        const spot={x:clamp(s.ball.x,court.x+15,court.x+court.w-15),y:clamp(s.ball.y,court.y+13,court.y+court.h-13)};
        turnover(s,'Bola fora. Reposição.',spot);
        return;
      }
      if(tryRecovery(s,f,t))return;
    }
    if(arrived&&!loose)resolveFlight(s,f);
  }

  function passLane(s,p,q){
    const dx=q.x-p.x,dy=q.y-p.y,span=Math.max(1,dx*dx+dy*dy);
    let clear=86;
    for(const rival of s.players){
      if(rival.team===p.team)continue;
      const t=((rival.x-p.x)*dx+(rival.y-p.y)*dy)/span;
      if(t>.12&&t<.93)clear=Math.min(clear,Math.hypot(rival.x-p.x-dx*t,rival.y-p.y-dy*t));
    }
    return clear;
  }

  function selectPass(s,p) {
    const rim=goal(p.team),pressed=pressure(s,p)<57;
    const score=q=>{
      const gap=distance(p,q),lane=passLane(s,p,q),open=pressure(s,q);
      const outlet=pressed&&q.intent==='show'&&gap<156&&lane>=19;
      return distance(q,rim)*(pressed?.09:.21)+gap*(pressed?.46:.21)-Math.min(80,open)*.44
        -lane*(pressed?1.18:.96)-(outlet?24:0)+(lane<19?39:0);
    };
    return s.players.filter(q=>q.team===p.team&&q!==p).sort((a,b)=>score(a)-score(b))[0];
  }

  function shotWindow(s,id=0) {
    const p=s.players[id],rim=goal(p.team);
    const free=s.status==='free-throw';
    const reach=free?0:distance(p,rim),guard=free?120:pressure(s,p);
    const width=clamp(.255-Math.max(0,reach-135)*.00033-Math.max(0,46-guard)*.002+(s.calm?.06:0),.115,.31);
    return {start:.78-width/2,end:.78+width/2,reach,guard,style:shotStyle(p,rim,free?1:shotValue(p))};
  }

  function canBoxOut(s,id=0){
    const f=s.flight;
    return s.status==='play'&&(f?.type==='shot'||f?.type==='rebound'||f?.type==='loose'&&f.board)
      &&(s.players[id]?.boxUntil??0)<=s.elapsed;
  }

  function boxOut(s,id=0){
    const p=s.players[id];
    if(!p||!canBoxOut(s,id))return false;
    p.boxUntil=s.elapsed+.76;
    return true;
  }

  function shotTiming(s,id=0){
    const gauge=1-Math.abs((s.shotMeter??0)-1),window=shotWindow(s,id);
    const gap=gauge<window.start?window.start-gauge:Math.max(0,gauge-window.end);
    return {gauge,grade:gap===0?1:clamp(.82-gap*2.1,.07,.82),inside:gap===0,
      early:(s.shotMeter??0)<=1?gauge<window.start:gauge>window.end};
  }

  function display(s){
    const seconds=Math.ceil(Math.max(0,s.clock)),period=s.quarter>s.periods
      ?'Prorrogação '+(s.quarter-s.periods):s.quarter+'º período';
    return {period,clock:Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'),
      possession:s.status==='play'?String(Math.ceil(s.shotClock)).padStart(2,'0'):'—',
      urgent:s.status==='play'&&s.shotClock<=5,finished:s.status==='final'};
  }

  function endPeriod(s) {
    const overtime=s.quarter>=s.periods&&s.score[0]===s.score[1];
    s.carrier=null;
    s.shotMeter=null;
    s.flight=null;
    if(s.quarter>=s.periods&&!overtime){
      s.status='final';
      s.ball.z=0;
      s.wait=9;
      const winner=s.score[0]>s.score[1]?0:1;
      for(const p of s.players)animate(p,p.team===winner?'cheer':'idle',9);
      announce(s,teams[winner].name+' venceu','final');
      return;
    }
    s.quarter++;
    s.clock=overtime?24:s.period;
    s.status='period';
    s.wait=s.quarter===3?3.6:2.25;
    s.shotClock=shotLimit;
    s.passes=0;
    s.possession=s.alternate;
    s.alternate=other(s.alternate);
    layout(s,s.possession,false,true);
    s.ball={...courtCenter,z:0};
    announce(s,overtime?'Prorrogação':s.quarter===3?'Intervalo. Volta à quadra.':'Início do '+s.quarter+'º período','period');
  }

  function stoppage(s,dt) {
    s.wait-=dt;
    if(s.status==='free-throw'){advanceFreeThrows(s,dt);return;}
    if(s.status==='tip'){
      s.ball.z=Math.sin(clamp(s.wait/1.45,0,1)*Math.PI)*94;
      if(s.wait<.81&&s.wait>.76)for(const id of [0,5])animate(s.players[id],'catch',.37);
    }
    if(s.status==='period')for(const p of s.players)if(p.mark)move(p,p.mark,182,dt);
    if(s.status==='inbound'&&s.inbound){
      const receiver=s.players[s.inboundId??=inboundReceiver(s).id];
      for(const p of s.players){
        if(s.human&&p.id===0)continue;
        const plan=AI.move(s,p),at=p===receiver?s.inbound:plan;
        p.intent=p===receiver?'inbound':plan.intent;
        move(p,p.hold>0?p:at,p===receiver?175:plan.speed*.89,dt,'idle',court,plan.stride);
      }
      if(!(s.human&&receiver.id===0)&&distance(receiver,s.inbound)>20)s.wait=Math.max(.03,s.wait);
    }
    if(s.wait>0||s.status==='final')return;
    if(s.clock<=0){endPeriod(s);return;}
    const receiver=s.status==='inbound'?s.inboundId:s.possession*5;
    s.status='play';
    s.passes=0;
    for(const p of s.players)p.mark=null;
    give(s,receiver);
    animate(s.players[s.carrier],'catch',.28);
  }

  function decide(s,carrier) {
    if(s.drill){
      if(carrier.team===0)pass(s,carrier.id,0);
      return;
    }
    const choice=AI.decide(s,carrier);
    if(choice.type==='shoot')shoot(s,carrier.id,choice.grade);
    else if(choice.type==='pass'){
      if(choice.id===0)s.requestUntil=0;
      pass(s,carrier.id,choice.id);
    }else s.decision=choice.delay;
  }

  function tick(s,dt,input=null) {
    s.stats.made??=[0,0];
    s.stats.assists??=[0,0];
    s.stats.fouls??=[0,0];
    s.stats.freeThrows??=[0,0];
    s.alternate??=other(s.possession);
    s.age??=0;
    dt=clamp(dt,0,.05);
    s.elapsed+=dt;
    s.cooldown=Math.max(0,s.cooldown-dt);
    for(const p of s.players){
      p.hold=Math.max(0,p.hold-dt);
      p.poseAge=(p.poseAge||0)+dt;
      p.boxUntil??=0;
      if(!s.human||p.id!==0)AI.condition(p,dt,s.status==='play');
    }
    if(s.status!=='play'){stoppage(s,dt);moveOfficial(s,dt);return;}
    if(!s.drill){
      const assist=s.calm&&s.possession===0;
      s.clock=Math.max(0,s.clock-dt*(assist?.61:1));
      if(s.flight?.type!=='shot'&&s.flight?.type!=='rebound'&&!s.flight?.board)s.shotClock=Math.max(0,s.shotClock-dt*(assist?.56:1));
    }
    s.age+=dt;
    if(s.clock<=0&&s.flight?.type!=='shot'){endPeriod(s);return;}
    if(s.shotClock<=0&&s.flight?.type!=='shot'&&s.flight?.type!=='rebound'&&!s.flight?.board){turnover(s,'Tempo de posse esgotado');return;}
    if(s.shotMeter!==null)s.shotMeter=(s.shotMeter+dt*(s.calm?.64:.95))%2;
    const carrier=s.players[s.carrier];
    for(const p of s.players){
      const user=s.human&&p.id===0;
      const boxing=user&&p.boxUntil>s.elapsed&&s.flight&&s.flight.type!=='pass';
      const running=user&&input?.sprint&&distance(input,p)>4&&!boxing&&(p.burst??1)>.08;
      if(user)p.burst=clamp((p.burst??1)+dt*(running?-.38:.29),0,1);
      const plan=user?{...(input||p),speed:boxing?74:running?(carrier===p?180:195):151,
        stance:boxing?'guard':'idle',look:boxing?s.ball:null,stride:running?82:74,intent:boxing?'boxout':'player'}:AI.move(s,p);
      const receiving=plan.intent==='receive';
      if(receiving){
        p.hold=0;
        face(p,plan.look.x-p.x,plan.look.y-p.y);
      }
      const frozen=p.hold>0&&p.pose!=='catch'&&!['receive','rebound','recover'].includes(plan.intent);
      const catching=p.hold>0&&p.pose==='catch';
      p.intent=plan.intent;
      move(p,frozen?p:plan,plan.speed*(catching?.67:1),dt,carrier===p?'dribble':plan.stance,court,plan.stride);
    }
    if(!s.drill)separate(s,dt);
    moveOfficial(s,dt);
    if(s.flight){
      advanceFlight(s,dt);
      if(!s.flight&&s.clock<=0&&s.status!=='free-throw')endPeriod(s);
      return;
    }
    if(!carrier)return;
    ballInHand(s,carrier,dt);
    if(!s.drill){
      const defender=AI.challenge(s,carrier,dt,random);
      if(defender&&steal(s,defender.id))return;
    }
    if(s.human&&carrier.id===0)return;
    s.decision-=dt;
    if(s.decision<=0)decide(s,carrier);
  }

  window.V.BasketballMatch={court,baskets,teams,roster,community,arcRadius,cornerLine,stealReach,create,tick,pass,shoot,shotValue,canShoot,releaseFreeThrow,shotResult,canBoxOut,boxOut,steal,give,goal,pressure,selectPass,passLane,tactic:AI.tactic,shotWindow,shotTiming,display,announce,elapsedSince,clamp,distance};
});
