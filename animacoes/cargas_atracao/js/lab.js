(function(){
  'use strict';
  const C=window.Cargas,U=C.util;
  C.lab={
    initialized:false,activeTool:'select',drag:null,measureStart:null,undoStack:[],redoStack:[],lastUi:0,
    init(){
      if(this.initialized)return;this.initialized=true;
      this.stage=new C.CanvasStage(document.getElementById('canvas-lab'));
      this.sim=new C.PhysicsSimulation({mode:'lab'});
      this.renderer=new C.PhysicsRenderer(this.stage,this.sim);
      this.sim.loadScene({test:{x:140,y:270,q:1},target:{x:820,y:270,r:25},objects:[
        {type:'charge',x:350,y:270,q:1.5,fixed:false},{type:'charge',x:610,y:270,q:-1.5,fixed:false},
        {type:'neutral',x:470,y:145,material:'Vidro',fixed:false},{type:'insulator',x:470,y:395,material:'Teflon',fixed:false}
      ],friction:true});
      this.populateMaterials();this.populatePresets();this.bindCanvas();this.bindControls();this.refreshSavedExperiments();this.syncLayers();this.updateInspector();this.updateUi(true);
      this.sim.onTransfer=()=>{C.storage.update(data=>data.stats.frictionTransfers++);C.audio.tone('spark');if(C.storage.data.stats.frictionTransfers>=10)C.app?.unlockAchievement('tribo-scientist');};
      this.sim.onComplete=()=>{C.audio.tone('success');C.ui.toast('Alvo alcançado','A carga-teste permaneceu no alvo com velocidade segura.','success');C.app?.unlockAchievement('first-attraction');};
    },
    defaultSnapshot(){return this.sim.serialize();},
    populateMaterials(){const select=document.getElementById('inspector-material');select.innerHTML=C.data.materials.map(m=>`<option value="${m.name}">${m.name} · ${m.type}</option>`).join('');},
    populatePresets(){const select=document.getElementById('preset-select');select.innerHTML=C.data.presets.map(p=>`<option value="${p.id}">${p.title}</option>`).join('');},
    bindCanvas(){
      const canvas=this.stage.canvas;
      canvas.addEventListener('pointerdown',event=>{event.preventDefault();C.audio.unlock();const point=this.stage.point(event);canvas.setPointerCapture?.(event.pointerId);this.pointerDown(point,event);});
      canvas.addEventListener('pointermove',event=>{if(!this.drag)return;event.preventDefault();this.pointerMove(this.stage.point(event));});
      canvas.addEventListener('pointerup',event=>{event.preventDefault();this.pointerUp();});
      canvas.addEventListener('pointercancel',()=>this.pointerUp());
    },
    pointerDown(point){
      const hit=this.sim.hitTest(point);
      if(this.activeTool==='eraser'){if(hit&&hit.type!=='test'){this.pushHistory();this.sim.selectedId=hit.id;this.sim.removeSelected();C.audio.tone('button');this.updateInspector();this.updateUi(true);}else C.ui.toast('Nada para apagar','Selecione uma carga ou material.');return;}
      if(this.activeTool==='measure'){if(!this.measureStart){this.measureStart=point;C.ui.toast('Primeiro ponto marcado','Toque no segundo ponto para medir a distância.');}else{const d=Math.hypot(point.x-this.measureStart.x,point.y-this.measureStart.y);C.ui.toast('Distância medida',`${Math.round(d)} unidades do laboratório.`);this.measureStart=null;}return;}
      if(['positive','negative','test','neutral','conductor','insulator'].includes(this.activeTool)){
        this.pushHistory();const material=document.getElementById('inspector-material').value||'Vidro';const object=this.sim.addObject(this.activeTool,point.x,point.y,{material});C.storage.update(data=>data.stats.objectsPlaced++);C.audio.tone('place');this.setTool('select');this.updateInspector();this.updateUi(true);if(object)this.drag={id:object.id,offsetX:0,offsetY:0};return;
      }
      if(hit){this.pushHistory();this.sim.selectedId=hit.id;this.drag={id:hit.id,offsetX:point.x-hit.x,offsetY:point.y-hit.y};hit.vx=hit.vy=0;this.updateInspector();this.updateUi(true);}else{this.sim.selectedId=null;this.updateInspector();this.updateUi(true);}
    },
    pointerMove(point){const object=this.sim.allSelectable().find(o=>o.id===this.drag.id);if(!object)return;this.sim.setPosition(object,point.x-this.drag.offsetX,point.y-this.drag.offsetY);this.updateInspectorValues(object);},
    pointerUp(){if(this.drag){this.drag=null;this.sim.dirty=true;}},
    bindControls(){
      document.querySelectorAll('[data-lab-tool]').forEach(button=>button.addEventListener('click',()=>this.setTool(button.dataset.labTool)));
      document.getElementById('lab-play-btn').addEventListener('click',()=>this.togglePlay());
      document.getElementById('lab-step-btn').addEventListener('click',()=>{this.sim.stepOnce();this.updateUi(true);});
      document.getElementById('lab-reset-btn').addEventListener('click',()=>this.resetScene());
      document.getElementById('lab-undo-btn').addEventListener('click',()=>this.undo());
      document.getElementById('lab-redo-btn').addEventListener('click',()=>this.redo());
      document.getElementById('lab-delete-btn').addEventListener('click',()=>this.deleteSelected());
      document.getElementById('lab-duplicate-btn').addEventListener('click',()=>{if(!this.sim.selected)return;this.pushHistory();if(this.sim.duplicateSelected()){C.audio.tone('place');this.updateInspector();this.updateUi(true);}});
      document.getElementById('lab-center-btn').addEventListener('click',()=>{this.stage.resize();C.ui.toast('Visualização centralizada','A escala do canvas foi recalculada.');});
      document.getElementById('lab-speed').addEventListener('change',event=>this.sim.speed=Number(event.target.value)||1);
      document.getElementById('load-preset-btn').addEventListener('click',()=>this.loadPreset(document.getElementById('preset-select').value));
      document.getElementById('save-experiment-btn').addEventListener('click',()=>this.saveExperiment());
      document.getElementById('load-experiment-btn').addEventListener('click',()=>this.loadSavedExperiment());
      document.getElementById('delete-experiment-btn').addEventListener('click',()=>this.deleteSavedExperiment());
      document.querySelectorAll('[id^="layer-"]').forEach(input=>input.addEventListener('change',()=>this.syncLayers(true)));
      document.querySelectorAll('[data-inspector-mode]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-inspector-mode]').forEach(b=>b.classList.toggle('active',b===button));document.getElementById('advanced-fields').classList.toggle('hidden',button.dataset.inspectorMode!=='advanced');}));
      this.bindInspector();
    },
    bindInspector(){
      const form=document.getElementById('inspector-form');let captured=false;
      form.addEventListener('focusin',()=>{if(!captured){this.pushHistory();captured=true;}});form.addEventListener('focusout',event=>{if(!form.contains(event.relatedTarget))captured=false;});
      const apply=()=>this.applyInspector();form.addEventListener('input',apply);form.addEventListener('change',apply);
    },
    applyInspector(){const o=this.sim.selected;if(!o)return;o.name=document.getElementById('inspector-name').value.trim()||o.name;const q=Number(document.getElementById('inspector-charge').value);if(o.type==='charge'||o.type==='test')o.q=Math.abs(q)<.1?(q<0?-.1:.1):q;else o.staticCharge=q;o.material=document.getElementById('inspector-material').value;o.fixed=document.getElementById('inspector-fixed').checked;o.mass=Number(document.getElementById('inspector-mass').value)||o.mass;o.polarizability=Number(document.getElementById('inspector-polar').value)||0;o.x=U.clamp(Number(document.getElementById('inspector-x').value)||o.x,o.r||0,900-(o.r||0));o.y=U.clamp(Number(document.getElementById('inspector-y').value)||o.y,o.r||0,540-(o.r||0));o.vx=Number(document.getElementById('inspector-vx').value)||0;o.vy=Number(document.getElementById('inspector-vy').value)||0;this.updateInspectorValues(o);this.sim.dirty=true;},
    updateInspector(){const o=this.sim.selected;document.getElementById('inspector-empty').classList.toggle('hidden',!!o);document.getElementById('inspector-form').classList.toggle('hidden',!o);document.getElementById('inspector-kind').textContent=o?this.kindLabel(o.type):'nenhum';if(!o)return;this.updateInspectorValues(o);},
    updateInspectorValues(o){if(!o)return;const value=(id,v)=>{const el=document.getElementById(id);if(document.activeElement!==el)el.value=v;};value('inspector-name',o.name||'Objeto');const charge=o.type==='charge'||o.type==='test'?o.q:o.staticCharge||0;value('inspector-charge',charge);document.getElementById('inspector-charge-out').textContent=`${charge>=0?'+':''}${U.formatNumber(charge,1)}`;value('inspector-material',o.material||'Vidro');document.getElementById('inspector-fixed').checked=!!o.fixed;value('inspector-mass',o.mass||1);document.getElementById('inspector-mass-out').textContent=U.formatNumber(o.mass||1,1);value('inspector-polar',o.polarizability||0);document.getElementById('inspector-polar-out').textContent=U.formatNumber(o.polarizability||0,2);value('inspector-x',Math.round(o.x));value('inspector-y',Math.round(o.y));value('inspector-vx',Math.round(o.vx||0));value('inspector-vy',Math.round(o.vy||0));},
    kindLabel(type){return({test:'carga-teste',charge:'carga',neutral:'polarizável',conductor:'condutor',insulator:'isolante'})[type]||type;},
    setTool(tool){this.activeTool=tool;document.querySelectorAll('[data-lab-tool]').forEach(button=>{const active=button.dataset.labTool===tool;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});document.getElementById('lab-tool-status').textContent=`Ferramenta: ${this.toolLabel(tool)}`;},
    toolLabel(tool){return({select:'selecionar',positive:'carga positiva',negative:'carga negativa',test:'carga-teste',neutral:'polarizável',conductor:'condutor',insulator:'isolante',measure:'medir',eraser:'apagar'})[tool]||tool;},
    syncLayers(save=false){const map={resultant:'layer-resultant',individual:'layer-individual',components:'layer-components',field:'layer-field',lines:'layer-lines',heatmap:'layer-heatmap',trajectories:'layer-trajectories',velocity:'layer-velocity',distance:'layer-distance',grid:'layer-grid',labels:'layer-labels',values:'layer-values'};const layers={};for(const [key,id] of Object.entries(map))layers[key]=document.getElementById(id).checked;this.renderer.setLayers(layers);if(save)C.storage.update(data=>data.settings.layers={...layers});},
    togglePlay(force){this.sim.playing=typeof force==='boolean'?force:!this.sim.playing;this.updatePlayButton();C.audio.tone('button');},
    updatePlayButton(){const btn=document.getElementById('lab-play-btn'),status=document.getElementById('lab-status');btn.innerHTML=this.sim.playing?'<span>Ⅱ</span><b>Pausar</b>':'<span>▶</span><b>Iniciar</b>';status.classList.toggle('paused',!this.sim.playing);status.innerHTML=`<i></i> ${this.sim.playing?'Em execução':'Pausada'}`;},
    resetScene(){this.pushHistory();const current=this.sim.serialize();current.test.vx=current.test.vy=0;current.test.x=140;current.test.y=270;for(const o of current.objects){o.vx=o.vy=0;o.trail=[];}this.sim.loadScene(current);this.updateInspector();this.updateUi(true);C.audio.tone('button');},
    pushHistory(){this.undoStack.push(this.sim.serialize());if(this.undoStack.length>40)this.undoStack.shift();this.redoStack=[];this.updateHistoryButtons();},
    undo(){const snap=this.undoStack.pop();if(!snap)return;this.redoStack.push(this.sim.serialize());this.sim.restore(snap);this.updateInspector();this.updateUi(true);this.updateHistoryButtons();},
    redo(){const snap=this.redoStack.pop();if(!snap)return;this.undoStack.push(this.sim.serialize());this.sim.restore(snap);this.updateInspector();this.updateUi(true);this.updateHistoryButtons();},
    updateHistoryButtons(){document.getElementById('lab-undo-btn').disabled=!this.undoStack.length;document.getElementById('lab-redo-btn').disabled=!this.redoStack.length;},
    deleteSelected(){if(!this.sim.selected||this.sim.selected.type==='test'){C.ui.toast('Selecione um objeto','A carga-teste principal não pode ser excluída.');return;}this.pushHistory();if(this.sim.removeSelected()){C.audio.tone('button');this.updateInspector();this.updateUi(true);}},
    loadPreset(id){const preset=C.data.presets.find(p=>p.id===id);if(!preset)return;this.pushHistory();this.sim.loadScene({...preset.scene,title:preset.title});this.undoStack=[];this.redoStack=[];this.updateInspector();this.updateUi(true);C.storage.update(data=>data.experimentsCompleted[id]=true);C.ui.toast('Experimento carregado',preset.objective,'success');C.audio.tone('success');C.app?.checkAchievements();},
    saveExperiment(){const input=document.getElementById('save-experiment-name');const clean=input.value.trim()||`Experimento ${C.storage.data.savedExperiments.length+1}`;C.storage.update(data=>{data.savedExperiments.push({id:U.uid('save'),name:clean,createdAt:new Date().toISOString(),scene:this.sim.serialize()});if(data.savedExperiments.length>20)data.savedExperiments.shift();});input.value='';this.refreshSavedExperiments();C.ui.toast('Experimento salvo',clean,'success');},
    refreshSavedExperiments(){const select=document.getElementById('saved-experiments-select');const list=C.storage.data.savedExperiments;select.innerHTML=list.length?'<option value="">Selecione um experimento</option>'+list.map(item=>`<option value="${item.id}">${C.ui.escape(item.name)}</option>`).join(''):'<option value="">Nenhum experimento salvo</option>';},
    loadSavedExperiment(){const id=document.getElementById('saved-experiments-select').value,item=C.storage.data.savedExperiments.find(x=>x.id===id);if(!item){C.ui.toast('Selecione um experimento');return;}this.pushHistory();this.sim.loadScene(item.scene);this.updateInspector();this.updateUi(true);C.ui.toast('Experimento carregado',item.name,'success');},
    async deleteSavedExperiment(){const id=document.getElementById('saved-experiments-select').value,item=C.storage.data.savedExperiments.find(x=>x.id===id);if(!item)return;if(!await C.ui.confirm(`Excluir “${item.name}”?`,'Excluir experimento'))return;C.storage.update(data=>data.savedExperiments=data.savedExperiments.filter(x=>x.id!==id));this.refreshSavedExperiments();C.ui.toast('Experimento excluído');},
    update(dt){if(!this.initialized)return;this.sim.step(dt);},
    render(now){if(!this.initialized)return;this.renderer.render(now);if(now-this.lastUi>120){this.updateUi();this.lastUi=now;}},
    updateUi(force=false){if(!this.initialized)return;this.updatePlayButton();const count=this.sim.scene.objects.length+1;document.getElementById('lab-object-count').textContent=`${count} ${count===1?'objeto':'objetos'}`;const f=this.sim.forceOn(this.sim.scene.test),speed=Math.hypot(this.sim.scene.test.vx,this.sim.scene.test.vy),sel=this.sim.metricsForSelected();document.getElementById('metric-force').textContent=U.formatNumber(f.magnitude,2);document.getElementById('metric-direction').textContent=U.directionLabel(f.x,f.y);document.getElementById('metric-speed').textContent=U.formatNumber(speed,1);document.getElementById('metric-field').textContent=U.formatNumber(f.magnitude/Math.max(.1,Math.abs(this.sim.scene.test.q)),2);document.getElementById('metric-static').textContent=U.formatNumber(sel.staticCharge,2);document.getElementById('metric-induced').textContent=U.formatNumber(sel.inducedCharge,2);this.updateHistoryButtons();if(force)this.updateInspector();},
    onKey(event){if(C.app?.activeView!=='lab'||document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName))return false;const key=event.key.toLowerCase();if(key===' '){event.preventDefault();this.togglePlay();return true;}if((event.key==='Delete'||event.key==='Backspace')){event.preventDefault();this.deleteSelected();return true;}if((event.ctrlKey||event.metaKey)&&key==='z'){event.preventDefault();event.shiftKey?this.redo():this.undo();return true;}if(key==='r'){event.preventDefault();this.resetScene();return true;}if(key==='f'){event.preventDefault();const input=document.getElementById('layer-resultant');input.checked=!input.checked;this.syncLayers(true);return true;}if(key==='g'){event.preventDefault();const input=document.getElementById('layer-grid');input.checked=!input.checked;this.syncLayers(true);return true;}if(key==='escape'){this.setTool('select');return true;}return false;}
  };
})();
