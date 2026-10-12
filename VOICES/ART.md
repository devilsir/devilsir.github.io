# VOICES — arte original

Todos os sprites foram desenhados especificamente para este jogo, com formas e pixels originais em Pillow. Não há imagens baixadas, fotografias, assets de outros jogos ou fontes externas. A paleta une azul-noite, violeta, ciano, âmbar e coral. Personagens e objetos usam contorno de um pixel, áreas de luz e sombra e transparência RGBA real. O elenco é contemporâneo; Tainá usa jaqueta e câmera, sem fantasias ou adereços estereotipados.

Regenerar: `python tools/create_pixel_assets.py` (requer Python 3 e Pillow). O processo é determinístico; não depende de rede nem de um serviço externo.

## Personagens

`assets/characters/{id}.png`: **128 × 192**, 4 colunas × 6 linhas, frames de **32 × 32**. A coluna 0 é a pose de repouso da direção. Colunas 1–3 formam o ciclo de movimento. Linhas: 0 frente/baixo; 1 esquerda; 2 direita; 3 costas/cima; 4 interação com instrumento; 5 celebração. Uso: `sx = frame * 32; sy = row * 32`. Ampliar com `imageSmoothingEnabled = false`; tamanho recomendado em cena: 48 ou 64 pixels. As sombras semitransparentes já integram o sprite.

`assets/characters/{id}-portrait.png`: **288 × 96**, 3 colunas de **96 × 96**: 0 neutra; 1 contente; 2 preocupada. As expressões usam os mesmos rostos, tons de pele, cabelos e roupas dos sprites.

IDs: `nia`, `leo`, `taina`, `sol`, `pix`, `curator`, `librarian`, `scientist`, `journalist`, `resident`, `student`, `musician`.

- Nia: adolescente negra brasileira; cabelo cacheado, jaqueta violeta e detalhes ciano.
- Leo: óculos, jaqueta âmbar e mochila.
- Tainá: adolescente indígena brasileira, cabelo comprido, jaqueta verde-azulada e câmera de documentarista.
- Sol: adolescente negro brasileiro, cabelo natural, fones e jaqueta coral.
- Pix: robô flutuante com tela expressiva e propulsor ciano.
- NPCs: curador de cabelo grisalho e óculos; bibliotecária com coque; cientista de jaleco e óculos de laboratório; jornalista com crachá; morador com cachecol; estudante com boné e mochila; músico com barba e alça de instrumento.

## Chefes

`assets/characters/boss-{id}.png`: **384 × 96**, 4 frames de **96 × 96**, uma linha. IDs: `djglitch`, `eraser`, `copycat`, `clickbait`, `wall`, `bias`. São objetos e sistemas personificados: caixa de som com DJ, borracha de arquivo, copiadora de espelhos, tela de manchetes chamativas, muro com cadeado e balança robótica desigual. Nenhum antagonista associa uma aparência racial a maldade.

## Tiles

`assets/tilesets/tiles.png`: **256 × 128**, 8 colunas × 4 linhas de 32 pixels. Tiles de piso são propositalmente opacos. `sx = (id % 8) * 32; sy = floor(id / 8) * 32`.

| ID | Nome | ID | Nome |
|---:|---|---:|---|
| 0 | grass | 16 | water_edge |
| 1 | grass_light | 17 | brick_wall |
| 2 | flower_grass | 18 | archive_wall |
| 3 | dirt_path | 19 | glass_wall |
| 4 | stone_path | 20 | rock |
| 5 | street | 21 | sand |
| 6 | sidewalk | 22 | soil |
| 7 | plaza | 23 | hedge |
| 8 | wood_floor | 24 | circuit_floor |
| 9 | archive_floor | 25 | mural_wall |
| 10 | museum_floor | 26 | steps |
| 11 | library_floor | 27 | road_line |
| 12 | lab_floor | 28 | void |
| 13 | studio_floor | 29 | community_floor |
| 14 | transit_floor | 30 | park_ground |
| 15 | water | 31 | portal_base |

## Objetos

`assets/tilesets/props.png`: **384 × 128**, 12 colunas × 4 linhas de 32 pixels. Alpha real. `sx = (id % 12) * 32; sy = floor(id / 12) * 32`.

