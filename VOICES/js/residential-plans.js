/* Registered module: residential-plans */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('residential-plans',initialize);else initialize();})(function(){
  'use strict';
  const plans=[
    // Map, width, depth, footprint, number of bedrooms, scheme, palette, featured furniture.
    ['interior-ipe',18,15,'porch',1,0,'honey','entry-cubby'],
    ['interior-janelas',22,16,'bay',1,3,'sage','reading-chaise'],
    ['interior-player-cottage',17,15,'porch',1,1,'sage','plant-steps'],
    ['interior-player-loft',23,15,'loft',1,4,'indigo','record-tower'],
    ['interior-player-villa',26,19,'bay',2,2,'ivory','photo-cabinet'],
    ['interior-horizonte-2',15,13,'studio',1,0,'rose','breakfast-nook'],
    ['interior-horizonte-3',16,13,'alcove',1,3,'petrol','folding-desk'],
    ['interior-horizonte-202',16,14,'studio',1,1,'ivory','coffee-station'],
    ['interior-horizonte-203',20,15,'loft',2,2,'indigo','record-tower'],
    ['interior-horizonte-204',14,14,'alcove',1,5,'honey','open-divider'],
    ['interior-horizonte-205',15,15,'studio',1,4,'clay','sewing-desk'],
    ['interior-horizonte-302',17,13,'loft',1,5,'sage','folding-desk'],
    ['interior-horizonte-303',21,14,'studio',2,1,'petrol','photo-cabinet'],
    ['interior-horizonte-304',15,14,'balcony',1,2,'clay','olive-sofa'],
    ['interior-horizonte-305',16,15,'balcony',1,0,'rose','reading-chaise'],
    ['interior-sanctuary-dandara',19,15,'porch',1,2,'sage','open-divider'],
    ['interior-sanctuary-iara',18,16,'bay',1,1,'petrol','plant-steps'],
    ['interior-sanctuary-bongani',20,16,'bay',1,4,'clay','utility-sink'],
    ['interior-sanctuary-cecilia',21,16,'alcove',1,0,'ivory','photo-cabinet'],
    ['interior-sanctuary-ranger-rosa',18,14,'loft',1,5,'rose','entry-cubby'],
    ['interior-sanctuary-ranger-lindiwe',19,14,'bay',1,3,'indigo','conversation-table'],
  ];
  const neighborhood=[
    [20,16,'porch',2,0,'honey','entry-cubby'],
    [23,17,'loft',2,3,'indigo','record-tower'],
    [21,16,'bay',2,1,'petrol','reading-chaise'],
    [20,17,'alcove',2,2,'clay','pantry-hutch'],
    [22,16,'porch',2,4,'sage','plant-steps'],
    [22,17,'studio',3,5,'ivory','photo-cabinet'],
    [19,17,'bay',2,0,'rose','sewing-desk'],
    [21,17,'porch',2,3,'sage','breakfast-nook'],
    [23,16,'bay',3,2,'honey','conversation-table'],
    [20,18,'loft',2,4,'petrol','folding-desk'],
    [21,18,'alcove',2,5,'rose','textile-chest'],
    [22,18,'porch',2,1,'indigo','coffee-station'],
    [24,16,'studio',3,3,'clay','utility-sink'],
    [23,18,'bay',2,0,'sage','olive-sofa'],
    [20,19,'porch',2,2,'ivory','pantry-hutch'],
    [25,16,'loft',3,4,'honey','conversation-table'],
    [22,15,'alcove',2,1,'rose','textile-chest'],
    [25,17,'porch',3,5,'sage','open-divider'],
    [24,17,'bay',2,4,'ivory','sewing-desk'],
    [21,19,'porch',2,3,'petrol','photo-cabinet'],
    [24,18,'loft',3,0,'indigo','record-tower'],
    [23,19,'alcove',2,2,'clay','coffee-station'],
    [25,18,'bay',3,5,'rose','plant-steps'],
    [22,19,'loft',2,4,'ivory','folding-desk'],
    [24,19,'porch',3,1,'sage','open-divider'],
    [25,15,'loft',2,3,'petrol','reading-chaise'],
    [25,19,'bay',3,4,'sage','utility-sink'],
    [26,16,'porch',3,5,'honey','breakfast-nook'],
    [26,17,'alcove',3,0,'rose','pantry-hutch'],
    [26,18,'loft',3,2,'clay','olive-sofa'],
    [24,15,'bay',2,5,'petrol','textile-chest'],
    [19,18,'porch',2,1,'sage','photo-cabinet'],
    [27,17,'bay',3,3,'indigo','conversation-table']
  ];
  neighborhood.forEach((plan,i)=>plans.push(['interior-residence-'+String(i+1).padStart(2,'0'),...plan]));
  const palettes={
    honey:{paper:'stripe',walls:['#d9bd8f','#b78e65','#cbb99b'],wood:['Cumaru mel','#a88056'],stone:['Cerâmica areia','#c1ac8c'],rug:'#936248',doors:[16,19,18],views:[1,4,0]},
    sage:{paper:'sage',walls:['#bfc9ab','#a0aa86','#d3cab6'],wood:['Carvalho natural','#b49a70'],stone:['Ladrilho sálvia','#98a28b'],rug:'#608173',doors:[18,22,19],views:[1,5,2]},
    petrol:{paper:'night',walls:['#93aeb0','#709496','#bccebf'],wood:['Carvalho acinzentado','#a59b83'],stone:['Cerâmica de água','#90a7a1'],rug:'#52767b',doors:[21,17,20],views:[3,0,2]},
    indigo:{paper:'night',walls:['#a4b3bc','#8198a6','#c7c1a8'],wood:['Nogueira clara','#94785f'],stone:['Granilite azul','#97a8b2'],rug:'#657796',doors:[21,20,17],views:[3,4,0]},
    rose:{paper:'rose',walls:['#d8b6af','#b69189','#d3c1a7'],wood:['Cedro rosado','#b08d77'],stone:['Ladrilho marfim rosado','#c6b3a4'],rug:'#9f6873',doors:[23,19,22],views:[5,1,3]},
    clay:{paper:'clay',walls:['#d5aa90','#b58b71','#d7c8aa'],wood:['Freijó tostado','#a18161'],stone:['Cerâmica terracota','#b99379'],rug:'#a9634d',doors:[16,23,20],views:[4,0,5]},
    ivory:{paper:'ivory',walls:['#ded3b6','#bdb291','#d1c5ad'],wood:['Carvalho lavado','#baa98b'],stone:['Pedra creme','#bdb4a1'],rug:'#8a8062',doors:[19,17,22],views:[5,1,2]}
  };
  Object.values(palettes).forEach((p,i)=>{p.floor=240+i*2;p.tile=p.floor+1;});
  window.V.ResidentialPlans={plans,palettes};
});
