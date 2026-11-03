(function () {
  'use strict';
  const V=window.V;
  const sources={
    abrolhos:['ICMBio · Abrolhos','https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/unidade-de-conservacao/unidades-de-biomas/marinho/lista-de-ucs/parna-marinho-dos-abrolhos/downloads/material_de_apoio_2019.pdf'],
    boto:['Portos do Paraná · Baía de Paranaguá','https://www.portosdoparana.pr.gov.br/Meio-Ambiente/Pagina/Baia-de-Paranagua'],
    tamar:['Projeto TAMAR · Tartaruga-cabeçuda','https://ftp.tamar.org.br/tartaruga.php?cod=18'],
    sardineBR:['IBAMA · Sardinha-verdadeira','https://www.ibama.gov.br/component/legislacao/?legislacao=114955&view=legislacao'],
    reef:['UFES · Peixes de Itaúnas','https://pesca.ufes.br/sites/pesca.ufes.br/files/field/anexo/Peixes%20e%20Crust%C3%A1ceos%20do%20Parque%20Estadual%20de%20Ita%C3%BAnas.pdf'],
    cape:['SANParks · Vida marinha do Cabo','https://www.sanparks.org/parks/table-mountain/explore/fauna-flora/marine-life'],
    westcoast:['SANParks · Fauna da costa oeste','https://www.sanparks.org/wp-content/uploads/2025/07/State-of-Knowledge_WCNP-MPAs_2025.pdf'],
    penguin:['BirdLife South Africa · African Penguin','https://www.birdlife.org.za/red-data-book/red-list/african-penguin/'],
    yellowtail:['WWF-SASSI · Yellowtail','https://wwfsassi.co.za/sassi-list/fish/?id=113'],
    snoek:['WWF-SASSI · Snoek','https://wwfsassi.co.za/sassi-list/fish/?id=98'],
    sardineSA:['WWF África do Sul · Pescarias e ecossistemas','https://wwfsassi.co.za/wp-content/uploads/Fisheries-Facts-and-Trends-South-Africa.pdf']
  };
  const species=[
    ['humpback','Baleia-jubarte','Humpback whale','Megaptera novaeangliae',['br','sa'],'marine-brazil',0,214,'Abrolhos, no Brasil, e águas costeiras sul-africanas.','As nadadeiras peitorais longas ajudam a reconhecer esta baleia. No Brasil, Abrolhos é uma importante área de reprodução.','abrolhos','whale'],
    ['guiana-dolphin','Boto-cinza','Guiana dolphin','Sotalia guianensis',['br'],'marine-brazil',1,91,'Águas costeiras, baías e estuários do litoral brasileiro.','É um golfinho costeiro. Na Baía de Paranaguá, usa o ambiente para se alimentar, reproduzir e cuidar dos filhotes.','boto','dolphin'],
    ['loggerhead','Tartaruga-cabeçuda','Loggerhead sea turtle','Caretta caretta',['br'],'marine-brazil',2,76,'Litoral brasileiro; áreas de desova incluem Bahia, Sergipe, Espírito Santo e norte do Rio de Janeiro.','A cabeça grande é uma característica desta tartaruga marinha. Praias e mar fazem parte de seu ciclo de vida.','tamar','sea turtle'],
    ['brazilian-sardine','Sardinha-verdadeira','Brazilian sardine','Sardinella brasiliensis',['br'],'marine-brazil',3,38,'Litoral do Sudeste e do Sul do Brasil.','Peixes de cardume participam das redes alimentares do mar. O caderno reúne espécies de diferentes trechos da costa brasileira.','sardineBR','shoal'],
    ['sergeant-major','Sargentinho','Sergeant major','Abudefduf saxatilis',['br'],'marine-fish',3,35,'Ambientes costeiros brasileiros, incluindo o litoral do Espírito Santo.','As faixas escuras ajudam a distinguir este pequeno peixe. Observe as cores e a forma do corpo.','reef','fish'],
    ['southern-right','Baleia-franca-austral','Southern right whale','Eubalaena australis',['sa'],'marine-cape',0,207,'Águas costeiras do sul da África, incluindo a região do Cabo.','Não tem nadadeira dorsal. As áreas claras e irregulares na cabeça são chamadas calosidades.','cape','whale'],
    ['bottlenose','Golfinho-nariz-de-garrafa','Bottlenose dolphin','Tursiops truncatus',['sa'],'marine-cape',1,95,'Costa sul-africana; há registros na região da costa oeste.','Observe o focinho curto e a nadadeira dorsal curva. O Cabo tem mais de uma espécie de golfinho.','westcoast','dolphin'],
    ['cape-fur-seal','Lobo-marinho-do-cabo','Cape fur seal','Arctocephalus pusillus pusillus',['sa'],'marine-cape',2,84,'Litoral do sul da África, incluindo a costa do Cabo.','Nada com as nadadeiras e também descansa em terra. Deixe espaço para os animais e seus locais de repouso.','westcoast','seal'],
    ['african-penguin','Pinguim-africano','African penguin','Spheniscus demersus',['sa'],'marine-cape',3,51,'Costa da África do Sul e da Namíbia.','É uma ave marinha que usa as asas para nadar. A conservação depende também das condições de seu habitat e alimento.','penguin','penguin'],
    ['yellowtail','Yellowtail','Yellowtail','Seriola lalandi',['sa'],'marine-fish',0,61,'Águas costeiras da África do Sul.','O nome inglês chama atenção para a cauda amarela. A espécie aparece nas referências de pesca do Cabo.','yellowtail','fish'],
    ['snoek','Snoek','Cape snoek','Thyrsites atun',['sa'],'marine-fish',1,65,'Costa sul-africana.','Um peixe alongado presente na pesca e na culinária do Cabo. Observe a silhueta antes de tentar identificar uma espécie.','snoek','fish'],
    ['cape-sardine','Sardinha sul-africana','South African sardine','Sardinops sagax',['sa'],'marine-fish',2,37,'Águas sul-africanas.','Cardumes de peixes pequenos conectam muitas espécies nas redes alimentares marinhas.','sardineSA','shoal']
  ].map(([id,name,en,scientific,regions,sheet,row,size,location,note,source,word])=>({id,name,en,scientific,regions,sheet,row,size,location,note,source,word}));
  V.MarineLifeData={sources,species,regions:{harbor:'br',beach:'br','cape-town':'sa',muizenberg:'sa'},watchSites:{harbor:[28,32.5],beach:[21,15.5],'cape-town':[34,35.5],muizenberg:[26,29.4]}};
})();
