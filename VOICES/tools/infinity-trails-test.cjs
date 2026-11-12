'use strict';
const assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const {V,w,dom}=await environment({bundle:process.argv.includes('--bundle'),moduleOrder:'reverse'});
  const {World:W,Combat:B,Progress:P,FragmentForest:F,InfinityTrails:I,InfinityTrailRooms:R}=V;
  try{
    await V.Game.init();
    const decorRecords=[...V.AssetLoader.records].filter(record=>V.FragmentArt.isTrailDecor(record.group));
    assert.equal(decorRecords.length,10);
    assert(decorRecords.every(record=>record.state==='deferred'));
    V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;
    V.Game.newState({name:'Exploradora das trilhas',character:'nia'});
    V.Onboarding.record().status='complete';
    V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
    V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
    Object.assign(V.state.flags,{prologueStarted:true,prologueDone:true});
    Object.assign(P.ensure().story,{stage:'awake',awakened:true});
    V.state.unlocked=6;
    const forest=W.maps[V.FragmentData.map],entrance=forest.objects.find(o=>o.id==='infinity-entrance');
    assert(entrance&&entrance.x>forest.width*48*.8&&entrance.y<forest.height*48*.2);
    assert(!V.Living.blocked(forest,entrance.x,entrance.y,14));
    assert(!I.start('easy'));
    assert(F.go());V.UI.close();
    assert(V.ObjectiveGuide.calculate(forest,V.Player.data,entrance,false).length);
    V.Game.interact(entrance);
    assert.deepEqual(Array.from(V.$$('[data-infinity-tier]'),b=>b.dataset.infinityTier),['easy','normal','hard']);
    V.$('[data-infinity-tier="easy"]').click();
    await V.MapAssets.whenReady();
    I.firstGuide();
    assert(V.$('#infinity-guide-next'),'the first visit opens the trail guide');
    for(let i=0;i<3;i++)V.$('#infinity-guide-next').click();
    assert(I.state().guideSeen);
    assert.equal(F.spirit().id,'fragment-spirit-raiz');
    assert(!I.firstGuide(),'the trail guide only opens automatically once');
    V.Team.panel('animal');
    assert(V.$('#trail-animal-preview'));
    assert.equal(V.$$('[data-team-animal]').length,6);
    V.UI.close();
    assert.equal(W.current.id,I.map);
    assert.equal(I.state().run.difficulty,'easy');
    assert(!V.FastTravel.status(I.map).allowed);
    const current=W.current,depth=()=>I.state().run.depth;
    assert.equal(depth(),1);
    assert(!I.advance());
    const m=current.infinity,pack=m.packs[0];
    const enemy=R.lookup(pack.foes[0]),base=P.stats();
    const strength=(difficulty,depth,stats=base,level=1,team=[{stats}])=>R.strength(enemy,{difficulty,depth},team,level);
    assert(strength('easy',1).health<strength('normal',1).health);
    assert(strength('normal',1).attack<strength('hard',1).attack);
    assert(strength('easy',1000).health>strength('easy',100).health);
    assert(strength('easy',1,{...base,attack:base.attack+30}).health>strength('easy',1).health);
    assert(strength('easy',1,{...base,defense:base.defense+25}).attack>strength('easy',1).attack);
    assert(strength('easy',1,base,10).defense>strength('easy',1).defense);
    assert(strength('easy',1,base,1,[{stats:base},{stats:base}]).health>strength('easy',1).health);

    const signature=room=>JSON.stringify([room.width,room.height,room.infinity.biome.name,room.infinity.shape,
      room.infinity.path,room.infinity.packs.map(o=>[o.x,o.y,o.foes])]);
    const seen=new Set(),biomes=new Set(),sizes=new Set(),foes=new Set();
    for(const roomDepth of [1,2,3,4,5,6,8,9,13,20,40,400,10000,4294967297]){
      const run={serial:123,seed:278216,difficulty:'hard',depth:roomDepth};
      const trial=R.build(run),look=signature(trial);
      assert.equal(look,signature(R.build(run)));
      seen.add(look);biomes.add(trial.infinity.biome.name);sizes.add(trial.width+'x'+trial.height);
      for(const o of trial.objects.filter(o=>o.type==='infinity-trail')){
        assert(!V.Living.blocked(trial,o.x,o.y,14),o.id+' · '+roomDepth);
        assert(V.ObjectiveGuide.calculate(trial,trial.spawnPoint,o,false).length,o.id+' · '+roomDepth);
        for(const id of o.foes||[])foes.add(id);
      }
    }
    assert(seen.size>=13&&sizes.size>=10&&biomes.size>=3&&foes.size>=8);
    const used=new Map(decorRecords.map(record=>[record.group,new Set()]));
    for(let depth=1;depth<=68;depth++){
      const trial=R.build({serial:4,seed:1248891,difficulty:'normal',depth});
      const groups=V.MapAssets.groups(trial).filter(V.FragmentArt.isTrailDecor);
      for(const prop of trial.decor.filter(o=>V.FragmentArt.isTrailDecor(o.family))){
        used.get(prop.family).add(prop.prop);
        assert(groups.includes(prop.family));
      }
    }
    for(const [sheet,frames] of used)assert.equal(frames.size,6,sheet+' · '+Array.from(frames).join(','));
    const currentArt=V.MapAssets.groups(current).filter(V.FragmentArt.isTrailDecor);
    assert(currentArt.includes('trail-decor-'+m.biome.decor));
    for(const record of decorRecords){
      const visible=currentArt.includes(record.group);
      assert.equal(record.state,visible?'loaded':'deferred',record.group);
      if(visible)assert.equal(V.FragmentArt.images[record.group].naturalWidth,576);
    }
    console.log('PASS all ten environment sheets and sixty distinct props are used, with per-room loading');
    console.log('PASS the forest entrance, three difficulties, seeded rooms, reachable doors and unbounded scaling');

    const canvas=w.document.createElement('canvas');
    canvas.width=960;canvas.height=540;
    const ctx=canvas.getContext('2d');
    for(const key of ['trail-mobs','trail-props','trail-arena'])assert(V.FragmentArt.images[key].naturalWidth,key);
    W.transition=0;V.Cozy.render(ctx);
    assert(current.cache);
    V.Game.interact(pack);
    assert(V.$('#infinity-fight'));
    V.$('#infinity-fight').click();
    assert.equal(B.active.expedition.infinity.slot,pack.slot);
    assert.equal(B.active.expedition.infinity.depth,1);
    assert.equal(B.active.enemies[0].stats.health,strength('easy',1).health);
    B.render(ctx);
    const saved=V.Save.load();
    assert.equal(saved.map,I.map);
    const stable=signature(current);
    B.active=null;
    V.Game.loadState(saved);await V.MapAssets.whenReady();V.UI.close();
    assert.equal(W.current.id,I.map);
    assert.equal(signature(W.current),stable);
    assert.equal(B.active.expedition.infinity.slot,pack.slot);
    assert.equal(B.active.enemies[0].stats.health,strength('easy',1).health);

    function win(){
      B.active.enemies.forEach(o=>{o.health=0;});
      B.checkResult();assert.equal(B.active.phase,'victory');
      const earned=[B.active.rewardXP,B.active.rewardShards];
      assert(earned[0]>0&&earned[1]>0);
      assert(!I.finishFight(B.active));
      B.finish();
      return earned;
    }
    const xp=P.ensure().xp;
    const [earned]=win();
    assert.equal(P.ensure().xp,xp+earned);
    assert(!I.fight(W.current.infinity.packs[0]));
    assert(!W.interactables().includes(W.current.infinity.packs[0]));
    assert(!I.advance());
    assert(I.leave());
    assert.equal(W.current.id,forest.id);
    V.Game.interact(entrance);
    V.$('#infinity-resume').click();
    await V.MapAssets.whenReady();
    assert.equal(depth(),1);
    assert.equal(signature(W.current),stable);
    assert.deepEqual(Array.from(I.state().run.cleared),[pack.slot]);

    const clearRoom=()=>{
      for(const mob of W.current.infinity.packs.filter(o=>!I.state().run.cleared.includes(o.slot))){
        assert(I.fight(mob));win();
      }
    };
    clearRoom();
    assert.equal(I.state().best.easy,1);
    V.Game.interact(W.current.infinity.next);
    await V.MapAssets.whenReady();
    assert.equal(depth(),2);
    while(depth()<5){clearRoom();assert(I.advance());await V.MapAssets.whenReady();}
    assert.equal(W.current.infinity.elite,true);
    assert(!I.rest());
    const guardian=W.current.infinity.packs.find(o=>o.guardian);
    assert(guardian&&guardian.foes.includes('stag'));
    assert(I.fight(guardian));assert(B.active.enemies.some(o=>o.boss&&o.fragmentSheet==='trail-mobs'));win();
    clearRoom();
    assert.equal(I.state().best.easy,5);
    P.ensure().health=2;assert(I.rest());assert.equal(P.ensure().health,P.stats().health);assert(!I.rest());
    assert(I.advance());await V.MapAssets.whenReady();assert.equal(depth(),6);
    assert(I.leave(true));assert.equal(I.state().run,null);
    assert.equal(I.state().best.easy,5);
    assert(!Object.keys(P.ensure().ledger).some(key=>key.startsWith('infinity-win-')));
    console.log('PASS encounter art, combat resume, rewards, room gating, exit/resume, guardian, recovery and persistent records');

    V.settings.playerCharacters=['nia','leo'];V.settings.challengePlayers=2;
    V.Game.newState({name:'Dupla nas trilhas',character:'nia'});
    V.Onboarding.record().status='complete';
    Object.assign(V.state.flags,{prologueStarted:true,prologueDone:true});
    Object.assign(P.ensure().story,{stage:'awake',awakened:true});
    V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
    const duo=V.DuoWorld;
    assert(duo.enabled());
    duo.withActor(1,()=>{
      W.load(forest.id);
      assert(I.start('normal',27356));
    });
    await V.MapAssets.whenReady();
    assert(duo.actors.every(actor=>actor.map===I.map));
    duo.withActor(1,()=>assert(I.fight(W.current.infinity.packs[0])));
    win();
    clearRoom();
    duo.withActor(1,()=>assert(I.advance()));
    await V.MapAssets.whenReady();
    assert.equal(I.state().run.depth,2);
    for(const actor of duo.actors){
      assert.equal(actor.map,I.map);
      assert(!V.Living.blocked(W.maps[I.map],actor.data.x,actor.data.y,11));
    }
    duo.withActor(0,()=>assert(I.leave(true)));
    assert(duo.actors.every(actor=>actor.map===forest.id));
    console.log('PASS the two explorers share one run and move to the same new room');
  }finally{
    V.MapAssets.cancel();dom.window.close();
  }
  process.exit(0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
