# GPT World — sprites renovados

## Instalação

1. Extraia este ZIP.
2. Copie o conteúdo da pasta `GPT-World` para a pasta do jogo original que contém `index.html`, aceitando a substituição dos arquivos.
3. Abra o jogo e use `Ctrl + F5` para carregar as novas imagens e o JavaScript atualizado.

Abra `SPRITES-PREVIA.html` para conferir as artes por classe, região e direção, sobre fundos escuro, claro ou quadriculado.

## Conteúdo

- 32 variantes de personagens, com frente, costas, esquerda e direita: 128 sprites.
- 80 mobs, chefes e minichefes dos dez biomas, com as quatro direções: 320 sprites.
- 10 imagens de apresentação, companheiros e formas base: 10 artes.
- Total: 458 imagens com transparência real, nos mesmos caminhos e dimensões dos arquivos originais.

Os sprites WebP usam compressão sem perdas. As artes PNG mantêm seu formato. As poses são estáticas, como no projeto original.

Os arquivos `js/exploration.js`, `js/tower.js`, `js/game.bundle.js` e `styles.css` ajustam a suavização das artes e permitem que a forma feminina inicial use as quatro direções na exploração e na torre.

`MANIFESTO-SPRITES.json` lista as imagens, dimensões e hashes. `PROMPTS-SPRITES.json` registra as instruções usadas para produzir as artes.

## Verificação

Conferência visual dos recortes, canal alpha e direções; comparação de todos os caminhos e dimensões com o projeto recebido; 288 verificações de seleção de poses; teste local de inicialização do bundle nos modos normal e desenvolvedor, com isolamento do estado e ausência de erros.
