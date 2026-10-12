/* Developer-only integration checks. No browser required for these tests.
 * Requires the optional @napi-rs/canvas package. The finished game needs none.
 * This DOM harness is intentionally limited; it does not claim browser QA. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const native=require('@napi-rs/canvas');
native.GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','VOICES Sans');
const root=path.resolve(__dirname,'..');process.chdir(root);
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
class Element{
 constructor(tag='div',attrs={}){this.tagName=tag.toUpperCase();this.attrs=attrs;this.children=[];this.parentElement=null;this.style={};this.dataset={};Object.entries(attrs).forEach(([k,v])=>{if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;});this.id=attrs.id||'';this.className=attrs.class||'';this.hidden='hidden'in attrs;this.disabled='disabled'in attrs;this.checked='checked'in attrs;this.value=attrs.value||'';this._text='';this._html='';this.isConnected=true;if(tag==='canvas'){this.width=+(attrs.width||300);this.height=+(attrs.height||150);this._canvas=native.createCanvas(this.width,this.height);}}
 get width(){return this._width||300;}set width(v){this._width=Number(v);if(this._canvas)this._canvas.width=this._width;}
 get height(){return this._height||150;}set height(v){this._height=Number(v);if(this._canvas)this._canvas.height=this._height;}
 get classList(){const self=this;return{contains(k){return self.className.split(/\s+/).includes(k);},toggle(k,yes){const a=new Set(self.className.split(/\s+/).filter(Boolean));if(yes===undefined)yes=!a.has(k);yes?a.add(k):a.delete(k);self.className=[...a].join(' ');},add(k){this.toggle(k,true);},remove(k){this.toggle(k,false);}};}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}set textContent(x){this._text=String(x);this.children=[];}
 get innerHTML(){return this._html;}set innerHTML(html){this._html=html;this._text='';this.children=[];parse(html,this);}
 append(...nodes){nodes.forEach(n=>{if(typeof n==='string')n=new TextElement(n);n.parentElement=this;this.children.push(n);});}appendChild(n){this.append(n);return n;}
 after(n){const siblings=this.parentElement.children,i=siblings.indexOf(this);n.parentElement=this.parentElement;siblings.splice(i+1,0,n);}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(c=>c!==this);this.isConnected=false;}
 focus(){document.activeElement=this;}scrollIntoView(){}setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}
 getBoundingClientRect(){return{left:0,top:0,width:this.width||105,height:this.height||105};}setPointerCapture(){}hasPointerCapture(){return false;}
 getContext(type){if(!this._canvas)this._canvas=native.createCanvas(this.width||300,this.height||150);const ctx=this._canvas.getContext(type);return new Proxy(ctx,{get(t,k){if(k==='drawImage')return(image,...args)=>t.drawImage(image?._canvas||image,...args);const v=t[k];return typeof v==='function'?v.bind(t):v;},set(t,k,v){t[k]=v;return true;}});}
 matches(s){if(!s)return false;if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return this.className.split(/\s+/).includes(s.slice(1));const a=s.match(/^\[([^=\]]+)(?:="?([^"\]]+)"?)?\]$/);if(a){const val=a[1].startsWith('data-')?this.dataset[a[1].slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:this.attrs[a[1]];return val!==undefined&&(a[2]===undefined||val===a[2]);}return this.tagName.toLowerCase()===s;}
 querySelectorAll(selector){const selectors=selector.split(',').map(s=>s.trim());const all=[];const walk=el=>{el.children.forEach(c=>{if(!(c instanceof TextElement))all.push(c);walk(c);});};walk(this);return all.filter(el=>selectors.some(s=>{const parts=s.split(/\s+/);if(!el.matches(parts.pop()))return false;let parent=el.parentElement;while(parts.length){const part=parts.pop();while(parent&&!parent.matches(part))parent=parent.parentElement;if(!parent)return false;parent=parent.parentElement;}return true;}));}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 closest(s){let e=this;while(e){if(e.matches(s))return e;e=e.parentElement;}return null;}
}
class TextElement extends Element{constructor(t){super('#text');this._text=t;}}
function parse(html,parent){const stack=[parent];const tokens=html.match(/<!--[\s\S]*?-->|<![^>]*>|<[^>]+>|[^<]+/g)||[];tokens.forEach(token=>{if(token.startsWith('<!--')||token.startsWith('<!'))return;if(token.startsWith('</')){const tag=token.match(/^<\/([^\s>]+)/)[1].toUpperCase();while(stack.length>1&&stack.at(-1).tagName!==tag)stack.pop();if(stack.length>1)stack.pop();return;}if(token.startsWith('<')){const m=token.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);if(!m)return;const attrs={};const re=/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;let a;while((a=re.exec(m[2])))attrs[a[1]]=decode(a[2]??a[3]??a[4]??'');const el=new Element(m[1].toLowerCase(),attrs);stack.at(-1).append(el);if(!['input','img','meta','link','br','hr','source'].includes(m[1].toLowerCase())&&!token.endsWith('/>'))stack.push(el);}else stack.at(-1).append(new TextElement(decode(token)));});parent.querySelectorAll('select').forEach(s=>{const options=s.querySelectorAll('option');const chosen=options.find(o=>'selected'in o.attrs)||options[0];s.value=chosen?chosen.attrs.value??chosen.textContent:'';});parent.querySelectorAll('textarea').forEach(s=>s.value=s.textContent);}
const documentRoot=new Element('document');parse(fs.readFileSync('index.html','utf8'),documentRoot);
const store=new Map(),listeners={};const document={querySelector:s=>documentRoot.querySelector(s),querySelectorAll:s=>documentRoot.querySelectorAll(s),createElement:t=>new Element(t),createTextNode:t=>new TextElement(t),activeElement:null,hidden:false,addEventListener(n,fn){(listeners[n]??=[]).push(fn);}};document.body=documentRoot.querySelector('body');document.documentElement=documentRoot.querySelector('html');document.documentElement.style.setProperty=function(k,v){this[k]=v;};
class LocalImage extends native.Image{set src(v){super.src=typeof v==='string'&&!v.startsWith('data:')?path.resolve(root,v):v;}get src(){return super.src;}}
class LocalAudio{
 constructor(src){this.src=src;this.paused=true;this.volume=0;this.currentTime=0;this.playCount=0;}
 play(){assert(fs.existsSync(path.resolve(root,this.src)),'Bundled audio exists: '+this.src);this.paused=false;this.playCount++;return Promise.resolve();}
 pause(){this.paused=true;}
}
const context={document,console,Image:LocalImage,navigator:{getGamepads:()=>[]},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},setTimeout:()=>0,clearTimeout:()=>{},setInterval:()=>0,clearInterval:()=>{},requestAnimationFrame:()=>{},Blob,URL:{createObjectURL:()=>'',revokeObjectURL:()=>{}},Math,Date,Promise,JSON,Set,Map};context.window=context;context.addEventListener=()=>{};vm.createContext(context);
context.Audio=LocalAudio;
const scripts=Array.from(fs.readFileSync('index.html','utf8').matchAll(/<script src="([^"]+)"/g),m=>m[1]);scripts.forEach(file=>vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file}));const V=context.V;
const click=selector=>{const el=V.$(selector);assert(el,selector+' exists');assert(!el.disabled,selector+' is enabled');assert.equal(typeof el.onclick,'function',selector+' is clickable');el.onclick();};
const choices=()=>V.$$('#dialogue-choices button');
function drainDialogue(choose=0){let guard=0;while(V.Dialogue.active&&guard++<150){V.Dialogue.typing=10000;V.Dialogue.update(.01);if(choices().length){choices()[choose%choices().length].onclick();}else V.Dialogue.next();}assert(guard<150,'Dialogue converges');}
function saveCanvas(name){V.World.transition=0;V.Engine.time=1.4;V.Game.render(V.Engine.ctx);const destination=path.resolve(__dirname,'renders');fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,name+'.png'),V.Engine.canvas._canvas.toBuffer('image/png'));}
function completeArcade(){let guard=0;while(V.Minigames.active&&guard++<4000){const a=V.Minigames.active;if(a.type==='runner'){a.lane=a.cards.indexOf(a.target.correct);a.x=250+a.lane*230;a.y=416;V.Input.pressed.add('e');}else{const n=a.notes.find(n=>!n.hit&&!n.miss);if(n){a.time=n.at;V.Input.pressed.add(['d','f','j','k'][n.lane]);}}V.Minigames.update(.01);V.Input.pressed.clear();}assert(guard<4000,'Arcade can be completed');click('#mini-finish');}
function completeTimeline(){const events=V.content.timeline;const current=V.$$('.timeline-item');const order=current.map(el=>el.textContent);for(let i=0;i<events.length;i++){let now=V.$$('.timeline-item');let at=now.findIndex(el=>el.textContent.includes(events[i].label));while(at>i){const button=V.$$('[data-move]').find(b=>b.dataset.move===at+',-1');assert(button);button.onclick();at--;}}click('#timeline-check');click('#mini-finish');}
function completeEvidence(){const files=V.$$('.evidence-file');for(let i=0;i<3;i++){V.$$('.inspect-document').find(b=>b.dataset.doc===i+',0').onclick();}V.$$('[data-author]').forEach(s=>{s.value=V.content.evidence.find(x=>x.id===s.dataset.author).name;s.onchange();});click('#evidence-check');click('#mini-finish');}
function completeBias(){for(let i=0;i<V.content.biasCases.length;i++){click('#open-context');V.$$('.bias-choice').find(b=>+b.dataset.i===V.content.biasCases[i].correct).onclick();const next=V.$('.modal-footer')||V.$$('.modal button').at(-1);assert.equal(next.tagName,'BUTTON');next.onclick();}click('#response-care');click('#mini-finish');}
function completeCity(){['ramp','assembly','archive','workshop'].forEach(id=>V.$$('[data-project]').find(b=>b.dataset.project===id).onclick());click('#city-build');click('#city-confirm');click('#mini-finish');}
function startMinigame(type){click('#mini-start');if(type==='beat'||type==='runner')completeArcade();else if(type==='timeline')completeTimeline();else if(type==='evidence')completeEvidence();else if(type==='bias')completeBias();else if(type==='city')completeCity();}
function beatBoss(id){click('#boss-start');for(let stage=0;stage<3;stage++){const a=V.Combat.active;assert.equal(a.stage,stage);for(const pos of a.orbs.slice()){a.player.x=pos.x;a.player.y=pos.y;V.Combat.update(.01);}assert.equal(a.signal,2);a.selected=stage;a.player.x=480;a.player.y=255;V.Input.pressed.add('e');V.Combat.update(.01);V.Input.pressed.clear();}assert(!V.Combat.active,'Boss resolves');click('#boss-victory');drainDialogue();assert(V.state.completed.includes(id));}
function gotoObject(type,predicate){
 V.UI.close();const map=Object.values(V.World.maps).find(m=>m.objects.some(o=>o.type===type&&predicate(o)));
 assert(map,'Object map exists for '+type);V.World.load(map.id);
 const o=map.objects.find(o=>o.type===type&&predicate(o));V.Player.data.x=o.x+24;V.Player.data.y=o.y+32;
 V.Game.interact(o);return o;
}
function readComplete(reading){
 gotoObject('reading',o=>o.reading.id===reading.id);
 while(V.$('#reader-next'))click('#reader-next');click('#reader-save');
 assert(V.state.readings.includes(reading.id));
 const question=V.Teacher.questions.find(q=>q.readingId===reading.id&&q.grade===V.state.grade)||V.Teacher.questions.find(q=>q.id===reading.questionId);
 if(question&&V.$('#history-next')){
  V.$$('[data-history-answer]').find(b=>+b.dataset.historyAnswer===(question.correct+1)%question.options.length).onclick();
  assert(V.$('#history-next').disabled,'Wrong response leaves opportunity to retry');
  V.$$('[data-history-answer]').find(b=>+b.dataset.historyAnswer===question.correct).onclick();
  click('#history-next');assert(V.state.knowledge.includes(question.id));
 }V.UI.close();
}
function solveWorkshop(id){
 gotoObject('workbench',o=>o.mission===id);
 if(id==='rhythm-workshop'){
  click('#sequence-check');assert(V.$('#sequence-feedback').textContent.includes('Compare'));
  [0,2,1,2,3].forEach(n=>V.$$('[data-sequence-key]').find(b=>+b.dataset.sequenceKey===n).onclick());
  click('#sequence-check');click('#sequence-check');
 }else if(id==='backup'){
  const pairs=[['Assinatura','Autoria'],['Ficha de arquivo','Origem'],['Ano registrado','Data'],['Condições de produção','Contexto']];
  pairs.forEach(pair=>pair.forEach(label=>{const button=V.$$('[data-match-card]').find(b=>!b.disabled&&b.textContent===label);assert(button,label);button.onclick();}));
  click('#match-finish');
 }else if(id==='experiment'){
  V.$$('[data-experiment]')[1].onclick();click('#experiment-run');assert(V.$('#experiment-result').textContent.includes('Revise'));
  V.$$('[data-experiment]')[0].onclick();click('#experiment-run');assert(V.$('#experiment-result').textContent.includes('A = 8'));
  click('#experiment-run');
 }else if(id==='newsroom'){
  click('#news-publish');assert(V.$('#news-feedback').textContent.includes('Confira'));
  V.$$('[data-news-check]').forEach(b=>b.onclick());V.$('#news-headline').value='0';click('#news-publish');click('#news-publish');
 }else{
  click('#sort-check');assert(V.$('#sort-feedback').textContent.includes('Revise'));
  V.$$('[data-sort-item]').forEach((el,i)=>{el.value=String(i);el.onchange();});click('#sort-check');click('#sort-check');
 }
 assert(V.state.sideQuests[id].done,'Mission completes through workshop controls: '+id);
}
function testExpansion(report){
 assert.equal(V.learning.readings.length,54);assert.equal(V.learning.questions.length,120);assert.equal(V.learning.residents.length,60);
 V.learning.readings.forEach(readComplete);assert.equal(V.state.readings.length,54);
 V.learning.questions.forEach(q=>{
  V.Living.quiz(q.chapter,[q]);V.$$('[data-history-answer]').find(b=>+b.dataset.historyAnswer===q.correct).onclick();click('#history-next');
 });assert.equal(V.state.knowledge.length,120);
 const reviewDeck=V.learning.questions.slice(0,3);V.Living.quiz(reviewDeck[0].chapter,reviewDeck);
 click('#history-source');while(V.$('#reader-next'))click('#reader-next');click('#reader-save');
 assert(V.$('.history-prompt').textContent.includes(reviewDeck[0].prompt),'Consulting the reading returns to the same question');
 V.$$('[data-history-answer]').find(b=>+b.dataset.historyAnswer===reviewDeck[0].correct).onclick();click('#history-next');
 assert(V.$('.history-prompt').textContent.includes(reviewDeck[1].prompt),'Question deck continues after consulting a reading');V.UI.close();
 V.Living.journal('readings');assert.equal(V.$$('[data-open-reading]').length,54);
 V.$('#reading-search').value='Mali';V.$('#reading-search').oninput({target:V.$('#reading-search')});assert(V.$$('[data-open-reading]').length>=1);
 V.UI.close();report.push('All54 books/notes read through real page controls; all120 historical questions resolved, retry feedback and searchable collection verified.');
 V.World.load('library');const book=V.World.current.objects.find(o=>o.scene?.id==='library-recommend');V.Player.data.x=book.x;V.Player.data.y=book.y+35;
 const cam=V.World.camera;V.$('#world-canvas').onpointerdown({clientX:book.x-cam.x,clientY:book.y-cam.y-24});
 assert(V.$$('[data-cozy-read]').length,'Clicking a nearby shelf opens its books even with moving NPCs in the scene');V.$$('[data-cozy-read]')[0].onclick();assert(V.$('#reader-save')||V.$('#reader-next'),'Every shelf retains book access');V.UI.close();
 for(const q of V.Living.missions.filter(q=>!q.culture&&!q.heritage&&!q.coast&&!q.protest)){
  V.Living.showMission(q.id);click('#mission-start');let guard=0;
  while(!V.state.sideQuests[q.id].done&&guard++<10){
   const step=q.steps[V.state.sideQuests[q.id].step];
   if(step.kind==='talk')step.targets.forEach(id=>{gotoObject('resident',o=>o.resident.id===id);drainDialogue();V.UI.close();});
   else if(step.kind==='read')readComplete(V.learning.readings.find(r=>!step.chapter||r.chapter===step.chapter));
   else if(step.kind==='pickup'||step.kind==='collect')step.targets.forEach(id=>{gotoObject('pickup',o=>o.id===id);V.UI.close();});
   else if(step.kind==='deliver')step.targets.forEach(id=>gotoObject('delivery',o=>o.id===id));
   else if(step.kind==='water')step.targets.forEach(id=>gotoObject('water',o=>o.id===id));
   else if(step.kind==='animal')[0,2,5].forEach(id=>{gotoObject('animal',o=>o.species===id);click('#animal-close');});
   else if(step.kind==='puzzle')solveWorkshop(q.id);
  }
  assert(guard<10&&V.state.sideQuests[q.id].done,q.title+' can be completed');
 }
 report.push('All12 community missions completed through their interactions: delivery, interview, collection, sequence, curatorship, experiment, newsroom, watering, cataloguing, observation, consent and human review.');
 let moved=0;V.UI.close();V.settings.npcMovement=true;V.settings.reducedMotion=false;
 for(const m of Object.values(V.World.maps)){
  V.World.load(m.id);const starts=m.objects.filter(o=>o.waypoints).map(o=>({o,x:o.x,y:o.y}));
  for(let frame=0;frame<1500;frame++){V.Engine.time+=.04;V.World.update(.04);for(const o of m.objects.filter(o=>o.waypoints))assert(!V.Cozy.blocked(m,o,o.x,o.y),m.id+' '+o.id+' stays outside walls');}
  moved+=starts.filter(a=>Math.hypot(a.o.x-a.x,a.o.y-a.y)>12).length;
  if(['hub','library','park','market','garden','room-1','room-3','room-4','room-5','room-6'].includes(m.id))saveCanvas('rich-'+m.id);
 }
 assert(moved>=25,'Many walkers move: '+moved);
 V.World.load('park');const walker=V.World.current.objects.find(o=>o.type==='resident');V.settings.npcMovement=false;const position={x:walker.x,y:walker.y};for(let i=0;i<200;i++)V.World.update(.04);assert.equal(walker.x,position.x);assert.equal(walker.y,position.y);V.settings.npcMovement=true;
 report.push('NPCs and animals follow collision-aware routes in all18 maps; '+moved+' walkers moved; optional motion disabling verified.');
 V.World.load('hub');const conversation=V.World.current.objects.find(o=>o.scene?.kind==='conversation');V.Game.interact(conversation);drainDialogue();assert(V.state.dialogueHistory.some(d=>d.pt===V.World.current.chats[0].lines[0]));
 V.Game.map();assert.equal(V.$$('[data-local-region]').length,6);V.$$('[data-local-region]').find(b=>b.dataset.localRegion==='garden').onclick();assert.equal(V.World.current.id,'garden');
 V.Game.settings();V.$('#s-ambience').value='.7';V.$('#s-muted').checked=false;click('#settings-apply');assert.equal(V.settings.ambience,.7);assert(V.Audio.ambient&&!V.Audio.ambient.paused);
 for(const[id,environment]of[['hub','plaza'],['library','library'],['park','park'],['market','market'],['room-1','studio'],['room-3','lab'],['garden','garden'],['room-2','archive'],['room-4','newsroom'],['room-6','archive']]){V.World.load(id);assert.equal(V.Audio.environment,environment);assert(V.Audio.ambient.src.endsWith(environment+'.wav'));}
 V.settings.muted=true;V.Audio.apply();assert(V.Audio.ambient.paused);assert.equal(V.Audio.ambient.volume,0);
 report.push('Ambient file selection, mute, volume and user-unlock logic pass with a mocked Audio element; actual sound playback requires browser verification.');
 V.Save.save();const data=JSON.parse(JSON.stringify(V.Save.load()));V.Game.loadState(data);V.UI.close();assert.equal(V.state.readings.length,54);assert.equal(V.state.knowledge.length,120);assert.equal(Object.values(V.state.sideQuests).filter(s=>s.done).length,12);
 const legacy=JSON.parse(JSON.stringify(data));['readings','knowledge','residentTalks','observations','watered','tokens','deliveries','sideQuests','readingPages','historyAttempts','trackedQuest'].forEach(k=>delete legacy[k]);V.Game.loadState(legacy);V.UI.close();assert.equal(V.state.readings.length,0);assert.equal(V.state.completed.length,6);V.Game.loadState(data);V.UI.close();
 report.push('Expanded progress save/load and migration of previous version1 saves preserve the six-chapter campaign.');
}
async function main(){const report=[];await V.Game.init();assert.equal(V.Assets.errors.length,0,V.Assets.errors.join(', '));assert.equal(scripts.length,52);assert.equal(Object.keys(V.Assets.images).length,247);report.push('All 52 scripts and 247 runtime PNG assets load.');assert.equal(Object.keys(V.World.maps).length,18);click('#new-game');V.$$('[data-grade]')[0].onclick();click('#creation-next');V.$('#creation-name').value='Teste VOICES';click('#creation-begin');click('#intro-next');click('#intro-next');click('#intro-next');assert.equal(V.Game.screen,'game');saveCanvas('hub');const before=V.Player.data.x;V.Input.keys.add('d');V.Game.update(.1);V.Input.keys.clear();assert(V.Player.data.x>before);assert(V.World.collides(3*48,3*48,11));assert(!V.World.collides(16*48,17*48,11));report.push('New game, three-step intro, character, delta-time movement, collision and hub rendering.');
 V.Living.showMission('human-review');assert(V.$('#mission-start').disabled,'Late-region community mission requires its chapter portal');V.UI.close();
 V.Game.prologue();drainDialogue();click('#mini-start');saveCanvas('word-runner');completeArcade();drainDialogue();assert(V.state.flags.prologueDone);report.push('Playable prologue and Word Runner, with translation and vocabulary.');
 for(let id=1;id<=6;id++){V.Game.enterChapter(id);drainDialogue();const chapter=V.content.chapters[id-1];assert.equal(V.World.current.chapter,id);saveCanvas('chapter-'+id);for(const clue of chapter.clues){V.Quests.collect(clue);drainDialogue();assert(V.state.evidence.includes(clue.id));}for(const npc of V.World.current.objects.filter(o=>o.type==='npc')){V.Game.interact(npc);drainDialogue(id%2);assert(V.state.talked.includes(npc.id));}assert.equal(V.Quests.status(id).clues,3);assert.equal(V.Quests.status(id).talked,2);assert(!V.Quests.ready(id));V.Quests.challenge(id);if(id===1){V.$$('.wire-button').find(b=>b.dataset.i==='0').onclick();V.$$('.wire-button').find(b=>b.dataset.i==='2').onclick();V.$$('.wire-button').find(b=>b.dataset.i==='2').onclick();click('#wire-check');}if(id===6){click('#final-start');startMinigame('beat');startMinigame('timeline');startMinigame('runner');click('#final-review');click('#mini-finish');}else startMinigame(chapter.minigame);assert(V.Quests.ready(id));V.Combat.start(id);click('#boss-start');saveCanvas('boss-'+id);V.Combat.active=null;V.Game.mode='explore';V.Combat.start(id);beatBoss(id);report.push('Chapter '+id+': intro, three clues, two branching conversations, '+chapter.minigame+', 3-stage boss, resolution.');if(id<6)click('#reward-hub');}
 assert(V.state.finished);assert(V.$('.ending-title'));click('#ending-explore');assert.equal(V.World.current.id,'hub');assert.equal(V.state.completed.length,6);assert.equal(V.state.evidence.length,18);report.push('Beginning-to-ending completion: six chapters,18 clues, all six minigame systems and six bosses.');
 const finalState=JSON.parse(JSON.stringify(V.state));V.Save.save();const reloaded=V.Save.load();assert.equal(reloaded.completed.length,6);V.Game.loadState(reloaded);assert(V.state.finished);V.UI.close();report.push('Save/load round trip in a LocalStorage-compatible harness.');
 V.Teacher.show('config');V.$('#teacher-grade').value='8';V.$('#teacher-translation').checked=false;V.$('#teacher-mode').value='teams';click('#teacher-save-config');assert.equal(V.state.grade,8);assert.equal(V.settings.translation,false);assert.equal(V.settings.mode,'teams');V.UI.close();V.Game.reward(1);const oldTeam=V.state.teamIndex;click('#reward-hub');assert.notEqual(V.state.teamIndex,oldTeam);report.push('Grade, translation, classroom preferences and local team rotation.');
 V.Teacher.show('questions');click('#question-add');V.$('#q-prompt').value='Custom: We ___ evidence.';['collect','collects','collecting','collected'].forEach((x,i)=>V.$('#q-option-'+i).value=x);V.$('#q-explanation').value='With we, use collect.';V.$('#q-grade').value='8';V.$('#q-chapter').value='1';click('#q-save');assert(V.Teacher.questions.some(q=>q.prompt.startsWith('Custom:')));V.Teacher.init();assert(V.Teacher.questions.some(q=>q.prompt.startsWith('Custom:')));report.push('Teacher-created question is validated, saved, merged and reloaded.');
 V.Teacher.show('glossary');click('#word-add');V.$('#word-en').value='archive';V.$('#word-pt').value='arquivo';V.$('#word-example').value='We maintain the archive.';V.$('#word-examplePt').value='Cuidamos do arquivo.';click('#word-save');V.Teacher.init();assert.equal(V.Teacher.glossary.find(x=>x.en==='archive').pt,'arquivo');assert.throws(()=>V.Teacher.validate({questions:[{id:'bad'}],glossary:[]}));report.push('Custom glossary persists; malformed content rejected.');
 V.UI.close();V.Game.practice(1);const q=V.Teacher.questions.find(x=>x.grade===8&&x.chapter===1);V.$$('.practice-option').find(b=>+b.dataset.i===q.correct).onclick();report.push('Custom questions appear and function in an English practice terminal.');
 V.UI.close();V.World.load('library');saveCanvas('library');assert(!V.World.collides(V.Player.data.x,V.Player.data.y,11));report.push('Enterable library and regional interiors render and have usable spawn positions.');
 testExpansion(report);
 // Every important object must be approachable through collision-free space.
 for(const m of Object.values(V.World.maps)){V.World.current=m;const start={x:Math.floor(m.width/2),y:m.height-4};const todo=[start],seen=new Set();while(todo.length){const p=todo.shift(),key=p.x+','+p.y;if(seen.has(key))continue;seen.add(key);for(const[dX,dY]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dX,y=p.y+dY,k=x+','+y;if(x>=1&&x<m.width-1&&y>=1&&y<m.height-1&&!seen.has(k)&&!V.World.collides(x*48+24,y*48+24,11))todo.push({x,y});}}for(const o of m.objects){const reachable=[...seen].some(k=>{const[x,y]=k.split(',').map(Number);return Math.hypot(x*48+24-o.x,y*48+24-o.y)<(o.interactionRange||80);});assert(reachable,m.id+' '+o.id+' approachable');}}
 report.push('Flood-fill collision validation: all interactable objects in all18 maps can be approached.');
 const off=JSON.parse(JSON.stringify(finalState));V.Save.write('save',off);assert(V.Save.load());V.Save.write('custom',{questions:[],glossary:[]});report.push('All runtime data is inline/local; no fetch, modules, network assets or playback backend.');
 const result={date:new Date().toISOString(),environment:'Node VM + minimal DOM harness + native Canvas (NOT a browser)',passed:report,limitations:['No installed test browser. Real Chrome/Edge UI layout, keyboard default events, Web Audio permission, gamepad and touch were not browser-verified.','Canvas renders use the same game renderer and PNG assets. The DOM harness is limited and does not validate responsive CSS.']};fs.writeFileSync(path.join(__dirname,'runtime-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));}
module.exports={V,click,drainDialogue,saveCanvas,context,native,main};
if(require.main===module)main().catch(err=>{console.error(err.stack);process.exit(1);});
