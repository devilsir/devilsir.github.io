(function(){
  window.EQ=window.EQ||{};
  function apply(){
    const s=EQ.Store.get().settings;
    document.documentElement.style.setProperty('--font-scale',String(s.fontScale||1));
    document.body.classList.toggle('high-contrast',s.contrast==='high');
    document.body.classList.toggle('dyslexia-font',!!s.dyslexia);
    document.body.classList.toggle('reduced-motion',!!s.reducedMotion);
    document.body.classList.toggle('reduced-density',s.interfaceDensity==='compact');
    document.body.classList.toggle('large-targets',!!s.largeTargets);
    document.body.classList.toggle('projector',!!s.projector);
    document.body.classList.toggle('focus-mode',!!s.focusMode);
  }
  function set(name,value){EQ.Store.update(d=>{d.settings[name]=value},true);apply();if(name==='music'||name==='reducedSound')EQ.Audio.syncAmbient(EQ.Store.activeProfile()?.grade||6)}
  function settingsHTML(){
    const s=EQ.Store.get().settings;
    const toggle=(key,label,desc)=>`<div class="toggle-row"><div><strong>${label}</strong><div class="muted tiny">${desc}</div></div><label class="switch"><input data-setting="${key}" type="checkbox" ${s[key]?'checked':''}><span></span></label></div>`;
    return `<div class="grid two">
      <section class="card"><span class="kicker">Leitura e interface</span><h3>Visual</h3>
        <div class="field"><label for="font-scale">Tamanho do texto</label><select id="font-scale" data-setting="fontScale"><option value="0.9" ${s.fontScale==.9?'selected':''}>Pequeno</option><option value="1" ${s.fontScale==1?'selected':''}>Padrão</option><option value="1.15" ${s.fontScale==1.15?'selected':''}>Grande</option><option value="1.3" ${s.fontScale==1.3?'selected':''}>Muito grande</option></select></div>
        <div class="field"><label for="contrast">Contraste</label><select id="contrast" data-setting="contrast"><option value="standard" ${s.contrast==='standard'?'selected':''}>Padrão</option><option value="high" ${s.contrast==='high'?'selected':''}>Alto contraste</option></select></div>
        <div class="field"><label for="density">Densidade</label><select id="density" data-setting="interfaceDensity"><option value="comfortable" ${s.interfaceDensity==='comfortable'?'selected':''}>Confortável</option><option value="compact" ${s.interfaceDensity==='compact'?'selected':''}>Compacta</option></select></div>
        ${toggle('dyslexia','Fonte de alta legibilidade','Usa formas de letras mais distintas.')}
        ${toggle('largeTargets','Botões maiores','Aumenta áreas de clique e toque.')}
        ${toggle('reducedMotion','Reduzir animações','Remove movimentos decorativos.')}
      </section>
      <section class="card"><span class="kicker">Suporte pedagógico</span><h3>Modo de suporte</h3>
        <div class="field"><label for="support-level">Nível de suporte</label><select id="support-level" data-setting="supportLevel">${Object.entries(EQ.CURRICULUM.supportLevels).map(([k,v])=>`<option value="${k}" ${String(s.supportLevel)===k?'selected':''}>${v.name}</option>`).join('')}</select></div>
        <p class="muted">${EQ.CURRICULUM.supportLevels[s.supportLevel||0].description}</p>
        ${toggle('portugueseSupport','Apoio em português','Exibe tradução opcional nas atividades.')}
        ${toggle('focusMode','Uma ação por tela','Oculta painéis laterais durante missões.')}
        ${toggle('timers','Cronômetros','Pode ser desligado sem penalidade.')}
        ${toggle('sound','Sons de interface','O aplicativo continua funcional sem áudio.')}
        ${toggle('music','Música ambiente','Trilha procedural original e opcional para cada distrito.')}
        ${toggle('reducedSound','Reduzir sons','Mantém apenas áudio solicitado pelo usuário.')}
        ${toggle('projector','Modo projetor','Amplia conteúdo para uso coletivo.')}
      </section>
    </div>`;
  }
  function bind(root){
    root.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',()=>{
      let value=el.type==='checkbox'?el.checked:el.value;
      if(['fontScale'].includes(el.dataset.setting)) value=Number(value);
      if(el.dataset.setting==='supportLevel') value=Number(value);
      set(el.dataset.setting,value);
      if(window.EQ.App) EQ.App.toast('Preferência atualizada.');
    }));
  }
  EQ.Accessibility={apply,set,settingsHTML,bind};
})();
