
"use strict";

globalThis.QuimiCraftCatalog=(()=>{
  const normalize=text=>text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const pageSize=18;
  const width=192,height=132;
  function create({THREE,root,entries,onClose}){
    const grid=root.querySelector(".catalog-grid");
    const pages=root.querySelector(".catalog-pagination");
    const search=root.querySelector("input[type=search]");
    const count=root.querySelector(".catalog-count");
    const prev=root.querySelector("[data-page=prev]");
    const next=root.querySelector("[data-page=next]");
    const categories=[...root.querySelectorAll("[data-category]")];
    const cache=new Map();
    let list=null,active=false,category="all",page=0,revision=0,studio=null,failed=false,returnTo=null;

    function createStudio(){
      const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
      renderer.setSize(width,height,false);
      renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=.92;
      const scene=new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xecf5ff,0x3d5262,.78));
      const key=new THREE.DirectionalLight(0xfff2da,1.02);
      const fill=new THREE.DirectionalLight(0xc6ddf1,.24);
      key.position.set(-3,5,-3);fill.position.set(3,2,4);
      scene.add(key,fill);
      const camera=new THREE.OrthographicCamera(-2,2,1.5,-1.5,.03,70);
      return {renderer,scene,camera};
    }
    function thumbnail(entry){
      if(failed)return null;
      if(!studio){
        try{studio=createStudio()}catch{failed=true;return null}
      }
      const {renderer,scene,camera}=studio;
      const object=entry.model();
      if(!object)return null;
      try{
        scene.background=new THREE.Color(entry.tint||0xd9e5e5);
        scene.add(object);
        const box=new THREE.Box3().setFromObject(object);
        if(box.isEmpty())return null;
        const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
        const angle=new THREE.Vector3(...entry.angle).normalize();
        const radius=Math.max(size.x,size.y,size.z,.1);
        camera.position.copy(center).addScaledVector(angle,radius*2.8+2);
        camera.lookAt(center);camera.updateMatrixWorld(true);
        let xFit=0,yFit=0;
        const corner=new THREE.Vector3();
        for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
          corner.set(x,y,z).applyMatrix4(camera.matrixWorldInverse);
          xFit=Math.max(xFit,Math.abs(corner.x));yFit=Math.max(yFit,Math.abs(corner.y));
        }
        const aspect=width/height,halfH=Math.max(yFit,xFit/aspect,.07)*1.13;
        camera.top=halfH;camera.bottom=-halfH;camera.left=-halfH*aspect;camera.right=halfH*aspect;
        camera.updateProjectionMatrix();
        renderer.render(scene,camera);
        return renderer.domElement.toDataURL();
      }finally{
        scene.remove(object);
        entry.release?.(object);
      }
    }
    function render(){
      const version=++revision;
      const query=normalize(search.value);
      const matches=list.filter(e=>(category==="all"||e.category===category)&&e.query.includes(query));
      const totalPages=Math.max(1,Math.ceil(matches.length/pageSize));
      page=Math.min(page,totalPages-1);
      count.textContent=matches.length+" "+(matches.length===1?"registro":"registros");
      pages.textContent=(page+1)+" / "+totalPages;
      prev.disabled=page===0;
      next.disabled=page>=totalPages-1;
      grid.replaceChildren();
      grid.scrollTop=0;
      for(const button of categories)button.setAttribute("aria-pressed",String(button.dataset.category===category));
      if(!matches.length){
        const blank=document.createElement("p");
        blank.className="catalog-empty";
        blank.textContent="Nenhum registro corresponde à busca.";
        grid.append(blank);
      }
      const queue=[];
      for(const e of matches.slice(page*pageSize,(page+1)*pageSize)){
        const card=document.createElement("article"),picture=document.createElement("div");
        const image=document.createElement("img"),name=document.createElement("h3"),info=document.createElement("p");
        card.className="catalog-entry";
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
      if(!list)list=entries().map(e=>({...e,query:normalize([e.name,e.detail,e.key].join(" "))}));
      active=true;
      root.classList.add("open");root.setAttribute("aria-hidden","false");
      render();search.focus();
    }
    function close(){
      if(!active)return;
      active=false;revision++;
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
    prev.onclick=()=>{page--;render()};
    next.onclick=()=>{page++;render()};
    root.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close();return}
      if(event.key!=="Tab")return;
      const last=root.querySelector("button[data-page=next]:enabled")||root.querySelector("button[data-page=prev]:enabled")||categories.at(-1);
      const first=root.querySelector("[data-catalog-close]");
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    });
    return {open,close};
  }
  return {create};
})();

