// Run with: node tests/tutorial-skip-energy-regression.mjs
// Lightweight regression for the tutorial controller (no browser dependencies).
import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

function classList(){const values=new Set();return {add:(v)=>values.add(v),remove:(v)=>values.delete(v),contains:(v)=>values.has(v),toggle(v,on){if(on===undefined)on=!values.has(v);if(on)values.add(v);else values.delete(v)}}}
const elements=new Map()
function element(id){if(!elements.has(id))elements.set(id,{classList:classList(),style:{},textContent:'',innerHTML:'',src:'',disabled:false,setAttribute(key,val){this[key]=val}});return elements.get(id)}
for(const id of ['quizModal','modal','labModal','hubModal'])element(id).classList.add('hidden')
const doc={body:{classList:classList()},getElementById:element,querySelector(selector){return selector==='#hubModal'?element('hubModal'):null}}
const progress={data:{tutorialDismissed:false,achievements:[],unlockTipsSeen:['miniSun','mercury'],unlocked:1},persist(){}}
const ctx={document:doc,window:{addEventListener(){},matchMedia(){return {matches:true}}},requestAnimationFrame(){return 0},cancelAnimationFrame(){},
 energy:0,waveIndex:0,gameMode:'campaign',tutorialStep:0,tutorialDone:false,paused:false,running:false,gameOver:false,checkpointInProgress:false,
 Progress:progress,unitDefs:{miniSun:{cost:60,name:'Mini Sol'},mercury:{cost:90,name:'Mercúrio'},jupiter:{cost:270,name:'Júpiter'},belt:{cost:80,name:'Cinturão'},venus:{cost:175,name:'Vênus'}},
 Content:{stageUnlocks:[['miniSun','mercury','jupiter'],['belt','venus']],trainingSituations:{}},
 startWaveBtn:element('startWaveBtn'),pauseBtn:element('pauseBtn'),statusText:element('statusText'),
 quizModal:element('quizModal'),modal:element('modal'),labModal:element('labModal'),gameStage:element('gameStage'),
 assetPath:v=>v,saveRun(){ctx.saved=true},updateHud(){ctx.hudEnergy=ctx.energy},showToast(v){ctx.toast=v},getUpgradeCost(){return 180},selectedTower:null,
 isUnlocked:id=>id!=='jupiter'||ctx.waveIndex>0,defenders:[],enemies:[],energyOrbs:[]}
vm.createContext(ctx)
const ui=fs.readFileSync(new URL('../js/ui.js',import.meta.url),'utf8')
vm.runInContext(ui.split('var Interface=(()=>{')[0],ctx,{filename:'js/ui.js'})
function test(title,fn){fn();console.log('PASS',title)}
test('Tutorial principal completa energia mínima do Mini Sol obrigatório',()=>{
 ctx.tutorialStep=7;ctx.energy=0;ctx.TutorialGuide.render()
 assert.equal(ctx.energy,60);assert.equal(ctx.hudEnergy,60)
 assert.equal(ctx.TutorialGuide.expectedPlacementType(),'miniSun')
 assert.equal(element('tutorialSkipText').textContent,'Pular tutorial')
})
test('Tutorial não concede energia extra se já houver recurso suficiente',()=>{
 ctx.energy=160;ctx.TutorialGuide.render();assert.equal(ctx.energy,160)
})
test('Botão skip permanece durante as pausas após posicionar uma construção',()=>{
 ctx.TutorialGuide.afterPlacement({id:7,type:'miniSun',x:410,y:120})
 assert.equal(ctx.TutorialGuide.actionPaused,true)
 assert.equal(element('tutorialSkip').classList.contains('hidden'),false)
 ctx.TutorialGuide.skip()
 assert.equal(ctx.tutorialDone,true)
 assert.equal(ctx.TutorialGuide.actionPaused,false)
 assert.equal(ctx.Progress.data.tutorialDismissed,true)
 assert.equal(element('tutorial').classList.contains('hidden'),true)
})
test('Energia não é reposta depois de pular o tutorial',()=>{
 ctx.energy=0;ctx.TutorialGuide.render();assert.equal(ctx.energy,0)
})
test('Pular tutorial pausado libera simulação sem perder o estado',()=>{
 ctx.tutorialDone=false;ctx.tutorialStep=11;ctx.running=true;ctx.paused=false;ctx.TutorialGuide.render()
 assert.equal(ctx.paused,true)
 ctx.TutorialGuide.skip()
 assert.equal(ctx.paused,false);assert.equal(ctx.tutorialDone,true)
 ctx.running=false
})
test('Upgrade obrigatório também tem energia garantida',()=>{
 ctx.tutorialDone=false;ctx.tutorialStep=18;ctx.selectedTower={id:1};ctx.energy=0;ctx.TutorialGuide.render()
 assert.equal(ctx.energy,180)
 ctx.selectedTower=null
})
test('Nova construção exige energia e oferece skip próprio',()=>{
 ctx.tutorialDone=true;ctx.waveIndex=1;ctx.tutorialStep=0;ctx.Progress.data.unlocked=2;ctx.TutorialGuide.scanUnlocks()
 assert.equal(ctx.TutorialGuide.unlockActive,true)
 assert.equal(element('tutorialSkipText').textContent,'Pular este exercício')
 ctx.TutorialGuide.advance();assert.equal(ctx.TutorialGuide.unitSelected('belt'),true)
 ctx.energy=0;ctx.TutorialGuide.render()
 assert.equal(ctx.energy,80)
 assert.equal(ctx.TutorialGuide.expectedPlacementType(),'belt')
 ctx.TutorialGuide.skip()
 assert.equal(ctx.Progress.data.unlockTipsSeen.includes('belt'),true)
 assert.equal(ctx.TutorialGuide.unlockActive,true) // Próximo exercício na fila.
 ctx.TutorialGuide.skip()
 assert.equal(ctx.TutorialGuide.unlockActive,false)
 assert.equal(element('startWaveBtn').disabled,false)
 assert.equal(element('tutorial').classList.contains('hidden'),true)
})
console.log('Todos os testes de skip e energia passaram.')
