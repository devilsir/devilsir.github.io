(function(){
  window.EQ=window.EQ||{};
  const $=(s,r=document)=>r.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const shuffle=a=>{
    const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]} return b;
  };
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  class Runner{
    constructor(root,options){
      this.root=root; this.questions=options.questions||[]; this.meta=options.meta||{}; this.onComplete=options.onComplete||(()=>{});
      this.index=0;this.correct=0;this.totalAttempts=0;this.score=0;this.started=Date.now();this.feedback=null;this.locked=false;this.paused=false;
      this.questionState={};
      this.session=EQ.Store.startSession(Object.assign({mode:'mission',profileId:EQ.Store.activeProfile()?.id||null,classId:EQ.Store.activeClass()?.id||null},this.meta));
      this.render();
    }
    current(){return this.questions[this.index]}
    settings(){return EQ.Store.get().settings}
    displayOptions(q){
      let opts=shuffle(q.options||[]),level=Number(this.settings().supportLevel||0);
      if(q.type==='choice' && level===1){
        const wrong=opts.filter(x=>x!==q.answer).slice(0,1); opts=shuffle([q.answer,...wrong]);
      }else if(q.type==='choice' && level===2){
        const wrong=opts.filter(x=>x!==q.answer).slice(0,2); opts=shuffle([q.answer,...wrong]);
      }
      return opts;
    }
    topHTML(q){
      const s=this.settings(),progress=Math.round((this.index/this.questions.length)*100);
      return `<div class="hud"><span class="badge">${esc(this.meta.label||'Missão')}</span><span class="muted tiny">Questão ${this.index+1} de ${this.questions.length}</span><span class="grow"></span><strong>${this.score} energia</strong></div>
      <div class="progress-track" aria-label="Progresso da atividade"><div class="progress-fill" style="width:${progress}%"></div></div>
      ${s.supportLevel?`<div class="support-banner"><span>◈</span><div><strong>${EQ.CURRICULUM.supportLevels[s.supportLevel].name}</strong><div class="tiny">Mesma missão, com apoio ajustado.</div></div></div>`:''}
      <p class="instruction">${this.instruction(q.type)}</p><h2 class="question">${esc(q.prompt)}</h2>
      ${s.portugueseSupport&&q.pt?`<p class="muted" lang="pt-BR">${esc(q.pt)}</p>`:''}`;
    }
    instruction(type){return ({choice:'Choose the best answer.',sentence:'Build the sentence in the correct order.',match:'Connect each item to its pair.',order:'Put the events in the correct order.',room:'Drag the object to the correct place in the room.'})[type]||'Complete the challenge.'}
    render(){
      const q=this.current(); if(!q){this.complete();return}
      this.locked=false;this.feedback=null;this.questionState={};
      const board=`<section class="card game-board reveal"><div id="question-area">${this.topHTML(q)}${this.gameHTML(q)}</div><div id="feedback-area"></div></section>`;
      const side=`<aside class="side-panel">
        <section class="card flat"><span class="kicker">Signal energy</span><div class="energy-ring" style="--energy:${Math.round((this.correct/Math.max(1,this.index))*100)||0}%"><strong>${this.correct}/${this.index}</strong></div><p class="muted tiny">Respostas incorretas não retiram energia.</p></section>
        <section class="card flat"><span class="kicker">Ferramentas</span><div class="grid"><button class="btn secondary small" data-action="hint">◇ Mostrar pista</button><button class="btn secondary small" data-action="speak">▶ Ouvir</button><button class="btn ghost small" data-action="slow">◷ Ouvir devagar</button><button class="btn secondary small" data-action="pause">Ⅱ Pausar</button><button class="btn ghost small" data-action="skip">↷ Pular questão</button></div></section>
        <section class="card flat"><span class="kicker">Objetivo</span><p class="muted tiny">${esc(q.category||'English communication')}</p><p class="tiny">Use a pista, tente novamente e explique sua escolha para o grupo.</p></section>
      </aside>`;
      this.root.innerHTML=`<div class="game-shell">${board}${side}</div>`;
      this.bindGame(q);this.bindTools(q);
      const focus=this.root.querySelector('button,select'); if(focus) focus.focus({preventScroll:true});
    }
    gameHTML(q){
      if(q.type==='choice'){
        const opts=this.displayOptions(q);this.questionState.options=opts;
        return `<div class="choices">${opts.map((o,i)=>`<button class="choice" data-choice="${i}"><strong>${String.fromCharCode(65+i)}</strong> &nbsp; ${esc(o)}</button>`).join('')}</div>`;
      }
      if(q.type==='sentence'){
        const tokens=q.answer.map((word,i)=>({word,key:i+'-'+word})); const bank=shuffle(tokens);this.questionState.bank=bank;this.questionState.selected=[];
        return `<div class="sentence-zone" id="sentence-zone" aria-label="Sentence area"><span class="muted tiny empty-label">Select the words below.</span></div><div class="word-bank">${bank.map(t=>`<button class="word-chip" data-token="${esc(t.key)}">${esc(t.word)}</button>`).join('')}</div><button class="btn" data-action="check">Check sentence</button> <button class="btn ghost" data-action="clear">Clear</button>`;
      }
      if(q.type==='match'){
        const rights=shuffle(q.answer.map(p=>p[1])); this.questionState.matches={};
        return `<div class="match-column">${q.answer.map((pair,i)=>`<div class="field"><label for="match-${i}">${esc(pair[0])}</label><select id="match-${i}" data-match="${i}"><option value="">Choose…</option>${rights.map(r=>`<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select></div>`).join('')}</div><br><button class="btn" data-action="check">Check matches</button>`;
      }
      if(q.type==='order'){
        let items=shuffle(q.answer); if(same(items,q.answer)&&items.length>1) items=[...items.slice(1),items[0]]; this.questionState.order=items;
        return `<div class="timeline-list" id="timeline-list">${this.orderHTML(items)}</div><br><button class="btn" data-action="check">Check order</button>`;
      }
      if(q.type==='room') return this.roomHTML(q);
      return '<p>Challenge unavailable.</p>';
    }

    roomObject(q){
      const prompt=String(q.prompt||'').toLowerCase();
      const objects=[
        {match:'lamp',name:'lamp',icon:'💡'},
        {match:'shoes',name:'shoes',icon:'👟'},
        {match:'rug',name:'rug',icon:'▰'},
        {match:'key',name:'key',icon:'🔑'},
        {match:'pillow',name:'pillow',icon:'▱'},
        {match:'plant',name:'plant',icon:'🪴'}
      ];
      return objects.find(item=>prompt.includes(item.match))||{name:'object',icon:'◆'};
    }
    roomHTML(q){
      const object=this.roomObject(q);
      const zones=[
        {value:'next to the window',key:'window',letter:'A'},
        {value:'on the bed',key:'bed',letter:'B'},
        {value:'between the chairs',key:'chairs',letter:'C'},
        {value:'in front of the sofa',key:'sofa',letter:'D'},
        {value:'under the desk',key:'desk',letter:'E'},
        {value:'behind the door',key:'door',letter:'F'}
      ];
      this.questionState.options=zones.map(zone=>zone.value);
      this.questionState.roomObject=object;
      return `<div class="room-challenge">
        <div class="room-inventory">
          <div><span class="kicker">Object to move</span><p class="muted tiny">Drag it or tap one of the marked areas.</p></div>
          <button class="room-token" type="button" draggable="true" data-room-object aria-label="${esc(object.name)}. Drag to a marked area."><span class="room-object-icon" aria-hidden="true">${object.icon}</span><strong>${esc(object.name)}</strong></button>
        </div>
        <div class="room-scene" id="room-scene" aria-label="Interactive room with six marked positions">
          <div class="room-window furniture" aria-hidden="true"><span>window</span></div>
          <div class="room-bed furniture" aria-hidden="true"><span>bed</span></div>
          <div class="room-chair chair-one furniture" aria-hidden="true"><span>chair</span></div>
          <div class="room-chair chair-two furniture" aria-hidden="true"><span>chair</span></div>
          <div class="room-sofa furniture" aria-hidden="true"><span>sofa</span></div>
          <div class="room-desk furniture" aria-hidden="true"><span>desk</span></div>
          <div class="room-door furniture" aria-hidden="true"><span>door</span></div>
          ${zones.map((zone,i)=>`<button class="room-zone zone-${zone.key}" type="button" data-room-zone="${i}" aria-label="Option ${zone.letter}"><span>${zone.letter}</span></button>`).join('')}
        </div>
        <p class="room-help muted tiny">Tip: read the instruction, find the named furniture, then decide where the object belongs.</p>
      </div>`;
    }
    placeRoomObject(zone){
      this.root.querySelectorAll('[data-room-zone]').forEach(item=>item.classList.remove('selected','wrong','correct','drag-over'));
      this.root.querySelectorAll('.placed-room-object').forEach(item=>item.remove());
      zone.classList.add('selected');
      const object=this.questionState.roomObject||{icon:'◆',name:'object'};
      const placed=document.createElement('span');
      placed.className='placed-room-object';
      placed.setAttribute('aria-hidden','true');
      placed.textContent=object.icon;
      zone.appendChild(placed);
    }
    chooseRoomZone(zone){
      if(this.locked||this.paused)return;
      this.placeRoomObject(zone);
      const value=this.questionState.options[Number(zone.dataset.roomZone)];
      this.submit(value,zone);
    }

    orderHTML(items){return items.map((item,i)=>`<div class="timeline-item"><strong>${i+1}</strong><span>${esc(item)}</span><div class="timeline-actions"><button aria-label="Move up" data-move="up" data-index="${i}">↑</button><button aria-label="Move down" data-move="down" data-index="${i}">↓</button></div></div>`).join('')}
    bindGame(q){
      this.root.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{
        if(this.locked||this.paused)return; this.root.querySelectorAll('[data-choice]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');
        const value=this.questionState.options[Number(btn.dataset.choice)];this.submit(value,btn);
      }));
      this.root.querySelectorAll('[data-room-zone]').forEach(zone=>{
        zone.addEventListener('click',()=>this.chooseRoomZone(zone));
        zone.addEventListener('dragover',event=>{event.preventDefault();if(!this.locked&&!this.paused)zone.classList.add('drag-over')});
        zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
        zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('drag-over');this.chooseRoomZone(zone)});
      });
      const roomObject=this.root.querySelector('[data-room-object]');
      if(roomObject){
        roomObject.addEventListener('dragstart',event=>{event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain','room-object');roomObject.classList.add('dragging')});
        roomObject.addEventListener('dragend',()=>roomObject.classList.remove('dragging'));
        roomObject.addEventListener('click',()=>{if(this.locked||this.paused)return;roomObject.classList.toggle('armed')});
      }
      this.root.querySelectorAll('[data-token]').forEach(btn=>btn.addEventListener('click',()=>{
        if(this.locked||this.paused||btn.classList.contains('used'))return;btn.classList.add('used');
        const token=this.questionState.bank.find(t=>t.key===btn.dataset.token);this.questionState.selected.push(token);
        this.updateSentenceZone();
      }));
      this.root.querySelectorAll('[data-match]').forEach(sel=>sel.addEventListener('change',()=>this.questionState.matches[sel.dataset.match]=sel.value));
      this.bindOrderMoves();
      this.root.querySelectorAll('[data-action="check"]').forEach(btn=>btn.addEventListener('click',()=>{
        let response;
        if(q.type==='sentence') response=this.questionState.selected.map(t=>t.word);
        if(q.type==='match') response=q.answer.map((pair,i)=>[pair[0],this.questionState.matches[i]||'']);
        if(q.type==='order') response=this.questionState.order;
        this.submit(response,btn);
      }));
      const clear=this.root.querySelector('[data-action="clear"]'); if(clear) clear.addEventListener('click',()=>{this.questionState.selected=[];this.root.querySelectorAll('[data-token]').forEach(b=>b.classList.remove('used'));this.updateSentenceZone()});
    }

    bindOrderMoves(){
      this.root.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>{
        const i=Number(btn.dataset.index),dir=btn.dataset.move==='up'?-1:1,j=i+dir,arr=this.questionState.order;
        if(j<0||j>=arr.length)return;
        [arr[i],arr[j]]=[arr[j],arr[i]];
        const list=$('#timeline-list',this.root);if(list){list.innerHTML=this.orderHTML(arr);this.bindOrderMoves()}
      }));
    }
    updateSentenceZone(){
      const zone=$('#sentence-zone',this.root); if(!zone)return;
      zone.innerHTML=this.questionState.selected.length?this.questionState.selected.map((t,i)=>`<button class="word-chip" data-remove-token="${i}">${esc(t.word)}</button>`).join(''):'<span class="muted tiny empty-label">Select the words below.</span>';
      zone.querySelectorAll('[data-remove-token]').forEach(b=>b.addEventListener('click',()=>{
        const [removed]=this.questionState.selected.splice(Number(b.dataset.removeToken),1);const bankBtn=this.root.querySelector(`[data-token="${CSS.escape(removed.key)}"]`);if(bankBtn)bankBtn.classList.remove('used');this.updateSentenceZone();
      }));
    }
    bindTools(q){
      const hint=this.root.querySelector('[data-action="hint"]'); if(hint) hint.addEventListener('click',()=>this.showFeedback('support','Hint',q.hint));
      const speak=this.root.querySelector('[data-action="speak"]'); if(speak) speak.addEventListener('click',()=>{this.questionState.audioUsed=true;EQ.Audio.speak(q.prompt,false)});
      const slow=this.root.querySelector('[data-action="slow"]'); if(slow) slow.addEventListener('click',()=>{this.questionState.audioUsed=true;EQ.Audio.speak(q.prompt,true)});
      const pause=this.root.querySelector('[data-action="pause"]');if(pause)pause.addEventListener('click',()=>{this.paused=!this.paused;pause.textContent=this.paused?'▶ Continuar':'Ⅱ Pausar';this.showFeedback('support',this.paused?'Atividade pausada':'Atividade retomada',this.paused?'As respostas foram bloqueadas temporariamente.':'Você já pode continuar.')});
      const skip=this.root.querySelector('[data-action="skip"]');if(skip)skip.addEventListener('click',()=>{if(this.locked)return;EQ.Store.recordAnswer({sessionId:this.session.id,questionId:q.id,missionId:this.meta.missionId||null,grade:this.meta.grade,category:q.category,correct:false,response:'[skipped]',expected:q.answer,skipped:true,audioUsed:!!this.questionState.audioUsed,interactionType:q.type,attemptNumber:0});this.totalAttempts++;this.index++;this.render()});
    }
    isCorrect(q,response){
      if(q.type==='choice'||q.type==='room') return response===q.answer;
      return same(response,q.answer);
    }
    submit(response,source){
      const q=this.current(); if(this.locked||this.paused)return;
      if((q.type==='sentence'&&(!response||!response.length))||(q.type==='match'&&response.some(x=>!x[1]))) {this.showFeedback('support','Complete the challenge','Fill every available space before checking.');return}
      const correct=this.isCorrect(q,response);this.totalAttempts++;
      EQ.Store.recordAnswer({sessionId:this.session.id,questionId:q.id,missionId:this.meta.missionId||null,grade:this.meta.grade,category:q.category,correct,response,expected:q.answer,audioUsed:!!this.questionState.audioUsed,interactionType:q.type,attemptNumber:(this.questionState.attempts||0)+1});
      this.questionState.attempts=(this.questionState.attempts||0)+1;
      if(correct){
        this.locked=true;this.correct++;const bonus=this.questionState.attempts===1?100:70;this.score+=bonus;EQ.Audio.correct();if(source)source.classList.add('correct','correct-pop');
        this.showFeedback('success','Signal restored',q.explanation,`<button class="btn" data-next>Continue</button>`);const n=this.root.querySelector('[data-next]');if(n)n.addEventListener('click',()=>{this.index++;this.render()});
      }else{
        EQ.Audio.softError();if(source)source.classList.add('wrong','shake-soft');
        this.showFeedback('support','Try another route',`${q.hint}<br><span class="muted tiny">No energy was removed. You can try again.</span>`);
      }
    }
    showFeedback(type,title,text,extra){
      const area=$('#feedback-area',this.root); if(!area)return;area.innerHTML=`<div class="feedback ${type}"><strong>${esc(title)}</strong><p>${text||''}</p>${extra||''}</div>`;area.scrollIntoView({behavior:this.settings().reducedMotion?'auto':'smooth',block:'nearest'});
    }
    complete(){
      const accuracy=Math.round((this.correct/Math.max(1,this.questions.length))*100),elapsed=Math.round((Date.now()-this.started)/1000);
      const summary={score:this.score,accuracy,correct:this.correct,total:this.questions.length,attempts:this.totalAttempts,durationSeconds:elapsed};
      EQ.Store.finishSession(this.session.id,summary);EQ.Audio.unlock();this.onComplete(summary,this.session);
    }
  }
  EQ.Minigames={Runner,shuffle};
})();
