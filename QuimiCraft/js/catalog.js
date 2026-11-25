
"use strict";

globalThis.QuimiCraftCatalog=(()=>{
  const normalize=text=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const pageSize=18;
  const inCategory=(entry,key)=>key==="all"||entry.category===key||key==="plants"&&entry.plant||key==="npc"&&entry.resident;
  const width=192,height=132;
  const thumbnailBlue=0x14262e;
  const defaultZoom=1.10;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function create({THREE,root,entries,scenery,character,particleQuality,onClose}){
    const grid=root.querySelector(".catalog-grid");
    const pages=root.querySelector(".catalog-pagination");
    const search=root.querySelector("input[type=search]");
    const count=root.querySelector(".catalog-count");
    const prev=root.querySelector("[data-page=prev]");
    const next=root.querySelector("[data-page=next]");
    const categories=[...root.querySelectorAll("[data-category]")];
    const blockFilters=root.querySelector(".catalog-block-filters"),blockButtons=[...root.querySelectorAll("[data-block-filter]")];
    const inspector=root.querySelector(".catalog-inspector");
    const poster=inspector.querySelector(".catalog-poster");
    const live=inspector.querySelector(".catalog-live-view");
    const status=inspector.querySelector(".catalog-view-status");
    const controls=inspector.querySelector(".catalog-model-controls");
    const help=inspector.querySelector("#catalogModelHelp");
    const view2D=inspector.querySelector('[data-view="2d"]');
    const view3D=inspector.querySelector('[data-view="3d"]');
    const zoomIn=inspector.querySelector('[data-zoom="in"]');
    const zoomOut=inspector.querySelector('[data-zoom="out"]');
    const compare=inspector.querySelector("#catalogCompare"),compareControl=compare.closest("label");
    const animationControls=inspector.querySelector(".catalog-animation-controls");
    const animationSelect=inspector.querySelector("#catalogAnimation");
    const animationToggle=inspector.querySelector("[data-animation-toggle]");
    const noteLinks=inspector.querySelector("#catalogClues"),noteBack=inspector.querySelector("[data-note-back]");
    const cache=new Map();
    const byKey=new Map(),noteHistory=[];
    let list=null,active=false,category="all",blockFilter="all",page=0,revision=0,studio=null,failed=false,returnTo=null;
    let inspection=null,resumeThumbnails=null,viewFrame=0;

    function createStudio(){
      const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
      renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=.92;
      renderer.shadowMap.autoUpdate=false;
      const scene=new THREE.Scene();
      scene.background=new THREE.Color();
      const ambient=new THREE.HemisphereLight(0xecf5ff,0x3d5262,.78);
      const key=new THREE.DirectionalLight(0xfff2da,1.02);
      const fill=new THREE.DirectionalLight(0xc6ddf1,.24);
      key.position.set(-3,5,-3);fill.position.set(3,2,4);
      key.shadow.mapSize.set(1024,1024);
      Object.assign(key.shadow.camera,{left:-4.1,right:4.1,top:4.1,bottom:-4.1,near:.5,far:18});
      key.shadow.camera.updateProjectionMatrix();
      key.shadow.normalBias=.016;key.shadow.bias=-.00035;
      scene.add(ambient,key,fill,key.target);
      const camera=new THREE.OrthographicCamera(-2,2,1.5,-1.5,.03,70);
      const splashes=QuimiCraftAquatic.createSplashEffects(THREE,scene,particleQuality);
      return {renderer,scene,camera,ambient,key,fill,splashes};
    }
    function getStudio(){
      if(failed||studio?.renderer.getContext().isContextLost())return null;
      if(!studio){
        try{studio=createStudio()}catch{failed=true;return null}
      }
      return studio;
    }
    function addModel(entry){
      const context=getStudio();
      if(!context)return null;
      const object=entry.model();
      if(!object)return null;
      const box=new THREE.Box3().setFromObject(object);
      if(box.isEmpty()){
        entry.release?.(object);
        return null;
      }
      const center=box.getCenter(new THREE.Vector3()),radius=Math.max(.08,box.max.distanceTo(center));
      const angle=new THREE.Vector3(...entry.angle).normalize();
      const vehicle=entry.category==="vehicle";
      const model={object,box,center,radius,angle,baseY:object.position.y,landscape:false,
        subject:!!entry.compare||vehicle,vehicle,aquatic:entry.category==="aquatic"};
      context.scene.add(object);
      setStage(entry,model,false);
      return model;
    }
    function setStage(entry,model,landscape,clip){
      const context=studio,{object,box,center,radius}=model;
      if(model.stage)context.scene.remove(model.stage);
      model.stage=null;
      model.aquatic=entry.category==="aquatic"||object.userData.creatureType==="pink_boto"&&["swim","spout","breach"].includes(clip);
      delete object.userData.previewWaterSurface;
      model.landscape=landscape;
      context.scene.background.setHex(landscape?0xaec9d2:thumbnailBlue);
      context.scene.fog=null;
      context.ambient.color.setHex(0xecf5ff);
      const lighting=entry.lighting;
      context.ambient.intensity=lighting?.ambient??(landscape?.58:.71);
      context.key.intensity=lighting?.key??(landscape?1.06:.96);
      context.fill.intensity=lighting?.fill??(landscape?.27:.24);
      context.fill.color.setHex(lighting?.rim??0xc6ddf1);
      context.renderer.shadowMap.enabled=context.key.castShadow=landscape;
      if(landscape){
        context.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
        context.landscapes??={};
        const habitat=model.aquatic?"water":model.subject?"forest":"display";
        model.stage=context.landscapes[habitat]??=scenery(habitat);
        model.floor=model.aquatic?box.max.y+Math.max(1.2,Math.min(2.6,radius*.45)):model.subject&&!model.vehicle?0:box.min.y-.008;
        model.stage.position.set(center.x,model.floor,center.z);
        if(model.aquatic){
          model.waterDepth=Math.max(12,model.floor-box.min.y+Math.max(7,radius*1.2));
          model.stage.userData.setDepth(model.waterDepth);
          object.userData.previewWaterSurface=model.floor;
        }
        object.traverse(part=>{
          if(!part.isMesh)return;
          const solid=!part.material.transparent&&!part.userData.noShadow;
          part.castShadow=part.receiveShadow=solid;
        });
        context.scene.add(model.stage);
        updateStageLighting(model.center,model.radius);
      }else{
        context.key.target.position.set(0,0,0);
        context.key.position.set(-3,5,-3);context.fill.position.set(3,2,4);
      }
    }
    function updateStageLighting(center,radius){
      const {key,fill,renderer}=studio,scale=Math.max(1,radius*.82);
      key.target.position.copy(center);
      key.position.copy(center).addScaledVector(new THREE.Vector3(-4.55,6.7,-3.9),scale);
      fill.position.copy(center).addScaledVector(new THREE.Vector3(3,2,4),scale);
      Object.assign(key.shadow.camera,{left:-3.5*scale,right:3.5*scale,top:3.5*scale,bottom:-3.5*scale,far:22*scale});
      key.shadow.camera.updateProjectionMatrix();
      key.shadow.normalBias=.018;
      renderer.shadowMap.needsUpdate=true;
    }
    function positionComparison(model,direction){
      const {avatar,box,floor,center}=model;
      const side=new THREE.Vector3(direction.z,0,-direction.x).normalize();
      const half=box.getSize(new THREE.Vector3()).multiplyScalar(.5);
      const span=Math.abs(side.x)*half.x+Math.abs(side.z)*half.z;
      const pedestalClearance=model.subject?0:.70*(Math.abs(side.x)+Math.abs(side.z))+.40;
      const gap=Math.max(span+.61,pedestalClearance);
      avatar.position.copy(center).addScaledVector(side,gap);
      avatar.position.y=model.aquatic?Math.min(floor-1.82,center.y-.86):floor-(model.subject?0:.40);
      avatar.rotation.y=Math.atan2(-direction.x,-direction.z);
      return center.clone().lerp(avatar.position,.42);
    }
    function updateComparison(){
      const {model,mode}=inspection;
      if(!model)return;
      if(mode==="3d"&&compare.checked){
        model.avatar??=character();
        studio.scene.add(model.avatar);
      }else if(model.avatar)studio.scene.remove(model.avatar);
      if(model.landscape)updateStageLighting(model.center,model.radius);
      renderView();
    }
    function removeModel(entry,model){
      studio.scene.remove(model.object);
      if(model.stage)studio.scene.remove(model.stage);
      if(model.avatar)studio.scene.remove(model.avatar);
      entry.release?.(model.object);
    }
    function pointCamera(model,direction){
      const {camera}=studio;
      const comparing=model.avatar?.parent===studio.scene;
      const focus=comparing?positionComparison(model,direction):model.center.clone();
      if(model.landscape){
        const rise=Math.max(0,model.object.position.y-model.baseY);
        const avatarCenter=comparing?model.avatar.position.y+.96:0;
        const rest=comparing?THREE.MathUtils.lerp(model.center.y,avatarCenter,.36):model.center.y;
        focus.y=rest+rise*(comparing?.49:.64)+(model.subject?Math.min(.15,model.radius*.40):-model.radius*.12);
        if(model.aquatic){
          if(inspection?.entry&&animationSelect.value==="breach"){
            focus.y=THREE.MathUtils.lerp(model.center.y,model.floor,.68)+rise*.44;
            focus.z+=model.object.position.z*.58;
          }else if(inspection?.entry&&animationSelect.value==="spout")focus.y+=Math.max(.8,model.radius*.33);
          else focus.y-=Math.min(.32,model.radius*.22);
        }
      }
      camera.far=Math.max(70,model.radius*20);
      const distance=model.landscape&&model.aquatic?model.radius+1.8:model.radius*5.6+2;
      camera.position.copy(focus).addScaledVector(direction,distance);
      camera.lookAt(focus);
      camera.updateMatrixWorld(true);
      return focus;
    }
    function showTrees(model,focus,direction){
      if(!model.stage?.userData.trees)return;
      const {x,z}=model.stage.position;
      for(const tree of model.stage.userData.trees){
        const dx=x+tree.position.x-focus.x,dz=z+tree.position.z-focus.z;
        const depth=dx*direction.x+dz*direction.z;
        const across=Math.abs(dx*direction.z-dz*direction.x);
        const visible=depth<=.8||across>tree.userData.crownRadius+model.radius*.72+.58;
        if(tree.visible!==visible){
          tree.visible=visible;
          studio.renderer.shadowMap.needsUpdate=true;
        }
      }
    }
    function draw(w,h,halfH,zoom=1){
      const {renderer,scene,camera}=studio;
      const aspect=w/h;
      if(renderer.domElement.width!==w||renderer.domElement.height!==h)renderer.setSize(w,h,false);
      camera.top=halfH;camera.bottom=-halfH;camera.left=-halfH*aspect;camera.right=halfH*aspect;
      camera.zoom=zoom;
      camera.updateProjectionMatrix();
      renderer.render(scene,camera);
    }
    function snapshot(model,w,h){
      pointCamera(model,model.angle);
      const {min,max}=model.box;
      let xFit=0,yFit=0;
      const corner=new THREE.Vector3();
      for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z]){
        corner.set(x,y,z).applyMatrix4(studio.camera.matrixWorldInverse);
        xFit=Math.max(xFit,Math.abs(corner.x));yFit=Math.max(yFit,Math.abs(corner.y));
      }
      draw(w,h,Math.max(yFit,xFit*h/w,.07)*1.13);
      return studio.renderer.domElement.toDataURL();
    }
    function thumbnail(entry){
      const model=addModel(entry);
      if(!model)return null;
      try{return snapshot(model,width,height)}
      finally{removeModel(entry,model)}
    }
    function renderView(){
      if(viewFrame||inspection?.mode!=="3d")return;
      viewFrame=requestAnimationFrame(now=>{
        viewFrame=0;
        const current=inspection;
        if(current?.mode!=="3d")return;
        if(!getStudio()){
          view3D.disabled=true;
          setView("2d");
          view2D.focus();
          return;
        }
        const scale=Math.min(window.devicePixelRatio||1,2);
        const w=Math.round(live.clientWidth*scale),h=Math.round(live.clientHeight*scale);
        if(!w||!h)return;
        const animate=current.clips&&current.playing;
        const changed=current.clips&&(animate||current.poseDirty);
        if(changed){
          const dt=current.lastFrame===null||!current.playing?0:Math.min(.08,(now-current.lastFrame)/1000);
          current.lastFrame=now;current.elapsed+=dt;
          studio.splashes.update(dt);
          current.entry.animate(current.model.object,animationSelect.value,current.elapsed,dt,studio.splashes.splash);
          current.model.stage?.userData.animate?.(current.elapsed);
          current.poseDirty=false;
        }
        if(current.model.landscape&&changed&&(!animate||now-current.shadowFrame>80)){
          studio.renderer.shadowMap.needsUpdate=true;
          current.shadowFrame=now;
        }
        const {model}=current,direction=new THREE.Vector3().setFromSpherical(current.orbit);
        const comparing=model.avatar?.parent===studio.scene;
        const focus=pointCamera(model,direction);
        if(model.landscape)showTrees(model,focus,direction);
        if(model.aquatic&&model.stage){
          const submerged=studio.camera.position.y<model.floor;
          const oceanColor=new THREE.Color(0x4bade1).convertSRGBToLinear();
          const near=Math.max(8,model.radius*2.5),far=Math.max(32,model.radius*7);
          studio.scene.background.copy(submerged?oceanColor:new THREE.Color(0xaec9d2));
          studio.scene.fog=submerged?new THREE.Fog(oceanColor,near,far):null;
          model.stage.userData.submerge(submerged,submerged?near:100,submerged?far:200,submerged?oceanColor:null);
          studio.ambient.color.setHex(submerged?0x9fe2ff:0xecf5ff);
        }
        const fit=model.aquatic?(comparing?1.15:1.02):comparing?1.38:1.18;
        const closeup=model.aquatic&&!comparing&&model.radius<.35;
        const minimum=comparing?1.92:model.subject?(closeup?.09:1.56):0;
        const spraying=model.aquatic&&animationSelect.value==="spout";
        const jumping=model.aquatic&&animationSelect.value==="breach";
        const half=Math.max(model.radius*(closeup?1.33:fit),minimum,spraying?model.radius*1.65+1.5:jumping?model.radius*1.34+.85:0);
        if(comparing&&current.comparisonAngle!==current.orbit.theta){
          const center=model.center.clone().lerp(model.avatar.position,.42);
          updateStageLighting(center,half);
          current.comparisonAngle=current.orbit.theta;
        }
        draw(w,h,half*Math.max(1,h/w),current.zoom);
        if(animate)renderView();
      });
    }
    function setView(mode){
      if(!inspection)return;
      const is3D=mode==="3d";
      if(is3D&&view3D.disabled)return;
      inspection.mode=mode;
      inspection.drag=null;
      inspection.lastFrame=null;
      view2D.setAttribute("aria-pressed",String(!is3D));
      view3D.setAttribute("aria-pressed",String(is3D));
      live.hidden=controls.hidden=help.hidden=!is3D;
      compareControl.hidden=!is3D||!inspection.model;
      animationControls.hidden=!is3D||!inspection.clips;
      poster.hidden=is3D||!inspection.image;
      status.textContent=inspection.image?"Modelo 3D indisponível.":"Visualização indisponível.";
      status.hidden=is3D||!!inspection.image&&!view3D.disabled;
      if(is3D){
        setStage(inspection.entry,inspection.model,!!scenery,animationSelect.value);
        live.append(studio.renderer.domElement);
        live.focus({preventScroll:true});
      }
      updateComparison();
    }
    function openDetail(entry,trigger){
      if(inspection)return;
      inspection={entry,trigger,model:null,image:null,mode:null,zoom:entry.zoom??defaultZoom,drag:null,elapsed:0,lastFrame:null,shadowFrame:0,poseDirty:true,
        playing:!document.documentElement.classList.contains("reduced-motion")};
      animationToggle.textContent=inspection.playing?"Pausar":"Reproduzir";
      inspector.querySelector("#catalogItemTitle").textContent=entry.name;
      inspector.querySelector("#catalogItemDetail").textContent=entry.detail||"";
      const {story,clue,links}=QuimiCraftCatalogLore.describe(entry,byKey);
      inspector.querySelector("#catalogStory").textContent=story;
      inspector.querySelector("#catalogTrivia").textContent=clue;
      noteLinks.hidden=!links.length;
      noteBack.hidden=!noteHistory.length;
      noteLinks.replaceChildren(...links.map(({key,label})=>{
        const button=document.createElement("button"),target=byKey.get(key);
        button.type="button";button.className="catalog-clue";button.textContent=label;
        button.onclick=()=>{
          noteHistory.push(entry);
          if(noteHistory.length>24)noteHistory.shift();
          followNote(target);
        };
        return button;
      }));
      try{
        inspection.model=addModel(entry);
        if(inspection.model){
          inspection.clips=typeof entry.clips==="function"?entry.clips(inspection.model.object):entry.clips;
          inspection.orbit=new THREE.Spherical().setFromVector3(inspection.model.angle);
          inspection.image=snapshot(inspection.model,768,528);
        }
      }catch(error){console.warn("QuimiCraft catálogo",entry.key,error)}
      animationSelect.replaceChildren(...Object.entries(inspection.clips??{}).map(([id,clip])=>new Option(clip.label,id)));
      inspection.image||=cache.get(entry.key);
      if(!inspection.image){
        try{inspection.image=entry.fallback?.()}
        catch(error){console.warn("QuimiCraft catálogo",entry.key,error)}
      }
      if(inspection.image)poster.src=inspection.image;
      poster.alt="Ilustração de "+entry.name;
      view3D.disabled=!inspection.model;
      zoomIn.disabled=zoomOut.disabled=false;
      inspector.showModal();
      inspector.scrollTop=0;
      setView(inspection.model?"3d":"2d");
    }
    function followNote(entry){
      if(!inspection||!entry)return;
      const trigger=inspection.trigger;
      closeDetail(false,true);
      openDetail(entry,trigger);
    }
    function closeDetail(restoreFocus=true,following=false){
      if(!inspection)return;
      const {entry,trigger,model}=inspection;
      inspection=null;
      studio?.splashes.clear();
      if(viewFrame){cancelAnimationFrame(viewFrame);viewFrame=0}
      inspector.close();
      if(model)removeModel(entry,model);
      live.replaceChildren();
      poster.removeAttribute("src");
      if(restoreFocus&&trigger?.isConnected)trigger.focus({preventScroll:true});
      if(!following){
        noteHistory.length=0;
        if(active&&resumeThumbnails)requestAnimationFrame(resumeThumbnails);
        resumeThumbnails=null;
      }
    }
    function rotate(dx,dy){
      inspection.orbit.theta-=dx;
      inspection.orbit.phi=clamp(inspection.orbit.phi-dy,.07,inspection.model.aquatic?1.80:inspection.model.landscape?1.55:Math.PI-.07);
      renderView();
    }
    function zoom(factor){
      inspection.zoom=clamp(inspection.zoom*factor,.65,2.8);
      zoomIn.disabled=inspection.zoom>=2.8;
      zoomOut.disabled=inspection.zoom<=.65;
      renderView();
    }
    function render(){
      const version=++revision;
      const terms=normalize(search.value).split(/\s+/).filter(Boolean);
      const blocks=category==="block";
      const matches=list.filter(e=>inCategory(e,category)&&(!blocks||blockFilter==="all"||e.blockType===blockFilter)&&terms.every(term=>e.query.includes(term)));
      const totalPages=Math.max(1,Math.ceil(matches.length/pageSize));
      page=Math.min(page,totalPages-1);
      count.textContent=matches.length+" "+(matches.length===1?"registro":"registros");
      pages.textContent=(page+1)+" / "+totalPages;
      prev.disabled=page===0;
      next.disabled=page>=totalPages-1;
      grid.replaceChildren();
      grid.scrollTop=0;
      for(const button of categories)button.setAttribute("aria-pressed",String(button.dataset.category===category));
      if(blockFilters)blockFilters.hidden=!blocks;
      for(const button of blockButtons)button.setAttribute("aria-pressed",String(button.dataset.blockFilter===blockFilter));
      if(!matches.length){
        const blank=document.createElement("p");
        blank.className="catalog-empty";
        blank.textContent="Nenhum registro corresponde à busca.";
        grid.append(blank);
      }
      const queue=[];
      for(const [index,e] of matches.slice(page*pageSize,(page+1)*pageSize).entries()){
        const card=document.createElement("button"),picture=document.createElement("span");
        const image=document.createElement("img"),name=document.createElement("span"),info=document.createElement("span");
        card.type="button";card.className="catalog-entry";
        name.className="catalog-entry-name";info.className="catalog-entry-detail";
        name.id="catalog-entry-"+index;
        card.setAttribute("aria-labelledby",name.id);
        card.setAttribute("aria-haspopup","dialog");
        card.onclick=()=>openDetail(e,card);
        picture.className="catalog-picture";
        image.width=width;image.height=height;image.alt="";
        name.textContent=e.name;info.textContent=e.detail;
        if(cache.has(e.key)){image.src=cache.get(e.key);picture.append(image)}
        else queue.push({e,picture,image});
        card.append(picture,name);
        if(e.detail)card.append(info);
        grid.append(card);
      }
      function work(){
        if(!active||version!==revision||!queue.length)return;
        if(inspection){resumeThumbnails=work;return}
        const {e,picture,image}=queue.shift();
        let src=null;
        try{src=thumbnail(e)||e.fallback?.()}catch(error){console.warn("QuimiCraft catálogo",e.key,error)}
        if(src){
          if(cache.size>=160)cache.delete(cache.keys().next().value);
          cache.set(e.key,src);image.src=src;picture.append(image);
        }
        if(queue.length)requestAnimationFrame(work);
      }
      if(queue.length)requestAnimationFrame(work);
    }
    function open(button){
      if(active)return;
      returnTo=button;
      if(!list){
        list=entries().map(e=>({...e,query:normalize([e.name,e.detail,e.key,e.alias].join(" "))}));
        for(const entry of list)byKey.set(entry.key,entry);
        const label={block:"Blocos",plants:"Plantas",weapon:"Armas",focus:"Artefatos",gear:"Equipamentos"};
        for(const button of categories){
          const key=button.dataset.category;
          if(label[key])button.textContent=label[key]+" ("+list.filter(item=>inCategory(item,key)).length+")";
        }
      }
      active=true;
      root.classList.add("open");root.setAttribute("aria-hidden","false");
      render();search.focus();
    }
    function close(){
      if(!active)return;
      active=false;revision++;
      closeDetail(false);
      root.classList.remove("open");root.setAttribute("aria-hidden","true");
      studio?.renderer.renderLists.dispose();
      onClose();
      returnTo?.focus();
    }
    search.addEventListener("input",()=>{page=0;render()});
    root.querySelector("[data-catalog-close]").onclick=close;
    for(const button of categories)button.onclick=()=>{
      category=button.dataset.category;page=0;render();
    };
    for(const button of blockButtons)button.onclick=()=>{
      blockFilter=button.dataset.blockFilter;page=0;render();
    };
    prev.onclick=()=>{page--;render()};
    next.onclick=()=>{page++;render()};
    inspector.querySelector("[data-inspector-close]").onclick=()=>closeDetail();
    noteBack.onclick=()=>followNote(noteHistory.pop());
    inspector.addEventListener("cancel",event=>{event.preventDefault();closeDetail()});
    view2D.onclick=()=>setView("2d");
    view3D.onclick=()=>setView("3d");
    zoomOut.onclick=()=>zoom(1/1.2);
    zoomIn.onclick=()=>zoom(1.2);
    compare.onchange=()=>{if(inspection){inspection.comparisonAngle=null;updateComparison()}};
    function restartAnimation(){
      if(!inspection?.clips)return;
      studio.splashes.clear();
      if(inspection.model.object.userData.creatureType==="pink_boto"){
        setStage(inspection.entry,inspection.model,!!scenery,animationSelect.value);
      }
      inspection.elapsed=0;inspection.lastFrame=null;inspection.poseDirty=true;inspection.playing=true;
      animationToggle.textContent="Pausar";
      renderView();
    }
    animationSelect.onchange=restartAnimation;
    inspector.querySelector("[data-animation-replay]").onclick=restartAnimation;
    animationToggle.onclick=()=>{
      if(!inspection?.clips)return;
      inspection.playing=!inspection.playing;inspection.lastFrame=null;
      animationToggle.textContent=inspection.playing?"Pausar":"Reproduzir";
      renderView();
    };
    inspector.querySelector("[data-reset-view]").onclick=()=>{
      inspection.orbit.setFromVector3(inspection.model.angle);
      inspection.zoom=inspection.entry.zoom??defaultZoom;zoom(1);
    };
    new ResizeObserver(renderView).observe(live);
    live.addEventListener("pointerdown",event=>{
      if(inspection?.mode!=="3d"||inspection.drag||event.button!==0)return;
      inspection.drag={id:event.pointerId,x:event.clientX,y:event.clientY};
      live.setPointerCapture(event.pointerId);
    });
    live.addEventListener("pointermove",event=>{
      const drag=inspection?.drag;
      if(drag?.id!==event.pointerId)return;
      rotate((event.clientX-drag.x)*.012,(event.clientY-drag.y)*.012);
      drag.x=event.clientX;drag.y=event.clientY;
    });
    live.addEventListener("lostpointercapture",event=>{
      if(inspection?.drag?.id===event.pointerId)inspection.drag=null;
    });
    live.addEventListener("wheel",event=>{
      if(inspection?.mode!=="3d")return;
      event.preventDefault();
      zoom(Math.exp(clamp(-event.deltaY*.0018,-.28,.28)));
    },{passive:false});
    live.addEventListener("keydown",event=>{
      if(inspection?.mode!=="3d")return;
      switch(event.key){
        case "ArrowLeft":rotate(-.18,0);break;
        case "ArrowRight":rotate(.18,0);break;
        case "ArrowUp":rotate(0,-.18);break;
        case "ArrowDown":rotate(0,.18);break;
        case "+":case "=":zoom(1.2);break;
        case "-":zoom(1/1.2);break;
        default:return;
      }
      event.preventDefault();event.stopPropagation();
    });
    root.addEventListener("keydown",event=>{
      if(event.key==="Escape"){
        event.preventDefault();event.stopPropagation();
        if(inspection)closeDetail();else close();
        return;
      }
      if(inspection||event.key!=="Tab")return;
      const last=root.querySelector("button[data-page=next]:enabled")||root.querySelector("button[data-page=prev]:enabled")||
        grid.querySelector(".catalog-entry:last-child")||categories.at(-1);
      const first=root.querySelector("[data-catalog-close]");
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    });
    return {open,close};
  }
  return {create};
})();

