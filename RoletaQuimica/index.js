(()=>{'use strict';
const P=window.ROULETTE_PAYLOAD,A=P.assets,EXTRA_DBS=window.ROULETTE_ENGLISH_BANKS||{},BUILTIN_PRESETS=window.ROULETTE_BUILTIN_PRESETS||{},DEFAULT_DBS={...(P.dbs||{}),...EXTRA_DBS},POS=P.positions,CREDITS=P.credits;
const TOUCH_PERF_PROFILE=matchMedia('(pointer: coarse)').matches||'ontouchstart'in window;
if(TOUCH_PERF_PROFILE){
  // Assets equivalentes em resolução adequada para tablets/celulares.
  // Evita decodificar texturas 4K e ícones 1024px que aparecem a ~100px na UI.
  Object.assign(A,{
    'xicara de cima.png':'./assets/embedded/xicara-de-cima-tablet.webp',
    'botao_girar.png':'./assets/embedded/botao-girar-tablet.webp',
    'botao_girar_hover.png':'./assets/embedded/botao-girar-hover-tablet.webp',
    'setavoltar.png':'./assets/embedded/setavoltar-tablet.webp',
    'setavoltar_hover.png':'./assets/embedded/setavoltar-hover-tablet.webp',
    'setadica.png':'./assets/embedded/setadica-tablet.webp'
  });
}
const DB_KEY='qc1_db_clean_questions_v2',PRE_KEY='qc1_predefs',HIST_KEY='qc1_history_clean_v1';
function isTestAreaName(n){let s=String(n||'').trim().toLowerCase();return s==='teste'||s==='test'||s==='área teste'||s==='area teste'||s.startsWith('teste ')}
function inferSubject(q,mode=''){
  if(q&&String(q.materia||'').trim())return String(q.materia).trim();
  let comp=String(q?.bncc?.componente||'').toLowerCase();
  if(comp.includes('ingles')||comp.includes('inglês'))return'Inglês';
  if(comp.includes('biolog'))return'Biologia';
  if(comp.includes('quím')||comp.includes('quim'))return'Química';
  if(['6º ano','7º ano','8º ano','9º ano'].includes(mode))return'Inglês';
  return'Química';
}
function mergeDefaultModes(db){
  db=db||{};
  Object.entries(DEFAULT_DBS||{}).forEach(([mode,builtin])=>{
    if(!db[mode]){db[mode]=JSON.parse(JSON.stringify(builtin));return}
    db[mode].areas=db[mode].areas||{};
    Object.entries(builtin.areas||{}).forEach(([a,c])=>{if(!(a in db[mode].areas))db[mode].areas[a]=JSON.parse(JSON.stringify(c))});
    if(!Array.isArray(db[mode].dificuldades)||!db[mode].dificuldades.length)db[mode].dificuldades=JSON.parse(JSON.stringify(builtin.dificuldades||['Fácil','Médio','Difícil']));
    if(!Array.isArray(db[mode].perguntas))db[mode].perguntas=[];
    // Content patches are appended once to existing local databases, so updates add
    // new built-in questions without resetting questions created or edited by the user.
    const patchQuestions=(builtin.perguntas||[]).filter(q=>q&&q.builtin_patch);
    if(patchQuestions.length){
      const existing=new Set(db[mode].perguntas.map(q=>String(q.area||'')+'||'+String(q.pergunta||'')));
      patchQuestions.forEach(q=>{
        const k=String(q.area||'')+'||'+String(q.pergunta||'');
        if(!existing.has(k)){db[mode].perguntas.push(JSON.parse(JSON.stringify(q)));existing.add(k)}
      });
    }
  });
  return db;
}
function applyBuiltInContentFixes(db){
  const mode=db&&db['8º ano'];
  if(!mode||!Array.isArray(mode.perguntas))return db;
  const isBuiltin=q=>String(q?.builtin_patch||'')==='8ano_more_comparatives_future_to_be_v1';
  mode.perguntas.forEach(q=>{
    if(!isBuiltin(q))return;
    const text=String(q.pergunta||'');
    const addAccepted=(items)=>{q.respostas_aceitas=[...new Set([...(Array.isArray(q.respostas_aceitas)?q.respostas_aceitas:[]),...items])]};
    if(text==='Complete com o verbo to be no futuro: Tomorrow, I ___ at school early.'){
      q.pergunta='Complete com o verbo to be no futuro simples usando will: Tomorrow, I ___ at school early.';
      q.dica_texto='Nesta questão, use o futuro simples com will: will + be.';
    }else if(text==='Passe para o futuro usando o verbo to be: “She is tired today.” Use “tomorrow” na nova frase.'){
      addAccepted(['she is going to be tired tomorrow',"she's going to be tired tomorrow",'ela vai estar cansada amanhã','ela estará cansada amanhã']);
      q.dica_texto='Você pode formar a frase com will be ou com am/is/are going to be. Mantenha “tired” e use “tomorrow”.';
    }else if(text==='Complete na forma negativa: They ___ at home tonight.'){
      q.pergunta='Complete no futuro simples com will, na forma negativa: They ___ at home tonight.';
      q.dica_texto="Nesta questão, use will na negativa: will not / won't + be.";
    }else if(text==='Qual pergunta com o verbo to be no futuro está correta?'){
      q.pergunta='Qual pergunta com o verbo to be no futuro simples usando will está correta?';
      q.dica_texto='Nesta questão, use a estrutura Will + sujeito + be... ?';
    }else if(text==='“Will you be at the party tomorrow?” está correta para perguntar se alguém estará em uma festa no futuro.'){
      q.pergunta='“Will you be at the party tomorrow?” está correta como pergunta no futuro simples com will.';
      q.dica_texto='Observe a estrutura do futuro simples: Will + sujeito + be + complemento.';
    }else if(text==='Traduza usando o verbo to be no futuro: “Nós estaremos felizes amanhã.”'){
      addAccepted(['we are going to be happy tomorrow',"we're going to be happy tomorrow",'nós vamos estar felizes amanhã','nos vamos estar felizes amanha']);
      q.dica_texto='Você pode usar we will be ou we are going to be para expressar a ideia no futuro.';
    }
  });
  return db;
}
function cleanRuntimeDB(db){
  Object.entries(db||{}).forEach(([mode,d])=>{
    if(!d)return;
    Object.keys(d.areas||{}).forEach(a=>{if(isTestAreaName(a))delete d.areas[a]});
    d.perguntas=(d.perguntas||[]).filter(q=>!isTestAreaName(q.area)&&!String(q.pergunta||'').trim().toLowerCase().startsWith('teste'));
    d.perguntas.forEach(q=>{q.materia=inferSubject(q,mode)});
    const savedSubjects=Array.isArray(d.materias)?d.materias:[];
    const questionSubjects=d.perguntas.map(q=>q.materia).filter(Boolean);
    d.materias=[...new Set([...savedSubjects,...questionSubjects].map(v=>String(v).trim()).filter(Boolean))];
  });
  return db;
}
function cleanRuntimePredefs(pre){
  Object.values(pre||{}).forEach(p=>{
    if(!p)return;
    if(Array.isArray(p.areas))p.areas=p.areas.filter(a=>!isTestAreaName(a));
    if(Array.isArray(p.areas_selected))p.areas_selected=p.areas_selected.filter(a=>!isTestAreaName(a));
  });
  return pre||{};
}
let DB=cleanRuntimeDB(applyBuiltInContentFixes(mergeDefaultModes(load(DB_KEY,DEFAULT_DBS)))),PRE=cleanRuntimePredefs({...load(PRE_KEY,P.predefs||{}),...BUILTIN_PRESETS});
save(DB_KEY,DB);save(PRE_KEY,PRE);const MODES=['6º ano','7º ano','8º ano','9º ano','1º ano','2º ano','3º ano','Coffee Lovers'],SUBJECTS=['Química','Biologia','Inglês'],TIMES=['1:00','1:30','2:00','2:30','3:00','3:30','4:00','4:30','5:00'],SPECIAL=new Set(['+5 pontos 1','+5 pontos 2','-5 pontos 1','-5 pontos 2']);const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));let current='intro',game=null,wheel={segments:[],angle:0,speed:0,anim:false,raf:null,spinAnimation:null},firstGame=true,timer=null,editingIndex=null,addEditDraftMode='Coffee Lovers';const bgm=new Audio(A['musicadefundo extendida (Remix).mp3']||''),okSound=new Audio(A['copoenchendo.mp3']||''),errSound=new Audio(A['copo quebrando.mp3']||'');bgm.loop=true;bgm.volume=.45;okSound.volume=.8;errSound.volume=.8;
function load(k,d){try{return JSON.parse(localStorage.getItem(k))||JSON.parse(JSON.stringify(d))}catch(e){return JSON.parse(JSON.stringify(d))}}function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function setAssets(root=document){$$('[data-a]',root).forEach(el=>{let n=el.dataset.a;if(el.tagName==='IMG'||el.tagName==='VIDEO')el.src=A[n]||'';else el.style.backgroundImage=`url("${A[n]||''}")`})}function viewportSize(){
  const vv=window.visualViewport;
  return {w:vv?vv.width:innerWidth,h:vv?vv.height:innerHeight};
}
function fit(){
  const {w,h}=viewportSize();
  const isTouch=matchMedia('(pointer: coarse)').matches||'ontouchstart'in window;
  const isPortrait=h>w;
  const forcePortrait=document.body.classList.contains('forcePortrait');
  const shouldScroll=!!(isTouch&&(forcePortrait||(!isPortrait&&w<1000)));

  // Em celular em pé, mantém um tamanho jogável, mas permite scroll/zoom.
  const rawScale=Math.min(w/1366,h/705);
  const s=shouldScroll?Math.max(rawScale,0.55):rawScale;

  const stage=$('#stage');
  const viewport=$('.viewport');
  const contentW=1366*s, contentH=705*s;

  let padX=shouldScroll?Math.max((w-contentW)/2,0):0;
  let padY=shouldScroll?Math.max((h-contentH)/2,0):0;

  // Portrait forçado: centraliza a parte visual superior do app.
  // Evita abrir com a home grudada no topo e um bloco preto grande embaixo.
  if(forcePortrait&&isPortrait){
    padY=Math.max((h-contentH)/2,0);
  }

  stage.style.transform=`scale(${s})`;
  stage.style.setProperty('--stage-left',shouldScroll?Math.round(padX)+'px':'0px');
  stage.style.setProperty('--stage-top',shouldScroll?Math.round(padY)+'px':'0px');
  stage.style.left=shouldScroll?Math.round(padX)+'px':'';
  stage.style.top=shouldScroll?Math.round(padY)+'px':'';

  document.body.classList.toggle('isTouch',!!isTouch);
  document.body.classList.toggle('isMobilePortrait',!!(isTouch&&isPortrait&&w<900));
  document.body.classList.toggle('isMobileLandscape',!!(isTouch&&!isPortrait&&w<1000));

  const spacer=$('#mobileScrollSpacer');
  if(spacer){
    spacer.style.width=shouldScroll?Math.ceil(contentW+padX*2)+'px':'1px';
    spacer.style.height=shouldScroll?Math.ceil(contentH+padY*2)+'px':'1px';
  }

  if(shouldScroll&&viewport){
    requestAnimationFrame(()=>{
      const maxX=viewport.scrollWidth-viewport.clientWidth;
      const maxY=viewport.scrollHeight-viewport.clientHeight;

      // Centraliza horizontalmente quando houver largura sobrando.
      if(maxX>2)viewport.scrollLeft=maxX/2;

      // No portrait, abre no topo da tela útil do app, sem jogar a home pra fora.
      // Se a tela ativa for a roleta, centraliza verticalmente melhor.
      const active=document.querySelector('.screen.active');
      const activeId=active?active.id:'';
      if(maxY>2){
        viewport.scrollTop=maxY/2;
      }else{
        viewport.scrollTop=0;
      }
    });
  }

  const ov=$('#mobileRotateOverlay');
  if(ov)ov.classList.toggle('show',!!(isTouch&&isPortrait&&w<900&&!forcePortrait));
}
addEventListener('resize',fit);
addEventListener('orientationchange',()=>setTimeout(fit,250));
if(window.visualViewport)visualViewport.addEventListener('resize',fit);
fit();setAssets();
function tagButtonAssetNames(){
  const reverse=new Map(Object.entries(A).map(([k,v])=>[v,k]));
  document.querySelectorAll('button img,.kbtn img').forEach(img=>{
    const name=reverse.get(img.getAttribute('src'))||reverse.get(img.src);
    if(name&&!img.dataset.assetName)img.dataset.assetName=name;
  });
}
tagButtonAssetNames();
setTimeout(tagButtonAssetNames,300);
function show(id){current=id;$$('.screen').forEach(s=>s.classList.toggle('active',s.id===id)); if(id==='home')renderHome(); if(id==='list')renderList(); if(id==='addedit')renderAddEdit(); if(id==='predef')renderPredef(); if(id==='history')renderHistory(); if(id==='credits')renderCredits();}
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200)}function closePopup(){clearInterval(timer);timer=null;const ov=$('#overlay');ov.onclick=null;ov.classList.remove('show');$('#popupHost').innerHTML=''}function popup(html,w=820,h=520,bg='popup genérico HD.png',closeOnOutside=false){const host=$('#popupHost'),ov=$('#overlay');host.innerHTML=`<div class="popup" style="width:${w}px;height:${h}px;background-image:url('${A[bg]||''}')"><div class="popupInner">${html}</div></div>`;ov.onclick=closeOnOutside?e=>{if(e.target===ov)closePopup()}:null;ov.classList.add('show');return $('.popupInner',host)}
function imgBtn(parent,id,name,x,y,w,h,cb,hover){const blank='./assets/embedded/transparent-pixel.gif';const b=document.createElement('button');b.id=id||'';b.className='kbtn';b.style.left=x+'px';b.style.bottom=y+'px';b.style.width=w+'px';b.style.height=h+'px';const im=document.createElement('img');im.src=A[name]||blank;b.appendChild(im);if(hover){b.onmouseenter=()=>im.src=A[hover]||A[name]||blank;b.onmouseleave=()=>im.src=A[name]||blank;b.onmousedown=()=>im.src=A[hover]||A[name]||blank;b.onmouseup=()=>im.src=A[hover]||A[name]||blank;}b.onclick=cb;parent.appendChild(b);return b}
function textImgBtn(name,text,cb){return `<button class="stdBtn" style="background-image:url('${A[name]||''}');width:100%">${esc(text)}</button>`}
function fitSelectText(target){const head=target?.classList?.contains('selHead')?target:$('.selHead',target);if(!head)return;const wrap=head.closest('.kselect');const width=wrap?.clientWidth||head.clientWidth||180;const id=wrap?.id||'';let size=width>=240?20:width>=200?18:16;if(id==='spinner_equipes'||id==='spinner_tempo'||id==='spinner_game_mode'||id==='listMode'||id==='listArea'||id==='listDiff'||id==='preSel'||id==='preMode'||id==='preArea'||id==='preDiff')size=34;else if(id==='spinner_predefinicao')size=24;head.style.fontSize=size+'px';head.style.letterSpacing='0';head.style.whiteSpace='nowrap';head.style.overflow='hidden';head.style.textOverflow='ellipsis';let min=(id.startsWith('spinner_')||id==='listMode'||id==='listArea'||id==='listDiff'||id==='preSel'||id==='preMode'||id==='preArea'||id==='preDiff')?18:12;let tries=0;while(head.scrollWidth>head.clientWidth-6&&size>min&&tries<24){size-=1;head.style.fontSize=size+'px';tries++;}}
function fitSelectOptions(selectEl){if(!selectEl)return;const id=selectEl.id||'';let base=(id==='listMode'||id==='listArea'||id==='listDiff'||id==='preSel'||id==='preMode'||id==='preArea'||id==='preDiff')?34:20;$('.selOpts',selectEl)?.querySelectorAll?.('.selOpt')?.forEach(opt=>{let size=base;opt.style.fontSize=size+'px';opt.style.padding='0 10px';opt.style.whiteSpace='nowrap';opt.style.overflow='hidden';opt.style.textOverflow='ellipsis';let tries=0;while(opt.scrollWidth>opt.clientWidth-6&&size>16&&tries<24){size-=1;opt.style.fontSize=size+'px';tries++;}})}
function makeSelect(parent,id,values,text,x,y,w,h,bg='botao generico telainicial.png',hover='botao generico telainicial_hover.png',onchange){const div=document.createElement('div');div.className='kselect';div.id=id;div.style.left=x+'px';div.style.bottom=y+'px';div.style.width=w+'px';div.style.height=h+'px';div.dataset.value=text;div.tabIndex=0;div.setAttribute('role','combobox');div.setAttribute('aria-haspopup','listbox');div.setAttribute('aria-expanded','false');div.innerHTML=`<div class="selHead" style="background-image:url('${A[bg]||''}')">${esc(text)}</div><div class="selOpts" role="listbox">${values.map(v=>`<div class="selOpt" role="option" style="background-image:url('${A[bg]||''}')" data-v="${esc(v)}">${esc(v)}</div>`).join('')}</div>`;const head=$('.selHead',div),opts=$('.selOpts',div);const close=()=>{div.classList.remove('open','openUp');div.setAttribute('aria-expanded','false')};const positionOpts=()=>{const stageRect=($('#stage')?.getBoundingClientRect?.())||{top:0,bottom:window.innerHeight};const rect=div.getBoundingClientRect();const desired=Math.min(Math.max(values.length*48,48),260);const margin=8;const spaceBelow=Math.max(0,stageRect.bottom-rect.bottom-margin);const spaceAbove=Math.max(0,rect.top-stageRect.top-margin);const forceUp=div.dataset.forceUp==='true';const openUp=forceUp?(spaceAbove>=96||spaceAbove>=spaceBelow):(spaceBelow<Math.min(160,desired)&&spaceAbove>spaceBelow);div.classList.toggle('openUp',openUp);const preferredSpace=openUp?spaceAbove:spaceBelow;const fallbackSpace=openUp?spaceBelow:spaceAbove;const available=Math.max(96,Math.min(desired,(preferredSpace||fallbackSpace)||desired));opts.style.maxHeight=available+'px'};const open=()=>{positionOpts();$$('.kselect.open').forEach(o=>{if(o!==div){o.classList.remove('open','openUp');o.setAttribute('aria-expanded','false')}});div.classList.add('open');div.setAttribute('aria-expanded','true');requestAnimationFrame(positionOpts)};const toggle=()=>div.classList.contains('open')?close():open();head.onmouseenter=()=>head.style.backgroundImage=`url('${A[hover]||A[bg]||''}')`;head.onmouseleave=()=>head.style.backgroundImage=`url('${A[bg]||''}')`;head.onclick=e=>{e.stopPropagation();toggle()};div.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}else if(e.key==='Escape'){close()}};$$('.selOpt',div).forEach(o=>o.onclick=e=>{e.stopPropagation();div.dataset.value=o.dataset.v;head.textContent=o.dataset.v;fitSelectText(div);close();onchange&&onchange(o.dataset.v,div)});window.addEventListener('resize',()=>{fitSelectText(div);fitSelectOptions(div);if(div.classList.contains('open'))positionOpts()});parent.appendChild(div);fitSelectText(div);fitSelectOptions(div);return div}document.addEventListener('click',()=>$$('.kselect.open').forEach(o=>{o.classList.remove('open','openUp');o.setAttribute('aria-expanded','false')}));
function getSel(id){return $('#'+id)?.dataset.value||''}function setSel(id,v){const el=$('#'+id);if(!el)return;el.dataset.value=v;$('.selHead',el).textContent=v;fitSelectText(el)}function modeDB(m){return DB[m]||DB['Coffee Lovers']}function subjectOf(q,mode=''){return inferSubject(q,mode)}function subjectOptions(mode){let d=modeDB(mode),saved=Array.isArray(d.materias)?d.materias:[],found=[...new Set((d.perguntas||[]).map(q=>subjectOf(q,mode)).filter(Boolean))];return[...new Set([...SUBJECTS,...saved,...found].map(v=>String(v).trim()).filter(Boolean))]}function defaultSubjectForMode(mode){let found=[...new Set((modeDB(mode).perguntas||[]).map(q=>subjectOf(q,mode)).filter(Boolean))];return found.length===1?found[0]:(['6º ano','7º ano','8º ano','9º ano'].includes(mode)?'Inglês':'Química')}function diffs(m){return (modeDB(m).dificuldades||['Fácil','Médio','Difícil']).map(d=>String(d))}function parseTime(t){let [m,s]=t.split(':').map(Number);return m*60+s}function diffNorm(d){let s=String(d||'').toLowerCase();if(s==='1'||s==='fácil'||s==='facil')return'fácil';if(s==='2'||s==='médio'||s==='medio')return'médio';if(s==='3'||s==='difícil'||s==='dificil')return'difícil';return s}function pts(d){return {'fácil':15,'médio':20,'difícil':30}[diffNorm(d)]||15}function effectivePts(d,usedHint=false){return usedHint?Math.max(1,Math.round(pts(d)*0.85)):pts(d)}function rgba(c,a=1){if(!Array.isArray(c))return`rgba(80,80,80,${a})`;return`rgba(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)},${c[3]??a})`}function hex(c){if(!Array.isArray(c))return'#ffffff';return '#'+c.slice(0,3).map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}function fromHex(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255,1]}
function renderIntro(){const cont=$('#introContent');cont.innerHTML='';let p=POS.intro||{};imgBtn(cont,'btn_config','configurar.png',p.btn_config?.[0]??1133,p.btn_config?.[1]??577,90,90,()=>show('home'),'configurar_hover.png');imgBtn(cont,'btn_instrucoes','instruções.png',p.btn_instrucoes?.[0]??273,p.btn_instrucoes?.[1]??29,256,80,showInstructions,'instruções_hover.png');imgBtn(cont,'btn_comecar','começar.png',p.btn_comecar?.[0]??553,p.btn_comecar?.[1]??129,220,60,openModePopup,'começar_hover.png');imgBtn(cont,'btn_creditos','créditos.png',p.btn_creditos?.[0]??870,p.btn_creditos?.[1]??41,179.2,56,()=>show('credits'),'créditos_hover.png')}
function bootIntro(){renderIntro();$('#introBg').src=A['introdução cartoon.jpg']||'';let v=$('#introVideo');v.src=A['introdução.mp4']||'';v.muted=true;v.onended=()=>{$('#introContent').style.opacity=1;v.style.opacity=0};setTimeout(()=>{if($('#introContent').style.opacity==='0'){$('#introContent').style.opacity=1;v.style.opacity=0}},1600);v.play?.().catch(()=>{$('#introContent').style.opacity=1;v.style.opacity=0})}
function showInstructions(){popup(`<img src="${A['cardinstruções.png']||''}" style="width:100%;height:100%;object-fit:contain">`,500,700,'fundotransparente.png',true)}
function openModePopup(){
  let m=popup(`<div style="position:absolute;right:56px;top:46px;width:670px;height:360px"><div id="modeBox" style="position:relative;width:670px;height:360px"></div></div>`,1229,458,'iniciarintrodução.png'),box=$('#modeBox',m);
  const selBg='botao generico iniciarintrodução.png',selHover='botao generico iniciarintrodução_hover.png';
  const s1=makeSelect(box,'introMode',MODES,'Clique para escolher',0,0,594,50,selBg,selHover);s1.style.left='28px';s1.style.top='8px';s1.style.bottom='auto';
  const s2=makeSelect(box,'introEq',['2','3','4','5','6','7','8'],'2',0,0,594,50,selBg,selHover);s2.style.left='28px';s2.style.top='83px';s2.style.bottom='auto';
  const s3=makeSelect(box,'introTime',TIMES,'1:00',0,0,594,50,selBg,selHover);s3.style.left='28px';s3.style.top='158px';s3.style.bottom='auto';
  let row=document.createElement('div');row.style.cssText='position:absolute;left:88px;top:254px;width:430px;height:60px;display:flex;gap:28px';
  row.innerHTML=`<button id="introConfirm" class="stdBtn" style="width:200px">Confirmar</button><button id="introCancel" class="stdBtn" style="width:200px">Cancelar</button>`;
  box.appendChild(row);
  $('#introConfirm').onclick=()=>{
    const mode=getSel('introMode'), eq=getSel('introEq')||'2', time=getSel('introTime')||'1:00';
    if(mode==='Clique para escolher'||!mode){msg('Erro','Por favor, escolha um modo de jogo!');return}
    closePopup();
    show('home');
    setSel('spinner_game_mode',mode);
    setSel('spinner_equipes',eq);
    setSel('spinner_tempo',time);
    setTimeout(()=>startFilterPopup(),0);
  };
  $('#introCancel').onclick=closePopup;
}
function renderHome(){const c=$('#homeControls');c.innerHTML='';let p=POS.home||{};makeSelect(c,'spinner_game_mode',MODES,'Escolher',p.spinner_game_mode?.[0]??872,p.spinner_game_mode?.[1]??415,180,80);makeSelect(c,'spinner_equipes',['2','3','4','5','6','7','8'],'2',p.spinner_equipes?.[0]??871,p.spinner_equipes?.[1]??625,180,80);makeSelect(c,'spinner_tempo',TIMES,'1:00',p.spinner_tempo?.[0]??871,p.spinner_tempo?.[1]??520,180,80);const homePredefSel=makeSelect(c,'spinner_predefinicao',['Predefinições',...Object.keys(PRE)],'Escolher Predefinição',p.spinner_predefinicao?.[0]??50,p.spinner_predefinicao?.[1]??50,250,60,'botao generico telainicial.png','botao generico telainicial_hover.png',n=>{if(n!=='Escolher Predefinição')openPredefStart(n)});homePredefSel.dataset.forceUp='true';imgBtn(c,'btn_iniciar','iniciar jogo.png',p.btn_iniciar?.[0]??761,p.btn_iniciar?.[1]??275,237.5,95,startFilterPopup,'iniciar jogo_hover.png');imgBtn(c,'btn_volume','volume.png',p.btn_volume?.[0]??1200,p.btn_volume?.[1]??600,90,90,openVolume,'volume_hover.png');imgBtn(c,'btn_adicionar','adicionar perguntas.png',p.btn_adicionar?.[0]??335,p.btn_adicionar?.[1]??275,237.5,95,()=>show('addedit'),'adicionar perguntas_hover.png');imgBtn(c,'btn_listar','listar perguntas.png',p.btn_listar?.[0]??761,p.btn_listar?.[1]??175,237.5,95,()=>show('list'),'listar perguntas_hover.png');imgBtn(c,'btn_voltar','setavoltar.png',p.btn_voltar?.[0]??99,p.btn_voltar?.[1]??586,180,80,()=>show('intro'),'setavoltar_hover.png');imgBtn(c,'btn_predefinicoes','predefinições.png',p.btn_predefinicoes?.[0]??335,p.btn_predefinicoes?.[1]??175,237.5,95,()=>show('predef'),'predefinições_hover.png');imgBtn(c,'btn_historico','historico.png',p.btn_historico?.[0]??1050,p.btn_historico?.[1]??45,237.5,95,()=>show('history'),'historico_hover.png')}
function openVolume(){let m=popup(`<div style="display:flex;flex-direction:column;gap:14px;padding:20px"><label class="label" for="ms">Música: <span id="mv">${bgm.volume.toFixed(2)}</span></label><input id="ms" type="range" min="0" max="1" step=".01" value="${bgm.volume}"><label class="label" for="es">Efeitos: <span id="ev">${okSound.volume.toFixed(2)}</span></label><input id="es" type="range" min="0" max="1" step=".01" value="${okSound.volume}"><button id="playM" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}')">Tocar música</button><button id="ok" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}')">OK</button></div>`,400,300);$('#ms').oninput=e=>{$('#mv').textContent=(bgm.volume=+e.target.value).toFixed(2)};$('#es').oninput=e=>{okSound.volume=errSound.volume=+e.target.value;$('#ev').textContent=okSound.volume.toFixed(2)};$('#playM').onclick=()=>bgm.play().catch(()=>{});$('#ok').onclick=closePopup}
function msg(title,message,after){let m=popup(`<div style="display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;gap:28px"><div class="label" style="font-size:24px;text-align:center">${esc(message)}</div><button id="msgOk" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}');width:240px">OK</button></div>`,820,360);$('#msgOk').onclick=()=>{closePopup();after&&after()}}
function startFilterPopup(){
  let mode=getSel('spinner_game_mode');
  if(!MODES.includes(mode)){msg('Modo de jogo','Selecione um modo de jogo antes de iniciar.');return}
  let data=modeDB(mode),areas=Object.keys(data.areas||{}),difs=data.dificuldades||['Fácil','Médio','Difícil'];
  let subjects=subjectOptions(mode),counts=Object.fromEntries(subjects.map(sub=>[sub,(data.perguntas||[]).filter(q=>subjectOf(q,mode)===sub).length]));
  let html=`<div class="filterPopupRoot filterPopupWithSubjects">
    <div id="filterTitle" class="filterTitle editableLayout">Selecione as Áreas e Dificuldades</div>
    <div id="filterAreaLabel" class="filterLabel editableLayout">Áreas:</div>
    <div id="areaChecks" class="scroll kvScroll filterScroll editableLayout">${areas.slice().reverse().map(a=>`<label class="checkRow filterCheck" data-area="${esc(a)}"><input type="checkbox" checked value="${esc(a)}"><span>${esc(a)}</span></label>`).join('')}<div class="filterEndSpacer"></div></div>
    <div id="filterDiffLabel" class="filterLabel editableLayout">Dificuldades:</div>
    <div id="diffChecks" class="scroll kvScroll filterScroll editableLayout">${difs.slice().reverse().map(d=>`<label class="checkRow filterCheck"><input type="checkbox" checked value="${esc(diffNorm(d))}"><span>${esc(d)}</span></label>`).join('')}<div class="filterEndSpacer"></div></div>
    <div id="filterSubjectBox" class="subjectFilterBox">
      <div class="subjectFilterTitle">Matérias <small>(opcional: nenhuma = todas; várias = mista)</small></div>
      <div id="subjectChecks" class="subjectChecks">${subjects.map(sub=>`<label class="subjectChip ${counts[sub]===0?'isEmpty':''}" title="${counts[sub]} perguntas nesta série"><input type="checkbox" value="${esc(sub)}" ${counts[sub]===0?'disabled':''}><span>${esc(sub)} <b>${counts[sub]}</b></span></label>`).join('')}</div>
      <div id="subjectSummary" class="subjectSummary">Todas as matérias disponíveis</div>
    </div>
    <button id="gameStartBtn" class="stdBtn filterBtn subjectStartBtn">Iniciar</button>
    <button id="gameCancelBtn" class="stdBtn filterBtn subjectCancelBtn">Cancelar</button>
  </div>`;
  popup(html,1093,620,'popup generico 2.png');
  const selectedSubjects=()=>$$('#subjectChecks input:checked').map(i=>i.value);
  const refreshSubjects=()=>{
    let ss=selectedSubjects();
    let sum=$('#subjectSummary');
    if(sum)sum.textContent=ss.length===0?'Todas as matérias disponíveis':ss.length===1?`Matéria: ${ss[0]}`:`Modo misto: ${ss.join(' + ')}`;
    $$('#areaChecks .filterCheck').forEach(row=>{
      let area=row.dataset.area,inp=$('input',row);
      if(SPECIAL.has(area)){row.style.display='flex';return}
      let ok=ss.length===0||(data.perguntas||[]).some(q=>q.area===area&&ss.includes(subjectOf(q,mode)));
      row.style.display=ok?'flex':'none';
      if(!ok&&inp)inp.checked=false;
      if(ok&&inp&&!inp.dataset.userChanged)inp.checked=true;
    });
  };
  $$('#areaChecks input').forEach(i=>i.onchange=()=>{i.dataset.userChanged='1'});
  $$('#subjectChecks input').forEach(i=>i.onchange=refreshSubjects);
  refreshSubjects();
  $('#gameStartBtn').onclick=()=>{
    let sa=$$('#areaChecks input:checked').map(i=>i.value).reverse(),sd=$$('#diffChecks input:checked').map(i=>i.value),ss=selectedSubjects();
    if(!sa.length){closePopup();msg('Erro','Selecione pelo menos uma área com perguntas disponíveis.');return}
    if(!sd.length){closePopup();msg('Erro','Selecione pelo menos uma dificuldade.');return}
    let playable=(data.perguntas||[]).some(q=>sa.includes(q.area)&&sd.includes(diffNorm(q.dificuldade))&&(!ss.length||ss.includes(subjectOf(q,mode))));
    if(!playable){closePopup();msg('Sem perguntas','Não há perguntas que combinem série, matéria, área e dificuldade selecionadas.');return}
    closePopup();setupGame(mode,parseInt(getSel('spinner_equipes')||'2'),parseTime(getSel('spinner_tempo')||'1:00'),sa,sd,ss,null)
  };
  $('#gameCancelBtn').onclick=closePopup;
}

