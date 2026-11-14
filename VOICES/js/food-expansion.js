/* Registered module: food-expansion */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("food-expansion", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,D=V.CookingData,A=V.CookingArt,P=V.Progress,M=V.Markets,T=48;
const step=D.step;
const sources=[
 {id:'angu-minas',title:'Agência Minas · Sistemas culinários do milho e da mandioca',url:'https://www.agenciaminas.mg.gov.br/noticia/cozinha-mineira-e-patrimonio-cultural-imaterial-de-minas-gerais-118049'},
 {id:'baiao-abg',title:'Academia Brasileira de Gastronomia · Baião de dois',url:'https://abgastronomia.org/glossario/baiao-de-dois/'},
 {id:'geelrys-recipe',title:'Hello Chef · Geelrys com cúrcuma, canela e passas',url:'https://hellochef.me/recipes/south-african-curry-with-geelrys-3401'},
 {id:'geelrys-history',title:'Universidade de Pretória · Tradições culinárias do Cabo',url:'https://repository.up.ac.za/server/api/core/bitstreams/4df79233-1e58-4217-a649-18984a0de29d/content'},
 {id:'malva-rhodes',title:'Rhodes Food Group · Easy Malva Pudding',url:'https://test.rhodesquality.com/recipes/easy-malva-pudding/'},
 {id:'muamba-embassy',title:'Embaixada de Angola no Japão · Muamba de galinha com funge',url:'https://www.angola.or.jp/pt/2025/08/04/prato-angolano-feito-por-japoneses/'},
 {id:'muamba-cuisine',title:'Embaixada de Angola na Türkiye · Cultura e alimentação',url:'https://www.embassyangolatr.org/tr/angola/cultura'},
 {id:'muamba-cook',title:'O Sítio · Cozinha angolana em Luanda',url:'https://ositio.co.ao/menu.html'},
 {id:'sa-fruit',title:'Statistics South Africa · Produção de frutas e agricultura',url:'https://www.statssa.gov.za/?p=18659'},
 {id:'marula-sanbi',title:'SANBI / PlantZAfrica · Marula',url:'https://pza.sanbi.org/sclerocarya-birrea'},
 {id:'brazil-fruit',title:'Ministério da Saúde · Alimentos regionais brasileiros',url:'https://bvsms.saude.gov.br/bvs/publicacoes/alimentos_regionais_brasileiros_2ed.pdf'},
 {id:'jabuticaba-ceagesp',title:'CEAGESP · Jabuticaba comercializada nas feiras',url:'https://ceagesp.gov.br/hortiescolha/hortipedia/jabuticaba/'}
];
const plate=frame=>step('Montar e servir a porção','plate','new-dishes',Math.floor(frame/4),frame%4,frame%4,{dish:16+frame});
const recipes=[
 {id:'angu',name:'Angu de milho',area:'br',region:'Minas Gerais · Brasil',context:'Papas de cereais participam de muitas cozinhas. O angu de fubá integra a formação da culinária mineira, com forte participação de povos africanos; milho e mandioca também remetem a saberes indígenas.',ingredients:'Fubá de milho, água e sal nesta versão simples da oficina.',output:'food-angu',sourceIds:['angu-minas'],steps:[step('Medir a água para o fubá','pour','new-prep',0,0,0),step('Incorporar o fubá aos poucos','stir','new-prep',0,0,1),step('Mexer para desfazer os grumos','stir','new-prep',0,1,2),step('Cozinhar o angu e regular o fogo','simmer','new-prep',0,1,2),step('Acomodar o angu na tigela','shape','new-prep',0,2,3),plate(0)]},
 {id:'baiao',name:'Baião de dois',area:'br',region:'Sertão nordestino · Brasil',context:'Arroz e feijão-de-corda se encontram na cozinha do sertão. É uma tradição nordestina formada por heranças diversas, sem origem exclusivamente africana. A versão da oficina usa queijo de coalho e não leva carne-seca.',ingredients:'Arroz, feijão-de-corda, queijo de coalho, cebola, manteiga de garrafa, coentro e água.',output:'food-baiao',sourceIds:['baiao-abg'],steps:[step('Lavar o feijão-de-corda','wash','prep',3,0,1),step('Picar a cebola','cut','prep',1,1,3),step('Cozinhar o feijão e o arroz','simmer','new-prep',1,0,1),step('Incorporar o refogado aos grãos','stir','new-prep',1,1,2),step('Distribuir queijo e ervas','season','new-prep',1,2,3),plate(1)]},
 {id:'geelrys',name:'Geelrys · arroz amarelo',area:'africa',region:'Cozinhas do Cabo · África do Sul',context:'Arroz amarelo com cúrcuma, canela e passas nesta versão. O preparo participa das tradições culinárias do Cabo e pode acompanhar bobotie e outros pratos; não representa todas as cozinhas sul-africanas.',ingredients:'Arroz, água, cúrcuma, canela em pau, passas, manteiga e uma pitada de sal.',output:'food-geelrys',sourceIds:['geelrys-recipe','geelrys-history'],steps:[step('Lavar o arroz','wash','extras',1,0,1),step('Medir a água para o arroz','pour','extras',1,1,1),step('Distribuir cúrcuma e canela','season','new-dishes',0,2,2),step('Incorporar passas e manteiga','layer','new-dishes',0,2,2),step('Cozinhar o arroz amarelo','simmer','new-dishes',0,2,2),plate(2)]},
 {id:'malva',name:'Malva pudding',area:'africa',region:'África do Sul',context:'Sobremesa assada e regada com calda, com geleia de damasco na massa desta versão. Há diferentes histórias sobre seu nome; a oficina não apresenta uma origem etimológica incerta como fato.',ingredients:'Farinha de trigo, açúcar, manteiga, ovo, leite, geleia de damasco, bicarbonato, vinagre e calda de creme.',output:'food-malva',sourceIds:['malva-rhodes'],steps:[step('Bater manteiga, açúcar, ovo e geleia','stir','new-prep',2,0,0),step('Adicionar o leite à mistura','pour','new-prep',2,0,0),step('Misturar os ingredientes secos','stir','new-prep',2,0,1),step('Colocar a massa na forma','layer','new-prep',2,1,1),step('Assar o malva pudding','bake','new-prep',2,1,2),step('Apurar a calda de creme','simmer','new-dishes',1,3,3),step('Regar o bolo com a calda','pour','new-prep',2,2,3),plate(3)]},
 {id:'muamba',name:'Muamba de galinha',area:'africa',region:'Angola',context:'Galinha com óleo de palma, quiabo e jindungo nesta versão da oficina. Em Angola, pode ser servida com funge; famílias e regiões variam ingredientes e acompanhamentos.',ingredients:'Galinha, óleo de palma, quiabo, cebola, tomate, alho, jindungo e caldo.',output:'food-muamba',sourceIds:['muamba-embassy','muamba-cuisine','muamba-cook'],steps:[step('Picar a cebola','cut','prep',1,1,3),step('Temperar os pedaços de galinha','season','new-prep',3,0,0),step('Refogar a galinha com a cebola','stir','new-prep',3,0,1),step('Adicionar o quiabo e o tomate','layer','new-prep',3,1,2),step('Medir o caldo da panela','pour','new-prep',3,2,2),step('Cozinhar a muamba e regular o fogo','simmer','new-prep',3,2,3),plate(4)]}
];
const fruits=[
 ['banana','Banana',0,4,22,7,'Porção de banana da banca. Cultivada e consumida no Brasil e em muitos outros países.'],
 ['mango','Manga',1,6,22,12,'Porção de manga madura. Uma fruta cultivada no Brasil e na África do Sul, com muitas variedades.'],
 ['papaya','Mamão',2,5,18,15,'Porção de mamão maduro selecionado para a feira.'],
 ['pineapple','Abacaxi',3,6,18,17,'Porção de abacaxi da banca de frutas. A planta tem origem sul-americana.'],
 ['guava','Goiaba',4,5,20,10,'Goiaba fresca da seleção da feira. Há variedades com polpa clara e com polpa vermelha.'],
 ['coconut','Coco fresco',5,7,22,7,'Porção de polpa de coco. Para água de coco, a banca oferece também o coco aberto da Joana.'],
 ['passionfruit','Maracujá',6,5,14,12,'Porção de polpa de maracujá, servida sem casca.'],
 ['jabuticaba','Jabuticaba',7,7,18,12,'Porção de jabuticabas. Os frutos aparecem junto ao tronco da jabuticabeira; diferentes espécies e variedades chegam às feiras.'],
 ['orange','Laranja',8,4,17,17,'Laranja da banca, vendida em porção. Cítricos são cultivados em diferentes regiões do Brasil e da África do Sul.'],
 ['naartjie','Naartjie · tangerina',9,5,17,15,'Tangerina conhecida localmente como naartjie. A produção de cítricos sul-africanos inclui laranjas, limões e naartjies.'],
 ['peach','Pêssego',10,6,17,13,'Pêssego da seleção sul-africana. O Cabo Ocidental é uma importante região produtora de frutas de caroço.'],
 ['grapes','Uvas de mesa',11,6,18,12,'Porção de uvas para comer. O Cabo Ocidental participa fortemente da produção sul-africana de uvas de mesa.'],
 ['marula','Marula',12,8,16,12,'Fruto de uma árvore das savanas da África austral. Nandi recebe sua seleção de fornecedores do norte do país; a fruta não é apresentada como nativa da Cidade do Cabo.'],
 ['watermelon','Melancia',13,5,14,23,'Porção de melancia cortada pela banca, sem casca.'],
 ['avocado','Abacate',14,7,26,7,'Porção de abacate da feira. Uma fruta também produzida na África do Sul.'],
 ['lemon','Limão',15,3,10,12,'Porção de limão da banca. Pode ser guardada para o caminho ou consumida na feira.']
];
const X=V.FoodExpansion={recipes,fruits,sources,worldGroup:'nature',
 icon(id,size=48){const d=V.AdventureData.items[id];if(!d?.foodExpansion)return null;const frame=d.expansionFrame,rows=d.expansionSheet==='new-dishes'?2:4;return `<span class="food-expansion-art adv-icon" aria-hidden="true" style="--food-size:${size}px;--food-x:${frame%4};--food-y:${Math.floor(frame/4)};--food-rows:${rows};background-image:url('assets/nature/${d.expansionSheet}.webp?v=20261102-nature1')"></span>`;},
 drawStall(c,o,cam){if(o.type!=='market-stall'||!['joana','nandi'].includes(o.marketVendor))return false;V.NatureArt.frame(c,'habitats',0,o.marketVendor==='joana'?0:1,o.x-cam.x-o.w/2,o.y-cam.y-o.h,o.w,o.h);return true;},
 ensure(){return V.NatureArt.ensure('food');}
};
for(const r of recipes)if(!D.recipes.some(old=>old.id===r.id))D.recipes.push(r);
for(const s of sources){if(!D.sources.some(old=>old.url===s.url))D.sources.push(s);if(!V.MarketData.sources.some(old=>old.url===s.url))V.MarketData.sources.push(s);}
for(const[r,i]of recipes.map((r,i)=>[r,i]))V.AdventureData.items[r.output]={name:r.name,description:r.context,category:'consumable',stack:10,effect:'heal',power:i===3?6:12,price:[14,22,17,12,28][i],nutrition:[48,68,48,27,74][i],hydration:[5,7,5,0,10][i],satiety:i===3?45:150,cookingItem:true,foodExpansion:true,expansionSheet:'new-dishes',expansionFrame:i};
for(const[id,name,frame,price,nutrition,hydration,description]of fruits)V.AdventureData.items['fruit-'+id]={name,description,category:'consumable',stack:10,effect:'heal',power:Math.max(2,Math.round(nutrition/6)),price,nutrition,hydration,satiety:35,foodExpansion:true,expansionSheet:'fruits',expansionFrame:frame};
const br=['banana','mango','papaya','pineapple','guava','coconut','passionfruit','jabuticaba','orange','watermelon','avocado','lemon'].map(id=>'fruit-'+id),sa=['orange','naartjie','peach','grapes','marula','watermelon','avocado','lemon','mango'].map(id=>'fruit-'+id);
const joana=M.vendor('joana');joana.stock=[...new Set([...joana.stock,...br])];joana.text='Escolho frutas para comer no caminho: banana, manga, mamão, abacaxi e outras da feira. Também há água gratuita no bebedouro. A seleção pode reunir frutas cultivadas aqui e frutas que chegaram de outras regiões.';
for(const[id,stock]of [['dandara',['food-angu','food-baiao']],['thandi',['food-geelrys']],['amina',['food-malva']]]){const v=M.vendor(id);v.stock=[...new Set([...v.stock,...stock])];}
if(!M.vendor('nandi'))V.MarketData.vendors.push({id:'nandi',name:'Nandi',shop:'Frutas da Nandi · Fresh Fruit',map:'cape-market',sprite:'town-nandi',stall:1,at:[20,11.5],text:'Tenho naartjies, laranjas, pêssegos e uvas de mesa da seleção sul-africana. Marula vem de fornecedores de regiões de savana do norte do país. Cuidar do solo, da água e dos polinizadores ajuda as frutas a chegar à banca.',stock:sa});
const game=V.Playground.game(D.id);game.stages=D.recipes.length;game.description='Descame, corte, moa, mexa e acerte o ponto. Prepare '+D.recipes.length+' pratos de cozinhas afro-brasileiras e de regiões africanas.';const achievement=V.Quests.achievements.find(a=>a.id==='play-all-'+D.id);if(achievement)achievement.desc='Preparou as '+D.recipes.length+' receitas da oficina.';
const dish=A.dish.bind(A);A.dish=function(id,size=48){return X.icon(id,size)||dish(id,size);};
const icon=P.icon.bind(P);P.icon=function(id,size=48){return X.icon(id,size)||icon(id,size);};
const attach=V.Playground.attach.bind(V.Playground);V.Playground.attach=function(r){if(r.game===D.id&&recipes.some(recipe=>recipe.id===D.recipes[r.data.stage]?.id))X.ensure();return attach(r);};
const draw=M.draw.bind(M);M.draw=function(c,o,cam){return X.drawStall(c,o,cam)||draw(c,o,cam);};
// Fresh fruit has its own category; the legacy food filter otherwise omits
// hydrating snacks with less than 30 points of nutrition.
const shop=M.shop.bind(M);M.shop=function(id,filter='all',quantity=1){
 const base=typeof id==='object'?(id._fruitBase||id):M.vendor(id)||M.nativeShop(),hasFruit=base.stock.some(id=>id.startsWith('fruit-'));
 const vendor=filter==='fruits'?{...base,stock:base.stock.filter(id=>id.startsWith('fruit-')),_fruitBase:base}:base;
 const out=shop(vendor,filter==='fruits'?'all':filter,quantity);if(!hasFruit)return out;
 const nav=V.$('.market-filters'),button=document.createElement('button');button.className='secondary';button.dataset.fruitFilter='true';button.textContent='Frutas';button.setAttribute('aria-pressed',String(filter==='fruits'));nav?.append(button);button.onclick=()=>M.shop(base,'fruits',+V.$('#market-quantity').value);
 V.$$('[data-market-filter]').forEach(b=>{if(filter==='fruits')b.setAttribute('aria-pressed','false');b.onclick=()=>M.shop(base,b.dataset.marketFilter,+V.$('#market-quantity').value);});
 V.$('#market-quantity').onchange=e=>M.shop(base,filter,+e.target.value);
 V.$$('[data-market-buy]').forEach(b=>b.onclick=()=>{const result=M.buy(base,b.dataset.marketBuy,+V.$('#market-quantity').value);M.shop(base,filter,quantity);V.$('#market-feedback').textContent=(result.ok?'✓ ':'')+result.message;});
 return out;
};
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);if(m?.marketRegion)out.push(X.worldGroup);return [...new Set(out)];};
})();

});
