(function(){
'use strict';
const V=window.V,PM=V.PlayMuseum,A=V.AfricanPlayArt,M=V.AfricanMuseum,C=V.Cozy,W=V.World,T=48,esc=V.escape;
const univesp='https://apps.univesp.br/brinquedoteca/jogos/aprender-a-jogar/';
const panels=PM.historyPanels=[
 {id:'amarelinha',title:'Amarelinha',region:'Brincadeira presente em muitos lugares',text:'Um desenho no chão organiza saltos, equilíbrio e turnos. As casas e os percursos mudam entre regiões e grupos.',rules:['Desenhe as casas e combine a ordem do percurso.','Lance uma pedrinha e percorra as casas sem pisar na que ela ocupa.','O desenho e os apoios podem mudar conforme a variante escolhida.'],context:'A Brinquedoteca Univesp apresenta a amarelinha e convida a pesquisar outros desenhos. O museu não atribui uma origem única a todas as suas variantes.',source:univesp,sourceTitle:'Brinquedoteca Univesp · aprender a jogar'},
 {id:'peteca',title:'Peteca',region:'Saberes de diferentes povos indígenas no Brasil',text:'As mãos mantêm o brinquedo no ar. Materiais, nomes e modos de brincar variam entre os povos e as comunidades.',rules:['Combine uma roda ou uma troca entre parceiros.','Rebata com a palma da mão para que a peteca continue no ar.','A fabricação do brinquedo também pode fazer parte da aprendizagem.'],context:'O projeto Povos Indígenas no Brasil Mirim, do ISA, apresenta diferentes brincadeiras e reconhece a peteca entre práticas conhecidas por diversos povos indígenas. Evite tratar todos os povos como uma cultura única.',source:'https://www.mirim.org/index.php/pt-br/como-vivem/brincadeiras',sourceTitle:'Instituto Socioambiental · Povos Indígenas no Brasil Mirim'},
 {id:'corda',title:'Pular corda',region:'Cantigas, saltos e variações regionais',text:'O giro da corda cria um pulso compartilhado. Quem pula combina o salto com os movimentos de quem bate a corda.',rules:['Duas pessoas podem girar uma corda longa; outra entra para saltar.','Combine uma cantiga ou conte os saltos.','Mude o ritmo e os gestos de acordo com o combinado do grupo.'],context:'A Univesp descreve a diversidade regional das cantigas e dos desafios. A origem exata da brincadeira não é apresentada como uma certeza.',source:univesp,sourceTitle:'Brinquedoteca Univesp · aprender a jogar'},
 {id:'elastico',title:'Pular elástico',region:'Sequências que circulam entre gerações',text:'Duas pessoas sustentam o elástico enquanto outra executa uma sequência. Os gestos e as alturas podem mudar a cada rodada.',rules:['Duas pessoas sustentam o elástico com as pernas, deixando espaço para saltar.','Combine a sequência: dentro, fora, sobre o elástico ou com giro.','Troque os papéis e adapte a altura ao grupo.'],context:'A Brinquedoteca Univesp registra que os desafios variam entre regiões do Brasil. Esta exposição apresenta uma possibilidade, sem fixar uma regra universal.',source:univesp,sourceTitle:'Brinquedoteca Univesp · aprender a jogar'}
];
function art(c,id,w=c.canvas.width,h=c.canvas.height){
 c.save();c.scale(w/480,h/270);c.imageSmoothingEnabled=false;c.fillStyle='#aac19b';c.fillRect(0,0,480,270);c.fillStyle='#c4b38c';c.fillRect(0,148,480,122);c.fillStyle='#789876';for(let i=0;i<7;i++){c.fillRect(i*82-10,45,24,107);c.fillRect(i*82-25,24,54,47);}
 c.strokeStyle='#f5efd1';c.lineWidth=4;
 if(id==='amarelinha'){for(let i=0;i<6;i++){const x=i===2||i===3?175+(i-2)*58:204,y=235-Math.min(i,4)*26;c.strokeRect(x,y,54,25);M.text(c,String(i+1),x+27,y+17,14,'#50654e');}A.person(c,0,2,153,232,84,12);}
 if(id==='peteca'){A.person(c,1,6,125,246,100);A.person(c,2,6,355,246,100);c.fillStyle='#b06f43';c.fillRect(231,96,19,14);c.fillStyle='#e7ead4';for(let i=0;i<4;i++){c.save();c.translate(241,95);c.rotate((i-1.5)*.23);c.fillRect(-4,-42,8,42);c.restore();}c.setLineDash([5,8]);c.beginPath();c.arc(240,194,102,Math.PI*1.1,Math.PI*1.9);c.stroke();}
 if(id==='corda'){A.person(c,1,0,105,245,92);A.person(c,3,0,375,245,92);c.strokeStyle='#a66b43';c.lineWidth=5;c.beginPath();c.moveTo(115,201);c.bezierCurveTo(153,71,328,71,365,201);c.stroke();A.person(c,0,6,242,232,103,24);}
 if(id==='elastico'){A.person(c,2,0,130,245,96);A.person(c,3,0,355,245,96);c.strokeStyle='#be6e70';c.lineWidth=4;c.beginPath();c.moveTo(122,230);c.lineTo(347,230);c.lineTo(363,242);c.lineTo(138,242);c.closePath();c.stroke();A.person(c,0,6,242,224,98,16);}
 c.restore();
}
PM.historyArt=art;
PM.historyExhibit=function(id){const e=panels.find(e=>e.id===id);if(!e)return;V.UI.modal(e.title,e.region.toUpperCase(),'<article class="play-exhibit"><div class="play-exhibit-hero"><canvas class="play-new-art" id="play-history-art" width="640" height="360" aria-label="Ilustração de '+esc(e.title)+'"></canvas><span>QUADRO DO ACERVO</span></div><div><p class="play-lead">'+esc(e.text)+'</p><h3>Uma forma de brincar</h3><ol>'+e.rules.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol><p>'+esc(e.context)+'</p><p class="note">Esta brincadeira está presente somente na exposição. Ainda não há um desafio jogável.</p><a href="'+esc(e.source)+'" target="_blank" rel="noopener noreferrer">'+esc(e.sourceTitle)+'</a></div></article>','<button id="history-back" class="primary">Voltar ao acervo</button>',true);PM.paper();art(V.$('#play-history-art').getContext('2d'),id);V.$('#history-back').onclick=()=>PM.catalog();};
for(const layout of [C.layouts[PM.id],M.defaults[PM.id],V.SceneDesign.defaults[PM.id]]){layout.height=44;layout.spawn=[21.5,41];layout.purpose='Seis brincadeiras jogáveis e quatro novos quadros de memórias do brincar.';}
const build=PM.build.bind(PM);PM.build=function(d=C.layouts[this.id]){
 d.height=44;const m=build(d);m.height=44;
 m.solids=m.solids.filter(s=>!(s.x===0&&s.y===33*T));for(const s of m.solids)if(s.y===0&&s.h===34*T)s.h=44*T;m.solids.push({x:0,y:43*T,w:44*T,h:T});
 const g=V.Architecture.geometry(d);for(const wall of g.walls){if(wall.id==='play-shell-south'){wall.a[1]=wall.b[1]=43*T;}if(['play-shell-west','play-shell-east'].includes(wall.id))wall.b[1]=43*T;}
 const exit=m.objects.find(o=>o.id==='play-exit');if(exit){exit.y=41.7*T;V.SceneDesign.objectRegistry[PM.id][exit.id]={...exit};}
 for(const o of m.objects.filter(o=>o.playExhibit)){
  const e=V.AfricanPlayData.exhibits.find(e=>e.id===o.playExhibit),prop={id:'play-case-'+e.id,type:'af-play-case',x:o.x+T*2.4,y:o.y+T*1.9,caseExhibit:e.id,label:'Mostruário · '+e.title};m.objects.push(prop);m.solids.push({x:prop.x-69,y:prop.y-22,w:138,h:34,owner:prop.id});
 }
 for(const[i,e]of panels.entries()){
  const x=[6,16.5,27,37.5][i]*T,y=36.4*T;m.objects.push({id:'play-history-'+e.id,type:'af-play-history',playHistory:e.id,x,y,label:'Conhecer: '+e.title,interactionRange:110,w:230,h:182});m.solids.push({x:x-112,y:y-24,w:224,h:25,owner:'history-'+e.id});
  if(!g.walls.some(w=>w.id==='history-wall-'+e.id))g.walls.push({id:'history-wall-'+e.id,a:[x-4.5*T,33.5*T],b:[x+4.5*T,33.5*T],height:130,thickness:12,color:'#8c987e',openings:[]});
 }
 for(const o of m.objects)if(o.playHistory||o.caseExhibit)V.SceneDesign.objectRegistry[PM.id][o.id]={...o};return m;
};
const ground=PM.ground.bind(PM);PM.ground=function(m){ground(m);const old=m.cache,canvas=document.createElement('canvas');canvas.width=44*T;canvas.height=44*T;const c=canvas.getContext('2d');c.drawImage(old,0,0);V.CapeVisuals.fill(c,'stone',T,32.5*T,42*T,10.5*T);V.CapeVisuals.fill(c,'path',1.5*T,38.5*T,41*T,3.8*T);c.fillStyle='#536e58';c.fillRect(0,33*T,T,11*T);c.fillRect(43*T,33*T,T,11*T);c.fillRect(0,43*T,44*T,T);M.text(c,'MAIS MEMÓRIAS DO BRINCAR · GALERIA DE QUADROS',22*T,32.6*T,17,'#405d46');M.text(c,'QUATRO HISTÓRIAS PARA CONHECER · DESAFIOS FUTUROS',22*T,39.9*T,14,'#5b7455');m.cache=canvas;};
const draw=PM.draw.bind(PM);PM.draw=function(c,o,cam){const x=o.x-cam.x,y=o.y-cam.y;
 if(o.playExhibit||o.playHistory){
  const e=o.playExhibit?V.AfricanPlayData.exhibits.find(e=>e.id===o.playExhibit):panels.find(e=>e.id===o.playHistory);if(!e)return true;
  const w=o.playHistory?230:296,h=o.playHistory?166:210;
  c.fillStyle='#644c35';c.fillRect(x-w/2,y-h,w,h);c.fillStyle='#d4b47b';c.fillRect(x-w/2+4,y-h+4,w-8,5);c.save();c.translate(x-w/2+10,y-h+14);if(o.playHistory)art(c,e.id,w-20,h-55);else A.cover(c,e.id,w-20,h-55);c.restore();
  c.fillStyle='#edddb0';c.fillRect(x-w/2+8,y-35,w-16,25);M.text(c,e.title,x,y-20,o.playHistory?14:e.id==='roda-jo'?12:16,'#2d5642');
  if(o.playExhibit&&PM.ensure().played.includes(e.id)){c.fillStyle='#e7c56e';c.fillRect(x+w/2-32,y-h+8,23,23);M.text(c,'✓',x+w/2-20,y-h+20,17,'#2b5641');}
  if(W.nearest?.id===o.id){c.strokeStyle='#f5d47b';c.lineWidth=3;c.strokeRect(x-w/2-4,y-h-4,w+8,h+8);}return true;
 }
 if(o.caseExhibit){
  V.SceneShadows.contact(c,x+4,y+8,78,14,.2);c.fillStyle='#66513b';c.fillRect(x-69,y-30,138,36);c.fillStyle='#bdab83';c.fillRect(x-74,y-39,148,14);c.fillStyle='#b0d5cd45';c.fillRect(x-71,y-103,142,64);c.strokeStyle='#83aaa1';c.lineWidth=2;c.strokeRect(x-71,y-103,142,64);
  const prop={'terra-mar':3,'fogo-montanha':7,mancala:0,matacuzana:4,'roda-jo':2,ampe:3}[o.caseExhibit];A.prop(c,prop,x,y-40,70,53,false);if(o.caseExhibit==='mancala')A.board(c,x-49,y-61,98,25);if(o.caseExhibit==='matacuzana')A.prop(c,1,x-45,y-42,25,20,false);M.text(c,'MOSTRUÁRIO',x,y-12,10,'#f4e0b8');return true;
 }return draw(c,o,cam);
};
const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o,...args){if(o?.playHistory&&!V.modal&&!V.Dialogue.active)return PM.historyExhibit(o.playHistory);return interact(o,...args);};
const catalog=PM.catalog.bind(PM);PM.catalog=function(...args){const out=catalog(...args),section=document.createElement('section');section.className='play-gallery-info';section.innerHTML='<h3>Novos quadros · memórias do brincar</h3><p>Quatro histórias para visitar na galeria. Somente exposição, sem novas partidas.</p><div class="play-museum-grid">'+panels.map(e=>'<button class="play-museum-card" data-play-history="'+e.id+'"><canvas class="play-new-art" data-history-art="'+e.id+'" width="480" height="270" aria-hidden="true"></canvas><strong>'+esc(e.title)+'</strong><small>Conhecer a história · quadro informativo</small></button>').join('')+'</div>';V.$('.modal-body').append(section);V.$$('[data-history-art]').forEach(c=>art(c.getContext('2d'),c.dataset.historyArt));V.$$('[data-play-history]').forEach(b=>b.onclick=()=>PM.historyExhibit(b.dataset.playHistory));return out;};
})();
