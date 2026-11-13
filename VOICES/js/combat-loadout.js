/* Registered module: combat-loadout */
(function(init){if(window.VoicesModules)window.VoicesModules.define('combat-loadout',init);else init();})(function(){
  'use strict';
  const V=window.V,G=V.CombatGear,T=V.Team,P=V.Progress,D=V.AdventureData,esc=V.escape;
  const slotIcons={hands:'attack',head:'style',feet:'speed',legs:'speed',chest:'defend',neck:'context',weapon:'attack',offhand:'defend'};
  const circle=(id,title,value,portrait,effect)=>`<div class="loadout-position"><button type="button" id="${id}" class="loadout-circle" aria-label="${value?'Trocar ':'Escolher '}${esc(title)}" title="${value?'Trocar ':'Escolher '}${esc(title)}">${portrait||'<span aria-hidden="true" class="loadout-plus">+</span>'}</button><b>${esc(title)}</b><small>${esc(value||'Escolher')}</small>${effect?`<small class="loadout-effect">${esc(effect)}</small>`:''}</div>`;
  const add=(target,html)=>target.insertAdjacentHTML('beforeend',html);
  function bind(modal){
    const duo=V.DuoPanels,owner=duo?.enabled()?duo.owner(true):-1;
    if(owner>=0)duo.bind(modal,owner);
  }
  const currentModal=()=>V.$('.modal');
  const body=()=>currentModal()?.querySelector('.modal-body');
  const tab=(nav,label,selected,onclick)=>{
    if(!nav)return;
    const button=document.createElement('button');
    button.type='button';button.innerHTML=V.TurnArt.icon('defend')+esc(label);
    button.dataset.gearTab='';
    button.setAttribute('aria-pressed',String(selected));
    button.onclick=onclick;nav.append(button);
    if(selected)for(const other of nav.querySelectorAll('button:not([data-gear-tab])'))other.setAttribute('aria-pressed','false');
  };

  function renderGear(container,requested,allowRoster,selected='weapon'){
    const crew=G.roster();
    if(!crew.length)return;
    const member=crew.includes(requested)?requested:crew[0],player=V.state.character;
    const a=P.ensure(),gear=G.loadout(member,a),base=P.stats(a);
    const stats=member===player?base:T.stats(member,base);
    const active=G.active(),twoHanded=G.items.get(gear.weapon)?.hands===2;
    const list=[...G.items.values()].filter(item=>item.slot===selected&&a.inventory[item.id]>0);
    list.sort((a,b)=>(b.id===gear[selected])-(a.id===gear[selected])||b.tier-a.tier);
    const portrait=V.FragmentArt.portrait(member)||V.UI.portrait(member,0,68);
    const slots=Object.entries(G.slots).map(([id,label])=>{
      const equipped=G.items.get(gear[id]),blocked=id==='offhand'&&twoHanded;
      const legacy=member===player&&id==='chest'&&!equipped?D.items[a.equipped?.clothing]:null;
      const content=equipped?G.icon(equipped.id):legacy?P.icon(a.equipped.clothing,40):blocked?V.TurnArt.icon('defend'):'<span aria-hidden="true" class="gear-plus">+</span>';
      const detail=equipped?.name||legacy?.name||(blocked?'Ocupado pela arma':'Vazio');
      return `<button type="button" class="gear-slot" data-gear-slot="${id}" aria-pressed="${id===selected}">${content}<span><strong>${label}</strong><small>${esc(detail)}</small></span></button>`;
    }).join('');
    const gearCards=list.map(item=>{
      const own=gear[selected]===item.id,reason=own?'Em uso':G.blocked(member,selected,item.id,a);
      const available=a.inventory[item.id]-G.inUse(item.id,a);
      return `<article class="gear-item gear-grade-${item.tier}">${G.icon(item.id)}<div><small>${G.grades[item.tier]} · ${esc(G.subtitle(item))}</small><h4>${esc(item.name)}</h4><p>${esc(G.statText(item.stats))}</p><small>${available} livre(s) · ${a.inventory[item.id]} na mochila</small></div>
        <button type="button" class="${own?'secondary':'primary'}" data-gear-item="${item.id}" ${own?!active?'disabled':'':reason?'disabled':''}>${own?'Retirar':reason||'Equipar'}</button></article>`;
    }).join('');
    const legend=selected==='offhand'&&G.items.get(gear.weapon)?.hands!==1?'O escudo exige uma arma de uma mão.':selected==='weapon'?'Uma arma de duas mãos ocupa também a vaga de escudo.':'';
    container.innerHTML=`<div class="gear-header">${portrait}<div><h3>${esc(G.memberName(member))}</h3><p>${esc(G.statText(stats).replace(/\+/g,''))}</p></div>${allowRoster?'<label class="field">Integrante<select data-gear-member>'+crew.map(id=>`<option value="${esc(id)}" ${id===member?'selected':''}>${esc(G.memberName(id))}</option>`).join('')+'</select></label>':''}</div>
      <div class="gear-layout"><div class="gear-slots" role="group" aria-label="Vagas de equipamento">${slots}</div>
      <section class="gear-inventory"><h3>${G.slots[selected]}</h3>${legend?'<p>'+legend+'</p>':''}${!active?'<p>Troque equipamentos entre combates.</p>':''}${gearCards||'<p>Nenhum item para esta vaga na mochila. Vença batalhas para receber equipamentos.</p>'}</section></div>`;
    V.UI.paintPortraits();
    const select=container.querySelector('[data-gear-member]');
    if(select)select.onchange=()=>renderGear(container,select.value,true,selected);
    for(const button of container.querySelectorAll('[data-gear-slot]'))button.onclick=()=>{
      const slot=button.dataset.gearSlot;
      renderGear(container,member,allowRoster,slot);
      container.querySelector(`[data-gear-slot="${slot}"]`)?.focus({preventScroll:true});
    };
    for(const button of container.querySelectorAll('[data-gear-item]'))button.onclick=()=>{
      const id=button.dataset.gearItem;
      if(gear[selected]===id?G.remove(member,selected):G.equip(member,selected,id)){
        renderGear(container,member,allowRoster,selected);
        container.querySelector(`[data-gear-item="${id}"]:not(:disabled)`)?.focus({preventScroll:true});
      }
    };
    bind(currentModal());
  }

  function showGear(modal,nav,member,isTeam,back){
    const container=document.createElement('div');
    container.className='gear-view';
    modal.classList.add('gear-modal');
    modal.querySelector('.modal-body').replaceChildren(...(nav?[nav]:[]),container);
    if(typeof back==='function'){
      add(modal.querySelector('.modal-body'),'<button type="button" class="secondary gear-back" data-gear-back>Voltar ao confronto</button>');
      modal.querySelector('[data-gear-back]').onclick=back;
    }
    renderGear(container,member,isTeam);
    container.querySelector('.gear-slot[aria-pressed="true"]')?.focus({preventScroll:true});
  }

  const mask=V.AncestralMask,companions=V.Companions;
  const modelName=(id,owner)=>mask.models.find(model=>model.id===id)?.name||(owner?'Ancestral azul':'Ancestral original');
  function masks(back){
    const owner=mask.variant(),current=mask.appearance(owner);
    let palette=current.palette;
    V.UI.modal('Visual da máscara','',`<label class="field">Paleta<select id="gear-mask-palette">${mask.palettes.map(color=>`<option value="${esc(color.id)}" ${color.id===palette?'selected':''}>${esc(color.name)}</option>`).join('')}</select></label><p>Escolha a paleta e clique no modelo para aplicar.</p><div id="gear-mask-list" class="loadout-picker"></div>`,
      '<button type="button" class="secondary" data-loadout-back>Voltar à formação</button>',true);
    const modal=currentModal(),select=modal.querySelector('#gear-mask-palette'),list=modal.querySelector('#gear-mask-list');
    const paint=()=>{
      list.innerHTML=[{id:'default'},...mask.models].map(model=>{
        const id=model.id,currentModel=id===current.model&&palette===current.palette,base=id==='default';
        const image=base?mask.image('portrait',owner)?.src:mask.portraitPath(id,palette);
        const effect=V.FragmentData.masks?.[id]||V.FragmentData.masks?.default;
        return `<button type="button" class="loadout-choice" data-gear-mask="${id}" aria-pressed="${currentModel}" ${image&&G.active()?'':'disabled'}>${image?`<img src="${esc(image)}" alt="">`:''}<strong>${esc(modelName(id,owner))}</strong><small>${esc(effect?.[2]||'')}${currentModel?' · Em uso':''}</small></button>`;
      }).join('');
      for(const button of list.querySelectorAll('[data-gear-mask]'))button.onclick=()=>{
        if(G.active()&&mask.choose(button.dataset.gearMask,palette))back();
      };
      mask.tintPortrait(list.querySelector('[data-gear-mask="default"] img'),'default',palette);
      bind(modal);
    };
    select.onchange=()=>{palette=select.value;paint();};
    modal.querySelector('[data-loadout-back]').onclick=back;
    paint();
  }
  function paintFriends(modal,people){
    const groups=[...new Set(people.filter(item=>item.id!=='zambeto').flatMap(item=>
      ['roots',...(V.Presences?.has?.(item.id)?['presence:'+item.id]:[])]))];
    const paint=()=>{if(modal.isConnected)companions.paintCards(modal);};
    if(groups.length)V.MapAssets.ensure(groups,'Preparando as companhias',paint);
    else paint();
  }
  function friends(back){
    const selected=companions.selected(),s=companions.ensure();
    const known=companions.roster.filter(item=>s.unlocked.includes(item.id));
    V.UI.modal('Companhia de exploração','',`<div class="loadout-picker">${known.map(item=>
      `<button type="button" class="loadout-choice" data-gear-companion="${esc(item.id)}" aria-pressed="${selected?.id===item.id}" ${G.active()?'':'disabled'}>${companions.cardArt(item,70)}<strong>${esc(item.name)}</strong><small>${esc(item.role)}</small></button>`).join('')||'<p>Os vínculos de exploração aparecem aqui conforme você conhece as companhias.</p>'}</div>`,
      '<button type="button" class="secondary" data-loadout-back>Voltar à formação</button><button type="button" class="secondary" id="gear-all-companions">Ver todos os vínculos</button>'+
      (selected?'<button type="button" class="secondary" id="gear-remove-companion">Retirar companhia</button>':''),true);
    const modal=currentModal();
    modal.querySelector('[data-loadout-back]').onclick=back;
    modal.querySelector('#gear-all-companions').onclick=()=>companions.open();
    const remove=modal.querySelector('#gear-remove-companion');
    if(remove){remove.disabled=!G.active();remove.onclick=()=>{if(companions.select(null))back();};}
    for(const button of modal.querySelectorAll('[data-gear-companion]'))button.onclick=()=>{
      if(companions.select(button.dataset.gearCompanion))back();
    };
    paintFriends(modal,known);
    bind(modal);
  }
  function circles(modal,member,back){
    const appearance=mask.appearance(),owner=mask.variant(),explicit=!!V.state.maskAppearance?.[owner===1?'player2':'player1']?.model;
    const friend=companions.selected(),animal=V.FragmentForest.spirit();
    const effect=V.FragmentData.masks?.[appearance.model]?.[2];
    const icon=explicit||appearance.model!=='default'?`<img src="${esc(mask.path('portrait',owner))}" alt="">`:'';
    const panel=modal.querySelector('.fragment-loadout')||modal.querySelector('.modal-body');
    if(!panel)return;
    const content=`<div class="loadout-circles">${circle('gear-mask','Máscara',icon?modelName(appearance.model,owner):'',icon,icon?effect:null)}
      ${circle('gear-companion','Companhia',friend?.name,friend?companions.cardArt(friend,58):'')}
      ${circle('gear-animal','Animal',animal?.name,animal?V.FragmentArt.tile('creatures',animal.art,'loadout-animal-art'):'',animal?.powerName)}</div>`;
    if(panel.classList.contains('fragment-loadout'))panel.innerHTML='<h3>Máscara e companhia</h3>'+content;
    else add(panel,'<section class="loadout-fallback"><h3>Máscara e companhia</h3>'+content+'</section>');
    const go=()=>T.panel('lineup',member,back);
    mask.tintPortrait(modal.querySelector('#gear-mask img'),appearance.model,appearance.palette);
    modal.querySelector('#gear-mask').onclick=()=>masks(go);
    modal.querySelector('#gear-companion').onclick=()=>friends(go);
    modal.querySelector('#gear-animal').onclick=()=>T.panel('animal',member,back,null,go);
    paintFriends(modal,friend?[friend]:[]);
  }

  const team=T.panel.bind(T);
  T.panel=function(view='lineup',member=V.state?.character,back=null,...args){
    const result=team(view==='gear'?'lineup':view,member,back,...args);
    const modal=V.$('.team-modal');
    if(!modal)return result;
    const nav=modal.querySelector('.character-tabs');
    tab(nav,'Equipamento',view==='gear',()=>this.panel('gear',member,back));
    if(view==='gear')showGear(modal,nav,member,true,back);
    else if(view==='lineup'){
      circles(modal,member,back);
      const profile=modal.querySelector('.team-member-profile');
      if(profile){
        add(profile,'<button type="button" class="secondary gear-member-cta">Equipamento deste integrante</button>');
        profile.querySelector('.gear-member-cta').onclick=()=>this.panel('gear',member,back);
      }
    }
    bind(modal);
    return result;
  };

  const character=P.character.bind(P);
  P.character=function(view='stats'){
    const result=character(view==='gear'?'stats':view);
    const modal=V.$('.character-modal');
    if(!modal||view==='party')return result;
    const nav=modal.querySelector('.character-tabs');
    tab(nav,'Equipamento',view==='gear',()=>this.character('gear'));
    if(view==='gear')showGear(modal,nav,V.state.character,false);
    bind(modal);
    return result;
  };

  const inventory=P.inventory.bind(P);
  P.inventory=function(...args){
    const result=inventory(...args),heading=body()?.querySelector('.adv-inventory-head');
    if(heading){
      add(heading,'<button type="button" class="secondary" id="gear-bag-entry">Equipar personagem</button>');
      heading.querySelector('#gear-bag-entry').onclick=()=>this.character('gear');
      bind(currentModal());
    }
    return result;
  };

  const battle=V.Combat,ui=battle.ui.bind(battle);
  battle.ui=function(...args){
    const result=ui(...args),a=this.active,box=V.$('#battle-root .turn-prompt');
    if(a?.phase==='victory'&&a.gearLoot?.length&&box&&!box.querySelector('.gear-drops')){
      const loot=a.gearLoot.filter(item=>Object.hasOwn(D.items,item.id));
      if(loot.length)add(box,`<section class="gear-drops" aria-label="Drops da batalha"><h3>Drops</h3><ul>${loot.map(({id,count,stored})=>`<li>${G.icon(id)}<span><b>${esc(D.items[id].name)}</b><small>×${count}${stored?' · '+stored+' no depósito':''}</small></span></li>`).join('')}</ul></section>`);
    }
    return result;
  };
});
