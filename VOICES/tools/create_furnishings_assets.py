from pathlib import Path
import importlib.util
import base64
import json
from PIL import Image, ImageDraw, ImageFont, ImageColor

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_furnishings_palette', ROOT / 'tools' / 'create_scene_assets.py')
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
base = scene.base
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty
P = base.P
W = ['#624535', P['brown'], P['brownlight']]
F = ['#2b5355', '#588e7d', '#9abfa5']
M = [P['darkgrey'], P['grey'], P['greylight']]
G = [P['greendark'], P['green'], P['greenlight']]
STONE = ['#6d6c69', '#a6a293', '#d4cdb8']
GLASS = ['#426c77', '#759ca2', '#b5d3cb']
GROUPS = {
    'hub': [
        ('curved-stone-bench', 'Banco curvo de pedra da praça', 'sit'),
        ('refreshment-pushcart', 'Carrinho de refrescos com garrafa térmica', 'observe'),
        ('staggered-bicycle-rack', 'Bicicletário com aros escalonados', 'observe'),
        ('public-drinking-fountain', 'Bebedouro público com torneira baixa', 'observe'),
        ('chess-stone-table', 'Mesa de xadrez da praça', 'observe'),
        ('charging-leaning-table', 'Mesa alta com tomadas protegidas', 'observe'),
        ('community-coat-hooks', 'Painel de ganchos para bolsas', 'observe'),
        ('flower-stone-trough', 'Floreira de pedra com flores miúdas', 'observe'),
    ],
    'library': [
        ('arched-tall-bookcase', 'Estante alta de livros com arco', 'observe'),
        ('reclining-reading-chair', 'Poltrona inclinada de leitura', 'sit'),
        ('slanted-magazine-rack', 'Expositor inclinado de revistas', 'observe'),
        ('bookbinding-press', 'Prensa manual de encadernação', 'observe'),
        ('rolling-library-ladder', 'Escada de biblioteca com rodízios', 'observe'),
        ('study-carrel', 'Mesa de estudo com divisórias', 'observe'),
        ('dictionary-lectern', 'Suporte de consulta para dicionário', 'observe'),
        ('felt-room-divider', 'Divisória de feltro para leitura silenciosa', 'observe'),
    ],
    'park': [
        ('hexagonal-picnic-table', 'Mesa hexagonal de piquenique', 'observe'),
        ('carved-log-bench', 'Banco baixo de tronco trabalhado', 'sit'),
        ('bird-observation-binoculars', 'Binóculo fixo de observação de aves', 'observe'),
        ('bird-hide-screen', 'Painel de observação com aberturas', 'observe'),
        ('trail-map-kiosk', 'Quiosque de mapa das trilhas', 'observe'),
        ('dog-rinse-platform', 'Plataforma baixa para limpeza das patas', 'observe'),
        ('picnic-basket-table', 'Mesa pequena com cesta de piquenique', 'observe'),
        ('nest-box-post', 'Suporte de caixa-ninho protegida', 'observe'),
    ],
    'market': [
        ('weighing-counter', 'Balcão com balança de dois pratos', 'observe'),
        ('ice-chest-cart', 'Carrinho de caixa térmica', 'observe'),
        ('vegetable-display-tier', 'Expositor de verduras em três níveis', 'observe'),
        ('flour-bin-cabinet', 'Armário de farinhas com medidas', 'observe'),
        ('food-warming-cart', 'Carrinho de comida com tampas térmicas', 'observe'),
        ('grain-hopper-rack', 'Suporte de dispensadores de grãos', 'observe'),
        ('cloth-cutting-table', 'Mesa de corte com rolo de tecido', 'observe'),
        ('crate-hand-truck', 'Carrinho de carga com caixas empilhadas', 'observe'),
    ],
    'garden': [
        ('propagation-cold-frame', 'Estufa baixa para mudas', 'observe'),
        ('potting-workbench', 'Bancada de transplante com vasos', 'observe'),
        ('outdoor-garden-sink', 'Tanque da horta com torneira', 'observe'),
        ('seed-library-cabinet', 'Armário comunitário de sementes', 'observe'),
        ('waist-high-growing-bed', 'Canteiro elevado para cuidado acessível', 'observe'),
        ('irrigation-hose-trolley', 'Carrinho de mangueira de irrigação', 'observe'),
        ('compost-sieving-table', 'Mesa com peneira de composto', 'observe'),
        ('herb-drying-rack', 'Varal de ervas com feixes pendentes', 'observe'),
    ],
    'beach': [
        ('striped-changing-booth', 'Cabine listrada para trocar de roupa', 'observe'),
        ('lifeguard-high-chair', 'Cadeira elevada de observação da praia', 'observe'),
        ('beach-folding-lounger', 'Espreguiçadeira dobrável de praia', 'sit'),
        ('rinsing-shower', 'Chuveiro para retirar areia', 'observe'),
        ('rescue-equipment-rack', 'Suporte de boia e equipamento de resgate', 'observe'),
        ('parasol-side-table', 'Mesa baixa com guarda-sol', 'observe'),
        ('beach-towel-hook-post', 'Poste de ganchos para cangas e toalhas', 'observe'),
        ('shell-study-tray', 'Bandeja de observação de conchas', 'observe'),
    ],
    'chapter-1': [
        ('public-outdoor-piano', 'Piano comunitário com cobertura', 'music'),
        ('small-stage-steps', 'Degraus de tablado para apresentação', 'observe'),
        ('drum-rest-cradle', 'Berço de apoio para tambor', 'music'),
        ('concert-poster-frame', 'Painel de programação dos ensaios', 'observe'),
        ('record-swap-crates', 'Caixas de troca de discos', 'observe'),
        ('performer-fold-screen', 'Biombo de preparação dos músicos', 'observe'),
        ('wind-instrument-stand', 'Suporte de instrumentos de sopro', 'music'),
        ('rehearsal-banner-rail', 'Suporte de faixas do ensaio aberto', 'observe'),
    ],
    'room-1': [
        ('upright-studio-piano', 'Piano vertical do estúdio', 'music'),
        ('double-keyboard-stand', 'Suporte duplo de teclados', 'music'),
        ('microphone-pop-filter', 'Microfone com filtro e tripé', 'music'),
        ('mixing-rack-console', 'Console de mixagem com módulos', 'observe'),
        ('adjustable-drum-throne', 'Banco giratório de bateria', 'sit'),
        ('acoustic-gobo', 'Painel acústico móvel', 'observe'),
        ('guitar-wall-rail', 'Suporte de guitarras na parede', 'music'),
        ('cable-reel-cart', 'Carrinho de enroladores de cabos', 'observe'),
    ],
    'chapter-2': [
        ('courtyard-exhibit-plinth', 'Pedestal do pátio com amostra didática', 'observe'),
        ('exhibition-entry-ramp', 'Rampa baixa para entrada da exposição', 'observe'),
        ('guide-meeting-canopy', 'Cobertura do ponto de encontro do guia', 'observe'),
        ('museum-urn-planter', 'Jardineira em vaso largo do pátio', 'observe'),
        ('outdoor-history-map', 'Painel externo de mapa histórico', 'observe'),
        ('reproduction-handling-table', 'Mesa de réplicas didáticas para observar', 'observe'),
        ('ticket-information-counter', 'Balcão de informações da exposição', 'observe'),
        ('courtyard-exhibit-lamp', 'Luminária de pátio voltada à exposição', 'observe'),
    ],
    'room-2': [
        ('horizontal-flat-file', 'Mapoteca de gavetas horizontais', 'observe'),
        ('document-support-wedge', 'Apoio inclinado para documento', 'observe'),
        ('conservation-gloves-station', 'Estação de materiais de conservação', 'observe'),
        ('framed-art-storage-rack', 'Suporte de armazenamento de quadros', 'observe'),
        ('artifact-foam-tray', 'Bandeja com apoios de conservação', 'observe'),
        ('magnifier-research-desk', 'Mesa de consulta com lupa articulada', 'observe'),
        ('humidity-monitor-cabinet', 'Armário com indicador de umidade', 'observe'),
        ('photo-sorting-rack', 'Grade de organização de fotografias', 'observe'),
    ],
    'chapter-3': [
        ('solar-demonstration-panel', 'Painel solar de demonstração', 'observe'),
        ('wind-demo-workbench', 'Bancada de demonstração de vento', 'observe'),
        ('rain-observation-post', 'Poste de observação da chuva', 'observe'),
        ('shadow-comparison-table', 'Mesa de comparação de sombras', 'observe'),
        ('geology-touch-display', 'Expositor didático de rochas', 'observe'),
        ('community-question-tree', 'Suporte ramificado de perguntas da ciência', 'observe'),
        ('magnifying-sample-table', 'Mesa de amostras com lupa fixa', 'observe'),
        ('outdoor-results-board', 'Painel de resultados de observação', 'observe'),
    ],
    'room-3': [
        ('optical-observation-bench', 'Bancada de observação óptica', 'observe'),
        ('safe-circuit-workstation', 'Estação didática de circuitos de baixa tensão', 'observe'),
        ('sample-drawer-cabinet', 'Gaveteiro de amostras com etiquetas', 'observe'),
        ('laboratory-task-lamp', 'Luminária de tarefa do laboratório', 'observe'),
        ('measuring-instrument-rack', 'Suporte de instrumentos de medida', 'observe'),
        ('experiment-notebook-desk', 'Mesa de registro de experimentos', 'observe'),
        ('comparison-sample-turntable', 'Base giratória de comparação de amostras', 'observe'),
        ('laboratory-stool', 'Banco de laboratório com apoio de pés', 'sit'),
    ],
    'chapter-4': [
        ('public-news-kiosk', 'Quiosque público de notícias', 'observe'),
        ('community-paper-dispenser', 'Expositor de jornal comunitário', 'observe'),
        ('media-listening-bench', 'Banco com estação de escuta', 'sit'),
        ('phone-repair-counter', 'Bancada de manutenção de aparelhos', 'observe'),
        ('outdoor-correction-board', 'Painel de correções do bairro', 'observe'),
        ('public-interview-chair', 'Cadeira com apoio para entrevista', 'sit'),
        ('device-return-locker', 'Armário de devolução de equipamentos', 'observe'),
        ('portable-projection-cart', 'Carrinho de projeção comunitária', 'observe'),
    ],
    'room-4': [
        ('horseshoe-editorial-table', 'Mesa editorial em ferradura', 'observe'),
        ('caption-review-lightbox', 'Mesa de luz para revisão de imagens', 'observe'),
        ('source-reference-cabinet', 'Armário de referências e fontes', 'observe'),
        ('interview-audio-desk', 'Mesa de gravação de entrevista', 'observe'),
        ('proof-sheet-drying-rail', 'Trilho de folhas de revisão', 'observe'),
        ('correction-tray-tower', 'Organizador de correções em bandejas', 'observe'),
        ('community-newspaper-press', 'Prensa didática do jornal comunitário', 'observe'),
        ('editorial-rolling-chair', 'Cadeira de trabalho com rodízios', 'sit'),
    ],
    'chapter-5': [
        ('accessible-public-table', 'Mesa pública com espaço de aproximação', 'observe'),
        ('community-tool-lending-locker', 'Armário de empréstimo de ferramentas', 'observe'),
        ('neighborhood-mural-easel', 'Suporte de trabalho do mural coletivo', 'observe'),
        ('low-community-planting-table', 'Mesa baixa de plantio compartilhado', 'observe'),
        ('covered-rest-seat', 'Assento de descanso com cobertura', 'sit'),
        ('community-route-marker', 'Totem de orientação das rotas do bairro', 'observe'),
        ('shared-meal-counter', 'Balcão de refeições compartilhadas', 'observe'),
        ('children-art-storage', 'Organizador de materiais de desenho', 'observe'),
    ],
    'room-5': [
        ('semicircle-assembly-bench', 'Banco semicircular da assembleia', 'sit'),
        ('height-adjustable-speaking-desk', 'Mesa de fala com ajuste de altura', 'observe'),
        ('quiet-writing-nook', 'Mesa de participação escrita com biombo', 'observe'),
        ('turn-order-card-rail', 'Suporte de cartões da ordem de fala', 'observe'),
        ('proposal-model-table', 'Mesa da maquete de proposta do bairro', 'observe'),
        ('meeting-notes-cabinet', 'Arquivo de notas das reuniões', 'observe'),
        ('shared-water-carafe-station', 'Estação de água e copos da assembleia', 'observe'),
        ('stackable-meeting-chairs', 'Pilha organizada de cadeiras de reunião', 'observe'),
    ],
    'chapter-6': [
        ('public-catalog-island', 'Ilha de consulta do catálogo público', 'observe'),
        ('restoration-window-display', 'Expositor de etapas de conservação', 'observe'),
        ('community-record-dropbox', 'Caixa de contribuições documentais', 'observe'),
        ('archive-welcome-settee', 'Sofá de espera do arquivo', 'sit'),
        ('record-connection-map', 'Painel de conexões entre registros', 'observe'),
        ('civic-index-sign', 'Totem de índice do arquivo comunitário', 'observe'),
        ('archive-return-cradle', 'Suporte de devolução com caixas protegidas', 'observe'),
        ('restored-book-display', 'Expositor de livros restaurados', 'observe'),
    ],
    'room-6': [
        ('backup-equipment-cabinet', 'Armário de cópias de segurança', 'observe'),
        ('paired-review-workstations', 'Estações de revisão lado a lado', 'observe'),
        ('labeled-network-patch-rack', 'Rack com conexões e etiquetas', 'observe'),
        ('offline-record-storage-chest', 'Baú de registros para consulta sem rede', 'observe'),
        ('restoration-progress-console', 'Mesa de acompanhamento da restauração', 'observe'),
        ('equipment-maintenance-station', 'Bancada de manutenção do catálogo', 'observe'),
        ('rolling-backup-media-case', 'Maleta de mídias de backup com rodízios', 'observe'),
        ('human-review-lamp-desk', 'Mesa de revisão humana com luminária', 'observe'),
    ],
}

