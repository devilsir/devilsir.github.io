(function(){
'use strict';
const V=window.V,D=V.AfricanPlayArtData,ids=['terra-mar','fogo-montanha','mancala','matacuzana','jogos-jo','ampe','participants','play-props'];
const A=V.AfricanPlayArt={images:new Map(),
path(id){return 'assets/african-play/'+id+'.webp';},
load(){return Promise.all(ids.map(id=>new Promise(resolve=>{const im=V.Assets.image();im.onload=()=>{this.images.set(id,im);this.paintCovers();resolve();};im.onerror=()=>resolve();im.src=this.path(id)+'?v=20261030-play1';V.AssetLoader.register(im,resolve);})));
},
ensure(){return V.MapAssets.ensure(['african-play'],'Preparando as brincadeiras',()=>this.paintCovers());},
background(c,id){const im=this.images.get(id);if(im)c.drawImage(im,0,0,960,540);else{c.fillStyle='#c5ad79';c.fillRect(0,0,960,540);}},
person(c,row,pose,x,y,size=90,z=0){const im=this.images.get('participants'),cells=D.participants[row%4];if(!im||!cells)return;const facing=pose%8,cell=cells[facing===2?3:facing===4?5:facing===5?4:facing],k=size/cells[0][3],w=cell[2]*k,h=cell[3]*k;V.SceneShadows.contact(c,x+3,y+4,size*.23,Math.max(3,size*.07-z*.04),.2);c.save();if(facing===2){c.translate(x*2,0);c.scale(-1,1);}c.drawImage(im,...cell,Math.round(x-w/2),Math.round(y-h-z),w,h);c.restore();},
player(c,r,x,y,pose='front',size=90,z=0){V.SceneShadows.contact(c,x+3,y+5,size*.23,Math.max(3,size*.07-z*.04),.22);const dir=pose.startsWith('back')?3:0,frame=pose==='left'||pose==='back-left'?1:pose==='right'||pose==='back-right'?3:0;if(pose==='clap')V.Animations.draw(c,V.state.character,'dance',x,y-z,size,r.elapsed||0,false);else V.Assets.sprite(c,V.state.character,x,y-z,dir,frame,size);},
prop(c,index,x,y,w=64,h=w,shadow=true){const im=this.images.get('play-props'),box=D.props[index];if(!im||!box)return;const k=Math.min(w/box[2],h/box[3]),ww=box[2]*k,hh=box[3]*k;if(shadow)V.SceneShadows.contact(c,x+3,y+4,ww*.36,Math.max(3,ww*.075),.2);c.drawImage(im,...box,Math.round(x-ww/2),Math.round(y-hh),ww,hh);},
board(c,x,y,w=450,h=150){c.fillStyle='#34291e';c.fillRect(x-7,y+5,w+14,h+7);c.fillStyle='#ad7942';c.fillRect(x,y,w,h);c.fillStyle='#d0a66e';c.fillRect(x+4,y+3,w-8,7);for(let row=0;row<2;row++)for(let col=0;col<6;col++){const cx=x+w*(col+.5)/6,cy=y+h*(row+.5)/2;c.fillStyle='#493622';c.beginPath();c.ellipse(cx,cy,w*.061,h*.18,0,0,Math.PI*2);c.fill();c.fillStyle='#edce84';for(let seed=0;seed<4;seed++){c.beginPath();c.ellipse(cx+(seed%2-.5)*11,cy+(Math.floor(seed/2)-.5)*8,4,3,-.3,0,Math.PI*2);c.fill();}}},
cover(c,id,w=c.canvas.width,h=c.canvas.height){c.save();c.beginPath();c.rect(0,0,w,h);c.clip();c.scale(w/960,h/540);this.background(c,id==='roda-jo'?'jogos-jo':id);if(id==='mancala'){this.board(c,185,260,590,190);this.prop(c,0,823,452,105,105);}else if(id==='matacuzana'){this.person(c,1,7,340,420,170);this.prop(c,4,642,432,120,90);for(let i=0;i<5;i++)this.prop(c,1,495+i*26,384+i%2*12,22,18);}else if(id==='roda-jo'){for(let i=0;i<6;i++){const a=i*Math.PI/3;this.person(c,i%4,i===0?1:0,480+Math.cos(a)*245,355+Math.sin(a)*100,115);this.prop(c,2,480+Math.cos(a+.3)*165,370+Math.sin(a+.3)*65,40,38);}}else if(id==='ampe'){this.person(c,0,5,395,470,190);this.person(c,1,2,565,365,150);}else{for(let i=0;i<4;i++)this.person(c,i,id==='fogo-montanha'?1:6,280+i*140,380+(i%2)*65,135,id==='terra-mar'?22:0);}c.restore();},
paintCovers(){for(const el of V.$$('[data-af-play-cover]'))this.cover(el.getContext('2d'),el.dataset.afPlayCover);}
};
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(){await Promise.all([load(),A.load()]);return this.errors;};
})();
