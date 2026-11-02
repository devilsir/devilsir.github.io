# VOICES · Sabores, biomas e preservação

## Conteúdo

- Museu da Comida: 21 pratos, história e contexto cultural separados da história das palavras. Fontes consultáveis nas fichas; origens controversas são apresentadas como incertas. A praça tem a fachada do museu; a universidade tem uma passagem identificada.
- Cinco novas receitas: angu de milho, baião de dois, geelrys, malva pudding e muamba de galinha. Total: 21. O desafio mostra apenas o estado atual do alimento, sem cartões de comparação. Partidas antigas têm o texto de comparação removido ao retomar.
- Dezesseis frutas e duas bancas de frutas: Joana no Brasil e Nandi no Mercado do Cabo. Compras seguem os mesmos controles de estoque, carteira, quantidade e espaço na mochila.
- Cinco mapas: savana e áreas úmidas sul-africanas; Pantanal, Cerrado e Mata Atlântica no Brasil. Animais, vegetação e explicações são vinculados aos habitats pesquisados.
- Dezesseis espécies animadas: hipopótamo, leão, elefante, crocodilo-do-nilo, girafa-do-sul, zebra, rinoceronte-branco, búfalo-africano, capivara, onça-pintada, tamanduá-bandeira, lobo-guará, arara-canindé, tucano-toco, preguiça-comum e jacaré-do-pantanal.
- Guardiões da Biodiversidade: cinco patrulhas. A equipe de guardas detém caça, pesca, corte de árvores e mineração ilegais. O jogador sinaliza ameaças, protege locais afetados e libera a passagem para refúgios terrestres e aquáticos. A missão é uma aventura ficcional; os painéis orientam manter distância e comunicar infrações às autoridades na vida real.
- Modos solo e dupla usam os convites e relógio sincronizado existentes. Visitas, observações, menus e deslocamentos pertencem a cada personagem.

## Pesquisa

As fichas do museu têm referências por afirmação, inclusive divergências entre dicionários. Consulte [FOOD-MUSEUM-SOURCES.md](../cooking/FOOD-MUSEUM-SOURCES.md), `js/food-museum-data.js`, `js/nature-data.js` e `js/food-expansion.js` para o mapeamento completo.

Fontes institucionais incluem [SANParks](https://www.sanparks.org/parks/kruger/explore/fauna-flora/mammals), [SANBI](https://nba.sanbi.org.za/content/terrestrial/ter_ecosystems.html), [ICMBio · lobo-guará](https://www.gov.br/icmbio/pt-br/assuntos/biodiversidade/pan/pan-lobo-guara/pan-lobo-guara), [Ibama · fiscalização](https://www.gov.br/ibama/pt-br/assuntos/fiscalizacao-e-protecao-ambiental/fiscalizacao-ambiental/o-que-e-fiscalizacao), IMASUL, instituições de pesquisa e referências lexicográficas. O jogo distingue os contextos dos pratos e as atividades legais das infrações ambientais.

## Artes

Geradas com a ferramenta **image_gen integrada**, em pixel art própria. Os originais permanecem preservados. [generation.json](generation.json) contém os nove prompts finais, ferramenta e caminhos das fontes utilizadas. [manifest.json](manifest.json) registra dimensões, células e tamanhos WebP.

| Atlas | Células |
| --- | --- |
| south-africa-a | 4×4: hipopótamo, leão, elefante e crocodilo; quatro passos por espécie |
| south-africa-b | 4×4: girafa, zebra, rinoceronte e búfalo; quatro passos por espécie |
| brazil-a | 4×4: capivara, onça, tamanduá e lobo-guará; quatro passos por espécie |
| brazil-b | 4×4: arara, tucano, preguiça e jacaré; quatro passos por espécie |
| fruits | 4×4: banana, manga, mamão, abacaxi, goiaba, coco, maracujá, jabuticaba, laranja, naartjie, pêssego, uva, marula, melancia, abacate e limão |
| new-dishes | 4×2: cinco pratos prontos e três ingredientes/molhos |
| new-prep | 4×4: transformações de angu, baião, malva e muamba; geelrys reutiliza a preparação de arroz e tem prato final próprio |
| habitats | 4×4: bancas, fachada, vitrine, árvores, rochas, posto, torre, juncos e plantas aquáticas |
| people | 4×4: guardas em movimento, infratores ficcionais e vestígios das atividades ilegais |

Empacotamento: `tools/prepare-nature-assets.cjs`. Extração de silhuetas evita elementos de células vizinhas; escala e linha de apoio são constantes nos quatro passos. Os nove atlas somam aproximadamente **0,96 MB**, carregados sob demanda nos grupos `nature` e `nature-food`.

## Validação

Os testes de integração executam os scripts reais do jogo e Canvas nativo. `tools/food-expansion-test.cjs`, `tools/food-museum-test.cjs`, `tools/nature-test.cjs` e `tools/nature-challenge-test.cjs` cobrem receitas, compras, fichas, habitats, rotas, fauna animada, objetivos e teclas dos dois visualizadores. Relatórios e capturas ficam em `.qa/review/`.
