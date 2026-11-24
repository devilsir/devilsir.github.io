"use strict";

globalThis.QuimiCraftMenuBackdrop=(()=>{
  const palettes={
    alpine:[0x679144,0x515846,0xa1ad88],forest:[0x648e3d,0x555840,0x93a461],
    coast:[0x8c9f4c,0x635b43,0xc9ba81],dry:[0xba8a51,0x805c49,0xddb075],
    snow:[0xb6c9ce,0x657b86,0xe0e5cb],lava:[0x7b6a52,0x5e4b4e,0xc08c61]
  };
  const theme=name=>/vulc|caldeira/.test(name)?"lava":/fiord|tundra|taiga|aurora/.test(name)?"snow":
    /deserto|chapada|badlands|salinas|savana/.test(name)?"dry":/manguezal|delta|pântano/.test(name)?"coast":
    /florest|bosque|selva/.test(name)?"forest":"alpine";
  function create(T,{terrain,biome,water,seed}){
    const scene=new T.Scene(),camera=new T.PerspectiveCamera(49,1,.25,315),N=53,step=3.35,half=(N-1)/2;
    let rng=(seed^Math.floor(Math.random()*0x100000000))>>>0;
    const rand=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296};
    const angle=rand()*Math.PI*2;
    const choices=[[0,0],[-29,-32],[52,-15]];
    for(let i=0;i<15;i++)choices.push([Math.floor((rand()-.5)*1180),Math.floor((rand()-.5)*1180)]);
    let originX=0,originZ=0,bestScore=-Infinity;
    for(const [x,z] of choices){
      const heights=[];
      for(let dz=-66;dz<=66;dz+=22)for(let dx=-66;dx<=66;dx+=22)heights.push(terrain(x+dx,z+dz));
      heights.sort((a,b)=>a-b);
      const coverage=heights.filter(h=>h>water).length/heights.length,center=terrain(x,z);
      const relief=heights[43]-heights[7],shore=coverage>.48&&coverage<.92?4:0;
      const score=coverage*28+Math.min(21,relief)*.85+shore+rand()*6-(center<=water?28:0);
      if(score>bestScore){bestScore=score;originX=x;originZ=z;}
    }
    const cells=Array.from({length:N*N},(_,i)=>{
      const x=(i%N-half)*step,z=(Math.floor(i/N)-half)*step;
      const wx=Math.floor(x+originX),wz=Math.floor(z+originZ);
      return {h:terrain(wx,wz),wx,wz,x,z};
    });
    const get=(x,z)=>x>=0&&z>=0&&x<N&&z<N?cells[x+z*N]:null;
    const focusY=Math.max(water+1,get(half,half).h);
    const colors=[],positions=[],normals=[];
    const color=(rgb,shade)=>new T.Color(rgb).multiplyScalar(shade);
    function face(points,n,c){
      for(const i of [0,1,2,0,2,3]){
        positions.push(...points[i]);normals.push(...n);colors.push(c.r,c.g,c.b);
      }
    }
    const box=new T.BoxGeometry(1,1,1),treeData=[],rocks=[];
    const routeZ=x=> Math.sin(x*.050)*10+Math.cos(x*.024)*14;
    const shore=Math.min(focusY-2,water+2),radius=step*.5;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){
      const c=get(i,j),{x,z,h}=c;
      const sampled=theme(biome(c.wx,c.wz)),themeColors=palettes[sampled],shade=.89+rand()*.21;
      const lake=h<=water,path=Math.abs(z-routeZ(x))<2.25&&Math.abs(x)<63&&!lake;
      const rgb=path?0xbb9c6d:lake?0x638280:h<=water+1?themeColors[2]:themeColors[0];
      const lo=x-radius,hi=x+radius,near=z-radius,far=z+radius;
      face([[lo,h,far],[hi,h,far],[hi,h,near],[lo,h,near]],[0,1,0],color(rgb,shade));
      for(const [di,dj,n,side] of [
        [-1,0,[-1,0,0],[[lo,near],[lo,far]]],[1,0,[1,0,0],[[hi,far],[hi,near]]],
        [0,-1,[0,0,-1],[[hi,near],[lo,near]]],[0,1,[0,0,1],[[lo,far],[hi,far]]]
      ]){
        const bottom=get(i+di,j+dj)?.h??shore-5;
        if(bottom>=h)continue;
        const [[a,b],[d,e]]=side,dark=color(themeColors[1],shade*(di>0?.90:.96));
        const edge=h-(lake?.28:.78);
        if(bottom<edge)face([[a,edge,b],[a,bottom,b],[d,bottom,e],[d,edge,e]],n,dark);
        face([[a,h,b],[a,Math.max(edge,bottom),b],[d,Math.max(edge,bottom),e],[d,h,e]],n,color(rgb,shade*.82));
      }
      const roll=rand(),score=sampled==="forest"?.57:sampled==="coast"?.76:sampled==="dry"?.993:.87;
      if(!lake&&!path&&Math.abs(x)+Math.abs(z)>7&&roll>score)treeData.push({x,z,h,sampled,scale:.65+rand()*.74});
      else if(!lake&&!path&&roll<.045&&h>water+2)rocks.push({x,z,h,scale:.56+rand()*.91,color:themeColors[1]});
    }
    const geo=new T.BufferGeometry();
    geo.setAttribute("position",new T.Float32BufferAttribute(positions,3));
    geo.setAttribute("normal",new T.Float32BufferAttribute(normals,3));
    geo.setAttribute("color",new T.Float32BufferAttribute(colors,3));
    scene.add(new T.Mesh(geo,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})));
    const sea=new T.Mesh(new T.PlaneGeometry(N*step,N*step),new T.MeshPhongMaterial({color:0x3a8b9d,specular:0x84adb5,shininess:45}));
    sea.rotation.x=-Math.PI/2;sea.position.y=water+.052;scene.add(sea);
    const trunks=new T.InstancedMesh(box,new T.MeshLambertMaterial(),treeData.length);
    const canopy=new T.InstancedMesh(box,new T.MeshLambertMaterial(),treeData.length*3);
    const dummy=new T.Object3D();
    function set(inst,i,x,y,z,w,h,d,c){
      dummy.position.set(x,y,z);dummy.scale.set(w,h,d);dummy.updateMatrix();
      inst.setMatrixAt(i,dummy.matrix);inst.setColorAt(i,new T.Color(c));
    }
    for(const [i,{x,z,h,scale:s,sampled}] of treeData.entries()){
      const pine=sampled==="snow"||i%3===0;
      set(trunks,i,x,h+1.33*s,z,.43*s,2.66*s,.48*s,0x704d35);
      for(let layer=0;layer<3;layer++){
        const w=(pine?2.36-layer*.61:layer===1?2.73:2.13)*s;
        const tint=(pine?[0x315548,0x4c7047,sampled==="snow"?0xabbfb8:0x72934c]:[0x496e3c,0x648745,0x7b984c])[layer];
        set(canopy,i*3+layer,x+(layer===1?.19*s:0),h+(2.46+layer*.80)*s,z,w,(pine?1.25:1.12)*s,w*.94,tint);
      }
    }
    scene.add(trunks,canopy);
    const boulders=new T.InstancedMesh(box,new T.MeshLambertMaterial(),rocks.length);
    for(const [i,{x,z,h,scale:s,color}] of rocks.entries())set(boulders,i,x,h+.26*s,z,1.13*s,.66*s,.93*s,color);
    scene.add(boulders);
    const lookout=cells.filter(c=>c.h>water+4&&Math.abs(c.x)+Math.abs(c.z)<51&&Math.abs(c.z-routeZ(c.x))<9)
      .sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[2];
    if(lookout){
      const structure=new T.Group();structure.position.set(lookout.x,lookout.h,lookout.z);
      const add=(x,y,z,w,h,d,rgb)=>{
        const part=new T.Mesh(box,new T.MeshLambertMaterial({color:rgb}));
        part.position.set(x,y,z);part.scale.set(w,h,d);structure.add(part);
      };
      add(0,.35,0,3.1,.70,2.83,0x72756b);
      for(const x of [-1.04,1.04])for(const z of [-.91,.91])add(x,1.67,z,.37,2.86,.36,0x6c4f39);
      add(0,2.58,0,2.53,.30,2.30,0x987856);
      add(0,3.85,0,2.86,.29,2.45,0x965b46);
      add(0,4.13,0,2.36,.27,1.98,0xb4714b);
      add(0,4.41,0,1.72,.25,1.55,0xc48355);
      for(const x of [-.91,.91])add(x,2.85,.97,.14,.32,.12,0x6d5140);
      add(0,3.01,.98,2.0,.14,.18,0x6d5140);
      add(.26,4.88,0,.109,.94,.117,0x6b4b3b);
      add(.54,5.17,0,.46,.29,.045,0xc98a4c);
      scene.add(structure);
    }
    const sky=0x91b9c8;
    scene.background=new T.Color(sky);scene.fog=new T.Fog(sky,74,188);
    scene.add(new T.HemisphereLight(0xd7eff6,0x545746,1.20));
    const sun=new T.DirectionalLight(0xffd8a2,1.36);
    sun.position.set(-65,76,-38);scene.add(sun);
    const clouds=new T.InstancedMesh(box,new T.MeshLambertMaterial({color:0xf4f7df}),32);
    for(let i=0;i<32;i++){
      const band=Math.floor(i/4),x=(band%4-1.5)*45+(i%4)*5,z=(Math.floor(band/4)-.5)*77+Math.sin(band+i*.4)*11;
      set(clouds,i,x,focusY+36+(i%4===2?1.7:0)+band%3*4,z,9+i%3*4,1.5+i%2*.8,6+i%4*1.8,0xffffff);
    }
    scene.add(clouds);
    const subject=new T.Vector3();
    function pose(now,aspect,reduced){
      const drift=reduced?0:Math.sin(now*.000053)*.30,phase=angle+drift,span=aspect<1?69:61;
      camera.aspect=aspect;camera.updateProjectionMatrix();
      const x=Math.cos(phase)*span,z=Math.sin(phase)*span;
      const cameraGround=get(Math.round(x/step+half),Math.round(z/step+half))?.h??focusY;
      camera.position.set(x,Math.max(focusY+31,cameraGround+15)+(reduced?0:Math.sin(now*.00039)*1.4),z);
      const offset=aspect>1.12?11:0;
      subject.set(-Math.sin(phase)*offset,focusY-2.9,Math.cos(phase)*offset);
      camera.lookAt(subject);
    }
    return {scene,camera,pose};
  }
  return {create};
})();

