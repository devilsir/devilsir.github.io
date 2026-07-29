(function(){
  window.EQ=window.EQ||{};
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  function sessions(){return EQ.Store.get().sessions.filter(s=>s.endedAt&&s.mode!=='freeplay')}
  function pct(n,d){return d?Math.round(n/d*100):0}
  function status(v){let label=EQ.CURRICULUM.statusLabels[0].label;EQ.CURRICULUM.statusLabels.forEach(x=>{if(v>=x.min)label=x.label});return label}
  function aggregate(){
    const ss=sessions(),answers=ss.flatMap(s=>s.answers||[]),correct=answers.filter(a=>a.correct).length;
    const byGrade={}; const byCategory={}; const mistakes={};
    const modality={reading:{c:0,t:0},writing:{c:0,t:0},listening:{c:0,t:0},speaking:{count:(EQ.Store.get().participation||[]).filter(x=>x.type==='speaking').length}};
    answers.forEach(a=>{
      const g=a.grade||'—';byGrade[g]=byGrade[g]||{c:0,t:0};byGrade[g].t++;if(a.correct)byGrade[g].c++;
      const c=a.category||'Outro';byCategory[c]=byCategory[c]||{c:0,t:0};byCategory[c].t++;if(a.correct)byCategory[c].c++;
      const key=a.interactionType==='sentence'?'writing':'reading';modality[key].t++;if(a.correct)modality[key].c++;
      if(a.audioUsed){modality.listening.t++;if(a.correct)modality.listening.c++}
      if(!a.correct){const mk=c+' · '+(Array.isArray(a.response)?a.response.join(' / '):String(a.response));mistakes[mk]=(mistakes[mk]||0)+1;}
    });
    return {ss,answers,accuracy:pct(correct,answers.length),byGrade,byCategory,modality,mistakes:Object.entries(mistakes).sort((a,b)=>b[1]-a[1]).slice(0,8),minutes:Math.round(ss.reduce((n,s)=>n+(s.durationSeconds||0),0)/60)};
  }
  function overviewHTML(){
    const a=aggregate(),latest=a.ss.slice(-6).reverse();
    return `<div class="section-head"><div><span class="kicker">Teacher dashboard</span><h2>Visão da turma</h2><p class="muted">Dados gerados pelas atividades realizadas neste dispositivo.</p></div><div class="cta-row"><button class="btn secondary" data-teacher-action="review">Revisão automática</button><button class="btn" data-teacher-action="quick">Criar desafio rápido</button></div></div>
    <div class="grid four">
      <div class="metric"><strong>${a.accuracy}%</strong><span>Precisão geral</span></div>
      <div class="metric"><strong>${a.ss.length}</strong><span>Sessões concluídas</span></div>
      <div class="metric"><strong>${a.answers.length}</strong><span>Tentativas registradas</span></div>
      <div class="metric"><strong>${a.minutes} min</strong><span>Tempo em atividade</span></div>
    </div><br>
    <div class="grid four">
      <div class="metric"><strong>${a.modality.reading.t?pct(a.modality.reading.c,a.modality.reading.t)+'%':'—'}</strong><span>Reading</span></div>
      <div class="metric"><strong>${a.modality.writing.t?pct(a.modality.writing.c,a.modality.writing.t)+'%':'—'}</strong><span>Writing</span></div>
      <div class="metric"><strong>${a.modality.listening.t?pct(a.modality.listening.c,a.modality.listening.t)+'%':'—'}</strong><span>Listening</span></div>
      <div class="metric"><strong>${a.modality.speaking.count}</strong><span>Speaking participation</span></div>
    </div><br>
    <div class="grid two"><section class="card"><span class="kicker">Conteúdos</span><h3>Precisão por habilidade</h3>${Object.entries(a.byCategory).length?Object.entries(a.byCategory).sort((x,y)=>y[1].t-x[1].t).slice(0,9).map(([k,v])=>`<div class="chart-row"><label>${esc(k)}</label><div class="chart-bar"><span style="width:${pct(v.c,v.t)}%"></span></div><strong>${pct(v.c,v.t)}%</strong></div>`).join(''):'<div class="empty-state">As métricas aparecerão após a primeira missão.</div>'}</section>
    <section class="card"><span class="kicker">Apoio sugerido</span><h3>Erros mais frequentes</h3>${a.mistakes.length?a.mistakes.map(([k,n])=>`<div class="team-chip"><span class="badge">${n}×</span><span>${esc(k)}</span></div>`).join(''):'<div class="empty-state">Nenhum erro registrado ainda.</div>'}<br><p class="muted tiny">Sugestão: crie uma revisão curta com os dois conteúdos mais recorrentes e mantenha as pistas visuais ativadas.</p></section></div><br>
    <section class="card"><span class="kicker">Acompanhamento</span><h3>Perfis e próximos passos</h3>${EQ.Store.get().profiles.map(p=>{const ps=a.ss.filter(s=>s.profileId===p.id),avg=ps.length?Math.round(ps.reduce((n,x)=>n+(x.accuracy||0),0)/ps.length):0;return `<div class="team-chip"><span>◉</span><strong>${esc(p.nickname)}</strong><span class="badge">${ps.length?status(avg):'Sem dados'}</span><span class="muted tiny">${ps.length?avg+'%':'—'}</span></div>`}).join('')}</section><br>
    <section class="card"><span class="kicker">Histórico</span><h3>Sessões recentes</h3>${latest.length?sessionTable(latest):'<div class="empty-state">Nenhuma sessão concluída.</div>'}</section>`;
  }
  function sessionTable(ss){return `<div class="table-wrap"><table><thead><tr><th>Atividade</th><th>Ano</th><th>Precisão</th><th>Tentativas</th><th>Status</th><th>Data</th></tr></thead><tbody>${ss.map(s=>`<tr><td>${esc(s.label||s.missionId||s.mode)}</td><td>${s.grade||'—'}º</td><td>${s.accuracy||0}%</td><td>${s.attempts||0}</td><td><span class="badge">${status(s.accuracy||0)}</span></td><td>${new Date(s.endedAt||s.startedAt).toLocaleDateString('pt-BR')}</td></tr>`).join('')}</tbody></table></div>`}
  function classesHTML(){
    const d=EQ.Store.get(),cls=EQ.Store.activeClass();
    return `<div class="section-head"><div><span class="kicker">Gestão local</span><h2>${esc(cls.name)}</h2><p class="muted">Código da turma: <strong>${esc(cls.code)}</strong> · ${cls.grade}º ano · ${cls.trimester}º trimestre</p></div><div class="cta-row"><button class="btn secondary" data-teacher-action="speaking">Registrar fala em inglês</button><button class="btn" data-teacher-action="new-student">Adicionar estudante</button></div></div>
    <div class="grid two"><section class="card"><span class="kicker">Estudantes</span><h3>Apelidos anônimos</h3>${cls.students.map(s=>`<div class="team-chip"><span>◉</span><strong>${esc(s.nickname)}</strong><span class="badge">Suporte ${s.supportLevel||'Padrão'}</span></div>`).join('')||'<div class="empty-state">Nenhum estudante.</div>'}</section>
    <section class="card"><span class="kicker">Equipes</span><h3>Energia colaborativa</h3>${cls.teams.map(t=>`<div class="team-chip" style="--team-color:${t.color}"><span class="team-color"></span><strong>${esc(t.name)}</strong><span>${t.energy||0} ⚡</span><button class="icon-btn" data-team-energy="${t.id}" aria-label="Adicionar energia">+</button></div>`).join('')}</section></div>`;
  }
  function quickHTML(){
    return `<div class="section-head"><div><span class="kicker">Quick Challenge</span><h2>Desafio rápido</h2><p class="muted">Gere uma atividade sem exigir progresso na história.</p></div></div>
    <form id="quick-form" class="card form-grid">
      <div class="field"><label for="quick-grade">Ano</label><select id="quick-grade" name="grade"><option value="6">6º ano</option><option value="7">7º ano</option><option value="8">8º ano</option><option value="9">9º ano</option></select></div>
      <div class="field"><label for="quick-count">Quantidade</label><select id="quick-count" name="count"><option>3</option><option selected>5</option><option>7</option><option>10</option></select></div>
      <div class="field"><label for="quick-difficulty">Dificuldade</label><select id="quick-difficulty" name="difficulty"><option>Guiada</option><option selected>Padrão</option><option>Avançada</option></select></div>
      <div class="field"><label for="quick-type">Tipo</label><select id="quick-type" name="type"><option value="all">Misturado</option><option value="choice">Perguntas</option><option value="sentence">Sentence Forge</option><option value="match">Dialogue Repair</option><option value="order">Timeline Crisis</option><option value="room">Room Mapper</option></select></div>
      <div class="field full"><label for="quick-topic">Conteúdo</label><select id="quick-topic" name="topic"><option value="all">Todos do ano selecionado</option></select></div>
      <div class="field full"><button class="btn" type="submit">Gerar e iniciar</button></div>
    </form>`;
  }
  function editorHTML(){
    const custom=EQ.Store.get().customQuestions;
    return `<div class="section-head"><div><span class="kicker">Custom Content Editor</span><h2>Conteúdo personalizado</h2><p class="muted">As questões ficam salvas apenas neste dispositivo e entram nos desafios rápidos.</p></div></div>
    <form id="custom-form" class="card form-grid">
      <div class="field"><label for="custom-grade">Ano</label><select id="custom-grade" name="grade"><option>6</option><option>7</option><option>8</option><option>9</option></select></div>
      <div class="field"><label for="custom-type">Formato</label><select id="custom-type" name="format"><option value="multiple">Múltipla escolha</option><option value="truefalse">Verdadeiro ou falso</option><option value="match">Associar pares</option><option value="complete">Completar frase</option><option value="reorder_words">Reordenar palavras</option><option value="reorder_events">Reordenar eventos</option><option value="audio">Pergunta com áudio</option><option value="image">Associação com imagem</option><option value="short">Resposta escrita curta</option><option value="discussion">Discussão em equipe</option><option value="oral">Resposta oral</option><option value="exit">Exit ticket</option></select></div>
      <div class="field full"><label for="custom-prompt">Instrução ou pergunta</label><textarea id="custom-prompt" name="prompt" required></textarea></div>
      <div class="field"><label for="custom-answer">Resposta correta</label><input id="custom-answer" name="answer" required></div>
      <div class="field"><label for="custom-options">Alternativas, separadas por |</label><input id="custom-options" name="options" placeholder="Option A | Option B | Option C"></div>
      <div class="field"><label for="custom-alternatives">Respostas alternativas aceitas</label><input id="custom-alternatives" name="accepted" placeholder="alternative 1 | alternative 2"></div>
      <div class="field"><label for="custom-difficulty">Dificuldade</label><select id="custom-difficulty" name="difficulty"><option>Guiada</option><option selected>Padrão</option><option>Avançada</option></select></div>
      <div class="field"><label for="custom-points">Pontos</label><input id="custom-points" name="points" type="number" min="0" value="100"></div>
      <div class="field"><label for="custom-time">Tempo limite (segundos)</label><input id="custom-time" name="timeLimit" type="number" min="0" value="0"></div>
      <div class="field"><label for="custom-skill">Habilidade curricular</label><input id="custom-skill" name="skill" placeholder="Somente após conferência oficial"></div>
      <div class="field"><label for="custom-support">Versão de acessibilidade</label><select id="custom-support" name="supportVersion"><option value="standard">Padrão</option><option value="1">Suporte 1</option><option value="2">Suporte 2</option><option value="3">Suporte 3</option></select></div>
      <div class="field"><label for="custom-topic">Conteúdo</label><input id="custom-topic" name="category" required></div>
      <div class="field"><label for="custom-hint">Pista</label><input id="custom-hint" name="hint"></div>
      <div class="field full"><label for="custom-explanation">Explicação</label><textarea id="custom-explanation" name="explanation"></textarea></div>
      <div class="field full"><button class="btn" type="submit">Salvar questão</button></div>
    </form><br><section class="card"><span class="kicker">Biblioteca local</span><h3>${custom.length} questões personalizadas</h3>${custom.length?custom.map(q=>`<div class="team-chip"><span class="badge">${q.grade}º</span><strong>${esc(q.prompt)}</strong><button class="icon-btn" data-duplicate-custom="${q.id}" aria-label="Duplicar">⧉</button><button class="icon-btn" data-delete-custom="${q.id}" aria-label="Excluir">×</button></div>`).join(''):'<div class="empty-state">Crie a primeira questão acima.</div>'}</section>`;
  }
  function reportsHTML(){
    const a=aggregate();
    return `<div class="section-head"><div><span class="kicker">Reports</span><h2>Relatórios</h2><p class="muted">Resumo de desempenho conectado a objetivos de aprendizagem. Nenhum dado sai do dispositivo.</p></div><button class="btn" data-teacher-action="export-csv">Exportar CSV</button></div>
      <section class="card"><h3>Resumo por ano</h3>${Object.entries(a.byGrade).length?Object.entries(a.byGrade).map(([g,v])=>`<div class="chart-row"><label>${g}º ano</label><div class="chart-bar"><span style="width:${pct(v.c,v.t)}%"></span></div><strong>${pct(v.c,v.t)}%</strong></div>`).join(''):'<div class="empty-state">Sem resultados ainda.</div>'}</section><br>
      <section class="card"><h3>Todas as sessões</h3>${a.ss.length?sessionTable(a.ss.slice().reverse()):'<div class="empty-state">Sem sessões concluídas.</div>'}</section>`;
  }
  function backupHTML(){return `<div class="section-head"><div><span class="kicker">Offline & Save</span><h2>Backup e restauração</h2><p class="muted">O save é versionado, possui cópia automática e pode ser exportado manualmente.</p></div></div><div class="grid two"><section class="card"><h3>Exportar backup</h3><p class="muted">Baixe turmas, progresso, relatórios, configurações e conteúdo personalizado em JSON.</p><button class="btn" data-teacher-action="backup">Baixar JSON</button></section><section class="card"><h3>Importar backup</h3><p class="muted">A importação cria uma cópia de segurança do estado atual antes de substituir os dados.</p><label class="btn secondary" for="backup-file">Selecionar JSON</label><input id="backup-file" type="file" accept="application/json" hidden></section></div><br><section class="card"><h3>Reiniciar dados locais</h3><p class="muted">Esta ação exige confirmação e não afeta nenhum arquivo do projeto.</p><button class="btn danger" data-teacher-action="reset">Apagar progresso local</button></section>`}
  function exportCSV(){
    const rows=[['Atividade','Ano','Precisão','Tentativas','Duração (s)','Data']];sessions().forEach(s=>rows.push([s.label||s.missionId||s.mode,s.grade||'',s.accuracy||0,s.attempts||0,s.durationSeconds||0,s.endedAt||'']));
    const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(';')).join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='english-quest-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function bind(root,navigate){
    root.querySelectorAll('[data-teacher-action]').forEach(b=>b.addEventListener('click',()=>{
      const a=b.dataset.teacherAction;
      if(a==='quick')navigate('teacher/quick');
      if(a==='review'){const wrong=aggregate().answers.filter(x=>!x.correct&&!x.skipped).slice().reverse(),ids=[...new Set(wrong.map(x=>x.questionId))],all=EQ.CONTENT.missions.flatMap(m=>m.questions).concat(EQ.Store.get().customQuestions),qs=ids.map(id=>all.find(q=>q.id===id)).filter(Boolean).slice(0,7);if(!qs.length){EQ.App.toast('Ainda não há erros para gerar uma revisão.');return}EQ.App.startReviewChallenge(wrong[0]?.grade||6,qs)}
      if(a==='backup')EQ.Store.downloadBackup();
      if(a==='export-csv')exportCSV();
      if(a==='speaking'){const who=prompt('Apelido ou equipe que participou em inglês:');if(!who)return;EQ.Store.update(d=>d.participation.push({id:'part-'+Date.now(),at:new Date().toISOString(),type:'speaking',who,classId:d.activeClassId}),true);EQ.App.toast('Participação oral registrada.');navigate('teacher/classes')}
      if(a==='new-student'){
        const name=prompt('Apelido ou número do estudante:');if(!name)return;EQ.Store.update(d=>{const c=d.classes.find(x=>x.id===d.activeClassId);c.students.push({id:'s-'+Date.now(),nickname:name,supportLevel:0})},true);navigate('teacher/classes');
      }
      if(a==='reset'&&confirm('Apagar todo o progresso local? Um backup manual é recomendado.')){EQ.Store.reset();location.hash='#/title';location.reload();}
    }));
    root.querySelectorAll('[data-team-energy]').forEach(b=>b.addEventListener('click',()=>{EQ.Store.update(d=>{const c=d.classes.find(x=>x.id===d.activeClassId),t=c.teams.find(x=>x.id===b.dataset.teamEnergy);t.energy=(t.energy||0)+10},true);navigate('teacher/classes')}));
    root.querySelectorAll('[data-duplicate-custom]').forEach(b=>b.addEventListener('click',()=>{EQ.Store.update(d=>{const original=d.customQuestions.find(q=>q.id===b.dataset.duplicateCustom);if(original)d.customQuestions.push(Object.assign({},JSON.parse(JSON.stringify(original)),{id:'custom-'+Date.now(),prompt:original.prompt+' (copy)'}) )},true);navigate('teacher/editor')}));
    root.querySelectorAll('[data-delete-custom]').forEach(b=>b.addEventListener('click',()=>{EQ.Store.update(d=>d.customQuestions=d.customQuestions.filter(q=>q.id!==b.dataset.deleteCustom),true);navigate('teacher/editor')}));
    const qf=root.querySelector('#quick-form');if(qf)qf.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(qf),grade=Number(fd.get('grade')),count=Number(fd.get('count')),type=fd.get('type');let questions=EQ.CONTENT.missions.filter(m=>m.grade===grade).flatMap(m=>m.questions).concat(EQ.Store.get().customQuestions.filter(q=>Number(q.grade)===grade));if(type!=='all')questions=questions.filter(q=>q.type===type);questions=EQ.Minigames.shuffle(questions).slice(0,count);EQ.App.startQuickChallenge(grade,questions)});
    const cf=root.querySelector('#custom-form');if(cf)cf.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(cf),format=String(fd.get('format')),raw=String(fd.get('answer')).trim(),map={multiple:'choice',truefalse:'choice',match:'match',complete:'choice',reorder_words:'sentence',reorder_events:'order',audio:'choice',image:'choice',short:'choice',discussion:'choice',oral:'choice',exit:'choice'},type=map[format]||'choice';let answer=raw,options=String(fd.get('options')).split('|').map(x=>x.trim()).filter(Boolean);if(type==='sentence'||type==='order')answer=raw.split('|').map(x=>x.trim()).filter(Boolean);if(type==='match')answer=raw.split('|').map(x=>x.split('>').map(y=>y.trim())).filter(x=>x.length===2);if(['discussion','oral','exit'].includes(format)){answer='Completed with the class';options=['Completed with the class','Needs another attempt']}if(format==='truefalse'&&!options.length)options=['True','False'];const q={id:'custom-'+Date.now(),grade:Number(fd.get('grade')),type,format,prompt:fd.get('prompt'),answer,options,acceptedAlternatives:String(fd.get('accepted')).split('|').map(x=>x.trim()).filter(Boolean),category:fd.get('category'),hint:fd.get('hint')||'Read the instruction carefully.',explanation:fd.get('explanation')||'Review the target language.',difficulty:fd.get('difficulty'),points:Number(fd.get('points')||100),timeLimit:Number(fd.get('timeLimit')||0),curriculumSkill:fd.get('skill')||'',supportVersion:fd.get('supportVersion'),pt:''};if(type==='choice'&&!q.options.includes(q.answer))q.options.unshift(q.answer);EQ.Store.update(d=>d.customQuestions.push(q),true);EQ.App.toast('Questão personalizada salva.');navigate('teacher/editor')});
    const file=root.querySelector('#backup-file');if(file)file.addEventListener('change',async()=>{try{const text=await file.files[0].text();EQ.Store.importJSON(text);EQ.App.toast('Backup restaurado com sucesso.');navigate('teacher/overview')}catch(err){EQ.App.toast('Não foi possível importar este arquivo.')}});
  }
  EQ.Teacher={aggregate,overviewHTML,classesHTML,quickHTML,editorHTML,reportsHTML,backupHTML,bind};
})();
