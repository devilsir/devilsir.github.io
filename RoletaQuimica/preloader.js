(function(){
  'use strict';

  const CACHE_NAME = 'roleta-quimica-cafe-v31-startup-preload';
  const WORKERS = 5;
  const REQUEST_TIMEOUT = 30000;
  const SLOW_NOTICE = 12000;
  let started = false;

  function assetType(url){
    if(/\.(mp4|webm|mov)(?:[?#]|$)/i.test(url))return 'vídeos';
    if(/\.(mp3|wav|ogg|m4a)(?:[?#]|$)/i.test(url))return 'sons';
    return 'imagens';
  }

  function localURL(value){
    const source = String(value||'').trim();
    if(!source || /^(?:data:|blob:|javascript:)/i.test(source))return '';
    try{
      const url = new URL(source, document.baseURI);
      const base = new URL('./', document.baseURI);
      if(url.origin!==location.origin || !url.pathname.startsWith(base.pathname))return '';
      return url.href;
    }catch(error){
      return '';
    }
  }

  function gatherResources(assets,db,presets){
    const resources = new Map();
    const include = (url,name)=>{
      const absolute = localURL(url);
      if(!absolute)return;
      if(!resources.has(absolute))resources.set(absolute,{url:absolute,names:[],type:assetType(absolute)});
      if(name)resources.get(absolute).names.push(name);
    };
    Object.entries(assets||{}).forEach(([name,url])=>include(url,name));
    const collectQuestions = questions=>{
      if(!Array.isArray(questions))return;
      questions.forEach(q=>{
        [q?.imagem_pergunta,q?.question_image,q?.dica_imagem].forEach(url=>include(url));
      });
    };
    Object.values(db||{}).forEach(mode=>collectQuestions(mode?.perguntas));
    Object.values(presets||{}).forEach(preset=>collectQuestions(preset?.perguntas));
    const priority = item=>{
      const path=item.url.toLowerCase();
      if(path.includes('introducao-') || path.includes('introducao-cartoon-'))return 0;
      if(path.includes('transicao-roleta-') || path.includes('musicadefundo-'))return 1;
      if(path.includes('telainicial-') || path.includes('xicara-de-cima-'))return 2;
      if(item.type==='sons' || item.type==='vídeos')return 3;
      return 4;
    };
    return [...resources.values()].sort((a,b)=>priority(a)-priority(b));
  }

  function questionTotal(db){
    return Object.values(db||{}).reduce((sum,mode)=>sum+(Array.isArray(mode?.perguntas)?mode.perguntas.length:0),0);
  }

  async function preloadOne(resource,assets,cache){
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),REQUEST_TIMEOUT);
    try{
      let response = null;
      if(cache)response = await cache.match(resource.url);
      if(!response && 'caches' in window)response = await caches.match(resource.url);
      const fromCache = !!response;
      if(!response)response = await fetch(resource.url,{cache:'force-cache',signal:controller.signal});
      if(!response.ok || response.status!==200)throw new Error('HTTP '+response.status);
      const blob = await response.blob();
      if(!blob.size)throw new Error('Arquivo vazio');
      if(!fromCache && cache){
        try{
          await cache.put(resource.url,new Response(blob,{status:200,headers:{'Content-Type':blob.type||response.headers.get('Content-Type')||'application/octet-stream'}}));
        }catch(error){
          console.warn('Não foi possível guardar um recurso no cache:',resource.url,error);
        }
      }
      if(resource.names.length){
        const runtimeURL = URL.createObjectURL(blob);
        for(const name of resource.names)assets[name] = runtimeURL;
      }
      return blob.size;
    }finally{
      clearTimeout(timeout);
    }
  }

  function loadScreenImages(assets){
    const keys=['introdução cartoon.jpg','telainicial.png','xicara de cima.png','fundo generico.jpg','fundo generico2.jpg'];
    return Promise.allSettled(keys.map(async key=>{
      const src=assets[key];
      if(!src)return;
      const image=new Image();
      image.src=src;
      if(image.decode)await image.decode();
    }));
  }

  function assignAudio(bindings,assets){
    (bindings||[]).forEach(binding=>{
      const src=assets[binding?.key];
      const audio=binding?.audio;
      if(!audio||!src)return;
      audio.preload='auto';
      audio.src=src;
      audio.load();
    });
  }

  async function start(options){
    if(started)return;
    started=true;
    const loader=document.getElementById('startupLoader');
    const fill=document.getElementById('startupProgressFill');
    const percent=document.getElementById('startupPercent');
    const detail=document.getElementById('startupDetails');
    const status=document.getElementById('startupStatus');
    const progress=document.getElementById('startupProgress');
    const continueButton=document.getElementById('startupContinue');
    const retryButton=document.getElementById('startupRetry');
    const assets=options?.assets||{};
    const resources=gatherResources(assets,options?.db,options?.presets);
    const total=resources.length;
    let completed=0;
    let cursor=0;
    let skipped=false;
    let finished=false;
    const failed=[];
    const update=(message)=>{
      const value=total?Math.round(completed*100/total):100;
      if(fill)fill.style.width=value+'%';
      if(percent)percent.textContent=value+'%';
      if(detail)detail.textContent=completed+' / '+total+' arquivos';
      if(progress)progress.setAttribute('aria-valuenow',String(value));
      if(status&&message)status.textContent=message;
    };
    const finish=()=>{
      if(finished)return;
      finished=true;
      document.body.classList.remove('startupLoading');
      assignAudio(options?.audioBindings,assets);
      if(loader){
        loader.classList.add('startupFinished');
        setTimeout(()=>loader.remove(),350);
      }
      if(typeof options?.onReady==='function')options.onReady();
    };
    if(continueButton)continueButton.onclick=()=>{skipped=true;finish()};
    if(retryButton)retryButton.onclick=()=>location.reload();
    update('Preparando '+questionTotal(options?.db)+' perguntas e recursos do jogo...');
    const slowTimer=setTimeout(()=>{
      if(!finished && continueButton){
        continueButton.hidden=false;
        continueButton.textContent='Continuar sem esperar';
      }
    },SLOW_NOTICE);
    let cache=null;
    try{
      if('caches' in window)cache=await caches.open(CACHE_NAME);
    }catch(error){
      console.warn('Cache local indisponível:',error);
    }
    const worker=async()=>{
      while(!skipped){
        const index=cursor++;
        if(index>=total)return;
        const item=resources[index];
        update('Preparando '+item.type+'...');
        try{
          await preloadOne(item,assets,cache);
        }catch(error){
          failed.push(item);
          console.warn('Falha no pré-carregamento:',item.url,error);
        }
        completed++;
        update('Preparando '+item.type+'...');
      }
    };
    await Promise.all(Array.from({length:Math.min(WORKERS,total)},worker));
    clearTimeout(slowTimer);
    if(finished)return;
    if(failed.length){
      update(failed.length+' arquivo(s) não carregado(s). Verifique a conexão.');
      if(continueButton){
        continueButton.hidden=false;
        continueButton.textContent='Continuar com recursos disponíveis';
      }
      if(retryButton)retryButton.hidden=false;
      return;
    }
    update('Preparando as telas...');
    await loadScreenImages(assets);
    if(finished)return;
    update('Tudo pronto! Iniciando a roleta...');
    finish();
  }

  window.ROULETTE_PRELOADER={start};
})();
