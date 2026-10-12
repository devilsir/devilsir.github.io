from pathlib import Path
import importlib.util
import base64
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_atelier_palette', ROOT / 'tools' / 'create_scene_assets.py')
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
base = scene.base
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty
P = base.P
WOOD = ['#624535', P['brown'], P['brownlight']]
FABRIC = ['#2b5355', '#588e7d', '#9abfa5']
METAL = [P['darkgrey'], P['grey'], P['greylight']]
FOLIAGE = [P['greendark'], P['green'], P['greenlight']]
PROPS = [
    ('wall-cabinet', 'Armário suspenso de duas portas', 'casa'),
    ('archival-cabinet', 'Armário de pastas com etiquetas', 'arquivo'),
    ('recommendation-cart', 'Carrinho de indicações de leitura', 'biblioteca'),
    ('adjustable-lamp', 'Luminária de braço articulado', 'biblioteca'),
    ('folding-chair', 'Cadeira dobrável de madeira', 'convívio'),
    ('wood-armchair', 'Poltrona de madeira com almofada', 'convívio'),
    ('woven-armchair', 'Poltrona de palhinha', 'convívio'),
    ('oval-coffee-table', 'Mesa de centro oval', 'casa'),
    ('entry-console', 'Aparador estreito de entrada', 'casa'),
    ('low-sideboard', 'Bufê baixo com portas de correr', 'casa'),
    ('kitchen-cupboard', 'Cristaleira com louças do cotidiano', 'casa'),
    ('square-cafe-table', 'Mesa quadrada de café', 'convívio'),
    ('round-stool', 'Banquinho redondo de três pés', 'convívio'),
    ('upholstered-bench', 'Banco estofado com braços', 'convívio'),
    ('bakery-display', 'Vitrine de pães e bolos', 'feira'),
    ('pottery-shelf', 'Estante de cerâmica artesanal', 'ateliê'),
    ('tool-workbench', 'Bancada com morsa e ferramentas', 'oficina'),
    ('record-player-cabinet', 'Móvel de discos com toca-discos', 'música'),
    ('hanging-herbs', 'Vaso pendente de ervas', 'horta'),
    ('umbrella-basket', 'Cesto trançado para guarda-chuvas', 'casa'),
    ('linen-shelves', 'Estante aberta de toalhas dobradas', 'casa'),
    ('community-pinboard', 'Painel de recados com moldura', 'comunidade'),
    ('recycling-station', 'Estação de coleta com etiquetas', 'comunidade'),
    ('museum-label-easel', 'Suporte inclinado de legenda', 'museu'),
]
PEOPLE = {
    'atelier-cecilia': {'name': 'Cecília', 'age': 48, 'map': 'chapter-2', 'chapter': 2, 'role': 'Curadora de exposições da comunidade', 'personality': 'Atenta e acolhedora; pede contexto antes de escolher uma legenda.', 'appearance': 'Mulher negra, coque de tranças, óculos de armação fina, camisa verde oliva, saia violeta escura, sapatos baixos e pasta de trabalho.', 'relationships': ['curator'], 'preferredActivities': ['Conferir a legenda de exposição.', 'Registrar a origem de um objeto.', 'Conversar com visitantes no pátio.'], 'skin': '#754830', 'skinlight': '#aa714c', 'skindark': '#4f3228', 'hair': '#292431', 'hairlight': '#665349', 'style': 'bun', 'coat': '#698467', 'shirt': '#cdd5ad', 'pants': '#554861', 'accessory': 'glasses', 'outfit': 'skirt', 'body': 'average', 'lines': [('This label needs a date.', 'Esta legenda precisa de uma data.', 'attention'), ('Shall we compare it with the notebook?', 'Vamos compará-la com o caderno?', 'question'), ('It is good to see you at the exhibition.', 'É bom ver você na exposição.', 'greeting')]},
    'atelier-gilberto': {'name': 'Gilberto', 'age': 54, 'map': 'chapter-1', 'chapter': 1, 'role': 'Professor de música e participante dos ensaios', 'personality': 'Paciente e bem-humorado; escuta uma frase inteira antes de sugerir outra tentativa.', 'appearance': 'Homem negro, afro arredondado com fios grisalhos, camisa coral aberta sobre camiseta creme, calça azul escura e fones no pescoço.', 'relationships': ['musician', 'sol'], 'preferredActivities': ['Marcar um pulso com a mão.', 'Escutar uma frase musical.', 'Organizar os discos depois do ensaio.'], 'skin': '#956343', 'skinlight': '#c28b5c', 'skindark': '#63442f', 'hair': '#555050', 'hairlight': '#aeb0a2', 'style': 'afro', 'coat': '#b56451', 'shirt': '#eee2c5', 'pants': '#34465b', 'accessory': 'none', 'outfit': 'open-shirt', 'body': 'wide', 'lines': [('Let us listen to this musical phrase again.', 'Vamos ouvir esta frase musical de novo.', 'conversation'), ('Agreed.', 'Combinado.', 'reply'), ('This is an original rehearsal phrase.', 'Esta é uma frase original de ensaio.', 'practical')]},
    'atelier-ivana': {'name': 'Ivana', 'age': 29, 'map': 'chapter-6', 'chapter': 6, 'role': 'Técnica de equipamentos do arquivo comunitário', 'personality': 'Cuidadosa e direta; organiza cabos e registra cada verificação.', 'appearance': 'Mulher negra retinta, corte natural curto e arredondado, brincos pequenos, camisa azul-petróleo com mangas dobradas, calça cáqui e crachá.', 'relationships': ['marina'], 'preferredActivities': ['Conferir os cabos na bancada.', 'Anotar uma verificação.', 'Consultar o catálogo com a equipe.'], 'skin': '#5d3a2d', 'skinlight': '#96664a', 'skindark': '#3c2923', 'hair': '#24212c', 'hairlight': '#4e4142', 'style': 'curls', 'coat': '#367a7e', 'shirt': '#a6c9bc', 'pants': '#a38e65', 'accessory': 'none', 'outfit': 'technician', 'body': 'average', 'lines': [('The backup is ready!', 'A cópia de segurança está pronta!', 'surprise'), ('I am thinking about the records we restored.', 'Estou pensando nos registros que restauramos.', 'thought'), ('I am checking the equipment labels.', 'Estou conferindo as etiquetas dos equipamentos.', 'practical')]},
    'atelier-joel': {'name': 'Joel', 'age': 24, 'map': 'room-4', 'chapter': 4, 'role': 'Repórter do jornal comunitário', 'personality': 'Curioso e respeitoso; pergunta como a pessoa prefere ser apresentada.', 'appearance': 'Homem negro, twists médios presos para trás, camisa azul-marinho com mangas dobradas, calça bege, bolsa de tecido e caderno de entrevistas.', 'relationships': ['journalist', 'ada'], 'preferredActivities': ['Anotar uma pergunta de entrevista.', 'Comparar a legenda com a fonte.', 'Conversar com a equipe de edição.'], 'skin': '#b07a50', 'skinlight': '#dda26d', 'skindark': '#805435', 'hair': '#302630', 'hairlight': '#72544a', 'style': 'long', 'coat': '#425a72', 'shirt': '#d5c5a1', 'pants': '#ad9774', 'accessory': 'none', 'outfit': 'reporter', 'body': 'average', 'lines': [('I will check this source.', 'Vou conferir esta fonte.', 'conversation'), ('I am thinking about the context of this caption.', 'Estou pensando no contexto desta legenda.', 'thought'), ('Hello! Welcome to the newsroom.', 'Olá! Boas-vindas à redação.', 'greeting')]},
}

