import * as THREE from "three";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import {FBXLoader} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/FBXLoader.js";
import {GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import {clone as cloneSkeleton} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/utils/SkeletonUtils.js";

const textureData={"baseColor":"assets/textures/main_basecolor.png","normal":"assets/textures/main_normal.png","emissive":"assets/textures/main_emissive.png","roughness":"assets/textures/main_roughness.png","metallic":"assets/textures/main_metallic.png"};
const fbxDataUrl="assets/models/timbo_principal.fbx";
;
const fallingGlbData={
  sombrero:"assets/models/sombreroLUCASANIMATED.glb",
  timboGuarana:"assets/models/TIMBOGUARANA.glb",
  timboGordin:"assets/models/TIMBOGUARANAGORDIN.glb"
};
const container=document.getElementById("app");
const status=document.getElementById("status");
let autoRotate=true;
let flipMode=false;
let loadedTextures=[];

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.01,100000);
camera.position.set(0,1.2,6);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.16;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.06;
controls.enablePan=false;
controls.autoRotate=false;

const pivot=new THREE.Group();
scene.add(pivot);
scene.add(new THREE.HemisphereLight(0xffffff,0x293241,1.85));
const key=new THREE.DirectionalLight(0xffffff,3.35);key.position.set(1.8,3.9,8.8);key.castShadow=true;scene.add(key);
const frontFill=new THREE.DirectionalLight(0xfff3ea,2.15);frontFill.position.set(-1.2,1.8,9.6);scene.add(frontFill);
const fill=new THREE.DirectionalLight(0xffddc7,1.65);fill.position.set(.2,1.6,6.2);scene.add(fill);
const rim=new THREE.DirectionalLight(0xc7dcff,1.15);rim.position.set(-4.5,2.5,-4.0);scene.add(rim);
const ground=new THREE.Mesh(new THREE.CircleGeometry(200,96),new THREE.ShadowMaterial({opacity:.20}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

const fallingOverlay=document.getElementById("fallingOverlay");
const fallingScene=new THREE.Scene();
const fallingCamera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.01,10000);
fallingCamera.position.set(0,0,12);
fallingCamera.lookAt(0,0,0);
const fallingRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
fallingRenderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
fallingRenderer.setSize(innerWidth,innerHeight);
fallingRenderer.outputColorSpace=THREE.SRGBColorSpace;
fallingRenderer.toneMapping=THREE.ACESFilmicToneMapping;
fallingRenderer.toneMappingExposure=1.34;
fallingRenderer.shadowMap.enabled=true;
fallingRenderer.shadowMap.type=THREE.PCFSoftShadowMap;
fallingRenderer.domElement.style.pointerEvents="none";
fallingRenderer.domElement.style.position="absolute";
fallingRenderer.domElement.style.inset="0";
fallingOverlay.appendChild(fallingRenderer.domElement);
const fallingLayer=new THREE.Group();
fallingScene.add(new THREE.HemisphereLight(0xffffff,0x263148,2.25));
const fallingKey=new THREE.DirectionalLight(0xffffff,3.2);fallingKey.position.set(-2.2,4.8,7.4);fallingKey.castShadow=true;fallingScene.add(fallingKey);
const fallingFill=new THREE.DirectionalLight(0xffe5d2,2.2);fallingFill.position.set(3.6,2.4,6.2);fallingScene.add(fallingFill);
const fallingRim=new THREE.DirectionalLight(0x9fd8ff,2.0);fallingRim.position.set(0,3.8,-4.5);fallingScene.add(fallingRim);
fallingScene.add(fallingLayer);
let mainModelForRain=null;
let fallingAssetsPromise=null;
let fallingAssets=null;
let fallingActors=[];
let fallingSession=0;
let lastFrameTime=performance.now();

function dataUrlToArrayBuffer(url){
  const base64=url.split(",")[1]||"";
  const binary=atob(base64);
  const bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return bytes.buffer;
}
function pickDataUrl(url){
  const raw=String(url||"");
  if(raw.startsWith("data:"))return raw;
  if(raw.startsWith("blob:"))return raw;
  const clean=raw.replace(/\\/g,"/").toLowerCase();
  if(clean.includes("image_0")||clean.includes("base_color")||clean.includes("basecolor")||clean.endsWith("texture.png"))return textureData.baseColor;
  if(clean.includes("image_2")||clean.includes("normal")||clean.includes("bump"))return textureData.normal;
  if(clean.includes("image_3")||clean.includes("emissive")||clean.includes("emission"))return textureData.emissive;
  if(clean.includes("roughness"))return textureData.roughness;
  if(clean.includes("metallic"))return textureData.metallic;
  return textureData.baseColor;
}
const manager=new THREE.LoadingManager();
manager.setURLModifier(url=>pickDataUrl(url));
manager.onLoad=()=>{status.style.display="none";};

function allMaterials(object,callback){
  object.traverse(child=>{
    if(!child.isMesh)return;
    const mats=Array.isArray(child.material)?child.material:[child.material];
    for(const mat of mats) if(mat) callback(mat,child);
  });
}
function collectTexture(texture){
  if(texture && !loadedTextures.includes(texture)) loadedTextures.push(texture);
}
function polishMaterials(object){
  allMaterials(object,(mat,mesh)=>{
    mesh.castShadow=true;mesh.receiveShadow=true;
    mat.side=THREE.DoubleSide;
    mat.transparent=false;
    mat.alphaTest=0;
    if("roughness" in mat) mat.roughness=.96;
    if("metalness" in mat) mat.metalness=0;
    if("envMapIntensity" in mat) mat.envMapIntensity=.08;
    if("clearcoat" in mat) mat.clearcoat=0;
    if("reflectivity" in mat) mat.reflectivity=.05;
    if("shininess" in mat) mat.shininess=8;
    if(mat.specular && mat.specular.isColor) mat.specular.set(0x111111);
    if(mat.map){mat.map.colorSpace=THREE.SRGBColorSpace;collectTexture(mat.map);}
    if(mat.emissiveMap){mat.emissiveMap.colorSpace=THREE.SRGBColorSpace;mat.emissiveIntensity=0;collectTexture(mat.emissiveMap);}
    if(mat.normalMap){mat.normalScale=new THREE.Vector2(.85,.85);collectTexture(mat.normalMap);}
    if(mat.bumpMap){collectTexture(mat.bumpMap);}
    if(mat.roughnessMap)collectTexture(mat.roughnessMap);
    if(mat.metalnessMap)collectTexture(mat.metalnessMap);
    mat.needsUpdate=true;
  });
}
function applyFlipMode(){
  for(const tex of loadedTextures){
    tex.flipY=flipMode;
    tex.needsUpdate=true;
  }
}
function parseGlbDataUrl(loader,url){
  return new Promise((resolve,reject)=>{
    loader.parse(dataUrlToArrayBuffer(url),"",resolve,reject);
  });
}
function fixFallingUvOrientation(geometry){
  if(!geometry||geometry.userData.fallingUvOrientationFixed)return;
  geometry.userData.fallingUvOrientationFixed=true;
}
function tuneFallingObject(object){
  object.traverse(child=>{
    if(!child.isMesh)return;
    child.castShadow=true;
    child.receiveShadow=true;
    if(child.frustumCulled!==undefined)child.frustumCulled=false;
    const mats=Array.isArray(child.material)?child.material:[child.material];
    for(const mat of mats){
      if(!mat)continue;
      mat.side=THREE.DoubleSide;
      const textures=[mat.map,mat.emissiveMap,mat.normalMap,mat.roughnessMap,mat.metalnessMap,mat.bumpMap,mat.aoMap,mat.alphaMap].filter(Boolean);
      for(const tex of textures){
        tex.flipY=false;
        tex.needsUpdate=true;
      }
      if(mat.map)mat.map.colorSpace=THREE.SRGBColorSpace;
      if(mat.emissiveMap)mat.emissiveMap.colorSpace=THREE.SRGBColorSpace;
      mat.needsUpdate=true;
    }
  });
}
function prepareFallingPrototype(sceneObject,animations,label){
  const sceneClone=cloneSkeleton(sceneObject);
  tuneFallingObject(sceneClone);
  sceneClone.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(sceneClone);
  const size=new THREE.Vector3();
  const center=new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  sceneClone.userData.rainBox={size:size.clone(),center:center.clone(),minY:box.min.y,label};
  return{scene:sceneClone,animations:[...(animations||[])],label};
}
function ensureFallingAsset(key){
  if(!fallingAssets)fallingAssets={};
  if(fallingAssets[key])return Promise.resolve(fallingAssets[key]);
  if(!window.__fallingAssetPromises)window.__fallingAssetPromises={};
  if(!window.__fallingAssetPromises[key]){
    const gltfLoader=new GLTFLoader(manager);
    const labelMap={sombrero:"sombrero",timboGuarana:"timboGuarana",timboGordin:"timboGordin"};
    window.__fallingAssetPromises[key]=parseGlbDataUrl(gltfLoader,fallingGlbData[key]).then(gltf=>{
      const proto=prepareFallingPrototype(gltf.scene,gltf.animations,labelMap[key]||key);
      fallingAssets[key]=proto;
      return proto;
    });
  }
  return window.__fallingAssetPromises[key];
}
function ensureFallingAssets(){
  if(!fallingAssetsPromise){
    fallingAssetsPromise=Promise.all([
      ensureFallingAsset("sombrero"),
      ensureFallingAsset("timboGuarana"),
      ensureFallingAsset("timboGordin")
    ]).then(([sombrero,timboGuarana,timboGordin])=>{
      fallingAssets={sombrero,timboGuarana,timboGordin};
      return fallingAssets;
    });
  }
  return fallingAssetsPromise;
}
function cloneRainSource(proto){
  return cloneSkeleton(proto.scene);
}
function randomBetween(min,max){
  return min+Math.random()*(max-min);
}
function randomItem(list){
  return list[Math.floor(Math.random()*list.length)];
}
function getRainViewMetrics(){
  const distance=Math.max(4,fallingCamera.position.length());
  const vFov=THREE.MathUtils.degToRad(fallingCamera.fov);
  const height=2*Math.tan(vFov/2)*distance;
  return{width:height*fallingCamera.aspect,height,distance};
}
function getRainViewWidth(){
  return getRainViewMetrics().width;
}
function createRainActor(proto,index,total,session){
  const object=cloneRainSource(proto);
  tuneFallingObject(object);
  object.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(object);
  const size=new THREE.Vector3();
  const center=new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const normalized=new THREE.Group();
  object.position.x-=center.x;
  object.position.z-=center.z;
  object.position.y-=box.min.y;
  normalized.add(object);
  const root=new THREE.Group();
  root.add(normalized);
  const scale=1;
  const view=getRainViewMetrics();
  const screenTargetHeight=view.height*(proto.label==="timboGordin"?.28:proto.label==="timboGuarana"?.24:.23);
  normalized.scale.setScalar(screenTargetHeight/Math.max(.001,size.y)*(proto.label==="timboGordin"?randomBetween(.92,1.05):randomBetween(.9,1.12)));
  const width=view.width*.94;
  const slot=(index+.5)/total;
  const x=(slot-.5)*width+randomBetween(-.28,.28);
  const z=randomBetween(-.95,.95);
  const topY=view.height*.66;
  const bottomY=-view.height*.36;
  const groundY=bottomY;
  root.position.set(x,topY+randomBetween(.05,.42)+index*.035,z);
  root.rotation.y=randomBetween(-Math.PI,Math.PI);
  root.rotation.z=randomBetween(-.2,.2);
  root.userData.baseScale=normalized.scale.x;
  root.visible=true;
  fallingLayer.add(root);
  const actor={root,animatedRoot:object,proto,session,mixer:null,currentAction:null,procName:"",procTime:0,procDuration:0,age:0,fallVelocity:randomBetween(-.06,.04),gravity:randomBetween(.42,.72),groundY,landed:false,bounce:randomBetween(.36,.58),spin:randomBetween(-2.4,2.4),swayPhase:randomBetween(0,Math.PI*2),swaySpeed:randomBetween(1.35,2.75),driftX:randomBetween(-.08,.08),driftZ:randomBetween(-.02,.02)};
  if(proto.animations.length){
    actor.mixer=new THREE.AnimationMixer(object);
    actor.mixer.addEventListener("finished",event=>{
      if(actor.session!==fallingSession)return;
      playRandomRainClip(actor);
    });
    playRandomRainClip(actor);
  }else{
    chooseRandomProceduralAction(actor);
  }
  return actor;
}
function playRandomRainClip(actor){
  if(!actor.proto.animations.length)return;
  const clips=actor.proto.animations;
  let clip=randomItem(clips);
  if(actor.currentAction&&clips.length>1){
    for(let i=0;i<5&&actor.currentAction.getClip()===clip;i++)clip=randomItem(clips);
  }
  if(actor.currentAction)actor.currentAction.stop();
  const action=actor.mixer.clipAction(clip,actor.animatedRoot);
  action.reset();
  action.setLoop(THREE.LoopOnce,1);
  action.clampWhenFinished=false;
  action.enabled=true;
  action.fadeIn(.05);
  action.play();
  actor.currentAction=action;
}
function chooseRandomProceduralAction(actor){
  const actions=["balanca","gira","pula","ginga","tomba","trepida"];
  actor.procName=randomItem(actions);
  actor.procTime=0;
  actor.procDuration=randomBetween(1.05,2.45);
}
function updateProceduralActor(actor,delta){
  actor.procTime+=delta;
  actor.age+=delta;
  if(actor.procTime>=actor.procDuration)chooseRandomProceduralAction(actor);
  const t=actor.procTime;
  const s=Math.sin(t*actor.swaySpeed+actor.swayPhase);
  const c=Math.cos(t*actor.swaySpeed*.92+actor.swayPhase);
  if(actor.procName==="balanca"){
    actor.root.rotation.z=s*.42;
    actor.root.rotation.x=c*.18;
  }else if(actor.procName==="gira"){
    actor.root.rotation.y+=delta*(actor.spin||2.2);
    actor.root.rotation.z=s*.16;
  }else if(actor.procName==="pula"){
    actor.root.position.y+=Math.max(0,Math.sin(t*Math.PI*2.4))*delta*1.1;
    actor.root.rotation.z=s*.22;
  }else if(actor.procName==="ginga"){
    actor.root.rotation.y+=Math.sin(t*5.4)*delta*.75;
    actor.root.rotation.z=s*.33;
    actor.root.position.x+=Math.sin(t*4.2+actor.swayPhase)*delta*.18;
  }else if(actor.procName==="tomba"){
    actor.root.rotation.x=Math.sin(Math.min(1,t/actor.procDuration)*Math.PI)*.7;
    actor.root.rotation.y+=delta*.65;
  }else{
    actor.root.rotation.z=(Math.random()-.5)*.2;
    actor.root.rotation.x=(Math.random()-.5)*.12;
  }
}
function updateFallingActors(delta){
  if(!fallingActors.length)return;
  for(const actor of fallingActors){
    if(actor.session!==fallingSession)continue;
    if(actor.mixer)actor.mixer.update(delta);
    else updateProceduralActor(actor,delta);
    actor.root.position.x+=actor.driftX*delta;
    actor.root.position.z+=actor.driftZ*delta;
    actor.root.rotation.y+=actor.spin*delta*.18;
    if(!actor.landed){
      actor.fallVelocity-=actor.gravity*delta;
      actor.root.position.y+=actor.fallVelocity*delta;
      if(actor.root.position.y<=actor.groundY){
        actor.root.position.y=actor.groundY;
        actor.landed=true;
        actor.fallVelocity=randomBetween(1.2,2.8);
      }
    }else{
      actor.fallVelocity-=actor.gravity*delta*.62;
      actor.root.position.y+=actor.fallVelocity*delta;
      if(actor.root.position.y<=actor.groundY){
        actor.root.position.y=actor.groundY;
        actor.fallVelocity=Math.abs(actor.fallVelocity)*actor.bounce;
        if(actor.fallVelocity<.38)actor.fallVelocity=randomBetween(.42,.85);
      }
    }
  }
}
function stopFallingModels(){
  fallingSession++;
  for(const actor of fallingActors){
    if(actor.currentAction)actor.currentAction.stop();
    if(actor.mixer)actor.mixer.stopAllAction();
    fallingLayer.remove(actor.root);
  }
  fallingActors=[]; window.__fallingActorsCount=0;
}
async function startFallingModels(){
  const session=++fallingSession;
  stopFallingModels();
  fallingSession=session;
  const lineup=[
    ...Array.from({length:5},()=>"sombrero"),
    ...Array.from({length:3},()=>"timboGuarana"),
    "timboGordin"
  ];
  for(let i=lineup.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [lineup[i],lineup[j]]=[lineup[j],lineup[i]];
  }
  fallingActors=[];
  const queue=lineup.map((key,index)=>({key,index}));
  const launch=(item)=>{
    ensureFallingAsset(item.key).then(proto=>{
      if(session!==fallingSession)return;
      const actor=createRainActor(proto,item.index,lineup.length,session);
      fallingActors.push(actor); window.__fallingActorsCount=fallingActors.length;
    }).catch(error=>console.error(error));
  };
  queue.filter(item=>item.key!=="timboGordin").forEach(launch);
  setTimeout(()=>{
    if(session!==fallingSession)return;
    queue.filter(item=>item.key==="timboGordin").forEach(launch);
  },450);
}
function fitCameraToObject(object){
  const box=new THREE.Box3().setFromObject(object);
  const size=new THREE.Vector3();
  const center=new THREE.Vector3();
  box.getSize(size);box.getCenter(center);
  object.position.sub(center);
  const maxDim=Math.max(size.x,size.y,size.z)||1;
  const fov=camera.fov*Math.PI/180;
  let distance=Math.abs(maxDim/Math.sin(fov/2))*.72;
  if(!isFinite(distance)||distance<=0)distance=6;
  camera.position.set(0,size.y*.05,distance);
  camera.near=Math.max(.01,distance/1000);
  camera.far=Math.max(1000,distance*100);
  camera.updateProjectionMatrix();
  controls.target.set(0,size.y*.03,0);
  controls.minDistance=Math.max(.05,distance*.35);
  controls.maxDistance=Math.max(10,distance*4.5);
  controls.update();
  ground.position.y=-size.y*.56;
}
async function init(){
  try{
    const loader=new FBXLoader(manager);
    const model=loader.parse(dataUrlToArrayBuffer(fbxDataUrl),"");
    polishMaterials(model);
    mainModelForRain=cloneSkeleton(model);
    pivot.add(model);
    fitCameraToObject(model);
    ensureFallingAsset("sombrero").catch(error=>console.error(error));
    ensureFallingAsset("timboGuarana").catch(error=>console.error(error));
    setTimeout(()=>ensureFallingAsset("timboGordin").catch(error=>console.error(error)),2500);
    setTimeout(()=>{if(status.style.display!=="none")status.style.display="none";},1200);
    animate();
  }catch(error){
    console.error(error);
    status.innerHTML='<div class="error">Não consegui carregar o FBX. Abra com internet ativa para carregar as bibliotecas 3D do Three.js.</div>';
  }
}
const startTime=performance.now();
function animate(){
  requestAnimationFrame(animate);
  const now=performance.now();
  const delta=Math.min(.05,(now-lastFrameTime)/1000||0);
  lastFrameTime=now;
  const seconds=(now-startTime)/1000;
  if(autoRotate)pivot.rotation.y=seconds/8*Math.PI*2;
  updateFallingActors(delta);
  controls.update();
  renderer.render(scene,camera);
  fallingRenderer.render(fallingScene,fallingCamera);
}
const specialButton=document.getElementById("specialButton");
const specialToast=document.getElementById("specialToast");
const clubOverlay=document.getElementById("clubOverlay");
const lightField=document.getElementById("lightField");
const discoBallCanvas=document.getElementById("discoBallCanvas");
const bigMessage=document.getElementById("bigMessage");
const screenFlash=document.getElementById("screenFlash");
const exportRevealButton=document.getElementById("exportRevealButton");
const exportModal=document.getElementById("exportModal");
const closeExport=document.getElementById("closeExport");
const exportUsagePreset=document.getElementById("exportUsagePreset");
const exportFormat=document.getElementById("exportFormat");
const exportPreset=document.getElementById("exportPreset");
const exportWidth=document.getElementById("exportWidth");
const exportHeight=document.getElementById("exportHeight");
const exportFps=document.getElementById("exportFps");
const exportQuality=document.getElementById("exportQuality");
const exportBg=document.getElementById("exportBg");
const generateExport=document.getElementById("generateExport");
const exportProgress=document.getElementById("exportProgress");
const customWidthWrap=document.getElementById("customWidthWrap");
const customHeightWrap=document.getElementById("customHeightWrap");
let toastTimeout=null;
let messageTimeout=null;
let flashTimeout=null;
let exportBusy=false;
let exportUnlocked=false;
const secretState={left:false,right:false,start:0,raf:0};
function showToast(message,duration=1800){
  specialToast.textContent=message;
  specialToast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>specialToast.classList.remove("show"),duration);
}

