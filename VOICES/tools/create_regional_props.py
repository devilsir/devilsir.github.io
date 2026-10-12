from pathlib import Path
import importlib.util
import base64
import json
from PIL import Image, ImageDraw, ImageFont, ImageColor

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_regional_palette', ROOT / 'tools' / 'create_scene_assets.py')
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
base = scene.base
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty
P = base.P
W = ['#624535', P['brown'], P['brownlight']]
F = ['#2b5355', '#588e7d', '#9abfa5']
AWNING_RED = ['#913f4f', '#c16660', '#e7a995']
AWNING_GOLD = [P['amberdark'], P['amber'], P['amberlight']]
M = [P['darkgrey'], P['grey'], P['greylight']]
S = ['#6d6c69', '#a6a293', '#d4cdb8']
G = [P['greendark'], P['green'], P['greenlight']]
GLASS = ['#426c77', '#759ca2', '#b5d3cb']
PROPS = [
    ('fruit-work-stall', 'Banca de frutas com toldo e bancada', 'market', 'object', 'observe'),
    ('food-tray-counter', 'Tabuleiro de comida com bandejas e potes', 'market', 'object', 'observe'),
    ('textile-workshop-canopy', 'Cobertura da oficina de tecidos', 'market', 'canopy', 'observe'),
    ('braiding-care-station', 'Estação da trancista com espelho', 'market', 'object', 'observe'),
    ('refreshment-cart-canopy', 'Toldo do carrinho de refrescos', 'hub', 'canopy', 'observe'),
    ('square-music-shelter', 'Abrigo pequeno para música da praça', 'hub', 'canopy', 'observe'),
    ('library-light-column', 'Coluna de iluminação da biblioteca', 'library', 'object', 'observe'),
    ('cat-cushioned-basket', 'Cesta almofadada de descanso do gato', 'library', 'object', 'observe'),
    ('reading-lamp-books', 'Mesa com luminária e livros', 'library', 'object', 'observe'),
    ('low-garden-fence', 'Cerca baixa de canteiro', 'garden', 'object', 'observe'),
    ('garden-tool-shed', 'Depósito de ferramentas da horta', 'garden', 'object', 'observe'),
    ('water-barrel-tap', 'Barril de água com torneira', 'garden', 'object', 'observe'),
    ('open-rehearsal-roof', 'Cobertura do ensaio aberto', 'chapter-1', 'canopy', 'observe'),
    ('studio-glazed-partition', 'Partição acústica do estúdio com vidro', 'room-1', 'object', 'observe'),
    ('protected-museum-case', 'Vitrine de exposição com base', 'room-2', 'object', 'observe'),
    ('conservation-articulated-lamp', 'Luminária articulada de conservação', 'room-2', 'object', 'observe'),
    ('experimental-bed-fence', 'Canteiro experimental cercado com etiquetas', 'chapter-3', 'object', 'observe'),
    ('laboratory-window-divider', 'Divisória do laboratório com visor', 'room-3', 'object', 'observe'),
    ('avenue-news-stall', 'Banca de jornal da avenida', 'chapter-4', 'object', 'observe'),
    ('interview-fabric-booth', 'Cabine de entrevista com painel de tecido', 'room-4', 'object', 'observe'),
    ('community-pergola', 'Pérgola do centro comunitário', 'chapter-5', 'canopy', 'observe'),
    ('inward-arc-seat', 'Assento em arco voltado à roda', 'room-5', 'object', 'sit'),
    ('civic-archive-gallery', 'Módulo de galeria do arquivo cívico', 'chapter-6', 'object', 'observe'),
    ('organized-control-divider', 'Divisória do controle com cabos organizados', 'room-6', 'object', 'observe'),
]

def shadow(d, box=(2, 27, 30, 30)):
    ell(d, box, (17, 23, 41, 40))

def wood(d, box, tone=1):
    rect(d, box, W[tone], 'ink')
    line(d, (box[0]+1, box[1]+1, box[2]-1, box[1]+1), W[2])

