"use strict";

globalThis.QuimiCraftAvatarPreview = (() => {
  function create(THREE,source,originalRenderer){
    let renderer;
    let rejected=false;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.05,12);
    camera.position.set(0,1.02,-4.35);
    camera.lookAt(0,.99,0);
    const fill=new THREE.HemisphereLight(0xe1f8ff,0x5a4744,.92);
    const key=new THREE.DirectionalLight(0xffedd4,1.06);
    key.position.set(-2,3,-3);
    const rim=new THREE.DirectionalLight(0x93ece4,.47);
    rim.position.set(2,2,3);
    scene.add(fill,key,rim);
    const size=256;

    function duplicate(node){
      const copy=node.isMesh?new THREE.Mesh(node.geometry,node.material):node.isSprite?new THREE.Sprite(node.material):new THREE.Group();
      copy.name=node.name;
      copy.position.copy(node.position);
      copy.quaternion.copy(node.quaternion);
      copy.scale.copy(node.scale);
      copy.visible=node.visible;
      for(const child of node.children)if(child.visible)copy.add(duplicate(child));
      return copy;
    }

    function paint(target){
      if(rejected||!target)return false;
      const surface=target.getContext?.("2d");
      if(!surface)return false;
      let avatar;
      try{
        if(!renderer){
          renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});
          renderer.setPixelRatio(1);
          renderer.setSize(size,size,false);
          renderer.setClearColor?.(0,0);
          renderer.outputEncoding=originalRenderer.outputEncoding;
          renderer.toneMapping=originalRenderer.toneMapping;
          renderer.toneMappingExposure=.91;
        }
        avatar=duplicate(source);
        avatar.visible=true;
        avatar.position.set(0,0,0);
        avatar.rotation.set(0,-.28,0);
        scene.add(avatar);
        renderer.render(scene,camera);
        if(!renderer.domElement?.getContext)return false;
        if(target.width!==size)target.width=size;
        if(target.height!==size)target.height=size;
        surface.clearRect(0,0,size,size);
        surface.drawImage(renderer.domElement,0,0,size,size);
        target.parentElement?.classList.add("avatar-3d-ready");
        return true;
      }catch(error){
        rejected=true;
        console.warn("Prévia 3D indisponível.",error);
        return false;
      }finally{
        if(avatar)scene.remove(avatar);
      }
    }

    return {paint};
  }
  return {create};
})();
