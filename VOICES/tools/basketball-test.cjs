'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { environment } = require('./runtime-upgrade-test.cjs');

async function run() {
  const bundled = process.argv.includes('--bundle');
  const { V, w, dom, canvases } = await environment({ bundle: bundled, ready: bundled });
  try {
    const M = V.BasketballMatch;
    const shotArt=V.BasketballShotArt;
    const rightRim=M.goal(0);
    const shots=[
      ['clean',{made:true,timing:1}],['rim-in',{made:true,timing:.55}],
      ['bank-in',{made:true,bank:true,style:'layup'}],['rim-out',{made:false,timing:.61}],
      ['bank-out',{made:false,bank:true}],['airball',{made:false,timing:.1,end:{x:rightRim.x-40,y:rightRim.y}}]
    ];
    for(const [outcome,setup] of shots){
      assert.equal(M.shotResult({team:0,end:rightRim,...setup}),outcome);
      const pose=shotArt.frame(outcome,1,.67),mirror=shotArt.frame(outcome,-1,.67);
      assert(Math.abs(pose.x+mirror.x-1)<1e-8);
      assert.equal(pose.y,mirror.y);
      assert(shotArt.frame(outcome,1,-1).y<.12);
    }
    assert(shotArt.frame('clean',1,.29).depth);
    assert(shotArt.frame('rim-out',1,.67).x>.75);
    const frame=(outcome,t)=>shotArt.frame(outcome,1,t);
    assert.equal(frame('rim-in',.045).contact,'rim');
    assert(frame('rim-in',.21).y<frame('rim-in',.055).y);
    assert.equal(frame('rim-in',.435).contact,'rim');
    assert(frame('rim-in',.49).y<frame('rim-in',.43).y);
    assert(frame('rim-in',.77).depth&&Math.abs(frame('rim-in',.77).sway)>.005);
    assert.equal(frame('rim-out',.06).contact,'rim');
    assert(frame('rim-out',.26).y<frame('rim-out',.07).y);
    assert(frame('rim-out',.74).x>.9&&!frame('rim-out',.74).depth);
    assert.equal(frame('bank-out',.07).contact,'board');
    assert.equal(frame('airball',.57).contact,null);
    assert(frame('airball',.57).x>.8&&!frame('airball',.57).depth);
    assert.match(shotArt.message({outcome:'rim-out',value:2}),/^Fora/);
    for (const seed of [4219, 22, 135]) {
      const s = M.create({ seed });
      const signals = new Set(), scored = new Set(), tactics = new Set(), poses = new Set();
      const intent = s.players.map(() => new Set());
      let differentPaces = false;
      for (let i = 0; i < 12000 && s.status !== 'final'; i++) {
        M.tick(s, .04);
        signals.add(s.signal);
        if (s.flight?.type === 'shot') scored.add(s.flight.value);
        if(s.status==='play'){
          tactics.add(M.tactic(s));
          for(const p of s.players){
            if(p.intent)intent[p.id].add(p.intent);
            poses.add(p.pose);
          }
          const active=s.players.filter(p=>p.pose==='run'&&Math.hypot(p.vx,p.vy)>30);
          if(new Set(active.map(p=>Math.round(Math.hypot(p.vx,p.vy)))).size>2)differentPaces=true;
        }
        assert(s.players.every(p => p.x >= M.court.x && p.x <= M.court.x + M.court.w &&
          p.y >= M.court.y && p.y <= M.court.y + M.court.h));
      }
      assert.equal(s.status, 'final');
      assert(s.quarter >= 4 && s.score[0] !== s.score[1]);
      assert(s.stats.rebounds.some(n => n > 0));
      assert(s.stats.made.some(n => n > 0));
      assert(s.stats.assists.some(n => n > 0));
      assert(signals.has('period') && signals.has('basket') && signals.has('turnover'));
      assert(scored.has(2));
      assert(tactics.size>=3);
      assert(differentPaces);
      assert(intent.every(own=>own.size>=4));
      const all=new Set(intent.flatMap(set=>Array.from(set)));
      for(const behavior of ['drive','cut','press','rebound','outlet'])assert(all.has(behavior),behavior);
      for(const pose of ['run','dribble','pass','shoot','catch','defend'])assert(poses.has(pose),pose);
      assert(s.crew[0].phase!==s.crew[3].phase);
      for (let i = 0; i < 2; i++) assert.equal(s.score[i], s.points.slice(i * 5, i * 5 + 5).reduce((a, b) => a + b));
    }

    const motion=M.create({ human:true, drill:true });
    motion.status='play';
    M.give(motion,0);
    const runner=motion.players[0],startX=runner.x;
    M.tick(motion,.04,{x:runner.x+90,y:runner.y});
    assert(runner.x>startX&&runner.x-startX<4);
    for(let i=0;i<7;i++)M.tick(motion,.04,{x:runner.x+90,y:runner.y});
    assert(runner.vx>100);
    const runX=runner.x, runSpeed=runner.vx;
    M.tick(motion,.04);
    assert(runner.x>runX&&runner.vx<runSpeed);
    for(let i=0;i<8;i++)M.tick(motion,.04);
    assert.equal(runner.vx,0);
    const view=M.display(motion);
    assert.match(view.clock,/^\d+:\d{2}$/);
    assert.match(view.possession,/^\d{2}$/);
    motion.shotMeter=.78;
    assert.equal(M.shotTiming(motion).inside,true);
    motion.shotMeter=.1;
    assert.equal(M.shotTiming(motion).early,true);

    const sprint=M.create({human:true,drill:true});
    sprint.status='play';
    M.give(sprint,0);
    const runnerSprint=sprint.players[0],startSprint=runnerSprint.x;
    for(let i=0;i<11;i++)M.tick(sprint,.04,{x:runnerSprint.x+62,y:runnerSprint.y,sprint:true});
    assert(runnerSprint.vx>166&&runnerSprint.x>startSprint+50&&runnerSprint.burst<.86);
    const drained=runnerSprint.burst;
    M.tick(sprint,.04);
    assert(runnerSprint.burst>drained);
    assert(!M.boxOut(sprint));

    const reception=M.create({human:true,period:60});
    reception.status='play';
    reception.players.forEach((p,i)=>Object.assign(p,{x:i<5?735:150,y:158+p.slot*61}));
    Object.assign(reception.players[0],{x:345,y:285});
    Object.assign(reception.players[2],{x:455,y:285});
    M.give(reception,0);
    assert(M.pass(reception,0,2));
    M.tick(reception,.04);
    assert.equal(reception.carrier,null);
    assert.equal(reception.players[2].intent,'receive');
    for(let i=0;i<35&&reception.carrier==null;i++)M.tick(reception,.04);
    assert.equal(reception.carrier,2);
    assert.equal(reception.players[2].pose,'catch');
    assert(M.distance(reception.players[2],reception.ball)<=25);
    assert.equal(reception.signal,'received');
    assert.equal(reception.lastPass.from,0);
    assert.equal(reception.possessionId,1);
    assert(reception.shotClock<24);

    const pressed=M.create({seed:9482,human:true,period:42});
    pressed.status='play';
    const replayPositions=[[372,285],[592,385],[648,194],[673,342],[752,322],
      [406,285],[567,174],[640,227],[582,341],[716,302]];
    pressed.players.forEach((p,i)=>{
      const [x,y]=replayPositions[i];
      Object.assign(p,{x,y,stealAfter:99});
    });
    const handler=pressed.players[0];
    M.give(pressed,0);
    for(let i=0;i<50;i++)M.tick(pressed,.04);
    const outlet=M.selectPass(pressed,handler);
    assert.equal(outlet.intent,'show');
    assert(M.distance(handler,outlet)<130);
    assert(M.passLane(pressed,handler,outlet)>20);
    assert(pressed.players.slice(1,5).filter(p=>p.x>handler.x+160).length>=2);
    assert(M.pass(pressed,0,outlet.id));
    for(let i=0;i<30&&pressed.carrier==null;i++)M.tick(pressed,.04);
    assert.equal(pressed.carrier,outlet.id);

    const shield=V.BasketballAI.create(M);
    const rival=pressed.players[5];
    rival.stealAfter=0;
    rival.hold=0;
    M.give(pressed,0);
    Object.assign(handler,{x:372,y:285});
    Object.assign(rival,{x:358,y:285});
    Object.assign(pressed,{age:2,cooldown:0,ball:{x:387,y:285,z:12}});
    assert.equal(shield.challenge(pressed,handler,.04,()=>0),null);
    rival.x=394;
    assert.equal(shield.challenge(pressed,handler,.04,()=>0),rival);

    for(const [dir,hx,hy,x,y] of [[1,-1,0,372,296],[2,1,0,372,285],
      [3,0,-1,395,300],[0,0,1,395,254],[1,-1,0,371,159],[3,0,-1,390,142],[0,0,1,395,428]]){
      const dribble=M.create({seed:9482,human:true,period:42});
      dribble.status='play';
      dribble.players.forEach((p,i)=>{
        const [px,py]=replayPositions[i];
        Object.assign(p,{x:px,y:py,stealAfter:i===5?0:99});
      });
      const ballHandler=dribble.players[0],defender=dribble.players[5];
      const atLine=y===142||y===428;
      Object.assign(ballHandler,{x,y,dir});
      Object.assign(defender,{x:x-hx*34,y:y-hy*34});
      M.give(dribble,0);
      let goingAround=false,reachedBallSide=false,contact=Infinity;
      for(let i=0;i<150&&dribble.carrier===0;i++){
        M.tick(dribble,.04);
        const dx=defender.x-ballHandler.x,dy=defender.y-ballHandler.y;
        const ahead=dx*hx+dy*hy;
        goingAround||=defender.intent==='flank';
        reachedBallSide||=atLine?ahead>-8&&Math.abs(dx)>22:ahead>14;
        contact=Math.min(contact,M.distance(defender,ballHandler));
        if(!reachedBallSide)assert.equal(dribble.carrier,0);
      }
      assert(goingAround&&reachedBallSide);
      assert(contact>=25);
      assert.equal(dribble.carrier,defender.id);
      assert.equal(dribble.signal,'turnover');
    }

    for(const [from,to,back,facing,pose] of [
      [{x:350,y:285},{x:459,y:285},2,1,'cheer'],
      [{x:510,y:360},{x:510,y:245},3,0,'pass'],
      [{x:607,y:282},{x:490,y:282},1,2,'shoot'],
      [{x:510,y:197},{x:510,y:329},0,3,'cheer']
    ]){
      const behind=M.create({human:true,period:60});
      behind.status='play';
      behind.players.forEach((p,i)=>Object.assign(p,{x:i<5?755:153,y:152+p.slot*61}));
      Object.assign(behind.players[0],from);
      const runner=behind.players[2];
      Object.assign(runner,to,{dir:back,pose,hold:.54,poseLength:.54});
      M.give(behind,0);
      assert(M.pass(behind,0,2));
      M.tick(behind,.04);
      assert.equal(behind.carrier,null);
      assert.equal(runner.dir,facing);
      for(let i=0;i<20&&behind.carrier==null;i++)M.tick(behind,.04);
      assert.equal(behind.carrier,2);
      assert.equal(behind.signal,'received');
      assert.equal(runner.pose,'catch');
      assert.equal(runner.dir,facing);
      assert(M.distance(runner,behind.ball)<=31);
    }

    const bounced=M.create({human:true,period:60});
    bounced.status='play';
    bounced.players.forEach((p,i)=>Object.assign(p,{x:168+p.slot*23,y:i<5?196:349}));
    Object.assign(bounced,{ball:{x:745,y:265,z:39},flight:{type:'rebound',board:true,
      from:{x:745,y:265,z:39},end:{x:691,y:281},z:43,time:0,duration:.46}});
    for(let i=0;i<14;i++)M.tick(bounced,.04);
    assert.equal(bounced.flight.type,'loose');
    assert.equal(bounced.carrier,null);
    assert.equal(bounced.stats.rebounds[0]+bounced.stats.rebounds[1],0);
    for(let i=0;i<210&&bounced.carrier==null;i++)M.tick(bounced,.04);
    assert(bounced.carrier>0);
    assert(M.distance(bounced.players[bounced.carrier],bounced.ball)<=27);
    assert.equal(bounced.players[bounced.carrier].pose,'catch');
    assert.equal(bounced.stats.rebounds[0]+bounced.stats.rebounds[1],1);

    const escaped=M.create({human:true,period:60});
    escaped.status='play';
    escaped.players.forEach((p,i)=>Object.assign(p,{x:i<5?760:130,y:156+p.slot*62}));
    Object.assign(escaped.players[1],{x:380,y:285});
    Object.assign(escaped.players[0],{x:500,y:285});
    M.give(escaped,1);
    assert(M.pass(escaped,1,0));
    Object.assign(escaped.players[0],{x:300,y:174});
    for(let i=0;i<30&&escaped.flight?.type==='pass';i++)M.tick(escaped,.04);
    assert.notEqual(escaped.carrier,0);
    assert.equal(escaped.flight?.type,'loose');
    assert.equal(escaped.signal,'loose');

    const baseline=M.create({human:true,period:60,snapshot:{possession:1,points:[6,6,5,4,5,7,5,6,4,6]}});
    const restart={...baseline.inbound};
    for(let i=0;i<280&&baseline.status==='inbound';i++)M.tick(baseline,.04);
    assert.equal(baseline.status,'play');
    assert(baseline.carrier>=5);
    assert(M.distance(baseline.players[baseline.carrier],restart)<=20);

    const rim = M.goal(0);
    assert.equal(M.shotValue({ team: 0, x: rim.x - 218, y: rim.y }), 2);
    assert.equal(M.shotValue({ team: 0, x: rim.x - 222, y: rim.y }), 3);
    assert.equal(M.shotValue({ team: 0, x: rim.x - 55, y: rim.y + 145 }), 3);
    const overtime = M.create({ human: true, period: .01, periods: 1 });
    overtime.status = 'play';
    M.tick(overtime, .04);
    assert.equal(overtime.quarter, 2);
    assert.equal(overtime.last, 'Prorrogação');
    const buzzer = M.create({ human: true, drill: true, period: .01, periods: 1 });
    buzzer.status = 'play';
    M.give(buzzer, 0);
    assert(M.shoot(buzzer, 0, 1));
    buzzer.drill = false;
    for (let i = 0; i < 50 && buzzer.status !== 'final'; i++) M.tick(buzzer, .04);
    assert.equal(buzzer.status, 'final');
    assert(buzzer.score[0] > 0);
    assert.equal(buzzer.flight, null);
    assert.equal(buzzer.shotMoment.outcome,'clean');

    const fractional=M.create({human:true,periods:1});
    Object.assign(fractional,{status:'play',clock:0,carrier:null,flight:{type:'shot',end:{...M.goal(1)},
      from:{x:195,y:344,z:47},z:65,duration:.49524907559689746,time:.68,id:5,team:1,value:2,made:true,release:.19,released:true}});
    M.tick(fractional,.04);
    assert.equal(fractional.score[1],2);
    assert.equal(fractional.flight,null);
    M.tick(fractional,.04);
    assert.equal(fractional.status,'final');

    const foul = M.create({ human: true });
    foul.status = 'play';
    M.give(foul, 0);
    assert(M.shoot(foul, 0, 1));
    Object.assign(foul.flight, { made: true, foul: true });
    for (let i = 0; i < 100 && !M.canShoot(foul, 0); i++) M.tick(foul, .04);
    assert.equal(foul.status, 'free-throw');
    assert.equal(foul.stats.fouls[1], 1);
    const pointsBefore = foul.score[0], clockBefore = foul.clock;
    assert(M.releaseFreeThrow(foul, 0, 1));
    for (let i = 0; i < 23; i++) M.tick(foul, .04);
    assert.equal(foul.score[0], pointsBefore + 1);
    assert.equal(foul.clock, clockBefore);
    assert.equal(foul.stats.freeThrows[0], 1);

    await V.Game.init();
    V.settings.playerCharacters = ['nia'];
    V.settings.challengePlayers = 1;
    V.Game.newState({ name: 'Ginásio', character: 'nia' });
    Object.assign(V.state.flags, { prologueDone: true, prologueStarted: true });
    V.Game.startGame();
    await V.MapAssets.whenReady();
    V.UI.close();
    V.Onboarding.active = false;
    V.Onboarding.suspended = true;
    V.GuideOverlay.hide();
    V.World.load('university-sports');
    await V.MapAssets.whenReady();
    V.World.transition = 0;
    const gym = V.World.current;
    const coach = gym.objects.find(o => o.id === 'gym-joana');
    const sx=gym.court.w/M.court.w,sy=gym.court.h/M.court.h;
    assert(Math.abs(sx-sy)<1e-8);
    const game=V.CampusBasketball.match(gym);
    for(let i=0;i<150;i++)V.CampusBasketball.update(gym,.04);
    const gymAthlete=gym.objects.find(x=>x.id==='gym-dara'),dara=game.players[0];
    assert(Math.abs(gymAthlete.x-gym.court.x-(dara.x-M.court.x)*sx)<1e-8);
    assert(Math.abs(gymAthlete.y-gym.court.y-(dara.y-M.court.y)*sx)<1e-8);
    assert(coach && V.World.interactables().includes(coach));
    assert.equal(gym.objects.filter(o => o.type === 'gym-athlete').length, 10);
    assert.equal(gym.objects.filter(o => o.type === 'gym-community').length, 15);
    assert.deepEqual(Array.from(V.BasketballArt.atlases, im => [im.naturalWidth, im.naturalHeight]),
      [[3960, 1760], [3960, 1760], [2112, 1496]]);
    const sample=w.document.createElement('canvas');
    sample.width=sample.height=88;
    const pixels=sample.getContext('2d');
    const torsoFrames=[[1,17],[2,17],[2,21],[2,23],[5,21],[6,23],[9,21],[10,23],[13,21],[14,23],[17,21],[18,23]];
    for(const atlas of V.BasketballArt.atlases.slice(0,2)){
      for(const [row,column] of torsoFrames){
        pixels.clearRect(0,0,88,88);
        pixels.drawImage(atlas,column*88,row*88,88,88,0,0,88,88);
        const torso=pixels.getImageData(43,54,4,6).data;
        for(let i=3;i<torso.length;i+=4)assert(torso[i]>=240,`Translucent torso at ${row}, ${column}`);
        assert.equal(pixels.getImageData(0,0,1,1).data[3],0);
      }
    }
    assert.equal(V.BasketballArt.frameCounts.run,6);
    assert.equal(V.BasketballArt.frameCounts.shoot,6);
    assert.equal(V.BasketballArt.gear.naturalWidth,256);
    assert.equal(V.BasketballArt.gear.naturalHeight,256);
    V.Game.interact(coach);
    assert(V.$('#gym-watch'));
    const scheduled = [], requestFrame = w.requestAnimationFrame;
    w.requestAnimationFrame = callback => scheduled.push(callback);
    V.$('#gym-watch').click();
    const live = V.$('#gym-live');
    assert(live);
    const elapsed = V.CampusBasketball.match(gym).elapsed;
    scheduled.shift()(1000);
    scheduled.shift()(1040);
    w.requestAnimationFrame = requestFrame;
    assert(V.CampusBasketball.match(gym).elapsed > elapsed);
    assert.match(V.$('#gym-live-score').textContent, /Aurora .* Tambor/);
    const review = path.join(__dirname, '../.qa/review');
    fs.mkdirSync(review, { recursive: true });
    fs.writeFileSync(path.join(review, 'basketball-live.png'), canvases.get(live).canvas.toBuffer('image/png'));
    V.$('#gym-live-join').click();
    assert.equal(V.ChallengeCatalog.selected, 'play:basketball-virada');
    assert.equal(V.ChallengeCatalog.item('play:basketball').group, 'action');
    assert.equal(V.ChallengeCatalog.item('play:basketball-virada').group, 'action');

    const P = V.Playground, id = 'basketball-virada';
    const catalog=V.ChallengeCatalog;
    const cup=P.make('basketball','qa-saved-cup',{kind:'stage',id:'qa-saved-cup',stage:0});
    catalog.query='basquete';
    catalog.open('all');
    assert.deepEqual(Array.from(V.$$('[data-challenge-open]'),card=>card.dataset.challengeOpen),['play:basketball-virada']);
    assert.match(V.$('#challenge-grid').textContent,/Copa do Campus guardada/);
    V.$('[data-challenge-open]').click();
    assert.match(V.$('#challenge-alternate').textContent,/Continuar a Copa do Campus/);
    V.$('#challenge-alternate').click();
    assert.equal(catalog.selected,'play:basketball');
    V.$('#challenge-play').click();
    assert.equal(P.active,cup);
    P.detach();
    catalog.query='';
    const controller = P.controllers[id];
    const lesson = controller.create(true);
    assert.equal(lesson.match.drill, true);
    assert.equal(lesson.match.score[0], 0);
    for (const [stage, gap] of [2, 4, 6].entries()) {
      const r = P.make(id, 'virada-'+stage, { kind: 'stage', id: 'virada-'+stage, stage });
      assert.equal(r.data.stage, stage);
      assert.equal(r.data.match.quarter, 4);
      assert.equal(r.data.match.score[1]-r.data.match.score[0], gap);
      assert.equal(r.data.match.possession, stage === 1 ? 1 : 0);
    }
    V.UI.close();
    P.train(id, { restart: true });
    assert(P.active.training);
    const touchRight = V.$('#basket-right');
    touchRight.onpointerdown({ pointerId: 1 });
    P.update(.04);
    assert(P.active.data.match.players[0].x > 495);
    touchRight.onpointerup();
    assert.equal(P.held.x, 0);
    P.active.data.match.players[0].x = 663;
    P.active.data.match.players[0].y = 209;
    P.update(.04);
    assert(P.active.ack);
    P.nextGuide();
    P.action('pass');
    assert.equal(P.active.ack,false);
    assert.equal(P.active.data.match.flight?.type,'pass');
    const practice=P.active;
    practice.ack=true;
    P.detach();
    P.attach(practice);
    assert.equal(practice.ack,false);
    for(let i=0;i<40&&!P.active.ack;i++)P.update(.04);
    assert(P.active.ack);
    assert(P.active.data.match.carrier>0);
    assert.equal(P.active.data.match.players[P.active.data.match.carrier].pose,'catch');
    P.nextGuide();
    P.action('shoot');
    assert.equal(V.$('#basket-meter').dataset.active,'true');
    for (let i = 0; i < 30; i++) P.update(.04);
    P.action('shoot');
    for (let i = 0; i < 130 && !P.active.ack; i++) P.update(.04);
    assert(P.active.ack);
    P.nextGuide();
    P.action('steal');
    assert(P.active.ack);
    P.detach();

    const r = P.make(id, 'virada-play', { kind: 'stage', id: 'virada-play', stage: 0 });
    P.attach(r);
    assert.equal(V.$('#playground-root').dataset.game, id);
    assert.equal(V.$('#pg-controls').parentElement.id,'pg-scene');
    assert.equal(V.$('#basket-meter').parentElement.id,'pg-scene');
    assert.equal(V.$('#basket-sprint').getAttribute('aria-keyshortcuts'),'Shift');
    assert.equal(V.$('#basket-pass kbd').textContent,'E');
    assert.equal(V.$('#basket-steal kbd').textContent,'Q');
    const board=V.$('#basket-strip');
    assert.deepEqual(Array.from(board.children,block=>block.lastElementChild.textContent),['26','0:42','—','28']);
    assert.equal(V.$('#basket-meter').dataset.active,'false');
    for (let i = 0; i < 40; i++) P.update(.04);
    assert.equal(r.data.match.carrier, 0);
    const cinematic=P.make(id,'virada-close',{kind:'stage',id:'virada-close',stage:0});
    P.attach(cinematic);
    V.settings.reducedMotion=false;
    const images=shotArt.load();
    await Promise.all(Array.from(images,image=>image.naturalWidth?Promise.resolve():new Promise((resolve,reject)=>{
      image.addEventListener('load',resolve,{once:true});
      image.addEventListener('error',reject,{once:true});
    })));
    assert.deepEqual(Array.from(images,image=>[image.naturalWidth,image.naturalHeight]),[[768,512],[192,192],[768,512]]);
    const play=cinematic.data.match,p=play.players[0];
    play.status='play';
    Object.assign(p,{x:767,y:320});
    M.give(play,0);
    play.drill=true;
    assert(M.shoot(play,0,1));
    assert(M.boxOut(play));
    assert(!M.boxOut(play));
    const img=w.document.createElement('canvas');img.width=960;img.height=540;
    const g=img.getContext('2d');
    for(let i=0;i<30&&!play.shotMoment;i++)P.update(.04);
    assert.equal(play.shotMoment.outcome,'bank-in');
    assert.equal(V.$('#basket-shot-status').textContent,'');
    const stoppedClock=play.clock,stoppedTime=play.elapsed;
    for(let i=0;i<5;i++)P.update(.04);
    assert.equal(play.clock,stoppedClock);
    assert.equal(play.elapsed,stoppedTime);
    controller.draw(g,cinematic);
    const framed=canvases.get(img).canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(review,'basketball-close.png'),framed);
    const drop=shotArt.dropDuration(play.shotMoment.outcome);
    assert(drop>.45&&drop<.75);
    const animationTicks=Math.ceil(drop/.04);
    for(let i=5;i<animationTicks;i++)P.update(.04);
    controller.draw(g,cinematic);
    const resultFrame=canvases.get(img).canvas.toBuffer('image/png');
    assert.notDeepEqual(resultFrame,framed);
    assert.match(V.$('#basket-shot-status').textContent,/Cesta de tabela/);
    const resumeTick=Math.ceil((drop+3)/.04);
    for(let i=animationTicks;i<resumeTick-1;i++)P.update(.04);
    assert.equal(play.elapsed,stoppedTime);
    assert.equal(play.clock,stoppedClock);
    controller.draw(g,cinematic);
    assert.deepEqual(canvases.get(img).canvas.toBuffer('image/png'),resultFrame);
    P.update(.04);
    assert(play.elapsed>stoppedTime);
    controller.draw(g,cinematic);
    assert.notDeepEqual(canvases.get(img).canvas.toBuffer('image/png'),framed);
    fs.writeFileSync(path.join(review,'basketball-court.png'),canvases.get(img).canvas.toBuffer('image/png'));
    P.attach(r);
    const chosen=r.data.match.players[2];
    controller.pointer(r,'down',{x:chosen.x,y:chosen.y});
    P.action('pass');
    assert.equal(r.data.match.flight.type, 'pass');
    assert.equal(r.data.match.flight.receiver,2);
    const resumed = JSON.parse(JSON.stringify(r));
    P.ensure().runs[r.key] = resumed;
    P.detach();
    P.attach(resumed);
    assert.equal(resumed.data.match.flight.type, 'pass');
    const s = resumed.data.match;
    s.status = 'final';
    s.score = [33, 31];
    P.update(.04);
    assert.equal(resumed.data.stage, 1);
    assert(V.$('#phase-continue'));
    V.$('#phase-continue').click();
    assert.equal(resumed.data.match.score[1] - resumed.data.match.score[0], 4);
    resumed.data.match.score = [30, 38];
    resumed.data.match.status = 'final';
    P.update(.04);
    assert(V.$('#basket-retry'));
    V.$('#basket-retry').click();
    assert.equal(resumed.data.match.score[1] - resumed.data.match.score[0], 4);
    assert.equal(resumed.data.match.status, 'inbound');
    P.detach();
    V.MapAssets.cancel();
    console.log('PASS basketball rules, period and buzzer, animated campus, live view, controls, training, saved run, rewards and retry');
  } finally {
    dom.window.close();
  }
}

run().then(() => process.exit(0), error => {
  console.error(error.stack);
  process.exit(1);
});
