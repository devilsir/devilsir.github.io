/* Registered module: fragment-art */
(function(init){if(window.VoicesModules)window.VoicesModules.define('fragment-art',init);else init();})(function(){
  'use strict';
  const V=window.V, directory='assets/adventure/fragment/';
  const trailDecor=new Set(['jade','marsh','mist','amber','trunks','ruins','water','wayside','understory','relics']
    .map(name=>'trail-decor-'+name));
  const assetGroup=V.AssetLoader.group.bind(V.AssetLoader);
  V.AssetLoader.group=function(path){
    const key=path.startsWith(directory)&&path.endsWith('.webp')?path.slice(directory.length,-5):null;
    return trailDecor.has(key)?key:assetGroup(path);
  };
  const cells={allies:192,portraits:96,creatures:192,spells:160,woods:192,'ally-battle':144,'trail-props':192,'trail-mobs':192};
  for(const key of trailDecor)cells[key]=192;
  const files=[...Object.keys(cells),'clearing','ground','trail-arena'],images={},textures=[];
  const load=V.Assets.load.bind(V.Assets);
  V.Assets.load=async function(...args){
    const pictures=files.map(key=>new Promise(resolve=>{
      const img=V.Assets.image();
      if(!trailDecor.has(key))images[key]=img;
      img.onload=()=>{images[key]=img;resolve();};
      img.onerror=resolve;
      img.src=directory+key+'.webp';
      V.AssetLoader.register(img,resolve);
    }));
    const [result]=await Promise.all([load(...args),...pictures]);
    return result;
  };
  function tile(key,index,className){
    const rows=key==='spells'?4:key==='trail-mobs'?2:3;
    return `<span aria-hidden="true" class="fragment-tile ${className}" style="background-image:url('${directory+key}.webp');background-size:400% ${rows*100}%;background-position:${index%4*100/3}% ${Math.floor(index/4)*100/(rows-1)}%"></span>`;
  }
  const indexOf=id=>V.TeamData.kits[id]?.fragmentArt;
  V.FragmentArt={
    images,
    isTrailDecor:key=>trailDecor.has(key),
    tile,
    texture(ctx,index){
      const img=images.ground;
      if(!img?.naturalWidth)return null;
      if(!textures[index]){
        const size=img.naturalWidth/2,canvas=document.createElement('canvas');
        canvas.width=canvas.height=size;
        canvas.getContext('2d').drawImage(img,index%2*size,Math.floor(index/2)*size,size,size,0,0,size,size);
        textures[index]=canvas;
      }
      return ctx.createPattern(textures[index],'repeat');
    },
    portrait(id,full=false){
      const index=indexOf(id);
      return index==null?'':tile(full?'allies':'portraits',index,'fragment-portrait');
    },
    draw(ctx,key,index,x,y,size,flip=false){
      const img=images[key],cell=cells[key];
      if(index==null)return false;
      if(!V.Assets.ready(img)){
        if(V.AssetLoader.byImage.get(img)?.state==='deferred')V.AssetLoader.request(img);
        return false;
      }
      ctx.save();
      ctx.imageSmoothingEnabled=false;
      if(flip){ctx.translate(x*2,0);ctx.scale(-1,1);}
      const columns=trailDecor.has(key)?3:4;
      ctx.drawImage(img,index%columns*cell,Math.floor(index/columns)*cell,cell,cell,Math.round(x-size/2),Math.round(y-size),size,size);
      ctx.restore();
      return true;
    },
    drawActor(ctx,actor,x,y,size,animation={}){
      const {clip='ready',progress=0,clock=0,hit=false,guarded=false,still=false}=animation;
      const t=V.clamp(progress,0,1);
      if(actor.side==='enemy'){
        const lunge=still?0:Math.sin(Math.PI*t);
        return this.draw(ctx,actor.fragmentSheet||'creatures',actor.fragmentArt,x-lunge*size*.17,y-lunge*size*.08,size*1.25,true);
      }
      const index=indexOf(actor.character);
      if(index==null)return false;

      const impact=hit?V.clamp((t-.25)/.65,0,1):0;
      let pose=-1,dx=0,dy=0,tilt=0,sx=1,sy=1;
      if(actor.health<=0){
        const down=still||!hit?1:Math.min(1,impact*1.65);
        if(down>.28)pose=2;
        dx=-.15*down;
        tilt=-.72*down;
        sy=1-.43*down;
      }else if(clip==='victory'){
        pose=3;
        if(!still){
          const jump=Math.max(0,Math.sin((clock*2+index*.17)*Math.PI));
          dy=-.15*jump;
          sx=1-.035*jump;
          sy=1+.05*jump;
        }
      }else if(!still){
        if(impact>0&&impact<1){
          const recoil=Math.sin(Math.PI*impact);
          if(guarded)pose=2;
          dx=-.15*recoil;
          tilt=-.24*recoil;
          sy=1-.10*recoil;
        }else if(clip==='attack'){
          const windup=Math.sin(Math.PI*V.clamp(t/.28,0,1));
          const lunge=Math.sin(Math.PI*V.clamp((t-.18)/.78,0,1));
          if(t>=.26&&t<.78)pose=0;
          dx=.23*lunge-.07*windup;
          tilt=.12*lunge-.10*windup;
          sy=1+.045*lunge-.07*windup;
        }else if(clip==='cast'||clip==='heal'){
          const pulse=Math.sin(Math.PI*t);
          if(t>=.2&&t<.89)pose=1;
          dy=-.07*pulse;
          sy=1+.055*pulse;
          sx=1-.025*pulse;
        }else if(clip==='guard'||guarded){
          pose=2;
          sy=1-.06*Math.sin(Math.PI*t);
        }else{
          sy=1+.022*Math.sin(clock*4.3+index*.77);
        }
      }else if(guarded)pose=2;

      ctx.save();
      ctx.translate(Math.round(x+size*dx),Math.round(y+size*dy));
      ctx.rotate(tilt);
      ctx.scale(sx,sy);
      const shown=(pose>=0&&this.draw(ctx,'ally-battle',index*4+pose,0,0,size*1.35))
        ||this.draw(ctx,'allies',index,0,0,size*1.35);
      ctx.restore();
      return shown;
    },
    spell(ctx,index,x,y,size,age,duration){
      if(index==null)return false;
      const t=V.clamp(age/duration,0,1),scale=.72+t*.38;
      ctx.save();
      ctx.globalAlpha=Math.min(1,t*8,(1-t)*4)*(V.settings.reducedFlash?.60:1);
      const ok=this.draw(ctx,'spells',index,x,y+size*scale/2,size*scale);
      ctx.restore();
      return ok;
    },
    conditions(actor){
      const list=actor.statuses.filter(s=>V.FragmentData.conditions[s.id]);
      return list.length?`<span class="fragment-statuses">${list.map(s=>{
        const [label,index,description]=V.FragmentData.conditions[s.id];
        return `<span title="${label} · ${s.turns} · ${description}" aria-label="${label}, ${s.turns} turnos">${tile('spells',index,'fragment-condition')}<b>${s.turns}</b></span>`;
      }).join('')}</span>`:'';
    }
  };
});
