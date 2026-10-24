(function voicesLegacyArcadeAccess(){
'use strict';const V=window.V,P=V.Playground,original=P.menu.bind(P);
P.menu=function(){original();const anchor=V.$('#pg-quests');if(!anchor)return;const count=P.ensure().badges?.length||0;const status=document.createElement('p');status.className='pg-badge-counter';status.textContent='Emblemas de maestria: '+count+' de '+V.PlaygroundData.games.length+' desafios';anchor.before(status);const b=document.createElement('button');b.id='pg-legacy-activities';b.className='secondary';b.textContent='Ateliê de Retratos · Oficina do Tempo · Correio das Vozes';b.onclick=()=>V.LearningArcade.legacyMenu();anchor.before(b);};
})();
