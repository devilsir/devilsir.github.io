'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {environment}=require('./runtime-upgrade-test.cjs');
const output=path.resolve(__dirname,'../.qa/review');

(async()=>{
  const {V,w,dom,canvases}=await environment({bundle:process.argv.includes('--bundle')});
  const E=V.Environment,S=V.Seasons,R=V.SeasonVisuals;
  const rows=[];
  const check=async(name,test)=>{
    try{await test();rows.push({name,pass:true});console.log('PASS',name);}
    catch(error){rows.push({name,pass:false});console.error('FAIL',name,error.stack);}
    finally{V.UI.close();}
  };
  const surface=(width=940,height=610)=>{
    const el=w.document.createElement('canvas');
    el.width=width;el.height=height;
    const c=el.getContext('2d'),canvas=canvases.get(el).canvas;
    return {c,canvas,save:name=>fs.writeFileSync(path.join(output,name+'.png'),canvas.toBuffer('image/png'))};
  };
  const load=async id=>{
    V.World.load(id);await V.MapAssets.whenReady();
    V.World.transition=0;
    return V.World.current;
  };
  fs.mkdirSync(output,{recursive:true});
  await V.Game.init();
  V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;
  V.Game.newState({name:'Calendário e clima',character:'nia'});
  Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});
  V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();
  V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();
  const a=E.state(),clock=a.clock;
  Object.assign(V.settings,{worldHours:false,npcHomeRoutines:false,reducedMotion:false,reducedFlash:false,weatherIntensity:.85});

  await check('the calendar crosses each season and the year boundary while older saves keep their clock',()=>{
    for(const [day,season,year] of [[1,'spring',1],[7,'spring',1],[8,'summer',1],[15,'autumn',1],[22,'winter',1],[29,'spring',2]]){
      clock.day=day;
      const result=S.calendar(a);
      assert.equal(result.season,season);assert.equal(result.year,year);
    }
    Object.assign(clock,{day:21,hour:23.99,speed:1,cycleMinutes:2});
    E.update(.1,false);
    assert.equal(clock.day,22);assert.equal(S.calendar(a).season,'winter');
    const legacy={clock:{day:9,hour:8},weather:{seed:971}};
    assert.equal(S.calendar(legacy).season,'summer');
    assert.equal(legacy.clock.day,9);assert.equal(legacy.climate.season,'auto');
    clock.cycleMinutes=24;clock.hour=12;
  });

  await check('local forecasts are reproducible, wet and dry regions differ and natural snow stays in cold climates',()=>{
    const city=V.World.maps.hub,cape=V.World.maps['cape-town'],coast=V.World.maps.harbor;
    assert.notEqual(S.zone(city),S.zone(cape));assert.notEqual(S.zone(city),S.zone(coast));
    let snow=0,dryWet=0,rainyWet=0;
    for(let day=21;day<28;day++)for(let hour=0;hour<24;hour+=4){
      const at=day*24+hour;
      if(S.forecastAt(a,S.zone(city),at).type==='snow')snow++;
      for(const zone of ['cape','tropical','cerrado','savanna'])assert.notEqual(S.forecastAt(a,zone,at).type,'snow');
    }
    for(let hour=0;hour<168;hour+=4){
      if(['rain','storm'].includes(S.forecastAt(a,'cerrado',168+hour).type))rainyWet++;
      if(['rain','storm'].includes(S.forecastAt(a,'cerrado',504+hour).type))dryWet++;
    }
    assert(snow>0&&rainyWet>dryWet);
    const forecast=S.forecast(city),first=forecast[0];
    clock.day=first.day;clock.hour=first.hour+.5;
    assert.equal(E.weather(city).type,first.type);
    assert.deepEqual(S.forecast(city),S.forecast(city));
  });

  await check('roof and foliage art load on outdoor maps and winter leaves exits, walls and sea intact',async()=>{
    assert(!V.MapAssets.groups(V.World.current).includes('seasonal-world'));
    assert(Object.values(R.images).every(img=>img.naturalWidth===0));
    const m=await load('residential'),f=m.buildings[0];
    assert(V.MapAssets.groups(m).includes('seasonal-world'));
    for(const [id,art]of Object.entries(V.SeasonArtData)){
      assert(R.images[id].naturalWidth);
      assert.equal(art.frames.length,id==='buildings'?4:16);
    }
    E.setHour(13);
    const before=JSON.stringify(m.solids),drawn=surface();
    V.World.camera={x:Math.max(0,f.x-152),y:Math.max(0,f.y-56)};
    const face=R.roof,painted=[];
    R.roof=function(c,b,cam,profile){painted.push(b);return face.call(this,c,b,cam,profile);};
    try{
      S.select('winter','snow');V.Cozy.render(drawn.c);drawn.save('seasons-winter-residential');
      assert(painted.length>0);assert(R.frame===null);
      assert.equal(JSON.stringify(m.solids),before);
      S.select('autumn','clear');S.ensure(a).cover={};V.Cozy.render(drawn.c);drawn.save('seasons-autumn-residential');
    }finally{R.roof=face;}
    const sea=await load('harbor'),nav=V.MaritimeData.maps.harbor;
    S.select('winter','snow');
    assert(E.weather(sea).snowAllowed);
    const frame=R.weatherFrame(sea,{x:0,y:0},drawn.c);
    assert(R.land(frame,2*48,4*48));
    assert(!R.land(frame,(nav.shore+30)*48,10*48));
    const cape=await load('bo-kaap'),house=cape.objects.find(o=>o.art==='cape-houses'||o.art==='bo-kaap-terrace');
    assert(house,'raster row houses are present');
    const box=V.CapeVisuals.artBox(house);
    R.frame=R.weatherFrame(cape,V.World.camera,drawn.c);
    try{
      const variant=R.raster(drawn.c,house);
      assert(variant&&variant!==box.im&&variant.width>100);
      assert.equal(V.CapeVisuals.artBox(house).im,box.im,'shadow keeps the original aligned bounds');
    }finally{R.frame=null;}
    V.World.camera={x:Math.max(0,box.x-140),y:Math.max(0,box.y-84)};
    V.Cozy.render(drawn.c);drawn.save('seasons-winter-cape');
  });

  await check('weather accumulates, melts and dries, and menus pause both clock and weather',async()=>{
    const m=await load('hub');E.setHour(13);
    S.ensure(a).cover={};
    S.select('summer','rain');
    for(let i=0;i<150;i++)E.update(.08,false);
    const wet=S.cover(m).wet;assert(wet>.25);
    const paused={h:clock.hour,t:E.weatherClock,wet};
    for(let i=0;i<40;i++)E.update(.08,true);
    assert.equal(clock.hour,paused.h);assert.equal(E.weatherClock,paused.t);assert.equal(S.cover(m).wet,wet);
    S.select('summer','clear');
    for(let i=0;i<100;i++)E.update(.08,false);
    assert(S.cover(m).wet<wet);
    S.select('winter','snow');
    for(let i=0;i<150;i++)E.update(.08,false);
    const persisted=S.ensure(a).cover.city.snow;
    assert(persisted>.18);
    const copy=JSON.parse(JSON.stringify(a));
    assert.equal(S.ensure(copy).cover.city.snow,persisted);
    clock.day=8;
    S.select('auto','clear');
    assert.equal(S.cover(m).snow,persisted,'returning to the calendar preserves accumulated snow');
    for(let i=0;i<300;i++)E.update(.08,false);
    assert(S.cover(m).snow<persisted);
    S.select('winter','snow');
    for(let i=0;i<150;i++)E.update(.08,false);
    S.select('autumn','clear');
    assert.equal(S.cover(m).snow,0,'a manual season change shows the new landscape immediately');
  });

  await check('sheltered cells remain dry, weather can be hidden and lightning respects reduced flash',async()=>{
    const m=await load('hub'),s=surface(480,260),cam={x:0,y:0};
    const a1=m.design.adventure,original=a1.regions;
    S.select('autumn','rain');
    a1.regions=[{x:0,y:0,w:240,h:400,priority:10,indoor:true,weather:false}];
    try{
      R.atmosphere(s.c,m,cam);
      const pixels=s.c.getImageData(0,0,480,260).data;
      let outside=0;
      for(let y=0;y<260;y++)for(let x=0;x<480;x++){
        const alpha=pixels[(y*480+x)*4+3];
        if(x<215)assert.equal(alpha,0,'precipitation under a shelter');
        if(x>260&&alpha)outside++;
      }
      assert(outside>100);
    }finally{a1.regions=original;}
    S.select('summer','storm');
    const prev=E.thunder;
    let thunder=0;
    E.thunder=()=>thunder++;
    try{
      for(let i=0;i<100;i++)E.update(.08,false);
      assert.equal(thunder,1);
      const strike=S.strikes.get(m.id);assert(strike&&strike.count===1);
      strike.age=.08;
      s.c.clearRect(0,0,480,260);
      R.lightning(s.c,R.weatherFrame(m,cam,s.c));
      assert(s.c.getImageData(0,0,480,260).data.some((v,i)=>i%4===3&&v>20));
      s.c.clearRect(0,0,480,260);
      V.settings.reducedFlash=true;
      R.lightning(s.c,R.weatherFrame(m,cam,s.c));
      assert(!s.c.getImageData(0,0,480,260).data.some(Boolean));
      V.settings.reducedFlash=false;
      const storm=R.weatherFrame(m,cam,s.c);
      R.gusts(s.c,storm,1,3.1);
      assert(s.c.getImageData(0,0,480,260).data.some((v,i)=>i%4===3&&v>0));
      s.c.clearRect(0,0,480,260);
      V.settings.reducedMotion=true;
      R.gusts(s.c,storm,1,3.1);
      assert(!s.c.getImageData(0,0,480,260).data.some(Boolean));
      V.settings.reducedMotion=false;
      V.settings.weatherIntensity=0;
      R.atmosphere(s.c,m,cam);
      assert(!s.c.getImageData(0,0,480,260).data.some(Boolean));
      V.settings.weatherIntensity=.85;
      V.World.camera={x:400,y:290};
      const preview=surface();V.Cozy.render(preview.c);preview.save('seasons-storm-plaza');
    }finally{E.thunder=prev;V.settings.reducedFlash=false;V.settings.reducedMotion=false;V.settings.weatherIntensity=.85;}
  });

  await check('the normal clock panel shows forecast and saves seasonal choices',()=>{
    const button=V.$('#adv-clock'),children=[...button.children];
    E.setHour(17.5);E.hud();
    assert.equal(V.$('#adv-clock'),button);
    assert.deepEqual([...button.children],children);
    assert.match(button.getAttribute('aria-label'),/17:30/);
    button.click();
    assert.equal(V.$$('.season-forecast li').length,3);
    V.$('#env-season').value='winter';
    V.$('#env-condition').value='snow';
    V.$('#env-apply').click();
    assert.equal(S.calendar(a).season,'winter');
    assert.equal(E.weather().type,'snow');
    assert(V.$('#adv-clock').textContent.includes('Inverno'));
    assert(V.Save.stateValid(V.state));
  });

  fs.writeFileSync(path.join(output,'seasons-results.json'),JSON.stringify(rows,null,2));
  V.MapAssets.cancel();dom.window.close();
  process.exit(rows.some(row=>!row.pass)?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
