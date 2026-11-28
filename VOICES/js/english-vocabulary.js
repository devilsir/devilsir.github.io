/* Registered module: english-vocabulary */
(function(initialize) {
  if (window.VoicesModules) window.VoicesModules.define("english-vocabulary", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error("Module loader is missing");
  else initialize();
})(function() {
  (function englishVocabulary() {
    "use strict";
    const V = window.V;
    const groups = {
      basics: ["Base do PIX", `
to be|ser; estar|To be kind is important.|Ser gentil \xE9 importante.
be|ser; estar|Be kind.|Seja gentil.
am|sou; estou (com I)|I am ready.|Estou pronto.
is|\xE9; est\xE1 (he, she, it)|She is here.|Ela est\xE1 aqui.
are|somos; estamos; s\xE3o; est\xE3o; voc\xEA \xE9/est\xE1|We are ready.|Estamos prontos.
was|era; estava; foi (I, he, she, it)|It was here.|Estava aqui.
were|\xE9ramos; est\xE1vamos; eram; estavam; foi/foram|They were here.|Eles estavam aqui.
do|fazer; auxiliar de perguntas e negativas|Do you have a book?|Voc\xEA tem um livro?
does|faz; auxiliar com he, she, it|Does she have a book?|Ela tem um livro?
did|fez; auxiliar de perguntas e negativas no passado|Did you find it?|Voc\xEA encontrou isso?
have|ter|I have a book.|Tenho um livro.
has|tem (he, she, it)|She has a book.|Ela tem um livro.
had|tinha; teve|We had a plan.|T\xEDnhamos um plano.
the|o; a; os; as|The book is here.|O livro est\xE1 aqui.
a|um; uma (antes de som de consoante)|I have a book.|Tenho um livro.
an|um; uma (antes de som de vogal)|It is an apple.|\xC9 uma ma\xE7\xE3.
with|com|Come with me.|Venha comigo.
in|em; dentro de|It is in the box.|Est\xE1 dentro da caixa.
on|em; sobre (com contato)|It is on the table.|Est\xE1 sobre a mesa.
at|em; \xE0s (lugar ou hor\xE1rio espec\xEDfico)|Meet me at school.|Encontre-me na escola.
to|para; a; marcador de infinitivo|Go to the park.|V\xE1 ao parque.
from|de; vindo de|I am from New Harmony.|Sou de New Harmony.
of|de (rela\xE7\xE3o ou pertencimento)|It is a map of the city.|\xC9 um mapa da cidade.
for|para; por|This is for you.|Isto \xE9 para voc\xEA.
and|e|You and I can help.|Voc\xEA e eu podemos ajudar.
or|ou|Tea or water?|Ch\xE1 ou \xE1gua?
but|mas|It is small but useful.|\xC9 pequeno, mas \xFAtil.
not|n\xE3o|It is not here.|N\xE3o est\xE1 aqui.
I|eu|I am here.|Estou aqui.
you|voc\xEA; voc\xEAs|You are welcome.|Voc\xEA \xE9 bem-vindo.
he|ele|He is here.|Ele est\xE1 aqui.
she|ela|She is here.|Ela est\xE1 aqui.
it|ele; ela; isso (coisa, ideia ou animal)|It is a book.|\xC9 um livro.
we|n\xF3s|We have a plan.|Temos um plano.
they|eles; elas; pessoa referida com they|They are here.|Eles est\xE3o aqui.
my|meu; minha; meus; minhas|This is my book.|Este \xE9 meu livro.
your|seu; sua; de voc\xEA ou voc\xEAs|Is this your book?|Este livro \xE9 seu?
his|dele|His book is here.|O livro dele est\xE1 aqui.
her|dela; ela (como objeto)|Her book is here.|O livro dela est\xE1 aqui.
our|nosso; nossa; nossos; nossas|This is our home.|Este \xE9 nosso lar.
their|deles; delas; de pessoa referida com they|Their home is here.|O lar deles fica aqui.
this|este; esta; isto|This is my home.|Este \xE9 meu lar.
that|aquele; aquela; isso|That is a school.|Aquilo \xE9 uma escola.
these|estes; estas|These are my books.|Estes s\xE3o meus livros.
those|aqueles; aquelas|Those are houses.|Aquelas s\xE3o casas.
what|o que; qual|What is this?|O que \xE9 isto?
who|quem|Who is here?|Quem est\xE1 aqui?
where|onde|Where is the museum?|Onde fica o museu?
when|quando|When is it open?|Quando est\xE1 aberto?
why|por que|Why is it closed?|Por que est\xE1 fechado?
how|como|How are you?|Como voc\xEA est\xE1?
yes|sim|Yes, I can.|Sim, eu posso.
no|n\xE3o; nenhum|No, it is not.|N\xE3o, n\xE3o \xE9.
can|poder; conseguir; saber fazer|We can help.|Podemos ajudar.
please|por favor|Come here, please.|Venha aqui, por favor.
thanks|obrigado; obrigada|Thanks for your help.|Obrigado pela sua ajuda.
I'm|eu sou; eu estou (I am)|I'm ready.|Estou pronto.
you're|voc\xEA \xE9/est\xE1; voc\xEAs s\xE3o/est\xE3o (you are)|You're here.|Voc\xEA est\xE1 aqui.
we're|n\xF3s somos; n\xF3s estamos (we are)|We're ready.|Estamos prontos.
they're|eles/elas s\xE3o ou est\xE3o (they are)|They're here.|Eles est\xE3o aqui.
it's|\xE9; est\xE1; isso \xE9/est\xE1 (it is, neste uso)|It's a book.|\xC9 um livro.
don't|n\xE3o (do not, com I/you/we/they)|I don't have a pen.|N\xE3o tenho uma caneta.
doesn't|n\xE3o (does not, com he/she/it)|She doesn't have a pen.|Ela n\xE3o tem uma caneta.
didn't|n\xE3o (did not, no passado)|I didn't find it.|N\xE3o encontrei isso.
he's|ele \xE9; ele est\xE1 (he is, neste uso)|He's ready.|Ele est\xE1 pronto.
she's|ela \xE9; ela est\xE1 (she is, neste uso)|She's here.|Ela est\xE1 aqui.
can't|n\xE3o poder; n\xE3o conseguir (cannot)|I can't find it.|N\xE3o consigo encontrar isso.
cannot|n\xE3o poder; n\xE3o conseguir|We cannot enter now.|N\xE3o podemos entrar agora.
there is|h\xE1; existe (singular ou incont\xE1vel)|There is a book here.|H\xE1 um livro aqui.
there are|h\xE1; existem (plural)|There are two books here.|H\xE1 dois livros aqui.
`],
      actions: ["A\xE7\xF5es", `
go|ir|Go to the garden.|V\xE1 \xE0 horta.
come|vir|Come with me.|Venha comigo.
walk|andar; caminhar|Walk to the park.|Caminhe at\xE9 o parque.
run|correr|Run along the path.|Corra pelo caminho.
jump|pular|Jump over the line.|Pule a linha.
look|olhar|Look at the painting.|Olhe o quadro.
see|ver|I can see the sea.|Consigo ver o mar.
hear|ouvir; perceber um som|I can hear music.|Consigo ouvir m\xFAsica.
speak|falar|Speak with your neighbour.|Fale com seu vizinho.
talk|conversar; falar|Talk to the teacher.|Converse com a professora.
ask|perguntar; pedir|Ask a question.|Fa\xE7a uma pergunta.
answer|responder; resposta|Answer the question.|Responda \xE0 pergunta.
find|encontrar|Find the missing page.|Encontre a p\xE1gina que est\xE1 faltando.
search|procurar; pesquisar|Search the archive.|Pesquise no arquivo.
help|ajudar; ajuda|Help your neighbour.|Ajude seu vizinho.
give|dar|Give the book to her.|D\xEA o livro a ela.
take|pegar; levar|Take a seat.|Sente-se.
bring|trazer|Bring your notebook.|Traga seu caderno.
make|fazer; criar|Make a new plan.|Crie um novo plano.
put|colocar|Put the cup on the table.|Coloque a x\xEDcara sobre a mesa.
use|usar|Use the map.|Use o mapa.
try|tentar|Try another path.|Tente outro caminho.
choose|escolher|Choose a book.|Escolha um livro.
need|precisar de|We need water.|Precisamos de \xE1gua.
want|querer|I want to learn.|Quero aprender.
like|gostar de; como|I like this song.|Gosto desta can\xE7\xE3o.
love|amar; adorar|I love reading.|Adoro ler.
know|saber; conhecer|I know this word.|Conhe\xE7o esta palavra.
learn|aprender|We learn together.|Aprendemos juntos.
teach|ensinar|They teach English.|Eles ensinam ingl\xEAs.
write|escrever|Write your name.|Escreva seu nome.
draw|desenhar|Draw a tree.|Desenhe uma \xE1rvore.
paint|pintar|Paint a picture.|Pinte um quadro.
eat|comer|Eat some fruit.|Coma algumas frutas.
drink|beber; bebida|Drink some water.|Beba um pouco de \xE1gua.
cook|cozinhar|Cook a meal.|Prepare uma refei\xE7\xE3o.
clean|limpar; limpo|Clean the table.|Limpe a mesa.
wash|lavar|Wash your hands.|Lave as m\xE3os.
wait|esperar|Wait at the entrance.|Espere na entrada.
work|trabalhar; trabalho|We work together.|Trabalhamos juntos.
play|brincar; jogar; tocar instrumento|Play the piano.|Toque piano.
build|construir|Build a safe home.|Construa um lar seguro.
fix|consertar|Fix the lamp.|Conserte a lumin\xE1ria.
move|mover; mudar de lugar|Move the chair.|Mova a cadeira.
turn|virar; vez|Turn left.|Vire \xE0 esquerda.
leave|sair; deixar|Leave the door open.|Deixe a porta aberta.
return|voltar; devolver|Return the book.|Devolva o livro.
`],
      directions: ["Posi\xE7\xE3o e caminhos", `
here|aqui|Come here.|Venha aqui.
there|ali; l\xE1|The museum is over there.|O museu fica ali.
near|perto de|The park is near the school.|O parque fica perto da escola.
far|longe|The beach is far from here.|A praia fica longe daqui.
behind|atr\xE1s de|The bag is behind the chair.|A bolsa est\xE1 atr\xE1s da cadeira.
in front of|na frente de|The bench is in front of the house.|O banco fica na frente da casa.
inside|dentro; do lado de dentro|The cat is inside.|O gato est\xE1 dentro.
outside|fora; do lado de fora|Wait outside.|Espere do lado de fora.
up|para cima|Look up.|Olhe para cima.
down|para baixo|Look down.|Olhe para baixo.
upstairs|no andar de cima; para o andar de cima|The bedroom is upstairs.|O quarto fica no andar de cima.
downstairs|no andar de baixo; para o andar de baixo|The kitchen is downstairs.|A cozinha fica no andar de baixo.
across from|em frente a; do outro lado de|The caf\xE9 is across from the library.|A cafeteria fica em frente \xE0 biblioteca.
go straight|seguir em frente|Go straight to the square.|Siga em frente at\xE9 a pra\xE7a.
turn left|virar \xE0 esquerda|Turn left at the corner.|Vire \xE0 esquerda na esquina.
turn right|virar \xE0 direita|Turn right after the school.|Vire \xE0 direita depois da escola.
through|atrav\xE9s de; por dentro de|Walk through the garden.|Caminhe pela horta.
around|ao redor de; por perto|Look around the room.|Olhe ao redor do c\xF4modo.
over|sobre; por cima de|The bridge is over the river.|A ponte fica sobre o rio.
below|abaixo de|The shelf is below the window.|A prateleira fica abaixo da janela.
`],
      home: ["Casa e objetos", `
room|c\xF4modo; quarto|This room has a window.|Este c\xF4modo tem uma janela.
bedroom|quarto de dormir|The bed is in the bedroom.|A cama est\xE1 no quarto.
bathroom|banheiro|The bathroom is upstairs.|O banheiro fica no andar de cima.
kitchen|cozinha|The fridge is in the kitchen.|A geladeira est\xE1 na cozinha.
living room|sala de estar|The sofa is in the living room.|O sof\xE1 est\xE1 na sala de estar.
balcony|varanda; sacada|There is a plant on the balcony.|H\xE1 uma planta na varanda.
stairs|escada; degraus|Use the stairs.|Use a escada.
ceiling|teto|The lamp is on the ceiling.|A lumin\xE1ria fica no teto.
furniture|mob\xEDlia; m\xF3veis (incont\xE1vel)|We need some furniture.|Precisamos de alguns m\xF3veis.
mirror|espelho|The mirror is above the sink.|O espelho fica acima da pia.
pillow|travesseiro; almofada|The pillow is on the bed.|O travesseiro est\xE1 na cama.
blanket|cobertor|The blanket is on the bed.|O cobertor est\xE1 na cama.
curtain|cortina|Open the curtain.|Abra a cortina.
cushion|almofada|The cushion is on the sofa.|A almofada est\xE1 no sof\xE1.
drawer|gaveta|The pencil is in the drawer.|O l\xE1pis est\xE1 na gaveta.
cupboard|arm\xE1rio|The plates are in the cupboard.|Os pratos est\xE3o no arm\xE1rio.
towel|toalha|The towel is next to the shower.|A toalha est\xE1 ao lado do chuveiro.
soap|sab\xE3o; sabonete|Wash your hands with soap.|Lave as m\xE3os com sabonete.
bottle|garrafa|The bottle has water.|A garrafa tem \xE1gua.
plate|prato|Put the plate on the table.|Coloque o prato sobre a mesa.
cup|x\xEDcara; copo|This cup is for you.|Esta x\xEDcara \xE9 para voc\xEA.
mug|caneca|The mug is on the desk.|A caneca est\xE1 na escrivaninha.
fork|garfo|The fork is next to the plate.|O garfo est\xE1 ao lado do prato.
spoon|colher|Use a spoon.|Use uma colher.
knife|faca|The knife is in the drawer.|A faca est\xE1 na gaveta.
bowl|tigela|The fruit is in the bowl.|A fruta est\xE1 na tigela.
key|chave|I have the key.|Estou com a chave.
box|caixa|The book is in the box.|O livro est\xE1 na caixa.
basket|cesta|The basket is full.|A cesta est\xE1 cheia.
clock|rel\xF3gio|Look at the clock.|Olhe o rel\xF3gio.
light|luz; leve|Turn on the light.|Acenda a luz.
fan|ventilador; f\xE3|The fan is in the room.|O ventilador est\xE1 no c\xF4modo.
computer|computador|The computer is on the desk.|O computador est\xE1 na escrivaninha.
phone|telefone; celular|The phone is on the table.|O telefone est\xE1 na mesa.
remote control|controle remoto|The remote control is next to the TV.|O controle remoto est\xE1 ao lado da TV.
`],
      food: ["Comida e compras", `
apple|ma\xE7\xE3|I have an apple.|Tenho uma ma\xE7\xE3.
banana|banana|There is a banana in the basket.|H\xE1 uma banana na cesta.
orange|laranja; cor laranja|This orange is sweet.|Esta laranja \xE9 doce.
bread|p\xE3o (geralmente incont\xE1vel)|I buy bread at the market.|Compro p\xE3o no mercado.
rice|arroz|The meal has rice.|A refei\xE7\xE3o tem arroz.
beans|feij\xE3o; feij\xF5es|We have rice and beans.|Temos arroz e feij\xE3o.
milk|leite|The milk is in the fridge.|O leite est\xE1 na geladeira.
juice|suco|I would like some juice.|Eu gostaria de um pouco de suco.
tea|ch\xE1|The tea is hot.|O ch\xE1 est\xE1 quente.
coffee|caf\xE9 (bebida)|The coffee is ready.|O caf\xE9 est\xE1 pronto.
egg|ovo|There is an egg in the bowl.|H\xE1 um ovo na tigela.
cheese|queijo|The sandwich has cheese.|O sandu\xEDche tem queijo.
fruit|fruta; frutas|Eat some fruit.|Coma algumas frutas.
vegetable|verdura; legume|A carrot is a vegetable.|A cenoura \xE9 um legume.
tomato|tomate|The tomato is red.|O tomate \xE9 vermelho.
carrot|cenoura|The carrot is in the basket.|A cenoura est\xE1 na cesta.
potato|batata|We need a potato.|Precisamos de uma batata.
sandwich|sandu\xEDche|This sandwich is for you.|Este sandu\xEDche \xE9 para voc\xEA.
meal|refei\xE7\xE3o|The meal is ready.|A refei\xE7\xE3o est\xE1 pronta.
breakfast|caf\xE9 da manh\xE3|Breakfast is at eight.|O caf\xE9 da manh\xE3 \xE9 \xE0s oito.
lunch|almo\xE7o|Lunch is ready.|O almo\xE7o est\xE1 pronto.
dinner|jantar|We have dinner at home.|Jantamos em casa.
hungry|com fome|I am hungry.|Estou com fome.
thirsty|com sede|I am thirsty.|Estou com sede.
price|pre\xE7o|What is the price?|Qual \xE9 o pre\xE7o?
money|dinheiro|I have some money.|Tenho algum dinheiro.
sell|vender|They sell fruit.|Eles vendem frutas.
pay|pagar|Pay at the counter.|Pague no balc\xE3o.
change|troco; mudan\xE7a; mudar|Here is your change.|Aqui est\xE1 seu troco.
cheap|barato|This cup is cheap.|Esta x\xEDcara \xE9 barata.
expensive|caro|This chair is expensive.|Esta cadeira \xE9 cara.
`],
      nature: ["Natureza e clima", `
tree|\xE1rvore|The tree is near the house.|A \xE1rvore fica perto da casa.
leaf|folha de planta|The leaf is green.|A folha \xE9 verde.
grass|grama|The grass is wet.|A grama est\xE1 molhada.
flower|flor|The flower is in the garden.|A flor est\xE1 no jardim.
seed|semente|Plant a seed.|Plante uma semente.
soil|solo; terra|The soil is wet.|O solo est\xE1 \xFAmido.
root|raiz|The root is under the soil.|A raiz fica debaixo da terra.
grow|crescer; cultivar|Plants grow in the garden.|As plantas crescem na horta.
rain|chuva; chover|The rain helps the plants.|A chuva ajuda as plantas.
snow|neve; nevar|The snow is cold.|A neve \xE9 fria.
storm|tempestade|Stay inside during the storm.|Fique dentro de casa durante a tempestade.
cloud|nuvem|There is a cloud in the sky.|H\xE1 uma nuvem no c\xE9u.
sky|c\xE9u|Look at the sky.|Olhe o c\xE9u.
sun|sol|The sun is bright.|O sol est\xE1 brilhante.
moon|lua|The moon is in the sky.|A lua est\xE1 no c\xE9u.
star|estrela|I can see a star.|Consigo ver uma estrela.
wind|vento|The wind moves the leaves.|O vento move as folhas.
weather|tempo; condi\xE7\xF5es do tempo|What is the weather like?|Como est\xE1 o tempo?
river|rio|The river is near the park.|O rio fica perto do parque.
bridge|ponte|Walk across the bridge.|Atravesse a ponte.
pond|lagoa; pequeno lago|The pond has fish.|A lagoa tem peixes.
bird|p\xE1ssaro; ave|The bird is in the tree.|O p\xE1ssaro est\xE1 na \xE1rvore.
animal|animal|This animal lives in the park.|Este animal vive no parque.
sand|areia|The sand is warm.|A areia est\xE1 quente.
sea|mar|I can hear the sea.|Consigo ouvir o mar.
wave|onda|Look at the wave.|Olhe a onda.
shell|concha|I found a shell.|Encontrei uma concha.
island|ilha|The island is far away.|A ilha fica longe.
stone|pedra|The stone is under the tree.|A pedra est\xE1 debaixo da \xE1rvore.
shade|sombra; local protegido do sol|Sit in the shade.|Sente-se \xE0 sombra.
`],
      school: ["Escola e leitura", `
teacher|professor; professora|The teacher is here.|A professora est\xE1 aqui.
student|estudante|The student has a notebook.|O estudante tem um caderno.
class|aula; turma|Our class starts at eight.|Nossa aula come\xE7a \xE0s oito.
classroom|sala de aula|The classroom has windows.|A sala de aula tem janelas.
lesson|aula; li\xE7\xE3o|This lesson is about words.|Esta aula \xE9 sobre palavras.
board|quadro; lousa|Look at the board.|Olhe o quadro.
pencil|l\xE1pis|I have a pencil.|Tenho um l\xE1pis.
pen|caneta|The pen is on the desk.|A caneta est\xE1 na escrivaninha.
paper|papel|Write on the paper.|Escreva no papel.
eraser|borracha|I need an eraser.|Preciso de uma borracha.
ruler|r\xE9gua|Use a ruler.|Use uma r\xE9gua.
backpack|mochila|The book is in my backpack.|O livro est\xE1 na minha mochila.
notebook|caderno|Open your notebook.|Abra seu caderno.
page|p\xE1gina|Read the next page.|Leia a pr\xF3xima p\xE1gina.
title|t\xEDtulo|What is the title?|Qual \xE9 o t\xEDtulo?
chapter|cap\xEDtulo|This chapter is about music.|Este cap\xEDtulo \xE9 sobre m\xFAsica.
story|hist\xF3ria; narrativa|Tell your story.|Conte sua hist\xF3ria.
word|palavra|I know this word.|Conhe\xE7o esta palavra.
sentence|frase; senten\xE7a|Read the sentence.|Leia a frase.
meaning|significado|What is the meaning?|Qual \xE9 o significado?
dictionary|dicion\xE1rio|Use the dictionary.|Use o dicion\xE1rio.
question|pergunta|Ask a question.|Fa\xE7a uma pergunta.
language|l\xEDngua; linguagem|English is a language.|O ingl\xEAs \xE9 uma l\xEDngua.
English|ingl\xEAs|We are learning English.|Estamos aprendendo ingl\xEAs.
name|nome|Write your name.|Escreva seu nome.
number|n\xFAmero|Choose a number.|Escolha um n\xFAmero.
homework|tarefa de casa (incont\xE1vel)|My homework is in the notebook.|Minha tarefa de casa est\xE1 no caderno.
`],
      culture: ["Hist\xF3ria e cultura", `
art|arte|Art tells stories.|A arte conta hist\xF3rias.
artist|artista|The artist made this painting.|A artista fez este quadro.
painting|pintura; quadro|Look at the painting.|Olhe o quadro.
portrait|retrato|The portrait is in the museum.|O retrato est\xE1 no museu.
photograph|fotografia|The photograph has a date.|A fotografia tem uma data.
sculpture|escultura|The sculpture is in the gallery.|A escultura est\xE1 na galeria.
gallery|galeria|The gallery is open.|A galeria est\xE1 aberta.
frame|moldura; quadro de uma anima\xE7\xE3o|The frame is around the painting.|A moldura fica ao redor do quadro.
exhibition|exposi\xE7\xE3o|The exhibition is at the museum.|A exposi\xE7\xE3o est\xE1 no museu.
poem|poema|Read the poem.|Leia o poema.
poetry|poesia|Poetry has many voices.|A poesia tem muitas vozes.
document|documento|Read the document.|Leia o documento.
archive|arquivo; acervo|Search the archive.|Pesquise no arquivo.
past|passado|We learn about the past.|Aprendemos sobre o passado.
present|presente; atual|The past helps us understand the present.|O passado nos ajuda a entender o presente.
future|futuro|We can plan for the future.|Podemos planejar o futuro.
century|s\xE9culo|A century has one hundred years.|Um s\xE9culo tem cem anos.
generation|gera\xE7\xE3o|Each generation has stories.|Cada gera\xE7\xE3o tem hist\xF3rias.
tradition|tradi\xE7\xE3o|Learn about this tradition.|Aprenda sobre esta tradi\xE7\xE3o.
freedom|liberdade|Freedom is important.|A liberdade \xE9 importante.
equality|igualdade|We work for equality.|Trabalhamos pela igualdade.
respect|respeito; respeitar|Respect different voices.|Respeite vozes diferentes.
identity|identidade|Each person has an identity.|Cada pessoa tem uma identidade.
authorship|autoria|Check the authorship of the text.|Confira a autoria do texto.
testimony|testemunho; depoimento|Listen to the testimony.|Ou\xE7a o depoimento.
uncertainty|incerteza|We should explain our uncertainty.|Devemos explicar nossa incerteza.
preserve|preservar|Preserve the document.|Preserve o documento.
protect|proteger|Protect the archive.|Proteja o arquivo.
remember|lembrar|Remember the names.|Lembre-se dos nomes.
forget|esquecer|Do not forget the source.|N\xE3o se esque\xE7a da fonte.
`],
      science: ["Ci\xEAncia e investiga\xE7\xE3o", `
science|ci\xEAncia|Science uses evidence.|A ci\xEAncia usa evid\xEAncias.
scientist|cientista|The scientist asks questions.|A cientista faz perguntas.
laboratory|laborat\xF3rio|The laboratory is open.|O laborat\xF3rio est\xE1 aberto.
experiment|experimento; experimentar|Observe the experiment.|Observe o experimento.
observe|observar|Observe the plant.|Observe a planta.
compare|comparar|Compare the two records.|Compare os dois registros.
measure|medir|Measure the distance.|Me\xE7a a dist\xE2ncia.
test|testar; teste|Test your idea.|Teste sua ideia.
discover|descobrir|Discover a new word.|Descubra uma palavra nova.
energy|energia|The machine needs energy.|A m\xE1quina precisa de energia.
machine|m\xE1quina|The machine is ready.|A m\xE1quina est\xE1 pronta.
tool|ferramenta|Choose the right tool.|Escolha a ferramenta certa.
sample|amostra|The sample is in the laboratory.|A amostra est\xE1 no laborat\xF3rio.
result|resultado|Compare the results.|Compare os resultados.
fact|fato|Check this fact.|Confira este fato.
opinion|opini\xE3o|This is my opinion.|Esta \xE9 minha opini\xE3o.
information|informa\xE7\xE3o; informa\xE7\xF5es (incont\xE1vel)|Check the information.|Confira as informa\xE7\xF5es.
knowledge|conhecimento|We share knowledge.|Compartilhamos conhecimento.
check|conferir; verificar|Check the source.|Confira a fonte.
verify|verificar|Verify the date.|Verifique a data.
`],
      music: ["M\xFAsica e express\xE3o", `
music|m\xFAsica|I like this music.|Gosto desta m\xFAsica.
song|can\xE7\xE3o; m\xFAsica|Sing a song.|Cante uma can\xE7\xE3o.
sound|som|Listen to the sound.|Ou\xE7a o som.
beat|batida; pulsa\xE7\xE3o musical|Follow the beat.|Siga a batida.
melody|melodia|Play the melody.|Toque a melodia.
stage|palco|The musicians are on the stage.|Os m\xFAsicos est\xE3o no palco.
instrument|instrumento|Choose an instrument.|Escolha um instrumento.
band|banda|The band is ready.|A banda est\xE1 pronta.
singer|cantor; cantora|The singer is on the stage.|A cantora est\xE1 no palco.
musician|m\xFAsico; musicista|Talk to the musician.|Converse com a musicista.
perform|apresentar; executar|We perform together.|N\xF3s nos apresentamos juntos.
concert|concerto; show|The concert starts at night.|O show come\xE7a \xE0 noite.
rehearsal|ensaio|The rehearsal is at school.|O ensaio \xE9 na escola.
loud|alto; forte (som)|The music is loud.|A m\xFAsica est\xE1 alta.
quiet|silencioso; tranquilo|The library is quiet.|A biblioteca \xE9 silenciosa.
`],
      city: ["Cidade e pessoas", `
city|cidade|We live in this city.|Vivemos nesta cidade.
square|pra\xE7a; quadrado|Meet me in the square.|Encontre-me na pra\xE7a.
building|pr\xE9dio; constru\xE7\xE3o|This building has three floors.|Este pr\xE9dio tem tr\xEAs andares.
apartment|apartamento|The apartment is upstairs.|O apartamento fica no andar de cima.
shop|loja|The shop is open.|A loja est\xE1 aberta.
caf\xE9|cafeteria; caf\xE9 (estabelecimento)|Meet me at the caf\xE9.|Encontre-me na cafeteria.
entrance|entrada|Wait at the entrance.|Espere na entrada.
exit|sa\xEDda|The exit is on the left.|A sa\xEDda fica \xE0 esquerda.
corner|esquina; canto|Turn at the corner.|Vire na esquina.
sign|placa; sinal|Read the sign.|Leia a placa.
crossing|travessia; cruzamento|Use the crossing.|Use a faixa de pedestres.
queue|fila|Wait in the queue.|Espere na fila.
job|emprego; trabalho|Her job is at the library.|O trabalho dela \xE9 na biblioteca.
friend|amigo; amiga|My friend is here.|Meu amigo est\xE1 aqui.
family|fam\xEDlia|Our family lives here.|Nossa fam\xEDlia mora aqui.
child|crian\xE7a|The child has a book.|A crian\xE7a tem um livro.
children|crian\xE7as|The children are at school.|As crian\xE7as est\xE3o na escola.
people|pessoas|People have different stories.|As pessoas t\xEAm hist\xF3rias diferentes.
together|juntos; juntas|We learn together.|Aprendemos juntos.
welcome|bem-vindo; bem-vinda|Welcome to New Harmony.|Boas-vindas a New Harmony.
hello|ol\xE1|Hello, my friend.|Ol\xE1, meu amigo.
goodbye|tchau; adeus|Goodbye, see you later.|Tchau, at\xE9 mais.
safe|seguro|This path is safe.|Este caminho \xE9 seguro.
equal|igual|We have equal rights.|Temos direitos iguais.
different|diferente|People have different ideas.|As pessoas t\xEAm ideias diferentes.
fair|justo; feira|This plan is fair.|Este plano \xE9 justo.
support|apoiar; apoio|Support your community.|Apoie sua comunidade.
vote|votar; voto|Vote for a plan.|Vote em um plano.
plan|plano; planejar|We have a plan.|Temos um plano.
`],
      time: ["Tempo e descri\xE7\xF5es", `
today|hoje|The museum is open today.|O museu est\xE1 aberto hoje.
tomorrow|amanh\xE3|Come back tomorrow.|Volte amanh\xE3.
yesterday|ontem|The shop was open yesterday.|A loja estava aberta ontem.
afternoon|tarde|See you in the afternoon.|At\xE9 de tarde.
evening|fim da tarde; in\xEDcio da noite|We read in the evening.|Lemos no in\xEDcio da noite.
day|dia|Have a good day.|Tenha um bom dia.
week|semana|This week has seven days.|Esta semana tem sete dias.
month|m\xEAs|The exhibition opens this month.|A exposi\xE7\xE3o abre neste m\xEAs.
year|ano|Check the year.|Confira o ano.
time|tempo; hora|What time is it?|Que horas s\xE3o?
hour|hora|The lesson lasts an hour.|A aula dura uma hora.
minute|minuto|Wait one minute.|Espere um minuto.
early|cedo|We arrived early.|Chegamos cedo.
late|tarde; atrasado|It is late.|\xC9 tarde.
always|sempre|Always check the source.|Sempre confira a fonte.
sometimes|\xE0s vezes|I sometimes sing.|\xC0s vezes eu canto.
never|nunca|Never erase the names.|Nunca apague os nomes.
again|de novo; novamente|Try again.|Tente de novo.
now|agora|The shop is open now.|A loja est\xE1 aberta agora.
soon|em breve; logo|See you soon.|At\xE9 breve.
big|grande|This house is big.|Esta casa \xE9 grande.
small|pequeno|This room is small.|Este c\xF4modo \xE9 pequeno.
new|novo|I found a new word.|Encontrei uma palavra nova.
old|velho; antigo|This is an old document.|Este \xE9 um documento antigo.
hot|quente|The tea is hot.|O ch\xE1 est\xE1 quente.
cold|frio|The water is cold.|A \xE1gua est\xE1 fria.
happy|feliz|I am happy.|Estou feliz.
tired|cansado; cansada|I am tired.|Estou cansado.
ready|pronto; pronta|We are ready.|Estamos prontos.
empty|vazio|The box is empty.|A caixa est\xE1 vazia.
full|cheio|The basket is full.|A cesta est\xE1 cheia.
`],
      adventure: ["Miss\xF5es e explora\xE7\xE3o", `
map|mapa|Open the map.|Abra o mapa.
path|caminho|Follow the path.|Siga o caminho.
follow|seguir|Follow your guide.|Siga seu guia.
guide|guia; guiar|The guide shows the path.|O guia mostra o caminho.
travel|viajar; viagem|Travel to the museum.|Viaje at\xE9 o museu.
quest|miss\xE3o; busca|Complete the quest.|Conclua a miss\xE3o.
task|tarefa|This task needs a book.|Esta tarefa precisa de um livro.
goal|objetivo; meta|Our goal is to help.|Nosso objetivo \xE9 ajudar.
reward|recompensa|This is your reward.|Esta \xE9 sua recompensa.
complete|completar; completo|Complete the task.|Conclua a tarefa.
save|salvar; guardar|Save the record.|Guarde o registro.
collect|coletar; colecionar|Collect the missing words.|Colete as palavras que est\xE3o faltando.
missing|faltando; desaparecido|Find the missing names.|Encontre os nomes que est\xE3o faltando.
clue|pista|Look for a clue.|Procure uma pista.
recover|recuperar|Recover the document.|Recupere o documento.
unlock|desbloquear|Unlock the next chapter.|Desbloqueie o pr\xF3ximo cap\xEDtulo.
team|equipe|Work with your team.|Trabalhe com sua equipe.
inventory|invent\xE1rio|Open your inventory.|Abra seu invent\xE1rio.
health|sa\xFAde; vida no jogo|Food helps your health.|A alimenta\xE7\xE3o contribui para sua sa\xFAde.
rest|descansar; descanso|Rest at home.|Descanse em casa.
`]
    };
    const entries = [];
    for (const [category, [label, text]] of Object.entries(groups)) for (const line of text.trim().split("\n")) {
      const [en, pt, example, examplePt] = line.split("|");
      entries.push({ en, pt, example, examplePt, category, categoryLabel: label, starter: category === "basics" });
    }
    const additionalExamples = [
      [
        "desk",
        "escrivaninha",
        "The notebook is on Davi's desk.",
        "O caderno est\xE1 na escrivaninha de Davi.",
        "home"
      ],
      [
        "bookshelf",
        "estante de livros",
        "Return the book to the bookshelf.",
        "Devolva o livro \xE0 estante.",
        "home"
      ],
      [
        "dresser",
        "c\xF4moda",
        "My clothes are in the dresser.",
        "Minhas roupas est\xE3o na c\xF4moda.",
        "home"
      ],
      [
        "shelf",
        "prateleira",
        "The archive boxes are on this shelf.",
        "As caixas do arquivo est\xE3o nesta prateleira.",
        "home"
      ],
      [
        "lamp",
        "lumin\xE1ria",
        "Turn on the lamp to read the letter.",
        "Acenda a lumin\xE1ria para ler a carta.",
        "home"
      ],
      [
        "washing machine",
        "m\xE1quina de lavar",
        "The washing machine is in the laundry room.",
        "A m\xE1quina de lavar est\xE1 na lavanderia.",
        "home"
      ],
      [
        "bathtub",
        "banheira",
        "The bathtub is next to the sink.",
        "A banheira fica ao lado da pia.",
        "home"
      ],
      [
        "toilet",
        "vaso sanit\xE1rio",
        "The toilet is in the bathroom.",
        "O vaso sanit\xE1rio fica no banheiro.",
        "home"
      ],
      [
        "rug",
        "tapete",
        "Put the rug in front of the sofa.",
        "Coloque o tapete na frente do sof\xE1.",
        "home"
      ],
      [
        "television",
        "televis\xE3o",
        "The television is in the living room.",
        "A televis\xE3o est\xE1 na sala de estar.",
        "home"
      ],
      [
        "memory",
        "mem\xF3ria",
        "Celina shared a memory of the square.",
        "Celina compartilhou uma mem\xF3ria da pra\xE7a.",
        "culture"
      ],
      [
        "home",
        "lar; casa",
        "I will go home after the rehearsal.",
        "Vou para casa depois do ensaio.",
        "home"
      ],
      [
        "house",
        "casa",
        "Visit your neighbour's house.",
        "Visite a casa do seu vizinho.",
        "home"
      ],
      [
        "bed",
        "cama",
        "Rest in your bed until morning.",
        "Descanse na sua cama at\xE9 de manh\xE3.",
        "home"
      ],
      [
        "sofa",
        "sof\xE1",
        "The sofa is beside the bookshelf.",
        "O sof\xE1 fica ao lado da estante de livros.",
        "home"
      ],
      [
        "chair",
        "cadeira",
        "Move the chair away from the doorway.",
        "Afaste a cadeira da passagem da porta.",
        "home"
      ],
      [
        "table",
        "mesa",
        "We compare the records at this table.",
        "Comparamos os registros nesta mesa.",
        "home"
      ],
      [
        "fridge",
        "geladeira",
        "Keep the milk in the fridge.",
        "Guarde o leite na geladeira.",
        "home"
      ],
      [
        "stove",
        "fog\xE3o",
        "Rosa is cooking beans on the stove.",
        "Rosa est\xE1 cozinhando feij\xE3o no fog\xE3o.",
        "home"
      ],
      [
        "shower",
        "chuveiro",
        "The shower is next to the bathtub.",
        "O chuveiro fica ao lado da banheira.",
        "home"
      ],
      [
        "sink",
        "pia",
        "Wash the cup in the sink.",
        "Lave a x\xEDcara na pia.",
        "home"
      ],
      [
        "wardrobe",
        "guarda-roupa",
        "Choose your clothes from the wardrobe.",
        "Escolha suas roupas no guarda-roupa.",
        "home"
      ],
      [
        "pantry",
        "despensa",
        "The pantry has rice and beans.",
        "A despensa tem arroz e feij\xE3o.",
        "home"
      ],
      [
        "plant",
        "planta; plantar",
        "Aisha waters this plant every morning.",
        "Aisha rega esta planta todas as manh\xE3s.",
        "nature"
      ],
      [
        "window",
        "janela",
        "The museum window faces the square.",
        "A janela do museu fica de frente para a pra\xE7a.",
        "home"
      ],
      [
        "door",
        "porta",
        "The library door is open.",
        "A porta da biblioteca est\xE1 aberta.",
        "home"
      ],
      [
        "roof",
        "telhado",
        "Rain is falling on the roof.",
        "A chuva est\xE1 caindo sobre o telhado.",
        "home"
      ],
      [
        "wall",
        "parede",
        "Mara hung the portraits on the wall.",
        "Mara pendurou os retratos na parede.",
        "home"
      ],
      [
        "floor",
        "piso; andar",
        "The reading room is on the second floor.",
        "A sala de leitura fica no segundo andar.",
        "home"
      ],
      [
        "water",
        "\xE1gua; regar",
        "Take some water before exploring the city.",
        "Pegue um pouco de \xE1gua antes de explorar a cidade.",
        "food"
      ],
      [
        "food",
        "comida; alimento",
        "We bought food at Rosa's stall.",
        "Compramos comida na banca de Rosa.",
        "food"
      ],
      [
        "book",
        "livro",
        "This book tells Carolina's story.",
        "Este livro conta a hist\xF3ria de Carolina.",
        "school"
      ],
      [
        "read",
        "ler",
        "Read the caption before choosing an answer.",
        "Leia a legenda antes de escolher uma resposta.",
        "school"
      ],
      [
        "sleep",
        "dormir",
        "I sleep at home and explore during the day.",
        "Durmo em casa e exploro durante o dia.",
        "actions"
      ],
      [
        "think",
        "pensar",
        "Think about who is missing from this record.",
        "Pense em quem est\xE1 faltando neste registro.",
        "actions"
      ],
      [
        "swim",
        "nadar",
        "We can swim near the beach.",
        "Podemos nadar perto da praia.",
        "actions"
      ],
      [
        "sit",
        "sentar",
        "Sit beside Celina and listen to her story.",
        "Sente-se ao lado de Celina e ou\xE7a sua hist\xF3ria.",
        "actions"
      ],
      [
        "sing",
        "cantar",
        "Mila will sing at the school concert.",
        "Mila vai cantar no show da escola.",
        "music"
      ],
      [
        "fish",
        "peixe; pescar",
        "Jorge watches the fish near the pier.",
        "Jorge observa os peixes perto do p\xEDer.",
        "nature"
      ],
      [
        "dance",
        "dan\xE7ar; dan\xE7a",
        "The group will dance after the rehearsal.",
        "O grupo vai dan\xE7ar depois do ensaio.",
        "music"
      ],
      [
        "buy",
        "comprar",
        "Buy a notebook at the market.",
        "Compre um caderno no mercado.",
        "food"
      ],
      [
        "coins",
        "moedas",
        "Save your coins to buy furniture.",
        "Guarde suas moedas para comprar m\xF3veis.",
        "food"
      ],
      [
        "morning",
        "manh\xE3",
        "The library opens in the morning.",
        "A biblioteca abre de manh\xE3.",
        "time"
      ],
      [
        "night",
        "noite",
        "Meet Zambeto in the courtyard at night.",
        "Encontre Zambeto no p\xE1tio \xE0 noite.",
        "time"
      ],
      [
        "open",
        "aberto; abrir",
        "Open the archive and compare both versions.",
        "Abra o arquivo e compare as duas vers\xF5es.",
        "city"
      ],
      [
        "closed",
        "fechado",
        "The shop is closed until morning.",
        "A loja est\xE1 fechada at\xE9 de manh\xE3.",
        "city"
      ],
      [
        "street",
        "rua",
        "Follow this street to the museum.",
        "Siga esta rua at\xE9 o museu.",
        "city"
      ],
      [
        "neighbour",
        "vizinho; vizinha",
        "Ask your neighbour about the community meeting.",
        "Pergunte ao seu vizinho sobre a reuni\xE3o da comunidade.",
        "city"
      ],
      [
        "library",
        "biblioteca",
        "Davi keeps the records in the library.",
        "Davi guarda os registros na biblioteca.",
        "school"
      ],
      [
        "school",
        "escola",
        "Joana teaches English at the school.",
        "Joana ensina ingl\xEAs na escola.",
        "school"
      ],
      [
        "museum",
        "museu",
        "The museum has four galleries to explore.",
        "O museu tem quatro galerias para explorar.",
        "culture"
      ],
      [
        "market",
        "mercado; feira",
        "Rosa sells fruit at the market.",
        "Rosa vende frutas na feira.",
        "food"
      ],
      [
        "garden",
        "jardim; horta",
        "Help Aisha water the community garden.",
        "Ajude Aisha a regar a horta comunit\xE1ria.",
        "nature"
      ],
      [
        "beach",
        "praia",
        "Lara collects observations at the beach.",
        "Lara re\xFAne observa\xE7\xF5es na praia.",
        "nature"
      ],
      [
        "next to",
        "ao lado de",
        "The school is next to the park.",
        "A escola fica ao lado do parque.",
        "directions"
      ],
      [
        "between",
        "entre",
        "The chair is between the table and the bookshelf.",
        "A cadeira fica entre a mesa e a estante de livros.",
        "directions"
      ],
      [
        "under",
        "embaixo de",
        "The bag is under the chair.",
        "A bolsa est\xE1 embaixo da cadeira.",
        "directions"
      ],
      [
        "above",
        "acima de",
        "The lamp is above the desk.",
        "A lumin\xE1ria fica acima da escrivaninha.",
        "directions"
      ],
      [
        "left",
        "esquerda; esquerdo",
        "Turn left to reach the library.",
        "Vire \xE0 esquerda para chegar \xE0 biblioteca.",
        "directions"
      ],
      [
        "right",
        "direita; direito; certo",
        "The museum entrance is on your right.",
        "A entrada do museu fica \xE0 sua direita.",
        "directions"
      ],
      [
        "first",
        "primeiro",
        "Read the original document first.",
        "Leia o documento original primeiro.",
        "time"
      ],
      [
        "then",
        "depois; ent\xE3o",
        "Check the date, then compare the versions.",
        "Confira a data e depois compare as vers\xF5es.",
        "time"
      ],
      [
        "deliver",
        "entregar",
        "Deliver Bia's parcel to the library.",
        "Entregue a encomenda de Bia na biblioteca.",
        "adventure"
      ],
      [
        "letter",
        "carta",
        "The letter has a name and an address.",
        "A carta tem um nome e um endere\xE7o.",
        "adventure"
      ],
      [
        "parcel",
        "encomenda",
        "Keep the parcel closed during the delivery.",
        "Mantenha a encomenda fechada durante a entrega.",
        "adventure"
      ],
      [
        "guitar",
        "viol\xE3o; guitarra",
        "Mila plays the guitar during rehearsal.",
        "Mila toca guitarra durante o ensaio.",
        "music"
      ],
      [
        "bass",
        "contrabaixo",
        "The bass keeps a steady pulse in our song.",
        "O contrabaixo mant\xE9m uma pulsa\xE7\xE3o constante na nossa can\xE7\xE3o.",
        "music"
      ],
      [
        "piano",
        "piano",
        "The piano is ready for the school concert.",
        "O piano est\xE1 pronto para o show da escola.",
        "music"
      ],
      [
        "keyboard",
        "teclado musical; teclado de computador",
        "Sol uses the keyboard to try a new melody.",
        "Sol usa o teclado para experimentar uma nova melodia.",
        "music"
      ],
      [
        "drums",
        "bateria; tambores",
        "The drums set the pace for our rehearsal.",
        "A bateria marca o andamento do nosso ensaio.",
        "music"
      ],
      [
        "saxophone",
        "saxofone",
        "Listen to the saxophone at the end of the song.",
        "Ou\xE7a o saxofone no final da can\xE7\xE3o.",
        "music"
      ],
      [
        "trumpet",
        "trompete",
        "The trumpet player waits for the next phrase.",
        "A pessoa que toca trompete espera a pr\xF3xima frase.",
        "music"
      ],
      [
        "berimbau",
        "berimbau",
        "Read the berimbau's label in the instrument gallery.",
        "Leia a legenda do berimbau na galeria de instrumentos.",
        "music"
      ],
      [
        "atabaque",
        "atabaque",
        "The atabaque's card explains how its sound is produced.",
        "A ficha do atabaque explica como seu som \xE9 produzido.",
        "music"
      ],
      [
        "agog\xF4",
        "agog\xF4",
        "Compare the agog\xF4's bells in the gallery.",
        "Compare as camp\xE2nulas do agog\xF4 na galeria.",
        "music"
      ],
      [
        "shekere",
        "xequer\xEA",
        "The shekere has beads around a gourd.",
        "O xequer\xEA tem contas ao redor de uma caba\xE7a.",
        "music"
      ],
      [
        "djembe",
        "djemb\xEA",
        "Read the djembe's description before comparing the drums.",
        "Leia a descri\xE7\xE3o do djemb\xEA antes de comparar os tambores.",
        "music"
      ],
      [
        "ilu",
        "il\xFA",
        "The ilu's card is beside the other drum descriptions.",
        "A ficha do il\xFA fica ao lado das descri\xE7\xF5es dos outros tambores.",
        "music"
      ],
      [
        "reco-reco",
        "reco-reco",
        "Compare the reco-reco with the other instruments.",
        "Compare o reco-reco com os outros instrumentos.",
        "music"
      ],
      [
        "cuica",
        "cu\xEDca",
        "The cuica's description is in the instrument notebook.",
        "A descri\xE7\xE3o da cu\xEDca est\xE1 no caderno de instrumentos.",
        "music"
      ],
      [
        "date",
        "data",
        "Check the date on the original poster.",
        "Confira a data no cartaz original.",
        "culture"
      ],
      [
        "author",
        "autor; autora",
        "The author signed the notebook.",
        "A autora assinou o caderno.",
        "culture"
      ],
      [
        "record",
        "registro; registrar",
        "Keep the original record beside the corrected version.",
        "Guarde o registro original ao lado da vers\xE3o corrigida.",
        "culture"
      ],
      [
        "order",
        "ordem; ordenar; pedido",
        "Put the four records in chronological order.",
        "Coloque os quatro registros em ordem cronol\xF3gica.",
        "adventure"
      ],
      [
        "restore",
        "restaurar",
        "Restore the portrait and return its name to the label.",
        "Restaure o retrato e devolva seu nome \xE0 legenda.",
        "adventure"
      ],
      [
        "voice",
        "voz",
        "Each voice adds a perspective to the archive.",
        "Cada voz acrescenta uma perspectiva ao arquivo.",
        "culture"
      ],
      [
        "creator",
        "criador; criadora",
        "The programme identifies each creator and their role.",
        "O programa identifica cada criador e sua fun\xE7\xE3o.",
        "culture"
      ]
    ];
    for (const [en, pt, example, examplePt, category] of additionalExamples) entries.push({ en, pt, example, examplePt, category, categoryLabel: groups[category][0], starter: false });
    for (const [en, pt, example, examplePt, category] of [["keep", "guardar; manter", "Keep both versions of the museum caption.", "Guarde as duas vers\xF5es da legenda do museu.", "adventure"], ["both", "ambos; os dois; as duas", "Compare both versions before answering.", "Compare as duas vers\xF5es antes de responder.", "adventure"], ["version", "vers\xE3o", "The earlier version still has the author\u2019s name.", "A vers\xE3o anterior ainda tem o nome da autora.", "adventure"], ["understand", "entender; compreender", "We need to understand what changed in the archive.", "Precisamos entender o que mudou no arquivo.", "science"], ["caption", "legenda", "The caption identifies the portrait and its author.", "A legenda identifica o retrato e sua autora.", "culture"], ["permission", "permiss\xE3o", "Ask permission before recording the interview.", "Pe\xE7a permiss\xE3o antes de gravar a entrevista.", "culture"], ["consent", "consentimento", "The archive keeps the recording with the person\u2019s consent.", "O arquivo guarda a grava\xE7\xE3o com o consentimento da pessoa.", "culture"], ["correction", "corre\xE7\xE3o", "Ravi published a correction beside the original notice.", "Ravi publicou uma corre\xE7\xE3o ao lado do aviso original.", "culture"], ["interview", "entrevista; entrevistar", "Joana prepared questions for the interview.", "Joana preparou perguntas para a entrevista.", "culture"], ["contribution", "contribui\xE7\xE3o", "Each contribution has a name and a role.", "Cada contribui\xE7\xE3o tem um nome e uma fun\xE7\xE3o.", "culture"], ["pattern", "padr\xE3o; sequ\xEAncia", "Compare the pattern before weaving the next row.", "Compare o padr\xE3o antes de tecer a pr\xF3xima fileira.", "culture"], ["weave", "tecer", "We can weave a new pattern in the workshop.", "Podemos tecer um padr\xE3o novo na oficina.", "culture"], ["print", "imprimir", "Print the newspaper after checking the names.", "Imprima o jornal depois de conferir os nomes.", "culture"], ["notice", "aviso", "The complete notice has a date and a signature.", "O aviso completo tem uma data e uma assinatura.", "culture"], ["signature", "assinatura", "The notebook has three different signatures.", "O caderno tem tr\xEAs assinaturas diferentes.", "culture"], ["role", "fun\xE7\xE3o; papel", "The programme shows each musician\u2019s role.", "O programa mostra a fun\xE7\xE3o de cada musicista.", "culture"], ["meeting", "reuni\xE3o; encontro", "The community meeting is at the school.", "A reuni\xE3o da comunidade \xE9 na escola.", "city"], ["courtyard", "p\xE1tio", "Meet Zambeto in the museum courtyard.", "Encontre Zambeto no p\xE1tio do museu.", "city"]]) entries.push({ en, pt, example, examplePt, category, categoryLabel: groups[category][0], starter: false });
    const notes = {
      "to be": "Infinitivo: ser ou estar. No presente: I am; you/we/they are; he/she/it is.",
      be: "Forma base. Depois de can, use be: \u201CI can be kind\u201D.",
      am: "Use com I: I am. Forma contra\xEDda: I\u2019m.",
      is: "Use com he, she, it ou um sujeito singular: the museum is.",
      are: "Use com you, we, they e sujeitos no plural: the books are.",
      was: "Passado de am/is: I was; she was. O contexto define \u201Cera\u201D, \u201Cestava\u201D ou \u201Cfoi\u201D.",
      were: "Passado com you/we/they: you were; we were; they were.",
      do: "Como verbo: fazer. Como auxiliar, forma perguntas/negativas com I, you, we e they. Nem sempre recebe tradu\xE7\xE3o isolada.",
      does: "Auxiliar no presente com he/she/it. O verbo seguinte fica na forma base: Does she have\u2026?",
      did: "Auxiliar de perguntas/negativas no passado. Depois de did, use a forma base: Did you have\u2026?",
      have: "I/you/we/they have. Pode indicar posse; tamb\xE9m funciona como auxiliar em outras estruturas.",
      has: "He/she/it has. Em perguntas com does, use have: Does he have\u2026?",
      had: "Passado de have/has: I had; she had; they had.",
      a: "Escolha pelo som inicial, n\xE3o s\xF3 pela letra: a book; a university.",
      an: "Escolha pelo som inicial: an apple; an hour (h n\xE3o pronunciado).",
      the: "Artigo definido. Pode acompanhar palavras no singular ou no plural.",
      on: "Para posi\xE7\xE3o, costuma indicar contato com uma superf\xEDcie: on the table.",
      at: "Muito usado com pontos espec\xEDficos e hor\xE1rios: at school; at eight.",
      they: "Al\xE9m do plural, they pode se referir a uma pessoa; o verbo continua como em \u201Cthey are\u201D.",
      their: "Pode indicar posse de v\xE1rias pessoas ou de uma pessoa referida com they.",
      "it's": "Neste exemplo, contra\xE7\xE3o de it is. Em outras estruturas, tamb\xE9m pode significar it has.",
      furniture: "Incont\xE1vel em ingl\xEAs: some furniture; a piece of furniture. Evite \u201Cfurnitures\u201D.",
      information: "Incont\xE1vel: some information; a piece of information. Evite \u201Cinformations\u201D.",
      homework: "Incont\xE1vel: some homework. Evite \u201Chomeworks\u201D.",
      story: "Narrativa ou hist\xF3ria contada. History costuma indicar o passado hist\xF3rico ou sua \xE1rea de estudo.",
      listen: "Listen to someone/something: ouvir com aten\xE7\xE3o. Hear pode indicar perceber um som."
    };
    for (const entry of entries) if (notes[entry.en.toLowerCase()]) entry.note = notes[entry.en.toLowerCase()];
    V.EnglishVocabulary = { version: 2, entries, categories: Object.fromEntries(Object.entries(groups).map(([key, [label]]) => [key, label])), starter: entries.filter((e) => e.starter).map((e) => e.en.toLowerCase()) };
  })();
});