def metal(d, box, tone=1):
    rect(d, box, M[tone], 'ink')
    line(d, (box[0]+1, box[1]+1, box[2]-1, box[1]+1), M[2])
    line(d, (box[0]+1, box[3]-1, box[2]-1, box[3]-1), M[0])

def post(d, x, y=6, bottom=29):
    wood(d, (x, y, x+2, bottom), 0)
    line(d, (x+1, y+1, x+1, bottom-1), W[2])

def book(d, x, y, tint='coral', height=7):
    rect(d, (x, y, x+3, y+height), tint, 'ink')
    line(d, (x+1, y+1, x+1, y+height-1), 'paper')

def leaf(d, x, y):
    line(d, (x, y+3, x, y-3), G[0])
    poly(d, [(x, y), (x-4, y-2), (x-3, y-4), (x, y-2)], G[1], G[0])
    poly(d, [(x, y-1), (x+3, y-4), (x+4, y-2), (x+1, y+1)], G[2], G[0])

def prop(i):
    im = empty()
    d = ImageDraw.Draw(im)
    shadow(d)
    if i == 0:
        post(d, 2); post(d, 27)
        poly(d, [(0, 10), (5, 3), (26, 3), (31, 10)], AWNING_RED[0], 'ink')
        for x in (6, 15, 24): poly(d, [(x-2, 4), (x+2, 4), (x+4, 9), (x-3, 9)], AWNING_RED[2], AWNING_RED[1])
        wood(d, (1, 19, 30, 28), 0); wood(d, (1, 17, 30, 21), 2)
        for x0, x1 in ((3, 13), (18, 28)):
            rect(d, (x0, 14, x1, 20), W[1], 'ink'); line(d, (x0+1, 19, x1-1, 19), W[2])
        for x, y, tint in ((5, 16, 'coral'), (9, 15, 'amber'), (20, 16, 'green'), (24, 16, 'amberlight')):
            ell(d, (x-2, y-2, x+2, y+2), tint, 'ink'); rect(d, (x, y-3, x+1, y-3), G[0])
        rect(d, (14, 18, 17, 20), 'paper', 'grey'); line(d, (3, 24, 27, 24), W[1])
    elif i == 1:
        post(d, 4, 20); post(d, 25, 20)
        poly(d, [(1, 13), (25, 9), (30, 17), (6, 22)], W[2], 'ink')
        poly(d, [(6, 22), (30, 17), (30, 23), (6, 27)], W[1], 'ink')
        line(d, (8, 25, 28, 21), W[0])
        poly(d, [(5, 13), (14, 11), (18, 16), (8, 18)], M[0], 'ink')
        poly(d, [(7, 13), (13, 12), (15, 15), (9, 16)], M[1], 'ink')
        for x, y in ((9, 13), (12, 13), (11, 15)): ell(d, (x-1, y-1, x+1, y+1), 'amberdark', 'ink'); rect(d, (x, y, x, y), 'amberlight')
        for x, y, tint in ((21, 10, 'coral'), (26, 12, 'green'), (20, 16, 'paper')):
            rect(d, (x-2, y, x+2, y+4), tint, 'ink'); ell(d, (x-2, y-1, x+2, y+1), 'paper', 'ink')
        line(d, (8, 19, 16, 17), M[2]); rect(d, (5, 10, 8, 11), 'paper', 'grey')
    elif i == 2:
        post(d, 2); post(d, 27)
        poly(d, [(0, 10), (4, 4), (27, 4), (31, 10)], F[0], 'ink')
        poly(d, [(4, 5), (25, 5), (28, 8), (3, 8)], F[1]); line(d, (5, 6, 25, 6), F[2])
        wood(d, (1, 20, 12, 28), 0); wood(d, (0, 18, 13, 22), 2)
        wood(d, (22, 17, 30, 28), 1)
        for box, tint in (((2, 14, 11, 17), 'violet'), ((3, 11, 11, 13), 'amber'), ((23, 20, 28, 22), 'coral')):
            rect(d, box, tint, 'ink'); line(d, (box[0]+1, box[1]+1, box[2]-1, box[1]+1), 'paper')
        for x, tint in ((23, F[1]), (27, 'coraldark')):
            rect(d, (x, 10, x+2, 18), tint, 'ink'); ell(d, (x, 9, x+2, 11), 'paper', 'ink')
        line(d, (5, 26, 10, 26), W[2]); line(d, (23, 27, 29, 27), W[0])
    elif i == 3:
        wood(d, (19, 9, 29, 26), 0); wood(d, (18, 21, 30, 24), 2)
        ell(d, (19, 1, 29, 14), W[1], 'ink'); ell(d, (21, 3, 27, 12), GLASS[1], 'ink')
        line(d, (22, 4, 25, 4), GLASS[2]); line(d, (22, 6, 24, 8), GLASS[2])
        rect(d, (8, 13, 18, 21), F[0], 'ink'); rect(d, (10, 14, 16, 20), F[1]); line(d, (11, 15, 15, 15), F[2])
        poly(d, [(7, 20), (19, 20), (21, 25), (5, 25)], F[1], 'ink')
        metal(d, (12, 25, 15, 29), 0); line(d, (13, 28, 5, 30, 22, 30), M[1], 2)
        wood(d, (0, 18, 6, 25), 1); rect(d, (1, 16, 5, 19), 'paper', 'ink')
        line(d, (2, 17, 4, 17), M[0]); rect(d, (21, 18, 26, 20), 'amberlight', 'ink')
        for x in (22, 24, 26): line(d, (x, 20, x, 21), M[0])
        rect(d, (28, 16, 30, 20), 'coral', 'ink')
    elif i == 4:
        post(d, 2, 8); post(d, 27, 8)
        poly(d, [(0, 10), (6, 3), (25, 3), (31, 10)], 'amberdark', 'ink')
        poly(d, [(5, 4), (10, 4), (8, 9), (2, 9)], 'amberlight')
        poly(d, [(16, 4), (21, 4), (24, 9), (16, 9)], 'amberlight')
        for x in (1, 9, 17, 25): rect(d, (x, 10, x+5, 12), 'amber', 'ink')
        wood(d, (3, 20, 29, 22), 0); line(d, (4, 21, 27, 21), W[2])
        rect(d, (3, 28, 6, 30), W[0], 'ink'); rect(d, (26, 28, 29, 30), W[0], 'ink')
    elif i == 5:
        post(d, 1, 9); post(d, 28, 9)
        poly(d, [(0, 11), (16, 1), (31, 11)], W[0], 'ink')
        poly(d, [(4, 9), (16, 3), (27, 9)], F[1], 'ink'); line(d, (7, 8, 16, 4, 24, 8), F[2])
        line(d, (3, 11, 28, 11), W[2], 2)
        wood(d, (4, 24, 27, 27), 1); line(d, (5, 26, 26, 26), W[0])
        line(d, (4, 13, 4, 19), F[0]); line(d, (27, 13, 27, 19), F[0])
        rect(d, (1, 28, 4, 30), W[0], 'ink'); rect(d, (28, 28, 31, 30), W[0], 'ink')
    elif i == 6:
        metal(d, (14, 9, 18, 29), 0); ell(d, (9, 26, 23, 30), M[1], 'ink')
        line(d, (15, 11, 15, 25), M[2]); line(d, (15, 12, 7, 12, 7, 8), M[1], 2)
        line(d, (17, 9, 24, 9, 24, 5), M[1], 2)
        for x, y in ((7, 5), (24, 2)):
            poly(d, [(x-4, y), (x+4, y), (x+6, y+5), (x-6, y+5)], F[0], 'ink')
            line(d, (x-3, y+1, x+3, y+1), F[1]); line(d, (x-4, y+4, x+4, y+4), F[2])
            rect(d, (x-3, y+5, x+3, y+6), 'amberlight')
        line(d, (11, 28, 21, 28), M[2])
    elif i == 7:
        ell(d, (3, 15, 29, 29), W[0], 'ink'); ell(d, (2, 12, 29, 25), W[2], 'ink')
        ell(d, (5, 15, 26, 23), F[0], 'ink'); ell(d, (7, 16, 24, 22), F[1])
        line(d, (10, 17, 20, 17), F[2]); line(d, (11, 21, 21, 21), F[0])
        for x in (6, 12, 18, 24): line(d, (x, 25, x+1, 28), W[1])
        line(d, (7, 26, 25, 26), W[2]); rect(d, (11, 11, 20, 13), W[1], 'ink')
    elif i == 8:
        for x in (5, 24): post(d, x, 22)
        poly(d, [(1, 15), (25, 10), (30, 20), (7, 26)], W[2], 'ink')
        poly(d, [(7, 26), (30, 20), (30, 24), (7, 29)], W[1], 'ink')
        book(d, 16, 15, 'violet', 7); book(d, 21, 14, 'coral', 7)
        line(d, (8, 19, 7, 10, 11, 6), M[0], 2); line(d, (8, 17, 8, 10, 11, 7), M[2])
        poly(d, [(7, 3), (13, 3), (16, 9), (4, 9)], F[0], 'ink')
        line(d, (8, 4, 12, 4), F[1]); line(d, (6, 8, 14, 8), F[2]); rect(d, (6, 9, 14, 10), 'amberlight')
        line(d, (10, 27, 27, 22), W[0])
    elif i == 9:
        for x in (2, 10, 19, 27):
            poly(d, [(x, 11), (x+2, 8), (x+4, 11), (x+4, 28), (x, 28)], W[1], 'ink')
            line(d, (x+1, 12, x+1, 26), W[2])
        wood(d, (1, 16, 31, 19), 0); wood(d, (1, 24, 31, 26), 0)
        line(d, (3, 17, 29, 17), W[2]); line(d, (3, 25, 29, 25), W[2])
    elif i == 10:
        wood(d, (3, 9, 28, 29), 0)
        poly(d, [(1, 10), (6, 3), (25, 3), (31, 10)], W[1], 'ink')
        line(d, (6, 5, 26, 5), W[2]); line(d, (4, 7, 28, 7), W[0])
        rect(d, (6, 12, 25, 26), F[0], 'ink'); wood(d, (6, 24, 25, 27), 2)
        for x in (10, 16, 22):
            line(d, (x, 14, x, 23), W[2], 2)
        poly(d, [(7, 18), (13, 18), (12, 22), (8, 22)], M[1], 'ink')
        line(d, (13, 15, 19, 15), M[2], 2)
        for x in (13, 15, 17, 19): line(d, (x, 15, x, 17), M[0])
        line(d, (20, 13, 24, 13), M[2], 2); line(d, (5, 28, 26, 28), W[1])
    elif i == 11:
        ell(d, (7, 7, 24, 30), W[0], 'ink'); rect(d, (7, 12, 24, 25), W[1], 'ink')
        ell(d, (7, 5, 24, 13), W[2], 'ink'); ell(d, (9, 7, 22, 11), W[1], 'ink')
        for y in (15, 24): metal(d, (7, y, 24, y+2), 0)
        for x in (10, 15, 20): line(d, (x, 13, x, 29), W[0])
        metal(d, (23, 20, 28, 23)); line(d, (27, 22, 27, 26, 30, 26), M[2], 2)
        line(d, (25, 18, 25, 20), M[1]); line(d, (23, 18, 27, 18), M[2], 2)
        ell(d, (11, 8, 14, 10), W[0], 'ink')
    elif i == 12:
        post(d, 2, 11); post(d, 27, 11)
        poly(d, [(0, 11), (5, 4), (11, 2), (21, 2), (27, 4), (31, 11)], F[0], 'ink')
        poly(d, [(4, 9), (7, 5), (12, 3), (20, 3), (25, 5), (28, 9)], F[1])
        line(d, (6, 9, 11, 5, 21, 5, 26, 9), F[2])
        line(d, (3, 12, 28, 12), W[2], 2); line(d, (9, 10, 12, 4), F[0]); line(d, (22, 10, 20, 4), F[0])
        line(d, (4, 14, 7, 18), W[0], 2); line(d, (27, 14, 24, 18), W[0], 2)
        rect(d, (2, 28, 6, 30), W[1], 'ink'); rect(d, (26, 28, 30, 30), W[1], 'ink')
    elif i == 13:
        wood(d, (3, 3, 29, 28), 0)
        rect(d, (5, 5, 27, 16), GLASS[0], 'ink'); rect(d, (7, 7, 25, 14), GLASS[1])
        line(d, (8, 8, 13, 8, 9, 12), GLASS[2]); line(d, (23, 8, 23, 12), GLASS[2])
        rect(d, (5, 18, 27, 26), F[0], 'ink'); rect(d, (7, 20, 25, 24), F[1])
        for x in (9, 15, 21): line(d, (x, 20, x, 24), F[0])
        line(d, (7, 19, 25, 19), F[2]); line(d, (4, 4, 28, 4), W[2]); line(d, (5, 27, 27, 27), W[1])
    elif i == 14:
        rect(d, (4, 19, 28, 28), S[0], 'ink'); rect(d, (5, 21, 27, 26), S[1]); line(d, (6, 22, 26, 22), S[2])
        rect(d, (5, 3, 27, 20), GLASS[0], 'ink'); rect(d, (7, 5, 25, 18), GLASS[1])
        line(d, (7, 5, 11, 5, 7, 10), GLASS[2]); line(d, (24, 7, 24, 15), GLASS[2])
        poly(d, [(13, 6), (19, 6), (19, 9), (22, 11), (21, 17), (11, 17), (10, 11), (13, 9)], 'amberdark', 'ink')
        line(d, (14, 7, 18, 7), 'amberlight'); line(d, (12, 13, 20, 13), 'amber')
        rect(d, (10, 24, 22, 26), 'paper', 'grey'); line(d, (5, 19, 27, 19), M[1])
    elif i == 15:
        ell(d, (5, 25, 26, 30), M[0], 'ink'); ell(d, (7, 26, 24, 28), M[1], 'ink')
        line(d, (15, 26, 9, 18, 23, 8), M[0], 3); line(d, (16, 25, 10, 18, 23, 9), M[2])
        ell(d, (7, 16, 12, 21), M[1], 'ink'); rect(d, (9, 18, 10, 19), M[2])
        poly(d, [(21, 2), (26, 4), (29, 10), (14, 8)], F[0], 'ink')
        line(d, (21, 4, 25, 5), F[1]); line(d, (17, 7, 27, 9), F[2]); line(d, (16, 8, 26, 10), 'amberlight', 2)
    elif i == 16:
        poly(d, [(1, 17), (24, 12), (31, 21), (7, 29)], W[0], 'ink')
        poly(d, [(4, 18), (23, 14), (27, 21), (9, 26)], '#6c513e', 'ink')
        for x, y in ((10, 16), (18, 15), (23, 20)): leaf(d, x, y)
        for x, y, w, h in ((2, 14, 3, 12), (25, 10, 3, 12), (5, 22, 3, 8), (28, 18, 3, 8)):
            wood(d, (x, y, x+w, y+h), 1)
        line(d, (4, 17, 25, 13), W[2], 2); line(d, (8, 27, 29, 22), W[2], 2)
        for x, y in ((11, 21), (21, 24)):
            line(d, (x, y, x, y-4), W[2]); rect(d, (x-2, y-6, x+3, y-3), 'paper', 'ink')
            rect(d, (x-1, y-5, x, y-5), 'coraldark')
    elif i == 17:
        metal(d, (3, 2, 29, 29), 0); rect(d, (5, 4, 27, 26), 'paper', 'ink')
        rect(d, (7, 7, 25, 18), GLASS[0], 'ink'); rect(d, (9, 9, 23, 16), GLASS[1])
        line(d, (10, 10, 14, 10, 10, 14), GLASS[2]); line(d, (22, 10, 22, 14), GLASS[2])
        line(d, (6, 21, 26, 21), M[1]); rect(d, (7, 23, 13, 24), F[0], 'ink')
        rect(d, (8, 23, 11, 23), F[2]); rect(d, (15, 23, 22, 24), F[1], 'ink')
        line(d, (4, 3, 28, 3), M[2]); line(d, (5, 28, 27, 28), M[1])
    elif i == 18:
        post(d, 2, 9); post(d, 27, 9)
        poly(d, [(0, 9), (5, 3), (26, 3), (31, 9)], 'navy', 'ink'); line(d, (6, 5, 25, 5), 'navylight', 2)
        wood(d, (2, 17, 29, 28), 0); wood(d, (1, 15, 30, 19), 2)
        for x, y in ((5, 11), (14, 10), (22, 11)):
            rect(d, (x, y, x+6, y+8), 'paper', 'ink'); line(d, (x+1, y+2, x+5, y+2), M[0])
            rect(d, (x+1, y+4, x+3, y+6), M[1]); line(d, (x+4, y+4, x+5, y+4), M[0])
        rect(d, (6, 23, 14, 26), 'paper', 'ink'); rect(d, (18, 22, 26, 26), 'paper', 'ink')
        line(d, (7, 24, 13, 24), M[1]); line(d, (19, 24, 25, 24), M[1])
    elif i == 19:
        metal(d, (2, 3, 29, 28), 0)
        rect(d, (4, 5, 27, 20), F[0], 'ink'); rect(d, (6, 7, 25, 18), F[1])
        for x in (8, 12, 17, 22): line(d, (x, 7, x, 18), F[0])
        line(d, (7, 6, 24, 6), F[2]); line(d, (4, 4, 27, 4), M[2])
        rect(d, (11, 15, 21, 23), 'coraldark', 'ink'); rect(d, (13, 16, 19, 21), 'coral')
        poly(d, [(9, 22), (23, 22), (25, 27), (7, 27)], 'coral', 'ink'); line(d, (12, 24, 21, 24), 'corallight')
        line(d, (12, 27, 12, 30), M[1], 2); line(d, (21, 27, 21, 30), M[1], 2)
        line(d, (27, 16, 27, 24), M[2]); ell(d, (25, 13, 29, 18), M[0], 'ink')
    elif i == 20:
        post(d, 2, 8); post(d, 27, 8)
        wood(d, (0, 8, 31, 11), 0); wood(d, (2, 2, 29, 5), 0)
        for x in (1, 8, 16, 24):
            poly(d, [(x, 0), (x+3, 0), (x+5, 9), (x+1, 9)], W[1], 'ink'); line(d, (x+1, 1, x+3, 7), W[2])
        line(d, (4, 11, 7, 16), W[0], 2); line(d, (27, 11, 24, 16), W[0], 2)
        leaf(d, 6, 7); leaf(d, 27, 10)
        rect(d, (2, 28, 5, 30), S[1], 'ink'); rect(d, (27, 28, 30, 30), S[1], 'ink')
    elif i == 21:
        poly(d, [(1, 16), (5, 10), (11, 7), (21, 7), (27, 11), (31, 16), (29, 28), (24, 24), (23, 19), (20, 16), (12, 16), (8, 19), (7, 24), (3, 28)], W[0], 'ink')
        line(d, (4, 16, 7, 12, 12, 10, 20, 10, 25, 13, 28, 17), W[2], 2)
        poly(d, [(4, 18), (9, 13), (13, 12), (20, 12), (25, 15), (28, 20), (25, 25), (21, 19), (12, 19), (8, 25)], F[1], 'ink')
        line(d, (7, 18, 12, 15, 20, 15, 25, 19), F[2]); line(d, (10, 18, 22, 18), F[0])
        for x in (4, 27): wood(d, (x, 27, x+2, 30), 1)
    elif i == 22:
        metal(d, (3, 2, 29, 28), 0); rect(d, (5, 4, 27, 23), F[0], 'ink')
        for x, y, tint in ((7, 6, 'coral'), (17, 5, 'violet')):
            rect(d, (x, y, x+8, y+10), W[1], 'ink'); rect(d, (x+1, y+1, x+7, y+8), 'paper', 'ink')
            rect(d, (x+2, y+3, x+6, y+6), tint); line(d, (x+1, y+1, x+7, y+1), W[2])
        rect(d, (7, 19, 25, 22), 'paper', 'ink'); line(d, (9, 20, 23, 20), M[0])
        line(d, (6, 17, 25, 17), F[1]); line(d, (6, 18, 25, 18), F[2])
        rect(d, (4, 25, 28, 29), S[1], 'ink'); line(d, (6, 26, 26, 26), S[2]); line(d, (6, 28, 26, 28), S[0])
        line(d, (4, 3, 28, 3), M[2])
    elif i == 23:
        metal(d, (2, 2, 30, 29), 0); rect(d, (4, 4, 28, 13), GLASS[0], 'ink')
        rect(d, (6, 6, 26, 11), GLASS[1]); line(d, (7, 7, 12, 7), GLASS[2])
        rect(d, (4, 15, 28, 27), F[0], 'ink'); rect(d, (6, 17, 26, 25), F[1])
        line(d, (7, 18, 25, 18), F[2]); line(d, (7, 24, 25, 24), F[0])
        for x, tint in ((9, 'coral'), (15, 'amber'), (22, 'cyan')):
            line(d, (x, 14, x, 21, x+3, 23), tint, 2)
            metal(d, (x-1, 19, x+2, 21), 0)
        line(d, (3, 3, 29, 3), M[2]); rect(d, (5, 28, 27, 30), M[1], 'ink')
    else:
        raise ValueError(i)
    return im

