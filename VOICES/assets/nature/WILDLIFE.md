# VOICES · Animais e Museu dos Animais

Atualização de 2 de novembro de 2026.

## Conteúdo

- Dez novas espécies, totalizando 26: hiena-malhada, víbora-sopradora, suricato, mabeco, águia-pesqueira-africana, sucuri-amarela, anta-brasileira, ariranha, tatu-galinha e harpia.
- As espécies aparecem nos biomas da aventura de acordo com seus ambientes. A savana é um mosaico ficcional com um setor mais seco para suricatos; não reproduz um único parque.
- Quatro aves têm quatro quadros próprios de batida de asas. Doze espécies têm quadros de deslocamento na água. Hipopótamos têm deslocamento submerso, apoiando-se no fundo.
- Museu dos Animais, acessível pela Praça das Vozes e pelo mapa: 26 modelos de fauna e quatro reconstruções fósseis, com localização, nome científico, texto curto, curiosidade, períodos e fontes.
- Galeria do tempo: Eremotherium, Toxodon, Mesosaurus e Lystrosaurus. São representações artísticas simplificadas; não são réplicas de exemplares específicos nem usam escala comparativa real.
- Catálogo com busca e filtros para Brasil, África do Sul e fósseis. Fichas registradas por jogador, mantendo os menus particulares no modo dupla.
- Comidas dos mostruários reduzidas de 86×64 para 56×42, com as vitrines conservando o tamanho.

## Artes, arquivos e prompts

As sete folhas foram criadas com a ferramenta integrada **image_gen**, usando `south-africa-a.webp` como referência de estilo. Os prompts completos e os caminhos dos originais estão em [generation-wildlife.json](generation-wildlife.json). O método de preparação está em `tools/prepare-wildlife-assets.cjs`.

As artes finais ficam nesta pasta:

| Arquivo | Conteúdo |
| --- | --- |
| africa-extra.webp | Hiena, víbora, suricato, mabeco; quatro poses terrestres |
| brazil-extra.webp | Sucuri, anta, ariranha, tatu; quatro poses terrestres |
| flight.webp | Arara, tucano, harpia, águia-pesqueira; quatro poses de voo |
| swim-africa.webp | Hipopótamo, crocodilo, elefante, búfalo |
| swim-brazil.webp | Capivara, onça, jacaré, anta |
| swim-extra.webp | Ariranha, sucuri, víbora, tatu |
| museum-fauna.webp | Quatro fósseis, fachada, vitrine, globo e naturalista |

As folhas usam WebP com transparência e totalizam aproximadamente **487 kB**. O carregamento dos movimentos fica reservado aos biomas e ao museu; a fachada usa um grupo próprio. Os quadros de voo têm alinhamento pelo bico para evitar saltos verticais entre poses. O manifesto contém dimensões e tamanhos exatos.

## Pesquisa

As referências completas, por espécie e fóssil, estão em `js/wildlife-data.js` e nos botões “Fontes e pesquisa” dentro das fichas. Referências principais:

- [SANBI · Hiena-malhada](https://speciesstatus.sanbi.org/taxa/detail/1999/), [suricato](https://www.sanbi.org/animal-of-the-week/meerkat/) e [mabeco](https://www.sanbi.org/animal-of-the-week/african-wild-dog/).
- [Smithsonian · Víbora-sopradora](https://nationalzoo.si.edu/animals/puff-adder) e [BirdLife South Africa · Águia-pesqueira-africana](https://www.birdlife.org.za/red-data-book/red-list/african-fish-eagle/).
- [Instituto Butantan · Sucuris](https://www.butantan.gov.br/butantan-educa/grandiosa-musculosa-e-sul-americana-conheca-a-sucuri), [Zoológico de Brasília · Anta](https://www.zoo.df.gov.br/anta) e [AMPA · Ariranha](https://ampa.org.br/especies/ariranha/).
- [Florida Museum · Tatu-galinha](https://www.floridamuseum.ufl.edu/discover/story/five-facts-nine-banded-armadillo/) e [Texas Parks & Wildlife · Deslocamento na água](https://tpwd.texas.gov/education/resources/texas-junior-naturalists/watching-wildlife/nine-banded-armadillo).
- [Museu Nacional / UFRJ · Harpia](https://www.museunacional.ufrj.br/dir/exposicoes/zoologia/zoo_vertebrados/exposicoes/zoo_aves/zooave017.html) e [megafauna](https://www.museunacional.ufrj.br/dir/exposicoes/paleontologia/pale033.html).
- [Prefeitura de Castelo · Pesquisa da megafauna](https://castelo.es.gov.br/descoberto-em-castelo-o-maior-campo-fossilifero-do-estado-do-espirito-santo), [National Museum · Paleontologia](https://nationalmuseum.co.za/palaeontology/), [UNICENTRO · Mesossauros](https://www3.unicentro.br/museuinterativo/mesossauros-e-a-deriva-continental/) e [Iziko Museums · Karoo](https://www.iziko.org.za/collection/karoo-palaeontology/).

Não se atribuem coordenadas exatas a observações de fauna. As localidades dos fósseis são regiões documentadas nas fontes; o museu ficcional não afirma guardar os exemplares reais dessas instituições.

## Verificação

`tools/wildlife-test.cjs` verifica coleção, fontes, integridade e variedade das poses, seleção da animação pela água, movimentos reduzidos, caminhos até todas as peças, distância entre entradas, pesquisa e filtros, renderização e separação dos cadernos no modo dupla. Os testes existentes de natureza, patrulha e Museu da Comida cobrem os sistemas compartilhados.
