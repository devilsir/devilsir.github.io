'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment}=require('./runtime-upgrade-test.cjs');
const output=path.resolve(__dirname,'../.qa/review');

(async()=>{
  const {V,w,dom,canvases}=await environment({bundle:process.argv.includes('--bundle')});
  const B=V.Combat,P=V.Progress,S=V.Story;
  const results=[];
  const check=async(name,fn)=>{
    try{await fn();results.push({name,pass:true});console.log('PASS',name);}
    catch(error){results.push({name,pass:false});console.error('FAIL',name,error.stack);}
    finally{V.UI.close();}
  };
  const closeBattle=()=>{
    if(!B.active)return;
    if(!['victory','defeat','retreat'].includes(B.active.phase))B.result('retreat');
    B.finish();
  };
  const stepUntil=(test,limit=1400)=>{
    for(let i=0;i<limit&&!test();i++)B.update(.04);
    assert(test(),'battle did not reach the expected phase');
  };
  const begin=(id,auto=false)=>{
    closeBattle();
    P.rest();
    assert(B.begin(id,true,{practice:true}));
    V.$(auto?'#battle-start-auto':'#battle-start').click();
    return B.active;
  };
  const canvas=(width,height,name)=>{
    const el=w.document.createElement('canvas');
    el.width=width;el.height=height;
    B.render(el.getContext('2d'));
    fs.writeFileSync(path.join(output,name+'.png'),canvases.get(el).canvas.toBuffer('image/png'));
  };
  fs.mkdirSync(output,{recursive:true});
  await V.Game.init();
  V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;
  V.Game.newState({name:'Turnos e máscara',character:'nia'});
  Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});
  Object.assign(P.ensure().story,{met:true,awakened:true,stage:'awake'});
  V.Onboarding.record().status='complete';
  V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
  V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
  V.settings.battleSpeed=1;

  await check('normal mask entry exposes pulse, tracking and appearance without the lesson gate',async()=>{
    const c=V.AdventureData.cases[0];
    V.World.load(c.map);await V.MapAssets.whenReady();
    const m=V.World.current,echo=m.objects.find(o=>o.type==='rasura'&&o.caseId===c.id);
    assert(echo);
    Object.assign(V.Player.data,{x:echo.x,y:echo.y+32});
    V.$('#historio-button').click();
    assert(V.$('.mask-dashboard')&&V.$('.historio-mask-canvas'));
    assert(!V.Tutorials.active);
    assert(!V.$('#historio-pulse').disabled);
    const before=JSON.stringify(S.ensure().traces);
    V.$('#historio-pulse').click();
    assert.equal(S.echo().id,echo.id);
    assert(S.pulseDelay()>0);
    assert.equal(JSON.stringify(S.ensure().traces),before);
    V.$('.mask-signal-toast button').click();
    assert.equal(P.ensure().tracked.object,echo.id);
    V.Historio.panel();
    assert(V.$('#historio-pulse').disabled);
    assert(V.$('#mask-track-echo'));
    V.$('[data-historio-change-mask]').click();
    assert(V.$('.historio-wardrobe').open);
    const model=V.$('[data-mask-model="hibisco"]');
    assert(!model.disabled);
    model.click();
    assert.match(V.$('[data-mask-equipped]').textContent,/Hibisco/);
    assert.match(V.$('.historio-mask-canvas').getAttribute('aria-label'),/Hibisco/);
  });

  await check('a single target takes one tap and command trays keep all actor anchors stable',async()=>{
    const a=begin(0);
    await V.MapAssets.whenReady();
    assert(V.Assets.images['rasura-enemies'].naturalWidth,'the battle loaded the enemy sprites');
    stepUntil(()=>a.phase==='command');
    const opponent=a.enemies[0],life=opponent.health+opponent.shield;
    const attack=V.$('[data-battle-command="attack"]');
    assert(!attack.disabled,'attack is enabled on the player turn');
    attack.click();
    assert(a.phase!=='target','a single opponent needs no target screen');
    assert(opponent.health+opponent.shield<life,JSON.stringify({phase:a.phase,actor:a.actor,life,health:opponent.health,shield:opponent.shield,log:a.log}));
    closeBattle();

    const multi=begin(1);
    stepUntil(()=>multi.phase==='command');
    const stage=V.$('#stage'),size={width:1120,height:640};
    Object.defineProperty(stage,'clientWidth',{configurable:true,get:()=>size.width});
    Object.defineProperty(stage,'clientHeight',{configurable:true,get:()=>size.height});
    try{
      for(const [width,height]of [[1120,640],[390,740],[780,360]]){
        Object.assign(size,{width,height});
        const anchors=B.all().map(actor=>B.position(actor));
        V.$('[data-battle-command="skills"]').click();
        assert(V.$('[data-turn-kind="skill"]'));
        assert.deepEqual(B.all().map(actor=>B.position(actor)),anchors);
        V.$('#battle-back').click();
        for(const {x,y}of anchors)assert(x>0&&x<width&&y>0&&y<height);
      }
      const target=multi.enemies[1],health=target.health+target.shield;
      V.$('[data-turn-hit="'+target.id+'"]').click();
      assert.equal(multi.aimTarget,target.id);
      V.$('[data-battle-command="attack"]').click();
      assert(target.health+target.shield<health&&multi.phase!=='target');
    }finally{delete stage.clientWidth;delete stage.clientHeight;}
  });

  await check('the first encounter guide accepts the direct attack and can hand off to auto',async()=>{
    closeBattle();
    const guide=V.BattleCoach;
    const record=guide.record();
    const initial={...record};
    Object.assign(record,{step:0,ack:false,completed:false,skipped:false});
    try{
      assert(B.begin(0,true));
      await V.MapAssets.whenReady();
      guide.render();
      assert(guide.active,JSON.stringify({screen:V.Game.screen,modal:V.modal,tutorial:V.Tutorials.active,onboarding:V.Onboarding.active,teacher:V.ProfessorStudio.active,record}));
      V.$('#battle-start').click();
      assert(record.ack);
      for(let i=0;i<3;i++)assert(guide.next());
      stepUntil(()=>B.active.phase==='command');
      V.$('[data-battle-command="attack"]').click();
      assert.equal(B.active.phase,'resolving');
      assert(record.ack&&guide.next());
      assert.equal(record.step,4);
      assert(guide.next(),'the direct attack needs no target selection');
      V.$('#battle-auto').click();
      assert(B.active.auto&&!guide.active&&record.skipped);
    }finally{
      closeBattle();
      Object.assign(record,initial);
    }
  });

  await check('manual target mode supports keyboard and direct stage taps with the same legality rules',()=>{
    const a=begin(1);
    stepUntil(()=>a.phase==='command');
    V.$('[data-battle-command="attack"]').click();
    assert.equal(a.phase,'target');
    assert(!B.pick(a.allies[0].id));
    assert(B.key('arrowright',{preventDefault(){}}));
    const target=B.get(a.selectedTarget),health=target.health+target.shield;
    assert(B.key('enter',{preventDefault(){}}));
    assert(target.health+target.shield<health);
    assert(a.phase==='resolving'||a.phase==='victory');
    assert(!B.commit({type:'made-up'},target.id));
  });

  await check('automatic turns honor healing, shields and access to techniques',()=>{
    const a=begin(1);
    stepUntil(()=>a.phase==='command');
    const actor=B.get(a.actor),r=P.ensure(),boss=a.enemies[0];
    r.skills.restore=1;r.skills.counter=1;actor.focus=actor.stats.focus;
    actor.health=14;
    assert.equal(B.suggestion().action.id,'restore');
    actor.health=actor.stats.health;boss.shield=35;
    assert.equal(B.suggestion().action.id,'counter');
    assert(!B.commit({type:'supportAction',id:'guardian'},actor.id));
    actor.cooldowns.counter=2;
    assert.notEqual(B.suggestion().action.id,'counter');
    V.$('#battle-suggest').click();
    assert.equal(boss.shield,0,'available supporting action should clear the barrier');
  });

  await check('the automatic mode pauses for consultations and resumes or hands back control',()=>{
    const a=begin(0,true);
    stepUntil(()=>a.phase==='command');
    const count=a.turnNumber,remaining=a.autoDelay;
    V.$('#battle-intents').click();
    for(let i=0;i<90;i++)B.update(.04);
    assert.equal(a.turnNumber,count);assert.equal(a.autoDelay,remaining);
    V.$('#battle-intents-close').click();
    V.$('#battle-mask').click();
    assert(V.$('.mask-dashboard'));
    assert(V.$('#historio-pulse').disabled);
    assert(V.$('#historio-rest').disabled);
    assert(V.$('#mask-compare-quick'));
    V.UI.close();
    assert(B.key('a',{preventDefault(){}}));
    assert(!a.auto);
    for(let i=0;i<90;i++)B.update(.04);
    assert.equal(a.turnNumber,count);
    V.$('#battle-auto').click();
    assert(a.auto);
    stepUntil(()=>a.turnNumber>count||a.phase==='victory');
    assert(a.log.some(line=>line.includes('→ '+a.enemies[0].name))||a.enemies[0].health<a.enemies[0].stats.health);
    const saved=JSON.parse(JSON.stringify(P.ensure().battle));
    assert(B.resume(saved));
    assert(!B.active.auto,'a loaded encounter returns to manual control');
  });

  await check('a whole practice battle resolves automatically without spending inventory or changing rewards',()=>{
    const a=begin(0,true),inventory=JSON.stringify(P.ensure().inventory),xp=P.ensure().xp;
    stepUntil(()=>a.phase==='victory'||a.phase==='defeat',2400);
    assert.equal(a.phase,'victory');assert(!a.auto);
    assert.equal(JSON.stringify(P.ensure().inventory),inventory);
    assert.equal(P.ensure().xp,xp);
    assert(V.TurnArt.arena.naturalWidth);
    canvas(1110,610,'turn-arena-wide');
    canvas(390,740,'turn-arena-narrow');
    V.$('#battle-finish').click();
    assert.equal(V.Game.mode,'explore');
    assert(!V.$('#battle-root'));
  });

  fs.writeFileSync(path.join(output,'turn-interface-results.json'),JSON.stringify(results,null,2));
  V.MapAssets.cancel();dom.window.close();
  process.exit(results.some(row=>!row.pass)?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
