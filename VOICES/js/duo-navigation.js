/* Shore and boat commands belong to the person using them. */
(function(){
'use strict';
const V=window.V,D=V.DuoWorld,P=V.DuoPanels,N=V.SeaNavigation,M=V.Maritime,X=V.CoastalExploration;
if(!D||V.DuoChallenges.isChild)return;
const copy=value=>value==null?null:JSON.parse(JSON.stringify(value));
const B=V.DuoNavigation={restoring:false,
 enabled(){return D.enabled()&&D.visible&&V.Game.mode==='explore';},
 scene(i=D.context){return D.root?.querySelectorAll('.duo-world-scene')[i]||null;},
 snapshot(i){
  const actor=D.actors[i],spatial=actor?.spatial?.get(N),live=D.context===i,boat=live?N.boat:spatial?.boat,course=live?N.course:spatial?.course;
  if(!boat||boat.map!==actor.map)return null;
  return{map:boat.map,type:boat.type,x:boat.x,y:boat.y,angle:boat.angle,anchored:boat.anchored,returnAt:{...boat.returnAt},course:copy(course)};
 },
 removeGlobalHUD(){for(const el of document.querySelectorAll('#sea-boat-hud'))if(!D.root?.contains(el)||!el.closest('.duo-world-scene'))el.remove();},
 restore(records,legacy){
  if(!this.enabled()||D.context>=0)return;this.restoring=true;
  try{
   // Native solo restoration runs before the split viewers become visible.
   // Clear that temporary state, then restore each boat inside its own actor.
   N.clear(false);this.removeGlobalHUD();
   const snapshots=records.map(p=>copy(p?.boat));
   if(!records.some(p=>p&&Object.hasOwn(p,'boat'))&&legacy){
    const owners=D.actors.map((a,i)=>({i,a,p:records[i]||a.data})).filter(({a})=>a.map===legacy.map).sort((a,b)=>Math.hypot(a.p.x-legacy.x,a.p.y-legacy.y)-Math.hypot(b.p.x-legacy.x,b.p.y-legacy.y));
    if(owners.length)snapshots[owners[0].i]=copy(legacy);
   }
   for(let i=0;i<2;i++)D.withActor(i,()=>{
    N.clear(false);const saved=records[i],boat=snapshots[i];
    if(saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y)&&(!saved.map||saved.map===V.World.current.id))Object.assign(V.Player.data,D.safe(saved,null,V.World.current),{moving:false});
    if(boat&&N.restore(boat,{resume:true})){
     const c=boat.course;N.course=c&&c.map===boat.map&&Number.isInteger(c.index)&&c.index>=0&&c.index<3&&Number.isFinite(c.elapsed)?copy(c):null;N.hud();
    }
    V.World.camera=V.Viewport.target(V.World.current,V.Player.data);
   });
  }finally{this.restoring=false;}
  D.persist();this.refresh();V.Save.save();
 },
 refresh(){
  // Loading and boat actions can call native toolbars inside an actor swap.
  // Refresh after that operation commits its destination and boat state.
  if(!this.enabled()||D.loading||D.context>=0||this.restoring)return;
  this.removeGlobalHUD();
  for(const id of ['sea-world-toolbar','sea-region-info','coastal-toolbar'])document.getElementById(id)?.setAttribute('hidden','');
  for(let i=0;i<2;i++)D.withActor(i,()=>{
   const scene=this.scene(i);if(!scene)return;
   let bar=scene.querySelector('.duo-shore-controls');
   if(!bar){bar=document.createElement('nav');bar.className='duo-shore-controls';bar.setAttribute('aria-label','Navegação e pesca · jogador '+(i+1));
    bar.innerHTML='<button class="secondary" data-shore="chart">⚓ Navegar</button><button class="secondary" data-shore="fish">Desafio de pesca</button><button class="secondary" data-shore="book">Bordo</button>';
    scene.append(bar);for(const button of bar.querySelectorAll('button'))button.onclick=()=>P.withOwner(i,()=>{
     if(button.dataset.shore==='fish')V.FishingChallenge.open();
     else if(button.dataset.shore==='book')M.book();
     else if(X?.isCoast())X.chart();else N.chart();
    });
   }
   bar.hidden=!(V.World.current.maritime||X?.isCoast())||!!N.boat||!!V.SceneEditor.active;
   bar.querySelector('[data-shore="book"]').hidden=!!X?.isCoast();
   if(N.boat){if(!N.hudRoot())N.mount();}
   else N.hudRoot()?.remove();
  });
  document.body.classList.toggle('maritime-sailing',D.actors.some(a=>!!a.spatial?.get(N)?.boat));
 }
};
for(const owner of [M,X])if(owner){const toolbar=owner.toolbar.bind(owner);owner.toolbar=function(...args){if(B.enabled()){B.refresh();return;}return toolbar(...args);};}
const help=N.help.bind(N);N.help=function(...args){const out=help(...args),i=D.context;
 if(B.enabled()&&i>=0){const paragraphs=P.root(i).querySelectorAll('.sea-help-grid article p');
  if(paragraphs[0])paragraphs[0].textContent='Use '+(i?'as setas ↑ ← ↓ →':'W A S D')+' da sua tela. A proa acompanha a direção. O bote tem mais inércia que o barco a remo.';
  if(paragraphs[2])paragraphs[2].textContent='Use o botão Âncora para parar e pescar. Aproxime-se de uma borda livre do cais e use Atracar ou '+(i?'Enter':'E')+'. Os comandos deste painel controlam apenas o seu barco.';
 }return out;
};
const update=V.Game.update.bind(V.Game);V.Game.update=function(dt){const result=update(dt);B.refresh();return result;};
const persist=D.persist.bind(D);D.persist=function(...args){const result=persist(...args);if(this.enabled()&&this.owner===V.state&&this.actors.length===2&&V.state.duoWorld?.players)for(let i=0;i<2;i++)V.state.duoWorld.players[i].boat=B.snapshot(i);return result;};
const start=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){
 const source=V.state,records=copy(source?.duoWorld?.players)||[],sea=source&&M.ensure(),legacy=sea?.boat?{...copy(sea.boat),course:copy(sea.course)}:null;
 const result=start(...args),state=V.state;
 if(D.enabled())queueMicrotask(()=>{if(V.state===state&&B.enabled())B.restore(source===state?records:[],source===state?legacy:null);});
 return result;
};
})();
