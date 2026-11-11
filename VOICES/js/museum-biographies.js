/* Registered module: museum-biographies */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('museum-biographies', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V,esc=V.escape;
  const {profiles,sources}=V.MuseumBiographyData;
  const byReading=new Map(Object.values(profiles).filter(p=>p.portrait).map(p=>['portrait-note-'+p.portrait,p.id]));
  for(const id of ['nina','tim','king','machado','carolina','katherine','conceicao'])byReading.set('heritage-book-'+id,id);
  for(const [reading,id] of [['heritage-book-rock','rosetta'],['cozy-book-05','rosana'],['book-03','mansa-musa']])byReading.set(reading,id);
  const normalize=value=>String(value).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('pt-BR');
  const listing=Object.values(profiles).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  const areas=[...new Set(listing.map(p=>p.area))].sort((a,b)=>a.localeCompare(b,'pt-BR'));

  V.MuseumBiographies={
    forReading(id){return byReading.get(id)||null;},
    forClue(id){return {c2_mali:'mansa-musa',c3_johnson:'katherine',c3_carolina:'carolina',c3_reboucas:'reboucas'}[id]||null;},

    references(ids){
      const links=new Map();
      for(const id of ids){
        const existing=V.content.sources.find(source=>source.id===id);
        const [name,url]=sources[id]||[existing?.name,existing?.url];
        if(name&&/^https:\/\//i.test(url))links.set(url,name);
      }
      return [...links].map(([url,name])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)}</a></li>`).join('');
    },

    render(id){
      const p=profiles[id];
      if(!p)return '';
      const links=this.references(p.sourceIds);
      return `<article class="museum-bio" data-museum-bio="${esc(id)}">
        <p class="museum-bio-period">${esc(p.area)} · ${esc(p.period)}</p>
        <div class="museum-bio-layout"><div class="museum-bio-text">${p.sections.map(([title,text])=>`<section><h3>${esc(title)}</h3><p>${esc(text)}</p></section>`).join('')}</div>
        <aside class="museum-bio-timeline"><h3>Marcos da trajetória</h3><ol>${p.milestones.map(([date,event])=>`<li><b>${esc(date)}</b><span>${esc(event)}</span></li>`).join('')}</ol></aside></div>
        ${links?`<details open class="museum-bio-sources"><summary>Fontes para consultar</summary><ul>${links}</ul></details>`:''}
        ${p.related.length?`<section class="museum-bio-related"><h3>Trajetórias relacionadas</h3><div class="row">${p.related.map(key=>`<button type="button" class="secondary" data-museum-bio-related="${esc(key)}">${esc(profiles[key].name)}</button>`).join('')}</div></section>`:''}
      </article>`;
    },

    bindRelated(back){
      V.$$('[data-museum-bio-related]').forEach(button=>{
        button.onclick=()=>this.open(button.dataset.museumBioRelated,back);
      });
    },

    open(id,back=null){
      if(!Object.hasOwn(profiles,id))return;
      V.UI.modal(profiles[id].name,'Biografias do acervo',this.render(id),
        `${back?'<button id="museum-bio-back" class="secondary">Voltar</button>':''}<button id="museum-bio-catalog" class="primary">Todas as biografias</button>`,true);
      V.$('.modal').classList.add('museum-bio-modal');
      this.bindRelated(()=>this.open(id,back));
      if(back)V.$('#museum-bio-back').onclick=back;
      V.$('#museum-bio-catalog').onclick=()=>this.catalog(()=>this.open(id,back));
    },

    catalog(back=null,filter={query:'',area:''}){
      V.UI.modal('Biografias do acervo','Museu das Vozes',`<div class="museum-bio-directory">
        <div class="museum-bio-filters"><label>Buscar por nome ou lugar<input id="museum-bio-search" type="search" value="${esc(filter.query)}" placeholder="Carolina, capoeira, Quênia…"></label>
        <label>Área<select id="museum-bio-area"><option value="">Todas</option>${areas.map(area=>`<option ${filter.area===area?'selected':''}>${esc(area)}</option>`).join('')}</select></label></div>
        <p id="museum-bio-count" role="status"></p><div id="museum-bio-list" class="museum-bio-list"></div>
      </div>`,back?'<button id="museum-bio-back" class="secondary">Voltar</button>':'',true);
      V.$('.modal').classList.add('museum-bio-modal');
      const paint=()=>{
        const query=normalize(filter.query.trim());
        const rows=listing.filter(p=>(!filter.area||p.area===filter.area)&&normalize([p.name,p.area,p.period].join(' ')).includes(query));
        V.$('#museum-bio-count').textContent=`${rows.length} de ${listing.length} biografias`;
        V.$('#museum-bio-list').innerHTML=rows.map(p=>`<button type="button" class="secondary" data-museum-bio-result="${esc(p.id)}"><small>${esc(p.area)}</small><strong>${esc(p.name)}</strong><span>${esc(p.period)}</span></button>`).join('')||'<p>Nenhuma biografia corresponde à busca.</p>';
        V.$$('[data-museum-bio-result]').forEach(button=>{
          button.onclick=()=>this.open(button.dataset.museumBioResult,()=>this.catalog(back,filter));
        });
      };
      V.$('#museum-bio-search').oninput=event=>{filter.query=event.target.value;paint();};
      V.$('#museum-bio-area').onchange=event=>{filter.area=event.target.value;paint();};
      if(back)V.$('#museum-bio-back').onclick=back;
      paint();
    }
  };
});
