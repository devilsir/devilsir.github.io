/* Registered module: city-chronicle */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('city-chronicle', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V, W=V.World, esc=V.escape;
  const {places,chapters,sources}=V.CityChronicleData;
  const normalize=text=>String(text).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('pt-BR');
  const name=id=>W.maps[id]?.name||id;
  const placeButton=(id,css='secondary')=>`<button type="button" class="${css}" data-chronicle-place="${esc(id)}">${esc(name(id))}</button>`;

  for(const chapter of chapters){
    const original=V.content.chapters[chapter.id-1];
    original.intro=chapter.intro.map(([speaker,en,pt])=>({speaker,en,pt}));
    original.resolution=[...original.resolution,{speaker:'pix',en:chapter.handoffEn,pt:chapter.handoff}];
  }

  const C=V.CityChronicle={
    place(id){return Object.hasOwn(places,id)&&W.maps[id]?places[id]:null;},

    readings(){
      const record=V.state?.cityChronicle;
      const owner=V.DuoPanels?.owner()===1?1:0;
      return Array.isArray(record?.[owner])?record[owner]:[];
    },

    mark(id){
      const seen=this.readings();
      if(seen.includes(id))return;
      const record=V.state.cityChronicle;
      const owner=V.DuoPanels?.owner()===1?1:0;
      V.state.cityChronicle={
        0:Array.isArray(record?.[0])?record[0]:[],
        1:Array.isArray(record?.[1])?record[1]:[],
        [owner]:[...seen,id]
      };
      V.Save.save();
    },

    bindPlaces(back){
      V.$$('[data-chronicle-place]').forEach(button=>{
        button.onclick=()=>this.open(button.dataset.chroniclePlace,back);
      });
    },

    open(id=W.current?.id,back=null){
      const note=this.place(id);
      if(!V.state||!note)return this.index(back);
      const chapter=chapters[note.chapter-1];
      const source=sources[note.reference];
      const links=note.links.filter(link=>this.place(link));
      const atlas=V.Game.mode==='explore';
      const here=id===W.current?.id;
      this.mark(id);
      V.UI.modal('Crônicas de New Harmony',name(id),`<article class="chronicle-sheet">
        <header><p class="chronicle-kicker">Crônica ficcional · ${esc(chapter.title)}</p><h3>${esc(note.title)}</h3></header>
        <p class="chronicle-scene">${esc(note.scene)}</p>
        ${source?`<section class="chronicle-reference"><h4>Conexão histórica ou cultural</h4><p>${esc(source[2])}</p><a href="${esc(source[1])}" target="_blank" rel="noopener noreferrer">${esc(source[0])}</a></section>`:''}
        <section class="chronicle-threads"><h4>Continue a história</h4><div class="row">${links.map(link=>placeButton(link)).join('')}</div></section>
      </article>`,`${id==='museum'?'<button id="chronicle-biographies" class="primary">Biografias do museu</button>':''}${back?'<button id="chronicle-back" class="quiet">Voltar</button>':''}<button id="chronicle-index" class="secondary">Todos os lugares</button><button id="chronicle-campaign" class="secondary">História da campanha</button>${atlas&&!here?'<button id="chronicle-atlas" class="primary">Mostrar no Atlas</button>':''}`,true);
      this.skin();
      this.bindPlaces(()=>this.open(id,back));
      if(id==='museum')V.$('#chronicle-biographies').onclick=()=>V.MuseumBiographies.catalog(()=>this.open(id,back));
      V.$('#chronicle-index').onclick=()=>this.index(()=>this.open(id,back));
      V.$('#chronicle-campaign').onclick=()=>this.campaign(()=>this.open(id,back));
      if(back)V.$('#chronicle-back').onclick=back;
      if(atlas&&!here)V.$('#chronicle-atlas').onclick=()=>V.WorldAtlas.open('local',id);
    },

    index(back=null,filter={query:'',chapter:0}){
      if(!V.state)return;
      const current=W.current?.id;
      const ids=Object.keys(places).filter(id=>this.place(id)).sort((a,b)=>name(a).localeCompare(name(b),'pt-BR'));
      V.UI.modal('Crônicas de New Harmony','Histórias e registros dos lugares da cidade e das rotas de viagem',`<div class="chronicle-index">
        <div class="chronicle-filters">
          <label>Buscar lugar ou crônica<input type="search" id="chronicle-search" placeholder="Praia, cadernos, capoeira…" value="${esc(filter.query)}"></label>
          <label>História<select id="chronicle-chapter"><option value="0">Todos os capítulos</option>${chapters.map(ch=>`<option value="${ch.id}" ${ch.id===filter.chapter?'selected':''}>${esc(ch.title)}</option>`).join('')}</select></label>
        </div>
        <p id="chronicle-count" role="status"></p><div class="chronicle-list" id="chronicle-list"></div>
      </div>`,`${back?'<button id="chronicle-back" class="quiet">Voltar</button>':''}${this.place(current)?`<button id="chronicle-here" class="primary">Ler a história daqui</button>`:''}<button id="chronicle-campaign" class="secondary">História da campanha</button>`,true);
      this.skin();
      const reopen=()=>this.index(back,filter);
      const list=()=>{
        const seen=new Set(this.readings());
        const query=normalize(filter.query.trim());
        const matching=ids.filter(id=>{
          const note=places[id];
          if(filter.chapter&&note.chapter!==filter.chapter)return false;
          return !query||normalize([name(id),note.title,note.scene,sources[note.reference]?.[0]].join(' ')).includes(query);
        });
        V.$('#chronicle-count').textContent=`${matching.length} lugares · ${ids.filter(id=>seen.has(id)).length} de ${ids.length} crônicas lidas`;
        V.$('#chronicle-list').innerHTML=matching.map(id=>`<button type="button" class="chronicle-list-item" data-chronicle-place="${esc(id)}"><span>${esc(name(id))}${seen.has(id)?' · Lida':''}</span><strong>${esc(places[id].title)}</strong></button>`).join('')||'<p>Nenhum lugar corresponde à busca.</p>';
        this.bindPlaces(reopen);
      };
      V.$('#chronicle-search').oninput=e=>{filter.query=e.target.value;list();};
      V.$('#chronicle-chapter').onchange=e=>{filter.chapter=Number(e.target.value);list();};
      if(back)V.$('#chronicle-back').onclick=back;
      if(this.place(current))V.$('#chronicle-here').onclick=()=>this.open(current,reopen);
      V.$('#chronicle-campaign').onclick=()=>this.campaign(reopen);
      list();
    },

    campaign(back=null){
      if(!V.state)return;
      const story=V.Progress.ensure().story;
      const completed=new Set(V.state.completed);
      V.UI.modal('O caminho das cópias','Linha do tempo da investigação',`<ol class="chronicle-timeline">
        <li><h3>A ficha NH-014</h3><p>Uma ficha e uma legenda entram em conflito no Museu das Vozes. A cópia de Cecília guarda a autoria que a Ordem da Rasura apagou. A equipe segue as alterações de um lugar ao outro.</p>${placeButton('museum')}</li>
        ${chapters.map(ch=>{
          const done=completed.has(ch.id);
          const available=V.state.flags.prologueDone&&V.Quests.isUnlocked(ch.id);
          const resolution=V.AdventureData.cases[ch.id-1].restored;
          return `<li><p class="chronicle-kicker">Capítulo ${ch.id} · ${done?'Restaurado':available?'Disponível':'Por investigar'}</p><h3>${esc(ch.title)}</h3>
            <p>${esc(done?resolution:V.content.chapters[ch.id-1].objective)}</p>${done?`<p class="chronicle-handoff">${esc(ch.handoff)}</p>`:''}
            <p class="chronicle-word"><span lang="en">${esc(ch.key)}</span> · ${esc(ch.meaning)}</p>${placeButton(ch.destination)}</li>`;
        }).join('')}
        ${story.ending?'<li><h3>O arquivo continua vivo</h3><p>As crônicas e as cópias da cidade agora registram a decisão sobre quem cuida do arquivo.</p><button type="button" id="chronicle-ending" class="secondary">Rever o epílogo</button></li>':''}
      </ol>`,`${back?'<button id="chronicle-back" class="quiet">Voltar</button>':''}<button id="chronicle-index" class="secondary">Todos os lugares</button>`,true);
      this.skin();
      this.bindPlaces(()=>this.campaign(back));
      V.$('#chronicle-index').onclick=()=>this.index(()=>this.campaign(back));
      if(back)V.$('#chronicle-back').onclick=back;
      if(story.ending)V.$('#chronicle-ending').onclick=()=>V.Story.epilogue();
    },

    skin(){V.$('.modal')?.classList.add('chronicle-modal');}
  };
});
