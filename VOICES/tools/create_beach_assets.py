from pathlib import Path
import importlib.util
import json
import base64
import math
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_beach_palette', ROOT / 'tools' / 'create_scene_assets.py')
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
rect, ell, poly, line, empty = scene.rect, scene.ell, scene.poly, scene.line, scene.empty
P = scene.base.P
FLOOR_COLORS = [
    ['#baa578', '#dbc394', '#e7d1aa'],
    ['#ad9673', '#b5a181', '#c6b593'],
    ['#af9873', '#d8c091', '#e7d1aa'],
    ['#8f8f82', '#bcb5a2', '#ded8c9'],
    ['#4f5961', '#ded8c9', '#eeeada'],
    [P['brown'], P['brownlight'], P['amberlight']],
    ['#ba806a', '#d09477', '#e0b7a1'],
    ['#9a9c91', '#c7bfad', '#e7dfce'],
]
PROPS = [
    ('coral-parasol', 'Guarda-sol listrado coral', 'praia'),
    ('blue-parasol', 'Guarda-sol listrado azul', 'praia'),
    ('reclining-chair', 'Espreguiçadeira de madeira', 'praia'),
    ('beach-chair', 'Cadeira de praia dobrável', 'praia'),
    ('beach-towel', 'Canga listrada sobre a areia', 'praia'),
    ('sandcastle', 'Castelo de areia', 'praia'),
    ('cooler-box', 'Caixa térmica', 'praia'),
    ('lifeguard-platform', 'Posto de salva-vidas', 'praia'),
    ('surfboard', 'Prancha de surfe', 'praia'),
    ('surfboard-rack', 'Suporte de pranchas', 'praia'),
    ('float-ring', 'Boia circular', 'praia'),
    ('safety-buoy', 'Boia de sinalização', 'praia'),
    ('volleyball-net', 'Rede de vôlei', 'praia'),
    ('beach-shower', 'Ducha do calçadão', 'praia'),
    ('sorted-bins', 'Lixeiras de coleta', 'praia'),
    ('beach-boardwalk', 'Passarela de madeira', 'praia'),
    ('rope-fence', 'Cerca baixa de corda', 'praia'),
    ('fishing-boat', 'Barco de pesca em descanso', 'praia'),
    ('shore-shells', 'Conchas sobre a areia', 'praia'),
    ('kiosk-table', 'Mesa do quiosque', 'praia'),
    ('single-bed', 'Cama de solteiro com colcha', 'casa'),
    ('bunk-bed', 'Beliche de madeira', 'casa'),
    ('bedside-table', 'Criado-mudo com luminária', 'casa'),
    ('shoe-cabinet', 'Sapateira com calçados', 'casa'),
    ('laundry-basket', 'Cesto de roupa de tecido', 'casa'),
    ('bathroom-sink', 'Pia com armário e espelho', 'casa'),
    ('bathtub', 'Banheira', 'casa'),
    ('refrigerator', 'Geladeira da cozinha', 'cozinha'),
    ('cooking-stove', 'Fogão com panela', 'cozinha'),
    ('kitchen-sink', 'Pia da cozinha', 'cozinha'),
    ('pantry-shelf', 'Estante de despensa', 'cozinha'),
    ('breakfast-cart', 'Carrinho de café da manhã', 'cozinha'),
    ('sewing-machine', 'Mesa com máquina de costura', 'ateliê'),
    ('easel-canvas', 'Cavalete com pintura original', 'ateliê'),
    ('toy-storage', 'Caixa com brinquedos', 'casa'),
    ('rocking-chair', 'Cadeira de balanço', 'convívio'),
    ('outdoor-picnic-table', 'Mesa de piquenique com bancos', 'convívio'),
    ('water-drinking-fountain', 'Bebedouro de água', 'comunidade'),
    ('street-lamp', 'Luminária de praça', 'convívio'),
    ('flower-market-cart', 'Carrinho de flores', 'feira'),
    ('leaning-coconut-palm', 'Coqueiro inclinado', 'árvores'),
    ('straight-coconut-palm', 'Coqueiro reto', 'árvores'),
    ('dune-grass', 'Capim junto à duna', 'plantas e flores'),
    ('coastal-shrub', 'Arbusto costeiro', 'plantas e flores'),
    ('dune-flowers', 'Planta rasteira florida', 'plantas e flores'),
    ('agave-clump', 'Agave ornamental', 'plantas e flores'),
    ('bromeliad', 'Bromélia em canteiro', 'plantas e flores'),
    ('hibiscus-bush', 'Moita de hibisco', 'plantas e flores'),
    ('sand-dry', 'Areia seca', 'pisos'),
    ('sand-wet', 'Areia úmida', 'pisos'),
    ('sand-footprints', 'Areia com pegadas', 'pisos'),
    ('promenade-stone', 'Pedras do calçadão', 'pisos'),
    ('wave-mosaic', 'Mosaico de ondas do calçadão', 'pisos'),
    ('wood-deck', 'Tábuas do deque', 'pisos'),
    ('terracotta-floor', 'Ladrilho de terracota', 'pisos'),
    ('light-gravel', 'Cascalho claro', 'pisos'),
    ('printed-dress-display', 'Vestido estampado no manequim', 'vestuário'),
    ('blouse-display', 'Blusa estampada no cabide', 'vestuário'),
    ('casual-shirt-display', 'Camiseta e bermuda no cabide', 'vestuário'),
    ('headwrap-display', 'Turbante de uso pessoal no suporte', 'vestuário'),
    ('scarf-display', 'Lenço estampado dobrado', 'vestuário'),
    ('sandals-display', 'Sandálias na prateleira', 'vestuário'),
    ('beachwear-display', 'Maiô e camisa de praia no cabide', 'vestuário'),
    ('accessory-display', 'Óculos, brincos e bolsa no expositor', 'vestuário'),
]

def shadow(d, b=(3, 26, 29, 30)):
    ell(d, b, (17, 23, 41, 38))

def blossom(d, x, y, tint='coral'):
    for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2)):
        ell(d, (x+dx-1, y+dy-1, x+dx+1, y+dy+1), tint)
    rect(d, (x, y, x, y), 'amberlight')