def shadow(d, box=(3, 27, 29, 30)):
    ell(d, box, (17, 23, 41, 42))

def wb(d, box, tone=1):
    rect(d, box, W[tone], 'ink')
    line(d, (box[0]+1, box[1]+1, box[2]-1, box[1]+1), W[2])

def mb(d, box, tone=1):
    rect(d, box, M[tone], 'ink')
    line(d, (box[0]+1, box[1]+1, box[2]-1, box[1]+1), M[2])
    line(d, (box[0]+1, box[3]-1, box[2]-1, box[3]-1), M[0])

def legs(d, xs=(5, 25), top=21, bottom=29, metal=False):
    pal = M if metal else W
    for x in xs:
        rect(d, (x, top, x+2, bottom), pal[0], 'ink')
        line(d, (x+1, top+1, x+1, bottom-1), pal[2])

def tabletop(d, box=(2, 12, 29, 21), metal=False):
    x0, y0, x1, y1 = box
    legs(d, (x0+3, x1-5), y1, metal=metal)
    pal = M if metal else W
    poly(d, [(x0, y0+3), (x1-5, y0), (x1, y1-3), (x0+5, y1)], pal[2], 'ink')
    poly(d, [(x0+5, y1), (x1, y1-3), (x1, y1), (x0+5, y1+3)], pal[1], 'ink')
    line(d, (x0+7, y1+1, x1-1, y1-1), pal[0])

def label(d, box=(9, 16, 22, 22), color='paper', rows=2):
    rect(d, box, color, 'ink')
    for j in range(rows):
        y = box[1]+2+j*2
        if y < box[3]: line(d, (box[0]+2, y, box[2]-2-j, y), 'darkgrey')

def wheel(d, x, y, r=2):
    ell(d, (x-r, y-r, x+r, y+r), M[0], 'ink')
    rect(d, (x, y, x, y), M[2])

def leaf(d, x, y):
    line(d, (x, y+4, x, y-2), G[0])
    poly(d, [(x, y+1), (x-4, y-1), (x-3, y-3), (x, y-1)], G[1], G[0])
    poly(d, [(x, y), (x+3, y-4), (x+4, y-2), (x+1, y+2)], G[2], G[0])

def paper(d, x, y, width=7, height=6, tint='paper'):
    rect(d, (x, y, x+width, y+height), tint, 'grey')
    line(d, (x+2, y+2, x+width-1, y+2), 'darkgrey')
    line(d, (x+2, y+4, x+width-2, y+4), 'grey')

