(function voicesPlatformRadio(){
'use strict';
const V=window.V,P=V.Playground,C=P.controllers,clamp=V.clamp;
const tracks=[
 {sky:'#93bec4',land:'#79a47f',name:'Praça das palavras',words:['book','house'],hazards:[]},
 {sky:'#b9c9aa',land:'#75a07b',name:'Jardins suspensos',words:['water','seed','garden'],hazards:[510]},
 {sky:'#d7bc9e',land:'#a78c69',name:'Mercado da cidade',words:['friend','street','community'],hazards:[520,960]},
 {sky:'#9fbcc8',land:'#7796a4',name:'Bairro do arquivo',words:['school','read','memory'],hazards:[490,910,1310]},
 {sky:'#aba6bf',land:'#737aa0',name:'Telhados noturnos',words:['listen','music','window'],hazards:[480,900,1320,1590]},
 {sky:'#b3bda1',land:'#608878',name:'Portais do conhecimento',words:['book','knowledge','community','memory'],hazards:[470,750,1010,1320,1550]}
];
function platformStage(stage,training){const cfg=tracks[training?0:stage],length=training?850:1820,positions=training?[330]:[315,730,1150,1530];return{stage,x:75,y:444,vy:0,grounded:true,facing:2,cam:0,wordIndex:[],coins:[],elapsed:0,invuln:0,respawns:0,finishWait:0,required:training?1:Math.min(cfg.words.length,stage<2?2:3),length,notes:cfg.words.map((word,i)=>({word,x:positions[i]||1530,y:stage>=2&&i%2?363:426})),platforms:training?[{x:460,y:397,w:125}]:Array.from({length:5},(_,i)=>({x:270+i*287,y:stage>1&&i%2?355:393,w:118})),hazards:training?[]:cfg.hazards.slice(),title:cfg.name};}
function platformGround(x){return x>=0;}
C.platform={
 create(training,start=0){return platformStage(start,training);},
 guideStep(r){if(r.step===2&&r.data.wordIndex.length){r.data.wordIndex=[];r.data.notes[0].x=Math.max(r.data.x+90,330);}},
 model(r){const d=r.data;return{request:`Fase ${d.stage+1} · ${d.title}`,support:`${d.wordIndex.length}/${d.required} palavras · ${d.coins.length} moedas · ${d.respawns} tropeços`,progress:Math.min(d.required,d.wordIndex.length),total:d.required,action:'Saltar · espaço',hint:'Colete palavras no cenário para abrir o portal. Os obstáculos podem ser saltados.'};},
 controls(r,host){const left=P.button('pg-left','←',()=>{}),right=P.button('pg-right','→',()=>{}),jump=P.button('pg-action','↑ Saltar',()=>P.action('jump'),'primary');for(const [b,n]of [[left,-1],[right,1]]){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);P.held={x:n,y:0};};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>P.held={x:0,y:0};}host.append(left,jump,right);},
 key(r,k){if(['arrowup','w',' ','space','spacebar'].includes(k)){P.action('jump');return true;}if(['arrowleft','arrowright','a','d'].includes(k))return true;return false;},
 action(r,name){const d=r.data;if(name==='jump'&&(d.grounded||d.coyote>0)){d.vy=-515-(P.difficulty(r)===0?15:0);d.grounded=false;d.coyote=0;r.moves++;P.event('platform-jump');V.Audio.sfx('menu');}},
 update(r,dt){const d=r.data,difficulty=P.difficulty(r);d.elapsed+=dt;d.invuln=Math.max(0,d.invuln-dt);let axis=V.Input.axis().x+P.held.x;axis=clamp(axis,-1,1);if(axis){d.x=clamp(d.x+axis*([240,280,315][difficulty])*dt,30,d.length-30);d.facing=axis>0?2:1;r.moves++;P.event('platform-walk');}const priorY=d.y;d.vy=clamp(d.vy+1120*dt,-650,700);d.y+=d.vy*dt;d.grounded=false;const candidate=[{x:0,y:455,w:d.length},...d.platforms.map(p=>({...p,y:p.y}))].filter(p=>d.x>=p.x-12&&d.x<=p.x+p.w+12&&d.vy>=0&&priorY<=p.y+10&&d.y>=p.y);candidate.sort((a,b)=>a.y-b.y);if(candidate.length){d.y=candidate[0].y;d.vy=0;d.grounded=true;d.coyote=.12;}else d.coyote=Math.max(0,(d.coyote||0)-dt);if(d.y>520){d.y=444;d.vy=0;d.x=Math.max(65,d.x-140);d.respawns++;r.mistakes++;}
 for(const [i,n]of d.notes.entries())if(!d.wordIndex.includes(i)&&Math.hypot(d.x-n.x,(d.y-22)-n.y)<55){d.wordIndex.push(i);P.hit(80);if(!r.training)V.PixCollection.collect(n.word,'Palavras em Movimento');P.feedback('✓ '+n.word+' coletada!');P.event('platform-word');}
 for(let i=0;i<d.length/220;i++){const x=200+i*220;if(!d.coins.includes(i)&&Math.hypot(d.x-x,d.y-20-405)<45){d.coins.push(i);P.hit(15);}}
 if(d.invuln===0&&d.hazards.some(x=>Math.abs(d.x-x)<25&&d.y>415)){d.invuln=1.6;d.respawns++;r.mistakes++;r.combo=0;d.x=Math.max(70,d.x-115);d.y=444;d.vy=0;P.feedback('Barreira! Pule para passar; seu progresso de palavras foi mantido.',true);}
 if(d.x>=d.length-95){if(d.wordIndex.length<d.required){if(d.finishWait<=0)P.feedback('Portal fechado: faltam '+(d.required-d.wordIndex.length)+' palavras. Volte e procure as placas.',true);d.finishWait=1;}else if(r.training){P.event('platform-word');}else{P.stageClear(r,d.stage);P.hit(250);if(d.stage>=5)P.finish();else{r.data=platformStage(d.stage+1,false);P.feedback('✓ Portal aberto! Uma nova região foi descoberta.');}}}d.finishWait=Math.max(0,d.finishWait-dt);},
 hint(r){const d=r.data,n=d.notes.find((n,i)=>!d.wordIndex.includes(i));P.feedback(n?'Próxima palavra: '+n.word+' perto do marco '+Math.round(n.x/100)+'.':'Todas coletadas. Corra até o portal ao fim do cenário.');},
 spot(r){const d=r.data,p=r.step===2?d.notes[0].x:d.x;return{x:clamp(480+p-d.x,100,860),y:r.step===1?380:428,w:155,h:125};},
 draw(c,r){const d=r.data,cfg=tracks[d.stage],cam=clamp(d.x-310,0,Math.max(0,d.length-960));d.cam=cam;P.box(c,0,0,960,540,cfg.sky);for(let i=0;i<15;i++){const x=i*170-(cam*.2)%170;P.box(c,x,190+(i%3)*20,100,130,'#85a7a0');P.box(c,x+12,200+(i%3)*20,27,24,'#f1dba9');}P.box(c,0,455,960,85,cfg.land);P.box(c,0,454,960,8,'#dec990');for(const p of d.platforms){P.box(c,p.x-cam,p.y,p.w,18,'#d7bd88','#f3dfab');P.box(c,p.x+6-cam,p.y+17,p.w-12,9,'#688472');}
 for(let i=0;i<d.length/220;i++){if(d.coins.includes(i))continue;const x=200+i*220-cam;if(x>=-30&&x<990){c.fillStyle='#ecd18c';c.beginPath();c.arc(x,400,9,0,Math.PI*2);c.fill();P.text(c,'★',x,400,12,'#815d37');}}
 for(const [i,n]of d.notes.entries()){if(d.wordIndex.includes(i))continue;const x=n.x-cam;if(x<-100||x>1050)continue;P.box(c,x-53,n.y-36,106,43,'#e7d7a9','#456d5c');c.save();c.font='600 17px system-ui,sans-serif';const wordSize=Math.min(17,17*94/Math.max(1,c.measureText(n.word).width));P.text(c,n.word,x,n.y-14,wordSize,'#244737');c.restore();c.strokeStyle='#f6c873';c.lineWidth=2;c.strokeRect(x-57,n.y-39,114,50);}
 for(const x of d.hazards){const px=x-cam;P.box(c,px-17,422,34,34,'#9d5c53','#f8d7b0');P.text(c,'!',px,439,22,'#f6deb8');}P.box(c,d.length-80-cam,356,58,99,d.wordIndex.length>=d.required?'#7fbfa5':'#697883','#f6dd98');P.text(c,d.wordIndex.length>=d.required?'✓':'🔒',d.length-52-cam,403,25);
 P.person(c,d.x-cam,d.y+2,!!V.Input.axis().x||!!P.held.x,d.facing,66);}
};

