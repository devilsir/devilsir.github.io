(()=>{
'use strict';
const types={none:'Céu limpo',dawn:'Amanhecer',sunset:'Pôr do sol',night:'Noite estrelada',clouds:'Nublado',rain:'Chuva',snow:'Neve',sand:'Tempestade de areia',fog:'Neblina',aurora:'Aurora boreal',arcane:'Céu arcano',embers:'Cinzas e brasas'};
const tint={dawn:'#e9b46c',sunset:'#d67764',night:'#152955',clouds:'#789197',rain:'#435c78',snow:'#b9d4e4',sand:'#cb9b52',fog:'#b6c8c4',aurora:'#213e59',arcane:'#65427e',embers:'#814634'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const canvas=document.createElement('canvas'),g=canvas.getContext('2d');
const frac=n=>n-Math.floor(n),noise=n=>frac(Math.sin(n*127.1+311.7)*43758.5453);
let scope='map',scene='';
function ensureRegions(l){const used=new Set((l.regions||[]).map(r=>r?.id).filter(Boolean));for(const [i,r]of (l.regions||[]).entries()){if(!r||typeof r!=='object')continue;if(!r.id){let n=i+1;while(used.has('region-'+n))n++;r.id='region-'+n;used.add(r.id);}if(!r.center&&Array.isArray(r.bounds))r.center=[r.bounds[0]+r.bounds[2]/2,r.bounds[1]+r.bounds[3]/2];}}
function validate(l){ensureRegions(l);
 const check=s=>{if(s===undefined)return;if(!s||Array.isArray(s)||!Object.hasOwn(types,s.type)||!Number.isFinite(s.intensity)||s.intensity<0||s.intensity>1||!Number.isFinite(s.speed)||s.speed<0||s.speed>3)throw Error('Skybox inválido em '+l.id);};
 check(l.skybox);if(l.regions!==undefined&&!Array.isArray(l.regions))throw Error('Regiões inválidas.');
 if((l.regions||[]).length>256)throw Error('Regiões demais.');const ids=new Set();for(const r of l.regions||[]){if(!r||typeof r.id!=='string'||!r.id||r.id.length>120||ids.has(r.id)||typeof r.name!=='string'||r.name.length>160)throw Error('Identidade de região inválida.');ids.add(r.id);check(r.skybox);if(!Array.isArray(r.bounds)||r.bounds.length!==4||r.bounds.some(n=>!Number.isFinite(n))||r.bounds[0]<0||r.bounds[1]<0||r.bounds[2]<=0||r.bounds[3]<=0||r.bounds[0]+r.bounds[2]>l.bounds?.[2]||r.bounds[1]+r.bounds[3]>l.bounds?.[3])throw Error('Região do skybox inválida.');}return true;
}
function paint(s,cam,time,W,H){
 if(s.type==='none'||s.intensity<=0)return;const amount=s.intensity,motion=window.CHEMSCAPE_RPG?.settings.motion??1,t=time*s.speed*motion;
 g.save();g.globalAlpha=amount*.34;g.fillStyle=tint[s.type];g.fillRect(0,0,W,H);g.globalAlpha=amount;
 if(s.type==='dawn'||s.type==='sunset'){g.globalAlpha=amount*.06;g.fillStyle=s.type==='dawn'?'#ffe8a2':'#ffca85';for(let i=0;i<5;i++)g.fillRect(0,H*i/5,W,H/5-2);}
 if(['night','aurora','arcane'].includes(s.type))for(let i=0;i<42;i++){const x=Math.round(noise(i)*W-cam.x*.035)%W,y=Math.round(noise(i+71)*H-cam.y*.035)%H;g.globalAlpha=amount*(.16+.22*(.5+.5*Math.sin(t+i)));g.fillStyle=s.type==='arcane'?'#dfb5fa':'#e1eddf';g.fillRect((x+W)%W,(y+H)%H,i%9===0?3:2,2);}
 if(['clouds','fog','rain','snow','sand'].includes(s.type)){g.fillStyle=s.type==='sand'?'#e2bc75':'#d7e2da';g.globalAlpha=amount*(s.type==='fog'?.09:.055);for(let i=0;i<8;i++){const x=(noise(i+13)*(W+280)+t*(s.type==='fog'?6:12)-cam.x*.05)%(W+280)-140,y=noise(i+47)*H;g.fillRect(Math.round(x),Math.round(y),160+i%3*32,18+i%3*8);g.fillRect(Math.round(x+32),Math.round(y-12),96,16);}}
 if(s.type==='aurora'){for(let i=0;i<5;i++){g.globalAlpha=amount*.035;g.fillStyle=i%2?'#9b8fe8':'#75e4b2';g.fillRect(0,Math.round(H*.2+i*16+Math.sin(t*.2+i)*12),W,16);}}
 const count=Math.round((s.type==='rain'?65:s.type==='snow'?48:32)*amount);
 if(['rain','snow','sand','arcane','embers'].includes(s.type))for(let i=0;i<count;i++){
  const vy=s.type==='rain'?190:s.type==='snow'?22:s.type==='sand'?35:-14,vx=s.type==='sand'?115:s.type==='rain'?-40:9;
  const x=((noise(i+121)*(W+80)+t*vx-cam.x*.18)%(W+80)+W+80)%(W+80)-40,y=((noise(i+221)*(H+80)+t*vy-cam.y*.18)%(H+80)+H+80)%(H+80)-40;
  g.globalAlpha=amount*(s.type==='rain'?.48:.6);g.fillStyle={rain:'#b8d2df',snow:'#e9f0e3',sand:'#ecc589',arcane:'#cca0ed',embers:i%2?'#ffb258':'#d87b50'}[s.type];
  if(s.type==='rain'){g.fillRect(Math.round(x),Math.round(y),1,9);g.fillRect(Math.round(x-1),Math.round(y+8),1,3);}else g.fillRect(Math.round(x),Math.round(y),s.type==='snow'?3:2,2);
 }
 g.restore();
}
function draw(c,l,cam,time,W,H){
 const regions=(l.regions||[]).filter(r=>r.skybox);if(!l.skybox&&!regions.length)return false;
 if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;
 if(l.skybox)paint(l.skybox,cam,time,W,H);else window.CHEMSCAPE_BIOMES?.drawWeather(g,l,cam,time,W,H);
 for(const r of regions){const [x,y,w,h]=r.bounds,z=cam.zoom,px=Math.round((x-Math.round(cam.x))*z+W/2),py=Math.round((y-Math.round(cam.y))*z+H/2),pw=Math.ceil(w*z),ph=Math.ceil(h*z);if(px>W||py>H||px+pw<0||py+ph<0)continue;g.clearRect(px,py,pw,ph);g.save();g.beginPath();g.rect(px,py,pw,ph);g.clip();paint(r.skybox,cam,time,W,H);g.restore();}
 c.drawImage(canvas,0,0);return true;
}
let draft=null;
function bounds(l,b){const W=l.bounds[2],H=l.bounds[3],x=Math.max(0,Math.min(W-32,Math.round(Number(b[0])||0))),y=Math.max(0,Math.min(H-32,Math.round(Number(b[1])||0)));return [x,y,Math.max(32,Math.min(W-x,Math.round(Number(b[2])||32))),Math.max(32,Math.min(H-y,Math.round(Number(b[3])||32)))];}
function selected(l){return (l.regions||[]).find(r=>'region:'+r.id===scope);}
function cancel(){draft=null;}
function editorMarkup(l){
 ensureRegions(l); if(scene!==l.id){scene=l.id;scope='map';cancel();}if(scope!=='map'&&!selected(l))scope='map';const r=selected(l),s=(r||l).skybox;
 const fields=r?'<label for="ce-sky-name">Nome da região</label><input id="ce-sky-name" maxlength="160" value="'+esc(r.name||r.id)+'"><div class="ce-sky-bounds">'+[['X',0],['Y',1],['Largura',2],['Altura',3]].map(([name,i])=>'<label for="ce-sky-bound-'+i+'">'+name+'<input id="ce-sky-bound-'+i+'" type="number" step="8" min="'+(i<2?0:32)+'" max="'+l.bounds[i%2+2]+'" value="'+r.bounds[i]+'"></label>').join('')+'</div><div class="ce-actions"><button id="ce-sky-edit">'+(draft?.mode==='edit'?'Concluir edição':'Mover / redimensionar')+'</button><button id="ce-sky-focus">Localizar</button></div><div class="ce-actions"><button id="ce-sky-redraw">Redesenhar limites</button><button id="ce-sky-delete" class="danger">Excluir região</button></div>':'';
 return '<section class="ce-skybox"><h3>Skybox / regiões</h3><div class="ce-actions"><button id="ce-sky-create">'+(draft?.mode==='create'?'Cancelar desenho':'Criar região no mapa')+'</button></div><label for="ce-sky-scope">Aplicar em</label><select id="ce-sky-scope"><option value="map">Mapa inteiro</option>'+(l.regions||[]).map(r=>'<option value="region:'+esc(r.id)+'" '+(scope==='region:'+r.id?'selected':'')+'>'+esc(r.name||r.id)+'</option>').join('')+'</select>'+fields+'<label for="ce-sky-type">Tipo de céu</label><select id="ce-sky-type"><option value="inherit" '+(!s?'selected':'')+'>'+(r?'Herdar céu do mapa':'Clima original da cena')+'</option>'+Object.entries(types).map(([id,name])=>'<option value="'+id+'" '+(s?.type===id?'selected':'')+'>'+name+'</option>').join('')+'</select><div class="ce-pair"><div><label for="ce-sky-intensity">Intensidade (%)</label><input id="ce-sky-intensity" type="number" min="0" max="100" step="5" value="'+Math.round((s?.intensity??.65)*100)+'" '+(!s?'disabled':'')+'></div><div><label for="ce-sky-speed">Velocidade</label><input id="ce-sky-speed" type="number" min="0" max="3" step="0.1" value="'+(s?.speed??1)+'" '+(!s?'disabled':'')+'></div></div><p>'+(draft?'Arraste no cenário. Na edição, use os cantos para redimensionar ou o interior para mover. Esc cancela.':'Crie uma região arrastando no cenário. Regiões posteriores substituem as anteriores nas áreas de sobreposição.')+'</p></section>';
}
function bindEditor(l,change,redraw,regionChange){
 const $=id=>document.getElementById(id),select=$('ce-sky-scope');if(!select)return;select.onchange=()=>{scope=select.value;cancel();redraw();};
 const apply=()=>{const type=$('ce-sky-type').value,config=type==='inherit'?undefined:{type,intensity:Math.max(0,Math.min(100,Number($('ce-sky-intensity').value)||0))/100,speed:Math.max(0,Math.min(3,Number($('ce-sky-speed').value)||0))};change(scope,config);};for(const id of ['ce-sky-type','ce-sky-intensity','ce-sky-speed'])$(id).onchange=apply;
 $('ce-sky-create').onclick=()=>{draft=draft?.mode==='create'?null:{mode:'create'};redraw();};const r=selected(l);if(!r)return;
 $('ce-sky-name').onchange=()=>regionChange({type:'update',id:r.id,patch:{name:$('ce-sky-name').value.trim().slice(0,160)||'Região do céu'}});
 for(let i=0;i<4;i++)$('ce-sky-bound-'+i).onchange=()=>regionChange({type:'update',id:r.id,patch:{bounds:bounds(l,[0,1,2,3].map(i=>+$('ce-sky-bound-'+i).value))}});
 $('ce-sky-delete').onclick=()=>{scope='map';cancel();regionChange({type:'delete',id:r.id});};$('ce-sky-focus').onclick=()=>window.CHEMSCAPE_ENGINE.setView({x:r.bounds[0]+r.bounds[2]/2,y:r.bounds[1]+r.bounds[3]/2});
 $('ce-sky-redraw').onclick=()=>{draft={mode:'redraw',id:r.id};redraw();};$('ce-sky-edit').onclick=()=>{draft=draft?.mode==='edit'?null:{mode:'edit',id:r.id};redraw();};
}
function pointer(phase,p,l,change,redraw){
 if(!draft)return false;
 if(phase==='down'){const r=selected(l);draft.start={x:p.x,y:p.y};draft.end={...draft.start};if(draft.mode==='edit'&&r){draft.original=[...r.bounds];const [x,y,w,h]=r.bounds,z=window.CHEMSCAPE_ENGINE.view().zoom,corners=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]],corner=corners.findIndex(v=>Math.hypot(v[0]-p.x,v[1]-p.y)*z<16);draft.corner=corner;draft.drag=corner>=0?'resize':'move';}return true;}
 if(phase==='move'){if(!draft.start)return true;draft.end={x:p.x,y:p.y};return true;}
 if(phase==='up'){if(!draft.start)return true;draft.end={x:p.x,y:p.y};const b=draftBounds(l),mode=draft.mode,id=draft.id;if(mode==='edit'){draft.start=null;draft.end=null;}else cancel();const r=change({type:mode==='create'?'create':'update',id,patch:{bounds:b}});if(r?.id)scope='region:'+r.id;redraw();return true;}return false;
}
function draftBounds(l){if(!draft?.start)return null;const a=draft.start,b=draft.end||a;if(draft.mode==='edit'){const o=draft.original;if(draft.drag==='move')return bounds(l,[Math.max(0,Math.min(l.bounds[2]-o[2],o[0]+b.x-a.x)),Math.max(0,Math.min(l.bounds[3]-o[3],o[1]+b.y-a.y)),o[2],o[3]]);const c=draft.corner,x=c%2===0?o[0]+o[2]:o[0],y=c<2?o[1]+o[3]:o[1];return bounds(l,[Math.min(x,b.x),Math.min(y,b.y),Math.abs(x-b.x),Math.abs(y-b.y)]);}return bounds(l,[Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(a.x-b.x),Math.abs(a.y-b.y)]);}
function drawEditor(c,l,v){const r=selected(l),preview=draftBounds(l);c.save();c.lineWidth=2/v.zoom;c.setLineDash([8/v.zoom,5/v.zoom]);for(const area of l.regions||[]){const active=area===r,b=active&&preview?preview:area.bounds;c.strokeStyle=active?'#ffe39c':'#a3cdd34d';c.strokeRect(...b);if(active){c.fillStyle='#ddbd6e12';c.fillRect(...b);c.fillStyle='#ffe39c';const n=8/v.zoom;for(const [x,y]of [[b[0],b[1]],[b[0]+b[2],b[1]],[b[0],b[1]+b[3]],[b[0]+b[2],b[1]+b[3]]])c.fillRect(x-n/2,y-n/2,n,n);}}if(preview&&draft?.mode==='create'){c.fillStyle='#72cce329';c.strokeStyle='#9ce8f4';c.fillRect(...preview);c.strokeRect(...preview);}c.restore();}
for(const l of Object.values({...window.CHEMSCAPE_LEVELS.worlds,...window.CHEMSCAPE_LEVELS.rooms}))ensureRegions(l);
window.CHEMSCAPE_SKYBOXES={types,draw,validate,editorMarkup,bindEditor,pointer,drawEditor,bounds,cancel,get editing(){return !!draft;}};
})();
