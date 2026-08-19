(function(){
 const C=window.ChemCore=window.ChemCore||{},U=C.Utils;
 const W=1280,H=720,GROUND=620;
 class ChemCoreGame{
  constructor(canvas,mission,services={}){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.canvas.width=W;this.canvas.height=H;this.mission=mission;this.input=services.input;this.audio=services.audio;this.challengeUI=services.challengeUI;this.settings=services.save.data.settings;this.teacher=services.save.data.teacher;this.cb=services;this.running=false;this.paused=false;this.last=0;this.time=0;this.camera=0;this.shake=0;this.message='';this.messageTimer=0;this.metrics={attemptsUsed:0,hints:0,conceptErrors:0,accuracySum:0,challenges:0,deaths:0};this.modes=['electron','proton','thermal','neutralization','scanner'];this.mode=0;this.projectiles=[];this.particles=[];this.world=this.buildWorld();this.upgrades={shots:1,fireRate:1,projectileSpeed:1,damage:1,energyRegen:15,synergy:false};this.player={x:90,y:480,w:34,h:54,vx:0,vy:0,onGround:false,onWall:0,facing:1,health:100,energy:100,maxEnergy:100,shield:0,maxShield:0,shieldCooldown:0,dash:0,dashCooldown:0,charge:0,fireCooldown:0,jumpsRemaining:2,coyoteTime:0,invuln:0,checkpointX:90};this.startedAt=performance.now();this.loop=this.loop.bind(this);this.emitHUD()}
  buildWorld(){const platforms=[{x:0,y:GROUND,w:760,h:100},{x:880,y:GROUND,w:760,h:100},{x:1760,y:GROUND,w:720,h:100},{x:2600,y:GROUND,w:780,h:100},{x:3500,y:GROUND,w:720,h:100},{x:4340,y:GROUND,w:1300,h:100}],hazards=[],moving=[],enemies=[],terminals=[],gates=[],cores=[];const segments=this.mission.layout||[];for(let i=0;i<segments.length;i++){const base=i*560,type=segments[i];if(type==='vertical'){platforms.push({x:base+110,y:510,w:170,h:24},{x:base+330,y:410,w:180,h:24},{x:base+90,y:310,w:180,h:24})}else if(type==='gaps'){platforms.push({x:base+80,y:520,w:120,h:18},{x:base+285,y:460,w:130,h:18});hazards.push({x:base+200,y:GROUND-18,w:85,h:18,type:'acid'})}else if(type==='moving'){moving.push({x:base+120,y:480,w:150,h:20,baseX:base+120,range:230,speed:.9,phase:i});platforms.push({x:base+390,y:390,w:150,h:20})}else if(type==='hazards'){for(let j=0;j<4;j++)hazards.push({x:base+90+j*100,y:GROUND-22,w:54,h:22,type:i%2?'thermal':'acid'});platforms.push({x:base+60,y:470,w:430,h:18})}else if(type==='arena'||type==='boss'){platforms.push({x:base+100,y:470,w:160,h:20},{x:base+330,y:390,w:160,h:20});for(let j=0;j<3;j++)enemies.push(this.makeEnemy(base+170+j*130,GROUND-48,i+j))}else if(type==='lab'){platforms.push({x:base+80,y:500,w:170,h:18},{x:base+320,y:450,w:170,h:18})}}
   const tx=[1150,2750,4050];this.mission.challenges.forEach((ch,i)=>{terminals.push({x:tx[i],y:GROUND-78,w:46,h:78,index:i,solved:false,challenge:ch});const barrierScale=4,barrierW=26*barrierScale,barrierH=190*barrierScale;gates.push({x:tx[i]+230,y:GROUND-barrierH,w:barrierW,h:barrierH,index:i,open:false,scale:barrierScale});cores.push({x:tx[i]+130,y:GROUND-130,w:28,h:28,index:i,available:false,collected:false,name:this.mission.knowledgeCores[i]})});
   let boss=null;if(this.mission.boss){boss={x:4850,y:GROUND-118,w:120,h:118,health:100,maxHealth:100,phase:0,active:false,t:0,name:this.mission.boss.name,phases:this.mission.boss.phases,hitFlash:0};enemies=[]}
   return{width:5600,platforms,hazards,moving,enemies,terminals,gates,cores,boss,exit:{x:5420,y:GROUND-120,w:70,h:120},checkpoint:[1820,3550]}}
  makeEnemy(x,y,n){return{x,y,w:38,h:48,vx:n%2?70:-70,health:3,phase:n,kind:n%3,dead:false,shoot:1+n*.2}}
  start(){if(this.running)return;this.running=true;this.last=performance.now();this.audio?.startMusic(this.mission.year);this.showMessage('Dr. Lira: estabilize os três terminais. A química controla a rota.',4);requestAnimationFrame(this.loop)}
  stop(){this.running=false;this.audio?.stopMusic()}
  setPaused(v){this.paused=v;this.cb.onPauseChange?.(v)}
  loop(now){if(!this.running)return;const dt=Math.min(.033,(now-this.last)/1000||0);this.last=now;if(!this.paused){this.update(dt);this.draw()}this.input.endFrame();requestAnimationFrame(this.loop)}
  update(dt){this.input.update?.();this.time+=dt;if(this.messageTimer>0)this.messageTimer-=dt;this.updateMode();this.updateMoving(dt);this.updatePlayer(dt);this.updateEnemies(dt);this.updateProjectiles(dt);this.updateParticles(dt);this.updateBoss(dt);this.checkInteractions();this.camera=U.lerp(this.camera,U.clamp(this.player.x-W*.38,0,this.world.width-W),.11);if(this.shake>0)this.shake=Math.max(0,this.shake-dt*18);this.emitHUD()}
  updateMode(){if(this.input.just('modeCycle')){this.mode=(this.mode+1)%this.modes.length;this.audio?.sfx('terminal');this.showMessage(`Modulador: ${U.modeLabel[this.modes[this.mode]]}`,1.2)}for(let i=0;i<5;i++)if(this.input.just(`mode${i+1}`)){this.mode=i;this.audio?.sfx('terminal');this.showMessage(`Modulador: ${U.modeLabel[this.modes[i]]}`,1.2)}if(this.input.just('pause'))this.cb.onPause?.()}
  updateMoving(dt){for(const p of this.world.moving){const old=p.x;p.x=p.baseX+(Math.sin(this.time*p.speed+p.phase)+1)*.5*p.range;p.dx=p.x-old}}
  updatePlayer(dt){const p=this.player,s=this.settings;const accel=p.onGround?2400:1500,max=330,friction=p.onGround?.78:.94;const left=this.input.action('left'),right=this.input.action('right');if(p.onGround){p.jumpsRemaining=2;p.coyoteTime=.1}else p.coyoteTime=Math.max(0,p.coyoteTime-dt);if(left){p.vx-=accel*dt;p.facing=-1}if(right){p.vx+=accel*dt;p.facing=1}if(!left&&!right)p.vx*=Math.pow(friction,dt*60);p.vx=U.clamp(p.vx,-max,max);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.fireCooldown=Math.max(0,p.fireCooldown-dt);p.invuln=Math.max(0,p.invuln-dt);p.shieldCooldown=Math.max(0,p.shieldCooldown-dt);if(p.maxShield>0&&p.shield<p.maxShield&&p.shieldCooldown<=0)p.shield=Math.min(p.maxShield,p.shield+9*dt);if(this.input.just('dash')&&p.dashCooldown<=0&&p.energy>=18){p.dash=.17;p.dashCooldown=.6;p.energy-=18;p.vx=p.facing*780;p.vy*=.25;this.audio?.sfx('dash');this.burst(p.x+p.w/2,p.y+p.h/2,U.modeColor.catalyst,16)}if(p.dash>0){p.dash-=dt;p.vx=p.facing*760}else p.vy+=1850*dt;if(this.input.just('jump')){if(p.onWall&&!p.onGround){p.vy=-610;p.vx=-p.onWall*480;p.facing=-p.onWall;p.onWall=0;p.jumpsRemaining=Math.max(1,p.jumpsRemaining);this.audio?.sfx('jump');this.burst(p.x+p.w/2,p.y+p.h,U.modeColor.catalyst,8)}else if(p.onGround||p.coyoteTime>0){p.vy=-640;p.onGround=false;p.coyoteTime=0;p.jumpsRemaining=1;this.audio?.sfx('jump')}else if(p.jumpsRemaining>0){p.vy=-590;p.jumpsRemaining--;this.audio?.sfx('jump');this.burst(p.x+p.w/2,p.y+p.h/2,U.modeColor[this.modes[this.mode]],14);this.showMessage('Propulsor iônico: segundo salto.',.8)}}if(this.input.just('fire')){p.charge=0;this.fire(.12)}if(this.input.action('fire'))p.charge=Math.min(1.5,p.charge+dt);if(this.input.releasedAction('fire')){if(p.charge>.38)this.fire(p.charge);p.charge=0}p.energy=Math.min(p.maxEnergy,p.energy+this.upgrades.energyRegen*dt);this.moveEntity(p,p.vx*dt,p.vy*dt);if(p.onGround){p.jumpsRemaining=2;p.coyoteTime=.1}if(p.y>H+220)this.damage(100);for(const h of this.world.hazards)if(!h.disabled&&U.rects(p,h))this.damage(h.type==='thermal'?18:12);for(const cp of this.world.checkpoint)if(p.x>cp&&p.checkpointX<cp){p.checkpointX=cp;this.showMessage('Checkpoint científico sincronizado.',2);this.audio?.sfx('core')}}
  moveEntity(e,dx,dy){
   e.x+=dx;
   e.onWall=0;
   const surfaces=[...this.world.platforms,...this.world.moving];
   const barriers=this.world.gates.filter(g=>!g.open);
   const solids=[...surfaces,...barriers];
   for(const r of solids)if(U.rects(e,r)){
    const isBarrier=barriers.includes(r);
    if(dx>0){e.x=r.x-e.w;if(!isBarrier)e.onWall=1}
    else if(dx<0){e.x=r.x+r.w;if(!isBarrier)e.onWall=-1}
    e.vx=0
   }
   e.y+=dy;
   e.onGround=false;
   for(const r of solids)if(U.rects(e,r)){
    const isBarrier=barriers.includes(r);
    if(dy>0){e.y=r.y-e.h;e.vy=0;if(!isBarrier){e.onGround=true;if(r.dx)e.x+=r.dx}}
    else if(dy<0){e.y=r.y+r.h;e.vy=0}
   }
  }
  fire(charge){const p=this.player;if(p.fireCooldown>0||p.energy<5)return false;const basePower=charge>.55?2:1,cost=basePower===2?14:5;if(p.energy<cost)return false;p.fireCooldown=(basePower===2?.18:.1)/this.upgrades.fireRate;p.energy-=cost;const mode=this.modes[this.mode],size=basePower===2?22:12,shots=this.upgrades.shots,center=(shots-1)/2;for(let i=0;i<shots;i++){const lane=i-center,vy=lane*(basePower===2?48:64),y=p.y+20+lane*(basePower===2?8:7);this.projectiles.push({x:p.facing>0?p.x+p.w+8:p.x-size-8,y,w:size,h:basePower===2?12:8,vx:p.facing*(basePower===2?820:700)*this.upgrades.projectileSpeed,vy,life:1.65,mode,power:basePower*this.upgrades.damage*(shots>1?.82:1),enemy:false,trail:0})}this.audio?.sfx('fire');this.burst(p.x+p.w/2+p.facing*24,p.y+24,U.modeColor[mode],basePower===2?12+shots*2:7+shots*2);return true}
  applyCoreUpgrade(core){const p=this.player;let title='',description='';if(core.index===0){this.upgrades.shots=Math.max(this.upgrades.shots,2);title='Divisor de Feixe';description='cada disparo agora libera dois pulsos de matéria.'}else if(core.index===1){this.upgrades.fireRate=Math.max(this.upgrades.fireRate,1.65);title='Câmara de Ciclagem';description='a cadência do Modulador aumentou em 65%.'}else{p.maxShield=Math.max(p.maxShield,45);p.shield=p.maxShield;p.shieldCooldown=0;title='Escudo Molecular';description='45 pontos de escudo absorvem dano e se regeneram fora de perigo.'}if(this.world.cores.every(c=>c.collected)&&!this.upgrades.synergy){this.upgrades.synergy=true;this.upgrades.shots=3;this.upgrades.projectileSpeed=1.18;this.upgrades.damage=1.2;this.upgrades.energyRegen=22;p.maxEnergy=125;p.energy=125;description+=' Sinergia completa: feixe triplo, +25 de energia, recarga acelerada e maior potência.'}this.showMessage(`UPGRADE // ${title}: ${description}`,4.5);this.cb.onUpgrade?.({title,description,index:core.index,synergy:this.upgrades.synergy});this.shake=this.settings.shake?6:0}

  updateEnemies(dt){for(const e of this.world.enemies){if(e.dead)continue;e.x+=e.vx*dt;if(e.x<100||e.x>this.world.width-100)e.vx*=-1;const floor=this.world.platforms.find(r=>e.x+e.w/2>r.x&&e.x+e.w/2<r.x+r.w&&Math.abs(e.y+e.h-r.y)<90);if(floor)e.y=floor.y-e.h;else e.vx*=-1;e.shoot-=dt;if(e.shoot<=0&&Math.abs(e.x-this.player.x)<620){e.shoot=1.8+Math.random();const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy)||1;this.projectiles.push({x:e.x,y:e.y+15,w:10,h:10,vx:dx/d*280,vy:dy/d*280,life:3,enemy:true,mode:'enemy',power:1})}if(U.rects(this.player,e))this.damage(12)}}
  updateProjectiles(dt){for(const b of this.projectiles){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(!b.enemy){b.trail=(b.trail||0)+dt;if(b.trail>.035){b.trail=0;this.particles.push({x:b.x+b.w/2,y:b.y+b.h/2,vx:-b.vx*.08,vy:(Math.random()-.5)*35,life:.18,color:U.modeColor[b.mode],size:Math.max(2,b.h*.45)})}}if(b.enemy&&U.rects(b,this.player)){this.damage(10);b.life=0}if(!b.enemy){for(const e of this.world.enemies)if(!e.dead&&U.rects(b,e)){if(b.mode==='scanner'){this.showMessage(this.mission.year===1?'Scanner: instabilidade iônica · carga localizada · interação eletrostática.':this.mission.year===2?'Scanner: sistema reacional · energia e velocidade devem ser analisadas separadamente.':'Scanner: matriz carbonada · identifique função, oxidação e risco antes de agir.',3);b.life=0;continue}e.health-=b.power;b.life=0;this.burst(b.x,b.y,U.modeColor[b.mode],8);if(e.health<=0){e.dead=true;this.audio?.sfx('hit')}}const boss=this.world.boss;if(boss?.active&&U.rects(b,boss)){this.hitBoss(b.mode,b.power);b.life=0}}for(const h of this.world.hazards)if(!h.disabled&&U.rects(b,h)&&b.mode==='neutralization'){h.disabled=true;b.life=0;this.showMessage('Campo controlado: risco ácido-base reduzido. Neutralização real ainda exige concentração, calor e segurança.',3);this.audio?.sfx('success')}for(const r of [...this.world.platforms,...this.world.moving,...this.world.gates.filter(g=>!g.open)])if(U.rects(b,r))b.life=0}this.projectiles=this.projectiles.filter(b=>b.life>0&&b.x>-100&&b.x<this.world.width+100)}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;p.life-=dt}this.particles=this.particles.filter(p=>p.life>0)}
  updateBoss(dt){const b=this.world.boss;if(!b)return;if(!b.active&&this.world.terminals.every(t=>t.solved)&&this.player.x>4400){b.active=true;this.audio?.sfx('boss');this.showMessage(`${b.name}: fase ${b.phases[0].name}. Leia a evidência no HUD.`,4)}if(!b.active)return;b.t+=dt;b.hitFlash=Math.max(0,b.hitFlash-dt);b.y=GROUND-b.h+Math.sin(this.time*2)*18;if(b.t>1.3){b.t=0;for(let i=-1;i<=1;i++){const dx=this.player.x-b.x,dy=this.player.y-b.y,d=Math.hypot(dx,dy)||1;this.projectiles.push({x:b.x,y:b.y+45,w:14,h:14,vx:dx/d*310+i*45,vy:dy/d*310,life:4,enemy:true,mode:'enemy',power:1})}}if(U.rects(this.player,b)){if(b.phases[b.phase].mode==='catalyst'&&this.player.dash>0)this.hitBoss('catalyst',3);else this.damage(18)}}
  hitBoss(mode,power){const b=this.world.boss,phase=b.phases[b.phase];if(mode!==phase.mode){this.showMessage(`Blindagem incompatível. Evidência: ${phase.evidence}`,2);this.audio?.sfx('error');return}b.health-=power*7;b.hitFlash=.15;this.shake=this.settings.shake?5:0;this.audio?.sfx('hit');if(b.health<=Math.max(0,b.maxHealth-(b.phase+1)*(b.maxHealth/b.phases.length))&&b.phase<b.phases.length-1){b.phase++;this.showMessage(`Mudança de fase: ${b.phases[b.phase].name}. ${b.phases[b.phase].evidence}`,4)}if(b.health<=0){b.health=0;b.active=false;this.burst(b.x+b.w/2,b.y+b.h/2,this.mission.theme.accent,60);this.showMessage('Núcleo do setor estabilizado. Rota final liberada.',4);this.audio?.sfx('success')}}
  checkInteractions(){const p=this.player;for(const t of this.world.terminals){if(!t.solved&&U.distance({x:p.x,y:p.y},{x:t.x,y:t.y})<100){this.prompt=`E — ${t.challenge.title}`;if(this.input.just('interact'))this.openTerminal(t)}}for(const c of this.world.cores)if(c.available&&!c.collected&&U.rects(p,c)){c.collected=true;this.audio?.sfx('core');this.burst(c.x,c.y,this.mission.theme.accent,34);this.applyCoreUpgrade(c)}const exit=this.world.exit;const bossDone=!this.world.boss||this.world.boss.health<=0;if(U.rects(p,exit)&&this.world.terminals.every(t=>t.solved)&&bossDone)this.complete();this.prompt=this.prompt||''}
  openTerminal(t){this.paused=true;this.audio?.sfx('terminal');this.challengeUI.open(t.challenge,{accent:this.mission.theme.accent,projectMode:this.teacher.sessionMode==='project',guided:this.teacher.guided,onSuccess:metrics=>{t.solved=true;this.world.gates[t.index].open=true;this.world.cores[t.index].available=true;this.metrics.attemptsUsed+=metrics.attempts;this.metrics.hints+=metrics.hints;this.metrics.conceptErrors+=metrics.errors;this.metrics.accuracySum+=metrics.accuracy;this.metrics.challenges++;this.paused=false;this.showMessage('Sistema validado. A porta científica foi liberada.',2.5)},onClose:metrics=>{this.metrics.attemptsUsed+=metrics?.attempts||0;this.metrics.hints+=metrics?.hints||0;this.metrics.conceptErrors+=metrics?.errors||0;this.paused=false}})}
  damage(amount){const p=this.player;if(p.invuln>0)return;if(p.shield>0){const absorbed=Math.min(p.shield,amount);p.shield-=absorbed;amount-=absorbed;p.shieldCooldown=5;this.burst(p.x+p.w/2,p.y+p.h/2,'#7cf7ff',12);this.showMessage(p.shield>0?`Escudo Molecular absorveu ${Math.round(absorbed)} de dano.`:'Escudo Molecular esgotado. Recarga em 5 s.',1.25);if(amount<=0){p.invuln=.28;this.shake=this.settings.shake?4:0;this.audio?.sfx('hit');return}}p.health-=amount;p.invuln=1;this.shake=this.settings.shake?8:0;this.audio?.sfx('hit');if(p.health<=0){this.metrics.deaths++;p.health=100;p.energy=p.maxEnergy;p.shield=p.maxShield;p.shieldCooldown=0;p.x=p.checkpointX;p.y=450;p.vx=p.vy=0;p.jumpsRemaining=2;p.coyoteTime=0;p.charge=0;p.fireCooldown=0;this.showMessage('Integridade restaurada no checkpoint. Revise a rota e tente novamente.',3)}}

  complete(){if(this.completed)return;this.completed=true;this.stop();const cores=this.world.cores.filter(c=>c.collected).length,accuracy=this.metrics.challenges?this.metrics.accuracySum/this.metrics.challenges:1,time=this.time;let score=1000-((time/60)*55)-this.metrics.conceptErrors*80-this.metrics.hints*45-this.metrics.deaths*70+cores*160;const rank=score>1220?'S':score>980?'A':score>760?'B':score>520?'C':'D';this.cb.onComplete?.({rank,time,cores,attemptsUsed:this.metrics.attemptsUsed,hints:this.metrics.hints,conceptErrors:this.metrics.conceptErrors,accuracy,researchPoints:Math.max(50,Math.round(score/4)),deaths:this.metrics.deaths})}
  showMessage(text,seconds=2){this.message=text;this.messageTimer=seconds;this.cb.onMessage?.(text,seconds)}
  burst(x,y,color,n){if(this.settings.simplifiedEffects)n=Math.min(n,6);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=60+Math.random()*220;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.5,color,size:2+Math.random()*5})}}
  emitHUD(){const b=this.world.boss;this.cb.onHUD?.({health:this.player.health,energy:this.player.energy/this.player.maxEnergy*100,energyValue:this.player.energy,maxEnergy:this.player.maxEnergy,shield:this.player.maxShield?this.player.shield/this.player.maxShield*100:0,shieldValue:this.player.shield,maxShield:this.player.maxShield,upgrades:this.upgrades,mode:this.modes[this.mode],objective:this.world.terminals.every(t=>t.solved)?(b&&b.health>0?'Estabilize o chefe usando a fase correta':'Alcance a saída do setor'):'Valide os três terminais científicos',cores:this.world.cores.filter(c=>c.collected).length,solved:this.world.terminals.filter(t=>t.solved).length,time:this.time,prompt:this.prompt||'',boss:b&&b.active?{name:b.name,health:b.health,phase:b.phases[b.phase]}:null,message:this.messageTimer>0?this.message:''});this.prompt=''}
  draw(){const g=this.ctx,off=this.settings.shake&&this.shake?{x:(Math.random()-.5)*this.shake,y:(Math.random()-.5)*this.shake}:{x:0,y:0};g.save();g.translate(off.x,off.y);this.drawBackground(g);g.save();g.translate(-this.camera,0);this.drawWorld(g);g.restore();g.restore()}
  drawBackground(g){const t=this.mission.theme;const grad=g.createLinearGradient(0,0,0,H);grad.addColorStop(0,t.bg);grad.addColorStop(1,'#02060b');g.fillStyle=grad;g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,255,255,.035)';for(let x=-(this.camera*.15)%64;x<W;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke()}for(let y=40;y<H;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}for(let i=0;i<20;i++){const x=(i*197-this.camera*.25)%1500,y=80+(i*71)%430;g.fillStyle=i%3?`${t.accent}33`:`${t.secondary}26`;g.fillRect(x,y,2+(i%4),2+(i%4))}g.fillStyle='rgba(255,255,255,.04)';g.font='1000 120px system-ui';g.fillText(t.symbol,880,170)}
  drawWorld(g){const t=this.mission.theme;for(const r of this.world.platforms){g.fillStyle='#0b1c2b';g.fillRect(r.x,r.y,r.w,r.h);g.fillStyle=t.accent;g.globalAlpha=.5;g.fillRect(r.x,r.y,r.w,3);g.globalAlpha=1}for(const r of this.world.moving){g.fillStyle='#142c3c';g.fillRect(r.x,r.y,r.w,r.h);g.fillStyle=t.secondary;g.fillRect(r.x,r.y,r.w,3)}for(const h of this.world.hazards){if(h.disabled)continue;g.fillStyle=h.type==='thermal'?'#ff6b35':'#b7ff39';for(let x=h.x;x<h.x+h.w;x+=18){g.beginPath();g.moveTo(x,h.y+h.h);g.lineTo(x+9,h.y);g.lineTo(x+18,h.y+h.h);g.fill()}}for(const gate of this.world.gates){if(gate.open)continue;const visibleTop=Math.max(0,gate.y);g.fillStyle='rgba(39,228,255,.13)';g.fillRect(gate.x,gate.y,gate.w,gate.h);g.fillStyle='rgba(255,255,255,.035)';g.fillRect(gate.x+12,gate.y,gate.w-24,gate.h);g.strokeStyle=t.accent;g.lineWidth=4;g.strokeRect(gate.x,gate.y,gate.w,gate.h);g.strokeStyle=t.secondary;g.lineWidth=2;g.strokeRect(gate.x+14,gate.y+14,gate.w-28,gate.h-28);for(let y=gate.y;y<gate.y+gate.h;y+=34){g.beginPath();g.moveTo(gate.x,y);g.lineTo(gate.x+gate.w,y+24);g.stroke()}g.fillStyle=t.accent;g.font='1000 13px ui-monospace';g.save();g.translate(gate.x+gate.w/2,visibleTop+210);g.rotate(-Math.PI/2);g.textAlign='center';g.fillText(`BARREIRA QUÍMICA ×${gate.scale||1}`,0,0);g.restore()}for(const terminal of this.world.terminals)this.drawTerminal(g,terminal);for(const core of this.world.cores)if(core.available&&!core.collected)this.drawCore(g,core);for(const e of this.world.enemies)if(!e.dead)this.drawEnemy(g,e);const b=this.world.boss;if(b&&b.health>0)this.drawBoss(g,b);this.drawExit(g);for(const b of this.projectiles){g.fillStyle=b.enemy?'#ff4568':U.modeColor[b.mode];g.shadowBlur=14;g.shadowColor=g.fillStyle;g.fillRect(b.x,b.y,b.w,b.h);g.shadowBlur=0}for(const p of this.particles){g.globalAlpha=U.clamp(p.life*2,0,1);g.fillStyle=p.color;g.fillRect(p.x,p.y,p.size,p.size)}g.globalAlpha=1;this.drawPlayer(g)}
  drawTerminal(g,t){const col=t.solved?'#b7ff39':this.mission.theme.accent;g.fillStyle='#0c1b29';g.fillRect(t.x,t.y,t.w,t.h);g.strokeStyle=col;g.lineWidth=2;g.strokeRect(t.x,t.y,t.w,t.h);g.fillStyle=col;g.fillRect(t.x+8,t.y+12,t.w-16,24);g.fillStyle='#fff';g.font='900 12px ui-monospace';g.fillText(t.solved?'OK':`T${t.index+1}`,t.x+13,t.y+29)}
  drawCore(g,c){g.save();g.translate(c.x+c.w/2,c.y+c.h/2);g.rotate(this.time);g.fillStyle=this.mission.theme.accent;g.shadowBlur=20;g.shadowColor=g.fillStyle;g.fillRect(-12,-12,24,24);g.fillStyle='#fff';g.fillRect(-4,-4,8,8);g.restore()}
  drawEnemy(g,e){
   const dir=e.vx>=0?1:-1,kind=(e.kind??e.phase??0)%3,bob=Math.sin(this.time*5+e.phase)*2;
   g.save();
   g.translate(e.x+e.w/2,e.y+e.h/2+bob);
   if(dir<0)g.scale(-1,1);
   g.shadowBlur=12;
   if(kind===0){
    g.shadowColor='#6ce7ff';
    g.fillStyle='#0d1f2d';
    g.beginPath();
    g.moveTo(0,-24);g.lineTo(18,-4);g.lineTo(10,22);g.lineTo(-10,22);g.lineTo(-18,-4);g.closePath();
    g.fill();
    g.strokeStyle='#63f0ff';g.lineWidth=2;g.stroke();
    g.fillStyle='#63f0ff';
    g.fillRect(-12,-2,24,4);
    g.fillRect(-4,-18,8,8);
    g.fillStyle='#ffffff';
    g.fillRect(6,-14,4,4);
    g.fillStyle='rgba(99,240,255,.24)';
    g.beginPath();g.moveTo(-22,-4);g.lineTo(-12,-12);g.lineTo(-10,8);g.closePath();g.fill();
    g.beginPath();g.moveTo(22,-4);g.lineTo(12,-12);g.lineTo(10,8);g.closePath();g.fill();
   }else if(kind===1){
    g.shadowColor='#ff7f4d';
    g.fillStyle='#151f30';
    g.fillRect(-14,-18,28,28);
    g.strokeStyle='#ff9f45';g.lineWidth=2;g.strokeRect(-14,-18,28,28);
    g.fillStyle='#ff9f45';
    g.beginPath();g.moveTo(14,-10);g.lineTo(27,-4);g.lineTo(14,4);g.closePath();g.fill();
    g.fillRect(-18,-10,5,18);
    g.fillRect(5,-22,7,7);
    g.fillRect(-10,12,6,12);
    g.fillRect(4,12,6,12);
    g.fillStyle='#fff5d9';
    g.fillRect(2,-8,8,5);
    g.fillStyle='rgba(255,159,69,.22)';
    g.fillRect(-10,-10,9,18);
   }else{
    g.shadowColor='#ff58bf';
    g.fillStyle='#101a2b';
    g.beginPath();
    g.roundRect(-15,-18,30,34,8);
    g.fill();
    g.strokeStyle='#ff58bf';g.lineWidth=2;g.stroke();
    g.fillStyle='#ff58bf';
    g.fillRect(-13,-7,26,4);
    g.fillRect(-5,-18,10,8);
    g.fillRect(-18,-4,6,18);
    g.fillRect(12,-4,6,18);
    g.fillRect(-8,16,6,8);
    g.fillRect(2,16,6,8);
    g.fillStyle='#fff';
    g.fillRect(5,-6,5,4);
    g.fillStyle='rgba(255,88,191,.18)';
    g.beginPath();g.arc(0,-1,18,0,Math.PI*2);g.fill();
   }
   g.shadowBlur=0;
   if(this.settings.highContrast){
    g.strokeStyle='#ffffff';g.lineWidth=1.5;g.strokeRect(-18,-24,36,48);
   }
   g.restore()
  }
  drawBoss(g,b){g.save();g.translate(b.x,b.y);g.fillStyle=b.hitFlash?'#fff':'#250f2a';g.strokeStyle=this.mission.theme.secondary;g.lineWidth=4;g.fillRect(0,0,b.w,b.h);g.strokeRect(0,0,b.w,b.h);g.fillStyle=this.mission.theme.secondary;for(let i=0;i<4;i++)g.fillRect(12+i*27,18+(i%2)*28,16,16);g.fillStyle='#fff';g.font='900 13px ui-monospace';g.fillText(b.name.slice(0,14),8,b.h-12);g.restore()}
  drawExit(g){const e=this.world.exit,ready=this.world.terminals.every(t=>t.solved)&&(!this.world.boss||this.world.boss.health<=0);g.fillStyle=ready?'rgba(183,255,57,.2)':'rgba(255,69,104,.08)';g.fillRect(e.x,e.y,e.w,e.h);g.strokeStyle=ready?'#b7ff39':'#ff4568';g.lineWidth=3;g.strokeRect(e.x,e.y,e.w,e.h);g.fillStyle=g.strokeStyle;g.font='900 12px ui-monospace';g.fillText(ready?'SAÍDA':'BLOQUEADA',e.x+5,e.y+20)}
  drawPlayer(g){
   const p=this.player,blink=p.invuln>0&&Math.floor(this.time*18)%2,modeColor=U.modeColor[this.modes[this.mode]],accent=this.mission.theme.accent,idle=Math.sin(this.time*8)*1.4;
   if(blink)return;
   g.save();
   g.translate(p.x+p.w/2,p.y+p.h/2+idle);
   if(p.facing<0)g.scale(-1,1);
   if(p.dash>0){
    for(let i=0;i<3;i++){
     g.globalAlpha=.12-(i*.03);
     g.fillStyle=accent;
     g.beginPath();
     g.roundRect(-18-(i*18),-27,34,54,10);
     g.fill();
    }
    g.globalAlpha=1;
   }
   g.shadowBlur=14;
   g.shadowColor=accent;
   g.fillStyle='#081522';
   g.beginPath();
   g.roundRect(-14,-25,28,52,10);
   g.fill();
   g.strokeStyle=accent;
   g.lineWidth=2;
   g.stroke();
   g.fillStyle='#0e2a3c';
   g.beginPath();g.roundRect(-16,-13,32,22,8);g.fill();
   g.fillStyle='#0a1f30';
   g.beginPath();g.roundRect(-11,-32,22,18,8);g.fill();
   g.strokeStyle=accent;g.stroke();
   g.fillStyle=modeColor;
   g.beginPath();g.roundRect(-7,-27,14,7,4);g.fill();
   g.fillStyle='#dff9ff';
   g.fillRect(2,-25,3,3);
   g.fillStyle='#0d2234';
   g.beginPath();g.roundRect(-20,-11,8,19,4);g.fill();
   g.beginPath();g.roundRect(12,-11,8,15,4);g.fill();
   g.beginPath();g.roundRect(-11,24,8,12,4);g.fill();
   g.beginPath();g.roundRect(3,24,8,12,4);g.fill();
   g.fillStyle=accent;
   g.fillRect(-17,-8,2,12);
   g.fillRect(14,-8,2,8);
   g.fillRect(-8,28,4,4);
   g.fillRect(4,28,4,4);
   g.fillStyle=modeColor;
   g.beginPath();g.arc(0,-2,6,0,Math.PI*2);g.fill();
   g.strokeStyle='#ffffff';g.globalAlpha=.6;g.beginPath();g.arc(0,-2,10,0,Math.PI*2);g.stroke();g.globalAlpha=1;
   g.fillStyle='#12324a';
   g.beginPath();g.roundRect(12,-4,15,10,5);g.fill();
   g.fillStyle=modeColor;
   g.fillRect(18,-1,12,4);
   g.fillStyle='#ffffff';
   g.fillRect(24,-1,4,4);
   if(p.shield>0){
    g.strokeStyle='#7cf7ff';
    g.globalAlpha=.28+.22*Math.sin(this.time*8);
    g.lineWidth=2.5;
    for(let i=0;i<6;i++){
     const a=i*Math.PI/3+this.time*.8;
     g.beginPath();
     g.moveTo(Math.cos(a)*18,Math.sin(a)*26);
     g.lineTo(Math.cos(a+.35)*24,Math.sin(a+.35)*32);
     g.lineTo(Math.cos(a+.7)*18,Math.sin(a+.7)*26);
     g.stroke();
    }
    g.beginPath();g.ellipse(0,0,26,35,0,0,Math.PI*2);g.stroke();
    g.globalAlpha=1;
   }
   if(this.settings.highContrast){
    g.strokeStyle='#fff';g.lineWidth=1.5;g.strokeRect(-18,-34,48,70);
   }
   g.shadowBlur=0;
   g.restore()
  }
 }
 C.ChemCoreGame=ChemCoreGame;
})();
