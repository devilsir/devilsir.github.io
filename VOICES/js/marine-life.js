(function () {
  'use strict';
  const V=window.V,D=V.MarineLifeData,A=V.MarineArtData,W=V.World,C=V.Cozy,esc=V.escape,T=48;
  const B=V.MarineLife={
    images:{},inspections:new Map(),
    region(m=W.current){return D.regions[m?.id];},
    species(id){return D.species.find(s=>s.id===id);},
    roster(m=W.current){return D.species.filter(s=>s.regions.includes(this.region(m)));},
    owner(){return V.PixWorldVocabulary.owner();},
    owned(i,fn){return V.PixWorldVocabulary.owned(i,fn);},
    load(){if(this.ready)return this.ready;this.ready=Promise.all(Object.entries(A).map(([id,sheet])=>new Promise(resolve=>{const image=V.Assets.image();this.images[id]=image;image.onload=image.onerror=resolve;image.src=sheet.file+'?v=20261102-sealife1';V.AssetLoader.register(image,resolve);})));return this.ready;},
    ensure(){const s=V.Maritime.ensure();if(!s)return null;if(!Array.isArray(s.wildlifeReaders)||s.wildlifeReaders.length!==2)s.wildlifeReaders=[[],[]];s.wildlifeReaders=s.wildlifeReaders.map(list=>Array.isArray(list)?[...new Set(list.filter(id=>this.species(id)))]:[]);return s;},
    words(s){return [s.en,s.word,'ocean','tide','habitat',...(['fish','shoal'].includes(s.word)?['fin']:s.word==='whale'?['blowhole','flipper']:['flipper']),'observe'];},
    vocabulary(){
      const rows=[['whale','baleia'],['dolphin','golfinho; boto'],['sea turtle','tartaruga marinha'],['seal','foca; lobo-marinho'],['penguin','pinguim'],['flipper','nadadeira (de mamífero marinho, tartaruga ou ave)'],['fin','nadadeira de peixe'],['blowhole','orifício respiratório de um cetáceo'],['shoal','cardume'],['ocean','oceano'],['tide','maré']];
      for(const s of D.species)rows.push([s.en,s.name]);
      for(const [en,pt]of rows)if(!V.PixWorldVocabularyData.entries.some(e=>e.en.toLowerCase()===en.toLowerCase()))V.PixWorldVocabularyData.entries.push({en,pt,category:'marine',categoryLabel:'Mar e vida costeira',example:'Observe the '+en.toLowerCase()+' from a distance.',examplePt:'Observe à distância: '+pt.toLowerCase()+'.',starter:false});
      Object.assign(V.PixWorldVocabularyData.categories,{marine:'Mar e vida costeira'});
      Object.assign(V.PixWorldVocabularyData.aliases,{whales:'whale',dolphins:'dolphin',penguins:'penguin',flippers:'flipper',seals:'seal',shoals:'shoal'});V.PixWorldVocabulary.install();
    },
    bind(m){
      const watch=m.objects.find(o=>o.type==='marine-watch');if(!watch)return;
      const words=V.PixWorldVocabulary.words(this.roster(m).flatMap(s=>this.words(s)));
      watch.pixContext={words,only:false,priority:1,label:watch.label};
      for(const word of words)V.PixWorldVocabulary.remember(word,m,watch,watch.label,1);
    },
    water(m,x,y,margin=0){
      if(!this.region(m)||!Number.isFinite(x)||!Number.isFinite(y))return false;
      if(m.maritime)return V.Maritime.water(m,x,y,Math.max(9,margin));
      if(x<T+margin||x>(m.width-1)*T-margin||y<T+margin||y>(m.height-1)*T-margin)return false;
      if(m.id==='beach')return x-margin>(V.Coast.shore(y/T)+.7)*T;
      return m.id==='muizenberg'&&y-margin>31.7*T;
    },
    findWater(m,wanted,margin){
      if(this.water(m,wanted.x,wanted.y,margin))return wanted;
      for(let r=24;r<20*T;r+=24)for(let i=0;i<24;i++){const a=i*Math.PI/12,p={x:wanted.x+Math.cos(a)*r,y:wanted.y+Math.sin(a)*r};if(this.water(m,p.x,p.y,margin))return p;}
      return null;
    },
    spawn(m,id,at,serial=0){
      const s=this.species(id),p=this.findWater(m,{x:at[0]*T,y:at[1]*T},s.size*.39);if(!p)return;
      const phase=(m.marineAnimals.length*1.87+serial*.41)%(Math.PI*2),radius=id.includes('sardine')?54:s.word==='whale'?96:72;
      m.marineAnimals.push({id:'marine-'+m.id+'-'+id+'-'+serial,species:id,...p,home:{...p},time:phase,phase,facing:1,radius,speed:s.word==='whale'?.12:.23,alpha:s.word==='shoal'?.8:.96});
    },
    seedMap(m){
      if(!m||!this.region(m)||m.marineAnimals)return;
      m.marineAnimals=[];m.marineTime=0;
      const site=D.watchSites[m.id],origin={x:site[0]*T,y:site[1]*T},p=V.Rooms.safe(m,origin,14);
      m.objects.push({id:'marine-watch-'+m.id,type:'marine-watch',...p,label:'Mirante · observar a vida marinha',interactionRange:115});
      const sets={
        harbor:[['humpback',[40,28]],['humpback',[67,41]],['guiana-dolphin',[34,17]],['guiana-dolphin',[38,28]],['loggerhead',[37,26.5]],['loggerhead',[30,16]],['sergeant-major',[25.6,17.5]]],
        beach:[['humpback',[28,9]],['guiana-dolphin',[26,14]],['loggerhead',[26,18]],['sergeant-major',[25,8]]],
        'cape-town':[['humpback',[49,20]],['southern-right',[46,31.4]],['bottlenose',[44,18]],['bottlenose',[48,30]],['cape-fur-seal',[40.7,30.7]],['african-penguin',[42,32.5]],['yellowtail',[39,19]],['snoek',[44,22]]],
        muizenberg:[['southern-right',[18,34]],['humpback',[39,34]],['bottlenose',[25,34]],['cape-fur-seal',[11,34]],['african-penguin',[30,33.5]],['yellowtail',[23,34]]]
      };
      for(const[id,at]of sets[m.id]||[])this.spawn(m,id,at,m.marineAnimals.length);
      const school=this.region(m)==='br'?'brazilian-sardine':'cape-sardine',base=m.id==='beach'?[26.8,12]:m.id==='muizenberg'?[29,34]:m.id==='harbor'?[32,28]:[46,18];
      for(let i=0;i<8;i++)this.spawn(m,school,[base[0]+i%4*.65,base[1]+Math.floor(i/4)*.65],i);
      this.bind(m);
    },
    seed(){for(const m of Object.values(W.maps))this.seedMap(m);for(const m of Object.values(W.maps))if(this.region(m))this.bind(m);V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();},
    updateMap(m,dt){
      if(!m?.marineAnimals)return;dt=V.clamp(dt,0,.08);m.marineTime+=dt;
      if(V.settings.reducedMotion)return;
      for(const animal of m.marineAnimals){
        const s=this.species(animal.species);animal.time+=dt;const phase=animal.phase+animal.time*animal.speed;
        const p={x:animal.home.x+Math.sin(phase)*animal.radius,y:animal.home.y+Math.sin(phase*.73)*animal.radius*.45};
        if(this.water(m,p.x,p.y,s.size*.39)){animal.facing=p.x<animal.x?-1:1;animal.x=p.x;animal.y=p.y;}
      }
    },
    art(c,s,x,y,size,time=0,facing=1){
      const sheet=A[s.sheet],image=this.images[s.sheet];if(!image?.naturalWidth)return false;
      const frame=V.settings.reducedMotion?0:Math.floor(time*(s.word==='whale'?1.7:4))%4,frames=sheet.frames.slice(s.row*4,s.row*4+4),minY=Math.min(...frames.map(f=>f.y-s.row*sheet.cell)),maxY=Math.max(...frames.map(f=>f.y+f.h-s.row*sheet.cell));
      const scale=size/sheet.cell;c.save();c.imageSmoothingEnabled=false;c.translate(Math.round(x),Math.round(y));c.scale(facing,1);
      c.drawImage(image,frame*sheet.cell,s.row*sheet.cell,sheet.cell,sheet.cell,-size/2,-(minY+maxY)/2*scale,size,size);c.restore();return true;
    },
    draw(c,m,cam){
      if(!m?.marineAnimals)return;
      for(const animal of m.marineAnimals){
        const s=this.species(animal.species),x=animal.x-cam.x,y=animal.y-cam.y,size=s.size;
        if(x< -size||y< -size||x>c.canvas.width+size||y>c.canvas.height+size)continue;
        const time=V.settings.reducedMotion?0:animal.time;
        c.save();c.globalAlpha=animal.alpha;
        c.strokeStyle='#b4e3db';c.lineWidth=s.word==='whale'?2:1.4;
        // The wake surrounds the complete silhouette; no water clipping plane.
        for(let i=0;i<2;i++){const wave=V.settings.reducedMotion?i*.4:(time*.45+i*.5)%1;c.globalAlpha=animal.alpha*(1-wave)*.42;c.beginPath();c.ellipse(x,y+size*.08,size*(.46+wave*.16),size*(.19+wave*.09),0,0,Math.PI*2);c.stroke();}
        c.globalAlpha=animal.alpha;this.art(c,s,x,y,size,time,animal.facing);
        if(s.word==='whale'&&!V.settings.reducedMotion){const phase=(time+animal.phase*2)%13;if(phase<1.35){c.fillStyle='#d0f1ec';c.globalAlpha=(1-phase/1.35)*.85;for(let i=0;i<5;i++){const dx=(i-2)*3*phase,dy=phase*(22+Math.abs(i-2)*5);c.fillRect(Math.round(x+animal.facing*size*.2+dx),Math.round(y-size*.12-dy),3,5);}}}
        c.restore();
      }
    },
    drawWatch(c,o,cam){
      if(o.type!=='marine-watch')return false;const x=o.x-cam.x,y=o.y-cam.y;
      c.fillStyle='#694f37';c.fillRect(x-4,y-47,8,48);c.fillStyle='#bba775';c.fillRect(x-23,y-71,46,30);c.fillStyle='#254f54';c.fillRect(x-19,y-67,38,22);
      c.fillStyle='#a8d9de';for(const dx of [-9,9]){c.beginPath();c.arc(x+dx,y-57,7,0,Math.PI*2);c.fill();}c.fillStyle='#8cb6ba';c.fillRect(x-5,y-61,10,7);
      if(W.nearest?.id===o.id)V.Maritime.label(c,'OBSERVAR O MAR',x,y-86,true);return true;
    },
    nearby(m=W.current){return !!(V.SeaNavigation.boat?.map===m.id)||m.objects.some(o=>o.type==='marine-watch'&&V.dist(V.Player.data,o)<190);},
    book(map=W.current.id){
      const i=this.owner();if(V.DuoPanels?.enabled()&&V.DuoPanels.context!==i)return this.owned(i,()=>this.book(map));
      const m=W.maps[map];if(!this.region(m))return;const owner=this.owner(),record=this.ensure().wildlifeReaders[owner],roster=this.roster(m);
      V.UI.modal('Encontros no mar',this.region(m)==='br'?'LITORAL BRASILEIRO · CADERNO DE OBSERVAÇÃO':'COSTA SUL-AFRICANA · CADERNO DE OBSERVAÇÃO',`<p>Observe do mirante ou de uma embarcação. Ao escolher uma espécie, acompanhe o movimento por alguns instantes e registre a observação. O caderno reúne animais de diferentes trechos da costa; escalas e encontros são adaptados ao jogo.</p><div class="marine-roster">${roster.map(s=>`<button class="secondary" data-marine-species="${s.id}"><canvas width="180" height="108" data-marine-thumb="${s.id}" aria-hidden="true"></canvas><strong>${esc(s.name)}</strong><small lang="en">${esc(s.en)}</small><small>${record.includes(s.id)?'✓ No seu caderno':'Observar e conhecer'}</small></button>`).join('')}</div>`,'<button class="secondary" id="marine-notebook-close">Voltar à exploração</button>',true);
      for(const button of V.$$('[data-marine-species]'))button.onclick=()=>this.owned(owner,()=>this.entry(button.dataset.marineSpecies,map));
      for(const canvas of V.$$('[data-marine-thumb]'))this.art(canvas.getContext('2d'),this.species(canvas.dataset.marineThumb),90,53,132,0);
      V.$('#marine-notebook-close').onclick=()=>this.owned(owner,()=>V.UI.close());V.CommunityStories.bind(owner);
    },
    entry(id,map=W.current.id){
      const i=this.owner();if(V.DuoPanels?.enabled()&&V.DuoPanels.context!==i)return this.owned(i,()=>this.entry(id,map));
      const m=W.maps[map],s=this.species(id);if(!s||!this.roster(m).includes(s))return;
      const owner=this.owner(),known=this.ensure().wildlifeReaders[owner].includes(id),source=D.sources[s.source],can=this.nearby(m)&&W.current.id===map;
      V.UI.modal(s.name,s.en.toUpperCase()+' · '+s.scientific,`<div class="marine-observation"><div class="marine-view"><canvas id="marine-observe-canvas" width="360" height="200" aria-label="${esc(s.name)} nadando com o corpo inteiro visível"></canvas><small>Observação ilustrada · ${this.region(m)==='br'?'Brasil':'África do Sul'}</small></div><div><h3>Onde vive</h3><p>${esc(s.location)}</p><h3>Observe um detalhe</h3><p>${esc(s.note)}</p><a href="${esc(source[1])}" target="_blank" rel="noopener noreferrer">${esc(source[0])} ↗</a></div></div><p id="marine-observe-status" role="status">${can?'Observe com calma antes de registrar.':'Aproxime-se do mirante ou embarque para fazer uma nova observação.'}</p><progress id="marine-observe-progress" max="2.4" value="0" aria-label="Tempo de observação"></progress>`,`<button class="secondary" id="marine-observe-back">Fauna desta costa</button><button class="primary" id="marine-observe-record" disabled>${known?'Confirmar nova observação':'Registrar observação'}</button>`,true);
      const button=V.$('#marine-observe-record'),canvas=V.$('#marine-observe-canvas'),status=V.$('#marine-observe-status'),progress=V.$('#marine-observe-progress'),inspection={owner,map,s,state:V.state,button,canvas,status,progress,time:0,can};
      this.inspections.set(owner,inspection);this.paintObservation(inspection);
      button.onclick=()=>this.owned(owner,()=>{if(!this.record(inspection))return;status.textContent='✓ '+s.name+' no seu caderno. O PIX guardou uma palavra deste encontro.';button.disabled=true;button.textContent='Observação registrada';V.PixWorldVocabulary.strip(this.words(s),'Observação marinha · '+s.name);});
      V.$('#marine-observe-back').onclick=()=>this.owned(owner,()=>this.book(map));V.PixWorldVocabulary.strip(this.words(s),'Observação marinha · '+s.name);V.CommunityStories.bind(owner);
    },
    paintObservation(i){const c=i.canvas.getContext('2d');c.fillStyle='#2e727b';c.fillRect(0,0,360,200);c.strokeStyle='#a3d3cb66';for(let j=0;j<3;j++){const wave=V.settings.reducedMotion?j*.32:(i.time*.45+j*.33)%1;c.globalAlpha=(1-wave)*.7;c.beginPath();c.ellipse(180,102,120+wave*32,43+wave*14,0,0,Math.PI*2);c.stroke();}c.globalAlpha=1;this.art(c,i.s,180,95,i.s.word==='whale'?230:164,i.time);},
    tick(dt){for(const[owner,i]of this.inspections){if(i.state!==V.state||!i.button.isConnected){this.inspections.delete(owner);continue;}const map=V.DuoWorld?.enabled()?V.DuoWorld.actors[owner]?.map:W.current.id;if(map!==i.map){i.can=false;i.button.disabled=true;continue;}i.time+=Math.min(dt,.08);this.paintObservation(i);i.progress.value=Math.min(2.4,i.time);if(i.can&&i.time>=2.4&&this.images[i.s.sheet]?.naturalWidth&&!i.recorded){i.button.disabled=false;i.status.textContent='Você observou '+i.s.name.toLowerCase()+'. Pode registrar.';}}},
    record(i){if(i.recorded||i.state!==V.state||!i.can||i.time<2.4||!i.button.isConnected||!this.images[i.s.sheet]?.naturalWidth)return false;const s=this.ensure(),list=s.wildlifeReaders[i.owner];if(!list.includes(i.s.id))list.push(i.s.id);i.recorded=true;V.Living.event('story-marine',i.s.id);V.PixWorldVocabulary.learn(this.words(i.s),'Mirante · '+W.maps[i.map].name+' · '+i.s.name);V.Save.log('observação marinha',i.s.name);V.Save.save();V.Audio.sfx('observe');return true;}
  };
  B.vocabulary();
  const assets=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await assets(...args);await B.load();return this.errors;};
  const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){const name=/assets\/marine-life\/(marine-(?:brazil|cape|fish))\./.exec(key);return name?name[1]:group(key);};
  const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m),region=B.region(m);if(region)out.push('marine-brazil','marine-fish');if(region==='sa')out.push('marine-cape');return[...new Set(out)];};
  const init=W.init.bind(W);W.init=function(...args){const out=init(...args);B.seed();return out;};
  const load=W.load.bind(W);W.load=function(id,...args){B.seedMap(this.maps[id]);return load(id,...args);};
  // Water is painted before buildings, people and boats on all four coast maps.
  for(const owner of [V.Maritime,V.CapeRegion]){const shadow=owner.shadow.bind(owner);owner.shadow=function(c,o,cam){if(o===W.current?.objects[0])B.draw(c,W.current,cam);return shadow(c,o,cam);};}
  const pond=C.pond.bind(C);C.pond=function(c,m,cam){const out=pond(c,m,cam);if(m.id==='beach')B.draw(c,m,cam);return out;};
  const draw=C.drawObject.bind(C);C.drawObject=function(c,o,cam,...args){if(B.drawWatch(c,o,cam))return;return draw(c,o,cam,...args);};
  for(const owner of [V.Maritime,V.CapeRegion]){const draw=owner.drawObject.bind(owner);owner.drawObject=function(c,o,cam,...args){return B.drawWatch(c,o,cam)||draw(c,o,cam,...args);};}
  const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o){if(o?.type==='marine-watch'&&!V.modal&&!V.Dialogue.active&&this.mode==='explore')return B.book();return interact(o);};
  const update=C.update.bind(C);C.update=function(dt){const out=update(dt);B.updateMap(W.current,dt);return out;};
  const gameUpdate=V.Game.update.bind(V.Game);V.Game.update=function(dt){const out=gameUpdate(dt);B.tick(dt);return out;};
  const book=V.Maritime.book.bind(V.Maritime);V.Maritime.book=function(...args){const out=book(...args),owner=B.owner();if(B.region()){const b=document.createElement('button');b.id='sea-book-wildlife';b.className='secondary';b.textContent='Vida marinha';b.onclick=()=>B.owned(owner,()=>B.book());V.$('.modal-footer')?.prepend(b);V.CommunityStories.bind(owner);}return out;};
  const mount=V.SeaNavigation.mount.bind(V.SeaNavigation);V.SeaNavigation.mount=function(...args){const out=mount(...args),root=this.hudRoot(),owner=B.owner();if(root&&!root.querySelector('[data-sea-wildlife]')){const button=document.createElement('button');button.className='secondary';button.dataset.seaWildlife='';button.textContent='Fauna';button.onclick=()=>B.owned(owner,()=>B.book());(root.querySelector('nav')||root).append(button);}return out;};
  const bind=V.PixWorldVocabulary.seed.bind(V.PixWorldVocabulary);V.PixWorldVocabulary.seed=function(...args){const out=bind(...args);for(const m of Object.values(W.maps))if(B.region(m))B.bind(m);return out;};
})();
