(()=>{
'use strict';
const palettes=[['grass','#71874e'],['dirt','#a08a61'],['grass','#7b9256'],['sand','#bd9c68'],['dirt','#a28056'],['stone','#b29a76'],['mud','#71715b'],['metal','#88775d'],['stone','#777365'],['snow','#cbdce0'],['ice','#94bdc9'],['stone','#aabfc7'],['grass','#7d934e'],['grass','#879b57'],['dirt','#a5966b'],['moss','#416756'],['moss','#4c7563'],['stone','#718276'],['tile','#b4aa93'],['crystal','#9a86ae'],['stone','#a59a80'],['tile','#a3b1b0'],['metal','#71818a'],['tile','#b7c4c0'],['stone','#8d9589']];
function draw(c,type,color,r){
 c.save();c.beginPath();c.rect(r.x,r.y,r.w,r.h);c.clip();c.imageSmoothingEnabled=false;c.fillStyle=color;c.fillRect(r.x,r.y,r.w,r.h);
 const spacing=['tile','stone','metal'].includes(type)?64:32;
 for(let y=Math.floor(r.y/spacing)*spacing;y<r.y+r.h;y+=spacing)for(let x=Math.floor(r.x/spacing)*spacing;x<r.x+r.w;x+=spacing){
  const n=((x/spacing*17+y/spacing*29)%23+23)%23;
  if(['tile','metal'].includes(type)){c.fillStyle='#17292b0d';c.fillRect(x,y,spacing,2);c.fillRect(x,y,2,spacing);if(type==='metal'&&n%3===0){c.fillStyle='#ffffff16';c.fillRect(x+7,y+7,2,2);}}
  else if(type==='stone'){if(n%3===0){c.fillStyle='#132c2c12';c.fillRect(x+12,y+30,18,2);c.fillRect(x+28,y+32,2,6);}}
  else if(type==='ice'){if(n%5===0){c.fillStyle='#ecfcff24';c.fillRect(x+9,y+18,10,2);c.fillRect(x+17,y+16,6,2);}}
  else if(type==='grass'||type==='moss'){if(n%4===0){c.fillStyle='#0e342210';c.fillRect(x+9,y+20,2,4);c.fillRect(x+13,y+18,2,6);}}
  else if(type==='farm'){c.fillStyle='#513e291c';c.fillRect(x,y+10,spacing,2);}
  else if(n%6===0){c.fillStyle=type==='snow'?'#ffffff25':'#29342a12';c.fillRect(x+8,y+10,4,2);}
 }
 c.restore();
}
window.CHEMSCAPE_PIXEL_FLOORS={draw,palettes};
})();
