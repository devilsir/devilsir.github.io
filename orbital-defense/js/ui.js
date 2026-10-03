var TutorialGuide=(()=>{
 const steps=[
  {title:'Bem-vindo ao ORBITAL!',text:'Esta primeira missão também é sua fase tutorial. Kepler vai acompanhar cada ação e o jogo vai congelar quando houver algo importante para explicar.',instruction:'Você pode pular o tutorial principal a qualquer momento. Os avisos curtos de novas construções continuam aparecendo quando algo novo for desbloqueado.',manual:true,center:true},
  {title:'Energia estelar',text:'Este número é sua moeda de construção. Toda defesa custa energia. Mini Sóis produzem mais energia durante a batalha; inimigos derrotados também devolvem parte dela.',instruction:'Observe o total antes de construir para não ficar sem resposta em uma rota.',manual:true,target:'#energyValue'},
  {title:'Núcleo solar',text:'Este é o HP do seu sistema. Quando um inimigo atravessa toda a rota e chega ao Sol, o núcleo perde vida. Se chegar a zero, a missão termina.',instruction:'Barreiras compram tempo; dano elimina a ameaça antes que ela alcance o núcleo.',manual:true,target:'#healthValue'},
  {title:'Capítulo e descobertas',text:'Aqui você acompanha o capítulo e os três checkpoints científicos da missão. Os checkpoints pausam a batalha e testam a ideia de física apresentada na fase.',instruction:'Acertos dão energia, +2 pontos de pesquisa e um bônus temporário. Ao concluir capítulos você também recebe pesquisa; ela é permanente.',manual:true,target:'.checkpoint-pill'},
  {title:'Sinais de aproximação',text:'Antes de iniciar, esta faixa mostra quais inimigos estão chegando e em qual quantidade. Use isso para escolher os tipos de dano e a quantidade de barreiras.',instruction:'Passe o cursor nos inimigos durante a batalha para ver resistências e fraquezas.',manual:true,target:'#wavePreview'},
  {title:'Seu baralho orbital',text:'Cada carta é uma construção. Ela mostra função, custo, cadência e um resumo do comportamento. Cartas bloqueadas são liberadas pela campanha ou por pesquisas específicas.',instruction:'O deck fica junto do visualizador para você não precisar rolar a página no meio do combate.',manual:true,target:'.deck-panel'},
  {title:'1. Crie sua economia',text:'O Mini Sol não ataca. Ele gera partículas de energia durante a batalha e permite sustentar upgrades e novas construções.',instruction:'Clique na carta MINI SOL para continuar.',event:'select-miniSun',target:'.unit-card[data-unit="miniSun"]'},
  {title:'2. Posicione o Mini Sol',text:'Construções ficam nos pontos das órbitas. Nesta missão, apenas duas rotas estão abertas. Você pode construir antes de iniciar a batalha.',instruction:'Clique no espaço destacado da rota superior.',event:'miniSun',target:'stage',point:[0.3203,0.1697,112]},
  {title:'3. Escolha um atacante',text:'Mercúrio é uma torre de tiro cinético: simples, barata e ótima para aprender o fluxo de combate.',instruction:'Clique na carta MERCÚRIO.',event:'select-mercury',target:'.unit-card[data-unit="mercury"]'},
  {title:'4. Proteja outra rota',text:'Ataques só atingem inimigos da mesma rota. Espalhar atacantes impede que uma linha fique completamente sem defesa.',instruction:'Posicione Mercúrio no espaço destacado da rota central.',event:'attacker',target:'stage',point:[0.4063,0.5,112]},
  {title:'5. Inicie a batalha',text:'Na preparação tudo fica congelado: inimigos não se movem e Mini Sóis ainda não geram energia. Você pode reorganizar a estratégia sem pressão.',instruction:'Clique em INICIAR BATALHA.',event:'start',target:'#startWaveBtn'},
  {title:'Velocidade e pausa',text:'Durante a batalha, 1×/2× muda a velocidade da simulação e o botão de pausa congela o combate. Espaço também pausa pelo teclado. Uma pesquisa avançada libera 3×.',instruction:'O tutorial pausou o jogo agora. Clique em Continuar para retomar.',manual:true,pause:true,target:'.play-controls'},
  {title:'Colete energia',text:'Quando um Mini Sol completa seu ciclo, uma partícula dourada aparece no campo. Ela expira depois de alguns segundos.',instruction:'Clique na primeira partícula dourada que aparecer.',event:'collect',target:'orb'},
  {title:'Leia o inimigo',text:'Cada ameaça tem HP, armadura, escudo, velocidade, comportamento e multiplicadores de resistência. Isso muda qual torre é mais eficiente.',instruction:'Passe o cursor sobre um asteroide para abrir a ficha dele.',event:'inspect',target:'enemy'},
  {title:'Checkpoint científico',text:'Quando o progresso alcança os marcadores da linha da missão, a batalha pausa automaticamente e abre um desafio. Não há cronômetro: experimente antes de responder.',instruction:'Conclua o próximo checkpoint para continuar o tutorial.',event:'checkpoint',target:'#checkpointTrack'},
  {title:'Júpiter desbloqueado',text:'O primeiro checkpoint libera Júpiter nesta missão. Ele é uma barreira gasosa: quase não causa dano, mas possui muito HP e reduz o dano de contato.',instruction:'Clique na carta JÚPITER.',event:'select-jupiter',target:'.unit-card[data-unit="jupiter"]',unlockId:'jupiter'},
  {title:'Coloque a barreira na frente',text:'Inimigos param quando encostam numa construção. Por isso barreiras funcionam melhor mais à direita, na frente dos atacantes.',instruction:'Posicione Júpiter no ponto destacado.',event:'barrier',target:'stage',point:[0.6641,0.1391,112]},
  {title:'Inspecione uma construção',text:'Clicar numa torre já colocada abre seu painel. Ali aparecem HP, dano, alcance, cadência, especializações, sinergias, venda e upgrade.',instruction:'Clique no Júpiter que você acabou de posicionar.',event:'tower-inspect',target:'tower'},
  {title:'Faça um upgrade',text:'Upgrades gastam energia e melhoram a função principal da unidade. No nível 3, várias torres recebem especializações diferentes.',instruction:'Clique em MELHORAR no painel da torre.',event:'upgrade',target:'#upgradeTowerBtn'},
  {title:'Poderes ativos',text:'Os botões no canto do campo são poderes de emergência com cargas limitadas. Erupção, Congelar e Manobra são básicos; Estilingue, Eclipse e Supernova dependem da árvore de pesquisa.',instruction:'Poderes não substituem uma boa formação: guarde as cargas para vazamentos, bosses e situações em que a defesa normal falhar.',manual:true,pause:true,target:'#powerRail'},
  {title:'Laboratório orbital',text:'O laboratório não é só uma tela de teoria: ele permite experimentar massa, distância, gravidade e relações usadas nos desafios científicos.',instruction:'Clique em LABORATÓRIO ORBITAL. Explore e feche a janela para continuar.',event:'lab',target:'#labBtn'},
  {title:'Campanha',text:'A Campanha organiza os oito capítulos. Estrelas registram seu desempenho e capítulos concluídos liberam novas missões, construções e modos.',instruction:'Seu progresso de campanha, pesquisa e observatório fica salvo entre partidas.',manual:true,pause:true,target:'#campaignBtn'},
  {title:'Pesquisa persistente',text:'Pontos de pesquisa não são energia de construção. Eles ficam salvos fora da missão e servem para comprar melhorias permanentes, novas construções e poderes.',instruction:'Clique em PESQUISA para abrir a árvore. A batalha permanecerá pausada.',event:'research-open',pause:true,target:'#researchBtn'},
  {title:'Como ganhar pesquisa',text:'Você recebe pesquisa ao acertar checkpoints e ao concluir missões. Repetir capítulos também rende pontos, mas a primeira conclusão costuma dar mais.',instruction:'O total disponível aparece no topo da tela e aqui dentro. Gastar pontos não afeta sua energia da batalha.',manual:true,pause:true,allowHub:true,target:'#hubIntro',mentor:'newton'},
  {title:'Categorias e nós',text:'A árvore é separada por Energia, Defesa planetária, Mecânica orbital, Gravidade e Astrofísica avançada. Cada cartão é um nó de pesquisa com custo e efeito próprio.',instruction:'Nós com ✓ já foram pesquisados. Nós apagados podem estar sem pontos suficientes ou esperando um pré-requisito.',manual:true,pause:true,allowHub:true,target:'.research-category',mentor:'newton'},
  {title:'Pré-requisitos',text:'Algumas pesquisas formam cadeias. Reserva estelar, por exemplo, só pode ser comprada depois de Fusão eficiente. Pesquisas avançadas podem exigir duas descobertas anteriores.',instruction:'Leia a linha “Requer” antes de planejar onde gastar seus pontos.',manual:true,pause:true,allowHub:true,target:'.research-node[data-research="battery"]',mentor:'newton'},
  {title:'Pesquisa que libera construções',text:'Alguns nós não apenas melhoram números: eles adicionam novas cartas ao seu deck. Sistema lunar libera a Lua; Observação de pulsares libera o Pulsar; Matéria degenerada libera a Estrela de nêutrons.',instruction:'Quando uma construção nova for liberada, o jogo vai pausar e mostrar um mini-tutorial específico para ela.',manual:true,pause:true,allowHub:true,target:'.research-node[data-research="moon"]',mentor:'newton'},
  {title:'Melhorias permanentes',text:'Outros nós alteram todas as missões: Mini Sóis podem produzir mais, construções podem ganhar HP, Mercúrio pode causar mais dano e campos gravitacionais podem alcançar mais longe.',instruction:'Esses bônus continuam ativos ao trocar de capítulo e também valem ao rejogar missões antigas.',manual:true,pause:true,allowHub:true,target:'.research-node[data-research="defense"]',mentor:'newton'},
  {title:'Volte à defesa',text:'Você pode abrir Pesquisa sempre que precisar revisar a árvore. Enquanto este painel está aberto, a batalha fica congelada.',instruction:'Clique no × para fechar a Pesquisa e continuar.',event:'research-close',pause:true,allowHub:true,target:'#hubClose',mentor:'newton'},
  {title:'Observatório',text:'O Observatório registra cada tipo de inimigo que você encontra. É onde você consulta HP base, armadura, escudo, velocidade, comportamento, fraquezas, resistências e a nota científica.',instruction:'Clique em OBSERVATÓRIO.',event:'codex-open',pause:true,target:'#codexBtn'},
  {title:'Transforme encontro em informação',text:'Novas entradas aparecem automaticamente quando um corpo é encontrado. Antes de uma missão difícil, use o Observatório para descobrir qual tipo de dano atravessa melhor a defesa do inimigo.',instruction:'As notas científicas também deixam claro o que representa astronomia real e o que é uma simplificação ou ficção de combate.',manual:true,pause:true,allowHub:true,target:'.codex-layout',mentor:'newton'},
  {title:'Feche o Observatório',text:'Você já conhece os três sistemas de progressão: Campanha libera conteúdo, Pesquisa melhora sua defesa permanentemente e Observatório transforma encontros em conhecimento estratégico.',instruction:'Clique no × para voltar ao campo.',event:'codex-close',pause:true,allowHub:true,target:'#hubClose',mentor:'newton'},
  {title:'Configurações e salvamento',text:'Na engrenagem ficam dificuldade, volumes, acessibilidade, exportação/importação do progresso e o botão para rever este tutorial principal.',instruction:'Os mini-tutoriais de construções novas são registrados separadamente e não se repetem depois de apresentados.',manual:true,pause:true,target:'#settingsBtn'},
  {title:'Tutorial concluído',text:'Pronto: você já viu o loop inteiro — preparar, gerar energia, atacar, bloquear, inspecionar, evoluir, responder aos checkpoints, pesquisar melhorias e consultar o Observatório.',instruction:'Daqui em diante, sempre que uma construção realmente nova entrar no seu deck, a simulação pausa por alguns segundos para explicar como ela funciona e onde ela encaixa na estratégia.',manual:true,pause:true,center:true,finish:true}
 ]
 const unlockGuides={
  miniSun:{role:'economia',text:'Produz energia em ciclos durante a batalha. Não causa dano: seu valor está em financiar novas torres e upgrades.',tip:'Proteja-o atrás de barreiras. Fusão eficiente melhora a produção e seus upgrades podem priorizar quantidade ou velocidade.'},
  mercury:{role:'atacante cinético',text:'Atirador barato e preciso. É uma base confiável contra rocha comum e cristal, mas sofre contra blindagem pesada.',tip:'Use várias unidades distribuídas pelas rotas. Balística orbital e a proximidade de um Mini Sol aumentam seu dano.'},
  belt:{role:'barreira de emergência',text:'O Cinturão é uma parede barata de vida média. Ele não ataca, mas segura ameaças rápidas quando você não pode pagar por um gigante gasoso.',tip:'Coloque na frente dos atacantes ou como segunda linha. É barato o bastante para tapar uma rota em emergência.'},
  venus:{role:'dano solar em área',text:'Vênus dispara explosões solares que atingem grupos. Ele é especialmente útil quando muitos inimigos pequenos chegam juntos.',tip:'Funciona melhor atrás de uma barreira, onde consegue repetir explosões antes que o grupo avance.'},
  mars:{role:'plasma e queimadura',text:'Marte aplica plasma e deixa dano contínuo por queimadura. É uma resposta forte contra cometas de gelo.',tip:'Mini Sol + Marte ativa a sinergia Plasma aquecido. Evite depender dele contra ameaças ígneas resistentes a plasma.'},
  earth:{role:'controle gravitacional',text:'A Terra combina dano gravitacional com lentidão. Ela reduz a pressão de inimigos rápidos e ajuda outras torres a acertarem por mais tempo.',tip:'Terra combina muito bem com Júpiter e, quando a Lua é liberada, ganha uma sinergia de maré.'},
  uranus:{role:'criogenia',text:'Urano reduz velocidade com rajadas criogênicas e é a resposta mais eficiente do deck contra meteoros superaquecidos.',tip:'Use para desacelerar ameaças rápidas. Perto de Netuno, o alvo congelado também pode receber um choque térmico mais forte.'},
  neptune:{role:'eletricidade em cadeia',text:'Netuno descarrega escudos e faz o raio saltar entre inimigos próximos, causando pressão em grupos protegidos.',tip:'Agrupe inimigos com controle gravitacional ou congele com Urano para aproveitar melhor sua cadeia elétrica.'},
  jupiter:{role:'barreira colossal',text:'Júpiter tem enorme quantidade de HP e recebe menos dano de contato. Sua função é parar a linha de frente, não eliminar inimigos.',tip:'Coloque-o à frente dos atacantes. Terra próxima cria a sinergia Gigante gravitacional.'},
  saturn:{role:'barreira versátil',text:'Saturno é uma barreira gasosa mais barata que Júpiter. Os anéis dão opções de especialização ofensiva ou regenerativa.',tip:'Use como linha de frente intermediária. Poço G pode manter grupos próximos dos anéis por mais tempo.'},
  gravity:{role:'controle de grupos',text:'O Poço G pulsa em uma área curta, prende grupos, reduz movimento e aplica vulnerabilidade gravitacional.',tip:'Não é uma torre de DPS principal. Posicione perto do caminho de maior tráfego para preparar alvos para Saturno ou Estrela de nêutrons.'},
  moon:{role:'satélite de suporte',text:'A Lua é diferente das outras cartas: ela não ocupa um espaço vazio. Selecione Lua e clique em um planeta já construído para anexá-la.',tip:'Ela intercepta parte do dano e amplia alcance. Anexada à Terra, fortalece o controle de maré.'},
  pulsar:{role:'perfurante de longa distância',text:'O Pulsar dispara um feixe que atravessa vários inimigos na mesma rota e ignora grande parte da proteção de armadura.',tip:'É excelente contra filas e blindados. Balística orbital também aumenta seu dano.'},
  neutron:{role:'impacto pesado perfurante',text:'A Estrela de nêutrons é cara e lenta, mas cada disparo causa dano enorme, atravessa armadura e explode em área.',tip:'Proteja o investimento e combine com Poço G: alvos presos recebem ainda mais valor dos impactos pesados.'},
  probe:{role:'suporte e marcação',text:'A Sonda não é uma torre de dano. Ela marca inimigos em rotas próximas para receberem mais dano e aumenta o alcance de aliados ao redor.',tip:'Coloque entre duas rotas ou no centro de um grupo de atacantes para multiplicar o valor de várias construções ao mesmo tempo.'}
 }
 let autoPaused=false,frame=0,scrollTick=0,currentUnlock=null,unlockQueue=[]
 const $=id=>document.getElementById(id)
 function mainActive(){return !tutorialDone&&waveIndex===0&&gameMode==='campaign'}
 function active(){return !!currentUnlock||mainActive()}
 function currentStep(){return currentUnlock?makeUnlockStep(currentUnlock):steps[Math.min(tutorialStep,steps.length-1)]}
 function hubOpen(){return !document.getElementById('hubModal')?.classList.contains('hidden')}
 function overlayBlocked(step=currentStep()){return checkpointInProgress||!quizModal.classList.contains('hidden')||!modal.classList.contains('hidden')||!labModal.classList.contains('hidden')||(hubOpen()&&!step?.allowHub)}
 function syncPauseUI(){if(!running)return;pauseBtn.textContent=paused?'▶':'Ⅱ';pauseBtn.setAttribute('aria-label',paused?'Continuar':'Pausar');startWaveBtn.disabled=!paused;startWaveBtn.textContent=paused?'Continuar batalha':'Batalha em curso'}
 function setAutoPause(should,label='Tutorial · simulação pausada'){
  if(should&&running&&!paused){paused=true;autoPaused=true;statusText.textContent=label;syncPauseUI()}
  if(!should&&autoPaused){paused=false;autoPaused=false;statusText.textContent='Batalha · sistema ativo';syncPauseUI()}
 }
 function suspend(){cancelAnimationFrame(frame);frame=0;$('tutorial').classList.add('hidden');document.body.classList.remove('tutorial-active')}
 function seenList(){if(!Array.isArray(Progress.data.unlockTipsSeen))Progress.data.unlockTipsSeen=['miniSun','mercury','belt'];return Progress.data.unlockTipsSeen}
 function markSeen(id){const list=seenList();if(!list.includes(id))list.push(id);unlockQueue=unlockQueue.filter(item=>item.id!==id);Progress.persist()}
 function finish(skipped=false){
  setAutoPause(false);tutorialDone=true;tutorialStep=steps.length;suspend()
  if(skipped)Progress.data.tutorialDismissed=true;else{Progress.data.tutorialDismissed=false;markSeen('jupiter');if(!Progress.data.achievements.includes('tutorial'))Progress.data.achievements.push('tutorial')}
  Progress.persist();saveRun();if(!skipped)showToast('Tutorial concluído · Primeiros passos desbloqueado');scanUnlocks('tutorial')
 }
 function finishUnlock(){
  if(!currentUnlock)return
  const id=currentUnlock.id;markSeen(id);currentUnlock=null;suspend()
  if(unlockQueue.length){tryStartUnlock();return}
  setAutoPause(false);saveRun();showToast(`${unitDefs[id]?.name||'Construção'} · tutorial registrado`)
 }
 function advance(){
  if(currentUnlock){finishUnlock();return}
  const step=steps[tutorialStep];if(!step?.manual)return
  if(step.finish){finish(false);return}
  tutorialStep=Math.min(steps.length-1,tutorialStep+1);if(steps[tutorialStep]?.unlockId)markSeen(steps[tutorialStep].unlockId);saveRun();render()
 }
 function event(name){
  if(!mainActive()||currentUnlock)return
  const step=steps[tutorialStep];if(step?.event!==name)return
  tutorialStep++;if(tutorialStep>=steps.length){finish(false);return}if(steps[tutorialStep]?.unlockId)markSeen(steps[tutorialStep].unlockId);saveRun();render()
 }
 function makeUnlockStep(item){
  const id=item.id,u=unitDefs[id],g=unlockGuides[id]||{role:u?.desc||'nova função',text:u?.tip||'Uma nova construção entrou no seu deck.',tip:'Teste a nova opção durante a preparação para entender seu papel.'}
  const source=item.source==='research'?'A Pesquisa acabou de liberar esta construção.':item.source==='checkpoint'?'Uma descoberta acabou de liberar esta construção.':'Esta construção acabou de entrar no seu deck.'
  return {title:`Nova construção · ${u?.name||id}`,text:`${source} ${g.text}`,instruction:`FUNÇÃO: ${String(g.role).toUpperCase()} · ${g.tip} A simulação fica pausada enquanto você lê esta dica.`,manual:true,pause:true,target:`.unit-card[data-unit="${id}"]`,mentor:waveIndex>=4?'newton':'kepler',unlock:true}
 }
 function scanUnlocks(source='campaign'){
  const seen=seenList(),queued=new Set(unlockQueue.map(x=>x.id));if(currentUnlock)queued.add(currentUnlock.id)
  for(const id of Object.keys(unitDefs))if(isUnlocked(id)&&!seen.includes(id)&&!queued.has(id))unlockQueue.push({id,source})
  if(!mainActive())tryStartUnlock()
 }
 function tryStartUnlock(){
  if(currentUnlock||mainActive()||!unlockQueue.length)return
  if(overlayBlocked({allowHub:false}))return
  while(unlockQueue.length){const item=unlockQueue.shift();if(!seenList().includes(item.id)&&isUnlocked(item.id)){currentUnlock=item;break}}
  if(!currentUnlock){setAutoPause(false);suspend();return}
  setAutoPause(true,'Nova construção · simulação pausada');render()
 }
 function resumeUnlocks(){scanUnlocks('campaign');if(!mainActive())tryStartUnlock();else render()}
 function hubLocked(mode){const step=currentStep();return mainActive()&&!currentUnlock&&!!step?.allowHub&&step.event!==mode+'-close'}
 function rectOf(left,top,width,height){return {left,top,width,height,right:left+width,bottom:top+height}}
 function getRect(step){
  if(step.center)return null
  if(step.target==='stage'&&step.point){const r=gameStage.getBoundingClientRect(),[xr,yr,size]=step.point,sz=Math.min(size||110,Math.max(78,r.width*.11));return rectOf(r.left+r.width*xr-sz/2,r.top+r.height*yr-sz/2,sz,sz)}
  if(step.target==='enemy'){const e=enemies.find(n=>n.hp>0);if(e){const r=gameStage.getBoundingClientRect(),sz=Math.max(72,Math.min(135,e.size*r.width/1280*1.45)),x=r.left+e.x/1280*r.width,y=r.top+e.y/720*r.height;return rectOf(x-sz/2,y-sz/2,sz,sz)}const r=gameStage.getBoundingClientRect();return rectOf(r.left+r.width*.68,r.top+r.height*.13,Math.min(180,r.width*.2),Math.min(150,r.height*.3))}
  if(step.target==='orb'){const o=energyOrbs[0];if(o){const r=gameStage.getBoundingClientRect(),sz=92,x=r.left+o.x/1280*r.width,y=r.top+o.y/720*r.height;return rectOf(x-sz/2,y-sz/2,sz,sz)}return gameStage.getBoundingClientRect()}
  if(step.target==='tower'){const d=defenders.find(n=>n.type==='jupiter')||defenders[defenders.length-1];if(d){const r=gameStage.getBoundingClientRect(),sz=105,x=r.left+d.x/1280*r.width,y=r.top+d.y/720*r.height;return rectOf(x-sz/2,y-sz/2,sz,sz)}return gameStage.getBoundingClientRect()}
  const el=step.target?document.querySelector(step.target):null;if(!el||el.offsetParent===null)return null
  let r=el.getBoundingClientRect();if(r.top<8||r.bottom>innerHeight-8){el.scrollIntoView({behavior:'auto',block:'center',inline:'center'});r=el.getBoundingClientRect()}return r
 }
 function placeCard(rect,center){
  const card=$('tutorialCard');card.style.left=card.style.right=card.style.top=card.style.bottom='auto';card.classList.toggle('centered',!!center)
  if(center){card.style.left='50%';card.style.top='50%';return}
  if(innerWidth<720){card.style.left='12px';card.style.right='12px';card.style.bottom='12px';return}
  const w=Math.min(390,innerWidth-32),h=card.offsetHeight||250,gap=24;let left=rect.right+gap,top=Math.max(16,Math.min(innerHeight-h-16,rect.top+rect.height/2-h/2))
  if(left+w>innerWidth-16)left=Math.max(16,rect.left-w-gap);if(rect.top<120&&rect.width>innerWidth*.45){left=Math.max(16,(innerWidth-w)/2);top=Math.min(innerHeight-h-16,rect.bottom+20)}card.style.left=left+'px';card.style.top=top+'px'
 }
 function applyRect(rect,center){
  const shades=[...document.querySelectorAll('#tutorial .tutorial-shade')],spot=$('tutorialSpotlight'),pointer=$('tutorialPointer')
  if(!rect){shades[0].style.cssText='left:0;top:0;width:100vw;height:100vh';for(let i=1;i<4;i++)shades[i].style.cssText='width:0;height:0';spot.classList.add('hidden');pointer.classList.add('hidden');placeCard(null,true);return}
  const pad=10,l=Math.max(0,rect.left-pad),t=Math.max(0,rect.top-pad),r=Math.min(innerWidth,rect.right+pad),b=Math.min(innerHeight,rect.bottom+pad),w=Math.max(0,r-l),h=Math.max(0,b-t)
  shades[0].style.cssText=`left:0;top:0;width:100vw;height:${t}px`;shades[1].style.cssText=`left:0;top:${t}px;width:${l}px;height:${h}px`;shades[2].style.cssText=`left:${r}px;top:${t}px;width:${Math.max(0,innerWidth-r)}px;height:${h}px`;shades[3].style.cssText=`left:0;top:${b}px;width:100vw;height:${Math.max(0,innerHeight-b)}px`
  spot.classList.remove('hidden');spot.style.cssText=`left:${l}px;top:${t}px;width:${w}px;height:${h}px`;pointer.classList.remove('hidden');pointer.style.left=Math.max(12,Math.min(innerWidth-45,l+w/2-18))+'px';pointer.style.top=Math.max(8,t-43)+'px';pointer.style.transform='rotate(90deg)';placeCard(rectOf(l,t,w,h),false)
 }
 function updateSpotlight(){
  if(!active()||$('tutorial').classList.contains('hidden'))return
  const step=currentStep();if(overlayBlocked(step)){suspend();return}applyRect(getRect(step),step.center)
  if(['enemy','orb','tower'].includes(step.target))frame=requestAnimationFrame(updateSpotlight)
 }
 function render(){
  const el=$('tutorial');if(!active()){setAutoPause(false);suspend();return}
  const step=currentStep();if(!step){if(mainActive())finish(false);else finishUnlock();return}if(overlayBlocked(step)){suspend();return}
  setAutoPause(!!step.pause,step.unlock?'Nova construção · simulação pausada':'Tutorial · simulação pausada');el.classList.remove('hidden');document.body.classList.add('tutorial-active')
  $('tutorialCounter').textContent=step.unlock?'NOVA CONSTRUÇÃO':`TUTORIAL · ${Math.min(tutorialStep+1,steps.length)}/${steps.length}`;$('tutorialTitle').textContent=step.title;$('tutorialText').textContent=step.text;$('tutorialInstruction').textContent=step.instruction||'';$('tutorialMentor').src=assetPath((step.mentor||(tutorialStep>=23?'newton':'kepler'))+'.png')
  const next=$('tutorialNext');next.classList.toggle('hidden',!step.manual);next.innerHTML=step.finish?'Concluir tutorial <span>✓</span>':step.unlock?(unlockQueue.length?'Próxima construção <span>→</span>':'Entendi <span>✓</span>'):'Continuar <span>→</span>'
  $('tutorialSkip').classList.toggle('hidden',!!step.unlock);$('tutorialSkipText').classList.toggle('hidden',!!step.unlock)
  cancelAnimationFrame(frame);requestAnimationFrame(()=>{const target=step.target&&typeof step.target==='string'?document.querySelector(step.target):null;if(target?.classList.contains('unit-card')){const deck=$('cardDeck'),dr=deck.getBoundingClientRect(),tr=target.getBoundingClientRect();if(window.matchMedia('(min-width:981px)').matches)deck.scrollTop+=tr.top-dr.top-(dr.height-tr.height)/2;else deck.scrollLeft+=tr.left-dr.left-(dr.width-tr.width)/2}updateSpotlight()})
 }
 function restart(){setAutoPause(false);currentUnlock=null;unlockQueue=[];Progress.data.tutorialDismissed=false;startStage(0,'campaign');tutorialDone=false;tutorialStep=0;if(Progress.data.resume){Progress.data.resume.tutorialDone=false;Progress.data.resume.tutorialStep=0}saveRun();render();showToast('Tutorial guiado reiniciado')}
 function refreshPosition(){if(!active()||$('tutorial').classList.contains('hidden'))return;const step=currentStep();if(overlayBlocked(step))return;cancelAnimationFrame(scrollTick);scrollTick=requestAnimationFrame(()=>{scrollTick=0;updateSpotlight()})}
 window.addEventListener('resize',refreshPosition);window.addEventListener('scroll',refreshPosition,true)
 return {steps,event,render,advance,finish,restart,scanUnlocks,resumeUnlocks,markSeen,hubLocked,get unlockActive(){return !!currentUnlock}}
})()

