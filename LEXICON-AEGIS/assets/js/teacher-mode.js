(function () {
  'use strict';
  const esc = value => window.LexiconEducationUtils.escapeHTML(value);

  function download(name, content, type='text/plain;charset=utf-8') {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),500);
  }
  function csvEscape(value) { const s=String(value??''); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s; }

  class TeacherMode {
    constructor(hooks={}) { this.hooks=hooks; }
    render(container) {
      const t=window.LexiconStorage.state.teacher;
      const year=window.LexiconCurriculum.getYear(t.year);
      container.innerHTML=`
        <section class="teacher-console view-panel">
          <div class="view-heading"><div><span class="micro-label">CLASSROOM CONTROL</span><h1>Teacher Mode</h1><p>Monte uma sessão jogável, projetável ou avaliativa sem login e sem internet.</p></div><button type="button" class="icon-close" data-back aria-label="Voltar">×</button></div>
          <div class="teacher-grid">
            <form class="teacher-form" id="teacher-form">
              <label>Ano escolar<select name="year">${[6,7,8,9].map(y=>`<option value="${y}" ${Number(t.year)===y?'selected':''}>${y}º ano</option>`).join('')}</select></label>
              <label>Tópico<select name="topic" id="teacher-topic">${this.topicOptions(year,t.topic)}</select></label>
              <label>Dificuldade<select name="difficulty"><option value="starter" ${t.difficulty==='starter'?'selected':''}>Visual / inicial</option><option value="guided" ${t.difficulty==='guided'?'selected':''}>Prática guiada</option><option value="independent" ${t.difficulty==='independent'?'selected':''}>Desafio independente</option></select></label>
              <label>Nível de apoio<select name="supportLevel"><option value="1" ${Number(t.supportLevel)===1?'selected':''}>Nível 1 — apoio visual</option><option value="2" ${Number(t.supportLevel)===2?'selected':''}>Nível 2 — guiado</option><option value="3" ${Number(t.supportLevel)===3?'selected':''}>Nível 3 — independente</option></select></label>
              <label>Quantidade de questões<input name="sessionLength" type="number" min="3" max="40" value="${Number(t.sessionLength)||10}"></label>
              <label>Modo<select name="mode"><option value="practice" ${t.mode==='practice'?'selected':''}>Prática</option><option value="assessment" ${t.mode==='assessment'?'selected':''}>Avaliação</option><option value="random" ${t.mode==='random'?'selected':''}>Missão aleatória</option></select></label>
              <div class="switch-grid">
                ${this.switch('timers','Cronômetro',t.timers)}${this.switch('combat','Combate',t.combat)}${this.switch('bosses','Boss battles',t.bosses)}${this.switch('ptSupport','Apoio em PT-BR',t.ptSupport)}${this.switch('projector','Modo projetor',t.projector)}
              </div>
              <div class="teacher-actions"><button type="submit" class="primary-button">Iniciar sessão</button><button type="button" class="secondary-button" id="preview-questions">Pré-visualizar questões</button></div>
            </form>
            <aside class="mapping-panel">
              <span class="micro-label">CURRICULUM MAP</span><h2>${esc(year.label)} · ${esc(year.sector)}</h2>
              <p>A BNCC é anual. Esta plataforma usa o recorte curricular definido pelo professor para o 2º trimestre de 2026 e mantém os códigos apenas como referências de alinhamento.</p>
              <div class="code-cloud">${year.bncc.map(code=>`<span>${code}</span>`).join('')}</div>
              <div id="topic-objective">${this.topicObjective(year,t.topic)}</div>
              <div class="teacher-tools">
                <button type="button" class="tool-button" id="export-results">Exportar resultados CSV</button>
                <button type="button" class="tool-button" id="print-report">Relatório para impressão</button>
                <button type="button" class="tool-button" id="export-questions">Exportar banco local</button>
                <label class="tool-button file-tool">Importar questões<input id="import-questions" type="file" accept="application/json"></label>
                <button type="button" class="tool-button danger" id="reset-progress">Redefinir progresso do perfil</button>
                <button type="button" class="tool-button danger" id="clear-data">Limpar dados locais da turma</button>
              </div>
            </aside>
          </div>
          <section class="question-preview" id="question-preview" hidden></section>
        </section>`;
      const form=container.querySelector('#teacher-form');
      container.querySelector('[data-back]').addEventListener('click',()=>this.hooks.back?.());
      form.year.addEventListener('change',()=>{
        const y=window.LexiconCurriculum.getYear(form.year.value);container.querySelector('#teacher-topic').innerHTML=this.topicOptions(y,'all');
        container.querySelector('.mapping-panel h2').textContent=`${y.label} · ${y.sector}`;
        container.querySelector('.code-cloud').innerHTML=y.bncc.map(code=>`<span>${code}</span>`).join('');
        container.querySelector('#topic-objective').innerHTML=this.topicObjective(y,'all');
      });
      form.topic.addEventListener('change',()=>{const y=window.LexiconCurriculum.getYear(form.year.value);container.querySelector('#topic-objective').innerHTML=this.topicObjective(y,form.topic.value);});
      form.addEventListener('change',()=>this.persist(form));
      form.addEventListener('submit',e=>{e.preventDefault();const config=this.persist(form);this.hooks.launch?.(config);});
      container.querySelector('#preview-questions').addEventListener('click',()=>this.preview(container,form));
      container.querySelector('#export-results').addEventListener('click',()=>this.exportResults());
      container.querySelector('#print-report').addEventListener('click',()=>this.printReport());
      container.querySelector('#export-questions').addEventListener('click',()=>download('lexicon-aegis-question-bank.json',JSON.stringify(window.LexiconEducation.allQuestions(),null,2),'application/json'));
      container.querySelector('#import-questions').addEventListener('change',e=>this.importQuestions(e));
      container.querySelector('#reset-progress').addEventListener('click',()=>{const p=window.LexiconStorage.activeProfile();if(p&&confirm(`Redefinir todo o progresso de ${p.name}?`)){window.LexiconStorage.resetProfileProgress(p.id);alert('Progresso redefinido.');}});
      container.querySelector('#clear-data').addEventListener('click',()=>{if(confirm('Apagar todos os perfis, resultados e configurações locais deste navegador?')){window.LexiconStorage.clearClassroomData();document.documentElement.classList.remove('projector-mode');this.hooks.back?.();window.LexiconApp?.openProfileEditor?.();}});
    }
    topicOptions(year,selected){return `<option value="all" ${selected==='all'?'selected':''}>Todos os tópicos</option>`+year.topics.map(topic=>`<option value="${topic.id}" ${selected===topic.id?'selected':''}>${esc(topic.label)}</option>`).join('');}
    topicObjective(year,topicId){if(topicId==='all')return `<h3>Objetivos do setor</h3><ul>${year.topics.map(t=>`<li><strong>${esc(t.label)}:</strong> ${esc(t.objective)}</li>`).join('')}</ul>`;const t=year.topics.find(x=>x.id===topicId);return `<h3>${esc(t?.label||'Objetivo')}</h3><p>${esc(t?.objective||'')}</p>`;}
    switch(name,label,value){return `<label class="switch-row"><span>${label}</span><input type="checkbox" name="${name}" ${value?'checked':''}><i></i></label>`;}
    persist(form){
      const data=new FormData(form);const config={year:Number(data.get('year')),topic:data.get('topic'),difficulty:data.get('difficulty'),supportLevel:Number(data.get('supportLevel')),sessionLength:clamp(Number(data.get('sessionLength'))||10,3,40),mode:data.get('mode'),timers:form.timers.checked,combat:form.combat.checked,bosses:form.bosses.checked,ptSupport:form.ptSupport.checked,projector:form.projector.checked};
      window.LexiconStorage.setTeacher(config);window.LexiconAccessibility.apply(window.LexiconStorage.state.settings);document.documentElement.classList.toggle('projector-mode',config.projector);return config;
    }
    preview(container,form){const config=this.persist(form);const questions=window.LexiconEducation.selectSession(config,Math.min(12,config.sessionLength));const box=container.querySelector('#question-preview');box.hidden=false;box.innerHTML=`<div class="preview-heading"><div><span class="micro-label">QUESTION PREVIEW</span><h2>${questions.length} questões selecionadas</h2></div><button class="text-button" data-close-preview>Fechar</button></div>${questions.map((q,i)=>`<article><span>${String(i+1).padStart(2,'0')} · ${esc(q.type)}</span><h3>${esc(q.prompt)}</h3><p><strong>Resposta:</strong> ${esc(q.correctAnswer)}</p><small>${q.bnccCodes.join(', ')}</small></article>`).join('')}`;box.querySelector('[data-close-preview]').onclick=()=>box.hidden=true;box.scrollIntoView({behavior:window.LexiconStorage.state.settings.reducedMotion?'auto':'smooth'});}
    exportResults(){const sessions=window.LexiconStorage.state.sessions;const headers=['date','profile','type','year','mission','topic','score','rank','time','correct','incorrect','accuracy'];const rows=sessions.map(s=>{const p=window.LexiconStorage.state.profiles.find(x=>x.id===s.profileId);return [s.date,p?.name||'',s.type||'',s.year||'',s.missionName||'',s.topic||'',s.score||'',s.rank||'',s.time||'',s.correct||0,s.incorrect||0,s.accuracy??''];});download('lexicon-aegis-results.csv',[headers,...rows].map(row=>row.map(csvEscape).join(',')).join('\n'),'text/csv;charset=utf-8');}
    printReport(){const p=window.LexiconStorage.activeProfile();const sessions=window.LexiconStorage.state.sessions.filter(s=>!p||s.profileId===p.id).slice(0,30);const win=window.open('','_blank','noopener,noreferrer');if(!win)return alert('O navegador bloqueou a janela de impressão.');win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Lexicon Aegis — Relatório</title><style>body{font:12pt Arial;color:#111;margin:2cm}h1{font-size:22pt}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #999;padding:7px;text-align:left}.mastery{display:grid;grid-template-columns:1fr 1fr;gap:8px}.card{border:1px solid #bbb;padding:10px}@media print{button{display:none}}</style></head><body><h1>Lexicon Aegis — Relatório local</h1><p><strong>Estudante:</strong> ${esc(p?.name||'Turma')} · <strong>Ano:</strong> ${p?.year||'—'}º · <strong>Gerado:</strong> ${new Date().toLocaleString('pt-BR')}</p><h2>Domínio por tópico</h2><div class="mastery">${Object.entries(p?.mastery||{}).map(([id,m])=>`<div class="card"><strong>${esc(id)}</strong><br>${m.state} · ${m.percent}%<br>${m.correct}/${m.attempts} acertos</div>`).join('')}</div><h2>Sessões recentes</h2><table><thead><tr><th>Data</th><th>Atividade</th><th>Acertos</th><th>Precisão</th><th>Tempo</th></tr></thead><tbody>${sessions.map(s=>`<tr><td>${new Date(s.date).toLocaleDateString('pt-BR')}</td><td>${esc(s.missionName||s.topic||s.type)}</td><td>${s.correct||0}/${(s.correct||0)+(s.incorrect||0)}</td><td>${s.accuracy??'—'}%</td><td>${Math.round(s.time||0)}s</td></tr>`).join('')}</tbody></table><button onclick="print()">Imprimir</button></body></html>`);win.document.close();}
    async importQuestions(event){const file=event.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data))throw new Error('O arquivo precisa conter uma lista de questões.');const valid=data.filter(q=>q&&q.id&&q.schoolYear&&q.topic&&q.prompt&&Array.isArray(q.options)&&q.correctAnswer);if(!valid.length)throw new Error('Nenhuma questão válida encontrada.');window.LexiconStorage.state.customQuestions=valid;window.LexiconStorage.save(true);alert(`${valid.length} questões locais importadas.`);}catch(error){alert(`Não foi possível importar: ${error.message}`);}event.target.value='';}
  }
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  window.LexiconTeacherMode=TeacherMode;
})();