function openPredefStart(n){let pd=PRE[n];if(!pd){msg('Erro','Predefinição não encontrada.');return}let m=popup(`<div class="predefStartPopup"><div class="predefStartTitle">${esc(n)}</div><div class="label predefStartLabel">Selecione o tempo:</div><div id="pdTimeBox" class="predefStartSelectBox"></div><div class="label predefStartLabel">Selecione o número de equipes:</div><div id="pdEqBox" class="predefStartSelectBox"></div><div class="predefStartActions"><button id="pdStart" class="stdBtn" style="flex:1;background-image:url('${A['botao generico popup generico.png']}')">Iniciar Jogo</button><button id="pdCancel" class="stdBtn" style="flex:1;background-image:url('${A['botao generico popup generico.png']}')">Cancelar</button></div><div class="predefStartFootnote">Usar dica reduz a pontuação da questão para 85% do valor original.</div></div>`,440,455);makeSelect($('#pdTimeBox'), 'pdTime', TIMES, '1:00',0,0,360,50,'botao generico popup generico.png','botao generico popup generico.png');makeSelect($('#pdEqBox'), 'pdEq',['2','3','4','5','6','7','8'],'2',0,0,360,50,'botao generico popup generico.png','botao generico popup generico.png');$('#pdCancel').onclick=closePopup;$('#pdStart').onclick=()=>{let timeValue=getSel('pdTime')||'1:00',eqValue=parseInt(getSel('pdEq')||'2',10);let qs=Array.isArray(pd.perguntas)?pd.perguntas:[];if(!qs.length){msg('Erro','Essa predefinição não possui perguntas.');return}let presetAreas=Array.isArray(pd.areas_selected)?pd.areas_selected:[];let areas=[...new Set([...qs.map(q=>q.area),...presetAreas].filter(Boolean))],ds=[...new Set(qs.map(q=>diffNorm(q.dificuldade)).filter(Boolean))],subjects=[...new Set(qs.map(q=>subjectOf(q,pd.modo||'')).filter(Boolean))];closePopup();setupGame(pd.modo||'Coffee Lovers',Number.isFinite(eqValue)?eqValue:2,parseTime(timeValue||'1:00'),areas,ds.length?ds:['fácil','médio','difícil'],subjects,qs)}}
function setupGame(mode,teams,timeLimit,areas,difs,subjects,preQs){
  if(!MODES.includes(mode)){
    game=null;
    msg('Modo de jogo','Selecione um modo de jogo válido antes de iniciar.');
    return;
  }
  game={
    id:'s'+Date.now(),
    game_mode:mode,
    num_teams:teams,
    time_limit_secs:timeLimit,
    areas_selected:areas,
    difficulties_selected:difs,
    subjects_selected:Array.isArray(subjects)?subjects:[],
    scores:Array(teams).fill(0),
    current_team:0,
    rounds:[],
    used_questions:[],
    started_at:new Date().toLocaleString('pt-BR'),
    started_at_ms:Date.now(),
    preQs
  };
  game.areas_selected=sanitizeAreasForGame(game.areas_selected);
  if(!game.areas_selected.some(a=>!SPECIAL.has(a))){
    game=null;
    msg('Sem perguntas','Não há perguntas disponíveis para as áreas e dificuldades selecionadas.');
    return;
  }
  buildWheel();
  if(!wheel.segments.length){
    game=null;
    msg('Sem perguntas','Não há áreas com perguntas disponíveis para montar a roleta.');
    return;
  }
  renderScore();
  // Prepara a textura da roda e pede a decodificação do fundo ainda fora da tela.
  // No primeiro jogo isso acontece durante o vídeo de transição, escondendo o custo
  // inicial de rasterização/decodificação em tablets.
  drawWheel(true);
  const gameBg=$('#game .bg');
  if(gameBg&&typeof gameBg.decode==='function')gameBg.decode().catch(()=>{});
  if(firstGame){
    firstGame=false;
    show('transition');
    let v=$('#transitionVideo');
    v.src=A['transição roleta.mp4']||'';
    v.muted=true;
    v.currentTime=0;
    v.onended=()=>{show('game');};
    v.play?.().catch(()=>{show('game');});
    setTimeout(()=>{if(current==='transition'){show('game');}},2500)
  }else{
    show('game');
  }
  $('#instruction').style.display='block'
}
function questionKey(q){
  return String((q&&q.materia)||'')+'||'+String((q&&q.area)||'')+'||'+String((q&&q.dificuldade)||'')+'||'+String((q&&q.pergunta)||'')
}
function questionType(q){
  const raw=String(q?.tipo||'objetiva').trim().toLocaleLowerCase('pt-BR').replace(/[\s-]+/g,'_');
  if(raw==='discursiva')return 'discursiva';
  if(['verdadeiro_falso','verdadeiro_ou_falso','vf','v_f','true_false','truefalse'].includes(raw))return 'verdadeiro_falso';
  return 'objetiva';
}
function questionTypeLabel(qOrType){
  const type=typeof qOrType==='string'?questionType({tipo:qOrType}):questionType(qOrType);
  if(type==='discursiva')return 'Discursiva';
  if(type==='verdadeiro_falso')return 'Verdadeiro ou Falso';
  return 'Objetiva';
}
function trueFalseCorrect(q){
  if(typeof q?.correta_vf==='boolean')return q.correta_vf;
  if(typeof q?.correta==='boolean')return q.correta;
  const raw=String(q?.correta_vf??q?.resposta_correta_vf??'').trim().toLocaleLowerCase('pt-BR');
  if(['verdadeiro','true','v','1'].includes(raw))return true;
  if(['falso','false','f','0'].includes(raw))return false;
  return null;
}
function normalizeDiscursiveAnswer(value){
  return String(value??'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g,'');
}

// Equivalências conceituais PT-BR ↔ EN para respostas discursivas.
// A ideia é aceitar o nome do conceito nos dois idiomas sem transformar
// exercícios que exigem uma frase específica em respostas livres demais.
const DISC_EQUIV_GROUPS=[
  ['simple future','future simple','futuro simples'],
  ['immediate future','futuro imediato'],
  ['future continuous','continuous future','futuro continuo'],
  ['future perfect','perfect future','futuro perfeito'],
  ['comparative','comparativo'],
  ['comparative of equality','equality comparative','comparativo de igualdade'],
  ['comparative of superiority','superiority comparative','comparativo de superioridade'],
  ['comparative of inferiority','inferiority comparative','comparativo de inferioridade'],
  ['superlative','superlativo'],
  ['simple present','present simple','presente simples'],
  ['present continuous','continuous present','presente continuo'],
  ['simple past','past simple','passado simples'],
  ['past continuous','continuous past','passado continuo'],
  ['regular verb','regular verbs','verbo regular','verbos regulares'],
  ['irregular verb','irregular verbs','verbo irregular','verbos irregulares'],
  ['modal verb','modal verbs','verbo modal','verbos modais'],
  ['zero conditional','conditional zero','0 conditional','condicional zero','condicional 0'],
  ['first conditional','1st conditional','conditional one','conditional 1','1 conditional','primeiro condicional','condicional 1'],
  ['second conditional','2nd conditional','conditional two','conditional 2','2 conditional','segundo condicional','condicional 2'],
  ['fact','fato'],
  ['opinion','opiniao'],
  ['prefix','prefixo'],
  ['true','verdadeiro'],
  ['false','falso'],
  ['to be','ser ou estar','ser e estar','verbo ser ou estar','verbo ser e estar'],
  ['in','inside','dentro','dentro de'],
  ['on','sobre','em cima','em cima de'],
  ['out','outside','fora'],
  ['under','below','embaixo','embaixo de','abaixo','abaixo de'],
  ['above','acima','acima de'],
  ['behind','atras','atras de'],
  ['in front of','na frente de'],
  ['next to','beside','ao lado','ao lado de'],
  ['between','entre'],
  ['near','perto','perto de'],
  ['yes','sim'],
  ['no','nao']
];
const DISC_EQUIV_LOOKUP=(()=>{
  const map=new Map();
  DISC_EQUIV_GROUPS.forEach((group,index)=>{
    const key='@eq'+index;
    group.forEach(v=>map.set(normalizeDiscursiveAnswer(v),key));
  });
  return map;
})();
function canonicalDiscursiveAtom(value){
  const compact=normalizeDiscursiveAnswer(value);
  return DISC_EQUIV_LOOKUP.get(compact)||compact;
}
function normalizedDiscursiveText(value){
  return String(value??'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('pt-BR')
    .replace(/[“”‘’]/g,"'")
    .replace(/\s+/g,' ')
    .trim();
}
function splitDiscursiveList(value){
  let text=normalizedDiscursiveText(value);
  if(!text)return null;
  // Aceita, entre outras: in e on / in ou on / in,on / in/on / in;on / in & on.
  text=text
    .replace(/[\/,;|&+]+/g,'§')
    .replace(/\b(?:e|ou|and|or)\b/g,'§');
  const parts=text.split('§').map(v=>v.trim()).filter(Boolean);
  return parts.length>=2?parts.map(canonicalDiscursiveAtom):null;
}
function discursiveOrderMatters(q){
  const prompt=normalizedDiscursiveText(q?.pergunta||'');
  return /\b[a-e]\)|\bprimeiro\b|\bdepois\b|\brespectivamente\b|\bna ordem\b/.test(prompt);
}
function sameDiscursiveList(input,expected,q){
  const a=splitDiscursiveList(input),b=splitDiscursiveList(expected);
  if(!a||!b||a.length!==b.length)return false;
  if(discursiveOrderMatters(q))return a.every((v,i)=>v===b[i]);
  const aa=a.slice().sort(),bb=b.slice().sort();
  return aa.every((v,i)=>v===bb[i]);
}
function discursiveAcceptedAnswers(q){
  const extras=Array.isArray(q?.respostas_aceitas)?q.respostas_aceitas:[];
  return [q?.resposta_esperada,...extras]
    .map(v=>String(v??'').trim())
    .filter(Boolean);
}
function discursiveAnswerMatches(input,q){
  const normalized=normalizeDiscursiveAnswer(input);
  if(!normalized)return false;
  if(q?.aceitar_qualquer_resposta===true)return true;
  const accepted=discursiveAcceptedAnswers(q);
  return accepted.some(expected=>{
    // 1) mesma resposta ignorando caixa, acentos, espaços, hífens e pontuação;
    if(normalizeDiscursiveAnswer(expected)===normalized)return true;
    // 2) mesmo conceito escrito em português ou inglês;
    if(canonicalDiscursiveAtom(expected)===canonicalDiscursiveAtom(input))return true;
    // 3) listas com separadores diferentes: e, ou, and, or, /, vírgula, ;, &, +.
    return sameDiscursiveList(input,expected,q);
  });
}
function objectiveAlternativeCount(q){
  const n=Array.isArray(q?.alternativas)?q.alternativas.length:4;
  return Math.max(2,Math.min(5,Number.isInteger(n)?n:4));
}
function objectiveCorrectIndex(q){
  const n=objectiveAlternativeCount(q);
  const idx=Number(q?.correta);
  return Number.isInteger(idx)&&idx>=0&&idx<n?idx:0;
}
function validQuestionPool(area){
  if(!game)return[];
  let used=new Set(game.used_questions||[]);
  let pool=game.preQs?game.preQs:(modeDB(game.game_mode).perguntas||[]);
  return pool.filter(p=>{
    const type=questionType(p);
    const validByType=type==='discursiva'
      ? !!String(p.resposta_esperada||'').trim()
      : type==='verdadeiro_falso'
        ? trueFalseCorrect(p)!==null
        : (Array.isArray(p.alternativas)&&p.alternativas.length>=2&&p.alternativas.length<=5&&p.alternativas.every(v=>String(v??'').trim())&&Number.isInteger(Number(p.correta))&&Number(p.correta)>=0&&Number(p.correta)<p.alternativas.length);
    return p.area===area &&
      (!(game.subjects_selected||[]).length||(game.subjects_selected||[]).includes(subjectOf(p,game.game_mode))) &&
      game.difficulties_selected.includes(diffNorm(p.dificuldade)) &&
      validByType &&
      !used.has(questionKey(p))
  })
}
function hasAvailableQuestions(area){
  return SPECIAL.has(area)||validQuestionPool(area).length>0
}
function sanitizeAreasForGame(areas){
  let selected=(areas||[]).filter(Boolean);
  let playable=selected.filter(a=>!SPECIAL.has(a)&&hasAvailableQuestions(a));
  let specials=selected.filter(a=>SPECIAL.has(a));
  return playable.length?[...playable,...specials]:[]
}
function rebuildWheelAfterQuestion(area){
  if(!game||SPECIAL.has(area))return;
  if(validQuestionPool(area).length===0){
    game.areas_selected=(game.areas_selected||[]).filter(a=>a!==area);
    buildWheel();
    drawWheel();
    if(!game.areas_selected.some(a=>!SPECIAL.has(a))){
      msg('Fim das perguntas','Todas as perguntas das áreas selecionadas foram usadas.',endGame);
    }
  }
}
function markQuestionUsed(q){
  if(!game||!q)return;
  let k=questionKey(q);
  if(!game.used_questions)game.used_questions=[];
  if(!game.used_questions.includes(k))game.used_questions.push(k)
}

function hslToRgbArr(h,s,l){
  s/=100;l/=100;
  let c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r=0,g=0,b=0;
  if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return [r+m,g+m,b+m,1]
}
function colorDistance(a,b){
  let dr=(a[0]||0)-(b[0]||0),dg=(a[1]||0)-(b[1]||0),db=(a[2]||0)-(b[2]||0);
  return Math.sqrt(dr*dr+dg*dg+db*db)
}
function assignUniqueWheelColors(){
  if(!wheel||!Array.isArray(wheel.segments))return;
  const specialColors={
    '+5 pontos 1':[0.78,0.78,0.78,1],
    '+5 pontos 2':[0.78,0.78,0.78,1],
    '-5 pontos 1':[0.24,0.24,0.24,1],
    '-5 pontos 2':[0.24,0.24,0.24,1]
  };
  const normalCount=Math.max(1,wheel.segments.filter(s=>!SPECIAL.has(s.nome)).length);
  const used=[];
  let normalIndex=0;
  wheel.segments.forEach((seg,idx)=>{
    let c;
    const specialName=String(seg.nome||'').trim();
    if(specialName.includes('+5')){
      c=[0.78,0.78,0.78,1]; // +5 sempre cinza claro
    }else if(specialName.includes('-5')){
      c=[0.24,0.24,0.24,1]; // -5 sempre cinza escuro
    }else{
      // Golden-angle hue spacing: always different, even when the original JSON has repeated colors.
      c=hslToRgbArr((normalIndex*137.508+18)%360,58,63);
      normalIndex++;
    }
    let guard=0;
    const isSpecialGray=specialName.includes('+5')||specialName.includes('-5');
    while(!isSpecialGray&&used.some(u=>colorDistance(u,c)<0.20)&&guard<40){
      c=hslToRgbArr(((normalIndex+guard+idx)*137.508+31)%360,60,60);
      guard++;
    }
    seg.cor=c;
    used.push(c);
  });
}

function buildWheel(){
  let mode=game.game_mode,data=modeDB(mode),pairs;
  game.areas_selected=sanitizeAreasForGame(game.areas_selected);
  if(game.preQs){
    let questionAreas=[...new Set(game.preQs.map(q=>q.area))].filter(a=>game.areas_selected.includes(a)&&hasAvailableQuestions(a));
    let specialAreas=(game.areas_selected||[]).filter(a=>SPECIAL.has(a)&&(data.areas||{})[a]);
    let areas=[...new Set([...questionAreas,...specialAreas])];
    pairs=areas.map(a=>[a,(data.areas||{})[a]||[Math.random(),Math.random(),Math.random(),1]])
  }else{
    pairs=Object.entries(data.areas||{}).filter(([a])=>game.areas_selected.includes(a)&&(SPECIAL.has(a)||hasAvailableQuestions(a)))
  }
  let norm=pairs.filter(p=>!SPECIAL.has(p[0]));
  let specials=norm.length?pairs.filter(p=>SPECIAL.has(p[0])):[];
  let playable=[...norm,...specials],total=playable.length,res=[];
  shuffle(specials);
  shuffle(norm);
  if(specials.length){
    res=Array(total).fill(null);
    let step=total/specials.length,pos=0;
    specials.forEach(sp=>{
      let idx=Math.round(pos)%total;
      while(res[idx])idx=(idx+1)%total;
      res[idx]=sp;
      pos+=step
    });
    norm.forEach(n=>{
      let i=res.findIndex(x=>!x);
      if(i>=0)res[i]=n
    })
  }else{
    res=shuffle(norm.slice())
  }
  wheel.segments=res.filter(Boolean).map(([nome,cor])=>{
    let peso=SPECIAL.has(nome)&&specials.length?0.1/specials.length:(norm.length?0.9/norm.length:1);
    return{nome,cor,peso}
  });
  assignUniqueWheelColors();
}
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function renderScore(){let sc=$('#scoreboard');sc.innerHTML=game.scores.map((s,i)=>`<div class="scoreLabel">Equipe ${i+1}: ${s}</div>`).join('')}
function clamp01(v){return Math.max(0,Math.min(1,v))}
function liquidColor(c,mode='base'){
  let r=c[0]||0,g=c[1]||0,b=c[2]||0,a=c[3]??1;
  if(mode==='light'){r=clamp01(r*1.25+.08);g=clamp01(g*1.25+.08);b=clamp01(b*1.25+.08)}
  if(mode==='dark'){r=clamp01(r*.55+.03);g=clamp01(g*.55+.02);b=clamp01(b*.55+.015)}
  if(mode==='coffee'){r=clamp01(r*.62+.18);g=clamp01(g*.48+.09);b=clamp01(b*.35+.035);a*=.92}
  return`rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},${a})`
}
function drawLiquidSegment(ctx,cx,cy,r,rad1,rad2,seg,selected,t){
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.arc(cx,cy,r,rad1,rad2);
  ctx.closePath();

  let mid=(rad1+rad2)/2;
  let hx=cx+Math.cos(mid+t*.00045)*r*.22;
  let hy=cy+Math.sin(mid+t*.00045)*r*.22;
  let grad=ctx.createRadialGradient(hx,hy,r*.04,cx,cy,r);
  grad.addColorStop(0,liquidColor(seg.cor,selected?'light':'light'));
  grad.addColorStop(.44,liquidColor(seg.cor,'base'));
  grad.addColorStop(.78,liquidColor(seg.cor,'coffee'));
  grad.addColorStop(1,liquidColor(seg.cor,'dark'));
  ctx.fillStyle=grad;
  ctx.fill();

  ctx.save();
  ctx.clip();

  // Sombra líquida/coffee wash para unificar o visual com a xícara
  let coffee=ctx.createRadialGradient(cx-r*.15,cy-r*.22,r*.05,cx,cy,r*.95);
  coffee.addColorStop(0,'rgba(255,230,175,.12)');
  coffee.addColorStop(.45,'rgba(80,38,12,.08)');
  coffee.addColorStop(1,'rgba(35,14,4,.30)');
  ctx.fillStyle=coffee;
  ctx.fillRect(cx-r,cy-r,r*2,r*2);

  // Ondas internas no segmento, tipo café mexido
  ctx.globalCompositeOperation='screen';
  ctx.lineWidth=Math.max(2,r*.007);
  for(let i=0;i<4;i++){
    let rr=r*(.25+i*.16+Math.sin(t*.0014+i+mid)*.018);
    ctx.beginPath();
    ctx.strokeStyle=`rgba(255,245,210,${selected?.24:.11})`;
    let a1=rad1+Math.sin(t*.001+i)*.07;
    let a2=rad2+Math.cos(t*.001+i)*.07;
    ctx.arc(cx,cy,rr,a1,a2);
    ctx.stroke();
  }

  // Veios escuros, imitando correnteza dentro do líquido
  ctx.globalCompositeOperation='multiply';
  ctx.lineWidth=Math.max(2,r*.006);
  for(let i=0;i<3;i++){
    let rr=r*(.34+i*.18+Math.cos(t*.0011+i*2+mid)*.02);
    ctx.beginPath();
    ctx.strokeStyle='rgba(55,22,6,.16)';
    ctx.arc(cx,cy,rr,rad1+0.05,rad2-0.05);
    ctx.stroke();
  }

  if(selected){
    ctx.globalCompositeOperation='screen';
    // brilho da fatia selecionada, suave e sem formar seta/triângulo.
    let selGlow=ctx.createRadialGradient(cx,cy,r*.10,cx,cy,r*.92);
    selGlow.addColorStop(0,'rgba(255,255,255,.16)');
    selGlow.addColorStop(.55,'rgba(255,246,210,.10)');
    selGlow.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=selGlow;
    ctx.fillRect(cx-r,cy-r,r*2,r*2);

    ctx.globalCompositeOperation='source-over';
    ctx.strokeStyle='rgba(255,249,225,.46)';
    ctx.lineWidth=Math.max(2,r*.008);
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r*.985,rad1,rad2);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();

  // Divisória suave, sem cara chapada
  ctx.strokeStyle=selected?'rgba(255,244,220,.46)':'rgba(30,12,4,.20)';
  ctx.lineWidth=selected?Math.max(2,r*.007):Math.max(1.2,r*.0035);
  ctx.stroke();
}
function drawCoffeeSwirl(ctx,cx,cy,r,t){
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx,cy,r*.92,0,Math.PI*2);
  ctx.clip();

  // Grande brilho da superfície líquida
  let shine=ctx.createRadialGradient(cx-r*.28,cy-r*.32,r*.02,cx-r*.18,cy-r*.2,r*.72);
  shine.addColorStop(0,'rgba(255,250,222,.22)');
  shine.addColorStop(.25,'rgba(255,230,170,.10)');
  shine.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=shine;
  ctx.fillRect(cx-r,cy-r,r*2,r*2);

  // Espiral central, dando sensação de café girando
  ctx.globalCompositeOperation='screen';
  ctx.lineCap='round';
  for(let j=0;j<3;j++){
    ctx.beginPath();
    let turns=2.15+j*.28;
    for(let i=0;i<180;i++){
      let p=i/179;
      let ang=p*Math.PI*2*turns+t*.0012+j*2.1;
      let rr=r*(.07+p*.70)+Math.sin(p*18+t*.002+j)*r*.012;
      let x=cx+Math.cos(ang)*rr;
      let y=cy+Math.sin(ang)*rr;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.strokeStyle=`rgba(255,236,190,${.12-j*.025})`;
    ctx.lineWidth=r*(.012-j*.0025);
    ctx.stroke();
  }

  // Micro bolhas/reflexos
  ctx.globalCompositeOperation='screen';
  for(let i=0;i<16;i++){
    let ang=i*2.399+t*.00032;
    let rr=r*(.18+((i*37)%60)/100);
    let x=cx+Math.cos(ang)*rr;
    let y=cy+Math.sin(ang)*rr;
    ctx.beginPath();
    ctx.fillStyle=`rgba(255,238,190,${.07+(i%3)*.025})`;
    ctx.arc(x,y,r*(.006+(i%4)*.002),0,Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawHandlePointerCue(ctx,cx,cy,r,t){
  // Sem desenho extra: a alça da caneca funciona só como referência lógica.
  // O destaque acontece na própria fatia selecionada, sem triângulo/brilho residual.
}
function syncWheelTransform(angle=wheel.angle){
  const c=$('#wheelCanvas');
  if(!c)return;
  c.style.transform=`rotate(${angle}deg)`;
}
function setWheelFallbackVisible(visible){
  const img=$('#wheelFallback');
  if(!img)return;
  img.style.visibility=visible?'visible':'hidden';
}
function updateWheelFallback(){
  const c=$('#wheelCanvas');
  const img=$('#wheelFallback');
  if(!c||!img)return;
  try{
    img.src=c.toDataURL('image/png');
    img.style.visibility='visible';
  }catch(e){}
}
function drawWheel(highlightSelected=true){
  const c=$('#wheelCanvas');
  if(!c)return;
  const ctx=c.getContext('2d',{alpha:true});
  const W=c.width,H=c.height,cx=W/2,cy=H/2,r=Math.min(W,H)/2*.9;
  ctx.clearRect(0,0,W,H);
  if(!wheel.segments.length){syncWheelTransform();setWheelFallbackVisible(false);return}

  // A arte líquida é cara de desenhar, então ela é rasterizada apenas quando
  // a composição da roda muda ou quando precisamos destacar o resultado.
  // Durante o giro, o canvas pronto é rotacionado pela camada de composição/GPU.
  const t=performance.now();
  const total=wheel.segments.reduce((a,s)=>a+s.peso,0);
  const pointerLocal=normDeg(HANDLE_POINTER_DEG-wheel.angle);
  let cur=0;
  for(const seg of wheel.segments){
    const deg=seg.peso/total*360;
    const rad1=cur*Math.PI/180,rad2=(cur+deg)*Math.PI/180;
    const selected=!!highlightSelected&&angleInSegment(cur,cur+deg,pointerLocal);
    drawLiquidSegment(ctx,cx,cy,r,rad1,rad2,seg,selected,t);
    cur+=deg;
  }

  drawCoffeeSwirl(ctx,cx,cy,r,t);
  drawHandlePointerCue(ctx,cx,cy,r,t);

  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  const rim=ctx.createRadialGradient(cx,cy,r*.72,cx,cy,r);
  rim.addColorStop(0,'rgba(0,0,0,0)');
  rim.addColorStop(.72,'rgba(0,0,0,0)');
  rim.addColorStop(1,'rgba(25,10,3,.34)');
  ctx.fillStyle=rim;
  ctx.fill();

  syncWheelTransform();
  updateWheelFallback();
}
function bright(c){return liquidColor(c,'light')}
function bright(c){return liquidColor(c,'light')}

const HANDLE_POINTER_DEG=0; // alça da caneca = lado direito da roleta
function normDeg(a){return((a%360)+360)%360}
function angleInSegment(startDeg,endDeg,angleDeg){
  startDeg=normDeg(startDeg); endDeg=normDeg(endDeg); angleDeg=normDeg(angleDeg);
  if(startDeg<=endDeg)return angleDeg>=startDeg&&angleDeg<endDeg;
  return angleDeg>=startDeg||angleDeg<endDeg;
}

function selectedSeg(){
  if(!wheel.segments.length)return null;
  let total=wheel.segments.reduce((a,s)=>a+s.peso,0),pointerLocal=normDeg(HANDLE_POINTER_DEG-wheel.angle),cur=0;
  for(let s of wheel.segments){
    let d=s.peso/total*360;
    if(angleInSegment(cur,cur+d,pointerLocal))return s;
    cur+=d
  }
  return wheel.segments[0]
}
function stopWheelAnimation(){
  if(wheel.raf){cancelAnimationFrame(wheel.raf);wheel.raf=null}
  if(wheel.spinAnimation){
    try{wheel.spinAnimation.cancel()}catch(e){}
    wheel.spinAnimation=null;
  }
  wheel.anim=false;
  wheel.speed=0;
  const c=$('#wheelCanvas');
  if(c)c.classList.remove('wheelSpinning');
  setWheelFallbackVisible(true);
}
function finishSpin(targetAngle){
  const c=$('#wheelCanvas');
  wheel.angle=normDeg(targetAngle);
  wheel.speed=0;
  wheel.anim=false;
  wheel.raf=null;
  wheel.spinAnimation=null;
  if(c){
    c.classList.remove('wheelSpinning');
    c.style.transform=`rotate(${wheel.angle}deg)`;
  }
  setWheelFallbackVisible(true);
  // Só agora redesenha para aplicar o brilho à fatia realmente selecionada.
  drawWheel(true);
  const seg=selectedSeg();
  if(seg)handleArea(seg.nome);
}
function spin(){
  if(!game||wheel.anim)return;
  buildWheel();
  if(!wheel.segments.length||!game.areas_selected.some(a=>!SPECIAL.has(a))){
    msg('Fim das perguntas','Não há mais áreas com perguntas disponíveis.',endGame);
    return;
  }

  $('#instruction').style.display='none';
  stopWheelAnimation();
  wheel.anim=true;

  const c=$('#wheelCanvas');
  const startAngle=normDeg(wheel.angle);
  const extraTurns=6+Math.floor(Math.random()*3);
  const randomStop=Math.random()*360;
  const targetAngle=startAngle+extraTurns*360+randomStop;
  const duration=4200+Math.random()*900;

  // Desenha uma única textura sem highlight. Daqui até o final do giro,
  // só a propriedade transform muda: nada de gradientes/paths por frame.
  drawWheel(false);
  setWheelFallbackVisible(false);
  if(c)c.classList.add('wheelSpinning');

  if(c&&typeof c.animate==='function'){
    const anim=c.animate(
      [
        {transform:`rotate(${startAngle}deg)`},
        {transform:`rotate(${targetAngle}deg)`}
      ],
      {
        duration,
        easing:'cubic-bezier(.08,.62,.12,1)',
        fill:'forwards'
      }
    );
    wheel.spinAnimation=anim;
    anim.onfinish=()=>finishSpin(targetAngle);
    anim.oncancel=()=>{if(c)c.classList.remove('wheelSpinning');setWheelFallbackVisible(true)};
    return;
  }

  // Fallback antigo, mas também leve: atualiza apenas o transform do canvas.
  const start=performance.now();
  const delta=targetAngle-startAngle;
  const easeOut=t=>1-Math.pow(1-t,4);
  function step(now){
    if(!wheel.anim)return;
    const p=Math.min(1,(now-start)/duration);
    const a=startAngle+delta*easeOut(p);
    if(c)c.style.transform=`rotate(${a}deg)`;
    if(p<1){wheel.raf=requestAnimationFrame(step);return}
    finishSpin(targetAngle);
  }
  wheel.raf=requestAnimationFrame(step);
}
function handleArea(area){
  if(!area){msg('Erro','Nenhuma área foi selecionada!');return}
  if(area.includes('pontos')){if(area.includes('+5'))addPoints(5);else addPoints(-5);return}
  let q=pickQuestion(area);
  if(!q){
    game.areas_selected=(game.areas_selected||[]).filter(a=>a!==area);
    buildWheel();
    drawWheel();
    if(!wheel.segments.length)msg('Fim das perguntas','Não há mais perguntas disponíveis.',endGame);
    return
  }
  questionPopup(area,q)
}
function addPoints(n){
  if(n>0){game.scores[game.current_team]+=n;msg('Pontos',`+${n} pontos adicionados!`,nextTeam);okSound.play().catch(()=>{})}
  else{game.scores[game.current_team]=Math.max(0,game.scores[game.current_team]+n);msg('Pontos',`${n} pontos subtraídos!`,nextTeam);errSound.play().catch(()=>{})}
  renderScore()
}
function pickQuestion(area){
  let pool=validQuestionPool(area);
  return pool[Math.floor(Math.random()*pool.length)]
}
function questionPopup(area,q){
  let tl=game.time_limit_secs,rem=tl;
  let color=(modeDB(game.game_mode).areas||{})[area]||[.2,.2,.2,1];
  const type=questionType(q);
  const meta=`${esc(subjectOf(q,game.game_mode))} · ${esc(area)} · ${esc(q.dificuldade||'')} · ${questionTypeLabel(type)}`;
  let controls='';
  if(type==='discursiva'){
    controls=`<div class="discursiveControls">
      <label class="discursiveAnswerLabel" for="discursiveAnswerInput">Digite a resposta:</label>
      <input id="discursiveAnswerInput" class="discursiveAnswerInput" type="text" autocomplete="off" spellcheck="false" placeholder="Escreva sua resposta aqui">
      <div class="discursiveToleranceNote">Maiúsculas/minúsculas, acentos e pontuação não alteram a correção. Conceitos equivalentes em português/inglês e listas com e/ou, / ou vírgula também são aceitos.</div>
      <div class="discursiveAnswerActions">
        <button id="submitDiscursiveAnswer" class="stdBtn discursiveSubmit" style="background-image:url('${A['botao generico popup generico.png']}')">Responder</button>
        <button class="stdBtn discursiveHint" data-result="hint" style="background-image:url('${A['botao generico popup generico.png']}')">Dica</button>
      </div>
    </div>`;
  }else if(type==='verdadeiro_falso'){
    controls=`<div class="trueFalseControls">
      <div class="trueFalseAnswerRow" role="group" aria-label="Escolha Verdadeiro ou Falso">
        <button class="stdBtn trueFalseBtn trueFalseTrue" data-v="true" style="background-image:url('${A['botao generico popup generico.png']}')">Verdadeiro</button>
        <button class="stdBtn trueFalseBtn trueFalseFalse" data-v="false" style="background-image:url('${A['botao generico popup generico.png']}')">Falso</button>
      </div>
      <button class="stdBtn trueFalseHint" type="button" style="background-image:url('${A['botao generico popup generico.png']}')">Dica</button>
    </div>`;
  }else{
    controls=[...(q.alternativas||[]),'Dica'].map((a,i)=>`<button class="stdBtn ans" data-i="${i}" style="background-image:url('${A['botao generico popup generico.png']}');font-size:18px">${esc(a)}</button>`).join('');
  }
  let html=`<div style="height:100%;display:flex;flex-direction:column;padding:15px 40px 25px;gap:15px"><div id="timerLabel" class="label" style="height:48px;text-align:center;font-size:18px">Tempo restante: ${rem}s</div><div class="scroll kvScroll" style="flex:1"><div style="padding:0 40px 10px;display:flex;flex-direction:column;gap:10px"><div class="questionMeta">${meta}</div><div class="label" style="font-size:20px;text-align:center;white-space:pre-wrap">[Equipe ${game.current_team+1}] ${esc(q.pergunta||'Pergunta não encontrada.')}</div>${controls}</div></div></div>`;
  popup(html,1093,494,'popup genérico HD.png').parentElement.style.backgroundColor=rgba(color,.3);
  let hintUsed=false;
  const finishQuestion=(correct,answerMarked=null)=>{
    const marked=type==='discursiva'
      ? String(answerMarked??'')
      : type==='verdadeiro_falso'
        ? (answerMarked===true?'Verdadeiro':answerMarked===false?'Falso':String(answerMarked??''))
        : answerMarked;
    const expected=type==='discursiva'
      ? (q.resposta_esperada||'')
      : type==='verdadeiro_falso'
        ? (trueFalseCorrect(q)===true?'Verdadeiro':'Falso')
        : q.correta;
    const awardedPoints=correct?effectivePts(q.dificuldade,hintUsed):0;
    let rec={materia:subjectOf(q,game.game_mode),area,difficulty:q.dificuldade,question:q.pergunta,question_type:type,answer_marked:marked,correct_answer:expected,accepted_answers:type==='discursiva'?discursiveAcceptedAnswers(q):undefined,is_correct:correct,hint_used:hintUsed,base_points:pts(q.dificuldade),awarded_points:awardedPoints,equipe:game.current_team+1,answer_time_secs:tl-rem,question_key:questionKey(q)};
    game.rounds.push(rec);
    markQuestionUsed(q);
    if(correct){
      okSound.play().catch(()=>{});
      game.scores[game.current_team]+=awardedPoints;
      renderScore();
      closePopup();
      rebuildWheelAfterQuestion(area);
      msg('Pontos',hintUsed?`+${awardedPoints} pontos adicionados! (com dica = 85%)`:`+${awardedPoints} pontos adicionados!`,nextTeam)
    }else{
      errSound.play().catch(()=>{});
      closePopup();
      rebuildWheelAfterQuestion(area);
      const feedback=type==='discursiva'&&q.resposta_esperada
        ? `Que pena, você errou! Resposta esperada: ${q.resposta_esperada}`
        : type==='verdadeiro_falso'
          ? `Que pena, você errou! Resposta correta: ${trueFalseCorrect(q)?'Verdadeiro':'Falso'}`
          : 'Que pena, você errou!';
      msg('Pontos',feedback,nextTeam)
    }
  };
  timer=setInterval(()=>{
    if(rem<=0){
      closePopup();
      markQuestionUsed(q);
      rebuildWheelAfterQuestion(area);
      msg('Tempo Esgotado','Infelizmente o tempo se esgotou!',nextTeam);
      return
    }
    rem--;
    let l=$('#timerLabel');
    if(l)l.textContent=`Tempo restante: ${rem}s`
  },1000);
  if(type==='discursiva'){
    const input=$('#discursiveAnswerInput');
    const submit=$('#submitDiscursiveAnswer');
    const hint=$('.discursiveHint');
    const gradeDiscursive=e=>{
      e&&e.preventDefault&&e.preventDefault();
      e&&e.stopPropagation&&e.stopPropagation();
      const answer=String(input?.value||'').trim();
      if(!answer){toast('Digite uma resposta antes de continuar.');input?.focus();return}
      finishQuestion(discursiveAnswerMatches(answer,q),answer);
    };
    if(submit)submit.onclick=gradeDiscursive;
    if(input){
      input.focus();
      input.addEventListener('keydown',e=>{if(e.key==='Enter')gradeDiscursive(e)});
    }
    if(hint)hint.onclick=e=>{e.preventDefault();e.stopPropagation();hintUsed=true;showHint(q)};
    return;
  }
  if(type==='verdadeiro_falso'){
    const correctValue=trueFalseCorrect(q);
    $$('.trueFalseBtn').forEach(b=>b.onclick=e=>{
      e&&e.preventDefault&&e.preventDefault();
      e&&e.stopPropagation&&e.stopPropagation();
      const marked=b.dataset.v==='true';
      finishQuestion(marked===correctValue,marked);
    });
    const hint=$('.trueFalseHint');
    if(hint)hint.onclick=e=>{e.preventDefault();e.stopPropagation();hintUsed=true;showHint(q)};
    return;
  }
  $$('.ans').forEach(b=>b.onclick=e=>{
    e&&e.preventDefault&&e.preventDefault();
    e&&e.stopPropagation&&e.stopPropagation();
    let i=+b.dataset.i;
    if(i===(q.alternativas||[]).length){hintUsed=true;showHint(q);return}
    let correct=i===Number(q.correta);
    const awardedPoints=correct?effectivePts(q.dificuldade,hintUsed):0;
    let rec={materia:subjectOf(q,game.game_mode),area,difficulty:q.dificuldade,question:q.pergunta,question_type:type,answer_marked:i,correct_answer:q.correta,is_correct:correct,hint_used:hintUsed,base_points:pts(q.dificuldade),awarded_points:awardedPoints,equipe:game.current_team+1,answer_time_secs:tl-rem,question_key:questionKey(q)};
    game.rounds.push(rec);
    markQuestionUsed(q);
    if(correct){
      okSound.play().catch(()=>{});
      game.scores[game.current_team]+=awardedPoints;
      renderScore();
      closePopup();
      rebuildWheelAfterQuestion(area);
      msg('Pontos',hintUsed?`+${awardedPoints} pontos adicionados! (com dica = 85%)`:`+${awardedPoints} pontos adicionados!`,nextTeam)
    }else{
      errSound.play().catch(()=>{});
      closePopup();
      rebuildWheelAfterQuestion(area);
      msg('Pontos','Que pena, você errou!',nextTeam)
    }
  })
}
function showHint(q){
  const host=$('#popupHost');
  if(!host)return;
  const old=host.querySelector('.hintLayer');
  if(old)old.remove();

  const layer=document.createElement('div');
  layer.className='hintLayer';
  layer.innerHTML=`<div class="hintCard" role="dialog" aria-modal="true">
    <h2>Dica</h2>
    <div class="hintPenalty">Usar a dica reduz a pontuação desta questão para 85% do valor original.</div>
    <div class="hintText">${esc(q.dica_texto||'Sem dica cadastrada.')}</div>
    <button class="hintOk" type="button">OK</button>
  </div>`;

  layer.addEventListener('click',e=>{
    // Clique no fundo da dica fecha só a dica.
    // Não usa captura, para não bloquear o botão OK.
    e.stopPropagation();
    if(e.target===layer)layer.remove();
  },false);

  const ok=layer.querySelector('.hintOk');
  const closeHint=e=>{
    e&&e.preventDefault&&e.preventDefault();
    e&&e.stopPropagation&&e.stopPropagation();
    layer.remove();
  };
  ok.addEventListener('click',closeHint,false);
  ok.addEventListener('pointerup',closeHint,false);
  ok.addEventListener('touchend',closeHint,{passive:false});

  host.appendChild(layer);
}
function nextTeam(){if(!game)return;game.current_team=(game.current_team+1)%game.num_teams;renderScore()}
function parseHistoryDate(value){
  if(!value)return NaN;
  if(typeof value==='number')return Number.isFinite(value)?value:NaN;
  const direct=Date.parse(value);
  if(Number.isFinite(direct))return direct;
  const m=String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,)?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(!m)return NaN;
  return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]),Number(m[5]),Number(m[6]||0)).getTime();
}
function historyDurationSeconds(s){
  for(const key of ['duration_secs','duration_seconds','duration']){
    const n=Number(s?.[key]);
    if(Number.isFinite(n)&&n>=0)return Math.round(n);
  }
  const start=Number(s?.started_at_ms)||parseHistoryDate(s?.started_at);
  const end=Number(s?.ended_at_ms)||parseHistoryDate(s?.ended_at);
  if(Number.isFinite(start)&&Number.isFinite(end)&&end>=start)return Math.round((end-start)/1000);
  const roundSeconds=(s?.rounds||[]).reduce((sum,r)=>sum+(Number(r?.answer_time_secs)||0),0);
  return roundSeconds>0?Math.round(roundSeconds):null;
}
function formatHistoryDuration(s){
  const total=historyDurationSeconds(s);
  if(total==null)return '—';
  const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),sec=total%60;
  if(h>0)return `${h}h ${m}min ${sec}s`;
  if(m>0)return `${m}min ${sec}s`;
  return `${sec}s`;
}
function endGame(){if(!game||!game.scores.length)return;stopWheelAnimation();let max=Math.max(...game.scores),w=game.scores.map((s,i)=>s===max?i+1:null).filter(Boolean),txt=w.length===1?`Equipe ${w[0]} venceu com ${max} pontos!`:`Empate entre as equipes: ${w.join(', ')} com ${max} pontos!`;let hist=load(HIST_KEY,[]);const endedAtMs=Date.now(),startMs=Number(game.started_at_ms)||parseHistoryDate(game.started_at),durationSecs=Number.isFinite(startMs)?Math.max(0,Math.round((endedAtMs-startMs)/1000)):null;hist.push({...game,ended_at:new Date(endedAtMs).toLocaleString('pt-BR'),ended_at_ms:endedAtMs,duration_secs:durationSecs,final_scoreboard:Object.fromEntries(game.scores.map((s,i)=>[`Equipe ${i+1}`,s]))});save(HIST_KEY,hist);msg('Jogo Encerrado',txt,()=>{game=null;show('intro')})}
function renderAddEdit(){
  let c=$('#addEditContent');
  if(editingIndex&&!addEditDraftMode)addEditDraftMode=editingIndex.mode;
  let m=addEditDraftMode||editingIndex?.mode||'Coffee Lovers',existing=editingIndex?modeDB(editingIndex.mode).perguntas[editingIndex.index]:null,initialSubject=existing?subjectOf(existing,editingIndex.mode):defaultSubjectForMode(m),initialType=questionType(existing||{});
  c.innerHTML=`<div class="addEditForm">
    <div class="fieldRow"><span class="fieldLabel" id="editModeLabel">Modo de Jogo:</span><div id="editModeBox" class="selectFieldBox"></div></div>
    <div class="fieldRow"><span class="fieldLabel" id="editSubjectLabel">Matéria:</span><div id="editSubjectBox" class="selectFieldBox"></div></div>
    <div class="fieldRow subjectCreateRow"><label for="newSubject">Nova Matéria:</label><input id="newSubject" type="text" placeholder="Ex.: Física"><button id="addSubject" type="button" class="stdBtn addMetaBtn" style="background-image:url('${A['botao generico listarperguntas.png']}')">Adicionar</button></div>
    <div class="fieldRow"><span class="fieldLabel" id="editAreaLabel">Área:</span><div id="editAreaBox" class="selectFieldBox"></div></div>
    <div class="fieldRow"><label for="newArea">Nova Área:</label><input id="newArea" type="text"><button id="addArea" type="button" class="stdBtn addMetaBtn" style="background-image:url('${A['botao generico listarperguntas.png']}')">Adicionar</button></div>
    <div class="fieldRow"><span class="fieldLabel" id="editTypeLabel">Tipo de questão:</span><div id="editTypeBox" class="selectFieldBox"></div></div>
    <div class="fieldRow"><label for="f0">Pergunta:</label><textarea id="f0" rows="2"></textarea></div>
    <div id="objectiveFields">
      <div class="fieldRow"><span class="fieldLabel" id="objectiveAltCountLabel">Quantidade de alternativas:</span><div id="objectiveAltCountBox" class="selectFieldBox"></div></div>
      ${['A','B','C','D','E'].map((letter,i)=>`<div class="fieldRow objectiveAlternativeRow" data-alt-index="${i}"><label for="f${i+1}">Alternativa ${letter}:</label><input id="f${i+1}" type="text"></div>`).join('')}
      <div class="fieldRow"><span class="fieldLabel" id="objectiveCorrectLabel">Resposta correta:</span><div id="objectiveCorrectBox" class="selectFieldBox"></div></div>
      <div class="objectiveEditHelp">Escolha entre 2 e 5 alternativas. No jogo, somente as alternativas preenchidas para esta questão serão exibidas.</div>
    </div>
    <div id="discursiveFields" hidden>
      <div class="fieldRow"><label for="expectedAnswerInput">Resposta esperada:</label><textarea id="expectedAnswerInput" rows="2" placeholder="Ex.: Guarda-roupa"></textarea></div>
      <div class="discursiveEditHelp">A correção ignora maiúsculas/minúsculas, acentos, espaços, hífens e pontuação; aceita equivalentes PT/EN cadastrados e variações de listas com e/ou, and/or, /, vírgula, ponto e vírgula, & ou +.</div>
      <div class="fieldRow"><label for="acceptedAnswersInput">Outras respostas aceitas:</label><textarea id="acceptedAnswersInput" rows="3" placeholder="Opcional. Uma por linha. Ex.: Roupeiro&#10;Armário"></textarea></div>
    </div>
    <div id="trueFalseFields" hidden>
      <div class="fieldRow"><span class="fieldLabel" id="trueFalseCorrectLabel">Resposta correta:</span><div id="trueFalseCorrectBox" class="selectFieldBox"></div></div>
      <div class="trueFalseEditHelp">No jogo, esta pergunta terá apenas dois botões de resposta: <strong>Verdadeiro</strong> e <strong>Falso</strong>.</div>
    </div>
    <div class="fieldRow"><span class="fieldLabel" id="editDiffLabel">Dificuldade:</span><div id="diffBox" class="selectFieldBox"></div></div>
    <div class="fieldRow"><label for="areaColor">Cor da Área:</label><input id="areaColor" type="color" value="#ffffff"></div>
    <div class="fieldRow"><label for="hintText">Dica (Texto):</label><input id="hintText" type="text"></div>
    <div class="fieldRow imagePathRow"><label for="hintImg">Caminho da Imagem:</label><input id="hintImg" type="text"><button id="chooseHintImg" type="button" class="stdBtn addMetaBtn" style="background-image:url('${A['botao generico listarperguntas.png']}')">Escolher Arquivo</button></div>
    <div class="fieldRow formActions"><span class="fieldSpacer" aria-hidden="true"></span><button id="saveQ" type="button" class="stdBtn" style="flex:1;background-image:url('${A['botao generico listarperguntas.png']}')">Salvar</button><button id="cancelQ" type="button" class="stdBtn" style="flex:1;background-image:url('${A['botao generico listarperguntas.png']}')">Cancelar</button></div>
  </div>`;
  if(!$('#addBack')){imgBtn(c,'addBack','setavoltar.png',20,20,122,86,()=>show('home'),'setavoltar_hover.png');}
  makeSelect($('#editModeBox'),'editMode',MODES,m,0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',v=>{addEditDraftMode=v;renderAddEdit()});
  let currentMode=getSel('editMode')||m;
  makeSelect($('#editSubjectBox'),'editSubject',subjectOptions(currentMode),initialSubject,0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png');
  let areas=Object.keys(modeDB(currentMode).areas||{});
  makeSelect($('#editAreaBox'),'editArea',areas,'Selecione uma Área',0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',a=>{$('#areaColor').value=hex((modeDB(getSel('editMode')).areas||{})[a])});
  makeSelect($('#editTypeBox'),'editType',['Objetiva','Discursiva','Verdadeiro ou Falso'],questionTypeLabel(initialType),0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',updateQuestionTypeFields);
  const initialAltCount=objectiveAlternativeCount(existing);
  makeSelect($('#objectiveAltCountBox'),'objectiveAltCount',['2','3','4','5'],String(initialAltCount),0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',updateObjectiveAlternativeFields);
  renderObjectiveCorrectSelect(initialAltCount,String.fromCharCode(65+objectiveCorrectIndex(existing)));
  makeSelect($('#trueFalseCorrectBox'),'trueFalseCorrect',['Verdadeiro','Falso'],trueFalseCorrect(existing)===false?'Falso':'Verdadeiro',0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png');
  makeSelect($('#diffBox'),'editDiff',['Fácil','Médio','Difícil'],'Fácil',0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png');
  [['editMode','editModeLabel'],['editSubject','editSubjectLabel'],['editArea','editAreaLabel'],['editType','editTypeLabel'],['objectiveAltCount','objectiveAltCountLabel'],['objectiveCorrect','objectiveCorrectLabel'],['trueFalseCorrect','trueFalseCorrectLabel'],['editDiff','editDiffLabel']].forEach(([id,labelId])=>{let el=$('#'+id);if(el){el.setAttribute('role','combobox');el.setAttribute('aria-haspopup','listbox');el.setAttribute('aria-expanded','false');el.setAttribute('aria-labelledby',labelId);el.tabIndex=0;}});
  if(editingIndex){
    let q=modeDB(editingIndex.mode).perguntas[editingIndex.index];
    const targetMode=getSel('editMode')||m;
    const targetSubjects=subjectOptions(targetMode);
    const targetAreas=Object.keys(modeDB(targetMode).areas||{});
    const currentSubject=subjectOf(q,editingIndex.mode);
    setSel('editMode',targetMode);setSel('editSubject',targetSubjects.includes(currentSubject)?currentSubject:defaultSubjectForMode(targetMode));setSel('editArea',targetAreas.includes(q.area)?q.area:'Selecione uma Área');setSel('editType',questionTypeLabel(q));setSel('editDiff',q.dificuldade);
    if(questionType(q)==='verdadeiro_falso')setSel('trueFalseCorrect',trueFalseCorrect(q)===false?'Falso':'Verdadeiro');
    if(questionType(q)==='objetiva'){setSel('objectiveAltCount',String(objectiveAlternativeCount(q)));renderObjectiveCorrectSelect(objectiveAlternativeCount(q),String.fromCharCode(65+objectiveCorrectIndex(q)));}
    $('#f0').value=q.pergunta||'';(q.alternativas||[]).forEach((a,i)=>{let f=$('#f'+(i+1));if(f)f.value=a});$('#expectedAnswerInput').value=q.resposta_esperada||'';if($('#acceptedAnswersInput'))$('#acceptedAnswersInput').value=(q.respostas_aceitas||[]).join('\n');$('#hintText').value=q.dica_texto||'';$('#hintImg').value=q.dica_imagem||'';
    const colorSource=(modeDB(targetMode).areas||{})[getSel('editArea')] || (modeDB(editingIndex.mode).areas||{})[q.area];
    if(colorSource)$('#areaColor').value=hex(colorSource);
  }
  updateQuestionTypeFields();
  updateObjectiveAlternativeFields();
  $('#cancelQ').onclick=()=>{editingIndex=null;addEditDraftMode='Coffee Lovers';show('home')};
  $('#addSubject').onclick=()=>{
    let mm=getSel('editMode'),raw=$('#newSubject').value.trim();
    if(!raw){toast('Digite o nome da matéria.');$('#newSubject').focus();return}
    let opts=subjectOptions(mm),existingName=opts.find(v=>v.toLocaleLowerCase('pt-BR')===raw.toLocaleLowerCase('pt-BR')),name=existingName||raw;
    let d=modeDB(mm);d.materias=Array.isArray(d.materias)?d.materias:[];
    if(!d.materias.some(v=>String(v).toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')))d.materias.push(name);
    save(DB_KEY,DB);renderAddEdit();setSel('editSubject',name);toast(existingName?'Matéria já disponível.':'Matéria adicionada.');
  };
  $('#newSubject').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#addSubject').click();}});
  $('#addArea').onclick=()=>{let mm=getSel('editMode'),a=$('#newArea').value.trim();if(a){modeDB(mm).areas[a]=fromHex($('#areaColor').value);save(DB_KEY,DB);renderAddEdit();setSel('editArea',a)}else{$('#newArea').focus()}};
  $('#newArea').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#addArea').click();}});
  $('#saveQ').onclick=saveQuestion;
}
function renderObjectiveCorrectSelect(count,preferred){
  const box=$('#objectiveCorrectBox');
  if(!box)return;
  const old=$('#objectiveCorrect');
  if(old)old.remove();
  const letters=['A','B','C','D','E'].slice(0,Math.max(2,Math.min(5,Number(count)||4)));
  const selected=letters.includes(preferred)?preferred:letters[0];
  const el=makeSelect(box,'objectiveCorrect',letters,selected,0,0,500,38,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png');
  el.setAttribute('role','combobox');el.setAttribute('aria-haspopup','listbox');el.setAttribute('aria-expanded','false');el.setAttribute('aria-labelledby','objectiveCorrectLabel');el.tabIndex=0;
}
function updateObjectiveAlternativeFields(){
  const count=Math.max(2,Math.min(5,Number(getSel('objectiveAltCount'))||4));
  $$('.objectiveAlternativeRow').forEach(row=>{row.hidden=Number(row.dataset.altIndex)>=count});
  const current=getSel('objectiveCorrect')||'A';
  renderObjectiveCorrectSelect(count,current);
}
function updateQuestionTypeFields(){
  const selected=getSel('editType')||'Objetiva';
  const type=questionType({tipo:selected});
  const objective=$('#objectiveFields'),discursive=$('#discursiveFields'),trueFalse=$('#trueFalseFields');
  if(objective)objective.hidden=type!=='objetiva';
  if(discursive)discursive.hidden=type!=='discursiva';
  if(trueFalse)trueFalse.hidden=type!=='verdadeiro_falso';
  if(type==='objetiva')updateObjectiveAlternativeFields();
}
function saveQuestion(){
  let m=getSel('editMode'),a=getSel('editArea');addEditDraftMode=m||addEditDraftMode;
  if(a==='Selecione uma Área'||!a){msg('Erro','Selecione ou adicione uma área.');return}
  const pergunta=$('#f0').value.trim();
  if(!pergunta){msg('Erro','Digite a pergunta.');return}
  const tipo=questionType({tipo:getSel('editType')||'Objetiva'});
  let q={materia:getSel('editSubject')||defaultSubjectForMode(m),area:a,tipo,pergunta,dificuldade:getSel('editDiff'),dica_texto:$('#hintText').value,dica_imagem:$('#hintImg').value};
  if(tipo==='discursiva'){
    q.resposta_esperada=$('#expectedAnswerInput').value.trim();
    if(!q.resposta_esperada){msg('Erro','Digite uma resposta esperada para a questão discursiva.');return}
    q.respostas_aceitas=String($('#acceptedAnswersInput')?.value||'')
      .split(/\r?\n|;/)
      .map(v=>v.trim())
      .filter(Boolean)
      .filter(v=>normalizeDiscursiveAnswer(v)!==normalizeDiscursiveAnswer(q.resposta_esperada));
  }else if(tipo==='verdadeiro_falso'){
    q.correta_vf=(getSel('trueFalseCorrect')||'Verdadeiro')==='Verdadeiro';
  }else{
    const altCount=Math.max(2,Math.min(5,Number(getSel('objectiveAltCount'))||4));
    q.alternativas=Array.from({length:altCount},(_,i)=>String($('#f'+(i+1))?.value||'').trim());
    if(q.alternativas.some(v=>!v)){msg('Erro',`Preencha as ${altCount} alternativas da questão objetiva.`);return}
    const correctLetter=getSel('objectiveCorrect')||'A';
    const correta='ABCDE'.indexOf(correctLetter);
    if(correta<0||correta>=altCount){msg('Erro','Selecione uma resposta correta entre as alternativas disponíveis.');return}
    q.correta=correta;
  }
  let d=modeDB(m);d.materias=Array.isArray(d.materias)?d.materias:[];
  if(q.materia&&!d.materias.some(v=>String(v).toLocaleLowerCase('pt-BR')===q.materia.toLocaleLowerCase('pt-BR')))d.materias.push(q.materia);
  d.areas[a]=fromHex($('#areaColor').value);
  if(editingIndex&&editingIndex.mode===m){
    d.perguntas[editingIndex.index]=q;
  }else if(editingIndex){
    let oldModeDB=modeDB(editingIndex.mode);
    if(Array.isArray(oldModeDB.perguntas)&&editingIndex.index>=0&&editingIndex.index<oldModeDB.perguntas.length)oldModeDB.perguntas.splice(editingIndex.index,1);
    d.perguntas.push(q);
  }else d.perguntas.push(q);
  const movedMode=editingIndex&&editingIndex.mode!==m;
  const saveMsg=movedMode?(tipo==='discursiva'?'Pergunta discursiva movida e salva.':tipo==='verdadeiro_falso'?'Pergunta de Verdadeiro ou Falso movida e salva.':'Pergunta objetiva movida e salva.'):(tipo==='discursiva'?'Pergunta discursiva salva.':tipo==='verdadeiro_falso'?'Pergunta de Verdadeiro ou Falso salva.':'Pergunta objetiva salva.');
  save(DB_KEY,DB);editingIndex=null;addEditDraftMode='Coffee Lovers';msg('Sucesso',saveMsg,()=>show('home'))
}
function renderList(){const c=$('#listControls');c.innerHTML='';let p=POS.list||{};const modePos=p.listMode||p.spinner_game_mode_list||[794,571],areaPos=p.listArea||p.spinner_area_filter||[366,407],diffPos=p.listDiff||p.spinner_difficulty_filter||[762,410],backPos=p.btn_voltar_listar||[40,571];makeSelect(c,'listMode',MODES,'Coffee Lovers',modePos[0]??794,modePos[1]??571,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',()=>renderListRows());imgBtn(c,'btn_voltar_listar','setavoltar.png',backPos[0]??40,backPos[1]??571,126,86,()=>show('home'),'setavoltar_hover.png');makeSelect(c,'listArea',['Todas',...Object.keys(modeDB('Coffee Lovers').areas||{})],'Todas',areaPos[0]??366,areaPos[1]??407,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',renderListRows);makeSelect(c,'listDiff',['Todas','Fácil','Médio','Difícil'],'Todas',diffPos[0]??762,diffPos[1]??410,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',renderListRows);renderListRows()}
function renderListRows(){let m=getSel('listMode')||'Coffee Lovers';let p=POS.list||{};const areaPos=p.listArea||p.spinner_area_filter||[366,407];let areaSel=$('#listArea'),cur=areaSel?getSel('listArea'):'Todas';if(areaSel){let vals=['Todas',...Object.keys(modeDB(m).areas||{})];areaSel.remove();makeSelect($('#listControls'),'listArea',vals,vals.includes(cur)?cur:'Todas',areaPos[0]??366,areaPos[1]??407,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',renderListRows)}let area=getSel('listArea')||'Todas',diff=getSel('listDiff')||'Todas';let rows=(modeDB(m).perguntas||[]).map((q,i)=>({q,i})).filter(o=>(area==='Todas'||o.q.area===area)&&(diff==='Todas'||String(o.q.dificuldade).charAt(0).toUpperCase()+String(o.q.dificuldade).slice(1)===diff));$('#questionList').innerHTML=rows.map(({q,i})=>`<div class="listRow"><div class="qText"><span class="listMeta">${esc(subjectOf(q,m))} · ${esc(q.area)} · ${esc(q.dificuldade)} · ${questionTypeLabel(q)}</span>&nbsp; ${esc(q.pergunta)}</div><button class="editQ listEditBtn" data-i="${i}" type="button">Editar</button></div>`).join('');$$('.editQ').forEach(b=>b.onclick=()=>{editingIndex={mode:m,index:+b.dataset.i};addEditDraftMode=m;show('addedit')})}
function renderPredef(){let c=$('#predefControls');c.innerHTML='';makeSelect(c,'preSel',['Predefinições',...Object.keys(PRE)],'Predefinições',341.5-125,705*.8-60,250,60);makeSelect(c,'preMode',['Todas',...MODES],'Todas',683-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions);makeSelect(c,'preArea',['Todas'],'Todas',956.2-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions);makeSelect(c,'preDiff',['Todas','Fácil','Médio','Difícil'],'Todas',1229.4-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions);let save=document.createElement('button');save.id='predefSaveBtn';save.className='stdBtn predefSaveBtn';save.style.cssText=`position:absolute;left:${683-125}px;bottom:${705*.02}px;width:250px;height:60px;background-image:url('${A['botao generico telainicial.png']}')`;save.textContent='Salvar Predefinição';save.onclick=e=>{savePredef();e.currentTarget.blur&&e.currentTarget.blur()};save.onmouseup=()=>save.blur&&save.blur();save.onmouseleave=()=>save.blur&&save.blur();c.appendChild(save);imgBtn(c,'preBack','setavoltar.png',10,10,60,60,()=>show('home'),'setavoltar_hover.png');renderPredefQuestions()}
function renderPredefQuestions(){let m=getSel('preMode')||'Todas';let modes=m==='Todas'?MODES:[m];let areas=m==='Todas'?[...new Set(MODES.flatMap(mm=>Object.keys(modeDB(mm).areas||{})))]:Object.keys(modeDB(m).areas||{});let areaEl=$('#preArea');if(areaEl){let old=getSel('preArea');areaEl.remove();makeSelect($('#predefControls'),'preArea',['Todas',...areas],areas.includes(old)?old:'Todas',956.2-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions)}let area=getSel('preArea')||'Todas',diff=getSel('preDiff')||'Todas';let qs=[];modes.forEach(mm=>(modeDB(mm).perguntas||[]).forEach((q,i)=>{if((area==='Todas'||q.area===area)&&(diff==='Todas'||q.dificuldade===diff))qs.push({...q,_mode:mm,_i:i})}));let specialAreas=[...new Set(modes.flatMap(mm=>Object.keys(modeDB(mm).areas||{}).filter(a=>SPECIAL.has(a))))].filter(a=>area==='Todas'||a===area);let specialHtml=specialAreas.length?`<div class="predefSpecialBlock"><div class="predefSpecialTitle">Áreas especiais da roleta</div>${specialAreas.map(a=>`<label class="predefItem predefSpecialItem"><input type="checkbox" checked data-special-area="${esc(a)}"><span>${esc(a)}</span></label>`).join('')}</div>`:'';let questionHtml=qs.length?qs.map((q,idx)=>`<label class="predefItem"><input type="checkbox" checked data-idx="${idx}"><span>${esc(q.pergunta)}</span></label>`).join(''):`<div class="predefEmpty">${SPECIAL.has(area)?'Esta é uma área especial de pontuação e não possui pergunta própria.':'Nenhuma pergunta encontrada para este filtro.'}</div>`;$('#predefQuestions').innerHTML=specialHtml+questionHtml;$('#predefQuestions')._qs=qs}
function savePredef(){let name=prompt('Nome da predefinição:');if(!name)return;let qs=$('#predefQuestions')._qs||[],sel=$$('#predefQuestions input[data-idx]:checked').map(i=>qs[+i.dataset.idx]).filter(Boolean),specials=$$('#predefQuestions input[data-special-area]:checked').map(i=>i.dataset.specialArea).filter(Boolean),normalAreas=sel.map(q=>q.area).filter(Boolean),areasSelected=[...new Set([...normalAreas,...specials])];PRE[name]={modo:getSel('preMode')==='Todas'?'Coffee Lovers':getSel('preMode'),perguntas:sel,areas_selected:areasSelected};save(PRE_KEY,PRE);msg('Sucesso','Predefinição salva com as áreas selecionadas.',()=>show('home'))}
function renderHistory(){let h=load(HIST_KEY,[]).slice().reverse();$('#histList').innerHTML=h.length?h.map((s,i)=>`<button class="nativeBtn histItem" data-i="${i}" style="width:100%;margin-bottom:8px"> ${esc(s.started_at)} | Modo: ${esc(s.game_mode)} | Equipes: ${s.num_teams} | Tempo/questão: ${s.time_limit_secs}s | Duração: ${esc(formatHistoryDuration(s))}</button>`).join(''):`<div style="height:140px;padding-top:24px;text-align:center;font-size:20px">Nenhuma sessão registrada ainda.</div>`;$$('.histItem').forEach(b=>b.onclick=()=>openHist(h[+b.dataset.i]));$('#histBack').onclick=()=>show('home')}
function openHist(s){
  let lines=[
    ` ${s.started_at} | Modo: ${s.game_mode} | Equipes: ${s.num_teams} | Tempo/questão: ${s.time_limit_secs}s | Duração: ${formatHistoryDuration(s)}`,
    '--------------------------------------------------------------------------------',
    `Matérias: ${(s.subjects_selected||[]).join(', ')||'Todas disponíveis'}`,
    `Áreas: ${(s.areas_selected||[]).join(', ')||'—'}`,
    `Dificuldades: ${(s.difficulties_selected||[]).join(', ')||'—'}`,
    '',
    ...(s.rounds||[]).map((r,i)=>{
      const type=questionTypeLabel(r.question_type||'objetiva');
      const marked=r.answer_marked??'—';
      const expected=r.correct_answer??'—';
      return `${String(i+1).padStart(2,'0')}. [${r.materia||''} | ${r.area||''} | ${r.difficulty||''} | ${type} | Equipe ${r.equipe}]\n    Pergunta: ${r.question||''}\n    Resposta/Correção: ${marked} | Gabarito/Esperada: ${expected} | Resultado: ${r.is_correct?'Certo':'Errado'}\n    Tempo gasto: ${r.answer_time_secs||'—'} s`
    })
  ];
  popup(`<pre class="scroll" style="white-space:pre-wrap;height:370px;font-size:16px">${esc(lines.join('\n'))}</pre><div style="display:flex;gap:8px"><button id="exportTxt" class="nativeBtn" style="width:160px;text-align:center">Exportar TXT</button><button id="exportCsv" class="nativeBtn" style="width:160px;text-align:center">Exportar CSV</button><button id="closeH" class="nativeBtn" style="width:120px;text-align:center">Fechar</button></div>`,900,520);
  $('#closeH').onclick=closePopup;
  $('#exportTxt').onclick=()=>download('historico_roleta.txt',lines.join('\n'),'text/plain');
  $('#exportCsv').onclick=()=>{
    const header=['Equipe','Matéria','Área','Dificuldade','Tipo','Pergunta','Resposta/Correção','Gabarito/Esperada','Resultado'];
    const rows=(s.rounds||[]).map(r=>[r.equipe,r.materia||'',r.area,r.difficulty,questionTypeLabel(r.question_type||'objetiva'),r.question,r.answer_marked??'',r.correct_answer??'',r.is_correct?'Certo':'Errado']);
    download('historico_roleta.csv',[header,...rows].map(row=>row.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(';')).join('\n'),'text/csv')
  }
}
function download(name,txt,type){let b=new Blob([txt],{type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function renderCredits(){
  let box=$('#creditsBox');
  const names=['Lucas','Angel','Fabio','Viviane'];
  box.innerHTML=names.map((n,i)=>`<button class="creditBtn" id="creditBtn_${i}" data-i="${i}" style="position:absolute;left:${i*217}px;top:0;width:197px;height:400px"><img src="${A[n+'.png']||A[n+'B.png']||''}" data-n="${n}" style="width:100%;height:100%;object-fit:contain;border:0;outline:0;box-shadow:none"></button>`).join('');
  $$('.creditBtn').forEach(b=>{
    let img=$('img',b),n=img.dataset.n;
    img.src=A[n+'.png']||A[n+'B.png']||img.src;
    b.onmouseenter=()=>img.src=A[n+'B.png']||A[n+'.png']||img.src;
    b.onmouseleave=()=>img.src=A[n+'.png']||A[n+'B.png']||img.src;
    b.onclick=()=>openCredit(+b.dataset.i);
  });
  $('#creditsBack').onclick=()=>show('intro');
}
function openCredit(i){let c=CREDITS[i];popup(`<div style="display:flex;flex-direction:column;height:100%;padding:18px 26px;gap:12px"><div class="creditPopupHeader">FICHA DE PERSONAGEM</div><div class="creditLine">______________________________________________</div><div style="flex:1;display:flex;gap:10px;min-height:0"><div style="width:32%;display:flex;align-items:flex-start;justify-content:flex-end;padding-top:18px"><img src="${A[c.imagem_popup]||''}" style="max-width:100%;max-height:100%;object-fit:contain"></div><div class="scroll" style="width:68%;padding-top:18px;font-size:22px;line-height:1.25"><p><span style="color:#8F6FA0;font-weight:bold">Nome:</span> ${esc(c.nome)}</p><p><span style="color:#8F6FA0;font-weight:bold">Função:</span> ${esc(c.funcao)}</p><p><span style="color:#8F6FA0;font-weight:bold">Descrição:</span> ${esc(c.descricao)}</p></div></div><div style="height:52px;text-align:right"><button id="closeCredit" style="height:52px;width:160px;background:#8c59bf;color:#fff;border:0;font-size:18px">Fechar</button></div></div>`,1175,620,'PopupC.png');$('#closeCredit').onclick=closePopup}


function initLayoutEditorV3(){
  const STORE='qc1_layout_overrides_editmode_v34_user_layout_v32';
  const OLD_STORE='__none__';
  const DEFAULT_APPLIED_LAYOUT={"intro:btn_config":{"left":1047.2,"top":27.4,"width":74.6,"height":73.6},"intro:btn_instrucoes":{"left":306.8,"top":606.6,"width":235.8,"height":56.9},"intro:btn_comecar":{"left":565.6,"top":524.9,"width":220,"height":60},"intro:btn_creditos":{"left":835.3,"top":603.2,"width":201.4,"height":57.9},"home:spinner_game_mode":{"left":873.9,"top":210,"width":180,"height":80},"home:spinner_equipes":{"left":874.9,"top":3.9,"width":180,"height":80},"home:spinner_tempo":{"left":873.9,"top":107.9,"width":180,"height":80},"home:spinner_predefinicao":{"left":34.6,"top":553.5,"width":250,"height":60},"home:btn_iniciar":{"left":765.8,"top":340.6,"width":216.2,"height":68.9},"home:btn_volume":{"left":1200,"top":15,"width":90,"height":90},"home:btn_adicionar":{"left":338.9,"top":336.8,"width":237.5,"height":68},"home:btn_listar":{"left":763.9,"top":427.3,"width":215.3,"height":68},"home:btn_voltar":{"left":22.8,"top":48.6,"width":122.1,"height":86.8},"home:btn_predefinicoes":{"left":334,"top":427.3,"width":238.4,"height":66.1},"home:btn_historico":{"left":1071.2,"top":548.6,"width":189.3,"height":57.4},"game:spinBtn":{"left":0,"top":-30,"width":133.6,"height":126.8},"game:gameBack":{"left":64.6,"top":27,"width":100.9,"height":94.5},"game:spinBtn2":{"left":0,"top":-30,"width":110.6,"height":102.9},"addedit:editMode":{"left":0.9,"top":-0.9,"width":500,"height":40},"addedit:editArea":{"left":0,"top":0,"width":500,"height":40},"addedit:addArea":{"left":1164.1,"top":114.8,"width":180,"height":48},"addedit:editDiff":{"left":0,"top":0,"width":500,"height":40},"addedit:item_4":{"left":0,"top":0,"width":180,"height":48},"addedit:saveQ":{"left":428.2,"top":680,"width":457,"height":48},"addedit:cancelQ":{"left":893.1,"top":680.8,"width":457,"height":48},"list:listMode":{"left":794,"top":54,"width":180,"height":80},"list:btn_voltar_listar":{"left":40,"top":54,"width":126,"height":85.8},"list:listDiff":{"left":762,"top":215,"width":180,"height":80},"list:listArea":{"left":366,"top":218,"width":180,"height":80},"list:item_4":{"left":0,"top":0,"width":120,"height":40},"list:item_5":{"left":0,"top":0,"width":120,"height":40},"list:item_6":{"left":0,"top":0,"width":120,"height":40},"list:item_7":{"left":0,"top":0,"width":120,"height":40},"list:item_8":{"left":0,"top":0,"width":120,"height":40},"list:item_9":{"left":0,"top":0,"width":120,"height":40},"list:item_10":{"left":0,"top":0,"width":120,"height":40},"list:item_11":{"left":0,"top":0,"width":120,"height":40},"list:item_12":{"left":0,"top":0,"width":120,"height":40},"list:item_13":{"left":0,"top":0,"width":120,"height":40},"list:item_14":{"left":0,"top":0,"width":120,"height":40},"list:item_15":{"left":0,"top":0,"width":120,"height":40},"list:item_16":{"left":0,"top":0,"width":120,"height":40},"list:item_17":{"left":0,"top":0,"width":120,"height":40},"list:item_18":{"left":0,"top":0,"width":120,"height":40},"list:item_19":{"left":0,"top":0,"width":120,"height":40},"list:item_20":{"left":0,"top":0,"width":120,"height":40},"list:item_21":{"left":0,"top":0,"width":120,"height":40},"list:item_22":{"left":0,"top":0,"width":120,"height":40},"list:item_23":{"left":0,"top":0,"width":120,"height":40},"list:item_24":{"left":0,"top":0,"width":120,"height":40},"list:item_25":{"left":0,"top":0,"width":120,"height":40},"list:item_26":{"left":0,"top":0,"width":120,"height":40},"list:item_27":{"left":0,"top":0,"width":120,"height":40},"list:item_28":{"left":0,"top":0,"width":120,"height":40},"list:item_29":{"left":0,"top":0,"width":120,"height":40},"list:item_30":{"left":0,"top":0,"width":120,"height":40},"list:item_31":{"left":0,"top":0,"width":120,"height":40},"list:item_32":{"left":0,"top":0,"width":120,"height":40},"list:item_33":{"left":0,"top":0,"width":120,"height":40},"list:item_34":{"left":0,"top":0,"width":120,"height":40},"list:item_35":{"left":0,"top":0,"width":120,"height":40},"list:item_36":{"left":0,"top":0,"width":120,"height":40},"list:item_37":{"left":0,"top":0,"width":120,"height":40},"list:item_38":{"left":0,"top":0,"width":120,"height":40},"list:item_39":{"left":0,"top":0,"width":120,"height":40},"list:item_40":{"left":0,"top":0,"width":120,"height":40},"list:item_41":{"left":0,"top":0,"width":120,"height":40},"list:item_42":{"left":0,"top":0,"width":120,"height":40},"list:item_43":{"left":0,"top":0,"width":120,"height":40},"list:item_44":{"left":0,"top":0,"width":120,"height":40},"list:item_45":{"left":0,"top":0,"width":120,"height":40},"list:item_46":{"left":0,"top":0,"width":120,"height":40},"list:item_47":{"left":0,"top":0,"width":120,"height":40},"list:item_48":{"left":0,"top":0,"width":120,"height":40},"list:item_49":{"left":0,"top":0,"width":120,"height":40},"list:item_50":{"left":0,"top":0,"width":120,"height":40},"list:item_51":{"left":0,"top":0,"width":120,"height":40},"list:item_52":{"left":0,"top":0,"width":120,"height":40},"list:item_53":{"left":0,"top":0,"width":120,"height":40},"list:item_54":{"left":0,"top":0,"width":120,"height":40},"list:item_55":{"left":0,"top":0,"width":120,"height":40},"list:item_56":{"left":0,"top":0,"width":120,"height":40},"list:item_57":{"left":0,"top":0,"width":120,"height":40},"list:item_58":{"left":0,"top":0,"width":120,"height":40},"list:item_59":{"left":0,"top":0,"width":120,"height":40},"list:item_60":{"left":0,"top":0,"width":120,"height":40},"list:item_61":{"left":0,"top":0,"width":120,"height":40},"list:item_62":{"left":0,"top":0,"width":120,"height":40},"list:item_63":{"left":0,"top":0,"width":120,"height":40},"predef:preSel":{"left":216.5,"top":141,"width":250,"height":60},"predef:preMode":{"left":583,"top":141,"width":200,"height":60},"predef:preDiff":{"left":1129.4,"top":141,"width":200,"height":60},"predef:preBack":{"left":39.9,"top":40.9,"width":87,"height":83.1},"predef:preArea":{"left":856.2,"top":141,"width":200,"height":60},"history:histBack":{"left":0,"top":0,"width":120,"height":48},"history:item_1":{"left":0,"top":0,"width":100,"height":40},"credits:creditBtn_0":{"left":0,"top":0,"width":197,"height":400},"credits:creditBtn_1":{"left":217,"top":0,"width":197,"height":400},"credits:creditBtn_2":{"left":434,"top":0,"width":197,"height":400},"credits:creditBtn_3":{"left":653,"top":0,"width":197,"height":400},"credits:creditsBack":{"left":27,"top":35,"width":60,"height":60},"popup:intro:openModePopup:introMode":{"left":28,"top":8,"width":594,"height":50},"popup:intro:openModePopup:introEq":{"left":28,"top":83,"width":594,"height":50},"popup:intro:openModePopup:introTime":{"left":28,"top":158,"width":594,"height":50},"popup:intro:openModePopup:introConfirm":{"left":88,"top":254,"width":200,"height":60},"popup:intro:openModePopup:introCancel":{"left":316,"top":254,"width":200,"height":60},"popup:home:startFilterPopup:filterStart":{"left":80,"top":455,"width":190,"height":44},"popup:home:startFilterPopup:filterCancel":{"left":280,"top":455,"width":200,"height":44},"popup:home:volume:playM":{"left":20,"top":178,"width":360,"height":48},"popup:home:volume:ok":{"left":20,"top":240,"width":360,"height":48},"addedit:addBack":{"left":47,"top":48.9,"width":122,"height":86},"history:item_2":{"left":0,"top":0,"width":100,"height":40},"history:item_3":{"left":0,"top":0,"width":100,"height":40},"popup:intro:introMode":{"left":-2.9,"top":65.9,"width":594,"height":50},"popup:intro:introConfirm":{"left":-302.8,"top":57.9,"width":200,"height":48},"popup:intro:introCancel":{"left":166.8,"top":60.8,"width":200,"height":48},"popup:intro:introTime":{"left":0,"top":229.4,"width":594,"height":50},"popup:intro:introEq":{"left":-3.8,"top":146.7,"width":594,"height":50},"popup:home:filterStart":{"left":345.7,"top":436.5,"width":190,"height":44},"popup:home:filterCancel":{"left":577.3,"top":436.5,"width":200,"height":44},"game:wheelWrap":{"left":443.7,"top":143.2,"width":482.4,"height":475.6},"history:item_4":{"left":0,"top":0,"width":100,"height":40},"popup:home:filterTitle":{"left":-10.6,"top":48.6,"width":1093,"height":34},"popup:home:filterAreaLabel":{"left":239.4,"top":78.2,"width":260,"height":30},"popup:home:areaChecks":{"left":67.8,"top":112.1,"width":503.9,"height":279.4},"popup:home:filterDiffLabel":{"left":703.5,"top":81.1,"width":260,"height":30},"popup:home:diffChecks":{"left":582,"top":113.1,"width":420,"height":318},"history:item_5":{"left":0,"top":0,"width":100,"height":40},"history:item_6":{"left":0,"top":0,"width":100,"height":40},"history:item_7":{"left":0,"top":0,"width":100,"height":40},"predef:predefSaveBtn":{"left":558,"top":630.9,"width":250,"height":60}};
  let editMode=false, selected=null, drag=null, scheduled=false, drawing=false;
  let layout={...DEFAULT_APPLIED_LAYOUT,...(load(STORE,null)||{})};
  const stage=$('#stage');

  let toolbar=$('#editToolbar');
  if(toolbar) toolbar.remove();
  toolbar=document.createElement('div');
  toolbar.id='editToolbar';
  toolbar.className='editToolbar';
  toolbar.innerHTML=`<button id="editToggle">EDIT</button><button id="editExportAll">Exportar tudo</button><button id="editImportBtn">Importar</button><button id="editResetScreen">Reset tela</button><span class="editName" id="editName">nada selecionado</span><label class="editHint" for="editX">x</label><input id="editX" aria-label="Posição X" type="number" step="1"><label class="editHint" for="editY">y</label><input id="editY" aria-label="Posição Y" type="number" step="1"><label class="editHint" for="editW">w</label><input id="editW" aria-label="Largura" type="number" step="1"><label class="editHint" for="editH">h</label><input id="editH" aria-label="Altura" type="number" step="1"><button id="editUp">↑</button><button id="editDown">↓</button><button id="editLeft">←</button><button id="editRight">→</button><input id="editImport" aria-label="Importar layout JSON" type="file" accept="application/json" style="display:none">`;
  stage.appendChild(toolbar);
  toolbar.style.display='none';
  let editorUnlocked=false;
  let editorSequence='';
  const editorPassword='editormode';
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.altKey||e.metaKey)return;
    const tag=(document.activeElement&&document.activeElement.tagName||'').toLowerCase();
    if(['input','textarea','select'].includes(tag))return;
    const k=(e.key||'').toLowerCase();
    if(k.length!==1)return;
    editorSequence=(editorSequence+k).slice(-editorPassword.length);
    if(editorSequence===editorPassword){
      editorUnlocked=!editorUnlocked;
      stage.classList.toggle('editorUnlocked',editorUnlocked);
      toolbar.style.display=editorUnlocked?'flex':'none';
      if(!editorUnlocked&&editMode)setMode(false);
      toast(editorUnlocked?'Editor liberado.':'Editor escondido.');
      editorSequence='';
    }
  });


  let layer=$('#editLayer');
  if(layer) layer.remove();
  layer=document.createElement('div');
  layer.id='editLayer';
  layer.className='editLayer';
  stage.appendChild(layer);

  const editableSel='button.kbtn,.kselect,button.stdBtn,button.nativeBtn,button.creditBtn,#wheelWrap,.editableLayout';
  const popupDefaults={
    'popup:intro:openModePopup':{
      introMode:{left:28,top:8,width:594,height:50,type:'select'},
      introEq:{left:28,top:83,width:594,height:50,type:'select'},
      introTime:{left:28,top:158,width:594,height:50,type:'select'},
      introConfirm:{left:88,top:254,width:200,height:60,type:'button'},
      introCancel:{left:316,top:254,width:200,height:60,type:'button'}
    },
    'popup:home:startFilterPopup':{
      filterStart:{left:80,top:455,width:190,height:44,type:'button'},
      filterCancel:{left:280,top:455,width:200,height:44,type:'button'}
    },
    'popup:home:volume':{
      playM:{left:20,top:178,width:360,height:48,type:'button'},
      ok:{left:20,top:240,width:360,height:48,type:'button'}
    }
  };

  function scale(){return stage.getBoundingClientRect().width/1366||1}
  function round(v){return Math.round((parseFloat(v)||0)*10)/10}
  function blank(v){return v===undefined||v===null||v===''||Number.isNaN(v)}
  function screenOf(el){
    if(el.closest('#popupHost')) return 'popup:'+current;
    const sec=el.closest('.screen');
    return sec?sec.id:current;
  }
  function key(el){
    if(!el||el.closest('#editToolbar')||el.closest('#editLayer'))return null;
    const s=screenOf(el);
    if(el.id) return s+':'+el.id;
    if(el.classList.contains('creditBtn')) return s+':creditBtn_'+(el.dataset.i||Array.from(el.parentElement.children).indexOf(el));
    return null;
  }
  function altKey(el){return el&&el.id?current+':'+el.id:null}
  function isVisibleTarget(el){
    if(!el||el.closest('#editToolbar')||el.closest('#editLayer'))return false;
    if(el.closest('#addEditContent .addEditForm'))return false;
    const cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden')return false;
    const r=el.getBoundingClientRect();
    return r.width>2&&r.height>2;
  }
  function targetsVisible(){
    return $$(editableSel,stage).filter(el=>key(el)&&isVisibleTarget(el));
  }
  function parentBox(el){
    return el.offsetParent||el.parentElement||stage;
  }
  function localRect(el){
    const s=scale(),op=parentBox(el),r=el.getBoundingClientRect(),pr=op.getBoundingClientRect();
    return {left:(r.left-pr.left)/s,top:(r.top-pr.top)/s,width:r.width/s,height:r.height/s};
  }
  function stageRect(el){
    const s=scale(),r=el.getBoundingClientRect(),sr=stage.getBoundingClientRect();
    return {left:(r.left-sr.left)/s,top:(r.top-sr.top)/s,width:r.width/s,height:r.height/s};
  }
  function inlineRect(el){
    let w=parseFloat(el.style.width)||el.offsetWidth||100;
    let h=parseFloat(el.style.height)||el.offsetHeight||40;
    let l=parseFloat(el.style.left);
    let t=parseFloat(el.style.top);
    let r=parseFloat(el.style.right);
    let b=parseFloat(el.style.bottom);
    const p=parentBox(el);
    const ph=parseFloat(p.style.height)||p.clientHeight||705;
    const pw=parseFloat(p.style.width)||p.clientWidth||1366;
    if(blank(l)&&!blank(r))l=pw-r-w;
    if(blank(t)&&!blank(b))t=ph-b-h;
    if(blank(l))l=0;
    if(blank(t))t=0;
    return {left:round(l),top:round(t),width:round(w),height:round(h)};
  }
  function normalize(el){
    if(!el||el.closest('#editToolbar')||el.closest('#editLayer'))return;
    const r=localRect(el);
    el.style.position='absolute';
    const imp=(el.id==='wheelWrap'||el.classList.contains('filterBtn')||el.classList.contains('editableLayout'))?'important':'';
    el.style.setProperty('left',round(r.left)+'px',imp);
    el.style.setProperty('top',round(r.top)+'px',imp);
    el.style.setProperty('right','auto',imp);
    el.style.setProperty('bottom','auto',imp);
    el.style.setProperty('width',round(r.width)+'px',imp);
    el.style.setProperty('height',round(r.height)+'px',imp);
    if(el.classList.contains('stdBtn'))el.style.lineHeight=round(r.height)+'px';
    if(el.id==='wheelWrap')updateWheelLinkedControls();
  }
  function applyOne(el){
    const k=key(el),ak=altKey(el);
    let o=(k&&layout[k])||(ak&&layout[ak]);
    if(!o)return;
    el.style.position='absolute';
    const imp=(el.id==='wheelWrap'||el.classList.contains('filterBtn')||el.classList.contains('editableLayout'))?'important':'';
    el.style.setProperty('left',o.left+'px',imp);
    el.style.setProperty('top',o.top+'px',imp);
    el.style.setProperty('right','auto',imp);
    el.style.setProperty('bottom','auto',imp);
    el.style.setProperty('width',o.width+'px',imp);
    el.style.setProperty('height',o.height+'px',imp);
    if(el.classList.contains('stdBtn'))el.style.lineHeight=o.height+'px';
    if(el.id==='wheelWrap')updateWheelLinkedControls();
  }
  function saveOne(el){
    const k=key(el); if(!k)return;
    const r=inlineRect(el);
    layout[k]={left:r.left,top:r.top,width:r.width,height:r.height};
    if(el.id==='wheelWrap')updateWheelLinkedControls();
    save(STORE,layout);
    updatePanel(el);
  }
  function updatePanel(el){
    if(!el){
      $('#editName').textContent='nada selecionado';
      ['editX','editY','editW','editH'].forEach(id=>$('#'+id).value='');
      return;
    }
    const r=inlineRect(el);
    $('#editName').textContent=key(el)||'sem chave';
    $('#editX').value=r.left; $('#editY').value=r.top; $('#editW').value=r.width; $('#editH').value=r.height;
  }
  function setTargetRect(el,r){
    el.style.position='absolute';
    const imp=(el.id==='wheelWrap'||el.classList.contains('filterBtn')||el.classList.contains('editableLayout'))?'important':'';
    el.style.setProperty('left',round(r.left)+'px',imp);
    el.style.setProperty('top',round(r.top)+'px',imp);
    el.style.setProperty('right','auto',imp);
    el.style.setProperty('bottom','auto',imp);
    el.style.setProperty('width',Math.max(8,round(r.width))+'px',imp);
    el.style.setProperty('height',Math.max(8,round(r.height))+'px',imp);
    if(el.classList.contains('stdBtn'))el.style.lineHeight=el.style.height;
    if(el.id==='wheelWrap')updateWheelLinkedControls();
  }
  function boxByKey(k){return $(`.editBox[data-key="${CSS.escape(k)}"]`,layer)}
  function updateWheelLinkedControls(){
    const ww=$('#wheelWrap');
    if(!ww)return;
    const r=inlineRect(ww);
    // Keep the real spin button centered inside the wheel while the wheel is moved/resized.
    const spin=$('#spinBtn');
    if(spin){
      const sw=parseFloat(spin.style.width)||100, sh=parseFloat(spin.style.height)||100;
      spin.style.left=round((r.width-sw)/2)+'px';
      spin.style.top=round((r.height-sh)/2)+'px';
      if(layout['game:spinBtn']){
        layout['game:spinBtn'].left=round((r.width-sw)/2);
        layout['game:spinBtn'].top=round((r.height-sh)/2);
      }
    }
    // Keep the intro-overlay spin button aligned to the same visual center on the stage.
    const spin2=$('#spinBtn2');
    if(spin2){
      const sw2=parseFloat(spin2.style.width)||100, sh2=parseFloat(spin2.style.height)||100;
      spin2.style.left=round(r.left+(r.width-sw2)/2)+'px';
      spin2.style.top=round(r.top+(r.height-sh2)/2)+'px';
      if(layout['game:spinBtn2']){
        layout['game:spinBtn2'].left=round(r.left+(r.width-sw2)/2);
        layout['game:spinBtn2'].top=round(r.top+(r.height-sh2)/2);
      }
    }
  }
  function applyVisibleLayout(){
    targetsVisible().forEach(el=>applyOne(el));
    updateWheelLinkedControls();
  }
  function drawBoxes(){
    if(drawing||drag)return;
    drawing=true;
    applyVisibleLayout();
    layer.classList.toggle('on',editMode);
    layer.innerHTML='';
    if(editMode){
      targetsVisible().forEach(el=>{
        const r=stageRect(el),k=key(el);
        const box=document.createElement('div');
        box.className='editBox'+(selected&&key(selected)===k?' selected':'');
        box.dataset.key=k;
        box.style.left=round(r.left)+'px';
        box.style.top=round(r.top)+'px';
        box.style.width=Math.max(8,round(r.width))+'px';
        box.style.height=Math.max(8,round(r.height))+'px';
        box.innerHTML=`<div class="editBoxLabel">${k}${k==='game:wheelWrap'?' · RODA':''}</div><div class="editResizeHandle" title="Arraste para redimensionar"></div>`;
        box._target=el;
        layer.appendChild(box);
      });
    }
    drawing=false;
  }
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;drawBoxes()});
  }
  function select(el){
    selected=el;
    updatePanel(el);
    drawBoxes();
  }
  function applyPanel(){
    if(!selected)return;
    normalize(selected);
    setTargetRect(selected,{
      left:parseFloat($('#editX').value)||0,
      top:parseFloat($('#editY').value)||0,
      width:parseFloat($('#editW').value)||8,
      height:parseFloat($('#editH').value)||8
    });
    saveOne(selected);
    drawBoxes();
  }
  function nudge(dx,dy){
    if(!selected)return;
    normalize(selected);
    const r=inlineRect(selected);
    setTargetRect(selected,{...r,left:r.left+dx,top:r.top+dy});
    saveOne(selected);
    drawBoxes();
  }
  ['editX','editY','editW','editH'].forEach(id=>$('#'+id).addEventListener('change',applyPanel));
  $('#editUp').onclick=()=>nudge(0,-1);
  $('#editDown').onclick=()=>nudge(0,1);
  $('#editLeft').onclick=()=>nudge(-1,0);
  $('#editRight').onclick=()=>nudge(1,0);

  function setMode(on){
    editMode=on;
    stage.classList.toggle('editOn',on);
    layer.classList.toggle('on',on);
    $('#editToggle').classList.toggle('active',on);
    $('#editToggle').textContent=on?'EDIT ON':'EDIT';
    if(!on){selected=null;drag=null;updatePanel(null)}
    drawBoxes();
    toast(on?'Modo edit ligado: arraste a caixa azul; puxe a alça amarela para redimensionar.':'Modo edit desligado.');
  }
  $('#editToggle').onclick=()=>{if(!stage.classList.contains('editorUnlocked'))return;setMode(!editMode)};

  function startDrag(e){
    if(!editMode)return;
    const box=e.target.closest('.editBox');
    if(!box)return;
    const el=box._target||targetsVisible().find(t=>key(t)===box.dataset.key);
    if(!el)return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    normalize(el);
    selected=el;
    updatePanel(el);
    $$('.editBox',layer).forEach(b=>b.classList.toggle('selected',b===box));
    const tr=inlineRect(el);
    const br={left:parseFloat(box.style.left)||0,top:parseFloat(box.style.top)||0,width:parseFloat(box.style.width)||0,height:parseFloat(box.style.height)||0};
    drag={
      el,box,
      resize:!!e.target.closest('.editResizeHandle'),
      sx:e.clientX,sy:e.clientY,
      left:tr.left,top:tr.top,width:tr.width,height:tr.height,
      boxLeft:br.left,boxTop:br.top,boxWidth:br.width,boxHeight:br.height,
      pointerId:e.pointerId
    };
    try{box.setPointerCapture(e.pointerId)}catch(err){}
  }
  function moveDrag(e){
    if(!drag)return;
    e.preventDefault(); e.stopPropagation();
    const dx=(e.clientX-drag.sx)/scale(),dy=(e.clientY-drag.sy)/scale();
    if(drag.resize){
      const nw=Math.max(12,drag.width+dx),nh=Math.max(12,drag.height+dy);
      setTargetRect(drag.el,{left:drag.left,top:drag.top,width:nw,height:nh});
      drag.box.style.width=round(Math.max(12,drag.boxWidth+dx))+'px';
      drag.box.style.height=round(Math.max(12,drag.boxHeight+dy))+'px';
    }else{
      setTargetRect(drag.el,{left:drag.left+dx,top:drag.top+dy,width:drag.width,height:drag.height});
      drag.box.style.left=round(drag.boxLeft+dx)+'px';
      drag.box.style.top=round(drag.boxTop+dy)+'px';
    }
    updatePanel(drag.el);
  }
  function endDrag(e){
    if(!drag)return;
    e&&e.preventDefault&&e.preventDefault();
    saveOne(drag.el);
    drag=null;
    drawBoxes();
  }
  layer.addEventListener('pointerdown',startDrag,true);
  document.addEventListener('pointermove',moveDrag,true);
  document.addEventListener('pointerup',endDrag,true);
  document.addEventListener('pointercancel',endDrag,true);

  document.addEventListener('keydown',e=>{
    if(!editMode||!selected||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
    let step=e.shiftKey?10:1;
    if(e.key==='ArrowUp'){e.preventDefault();nudge(0,-step)}
    if(e.key==='ArrowDown'){e.preventDefault();nudge(0,step)}
    if(e.key==='ArrowLeft'){e.preventDefault();nudge(-step,0)}
    if(e.key==='ArrowRight'){e.preventDefault();nudge(step,0)}
  });

  function collectScreenTargets(screenId){
    const sec=$('#'+screenId); if(!sec)return {};
    const out={};
    $$(editableSel,sec).forEach((el,i)=>{
      const id=el.id||(el.classList.contains('creditBtn')?'creditBtn_'+(el.dataset.i||i):'item_'+i);
      const k=screenId+':'+id;
      const r=layout[k]||inlineRect(el);
      out[id]={left:r.left,top:r.top,width:r.width,height:r.height,type:el.id==='wheelWrap'?'wheel':(el.classList.contains('editableLayout')?'layout':(el.classList.contains('kselect')?'select':'button')),key:k};
    });
    return out;
  }
  function ensureAllRendered(){
    try{renderIntro()}catch(e){}
    try{renderHome()}catch(e){}
    try{renderList()}catch(e){}
    try{renderAddEdit()}catch(e){}
    try{renderPredef()}catch(e){}
    try{renderHistory()}catch(e){}
    try{renderCredits()}catch(e){}
  }
  function exportAll(){
    const keep=current;
    ensureAllRendered();
    const screens={};
    ['intro','home','game','addedit','list','predef','history','credits'].forEach(id=>screens[id]=collectScreenTargets(id));
    const flat={};
    Object.entries(screens).forEach(([sid,items])=>Object.entries(items).forEach(([id,r])=>{
      flat[r.key]={left:r.left,top:r.top,width:r.width,height:r.height,type:r.type,screen:sid,id};
    }));
    Object.entries(popupDefaults).forEach(([p,items])=>Object.entries(items).forEach(([id,r])=>{
      flat[p+':'+id]={...r,screen:p,id};
    }));
    Object.entries(layout).forEach(([k,r])=>{flat[k]={...(flat[k]||{}),...r,saved_override:true}});
    const obj={version:32,base:'quimica_roleta_1a1',exported_at:new Date().toISOString(),screens,popups:popupDefaults,flat_layout:flat,applied_default_layout:DEFAULT_APPLIED_LAYOUT,layout};
    download('layout_roleta_quimica_todos_botoes_v32.json',JSON.stringify(obj,null,2),'application/json');
    toast('Exportei todos os botões/selects de todas as telas.');
    show(keep); schedule();
  }
  $('#editExportAll').onclick=exportAll;
  $('#editResetScreen').onclick=()=>{
    const prefix=current+':';
    Object.keys(layout).filter(k=>k.startsWith(prefix)||k.startsWith('popup:'+current+':')).forEach(k=>delete layout[k]);
    Object.entries(DEFAULT_APPLIED_LAYOUT).forEach(([k,v])=>{if(k.startsWith(prefix)||k.startsWith('popup:'+current+':'))layout[k]={...v};});
    save(STORE,layout);
    selected=null;updatePanel(null);drawBoxes();
    toast('Tela atual voltou para o layout aplicado.');
  };
  $('#editImportBtn').onclick=()=>$('#editImport').click();
  $('#editImport').onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const rd=new FileReader();
    rd.onload=()=>{
      try{
        const obj=JSON.parse(rd.result);
        let incoming=obj.layout||obj.flat_layout||obj.flat||obj;
        if(obj.screens){
          incoming={...incoming};
          Object.entries(obj.screens).forEach(([sid,items])=>Object.entries(items).forEach(([id,r])=>{
            incoming[r.key||sid+':'+id]={left:r.left,top:r.top,width:r.width,height:r.height};
          }));
        }
        Object.entries(incoming).forEach(([k,v])=>{
          if(v&&v.left!==undefined)layout[k]={left:v.left,top:v.top,width:v.width,height:v.height};
        });
        save(STORE,layout);
        drawBoxes();
        toast('Layout importado.');
      }catch(err){toast('JSON inválido.')}
    };
    rd.readAsText(f,'utf-8');e.target.value='';
  };

  const oldShow=show;
  show=function(id){oldShow(id);schedule()};
  const oldPopup=popup;
  popup=function(html,w=820,h=520,bg='popup genérico HD.png',closeOnOutside=false){const ret=oldPopup(html,w,h,bg,closeOnOutside);schedule();return ret};
  const oldClose=closePopup;
  closePopup=function(){oldClose();selected=null;updatePanel(null);schedule()};
  new MutationObserver(schedule).observe(stage,{childList:true,subtree:true});
  schedule();
}
initLayoutEditorV3();

$('#spinBtn').onclick=spin;$('#spinBtn2').onclick=spin;$('#gameBack').onclick=endGame;
// O efeito líquido antes era redesenhado a ~60 FPS mesmo com a roleta parada.
// Manter a textura estática reduz drasticamente CPU/GPU e consumo de bateria em tablets.
const gameBackBtn=$('#gameBack'),gameBackImg=$('#gameBack img');
if(gameBackBtn&&gameBackImg){
  gameBackBtn.onmouseenter=()=>{gameBackImg.src=A['setavoltar_hover.png']||A['setavoltar.png']||gameBackImg.src};
  gameBackBtn.onmouseleave=()=>{gameBackImg.src=A['setavoltar.png']||gameBackImg.src};
  gameBackBtn.onmousedown=()=>{gameBackImg.src=A['setavoltar_hover.png']||A['setavoltar.png']||gameBackImg.src};
  gameBackBtn.onmouseup=()=>{gameBackImg.src=A['setavoltar_hover.png']||A['setavoltar.png']||gameBackImg.src};
}
$('#creditsBack').onclick=()=>show('intro');
const creditsBackBtn=$('#creditsBack'),creditsBackImg=$('#creditsBack img');
if(creditsBackBtn&&creditsBackImg){
  creditsBackBtn.onmouseenter=()=>{creditsBackImg.src=A['setavoltar_hover.png']||A['setavoltar.png']||creditsBackImg.src};
  creditsBackBtn.onmouseleave=()=>{creditsBackImg.src=A['setavoltar.png']||creditsBackImg.src};
  creditsBackBtn.onmousedown=()=>{creditsBackImg.src=A['setavoltar_hover.png']||A['setavoltar.png']||creditsBackImg.src};
  creditsBackBtn.onmouseup=()=>{creditsBackImg.src=A['setavoltar_hover.png']||A['setavoltar.png']||creditsBackImg.src};
}

function installMobileButtonGlow(){
  const isTouch=matchMedia('(pointer: coarse)').matches||'ontouchstart'in window;
  if(!isTouch||window.__mobileGlowInstalled)return;
  window.__mobileGlowInstalled=true;

  const glowSelector='button,.kbtn,.stdBtn,.nativeBtn,.rotateCard button';

  function srcHover(img){
    if(!img||!img.src)return null;
    const cur=img.getAttribute('src')||'';
    // Quando o botão usa assets base64 no objeto A, usa o filename guardado em data-normal/data-hover.
    if(img.dataset&&img.dataset.hoverSrc)return img.dataset.hoverSrc;
    return null;
  }

  function findButtonTarget(e){
    return e.target&&e.target.closest?e.target.closest(glowSelector):null;
  }

  function activate(btn){
    if(!btn)return;
    btn.classList.add('touchGlow');

    const img=btn.querySelector&&btn.querySelector('img');
    if(img){
      if(!img.dataset.normalSrc)img.dataset.normalSrc=img.getAttribute('src')||img.src||'';
      const normalName=img.dataset.assetName||'';
      if(normalName&&A[normalName.replace('.png','_hover.png')]){
        img.dataset.hoverSrc=A[normalName.replace('.png','_hover.png')];
      }
      if(img.dataset.hoverSrc)img.src=img.dataset.hoverSrc;
    }

    // Casos específicos que já usam hover por JS
    if(btn.id==='creditsBack'){
      const im=btn.querySelector('img');
      if(im)im.src=A['setavoltar_hover.png']||A['setavoltar.png']||im.src;
    }
    if(btn.id==='gameBack'){
      const im=btn.querySelector('img');
      if(im)im.src=A['setavoltar_hover.png']||A['setavoltar.png']||im.src;
    }
  }

  function deactivate(btn){
    if(!btn)return;
    btn.classList.remove('touchGlow');

    const img=btn.querySelector&&btn.querySelector('img');
    if(img&&img.dataset.normalSrc){
      img.src=img.dataset.normalSrc;
    }

    if(btn.id==='creditsBack'){
      const im=btn.querySelector('img');
      if(im)im.src=A['setavoltar.png']||im.src;
    }
    if(btn.id==='gameBack'){
      const im=btn.querySelector('img');
      if(im)im.src=A['setavoltar.png']||im.src;
    }
  }

  let activeBtn=null;

  document.addEventListener('pointerdown',e=>{
    if(e.pointerType&&e.pointerType!=='touch'&&e.pointerType!=='pen')return;
    activeBtn=findButtonTarget(e);
    activate(activeBtn);
  },true);

  document.addEventListener('pointerup',e=>{
    deactivate(activeBtn);
    activeBtn=null;
  },true);

  document.addEventListener('pointercancel',e=>{
    deactivate(activeBtn);
    activeBtn=null;
  },true);

  document.addEventListener('touchstart',e=>{
    activeBtn=findButtonTarget(e);
    activate(activeBtn);
  },{capture:true,passive:true});

  document.addEventListener('touchend',e=>{
    deactivate(activeBtn);
    activeBtn=null;
  },{capture:true,passive:true});

  document.addEventListener('touchcancel',e=>{
    deactivate(activeBtn);
    activeBtn=null;
  },{capture:true,passive:true});
}
installMobileButtonGlow();

const mobileRotateOverlay=$('#mobileRotateOverlay');
if(mobileRotateOverlay&&mobileRotateOverlay.parentElement!==document.body)document.body.appendChild(mobileRotateOverlay);
const forcePortraitBtn=$('#forcePortraitBtn');
if(forcePortraitBtn){
  forcePortraitBtn.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    document.body.classList.add('forcePortrait');
    fit();
  };
}
const fullscreenMobileBtn=$('#fullscreenMobileBtn');
if(fullscreenMobileBtn){
  fullscreenMobileBtn.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    document.documentElement.requestFullscreen?.();
    setTimeout(fit,350);
  };
}
document.addEventListener('pointerdown',()=>{}, {once:true});bootIntro();
})();
