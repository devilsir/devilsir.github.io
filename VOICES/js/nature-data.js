/* Registered module: nature-data */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("nature-data", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const sources={
 kruger:{title:'SANParks · Fauna do Kruger',url:'https://www.sanparks.org/parks/kruger/explore/fauna-flora/mammals'},
 giraffe:{title:'Giraffe Conservation Foundation · Girafa-do-sul',url:'https://giraffeconservation.org/programs/southern-giraffe-conservation-in-south-africa/'},
 savanna:{title:'SANBI · Biomas e ecossistemas terrestres',url:'https://nba.sanbi.org.za/content/terrestrial/ter_ecosystems.html'},
 reptiles:{title:'DFFE / SANParks · Plano de manejo do Kruger',url:'https://www.dffe.gov.za/sites/default/files/docs/krugernationalparkmanagement_approvedplan.pdf'},
 respect:{title:'SANParks · Orientações de visitação do Kruger',url:'https://www.sanparks.org/parks/kruger/useful-information/vital-information'},
 pantanal:{title:'IMASUL · Estrada Parque Pantanal',url:'https://www.imasul.ms.gov.br/aeit-estrada-parque-pantanal/'},
 wolf:{title:'ICMBio · Conservação do lobo-guará',url:'https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/pan/pan-lobo-guara/pan-lobo-guara'},
 anteater:{title:'ICMBio · Conservação de tamanduás e tatus',url:'https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/pan/pan-tamandua-e-tatus'},
 sloth:{title:'ICMBio / SALVE · Bradypus variegatus',url:'https://doi.org/10.37002/salve.ficha.22380.2'},
 toucan:{title:'Universidade de Brasília · Tucano-toco',url:'https://sema.unb.br/animais-silvestres/190-animais/114-tucano-toco'},
 macaw:{title:'ICMBio · Retorno de araras-canindés à Tijuca',url:'https://agenciagov.ebc.com.br/noticias/202506/comeca-retorno-de-araras-canindes-ao-parque-nacional-da-tijuca-apos-mais-de-200-anos-de-extincao-da-especie-no-rio-de-janeiro'},
 caiman:{title:'Zoológico Municipal de Santa Cruz · Caiman yacare',url:'https://zoologico.gmsantacruz.gob.bo/Herpetologia/Lagartos/Lagarto-Yacar%C3%A9'},
 habitats:{title:'Ministério do Meio Ambiente · Biodiversidade e biomas',url:'https://www.gov.br/mma/pt-br/assuntos/biodiversidade-e-biomas/biodiversidade'},
 jaguar:{title:'ICMBio · Conservação da onça-pintada',url:'https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/pan/pan-onca-pintada'}
};
const maps=[
 {id:'nature-savanna',name:'Savana sul-africana',region:'África do Sul · interior',biome:'Savana',stage:0,source:'savanna',palette:['#b9ad66','#c7b875','#d2bf80','#9b9c5e'],species:['lion','elephant','giraffe','zebra','white-rhino','buffalo'],threats:['caça ilegal','armadilhas','extração ilegal de madeira'],description:'Gramíneas e árvores espaçadas formam esta savana de referência sul-africana. Ela fica no interior do país, em outra região natural em relação ao Cabo.',conservation:'Corredores de habitat permitem deslocamentos. Proteja a vegetação e observe pelos locais indicados.'},
 {id:'nature-wetlands',name:'Rios da savana',region:'África do Sul · áreas ribeirinhas',biome:'Rios e zonas úmidas da savana',stage:1,source:'reptiles',palette:['#8ca17a','#9dab82','#b0b889','#91aa88'],species:['hippo','nile-crocodile','elephant','buffalo'],threats:['pesca ilegal','redes abandonadas','mineração ilegal'],description:'Este mapa representa rios e margens úmidas dentro da região de savana. Hipopótamos e crocodilos-do-nilo aparecem junto da água.',conservation:'Água, margens vegetadas e ciclos naturais sustentam a fauna. Observe das passarelas e dos postos.'},
 {id:'nature-pantanal',name:'Pantanal',region:'Brasil · planície alagável',biome:'Pantanal',stage:2,source:'pantanal',palette:['#8ca878','#a9b989','#9db27f','#b9c69a'],species:['capybara','jaguar','yacare-caiman','macaw'],threats:['pesca ilegal','caça ilegal','contaminação da água'],description:'O pulso de cheias e vazantes transforma a paisagem pantaneira. Matas, campos, margens e áreas alagadas compõem um mosaico.',conservation:'Proteger rios e vegetação das margens também protege as áreas de reprodução e alimentação dos animais.'},
 {id:'nature-cerrado',name:'Cerrado',region:'Brasil · savana brasileira',biome:'Cerrado',stage:3,source:'habitats',palette:['#a4ac69','#b8b877','#c7bc84','#a1a768'],species:['maned-wolf','giant-anteater','macaw','toucan'],threats:['caça ilegal','extração ilegal de madeira','mineração ilegal'],description:'Campos, formações de savana e matas fazem parte do Cerrado. Árvores de troncos retorcidos não significam vegetação sem valor.',conservation:'Preserve nascentes e conexões entre áreas naturais. A conservação considera o conjunto de habitats.'},
 {id:'nature-atlantic',name:'Mata Atlântica',region:'Brasil · floresta e restauração',biome:'Mata Atlântica',stage:4,source:'habitats',palette:['#4e7953','#5c865c','#638d5e','#527e52'],species:['sloth','jaguar','macaw'],threats:['captura ilegal de fauna','extração ilegal de madeira','fragmentação do habitat'],description:'Florestas e outras formações compõem este bioma brasileiro. O mapa inclui uma área de restauração e observação da fauna.',conservation:'Conectar fragmentos e restaurar vegetação favorece deslocamentos. Solturas de animais exigem avaliação e acompanhamento técnico.'}
];
const species=[
 ['hippo','Hipopótamo','Hippopotamus amphibius','south-africa',0,['nature-wetlands'],'kruger','Vive associado à água e também se desloca em terra. Neste passeio, observe pelo posto ribeirinho.',144,'water'],
 ['lion','Leão','Panthera leo','south-africa',1,['nature-savanna'],'kruger','Grande felino presente no Kruger. O passeio preserva espaço para a fauna seguir seus movimentos.',124,'land'],
 ['elephant','Elefante-africano-da-savana','Loxodonta africana','south-africa',2,['nature-savanna','nature-wetlands'],'kruger','Integra a fauna das savanas sul-africanas. Seus deslocamentos precisam de habitats conectados.',170,'land'],
 ['nile-crocodile','Crocodilo-do-nilo','Crocodylus niloticus','south-africa',3,['nature-wetlands'],'reptiles','Réptil das águas e margens do Kruger. Aqui pode ser observado das passarelas.',145,'water'],
 ['giraffe','Girafa-do-sul','Giraffa giraffa','south-africa',4,['nature-savanna'],'giraffe','A girafa-do-sul ocorre na África do Sul. Observe sem perseguir e preserve os habitats conectados.',146,'land'],
 ['zebra','Zebra-das-planícies','Equus quagga','south-africa',5,['nature-savanna'],'kruger','Mamífero da fauna sul-africana representado nos campos abertos deste mapa.',118,'land'],
 ['white-rhino','Rinoceronte-branco','Ceratotherium simum','south-africa',6,['nature-savanna'],'kruger','A conservação inclui proteção do habitat e combate à caça ilegal.',145,'land'],
 ['buffalo','Búfalo-africano','Syncerus caffer','south-africa',7,['nature-savanna','nature-wetlands'],'kruger','Mamífero presente no Kruger e representado em áreas abertas e próximas das margens.',138,'land'],
 ['capybara','Capivara','Hydrochoerus hydrochaeris','brazil',0,['nature-pantanal'],'pantanal','A capivara faz parte da fauna pantaneira e frequenta ambientes associados à água.',94,'land'],
 ['jaguar','Onça-pintada','Panthera onca','brazil',1,['nature-pantanal','nature-atlantic'],'jaguar','A proteção de grandes áreas e de conexões entre habitats ajuda a conservar a onça-pintada.',120,'land'],
 ['giant-anteater','Tamanduá-bandeira','Myrmecophaga tridactyla','brazil',2,['nature-cerrado'],'anteater','Este tamanduá usa áreas naturais para buscar alimento. A perda de habitat ameaça sua conservação.',126,'land'],
 ['maned-wolf','Lobo-guará','Chrysocyon brachyurus','brazil',3,['nature-cerrado'],'wolf','O lobo-guará ocupa formações abertas. Preserve campos e conexões entre áreas naturais.',123,'land'],
 ['macaw','Arara-canindé','Ara ararauna','brazil',4,['nature-cerrado','nature-pantanal','nature-atlantic'],'macaw','A restauração pode incluir reintroduções acompanhadas por especialistas, como a iniciativa registrada na Tijuca.',82,'bird'],
 ['toucan','Tucano-toco','Ramphastos toco','brazil',5,['nature-cerrado'],'toucan','Ave de bico grande presente nas paisagens representadas no Cerrado. A fauna deve permanecer livre.',76,'bird'],
 ['sloth','Preguiça-comum','Bradypus variegatus','brazil',6,['nature-atlantic'],'sloth','No Brasil ocorre na Amazônia e na Mata Atlântica. Perda e fragmentação de habitat estão entre suas ameaças.',82,'perch'],
 ['yacare-caiman','Jacaré-do-pantanal','Caiman yacare','brazil',7,['nature-pantanal'],'caiman','Espécie de jacaré de rios e áreas alagadas sul-americanas. Aqui vive na região pantaneira.',126,'water']
].map(([id,name,scientific,sheet,row,habitats,source,description,size,motion])=>({id,name,scientific,sheet,row,maps:habitats,source,description,size,motion}));
window.V.NatureData={sources,maps,species,challengeId:'guarda-biodiversidade'};
})();

});
