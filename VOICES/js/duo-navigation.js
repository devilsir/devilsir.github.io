/* Shore and boat commands belong to the person using them. */
(function(){
'use strict';
const V=window.V,D=V.DuoWorld,P=V.DuoPanels,N=V.SeaNavigation,M=V.Maritime,X=V.CoastalExploration;
if(!D||V.DuoChallenges.isChild)return;
const B=V.DuoNavigation={
 enabled(){return D.enabled()&&D.visible&&V.Game.mode==='explore';},
 scene(i=D.context){return D.root?.querySelectorAll('.duo-world-scene')[i]||null;},
 refresh(){
  // Loading and boat actions can call native toolbars inside an actor swap.
  // Refresh after that operation commits its destination and boat state.
  if(!this.enabled()||D.loading||D.context>=0)return;
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
   if(N.boat&&!N.hudRoot())N.mount();
   const boat=N.hudRoot();if(boat)boat.hidden=!N.boat;
  });
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
})();
