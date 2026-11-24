"use strict";

globalThis.QuimiCraftEffects = (() => {
  function create(THREE,scene,quality,reduced){
    const root=new THREE.Group();
    root.name="Efeitos volumétricos";
    scene.add(root);
    const bursts=[];
    const ringGeometry=new THREE.TorusGeometry(1,.021,6,42);
    const particleLimit=260;
    const positions=new Float32Array(particleLimit*3);
    const colors=new Float32Array(particleLimit*3);
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color",new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
    geometry.setDrawRange(0,0);
    const material=new THREE.PointsMaterial({size:.09,vertexColors:true,transparent:true,opacity:.84,
      depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
    const sparks=new THREE.Points(geometry,material);
    sparks.frustumCulled=false;
    root.add(sparks);
    const particles=[];
    const palette={wind:0x85fbdf,cyclone:0xa0efd0,arrow:0xd3edd2,guard:0xf2deb2,enemy:0xc69aff,
      cook:0xe7c69c,forge:0xffad4b,glass:0x90e3e1,hit:0xffcc77,catch:0x81e9f1,bite:0x50d0f0,land:0x9ddffa,cast:0x87eddc};

    function ring(kind,point,normal,size,life,offset=0){
      if(!quality())return;
      const tint=palette[kind]||palette.hit;
      const mat=new THREE.MeshBasicMaterial({color:tint,transparent:true,opacity:.65,depthWrite:false,
        blending:THREE.AdditiveBlending,toneMapped:false});
      const mesh=new THREE.Mesh(ringGeometry,mat);
      mesh.position.copy(point);
      mesh.position.y+=offset;
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),normal.clone().normalize());
      mesh.scale.setScalar(.045);
      root.add(mesh);
      bursts.push({mesh,remaining:life,life,size});
    }

    function emit(kind,point,count=14,force=2.1){
      if(!quality())return;
      const scale=quality()===1||reduced() ? .5 : 1;
      const tint=new THREE.Color(palette[kind]||palette.hit);
      for(let i=0;i<Math.ceil(count*scale)&&particles.length<particleLimit;i++){
        const velocity=new THREE.Vector3(Math.random()-.5,Math.random()*.74-.12,Math.random()-.5);
        velocity.normalize().multiplyScalar(force*(.25+Math.random()*.75));
        const life=.22+Math.random()*.42;
        particles.push({p:point.clone(),v:velocity,tint,life,left:life});
      }
    }

    function impact(kind,point,normal){
      const up=normal?.lengthSq()>.01?normal.clone().normalize():new THREE.Vector3(0,1,0);
      ring(kind,point,up,kind==="wind"?.85:kind==="enemy"?.62:.34,.34);
      emit(kind,point,kind==="wind"?22:12,kind==="wind"?2.8:1.6);
    }

    function cast(point,direction,wide=false){
      if(wide){
        for(let i=0;i<3;i++)ring("cyclone",point,new THREE.Vector3(0,1,0),4.5+i*.65,.61+i*.13,.05+i*.32);
        emit("cyclone",point,42,4.25);
      }else{
        ring("cast",point,direction,.57,.32);
        ring("wind",point,direction,.33,.24);
        emit("wind",point,16,1.35);
      }
    }

    function splash(point,kind){
      ring(kind,point,new THREE.Vector3(0,1,0),kind==="catch"?.95:.55,.5);
      emit(kind,point,kind==="catch"?24:10,kind==="catch"?2.8:1.1);
    }

    function trail(kind){
      if(!quality())return null;
      const n=kind==="arrow"||kind==="guard"?9:15;
      const floats=new Float32Array(n*3),colors=new Float32Array(n*3);
      const tint=new THREE.Color(palette[kind]||palette.wind);
      for(let i=0;i<n;i++)tint.clone().multiplyScalar((1-i/n)**1.4).toArray(colors,i*3);
      const g=new THREE.BufferGeometry();
      g.setAttribute("position",new THREE.BufferAttribute(floats,3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute("color",new THREE.BufferAttribute(colors,3));
      g.setDrawRange(0,0);
      const m=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false,
        toneMapped:false,blending:THREE.AdditiveBlending});
      const line=new THREE.Line(g,m);
      line.frustumCulled=false;
      root.add(line);
      let count=0;
      return {
        move(point){
          floats.copyWithin(3,0,(n-1)*3);
          point.toArray(floats,0);
          count=Math.min(count+1,n);
          g.setDrawRange(0,count);
          g.attributes.position.needsUpdate=true;
        },
        close(){root.remove(line);g.dispose();m.dispose()}
      };
    }

    function update(dt){
      for(let i=bursts.length-1;i>=0;i--){
        const effect=bursts[i];
        effect.remaining-=dt;
        if(effect.remaining<=0){
          root.remove(effect.mesh);
          effect.mesh.material.dispose();
          bursts.splice(i,1);
          continue;
        }
        const age=1-effect.remaining/effect.life;
        effect.mesh.scale.setScalar(.05+Math.sqrt(age)*effect.size);
        effect.mesh.material.opacity=(1-age)**1.3*(reduced()?.37:.74);
      }
      for(let i=particles.length-1;i>=0;i--){
        const point=particles[i];
        point.left-=dt;
        if(point.left<=0){particles.splice(i,1);continue}
        point.p.addScaledVector(point.v,dt);
        point.v.y-=dt*2.35;
      }
      particles.forEach((point,i)=>{
        point.p.toArray(positions,i*3);
        const alpha=point.left/point.life;
        colors[i*3]=point.tint.r*alpha;
        colors[i*3+1]=point.tint.g*alpha;
        colors[i*3+2]=point.tint.b*alpha;
      });
      geometry.setDrawRange(0,particles.length);
      geometry.attributes.position.needsUpdate=true;
      geometry.attributes.color.needsUpdate=true;
    }

    function work(kind,point,complete=false){
      emit(kind,point,complete?22:kind==="forge"?11:6,kind==="forge"?2.2:.93);
      if(complete)ring(kind,point,new THREE.Vector3(0,1,0),.58,.48);
    }

    return {trail,cast,impact,splash,emit,work,update};
  }

  return {create};
})();
