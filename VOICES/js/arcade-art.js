(function(){
'use strict';const V=window.V;
const A=V.ArcadeArt={images:new Map(),asset:id=>'assets/arcade-expansion/'+id+'.png',ids:['fish-hake','fish-mullet','fish-nile-perch','fish-bagrus','fish-synodontis','delivery-motorbike','delivery-panorama','house-blue','house-red','house-yellow'],load(){return Promise.all(this.ids.map(id=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images.set(id,img);if(id.startsWith('fish-'))V.FishingChallenge.images.set(id,img);resolve();};img.onerror=()=>{V.Assets.errors.push(this.asset(id));resolve();};img.src=this.asset(id);})));},draw(c,id,x,y,w,h){const img=this.images.get(id);if(img)c.drawImage(img,x,y,w,h);}};
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(){await Promise.all([load(),A.load()]);return this.errors;};
})();