def fp(x, y, width, height):
    return {'x': x, 'y': y, 'width': width, 'height': height}

FOOTPRINTS = {
    0: [fp(.03, .64, .94, .25)],
    1: [fp(.12, .66, .79, .22)],
    2: [fp(.03, .66, .37, .24), fp(.72, .60, .25, .30)],
    3: [fp(.03, .66, .18, .16), fp(.27, .75, .38, .17), fp(.64, .66, .30, .18)],
    4: [fp(.06, .64, .10, .30), fp(.84, .64, .10, .30)],
    5: [fp(.03, .65, .10, .29), fp(.88, .65, .10, .29)],
    6: [fp(.30, .82, .42, .13)],
    7: [fp(.12, .70, .76, .18)],
    8: [fp(.16, .69, .75, .22)],
    9: [fp(.03, .75, .94, .13)],
    10: [fp(.10, .66, .78, .26)],
    11: [fp(.23, .70, .56, .23)],
    12: [fp(.06, .67, .10, .28), fp(.84, .67, .10, .28)],
    13: [fp(.10, .76, .81, .13)],
    14: [fp(.13, .66, .74, .23)],
    15: [fp(.19, .82, .62, .13)],
    16: [fp(.06, .66, .88, .25)],
    17: [fp(.10, .78, .81, .14)],
    18: [fp(.06, .66, .87, .24)],
    19: [fp(.06, .67, .09, .24), fp(.85, .67, .09, .24), fp(.30, .75, .44, .20)],
    20: [fp(.06, .65, .10, .30), fp(.85, .65, .10, .30)],
    21: [fp(.04, .52, .19, .35), fp(.23, .43, .54, .18), fp(.77, .52, .19, .35)],
    22: [fp(.12, .75, .78, .17)],
    23: [fp(.07, .80, .85, .14)],
}

