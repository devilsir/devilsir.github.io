/* Registered module: neighbourhood-life */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("neighbourhood-life", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function () {
  'use strict';
  const V=window.V, W=V.World, C=V.Cozy, S=V.CommunityStories, T=48;
  const movable=new Set(['market-merchant','cooking-npc','food-museum-curator','animal-museum-curator','sea-person','cape-person','nature-ranger','story-person']);
  const N=V.NeighbourhoodLife={
    hash(s){return [...s].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);},
    eligible(o){return movable.has(o.type)&&!o.sanctuaryStaff&&!o.scheduleManaged&&o.character!=='pix';},
    visitor(m,id,name,character,at,en,pt){
      if(!m||m.objects.some(o=>o.id===id))return;
      const p=C.safe(m,at[0],at[1],m.objects.filter(o=>C.person(o)));
      const o={id,type:'story-person',storyPerson:true,communityVisitor:true,name,character,x:p.x*T+24,y:p.y*T+24,communityPersona:{name,role:'Vizinhança · visitantes e aprendizes',en,pt},label:'Conversar com '+name,interactionRange:95};
      C.preparePerson(m,o);m.objects.push(o);
    },
    clear(m,o,p){return !V.Living.blocked(m,p.x,p.y,14)&&!V.Architecture.blocked(m,p.x,p.y,14)&&!m.objects.some(n=>n!==o&&(C.person(n)||n.type==='travel'||n.type==='room-door')&&V.dist(n,p)<44);},
    routine(m,o){
      if(!this.eligible(o)||o.livingRoutine)return;
      if(!o.character){
        const people={joana:'courier',lindiwe:'jamila',zola:'guide',ayesha:'viviane',thandi:'ines',sipho:'andre'};
        o.character=people[o.person]||['ines','andre','viviane','courier'][this.hash(o.id)%4];
      }
      const origin={x:o.x,y:o.y},phase=this.hash(o.id),action=o.type==='food-museum-curator'||o.type==='animal-museum-curator'||m.id==='university'?'reading':o.type==='nature-ranger'?'observing':o.communityVisitor?'reading':'working';
      C.preparePerson(m,o);o.stationary=false;o.settled=false;o.livingRoutine=true;o.workOrigin=origin;o.workAction=action;
      const home=C.addAnchor(m,'community-work-'+o.id,origin.x,origin.y,action,12+phase%9,0);
      const anchors=[home];
      for(const [dx,dy] of [[1.4,.7],[-1.5,1.2],[0,1.8],[2.2,0],[-2.2,0],[.7,-1.6]]){
        if(anchors.length>=3)break;
        const p={x:origin.x+dx*T,y:origin.y+dy*T};
        if(!this.clear(m,o,p)||!C.path(m,o,p).length)continue;
        const a=C.addAnchor(m,'community-task-'+o.id+'-'+anchors.length,p.x,p.y,anchors.length===1?'observing':action,8+phase%7,anchors.length===1?2:0);
        anchors.push(a);
      }
      o.tasks=anchors.map(a=>a.id);o.waypoints=anchors;o.taskIndex=1;o.destination=home;o.action=action;o.taskTime=3+phase%9;o.speed=26+phase%6;
      C.reserve(m,o,home);
    },
    chat(m,a,b,lines,enLines){
      if(!a||!b||a.group||b.group||!a.livingRoutine||!b.livingRoutine||V.dist(a,b)>390)return;
      const p={x:a.workOrigin.x+(b.workOrigin.x-a.workOrigin.x)*.45,y:a.workOrigin.y+(b.workOrigin.y-a.workOrigin.y)*.45};
      let spot=null;
      for(const [dx,dy]of [[0,0],[0,1],[1,0],[-1,0],[0,-1]]){
        const first={x:p.x+dx*T-31,y:p.y+dy*T},second={x:p.x+dx*T+31,y:p.y+dy*T};
        if(this.clear(m,a,first)&&this.clear(m,b,second)&&C.path(m,a,first).length&&C.path(m,b,second).length){spot=[first,second];break;}
      }
      if(!spot)return;
      const id='community-chat-'+a.id+'-'+b.id,g={id,members:[a,b],lines,enLines,clock:0,wait:10+this.hash(id)%10,phase:'rest',talking:false,line:-1,approachLimit:36};
      [a,b].forEach((o,i)=>{g['anchor'+i]=C.addAnchor(m,id+'-'+i,spot[i].x,spot[i].y,'conversing',22,i?1:2);o.group=id;o.member=i;});m.chats.push(g);
    },
    seed(){
      this.visitor(W.maps.market,'community-rute','Rute','ines',[12,9],'I am helping prepare the neighbourhood fair. We want the makers to choose the words on their labels.','Estou ajudando a preparar a feira do bairro. Queremos que as criadoras escolham as palavras de suas etiquetas.');
      this.visitor(W.maps['cape-market'],'community-musa','Musa','luca',[13,11],'I am learning to sew. Zola showed me why a fabric label should include its source.','Estou aprendendo a costurar. Zola me mostrou por que a etiqueta de um tecido precisa indicar sua procedência.');
      this.visitor(W.maps['food-museum'],'community-caue','Cauê','bento',[29,34],'I am comparing the dishes with the labels. I wrote down a question for Celina about the cooking techniques.','Estou comparando os pratos com as legendas. Anotei uma pergunta para Celina sobre as técnicas de preparo.');
      this.visitor(W.maps.university,'community-luana','Luana','viviane',[15,10],'We are preparing a small exhibition. Each group needs to name its sources and explain what is still uncertain.','Estamos preparando uma pequena exposição. Cada grupo precisa nomear suas fontes e explicar o que ainda é incerto.');
      this.visitor(W.maps.restaurant,'community-paulo','Paulo','andre',[15,19],'I came to try the menu and ask about the teaching kitchen. Sharing a table can begin a good conversation.','Vim conhecer o cardápio e perguntar sobre a cozinha de ensino. Compartilhar uma mesa pode começar uma boa conversa.');
      this.visitor(W.maps.harbor,'community-noemia','Noêmia','viviane',[29,32],'I write down the animals I observe from the pier. Davi helps me compare my notes with his experience of the bay.','Anoto os animais que observo do cais. Davi me ajuda a comparar minhas notas com a experiência dele na baía.');
      for(const m of Object.values(W.maps))for(const o of m.objects)this.routine(m,o);
      const find=(m,id)=>W.maps[m]?.objects.find(o=>o.id===id),pair=(m,a,b,lines,en)=>this.chat(W.maps[m],find(m,a),find(m,b),lines,en);
      pair('market','market-vendor-dandara','community-rute',['Rute, conferiu as legendas do tabuleiro?','Conferi os nomes. Falta registrar quem compartilhou o preparo.','Vamos perguntar e escrever juntas.'],['Rute, did you check the labels?','The names are ready. We still need to credit the people who shared the recipes.','Let us ask and write them together.']);
      pair('cape-market','market-vendor-thandi','community-musa',['Musa, como foi a aula de costura?','Anotei a procedência do tecido com Zola.','Depois mostramos as peças e os nomes de quem criou.'],['Musa, how was the sewing lesson?','I wrote down the fabric source with Zola.','Later we can show the pieces and name their makers.']);
      pair('food-museum','food-museum-curator','community-caue',['Qual detalhe chamou sua atenção, Cauê?','A mesma base de feijão aparece com preparos diferentes.','Boa pergunta para comparar as fichas do tabuleiro.'],['What caught your attention, Cauê?','The same bean base appears with different techniques.','That is a good question for comparing the labels.']);
      pair('university','university-professor','community-luana',['Luana, sua ficha já tem as referências?','Tem duas fontes e uma dúvida marcada.','Ótimo. Vamos discutir essa dúvida na aula.'],['Luana, does your label have references?','It has two sources and one question marked.','Good. Let us discuss that question in class.']);
      pair('restaurant','restaurant-lia','community-paulo',['Paulo, quer conhecer a cozinha de ensino?','Quero! Primeiro vou terminar minha anotação do prato.','Depois mostro a passagem para a oficina.'],['Paulo, would you like to see the teaching kitchen?','Yes! First I will finish my note about the dish.','Then I can show you the way to the workshop.']);
      pair('harbor','sea-person-davi-port','community-noemia',['Noêmia, viu o grupo passando na baía?','Vi. Anotei sem tentar chegar perto.','Vamos comparar os registros no caderno das marés.'],['Noêmia, did you see the group crossing the bay?','Yes. I wrote it down without getting closer.','Let us compare the observations in the tide notebook.']);
      for(const id of ['cape-town','bo-kaap','kirstenbosch','muizenberg','kitchen','african-words','capoeira-courtyard']){
        const m=W.maps[id];if(!m)continue;const actors=m.objects.filter(o=>o.livingRoutine&&!o.group);
        for(const a of actors){const b=actors.find(b=>b!==a&&!b.group&&V.dist(a,b)<340);if(b)this.chat(m,a,b,['Já conferiu o registro para a próxima visita?','Anotei uma pergunta e deixei a fonte ao lado.','Depois podemos comparar as observações.'],['Did you check the record for the next visit?','I wrote down a question and kept the source beside it.','We can compare our observations later.']);}
      }
      V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();
    },
    draw(c,o,cam){
      if(o.type==='community-conversation'){
        if(W.nearest?.id===o.id){const x=o.x-cam.x,y=o.y-cam.y;c.save();c.fillStyle='#d6e8db';c.beginPath();c.ellipse(x,y-22,17,12,0,0,Math.PI*2);c.fill();c.fillStyle='#33665a';for(const dx of [-7,0,7])c.fillRect(x+dx-1,y-23,3,3);c.restore();}return true;
      }
      if(!o.livingRoutine)return false;
      const x=o.x-cam.x,y=o.y-cam.y;
      if(x< -85||y< -30||x>c.canvas.width+85||y>c.canvas.height+100)return true;
      const active=['reading','working','writing','conversing'].includes(o.action),row=o.greeting>0?5:active&&o.dir!==3?4:o.dir||0,frame=V.settings.reducedMotion?0:o.walking?o.frame:active?Math.floor((o.walkClock||0)*1.6)%4:0;
      const character=V.Assets.images[o.uniformSprite]?.naturalWidth?o.uniformSprite:o.character;
      if(!V.Assets.images[character]?.naturalWidth)return true;
      V.SceneShadows.character(c,character,x,y,64,row,frame,true);V.Assets.sprite(c,character,x,y,row,frame,64);
      // The animation already contains held objects. Never draw generic task
      // rectangles over NPCs: at this scale they cover their faces and bodies.
      if(W.nearest?.id===o.id)V.Maritime.label(c,S.describe(o).name,x,y-76,true);
      return true;
    },
    listen(o){const m=W.current,g=m.chats.find(g=>g.id===o.conversation);if(!g)return;V.Dialogue.start(g.lines.map((pt,i)=>({speaker:S.speaker(g.members[i%2],S.describe(g.members[i%2])),en:g.enLines[i],pt})));},
    bubbles(c){const m=W.current;if(!m||!(m.maritime||m.capeRegion||m.culinary||m.foodMuseum||m.animalMuseum||m.foodGallery||m.id==='cape-market'))return;const speakers=m.objects.filter(o=>o.chatSpeaking&&o.x-W.camera.x>20&&o.x-W.camera.x<c.canvas.width-20&&o.y-W.camera.y>70&&o.y-W.camera.y<c.canvas.height);for(const o of speakers.slice(0,1))C.bubble(c,o,W.camera);}
  };
  const describe=S.describe.bind(S);S.describe=o=>o.communityPersona||describe(o);
  // Harbour and Cape residents used to be scenery-only objects. Register them
  // as people too, so the existing pathfinding and conversation turns run.
  const person=C.person.bind(C);C.person=o=>movable.has(o?.type)||person(o);
  const init=W.init.bind(W);W.init=function(...args){const out=init(...args);N.seed();return out;};
  for(const owner of [C,V.Maritime,V.CapeRegion,V.Markets,V.FoodMuseum,V.AnimalMuseum,V.CulinaryWorld,V.NatureWorld]){
    if(!owner)continue;const key=owner.drawObject?'drawObject':owner.draw?'draw':null;if(!key)continue;
    const draw=owner[key].bind(owner);owner[key]=function(c,o,cam,...args){return N.draw(c,o,cam)||draw(c,o,cam,...args);};
  }
  for(const owner of [V.Maritime,V.CapeRegion]){const shadow=owner.shadow.bind(owner);owner.shadow=function(c,o,cam){if(!o.livingRoutine)return shadow(c,o,cam);};}
  const render=C.render.bind(C);C.render=function(c){const out=render(c);N.bubbles(c);return out;};
  const chats=C.updateChats.bind(C);C.updateChats=function(m,dt){if(V.settings.npcChats===false){for(const o of m.objects){o.chatSpeaking=false;o.bubble='';}return;}return chats(m,dt);};
  V.Hooks.around(V.Game, 'interact', 'neighbourhood-life:interact:1', nextHook => function(o){if(o?.type==='community-conversation'&&!V.modal&&!V.Dialogue.active&&this.mode==='explore')return N.listen(o);return nextHook(o);});
  const all=W.interactables.bind(W);W.interactables=function(...args){const out=all(...args),seen=new Set(out);for(const o of this.current?.objects||[])if((o.storyPerson||o.type==='story-plaque'||o.type==='community-conversation')&&!seen.has(o))out.push(o);return out;};
})();

});