const stations=[
 {title:'Boas-vindas ao bairro',waves:[[1,2,1]]},
 {title:'Histórias da praça',waves:[[2,1,3],[3,1,2]]},
 {title:'Jornal da comunidade',waves:[[3,2,4],[2,4,1]]},
 {title:'Sons do bairro',waves:[[4,2,1],[1,4,3],[2,3,4]]},
 {title:'Vozes no arquivo',waves:[[2,4,3],[4,1,2],[3,2,4]]},
 {title:'Grande transmissão',waves:[[4,3,1],[1,2,4],[3,4,2],[2,1,3]]}
];
function makeRadio(training,stage){const s=stations[training?0:stage];return{stage,segment:0,frequency:[0,0,0],selected:0,energy:100,timer:0,transmitted:0,flash:0,title:s.title,waves:training?[[1,2,1]]:s.waves};}
C.radio={
 create(training,start=0){return makeRadio(training,start);},
 model(r){const d=r.data,w=d.waves[d.segment]||d.waves.at(-1),stable=d.frequency.every((n,i)=>n===w[i]);return{request:`Transmissão ${d.stage+1} · ${d.title}`,support:`${d.transmitted}/${d.waves.length} mensagens · bateria ${Math.floor(d.energy)}% · canal ${d.selected+1}`,progress:d.transmitted,total:d.waves.length,action:stable?'Transmitir agora · E':'Sintonize os três canais',disabled:!stable,hint:'As barrinhas douradas mostram o alvo de cada frequência (0–4). Ajuste todos os canais.'};},
 controls(r,host){const choice=document.createElement('div');choice.className='pg-radio-choices';for(let i=0;i<3;i++)choice.append(P.button('pg-radio-'+i,['Voz 1','Som 2','Arquivo 3'][i],()=>P.action('select',i)));host.append(choice,P.button('pg-radio-minus','−',()=>P.action('tune',-1)),P.button('pg-action','Transmitir · E',()=>P.action('send'),'primary'),P.button('pg-radio-plus','+',()=>P.action('tune',1)));},
 key(r,k){if(['1','2','3'].includes(k)){P.action('select',+k-1);return true;}if(['arrowleft','a'].includes(k)){P.action('tune',-1);return true;}if(['arrowright','d'].includes(k)){P.action('tune',1);return true;}if(['e','enter',' ','space'].includes(k)){P.action('send');return true;}return false;},
 action(r,name,arg){const d=r.data;if(name==='select'){d.selected=arg;r.moves++;P.event('radio-select');return;}if(name==='tune'){d.frequency[d.selected]=clamp(d.frequency[d.selected]+arg,0,4);r.moves++;P.event('radio-tune');V.Audio.sfx('menu');return;}if(name!=='send')return;const goal=d.waves[d.segment];if(!goal||!goal.every((n,i)=>n===d.frequency[i])){P.feedback('Há canais fora de sintonia. Observe as marcas douradas.',true);return;}d.energy=clamp(d.energy+28,0,100);d.transmitted++;d.flash=.6;r.moves++;P.hit(160);P.event('radio-send');V.Audio.sfx('correct');if(r.training){P.feedback('✓ Sua mensagem foi transmitida!');return;}if(d.transmitted>=d.waves.length){P.stageClear(r,d.stage);if(d.stage>=5)P.finish();else{r.data=makeRadio(false,d.stage+1);P.feedback('✓ Transmissão concluída! Uma nova programação começou.');}}else{d.segment++;P.feedback('✓ Mensagem no ar! As frequências mudaram para o próximo bloco.');}},
 update(r,dt){const d=r.data;d.flash=Math.max(0,d.flash-dt);if(r.training)return;const diff=P.difficulty(r);const goal=d.waves[d.segment];if(!goal)return;const imbalance=goal.reduce((n,v,i)=>n+Math.abs(v-d.frequency[i]),0);d.energy=clamp(d.energy-dt*([.25,.55,.85][diff]+imbalance*[.12,.22,.32][diff]),0,100);if(d.energy<=0){d.energy=70;d.frequency=[0,0,0];r.mistakes++;r.combo=0;P.feedback('Interferência! A estação recuperou energia; retome a sintonia.',true);}},
 pointer(r,type,p){if(type!=='down')return;if(p.x<180||p.x>790||p.y<220||p.y>425)return;const channel=clamp(Math.round((p.y-258)/78),0,2);if(channel!==r.data.selected)P.action('select',channel);else P.action('tune',p.x>490?1:-1);},
 hint(r){const d=r.data,w=d.waves[d.segment];P.feedback('Alvos por canal: '+w.map((v,i)=>`${i+1} → ${v}`).join(' · ')+'. Selecione 1–3 e sintonize.');},
 spot(r){return{x:r.step===2?720:490,y:r.step===0?260:r.step===1?340:400,w:240,h:90};},
 draw(c,r){const d=r.data,goal=d.waves[d.segment]||d.waves.at(-1);P.box(c,0,0,960,540,'#384d51');P.box(c,142,155,676,314,'#c7aa7c','#f3dfac');P.box(c,179,177,603,45,d.flash?'#90c2a8':'#243f41','#e7c996');P.text(c,d.flash?'TRANSMISSÃO ENVIADA ✓':`ESTAÇÃO VOICES · ${d.title.toUpperCase()}`,480,199,17,'#f5e3ba');for(let i=0;i<3;i++){const y=267+i*78,selected=i===d.selected;P.box(c,178,y-25,604,62,selected?'#365d58':'#516c64','#e7d09f');P.text(c,['VOZ','SOM','ARQUIVO'][i]+' · '+(i+1),245,y+1,16,'#f5e5c6');for(let j=0;j<=4;j++){const x=360+j*72;P.box(c,x-19,y-13,38,27,j===goal[i]?'#e6c77f':j<=d.frequency[i]?'#84bbaa':'#284e49',j===goal[i]?'#edc67b':'#819b84');P.text(c,''+j,x,y,14,j===goal[i]||j<=d.frequency[i]?'#183c31':'#f4e6c7');}P.text(c,selected?'◀':'',743,y,20,'#f2d281');}
 P.box(c,178,448,604,9,'#4c605c');P.box(c,178,448,604*d.energy/100,9,'#91c49c');}
};
})();