def metadata(i, image):
    identifier, name, map_id, layer, interaction = PROPS[i]
    colors = {pixel[:3] for pixel in image.get_flattened_data() if pixel[3] == 255}
    fabric = AWNING_RED if i == 0 else AWNING_GOLD if i == 4 else F
    roles = {role: shades for role, shades in {'wood': W, 'fabric': fabric, 'metal': M, 'stone': S, 'foliage': G}.items() if any(ImageColor.getrgb(hex_color) in colors for hex_color in shades)}
    category = 'arquitetura' if i in (4, 5, 9, 12, 13, 17, 19, 20, 23) else 'mobiliário'
    return {'index': i, 'id': 'regional-'+identifier, 'family': 'regional', 'name': name, 'category': category, 'mapTheme': map_id, 'solid': True, 'solidFootprint': FOOTPRINTS[i], 'layer': layer, 'interaction': interaction, 'colorRoles': roles, 'sourceRect': {'x': i%8*32, 'y': i//8*32, 'width': 32, 'height': 32}}

def preview(images, records):
    out = Image.new('RGBA', (1280, 510), '#e7dfcc')
    d = ImageDraw.Draw(out)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    for i, (image, record) in enumerate(zip(images, records)):
        x, y = i%8*160, i//8*170
        rect(d, (x+4, y+4, x+155, y+165), '#d6ccb5')
        for cy in range(y+8, y+104, 16):
            for cx in range(x+32, x+128, 16):
                if ((cx-x)//16+(cy-y)//16)%2: rect(d, (cx, cy, cx+15, cy+15), '#eee7d6')
        out.alpha_composite(image.resize((96, 96), Image.Resampling.NEAREST), (x+32, y+8))
        lines = ['']
        for word in (str(i)+' '+record['name']).split():
            phrase = (lines[-1]+' '+word).strip()
            if d.textlength(phrase, font=font) > 146: lines.append(word)
            else: lines[-1] = phrase
        for row, text in enumerate(lines[:3]): d.text((x+7, y+108+row*13), text, fill=P['navy'], font=font)
        d.text((x+7, y+150), record['mapTheme'], fill=P['coraldark'], font=font)
    out.save(ROOT / 'tests' / 'regional-props-preview.png', optimize=True)

def main():
    images = [prop(i) for i in range(24)]
    assert len({image.tobytes() for image in images}) == 24
    atlas = empty(256, 96)
    records = []
    for i, image in enumerate(images):
        assert image.getchannel('A').getextrema() == (0, 255)
        atlas.alpha_composite(image, (i%8*32, i//8*32))
        record = metadata(i, image)
        assert record['colorRoles']
        for box in record['solidFootprint']:
            assert 0 <= box['x'] < 1 and 0 <= box['y'] < 1
            assert 0 < box['width'] <= 1 and 0 < box['height'] <= 1
            assert box['x']+box['width'] <= 1 and box['y']+box['height'] <= 1
        records.append(record)
    target = ROOT / 'assets' / 'tilesets'
    atlas.save(target / 'regional-props.png', optimize=True)
    manifest = {'version': '2.2', 'license': 'CC0-1.0', 'licenseURL': 'https://creativecommons.org/publicdomain/zero/1.0/', 'attributionRequired': False, 'creator': 'Original VOICES pixel art', 'generator': 'tools/create_regional_props.py', 'atlas': 'assets/tilesets/regional-props.png', 'tileSize': 32, 'columns': 8, 'rows': 3, 'coordinateUnits': 'tile-fraction', 'sourceRectUnits': 'pixel', 'palette': P, 'props': records}
    (target / 'regional-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    encoded = base64.b64encode((target / 'regional-props.png').read_bytes()).decode('ascii')
    registry = "(function(){'use strict';const V=window.V=window.V||{};V.regionalAssets="+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+";V.sceneAssets=V.sceneAssets||[];V.sceneAssets.push(...V.regionalAssets);V.regionalMaterialSources={regional:'data:image/png;base64,"+encoded+"'};})();\n"
    (ROOT / 'js' / 'regional-assets.js').write_text(registry, encoding='utf-8')
    preview(images, records)
    print(json.dumps({'assets': len(records), 'uniqueCells': len({image.tobytes() for image in images}), 'atlasDimensions': [256, 96], 'canopies': [i for i, record in enumerate(records) if record['layer'] == 'canopy'], 'preview': 'tests/regional-props-preview.png'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
