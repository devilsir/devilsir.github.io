(function(){
'use strict';
const D=window.V.NatureData;
Object.assign(D.sources,{
 hyena:{title:'SANBI · Hiena-malhada',url:'https://speciesstatus.sanbi.org/taxa/detail/1999/'},
 adder:{title:'Smithsonian · Puff adder',url:'https://nationalzoo.si.edu/animals/puff-adder'},
 meerkat:{title:'SANBI · Suricato',url:'https://www.sanbi.org/animal-of-the-week/meerkat/'},
 wilddog:{title:'SANBI · Mabeco',url:'https://www.sanbi.org/animal-of-the-week/african-wild-dog/'},
 eagle:{title:'BirdLife South Africa · Águia-pesqueira-africana',url:'https://www.birdlife.org.za/red-data-book/red-list/african-fish-eagle/'},
 anaconda:{title:'Instituto Butantan · Sucuris',url:'https://www.butantan.gov.br/butantan-educa/grandiosa-musculosa-e-sul-americana-conheca-a-sucuri'},
 tapir:{title:'Zoológico de Brasília · Anta',url:'https://www.zoo.df.gov.br/anta'},
 otter:{title:'AMPA · Ariranha',url:'https://ampa.org.br/especies/ariranha/'},
 armadillo:{title:'Florida Museum · Tatu-galinha',url:'https://www.floridamuseum.ufl.edu/discover/story/five-facts-nine-banded-armadillo/'},
 armadilloWater:{title:'Texas Parks & Wildlife · Tatu na água',url:'https://tpwd.texas.gov/education/resources/texas-junior-naturalists/watching-wildlife/nine-banded-armadillo'},
 harpy:{title:'Museu Nacional / UFRJ · Harpia',url:'https://www.museunacional.ufrj.br/dir/exposicoes/zoologia/zoo_vertebrados/exposicoes/zoo_aves/zooave017.html'},
 hippoWater:{title:'San Diego Zoo Wildlife Alliance · Hipopótamos na água',url:'https://stories.sdzwa.org/story-hub/zoonooz/making-waves'},
 capybara:{title:'San Diego Zoo · Capivara',url:'https://animals.sandiegozoo.org/animals/capybara'},
 jaguarLife:{title:'San Diego Zoo · Onça-pintada',url:'https://animals.sandiegozoo.org/animals/jaguar'},
 megafauna:{title:'Museu Nacional / UFRJ · Megafauna extinta',url:'https://www.museunacional.ufrj.br/dir/exposicoes/paleontologia/pale033.html'},
 toxodon:{title:'Prefeitura de Castelo · Pesquisa da megafauna',url:'https://castelo.es.gov.br/descoberto-em-castelo-o-maior-campo-fossilifero-do-estado-do-espirito-santo'},
 mesosaur:{title:'National Museum · Coleção paleontológica',url:'https://nationalmuseum.co.za/palaeontology/'},
 irati:{title:'UNICENTRO · Mesossauros e deriva continental',url:'https://www3.unicentro.br/museuinterativo/mesossauros-e-a-deriva-continental/'},
 lystrosaurus:{title:'Iziko Museums · Paleontologia do Karoo',url:'https://www.iziko.org.za/collection/karoo-palaeontology/'},
 lystroStudy:{title:'National Museum · Estudo de Lystrosaurus',url:'https://nationalmuseum.co.za/wp-content/uploads/2019/02/Botha-2020-The-paleobiology-and-paleoecology-of-South-African-Lystrosaurus.pdf'}
});
const extra=[
 ['spotted-hyena','Hiena-malhada','Crocuta crocuta','africa-extra',0,['nature-savanna'],'hyena','Mamífero carnívoro de savanas e outros ambientes africanos. A hiena também caça; seu papel ecológico não se limita a consumir carcaças.',105,'land','África subsaariana; na África do Sul, savanas e áreas de conservação.','A família das hienas é diferente da família dos cães.'],
 ['puff-adder','Víbora-sopradora','Bitis arietans','africa-extra',1,['nature-savanna','nature-wetlands'],'adder','Serpente de corpo robusto, camuflada entre folhas, solo e vegetação. É peçonhenta: a observação deve ser feita à distância.',91,'land','África, incluindo a África do Sul, em campos, arbustos e bordas de matas.','Apesar de passar muito tempo no solo, também consegue nadar.'],
 ['meerkat','Suricato','Suricata suricatta','africa-extra',2,['nature-savanna'],'meerkat','Pequeno mamífero social de ambientes secos. Usa tocas e procura alimento em grupo. O setor seco deste mapa representa parte desse ambiente.',65,'land','Sul da África, em regiões secas do interior, incluindo áreas sul-africanas.','Enquanto alguns procuram alimento, um integrante pode ficar de sentinela.'],
 ['wild-dog','Mabeco','Lycaon pictus','africa-extra',3,['nature-savanna'],'wilddog','Canídeo africano de grandes orelhas arredondadas e pelagem manchada. A cooperação do grupo participa da caça e do cuidado com os filhotes.',104,'land','Populações fragmentadas na África subsaariana; também em reservas da África do Sul.','O desenho de manchas da pelagem varia entre indivíduos.'],
 ['fish-eagle','Águia-pesqueira-africana','Icthyophaga vocifer','flight',3,['nature-wetlands'],'eagle','Ave de rapina que frequenta rios, lagos e reservatórios, usando árvores como pontos de observação para capturar alimento.',107,'bird','África subsaariana; na África do Sul, rios, lagos e áreas úmidas.','A textura dos pés ajuda a segurar presas escorregadias, como peixes.'],
 ['yellow-anaconda','Sucuri-amarela','Eunectes notaeus','brazil-extra',0,['nature-pantanal'],'anaconda','Serpente semiaquática associada ao Pantanal e a outros ambientes sul-americanos. Não tem peçonha; captura presas por constrição.',118,'water','América do Sul; no Brasil, principalmente o Pantanal.','Olhos e narinas mais altos na cabeça se relacionam à vida junto da água.'],
 ['tapir','Anta-brasileira','Tapirus terrestris','brazil-extra',1,['nature-pantanal','nature-cerrado','nature-atlantic'],'tapir','Mamífero herbívoro de focinho curto e flexível. Frequenta florestas e ambientes próximos de água, transportando sementes no seu percurso.',125,'land','Brasil: Amazônia, Pantanal, Cerrado e Mata Atlântica.','As fezes com sementes podem contribuir para o surgimento de novas plantas.'],
 ['giant-otter','Ariranha','Pteronura brasiliensis','brazil-extra',2,['nature-pantanal'],'otter','Mustelídeo semiaquático que vive em grupos e se alimenta principalmente de peixes. Rios e barrancos preservados fazem parte de seu habitat.',108,'water','América do Sul; populações atuais importantes na Amazônia e no Pantanal.','A mancha clara na garganta permite distinguir indivíduos.'],
 ['armadillo','Tatu-galinha','Dasypus novemcinctus','brazil-extra',3,['nature-cerrado','nature-atlantic'],'armadillo','Mamífero com carapaça de placas e faixas flexíveis. Escava o solo e usa tocas como abrigo.',80,'land','Américas; no Brasil, presente em diferentes ambientes de vegetação.','Diferente dos tatus-bola, este tatu não se enrola em uma bola fechada.'],
 ['harpy','Harpia','Harpia harpyja','flight',2,['nature-atlantic'],'harpy','Grande ave de rapina de florestas. A destruição da mata limita sua ocorrência; a área do jogo representa um fragmento protegido.',116,'bird','Florestas da América tropical; no Brasil, Amazônia e remanescentes da Mata Atlântica.','Também é conhecida pelo nome gavião-real.']
];
for(const [id,name,scientific,sheet,row,maps,source,description,size,motion,location,curiosity] of extra)D.species.push({id,name,scientific,sheet,row,maps,source,description,size,motion,location,curiosity,country:sheet==='africa-extra'||id==='fish-eagle'?'África do Sul':'Brasil'});
for(const s of D.species){s.country||=s.sheet==='brazil'?'Brasil':'África do Sul';for(const id of s.maps){const m=D.maps.find(m=>m.id===id);if(m&&!m.species.includes(s.id))m.species.push(s.id);}}
D.maps[0].description+=' O passeio é um mosaico ficcional: seu setor mais seco também apresenta o ambiente dos suricatos, sem reproduzir um único parque.';
const swimming={hippo:['water-full-africa',0],'nile-crocodile':['water-full-africa',1],elephant:['water-full-africa',2],buffalo:['water-full-africa',3],capybara:['water-full-brazil',0],jaguar:['water-full-brazil',1],'yacare-caiman':['water-full-brazil',2],tapir:['water-full-brazil',3],'giant-otter':['water-full-extra',0],'yellow-anaconda':['water-full-extra',1],'puff-adder':['water-full-extra',2],armadillo:['water-full-extra',3]};
for(const s of D.species){if(swimming[s.id]){s.waterArt={sheet:swimming[s.id][0],row:swimming[s.id][1]};s.waterLabel=s.id==='hippo'?'Deslocamento submerso':'Nado';}if(s.motion==='bird')s.flightArt={sheet:'flight',row:{macaw:0,toucan:1,harpy:2,'fish-eagle':3}[s.id]};}
const facts={
 hippo:['África subsaariana; rios e lagos da África do Sul.','Na água, desloca-se apoiando e impulsionando o corpo no fundo; não nada como uma lontra.','hippoWater'],
 lion:['África; na África do Sul, savanas e áreas de conservação.','Sua vida social inclui grupos, diferentes dos hábitos de muitos outros felinos.'],
 elephant:['Savanas da África subsaariana; também no interior sul-africano.','A tromba é usada em tarefas como alcançar água e alimento.'],
 'nile-crocodile':['África; rios, lagos e margens da África do Sul.','O movimento lateral da cauda impulsiona o corpo na água.'],
 giraffe:['África austral, incluindo a África do Sul.','Há mais de uma espécie de girafa; aqui está representada a girafa-do-sul.'],
 zebra:['África oriental e austral; savanas e campos sul-africanos.','A zebra é um equídeo, parente dos cavalos.'],
 'white-rhino':['África austral; áreas protegidas da África do Sul.','Seu lábio largo se relaciona à alimentação em gramíneas.'],
 buffalo:['África subsaariana; savanas e áreas próximas de água.','Os dois sexos possuem chifres, com formas que mudam com idade e sexo.'],
 capybara:['América do Sul; no Brasil, áreas com água, incluindo o Pantanal.','É o maior roedor vivo e consegue nadar.','capybara'],
 jaguar:['Américas; no Brasil, Amazônia, Pantanal e outros remanescentes.','Ao contrário da ideia de que todo felino evita água, a onça pode nadar.','jaguarLife'],
 'giant-anteater':['América Central e do Sul; no Brasil, incluindo o Cerrado.','Formigas e cupins estão entre seus alimentos.'],
 'maned-wolf':['América do Sul; no Brasil, sobretudo ambientes abertos do Cerrado.','Sua alimentação inclui frutos; a lobeira faz parte dessa relação com o ambiente.'],
 macaw:['América tropical; no Brasil, diferentes regiões e áreas de reintrodução.','As reintroduções exigem planejamento e acompanhamento, como o projeto da Tijuca.'],
 toucan:['América do Sul; no Brasil, incluindo áreas do Cerrado.','O bico grande é uma característica marcante, mas não transforma a ave em animal doméstico.'],
 sloth:['América tropical; no Brasil, Amazônia e Mata Atlântica.','A preguiça atual e as preguiças-gigantes extintas pertencem a linhagens diferentes.'],
 'yacare-caiman':['Centro da América do Sul; rios e áreas alagadas do Pantanal.','Jacarés e crocodilos são crocodilianos, mas pertencem a famílias distintas.']
};
for(const s of D.species){const f=facts[s.id];if(f){s.location=f[0];s.curiosity=f[1];if(f[2])s.factSource=f[2];}}
window.V.AnimalMuseumData={intro:'Animais conectam territórios, água, florestas e a história da vida. Este museu ficcional usa modelos animados e reconstruções artísticas: os animais livres permanecem nos biomas.',fossils:[
 {id:'eremotherium',name:'Preguiça-gigante',scientific:'Eremotherium laurillardi',region:'Brasil · registros em diferentes regiões, incluindo a Bahia',period:'Quaternário · Pleistoceno',row:0,col:0,description:'Mamífero extinto da megafauna americana. O modelo representa uma preguiça terrestre gigante, diferente das preguiças arborícolas atuais.',curiosity:'O Museu Nacional registra uma história de reinterpretação científica da montagem de Eremotherium.',sources:['megafauna']},
 {id:'toxodon',name:'Toxodonte',scientific:'Toxodon sp.',region:'América do Sul · registros brasileiros, incluindo o Espírito Santo',period:'Quaternário · Pleistoceno',row:0,col:1,description:'Grande mamífero herbívoro extinto da América do Sul. Nesta vitrine, uma reconstrução do crânio ajuda a observar a forma do focinho e dos dentes.',curiosity:'Embora sua forma lembre outros grandes herbívoros, não era um rinoceronte.',sources:['toxodon']},
 {id:'mesosaurus',name:'Mesossauro',scientific:'Mesosaurus sp.',region:'América do Sul e África austral · registros no Brasil e na África do Sul',period:'Permiano',row:0,col:2,description:'Réptil aquático extinto de corpo alongado. A placa representa um esqueleto preservado em rocha, sem ser uma réplica de um exemplar específico.',curiosity:'Fósseis de mesossauros nos dois lados do Atlântico ajudam a discutir a antiga união dos continentes.',sources:['mesosaur','irati']},
 {id:'lystrosaurus',name:'Lystrosaurus',scientific:'Lystrosaurus sp.',region:'África do Sul · Bacia do Karoo; também conhecido em outras regiões do mundo',period:'Permiano e Triássico · depende da espécie',row:0,col:3,description:'Dicinodonte extinto, do grupo dos sinapsídeos. O crânio reconstruído tem bico e presas; ele não era um dinossauro.',curiosity:'As coleções do Karoo permitem estudar a vida antes e depois da extinção do fim do Permiano.',sources:['lystrosaurus','lystroStudy']}
]};
})();