def shadow(d, box=(3, 26, 29, 30)):
    ell(d, box, (17, 23, 41, 44))

def woodbox(d, box, tone=1):
    rect(d, box, WOOD[tone], 'ink')
    line(d, (box[0]+1, box[1]+1, box[2]-1, box[1]+1), WOOD[2])

def leg(d, x, top=22):
    rect(d, (x, top, x+2, 29), WOOD[0], 'ink')

def handle(d, x, y):
    line(d, (x, y, x+3, y), METAL[2])

def prop(i):
    im = empty()
    d = ImageDraw.Draw(im)
    if i not in (0, 18, 21): shadow(d)
    if i == 0:
        woodbox(d, (3, 4, 28, 23), 0)
        for x in (5, 17):
            rect(d, (x, 6, x+9, 21), WOOD[1], 'ink')
            rect(d, (x+1, 7, x+8, 8), WOOD[2])
        handle(d, 10, 14); handle(d, 19, 14)
        line(d, (5, 23, 27, 23), WOOD[2])
    elif i == 1:
        woodbox(d, (5, 2, 26, 28), 0)
        for y in (5, 13, 21):
            rect(d, (7, y, 24, y+6), FABRIC[0], 'ink')
            rect(d, (9, y+2, 14, y+3), 'paper')
            line(d, (10, y+2, 12, y+2), 'grey')
            handle(d, 18, y+3)
        rect(d, (6, 28, 9, 30), WOOD[0], 'ink')
        rect(d, (22, 28, 25, 30), WOOD[0], 'ink')
    elif i == 2:
        for x in (6, 25):
            rect(d, (x, 6, x+1, 26), METAL[1], 'ink')
            ell(d, (x-1, 27, x+2, 30), METAL[0], 'ink')
        woodbox(d, (4, 14, 28, 17), 2)
        woodbox(d, (4, 24, 28, 27), 1)
        for x, tint, h in ((8, 'coral', 7), (12, 'violet', 9), (16, 'amber', 8)):
            rect(d, (x, 13-h, x+2, 13), tint, 'ink')
            line(d, (x+1, 10, x+1, 12), 'paper')
        poly(d, [(21, 12), (22, 4), (28, 4), (27, 12)], 'paper', 'ink')
        line(d, (23, 7, 26, 7), 'coraldark')
        scene.book(d, 9, 19, 'cyandark')
        scene.book(d, 19, 19, 'green')
        line(d, (25, 6, 30, 6, 30, 10), METAL[1], 2)
    elif i == 3:
        ell(d, (7, 25, 26, 30), METAL[0], 'ink')
        ell(d, (9, 25, 24, 28), METAL[1], 'ink')
        line(d, (15, 25, 13, 16, 23, 9), METAL[0], 3)
        line(d, (15, 24, 13, 16, 23, 9), METAL[2])
        ell(d, (12, 14, 16, 18), METAL[1], 'ink')
        poly(d, [(19, 3), (24, 3), (28, 10), (14, 10)], FABRIC[0], 'ink')
        line(d, (18, 5, 23, 5), FABRIC[2])
        line(d, (16, 9, 26, 9), 'amberlight')
        rect(d, (17, 10, 24, 11), '#ead39a')
    elif i == 4:
        line(d, (9, 16, 23, 29), WOOD[0], 2)
        line(d, (22, 16, 8, 29), WOOD[0], 2)
        woodbox(d, (7, 5, 25, 13), 2)
        rect(d, (8, 13, 10, 20), WOOD[1], 'ink')
        rect(d, (22, 13, 24, 20), WOOD[1], 'ink')
        poly(d, [(8, 17), (23, 17), (26, 22), (5, 22)], WOOD[2], 'ink')
        line(d, (9, 7, 23, 7), WOOD[0])
        line(d, (9, 20, 22, 20), WOOD[0])
    elif i == 5:
        for x in (7, 23): leg(d, x, 22)
        woodbox(d, (5, 5, 26, 20), 1)
        rect(d, (8, 7, 23, 18), FABRIC[1], 'ink')
        line(d, (10, 8, 21, 8), FABRIC[2])
        poly(d, [(7, 18), (24, 18), (26, 25), (5, 25)], FABRIC[0], 'ink')
        poly(d, [(6, 14), (9, 14), (9, 22), (4, 22)], WOOD[2], 'ink')
        poly(d, [(23, 14), (26, 14), (28, 22), (23, 22)], WOOD[2], 'ink')
        line(d, (9, 20, 22, 20), FABRIC[2])
    elif i == 6:
        for x in (6, 24): leg(d, x, 21)
        ell(d, (4, 2, 27, 24), WOOD[0], 'ink')
        ell(d, (6, 4, 25, 21), WOOD[2], 'ink')
        for x in (9, 13, 17, 21): line(d, (x, 7, x, 18), WOOD[0])
        for y in (8, 12, 16): line(d, (8, y, 23, y), WOOD[1])
        poly(d, [(6, 20), (25, 20), (27, 25), (4, 25)], WOOD[2], 'ink')
        line(d, (7, 22, 24, 22), WOOD[0])
        line(d, (4, 13, 4, 24), WOOD[1], 2)
        line(d, (27, 13, 27, 24), WOOD[1], 2)
    elif i == 7:
        for x in (7, 23): leg(d, x, 22)
        ell(d, (1, 11, 30, 24), WOOD[1], 'ink')
        ell(d, (1, 9, 30, 21), WOOD[2], 'ink')
        line(d, (7, 11, 23, 11), '#d4b386')
        scene.book(d, 8, 12, 'violet')
        scene.cup(d, 23, 11)
    elif i == 8:
        for x in (4, 26): leg(d, x, 14)
        woodbox(d, (2, 13, 29, 17), 1)
        woodbox(d, (3, 9, 28, 13), 2)
        for x in (4, 17):
            rect(d, (x, 14, x+10, 18), WOOD[1], 'ink')
            handle(d, x+3, 16)
        woodbox(d, (4, 25, 28, 27), 0)
        scene.cup(d, 7, 5)
        scene.plant(d, 22, 7)
    elif i == 9:
        for x in (5, 25): leg(d, x, 23)
        woodbox(d, (3, 10, 29, 26), 1)
        rect(d, (5, 13, 16, 24), WOOD[0], 'ink')
        rect(d, (16, 13, 27, 24), WOOD[2], 'ink')
        line(d, (8, 16, 8, 21), METAL[1])
        line(d, (25, 16, 25, 21), METAL[0])
        line(d, (5, 11, 27, 11), '#d1ad7c')
        scene.book(d, 7, 5, 'coral')
        rect(d, (21, 6, 25, 9), 'paper', 'ink')
    elif i == 10:
        woodbox(d, (4, 2, 27, 28), 0)
        rect(d, (6, 4, 25, 15), '#678a8d', 'ink')
        line(d, (15, 4, 15, 15), WOOD[1])
        for x in (9, 20):
            ell(d, (x-2, 8, x+2, 12), 'paper', 'greylight')
            line(d, (x-1, 9, x+1, 9), 'white')
        line(d, (7, 5, 10, 5, 8, 7), '#b2d0cb')
        for x in (6, 17):
            rect(d, (x, 18, x+8, 26), WOOD[1], 'ink')
            handle(d, x+2, 22)
        woodbox(d, (3, 28, 28, 30), 2)
    elif i == 11:
        for x in (6, 25): leg(d, x, 18)
        poly(d, [(2, 12), (24, 9), (30, 15), (8, 18)], WOOD[1], 'ink')
        poly(d, [(2, 9), (24, 6), (30, 12), (8, 15)], WOOD[2], 'ink')
        line(d, (5, 10, 23, 8), '#d4b386')
        scene.cup(d, 9, 5)
        ell(d, (18, 10, 25, 13), 'paper', 'grey')
        rect(d, (20, 10, 23, 11), '#c99854')
    elif i == 12:
        for x in (8, 22): leg(d, x, 18)
        rect(d, (15, 20, 17, 30), WOOD[0], 'ink')
        ell(d, (5, 13, 27, 22), WOOD[1], 'ink')
        ell(d, (5, 10, 27, 19), WOOD[2], 'ink')
        line(d, (9, 12, 21, 12), '#d4b386')
        line(d, (9, 16, 23, 16), WOOD[0])
    elif i == 13:
        for x in (5, 25): leg(d, x, 22)
        rect(d, (5, 6, 27, 19), FABRIC[0], 'ink')
        rect(d, (7, 8, 25, 17), FABRIC[1], 'ink')
        for x in (12, 19): rect(d, (x, 11, x+1, 12), FABRIC[0])
        poly(d, [(5, 17), (27, 17), (30, 24), (2, 24)], FABRIC[1], 'ink')
        line(d, (7, 19, 25, 19), FABRIC[2])
        rect(d, (2, 13, 5, 23), WOOD[1], 'ink')
        rect(d, (27, 13, 30, 23), WOOD[1], 'ink')
        line(d, (3, 14, 4, 14), WOOD[2]); line(d, (28, 14, 29, 14), WOOD[2])
    elif i == 14:
        woodbox(d, (2, 20, 29, 28), 1)
        poly(d, [(3, 6), (25, 6), (29, 11), (29, 22), (3, 22)], '#789c9c', 'ink')
        poly(d, [(4, 7), (24, 7), (27, 11), (4, 11)], '#afd0c8', 'ink')
        rect(d, (5, 12, 27, 20), '#557f84', 'ink')
        line(d, (13, 12, 13, 20), METAL[1])
        line(d, (25, 12, 25, 18), '#bbddd2')
        for x in (8, 17, 22):
            ell(d, (x-2, 16, x+2, 19), '#c89854', '#855236')
            line(d, (x-1, 16, x, 17), '#efd397')
        rect(d, (7, 3, 12, 6), '#815442', 'ink')
        rect(d, (7, 3, 12, 4), 'paper')
        poly(d, [(19, 6), (20, 2), (26, 2), (25, 6)], 'paper', 'ink')
        line(d, (21, 4, 24, 4), 'coraldark')
        line(d, (4, 25, 27, 25), WOOD[2])
    elif i == 15:
        woodbox(d, (3, 3, 28, 28), 0)
        for y in (13, 25):
            woodbox(d, (4, y, 27, y+2), 2)
            for x, shape in ((8, 0), (16, 1), (24, 2)):
                yy = y-5
                if shape == 0:
                    ell(d, (x-3, yy-3, x+3, yy+3), '#bc7957', 'ink')
                    rect(d, (x-2, yy-5, x+2, yy-3), '#d29a70', 'ink')
                elif shape == 1:
                    poly(d, [(x-2, yy-5), (x+2, yy-5), (x+1, yy-1), (x+3, yy+1), (x+2, yy+3), (x-2, yy+3), (x-3, yy+1), (x-1, yy-1)], '#d19e6f', 'ink')
                else:
                    ell(d, (x-3, yy-1, x+3, yy+3), '#718f83', 'ink')
                    line(d, (x-2, yy, x+2, yy), '#bdceb1')
    elif i == 16:
        for x in (4, 26): leg(d, x, 18)
        woodbox(d, (1, 13, 30, 18), 2)
        woodbox(d, (4, 25, 28, 28), 1)
        rect(d, (21, 9, 26, 19), METAL[0], 'ink')
        rect(d, (18, 10, 29, 13), METAL[1], 'ink')
        line(d, (20, 11, 27, 11), METAL[2])
        line(d, (25, 17, 31, 17), METAL[2], 2)
        line(d, (30, 15, 30, 19), METAL[1])
        line(d, (7, 9, 11, 4), METAL[1], 2)
        line(d, (10, 3, 13, 5), METAL[2], 2)
        rect(d, (6, 9, 7, 12), 'coraldark', 'ink')
        line(d, (14, 8, 16, 12), METAL[2])
        rect(d, (12, 6, 15, 8), WOOD[1], 'ink')
    elif i == 17:
        for x in (5, 24): leg(d, x, 23)
        woodbox(d, (3, 12, 28, 27), 1)
        rect(d, (5, 17, 15, 25), WOOD[0], 'ink')
        for x, tint in ((6, 'violet'), (9, 'coral'), (12, 'amber')):
            rect(d, (x, 18, x+1, 24), tint, 'ink')
            rect(d, (x, 20, x, 20), 'paper')
        rect(d, (17, 17, 26, 25), FABRIC[0], 'ink')
        for x in (19, 22, 25): line(d, (x, 19, x, 23), FABRIC[1])
        rect(d, (5, 6, 26, 13), METAL[0], 'ink')
        ell(d, (7, 7, 19, 11), 'ink', METAL[1])
        ell(d, (11, 8, 15, 10), 'coral', 'ink')
        line(d, (24, 7, 24, 9, 17, 10), METAL[2])
        rect(d, (22, 10, 25, 11), 'amber')
        poly(d, [(5, 6), (6, 2), (26, 2), (26, 6)], '#638f89', 'ink')
        line(d, (9, 3, 21, 3), '#a6c4b2')
    elif i == 18:
        line(d, (16, 1, 8, 13), WOOD[1])
        line(d, (16, 1, 25, 13), WOOD[1])
        poly(d, [(7, 15), (25, 15), (22, 25), (10, 25)], FABRIC[0], 'ink')
        line(d, (10, 18, 21, 18), FABRIC[2])
        for x, y in ((8, 13), (12, 8), (16, 12), (20, 8), (24, 12)):
            line(d, (16, 17, x, y), FOLIAGE[0], 2)
            ell(d, (x-2, y-3, x+2, y+1), FOLIAGE[1], FOLIAGE[0])
            rect(d, (x, y-2, x, y), FOLIAGE[2])
        line(d, (9, 16, 7, 24, 10, 29), FOLIAGE[0], 2)
        ell(d, (7, 23, 11, 27), FOLIAGE[1], FOLIAGE[0])
        rect(d, (9, 24, 9, 25), FOLIAGE[2])
    elif i == 19:
        poly(d, [(6, 16), (26, 16), (24, 28), (8, 28)], WOOD[1], 'ink')
        ell(d, (6, 14, 26, 18), WOOD[2], 'ink')
        for y in (19, 22, 25):
            line(d, (9, y, 23, y), WOOD[0])
        for x in (11, 16, 21): line(d, (x, 18, x, 26), WOOD[2])
        line(d, (13, 15, 12, 5, 14, 3, 17, 3, 18, 5), METAL[0], 2)
        poly(d, [(11, 7), (15, 6), (17, 15), (12, 16)], FABRIC[1], 'ink')
        line(d, (21, 14, 22, 5, 25, 4, 27, 6), METAL[0])
        poly(d, [(20, 7), (24, 7), (25, 16), (21, 16)], 'violet', 'ink')
        line(d, (22, 9, 23, 14), 'violetlight')
    elif i == 20:
        woodbox(d, (4, 3, 27, 28), 0)
        for y in (13, 25):
            woodbox(d, (4, y, 27, y+2), 2)
            for x, width, tint in ((7, 10, FABRIC[1]), (18, 7, 'paper')):
                rect(d, (x, y-6, x+width-1, y-2), tint, 'ink')
                line(d, (x+1, y-4, x+width-2, y-4), FABRIC[0] if x == 7 else 'greylight')
                line(d, (x+1, y-5, x+width-2, y-5), FABRIC[2] if x == 7 else 'white')
        rect(d, (6, 28, 9, 30), WOOD[1], 'ink')
        rect(d, (22, 28, 25, 30), WOOD[1], 'ink')
    elif i == 21:
        woodbox(d, (2, 3, 29, 26), 1)
        rect(d, (4, 5, 27, 24), '#b6996b', 'ink')
        for x, y, tint in ((6, 8, 'paper'), (17, 6, 'corallight'), (10, 16, 'white'), (21, 17, 'amberlight')):
            rect(d, (x, y, x+5, y+6), tint, 'greylight')
            rect(d, (x+2, y, x+2, y+1), 'coraldark')
            line(d, (x+1, y+3, x+4, y+3), 'grey')
            line(d, (x+1, y+5, x+3, y+5), 'grey')
    elif i == 22:
        for x, tint, symbol in ((2, '#66899a', 0), (12, '#a78549', 1), (22, '#617e67', 2)):
            rect(d, (x, 10, x+8, 28), tint, 'ink')
            rect(d, (x-1, 7, x+9, 11), METAL[0], 'ink')
            line(d, (x+1, 8, x+7, 8), METAL[2])
            rect(d, (x+1, 16, x+6, 22), 'paper', 'ink')
            if symbol == 0:
                line(d, (x+2, 18, x+5, 18, x+5, 20, x+2, 20, x+2, 18), 'navy')
            elif symbol == 1:
                ell(d, (x+2, 18, x+5, 20), 'brown', 'ink')
            else:
                poly(d, [(x+3, 17), (x+5, 20), (x+2, 20)], 'greendark')
            line(d, (x+2, 25, x+6, 25), METAL[0])
    else:
        line(d, (11, 15, 8, 29), WOOD[0], 2)
        line(d, (21, 15, 24, 29), WOOD[0], 2)
        line(d, (10, 26, 23, 26), WOOD[1], 2)
        poly(d, [(4, 7), (26, 5), (29, 14), (6, 16)], WOOD[1], 'ink')
        poly(d, [(6, 8), (24, 7), (26, 13), (8, 14)], 'paper', 'ink')
        line(d, (9, 10, 23, 9), 'darkgrey')
        line(d, (10, 12, 21, 11), 'grey')
        rect(d, (12, 17, 20, 19), WOOD[2], 'ink')
    return im

