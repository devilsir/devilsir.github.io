window.VoicesModules.define('basketball-art', function () {
  'use strict';
  const V=window.V, M=V.BasketballMatch;
  const clips=['idle','run','dribble','pass','shoot','catch','defend','cheer','control'];
  const sidelines=['idle','run','defend','cheer','work'];
  const cell=88;
  const count={idle:3,run:6,dribble:6,pass:5,shoot:6,catch:4,defend:4,cheer:6,control:5,work:5};
  const strips=poses=>Object.fromEntries(poses.map((pose,i)=>[pose,poses.slice(0,i).reduce((n,key)=>n+count[key],0)]));
  const athleteStrips=strips(clips),sidelineStrips=strips(sidelines);
  const oneShot=new Set(['pass','shoot','catch','defend']);
  const sounded=new WeakMap();
  const arenas=new Map();
  const atlases=['campus-roster','campus-tambor','campus-arquibancada'];
  const assetVersion='20261122-basquete-opaco1';
  const imageFor=name=>{
    const image=V.Assets.image();
    image.src='assets/basketball/'+name+'.webp?v='+assetVersion;
    return image;
  };
  const A=V.BasketballArt={
    atlases:[],gear:null,frameCounts:count,
    load() {
      if(this.atlases.length)return;
      this.atlases=atlases.map(imageFor);
      this.gear=imageFor('equipamentos');
    },
    prop(c,index,x,y,width,height=width) {
      if(!this.gear?.naturalWidth)return false;
      const size=128;
      c.drawImage(this.gear,index%2*size,Math.floor(index/2)*size,size,size,x,y,width,height);
      return true;
    },
    sprite(c,id,x,y,size,dir=0,pose='idle',frame=0) {
      const athlete=id<10, atlas=this.atlases[athlete?Math.floor(id/5):2];
      if(!atlas?.naturalWidth)return false;
      const strip=athlete?athleteStrips:sidelineStrips;
      const animation=Object.hasOwn(strip,pose)?pose:'idle';
      const row=athlete?(id%5)*4+dir:id===11&&dir>0?14+dir:id-10;
      const col=strip[animation]+Math.floor(frame)%count[animation];
      c.save();
      c.imageSmoothingEnabled=true;
      c.drawImage(atlas,col*cell,row*cell,cell,cell,x-size*.5,y-size+.5,size,size);
      c.restore();
      return true;
    },
    ellipse(c,x,y,rx,ry,color) {
      c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
    },
    person(c,id,x,y,size,dir,pose,frame,label=null,team=null,marker=false) {
      this.ellipse(c,x,y+1,size*.24,size*.08,'#27231f50');
      const still=V.settings?.reducedMotion;
      if(!this.sprite(c,id,x,y,size,dir,still&&['run','dribble','control','cheer'].includes(pose)?'idle':pose,still?0:frame)) {
        this.ellipse(c,x,y-size*.33,size*.14,size*.29,team?.color||'#628280');
      }
      if(marker){
        c.strokeStyle='#fff4ae';c.lineWidth=2;c.beginPath();
        c.ellipse(x,y+3,size*.29,size*.10,0,0,Math.PI*2);c.stroke();
      }
      if(label) {
        c.font='600 '+Math.round(size*.22)+'px system-ui';
        c.textAlign='center';c.lineWidth=3;c.strokeStyle='#142823';
        c.strokeText(label,x,y-size-.5);c.fillStyle=team?.color||'#fdf3dc';c.fillText(label,x,y-size-.5);
      }
    },
    athlete(c,s,p,x,y,size,label=false) {
      const frames=count[p.pose]||count.idle;
      const curve=p.pose==='run'?p.pace:p.pose==='dribble'||p.pose==='control'?p.handle??.42
        :p.pose==='defend'&&p.hold<=0?p.pace*.68+s.elapsed*.44:p.pose==='cheer'?s.elapsed*.99+p.id*.18
        :s.elapsed*.63+p.id*.37;
      const frame=p.hold>0&&p.poseLength&&oneShot.has(p.pose)
        ?Math.min(frames-1,Math.floor((p.poseAge??p.poseLength-p.hold)/p.poseLength*frames))
        :Math.floor((curve%1)*frames);
      const data=M.roster[p.id];
      this.person(c,p.id,x,y,size,p.dir,p.pose,Math.max(0,frame),label?(data[1]+' '+data[3]):null,M.teams[p.team],s.human&&p.id===0);
    },
    sideline(c,s,index,x,y,size) {
      const official=M.community[index][5]==='ref',p=official?s.official:s.crew?.[index];
      const pose=p?.pose||'idle';
      const phase=official&&pose==='run'?(p.pace||0)%1:p?.phase??(s.elapsed*.55+index*.31)%1;
      this.person(c,M.roster.length+index,x,y,size,official?(p?.dir||0):0,pose,Math.floor(phase*count[pose]));
    },
    whistle(s) {
      if(sounded.get(s)===s.event)return;
      sounded.set(s,s.event);
      if(!['foul','period','final'].includes(s.signal))return;
      V.Audio.note(95,.105,'sine',.19);
      V.Audio.note(98,.095,'triangle',.11,'sfx',.13);
    },
    backdrop(challenge=false) {
      if(arenas.has(challenge))return arenas.get(challenge);
      const arena=document.createElement('canvas');arena.width=960;arena.height=540;
      const c=arena.getContext('2d'),b=M.court;
      c.fillStyle='#142927';c.fillRect(0,0,960,540);
      const wall=c.createLinearGradient(0,45,0,153);
      wall.addColorStop(0,'#162b2a');wall.addColorStop(1,'#34544c');
      c.fillStyle=wall;c.fillRect(25,40,910,435);
      c.strokeStyle='#749082';c.strokeRect(45.5,59.5,869,435);
      c.fillStyle='#263a36';c.fillRect(57,72,846,57);
      for(let row=0;row<4;row++){
        const y=72+row*12;
        c.fillStyle=['#755142','#8c614b','#a27859','#b78a65'][row];c.fillRect(65,y,830,9);
        c.fillStyle='#202d2c';c.fillRect(65,y+9,830,3);
        for(const step of [108,467,830]){c.fillStyle='#68726a';c.fillRect(step,y,22,10);}
      }
      c.strokeStyle='#b4be9b';c.lineWidth=2;c.beginPath();c.moveTo(65,119);c.lineTo(895,119);c.stroke();
      this.floor(c,b.x,b.y,b.w,b.h);
      if(!challenge){
        c.fillStyle='#34504a';c.fillRect(55,452,850,57);
        c.fillStyle='#638173';c.fillRect(56,453,848,2);
        for(const [x,team] of [[175,0],[619,1]]){
          c.fillStyle='#283831';c.fillRect(x,468,166,8);
          c.fillStyle=team===0?'#57937b':'#ae7669';c.fillRect(x,466,166,3);
        }
      }
      arenas.set(challenge,arena);
      return arena;
    },
    scene(c,s,{hud=true,pass=null,challenge=false}={}) {
      c.drawImage(this.backdrop(challenge),0,0);
      for(const [i,rim] of M.baskets.entries())this.rim(c,rim,i===0?1:-1);
      for(let i=0;i<M.community.length;i++){
        const row=M.community[i],ref=row[5]==='ref',fan=row[5]==='fan';
        if(challenge&&!ref&&!fan)continue;
        const p=ref?s.official:s.crew?.[i];
        const x=p?.x??row[3],y=(p?.y??row[4])+(ref?0:fan?12:row[5]==='table'?-2:7);
        this.sideline(c,s,i,x,y,fan?42:48);
      }
      if(!challenge)this.desk(c,549,507,78);
      const f=s.flight;
      if(f?.type==='rebound'){
        c.save();c.strokeStyle='#fff0a2a8';c.lineWidth=2;c.setLineDash([4,4]);
        c.beginPath();c.ellipse(f.end.x,f.end.y,19,8,0,0,Math.PI*2);c.stroke();c.restore();
      }
      if(pass){
        c.save();
        c.strokeStyle=pass.clear?'#f7dc8d':'#ffac83';c.lineWidth=2;c.setLineDash([5,6]);
        c.beginPath();c.moveTo(s.players[0].x,s.players[0].y);c.lineTo(pass.x,pass.y);c.stroke();
        c.setLineDash([]);c.beginPath();c.ellipse(pass.x,pass.y+1,20,7,0,0,Math.PI*2);c.stroke();c.restore();
      }
      for(const p of [...s.players].sort((a,b)=>a.y-b.y)){
        this.athlete(c,s,p,p.x,p.y,64,(s.human&&p.id===0)||s.carrier===p.id);
      }
      this.ball(c,s.ball);
      if(hud)this.scoreboard(c,s,480,5,622);
      if(hud&&(M.elapsedSince(s,'announcedAt')<2.65||s.status==='final')){
        c.save();c.textAlign='center';c.font='bold 17px system-ui';c.fillStyle='#fff0ce';
        c.fillText(s.last,480,529,660);c.restore();
      }
    },
    desk(c,x,y,size=64) {
      this.ellipse(c,x,y+1,size*.42,size*.08,'#222b275d');
      if(this.prop(c,2,x-size/2,y-size*104/128,size))return;
      c.fillStyle='#173d37';c.fillRect(x-size*.4,y-size*.5,size*.8,size*.5);
      c.fillStyle='#89b5a1';c.fillRect(x-size*.42,y-size*.53,size*.84,size*.10);
    },
    rim(c,r,direction,scale=1) {
      if(this.gear?.naturalWidth){
        c.save();c.translate(r.x,r.y-38*scale);c.scale(direction*scale,scale);
        const size=70;
        this.prop(c,1,-88*size/128,-42*size/128,size);
        c.restore();
        return;
      }
      c.save();c.translate(r.x,r.y);c.scale(scale,scale);
      c.lineCap='round';
      c.strokeStyle='#354652';c.lineWidth=6;c.beginPath();c.moveTo(-direction*27,4);c.lineTo(-direction*27,-55);c.lineTo(-direction*13,-55);c.stroke();
      c.fillStyle='#dfeaeebc';c.fillRect(-direction*17-2,-59,4,31);
      c.fillStyle='#a0bbb9';c.fillRect(-direction*17-3,-61,6,3);
      c.strokeStyle='#eaf2de';c.lineWidth=1.2;
      for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*4,-37);c.lineTo(i*2.3,-23);c.stroke();}
      c.strokeStyle='#f38958';c.lineWidth=2.5;
      c.beginPath();c.ellipse(0,-38,10,4.7,0,0,Math.PI*2);c.stroke();c.restore();
    },
    ball(c,ball,scale=1) {
      const {x,y,z}=ball;
      const u=Math.max(.7,scale);
      this.ellipse(c,x,y,6*u,2.6*u,'#39281d55');
      if(this.prop(c,0,x-7.6*u,y-z*scale-7.6*u,15.2*u))return;
      this.ellipse(c,x,y-z*scale,6.8*u,6.8*u,'#693b2c');
      this.ellipse(c,x,y-z*scale-1,5.4*u,5.4*u,'#e99455');
      c.strokeStyle='#773f31';c.lineWidth=Math.max(1,scale*.9);
      c.beginPath();c.moveTo(x-5*u,y-z*scale-2);c.quadraticCurveTo(x+1*u,y-z*scale-5*u,x+5*u,y-z*scale+2);c.moveTo(x+1*u,y-z*scale-6*u);c.quadraticCurveTo(x-3*u,y-z*scale,x,y-z*scale+5*u);c.stroke();
    },
    floor(c,x,y,w,h) {
      c.save();c.translate(x,y);c.scale(w/M.court.w,h/M.court.h);
      c.fillStyle='#1c302e';c.fillRect(-20,-15,808,340);
      c.fillStyle='#36483a';c.fillRect(-14,-11,796,332);
      c.strokeStyle='#9b9270';c.lineWidth=1.4;c.strokeRect(-11,-8,790,326);
      const wood=['#c39363','#c99a6a','#bf8f61','#d2a375','#c49468','#cda070','#c99b71'];
      c.save();c.beginPath();c.rect(0,0,768,310);c.clip();
      for(let row=0;row<26;row++){
        const y=row*12;
        for(let plank=0;plank<9;plank++){
          const x=plank*108-((row*37)%108);
          c.fillStyle=wood[(row*17+plank*11)%wood.length];
          c.fillRect(x,y,109,12);
          c.fillStyle='#5b352227';c.fillRect(x,y,1,12);c.fillRect(x,y+11,109,1);
          c.fillStyle='#fff0bb2c';c.fillRect(x+1,y,107,1);
          c.fillStyle='#77472324';
          const offset=(37*row+19*plank)%69;
          c.fillRect(x+8+offset,y+4+(plank%4),13+row%11,1);
          c.fillRect(x+35+(offset%26),y+8,10+plank%9,1);
        }
      }
      const light=c.createLinearGradient(0,0,0,310);
      light.addColorStop(0,'#fff0bd28');light.addColorStop(.47,'#fff2c000');light.addColorStop(1,'#773e241b');
      c.fillStyle=light;c.fillRect(0,0,768,310);
      for(const [x,color] of [[0,'#236054'],[603,'#854d48']]){
        c.fillStyle=color;c.fillRect(x,96,165,118);
        c.fillStyle='#f6e6b31c';c.fillRect(x,96,165,4);
      }
      c.restore();
      c.lineWidth=2.4;c.strokeStyle='#fff0d3';
      c.strokeRect(1,1,766,308);
      c.beginPath();c.moveTo(384,1);c.lineTo(384,309);c.stroke();
      for(const [edge,dir] of [[0,1],[768,-1]]){
        const board=edge+dir*43,free=edge+dir*165;
        c.save();
        c.strokeRect(dir>0?1:603,96,164,118);
        c.beginPath();c.arc(free,155,59,dir>0?-Math.PI/2:Math.PI/2,dir>0?Math.PI/2:Math.PI*1.5);c.stroke();
        c.setLineDash([5,7]);
        c.beginPath();c.arc(free,155,59,dir>0?Math.PI/2:-Math.PI/2,dir>0?Math.PI*1.5:Math.PI/2);c.stroke();
        c.setLineDash([]);
        const radius=M.arcRadius,corner=M.cornerLine;
        const angle=Math.asin(corner/radius),joint=board+dir*Math.sqrt(radius**2-corner**2);
        c.beginPath();
        c.moveTo(edge,155-corner);c.lineTo(joint,155-corner);
        c.moveTo(joint,155+corner);c.lineTo(edge,155+corner);
        c.stroke();
        c.beginPath();c.arc(board,155,radius,dir>0?-angle:Math.PI-angle,dir>0?angle:Math.PI+angle);c.stroke();
        c.beginPath();c.arc(board,155,33,dir>0?-Math.PI/2:Math.PI/2,dir>0?Math.PI/2:3*Math.PI/2);c.stroke();
        for(const y of [96,214])for(let i=0;i<3;i++){
          const at=edge+dir*(63+i*28);
          c.beginPath();c.moveTo(at,y);c.lineTo(at,y+(y<155?-5:5));c.stroke();
        }
        c.restore();
      }
      c.fillStyle='#275b50';c.beginPath();c.arc(384,155,54,0,Math.PI*2);c.fill();c.stroke();
      c.strokeStyle='#97be9a';c.lineWidth=1.1;c.beginPath();c.arc(384,155,46,0,Math.PI*2);c.stroke();
      c.fillStyle='#f9ebc9';c.font='900 23px system-ui';c.textAlign='center';c.fillText('VOICES',384,163);
      c.restore();
    },
    scoreboard(c,s,x,y,width=622) {
      const info=M.display(s);
      c.save();c.translate(x,y);c.scale(width/622,width/622);
      c.fillStyle='#111e1b';c.fillRect(-311,0,622,60);
      c.strokeStyle='#83977b';c.strokeRect(-310.5,.5,621,59);
      c.textAlign='center';c.textBaseline='middle';
      const entries=[
        {x:-235,name:'AURORA',value:String(s.score[0]).padStart(2,'0'),color:M.teams[0].color},
        {x:-77,name:info.period,value:info.clock,color:'#f8edd6'},
        {x:77,name:s.status==='play'?'POSSE '+M.teams[s.possession].short:'RELÓGIO DE POSSE',value:info.possession,color:info.urgent?'#ffac83':'#a8d8c0'},
        {x:235,name:'TAMBOR',value:String(s.score[1]).padStart(2,'0'),color:M.teams[1].color}
      ];
      for(const [i,item] of entries.entries()){
        c.fillStyle=i%2?'#233731':'#1b302a';c.fillRect(item.x-73,5,146,50);
        c.fillStyle=item.color;c.font='700 12px system-ui';c.fillText(item.name,item.x,17,137);
        c.font='700 26px monospace';c.fillText(item.value,item.x,40,136);
      }
      c.restore();
    }
  };
  const group=V.AssetLoader.group.bind(V.AssetLoader);
  V.AssetLoader.group=key=>key.startsWith('assets/basketball/')?'basketball':group(key);
  const load=V.Assets.load.bind(V.Assets);
  V.Assets.load=function(...args){A.load();return load(...args);};
});
