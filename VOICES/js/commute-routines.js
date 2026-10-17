(function commuteRoutines(){
'use strict';
const V=window.V,H=V.Homestead,W=V.World,C=V.Cozy,R=V.Rooms,N=V.ObjectiveGuide,T=48;
const Q=V.CityCommutes={boundState:null,key:null,phase:null,pending:new Set(),targets:new WeakMap(),
 clock(){const a=V.Progress.ensure(),hour=V.Environment.time(),phase=hour<6.5||hour>=19?'home':'work',day=(a?.clock.day||1)-(phase==='home'&&hour<6.5?1:0);return{phase,key:phase+':'+day};},
 reset(){this.boundState=null;this.key=null;this.phase=null;this.pending.clear();this.targets=new WeakMap();H.commuting=false;H.commute=null;},
 destination(a){return this.phase==='home'?a.home:a.work;},
 ghost(active){const changed=H.commuting!==active;H.commuting=active;H.commute={key:this.key,phase:this.phase,active,pending:this.pending};if(changed){N.invalidate();if(!active)this.releasePlayer();}},
 begin(){if(!V.state)return;const clock=this.clock();if(this.boundState===V.state&&this.key===clock.key)return;const continuing=this.boundState===V.state&&this.key!==null,saved=H.ensure()?.commute;
 this.boundState=V.state;this.key=clock.key;this.phase=clock.phase;this.pending=new Set();this.targets=new WeakMap();
 if(continuing){for(const a of H.actors.values())this.pending.add(a.key);}
 else if(saved?.key===this.key&&saved.active&&Array.isArray(saved.pending)){for(const key of saved.pending)if(H.actors.has(key))this.pending.add(key);}
 const outside=[...H.actors.values()].filter(a=>a.map!==this.destination(a));for(const a of outside)this.pending.add(a.key);
 if(!continuing&&saved?.key!==this.key&&outside.length)for(const a of H.actors.values())this.pending.add(a.key);
 this.ghost(this.pending.size>0);for(const a of H.actors.values()){if(this.pending.has(a.key)){a.o.responding=0;a.o.route=[];a.o.destination=null;a.route=[];a.routeSig=null;}else if(a.map===this.destination(a)){a.commuteArrived=this.key;if(this.phase==='home')this.hold(a);}}
 },
 endpoint(a){const id=this.destination(a),m=W.maps[id];if(!m)return null;const signature=(m.geometryRevision||0)+':'+(V.SceneDesign.revision||0),old=this.targets.get(a);if(old?.map===m&&old.signature===signature)return old.point;let wanted;
 if(this.phase==='home'){const beds=m.objects.filter(o=>o.household&&o.scene?.prop===16),bed=beds[a.slot%beds.length];wanted=bed?{x:bed.x,y:bed.y+44}:{x:220+a.slot*100,y:450};}else wanted=a.workPoint;
 const point=R.safe(m,wanted,9,a.o);this.targets.set(a,{map:m,signature,point});return point;
 },
 hold(a){a.o.scheduleManaged=true;a.o.walking=false;a.o.frame=0;a.o.action=V.Environment.time()>=22||V.Environment.time()<6.5?'sleeping':'sitting';a.o.bubble='';a.o.chatSpeaking=false;a.o.responding=0;},
 arrive(a){this.pending.delete(a.key);a.commuteArrived=this.key;a.route=[];a.path=null;a.routeSig=null;a.wait=0;a.o.walking=false;a.o.frame=0;a.o.route=[];a.o.destination=null;if(this.phase==='home'){this.hold(a);return;}const p=this.endpoint(a);a.o.scheduleManaged=false;a.o.action='waiting';a.o.taskTime=Math.max(.8,a.o.taskTime||0);a.o.responding=0;if(p){a.o.home={...p};const anchor=W.maps[a.map]?.anchors?.get('home-'+a.o.id);if(anchor)Object.assign(anchor,p);}},
 observe(a){if(!this.pending.has(a.key)||a.map!==this.destination(a))return;const target=this.endpoint(a);if(target&&V.dist(a.o,target)<=12)this.arrive(a);},
 check(){if(this.boundState!==V.state)return;for(const key of [...this.pending]){const a=H.actors.get(key);if(a)this.observe(a);else this.pending.delete(key);}this.ghost(this.pending.size>0);},
 releasePlayer(){const m=W.current,p=V.Player.data;if(!m||!p)return;const people=m.objects.filter(C.person.bind(C)),clear=q=>!V.Living.blocked(m,q.x,q.y,p.radius||11)&&people.every(o=>V.dist(o,q)>=14+12*(o.visualScale||1));if(clear(p))return;for(let radius=8;radius<=240;radius+=8)for(let i=0;i<16;i++){const q={x:p.x+Math.cos(i*Math.PI/8)*radius,y:p.y+Math.sin(i*Math.PI/8)*radius};if(clear(q)){p.x=q.x;p.y=q.y;W.camera=V.Viewport.target(m,p);return;}}},
 snapshot(){if(this.boundState!==V.state||!V.state)return;const h=H.ensure();h.commute={version:1,key:this.key,phase:this.phase,active:H.commuting,pending:[...this.pending]};}
};
const register=H.register.bind(H);H.register=function(...args){Q.reset();return register(...args);};
const reconcile=H.reconcile.bind(H);H.reconcile=function(instant=false){Q.begin();const result=reconcile(instant);Q.check();return result;};
const step=H.step.bind(H);H.step=function(a,dt){if(!V.state)return step(a,dt);if(Q.pending.has(a.key)&&a.map===Q.destination(a)){if(V.Dialogue.active&&V.Dialogue.lines[V.Dialogue.index]?.speaker===a.o.character)return;const point=Q.endpoint(a);a.o.scheduleManaged=true;if(point){if(V.dist(a.o,point)>12)this.walk(a,point,dt);else Q.arrive(a);}return;}if(a.map===a.home&&Q.phase==='home'&&a.commuteArrived===Q.key&&!Q.pending.has(a.key)){Q.hold(a);return;}const result=step(a,dt);Q.observe(a);return result;};
const update=H.update.bind(H);H.update=function(dt){const result=update(dt);Q.check();return result;};
const snapshot=H.snapshot.bind(H);H.snapshot=function(...args){const result=snapshot(...args);Q.snapshot();return result;};
const restore=H.restore.bind(H);H.restore=function(...args){const saved=this.ensure()?.commute;if(saved?.active&&saved.key===Q.clock().key)H.commuting=true;return restore(...args);};
})();
