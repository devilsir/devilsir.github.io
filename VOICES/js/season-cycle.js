/* Registered module: season-cycle */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('season-cycle', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V;
  const seasons=['spring','summer','autumn','winter'];
  const labels={spring:'Primavera',summer:'Verão',autumn:'Outono',winter:'Inverno'};
  const conditions={
    clear:{label:'Céu limpo',icon:'☀',cloud:.08},
    cloudy:{label:'Nublado',icon:'☁',cloud:.63},
    fog:{label:'Neblina',icon:'≋',cloud:.78},
    rain:{label:'Chuva',icon:'☂',cloud:.86},
    storm:{label:'Tempestade',icon:'ϟ',cloud:1},
    snow:{label:'Neve',icon:'❄',cloud:.76}
  };
  const climates={
    city:{name:'New Harmony',temp:[16,26,12,-3],snow:true,foliage:true,wet:[.33,.31,.27,.26]},
    cape:{name:'Costa do Cabo',temp:[17,23,18,12],snow:false,foliage:true,wet:[.26,.14,.29,.48]},
    tropical:{name:'Litoral brasileiro',temp:[24,28,25,21],snow:false,foliage:false,wet:[.38,.53,.34,.26]},
    cerrado:{name:'Interior brasileiro',temp:[24,27,23,19],snow:false,foliage:false,wet:[.40,.56,.21,.09]},
    savanna:{name:'Interior sul-africano',temp:[24,28,23,16],snow:false,foliage:false,wet:[.25,.51,.27,.08]},
    highland:{name:'Clima frio',temp:[10,17,7,-5],snow:true,foliage:true,wet:[.35,.29,.32,.39]}
  };
  const duration=7, interval=4;
  const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const phase=a=>Math.max(0,(Number(a.clock.day)||1)-1)*24+(Number(a.clock.hour)||0);
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const idHash=key=>[...key].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
  const random=(seed,salt=0)=>{
    let n=Math.imul(seed^(salt*2654435761),2246822519);
    n=Math.imul(n^(n>>>13),3266489917);
    return ((n^(n>>>16))>>>0)/4294967296;
  };

  const S=V.Seasons={
    labels,conditions,climates,duration,
    initialized:new WeakSet(),forecasts:new WeakMap(),strikes:new Map(),

    ensure(a=V.Progress.ensure()){
      if(!a)return null;
      if(this.initialized.has(a))return a.climate;
      const old=a.climate&&typeof a.climate==='object'?a.climate:{};
      const climate={season:seasons.includes(old.season)?old.season:'auto',cover:{}};
      for(const id of Object.keys(climates)){
        const cover=old.cover?.[id];
        if(cover)climate.cover[id]={snow:clamp(Number(cover.snow)||0),wet:clamp(Number(cover.wet)||0)};
      }
      a.climate=climate;
      this.initialized.add(a);
      return climate;
    },

    calendar(a=V.Progress.ensure(),at=a?phase(a):0){
      const day=Math.floor(Math.max(0,at)/24),slot=Math.floor(day/duration);
      const forced=this.ensure(a)?.season;
      const season=seasons.includes(forced)?forced:seasons[slot%seasons.length];
      return {season,label:labels[season],day:day%duration+1,year:Math.floor(slot/seasons.length)+1,automatic:!seasons.includes(forced)};
    },

    zone(m){
      const custom=m?.design?.adventure?.environment?.climate;
      if(climates[custom])return custom;
      if(/cold|alpine|temperate-cold/.test(custom||''))return 'highland';
      if(/tropical/.test(custom||''))return 'tropical';
      if(m?.id?.startsWith('nature-')){
        if(['nature-savanna','nature-wetlands'].includes(m.id))return 'savanna';
        return m.id==='nature-atlantic'?'tropical':'cerrado';
      }
      if(m?.capeRegion||['cape-town','cape-market','bo-kaap','kirstenbosch','muizenberg'].includes(m?.id))return 'cape';
      if(['beach','harbor'].includes(m?.id))return 'tropical';
      return 'city';
    },

    forecastAt(a,zone,at){
      const climate=climates[zone],calendar=this.calendar(a,at),season=seasons.indexOf(calendar.season);
      const bucket=Math.max(0,Math.floor(at/interval)),hour=bucket*interval%24;
      const profileSeed=Number(a.weather.seed)||971,key=zone+'|'+season+'|'+bucket+'|'+profileSeed;
      let cache=this.forecasts.get(a);
      if(!cache){cache=new Map();this.forecasts.set(a,cache);}
      if(cache.has(key))return cache.get(key);
      const seed=profileSeed^idHash(zone)^Math.imul(bucket+1,195699);
      const variation=(random(seed,1)-.5)*7;
      const warmth=Math.cos((hour-15)*Math.PI/12)*4.2;
      const temp=climate.temp[season]+variation+warmth;
      const rain=climate.wet[season],chance=random(seed,2);
      let type='clear';
      if(chance<rain){
        if(climate.snow&&season===3&&temp<2.7)type='snow';
        else type=chance<rain*(season===1?.30:.17)?'storm':'rain';
      }else if(climate.snow&&season===3&&temp<1.8&&chance<rain+.32)type='snow';
      else if(chance<rain+.24)type='cloudy';
      else if((hour<9||hour>=20)&&chance<rain+.34)type='fog';
      const intensity=(type==='storm'?.72:type==='snow'?.46:type==='rain'?.39:.22)+random(seed,4)*.27;
      const result={type,intensity,temp,wind:random(seed,5)*Math.PI*2,speed:.30+random(seed,6)*.55,seed};
      if(cache.size>=100)cache.delete(cache.keys().next().value);
      cache.set(key,result);
      return result;
    },

    weather(environment,m=V.World.current){
      const a=environment.state(),zone=this.zone(m),climate=climates[zone];
      if(!a)return {type:'clear',intensity:0,temp:18,wind:0,cloud:.08,transition:1,zone,climate};
      const at=phase(a),hour=environment.preview?.hour??a.clock.hour;
      const currentAt=Math.floor(at/24)*24+hour;
      const present=this.forecastAt(a,zone,currentAt);
      if(environment.isInterior(m))
        return {...present,type:'clear',intensity:0,cloud:0,speed:0,transition:1,zone,climate,snowAllowed:false,interior:true};
      const previous=this.forecastAt(a,zone,Math.max(0,currentAt-interval));
      const actor=m===V.World.current?V.Player.data:V.DuoWorld?.actors?.find(actor=>actor.map===m?.id)?.data;
      const profile=environment.profile(m,actor?.x??0,actor?.y??0);
      const fixed=profile.sky==='storm'?'storm':profile.sky==='overcast'?'cloudy':null;
      const manual=environment.preview?.weather||(a.weather.manual?a.weather:null);
      const type=manual?.type||fixed||present.type;
      const transition=manual?clamp(manual.transition??1):fixed?1:smooth((currentAt%interval)/.32);
      const cloud=manual||fixed?conditions[type]?.cloud??.08:lerp(conditions[previous.type].cloud,conditions[type].cloud,transition);
      return {
        ...present,...manual,type,zone,climate,cloud,transition,
        temp:type==='snow'?Math.min(1,present.temp):present.temp,
        intensity:clamp(manual?.intensity??present.intensity),
        wind:manual?.wind??profile.wind??present.wind,
        speed:present.speed*(type==='storm'?1.65:1),
        previous:!manual&&!fixed&&previous.type!==type?previous:null,
        snowAllowed:climate.snow||!!manual?.demonstration||profile.snowAllowed===true
      };
    },

    cover(m,environment=V.Environment){
      const a=environment.state();
      if(!a)return {snow:0,wet:0};
      const w=this.weather(environment,m),calendar=this.calendar(a),saved=this.ensure(a).cover[w.zone];
      if(w.interior)return {snow:0,wet:0};
      if(environment.preview?.weather){
        return {snow:w.type==='snow'&&w.snowAllowed?.82:0,wet:['rain','storm'].includes(w.type)?.72:0};
      }
      const frost=calendar.season==='winter'&&w.climate.snow ? .34 : 0;
      const demonstration=w.type==='snow'&&w.snowAllowed&&a.weather.manual ? .72 : 0;
      return {snow:Math.max(saved?.snow??0,frost,demonstration),wet:saved?.wet??0};
    },

    select(season,type){
      const a=V.Progress.ensure();
      if(!a)return;
      const climate=this.ensure(a),next=seasons.includes(season)?season:'auto';
      if(next!=='auto'&&next!==this.calendar(a).season)climate.cover={};
      climate.season=next;
      if(conditions[type]){
        Object.assign(a.weather,{manual:true,type,target:type,intensity:.76,transition:1,demonstration:type==='snow'});
      }else{
        a.weather.manual=false;
        a.weather.demonstration=false;
      }
      this.strikes.clear();
      V.Environment.hud();
      V.Save.save();
    },

    forecast(m=V.World.current){
      const a=V.Progress.ensure();
      if(!a)return [];
      const at=phase(a),next=(Math.floor(at/interval)+1)*interval;
      return [0,1,2].map(index=>{
        const time=next+index*interval;
        return {...this.forecastAt(a,this.zone(m),time),day:Math.floor(time/24)+1,hour:time%24};
      });
    },

    activeMaps(){
      const ids=V.DuoWorld?.enabled()?V.DuoWorld.actors.map(actor=>actor.map):[V.World.current?.id];
      return [...new Set(ids)].map(id=>V.World.maps[id]).filter(Boolean);
    },

    storm(m,w,dt,environment){
      if(w.type!=='storm'||w.intensity===0||w.transition<.25){
        this.strikes.delete(m.id);
        return;
      }
      let strike=this.strikes.get(m.id);
      if(!strike){
        strike={next:2+random(w.seed,9)*3,age:Infinity,seed:w.seed,count:0,played:true};
        this.strikes.set(m.id,strike);
      }
      strike.next-=dt;
      strike.age+=dt;
      if(strike.next<=0){
        strike.count++;
        strike.seed=(w.seed^Math.imul(strike.count,797))>>>0;
        strike.next=8+random(strike.seed,7)*13;
        strike.delay=.4+random(strike.seed,8)*1.3;
        strike.age=0;
        strike.played=false;
      }
      if(!strike.played&&strike.age>=strike.delay){
        strike.played=true;
        if(m===V.World.current)environment.thunder();
      }
    },

    update(a,dt,environment,paused){
      const state=this.ensure(a);
      if(this.bound!==a){this.bound=a;this.strikes.clear();}
      if(paused)return;
      const active=this.activeMaps();
      const zones=new Set(),maps=new Set(active.map(m=>m.id));
      for(const id of this.strikes.keys())if(!maps.has(id))this.strikes.delete(id);
      for(const m of active){
        const w=this.weather(environment,m);
        this.storm(m,w,dt,environment);
        if(w.interior||zones.has(w.zone))continue;
        zones.add(w.zone);
        const cover=state.cover[w.zone]||={snow:0,wet:0};
        const falling=w.type==='snow'&&w.snowAllowed?w.intensity*w.transition:0;
        const rain=['rain','storm'].includes(w.type)?w.intensity*w.transition:0;
        cover.snow=clamp(cover.snow+dt*(falling*.031-(w.temp>3?.012:.0013)));
        cover.wet=clamp(cover.wet+dt*(rain*.066-(w.type==='clear'?.022:.010)));
      }
      if(a.weather.manual)a.weather.transition=Math.min(1,(a.weather.transition??1)+dt/3);
      else if(V.World.current){
        const w=this.weather(environment,V.World.current);
        Object.assign(a.weather,{type:w.type,target:w.type,intensity:w.intensity,transition:w.transition});
      }
    }
  };
});