let clubTimeout=0;
let lightDotsReady=false;
let discoBallAnimationStarted=false;
function normalizeVector(v){
  const len=Math.hypot(v.x,v.y,v.z)||1;
  return{x:v.x/len,y:v.y/len,z:v.z/len};
}
function discoPoint(lat,lon,radius){
  return{x:radius*Math.cos(lat)*Math.sin(lon),y:radius*Math.sin(lat),z:radius*Math.cos(lat)*Math.cos(lon)};
}
function tileNoise(a,b){
  return Math.abs(Math.sin(a*12.9898+b*78.233)*43758.5453)%1;
}
function drawDiscoBallFrame(shift){
  if(!discoBallCanvas)return;
  const ctx=discoBallCanvas.getContext("2d");
  const w=discoBallCanvas.width;
  const h=discoBallCanvas.height;
  const cx=w/2;
  const cy=h/2;
  const r=186;
  ctx.clearRect(0,0,w,h);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx,cy,r+2,0,Math.PI*2);
  ctx.clip();

  const bg=ctx.createRadialGradient(cx-48,cy-52,16,cx,cy,r);
  bg.addColorStop(0,"#fbfbfd");
  bg.addColorStop(.25,"#c9ccd3");
  bg.addColorStop(.5,"#6f7278");
  bg.addColorStop(.76,"#191a1f");
  bg.addColorStop(1,"#050507");
  ctx.fillStyle=bg;
  ctx.fillRect(cx-r-6,cy-r-6,r*2+12,r*2+12);

  const rows=13;
  const gap=2;
  const offsetPx=shift*34;
  for(let row=0;row<rows;row++){
    const y0=-r+(row/rows)*r*2;
    const y1=-r+((row+1)/rows)*r*2;
    const ym=(y0+y1)*0.5;
    const rowHalf=Math.sqrt(Math.max(0,r*r-ym*ym));
    const tileH=Math.max(8,(y1-y0)-gap);
    const tileW=32;
    const pitch=tileW+gap;
    const startX=-rowHalf-pitch*3+(offsetPx%pitch);
    const endX=rowHalf+pitch*3;

    for(let x=startX;x<endX;x+=pitch){
      const x0=Math.max(-rowHalf,x);
      const x1=Math.min(rowHalf,x+tileW);
      if(x1<=x0) continue;
      const mx=(x0+x1)*0.5;
      const nx=mx/r;
      const ny=ym/r;
      const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
      const base=38+nz*118;
      const highlightA=Math.pow(Math.max(0,1-Math.abs(nx+0.58)*4.2-Math.abs(ny+0.10)*1.8),4.0);
      const highlightB=Math.pow(Math.max(0,1-Math.abs(nx-0.02)*5.0-Math.abs(ny-0.98)*5.4),4.0);
      const tint=(Math.sin((mx+offsetPx)*0.045)+1)*0.5;
      const rr=Math.min(255,base+highlightA*120+tint*12);
      const gg=Math.min(255,base+highlightA*110+tint*8);
      const bb=Math.min(255,base+highlightA*130+18);
      const sy=cy+y0+gap*0.5;
      const sx=cx+x0;
      const sw=Math.max(1,x1-x0);

      ctx.beginPath();
      ctx.rect(sx,sy,sw,Math.max(1,tileH));
      ctx.fillStyle=`rgb(${rr|0},${gg|0},${bb|0})`;
      ctx.fill();
      ctx.strokeStyle=`rgba(245,245,248,${0.14+nz*0.26})`;
      ctx.lineWidth=0.9;
      ctx.stroke();

      const shine=Math.max(highlightA*0.9,highlightB*0.85);
      if(shine>0.03){
        ctx.fillStyle=`rgba(255,255,255,${Math.min(0.78,shine*0.75)})`;
        ctx.fill();
      }
    }
  }

  ctx.globalCompositeOperation="screen";
  const leftFlash=ctx.createRadialGradient(cx-100,cy-56,0,cx-100,cy-56,58);
  leftFlash.addColorStop(0,"rgba(255,255,255,1)");
  leftFlash.addColorStop(.18,"rgba(255,255,255,.78)");
  leftFlash.addColorStop(.5,"rgba(255,255,255,.22)");
  leftFlash.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=leftFlash;
  ctx.beginPath();
  ctx.arc(cx-100,cy-56,58,0,Math.PI*2);
  ctx.fill();

  const bottomFlash=ctx.createRadialGradient(cx+4,cy+126,0,cx+4,cy+126,44);
  bottomFlash.addColorStop(0,"rgba(255,255,255,.82)");
  bottomFlash.addColorStop(.42,"rgba(255,255,255,.24)");
  bottomFlash.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=bottomFlash;
  ctx.beginPath();
  ctx.arc(cx+4,cy+126,44,0,Math.PI*2);
  ctx.fill();

  ctx.globalCompositeOperation="source-over";
  const vignette=ctx.createRadialGradient(cx,cy,r*0.34,cx,cy,r+4);
  vignette.addColorStop(0,"rgba(0,0,0,0)");
  vignette.addColorStop(.70,"rgba(0,0,0,.05)");
  vignette.addColorStop(1,"rgba(0,0,0,.5)");
  ctx.fillStyle=vignette;
  ctx.beginPath();
  ctx.arc(cx,cy,r+4,0,Math.PI*2);
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx,cy,r+1,0,Math.PI*2);
  ctx.strokeStyle="rgba(255,255,255,.2)";
  ctx.lineWidth=1.1;
  ctx.stroke();
}
let discoBallStartTime=0;
function startDiscoBallCanvas(){
  if(discoBallAnimationStarted)return;
  discoBallAnimationStarted=true;
  discoBallStartTime=0;
  const cycleMs=420;
  const loop=(time)=>{
    if(!discoBallStartTime) discoBallStartTime=time;
    const elapsed=time-discoBallStartTime;
    const shift=(elapsed%cycleMs)/cycleMs;
    drawDiscoBallFrame(shift);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
function createPartyLights(){
  if(lightDotsReady)return;
  lightDotsReady=true;
  const palette=["#59d7ff","#ff4fd8","#ffd84d","#8e6bff","#53ffb2","#ffffff","#ff7a42"];
  const count=44;
  for(let i=0;i<count;i++){
    const dot=document.createElement("span");
    dot.className="light-dot";
    const size=8+Math.random()*20;
    dot.style.width=`${size}px`;
    dot.style.height=`${size}px`;
    dot.style.left=`${Math.random()*100}%`;
    dot.style.top=`${18+Math.random()*72}%`;
    dot.style.color=palette[i%palette.length];
    dot.style.animationDelay=`${(Math.random()*1.5).toFixed(2)}s`;
    dot.style.animationDuration=`${(1.3+Math.random()*1.6).toFixed(2)}s`;
    dot.style.setProperty("--dx",`${(-120+Math.random()*240).toFixed(0)}px`);
    dot.style.setProperty("--dy",`${(-90+Math.random()*180).toFixed(0)}px`);
    lightField.appendChild(dot);
  }
}
function triggerClubLights(){
  startDiscoBallCanvas();
  createPartyLights();
  clubOverlay.classList.remove("show");
  void clubOverlay.offsetWidth;
  clubOverlay.classList.add("show");
  clearTimeout(clubTimeout);
}
function stopClubLights(){
  clearTimeout(clubTimeout);
  clubOverlay.classList.remove("show");
}
const antonioTracks=[
  {src:"assets/audio/muahaha_pesado.mp3",toast:"MUAHAHAHAHA 😈"},
  {src:"assets/audio/guarana_timbozinho.mp3",toast:"Guaraná Timbózinho ✨"}
];
let antonioTrackIndex=0;
let antonioCurrentAudio=null;
let antonioStopTimeout=0;
function stopAntonioAnimation(){
  stopClubLights();
  stopFallingModels();
  bigMessage.classList.remove("show");
  screenFlash.classList.remove("show");
}
function playAntonioTrack(){
  const track=antonioTracks[antonioTrackIndex%antonioTracks.length];
  antonioTrackIndex++;
  clearTimeout(antonioStopTimeout);
  if(antonioCurrentAudio){
    antonioCurrentAudio.pause();
    antonioCurrentAudio.currentTime=0;
    antonioCurrentAudio.onended=null;
    antonioCurrentAudio.onerror=null;
  }
  const audio=new Audio(track.src);
  antonioCurrentAudio=audio;
  audio.volume=1;
  audio.onended=()=>{
    if(antonioCurrentAudio!==audio)return;
    clearTimeout(antonioStopTimeout);
    antonioStopTimeout=setTimeout(stopAntonioAnimation,1000);
  };
  audio.onerror=()=>{
    if(antonioCurrentAudio!==audio)return;
    clearTimeout(antonioStopTimeout);
    antonioStopTimeout=setTimeout(stopAntonioAnimation,1000);
  };
  audio.play().catch(()=>{
    if(antonioCurrentAudio!==audio)return;
    clearTimeout(antonioStopTimeout);
    antonioStopTimeout=setTimeout(stopAntonioAnimation,1000);
  });
  return track;
}
function triggerAntonioMode(){
  const track=playAntonioTrack();
  triggerClubLights();
  startFallingModels();
  showToast(track.toast,1700);
  bigMessage.classList.add("show");
  screenFlash.classList.add("show");
  clearTimeout(messageTimeout);
  clearTimeout(flashTimeout);
  flashTimeout=setTimeout(()=>screenFlash.classList.remove("show"),340);
}
function unlockExport(){
  if(exportUnlocked)return;
  exportUnlocked=true;
  exportRevealButton.classList.remove("hidden");
  exportRevealButton.classList.add("show");
  showToast("Exportação liberada ✨",2200);
}
function resetSecretHold(){
  secretState.start=0;
  if(secretState.raf){cancelAnimationFrame(secretState.raf);secretState.raf=0;}
}
function watchSecretHold(){
  if(exportUnlocked)return;
  if(!(secretState.left&&secretState.right)){resetSecretHold();return;}
  if(!secretState.start)secretState.start=performance.now();
  const elapsed=performance.now()-secretState.start;
  if(elapsed>=5000){unlockExport();resetSecretHold();return;}
  secretState.raf=requestAnimationFrame(watchSecretHold);
}
addEventListener("keydown",event=>{
  if(event.key==="ArrowLeft") secretState.left=true;
  if(event.key==="ArrowRight") secretState.right=true;
  if(secretState.left&&secretState.right&&!secretState.raf&&!exportUnlocked) watchSecretHold();
});
addEventListener("keyup",event=>{
  if(event.key==="ArrowLeft") secretState.left=false;
  if(event.key==="ArrowRight") secretState.right=false;
  if(!(secretState.left&&secretState.right)) resetSecretHold();
});
addEventListener("blur",()=>{secretState.left=false;secretState.right=false;resetSecretHold();});
function syncCustomSizeVisibility(){
  const custom=exportPreset.value==="custom";
  customWidthWrap.classList.toggle("hidden",!custom);
  customHeightWrap.classList.toggle("hidden",!custom);
}
function setSizePreset(size){
  exportPreset.value=String(size);
  exportWidth.value=size;
  exportHeight.value=size;
  syncCustomSizeVisibility();
}
function setCustomSize(width,height){
  exportPreset.value="custom";
  exportWidth.value=width;
  exportHeight.value=height;
  syncCustomSizeVisibility();
}
function applyUsagePreset(){
  const preset=exportUsagePreset.value;
  if(preset==="manual")return;
  const presets={
    favicon_leve:{format:"gif",size:16,fps:8,quality:"low",bg:"transparent"},
    favicon_padrao:{format:"gif",size:32,fps:10,quality:"medium",bg:"transparent"},
    icone_site:{format:"gif",size:64,fps:12,quality:"medium",bg:"transparent"},
    badge_ui:{format:"gif",size:96,fps:12,quality:"medium",bg:"transparent"},
    sticker_web:{format:"gif",size:128,fps:14,quality:"high",bg:"transparent"},
    preview_site:{format:"webm",size:256,fps:24,quality:"medium",bg:"#0b1020"},
    social_square:{format:"webm",size:512,fps:24,quality:"high",bg:"#0b1020"},
    aba_navegador:{format:"gif",size:32,fps:8,quality:"low",bg:"transparent"},
    whatsapp:{format:"gif",size:256,fps:12,quality:"high",bg:"transparent"},
    discord_emoji:{format:"gif",size:64,fps:12,quality:"high",bg:"transparent"},
    loader_site:{format:"gif",size:96,fps:14,quality:"medium",bg:"transparent"},
    portfolio_thumb:{format:"webm",width:640,height:360,fps:24,quality:"high",bg:"#0b1020"}
  };
  const cfg=presets[preset];
  if(!cfg)return;
  exportFormat.value=cfg.format;
  exportFps.value=String(cfg.fps);
  exportQuality.value=cfg.quality;
  exportBg.value=cfg.bg;
  if(cfg.size) setSizePreset(cfg.size);
  else if(cfg.width&&cfg.height) setCustomSize(cfg.width,cfg.height);
  exportProgress.textContent=`Preset aplicado: ${exportUsagePreset.options[exportUsagePreset.selectedIndex].text}`;
}
function loadExternalScript(src){
  return new Promise((resolve,reject)=>{
    if(document.querySelector(`script[data-src="${src}"]`))return resolve();
    const script=document.createElement("script");
    script.src=src;
    script.async=true;
    script.dataset.src=src;
    script.onload=()=>resolve();
    script.onerror=()=>reject(new Error("Não consegui carregar a biblioteca externa."));
    document.head.appendChild(script);
  });
}
async function ensureGifLib(){
  if(window.GIF)return window.GIF;
  await loadExternalScript("https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.js");
  if(!window.GIF)throw new Error("Biblioteca de GIF indisponível.");
  return window.GIF;
}
async function getGifWorkerUrl(){
  if(window.__gifWorkerUrl)return window.__gifWorkerUrl;
  const response=await fetch("https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.worker.js");
  if(!response.ok)throw new Error("Não consegui baixar o worker do GIF.");
  const code=await response.text();
  const blob=new Blob([code],{type:"application/javascript"});
  window.__gifWorkerUrl=URL.createObjectURL(blob);
  return window.__gifWorkerUrl;
}
function getExportConfig(){
  let width=64;
  let height=64;
  if(exportPreset.value==="custom"){
    width=Math.round(Number(exportWidth.value));
    height=Math.round(Number(exportHeight.value));
  }else{
    width=Number(exportPreset.value);
    height=Number(exportPreset.value);
  }
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<16||height<16||width>2048||height>2048)throw new Error("Escolhe um tamanho válido entre 16 e 2048 px.");
  return {
    format:exportFormat.value,
    width,
    height,
    fps:Number(exportFps.value),
    quality:exportQuality.value,
    bg:exportBg.value,
    duration:8
  };
}
function getQualityProfile(level,width,height){
  const areaScale=Math.max(1,(width*height)/(128*128));
  const profiles={
    low:{gifQuality:20,gifWorkers:2,videoBitrate:Math.round(420000*areaScale)},
    medium:{gifQuality:12,gifWorkers:2,videoBitrate:Math.round(900000*areaScale)},
    high:{gifQuality:7,gifWorkers:4,videoBitrate:Math.round(1800000*areaScale)}
  };
  return profiles[level]||profiles.medium;
}
function preferredMimeType(){
  const types=["video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];
  for(const type of types){
    if(window.MediaRecorder&&MediaRecorder.isTypeSupported(type))return type;
  }
  return "video/webm";
}
function setExportUI(message,busy=false){
  exportProgress.textContent=message;
  generateExport.disabled=busy;
  specialButton.disabled=busy;
  closeExport.disabled=busy;
  exportBusy=busy;
}
function downloadBlob(blob,fileName){
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement("a");
  anchor.href=url;
  anchor.download=fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function createExportRenderer(width,height,bg){
  const canvas=document.createElement("canvas");
  const exportRenderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
  exportRenderer.setPixelRatio(1);
  exportRenderer.setSize(width,height,false);
  exportRenderer.outputColorSpace=renderer.outputColorSpace;
  exportRenderer.toneMapping=renderer.toneMapping;
  exportRenderer.toneMappingExposure=renderer.toneMappingExposure;
  if(bg==="transparent")exportRenderer.setClearColor(0x000000,0);
  else exportRenderer.setClearColor(bg,1);
  return {canvas,exportRenderer};
}
function createExportCamera(width,height){
  const exportCamera=camera.clone();
  exportCamera.aspect=width/height;
  exportCamera.updateProjectionMatrix();
  return exportCamera;
}
async function exportGif(config){
  const GIF=await ensureGifLib();
  const workerScript=await getGifWorkerUrl();
  const profile=getQualityProfile(config.quality,config.width,config.height);
  const {canvas,exportRenderer}=createExportRenderer(config.width,config.height,config.bg);
  const exportCamera=createExportCamera(config.width,config.height);
  const gifOptions={workers:profile.gifWorkers,quality:profile.gifQuality,width:config.width,height:config.height,workerScript};
  if(config.bg!=="transparent")gifOptions.background=config.bg;
  if(config.bg==="transparent")gifOptions.transparent=0x000000;
  const gif=new GIF(gifOptions);
  const totalFrames=Math.max(1,Math.round(config.duration*config.fps));
  const originalAutoRotate=autoRotate;
  const originalRotation=pivot.rotation.y;
  autoRotate=false;
  try{
    for(let i=0;i<totalFrames;i++){
      pivot.rotation.y=(i/totalFrames)*Math.PI*2;
      exportRenderer.render(scene,exportCamera);
      gif.addFrame(canvas,{copy:true,delay:1000/config.fps});
      if(i%4===0){
        setExportUI(`Montando GIF... ${Math.round((i/totalFrames)*55)}%`,true);
        await new Promise(resolve=>setTimeout(resolve,0));
      }
    }
  }finally{
    pivot.rotation.y=originalRotation;
    autoRotate=originalAutoRotate;
    exportRenderer.dispose();
  }
  return await new Promise((resolve,reject)=>{
    gif.on("progress",value=>setExportUI(`Gerando GIF... ${55+Math.round(value*45)}%`,true));
    gif.on("finished",resolve);
    try{gif.render();}catch(error){reject(error);}
  });
}
async function exportWebm(config){
  if(!window.MediaRecorder)throw new Error("Seu navegador não suporta exportação de vídeo WEBM.");
  const profile=getQualityProfile(config.quality,config.width,config.height);
  const {canvas,exportRenderer}=createExportRenderer(config.width,config.height,config.bg);
  const exportCamera=createExportCamera(config.width,config.height);
  const stream=canvas.captureStream(config.fps);
  const mimeType=preferredMimeType();
  const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:profile.videoBitrate});
  const chunks=[];
  recorder.ondataavailable=event=>{if(event.data&&event.data.size)chunks.push(event.data);};
  const stopPromise=new Promise((resolve,reject)=>{
    recorder.onerror=event=>reject(event.error||new Error("Falha ao gravar o vídeo."));
    recorder.onstop=()=>resolve(new Blob(chunks,{type:mimeType}));
  });
  const totalFrames=Math.max(1,Math.round(config.duration*config.fps));
  const originalAutoRotate=autoRotate;
  const originalRotation=pivot.rotation.y;
  autoRotate=false;
  recorder.start(250);
  try{
    for(let i=0;i<totalFrames;i++){
      pivot.rotation.y=(i/totalFrames)*Math.PI*2;
      exportRenderer.render(scene,exportCamera);
      setExportUI(`Gravando vídeo... ${Math.round(((i+1)/totalFrames)*100)}%`,true);
      await new Promise(resolve=>setTimeout(resolve,1000/config.fps));
    }
  }finally{
    pivot.rotation.y=originalRotation;
    autoRotate=originalAutoRotate;
  }
  recorder.stop();
  const blob=await stopPromise;
  stream.getTracks().forEach(track=>track.stop());
  exportRenderer.dispose();
  return blob;
}
async function runExport(){
  if(exportBusy)return;
  try{
    exportModal.classList.add("show");
    const config=getExportConfig();
    setExportUI(`Preparando ${config.format.toUpperCase()}...`,true);
    let blob;
    let ext;
    if(config.format==="gif"){
      blob=await exportGif(config);
      ext="gif";
    }else{
      blob=await exportWebm(config);
      ext="webm";
    }
    const qualityLabel={low:"low",medium:"med",high:"high"}[config.quality]||config.quality;
    const fileName=`lucas3dface_360_8s_${config.width}x${config.height}_${qualityLabel}.${ext}`;
    downloadBlob(blob,fileName);
    setExportUI(`Pronto: ${fileName}`,false);
    showToast("Arquivo gerado com sucesso ✨",2200);
  }catch(error){
    console.error(error);
    setExportUI(error.message||"Rolou um erro ao exportar.",false);
    showToast("Não consegui exportar 😵",2200);
  }
}
specialButton.addEventListener("click",triggerAntonioMode);
exportRevealButton.addEventListener("click",()=>exportModal.classList.toggle("show"));
closeExport.addEventListener("click",()=>{if(!exportBusy)exportModal.classList.remove("show");});
generateExport.addEventListener("click",runExport);
exportUsagePreset.addEventListener("change",applyUsagePreset);
exportPreset.addEventListener("change",()=>{syncCustomSizeVisibility(); if(exportUsagePreset.value!=="manual") exportUsagePreset.value="manual";});
[exportFormat,exportFps,exportQuality,exportBg,exportWidth,exportHeight].forEach(el=>el.addEventListener("change",()=>{if(exportUsagePreset.value!=="manual") exportUsagePreset.value="manual";}));
syncCustomSizeVisibility();
applyUsagePreset();
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();fallingCamera.aspect=innerWidth/innerHeight;fallingCamera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);fallingRenderer.setSize(innerWidth,innerHeight);});

