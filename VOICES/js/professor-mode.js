/* VOICES — Estúdio do professor. Edição e pacote de autoria offline. */
(()=>{'use strict';
const V=window.V, $=s=>document.querySelector(s), esc=s=>V.escape(s), te=new TextEncoder(), td=new TextDecoder();
const KEY='professor-project-v1', SPRITE_DB='voices-professor-sprites-v1';
const jsonCopy=o=>JSON.parse(JSON.stringify(o)), maxText=12000;
const validPath=path=>/^(?:assets\/[a-zA-Z0-9_./-]+\.(?:png|webp))$/.test(path)&&!path.includes('..')&&path.length<300;
const imageCanonical=path=>V.ImageFormats?.canonical(path)||path;
const webpBytes=bytes=>bytes.length>=12&&[82,73,70,70].every((x,i)=>bytes[i]===x)&&[87,69,66,80].every((x,i)=>bytes[i+8]===x);
const stringOK=s=>typeof s==='string'&&s.length<=maxText&&!/[\u0000-\u0008\u000e-\u001f]/.test(s);
const strMap=new Map(),baselineFields=new Map();let project={version:1,text:{},fields:{}};
const slices=s=>s.split('|');
function targetFor(key){const bits=slices(key);const allowed=new Set(['content','learning','cozyContent','culturalContent','wardrobeContent','heritageContent','editorialContent','neighborsContent','regionalContent','translationContent','protestContent','coastContent','campusContent','fieldGuideContent','AncestralData','CultureChallengeData','OnboardingData','PlaygroundData']);if(bits.length<2||!allowed.has(bits[0])||bits.some(b=>['__proto__','prototype','constructor'].includes(b)))return null;let parent=V[bits[0]];for(let i=1;i<bits.length-1;i++){if(!parent||typeof parent!=='object'||!Object.prototype.hasOwnProperty.call(parent,bits[i]))return null;parent=parent[bits[i]];}const name=bits.at(-1);return parent&&Object.prototype.hasOwnProperty.call(parent,name)&&typeof parent[name]==='string'?{parent,name}:null;}
function substitute(s){if(typeof s!=='string')return s;return strMap.has(s)?strMap.get(s):s;}
function persist(){V.Save.write(KEY,project);}
function loadProject(){const d=V.Save.read(KEY,null);if(d&&d.version===1&&d.text&&typeof d.text==='object'&&d.fields&&typeof d.fields==='object'){
  project={version:1,text:{},fields:{}};
  Object.entries(d.text).slice(0,4000).forEach(([k,v])=>{if(stringOK(k)&&stringOK(v))project.text[k]=v;});
  Object.entries(d.fields).slice(0,6000).forEach(([k,v])=>{if(targetFor(k)&&stringOK(v))project.fields[k]=v;});
 }
 for(const [before,after] of Object.entries(project.text))strMap.set(before,after);
 for(const [path,value] of Object.entries(project.fields)){const o=targetFor(path);if(o){if(!baselineFields.has(path))baselineFields.set(path,o.parent[o.name]);o.parent[o.name]=value;}}
}
// The original string remains the lookup key; dialog typing, subtitles and UI re-renders all reuse it.
const nativeLang=V.lang, nativeEscape=V.escape;
V.lang=function(s,grade){return substitute(nativeLang(s,grade));};
V.escape=function(s){return nativeEscape(substitute(s));};
const Studio=V.ProfessorStudio={active:false,view:'',editing:false,project,patches:new Map(),request:null,studentSettings:null,hover:null,observer:null,ready:false};
Studio.db=async function(){if(!('indexedDB' in window))return null;return new Promise(resolve=>{try{const r=indexedDB.open(SPRITE_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('png');r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);}catch{resolve(null);}});};
Studio.storePatch=async function(path,data){if(!validPath(path))throw Error('Caminho de imagem inválido.');const bytes=data instanceof Uint8Array?data:new Uint8Array(data);if(bytes.byteLength>14000000)throw Error('Imagem excede 14 MB.');if(!webpBytes(bytes)&&(bytes.length<8||![137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x)))throw Error('O arquivo não é um PNG ou WebP válido.');const aliases=[...this.patches.keys()].filter(key=>key!==path&&imageCanonical(key)===imageCanonical(path));for(const key of aliases){this.patches.delete(key);const url=this.blobUrls?.get(key);if(url)URL.revokeObjectURL(url);this.blobUrls?.delete(key);}this.patches.set(path,bytes.slice());const oldUrl=this.blobUrls?.get(path);if(oldUrl){URL.revokeObjectURL(oldUrl);this.blobUrls.delete(path);}this.updateImage?.(path);const db=await this.db();if(db){await new Promise(resolve=>{const t=db.transaction('png','readwrite');for(const key of aliases)t.objectStore('png').delete(key);t.objectStore('png').put(bytes.slice(),path);t.oncomplete=t.onerror=()=>resolve();});db.close();}};
Studio.loadPatches=async function(){const db=await this.db();if(!db)return;try{const rows=await new Promise(resolve=>{const t=db.transaction('png','readonly'),r=t.objectStore('png').getAllKeys();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>resolve([]);});for(const k of rows){if(!validPath(k))continue;const b=await new Promise(resolve=>{const t=db.transaction('png','readonly'),r=t.objectStore('png').get(k);r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);});if(b)this.patches.set(k,new Uint8Array(b));}}finally{db.close();}};
Studio.setup=async function(){loadProject();this.project=project;await this.loadPatches();this.ready=true;};
// Preserve progress and the local game log when free-play tools are in use.
const rawWrite=V.Save.write.bind(V.Save),rawRemove=V.Save.remove.bind(V.Save);
V.Save.write=function(key,value){if(Studio.active&&Studio.freePlay&&(key==='save'||key==='log')){Studio.temporary[key]=jsonCopy(value);return true;}return rawWrite(key,value);};
V.Save.remove=function(key){if(Studio.active&&Studio.freePlay&&(key==='save'||key==='log')){delete Studio.temporary[key];return;}return rawRemove(key);};
Studio.temporary={};Studio.freePlay=false;
// Apply edited PNGs to the live game wherever the asset is referenced by path.
Studio.blobUrls=new Map();Studio.assetPaths=new Map();
Studio.assetUrl=function(path){if(!this.patches.has(path)){path=[...this.patches.keys()].find(key=>imageCanonical(key)===imageCanonical(path));if(!path)return null;}if(!this.blobUrls.has(path))this.blobUrls.set(path,URL.createObjectURL(new Blob([this.patches.get(path)],{type:webpBytes(this.patches.get(path))?'image/webp':'image/png'})));return this.blobUrls.get(path);};
Studio.updateImage=function(path){const url=this.assetUrl(path);if(!url)return;for(const [key,origin]of this.assetPaths){if(imageCanonical(origin)!==imageCanonical(path))continue;const img=new Image();img.onload=()=>{V.Assets.images[key]=img;};img.src=url;}this.applyDomImages($('#app'));};
Studio.applyDomImages=function(root){if(!root||!this.patches.size)return;root.querySelectorAll('img[src]').forEach(img=>{if(img.closest('#professor-studio'))return;const base=img.dataset.professorOriginalSrc||img.getAttribute('src');if(!base)return;let key=base.replace(/^.*?(assets\/)/,'$1').split('?')[0];const url=this.assetUrl(key);if(!url)return;img.dataset.professorOriginalSrc=base;if(img.src!==url)img.src=url;});};
const initialAssetLoad=V.Assets.load.bind(V.Assets);
Studio.registerAssetImages=function(){for(const [key,img]of Object.entries(V.Assets.images)){if(!img||typeof img.src!=='string'||!img.naturalWidth)continue;const path=img.src.replace(/^.*?(assets\/)/,'$1').split('?')[0];if(path.startsWith('assets/'))this.assetPaths.set(key,path);}for(const path of this.patches.keys())this.updateImage(path);};
V.Assets.load=async function(){await Studio.startPromise;const r=await initialAssetLoad();Studio.registerAssetImages();return r;};
Studio.root=function(){let root=$('#professor-studio');if(!root){root=document.createElement('section');root.id='professor-studio';root.className='professor-studio';root.hidden=true;document.body.appendChild(root);}return root;};
Studio.enter=function(){if(this.active){this.dashboard();return;}this.active=true;this.studentSettings={unlockAll:!!V.settings.unlockAll,translation:!!V.settings.translation,subtitles:!!V.settings.subtitles};V.settings.unlockAll=true;V.settings.translation=true;V.settings.subtitles=true;this.root();document.body.classList.add('professor-active');this.dashboard();};
Studio.exit=function(){if(this.freePlay){V.Game.toTitle();V.state=null;this.freePlay=false;this.temporary={};}if(this.studentSettings){Object.assign(V.settings,this.studentSettings);this.studentSettings=null;V.Save.applySettings();}this.active=false;this.editing=false;this.hidePencil();this.root().hidden=true;this.root().innerHTML='';this.view='';document.body.classList.remove('professor-active','professor-live-edit');this.hover=null;};
Studio.banner=function(active){let btn=$('#professor-return');if(!btn){btn=document.createElement('button');btn.id='professor-return';btn.className='professor-return';btn.innerHTML='✎ <span>Modo Professor</span>';btn.title='Voltar às ferramentas do professor';btn.onclick=()=>this.dashboard();document.body.appendChild(btn);}btn.hidden=!active;};
Studio.dashboard=function(){if(!this.active)return;this.view='dashboard';this.editing=false;document.body.classList.remove('professor-live-edit');this.hidePencil();this.banner(false);V.UI.close();const el=this.root();el.hidden=false;el.innerHTML=`<div class="professor-shell"><header class="professor-head"><div><small>VOICES / AMBIENTE DE AUTORIA</small><h2>Modo Professor <span>✎</span></h2><p>Prepare atividades, revise falas e organize o mundo sem alterar o progresso dos alunos.</p></div><button data-studio="exit" class="professor-outline">Sair do modo professor ✕</button></header><div class="professor-grid">
 <button data-studio="play"><b>▶</b><strong>Explorar sem bloqueios</strong><span>Todos os capítulos, regiões e registros disponíveis para testar. Progresso do aluno preservado.</span></button>
 <button data-studio="live"><b>✎</b><strong>Lápis nos textos</strong><span>Passe sobre uma fala, legenda, tradução ou texto na tela e clique no lápis — ou dê dois cliques no próprio texto — para alterar.</span></button>
 <button data-studio="texts"><b>▤</b><strong>Biblioteca de textos</strong><span>Busque e edite textos da história, diálogos, objetivos e descrições do conteúdo.</span></button>
 <button data-studio="scenes"><b>▦</b><strong>Editor de cenários</strong><span>Posicione móveis, pisos, portas, objetos e interações no editor já existente.</span></button>
 <button data-studio="sprites"><b>▧</b><strong>Editor de sprites</strong><span>Use o Pixel Lab sem sair do Modo Professor e incorpore as imagens à exportação.</span></button>
 <button data-studio="curriculum"><b>?</b><strong>Questões e vocabulário</strong><span>Edite perguntas, explicações e traduções nas ferramentas de conteúdo já existentes.</span></button>
 <button data-studio="bundle"><b>↓</b><strong>Exportar e importar tudo</strong><span>Um único ZIP com textos, traduções, cenários e sprites editados, com seus caminhos originais.</span></button>
 </div><footer class="professor-notice">Edições autorais são locais até você exportar e compartilhar o pacote. O código do professor é uma trava local, não autenticação de servidor.</footer></div>`;
 el.querySelectorAll('[data-studio]').forEach(b=>b.onclick=()=>({exit:()=>this.exit(),play:()=>this.play(false),live:()=>this.play(true),texts:()=>this.textLibrary(),scenes:()=>this.scenes(),sprites:()=>this.sprites(),curriculum:()=>this.curriculum(),bundle:()=>this.bundle()})[b.dataset.studio]?.());};
Studio.curriculum=function(){this.root().hidden=true;this.view='curriculum';this.banner(true);V.Teacher.show('questions');};
Studio.play=function(edit){this.view='game';this.editing=edit;this.root().hidden=true;this.banner(true);document.body.classList.toggle('professor-live-edit',edit);
 if(!V.state||V.Game.screen!=='game'||!this.freePlay){this.freePlay=true;this.temporary={};V.Game.newState({grade:7,character:'nia',name:'Exploração do professor'});const s=V.state;s.flags.prologueDone=true;s.flags.prologueStarted=true;s.completed=[1,2,3,4,5,6];s.unlocked=6;s.evidence=V.content.chapters.flatMap(c=>c.clues||[]).map(c=>c.id);s.tools=Array.from(new Set([...s.tools,'PIX Tradutor']));V.Game.startGame();}else{V.UI.close();}
 V.settings.unlockAll=true;V.Game.updateHUD?.();this.message(edit?'Lápis ativo. Passe o cursor sobre o texto e clique em ✎, ou dê dois cliques no próprio texto.':'Exploração livre habilitada.');};
Studio.scenes=function(){this.view='scenes';this.root().hidden=true;this.banner(true);if(V.Game.screen==='game'&&V.Game.mode!=='explore'){this.message('Saia do desafio para editar o cenário.');this.dashboard();return;}V.UI.close();V.SceneEditor.open();if(!V.SceneEditor.active){this.message('O editor de cenários não pôde ser aberto.');this.dashboard();}};
Studio.sprites=function(){this.view='sprites';this.banner(false);const el=this.root();el.hidden=false;el.innerHTML=`<div class="professor-pixel"><div class="professor-pixel-top"><strong>✎ Modo Professor <small>/ Pixel Lab</small></strong><span>As sprites são guardadas para o pacote unificado.</span><button id="professor-close-pixel">← Voltar ao painel</button></div><iframe id="professor-pixel-frame" src="sprite-editor.html?professor=1" title="Editor de sprites Pixel Lab" allow="clipboard-read;clipboard-write"></iframe></div>`;
 $('#professor-close-pixel').onclick=async()=>{await this.askPatches();this.dashboard();};};
Studio.message=function(msg){V.UI?.toast?.(msg);};
Studio.textTarget=function(el){if(!el||!el.isConnected||el.closest('#professor-studio,#professor-return,#professor-pencil,.scene-editor,.teacher-toolbar,.professor-ui'))return null;const dialogueText=el.closest('#dialogue-en,#dialogue-pt');if(dialogueText&&V.Dialogue.active){const line=V.Dialogue.lines[V.Dialogue.index];if(line){const raw=nativeLang(dialogueText.id==='dialogue-en'?line.en:line.pt);return {el:dialogueText,nodes:[],value:raw};}}if(el.closest('script,style,svg,canvas,input,textarea,select,option,[contenteditable],.dialogue-buttons,.modal-close'))return null;
 let node=el;for(let i=0;i<3&&node;i++,node=node.parentElement){if(!node.matches('p,span,small,strong,b,em,h1,h2,h3,h4,h5,h6,label,button,li,div'))continue;const nodes=[...node.childNodes].filter(n=>n.nodeType===3&&n.nodeValue?.trim());const value=nodes.map(n=>n.nodeValue).join(' ').trim();if(nodes.length===1&&value.length>1&&value.length<maxText&&/[\p{L}\p{N}]/u.test(value))return {el:node,nodes,value};}return null;};
Studio.clearPencilHide=function(){if(this.pencilHideTimer){clearTimeout(this.pencilHideTimer);this.pencilHideTimer=null;}};
Studio.hidePencil=function(){this.clearPencilHide();const b=$('#professor-pencil');if(b)b.hidden=true;};
Studio.hidePencilSoon=function(delay=260){this.clearPencilHide();const b=$('#professor-pencil');if(!b)return;this.pencilHideTimer=setTimeout(()=>{b.hidden=true;this.pencilHideTimer=null;},delay);};
Studio.setHover=function(t){const b=$('#professor-pencil')||this.createPencil();this.clearPencilHide();this.hover=t;const r=t.el.getBoundingClientRect();b.style.left=Math.max(8,Math.min(innerWidth-54,r.right+8))+'px';b.style.top=Math.max(8,Math.min(innerHeight-54,Math.max(8,r.top-2)))+'px';b.hidden=false;};
Studio.createPencil=function(){const b=document.createElement('button');b.id='professor-pencil';b.className='professor-pencil';b.innerHTML='✎';b.title='Editar este texto';b.setAttribute('aria-label','Editar este texto');b.hidden=true;b.addEventListener('pointerenter',()=>this.clearPencilHide());b.addEventListener('pointerleave',()=>this.hidePencilSoon(320));b.onclick=()=>{const t=this.hover;this.hidePencil();if(t)this.editText(t);};document.body.append(b);return b;};
Studio.editText=function(target){const current=target.value;let original=target.nodes?.[0]?.__voicesOriginal||current;
 if(target.el?.closest('#dialogue-root')){const line=V.Dialogue.lines[V.Dialogue.index];if(line){const en=nativeLang(line.en),pt=nativeLang(line.pt);if(target.el.closest('#dialogue-en'))original=target.el.__voicesOriginal||en;if(target.el.closest('#dialogue-pt'))original=target.el.__voicesOriginal||pt;}}
 const popup=document.createElement('div');popup.className='professor-ui professor-edit-dialog';popup.innerHTML=`<div role="dialog" aria-modal="true" aria-labelledby="professor-edit-heading"><header><div><small>✎ EDITOR DE TEXTO</small><h3 id="professor-edit-heading">Editar trecho</h3></div><button data-close aria-label="Cancelar">✕</button></header><p>O texto alterado será reutilizado nas próximas exibições e incluído no pacote de exportação.</p><label>Texto original<textarea readonly>${nativeEscape(original)}</textarea></label><label>Novo texto<textarea id="professor-edit-value" maxlength="12000">${nativeEscape(substitute(original))}</textarea></label><footer><button data-cancel>Cancelar</button><button data-reset>Restaurar original</button><button data-save class="professor-primary">Salvar texto</button></footer></div>`;
 document.body.append(popup);const done=()=>{popup.remove();};popup.querySelector('[data-close]').onclick=done;popup.querySelector('[data-cancel]').onclick=done;popup.querySelector('[data-reset]').onclick=()=>{popup.querySelector('#professor-edit-value').value=original;};popup.querySelector('[data-save]').onclick=()=>{const next=popup.querySelector('#professor-edit-value').value;if(!stringOK(next)){this.message('Trecho muito longo ou com caracteres inválidos.');return;}if(next===original){delete project.text[original];strMap.delete(original);}else{project.text[original]=next;strMap.set(original,next);}persist();done();this.refreshRendered();this.message('Texto salvo no projeto do professor.');};popup.querySelector('#professor-edit-value').focus();};
Studio.refreshRendered=function(){const root=$('#app');if(root){this.walkNodes(root);this.applyDomImages(root);}if(V.Dialogue?.active){const line=V.Dialogue.lines[V.Dialogue.index];if(line){V.Dialogue.currentText=V.lang(line.en);const en=$('#dialogue-en');if(en)en.textContent=V.Dialogue.currentText;V.Dialogue.typing=99999;V.Dialogue.translate();}}};
Studio.walkNodes=function(root){if(!root||!root.isConnected)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const ignore='script,style,textarea,option,svg,.professor-ui,.scene-editor';let n,count=0;while((n=walker.nextNode())&&count<25000){if(!n.parentElement||n.parentElement.closest(ignore)||n.parentElement.closest('#dialogue-en,#dialogue-pt')||!n.nodeValue.trim())continue;
 const old=n.__voicesOriginal===undefined?n.nodeValue:n.__voicesOriginal;if(n.__voicesPatched!==undefined&&n.nodeValue!==n.__voicesPatched){n.__voicesOriginal=n.nodeValue;}
 const src=n.__voicesOriginal===undefined?old:n.__voicesOriginal, next=substitute(src);if(n.nodeValue!==next){n.__voicesOriginal=src;n.__voicesPatched=next;n.nodeValue=next;}count++;}};
/* Biblioteca editorial: várias fontes de conteúdo, classificação, filtros e paginação real. */
const LIBRARY_AREAS=[
 ['all','Todas'],['menu','Menu inicial'],['submenu','Menus e submenus'],['npc','Conversas de NPCs'],
 ['books','Livros e leituras'],['descriptions','Descrições'],['missions','Missões e objetivos'],
 ['questions','Questões e respostas'],['translations','Vocabulário e traduções'],
 ['objects','Objetos e acervo'],['guides','Tutoriais e instruções'],['titles','Títulos e nomes'],['sources','Fontes e créditos'],['other','Outros textos']
];
const LIBRARY_ROOTS=[
 ['content','Conteúdo principal'],['learning','Leituras e moradores'],['cozyContent','Vida no bairro'],
 ['culturalContent','Acervo cultural'],['wardrobeContent','Roupas e personagens'],
 ['heritageContent','Memória e patrimônio'],['editorialContent','Biblioteca e jornal'],
 ['neighborsContent','Vizinhança'],['regionalContent','Regiões'],['translationContent','Idiomas'],
 ['protestContent','Manifestações'],['coastContent','Litoral'],['campusContent','Escola'],
 ['fieldGuideContent','Caderno de campo'],['AncestralData','Historiográfo'],['CultureChallengeData','Desafios culturais'],['OnboardingData','Introdução e ajuda'],['PlaygroundData','Jogos e treinos']
];
const libraryRootSet=new Set(LIBRARY_ROOTS.map(r=>r[0]));
const normalizeSearch=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const libraryGroupKey=k=>/^(id|key|sprite|asset|assets|path|image|images|url|uri|color|colour|accent|background|character|speaker|sourceIds|contextSources|referenceIds|type|kind|family|slug|icon|sound|audio|file|filename|licenseURL|layer|map|readingId|assetId|minigame|illustrationStatus|furnitureTheme|version|pattern|floor|species|breed|door)$/i.test(k);
const libraryTextEligible=(k,v)=>typeof v==='string'&&v.trim().length>=2&&v.length<=maxText&&!/^(?:assets\/|https?:\/\/|data:|#[0-9a-f]{3,8}$)/i.test(v)&&!/^[-_.\w/]+\.(?:png|webp|svg|mp3|wav|jpg|json)$/i.test(v)&&!libraryGroupKey(k);
function categoryFor(root,parts,field){
 if(root==='OnboardingData'||root==='PlaygroundData'&&parts[0]==='guides')return 'guides';
 const path=parts.map(v=>String(v).toLowerCase());const k=String(field).toLowerCase();
 if(root==='fieldGuideContent')return path.includes('sources')?'sources':['en','pt','word'].includes(k)?'translations':'descriptions';
 if(root==='translationContent')return 'translations';
 if(root==='CultureChallengeData')return 'questions';
 if(path.some(v=>/^(resolution|resolutions|introduction|intro|epilogue|prologue|script|scripts|narration|dialogues|dialogue|responses|reply|replies|monologue|talk|speeches|repeat|conversation|conversations|lines|say|speech|talks|chats|greetings|farewell)$/.test(v)))return 'npc';
 if(path.some(v=>/^(clues|evidence|records|archive|gallery|exhibit|exhibits|catalog|catalogue|objects|timeline)$/.test(v)))return 'objects';
 if(path.some(v=>/^(biascases|testcases|cases|options|missing)$/.test(v)))return 'questions';
 if(path.some(v=>/^(sensitiverecord|recordsnote|factsheet)$/.test(v)))return 'descriptions';
 if(path.some(v=>/^(dialogue|dialogues|conversation|conversations|lines|say|speech|replies|talks|chats|greetings|repeat|intro|farewell)$/.test(v)) || path.includes('residents') && (['en','pt','speaker','repeat','lines'].includes(k)||path.includes('lines')))return 'npc';
 if(path.some(v=>/^(readings|reading|books|book|chapters-text|paragraphs|pages|passages|texts|story|stories|readingcards)$/.test(v)))return 'books';
 if(path.some(v=>/^(questions|quiz|quizzes|choices|answers|answerskey|exercises|activities|minigames|challenges)$/.test(v)) || /^(prompt|explanation|correctanswer|answer|option|hint|feedback)$/.test(k))return 'questions';
 if(path.some(v=>/^(missions|quests|sidequests|objectives|goals|tasks|steps|achievements|targets)$/.test(v)) || /^(objective|reward|goal|mission)$/.test(k))return 'missions';
 if(path.some(v=>/^(glossary|vocabulary|words|translation|translations|dictionary|slang|expressions)$/.test(v)) || /^(examplept|translation|translate|meaning|correcteden|correctedpt)$/.test(k))return 'translations';
 if(path.some(v=>/^(sources|citations|references|bibliography|credits)$/.test(v)) || /^(source|reference|citation|license|author|publisher)$/.test(k))return 'sources';
 if(/^(description|desc|context|identity|personality|appearance|summary|detail|details|brief|note|caption|biography|bio|profile|role|about|explanationtext|subtitle|logic|takeaway|purpose|mechanism)$/.test(k))return 'descriptions';
 if(path.some(v=>/^(tutorial|tutorials|instructions|guide|guides|help|tips|hint|hints|walkthrough)$/.test(v))||/^(instruction|instructions|tip|hint|help|howto)$/.test(k))return 'guides';
 if(/^(title|name|label|heading|displayname|headline)$/.test(k))return 'titles';
 if(path.some(v=>/^(gallery|catalog|catalogue|illustrations|objects|scenes|items|artworks|equipment|furniture|props|places|maps|exhibits)$/.test(v)))return 'objects';
 if(path.some(v=>/^(residents|characters|npcs|people)$/.test(v)))return 'npc';
 return 'other';
}
function languageFor(parts,field){const a=[...parts,String(field)].map(s=>String(s).toLowerCase());if(a.some(v=>/^(pt|pt-br|portuguese|portugues|examplept|translationpt|subtitlept)$/.test(v)))return 'pt';if(a.some(v=>/^(en|en-us|english|exampleen|subtitleen)$/.test(v)))return 'en';return 'unspecified';}
function sectionFor(root,parts,ancestors){
 const names=Object.fromEntries(LIBRARY_ROOTS);const label=names[root]||root;
 const first=parts[0];if(!first)return label;
 const feature=({readings:'Livros',books:'Livros',residents:'Moradores',characters:'Personagens',conversations:'Diálogos',gallery:'Galeria',questions:'Questões',missions:'Missões',quests:'Missões',glossary:'Dicionário',chapters:'Capítulos',sources:'Fontes',evidence:'Evidências',timeline:'Linha do tempo',scenes:'Cenários'})[String(first)]||String(first).replace(/([a-z])([A-Z])/g,'$1 $2');
 return label+' · '+feature;
}
function contextFor(parts,ancestors){for(let i=ancestors.length-1;i>=0;i--){const obj=ancestors[i];if(obj&&!Array.isArray(obj)&&typeof obj==='object'){
   const title=obj.name||obj.title||obj.label||obj.map||obj.id;
   if(typeof title==='string'&&title.trim()&&title.length<100&&!/^(assets\/|https?:)/.test(title))return title;
 }}
 return '';
}
Studio.indexStrings=function(){
 const items=[],seen=new WeakSet(),cap=90000;
 const add=(item)=>{item.index=items.length;item.search=normalizeSearch([item.value,item.path,item.section,item.context,item.rootLabel,LIBRARY_AREAS.find(a=>a[0]===item.category)?.[1]].join(' '));items.push(item);};
 function visit(obj,root,parts,ancestors,depth){if(obj===null||typeof obj!=='object'||depth>16||seen.has(obj)||items.length>=cap)return;seen.add(obj);
  for(const [key,value] of Object.entries(obj)){
   if((root==='OnboardingData'&&['event','prepare','target','point','action'].includes(key))||(root==='PlaygroundData'&&['event','focus','item','ref','relation','to'].includes(key)))continue;
   if(libraryGroupKey(key)||key==='__proto__'||key==='constructor'||key==='prototype')continue;
   if(libraryTextEligible(key,value)){
    const group=sectionFor(root,parts,ancestors),context=contextFor(parts,ancestors);
    add({mode:'field',path:[root,...parts,key].join('|'),value,category:categoryFor(root,parts,key),language:languageFor(parts,key),section:group,context,rootLabel:group.split(' · ')[0]});
   }else if(value&&typeof value==='object')visit(value,root,[...parts,key],[...ancestors,obj],depth+1);
  }
 }
 for(const [root,label]of LIBRARY_ROOTS){const data=V[root];if(data&&typeof data==='object')visit(data,root,[],[],0);}
 for(const [i,obj]of (V.professorUITexts||[]).entries()){
  if(!obj||!stringOK(obj.value))continue;
  add({mode:'literal',path:'interface|'+i,value:obj.value,category:obj.area==='menu'?'menu':'submenu',language:'unspecified',section:obj.section||'Interface',context:obj.origin||'Interface do jogo',rootLabel:'Interface'});
 }
 const indexed=new Set(items.filter(x=>x.mode==='literal').map(x=>x.value));
 for(const [old,newValue] of Object.entries(project.text))if(!indexed.has(old)){
  add({mode:'literal',path:'custom|'+items.length,value:old,category:'submenu',language:'unspecified',section:'Edições feitas com o lápis',context:'Texto editado na interface',rootLabel:'Interface'});
 }
 return items;
};
Studio.libraryState={query:'',area:'all',section:'all',language:'all',editsOnly:false,page:0,pageSize:60};
Studio.textLibrary=function(q=''){
 this.view='texts';this.banner(false);this.editing=false;this.hidePencil();const el=this.root();el.hidden=false;
 this.items=this.indexStrings();const st=this.libraryState;st.query=q||st.query||'';st.page=0;
 el.innerHTML=`<div class="professor-library professor-library-v2">
  <header><div><small>VOICES / BIBLIOTECA DE AUTORIA</small><h2>Biblioteca de textos</h2><p>Encontre diálogos, livros, menus e descrições por área. As alterações entram no mesmo pacote dos cenários e sprites.</p></div><button id="professor-library-back">← Painel</button></header>
  <div class="professor-library-sticky"><div class="professor-search"><label class="professor-search-field"><span class="professor-sr-only">Pesquisar em todos os textos</span><input id="professor-find-text" type="search" placeholder="Pesquisar texto, NPC, livro, objetivo ou tradução…" value="${nativeEscape(st.query)}" autocomplete="off"></label><button id="professor-clear" class="professor-quiet" title="Limpar pesquisa" aria-label="Limpar pesquisa">Limpar</button><strong id="professor-result-count" role="status" aria-live="polite"></strong></div>
   <div class="professor-library-categories" id="professor-category-list" role="group" aria-label="Filtrar tipo de texto"></div>
   <div class="professor-library-filters"><label>Seção<select id="professor-section"></select></label><label>Idioma<select id="professor-language"><option value="all">Todos os idiomas</option><option value="pt">Português (PT)</option><option value="en">Inglês (EN)</option><option value="unspecified">Sem idioma definido</option></select></label><label class="professor-only-edited"><input type="checkbox" id="professor-edits-only"> Apenas editados</label><button id="professor-reset-filters" class="professor-quiet">Restaurar filtros</button></div>
  </div><div class="professor-library-summary"><span id="professor-range"></span><label>Itens por página <select id="professor-page-size"><option value="30">30</option><option value="60">60</option><option value="120">120</option></select></label></div>
  <div id="professor-results" class="professor-results"></div><nav id="professor-pagination" class="professor-pagination" aria-label="Navegar nas páginas dos textos"></nav>
  <footer class="professor-notice">A busca pesquisa todos os textos indexados, não somente a página. Textos de interface fora do catálogo podem ser modificados pelo lápis ou duplo clique no Modo Professor.</footer></div>`;
 $('#professor-library-back').onclick=()=>this.dashboard();
 let timer=0;$('#professor-find-text').oninput=e=>{clearTimeout(timer);timer=setTimeout(()=>{st.query=e.target.value;st.page=0;this.drawTextResults();},140);};
 $('#professor-clear').onclick=()=>{st.query='';$('#professor-find-text').value='';st.page=0;this.drawTextResults();$('#professor-find-text').focus();};
 $('#professor-language').value=st.language;$('#professor-language').onchange=e=>{st.language=e.target.value;st.page=0;this.drawTextResults();};
 $('#professor-edits-only').checked=st.editsOnly;$('#professor-edits-only').onchange=e=>{st.editsOnly=e.target.checked;st.page=0;this.drawTextResults();};
 $('#professor-page-size').value=String(st.pageSize);$('#professor-page-size').onchange=e=>{st.pageSize=+e.target.value;st.page=0;this.drawTextResults();};
 $('#professor-section').onchange=e=>{st.section=e.target.value;st.page=0;this.drawTextResults();};
 $('#professor-reset-filters').onclick=()=>{Object.assign(st,{query:'',area:'all',section:'all',language:'all',editsOnly:false,page:0});$('#professor-find-text').value='';$('#professor-language').value='all';$('#professor-edits-only').checked=false;this.drawTextResults();};
 this.drawTextResults();
};
Studio.isEdited=function(item){return item.mode==='literal'?Object.prototype.hasOwnProperty.call(project.text,item.value):Object.prototype.hasOwnProperty.call(project.fields,item.path);};
Studio.drawTextResults=function(){
 const st=this.libraryState,items=this.items||[],terms=normalizeSearch(st.query).split(/\s+/).filter(Boolean);
 const areaCounts=new Map();for(const item of items){if(terms.every(t=>item.search.includes(t))){areaCounts.set(item.category,(areaCounts.get(item.category)||0)+1);areaCounts.set('all',(areaCounts.get('all')||0)+1);}}
 const nav=$('#professor-category-list');if(!nav)return;
 nav.innerHTML=LIBRARY_AREAS.map(([id,label])=>`<button type="button" data-area="${id}" class="${id===st.area?'active':''}" aria-pressed="${id===st.area}">${nativeEscape(label)} <span>${areaCounts.get(id)||0}</span></button>`).join('');
 nav.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>{st.area=b.dataset.area;st.section='all';st.page=0;this.drawTextResults();});
 const initial=items.filter(x=>(st.area==='all'||st.area===x.category)&&terms.every(t=>x.search.includes(t)));
 const sections=[...new Set(initial.map(x=>x.section))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const sectionSelect=$('#professor-section');const prevSection=st.section;
 if(prevSection!=='all'&&!sections.includes(prevSection))st.section='all';
 sectionSelect.innerHTML='<option value="all">Todas as seções ('+sections.length+')</option>'+sections.map((s,i)=>`<option value="${nativeEscape(s)}">${nativeEscape(s)}</option>`).join('');sectionSelect.value=st.section;
 const filtered=initial.filter(x=>(st.section==='all'||x.section===st.section)&&(st.language==='all'||x.language===st.language)&&(!st.editsOnly||this.isEdited(x)));
 const pageSize=st.pageSize,totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));st.page=Math.max(0,Math.min(st.page,totalPages-1));
 const start=st.page*pageSize,rows=filtered.slice(start,start+pageSize);
 $('#professor-result-count').textContent=`${filtered.length.toLocaleString('pt-BR')} encontrados / ${items.length.toLocaleString('pt-BR')} indexados`;
 $('#professor-range').textContent=filtered.length?`Mostrando ${start+1}–${start+rows.length} de ${filtered.length.toLocaleString('pt-BR')} textos · página ${st.page+1} de ${totalPages}`:'Nenhum resultado com os filtros atuais';
 $('#professor-results').innerHTML=rows.map(item=>`<article class="${this.isEdited(item)?'professor-result-edited':''}"><div class="professor-result-main"><div class="professor-result-meta"><span class="professor-result-category">${nativeEscape(LIBRARY_AREAS.find(a=>a[0]===item.category)?.[1]||'Texto')}</span><span>${nativeEscape(item.section)}</span>${item.context?`<span title="Contexto">${nativeEscape(item.context)}</span>`:''}${item.language!=='unspecified'?`<span class="professor-lang">${item.language.toUpperCase()}</span>`:''}${this.isEdited(item)?'<span class="professor-edited-tag">Editado</span>':''}</div><p>${nativeEscape(item.mode==='literal'?substitute(item.value):item.value)}</p><small class="professor-technical-path" title="Origem do trecho">${nativeEscape(item.path.replaceAll('|',' › '))}</small></div><button data-text-idx="${item.index}" class="professor-edit-action" aria-label="Editar texto: ${nativeEscape(item.value.slice(0,48))}">✎ Editar</button></article>`).join('')||'<div class="professor-empty"><strong>Nenhum texto encontrado</strong><p>Tente outra palavra, categoria ou limpe os filtros.</p></div>';
 $('#professor-results').querySelectorAll('[data-text-idx]').forEach(b=>b.onclick=()=>this.editField(items[+b.dataset.textIdx]));
 const pagination=$('#professor-pagination');pagination.innerHTML=`<button data-page-action="first" ${st.page===0?'disabled':''} aria-label="Primeira página">«</button><button data-page-action="prev" ${st.page===0?'disabled':''}>← Anterior</button><label>Página <input id="professor-page-number" type="number" min="1" max="${totalPages}" value="${st.page+1}" aria-label="Número da página"> de ${totalPages}</label><button data-page-action="next" ${st.page>=totalPages-1?'disabled':''}>Próxima →</button><button data-page-action="last" ${st.page>=totalPages-1?'disabled':''} aria-label="Última página">»</button>`;
 pagination.querySelectorAll('[data-page-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.pageAction;st.page=a==='first'?0:a==='prev'?st.page-1:a==='next'?st.page+1:totalPages-1;this.drawTextResults();$('#professor-results').scrollIntoView({behavior:'auto',block:'start'});});
 $('#professor-page-number').onchange=e=>{st.page=Math.min(totalPages-1,Math.max(0,(+e.target.value||1)-1));this.drawTextResults();};
};
Studio.editField=function(item){
 const root=this.root(),el=document.createElement('div'),literal=item.mode==='literal';el.className='professor-ui professor-edit-dialog';
 const original=literal?item.value:item.value,display=literal?substitute(original):item.value;
 el.innerHTML=`<div role="dialog" aria-modal="true" aria-labelledby="professor-field-title"><header><div><small>${nativeEscape(item.section)} ${item.context?'· '+nativeEscape(item.context):''}</small><h3 id="professor-field-title">${literal?'Editar menu ou interface':'Editar '+(LIBRARY_AREAS.find(a=>a[0]===item.category)?.[1]||'texto')}</h3></div><button data-close aria-label="Fechar">✕</button></header><p>Origem: ${nativeEscape(item.path.replaceAll('|',' › '))}. A alteração será salva no projeto e incluída na exportação.</p><label>Texto atual<textarea id="professor-field-edit" maxlength="12000">${nativeEscape(display)}</textarea></label><footer><button data-restore>Restaurar padrão</button><button data-save class="professor-primary">Salvar alteração</button></footer></div>`;
 root.append(el);const close=()=>el.remove();el.querySelector('[data-close]').onclick=close;
 el.querySelector('[data-restore]').onclick=()=>{
  if(literal){delete project.text[original];strMap.delete(original);persist();this.refreshRendered();this.message('Texto de interface restaurado.');}
  else{const obj=targetFor(item.path);if(obj&&baselineFields.has(item.path)){obj.parent[obj.name]=baselineFields.get(item.path);item.value=obj.parent[obj.name];item.search=normalizeSearch([item.value,item.path,item.section,item.context,item.rootLabel].join(' '));}delete project.fields[item.path];persist();this.refreshRendered();this.message('Texto original restaurado.');}
  close();this.drawTextResults();
 };
 el.querySelector('[data-save]').onclick=()=>{const value=el.querySelector('textarea').value;if(!stringOK(value)){this.message('Texto muito longo ou contém caracteres inválidos.');return;}
  if(literal){if(value===original){delete project.text[original];strMap.delete(original);}else{project.text[original]=value;strMap.set(original,value);}persist();this.refreshRendered();}
  else{const obj=targetFor(item.path);if(!obj){this.message('Fonte de texto não encontrada.');return;}if(!baselineFields.has(item.path))baselineFields.set(item.path,obj.parent[obj.name]);obj.parent[obj.name]=value;project.fields[item.path]=value;persist();item.value=value;item.search=normalizeSearch([value,item.path,item.section,item.context,item.rootLabel,LIBRARY_AREAS.find(a=>a[0]===item.category)?.[1]].join(' '));this.refreshRendered();}
  close();this.drawTextResults();this.message('Texto salvo e incluído no projeto do professor.');
 };
 el.querySelector('textarea').focus();
};

Studio.bundle=function(){this.view='bundle';this.banner(false);const el=this.root();el.hidden=false;el.innerHTML=`<div class="professor-library professor-bundle"><header><div><small>VOICES · PACOTE UNIFICADO</small><h2>Exportar ou importar projeto</h2><p>Cenários, textos, diálogos, traduções, questões e sprites num único arquivo.</p></div><button id="professor-bundle-back">← Painel</button></header><section class="professor-bundle-grid"><div><h3>↓ Exportar</h3><p>O arquivo ZIP contém o projeto editorial em JSON e as imagens PNG / WebP editadas nos caminhos usados pelo jogo. O progresso dos estudantes não é incluído.</p><button id="professor-export" class="professor-primary">Exportar projeto completo .ZIP</button></div><div><h3>↑ Importar</h3><p>Importe um ZIP criado neste modo para retomar textos, cenários e sprites. Faça backup antes de substituir alterações locais.</p><label class="professor-primary professor-label">Selecionar pacote .ZIP<input id="professor-import" type="file" accept=".zip,application/zip" hidden></label></div></section><div id="professor-bundle-status" role="status"></div><p class="professor-notice">Para levar estas edições a outro computador, importe o ZIP no Modo Professor. As imagens também estão nas pastas corretas para substituição manual. A importação de um ZIP não modifica automaticamente arquivos do computador.</p></div>`;
 $('#professor-bundle-back').onclick=()=>this.dashboard();$('#professor-export').onclick=()=>this.exportBundle();$('#professor-import').onchange=e=>{if(e.target.files[0])this.importBundle(e.target.files[0]);e.target.value='';};};
Studio.status=function(s){const el=$('#professor-bundle-status');if(el)el.textContent=s;else this.message(s);};
Studio.currentScenes=function(){const saved=V.Save.read('scene-layouts',null);const draft=V.Save.read('scene-draft',null);return {applied:saved||V.SceneDesign.document(),draft:draft||null};};
Studio.metadata=function(){return {format:'voices-professor-project',version:1,created:new Date().toISOString(),texts:jsonCopy(project.text),fields:jsonCopy(project.fields),scenes:this.currentScenes(),content:{format:'voices-content',version:1,questions:jsonCopy(V.Teacher.custom.questions),glossary:jsonCopy(V.Teacher.custom.glossary)},settings:{translation:V.settings.translation,subtitles:V.settings.subtitles}};};
const table=(()=>{let t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
function crc32(b){let c=0xffffffff;for(const x of b)c=table[(c^x)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
function header(size,fn){let a=new Uint8Array(size);fn(new DataView(a.buffer));return a;}
function zip(entries){const local=[],central=[];let off=0;const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),dosDate=(Math.max(0,now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();for(const {path,bytes}of entries){const name=te.encode(path),data=bytes,crc=crc32(data);if(data.length>0xffffffff)throw Error('Arquivo grande demais.');local.push(header(30,d=>{d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x0800,true);d.setUint16(10,dosTime,true);d.setUint16(12,dosDate,true);d.setUint32(14,crc,true);d.setUint32(18,data.length,true);d.setUint32(22,data.length,true);d.setUint16(26,name.length,true);}),name,data);central.push(header(46,d=>{d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint16(12,dosTime,true);d.setUint16(14,dosDate,true);d.setUint16(8,0x0800,true);d.setUint16(10,0,true);d.setUint16(12,dosTime,true);d.setUint16(14,dosDate,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,off,true);}),name);off+=30+name.length+data.length;}const length=central.reduce((n,a)=>n+a.length,0);return new Blob([...local,...central,header(22,d=>{d.setUint32(0,0x06054b50,true);d.setUint16(8,entries.length,true);d.setUint16(10,entries.length,true);d.setUint32(12,length,true);d.setUint32(16,off,true);})],{type:'application/zip'});}
function unzipStored(buffer){const b=new Uint8Array(buffer),d=new DataView(buffer),files=new Map();let end=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(d.getUint32(i,true)===0x06054b50){end=i;break;}if(end<0)throw Error('ZIP inválido.');const n=d.getUint16(end+10,true);if(n>600)throw Error('Muitos arquivos.');let off=d.getUint32(end+16,true);for(let i=0;i<n;i++){if(d.getUint32(off,true)!==0x02014b50)throw Error('Índice ZIP inválido.');const method=d.getUint16(off+10,true),size=d.getUint32(off+20,true),nl=d.getUint16(off+28,true),el=d.getUint16(off+30,true),cl=d.getUint16(off+32,true),local=d.getUint32(off+42,true),name=td.decode(b.slice(off+46,off+46+nl));if(!/^[a-zA-Z0-9_./-]+$/.test(name)||name.includes('..'))throw Error('Caminho inseguro.');if(method!==0)throw Error('Importe o ZIP produzido pelo Modo Professor (sem compressão).');if(d.getUint32(local,true)!==0x04034b50)throw Error('Entrada ZIP inválida.');const start=local+30+d.getUint16(local+26,true)+d.getUint16(local+28,true);if(size>16000000||start+size>b.length)throw Error('Entrada de imagem/JSON inválida ou muito grande.');const bytes=b.slice(start,start+size);if(crc32(bytes)!==d.getUint32(off+16,true))throw Error('Integridade ZIP falhou em '+name);files.set(name,bytes);off+=46+nl+el+cl;}return files;}
Studio.exportBundle=async function(){try{this.status('Preparando projeto, cenários e imagens…');await this.askPatches();const all=[{path:'projeto-professor.json',bytes:te.encode(JSON.stringify(this.metadata(),null,2))}];for(const [path,bytes] of this.patches)if(validPath(path))all.push({path,bytes});const blob=zip(all);const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='VOICES_Modo_Professor_Alteracoes.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);this.status(`Projeto exportado: textos, cenários e ${all.length-1} sprites. Guarde o ZIP como backup.`);}catch(e){console.error(e);this.status('Erro ao exportar: '+e.message);}};
Studio.importBundle=async function(file){try{if(file.size>120000000)throw Error('Limite de importação: 120 MB.');this.status('Verificando pacote…');const files=unzipStored(await file.arrayBuffer()),content=files.get('projeto-professor.json');if(!content)throw Error('Projeto não encontrado no ZIP.');const meta=JSON.parse(td.decode(content));if(meta.format!=='voices-professor-project'||meta.version!==1)throw Error('Versão do pacote não reconhecida.');if(!meta.texts||!meta.fields||!meta.scenes)throw Error('Projeto incompleto.');if(Object.keys(meta.texts).length>4000||Object.keys(meta.fields).length>6000)throw Error('Projeto excede o limite de textos.');for(const [k,v]of Object.entries(meta.texts))if(!stringOK(k)||!stringOK(v))throw Error('Edição textual inválida.');for(const [k,v]of Object.entries(meta.fields))if(!targetFor(k)||!stringOK(v))throw Error('Texto estrutural inválido: '+k);if(meta.scenes.applied)V.SceneDesign.normalise(meta.scenes.applied);if(meta.scenes.draft)V.SceneDesign.normalise(meta.scenes.draft);
 if(meta.content){const o=meta.content;V.Teacher.validate({questions:o.questions||[],glossary:o.glossary||[]});}
 this.status('Importando alterações verificadas…');project.text=meta.texts;project.fields=meta.fields;strMap.clear();for(const [k,v]of Object.entries(project.text))strMap.set(k,v);for(const [k,v]of Object.entries(project.fields)){const t=targetFor(k);if(t){if(!baselineFields.has(k))baselineFields.set(k,t.parent[t.name]);t.parent[t.name]=v;}}persist();
 if(meta.content){V.Teacher.custom={questions:meta.content.questions||[],glossary:meta.content.glossary||[]};V.Teacher.save();}
 if(meta.scenes.applied){const applied=V.SceneDesign.apply(V.SceneDesign.normalise(meta.scenes.applied));if(!applied.ok)this.message('Cenário requer revisão: '+applied.message);else V.SceneDesign.rebuild();}
 if(meta.scenes.draft)V.Save.write('scene-draft',meta.scenes.draft);
 let n=0;for(const [path,bytes]of files)if(validPath(path)){await this.storePatch(path,bytes);n++;}
 this.status(`Importação concluída: textos, cenários e ${n} imagens. Abra os editores para revisar.`);this.refreshRendered();}catch(e){console.error(e);this.status('Importação não concluída: '+e.message);}};
Studio.askPatches=function(){const frame=$('#professor-pixel-frame');if(!frame||!frame.contentWindow)return Promise.resolve();return new Promise(resolve=>{const token=Date.now()+'-'+Math.random().toString(16).slice(2);const timer=setTimeout(()=>{this.request=null;resolve();},12000);this.request={token,done:()=>{clearTimeout(timer);this.request=null;resolve();}};frame.contentWindow.postMessage({source:'voices-professor',type:'collect',token},'*');});};
window.addEventListener('message',async e=>{const data=e.data;if(!data||data.source!=='voices-pixel-lab'||e.source!==$('#professor-pixel-frame')?.contentWindow)return;
 if(data.type==='ready'){const list=[...Studio.patches].map(([path,bytes])=>({path,bytes:bytes.slice()}));e.source.postMessage({source:'voices-professor',type:'hydrate',list},'*');}
 if(data.type==='changes'){for(const row of (data.list||[])){try{await Studio.storePatch(row.path,row.bytes);}catch(err){console.warn('Falha ao guardar sprite:',err);}}if(data.token&&Studio.request?.token===data.token)Studio.request.done();}
});
// A delegated pencil follows text rendered after any modal, subtitle or game action.
document.addEventListener('pointermove',e=>{if(!Studio.active||!Studio.editing||Studio.view!=='game'||$('#professor-studio:not([hidden])'))return;if(e.target.closest('#professor-pencil,.professor-edit-dialog')){Studio.clearPencilHide();return;}const t=Studio.textTarget(e.target);if(t)Studio.setHover(t);else Studio.hidePencilSoon();},{passive:true});
document.addEventListener('dblclick',e=>{if(!Studio.active||!Studio.editing||Studio.view!=='game'||$('#professor-studio:not([hidden])'))return;if(e.target.closest('#professor-pencil,.professor-edit-dialog'))return;const t=Studio.textTarget(e.target);if(!t)return;e.preventDefault();e.stopPropagation();Studio.setHover(t);Studio.editText(t);},true);
Studio.observer=new MutationObserver(()=>{const root=$('#app');if(!root)return;if(Studio.editing&&!$('#professor-studio:not([hidden])'))Studio.walkNodes(root);else if(Object.keys(project.text).length)Studio.walkNodes(root);if(Studio.patches.size)Studio.applyDomImages(root);});
document.addEventListener('DOMContentLoaded',()=>{Studio.root();Studio.banner(false);Studio.observer.observe($('#app'),{childList:true,subtree:true,characterData:true});});
// Route the existing PIN-gated teacher entrance into the dedicated authoring dashboard.
const previousShow=V.Teacher.show.bind(V.Teacher);
V.Teacher.show=function(tab){if(!Studio.active){Studio.enter();return;}Studio.view='curriculum';Studio.root().hidden=true;Studio.banner(true);return previousShow(tab);};
// Return from the existing scene editor to the integrated dashboard.
const previousClose=V.SceneEditor.close.bind(V.SceneEditor);
V.SceneEditor.close=function(...args){const ret=previousClose(...args);if(Studio.active&&Studio.view==='scenes')Studio.dashboard();return ret;};
// Teacher test access bypasses the lesson locks but never alters doors for NPC routines.
if(V.Rooms?.allowed){const originalDoorAllowed=V.Rooms.allowed.bind(V.Rooms);V.Rooms.allowed=function(door,npc=false,actor=null,state=V.state){if(Studio.active&&Studio.freePlay&&!npc)return true;return originalDoorAllowed(door,npc,actor,state);};}
// Text content loaded at startup before Game.init: restore immediately, then sprites asynchronously.
Studio.startPromise=Studio.setup();
})();
