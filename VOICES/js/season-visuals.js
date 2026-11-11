/* Registered module: season-visuals */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('season-visuals', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V,W=V.World,E=V.Environment,S=V.Seasons;
  const atlas=V.SeasonArtData;
  const seasonIndex={spring:0,summer:1,autumn:2,winter:3};
  const buildings={'cape-houses':0,'bo-kaap-terrace':1,'cape-warehouse':2,'harbor-lighthouse':3};
  const drifts=[4,5,7];
  const inside=(x,y,b)=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
  const wrap=(n,size)=>((n%size)+size)%size;
  const clamp=V.clamp;
  const groupName='seasonal-world';
  const seedOf=text=>[...text].reduce((n,ch)=>Math.imul(n^ch.charCodeAt(0),16777619)>>>0,2166136261);
  const hash=(n,salt)=>{
    let h=Math.imul(n^Math.imul(salt,104729),2654435761);
    h=Math.imul(h^(h>>>15),1597334677);
    return ((h^(h>>>13))>>>0)/4294967296;
  };
  const weatherDrops=Array.from({length:258},(_,i)=>({
    x:hash(i,1),y:hash(i,2),scale:.36+hash(i,3)*.64,speed:.65+hash(i,4)*.7,angle:hash(i,5)*Math.PI*2,art:i%4
  }));

  function polygon(c,points){
    c.beginPath();
    points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.closePath();
  }

  function inOutline(outline,x,y){
    if(!outline?.length)return true;
    let inside=false;
    for(let i=0,j=outline.length-1;i<outline.length;j=i++){
      const [ax,ay]=outline[i],[bx,by]=outline[j];
      if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
    }
    return inside;
  }

  const R=V.SeasonVisuals={
    images:{},crops:new Map(),groundCache:new WeakMap(),frame:null,

    load(){
      if(this.ready)return this.ready;
      this.ready=Promise.all(Object.entries(atlas).map(([key,sheet])=>new Promise(resolve=>{
        const image=V.Assets.image();
        this.images[key]=image;
        image.onload=image.onerror=resolve;
        image.src=sheet.file+'?v=seasons1';
        V.AssetLoader.register(image,resolve);
      })));
      return this.ready;
    },

    sprite(c,key,index,x,y,w,h){
      const image=this.images[key],source=atlas[key]?.frames[index];
      if(!image?.naturalWidth||!source)return false;
      c.drawImage(image,source.x,source.y,source.w,source.h,x,y,w,h??w*source.h/source.w);
      return true;
    },

    crop(key,index){
      const id=key+':'+index;
      if(this.crops.has(id))return this.crops.get(id);
      const frame=atlas[key]?.frames[index];
      if(!frame||!this.images[key]?.naturalWidth)return null;
      const c=document.createElement('canvas');
      c.width=frame.w;c.height=frame.h;
      this.sprite(c.getContext('2d'),key,index,0,0,c.width,c.height);
      this.crops.set(id,c);
      return c;
    },

    raster(c,o){
      const f=this.frame;
      if(f?.ctx!==c||!f.exposure.bounds(o.x,o.y,false,f.weather))return null;
      if(f.cover.snow>.43&&Object.hasOwn(buildings,o.art)){
        return this.crop('buildings',buildings[o.art]);
      }
      if(o.art==='cape-silver-tree'){
        const season=f.cover.snow>.32?'winter':f.calendar.season;
        if(season!=='winter'||f.cover.snow>.32)return this.crop('foliage',seasonIndex[season]);
      }
      return null;
    },

    exposure(m){
      const adventure=m?.design?.adventure||{},env=adventure.environment||{};
      const indoor=env.indoor??(m?.theme==='room'||m?.cityInterior||m?.id?.startsWith('interior-'));
      const allowed=!indoor&&env.weather!==false;
      const areas=(adventure.regions||[]).filter(r=>r.indoor!==undefined||r.weather!==undefined||r.snowAllowed!==undefined)
        .slice().sort((a,b)=>(a.priority||0)-(b.priority||0));
      const bounds=(x,y,needsSnow,w)=>{
        let covered=indoor,dry=env.weather===false,snow=w.snowAllowed;
        for(const r of areas){
          if(!inside(x,y,r))continue;
          covered=r.indoor??covered;
          if(r.weather!==undefined)dry=r.weather===false;
          snow=r.snowAllowed===true||snow;
        }
        return !covered&&!dry&&(!needsSnow||snow);
      };
      return {allowed,areas,open:allowed||areas.some(r=>r.indoor===false&&r.weather!==false),bounds};
    },

    clipExposure(c,f){
      const {cam,exposure,weather}=f,w=c.canvas.width,h=c.canvas.height;
      const regions=exposure.areas.filter(r=>r.x<cam.x+w&&r.x+r.w>cam.x&&r.y<cam.y+h&&r.y+r.h>cam.y);
      if(!regions.length&&exposure.allowed)return;
      const edges=(size,offset,axis,length)=>[...new Set([0,size,...regions.flatMap(r=>[
        clamp(r[axis]-offset,0,size),clamp(r[axis]+r[length]-offset,0,size)
      ])])].sort((a,b)=>a-b);
      const xs=edges(w,cam.x,'x','w'),ys=edges(h,cam.y,'y','h');
      c.beginPath();
      for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
        const x=xs[i],y=ys[j],width=xs[i+1]-x,height=ys[j+1]-y;
        if(exposure.bounds(x+width/2+cam.x,y+height/2+cam.y,false,weather))c.rect(x,y,width,height);
      }
      c.clip();
    },

    weatherFrame(m,cam,ctx){
      const weather=E.weather(m),calendar=S.calendar(E.state()),cover=S.cover(m,E);
      const exposure=this.exposure(m);
      return {ctx,m,cam,weather,calendar,cover,exposure,seed:seedOf(m.id),groundDrawn:false,weatherDrawn:false,styled:new Set()};
    },

    water(m,x,y){
      if(m.maritime)return V.Maritime.water(m,x,y,2);
      if(m.id==='beach')return x>V.Coast.shore(y/48)*48;
      if(m.id==='muizenberg'&&y>31.6*48)return true;
      if(m.id==='kirstenbosch'&&((x-24*48)/(3.15*48))**2+((y-24.8*48)/(1.9*48))**2<1)return true;
      if(m.natureWater?.some(b=>inside(x,y,b))&&!m.natureBridges?.some(b=>inside(x,y,b)))return true;
      if(m.pond){
        const p=m.pond;
        if(inside(x,y,{x:p.x*48,y:p.y*48,w:p.w*48,h:p.h*48}))return true;
      }
      if(m.id==='hub'){
        const f=m.decor.find(o=>o.id==='square-fountain-furniture');
        if(f&&((x-f.x-f.size/2)/(f.size*.40))**2+((y-f.y-f.size*.67)/(f.size*.24))**2<1)return true;
      }
      return false;
    },

    land(frame,x,y){
      const {m,exposure,weather}=frame;
      return x>=0&&y>=0&&x<m.width*48&&y<m.height*48
        &&exposure.bounds(x,y,false,weather)&&inOutline(m.design?.outline,x/48,y/48)&&!this.water(m,x,y);
    },

    landTile(frame,col,row){
      const {m}=frame;
      let cache=this.groundCache.get(m);
      if(!cache||cache.design!==m.design||cache.revision!==m.geometryRevision){
        cache={design:m.design,revision:m.geometryRevision,tiles:new Map()};
        this.groundCache.set(m,cache);
      }
      const id=col+row*m.width*3;
      if(!cache.tiles.has(id))cache.tiles.set(id,this.land(frame,col*48+24,row*48+24));
      return cache.tiles.get(id);
    },

    ground(c,frame){
      if(frame.groundDrawn||!frame.exposure.open)return;
      frame.groundDrawn=true;
      const {m,cam,cover,calendar,weather,seed}=frame,visual=V.settings.weatherIntensity??.7;
      const snow=cover.snow,wet=cover.wet;
      const foliage=weather.climate?.foliage;
      if(snow<.02&&wet<.02&&(!foliage||calendar.season==='summer'))return;
      const left=Math.max(0,Math.floor(cam.x/48)),top=Math.max(0,Math.floor(cam.y/48));
      const right=Math.min(m.width,Math.ceil((cam.x+c.canvas.width)/48)),bottom=Math.min(m.height,Math.ceil((cam.y+c.canvas.height)/48));
      c.save();
      this.clipExposure(c,frame);
      c.beginPath();
      for(let row=top;row<bottom;row++){
        let start=-1;
        for(let col=left;col<=right;col++){
          if(col<right&&this.landTile(frame,col,row)){
            if(start<0)start=col;
          }else if(start>=0){
            c.rect(start*48-cam.x,row*48-cam.y,(col-start)*48,48);
            start=-1;
          }
        }
      }
      c.clip();
      c.imageSmoothingEnabled=false;
      if(wet>.02){
        c.globalAlpha=wet*.28;
        c.fillStyle='#344e61';
        c.fillRect(0,0,c.canvas.width,c.canvas.height);
      }
      if(snow>.02){
        c.globalAlpha=snow*.70;
        c.fillStyle='#d3e4e7';
        c.fillRect(0,0,c.canvas.width,c.canvas.height);
      }else if(foliage&&calendar.season==='autumn'){
        c.globalAlpha=.12;
        c.fillStyle='#ae8358';
        c.fillRect(0,0,c.canvas.width,c.canvas.height);
      }
      const step=96,t=V.settings.reducedMotion?0:E.weatherClock;
      for(let y=Math.floor(cam.y/step)*step;y<cam.y+c.canvas.height+step;y+=step){
        for(let x=Math.floor(cam.x/step)*step;x<cam.x+c.canvas.width+step;x+=step){
          const id=seed^Math.imul(x+1,67)^Math.imul(y+1,733),chance=hash(id,7);
          const px=x+hash(id,8)*76+10,py=y+hash(id,9)*72+12;
          if(!this.land(frame,px,py))continue;
          const sx=px-cam.x,sy=py-cam.y;
          if(snow>.02&&chance<.40+snow*.47){
            const width=42+hash(id,10)*82;
            c.globalAlpha=clamp(snow*1.18,0,.96);
            this.sprite(c,'surfaces',drifts[(id>>>0)%drifts.length],sx-width/2,sy-13,width);
          }else if(wet>.16&&chance<wet*.52){
            const width=37+hash(id,10)*47;
            c.globalAlpha=wet*.56;
            this.sprite(c,'surfaces',8+(id>>>0)%2,sx-width/2,sy-8,width);
            if(visual>0&&['rain','storm'].includes(weather.type)){
              const wave=wrap(t*1.45+hash(id,11),1);
              c.globalAlpha=(1-wave)*wet*.63*visual;
              this.sprite(c,'surfaces',wave<.28?10:11,sx-4-wave*8,sy-4,8+wave*15);
            }
          }else if(foliage&&snow<.15&&chance<.24){
            c.globalAlpha=.74;
            if(calendar.season==='spring')this.sprite(c,'surfaces',14+(id>>>0)%2,sx-15,sy-8,30);
            if(calendar.season==='autumn')this.sprite(c,'surfaces',12+(id>>>0)%2,sx-21,sy-9,42);
          }
        }
      }
      c.restore();
    },

    roof(c,b,cam,profile){
      const f=this.frame;
      if(!f||f.ctx!==c||f.cover.snow<.08||!f.exposure.bounds(b.x+b.w/2,b.y+b.h/2,false,f.weather))return;
      const x=b.x-cam.x,y=b.y-cam.y,w=b.w;
      if(x+w<-24||x>c.canvas.width+24||y+b.h<0||y-36>c.canvas.height)return;
      const type=profile?.roof||b.style||'terrace';
      const height=type==='skillion'||type==='shed'?44:49,depth=f.cover.snow;
      c.save();
      c.imageSmoothingEnabled=false;
      c.globalAlpha=clamp(depth*1.45,.15,.97);
      if(['gable','hip','mansard','skillion','shed'].includes(type)){
        const peak=x+w*(profile?.seed%2?.4:.6);
        const points={
          gable:[[x-9,y+height-4],[peak,y-12],[x+w+9,y+height-4]],
          hip:[[x-9,y+height-4],[x+w*.19,y],[x+w*.81,y],[x+w+9,y+height-4]],
          mansard:[[x-9,y+height-4],[x+w*.08,y+5],[x+w*.28,y-9],[x+w*.72,y-9],[x+w*.92,y+5],[x+w+9,y+height-4]],
          skillion:[[x-8,y-8],[x+w+9,y+20],[x+w+9,y+height-4],[x-8,y+height-4]]
        };
        polygon(c,points[type]||points.skillion);
        c.save();c.clip();
        c.fillStyle='#c6dbe1';
        c.fillRect(x-12,y-14,w+24,(height+12)*Math.min(1,.66+depth*.45));
        this.sprite(c,'surfaces',3,x-11,y-14,w+22,height+20);
        c.restore();
        this.sprite(c,'surfaces',1,x-9,y+height-8,w+18,8+depth*9);
      }else{
        const roofY=type==='deco'?y-24:y-8;
        this.sprite(c,'surfaces',0,x-8,y-11,w+16,15+depth*13);
        if(type==='deco')this.sprite(c,'surfaces',2,x+w*.33,roofY-5,w*.34,12);
      }
      if(depth>.31)this.sprite(c,'surfaces',6,x+6,y+b.h-6,Math.min(77,w*.23),15);
      c.restore();
    },

    plant(c,kind,x,y,w,h){
      const f=this.frame;
      if(!f||f.ctx!==c||!f.weather.climate?.foliage&&!f.weather.demonstration)return false;
      if(!f.exposure.bounds(x+f.cam.x,y+f.cam.y,false,f.weather))return false;
      const season=f.cover.snow>.32?'winter':f.calendar.season;
      if(season==='winter'&&f.cover.snow<=.32)return false;
      const index=seasonIndex[season]+(kind==='shrub'?4:0),width=w*(kind==='shrub'?.96:1.06);
      return this.sprite(c,'foliage',index,x-width/2,y-h,width,h);
    },

    shower(c,f,kind,power,time){
      if(power<.015)return;
      const {ctx,cam,exposure,weather}=f,w=ctx.canvas.width,h=ctx.canvas.height;
      const reduced=V.settings.reducedMotion;
      const snow=kind==='snow',leaves=kind==='leaves',storm=kind==='storm';
      const density=V.Performance?.weatherDensity??1;
      const count=Math.min(weatherDrops.length,Math.round((leaves?38:snow?154:storm?258:158)*power*density*(reduced?.34:1)));
      const t=reduced?0:time;
      const pulse=storm?.36+.64*Math.pow(.5+.5*Math.sin(t*1.05),3):.82+Math.sin(t*.65)*.18;
      const wind=Math.cos(weather.wind)*weather.speed;
      c.save();
      c.imageSmoothingEnabled=false;
      c.lineCap='round';
      for(let i=0;i<count;i++){
        const p=weatherDrops[i],speed=(snow?28:leaves?33:storm?465:324)*p.speed;
        const gust=wind*(storm?188:snow?43:leaves?77:54);
        const drift=leaves||snow?Math.sin(t*1.55+p.angle)*p.scale*(leaves?26:11):0;
        const travel=gust*p.speed*(t*(storm?.62:.82)+Math.sin(t*(storm?1.05:.65))*(storm?.31:.28));
        const x=wrap(p.x*(w+60)+travel+drift,w+60)-30;
        const y=wrap(p.y*(h+44)+t*speed,h+44)-22;
        if(!exposure.bounds(x+cam.x,y+cam.y,snow,weather))continue;
        if(leaves){
          c.save();
          c.translate(x,y);c.rotate(p.angle+t*(.9+p.scale));
          c.globalAlpha=.72+p.scale*.22;
          const size=8+p.scale*10;
          if(!this.sprite(c,'foliage',8+p.art,-size/2,-size/2,size,size)){
            c.fillStyle='#bd763e';c.fillRect(-4,-2,8,4);
          }
          c.restore();
        }else if(snow){
          c.globalAlpha=.42+p.scale*.54;
          const size=2.7+p.scale*7.8;
          if(!this.sprite(c,'foliage',12+p.art,x-size/2,y-size/2,size,size)){
            c.fillStyle='#edf5f8';c.fillRect(x,y,size*.5,size*.5);
          }
        }else{
          const length=(storm?13+28*p.scale:17)*p.scale,lean=clamp(gust*pulse/speed,-1.2,1.2)*length;
          c.globalAlpha=(.18+p.scale*.42)*(storm?1:.80);
          c.strokeStyle=p.scale>.76?'#e3edf0':'#aebec8';
          c.lineWidth=p.scale>.78?1.6:.8;
          c.beginPath();c.moveTo(x-lean,y-length);c.lineTo(x,y);c.stroke();
          if(storm&&p.scale>.81){
            c.globalAlpha*=.72;c.strokeStyle='#f0f6f7';c.lineWidth=1.2;
            c.beginPath();c.moveTo(x-lean*.23,y-length*.23);c.lineTo(x,y);c.stroke();
          }
        }
      }
      if(!reduced&&!snow&&!leaves){
        for(let i=0;i<Math.floor(count/7);i++){
          const cycle=t*(storm?1.68:1.22)+hash(i,25),life=wrap(cycle,1);
          if(life>.37)continue;
          const seed=i+Math.floor(cycle)*101;
          const x=wrap(hash(seed,26)*(w+96)-cam.x,w+96)-48;
          const y=wrap(hash(seed,27)*(h+96)-cam.y,h+96)-48;
          if(!exposure.bounds(x+cam.x,y+cam.y,false,weather)||!this.land(f,x+cam.x,y+cam.y))continue;
          const spread=life/.37,rx=2+spread*(storm?10:7);
          c.globalAlpha=(1-spread)*power*.72;c.strokeStyle='#cfdee3';c.lineWidth=1;
          c.beginPath();c.ellipse(x,y,rx,rx*.29,0,0,Math.PI*2);c.stroke();
          if(storm&&spread<.45){
            c.beginPath();c.moveTo(x-1,y-1);c.lineTo(x-4,y-4-spread*8);
            c.moveTo(x+1,y-1);c.lineTo(x+5,y-4-spread*8);c.stroke();
          }
        }
      }
      c.restore();
    },

    gusts(c,f,power,time){
      if(V.settings.reducedMotion||power<.025)return;
      const {width:w,height:h}=c.canvas;
      const horizontal=Math.cos(f.weather.wind),vertical=Math.sin(f.weather.wind);
      const dir=horizontal<0?-1:1;
      c.save();
      c.strokeStyle='#d3dce0';c.lineCap='round';
      for(let i=0;i<20*(V.Performance?.weatherDensity??1);i++){
        const p=weatherDrops[i],age=wrap(time*(.32+p.scale*.18)+p.angle,1);
        if(age>.52)continue;
        const wave=Math.sin(age*Math.PI/.52);
        const x=wrap(p.x*(w+250)+dir*time*(195+p.speed*125)-f.cam.x*.22,w+250)-125;
        const y=wrap(p.y*(h+100)+time*vertical*35-f.cam.y*.16,h+100)-50;
        if(!f.exposure.bounds(x+f.cam.x,y+f.cam.y,false,f.weather))continue;
        const length=dir*(36+125*p.scale)*(.7+wave*.3);
        c.globalAlpha=power*wave*(.09+p.scale*.19);
        c.lineWidth=.55+p.scale*1.1;
        c.beginPath();c.moveTo(x,y);
        c.bezierCurveTo(x+length*.26,y+7,x+length*.68,y-9+vertical*12,x+length,y+vertical*12);c.stroke();
      }
      c.restore();
    },

    lightning(c,f){
      if(V.settings.reducedFlash||V.settings.reducedMotion)return;
      const strike=S.strikes.get(f.m.id);
      if(!strike||strike.age>=.29||f.weather.type!=='storm')return;
      const w=c.canvas.width,h=c.canvas.height;
      const x=w*(.17+hash(strike.seed,11)*.66),y=h*(.34+hash(strike.seed,12)*.22);
      if(!f.exposure.bounds(x+f.cam.x,y+f.cam.y,false,f.weather))return;
      const light=Math.exp(-strike.age*12),power=(V.settings.weatherIntensity??.7)*light;
      c.save();
      const halo=c.createRadialGradient(x,0,5,x,0,Math.max(180,w*.65));
      halo.addColorStop(0,'rgba(193,217,255,'+(.23*power)+')');
      halo.addColorStop(1,'rgba(193,217,255,0)');
      c.fillStyle=halo;c.fillRect(0,0,w,h);
      const points=[[x,-10]];
      for(let i=1;i<=9;i++)points.push([x+(hash(strike.seed,i+13)-.5)*(42+i*11),y*i/9]);
      const trace=path=>{c.beginPath();path.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();};
      c.strokeStyle='#a6bbec';c.globalAlpha=power*.29;c.lineWidth=8;trace(points);
      c.strokeStyle='#f4f7ff';c.globalAlpha=power*.96;c.lineWidth=2.1;trace(points);
      for(const i of [2,4,6]){
        const [px,py]=points[i],dir=i===4?-1:1,length=24+hash(strike.seed,i+40)*37;
        c.globalAlpha=power*.72;c.lineWidth=1.1;
        trace([[px,py],[px+dir*length*.45,py+12],[px+dir*length*.64,py+28],[px+dir*length,py+42]]);
      }
      c.restore();
    },

    atmosphere(c,m,cam){
      if(!V.state||!m)return;
      const f=this.frame?.m===m&&this.frame.ctx===c?this.frame:this.weatherFrame(m,cam,c);
      if(f.weatherDrawn)return;
      f.weatherDrawn=true;
      const visual=V.settings.weatherIntensity??.7;
      if(!f.exposure.open||visual<=0)return;
      const w=f.weather,time=E.preview?.enabled?E.clock:E.weatherClock;
      c.save();
      this.clipExposure(c,f);
      if(['fog','snow','rain','storm'].includes(w.type)){
        c.save();
        const sky=c.createLinearGradient(0,0,0,c.canvas.height);
        sky.addColorStop(0,w.type==='storm'?'#232831':'#d2e2e8');
        sky.addColorStop(.55,w.type==='storm'?'#3b424b':'#cad9df');
        sky.addColorStop(1,w.type==='storm'?'#4b515a':'#bfd1d7');
        c.fillStyle=sky;c.globalAlpha=visual*w.transition*(w.type==='fog'?.34:w.type==='storm'?.57:.065);
        c.fillRect(0,0,c.canvas.width,c.canvas.height);
        c.restore();
      }
      const wet=['rain','storm','snow'];
      if(w.previous&&wet.includes(w.previous.type))this.shower(c,f,w.previous.type,w.previous.intensity*visual*(1-w.transition),time);
      if(w.type==='storm')this.gusts(c,f,w.intensity*visual*w.transition,time);
      if(wet.includes(w.type))this.shower(c,f,w.type,w.intensity*visual*w.transition,time);
      if(f.calendar.season==='autumn'&&w.climate.foliage&&w.type!=='snow'){
        this.shower(c,f,'leaves',visual*(w.type==='storm'?.54:.84),time);
      }
      this.lightning(c,f);
      c.restore();
    }
  };

  const assetLoad=V.Assets.load.bind(V.Assets),assetGroup=V.AssetLoader.group.bind(V.AssetLoader);
  const seasonalFiles=new Set(Object.values(atlas).map(a=>a.file));
  V.AssetLoader.group=key=>seasonalFiles.has(key)?groupName:assetGroup(key);
  V.Assets.load=async function(...args){
    const [out]=await Promise.all([assetLoad(...args),R.load()]);
    return out;
  };
  const groups=V.MapAssets.groups.bind(V.MapAssets);
  V.MapAssets.groups=function(m){
    const out=groups(m);
    return m&&R.exposure(m).open?[...new Set([...out,groupName])]:out;
  };

  const render=V.Cozy.render.bind(V.Cozy);
  V.Cozy.render=function(c){
    const m=W.current;
    if(!m||!V.state||V.SceneEditor.active&&!E.preview?.enabled)return render(c);
    const old=R.frame,frame=R.weatherFrame(m,W.camera,c);
    if(!frame.exposure.open)return render(c);
    R.frame=frame;
    try{
      const result=render(c);
      if(!frame.weatherDrawn)R.atmosphere(c,m,frame.cam);
      return result;
    }finally{R.frame=old;}
  };
  const ground=V.GroundCache.draw.bind(V.GroundCache);
  V.GroundCache.draw=function(c,canvas,x,y){
    const result=ground(c,canvas,x,y),f=R.frame;
    if(f?.ctx===c&&f.m.cache===canvas&&f.m.id!=='hub')R.ground(c,f);
    return result;
  };
  const plaza=V.PlazaArt.surface.bind(V.PlazaArt);
  V.PlazaArt.surface=function(c,m,cam){
    const result=plaza(c,m,cam);
    if(R.frame?.ctx===c&&R.frame.m===m)R.ground(c,R.frame);
    return result;
  };

  const facade=V.CityFacades.draw.bind(V.CityFacades);
  V.CityFacades.draw=function(c,b,cam){
    const result=facade(c,b,cam);
    if(R.frame?.ctx===c){
      R.frame.styled.add(b);
      R.roof(c,b,cam,this.profile(b));
    }
    return result;
  };
  const building=W.drawBuilding.bind(W);
  W.drawBuilding=function(c,b,cam){
    const result=building(c,b,cam);
    if(R.frame?.ctx===c&&!R.frame.styled.has(b))R.roof(c,b,cam,null);
    return result;
  };

  const seaDraw=V.CapeVisuals.draw.bind(V.CapeVisuals);
  V.CapeVisuals.draw=function(owner,original,c,o,cam){
    const result=seaDraw(owner,original,c,o,cam);
    const f=R.frame,box=f?.ctx===c&&f.cover.snow>.08&&o.type.endsWith('building')&&this.artBox(o);
    if(box&&!R.raster(c,o)){
      R.roof(c,{...box,style:'terrace'},cam,null);
    }
    return result;
  };

  const decor=V.SceneDesign.drawDecor.bind(V.SceneDesign);
  V.SceneDesign.drawDecor=function(c,o,cam={x:0,y:0}){
    const tree=o.family==='base'&&o.prop===0||/^(city|residence)-tree-/.test(o.id||'');
    const flowerbed=o.family==='world'&&o.prop===0&&!o.linked;
    if(tree||flowerbed){
      const height=o.size*(tree?1.22:.64);
      if(R.plant(c,tree?'tree':'shrub',o.x+o.size/2-cam.x,o.y+o.size-cam.y,o.size,height))return;
    }
    return decor(c,o,cam);
  };
});
