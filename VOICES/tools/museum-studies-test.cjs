'use strict';
const assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const bundle=process.argv.includes('--bundle');
  const {V,dom,w}=await environment({bundle,moduleOrder:'reverse'});
  const B=V.MuseumBiographies,S=V.MuseumStudies;
  const {profiles}=V.MuseumBiographyData;
  const text=selector=>V.$(selector).textContent;
  const input=(selector,value,type='input')=>{
    const element=V.$(selector);
    element.value=value;
    element.dispatchEvent(new w.Event(type,{bubbles:true}));
  };
  let failures=0;
  async function check(title,run){
    try{await run();console.log('PASS',title);}
    catch(error){failures++;console.error('FAIL',title,error.stack);}
    finally{V.UI.close();}
  }
  async function start(players){
    V.Game.toTitle();
    V.settings.playerCharacters=players;
    V.settings.challengePlayers=players.length;
    V.Game.newState({name:'Visita de teste',character:'nia',grade:7});
    V.Onboarding.record().status='complete';
    Object.assign(V.state.flags,{prologueStarted:true,prologueDone:true});
    V.Game.startGame();
    await V.MapAssets.whenReady();
    V.UI.close();
  }

  try{
    await V.Game.init();
    await start(['nia']);

    await check('all 32 existing portrait readings lead to substantive, sourced biographies',()=>{
      const portraits=V.learning.readings.filter(r=>r.id.startsWith('portrait-note-'));
      assert.equal(portraits.length,32);
      assert.equal(new Set(portraits.map(r=>B.forReading(r.id))).size,32);
      assert.equal(Object.keys(profiles).length,40);
      for(const r of portraits)assert(profiles[B.forReading(r.id)],r.id);
      for(const p of Object.values(profiles)){
        assert.equal(p.sections.length,3,p.name);
        assert(p.sections.every(([title,body])=>title.length>6&&body.length>150),p.name);
        assert.equal(p.milestones.length,3,p.name);
        assert(p.related.every(id=>id!==p.id&&profiles[id]),p.name);
        assert.match(B.references(p.sourceIds),/href="https:\/\//,p.name);
      }
    });

    await check('the physical portrait opens its original note and returns from related biographies',async()=>{
      V.World.load('museum');
      await V.MapAssets.whenReady();
      const reading=V.learning.readings.find(r=>r.id==='portrait-note-139');
      const exhibit=V.World.current.objects.find(o=>o.scene?.readingId===reading.id);
      assert(exhibit);
      V.Game.interact(exhibit);
      V.$('#campus-biography').click();
      assert(V.$('[data-museum-bio="carolina"]'));
      V.$('#museum-bio-back').click();
      V.$('#campus-full-profile').click();
      assert(text('.reader-paper').includes(reading.paragraphs[0]));
      assert(V.$('#reader-save'));
      V.$('#reader-biography').click();
      assert.equal(V.$('[data-museum-bio]').dataset.museumBio,'carolina');
      assert.match(text('.museum-bio-text'),/Quarto de despejo/);
      assert(V.$('.museum-bio-sources a[href*="ims.com.br"]'));
      V.$('[data-museum-bio-related]').click();
      V.$('#museum-bio-back').click();
      assert(V.$('[data-museum-bio="carolina"]'));
      V.$('#museum-bio-back').click();
      assert(text('.reader-paper').includes(reading.paragraphs[1]));
      assert(!V.state.readings.includes(reading.id));
    });

    await check('the museum catalogue filters names and subjects and restores the search',()=>{
      V.CityChronicle.open('museum');
      V.$('#chronicle-biographies').click();
      assert.equal(V.$$('[data-museum-bio-result]').length,40);
      input('#museum-bio-search','conceicao');
      assert.equal(V.$$('[data-museum-bio-result]').length,1);
      V.$('[data-museum-bio-result="conceicao"]').click();
      V.$('#museum-bio-back').click();
      assert.equal(V.$('#museum-bio-search').value,'conceicao');
      input('#museum-bio-search','');
      input('#museum-bio-area','Capoeira','change');
      assert.equal(V.$$('[data-museum-bio-result]').length,2);
      V.$('#museum-bio-back').click();
      assert(V.$('#chronicle-biographies'));
    });

    await check('heritage summaries remain and the capoeira courtyard opens both master biographies',()=>{
      V.Heritage.collection();
      V.$('[data-heritage-figure="tim"]').click();
      const tim=V.heritageContent.figures.find(p=>p.id==='tim');
      assert(text('.modal-body').includes(tim.facts[0]));
      assert(V.$('[data-museum-bio="tim"]'));
      V.$('#heritage-figure-read').click();
      assert(V.$('#reader-biography'));
      V.Heritage.entry('heritage-item-59');
      V.$('#heritage-item-biography').click();
      assert(V.$('[data-museum-bio="adario"]'));
      V.AfricanMuseum.roda();
      V.$('#af-roda-biographies').click();
      assert(V.$('[data-museum-bio-result="bimba"]'));
      assert(V.$('[data-museum-bio-result="pastinha"]'));
      V.$('#museum-bio-back').click();
      assert(V.$('#af-roda-play'));
    });

    await check('all food and word fiches have supplements while keeping their original text and controls',()=>{
      const foods=V.FoodMuseum.entries(),words=V.AfricanMuseumData.words;
      assert.equal(foods.length,21);
      assert.equal(words.length,37);
      for(const e of foods)assert(S.section('food',e.id),e.id);
      for(const e of words)assert(S.section('word',e.id),e.id);
      V.FoodMuseum.catalog();
      V.$('[data-food-museum-entry="acaraje"]').click();
      assert(text('.food-museum-fiche').includes(V.FoodMuseum.entry('acaraje').origin));
      assert(V.$('[data-museum-study="food-acaraje"] a[href*="iphan.gov.br"]'));
      assert(V.$('#food-museum-practice'));
      V.$('#food-museum-register').click();
      assert(V.$('#food-museum-register').disabled);
      V.AfricanMuseum.exhibit('cafune');
      assert(text('.af-entry-text').includes(words.find(e=>e.id==='cafune').origin.etymology));
      assert(V.$('[data-museum-study="word-cafune"]'));
      assert(V.$('#af-word-say'));
      V.$('#af-next').click();
      assert(V.$('[data-museum-study="word-dengo"]'));
      for(const g of V.WordsRespect.data.groups){
        V.WordsRespect.group(g.id);
        assert(V.$('[data-museum-study="respect-'+g.id+'"]'),g.id);
      }
    });

    await check('fossils, anatomy and games keep their models, instructions and context',()=>{
      assert.equal(V.AnimalMuseumData.fossils.length,16);
      for(const fossil of V.AnimalMuseumData.fossils)assert(S.section('fossil',fossil.id),fossil.id);
      V.AnimalMuseum.exhibit('mesosaurus');
      assert(V.$('[data-animal-model="mesosaurus"]'));
      assert(V.$('[data-museum-study="fossil-mesosaurus"]'));
      assert(V.$('.animal-museum-sources a'));
      V.AnimalMuseum.exhibit('hippo','water');
      assert(V.$('[data-museum-study="animal-hippo"]'));
      V.AnimalMuseum.exhibit('anatomy-hippo');
      assert(V.$('[data-museum-study="animal-anatomy-hippo"]'));
      for(const id of ['terra-mar','fogo-montanha','mancala','matacuzana','roda-jo','ampe']){
        V.PlayMuseum.exhibit(id);
        assert(V.$('[data-museum-study="play-'+id+'"]'),id);
        assert(V.$('.play-exhibit ol li'));
        assert(V.$('#play-exhibit-start'));
      }
    });

    await check('historical notes stay attached to recovered records in the Forgotten Museum',()=>{
      V.Game.gallery();
      assert(!V.$('[data-museum-study="archive-c2_mali"]'));
      V.state.evidence.push('c2_mali','c2_songhai','c2_kongo');
      V.Game.gallery();
      for(const id of ['c2_mali','c2_songhai','c2_kongo']){
        assert(V.$('#record-'+id+' [data-museum-study="archive-'+id+'"] a[href*="unesco.org"]'));
      }
      V.$('[data-gallery-bio="mansa-musa"]').click();
      assert(V.$('[data-museum-bio="mansa-musa"]'));
      V.$('#museum-bio-back').click();
      assert(V.$('#record-c2_mali'));
    });

    await check('two players can consult biographies without replacing each other’s panels',async()=>{
      await start(['nia','leo']);
      const panels=V.DuoPanels;
      panels.withOwner(0,()=>B.open('carolina'));
      panels.withOwner(1,()=>B.open('mansa-musa'));
      const first=panels.root(0),second=panels.root(1);
      assert(first.querySelector('[data-museum-bio="carolina"]'));
      assert(second.querySelector('[data-museum-bio="mansa-musa"]'));
      second.querySelector('#museum-bio-catalog').click();
      assert(second.querySelector('#museum-bio-search'));
      assert(first.querySelector('[data-museum-bio="carolina"]'));
      panels.closeAll();
    });
  }finally{
    V.MapAssets.cancel();
    dom.window.close();
  }
  process.exit(failures?1:0);
})().catch(error=>{console.error(error);process.exit(1);});