def prop(i):
    im = empty()
    d = ImageDraw.Draw(im)
    if i not in (6, 55, 62, 108, 123): shadow(d)
    if i == 0:
        for x in (5, 24): rect(d, (x, 21, x+3, 28), STONE[0], 'ink')
        poly(d, [(2, 15), (6, 11), (12, 9), (20, 9), (26, 11), (30, 15), (29, 23), (22, 20), (10, 20), (3, 23)], STONE[1], 'ink')
        line(d, (4, 15, 8, 13, 13, 12, 19, 12, 24, 13, 28, 15), STONE[2], 2)
        line(d, (5, 22, 11, 19, 21, 19, 27, 22), STONE[0])
        line(d, (10, 12, 10, 18), STONE[0]); line(d, (22, 12, 22, 18), STONE[0])
    elif i == 1:
        wheel(d, 7, 28); wheel(d, 25, 28)
        wb(d, (3, 15, 28, 26)); wb(d, (2, 12, 29, 16), 2)
        rect(d, (7, 5, 13, 12), M[1], 'ink'); rect(d, (7, 4, 13, 6), M[0], 'ink')
        line(d, (9, 6, 9, 10), M[2]); line(d, (13, 7, 16, 7, 16, 10, 13, 10), M[0], 2)
        scene.cup(d, 20, 7); scene.cup(d, 25, 9)
        label(d, (9, 19, 22, 24), 'amberlight', 1)
        line(d, (27, 14, 30, 10, 30, 21), M[1], 2)
    elif i == 2:
        mb(d, (1, 26, 30, 29), 0)
        for x, y in ((5, 9), (13, 5), (21, 10)):
            ell(d, (x, y, x+7, 27), M[0], 'ink')
            ell(d, (x+2, y+2, x+5, 25), (0, 0, 0, 0))
            line(d, (x+1, y+4, x+1, 24), M[2])
            line(d, (x+6, y+4, x+6, 25), M[1])
    elif i == 3:
        mb(d, (10, 12, 21, 28), 0)
        ell(d, (5, 6, 26, 14), M[1], 'ink'); ell(d, (8, 7, 23, 11), GLASS[0], 'ink')
        line(d, (20, 8, 20, 3, 23, 3), M[2], 2)
        mb(d, (20, 20, 29, 24)); line(d, (25, 21, 25, 17, 28, 17), M[2], 2)
        line(d, (13, 16, 13, 24), M[2]); ell(d, (8, 27, 24, 30), STONE[1], 'ink')
    elif i == 4:
        legs(d, (5, 25), 23, metal=True)
        poly(d, [(2, 12), (23, 8), (30, 18), (9, 22)], STONE[1], 'ink')
        poly(d, [(2, 12), (23, 8), (30, 15), (9, 19)], STONE[2], 'ink')
        for row in range(4):
            for col in range(4):
                if (row+col)%2 == 0: poly(d, [(6+col*4+row, 12+row), (9+col*4+row, 11+row), (10+col*4+row, 13+row), (7+col*4+row, 14+row)], STONE[0])
        ell(d, (8, 23, 13, 27), W[2], 'ink'); rect(d, (9, 27, 12, 30), W[0], 'ink')
        ell(d, (21, 21, 26, 25), W[2], 'ink'); rect(d, (22, 25, 25, 29), W[0], 'ink')
    elif i == 5:
        legs(d, (7, 23), 12, metal=True)
        wb(d, (2, 9, 29, 14), 2); mb(d, (7, 15, 25, 20), 0)
        for x in (11, 18):
            rect(d, (x, 16, x+4, 19), 'paper', 'ink'); rect(d, (x+1, 17, x+1, 17), M[0]); rect(d, (x+3, 17, x+3, 17), M[0])
        paper(d, 7, 5, 8, 5); scene.cup(d, 24, 4)
        line(d, (9, 21, 9, 24, 16, 24, 16, 27), M[0])
    elif i == 6:
        wb(d, (3, 4, 28, 11), 0)
        for x in (7, 15, 23):
            line(d, (x, 8, x, 16, x-2, 16), M[1], 2)
            line(d, (x, 9, x, 14), M[2])
        rect(d, (6, 17, 13, 26), F[0], 'ink'); rect(d, (7, 18, 12, 24), F[1]); line(d, (8, 19, 11, 19), F[2])
        line(d, (8, 17, 8, 14, 11, 14, 11, 17), F[0])
        poly(d, [(20, 16), (27, 16), (26, 27), (21, 27)], 'coraldark', 'ink')
        line(d, (21, 18, 25, 18), 'corallight')
    elif i == 7:
        poly(d, [(2, 16), (27, 13), (30, 20), (5, 23)], STONE[2], 'ink')
        poly(d, [(5, 23), (30, 20), (28, 28), (7, 30)], STONE[1], 'ink')
        poly(d, [(5, 18), (25, 16), (27, 19), (7, 22)], W[0], 'ink')
        for x, y in ((9, 16), (16, 14), (23, 13)):
            leaf(d, x, y); ell(d, (x-2, y-5, x+2, y-1), 'coral', 'coraldark'); rect(d, (x, y-3, x, y-3), 'amberlight')
        line(d, (9, 25, 25, 23), STONE[0]); line(d, (9, 26, 24, 25), STONE[2])
    elif i == 8:
        wb(d, (4, 8, 27, 29), 0); ell(d, (4, 1, 27, 19), W[1], 'ink')
        rect(d, (6, 9, 25, 27), W[0]); ell(d, (7, 4, 24, 14), W[0])
        for y in (13, 21, 28): wb(d, (5, y, 26, y+1), 2)
        for y in (8, 16, 23):
            for x, tint, h in ((7, 'coral', 4), (12, 'amber', 5), (17, 'violet', 4), (22, 'cyandark', 4)):
                rect(d, (x, y, x+2, y+h), tint, 'ink'); line(d, (x+1, y+1, x+1, y+2), 'paper')
        line(d, (7, 5, 12, 3, 20, 3, 25, 6), W[2])
    elif i == 9:
        legs(d, (6, 24), 24)
        poly(d, [(4, 9), (20, 6), (25, 16), (9, 21)], F[0], 'ink')
        poly(d, [(6, 10), (19, 8), (22, 15), (10, 18)], F[1], 'ink')
        poly(d, [(8, 19), (25, 16), (29, 24), (12, 28)], F[1], 'ink')
        line(d, (9, 21, 25, 18), F[2]); line(d, (7, 12, 18, 10), F[2])
        wb(d, (2, 17, 6, 25)); wb(d, (26, 13, 29, 23))
        rect(d, (4, 24, 12, 26), W[0], 'ink'); rect(d, (22, 26, 30, 29), W[2], 'ink')
    elif i == 10:
        legs(d, (5, 25), 22)
        poly(d, [(6, 3), (26, 3), (27, 23), (3, 23)], W[1], 'ink')
        for y in (10, 18, 25): wb(d, (3, y, 28, y+2), 0)
        for x, y, tint in ((7, 4, 'corallight'), (17, 5, 'paper'), (6, 12, 'amberlight'), (17, 12, 'violetlight'), (7, 20, 'cyanlight'), (17, 20, 'paper')):
            paper(d, x, y, 7, 5, tint)
        line(d, (5, 3, 26, 3), W[2]); line(d, (4, 24, 27, 24), W[2])
    elif i == 11:
        wb(d, (3, 22, 28, 28), 0); wb(d, (3, 10, 28, 15), 2)
        for x in (7, 23):
            rect(d, (x, 4, x+2, 24), M[0], 'ink'); line(d, (x+1, 5, x+1, 23), M[2])
            ell(d, (x-3, 2, x+5, 5), W[1], 'ink'); line(d, (x-2, 3, x+4, 3), W[2])
        rect(d, (11, 17, 21, 22), 'paper', 'ink'); rect(d, (11, 21, 21, 22), 'coraldark')
        line(d, (5, 12, 26, 12), W[0]); line(d, (4, 25, 27, 25), W[2])
    elif i == 12:
        for x in (6, 25):
            line(d, (x, 3, x-2, 27), W[0], 3); line(d, (x, 4, x-2, 25), W[2])
            wheel(d, x-2, 29)
        for y in (8, 14, 20, 26): wb(d, (6-y//14, y, 25-y//14, y+2), 1)
        mb(d, (4, 2, 28, 4), 0); line(d, (6, 3, 26, 3), M[2])
        line(d, (4, 26, 27, 26), M[1]); line(d, (27, 27, 29, 28), M[2])
    elif i == 13:
        legs(d, (5, 25), 22)
        wb(d, (3, 6, 28, 15), 0); wb(d, (2, 13, 29, 24), 2)
        rect(d, (2, 6, 5, 20), W[1], 'ink'); rect(d, (26, 6, 29, 20), W[1], 'ink')
        paper(d, 8, 15, 11, 6); rect(d, (21, 17, 22, 21), 'navy')
        rect(d, (10, 7, 20, 11), F[1], 'ink'); line(d, (11, 8, 19, 8), F[2]); line(d, (11, 10, 19, 10), F[0])
    elif i == 14:
        wb(d, (10, 19, 22, 28), 0); wb(d, (7, 27, 25, 30), 2)
        poly(d, [(3, 9), (24, 6), (29, 17), (7, 22)], W[1], 'ink')
        poly(d, [(6, 9), (16, 10), (26, 7), (28, 16), (17, 19), (8, 18)], 'paper', 'ink')
        line(d, (16, 10, 17, 19), W[0])
        for x, y in ((9, 12), (20, 11), (10, 15), (21, 14)): line(d, (x, y, x+4, y-1), 'grey')
        line(d, (7, 22, 29, 18), W[2])
    elif i == 15:
        for x in (3, 16, 28): legs(d, (x,), 24, metal=True)
        poly(d, [(2, 4), (14, 2), (14, 25), (2, 27)], F[0], 'ink')
        poly(d, [(15, 2), (28, 5), (28, 27), (15, 25)], F[1], 'ink')
        for x in (5, 8, 11): line(d, (x, 6, x, 23), F[1])
        for y in (8, 14, 20): line(d, (17, y, 25, y+1), F[2])
        line(d, (3, 5, 12, 4), F[2]); line(d, (17, 24, 26, 26), F[0])
    elif i == 16:
        legs(d, (8, 21), 19)
        poly(d, [(2, 13), (8, 7), (23, 7), (30, 13), (24, 21), (8, 21)], W[2], 'ink')
        line(d, (4, 14, 28, 14), W[0]); line(d, (7, 10, 25, 10), W[1]); line(d, (7, 18, 25, 18), W[1])
        for x in (2, 25):
            wb(d, (x, 21, x+5, 24), 1); legs(d, (x+1,), 24)
        scene.cup(d, 13, 9)
    elif i == 17:
        for x in (5, 24): rect(d, (x, 24, x+3, 29), W[0], 'ink')
        ell(d, (1, 16, 29, 28), W[1], 'ink'); rect(d, (5, 15, 26, 25), W[1])
        ell(d, (1, 15, 8, 26), W[2], 'ink'); ell(d, (3, 17, 6, 23), W[0])
        line(d, (8, 17, 25, 17), W[2]); line(d, (9, 22, 25, 22), W[0]); line(d, (12, 19, 20, 19), '#997253')
    elif i == 18:
        mb(d, (13, 10, 18, 28), 0); ell(d, (7, 26, 24, 30), M[1], 'ink')
        line(d, (15, 27, 15, 15), M[2]); rect(d, (12, 10, 19, 14), M[1], 'ink')
        for x in (8, 20):
            poly(d, [(x, 5), (x+4, 3), (x+7, 9), (x+1, 12)], M[0], 'ink')
            ell(d, (x+1, 4, x+4, 7), GLASS[2], 'ink'); line(d, (x+2, 8, x+5, 8), M[2])
        line(d, (12, 11, 23, 11), M[1], 2)
    elif i == 19:
        legs(d, (4, 25), 21)
        wb(d, (2, 4, 29, 23), 2)
        for x in (5, 17):
            rect(d, (x, 9, x+9, 14), W[0], 'ink'); line(d, (x+1, 10, x+8, 10), W[1])
        for y in (6, 18, 21): line(d, (4, y, 27, y), W[0])
        poly(d, [(7, 5), (8, 1), (13, 1), (15, 5)], G[1], G[0]); line(d, (9, 2, 12, 2), G[2])
    elif i == 20:
        legs(d, (5, 24), 21)
        poly(d, [(1, 8), (7, 2), (24, 2), (30, 8)], F[0], 'ink'); line(d, (6, 5, 25, 5), F[2])
        wb(d, (4, 8, 27, 25), 0); rect(d, (6, 10, 25, 22), 'paper', 'ink')
        line(d, (8, 19, 11, 14, 16, 17, 20, 12, 23, 12), G[0], 2)
        ell(d, (16, 10, 20, 14), GLASS[1]); rect(d, (9, 12, 10, 13), 'coraldark')
    elif i == 21:
        mb(d, (1, 20, 29, 27), 0); rect(d, (3, 18, 27, 22), F[1], 'ink')
        line(d, (4, 19, 25, 19), F[2]); line(d, (5, 23, 26, 23), F[0])
        mb(d, (23, 4, 26, 20)); line(d, (24, 5, 24, 17), M[2])
        line(d, (24, 5, 18, 5, 18, 9), M[2], 2); line(d, (24, 13, 29, 13, 29, 21), M[0])
        for x in (8, 14, 20): rect(d, (x, 24, x+1, 25), M[2])
    elif i == 22:
        tabletop(d, (3, 17, 29, 23))
        ell(d, (6, 6, 24, 19), W[0], 'ink'); rect(d, (6, 12, 24, 19), W[2], 'ink')
        ell(d, (8, 8, 22, 14), W[1], 'ink'); line(d, (7, 15, 23, 15), W[0])
        for x in (10, 14, 18, 22): line(d, (x, 14, x, 18), W[0])
        poly(d, [(11, 7), (21, 7), (23, 14), (10, 14)], F[1], 'ink'); line(d, (12, 8, 20, 8), F[2]); line(d, (12, 12, 21, 12), F[0])
    elif i == 23:
        wb(d, (14, 11, 17, 29), 0); wb(d, (11, 27, 20, 30), 2)
        poly(d, [(7, 8), (16, 2), (25, 8)], W[0], 'ink'); rect(d, (9, 8, 23, 19), W[1], 'ink')
        ell(d, (13, 10, 18, 15), 'ink'); line(d, (14, 17, 19, 17), W[2])
        line(d, (9, 7, 16, 3, 23, 7), W[2]); line(d, (17, 21, 24, 21), W[2], 2)
    elif i == 24:
        wb(d, (2, 17, 29, 27)); wb(d, (1, 14, 30, 18), 2)
        mb(d, (14, 6, 17, 14), 0); line(d, (5, 5, 26, 5), M[2], 2)
        for x in (6, 25):
            line(d, (x, 5, x-3, 11, x+3, 11, x, 5), M[1])
            ell(d, (x-4, 10, x+4, 13), M[1], 'ink')
        mb(d, (10, 12, 22, 15)); label(d, (9, 20, 22, 25), 'paper', 1)
    elif i == 25:
        wheel(d, 6, 28); wheel(d, 25, 28)
        mb(d, (3, 11, 28, 25)); rect(d, (4, 13, 27, 23), F[1], 'ink')
        rect(d, (5, 14, 26, 15), F[2]); rect(d, (13, 18, 19, 22), F[0], 'ink')
        poly(d, [(2, 9), (25, 6), (29, 12), (5, 15)], 'white', 'ink')
        line(d, (5, 11, 25, 8), M[1]); line(d, (28, 16, 30, 16, 30, 24), M[0], 2)
        rect(d, (8, 9, 13, 10), M[2], 'ink')
    elif i == 26:
        for x in (3, 27): legs(d, (x,), 14)
        for x0, y0, x1, y1 in ((7, 5, 25, 11), (5, 12, 27, 18), (2, 20, 29, 27)):
            wb(d, (x0, y0, x1, y1), 1)
            for x in range(x0+4, x1, 6): leaf(d, x, y0+3)
            line(d, (x0+1, y1-1, x1-1, y1-1), W[2])
        label(d, (10, 27, 21, 30), 'paper', 0)
    elif i == 27:
        wb(d, (2, 8, 29, 27), 0)
        for x in (4, 17):
            rect(d, (x, 10, x+10, 24), F[1], 'ink'); rect(d, (x+1, 11, x+9, 12), F[2])
            poly(d, [(x+2, 23), (x+2, 17), (x+8, 14), (x+8, 23)], 'amberlight', 'amberdark')
            label(d, (x+2, 13, x+8, 16), 'paper', 0)
            line(d, (x+5, 20, x+8, 18), M[2], 2)
        wb(d, (1, 26, 30, 29), 2); scene.cup(d, 6, 2)
    elif i == 28:
        wheel(d, 6, 29); wheel(d, 26, 29)
        mb(d, (2, 15, 29, 26), 0); wb(d, (2, 24, 29, 27), 2)
        for x in (7, 22):
            ell(d, (x-5, 6, x+5, 17), M[0], 'ink'); ell(d, (x-4, 5, x+4, 13), M[1], 'ink')
            ell(d, (x-2, 4, x+2, 6), M[0], 'ink'); line(d, (x-2, 7, x+2, 7), M[2])
        label(d, (10, 18, 21, 23), 'amberlight', 1)
        line(d, (27, 14, 30, 14, 30, 20), M[2], 2)
    elif i == 29:
        wb(d, (3, 4, 28, 28), 0)
        for x, grain in ((5, 'amberlight'), (13, '#d5aa74'), (21, '#7d5941')):
            poly(d, [(x, 6), (x+6, 6), (x+6, 17), (x+4, 21), (x+2, 21), (x, 17)], GLASS[1], 'ink')
            rect(d, (x+1, 9, x+5, 16), grain); line(d, (x+1, 7, x+1, 9), GLASS[2])
            mb(d, (x+1, 21, x+5, 23), 0); line(d, (x+3, 23, x+3, 26), M[2])
        wb(d, (3, 27, 28, 30), 2); scene.cup(d, 12, 24)
    elif i == 30:
        tabletop(d, (1, 14, 30, 23))
        poly(d, [(3, 15), (20, 12), (27, 19), (10, 22)], F[1], 'ink')
        for x in (7, 13, 19): line(d, (x, 15, x+4, 20), F[2])
        line(d, (8, 17, 23, 17), F[0]); ell(d, (3, 8, 11, 16), F[0], 'ink')
        ell(d, (3, 8, 7, 15), F[2], 'ink'); line(d, (22, 11, 27, 17), M[2], 2)
        line(d, (22, 11, 24, 9), M[0]); rect(d, (23, 22, 28, 23), 'amberlight', 'ink')
    elif i == 31:
        wheel(d, 7, 28, 3); wheel(d, 25, 28, 3)
        line(d, (24, 27, 25, 3, 30, 3), M[0], 3); line(d, (25, 25, 26, 4, 29, 4), M[2])
        mb(d, (3, 24, 27, 27), 1)
        for box in ((5, 14, 23, 23), (8, 5, 22, 13)):
            wb(d, box, 2); line(d, (box[0]+2, box[1]+3, box[2]-2, box[1]+3), W[0]); line(d, (box[0]+2, box[3]-2, box[2]-2, box[3]-2), W[0])
        label(d, (12, 17, 18, 21), 'paper', 0)
    elif i == 32:
        poly(d, [(2, 13), (24, 7), (30, 15), (8, 22)], W[2], 'ink')
        poly(d, [(8, 22), (30, 15), (29, 26), (8, 30)], W[1], 'ink')
        poly(d, [(4, 13), (23, 9), (27, 15), (9, 20)], GLASS[1], 'ink')
        line(d, (5, 13, 10, 18), GLASS[2]); line(d, (13, 11, 20, 16), W[0]); line(d, (8, 15, 26, 12), W[0])
        line(d, (11, 24, 27, 20), W[0]); leaf(d, 17, 16)
    elif i == 33:
        legs(d, (4, 25), 21); wb(d, (3, 7, 28, 11), 0); wb(d, (1, 17, 30, 22), 2)
        wb(d, (4, 26, 27, 29), 1)
        for x in (7, 16, 24):
            poly(d, [(x-3, 13), (x+3, 13), (x+2, 18), (x-2, 18)], 'brown', 'ink'); ell(d, (x-3, 11, x+3, 14), W[0], 'ink')
        leaf(d, 16, 11); line(d, (6, 9, 6, 15), M[2]); poly(d, [(4, 13), (8, 13), (6, 17)], M[1], 'ink')
    elif i == 34:
        legs(d, (4, 25), 18, metal=True)
        mb(d, (2, 11, 29, 21), 1); ell(d, (5, 11, 25, 18), GLASS[0], 'ink')
        ell(d, (7, 12, 23, 16), GLASS[1]); line(d, (9, 13, 21, 13), GLASS[2])
        line(d, (23, 11, 23, 3, 17, 3, 17, 7), M[2], 2); line(d, (21, 7, 25, 7), M[0], 2)
        line(d, (15, 21, 15, 27, 21, 27), M[1], 2); rect(d, (3, 7, 8, 10), 'coral', 'coraldark')
    elif i == 35:
        wb(d, (4, 4, 27, 29), 0); poly(d, [(2, 5), (16, 1), (29, 5)], W[2], 'ink')
        for y in (7, 16):
            for x in (6, 16):
                wb(d, (x, y, x+9, y+8), 1); label(d, (x+2, y+2, x+7, y+5), 'paper', 0)
                rect(d, (x+4, y+6, x+5, y+6), M[2])
        leaf(d, 17, 26); line(d, (6, 28, 25, 28), W[2])
    elif i == 36:
        legs(d, (4, 25), 15)
        poly(d, [(2, 10), (26, 7), (30, 13), (6, 17)], W[2], 'ink')
        poly(d, [(6, 17), (30, 13), (28, 22), (7, 26)], W[1], 'ink')
        poly(d, [(5, 11), (24, 9), (27, 13), (8, 15)], W[0], 'ink')
        for x, y in ((10, 9), (17, 8), (23, 7)): leaf(d, x, y)
        line(d, (9, 20, 26, 17), W[0]); line(d, (9, 23, 26, 20), W[2])
    elif i == 37:
        wheel(d, 7, 28, 3); wheel(d, 26, 28, 3)
        line(d, (5, 27, 7, 7, 26, 7, 27, 27), M[0], 3); line(d, (8, 8, 24, 8), M[2])
        ell(d, (7, 7, 25, 25), G[0], 'ink'); ell(d, (10, 10, 22, 22), G[1], 'ink')
        ell(d, (13, 13, 19, 19), G[0], 'ink'); line(d, (10, 15, 15, 10, 20, 15), G[2])
        line(d, (24, 20, 29, 21, 29, 27), G[1], 2); mb(d, (27, 25, 30, 28), 1)
    elif i == 38:
        tabletop(d, (2, 17, 29, 23))
        poly(d, [(4, 7), (24, 5), (29, 14), (8, 17)], W[1], 'ink')
        poly(d, [(7, 8), (23, 7), (26, 13), (9, 15)], M[0], 'ink')
        for x in range(10, 26, 4): line(d, (x, 8, x-1, 14), M[1])
        for y in (9, 12): line(d, (9, y, 25, y), M[2])
        rect(d, (12, 23, 22, 28), W[0], 'ink'); line(d, (13, 24, 21, 24), W[2])
    elif i == 39:
        legs(d, (3, 26), 4); line(d, (3, 4, 28, 4), W[2], 2)
        for x, y in ((7, 9), (16, 13), (24, 9)):
            line(d, (x, 4, x, y), M[2]); line(d, (x, y, x-2, y+7), G[0], 2)
            for yy in (y+1, y+4, y+7):
                poly(d, [(x, yy), (x-5, yy+2), (x-4, yy+4), (x-1, yy+2)], G[1], G[0])
                poly(d, [(x, yy), (x+3, yy+3), (x+2, yy+5), (x-1, yy+2)], G[2], G[0])
            line(d, (x-2, y+1, x+2, y+1), F[0])
        wb(d, (2, 28, 29, 30), 0)
    elif i == 40:
        legs(d, (4, 25), 24)
        wb(d, (3, 4, 28, 28), 0); rect(d, (5, 7, 26, 26), F[1], 'ink')
        for x in (7, 14, 21): rect(d, (x, 7, x+2, 26), F[2])
        rect(d, (11, 7, 12, 26), F[0]); rect(d, (25, 7, 26, 26), F[0])
        poly(d, [(2, 5), (6, 1), (24, 1), (30, 5)], W[2], 'ink')
        label(d, (10, 1, 20, 5), 'paper', 0)
    elif i == 41:
        for x in (8, 21):
            line(d, (x, 14, x-3, 29), W[0], 3); line(d, (x, 15, x-2, 28), W[2])
        wb(d, (7, 3, 23, 13), 2); rect(d, (9, 5, 21, 11), F[1], 'ink'); line(d, (10, 6, 20, 6), F[2])
        wb(d, (5, 12, 25, 16), 1); rect(d, (6, 12, 24, 14), F[0])
        for y in (19, 23, 27): line(d, (8, y, 21, y), W[1], 2)
        line(d, (5, 7, 5, 16, 24, 16, 24, 7), W[0], 2)
    elif i == 42:
        line(d, (5, 26, 22, 10), W[0], 2); line(d, (14, 15, 27, 27), W[0], 2)
        poly(d, [(4, 7), (15, 5), (20, 14), (27, 22), (14, 25), (8, 16)], F[0], 'ink')
        poly(d, [(6, 8), (14, 7), (18, 15), (25, 21), (14, 23), (10, 15)], F[1], 'ink')
        for y in (10, 15, 20): line(d, (9, y, 15+y//6, y-1), F[2])
        line(d, (5, 27, 12, 27), W[2]); line(d, (23, 27, 29, 27), W[2])
    elif i == 43:
        mb(d, (13, 5, 17, 29), 0); line(d, (15, 28, 15, 6), M[2])
        line(d, (15, 6, 15, 3, 24, 3), M[1], 2); ell(d, (21, 3, 29, 6), M[1], 'ink')
        line(d, (23, 4, 27, 4), M[2]); line(d, (11, 16, 20, 16), M[2], 2)
        ell(d, (6, 27, 25, 30), STONE[1], 'ink'); line(d, (9, 28, 21, 28), STONE[2])
        rect(d, (14, 17, 16, 19), F[1], 'ink')
    elif i == 44:
        legs(d, (4, 26), 7, metal=True); mb(d, (3, 5, 29, 8), 0)
        ell(d, (6, 8, 24, 26), 'coral', 'ink'); ell(d, (10, 12, 20, 22), (0, 0, 0, 0))
        line(d, (8, 9, 10, 12), 'white', 3); line(d, (20, 22, 23, 24), 'white', 3)
        line(d, (7, 24, 4, 28, 26, 28, 24, 24), W[2], 2)
        rect(d, (26, 12, 29, 23), F[0], 'ink'); line(d, (27, 13, 27, 21), F[2])
    elif i == 45:
        line(d, (15, 7, 15, 29), W[0], 2); ell(d, (10, 27, 20, 30), W[1], 'ink')
        poly(d, [(1, 12), (6, 5), (15, 2), (25, 5), (31, 12)], F[0], 'ink')
        poly(d, [(5, 10), (15, 3), (13, 11)], F[2]); poly(d, [(17, 3), (27, 10), (19, 11)], F[1])
        wb(d, (7, 21, 26, 24), 2); legs(d, (9, 23), 24)
        scene.cup(d, 21, 17)
    elif i == 46:
        wb(d, (14, 2, 18, 29), 0); wb(d, (7, 27, 25, 30), 2)
        line(d, (6, 9, 26, 9), M[1], 2); line(d, (7, 10, 7, 13), M[2]); line(d, (25, 10, 25, 13), M[2])
        rect(d, (3, 13, 11, 25), F[0], 'ink'); rect(d, (4, 14, 10, 24), F[1]); line(d, (5, 16, 9, 16), F[2])
        rect(d, (21, 13, 29, 26), 'coraldark', 'ink'); rect(d, (22, 16, 28, 18), 'corallight'); rect(d, (22, 21, 28, 23), 'coral')
    elif i == 47:
        legs(d, (5, 25), 23)
        poly(d, [(2, 12), (24, 9), (30, 18), (8, 23)], W[2], 'ink')
        poly(d, [(5, 13), (23, 11), (27, 17), (9, 20)], F[1], 'ink')
        ell(d, (9, 14, 14, 18), 'paper', 'grey'); line(d, (10, 15, 13, 16), 'amberdark')
        poly(d, [(18, 13), (21, 12), (24, 15), (20, 17)], 'corallight', 'coraldark')
        paper(d, 4, 7, 10, 4); line(d, (10, 22, 28, 19), W[0])
    elif i == 48:
        legs(d, (5, 25), 22); wb(d, (3, 8, 28, 24), 0)
        wb(d, (2, 6, 29, 10), 2); rect(d, (4, 16, 27, 22), 'paper', 'ink')
        for x in range(6, 27, 4): rect(d, (x, 16, x+1, 19), 'ink')
        poly(d, [(2, 4), (7, 1), (25, 1), (30, 4)], F[0], 'ink'); line(d, (6, 3, 25, 3), F[2])
        rect(d, (8, 10, 24, 14), W[1]); line(d, (10, 11, 21, 11), W[2])
    elif i == 49:
        poly(d, [(2, 8), (25, 5), (30, 9), (7, 13)], W[2], 'ink')
        poly(d, [(7, 13), (30, 9), (30, 18), (7, 23)], W[0], 'ink')
        poly(d, [(4, 16), (25, 13), (29, 19), (8, 23)], W[1], 'ink')
        poly(d, [(2, 22), (25, 19), (29, 25), (7, 29)], W[2], 'ink')
        line(d, (8, 27, 27, 24), W[0]); line(d, (8, 21, 26, 18), W[0]); line(d, (8, 11, 27, 8), W[1])
    elif i == 50:
        line(d, (5, 22, 3, 29), W[0], 3); line(d, (25, 22, 29, 29), W[0], 3)
        poly(d, [(3, 22), (9, 18), (15, 24), (24, 18), (29, 22), (15, 28)], W[2], 'ink')
        poly(d, [(6, 8), (26, 8), (23, 22), (9, 22)], W[1], 'ink')
        ell(d, (5, 5, 27, 12), 'paper', 'ink'); ell(d, (8, 7, 24, 10), 'amberlight', 'amberdark')
        for x in (9, 14, 20, 24): line(d, (x, 11, x-1, 20), F[0])
        line(d, (11, 20, 22, 20), W[0])
    elif i == 51:
        legs(d, (6, 23), 21); wb(d, (3, 3, 28, 24), 0)
        rect(d, (5, 5, 26, 22), 'paper', 'ink'); rect(d, (7, 7, 24, 9), 'coral')
        for y in (12, 16, 20):
            rect(d, (7, y, 9, y+1), 'amber'); line(d, (12, y, 24, y), 'darkgrey')
        line(d, (4, 4, 27, 4), W[2]); line(d, (11, 27, 20, 27), W[1], 2)
    elif i == 52:
        for x, y in ((2, 17), (14, 14)):
            wb(d, (x, y, x+15, y+12), 1); line(d, (x+2, y+3, x+13, y+3), W[0]); line(d, (x+2, y+9, x+13, y+9), W[2])
            for xx, tint in ((x+4, 'violet'), (x+9, 'coral')):
                rect(d, (xx, y-9, xx+5, y+2), 'navy', 'ink'); ell(d, (xx+1, y-6, xx+4, y-1), tint, 'ink')
                rect(d, (xx+2, y-4, xx+2, y-4), 'amberlight')
        paper(d, 4, 20, 8, 4)
    elif i == 53:
        legs(d, (3, 14, 27), 22, metal=True)
        for box in ((2, 4, 13, 25), (14, 2, 28, 23)):
            rect(d, box, F[0], 'ink'); rect(d, (box[0]+2, box[1]+2, box[2]-1, box[3]-2), F[1])
            line(d, (box[0]+3, box[1]+3, box[2]-2, box[1]+3), F[2])
            for y in range(box[1]+6, box[3]-1, 5): line(d, (box[0]+2, y, box[2]-1, y), F[0])
        rect(d, (7, 2, 9, 5), M[2], 'ink')
    elif i == 54:
        mb(d, (13, 12, 17, 27), 0); line(d, (15, 27, 5, 30), M[1], 2); line(d, (15, 27, 26, 30), M[1], 2)
        line(d, (15, 15, 4, 15, 4, 7), M[2], 2); line(d, (15, 15, 25, 15, 25, 4), M[2], 2)
        poly(d, [(2, 5), (8, 5), (9, 10), (3, 10)], 'amber', 'ink'); ell(d, (3, 5, 7, 7), 'amberlight', 'amberdark')
        line(d, (23, 4, 23, 10, 20, 12), 'amberdark', 3); line(d, (24, 4, 24, 10, 21, 12), 'amberlight')
        ell(d, (17, 10, 22, 14), 'amber', 'ink')
    elif i == 55:
        legs(d, (3, 26), 5); wb(d, (2, 3, 29, 6), 2)
        poly(d, [(6, 6), (25, 6), (23, 20), (15, 25), (7, 20)], F[1], 'ink')
        line(d, (8, 8, 23, 8), F[2]); line(d, (9, 20, 21, 20), F[0])
        line(d, (14, 10, 14, 17, 12, 18), 'paper', 2); line(d, (14, 10, 19, 9, 19, 15, 17, 16), 'paper', 2)
        rect(d, (2, 27, 7, 30), W[0], 'ink'); rect(d, (25, 27, 30, 30), W[0], 'ink')
    elif i == 56:
        wb(d, (3, 3, 29, 28), 0); wb(d, (5, 5, 27, 14), 1)
        line(d, (8, 7, 24, 7), W[2]); wb(d, (2, 15, 30, 23), 2)
        rect(d, (4, 15, 28, 19), 'white', 'ink')
        for x in (7, 11, 16, 20, 24): rect(d, (x, 15, x+1, 17), 'ink')
        rect(d, (4, 23, 27, 27), W[1]); line(d, (14, 28, 20, 28), 'amber', 2)
        legs(d, (4, 26), 28, 30)
    elif i == 57:
        line(d, (5, 29, 24, 16), M[0], 3); line(d, (25, 29, 6, 16), M[0], 3)
        line(d, (7, 15, 9, 9), M[1], 2); line(d, (25, 15, 23, 9), M[2], 2)
        for x0, y0, x1, y1 in ((2, 13, 30, 18), (5, 5, 27, 10)):
            mb(d, (x0, y0, x1, y1), 0); rect(d, (x0+2, y0+1, x1-2, y1-1), 'paper')
            for x in range(x0+4, x1-1, 4): rect(d, (x, y0+1, x+1, y0+2), 'ink')
        line(d, (7, 21, 25, 21), M[2])
    elif i == 58:
        line(d, (15, 7, 15, 25), M[0], 3); line(d, (16, 9, 16, 25), M[2])
        for x, y in ((4, 30), (26, 30), (17, 30)): line(d, (15, 25, x, y), M[1], 2)
        rect(d, (12, 3, 17, 12), M[1], 'ink'); line(d, (14, 4, 14, 9), M[2])
        ell(d, (20, 2, 29, 13), F[0], 'ink'); ell(d, (22, 4, 27, 11), F[1])
        line(d, (21, 7, 21, 18, 16, 18), M[2]); line(d, (22, 5, 26, 5), F[2])
    elif i == 59:
        mb(d, (3, 12, 28, 28), 0)
        for y in (15, 21):
            rect(d, (5, y, 26, y+4), M[1], 'ink'); line(d, (6, y+1, 25, y+1), M[2])
            for x in (8, 14, 20): rect(d, (x, y+2, x+2, y+2), 'coral')
        poly(d, [(3, 12), (7, 5), (25, 5), (28, 12)], M[1], 'ink')
        for x in (7, 13, 19, 25):
            line(d, (x, 7, x, 11), M[0]); rect(d, (x-1, 8, x+1, 8), 'amber')
        line(d, (5, 6, 24, 6), M[2]); wheel(d, 6, 29); wheel(d, 25, 29)
    elif i == 60:
        ell(d, (6, 8, 26, 16), F[0], 'ink'); ell(d, (6, 5, 26, 13), F[1], 'ink')
        line(d, (10, 7, 22, 7), F[2]); line(d, (16, 15, 16, 25), M[2], 3)
        for x, y in ((4, 29), (27, 29), (18, 30)): line(d, (16, 24, x, y), M[0], 2)
        ell(d, (12, 20, 20, 23), M[1], 'ink'); line(d, (19, 22, 25, 22), M[2], 2)
    elif i == 61:
        legs(d, (5, 25), 24, metal=True)
        rect(d, (3, 3, 28, 27), F[0], 'ink'); rect(d, (5, 5, 26, 25), F[1], 'ink')
        for y in (8, 13, 18, 23):
            line(d, (7, y, 24, y), F[0]); line(d, (7, y-1, 24, y-1), F[2])
        wheel(d, 5, 29); wheel(d, 25, 29)
    elif i == 62:
        wb(d, (2, 2, 29, 6), 0)
        for x, tint in ((8, 'amber'), (23, 'coral')):
            line(d, (x, 6, x, 9), M[2], 2)
            ell(d, (x-4, 19, x+4, 29), tint, 'ink'); ell(d, (x-3, 15, x+3, 23), tint, 'ink')
            rect(d, (x-1, 8, x+1, 20), W[0], 'ink'); rect(d, (x-2, 7, x+2, 10), W[1], 'ink')
            ell(d, (x-1, 20, x+1, 22), 'ink'); line(d, (x+1, 12, x+1, 26), 'paper')
        line(d, (4, 4, 27, 4), W[2])
    elif i == 63:
        wheel(d, 6, 29); wheel(d, 25, 29)
        mb(d, (3, 5, 28, 27), 0); line(d, (4, 7, 26, 7), M[2])
        for x, y, r in ((10, 13, 5), (22, 19, 5)):
            ell(d, (x-r, y-r, x+r, y+r), M[1], 'ink'); ell(d, (x-r+2, y-r+2, x+r-2, y+r-2), M[0], 'ink')
            line(d, (x-2, y-3, x+2, y-3), M[2]); line(d, (x, y, x+5, y+4), F[0], 2)
        line(d, (25, 5, 30, 5, 30, 12), M[2], 2)
    elif i == 64:
        rect(d, (8, 15, 24, 28), STONE[1], 'ink'); poly(d, [(5, 14), (22, 11), (28, 17), (10, 20)], STONE[2], 'ink')
        poly(d, [(10, 7), (13, 4), (21, 4), (24, 10), (21, 15), (12, 14)], 'amberdark', 'ink')
        poly(d, [(13, 5), (19, 5), (21, 8), (15, 9)], 'amberlight')
        label(d, (11, 22, 21, 26), 'paper', 1); line(d, (10, 28, 22, 28), STONE[0])
    elif i == 65:
        poly(d, [(2, 18), (22, 10), (29, 17), (8, 28)], STONE[1], 'ink')
        poly(d, [(2, 18), (22, 10), (27, 13), (6, 23)], STONE[2], 'ink')
        line(d, (3, 17, 3, 9, 22, 2, 22, 10), M[0], 2)
        line(d, (9, 27, 9, 19, 29, 11, 29, 18), M[1], 2)
        line(d, (4, 9, 21, 3), M[2]); line(d, (10, 19, 28, 12), M[2])
        for y in (17, 21, 24): line(d, (10, y, 20, y-5), STONE[0])
    elif i == 66:
        legs(d, (3, 26), 6)
        poly(d, [(0, 10), (7, 2), (25, 2), (31, 10)], F[0], 'ink')
        poly(d, [(5, 8), (10, 3), (23, 3), (27, 8)], F[1]); line(d, (8, 4, 24, 4), F[2])
        label(d, (9, 11, 24, 18), 'paper', 2); line(d, (16, 10, 16, 11), M[2])
        wb(d, (3, 26, 8, 30), 0); wb(d, (24, 26, 29, 30), 0)
    elif i == 67:
        ell(d, (6, 12, 26, 28), STONE[0], 'ink'); ell(d, (4, 10, 28, 18), STONE[2], 'ink')
        ell(d, (7, 11, 25, 15), W[0], 'ink'); rect(d, (11, 26, 21, 30), STONE[1], 'ink')
        for x, y in ((10, 9), (16, 7), (23, 9)): leaf(d, x, y)
        line(d, (9, 20, 23, 20), STONE[1]); line(d, (11, 23, 21, 23), STONE[2])
    elif i == 68:
        legs(d, (5, 25), 24, metal=True)
        mb(d, (3, 3, 28, 26), 0); rect(d, (5, 5, 26, 23), 'paper', 'ink')
        poly(d, [(12, 7), (18, 6), (22, 9), (21, 13), (19, 18), (14, 21), (11, 16), (9, 13)], '#ae8b58', 'amberdark')
        line(d, (12, 9, 18, 11, 17, 16), 'coraldark', 2); ell(d, (15, 13, 17, 15), 'violetdark')
        line(d, (7, 21, 10, 21), M[1]); line(d, (22, 21, 24, 21), M[1])
    elif i == 69:
        tabletop(d, (2, 13, 29, 22))
        for x, y, tint in ((6, 14, 'amber'), (14, 13, 'coral'), (22, 12, 'violet')):
            rect(d, (x, y-4, x+5, y+2), tint, 'ink'); line(d, (x+1, y-3, x+4, y-3), 'paper')
            line(d, (x+2, y-2, x+2, y+1), 'ink')
        label(d, (9, 22, 22, 27), 'paper', 1); line(d, (4, 25, 5, 27), W[0])
    elif i == 70:
        wb(d, (2, 16, 29, 28), 0); wb(d, (1, 12, 30, 17), 2)
        rect(d, (3, 18, 28, 25), F[1], 'ink'); line(d, (5, 19, 26, 19), F[2]); line(d, (5, 24, 26, 24), F[0])
        paper(d, 5, 9, 9, 4); wb(d, (21, 4, 26, 13), 1)
        rect(d, (22, 6, 25, 8), 'paper'); rect(d, (22, 10, 25, 11), 'amberlight')
    elif i == 71:
        mb(d, (13, 9, 17, 28), 0); ell(d, (8, 26, 23, 30), M[1], 'ink')
        line(d, (15, 9, 15, 3, 23, 3), M[2], 2)
        poly(d, [(22, 1), (28, 3), (25, 9), (18, 7)], M[1], 'ink')
        line(d, (20, 7, 25, 8), 'amberlight', 2); line(d, (14, 12, 14, 24), M[2])
        label(d, (9, 16, 20, 21), 'paper', 1)
    elif i == 72:
        wb(d, (2, 7, 29, 28), 0); wb(d, (1, 5, 30, 9), 2)
        for y in (10, 15, 20, 25):
            wb(d, (3, y, 28, y+3), 1); line(d, (9, y+1, 13, y+1), M[2]); line(d, (20, y+1, 24, y+1), M[2])
            rect(d, (15, y+1, 18, y+2), 'paper')
        legs(d, (4, 26), 29, 30)
    elif i == 73:
        tabletop(d, (2, 19, 29, 24))
        poly(d, [(4, 17), (23, 8), (28, 19), (9, 23)], F[0], 'ink')
        poly(d, [(5, 16), (15, 12), (20, 19), (10, 22)], F[1], 'ink')
        poly(d, [(15, 12), (23, 9), (27, 18), (20, 19)], F[2], 'ink')
        paper(d, 7, 10, 16, 6); line(d, (13, 10, 13, 16), 'grey')
        line(d, (6, 24, 27, 22), W[2])
    elif i == 74:
        mb(d, (4, 12, 27, 28), 0); mb(d, (2, 10, 29, 14), 1)
        rect(d, (6, 16, 25, 25), F[1], 'ink'); line(d, (7, 17, 24, 17), F[2]); line(d, (8, 23, 23, 23), F[0])
        for x in (6, 18):
            rect(d, (x, 4, x+8, 10), 'paper', 'ink'); line(d, (x+1, 7, x+7, 7), M[0])
        poly(d, [(9, 5), (9, 1), (11, 1), (11, 4), (14, 3), (15, 6)], 'white', 'grey')
        label(d, (11, 19, 21, 23), 'paper', 0)
    elif i == 75:
        mb(d, (2, 25, 29, 29), 0)
        for x, y, tint in ((4, 8, 'coral'), (10, 4, 'amber'), (18, 7, 'violet')):
            poly(d, [(x, y+3), (x+8, y), (x+10, 20), (x+2, 24)], W[0], 'ink')
            poly(d, [(x+2, y+4), (x+7, y+2), (x+8, 19), (x+3, 21)], tint, 'ink')
            line(d, (x+1, y+3, x+8, y+1), W[2])
        line(d, (2, 28, 28, 28), M[2])
    elif i == 76:
        tabletop(d, (1, 16, 30, 23))
        poly(d, [(3, 12), (24, 8), (29, 16), (8, 21)], M[1], 'ink')
        poly(d, [(5, 13), (23, 10), (26, 16), (9, 19)], F[1], 'ink')
        ell(d, (8, 13, 14, 17), F[0]); ell(d, (18, 11, 24, 15), F[0])
        poly(d, [(9, 12), (12, 12), (13, 16), (10, 16)], 'amberdark', 'ink')
        rect(d, (19, 11, 22, 14), STONE[1], 'ink'); line(d, (6, 15, 8, 15), F[2]); line(d, (9, 22, 28, 18), M[2])
    elif i == 77:
        tabletop(d, (1, 15, 30, 23))
        paper(d, 7, 15, 11, 6); line(d, (25, 15, 25, 9, 20, 5), M[0], 2)
        line(d, (25, 16, 25, 9, 21, 5), M[2])
        ell(d, (9, 2, 23, 12), M[1], 'ink'); ell(d, (12, 4, 21, 10), GLASS[2], 'ink')
        line(d, (13, 5, 16, 5), 'white'); line(d, (11, 23, 28, 19), W[0])
    elif i == 78:
        mb(d, (5, 3, 26, 28), 0); rect(d, (7, 5, 24, 26), GLASS[0], 'ink')
        for y in (15, 24): rect(d, (8, y, 23, y+1), M[1], 'ink')
        rect(d, (10, 18, 19, 23), 'paper', 'ink'); rect(d, (10, 7, 20, 12), 'paper', 'ink')
        ell(d, (12, 6, 20, 14), M[0], 'ink'); ell(d, (13, 7, 19, 13), 'paper', 'ink')
        line(d, (16, 10, 18, 8), 'coraldark'); line(d, (8, 6, 8, 13), GLASS[2])
        line(d, (23, 17, 23, 21), M[2])
    elif i == 79:
        legs(d, (4, 26), 22, metal=True); mb(d, (3, 3, 29, 25), 0)
        for x in (5, 13, 21):
            for y in (6, 15):
                rect(d, (x, y, x+6, y+6), 'paper', 'ink'); rect(d, (x+1, y+1, x+5, y+4), 'navylight')
                poly(d, [(x+1, y+4), (x+3, y+2), (x+5, y+4)], 'greenlight')
                rect(d, (x+2, y-1, x+3, y), M[2], 'ink')
        line(d, (5, 24, 27, 24), M[2])
    elif i == 80:
        legs(d, (5, 25), 20, metal=True)
        poly(d, [(5, 4), (26, 4), (29, 19), (2, 23)], M[1], 'ink')
        poly(d, [(7, 6), (24, 6), (26, 17), (5, 20)], 'navy', 'ink')
        for x in (10, 16, 22): line(d, (x, 7, x-1, 18), 'navylight')
        for y in (10, 14, 18): line(d, (7, y, 24, y-1), 'navylight')
        mb(d, (8, 26, 23, 30), 0); rect(d, (10, 27, 14, 29), 'greenlight'); line(d, (27, 18, 29, 23, 22, 28), M[0])
    elif i == 81:
        tabletop(d, (2, 21, 29, 26))
        mb(d, (15, 10, 18, 22), 0); line(d, (16, 21, 16, 11), M[2])
        for points in ([(16, 10), (10, 3), (15, 2), (17, 8)], [(17, 10), (26, 8), (26, 13), (19, 12)], [(16, 11), (13, 20), (9, 17), (14, 12)]): poly(d, points, 'paper', 'ink')
        ell(d, (14, 8, 19, 13), 'amber', 'ink'); label(d, (5, 23, 12, 27), 'paper', 0)
    elif i == 82:
        wb(d, (13, 9, 17, 28), 0); wb(d, (9, 27, 22, 30), 2)
        poly(d, [(7, 6), (23, 6), (21, 10), (9, 10)], M[1], 'ink')
        rect(d, (10, 10, 20, 23), GLASS[1], 'ink'); rect(d, (11, 16, 19, 22), 'cyanlight')
        line(d, (12, 11, 12, 15), GLASS[2]); line(d, (18, 12, 20, 12), M[0]); line(d, (18, 15, 20, 15), M[0]); line(d, (18, 19, 20, 19), M[0])
        label(d, (4, 15, 9, 21), 'paper', 0); line(d, (10, 7, 20, 7), M[2])
    elif i == 83:
        tabletop(d, (1, 13, 30, 23))
        poly(d, [(4, 15), (24, 12), (28, 19), (9, 22)], 'paper', 'ink')
        line(d, (10, 13, 11, 6), W[0], 2); line(d, (20, 17, 20, 10), W[0], 2)
        poly(d, [(10, 14), (20, 16), (24, 20), (14, 20)], STONE[0])
        line(d, (7, 18, 11, 17), 'coraldark'); line(d, (7, 20, 11, 19), 'coraldark')
        label(d, (13, 24, 23, 27), 'paper', 0)
    elif i == 84:
        legs(d, (4, 25), 21)
        poly(d, [(2, 10), (25, 7), (29, 21), (5, 26)], W[2], 'ink')
        for x, y, tint in ((7, 12, STONE[1]), (17, 10, 'amberdark'), (10, 19, 'navylight'), (22, 17, '#a47464')):
            poly(d, [(x-2, y), (x, y-3), (x+3, y-2), (x+4, y+2), (x, y+3)], tint, 'ink')
            line(d, (x, y-1, x+2, y-1), 'paper')
        label(d, (10, 25, 24, 29), 'paper', 0); line(d, (3, 11, 26, 8), W[0])
    elif i == 85:
        wb(d, (14, 7, 18, 29), 0); wb(d, (9, 27, 23, 30), 2)
        line(d, (16, 15, 7, 7, 7, 2), W[1], 2); line(d, (16, 17, 25, 10, 25, 5), W[1], 2)
        line(d, (16, 21, 4, 18), W[2], 2); line(d, (17, 12, 17, 3), W[2], 2)
        for x, y, tint in ((2, 6, 'corallight'), (19, 10, 'cyanlight'), (11, 2, 'amberlight'), (2, 19, 'paper')):
            paper(d, x, y, 9, 5, tint)
    elif i == 86:
        tabletop(d, (2, 16, 29, 23))
        mb(d, (21, 12, 24, 18), 0); line(d, (23, 13, 23, 6, 17, 6), M[2], 2)
        ell(d, (8, 2, 20, 11), M[1], 'ink'); ell(d, (11, 4, 17, 8), GLASS[2], 'ink')
        rect(d, (9, 18, 18, 21), 'paper', 'ink'); leaf(d, 13, 15)
        label(d, (5, 24, 14, 27), 'paper', 0)
    elif i == 87:
        legs(d, (4, 26), 23, metal=True)
        mb(d, (2, 2, 29, 25), 0); rect(d, (4, 4, 27, 22), F[0], 'ink')
        for y in (8, 12, 16, 20): line(d, (6, y, 25, y), F[1])
        for x in (9, 15, 21): line(d, (x, 6, x, 20), F[1])
        line(d, (7, 18, 12, 16, 18, 10, 23, 8), F[2], 2)
        label(d, (8, 24, 22, 28), 'paper', 1)
    elif i == 88:
        tabletop(d, (1, 15, 30, 24), True)
        mb(d, (5, 14, 26, 17), 0); line(d, (8, 12, 22, 12), M[2], 2)
        for x in (10, 21):
            mb(d, (x, 5, x+2, 14)); ell(d, (x-2, 6, x+4, 12), M[0], 'ink')
            ell(d, (x-1, 7, x+3, 11), GLASS[2], 'ink')
        paper(d, 10, 20, 11, 5)
    elif i == 89:
        tabletop(d, (1, 14, 30, 23))
        poly(d, [(4, 13), (23, 10), (28, 17), (9, 21)], F[0], 'ink')
        line(d, (8, 17, 8, 14, 16, 13, 17, 18, 23, 17, 23, 13), 'coral', 2)
        mb(d, (6, 9, 12, 13)); rect(d, (7, 10, 9, 11), 'greenlight')
        ell(d, (20, 8, 25, 13), 'amberlight', 'ink'); rect(d, (21, 12, 24, 14), M[0], 'ink')
        label(d, (10, 24, 21, 27), 'paper', 0)
    elif i == 90:
        mb(d, (4, 3, 28, 28), 0)
        for y in (6, 13, 20):
            for x in (6, 17):
                rect(d, (x, y, x+9, y+6), F[1], 'ink'); line(d, (x+1, y+1, x+8, y+1), F[2])
                rect(d, (x+2, y+2, x+6, y+3), 'paper'); line(d, (x+4, y+5, x+6, y+5), M[2])
                line(d, (x+1, y+5, x+2, y+5), F[0])
        legs(d, (5, 25), 28, 30, True)
    elif i == 91:
        ell(d, (6, 25, 26, 30), M[0], 'ink'); ell(d, (8, 26, 24, 28), M[1], 'ink')
        line(d, (16, 25, 10, 17, 20, 8), M[0], 3); line(d, (16, 24, 11, 17, 20, 9), M[2])
        ell(d, (8, 15, 13, 20), M[1], 'ink')
        poly(d, [(18, 3), (24, 3), (29, 10), (13, 10)], F[0], 'ink')
        line(d, (17, 6, 24, 6), F[1]); line(d, (15, 9, 27, 9), F[2]); rect(d, (16, 10, 26, 11), 'amberlight')
    elif i == 92:
        mb(d, (3, 4, 29, 7), 0); legs(d, (4, 26), 5, metal=True)
        for x in (7, 15, 24):
            line(d, (x, 7, x, 10), M[2])
        rect(d, (4, 10, 10, 23), 'paper', 'ink'); line(d, (6, 12, 6, 21), M[1]); line(d, (8, 12, 9, 12), 'coraldark')
        line(d, (15, 10, 15, 22), M[2], 2); ell(d, (12, 21, 18, 27), M[0], 'ink'); rect(d, (14, 23, 16, 24), 'coral')
        rect(d, (21, 11, 27, 18), M[1], 'ink'); rect(d, (22, 12, 26, 15), F[0], 'ink'); line(d, (23, 13, 25, 13), F[2])
    elif i == 93:
        tabletop(d, (2, 12, 29, 22))
        scene.book(d, 10, 12, 'violet', True); rect(d, (24, 12, 25, 20), 'navy')
        mb(d, (6, 3, 24, 8), 0); rect(d, (8, 4, 22, 7), 'paper')
        line(d, (9, 5, 20, 5), M[1]); rect(d, (11, 6, 12, 6), 'coral')
        line(d, (9, 8, 9, 12), M[1]); line(d, (22, 8, 22, 12), M[2])
        label(d, (10, 23, 23, 27), 'paper', 1)
    elif i == 94:
        mb(d, (13, 18, 19, 27), 0); ell(d, (5, 26, 27, 30), M[1], 'ink')
        ell(d, (2, 11, 30, 22), M[0], 'ink'); ell(d, (2, 8, 30, 19), F[1], 'ink')
        ell(d, (7, 11, 13, 16), F[0], 'ink'); ell(d, (19, 10, 25, 15), F[0], 'ink')
        poly(d, [(8, 11), (10, 9), (13, 12), (10, 14)], STONE[1], 'ink')
        rect(d, (20, 10, 24, 13), 'amber', 'ink'); line(d, (7, 9, 23, 9), F[2]); line(d, (27, 18, 29, 18), M[2])
    elif i == 95:
        ell(d, (6, 7, 26, 15), F[0], 'ink'); ell(d, (6, 5, 26, 12), F[1], 'ink')
        line(d, (9, 7, 23, 7), F[2]); legs(d, (8, 23), 13, metal=True)
        ell(d, (7, 19, 25, 25), M[0], 'ink'); ell(d, (10, 20, 22, 23), (0, 0, 0, 0))
        line(d, (9, 20, 22, 20), M[2]); line(d, (16, 15, 16, 22), M[1])
    elif i == 96:
        mb(d, (5, 6, 26, 28), 0); poly(d, [(3, 7), (6, 2), (25, 2), (29, 7)], F[0], 'ink')
        rect(d, (7, 9, 24, 20), 'navy', 'ink'); paper(d, 9, 11, 12, 7)
        rect(d, (8, 23, 23, 25), M[1], 'ink'); line(d, (10, 24, 20, 24), M[2])
        line(d, (7, 4, 24, 4), F[2]); line(d, (7, 7, 24, 7), F[1])
    elif i == 97:
        wb(d, (4, 3, 27, 28), 0); rect(d, (6, 5, 25, 25), GLASS[0], 'ink')
        for x, y in ((8, 8), (14, 10), (20, 7)): paper(d, x, y, 6, 12)
        wb(d, (5, 20, 26, 24), 1); label(d, (9, 20, 22, 24), 'paper', 0)
        line(d, (7, 6, 10, 6), GLASS[2]); line(d, (6, 27, 25, 27), W[2])
    elif i == 98:
        legs(d, (4, 26), 23); wb(d, (2, 8, 29, 19), 0); wb(d, (1, 18, 30, 24), 2)
        rect(d, (5, 10, 24, 16), F[1], 'ink'); line(d, (7, 11, 22, 11), F[2]); line(d, (7, 15, 22, 15), F[0])
        mb(d, (24, 3, 29, 16), 0); rect(d, (25, 4, 28, 8), 'cyanlight')
        line(d, (22, 4, 21, 8, 22, 12), M[2], 2); rect(d, (20, 9, 23, 13), 'navy', 'ink')
    elif i == 99:
        tabletop(d, (1, 12, 30, 22), True)
        mb(d, (5, 3, 26, 8), 0); rect(d, (7, 4, 24, 6), F[1], 'ink'); line(d, (8, 5, 23, 5), F[2])
        rect(d, (7, 13, 15, 19), F[0], 'ink'); rect(d, (9, 14, 13, 16), M[2])
        for x in (20, 24, 27): line(d, (x, 13, x-1, 19), 'amberlight')
        line(d, (20, 16, 23, 16), 'coral'); mb(d, (4, 25, 27, 28), 0)
    elif i == 100:
        legs(d, (5, 25), 22); wb(d, (3, 2, 28, 25), 0)
        rect(d, (5, 4, 26, 23), 'paper', 'ink'); paper(d, 7, 6, 8, 7, 'corallight')
        paper(d, 17, 13, 7, 7, 'greenlight'); line(d, (14, 13, 18, 11), 'coraldark', 2)
        line(d, (17, 9, 23, 9), M[0]); line(d, (7, 19, 13, 19), M[1]); line(d, (5, 3, 26, 3), W[2])
    elif i == 101:
        legs(d, (6, 23), 22, metal=True)
        rect(d, (5, 5, 24, 18), F[0], 'ink'); rect(d, (7, 7, 22, 16), F[1]); line(d, (8, 8, 21, 8), F[2])
        poly(d, [(5, 18), (24, 18), (27, 24), (3, 24)], F[1], 'ink')
        line(d, (25, 12, 25, 19, 28, 19), M[2], 2); wb(d, (20, 18, 30, 20), 2)
        paper(d, 22, 15, 6, 3); line(d, (5, 20, 22, 20), F[0])
    elif i == 102:
        mb(d, (4, 2, 28, 29), 0)
        for y in (4, 16):
            rect(d, (6, y, 26, y+10), F[1], 'ink'); line(d, (7, y+1, 25, y+1), F[2])
            rect(d, (9, y+3, 19, y+6), 'paper', 'ink'); line(d, (11, y+4, 17, y+4), 'grey')
            rect(d, (23, y+6, 24, y+7), M[2]); line(d, (7, y+9, 21, y+9), F[0])
    elif i == 103:
        wheel(d, 5, 29); wheel(d, 26, 29)
        mb(d, (3, 15, 28, 18), 0); mb(d, (3, 24, 28, 27), 1); legs(d, (4, 25), 16, 27, True)
        mb(d, (8, 5, 24, 14)); ell(d, (19, 7, 27, 12), M[0], 'ink'); ell(d, (21, 8, 25, 11), GLASS[2], 'ink')
        rect(d, (10, 7, 15, 9), 'navy'); line(d, (10, 11, 17, 11), M[0])
        scene.book(d, 11, 18, 'violet'); line(d, (26, 15, 30, 15, 30, 20), M[2], 2)
    elif i == 104:
        legs(d, (4, 25), 21)
        poly(d, [(2, 7), (29, 7), (29, 25), (22, 25), (22, 14), (9, 14), (9, 25), (2, 25)], W[2], 'ink')
        line(d, (4, 9, 27, 9), W[0]); line(d, (4, 11, 27, 11), W[1]); line(d, (4, 13, 4, 23), W[0]); line(d, (26, 13, 26, 23), W[0])
        paper(d, 3, 17, 5, 5); scene.cup(d, 24, 15); rect(d, (14, 7, 20, 10), 'paper', 'grey')
    elif i == 105:
        legs(d, (5, 25), 21, metal=True)
        poly(d, [(2, 12), (25, 6), (30, 20), (6, 25)], M[0], 'ink')
        poly(d, [(5, 13), (23, 9), (27, 19), (8, 22)], '#dbe1ce', 'ink')
        paper(d, 9, 13, 12, 7); rect(d, (11, 14, 19, 17), 'navylight')
        poly(d, [(11, 17), (15, 14), (19, 17)], 'greenlight'); rect(d, (26, 21, 27, 21), 'coral')
        line(d, (3, 14, 5, 22), M[2])
    elif i == 106:
        wb(d, (4, 2, 27, 29), 0)
        for y in (5, 15):
            wb(d, (6, y, 25, y+8), 1)
            for x, tint in ((8, 'violet'), (14, 'coral'), (20, 'cyandark')):
                rect(d, (x, y+1, x+3, y+5), tint, 'ink'); rect(d, (x+1, y+2, x+2, y+3), 'paper')
        wb(d, (5, 26, 26, 28), 2); line(d, (12, 27, 19, 27), M[2])
    elif i == 107:
        tabletop(d, (2, 14, 29, 23))
        mb(d, (7, 8, 19, 15), 0); rect(d, (9, 9, 17, 12), F[1], 'ink'); line(d, (10, 10, 16, 10), F[2])
        ell(d, (11, 12, 14, 14), M[2], 'ink'); rect(d, (6, 16, 11, 20), 'navy', 'ink')
        line(d, (22, 12, 22, 3), M[1], 2); ell(d, (20, 1, 24, 8), M[0], 'ink'); line(d, (21, 3, 23, 3), M[2])
        paper(d, 15, 16, 9, 5); line(d, (20, 12, 17, 16), M[0])
    elif i == 108:
        mb(d, (2, 3, 29, 6), 0); line(d, (4, 4, 27, 4), M[2])
        for x, y in ((4, 9), (14, 13), (23, 9)):
            line(d, (x+2, 6, x+2, y), M[1]); paper(d, x, y, 7, 14)
            rect(d, (x+1, y-1, x+4, y), M[2], 'ink'); line(d, (x+2, y+8, x+5, y+7), 'coraldark')
    elif i == 109:
        legs(d, (6, 24), 21, metal=True)
        for y in (5, 12, 19):
            poly(d, [(4, y), (25, y), (28, y+6), (2, y+6)], F[0], 'ink')
            paper(d, 7, y+1, 16, 4); line(d, (3, y+5, 27, y+5), F[1]); line(d, (4, y+6, 26, y+6), F[2])
        line(d, (4, 7, 4, 27), M[0], 2); line(d, (27, 7, 27, 27), M[1], 2)
    elif i == 110:
        legs(d, (5, 25), 24, metal=True); mb(d, (3, 7, 28, 25), 0)
        rect(d, (7, 11, 24, 19), M[1], 'ink'); paper(d, 8, 13, 14, 7)
        ell(d, (3, 1, 28, 11), M[0], 'ink'); rect(d, (6, 3, 25, 8), M[1], 'ink')
        line(d, (8, 4, 23, 4), M[2]); line(d, (7, 23, 24, 23), M[2])
        rect(d, (24, 16, 30, 18), W[2], 'ink'); line(d, (28, 15, 28, 20), W[0])
    elif i == 111:
        rect(d, (8, 4, 23, 17), F[0], 'ink'); rect(d, (10, 6, 21, 15), F[1]); line(d, (11, 7, 20, 7), F[2])
        poly(d, [(6, 17), (25, 17), (27, 23), (4, 23)], F[1], 'ink'); line(d, (8, 19, 23, 19), F[2])
        line(d, (16, 23, 16, 27), M[2], 3)
        for x, y in ((5, 28), (27, 28), (15, 30)):
            line(d, (16, 27, x, y), M[0], 2); wheel(d, x, y, 1)
        line(d, (3, 13, 3, 20, 6, 20), M[1], 2); line(d, (27, 13, 27, 20, 25, 20), M[1], 2)
    elif i == 112:
        legs(d, (3, 27), 16, metal=True)
        poly(d, [(1, 12), (26, 9), (31, 15), (6, 19)], W[2], 'ink')
        poly(d, [(6, 19), (31, 15), (31, 18), (6, 22)], W[1], 'ink')
        line(d, (8, 21, 29, 18), W[0]); line(d, (6, 19, 6, 29), M[0], 2)
        label(d, (10, 12, 20, 16), 'paper', 0)
    elif i == 113:
        mb(d, (3, 3, 28, 29), 0)
        for x in (5, 17):
            rect(d, (x, 5, x+9, 26), F[1], 'ink'); line(d, (x+1, 6, x+8, 6), F[2])
            line(d, (x+1, 10, x+8, 10), F[0]); rect(d, (x+6, 17, x+7, 18), M[2])
            line(d, (x+3, 13, x+3, 22), 'paper', 2); line(d, (x+2, 13, x+5, 13), 'paper', 2)
        label(d, (10, 27, 22, 30), 'paper', 0)
    elif i == 114:
        line(d, (8, 29, 14, 6), W[0], 3); line(d, (24, 29, 18, 6), W[0], 3)
        wb(d, (2, 7, 29, 22), 0); rect(d, (4, 9, 27, 20), 'paper', 'ink')
        poly(d, [(5, 18), (10, 12), (15, 18), (21, 12), (26, 17)], 'coral')
        ell(d, (11, 10, 15, 14), 'amber'); rect(d, (19, 9, 23, 11), 'cyan')
        wb(d, (1, 23, 30, 25), 2); scene.cup(d, 7, 20); line(d, (25, 22, 27, 18), M[2])
    elif i == 115:
        legs(d, (5, 25), 24)
        poly(d, [(2, 17), (26, 14), (30, 20), (6, 24)], W[2], 'ink')
        for x, y in ((9, 17), (19, 16)):
            poly(d, [(x-4, y-2), (x+4, y-2), (x+3, y+4), (x-3, y+4)], W[1], 'ink')
            ell(d, (x-4, y-3, x+4, y), W[0], 'ink'); leaf(d, x, y-3)
        paper(d, 22, 18, 5, 4); line(d, (6, 24, 27, 21), W[0])
    elif i == 116:
        legs(d, (4, 26), 3)
        poly(d, [(0, 7), (6, 2), (25, 2), (31, 7)], F[0], 'ink'); line(d, (5, 4, 26, 4), F[2])
        wb(d, (4, 14, 27, 22), 0); wb(d, (3, 21, 28, 25), 2)
        rect(d, (6, 15, 25, 20), F[1], 'ink'); line(d, (8, 16, 23, 16), F[2]); line(d, (8, 19, 23, 19), F[0])
        rect(d, (2, 18, 5, 26), W[1], 'ink'); rect(d, (27, 18, 30, 26), W[1], 'ink')
    elif i == 117:
        wb(d, (13, 3, 18, 29), 0); wb(d, (9, 27, 23, 30), 2)
        for x0, y0, x1, y1, tip, tint in ((3, 4, 24, 9, 29, F[1]), (7, 12, 27, 17, 2, 'coraldark'), (2, 20, 24, 25, 29, 'violetdark')):
            poly(d, [(x0, y0), (x1, y0), (tip, (y0+y1)//2), (x1, y1), (x0, y1)], tint, 'ink')
            line(d, (x0+3, y0+2, x1-2, y0+2), 'paper')
        rect(d, (4, 5, 5, 5), F[2]); rect(d, (3, 24, 5, 24), F[0])
    elif i == 118:
        wb(d, (2, 16, 29, 28), 0); wb(d, (1, 12, 30, 17), 2)
        rect(d, (4, 19, 27, 25), F[1], 'ink'); line(d, (5, 20, 26, 20), F[2]); line(d, (5, 24, 26, 24), F[0])
        for x in (7, 17, 25):
            ell(d, (x-3, 9, x+3, 13), 'paper', 'grey'); ell(d, (x-2, 9, x+2, 11), 'amberlight', 'amberdark')
        ell(d, (10, 2, 21, 11), M[1], 'ink'); line(d, (13, 3, 18, 3), M[2]); rect(d, (14, 1, 17, 3), M[0], 'ink')
    elif i == 119:
        wb(d, (3, 4, 28, 27), 0); wb(d, (4, 16, 27, 19), 2)
        for x, tint in ((7, 'coral'), (15, 'amber'), (23, 'cyandark')):
            rect(d, (x-2, 10, x+3, 16), F[1], 'ink'); line(d, (x-1, 11, x+2, 11), F[2]); line(d, (x-1, 14, x+2, 14), F[0])
            line(d, (x, 12, x-1, 5), tint, 2); line(d, (x+2, 12, x+2, 7), 'paper')
        for x in (6, 15): paper(d, x, 21, 11, 4)
        line(d, (4, 26, 27, 26), W[2])
    elif i == 120:
        legs(d, (4, 25), 23)
        poly(d, [(1, 13), (7, 8), (13, 6), (20, 6), (26, 9), (31, 14), (29, 24), (22, 20), (10, 20), (3, 25)], W[0], 'ink')
        line(d, (4, 13, 9, 10, 14, 9, 20, 9, 25, 12, 28, 15), W[2], 2)
        poly(d, [(4, 18), (10, 14), (22, 14), (28, 19), (25, 23), (20, 19), (12, 19), (7, 23)], F[1], 'ink')
        line(d, (8, 19, 13, 16, 20, 16, 25, 19), F[2]); line(d, (11, 18, 21, 18), F[0])
    elif i == 121:
        mb(d, (12, 13, 19, 29), 0); ell(d, (6, 27, 25, 30), M[1], 'ink')
        poly(d, [(3, 8), (24, 5), (29, 14), (8, 18)], W[2], 'ink')
        poly(d, [(8, 18), (29, 14), (29, 17), (8, 21)], W[1], 'ink')
        paper(d, 8, 10, 10, 5); line(d, (21, 10, 21, 2, 19, 1), M[1], 2)
        ell(d, (17, 0, 21, 4), M[0], 'ink'); rect(d, (14, 23, 17, 24), 'coral'); line(d, (13, 17, 13, 26), M[2])
    elif i == 122:
        legs(d, (6, 25), 21)
        rect(d, (2, 4, 28, 16), F[0], 'ink'); rect(d, (4, 6, 26, 14), F[1]); line(d, (5, 7, 25, 7), F[2])
        poly(d, [(3, 15), (25, 12), (30, 21), (8, 25)], W[2], 'ink')
        paper(d, 9, 16, 12, 6); rect(d, (24, 16, 25, 21), 'navy')
        line(d, (8, 25, 28, 22), W[0]); line(d, (6, 12, 25, 12), F[0])
    elif i == 123:
        wb(d, (2, 6, 29, 11), 0); line(d, (4, 7, 27, 7), W[2])
        for x, y, tint in ((4, 12, 'corallight'), (13, 17, 'amberlight'), (22, 12, 'cyanlight')):
            line(d, (x+3, 10, x+3, y), M[1]); paper(d, x, y, 6, 8, tint)
            rect(d, (x+2, y+2, x+3, y+4), M[0]); rect(d, (x+2, y-1, x+4, y), M[2], 'ink')
    elif i == 124:
        tabletop(d, (1, 15, 30, 25))
        poly(d, [(3, 16), (23, 12), (28, 21), (8, 24)], G[1], 'ink')
        line(d, (8, 20, 23, 17), 'paper', 2); line(d, (15, 15, 17, 22), 'paper', 2)
        for x, y, tint in ((8, 13, 'coral'), (17, 10, 'violet'), (23, 14, 'amber')):
            rect(d, (x, y, x+4, y+5), tint, 'ink'); poly(d, [(x-1, y), (x+2, y-3), (x+5, y)], W[0], 'ink')
        rect(d, (8, 22, 13, 23), G[2]); label(d, (10, 25, 24, 29), 'paper', 0)
    elif i == 125:
        wb(d, (4, 2, 27, 29), 0)
        for y in (5, 13, 21):
            wb(d, (6, y, 25, y+6), 1); label(d, (8, y+1, 16, y+4), 'paper', 0)
            line(d, (20, y+3, 23, y+3), M[2])
        line(d, (6, 3, 25, 3), W[2]); line(d, (7, 28, 24, 28), W[2])
    elif i == 126:
        wb(d, (3, 16, 28, 28), 0); wb(d, (2, 13, 29, 17), 2)
        poly(d, [(8, 3), (15, 3), (15, 6), (17, 9), (15, 13), (8, 13), (6, 9), (8, 6)], GLASS[1], 'ink')
        rect(d, (8, 9, 15, 12), 'cyanlight'); line(d, (9, 4, 9, 7), GLASS[2])
        for x in (22, 26): scene.cup(d, x, 9)
        rect(d, (7, 20, 24, 24), F[1], 'ink'); line(d, (9, 21, 22, 21), F[2]); line(d, (9, 23, 22, 23), F[0])
    elif i == 127:
        for x in (7, 23): line(d, (x, 22, x, 29), M[0], 2)
        for y in (3, 9, 15):
            rect(d, (7, y, 24, y+7), F[0], 'ink'); rect(d, (9, y+1, 22, y+5), F[1]); line(d, (10, y+2, 21, y+2), F[2])
            poly(d, [(5, y+7), (26, y+7), (28, y+11), (3, y+11)], F[1], 'ink')
            line(d, (5, y+10, 26, y+10), M[2]); line(d, (7, y+9, 24, y+9), F[0])
    elif i == 128:
        wb(d, (2, 14, 29, 28), 0); poly(d, [(1, 13), (22, 7), (31, 14), (9, 21)], W[2], 'ink')
        rect(d, (11, 22, 23, 26), F[1], 'ink'); line(d, (12, 23, 22, 23), F[2]); line(d, (12, 25, 22, 25), F[0])
        poly(d, [(9, 7), (22, 5), (24, 13), (11, 15)], M[0], 'ink'); poly(d, [(11, 8), (20, 7), (21, 12), (12, 13)], GLASS[2], 'ink')
        paper(d, 4, 14, 6, 4); line(d, (11, 19, 29, 14), W[1])
    elif i == 129:
        wb(d, (2, 18, 29, 28), 0); rect(d, (3, 3, 28, 21), GLASS[0], 'ink')
        rect(d, (5, 5, 26, 18), GLASS[1], 'ink'); line(d, (5, 5, 5, 10), GLASS[2])
        for x, tint in ((7, 'coraldark'), (15, 'amberdark'), (23, 'violetdark')):
            rect(d, (x-2, 9, x+2, 16), tint, 'ink'); line(d, (x-1, 10, x+1, 10), 'paper')
        label(d, (5, 23, 27, 27), 'paper', 1); wb(d, (2, 20, 29, 22), 2)
    elif i == 130:
        wb(d, (5, 7, 26, 29), 0); poly(d, [(3, 8), (9, 2), (23, 2), (29, 8)], W[2], 'ink')
        rect(d, (7, 10, 24, 26), F[1], 'ink'); rect(d, (9, 12, 22, 15), 'ink')
        line(d, (9, 16, 22, 16), F[2]); line(d, (8, 25, 23, 25), F[0]); label(d, (10, 19, 22, 23), 'paper', 0)
        paper(d, 12, 9, 7, 4)
    elif i == 131:
        legs(d, (4, 26), 23)
        rect(d, (4, 6, 28, 20), F[0], 'ink'); rect(d, (6, 8, 26, 18), F[1], 'ink')
        poly(d, [(4, 18), (28, 18), (30, 25), (2, 25)], F[1], 'ink')
        line(d, (7, 9, 25, 9), F[2]); line(d, (6, 21, 27, 21), F[2]); line(d, (16, 10, 16, 24), F[0])
        wb(d, (1, 12, 5, 24), 2); wb(d, (27, 12, 31, 24), 2)
    elif i == 132:
        legs(d, (4, 26), 23, metal=True); mb(d, (2, 2, 29, 25), 0)
        rect(d, (4, 4, 27, 23), 'paper', 'ink')
        points = [(8, 9), (22, 8), (14, 16), (23, 20), (6, 20)]
        for a, b in ((0, 1), (0, 2), (1, 3), (2, 4), (2, 3)): line(d, (*points[a], *points[b]), 'coraldark')
        for x, y in points: rect(d, (x-2, y-2, x+2, y+2), 'amberlight', 'ink'); rect(d, (x, y, x, y), 'coral')
        line(d, (3, 3, 28, 3), M[2])
    elif i == 133:
        mb(d, (10, 3, 23, 29), 0); poly(d, [(7, 3), (10, 1), (24, 1), (27, 3)], M[1], 'ink')
        for y, tint in ((6, 'violet'), (13, 'coral'), (20, 'cyandark')):
            rect(d, (12, y, 21, y+5), 'paper', 'ink'); rect(d, (13, y+1, 15, y+3), tint); line(d, (17, y+2, 20, y+2), M[0])
        line(d, (11, 5, 11, 26), M[2]); label(d, (9, 26, 24, 30), 'paper', 0)
    elif i == 134:
        wb(d, (3, 9, 28, 28), 0); wb(d, (2, 13, 29, 17), 2); wb(d, (2, 25, 29, 28), 2)
        for x, y in ((5, 7), (17, 5), (6, 19), (18, 19)):
            rect(d, (x, y, x+8, y+6), 'paper', 'ink'); rect(d, (x+1, y+1, x+7, y+2), F[1])
            line(d, (x+3, y+4, x+6, y+4), 'grey')
        line(d, (4, 17, 4, 25), M[1]); line(d, (27, 17, 27, 25), M[2])
    elif i == 135:
        legs(d, (5, 25), 22)
        poly(d, [(5, 3), (26, 3), (29, 25), (2, 25)], W[1], 'ink')
        for y in (9, 20): wb(d, (2, y, 29, y+3), 0)
        for x, y, tint in ((6, 4, 'coral'), (17, 4, 'violet'), (8, 15, 'amber'), (19, 15, 'cyandark')):
            rect(d, (x, y, x+7, y+9), tint, 'ink'); rect(d, (x+2, y+2, x+5, y+4), 'paper'); line(d, (x+2, y+6, x+5, y+6), 'paper')
        line(d, (3, 23, 28, 23), W[2])
    elif i == 136:
        mb(d, (4, 2, 27, 29), 0)
        for y in (5, 12, 19):
            rect(d, (6, y, 25, y+6), M[1], 'ink'); rect(d, (8, y+2, 15, y+4), 'navy', 'ink')
            rect(d, (10, y+3, 11, y+3), 'greenlight'); label(d, (18, y+1, 23, y+4), 'paper', 0)
            line(d, (7, y+1, 24, y+1), M[2])
        line(d, (7, 27, 24, 27), M[2]); rect(d, (15, 26, 17, 28), F[0])
    elif i == 137:
        legs(d, (3, 26), 23)
        wb(d, (1, 16, 30, 24), 2); line(d, (16, 18, 16, 23), W[0])
        for x in (4, 19):
            mb(d, (x, 5, x+10, 13), 0); rect(d, (x+2, 7, x+8, 11), GLASS[2], 'ink')
            line(d, (x+5, 14, x+5, 17), M[1]); rect(d, (x, 18, x+10, 20), M[1], 'ink')
            line(d, (x+2, 19, x+8, 19), M[0]); rect(d, (x+2, 8, x+6, 8), 'navy')
        paper(d, 10, 22, 11, 4)
    elif i == 138:
        mb(d, (4, 2, 28, 29), 0)
        for y in (5, 12, 19):
            mb(d, (6, y, 26, y+5), 1)
            for x, tint in ((8, 'coral'), (13, 'amber'), (18, 'cyan'), (23, 'greenlight')):
                rect(d, (x, y+2, x+1, y+3), 'ink'); line(d, (x, y+4, x+1, y+7), tint)
            line(d, (7, y+1, 25, y+1), M[2])
        label(d, (10, 25, 22, 29), 'paper', 0)
    elif i == 139:
        wb(d, (3, 12, 28, 27), 0); poly(d, [(2, 12), (7, 7), (25, 7), (29, 12)], W[2], 'ink')
        for x in (7, 23): rect(d, (x, 10, x+2, 27), M[1], 'ink'); line(d, (x+1, 12, x+1, 24), M[2])
        label(d, (11, 16, 22, 21), 'paper', 1); mb(d, (15, 21, 19, 24), 0)
        line(d, (4, 25, 27, 25), W[1])
    elif i == 140:
        mb(d, (3, 16, 28, 28), 0)
        poly(d, [(2, 13), (24, 8), (29, 18), (7, 23)], M[1], 'ink')
        poly(d, [(6, 13), (22, 10), (25, 16), (9, 20)], F[0], 'ink')
        for x, y in ((9, 13), (15, 12), (21, 11)):
            rect(d, (x, y, x+3, y+5), F[1], 'ink'); rect(d, (x, y+1, x+2, y+2), F[2])
        line(d, (8, 22, 27, 18), M[2]); label(d, (9, 25, 23, 29), 'paper', 0)
    elif i == 141:
        tabletop(d, (1, 15, 30, 23), True)
        mb(d, (4, 4, 27, 12), 0)
        for x in (8, 15, 23):
            line(d, (x, 6, x, 9), M[2]); line(d, (x-2, 7, x+2, 7), 'amberlight')
        rect(d, (8, 15, 18, 20), F[0], 'ink'); mb(d, (10, 16, 15, 18), 1)
        line(d, (24, 14, 23, 20), M[2], 2); rect(d, (22, 19, 24, 21), 'coral')
        label(d, (8, 25, 23, 28), 'paper', 0)
    elif i == 142:
        wheel(d, 7, 29); wheel(d, 25, 29)
        mb(d, (3, 8, 29, 27), 0); mb(d, (4, 4, 28, 10), 1)
        line(d, (10, 4, 10, 1, 21, 1, 21, 4), M[2], 2)
        rect(d, (6, 12, 26, 24), F[1], 'ink'); line(d, (7, 13, 25, 13), F[2]); line(d, (7, 23, 25, 23), F[0])
        for x in (9, 17):
            rect(d, (x, 16, x+5, 21), 'navy', 'ink'); rect(d, (x+1, 17, x+4, 18), 'paper')
        rect(d, (8, 9, 11, 11), 'amber', 'ink'); rect(d, (22, 9, 25, 11), 'amber', 'ink')
    elif i == 143:
        tabletop(d, (1, 14, 30, 23))
        paper(d, 8, 15, 12, 6); scene.book(d, 24, 15, 'violet')
        line(d, (6, 15, 6, 9, 13, 5), M[0], 2); line(d, (7, 14, 7, 9, 13, 6), M[2])
        poly(d, [(11, 2), (17, 2), (20, 8), (7, 8)], F[0], 'ink')
        line(d, (11, 4, 16, 4), F[1]); line(d, (9, 7, 18, 7), F[2]); rect(d, (10, 8, 18, 9), 'amberlight')
        label(d, (10, 24, 22, 28), 'paper', 1)
    else:
        raise ValueError(i)
    return im

WALLS = {6, 55, 62, 108, 123}
GROUND = {49, 65}
SLIM = {3, 18, 23, 43, 46, 54, 58, 60, 71, 82, 91, 95, 117, 121, 133}
WIDE = {0, 4, 7, 16, 17, 24, 26, 30, 36, 47, 69, 73, 76, 77, 83, 88, 89, 93, 94, 98, 99, 104, 105, 107, 112, 115, 118, 120, 122, 124, 131, 137, 141, 143}

def metadata(i, map_id, item, image):
    identifier, name, interaction = item
    colors = {tuple(pixel[:3]) for pixel in image.get_flattened_data() if pixel[3] == 255}
    roles = {}
    for key, values in {'wood': W, 'fabric': F, 'metal': M, 'foliage': G, 'stone': STONE}.items():
        if any(ImageColor.getrgb(value) in colors for value in values): roles[key] = values
    if i in WALLS or i in GROUND:
        footprint = None
    elif i in SLIM:
        footprint = [0.27, 0.78, 0.46, 0.16]
    elif i in WIDE:
        footprint = [0.05, 0.62, 0.9, 0.27]
    else:
        footprint = [0.1, 0.68, 0.8, 0.24]
    if i in (2, 12, 19, 39, 44, 66, 92):
        footprint = [0.06, 0.77, 0.88, 0.16]
    layer = 'wall' if i in WALLS else 'ground' if i in GROUND else 'object'
    category = {'hub': 'praça', 'library': 'biblioteca', 'park': 'parque', 'market': 'feira', 'garden': 'horta', 'beach': 'praia', 'chapter-1': 'música', 'room-1': 'estúdio', 'chapter-2': 'museu', 'room-2': 'conservação', 'chapter-3': 'ciência', 'room-3': 'laboratório', 'chapter-4': 'mídia', 'room-4': 'redação', 'chapter-5': 'comunidade', 'room-5': 'assembleia', 'chapter-6': 'arquivo público', 'room-6': 'catálogo'}[map_id]
    usage = {
        'hub': 'Compõe pontos de descanso, cuidado e encontro ao redor da praça.',
        'library': 'Organiza consulta, conservação, leitura e silêncio na biblioteca.',
        'park': 'Apoia o passeio, a observação da natureza e o cuidado com os animais.',
        'market': 'Pertence a uma área de trabalho, armazenamento ou exposição da feira.',
        'garden': 'Integra o preparo, a observação e o cuidado dos canteiros comunitários.',
        'beach': 'Apoia descanso, troca de roupa, cuidado e observação na praia.',
        'chapter-1': 'Compõe um ensaio aberto com espaço para músicos e ouvintes.',
        'room-1': 'Organiza gravação, instrumentos e trabalho no estúdio.',
        'chapter-2': 'Apoia a orientação e o encontro de visitantes no pátio do museu.',
        'room-2': 'Organiza documentos e manuseio cuidadoso na área de conservação.',
        'chapter-3': 'Convida a observar, perguntar e comparar no pátio de ciência.',
        'room-3': 'Apoia demonstrações escolares, medidas e registro de resultados.',
        'chapter-4': 'Apoia informação pública, escuta e cuidado dos equipamentos.',
        'room-4': 'Organiza entrevistas, fontes, legendas e correções na redação.',
        'chapter-5': 'Apoia participação, orientação e projetos compartilhados no bairro.',
        'room-5': 'Organiza fala, escrita e escuta na assembleia comunitária.',
        'chapter-6': 'Aproxima visitantes de registros, contribuições e conservação.',
        'room-6': 'Apoia revisão humana, manutenção e cópias de segurança do arquivo.',
    }[map_id]
    return {'index': i, 'id': 'furnishings-'+identifier, 'family': 'furnishings', 'name': name, 'category': category, 'mapTheme': map_id, 'description': name+'. '+usage, 'solid': footprint is not None, 'solidFootprint': ([{'x': footprint[0], 'y': footprint[1], 'width': footprint[2], 'height': footprint[3]}] if footprint else None), 'layer': layer, 'interaction': interaction if i not in GROUND else None, 'colorRoles': roles, 'sourceRect': {'x': i%8*32, 'y': i//8*32, 'width': 32, 'height': 32}}

def preview(records, props):
    im = Image.new('RGBA', (1280, 2880), '#e7dfcc')
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
    for i, (record, image) in enumerate(zip(records, props)):
        x, y = i%8*160, i//8*160
        rect(d, (x+4, y+4, x+155, y+155), '#d6ccb5')
        for cy in range(y+8, y+104, 16):
            for cx in range(x+32, x+128, 16):
                if ((cx-x)//16+(cy-y)//16)%2: rect(d, (cx, cy, cx+15, cy+15), '#eee7d6')
        im.alpha_composite(image.resize((96, 96), Image.Resampling.NEAREST), (x+32, y+8))
        lines = ['']
        for word in (str(i)+' '+record['name']).split():
            phrase = (lines[-1]+' '+word).strip()
            if d.textlength(phrase, font=font) > 146: lines.append(word)
            else: lines[-1] = phrase
        for row, value in enumerate(lines[:3]): d.text((x+7, y+106+row*12), value, fill=P['navy'], font=font)
        d.text((x+7, y+144), record['mapTheme'], fill=P['coraldark'], font=font)
    im.save(ROOT / 'tests' / 'furnishings-preview.png', optimize=True)

def main():
    props = [prop(i) for i in range(144)]
    assert sum(len(items) for items in GROUPS.values()) == 144
    assert all(len(items) == 8 for items in GROUPS.values())
    assert len(set(image.tobytes() for image in props)) == 144
    atlas = empty(256, 576)
    records, groups = [], {}
    for map_id, items in GROUPS.items():
        groups[map_id] = []
        for item in items:
            i = len(records)
            image = props[i]
            assert image.getchannel('A').getextrema() == (0, 255)
            assert image.getbbox() and image.getbbox()[2] <= 32 and image.getbbox()[3] <= 32
            atlas.alpha_composite(image, (i%8*32, i//8*32))
            records.append(metadata(i, map_id, item, image))
            groups[map_id].append(i)
    out = ROOT / 'assets' / 'tilesets'
    atlas.save(out / 'furnishings-props.png', optimize=True)
    manifest = {'version': '2.1', 'license': 'CC0-1.0', 'licenseURL': 'https://creativecommons.org/publicdomain/zero/1.0/', 'attributionRequired': False, 'creator': 'Original VOICES pixel art', 'generator': 'tools/create_furnishings_assets.py', 'atlas': 'assets/tilesets/furnishings-props.png', 'tileSize': 32, 'columns': 8, 'rows': 18, 'coordinateUnits': 'tile-fraction', 'sourceRectUnits': 'pixel', 'colorRoleConvention': 'Only exact RGB triples listed in colorRoles may be recolored. Outlines, contents and alpha remain unchanged.', 'groups': groups, 'palette': P, 'props': records}
    (out / 'furnishings-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    encoded = base64.b64encode((out / 'furnishings-props.png').read_bytes()).decode('ascii')
    content = {'version': '2.1', 'license': 'CC0-1.0', 'groups': groups, 'characters': {}, 'residents': [], 'sources': [], 'assetManifest': manifest}
    registry = "(function(){'use strict';const V=window.V=window.V||{};V.furnishingsAssets="+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+";V.sceneAssets=V.sceneAssets||[];V.sceneAssets.push(...V.furnishingsAssets);V.furnishingsMaterialSources={furnishings:'data:image/png;base64,"+encoded+"'};V.furnishingsContent="+json.dumps(content, ensure_ascii=False, separators=(',', ':'))+";})();\n"
    (ROOT / 'js' / 'furnishings-content.js').write_text(registry, encoding='utf-8')
    preview(records, props)
    print(json.dumps({'props': 144, 'uniqueCells': 144, 'groups': groups, 'atlas': [256, 576], 'preview': 'tests/furnishings-preview.png'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
