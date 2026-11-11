# VOICES — Reboot the Story

Aventura educativa de exploração, memória e inglês em New Harmony. O jogo roda no navegador, com campanha, atividades culturais, moradias e modo local para duas pessoas.

## Jogar

Abra `index.html` depois de extrair a pasta completa. Mantenha `assets`, `css` e `js` junto do HTML. O menu inicial aparece antes de preparar os recursos do jogo; a primeira ação no menu inicia essa preparação. As telas internas dos desafios em dupla são preparadas automaticamente.

O progresso e os perfis ficam no navegador usado. Faça backups pelo menu do jogo para transportar uma aventura entre dispositivos. A versão local não sincroniza contas pela internet.

## Preparar o desenvolvimento

Use Node.js 22.12 ou superior. Na raiz do projeto:

```sh
npm ci
npm start
```

Abra `http://127.0.0.1:4173`. O servidor atende somente este computador. Para usar outra porta, configure a variável `PORT`.

As dependências de desenvolvimento e suas versões estão em `package.json` e `package-lock.json`. `node_modules` contém bibliotecas instaladas; `.qa` contém resultados temporários. Nenhuma dessas pastas é necessária para jogar a versão distribuída.

## Verificar

```sh
npm run check
npm test
npm run test:all
npm run test:build
npm run audit:world
```

- `check`: sintaxe, referências, metadados de autoria e uso dos pontos de extensão.
- `test`: conjunto principal de integração, carregamento, dupla, memória, culinária, comunidade e créditos.
- `test:all`: todos os testes locais de Node, executados em sequência. O resultado consolidado fica em `.qa/test-results.json`.
- `test:build`: gera a distribuição e executa a integração contra o código minificado, com identificação dos fontes e do pacote em `.qa/distribution-test-results.json`.
- `test:failed`: repete falhas da mesma versão. Se os fontes mudaram ou o histórico não identifica a versão, executa novamente todos os grupos atuais.
- `audit:world`: inventário atual dos mapas e conexões em `.qa/world-audit.json`.

Para um grupo específico: `node tools/test.cjs cooking credits`. O teste `mask-file-browser-test.cjs` usa um navegador instalado e é executado separadamente, quando o ambiente dispõe desse acesso. Ele não faz parte do conjunto portátil.

Os testes de integração simulam o navegador com jsdom e Canvas nativo. Complemente-os com uma sessão real em navegador e com aparelhos físicos ao avaliar desempenho ou controles de toque.

Os relatórios usam o formato `schemaVersion: 2`: `source.id` identifica o conteúdo por SHA-256; `run` registra comando, datas e ambiente; `results` distingue execuções novas e aprovações reaproveitadas. Cada resultado preserva a execução de origem. Se os arquivos mudarem durante os testes, o relatório é marcado como inválido. O histórico de execuções e os manifestos dos arquivos verificados ficam em `.qa/test-runs` e `.qa/test-inputs`.

## Gerar a distribuição otimizada

```sh
npm run build
node tools/serve.cjs --dist
```

A pasta `dist` contém o jogo pronto para hospedagem estática, com JavaScript e CSS agrupados, minificados e identificados pelo conteúdo. O menu carrega um pequeno preparador; o código do jogo é solicitado na primeira ação, em um único arquivo. O editor independente de sprites também é incluído.

Publique o conteúdo de `dist`, mantendo a estrutura de pastas. Não é necessário servidor de aplicação. O comando de geração não publica o projeto automaticamente. Não edite os arquivos gerados; altere os fontes e execute o comando novamente.

## Organização

- `index.html`: estrutura da interface e catálogo embutido de módulos do jogo.
- `data/module-graph.json`: dependências explícitas dos módulos do jogo e do editor. Após editá-lo, execute `npm run modules:sync`.
- `js`: sistemas, dados de conteúdo e extensões.
- `css`: estilos da interface e das atividades.
- `assets`: imagens, áudio, fontes, manifestos e registros de procedência.
- `data`: fontes de pesquisa e dados auxiliares. Alguns arquivos são referências usadas por geradores.
- `tools`: testes, geração de recursos, distribuição e auditoria.
- `sprite-editor.html`: editor independente, com seus próprios catálogos.
- `docs`: documentação de arquitetura e registro da limpeza.

Consulte `docs/arquitetura.md` antes de adicionar uma expansão. A lista dos 18 arquivos removidos nesta manutenção está em `docs/limpeza-2026-11-10.json`; baselines citados por geradores e recursos com referências de uso foram preservados.

O registro da correção das dependências dos módulos e da identificação de versão dos testes está em `docs/modulos-e-testes-2026-11-10.md`.

A nova pilotagem, o lançamento e os controles do Correio sobre Rodas estão descritos em `docs/moto-entrega-2026-11-10.md`.

A renovação da galeria, do Mercado do Cabo, das 48 peças da casa, dos acabamentos e do avanço automático das receitas está em `docs/galerias-casa-receitas-2026-11-10.md`.

Os novos comportamentos da fauna marinha, as rotinas dos moradores e a coleção de 16 móveis estão descritos em `docs/vida-no-mar-e-cotidiano-2026-11-10.md`.

## Autoria e licença

Lucas Xavier Nardelli e Claudilene Alves Lopes. Os materiais originais seguem `LICENSE.txt`; os avisos adicionais estão em `NOTICE.txt`. Fontes tipográficas e materiais externos preservam as próprias condições de uso e os respectivos avisos.
