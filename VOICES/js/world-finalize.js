/* Registered module: world-finalize */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("world-finalize", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V = window.V, W = V.World, T = 48;
  const asset = 'assets/expansion/building-signs-v2.webp';
  const type = 'building-sign';
  // Source rectangle, text panel and three opaque bands. All normalized
  // rectangles are measured from the pixels of the authored sprite.
  const boards = [
    [[5,4,210,144],[0.15,0.345,0.701,0.265],[[0.0,0.0,1.0,0.333],[0.019,0.333,0.986,0.667],[0.0,0.667,1.0,1.0]]],
    [[225,4,210,137],[0.189,0.341,0.623,0.273],[[0.005,0.0,0.995,0.336],[0.024,0.336,0.976,0.664],[0.0,0.664,1.0,1.0]]],
    [[445,4,210,120],[0.248,0.344,0.506,0.259],[[0.029,0.0,0.971,0.333],[0.062,0.333,0.938,0.667],[0.0,0.667,1.0,1.0]]],
    [[665,4,210,146],[0.126,0.331,0.748,0.232],[[0.0,0.0,1.0,0.336],[0.0,0.336,1.0,0.664],[0.048,0.664,0.952,1.0]]],
    [[5,204,210,112],[0.147,0.2,0.709,0.343],[[0.0,0.0,1.0,0.33],[0.0,0.33,1.0,0.67],[0.0,0.67,1.0,1.0]]],
    [[225,204,210,124],[0.157,0.296,0.692,0.277],[[0.0,0.0,1.0,0.331],[0.019,0.331,0.986,0.669],[0.01,0.669,0.99,1.0]]],
    [[445,204,188,191],[0.187,0.352,0.626,0.244],[[0.011,0.0,0.989,0.335],[0.0,0.335,1.0,0.665],[0.074,0.665,0.931,1.0]]],
    [[665,204,210,121],[0.142,0.357,0.712,0.283],[[0.0,0.0,1.0,0.331],[0.038,0.331,0.962,0.669],[0.038,0.669,0.962,1.0]]],
    [[5,404,210,186],[0.218,0.342,0.558,0.308],[[0.043,0.0,0.957,0.333],[0.076,0.333,0.924,0.667],[0.0,0.667,1.0,1.0]]],
    [[225,404,210,173],[0.165,0.345,0.661,0.299],[[0.0,0.0,1.0,0.335],[0.019,0.335,0.981,0.665],[0.0,0.665,1.0,1.0]]],
    [[445,404,210,182],[0.192,0.378,0.607,0.273],[[0.0,0.0,1.0,0.335],[0.038,0.335,0.957,0.665],[0.01,0.665,0.99,1.0]]],
    [[665,404,210,183],[0.147,0.375,0.707,0.299],[[0.0,0.0,1.0,0.333],[0.014,0.333,0.986,0.667],[0.0,0.667,1.0,1.0]]]
  ];
  const alpha = {
    wordsMuseum:[.0391,.03125,.9609,1],
    foodMuseum:[0.0312,0.1927,0.9688,0.9688],
    animalMuseum:[0.0312,0.1667,0.9688,0.9688],
    sanctuary:[[0.0375,0.2188,0.9625,0.9625],[0.0375,0.325,0.9625,0.9625],[0.0375,0.1812,0.9625,0.9625],[0.0375,0.2062,0.9625,0.9625],[0.0375,0.2812,0.9625,0.9625],[0.0375,0.3,0.9625,0.9625]],
    guardHomeRatios:[1.2549,1.45248],
    guardBuildings:[[0.0375,0.2875,0.9625,0.9688],[0.0375,0.2375,0.9625,0.9688]],
    stalls:[[0.0556,0.0764,1.0,0.9306],[0.0694,0.1042,0.9444,0.9444],[0.0417,0.0833,0.9375,0.9375],[0.0208,0.1111,0.9306,0.9306],[0.0625,0.0417,0.9722,0.8819],[0.0556,0.0417,0.9514,0.8889],[0.0278,0.0486,0.9167,0.8958],[0.0556,0.0486,0.9583,0.875]],
    fruitStall:[0.0312,0.1458,0.9688,0.9688],
    kitchenCart:[0.0977,0.0312,0.9023,0.9688],
    capeStalls:[[0.0048,0.0048,0.9952,0.9928],[0.0047,0.0048,0.9953,0.9928],[0.0046,0.0072,0.9931,0.9952],[0.0047,0.0051,0.9953,0.9949],[0.004,0.0068,0.996,0.9932]],
    port:{"port-terminal-v2":[1.12676,[0.0,0.0563,1.0,1.0]],"cape-warehouse":[1.49375,[0.0,0.0,1.0,1.0]],"cape-market":[1.45625,[0.0,0.0,1.0,1.0]],"port-crane":[1.08108,[0.0,0.0,1.0,1.0]],"harbor-lighthouse":[1.225,[0.2908,0.0,1.0,1.0]],"cape-houses":[1.4875,[0.0,0.0,1.0,1.0]],"cape-heritage":[1.4375,[0.0,0.0,1.0,1.0]],"bo-kaap-terrace":[1.51875,[0.0,0.0,1.0,1.0]],"garden-pavilion":[1.4125,[0.0973,0.0,1.0,1.0]],"muizenberg-huts":[2.048,[0.0,0.0,1.0,1.0]]}
  };
  const full=[0,0,1,1];
  const profiles={
    home: {styles:[6,0,4,10], sizes:[100,112,126,144], preference:1},
    shop: {styles:[7,2,4,10], sizes:[120,138,156,174,192], preference:1},
    culture: {styles:[1,8,5,9,2], sizes:[132,152,172,192,212], preference:2},
    landmark: {styles:[1,8,9,3], sizes:[122,130,150,170,190,210], preference:1},
    nature: {styles:[3,6,1,4], sizes:[112,128,146,164,182], preference:1},
    heritage: {styles:[9,5,0], sizes:[148,168,188,208], preference:8},
    coast: {styles:[11,5,3], sizes:[126,146,166,186,206], preference:1}
  };
  const fontFace=size=>'700 '+size+'px "VOICES Sans",system-ui,sans-serif';
  const crop=(box,[l,t,r,b]=full)=>({
    x:box.x+box.w*l,y:box.y+box.h*t,w:box.w*(r-l),h:box.h*(b-t)
  });
  const at=(x,y,w,h)=>({x:x-w/2,y:y-h,w,h});
  const fit=(box,ratio)=>{
    const w=Math.min(box.w,box.h*ratio),h=w/ratio;
    return at(box.x+box.w/2,box.y+box.h,w,h);
  };
  const rectOverlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*
    Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const makePlace=(id,name,kind,variant,face,door=null,solid=null)=>({
    id,name,kind,variant,face,door,solid,x:face.x+face.w/2,front:face.y+face.h
  });
  const names = {
    'port-terminal-v2':'Terminal de Passageiros', 'cape-warehouse':'Armazém do Porto',
    'cape-market':'Mercado do Cabo', 'port-crane':'Guindaste do Porto',
    'harbor-lighthouse':'Farol do Porto', 'cape-houses':'Casario do Cabo',
    'cape-heritage':'Centro de Memória do Cabo', 'bo-kaap-terrace':'Casario de Bo-Kaap',
    'garden-pavilion':'Pavilhão do Jardim', 'muizenberg-huts':'Cabanas de Muizenberg'
  };
  const S = V.BuildingSigns = {
    spec(m,o) {
      if (m.culinary || o.interiorDoor) return null;
      if (o.culinaryLink && V.CulinaryWorld.facadeFrames[o.culinaryProp]) return {
        name:o.to==='university'?'Universidade das Vozes':'Restaurante dos Saberes',
        kind:o.to==='university'?'landmark':'shop', w:224, h:186, art:'culinary'
      };
      if (o.foodFacade) return {name:'Museu da Comida', kind:'culture', w:240, h:210, art:'foodMuseum', offset:8};
      if (o.animalFacade) return {name:'Museu dos Animais', kind:'nature', w:210, h:180, art:'animalMuseum', offset:6};
      if (o.salonLink && o.facade && !o.inside) return {name:'Salão Íris', kind:'shop', w:184, h:112, art:'salon'};
      if (o.afLink && !m.africanMuseum && !o.playMuseumLink) {
        return {name:'Museu das Palavras Africanas', kind:'culture', ...V.PlazaLayout.museum, art:'wordsMuseum'};
      }
      return null;
    },
    dimensions(o,spec) {
      if (spec.art==='culinary') return V.CulinaryWorld.facadeSize(o.culinaryProp);
      return spec;
    },
    footprint(o,spec,p=o) {
      const {w,h}=this.dimensions(o,spec), scale=o.visualScale||1;
      const width=w*.80*scale, height=h*.60*scale;
      return {x:p.x-width/2,y:p.y-20-height,w:width,h:height,owner:o.id,exteriorFacade:true};
    },
    buildingFace(m,b) {
      const x=b.x+b.w/2, front=b.y+b.h;
      if (b.culture!=null) {
        const frame=V.AncestralArt.bounds.places[b.culture];
        if (!frame) return b;
        const factor=b.w/Math.max(frame[2],frame[3]);
        return at(x,front,frame[2]*factor,frame[3]*factor);
      }
      if (b.sanctuaryHome!=null) {
        if (m.id==='sanctuary-village-sa' && b.door) {
          const lind=b.door.endsWith('ranger-lindiwe');
          const entrance=lind ? .451 : .497;
          const ratio=alpha.guardHomeRatios[Number(lind)];
          const w=Math.min(b.w/(2*Math.max(entrance,1-entrance)),(b.h+56)*ratio);
          const h=w/ratio;
          return {x:x-w*entrance,y:front-h,w,h};
        }
        return crop({x:b.x,y:b.y-70,w:b.w,h:b.h+76},alpha.sanctuary[b.sanctuaryHome]);
      }
      return b;
    },
    standFace(m,o) {
      if (m.capeDesign) {
        const box=o.marketKitchen?at(o.x,o.y,148,146):at(o.x,o.y,o.w,o.h);
        return this.capeFace(box,o.capeDesignFrame??0);
      }
      if (o.marketKitchen) return crop(at(o.x,o.y+18,154,154),alpha.kitchenCart);
      const bounds=o.marketVendor==='joana'?alpha.fruitStall:alpha.stalls[o.stall];
      return crop(at(o.x,o.y,o.w,o.h),bounds);
    },
    capeFace(box,index) {
      const f=V.HomeDesignArtData['cape-design'].frames[index];
      return crop(fit(box,f.w/f.h),alpha.capeStalls[index]);
    },
    mapPlaces(m) {
      const places=[];
      for (const [i,b] of m.buildings.entries()) {
        const x=b.x+b.w/2, front=b.y+b.h;
        const door=m.objects.find(o=>o.id===b.door) || (b.culture!=null &&
          m.objects.find(o=>o.type==='room-door' && Math.abs(o.x-x)<b.w/2 && Math.abs(o.y-front)<54));
        const id=b.door||'building-'+i;
        const name=(b.facade?.home && m.id==='residential' && W.maps[b.facade.home]?.name) || b.label;
        const kind=b.culture!=null?'heritage':b.sanctuaryHome!=null?'home':
          b.facade?.shop?'shop':b.facade?'home':'culture';
        const bottom=Math.min(front-12,(door?.y??front)-18);
        const top=b.y+b.h*.33;
        const solid={x:b.x+b.w*.075,y:top,w:b.w*.85,h:Math.max(12,bottom-top),owner:'shell-'+id,exteriorFacade:true};
        if (name) places.push(makePlace(id,name,kind,i,this.buildingFace(m,b),door,solid));
      }
      for (const o of m.objects) {
        const spec=this.spec(m,o);
        if (spec) {
          const {w,h}=this.dimensions(o,spec),scale=o.visualScale||1;
          const box=at(o.x,o.y+(spec.offset||0)*scale,w*scale,h*scale);
          const face=crop(box,alpha[spec.art]);
          places.push(makePlace(o.id,spec.name,spec.kind,o.foodFacade?4:o.animalFacade?2:0,face,o,this.footprint(o,spec)));
        } else if (o.type==='market-stall' || o.marketKitchen) {
          const name=o.marketKitchen?'Cozinha dos Saberes':V.Markets.vendor(o.marketVendor)?.shop;
          const w=o.w||154, h=o.h||136;
          const solid={x:o.x-w*.38,y:o.y-h*.38,w:w*.76,h:h*.33,owner:o.id,exteriorFacade:true};
          if (name) places.push(makePlace(o.id,name,'shop',o.stall??2,this.standFace(m,o),o,solid));
        } else if ((o.type==='sea-building' && !o.seaSite) || o.type==='cape-building' ||
          (o.type==='cape-decor' && o.art==='muizenberg-huts')) {
          const name=names[o.art], frame=alpha.port[o.art];
          if (name && frame) {
            const face=crop(fit(at(o.x,o.y,o.w,o.h),frame[0]),frame[1]);
            const kind=o.art.includes('pavilion')?'nature':o.art.includes('heritage')?'heritage':'coast';
            const variant=['cape-houses','bo-kaap-terrace','cape-warehouse'].includes(o.art)?1:
              ['harbor-lighthouse','cape-market'].includes(o.art)?2:0;
            places.push(makePlace(o.id,name,kind,variant,face));
          }
        }
      }
      for (const d of m.decor||[]) {
        if (d.family!=='guard-village' || d.prop>1) continue;
        const face=crop({x:d.x,y:d.y,w:d.size,h:d.size},alpha.guardBuildings[d.prop]);
        places.push(makePlace(d.id,d.prop===0?'Oficina dos guardas':'Abrigo comunitário','nature',d.prop+1,face));
      }
      for (const [i,entry] of (m.marketFacades||[]).entries()) {
        const face=this.capeFace(entry,4);
        const solid={
          x:entry.x+entry.w*.09,y:entry.y+entry.h*.66,w:entry.w*.82,h:entry.h*.23,
          owner:'market-row-'+i,exteriorFacade:true
        };
        places.push(makePlace('market-row-'+i,i===1?'Mercado do Cabo':'Casario do Cabo','coast',i,face,null,solid));
      }
      return places;
    },
    install(m) {
      if (!m) return;
      m.objects=m.objects.filter(o=>o.type!==type);
      m.solids=m.solids.filter(o=>!o.exteriorFacade);
      const places=this.mapPlaces(m);
      const solids=places.flatMap(p=>p.solid?[p.solid]:[]);
      // Replace narrow legacy footprints for freestanding entrances and stalls.
      const owners=new Set(solids.map(s=>s.owner));
      m.solids=m.solids.filter(s=>!owners.has(s.owner));
      m.solids.push(...solids);

      const structures=places.map(p=>p.face);
      const routes=m.objects.filter(o=>['travel','portal','room-door','door','exit','fast-travel'].includes(o.type))
        .map(o=>({x:o.x-25,y:o.y-8,w:50,h:49}));
      const occupied=(m.decor||[]).filter(o=>o.layer!=='ground'&&o.family!=='floor')
        .map(o=>({x:o.x+o.size*.12,y:o.y+o.size*.12,w:o.size*.76,h:o.size*.80}));
      const fixed=structures.map(box=>({box,weight:26})).concat(
        routes.map(box=>({box,weight:15})),occupied.map(box=>({box,weight:2})));
      const measure=this.measure||=(document.createElement('canvas').getContext('2d'));
      for (const place of places.sort((a,b)=>a.front-b.front||a.x-b.x)) {
        const sign=this.position(m,place,fixed,measure);
        m.objects.push(sign);
        for (const box of this.silhouette(sign)) fixed.push({box,weight:26});
      }
      if (places.length) {
        m.geometryRevision=(m.geometryRevision||0)+1;
        V.ObjectiveGuide.invalidate();
        V.Atlas.cache.clear();
      }
    },
    silhouette(sign) {
      const box=at(sign.x,sign.y,sign.w,sign.h);
      return boards[sign.style][2].map(band=>crop(box,band));
    },
    lettering(c,words,style,w,h) {
      const [,,u,v]=boards[style][1], max=w*u, height=h*v;
      for (let size=Math.min(16,Math.floor(height*.76));size>=11;size--) {
        c.font=fontFace(size);
        const lines=[];
        for (const word of words) {
          const current=lines.at(-1), next=current?current+' '+word:word;
          if (current && c.measureText(next).width<=max) lines[lines.length-1]=next;
          else lines.push(word);
        }
        const step=size+2;
        if (lines.length<=3 && size+(lines.length-1)*step<=height &&
          lines.every(line=>c.measureText(line).width<=max)) return {size,step,lines};
      }
      return null;
    },
    position(m,p,occupied,measure) {
      const profile=profiles[p.kind], {styles,sizes}=profile;
      const order=styles.map((_,i)=>styles[(i+p.variant)%styles.length]);
      const center=p.door?.x??p.x;
      const target=sizes[1];
      const minW=Math.max(92,Math.min(target,p.face.w*.78));
      const words=p.name.trim().split(/\s+(?!(?:·|\/)(?:\s|$))/);
      const candidates=[];
      for (const [variant,style] of order.entries()) {
        const [,,sw,sh]=boards[style][0];
        for (const w of sizes) {
          const h=w*sh/sw, text=this.lettering(measure,words,style,w,h);
          if (text) candidates.push({w,h,style,text,variant});
        }
      }
      if (!candidates.length) {
        const style=order[0], w=sizes.at(-1), [,,sw,sh]=boards[style][0],h=w*sh/sw;
        candidates.push({w,h,style,variant:0,text:{size:11,step:13,lines:[p.name]}});
      }
      const nearby=occupied.filter(({box})=>rectOverlap(box,{
        x:p.face.x-110,y:p.front-35,w:p.face.w+220,h:260
      }));
      let best=null, bestScore=Infinity;
      for (const option of candidates) {
        const {w,h,style,variant,text}=option;
        const nudge=Math.min(p.face.w*.25,w*.68),doorSide=25+w*.45;
        const anchors=p.door?[center-doorSide,center+doorSide,p.x,p.x-nudge,p.x+nudge]:
          [p.x,p.x-nudge*.5,p.x+nudge*.5,p.x-nudge,p.x+nudge];
        const minX=Math.max(w/2+10,p.face.x+w*.16);
        const maxX=Math.min(m.width*T-w/2-10,p.face.x+p.face.w-w*.16);
        for (const gap of [0,4,9,16]) for (const anchor of anchors) {
          const x=V.clamp(anchor,minX,Math.max(minX,maxX));
          const y=Math.min(m.height*T-12,p.front+gap+h);
          const shape=this.silhouette({x,y,w,h,style});
          const area=shape.reduce((n,b)=>n+b.w*b.h,0);
          const crossing=shape.reduce((n,part)=>n+nearby.reduce((k,{box,weight})=>
            k+rectOverlap(part,box)*weight,0),0)/Math.max(1,area);
          const offset=Math.abs(x-p.x)/Math.max(65,p.face.w);
          const heightCost=Math.max(0,h-(p.kind==='home'?82:98))*.11;
          const sizeCost=Math.abs(w-minW)*.058+Math.max(0,13-text.size)*.82+heightCost;
          const styleCost=variant*profile.preference;
          const score=gap*.38+offset*5+crossing*5+sizeCost+styleCost+
            Math.max(0,p.front-(y-h))*3;
          if (score<bestScore) {
            best={x,y,w,h,style,text};bestScore=score;
          }
        }
      }
      return {id:type+'-'+p.id,type,name:p.name,collectionOnly:true,interactionRange:0,...best};
    },
    draw(c,o,cam) {
      const x=o.x-cam.x, y=o.y-cam.y;
      const {w,h,style,text}=o, left=x-w/2, top=y-h;
      const image=V.Assets.images[type], [frame,[u,v,pw,ph]]=boards[style];
      c.save();
      c.imageSmoothingEnabled=false;
      if (image?.naturalWidth) {
        c.drawImage(image,...frame,left,top,w,h);
      } else {
        c.fillStyle='#735036';
        c.fillRect(left+w*.22,top+h*.4,5,h*.6);
        c.fillRect(left+w*.76,top+h*.4,5,h*.6);
        c.fillStyle='#b48a52';
        c.fillRect(left+w*u-3,top+h*v-3,w*pw+6,h*ph+6);
        c.fillStyle='#29473c';
        c.fillRect(left+w*u,top+h*v,w*pw,h*ph);
      }
      c.font=fontFace(text.size);
      c.textAlign='center';c.textBaseline='middle';
      c.fillStyle='#fff0ce';
      text.lines.forEach((line,i)=>c.fillText(line,left+w*(u+pw/2),
        top+h*(v+ph/2)+(i-(text.lines.length-1)/2)*text.step,w*pw));
      c.restore();
      return true;
    }
  };

  const group = V.AssetLoader.group.bind(V.AssetLoader);
  V.AssetLoader.group = key=>key===asset?type:group(key);
  const loadAssets=V.Assets.load.bind(V.Assets);
  V.Assets.load=async function() {
    await this.loadEntries([[type,asset]]);
    return loadAssets();
  };
  const groups=V.MapAssets.groups.bind(V.MapAssets);
  V.MapAssets.groups=function(m) {
    const out=groups(m);
    if (m?.objects.some(o=>o.type===type)) out.push(type);
    return out;
  };
  for (const owner of [V.Cozy,V.Maritime,V.CapeRegion]) {
    const draw=owner.drawObject.bind(owner);
    owner.drawObject=function(c,o,cam,...args) {
      if (o.type===type) return S.draw(c,o,cam);
      if (owner===V.Cozy && V.PlazaLayout.drawDestination(c,o,cam)) return;
      return draw(c,o,cam,...args);
    };
  }
  const landmark=V.Atlas.landmark.bind(V.Atlas);
  V.Atlas.landmark=function(c,o,m) {
    const cam={x:0,y:0};
    if (o.type===type) return S.draw(c,o,cam);
    return landmark(c,o,m);
  };
  const interactables=W.interactables.bind(W);
  W.interactables=function() {
    return interactables().filter(o=>o.type!==type);
  };
  const preview=V.SceneDesign.preview.bind(V.SceneDesign);
  V.SceneDesign.preview=function(...args) {
    const m=preview(...args);
    S.install(m);
    return m;
  };
  V.Hooks.around(W,'init','world-finalize:entrances',next=>function(...args) {
    const result=next(...args);
    V.PlazaLayout.install(W.maps.hub);
    V.PortalSpacing.all();
    for (const m of Object.values(W.maps)) S.install(m);
    return result;
  });
});
