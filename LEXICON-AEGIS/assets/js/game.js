(function () {
  'use strict';

  const W = 1280, H = 720;
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const rects = (a,b)=>a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  const rand = (min,max)=>min+Math.random()*(max-min);
  const INPUT_ALIASES = Object.freeze({
    left: ['ArrowLeft','KeyA'],
    right: ['ArrowRight','KeyD'],
    jump: ['Space','ArrowUp','KeyW'],
    dash: ['ShiftLeft','ShiftRight','KeyK'],
    fire: ['KeyJ','KeyX'],
    interact: ['KeyE','ArrowDown','KeyS'],
    pause: ['Escape','KeyP']
  });

  class LexiconGame {
    constructor(canvas, hooks = {}) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.hooks = hooks;
      canvas.width=W; canvas.height=H; this.running=false; this.raf=0; this.last=0; this.player=null;
      this.keys=new Set(); this.pressed=new Set(); this.touch={};
      this.pointer={down:false,active:false,canvasX:0,canvasY:0,worldX:0,worldY:0,aimX:1,aimY:0};
      this.boundKeyDown=e=>this.onKeyDown(e); this.boundKeyUp=e=>this.onKeyUp(e);
      this.boundMouseDown=e=>this.onMouseDown(e); this.boundMouseMove=e=>this.onMouseMove(e); this.boundMouseUp=e=>this.onMouseUp(e);
      this.boundBlur=()=>this.clearInput(); this.boundVisibility=()=>{if(document.hidden)this.clearInput();};
      window.addEventListener('keydown',this.boundKeyDown); window.addEventListener('keyup',this.boundKeyUp);
      window.addEventListener('blur',this.boundBlur); document.addEventListener('visibilitychange',this.boundVisibility);
      canvas.addEventListener('mousedown',this.boundMouseDown); window.addEventListener('mousemove',this.boundMouseMove); window.addEventListener('mouseup',this.boundMouseUp);
      this.loop=this.loop.bind(this);
    }
    destroy(){ this.running=false; this.clearInput(); cancelAnimationFrame(this.raf); window.removeEventListener('keydown',this.boundKeyDown); window.removeEventListener('keyup',this.boundKeyUp); window.removeEventListener('blur',this.boundBlur); document.removeEventListener('visibilitychange',this.boundVisibility); this.canvas.removeEventListener('mousedown',this.boundMouseDown); window.removeEventListener('mousemove',this.boundMouseMove); window.removeEventListener('mouseup',this.boundMouseUp); }
    key(action){ return window.LexiconStorage.state.settings.keymap?.[action] || INPUT_ALIASES[action]?.[0] || ''; }
    actionCodes(action){ return [...new Set([this.key(action),...(INPUT_ALIASES[action]||[])].filter(Boolean))]; }
    matches(action,code){ return this.actionCodes(action).includes(code); }
    clearInput(){ this.keys.clear(); this.pressed.clear(); this.touch={}; this.pointer.down=false; this.pointer.active=false; this.cancelCharge(); }
    onKeyDown(e){
      const gameplayCode=Object.keys(INPUT_ALIASES).some(action=>this.matches(action,e.code));
      if(gameplayCode && this.hooks.isGameVisible?.()) e.preventDefault();
      if(!this.keys.has(e.code)) this.pressed.add(e.code); this.keys.add(e.code);
      if(this.matches('pause',e.code) && this.running && !window.LexiconEducation.challengeOpen){ this.mode==='paused'?this.resume():this.pause(); }
    }
    onKeyUp(e){
      if(Object.keys(INPUT_ALIASES).some(action=>this.matches(action,e.code)) && this.hooks.isGameVisible?.()) e.preventDefault();
      this.keys.delete(e.code); if(this.matches('fire',e.code)) this.releaseCharge();
    }
    updatePointer(e){
      const rect=this.canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      this.pointer.canvasX=(e.clientX-rect.left)*(W/rect.width);
      this.pointer.canvasY=(e.clientY-rect.top)*(H/rect.height);
      this.pointer.worldX=this.pointer.canvasX+this.cameraX;
      this.pointer.worldY=this.pointer.canvasY;
      const p=this.player;
      if(!p)return;
      const ox=p.x+p.w/2,oy=p.y+21;
      const dx=this.pointer.worldX-ox,dy=this.pointer.worldY-oy,len=Math.hypot(dx,dy)||1;
      this.pointer.aimX=dx/len;this.pointer.aimY=dy/len;
      if(Math.abs(this.pointer.aimX)>.05)p.facing=this.pointer.aimX>=0?1:-1;
    }
    onMouseDown(e){ if(e.button===0){ this.updatePointer(e); this.pointer.down=true; this.pointer.active=true; this.startCharge(); this.canvas.focus(); } }
    onMouseMove(e){ if(this.pointer.down||this.pointer.active)this.updatePointer(e); }
    onMouseUp(e){ if(e.button===0){ this.updatePointer(e); this.pointer.down=false; this.releaseCharge(); } }
    setTouch(action,active){ this.touch[action]=active; if(active&&['jump','dash','interact'].includes(action)) this.touch[action+'Pressed']=true; if(action==='fire'){ if(active)this.startCharge(); else this.releaseCharge(); } }
    input(action){ return this.actionCodes(action).some(code=>this.keys.has(code)) || !!this.touch[action]; }
    just(action){ for(const code of this.actionCodes(action)){ if(this.pressed.has(code)){ this.pressed.delete(code); return true; } } return false; }

    start(config){
      this.clearInput();
      this.config=Object.assign({year:6,missionIndex:0,mode:'campaign',combat:true,bosses:true},config);
      this.year=window.LexiconCurriculum.getYear(this.config.year);
      this.mission=this.year.missions[this.config.missionIndex] || this.year.missions[0];
      this.palette=this.year.colors; this.mode='intro'; this.introTime=2.8; this.time=0; this.cameraX=0; this.shake=0;
      this.score=0; this.combo=0; this.comboLabel='WORD SYNC'; this.correctCount=0; this.wrongCount=0; this.hints=0;
      this.lives=3; this.health=100; this.shield=0; this.cores=0; this.checkpoint={x:120,y:540}; this.missionEnded=false;
      // Every mission starts with a true double jump. Correct learning challenges then evolve the build.
      this.upgrades={speed:0,air:0,multishot:0,dash:0,jump:0,charge:0}; this.upgradeCursor=0;
      this.usedQuestionIds=new Set();
      this.player={x:120,y:500,w:34,h:50,vx:0,vy:0,facing:1,onGround:false,onWall:0,airJumps:1,maxAirJumps:1,dashTime:0,dashCooldown:0,invuln:0,charge:0,charging:false,trail:[]};
      this.bullets=[]; this.enemyBullets=[]; this.particles=[]; this.floaters=[];
      this.generateLevel(); this.running=true; this.last=performance.now(); cancelAnimationFrame(this.raf); this.raf=requestAnimationFrame(this.loop);
      window.LexiconAudio.ensure(); window.LexiconAudio.startMusic(); this.hooks.onState?.('playing'); this.updateHUD();
    }
    restart(){ if(this.config) this.start(this.config); }
    abort(){ this.running=false; this.clearInput(); cancelAnimationFrame(this.raf); window.LexiconAudio.stopMusic(); this.hooks.onAbort?.(); }
    pause(){ if(!this.running||['challenge','paused','victory','gameover'].includes(this.mode))return; this.clearInput(); this.previousMode=this.mode; this.mode='paused'; this.hooks.onState?.('paused'); }
    resume(){ if(this.mode!=='paused')return; this.mode=this.previousMode||'playing'; this.last=performance.now(); this.hooks.onState?.('playing'); }

    generateLevel(){
      const i=this.config.missionIndex; this.worldWidth=5200;
      this.platforms=[
        {x:0,y:630,w:760,h:90},{x:840,y:630,w:620,h:90},{x:1530,y:630,w:780,h:90},{x:2390,y:630,w:700,h:90},
        {x:3180,y:630,w:720,h:90},{x:3980,y:630,w:1220,h:90},
        {x:380,y:510,w:180,h:22},{x:650,y:445,w:130,h:22},{x:960,y:520,w:160,h:22},{x:1200,y:420,w:180,h:22},
        {x:1640,y:505,w:170,h:22},{x:1920,y:420,w:155,h:22},{x:2150,y:520,w:130,h:22},
        {x:2500,y:470,w:180,h:22},{x:2780,y:380,w:150,h:22},{x:3230,y:500,w:160,h:22},{x:3480,y:410,w:160,h:22},
        {x:3760,y:510,w:120,h:22},{x:4100,y:450,w:170,h:22},{x:4380,y:370,w:160,h:22}
      ];
      // Small mission-specific layout changes keep campaigns visually distinct without creating impossible jumps.
      if(i%2===1){ this.platforms.push({x:1320,y:330,w:120,h:20},{x:3000,y:500,w:90,h:20}); }
      if(i%3===2){ this.platforms.push({x:700,y:340,w:120,h:20},{x:3650,y:310,w:130,h:20}); }
      this.hazards=[{x:760,y:620,w:80,h:20},{x:1460,y:620,w:70,h:20},{x:2310,y:620,w:80,h:20},{x:3090,y:620,w:90,h:20},{x:3900,y:620,w:80,h:20}];
      this.terminals=[
        {x:1035,y:562,w:42,h:68,kind:'terminal',done:false,label:'KNOWLEDGE'},
        {x:2545,y:402,w:42,h:68,kind:'bridge',done:false,label:'SENTENCE'},
        {x:3710,y:562,w:42,h:68,kind:'target',done:false,label:'TARGET'}
      ];
      // Barrier gates are four times the previous width and height, anchored to the floor.
      const barrierWidth=28*4, barrierHeight=300*4, barrierY=630-barrierHeight;
      this.barriers=[{x:1180,y:barrierY,w:barrierWidth,h:barrierHeight,terminal:0},{x:2960,y:barrierY,w:barrierWidth,h:barrierHeight,terminal:1},{x:3870,y:barrierY,w:barrierWidth,h:barrierHeight,terminal:2}];
      this.checkpoints=[{x:1710,y:565,w:38,h:65,active:false},{x:3310,y:565,w:38,h:65,active:false}];
      this.coreItems=[{x:705,y:395,w:25,h:25,type:'Vocabulary',taken:false},{x:2838,y:330,w:25,h:25,type:'Grammar',taken:false},{x:4440,y:320,w:25,h:25,type:'Communication',taken:false}];
      this.enemies=[];
      if(this.config.combat!==false){
        [520,1320,1760,2180,2690,3340,4200].forEach((x,index)=>this.enemies.push(this.makeEnemy(x,index%3)));
      }
      this.boss={x:4800,y:500,w:90,h:130,hp:120,maxHp:120,active:false,vulnerable:0,questionPending:false,attackTimer:1.4,name:this.config.missionIndex===this.year.missions.length-1?this.year.boss:'GRAMMAR GLITCH',phase:1};
      this.targetArena=null;
    }
    makeEnemy(x,type){ return {x,y:type===2?420:570,w:type===2?42:38,h:type===2?42:60,vx:type===0?70:0,hp:type===1?4:3,maxHp:type===1?4:3,type,alive:true,attack:rand(.6,1.8),origin:x}; }

    loop(now){
      if(!this.running)return;
      const raw=Math.min(.034,(now-this.last)/1000||0); this.last=now;
      const speed=Number(window.LexiconStorage.state.settings.gameSpeed||1); const dt=raw*speed;
      if(!['paused','challenge','victory','gameover'].includes(this.mode)){ this.update(dt); }
      this.render(); this.pressed.clear(); this.raf=requestAnimationFrame(this.loop);
    }
    update(dt){
      this.time+=dt; if(this.mode==='intro'){this.introTime-=dt;if(this.introTime<=0)this.mode='playing';return;}
      if(this.mode==='target'){ this.updatePlayer(dt); this.updateBullets(dt); this.updateTargetArena(dt); this.updateParticles(dt); this.updateCamera(dt); this.updateHUD(); return; }
      this.updatePlayer(dt); this.updateBullets(dt); this.updateEnemies(dt); this.updatePickups(); this.updateTerminals(); this.updateCheckpoints(); this.updateBoss(dt); this.updateParticles(dt); this.updateCamera(dt); this.updateHUD();
      if(this.player.y>850)this.damagePlayer(100);
      if(this.time%20<dt){ const p=window.LexiconStorage.activeProfile(); if(p)window.LexiconStorage.updateProfile(p.id,{playTime:(p.playTime||0)+20}); }
    }

    updatePlayer(dt){
      const p=this.player; p.invuln=Math.max(0,p.invuln-dt); p.dashCooldown=Math.max(0,p.dashCooldown-dt);
      const speedScale=1+this.upgrades.speed*.15;
      const jumpScale=1+this.upgrades.jump*.07;
      const left=this.input('left'),right=this.input('right'); const axis=(right?1:0)-(left?1:0);
      if(axis){p.facing=axis; if(p.dashTime<=0)p.vx+=axis*1500*speedScale*dt;}
      if(p.dashTime<=0){ p.vx*=Math.pow(p.onGround?.78:.9,dt*60); p.vx=clamp(p.vx,-330*speedScale,330*speedScale); }
      const jumpPressed=this.just('jump')||this.touch.jumpPressed;
      if(jumpPressed){
        if(p.onGround||p.onWall){
          p.vy=-710*jumpScale;
          if(p.onWall){p.vx=-p.onWall*430*speedScale;p.facing=-p.onWall;}
          p.onGround=false; p.airJumps=p.maxAirJumps;
          window.LexiconAudio.jump(); this.burst(p.x+p.w/2,p.y+p.h,'jump',8);
        } else if(p.airJumps>0){
          p.airJumps-=1; p.vy=-660*jumpScale;
          window.LexiconAudio.jump(); this.burst(p.x+p.w/2,p.y+p.h/2,'airjump',14);
        }
      }
      this.touch.jumpPressed=false;
      if((this.just('dash')||this.touch.dashPressed) && p.dashCooldown<=0){ const dashScale=1+this.upgrades.dash*.08;p.dashTime=.16;p.dashCooldown=.7*Math.pow(.82,this.upgrades.dash);p.vx=p.facing*760*dashScale;p.vy=0;window.LexiconAudio.dash(); }
      this.touch.dashPressed=false;
      if(p.dashTime>0){p.dashTime-=dt;p.vy=0;this.burst(p.x+p.w/2,p.y+p.h/2,'dash',2);} else p.vy+=1900*dt;
      if(p.charging)p.charge=Math.min(1.5,p.charge+dt);
      const oldX=p.x,oldY=p.y;
      p.x+=p.vx*dt; this.resolveHorizontal(p,oldX);
      p.y+=p.vy*dt; p.onGround=false; p.onWall=0; this.resolveVertical(p,oldY);
      p.x=clamp(p.x,0,this.worldWidth-p.w);
      p.trail.unshift({x:p.x,y:p.y,a:1});p.trail=p.trail.slice(0,p.dashTime>0?10:4);p.trail.forEach(t=>t.a-=dt*4);
      if(this.just('interact')||this.touch.interactPressed){this.touch.interactPressed=false;this.tryInteract();}
      if(this.just('fire'))this.startCharge();
    }
    solidPlatforms(){
      const activeBarriers=this.barriers.filter(b=>!this.terminals[b.terminal].done);
      return this.platforms.concat(activeBarriers);
    }
    resolveHorizontal(p,oldX){
      for(const s of this.solidPlatforms()) if(rects(p,s)){
        if(p.vx>0){p.x=s.x-p.w;p.onWall=1;}else if(p.vx<0){p.x=s.x+s.w;p.onWall=-1;}p.vx=0;
      }
    }
    resolveVertical(p,oldY){
      for(const s of this.solidPlatforms()) if(rects(p,s)){
        if(p.vy>0 && oldY+p.h<=s.y+8){p.y=s.y-p.h;p.vy=0;p.onGround=true;p.airJumps=p.maxAirJumps;}
        else if(p.vy<0 && oldY>=s.y+s.h-8){p.y=s.y+s.h;p.vy=0;}
      }
      for(const h of this.hazards) if(rects(p,h))this.damagePlayer(24);
    }
    startCharge(){
      const p=this.player;
      if(!this.running||!p||!['playing','target','boss'].includes(this.mode))return;
      p.charging=true;
    }
    cancelCharge(){
      const p=this.player;
      if(!p)return;
      p.charging=false;
      p.charge=0;
    }
    releaseCharge(){
      const p=this.player;
      if(!this.running||!p||!p.charging){this.pointer.active=false;return;}
      p.charging=false;
      const charged=p.charge>.55;
      const aim=this.pointer.active?{x:this.pointer.aimX,y:this.pointer.aimY}:null;
      this.fire(charged,aim);
      p.charge=0;this.pointer.active=false;
    }
    fire(charged,aim=null){
      const p=this.player;
      if(!this.running||!p||!['playing','target','boss'].includes(this.mode))return;
      const baseX=aim?.x??p.facing,baseY=aim?.y??0,baseLen=Math.hypot(baseX,baseY)||1;
      const dirX=baseX/baseLen,dirY=baseY/baseLen;
      if(Math.abs(dirX)>.05)p.facing=dirX>=0?1:-1;
      const power=(charged?Math.min(3,1+Math.floor(p.charge*1.7)):1)+this.upgrades.charge;
      const projectileCount=1+this.upgrades.multishot;
      const baseAngle=Math.atan2(dirY,dirX),spread=.105;
      const speed=charged?820:960;
      for(let i=0;i<projectileCount;i++){
        const offset=(i-(projectileCount-1)/2)*spread;
        const angle=baseAngle+offset,dx=Math.cos(angle),dy=Math.sin(angle);
        this.bullets.push({x:p.x+p.w/2+dx*24,y:p.y+21+dy*24,w:charged?22:10,h:charged?12:6,vx:dx*speed,vy:dy*speed,life:1.5,power,charged});
      }
      window.LexiconAudio.shot(charged); this.burst(p.x+p.w/2+dirX*24,p.y+21+dirY*24,charged?'charged':'shot',charged?12:4+projectileCount*2);
    }
    updateBullets(dt){
      this.bullets.forEach(b=>{b.x+=b.vx*dt;b.y+=(b.vy||0)*dt;b.life-=dt;});
      this.enemyBullets.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(rects(b,this.player)){b.life=0;this.damagePlayer(b.damage||10);}});
      if(this.targetArena){
        for(const b of this.bullets)for(const d of this.targetArena.drones)if(d.alive&&rects(b,d)){b.life=0;this.hitTargetDrone(d);}
      }
      for(const b of this.bullets)for(const e of this.enemies)if(e.alive&&rects(b,e)){b.life=0;e.hp-=b.power;this.burst(b.x,b.y,'hit',5);if(e.hp<=0){e.alive=false;this.score+=120;this.addCombo('WORD SYNC');}}
      if(this.boss.active&&this.boss.vulnerable>0){for(const b of this.bullets)if(b.life>0&&rects(b,this.boss)){b.life=0;this.boss.hp-=b.power*(b.charged?3:1);this.score+=15;this.burst(b.x,b.y,'boss',8);if(this.boss.hp<=0)this.completeMission();}}
      this.bullets=this.bullets.filter(b=>b.life>0&&b.x>this.cameraX-100&&b.x<this.cameraX+W+400);
      this.enemyBullets=this.enemyBullets.filter(b=>b.life>0);
    }
    updateEnemies(dt){
      if(this.config.combat===false)return;
      for(const e of this.enemies){ if(!e.alive)continue; const dist=this.player.x-e.x;
        if(e.type===0){e.x+=e.vx*dt;if(Math.abs(e.x-e.origin)>110)e.vx*=-1;}
        if(e.type===2)e.y=430+Math.sin(this.time*2+e.x)*35;
        e.attack-=dt;
        if(Math.abs(dist)<520&&e.attack<=0){e.attack=e.type===1?1.15:1.8;const dx=this.player.x-e.x,dy=this.player.y-e.y,len=Math.hypot(dx,dy)||1;this.enemyBullets.push({x:e.x+e.w/2,y:e.y+e.h/2,w:9,h:9,vx:dx/len*(e.type===1?360:260),vy:dy/len*(e.type===1?360:260),life:3,damage:e.type===1?13:9});}
        if(rects(this.player,e))this.damagePlayer(14);
      }
    }
    updatePickups(){
      for(const c of this.coreItems)if(!c.taken&&rects(this.player,c)){c.taken=true;this.cores++;this.score+=500;this.addCombo(`${c.type.toUpperCase()} CORE`);window.LexiconAudio.core();this.burst(c.x,c.y,'core',28);this.toast(`${c.type} Core recovered`);}
    }
    updateCheckpoints(){
      for(const cp of this.checkpoints)if(!cp.active&&rects(this.player,cp)){this.checkpoints.forEach(c=>c.active=false);cp.active=true;this.checkpoint={x:cp.x,y:cp.y-20};window.LexiconAudio.checkpoint();this.toast('Checkpoint synchronized');}
    }
    updateTerminals(){
      for(const t of this.terminals){if(!t.done&&Math.abs(this.player.x-t.x)<105&&Math.abs(this.player.y-t.y)<100){this.hooks.onPrompt?.('Press E / Interact to access the Language Terminal');return;}}
      this.hooks.onPrompt?.('');
    }
    tryInteract(){
      const t=this.terminals.find(item=>!item.done&&Math.abs(this.player.x-item.x)<120&&Math.abs(this.player.y-item.y)<120);
      if(t)this.activateTerminal(t);
    }

    selectMissionQuestion(config={},types=null){
      const pool=window.LexiconEducation.filter(config).filter(q=>!this.usedQuestionIds.has(q.id)&&(!types||types.includes(q.type)));
      const fallback=types?window.LexiconEducation.filter(config).filter(q=>!this.usedQuestionIds.has(q.id)):pool;
      const candidates=pool.length?pool:fallback;
      const q=candidates[Math.floor(Math.random()*candidates.length)]||null;
      if(q){
        this.usedQuestionIds.add(q.id);
        window.LexiconEducation.recentIds.push(q.id);
        window.LexiconEducation.recentIds=window.LexiconEducation.recentIds.slice(-40);
      }
      return q;
    }
    async activateTerminal(t){
      if(this.mode==='challenge'||t.done||t.locked)return;
      t.locked=true;
      if(t.kind==='target'){this.startTargetArena(t);return;}
      this.previousMode=this.mode;this.mode='challenge';
      const types=t.kind==='bridge'?['build-sentence','put-words-in-order']:null;
      const q=this.selectMissionQuestion({year:this.year.id,topic:this.mission.topic,supportLevel:this.config.supportLevel||3},types);
      if(!q){t.locked=false;this.mode=this.previousMode||'playing';this.toast('Todos os desafios desta missão já foram usados.');return;}
      const result=await window.LexiconEducation.show(q,{supportLevel:this.config.supportLevel,ptSupport:this.config.ptSupport,teacher:this.config.teacher,timeLimit:this.config.timeLimit});
      window.LexiconEducation.record(q,result.correct,result.usedHint);
      if(result.correct){t.done=true;this.correctCount++;this.score+=650;this.addCombo(t.kind==='bridge'?'PERFECT SENTENCE':'GRAMMAR CHAIN');this.rewardCombo();this.grantChallengeUpgrade();this.burst(t.x,t.y,'core',34);}
      else {this.wrongCount++;this.combo=0;this.health=Math.max(20,this.health-5);}
      t.locked=false;this.mode=this.previousMode==='boss'?'boss':'playing';this.last=performance.now();
    }
    startTargetArena(t){
      const q=this.selectMissionQuestion({year:this.year.id,topic:this.mission.topic,supportLevel:this.config.supportLevel||3},['target']) || this.selectMissionQuestion({year:this.year.id,topic:this.mission.topic,supportLevel:this.config.supportLevel||3});
      if(!q){this.toast('Todos os desafios desta missão já foram usados.');return;}
      const wrong=q.options.filter(o=>o!==q.correctAnswer); const labels=[q.correctAnswer,...wrong.slice(0,2)].sort(()=>Math.random()-.5);
      const base=this.player.x+330;
      this.targetArena={terminal:t,question:q,drones:labels.map((label,index)=>({x:base+index*180,y:420-(index%2)*110,w:145,h:62,label,alive:true,pulse:Math.random()*6})),feedback:'',timer:0};
      this.mode='target';this.toast('Target Protocol: fire at the correct answer');
    }
    updateTargetArena(dt){
      const a=this.targetArena;if(!a)return;a.timer=Math.max(0,a.timer-dt);a.drones.forEach((d,i)=>{d.y+=Math.sin(this.time*2+d.pulse)*.35;});
      if(this.player.x>a.drones[2].x+250)this.player.x=a.drones[2].x+250;
    }
    hitTargetDrone(d){
      const a=this.targetArena;if(!a||!d.alive||a.timer>0)return;const correct=d.label===a.question.correctAnswer;
      if(correct){d.alive=false;window.LexiconEducation.record(a.question,true,false,'target-combat');a.terminal.done=true;this.correctCount++;this.score+=800;this.addCombo('LEXICON MASTER');this.rewardCombo();this.grantChallengeUpgrade();window.LexiconAudio.correct();this.burst(d.x+d.w/2,d.y+d.h/2,'core',38);this.toast(a.question.explanation);setTimeout(()=>{this.targetArena=null;this.mode='playing';},650);}
      else {window.LexiconEducation.record(a.question,false,false,'target-combat');this.wrongCount++;this.combo=0;this.shield=Math.max(0,this.shield-5);if(this.shield===0)this.health=Math.max(20,this.health-5);window.LexiconAudio.incorrect();a.timer=.7;this.toast('Almost! Read the instruction and try another target.');this.burst(d.x,d.y,'wrong',16);}
    }
    updateBoss(dt){
      const b=this.boss;if(this.config.bosses===false){if(this.player.x>4680)this.completeMission();return;}
      if(!b.active&&this.player.x>4550){b.active=true;this.mode='boss';window.LexiconAudio.warning();this.toast(`${b.name} // LANGUAGE DEFENSE ONLINE`);setTimeout(()=>this.askBossQuestion(),900);}
      if(!b.active)return;
      b.vulnerable=Math.max(0,b.vulnerable-dt); b.attackTimer-=dt; b.y=470+Math.sin(this.time*1.8)*35;
      if(b.attackTimer<=0&&this.mode==='boss'){b.attackTimer=Math.max(.55,1.35-b.phase*.18);const dx=this.player.x-b.x,dy=this.player.y-b.y,len=Math.hypot(dx,dy)||1;for(let spread=-1;spread<=1;spread++){this.enemyBullets.push({x:b.x,y:b.y+55,w:14,h:14,vx:dx/len*330,vy:dy/len*330+spread*95,life:4,damage:12});}}
      b.phase=b.hp<b.maxHp*.33?3:b.hp<b.maxHp*.66?2:1;
      if(b.vulnerable<=0&&!b.questionPending&&this.mode==='boss')this.askBossQuestion();
      if(rects(this.player,b))this.damagePlayer(18);
    }
    async askBossQuestion(){
      const b=this.boss;if(!b.active||b.questionPending||this.mode==='challenge')return;b.questionPending=true;this.mode='challenge';
      const q=this.selectMissionQuestion({year:this.year.id,topic:this.mission.topic,supportLevel:this.config.supportLevel||3,difficulty:b.phase===3?'independent':b.phase===2?'guided':'starter'});
      if(!q){b.questionPending=false;b.vulnerable=5;this.mode='boss';this.toast('Banco desta missão concluído — defesa aberta!');return;}
      const result=await window.LexiconEducation.show(q,{supportLevel:this.config.supportLevel,ptSupport:this.config.ptSupport,teacher:this.config.teacher,timeLimit:this.config.timeLimit});
      window.LexiconEducation.record(q,result.correct,result.usedHint,'boss');b.questionPending=false;
      if(result.correct){this.correctCount++;b.vulnerable=7;this.addCombo('COMMUNICATION BOOST');this.rewardCombo();this.grantChallengeUpgrade();this.toast('Grammar shield disabled — attack now!');}
      else {this.wrongCount++;b.vulnerable=2.8;this.combo=0;this.toast('Short opening granted. Keep trying!');}
      this.mode='boss';this.last=performance.now();
    }
    damagePlayer(amount){
      const p=this.player;if(p.invuln>0||this.mode==='challenge')return;
      if(this.shield>0){const used=Math.min(this.shield,amount);this.shield-=used;amount-=used;}
      this.health-=amount;p.invuln=1.1;this.shake=10;this.combo=0;window.LexiconAudio.hit();this.burst(p.x+p.w/2,p.y+p.h/2,'wrong',18);
      if(this.health<=0){this.lives--;if(this.lives<=0){this.mode='gameover';this.hooks.onState?.('gameover');window.LexiconAudio.stopMusic();}
        else {this.health=100;this.shield=0;p.x=this.checkpoint.x;p.y=this.checkpoint.y;p.vx=p.vy=0;this.toast(`Signal restored — ${this.lives} lives remaining`);}}
    }
    addCombo(label){this.combo++;this.comboLabel=label;if(this.combo>1)window.LexiconAudio.combo();}
    rewardCombo(){if(this.combo%3===0)this.shield=Math.min(35,this.shield+12);if(this.combo%5===0)this.health=Math.min(100,this.health+12);}
    grantChallengeUpgrade(){
      const catalog=[
        {key:'speed',max:3,title:'VELOCITY DRIVE',detail:'+15% de velocidade'},
        {key:'multishot',max:4,title:'MULTI-SHOT',detail:'+1 projétil por disparo'},
        {key:'jump',max:3,title:'JUMP AMPLIFIER',detail:'pulos mais altos'},
        {key:'dash',max:3,title:'DASH FLUX',detail:'dash mais rápido e recarga menor'},
        {key:'charge',max:3,title:'CHARGE CORE',detail:'tiros carregados mais fortes'},
        {key:'air',max:2,title:'AERO CORE',detail:'+1 salto aéreo'}
      ];
      let selected=null;
      for(let offset=0;offset<catalog.length;offset++){
        const index=(this.upgradeCursor+offset)%catalog.length;
        const candidate=catalog[index];
        if((this.upgrades[candidate.key]||0)<candidate.max){selected=candidate;this.upgradeCursor=(index+1)%catalog.length;break;}
      }
      if(!selected){this.shield=Math.min(50,this.shield+15);this.toast('UPGRADE MAX // escudo +15');return;}
      this.upgrades[selected.key]=(this.upgrades[selected.key]||0)+1;
      if(selected.key==='air'){
        this.player.maxAirJumps=1+this.upgrades.air;
        this.player.airJumps=this.player.maxAirJumps;
      }
      this.score+=250;window.LexiconAudio.combo();
      this.burst(this.player.x+this.player.w/2,this.player.y+this.player.h/2,'upgrade',30);
      this.toast(`UPGRADE // ${selected.title} — ${selected.detail}`);
    }
    upgradeSummary(){
      const shot=1+this.upgrades.multishot, jumps=2+this.upgrades.air;
      return `SPD +${this.upgrades.speed*15}% · ${jumps} JUMPS · ${shot} SHOT${shot>1?'S':''}`;
    }
    completeMission(){
      if(this.missionEnded)return;this.missionEnded=true;this.mode='victory';this.running=true;window.LexiconAudio.victory();window.LexiconAudio.stopMusic();
      const profile=window.LexiconStorage.activeProfile();const rank=this.getRank();
      if(profile){const completed=[...new Set([...(profile.completedMissions||[]),this.mission.id])];const cores=Object.assign({},profile.languageCores,{[this.mission.id]:Math.max(profile.languageCores?.[this.mission.id]||0,this.cores)});const best=Object.assign({},profile.bestRanks,{[this.mission.id]:this.betterRank(profile.bestRanks?.[this.mission.id],rank)});const achievements=[...(profile.achievements||[])];
        if(this.cores===3&&!achievements.includes('Core Trinity'))achievements.push('Core Trinity');if(this.wrongCount===0&&!achievements.includes('No-Hint Streak'))achievements.push('No-Hint Streak');if(this.combo>=5&&!achievements.includes('Grammar Chain'))achievements.push('Grammar Chain');
        window.LexiconStorage.updateProfile(profile.id,{completedMissions:completed,languageCores:cores,bestRanks:best,achievements,currentCampaign:this.mission.id});window.LexiconEducation.addBossWin(this.mission.topic);
      }
      const result={year:this.year.id,mission:this.mission.id,missionName:this.mission.name,score:this.score,rank,time:this.time,cores:this.cores,correct:this.correctCount,incorrect:this.wrongCount,accuracy:this.correctCount+this.wrongCount?Math.round(this.correctCount/(this.correctCount+this.wrongCount)*100):100};
      window.LexiconStorage.addSession(Object.assign({profileId:profile?.id,type:'campaign'},result));this.hooks.onVictory?.(result);
    }
    betterRank(oldRank,newRank){const r={S:4,A:3,B:2,C:1};return !oldRank||r[newRank]>r[oldRank]?newRank:oldRank;}
    getRank(){const accuracy=this.correctCount+this.wrongCount?this.correctCount/(this.correctCount+this.wrongCount):1;const score=(accuracy*.5)+(this.cores/3*.3)+(Math.max(0,1-this.time/420)*.2);return score>.9?'S':score>.75?'A':score>.58?'B':'C';}
    updateParticles(dt){this.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;p.life-=dt;p.size*=.985;});this.particles=this.particles.filter(p=>p.life>0);this.floaters.forEach(f=>{f.y-=25*dt;f.life-=dt;});this.floaters=this.floaters.filter(f=>f.life>0);this.shake=Math.max(0,this.shake-dt*25);}
    burst(x,y,type,count){if(window.LexiconStorage.state.settings.reducedMotion)count=Math.min(5,count);const colors={core:[this.palette.primary,this.palette.secondary,'#fff'],hit:['#fff','#58ddff'],wrong:['#ff4e79','#ff9d42'],dash:[this.palette.primary,'#fff'],jump:['#7be8ff'],airjump:[this.palette.secondary,'#fff','#7be8ff'],upgrade:[this.palette.primary,this.palette.secondary,'#fff'],shot:['#fff'],charged:[this.palette.secondary,'#fff'],boss:['#ff7f50','#fff']}[type]||['#fff'];for(let i=0;i<count;i++)this.particles.push({x,y,vx:rand(-220,220),vy:rand(-220,120),gravity:rand(50,420),life:rand(.25,.8),size:rand(2,7),color:colors[i%colors.length]});if(this.particles.length>260)this.particles.splice(0,this.particles.length-260);}
    toast(text){this.floaters.push({text,x:this.player.x+this.player.w/2,y:this.player.y-25,life:2.4});this.hooks.onToast?.(text);}
    updateCamera(dt){const target=clamp(this.player.x-W*.38,0,this.worldWidth-W);this.cameraX+=(target-this.cameraX)*Math.min(1,dt*5);}
    updateHUD(){this.hooks.onHUD?.({health:this.health,shield:this.shield,lives:this.lives,cores:this.cores,combo:this.combo,comboLabel:this.comboLabel,time:this.time,score:this.score,boss:this.boss.active?this.boss:null,mission:this.mission,year:this.year,upgrades:this.upgrades,upgradeSummary:this.upgradeSummary()});}

    render(){
      const c=this.ctx;c.save();c.clearRect(0,0,W,H);this.drawBackground(c);
      let sx=0,sy=0;if(this.shake>0&&window.LexiconStorage.state.settings.screenShake&&!window.LexiconStorage.state.settings.reducedMotion){sx=rand(-this.shake,this.shake);sy=rand(-this.shake,this.shake);}c.translate(-this.cameraX+sx,sy);
      this.drawWorld(c);this.drawEntities(c);this.drawParticles(c);c.restore();this.drawScreenFX(c);
    }
    drawBackground(c){
      const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#030817');g.addColorStop(.55,'#071329');g.addColorStop(1,'#02040a');c.fillStyle=g;c.fillRect(0,0,W,H);
      c.save();c.globalAlpha=.24;for(let layer=0;layer<3;layer++){const speed=(layer+1)*.08;const offset=-(this.cameraX*speed)%260;c.strokeStyle=layer===0?this.palette.primary:this.palette.secondary;c.lineWidth=1;for(let x=offset-260;x<W+260;x+=260){const h=90+((x+layer*87)%170);c.strokeRect(x,H-210-h-layer*50,150,h);c.beginPath();c.moveTo(x,H-210-layer*30);c.lineTo(x+210,H-310-layer*25);c.stroke();}}c.restore();
      c.save();c.globalAlpha=.18;c.strokeStyle=this.palette.primary;c.lineWidth=1;for(let y=0;y<H;y+=32){c.beginPath();c.moveTo(0,y+.5);c.lineTo(W,y+.5);c.stroke();}c.restore();
      const vign=c.createRadialGradient(W/2,H/2,200,W/2,H/2,760);vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,0,0,.72)');c.fillStyle=vign;c.fillRect(0,0,W,H);
    }
    drawWorld(c){
      for(const p of this.platforms){const grad=c.createLinearGradient(0,p.y,0,p.y+p.h);grad.addColorStop(0,'#14345a');grad.addColorStop(.08,this.palette.primary);grad.addColorStop(.13,'#10243c');grad.addColorStop(1,'#050914');c.fillStyle=grad;c.fillRect(p.x,p.y,p.w,p.h);c.strokeStyle='rgba(255,255,255,.08)';c.strokeRect(p.x+.5,p.y+.5,p.w-1,p.h-1);for(let x=p.x+18;x<p.x+p.w;x+=56){c.fillStyle='rgba(255,255,255,.05)';c.fillRect(x,p.y+10,2,p.h-18);}}
      for(const h of this.hazards){c.fillStyle='#ff315f';for(let x=h.x;x<h.x+h.w;x+=16){c.beginPath();c.moveTo(x,h.y+h.h);c.lineTo(x+8,h.y);c.lineTo(x+16,h.y+h.h);c.fill();}}
      for(const b of this.barriers.filter(b=>!this.terminals[b.terminal].done)){c.save();c.shadowBlur=20;c.shadowColor=this.palette.secondary;c.fillStyle='rgba(255,255,255,.08)';c.fillRect(b.x,b.y,b.w,b.h);c.strokeStyle=this.palette.secondary;c.lineWidth=3;for(let y=b.y;y<b.y+b.h;y+=26){c.beginPath();c.moveTo(b.x,y);c.lineTo(b.x+b.w,y+14);c.stroke();}c.restore();}
      for(const t of this.terminals){c.save();c.translate(t.x,t.y);c.shadowBlur=t.done?0:18;c.shadowColor=this.palette.primary;c.fillStyle=t.done?'#152735':'#0a1d31';c.fillRect(0,0,t.w,t.h);c.strokeStyle=t.done?'#416173':this.palette.primary;c.lineWidth=2;c.strokeRect(1,1,t.w-2,t.h-2);c.fillStyle=t.done?'#416173':this.palette.secondary;c.fillRect(10,12,22,16);c.font='700 8px Arial';c.textAlign='center';c.fillStyle='#eafcff';c.fillText(t.done?'SYNC':t.label,21,49);c.restore();}
      for(const cp of this.checkpoints){c.save();c.shadowBlur=cp.active?25:8;c.shadowColor=this.palette.primary;c.fillStyle=cp.active?this.palette.primary:'#102b45';c.fillRect(cp.x,cp.y,cp.w,cp.h);c.fillStyle='#fff';c.fillRect(cp.x+16,cp.y-24,6,40);c.beginPath();c.moveTo(cp.x+22,cp.y-22);c.lineTo(cp.x+50,cp.y-12);c.lineTo(cp.x+22,cp.y-2);c.fill();c.restore();}
      for(const core of this.coreItems)if(!core.taken){c.save();c.translate(core.x+12,core.y+12);c.rotate(this.time);c.shadowBlur=24;c.shadowColor=this.palette.secondary;c.fillStyle=this.palette.secondary;c.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;c.lineTo(Math.cos(a)*14,Math.sin(a)*14);}c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(-3,-3,6,6);c.restore();}
      c.save();c.fillStyle='rgba(255,255,255,.08)';c.fillRect(4590,320,15,310);c.fillRect(5150,320,15,310);c.restore();
    }
    drawEntities(c){
      for(const e of this.enemies)if(e.alive)this.drawEnemy(c,e);
      if(this.targetArena)for(const d of this.targetArena.drones)if(d.alive)this.drawTargetDrone(c,d);
      if(this.boss.active)this.drawBoss(c,this.boss);
      if(this.pointer.down&&this.player?.charging)this.drawAimGuide(c);
      for(const b of this.bullets){c.save();c.shadowBlur=b.charged?20:8;c.shadowColor=this.palette.primary;c.fillStyle=b.charged?this.palette.secondary:'#eaffff';c.fillRect(b.x,b.y,b.w,b.h);c.restore();}
      for(const b of this.enemyBullets){c.save();c.shadowBlur=14;c.shadowColor='#ff315f';c.fillStyle='#ff5e79';c.beginPath();c.arc(b.x,b.y,b.w/2,0,Math.PI*2);c.fill();c.restore();}
      this.drawPlayer(c);
    }
    drawEnemy(c,e){c.save();c.translate(e.x,e.y);c.shadowBlur=15;c.shadowColor=e.type===1?'#ff4fc7':'#ff713d';c.fillStyle='#141a2a';c.fillRect(0,8,e.w,e.h-8);c.strokeStyle=e.type===1?'#ff4fc7':'#ff713d';c.lineWidth=2;c.strokeRect(1,9,e.w-2,e.h-10);c.fillStyle='#fff';c.fillRect(e.w*(this.player.x>e.x?.62:.22),20,7,5);c.fillStyle='#ff315f';c.fillRect(6,e.h-10,(e.w-12)*(e.hp/e.maxHp),3);if(e.type===2){c.beginPath();c.moveTo(0,e.h/2);c.lineTo(-12,e.h/2+8);c.lineTo(0,e.h/2+14);c.fill();c.beginPath();c.moveTo(e.w,e.h/2);c.lineTo(e.w+12,e.h/2+8);c.lineTo(e.w,e.h/2+14);c.fill();}c.restore();}
    drawTargetDrone(c,d){c.save();c.translate(d.x,d.y);c.shadowBlur=22;c.shadowColor=this.palette.primary;c.fillStyle='rgba(4,13,27,.96)';c.fillRect(0,0,d.w,d.h);c.strokeStyle=this.palette.primary;c.lineWidth=2;c.strokeRect(1,1,d.w-2,d.h-2);c.fillStyle=this.palette.secondary;c.fillRect(8,8,6,d.h-16);c.fillStyle='#f4fbff';c.font='800 16px Arial';c.textAlign='center';this.wrapText(c,d.label,d.w/2,27,d.w-24,18);c.restore();}
    drawBoss(c,b){c.save();c.translate(b.x,b.y);c.shadowBlur=b.vulnerable>0?35:16;c.shadowColor=b.vulnerable>0?this.palette.secondary:'#ff315f';c.fillStyle='#0b1020';c.fillRect(0,0,b.w,b.h);c.strokeStyle=b.vulnerable>0?this.palette.secondary:'#ff315f';c.lineWidth=4;c.strokeRect(2,2,b.w-4,b.h-4);c.fillStyle='#ff315f';c.fillRect(15,28,60,12);c.fillStyle='#fff';c.fillRect(23,31,8,5);c.fillRect(59,31,8,5);for(let i=0;i<b.phase;i++){c.fillStyle=this.palette.primary;c.fillRect(14+i*24,72,16,28);}c.restore();}

    drawAimGuide(c){
      const p=this.player,ox=p.x+p.w/2,oy=p.y+21;
      const distance=Math.min(460,Math.hypot(this.pointer.worldX-ox,this.pointer.worldY-oy));
      const ex=ox+this.pointer.aimX*distance,ey=oy+this.pointer.aimY*distance;
      c.save();c.globalAlpha=.82;c.strokeStyle=this.palette.secondary;c.lineWidth=2;c.setLineDash([10,8]);c.shadowBlur=12;c.shadowColor=this.palette.secondary;
      c.beginPath();c.moveTo(ox,oy);c.lineTo(ex,ey);c.stroke();c.setLineDash([]);
      c.beginPath();c.arc(ex,ey,13,0,Math.PI*2);c.stroke();
      c.beginPath();c.moveTo(ex-20,ey);c.lineTo(ex+20,ey);c.moveTo(ex,ey-20);c.lineTo(ex,ey+20);c.stroke();
      c.fillStyle=this.palette.secondary;c.beginPath();c.arc(ox+this.pointer.aimX*30,oy+this.pointer.aimY*30,5+p.charge*5,0,Math.PI*2);c.fill();c.restore();
    }
    drawPlayer(c){const p=this.player;c.save();for(const t of p.trail){c.globalAlpha=Math.max(0,t.a)*.18;c.fillStyle=this.palette.primary;c.fillRect(t.x,t.y,p.w,p.h);}c.globalAlpha=p.invuln>0&&Math.floor(this.time*14)%2?.35:1;c.translate(p.x+p.w/2,p.y+p.h/2);c.scale(p.facing,1);c.shadowBlur=p.dashTime>0?28:12;c.shadowColor=this.palette.primary;c.fillStyle='#dffaff';c.fillRect(-11,-20,22,16);c.fillStyle=this.palette.primary;c.fillRect(-15,-3,30,28);c.fillStyle='#091221';c.fillRect(-8,-17,11,5);c.fillStyle=this.palette.secondary;c.fillRect(4,-17,5,5);c.fillStyle='#0d1c2d';c.fillRect(-17,25,13,6);c.fillRect(4,25,13,6);c.fillStyle='#eafcff';c.fillRect(13,-2,15,7);if(p.charging){c.strokeStyle=this.palette.secondary;c.lineWidth=3;c.beginPath();c.arc(30,1,7+p.charge*8,0,Math.PI*2);c.stroke();}c.restore();}
    drawParticles(c){for(const p of this.particles){c.globalAlpha=clamp(p.life*2,0,1);c.fillStyle=p.color;c.fillRect(p.x,p.y,p.size,p.size);}c.globalAlpha=1;for(const f of this.floaters){c.globalAlpha=clamp(f.life,0,1);c.fillStyle='#fff';c.font='800 14px Arial';c.textAlign='center';c.fillText(f.text,f.x,f.y);}c.globalAlpha=1;}
    drawScreenFX(c){
      if(this.mode==='intro'){const a=clamp(Math.min(3-this.introTime,this.introTime)*1.4,0,1);c.save();c.globalAlpha=a;c.fillStyle='rgba(1,5,12,.86)';c.fillRect(0,0,W,H);c.textAlign='center';c.fillStyle=this.palette.primary;c.font='900 14px Arial';c.fillText(`${this.year.sector} // MISSION ${String(this.config.missionIndex+1).padStart(2,'0')}`,W/2,H/2-64);c.fillStyle='#fff';c.font='italic 900 52px Arial Narrow, Arial';c.fillText(this.mission.name.toUpperCase(),W/2,H/2);c.fillStyle='#9fb9ca';c.font='700 15px Arial';this.wrapText(c,this.mission.intro,W/2,H/2+44,760,22);c.restore();}
      if(this.mode==='target'&&this.targetArena){c.save();c.fillStyle='rgba(2,7,15,.88)';c.fillRect(170,22,940,82);c.strokeStyle=this.palette.primary;c.strokeRect(170.5,22.5,939,81);c.fillStyle=this.palette.secondary;c.font='900 12px Arial';c.textAlign='center';c.fillText('WORD TARGET PROTOCOL',W/2,45);c.fillStyle='#fff';c.font='800 22px Arial';this.wrapText(c,this.targetArena.question.prompt,W/2,74,860,24);c.restore();}
      if(this.boss.active&&this.mode==='boss'){c.save();c.fillStyle='rgba(2,6,14,.86)';c.fillRect(310,H-66,660,44);c.fillStyle='#291024';c.fillRect(410,H-48,520,10);c.fillStyle=this.boss.vulnerable>0?this.palette.secondary:'#ff315f';c.fillRect(413,H-45,514*(this.boss.hp/this.boss.maxHp),4);c.fillStyle='#fff';c.font='900 13px Arial';c.fillText(`${this.boss.name} // PHASE ${this.boss.phase}`,332,H-38);c.restore();}
      if(this.mode==='paused'){c.fillStyle='rgba(0,0,0,.45)';c.fillRect(0,0,W,H);}
    }
    wrapText(c,text,x,y,maxWidth,lineHeight){const words=String(text).split(' ');let line='';const lines=[];for(const word of words){const test=line+word+' ';if(c.measureText(test).width>maxWidth&&line){lines.push(line.trim());line=word+' ';}else line=test;}lines.push(line.trim());lines.forEach((l,i)=>c.fillText(l,x,y+i*lineHeight));}
  }

  window.LexiconGame = LexiconGame;
})();
