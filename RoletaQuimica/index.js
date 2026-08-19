(()=>{'use strict';
const P=window.ROULETTE_PAYLOAD,A=P.assets,DEFAULT_DBS=P.dbs,POS=P.positions,CREDITS=P.credits;
const DB_KEY='qc1_db_clean_questions_v2',PRE_KEY='qc1_predefs',HIST_KEY='qc1_history_clean_v1';
function isTestAreaName(n){let s=String(n||'').trim().toLowerCase();return s==='teste'||s==='test'||s==='área teste'||s==='area teste'||s.startsWith('teste ')}
function cleanRuntimeDB(db){
  Object.values(db||{}).forEach(d=>{
    if(!d)return;
    Object.keys(d.areas||{}).forEach(a=>{if(isTestAreaName(a))delete d.areas[a]});
    d.perguntas=(d.perguntas||[]).filter(q=>!isTestAreaName(q.area)&&!String(q.pergunta||'').trim().toLowerCase().startsWith('teste'));
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
let DB=cleanRuntimeDB(load(DB_KEY,DEFAULT_DBS)),PRE=cleanRuntimePredefs(load(PRE_KEY,P.predefs||{}));
save(DB_KEY,DB);save(PRE_KEY,PRE);const MODES=['1º ano','2º ano','3º ano','Coffee Lovers'],TIMES=['1:00','1:30','2:00','2:30','3:00','3:30','4:00','4:30','5:00'],SPECIAL=new Set(['+5 pontos 1','+5 pontos 2','-5 pontos 1','-5 pontos 2']);const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));let current='intro',game=null,wheel={segments:[],angle:0,speed:0,anim:false,raf:null},firstGame=true,timer=null,editingIndex=null;const bgm=new Audio(A['musicadefundo extendida (Remix).mp3']||''),okSound=new Audio(A['copoenchendo.mp3']||''),errSound=new Audio(A['copo quebrando.mp3']||'');bgm.loop=true;bgm.volume=.45;okSound.volume=.8;errSound.volume=.8;
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
function makeSelect(parent,id,values,text,x,y,w,h,bg='botao generico telainicial.png',hover='botao generico telainicial_hover.png',onchange){const div=document.createElement('div');div.className='kselect';div.id=id;div.style.left=x+'px';div.style.bottom=y+'px';div.style.width=w+'px';div.style.height=h+'px';div.dataset.value=text;div.innerHTML=`<div class="selHead" style="background-image:url('${A[bg]||''}')">${esc(text)}</div><div class="selOpts">${values.map(v=>`<div class="selOpt" style="background-image:url('${A[bg]||''}')" data-v="${esc(v)}">${esc(v)}</div>`).join('')}</div>`;const head=$('.selHead',div);head.onmouseenter=()=>head.style.backgroundImage=`url('${A[hover]||A[bg]||''}')`;head.onmouseleave=()=>head.style.backgroundImage=`url('${A[bg]||''}')`;head.onclick=e=>{e.stopPropagation();$$('.kselect.open').forEach(o=>{if(o!==div)o.classList.remove('open')});div.classList.toggle('open')};$$('.selOpt',div).forEach(o=>o.onclick=e=>{e.stopPropagation();div.dataset.value=o.dataset.v;head.textContent=o.dataset.v;div.classList.remove('open');onchange&&onchange(o.dataset.v,div)});parent.appendChild(div);return div}document.addEventListener('click',()=>$$('.kselect.open').forEach(o=>o.classList.remove('open')));
function getSel(id){return $('#'+id)?.dataset.value||''}function setSel(id,v){const el=$('#'+id);if(!el)return;el.dataset.value=v;$('.selHead',el).textContent=v}function modeDB(m){return DB[m]||DB['Coffee Lovers']}function diffs(m){return (modeDB(m).dificuldades||['Fácil','Médio','Difícil']).map(d=>String(d))}function parseTime(t){let [m,s]=t.split(':').map(Number);return m*60+s}function diffNorm(d){let s=String(d||'').toLowerCase();if(s==='1'||s==='fácil'||s==='facil')return'fácil';if(s==='2'||s==='médio'||s==='medio')return'médio';if(s==='3'||s==='difícil'||s==='dificil')return'difícil';return s}function pts(d){return {'fácil':15,'médio':20,'difícil':30}[diffNorm(d)]||15}function rgba(c,a=1){if(!Array.isArray(c))return`rgba(80,80,80,${a})`;return`rgba(${Math.round(c[0]*255)},${Math.round(c[1]*255)},${Math.round(c[2]*255)},${c[3]??a})`}function hex(c){if(!Array.isArray(c))return'#ffffff';return '#'+c.slice(0,3).map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}function fromHex(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255,1]}
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
function renderHome(){const c=$('#homeControls');c.innerHTML='';let p=POS.home||{};makeSelect(c,'spinner_game_mode',MODES,'Clique para escolher',p.spinner_game_mode?.[0]??872,p.spinner_game_mode?.[1]??415,180,80);makeSelect(c,'spinner_equipes',['2','3','4','5','6','7','8'],'2',p.spinner_equipes?.[0]??871,p.spinner_equipes?.[1]??625,180,80);makeSelect(c,'spinner_tempo',TIMES,'1:00',p.spinner_tempo?.[0]??871,p.spinner_tempo?.[1]??520,180,80);makeSelect(c,'spinner_predefinicao',['Escolher Predefinição',...Object.keys(PRE)],'Escolher Predefinição',p.spinner_predefinicao?.[0]??50,p.spinner_predefinicao?.[1]??50,250,60,'botao generico telainicial.png','botao generico telainicial_hover.png',n=>{if(n!=='Escolher Predefinição')openPredefStart(n)});imgBtn(c,'btn_iniciar','iniciar jogo.png',p.btn_iniciar?.[0]??761,p.btn_iniciar?.[1]??275,237.5,95,startFilterPopup,'iniciar jogo_hover.png');imgBtn(c,'btn_volume','volume.png',p.btn_volume?.[0]??1200,p.btn_volume?.[1]??600,90,90,openVolume,'volume_hover.png');imgBtn(c,'btn_adicionar','adicionar perguntas.png',p.btn_adicionar?.[0]??335,p.btn_adicionar?.[1]??275,237.5,95,()=>show('addedit'),'adicionar perguntas_hover.png');imgBtn(c,'btn_listar','listar perguntas.png',p.btn_listar?.[0]??761,p.btn_listar?.[1]??175,237.5,95,()=>show('list'),'listar perguntas_hover.png');imgBtn(c,'btn_voltar','setavoltar.png',p.btn_voltar?.[0]??99,p.btn_voltar?.[1]??586,180,80,()=>show('intro'),'setavoltar_hover.png');imgBtn(c,'btn_predefinicoes','predefinições.png',p.btn_predefinicoes?.[0]??335,p.btn_predefinicoes?.[1]??175,237.5,95,()=>show('predef'),'predefinições_hover.png');imgBtn(c,'btn_historico','historico.png',p.btn_historico?.[0]??1050,p.btn_historico?.[1]??45,237.5,95,()=>show('history'),'historico_hover.png')}
function openVolume(){let m=popup(`<div style="display:flex;flex-direction:column;gap:14px;padding:20px"><div class="label">Música: <span id="mv">${bgm.volume.toFixed(2)}</span></div><input id="ms" type="range" min="0" max="1" step=".01" value="${bgm.volume}"><div class="label">Efeitos: <span id="ev">${okSound.volume.toFixed(2)}</span></div><input id="es" type="range" min="0" max="1" step=".01" value="${okSound.volume}"><button id="playM" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}')">Tocar música</button><button id="ok" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}')">OK</button></div>`,400,300);$('#ms').oninput=e=>{$('#mv').textContent=(bgm.volume=+e.target.value).toFixed(2)};$('#es').oninput=e=>{okSound.volume=errSound.volume=+e.target.value;$('#ev').textContent=okSound.volume.toFixed(2)};$('#playM').onclick=()=>bgm.play().catch(()=>{});$('#ok').onclick=closePopup}
function msg(title,message,after){let m=popup(`<div style="display:flex;flex-direction:column;height:100%;align-items:center;justify-content:center;gap:28px"><div class="label" style="font-size:24px;text-align:center">${esc(message)}</div><button id="msgOk" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}');width:240px">OK</button></div>`,820,360);$('#msgOk').onclick=()=>{closePopup();after&&after()}}
function startFilterPopup(){
  let mode=getSel('spinner_game_mode');
  if(mode==='Clique para escolher'||!mode){msg('Erro','Por favor, escolha um modo de jogo!');return}
  let data=modeDB(mode),areas=Object.keys(data.areas||{}),difs=data.dificuldades||['Fácil','Médio','Difícil'];
  let html=`<div class="filterPopupRoot">
    <div id="filterTitle" class="filterTitle editableLayout">Selecione as Áreas e Dificuldades</div>
    <div id="filterAreaLabel" class="filterLabel editableLayout">Áreas:</div>
    <div id="areaChecks" class="scroll kvScroll filterScroll editableLayout">${areas.slice().reverse().map(a=>`<label class="checkRow filterCheck"><input type="checkbox" checked value="${esc(a)}"><span>${esc(a)}</span></label>`).join('')}<div class="filterEndSpacer"></div></div>
    <div id="filterDiffLabel" class="filterLabel editableLayout">Dificuldades:</div>
    <div id="diffChecks" class="scroll kvScroll filterScroll editableLayout">${difs.slice().reverse().map(d=>`<label class="checkRow filterCheck"><input type="checkbox" checked value="${esc(diffNorm(d))}"><span>${esc(d)}</span></label>`).join('')}<div class="filterEndSpacer"></div></div>
    <button id="filterStart" class="stdBtn filterBtn filterStartBtn">Iniciar</button>
    <button id="filterCancel" class="stdBtn filterBtn filterCancelBtn">Cancelar</button>
  </div>`;
  popup(html,1093,520,'popup generico 2.png');
  $('#filterStart').onclick=()=>{let sa=$$('#areaChecks input:checked').map(i=>i.value).reverse(),sd=$$('#diffChecks input:checked').map(i=>i.value);if(!sa.length){closePopup();msg('Erro','Selecione pelo menos uma área.');return}if(!sd.length){closePopup();msg('Erro','Selecione pelo menos uma dificuldade.');return}closePopup();setupGame(mode,parseInt(getSel('spinner_equipes')||'2'),parseTime(getSel('spinner_tempo')||'1:00'),sa,sd,null)};
  $('#filterCancel').onclick=closePopup;
}

function openPredefStart(n){let pd=PRE[n];if(!pd){msg('Erro','Predefinição não encontrada.');return}let m=popup(`<div style="display:flex;flex-direction:column;gap:12px;padding:20px"><div class="label">Selecione o tempo:</div><div id="pdTimeBox" style="position:relative;height:50px;width:350px"></div><div class="label">Selecione o número de equipes:</div><div id="pdEqBox" style="position:relative;height:50px;width:350px"></div><button id="pdStart" class="stdBtn" style="background-image:url('${A['botao generico popup generico.png']}')">Iniciar Jogo</button></div>`,400,400);makeSelect($('#pdTimeBox'), 'pdTime', TIMES, '1:00',0,0,350,50,'botao generico popup generico.png','botao generico popup generico.png');makeSelect($('#pdEqBox'), 'pdEq',['2','3','4','5','6','7','8'],'2',0,0,350,50,'botao generico popup generico.png','botao generico popup generico.png');$('#pdStart').onclick=()=>{closePopup();let qs=pd.perguntas||[],areas=[...new Set(qs.map(q=>q.area))],ds=[...new Set(qs.map(q=>diffNorm(q.dificuldade)))];setupGame(pd.modo||'Coffee Lovers',parseInt(getSel('pdEq')),parseTime(getSel('pdTime')),areas,ds,qs)}}
function setupGame(mode,teams,timeLimit,areas,difs,preQs){
  game={
    id:'s'+Date.now(),
    game_mode:mode,
    num_teams:teams,
    time_limit_secs:timeLimit,
    areas_selected:areas,
    difficulties_selected:difs,
    scores:Array(teams).fill(0),
    current_team:0,
    rounds:[],
    used_questions:[],
    started_at:new Date().toLocaleString('pt-BR'),
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
  if(firstGame){
    firstGame=false;
    show('transition');
    let v=$('#transitionVideo');
    v.src=A['transição roleta.mp4']||'';
    v.muted=true;
    v.currentTime=0;
    v.onended=()=>{show('game');drawWheel();};
    v.play?.().catch(()=>{show('game');drawWheel();});
    setTimeout(()=>{if(current==='transition'){show('game');drawWheel();}},2500)
  }else{
    show('game');
    drawWheel()
  }
  $('#instruction').style.display='block'
}
function questionKey(q){
  return String((q&&q.area)||'')+'||'+String((q&&q.dificuldade)||'')+'||'+String((q&&q.pergunta)||'')
}
function validQuestionPool(area){
  if(!game)return[];
  let used=new Set(game.used_questions||[]);
  let pool=game.preQs?game.preQs:(modeDB(game.game_mode).perguntas||[]);
  return pool.filter(p=>
    p.area===area &&
    game.difficulties_selected.includes(diffNorm(p.dificuldade)) &&
    Array.isArray(p.alternativas) &&
    p.alternativas.length===4 &&
    p.correta!==undefined &&
    !used.has(questionKey(p))
  )
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
    let areas=[...new Set(game.preQs.map(q=>q.area))].filter(a=>game.areas_selected.includes(a)&&hasAvailableQuestions(a));
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
function drawWheel(){
  let c=$('#wheelCanvas'),ctx=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,cy=H/2,r=Math.min(W,H)/2*.9;
  ctx.clearRect(0,0,W,H);
  if(!wheel.segments.length)return;
  let t=performance.now();

  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(wheel.angle*Math.PI/180);
  ctx.translate(-cx,-cy);

  let total=wheel.segments.reduce((a,s)=>a+s.peso,0),cur=0,pointerLocal=normDeg(HANDLE_POINTER_DEG-wheel.angle);
  for(let seg of wheel.segments){
    let deg=seg.peso/total*360,rad1=cur*Math.PI/180,rad2=(cur+deg)*Math.PI/180;
    let selected=angleInSegment(cur,cur+deg,pointerLocal);
    drawLiquidSegment(ctx,cx,cy,r,rad1,rad2,seg,selected,t);
    cur+=deg
  }

  drawCoffeeSwirl(ctx,cx,cy,r,t);
  drawHandlePointerCue(ctx,cx,cy,r,t);

  // Vinheta circular pra encaixar melhor na xícara
  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  let rim=ctx.createRadialGradient(cx,cy,r*.72,cx,cy,r);
  rim.addColorStop(0,'rgba(0,0,0,0)');
  rim.addColorStop(.72,'rgba(0,0,0,0)');
  rim.addColorStop(1,'rgba(25,10,3,.34)');
  ctx.fillStyle=rim;
  ctx.fill();

  ctx.restore();
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
function spin(){
  if(!game||wheel.anim)return;
  buildWheel();
  drawWheel();
  if(!wheel.segments.length||!game.areas_selected.some(a=>!SPECIAL.has(a))){
    msg('Fim das perguntas','Não há mais áreas com perguntas disponíveis.',endGame);
    return
  }
  $('#instruction').style.display='none';
  wheel.anim=true;
  let initial=800+Math.random()*100,acc=.1,dec=4+Math.random()*2,state='acc',at=0,dtm=0,last=performance.now();
  function step(t){
    let dt=(t-last)/1000;last=t;
    if(state==='acc'){at+=dt;if(at<acc)wheel.speed=at/acc*initial;else{state='dec';dtm=0;wheel.speed=initial}}
    if(state==='dec'){dtm+=dt;if(dtm<dec)wheel.speed=initial*(1-dtm/dec);else{wheel.speed=0;wheel.anim=false;drawWheel();let seg=selectedSeg();if(seg)handleArea(seg.nome);return}}
    wheel.angle=(wheel.angle+wheel.speed*dt)%360;
    drawWheel();
    wheel.raf=requestAnimationFrame(step)
  }
  wheel.raf=requestAnimationFrame(step)
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
  let html=`<div style="height:100%;display:flex;flex-direction:column;padding:15px 40px 25px;gap:15px"><div id="timerLabel" class="label" style="height:48px;text-align:center;font-size:18px">Tempo restante: ${rem}s</div><div class="scroll kvScroll" style="flex:1"><div style="padding:0 40px 10px;display:flex;flex-direction:column;gap:10px"><div class="label" style="font-size:20px;text-align:center;white-space:pre-wrap">[Equipe ${game.current_team+1}] ${esc(q.pergunta||'Pergunta não encontrada.')}</div>${[...(q.alternativas||[]),'Dica'].map((a,i)=>`<button class="stdBtn ans" data-i="${i}" style="background-image:url('${A['botao generico popup generico.png']}');font-size:18px">${esc(a)}</button>`).join('')}</div></div></div>`;
  popup(html,1093,494,'popup genérico HD.png').parentElement.style.backgroundColor=rgba(color,.3);
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
  $$('.ans').forEach(b=>b.onclick=e=>{
    e&&e.preventDefault&&e.preventDefault();
    e&&e.stopPropagation&&e.stopPropagation();
    let i=+b.dataset.i;
    if(i===(q.alternativas||[]).length){showHint(q);return}
    let correct=i===Number(q.correta),rec={area,difficulty:q.dificuldade,question:q.pergunta,answer_marked:i,correct_answer:q.correta,is_correct:correct,equipe:game.current_team+1,answer_time_secs:tl-rem,question_key:questionKey(q)};
    game.rounds.push(rec);
    markQuestionUsed(q);
    if(correct){
      okSound.play().catch(()=>{});
      game.scores[game.current_team]+=pts(q.dificuldade);
      renderScore();
      closePopup();
      rebuildWheelAfterQuestion(area);
      msg('Pontos',`+${pts(q.dificuldade)} pontos adicionados!`,nextTeam)
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
function endGame(){if(!game||!game.scores.length)return;let max=Math.max(...game.scores),w=game.scores.map((s,i)=>s===max?i+1:null).filter(Boolean),txt=w.length===1?`Equipe ${w[0]} venceu com ${max} pontos!`:`Empate entre as equipes: ${w.join(', ')} com ${max} pontos!`;let hist=load(HIST_KEY,[]);hist.push({...game,ended_at:new Date().toLocaleString('pt-BR'),final_scoreboard:Object.fromEntries(game.scores.map((s,i)=>[`Equipe ${i+1}`,s]))});save(HIST_KEY,hist);msg('Jogo Encerrado',txt,()=>{game=null;show('intro')})}
function renderAddEdit(){let c=$('#addEditContent'),m=editingIndex?.mode||'Coffee Lovers';c.innerHTML=`<div class="fieldRow"><label>Modo de Jogo:</label><div id="editModeBox" style="flex:1;position:relative;height:40px"></div></div><div class="fieldRow"><label>Área:</label><div id="editAreaBox" style="flex:1;position:relative;height:40px"></div></div><div class="fieldRow"><label>Nova Área:</label><input id="newArea"><button id="addArea" class="stdBtn" style="width:180px;background-image:url('${A['botao generico listarperguntas.png']}')">Adicionar</button></div>${['Pergunta:','Alternativa 0:','Alternativa 1:','Alternativa 2:','Alternativa 3:','Resposta Correta (0-3):'].map((l,i)=>`<div class="fieldRow"><label>${l}</label><input id="f${i}"></div>`).join('')}<div class="fieldRow"><label>Dificuldade:</label><div id="diffBox" style="flex:1;position:relative;height:40px"></div></div><div class="fieldRow"><label>Cor da Área:</label><input id="areaColor" type="color" value="#ffffff"></div><div class="fieldRow"><label>Dica (Texto):</label><input id="hintText"></div><div class="fieldRow"><label>Caminho da Imagem:</label><input id="hintImg"><button class="stdBtn" style="width:180px;background-image:url('${A['botao generico listarperguntas.png']}')">Escolher Arquivo</button></div><div class="fieldRow"><label></label><button id="saveQ" class="stdBtn" style="flex:1;background-image:url('${A['botao generico listarperguntas.png']}')">Salvar</button><button id="cancelQ" class="stdBtn" style="flex:1;background-image:url('${A['botao generico listarperguntas.png']}')">Cancelar</button></div>`;if(!$('#addBack')){imgBtn(c,'addBack','setavoltar.png',20,20,122,86,()=>show('home'),'setavoltar_hover.png');}makeSelect($('#editModeBox'),'editMode',MODES,m,0,0,500,40,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',()=>renderAddEdit());let areas=Object.keys(modeDB(getSel('editMode')||m).areas||{});makeSelect($('#editAreaBox'),'editArea',areas,'Selecione uma Área',0,0,500,40,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',a=>{$('#areaColor').value=hex((modeDB(getSel('editMode')).areas||{})[a])});makeSelect($('#diffBox'),'editDiff',['Fácil','Médio','Difícil'],'Fácil',0,0,500,40,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png');if(editingIndex){let q=modeDB(editingIndex.mode).perguntas[editingIndex.index];setSel('editMode',editingIndex.mode);setSel('editArea',q.area);setSel('editDiff',q.dificuldade);$('#f0').value=q.pergunta||'';(q.alternativas||[]).forEach((a,i)=>$('#f'+(i+1)).value=a);$('#f5').value=q.correta;$('#hintText').value=q.dica_texto||'';$('#hintImg').value=q.dica_imagem||'';$('#areaColor').value=hex((modeDB(editingIndex.mode).areas||{})[q.area])}$('#cancelQ').onclick=()=>{editingIndex=null;show('home')};$('#addArea').onclick=()=>{let mm=getSel('editMode'),a=$('#newArea').value.trim();if(a){modeDB(mm).areas[a]=fromHex($('#areaColor').value);save(DB_KEY,DB);renderAddEdit()}};$('#saveQ').onclick=saveQuestion}
function saveQuestion(){let m=getSel('editMode'),a=getSel('editArea');if(a==='Selecione uma Área'||!a){msg('Erro','Selecione ou adicione uma área.');return}let q={area:a,pergunta:$('#f0').value,alternativas:[$('#f1').value,$('#f2').value,$('#f3').value,$('#f4').value],correta:Number($('#f5').value)||0,dificuldade:getSel('editDiff'),dica_texto:$('#hintText').value,dica_imagem:$('#hintImg').value};modeDB(m).areas[a]=fromHex($('#areaColor').value);if(editingIndex&&editingIndex.mode===m)modeDB(m).perguntas[editingIndex.index]=q;else modeDB(m).perguntas.push(q);save(DB_KEY,DB);editingIndex=null;msg('Sucesso','Pergunta salva.',()=>show('home'))}
function renderList(){const c=$('#listControls');c.innerHTML='';let p=POS.list||{};makeSelect(c,'listMode',MODES,'Coffee Lovers',p.spinner_game_mode_list?.[0]??794,p.spinner_game_mode_list?.[1]??571,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',()=>renderListRows());imgBtn(c,'btn_voltar_listar','setavoltar.png',p.btn_voltar_listar?.[0]??40,p.btn_voltar_listar?.[1]??571,180,80,()=>show('home'),'setavoltar_hover.png');makeSelect(c,'listArea',['Todas',...Object.keys(modeDB('Coffee Lovers').areas||{})],'Todas',p.spinner_area_filter?.[0]??366,p.spinner_area_filter?.[1]??407,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',renderListRows);makeSelect(c,'listDiff',['Todas','Fácil','Médio','Difícil'],'Todas',p.spinner_difficulty_filter?.[0]??762,p.spinner_difficulty_filter?.[1]??410,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',renderListRows);renderListRows()}
function renderListRows(){let m=getSel('listMode')||'Coffee Lovers';let areaSel=$('#listArea'),cur=areaSel?getSel('listArea'):'Todas';if(areaSel){let vals=['Todas',...Object.keys(modeDB(m).areas||{})];areaSel.remove();makeSelect($('#listControls'),'listArea',vals,vals.includes(cur)?cur:'Todas',POS.list.spinner_area_filter?.[0]??366,POS.list.spinner_area_filter?.[1]??407,180,80,'botao generico listarperguntas.png','botao generico listarperguntas_hover.png',renderListRows)}let area=getSel('listArea')||'Todas',diff=getSel('listDiff')||'Todas';let rows=(modeDB(m).perguntas||[]).map((q,i)=>({q,i})).filter(o=>(area==='Todas'||o.q.area===area)&&(diff==='Todas'||String(o.q.dificuldade).charAt(0).toUpperCase()+String(o.q.dificuldade).slice(1)===diff));$('#questionList').innerHTML=rows.map(({q,i})=>`<div class="listRow"><div class="qText">${esc(q.pergunta)}</div><button class="kbtn editQ" data-i="${i}" style="position:relative;width:120px;height:40px"><img src="${A['botao generico listarperguntaseditar.png']||''}"></button></div>`).join('');$$('.editQ').forEach(b=>b.onclick=()=>{editingIndex={mode:m,index:+b.dataset.i};show('addedit')})}
function renderPredef(){let c=$('#predefControls');c.innerHTML='';makeSelect(c,'preSel',['Escolher Predefinição',...Object.keys(PRE)],'Escolher Predefinição',341.5-125,705*.8-60,250,60);makeSelect(c,'preMode',['Todas',...MODES],'Todas',683-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions);makeSelect(c,'preArea',['Todas'],'Todas',956.2-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions);makeSelect(c,'preDiff',['Todas','Fácil','Médio','Difícil'],'Todas',1229.4-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions);let save=document.createElement('button');save.className='stdBtn';save.style.cssText=`position:absolute;left:${683-125}px;bottom:${705*.02}px;width:250px;height:60px;background-image:url('${A['botao generico telainicial.png']}')`;save.textContent='Salvar Predefinição';save.onclick=savePredef;c.appendChild(save);imgBtn(c,'preBack','setavoltar.png',10,10,60,60,()=>show('home'),'setavoltar_hover.png');renderPredefQuestions()}
function renderPredefQuestions(){let m=getSel('preMode')||'Todas';let areas=m==='Todas'?[...new Set(MODES.flatMap(mm=>Object.keys(modeDB(mm).areas||{})))]:Object.keys(modeDB(m).areas||{});let areaEl=$('#preArea');if(areaEl){let old=getSel('preArea');areaEl.remove();makeSelect($('#predefControls'),'preArea',['Todas',...areas],areas.includes(old)?old:'Todas',956.2-100,705*.8-60,200,60,'botao generico telainicial.png','botao generico telainicial.png',renderPredefQuestions)}let area=getSel('preArea')||'Todas',diff=getSel('preDiff')||'Todas';let qs=[];(m==='Todas'?MODES:[m]).forEach(mm=>(modeDB(mm).perguntas||[]).forEach((q,i)=>{if((area==='Todas'||q.area===area)&&(diff==='Todas'||q.dificuldade===diff))qs.push({...q,_mode:mm,_i:i})}));$('#predefQuestions').innerHTML=qs.map((q,idx)=>`<label class="predefItem"><input type="checkbox" checked data-idx="${idx}"><span>${esc(q.pergunta)}</span></label>`).join('');$('#predefQuestions')._qs=qs}
function savePredef(){let name=prompt('Nome da predefinição:');if(!name)return;let qs=$('#predefQuestions')._qs||[],sel=$$('#predefQuestions input:checked').map(i=>qs[+i.dataset.idx]);PRE[name]={modo:getSel('preMode')==='Todas'?'Coffee Lovers':getSel('preMode'),perguntas:sel};save(PRE_KEY,PRE);msg('Sucesso','Predefinição salva.',()=>show('home'))}
function renderHistory(){let h=load(HIST_KEY,[]).slice().reverse();$('#histList').innerHTML=h.length?h.map((s,i)=>`<button class="nativeBtn histItem" data-i="${i}" style="width:100%;margin-bottom:8px"> ${esc(s.started_at)} | Modo: ${esc(s.game_mode)} | Equipes: ${s.num_teams} | Tempo/questão: ${s.time_limit_secs}s | Duração: —s</button>`).join(''):`<div style="height:140px;padding-top:24px;text-align:center;font-size:20px">Nenhuma sessão registrada ainda.</div>`;$$('.histItem').forEach(b=>b.onclick=()=>openHist(h[+b.dataset.i]));$('#histBack').onclick=()=>show('home')}
function openHist(s){let lines=[` ${s.started_at} | Modo: ${s.game_mode} | Equipes: ${s.num_teams} | Tempo/questão: ${s.time_limit_secs}s | Duração: —s`,'--------------------------------------------------------------------------------',`Áreas: ${(s.areas_selected||[]).join(', ')||'—'}`,`Dificuldades: ${(s.difficulties_selected||[]).join(', ')||'—'}`,'',...(s.rounds||[]).map((r,i)=>`${String(i+1).padStart(2,'0')}. [${r.area||''} | ${r.difficulty||''} | Equipe ${r.equipe}]\n    Pergunta: ${r.question||''}\n    Resposta: ${r.answer_marked} | Correta: ${r.correct_answer} | Resultado: ${r.is_correct?'Certo':'Errado'}\n    Tempo gasto: ${r.answer_time_secs||'—'} s`)];let m=popup(`<pre class="scroll" style="white-space:pre-wrap;height:370px;font-size:16px">${esc(lines.join('\n'))}</pre><div style="display:flex;gap:8px"><button id="exportTxt" class="nativeBtn" style="width:160px;text-align:center">Exportar TXT</button><button id="exportCsv" class="nativeBtn" style="width:160px;text-align:center">Exportar CSV</button><button id="closeH" class="nativeBtn" style="width:120px;text-align:center">Fechar</button></div>`,900,520);$('#closeH').onclick=closePopup;$('#exportTxt').onclick=()=>download('historico_roleta.txt',lines.join('\n'),'text/plain');$('#exportCsv').onclick=()=>download('historico_roleta.csv',(s.rounds||[]).map(r=>[r.equipe,r.area,r.difficulty,r.question,r.answer_marked,r.correct_answer,r.is_correct].map(x=>`"${String(x).replace(/"/g,'""')}"`).join(';')).join('\n'),'text/csv')}
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
  const STORE='qc1_layout_overrides_editmode_v32_hint_ok_fix';
  const OLD_STORE='__none__';
  const DEFAULT_APPLIED_LAYOUT={"intro:btn_config":{"left":1047.2,"top":27.4,"width":74.6,"height":73.6},"intro:btn_instrucoes":{"left":306.8,"top":606.6,"width":235.8,"height":56.9},"intro:btn_comecar":{"left":565.6,"top":524.9,"width":220,"height":60},"intro:btn_creditos":{"left":835.3,"top":603.2,"width":201.4,"height":57.9},"home:spinner_game_mode":{"left":873.9,"top":210,"width":180,"height":80},"home:spinner_equipes":{"left":874.9,"top":3.9,"width":180,"height":80},"home:spinner_tempo":{"left":873.9,"top":107.9,"width":180,"height":80},"home:spinner_predefinicao":{"left":34.6,"top":553.5,"width":250,"height":60},"home:btn_iniciar":{"left":760,"top":341.7,"width":216.2,"height":69},"home:btn_volume":{"left":1200,"top":15,"width":90,"height":90},"home:btn_adicionar":{"left":334,"top":342.7,"width":237.5,"height":68},"home:btn_listar":{"left":763.9,"top":427.3,"width":215.3,"height":68},"home:btn_voltar":{"left":22.8,"top":48.6,"width":122.1,"height":86.8},"home:btn_predefinicoes":{"left":334,"top":427.3,"width":238.4,"height":66.1},"home:btn_historico":{"left":1071.2,"top":548.6,"width":189.3,"height":57.4},"game:spinBtn":{"left":174.4,"top":174.4,"width":133.6,"height":126.8},"game:gameBack":{"left":64.6,"top":27,"width":100.9,"height":94.5},"game:spinBtn2":{"left":629.6,"top":329.6,"width":110.6,"height":102.9},"addedit:editMode":{"left":0.9,"top":-0.9,"width":500,"height":40},"addedit:editArea":{"left":0,"top":0,"width":500,"height":40},"addedit:addArea":{"left":1164.1,"top":114.8,"width":180,"height":48},"addedit:editDiff":{"left":0,"top":0,"width":500,"height":40},"addedit:item_4":{"left":0,"top":0,"width":180,"height":48},"addedit:saveQ":{"left":428.2,"top":680,"width":457,"height":48},"addedit:cancelQ":{"left":893.1,"top":680.8,"width":457,"height":48},"list:listMode":{"left":794,"top":54,"width":180,"height":80},"list:btn_voltar_listar":{"left":40,"top":54,"width":126,"height":85.8},"list:listDiff":{"left":762,"top":215,"width":180,"height":80},"list:listArea":{"left":366,"top":218,"width":180,"height":80},"list:item_4":{"left":0,"top":0,"width":120,"height":40},"list:item_5":{"left":0,"top":0,"width":120,"height":40},"list:item_6":{"left":0,"top":0,"width":120,"height":40},"list:item_7":{"left":0,"top":0,"width":120,"height":40},"list:item_8":{"left":0,"top":0,"width":120,"height":40},"list:item_9":{"left":0,"top":0,"width":120,"height":40},"list:item_10":{"left":0,"top":0,"width":120,"height":40},"list:item_11":{"left":0,"top":0,"width":120,"height":40},"list:item_12":{"left":0,"top":0,"width":120,"height":40},"list:item_13":{"left":0,"top":0,"width":120,"height":40},"list:item_14":{"left":0,"top":0,"width":120,"height":40},"list:item_15":{"left":0,"top":0,"width":120,"height":40},"list:item_16":{"left":0,"top":0,"width":120,"height":40},"list:item_17":{"left":0,"top":0,"width":120,"height":40},"list:item_18":{"left":0,"top":0,"width":120,"height":40},"list:item_19":{"left":0,"top":0,"width":120,"height":40},"list:item_20":{"left":0,"top":0,"width":120,"height":40},"list:item_21":{"left":0,"top":0,"width":120,"height":40},"list:item_22":{"left":0,"top":0,"width":120,"height":40},"list:item_23":{"left":0,"top":0,"width":120,"height":40},"list:item_24":{"left":0,"top":0,"width":120,"height":40},"list:item_25":{"left":0,"top":0,"width":120,"height":40},"list:item_26":{"left":0,"top":0,"width":120,"height":40},"list:item_27":{"left":0,"top":0,"width":120,"height":40},"list:item_28":{"left":0,"top":0,"width":120,"height":40},"list:item_29":{"left":0,"top":0,"width":120,"height":40},"list:item_30":{"left":0,"top":0,"width":120,"height":40},"list:item_31":{"left":0,"top":0,"width":120,"height":40},"list:item_32":{"left":0,"top":0,"width":120,"height":40},"list:item_33":{"left":0,"top":0,"width":120,"height":40},"list:item_34":{"left":0,"top":0,"width":120,"height":40},"list:item_35":{"left":0,"top":0,"width":120,"height":40},"list:item_36":{"left":0,"top":0,"width":120,"height":40},"list:item_37":{"left":0,"top":0,"width":120,"height":40},"list:item_38":{"left":0,"top":0,"width":120,"height":40},"list:item_39":{"left":0,"top":0,"width":120,"height":40},"list:item_40":{"left":0,"top":0,"width":120,"height":40},"list:item_41":{"left":0,"top":0,"width":120,"height":40},"list:item_42":{"left":0,"top":0,"width":120,"height":40},"list:item_43":{"left":0,"top":0,"width":120,"height":40},"list:item_44":{"left":0,"top":0,"width":120,"height":40},"list:item_45":{"left":0,"top":0,"width":120,"height":40},"list:item_46":{"left":0,"top":0,"width":120,"height":40},"list:item_47":{"left":0,"top":0,"width":120,"height":40},"list:item_48":{"left":0,"top":0,"width":120,"height":40},"list:item_49":{"left":0,"top":0,"width":120,"height":40},"list:item_50":{"left":0,"top":0,"width":120,"height":40},"list:item_51":{"left":0,"top":0,"width":120,"height":40},"list:item_52":{"left":0,"top":0,"width":120,"height":40},"list:item_53":{"left":0,"top":0,"width":120,"height":40},"list:item_54":{"left":0,"top":0,"width":120,"height":40},"list:item_55":{"left":0,"top":0,"width":120,"height":40},"list:item_56":{"left":0,"top":0,"width":120,"height":40},"list:item_57":{"left":0,"top":0,"width":120,"height":40},"list:item_58":{"left":0,"top":0,"width":120,"height":40},"list:item_59":{"left":0,"top":0,"width":120,"height":40},"list:item_60":{"left":0,"top":0,"width":120,"height":40},"list:item_61":{"left":0,"top":0,"width":120,"height":40},"list:item_62":{"left":0,"top":0,"width":120,"height":40},"list:item_63":{"left":0,"top":0,"width":120,"height":40},"predef:preSel":{"left":216.5,"top":141,"width":250,"height":60},"predef:preMode":{"left":583,"top":141,"width":200,"height":60},"predef:preDiff":{"left":1129.4,"top":141,"width":200,"height":60},"predef:item_3":{"left":558,"top":630.9,"width":250,"height":60},"predef:preBack":{"left":39.9,"top":40.9,"width":87,"height":83.1},"predef:preArea":{"left":856.2,"top":141,"width":200,"height":60},"history:histBack":{"left":0,"top":0,"width":120,"height":48},"history:item_1":{"left":0,"top":0,"width":100,"height":40},"credits:creditBtn_0":{"left":0,"top":0,"width":197,"height":400},"credits:creditBtn_1":{"left":217,"top":0,"width":197,"height":400},"credits:creditBtn_2":{"left":434,"top":0,"width":197,"height":400},"credits:creditBtn_3":{"left":653,"top":0,"width":197,"height":400},"credits:creditsBack":{"left":27,"top":35,"width":60,"height":60},"popup:intro:openModePopup:introMode":{"left":28,"top":8,"width":594,"height":50},"popup:intro:openModePopup:introEq":{"left":28,"top":83,"width":594,"height":50},"popup:intro:openModePopup:introTime":{"left":28,"top":158,"width":594,"height":50},"popup:intro:openModePopup:introConfirm":{"left":88,"top":254,"width":200,"height":60},"popup:intro:openModePopup:introCancel":{"left":316,"top":254,"width":200,"height":60},"popup:home:startFilterPopup:filterStart":{"left":80,"top":455,"width":190,"height":44},"popup:home:startFilterPopup:filterCancel":{"left":280,"top":455,"width":200,"height":44},"popup:home:volume:playM":{"left":20,"top":178,"width":360,"height":48},"popup:home:volume:ok":{"left":20,"top":240,"width":360,"height":48},"addedit:addBack":{"left":47,"top":48.9,"width":122,"height":86},"history:item_2":{"left":0,"top":0,"width":100,"height":40},"history:item_3":{"left":0,"top":0,"width":100,"height":40},"popup:intro:introMode":{"left":-2.9,"top":65.9,"width":594,"height":50},"popup:intro:introConfirm":{"left":-302.8,"top":57.9,"width":200,"height":48},"popup:intro:introCancel":{"left":166.8,"top":60.8,"width":200,"height":48},"popup:intro:introTime":{"left":0,"top":229.4,"width":594,"height":50},"popup:intro:introEq":{"left":-3.8,"top":146.7,"width":594,"height":50},"popup:home:filterStart":{"left":345.7,"top":436.5,"width":190,"height":44},"popup:home:filterCancel":{"left":577.3,"top":436.5,"width":200,"height":44},"game:wheelWrap":{"left":443.7,"top":143.2,"width":482.4,"height":475.6},"history:item_4":{"left":0,"top":0,"width":100,"height":40},"popup:home:filterTitle":{"left":-10.6,"top":48.6,"width":1093,"height":34},"popup:home:filterAreaLabel":{"left":239.4,"top":78.2,"width":260,"height":30},"popup:home:areaChecks":{"left":67.8,"top":112.1,"width":503.9,"height":279.4},"popup:home:filterDiffLabel":{"left":703.5,"top":81.1,"width":260,"height":30},"popup:home:diffChecks":{"left":582,"top":113.1,"width":420,"height":318},"history:item_5":{"left":0,"top":0,"width":100,"height":40},"history:item_6":{"left":0,"top":0,"width":100,"height":40},"history:item_7":{"left":0,"top":0,"width":100,"height":40}};
  let editMode=false, selected=null, drag=null, scheduled=false, drawing=false;
  let layout={...DEFAULT_APPLIED_LAYOUT,...(load(STORE,null)||{})};
  const stage=$('#stage');

  let toolbar=$('#editToolbar');
  if(toolbar) toolbar.remove();
  toolbar=document.createElement('div');
  toolbar.id='editToolbar';
  toolbar.className='editToolbar';
  toolbar.innerHTML=`<button id="editToggle">EDIT</button><button id="editExportAll">Exportar tudo</button><button id="editImportBtn">Importar</button><button id="editResetScreen">Reset tela</button><span class="editName" id="editName">nada selecionado</span><span class="editHint">x</span><input id="editX" type="number" step="1"><span class="editHint">y</span><input id="editY" type="number" step="1"><span class="editHint">w</span><input id="editW" type="number" step="1"><span class="editHint">h</span><input id="editH" type="number" step="1"><button id="editUp">↑</button><button id="editDown">↓</button><button id="editLeft">←</button><button id="editRight">→</button><input id="editImport" type="file" accept="application/json" style="display:none">`;
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
function liquidIdleLoop(){
  if(current==='game'&&game&&!wheel.anim&&wheel.segments&&wheel.segments.length){
    drawWheel();
  }
  requestAnimationFrame(liquidIdleLoop);
}
requestAnimationFrame(liquidIdleLoop);
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
