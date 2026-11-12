/* Registered module: fragment-forest */
(function(init){if(window.VoicesModules)window.VoicesModules.define('fragment-forest',init);else init();})(function(){
  'use strict';
  const V=window.V,D=V.FragmentData,W=V.World,C=V.Cozy,F=V.FastTravel,P=V.Progress,esc=V.escape,T=48;
  const map=D.map,title='Floresta do Fragmento Histórico';
  const camp=[18,28],exit=[18,30],parkGate=[20,6];
  const sites=[
    ['margem',10,24,'Margem da Nascente','story',7],
    ['fogueira',26,24,'Fogueira Antiga','story',9],
    ['passagem',18,20,'Passagem de Seiva','easy'],
    ['ponte',7,16,'Ponte das Inscrições','story',5],
    ['clareira',30,16,'Clareira Fria','fight'],
    ['pedras',17,12,'Pedras do Eco','story',8],
    ['brejo',6,7,'Brejo das Pegadas','fight'],
    ['ruinas',27,7,'Ruínas do Coro','story',4],
    ['arquivo',18,4,'Arquivo das Raízes','boss',11]
  ];
  const contacts={'yara-centelha':[21,27],'brasa-oliveira':[22,25],'lina-nascente':[13,27],
    'nilo-geada':[15,25],'sara-pegadas':[10,28]};
  const marks={first:'Primeira descoberta',spring:'Nascente',storm:'Tempestade',embers:'Brasas',
    care:'Preservação',archive:'Fontes do arquivo',frost:'Geada',hunt:'Pegadas',boss:'Guardião vencido'};
  const paths=[[16,3,5,27],[5,6,27,3],[5,15,27,3],[8,23,21,4],[6,7,3,11],[28,7,4,11],[12,24,12,6]];
  const trails=[
    [96,[[18,31],[18,26],[17.6,21],[18,16],[17,11],[18,7],[18,4]]],
    [77,[[8,25],[12,24],[18,25],[22,24.3],[26,24],[29,26]]],
    [83,[[6,16],[10,15.4],[15,16.3],[20,16],[26,16.8],[30,16],[31,18]]],
    [66,[[7,16],[7.5,12],[6,7],[10,7.5],[16,6.9],[20,8],[26,7],[29,7.5],[30,11],[30,16]]],
    [72,[[27,7],[30,7],[32.5,6],[33.5,3.7]]]
  ];
  const design={name:title,width:37,height:33,spawn:camp,purpose:'Examine vestígios e explore rotas com encontros diferentes.',
    floor:'grass',palette:['#263f33','#796548','#759369'],paths,decor:[],anchors:[],scenes:[]};
  const woods=[
    [4,4,1,4],[9,3,0,4.4],[14,3,1,3.8],[23,3,0,4],[32,4,1,4.8],[3,9,3,3.4],[12,9,0,4.6],[24,9,1,4.3],[33,10,0,4.8],
    [4,13,1,4.2],[11,13,6,2.6],[22,13,4,3.6],[33,14,3,4],[4,19,0,4.5],[12,19,1,3.9],[23,19,0,4.7],[32,20,1,4.3],
    [4,24,1,4.5],[7,25,2,2.1],[28,20,6,2.9],[31,26,0,4.9],[7,30,0,4.9],[27,30,1,4.8],[17,5.7,5,2.5],
    [14,22,2,1.7],[23,22,2,1.8],[10,10,2,1.6],[30,13,2,1.7],[24,29,2,1.7],[5,27,7,2.3],[30,29,10,1.7],
    [9,20,3,2.9],[13,4,2,1.65],[25,10,2,1.6],[14,13,5,2.2],[21,9,6,2.2],[7,11,2,1.6],[34,26,2,1.8],
    [8,23,2,2],[12,29,2,2],[22,31,2,2],[25,27,2,2],[28,28,2,1.7],[12,26,2,1.8],
    [13,24,2,1.4],[24,26,2,1.6],[13,21,2,2.2],[22,22.5,2,1.7],[20,18,2,1.6],[16,18,2,1.7],
    [8,17,2,1.4],[12,16,2,1.7],[28,18,2,1.8],[11,8,2,1.7],[21,6,2,1.5],[30,9,2,1.9],
    [15,30.5,0,3.25],[23,29.9,1,3.3],[10,21,0,3.6],[27,20,1,3.7]
  ];
  const shuffle=list=>{
    const deck=[...list];
    for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    return deck;
  };
  const byId=(list,id)=>list.find(item=>item.id===id);
  const at=([x,y])=>({x:(x+.5)*T,y:(y+.5)*T});
  function add(m,id,point,label,data={}){
    const [x,y]=point;
    const candidates=[[0,0],[0,1],[1,0],[-1,0],[0,-1],[0,2],[2,0],[-2,0],[0,-2]];
    const preferred=candidates.map(([dx,dy])=>at([x+dx,y+dy])).find(p=>
      F.clear(m,p,18)&&m.objects.every(o=>V.dist(o,p)>62));
    const position=preferred||V.Rooms.safe(m,at(point),18);
    m.objects.push({type:'fragment-site',id:'fragment-'+id,site:id,label,interactionRange:86,...data,...position});
  }
  function state(){
    if(!V.state)return null;
    const s=V.state.fragmentForest;
    if(s?.version===1&&s.marks&&s.outcomes&&s.rolls&&Array.isArray(s.records))return s;
    return V.state.fragmentForest={version:1,serial:0,marks:{},records:[],outcomes:{},rolls:{},shards:0,equipped:null};
  }
  function roll(s){
    const events=shuffle(D.stories.filter(item=>!s.records.some(record=>record.story===item.id)));
    const pool=[...events,...shuffle(D.stories.filter(item=>!events.includes(item)))];
    if(s.serial===1)pool.unshift(...pool.splice(pool.findIndex(item=>item.id==='nascente'),1));
    const harder=shuffle(D.encounters.filter(e=>e.foes.length>=2&&e.id!=='arquivo'));
    const easy=shuffle(D.encounters.filter(e=>e.foes.length===1));
    for(const [id,,, ,kind] of sites){
      const chosen=kind==='story'?pool.shift()
        :kind==='easy'?easy.pop():kind==='fight'?harder.pop():byId(D.encounters,'arquivo');
      s.rolls[id]={kind:kind==='story'?'story':'fight',id:chosen.id};
    }
  }
  function route(reset=false){
    const s=state();
    if(!s)return null;
    if(!s.serial||reset){
      s.serial++;s.rolls={};s.outcomes={};roll(s);V.Save.save();
    }
    return s;
  }
  const available=()=>!!V.state?.flags?.prologueDone;
  const bossReady=s=>Object.values(s.outcomes).filter(outcome=>outcome.done).length>=4&&Object.values(s.outcomes).some(outcome=>outcome.won);
  function grant(s,site,detail){
    if(s.outcomes[site]?.done)return false;
    s.outcomes[site]={done:true,won:!!detail.won,text:detail.text};
    s.shards+=detail.shards;
    s.marks.first=true;s.marks[detail.mark]=true;
    if(detail.boss)s.marks.boss=true;
    const record={title:detail.title,text:detail.text,story:detail.story};
    if(!s.records.some(r=>r.title===record.title&&r.text===record.text))s.records.unshift(record);
    P.reward('forest-'+s.serial+'-'+site,detail.xp,detail.won?{fragments:detail.shards}:{});
    V.Save.save();
    return true;
  }
  function fieldButton(id,label,cls='secondary'){return `<button type="button" class="${cls}" id="${id}">${label}</button>`;}
  function show(title,subtitle,body,buttons){
    V.UI.modal(title,subtitle,body,buttons,true);
    V.$('.modal')?.classList.add('fragment-field-modal');
  }
  const forest=V.FragmentForest={
    title,marks,state,available,
    has(key){return !!V.state?.fragmentForest?.marks?.[key];},
    contact(id){return contacts[id]?at(contacts[id]):null;},
    spirit(){const s=V.state?.fragmentForest;return D.spirits.find(item=>item.id===s?.equipped&&this.has(item.unlock));},
    equip(id){
      const s=state(),item=byId(D.spirits,id);
      if(!s||V.Combat.active||id&&(!item||!this.has(item.unlock)))return false;
      s.equipped=id||null;V.Save.save();return true;
    },
    go(){
      if(!available()||V.Game.mode!=='explore'||!W.maps[map])return false;
      V.UI.close();V.Cozy.playerStand();V.Input.clear();W.load(map,V.Rooms.safe(W.maps[map],at([camp[0],camp[1]+1]),14));
      this.board();return true;
    },
    board(){
      if(!available()){
        V.UI.modal(title,'Expedição', '<p>Conclua a Primeira Vigília com PIX para abrir a trilha no Parque.</p>');
        return;
      }
      const s=route(),inside=W.current?.id===map,nearCamp=inside&&V.dist(V.Player.data,at(camp))<140,done=Object.values(s.outcomes).filter(outcome=>outcome.done).length;
      const roster=D.spirits.map(item=>`<button class="fragment-spirit-card" type="button" data-fragment-spirit="${item.id}" ${this.has(item.unlock)?'':'disabled'} aria-pressed="${s.equipped===item.id}">${V.FragmentArt.tile('creatures',item.art,'fragment-spirit-art')}<span><strong>${esc(item.name)}</strong><small>${this.has(item.unlock)?esc(item.description):'Descoberta necessária · '+marks[item.unlock]}</small></span></button>`).join('');
      const records=s.records.slice(0,12).map(r=>`<li><strong>${esc(r.title)}</strong><small>${esc(r.text)}</small></li>`).join('');
      show(title,'Expedição · Trilha '+s.serial,`<div class="fragment-banner"><p>${done} de ${sites.length} pontos investigados <strong>${s.shards} fragmento(s) da floresta</strong></p></div>
        <p>Investigue os pontos brilhantes e as rasuras na trilha. Para chegar ao Arquivo das Raízes, resolva quatro encontros, incluindo uma vitória em combate. O arco de raízes no canto nordeste leva às Trilhas do Infinito.</p>
        <div class="fragment-board-grid"><section><h3>Companhias de combate</h3><p>Vincule uma companhia para usar seu poder no menu Apoio. O vínculo vale também nas batalhas de capítulo.</p><div class="fragment-spirit-list">${roster}</div>${this.spirit()?fieldButton('fragment-unequip','Desvincular companhia'):''}</section>
        <section><h3>Caderno de campo</h3>${records?'<ol class="fragment-records">'+records+'</ol>':'<p>Os resultados das suas escolhas ficam aqui.</p>'}</section></div>`,
        (nearCamp?fieldButton('fragment-reset','Sortear outra trilha')+fieldButton('fragment-rest','Descansar no acampamento'):inside?'':fieldButton('fragment-go','Ir para a floresta','primary'))+
        fieldButton('fragment-team','Editar equipe'));
      for(const button of V.$$('[data-fragment-spirit]'))button.onclick=()=>{if(this.equip(button.dataset.fragmentSpirit))this.board();};
      if(V.$('#fragment-go'))V.$('#fragment-go').onclick=()=>this.go();
      if(V.$('#fragment-rest'))V.$('#fragment-rest').onclick=()=>{P.rest();V.UI.toast('Vida e foco recuperados.');this.board();};
      if(V.$('#fragment-reset'))V.$('#fragment-reset').onclick=()=>V.UI.confirm('Sortear outra trilha?','Os pontos da expedição mudam. As descobertas, companhias e recompensas continuam no caderno.',()=>{route(true);this.board();});
      V.$('#fragment-team').onclick=()=>V.Team.panel();
      if(V.$('#fragment-unequip'))V.$('#fragment-unequip').onclick=()=>{this.equip(null);this.board();};
    },
    site(id){
      if(W.current?.id!==map)return;
      const s=route(),entry=s.rolls[id],name=sites.find(site=>site[0]===id)?.[3];
      if(!entry)return;
      const outcome=s.outcomes[id];
      if(outcome?.done){show(name,'Registro concluído','<p>'+esc(outcome.text)+'</p>',fieldButton('fragment-board','Caderno'));V.$('#fragment-board').onclick=()=>this.board();return;}
      if(id==='arquivo'&&!bossReady(s)){
        show(name,'Porta das raízes','<p>Reúna quatro registros nesta trilha e vença pelo menos um combate para abrir a passagem.</p>',fieldButton('fragment-board','Caderno'));
        V.$('#fragment-board').onclick=()=>this.board();return;
      }
      if(entry.kind==='fight'||outcome?.pending){this.preview(id,outcome?.pending||entry.id);return;}
      const story=byId(D.stories,entry.id);
      show(story.title,name,`<p>${esc(story.body)}</p><div class="fragment-choices">${story.choices.map(([label,,mark,xp],i)=>
        `<button type="button" class="choice-button" data-fragment-choice="${i}"><b>${esc(label)}</b><small>${xp?'+ '+xp+' XP · '+marks[mark]:'Pode iniciar combate'}</small></button>`).join('')}</div>`,'');
      for(const button of V.$$('[data-fragment-choice]'))button.onclick=()=>this.choose(id,Number(button.dataset.fragmentChoice));
    },
    choose(site,index){
      const s=route(),story=byId(D.stories,s.rolls[site]?.id);
      if(!story||W.current?.id!==map||s.outcomes[site])return false;
      const choice=story.choices[index];
      if(!choice)return false;
      const [,response,mark,xp,shards]=choice;
      if(!xp){this.preview(site,mark,response,story.id);return true;}
      if(!grant(s,site,{title:story.title,text:response,mark,xp,shards,story:story.id}))return false;
      show(story.title,'Descoberta · '+marks[mark],`<p>${esc(response)}</p><p class="fragment-gain">+${xp} XP · +${shards} fragmento(s)</p>`,'');
      return true;
    },
    preview(site,id,response='',story=null){
      const e=byId(D.encounters,id),pending=state().outcomes[site];
      show(e.title,'Encontro da floresta',`<p>${esc(response||pending?.text||D.enemies[e.foes[0]].tip)}</p><div class="fragment-foe-list">${e.foes.map(key=>{
        const enemy=D.enemies[key];
        return `<article>${V.FragmentArt.tile('creatures',enemy.art,'fragment-foe-art')}<strong>${esc(enemy.name)}</strong></article>`;
      }).join('')}</div><p class="fragment-gain">+${e.xp} XP · +${e.shards} fragmento(s) se vencer</p>`,
        fieldButton('fragment-edit','Editar equipe')+fieldButton('fragment-fight','Batalhar','primary'));
      V.$('#fragment-edit').onclick=()=>V.Team.panel('lineup',V.state.character,()=>this.preview(site,id,response,story));
      V.$('#fragment-fight').onclick=()=>this.fight(site,id,response,story);
    },
    fight(site,id,response='',story=null){
      const s=state(),e=byId(D.encounters,id),entry=s?.rolls[site];
      if(!e||!entry||!available()||W.current?.id!==map||V.Game.mode!=='explore'||V.Combat.active||s.outcomes[site]?.done)return false;
      const storyEntry=entry.kind==='story'&&byId(D.stories,entry.id);
      if(entry.kind==='fight'?entry.id!==id:!storyEntry?.choices.some(choice=>!choice[3]&&choice[2]===id))return false;
      if(site==='arquivo'&&!bossReady(s))return false;
      const previous=s.outcomes[site];
      s.outcomes[site]={pending:id,text:response||previous?.text||'',story:story||previous?.story||null};
      return V.Combat.begin(1,V.settings.assist,{expedition:{...e,site,serial:s.serial,story:s.outcomes[site].story}});
    },
    finishFight(a){
      const s=state(),e=a.expedition;
      if(!s||s.serial!==e.serial||s.outcomes[e.site]?.pending!==e.id)return;
      const text=e.id==='arquivo'?'O Arquivista Vazio se desfez. A equipe recuperou os nomes sob as raízes.':'A equipe venceu as rasuras e registrou o local com segurança.';
      if(grant(s,e.site,{...e,text,boss:e.id==='arquivo',won:true})){
        a.rewardXP=e.xp;a.rewardShards=e.shards;
      }
    }
  };

  F.names[map]=title;F.roots.push(map);
  const category=F.category.bind(F),status=F.status.bind(F);
  F.category=id=>id===map?'nature':category(id);
  F.status=id=>id===map&&!available()?{allowed:false,label:'Trilha bloqueada',reason:'Conclua a Primeira Vigília para entrar na floresta.'}:status(id);
  C.layouts[map]=design;
  V.SceneDesign.defaults[map]=JSON.parse(JSON.stringify(design));
  V.Hooks.around(W,'init','fragment-forest:map',next=>function(...args){
    const result=next(...args),layout=C.layouts[map],m=this.maps[map]=W.base(map,'community',layout.width,layout.height);
    Object.assign(m,{name:title});
    C.compose(m);
    for(const [x,y,prop,size] of woods){
      const p=at([x,y]),span=size*T;
      m.decor.push({x:p.x-span/2,y:p.y-span,size:span,family:'fragment-wood',prop});
      if(prop!==2)m.solids.push({x:p.x-span*.16,y:p.y-span*.23,w:span*.32,h:span*.21});
    }
    add(m,'camp',camp,'Acampamento · Caderno e companhias',{prop:9});
    add(m,'exit',exit,'Voltar ao Parque',{prop:8,to:'park'});
    for(const [id,x,y,label,kind,prop] of sites)add(m,id,[x,y],label,{prop,kind});
    if(this.maps.park)add(this.maps.park,'entry',parkGate,'Entrar na '+title,{prop:8,to:map});
    F.point(map);V.Team.install();V.Atlas.cache.clear();V.ObjectiveGuide.invalidate();
    return result;
  });
  const paintGround=C.ground.bind(C);
  C.ground=function(m){
    if(m.id!==map)return paintGround(m);
    const canvas=V.GroundCache.create(m,m.width*T,m.height*T),c=canvas.getContext('2d');
    const width=V.GroundCache.width(canvas),height=V.GroundCache.height(canvas);
    const tiles=[0,1,2,3].map(index=>V.FragmentArt.texture(c,index));
    const [moss,earth,stone,brush]=tiles;
    c.imageSmoothingEnabled=false;
    c.fillStyle=moss||'#344a2c';c.fillRect(0,0,width,height);
    function patch(x,y,rx,ry,fill){
      c.beginPath();c.ellipse(x*T,y*T,rx*T,ry*T,.11,0,Math.PI*2);c.fillStyle=fill;c.fill();
    }
    for(const [x,y,rx,ry] of [[3,6,4.5,7],[34,11,5.5,10],[4,24,5,9],[33,26,5,7],[12,11,3,3],[23,21,4,2],[28,30,4,3]]){
      patch(x,y,rx,ry,brush||'#243b2c');
    }
    c.lineCap='round';c.lineJoin='round';
    const trace=points=>{
      const line=points.map(at);
      c.beginPath();c.moveTo(line[0].x,line[0].y);
      for(let i=1;i<line.length-1;i++){
        const a=line[i],b=line[i+1];
        c.quadraticCurveTo(a.x,a.y,(a.x+b.x)/2,(a.y+b.y)/2);
      }
      c.lineTo(line.at(-1).x,line.at(-1).y);
    };
    c.strokeStyle=stone||'#48513a';
    for(const [size,points] of trails){trace(points);c.lineWidth=size+16;c.stroke();}
    c.strokeStyle=earth||'#765c43';
    for(const [size,points] of trails){trace(points);c.lineWidth=size;c.stroke();}
    for(const [x,y,rx,ry] of [[7.5,16.5,1.3,.9],[30.5,16.5,1.8,1.4],[18.5,4.5,2,1.4],[27.5,7.5,2,1.5]]){
      patch(x,y,rx,ry,stone||'#48513a');
    }
    patch(18.5,27.9,1.7,1.6,earth||'#765c43');
    const shade=c.createLinearGradient(0,0,width,height);
    shade.addColorStop(0,'#0c252d88');shade.addColorStop(.42,'#13292b12');shade.addColorStop(1,'#161f2d70');
    c.fillStyle=shade;c.fillRect(0,0,width,height);
    m.cache=canvas;
  };
  const prop=C.prop.bind(C);
  C.prop=function(ctx,family,index,x,y,size,...args){
    if(family==='fragment-wood')return V.FragmentArt.draw(ctx,'woods',index,x+size/2,y+size,size);
    return prop(ctx,family,index,x,y,size,...args);
  };
  const draw=C.drawObject.bind(C);
  C.drawObject=function(ctx,o,cam,...args){
    if(o.type!=='fragment-site')return draw(ctx,o,cam,...args);
    const x=o.x-cam.x,y=o.y-cam.y;
    if(x< -150||y< -60||x>ctx.canvas.width+150||y>ctx.canvas.height+150)return;
    const s=V.state?.fragmentForest,outcome=s?.outcomes[o.site],pending=s?.rolls[o.site],e=byId(D.encounters,outcome?.pending||pending?.id);
    const foe=!outcome?.done&&e&&o.kind!=='boss'?D.enemies[e.foes[0]]:null;
    V.SceneShadows.contact(ctx,x,y+2,foe?23:30,6);
    if(foe){
      const lift=V.settings.reducedMotion?0:Math.sin(V.Engine.time*2+x*.1)*2;
      V.FragmentArt.draw(ctx,'creatures',foe.art,x,y-lift,83);
    }else{
      V.FragmentArt.draw(ctx,'woods',o.prop??11,x,y,o.kind==='boss'?110:84);
    }
    if(o.kind||W.nearest?.id===o.id){
      const color=outcome?.done?'#9dd69e':foe?'#ffab82':'#f1d293';
      F.diamond(ctx,x,y-68,outcome?.done?4:7,color);
    }
  };
  V.Hooks.around(V.Game,'interact','fragment-forest:interact',next=>function(o){
    if(o?.type!=='fragment-site')return next(o);
    if(this.mode!=='explore'||V.modal||V.Dialogue.active)return;
    if(o.site==='entry'){if(!forest.go())forest.board();return;}
    if(o.site==='exit'){
      const park=W.maps.park,gate=park.objects.find(site=>site.id==='fragment-entry');
      W.load('park',V.Rooms.safe(park,{x:gate.x,y:gate.y+62},14));return;
    }
    if(o.site==='camp'){forest.board();return;}
    forest.site(o.site);
  });
  const paintMap=V.Atlas.paint.bind(V.Atlas);
  V.Atlas.paint=function(canvas,m,options){
    const result=paintMap(canvas,m,options);
    if(!canvas||!m||m.id!==map&&m.id!=='park')return result;
    const p=this.projection(canvas,m),c=canvas.getContext('2d'),s=V.state?.fragmentForest;
    for(const o of m.objects.filter(o=>o.type==='fragment-site')){
      const done=s?.outcomes[o.site]?.done;
      const color=o.to?'#cad2fa':done?'#94dca4':o.kind==='fight'||o.kind==='easy'?'#ef9b80':'#f2d393';
      const x=p.x+o.x*p.scale,y=p.y+o.y*p.scale;
      F.diamond(c,x,y,options?.details?6:3,color);
    }
    return result;
  };
  const load=W.load.bind(W);
  W.load=function(id,...args){const result=load(id,...args);if(W.current?.id===map)route();return result;};
});