def metadata(i, identifier, name, category):
    wall = i in (0, 18, 21)
    footprint = None if wall else [0.13, 0.69, 0.74, 0.23]
    if i in (3, 12, 19, 23): footprint = [0.24, 0.78, 0.52, 0.16]
    if i in (7, 11, 13, 14, 16, 22): footprint = [0.05, 0.66, 0.9, 0.22]
    colors = {}
    if i not in (3, 22): colors['wood'] = WOOD
    if i in (1, 3, 5, 13, 17, 18, 19, 20): colors['fabric'] = FABRIC
    if i in (1, 2, 3, 8, 9, 10, 14, 16, 17, 19, 22): colors['metal'] = METAL
    if i in (8, 18): colors['foliage'] = FOLIAGE
    return {'index': i, 'id': 'atelier-'+identifier, 'family': 'atelier', 'name': name, 'category': category, 'solid': footprint is not None, 'solidFootprint': footprint, 'layer': 'wall' if wall else 'object', 'interaction': 'sit' if i in (4, 5, 6, 12, 13) else None, 'colorRoles': colors, 'sourceRect': {'x': i%8*32, 'y': i//8*32, 'width': 32, 'height': 32}}

def hair_details(d, key, p, direction, bob):
    h, hi = p['hair'], p['hairlight']
    if key == 'atelier-cecilia':
        if direction == 3: ell(d, (9, 3+bob, 22, 14+bob), h, 'ink')
        for x in (12, 15, 18, 21): line(d, (x, 4+bob, x+1, 7+bob), hi)
        for x in (14, 17, 20): line(d, (x, 1+bob, x+1, 3+bob), hi)
        if direction != 3: rect(d, (21, 13+bob, 22, 14+bob), 'amberlight')
    elif key == 'atelier-gilberto':
        for x, y in ((10, 3), (14, 2), (19, 2), (23, 5), (22, 8)):
            rect(d, (x, y+bob, x+1, y+bob), hi)
        if direction == 3:
            for x, y in ((11, 9), (15, 7), (19, 11)):
                rect(d, (x, y+bob, x+1, y+bob), hi)
    elif key == 'atelier-ivana':
        if direction == 3: ell(d, (9, 3+bob, 22, 13+bob), h, 'ink')
        rect(d, (8, 8+bob, 10, 11+bob), p['skindark'])
        rect(d, (21, 8+bob, 23, 11+bob), p['skindark'])
        for x in (12, 16, 20): rect(d, (x, 4+bob, x+1, 5+bob), hi)
        if direction != 3: rect(d, (21, 13+bob, 21, 14+bob), 'amberlight')
    else:
        if direction == 3: rect(d, (9, 4+bob, 22, 19+bob), h, 'ink')
        for x in (9, 12, 19, 22):
            end = 17 if x in (9, 22) else 8
            line(d, (x, 4+bob, x+1, end+bob), h, 2)
            for y in range(6, end, 3): line(d, (x, y+bob, x+1, y+1+bob), hi)
        if direction == 3:
            line(d, (11, 11+bob, 21, 11+bob), '#ad9774')
            poly(d, [(16, 11+bob), (20, 11+bob), (21, 17+bob), (18, 19+bob)], h, 'ink')

def person_sprite(key, p, row, frame):
    direction = row if row < 4 else 0
    im = base.sprite({**p, 'age': 'adult'}, direction, frame if row < 4 else 0, 'walk')
    if direction == 2: im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    d = ImageDraw.Draw(im)
    bob, side = (frame%2 if row < 4 else 0), direction in (1, 2)
    skin = p['skin']
    if p['body'] == 'wide' and not side:
        poly(d, [(10, 17+bob), (21, 17+bob), (24, 21), (23, 24), (8, 24), (7, 21)], p['coat'], 'ink')
    if p['outfit'] == 'skirt':
        if not side:
            poly(d, [(11, 23), (20, 23), (23, 28), (8, 28)], p['pants'], 'ink')
            line(d, (13, 24, 12, 27), '#78667e')
            line(d, (18, 24, 19, 27), '#3e374d')
        else:
            poly(d, [(12, 23), (21, 23), (23, 28), (10, 28)], p['pants'], 'ink')
            line(d, (16, 24, 17, 27), '#78667e')
        if direction != 3:
            line(d, (13, 17+bob, 15, 19+bob, 18, 17+bob), '#abb69a')
            rect(d, (14, 21, 15, 22), '#d9dac1')
    elif p['outfit'] == 'open-shirt':
        if direction != 3:
            rect(d, (13, 17+bob, 18, 23), p['shirt'])
            line(d, (12, 18+bob, 12, 23), '#d5966f')
            line(d, (19, 18+bob, 19, 23), '#d5966f')
            line(d, (11, 17+bob, 14, 19+bob), '#8e493e')
            line(d, (20, 17+bob, 17, 19+bob), '#8e493e')
            for x in (11, 20): rect(d, (x, 17+bob, x+1, 18+bob), '#303544')
            line(d, (13, 18+bob, 18, 18+bob), '#303544')
    elif p['outfit'] == 'technician':
        if direction != 3:
            rect(d, (12, 18+bob, 19, 24), p['coat'])
            line(d, (16, 18+bob, 16, 23), '#245961')
            rect(d, (18, 19+bob, 20, 22+bob), '#7ea9a2', '#245961')
            line(d, (13, 16+bob, 14, 19+bob), '#d2b977')
            rect(d, (13, 19+bob, 15, 22+bob), 'paper', 'ink')
            rect(d, (14, 20+bob, 14, 20+bob), 'cyandark')
        if not side:
            rect(d, (7, 20+bob, 10, 21+bob), '#a6c9bc')
            rect(d, (21, 20+bob, 24, 21+bob), '#a6c9bc')
            rect(d, (11, 25, 13, 26), '#7c6a4f')
            rect(d, (18, 25, 20, 26), '#7c6a4f')
    else:
        if direction != 3:
            line(d, (13, 17+bob, 19, 23), '#978162', 2)
            rect(d, (18, 22, 24, 27), '#ad9774', 'ink')
            line(d, (19, 24, 22, 24), '#d0bd99')
            rect(d, (7, 20+bob, 10, 21+bob), '#8fa3ac')
            rect(d, (21, 20+bob, 24, 21+bob), '#8fa3ac')
        else: line(d, (10, 17+bob, 20, 23), '#978162', 2)
    hair_details(d, key, p, 1 if side else direction, bob)
    if row in (4, 5):
        rect(d, (21, 14, 30, 27), (0, 0, 0, 0))
        if row == 5:
            poly(d, [(21, 18), (24, 15), (24, 12+frame%2), (26, 12+frame%2), (27, 16), (24, 20)], p['coat'], 'ink')
            rect(d, (24, 9+frame%2, 27, 12+frame%2), skin, 'ink')
            line(d, (26, 9+frame%2, 26, 11+frame%2), p['skinlight'])
            if frame == 2: line(d, (14, 14, 17, 14), p['skindark'])
        elif key == 'atelier-cecilia':
            rect(d, (20, 17, 28, 26), '#8b7856', 'ink')
            rect(d, (21, 18, 27, 25), 'paper')
            line(d, (22, 20, 25, 20), 'grey')
            line(d, (23+frame%2, 21, 27+frame%2, 18), 'darkgrey')
            rect(d, (21+frame%2, 20, 23+frame%2, 22), skin, 'ink')
        elif key == 'atelier-gilberto':
            poly(d, [(21, 18), (24, 16+frame%2), (26, 18+frame%2), (24, 21), (22, 22)], p['coat'], 'ink')
            rect(d, (24, 14+frame%2, 27, 17+frame%2), skin, 'ink')
            line(d, (25, 14+frame%2, 27, 14+frame%2), p['skinlight'])
            if frame in (1, 3): line(d, (27, 12, 29, 10), 'amber')
        elif key == 'atelier-ivana':
            rect(d, (22, 17, 28, 22), METAL[0], 'ink')
            rect(d, (23, 18, 27, 20), '#77a898')
            line(d, (24, 19, 26, 19), 'cyanlight')
            rect(d, (21, 21, 24, 23), skin, 'ink')
            line(d, (27, 23, 28, 26, 25, 27), 'darkgrey')
            if frame%2: rect(d, (27, 22, 28, 23), 'amberlight')
        else:
            scene.book(d, 19, 18, open=True)
            rect(d, (21, 23, 23, 24), skin, 'ink')
            line(d, (26+frame%2, 18, 23+frame%2, 22), 'darkgrey')
            rect(d, (24+frame%2, 18, 26+frame%2, 20), skin, 'ink')
    if direction == 2: im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return im

def person_portrait(key, p, expression):
    im = base.portrait({**p, 'age': 'adult'}, expression).resize((48, 48), Image.Resampling.NEAREST)
    d = ImageDraw.Draw(im)
    if key == 'atelier-cecilia':
        for x in (17, 21, 25, 29): line(d, (x, 5, x+1, 9), p['hairlight'])
        for x in (21, 24, 27): line(d, (x, 2, x+1, 4), p['hairlight'])
        for x in (12, 35): ell(d, (x, 26, x+1, 29), 'amberlight', 'amberdark')
        line(d, (19, 38, 23, 42, 28, 38), '#abb69a')
        rect(d, (24, 44, 24, 44), '#d9dac1')
    elif key == 'atelier-gilberto':
        for x, y in ((13, 6), (19, 2), (26, 2), (34, 7), (38, 11), (12, 15)):
            rect(d, (x, y, x+2, y+1), p['hairlight'])
        rect(d, (20, 40, 28, 47), p['shirt'])
        line(d, (19, 40, 19, 47), '#d5966f')
        line(d, (29, 40, 29, 47), '#d5966f')
        line(d, (16, 36, 20, 41, 28, 41, 32, 36), '#303544', 2)
        rect(d, (15, 36, 18, 41), '#303544', 'ink')
        rect(d, (30, 36, 33, 41), '#303544', 'ink')
        line(d, (16, 26, 18, 26), p['skindark'])
        line(d, (30, 26, 32, 26), p['skindark'])
    elif key == 'atelier-ivana':
        rect(d, (11, 14, 15, 20), p['skindark'])
        rect(d, (33, 14, 37, 20), p['skindark'])
        for x, y in ((18, 5), (24, 3), (30, 5)):
            rect(d, (x, y, x+2, y+1), p['hairlight'])
        for x in (12, 35): rect(d, (x, 27, x+1, 28), 'amberlight')
        line(d, (20, 37, 22, 43), '#d2b977')
        rect(d, (20, 43, 24, 47), 'paper', 'ink')
        rect(d, (22, 44, 22, 45), 'cyandark')
        rect(d, (30, 42, 35, 47), '#7ea9a2', '#245961')
        line(d, (27, 40, 27, 47), '#245961')
    else:
        for x in (12, 16, 31, 35):
            end = 34 if x in (12, 35) else 15
            line(d, (x, 6, x+1, end), p['hair'], 3)
            for y in range(8, end, 4): line(d, (x, y, x+1, y+1), p['hairlight'])
        line(d, (18, 37, 32, 47), '#978162', 3)
        rect(d, (32, 42, 38, 47), '#ad9774', 'ink')
        line(d, (34, 44, 36, 44), '#d0bd99')
        line(d, (18, 39, 21, 42, 24, 39), '#8fa3ac')
    return im.resize((96, 96), Image.Resampling.NEAREST)

def resident(key, p):
    lines = [{'speaker': key, 'en': en, 'pt': pt, 'bubbleKind': bubble_kind} for en, pt, bubble_kind in p['lines']]
    return {'id': key, 'name': p['name'], 'character': key, 'role': p['role'], 'age': p['age'], 'map': p['map'], 'chapter': p['chapter'], 'identity': 'Pessoa negra brasileira original e fictícia. '+p['appearance'], 'personality': p['personality'], 'relationships': p['relationships'], 'preferredActivities': p['preferredActivities'], 'lines': lines, 'repeat': lines[0]}

def preview(props, sprites, portraits):
    im = Image.new('RGBA', (1280, 1090), '#e7dfcc')
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    for i, ((identifier, name, category), image) in enumerate(zip(PROPS, props)):
        x, y = i%8*160, i//8*160
        rect(d, (x+5, y+5, x+153, y+152), '#d6ccb5')
        im.alpha_composite(image.resize((112, 112), Image.Resampling.NEAREST), (x+24, y+7))
        parts = ['']
        for word in (str(i)+' '+name).split():
            phrase = (parts[-1]+' '+word).strip()
            if d.textlength(phrase, font=font) > 146: parts.append(word)
            else: parts[-1] = phrase
        for r, text in enumerate(parts[:3]): d.text((x+7, y+121+r*13), text, fill=P['navy'], font=font)
    for i, (key, p) in enumerate(PEOPLE.items()):
        x, y = i*320+7, 506
        rect(d, (x, y, x+304, y+575), '#d6ccb5')
        d.text((x+8, y+9), p['name']+' · '+str(p['age'])+' anos · '+p['map'], fill=P['navy'], font=font)
        im.alpha_composite(portraits[key], (x+8, y+31))
        for row in range(6):
            for frame in range(4):
                cell = sprites[key].crop((frame*32, row*32, frame*32+32, row*32+32)).resize((64, 64), Image.Resampling.NEAREST)
                im.alpha_composite(cell, (x+12+frame*72, y+141+row*69))
    im.save(ROOT / 'tests' / 'atelier-preview.png', optimize=True)

def main():
    out = ROOT / 'assets'
    props = [prop(i) for i in range(24)]
    assert len(set(x.tobytes() for x in props)) == 24
    atlas = empty(256, 96)
    records = []
    for i, ((identifier, name, category), image) in enumerate(zip(PROPS, props)):
        assert image.getchannel('A').getextrema() == (0, 255)
        atlas.alpha_composite(image, (i%8*32, i//8*32))
        records.append(metadata(i, identifier, name, category))
    atlas.save(out / 'tilesets' / 'atelier-props.png', optimize=True)
    manifest = {'version': '2.0', 'license': 'CC0-1.0', 'licenseURL': 'https://creativecommons.org/publicdomain/zero/1.0/', 'attributionRequired': False, 'creator': 'Original VOICES pixel art', 'generator': 'tools/create_atelier_assets.py', 'atlas': 'assets/tilesets/atelier-props.png', 'tileSize': 32, 'columns': 8, 'rows': 3, 'coordinateUnits': 'tile-fraction', 'sourceRectUnits': 'pixel', 'colorRoleConvention': 'Only these exact RGB triples may be recolored: shadow, body, highlight. Skin, outlines, contents and alpha remain unchanged.', 'palette': P, 'props': records}
    (out / 'tilesets' / 'atelier-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    characters, sprite_images, portrait_images = {}, {}, {}
    for key, p in PEOPLE.items():
        sheet, portrait = empty(128, 192), empty(288, 96)
        unique = set()
        for row in range(6):
            for frame in range(4):
                image = person_sprite(key, p, row, frame)
                unique.add(image.tobytes())
                sheet.alpha_composite(image, (frame*32, row*32))
        assert len(unique) >= 14, (key, len(unique))
        for column, expression in enumerate(('neutral', 'happy', 'concerned')):
            portrait.alpha_composite(person_portrait(key, p, expression), (column*96, 0))
        assert sheet.getchannel('A').getextrema() == (0, 255)
        assert portrait.getchannel('A').getextrema() == (0, 255)
        sheet.save(out / 'characters' / (key+'.png'), optimize=True)
        portrait.save(out / 'characters' / (key+'-portrait.png'), optimize=True)
        characters[key] = {'name': p['name'], 'role': p['role'], 'quote': p['lines'][0][1], 'accent': p['shirt'], 'sprite': 'assets/characters/'+key+'.png', 'portrait': 'assets/characters/'+key+'-portrait.png', 'originalArt': True, 'license': 'CC0-1.0', 'spriteDimensions': {'width': 128, 'height': 192, 'cellWidth': 32, 'cellHeight': 32, 'columns': 4, 'rows': ['down', 'left', 'right', 'up', 'activity', 'greeting']}, 'portraitDimensions': {'width': 288, 'height': 96, 'nativePixelGrid': 48, 'columns': ['neutral', 'happy', 'concerned']}}
        sprite_images[key], portrait_images[key] = sheet, portrait
    content = {'version': '2.0', 'license': 'CC0-1.0', 'creator': 'Original VOICES residents and pixel art', 'residents': [resident(k, p) for k, p in PEOPLE.items()], 'characters': characters, 'sources': [], 'assetManifest': manifest}
    encoded = base64.b64encode((out / 'tilesets' / 'atelier-props.png').read_bytes()).decode('ascii')
    registry = "(function(){'use strict';const V=window.V=window.V||{};V.atelierAssets="+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+";V.sceneAssets=V.sceneAssets||[];V.sceneAssets.push(...V.atelierAssets);V.atelierMaterialSources={atelier:'data:image/png;base64,"+encoded+"'};V.atelierContent="+json.dumps(content, ensure_ascii=False, separators=(',', ':'))+";})();\n"
    (ROOT / 'js' / 'atelier-content.js').write_text(registry, encoding='utf-8')
    preview(props, sprite_images, portrait_images)
    print(json.dumps({'props': 24, 'uniqueProps': len(set(x.tobytes() for x in props)), 'residents': 4, 'dialoguePairs': 12, 'preview': 'tests/atelier-preview.png'}, ensure_ascii=False))

if __name__ == '__main__':
    main()
