
"use strict";

globalThis.QuimiCraftPlantModels=(()=>{
  const leafTile=222,pigment=223,wood=196,grain=199,glow=208;
  const green=[1.14,1.13,.92],lime=[1.31,1.27,.83],shade=[.74,.90,.78],stem=[.86,1.04,.79];
  const ivory=[1.14,1.10,.96],orange=[1.33,.355,.069],orangeLight=[1.47,.516,.12],beanPod=[.45,.71,.31];
  const rings=[.31,1.84,3.36,4.91,5.72];
  const vec=(x,y,z,a,r)=>[x+Math.cos(a)*r,y,z+Math.sin(a)*r];
  const between=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const goldenAngle=2.399963;
  function blade(p,a,b,width,depth,color=green,tile=leafTile){
    const [dx,dy,dz]=b.map((v,i)=>v-a[i]),len=Math.hypot(dx,dz)||1;
    const center=a.map((v,i)=>v+(b[i]-v)*.48),side=Math.abs(dx)+Math.abs(dz)>.002?[-dz/len,0,dx/len]:[1,0,0];
    const left=center.map((v,i)=>v+side[i]*width),right=center.map((v,i)=>v-side[i]*width);
    const ridge=[center[0]+dx*.045,center[1]+depth,center[2]+dz*.045];
    const under=[center[0],center[1]-depth*.64,center[2]];
    const tint=f=>color.map(v=>v*f);
    p.add([a,left,ridge,right],tile,tint(1.04));
    p.add([ridge,left,b,right],tile,color);
    p.add([a,right,under,left],tile,tint(.75));
    p.add([under,right,b,left],tile,tint(.72));
  }
  function orchardLeaf(p,a,b,width,color,scallop=false){
    const dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz);
    const rows=[[.22,.67],[.45,1],[.69,scallop?.69:.79],[.86,.38]];
    const spine=[a,...rows.map(([t])=>[
      a[0]+dx*t,a[1]+(b[1]-a[1])*t+Math.sin(t*Math.PI)*width*.31,a[2]+dz*t
    ]),b];
    const tint=f=>color.map(v=>v*f);
    for(const side of [-1,1]){
      const flank=[a,...rows.map(([t,w],i)=>[
        spine[i+1][0]-side*dz/len*width*w,spine[i+1][1]-width*w*.31,spine[i+1][2]+side*dx/len*width*w
      ]),b];
      for(let i=0;i<spine.length-1;i++){
        const face=[spine[i],flank[i],flank[i+1],spine[i+1]];
        if(i===0)face.splice(1,1);
        if(i===spine.length-2)face.splice(2,1);
        if(side<0)face.reverse();
        const reverse=[...face].reverse();
        if(face.length===3){face.push(face[2]);reverse.push(reverse[2])}
        p.add(face,leafTile,tint(side>0?1.06:.91));
        p.add(reverse,leafTile,tint(.74));
      }
    }
  }
  function berry(p,x,y,z,r,tint,tile=pigment){
    if(r<.053){
      p.shell([[x,y-r*.69,z,r*.56,r*.53],[x,y,z,r,r],[x,y+r*.67,z,r*.51,r*.48]],tile,tile,4,.38,undefined,tint);
      return;
    }
    p.shell([[x,y-r*.86,z,r*.43,r*.45],[x,y-r*.41,z,r,r],[x,y+r*.43,z,r*.91,r*.89],
      [x,y+r*.82,z,r*.45,r*.43]],tile,tile,6,.24,undefined,tint);
  }
  function rosette(p,x,y,z,reach,height,amount,color=green){
    for(let i=0;i<amount;i++){
      const angle=rings[i%rings.length]+Math.floor(i/rings.length)*.66,outer=reach*(.85+.15*Math.sin(i*2.81));
      blade(p,[x,y,z],vec(x,y+height*(.75+(i%3)*.19),z,angle,outer),reach*(.25+(i%2)*.045),.027,i%2?color:lime);
    }
  }
  function head(p,x,y,z,size,petals,tint,core,{cup=false,shape="round",double=false}={}){
    for(let i=0;i<petals;i++){
      const a=i*Math.PI*2/petals+.21,base=vec(x,y,z,a,size*.19);
      const lift=cup?size*.47:shape==="orchid"&&i===3?-size*.30:size*.18;
      const end=vec(x,y+lift,z,a,size*(shape==="orchid"&&i%2?.83:1.22));
      blade(p,base,end,size*(shape==="star"?.22:shape==="orchid"?.44:.39),size*.126,
        i%3===0?tint.map(v=>v*1.11):tint,pigment);
      if(double){
        const inner=vec(x,y+size*.29,z,a+.33,size*.79);
        blade(p,[x,y+size*.09,z],inner,size*.257,size*.088,tint.map(v=>v*1.045),pigment);
      }
    }
    p.shell([[x,y-.014,z,size*.27,size*.27],[x,y+size*.09,z,size*.38,size*.38],[x,y+size*.23,z,size*.30,size*.30]],
      pigment,pigment,6,.3,undefined,core);
    for(let i=0;i<4;i++)berry(p,...vec(x,y+size*.24,z,i*1.57,size*.22),size*.066,[1.32,1.07,.45]);
  }
  function stemFlower(p,spec){
    const {x=.5,z=.5,y=.59,size=.19,petals=6,tint,core,shape,cup,double}=spec;
    const bend=[x+.021,y*.62,z-.031],top=[x,y,z];
    p.rod([.5,.015,.5],bend,.018,leafTile,leafTile,4,stem);
    p.rod(bend,top,.013,leafTile,leafTile,4,green);
    for(let i=0;i<3;i++){
      const h=y*(.24+i*.16),angle=rings[i]+z*.18;
      blade(p,[x,h,z],vec(x,h+.11,z,angle,.22-i*.028),.070-i*.006,.021,i%2?lime:green);
    }
    head(p,...top,size,petals,tint,core,{shape,cup,double});
  }
  function lavender(p){
    for(const [x,z,h] of [[.48,.51,.82],[.31,.55,.65],[.68,.39,.59],[.58,.71,.69]]){
      p.rod([.49,.016,.51],[x,h-.13,z],.014,leafTile,leafTile,4,green);
      for(let i=0;i<2;i++)blade(p,[x,.137+i*.13,z],vec(x,.24+i*.13,z,rings[i]+z,.19),.038,.012,stem);
      for(let i=0;i<5;i++){
        const y=h-.235+i*.049,spread=.076-i*.009;
        const tint=i%2?[.86,.52,1.02]:[.66,.40,.99];
        p.shell([[x,y-.018,z,spread*.50,spread*.47],[x,y,z,spread,spread*.86],
          [x,y+.034,z,spread*.63,spread*.58]],pigment,pigment,6,i*.37,undefined,tint);
      }
    }
  }
  function lily(p){
    const leaves=[[.5,.066,.50,.346,.282],[.5,.10,.50,.354,.294],[.5,.131,.50,.322,.271]];
    p.shell(leaves,leafTile,leafTile,10,.31,undefined,[1.01,1.19,.83]);
    for(let i=0;i<5;i++){
      const angle=i*1.23+.16;
      blade(p,[.50,.132,.5],vec(.5,.136,.50,angle,.296),.028,.012,[1.4,1.26,.93]);
    }
    head(p,.625,.156,.49,.154,9,[1.22,.61,.88],[1.26,1.12,.45],{cup:true,double:true});
  }
  function fern(p){
    for(let k=0;k<4;k++){
      const a=rings[k],root=[.5,.023,.5],middle=vec(.5,.36,.5,a,.17),end=vec(.5,.49,.5,a,.377);
      p.rod(root,middle,.014,leafTile,leafTile,4,green);
      p.rod(middle,end,.010,leafTile,leafTile,4,green);
      for(let i=0;i<4;i++){
        const h=.203+i*.066,o=vec(.5,h,.5,a,.09+i*.063);
        for(const dir of [-1,1]){
          const reach=.147-i*.019;
          blade(p,o,vec(o[0],h+.039,o[2],a+dir*.87,reach),.048-i*.006,.015,dir===1?green:lime);
        }
      }
    }
  }
  function grass(p){
    for(let i=0;i<9;i++){
      const a=i*2.399+.2,root=vec(.5,.006,.5,a,.05+(i%3)*.028);
      blade(p,root,vec(.5,.30+(i%4)*.082,.5,a,.19+(i%3)*.047),.032+(i%3)*.012,.016,i%3===0?shade:i%3===1?green:lime);
    }
  }
  function reed(p,reeds,h,color,kind){
    for(let i=0;i<reeds;i++){
      const a=i*2.4,c=vec(.5,0,.5,a,.045+(i%3)*.075),end=vec(c[0],h*(.63+(i%4)*.11),c[2],a,.11);
      p.rod(c,end,.016,leafTile,leafTile,4,color);
      for(let j=0;j<2;j++){
        const from=[c[0],h*(.23+j*.21),c[2]];
        blade(p,from,vec(from[0],from[1]+.117,from[2],a+(j===0?.4:-.72),.224-j*.027),.039,.017,j?shade:color);
      }
      if(kind==="rice"||kind==="rust"){
        const top=vec(end[0],end[1]+.13,end[2],a,.065);
        p.rod(end,top,.012,pigment,pigment,4,kind==="rice"?[1.13,1,.58]:[.91,.50,.26]);
        for(let j=0;j<3;j++)berry(p,...vec(end[0],end[1]+j*.052,end[2],a+j*.53,.058),.039,kind==="rice"?[1.17,.96,.53]:[.94,.53,.31]);
      }
      if(kind==="salt"||kind==="calcium")berry(p,...end,.040,kind==="salt"?[1.08,1.03,.88]:[1.12,1.09,.61]);
    }
  }
  function carrotRoot(p,x,z,tip,top,r,tilt=0){
    const local=(y,dx,width)=>[x+dx*tilt,y,z,width,width*.917];
    const tall=top-tip;
    p.shell([local(tip,-.55,r*.07),local(tip+tall*.20,-.34,r*.32),
      local(tip+tall*.61,-.13,r*.76),local(tip+tall*.84,0,r),
      local(top,.06,r*.85)],pigment,pigment,8,.39,undefined,orange);
    for(const [height,side] of [[.64,-1],[.85,1]]){
      const y=tip+tall*height;
      p.rod([x-.028,y,z+side*r*.79],[x+.027,y+.015,z+side*r*.85],.007,pigment,pigment,4,orangeLight);
    }
    return [x+.06*tilt,top,z];
  }
  function carrotLeaves(p,x,y,z,len,scale){
    for(let i=0;i<4;i++){
      const a=rings[i],end=vec(x,y+len*(.88+(i%3)*.10),z,a,.18*scale);
      p.rod([x,y,z],end,.012*scale,leafTile,leafTile,4,green);
      for(let j=0;j<3;j++){
        const t=.36+j*.19,at=[x+(end[0]-x)*t,y+(end[1]-y)*t,z+(end[2]-z)*t];
        for(const dir of [-1,1])blade(p,at,vec(at[0],at[1]+.047,at[2],a+dir*.86,scale*(.122-j*.018)),.036*scale,.013,i%2?lime:green);
      }
    }
  }
  function carrots(p,phase,wild=false){
    if(phase===0){rosette(p,.5,.011,.5,.245,.245,4,green);return}
    const bunch=phase===1?[[.50,.47,.17,.073,.36]]:wild?[[.5,.53,.31,.112,.53],[.70,.40,.23,.069,.44]]:
      [[.37,.46,.34,.112,.56],[.68,.59,.28,.095,.49]];
    for(const [x,z,depth,r,h] of bunch){
      const [bx,y,bz]=carrotRoot(p,x,z,-depth,phase===1?.015:.036,r,.112);
      carrotLeaves(p,bx,y,bz,h,phase===1?.76:.96);
    }
  }
  function wheat(p,phase,wild=false){
    const count=[3,4,5][phase],h=[.27,.51,wild?.72:.84][phase];
    for(let i=0;i<count;i++){
      const angle=i*2.40,at=vec(.5,.010,.5,angle,.063+i*.022);
      const top=vec(at[0],h*(.82+(i%3)*.08),at[2],angle,.092);
      const dry=phase===2;
      p.rod(at,top,.014,dry?pigment:leafTile,undefined,4,dry?[1.03,.84,.46]:green);
      for(let j=0;j<2;j++)blade(p,[at[0],h*(.18+j*.28),at[2]],vec(at[0],h*(.40+j*.28),at[2],angle+.69+j,.17),
        .037,.017,dry?[.99,.94,.69]:lime,dry?pigment:leafTile);
      if(phase<2)continue;
      for(let j=0;j<3;j++)for(const side of [-1,1]){
        const y=top[1]-.113+j*.054,x=top[0]+side*(.031-j*.006),z=top[2]+(j%2)*.018;
        berry(p,x,y,z,.040,[1.24,1.02,.51]);
        if(j===2)blade(p,[x,y,z],[x+side*.018,y+.067,z],.009,.005,[1.21,1,.56],pigment);
      }
    }
  }
  function beans(p,phase,wild=false){
    const h=[.255,.49,wild?.66:.76][phase];
    for(const [x,z,tilt] of [[.43,.52,-.17],[.61,.53,.16]]){
      const a=[x,.012,z],mid=[x+tilt*.31,h*.53,z-.065],tip=[x+tilt*.62,h,z+.042];
      p.rod(a,mid,.017,leafTile,leafTile,4,stem);p.rod(mid,tip,.014,leafTile,leafTile,4,green);
      for(let j=0;j<3;j++){
        const o=[x+tilt*j*.19,h*(.29+j*.21),z],angle=rings[j]+tilt;
        for(const k of [-1,1])blade(p,o,vec(o[0],o[1]+.09,z,angle+k*.49,.16-j*.013),.069-j*.008,.027,j===1?lime:green);
      }
      if(phase===1)head(p,tip[0],tip[1],tip[2],.072,5,[1.15,.94,1.18],[1.28,1.06,.58]);
      if(phase===2){
        for(let q=0;q<2;q++){
          const pod=[tip[0]+(q?-.088:.092),h*.74,tip[2]+(q?.089:-.056)];
          p.rod([tip[0],h*.87,tip[2]],pod,.010,leafTile,leafTile,4,stem);
          p.shell([[pod[0]+.048,pod[1]-.20,pod[2],.015,.018],[pod[0]+.045,pod[1]-.151,pod[2],.041,.030],
            [pod[0]+.012,pod[1]-.074,pod[2],.043,.031],[pod[0],pod[1],pod[2],.027,.023]],pigment,pigment,6,.33,undefined,beanPod);
        }
      }
    }
  }
  function mushroom(p,{tint,glowing=false,cap=.20,height=.39}){
    for(const [x,z,scale] of [[.45,.54,1],[.70,.43,.62],[.27,.65,.52]]){
      const h=height*scale,r=cap*scale,t=glowing?glow:pigment;
      p.shell([[x,.014,z,r*.21,r*.19],[x+.013,h*.34,z,r*.18,r*.19],[x,h*.67,z,r*.28,r*.23]],pigment,pigment,6,.22,undefined,[.95,.89,.76]);
      p.shell([[x,h*.59,z,r*.69,r*.68],[x,h*.73,z,r,r],[x+.013,h*.93,z,r*.74,r*.75],
        [x+.015,h*1.08,z,r*.27,r*.26]],t,pigment,8,.39,undefined,tint);
      for(let i=0;i<5;i++){
        const place=vec(x,h*(i%2?.94:.84),z,i*2.4+.3,r*(i%2?.50:.78));
        berry(p,...place,r*.116,glowing?[1,1.16,1.13]:[1.08,.96,.80],t);
      }
    }
  }
  function lichen(p,cold){
    const tones=cold?[[.56,1.04,1.31],[.73,1.20,1.40]]:[[1,.81,.41],[1.14,1.02,.64]];
    for(let i=0;i<9;i++){
      const a=i*2.40,x=.5+Math.cos(a)*(.092+i*.027),z=.5+Math.sin(a)*(.092+i*.027),r=.071+(i%3)*.016;
      p.shell([[x,.013,z,r*.69,r*.75],[x,.041+(i%3)*.021,z,r,r*.83],[x,.094+(i%2)*.021,z,r*.66,r*.72]],
        pigment,pigment,6,a,undefined,tones[i%2]);
    }
  }
  function shrub(p,color,fruit,kind){
    const cacao=kind==="cacao",cherry=kind==="cherry",count=cacao?5:6;
    for(let i=0;i<count;i++){
      const a=.29+goldenAngle*i,base=vec(.5,.018,.5,a,.045);
      const joint=vec(.5,.25+i%3*.048,.5,a,.11),tip=vec(.5,.48+(i%3)*.090,.5,a,.26+i%2*.03);
      p.rod(base,joint,.022,wood,wood,5);
      p.rod(joint,tip,.015,wood,wood,5);
      for(const side of [-1,1]){
        const fork=between(joint,tip,side<0?.38:.70),az=a+side*(cacao?.66:.94);
        const twig=vec(fork[0],fork[1]+.045,fork[2],az,cacao?.142:.106);
        p.rod(fork,twig,.007,wood,wood,4);
        for(let j=0;j<3;j++){
          const at=between(fork,twig,(j+1)/3),dir=az+(j%2?.84:-.74);
          orchardLeaf(p,at,vec(at[0],at[1]+.022+j*.013,at[2],dir,cacao?.15:.12),cacao?.052:.040,j%2?color:lime,!cacao);
        }
        if(cacao){
          if(side<0&&i%2===0){
            const at=vec(joint[0],joint[1]-.056,joint[2],a,.055),[x,y,z]=at;
            p.rod(joint,[x,y+.083,z],.010,wood,wood,4);
            fruitBody(p,x,y,z,.073,fruit,[[-1.34,.27],[-.86,.68],[-.36,1],[.47,.77],[1.20,.21]],10);
          }
        }else{
          const bunch=cherry?2:kind==="alpine"?3:4;
          for(let j=0;j<bunch;j++){
            const r=cherry?.033:j===0?.030:.024;
            const at=vec(twig[0],twig[1]-.041-j%2*.036,twig[2],a+j*1.9,.036+j*.009);
            p.rod(twig,[at[0],at[1]+r*.54,at[2]],.0045,leafTile,leafTile,4,stem);
            berry(p,...at,r,j%3===0?fruit.map((v,k)=>v*(k===0?1.1:.91)):fruit);
          }
        }
      }
    }
  }
  function cactus(p,bamboo=false){
    const color=bamboo?[1.21,1.28,.76]:[.89,1.12,.87];
    for(const [x,z,r] of bamboo?[[.43,.51,.105],[.65,.62,.075]]:[[.5,.5,.232]]){
      const stem=[[x,0,z,r,r],[x,.49,z,r*1.03,r],[x,1,z,r*.95,r*.98]];
      p.shell(stem,leafTile,leafTile,bamboo?6:8,.39,undefined,color);
      for(const y of bamboo?[.20,.56,.91]:[.27,.58,.88]){
        if(bamboo)p.shell([[x,y,z,r*1.10,r*1.1],[x,y+.03,z,r*1.12,r*1.1]],leafTile,leafTile,6,.39,undefined,[.67,.98,.69]);
        for(const a of [1.25,3.67]){
          if(bamboo&&y>.2)blade(p,vec(x,y,z,a,r),vec(x,y+.10,z,a,.205),.048,.019,lime);
          if(!bamboo)blade(p,vec(x,y,z,a,r*.99),vec(x,y+.034,z,a,r+.059),.009,.006,[1.05,.96,.61],pigment);
        }
      }
    }
  }
  function succulent(p,agave){
    if(agave){
      rosette(p,.5,.023,.5,.406,.36,8,[.84,1.08,.92]);
      for(let i=0;i<4;i++){const a=rings[i];blade(p,[.5,.036,.5],vec(.5,.61-i*.063,.5,a,.233),.064,.024,[.92,.54,.59],pigment)}
    }else{
      const pads=[[[.5,.02,.50],[.50,.49,.50],.129],[[.47,.25,.50],[.29,.59,.54],.087],
        [[.54,.35,.49],[.71,.68,.47],.094],[[.32,.50,.54],[.23,.76,.66],.070],[[.68,.59,.47],[.78,.84,.39],.071]];
      for(const [i,[from,to,r]] of pads.entries()){
        const tint=i%2?lime:green;
        const layers=[[0,.31],[.26,.81],[.60,1],[.86,.83],[1,.39]].map(([t,w])=>{
          const [x,y,z]=between(from,to,t);
          return [x,y,z,r*w,r*w*.52];
        });
        p.shell(layers,leafTile,leafTile,8,.40,undefined,tint);
        for(let j=0;j<4;j++){
          const [x,y,z]=between(from,to,.28+j*.16);
          for(const side of [-1,1])berry(p,x+(j%2-.5)*r*.72,y,z+side*r*.48,.008,[1.16,.92,.60]);
        }
        if(i>0)for(const offset of [-.023,.025]){
          fruitBody(p,to[0]+offset,to[1]+.021,to[2],.029,[1.17,.32,.48],[[-.95,.35],[-.34,.75],[.48,1],[.95,.61]],6);
        }
      }
    }
  }
  function pine(p){
    p.shell([[.50,.032,.50,.116,.113],[.50,.095,.50,.189,.166],[.50,.297,.50,.144,.142],[.50,.45,.50,.026,.023]],
      wood,wood,8,.19);
    for(let row=0;row<4;row++)for(let i=0;i<5;i++){
      const a=i*1.25+row*.44,y=.11+row*.076,r=.155-row*.028;
      blade(p,vec(.5,y-.04,.5,a,r*.72),vec(.5,y+.036,.5,a,r+.061),.050-row*.006,.021,[.83,.62,.47],pigment);
    }
  }
  function jacaranda(p){
    const colors=[[.79,1.09,.80],[.99,.74,1.14],[1.07,.83,1.23]];
    for(const [x,y,z,r] of [[.40,.34,.39,.286],[.62,.58,.56,.296],[.38,.71,.6,.207],[.52,.48,.30,.229]]){
      berry(p,x,y,z,r,colors[0],leafTile);
      for(let i=0;i<3;i++)head(p,...vec(x,y+r*.66,z,i*2.14,r*.61),.075,5,colors[1+i%2],[1.25,1.04,.61]);
    }
  }
  const cream=[1.17,1.15,1.04],golden=[1.38,1.03,.30],pink=[1.24,.53,.83],red=[1.33,.28,.29];
  const grapePurple=[.58,.36,.82],jabuticabaPurple=[.34,.22,.45],citrus=[.67,.96,.24];
  function fruitBody(p,x,y,z,r,tint,profile,sides=8,orient){
    p.shell(profile.map(([h,w,d=w])=>[x,y+h*r,z,r*w,r*d]),pigment,pigment,sides,.31,orient,tint);
  }
  function strawberryFruit(p,x,y,z,r){
    fruitBody(p,x,y,z,r,red,[[-1.12,.12],[-.68,.49],[-.05,.89],[.55,1],[.84,.70]]);
    for(let i=0;i<5;i++){
      const a=i*1.26+.1;
      blade(p,[x,y+r*.81,z],vec(x,y+r*.62,z,a,r*.88),r*.19,.008,green);
      const h=i%2?.32:-.30,reach=r*(i%2?.98:.73);
      berry(p,...vec(x,y+r*h,z,a+.36,reach),r*.082,golden);
    }
  }
  function pitayaFruit(p,x,y,z,r){
    fruitBody(p,x,y,z,r,[1.30,.30,.67],[[-1.14,.27],[-.57,.84],[.24,1],[.88,.76],[1.28,.30]]);
    for(let i=0;i<6;i++){
      const a=i*1.05+.39,h=i%2?.40:-.40;
      const start=vec(x,y+r*(h-.29),z,a,r*.81),tip=vec(x,y+r*(h+.73),z,a,r*1.19);
      blade(p,start,tip,r*.29,.013,i%2?lime:[1.24,.39,.62]);
    }
  }
  function blackberryFruit(p,x,y,z,r){
    for(let level=0;level<3;level++)for(let i=0;i<3+level%2;i++){
      const size=r*(level===0?.43:.50),a=i*Math.PI*2/(3+level%2)+level*.79;
      berry(p,...vec(x,y+r*(level*.57-.58),z,a,r*(level===0?.29:.49)),size,
        i%2?[.39,.21,.49]:[.48,.27,.57]);
    }
  }
  function acerolaFruit(p,x,y,z,r){
    const lobes=([px,py,pz])=>{
      const dx=px-x,dz=pz-z,scale=.91+.10*Math.cos(Math.atan2(dz,dx)*3);
      return [x+dx*scale,py,z+dz*scale];
    };
    fruitBody(p,x,y,z,r,[1.29,.18,.14],[[-.67,.50],[-.43,.91],[.14,1],[.60,.81],[.69,.39]],12,lobes);
    p.rod([x,y+r*.58,z],[x+r*.12,y+r*.92,z],r*.070,leafTile,leafTile,4,stem);
  }
  function limeFruit(p,x,y,z,r){
    fruitBody(p,x,y,z,r,citrus,[[-1.22,.15],[-.84,.57],[-.35,.94],[.43,1],[.99,.57],[1.14,.17]]);
    blade(p,[x,y+r*1.08,z],[x+r*.68,y+r*1.30,z+r*.13],r*.20,.014,green);
  }
  function pomegranateFruit(p,x,y,z,r){
    const tint=[1.13,.22,.37];
    fruitBody(p,x,y,z,r,tint,[[-1,.33],[-.69,.77],[.09,1],[.66,.84],[.85,.39]]);
    for(let i=0;i<5;i++){
      const a=i*1.26+.3;
      blade(p,vec(x,y+r*.79,z,a,r*.24),vec(x,y+r*1.22,z,a,r*.47),r*.145,.011,[1.17,.42,.34],pigment);
    }
  }
  function grapeFruit(p,x,y,z,r){
    for(const [h,spread,count] of [[.52,.51,4],[-.04,.34,3],[-.59,0,1]]){
      for(let i=0;i<count;i++)berry(p,...vec(x,y+h*r,z,i*6.283/count+h,spread*r),r*.46,i%2?grapePurple:[.71,.45,.97]);
    }
    p.rod([x,y+r*.64,z],[x+.02,y+r*1.15,z],r*.088,wood,wood,4);
  }
  function starfruit(p,x,y,z,r){
    const ridge=([px,py,pz])=>{
      const dx=px-x,dz=pz-z,w=Math.cos(5*(Math.atan2(dz,dx)-.31))>0?1:.52;
      return [x+dx*w,py,z+dz*w];
    };
    fruitBody(p,x,y,z,r,golden,[[-1.26,.22],[-.85,.68],[0,1],[.86,.72],[1.29,.20]],10,ridge);
  }
  function strawberryPlant(p,phase){
    const size=[.53,.84,1][phase],height=[.19,.32,.39][phase],base=[.5,.02,.5];
    for(let i=0;i<[3,5,8][phase];i++){
      const a=.19+i*goldenAngle,top=vec(.5,height*(.76+(i%4)*.11),.5,a,size*(.13+i%3*.036));
      const bend=vec(.5,top[1]*.60,.5,a+.21,size*.076);
      p.rod(base,bend,.010,leafTile,leafTile,4,stem);
      p.rod(bend,top,.009,leafTile,leafTile,4,stem);
      for(const spread of [-.77,0,.77]){
        orchardLeaf(p,top,vec(top[0],top[1]+size*.043,top[2],a+spread,size*(spread?.14:.174)),.054*size,i%2?lime:green,true);
      }
      if(phase&&i<(phase===1?4:6)){
        const at=vec(.5,phase===1?.215:.111+(i%3)*.041,.5,a+.24,size*(.22+i%2*.052));
        const r=.052+i%3*.007;
        p.rod(bend,[at[0],at[1]+(phase===2?r*.78:0),at[2]],.006,leafTile,leafTile,4,stem);
        if(phase===1)head(p,...at,.057,5,cream,golden);
        else strawberryFruit(p,...at,r);
      }
    }
  }
  function cladode(p,from,to,width){
    p.rod(from,to,width*.38,leafTile,leafTile,6,green);
    for(const a of [.42,2.51,4.61]){
      const middle=from.map((v,i)=>(v+to[i])*.5);
      blade(p,from,vec(middle[0],middle[1],middle[2],a,width),width*.23,.024,lime);
      blade(p,to,vec(middle[0],middle[1],middle[2],a,width),width*.23,.024,green);
    }
  }
  function pitayaPlant(p,phase,wild=false){
    const h=[.43,.69,.89][phase],trunk=[.48,.02,.49],fork=[.49,h*.67,.48];
    if(!wild)p.rod([.55,0,.56],[.55,.49,.56],.039,wood);
    cladode(p,trunk,fork,.102);
    for(let i=0;i<[1,3,5][phase];i++){
      const a=.28+i*goldenAngle,elbow=vec(.49,h-(i%3)*.047,.48,a,.14),tip=vec(.49,h*(.69+i%2*.058),.48,a,phase===0?.14:.31+i%3*.022);
      cladode(p,fork,elbow,.086);
      cladode(p,elbow,tip,.083);
      if(phase&&i%2===0){
        const at=between(elbow,tip,.55);
        cladode(p,at,vec(at[0],tip[1]-.093,at[2],a+.73,.105),.043);
      }
      if(phase===1)head(p,...tip,.098,8,cream,golden,{cup:true,shape:"star"});
      if(phase===2&&i!==4)pitayaFruit(p,tip[0],tip[1]-.065,tip[2],.075+i%3*.008);
    }
  }
  function bramble(p,phase){
    const h=[.27,.53,.74][phase],n=[2,4,6][phase];
    for(let i=0;i<n;i++){
      const a=.14+i*goldenAngle,base=vec(.5,.018,.5,a,.025),bend=vec(.5,h*(.84+i%3*.07),.5,a,.127+i%3*.029);
      const tip=vec(.5,h*(.70+i%3*.066),.5,a,.176+i%3*.046);
      p.rod(base,bend,.012,wood);
      p.rod(bend,tip,.009,wood);
      for(let j=1;j<=3;j++){
        const at=between(base,bend,j*.25+.12),side=j%2?1:-1,az=a+side*.79;
        const twig=vec(at[0],at[1]+.052,at[2],az,.071);
        p.rod(at,twig,.005,wood,wood,4);
        for(const turn of [-.57,.54])orchardLeaf(p,twig,vec(twig[0],twig[1]+.022,twig[2],az+turn,.106),.040,j%2?green:lime,true);
      }
      if(phase===1)head(p,...tip,.068,5,cream,golden);
      if(phase===2)for(let j=0;j<2;j++){
        const at=vec(tip[0],tip[1]-.044-j*.023,tip[2],a+(j===0?-.53:1.06),.034);
        p.rod(tip,[at[0],at[1]+.027,at[2]],.0045,leafTile,leafTile,4,stem);
        blackberryFruit(p,...at,.042+j*.006);
      }
    }
  }
  function grapevine(p,phase,wild=false){
    const h=[.42,.66,.90][phase],base=[.49,.018,.51],mid=[.56,h*.47,.50],fork=[.45,h*.83,.49];
    if(!wild){
      for(const x of [.20,.80])p.rod([x,0,.58],[x,.455,.58],.030,wood);
      p.rod([.19,.28,.58],[.81,.28,.58],.017,wood);
      p.rod([.19,.442,.58],[.81,.442,.58],.017,wood);
    }
    p.rod(base,mid,.026,wood);
    p.rod(mid,fork,.019,wood);
    for(const side of [-1,1]){
      const tip=[.49+side*(phase?.24:.13),h,.47+side*.053];
      p.rod(fork,tip,.010,wood);
      for(let i=0;i<[2,3,4][phase];i++){
        const at=between(fork,tip,.27+i*.235),az=i%2?1.1:-1.05;
        const node=vec(at[0],at[1]-.036,at[2],az,.084+i%2*.020);
        p.rod(at,node,.007,leafTile,leafTile,4,stem);
        for(const fan of [-.60,.04,.67])orchardLeaf(p,node,vec(node[0],node[1]+.018,node[2],az+fan,.111+Math.abs(fan)*.054),
          .040+i%2*.008,i%2?lime:green,true);
        if(!phase||i>2)continue;
        const hanging=[node[0]+side*.02,node[1]-.128-i%2*.032,node[2]];
        p.rod(node,[hanging[0],hanging[1]+.035,hanging[2]],.007,leafTile,leafTile,4,stem);
        if(phase===1)head(p,...hanging,.046,5,[.85,1.06,.63],golden);
        else grapeFruit(p,...hanging,.065+i%2*.016);
      }
    }
  }
  const fruitTrees={
    JABUTICABA:{fruit:(p,x,y,z,r)=>berry(p,x,y,z,r,jabuticabaPurple),leaf:[.70,1.12,.79],flower:cream,fruitOnTrunk:true,height:.91,reach:.30,leafSize:.135,fruitSize:.025},
    ACEROLA:{fruit:acerolaFruit,leaf:[.84,1.14,.82],flower:pink,height:.78,reach:.31,leafSize:.118,fruitSize:.029,clusters:3},
    LIME:{fruit:limeFruit,leaf:[.79,1.05,.60],flower:cream,height:.90,reach:.26,leafSize:.143,fruitSize:.052,clusters:2},
    POMEGRANATE:{fruit:pomegranateFruit,leaf:[.65,1.08,.63],flower:[1.31,.38,.22],height:.97,reach:.27,leafSize:.109,fruitSize:.071,clusters:1},
    STARFRUIT:{fruit:starfruit,leaf:[1.04,1.18,.63],flower:pink,height:.93,pinnate:true,reach:.31,leafSize:.145,fruitSize:.050,clusters:2}
  };
  function orchardTree(p,phase,tree){
    const h=tree.height*[.39,.76,1][phase],reach=tree.reach*[.49,.80,1][phase];
    const base=[.5,.01,.5],fork=[.506,h*.49,.51],knuckle=[.481,h*.70,.49],top=[.50,h*.97,.51];
    p.rod(base,fork,phase===0?.024:.042,wood,wood,6,tree.fruitOnTrunk?[1.06,.87,.78]:undefined);
    p.rod(fork,knuckle,phase===0?.018:.032,wood);
    p.rod(knuckle,top,phase===0?.012:.020,wood);
    for(let i=0;i<3;i++){
      const root=vec(.5,.018,.5,rings[i],.056+phase*.021);
      p.rod(root,[.501,h*.16,.503],.012+phase*.004,wood,wood,4,[.86,.89,.83]);
      blade(p,top,vec(top[0],h,top[2],rings[i],reach*.50),.031,.013,tree.leaf);
    }
    for(let i=0;i<[2,4,7][phase];i++){
      const a=.33+i*goldenAngle,origin=i>4?between(base,fork,.66+i%2*.11):between(fork,knuckle,(i%4)*.30);
      const tip=vec(.5,h*(.68+i%4*.076),.5,a,reach*(.81+i%3*.087));
      const elbow=vec(origin[0],tip[1]-.052,origin[2],a-.20,reach*.56);
      p.rod(origin,elbow,.018,wood,wood,5);
      p.rod(elbow,tip,.011,wood,wood,5);
      const terminals=[tip];
      for(const side of [-1,1]){
        const joint=between(elbow,tip,side<0?.27:.62),angle=a+side*.88;
        const at=vec(joint[0],joint[1]+.035,joint[2],angle,reach*.37);
        p.rod(joint,at,.0065,wood,wood,4);
        terminals.push(at);
        if(phase===2){
          const inner=between(origin,elbow,side<0?.62:.91);
          const spur=vec(inner[0],inner[1]+.034,inner[2],a+side*1.2,reach*.23);
          p.rod(inner,spur,.0055,wood,wood,4);
          for(const offset of [-.43,.26])blade(p,spur,
            vec(spur[0],spur[1]+.027,spur[2],a+side*1.24+offset,tree.leafSize*.84),tree.leafSize*.26,.012,side>0?tree.leaf:green);
        }
      }
      for(const [j,at] of terminals.entries()){
        const angle=a+(j===1?-.79:j===2?.89:0),size=tree.leafSize*[.66,.84,1][phase];
        if(tree.pinnate){
          const end=vec(at[0],at[1]+.026,at[2],angle,size);
          p.rod(at,end,.007,leafTile,leafTile,4,stem);
          for(let k=1;k<=4;k++){
            const node=between(at,end,k*.214);
            for(const side of [-1,1])blade(p,node,vec(node[0],node[1]+.009,node[2],angle+side*.84,.063-k*.006),
              .019-k*.001,.010,k%2?tree.leaf:lime);
          }
        }else{
          for(const spread of [-.64,.15,.78]){
            const end=vec(at[0],at[1]+.015+Math.abs(spread)*.020,at[2],angle+spread,size*(spread>0?.90:1));
            if(spread===.15)orchardLeaf(p,at,end,size*.30,j%2?tree.leaf:lime);
            else blade(p,at,end,size*.28,.012,j%2?green:tree.leaf);
          }
        }
      }
      if(phase&&!tree.fruitOnTrunk){
        for(let j=0;j<tree.clusters;j++){
          if(j>0&&i%3===1&&tree.clusters<3)continue;
          const end=terminals[j],size=tree.fruitSize*(.84+(i+j)%3*.11);
          const at=vec(end[0],end[1]-.034-size*.54,end[2],a+j*.96,.017+j*.007);
          p.rod(end,[at[0],at[1]+(phase===2?size*.66:0),at[2]],.0045,leafTile,leafTile,4,stem);
          if(phase===1)head(p,...at,Math.min(.047,size*.84),5,tree.flower,golden,{cup:true});
          else tree.fruit(p,...at,size);
        }
      }
    }
    if(phase&&tree.fruitOnTrunk){
      for(let i=0;i<(phase===2?23:11);i++){
        const a=i*goldenAngle,t=.12+(i%12)*.062,target=t<.49?between(base,fork,t/.49):between(fork,knuckle,(t-.49)/.28);
        const at=vec(...target,a,t<.49?.046:.036);
        if(phase===1)head(p,...at,.023,5,cream,golden);
        else tree.fruit(p,...at,tree.fruitSize*(.87+i%3*.11));
      }
    }
  }
  function plantingMaterial(p,make){
    const lift=([x,y,z])=>[x,.26+y*1.30,z];
    const lifted={
      add:(vertices,...args)=>p.add(vertices.map(lift),...args),
      rod:(a,b,r,...args)=>p.rod(lift(a),lift(b),r,...args)
    };
    make(lifted,0,true);
    for(let i=0;i<4;i++){
      const from=vec(.5,.28,.5,rings[i],.019),to=vec(.5,.103+i*.021,.5,rings[i],.104+i*.022);
      p.rod(from,to,.016,wood,wood,4,[.98,.87,.70]);
    }
  }
  function seedPile(p,tint,r){
    for(const [x,y,z] of [[.37,.42,.43],[.62,.41,.56],[.48,.49,.60],[.58,.51,.40]]){
      fruitBody(p,x,y,z,r,tint,[[-.54,.41,.52],[0,1,.71],[.45,.62,.56]],6);
    }
  }
  const beetTone=[.83,.22,.40],potatoTone=[.99,.77,.46],beetStem=[.91,.29,.49];
  function beetRoot(p,x,y,z,r){
    fruitBody(p,x,y,z,r,beetTone,[[-1.12,.11],[-.62,.64],[-.28,.93],[.19,1],[.64,.77],[.83,.31]],8);
    p.rod([x,y-r*1.04,z],[x-r*.21,y-r*1.46,z+r*.12],r*.095,pigment,pigment,4,beetTone);
  }
  function potatoTuber(p,x,y,z,r,tint=potatoTone){
    fruitBody(p,x,y,z,r,tint,[[-.56,.35,.23],[-.37,.81,.55],[.08,1,.65],[.38,.81,.56],[.56,.31,.29]],8);
    for(let i=0;i<3;i++){
      const a=.39+i*2.06,spot=vec(x,y+(.30-i*.18)*r,z,a,r*.72);
      berry(p,spot[0],spot[1],z+(spot[2]-z)*.62,r*.037,[.56,.39,.22]);
    }
  }
  function roots(p,phase,potato){
    const height=[.20,.40,.66][phase],size=[.63,.85,1][phase];
    const base=[.5,.017,.50],bolts=potato?[2,3,4][phase]:[3,5,7][phase];
    for(let i=0;i<bolts;i++){
      const angle=.22+i*goldenAngle,tip=vec(.5,height*(.76+i%3*.115),.5,angle,(potato?.191:.182)*size);
      const middle=vec(.5,tip[1]*.56,.5,angle+.12,.082*size);
      const tile=potato?leafTile:pigment,tint=potato?stem:beetStem;
      p.rod(base,middle,.018*size,tile,tile,4,tint);
      p.rod(middle,tip,.011*size,tile,tile,4,tint);
      if(potato){
        for(let l=0;l<3;l++){
          const at=between(middle,tip,(l+1)/3);
          for(const side of [-1,1])orchardLeaf(p,at,vec(at[0],at[1]+.032,at[2],angle+side*.90,.146*size),
            .040*size,l%2?lime:green,true);
        }
        if(phase===1&&i%2===0)head(p,...tip,.053,5,[1.03,.79,1.24],golden);
      }else{
        const end=vec(tip[0],tip[1]+.037*size,tip[2],angle,.163*size);
        orchardLeaf(p,tip,end,.066*size,i%2?shade:green,true);
        p.rod(tip,between(tip,end,.81),.004,pigment,pigment,4,beetStem);
      }
    }
    if(!phase)return;
    if(potato)for(let i=0;i<(phase===1?2:4);i++){
      const a=.29+i*goldenAngle,r=(phase===1?.049:.082)+i%2*.017;
      const at=vec(.5,-.13-i%2*.065,.5,a,.11+i*.027);
      p.rod([.5,-.055,.5],at,.009,wood,wood,4);
      potatoTuber(p,...at,r);
    }
    else beetRoot(p,.50,phase===1?-.075:-.10,.50,phase===1?.059:.132);
  }
  const fruitCrops={STRAWBERRY:strawberryPlant,DRAGON_FRUIT:pitayaPlant,BLACKBERRY:bramble,GRAPES:grapevine,
    ...Object.fromEntries(Object.entries(fruitTrees).map(([key,tree])=>[key,(p,phase)=>orchardTree(p,phase,tree)]))};
  const styles={
    TALL_GRASS:grass,FERN:fern,REED:p=>reed(p,3,.77,green),SALT_REED:p=>reed(p,4,.64,lime,"salt"),
    RUST_REED:p=>reed(p,4,.67,[1.07,.92,.7],"rust"),CALCITE_REED:p=>reed(p,3,.71,lime,"calcium"),
    RICE_REED:p=>reed(p,4,.75,lime,"rice"),SALTWORT:p=>{rosette(p,.5,.018,.5,.26,.30,8,green);reed(p,3,.45,green,"salt")},
    POPPY:p=>stemFlower(p,{tint:[1.38,.285,.32],core:[.265,.219,.235],petals:6,size:.195,cup:true,double:true}),
    BLUE_FLOWER:p=>stemFlower(p,{tint:[.38,.64,1.39],core:[1.23,1.07,.43],petals:8,size:.17,y:.55,shape:"star"}),
    WHITE_FLOWER:p=>stemFlower(p,{tint:[1.16,1.2,1.23],core:[1.21,1.08,.48],petals:9,size:.158,y:.45,shape:"star"}),
    ORCHID:p=>stemFlower(p,{tint:[1.21,.42,.94],core:[1.3,.90,.47],petals:5,size:.195,y:.63,shape:"orchid",double:true}),
    LAVENDER:lavender,WATER_LILY:lily,
    MINT_PATCH:p=>{rosette(p,.48,.019,.49,.269,.281,7,lime);stemFlower(p,{tint:[.85,.76,1.18],core:ivory,petals:5,size:.077,y:.447})},
    ALPINE_BUSH:p=>shrub(p,[.75,1,.78],[.88,.38,.74],"alpine"),
    BERRY_BUSH:p=>shrub(p,green,[.95,.28,.45],"berry"),
    CACAO_BRANCH:p=>shrub(p,[1,1.08,.8],[1.15,.67,.27],"cacao"),
    CHERRY_BRANCH:p=>shrub(p,lime,[1.15,.24,.35],"cherry"),
    PINE_CONE:pine,PRICKLY_PEAR:p=>succulent(p,false),VERMILION_AGAVE:p=>succulent(p,true),
    BLUE_MUSHROOM:p=>mushroom(p,{tint:[.42,.54,1.24],cap:.201,height:.425}),
    GLOW_FUNGUS:p=>mushroom(p,{tint:[.97,1.38,1.13],cap:.184,height:.38,glowing:true}),
    FOREST_MUSHROOM:p=>mushroom(p,{tint:[1.15,.75,.49],cap:.212,height:.414}),
    LICHEN:p=>lichen(p,false),FROST_LICHEN:p=>lichen(p,true),
    CACTUS:p=>cactus(p),BAMBOO:p=>cactus(p,true),JACARANDA_LEAF:jacaranda
  };
  for(const [crop,make] of Object.entries({WHEAT:wheat,CARROT:carrots,BEAN:beans,
    BEET:(p,phase)=>roots(p,phase,false),POTATO:(p,phase)=>roots(p,phase,true),...fruitCrops})){
    for(const [phase,name] of ["SPROUT","GROWING","RIPE"].entries())styles[crop+"_"+name]=p=>make(p,phase);
    styles["WILD_"+crop]=p=>make(p,2,true);
  }
  const produce={
    beet:p=>{
      beetRoot(p,.5,.46,.5,.23);
      for(const a of [.45,2.58,4.75])blade(p,[.5,.65,.5],vec(.5,.80,.5,a,.142),.049,.017,green);
    },
    beet_seed:p=>plantingMaterial(p,(q,phase)=>roots(q,phase,false)),
    potato:p=>potatoTuber(p,.50,.44,.50,.32),
    potato_seed:p=>{
      potatoTuber(p,.50,.34,.50,.26);
      for(const [a,x,z] of [[1.2,.41,.51],[3.1,.59,.48],[5.3,.46,.61]]){
        const top=vec(x,.64,z,a,.051);
        p.rod([x,.423,z],top,.019,pigment,pigment,4,[.65,.52,.77]);
        for(const side of [-1,1])blade(p,top,vec(top[0],.72,top[2],a+side*.58,.098),.037,.014,lime);
      }
    },
    baked_potato:p=>{
      potatoTuber(p,.5,.44,.5,.33,[.86,.50,.29]);
      fruitBody(p,.47,.59,.5,.177,[1.14,.97,.66],[[-.10,.67,.51],[.20,1,.69],[.34,.44,.36]],8);
    },
    strawberry:p=>strawberryFruit(p,.5,.47,.5,.254),
    dragon_fruit:p=>pitayaFruit(p,.50,.47,.50,.253),
    blackberry:p=>blackberryFruit(p,.50,.50,.50,.275),
    jabuticaba:p=>{
      for(const [x,y,z,r] of [[.36,.41,.46,.179],[.64,.43,.55,.180],[.52,.63,.51,.15]]){
        berry(p,x,y,z,r,jabuticabaPurple);
        berry(p,x+.028,y+r*.72,z-.028,r*.13,[.62,.41,.71]);
      }
    },
    acerola:p=>acerolaFruit(p,.49,.48,.50,.151),
    lime:p=>limeFruit(p,.50,.45,.50,.225),
    pomegranate:p=>pomegranateFruit(p,.50,.46,.50,.265),
    grapes:p=>grapeFruit(p,.50,.51,.50,.29),
    starfruit:p=>starfruit(p,.50,.50,.50,.278),
    strawberry_runner:p=>plantingMaterial(p,strawberryPlant),
    dragon_fruit_cutting:p=>cladode(p,[.43,.16,.51],[.57,.80,.49],.142),
    blackberry_cutting:p=>plantingMaterial(p,bramble),
    jabuticaba_sapling:p=>plantingMaterial(p,fruitCrops.JABUTICABA),
    acerola_sapling:p=>plantingMaterial(p,fruitCrops.ACEROLA),
    lime_sapling:p=>plantingMaterial(p,fruitCrops.LIME),
    pomegranate_cutting:p=>plantingMaterial(p,fruitCrops.POMEGRANATE),
    grape_cutting:p=>plantingMaterial(p,grapevine),
    starfruit_sapling:p=>plantingMaterial(p,fruitCrops.STARFRUIT),
    wheat_seed:p=>seedPile(p,[.98,.78,.44],.086),
    carrot_seed:p=>seedPile(p,[.72,.55,.35],.071),
    bean_seed:p=>seedPile(p,[.87,.47,.40],.117),
    carrot:p=>{
      const [x,y,z]=carrotRoot(p,.505,.50,.094,.618,.145,.294);
      carrotLeaves(p,x,y,z,.292,.65);
    },
    wheat:p=>wheat(p,2),
    beans:p=>{
      for(const [x,z,offset] of [[.39,.47,0],[.62,.54,.055]]){
        p.shell([[x-.055,.16+offset,z,.024,.028],[x-.03,.25+offset,z,.061,.052],[x,.43+offset,z,.073,.063],
          [x+.018,.59+offset,z,.066,.058],[x+.004,.68+offset,z,.021,.023]],pigment,pigment,8,.31,undefined,beanPod);
        p.rod([x+.006,.65+offset,z],[x-.026,.76+offset,z+.018],.014,leafTile,leafTile,4,green);
      }
    }
  };
  return {styles,produce,grass};
})();

