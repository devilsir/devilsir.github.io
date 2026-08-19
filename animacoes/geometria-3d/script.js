'use strict';
(function(){
  var canvas = document.getElementById('gl');
  var gl = canvas.getContext('webgl', {antialias:true, alpha:false, preserveDrawingBuffer:true});
  if(!gl){ alert('Seu navegador não suporta WebGL.'); return; }

  function resize(){
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio||1));
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if(canvas.width!==w*dpr||canvas.height!==h*dpr){ canvas.width=w*dpr; canvas.height=h*dpr; gl.viewport(0,0,canvas.width,canvas.height); }
  }
  resize();
  var ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if(ro){ ro.observe(canvas);} else { window.addEventListener('resize', resize); }

  // UI refs
  var ui = {
    geom:geom,bondLen:bondLen,size:size,ligandRadius:ligandRadius,bondRadius:bondRadius,lpScale:lpScale,
    ambient:ambient,sat:sat,specK:specK,refl:refl,ligandColor:ligandColor,lpColor:lpColor,coreColor:coreColor,
    bondType:bondType,showAxes:showAxes,save:save,infoName:infoName,infoArr:infoArr,infoIdeal:infoIdeal,
    rotXS:rotXS,rotYS:rotYS,rotZS:rotZS,bgStars:bgStars,bgBrightness:bgBrightness, rotReset:rotReset
  };
  Object.keys(ui).forEach(function(k){ var el=ui[k]; if(el && (el.tagName==='INPUT'||el.tagName==='SELECT')) el.addEventListener('input', sync); });
  save.addEventListener('click', function(){ requestAnimationFrame(function(){ var a=document.createElement('a'); a.download='geometria_molecular_3d.png'; a.href=canvas.toDataURL('image/png'); a.click(); }); });

  // rotação via sliders
  var DEG=Math.PI/180; var rot={x:0,y:0,z:0};
  ['x','y','z'].forEach(function(ax){ document.getElementById('rot'+ax.toUpperCase()+'S').addEventListener('input', function(e){ rot[ax]=parseFloat(e.target.value)*DEG; }); });
  rotReset.addEventListener('click', function(){ rot.x=rot.y=rot.z=0; rotXS.value=rotYS.value=rotZS.value='0'; });

  // câmera (orbital + mouse)
  var camDist=4.6, rotX=0.35, rotY=-0.6, isDown=false, lastX=0,lastY=0;
  canvas.addEventListener('mousedown', function(e){ isDown=true; lastX=e.clientX; lastY=e.clientY; });
  window.addEventListener('mouseup', function(){ isDown=false; });
  window.addEventListener('mousemove', function(e){ if(!isDown) return; var dx=(e.clientX-lastX)/canvas.clientWidth, dy=(e.clientY-lastY)/canvas.clientHeight; lastX=e.clientX; lastY=e.clientY; rotY+=dx*Math.PI; rotX+=dy*Math.PI; rotX=Math.max(-Math.PI/2+.05, Math.min(Math.PI/2-.05, rotX)); });
  canvas.addEventListener('wheel', function(e){ e.preventDefault(); camDist*=(1+Math.sign(e.deltaY)*0.08); camDist=Math.max(2.2, Math.min(14, camDist)); }, {passive:false});
  canvas.addEventListener('dblclick', function(){ camDist=autoDist(); rotX=0.35; rotY=-0.6; rot.x=rot.y=rot.z=0; rotXS.value=rotYS.value=rotZS.value='0'; });

  // Shaders
  var VERT=`
    attribute vec2 aPos; varying vec2 vUV;
    void main(){ vUV=aPos*0.5+0.5; gl_Position=vec4(aPos,0.0,1.0); }
  `;
  var FRAG=`
    precision highp float;
    varying vec2 vUV;
    uniform vec2 uRes;
    uniform vec3 uEye, uTarget, uUp;
    uniform int uLigCount; uniform vec3 uLigDirs[8];
    uniform int uLPCount;  uniform vec3 uLPDirs[8];
    uniform float uBondLen, uCentralR, uLigR, uBondR, uLPScale, uAmbient, uSat, uSpecK, uRefl;
    uniform vec3 uLigColor, uLPColor, uCoreColor;
    uniform bool uShowAxes;
    uniform int uBondType; // 1=simples, 2=dupla, 3=tripla
    uniform vec3 uRot;
    // Fundo (estrelas apenas)
    uniform float uBGStars, uBGBright;

    mat3 look(vec3 f, vec3 up){ vec3 w=normalize(f); vec3 u=normalize(cross(w,up)); vec3 v=cross(u,w); return mat3(u,v,w); }
    float sdSphere(vec3 p, float r){ return length(p)-r; }
    float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h)-r; }
    float sdEllipsoid(vec3 p, vec3 r){ float k0=length(p/r); return (k0-1.0)*min(min(r.x,r.y),r.z); }
    struct Hit{ float d; vec3 col; };

    mat3 basisFromDir(vec3 d){ vec3 w=normalize(d); vec3 a=(abs(w.z)<0.999)?vec3(0.0,0.0,1.0):vec3(0.0,1.0,0.0); vec3 u=normalize(cross(a,w)); vec3 v=cross(w,u); return mat3(u,v,w); }
    vec3 mulByTranspose(mat3 B, vec3 x){ return vec3(dot(B[0],x), dot(B[1],x), dot(B[2],x)); }
    vec3 rotateXYZ(vec3 p, vec3 r){ float cx=cos(r.x), sx=sin(r.x); float cy=cos(r.y), sy=sin(r.y); float cz=cos(r.z), sz=sin(r.z); p=vec3(p.x, cx*p.y-sx*p.z, sx*p.y+cx*p.z); p=vec3(cy*p.x+sy*p.z, p.y, -sy*p.x+cy*p.z); p=vec3(cz*p.x-sz*p.y, sz*p.x+cz*p.y, p.z); return p; }

    float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
    vec2  hash22(vec2 p){ return fract(sin(vec2(dot(p,vec2(269.5,183.3)), dot(p,vec2(113.5,271.9))))*43758.5453); }
    const float PI=3.14159265359;
    vec2 dirToUV(vec3 dir){ dir=normalize(dir); float lon=atan(dir.x, dir.z); float lat=asin(clamp(dir.y,-1.0,1.0)); return vec2(lon/(2.0*PI)+0.5, lat/PI+0.5); }

    float starLayer(vec2 uv, float cells, float baseRadius, float boost){
      vec2 gv=uv*cells; vec2 id=floor(gv); vec2 f=fract(gv);
      vec2 sp=hash22(id); vec2 d=f-sp;
      float dist=length(d);
      float r=baseRadius*(0.7+0.6*hash21(id+7.3));
      float star=smoothstep(r, 0.0, dist);
      float halo=exp(-dist*dist/(r*r*3.0));
      return (star+0.4*halo)*boost;
    }

    vec3 envMap(vec3 dir){
      vec2 uv=dirToUV(dir);
      float s=0.0;
      s += starLayer(uv, 900.0, 0.0020, 0.9);
      s += starLayer(uv, 1500.0, 0.0017, 0.8);
      s += starLayer(uv, 2400.0, 0.0015, 0.6);
      vec3 col = vec3(0.75,0.82,1.0) * s * uBGStars;
      col *= uBGBright;
      return clamp(col, 0.0, 1.0);
    }

    Hit map(vec3 p){
      Hit res; res.d=1e9; res.col=vec3(0.0);

      if(uShowAxes){
        float ax = sdCapsule(p, vec3(-3.0,0.0,0.0), vec3(3.0,0.0,0.0), 0.02);
        float ay = sdCapsule(p, vec3(0.0,-3.0,0.0), vec3(0.0,3.0,0.0), 0.02);
        float az = sdCapsule(p, vec3(0.0,0.0,-3.0), vec3(0.0,0.0,3.0), 0.02);
        float d=min(ax,min(ay,az)); if(d<res.d){ res.d=d; res.col=vec3(0.55,0.8,1.0);}
      }

      vec3 pr=rotateXYZ(p,uRot);
      float dc=sdSphere(pr,uCentralR); if(dc<res.d){ res.d=dc; res.col=uCoreColor; }

      for(int i=0;i<8;i++) if(i<uLigCount){
        vec3 dir=normalize(uLigDirs[i]);
        vec3 b=dir*uBondLen;

        if(uBondType==1){
          float db=sdCapsule(pr, vec3(0.0), b, uBondR);
          if(db<res.d){ res.d=db; res.col=vec3(0.82,0.9,1.0);}
        } else if(uBondType==2){
          vec3 perp=(abs(dir.z)<0.99)?normalize(cross(dir,vec3(0.0,0.0,1.0))):normalize(cross(dir,vec3(0.0,1.0,0.0)));
          float r2=uBondR*0.6; float off=r2*1.8;
          float d1=sdCapsule(pr,-perp*off,b-perp*off,r2); if(d1<res.d){ res.d=d1; res.col=vec3(0.82,0.9,1.0);}
          float d2=sdCapsule(pr, perp*off,b+perp*off,r2); if(d2<res.d){ res.d=d2; res.col=vec3(0.82,0.9,1.0);}
        } else {
          vec3 perp=(abs(dir.z)<0.99)?normalize(cross(dir,vec3(0.0,0.0,1.0))):normalize(cross(dir,vec3(0.0,1.0,0.0)));
          float r3=uBondR*0.5; float off=r3*1.8;
          float d0=sdCapsule(pr, vec3(0.0), b, r3); if(d0<res.d){ res.d=d0; res.col=vec3(0.82,0.9,1.0);}
          float d1=sdCapsule(pr,-perp*off,b-perp*off,r3); if(d1<res.d){ res.d=d1; res.col=vec3(0.82,0.9,1.0);}
          float d2=sdCapsule(pr, perp*off,b+perp*off,r3); if(d2<res.d){ res.d=d2; res.col=vec3(0.82,0.9,1.0);}
        }

        float dl=sdSphere(pr-b, uLigR); if(dl<res.d){ res.d=dl; res.col=uLigColor; }
      }

      for(int i=0;i<8;i++) if(i<uLPCount){
        vec3 dir=normalize(uLPDirs[i]);
        float len=uBondLen*0.92;
        vec3 center=dir*(len*0.88);
        mat3 B=basisFromDir(dir);
        vec3 q=mulByTranspose(B, (pr-center));
        float dell=sdEllipsoid(q, vec3(0.36*uLPScale,0.36*uLPScale,0.52*uLPScale));
        if(dell<res.d){ res.d=dell; res.col=uLPColor; }
      }
      return res;
    }

    vec3 calcNormal(vec3 p){
      float e=0.0015; vec2 h=vec2(1.0,-1.0)*0.5773;
      return normalize( h.xyy*map(p+h.xyy*e).d + h.yyx*map(p+h.yyx*e).d + h.yxy*map(p+h.yxy*e).d + h.xxx*map(p+h.xxx*e).d );
    }
    float softShadow(vec3 ro, vec3 rd){
      float res=1.0; float t=0.02;
      for(int i=0;i<32;i++){ vec3 p=ro+rd*t; float h=map(p).d; res=min(res,8.0*h/t); t+=clamp(h,0.02,0.25); if(res<0.001||t>10.0) break; }
      return clamp(res,0.0,1.0);
    }
    vec3 saturateColor(vec3 c, float s){ float l=dot(c, vec3(0.299,0.587,0.114)); return mix(vec3(l), c, s); }

    void main(){
      vec3 fwd=normalize(uTarget-uEye); mat3 cam=look(fwd, uUp);
      vec2 uv=vUV*2.0-1.0; uv.x*=uRes.x/uRes.y;
      vec3 rd=normalize(cam*normalize(vec3(uv,1.25))); vec3 ro=uEye;

      float t=0.0; vec3 col=vec3(0.0); float fog=0.0; float hitFlag=0.0;
      for(int i=0;i<128;i++){
        vec3 p=ro+rd*t; Hit h=map(p);
        if(h.d<0.001){
          vec3 n=calcNormal(p);
          vec3 ldir=normalize(-uEye);
          float diff=max(dot(n,ldir),0.0);
          float sh=softShadow(p+n*0.01, ldir);
          float spec=pow(max(dot(reflect(-ldir,n), -rd), 0.0), 40.0);
          float amb=clamp(uAmbient,0.0,1.0);
          float diff2=max(dot(n, normalize(vec3(0.6,0.5,0.2))), 0.0)*0.35;

          vec3 lit=h.col*(amb+(1.0-amb)*(diff*sh*0.85+diff2));
          lit=saturateColor(lit,uSat);
          vec3 env=envMap(reflect(-rd,n));
          vec3 reflMix=mix(lit,env,clamp(uRefl,0.0,0.8));
          float rim=pow(1.0-max(dot(n,-rd),0.0),3.0);
          col=clamp(reflMix+vec3(spec)*uSpecK+vec3(rim)*0.08,0.0,1.0);
          fog=1.0-exp(-0.05*t); hitFlag=1.0; break;
        }
        t+=h.d; if(t>30.0) break;
      }

      vec3 bg=envMap(rd);
      vec3 colFog=mix(bg,col,1.0-fog);
      col=mix(bg,colFog,hitFlag);
      col=pow(col, vec3(1.0/2.2));
      gl_FragColor=vec4(col,1.0);
    }
  `;

  function compile(type,src){
    var s=gl.createShader(type);
    gl.shaderSource(s,src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){
      var info=gl.getShaderInfoLog(s)||'erro ao compilar shader';
      console.error(info);
      alert(info);
      throw new Error(info);
    }
    return s;
  }
  function program(vs,fs){
    var p=gl.createProgram();
    gl.attachShader(p,vs); gl.attachShader(p,fs);
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){
      var info=gl.getProgramInfoLog(p)||'erro link';
      console.error(info); alert(info); throw new Error(info);
    }
    return p;
  }

  var prog=program(compile(gl.VERTEX_SHADER, VERT), compile(gl.FRAGMENT_SHADER, FRAG));
  gl.useProgram(prog);

  var quad=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  var aPos=gl.getAttribLocation(prog,'aPos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,2,gl.FLOAT,false,0,0);

  var U={
    uRes:gl.getUniformLocation(prog,'uRes'), uEye:gl.getUniformLocation(prog,'uEye'), uTarget:gl.getUniformLocation(prog,'uTarget'), uUp:gl.getUniformLocation(prog,'uUp'),
    uLigCount:gl.getUniformLocation(prog,'uLigCount'), uLigDirs:gl.getUniformLocation(prog,'uLigDirs[0]'),
    uLPCount:gl.getUniformLocation(prog,'uLPCount'), uLPDirs:gl.getUniformLocation(prog,'uLPDirs[0]'),
    uBondLen:gl.getUniformLocation(prog,'uBondLen'), uCentralR:gl.getUniformLocation(prog,'uCentralR'), uLigR:gl.getUniformLocation(prog,'uLigR'), uBondR:gl.getUniformLocation(prog,'uBondR'),
    uLPScale:gl.getUniformLocation(prog,'uLPScale'), uAmbient:gl.getUniformLocation(prog,'uAmbient'), uSat:gl.getUniformLocation(prog,'uSat'), uSpecK:gl.getUniformLocation(prog,'uSpecK'),
    uRefl:gl.getUniformLocation(prog,'uRefl'), uLigColor:gl.getUniformLocation(prog,'uLigColor'), uLPColor:gl.getUniformLocation(prog,'uLPColor'), uCoreColor:gl.getUniformLocation(prog,'uCoreColor'),
    uShowAxes:gl.getUniformLocation(prog,'uShowAxes'), uBondType:gl.getUniformLocation(prog,'uBondType'), uRot:gl.getUniformLocation(prog,'uRot'),
    uBGStars:gl.getUniformLocation(prog,'uBGStars'), uBGBright:gl.getUniformLocation(prog,'uBGBright')
  };

  function hexToRgb(hex){ var h=hex.replace('#',''); var v=parseInt(h,16); return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]; }
  function padVecArray(arr,t){ var out=[]; for(var i=0;i<arr.length;i++){ out.push(arr[i][0],arr[i][1],arr[i][2]); } while(out.length<t*3) out.push(0,0,0); return new Float32Array(out.slice(0,t*3)); }

  function autoDist(){ var bl=parseFloat(bondLen.value); var R=Math.max(parseFloat(size.value), parseFloat(ligandRadius.value))+bl+0.5; return Math.min(10, Math.max(3.2, R*1.55)); }
  function eye(){ var ex=camDist*Math.cos(rotX)*Math.sin(rotY); var ey=camDist*Math.sin(rotX); var ez=camDist*Math.cos(rotX)*Math.cos(rotY); return [ex,ey,ez]; }

  function geomPositions(type){
    var Uv={
      linear:[[0,0,1],[0,0,-1]],
      trigonal_planar:[[1,0,0],[Math.cos(2*Math.PI/3),Math.sin(2*Math.PI/3),0],[Math.cos(4*Math.PI/3),Math.sin(4*Math.PI/3),0]],
      tetra:(function(){var v=[[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]]; for(var i=0;i<v.length;i++){ var n=v[i]; var L=Math.hypot(n[0],n[1],n[2]); v[i]=[n[0]/L,n[1]/L,n[2]/L]; } return v;})(),
      tbp:(function(){ var eq=[[1,0,0],[Math.cos(2*Math.PI/3),Math.sin(2*Math.PI/3),0],[Math.cos(4*Math.PI/3),Math.sin(4*Math.PI/3),0]]; var ax=[[0,0,1],[0,0,-1]]; return {eq:eq,ax:ax};})(),
      oct:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]
    };
    switch(type){
      case 'linear': return {lig:Uv.linear, lp:[], label:'Linear', arr:'AX2', ideal:'Ângulo 180°'};
      case 'trigonal_planar': return {lig:Uv.trigonal_planar, lp:[], label:'Trigonal planar', arr:'AX3', ideal:'Ângulos ~120°'};
      case 'tetrahedral': return {lig:Uv.tetra, lp:[], label:'Tetraédrica', arr:'AX4', ideal:'Ângulos ~109,5°'};
      case 'trigonal_bipyramidal': return {lig:Uv.tbp.eq.concat(Uv.tbp.ax), lp:[], label:'Bipirâmide trigonal', arr:'AX5', ideal:'Equatorial 120°, Axial 90°'};
      case 'octahedral': return {lig:Uv.oct, lp:[], label:'Octaédrica', arr:'Ângulos 90°/180°'};
      case 'bent_tp': { var lp1=[Uv.trigonal_planar[1]]; var lig1=[Uv.trigonal_planar[0],Uv.trigonal_planar[2]]; return {lig:lig1, lp:lp1, label:'Angular (base trigonal planar)', arr:'AX2E', ideal:'Ângulo <120°'}; }
      case 'trigonal_pyramidal': { var lp2=[Uv.tetra[0]]; var lig2=[Uv.tetra[1],Uv.tetra[2],Uv.tetra[3]]; return {lig:lig2, lp:lp2, label:'Piramidal trigonal', arr:'AX3E', ideal:'Ângulo <109,5°'}; }
      case 'bent_tet': { var lp3=[Uv.tetra[0],Uv.tetra[1]]; var lig3=[Uv.tetra[2],Uv.tetra[3]]; return {lig:lig3, lp:lp3, label:'Angular (base tetraédrica)', arr:'AX2E2', ideal:'Ângulo ~104,5°'}; }
      case 'see_saw': { var lp4=[Uv.tbp.eq[0]]; var lig4=[Uv.tbp.eq[1],Uv.tbp.eq[2],Uv.tbp.ax[0],Uv.tbp.ax[1]]; return {lig:lig4, lp:lp4, label:'Gangorra / Seesaw', arr:'AX4E', ideal:'Equatorial ~120°, Axial ~90°'}; }
      case 't_shaped': { var lp5=[Uv.tbp.eq[0],Uv.tbp.eq[1]]; var lig5=[Uv.tbp.eq[2],Uv.tbp.ax[0],Uv.tbp.ax[1]]; return {lig:lig5, lp:lp5, label:'Em T', arr:'AX3E2', ideal:'Ângulos ~90°'}; }
      case 'linear_tbp': { var lp6=Uv.tbp.eq.slice(); var lig6=[Uv.tbp.ax[0],Uv.tbp.ax[1]]; return {lig:lig6, lp:lp6, label:'Linear (base TBP)', arr:'AX2E3', ideal:'Ângulo 180°'}; }
      case 'square_pyramidal': { var lp7=[[0,0,1]]; var lig7=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,-1]]; return {lig:lig7, lp:lp7, label:'Piramidal quadrada', arr:'AX5E', ideal:'Ângulos ~90°'}; }
      case 'square_planar': { var lp8=[[0,0,1],[0,0,-1]]; var lig8=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]]; return {lig:lig8, lp:lp8, label:'Quadrada planar', arr:'Ângulos 90°/180°'}; }
      default: return {lig:Uv.tetra, lp:[], label:'Tetraédrica', arr:'AX4', ideal:'~109,5°'};
    }
  }

  function sync(){
    var G=geomPositions(geom.value);
    gl.useProgram(prog);
    gl.uniform1i(U.uLigCount, G.lig.length);
    gl.uniform3fv(U.uLigDirs, padVecArray(G.lig,8));
    gl.uniform1i(U.uLPCount, G.lp.length);
    gl.uniform3fv(U.uLPDirs, padVecArray(G.lp,8));
    gl.uniform1f(U.uBondLen, parseFloat(bondLen.value));
    gl.uniform1f(U.uCentralR, parseFloat(size.value));
    gl.uniform1f(U.uLigR, parseFloat(ligandRadius.value));
    gl.uniform1f(U.uBondR, parseFloat(bondRadius.value));
    gl.uniform1f(U.uLPScale, parseFloat(lpScale.value));
    gl.uniform1f(U.uAmbient, parseFloat(ambient.value));
    gl.uniform1f(U.uSat, parseFloat(sat.value));
    gl.uniform1f(U.uSpecK, parseFloat(specK.value));
    gl.uniform1f(U.uRefl, parseFloat(refl.value));
    gl.uniform3fv(U.uLigColor, new Float32Array(hexToRgb(ligandColor.value)));
    gl.uniform3fv(U.uLPColor, new Float32Array(hexToRgb(lpColor.value)));
    gl.uniform3fv(U.uCoreColor, new Float32Array(hexToRgb(coreColor.value)));
    gl.uniform1i(U.uShowAxes, showAxes.checked?1:0);
    gl.uniform1i(U.uBondType, parseInt(bondType.value,10));
    gl.uniform1f(U.uBGStars, parseFloat(bgStars.value));
    gl.uniform1f(U.uBGBright, parseFloat(bgBrightness.value));

    infoName.textContent = geom.options[geom.selectedIndex].textContent.split('(')[0].trim();
    var G2=geomPositions(geom.value);
    infoArr.textContent = G2.arr; infoIdeal.textContent = G2.ideal;
    camDist = autoDist();
    document.getElementById('hud').innerHTML='<b>'+G2.label+'</b> · <span class="small">'+G2.arr+' — '+G2.ideal+'</span>';
  }

  // primeiro sync antes do render
  sync();

  function draw(){
    resize();
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    var ex=camDist*Math.cos(rotX)*Math.sin(rotY), ey=camDist*Math.sin(rotX), ez=camDist*Math.cos(rotX)*Math.cos(rotY);
    gl.uniform3f(U.uEye, ex,ey,ez);
    gl.uniform3f(U.uTarget, 0,0,0);
    gl.uniform3f(U.uUp, 0,1,0);
    gl.uniform3f(U.uRot, rot.x, rot.y, rot.z);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(draw);
  }
  draw();

  function hexToRgb(hex){ var h=hex.replace('#',''); var v=parseInt(h,16); return [(v>>16&255)/255,(v>>8&255)/255,(v&255)/255]; }
  function padVecArray(arr,t){ var out=[]; for(var i=0;i<arr.length;i++){ out.push(arr[i][0],arr[i][1],arr[i][2]); } while(out.length<t*3) out.push(0,0,0); return new Float32Array(out.slice(0,t*3)); }
  function autoDist(){ var bl=parseFloat(bondLen.value); var R=Math.max(parseFloat(size.value), parseFloat(ligandRadius.value))+bl+0.5; return Math.min(10, Math.max(3.2, R*1.55)); }
})();
