window.VoicesModules.define('basketball-ai', function () {
  'use strict';

  const traits=[
    ['organizer',134,67,.23,225,258,-20,.74,.39,.84],
    ['shooter',118,76,.34,273,210,-98,.58,.38,.50],
    ['cutter',141,71,.21,191,196,108,.68,.52,.72],
    ['screen',113,79,.37,181,148,-61,.53,.77,.48],
    ['post',106,82,.40,155,95,65,.51,1,.46],
    ['driver',139,70,.22,210,244,18,.84,.38,.79],
    ['stopper',127,72,.25,226,204,-106,.65,.55,1],
    ['shooter',116,75,.32,280,208,108,.65,.46,.60],
    ['cutter',133,76,.31,204,153,61,.60,.70,.68],
    ['post',108,81,.38,155,92,-61,.54,1,.53]
  ];
  const tendencies=[
    {reads:.97,rim:.78,arc:.64,cut:.55,screen:.20,deny:.72,help:.43,stamina:.87},
    {reads:.61,rim:.60,arc:.96,cut:.37,screen:.28,deny:.80,help:.36,stamina:.75},
    {reads:.70,rim:.93,arc:.47,cut:.99,screen:.45,deny:.66,help:.57,stamina:.94},
    {reads:.83,rim:.82,arc:.56,cut:.62,screen:.99,deny:.48,help:.88,stamina:.73},
    {reads:.56,rim:.98,arc:.20,cut:.46,screen:.76,deny:.35,help:.94,stamina:.68},
    {reads:.83,rim:.95,arc:.62,cut:.85,screen:.16,deny:.68,help:.42,stamina:.95},
    {reads:.88,rim:.75,arc:.71,cut:.51,screen:.36,deny:.99,help:.59,stamina:.90},
    {reads:.73,rim:.62,arc:.99,cut:.49,screen:.23,deny:.71,help:.31,stamina:.82},
    {reads:.71,rim:.89,arc:.52,cut:.91,screen:.68,deny:.60,help:.75,stamina:.88},
    {reads:.79,rim:.92,arc:.23,cut:.50,screen:.89,deny:.42,help:.99,stamina:.79}
  ];
  const profiles=traits.map(([role,speed,stride,reaction,range,depth,lane,drive,boards,press],i)=>
    ({role,speed,stride,reaction,range,depth,lane,drive,boards,press,...tendencies[i]}));
  const plays=['Transição','Corte sem bola','Espaçamento','Bloqueio e rolagem','Bola no poste'];
  const facing=[{x:0,y:1},{x:-1,y:0},{x:1,y:0},{x:0,y:-1}];
  const orders=permutations([0,1,2,3,4]);

  function permutations(available){
    if(!available.length)return [[]];
    return available.flatMap((id,i)=>permutations(available.filter((_,j)=>i!==j)).map(tail=>[id,...tail]));
  }

  function noise(value) {
    let x=Math.imul(value^0x9e3779b9,0x21f0aaad);
    x=Math.imul(x^(x>>>15),0x735a2d97);
    return ((x^(x>>>15))>>>0)/4294967296;
  }

  function create({court,baskets,goal,clamp,distance,pressure,passLane,shotValue,hand}){
    const matches=new WeakMap();
    const other=team=>1-team;
    const direction=team=>team===0?1:-1;
    const roster=(s,team)=>s.players.slice(team*5,team*5+5);
    const bounded=spot=>({
      x:clamp(spot.x,court.x+15,court.x+court.w-15),
      y:clamp(spot.y,court.y+14,court.y+court.h-14)
    });
    const relative=(team,depth,lane)=>bounded({x:goal(team).x-direction(team)*depth,y:285+lane});
    const profile=p=>profiles[p.id];
    const sample=(s,p,n)=>noise((s.possessionId||0)*239+(s.play||0)*541+p.id*2039+n*193);
    const openness=(s,at,team)=>Math.min(...roster(s,other(team)).map(p=>distance(at,p)));
    const room=(s,at,p)=>Math.min(...roster(s,p.team).filter(q=>q!==p).map(q=>distance(at,q)));

    function teamPlay(s,adjusting=false){
      const carrier=s.players[s.carrier],team=s.possession,margin=s.score[team]-s.score[other(team)];
      const dir=direction(team),rim=goal(team);
      const roll=noise((s.possessionId||0)*1469+(s.play||0)*771+team*2053+(adjusting?7733:0));
      const danger=s.clock<20&&margin<0;
      if(danger&&margin<=-3)return 2;
      if(carrier&&dir*(rim.x-carrier.x)>345&&!adjusting){
        const advanced=roster(s,team).filter(q=>dir*(q.x-carrier.x)>108).length;
        const back=roster(s,other(team)).filter(q=>distance(q,rim)<265).length;
        if(advanced>0&&back<3||roll<.37)return 0;
      }
      if(carrier&&pressure(s,carrier)<39&&!danger)return 3;
      if(adjusting&&carrier){
        const post=roster(s,team).at(-1);
        if(distance(post,rim)<153&&pressure(s,post)>29)return 4;
        if(pressure(s,carrier)<51)return 1;
      }
      if(team===0)return roll<.34?1:roll<.61?2:roll<.88?3:4;
      return roll<.23?1:roll<.47?2:roll<.80?3:4;
    }

    function state(s){
      let data=matches.get(s);
      if(!data||s.elapsed<data.elapsed){
        data={stamp:'',plans:[],matchups:[],defenseAt:-1,ball:null};
        matches.set(s,data);
      }
      const stamp=[s.possessionId||0,s.play||0,s.possession,s.quarter].join('/');
      if(data.stamp!==stamp){
        data.stamp=stamp;data.play=teamPlay(s);data.defenseAt=-1;
        data.plans=[];data.pursuit=null;data.screen=null;data.outlets=null;data.pressRoute=null;data.adjusted=false;
        data.started=s.elapsed;
      }
      if(!data.adjusted&&s.elapsed-data.started>7.5&&s.carrier!=null&&s.shotClock>4){
        data.adjusted=true;
        data.play=teamPlay(s,true);
        data.screen=null;
      }
      if(data.ball!==s.carrier){
        if(s.carrier!=null)data.defenseAt=Math.min(data.defenseAt,s.elapsed+.19);
        data.ball=s.carrier;
      }
      data.elapsed=s.elapsed;
      return data;
    }

    function assign(s,data){
      if(s.elapsed<data.defenseAt)return data.matchups;
      const attackers=roster(s,s.possession),defenders=roster(s,other(s.possession));
      const rim=goal(s.possession);
      const costs=defenders.map(q=>attackers.map(p=>{
        const style=profile(q),stay=data.matchups[q.id]===p.id?31:0;
        const inside=distance(p,rim)<150;
        const advantage=p.id===s.carrier?style.press*32:inside?style.help*23:style.deny*23;
        const human=s.human&&q.id===0&&p.id===s.carrier?19:0;
        return distance(q,p)+Math.abs(q.slot-p.slot)*10-stay-advantage+human;
      }));
      let best=orders[0],bestCost=Infinity;
      for(const order of orders){
        const total=order.reduce((sum,attacker,i)=>sum+costs[i][attacker],0);
        if(total<bestCost){best=order;bestCost=total;}
      }
      const assignments=[];
      defenders.forEach((q,i)=>{assignments[q.id]=attackers[best[i]].id;});
      data.matchups=assignments;
      data.defenseAt=s.elapsed+1.32;
      return assignments;
    }

    function guard(s,p,data){
      const interception=intercept(s,p);
      if(interception)return interception;
      const style=profile(p),carrier=s.players[s.carrier],own=baskets[p.team];
      const assignments=assign(s,data);
      const mark=s.players[assignments[p.id]]||s.players[s.possession*5+p.slot];
      const press=mark===carrier;
      const route=press&&pressAround(s,p,carrier,data);
      if(route)return route;
      const threat=carrier&&distance(carrier,own)<161&&Math.abs(carrier.y-own.y)<109;
      const cover=q=>distance(q,own)*.46+distance(q,carrier)*.34-profile(q).help*67;
      const help=threat&&!press&&style.help>.62&&distance(p,own)<179&&distance(mark,carrier)>64&&
        !roster(s,p.team).some(q=>q!==p&&!(s.human&&q.id===0)&&assignments[q.id]!==carrier.id&&profile(q).help>.62&&cover(q)<cover(p));
      const watch=help?carrier:mark;
      const span=Math.max(1,distance(watch,own));
      const closeout=!press&&!help&&profile(mark).arc>.75&&distance(mark,own)<284;
      const radius=(press?29:closeout?31:43)-(style.press-.55)*15-(s.difficulty-1)*4;
      const lead=press?.19:.14;
      const at=bounded({
        x:watch.x+(own.x-watch.x)*radius/span+(watch.vx||0)*lead,
        y:watch.y+(own.y-watch.y)*radius/span+(watch.vy||0)*lead
      });
      if(help){at.x=at.x*.68+own.x*.32;at.y=at.y*.68+own.y*.32;}
      if(closeout&&carrier&&distance(carrier,mark)>85){
        const gap=distance(carrier,mark),deny=19*style.deny;
        at.x+=(carrier.x-mark.x)/gap*deny;at.y+=(carrier.y-mark.y)/gap*deny;
      }
      const screen=data.screen;
      if(press&&screen?.setAt!=null&&s.elapsed-screen.setAt<.75&&distance(p,screen.spot)<40){
        at.y+=screen.side*36;
      }
      return {...bounded(at),lookId:watch.id,intent:press?'press':help?'help':closeout?'deny':'mark'};
    }

    function pressAround(s,p,carrier,data){
      if(s.status!=='play'||s.drill)return null;
      const axis=facing[carrier.dir]||facing[0];
      const dx=p.x-carrier.x,dy=p.y-carrier.y;
      const ahead=dx*axis.x+dy*axis.y,lateral=dy*axis.x-dx*axis.y;
      const active=data.pressRoute?.defender===p.id&&data.pressRoute.handler===carrier.id;
      if(Math.hypot(dx,dy)>104||Math.hypot(carrier.vx||0,carrier.vy||0)>89){
        if(active)data.pressRoute=null;
        return null;
      }
      if(!active&&ahead>-8)return null;
      const center={x:carrier.x+(carrier.vx||0)*.11,y:carrier.y+(carrier.vy||0)*.11};
      const point=(angle,side,radius)=>{
        const forward=Math.cos(angle)*radius,across=Math.sin(angle)*radius*side;
        return bounded({x:center.x+axis.x*forward-axis.y*across,y:center.y+axis.y*forward+axis.x*across});
      };
      const frontEdge=point(0,1,42);
      const atLine=(frontEdge.x-center.x)*axis.x+(frontEdge.y-center.y)*axis.y<21;
      let side=data.pressRoute?.side;
      if(!active||data.pressRoute.dir!==carrier.dir){
        const bounce=atLine&&hand?hand(carrier,13):s.ball;
        const cost=turn=>{
          const flank=point(Math.PI/2,turn,42),front=point(atLine?.89:.45,turn,atLine?35:29);
          const crowd=Math.min(...s.players.filter(q=>q!==carrier&&q!==p).map(q=>distance(q,flank)));
          return distance(p,flank)+Math.max(0,36-distance(carrier,flank))*4
            +Math.max(0,24-distance(carrier,front))*2+Math.max(0,33-crowd)*1.5
            +(atLine?distance(front,bounce)*1.4:0);
        };
        side=cost(-1)<cost(1)?-1:1;
        data.pressRoute={defender:p.id,handler:carrier.id,dir:carrier.dir,side};
      }
      const angle=Math.atan2(Math.max(0,lateral*side),ahead);
      const closing=atLine?angle<1.83&&ahead>-8:angle<.76&&ahead>14;
      const at=point(closing&&atLine?.89:Math.max(.43,angle-.69),side,closing?(atLine?35:29):42);
      return {...at,intent:closing?'contest':'flank',lookBall:true};
    }

    function receive(p,f){
      const total=f.duration+(f.release||0);
      const meet=.78;
      const first=bounded({x:f.from.x+(f.end.x-f.from.x)*meet,y:f.from.y+(f.end.y-f.from.y)*meet});
      const style=profile(p),speed=style.speed*1.16;
      const start=Math.max(0,total-f.duration*(1-meet)-f.time);
      const reverse=momentum(p,first)<-.32;
      const canMeet=start>.07&&distance(p,first)<speed*Math.max(0,start-(reverse?.12:.04))+22;
      return {...(canMeet?first:f.end),intent:'receive'};
    }

    function intercept(s,p){
      const f=s.flight,release=f?.release||0;
      if(s.drill||f?.type!=='pass'||f.time<release)return null;
      const remaining=release+f.duration-f.time;
      if(remaining<.14||s.ball.z>36)return null;
      const t=clamp((f.time-release+.17)/f.duration,0,.9);
      const at=bounded({x:f.from.x+(f.end.x-f.from.x)*t,y:f.from.y+(f.end.y-f.from.y)*t});
      const range=distance(p,at),reach=27+profile(p).press*11;
      if(range>reach||roster(s,p.team).some(q=>q!==p&&distance(q,at)<range-4))return null;
      return {...at,intent:'intercept',lookBall:true};
    }

    function drive(s,p,data){
      const style=profile(p),rim=goal(p.team),dir=direction(p.team);
      const finishing=style.role==='post'?75:style.role==='shooter'&&data.play===2?241:94;
      const pressureNow=pressure(s,p);
      const forward=clamp(68+style.drive*82,80,138);
      const depth=dir*(rim.x-p.x);
      const next=p.x+dir*clamp(depth-finishing,-70,forward);
      const lane=clamp(p.y-285,-95,95);
      const options=[bounded({x:next,y:285+lane*.70}),
        bounded({x:next-dir*22,y:p.y-57}),bounded({x:next-dir*22,y:p.y+57})];
      const screen=data.screen;
      if(screen?.handler===p.id&&screen.setAt!==null&&s.elapsed-screen.setAt<1.18){
        if(distance(p,screen.spot)<137)options.unshift(bounded({x:screen.spot.x+dir*66,y:screen.spot.y+screen.side*27}));
      }
      if(pressureNow<37)options.push(bounded({x:p.x-dir*19,y:p.y+(sample(s,p,8)>.5?83:-83)}));
      const merit=at=>Math.min(99,openness(s,at,p.team))*.61+passLane(s,p,at)*.51+dir*(at.x-p.x)*.53
        -Math.abs(at.y-285)*.19+Math.min(62,room(s,at,p))*.27+(settled(p)?0:momentum(p,at)*25);
      const chosen=options.reduce((best,at)=>merit(at)>merit(best)?at:best);
      return {...chosen,intent:dir*(chosen.x-p.x)>18?'drive':'reset'};
    }

    function settled(p){return Math.hypot(p.vx||0,p.vy||0)<22;}

    function momentum(p,at){
      return ((p.vx||0)*(at.x-p.x)+(p.vy||0)*(at.y-p.y))/Math.max(1,distance(p,at)*profile(p).speed);
    }

    function screenAction(s,p,carrier,data){
      const style=profile(p),dir=direction(p.team),rim=goal(p.team);
      const screen=data.screen;
      if(screen?.id===p.id&&screen.setAt!==null){
        const age=s.elapsed-screen.setAt;
        if(age>1.95)return null;
        if(age>.74||dir*(carrier.x-screen.spot.x)>18){
          const pop=style.arc>.48&&s.players.some(q=>q.team!==p.team&&distance(q,rim)<107);
          return {...relative(p.team,pop?237:87,pop?screen.side*97:-screen.side*35),intent:pop?'pop':'roll',lookId:carrier.id};
        }
        return {...screen.spot,intent:'screen',lookId:carrier.id};
      }
      if(screen&&screen.id!==p.id||style.screen<.64||distance(carrier,rim)<161||s.age<.8||s.age>5)return null;
      const fitness=q=>profile(q).screen*122-distance(carrier,q)*.56;
      if(!screen&&roster(s,p.team).some(q=>q!==p&&q!==carrier&&!(s.human&&q.id===0)&&profile(q).screen>=.64&&fitness(q)>fitness(p)))return null;
      const side=screen?.side??(carrier.y>285?-1:1);
      const spot=bounded({x:carrier.x+dir*43,y:carrier.y+side*29});
      data.screen={id:p.id,handler:carrier.id,side,spot,setAt:distance(p,spot)<24?s.elapsed:null};
      return {...spot,intent:'screen',lookId:carrier.id};
    }

    function shortOutlets(s,carrier,data){
      const team=carrier.team,dir=direction(team);
      const backcourt=dir*(goal(team).x-carrier.x)>329;
      const nearby=roster(s,other(team)).filter(q=>distance(q,carrier)<61).length;
      if(!backcourt&&(!nearby||nearby===1&&distance(carrier,goal(team))<122))return null;
      const old=data.outlets;
      if(old?.handler===carrier.id&&s.elapsed<old.until&&distance(old.anchor,carrier)<43)return old.routes;
      const anchor={x:carrier.x,y:carrier.y};
      const spots=[[-40,85],[43,92],[95,68]].flatMap(([x,y])=>
        [-1,1].map(side=>bounded({x:anchor.x+dir*x,y:anchor.y+side*y})));
      const teammates=roster(s,team).filter(q=>q!==carrier&&!(s.human&&q.id===0));
      const candidates=teammates.flatMap(q=>spots.filter(at=>distance(at,anchor)>44).map(at=>{
        const open=openness(s,at,team),lane=passLane(s,carrier,at);
        const keep=old?.handler===carrier.id&&old.routes[q.id]?20:0;
        const score=Math.min(65,lane)*.94+Math.min(78,open)*.69+Math.min(60,room(s,at,q))*.38
          +profile(q).reads*33-distance(q,at)*.37+dir*(at.x-anchor.x)*.07+keep;
        return {id:q.id,at,score,lane};
      })).sort((a,b)=>b.score-a.score);
      const best=candidates[0],routes={};
      if(best){
        routes[best.id]=best.at;
        const alternate=nearby>1&&candidates.find(c=>c.id!==best.id&&c.lane>22&&distance(c.at,best.at)>92);
        if(alternate)routes[alternate.id]=alternate.at;
      }
      data.outlets={handler:carrier.id,anchor,routes,until:s.elapsed+.91};
      return routes;
    }

    function getOpen(s,p,data){
      const style=profile(p),carrier=s.players[s.carrier];
      const rim=goal(p.team),dir=direction(p.team),handler=carrier||(s.status==='inbound'?s.players[s.inboundId]:null);
      const support=handler||s.ball;
      if(handler&&handler.team===p.team){
        const close=shortOutlets(s,handler,data)?.[p.id];
        if(close)return {...close,intent:'show',lookId:handler.id};
      }
      const transit=dir*(rim.x-support.x)>342;
      const stagger=sample(s,p,7)*.48;
      if(transit&&data.play===0&&style.drive>.58&&s.age>.24+stagger){
        const lane=style.lane||(p.slot%2?-82:82);
        return {...relative(p.team,style.depth*.68,lane),intent:'break'};
      }
      if(transit){
        const progress=dir*(support.x-rim.x)+style.depth+(p.slot-2)*29;
        return {...relative(p.team,clamp(-progress,style.depth,610),style.lane),intent:'outlet'};
      }
      if(data.play===3&&carrier){
        if(data.screen&&data.screen.handler!==carrier.id)data.screen=null;
        const screen=screenAction(s,p,carrier,data);
        if(screen)return screen;
      }
      const window=6.35-style.cut*2+p.slot*.22;
      const offset=(s.age+1.02+p.slot*.93-stagger)%window;
      const farSide=(support.y-285)*style.lane<0;
      const opening=relative(p.team,style.role==='driver'?91:71,style.lane*(farSide?.44:.86));
      if(style.cut>.51&&s.age>1.05&&offset>.58&&offset<1.7+style.cut*.9&&distance(p,rim)>68&&
          dir*(rim.x-support.x)>68&&room(s,opening,p)>51&&passLane(s,support,opening)>16){
        return {...opening,intent:'cut',lookId:carrier?.id};
      }
      if(style.role==='post'&&data.play===4){
        const side=support.y<285?-31:31;
        return {...relative(p.team,86,side),intent:'post'};
      }
      const spacing=style.arc>.86&&data.play===2;
      const depth=style.depth+(spacing?44:0);
      const lane=style.lane+(support.y-285)*(spacing?-.27:-.12);
      const choices=[relative(p.team,depth,lane),relative(p.team,depth+21,lane-29),
        relative(p.team,depth-19,lane+28),relative(p.team,depth+45,lane)];
      const merit=at=>openness(s,at,p.team)*.56+Math.min(70,room(s,at,p))*.70
        +passLane(s,support,at)*.45-distance(at,p)*.24-Math.abs(at.y-285-lane)*.42;
      return {...choices.reduce((best,at)=>merit(at)>merit(best)?at:best),intent:'space',lookId:carrier?.id};
    }

    function recover(s,p,data){
      const f=s.flight,shot=f.type==='shot';
      const board=shot||f.type==='rebound'||f.board;
      const spot=bounded(shot?{x:f.end.x-direction(f.team)*57,y:f.end.y}:f.end);
      if(data.pursuit?.flight!==f){
        const chosen=[0,1].map(team=>{
          const pool=roster(s,team).filter(q=>!(s.human&&q.id===0));
          const time=q=>distance(q,spot)/profile(q).speed-momentum(q,spot)*.14-(board?profile(q).boards*.15:0);
          return pool.sort((a,b)=>time(a)-time(b)).slice(0,2).map(q=>q.id);
        });
        data.pursuit={flight:f,chosen};
      }
      const [lead,support]=data.pursuit.chosen[p.team];
      if(p.id===lead)return {...spot,intent:board?'rebound':'recover',lookBall:true};
      if(p.id===support){
        return {...bounded({x:spot.x+direction(p.team)*(board?31:56),y:spot.y+(p.y<spot.y?-38:38)}),
          intent:board?'boxout':'support',lookBall:true};
      }
      const x=clamp(spot.x+direction(p.team)*(96+p.slot*31),court.x+51,court.x+court.w-51);
      return {...bounded({x,y:285+profile(p).lane*1.22}),intent:'outlet',lookBall:true};
    }

    function avoidTraffic(s,p,route){
      if(!['drive','break','cut','roll','outlet','show'].includes(route.intent))return route;
      const length=distance(p,route);
      if(length<54)return route;
      const x=(route.x-p.x)/length,y=(route.y-p.y)/length;
      let obstacle=null,nearest=66;
      for(const q of s.players){
        if(q===p)continue;
        const dx=q.x-p.x,dy=q.y-p.y,ahead=dx*x+dy*y;
        const offset=dx*y-dy*x;
        if(ahead>9&&ahead<nearest&&Math.abs(offset)<24){obstacle={q,offset};nearest=ahead;}
      }
      if(!obstacle)return route;
      const side=Math.abs(obstacle.offset)>5?Math.sign(obstacle.offset):profile(p).lane<0?-1:1;
      const turn=nearest*.58+24;
      const at=bounded({x:p.x+x*turn-y*side*34,y:p.y+y*turn+x*side*34});
      if(distance(at,obstacle.q)<25)return route;
      return {...route,...at};
    }

    function move(s,p){
      const data=state(s),style=profile(p),flight=s.flight;
      const receiving=flight?.type==='pass'&&flight.receiver===p.id;
      const pursuit=flight&&['shot','rebound','loose'].includes(flight.type);
      const token=receiving?'receive':pursuit?'pursuit':s.carrier===p.id?'ball'
        :s.possession===p.team?'attack':flight?.type==='pass'&&flight.released?'pass-defense':'defense';
      let plan=data.plans[p.id];
      if(!plan||plan.token!==token||(pursuit||receiving)&&plan.flight!==flight||s.elapsed>=plan.next){
        const target=receiving?receive(p,flight):pursuit?recover(s,p,data)
          :token==='ball'?drive(s,p,data):token==='attack'?getOpen(s,p,data):guard(s,p,data);
        const router=avoidTraffic(s,p,target);
        const delay=receiving?.09:['intercept','flank','contest'].includes(router.intent)?.12:(token==='ball'?.31:router.intent==='cut'?.30:0)
          +style.reaction*(.85+sample(s,p,Math.floor(s.elapsed*3))*.35);
        plan={...router,token,flight,next:s.elapsed+delay};
        data.plans[p.id]=plan;
      }
      const look=receiving?flight.from:plan.lookBall?s.ball:s.players[plan.lookId];
      const guarding=Boolean(look&&distance(p,plan)<74&&['press','mark','help','deny','boxout','contest'].includes(plan.intent));
      const hustle=['break','rebound','recover','cut','receive','intercept','roll','show'].includes(plan.intent);
      const adaptation=p.team===1?1+(s.difficulty-1)*.075:1;
      const pace=.87+(p.energy??1)*.13;
      return {...plan,look,speed:style.speed*adaptation*pace*(hustle?1.17:guarding?.79:1),
        stance:guarding?'guard':'idle',stride:style.stride};
    }

    function shotRead(s,p){
      const rim=goal(p.team),style=profile(p),range=distance(p,rim),open=pressure(s,p),value=shotValue(p);
      const dx=rim.x-p.x,dy=rim.y-p.y;
      const contest=roster(s,other(p.team)).some(q=>{
        const x=q.x-p.x,y=q.y-p.y;
        return Math.hypot(x,y)<53&&x*dx+y*dy>0&&Math.abs(x*dy-y*dx)<29*Math.max(1,range);
      });
      const skill=value===3?style.arc:style.rim;
      const space=clamp((open-31)*.0045,-.12,.14);
      const shot=clamp(.75+space+(skill-.68)*.27-Math.max(0,range-76)*.00155
        -Math.max(0,range-style.range)*.0021-(contest?.105:0)-(1-(p.energy??1))*.10,.09,.93);
      return {range,open,value,shot};
    }

    function passRead(s,p,data){
      const style=profile(p),rim=goal(p.team),reach=distance(p,rim);
      return roster(s,p.team).filter(q=>q!==p).map(q=>{
        const gap=distance(p,q),drift=clamp(gap/1600,.075,.23);
        const at=bounded({x:q.x+(q.vx||0)*drift,y:q.y+(q.vy||0)*drift});
        const route=Math.min(passLane(s,p,q),passLane(s,p,at)+7);
        const open=openness(s,at,p.team),near=distance(at,rim);
        const returnPass=s.lastPass?.from===q.id&&s.elapsed-s.lastPass.at<1.2;
        const ask=s.human&&q.id===0&&s.requestUntil>s.elapsed;
        const ready=['cut','post','roll','pop','break','show'].includes(data.plans[q.id]?.intent);
        const quality=shotRead(s,q);
        const useful=near<profile(q).range&&open>=34?quality.shot*quality.value*16:0;
        const merit=Math.min(72,route)*(.71+style.reads*.13)+Math.min(92,open)*.41
          +(reach-near)*(.16+style.reads*.12)-gap*.14+(ask?82:q.id===0&&s.human?17:0)
          +(ready?10+style.reads*11:0)+useful-(returnPass&&!ask?49:0);
        return {id:q.id,merit,route,gap,near,ask};
      }).filter(q=>q.gap>24&&q.gap<401&&q.route>13).sort((a,b)=>b.merit-a.merit)[0];
    }

    function decide(s,p){
      const style=profile(p),look=shotRead(s,p),data=state(s),pass=passRead(s,p,data);
      const deadline=Math.min(s.shotClock,s.clock),margin=s.score[p.team]-s.score[other(p.team)];
      const urgency=deadline<3.45;
      const needThree=margin<=-3&&s.clock<11;
      const grade=clamp(.43+look.shot*.44+(sample(s,p,12)-.5)*.13,.41,.91);
      const shoot={type:'shoot',grade};
      const release=look.range<111&&look.shot>.43||look.range<style.range&&look.shot>(look.value===3?.53:.58);
      const holdLead=margin>=1&&s.clock<14&&s.shotClock>s.clock+1&&look.range>108;
      if(deadline<1.18||urgency&&look.range<style.range+23&&(!needThree||look.value===3))return shoot;
      if(pass?.ask&&pass.route>22&&deadline>1.55)return {type:'pass',id:pass.id};
      if(release&&!holdLead&&(!needThree||look.value===3||s.clock>5)&&s.age>.55)return shoot;
      const pressured=look.open<35&&pass?.merit>39;
      const creating=pass?.near<look.range-42&&pass.merit>49+Math.max(0,s.passes-3)*6;
      const swing=s.age>2.4&&s.passes<4&&pass?.merit>65-style.reads*7;
      if(pass&&deadline>1.55&&(pressured||creating||swing))return {type:'pass',id:pass.id};
      return {type:'hold',delay:style.reaction*(urgency?.64:1.12)+.07};
    }

    function condition(p,dt,active){
      const style=profile(p),pace=Math.hypot(p.vx||0,p.vy||0)/style.speed;
      const work=active&&pace>.69;
      const net=work?-(.014-style.stamina*.009)*(pace-.38):active?.0035:.019;
      p.energy=clamp((p.energy??1)+dt*net,.64,1);
    }

    function challenge(s,carrier,dt,random){
      if(s.ball.z>19||s.cooldown>0||s.age<.75)return null;
      const hx=s.ball.x-carrier.x,hy=s.ball.y-carrier.y,offset=Math.hypot(hx,hy);
      const defender=roster(s,other(carrier.team)).filter(p=>{
        if(s.human&&p.id===0||p.hold>0||(p.stealAfter||0)>s.elapsed)return false;
        const reach=25+profile(p).press*8;
        const side=(p.x-carrier.x)*hx+(p.y-carrier.y)*hy;
        return distance(p,carrier)<reach&&distance(p,s.ball)<reach+3&&(offset<7||side>=-5*offset);
      }).sort((a,b)=>distance(a,s.ball)-distance(b,s.ball))[0];
      if(!defender)return null;
      if(defender.intent==='contest'&&s.ball.z<13&&distance(defender,s.ball)<=26)return defender;
      const impulse=dt*(.32+profile(defender).press*.84)*(s.shotMeter!==null?1.45:1);
      return random(s)<impulse?defender:null;
    }

    function reaction(s,row,index){
      const [, , ,x,y,role]=row;
      const number=index*239;
      const side=index===3||index===4?0:index===5||index===6?1:index%2;
      const winner=s.lastScorer===undefined?-1:Math.floor(s.lastScorer/5);
      const age=s.elapsed-(s.scoredAt??-20)-noise(number)*.49;
      const celebrate=age>=0&&age<.73+noise(number+10)*.63&&winner===side
        ||s.status==='final'&&s.score[side]>s.score[other(side)];
      const window=2.1+noise(number+21)*2.8;
      const beat=(s.elapsed/window+noise(number+97))%1;
      const sway=Math.sin(beat*Math.PI*2);
      if(role==='coach'){
        const active=s.status==='play'&&s.possession===0;
        return {x:x+(active?clamp((s.ball.x-480)*.061,-24,24):sway*7),y,
          pose:celebrate?'cheer':'work',phase:(s.elapsed*.67)%1};
      }
      if(role==='table'){
        const record=age>=-.2&&age<1.9||s.status!=='play';
        return {x,y,pose:record?'work':'idle',phase:(s.elapsed*.81+.21)%1};
      }
      return {x:x+sway*(role==='cheer'?5:2.4),y:y+(celebrate?-2.5:0)+sway*.8,
        pose:celebrate?'cheer':'idle',phase:celebrate?(s.elapsed*.94+index*.23)%1:beat};
    }

    return {move,decide,challenge,reaction,profile,condition,shotRead,tactic:s=>plays[state(s).play]};
  }

  window.V.BasketballAI={create};
});
