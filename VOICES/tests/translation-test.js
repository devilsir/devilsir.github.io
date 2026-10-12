'use strict';
const assert=require('assert'),fs=require('fs');
const {V,click,drainDialogue}=require('./runtime-test');
const passed=[],seen=new Set();let displayed=0,clues=0,books=0;
const close=()=>{if(V.Dialogue.active)drainDialogue();V.UI.close();};
async function main(){
 await V.Game.init();
 for(const grade of [6,7,8]){
  V.Game.newState({grade,name:'Revisão das traduções'});V.state.flags.prologueDone=true;V.state.flags.prologueStarted=true;V.state.unlocked=6;V.Game.startGame();
  for(const chapter of V.content.chapters)for(const clue of chapter.clues){close();V.Quests.collect(clue);assert.equal(V.Dialogue.currentText,clue.en[grade]);assert.equal(V.$('#dialogue-pt').textContent,clue.ptByGrade[grade]);drainDialogue();clues++;}
  V.Game.gallery();const records=V.$$('.discovery');assert.equal(records.length,18);for(let i=0;i<records.length;i++){const c=V.content.chapters.flatMap(c=>c.clues)[i];assert.equal(records[i].querySelector('p').textContent,c.ptByGrade[grade]);}close();
  for(const r of V.learning.readings){V.Living.read(r.id,r.paragraphs.length-1);assert.equal(V.$('.reader-english p').textContent,V.lang(r.en));assert.equal(V.$('.reader-english small').textContent,V.Translation.text(r.en,r.pt,r.ptByGrade));books++;V.UI.close();}
 }
 passed.push('54 actual clue dialogs, 54 archive cards and 162 book English connections use the matching Portuguese text for grades 6, 7 and 8.');
 const original=V.Dialogue.start;
 V.Dialogue.start=function(lines){for(const input of lines){const line=V.Editorial.line(input),en=V.lang(line.en),expected=V.Translation.pairs.get(V.Translation.key(en));assert(expected,'Reviewed translation missing: '+en);assert.equal(line.pt,expected);seen.add(en);displayed++;}};
 for(const grade of [6,7,8]){V.state.grade=grade;for(const m of Object.values(V.World.maps)){V.World.load(m.id);for(const o of m.objects.filter(o=>V.Cozy.person(o)||o.type==='fountain'))for(const done of [false,true])for(const action of ['reading','working','observing','playing','writing','sitting','waiting'])for(const visits of [0,1,2]){V.UI.close();V.state.completed=done?[1,2,3,4,5,6]:[];V.state.watered=done?['a','b','c']:[];V.state.residentTalks=visits&&o.resident?[o.resident.id]:[];o.visits=visits;o.action=action;o.resumeAction=action;V.Game.interact(o);}}
  V.World.load('hub');V.state.flags.prologueDone=false;V.Game.prologue();V.state.flags.prologueDone=true;V.Game.prologue();for(let chapter=1;chapter<=6;chapter++){V.state.evidence=[];V.state.completed=[];V.Quests.challenge(chapter);V.Combat.start(chapter);}}
 V.Dialogue.start=original;
 passed.push('First/repeat NPC dialogs, seven contextual actions, completed/incomplete progress, prologues and blocked challenges all resolve a reviewed translation in all three grades.');
 let conversations=0;for(const m of Object.values(V.World.maps))for(const g of m.chats){g.lines.forEach((pt,i)=>{assert.equal(V.Translation.text(g.enLines[i]),pt);assert.equal(g.enLines[i],V.translationContent.conversationEnglish[pt]);conversations++;});for(const o of g.members)assert.deepEqual(Array.from(o.chat.enLines),Array.from(g.enLines));}
 assert.equal(V.Translation.text('I wrote down a question.'),'Anotei uma pergunta.');assert.equal(V.Translation.text('I will put these things away first.'),'Vou guardar estas coisas primeiro.');assert.equal(V.Translation.text('I left the sarong near the shade.'),'Deixei a canga perto da sombra.');assert.equal(V.Translation.text('Beto brought his notebook. I will hold the ball while he draws.'),'Beto trouxe o caderno. Vou segurar a bola enquanto ele desenha.');
 passed.push('Reciprocal conversations use scene-specific English instead of generic templates; extra Portuguese sentences, sarong/towel confusion and hold/store confusion have regressions.');
 const pairs=new Map();for(const r of V.translationContent.records){for(const grade of [6,7,8]){const en=typeof r.en==='object'?r.en[grade]:r.en;if(en)pairs.set(V.Translation.key(en),r.ptByGrade?.[grade]||r.pt);}}for(const r of V.neighborsContent.residents)for(const l of r.lines)pairs.set(V.Translation.key(l.en),l.pt);for(const r of V.atelierContent.residents)for(const l of r.lines)pairs.set(V.Translation.key(l.en),l.pt);for(const [en,pt]of pairs)assert.equal(V.Translation.pairs.get(en),pt);
 const stored={speaker:'PIX',en:'Let’s look together.',pt:'Guardei um lugar perto da fonte.'};V.state.dialogueHistory=[stored,{speaker:'Nia',en:'Check the source. Ask a question.',pt:'Explicação extra.'}];V.Cozy.ensure();assert.equal(stored.en,'Let’s look together.');assert.equal(stored.pt,'Vamos olhar juntos.');assert.equal(V.state.dialogueHistory[1].pt,'Confira a fonte. Faça uma pergunta.');V.Save.save();V.Game.loadState(V.Save.load());assert.equal(V.state.dialogueHistory[0].pt,'Vamos olhar juntos.');
 const custom={speaker:'pix',en:'An original teacher-authored sentence.',pt:'Uma frase original escrita pelo professor.'};assert.equal(V.Editorial.line(custom).pt,custom.pt);
 V.settings.translation=true;V.settings.subtitles=true;V.Dialogue.start([{speaker:'pix',en:'I wrote down a question.',pt:'Anotei uma pergunta. Depois podemos comparar.'}]);assert.equal(V.$('#dialogue-pt').textContent,'Anotei uma pergunta.');V.Dialogue.toggle();assert.equal(V.$('#dialogue-pt').textContent,'');V.Dialogue.toggle();assert.equal(V.$('#dialogue-pt').textContent,'Anotei uma pergunta.');close();
 passed.push('The complete reviewed registry, legacy conversation history, save reload, custom teacher text and translation visibility work together without changing campaign progress.');
 const result={date:new Date().toISOString(),environment:'Node VM + minimal DOM + native Canvas; not a browser',counts:{reviewedEnglishTexts:pairs.size,simulatedDialogueLines:displayed,uniqueRuntimeEnglishTexts:seen.size,clueDialogs:clues,bookConnections:books,conversationLines:conversations,grades:[6,7,8]},passed};fs.writeFileSync('tests/translation-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}
main().catch(e=>{console.error(e.stack);process.exit(1)});
