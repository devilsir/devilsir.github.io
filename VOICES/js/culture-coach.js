(function cultureCoach(){
'use strict';const V=window.V,K=V.CultureChallenges;
const original=K.frame.bind(K);
const hints={loom:['Escolha o motivo e observe a prévia.','Passe a lançadeira para construir a primeira linha.'],press:['Abra a ficha de um bloco tipográfico.','Agora coloque o bloco numa célula livre da folha.'],stage:['Programe um movimento para a primeira personagem.','Use Ensaiar para assistir às ações simultâneas.'],oware:['Selecione uma casa com sementes.','Confira a previsão e use Semear.']};
K.frame=function(body,footer){original(body,footer);const r=this.run(),s=this.ensure();s.coached||={};if(!r||r.stage>0||s.coached[r.game]||r.moves>0){if(r&&r.moves>0&&!s.coached[r.game]){s.coached[r.game]=true;V.Save.save();}return;}
 const second=r.game==='press'&&r.data.inspected?.length||r.game==='stage'&&r.data.programs?.some(p=>p.length)||r.game==='oware'&&r.data.selected!==null;const selector={loom:second?'#loom-weave':'#loom-pattern',press:second?'[data-press-cell]':'[data-press-piece]',stage:second?'#stage-play':'[data-stage-add]',oware:second?'#oware-sow':'[data-oware-pit]:not([disabled])'}[r.game];const target=V.$(selector);if(!target)return;
 target.classList.add('culture-rgb-focus');const message=document.createElement('p');message.className='culture-coach-line';message.textContent='PIX · '+hints[r.game][second?1:0];V.$('.culture-progress')?.after(message);};
})();
