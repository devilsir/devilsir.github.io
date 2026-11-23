window.VoicesModules.define('city-battle-render', function () {
  'use strict';
  const V=window.V,B=V.Combat,P=V.Progress,A=V.Animations;
  const backgrounds=['battle-courtyard','battle-studio','battle-gallery','battle-lab','battle-city','battle-city','battle-archive'];

  B.render=function(ctx){
    const a=this.active;
    if(!a)return;
    const g=this.geometry(ctx.canvas),root=V.$('#battle-root');
    const key=[g.width,g.height,g.top,g.depth].join(':');
    if(root&&root.dataset.arenaGeometry!==key){root.dataset.arenaGeometry=key;this.syncHitboxes(root,g);}
    const {width,height}=g,art=a.expedition?V.FragmentArt.images[a.expedition.arena||'clearing']:a.intro&&V.TurnArt.arena?.naturalWidth?V.TurnArt.arena:V.Assets.images[backgrounds[a.id]||'battle-city'];
    ctx.save();
    ctx.scale(ctx.canvas.width/width,ctx.canvas.height/height);
    ctx.imageSmoothingEnabled=false;
    ctx.fillStyle='#1a362e';
    ctx.fillRect(0,0,width,height);
    if(art?.naturalWidth){
      const scale=Math.max(width/art.naturalWidth,height/art.naturalHeight);
      const w=art.naturalWidth*scale,h=art.naturalHeight*scale;
      const horizon=a.expedition?Math.min(0,g.top+g.depth*.64-h*.56):(height-h)*.42;
      ctx.drawImage(art,(width-w)/2,horizon,w,h);
    }
    if(a.expedition?.tint){ctx.fillStyle=a.expedition.tint;ctx.fillRect(0,0,width,height);}
    const shade=ctx.createLinearGradient(0,0,0,height);
    shade.addColorStop(0,'#081a19a8');shade.addColorStop(.39,'#11252209');shade.addColorStop(1,'#091e1beb');
    ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    const visual=a.visual,still=V.settings.reducedMotion,clock=still?0:a.clock;
    const actors=[...a.allies,...a.enemies].map(actor=>[actor,this.position(actor,g)]);
    for(const [actor,p] of actors.sort((left,right)=>left[1].y-right[1].y)){
      if(actor.side==='enemy'&&actor.health<=0)continue;
      const {x,y,size}=p,active=visual?.actor===actor.id,enemy=actor.side==='enemy';
      V.SceneShadows.contact(ctx,x,y+4,size*.29,size*.073,.31);
      ctx.globalAlpha=actor.health<=0?.36:1;
      const hit=!!visual?.recruitHits?.includes(actor.id);
      const progress=(active||hit)&&visual?visual.age/visual.duration:0;
      const animation={
        clip:active?visual.clip:!visual&&a.phase==='victory'?'victory':'ready',
        progress,clock,hit,guarded:!!this.has(actor,'guard'),still
      };
      if(!V.FragmentArt?.drawActor(ctx,actor,x,y+4,size,animation)){
        if(enemy){
          const image=V.Assets.images['rasura-enemies'];
          const frame=still?0:active?2:Math.floor(clock*2)%2;
          if(image?.naturalWidth)ctx.drawImage(image,frame*128,actor.row*144,128,144,x-size*.58,y-size*1.10,size*1.16,size*1.16);
        }else{
          const clip=still?'ready':active?visual.clip:a.phase==='victory'?'dance':'ready';
          if(!A.draw(ctx,actor.character,clip,x,y+6,size,still?0:active?visual.age:clock,false)){
            const t=active&&!still?Math.sin(Math.PI*V.clamp(progress,0,1)):0;
            V.Assets.sprite(ctx,actor.character,x+(clip==='attack'?t*size*.23:0),y+7-t*size*.07,2,t>.1?Math.floor(visual.age*10)%4:0,size*.88);
          }
        }
      }
      ctx.globalAlpha=1;
      const aimed=(a.phase==='target'?a.selectedTarget:a.aimTarget)===actor.id;
      if(aimed||a.actor===actor.id){
        ctx.strokeStyle=aimed?'#ffdc87':'#83ddc2';ctx.lineWidth=2;
        ctx.beginPath();ctx.ellipse(x,y+5,size*.34,size*.089,0,0,Math.PI*2);ctx.stroke();
      }
      if(actor.id==='player'&&V.AncestralMask&&P.ensure().story.awakened){
        const mask=V.AncestralMask,row=active&&visual.clip==='cast'&&!V.settings.reducedFlash&&!still?mask.rows.pulse:0;
        const support=this.supportPosition(g);
        const maskSize=Math.min(size*.74,g.width*.083);
        mask.frame(ctx,row,still?0:Math.floor(clock*3)%4,support.x,support.y-support.size*.86-maskSize*.53,maskSize,mask.variant());
      }
      if(visual?.targets.includes(actor.id)&&(!still||visual.spell!=null)){
        let drawn=V.FragmentArt?.spell(ctx,visual.spell,x,y-size*.53,size*1.42,still?visual.duration*.45:visual.age,visual.duration);
        if(!drawn&&visual.teamFx!=null&&V.TeamArt){
          ctx.save();if(V.settings.reducedFlash)ctx.globalAlpha=.58;
          drawn=V.TeamArt.draw(ctx,visual.teamFx,x,y-size*.50,size*1.46,visual.age,visual.duration);ctx.restore();
        }
        if(!drawn&&!still)A.fx(ctx,visual.fx,x,y-size*.54,size*(visual.fx===5?1.72:1.23),visual.age);
      }
    }
    this.drawBattleCompanion(ctx,g);
    const floating=new Map();
    for(const effect of [...a.effects].reverse()){
      const actor=this.get(effect.target);
      if(!actor)continue;
      const count=floating.get(actor.id)||0;
      if(count>=3)continue;
      floating.set(actor.id,count+1);
      const p=this.position(actor,g),step=g.narrow?14:18;
      const rise=still?0:(1.3-effect.life)*14;
      V.Engine.text(ctx,effect.text,p.x,p.y-p.size*.9-rise-count*step,effect.color,step-1,'center');
    }
    ctx.restore();
  };
});
