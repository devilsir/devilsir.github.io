
"use strict";

globalThis.QuimiCraftCatalog=(()=>{
  const normalize=text=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const pageSize=18;
  const inCategory=(entry,key)=>key==="all"||entry.category===key||key==="plants"&&entry.plant||key==="npc"&&entry.resident;
  const width=192,height=132;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function create({THREE,root,entries,onClose}){
    const grid=root.querySelector(".catalog-grid");
    const pages=root.querySelector(".catalog-pagination");
    const search=root.querySelector("input[type=search]");
    const count=root.querySelector(".catalog-count");
    const prev=root.querySelector("[data-page=prev]");
    const next=root.querySelector("[data-page=next]");
    const categories=[...root.querySelectorAll("[data-category]")];
    const blockFilters=root.querySelector(".catalog-block-filters"),blockButtons=[...root.querySelectorAll("[data-block-filter]")];
    const inspector=root.querySelector(".catalog-inspector");
    const viewer=inspector.querySelector(".catalog-viewer");
    const poster=inspector.querySelector(".catalog-poster");
    const live=inspector.querySelector(".catalog-live-view");
    const status=inspector.querySelector(".catalog-view-status");
    const controls=inspector.querySelector(".catalog-model-controls");
    const help=inspector.querySelector("#catalogModelHelp");
    const view2D=inspector.querySelector('[data-view="2d"]');
    const view3D=inspector.querySelector('[data-view="3d"]');
    const zoomIn=inspector.querySelector('[data-zoom="in"]');
    const zoomOut=inspector.querySelector('[data-zoom="out"]');
    const cache=new Map();
    let list=null,active=false,category="all",blockFilter="all",page=0,revision=0,studio=null,failed=false,returnTo=null;
    let inspection=null,resumeThumbnails=null,viewFrame=0;

    function createStudio(){
      const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
      renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=.92;
      const scene=new THREE.Scene();
      scene.background=new THREE.Color();
      scene.add(new THREE.HemisphereLight(0xecf5ff,0x3d5262,.78));
      const key=new THREE.DirectionalLight(0xfff2da,1.02);
      const fill=new THREE.DirectionalLight(0xc6ddf1,.24);
      key.position.set(-3,5,-3);fill.position.set(3,2,4);
      scene.add(key,fill);
      const camera=new THREE.OrthographicCamera(-2,2,1.5,-1.5,.03,70);
      return {renderer,scene,camera};
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
      context.scene.background.setHex(entry.tint??0xd9e5e5);
      context.scene.add(object);
      return {object,box,center,radius,angle};
    }
    function removeModel(entry,model){
      studio.scene.remove(model.object);
      entry.release?.(model.object);
    }
    function pointCamera(model,direction){
      const {camera}=studio;
      camera.position.copy(model.center).addScaledVector(direction,model.radius*5.6+2);
      camera.lookAt(model.center);
      camera.updateMatrixWorld(true);
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
        const animate=current.entry.animate&&!document.documentElement.classList.contains("reduced-motion");
        if(animate)current.entry.animate(current.model.object,now);
        pointCamera(current.model,new THREE.Vector3().setFromSpherical(current.orbit));
        draw(w,h,current.model.radius*1.10*Math.max(1,h/w),current.zoom);
        if(animate)renderView();
      });
    }
    function setView(mode){
      if(!inspection)return;
      const is3D=mode==="3d";
      if(is3D&&view3D.disabled)return;
      inspection.mode=mode;
      inspection.drag=null;
      view2D.setAttribute("aria-pressed",String(!is3D));
      view3D.setAttribute("aria-pressed",String(is3D));
      live.hidden=controls.hidden=help.hidden=!is3D;
      poster.hidden=is3D||!inspection.image;
      status.textContent=inspection.image?"Modelo 3D indisponível.":"Visualização indisponível.";
      status.hidden=is3D||!!inspection.image&&!view3D.disabled;
      if(is3D){
        live.append(studio.renderer.domElement);
        live.focus({preventScroll:true});
        renderView();
      }
    }
    function openDetail(entry,trigger){
      if(inspection)return;
      inspection={entry,trigger,model:null,image:null,mode:null,zoom:1,drag:null};
      inspector.querySelector("#catalogItemTitle").textContent=entry.name;
      inspector.querySelector("#catalogItemDetail").textContent=entry.detail||"";
      viewer.style.backgroundColor="#"+(entry.tint??0xd9e5e5).toString(16).padStart(6,"0");
      try{
        inspection.model=addModel(entry);
        if(inspection.model){
          inspection.orbit=new THREE.Spherical().setFromVector3(inspection.model.angle);
          inspection.image=snapshot(inspection.model,768,528);
        }
      }catch(error){console.warn("QuimiCraft catálogo",entry.key,error)}
      inspection.image||=cache.get(entry.key);
      if(!inspection.image){
        try{inspection.image=entry.fallback?.()}
        catch(error){console.warn("QuimiCraft catálogo",entry.key,error)}
      }
      if(inspection.image)poster.src=inspection.image;
      poster.alt="Ilustração de "+entry.name;
      view3D.disabled=!inspection.model;
      zoomIn.disabled=zoomOut.disabled=false;
      setView("2d");
      inspector.showModal();
    }
    function closeDetail(restoreFocus=true){
      if(!inspection)return;
      const {entry,trigger,model}=inspection;
      inspection=null;
      if(viewFrame){cancelAnimationFrame(viewFrame);viewFrame=0}
      inspector.close();
      if(model)removeModel(entry,model);
      live.replaceChildren();
      poster.removeAttribute("src");
      if(restoreFocus&&trigger.isConnected)trigger.focus({preventScroll:true});
      if(active&&resumeThumbnails)requestAnimationFrame(resumeThumbnails);
      resumeThumbnails=null;
    }
    function rotate(dx,dy){
      inspection.orbit.theta-=dx;
      inspection.orbit.phi=clamp(inspection.orbit.phi-dy,.07,Math.PI-.07);
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
        }else picture.classList.add("catalog-picture-unavailable");
        if(queue.length)requestAnimationFrame(work);
      }
      if(queue.length)requestAnimationFrame(work);
    }
    function open(button){
      if(active)return;
      returnTo=button;
      if(!list){
        list=entries().map(e=>({...e,query:normalize([e.name,e.detail,e.key,e.alias].join(" "))}));
        const label={block:"Blocos",plants:"Plantas",weapon:"Armas",focus:"Artefatos"};
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
    inspector.addEventListener("cancel",event=>{event.preventDefault();closeDetail()});
    view2D.onclick=()=>setView("2d");
    view3D.onclick=()=>setView("3d");
    zoomOut.onclick=()=>zoom(1/1.2);
    zoomIn.onclick=()=>zoom(1.2);
    inspector.querySelector("[data-reset-view]").onclick=()=>{
      inspection.orbit.setFromVector3(inspection.model.angle);
      inspection.zoom=1;zoom(1);
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