def leaves(d, x, y):
    for dx, dy in ((-12, 2), (-10, -4), (-5, -8), (5, -8), (11, -3), (13, 3)):
        poly(d, [(x, y), (x+dx//2, y+dy-1), (x+dx, y+dy+4), (x+dx-2, y+dy+4), (x+dx//2, y+dy+2)], 'green', 'greendark')
        line(d, (x, y, x+dx-1, y+dy+2), 'greenlight')

def stool(d, x, y):
    rect(d, (x+1, y+3, x+2, y+8), 'brown', 'ink')
    rect(d, (x+7, y+3, x+8, y+8), 'brown', 'ink')
    rect(d, (x, y, x+9, y+3), 'brownlight', 'ink')

def box(d, top=9, fill='brownlight'):
    rect(d, (5, top, 26, 27), fill, 'ink')
    rect(d, (6, 27, 9, 29), 'brown', 'ink')
    rect(d, (22, 27, 25, 29), 'brown', 'ink')

def prop(i):
    im = empty()
    d = ImageDraw.Draw(im)
    if i in (0, 1):
        shadow(d, (4, 27, 29, 30))
        rect(d, (15, 10, 16, 29), 'brown', 'ink')
        poly(d, [(1, 12), (4, 7), (11, 3), (16, 2), (23, 4), (29, 9), (31, 13)], 'coral' if i == 0 else 'cyan', 'ink')
        poly(d, [(8, 12), (11, 6), (16, 3), (19, 7), (21, 13)], 'white')
        poly(d, [(25, 12), (21, 5), (27, 8), (30, 12)], 'white')
        line(d, (3, 12, 8, 14, 15, 12, 22, 14, 29, 12), 'coraldark' if i == 0 else 'cyandark')
        rect(d, (14, 1, 17, 3), 'brownlight', 'ink')
    elif i == 2:
        shadow(d)
        line(d, (7, 20, 5, 29, 7, 29), 'ink', 2)
        line(d, (22, 21, 26, 28), 'ink', 2)
        poly(d, [(4, 10), (12, 8), (16, 20), (29, 21), (29, 25), (11, 25)], 'brownlight', 'ink')
        poly(d, [(6, 11), (11, 10), (16, 21), (27, 22), (26, 24), (12, 23)], 'coral', 'coraldark')
        for y in (14, 18, 22):
            line(d, (8+(y-14)//3, y, 13+(y-14)//2, y), 'white')
    elif i == 3:
        shadow(d)
        line(d, (7, 10, 23, 29), 'darkgrey', 2)
        line(d, (24, 10, 9, 29), 'darkgrey', 2)
        rect(d, (7, 5, 24, 16), 'cyan', 'ink')
        for x in (10, 16, 22): rect(d, (x, 6, x+1, 15), 'white')
        poly(d, [(8, 17), (23, 17), (26, 22), (7, 23)], 'cyanlight', 'ink')
        line(d, (4, 14, 9, 14), 'darkgrey', 2)
        line(d, (23, 14, 28, 14), 'darkgrey', 2)
    elif i == 4:
        poly(d, [(4, 12), (22, 9), (29, 26), (8, 29)], 'coral', 'coraldark')
        for y in (13, 18, 23): line(d, (5+(y-13)//3, y, 23+(y-13)//3, y-2), 'white', 2)
        for x in (9, 13, 17, 21): line(d, (x, 28, x+1, 30), 'paper')
    elif i == 5:
        shadow(d)
        rect(d, (7, 17, 26, 27), '#ccb184', '#927954')
        rect(d, (5, 11, 11, 25), '#e2cca4', '#927954')
        rect(d, (22, 11, 28, 25), '#e2cca4', '#927954')
        rect(d, (12, 8, 21, 23), '#e2cca4', '#927954')
        for x in (5, 8, 22, 25): rect(d, (x, 8, x+2, 12), '#e2cca4', '#927954')
        for x in (12, 16, 20): rect(d, (x, 5, x+2, 9), '#e2cca4', '#927954')
        ell(d, (13, 19, 19, 28), '#927954')
        rect(d, (13, 23, 19, 28), '#927954')
        line(d, (17, 5, 17, 0), 'brown')
        poly(d, [(18, 0), (24, 2), (18, 4)], 'coral')
    elif i == 6:
        shadow(d)
        rect(d, (5, 12, 27, 26), 'cyan', 'ink')
        rect(d, (4, 9, 28, 13), 'white', 'ink')
        rect(d, (8, 7, 24, 9), None, 'darkgrey')
        rect(d, (7, 16, 10, 23), 'cyanlight')
        line(d, (25, 16, 25, 23), 'cyandark')
    elif i == 7:
        shadow(d)
        line(d, (8, 17, 5, 30), 'brown', 3)
        line(d, (24, 17, 27, 30), 'brown', 3)
        line(d, (5, 30, 27, 19), 'brownlight')
        rect(d, (4, 13, 27, 18), 'brownlight', 'ink')
        line(d, (9, 12, 9, 5, 23, 5, 23, 12), 'brown', 2)
        poly(d, [(3, 5), (9, 1), (23, 1), (29, 5)], 'coral', 'ink')
        rect(d, (13, 8, 19, 12), 'white')
        line(d, (16, 8, 16, 12), 'coral')
        line(d, (14, 10, 18, 10), 'coral')
        line(d, (21, 19, 17, 30), 'brownlight', 2)
        for y in (22, 25, 28): line(d, (17, y, 23, y), 'brownlight')
    elif i == 8:
        shadow(d, (9, 27, 24, 30))
        poly(d, [(16, 1), (21, 5), (24, 14), (24, 26), (22, 29), (10, 29), (8, 26), (9, 14), (12, 5)], 'cyanlight', 'ink')
        line(d, (16, 3, 16, 27), 'cyan', 2)
        poly(d, [(12, 17), (16, 11), (20, 17), (16, 24)], 'coral', 'coraldark')
    elif i == 9:
        shadow(d)
        rect(d, (3, 23, 29, 27), 'brown', 'ink')
        rect(d, (5, 8, 7, 27), 'brownlight', 'ink')
        rect(d, (25, 8, 27, 27), 'brownlight', 'ink')
        for x, tint in ((10, 'cyan'), (17, 'coral'), (23, 'amber')):
            poly(d, [(x, 2), (x+2, 5), (x+2, 23), (x-2, 23), (x-2, 5)], tint, 'ink')
            line(d, (x, 7, x, 21), 'white')
        rect(d, (4, 17, 28, 19), 'brownlight', 'ink')
    elif i == 10:
        ell(d, (3, 12, 29, 27), 'coral', 'ink')
        ell(d, (10, 16, 22, 23), (0, 0, 0, 0), 'ink')
        line(d, (5, 15, 9, 17), 'white', 3)
        line(d, (25, 17, 28, 20), 'white', 3)
        line(d, (12, 26, 20, 26), 'coraldark')
    elif i == 11:
        ell(d, (6, 25, 27, 29), 'cyandark')
        line(d, (16, 7, 16, 3), 'darkgrey', 2)
        poly(d, [(16, 8), (22, 17), (23, 24), (8, 24), (10, 17)], 'coral', 'ink')
        rect(d, (10, 18, 22, 21), 'white', 'ink')
        rect(d, (14, 2, 19, 5), 'amber', 'ink')
        line(d, (8, 26, 13, 26, 19, 28, 26, 26), 'cyanlight')
    elif i == 12:
        line(d, (2, 3, 2, 28), 'brown', 2)
        line(d, (29, 3, 29, 28), 'brown', 2)
        rect(d, (3, 5, 28, 21), (255, 255, 255, 32), 'paper')
        for x in range(5, 28, 4): line(d, (x, 6, x, 20), 'paper')
        for y in range(8, 21, 4): line(d, (3, y, 28, y), 'paper')
        line(d, (3, 5, 28, 5), 'white', 2)
    elif i == 13:
        shadow(d, (8, 27, 25, 30))
        rect(d, (14, 4, 17, 29), 'grey', 'ink')
        line(d, (16, 5, 25, 5, 25, 9), 'greylight', 2)
        rect(d, (21, 8, 29, 10), 'darkgrey', 'ink')
        rect(d, (11, 19, 19, 21), 'cyan', 'ink')
        for x in (23, 26, 28): line(d, (x, 12, x-2, 20), 'cyanlight')
        ell(d, (18, 26, 30, 29), (89, 217, 221, 80))
    elif i == 14:
        shadow(d)
        for x, tint in ((3, 'cyan'), (18, 'green')):
            rect(d, (x, 9, x+11, 27), tint, 'ink')
            rect(d, (x-1, 7, x+12, 10), 'darkgrey', 'ink')
            rect(d, (x+3, 12, x+8, 15), 'ink')
            rect(d, (x+4, 20, x+7, 22), 'paper')
            line(d, (x+9, 17, x+9, 25), 'cyandark' if x == 3 else 'greendark')
    elif i == 15:
        poly(d, [(8, 2), (24, 2), (31, 29), (1, 29)], 'brown', 'ink')
        for y in range(4, 29, 4):
            span = 8-(y//5)
            line(d, (span, y, 31-span, y), 'brownlight', 2)
            line(d, (span+1, y, 31-span-1, y), 'amberlight')
        line(d, (12, 3, 5, 27), 'brownlight')
    elif i == 16:
        for x in (3, 15, 28):
            rect(d, (x-1, 7, x+1, 28), 'brownlight', 'ink')
            rect(d, (x-2, 6, x+2, 8), 'brown', 'ink')
        line(d, (3, 11, 7, 14, 11, 14, 15, 11, 20, 14, 24, 14, 28, 11), 'paper', 2)
        line(d, (3, 18, 8, 21, 12, 20, 15, 18, 21, 21, 25, 20, 28, 18), 'brownlight')
    elif i == 17:
        shadow(d, (0, 26, 31, 30))
        poly(d, [(0, 17), (30, 14), (27, 24), (21, 28), (7, 28), (3, 24)], 'brown', 'ink')
        poly(d, [(3, 17), (27, 15), (23, 21), (8, 23)], 'brownlight', 'ink')
        for x in (9, 18): line(d, (x, 16, x+2, 22), 'paper', 2)
        line(d, (4, 25, 23, 25), 'cyan')
        line(d, (3, 9, 23, 21), 'brownlight', 2)
        poly(d, [(1, 6), (7, 8), (8, 11), (4, 12)], 'amberlight', 'ink')
        rect(d, (20, 10, 26, 15), 'paper', 'ink')
        line(d, (21, 11, 25, 13), 'grey')
    elif i == 18:
        for x, y, tint in ((6, 19, 'corallight'), (18, 22, 'paper'), (26, 14, 'amberlight')):
            poly(d, [(x-4, y), (x-4, y-3), (x-2, y-5), (x+1, y-5), (x+4, y-2), (x+4, y), (x, y+2)], tint, 'brown')
            for dx in (-2, 0, 2): line(d, (x+dx, y-3, x, y+1), 'brownlight')
    elif i == 19:
        shadow(d)
        rect(d, (14, 15, 17, 27), 'brown', 'ink')
        ell(d, (9, 25, 23, 29), 'brown', 'ink')
        ell(d, (3, 8, 29, 18), 'brownlight', 'ink')
        line(d, (6, 11, 25, 11), 'amberlight')
        scene.cup(d, 18, 6)
        stool(d, 1, 21)
        stool(d, 23, 21)
    elif i == 20:
        shadow(d)
        rect(d, (7, 3, 25, 27), 'brownlight', 'ink')
        rect(d, (5, 17, 27, 28), 'brown', 'ink')
        rect(d, (7, 9, 25, 26), 'coral', 'ink')
        rect(d, (9, 5, 23, 11), 'white', 'ink')
        for y in (16, 20, 24): line(d, (8, y, 24, y), 'corallight')
        rect(d, (6, 27, 8, 30), 'brown', 'ink')
        rect(d, (24, 27, 26, 30), 'brown', 'ink')
    elif i == 21:
        shadow(d)
        for y in (8, 22):
            rect(d, (3, y, 29, y+6), 'brown', 'ink')
            rect(d, (5, y, 27, y+3), 'cyan', 'ink')
            rect(d, (7, y, 14, y+2), 'white')
        for x in (3, 27): rect(d, (x, 3, x+2, 30), 'brownlight', 'ink')
        for y in (16, 21, 26): line(d, (20, y, 26, y), 'brownlight')
        line(d, (20, 11, 20, 29), 'brownlight', 2)
        line(d, (5, 4, 28, 4), 'brownlight', 2)
    elif i == 22:
        shadow(d)
        rect(d, (6, 16, 26, 27), 'brownlight', 'ink')
        rect(d, (8, 18, 24, 22), 'brown', 'ink')
        rect(d, (15, 20, 17, 20), 'amberlight')
        rect(d, (6, 27, 9, 30), 'brown', 'ink')
        rect(d, (23, 27, 26, 30), 'brown', 'ink')
        rect(d, (15, 10, 17, 15), 'darkgrey', 'ink')
        poly(d, [(12, 3), (21, 3), (25, 10), (8, 10)], 'amberlight', 'ink')
        rect(d, (13, 14, 20, 16), 'darkgrey', 'ink')
    elif i == 23:
        shadow(d)
        box(d, 5)
        for y in (12, 21):
            line(d, (6, y, 25, y), 'brown', 2)
            for x, tint in ((8, 'coral'), (19, 'cyan')):
                ell(d, (x, y-4, x+6, y-1), tint, 'ink')
                line(d, (x, y-1, x+6, y-1), 'paper')
    elif i == 24:
        shadow(d)
        poly(d, [(6, 12), (27, 12), (25, 27), (8, 27)], 'paper', 'brown')
        ell(d, (5, 8, 28, 15), 'white', 'brown')
        for x, tint in ((10, 'coral'), (17, 'cyan'), (22, 'violet')):
            poly(d, [(x-3, 11), (x-2, 7), (x+3, 6), (x+4, 11)], tint, 'ink')
        for x in range(9, 25, 4): line(d, (x, 17, x-1, 25), 'brownlight')
        line(d, (10, 17, 25, 17), 'brownlight')
    elif i == 25:
        shadow(d)
        box(d, 20, 'paper')
        rect(d, (5, 17, 27, 21), 'white', 'ink')
        ell(d, (11, 16, 21, 20), 'grey', 'ink')
        line(d, (16, 17, 16, 14, 21, 14), 'greylight', 2)
        rect(d, (8, 2, 24, 14), 'brownlight', 'ink')
        rect(d, (10, 4, 22, 12), 'cyanlight', 'ink')
        line(d, (11, 5, 15, 5, 11, 9), 'white')
        line(d, (15, 22, 15, 26), 'grey')
    elif i == 26:
        shadow(d)
        poly(d, [(2, 15), (29, 15), (27, 24), (23, 28), (8, 28), (4, 24)], 'white', 'ink')
        ell(d, (2, 11, 30, 20), 'paper', 'ink')
        ell(d, (6, 13, 26, 18), 'cyanlight', 'grey')
        line(d, (6, 23, 24, 23), 'greylight')
        line(d, (8, 27, 6, 30), 'darkgrey', 2)
        line(d, (23, 27, 26, 30), 'darkgrey', 2)
        line(d, (25, 13, 25, 7, 21, 7), 'greylight', 2)
    elif i == 27:
        shadow(d)
        rect(d, (8, 2, 25, 29), 'paper', 'ink')
        rect(d, (9, 3, 24, 10), 'white')
        line(d, (8, 12, 25, 12), 'darkgrey')
        rect(d, (10, 6, 11, 9), 'darkgrey')
        rect(d, (10, 15, 11, 21), 'darkgrey')
        line(d, (24, 14, 24, 27), 'grey')
        rect(d, (19, 5, 21, 7), 'coral')
    elif i == 28:
        shadow(d)
        rect(d, (5, 11, 28, 28), 'white', 'ink')
        rect(d, (5, 8, 28, 14), 'darkgrey', 'ink')
        for x in (10, 22):
            ell(d, (x-3, 9, x+3, 12), 'ink')
            rect(d, (x-1, 15, x, 16), 'grey')
        rect(d, (8, 19, 25, 26), 'navy', 'ink')
        rect(d, (10, 20, 23, 23), 'navylight')
        rect(d, (9, 18, 25, 19), 'greylight')
        rect(d, (14, 4, 24, 10), 'grey', 'ink')
        ell(d, (13, 2, 25, 6), 'greylight', 'ink')
        line(d, (11, 6, 14, 6), 'darkgrey', 2)
        line(d, (24, 6, 28, 6), 'darkgrey', 2)
    elif i == 29:
        shadow(d)
        box(d, 16, 'paper')
        rect(d, (3, 11, 29, 17), 'grey', 'ink')
        rect(d, (5, 12, 17, 15), 'navylight', 'ink')
        rect(d, (7, 13, 15, 14), 'cyanlight')
        line(d, (11, 12, 11, 6, 17, 6, 17, 10), 'greylight', 2)
        rect(d, (21, 7, 26, 12), 'coral', 'ink')
        line(d, (24, 7, 24, 4), 'green', 2)
        line(d, (16, 18, 16, 26), 'grey')
        rect(d, (10, 20, 13, 20), 'darkgrey')
        rect(d, (20, 20, 23, 20), 'darkgrey')
    elif i == 30:
        shadow(d)
        box(d, 3)
        for y in (6, 15):
            for x, tint in ((8, 'coral'), (15, 'amber'), (22, 'green')):
                rect(d, (x-2, y+2, x+2, y+7), tint, 'ink')
                rect(d, (x-1, y, x+1, y+2), 'paper', 'ink')
                line(d, (x-1, y+4, x+1, y+4), 'white')
            line(d, (5, y+9, 26, y+9), 'brown', 2)
    elif i == 31:
        shadow(d)
        for x in (6, 25): rect(d, (x, 12, x+1, 27), 'darkgrey', 'ink')
        for y in (12, 22): rect(d, (4, y, 28, y+3), 'brownlight', 'ink')
        for x in (7, 25): ell(d, (x-2, 27, x+2, 31), 'darkgrey', 'ink')
        scene.cup(d, 7, 6)
        rect(d, (19, 4, 25, 11), 'grey', 'ink')
        rect(d, (20, 3, 24, 5), 'darkgrey', 'ink')
        ell(d, (14, 20, 23, 23), 'amberlight', 'brown')
        line(d, (17, 21, 21, 21), 'brownlight')
    elif i == 32:
        shadow(d)
        scene.table(d, 16, 20)
        rect(d, (7, 5, 23, 9), 'navy', 'ink')
        rect(d, (7, 9, 13, 17), 'navy', 'ink')
        rect(d, (19, 8, 22, 14), 'navy', 'ink')
        line(d, (21, 14, 21, 17), 'greylight')
        rect(d, (7, 15, 25, 17), 'darkgrey', 'ink')
        ell(d, (22, 6, 28, 12), 'darkgrey', 'ink')
        ell(d, (23, 7, 27, 11), 'paper', 'ink')
        rect(d, (14, 18, 25, 22), 'coral', 'coraldark')
        line(d, (16, 20, 23, 20), 'corallight')
    elif i == 33:
        shadow(d)
        line(d, (15, 2, 4, 29), 'brown', 2)
        line(d, (16, 2, 28, 29), 'brown', 2)
        line(d, (16, 15, 17, 30), 'brown', 2)
        rect(d, (5, 5, 27, 22), 'brownlight', 'ink')
        rect(d, (7, 7, 25, 20), 'cyanlight', 'ink')
        poly(d, [(8, 19), (14, 12), (18, 17), (24, 10), (25, 20)], 'green', 'greendark')
        ell(d, (10, 9, 14, 13), 'amberlight')
        rect(d, (3, 23, 29, 25), 'brownlight', 'ink')
    elif i == 34:
        shadow(d)
        rect(d, (4, 15, 28, 27), 'brownlight', 'ink')
        rect(d, (5, 13, 27, 16), 'brown', 'ink')
        ell(d, (8, 8, 16, 16), 'coral', 'ink')
        rect(d, (19, 9, 26, 15), 'cyan', 'ink')
        poly(d, [(5, 14), (6, 7), (9, 5), (11, 8), (11, 15)], 'amber', 'ink')
        rect(d, (11, 19, 21, 22), 'paper', 'brown')
        line(d, (14, 20, 18, 20), 'brownlight')
    elif i == 35:
        shadow(d)
        poly(d, [(9, 7), (21, 7), (25, 20), (6, 20)], 'coral', 'ink')
        line(d, (9, 7, 8, 18, 6, 27), 'brownlight', 2)
        line(d, (21, 7, 24, 18, 26, 27), 'brownlight', 2)
        rect(d, (6, 18, 26, 22), 'brownlight', 'ink')
        line(d, (4, 29, 10, 30, 22, 30, 29, 28), 'brown', 3)
        line(d, (10, 22, 9, 29), 'brownlight', 2)
        line(d, (23, 22, 25, 29), 'brownlight', 2)
        line(d, (11, 9, 20, 9), 'corallight')
    elif i == 36:
        shadow(d)
        rect(d, (8, 9, 26, 16), 'brownlight', 'ink')
        for x in (11, 24): line(d, (x, 16, x-5, 29), 'brown', 2)
        rect(d, (1, 20, 13, 24), 'brownlight', 'ink')
        rect(d, (20, 20, 31, 24), 'brownlight', 'ink')
        for x in (4, 10, 23, 28): line(d, (x, 24, x, 29), 'brown', 2)
        for y in (11, 14): line(d, (10, y, 24, y), 'amberlight')
    elif i == 37:
        shadow(d)
        rect(d, (10, 10, 23, 28), 'grey', 'ink')
        rect(d, (8, 8, 25, 13), 'greylight', 'ink')
        ell(d, (11, 9, 22, 11), 'navy')
        line(d, (19, 8, 19, 5, 22, 5), 'darkgrey', 2)
        rect(d, (14, 17, 19, 21), 'cyan', 'ink')
        line(d, (11, 25, 22, 25), 'darkgrey')
    elif i == 38:
        shadow(d, (8, 27, 25, 30))
        rect(d, (15, 7, 17, 29), 'darkgrey', 'ink')
        rect(d, (11, 28, 22, 30), 'darkgrey', 'ink')
        poly(d, [(10, 3), (23, 3), (21, 11), (12, 11)], 'amberlight', 'ink')
        rect(d, (9, 2, 24, 4), 'darkgrey', 'ink')
        line(d, (14, 4, 14, 9), 'white')
        line(d, (19, 4, 19, 9), 'amber')
        rect(d, (14, 0, 19, 2), 'darkgrey', 'ink')
    elif i == 39:
        shadow(d)
        rect(d, (5, 17, 28, 25), 'brownlight', 'ink')
        ell(d, (6, 24, 12, 30), 'darkgrey', 'ink')
        ell(d, (21, 24, 27, 30), 'darkgrey', 'ink')
        line(d, (7, 11, 6, 17), 'green', 2)
        line(d, (15, 9, 15, 17), 'green', 2)
        line(d, (24, 11, 25, 17), 'green', 2)
        for x, y in ((6, 10), (15, 7), (24, 10)): blossom(d, x, y)
        line(d, (28, 17, 31, 13), 'brown', 2)
    elif i in (40, 41):
        shadow(d, (6, 28, 26, 31))
        if i == 40:
            poly(d, [(8, 30), (12, 17), (18, 9), (22, 9), (17, 19), (14, 30)], 'brownlight', 'brown')
            for y in (17, 22, 27): line(d, (12-(y-17)//6, y, 16-(y-17)//6, y+1), 'brown')
            leaves(d, 19, 9)
            ell(d, (17, 10, 21, 13), 'brown', 'ink')
            ell(d, (22, 10, 25, 13), 'brown', 'ink')
        else:
            poly(d, [(14, 30), (13, 15), (15, 8), (18, 8), (20, 30)], 'brownlight', 'brown')
            for y in (17, 21, 25, 29): line(d, (15, y, 18, y-1), 'brown')
            leaves(d, 16, 9)
            ell(d, (12, 10, 16, 13), 'brown', 'ink')
            ell(d, (18, 10, 22, 13), 'brown', 'ink')
    elif i == 42:
        for x, y in ((6, 26), (15, 29), (26, 24)):
            for dx, dy in ((-5, -10), (-2, -15), (2, -13), (5, -8)):
                line(d, (x, y, x+dx, y+dy), 'greendark', 2)
                line(d, (x, y-1, x+dx, y+dy), 'greenlight')
            ell(d, (x-2, y-2, x+3, y), 'green')
    elif i == 43:
        shadow(d)
        for x, y, r in ((7, 18, 6), (15, 12, 7), (24, 17, 7), (15, 23, 7)):
            ell(d, (x-r, y-r, x+r, y+r), 'green', 'greendark')
            line(d, (x-2, y-2, x+1, y-2), 'greenlight')
        for x, y in ((6, 19), (17, 12), (25, 18)): rect(d, (x, y, x+1, y+1), 'amber')
    elif i == 44:
        for x, y in ((5, 20), (11, 15), (17, 22), (26, 16)):
            ell(d, (x-4, y-2, x+4, y+2), 'green', 'greendark')
            line(d, (x, y, x+7, y+3), 'greendark')
            blossom(d, x, y-1, 'pink')
    elif i == 45:
        shadow(d)
        for x, y in ((2, 13), (5, 5), (11, 4), (16, 0), (23, 5), (29, 12), (30, 23)):
            poly(d, [(15, 27), (x, y), (x+2 if x < 16 else x-2, y+7), (18, 27)], 'green', 'greendark')
            line(d, (16, 26, x, y+2), 'greenlight')
    elif i == 46:
        shadow(d)
        for x, y in ((2, 17), (8, 10), (15, 7), (23, 11), (30, 18)):
            poly(d, [(15, 27), (x, y), (x+1, y+6), (19, 27)], 'green', 'greendark')
            line(d, (16, 25, x+1, y+2), 'greenlight')
        line(d, (16, 24, 16, 7), 'coraldark', 2)
        for y in (6, 10, 14): poly(d, [(12, y), (16, y-3), (20, y), (16, y+2)], 'coral', 'coraldark')
        rect(d, (15, 3, 17, 5), 'amberlight')
    elif i == 47:
        shadow(d)
        for x, y in ((7, 18), (16, 13), (24, 20)):
            ell(d, (x-6, y-6, x+6, y+6), 'green', 'greendark')
            line(d, (x-3, y-3, x, y-3), 'greenlight')
            blossom(d, x, y, 'coral')
    elif 48 <= i <= 55:
        fills = ['#dbc394', '#b5a181', '#d8c091', '#bcb5a2', '#ded8c9', P['brownlight'], '#ba806a', '#c7bfad']
        rect(d, (0, 0, 31, 31), fills[i-48])
        if i in (48, 49, 50):
            for j in range(24):
                x, y = (j*11+3)%32, (j*7+5)%32
                rect(d, (x, y, x+1, y), '#ad9673' if i == 49 else '#baa578')
            for x, y in ((8, 4), (23, 17), (5, 29)): rect(d, (x, y, x+1, y), FLOOR_COLORS[i-48][2])
            if i == 50:
                for x, y in ((12, 7), (17, 14), (10, 22), (18, 29)):
                    ell(d, (x, y, x+2, y+4), '#af9873')
                    rect(d, (x+1, y-2, x+2, y-1), '#af9873')
        elif i == 51:
            for y in range(0, 32, 8):
                line(d, (0, y, 31, y), '#8f8f82')
                for x in range((y//8%2)*8, 32, 16): line(d, (x, y, x, y+8), '#8f8f82')
            line(d, (1, 2, 13, 2), '#ded8c9')
        elif i == 52:
            for y in range(-8, 33, 16):
                for x in range(32):
                    yy = y+round(4*math.sin(x*math.pi/16))
                    rect(d, (x, yy, x, yy+4), '#4f5961')
            for x, y in ((10, 2), (24, 15), (9, 29)): rect(d, (x, y, x, y), '#eeeada')
        elif i == 53:
            for y in range(0, 32, 8):
                line(d, (0, y, 31, y), 'brown')
                line(d, (2, y+2, 29, y+2), 'amberlight')
                line(d, (8 if y%16 == 0 else 23, y, 8 if y%16 == 0 else 23, y+7), 'brown')
                for x in (3, 28): rect(d, (x, y+4, x, y+4), 'brown')
        elif i == 54:
            for x in (0, 16, 31): line(d, (x, 0, x, 31), '#e0b7a1')
            for y in (0, 16, 31): line(d, (0, y, 31, y), '#e0b7a1')
            for x, y in ((4, 4), (20, 4), (4, 20), (20, 20)): line(d, (x, y, x+7, y), '#d09477')
        else:
            for j in range(37):
                x, y = (j*13+2)%32, (j*9+3)%32
                ell(d, (x, y, x+2, y+1), ['#aaa89b', '#e7dfce', '#9a9c91'][j%3])
    elif i == 56:
        shadow(d)
        rect(d, (15, 5, 17, 29), 'brown', 'ink')
        rect(d, (10, 29, 22, 30), 'brownlight', 'ink')
        poly(d, [(12, 4), (19, 4), (24, 8), (21, 12), (19, 11), (20, 16), (26, 26), (6, 26), (12, 16), (13, 11), (11, 12), (8, 8)], 'coral', 'ink')
        line(d, (13, 5, 16, 8, 19, 5), 'corallight')
        line(d, (12, 16, 20, 16), 'coraldark')
        for x, y in ((14, 11), (18, 13), (13, 20), (20, 22), (10, 24)):
            rect(d, (x, y, x+2, y+1), 'amberlight')
            rect(d, (x+1, y-1, x+1, y+2), 'white')
    elif i == 57:
        shadow(d)
        line(d, (5, 6, 15, 1, 26, 6), 'brownlight', 2)
        line(d, (15, 1, 15, 0), 'darkgrey')
        poly(d, [(10, 7), (13, 6), (18, 6), (22, 7), (28, 16), (23, 19), (20, 14), (22, 27), (8, 27), (10, 14), (7, 19), (3, 16)], 'violet', 'ink')
        line(d, (13, 7, 15, 10, 18, 7), 'paper')
        for x, y in ((10, 13), (19, 13), (12, 22), (18, 22)):
            poly(d, [(x, y-2), (x+2, y), (x, y+2), (x-2, y)], 'amberlight')
        line(d, (9, 25, 20, 25), 'violetlight')
    elif i == 58:
        shadow(d)
        line(d, (4, 4, 13, 0, 22, 4), 'brownlight', 2)
        poly(d, [(8, 5), (11, 4), (16, 4), (19, 5), (26, 11), (22, 16), (18, 13), (18, 21), (8, 21), (8, 13), (4, 16), (1, 11)], 'cyan', 'ink')
        line(d, (11, 5, 13, 7, 16, 5), 'white')
        rect(d, (9, 11, 17, 13), 'white')
        poly(d, [(10, 23), (27, 23), (28, 30), (20, 30), (19, 26), (17, 30), (9, 30)], 'navy', 'ink')
        line(d, (11, 25, 25, 25), 'navylight')
    elif i == 59:
        shadow(d)
        rect(d, (15, 20, 17, 27), 'brownlight', 'ink')
        ell(d, (9, 26, 23, 30), 'brown', 'ink')
        ell(d, (6, 4, 26, 24), '#b4a18b', 'ink')
        poly(d, [(6, 12), (7, 7), (12, 3), (20, 3), (25, 7), (27, 12), (24, 16), (8, 16)], 'violet', 'ink')
        line(d, (8, 8, 24, 13), 'violetlight', 2)
        line(d, (8, 12, 21, 5), 'amberlight', 2)
        poly(d, [(10, 8), (15, 5), (18, 9), (14, 14)], 'violet', 'violetdark')
        line(d, (9, 16, 23, 16), 'violetdark')
    elif i == 60:
        shadow(d)
        poly(d, [(3, 13), (22, 8), (29, 23), (10, 29)], 'amber', 'ink')
        poly(d, [(6, 14), (21, 11), (26, 22), (11, 26)], 'coral', 'coraldark')
        for x, y in ((11, 16), (18, 14), (15, 23), (23, 21)):
            line(d, (x-2, y, x+2, y), 'amberlight')
            line(d, (x, y-2, x, y+2), 'white')
        line(d, (5, 16, 11, 28), 'corallight')
    elif i == 61:
        shadow(d)
        rect(d, (4, 23, 28, 27), 'brownlight', 'ink')
        for x, y in ((7, 9), (19, 13)):
            ell(d, (x, y, x+8, y+13), 'brown', 'ink')
            line(d, (x+2, y+3, x+4, y+6, x+6, y+3), 'coral', 2)
            line(d, (x+4, y+6, x+4, y+9), 'coral', 2)
            line(d, (x+2, y+11, x+6, y+11), 'brownlight')
    elif i == 62:
        shadow(d)
        line(d, (3, 5, 27, 5), 'brownlight', 2)
        line(d, (6, 3, 6, 28), 'brown', 2)
        line(d, (26, 3, 26, 28), 'brown', 2)
        poly(d, [(7, 8), (11, 8), (12, 13), (13, 8), (16, 8), (18, 17), (15, 25), (12, 20), (9, 25), (6, 17)], 'coral', 'ink')
        line(d, (8, 10, 11, 13, 14, 10), 'white')
        poly(d, [(20, 8), (25, 8), (30, 11), (27, 14), (26, 12), (27, 23), (19, 23), (20, 12), (18, 14), (16, 11)], 'paper', 'ink')
        line(d, (23, 9, 23, 22), 'amber')
        for y in (13, 16, 19): rect(d, (24, y, 24, y), 'brown')
    elif i == 63:
        shadow(d)
        rect(d, (4, 21, 29, 26), 'brownlight', 'ink')
        rect(d, (7, 7, 16, 19), 'coral', 'ink')
        ell(d, (8, 3, 15, 10), None, 'coraldark')
        rect(d, (9, 10, 14, 12), 'corallight')
        for x in (21, 27): ell(d, (x-1, 15, x+1, 19), 'amber', 'ink')
        rect(d, (17, 7, 22, 11), None, 'darkgrey')
        rect(d, (24, 7, 29, 11), None, 'darkgrey')
        line(d, (22, 8, 24, 8), 'darkgrey')
    else:
        raise ValueError(i)
    return im

def metadata(i, id, name, category):
    footprint = scene.rect_footprint(.12, .60, .76, .30)
    anchors = {'approach': scene.anchor(.50, 1.14, 'north', 'observing')}
    layer, interaction, colors = 'object', 'observe', {}
    if i in (0, 1, 8, 13, 38): footprint = scene.rect_footprint(.40, .80, .20, .15)
    if i in (4, 10, 15, 18, 42, 44): footprint, layer = None, 'ground'
    if i in (20, 21, 25, 27, 28, 29, 30): footprint = scene.rect_footprint(.15, .30, .68, .58)
    if i in (40, 41): footprint = scene.rect_footprint(.35, .82, .28, .12)
    if i in (2, 3, 19, 35, 36):
        interaction = 'sit'
        anchors['seat'] = scene.anchor(.50, .67, 'south', 'sitting')
    if i in (7, 9, 12, 14, 16, 17): footprint = scene.rect_footprint(.08, .45, .85, .44)
    if i in (16, 17, 19, 20, 21, 22, 23, 30, 31, 32, 33, 34, 35, 36, 39):
        colors['wood'] = [P[k] for k in ('brown', 'brownlight', 'amberlight')]
    if i in (0, 2, 4, 20, 24, 35, 56, 60): colors['fabric'] = [P[k] for k in ('coraldark', 'coral', 'corallight')]
    if i in (1, 3, 6, 58): colors['fabric'] = [P[k] for k in ('cyandark', 'cyan', 'cyanlight')]
    if i in (57, 59): colors['fabric'] = [P[k] for k in ('violetdark', 'violet', 'violetlight')]
    if 40 <= i <= 47: colors['foliage'] = [P[k] for k in ('greendark', 'green', 'greenlight')]
    if i in (39, 46, 47): colors['flowers'] = [P[k] for k in ('coraldark', 'coral', 'corallight')]
    if 48 <= i <= 55:
        footprint, layer, interaction, anchors = None, 'ground', 'none', {}
        colors['floor'] = FLOOR_COLORS[i-48]
    record = {'index': i, 'id': id, 'name': name, 'category': category, 'solidFootprint': footprint, 'anchors': anchors, 'layer': layer, 'interaction': interaction, 'colorRoles': colors, 'sourceRect': {'x': i%8*32, 'y': i//8*32, 'width': 32, 'height': 32}}
    if 48 <= i <= 55: record['floorTile'] = True
    if 56 <= i <= 63:
        record['description'] = 'Peça contemporânea de uso cotidiano. A roupa e o acessório são escolhas pessoais; não indicam religião ou identidade por si só.'
        record['artStatus'] = 'Desenho original em pixel art, sem reprodução de uma estampa existente.'
    return record

ANIMALS = [
    ('dog-mongrel', 'Cachorro sem raça definida', 'dog', 'land'),
    ('dog-retriever', 'Golden retriever', 'dog', 'land'),
    ('cat-tabby', 'Gato de pelagem tigrada', 'cat', 'land'),
    ('cat-tuxedo', 'Gato de pelagem preta e branca', 'cat', 'land'),
    ('shore-crab', 'Caranguejo da praia', 'crab', 'shore'),
    ('gull', 'Gaivota', 'bird', 'shore'),
    ('sea-turtle', 'Tartaruga marinha', 'turtle', 'water'),
    ('shoaling-fish', 'Peixe de cardume', 'fish', 'water'),
]

def animal(row, frame):
    im = empty()
    d = ImageDraw.Draw(im)
    shift = [0, -1, 0, 1][frame]
    if row in (0, 1):
        fill = '#ab7651' if row == 0 else '#d1a15b'
        light = '#d4a176' if row == 0 else '#e8c680'
        shade = '#76503e' if row == 0 else '#ab783d'
        shadow(d, (3, 27, 29, 30))
        for x, flip in ((9, 1), (21, -1)):
            xx = x+shift*flip
            rect(d, (xx, 21, xx+3, 28), fill, 'ink')
            rect(d, (xx+1, 26, xx+4, 28), light, 'ink')
        ell(d, (5, 13, 25, 24), fill, 'ink')
        rect(d, (11, 14, 19, 16), light)
        if row == 0:
            line(d, (6, 17, 3, 10-shift), shade, 3)
            poly(d, [(18, 10), (18, 5), (22, 8)], shade, 'ink')
        else:
            line(d, (6, 18, 2, 13, 2, 9-shift), fill, 4)
            line(d, (3, 13, 3, 10-shift), light, 2)
        ell(d, (17, 8, 28, 19), fill, 'ink')
        ell(d, (23, 12, 31, 18), light, 'ink')
        rect(d, (28, 13, 30, 15), 'ink')
        rect(d, (24, 10, 24, 11), 'ink')
        if row == 0:
            poly(d, [(19, 8), (22, 8), (20, 15), (17, 13)], shade, 'ink')
            rect(d, (10, 17, 14, 20), shade)
        else:
            poly(d, [(18, 8), (21, 9), (21, 17), (18, 15), (16, 11)], shade, 'ink')
            line(d, (6, 21, 8, 24, 20, 24), light)
        line(d, (18, 18, 22, 20), 'cyan', 2)
    elif row in (2, 3):
        fill = '#9c8572' if row == 2 else '#333345'
        light = '#c9b7a0' if row == 2 else '#eeeada'
        shade = '#5c514a' if row == 2 else '#1b2039'
        shadow(d, (4, 27, 28, 30))
        line(d, (8, 20, 4, 14, 4, 7+shift, 7, 6+shift), fill, 3)
        for x, flip in ((11, 1), (22, -1)):
            rect(d, (x+shift*flip, 21, x+2+shift*flip, 28), fill, 'ink')
            rect(d, (x+shift*flip, 27, x+3+shift*flip, 28), light)
        ell(d, (7, 15, 25, 25), fill, 'ink')
        poly(d, [(19, 10), (20, 4), (24, 8), (27, 4), (29, 11)], fill, 'ink')
        ell(d, (18, 8, 30, 19), fill, 'ink')
        ell(d, (23, 12, 31, 18), light, 'ink')
        rect(d, (27, 12, 28, 12), 'pink')
        rect(d, (22, 10, 23, 11), 'greenlight')
        if row == 2:
            for x in (11, 15, 19): line(d, (x, 16, x-1, 20), shade, 2)
            line(d, (20, 8, 23, 8), shade)
        else:
            poly(d, [(19, 17), (23, 17), (23, 23), (19, 24)], light)
        line(d, (24, 17, 29, 17), shade)
        line(d, (26, 14, 31, 13), 'paper')
    elif row == 4:
        shadow(d, (6, 26, 27, 29))
        for x, dir in ((8, -1), (23, 1)):
            for y in (18, 21, 24): line(d, (x, y, x+dir*(5+shift), y+2), 'coraldark', 2)
        ell(d, (7, 14, 25, 25), 'coral', 'ink')
        line(d, (8, 17, 4, 10-shift), 'coraldark', 2)
        line(d, (24, 17, 28, 10+shift), 'coraldark', 2)
        for x, yy in ((4, 9-shift), (28, 9+shift)):
            ell(d, (x-3, yy-3, x+2, yy+3), 'coral', 'ink')
            rect(d, (x, yy-3, x+3, yy), (0, 0, 0, 0))
        line(d, (12, 14, 12, 11, 14, 11), 'ink')
        line(d, (20, 14, 20, 11, 18, 11), 'ink')
        line(d, (11, 18, 20, 18), 'corallight')
    elif row == 5:
        shadow(d, (7, 27, 28, 30))
        line(d, (13, 22, 12+shift, 28, 16+shift, 28), 'amberdark')
        line(d, (21, 22, 22-shift, 28, 26-shift, 28), 'amberdark')
        poly(d, [(5, 23), (2, 18), (11, 16), (19, 15), (26, 19), (24, 24)], 'paper', 'ink')
        ell(d, (19, 9, 28, 20), 'white', 'ink')
        poly(d, [(27, 13), (31, 15), (27, 17)], 'amber', 'ink')
        rect(d, (25, 12, 25, 13), 'ink')
        if frame in (1, 3):
            poly(d, [(10, 19), (9, 6 if frame == 1 else 24), (16, 12 if frame == 1 else 28), (20, 20)], 'greylight', 'ink')
            line(d, (10, 19, 14, 12 if frame == 1 else 26), 'white')
        else:
            poly(d, [(9, 18), (19, 18), (22, 23), (14, 24)], 'greylight', 'ink')
            line(d, (10, 20, 17, 22), 'white')
    elif row == 6:
        shadow(d, (4, 25, 29, 29))
        for x, y, dx in ((7, 12, -4), (9, 24, -4), (24, 13, 4), (24, 23, 4)):
            poly(d, [(x, y), (x+dx, y+shift), (x+dx, y+5+shift), (x, y+3)], '#6b9a80', 'greendark')
        ell(d, (7, 8, 26, 27), '#53795e', 'ink')
        ell(d, (10, 10, 23, 24), '#88a579', 'greendark')
        poly(d, [(15, 11), (20, 12), (22, 17), (20, 22), (14, 23), (11, 18)], '#6b925f', 'greendark')
        line(d, (13, 14, 20, 19), '#b0c991')
        ell(d, (13, 2+shift, 21, 11+shift), '#6b9a80', 'ink')
        rect(d, (18, 4+shift, 18, 5+shift), 'ink')
        poly(d, [(16, 27), (18, 27), (17, 30)], '#6b9a80', 'greendark')
    elif row == 7:
        poly(d, [(9, 16), (2, 10+shift), (3, 22-shift)], 'cyan', 'cyandark')
        ell(d, (8, 10, 28, 23), 'cyan', 'ink')
        poly(d, [(15, 12), (17, 6), (21, 12)], 'cyandark', 'ink')
        line(d, (11, 17, 25, 17), 'cyanlight', 2)
        line(d, (19, 21, 21, 25), 'cyandark', 2)
        ell(d, (24, 13, 26, 15), 'ink')
        line(d, (27, 18, 29, 18), 'cyandark')
        line(d, (11, 13, 11, 20), 'cyandark')
    return im

def preview_grid(sprites, names, columns, path):
    h = ((len(sprites)+columns-1)//columns)*160
    im = Image.new('RGB', (columns*160, h), '#e7dfcc')
    d = ImageDraw.Draw(im)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    except OSError: font = ImageFont.load_default()
    for i, (sprite, name) in enumerate(zip(sprites, names)):
        x, y = i%columns*160, i//columns*160
        rect(d, (x+6, y+5, x+153, y+119), '#ded3b9')
        scaled = sprite.resize((112, 112), Image.Resampling.NEAREST)
        im.paste(scaled, (x+24, y+5), scaled)
        rows = ['']
        for word in f'{i:02d} {name}'.split():
            text = (rows[-1]+' '+word).strip()
            if d.textlength(text, font=font) > 146: rows.append(word)
            else: rows[-1] = text
        for row, text in enumerate(rows[:3]): d.text((x+7, y+121+row*13), text, fill=P['navy'], font=font)
    im.save(path, optimize=True)

def main():
    out = ROOT / 'assets' / 'tilesets'
    atlas = empty(256, 256)
    sprites, records = [], []
    for i, (id, name, category) in enumerate(PROPS):
        im = prop(i)
        sprites.append(im)
        atlas.alpha_composite(im, (i%8*32, i//8*32))
        records.append(metadata(i, id, name, category))
        alpha = im.getchannel('A').getextrema()
        if (48 <= i <= 55 and alpha != (255, 255)) or (not 48 <= i <= 55 and alpha != (0, 255)):
            raise ValueError((id, alpha))
    if len({im.tobytes() for im in sprites}) != 64: raise ValueError('Sprites duplicados')
    atlas.save(out / 'beach-props.png', optimize=True)
    manifest = {'version': '1.8', 'license': 'CC0-1.0', 'attributionRequired': False, 'author': 'Original VOICES pixel art', 'atlas': 'assets/tilesets/beach-props.png', 'generator': 'tools/create_beach_assets.py', 'tileSize': 32, 'columns': 8, 'rows': 8, 'coordinateUnits': 'tile-fraction', 'sourceRectUnits': 'pixel', 'colorRoleConvention': 'Exact RGB shadow, body and highlight. Preserve outlines, alpha and unlisted colors.', 'artStatus': 'All pixels, clothing prints and floor motifs are original artwork for VOICES. No sacred object or copied clothing pattern is used as generic decoration.', 'palette': P, 'props': records}
    (out / 'beach-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    animals = empty(128, 256)
    animal_sprites, animal_records = [], []
    for row, (id, name, kind, habitat) in enumerate(ANIMALS):
        frames = [animal(row, f) for f in range(4)]
        for f, im in enumerate(frames):
            if im.getchannel('A').getextrema() != (0, 255): raise ValueError((id, f))
            animals.alpha_composite(im, (f*32, row*32))
        animal_sprites.append(frames[0])
        animal_records.append({'index': row, 'row': row, 'id': id, 'name': name, 'kind': kind, 'habitat': habitat, 'frameCount': 4, 'frameWidth': 32, 'frameHeight': 32, 'frameDuration': .2, 'sourceRect': {'x': 0, 'y': row*32, 'width': 32, 'height': 32}, 'artStatus': 'Original pixel art; stylized species silhouette, not scientific species identification.'})
    char = ROOT / 'assets' / 'characters'
    animals.save(char / 'coast-animals.png', optimize=True)
    animal_manifest = {'version': '1.8', 'license': 'CC0-1.0', 'attributionRequired': False, 'author': 'Original VOICES pixel art', 'atlas': 'assets/characters/coast-animals.png', 'generator': 'tools/create_beach_assets.py', 'tileSize': 32, 'columns': 4, 'rows': 8, 'animals': animal_records, 'wildlifeNote': 'Observe wildlife without touching, feeding or collecting it. Sea turtles are wildlife and are not pets.'}
    (char / 'coast-animals-manifest.json').write_text(json.dumps(animal_manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    jsrecords = [{**r, 'family': 'beach', 'solid': bool(r['solidFootprint'])} for r in records]
    source = 'data:image/png;base64,'+base64.b64encode((out / 'beach-props.png').read_bytes()).decode('ascii')
    js = "(function(){'use strict';const V=window.V;V.beachAssets="+json.dumps(jsrecords, ensure_ascii=False, separators=(',', ':'))+";V.sceneAssets.push(...V.beachAssets);V.beachMaterialSources={beach:"+json.dumps(source)+"};V.coastAnimals="+json.dumps(animal_records, ensure_ascii=False, separators=(',', ':'))+";})();\n"
    (ROOT / 'js' / 'beach-assets.js').write_text(js, encoding='utf-8')
    preview_grid(sprites, [p[1] for p in PROPS], 8, ROOT / 'tests' / 'beach-assets-preview.png')
    preview_grid(animal_sprites, [a[1] for a in ANIMALS], 4, ROOT / 'tests' / 'coast-animals-preview.png')
    print(json.dumps({'props': len(records), 'uniqueCells': len({s.tobytes() for s in sprites}), 'floors': 8, 'animatedAnimals': 8, 'animalFrames': 32, 'alpha': atlas.getchannel('A').getextrema(), 'recolorable': sum(bool(r['colorRoles']) for r in records)}))

if __name__ == '__main__':
    main()
