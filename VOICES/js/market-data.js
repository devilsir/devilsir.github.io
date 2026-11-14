/* Registered module: market-data */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("market-data", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V;
const sources=[
 {id:'baianas',title:'IPAC · Ofício das baianas de acarajé',url:'https://www.ba.gov.br/ipac/oficio-das-baianas-do-acaraje'},
 {id:'cape-food',title:'Cape Town Tourism · Bo-Kaap',url:'https://www.capetown.travel/travel-like-a-local-your-neighbourhood-guide-to-the-bo-kaap/'},
 {id:'cape-system',title:'African Centre for Cities / AfriFOODlinks · Sistema alimentar da Cidade do Cabo',url:'https://afrifoodlinks.org/wp-content/uploads/2024/07/State-of-City-Food-System-Report_Cape-Town__.pdf'},
 {id:'rooibos',title:'South African Rooibos Council',url:'https://sarooibos.co.za/'},
 {id:'koo',title:'KOO · Chakalaka',url:'https://www.koo.co.za/products/Chakalaka'},
 {id:'shweshwe',title:'Da Gama · Three Cats Original Shweshwe',url:'https://www.dagama.co.za/shweshwe-african-cultural-fabrics/'}
];
// Care values and coin prices are game balancing, never nutritional measurements.
const rows=[
 ['acaraje','Acarajé','br',0,14,38,0,'Bolinho de feijão-fradinho frito no dendê. O ofício das baianas reúne preparo, transmissão e memória.','baianas'],
 ['abara','Abará','br',1,14,42,0,'Feijão-fradinho envolvido em folha e cozido no vapor. Um preparo diferente do acarajé.','baianas'],
 ['fradinho','Feijão-fradinho com verduras','br',2,17,58,8,'Uma tigela de feijão e verduras da cozinha da feira.','baianas'],
 ['moqueca','Moqueca da feira','br',3,24,70,12,'Peixe, legumes e caldo nesta receita da banca. As receitas de moqueca variam entre regiões e famílias.','baianas'],
 ['cuscuz','Cuscuz de milho','br',4,10,40,0,'Milho cozido no vapor, servido quentinho. Uma das comidas presentes nas mesas brasileiras.'],
 ['cocada','Cocada','br',5,7,20,0,'Doce de coco em uma porção pequena. Pergunte à vendedora como foi preparado.'],
 ['mungunza','Mungunzá doce','br',6,12,42,10,'Milho branco com leite e canela nesta versão doce. O nome e os preparos variam conforme a região.'],
 ['suco','Suco de uva','br',7,8,8,38,'Suco servido em copo pela banca de frutas.'],
 ['flask-water','Garrafa reutilizável cheia','br',8,12,0,65,'Ao beber, a garrafa vazia volta à mochila. Encha nos bebedouros gratuitos.'],
 ['coco','Água de coco','br',9,9,8,48,'Coco aberto na hora na banca de Joana.'],
 ['headwrap','Tecido para turbante','br',12,22,0,0,'Tecido da artesã Solange. Pode ser guardado como decoração na sua casa.'],
 ['basket-br','Cesta trançada','br',13,18,0,0,'Cesta de fibras para decorar a sua casa.'],
 ['bowl','Tigela e colher','br',14,15,0,0,'Utensílios da feira. Envie para a casa e coloque no editor de móveis.'],
 ['beans','Feijão-fradinho seco','br',15,6,0,0,'Ingrediente para a cozinha comunitária ou o fogão da casa.'],
 ['pap','Pap com chakalaka','sa',0,18,62,4,'Pap de milho com acompanhamento de legumes temperados. Esta é a versão da banca de Thandi.','koo'],
 ['umngqusho','Umngqusho','sa',1,20,66,8,'Milho quebrado (samp) com feijão, presente na culinária xhosa. Há muitas receitas familiares.','cape-system'],
 ['amagwinya','Amagwinya','sa',2,9,32,0,'Pãezinhos de massa frita vendidos como comida de rua, com diferentes acompanhamentos.','cape-system'],
 ['koesister','Koesister do Cabo','sa',3,9,25,0,'Doce oval com especiarias e coco ligado à comunidade Cape Malay; diferente do koeksister trançado.','cape-food'],
 ['rooibos','Rooibos preparado','sa',4,8,0,45,'Infusão feita com a planta do rooibos, cultivada na região do Cederberg.','rooibos'],
 ['ginger','Bebida de gengibre sem álcool','sa',5,8,5,35,'Uma versão sem álcool da bebida de gengibre da banca de Amina.'],
 ['koo','KOO · Chakalaka','sa',6,12,25,0,'Legumes temperados em lata. Pode ser consumido ou usado na receita de pap com chakalaka.','koo'],
 ['chutney','Chutney de frutas','sa',7,10,12,0,'Condimento agridoce de frutas da mercearia. Uma pequena porção acompanha a refeição.'],
 ['maize','Farinha de milho','sa',8,6,0,0,'Ingrediente para pap e cuscuz de milho.'],
 ['rooibos-pack','Pacote de rooibos','sa',9,10,0,0,'Folhas para preparar duas xícaras na cozinha comunitária.','rooibos'],
 ['shweshwe','Three Cats · tecido shweshwe','sa',10,25,0,0,'Tecido de algodão estampado da Da Gama, do Cabo Oriental. Envie para decorar sua casa.','shweshwe'],
 ['beads','Pulseira de miçangas','sa',11,20,0,0,'Peça da artesã Zola. As cores desta peça são uma escolha da criadora, sem significado universal.'],
 ['pumpkin','Abóbora com feijão','sa',12,16,52,8,'Refeição de legumes da cozinha de Thandi.'],
 ['spoon','Colher de madeira','sa',14,14,0,0,'Utensílio artesanal da banca de Zola. Pode decorar a casa.'],
 ['basket-sa','Cesto de fibras','sa',15,20,0,0,'Cesto de fibras com faixas coloridas, da seleção da artesã Zola.'],
 ['samp','Samp · milho quebrado','sa',8,7,0,0,'Grãos de milho quebrados para o umngqusho. Não é farinha de milho.'],
 ['sugar-beans','Feijão rajado · sugar beans','br',15,6,0,0,'Feijão seco para preparar umngqusho com samp na cozinha comunitária.','cape-system'],
 ['flask','Garrafa reutilizável vazia','br',8,7,0,0,'Encha gratuitamente nos bebedouros da feira, do Cabo ou em uma pia.']
];
const material=new Set(['beans','sugar-beans','maize','rooibos-pack','samp','flask']),decor=new Set(['headwrap','basket-br','bowl','shweshwe','spoon','basket-sa']);
const items={};for(const[id,name,region,frame,price,nutrition,hydration,description,source]of rows){const key='market-'+id;items[key]={name,region,frame,price,nutrition,hydration,description,source,category:material.has(id)||decor.has(id)?'material':id==='beads'?'equipment':'consumable',stack:id==='beads'?1:10,effect:'heal',power:nutrition?Math.round(nutrition/5):0,marketItem:true,marketDecor:decor.has(id),satiety:nutrition>=50?150:nutrition>=32?70:20};if(id==='beads')Object.assign(items[key],{slot:'accessory',stats:{focus:3}});}
const vendors=[
 {id:'dandara',name:'Dandara',shop:'Cozinha da Dandara',map:'market',sprite:'town-dandara-cozinha',stall:0,at:[8,8],text:'Meu tabuleiro tem acarajé e abará. Um é frito no dendê; o outro é cozido na folha. O ofício também é história de trabalho e de transmissão entre gerações.',stock:['acaraje','abara','fradinho','moqueca','cuscuz','cocada','mungunza']},
 {id:'joana',name:'Joana',shop:'Frutas e água da Joana',map:'market',sprite:'town-joana-feira',stall:1,at:[31,8],text:'Uma fruta para o caminho ou um coco aberto na hora? O bebedouro da feira também oferece água gratuita.',stock:['fruit','suco','coco','water','flask-water','flask']},
 {id:'solange',name:'Solange',shop:'Tramas da Solange',map:'market',sprite:'town-solange',stall:2,at:[8,17],text:'Escolho as cores e tramas destas peças. Se você já tem uma casa, pode levar o tecido, a cesta ou os utensílios e colocá-los onde preferir.',stock:['headwrap','basket-br','bowl']},
 {id:'luiz',name:'Luiz',shop:'Mercearia da Feira',map:'market',sprite:'town-luiz',stall:3,at:[31,17],text:'Os ingredientes vão para a mochila. O fogão comunitário fica no corredor central, e as cozinhas das casas usam as mesmas receitas.',stock:['ingredients','beans','maize','meal','sandwich','tea','water']},
 {id:'thandi',name:'Thandi',shop:'Cozinha da Thandi',map:'cape-market',sprite:'town-thandi',stall:4,at:[9,10],text:'Hoje preparei pap com chakalaka e umngqusho de samp com feijão. Receitas de casa mudam de uma família para outra. Também tenho amagwinya fresquinhos.',stock:['pap','umngqusho','amagwinya','pumpkin']},
 {id:'amina',name:'Amina',shop:'Chás e doces da Amina',map:'cape-market',sprite:'town-amina',stall:5,at:[30,10],text:'Estes são koesisters do Cabo, com especiarias e coco. São diferentes dos koeksisters trançados. Para acompanhar, preparo rooibos e uma bebida de gengibre sem álcool.',stock:['koesister','rooibos','ginger','rooibos-pack']},
 {id:'zola',name:'Zola',shop:'Tramas e miçangas da Zola',map:'cape-market',sprite:'town-zola-feira',stall:6,at:[9,21],text:'Nesta banca há tecidos shweshwe e as peças que selecionei. Cada artesã, família e região tem suas escolhas; não existe uma única estética de toda a África.',stock:['shweshwe','beads','basket-sa','spoon']},
 {id:'sizwe',name:'Sizwe',shop:'Mercearia do Sizwe · spaza',map:'cape-market',sprite:'town-sizwe',stall:7,at:[30,21],text:'Uma spaza é uma pequena loja de bairro. Aqui tenho samp, farinha de milho, rooibos, condimentos e a linha de chakalaka da KOO. Há água gratuita no centro do mercado.',stock:['koo','chutney','maize','samp','sugar-beans','rooibos-pack','water','flask-water','flask']}
];
for(const v of vendors)v.stock=v.stock.map(id=>items['market-'+id]?'market-'+id:id);
V.MarketData={items,vendors,sources,recipes:[
 {id:'meal',name:'Refeição caseira',input:{ingredients:2},output:'meal',quantity:1},
 {id:'fradinho',name:'Feijão-fradinho com verduras',input:{'market-beans':1,ingredients:1},output:'market-fradinho',quantity:1},
 {id:'cuscuz',name:'Cuscuz de milho',input:{'market-maize':1,water:1},output:'market-cuscuz',quantity:1},
 {id:'pap',name:'Pap com chakalaka',input:{'market-maize':1,'market-koo':1},output:'market-pap',quantity:1},
 {id:'umngqusho',name:'Umngqusho',input:{'market-samp':1,'market-sugar-beans':1},output:'market-umngqusho',quantity:1},
 {id:'rooibos',name:'Duas xícaras de rooibos',input:{'market-rooibos-pack':1,water:1},output:'market-rooibos',quantity:2}
]};
Object.assign(V.AdventureData.items,items);
})();

});
