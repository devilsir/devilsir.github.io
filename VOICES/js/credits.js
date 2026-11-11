/* Registered module: credits */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("credits", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,esc=V.escape;
const groups=[
 ['História e educação',['content','learning','cozyContent','heritageContent','protestContent','protestLearning']],
 ['Culturas africanas e afro-brasileiras',['culturalContent','wardrobeContent','coastContent','AdventureData','AncestralData','TerreirosCollectionData','AfricanMuseumData','WordsRespectData']],
 ['Jogos e práticas culturais',['CultureChallengeData','AfricanPlayData']],
 ['Arte e espaços de convivência',['furnishingsContent','CommunityFurnitureData','neighborsContent','fieldGuideContent']],
 ['Geografia e navegação',['MaritimeData','CapeRegionData']],
 ['Alimentação e culinária',['MarketData','CookingData','FoodExpansion','FoodMuseumData']],
 ['Biomas, fauna e conservação',['NatureData','NatureChallenge']]
];
const C=V.Credits={
 authors:['Lucas Xavier Nardelli','Claudilene Alves Lopes'],year:2026,license:'MIT',pageSize:20,
 get licenseText(){return 'MIT License\n\nCopyright (c) '+this.year+' '+this.authors.join(' and ')+'\n\n'+
  'Permission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the "Software"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\n'+
  'The above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\n'+
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n';},
 normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');},
 link(value,local=false){
  if(typeof value!=='string')return null;
  if(local)return value==='data/sources/catalogo-brincadeiras.pdf'?value:null;
  try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol))return null;return url.href;}catch{return null;}
 },
 references(){
  const rows=new Map();
  for(const[category,owners]of groups)for(const owner of owners){
   const sources=V[owner]?.sources;if(!sources||typeof sources!=='object')continue;
   for(const source of Array.isArray(sources)?sources:Object.values(sources)){
    if(!source||typeof source!=='object')continue;
    const title=source.name||source.title,url=this.link(source.url),local=this.link(source.local,true);
    if(!title||(!url&&!local))continue;
    const key=(url||local).split('#')[0],old=rows.get(key);
    if(old){old.categories.add(category);if(!old.note)old.note=source.note||source.text||'';if(!old.local&&local)old.local=local;continue;}
    const author=source.authors||source.author||'',record={title:String(title),url,local,note:source.note||source.text||'',author:Array.isArray(author)?author.join('; '):String(author),publisher:source.institution||source.publisher||source.journal||'',year:source.year||'',categories:new Set([category])};
    rows.set(key,record);
   }
  }
  return [...rows.values()].sort((a,b)=>a.title.localeCompare(b.title,'pt-BR'));
 },
 presentation(){return `<section class="credits-authorship" aria-labelledby="credits-authorship-title"><p class="credits-kicker">VOICES — REBOOT THE STORY</p><h3 id="credits-authorship-title">Autoria do projeto</h3><div class="credits-authors">${this.authors.map(name=>'<p>'+esc(name)+'</p>').join('')}</div><p class="credits-copyright">© ${this.year} ${esc(this.authors.join(' e '))}</p></section>
  <section class="credits-section"><h3>Apresentação</h3><p>VOICES — Reboot the Story é um jogo educativo de exploração e investigação ambientado na cidade ficcional de New Harmony. Sua proposta articula memória, autoria, culturas africanas e afro-brasileiras e aprendizagem da língua inglesa.</p><p>A experiência reúne uma campanha narrativa, pesquisa de fontes, registro de descobertas, oficinas, desafios e exploração individual ou em dupla. Museus, biblioteca, universidade, espaços de trabalho e convivência, ambientes costeiros e biomas brasileiros e africanos integram o percurso.</p></section>
  <div class="credits-scope"><section class="credits-section"><h3>Narrativa e representações</h3><p>Os personagens investigam alterações em documentos e memórias com o auxílio do Historiógrafo, uma máscara ancestral ficcional. A cidade, seus habitantes e os acontecimentos da campanha compõem o universo narrativo do jogo.</p><p>Os conteúdos históricos, culturais, geográficos e ambientais são apresentados por meio de sínteses didáticas e interpretações artísticas, acompanhadas de referências e de seus respectivos contextos.</p></section><section class="credits-section"><h3>Proposta educativa</h3><p>O jogo favorece a leitura contextualizada, a comparação de registros, o reconhecimento de autoria, a ampliação do vocabulário em inglês e a reflexão sobre diversidade cultural, convivência e conservação ambiental.</p><p>Seu uso pedagógico é complementar e admite mediação docente, investigação compartilhada e diferentes ritmos de aprendizagem. Os recursos visuais, as animações e os ambientes sonoros integram essa experiência.</p></section></div>`;},
 licensing(){return `<section class="credits-section"><p class="credits-kicker">LICENCIAMENTO DO PROJETO</p><h3>Licença MIT</h3><p>O código e os materiais originais de VOICES — Reboot the Story são disponibilizados sob a licença MIT, incluindo textos autorais, ilustrações, interface, animações e áudio original.</p><p>A licença permite utilizar, copiar, modificar e distribuir esses materiais, inclusive comercialmente, mediante a preservação do aviso de direitos autorais e do texto da licença. O texto integral em inglês está disponível abaixo.</p><div class="credits-document-links"><a href="LICENSE.txt" target="_blank" rel="noopener noreferrer">Abrir licença MIT</a><a href="NOTICE.txt" target="_blank" rel="noopener noreferrer">Consultar avisos de terceiros</a></div><details class="credits-license-text"><summary>Texto integral da licença MIT</summary><pre>${esc(this.licenseText)}</pre></details></section><section class="credits-section credits-third-party"><h3>Materiais de terceiros</h3><p>As fontes tipográficas DejaVu e Patrick Hand mantêm suas licenças de origem, incluídas na distribuição. Os dados geográficos Natural Earth são identificados como de domínio público. As referências bibliográficas e os conteúdos externos mantêm suas próprias condições de uso.</p><div class="credits-document-links"><a href="assets/fonts/LICENSE.txt" target="_blank" rel="noopener noreferrer">Licença das fontes DejaVu</a><a href="assets/fonts/PATRICK-HAND-OFL.txt" target="_blank" rel="noopener noreferrer">Licença da fonte Patrick Hand</a></div></section>`;},
 open(){
  const state={tab:'presentation',query:'',category:'all',page:0},references=this.references();let searchTimer;
  V.UI.modal('Créditos e fontes','AUTORIA · APRESENTAÇÃO · REFERÊNCIAS · LICENCIAMENTO',`<div class="credits-page"><nav class="credits-navigation" aria-label="Seções dos créditos"><button data-credits-tab="presentation" aria-pressed="true">Autoria e projeto</button><button data-credits-tab="references" aria-pressed="false">Referências</button><button data-credits-tab="license" aria-pressed="false">Licença</button></nav><div id="credits-content"></div></div>`,'<button id="credits-close" class="primary">Voltar</button>',true);
  const root=V.$('.credits-page');root.closest('.modal').classList.add('formal-credits');
  const paintRows=()=>{
   if(!root.isConnected||state.tab!=='references')return;
   const query=this.normalize(state.query),filtered=references.filter(s=>(state.category==='all'||s.categories.has(state.category))&&this.normalize([s.title,s.author,s.publisher,s.note,...s.categories].join(' ')).includes(query)),pages=Math.max(1,Math.ceil(filtered.length/this.pageSize));
   state.page=V.clamp(state.page,0,pages-1);const start=state.page*this.pageSize,rows=filtered.slice(start,start+this.pageSize);
   root.querySelector('#credits-reference-results').innerHTML=rows.length?rows.map(s=>`<article class="credits-reference"><h3>${s.url?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'</a>':esc(s.title)}</h3>${s.author||s.publisher||s.year?'<p class="credits-reference-meta">'+esc([s.author,s.publisher,s.year].filter(Boolean).join(' · '))+'</p>':''}${s.note?'<p>'+esc(s.note)+'</p>':''}<p class="credits-reference-category">${esc([...s.categories].join(' · '))}</p>${s.local?'<a href="'+esc(s.local)+'" target="_blank" rel="noopener noreferrer">Consultar documento incluído no jogo</a>':''}</article>`).join(''):'<p class="credits-empty">Nenhuma referência corresponde à busca.</p>';
   root.querySelector('#credits-reference-count').textContent=filtered.length?(start+1)+'–'+Math.min(start+this.pageSize,filtered.length)+' de '+filtered.length+' referências':'0 referências';
   root.querySelector('#credits-reference-page').textContent='Página '+(state.page+1)+' de '+pages;
   root.querySelector('#credits-reference-prev').disabled=state.page===0;root.querySelector('#credits-reference-next').disabled=state.page>=pages-1;
  };
  const paint=()=>{
   clearTimeout(searchTimer);const content=root.querySelector('#credits-content');
   for(const button of root.querySelectorAll('[data-credits-tab]'))button.setAttribute('aria-pressed',String(button.dataset.creditsTab===state.tab));
   if(state.tab==='presentation')content.innerHTML=this.presentation();
   else if(state.tab==='license')content.innerHTML=this.licensing();
   else{
    const categories=[...new Set(references.flatMap(s=>[...s.categories]))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
    content.innerHTML=`<section class="credits-section"><h3>Referências de pesquisa</h3><p>Esta relação reúne as fontes utilizadas nos conteúdos históricos, culturais, educativos e ambientais do jogo. Cada registro identifica a publicação ou instituição de origem e o contexto de sua utilização. A abertura de páginas externas requer conexão à internet.</p></section><div class="credits-reference-filters"><label>Buscar referências<input id="credits-reference-search" type="search" value="${esc(state.query)}" placeholder="Título, tema, instituição ou autor"></label><label>Área de pesquisa<select id="credits-reference-category"><option value="all">Todas as áreas</option>${categories.map(category=>'<option value="'+esc(category)+'">'+esc(category)+'</option>').join('')}</select></label></div><p id="credits-reference-count" role="status" aria-live="polite"></p><div id="credits-reference-results"></div><nav class="credits-reference-pages" aria-label="Páginas das referências"><button id="credits-reference-prev" class="secondary">Anterior</button><span id="credits-reference-page"></span><button id="credits-reference-next" class="secondary">Próxima</button></nav>`;
    const search=root.querySelector('#credits-reference-search'),category=root.querySelector('#credits-reference-category');category.value=state.category;
    search.oninput=()=>{state.query=search.value;state.page=0;clearTimeout(searchTimer);searchTimer=setTimeout(paintRows,120);};
    category.onchange=()=>{state.category=category.value;state.page=0;paintRows();};
    root.querySelector('#credits-reference-prev').onclick=()=>{state.page--;paintRows();};root.querySelector('#credits-reference-next').onclick=()=>{state.page++;paintRows();};paintRows();
   }
   const panels=V.DuoPanels;if(panels?.enabled()){const owner=panels.owner();if(owner>=0)panels.bind(root,owner);}
  };
  for(const button of root.querySelectorAll('[data-credits-tab]'))button.onclick=()=>{state.tab=button.dataset.creditsTab;paint();};
  V.$('#credits-close').onclick=()=>V.UI.close();paint();
 }
};
})();

});
