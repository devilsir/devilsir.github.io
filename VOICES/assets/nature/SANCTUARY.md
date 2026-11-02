# VOICES · Recintos, fósseis e moradores

Atualização de 2 de novembro de 2026.

## Recintos e água

O Museu dos Animais passa a ter 26 recintos separados. Os quatro tipos de aves possuem viveiros, com tela e poleiro. Os animais aquáticos e semiaquáticos contam com lagos; todos os recintos têm abrigo. As cercas impedem a entrada do visitante, e os animais percorrem rotas limitadas ao próprio espaço. A atualização de movimento acontece uma vez por quadro, mesmo quando os dois jogadores observam o mesmo lugar.

As três folhas aquáticas anteriores foram substituídas no carregamento por `water-full-africa.webp`, `water-full-brazil.webp` e `water-full-extra.webp`. Cada pose desenha o corpo inteiro, incluindo ventre, membros e cauda. O jogo desenha ondas expansivas, espuma e ondulações ao redor do animal; não aplica recortes ao corpo. No caso do hipopótamo, a ficha continua explicando o deslocamento apoiado no fundo. A opção de movimento reduzido mantém uma representação estática.

## Galeria de fósseis e anatomia

A Galeria dos Fósseis e da Anatomia tem entrada própria dentro do museu e contém:

- 16 reconstruções de fósseis: as quatro peças anteriores e mamute, Smilodon, gliptodonte, Purussaurus, Titanoboa, Archaeopteryx, lobo-terrível, hiena das cavernas, Sivatherium, cavalo-gigante-do-cabo, búfalo-de-chifres-longos e megalodonte.
- 36 peças de anatomia comparada: as 26 espécies dos biomas e os dez grupos da praça, parque e litoral. As diferentes raças de cães compartilham a comparação anatômica canina.

Cada animal do museu dá acesso a sua anatomia e a uma peça antiga para comparação. As placas distinguem **anatomia atual** de **fóssil**. A comparação não afirma uma relação de ancestralidade direta. Insetos e crustáceos são apresentados com estruturas externas; a tromba do elefante e as orelhas externas dos mamíferos não são tratadas como ossos. Os modelos são ilustrações simplificadas e não réplicas de um exemplar específico.

As localidades, períodos e fontes por peça estão em `js/sanctuary-data.js` e nas próprias fichas. Entre as referências consultadas estão Smithsonian, Oxford University Museum, Museu Nacional/UFRJ, Museu da Amazônia, Servicio Geológico Colombiano, Natural History Museum, Florida Museum, SANParks, Naturhistorisches Museum Wien e Leeds Museums.

## Moradias e horários

Iara, bióloga de ambientes aquáticos; Bongani, veterinário; e Cecília, paleontóloga, são novos personagens ficcionais. Eles se juntam a Dandara e aos guardas Rosa e Lindiwe. Cada um dos seis possui casa própria, quarto, cama, sala, cozinha, água e banheiro.

A Vila das Acácias fica ligada ao Residencial Boa Vizinhança. A Vila dos Guardas fica na África do Sul, ligada à Cidade do Cabo. As moradias são independentes, visitáveis pelos mesmos sistemas de portas e horários do restante do jogo.

Com **Horários da cidade** ou **NPCs voltam para casa à noite** ativos, os moradores saem para casa a partir das 19h e retornam aos locais de atividade a partir das 6h30. Com ambas as opções desligadas, permanecem disponíveis nos locais de atividade. As passagens dos biomas e museus agora participam do grafo de deslocamento, permitindo completar a volta para casa e o retorno. Os trajetos usam caminhada, passagens e portas existentes, com progresso salvo por morador.

## Artes e prompts

As oito folhas novas foram criadas com a ferramenta integrada **image_gen** e comprimidas em WebP com transparência. Os originais foram preservados; os prompts e caminhos estão em [generation-sanctuary.json](generation-sanctuary.json). A correção específica da anatomia do lobo-guará está documentada em [sanctuary-anatomy-correction.txt](sanctuary-anatomy-correction.txt). Os arquivos finais usam aproximadamente 859 kB.

| Arquivo | Conteúdo |
| --- | --- |
| water-full-africa.webp | Hipopótamo, crocodilo, elefante e búfalo completos, quatro poses |
| water-full-brazil.webp | Capivara, onça, jacaré e anta completos, quatro poses |
| water-full-extra.webp | Ariranha, sucuri, víbora e tatu completos, quatro poses |
| bones-africa.webp | Anatomia africana e três novas reconstruções antigas |
| bones-brazil.webp | Anatomia brasileira e três novas reconstruções antigas |
| bones-community.webp | Animais da comunidade e seis novas peças antigas |
| sanctuary-staff.webp | Dandara, Iara, Bongani e Cecília, quatro poses de caminhada |
| sanctuary-homes.webp | Seis fachadas de casas e dois abrigos de recinto |

As folhas de ossadas são carregadas ao abrir a coleção ou visitar a galeria. A equipe e as fachadas usam um grupo separado; movimentos aquáticos são preparados nos locais e desafios que precisam deles.

## Verificação

`tools/sanctuary-test.cjs` testa limites dos 26 recintos, voo e caminhada, colisão das cercas, acesso às peças, distinção entre fósseis e anatomia, ondas, seis moradias, rotas reais de ida e volta, opções de horários e independência no modo dupla. Os testes existentes de exploração, patrulha e recursos gerais verificam os sistemas compartilhados.
