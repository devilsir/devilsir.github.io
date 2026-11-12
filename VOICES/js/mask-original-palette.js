/* Registered module: mask-original-palette */
(function(init){if(window.VoicesModules)window.VoicesModules.define('mask-original-palette',init);else init();})(function(){
  'use strict';
  const V=window.V,M=V.AncestralMask;
  const previousFilters=new WeakMap();
  const color=id=>M.palettes.find(entry=>entry.id===id);
  function filter(model,palette){
    const hue=model==='default'?color(palette)?.hue:0;
    return hue?'hue-rotate('+hue+'deg)':'';
  }
  const combine=(previous,tint)=>previous&&previous!=='none'?previous+' '+tint:tint;
  M.tintPortrait=function(image,model,palette){
    if(!image)return;
    const tint=filter(model,palette);
    if(tint){
      if(!previousFilters.has(image))previousFilters.set(image,image.style.filter);
      image.style.filter=combine(previousFilters.get(image),tint);
    }else if(previousFilters.has(image)){
      image.style.filter=previousFilters.get(image);
      previousFilters.delete(image);
    }
  };

  const frame=M.frame.bind(M);
  M.frame=function(c,row,col,x,y,size,owner=0){
    const look=this.appearance(owner),tint=filter(look.model,look.palette);
    if(!tint)return frame(c,row,col,x,y,size,owner);
    c.save();
    try{
      c.filter=combine(c.filter,tint);
      return frame(c,row,col,x,y,size,owner);
    }finally{c.restore();}
  };

  const label=M.label.bind(M);
  M.label=function(owner){
    const look=this.appearance(owner),base=label(owner);
    return filter(look.model,look.palette)?base+' · '+color(look.palette).name:base;
  };

  const refresh=M.refreshWardrobe.bind(M);
  M.refreshWardrobe=function(...args){
    const result=refresh(...args);
    for(const details of document.querySelectorAll('.historio-wardrobe')){
      const owner=Number(details.dataset.maskPlayer)===1?1:0,look=this.appearance(owner);
      this.tintPortrait(details.querySelector('[data-mask-model="default"] img'),'default',look.palette);
      if(look.model!=='default')continue;
      for(const button of details.querySelectorAll('[data-mask-palette]')){
        button.disabled=false;
        button.setAttribute('aria-pressed',String(button.dataset.maskPalette===look.palette));
      }
      if(!filter(look.model,look.palette))continue;
      const name=(owner?'Ancestral azul':'Ancestral original')+' · '+color(look.palette).name;
      const current=details.querySelector('[data-mask-current]');
      const equipped=details.closest('.historio-shell')?.querySelector('[data-mask-equipped]');
      const status=details.querySelector('.historio-mask-selection');
      if(current)current.textContent=name;
      if(equipped)equipped.textContent=name;
      if(status)status.textContent='Visual equipado: '+name+'. Escolha salva para o jogador '+(owner+1)+'.';
    }
    for(const panel of this.panels)if(panel.canvas.isConnected){
      const look=this.appearance(panel.variant);
      this.tintPortrait(panel.fallback,look.model,look.palette);
    }
    return result;
  };

  const retrofit=M.retrofit.bind(M);
  M.retrofit=function(root=document){
    const result=retrofit(root);
    for(const image of root.querySelectorAll('img[data-mask-kind]')){
      const scope=image.closest('[data-duo-panel-player],[data-world-player]');
      const owner=V.DuoWorld?.enabled()&&(scope?.dataset.duoPanelPlayer??scope?.dataset.worldPlayer)==='1'?1:0;
      const look=this.appearance(owner);
      this.tintPortrait(image,look.model,look.palette);
    }
    return result;
  };
});
