const Physics=(()=>{
 const tau=Math.PI*2
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))
 function eccentric(M,e){let E=M;for(let i=0;i<12;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E}
 function orbit(M,a=1,e=.45,mass=1){const E=eccentric(M,e),r=a*(1-e*Math.cos(E));return {E,r,x:a*(Math.cos(E)-e),y:a*Math.sqrt(1-e*e)*Math.sin(E),velocity:Math.sqrt(mass*(2/r-1/a)),period:tau*Math.sqrt(a*a*a/mass)}}
 function swept(M1,M2,a=1,e=.45){const E1=eccentric(M1,e),E2=eccentric(M2,e);return .5*a*a*Math.sqrt(1-e*e)*((E2-E1)-e*(Math.sin(E2)-Math.sin(E1)))}
 function ellipse(c,e=.5,phase=0,options={}){
  const width=c.width,height=c.height,g=c.getContext('2d'),cx=width*.5,cy=height*.48,a=Math.min(width*.31,height*.4),b=a*Math.sqrt(1-e*e),fx=cx+a*e
  g.clearRect(0,0,width,height)
  const bg=g.createRadialGradient(fx,cy,2,fx,cy,width*.7);bg.addColorStop(0,'#3f234742');bg.addColorStop(1,'#070411');g.fillStyle=bg;g.fillRect(0,0,width,height)
  g.lineWidth=2;g.strokeStyle='#8964b9';g.beginPath();g.ellipse(cx,cy,a,b,0,0,tau);g.stroke()
  g.strokeStyle='#9b81b944';g.setLineDash([4,7]);g.beginPath();g.moveTo(cx-a-15,cy);g.lineTo(cx+a+15,cy);g.stroke();g.setLineDash([])
  if(options.sectors){
   for(const [start,color] of [[0,'#facf5b55'],[Math.PI,'#89cfff55']]){
    g.fillStyle=color;g.beginPath();g.moveTo(fx,cy)
    for(let i=0;i<=40;i++){const E=eccentric(start+i*.012,e);g.lineTo(cx+a*Math.cos(E),cy+b*Math.sin(E))}g.closePath();g.fill()
   }
  }
  g.fillStyle='#a593bb';g.font='12px system-ui';g.textAlign='center';g.fillText('Afélio',cx-a,cy+b+30);g.fillText('Periélio',cx+a,cy+b+30)
  for(const x of [cx-a*e,fx]){g.fillStyle='#d4bafa';g.beginPath();g.arc(x,cy,3,0,tau);g.fill()}
  const sunX=options.sunX??fx,sunY=options.sunY??cy
  g.shadowColor='#ffca65';g.shadowBlur=18;g.fillStyle='#ffd476';g.beginPath();g.arc(sunX,sunY,12,0,tau);g.fill();g.shadowBlur=0
  if(!options.hidePlanet){const E=eccentric(phase,e),x=cx+a*Math.cos(E),y=cy+b*Math.sin(E);g.strokeStyle='#c6b0e060';g.beginPath();g.moveTo(fx,cy);g.lineTo(x,y);g.stroke();g.fillStyle='#99d9ff';g.beginPath();g.arc(x,y,8,0,tau);g.fill()}
  if(options.mark!==undefined){g.strokeStyle='#b9ffa8';g.lineWidth=3;g.beginPath();g.arc(options.mark,cy,18,0,tau);g.stroke()}
  g.textAlign='left'
  return {cx,cy,a,b,fx}
 }
 function renderChallenge(q,container,submit){
  container.innerHTML='';let state={value:1,choice:null,order:[3,1,2],sunX:320,sunY:163.2},answered=false
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=340;canvas.className='physics-canvas';canvas.setAttribute('aria-label','Simulação interativa da órbita');container.appendChild(canvas)
  const controls=document.createElement('div');controls.className='challenge-controls';container.appendChild(controls)
  const readout=document.createElement('p');readout.className='simulation-readout';container.appendChild(readout)
  const addButton=(text,fn)=>{const b=document.createElement('button');b.type='button';b.className='secondary-control';b.textContent=text;b.onclick=()=>{if(!answered)fn()};controls.appendChild(b);return b}
  const addSlider=(text,min,max,value,step=.1)=>{
   const label=document.createElement('label');label.textContent=text;const out=document.createElement('output');const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=step;input.value=value;label.append(input,out);controls.appendChild(label);state.value=Number(value);input.oninput=()=>{if(answered)return;state.value=Number(input.value);draw();out.textContent=state.value.toFixed(step<.1?2:1)};out.textContent=state.value;return input
  }
  function draw(){
   const e=q.kind==='eccentricity'?state.value:.55
   const geom=ellipse(canvas,e,Math.PI/3,{sunX:q.kind==='focus'?state.sunX:undefined,sunY:q.kind==='focus'?state.sunY:undefined,hidePlanet:q.kind==='focus',sectors:q.kind==='areas',mark:q.kind==='speed'&&state.choice!==null?(state.choice===0?456:184):undefined})
   if(['gravity','mass','period','escape'].includes(q.kind)){
    const g=canvas.getContext('2d');g.clearRect(0,0,640,340);g.fillStyle='#080412';g.fillRect(0,0,640,340)
    if(q.kind==='gravity'||q.kind==='mass'){
     const mass=q.kind==='mass'?state.value:1,r=q.kind==='gravity'?state.value:1,sx=98,px=220+r*68,cy=162,F=mass/(r*r)
     g.strokeStyle='#d3a4ff';g.lineWidth=Math.max(1,F*6);g.globalAlpha=Math.min(1,.25+F*.35);g.beginPath();g.moveTo(sx+26,cy);g.lineTo(px-20,cy);g.stroke();g.globalAlpha=1
     g.fillStyle='#ffd078';g.shadowColor='#ffcd69';g.shadowBlur=15;g.beginPath();g.arc(sx,cy,19*Math.sqrt(mass),0,tau);g.fill();g.shadowBlur=0;g.fillStyle='#a9dafa';g.beginPath();g.arc(px,cy,13,0,tau);g.fill()
     g.textAlign='center';g.fillStyle='#dcc9eb';g.font='14px system-ui';g.fillText(`M/M₀ = ${mass.toFixed(1)}`,sx,cy+65);g.fillText(`r/r₀ = ${r.toFixed(1)}`,(sx+px)/2,cy-38);g.fillText(`F/F₀ = ${F.toFixed(3)}`,320,290)
    }
    if(q.kind==='period'){
     const cx=320,cy=158,r=state.value*23;g.strokeStyle='#d4b0ff';g.lineWidth=2;g.beginPath();g.arc(cx,cy,r,0,tau);g.stroke();g.strokeStyle='#a593bc55';g.setLineDash([4,6]);g.beginPath();g.arc(cx,cy,23,0,tau);g.stroke();g.setLineDash([]);g.fillStyle='#ffd078';g.beginPath();g.arc(cx,cy,10,0,tau);g.fill();g.fillStyle='#a5d5f5';g.beginPath();g.arc(cx+r,cy,8,0,tau);g.fill();g.textAlign='center';g.font='14px system-ui';g.fillStyle='#dbc5ed';g.fillText(`T = ${Math.pow(state.value,1.5).toFixed(2)} anos`,320,321)
    }
    if(q.kind==='escape'){
     const ratio=state.value*state.value,ex=Math.abs(ratio-1),cx=265,cy=168,scale=67;g.strokeStyle=ratio>=2?'#ffd179':'#cea6f6';g.lineWidth=2;g.beginPath();let first=true
     for(let angle=-Math.PI*.82;angle<=Math.PI*.82;angle+=.012){const denom=1+(ratio>=1?ex:-ex)*Math.cos(angle);if(denom<.05)continue;const r=ratio/denom,px=cx+scale*r*Math.cos(angle),py=cy+scale*r*Math.sin(angle);if(first){g.moveTo(px,py);first=false}else g.lineTo(px,py)}g.stroke();g.fillStyle='#ffd078';g.beginPath();g.arc(cx,cy,13,0,tau);g.fill();g.textAlign='center';g.font='14px system-ui';g.fillStyle='#dbc5ed';g.fillText(ratio>=2?'Trajetória de escape':'Trajetória ligada',320,320)
    }
    g.textAlign='left'
   }
   if(q.kind==='focus')readout.textContent='Arraste o Sol dourado. Os pontos pequenos marcam os dois focos.'
   if(q.kind==='eccentricity')readout.textContent=`e = ${state.value.toFixed(2)} · círculo: 0 · elipse: 0 < e < 1`
   if(q.kind==='speed')readout.textContent='Compare posições da mesma órbita. Clique no periélio ou no afélio.'
   if(q.kind==='gravity')readout.textContent=`r/r₀ = ${state.value.toFixed(1)} · F/F₀ = ${(1/(state.value*state.value)).toFixed(3)}`
   if(q.kind==='mass')readout.textContent=`M/M₀ = ${state.value.toFixed(1)} · F/F₀ = ${state.value.toFixed(1)} (r fixo)`
   if(q.kind==='period')readout.textContent=`a = ${state.value.toFixed(1)} UA · T = ${Math.pow(state.value,1.5).toFixed(2)} anos · mesma estrela: 1 massa solar`
   if(q.kind==='escape')readout.textContent=`v = ${state.value.toFixed(2)} · G = M = r = 1 · sem atmosfera`
   if(q.kind==='areas')readout.textContent='Setores dourado e azul: mesmo Δt, arcos distintos. A área varrida é a mesma.'
   if(q.kind==='order')readout.textContent=`Ordem atual: ${state.order.map(v=>v+' UA').join(' → ')} · mesma massa central`
   return geom
  }
  if(q.kind==='focus'){
   state.sunY=163.2;let dragging=false
   const move=event=>{const r=canvas.getBoundingClientRect();state.sunX=clamp((event.clientX-r.left)*640/r.width,80,560);state.sunY=clamp((event.clientY-r.top)*340/r.height,25,315);draw()}
   canvas.onpointerdown=e=>{if(answered)return;dragging=true;canvas.setPointerCapture(e.pointerId);move(e)}
   canvas.onpointermove=e=>{if(dragging&&!answered)move(e)};canvas.onpointerup=()=>dragging=false
   addButton('Foco esquerdo',()=>{state.sunX=320-136*.55;state.sunY=163.2;draw()});addButton('Centro',()=>{state.sunX=320;state.sunY=163.2;draw()});addButton('Foco direito',()=>{state.sunX=320+136*.55;state.sunY=163.2;draw()})
  }
  if(q.kind==='speed'){
   const choose=n=>{state.choice=n;draw()};addButton('Periélio',()=>choose(0));addButton('Afélio',()=>choose(1));canvas.onclick=e=>{if(answered)return;const r=canvas.getBoundingClientRect();choose((e.clientX-r.left)/r.width>.5?0:1)}
  }
  if(q.kind==='eccentricity')addSlider('Excentricidade',0,.85,.2,.01)
  if(q.kind==='gravity')addSlider('Distância relativa',1,4,1,.1)
  if(q.kind==='mass')addSlider('Massa relativa',1,4,1,.1)
  if(q.kind==='period')addSlider('Semieixo maior (UA)',1,6,1,.1)
  if(q.kind==='escape')addSlider('Velocidade inicial',.5,2.5,1,.01)
  if(q.kind==='areas'){addButton('Áreas iguais',()=>{state.choice=0;readout.textContent='Selecionado: áreas iguais em tempos iguais.'});addButton('Distâncias iguais',()=>{state.choice=1;readout.textContent='Selecionado: distâncias iguais em tempos iguais.'})}
  if(q.kind==='order'){
   const refresh=()=>{controls.querySelectorAll('.order-piece').forEach(b=>b.remove());state.order.forEach((v,i)=>{const b=addButton(v+' UA  ↔',()=>{const next=(i+1)%3;[state.order[i],state.order[next]]=[state.order[next],state.order[i]];refresh();draw()});b.classList.add('order-piece')})};refresh()
  }
  const check=document.createElement('button');check.type='button';check.className='primary-btn wide';check.textContent='Confirmar configuração';container.appendChild(check)
  check.onclick=()=>{
   if(answered)return
   let correct=false
   if(q.kind==='focus')correct=Math.min(Math.hypot(state.sunX-(320-136*.55),state.sunY-163.2),Math.hypot(state.sunX-(320+136*.55),state.sunY-163.2))<20
   if(['speed','areas'].includes(q.kind)){if(state.choice===null){readout.textContent='Escolha uma posição ou relação antes de confirmar.';return}correct=state.choice===0}
   if(q.kind==='eccentricity')correct=Math.abs(state.value-q.target)<.025
   if(q.kind==='gravity')correct=Math.abs(1/(state.value*state.value)-q.target)<.018
   if(q.kind==='mass')correct=Math.abs(state.value-q.target)<.06
   if(q.kind==='period')correct=Math.abs(Math.pow(state.value,1.5)-q.target)<.15
   if(q.kind==='escape')correct=Math.abs(state.value-q.target)<.035
   if(q.kind==='order')correct=state.order.join(',')==='1,2,3'
   // Captura a configuração que o aluno realmente selecionou ANTES de mostrar a correção.
   const selection={kind:q.kind,label:q.kind==='focus'?`Sol em x=${Math.round(state.sunX)}, y=${Math.round(state.sunY)}`:q.kind==='order'?`Ordem: ${state.order.join(' → ')} UA`:q.kind==='speed'?({0:'Periélio',1:'Afélio'})[state.choice]||'Sem seleção':q.kind==='areas'?({0:'Áreas iguais',1:'Distâncias iguais'})[state.choice]||'Sem seleção':`${Number(state.value).toLocaleString('pt-BR',{maximumFractionDigits:2})} · ${q.kind}`};
   answered=true;controls.querySelectorAll('button,input').forEach(b=>b.disabled=true);check.disabled=true
   if(!correct){
    if(q.kind==='focus'){state.sunX=320+136*.55;state.sunY=163.2}
    if(q.kind==='speed'||q.kind==='areas')state.choice=0
    if(q.kind==='eccentricity'||q.kind==='mass'||q.kind==='escape')state.value=q.target
    if(q.kind==='gravity')state.value=2
    if(q.kind==='period')state.value=4
    if(q.kind==='order')state.order=[1,2,3]
    draw();readout.textContent+=' · configuração correta mostrada acima'
   }
   submit(correct,selection)
  }
  draw()
 }
 let labCanvas=null,labMode='ellipse',time=0,labReady=false
 function labSetup(){
  if(labReady)return;labReady=true
  const card=document.querySelector('.lab-card');card.classList.add('expanded-lab')
  const extra=document.createElement('div');extra.innerHTML=`<div class="lab-tabs"><button data-mode="ellipse">Elipse</button><button data-mode="areas">Áreas</button><button data-mode="periods">Períodos</button><button data-mode="escape">Escape</button></div><canvas id="orbitCanvas" width="680" height="360" class="physics-canvas" aria-label="Simulação das leis orbitais"></canvas><div class="lab-controls orbit-controls"><label>Semieixo maior (UA)<input id="axisSlider" type="range" min="0.5" max="4" step="0.1" value="1.5"></label><label>Excentricidade<input id="eccSlider" type="range" min="0" max="0.85" step="0.01" value="0.5"></label><label>Massa central (M☉)<input id="centralSlider" type="range" min="0.5" max="4" step="0.1" value="1"></label><label>Velocidade inicial (× circular)<input id="velocitySlider" type="range" min="0.5" max="1.7" step="0.01" value="1"></label></div><div id="orbitReadout" class="simulation-readout"></div><div class="lab-puzzle"><strong id="puzzleTitle"></strong><button id="applyOrbitBtn" class="primary-btn">Aplicar à missão</button><p id="puzzleFeedback"></p></div><small class="scientific-note">Combate: rotas e efeitos simplificados. Simulação: aproximação kepleriana de dois corpos, massa do planeta desprezível. Escape: modelo newtoniano ideal.</small>`
  card.appendChild(extra);labCanvas=document.getElementById('orbitCanvas')
  extra.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{labMode=b.dataset.mode;extra.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('active',x===b))})
  document.getElementById('applyOrbitBtn').onclick=applyPuzzle
 }
 function labOpen(){labSetup();const puzzle=typeof waves!=='undefined'?waves[waveIndex]?.puzzle:null;document.querySelector('.lab-puzzle').style.display=puzzle?'block':'none';document.getElementById('puzzleTitle').textContent=({ellipse:'Missão: elipse com e entre 0,50 e 0,70.',speed:'Missão: órbita excêntrica com e entre 0,60 e 0,80.',gravity:'Missão: distância 2× a referência; massas fixas.',escape:'Missão: velocidade inicial entre 1,41× e 1,45× a circular.',stable:'Missão: órbita quase circular, e ≤ 0,15 e velocidade circular.'})[puzzle]||''}
 function applyPuzzle(){
  if(typeof running==='undefined'||running){document.getElementById('puzzleFeedback').textContent='Aplique uma configuração durante a preparação.';return}
  const e=Number(document.getElementById('eccSlider').value),v=Number(document.getElementById('velocitySlider').value),r=Number(document.getElementById('distanceSlider').value),p=waves[waveIndex]?.puzzle
  const ok=p==='ellipse'?e>=.5&&e<=.7:p==='speed'?e>=.6&&e<=.8:p==='gravity'?r===10&&Number(document.getElementById('massSlider').value)===5:p==='escape'?v>=1.41&&v<=1.45:p==='stable'?e<=.15&&Math.abs(v-1)<.03:false
  if(!ok){document.getElementById('puzzleFeedback').textContent=p==='gravity'?'A referência do laboratório é r = 5. Dobre para r = 10.':'Ajuste os controles para atingir a configuração da missão.';return}
  orbitConfig={e,v,bonus:true};for(const d of defenders)d.y=curveY(d.lane,d.x);const save=Progress.data;const achievement='orbit-'+waveIndex;if(!save.achievements.includes(achievement)){save.achievements.push(achievement);Progress.earn(3)};document.getElementById('puzzleFeedback').textContent='Configuração aplicada: +10% de dano nesta missão. Primeira solução: +3 pesquisa.';AudioSystem.play('correct');if(typeof saveRun==='function')saveRun()
 }
 function tick(dt){
  if(!labReady||document.getElementById('labModal').classList.contains('hidden'))return
  time+=dt;const a=Number(document.getElementById('axisSlider').value),e=Number(document.getElementById('eccSlider').value),M=Number(document.getElementById('centralSlider').value),v=Number(document.getElementById('velocitySlider').value),n=Math.sqrt(M/(a*a*a)),p=orbit(time*n,a,e,M)
  ellipse(labCanvas,e,time*n,{sectors:labMode==='areas'})
  const out=document.getElementById('orbitReadout')
  out.textContent=`a = ${a.toFixed(1)} UA · e = ${e.toFixed(2)} · T = ${Math.sqrt(a*a*a/M).toFixed(2)} anos · r = ${p.r.toFixed(2)} UA · v/v₀ = ${p.velocity.toFixed(2)}`
  if(labMode==='periods'){
   const g=labCanvas.getContext('2d');g.clearRect(0,0,680,360);g.fillStyle='#080512';g.fillRect(0,0,680,360)
   for(let i=0;i<3;i++){const radius=[1,2,3][i],x=115+i*225,y=132;g.strokeStyle='#7a5c9e';g.beginPath();g.arc(x,y,68,0,tau);g.stroke();const angle=time*Math.sqrt(M/(radius**3));g.fillStyle='#ffc66a';g.beginPath();g.arc(x,y,10,0,tau);g.fill();g.fillStyle='#9cceff';g.beginPath();g.arc(x+68*Math.cos(angle),y+68*Math.sin(angle),7,0,tau);g.fill();g.textAlign='center';g.fillStyle='#e1d2f9';g.font='13px system-ui';g.fillText(`${radius} UA · ${Math.sqrt(radius**3/M).toFixed(2)} anos`,x,240)}g.textAlign='left'
   out.textContent='Órbitas circulares, mesma massa central: T²/a³ = constante. A representação não usa a mesma escala de raio.'
  }
  if(labMode==='escape'){
   const g=labCanvas.getContext('2d'),ratio=v*v,orbitalE=Math.abs(ratio-1),bound=ratio<2
   g.clearRect(0,0,680,360);g.fillStyle='#080512';g.fillRect(0,0,680,360);const cx=260,cy=140,scale=75
   g.strokeStyle=bound?'#ba99ff':'#ffca77';g.lineWidth=2;g.beginPath()
   for(let t=-Math.PI*.78;t<=Math.PI*.78;t+=.012){const denom=1+(ratio>=1?orbitalE:-orbitalE)*Math.cos(t);if(denom<=.08)continue;const radius=ratio/denom,px=cx+radius*scale*Math.cos(t),py=cy+radius*scale*Math.sin(t);if(t===-Math.PI*.78)g.moveTo(px,py);else g.lineTo(px,py)}g.stroke();g.fillStyle='#ffd168';g.beginPath();g.arc(cx,cy,12,0,tau);g.fill();out.textContent=`v/v circular = ${v.toFixed(2)} · limite ideal √2 ≈ 1,414 · ${bound?'trajetória ligada (elíptica)':'trajetória de escape'} · lançamento tangencial a r = 1`
  }
 }
 return {orbit,eccentric,swept,ellipse,renderChallenge,labOpen,tick}
})()
