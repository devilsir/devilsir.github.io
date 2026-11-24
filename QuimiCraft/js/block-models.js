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
  function create(block,faces,definitions={}){
    const styles={
      FURNACE:furnace,FIRE:campfire,KITCHEN_STOVE:stove,GLASS_KILN:kiln,METAL_FORGE:forge,
      VILLAGE_LANTERN:lantern,ALCHEMY_BENCH:potionBench,ALCHEMY_STILL:still,ALCHEMY_BALANCE:balance,TORCH:torch,SPECTRAL:spiritLight,PALM_LEAVES:palm,
      EXPEDITION_CHEST:expeditionChest,EXPEDITION_CHEST_OPEN:data=>expeditionChest(data,true),...QuimiCraftPlantModels.styles
    };
    const models=new Map();
    for(const [key,build] of Object.entries(styles)){
      if(block[key]===undefined)continue;
      const data=draw(faces);
      build(data);
      models.set(block[key],data.result);
    }
    const plantIds=new Set(Object.keys(QuimiCraftPlantModels.styles).map(key=>block[key]).filter(Number.isInteger));
    for(const [value,def] of Object.entries(definitions)){
      const id=Number(value);
      if(!def.plant||models.has(id))continue;
      const plant=draw(faces);
      QuimiCraftPlantModels.grass(plant);
      models.set(id,plant.result);plantIds.add(id);
    }
    const produce=new Map(Object.entries(QuimiCraftPlantModels.produce).map(([id,build])=>{
      const data=draw(faces);build(data);return [id,data.result];
    }));
    const doors=[false,true].map(half=>{
      const model=draw(faces);
      doorLeaf(model,half);
      return model.result;
    });
    function icon(id,ctx){
      const model=models.get(id)||produce.get(id);
      if(!model)return false;
      const view=unit([.88,.76,-1]),right=unit([1,0,.88]),upper=unit(cross(right,view));
      const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
      const toScreen=point=>[32+dot(delta(point,[.5,.49,.5]),right)*39,31-dot(delta(point,[.5,.49,.5]),upper)*39];
      const faces=model
        .filter(f=>dot(f.normal,view)>.01)
        .map(f=>({f,depth:f.vertices.reduce((a,p)=>a+dot(p,view),0)}))
        .sort((a,b)=>a.depth-b.depth);
      for(const {f} of faces){
        ctx.beginPath();
        const [first,...other]=f.vertices.map(toScreen);
        ctx.moveTo(...first);for(const p of other)ctx.lineTo(...p);
        ctx.closePath();
        const rgb=(palette.get(f.tile)||QuimiCraftSurfaceArt.color(f.tile)||[226,233,235]).map((c,i)=>Math.min(255,Math.round(c*f.color[i]*1.06)));
        ctx.fillStyle=QuimiCraftSurfaceArt.transparentTiles.has(f.tile)?"rgba("+rgb.join(",")+",.63)":"rgb("+rgb.join(",")+")";
        ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.45;ctx.stroke();ctx.fill();
      }
      return true;
    }
    return {models,plantIds,produce,icon,doors};
  }

  return {create,paint,glowTiles};
})();

