/* Registered module: harmony-atlas */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('harmony-atlas',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,A=V.WorldAtlas,F=V.FastTravel,W=V.World,esc=V.escape;
  const normal=value=>String(value).normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('pt-BR').trim();
  const landmarks=[
    ['residential','Residencial',23,17,'track',true],
    ['neighborhood','Bairro das Janelas',35,28,'track'],
    ['school','Escola',57,18,'records',true],
    ['university','Universidade',42,21,'records'],
    ['museum','Museu das Vozes',77,19,'context',true],
    ['african-words','Museus e pátios',88,33,'context'],
    ['library','Biblioteca',53,34,'records'],
    ['park','Parque',18,37,'support',true],
    ['hub','Praça das Vozes',46,46,'track',true],
    ['chapter-1','Distrito do Ritmo',30,46,'skills'],
    ['chapter-2','Memórias',69,31,'records'],
    ['chapter-3','Laboratório',65,42,'skills'],
    ['chapter-4','Rede do Viés',78,49,'context'],
    ['chapter-5','Comunidade',68,57,'support'],
    ['chapter-6','Arquivo Central',65,17,'records'],
    ['ancestral-quarter','Caminhos da Ancestralidade',13,23,'pulse'],
    ['market','Feira',23,56,'items',true],
    ['garden','Horta',17,79,'support'],
    ['harbor','Porto',56,66,'track',true],
    ['beach','Praia',85,63,'track',true]
  ];
  const regions=[
    ['city','Centro e vida cotidiana'],
    ['story','Distritos da campanha'],
    ['culture','Museus e patrimônio'],
    ['homes','Bairros e moradias'],
    ['coast','Litoral e porto'],
    ['cape','Cidade do Cabo e arredores'],
    ['wild','Biomas e santuários']
  ];
  const regionLabels=Object.fromEntries(regions);
  const africaRegions=regions.filter(([id])=>id==='cape'||id==='wild');
  const africaLandmarks=[
    ['cape-town','Porto da Cidade do Cabo',14,65,'track'],
    ['bo-kaap','Bo-Kaap',22,42,'context'],
    ['kirstenbosch','Kirstenbosch',48,36,'support'],
    ['muizenberg','Muizenberg',47,81,'track'],
    ['cape-market','Mercado do Cabo',42,64,'items'],
    ['nature-savanna','Savana',78,22,'support'],
    ['nature-wetlands','Áreas úmidas',86,51,'support'],
    ['sanctuary-village-sa','Vila dos Guardas',76,73,'track']
  ];
  const inAfrica=id=>!!id&&V.CapeRegion.africa(id);
  const africaParent=id=>id?.startsWith('interior-')?W.maps[id]?.design?.construction?.doors?.find(door=>door.pair&&door.to?.map!==id)?.to?.map:null;
  const africaBounds={west:-30,north:41,width:93,height:82};
  function africaPoint(lon,lat){
    const b=africaBounds;
    return [(lon-b.west)/b.width*100,(b.north-lat)/b.height*100];
  }
  function africaChart(){
    const land=V.MaritimeGeography;
    const path=rings=>rings.map(ring=>'M'+ring.map(([lon,lat])=>africaPoint(lon,lat).map(v=>(v*8).toFixed(1)).join(',')).join('L')+'Z').join('');
    return `<div class="africa-inset">
      <svg viewBox="40 20 720 730" role="img" aria-label="África do Sul no continente africano">
        <path class="africa-land" d="${path(land.land)}"/>
        <path class="africa-country" fill-rule="evenodd" d="${path(land.southAfrica)}"/>
      </svg>
      <span>África do Sul</span>
    </div>`;
  }
  function region(id,root){
    if(/^(nature-|sanctuary-|interior-sanctuary-)/.test(id))return'wild';
    if(['cape-town','bo-kaap','kirstenbosch','muizenberg'].includes(root)||id.startsWith('cape-'))return'cape';
    if(/^chapter-/.test(root))return'story';
    if(id.startsWith('interior-')&&!['interior-umbanda','interior-candomble','interior-botica','interior-shopping','interior-mercearia','interior-cafe'].includes(id)||['neighborhood','residential'].includes(id))return'homes';
    if(['museum','african-words','ancestral-quarter','library'].includes(root)||/(museum|fossil)/.test(id))return'culture';
    if(['beach','harbor'].includes(root))return'coast';
    return'city';
  }
  const detailed=A.open.bind(A);
  const changeView=A.changeView.bind(A);

  function overview(selected,africa=false){
    if(!V.state)return;
    if(V.Game.mode!=='explore'||V.Dialogue.active||V.SceneEditor.active||V.Homestead.ensure()?.sleep){V.UI.toast('Conclua a atividade atual antes de abrir o atlas.');return;}
    A.observer?.disconnect();A.observer=null;
    const here=W.current?.id,pins=(africa?africaLandmarks:landmarks).filter(([id])=>W.maps[id]);
    const groups=africa?africaRegions:regions;
    const labels=regionLabels;
    const groupOf=id=>region(id,F.root(id));
    const entries=Object.values(W.maps).filter(m=>!africa||inAfrica(m.id)).map(m=>{
      const root=(africa&&africaParent(m.id))||F.root(m.id);
      const name=F.name(m.id),kind=groupOf(m.id);
      const parent=m.id!==root&&W.maps[root]&&groupOf(root)===kind?F.name(root):'';
      return {id:m.id,name,parent,region:kind,value:normal([name,m.name,parent,labels[kind],africa?'África do Sul':'',...(V.Homestead.home(m.id)?.residents||[])].join(' '))};
    }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR',{numeric:true}));
    let chosen=W.maps[selected]?selected:W.maps[here]?here:'hub';
    if(africa&&!inAfrica(chosen))chosen=inAfrica(here)?here:pins[0]?.[0];
    if(!chosen)return;
    A.view=africa?'africa':'world';A.selected=chosen;
    V.UI.modal(africa?'Atlas da África':'Atlas de New Harmony','',`
      <nav class="harmony-views" aria-label="Vista do atlas">
        <button type="button" class="secondary" data-harmony-view="world" aria-pressed="${!africa}">New Harmony</button>
        <button type="button" class="secondary" data-harmony-view="africa" aria-pressed="${africa}">África</button>
      </nav>
      <div class="harmony-atlas">
      <div class="harmony-atlas-map ${africa?'harmony-africa':''}" role="group" aria-label="${africa?'Mapa da África':'Mapa geral de New Harmony'}">
        ${africa?`<img src="assets/adventure/south-africa-overview.webp" alt="Vista ilustrada do porto e bairros do Cabo, do jardim, da praia e das trilhas da savana sul-africana">${africaChart()}`:
          '<img src="assets/adventure/new-harmony-overview.webp" alt="Vista aérea ilustrada de New Harmony, com praças, bairros, rios e costa">'}
        ${pins.map(([id,label,x,y,icon,major])=>`<button type="button" class="harmony-pin ${africa?'africa-pin':major?'':'harmony-pin-compact'}" data-harmony-pin="${id}" style="--map-x:${x}%;--map-y:${y}%" title="${esc(F.name(id))}" aria-label="${esc(F.name(id))}" aria-pressed="false">${V.TurnArt.icon(icon)}<span>${label}</span></button>`).join('')}
      </div>
      <section class="harmony-atlas-side" aria-label="Escolher destino">
        <label for="harmony-destination">Buscar destino</label>
        <input id="harmony-destination" type="search" placeholder="${africa?'Bo-Kaap, savana, jardim…':'Museu, casa, praia…'}" autocomplete="off" aria-controls="harmony-results">
        <div id="harmony-selection" class="harmony-selection" aria-live="polite"></div>
        <div class="harmony-directory">
          <label for="harmony-region">Destinos por região</label>
          <select id="harmony-region"><option value="all">Todos os destinos</option>${groups.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select>
          <p class="harmony-count" id="harmony-count" aria-live="polite"></p>
          <div id="harmony-results" class="harmony-results" aria-label="Destinos"></div>
        </div>
        ${africa?'<p class="africa-note">Mapa ilustrado dos destinos jogáveis na África do Sul. As distâncias são esquemáticas.</p>':''}
      </section>
    </div>`,'',true);
    V.$('.modal').classList.add('harmony-modal');
    const field=V.$('#harmony-destination'),results=V.$('#harmony-results'),detail=V.$('#harmony-selection'),filter=V.$('#harmony-region');
    const pinButtons=V.$$('[data-harmony-pin]');
    function select(id){
      chosen=id;A.selected=id;
      const status=F.status(id),current=id===here;
      const selectedPin=africa?africaParent(id):F.root(id);
      const herePin=africa?africaParent(here):null;
      for(const button of pinButtons){
        const pin=button.dataset.harmonyPin;
        button.setAttribute('aria-pressed',String(pin===id||pin===selectedPin));
        button.classList.toggle('is-here',pin===here||pin===herePin);
      }
      detail.innerHTML=`<p class="harmony-place-state">${esc(current?'Você está aqui':labels[groupOf(id)])}</p><h3>${esc(F.name(id))}</h3>
        ${!status.allowed||status.closed?`<p class="harmony-place-status">${esc(status.reason||status.label)}</p>`:''}
        <div class="harmony-place-actions">${!current?`<button id="harmony-travel" class="primary" ${status.allowed?'':'disabled'}>${status.closed?'Ir até a entrada':'Viajar'}</button>`:''}<button id="harmony-local" class="secondary" data-atlas-view="local">Mapa do local</button>${!current&&W.maps[here]?'<button type="button" class="quiet" id="harmony-current">Onde estou</button>':''}</div>`;
      detail.querySelector('#harmony-local').onclick=()=>A.open('local',chosen);
      const travel=detail.querySelector('#harmony-travel');
      if(travel)travel.onclick=()=>{if(!F.travel(chosen))select(chosen);};
      const currentButton=detail.querySelector('#harmony-current');
      if(currentButton)currentButton.onclick=()=>{
        if(africa&&!inAfrica(here))return A.open('world',here);
        select(here);field.value='';filter.value=groupOf(here);search();
      };
    }
    function search(){
      const query=normal(field.value);
      const found=query?entries.filter(entry=>entry.value.includes(query)).sort((a,b)=>Number(normal(b.name).startsWith(query))-Number(normal(a.name).startsWith(query))):entries.filter(entry=>filter.value==='all'||entry.region===filter.value);
      V.$('#harmony-count').textContent=found.length+' '+(found.length===1?'destino':'destinos');
      results.innerHTML=found.map(({id,name,parent,region})=>{
        const subtitle=parent||(query||filter.value==='all'?labels[region]:'');
        return `<button type="button" data-harmony-result="${esc(id)}" aria-pressed="${id===chosen}"><strong>${esc(name)}</strong>${subtitle?`<small>${esc(subtitle)}</small>`:''}</button>`;
      }).join('')||'<p>Nenhum destino encontrado.</p>';
    }
    results.onclick=event=>{
      const button=event.target.closest('[data-harmony-result]');
      if(!button)return;
      select(button.dataset.harmonyResult);
      results.querySelectorAll('button').forEach(row=>row.setAttribute('aria-pressed',String(row===button)));
    };
    field.oninput=search;
    filter.onchange=()=>{field.value='';search();};
    field.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();results.querySelector('button')?.click();}};
    for(const button of pinButtons)button.onclick=()=>{const id=button.dataset.harmonyPin;field.value='';filter.value=groupOf(id);select(id);search();};
    for(const button of V.$$('[data-harmony-view]'))button.onclick=()=>{
      const view=button.dataset.harmonyView;
      if(view!==A.view)A.open(view,view==='world'&&!inAfrica(here)?here:chosen);
    };
    select(chosen);
    filter.value=africa?'all':groupOf(chosen);search();
    V.Onboarding.ack('atlas',A.view);
  }

  A.open=function(view='world',selected){
    if(view==='world'&&selected===undefined&&inAfrica(W.current?.id))view='africa';
    selected??=W.current?.id;
    if(view==='world'||view==='africa')return overview(selected,view==='africa');
    return detailed(view,selected);
  };
  A.changeView=function(view){
    if(view==='world'&&this.view==='local'&&inAfrica(this.selected))return A.open('africa',this.selected);
    return view==='world'||view==='africa'?A.open(view,this.selected):changeView(view);
  };
});
