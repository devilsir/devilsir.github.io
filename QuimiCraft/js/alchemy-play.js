"use strict";

globalThis.QuimiCraftAlchemyPlay = (() => {
  function create({THREE,scene,world,progress,player,biomeAt,culture,isLoaded,blockAt,solidAt,isOre,spawnKeeper,removeKeeper,models,visible,touchDoor,particles,play,notify,hud,locator}){
    const keepers=new Map(),projectiles=[],clouds=[];
    const potions=QuimiCraftAlchemy.potions;
    const light=new THREE.PointLight(0xffd68e,1.65,15,2);
    const group=new THREE.Group();
    const oreGeometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(1.018,1.018,1.018));
    const oreMaterial=new THREE.LineBasicMaterial({color:0x88deff,transparent:true,opacity:.9});
    const cloudGeometry=new THREE.SphereGeometry(1,9,6);
    let lifeClock=0,surveyClock=0,nearby=null;
    const vector=(x,y,z)=>new THREE.Vector3(x,y,z);

    function launch(position,dir){
      const mesh=models.item("potion_mist","drop");
      mesh.position.copy(position);
      mesh.scale.multiplyScalar(.8);
      scene.add(mesh);
      projectiles.push({mesh,v:dir.clone().multiplyScalar(8).add(vector(0,2.4,0)),time:1.7});
    }
    function cloud(at){
      if(clouds.length>=6)removeCloud(clouds.shift());
      const group=new THREE.Group();
      const mat=new THREE.MeshBasicMaterial({color:0xc5b9ed,transparent:true,opacity:.17,depthWrite:false});
      for(const [x,y,z,size] of [[0,.5,0,1.25],[-1,.56,.08,.88],[1.08,.6,-.18,.98],[.02,.65,1.13,.75]]){
        const puff=new THREE.Mesh(cloudGeometry,mat);
        puff.position.set(x,y,z);
        puff.scale.set(size,size*.65,size);
        group.add(puff);
      }
      group.position.copy(at);
      scene.add(group);
      clouds.push({group,mat,time:potions.potion_mist.seconds});
      particles(at,0xc5b9ed,13);
      play("splash",.53);
    }
    function removeCloud(cloud){
      scene.remove(cloud.group);
      cloud.mat.dispose();
    }
    function tickVials(dt){
      for(let i=projectiles.length-1;i>=0;i--){
        const shot=projectiles[i],next=shot.mesh.position.clone().addScaledVector(shot.v,dt);
        shot.v.y-=dt*12;
        shot.time-=dt;
        if(shot.time<=0||solidAt(next.x,next.y,next.z)){
          cloud(shot.mesh.position);
          scene.remove(shot.mesh);
          projectiles.splice(i,1);
        }else{
          shot.mesh.position.copy(next);
          shot.mesh.rotation.x+=dt*7;
          shot.mesh.rotation.z+=dt*2.5;
        }
      }
      for(let i=clouds.length-1;i>=0;i--){
        const fog=clouds[i];
        fog.time-=dt;
        if(fog.time>0){
          fog.mat.opacity=Math.min(.18,fog.time*.055);
          fog.group.scale.setScalar(Math.min(1.45,.4+(potions.potion_mist.seconds-fog.time)*.72));
        }else{
          removeCloud(fog);
          clouds.splice(i,1);
        }
      }
    }
    function inCloud(actor){
      return clouds.some(({group})=>{
        const {x,y,z}=group.position;
        return Math.abs(actor.y-y)<2.5&&(actor.x-x)**2+(actor.z-z)**2<3.1**2;
      });
    }
    function distantSight(observer,target){
      if(inCloud(target)||inCloud(observer))return Math.hypot(observer.x-target.x,observer.z-target.z)<2.1;
      return true;
    }
    function checkField(effect,text){
      if(progress.fieldTest(effect))notify(text);
    }
    function updateSurvey(dt){
      if(!progress.activeEffect("survey")){
        if(group.parent)scene.remove(group);
        group.clear();
        surveyClock=0;
        return;
      }
      surveyClock-=dt;
      if(surveyClock>0)return;
      surveyClock=.75;
      const {x,y,z}=player.pos,px=Math.floor(x),py=Math.floor(y),pz=Math.floor(z);
      group.clear();
      const sides=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
      const found=[];
      for(let dx=-8;dx<=8;dx++)for(let dz=-8;dz<=8;dz++){
        if(dx*dx+dz*dz>64||!isLoaded(px+dx,pz+dz))continue;
        for(let dy=-4;dy<=4;dy++){
          const u=px+dx,v=py+dy,w=pz+dz;
          if(isOre(blockAt(u,v,w))&&sides.some(([a,b,c])=>!solidAt(u+a+.5,v+b+.5,w+c+.5)))found.push([u,v,w,dx*dx+dy*dy+dz*dz]);
        }
      }
      for(const [u,v,w] of found.sort((a,b)=>a[3]-b[3]).slice(0,12)){
        const box=new THREE.LineSegments(oreGeometry,oreMaterial);
        box.position.set(u+.5,v+.5,w+.5);
        group.add(box);
      }
      if(!group.parent)scene.add(group);
      if(found.some(([u,v,w])=>visible(player.pos,u+.5,v+.5,w+.5)))checkField("survey","Registro de campo · minério marcado");
    }
    function updatePlayer(dt){
      progress.tick(dt);
      if(progress.activeEffect("heal"))player.health=Math.min(100,player.health+dt*4);
      if(progress.activeEffect("light")){
        if(!light.parent)scene.add(light);
        light.position.set(player.pos.x,player.pos.y+1.6,player.pos.z);
      }else if(light.parent)scene.remove(light);
      if(progress.activeEffect("air")&&player.headUnderwater)checkField("air","Registro de campo · mergulho");
      if(progress.activeEffect("warmth")){
        const region=biomeAt(player.pos.x,player.pos.z);
        if(culture(region)==="snow"||region==="prado alpino")checkField("warmth","Registro de campo · frio");
      }
      updateSurvey(dt);
      const names=Object.values(potions).filter(p=>progress.activeEffect(p.effect)).map(p=>p.name+" "+Math.ceil(progress.state.effects[p.effect])+"s");
      if(inCloud({x:player.pos.x,y:player.pos.y,z:player.pos.z}))names.push("Névoa de Fuga");
      hud.hidden=names.length===0;
      const text=names.join(" · ");
      if(hud.textContent!==text)hud.textContent=text;
    }
    function updateLife(dt){
      lifeClock-=dt;
      if(lifeClock>0)return;
      lifeClock=1.25;
      const {x,z}=player.pos;
      nearby=null;
      let distance=85;
      for(const site of world.around(x,z,85)){
        const d=Math.hypot(site.x-x,site.z-z);
        if(d<distance){nearby=site;distance=d;}
        if(d>48||keepers.has(site.key)||!isLoaded(site.resident.x,site.resident.z))continue;
        const npc=spawnKeeper(site.resident);
        const vial=models.item("potion_mend","third");
        const wrist=npc.rig.arms[1].userData.lower;
        vial.position.set(0,-.37,-.12);
        vial.scale.multiplyScalar(.9);
        vial.visible=false;
        wrist.add(vial);
        const supplies=progress.state.keepers[site.key]||{heal:1,mist:1,readyAt:0};
        npc.alchemy={site,action:null,vial,supplies,stop:0,rest:4,work:0};
        keepers.set(site.key,npc);
      }
      locator.hidden=!nearby||distance<9;
      if(!locator.hidden)locator.textContent=nearby.config.title+" · "+Math.round(distance)+" m · X "+nearby.x+" Z "+nearby.z;
      for(const [key,npc] of keepers){
        const site=npc.alchemy.site;
        if(Math.hypot(site.x-x,site.z-z)>64){
          removeKeeper(npc);
          keepers.delete(key);
        }
      }
    }
    function finishAction(npc,action){
      if(action==="heal"){
        npc.hp=Math.min(npc.maxHp,npc.hp+29);
        particles(vector(npc.x,npc.y+1.05,npc.z),0xf2789c,7);
        play("pickup",.37);
      }else{
        const dir=vector(Math.sin(npc.angle),0,Math.cos(npc.angle)).multiplyScalar(-1);
        launch(vector(npc.x+dir.x*.42,npc.y+1.15,npc.z+dir.z*.42),dir);
      }
    }
    function npcBehavior(npc,behavior,dt){
      const job=npc.alchemy;
      if(!job)return behavior;
      const supplies=job.supplies;
      if(job.action){
        job.action.left-=dt;
        if(job.action.left<=0){
          finishAction(npc,job.action.kind);
          job.action=null;
        }
        if(job.action)return {mode:"alchemy-use",speed:0};
      }
      const frightened=behavior.mode==="flee"||npc.ai.fear>0,now=Date.now();
      const potion=frightened&&npc.hp<npc.maxHp*.54&&supplies.heal>0?"heal":
        frightened&&supplies.mist>0?"mist":null;
      if(potion&&supplies.readyAt<=now){
        supplies[potion]--;
        supplies.readyAt=now+14500;
        progress.state.keepers[job.site.key]=supplies;
        progress.persist();
        const kind=potion==="heal"?"potion_mend":"potion_mist";
        if(job.vial.userData.kind!==kind){
          const replacement=models.item(kind,"third");
          replacement.position.copy(job.vial.position);
          replacement.scale.copy(job.vial.scale);
          const wrist=job.vial.parent;
          wrist.remove(job.vial);
          wrist.add(replacement);
          job.vial=replacement;
        }
        job.action={kind:potion,left:potion==="heal"?.8:.42};
        return {mode:"alchemy-use",speed:0};
      }
      if(frightened||behavior.mode==="greet")return behavior;
      const checkpoints=npc.resident.checkpoints,goal=checkpoints[job.stop];
      if(Math.hypot(goal.x-npc.x,goal.z-npc.z)>.4){
        touchDoor(job.site,npc);
        return {mode:"alchemy-route",goal,speed:npc.profile.walk};
      }
      job.rest-=dt;
      if(job.stop===0&&job.rest>0){
        job.work+=dt;
        if(job.work>=4.5&&now>supplies.readyAt+18000&&(supplies.heal<1||supplies.mist<1)){
          supplies.heal=supplies.mist=1;
          progress.state.keepers[job.site.key]=supplies;
          progress.persist();
        }
        return {mode:"alchemy-work",speed:0};
      }
      if(job.rest<=0){
        job.stop=(job.stop+1)%checkpoints.length;
        job.rest=job.stop===0?8:job.stop===1?.6:3.3;
        job.work=0;
      }
      return {mode:"alchemy-wait",speed:0};
    }
    function animateKeeper(npc,now){
      const job=npc.alchemy;
      if(!job)return;
      job.vial.visible=!!job.action||npc.ai.mode==="alchemy-work"||job.stop===2;
      const arm=npc.rig.arms[1],lower=arm.userData.lower;
      if(job.action){
        const lift=Math.sin((1-job.action.left/(job.action.kind==="heal"?.8:.42))*Math.PI);
        arm.rotation.x=-lift*(job.action.kind==="heal"?1.05:1.85);
        lower.rotation.x=-lift*1.5;
      }else if(npc.ai.mode==="alchemy-work"){
        arm.rotation.x=-.48-Math.sin(now*.0037)*.22;
        lower.rotation.x=-.6;
      }
    }
    function tick(dt){
      tickVials(dt);
      updatePlayer(dt);
    }
    return {tick,updateLife,npcBehavior,animateKeeper,distantSight,launch};
  }
  return {create};
})();

