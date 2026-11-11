/* Registered module: cooking-workshop-data */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("cooking-workshop-data", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';const V=window.V;
const food=(sheet,frame,label)=>({sheet,frame,label});
const savory=['Bolinho de acarajé frito','Abará cozido na folha','Peixe da moqueca','Caruru de quiabo','Vatapá pronto','Cuscuz no vapor','Pap cozido','Chakalaka refogado','Samp e feijão cozidos','Fatia de bobotie','Feijão com molho','Banana-da-terra frita','Peixe preparado','Arroz e legumes cozidos','Calulu cozido','Funge liso'];
const sweet=['Cocada pronta','Mungunzá cremoso','Amagwinya frito','Koesister com coco','Angu pronto','Baião de dois pronto','Arroz amarelo com passas','Fatia de malva pudding','Calda de creme','Galinha da muamba','Verduras preparadas','Coco ralado','Calda pronta','Prato vazio','Tigela vazia','Colher de servir'];
const foods={};savory.forEach((label,frame)=>foods['savory-'+frame]=food('prepared-savory',frame,label));sweet.forEach((label,frame)=>foods['sweet-'+frame]=food('prepared-sweets-tools',frame,label));
const part=(food,x,y,size=118,extra={})=>({food,x,y,size,...extra});
const creamy=id=>({vessel:'bowl',parts:[part(id,0,0,160,{fill:1}),part(id,0,0,182,{fill:2}),part(id,0,0,205,{fill:3})]});
const pieces=(id,count=3)=>({vessel:'plate',parts:(count===2?[[-52,-5],[51,12]]:count===4?[[-58,-13],[38,-18],[-34,30],[65,27]]:[[-67,-6],[9,-19],[70,23]]).map(([x,y])=>part(id,x,y,104))});
const plans={
 acaraje:pieces('savory-0'),abara:pieces('savory-1',2),
 moqueca:{vessel:'bowl',parts:[part('savory-2',-52,-5,140),part('savory-2',50,14,140),part('sweet-10',0,-22,50)]},
 caruru:creamy('savory-3'),vatapa:creamy('savory-4'),cocada:pieces('sweet-0',4),cuscuz:creamy('savory-5'),mungunza:creamy('sweet-1'),
 pap:{vessel:'plate',parts:[part('savory-6',-61,2,142,{fill:1}),part('savory-6',-61,2,175,{fill:2}),part('savory-7',65,11,149)]},
 umngqusho:creamy('savory-8'),amagwinya:pieces('sweet-2'),koesister:pieces('sweet-3'),bobotie:pieces('savory-9',2),
 'red-red':{vessel:'plate',parts:[part('savory-10',-55,0,151,{fill:1}),part('savory-10',-55,0,181,{fill:2}),part('savory-11',65,8,143)]},
 thieboudienne:{vessel:'plate',parts:[part('savory-13',-15,8,173,{fill:1}),part('savory-13',-15,8,217,{fill:2}),part('savory-12',8,-11,167,{after:[0,1]})]},
 calulu:{vessel:'plate',parts:[part('savory-14',54,6,152,{fill:1}),part('savory-14',54,6,175,{fill:2}),part('savory-15',-78,-3,119)]},
 angu:creamy('sweet-4'),baiao:creamy('sweet-5'),geelrys:creamy('sweet-6'),
 malva:{vessel:'plate',parts:[part('sweet-7',-49,1,119),part('sweet-7',48,9,119),part('sweet-8',0,0,90,{after:[0,1],sauce:true})]},
 muamba:pieces('sweet-9')
};
V.CookingWorkshopData={foods,plans,revision:2};
})();

});
