(function facadePolish(){
'use strict';
const V=window.V,F=V.CityFacades,C=V.Cozy,W=V.World;
const shade=(hex,n)=>'#'+[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(hex.slice(i,i+2),16)+n)).toString(16).padStart(2,'0')).join('');
F.wallDetail=function(ctx,b,p,colors,roofH){const{x,y,w,h}=b,top=y+roofH,wall=colors[0];
 if(p.material==='plaster'){ctx.fillStyle=shade(wall,-5);for(let yy=top+16;yy<y+h-18;yy+=19)for(let xx=x+22+(Math.floor(yy/19)%2)*13;xx<x+w-24;xx+=39){if((Math.floor(xx+yy)+p.seed)%3===0)ctx.fillRect(xx,yy,3,1);}}
 const stone=shade(wall,12);for(const side of [x+7,x+w-15]){ctx.fillStyle=stone;for(let yy=top+12;yy<y+h-21;yy+=24)ctx.fillRect(side,yy,8,13);}
 ctx.fillStyle=shade(wall,-22);ctx.fillRect(x+7,top+8,w-14,3);
};
F.finish=function(ctx,b,p,colors,roofH){const{x,y,w,h}=b,bottom=y+h,wall=colors[0];
 // Thin metal gutter and a matching downpipe, shaded into the facade.
 ctx.fillStyle=shade(colors[2],-12);ctx.fillRect(x+w-8,y+roofH+5,3,h-roofH-18);ctx.fillStyle=shade(wall,-8);ctx.fillRect(x+w-5,y+roofH+5,1,h-roofH-18);
 ctx.fillStyle=shade(wall,-25);for(let xx=x+14;xx<x+w-15;xx+=38)ctx.fillRect(xx,bottom-12,1,11);
 if(!p.shop&&(p.seed%3===0||p.porch)){const side=p.seed%2===0?x+22:x+w-38;ctx.fillStyle='#654e3b';ctx.fillRect(side,bottom-14,18,17);ctx.fillStyle='#a96d4c';ctx.fillRect(side+2,bottom-13,14,14);ctx.fillStyle='#c68b61';ctx.fillRect(side-1,bottom-16,20,4);ctx.fillStyle='#42644a';ctx.fillRect(side+3,bottom-31,12,17);ctx.fillRect(side-3,bottom-25,24,8);ctx.fillStyle='#769360';ctx.fillRect(side+1,bottom-28,9,5);ctx.fillRect(side+12,bottom-22,7,4);}
};
const profile=F.profile.bind(F);F.profile=function(b){if(b.facade)return profile(b);const p=profile(b),label=(b.label||'').toLocaleLowerCase('pt-BR');
 if(/escola|museu|arquivo|biblioteca|laboratório|galeria|centro|rádio|redação/.test(label)){Object.assign(p,{name:'public',roof:'terrace',window:'tall',porch:false,shutters:false,balcony:false,material:'plaster',stories:b.stories||Math.max(1,Math.min(2,Math.floor(b.h/125)))});}
 if(b.style==='gable')Object.assign(p,{roof:'gable',stories:1});
 if(b.style==='shed')Object.assign(p,{roof:'skillion',stories:1});
 p.stories=Math.min(p.stories||1,Math.max(1,Math.floor((b.h-25)/82)));
 return p;
};
const draw=C.drawBuilding.bind(C);C.drawBuilding=function(ctx,b,cam){if(b.culture!=null||W.current?.cityInterior)return draw(ctx,b,cam);return F.draw(ctx,b,cam);};
F.cache=new WeakMap();
})();
