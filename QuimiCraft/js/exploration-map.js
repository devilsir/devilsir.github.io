"use strict";

globalThis.QuimiCraftExplorationMap=(()=>{
  const cellSize=8,revealRadius=3.4,limit=1_000_000;
  const cellAt=value=>Math.floor(value/cellSize);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

  function createSurvey(){
    const rows=new Map();
    let previousX,previousZ,total=0;

    function mark(z,first,last){
      const ranges=rows.get(z)??[];
      let index=0;
      while(index<ranges.length&&ranges[index][1]<first-1)index++;
      let end=index;
      while(end<ranges.length&&ranges[end][0]<=last+1){
        const [left,right]=ranges[end++];
        first=Math.min(first,left);
        last=Math.max(last,right);
        total-=right-left+1;
      }
      ranges.splice(index,end-index,[first,last]);
      rows.set(z,ranges);
      total+=last-first+1;
    }

    function reveal(x,z){
      if(!Number.isFinite(x)||!Number.isFinite(z))return;
      const cx=cellAt(x),cz=cellAt(z);
      if(Math.abs(cx)>limit-4||Math.abs(cz)>limit-4||cx===previousX&&cz===previousZ)return;
      previousX=cx;previousZ=cz;
      for(let dz=-3;dz<=3;dz++){
        const span=Math.floor(Math.sqrt(revealRadius**2-dz**2));
        mark(cz+dz,cx-span,cx+span);
      }
    }

    function known(x,z){
      return rows.get(z)?.some(([first,last])=>x>=first&&x<=last)??false;
    }

    function save(){
      return [...rows.entries()].sort(([a],[b])=>a-b).flatMap(([z,ranges])=>ranges.map(([first,last])=>[z,first,last]));
    }

    function load(records){
      rows.clear();total=0;previousX=previousZ=undefined;
      if(!Array.isArray(records))return;
      for(const row of records){
        if(!Array.isArray(row)||row.length!==3||!row.every(value=>Number.isSafeInteger(value)&&Math.abs(value)<=limit))continue;
        const [z,first,last]=row;
        if(last>=first)mark(z,first,last);
      }
    }

    return {reveal,known,save,load,count:()=>total};
  }

  function createWaypoints(survey){
    const points=new Map();
    let active=null,nextId=1;
    const validPoint=(x,z)=>Number.isFinite(x)&&Number.isFinite(z)&&survey.known(cellAt(x),cellAt(z));
    const title=(name,id)=>(typeof name==="string"?name.trim().slice(0,48):"")||"Marcador "+id;

    function create({x,z},name){
      if(!validPoint(x,z))return null;
      if(nextId===Number.MAX_SAFE_INTEGER)nextId=1;
      while(points.has(nextId))nextId++;
      const id=nextId++;
      const point={id,x,z,name:title(name,id)};
      points.set(id,point);
      active=id;
      return point;
    }

    function load(data){
      points.clear();active=null;nextId=1;
      if(!Array.isArray(data?.points))return;
      for(const point of data.points){
        if(!Number.isSafeInteger(point?.id)||point.id<1||point.id>=Number.MAX_SAFE_INTEGER||
          !validPoint(point.x,point.z)||points.has(point.id))continue;
        points.set(point.id,{id:point.id,x:point.x,z:point.z,name:title(point.name,point.id)});
        nextId=Math.max(nextId,point.id+1);
      }
      if(points.has(data.active))active=data.active;
    }

    return {
      create,load,validPoint,
      list:()=>[...points.values()],
      current:()=>points.get(active)??null,
      select(id){active=points.has(id)?id:null},
      remove(id){
        points.delete(id);
        if(active===id)active=null;
      },
      save:()=>({points:[...points.values()],active})
    };
  }

  function guideTo(point,position){
    const dx=point.x-position.x,dz=point.z-position.z;
    const bearing=Math.atan2(dx,-dz),turn=bearing+(position.yaw??0);
    const headings=["N","NE","L","SE","S","SO","O","NO"];
    const heading=headings[(Math.round(bearing/(Math.PI/4))+8)%8];
    return {angle:Math.atan2(Math.sin(turn),Math.cos(turn)),distance:Math.hypot(dx,dz),heading};
  }

  function createView(root,survey,{position,surface,landmarks,waypoints,onWaypointChange}){
    const canvas=root.querySelector("canvas"),context=canvas.getContext("2d"),frame=canvas.parentElement;
    const location=root.querySelector("#mapLocation"),extent=root.querySelector("#mapExtent"),scale=root.querySelector("#mapScale");
    const waypointSelect=root.querySelector("#mapWaypointSelect"),newWaypoint=root.querySelector("#mapWaypointNew");
    const waypointCenter=root.querySelector("#mapWaypointCenter"),waypointRemove=root.querySelector("#mapWaypointRemove");
    const waypointStatus=root.querySelector("#mapWaypointStatus"),waypointActions=root.querySelector("#mapWaypointActions");
    const waypointForm=root.querySelector("#mapWaypointForm"),waypointName=root.querySelector("#mapWaypointName");
    const fog="#182c35",cache=new Map();
    let x=0,z=0,zoom=18,drag=null,open=false,width=0,height=0,placing=false,draft=null,displayedPoints=[];

    function syncWaypoints(){
      const current=waypoints.current();
      const options=waypoints.list().map(point=>new Option(point.name,String(point.id)));
      waypointSelect.replaceChildren(new Option("Sem destino",""),...options);
      waypointSelect.value=current?String(current.id):"";
      waypointSelect.disabled=options.length===0;
      waypointCenter.disabled=waypointRemove.disabled=!current;
      waypointStatus.textContent=current?"Destino em X "+Math.floor(current.x)+" · Z "+Math.floor(current.z):
        options.length?"Selecione um marcador para guiar a viagem.":"Nenhum marcador salvo.";
    }

    function cancelPlacement(){
      if(!placing&&!draft)return false;
      placing=false;draft=null;
      waypointForm.hidden=true;waypointActions.hidden=false;
      newWaypoint.hidden=false;
      newWaypoint.textContent="Novo marcador";
      canvas.classList.remove("map-placing");
      syncWaypoints();draw();
      return true;
    }

    function changeDestination(id){
      waypoints.select(id);
      syncWaypoints();draw();onWaypointChange();
    }

    function markHere(px,py){
      if(draft)return;
      if(!placing){
        const hit=displayedPoints.find(point=>Math.hypot(px-point.px,py-point.py)<15);
        if(hit)changeDestination(hit.id);
        return;
      }
      const spot={x:Math.floor((x+(px-width/2)/zoom)*cellSize)+.5,z:Math.floor((z+(py-height/2)/zoom)*cellSize)+.5};
      if(!waypoints.validPoint(spot.x,spot.z)){
        waypointStatus.textContent="Escolha um ponto numa área explorada.";
        return;
      }
      draft=spot;placing=false;
      canvas.classList.remove("map-placing");
      newWaypoint.hidden=true;
      waypointActions.hidden=true;waypointForm.hidden=false;
      waypointStatus.textContent="Novo marcador em X "+Math.floor(spot.x)+" · Z "+Math.floor(spot.z);
      waypointName.value="";waypointName.focus();draw();
    }

    function terrain(cx,cz){
      const key=cx+","+cz;
      if(cache.has(key))return cache.get(key);
      if(cache.size>24000)cache.clear();
      const tile=surface((cx+.5)*cellSize,(cz+.5)*cellSize);
      const hill=tile.wet?0:clamp(tile.height-surface((cx+.5)*cellSize,(cz+.22)*cellSize).height,-8,8);
      const color=tile.color.map(channel=>clamp(channel+hill*2.6,0,255)|0);
      const fill="rgb("+color.join(",")+")";
      cache.set(key,fill);
      return fill;
    }

    function draw(){
      if(!open||!context)return;
      const box=frame.getBoundingClientRect();
      width=Math.floor(box.width);height=Math.floor(box.height);
      if(!width||!height)return;
      const density=Math.min(2,window.devicePixelRatio||1);
      canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);
      context.setTransform(density,0,0,density,0,0);
      context.fillStyle=fog;context.fillRect(0,0,width,height);
      const left=x-width/(2*zoom),top=z-height/(2*zoom);
      const firstX=Math.floor(left),lastX=Math.ceil(left+width/zoom);
      const firstZ=Math.floor(top),lastZ=Math.ceil(top+height/zoom);
      for(let cz=firstZ;cz<lastZ;cz++)for(let cx=firstX;cx<lastX;cx++){
        if(!survey.known(cx,cz))continue;
        context.fillStyle=terrain(cx,cz);
        const px=Math.floor((cx-left)*zoom),py=Math.floor((cz-top)*zoom);
        context.fillRect(px,py,Math.floor((cx+1-left)*zoom)-px,Math.floor((cz+1-top)*zoom)-py);
      }
      context.strokeStyle="#b5d2cf18";context.lineWidth=1;
      context.beginPath();
      const step=zoom<5?16:8;
      for(let i=Math.ceil(left/step)*step;i<lastX;i+=step){
        const px=(i-left)*zoom;context.moveTo(px,0);context.lineTo(px,height);
      }
      for(let i=Math.ceil(top/step)*step;i<lastZ;i+=step){
        const py=(i-top)*zoom;context.moveTo(0,py);context.lineTo(width,py);
      }
      context.stroke();
      context.font="600 12px system-ui";
      context.textBaseline="middle";
      const player=position(),playerX=(player.x/cellSize-left)*zoom,playerY=(player.z/cellSize-top)*zoom;
      for(const spot of landmarks()){
        if(!survey.known(cellAt(spot.x),cellAt(spot.z)))continue;
        const px=(spot.x/cellSize-left)*zoom,py=(spot.z/cellSize-top)*zoom;
        if(px<-8||px>width+8||py<-8||py>height+8)continue;
        context.fillStyle="#0d2028";context.fillRect(px-5,py-5,10,10);
        context.strokeStyle="#eac781";context.strokeRect(px-4.5,py-4.5,9,9);
        if(zoom>=5){
          const right=playerX>=px&&Math.abs(playerY-py)<19&&playerX-px<context.measureText(spot.name).width+16;
          const tx=px+(right?-9:9);
          context.textAlign=right?"right":"left";
          context.lineWidth=3;context.strokeStyle="#172b30";context.strokeText(spot.name,tx,py);
          context.fillStyle="#fff4db";context.fillText(spot.name,tx,py);
        }
      }
      context.textAlign="left";
      const current=waypoints.current();
      const points=waypoints.list().sort((a,b)=>Number(b.id===current?.id)-Number(a.id===current?.id));
      displayedPoints=[];
      for(const point of points){
        const px=(point.x/cellSize-left)*zoom,py=(point.z/cellSize-top)*zoom;
        if(px<-15||py<-15||px>width+15||py>height+15)continue;
        displayedPoints.push({id:point.id,px,py:py-6});
      }
      for(const point of [...displayedPoints].reverse())drawPin(point.px,point.py+6,point.id===current?.id);
      if(draft)drawPin((draft.x/cellSize-left)*zoom,(draft.z/cellSize-top)*zoom,true);
      context.save();
      context.translate(playerX,playerY);
      context.rotate(-player.yaw);
      context.beginPath();context.moveTo(0,-9);context.lineTo(6,6);context.lineTo(0,3);context.lineTo(-6,6);context.closePath();
      context.lineWidth=2;context.strokeStyle="#10232b";context.stroke();
      context.fillStyle="#fff0b6";context.fill();context.restore();
      const meters=zoom<4?256:zoom<8?128:zoom<15?64:32;
      scale.textContent=meters+" m";
      scale.style.width=Math.round(meters/cellSize*zoom)+"px";
    }

    function drawPin(px,py,active){
      context.beginPath();
      context.moveTo(px,py+1);
      context.lineTo(px-7,py-7);
      context.arc(px,py-9,7,Math.PI*.91,Math.PI*.09);
      context.closePath();
      context.lineWidth=active?2:1.35;context.strokeStyle="#10242c";
      context.fillStyle=active?"#f7c767":"#73dad0";context.fill();context.stroke();
      context.beginPath();context.arc(px,py-9,2.15,0,Math.PI*2);
      context.fillStyle="#183539";context.fill();
    }

    function center(){
      const player=position();x=player.x/cellSize;z=player.z/cellSize;draw();
    }

    function magnify(factor,px=width/2,py=height/2){
      const next=clamp(zoom*factor,2.25,30);
      x+=(px-width/2)*(1/zoom-1/next);
      z+=(py-height/2)*(1/zoom-1/next);
      zoom=next;draw();
    }

    new ResizeObserver(draw).observe(frame);
    root.querySelector("#mapZoomIn").onclick=()=>magnify(1.4);
    root.querySelector("#mapZoomOut").onclick=()=>magnify(1/1.4);
    root.querySelector("#mapCenter").onclick=center;
    newWaypoint.onclick=()=>{
      if(cancelPlacement())return;
      placing=true;newWaypoint.textContent="Cancelar";
      canvas.classList.add("map-placing");canvas.focus();
      waypointStatus.textContent="Clique ou toque numa área explorada. No teclado, mova o mapa e pressione Enter para marcar o centro.";
    };
    waypointSelect.onchange=()=>changeDestination(Number(waypointSelect.value)||null);
    waypointCenter.onclick=()=>{
      const point=waypoints.current();
      if(point){x=point.x/cellSize;z=point.z/cellSize;draw()}
    };
    waypointRemove.onclick=()=>{
      const point=waypoints.current();
      if(!point)return;
      waypoints.remove(point.id);
      syncWaypoints();draw();onWaypointChange();
      waypointStatus.textContent="Marcador removido.";
    };
    root.querySelector("#mapWaypointCancel").onclick=()=>{cancelPlacement();newWaypoint.focus()};
    waypointForm.onsubmit=event=>{
      event.preventDefault();
      if(!draft||!waypoints.create(draft,waypointName.value))return;
      cancelPlacement();
      onWaypointChange();waypointSelect.focus();
    };
    canvas.addEventListener("pointerdown",event=>{
      if(event.button!==0)return;
      canvas.focus();canvas.setPointerCapture(event.pointerId);
      drag={id:event.pointerId,x:event.clientX,z:event.clientY,moved:false};
    });
    canvas.addEventListener("pointermove",event=>{
      if(drag?.id!==event.pointerId)return;
      if(!drag.moved&&Math.hypot(drag.x-event.clientX,drag.z-event.clientY)<5)return;
      drag.moved=true;
      x+=(drag.x-event.clientX)/zoom;z+=(drag.z-event.clientY)/zoom;
      drag.x=event.clientX;drag.z=event.clientY;draw();
    });
    canvas.addEventListener("pointerup",event=>{
      if(drag?.id!==event.pointerId||drag.moved)return;
      const rect=canvas.getBoundingClientRect();
      markHere(event.clientX-rect.left,event.clientY-rect.top);
    });
    canvas.addEventListener("lostpointercapture",()=>{drag=null});
    canvas.addEventListener("wheel",event=>{
      event.preventDefault();magnify(event.deltaY<0?1.19:1/1.19,event.offsetX,event.offsetY);
    },{passive:false});
    canvas.addEventListener("keydown",event=>{
      const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},offset=arrows[event.key];
      if(offset){event.preventDefault();x+=offset[0]*28/zoom;z+=offset[1]*28/zoom;draw()}
      else if(["+","=","-"].includes(event.key)){event.preventDefault();magnify(event.key==="-"?1/1.4:1.4)}
      else if(placing&&event.key==="Enter"){event.preventDefault();markHere(width/2,height/2)}
    });
    root.addEventListener("keydown",event=>{
      if(event.key!=="Tab")return;
      const controls=[...root.querySelectorAll("button, canvas, input, select")].filter(control=>!control.disabled&&!control.closest("[hidden]"));
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    });

    return {
      open(){
        open=true;cache.clear();
        const player=position();
        location.textContent=player.biome+" · X "+Math.floor(player.x)+" · Z "+Math.floor(player.z);
        extent.textContent=new Intl.NumberFormat("pt-BR").format(survey.count()*cellSize**2)+" m² mapeados";
        syncWaypoints();center();canvas.focus();
      },
      cancelPlacement,
      close(){open=false;drag=null;cancelPlacement()}
    };
  }

  return {createSurvey,createWaypoints,guideTo,createView};
})();
