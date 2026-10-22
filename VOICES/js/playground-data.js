(function playgroundData(){
'use strict';const V=window.V;
V.PlaygroundData={
 games:[
 {id:'runner',title:'Corrida das Palavras',tag:'CORRA · TROQUE DE FAIXA · COLETE',color:'#e2af5d',description:'A cidade virou uma pista! Leve seu personagem até a palavra certa e encadeie acertos.',goal:'Atravesse 12 portais de palavras.',keys:'← → ou A/D · arraste para os lados no celular',icon:'runner'},
 {id:'courier',title:'Rota da Livraria',tag:'EXPLORE · CARREGUE · ENTREGUE',color:'#74b5a5',description:'Retire encomendas na livraria e atravesse o bairro para encontrar cada destinatário.',goal:'Complete as cinco entregas do bairro.',keys:'WASD / setas · E entrega · toque no destino para caminhar',icon:'book'},
 {id:'room',title:'Casa em Movimento',tag:'PEGUE · ARRASTE · DECORE',color:'#c8a6d1',description:'Transforme cômodos vazios em uma casa. Cada pedido muda a posição de um objeto.',goal:'Arrume oito espaços usando as posições em inglês.',keys:'Arraste e solte · ou selecione, use as setas e E',icon:'homes'},
 {id:'rhythm',title:'Palco do Ritmo',tag:'TOQUE · COMBINE · ACENDA O PALCO',color:'#e59a8b',description:'Os sinais descem pelas quatro faixas. Toque na linha e faça a banda ganhar luz e movimento.',goal:'Complete três sequências musicais.',keys:'D F J K · quatro botões no celular',icon:'music'},
 {id:'garden',title:'Jardim em Ação',tag:'PLANTE · REGUE · COLHA',color:'#a4c876',description:'Pegue sementes e água, cuide dos canteiros e leve a colheita para a botica.',goal:'Cuide de três canteiros e entregue a colheita.',keys:'WASD / setas · E usa o ponto próximo · toque para caminhar',icon:'leaf'},
 {id:'bridges',title:'Pontes do Bairro',tag:'GIRE · CONECTE · ATRAVESSE',color:'#80b1cb',description:'As peças da passarela saíram do lugar. Gire os caminhos e leve a equipe até o outro lado.',goal:'Reconecte quatro travessias.',keys:'Clique para girar · setas escolhem · E gira',icon:'compass'}
 ],
 words:[
 {pt:'livro',en:'book',wrong:['door','water']},{pt:'casa',en:'house',wrong:['seed','music']},{pt:'água',en:'water',wrong:['book','school']},{pt:'amigo',en:'friend',wrong:['street','garden']},{pt:'escola',en:'school',wrong:['house','flower']},{pt:'música',en:'music',wrong:['chair','source']},{pt:'semente',en:'seed',wrong:['water','street']},{pt:'escutar',en:'listen',wrong:['read','build']},{pt:'janela',en:'window',wrong:['book','friend']},{pt:'comunidade',en:'community',wrong:['computer','question']},{pt:'memória',en:'memory',wrong:['music','market']},{pt:'conhecimento',en:'knowledge',wrong:['backpack','window']}
 ],
 roomRounds:[
 {item:'plant',name:'plant',pt:'planta',relation:'next to',meaning:'ao lado de',ref:'sofa',refPt:'sofá',at:[3,2],goals:[[2,2],[4,2]],start:[0,3],prop:23},
 {item:'bed',name:'bed',pt:'cama',relation:'under',meaning:'embaixo de',ref:'window',refPt:'janela',at:[4,0],goals:[[4,1]],start:[0,3],prop:16},
 {item:'book',name:'book',pt:'livro',relation:'on',meaning:'em cima de, em contato',ref:'table',refPt:'mesa',at:[3,2],goals:[[3,2]],start:[0,3],prop:null},
 {item:'plant',name:'plant',pt:'planta',relation:'behind',meaning:'atrás de · rumo ao fundo da sala',ref:'sofa',refPt:'sofá',at:[3,2],goals:[[3,1],[3,0]],start:[0,3],prop:23},
 {item:'picture',name:'picture',pt:'quadro',relation:'above',meaning:'acima de · sem encostar',ref:'table',refPt:'mesa',at:[3,2],goals:[[3,1],[3,0]],start:[0,3],prop:null},
 {item:'chair',name:'chair',pt:'cadeira',relation:'in front of',meaning:'na frente de · rumo à entrada',ref:'table',refPt:'mesa',at:[3,1],goals:[[3,2],[3,3]],start:[0,3],prop:0,family:'neighborhood'},
 {item:'plant',name:'plant',pt:'planta',relation:'between',meaning:'entre duas referências',ref:'sofas',refPt:'sofás',at:[2,2],other:[4,2],goals:[[3,2]],start:[0,3],prop:23},
 {item:'chair',name:'chair',pt:'cadeira',relation:'to the left of',meaning:'à esquerda de',ref:'table',refPt:'mesa',at:[3,2],goals:[[2,2],[1,2],[0,2]],start:[0,3],prop:0,family:'neighborhood'}
 ],
 deliveries:[{item:'book',to:'school',pt:'Leve o livro para a escola.'},{item:'letter',to:'museum',pt:'Leve a carta para o museu.'},{item:'parcel',to:'garden',pt:'Leve a encomenda para o jardim.'},{item:'book',to:'community',pt:'Leve o livro para o centro comunitário.'},{item:'letter',to:'school',pt:'Leve a carta para a escola.'}],
 places:{library:{name:'library',pt:'Livraria',x:2,y:5,color:'#b48157'},school:{name:'school',pt:'Escola',x:2,y:1,color:'#6c9cb0'},museum:{name:'museum',pt:'Museu',x:11,y:1,color:'#bd9a6b'},garden:{name:'garden',pt:'Jardim',x:11,y:5,color:'#759866'},community:{name:'community center',pt:'Centro comunitário',x:7,y:1,color:'#a982a3'}},
 guides:{
 runner:[
 {title:'Você corre; a pista chega até você',text:'Seu personagem avança automaticamente. Só precisamos escolher a faixa: não é necessário apertar E para pegar palavras.',instruction:'Mude para a faixa da esquerda com ←, A ou o botão da esquerda.',event:'lane-left',focus:'left'},
 {title:'Troque de faixa outra vez',text:'Os movimentos são laterais. No celular você também pode arrastar o dedo sobre a pista.',instruction:'Volte para a faixa do meio usando →, D ou o botão da direita.',event:'lane-middle',focus:'right'},
 {title:'Corra até book',text:'O pedido é livro. Book aparece na faixa da direita. Atravessar esse portal coleta a palavra automaticamente.',instruction:'Vá para a faixa da direita e atravesse book.',event:'runner-hit',focus:'game',after:'Você escolheu com o corpo do personagem. A partida traz novas palavras, moedas e sequências de acertos.'}
 ],
 courier:[
 {title:'Caminhe pelo bairro',text:'A encomenda fica na livraria. Use as setas ou WASD. Tocar num lugar também desenha uma rota e faz o personagem caminhar.',instruction:'Dê alguns passos até a marca da livraria.',event:'courier-walk',focus:'game'},
 {title:'Abra as encomendas',text:'Ao chegar perto de um ponto, o botão de ação mostra o que você pode fazer ali.',instruction:'Na livraria, pressione E ou toque em Retirar encomenda.',event:'cargo-open',focus:'action'},
 {title:'Escolha a caixa book',text:'O pedido pede um livro. Uma encomenda viaja de cada vez; você pode devolvê-la à livraria se escolher outra.',instruction:'Toque na caixa book.',event:'cargo-book',focus:'cargo'},
 {title:'Entregue na escola',text:'School é a escola. Siga as pegadas até ela. A entrega só acontece quando você confirma no lugar certo.',instruction:'Vá à escola e pressione E ou Entregar encomenda.',event:'delivery',focus:'game',after:'Entrega feita! Na partida, as próximas rotas também trazem cartas e encomendas.'}
 ],
 room:[
 {title:'Pegue a planta',text:'Cada pedido usa um objeto que você realmente move. O item começa junto à caixa, no canto da sala.',instruction:'Toque na planta ou use Pegar objeto.',event:'room-pick',focus:'action'},
 {title:'Leve para o lado do sofá',text:'Next to significa ao lado. Neste quarto, os dois espaços vizinhos ao sofá funcionam.',instruction:'Arraste a planta para o lado do sofá ou mova o marcador com as setas.',event:'room-move',focus:'game'},
 {title:'Solte para colocar',text:'O contorno mostra onde o objeto vai ficar. No teclado, E confirma a posição; no toque, use Colocar objeto.',instruction:'Coloque a planta num dos espaços ao lado do sofá.',event:'room-place',focus:'action',after:'Você decorou um espaço. Os próximos pedidos apresentam under, on, behind, above e outras posições.'}
 ],
 rhythm:[
 {title:'Toque um instrumento',text:'Cada botão controla uma faixa: D, F, J e K. No celular, toque nos quatro tambores.',instruction:'Toque o tambor D.',event:'drum',focus:'drum0'},
 {title:'Espere a linha dourada',text:'O sinal desce até a linha perto dos tambores. Toque o botão da mesma faixa quando ele encostar nela.',instruction:'Acerte o sinal da faixa D. Neste treino ele espera na linha.',event:'rhythm-hit',focus:'game'},
 {title:'Complete a pequena sequência',text:'Agora os sinais alternam entre as faixas. O palco responde a cada acerto; som é opcional.',instruction:'Acerte os próximos quatro sinais.',event:'rhythm-sequence',focus:'game',after:'A banda está pronta. A partida tem três sequências; o modo tranquilo faz cada sinal esperar.'}
 ],
 garden:[
 {title:'Retire sementes',text:'O carrinho guarda sementes para os canteiros. Caminhe até ele ou toque na marca para seguir a rota.',instruction:'Chegue ao carrinho e use E para pegar sementes.',event:'seeds',focus:'game'},
 {title:'Plante num canteiro vazio',text:'Uma semente ocupa um canteiro. O botão de ação muda quando você se aproxima do lugar.',instruction:'Vá ao primeiro canteiro e plante com E.',event:'plant',focus:'game'},
 {title:'Encha o regador',text:'A fonte abastece o regador. Leve água até o canteiro para continuar o cuidado.',instruction:'Pegue água na fonte.',event:'water-pick',focus:'game'},
 {title:'Regue e veja a mudança',text:'Regue o canteiro plantado. O crescimento é acelerado neste jogo para você acompanhar o ciclo.',instruction:'Volte ao canteiro e use E para regar.',event:'water',focus:'game'},
 {title:'Colha e leve à botica',text:'Quando as folhas ficam prontas, a ação vira Colher. Depois siga ao balcão da botica para entregar.',instruction:'Colha e entregue na botica.',event:'harvest-delivery',focus:'game',after:'Semente, água, cuidado e entrega formam o ciclo da partida.'}
 ],
 bridges:[
 {title:'Uma peça pode girar',text:'A passarela tem trechos retos e curvas. Clicar numa peça gira suas saídas um quarto de volta.',instruction:'Gire a peça marcada.',event:'bridge-rotate',focus:'game'},
 {title:'Veja por onde a luz passa',text:'A luz parte da entrada e só avança por saídas que se encontram. Uma ponta solta interrompe o caminho.',instruction:'Complete a linha iluminada até a saída.',event:'bridge-connect',focus:'game'},
 {title:'Atravesse a passarela',text:'Quando a conexão está completa, a equipe pode atravessar. Não basta iluminar uma peça isolada.',instruction:'Use Atravessar para levar o personagem até o outro lado.',event:'bridge-cross',focus:'action',after:'A primeira ponte ficou pronta. As seguintes combinam linhas e curvas.'}
 ]}
};
})();
