# QuimiCraft

Projeto estático, sem etapa de build. Abra `index.html` diretamente ou publique a pasta inteira no GitHub Pages.

## Estrutura

- `index.html` — marcação da interface e carregamento dos arquivos.
- `styles/main.css` — estilos gerais do jogo.
- `styles/character-customization.css` — aparência do editor de personagem e dos penteados.
- `js/game.js` — motor e lógica principal do QuimiCraft.
- `js/character-customization.js` — módulo independente da personalização, preview e persistência.
- `assets/three.min.js` — biblioteca gráfica usada pelo jogo.

A aparência continua salva em `localStorage` na chave `qc_character`.
