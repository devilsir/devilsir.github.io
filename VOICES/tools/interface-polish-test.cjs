'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const {V,w,dom}=await environment({bundle:process.argv.includes('--bundle'),moduleOrder:'reverse'});
  let failures=0;
  async function check(title,run){
    try{await run();console.log('PASS',title);}
    catch(error){failures++;console.error('FAIL',title,error.stack);}
    finally{V.UI.close();}
  }
  async function start(players){
    V.Game.toTitle();V.settings.playerCharacters=players;V.settings.challengePlayers=players.length;
    V.Game.newState({name:'Teste de interface',character:players[0]});
    Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});
    V.Onboarding.record().status='complete';V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
  }
  const painted=canvas=>canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.some((v,i)=>i%4===3&&v>100);
  try{
    await V.Game.init();await start(['nia']);
    await check('expanding to fullscreen reveals more world without changing the zoom',()=>{
      const stage=V.$('#stage'),view=V.Viewport,originalScale=view.scale;
      let width=1280,height=680,fullscreen=null;
      Object.defineProperties(stage,{clientWidth:{configurable:true,get:()=>width},clientHeight:{configurable:true,get:()=>height}});
      Object.defineProperty(w.document,'fullscreenElement',{configurable:true,get:()=>fullscreen});
      try{
        view.scale=null;view.resize();
        const before={width:view.width,height:view.height,scale:view.scale};
        width=1920;height=1010;fullscreen=w.document.documentElement;
        w.dispatchEvent(new w.Event('resize'));
        w.document.dispatchEvent(new w.Event('fullscreenchange'));
        assert.equal(view.scale,before.scale);
        assert(view.width>before.width&&view.height>before.height);
        assert(Math.abs(width/view.width-1280/before.width)<.004);
        assert(Math.abs(height/view.height-680/before.height)<.004);
        width=1280;height=680;fullscreen=null;
        w.document.dispatchEvent(new w.Event('fullscreenchange'));
        assert.equal(view.width,before.width);assert.equal(view.height,before.height);
      }finally{
        delete stage.clientWidth;delete stage.clientHeight;delete w.document.fullscreenElement;
        view.scale=originalScale;
      }
    });

    await check('an NPC can read at a native world object without furniture data',()=>{
      const m=V.World.maps.library,target=m.objects.find(o=>o.type==='reading'&&!o.scene);
      const person=Object.values(V.World.maps).flatMap(map=>map.objects).find(o=>V.Cozy.person(o)&&o.character==='amara');
      assert(target&&person);
      const actor={...person,action:'reading',destination:{object:target},editorDrawing:true};
      const canvas=w.document.createElement('canvas');
      V.Cozy.drawObject(canvas.getContext('2d'),actor,{x:actor.x-100,y:actor.y-100},{});
      assert(painted(canvas));
    });

    await check('world ambient conversations continue without a clickable listen marker',()=>{
      const chatMaps=Object.values(V.World.maps).filter(m=>m.chats?.length);
      assert(chatMaps.length>5);
      const explore=V.World.current;
      for(const m of chatMaps){
        V.World.current=m;
        const visible=V.World.interactables();
        assert(!visible.some(o=>/Ouvir (?:a )?conversa/i.test(o.label||'')||o.scene?.kind==='conversation'||o.type==='community-conversation'),m.id);
        assert(m.chats.some(g=>g.members.length>1),m.id);
      }
      V.World.current=explore;
    });

    await check('profile actions, attribute points and learning skills still work',async()=>{
      const progress=V.Progress.ensure();progress.attributePoints=1;progress.skillPoints=2;
      V.Progress.character();
      assert(V.$('.character-shortcuts #daily-activities'));
      assert(V.$('.character-shortcuts #player-appearance'));
      V.$('[data-stat="health"]').click();
      assert.equal(progress.attributePoints,0);
      assert.equal(progress.attributes.health,1);
      V.$('[data-character-tab="skills"]').click();
      const skill=V.$$('[data-learn-skill]').find(b=>!b.disabled);
      assert(skill);const {learnSkill,passive}=skill.dataset,bag=passive==='true'?progress.passives:progress.skills,rank=bag[learnSkill]||0;
      skill.click();assert.equal(progress.skillPoints,1);assert.equal(bag[learnSkill],rank+1);
    });

    await check('eight activity previews paint and the sixteen instruments resolve to separate artwork',async()=>{
      V.Progress.character();V.$('#daily-activities').click();await V.MapAssets.whenReady();
      assert.equal(V.$$('[data-activity-preview]').length,8);
      V.Activities.paint();
      for(const canvas of V.$$('[data-activity-preview]'))assert(painted(canvas),canvas.dataset.activityPreview);
      const read=V.$('[data-activity-preview="read"]'),sleep=V.$('[data-activity-preview="sleep"]');
      assert.notEqual(read.toDataURL(),sleep.toDataURL());
      const sources=V.$$('[data-instrument-image]').map(img=>img.getAttribute('src').split('?')[0]);
      assert.equal(new Set(sources).size,16);
      for(const src of sources)assert(fs.existsSync(path.resolve(__dirname,'..',src)),src);
      V.$('#activity-back').click();assert(V.$('.character-profile'));
    });

    await check('the illustrated overview finds any map and opens the existing local atlas',async()=>{
      V.WorldAtlas.open('world');
      assert(V.$('.harmony-atlas-map img[src*="new-harmony-overview.webp"]'));
      assert(V.$$('[data-harmony-pin]').length>=16);
      assert(!V.$('#adv-atlas-canvas'));
      V.$('[data-harmony-pin="chapter-3"]').click();
      assert(V.$('#harmony-travel').disabled);
      const field=V.$('#harmony-destination');field.value='apartamento 203';field.dispatchEvent(new w.Event('input',{bubbles:true}));
      V.$('[data-harmony-result="interior-horizonte-203"]').click();
      assert.equal(V.$('[data-harmony-result="interior-horizonte-203"]').getAttribute('aria-pressed'),'true');
      V.$('#harmony-local').click();await V.MapAssets.whenReady();
      assert.equal(V.WorldAtlas.view,'local');assert(V.$('#adv-atlas-canvas'));assert(V.$('#atlas3-chronicle'));
      V.$('[data-atlas-view="world"]').click();
      assert(V.$('.harmony-atlas-map'));
    });

    await check('the HUD loads the bottle and the ZzZz mark',()=>{
      V.JourneyCare.hud();V.IllustratedInterface.refresh();
      assert(V.$('#life-hud img[src*="status-bottle.svg"]'));
      assert(V.$('#life-hud img[src*="status-sleep.svg"]'));
    });

    await check('the Africa atlas groups real game destinations and keeps the local map and travel actions',async()=>{
      V.WorldAtlas.open('world');
      V.$('[data-harmony-view="africa"]').click();
      assert.equal(V.WorldAtlas.view,'africa');
      assert(V.$('.africa-country').getAttribute('d').length>100);
      const illustration=V.$('.harmony-africa img');
      assert(fs.existsSync(path.resolve(__dirname,'..',illustration.getAttribute('src'))));
      assert.equal(V.$$('.harmony-africa [data-harmony-pin]').length,8);
      const destinations=Object.keys(V.World.maps).filter(id=>V.CapeRegion.africa(id)).sort();
      assert.deepEqual([...V.$$('[data-harmony-result]')].map(button=>button.dataset.harmonyResult).sort(),destinations);
      assert(!V.$('[data-harmony-result="nature-cerrado"]'));
      V.$('[data-harmony-pin="sanctuary-village-sa"]').click();
      assert.equal(V.WorldAtlas.selected,'sanctuary-village-sa');
      V.$('[data-harmony-result="interior-sanctuary-bongani"]').click();
      assert.equal(V.$('[data-harmony-pin="sanctuary-village-sa"]').getAttribute('aria-pressed'),'true');
      assert.equal(V.$$('[data-harmony-result]').length,5);
      V.$('[data-harmony-result="nature-wetlands"]').click();
      V.$('#harmony-local').click();await V.MapAssets.whenReady();
      assert.equal(V.WorldAtlas.view,'local');
      V.$('[data-atlas-view="world"]').click();
      assert.equal(V.WorldAtlas.view,'africa');
      assert.equal(V.WorldAtlas.selected,'nature-wetlands');
      const search=V.$('#harmony-destination');
      search.value='Bo-Kaap';search.dispatchEvent(new w.Event('input',{bubbles:true}));
      V.$('[data-harmony-result="bo-kaap"]').click();
      V.$('#harmony-travel').click();await V.MapAssets.whenReady();
      assert.equal(V.World.current.id,'bo-kaap');
      V.Game.map();
      assert.equal(V.WorldAtlas.view,'africa');
    });

    await check('residential doors animate and sixteen new objects are ready in the store',async()=>{
      V.World.load('interior-player-loft');await V.MapAssets.whenReady();
      const H=V.Homestead,D=V.HomeDesign,art=V.ResidentialStudio;
      assert(art.ready());assert.equal(D.images['home-studio'].naturalWidth,1024);assert.equal(art.items.length,16);
      for(const item of art.items){assert(H.catalog.includes(item));assert(V.SceneDesign.asset(item.family,item.prop));}
      const door=V.World.current.objects.find(o=>o.type==='room-door'&&o.door.internalHome&&o.door.type==='ordinary');
      assert(door);
      const canvas=w.document.createElement('canvas');canvas.width=canvas.height=200;const c=canvas.getContext('2d');
      const cam={x:door.x-100,y:door.y-120};V.settings.reducedMotion=false;
      function draw(t){c.clearRect(0,0,200,200);V.Cozy.drawObject(c,door,cam,t);return canvas.toDataURL();}
      door.door.openUntil=0;const closed=draw(0);assert(painted(canvas));
      door.door.openUntil=V.Rooms.clock+10;const moving=draw(.08);draw(.16);draw(.24);const opened=draw(.32);
      assert.notEqual(closed,moving);assert.notEqual(moving,opened);
      door.door.openUntil=0;draw(.40);draw(.48);draw(.56);assert.equal(draw(.64),closed);
    });

    await check('combat uses the larger mask without moving the combatant',async()=>{
      V.Progress.ensure().story.awakened=true;
      const B=V.Combat;assert(B.begin(0,true,{practice:true}));V.$('#battle-start').click();await V.MapAssets.whenReady();
      const before=B.position(B.active.allies[0]);
      const original=V.AncestralMask.frame,frames=[];
      V.AncestralMask.frame=function(...args){frames.push(args);return original.apply(this,args);};
      try{const c=w.document.createElement('canvas');c.width=960;c.height=540;B.render(c.getContext('2d'));}
      finally{V.AncestralMask.frame=original;}
      assert(frames.some(args=>args[5]>=before.size*.63));
      assert.deepEqual(B.position(B.active.allies[0]),before);
      B.result('retreat');B.finish();
    });

    await check('activities animate in both viewers with their own characters',async()=>{
      await start(['nia','leo']);const panels=V.DuoPanels;
      panels.withOwner(0,()=>V.Activities.panel());panels.withOwner(1,()=>V.Activities.panel());await V.MapAssets.whenReady();
      V.Activities.paint();
      const canvases=[0,1].map(i=>panels.root(i).querySelector('[data-activity-preview="read"]'));
      assert(canvases.every(painted));assert.notEqual(canvases[0].toDataURL(),canvases[1].toDataURL());
      panels.closeAll();
    });
  }finally{V.MapAssets.cancel();dom.window.close();}
  process.exit(failures?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
