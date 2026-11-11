'use strict';
const assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const {V,dom,w}=await environment({bundle:process.argv.includes('--bundle')});
  const C=V.CityChronicle,D=V.CityChronicleData;
  let failures=0;
  const check=async(title,fn)=>{
    try{await fn();console.log('PASS',title);}
    catch(error){failures++;console.error('FAIL',title,error.stack);}
    finally{V.UI.close();}
  };
  const start=async(players)=>{
    V.Game.toTitle();
    V.settings.playerCharacters=players;
    V.settings.challengePlayers=players.length;
    V.Game.newState({name:'Crônicas de teste',character:'nia',grade:7});
    Object.assign(V.state.flags,{prologueStarted:true,prologueDone:true});
    V.Onboarding.record().status='complete';
    V.Game.startGame();
    await V.MapAssets.whenReady();
    V.UI.close();
  };
  const finishDialogue=()=>{
    for(let i=0;i<15&&V.Dialogue.active;i++){
      V.Dialogue.typing=Infinity;
      V.Dialogue.next();
    }
    assert(!V.Dialogue.active,'dialogue should return to the normal campaign flow');
  };

  try{
    await V.Game.init();
    await start(['nia']);

    await check('every authored map has its own chronicle, valid links and documented references',()=>{
      const ids=Object.keys(V.World.maps).sort();
      assert.deepEqual(Object.keys(D.places).sort(),ids);
      assert.equal(new Set(Object.values(D.places).map(place=>place.title)).size,ids.length);
      assert.equal(new Set(Object.values(D.places).map(place=>place.scene)).size,ids.length);
      const used=new Set();
      for(const id of ids){
        const place=C.place(id);
        assert(place.scene.length>=100,id);
        assert(D.chapters[place.chapter-1],id);
        assert.equal(place.links.length,2,id);
        for(const link of place.links)assert(link!==id&&C.place(link),id+' → '+link);
        if(place.reference)used.add(place.reference);
      }
      assert.deepEqual([...used].sort(),Object.keys(D.sources).sort());
      for(const [title,url,text]of Object.values(D.sources))assert(title&&new URL(url).protocol==='https:'&&text.length>=80);
    });

    await check('the Caderno opens the local scene, follows a connection and searches all places',async()=>{
      V.World.load('museum');
      await V.MapAssets.whenReady();
      V.$('#notebook-button').click();
      V.$('[data-notebook-tab="chronicles"]').click();
      assert.match(V.$('.chronicle-scene').textContent,/NH-014/);
      assert.match(V.$('.chronicle-reference a').href,/gov\.br\/bn\//);
      assert(C.readings().includes('museum'));
      V.$('[data-chronicle-place="library"]').click();
      assert.match(V.$('.chronicle-scene').textContent,/Carolina Maria de Jesus/);
      assert.equal(V.World.current.id,'museum');
      V.$('#chronicle-index').click();
      assert.equal(V.$$('#chronicle-list button').length,Object.keys(D.places).length);
      const query=V.$('#chronicle-search');
      query.value='biologia';
      query.dispatchEvent(new w.Event('input',{bubbles:true}));
      const chapter=V.$('#chronicle-chapter');
      chapter.value='3';
      chapter.dispatchEvent(new w.Event('change',{bubbles:true}));
      V.$('#chronicle-list [data-chronicle-place="university-biology"]').click();
      assert.match(V.$('.chronicle-sheet h3').textContent,/resultado e o limite/);
      V.$('#chronicle-back').click();
      assert.equal(V.$('#chronicle-search').value,'biologia');
      assert.equal(V.$('#chronicle-chapter').value,'3');
      assert(V.Save.load().cityChronicle[0].includes('university-biology'));
    });

    await check('the Atlas opens a selected destination chronicle without moving the player',async()=>{
      V.WorldAtlas.open('local','bo-kaap');
      await V.MapAssets.whenReady();
      V.$('#atlas3-chronicle').click();
      assert.match(V.$('.chronicle-sheet h3').textContent,/fachada/);
      assert.equal(V.$('.chronicle-reference a').hostname,'www.iziko.org.za');
      assert.equal(V.World.current.id,'museum');
      V.$('#chronicle-back').click();
      await V.MapAssets.whenReady();
      assert.equal(V.WorldAtlas.selected,'bo-kaap');
      assert(V.$('#atlas3-chronicle'));
    });

    await check('campaign entrances and completed chapters use the new bilingual story transitions',async()=>{
      V.Game.enterChapter(1);
      await V.MapAssets.whenReady();
      assert(V.Dialogue.lines.some(line=>line.en.includes('programme')&&line.pt.includes('programa')));
      finishDialogue();
      V.Quests.complete(1);
      assert.match(V.Dialogue.lines.at(-1).pt,/NH-014.*Museu Esquecido/);
      finishDialogue();
      V.UI.close();
      assert(V.FastTravel.travel('chapter-2'));
      await V.MapAssets.whenReady();
      assert(V.Dialogue.lines.some(line=>line.en.includes('Kingdom of Kongo')&&line.pt.includes('Reino do Kongo')));
      finishDialogue();
      C.campaign();
      const timeline=V.$('.chronicle-timeline');
      assert.match(timeline.textContent,/Capítulo 1 · Restaurado/);
      assert.match(timeline.textContent,/Capítulo 2 · Disponível/);
      assert.match(timeline.textContent,/mesmo selo da ficha NH-014/);
    });

    await check('the finale records the decision and links back to the city chronicles',()=>{
      const story=V.Progress.ensure().story;
      V.Story.finale();
      V.$('[data-ending="review"]').click();
      assert.equal(story.ending,'review');
      assert.match(V.$('.modal-body').textContent,/conselho provisório afixa o primeiro índice/);
      V.$('#epilogue-chronicles').click();
      assert(V.$('#chronicle-search'));
      V.$('#chronicle-back').click();
      assert.match(V.$('#modal-title').textContent,/O arquivo continua vivo/);
    });

    await check('two players read the chronicles of their own locations in separate panels',async()=>{
      await start(['nia','leo']);
      const panels=V.DuoPanels;
      panels.withOwner(0,()=>V.World.load('library'));
      panels.withOwner(1,()=>V.World.load('museum'));
      await V.MapAssets.whenReady();
      for(const i of [0,1])panels.withOwner(i,()=>V.Living.journal('chronicles'));
      assert.match(panels.root(0).querySelector('.chronicle-sheet h3').textContent,/Cadernos que atravessam/);
      assert.match(panels.root(1).querySelector('.chronicle-sheet h3').textContent,/Dois papéis/);
      assert.deepEqual(Array.from(V.state.cityChronicle[0]),['library']);
      assert.deepEqual(Array.from(V.state.cityChronicle[1]),['museum']);
      panels.closeAll();
    });
  }finally{
    V.MapAssets.cancel();
    dom.window.close();
  }
  process.exit(failures?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
