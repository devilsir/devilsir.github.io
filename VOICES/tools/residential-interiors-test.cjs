'use strict';
const assert=require('node:assert/strict');
const {environment}=require('./runtime-upgrade-test.cjs');

(async()=>{
  const {V,w,dom}=await environment({bundle:process.argv.includes('--bundle'),moduleOrder:'reverse'});
  const H=V.Homestead,R=V.Rooms,W=V.World;
  const {authored,legacy}=V.ResidentialInteriors;
  const copy=value=>JSON.parse(JSON.stringify(value));
  let failures=0;
  async function check(title,run){
    try{await run();console.log('PASS',title);}
    catch(error){failures++;console.error('FAIL',title,error.stack);}
    finally{V.UI.close();}
  }
  function newState(){
    V.Game.toTitle();V.settings.playerCharacters=['nia'];V.settings.challengePlayers=1;
    V.settings.worldHours=false;V.settings.npcHomeRoutines=false;
    V.Game.newState({name:'Visita às moradias',character:'nia',grade:7});
    V.Onboarding.record().status='complete';
    Object.assign(V.state.flags,{prologueStarted:true,prologueDone:true});
  }
  async function start(){V.Game.startGame();await V.MapAssets.whenReady();V.UI.close();}
  const startPoint=d=>({x:(d.spawn[0]+.5)*48,y:(d.spawn[1]+.5)*48});

  try{
    await V.Game.init();newState();await start();
    await check('all private houses and apartments have different real floorplans and furnished layouts',()=>{
      const ids=[...new Set([...H.data.homes,...H.data.offers].filter(h=>h.kind!=='shared').map(h=>h.id))].sort();
      assert.equal(ids.length,54);
      assert.deepEqual(Object.keys(authored).sort(),ids);
      const geometry=new Set(),layouts=new Set(),doorStyles=new Set(),windowStyles=new Set(),features=new Set();
      for(const id of ids){
        const d=W.maps[id].design,room=d.construction.rooms[0],p=d.homeInterior;
        assert(R.validPolygon(room.polygon),id);
        geometry.add(JSON.stringify(room.polygon));
        layouts.add(JSON.stringify(d.scenes.map(s=>[s.family,s.prop,s.x,s.y])));
        assert(d.homeRooms.some(r=>r.name==='Banheiro'),id);
        assert.equal(d.homeRooms.some(r=>r.name==='Cozinha integrada'),p.kind==='apartment',id);
        assert(d.homeWindows.length>=3,id);
        for(const s of legacy[id].scenes)assert(d.scenes.some(scene=>scene.id===s.id),id+' · '+s.id);
        assert(d.scenes.some(s=>s.id.endsWith(p.feature)),id+' · featured piece');
        for(const door of d.construction.doors){
          doorStyles.add(door.appearance);
          assert(door.height>door.width*1.45,door.id);
          const wall=V.Architecture.geometry(d).walls.find(w=>w.segment===door.wall&&w.roomId===door.room);
          const opening=wall?.openings.find(o=>o.door===door.id);
          assert.equal(opening?.width,door.width,door.id);
          assert.equal(opening?.height,door.height,door.id);
          assert(wall.height>door.height,door.id);
          const mount=V.Architecture.residentialOpening(W.maps[id],door,{x:0,y:0});
          assert.equal(mount.x,door.x,door.id);
          assert.equal(mount.y,door.y,door.id);
        }
        for(const window of d.homeWindows)windowStyles.add(window.look);
        features.add(p.feature);
      }
      assert.equal(geometry.size,54);
      assert.equal(layouts.size,54);
      assert.equal(doorStyles.size,8);
      assert.equal(windowStyles.size,6);
      assert(features.size>=12);
    });

    await check('each address has a reciprocal entrance and paths to all doors and furniture',()=>{
      for(const id of Object.keys(authored)){
        const m=W.maps[id],d=m.design,entry=d.construction.doors.find(o=>o.pair),start=startPoint(d);
        assert(entry?.wall,id);
        const other=W.maps[entry.to.map].design.construction.doors.find(o=>o.id===entry.pair);
        assert.equal(other.to.map,id,id);
        assert.equal(other.to.door,entry.id,id);
        assert(V.dist(start,other.to.arrival)<1,id);
        assert(!V.Living.blocked(m,start.x,start.y,11),id+' entry');
        for(const o of m.objects.filter(o=>o.household||o.type==='room-door')){
          const target=o.door?R.approach(m,o.door,44):R.safe(m,{x:o.x,y:o.y+30},10);
          assert(target&&(V.dist(start,target)<26||R.navigation(m,start,target,10).length),id+' · '+o.id);
        }
        for(const window of d.homeWindows)assert(R.blocked(m,window.x,window.y,10),window.id);
        const beds=m.objects.filter(o=>o.household&&H.isBed(o));
        assert(beds.length>=1,id);
        for(const a of H.actors.values())if(a.home===id)assert(H.slot(a),a.key);
      }
    });

    await check('side windows belong to visible walls and newly placed furniture casts a floor shadow',async()=>{
      const houses=Object.keys(authored).map(id=>W.maps[id]);
      const sides=m=>V.Architecture.geometry(m.design).walls.filter(w=>w.sideSlope);
      const m=houses.find(map=>sides(map).length);
      assert(m);
      assert(houses.some(map=>!sides(map).length));
      for(const house of houses)for(const win of house.design.homeWindows){
        const wall=V.Architecture.geometry(house.design).walls.find(w=>w.windows?.some(o=>o.id===win.id));
        assert(wall,win.id);
        if(wall.a[0]===wall.b[0])assert(wall.sideSlope&&wall.height>=140,win.id);
      }
      H.ensure().owned.push(m.id);
      W.load(m.id);await V.MapAssets.whenReady();
      const item=H.catalog.find(i=>i.id==='utility-olive-fridge');
      assert.equal(H.catalog.filter(i=>i.family==='home-utility').length,12);
      V.Life.ensure().coins=1000;assert(H.buyFurniture(item.id));
      const box=R.box(m.design.construction.rooms[0].polygon);
      let spot;
      for(let y=box.y+64;y<box.y+box.h-48&&!spot;y+=48)for(let x=box.x+64;x<box.x+box.w-48;x+=48)if(H.canArrange(m.id,item,x,y)){spot={x,y};break;}
      assert(spot);
      assert(H.placeFurniture(m.id,item.id,spot.x,spot.y));
      const furniture=m.objects.find(o=>o.furnitureItem===item.id);
      assert(furniture);
      const canvas=w.document.createElement('canvas');canvas.width=canvas.height=220;
      const ctx=canvas.getContext('2d'),cam={x:furniture.x-110,y:furniture.y-110};
      V.ResidentialArt.shadow(ctx,m,furniture,cam);
      assert(ctx.getImageData(110,111,1,1).data[3]>50);
      ctx.clearRect(0,0,220,220);
      assert(V.HomeDesign.art(ctx,item.family,item.prop,0,0,220));
      assert(ctx.getImageData(0,0,220,220).data.some((byte,index)=>index%4===3&&byte>220));
    });

    await check('all sixteen sprites are available in the furniture catalog and render with transparent borders',async()=>{
      await V.MapAssets.ensure(['home-collection']);
      const art=V.ResidentialArt.items;
      assert.equal(art.length,16);
      assert.equal(V.HomeDesign.images['home-interiors'].naturalWidth,1024);
      const canvas=w.document.createElement('canvas');canvas.width=canvas.height=256;
      const c=canvas.getContext('2d');
      for(const item of art){
        assert(H.catalog.includes(item));
        assert(V.SceneDesign.asset(item.family,item.prop));
        c.clearRect(0,0,256,256);
        assert(V.HomeDesign.art(c,item.family,item.prop,0,0,256));
        const data=c.getImageData(0,0,256,256).data;
        assert.equal(data[3],0,item.name);
        assert(data.some((byte,i)=>i%4===3&&byte===255),item.name);
      }
    });

    await check('a new door design can be saved and the new layout survives another start',async()=>{
      const id='interior-player-villa';
      H.ensure().owned.push(id);
      W.load(id);await V.MapAssets.whenReady();
      const draft=copy(W.current.design),entry=draft.construction.doors.find(o=>o.pair);
      entry.appearance=23;
      assert(V.HomeConstruction.commit(id,draft));
      await start();
      assert.equal(H.ensure().residentialPlans[id],'authored');
      assert.equal(W.maps[id].design.construction.doors.find(o=>o.pair).appearance,23);
      assert(W.maps[id].design.homeInterior);
      assert(!W.interactables().some(o=>o.type==='home-window'));
    });

    await check('older furnished saves keep their custom furniture and old footprint when loaded',async()=>{
      newState();
      const id='interior-player-cottage',h=H.ensure(),door=legacy[id].construction.doors.find(o=>o.pair);
      h.owned.push(id);
      h.placed[id]=[{id:'legacy-chair',item:'plant-monstera',x:370,y:720,rotation:0}];
      await start();
      assert.equal(H.ensure().residentialPlans[id],'legacy');
      assert.equal(JSON.stringify(W.maps[id].design.outline),JSON.stringify(legacy[id].outline));
      assert(W.maps[id].objects.some(o=>o.playerFurniture==='legacy-chair'));
      const back=W.maps[door.to.map].design.construction.doors.find(o=>o.id===door.pair);
      assert.equal(back.to.arrival.x,door.x+door.normal.x*58);
      newState();await start();
      assert(W.maps[id].design.homeInterior);
    });
  }finally{V.MapAssets.cancel();dom.window.close();}
  process.exit(failures?1:0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
