(function(){
 const C=window.ChemCore=window.ChemCore||{},U=C.Utils;
 class ChallengeUI{
  constructor(app,audio){this.app=app;this.audio=audio;this.modal=null;this.challenge=null;this.state={};this.metrics=null}
  open(challenge,opts={}){this.close(false);this.challenge=challenge;this.opts=opts;this.metrics={attempts:0,hints:0,errors:0};this.state=this.initialState(challenge);this.render()}
  initialState(ch){const d=ch.data||{};switch(ch.type){
   case'sequence':case'order':case'environment':return{order:U.shuffle(d.items||[],U.seeded(U.hash(ch.title).split('').reduce((a,c)=>a+c.charCodeAt(0),0)))};
   case'classify':return{values:Object.fromEntries((d.items||[]).map(x=>[x[0],d.categories[0]]))};
   case'evidence':return{selected:new Set()};
   case'particles':return{values:(d.controls||[]).map(x=>x[3]??Math.round((x[1]+x[2])/2))};
   case'matching':return{values:Object.fromEntries((d.pairs||[]).map(x=>[x[0],d.options[0]]))};
   case'atom':return{values:(d.values||[]).map(x=>x[3]??x[1])};
   case'formula':return{formula:''};
   case'balance':return{values:(d.species||[]).map(()=>1)};
   case'mass':case'stoich':case'dilution':case'gas':case'ph':case'halfLife':return{value:d.min??0};
   case'sliders':return{values:(d.controls||[]).map(x=>x[1])};
   case'choice':case'energy':return{choice:null};
   case'solution':return{solute:d.solute[0],volume:d.volume[0]};
   case'equilibrium':return{values:(d.controls||[]).map(x=>x[1])};
   case'redox':case'organic':return{values:(d.fields||[]).map(x=>x[1][0])};
   default:return{};
  }}
  render(){const ch=this.challenge,accent=this.opts.accent||'#27e4ff';const wrap=document.createElement('div');wrap.className='modal-backdrop';wrap.innerHTML=`<section class="modal" role="dialog" aria-modal="true" aria-labelledby="challenge-title" style="--accent:${accent}">
   <header class="modal-header"><div><p class="eyebrow">Terminal científico</p><h2 id="challenge-title">${U.escape(ch.title)}</h2></div><button class="btn icon ghost" data-close aria-label="Fechar desafio">×</button></header>
   <div class="modal-body"><div class="challenge-intro"><div class="challenge-icon">${this.icon(ch.type)}</div><div><h3>${U.escape(ch.instruction)}</h3><p>Analise o sistema, ajuste as variáveis e valide sua solução. A tentativa incorreta produz feedback científico, não punição.</p></div></div><div class="challenge-zone" data-zone></div><div class="feedback" data-feedback hidden></div></div>
   <footer class="modal-footer"><button class="btn ghost" data-hint ${this.opts.projectMode||this.opts.guided===false?'hidden':''}>Solicitar indício</button><button class="btn primary" data-check>Validar sistema</button></footer></section>`;
   document.body.appendChild(wrap);this.modal=wrap;this.zone=wrap.querySelector('[data-zone]');this.feedback=wrap.querySelector('[data-feedback]');this.drawZone();
   wrap.querySelector('[data-close]').onclick=()=>this.close(true);wrap.addEventListener('click',e=>{if(e.target===wrap&&this.opts.allowBackdropClose)this.close(true)});wrap.querySelector('[data-hint]').onclick=()=>this.showHint();wrap.querySelector('[data-check]').onclick=()=>this.check();
   requestAnimationFrame(()=>wrap.querySelector('button')?.focus())
  }
  icon(type){return({sequence:'⇅',order:'↕',environment:'⌁',classify:'≡',evidence:'◈',particles:'∴',matching:'↔',atom:'Z',formula:'∑',balance:'⇌',mass:'g',stoich:'mol',sliders:'∆',choice:'?',energy:'ΔH',solution:'C',dilution:'V',gas:'PV',equilibrium:'K',ph:'pH',redox:'e⁻',organic:'C',halfLife:'½'}[type]||'◇')}
  drawZone(){const ch=this.challenge,d=ch.data||{},s=this.state;switch(ch.type){
   case'sequence':case'order':case'environment':this.zone.innerHTML=`<div class="order-list">${s.order.map((item,i)=>`<div class="order-item" data-index="${i}"><b>${i+1}</b><span>${U.escape(item[1])}</span><div class="order-actions"><button data-up aria-label="Mover para cima">↑</button><button data-down aria-label="Mover para baixo">↓</button></div></div>`).join('')}</div>`;this.zone.querySelectorAll('[data-up]').forEach((b,i)=>b.onclick=()=>this.move(i,-1));this.zone.querySelectorAll('[data-down]').forEach((b,i)=>b.onclick=()=>this.move(i,1));break;
   case'classify':this.zone.innerHTML=(d.items||[]).map(it=>`<label class="control-row"><span>${U.escape(it[1])}</span><select class="select" data-id="${it[0]}">${d.categories.map(c=>`<option ${s.values[it[0]]===c?'selected':''}>${U.escape(c)}</option>`).join('')}</select><output>${U.escape(s.values[it[0]])}</output></label>`).join('');this.zone.querySelectorAll('select').forEach(sel=>sel.onchange=()=>{s.values[sel.dataset.id]=sel.value;sel.nextElementSibling.textContent=sel.value});break;
   case'evidence':this.zone.innerHTML=`<div class="choice-grid">${d.items.map((x,i)=>`<button class="choice-card ${s.selected.has(i)?'selected':''}" data-i="${i}">${U.escape(x)}</button>`).join('')}</div>`;this.zone.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;s.selected.has(i)?s.selected.delete(i):s.selected.add(i);this.drawZone()});break;
   case'particles':this.zone.innerHTML=(d.controls||[]).map((x,i)=>this.rangeRow(x[0],x[1],x[2],x[4]||1,s.values[i],i,'')).join('')+`<div class="mini-chart">${s.values.map((v,i)=>`<i style="height:${Math.max(8,v)}%"><span>${U.escape(d.controls[i][0])}</span></i>`).join('')}</div>`;this.bindRanges(v=>{s.values[v.i]=v.value;this.drawZone()});break;
   case'matching':this.zone.innerHTML=`<div class="pair-grid">${d.pairs.map(p=>`<label><span>${U.escape(p[0])}</span><select data-key="${U.escape(p[0])}">${d.options.map(o=>`<option ${s.values[p[0]]===o?'selected':''}>${U.escape(o)}</option>`).join('')}</select></label>`).join('')}</div>`;this.zone.querySelectorAll('select').forEach(sel=>sel.onchange=()=>s.values[sel.dataset.key]=sel.value);break;
   case'atom':this.zone.innerHTML=`<div class="formula-display">Alvo: ${U.chemicalHTML(d.target)}</div>${d.values.map((x,i)=>`<div class="control-row"><label>${U.escape(x[0])}</label><div class="stepper"><button data-dec="${i}">−</button><strong>${s.values[i]}</strong><button data-inc="${i}">+</button></div><output>${i===0?'Z':i===1?'n':'e⁻'}</output></div>`).join('')}`;this.zone.querySelectorAll('[data-dec]').forEach(b=>b.onclick=()=>{const i=+b.dataset.dec;s.values[i]=U.clamp(s.values[i]-1,d.values[i][1],d.values[i][2]);this.drawZone()});this.zone.querySelectorAll('[data-inc]').forEach(b=>b.onclick=()=>{const i=+b.dataset.inc;s.values[i]=U.clamp(s.values[i]+1,d.values[i][1],d.values[i][2]);this.drawZone()});break;
   case'formula':this.zone.innerHTML=`<div class="formula-display">${s.formula?U.chemicalHTML(s.formula):'<span style="color:var(--muted)">Selecione os blocos…</span>'}</div><div class="formula-builder" style="margin-top:14px">${d.tokens.map((t,i)=>`<button class="formula-token" data-token="${i}">${U.chemicalHTML(t)}</button>`).join('')}<button class="btn danger small" data-clear>Limpar</button></div>`;this.zone.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{if(s.formula.length<(d.max||10)*4)s.formula+=d.tokens[+b.dataset.token];this.drawZone()});this.zone.querySelector('[data-clear]').onclick=()=>{s.formula='';this.drawZone()};break;
   case'balance':this.zone.innerHTML=`<div class="coefficient-grid">${d.species.map((sp,i)=>`${i&&d.sides[i]!==d.sides[i-1]?'<b>→</b>':i?'<b>+</b>':''}<input type="number" min="1" max="${d.max||12}" value="${s.values[i]}" data-coeff="${i}" aria-label="Coeficiente de ${sp}"><span>${U.chemicalHTML(sp)}</span>`).join('')}</div><p style="color:var(--muted)">Use os menores coeficientes inteiros possíveis. Não altere os índices das fórmulas.</p>`;this.zone.querySelectorAll('[data-coeff]').forEach(i=>i.oninput=()=>s.values[+i.dataset.coeff]=+i.value);break;
   case'mass':case'stoich':case'dilution':case'gas':case'ph':case'halfLife':this.zone.innerHTML=this.rangeRow(ch.title,d.min,d.max,d.step||1,s.value,0,d.unit||'');this.bindRanges(v=>{s.value=v.value;this.zone.querySelector('output').textContent=`${this.pretty(v.value)} ${d.unit||''}`});break;
   case'sliders':this.zone.innerHTML=(d.controls||[]).map((x,i)=>this.rangeRow(x[0],x[1],x[2],x[3]||1,s.values[i],i,x[4]||'')).join('')+`<div class="feedback">Resultado calculado: <strong data-calc>${this.pretty(this.calcSlider(ch))}</strong></div>`;this.bindRanges(v=>{s.values[v.i]=v.value;this.zone.querySelector(`[data-range="${v.i}"]`).nextElementSibling.textContent=`${this.pretty(v.value)} ${(d.controls[v.i][4]||'')}`;this.zone.querySelector('[data-calc]').textContent=this.pretty(this.calcSlider(ch))});break;
   case'choice':case'energy':this.zone.innerHTML=`<div class="choice-grid">${d.options.map((o,i)=>`<button class="choice-card ${s.choice===i?'selected':''}" data-choice="${i}">${U.escape(o)}</button>`).join('')}</div>`;this.zone.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{s.choice=+b.dataset.choice;this.drawZone()});break;
   case'solution':{const c=s.volume? s.solute/s.volume:0;this.zone.innerHTML=this.rangeRow('Quantidade de soluto',d.solute[0],d.solute[1],d.solute[2],s.solute,0,'mol')+this.rangeRow('Volume final',d.volume[0],d.volume[1],d.volume[2],s.volume,1,'L')+`<div class="feedback">C = <strong data-calc>${this.pretty(c)}</strong> mol·L⁻¹</div>`;this.bindRanges(v=>{if(v.i===0)s.solute=v.value;else s.volume=v.value;this.drawZone()});break}
   case'equilibrium':this.zone.innerHTML=(d.controls||[]).map((x,i)=>`<label class="control-row"><span>${U.escape(x[0])}</span><select class="select" data-eq="${i}"><option ${s.values[i]===x[1]?'selected':''}>${U.escape(x[1])}</option><option ${s.values[i]===x[2]?'selected':''}>${U.escape(x[2])}</option></select><output>${U.escape(s.values[i])}</output></label>`).join('');this.zone.querySelectorAll('[data-eq]').forEach(sel=>sel.onchange=()=>{s.values[+sel.dataset.eq]=sel.value;sel.nextElementSibling.textContent=sel.value});break;
   case'redox':case'organic':this.zone.innerHTML=(d.fields||[]).map((x,i)=>`<label class="control-row"><span>${U.escape(x[0])}</span><select class="select" data-field="${i}">${x[1].map(o=>`<option ${s.values[i]===o?'selected':''}>${U.escape(o)}</option>`).join('')}</select><output>${U.escape(s.values[i])}</output></label>`).join('');this.zone.querySelectorAll('[data-field]').forEach(sel=>sel.onchange=()=>{s.values[+sel.dataset.field]=sel.value;sel.nextElementSibling.textContent=sel.value});break;
   default:this.zone.innerHTML='<p>Interação científica indisponível.</p>'
  }}
  rangeRow(label,min,max,step,value,i,unit){return`<label class="control-row"><span>${U.escape(label)}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-range="${i}"><output>${this.pretty(value)} ${U.escape(unit)}</output></label>`}
  bindRanges(cb){this.zone.querySelectorAll('[data-range]').forEach(r=>r.oninput=()=>cb({i:+r.dataset.range,value:+r.value}))}
  move(i,dir){const j=i+dir;if(j<0||j>=this.state.order.length)return;[this.state.order[i],this.state.order[j]]=[this.state.order[j],this.state.order[i]];this.drawZone()}
  calcSlider(ch){const v=this.state.values,d=ch.data;if(d.formula==='n=m/18')return v[0]/18;return v[0]||0}
  pretty(n){return Number.isInteger(+n)?String(+n):Number(n).toLocaleString('pt-BR',{maximumFractionDigits:3})}
  validate(){const ch=this.challenge,d=ch.data||{},s=this.state,eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);switch(ch.type){
   case'sequence':case'order':case'environment':return eq(s.order.map(x=>x[0]),ch.answer);
   case'classify':return Object.entries(ch.answer).every(([k,v])=>s.values[k]===v);
   case'evidence':return eq([...s.selected].sort((a,b)=>a-b),[...(d.required||[])].sort((a,b)=>a-b));
   case'particles':return s.values.every((v,i)=>Math.abs(v-d.target[i])<=(d.tolerance||10));
   case'matching':return d.pairs.every(p=>s.values[p[0]]===p[1]);
   case'atom':return eq(s.values,ch.answer);
   case'formula':return s.formula===ch.answer;
   case'balance':return eq(s.values,ch.answer);
   case'mass':case'stoich':case'dilution':case'gas':case'ph':case'halfLife':return Math.abs(s.value-(d.target??ch.answer))<=(d.tolerance??0.001);
   case'sliders':return Math.abs(this.calcSlider(ch)-d.target)<=(d.tolerance||.01);
   case'choice':case'energy':return s.choice===ch.answer;
   case'solution':return Math.abs(s.solute/s.volume-d.target)<=(d.tolerance||.01);
   case'equilibrium':return eq(s.values,d.target);
   case'redox':case'organic':return eq(s.values,d.target);
   default:return false
  }}
  showHint(){this.metrics.hints++;this.audio?.sfx('terminal');this.feedback.hidden=false;this.feedback.className='feedback';this.feedback.textContent=this.challenge.hint||'Observe as unidades, as condições e o que deve permanecer conservado.'}
  check(){this.metrics.attempts++;const ok=this.validate();this.feedback.hidden=false;if(ok){this.audio?.sfx('success');this.feedback.className='feedback success';this.feedback.textContent=this.challenge.feedback||'Sistema estabilizado.';this.modal.querySelector('[data-check]').disabled=true;setTimeout(()=>{const metrics={...this.metrics,accuracy:1/this.metrics.attempts};const cb=this.opts.onSuccess;this.close(false);cb?.(metrics)},650)}else{this.metrics.errors++;this.audio?.sfx('error');this.feedback.className='feedback error';this.feedback.innerHTML=this.opts.projectMode?'<strong>O sistema ainda não fecha.</strong> Registre a hipótese da turma e compare as evidências antes de uma nova tentativa.':`<strong>O sistema ainda não fecha.</strong> ${U.escape(this.challenge.hint||'Revise a relação entre as variáveis e tente novamente.')}`}}
  close(notify=true){if(this.modal){this.modal.remove();this.modal=null}if(notify)this.opts?.onClose?.(this.metrics)}
 }
 C.ChallengeUI=ChallengeUI;
})();
