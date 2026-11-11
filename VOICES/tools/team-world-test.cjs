'use strict';
const assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const {V,w,dom}=await environment({bundle:process.argv.includes('--bundle'),moduleOrder:'reverse'});
  const W=V.World,B=V.Combat,P=V.Progress,T=V.Team;
  try{
    await V.Game.init();
    V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;
    V.Game.newState({name:'Equipe de teste',character:'nia'});
    V.Onboarding.record().status='complete';
    Object.assign(V.state.flags,{prologueStarted:true,prologueDone:true});
    P.ensure().story.stage='awake';
    V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
    V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();

    V.WorldAtlas.open('world');
    const group=V.$('#harmony-region');
    group.value='all';group.onchange();
    const rows=V.$$('[data-harmony-result]').map(el=>el.dataset.harmonyResult).sort();
    assert.deepEqual(Array.from(rows),Object.keys(W.maps).sort());
    for(const id of ['african-words','harbor','garden','university','chapter-5'])assert(V.$(`[data-harmony-pin="${id}"]`),id);
    for(const id of ['cape-town','kirstenbosch','nature-cerrado','sanctuary-village-br','interior-horizonte-203'])assert(rows.includes(id),id);
    assert.equal(V.$('[data-harmony-result="nature-cerrado"] small').textContent,'Biomas e santuários');
    V.$('[data-harmony-result="cape-town"]').click();
    assert.equal(V.WorldAtlas.selected,'cape-town');
    V.UI.close();
    console.log('PASS the overview directory includes every live map and selects places beyond the illustrated city');

    let doors=0,windows=0,sideDoors=0;
    for(const [id] of V.ResidentialPlans.plans){
      const m=W.maps[id],walls=V.Architecture.geometry(m.design).walls;
      for(const d of m.design.construction.doors.filter(o=>o.room&&o.wall)){
        const wall=walls.find(x=>x.openings.some(o=>o.door===d.id));
        assert(wall,id+' · '+d.id);assert(wall.height>=d.height+24);
        const mount=V.Architecture.residentialOpening(m,d,{x:0,y:0});
        assert(Number.isFinite(mount.x)&&Number.isFinite(mount.y));
        if(Math.abs(d.normal.x)>.5){assert(mount.slope);sideDoors++;}
        doors++;
      }
      for(const win of m.design.homeWindows){
        const wall=walls.find(x=>x.windows.some(o=>o.id===win.id));
        assert(wall?.height>=68,win.id);windows++;
      }
    }
    assert(doors>140&&windows>140&&sideDoors>0);
    console.log('PASS residential door frames and windows share the actual wall and opening coordinates');

    P.character('party');
    assert.equal(V.$$('.team-slot').length,6);
    V.$('[data-team-tab="recruit"]').click();
    assert.equal(V.$$('[data-team-mission]').length,8);
    V.$('[data-team-mission="ines"]').click();
    assert(V.$('#team-mission-track').disabled);
    V.$('#team-mission-back').click();
    V.$('[data-team-mission="jaci"]').click();
    V.$('#team-mission-track').click();
    assert.equal(V.ObjectiveGuide.objective().object.id,T.siteId('jaci'));
    V.state.unlocked=6;
    for(const r of T.recruits){
      W.load(r.map);await V.MapAssets.whenReady();V.UI.close();
      const m=W.current,site=m.objects.find(o=>o.id===T.siteId(r.id));
      assert(site,r.id);
      assert(!V.Living.blocked(m,site.x,site.y,11),r.id);
      assert(W.interactables().includes(site),r.id);
      V.Game.interact(site);
      V.$('#team-start-trial').click();
      V.$(`[data-team-answer="${(r.right+1)%3}"]`).click();
      assert(!T.unlocked().includes(r.id),r.id);
      V.$(`[data-team-answer="${r.right}"]`).click();
      assert(T.unlocked().includes(r.id),r.id);
      assert(V.state.sideQuests[T.questId(r.id)].done);
      assert(!W.interactables().includes(site));
      V.UI.close();
    }
    const ids=['cora','bento','ines','jaci','dandara'];
    for(const id of ids)assert(T.edit(id),id);
    assert(!T.edit('denis'));
    assert(T.edit('bento',-1));
    assert.deepEqual(Array.from(T.lineup()),['bento','cora','ines','jaci','dandara']);
    assert(V.Save.stateValid(V.state));
    assert.deepEqual(Array.from(V.Save.load().adventure.party),Array.from(T.lineup()));
    console.log('PASS each in-world recruitment mission unlocks its own ally and five slots persist around the player');

    assert(B.begin(1,false,{practice:true}));
    assert.equal(B.active.allies.length,6);
    assert.equal(V.$$('.turn-member').length,6);
    const a=B.active,positions=a.allies.map(actor=>B.position(actor,{width:460,depth:218,top:54,size:45,narrow:true}));
    assert.equal(new Set(positions.map(p=>p.x+':'+p.y)).size,6);
    assert.equal(new Set(positions.map(p=>p.x)).size,2);
    assert(positions.every(p=>p.y>54+218*.55));
    const actor=a.allies.find(o=>o.character==='jaci'),target=a.allies[0];
    a.actor=actor.id;a.phase='command';actor.focus=actor.stats.focus;
    const skill=T.kits.jaci.skills[0];
    target.health=Math.max(1,Math.floor(target.stats.health*.32));
    B.status(target,'corruption',2);
    assert.equal(B.availability({type:'skill',id:skill.id},actor),'');
    assert(B.availability({type:'skill',id:T.kits.cora.skills[0].id},actor));
    assert(B.availability({type:'skill',id:'restore'},actor));
    B.choose('skills');
    assert.deepEqual(Array.from(V.$$('[data-turn-kind="skill"]'),b=>b.dataset.turnId),Array.from(T.kits.jaci.skills,s=>s.id));
    const suggestion=B.suggestion();
    assert.equal(suggestion.action.id,skill.id);
    const health=target.health;
    assert(B.commit({type:'skill',id:skill.id},target.id));
    assert(target.health>health);assert(!B.has(target,'corruption'));
    assert(actor.cooldowns[skill.id]>0);
    assert.equal(a.visual.teamFx,skill.fx);
    const c=w.document.createElement('canvas').getContext('2d');
    assert(V.TeamArt.draw(c,skill.fx,70,60,90,.3,.65));
    assert(c.getImageData(25,15,90,90).data.some((value,i)=>i%4===3&&value>80));
    const snapshot=P.ensure().battle;
    assert.equal(V.Save.load().adventure.battle.allies.length,6);
    B.active=null;assert(B.resume(snapshot));assert.equal(B.active.allies.length,6);
    assert.equal(B.active.allies.find(o=>o.character==='jaci').cooldowns[skill.id],actor.cooldowns[skill.id]);
    console.log('PASS a six-member battle exposes each kit, recommends a role skill, renders the new effect and resumes its cooldown');
  }finally{V.MapAssets.cancel();dom.window.close();}
  process.exit(0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
