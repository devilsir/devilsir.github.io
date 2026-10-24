/* VOICES · edição de interiores: rotação, reposicionamento e prévia persistente. */
(function(){
'use strict';
const V=window.V,H=V.Homestead,W=V.World,R=V.Rooms,C=V.Cozy,L=V.Life,T=48,esc=V.escape;
if(!H||!V.HomeLiving)return;
const normalize=a=>((Math.round((Number(a)||0)/90)*90)%360+360)%360;
const itemBy=id=>H.catalog.find(i=>i.id===id);
const roomsOf=id=>W.maps[id]?.design?.construction?.rooms||[];
const currentObject=(map,id)=>W.maps[map]?.objects?.find(o=>o.playerFurniture===id);
const allPlaced=map=>H.ensure()?.placed?.[map]||[];
const bbox=(item,x,y,rot)=>{const z=(item.size||2)*T,solid=item.solid!==false;const turns=normalize(rot)%180===90;return{x:x-(turns?12:z*.30),y:y-23-(turns?z*.30:12),w:(turns?24:z*.60),h:(turns?z*.60:24),solid};};
const overlap=(a,b,pad=4)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
const scenePaint=(ctx,item,x,y,rotation,size,opacity=1)=>{if(!item)return;const z=size||((item.size||2)*T);ctx.save();ctx.globalAlpha*=opacity;ctx.translate(x,y-z*.49);ctx.rotate(normalize(rotation)*Math.PI/180);ctx.imageSmoothingEnabled=false;C.prop(ctx,item.family,item.prop,-z/2,-z/2,z);ctx.restore();};
// Os ângulos ficam no save (h.placed), não em uma configuração temporária da interface.
const originalApply=H.applyFurniture.bind(H);
H.applyFurniture=function(map=null){const output=originalApply(map),h=this.ensure();if(!h)return output;for(const id of map?[map]:h.owned){const m=W.maps[id];if(!m)continue;for(const p of h.placed[id]||[]){p.rotation=normalize(p.rotation);const o=currentObject(id,p.id);if(!o)continue;o.scene.rotation=p.rotation;o.furnitureRotation=p.rotation;const item=itemBy(p.item);if(!item||item.solid===false)continue;const owners=new Set([o.id,'solid-'+o.id,o.scene.hostDecor,'host-'+o.id]);m.solids=m.solids.filter(s=>!owners.has(s.owner));const box=bbox(item,p.x,p.y,p.rotation);m.solids.push({...box,owner:o.id});}m.cache=null;m.geometryRevision=(m.geometryRevision||0)+1;}return output;};
// O desenho de cada móvel da família home e home-plus usa sua rotação, inclusive tapetes.
const originalDraw=C.drawObject.bind(C);
C.drawObject=function(ctx,o,cam,t){if(!o.playerFurniture)return originalDraw(ctx,o,cam,t);const item=itemBy(o.furnitureItem),p=allPlaced(o.homeMap).find(p=>p.id===o.playerFurniture);if(!item)return originalDraw(ctx,o,cam,t);scenePaint(ctx,item,o.x-(cam?.x||0),o.y-(cam?.y||0),p?.rotation||0);if(W.nearest?.id===o.id)L.marker(ctx,o.x-(cam?.x||0),o.y-(cam?.y||0),'E','#ecd497');};
// Os tapetes recolhidos/rotacionados não podem ficar gravados sem rotação no cache do piso.
const originalGround=C.ground.bind(C);
C.ground=function(m){const temporarilyHidden=[];for(const o of m.objects||[]){if(o.playerFurniture&&itemBy(o.furnitureItem)?.solid===false){temporarilyHidden.push([o,o.scene.family]);o.scene.family='__temporary-hidden-floor__';}}try{return originalGround(m);}finally{for(const [o,family] of temporarilyHidden)o.scene.family=family;}};
// Valida a orientação real, os limites dos cômodos, outros móveis e as portas.
H.canArrange=function(id,item,x,y,rotation=0,ignoreId=null){const m=W.maps[id],r=roomsOf(id),z=(item?.size||2)*T;if(!m||!item||!r.length||![x,y].every(Number.isFinite))return false;
 const rot=normalize(rotation),extent=z*.43, corners=[[x-extent,y-z*.88],[x+extent,y-z*.88],[x-extent,y-18],[x+extent,y-18]];
 // A prévia rotacionada tem caixa quadrada; só exigimos que o ponto de apoio e o volume permaneçam dentro de alguma sala.
 const inside=r.some(room=>corners.every(([a,b])=>R.pointIn(a,b,room.polygon)));
 if(!inside)return false;
 if((m.design?.construction?.doors||[]).some(d=>Math.hypot(d.x-x,d.y-y)<105))return false;
 if(item.solid===false)return true;
 const box=bbox(item,x,y,rot);
 for(const o of m.objects){if(o.playerFurniture===ignoreId)continue;if(!o.household&&!o.playerFurniture)continue;
 const other=itemBy(o.furnitureItem)||V.HomeLiving.item(o);if(!other||other.solid===false)continue;
 const placed=o.playerFurniture&&allPlaced(id).find(p=>p.id===o.playerFurniture);if(overlap(box,bbox(other,o.x,o.y,placed?.rotation||0),5))return false;
 }
 const ignoreObject=currentObject(id,ignoreId);
 const ignoreOwners=new Set(ignoreObject?[ignoreObject.id,ignoreObject.scene?.hostDecor,'solid-'+ignoreObject.id]:[]);
 for(const s of m.solids||[]){if(ignoreOwners.has(s.owner))continue;if(m.objects.some(o=>o.playerFurniture&&o.playerFurniture!==ignoreId&&[o.id,o.scene?.hostDecor,'solid-'+o.id].includes(s.owner)))continue;
 if(m.objects.some(o=>o.household&&[o.id,o.scene?.hostDecor,'solid-'+o.id].includes(s.owner)))continue;
 if(overlap(box,s,1))return false;
 }
 return true;
};
function remainsAccessible(id){const m=W.maps[id],door=m?.design?.construction?.doors?.find(d=>d.to),start=door&&R.approach(m,door,48);if(!start)return true;const essential=m.objects.filter(o=>o.household&&(H.isBed(o)||o.scene.family==='home'&&[19,8,4].includes(o.scene.prop)));return essential.every(o=>R.navigation(m,start,{x:o.x,y:o.y+12},9).length>0);}
// Mesma operação para inserir, reposicionar ou girar: no erro, o save anterior é restaurado.
H.commitArrangement=function(id,itemId,x,y,rotation=0,existingId=null){const h=this.ensure(),item=itemBy(itemId);if(!this.owned(id)||!item)return false;const old=existingId?allPlaced(id).find(p=>p.id===existingId):null;if(existingId&&!old)return false;if(!old&&!(h.furniture[itemId]>0))return false;
 if(!this.canArrange(id,item,x,y,rotation,existingId))return false;
 h.placed[id]||=[];const backup=h.placed[id].map(p=>({...p})),serial=h.serial;
 if(old){Object.assign(old,{x,y,rotation:normalize(rotation)});}else{h.placed[id].push({id:'furniture-'+(++h.serial),item:itemId,x,y,rotation:normalize(rotation)});}
 try{this.applyFurniture(id);if(!remainsAccessible(id))throw Error('passagem');if(!old)h.furniture[itemId]--;L.achieve('home-decorator');V.Save.save();return true;}
 catch(e){h.placed[id]=backup;h.serial=serial;this.applyFurniture(id);V.UI.toast('Não é possível bloquear a passagem até os cômodos.');return false;}
};
// Compatibilidade com gravações antigas e com qualquer atalho do tutorial.
H.placeFurniture=function(id,itemId,x,y,rotation=0){return this.commitArrangement(id,itemId,x,y,rotation);};
const lastApply=H.applyFurniture.bind(H);
H.restoreFurnitureOrientation=function(){return lastApply(null);};
const collection=(h,id)=>H.catalog.filter(item=>h.furniture[item.id]>0);
function fitMap(m,canvas){const rs=roomsOf(m.id),pts=rs.flatMap(r=>r.polygon),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),bound={x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};const scale=Math.min((canvas.width-56)/bound.w,(canvas.height-56)/bound.h,2);return{scale,origin:{x:(canvas.width-bound.w*scale)/2-bound.x*scale,y:(canvas.height-bound.h*scale)/2-bound.y*scale},bound};}
H.organize=function(id){if(!this.owned(id))return this.property(id);const h=this.ensure(),m=W.maps[id];if(!m)return;this.organizeId=id;
 let mode='stored',selected='',rotation=0,cursor=null,grid=true;
 const options=()=>collection(h,id).map(i=>`<option value="${esc(i.id)}">${esc(i.name)} ×${h.furniture[i.id]}</option>`).join('');
 V.UI.modal('Decorar · '+m.name,'PLANTA INTERATIVA · SUA CASA',`
 <div class="home-arrange-help">Arraste o móvel para a posição desejada. Use <strong>↶ ↷</strong> para girar, confirme para instalar. Clique num móvel já colocado para mudar de lugar.</div>
 <div class="home-arrange home-arrange-v2"><section class="home-plan-column">
 <div class="home-arrange-toolbar"><label class="field">Móvel do depósito<select id="home-place-item"><option value="">Escolha um móvel</option>${options()}</select></label><label class="home-grid-toggle"><input type="checkbox" id="home-grid-toggle" checked> Grade</label></div>
 <canvas id="home-floorplan" width="800" height="600" tabindex="0" role="img" aria-label="Planta interativa. Clique para posicionar; teclas direcionais movem; Q e R giram; Enter confirma; Escape cancela."></canvas>
 <div class="home-arrange-controls"><button id="home-turn-left" class="secondary" aria-label="Girar à esquerda 90 graus">↶ 90°</button><button id="home-turn-right" class="secondary" aria-label="Girar à direita 90 graus">↷ 90°</button><strong id="home-angle">0°</strong><button id="home-arrange-cancel" class="quiet">Cancelar seleção</button><button id="home-arrange-confirm" class="primary">Colocar móvel</button></div>
 <p id="home-place-status" class="home-arrange-status" role="status" aria-live="polite">Escolha um móvel ou selecione um instalado na lista.</p>
 </section><aside class="home-arrange-sidebar"><h3>Instalados nesta casa</h3><div id="home-installed-editor">${(h.placed[id]||[]).map(p=>`<div class="home-arranged-item"><span><strong>${esc(itemBy(p.item)?.name||p.item)}</strong><small>${normalize(p.rotation)}° · móvel seu</small></span><button data-home-edit="${esc(p.id)}" class="secondary">Mover / girar</button><button data-furniture-remove="${esc(p.id)}" class="quiet">Guardar</button></div>`).join('')||'<p class="muted">Nenhum móvel extra instalado.</p>'}</div>
 <h3>Mobília que já veio com a casa</h3><div class="home-installed-original">${m.objects.filter(o=>o.household&&!o.playerFurniture&&V.HomeLiving.item(o)).map(o=>`<div class="home-arranged-item"><span>${esc(V.HomeLiving.item(o).name)}</span><button data-home-original="${esc(o.id)}" class="quiet">Guardar</button></div>`).join('')||'<p class="muted">Toda a mobília original desta casa está no depósito.</p>'}</div>
 <h3>Depósito</h3><div class="home-storage-summary">${collection(h,id).map(i=>`<button data-home-select="${esc(i.id)}" class="home-storage-pick">${esc(i.name)} <b>×${h.furniture[i.id]}</b></button>`).join('')||'<p class="muted">Depósito vazio. Você pode comprar móveis novos.</p>'}</div>
 <button id="home-arrange-shop" class="secondary">Ir à loja de móveis</button><button id="home-arrange-storage" class="secondary">Guardar ou vender a mobília</button><button id="home-arrange-route" class="quiet">Rastrear esta casa</button>
 </aside></div>`,undefined,true);
 const canvas=V.$('#home-floorplan'),ctx=canvas.getContext('2d'),itemSelect=V.$('#home-place-item'),angle=V.$('#home-angle'),status=V.$('#home-place-status'),confirm=V.$('#home-arrange-confirm'),{origin,scale,bound}=fitMap(m,canvas);
 const snap=v=>Math.round((v-24)/T)*T+24;
 const setStatus=(t,ok)=>{status.textContent=t;status.dataset.valid=ok?'true':'false';};
 const item=()=>mode==='installed'?itemBy(allPlaced(id).find(p=>p.id===selected)?.item):itemBy(selected);
 const chosen=()=>mode==='installed'?allPlaced(id).find(p=>p.id===selected):null;
 const valid=()=>!!(cursor&&item()&&this.canArrange(id,item(),cursor.x,cursor.y,rotation,mode==='installed'?selected:null));
 const paint=()=>{const w=canvas.width,hh=canvas.height;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,hh);ctx.fillStyle='#152b27';ctx.fillRect(0,0,w,hh);ctx.save();ctx.translate(origin.x,origin.y);ctx.scale(scale,scale);
 for(const room of roomsOf(id)){const b=R.box(room.polygon);ctx.beginPath();room.polygon.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle='#c6b08e';ctx.fill();ctx.save();ctx.clip();if(grid){ctx.strokeStyle='#795f4b40';ctx.lineWidth=1/scale;for(let x=Math.floor(b.x/T)*T;x<b.x+b.w;x+=T){ctx.beginPath();ctx.moveTo(x,b.y);ctx.lineTo(x,b.y+b.h);ctx.stroke();}for(let y=Math.floor(b.y/T)*T;y<b.y+b.h;y+=T){ctx.beginPath();ctx.moveTo(b.x,y);ctx.lineTo(b.x+b.w,y);ctx.stroke();}}ctx.restore();ctx.strokeStyle='#496052';ctx.lineWidth=8/scale;ctx.stroke();}
 for(const d of m.design.construction.doors){ctx.save();ctx.fillStyle='#e2eccc';ctx.beginPath();ctx.arc(d.x,d.y,14/scale,0,Math.PI*2);ctx.fill();ctx.fillStyle='#214437';ctx.font=`${12/scale}px sans-serif`;ctx.textAlign='center';ctx.fillText('↔',d.x,d.y+4/scale);ctx.restore();}
 for(const o of m.objects.filter(o=>o.household||o.playerFurniture)){if(o.playerFurniture===selected&&mode==='installed')continue;const product=itemBy(o.furnitureItem)||V.HomeLiving.item(o);if(!product)continue;const p=o.playerFurniture&&allPlaced(id).find(a=>a.id===o.playerFurniture);scenePaint(ctx,product,o.x,o.y,p?.rotation||0);}
 if(cursor&&item()){const okay=valid(),product=item(),z=(product.size||2)*T;scenePaint(ctx,product,cursor.x,cursor.y,rotation,undefined,.83);ctx.strokeStyle=okay?'#65f3b4':'#ff7878';ctx.lineWidth=3/scale;ctx.setLineDash([7/scale,4/scale]);ctx.strokeRect(cursor.x-z*.45,cursor.y-z*.9,z*.9,z*.95);ctx.setLineDash([]);}
 ctx.restore();angle.textContent=rotation+'°';confirm.disabled=!valid();confirm.textContent=mode==='installed'?'Salvar posição e rotação':'Colocar móvel';
 };
 const selectStored=id=>{if(!itemBy(id)||!(h.furniture[id]>0))return;mode='stored';selected=id;rotation=0;itemSelect.value=id;cursor={x:snap(bound.x+bound.w/2),y:snap(bound.y+bound.h*.70)};setStatus('Clique na planta para posicionar. Ajuste a rotação e confirme.',true);paint();};
 const selectInstalled=id=>{const p=allPlaced(this.organizeId).find(x=>x.id===id);if(!p)return;mode='installed';selected=id;rotation=normalize(p.rotation);cursor={x:p.x,y:p.y};itemSelect.value='';setStatus('Reposicione ou gire '+(itemBy(p.item)?.name||'o móvel')+'. Depois salve.',true);paint();canvas.focus();};
 const cancel=()=>{mode='stored';selected='';rotation=0;cursor=null;itemSelect.value='';setStatus('Selecione um móvel do depósito ou um dos já instalados.',false);paint();};
 const rotate=delta=>{if(!item()){setStatus('Selecione um móvel antes de girar.',false);return;}rotation=normalize(rotation+delta);setStatus('Rotação: '+rotation+'°. '+(valid()?'Posição disponível.':'Escolha outro espaço.'),valid());paint();};
 const submit=()=>{if(!item()||!cursor)return;if(!valid()){setStatus('Posição inválida: livre as portas e não sobreponha móveis.',false);return;}const product=item(),ok=mode==='installed'?this.commitArrangement(id,product.id,cursor.x,cursor.y,rotation,selected):this.placeFurniture(id,product.id,cursor.x,cursor.y,rotation);if(ok){this.organize(id);}else{setStatus('O móvel bloquearia uma passagem. Tente outro ponto.',false);paint();}};
 itemSelect.onchange=()=>itemSelect.value?selectStored(itemSelect.value):cancel();V.$$('[data-home-select]').forEach(b=>b.onclick=()=>selectStored(b.dataset.homeSelect));V.$$('[data-home-edit]').forEach(b=>b.onclick=()=>selectInstalled(b.dataset.homeEdit));V.$$('[data-furniture-remove]').forEach(b=>b.onclick=()=>{if(this.removeFurniture(id,b.dataset.furnitureRemove))this.organize(id);});V.$$('[data-home-original]').forEach(b=>b.onclick=()=>{if(this.storeObject(id,b.dataset.homeOriginal))this.organize(id);});
 V.$('#home-turn-left').onclick=()=>rotate(-90);V.$('#home-turn-right').onclick=()=>rotate(90);V.$('#home-arrange-cancel').onclick=cancel;confirm.onclick=submit;V.$('#home-grid-toggle').onchange=e=>{grid=e.target.checked;paint();};
 V.$('#home-arrange-shop').onclick=()=>this.homeShop('buy',id);V.$('#home-arrange-storage').onclick=()=>this.homeShop('stored',id);V.$('#home-arrange-route').onclick=()=>this.track(id);
 const pointer=e=>{const r=canvas.getBoundingClientRect();return{x:((e.clientX-r.left)*canvas.width/r.width-origin.x)/scale,y:((e.clientY-r.top)*canvas.height/r.height-origin.y)/scale};};
 const choosePosition=e=>{if(!item())return;const p=pointer(e);cursor={x:snap(p.x),y:snap(p.y)};setStatus(valid()?'Local livre. Confirme para salvar.':'Área ocupada ou passagem bloqueada.',valid());paint();};
 let drag=false;canvas.addEventListener('pointerdown',e=>{if(!item()){const p=pointer(e),near=allPlaced(id).map(a=>({...a,d:Math.hypot(a.x-p.x,a.y-p.y)})).sort((a,b)=>a.d-b.d)[0];if(near&&near.d<65){selectInstalled(near.id);return;}}if(!item())return;drag=true;canvas.setPointerCapture?.(e.pointerId);choosePosition(e);});
 canvas.addEventListener('pointermove',e=>{if(drag)choosePosition(e);});canvas.addEventListener('pointerup',()=>drag=false);canvas.addEventListener('pointercancel',()=>drag=false);
 canvas.addEventListener('keydown',e=>{const d={ArrowLeft:[-T,0],ArrowRight:[T,0],ArrowUp:[0,-T],ArrowDown:[0,T]}[e.key];if(d&&item()){e.preventDefault();if(!cursor)cursor={x:snap(bound.x+bound.w/2),y:snap(bound.y+bound.h/2)};cursor={x:cursor.x+d[0],y:cursor.y+d[1]};setStatus(valid()?'Posição disponível.':'Passagem bloqueada ou fora da casa.',valid());paint();}else if(e.key.toLowerCase()==='r'){e.preventDefault();rotate(90);}else if(e.key.toLowerCase()==='q'){e.preventDefault();rotate(-90);}else if(e.key==='Enter'){e.preventDefault();submit();}else if(e.key==='Escape'){e.preventDefault();cancel();}});
 paint();
};
})();
