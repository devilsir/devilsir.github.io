/* Registered module: team-world */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('team-world',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,P=V.Progress,W=V.World,L=V.Living,esc=V.escape;
  const {kits,recruits}=V.TeamData;
  const limit=6,questId=id=>'recruit-'+id,siteId=id=>'team-contact-'+id;
  const names={cora:'Cora',bento:'Bento',ines:'Inês',luzia:'Luzia',denis:'Denis',dandara:'Dandara',jaci:'Jaci',jamila:'Jamila'};
  const name=id=>id===V.state?.character?V.state.name:(V.content.characters[id]?.name||names[id]||id);
  const quests=new Map(),recruitById=new Map(recruits.map(r=>[r.id,r]));
  const skills=new Map(Object.values(kits).flatMap(kit=>kit.skills.map(skill=>[skill.id,skill])));
  for(const r of recruits){
    const id=questId(r.id),q={id,map:r.map,owner:r.id,title:r.title,brief:r.brief,reward:'Recrutamento',
      steps:[
        {kind:'recruit',targets:[id+':meet'],label:'Encontre '+name(r.id)+' no ponto de encontro da missão.'},
        {kind:'recruit',targets:[id+':trial'],label:'Resolva a proposta junto à pessoa que convidou você.'}
      ]};
    quests.set(id,q);L.missions.push(q);
  }
  const atlasFile='assets/adventure/turn-interface/team-effects.webp';
  const art=V.TeamArt={
    image:null,
    icon(index){return `<i class="team-icon" style="--team-x:${index%4*100/3}%;--team-y:${Math.floor(index/4)*100/3}%" aria-hidden="true"></i>`;},
    draw(c,row,x,y,size,age,duration){
      if(!V.Assets.ready(this.image))return false;
      const frame=V.clamp(Math.floor(age/Math.max(.01,duration)*6),0,5),cell=144;
      c.drawImage(this.image,frame*cell,row*cell,cell,cell,x-size/2,y-size/2,size,size);
      return true;
    }
  };
  const load=V.Assets.load.bind(V.Assets);
  V.Assets.load=async function(...args){
    const image=new Promise(resolve=>{
      const img=V.Assets.image();art.image=img;img.onload=img.onerror=resolve;img.src=atlasFile;V.AssetLoader.register(img,resolve);
    });
    const [result]=await Promise.all([load(...args),image]);
    return result;
  };

  const team=V.Team={
    limit,kits,recruits,skills,questId,siteId,
    unlocked(a=P.ensure()){
      const story=Array.isArray(a?.companions)?a.companions:[];
      const recruited=recruits.filter(r=>V.state?.sideQuests?.[questId(r.id)]?.done).map(r=>r.id);
      return [...new Set([...story,...recruited])].filter(id=>id!==V.state?.character&&Object.hasOwn(kits,id));
    },
    lineup(a=P.ensure()){
      const available=new Set(this.unlocked(a));
      return [...new Set(Array.isArray(a?.party)?a.party:[])].filter(id=>available.has(id)).slice(0,limit-1);
    },
    enabled(r){return !!V.state?.flags?.prologueDone&&unlocked(quests.get(questId(r.id)));},
    edit(id,offset=0){
      if(!V.state||V.Game.mode!=='explore'||V.Combat.active||!this.unlocked().includes(id))return false;
      const a=P.ensure(),party=this.lineup(a),index=party.indexOf(id);
      if(offset){
        const destination=index+offset;
        if(index<0||destination<0||destination>=party.length)return false;
        [party[index],party[destination]]=[party[destination],party[index]];
      }else if(index>=0)party.splice(index,1);
      else{
        if(party.length>=limit-1)return false;
        party.push(id);
      }
      a.party=party;V.Save.save();return true;
    },
    combatSkills(actor,battle){
      if(actor?.side!=='ally')return [];
      const own=actor.id==='player'?V.AdventureData.skills.filter(s=>P.ensure().skills[s.id]):[];
      return battle?.intro?own:own.concat(kits[actor.character]?.skills||[]);
    },
    stats(id,base){
      const ratios={health:.84,focus:.82,attack:.86,defense:.93,knowledge:.90,agility:.94,resolve:.95,...kits[id]?.stats};
      return Object.fromEntries(Object.entries(base).map(([key,value])=>[key,Math.max(1,Math.round(value*(ratios[key]??1)))]));
    },
    install(){
      for(const r of recruits){
        const m=W.maps[r.map];
        if(!m||m.objects.some(o=>o.id===siteId(r.id)))continue;
        const [tx,ty]=m.design.spawn||[m.width/2,m.height-5];
        const contact=m.objects.find(o=>o.character===r.id||o.resident?.id===r.id);
        const origin=contact||{x:(tx+.5)*48,y:(ty+.5)*48};
        const spots=[[72,45],[-72,45],[54,-56],[-54,-56],[0,94]].map(([dx,dy])=>({x:origin.x+dx,y:origin.y+dy}));
        const point=spots.find(p=>V.FastTravel.clear(m,p,15)&&!m.objects.some(o=>V.dist(o,p)<48))
          ||V.Rooms.safe(m,{x:origin.x+80,y:origin.y+55},15);
        if(!point)continue;
        m.objects.push({...point,id:siteId(r.id),type:'team-contact',recruit:r.id,label:'Recrutamento · '+name(r.id),interactionRange:83});
      }
    },
    progress(r){return V.state.sideQuests?.[questId(r.id)];},
    track(r){
      if(!this.enabled(r)||this.progress(r)?.done)return false;
      L.ensure();
      const id=questId(r.id);
      V.state.sideQuests[id]||={started:true,step:0,done:false,progress:[]};
      V.state.trackedQuest=id;
      P.ensure().tracked={object:siteId(r.id),map:r.map,recruit:r.id,label:'Recrutar '+name(r.id)+' · '+r.title};
      V.ObjectiveGuide.invalidate();L.updateHUD();V.Save.save();
      return true;
    },
    mission(r){
      const member=kits[r.id],s=this.progress(r),enabled=this.enabled(r);
      V.UI.modal(r.title,name(r.id)+' · '+V.FastTravel.name(r.map),
        `<div class="team-brief">${V.UI.portrait(r.id,0,84)}<div><p>${esc(r.brief)}</p><b>${art.icon(member.icon)} ${esc(member.role)}</b></div></div>
        <ol class="mission-steps"><li>${s?.step?'✓ ':''}Conhecer a proposta no ponto de encontro.</li><li>${s?.done?'✓ ':''}Resolver a proposta para convidar ${esc(name(r.id))}.</li></ol>${enabled?'':'<p class="note">Disponível após a primeira vigília e a abertura do distrito.</p>'}`,
        `<button type="button" id="team-mission-back" class="secondary">Voltar à equipe</button><button type="button" id="team-mission-map" class="secondary">Ver local no atlas</button>${s?.done?'':`<button type="button" id="team-mission-track" class="primary" ${enabled?'':'disabled'}>${s?.started?'Rastrear missão':'Aceitar e rastrear'}</button>`}`);
      V.UI.paintPortraits();
      V.$('#team-mission-back').onclick=()=>this.panel('recruit',r.id);
      V.$('#team-mission-map').onclick=()=>V.WorldAtlas.open('world',r.map);
      const track=V.$('#team-mission-track');
      if(track)track.onclick=()=>{if(this.track(r))V.UI.close();};
    },
    meet(r){
      if(!this.enabled(r)||W.current?.id!==r.map)return;
      if(this.progress(r)?.done)return this.panel('lineup',r.id);
      this.track(r);
      const id=questId(r.id),step=this.progress(r).step;
      V.UI.modal(r.title,name(r.id),
        `<div class="team-brief">${V.UI.portrait(r.id,0,88)}<p>${esc(step?r.question:r.brief)}</p></div>${step?`<div class="stack">${r.answers.map((answer,i)=>`<button type="button" class="choice-button" data-team-answer="${i}">${esc(answer)}</button>`).join('')}</div><div class="team-feedback" aria-live="polite"></div>`:''}`,
        step?'':`<button type="button" id="team-start-trial" class="primary">Ajudar ${esc(name(r.id))}</button>`);
      V.UI.paintPortraits();
      if(!step){V.$('#team-start-trial').onclick=()=>{L.event('recruit',id+':meet');this.meet(r);};return;}
      for(const button of V.$$('[data-team-answer]'))button.onclick=()=>{
        if(Number(button.dataset.teamAnswer)!==r.right){V.$('.team-feedback').textContent='Releia a situação e tente outra resposta.';return;}
        if(this.progress(r)?.done)return;
        L.event('recruit',id+':trial');
        if(P.ensure().tracked?.recruit===r.id)P.ensure().tracked=null;
        V.ObjectiveGuide.invalidate();V.Save.save();
        V.UI.modal(name(r.id)+' entrou para o elenco',kits[r.id].role,`<div class="team-brief">${V.UI.portrait(r.id,0,88)}<p>${esc(r.feedback)}</p></div>`,
          '<button type="button" id="team-recruited" class="primary">Editar formação</button>');
        V.UI.paintPortraits();V.$('#team-recruited').onclick=()=>this.panel('lineup',r.id);
      };
    },
    panel(tab='lineup',selected=V.state?.character){
      if(!V.state)return;
      L.ensure();
      const hero=V.state.character,unlocked=new Set(this.unlocked()),party=this.lineup(),member=kits[selected]||kits[hero]||kits.nia;
      const editing=V.Game.mode==='explore'&&!V.Combat.active;
      const lineup=[hero,...party];
      const slot=(id,index)=>id?`<article class="team-slot ${id===selected?'is-selected':''}"><button type="button" class="team-slot-unit" data-team-profile="${esc(id)}" aria-label="Ver ${esc(name(id))}">${V.UI.portrait(id,0,64)}<b>${esc(name(id))}</b><small>${index===0?'Portador da máscara':esc(kits[id]?.role||'Aliado')}</small></button>
        ${index>0?`<div class="team-order"><button type="button" data-team-move="${esc(id)}" data-offset="-1" aria-label="Mover ${esc(name(id))} para a vaga anterior" ${!editing||index===1?'disabled':''}>‹</button><button type="button" data-team-move="${esc(id)}" data-offset="1" aria-label="Mover ${esc(name(id))} para a próxima vaga" ${!editing||index===party.length?'disabled':''}>›</button></div>`:''}</article>`:
        `<div class="team-slot team-slot-empty"><span>${index+1}</span><small>Vaga livre</small></div>`;
      const tabs=`<nav class="character-tabs" aria-label="Ficha e equipe"><button type="button" data-team-character="stats">${V.TurnArt.icon('health')}Atributos</button><button type="button" data-team-character="skills">${V.TurnArt.icon('skills')}Habilidades</button>
        <button type="button" data-team-tab="lineup" aria-pressed="${tab==='lineup'}">${art.icon(12)}Formação</button><button type="button" data-team-tab="recruit" aria-pressed="${tab==='recruit'}">${art.icon(14)}Recrutamento</button></nav>`;
      const recruitsBody=`<div class="team-recruit-grid">${recruits.map(r=>{
        const s=this.progress(r),status=s?.done?'Recrutado':s?.started?'Em andamento':this.enabled(r)?'Disponível':'Bloqueado';
        return `<article class="team-recruit-card">${V.UI.portrait(r.id,0,68)}<div><small>${esc(status)} · ${esc(kits[r.id].role)}</small><h3>${esc(name(r.id))}</h3><p>${esc(r.title)}</p><button class="secondary" type="button" data-team-mission="${r.id}">${s?.done?'Rever missão':'Ver missão'}</button></div></article>`;
      }).join('')}</div>`;
      const lineupBody=`<header class="team-formation-head"><h3>Formação de combate</h3><b>${lineup.length} / ${limit}</b></header><div class="team-slots">${Array.from({length:limit},(_,i)=>slot(lineup[i],i)).join('')}</div>
        <div class="team-workbench"><section><h3>Elenco disponível</h3><div class="team-roster">${[hero,...unlocked].map(id=>`<button type="button" data-team-profile="${esc(id)}" aria-pressed="${id===selected}">${V.UI.portrait(id,0,48)}<span><b>${esc(name(id))}</b><small>${esc(kits[id]?.role||'Investigação')}${party.includes(id)?' · Na equipe':''}</small></span></button>`).join('')}</div></section>
        <section class="team-member-profile"><header>${V.UI.portrait(selected,0,72)}<div><small>${art.icon(member.icon)} ${esc(member.role)}</small><h3>${esc(name(selected))}</h3></div></header>
        ${member.skills.map(s=>`<article class="team-skill">${art.icon(s.icon)}<div><b>${esc(s.name)}</b><p>${esc(s.description)}</p><small>${s.cost} foco · Recarga de ${s.cooldown} turnos</small></div></article>`).join('')}
        ${selected===hero?'<p class="team-caption">O portador também usa as habilidades aprendidas da máscara.</p>':unlocked.has(selected)?`<button id="team-toggle-member" type="button" class="primary" ${!editing||!party.includes(selected)&&party.length>=limit-1?'disabled':''}>${party.includes(selected)?'Retirar da formação':'Adicionar à formação'}</button>`:''}</section></div>`;
      V.UI.modal('Equipe','',tabs+(tab==='recruit'?recruitsBody:lineupBody),'',true);
      V.$('.modal')?.classList.add('team-modal');V.UI.paintPortraits();
      for(const button of V.$$('[data-team-character]'))button.onclick=()=>P.character(button.dataset.teamCharacter);
      for(const button of V.$$('[data-team-tab]'))button.onclick=()=>this.panel(button.dataset.teamTab,selected);
      for(const button of V.$$('[data-team-profile]'))button.onclick=()=>this.panel(tab,button.dataset.teamProfile);
      for(const button of V.$$('[data-team-move]'))button.onclick=()=>{if(this.edit(button.dataset.teamMove,Number(button.dataset.offset)))this.panel(tab,button.dataset.teamMove);};
      for(const button of V.$$('[data-team-mission]'))button.onclick=()=>this.mission(recruitById.get(button.dataset.teamMission));
      const toggle=V.$('#team-toggle-member');
      if(toggle)toggle.onclick=()=>{if(this.edit(selected))this.panel(tab,selected);};
    }
  };

  const unlocked=L.missionUnlocked.bind(L);
  L.missionUnlocked=function(q){return quests.has(q.id)?team.enabled(recruitById.get(q.owner)):unlocked(q);};
  const show=L.showMission.bind(L);
  L.showMission=function(id){const q=quests.get(id);return q?team.mission(recruitById.get(q.owner)):show(id);};
  V.Hooks.around(W,'init','team-world:meeting-points:1',next=>function(...args){
    const result=next(...args);team.install();return result;
  });
  const draw=V.Cozy.drawObject.bind(V.Cozy);
  V.Cozy.drawObject=function(c,o,cam,...args){
    if(o.type!=='team-contact')return draw(c,o,cam,...args);
    if(!team.enabled(recruitById.get(o.recruit)))return;
    const x=o.x-cam.x,y=o.y-cam.y,active=V.state.trackedQuest===questId(o.recruit),done=team.progress(recruitById.get(o.recruit))?.done;
    if(done&&!active)return;
    V.SceneShadows.contact(c,x,y+4,12,4);
    V.FastTravel.diamond(c,x,y-16,active?11:8,active?'#ffe2a2':'#b8d7b5');
    if(W.nearest?.id===o.id)L.marker(c,x,y-22,'E','#f1d29a');
  };
  const interactables=W.interactables.bind(W);
  W.interactables=function(...args){return interactables(...args).filter(o=>o.type!=='team-contact'||team.enabled(recruitById.get(o.recruit))&&!team.progress(recruitById.get(o.recruit))?.done);};
  V.Hooks.around(V.Game,'interact','team-world:recruitment:1',next=>function(o){
    if(o?.type!=='team-contact')return next(o);
    if(!V.modal&&!V.Dialogue.active&&this.mode==='explore')team.meet(recruitById.get(o.recruit));
  });
});