| ID | Nome | ID | Nome | ID | Nome |
|---:|---|---:|---|---:|---|
| 0 | oak_tree | 16 | microscope | 32 | gate |
| 1 | palm | 17 | telescope | 33 | portal |
| 2 | sapling | 18 | lab_table | 34 | clue |
| 3 | hedge | 19 | terminal | 35 | chest |
| 4 | bench | 20 | projector | 36 | signpost |
| 5 | lamp | 21 | camera_tripod | 37 | footbridge |
| 6 | fountain | 22 | microphone | 38 | bin |
| 7 | mural | 23 | speaker | 39 | coffee |
| 8 | noticeboard | 24 | dj_desk | 40 | bus_stop |
| 9 | books | 25 | drums | 41 | dialogue |
| 10 | bookshelf | 26 | guitar | 42 | inclusive_flag |
| 11 | reading_desk | 27 | keyboard | 43 | texture_booth |
| 12 | archive_cabinet | 28 | plant_pot | 44 | map_board |
| 13 | document | 29 | flowers | 45 | charging_station |
| 14 | portrait_frame | 30 | street_banner | 46 | evidence |
| 15 | globe | 31 | market_stall | 47 | podium |

## Ícones, insígnias e efeitos

Cada arquivo tem **256 × 64**, 8 colunas × 2 linhas de 32 pixels, alpha real. `sx = (id % 8) * 32; sy = floor(id / 8) * 32`.

| ID | `ui/icons.png` | `ui/badges.png` | `effects/effects.png` |
|---:|---|---|---|
| 0 | inventory | listening | spark_cyan |
| 1 | journal | curiosity | spark_coral |
| 2 | map | collaboration | spark_amber |
| 3 | translate | critical_thinking | spark_violet |
| 4 | scan | history | scan |
| 5 | source | language | portal |
| 6 | timeline | culture | ripple |
| 7 | shield | courage | warning |
| 8 | clue | care | heart |
| 9 | settings | repair | shield |
| 10 | audio | science | music |
| 11 | fullscreen | music | translate |
| 12 | arrow | inclusion | trail |
| 13 | back | connection | burst |
| 14 | heart | checkpoint | confetti |
| 15 | star | voices | signal |

O arquivo `assets/tilesets/manifest.json` repete os nomes e índices para integração automática. A validação ao fim do gerador verifica dimensões, modo RGBA, arte não vazia, transparência dos sprites e pixels totalmente opacos.

`assets/ui/art-preview.png` reúne o elenco, os chefes, os objetos, os ícones e os efeitos em uma única prancha de revisão; não é carregado pelo motor do jogo.

## Ilustração de abertura

`assets/backgrounds/new-harmony.png` é a arte original gerada nesta sessão, integrada ao título, introdução e encerramento. O PNG original foi preservado. O prompt de criação consta de `tools/title-art-prompt.txt`. A geração usa o elenco, a paleta e a cidade descritos no pedido, sem personagens de outros jogos.

## Expansão Mundo Vivo

`tools/create_world_assets.py` acrescenta arte ao sistema original sem sobrescrever as folhas antigas. IDs novos: `gardener`, `vendor`, `guide`, `archivist`, `technician`, `teacher`, `courier`, `elder`, `student2`, `percussionist`. São dez sprites de 128 × 192 e dez retratos de 288 × 96, com o mesmo formato das folhas anteriores.

`assets/characters/animals.png`: 128 × 192, quatro frames horizontais de 32 pixels e seis linhas: 0 cão, 1 gato, 2 pombo, 3 passarinho, 4 pato, 5 borboleta. Recorte: `sx = frame * 32; sy = espécie * 32`.

`assets/tilesets/world-props.png`: 256 × 128, oito colunas e quatro linhas de 32 pixels. Inclui 32 objetos: canteiros, toldo, frutas, carrinho, piquenique, bicicleta, correio, jornais, tapete, poltrona, relógio, mesa de mapa, vitrine, toca-discos, suporte de música, mural, piso acessível, borda de lago, planta aquática, pergaminhos, prensa, painel solar, antena, servidor, caixa de cabos, quadro, pia, tigela, ninho, lanterna e varal.

`assets/tilesets/world-manifest.json` contém todos os índices e dimensões. `assets/ui/world-preview.png` reúne os novos assets; é uma prancha de revisão e não é carregada pelo jogo. São **58 PNGs usados na execução**, incluindo a abertura, mais as duas pranchas de revisão. As rotas usam poses direcionais e os encontros incluem gestos de conversa. A ordenação pela altura no mapa faz pessoas e objetos aparecerem à frente ou atrás de forma consistente.
