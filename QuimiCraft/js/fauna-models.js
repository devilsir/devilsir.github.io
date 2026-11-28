"use strict";

globalThis.QuimiCraftFaunaModels=(()=>{
  const carnivore={
    cat:[.56,.14,.18,.47,.13,.16,.48,.30,.09,.45,.10],
    dog:[.66,.17,.22,.52,.15,.17,.52,.39,.20,.50,.12],
    jaguar:[.74,.25,.27,.65,.22,.22,.64,.45,.16,.77,.11],
    tiger:[.78,.25,.28,.70,.22,.22,.70,.47,.16,.82,.10],
    lion:[.83,.27,.27,.68,.22,.23,.67,.49,.18,.80,.10],
    lynx:[.66,.18,.21,.54,.17,.19,.52,.42,.095,.19,.15],
    wolf:[.76,.21,.235,.66,.17,.20,.64,.46,.24,.62,.14],
    fennec:[.73,.16,.18,.49,.16,.18,.49,.45,.22,.67,.32],
    rime_fox:[.66,.18,.19,.58,.16,.17,.50,.43,.21,.75,.17],
    maned_wolf:[1.07,.18,.20,.58,.16,.17,.76,.81,.21,.51,.26],
    hoary_fox:[.65,.18,.19,.53,.16,.18,.52,.41,.20,.64,.16],
    lumen_fox:[.66,.18,.19,.54,.16,.18,.52,.41,.20,.70,.19],
    brown_bear:[.80,.37,.38,.76,.23,.24,.70,.37,.22,.10,.11],
    black_bear:[.77,.32,.34,.71,.21,.225,.64,.39,.23,.08,.11],
    polar_bear:[.83,.34,.36,.79,.21,.22,.73,.41,.26,.09,.084]
  };
  const mammals={
    elephant:[1.91,.72,.91,1.47,.51,.58,1.30,1.00,.45,.92,.18],
    rhinoceros:[1.16,.56,.52,1.27,.31,.37,1.09,.53,.32,.53,.17],
    hippopotamus:[.90,.65,.52,1.38,.46,.37,1.13,.40,.45,.31,.095],
    iguana:[.20,.107,.095,.36,.079,.093,.30,.13,.095,.79,.012],
    tatu:[.225,.214,.20,.32,.087,.081,.28,.13,.115,.14,.05],
    pampas_deer:[.82,.192,.229,.56,.118,.154,.53,.54,.15,.17,.16],
    lumen_deer:[.85,.196,.232,.59,.122,.158,.55,.56,.16,.20,.17],
    coati:[.40,.16,.17,.40,.11,.125,.38,.24,.14,.61,.065]
  };
  const birds={
    toucan:{body:[.41,.14,.20,.23],head:[.61,-.15,.112],bill:[.24,.082,0xfca438],wing:.34,tail:.27},
    macaw:{body:[.38,.16,.24,.22],head:[.60,-.125,.127],bill:[.12,.093,0x262639],wing:.51,tail:.55},
    harpy:{body:[.55,.23,.28,.33],head:[.87,-.15,.149],bill:[.10,.061,0x3e4348],wing:.74,tail:.36,leg:.28},
    jabiru:{body:[.86,.24,.25,.42],head:[1.28,-.31,.106],bill:[.36,.062,0x34363a],wing:.72,tail:.18,leg:.66},
    thrush:{body:[.22,.087,.108,.145],head:[.334,-.090,.061],bill:[.07,.027,0xa98548],wing:.21,tail:.15},
    rhea:{body:[.96,.32,.36,.52],head:[1.71,-.34,.098],bill:[.125,.046,0x9a8065],wing:.33,tail:.18,leg:.71}
  };

  function create(T){
    const finish=new T.MeshLambertMaterial({vertexColors:true});
    const color=new T.Color();
    const mix=(a,b,f)=>new T.Color(a).lerp(new T.Color(b),f).getHex();
    const pivot=(g,x=0,y=0,z=0)=>{
      const joint=new T.Group();
      joint.position.set(x,y,z);
      g.add(joint);
      return joint;
    };
    function loft(g,rings,sides,paint){
      const points=[],positions=[],colors=[];
      for(const [z,y,width,height] of rings)for(let i=0;i<sides;i++){
        const angle=(i+.5)*Math.PI*2/sides;
        points.push([Math.sin(angle)*width,y+Math.cos(angle)*height,z]);
      }
      function triangle(a,b,c,tint){
        color.setHex(tint);
        for(const point of [a,b,c]){
          positions.push(...point);
          colors.push(color.r,color.g,color.b);
        }
      }
      for(let row=0;row<rings.length-1;row++)for(let edge=0;edge<sides;edge++){
        const next=(edge+1)%sides,r=row*sides,n=r+sides;
        const tint=typeof paint==="function"?paint(row,Math.cos((edge+1)*Math.PI*2/sides),edge):paint;
        triangle(points[r+edge],points[n+edge],points[r+next],tint);
        triangle(points[r+next],points[n+edge],points[n+next],tint);
      }
      for(const row of [0,rings.length-1]){
        const [z,y]=rings[row];
        for(let edge=0;edge<sides;edge++){
          const next=(edge+1)%sides,i=row*sides;
          const tint=typeof paint==="function"?paint(row,0,edge):paint;
          triangle([0,y,z],points[i+(row===0?edge:next)],points[i+(row===0?next:edge)],tint);
        }
      }
      const geometry=new T.BufferGeometry();
      geometry.setAttribute("position",new T.Float32BufferAttribute(positions,3));
      geometry.setAttribute("color",new T.Float32BufferAttribute(colors,3));
      geometry.computeVertexNormals();
      const model=new T.Mesh(geometry,finish);
      model.userData.ownGeometry=true;
      g.add(model);
      return model;
    }
    function subdivide(rings,count){
      const result=[rings[0]];
      for(let i=1;i<rings.length;i++)for(let j=1;j<=count;j++)
        result.push(rings[i].map((value,index)=>T.MathUtils.lerp(rings[i-1][index],value,j/count)));
      return result;
    }
    function mound(g,x,y,z,w,h,d,tint,sides=8){
      const model=loft(g,[[-d,0,w*.49,h*.51],[-d*.45,0,w,h],[d*.55,0,w*.91,h*.88],[d,0,w*.37,h*.37]],sides,tint);
      model.position.set(x,y,z);
      return model;
    }
    function taper(g,from,to,r1,r2,tint,sides=6,squash=1){
      const start=new T.Vector3(...from),delta=new T.Vector3(...to).sub(start);
      const model=loft(g,[[0,0,r1,r1*squash],[delta.length(),0,r2,r2*squash]],sides,tint);
      model.position.copy(start);
      model.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.normalize());
      return model;
    }
    function eyes(head,width,height,z,iris){
      for(const side of [-1,1]){
        mound(head,side*width,height,z,width*.19,width*.20,width*.17,iris,6);
        mound(head,side*width*1.095,height+.003,z-width*.065,width*.086,width*.128,width*.086,0x242025,5);
      }
    }
    function batchSurfaces(group,rig){
      const meshes=group.children.filter(child=>child.isMesh&&child.material===finish&&child!==rig.mane);
      if(meshes.length>1){
        const size=meshes.reduce((n,mesh)=>n+mesh.geometry.attributes.position.array.length,0);
        const attributes={position:new Float32Array(size),normal:new Float32Array(size),color:new Float32Array(size)};
        let offset=0;
        for(const mesh of meshes){
          mesh.updateMatrix();
          const geometry=mesh.geometry.applyMatrix4(mesh.matrix);
          for(const [key,array] of Object.entries(attributes))array.set(geometry.attributes[key].array,offset);
          offset+=geometry.attributes.position.array.length;
          group.remove(mesh);geometry.dispose();
        }
        const geometry=new T.BufferGeometry();
        for(const [key,array] of Object.entries(attributes))geometry.setAttribute(key,new T.BufferAttribute(array,3));
        const mesh=new T.Mesh(geometry,finish);
        mesh.userData.ownGeometry=true;
        group.add(mesh);
      }
      for(const joint of group.children)if(joint.isGroup)batchSurfaces(joint,rig);
    }
    function tamarin(def,g,rig){
      const gold=def.coat,light=def.trim,amber=0xa54913,skin=0x544041,fingers=0x52343a;
      const body=pivot(g,0,.315,.043);rig.body=body;
      rig.primate=true;
      loft(body,[[-.204,.058,.081,.082],[-.133,.041,.116,.110],[-.025,.009,.128,.132],
        [.096,.006,.122,.108],[.199,-.031,.086,.073],[.223,-.042,.057,.044]],10,
        (row,side,edge)=>side<-.48?light:(row+edge)%4===0?amber:gold);
      taper(body,[0,.056,-.121],[0,.124,-.200],.081,.068,gold,8);
      const head=pivot(g,0,.457,-.185);rig.head=head;
      mound(head,0,.01,.014,.113,.116,.105,gold,9);
      for(let i=0;i<12;i++){
        const a=i*Math.PI/6,x=Math.sin(a),y=Math.cos(a);
        taper(head,[x*.064,y*.067,.006],[x*(.135+.012*Math.sin(i*9)),y*.128-.033,.018+(1-y)*.047],
          .045,.003,i%3?light:amber,6,.67);
      }
      // Short flat face set into the mane, with the eyes facing forward.
      loft(head,[[-.129,-.019,.037,.055],[-.112,-.005,.070,.075],[-.082,.003,.084,.084],
        [-.043,.003,.082,.075]],10,(row,side)=>side<-.34?0x685153:skin);
      mound(head,0,-.037,-.117,.027,.016,.018,0x372a32,7);
      mound(head,0,-.067,-.119,.041,.019,.012,0x644448,8);
      for(const side of [-1,1]){
        mound(head,side*.034,.020,-.118,.025,.018,.017,0x33282e,7);
        mound(head,side*.035,.020,-.133,.011,.011,.006,0xa57036,7);
        mound(head,side*.035,.021,-.138,.006,.009,.004,0x241e27,6);
        mound(head,side*.116,.008,.022,.025,.032,.017,0x755052,7);
        for(const front of [true,false]){
          const joint=pivot(g,side*(front?.078:.090),front?.306:.276,front?-.136:.151);
          joint.userData.phase=(side>0)===front?0:Math.PI;
          joint.userData.primateRest={front,height:joint.position.y};rig.legs.push(joint);
          const bend=[side*.027,front?-.111:-.115,front?.023:-.052];
          taper(joint,[0,.061,0],bend,front?.040:.066,.032,gold,7);
          const lower=pivot(joint,...bend);joint.userData.lower=lower;
          const end=[side*.007,front?-.165:-.132,front?-.051:-.034];
          taper(lower,[0,.018,0],end,.033,.016,amber,7);
          const hand=pivot(lower,...end);
          mound(hand,0,-.005,-.010,.027,.015,.025,fingers,7);
          for(let finger=0;finger<4;finger++){
            const x=(finger-1.5)*.011;
            taper(hand,[x,-.008,-.015],[x*1.11,-.017,-.048+(finger%3)*.005],.006,.0029,fingers,5);
          }
          taper(hand,[-side*.018,-.003,-.001],[-side*.034,-.016,-.021],.009,.004,fingers,5);
        }
      }
      const tail=pivot(g,0,.282,.245);rig.tails.push(tail);
      taper(tail,[0,0,0],[0,.028,.192],.035,.028,gold,8);
      taper(tail,[0,.028,.192],[.012,-.019,.332],.029,.023,amber,8);
      const tip=pivot(tail,.012,-.019,.332);rig.tails.push(tip);
      taper(tip,[0,0,0],[.021,-.073,.105],.024,.019,amber,8);
      taper(tip,[.021,-.073,.105],[.039,-.127,.201],.020,.009,0x774523,7);
    }

    function quadruped(id,def,g,rig,seed){
      const shape=def.shape,cat=shape==="cat",bear=shape==="bear",dog=shape==="dog";
      const [y,w,h,length,hx,hy,front,legY,reach,tailLength,ear]=carnivore[id]??mammals[shape];
      const [coat,trim]=id==="cat"&&seed>.57?[0x696c79,0xd7cbb6]:id==="dog"&&seed>.56?[0x66503e,0xc2a586]:[def.coat,def.trim];
      const shade=mix(coat,0x262731,.34),warm=mix(coat,trim,.22),belly=mix(coat,trim,.64),ink=0x30292a;
      const pattern=def.pattern,body=pivot(g,0,y,0);rig.body=body;
      const spots=pattern==="rosette",stripes=pattern==="tiger"||pattern==="tabby";
      const paint=(row,side,edge)=>{
        if(side<-.66)return belly;
        if(spots){
          const u=(edge+Math.floor(row/4)*3)%6,v=row%4;
          if((v===0||v===2)&&(u===1||u===2)||(v===1&&(u===0||u===3)))return ink;
          if(v===1&&(u===1||u===2))return shade;
        }
        if(bear){
          const variation=(Math.sin(row*4.7+edge*3.1)+1)*.5;
          return side>.53?mix(warm,trim,variation*.23):mix(coat,shade,variation*.46);
        }
        if(stripes&&(edge+row)%3===0)return shade;
        if(pattern==="saddle"&&row>1&&side>.02)return shade;
        if(shape==="tatu"&&row>=2&&row<=5)return row%2?shade:warm;
        return side>.45?warm:coat;
      };
      const outline=[[-length,.015,w*.48,h*.54],[-length*.71,h*.10,w*.85,h*.91],[-length*.43,h*.10,w,h],
        [-length*.15,0,w*.97,h],[length*.10,0,w*.95,h],[length*.34,0,w*.93,h*.92],
        [length*.58,h*.025,w*.95,h*.92],[length*.82,h*.055,w*.77,h*.78],[length,h*.04,w*.40,h*.49]];
      loft(body,spots||bear?subdivide(outline,2):outline,spots?24:bear?14:10,paint);
      if(bear){
        for(const side of [-1,1])for(let i=0;i<6;i++){
          const offset=i*.061,z=-length*.69+offset,ys=h*(.64-i%2*.10);
          const x=side*w*(.70+i%3*.075);
          taper(body,[x,ys,z],[x+side*w*.19,ys-h*.14,z+length*.21],h*.21,.007,
            i%2?warm:mix(coat,trim,.40),5,.72);
        }
      }
      const headY=y+h*(dog?.30:(shape==="pampas_deer"||shape==="lumen_deer")?1.08:cat?.42:.29);
      const head=pivot(g,0,headY,-front);
      rig.head=head;
      taper(body,[0,h*.02,-length*.49],[0,headY-y,-front+h*.24],w*.85,hx*.94,coat,8);
      const snoutY=shape==="hippopotamus"?-.10:shape==="rhinoceros"?-.14:-hy*.32;
      mound(head,0,0,0,hx,hy,hy*.91,warm,8);
      loft(head,[[-hy*.70-reach,snoutY,hx*(cat?.50:shape==="hippopotamus"?.91:.49),hy*.40],
        [-hy*.56-reach*.55,snoutY,hx*(cat?.72:shape==="hippopotamus"?1.05:.63),hy*.51],[-hy*.30,snoutY,hx*.80,hy*.62]],8,
        (row,side)=>side<0?trim:shape==="hippopotamus"?belly:coat);
      const noseZ=-hy*.70-reach;
      if(cat||dog||bear||["coati","pampas_deer","lumen_deer"].includes(shape))
        mound(head,0,snoutY+hy*.08,noseZ,hx*.32,hy*.19,hy*.14,ink,6);
      eyes(head,hx*.76,hy*.24,-hy*.69,def.biolum?(def.glow||0x66fbff):shape==="elephant"?0xb19b80:0xe3b366);
      for(const side of [-1,1]){
        if(shape==="elephant"){
          const flap=mound(head,side*.56,.02,.10,.43,.56,.115,mix(coat,trim,.30),7);
          flap.rotation.y=side*.43;
        }else if(bear){
          const x=side*hx*.79,y=hy*.76+ear*.44;
          mound(head,x,y,hy*.15,ear*.69,ear*.73,ear*.48,coat,9);
          mound(head,x,y-.010,hy*.15-ear*.33,ear*.45,ear*.47,ear*.23,shade,8);
        }else{
          const earWidth=hx*(dog?.33:.28);
          const tip=[side*(hx*.76+ear*.33),hy*.64+ear,hy*.04];
          taper(head,[side*hx*.70,hy*.51,hy*.14],tip,earWidth,.008,shade,6,.66);
          if(dog||cat)taper(head,[side*hx*.71,hy*.63,-hy*.06],tip,earWidth*.53,.006,trim,5,.45);
          if(id==="lynx")taper(head,tip,[tip[0]+side*.035,tip[1]+.074,tip[2]],.025,.003,ink,5);
        }
      }
      if(pattern==="mane")rig.mane=mound(head,0,-hy*.07,hy*.44,hx*1.41,hy*1.58,hy*.86,0x704834,9);
      if(bear)for(const side of [-1,1])for(let j=0;j<4;j++){
        const y=hy*(.58-j*.27),x=side*hx*(.60+j*.07);
        taper(head,[x,y,hy*.23],[x+side*hx*.26,y-hy*.25,hy*.67],hy*.29,.004,j%2?shade:warm,5,.72);
      }
      if(shape==="elephant"){
        const trunk=pivot(head,0,-hy*.29,noseZ*.81),length=y*.86;
        taper(trunk,[0,.04,.02],[0,-length*.42,-.18],.24,.16,coat,8);
        taper(trunk,[0,-length*.42,-.18],[.05,-length*.76,-.25],.16,.115,warm,8);
        taper(trunk,[.05,-length*.76,-.25],[.05,-length,-.39],.115,.073,warm,7);
        rig.tails.push(trunk);trunk.userData.sway=.32;
        for(const side of [-1,1]){
          taper(head,[side*.33,-.24,noseZ*.81],[side*.43,-.40,noseZ-.33],.13,.086,0xe9dec1);
          taper(head,[side*.43,-.40,noseZ-.33],[side*.48,-.29,noseZ-.76],.086,.012,0xf2e6c5);
        }
      }else if(shape==="rhinoceros"){
        taper(head,[0,.085,noseZ+.16],[0,.57,noseZ+.035],.138,.017,0xcebb93);
        taper(head,[0,.186,noseZ+.40],[0,.44,noseZ+.36],.102,.019,0xc5b08b);
      }else if(shape==="hippopotamus"){
        const jaw=pivot(head,0,-hy*.67,-hy*.48);rig.jaw=jaw;
        mound(jaw,0,-.018,-.31,hx*.97,.15,.37,trim,8);
        for(const side of [-1,1]){
          mound(head,side*.23,0,noseZ*.88,.09,.052,.068,shade,6);
          taper(jaw,[side*.28,.04,-.54],[side*.28,.19,-.56],.048,.018,0xeadaaa);
        }
      }else if(shape==="pampas_deer"||shape==="lumen_deer"){
        const isLumen=shape==="lumen_deer";
        const glowMat=isLumen?new T.MeshBasicMaterial({color:def.glow||0x66fbff,toneMapped:false}):null;
        for(const side of [-1,1]){
          const antler=pivot(head,side*.074,hy*.77,.035);
          const a1=taper(antler,[0,0,0],[side*.058,isLumen?.31:.24,.054],.024,.009,isLumen?0x7dfbff:0xa79473,5);
          const a2=taper(antler,[side*.031,.13,.021],[side*.052,isLumen?.25:.205,-.068],.014,.005,isLumen?0xb8ffff:0xb39e78,5);
          const a3=taper(antler,[side*.042,.20,.045],[side*.098,isLumen?.31:.253,.024],.013,.004,isLumen?0xb8ffff:0xb39e78,5);
          if(glowMat){a1.material=a2.material=a3.material=glowMat}
        }
        if(isLumen&&glowMat){
          const orbGeo=new T.OctahedronGeometry(.045,1);
          const orb=new T.Mesh(orbGeo,glowMat);orb.position.set(0,hy*1.45,.04);orb.userData.ownGeometry=true;head.add(orb);
          for(let i=0;i<5;i++){
            const dot=new T.Mesh(new T.SphereGeometry(.026,6,5),glowMat);
            dot.position.set((i%2?1:-1)*w*.72,h*.55,-length*.45+i*length*.22);
            dot.userData.ownGeometry=true;body.add(dot);
          }
          if(globalThis.QuimiCraftSpectral?.halo)QuimiCraftSpectral.halo(T,head,0x5ef8ff,[0,hy*1.4,.04],.58,.58,.42);
        }
      }else if(shape==="iguana"){
        for(let i=0;i<9;i++){
          const z=-length*.79+i*length*.17;
          taper(body,[0,h*.81,z],[0,h*1.42,z+.035],.026,.004,shade,5,.44);
        }
        taper(head,[0,-hy*.2,.032],[0,-hy*.95,-hy*.38],.042,.007,trim,5,.59);
      }
      const heavy=bear||["elephant","rhinoceros","hippopotamus"].includes(shape);
      for(const side of [-1,1])for(const end of [-1,1]){
        const short=shape==="iguana",z=end*length*.62,x=side*w*(short?1.06:.71);
        const hip=Math.max(legY,y-h*.44),leg=pivot(g,x,hip,z);
        const knee=[short?side*.048:0,legY*(heavy?.46:.42)-hip,end<0?.013:.042];
        const paw=[short?side*.072:0,-hip+.04,-(heavy?.045:.031)];
        const radius=w*(heavy?.42:.54);
        const darkLeg=pattern==="blacklegs"?0x322b2d:shade;
        taper(leg,[-side*radius*.34,Math.max(.07,y-h*.10-hip),0],knee,radius,radius*.72,coat,7);
        const lower=pivot(leg,...knee);leg.userData.lower=lower;
        taper(lower,[0,.022,0],paw.map((value,i)=>value-knee[i]),radius*.72,radius*(heavy?.69:.51),darkLeg,6);
        mound(lower,paw[0]-knee[0],paw[1]-knee[1],paw[2]-knee[2],radius*.72,.049,radius*.89,darkLeg,6);
        leg.userData.phase=side===end?0:Math.PI;rig.legs.push(leg);
      }
      const brush=dog&&id!=="dog"&&id!=="wolf",tail=pivot(g,0,y+h*.42,length*(bear?.96:.82));
      rig.tails.push(tail);
      if(bear){
        mound(tail,0,-.024,tailLength*.71,w*.24,h*.15,tailLength*.57,warm,8);
        return;
      }
      const thick=w*(brush?.59:shape==="coati"?.24:shape==="iguana"?.55:.24);
      const lean=shape==="iguana"?.28:1;
      const tailBase=[0,0,0],tailMid=[0,tailLength*(shape==="coati"?.57:-.30*lean),tailLength*.57];
      const tailTip=[0,tailLength*(shape==="coati"?.92:cat?-.25:-.44*lean),tailLength*.87];
      taper(tail,tailBase,tailMid,thick,thick*.85,coat,7);
      taper(tail,tailMid,tailTip,thick*.85,thick*.54,brush?trim:shade,7);
      taper(tail,tailTip,[0,tailTip[1]+(cat?.08:-.015),tailLength],thick*.54,.007,pattern==="blacklegs"||id==="lion"?ink:coat,7);
      if(id==="lumen_fox"){
        const fxGlow=new T.MeshBasicMaterial({color:0x76f7ff,toneMapped:false});
        const fxViolet=new T.MeshBasicMaterial({color:0xb586ff,toneMapped:false});
        const tipOrb=new T.Mesh(new T.SphereGeometry(thick*.62,7,6),fxGlow);
        tipOrb.position.set(0,tailTip[1],tailLength*.88);tipOrb.userData.ownGeometry=true;tail.add(tipOrb);
        for(const side of [-1,1]){
          const earGlow=new T.Mesh(new T.ConeGeometry(hx*.22,ear*.65,5),fxViolet);
          earGlow.position.set(side*(hx*.78+ear*.26),hy*.64+ear*.88,hy*.04);earGlow.userData.ownGeometry=true;head.add(earGlow);
        }
        for(let i=0;i<4;i++){
          const rune=new T.Mesh(new T.SphereGeometry(.022,6,5),i%2?fxViolet:fxGlow);
          rune.position.set((i%2?1:-1)*w*.72,h*.48,-length*.35+i*length*.24);rune.userData.ownGeometry=true;body.add(rune);
        }
        if(globalThis.QuimiCraftSpectral?.halo)QuimiCraftSpectral.halo(T,tail,0x7cf8ff,[0,tailTip[1],tailLength*.88],.44,.44,.38);
      }
      if(shape==="coati")for(let i=1;i<5;i++){
        const t=i/5;
        taper(tail,[0,tailLength*t*.99,tailLength*t*.95],[0,tailLength*(t+.045)*.99,tailLength*(t+.045)*.95],
          thick*(1.19-t*.68),thick*(1.19-t*.68),shade,7);
      }
    }

    function bird(shape,def,g,rig){
      const {body:[y,w,h,d],head:[hy,hz,r],bill:[reach,depth,billColor],wing,tail,leg=y*.50}=birds[shape];
      const {coat,trim}=def,shade=mix(coat,0x29242f,.42),throat=shape==="thrush"||shape==="toucan"?trim:coat;
      const breast=shape==="harpy"?trim:throat;
      const body=pivot(g,0,y,0);rig.body=body;
      loft(body,[[-d,0,w*.39,h*.50],[-d*.53,0,w,h],[d*.22,0,w*.93,h*.91],[d*.78,.026,w*.51,h*.57],
        [d,.06,w*.26,h*.22]],8,(row,side)=>side<-.10||row===0?breast:coat);
      const neckColor=shape==="jabiru"?trim:breast;
      taper(body,[0,h*.48,-d*.45],[0,hy-y-.025,hz],r*.97,r*.67,neckColor,7);
      if(shape==="jabiru")taper(body,[0,h*.54,-d*.48],[0,h*.54+.14,-d*.54],r*1.01,r*.90,0xb62e30,7);
      const head=pivot(g,0,hy,hz);rig.head=head;
      mound(head,0,0,0,r,r*.91,r*.94,shape==="jabiru"?trim:shape==="harpy"?breast:coat);
      const tipZ=-r-reach;
      loft(head,[[tipZ,-depth*.25,r*.10,depth*.154],[tipZ+reach*.34,depth*.08,r*.38,depth*.61],
        [-r*.59,depth*.17,r*.61,depth]],7,(row,side)=>row===0&&shape==="toucan"?shade:side>.32?mix(billColor,0xffdfa5,.16):billColor);
      if(shape==="macaw")for(const side of [-1,1])mound(head,side*r*.81,-r*.29,-r*.56,r*.29,r*.28,r*.21,0xe7b337,6);
      if(shape==="harpy")for(const side of [-1,1])
        taper(head,[side*.06,r*.64,.012],[side*.103,r*1.6,.060],.045,.009,shade,5);
      eyes(head,r*.79,r*.18,-r*.60,shape==="macaw"?0xe7b337:0xb78a52);
      for(const side of [-1,1]){
        const shoulder=pivot(body,side*w*.83,h*.24,0);
        shoulder.userData.side=side;rig.wings.push(shoulder);
        taper(shoulder,[0,0,0],[side*wing*.53,-.01,.041],d*.49,d*.30,coat,7,.26);
        for(let i=0;i<4;i++){
          const tip=[side*wing*(1-i*.11),-.028,d*(.16+i*.15)];
          taper(shoulder,[side*wing*.36,0,-d*.21+i*d*.135],tip,d*.122,.006,i%2?shade:coat,5,.32);
        }
        const foot=pivot(g,side*w*.50,leg,.04);foot.userData.phase=side>0?0:Math.PI;rig.legs.push(foot);
        const tint=shape==="harpy"?0xc59349:0x716456;
        taper(foot,[0,.06,.02],[0,-leg+.045,0],r*.30,r*.22,tint,6);
        for(const toe of [-1,0,1])taper(foot,[0,-leg+.045,0],[toe*r*.27,-leg+.041,-r*.73],r*.16,.008,tint,5);
      }
      const fan=pivot(body,0,0,d*.67);rig.tails.push(fan);
      for(const i of [-1,0,1])taper(fan,[i*w*.14,0,0],[i*tail*.31,-tail*.23,tail],w*.30,w*.14,shade,6,.33);
    }

    function frog(def,g,rig){
      const coat=def.coat,trim=def.trim,shade=mix(coat,0x0c2429,.42);
      const glowMat=new T.MeshBasicMaterial({color:def.glow||0x58ffa8,toneMapped:false});
      const eyeMat=new T.MeshBasicMaterial({color:0xb8fff0,toneMapped:false});
      const body=pivot(g,0,.15,0);rig.body=body;
      loft(body,[[-.18,-.01,.09,.065],[-.09,.025,.155,.105],[.03,.04,.165,.11],[.15,.01,.13,.08],[.20,-.02,.07,.045]],9,
        (row,side,edge)=>side<-.42?trim:(row+edge)%3===0?shade:coat);
      const head=pivot(g,0,.20,-.15);rig.head=head;
      mound(head,0,0,0,.135,.085,.12,coat,8);
      // Bioluminescent vocal sac under chin
      const sac=new T.Mesh(new T.SphereGeometry(.072,8,6),glowMat);
      sac.scale.set(1.08,.75,.95);sac.position.set(0,-.055,-.045);sac.userData.ownGeometry=true;head.add(sac);
      for(const side of [-1,1]){
        const dome=new T.Mesh(new T.SphereGeometry(.044,7,6),eyeMat);
        dome.position.set(side*.082,.075,-.03);dome.userData.ownGeometry=true;head.add(dome);
        const pupil=new T.Mesh(new T.SphereGeometry(.021,6,5),new T.MeshBasicMaterial({color:0x0b1620}));
        pupil.position.set(side*.092,.082,-.058);pupil.userData.ownGeometry=true;head.add(pupil);
      }
      // Glowing dorsal spots
      for(const [sx,sy,sz,sr] of [[0,.145,-.02,.028],[-.075,.12,.04,.022],[.075,.12,.04,.022],[0,.11,.10,.025],[-.065,.11,-.08,.019],[.065,.11,-.08,.019]]){
        const wart=new T.Mesh(new T.SphereGeometry(sr,6,5),glowMat);
        wart.scale.set(1,.55,1);wart.position.set(sx,sy,sz);wart.userData.ownGeometry=true;body.add(wart);
      }
      if(globalThis.QuimiCraftSpectral?.halo)QuimiCraftSpectral.halo(T,body,def.glow||0x58ffa8,[0,.08,0],.46,.46,.34);
      // Front & powerful folded hind legs
      for(const side of [-1,1]){
        const front=pivot(g,side*.13,.11,-.12);front.userData.phase=side>0?0:Math.PI;rig.legs.push(front);
        taper(front,[0,0,0],[side*.04,-.095,-.04],.034,.022,coat,6);
        mound(front,side*.045,-.102,-.06,.042,.015,.046,trim,6);
        const hind=pivot(g,side*.14,.13,.11);hind.userData.phase=side>0?Math.PI:0;rig.legs.push(hind);
        taper(hind,[0,0,0],[side*.06,-.045,-.06],.054,.038,shade,6);
        taper(hind,[side*.06,-.045,-.06],[side*.05,-.115,.03],.036,.024,coat,6);
        mound(hind,side*.06,-.122,-.02,.054,.014,.062,trim,6);
      }
    }

    function terrestrial(id,def,g,rig,seed){
      if(def.shape==="tamarin")tamarin(def,g,rig);
      else if(def.shape==="lumen_frog")frog(def,g,rig);
      else if(birds[def.shape])bird(def.shape,def,g,rig);
      else quadruped(id,def,g,rig,seed);
      batchSurfaces(g,rig);
      g.scale.setScalar(def.scale);
    }

    function freshwater(id){
      const group=new T.Group(),wings=[],tail=[],stems=[],arms=[];
      const snake=id==="green_anaconda",manatee=id==="amazon_manatee";
      let jaw=null;
      if(snake){
        const green=0x6c7948,spot=0x393928;
        const head=loft(group,[[-.64,-.026,.068,.037],[-.53,.001,.119,.067],[-.34,.015,.14,.092],
          [-.18,0,.104,.080],[.13,0,.126,.105]],9,(row,side,edge)=>side<-.22?0xb0a775:edge%5===0?spot:green);
        eyes(head,.089,.047,-.54,0xd9b75e);
        jaw=pivot(group,0,-.05,-.39);
        mound(jaw,0,-.012,-.12,.095,.027,.138,0x9d9467,7);
        let owner=group;
        for(let i=0;i<12;i++){
          const joint=pivot(owner,0,0,i===0?.08:.265),r=.128*(1-i*.065),end=i===11?.011:r*.94;
          loft(joint,[[0,0,r,r*.79],[.132,0,r*1.02,r*.81],[.27,0,end,end*.79]],9,
            (row,side,edge)=>side<-.44?0xb3a875:(i+row*3+edge*2)%7<2?spot:green);
          joint.rotation.y=Math.sin(i*.62)*.12;
          tail.push(joint);owner=joint;
        }
      }else{
        const top=manatee?0x6c7d77:0x55645d,light=manatee?0xaeb2a1:0xa69e7b,brown=0x343c38;
        loft(group,manatee?[[-.94,-.023,.12,.08],[-.78,.01,.23,.16],[-.57,.02,.24,.19],[-.33,0,.31,.23],
          [-.09,0,.34,.27],[.34,.005,.30,.245],[.64,.025,.21,.177],[.80,.034,.13,.105]]:
          [[-.89,.075,.068,.067],[-.77,.039,.118,.13],[-.54,.006,.15,.195],
            [-.08,0,.175,.221],[.31,.006,.145,.182],[.55,.012,.10,.115],[.76,.012,.061,.065]],10,
          (row,side,edge)=>side<-.49?light:!manatee&&row>3&&(row+edge)%3===0?0xa85544:row%2?top:mix(top,light,.10));
        eyes(group,manatee?.18:.098,manatee?.10:.106,manatee?-.76:-.77,0x998055);
        const joint=pivot(group,0,.023,.69),tip=pivot(joint,0,0,.33);tail.push(joint,tip);
        if(manatee){
          loft(joint,[[0,0,.151,.084],[.31,0,.134,.052],[.48,0,.237,.028]],8,top);
          loft(tip,[[.10,0,.21,.030],[.25,0,.294,.025],[.41,0,.29,.022],[.51,0,.154,.016]],8,mix(top,brown,.23));
          for(const side of [-1,1]){
            const wing=pivot(group,side*.24,-.060,-.40);
            wing.userData.side=side;
            taper(wing,[0,0,0],[side*.33,-.13,.27],.095,.065,top,7,.47);
            taper(wing,[side*.30,-.11,.24],[side*.37,-.17,.42],.074,.014,light,7,.43);
            wings.push(wing);
          }
          mound(group,0,-.09,-.862,.154,.071,.09,light,8);
        }else{
          loft(joint,[[0,0,.074,.076],[.36,-.008,.036,.16]],7,top);
          loft(tip,[[0,0,.033,.14],[.14,0,.028,.217],[.29,0,.013,.154]],7,0xa34b3b);
          for(const side of [-1,1]){
            const wing=pivot(group,side*.115,-.13,-.43);
            wing.userData.side=side;
            taper(wing,[0,0,0],[side*.21,-.105,.31],.075,.008,0x826555,6,.35);wings.push(wing);
          }
          taper(group,[0,.114,.34],[0,.32,.57],.112,.010,0x985341,6,.23);
          taper(group,[0,-.124,.35],[0,-.26,.60],.108,.010,0x985341,6,.23);
        }
      }
      return {group,tail:tail[0],tailTip:snake?null:tail[1],tailSegments:snake?tail:null,wings,stems,arms,jaw,verticalTail:manatee,
        swimStyle:snake?"serpentine":manatee?"paddle":"fish",jawRest:.02,jawDrift:.012,biteAngle:.54};
    }

    return {terrestrial,freshwater};
  }
  const has=model=>model==="tamarin"||model==="lumen_frog"||Object.hasOwn(carnivore,model)||Object.hasOwn(mammals,model)||Object.hasOwn(birds,model);
  return {create,has};
})();