function animateBrowserFavicon(){
  const frames=["assets/images/favicon.png","assets/images/asset_015_a17301b9.png","assets/images/asset_016_3496cf85.png","assets/images/asset_017_060851aa.png","assets/images/asset_018_a139c47d.png","assets/images/asset_019_ea3401e7.png","assets/images/asset_020_79984085.png","assets/images/asset_021_cb1814e4.png","assets/images/asset_022_585b7aeb.png","assets/images/asset_023_bf5a6d12.png","assets/images/asset_024_22a61ce5.png","assets/images/asset_025_29984d62.png","assets/images/asset_026_b8496a20.png","assets/images/asset_027_fc0c97d9.png","assets/images/asset_028_125b5ceb.png","assets/images/asset_029_ef98040a.png","assets/images/asset_030_cd75b0dd.png","assets/images/asset_031_9002bd34.png","assets/images/asset_032_58048fea.png","assets/images/asset_033_c410109b.png","assets/images/asset_034_ccf55cea.png","assets/images/asset_035_22dc23c8.png","assets/images/asset_036_6d97304c.png","assets/images/asset_037_045179e8.png","assets/images/asset_038_6ab98099.png","assets/images/asset_039_70ec8196.png","assets/images/asset_040_5b745118.png","assets/images/asset_041_1382efdc.png","assets/images/asset_042_0838f5a4.png","assets/images/asset_043_00c95985.png","assets/images/asset_044_c3fd10d8.png","assets/images/asset_045_dd366cb2.png","assets/images/asset_046_3830f197.png","assets/images/asset_047_1ff5d20a.png","assets/images/asset_048_e404be8a.png","assets/images/asset_049_bce77cf3.png","assets/images/asset_050_33a86818.png","assets/images/asset_051_5c69014a.png","assets/images/asset_052_2b379267.png","assets/images/asset_053_9d24fda8.png","assets/images/asset_054_539c0eb5.png","assets/images/asset_055_1fa90de2.png","assets/images/asset_056_1232db54.png","assets/images/asset_057_e8f74da4.png","assets/images/asset_058_d7f509c0.png","assets/images/asset_059_e4a8e618.png","assets/images/asset_060_c5092bcb.png","assets/images/asset_061_a98a9b8e.png","assets/images/asset_062_7cc13214.png","assets/images/asset_063_00a21ec5.png","assets/images/asset_064_a25d6f7d.png","assets/images/asset_065_4f8386aa.png","assets/images/asset_066_44be67ae.png","assets/images/asset_067_441927f1.png","assets/images/asset_068_b7b2a0cb.png","assets/images/asset_069_160a4cc2.png","assets/images/asset_070_71d9add4.png","assets/images/asset_071_bae980c5.png","assets/images/asset_072_1344036c.png","assets/images/asset_073_940b1b6d.png","assets/images/asset_074_cb59d00b.png","assets/images/asset_075_d32ff114.png","assets/images/asset_076_513262e2.png","assets/images/asset_077_5a2450fd.png","assets/images/asset_078_29200a7e.png","assets/images/asset_079_f117d0cb.png","assets/images/asset_080_4507f456.png","assets/images/asset_081_3606a7c0.png","assets/images/asset_082_94e05f0b.png","assets/images/asset_083_1644c9b0.png","assets/images/asset_084_245889ea.png","assets/images/asset_085_d0ad84d4.png","assets/images/asset_086_8a0d3494.png","assets/images/asset_087_aa54e15d.png","assets/images/asset_088_fc9b7150.png","assets/images/asset_089_17c3ae21.png","assets/images/asset_090_77e4391e.png","assets/images/asset_091_6d8c34a6.png","assets/images/asset_092_f29bd6c2.png","assets/images/asset_093_aae1fffe.png"];
  let link=document.getElementById("animatedFavicon");
  if(!link){
    link=document.createElement("link");
    link.id="animatedFavicon";
    link.rel="icon";
    link.type="image/png";
    document.head.appendChild(link);
  }
  const legacyLinks=[...document.querySelectorAll('link[rel="shortcut icon"],link[rel="alternate icon"]')];
  let index=0;
  const step=100;
  function tick(){
    const href=frames[index];
    link.href=href;
    legacyLinks.forEach(item=>{item.type="image/png";item.href=href;});
    index=(index+1)%frames.length;
    setTimeout(tick,step);
  }
  tick();
}
animateBrowserFavicon();
startDiscoBallCanvas();
init();
