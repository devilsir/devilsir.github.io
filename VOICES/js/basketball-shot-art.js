window.VoicesModules.define('basketball-shot-art', function () {
  'use strict';

  const V=window.V,M=V.BasketballMatch;
  const styles={layup:'Bandeja',jumper:'Arremesso de dois',three:'Arremesso de três',free:'Lance livre'};
  const outcomes={clean:'Cesta limpa','rim-in':'Aro e cesta','bank-in':'Cesta de tabela',
    'rim-out':'Bateu no aro','bank-out':'Voltou da tabela',airball:'Sem tocar no aro'};
  const scored=new Set(['clean','rim-in','bank-in']);
  const trajectories={
    clean:{seconds:.44,net:[.15,.86],still:.55,keys:[
      [0,.515,.48],[.12,.511,.538],[.24,.506,.609],[.36,.503,.687],[.48,.501,.763],
      [.60,.501,.83],[.71,.502,.885],[.84,.505,.967],[1,.512,1.13]
    ]},
    'rim-in':{seconds:.74,hits:[[.02,'rim'],[.43,'rim']],net:[.57,.94],still:.73,keys:[
      [0,.68,.525],[.055,.679,.543],[.13,.645,.466],[.21,.592,.421],[.29,.522,.43],
      [.38,.426,.49],[.43,.37,.549],[.49,.401,.498],[.55,.449,.52],[.62,.482,.614],
      [.7,.5,.719],[.79,.505,.813],[.89,.51,.924],[1,.52,1.13]
    ]},
    'bank-in':{seconds:.56,hits:[[.045,'board']],net:[.33,.9],still:.6,keys:[
      [0,.665,.415],[.07,.654,.424],[.16,.608,.39],[.25,.555,.438],[.33,.524,.531],
      [.43,.505,.649],[.54,.499,.748],[.67,.501,.834],[.8,.506,.91],[.9,.511,1.004],[1,.516,1.13]
    ]},
    'rim-out':{seconds:.61,hits:[[.035,'rim']],still:.69,keys:[
      [0,.686,.53],[.07,.694,.546],[.14,.724,.476],[.23,.775,.431],[.32,.821,.429],
      [.41,.854,.468],[.52,.884,.549],[.63,.907,.667],[.74,.926,.796],[.87,.947,.955],[1,.968,1.13]
    ]},
    'bank-out':{seconds:.59,hits:[[.04,'board']],still:.7,keys:[
      [0,.691,.417],[.075,.685,.438],[.16,.741,.39],[.25,.802,.39],[.34,.85,.438],
      [.45,.889,.529],[.56,.916,.633],[.69,.941,.761],[.84,.958,.928],[1,.97,1.13]
    ]},
    airball:{seconds:.46,still:.57,keys:[
      [0,.83,.47],[.13,.837,.54],[.25,.844,.612],[.39,.851,.697],[.53,.857,.786],
      [.66,.862,.867],[.8,.866,.964],[1,.871,1.13]
    ]}
  };
  const size={x:276,y:100,w:408,h:272};
  const lerp=(a,b,t)=>a+(b-a)*t;
  const pathFor=outcome=>trajectories[outcome]||trajectories['rim-out'];
  const dropDuration=outcome=>pathFor(outcome).seconds;
  const styleName=style=>styles[style]||styles.jumper;
  const message=moment=>scored.has(moment.outcome)?outcomes[moment.outcome]+' · +'+moment.value
    :'Fora · '+outcomes[moment.outcome];
  let art=null;

  function load(){
    art??=['cesta-close','bola-close','cesta-close-frente'].map(name=>{
      const image=V.Assets.image();
      image.src='assets/basketball/'+name+'.webp?v=20261122-fechamento1';
      return image;
    });
    return art;
  }

  function frame(outcome,side,t){
    const path=pathFor(outcome),keys=path.keys;
    const phase=M.clamp(t,0,1);
    const next=keys.findIndex(([at])=>at>=phase&&at>0);
    const [start,ax,ay]=keys[next-1], [end,bx,by]=keys[next];
    const mix=(phase-start)/(end-start), approach=M.clamp(t+1,0,1);
    const x=t<0?lerp(.76,keys[0][1],approach):lerp(ax,bx,mix);
    const y=t<0?lerp(.08,keys[0][2],approach*(.64+.36*approach)):lerp(ay,by,mix);
    const direction=side===-1?-1:1;
    const hit=t>=0&&path.hits?.find(([at])=>phase>=at&&phase-at<.13);
    const impact=hit?(1-(phase-hit[0])/.13):0;
    const netAge=path.net?(phase-path.net[0])/(path.net[1]-path.net[0]):-1;
    const sway=netAge>0&&netAge<1?direction*Math.sin(netAge*Math.PI*3)*Math.sin(netAge*Math.PI)*.016:0;
    const through=Boolean(path.net&&phase>=path.net[0]&&t>=0);
    return {x:direction<0?1-x:x,y,angle:(t+1.15)*direction*(path.hits?4.5:3.7),
      depth:through&&y>.535&&x>.39&&x<.64,sway,impact,contact:hit?.[1]||null};
  }

  function hoopLayer(c,image,w,h,sway){
    if(!sway){c.drawImage(image,0,0,w,h);return;}
    const sw=image.naturalWidth,sh=image.naturalHeight,span=.26;
    c.drawImage(image,0,0,sw,sh*.658,0,0,w,h*.658);
    const left=.263,right=.737;
    c.drawImage(image,0,sh*.658,sw*left,sh*span,0,h*.658,w*left,h*span);
    c.drawImage(image,sw*right,sh*.658,sw*(1-right),sh*span,w*right,h*.658,w*(1-right),h*span);
    const strips=14;
    for(let i=0;i<strips;i++){
      const y=.658+i*span/strips;
      const shift=sway*Math.sin(Math.PI*(i+.5)/strips);
      c.drawImage(image,sw*(left-shift),sh*y,sw*(right-left),sh*span/strips,
        w*left,h*y,w*(right-left),h*span/strips+.3);
    }
    c.drawImage(image,0,sh*.918,sw,sh*.082,0,h*.918,w,h*.082);
  }

  function background(c,w,h,sway){
    const [hoop]=art;
    if(hoop.naturalWidth){hoopLayer(c,hoop,w,h,sway);return;}
    c.fillStyle='#17352e';c.fillRect(0,0,w,h);
    c.fillStyle='#d8c397';c.fillRect(w*.24,h*.27,w*.52,h*.38);
    c.strokeStyle='#43654f';c.lineWidth=5;c.strokeRect(w*.37,h*.38,w*.26,h*.25);
    c.strokeStyle='#f1d3a5';c.lineWidth=2;
    for(let i=0;i<8;i++){
      const marker=w*(.31+i*.053);
      c.beginPath();c.moveTo(marker,h*.60);c.lineTo(w*.50+(marker-w*.50)*.61,h*.90);c.stroke();
    }
    c.strokeStyle='#d57639';c.lineWidth=7;c.beginPath();c.ellipse(w*.50,h*.605,w*.208,h*.064,0,0,Math.PI*2);c.stroke();
  }

  function drawBall(c,ball,w,h){
    const sprite=art[1],d=w*.137;
    c.save();c.translate(ball.x*w,ball.y*h);c.rotate(ball.angle);
    c.scale(1+ball.impact*.095,1-ball.impact*.14);
    if(sprite.naturalWidth)c.drawImage(sprite,-d*.5,-d*.5,d,d);
    else{
      c.fillStyle='#a84e26';c.beginPath();c.arc(0,0,d*.41,0,Math.PI*2);c.fill();
      c.strokeStyle='#472c22';c.lineWidth=2;c.beginPath();c.moveTo(0,-d*.39);c.lineTo(0,d*.39);
      c.moveTo(-d*.39,0);c.quadraticCurveTo(0,d*.15,d*.39,0);c.stroke();
    }
    c.restore();
  }

  function drawImpact(c,pose,w,h){
    if(pose.impact<=0)return;
    const x=pose.x*w,y=pose.y*h+(pose.contact==='rim'?12:-4),spread=1-pose.impact;
    c.save();
    c.strokeStyle=pose.contact==='rim'?'#ffd490':'#ffe8ba';
    c.lineWidth=1.6;
    c.globalAlpha=.84*pose.impact;
    c.beginPath();
    for(const angle of [3.62,4.18,5.13,5.72]){
      const a=14+spread*11,b=a+4+spread*5;
      c.moveTo(x+Math.cos(angle)*a,y+Math.sin(angle)*a);
      c.lineTo(x+Math.cos(angle)*b,y+Math.sin(angle)*b);
    }
    c.stroke();
    c.restore();
  }

  function draw(c,s,sequence){
    const f=s.flight,still=V.settings.reducedMotion;
    const progress=f&&(f.type==='shot'||f.type==='free-throw')?(f.time-(f.release||0))/f.duration:0;
    if(!sequence&&(progress<.54||still))return;
    load();
    const live=sequence?.moment, outcome=live?.outcome||M.shotResult(f);
    const team=live?.team??f.team;
    const side=live?.side??(Math.sign(f.end.y-M.goal(team).y)||(team===0?1:-1));
    const settled=Boolean(sequence&&sequence.elapsed>=sequence.animation);
    const pose=sequence
      ?sequence.animation===0?frame(outcome,side,pathFor(outcome).still)
        :sequence.elapsed<sequence.animation?frame(outcome,side,sequence.elapsed/sequence.animation):null
      :frame(outcome,side,M.clamp((progress-1)/.46,-1,0));
    const {x,y,w,h}=size;
    c.save();
    c.fillStyle='#09181566';c.fillRect(76,53,808,402);
    c.fillStyle='#0b1d1a';c.fillRect(x+4,y+6,w,h);
    c.translate(x,y);
    c.beginPath();c.rect(0,0,w,h);c.clip();
    c.imageSmoothingEnabled=true;
    background(c,w,h,pose?.sway||0);
    if(pose){
      drawBall(c,pose,w,h);
      if(pose.depth&&art[2].naturalWidth)hoopLayer(c,art[2],w,h,pose.sway);
      drawImpact(c,pose,w,h);
    }
    c.fillStyle='#112a26eb';c.fillRect(0,0,w,31);
    c.fillStyle=M.teams[team].color;c.fillRect(0,0,4,31);
    c.textBaseline='middle';c.textAlign='left';c.font='700 14px system-ui';c.fillStyle='#fff1d5';
    c.fillText(styleName(live?.style||f?.style),13,15.5);
    c.textAlign='right';c.fillStyle=M.teams[team].color;
    c.fillText(M.roster[live?.id??f.id][1],w-12,15.5);
    if(settled){
      c.fillStyle='#102722ed';c.fillRect(0,h-36,w,36);
      c.textAlign='center';c.fillStyle=scored.has(outcome)?'#9ce6c1':'#ffbc98';c.font='800 19px system-ui';
      c.fillText(message(live),w/2,h-18);
    }
    c.strokeStyle='#e4c88d';c.lineWidth=2;c.strokeRect(1,1,w-2,h-2);
    c.restore();
  }

  V.BasketballShotArt={load,draw,frame,message,styleName,dropDuration};
});
