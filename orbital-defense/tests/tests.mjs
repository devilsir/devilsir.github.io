import fs from 'node:fs'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { harness } from './harness.mjs'
const require=createRequire(import.meta.url)
const {createCanvas}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas')
const results=[]
async function test(name,fn){const h=harness();try{await fn(h);results.push({name,status:'pass'});console.log('PASS',name)}catch(error){results.push({name,status:'fail',error:error.stack});console.error('FAIL',name,error.stack)}finally{await h.close()}}
const snapshot=h=>JSON.parse(h.run('JSON.stringify({energy,health,waveIndex,running,paused,checkpointIndex,checkpointStates,defenders,enemies,energyOrbs,spawnQueue,powerCharges})'))
const setup=(h,index=0)=>h.run(`startStage(${index});tutorialDone=true;energy=9000;`)
const place=(h,type,lane,col)=>h.run(`selected=${JSON.stringify(type)};placeAt({x:gridX[${col}],y:curveY(${lane},gridX[${col}])});`)
function steps(h,time){h.run(`for(let t=0;t<${time};t+=.025)update(.025)`)}
await test('Boot: 8 chapters, 15 defenders, 23 enemies, 24 checkpoints',h=>{
 assert.equal(h.run('waves.length'),8);assert.equal(h.run('Object.keys(unitDefs).length'),15);assert.equal(h.run('Object.keys(enemyDefs).length'),23);assert.equal(h.run('questions.length'),8);assert.ok(h.run('questions.every(q=>q.length===3)'));assert.equal(h.doc.querySelectorAll('.unit-card').length,15)
})
await test('Preparation: placement, no energy, no cooldown or motion before and between chapters',h=>{
 place(h,'miniSun',0,1);place(h,'mercury',2,1);const before=snapshot(h);steps(h,30);assert.deepEqual(snapshot(h),before)
 h.run('startStage(2);energy=1000;selected="miniSun";placeAt({x:410,y:curveY(0,410)});');const second=snapshot(h);steps(h,30);assert.deepEqual(snapshot(h),second)
})
await test('Mini Sun activates only in battle and energy requires collection',h=>{
 place(h,'miniSun',0,1);h.run('startWave();spawnQueue=[];waveTotal=100;');const energy=h.run('energy');steps(h,4.3);assert.ok(h.run('energyOrbs.length')>=1);assert.equal(h.run('energy'),energy);h.run('collectOrb(0)');assert.ok(h.run('energy')>energy)
})
await test('Paused battle allows building while Mini Sun production stays frozen',h=>{
 setup(h,0);h.run('Progress.data.unlocked=8;checkpointIndex=1;buildDeck();startWave();spawnQueue=[];waveTotal=100;paused=true;energy=9000;defenders=[];energyOrbs=[];selected="jupiter";placeAt({x:gridX[5],y:curveY(0,gridX[5])});');assert.equal(h.run('defenders.length'),1);assert.equal(h.run('defenders[0].type'),'jupiter')
 h.run('selected="miniSun";placeAt({x:gridX[1],y:curveY(2,gridX[1])});defenders.find(d=>d.type==="miniSun").cooldown=0;energyOrbs=[];');steps(h,10);assert.equal(h.run('energyOrbs.length'),0);assert.equal(h.run('defenders.find(d=>d.type==="miniSun").cooldown'),0)
 assert.deepEqual(h.run('Content.trainingSituations.jupiter.point'),[0.6641,0.1391,112])
})
await test('Towers attack; typed resistance and damage over time do not inflate with framerate',h=>{
 setup(h,2);place(h,'mars',0,1);h.run('startWave();spawnQueue=[];waveTotal=100;enemies=[createEnemy("ice",0,{x:650})];');const hp=h.run('enemies[0].hp');steps(h,4);assert.ok(h.run('enemies[0]?.hp||0')<hp)
 h.run('enemies=[createEnemy("asteroid",0,{hp:1000,maxHp:1000})];for(let i=0;i<100;i++)applyDamage(enemies[0],.1,"plasma",true)');assert.ok(Math.abs(h.run('enemies[0].hp')-990)<.001)
})
await test('Jupiter blocks contact; Saturn rings damage; destroyed barriers leave no stale panel',h=>{
 setup(h,2);place(h,'jupiter',0,3);h.run('startWave();spawnQueue=[];waveTotal=100;enemies=[createEnemy("asteroid",0,{x:674})];');steps(h,1);assert.ok(h.run('enemies[0].x')>=673);assert.ok(h.run('defenders[0].hp')<1250)
 h.run('defenders=[];enemies=[];selected="saturn";placeAt({x:630,y:curveY(0,630)});enemies=[createEnemy("asteroid",0,{x:672})]');const hp=h.run('enemies[0].hp');steps(h,.5);assert.ok(h.run('enemies[0].hp')<hp)
 h.run('showTowerPanel(defenders[0]);defenders[0].hp=0');steps(h,.1);assert.equal(h.run('selectedTower'),null)
})
await test('Three-level upgrade branches and refund of total investment',h=>{
 setup(h,1);place(h,'mercury',0,1);h.run('showTowerPanel(defenders[0]);upgradeSelectedTower();upgradeSelectedTower("b");');assert.equal(h.run('defenders[0].level'),3);assert.equal(h.run('currentDamageType(defenders[0])'),'pierce');const invested=h.run('defenders[0].spent'),energy=h.run('energy');h.run('sellSelectedTower()');assert.equal(h.run('defenders.length'),0);assert.equal(h.run('energy'),Math.min(9999,energy+Math.round(invested*.65)))
})
await test('Moon attachment intercepts damage and boosts Earth control',h=>{
 setup(h,3);h.run('Progress.data.nodes.push("moon")');place(h,'earth',0,1);place(h,'moon',0,1);assert.ok(h.run('!!defenders[0].moon'));const hp=h.run('defenders[0].hp');h.run('damageTower(defenders[0],100)');assert.equal(h.run('defenders[0].hp'),hp-70);assert.equal(h.run('defenders[0].moon.hp'),150);h.run('upgradeMoon(defenders[0]);upgradeMoon(defenders[0],"a")');assert.equal(h.run('defenders[0].moon.level'),3);const secondHP=h.run('defenders[0].hp');h.run('damageTower(defenders[0],100)');assert.equal(h.run('defenders[0].hp'),secondHP-55)
})
await test('Correct checkpoint rewards; wrong checkpoint summons a real boss and suspends spawns',h=>{
 setup(h,0);h.run('startWave();showCheckpoint(0,0)');const energy=h.run('energy');h.run('answerCheckpoint(true)');assert.equal(h.run('energy'),energy+90);assert.equal(h.run('checkpointIndex'),1);assert.equal(h.run('Progress.data.research'),2);h.run('closeCheckpoint();showCheckpoint(0,1);answerCheckpoint(1);closeCheckpoint()');assert.ok(h.run('penaltyBossActive'));assert.ok(h.run('enemies.some(e=>e.isSuperboss)'));const queue=h.run('spawnQueue.length');steps(h,4);assert.equal(h.run('spawnQueue.length'),queue);h.run('enemies.find(e=>e.isSuperboss).hp=0');steps(h,.1);assert.equal(h.run('penaltyBossActive'),false);steps(h,5);assert.ok(h.run('spawnQueue.length')<queue)
})
await test('Every chapter triggers exactly three checkpoints and records completion',h=>{
 setup(h,0)
 for(let stage=0;stage<8;stage++){
  h.run(`startStage(${stage});debugState.invincible=true;energy=9999;startWave();`)
  let triggered=0
  for(let i=0;i<20000&&!h.run('phaseCompletePending||gameOver');i++){
   if(h.run('checkpointInProgress')){h.run('answerCheckpoint(questions[waveIndex][checkpointIndex].kind==="choice"?questions[waveIndex][checkpointIndex].correct:true);closeCheckpoint()');triggered++}
   h.run('enemies.forEach(e=>e.hp=0);update(.1)')
  }
  assert.equal(triggered,3,'chapter '+stage);assert.equal(h.run('checkpointIndex'),3);assert.equal(h.run('Progress.data.stars['+stage+']'),3);assert.equal(h.run('phaseCompletePending'),true);h.run('modal.classList.add("hidden");paused=false;phaseCompletePending=false')
 }
 assert.equal(h.run('Progress.data.unlocked'),8);assert.ok(h.run('Progress.data.achievements.includes("campanha")'));h.run('phaseCompletePending=true;handleModalAction()');assert.equal(h.run('gameOver'),true)
})
await test('Game-over removes saved active battle and keeps research',h=>{
 setup(h,2);h.run('Progress.data.research=12;startWave();spawnQueue=[];enemies=[createEnemy("boss",2,{x:140,coreDamage:99})]');steps(h,.2);assert.equal(h.run('gameOver'),true);assert.equal(h.run('Progress.data.resume'),null);assert.equal(h.run('Progress.data.research'),12)
})
await test('Save/reload retains investment, active enemies, checkpoints and difficulty',async h=>{
 setup(h,3);place(h,'mercury',0,1);h.run('Progress.data.settings.difficulty="student";startWave();spawnEnemy("jumper");checkpointIndex=1;checkpointStates=["ok",null,null];saveRun()');const save=JSON.parse(h.run('Progress.export()'));const h2=harness(save);assert.equal(h2.run('waveIndex'),3);assert.equal(h2.run('defenders.length'),1);assert.equal(h2.run('enemies[0].type'),'jumper');assert.equal(h2.run('checkpointIndex'),1);assert.equal(h2.run('paused'),true);assert.equal(h2.run('Progress.data.settings.difficulty'),'student');h2.run('startWave()');assert.equal(h2.run('paused'),false);await h2.close()
})
await test('Orbital formulas: inverse square, Kepler equation, equal areas and circular special case',h=>{
 assert.ok(Math.abs(h.run('Physics.eccentric(1,.6)-.6*Math.sin(Physics.eccentric(1,.6))')-1)<1e-10);assert.ok(Math.abs(h.run('Physics.swept(0,.4,1,.6)-Physics.swept(Math.PI,Math.PI+.4,1,.6)'))<1e-9);assert.ok(Math.abs(h.run('Physics.orbit(0,4,0,1).period/(2*Math.PI)')-8)<1e-9);assert.ok(h.run('Physics.orbit(0,1,.6).velocity>Physics.orbit(Math.PI,1,.6).velocity'))
})
await test('Interactive challenge controls submit actual configurations',h=>{
 setup(h,1);h.run('startWave();showCheckpoint(1,0)');h.doc.querySelector('#quizVisual .challenge-controls button').click();h.doc.querySelector('#quizVisual .primary-btn').click();assert.equal(h.run('checkpointStates[0]'),'ok');h.run('closeCheckpoint();showCheckpoint(1,1)');const slider=h.doc.querySelector('#quizVisual input');slider.value='.6';slider.dispatchEvent(new h.window.Event('input'));h.doc.querySelector('#quizVisual .primary-btn').click();assert.equal(h.run('checkpointStates[1]'),'ok')
})
await test('Research, observatory, campaign and settings menus render without exceptions',h=>{
 h.doc.getElementById('campaignBtn').click();assert.equal(h.doc.querySelectorAll('.campaign-node').length,8);h.doc.getElementById('hubClose').click();h.run('Progress.data.research=50');h.doc.getElementById('researchBtn').click();assert.equal(h.doc.querySelectorAll('.research-node').length,10);h.doc.querySelector('.research-node').click();assert.equal(h.run('Progress.has("economy")'),true);h.doc.getElementById('hubClose').click();h.run('Progress.discover("iron")');h.doc.getElementById('codexBtn').click();assert.ok(h.doc.querySelectorAll('.codex-item').length>=28);[...h.doc.querySelectorAll('.codex-item')].find(b=>!b.disabled).click();assert.ok(h.doc.getElementById('codexDetails').textContent.includes('NOTA CIENTÍFICA'));h.doc.getElementById('hubClose').click();h.doc.getElementById('settingsBtn').click();assert.equal(h.doc.querySelectorAll('input[type=range]').length>=3,true)
})
await test('Boss phases disable/displace towers and horizon blocks slots',h=>{
 setup(h,6);place(h,'mercury',2,3);h.run('startWave();spawnQueue=[];waveTotal=100;enemies=[createEnemy("neutronBoss",2,{x:700,hp:300,maxHp:1000,abilityTimer:0})]');steps(h,.1);assert.equal(h.run('enemies[0].bossPhase'),3);assert.ok(h.run('defenders[0].disabled')>0);h.run('enemies=[createEnemy("blackhole",2,{x:700,hp:300,maxHp:1000,bossPhase:3,phaseClock:0})]');assert.equal(h.run('slotBlocked({lane:2,x:740,y:360})'),true)
})
await test('Powers have limited charges and orbital move selects two valid slots',h=>{
 setup(h,2);place(h,'mercury',2,1);h.run('startWave();spawnQueue=[];waveTotal=100;enemies=[createEnemy("asteroid",2,{x:1000,hp:1000,maxHp:1000})];usePower("flare");usePower("flare")');assert.equal(h.run('powerCharges.flare'),0);assert.equal(h.run('enemies[0].hp'),855);h.run('usePower("shift");usePowerAt({x:410,y:360});usePowerAt({x:520,y:360})');assert.equal(h.run('defenders[0].col'),2);assert.equal(h.run('powerCharges.shift'),1)
})
await test('Endless progression persists defenses and respects preparation freeze',h=>{
 setup(h,3);h.run('gameMode="endless";gameStarted=true;energy=9000');place(h,'mercury',2,1);h.run('running=true;checkpointStates=["ok","ok","ok"];checkpointIndex=3;finishPhase();handleModalAction()');assert.equal(h.run('endlessRound'),2);assert.equal(h.run('defenders.length'),1);assert.equal(h.run('running'),false);const before=snapshot(h);steps(h,20);assert.deepEqual(snapshot(h),before)
})
await test('Particles, energy and projectiles stay bounded; missing images fail asset check',async h=>{
 await Promise.all(h.run('Object.values(imgs)').map(i=>i.decode()));h.run('running=true;for(let i=0;i<100;i++){burst(500,300,"#fff",100);spawnEnergyOrb(500,300)}');assert.ok(h.run('particles.length')<=380);assert.ok(h.run('energyOrbs.length')<=35);assert.ok(h.run('Object.values(imgs).every(i=>i.complete&&i.naturalWidth>0)'))
 setup(h,4);for(const [type,lane,col] of [['miniSun',0,0],['mercury',0,1],['earth',1,1],['mars',2,1],['uranus',3,1],['neptune',4,1],['jupiter',0,4],['saturn',2,4],['gravity',1,3]])place(h,type,lane,col)
 h.run('startWave();spawnQueue=[];waveTotal=100;sunAppear=1;for(let i=0;i<15;i++)enemies.push(createEnemy(["ice","fire","shield","jumper","iron"][i%5],i%5,{x:780+(i%3)*110}));simTime=3;render()')
 const preview=createCanvas(1280,720),ctx=preview.getContext('2d');ctx.fillStyle='#06030a';ctx.fillRect(0,0,1280,720);ctx.drawImage(h.canvas(),0,0);fs.writeFileSync(new URL('./artifacts/combat-preview.png',import.meta.url),preview.toBuffer('image/png'))
})
fs.writeFileSync(new URL('./artifacts/test-results.json',import.meta.url),JSON.stringify({passed:results.filter(r=>r.status==='pass').length,failed:results.filter(r=>r.status==='fail').length,tests:results},null,2))
if(results.some(r=>r.status==='fail'))process.exitCode=1
