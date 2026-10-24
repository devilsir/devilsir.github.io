(function voicesGardenUpgrade(){
'use strict';const V=window.V,P=V.Playground,g=P.controllers.garden;
const oldCreate=g.create.bind(g),oldModel=g.model.bind(g),oldAction=g.action.bind(g),oldUpdate=g.update.bind(g),oldDraw=g.draw.bind(g);
const seasons=[{name:'Primeira colheita',watering:1,weed:false},{name:'Semana seca',watering:2,weed:false},{name:'Folhas invasoras',watering:1,weed:true},{name:'Mutirão da botica',watering:2,weed:true}];
g.create=function(training){return{...oldCreate(),cycle:0,care:Array.from({length:3},()=>({watered:0,clean:false}))};};
g.model=function(r){const m=oldModel(r),d=r.data,season=seasons[d.cycle]||seasons[0];if(r.training)return m;const status=d.beds.findIndex((b,i)=>b.status==='ready'&&season.weed&&!d.care[i]?.clean);m.request=`Fase ${d.cycle+1}/4 · ${season.name} · plantar, cuidar e entregar`;m.support+=` · ${season.watering} rega(s) · ${season.weed?'retirar folhas invasoras':'cultivo tranquilo'}`;if(status>=0){m.hint='O canteiro pode precisar de limpeza antes da colheita.';const bed=[[3,2],[7,3],[9,4]][status];if(Math.hypot(d.player.x-bed[0],d.player.y-bed[1])<1.35)m.action='Limpar folhas · E';}return m;};
g.action=function(r,name){if(r.training||name!=='use')return oldAction(r,name);const d=r.data,season=seasons[d.cycle]||seasons[0],p=d.player;
 const dist=(x,y)=>Math.hypot(p.x-x,p.y-y),beds=[[3,2],[7,3],[9,4]],i=beds.findIndex(([x,y])=>dist(x,y)<1.35),b=i<0?null:d.beds[i];
 if(i>=0&&b?.status==='planted'&&season.watering>1){if(!d.water)return P.feedback('Regador vazio. Reabasteça na fonte.');d.care[i].watered++;d.water--;r.moves++;if(d.care[i].watered>=season.watering){b.status='growing';b.growth=0;P.feedback('✓ Duas regas completas. Aguarde o crescimento.');}else P.feedback('O solo ainda precisa de mais uma rega nesta fase seca.');P.event('water');return;}
 if(i>=0&&b?.status==='ready'&&season.weed&&!d.care[i].clean){d.care[i].clean=true;r.moves++;P.hit(30);P.feedback('✓ Folhas invasoras retiradas. Agora colha o canteiro.');return;}
 if(dist(11,1)<1.35&&d.harvest&&d.harvest+d.delivered>=3){d.delivered+=d.harvest;d.harvest=0;r.moves++;P.hit(200);P.stageClear(r,d.cycle);if(d.cycle>=3){P.finish();return;}d.cycle++;d.delivered=0;d.beds=Array.from({length:3},()=>({status:'empty',growth:0}));d.care=Array.from({length:3},()=>({watered:0,clean:false}));d.seeds=0;d.water=0;P.feedback('✓ Colheita entregue! Próxima missão: '+seasons[d.cycle].name+'.');return;}
 return oldAction(r,name);};
g.update=function(r,dt){oldUpdate(r,dt);};
g.draw=function(c,r){oldDraw(c,r);if(r.training)return;const d=r.data,season=seasons[d.cycle]||seasons[0];if(season.weed)for(let i=0;i<3;i++){if(d.beds[i].status==='ready'&&!d.care[i].clean){const x=90+[3,7,9][i]*60,y=197+[2,3,4][i]*38;P.text(c,'CLEAR WEEDS',x,y-38,14,'#814c39');}}};
})();
