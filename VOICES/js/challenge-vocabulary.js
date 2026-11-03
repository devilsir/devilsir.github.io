(function(){
'use strict';
const V=window.V,P=V.Playground,D=V.PlaygroundData,X=V.PixVocabulary;
for(const[en,pt,example,examplePt,category]of [
 ['fresh','fresco; fresca','Buy fresh ingredients.','Compre ingredientes frescos.','food'],
 ['prepare','preparar','Prepare a fresh meal.','Prepare uma refeição fresca.','cooking'],
 ['explore','explorar','Explore the river habitat.','Explore o habitat do rio.','adventure'],
 ['gentle','suave; gentil','Follow the gentle wind.','Siga o vento suave.','nature'],
 ['tell','contar; dizer','Tell our shared stories.','Conte nossas histórias compartilhadas.','actions']
])if(!X.entry(en))V.EnglishVocabulary.entries.push({en,pt,example,examplePt,category,categoryLabel:V.EnglishVocabulary.categories[category],starter:false});
X.register();
const topics=[
 {name:'BAIRRO',categories:['city','home','school','directions']},
 {name:'COZINHA',categories:['cooking']},
 {name:'MERCADOS',categories:['food']},
 {name:'BIOMAS',categories:['wildlife','nature']},
 {name:'MUSEUS',categories:['museumObjects','culture','science']},
 {name:'MAR E COMUNIDADE',categories:['adventure','music','city','nature']}
];
// Keep the platform adventure's authored routes while bringing the recovered
// phrases up to date with the market, kitchen, museums and habitats in the world.
const phrases={4:['Buy fresh ingredients','Compre ingredientes frescos.','As bancas do mercado indicam os ingredientes usados na cozinha da comunidade.'],5:['Prepare a fresh meal','Prepare uma refeição fresca.','As cozinhas do mercado precisam de ingredientes e bancadas limpas para retomar o preparo.'],6:['Read the label','Leia a legenda.','As legendas dos museus ligam cada objeto à sua história e à coleção.'],8:['Help protect wildlife habitats','Ajude a proteger os habitats da fauna.','Do alto, a equipe observa os biomas e lembra os cuidados com os habitats dos animais.'],9:['Explore the river habitat','Explore o habitat do rio.','O caminho aberto convida a conhecer os rios, as margens e os animais que dependem deles.']};
for(const[index,[phrase,pt,context]]of Object.entries(phrases)){const s=V.PlatformJourney.stages[+index];s.phrase=phrase.split(' ');s.pt=pt;s.story+=' '+context;}
const B=V.ChallengeVocabulary={topics,
 pool(topic){const list=V.EnglishVocabulary.entries.filter(e=>topic.categories.includes(e.category)&&e.en&&e.pt&&e.en.length<=24);return [...new Map(list.map(e=>[e.en.toLowerCase(),e])).values()];},
 deck(r){const seed=Number(r.vocabularySeed)||P.ensure().serial||0;return topics.flatMap((topic,stage)=>{const pool=this.pool(topic),count=Math.max(1,pool.length),offset=(seed*7+stage*11)%count;return Array.from({length:4},(_,i)=>{const e=pool[(offset+i)%count]||X.entry('book'),wrong=[];for(let j=1;j<count&&wrong.length<2;j++){const candidate=pool[(offset+i+j*7)%count];if(candidate.en!==e.en&&candidate.pt!==e.pt&&!wrong.includes(candidate.en))wrong.push(candidate.en);}for(const fallback of ['book','water','house'])if(wrong.length<2&&fallback!==e.en&&!wrong.includes(fallback))wrong.push(fallback);return{en:e.en,pt:e.pt,wrong,topic:topic.name};});});},
 install(r){if(r.game!=='runner')return;if(r.training){D.words=[{en:'book',pt:'livro',wrong:['door','water']}];return;}r.vocabularySeed??=P.ensure().serial;
  if(!Array.isArray(r.wordDeck)||r.wordDeck.length!==24)r.wordDeck=this.deck(r);D.words=r.wordDeck;
 },
 word(r){this.install(r);return D.words[(r.training?0:r.data.round)%D.words.length];}
};
// All runner consumers (request, hints, collision and drawing) read one saved deck.
const attach=P.attach.bind(P);P.attach=function(r){if(r.game==='platform'&&!r.training&&phrases[r.data.stage]){const words=V.PlatformJourney.stages[r.data.stage].phrase;if(r.data.notes?.length===words.length)r.data.notes.forEach((note,i)=>note.word=words[i]);}const out=attach(r);B.install(r);if(r.game==='runner')this.hud();return out;};
for(const method of ['model','draw','update','hint']){const c=P.controllers.runner,run=c[method].bind(c);c[method]=function(first,...args){const r=method==='draw'?args[0]:first;B.install(r);const out=run(first,...args);if(method==='draw'&&!r.training){const topic=topics[Math.min(5,Math.floor(r.data.round/4))];P.box(first,20,201,174,31,'#214c43','#e5d29f');P.text(first,topic.name,107,216,12,'#fff0cf');}if(method==='model'&&!r.training){const stage=Math.min(5,Math.floor(r.data.round/4));out.request=topics[stage].name+' · Fase '+(stage+1)+'/6 · Encontre: '+B.word(r).pt;out.support=out.support.replace(/\d+ moedas/g,'$& na pista (pontos)');}return out;};}
})();
