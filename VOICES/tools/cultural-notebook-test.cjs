'use strict';
const assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const {V,dom}=await environment({bundle:process.argv.includes('--bundle'),moduleOrder:'reverse'});
  try{
    await V.Game.init();
    V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;
    V.Game.newState({name:'Caderno de culturas negras',character:'nia'});
    V.Onboarding.record().status='complete';
    Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});
    V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
    V.Culture.journal();
    assert.equal(V.$$('[data-culture-topic]').length,9);
    V.$('[data-culture-topic="food"]').click();
    V.$('[data-culture-piece="food-acaraje"]').click();
    assert.match(V.$('.culture-dossier').textContent,/Golfo do Benim/);
    assert(V.$('.culture-references a[href*="iphan.gov.br"]'));
    assert(V.state.culture.seen.includes('food-acaraje'));
    V.$('#culture-detail-back').click();
    V.$('[data-culture-study="ceebu"]').click();
    assert.match(V.$('.culture-dossier').textContent,/Saint-Louis/);
    assert(V.$('.culture-references a[href*="unesco.org"]'));
    V.$('#culture-study-back').click();
    assert(V.$('[data-culture-read="culture-book-05"]'));
    V.$('#culture-close').click();
    V.$('[data-culture-topic="music"]').click();
    assert.equal(V.$$('[data-culture-study]').length,2);
    for(const study of V.Culture.data.studies){
      assert(study.sections.length>=2,study.id);
      assert(study.sources.every(id=>V.content.sources.some(source=>source.id===id)),study.id);
    }
    assert.equal(Object.keys(V.Culture.data.notes).length,17);
    console.log('PASS the notebook opens illustrated entries, historical studies and their sources with the existing reading and progress links');
  }finally{V.MapAssets.cancel();dom.window.close();}
  process.exit(0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