var Interface=(()=>{
 const hub=document.getElementById('hubModal'),content=document.getElementById('hubContent'),title=document.getElementById('hubTitle'),intro=document.getElementById('hubIntro'),kicker=document.getElementById('hubKicker')
 let wasPaused=false,focusBefore=null,resetArmed=false,lastPreview='',activeMode=null
 const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
 function open(mode){
  if(checkpointInProgress){showToast('Conclua a descoberta antes de abrir outro painel.');return}
  if(hub.classList.contains('hidden')){wasPaused=paused;focusBefore=document.activeElement}
  hideTowerPanel();paused=true;hub.classList.remove('hidden');content.innerHTML='';resetArmed=false;activeMode=mode
  if(mode==='campaign')campaign();if(mode==='research')research();if(mode==='codex')codex();if(mode==='settings')settings();if(mode==='debug')debug()
  document.getElementById('hubClose').focus();TutorialGuide.event(mode+'-open');TutorialGuide.render()
 }
 function close(){const closing=activeMode;if(closing&&TutorialGuide.hubLocked(closing)){showToast('Conclua esta etapa do tutorial antes de fechar o painel.');TutorialGuide.render();return}hub.classList.add('hidden');activeMode=null;paused=wasPaused;if(gameOver)paused=true;focusBefore?.focus();if(closing)TutorialGuide.event(closing+'-close');TutorialGuide.resumeUnlocks()}
 function heading(k,t,p){kicker.textContent=k;title.textContent=t;intro.textContent=p}
 function campaign(){
  heading('CAMPANHA · OITO CAPÍTULOS','Uma descoberta por órbita.','Kepler abre o caminho. Newton explica a força. Sua defesa cresce com o que você descobre.')
  const stars=Object.values(Progress.data.stars).reduce((a,b)=>a+Number(b),0)
  content.innerHTML=`<div class="campaign-summary"><div><strong>${stars}<small>/24</small></strong><span>estrelas</span></div><div><strong>${Progress.data.research}</strong><span>pontos de pesquisa</span></div><div><strong>${Progress.data.codex.length}</strong><span>corpos catalogados</span></div><img src="${assetPath((Progress.data.unlocked>=5?'newton':'kepler')+'.png')}" alt="Mentor"></div><div class="campaign-grid"></div><div class="extra-modes"><button id="endlessBtn" class="mode-card"><strong>Órbita infinita <span>∞</span></strong><p>${Progress.data.unlocked>=5?'Ondas crescentes, pesquisa contínua e defesa persistente.':'Complete o capítulo 4 para desbloquear.'}</p><small>Recorde: onda ${Progress.data.endlessBest}</small></button><button id="dailyBtn" class="mode-card"><strong>Desafio do dia <span>✧</span></strong><p>Uma missão com um modificador que muda a estratégia.</p><small id="dailyModifier"></small></button></div><div class="achievement-strip"></div>`
  const grid=content.querySelector('.campaign-grid')
  waves.forEach((w,i)=>{
   const unlocked=i<Progress.data.unlocked,star=Number(Progress.data.stars[i]||0),b=document.createElement('button');b.className='campaign-node'+(unlocked?'':' locked')+(i===waveIndex?' current':'');b.disabled=!unlocked;b.innerHTML=`<span class="chapter-index">${unlocked?String(i+1).padStart(2,'0'):'🔒'}</span><span class="chapter-topic">${w.topic}</span><strong>${w.short}</strong><span class="chapter-stars">${'★'.repeat(star)}${'☆'.repeat(3-star)}</span><small>${unlocked?(Progress.data.scores[i]||0)+' pts':'Capítulo anterior necessário'}</small>`;b.onclick=()=>{const fresh=()=>{close();modal.classList.add('hidden');startStage(i);showToast(w.dialogue)};if(running&&!gameOver){content.innerHTML=`<div class="switch-stage"><h3>Iniciar ${escape(w.short)}?</h3><p>A pesquisa e as estrelas continuam salvas. A batalha em andamento será substituída.</p><button id="confirmStage" class="primary-btn">Iniciar capítulo</button><button id="cancelStage" class="secondary-btn">Continuar batalha atual</button></div>`;document.getElementById('confirmStage').onclick=fresh;document.getElementById('cancelStage').onclick=campaign}else fresh()};grid.appendChild(b)
  })
  const modifiers=['inner','noSun','fast','noUpgrades','eccentric'],today=new Date().toLocaleDateString('sv-SE'),hash=[...today].reduce((s,c)=>s*31+c.charCodeAt(0),7)>>>0,modifier=modifiers[hash%modifiers.length],labels={inner:'Apenas rotas internas',noSun:'Sem Mini Sóis',fast:'Velocidade dos inimigos +45%',noUpgrades:'Sem upgrades',eccentric:'Alta excentricidade'}
  document.getElementById('dailyModifier').textContent=labels[modifier]+' · '+today
  const endless=document.getElementById('endlessBtn');endless.disabled=Progress.data.unlocked<5;endless.onclick=()=>{close();startStage(3,'endless');showToast('Defesas persistem entre as ondas. Prepare-se para escalar.')}
  document.getElementById('dailyBtn').onclick=()=>{close();startStage(Math.min(3,Progress.data.unlocked-1),'challenge',modifier);if(modifier==='noSun')energy+=220;if(modifier==='eccentric')orbitConfig.e=.8;updateHud();preview();saveRun();showToast(labels[modifier])}
  const achievements={muralha:'Muralha intacta','sem-superboss':'Órbita precisa',minimalista:'Defesa minimalista',reserva:'Reserva estelar',campanha:'Sistema defendido',tutorial:'Primeiros passos'}
  content.querySelector('.achievement-strip').innerHTML=Object.entries(achievements).map(([id,name])=>`<span class="${Progress.data.achievements.includes(id)?'earned':''}">✧ ${name}</span>`).join('')
 }
 function research(){
  content.innerHTML=''
  heading('PESQUISA PERSISTENTE',`${Progress.data.research} pontos. Novas possibilidades.`,'Complete missões e acerte descobertas. As melhorias acompanham você em todos os capítulos.')
  const groups=[...new Set(Content.research.map(n=>n.category))]
  for(const group of groups){
   const section=document.createElement('section');section.className='research-category';section.innerHTML=`<h3>${group}</h3><div class="research-grid"></div>`;content.appendChild(section)
   for(const node of Content.research.filter(n=>n.category===group)){
    const owned=Progress.has(node.id),ready=node.needs.every(n=>Progress.has(n)),b=document.createElement('button');b.className='research-node'+(owned?' owned':'');b.dataset.research=node.id;b.disabled=owned||!ready||Progress.data.research<node.cost;b.innerHTML=`<span class="node-symbol">${owned?'✓':'✧'}</span><strong>${node.name}</strong><p>${node.desc}</p><small>${owned?'Pesquisado':!ready?'Requer: '+node.needs.map(id=>Content.research.find(n=>n.id===id).name).join(' + '):node.cost+' pontos'}</small>`;b.onclick=()=>{if(!node.needs.every(n=>Progress.has(n))||Progress.has(node.id)||Progress.data.research<node.cost)return;Progress.data.research-=node.cost;Progress.data.nodes.push(node.id);if(node.id==='defense')for(const d of defenders){const stats=getTowerStats(d);d.hp+=stats.maxHp-d.maxHp;d.maxHp=stats.maxHp}Progress.persist();AudioSystem.play('upgrade');buildDeck();updateHud();saveRun();TutorialGuide.scanUnlocks('research');research();document.getElementById('researchValue').textContent=Progress.data.research;TutorialGuide.render()};section.querySelector('.research-grid').appendChild(b)
   }
  }
 }
 function codex(){
  heading('OBSERVATÓRIO','Todo encontro deixa uma descoberta.','Passe o cursor nos inimigos para ler a defesa. Os dados abaixo descrevem o combate; as notas distinguem ciência e ficção.')
  const known=Progress.data.codex,all={...enemyDefs}
  superBosses.forEach((b,i)=>all['super'+i]={...b,tag:'SUPERBOSS',behavior:['binaryBoss','cometBoss','rogueBoss','solarBoss','vortex'][i],resist:b.resist})
  content.innerHTML='<div class="codex-layout"><div class="codex-list"></div><article id="codexDetails" class="codex-details"><span class="panel-kicker">REGISTRO DE CAMPO</span><h3>Escolha um corpo catalogado.</h3><p>Novas entradas aparecem ao encontrar o corpo na batalha.</p></article></div>'
  const list=content.querySelector('.codex-list')
  for(const [id,d] of Object.entries(all)){
   const unlocked=known.includes(id),b=document.createElement('button');b.className='codex-item';b.disabled=!unlocked;b.innerHTML=`<img src="${assetPath(imageMap[d.img])}" alt=""><span>${unlocked?d.name:'Sinal desconhecido'}<small>${unlocked?d.tag:'Não encontrado'}</small></span><span>${unlocked?'↗':'🔒'}</span>`;b.onclick=()=>{
    const weak=Object.entries(d.resist).filter(([,v])=>v>1.15),resist=Object.entries(d.resist).filter(([,v])=>v<.85)
    document.getElementById('codexDetails').innerHTML=`<img class="codex-hero" src="${assetPath(imageMap[d.img])}" alt="${escape(d.name)}"><span class="panel-kicker">${d.tag}</span><h3>${d.name}</h3><div class="codex-stat-grid"><span>HP <strong>${d.hp}</strong></span><span>Armadura <strong>${d.armor}</strong></span><span>Escudo <strong>${d.shield}</strong></span><span>Velocidade <strong>${d.speed} px/s</strong></span></div><p><strong>Comportamento</strong><br>${behaviorLabel(d.behavior)}</p><p class="effective"><strong>↑ Dano eficaz</strong><br>${weak.map(([type,value])=>damageNames[type]+' ×'+value.toFixed(2)).join(' · ')||'Sem vulnerabilidade especial.'}</p><p class="resisted"><strong>↓ Resistências</strong><br>${resist.map(([type,value])=>damageNames[type]+' ×'+value.toFixed(2)).join(' · ')||'Sem resistência especial.'}</p><div class="scientific-note"><strong>NOTA CIENTÍFICA</strong><p>${Content.facts[id]||'Superboss ficcional. As habilidades de combate não representam um comportamento astronômico real.'}</p></div><small>Valores base, antes de dificuldade e escala da missão.</small>`;list.querySelectorAll('button').forEach(n=>n.classList.toggle('selected',n===b))};list.appendChild(b)
  }
 }
 function applySettings(){
  const s=Progress.data.settings;document.body.classList.toggle('high-contrast',!!s.contrast);document.body.classList.toggle('large-ui',!!s.large);document.body.classList.toggle('reduced-motion',!!s.reduced);document.getElementById('difficultyLabel').textContent=({student:'ESTUDANTE',standard:'PADRÃO',expert:'ASTROFÍSICO'})[s.difficulty]||'PADRÃO';AudioSystem.volumes()
 }
 function settings(){
  heading('CONFIGURAÇÕES','No seu ritmo.','Ajuste som, leitura e movimento. A dificuldade selecionada vale ao iniciar uma nova missão.')
  const s=Progress.data.settings
  content.innerHTML=`<div class="settings-grid"><label class="setting-row">Dificuldade<select id="difficultySelect"><option value="student">Estudante</option><option value="standard">Padrão</option><option value="expert">Astrofísico</option></select></label><div id="volumeControls"></div><div id="accessibilityControls"></div></div><div class="save-actions"><span>Progresso local · versão ${Progress.data.version}</span><button id="exportSave" class="secondary-control">Exportar progresso</button><label class="secondary-control file-label">Importar progresso<input id="importSave" type="file" accept=".json,application/json"></label><button id="resetSave" class="danger-control">Reiniciar progresso</button><button id="tutorialReplay" class="secondary-btn">Rever tutorial guiado</button><p id="saveFeedback" role="status"></p></div><div class="controls-guide"><h3>Controles</h3><p>Clique em um cartão e em um espaço. Clique no defensor para inspecionar, evoluir ou vender. Lua: clique em um planeta existente.</p><p>1–0: selecionar · Espaço: pausar · Esc: cancelar poder/fechar painel · Tab: navegar · Campo com foco: setas e Enter · C: coletar energia · Roda do mouse: percorrer o deck.</p></div>`
  const difficulty=document.getElementById('difficultySelect');difficulty.value=s.difficulty;difficulty.onchange=()=>{s.difficulty=difficulty.value;Progress.persist();applySettings()}
  for(const [id,label] of [['master','Volume geral'],['music','Música'],['sfx','Efeitos']]){const l=document.createElement('label');l.className='setting-row';l.innerHTML=`${label}<input type="range" min="0" max="1" step="0.05" value="${s[id]}" aria-label="${label}">`;l.querySelector('input').oninput=e=>{s[id]=Number(e.target.value);Progress.persist();applySettings()};document.getElementById('volumeControls').appendChild(l)}
  for(const [id,label] of [['numbers','Números de dano'],['shake','Tremor de câmera'],['reduced','Movimento reduzido'],['contrast','Alto contraste'],['large','Interface ampliada']]){const l=document.createElement('label');l.className='setting-row';l.innerHTML=`${label}<input type="checkbox" ${s[id]?'checked':''}>`;l.querySelector('input').onchange=e=>{s[id]=e.target.checked;Progress.persist();applySettings()};document.getElementById('accessibilityControls').appendChild(l)}
  document.getElementById('exportSave').onclick=()=>{saveRun();const a=document.createElement('a'),url=URL.createObjectURL(new Blob([Progress.export()],{type:'application/json'}));a.href=url;a.download='orbital-progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.getElementById('saveFeedback').textContent='Progresso exportado.'}
  document.getElementById('importSave').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;Progress.import(await file.text());loadRun();applySettings();buildDeck();paused=true;wasPaused=running;document.getElementById('saveFeedback').textContent='Progresso importado. Feche este painel para continuar.'}catch(err){document.getElementById('saveFeedback').textContent='Arquivo inválido. Use um progresso exportado pelo ORBITAL.'}}
  document.getElementById('resetSave').onclick=()=>{if(!resetArmed){resetArmed=true;document.getElementById('resetSave').textContent='Confirmar reinício completo';document.getElementById('saveFeedback').textContent='Isso apaga capítulos, pesquisa, recordes e a batalha salva. Clique novamente para confirmar.';return}Progress.reset();wasPaused=false;close();startStage(0);applySettings();showToast('Progresso reiniciado.')}
  document.getElementById('tutorialReplay').onclick=()=>{wasPaused=false;close();TutorialGuide.restart()}
 }
 function preview(){
  const w=waves[waveIndex],key=waveIndex+'-'+running+'-'+gameMode+'-'+randomModifier
  if(key===lastPreview)return;lastPreview=key
  document.getElementById('phaseBadge').textContent=running?'BATALHA':'PREPARAÇÃO';document.getElementById('incomingEnemies').innerHTML=w.spawns.map(([type,count])=>{const d=enemyDefs[type];return `<span class="incoming-item" title="${d.name}: ${behaviorLabel(d.behavior)}"><img src="${assetPath(imageMap[d.img])}" alt=""><span>${d.name}<b>×${count}</b></span></span>`}).join('');document.getElementById('laneInfo').textContent=w.lanes.length+' rotas · '+(randomModifier?({inner:'rotas 1 e 2',noSun:'sem Mini Sóis',fast:'velocidade +45%',noUpgrades:'sem upgrades',eccentric:'alta excentricidade'})[randomModifier]:w.topic);document.getElementById('wavePreview').classList.toggle('during-battle',running)
  document.getElementById('labMentor').src=waveIndex<4?assetPath('kepler.png'):assetPath('newton.png');document.getElementById('labTitle').textContent=waveIndex<4?'Laboratório de Kepler':'Laboratório orbital · Newton'
 }
 function tutorial(){TutorialGuide.render()}
 const powersData=[['flare','☼','Erupção','145 dano solar em todos os alvos'],['freeze','❄','Congelar','Reduz movimento por 6 segundos'],['shift','⇄','Manobra','Move uma construção para um espaço livre'],['slingshot','↗','Estilingue','Lança um inimigo para trás'],['eclipse','◐','Eclipse','Interrompe inimigos por 4 segundos'],['supernova','✹','Supernova','850 dano perfurante em todos os alvos']]
 function powers(){
  const rail=document.getElementById('powerRail')
  if(!rail.children.length)for(const [id,icon,name,desc] of powersData){const b=document.createElement('button');b.dataset.power=id;b.title=name+' · '+desc;b.setAttribute('aria-label',name+' · '+desc);b.innerHTML=`<span>${icon}</span><small>${name}</small><b></b>`;b.onclick=()=>usePower(id);rail.appendChild(b)}
  for(const b of rail.children){const id=b.dataset.power,unlocked=!['slingshot','eclipse','supernova'].includes(id)||(id==='supernova'?Progress.has('supernova'):Progress.has('powers'));b.classList.toggle('hidden',!unlocked);b.disabled=!running||paused||gameOver||!powerCharges[id];b.querySelector('b').textContent=powerCharges[id]||0}
  document.getElementById('researchValue').textContent=Progress.data.research
 }
 function bossBar(){
  const boss=enemies.find(e=>e.isSuperboss)||enemies.find(e=>e.tag==='BOSS'||['blackhole','binary'].includes(e.type)),bar=document.getElementById('bossBar');bar.classList.toggle('hidden',!boss);if(!boss)return;document.getElementById('bossName').textContent=boss.name;document.getElementById('bossPhaseLabel').textContent='Fase '+boss.bossPhase+' · '+Math.ceil(boss.hp)+' HP'+(boss.isSuperboss?' · reforços suspensos':'');document.getElementById('bossHP').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';bar.classList.toggle('superboss',boss.isSuperboss)
 }
 function debug(){
  heading('DESENVOLVEDOR · F8','Laboratório de testes.','Controles locais para verificar combate, fases e checkpoints.')
  content.innerHTML=`<div class="debug-grid"><button id="debugEnergy">+1.000 energia</button><button id="debugKill">Eliminar todos os alvos</button><button id="debugCheckpoint">Abrir próximo checkpoint</button><button id="debugSuper">Invocar superboss</button><label>Inimigo<select id="debugEnemy">${Object.entries(enemyDefs).map(([id,d])=>`<option value="${id}">${d.name}</option>`).join('')}</select></label><button id="debugSpawn">Invocar na rota 3</button><label>Capítulo<select id="debugStage">${waves.map((w,i)=>`<option value="${i}">${w.short}</option>`).join('')}</select></label><button id="debugSetStage">Carregar capítulo</button><label><input id="debugInvincible" type="checkbox" ${debugState.invincible?'checked':''}>Invencibilidade</label><label><input id="debugHitboxes" type="checkbox" ${debugState.hitboxes?'checked':''}>Hitboxes</label><label><input id="debugFPS" type="checkbox" ${debugState.fps?'checked':''}>FPS</label><label><input id="debugSlow" type="checkbox" ${debugState.slow?'checked':''}>Câmera lenta</label></div>`
  document.getElementById('debugEnergy').onclick=()=>{energy=Math.min(9999,energy+1000);updateHud();showToast('+1.000 energia')}
  document.getElementById('debugKill').onclick=()=>{enemies.forEach(e=>e.hp=0);close();paused=false}
  document.getElementById('debugCheckpoint').onclick=()=>{if(checkpointIndex>=3)return;close();running=true;gameStarted=true;showCheckpoint(waveIndex,checkpointIndex)}
  document.getElementById('debugSuper').onclick=()=>{close();running=true;gameStarted=true;paused=false;spawnSuperboss(waveIndex,Math.min(2,checkpointIndex))}
  document.getElementById('debugSpawn').onclick=()=>{const type=document.getElementById('debugEnemy').value;enemies.push(createEnemy(type,2,{x:1100}));Progress.discover(type);close();running=true;gameStarted=true;paused=false}
  document.getElementById('debugSetStage').onclick=()=>{const phase=Number(document.getElementById('debugStage').value);close();startStage(phase)}
  for(const [id,property] of [['debugInvincible','invincible'],['debugHitboxes','hitboxes'],['debugFPS','fps'],['debugSlow','slow']])document.getElementById(id).onchange=e=>debugState[property]=e.target.checked
 }
 document.getElementById('campaignBtn').onclick=()=>open('campaign');document.getElementById('researchBtn').onclick=()=>open('research');document.getElementById('codexBtn').onclick=()=>open('codex');document.getElementById('settingsBtn').onclick=()=>open('settings');document.getElementById('hubClose').onclick=close
 document.getElementById('tutorialSkip').onclick=()=>TutorialGuide.finish(true);document.getElementById('tutorialSkipText').onclick=()=>TutorialGuide.finish(true);document.getElementById('tutorialNext').onclick=()=>TutorialGuide.advance()
 document.getElementById('speedBtn').onclick=()=>{speedScale=speedScale===1?2:speedScale===2&&Progress.has('supernova')?3:1;document.getElementById('speedBtn').textContent=speedScale+'×'}
 document.getElementById('resultCampaignBtn').onclick=()=>{phaseCompletePending=false;modal.classList.add('hidden');gameOver=true;Progress.data.resume=null;Progress.persist();open('campaign')}
 window.addEventListener('keydown',e=>{
  if(e.key==='F8'){e.preventDefault();if(hub.classList.contains('hidden'))open('debug');else close()}
  if(e.key==='Escape'&&!hub.classList.contains('hidden'))close()
  if(e.key==='Tab'){
   const active=[...document.querySelectorAll('.modal:not(.hidden)')].pop();if(!active)return
   const elements=[...active.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(n=>n.offsetParent!==null),first=elements[0],last=elements[elements.length-1]
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
  }
 })
 applySettings();loadRun();preview();tutorial();powers();TutorialGuide.scanUnlocks('load')
 return {open,close,preview,tutorial,powers,bossBar,applySettings}
})()
