"use strict";

globalThis.QuimiCraftBlockModels=(()=>{
  const swatches=[
    [192,[113,115,109]],[193,[142,82,65]],[194,[50,57,62]],[195,[184,125,62]],
    [196,[116,75,43]],[197,[255,140,39]],[198,[45,34,32]],[199,[188,174,148]],
    [200,[179,98,59]],[201,[80,143,154]],[202,[255,201,102]],[203,[195,146,70]],
    [207,[80,131,62]],[208,[93,232,217]],[209,[173,184,185]]
  ];
  const palette=new Map(swatches);
  const [stone,brick,iron,brass,wood,flame,coal,ceramic,copper,glaze,light,end,foliage,spectral,snow]=swatches.map(([tile])=>tile);
  const glowTiles=[flame,light,spectral,206];
  const ornamentTiles={stone:3,metal:iron,gold:brass,wood,night:coal,glass:glaze,paper:ceramic,
    sun:brass,light:glaze,leaf:foliage,green:foliage,rust:copper,bone:snow,ice:glaze,blue:glaze,water:214,violet:54};
  function paint(tile,x,y,random){
    const base=palette.get(tile);
    if(!base)return null;
    let shade=(random(x,y,tile)-.5)*15+(random(x>>2,y>>2,tile+32)-.5)*13;
    if(tile===stone||tile===brick||tile===ceramic){
      const row=Math.floor(y/8),col=(x+(row%2)*8)%16;
      shade+=y%8===0||col===0?-28:y%8===1||col===1?14:0;
    }
    if(tile===iron||tile===copper||tile===brass){
      shade+=y===1||x===1?23:y===30||x===30?-16:0;
      shade+=(random(x>>3,y,tile+12)-.5)*12;
    }
    if(tile===wood)shade+=Math.sin(x*.76+Math.sin(y*.22))*(11+random(x,7,tile)*7);
    if(tile===end){
      const r=Math.hypot((x-15)*.95,y-15);
      shade+=r>14?-30:Math.sin(r*1.3)*18;
    }
    if(tile===coal)shade-=random(x>>1,y>>1,tile)>.83?14:0;
    if(tile===glaze)shade+=Math.abs(x-y-3)<2?29:Math.abs(x-y+9)<1?16:0;
    if(tile===flame)return [255,Math.round(102+y*4.6+shade*.34),Math.round(21+y*.97),255];
    if(tile===light)return [255,Math.round(198+shade*.32),Math.round(93+shade*.48),255];
    if(tile===foliage)shade+=Math.sin(y*.94+x*.12)*7;
    if(tile===spectral)shade+=14+Math.sin(y*.3+x*.28)*12;
    if(tile===snow){
      const line=9+Math.sin(x*.45)*2+Math.sin(x*.88);
      if(y<line)return [221+shade*.55,235+shade*.44,241+shade*.37,255];
      shade+=(random(x>>2,y>>2,tile)>.64?14:-18);
    }
    return [...base.map(channel=>channel+shade),255];
  }

  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const delta=(a,b)=>a.map((v,i)=>v-b[i]);
  const unit=a=>{const size=Math.hypot(...a)||1;return a.map(v=>v/size)};
  const up=[0,1,0];
  const gold=[1.21,1.14,.84],burning=[1.23,.53,.34],blue=[.64,1.15,1.23],dark=[.7,.75,.78];
  const shade=n=>.78+Math.max(0,n[1])*.22+Math.min(0,n[1])*.16+Math.abs(n[0])*.07;

  function draw(faces){
    const result=[];
    const add=(vertices,tile,tint=[1,1,1],normal=unit(cross(delta(vertices[1],vertices[0]),delta(vertices[2],vertices[0]))))=>{
      result.push({vertices,normal,tile,color:tint.map(v=>v*shade(normal))});
    };
    function box(tile,x,y,z,maxX,maxY,maxZ,tint){
      for(const f of faces)add(f.v.map(([u,v,w])=>[u?maxX:x,v?maxY:y,w?maxZ:z]),tile,tint,f.n);
    }
    function shell(layers,side,cap=side,sides=8,start=0,orient=p=>p,tint){
      const rings=layers.map(([x,y,z,rx,rz])=>Array.from({length:sides},(_,i)=>{
        const a=start+i*Math.PI*2/sides;
        return orient([x+rx*Math.cos(a),y,z+rz*Math.sin(a)]);
      }));
      for(let i=0;i<rings.length-1;i++)for(let j=0;j<sides;j++){
        const k=(j+1)%sides,p=rings[i],q=rings[i+1];
        add([p[j],q[j],q[k],p[k]],side,tint);
      }
      for(const i of [0,rings.length-1]){
        const [x,y,z]=layers[i],c=orient([x,y,z]),r=rings[i];
        for(let j=0;j<sides;j+=2){
          const face=[c,r[j],r[(j+1)%sides],r[(j+2)%sides]];
          add(i?face.reverse():face,cap,tint);
        }
      }
    }
    function rod(a,b,r,tile,cap=tile,sides=6,tint){
      const axis=unit(delta(b,a)),right=unit(cross(axis,Math.abs(axis[1])>.92?[0,0,1]:up)),back=cross(right,axis);
      const orient=([x,y,z])=>a.map((v,i)=>v+right[i]*x+axis[i]*y+back[i]*z);
      shell([[0,0,0,r,r],[0,Math.hypot(...delta(b,a)),0,r,r]],tile,cap,sides,Math.PI/6,orient,tint);
    }
    function arch(tile,x,y,z,back,rx,ry){
      for(let i=0;i<7;i++){
        const at=(theta,inner)=>[x+Math.cos(theta)*(rx-(inner?.065:0)),y+Math.sin(theta)*(ry-(inner?.062:0))];
        const lo=i*Math.PI/7+.011,hi=(i+1)*Math.PI/7-.011;
        const profile=[at(lo,false),at(hi,false),at(hi,true),at(lo,true)];
        const near=profile.map(([u,v])=>[u,v,z]),far=profile.map(([u,v])=>[u,v,back]);
        add(near.slice().reverse(),tile);
        add(far,tile);
        for(let j=0;j<4;j++){
          const k=(j+1)%4;
          add([near[j],near[k],far[k],far[j]],tile);
        }
      }
    }
    return {result,add,box,shell,rod,arch};
  }

  function hearth(p,inner,outer){
    const {box,arch}=p;
    box(stone,.079,0,.078,.921,.098,.926);
    box(outer,.091,.09,.154,.268,.768,.884);
    box(outer,.732,.09,.154,.909,.768,.884);
    box(outer,.268,.09,.606,.732,.768,.884);
    box(inner,.229,.102,.174,.771,.222,.632);
    box(inner,.253,.607,.154,.747,.765,.606);
    for(const [low,high,edge] of [[.445,.51,.287],[.51,.56,.32],[.56,.609,.374]]){
      box(inner,.255,low,.169,edge,high,.447);
      box(inner,1-edge,low,.169,.746,high,.447);
    }
    box(coal,.267,.22,.601,.733,.448,.632);
    box(brick,.204,.107,.123,.796,.176,.271);
    box(inner,.239,.176,.130,.306,.422,.221);
    box(inner,.694,.176,.130,.761,.422,.221);
    arch(inner,.500,.397,.119,.222,.292,.235);
    box(stone,.057,.748,.106,.943,.847,.92);
    for(const [x,z,h] of [[.36,.35,.043],[.47,.384,.053],[.605,.32,.046],[.53,.493,.029]]){
      box(coal,x-.075,.22,z-.065,x+.075,.22+h,z+.065);
      box(flame,x-.045,.223+h,z-.037,x+.047,.231+h,z+.039,burning);
    }
  }

  function furnace(p){
    hearth(p,brick,stone);
    const {box}=p;
    box(stone,.641,.845,.548,.895,.965,.827);
    box(iron,.671,.952,.585,.865,.987,.792);
    box(coal,.698,.988,.617,.839,.993,.759);
    for(const side of [-1,1])for(let i=0;i<3;i++){
      const x=side<0?.086:.902,z=.401+i*.110;
      box(iron,x,.488,z,x+.013,.527,z+.082);
    }
  }

  function campfire(p){
    const {shell,rod,box}=p;
    shell([[.5,.015,.5,.33,.30],[.50,.068,.50,.343,.316],[.50,.105,.50,.252,.233]],coal,coal,8,.12);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4,cx=.5+Math.cos(a)*.378,cz=.5+Math.sin(a)*.364;
      const r=.098+(i%3)*.01,h=.104+(i%4)*.018;
      shell([[cx,.023,cz,r*.67,r*.72],[cx,h*.61,cz,r,r*.81],[cx+.01,h,cz,r*.71,r*.63]],stone,stone,6,a);
    }
    rod([.245,.143,.27],[.758,.194,.705],.076,wood,end);
    rod([.192,.213,.701],[.791,.194,.30],.067,wood,end);
    rod([.408,.215,.287],[.591,.271,.695],.058,coal,end);
    for(const [x,z] of [[.344,.581],[.486,.314],[.608,.548],[.574,.693],[.427,.463]]){
      box(flame,x-.04,.113,z-.044,x+.041,.151,z+.045,burning);
    }
    shell([[.49,.229,.49,.19,.19],[.47,.397,.49,.177,.158],[.56,.565,.526,.10,.093],[.519,.789,.575,.014,.016]],flame,flame,6,.48,undefined,[1.19,.70,.50]);
    shell([[.63,.219,.46,.121,.123],[.667,.35,.419,.103,.10],[.711,.457,.42,.053,.055],[.623,.599,.433,.008,.01]],flame,flame,6,.18,undefined,[1.08,.61,.43]);
    shell([[.374,.223,.568,.103,.092],[.321,.369,.617,.081,.069],[.351,.518,.631,.035,.04],[.399,.604,.596,.008,.008]],flame,flame,6,.28,undefined,[1.18,.77,.47]);
    shell([[.49,.239,.394,.093,.077],[.53,.388,.385,.095,.069],[.518,.501,.410,.037,.038],[.465,.613,.419,.009,.01]],light,light,6,.21,undefined,[1.14,1.15,.87]);
    for(const [x,y,z,r] of [[.42,.829,.48,.018],[.61,.73,.35,.016],[.65,.902,.594,.013],[.31,.694,.61,.012]]){
      shell([[x,y-r,z,.006,.006],[x,y,z,r,r],[x+.009,y+r*1.5,z,.005,.005]],light,light,4,.28);
    }
  }

  function stove(p){
    const {box,shell}=p;
    box(stone,.099,0,.113,.902,.075,.88);
    box(stone,.129,.069,.132,.872,.749,.859);
    box(brick,.176,.159,.104,.822,.598,.155);
    box(iron,.215,.197,.073,.778,.54,.132);
    box(coal,.263,.243,.064,.73,.49,.086);
    box(light,.327,.291,.057,.668,.454,.073,[1.05,.54,.33]);
    for(const x of [.326,.445,.564,.661])box(iron,x,.27,.045,x+.03,.484,.067);
    box(iron,.086,.727,.078,.915,.791,.907);
    for(const x of [.286,.699]){
      shell([[x,.791,.466,.156,.164],[x,.826,.466,.157,.165]],iron);
      shell([[x,.825,.466,.115,.124],[x,.846,.466,.111,.120]],copper,copper);
      shell([[x,.846,.466,.083,.087],[x,.863,.466,.087,.09]],coal);
    }
    for(const x of [.269,.443,.68])box(brass,x,.653,.09,x+.065,.707,.14);
    box(iron,.718,.788,.723,.864,.942,.868);
    box(iron,.700,.932,.706,.878,.969,.884);
  }

  function kiln(p){
    const {box,shell,rod}=p;
    box(iron,.088,0,.137,.912,.086,.899);
    box(brick,.14,.085,.191,.851,.714,.862);
    for(const x of [.145,.746])box(ceramic,x,.119,.087,x+.106,.746,.195);
    box(ceramic,.145,.63,.101,.851,.74,.868);
    box(copper,.262,.213,.091,.735,.597,.188);
    box(iron,.302,.235,.066,.694,.567,.113);
    box(glaze,.325,.256,.051,.671,.548,.088,blue);
    for(const [x,y] of [[.353,.322],[.43,.31],[.539,.352],[.601,.301]]){
      box(flame,x,y,.048,x+.052,y+.075,.055,[1.02,.8,.56]);
    }
    rod([.731,.351,.078],[.793,.36,.035],.027,brass);
    box(iron,.078,.738,.093,.915,.791,.88);
    box(iron,.194,.787,.245,.795,.838,.769);
    shell([[.506,.846,.504,.194,.179],[.506,.888,.504,.209,.189],[.506,.917,.504,.161,.151]],glaze,glaze,8,.393,undefined,blue);
    box(iron,.709,.791,.739,.847,.967,.873);
    box(copper,.693,.928,.718,.865,.978,.893);
  }

  function forge(p){
    const {box,shell,rod}=p;
    box(iron,.102,0,.123,.894,.093,.895);
    box(stone,.145,.091,.176,.869,.586,.85,dark);
    for(const x of [.137,.735]){
      box(iron,x,.081,.147,x+.133,.586,.276);
      box(iron,x,.081,.732,x+.133,.585,.87);
    }
    box(copper,.197,.246,.145,.512,.454,.208);
    box(coal,.225,.268,.111,.488,.433,.159);
    for(const x of [.244,.31,.376,.442])box(flame,x,.298,.103,x+.033,.383,.128,burning);
    box(iron,.087,.568,.102,.922,.64,.908);
    box(brick,.124,.634,.14,.623,.7,.818);
    box(coal,.176,.698,.225,.57,.729,.737);
    for(const [x,z] of [[.219,.309],[.333,.515],[.475,.593],[.403,.339],[.244,.64]]){
      box(flame,x,.728,z,x+.07,.745,z+.063,burning);
    }
    box(iron,.6,.638,.387,.835,.704,.739);
    box(iron,.648,.696,.433,.794,.813,.698);
    box(iron,.594,.807,.384,.847,.867,.75);
    shell([[.72,.823,.421,.07,.042],[.72,.829,.29,.058,.023],[.72,.852,.205,.016,.015]],iron);
    rod([.189,.65,.754],[.394,.702,.797],.041,copper);
    box(brass,.59,.241,.099,.69,.34,.149);
    box(iron,.106,.650,.773,.584,.768,.879);
    for(const y of [.67,.73])box(copper,.131,y,.763,.548,y+.022,.789);
    for(const x of [.218,.337,.464])box(coal,x,.764,.791,x+.06,.811,.851);
    rod([.697,.76,.2],[.757,.688,.231],.032,copper);
    box(copper,.143,.151,.109,.213,.588,.126);
    box(copper,.804,.151,.109,.862,.588,.126);
    for(const x of [.17,.839])for(const y of [.21,.51])shell([[x,y,.104,.026,.024],[x,y+.021,.104,.03,.025]],brass,brass,6,.26);
  }

  function lantern(p){
    const {box,shell,rod}=p;
    const brim=[[.5,.055,.5,.232,.23],[.5,.10,.5,.254,.25],[.5,.16,.5,.215,.214]];
    shell(brim,iron,brass,8,Math.PI/8);
    shell([[.5,.18,.5,.103,.1],[.5,.458,.5,.104,.10],[.5,.624,.5,.084,.086]],light,brass,8,Math.PI/8);
    for(const x of [.309,.691])for(const z of [.309,.691]){
      box(iron,x-.023,.116,z-.023,x+.023,.638,z+.023);
      box(brass,x-.032,.195,z-.032,x+.032,.241,z+.032);
    }
    for(const z of [.278,.714])box(brass,.297,.203,z,.704,.246,z+.021);
    for(const x of [.278,.714])box(brass,x,.203,.297,x+.021,.246,.704);
    shell([[.5,.598,.5,.251,.245],[.5,.647,.5,.24,.237],[.5,.775,.5,.118,.112],[.5,.799,.5,.077,.079]],iron,brass,8,Math.PI/8);
    rod([.41,.786,.51],[.412,.879,.51],.018,brass);
    rod([.412,.879,.51],[.455,.931,.51],.018,brass);
    rod([.455,.931,.51],[.55,.931,.51],.018,brass);
    rod([.55,.931,.51],[.589,.881,.51],.018,brass);
    rod([.589,.881,.51],[.59,.786,.51],.018,brass);
  }

  function torch(p){
    const {box,shell}=p;
    box(wood,.448,.026,.449,.552,.51,.552);
    box(iron,.431,.098,.433,.568,.15,.567);
    box(iron,.425,.443,.425,.575,.585,.575);
    box(coal,.435,.548,.435,.567,.601,.566);
    shell([[.5,.591,.50,.085,.085],[.471,.672,.526,.078,.072],[.524,.767,.504,.047,.054],[.521,.856,.489,.008,.012]],flame,flame,6,.35);
    shell([[.51,.605,.451,.041,.038],[.53,.692,.45,.038,.037],[.503,.756,.453,.007,.008]],light,light,6,.15);
  }
  function myceliumLamp(p){
    const {box,shell}=p;
    shell([[.5,.045,.5,.21,.21],[.5,.097,.5,.24,.24],[.5,.15,.5,.198,.198]],iron,brass,8,Math.PI/8);
    shell([[.5,.155,.5,.143,.143],[.5,.25,.5,.189,.189],[.5,.56,.5,.186,.186],[.5,.65,.5,.112,.112]],spectral,glaze,8,Math.PI/8);
    for(const x of [.335,.665])for(const z of [.335,.665])box(glaze,x-.012,.17,z-.012,x+.012,.61,z+.012);
    shell([[.5,.626,.5,.14,.14],[.5,.693,.5,.16,.16],[.5,.733,.5,.10,.10]],brass,iron,8,Math.PI/8);
    box(brass,.456,.719,.462,.544,.772,.538);
  }
  function spiritLight(p){
    const {box,shell,rod}=p;
    shell([[.5,.023,.5,.16,.16],[.5,.07,.5,.186,.186],[.5,.151,.5,.125,.125]],glaze,iron,8,.39);
    shell([[.5,.205,.5,.042,.043],[.5,.45,.5,.175,.17],[.501,.666,.5,.063,.067],[.501,.765,.5,.017,.023]],spectral,spectral,8,.39);
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+.43,x=Math.cos(a),z=Math.sin(a);
      rod([.5+x*.114,.09,.5+z*.114],[.5+x*.204,.236,.5+z*.204],.022,brass);
      rod([.5+x*.204,.236,.5+z*.204],[.5+x*.145,.342,.5+z*.145],.018,brass);
      box(spectral,.5+x*.263-.014,.47+i*.055,.5+z*.249-.014,.5+x*.263+.014,.51+i*.055,.5+z*.249+.014);
    }
  }
  function leaf(p,x,y,z,dx,dz,width,drop,tint){
    const len=Math.hypot(dx,dz)||1,nx=-dz/len*width,nz=dx/len*width;
    const a=[x,y,z],b=[x+dx*.46+nx,y+drop*.47,z+dz*.46+nz],c=[x+dx,y+drop,z+dz],d=[x+dx*.46-nx,y+drop*.47,z+dz*.46-nz];
    const ridge=[x+dx*.50,y+drop*.5+.027,z+dz*.5],below=[ridge[0],ridge[1]-.043,ridge[2]];
    p.add([a,b,ridge,d],foliage,tint);p.add([ridge,b,c,d],foliage,tint);
    p.add([a,d,below,b],foliage,tint.map(v=>v*.78));p.add([below,d,c,b],foliage,tint.map(v=>v*.83));
  }

  function palm(p){
    const {rod}=p;
    rod([.5,.04,.5],[.5,.65,.5],.067,wood,end,8);
    for(const [angle,scale,height] of [[-.68,.94,.56],[.32,.92,.57],[1.83,.81,.62],[3.18,.83,.60],[4.18,.93,.60],[5.48,.87,.56]]){
      const dx=Math.cos(angle),dz=Math.sin(angle),reach=.426*scale;
      const point=t=>[.5+dx*reach*t,height+.17*t-.33*t*t,.5+dz*reach*t];
      const base=point(0),middle=point(.53),end=point(1);
      rod(base,middle,.019,foliage,foliage,4,[.99,1.09,.80]);
      rod(middle,end,.014,foliage,foliage,4,[1.03,1.12,.78]);
      for(let i=0;i<6;i++){
        const t=.15+i*.143,root=point(t),w=(.16-.087*t)*scale;
        for(const side of [-1,1])leaf(p,...root,dx*.085-side*dz*w,dz*.085+side*dx*w,.031,-.124*t,[.82+(i%2)*.13,1.14-.16*t,.76]);
      }
      leaf(p,...middle,dx*.19,dz*.19,.03,-.09,[.89,1.12,.75]);
    }
  }
  function doorLeaf(p,upper){
    const {box,rod}=p;
    for(const x of [.035,.819])box(wood,x,0,.441,x+.146,1,.559,[.78,.86,.85]);
    for(const y of [0,.432,.905])box(wood,.163,y,.446,.836,y+.079,.554,[.88,.90,.77]);
    if(upper){
      for(const x of [.184,.501])box(QuimiCraftSurfaceArt.tiles.plain,x,.520,.47,x+.305,.901,.531,[.88,.97,1.13]);
      box(wood,.465,.512,.434,.535,.906,.567,[.84,.86,.86]);
      box(wood,.157,.699,.438,.848,.752,.562,[.91,.91,.82]);
      box(wood,.174,.075,.458,.824,.521,.542);
    }else{
      box(wood,.173,.073,.458,.826,.907,.542,[.99,1,.94]);
      for(const x of [.195,.51]){
        box(end,x,.147,.429,x+.282,.389,.452,[.82,.78,.74]);
        box(end,x,.534,.429,x+.282,.833,.452,[.86,.80,.74]);
      }
      for(const z of [.401,.599]){
        rod([.755,.792,z-.025],[.755,.792,z+.024],.029,brass);
        box(brass,.688,.768,z-.023,.775,.807,z+.022);
      }
    }
    for(const y of [.153,.766]){
      box(iron,.043,y,.412,.181,y+.065,.445);
      box(brass,.062,y+.013,.402,.091,y+.051,.420);
    }
  }
  function bench(p,top){
    const {box}=p;
    for(const x of [.086,.761])for(const z of [.095,.766]){
      box(wood,x,0,z,x+.151,.505,z+.15);
      box(iron,x-.006,.021,z-.006,x+.157,.076,z+.156);
    }
    box(wood,.077,.385,.10,.922,.513,.922);
    box(top,.052,.473,.065,.948,.575,.933);
    box(wood,.155,.228,.171,.845,.295,.868);
  }

  function potionBench(p){
    const {box,shell,rod}=p,{apparatus,pigment}=QuimiCraftSurfaceArt.tiles;
    bench(p,wood);
    box(iron,.056,.494,.060,.944,.567,.944,[.73,.75,.85]);
    box(stone,.077,.548,.083,.923,.599,.920,[.78,.78,.95]);
    for(const x of [.115,.849])for(const z of [.092,.868]){
      box(brass,x,.55,z,x+.041,.611,z+.041);
      box(brass,x,.082,z,x+.044,.110,z+.044,[.89,.91,.79]);
    }
    for(const x of [.19,.57]){
      box(wood,x,.338,.079,x+.24,.489,.122,[.80,.71,.64]);
      box(brass,x+.081,.398,.060,x+.16,.423,.092);
    }
    box(iron,.11,.596,.47,.52,.622,.85);
    const cx=.315,cz=.65;
    shell([[cx,.621,cz,.106,.103],[cx,.647,cz,.149,.144],[cx,.775,cz,.171,.162]],copper,brass,10,.31);
    shell([[cx,.773,cz,.178,.172],[cx,.796,cz,.179,.173],[cx,.807,cz,.168,.164]],brass,brass,10,.31);
    shell([[cx,.808,cz,.147,.144],[cx,.815,cz,.142,.138]],pigment,pigment,10,.31,undefined,[.49,.44,1.15]);
    rod([.27,.812,.63],[.17,.968,.706],.017,wood,brass,6);
    for(const [x,z,r,h,tint] of [
      [.65,.69,.073,.174,[.47,1.12,1.17]],[.805,.737,.06,.137,[1.32,.56,.40]],
      [.731,.844,.061,.180,[.88,.60,1.38]]
    ]){
      shell([[x,.599,z,r*.72,r*.72],[x,.626,z,r,r],[x,.599+h*.67,z,r,r],
        [x,.599+h*.84,z,r*.37,r*.37],[x,.599+h,z,r*.37,r*.37]],apparatus,apparatus,8,.30,undefined,tint);
      shell([[x,.617,z,r*.66,r*.66],[x,.599+h*.56,z,r*.78,r*.78]],pigment,pigment,8,.30,undefined,tint);
      shell([[x,.599+h,z,r*.48,r*.48],[x,.625+h,z,r*.44,r*.44]],end,end,6,.30);
      box(ceramic,x-r*.48,.635,z-r*.945,x+r*.47,.661,z-r*.86,[1.12,1,.83]);
    }
    box(wood,.49,.600,.166,.794,.631,.386,[.74,.65,.88]);
    for(const x of [.507,.648])box(ceramic,x,.631,.178,x+.132,.650,.377,[1.16,1.06,.90]);
    for(const x of [.530,.672])for(const z of [.22,.261,.306,.342]){
      box(wood,x,.649,z,x+.078,.655,z+.008,[.65,.69,.72]);
    }
    rod([.800,.625,.307],[.846,.665,.17],.011,brass,iron,6);
  }

  function still(p){
    const {box,shell,rod}=p,{apparatus,pigment}=QuimiCraftSurfaceArt.tiles;
    bench(p,glaze);
    box(iron,.075,.495,.066,.93,.562,.085,[.70,.79,.80]);
    box(iron,.074,.488,.914,.936,.554,.936,[.73,.77,.78]);
    box(iron,.123,.240,.176,.871,.274,.851,[.77,.83,.83]);
    for(const x of [.217,.748]){
      box(brass,x-.031,.47,.057,x+.036,.533,.093,[.90,.97,.95]);
      box(iron,x-.066,.270,.165,x+.07,.364,.853,[.66,.71,.73]);
    }
    const x=.305,z=.549;
    box(iron,.103,.568,.344,.505,.608,.741,[.67,.71,.77]);
    shell([[x,.606,z,.157,.154],[x,.626,z,.168,.165]],coal,coal,8,.39);
    shell([[x,.628,z,.115,.111],[x,.651,z,.136,.131]],flame,light,8,.39);
    for(const angle of [.37,1.94,3.52,5.095]){
      const side=[x+Math.cos(angle)*.150,.635,z+Math.sin(angle)*.145];
      rod([side[0],.59,side[2]],side,.016,iron);
    }
    shell([[x,.647,z,.101,.107],[x,.682,z,.163,.148],[x,.751,z,.172,.155],[x,.813,z,.143,.135],[x,.859,z,.057,.060]],
      copper,copper,10,.315,undefined,[1.11,.88,.81]);
    for(const [y,r] of [[.696,.166],[.791,.154]])shell([[x,y,z,r,r*.94],[x,y+.016,z,r*1.015,r*.957]],brass,brass,10,.315);
    shell([[x,.852,z,.061,.06],[x,.894,z,.051,.05],[x-.006,.91,z,.039,.042]],copper,brass,8,.39);
    const path=[[.299,.895,z],[.305,.947,z-.012],[.368,.973,z-.039],[.465,.94,z-.058],[.534,.906,z-.066]];
    for(let i=1;i<path.length;i++)rod(path[i-1],path[i],.024,copper,brass,8,[1.17,.98,.88]);
    const inlet=[.463,.946,.488],outlet=[.816,.791,.468],point=t=>inlet.map((v,i)=>v+(outlet[i]-v)*t);
    rod(inlet,outlet,.023,copper,brass,8);
    rod(point(.13),point(.87),.055,apparatus,apparatus,8,[.91,1.05,1.14]);
    for(const [a,b] of [[.08,.16],[.485,.535],[.85,.92]])rod(point(a),point(b),.063,brass,brass,8,[.98,1.15,1.17]);
    for(const [t,target,tint] of [[.25,[.535,.636,.233],[.91,.39,.29]],[.76,[.73,.632,.285],[.45,.77,1.07]]]){
      const start=point(t),elbow=[start[0],start[1]-.035,target[2]+.045];
      rod(start,elbow,.016,pigment,pigment,6,tint);
      rod(elbow,target,.015,pigment,pigment,6,tint);
    }
    const vialZ=.469;
    rod(outlet,[.834,.752,vialZ],.021,copper,brass,8);
    shell([[.833,.579,vialZ,.066,.066],[.833,.596,vialZ,.082,.083],[.833,.637,vialZ,.076,.076],[.833,.708,vialZ,.031,.034],
      [.833,.762,vialZ,.030,.031]],apparatus,apparatus,8,.39,undefined,[.69,1.05,1.19]);
    shell([[.833,.585,vialZ,.055,.059],[.833,.603,vialZ,.071,.071],[.833,.624,vialZ,.061,.064]],
      apparatus,apparatus,8,.39,undefined,[.34,1.13,1.25]);
    box(iron,.74,.566,.374,.921,.586,.566,[.81,.84,.87]);
    rod([.291,.773,.419],[.285,.774,.372],.059,brass,brass,8);
    rod([.285,.774,.372],[.285,.774,.366],.045,pigment,pigment,8,[1.18,1.13,.83]);
    rod([.285,.777,.365],[.309,.799,.361],.004,coal,coal,4);
    rod([.286,.777,.365],[.265,.789,.361],.003,brass,brass,4);
    rod([.338,.711,.413],[.338,.711,.373],.024,brass,brass,6);
    rod([.307,.711,.365],[.366,.711,.365],.010,copper,brass,6);
    rod([.338,.683,.365],[.338,.741,.365],.010,copper,brass,6);
  }

  function balance(p){
    const {box,shell,rod}=p;
    bench(p,ceramic);
    box(wood,.248,.574,.332,.753,.623,.686);
    shell([[.50,.621,.501,.076,.076],[.50,.663,.501,.074,.074],[.50,.893,.501,.028,.029]],brass);
    rod([.202,.886,.501],[.798,.886,.501],.024,brass);
    box(iron,.475,.892,.461,.525,.937,.54);
    for(const x of [.221,.779]){
      for(const [dx,dz] of [[.082,0],[-.047,.075],[-.047,-.075]]){
        rod([x,.887,.501],[x+dx,.726,.501+dz],.0085,brass);
      }
      shell([[x,.702,.501,.071,.066],[x,.73,.501,.118,.109],[x,.745,.501,.117,.107]],brass,brass,8,.39);
    }
    for(const [x,w] of [[.792,.056],[.326,.043],[.281,.034]])box(iron,x,.577,.752,x+w,.632,.81);
  }

  function expeditionChest({box},open=false){
    box(wood,.084,0,.132,.916,.47,.858,[.97,.78,.65]);
    box(wood,.137,.421,.179,.863,.478,.81,[.44,.25,.20]);
    for(const x of [.11,.79])for(const z of [.148,.787]){
      box(brass,x,.05,z,x+.096,.49,z+.066);
      box(iron,x+.033,.208,z-.005,x+.057,.245,z+.072);
    }
    for(const z of [.134,.822]){
      box(brass,.09,.412,z,.91,.47,z+.043);
      box(iron,.445,.291,z-.006,.555,.471,z+.057);
      if(!open)box(brass,.47,.349,z-.011,.53,.395,z+.063);
    }
    if(open){
      box(wood,.085,.452,.752,.915,.848,.856,[.83,.63,.53]);
      box(brass,.09,.797,.740,.91,.859,.861);
      box(iron,.171,.449,.751,.29,.513,.871);
      box(iron,.710,.449,.751,.829,.513,.871);
    }else{
      box(wood,.069,.47,.113,.931,.628,.872,[1,.92,.81]);
      box(wood,.127,.628,.16,.873,.678,.824,[1.03,.90,.73]);
      for(const x of [.12,.785])box(brass,x,.632,.128,x+.087,.684,.852);
    }
  }
  function woodenSign({box}){
    // Minecraft-style standing wooden sign post + bevelled horizontal wooden board
    box(wood,.44,0,.44,.56,.54,.56,[.86,.74,.62]);
    box(wood,.06,.48,.43,.94,.96,.57,[1.04,.92,.78]);
    box(wood,.09,.51,.41,.91,.93,.59,[.94,.82,.68]);
    box(brass,.46,.46,.42,.54,.52,.58);
  }
  function fieldEquipment({box,shell,rod},{unit,x,z}){
    const tone=unit.color.slice(1).match(/../g).map(channel=>parseInt(channel,16)/142);
    box(iron,.055,0,.07,.945,.12,.93,dark);
    box(iron,x===0?.06:0,.12,z===0?.08:0,x===unit.length-1?.94:1,.66,z===unit.depth-1?.92:1,tone);
    box(ceramic,x===0?.025:0,.66,0,x===unit.length-1?.975:1,.76,1,dark);
    for(const p of [.18,.40,.62,.82])box(iron,p,.235,.055,p+.085,.5,.072,dark);
    box(spectral,.11,.565,.051,.23,.596,.077);
    if(unit.id==="fume_hood"){
      if(x===unit.length-1){
        box(iron,0,.76,0,.2,2.56,1,tone);
        box(glaze,.202,1.18,.16,.235,1.96,.84,blue);
      }
      box(iron,0,2.54,0,1,2.74,1,tone);
      box(spectral,.025,2.527,.15,.975,2.549,.21);
      box(coal,.08,2.527,.31,.92,2.546,.89);
      for(const p of [.13,.22,.31,.40,.49,.58,.67,.76,.85])box(iron,p,2.502,.31,p+.030,2.544,.89,dark);
      if(x===0)box(iron,.009,.75,z===0?.018:.90,.086,2.57,z===0?.10:.985,tone);
      if(z===1)box(glaze,0,.77,.925,1,2.54,.968,blue);
      const left=x===0?.025:0,right=x===unit.length-1?.975:1,front=z===0?.025:0,back=z===unit.depth-1?.975:1;
      box(iron,left,2.74,front,right,3.62,back,tone);
      box(iron,0,3.61,0,1,3.75,1,dark);
      box(iron,0,2.77,0,1,2.85,1,dark);
      box(coal,.09,3.748,.10,.91,3.765,.91);
      for(const p of [.13,.23,.33,.43,.53,.63,.73,.83])box(iron,p,3.76,.10,p+.045,3.79,.91,tone);
      if(z===0){
        box(coal,.11,2.96,.015,.89,3.52,.034);
        for(const h of [3.01,3.10,3.19,3.28,3.37,3.46])box(iron,.11,h,.003,.89,h+.032,.037,dark);
        if(x===0)box(spectral,.82,2.89,.009,.92,2.933,.033);
      }
      return;
    }
    if(unit.id==="field_analyzer"){
      box(iron,.17,.76,.27,.83,.91,.86,tone);
      box(glaze,.235,.90,.30,.76,.99,.78,blue);
      box(spectral,.30,.981,.45,.70,.992,.50);
    }else if(unit.id==="field_boiler"||unit.id==="field_extractor"){
      const tube=unit.id==="field_boiler"?copper:glaze;
      shell([[.49,.76,.55,.24,.26],[.49,.83,.55,.29,.3],[.49,1.15,.55,.29,.3],[.49,1.28,.55,.18,.19]],
        tube,iron,12,0,p=>p,tone);
      rod([.11,1.32,.55],[.89,1.32,.55],.046,copper);
      rod([.49,1.22,.55],[.49,1.32,.55],.055,iron);
    }else{
      box(iron,.09,.76,.14,.91,1.28,.87,tone);
      box(glaze,.18,.92,.114,.82,1.18,.15,blue);
      box(spectral,.23,1.10,.1,.74,1.126,.12);
    }
  }
  const bannerProfiles={
    light:{hem:[.42,.34,.16,.34,.42],metal:brass},
    scourge:{hem:[.36,.17,.56,.55,.17,.36],metal:snow,symbol:spectral},
    fel:{hem:[.57,.42,.22,.17,.37,.49],metal:iron,symbol:foliage}
  };
  function factionStandard({add,box,shell,rod},{group,tile,base}){
    const {hem,metal,symbol}=bannerProfiles[group],top=1.56;
    box(base,.26,0,.30,.74,.12,.74);
    box(metal,.34,.11,.38,.66,.19,.66);
    rod([.5,.17,.61],[.5,1.73,.61],.034,metal);
    rod([.13,1.62,.54],[.87,1.62,.54],.032,metal);
    for(const x of [.17,.83]){
      shell([[x,1.585,.54,.044,.044],[x,1.655,.54,.044,.044]],metal);
    }
    if(group==="fel"){
      for(const sign of [-1,1]){
        shell([[.50,1.66,.61,.049,.044],[.5+sign*.09,1.75,.61,.035,.03],
          [.5+sign*.14,1.88,.60,.008,.008]],metal,metal,6);
      }
    }else if(group==="scourge"){
      shell([[.5,1.67,.61,.05,.05],[.5,1.84,.61,.05,.05],[.5,1.91,.61,.009,.009]],symbol,metal,4);
    }else{
      shell([[.5,1.66,.61,.058,.058],[.5,1.74,.61,.09,.09],[.5,1.84,.61,.05,.05]],metal,metal,8);
    }
    const bottom=hem.map((y,i)=>[.20+i*.60/(hem.length-1),y,.51+Math.sin(i*1.3)*.026]);
    for(let i=1;i<bottom.length;i++){
      const a=bottom[i-1],b=bottom[i],ta=[a[0],top,a[2]],tb=[b[0],top,b[2]];
      const front=[a,ta,tb,b],back=front.map(([x,y,z])=>[x,y,z+.035]);
      add(front,tile);add(back.slice().reverse(),tile);
      add([a,b,back[3],back[0]],base);
      rod([a[0],a[1]+.013,a[2]-.006],[b[0],b[1]+.013,b[2]-.006],.012,metal);
    }
    for(const [x,y,z] of [bottom[0],bottom.at(-1)]){
      rod([x,y,z],[x,top,z],.014,metal);
      box(metal,x-.022,top,z-.012,x+.022,1.62,z+.061);
    }
    for(const z of [.465,.582]){
      const stitch=(x,y,q,r)=>rod([x,y,z],[q,r,z],.013,group==="fel"?symbol:metal);
      if(group==="light"){
        shell([[.5,.49,1.15,.092,.092],[.5,.525,1.15,.092,.092]],metal,metal,12,0,
          ([x,depth,y])=>[x,y,z-depth+.507]);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a);
          stitch(.5+c*.11,1.15+s*.11,.5+c*.18,1.15+s*.18);
        }
      }else if(group==="scourge"){
        for(const a of [0,Math.PI/3,Math.PI*2/3]){
          const x=Math.cos(a)*.17,y=Math.sin(a)*.17;
          rod([.5-x,1.15-y,z],[.5+x,1.15+y,z],.014,symbol);
        }
      }else{
        for(const sign of [-1,1]){
          stitch(.5+sign*.17,1.33,.5+sign*.11,1.05);
          stitch(.5+sign*.11,1.05,.5+sign*.04,1.25);
        }
        stitch(.36,1.15,.64,1.15);
      }
    }
  }

  function factionDecoration({box,shell,rod},{model,tile,base,trim}){
    const foot=(width=.36,height=.13)=>box(base,.5-width,0,.5-width,.5+width,height,.5+width);
    const jewel=(x,y,z,r)=>shell([
      [x,y-r,z,.012,.012],[x,y,z,r,r],[x,y+r,z,.012,.012]
    ],tile,tile,8,Math.PI/8);
    const medallion=(y,r,thickness,material=tile,sides=8)=>shell([
      [.5,.485-thickness,y,r,r],[.5,.485+thickness,y,r,r]
    ],material,material,sides,Math.PI/sides,([x,depth,z])=>[x,z,1-depth]);

    switch(model){
      case "frostBrazier":
        box(base,.10,0,.19,.90,.15,.81);
        box(stone,.13,.15,.22,.87,.30,.78,blue);
        box(coal,.20,.30,.27,.80,.345,.73);
        for(const x of [.14,.79]){
          box(trim,x,.28,.19,x+.075,.40,.81);
          for(const z of [.26,.66])box(iron,x,.23,z,x+.075,.58,z+.07);
        }
        for(const [x,h] of [[.26,.55],[.39,.73],[.54,.85],[.66,.58],[.76,.64]]){
          shell([[x,.32,.50,.10,.125],[x,.46,.51,.082,.085],[x+.042,h,.47,.011,.015]],tile,tile,4,Math.PI/4);
        }
        break;
      case "felTripod":
        for(let i=0;i<3;i++){
          const a=i*Math.PI*2/3+.25, dx=Math.cos(a),dz=Math.sin(a);
          const x=.5+dx*.39,z=.5+dz*.39;
          box(iron,x-.046,0,z-.046,x+.046,.09,z+.046);
          rod([x,.07,z],[.5+dx*.16,.57,.5+dz*.16],.055,iron,iron,6);
          rod([.5+dx*.16,.54,.5+dz*.16],[.5+dx*.30,.70,.5+dz*.30],.04,base);
        }
        shell([[.5,.53,.5,.15,.15],[.5,.56,.5,.29,.29],[.5,.68,.5,.34,.34],[.5,.655,.5,.23,.23]],
          iron,trim,6,Math.PI/6);
        shell([[.50,.61,.50,.148,.141],[.51,.79,.50,.126,.111],[.59,.97,.43,.012,.013]],tile,tile,6,.2);
        shell([[.37,.63,.51,.083,.073],[.35,.74,.53,.063,.061],[.29,.86,.54,.01,.01]],tile,tile,4);
        break;
      case "dawnLantern":
        shell([[.5,0,.5,.23,.23],[.5,.10,.5,.27,.27],[.5,.20,.5,.19,.19]],brass,base,12);
        shell([[.5,.19,.5,.14,.14],[.5,.32,.5,.25,.25],[.5,.54,.5,.26,.26],
          [.5,.65,.5,.16,.16]],tile,tile,12,Math.PI/12);
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3,dx=Math.cos(a),dz=Math.sin(a);
          rod([.5+dx*.17,.18,.5+dz*.17],[.5+dx*.28,.42,.5+dz*.28],.022,brass);
          rod([.5+dx*.28,.42,.5+dz*.28],[.5+dx*.16,.66,.5+dz*.16],.022,brass);
        }
        shell([[.5,.63,.5,.19,.19],[.5,.72,.5,.16,.16],[.5,.79,.5,.066,.066]],brass,base,10);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,b=a+Math.PI/4;
          rod([.5+.08*Math.cos(a),.86+.08*Math.sin(a),.5],
            [.5+.08*Math.cos(b),.86+.08*Math.sin(b),.5],.017,brass);
        }
        break;
      case "spiritPod":
        foot(.36,.08);
        for(const sign of [-1,1]){
          const outer=.5+sign*.33,upper=.5+sign*.19;
          rod([outer,.07,.50],[outer,.58,.54],.039,wood);
          rod([outer,.58,.54],[upper,.77,.54],.036,wood);
          rod([upper,.77,.54],[.50,.91,.52],.032,wood);
        }
        rod([.50,.89,.52],[.50,.65,.52],.019,wood);
        shell([[.5,.27,.5,.045,.047],[.5,.42,.5,.151,.136],[.5,.56,.5,.171,.143],
          [.5,.68,.5,.066,.058]],tile,foliage,8,Math.PI/8);
        for(let i=0;i<5;i++){
          const a=i*Math.PI*.4,x=.5+Math.cos(a)*.20,z=.5+Math.sin(a)*.18;
          shell([[.5,.27,.5,.021,.023],[x,.44,z,.067,.058],[.5+(x-.5)*.70,.65,.5+(z-.5)*.70,.012,.014]],
            foliage,wood,6,0,undefined,[.86,1.15,.81]);
        }
        break;
      case "catalystLamp":
        box(iron,.19,0,.24,.81,.11,.76);
        shell([[.5,.10,.5,.21,.21],[.5,.18,.5,.19,.19]],copper,brass,10);
        shell([[.5,.18,.5,.124,.124],[.5,.74,.5,.124,.124]],tile,tile,12,Math.PI/12);
        shell([[.5,.70,.5,.17,.17],[.5,.77,.5,.18,.18],[.5,.83,.5,.084,.084]],copper,brass,10);
        for(const x of [.25,.75]){
          rod([x,.11,.50],[x,.64,.50],.033,copper);
          rod([x,.64,.50],[.50,.80,.50],.033,brass);
        }
        for(const y of [.28,.47,.62]){
          shell([[.5,y,.5,.145,.145],[.5,y+.018,.5,.145,.145]],glaze,glaze,12);
        }
        break;
      case "leagueLantern":
        box(iron,.24,0,.24,.76,.10,.76);
        box(copper,.29,.10,.29,.71,.17,.71);
        box(tile,.31,.17,.31,.69,.61,.69);
        for(const x of [.28,.66])for(const z of [.28,.66])box(iron,x,.15,z,x+.06,.65,z+.06);
        box(iron,.27,.39,.285,.73,.427,.715);
        shell([[.5,.63,.5,.39,.39],[.5,.76,.5,.23,.23],[.5,.82,.5,.14,.14]],wood,iron,4,Math.PI/4);
        rod([.50,.77,.50],[.50,.92,.50],.041,iron);
        rod([.48,.91,.50],[.65,.91,.50],.026,iron);
        break;
      case "reliquary":
        foot(.34,.10);
        box(base,.19,.10,.25,.81,.38,.75);
        box(brass,.17,.37,.23,.83,.43,.77);
        for(const x of [.22,.72]){
          box(brass,x,.10,.23,x+.06,.43,.76);
          box(tile,x-.02,.225,.22,x+.08,.27,.24);
        }
        medallion(.62,.22,.061,brass,12);
        medallion(.62,.154,.078,tile,12);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,x=Math.cos(a),y=Math.sin(a);
          rod([.5+x*.19,.62+y*.19,.418],[.5+x*.30,.62+y*.30,.411],.019,brass);
        }
        break;
      case "orb":
        foot(.34);
        shell([[.5,.13,.5,.275,.275],[.5,.24,.5,.22,.22]],trim);
        for(let i=0;i<8;i++){
          const angle=i*Math.PI/4, x=.5+Math.cos(angle)*.30,z=.5+Math.sin(angle)*.30;
          jewel(x,.28,z,.050);
        }
        shell([[.5,.40,.5,.035,.035],[.5,.435,.5,.113,.113],[.5,.51,.5,.181,.181],
          [.5,.61,.5,.205,.205],[.5,.71,.5,.181,.181],[.5,.785,.5,.113,.113],[.5,.82,.5,.035,.035]],
          tile,tile,12,Math.PI/12);
        break;
      case "spires":
        foot(.37,.085);
        for(const [x,z,h,dx,dz,r] of [[.5,.53,.91,.025,.02,.16],[.33,.43,.55,-.12,-.09,.10],
          [.65,.42,.64,.12,-.07,.095],[.48,.69,.46,-.065,.07,.084]]){
          shell([[x,.06,z,r,r],[x+dx*.72,h*.76,z+dz*.72,r*.72,r*.72],[x+dx,h,z+dz,.012,.012]],
            tile,trim,6,Math.PI/6);
        }
        break;
      case "urn":
        foot(.25,.09);
        shell([[.5,.08,.5,.22,.22],[.5,.19,.5,.30,.30],[.5,.37,.5,.33,.33],
          [.5,.56,.5,.27,.27],[.5,.68,.5,.17,.17]],tile,base,12,Math.PI/12);
        for(const [y,r] of [[.19,.31],[.52,.293],[.68,.205]]){
          shell([[.5,y,.5,r,r],[.5,y+.044,.5,r,r]],trim);
        }
        jewel(.5,.765,.5,.055);
        break;
      case "sealedUrn":
        foot(.30,.10);
        shell([[.5,.10,.5,.29,.29],[.5,.15,.5,.27,.27],[.5,.64,.5,.215,.215],
          [.5,.72,.5,.265,.265],[.5,.81,.5,.17,.17]],base,coal,8,Math.PI/8);
        for(const x of [.32,.68]){
          for(const z of [.32,.68])rod([x,.20,z],[x,.74,z],.045,trim,coal,6);
        }
        shell([[.5,.79,.5,.12,.12],[.5,.83,.5,.126,.126],[.5,.872,.5,.09,.09]],tile,tile,6);
        break;
      case "abyssThorns":
        shell([[.5,0,.5,.34,.31],[.5,.16,.5,.43,.39],[.5,.27,.5,.31,.31]],coal,base,8);
        for(let i=0;i<5;i++){
          const a=i*Math.PI*.4,x=Math.cos(a),z=Math.sin(a),h=i%2?.83:.65;
          shell([[.5+x*.27,.18,.5+z*.27,.103,.098],[.5+x*.35,h*.68,.5+z*.35,.074,.065],
            [.5+x*.18,h,.5+z*.18,.013,.012]],base,tile,6,Math.PI/6);
        }
        jewel(.5,.43,.50,.12);
        break;
      case "prismGarden":
        shell([[.5,0,.5,.37,.37],[.5,.10,.5,.44,.44],[.5,.17,.5,.37,.37]],trim,base,10);
        for(let i=0;i<6;i++){
          const a=i*Math.PI/3,x=.5+Math.cos(a)*.25,z=.5+Math.sin(a)*.25;
          const prism=[tile,glaze,brass][i%3];
          shell([[x,.15,z,.078,.071],[x,.38+(i%2)*.08,z,.084,.077],
            [x,.49+(i%2)*.08,z,.01,.01]],prism,prism,6);
        }
        jewel(.5,.56,.50,.17);
        break;
      case "nexusCrown":
        foot(.24,.13);
        shell([[.5,.13,.5,.22,.22],[.5,.34,.5,.25,.25],[.5,.49,.5,.39,.39],[.5,.56,.5,.39,.39],
          [.5,.57,.5,.32,.32],[.5,.49,.5,.29,.29]],tile,base,16,Math.PI/16);
        for(let i=0;i<8;i++){
          const a=i*Math.PI/4,dx=Math.cos(a),dz=Math.sin(a);
          shell([[.5+dx*.31,.48,.5+dz*.31,.066,.066],
            [.5+dx*.42,i%2?.71:.90,.5+dz*.42,.013,.013]],tile,brass,6);
        }
        jewel(.5,.64,.50,.13);
        break;
      case "brazier":
        foot(.40,.12);
        box(coal,.17,.12,.17,.83,.34,.83);
        box(tile,.27,.32,.27,.73,.365,.73);
        for(const x of [.16,.70]){
          for(const z of [.16,.70])box(base,x,.10,z,x+.14,.54,z+.14);
          box(iron,x,.34,.25,x+.14,.43,.75);
          box(iron,.25,.34,x,.75,.43,x+.14);
        }
        for(const [x,z,h] of [[.49,.51,.79],[.33,.55,.51],[.66,.46,.61]]){
          shell([[x,.32,z,.122,.12],[x,.47,z,.094,.091],[x+.03,h,z,.013,.014]],tile,tile,4,Math.PI/4);
        }
        break;
      case "wings":
      case "horns":
        foot(.29);
        shell([[.5,.13,.5,.16,.16],[.5,.36,.5,.13,.13],[.5,.49,.5,.18,.18]],base,trim);
        jewel(.5,.60,.49,.135);
        for(const sign of [-1,1]){
          if(model==="wings"){
            for(let i=0;i<5;i++){
              const x=.5+sign*(.35+i*.02),y=.75-i*.073;
              rod([.5+sign*.085,.48+i*.028,.50],[x,y,.51+i*.012],.029,trim,trim,6);
              rod([x,y,.51+i*.012],[x+sign*.028,y+.07,.52+i*.012],.012,tile);
            }
          }else{
            shell([[.5+sign*.13,.39,.5,.14,.13],[.5+sign*.30,.57,.5,.087,.08],
              [.5+sign*.37,.74,.49,.050,.04],[.5+sign*.29,.91,.455,.01,.01]],base,trim,8,Math.PI/8);
          }
        }
        break;
      case "owl":
        foot(.29,.105);
        shell([[.5,.105,.5,.16,.16],[.5,.35,.5,.24,.20],[.5,.47,.5,.25,.22],[.5,.77,.5,.24,.19]],base);
        for(const x of [.35,.65]){
          jewel(x,.80,.48,.091);
          box(trim,x-.094,.27,.43,x+.094,.50,.57);
          jewel(x,.64,.32,.086);
          box(base,x-.035,.606,.227,x+.035,.67,.247);
        }
        jewel(.5,.56,.30,.062);
        break;
      case "planter":
        box(base,.12,0,.12,.88,.19,.88);
        box(trim,.085,.19,.085,.915,.265,.915);
        box(coal,.14,.265,.14,.86,.28,.86);
        for(const [x,z,h] of [[.32,.34,.72],[.66,.56,.57],[.42,.70,.59]]){
          const tip=[x,h,z];
          rod([x,.26,z],tip,.022,foliage);
          for(const sign of [-1,1])shell([[x,h-.19,z,.026,.026],[x+sign*.082,h-.12,z,.065,.031],
            [x+sign*.145,h-.059,z,.012,.01]],tile);
          jewel(...tip,.062);
        }
        break;
      case "chimes":
        foot(.36,.08);
        for(const x of [.18,.82])box(base,x-.033,.08,.52,x+.033,.88,.63);
        box(trim,.12,.84,.49,.88,.91,.67);
        for(let i=0;i<4;i++){
          const x=.30+i*.132,y=.28+i*.066;
          rod([x,.84,.55],[x,.70,.55],.009,base);
          shell([[x,y,.55,.043,.043],[x,y+.06,.55,.029,.029],[x,.71,.55,.029,.029]],tile,trim,8);
        }
        break;
      case "bells":
        foot(.39,.10);
        for(const x of [.13,.81])box(wood,x,.10,.58,x+.06,.68,.68);
        box(wood,.09,.67,.30,.91,.73,.72);
        box(base,.12,.73,.36,.88,.795,.69);
        box(trim,.17,.795,.40,.83,.85,.64);
        for(const [x,y,r] of [[.28,.31,.091],[.51,.21,.123],[.74,.35,.08]]){
          rod([x,.69,.48],[x,y+.19,.48],.019,iron);
          shell([[x,y,.48,r,r],[x,y+.033,.48,r,r],[x,y+.08,.48,r*.71,r*.71],
            [x,y+.16,.48,r*.48,r*.48]],tile,brass,10);
          rod([x,y+.03,.48],[x,y-.04,.48],.019,iron);
        }
        break;
      case "vials":
        foot(.414,.10);
        box(base,.11,.10,.62,.89,.49,.725);
        for(const [x,h,r,glass] of [[.23,.58,.09,glaze],[.50,.72,.10,spectral],[.76,.53,.082,brass]]){
          shell([[x,.10,.43,r*.68,r*.68],[x,.20,.43,r,r],[x,h-.15,.43,r,r],
            [x,h-.09,.43,r*.48,r*.48],[x,h,.43,r*.48,r*.48]],glass,tile,8,Math.PI/8);
          box(trim,x-.055,h,.37,x+.055,h+.048,.49);
        }
        break;
      case "retort":
        foot(.37,.085);
        shell([[.32,.085,.51,.16,.16],[.32,.29,.51,.21,.20],[.32,.48,.51,.16,.155],
          [.32,.56,.51,.079,.077]],tile,trim,10,Math.PI/10);
        rod([.32,.54,.51],[.50,.67,.51],.063,tile);
        rod([.50,.67,.51],[.643,.59,.51],.056,tile);
        rod([.643,.59,.51],[.72,.44,.51],.047,trim);
        shell([[.72,.085,.51,.095,.095],[.72,.29,.51,.10,.10],[.72,.38,.51,.064,.064]],glaze,trim);
        break;
      case "eye":
      case "emblem":
        foot(.28,.09);
        rod([.50,.09,.54],[.50,.58,.54],.062,base);
        medallion(.60,.31,.067,trim,model==="eye"?8:6);
        medallion(.60,.252,.084,tile,model==="eye"?8:6);
        if(model==="eye")box(base,.469,.425,.405,.531,.775,.435);
        else medallion(.60,.115,.10,base,6);
        break;
      case "crate":
        box(tile,.11,.018,.15,.89,.60,.85);
        for(const x of [.087,.84])for(const z of [.128,.798])box(base,x,0,z,x+.074,.637,z+.074);
        for(const y of [.085,.37,.55]){
          box(trim,.087,y,.123,.914,y+.043,.152);
          box(trim,.087,y,.848,.914,y+.043,.877);
        }
        rod([.135,.07,.115],[.87,.55,.115],.035,base);
        rod([.135,.55,.112],[.87,.07,.112],.035,base);
        break;
      case "sign":
        for(const x of [.15,.79]){
          rod([x,.012,.71],[x,.75,.53],.036,base);
          rod([x,.012,.39],[x,.75,.53],.036,base);
        }
        box(tile,.095,.30,.455,.905,.755,.565);
        box(trim,.088,.30,.433,.912,.337,.574);
        box(trim,.088,.72,.433,.912,.767,.574);
        for(const x of [.29,.50,.71]){
          rod([x,.412,.426],[x,.621,.426],.015,brass);
          jewel(x,.571,.427,.041);
        }
        break;
    }
  }

  function create(block,faces,definitions={}){
    function sculkVein(p){
      const {box,rod}=p;
      // Low creeping Sculk-like membrane + glowing tendril veins hugging the ground
      box(250,.05,0,.05,.95,.055,.95,[.72,.88,1.02]);
      rod([.14,.04,.16],[.84,.08,.82],.038,251,251,6,[1.08,.95,1.2]);
      rod([.84,.04,.18],[.18,.08,.84],.036,251,251,6,[.78,1.18,1.22]);
      rod([.50,.04,.10],[.50,.07,.90],.032,252,252,6,[.90,1.22,1.26]);
    }
    function sculkSensor(p){
      const {box,shell,rod}=p;
      // Minecraft Sculk Sensor meets Old God eye-tendrils: fleshy dark base + 4 glowing waving eye-stalks!
      box(250,.10,0,.10,.90,.28,.90,[.78,.86,1.02]);
      box(251,.16,.27,.16,.84,.34,.84,[1.08,.88,1.24]);
      const stalks=[[.24,.24,.18,.20],[.76,.24,.82,.20],[.24,.76,.18,.80],[.76,.76,.82,.80]];
      for(const [sx,sz,tx,tz] of stalks){
        rod([sx,.28,sz],[tx,.72,tz],.045,252,252,6,[.86,1.20,1.28]);
        shell([[tx,.72,tz,.095,.095],[tx,.82,tz,.065,.065]],251,252,6,0,q=>q,[1.15,.85,1.28]);
      }
      shell([[.50,.30,.50,.16,.16],[.50,.46,.50,.12,.12]],252,252,8,0,q=>q,[.92,1.25,1.26]);
    }
    function sculkCatalyst(p){
      const {box,shell,rod}=p;
      // Bone-rimmed dark Sculk Catalyst crowned with ivory teeth around a glowing abyssal eye-maw!
      box(250,0,0,0,1,.88,1,[.86,.88,1.0]);
      box(253,.06,.88,.06,.94,.96,.94,[1.08,1.04,.96]);
      shell([[.50,.89,.50,.34,.34],[.50,.99,.50,.22,.22]],252,252,8,0,q=>q,[1.12,.85,1.28]);
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4,bx=.5+Math.cos(a)*.36,bz=.5+Math.sin(a)*.36,tx=.5+Math.cos(a)*.25,tz=.5+Math.sin(a)*.25;
        rod([bx,.88,bz],[tx,1.06,tz],.038,199,199,5,[1.12,1.08,.96]);
      }
    }
    const styles={
      FURNACE:furnace,FIRE:campfire,KITCHEN_STOVE:stove,GLASS_KILN:kiln,METAL_FORGE:forge,
      VILLAGE_LANTERN:lantern,MYCELIUM_LAMP:myceliumLamp,ALCHEMY_BENCH:potionBench,ALCHEMY_STILL:still,ALCHEMY_BALANCE:balance,TORCH:torch,SPECTRAL:spiritLight,PALM_LEAVES:palm,
      SCULK_VEIN:sculkVein,SCULK_SENSOR:sculkSensor,SCULK_CATALYST:sculkCatalyst,
      EXPEDITION_CHEST:expeditionChest,EXPEDITION_CHEST_OPEN:data=>expeditionChest(data,true),CHEST:expeditionChest,SIGN:woodenSign,...QuimiCraftPlantModels.styles
    };
    const models=new Map(),compactBanners=new Map();
    for(const [key,build] of Object.entries(styles)){
      if(block[key]===undefined)continue;
      const data=draw(faces);
      build(data);
      models.set(block[key],data.result);
    }
    for(const [id,segment] of globalThis.QuimiCraftFieldLab?.byBlock??[]){
      if(!definitions[id])continue;
      const data=draw(faces);
      fieldEquipment(data,segment);
      const rotate=([x,y,z],offset)=>segment.axis===1?[offset-z,y,x]:segment.axis===2?[offset-x,y,offset-z]:
        segment.axis===3?[z,y,offset-x]:[x,y,z];
      for(const face of data.result){
        face.vertices=face.vertices.map(point=>rotate(point,1));
        face.normal=rotate(face.normal,0);
      }
      models.set(id,data.result);
    }
    const plantIds=new Set(Object.keys(QuimiCraftPlantModels.styles).map(key=>block[key]).filter(Number.isInteger));
    for(const [value,def] of Object.entries(definitions)){
      const id=Number(value);
      if(def.giantPart)continue;
      if(def.factionDecor){
        const data=draw(faces);
        if(def.factionDecor.model==="standard"){
          factionStandard(data,def.factionDecor);
          compactBanners.set(id,data.result.map(face=>({...face,
            vertices:face.vertices.map(([x,y,z])=>[x,y*.51,z]),
            normal:unit([face.normal[0],face.normal[1]/.51,face.normal[2]])
          })));
        }else if(def.factionDecor.model==="grove"){
          QuimiCraftGrove.decorate(data,def.factionDecor);
        }else if(def.factionDecor.sculpt){
          QuimiCraftFactionOrnaments.build(data,def.factionDecor,ornamentTiles);
        }else factionDecoration(data,def.factionDecor);
        models.set(id,data.result);
        continue;
      }
      if(!def.plant||models.has(id))continue;
      const plant=draw(faces);
      QuimiCraftPlantModels.grass(plant);
      models.set(id,plant.result);plantIds.add(id);
    }
    for(const unit of QuimiCraftGrove.giants.values()){
      if(!unit.bed&&!unit.shape)continue;
      let full=models.get(unit.base);
      if(unit.bed){
        const data=draw(faces),textiles={wood:480,linen:227,blanket:478,root:482,leaf:483};
        for(const head of [false,true])for(const [x,y,z,w,h,d,finish] of QuimiCraftSurvival.bedBoxes({head,heading:1,canopy:true}))
          data.box(textiles[finish],x,y,z+(head?1:0),x+w,y+h,z+d+(head?1:0));
        full=data.result;
      }
      if(!full)throw Error("Modelo gigante ausente: "+unit.key);
      for(const heading of Object.keys(unit.variants).map(Number))for(const [id,model] of QuimiCraftGrove.splitFaces(full,unit,heading,definitions))models.set(id,model);
    }
    const produce=new Map(Object.entries(QuimiCraftPlantModels.produce).map(([id,build])=>{
      const data=draw(faces);build(data);return [id,data.result];
    }));
    const doors=[false,true].map(half=>{
      const model=draw(faces);
      doorLeaf(model,half);
      return model.result;
    });
    const extraIconColors=new Map([[3,[105,111,111]],[54,[153,110,196]],[250,[16,38,54]],
      [251,[168,82,238]],[252,[86,238,224]],[253,[212,196,166]]]);
    function icon(id,ctx){
      const model=models.get(id)||produce.get(id);
      if(!model)return false;
      const view=unit([.88,.76,-1]),right=unit([1,0,.88]),upper=unit(cross(right,view));
      const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
      const tall=compactBanners.has(id),center=[.5,tall ? .92 : .49,.5],zoom=tall?30:39;
      const toScreen=point=>[32+dot(delta(point,center),right)*zoom,31-dot(delta(point,center),upper)*zoom];
      const faces=model
        .filter(f=>dot(f.normal,view)>.01)
        .map(f=>({f,depth:f.vertices.reduce((a,p)=>a+dot(p,view),0)}))
        .sort((a,b)=>a.depth-b.depth);
      for(const {f} of faces){
        ctx.beginPath();
        const [first,...other]=f.vertices.map(toScreen);
        ctx.moveTo(...first);for(const p of other)ctx.lineTo(...p);
        ctx.closePath();
        const rgb=(palette.get(f.tile)||extraIconColors.get(f.tile)||QuimiCraftFactionBuilding.color(f.tile)||QuimiCraftFactions.tileColor(f.tile)||
          QuimiCraftGrove.color(f.tile)||QuimiCraftSurfaceArt.color(f.tile)||[226,233,235]).map((c,i)=>Math.min(255,Math.round(c*f.color[i]*1.06)));
        ctx.fillStyle=QuimiCraftSurfaceArt.transparentTiles.has(f.tile)?"rgba("+rgb.join(",")+",.63)":"rgb("+rgb.join(",")+")";
        ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.45;ctx.stroke();ctx.fill();
      }
      return true;
    }
    return {models,compactBanners,plantIds,produce,icon,doors};
  }

  return {create,paint,glowTiles};
})();

