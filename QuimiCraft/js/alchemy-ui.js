"use strict";

globalThis.QuimiCraftAlchemyUI = (() => {
  const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const statusNames={available:"Disponível",active:"Em investigação",ready:"Pronta para entregar",complete:"Concluída"};
  function create({panel,progress,openModal,closeModal,itemName,itemIcon,count,exchange,glassId,bottleYield,toast,feedback,remember}){
    const {studies,potions,sampleId}=QuimiCraftAlchemy;
    const byId=id=>panel.querySelector("#"+id);
    const body=byId("alchemyBody"),title=byId("alchemyTitle");
    let site=null,activeTab="",mode="",message="";
    const drafts=new Map();

    byId("alchemyClose").onclick=()=>close();
    function open(next,tab="talk"){
      site=next;
      remember(site);
      progress.visit(site);
      mode=tab==="brew"?"brew":tab==="talk"?"talk":"study";
      activeTab=site.config.studies.includes(tab)?tab:site.config.studies[0];
      title.textContent=site.config.title;
      message="";
      render();
      openModal(panel.id);
      byId("alchemyClose").focus();
    }
    function close(resume=true){
      drafts.clear();
      site=null;
      closeModal(panel.id,resume);
    }
    function refreshNote(text){
      message=text;
      const out=byId("alchemyMessage");
      if(out)out.textContent=text;
      toast(text);
    }
    function runAction(action,success){
      if(!action.ok){refreshNote(action.message||"Não foi possível concluir.");return;}
      message=success;
      render();
      feedback("success");
      const out=byId("alchemyMessage");
      if(out)out.focus();
    }
    function itemList(items){
      return items.map(([id,n])=>`<li>${itemIcon(id)}<span>${n} × ${escape(itemName(id))}</span><small>${count(id)} na mochila</small></li>`).join("");
    }
    function mission(id,showStudy){
      const study=studies[id],state=progress.missionStatus(id);
      return `<article class="alchemy-quest">
        <span class="alchemy-status">${statusNames[state]}</span>
        <h3>${study.title}</h3><p>${study.objective}</p>
        <div class="alchemy-actions">
        ${state==="available"?`<button data-accept="${id}">Aceitar missão secundária</button>`:""}
        ${state==="ready"?`<button data-claim="${id}">Entregar amostra e resultados</button>`:""}
        ${showStudy?`<button class="secondary" data-study="${id}">Abrir bancada</button>`:""}
        </div>
      </article>`;
    }
    function expedition(){
      const state=progress.state.expedition;
      if(progress.completedCount()<3&&!state.status)return "";
      const fields=[["warmth","Use a Brasa de Bolso em um bioma frio."],["air","Mergulhe com o Sopro do Delta ativo."],["survey","Marque um minério exposto com Olho de Minério."]];
      return `<article class="alchemy-quest">
        <span class="alchemy-status">${statusNames[state.status||"available"]}</span>
        <h3>Expedição de Três Frascos</h3>
        <ul class="alchemy-checks">${fields.map(([kind,text])=>`<li>${state[kind]?"✓":"○"} ${text}</li>`).join("")}</ul>
        ${!state.status?'<button id="alchemyExpeditionAccept">Aceitar missão secundária</button>':state.status==="ready"?'<button id="alchemyExpeditionClaim">Entregar registros de campo</button>':""}
      </article>`;
    }
    function conversation(){
      return `<div class="alchemy-guide"><b>${site.config.person}</b><p>${site.config.talk}</p>
        <small>O posto de coleta fica do lado de fora. A bancada de poções e os instrumentos ficam no interior.</small>
      </div><div class="alchemy-quests">${site.config.studies.map(id=>mission(id,true)).join("")}${expedition()}</div>`;
    }
    function experiment(){
      const id=activeTab,study=studies[id],history=progress.state.trials[id]||[];
      const draft=drafts.get(id)||{inputs:history.at(-1)?.values||[],hypothesis:""};
      const sample=sampleId(site.kind),available=count(sample)>0;
      const controls=study.controls.map((c,i)=>{
        const label=escape(c.label),value=escape(draft.inputs[i]??c.value);
        const input=c.options
          ? `<select name="control${i}">${c.options.map(([key,text])=>`<option value="${escape(key)}"${key===value?" selected":""}>${escape(text)}</option>`).join("")}</select>`
          : `<div class="alchemy-range"><input name="control${i}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${value}"><output>${value}</output></div>`;
        return `<label>${label}${input}</label>`;
      }).join("");
      const results=history.map((result,i)=>`<article class="alchemy-result">
        <h4>${history.length===2&&i===0?"Tentativa anterior":"Última tentativa"} <span class="alchemy-status">${result.ok?"Meta atingida":"Compare os resultados"}</span></h4>
        ${result.color?`<span class="alchemy-swatch" style="--sample-color:${result.color}" aria-hidden="true"></span>`:""}
        ${id==="cell"?`<div class="alchemy-circuit ${result.ok?"lit":""}" aria-hidden="true"><i></i><i></i><i></i></div>`:""}
        <dl>${result.metrics.map(([label,value])=>`<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("")}</dl>
        <p>${escape(result.conclusion)}</p>
      </article>`).join("");
      return `${mission(id,false)}
        <form id="alchemyExperiment">
          <div class="alchemy-sample">${itemIcon(sample)} <span>${escape(itemName(sample))}</span><b>${available?"Na mochila":"Colete fora da oficina"}</b></div>
          <label>O que você espera observar?<input name="hypothesis" maxlength="140" value="${escape(draft.hypothesis)}" required></label>
          <div class="alchemy-controls">${controls}</div>
          <button type="submit"${available?"":" disabled"}>Executar experimento</button>
        </form>
        <div class="alchemy-results">${results}</div>`;
    }
    function brewing(){
      const catalog=Object.entries(potions).filter(([,p])=>studies[p.study].specialty===site.kind);
      return `<div class="alchemy-guide"><p>As poções têm efeitos fictícios de jogo. Um frasco vazio retorna à sua mochila depois do uso.</p>
        <button class="secondary" id="alchemyBottle">Moldar ${bottleYield()} frascos com 1 vidro</button></div>`
        +catalog.map(([id,p])=>`<article class="alchemy-quest">
          <h3 class="alchemy-item-name">${itemIcon(id)}${p.name}</h3><p>${p.help}</p>
          <ul class="alchemy-ingredients">${itemList(progress.formula(id))}</ul>
          <button data-brew="${id}" ${progress.missionStatus(p.study)==="complete"?"":"disabled"}>${progress.missionStatus(p.study)==="complete"?"Preparar poção":"Desbloqueie em "+studies[p.study].title}</button>
        </article>`).join("");
    }
    function render(){
      panel.style.setProperty("--alchemy-accent",site.config.color);
      body.innerHTML=`<nav class="alchemy-tabs" aria-label="Seções da oficina">
        <button type="button" class="secondary" data-pane="talk" aria-pressed="${mode==="talk"}">Alquimista</button>
        ${site.config.studies.map(id=>`<button type="button" class="secondary" data-study="${id}" aria-pressed="${mode==="study"&&id===activeTab}">${studies[id].procedure}</button>`).join("")}
        <button type="button" class="secondary" data-pane="brew" aria-pressed="${mode==="brew"}">Poções</button>
      </nav>
      <p class="alchemy-message" role="status" tabindex="-1" id="alchemyMessage">${escape(message)}</p>
      ${mode==="talk"?conversation():mode==="brew"?brewing():experiment()}`;
      body.querySelectorAll("[data-pane]").forEach(b=>b.onclick=()=>{mode=b.dataset.pane;message="";render();body.querySelector("[aria-pressed=true]")?.focus()});
      body.querySelectorAll("[data-study]").forEach(b=>b.onclick=()=>{mode="study";activeTab=b.dataset.study;message="";render();body.querySelector("[aria-pressed=true]")?.focus()});
      body.querySelectorAll("[data-accept]").forEach(b=>b.onclick=()=>{
        if(progress.accept(b.dataset.accept)){message="Missão secundária aceita. Colete uma amostra no posto da oficina.";render();byId("alchemyMessage").focus();}
      });
      body.querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>runAction(progress.claim(b.dataset.claim),"Missão secundária concluída. Recompensa na mochila."));
      body.querySelectorAll("[data-brew]").forEach(b=>b.onclick=()=>runAction(progress.brew(b.dataset.brew),"Poção preparada."));
      const bottle=byId("alchemyBottle");
      if(bottle)bottle.onclick=()=>runAction(exchange([[glassId,1]],[["potion_vial",bottleYield()]]),bottleYield()+" frascos adicionados à mochila.");
      const accept=byId("alchemyExpeditionAccept"),claim=byId("alchemyExpeditionClaim");
      if(accept)accept.onclick=()=>{
        if(progress.startExpedition()){message="Missão secundária aceita. Teste os três efeitos no mundo.";render();byId("alchemyMessage").focus();}
      };
      if(claim)claim.onclick=()=>runAction(progress.finishExpedition(),"Expedição de Três Frascos concluída.");
      const form=byId("alchemyExperiment");
      if(!form)return;
      const read=()=>({hypothesis:form.elements.namedItem("hypothesis").value,
        inputs:studies[activeTab].controls.map((_,i)=>form.elements.namedItem("control"+i).value)});
      form.oninput=event=>{
        const output=event.target.parentElement.querySelector("output");
        if(output)output.value=event.target.value;
        drafts.set(activeTab,read());
      };
      form.onsubmit=event=>{
        event.preventDefault();
        const {hypothesis,inputs}=read(),attempt=progress.experiment(activeTab,inputs,hypothesis);
        if(!attempt.ok){refreshNote(attempt.message);return;}
        message=attempt.result.ok?"Meta atingida. Resultados registrados no Caderno.":"Registros no Caderno. Ajuste uma variável e compare a próxima tentativa.";
        drafts.set(activeTab,{inputs,hypothesis});
        feedback(attempt.result.ok?"success":"trial");
        render();
        byId("alchemyMessage").focus();
      };
    }
    return {open,close};
  }
  return {create};
})();

