"use strict";

globalThis.QuimiCraftSpectral=(()=>{
  const chance=.05;
  const native=new Set(["wisp","cave_shade","bog_revenant","salt_specter"]);
  const names={wolf:"Lobo Fantasma",opossum:"Saruê Fantasma",anteater:"Tamanduá Fantasma",jaguar:"Onça Fantasma"};
  const isNative=id=>native.has(id);
  const roll=(random=Math.random)=>random()<chance;
  const name=(id,original)=>names[id]??original+" · Fantasma";
  const canHurt=(actor,attack)=>!actor.spectral||attack?.spectralWeapon===true;
  const markAttack=(actor,attack)=>actor?.spectral?{...attack,spirit:true}:attack;
  const wardDamage=(amount,ward)=>Math.ceil(amount*(1-Math.max(0,Math.min(.9,ward))));
  const halos=new WeakMap();

  function halo(THREE,parent,tint,position,width,height,opacity){
    let resources=halos.get(THREE);
    if(!resources){
      const geometry=new THREE.PlaneGeometry(1,1);
      geometry.boundingBox=new THREE.Box3(new THREE.Vector3(),new THREE.Vector3());
      resources={geometry,materials:new Map()};halos.set(THREE,resources);
    }
    const key=tint+":"+opacity;
    if(!resources.materials.has(key)){
      const material=new THREE.ShaderMaterial({
        uniforms:{tint:{value:new THREE.Color(tint)},opacity:{value:opacity}},
        vertexShader:`
          varying vec2 coord;
          void main(){
            coord=uv*2.0-1.0;
            vec4 center=modelViewMatrix*vec4(0.0,0.0,0.0,1.0);
            vec2 size=vec2(length(modelMatrix[0].xyz),length(modelMatrix[1].xyz));
            gl_Position=projectionMatrix*(center+vec4(position.xy*size,0.025,0.0));
          }`,
        fragmentShader:`
          varying vec2 coord;uniform vec3 tint;uniform float opacity;
          void main(){float edge=max(0.0,1.0-dot(coord,coord));
            gl_FragColor=vec4(tint,edge*edge*edge*opacity);}`,
        transparent:true,depthWrite:false,blending:THREE.AdditiveBlending
      });
      resources.materials.set(key,material);
    }
    const mesh=new THREE.Mesh(resources.geometry,resources.materials.get(key));
    mesh.name="Halo fantasmagórico";mesh.position.set(...position);mesh.scale.set(width,height,1);
    mesh.frustumCulled=false;mesh.userData.noShadow=mesh.userData.spectralHalo=true;parent.add(mesh);
    return mesh;
  }

  function glow(THREE,material,tint,strength=1,ghost=false){
    const light=new THREE.Color(tint);
    material.emissive.copy(light);
    material.emissiveIntensity=strength*.63;
    material.onBeforeCompile=shader=>{
      shader.uniforms.spectralTint={value:light};
      shader.uniforms.spectralStrength={value:strength};
      shader.fragmentShader="uniform vec3 spectralTint; uniform float spectralStrength;\n"+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace("#include <output_fragment>",`
        float edge=pow(1.0-clamp(abs(dot(normalize(normal),normalize(vViewPosition))),0.0,1.0),2.25);
        outgoingLight+=spectralTint*spectralStrength*(0.18+edge*1.56);
        ${ghost?"diffuseColor.a*=mix(0.70,1.0,edge);":""}
        #include <output_fragment>`);
    };
    material.customProgramCacheKey=()=>ghost?"spectral-ghost":"spectral-equipment";
    return material;
  }

  function material(THREE,source,node){
    const vertexColors=!!node.geometry.getAttribute("color")&&!!source.vertexColors;
    const color=source.color?.isColor?source.color.clone():new THREE.Color(0x79a6bc);
    color.lerp(new THREE.Color(0x69dfef),.62);
    const base=new THREE.MeshStandardMaterial({
      color,vertexColors,map:source.map??null,bumpMap:source.bumpMap??null,bumpScale:source.bumpScale??1,
      side:source.side,roughness:.55,metalness:.10,
      emissive:new THREE.Color(0x319bbb),emissiveIntensity:.37,transparent:true,
      alphaTest:source.alphaTest,opacity:source.transparent?Math.min(.60,source.opacity):.67,
      depthWrite:!source.transparent,skinning:!!node.isSkinnedMesh,morphTargets:!!source.morphTargets,
      morphNormals:!!source.morphNormals
    });
    return glow(THREE,base,0x40dce9,.61,true);
  }

  function apply(THREE,group){
    const cache=new Map(),resources=new Set();
    group.traverse(node=>{
      if(!node.isMesh)return;
      const convert=source=>{
        if(node.userData.ownMaterial)resources.add(source);
        if(source.isShaderMaterial)return source;
        let variants=cache.get(source);
        if(!variants)cache.set(source,variants=new Map());
        const key=(node.isSkinnedMesh?1:0)+(node.geometry.getAttribute("color")?2:0);
        if(!variants.has(key)){
          const skin=material(THREE,source,node);
          variants.set(key,skin);resources.add(skin);
        }
        return variants.get(key);
      };
      node.material=Array.isArray(node.material)?node.material.map(convert):convert(node.material);
      node.userData.ownMaterial=false;
      node.userData.noShadow=true;
      node.castShadow=false;
      node.receiveShadow=false;
    });
    group.userData.spectralMaterials=resources;
    const bounds=new THREE.Box3().setFromObject(group);
    if(!bounds.isEmpty()){
      const center=group.worldToLocal(bounds.getCenter(new THREE.Vector3()));
      const scale=group.getWorldScale(new THREE.Vector3());
      const size=bounds.getSize(new THREE.Vector3()).divide(scale);
      const width=Math.max(.22,Math.max(size.x,size.z));
      halo(THREE,group,0x42bddd,center.toArray(),width*1.27,Math.max(size.y,width*.38)*1.42,.28);
    }
  }

  function dispose(group){
    for(const material of group.userData.spectralMaterials??[])material.dispose();
  }

  return {chance,names,isNative,roll,name,canHurt,markAttack,wardDamage,glow,halo,apply,dispose};
})();
