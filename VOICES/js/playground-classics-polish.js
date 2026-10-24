(function voicesClassicChallengesPolish(){
'use strict';
const V=window.V,P=V.Playground,D=V.PlaygroundData,C=P.controllers,clamp=V.clamp;
// The runner stays a lane-switching game: scenery, collectibles and obstacles
// change its rhythm without replacing the physical choice with quiz buttons.
const runner=C.runner,oldRunnerCreate=runner.create.bind(runner),oldRunnerDraw=runner.draw.bind(runner);
runner.create=function(training){return{...oldRunnerCreate(training),stage:0,coins:0,barrier:false,bonus:false,shield:3};};
runner.model=function(r){const d=r.data,w=D.words[(r.training?0:d.round)%D.words.length];return{request:`${r.training?'Treino':'Distrito '+(d.stage+1)+'/6'} · Encontre: ${w.pt}`,support:`${r.training?0:d.coins} moedas · ${d.shield} escudos · sequência ${r.combo} · ${['Praça','Feira','Parque','Mercado','Museu','Festival'][d.stage]}`,progress:r.training?Math.min(1,d.round):d.round,total:r.training?1:24,hint:'Mude de faixa até o portal certo. Desvie dos obstáculos e recolha moedas no caminho.'};};
runner.update=function(r,dt){const d=r.data,target=[260,480,700][d.lane];d.x+=(target-d.x)*Math.min(1,dt*16);if(r.training&&r.step<2)return;if(d.wait>0){d.wait-=dt;return;}
 const speed=[5.8,4.1,3][P.difficulty(r)]-Math.min(.6,d.stage*.11);d.z+=dt/Math.max(2.2,speed);const w=D.words[(r.training?0:d.round)%D.words.length],right=r.training?2:(d.round*2+Math.floor(d.round/3))%3;
 if((r.training||r.calm)&&d.z>.93&&d.lane!==right)d.z=.93;
 const barrierLane=(d.round+d.stage*2)%3,coinLane=(d.round*2+d.stage+1)%3;
 if(d.z>.36&&!d.bonus){d.bonus=true;if(!r.training&&d.lane===coinLane){d.coins++;P.hit(18);if(d.coins%5===0)d.shield=Math.min(3,d.shield+1);}}
 if(d.z>.59&&!d.barrier){d.barrier=true;if(!r.training&&d.stage>0&&d.round%3===1&&d.lane===barrierLane){d.shield=Math.max(0,d.shield-1);r.mistakes++;r.combo=0;P.feedback('Desvie dos blocos vermelhos! Escudos restantes: '+d.shield+'.',true);}}
 if(d.z>=1){if(d.lane===right){P.hit(100+(d.shield===3?20:0));P.feedback('✓ '+w.en+' = '+w.pt);if(!r.training)V.PixCollection.collect(w.en,'Corrida das Palavras');d.round++;const cleared=d.round>0&&d.round%4===0;d.z=0;d.wait=.42;d.barrier=false;d.bonus=false;if(r.training){P.event('runner-hit');return;}if(cleared){P.stageClear(r,d.stage);if(d.round>=24){P.finish();return;}d.stage++;d.shield=Math.min(3,d.shield+1);P.feedback('✓ Distrito concluído! Novo ambiente: '+['Praça','Feira','Parque','Mercado','Museu','Festival'][d.stage]+'.');}}else{d.shield=Math.max(0,d.shield-1);P.feedback('Outro portal! '+w.en+' significa '+w.pt+'. Tente novamente.',true);d.z=0;d.wait=.7;d.barrier=false;d.bonus=false;}}
};
runner.draw=function(c,r){oldRunnerDraw(c,r);const d=r.data;if(r.training)return;const color=['#91b6a1','#c49b78','#79aa8f','#cca270','#9aafbc','#ad91b6'][d.stage],y=215+d.z*154;
 P.box(c,8,165,182,38,'#173e35',color);P.text(c,['PRAÇA','FEIRA','PARQUE','MERCADO','MUSEU','FESTIVAL'][d.stage],100,184,16,'#fff0ce');const coinLane=(d.round*2+d.stage+1)%3,barrierLane=(d.round+d.stage*2)%3,spread=75+d.z*145;
 if(!d.bonus){const x=480+(coinLane-1)*spread;c.fillStyle='#f3cd6f';c.beginPath();c.arc(x,y-32,9+d.z*12,0,Math.PI*2);c.fill();P.text(c,'★',x,y-32,14,'#725b39');}
 if(d.stage>0&&d.round%3===1&&!d.barrier){const x=480+(barrierLane-1)*spread;P.box(c,x-17-d.z*10,y-6,34+d.z*20,24+d.z*11,'#a3524b','#f3bba5');P.text(c,'!',x,y+5,19,'#f9e8cc');}
 P.text(c,'★ '+d.coins,850,244,20,'#fff1c6');};

const rhythm=C.rhythm,oldRhythmCreate=rhythm.create.bind(rhythm),oldRhythmGuide=rhythm.guideStep.bind(rhythm),oldRhythmDraw=rhythm.draw.bind(rhythm);
const tracks=['Samba · pulsações', 'Jazz · síncopes', 'Percussão de rua · respostas', 'Roda · alternâncias', 'Encontro de timbres', 'Finale · banda completa'];
rhythm.create=function(training){const d=oldRhythmCreate(training);if(!training)d.notes=Array.from({length:48},(_,i)=>{const stage=Math.floor(i/8),j=i%8;return{lane:(stage%2?j*3+Math.floor(j/2):j+Math.floor(j/3)+stage)%4,at:2+i*.78,done:false};});return d;};
rhythm.model=function(r){const d=r.data,stage=Math.min(5,Math.floor(d.resolved/8));return{request:r.training?'Acerte os sinais na linha dourada':`Faixa ${stage+1}/6 · ${tracks[stage]}`,support:`${d.hit} acertos · ${d.resolved-d.hit} perdidos · combo ${r.combo} · D F J K`,progress:r.training?d.hit:d.resolved,total:r.training?r.step===2?4:1:48,hint:'O nome de cada faixa indica um arranjo original do jogo, não uma transcrição de obra tradicional.'};};
rhythm.guideStep=function(r){oldRhythmGuide(r);};
rhythm.action=function(r,name,n){if(name!=='drum')return;const d=r.data;r.moves++;d.flash[n]=.2;V.Audio.drum(n%2?'hat':'kick');if(r.training&&r.step===0){if(n===0)P.event('drum');return;}const note=d.notes.find(a=>!a.done),window=[.34,.24,.17][P.difficulty(r)];if(note&&note.lane===n&&Math.abs(note.at-d.time)<window){note.done=true;d.hit++;d.resolved++;P.hit(Math.abs(note.at-d.time)<.08?95:65);P.feedback(Math.abs(note.at-d.time)<.08?'PERFEITO!':'✓ Boa batida!');if(r.training){if(r.step===1)P.event('rhythm-hit');else if(d.hit>=4)P.event('rhythm-sequence');}else if(d.resolved%8===0){P.stageClear(r,d.resolved/8-1);if(d.resolved>=48)P.finish();else P.feedback('★ Faixa concluída! Próxima música: '+tracks[Math.floor(d.resolved/8)]+'.');}}else P.feedback('Ouça o pulso e observe a faixa correspondente.',true);};
rhythm.update=function(r,dt){const d=r.data;d.flash=d.flash.map(t=>Math.max(0,t-dt));if(r.training&&r.step===0)return;d.time+=dt;const note=d.notes.find(n=>!n.done);if(!note)return;const window=[.34,.24,.17][P.difficulty(r)];if(r.calm&&d.time>=note.at)d.time=note.at;if(!r.calm&&d.time>note.at+window){note.done=true;d.resolved++;r.mistakes++;r.combo=0;r.feedback='Sinal perdido. A próxima nota já está vindo.';if(!r.training&&d.resolved%8===0){P.stageClear(r,d.resolved/8-1);if(d.resolved>=48)P.finish();}}};
rhythm.draw=function(c,r){oldRhythmDraw(c,r);const d=r.data;if(!r.training){}};

const oldRoomPlace=C.room.place.bind(C.room);C.room.place=function(r){const before=r.data.round,result=oldRoomPlace(r);if(!r.training&&r.data.round>before)P.stageClear(r,before);return result;};
for(const id of ['courier','bridges']){const ctrl=C[id],field='stage',oldAction=ctrl.action.bind(ctrl),oldUpdate=ctrl.update?.bind(ctrl);if(id==='bridges'){
  ctrl.update=function(r,dt){const before=r.data.stage;oldUpdate?.(r,dt);if(!r.training&&r.data.stage>before)P.stageClear(r,before);};
 }else{
  ctrl.action=function(r,...args){const before=r.data[field];const result=oldAction(r,...args);if(!r.training&&r.data[field]>before)P.stageClear(r,before);return result;};
 }}
})();
