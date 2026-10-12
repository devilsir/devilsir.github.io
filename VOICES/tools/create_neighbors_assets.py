from pathlib import Path
import importlib.util
import base64
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_neighbors_palette', ROOT / 'tools' / 'create_scene_assets.py')
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
base = scene.base
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty
P = base.P
WOOD = ['#624535', P['brown'], P['brownlight']]
FABRIC = ['#2b5355', '#588e7d', '#9abfa5']
METAL = [P['darkgrey'], P['grey'], P['greylight']]
PROPS = [
    ('reading-footstool', 'Apoio de pés de leitura', 'biblioteca'),
    ('c-reading-table', 'Mesa de apoio em C', 'biblioteca'),
    ('modular-bookshelf', 'Estante modular de livros', 'biblioteca'),
    ('library-step-stool', 'Banquinho com dois degraus', 'biblioteca'),
    ('closed-book-returns', 'Caixa de devolução de livros', 'biblioteca'),
    ('umbrella-stand', 'Porta-guarda-chuvas', 'casa'),
    ('bus-shelter', 'Abrigo de ponto de ônibus', 'comunidade'),
    ('bus-stop-bench', 'Banco de ponto de ônibus', 'convívio'),
    ('sewing-chair', 'Cadeira da costura', 'ateliê'),
    ('craft-organizer', 'Gaveteiro de materiais de arte', 'ateliê'),
    ('bobbin-rack', 'Suporte de carretéis', 'ateliê'),
    ('ironing-board', 'Tábua de passar roupa', 'casa'),
    ('clothesline', 'Varal de roupas do cotidiano', 'casa'),
    ('washing-machine', 'Máquina de lavar roupas', 'casa'),
    ('linen-chest', 'Baú de lençóis', 'casa'),
    ('wheelbarrow', 'Carrinho de mão da horta', 'horta'),
    ('seedling-stand', 'Estante de mudas', 'horta'),
    ('low-handrail', 'Corrimão baixo', 'comunidade'),
    ('tool-cabinet', 'Armário de ferramentas', 'oficina'),
    ('first-aid-cabinet', 'Armário de primeiros socorros', 'comunidade'),
    ('stroller', 'Carrinho de bebê', 'casa'),
    ('high-chair', 'Cadeirão de alimentação', 'casa'),
    ('pet-carrier', 'Caixa de transporte para animais', 'animais'),
    ('pet-bed', 'Cama para cachorro', 'animais'),
    ('dog-water-station', 'Bebedouro baixo para cachorro', 'animais'),
    ('hanging-planter', 'Vaso pendente com folhas', 'plantas e flores'),
    ('compost-tumbler', 'Composteira de tambor', 'horta'),
    ('rain-gauge', 'Pluviômetro de observação', 'horta'),
    ('bean-trellis', 'Treliça de feijões', 'horta'),
    ('bike-repair-stand', 'Suporte de reparo de bicicleta', 'oficina'),
    ('corner-wall-shelves', 'Prateleiras de canto', 'casa'),
    ('pendulum-clock', 'Relógio de pêndulo', 'casa'),
]
PEOPLE = {
    'neighbors-abel': {'name': 'Abel', 'age': 58, 'map': 'library', 'chapter': 0, 'role': 'Bibliotecário e organizador de rodas de leitura', 'personality': 'Calmo, cuidadoso e bem-humorado; gosta de encontrar um lugar confortável para cada leitor.', 'appearance': 'Homem negro, cachos grisalhos curtos, óculos, cardigan verde, camisa clara, calça marrom e bolsa de livros.', 'preferredActivities': ['Conferir etiquetas de estantes.', 'Organizar livros devolvidos.', 'Ler na cadeira junto à janela.'], 'relationships': ['amara', 'aline'], 'skin': '#7e503a', 'skinlight': '#b78156', 'skindark': '#54392c', 'hair': '#a5a99e', 'hairlight': '#dedbca', 'style': 'curls', 'coat': '#578778', 'shirt': '#dfdac4', 'pants': '#765640', 'accessory': 'glasses', 'outfit': 'cardigan', 'body': 'average', 'lines': [('I put the returned books on this cart.', 'Coloquei os livros devolvidos neste carrinho.'), ('I am checking the shelf labels.', 'Estou conferindo as etiquetas das estantes.'), ('This chair faces the window.', 'Esta cadeira fica voltada para a janela.')]},
    'neighbors-yara': {'name': 'Yara', 'age': 36, 'map': 'market', 'chapter': 0, 'role': 'Costureira e criadora de roupas do cotidiano', 'personality': 'Inventiva e atenciosa; conversa sobre bolsos, tecidos e escolhas pessoais antes de costurar.', 'appearance': 'Mulher negra, coque trançado, brincos pequenos, blusa coral com estampa geométrica original, calça azul e sapatos baixos.', 'preferredActivities': ['Costurar um bolso.', 'Escolher linhas no gaveteiro.', 'Conversar com clientes ao lado da banca.'], 'relationships': ['dandara'], 'skin': '#965f42', 'skinlight': '#c88d5b', 'skindark': '#654231', 'hair': '#2d2430', 'hairlight': '#675048', 'style': 'bun', 'coat': '#cd704b', 'shirt': '#e29a61', 'pants': '#445c74', 'accessory': 'none', 'outfit': 'blouse', 'body': 'wide', 'lines': [('I am sewing a pocket onto this apron.', 'Estou costurando um bolso neste avental.'), ('I chose these colours for my blouse.', 'Escolhi estas cores para minha blusa.'), ('The threads are in the small drawers.', 'As linhas estão nas gavetas pequenas.')]},
    'neighbors-nilo': {'name': 'Nilo', 'age': 31, 'map': 'park', 'chapter': 0, 'role': 'Mecânico de bicicletas da oficina comunitária', 'personality': 'Prático e sociável; explica o ajuste da roda e costuma fazer pausas para observar o parque.', 'appearance': 'Homem negro retinto, locs curtos, camiseta ocre, avental jeans com bolso e calça azul escura.', 'preferredActivities': ['Ajustar uma roda no suporte de reparos.', 'Guardar ferramentas.', 'Descansar no banco.'], 'relationships': [], 'skin': '#6c4230', 'skinlight': '#a06946', 'skindark': '#473127', 'hair': '#28232c', 'hairlight': '#55433f', 'style': 'short', 'coat': '#b47c3e', 'shirt': '#d6a85b', 'pants': '#314459', 'accessory': 'none', 'outfit': 'apron', 'body': 'average', 'lines': [('I am adjusting this bicycle wheel.', 'Estou ajustando esta roda da bicicleta.'), ('The tools are beside the repair stand.', 'As ferramentas estão ao lado do suporte de reparos.'), ('I will rest on that bench.', 'Vou descansar naquele banco.')]},
    'neighbors-rute': {'name': 'Rute', 'age': 67, 'map': 'garden', 'chapter': 0, 'role': 'Jardineira e participante da horta comunitária', 'personality': 'Paciente e observadora; registra datas e gosta de comparar o crescimento das mudas.', 'appearance': 'Mulher negra, cabelos grisalhos curtos sob lenço cotidiano amarelo, camisa creme, jardineira verde e botinas.', 'preferredActivities': ['Conferir mudas na estante.', 'Anotar datas nas etiquetas.', 'Regar um canteiro e fazer uma pausa.'], 'relationships': ['maite'], 'skin': '#8b5b40', 'skinlight': '#bb895d', 'skindark': '#5d412f', 'hair': '#93978e', 'hairlight': '#d3d4c4', 'style': 'short', 'coat': '#d5d7bd', 'shirt': '#e6e3cc', 'pants': '#466c55', 'accessory': 'none', 'outfit': 'overalls', 'body': 'wide', 'lines': [('I am checking the seedlings.', 'Estou conferindo as mudas.'), ('This bed needs water.', 'Este canteiro precisa de água.'), ('I wrote the date on each label.', 'Escrevi a data em cada etiqueta.')]},
}
BREEDS = [
    ('poodle', 'Poodle', 'Pelagem cacheada apricot, orelhas caídas e cauda com pelo.', 'https://www.akc.org/dog-breeds/poodle-standard/'),
    ('dachshund', 'Dachshund', 'Corpo comprido e baixo, patas curtas e orelhas caídas.', 'https://www.akc.org/dog-breeds/dachshund/'),
    ('beagle', 'Beagle', 'Pelagem tricolor, orelhas caídas e ponta clara na cauda.', 'https://www.akc.org/dog-breeds/beagle/'),
    ('siberian-husky', 'Husky siberiano', 'Pelagem cinza e branca, orelhas eretas e cauda peluda.', 'https://www.akc.org/dog-breeds/siberian-husky/'),
    ('boxer', 'Boxer', 'Pelagem fulva, focinho escuro curto, peito claro e orelhas naturais caídas.', 'https://www.akc.org/dog-breeds/boxer/'),
    ('shih-tzu', 'Shih-tzu', 'Cachorro pequeno de pelagem longa branca e dourada, cauda emplumada.', 'https://www.akc.org/dog-breeds/shih-tzu/'),
]

def shadow(d, box=(3, 26, 29, 30)):
    ell(d, box, (17, 23, 41, 44))

def woodbox(d, b, tone=1):
    rect(d, b, WOOD[tone], 'ink')
    line(d, (b[0]+1, b[1]+1, b[2]-1, b[1]+1), WOOD[2])

def foot(d, x, y, tint=None):
    rect(d, (x, y, x+2, 29), tint or WOOD[0], 'ink')

def prop(i):
    im = empty()
    d = ImageDraw.Draw(im)
    if i == 0:
        shadow(d, (5, 26, 27, 29))
        foot(d, 7, 23); foot(d, 22, 23)
        rect(d, (4, 16, 27, 24), FABRIC[0], 'ink')
        ell(d, (4, 12, 27, 22), FABRIC[1], 'ink')
        line(d, (8, 14, 22, 14), FABRIC[2])
        line(d, (9, 17, 23, 17), FABRIC[0])
    elif i == 1:
        shadow(d, (5, 26, 28, 30))
        woodbox(d, (4, 9, 26, 13), 2)
        rect(d, (23, 13, 26, 28), WOOD[1], 'ink')
        woodbox(d, (7, 26, 28, 29), 1)
        scene.book(d, 8, 5, 'violet')
        scene.cup(d, 20, 5)
    elif i == 2:
        shadow(d)
        rect(d, (4, 2, 27, 28), WOOD[0], 'ink')
        for y in (3, 12, 21, 28): woodbox(d, (4, y, 27, y+1), 2)
        rect(d, (14, 3, 16, 27), WOOD[1], 'ink')
        for x, h, tint in ((6, 5, 'coral'), (9, 6, 'amber'), (11, 4, 'cyandark'), (18, 5, 'green'), (21, 6, 'violet'), (24, 4, 'coral')):
            rect(d, (x, 11-h, x+1, 11), tint, 'ink')
            rect(d, (x, 10, x+1, 10), 'paper')
        rect(d, (6, 16, 12, 19), 'paper', 'ink')
        rect(d, (6, 15, 12, 16), 'violet')
        scene.plant(d, 21, 18)
        for x, tint in ((6, 'cyan'), (10, 'green'), (18, 'amber'), (22, 'coral')):
            rect(d, (x, 23, x+2, 27), tint, 'ink')
    elif i == 3:
        shadow(d, (4, 25, 28, 30))
        foot(d, 7, 17); foot(d, 22, 17)
        woodbox(d, (5, 13, 24, 18), 2)
        woodbox(d, (4, 23, 28, 27), 2)
        line(d, (7, 14, 21, 14), 'amberlight')
        line(d, (7, 24, 25, 24), WOOD[0])
    elif i == 4:
        shadow(d)
        rect(d, (5, 6, 26, 28), FABRIC[0], 'ink')
        rect(d, (4, 4, 27, 8), FABRIC[1], 'ink')
        rect(d, (8, 11, 23, 15), 'ink')
        rect(d, (9, 12, 22, 13), 'paper')
        rect(d, (9, 18, 22, 24), FABRIC[1], 'ink')
        scene.book(d, 12, 18, 'paper')
        rect(d, (22, 20, 23, 22), 'amberlight', 'ink')
        line(d, (7, 7, 23, 7), FABRIC[2])
    elif i == 5:
        shadow(d, (7, 25, 24, 30))
        poly(d, [(7, 18), (24, 18), (22, 29), (10, 29)], FABRIC[1], 'ink')
        line(d, (11, 20, 12, 27), FABRIC[2])
        line(d, (13, 18, 12, 6, 13, 3, 16, 3, 17, 5), 'darkgrey', 2)
        poly(d, [(11, 7), (15, 6), (17, 17), (13, 18)], 'coral', 'coraldark')
        line(d, (19, 18, 21, 9, 23, 7, 25, 8), 'darkgrey')
        poly(d, [(19, 10), (22, 9), (23, 19), (19, 19)], 'navylight', 'ink')
    elif i == 6:
        shadow(d, (1, 26, 31, 30))
        rect(d, (3, 8, 5, 29), 'darkgrey', 'ink')
        rect(d, (26, 8, 28, 29), 'darkgrey', 'ink')
        rect(d, (5, 8, 26, 24), '#a0c5c0', 'darkgrey')
        rect(d, (13, 8, 14, 23), 'grey')
        line(d, (8, 11, 8, 21), '#d4e4d6')
        line(d, (9, 11, 12, 11), '#d4e4d6')
        poly(d, [(1, 8), (4, 3), (27, 3), (31, 8)], FABRIC[0], 'ink')
        line(d, (5, 4, 26, 4), FABRIC[2])
        rect(d, (7, 23, 24, 26), WOOD[2], 'ink')
        rect(d, (9, 26, 11, 29), 'darkgrey', 'ink')
        rect(d, (21, 26, 23, 29), 'darkgrey', 'ink')
    elif i == 7:
        shadow(d)
        rect(d, (6, 22, 8, 29), 'darkgrey', 'ink')
        rect(d, (23, 22, 25, 29), 'darkgrey', 'ink')
        poly(d, [(3, 11), (29, 11), (27, 18), (4, 18)], FABRIC[1], 'ink')
        line(d, (5, 13, 27, 13), FABRIC[2])
        poly(d, [(4, 18), (27, 18), (30, 23), (2, 23)], FABRIC[0], 'ink')
        line(d, (6, 19, 25, 19), FABRIC[1])
        for x in (8, 15, 22): line(d, (x, 12, x-1, 16), FABRIC[0])
    elif i == 8:
        shadow(d, (7, 25, 26, 30))
        for x in (10, 22): foot(d, x, 20)
        rect(d, (8, 5, 24, 15), WOOD[1], 'ink')
        rect(d, (10, 7, 22, 12), FABRIC[1], 'ink')
        rect(d, (8, 19, 25, 23), WOOD[2], 'ink')
        line(d, (10, 20, 23, 20), FABRIC[2])
        rect(d, (10, 14, 12, 19), WOOD[0], 'ink')
        rect(d, (21, 14, 23, 19), WOOD[0], 'ink')
    elif i == 9:
        shadow(d)
        woodbox(d, (4, 8, 27, 28), 1)
        for y in (12, 18, 24):
            for x in (6, 16):
                rect(d, (x, y, x+8, y+4), WOOD[2], 'ink')
                line(d, (x+3, y+2, x+5, y+2), 'darkgrey')
        rect(d, (6, 3, 11, 8), 'paper', 'ink')
        line(d, (7, 1, 7, 5), 'coral')
        line(d, (9, 0, 9, 5), 'cyandark')
        scene.book(d, 18, 3, 'violet')
    elif i == 10:
        shadow(d, (5, 25, 29, 29))
        woodbox(d, (5, 7, 27, 24), 1)
        for y in (11, 19):
            for x, tint in ((8, 'coral'), (15, 'cyan'), (22, 'amber')):
                rect(d, (x-1, y-2, x+3, y+4), 'paper', 'ink')
                rect(d, (x, y-1, x+2, y+3), tint, 'ink')
                line(d, (x, y+1, x+2, y+1), 'white')
        rect(d, (6, 25, 26, 28), WOOD[2], 'ink')
    elif i == 11:
        shadow(d)
        line(d, (6, 16, 24, 29), 'darkgrey', 2)
        line(d, (25, 16, 8, 29), 'darkgrey', 2)
        poly(d, [(2, 13), (8, 9), (28, 10), (30, 13), (29, 17), (4, 17)], FABRIC[1], 'ink')
        line(d, (6, 11, 26, 12), FABRIC[2])
        line(d, (9, 14, 27, 14), FABRIC[0])
        poly(d, [(20, 9), (23, 4), (27, 4), (29, 9)], 'paper', 'ink')
        rect(d, (23, 4, 27, 5), None, 'darkgrey')
    elif i == 12:
        shadow(d)
        rect(d, (2, 3, 3, 29), WOOD[1], 'ink')
        rect(d, (28, 3, 29, 29), WOOD[1], 'ink')
        line(d, (3, 5, 28, 5), 'paper')
        poly(d, [(6, 7), (10, 7), (13, 9), (12, 12), (10, 11), (10, 19), (6, 19), (6, 11), (4, 12), (3, 10)], 'coral', 'ink')
        line(d, (7, 8, 9, 8), 'white')
        rect(d, (14, 7, 19, 20), 'violetlight', 'violetdark')
        poly(d, [(21, 7), (27, 7), (27, 18), (25, 18), (24, 11), (23, 18), (21, 18)], 'navylight', 'ink')
        for x in (6, 10, 15, 19, 22, 26): rect(d, (x, 4, x, 7), 'amberdark')
    elif i == 13:
        shadow(d)
        rect(d, (5, 5, 27, 28), '#dadccf', 'ink')
        rect(d, (6, 6, 26, 12), '#c0c9c4', 'darkgrey')
        rect(d, (8, 8, 14, 10), 'white', 'grey')
        ell(d, (21, 7, 25, 11), 'grey', 'darkgrey')
        ell(d, (9, 14, 23, 27), 'darkgrey', 'ink')
        ell(d, (11, 16, 21, 25), '#607e89', 'greylight')
        poly(d, [(12, 19), (18, 18), (20, 22), (14, 23)], '#9ab4bc')
        line(d, (12, 17, 14, 17), 'white')
        rect(d, (7, 27, 9, 29), 'darkgrey')
        rect(d, (23, 27, 25, 29), 'darkgrey')
    elif i == 14:
        shadow(d)
        woodbox(d, (4, 15, 27, 28), 1)
        woodbox(d, (3, 12, 28, 17), 2)
        rect(d, (14, 16, 17, 20), 'amber', 'ink')
        rect(d, (7, 5, 22, 11), FABRIC[0], 'ink')
        rect(d, (7, 4, 24, 8), 'paper', 'ink')
        line(d, (8, 6, 22, 6), 'greylight')
        rect(d, (10, 1, 24, 4), FABRIC[1], 'ink')
        line(d, (11, 2, 21, 2), FABRIC[2])
        line(d, (6, 24, 25, 24), WOOD[0])
    elif i == 15:
        shadow(d)
        line(d, (23, 15, 28, 9), WOOD[1], 2)
        line(d, (25, 16, 30, 10), WOOD[1], 2)
        line(d, (21, 21, 25, 28), 'darkgrey', 2)
        ell(d, (4, 23, 13, 31), 'darkgrey', 'ink')
        ell(d, (7, 26, 10, 29), 'greylight', 'ink')
        poly(d, [(3, 12), (21, 10), (26, 17), (21, 23), (9, 23)], FABRIC[0], 'ink')
        poly(d, [(5, 12), (19, 12), (23, 17), (19, 19), (9, 19)], '#73543f', 'ink')
        for x, y in ((9, 14), (14, 13), (18, 15)): line(d, (x, y, x+2, y+1), '#b99068')
        line(d, (7, 20, 20, 20), FABRIC[2])
    elif i == 16:
        shadow(d)
        foot(d, 5, 4); foot(d, 25, 4)
        for y in (14, 25):
            woodbox(d, (4, y, 28, y+2), 2)
            for x in (8, 16, 24):
                poly(d, [(x-3, y-4), (x+3, y-4), (x+2, y-1), (x-2, y-1)], 'coral', 'ink')
                line(d, (x, y-4, x, y-8), 'greendark')
                poly(d, [(x, y-6), (x-4, y-8), (x-3, y-10), (x, y-8)], 'green', 'greendark')
                poly(d, [(x, y-7), (x+2, y-9), (x+4, y-8), (x+1, y-5)], 'greenlight', 'greendark')
    elif i == 17:
        shadow(d, (2, 26, 30, 30))
        for x in (4, 15, 27): rect(d, (x, 14, x+1, 29), 'grey', 'ink')
        line(d, (2, 13, 30, 13), 'darkgrey', 3)
        line(d, (3, 12, 29, 12), 'greylight')
        line(d, (4, 28, 7, 28), 'greylight')
        line(d, (26, 28, 29, 28), 'greylight')
    elif i == 18:
        shadow(d)
        rect(d, (5, 3, 26, 28), FABRIC[0], 'ink')
        rect(d, (7, 5, 24, 25), FABRIC[1], 'ink')
        line(d, (16, 5, 16, 25), FABRIC[0])
        for x in (14, 18): line(d, (x, 15, x, 18), 'amberlight')
        line(d, (8, 7, 22, 7), FABRIC[2])
        rect(d, (7, 27, 9, 29), 'darkgrey')
        rect(d, (23, 27, 25, 29), 'darkgrey')
    elif i == 19:
        rect(d, (6, 3, 25, 25), 'paper', 'ink')
        rect(d, (8, 5, 23, 23), 'white', 'grey')
        rect(d, (13, 9, 18, 19), 'greendark')
        rect(d, (10, 12, 21, 16), 'greendark')
        line(d, (22, 11, 22, 15), 'darkgrey')
        line(d, (7, 25, 24, 25), 'darkgrey')
    elif i == 20:
        shadow(d)
        for x in (7, 24): ell(d, (x-3, 25, x+3, 31), 'darkgrey', 'ink')
        line(d, (7, 27, 24, 16), 'grey', 2)
        line(d, (24, 27, 7, 18), 'grey', 2)
        line(d, (22, 16, 28, 8, 30, 8), 'darkgrey', 2)
        poly(d, [(4, 9), (8, 3), (15, 3), (22, 8), (24, 16), (5, 16)], FABRIC[0], 'ink')
        poly(d, [(9, 6), (14, 5), (20, 10), (22, 15), (9, 15)], FABRIC[1], 'ink')
        poly(d, [(5, 16), (24, 16), (22, 23), (9, 23)], FABRIC[1], 'ink')
        line(d, (9, 18, 19, 18), FABRIC[2])
        rect(d, (8, 25, 22, 27), 'grey', 'ink')
    elif i == 21:
        shadow(d)
        for x, target in ((10, 7), (22, 25)): line(d, (x, 18, target, 29), WOOD[0], 2)
        woodbox(d, (10, 2, 22, 14), 2)
        rect(d, (12, 4, 20, 11), FABRIC[1], 'ink')
        woodbox(d, (7, 16, 26, 21), 2)
        rect(d, (4, 13, 29, 17), 'paper', 'ink')
        line(d, (8, 14, 25, 14), 'white')
        rect(d, (12, 23, 23, 25), WOOD[1], 'ink')
    elif i == 22:
        shadow(d, (3, 26, 28, 30))
        rect(d, (4, 12, 27, 28), FABRIC[0], 'ink')
        poly(d, [(3, 13), (5, 7), (23, 7), (28, 13)], FABRIC[1], 'ink')
        rect(d, (12, 4, 21, 7), None, 'darkgrey')
        rect(d, (6, 15, 17, 25), 'darkgrey', 'ink')
        for x in (8, 11, 14): line(d, (x, 16, x, 24), 'greylight')
        line(d, (8, 20, 15, 20), 'grey')
        for x in (21, 24): line(d, (x, 16, x, 21), FABRIC[2])
    elif i == 23:
        shadow(d, (2, 26, 30, 31))
        ell(d, (2, 14, 30, 30), FABRIC[0], 'ink')
        ell(d, (4, 14, 28, 27), FABRIC[1], 'ink')
        ell(d, (8, 17, 25, 26), FABRIC[0])
        ell(d, (8, 18, 24, 24), FABRIC[2], FABRIC[0])
        line(d, (6, 17, 8, 16), FABRIC[2])
        line(d, (26, 21, 27, 23), FABRIC[2])
    elif i == 24:
        shadow(d, (4, 26, 29, 30))
        rect(d, (5, 21, 7, 28), WOOD[0], 'ink')
        rect(d, (26, 21, 28, 28), WOOD[0], 'ink')
        woodbox(d, (3, 17, 30, 22), 2)
        ell(d, (5, 12, 17, 20), 'grey', 'ink')
        ell(d, (7, 12, 15, 16), 'cyanlight', 'darkgrey')
        ell(d, (18, 12, 29, 20), 'grey', 'ink')
        ell(d, (20, 12, 27, 16), 'cyanlight', 'darkgrey')
        line(d, (8, 13, 11, 13), 'white')
        line(d, (23, 13, 25, 13), 'white')
    elif i == 25:
        line(d, (16, 0, 5, 16), WOOD[2])
        line(d, (16, 0, 27, 16), WOOD[2])
        line(d, (16, 1, 16, 18), WOOD[2])
        poly(d, [(6, 18), (26, 18), (23, 26), (9, 26)], FABRIC[1], 'ink')
        line(d, (10, 21, 22, 21), FABRIC[2])
        for x, y, bend in ((9, 11, -4), (17, 12, 2), (23, 13, 3), (8, 18, -3), (22, 20, 5)):
            poly(d, [(x, y+2), (x+bend, y-3), (x+bend+3, y-4), (x+2, y+3)], 'green', 'greendark')
            line(d, (x+1, y+1, x+bend+1, y-2), 'greenlight')
        line(d, (25, 21, 25, 30), 'greendark')
        poly(d, [(24, 27), (28, 25), (29, 27), (26, 29)], 'green', 'greendark')
    elif i == 26:
        shadow(d)
        line(d, (7, 17, 4, 29), 'darkgrey', 2)
        line(d, (23, 17, 28, 29), 'darkgrey', 2)
        rect(d, (4, 29, 29, 30), 'grey', 'ink')
        rect(d, (5, 6, 25, 23), FABRIC[0], 'ink')
        ell(d, (21, 6, 29, 23), FABRIC[1], 'ink')
        line(d, (8, 8, 21, 8), FABRIC[2])
        line(d, (7, 20, 21, 20), FABRIC[1])
        rect(d, (11, 9, 19, 17), FABRIC[1], 'ink')
        for x in (7, 21):
            for y in (12, 17): rect(d, (x, y, x, y), 'ink')
        line(d, (27, 13, 31, 13, 31, 16), 'grey', 2)
    elif i == 27:
        shadow(d, (9, 27, 24, 30))
        rect(d, (14, 12, 16, 29), WOOD[1], 'ink')
        poly(d, [(10, 4), (22, 4), (20, 20), (12, 20)], '#b7dad7', 'darkgrey')
        poly(d, [(12, 13), (20, 13), (19, 18), (13, 18)], '#80bebc')
        rect(d, (9, 2, 23, 5), '#cbded4', 'darkgrey')
        for y in (7, 10, 13, 16): line(d, (17, y, 20, y), 'darkgrey')
        line(d, (13, 6, 13, 10), 'white')
    elif i == 28:
        shadow(d)
        for x in (6, 16, 26): line(d, (x, 3, x, 29), WOOD[1], 2)
        for y in (7, 15, 23): line(d, (4, y, 28, y), WOOD[2], 2)
        for x, bend in ((8, -1), (18, 2), (24, -2)):
            line(d, (x, 29, x+bend, 20, x, 13, x+bend, 6), 'greendark', 2)
            for y in (10, 17, 24):
                poly(d, [(x, y+2), (x-4, y), (x-3, y-3), (x, y-1)], 'green', 'greendark')
                poly(d, [(x, y), (x+4, y-3), (x+5, y), (x+1, y+3)], 'greenlight', 'greendark')
            line(d, (x+2, 15, x+4, 19, x+2, 21), 'greenlight', 2)
    elif i == 29:
        shadow(d)
        line(d, (16, 5, 16, 28), 'grey', 3)
        line(d, (16, 27, 7, 30), 'darkgrey', 2)
        line(d, (16, 27, 26, 30), 'darkgrey', 2)
        line(d, (17, 6, 21, 6), 'grey', 2)
        ell(d, (1, 14, 13, 26), None, 'ink', 2)
        ell(d, (19, 14, 31, 26), None, 'ink', 2)
        ell(d, (3, 16, 11, 24), None, 'greylight')
        ell(d, (21, 16, 29, 24), None, 'greylight')
        line(d, (7, 20, 12, 10, 20, 20, 7, 20, 17, 10, 25, 20), FABRIC[1], 2)
        line(d, (17, 10, 21, 7, 23, 7), 'darkgrey')
        line(d, (12, 10, 11, 7, 15, 7), 'darkgrey', 2)
        line(d, (13, 20, 16, 22), 'grey')
        line(d, (25, 17, 25, 23), 'grey')
        line(d, (4, 20, 10, 20), 'grey')
    elif i == 30:
        for y in (10, 22):
            poly(d, [(2, y), (15, y-4), (29, y), (16, y+5)], WOOD[2], 'ink')
            line(d, (3, y+1, 15, y+4, 28, y), WOOD[0])
            line(d, (15, y+4, 15, y+7), WOOD[1], 2)
        scene.book(d, 6, 4, 'coral')
        scene.plant(d, 20, 5)
        scene.book(d, 8, 15, 'violet')
        scene.cup(d, 21, 15)
    else:
        rect(d, (9, 2, 24, 28), WOOD[1], 'ink')
        poly(d, [(6, 6), (9, 1), (24, 1), (27, 6)], WOOD[2], 'ink')
        ell(d, (11, 5, 22, 16), 'paper', 'ink')
        line(d, (16, 7, 16, 11, 20, 11), 'ink')
        for x, y in ((16, 6), (21, 11), (16, 15), (12, 11)): rect(d, (x, y, x, y), 'darkgrey')
        rect(d, (12, 18, 21, 26), WOOD[0], 'ink')
        line(d, (16, 18, 16, 23), 'amberlight')
        ell(d, (14, 23, 19, 27), 'amber', 'ink')
        rect(d, (8, 28, 25, 30), WOOD[2], 'ink')
    return im

def prop_metadata(i, identifier, name, category):
    wall = i in (19, 25, 30, 31)
    footprint = None if wall else [0.12, 0.71, 0.77, 0.21]
    if i in (6, 12, 17, 28): footprint = [0.05, 0.77, 0.90, 0.13]
    colors = {}
    if i in (0, 1, 2, 3, 6, 8, 9, 10, 12, 14, 15, 16, 21, 24, 25, 27, 28, 30, 31): colors['wood'] = WOOD
    if i in (0, 4, 5, 6, 7, 8, 11, 14, 15, 18, 20, 21, 22, 23, 25, 26, 29): colors['fabric'] = FABRIC
    if i in (16, 25, 28): colors['foliage'] = [P['greendark'], P['green'], P['greenlight']]
    interaction = 'sit' if i in (0, 7, 8) else None
    return {'index': i, 'id': identifier, 'family': 'neighbors', 'name': name, 'category': category, 'solid': bool(footprint), 'solidFootprint': footprint, 'layer': 'wall' if wall else 'object', 'interaction': interaction, 'colorRoles': colors, 'sourceRect': {'x': i%8*32, 'y': i//8*32, 'width': 32, 'height': 32}}

def person_hair(d, key, p, direction, bob=0):
    h, hi = p['hair'], p['hairlight']
    if key == 'neighbors-abel':
        for x, y in ((11, 4), (14, 3), (18, 3), (21, 5)):
            rect(d, (x, y+bob, x+1, y+bob), hi)
    elif key == 'neighbors-yara':
        if direction == 3:
            ell(d, (9, 3+bob, 22, 14+bob), h, 'ink')
        for x in (12, 15, 18, 21): line(d, (x, 4+bob, x+1, 6+bob), hi)
        for x in (14, 17, 20): line(d, (x, 1+bob, x+1, 3+bob), hi)
        if direction != 3:
            for x in (9, 22) if direction == 0 else (20,) if direction == 1 else (10,): rect(d, (x, 13+bob, x, 14+bob), 'amberlight')
    elif key == 'neighbors-nilo':
        if direction in (0, 3):
            if direction == 3: ell(d, (9, 3+bob, 22, 14+bob), h, 'ink')
            for x in (10, 13, 16, 19, 22):
                end = 11 if x in (10, 22) else 7
                line(d, (x, 3+bob, x-1, end+bob), h, 2)
                for y in range(4, end, 3): line(d, (x, y+bob, x-1, y+1+bob), hi)
        else:
            for x in (13, 16, 19, 22):
                line(d, (x, 3+bob, x+1, 8+bob), h, 2)
                line(d, (x, 5+bob, x+1, 6+bob), hi)
    else:
        poly(d, [(9, 8+bob), (9, 4+bob), (12, 1+bob), (20, 1+bob), (23, 5+bob), (22, 8+bob), (19, 6+bob), (12, 6+bob)], '#c49d47', 'ink')
        line(d, (11, 3+bob, 19, 5+bob, 22, 4+bob), '#efd486')
        line(d, (11, 5+bob, 19, 7+bob), '#987437')
        if direction == 3:
            ell(d, (10, 6+bob, 21, 14+bob), h, 'ink')
            poly(d, [(19, 5+bob), (24, 6+bob), (24, 9+bob), (21, 10+bob), (19, 8+bob)], '#c49d47', 'ink')
            rect(d, (14, 9+bob, 15, 10+bob), hi)
        elif direction == 0:
            rect(d, (9, 8+bob, 10, 10+bob), hi)
            rect(d, (21, 8+bob, 22, 10+bob), hi)

def person_sprite(key, p, row, frame):
    direction = row if row < 4 else 0
    state_frame = frame if row < 4 else 0
    im = base.sprite({**p, 'age': 'adult'}, direction, state_frame, 'walk')
    if direction == 2: im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    d = ImageDraw.Draw(im)
    bob = frame%2 if row < 4 else 0
    side = direction in (1, 2)
    skin, fabric = p['skin'], p['coat']
    if p['body'] == 'wide' and not side:
        poly(d, [(9, 17+bob), (22, 17+bob), (24, 22), (23, 24), (8, 24), (7, 22)], fabric, 'ink')
        if direction != 3: rect(d, (14, 17+bob, 17, 18+bob), p['shirt'])
    if p['outfit'] == 'cardigan':
        if direction != 3 and not side:
            rect(d, (13, 18+bob, 18, 23), p['shirt'])
            line(d, (12, 18+bob, 12, 23), '#86ab94')
            line(d, (19, 18+bob, 19, 23), '#86ab94')
            for y in (19, 22): rect(d, (19, y, 19, y), 'amberlight')
    elif p['outfit'] == 'blouse':
        for x, y in ((11, 18), (17, 20), (20, 23), (13, 23)):
            if not side or x > 14:
                rect(d, (x, y+bob if y < 22 else y, x+1, y+bob if y < 22 else y), '#edc186')
                rect(d, (x+1, y+1+bob if y < 22 else y+1, x+1, y+1+bob if y < 22 else y+1), '#934b3c')
        if direction != 3 and not side: line(d, (13, 17+bob, 15, 19+bob, 18, 17+bob), '#f4d49c')
    elif p['outfit'] == 'apron':
        if direction != 3:
            if side:
                poly(d, [(12, 18+bob), (15, 18+bob), (15, 24), (10, 24)], '#567f94', 'ink')
                line(d, (13, 19+bob, 13, 22), '#a0b7b9')
            else:
                rect(d, (12, 18+bob, 19, 24), '#567f94', 'ink')
                line(d, (12, 16+bob, 14, 18+bob), '#9fb9bd')
                line(d, (19, 16+bob, 17, 18+bob), '#9fb9bd')
                rect(d, (14, 20+bob, 17, 22+bob), '#7097a3', '#32495d')
                line(d, (17, 20+bob, 17, 21+bob), 'grey')
        else: line(d, (10, 20, 21, 20), '#567f94')
    elif p['outfit'] == 'overalls':
        if direction != 3:
            bx = (12, 18) if side else (11, 20)
            rect(d, (bx[0], 19+bob, bx[1], 24), '#638667', 'ink')
            for x in (12, 18) if not side else (13,):
                line(d, (x, 17+bob, x, 21+bob), '#638667', 2)
                rect(d, (x, 19+bob, x, 19+bob), 'amberlight')
            rect(d, (14, 21, 17, 23), '#90b38a', '#466c55')
        else:
            line(d, (12, 17+bob, 16, 22, 19, 17+bob), '#638667', 2)
            rect(d, (10, 22, 21, 24), '#638667', 'ink')
    person_hair(d, key, p, 1 if side else direction, bob)
    if row in (4, 5):
        rect(d, (22, 15, 30, 26), (0, 0, 0, 0))
        if row == 5:
            poly(d, [(21, 18), (24, 15), (24, 12+frame%2), (26, 12+frame%2), (27, 16), (24, 20)], fabric, 'ink')
            rect(d, (24, 9+frame%2, 27, 12+frame%2), skin, 'ink')
            line(d, (26, 9+frame%2, 26, 11+frame%2), p['skinlight'])
            if frame == 2: line(d, (14, 14, 17, 14), p['skindark'])
        elif key == 'neighbors-abel':
            scene.book(d, 19, 18, open=True)
            rect(d, (22, 23, 24, 24), skin, 'ink')
            line(d, (25, 19+frame%2, 27, 19+frame%2), 'grey')
        elif key == 'neighbors-yara':
            rect(d, (19, 18, 27, 24), '#567f94', 'ink')
            rect(d, (21, 20, 25, 23), '#7097a3', '#32495d')
            rect(d, (21+frame%2, 16, 23+frame%2, 18), skin, 'ink')
            line(d, (24+frame%2, 16, 25+frame%2, 19), 'greylight')
        elif key == 'neighbors-nilo':
            line(d, (23, 17, 27, 13+frame%2), 'grey', 2)
            line(d, (26, 12+frame%2, 28, 15+frame%2), 'greylight', 2)
            rect(d, (21, 18, 24, 20), skin, 'ink')
            line(d, (20, 21, 25, 23), '#9ab6b8')
        else:
            rect(d, (20, 19, 27, 25), '#578778', 'ink')
            rect(d, (22, 16, 26, 20), None, 'darkgrey')
            poly(d, [(27, 20), (30, 17+frame%2), (31, 19+frame%2), (28, 23)], '#578778', 'ink')
            rect(d, (21, 18, 23, 19), skin, 'ink')
            if frame%2: rect(d, (30, 22, 30, 23), 'cyanlight')
    if direction == 2: im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return im

def person_portrait(key, p, expression):
    im = base.portrait({**p, 'age': 'adult'}, expression).resize((48, 48), Image.Resampling.NEAREST)
    d = ImageDraw.Draw(im)
    if p['outfit'] == 'blouse':
        for x, y in ((12, 40), (16, 45), (34, 40), (37, 46), (29, 43)):
            poly(d, [(x, y-1), (x+2, y), (x, y+2), (x-2, y)], '#edc186')
            line(d, (x+2, y+1, x+3, y+3), '#934b3c')
        for x in (12, 35):
            ell(d, (x, 25, x+1, 29), 'amberlight', 'amberdark')
        for x in (17, 21, 25, 29): line(d, (x, 4, x+1, 8), p['hairlight'])
        line(d, (19, 2, 27, 3), p['hairlight'])
    elif p['outfit'] == 'apron':
        for x in (15, 20, 25, 30, 34):
            end = 20 if x in (15, 34) else 13
            line(d, (x, 7, x-1, end), p['hair'], 3)
            for y in range(9, end, 4): line(d, (x, y, x-1, y+1), p['hairlight'])
        poly(d, [(16, 40), (31, 40), (33, 47), (14, 47)], '#567f94', 'ink')
        line(d, (16, 36, 19, 42), '#9fb9bd', 2)
        line(d, (32, 36, 29, 42), '#9fb9bd', 2)
        rect(d, (20, 43, 28, 47), '#7097a3', '#32495d')
    elif p['outfit'] == 'overalls':
        poly(d, [(12, 17), (11, 8), (16, 3), (29, 3), (36, 8), (36, 17), (32, 15), (17, 14)], '#c49d47', 'ink')
        line(d, (14, 8, 27, 11, 34, 9), '#efd486', 2)
        line(d, (14, 12, 25, 15, 33, 14), '#987437')
        rect(d, (13, 17, 15, 21), p['hairlight'])
        rect(d, (33, 17, 35, 21), p['hairlight'])
        poly(d, [(15, 41), (33, 41), (35, 47), (13, 47)], '#638667', 'ink')
        for x in (17, 30):
            rect(d, (x, 35, x+2, 43), '#638667', 'ink')
            rect(d, (x+1, 39, x+1, 39), 'amberlight')
        rect(d, (21, 43, 28, 47), '#90b38a', '#466c55')
    if p['age'] > 55:
        for b in ((15, 26, 17, 26), (30, 26, 32, 26), (17, 29, 18, 30)):
            line(d, b, p['skindark'])
    return im.resize((96, 96), Image.Resampling.NEAREST)

def dog(row, frame):
    im = empty()
    d = ImageDraw.Draw(im)
    bob = frame%2
    stride = (0, 1, 0, -1)[frame]
    shadow(d, (3, 27, 29, 30))
    if row == 0:
        coat, hi, dark = '#d7b486', '#f1d5a0', '#9b7651'
        for x in (9, 19):
            rect(d, (x+stride if x == 9 else x-stride, 21, x+2+stride if x == 9 else x+2-stride, 27), coat, 'ink')
            ell(d, (x-1+stride if x == 9 else x-1-stride, 25, x+3+stride if x == 9 else x+3-stride, 29), coat, 'ink')
        ell(d, (7, 13+bob, 24, 24+bob), dark, 'ink')
        for x, y in ((9, 15), (13, 13), (18, 14), (22, 17), (13, 20), (19, 21)):
            ell(d, (x-2, y-2+bob, x+2, y+2+bob), coat, 'ink')
            rect(d, (x, y-1+bob, x+1, y-1+bob), hi)
        line(d, (24, 17+bob, 27, 10+bob-frame%2), dark, 2)
        ell(d, (24, 7+bob-frame%2, 29, 12+bob-frame%2), coat, 'ink')
        ell(d, (3, 6+bob, 13, 16+bob), coat, 'ink')
        ell(d, (7, 10+bob, 12, 20+bob), dark, 'ink')
        ell(d, (7, 11+bob, 11, 17+bob), coat)
        poly(d, [(5, 12+bob), (1, 13+bob), (1, 16+bob), (7, 16+bob)], coat, 'ink')
        rect(d, (1, 13+bob, 2, 14+bob), 'ink')
        rect(d, (5, 10+bob, 5, 11+bob), 'ink')
        rect(d, (5, 7+bob, 7, 7+bob), hi)
    elif row == 1:
        coat, hi, dark = '#915334', '#c98347', '#653c2b'
        for x in (7, 23):
            xx = x+stride if x == 7 else x-stride
            rect(d, (xx, 23, xx+2, 28), coat, 'ink')
            line(d, (xx, 28, xx+3, 28), dark)
        ell(d, (4, 16+bob, 27, 26+bob), coat, 'ink')
        line(d, (12, 18+bob, 23, 18+bob), hi)
        line(d, (27, 20+bob, 30, 15+bob+frame%2), coat, 2)
        ell(d, (3, 9+bob, 12, 20+bob), coat, 'ink')
        ell(d, (8, 11+bob, 13, 23+bob), dark, 'ink')
        poly(d, [(5, 15+bob), (1, 15+bob), (1, 18+bob), (7, 19+bob)], coat, 'ink')
        rect(d, (1, 15+bob, 2, 16+bob), 'ink')
        rect(d, (5, 13+bob, 5, 14+bob), 'ink')
        line(d, (4, 11+bob, 6, 11+bob), hi)
    elif row == 2:
        white, brown, black = '#e5dfc8', '#a2683f', '#353039'
        for x in (9, 21):
            xx = x+stride if x == 9 else x-stride
            rect(d, (xx, 21, xx+2, 28), white, 'ink')
        ell(d, (6, 13+bob, 27, 25+bob), white, 'ink')
        poly(d, [(13, 14+bob), (23, 14+bob), (26, 18+bob), (21, 22+bob), (12, 21+bob)], black)
        rect(d, (8, 14+bob, 12, 22+bob), brown)
        line(d, (26, 18+bob, 29, 10+bob-frame%2), brown, 2)
        line(d, (29, 9+bob-frame%2, 29, 12+bob-frame%2), white, 2)
        ell(d, (2, 5+bob, 13, 17+bob), brown, 'ink')
        ell(d, (8, 8+bob, 13, 20+bob), brown, 'ink')
        poly(d, [(5, 10+bob), (5, 15+bob), (1, 15+bob), (0, 12+bob), (2, 11+bob)], white, 'ink')
        rect(d, (1, 11+bob, 2, 12+bob), 'ink')
        rect(d, (5, 8+bob, 5, 9+bob), 'ink')
        line(d, (5, 6+bob, 7, 7+bob), '#c28a54')
    elif row == 3:
        coat, white, dark = '#758592', '#e3e5d9', '#3c4757'
        for x in (8, 22):
            xx = x+stride if x == 8 else x-stride
            rect(d, (xx, 20, xx+2, 28), white, 'ink')
        poly(d, [(7, 12+bob), (21, 11+bob), (27, 17+bob), (25, 23+bob), (8, 24+bob), (5, 18+bob)], coat, 'ink')
        poly(d, [(7, 20+bob), (19, 20+bob), (24, 17+bob), (25, 23+bob), (8, 24+bob)], white)
        poly(d, [(24, 15+bob), (29, 13+bob), (28, 7+bob-frame%2), (25, 7+bob-frame%2), (26, 11+bob)], coat, 'ink')
        line(d, (27, 8+bob-frame%2, 27, 11+bob), white)
        ell(d, (2, 5+bob, 13, 16+bob), white, 'ink')
        poly(d, [(3, 7+bob), (3, 1+bob), (7, 5+bob)], dark, 'ink')
        poly(d, [(8, 6+bob), (11, 0+bob), (13, 9+bob)], dark, 'ink')
        poly(d, [(3, 6+bob), (5, 6+bob), (8, 11+bob), (11, 6+bob), (13, 9+bob), (10, 12+bob), (6, 10+bob), (3, 11+bob)], coat)
        poly(d, [(4, 11+bob), (0, 12+bob), (1, 15+bob), (6, 15+bob)], white, 'ink')
        rect(d, (0, 12+bob, 1, 13+bob), 'ink')
        rect(d, (4, 9+bob, 4, 10+bob), '#624a33')
        line(d, (8, 17+bob, 10, 20+bob), white)
    elif row == 4:
        coat, dark, hi = '#a66d43', '#353038', '#ce9561'
        for x in (9, 23):
            xx = x+stride if x == 9 else x-stride
            rect(d, (xx, 20, xx+3, 29), coat, 'ink')
            rect(d, (xx, 27, xx+3, 29), 'paper')
        poly(d, [(8, 10+bob), (21, 13+bob), (28, 18+bob), (26, 24+bob), (8, 24+bob), (5, 18+bob)], coat, 'ink')
        line(d, (15, 14+bob, 23, 16+bob), hi)
        poly(d, [(8, 16+bob), (12, 18+bob), (11, 24+bob), (7, 23+bob)], 'paper')
        line(d, (27, 19+bob, 30, 12+bob+frame%2), coat, 2)
        ell(d, (2, 4+bob, 14, 16+bob), coat, 'ink')
        poly(d, [(11, 5+bob), (15, 6+bob), (14, 14+bob), (11, 11+bob)], dark, 'ink')
        rect(d, (1, 10+bob, 8, 17+bob), dark, 'ink')
        rect(d, (1, 10+bob, 3, 12+bob), 'ink')
        rect(d, (5, 8+bob, 5, 9+bob), 'ink')
        rect(d, (5, 5+bob, 8, 6+bob), hi)
        line(d, (3, 14+bob, 6, 14+bob), 'grey')
    else:
        white, gold, dark = '#e7e2ce', '#be9966', '#947649'
        for x in (10, 22):
            xx = x+stride if x == 10 else x-stride
            rect(d, (xx, 22, xx+2, 28), white, 'ink')
        poly(d, [(7, 15+bob), (22, 13+bob), (28, 18+bob), (26, 28), (22, 26), (19, 28), (15, 26), (11, 28), (6, 25)], white, 'ink')
        poly(d, [(11, 15+bob), (18, 14+bob), (22, 20+bob), (17, 23+bob), (12, 20+bob)], gold)
        for x in (8, 13, 18, 24): line(d, (x, 20+bob, x, 25), '#c4c5b8')
        poly(d, [(24, 17+bob), (25, 9+bob), (30, 6+bob+frame%2), (29, 14+bob), (27, 19+bob)], white, 'ink')
        line(d, (27, 10+bob+frame%2, 26, 15+bob), gold)
        ell(d, (2, 6+bob, 15, 19+bob), gold, 'ink')
        poly(d, [(3, 10+bob), (1, 20+bob), (4, 22+bob), (7, 19+bob), (9, 22+bob), (14, 20+bob), (14, 12+bob)], white, 'ink')
        poly(d, [(10, 8+bob), (15, 11+bob), (15, 21+bob), (11, 20+bob)], dark, 'ink')
        ell(d, (2, 12+bob, 9, 18+bob), white)
        rect(d, (2, 13+bob, 4, 14+bob), 'ink')
        rect(d, (5, 10+bob, 5, 11+bob), 'ink')
        line(d, (6, 7+bob, 10, 7+bob), '#dfc596')
        line(d, (2, 18+bob, 5, 19+bob), '#c4c5b8')
    if frame == 2:
        eye_x, eye_y = ((5, 10), (5, 13), (5, 8), (4, 9), (5, 8), (5, 10))[row]
        line(d, (eye_x, eye_y, eye_x+1, eye_y), 'ink')
    if frame == 3: rect(d, (3, 17+bob, 4, 18+bob), '#ce8e88')
    return im

def resident(key, p):
    lines = [{'speaker': key, 'en': en, 'pt': pt} for en, pt in p['lines']]
    return {'id': key, 'name': p['name'], 'character': key, 'role': p['role'], 'age': p['age'], 'map': p['map'], 'chapter': p['chapter'], 'identity': 'Pessoa negra brasileira original e fictícia. '+p['appearance'], 'personality': p['personality'], 'relationships': p['relationships'], 'preferredActivities': p['preferredActivities'], 'lines': lines, 'repeat': lines[0]}

def main():
    out = ROOT / 'assets'
    props = [prop(i) for i in range(32)]
    assert len(set(x.tobytes() for x in props)) == 32
    atlas = empty(256, 128)
    records = []
    for i, ((identifier, name, category), image) in enumerate(zip(PROPS, props)):
        assert image.getchannel('A').getextrema() == (0, 255)
        atlas.alpha_composite(image, (i%8*32, i//8*32))
        records.append(prop_metadata(i, identifier, name, category))
    atlas.save(out / 'tilesets' / 'neighbors-props.png', optimize=True)
    manifest = {'version': '1.9', 'license': 'CC0-1.0', 'licenseURL': 'https://creativecommons.org/publicdomain/zero/1.0/', 'attributionRequired': False, 'creator': 'Original VOICES pixel art', 'generator': 'tools/create_neighbors_assets.py', 'atlas': 'assets/tilesets/neighbors-props.png', 'tileSize': 32, 'columns': 8, 'rows': 4, 'coordinateUnits': 'tile-fraction', 'sourceRectUnits': 'pixel', 'colorRoleConvention': 'Only these exact RGB triples may be recolored: shadow, body, highlight. Skin, outlines, contents and alpha remain unchanged.', 'palette': P, 'props': records}
    (out / 'tilesets' / 'neighbors-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    animal_atlas = empty(128, 192)
    animals = []
    for row, (identifier, name, description, url) in enumerate(BREEDS):
        frames = []
        for frame in range(4):
            image = dog(row, frame)
            assert image.getchannel('A').getextrema() == (0, 255)
            frames.append(image)
            animal_atlas.alpha_composite(image, (frame*32, row*32))
        assert len(set(x.tobytes() for x in frames)) == 4
        animals.append({'id': identifier, 'name': name, 'species': 'dog', 'breed': name, 'row': row, 'frames': 4, 'frameWidth': 32, 'frameHeight': 32, 'description': description, 'reference': {'institution': 'American Kennel Club', 'url': url}, 'illustrationStatus': 'Animal ficcional de desenho original. A raça orienta a silhueta; aparência em pixel art não comprova genealogia nem define temperamento.'})
    animal_atlas.save(out / 'characters' / 'neighbors-animals.png', optimize=True)
    animal_manifest = {'version': '1.9', 'license': 'CC0-1.0', 'creator': 'Original VOICES pixel art', 'generator': 'tools/create_neighbors_assets.py', 'atlas': 'assets/characters/neighbors-animals.png', 'width': 128, 'height': 192, 'cellWidth': 32, 'cellHeight': 32, 'columns': 4, 'rows': 6, 'artStatus': 'Original pixels, no copied photographs. Each row is one visually distinct dog breed, with four walking or resting frames and transparent background. Natural ears and tails are retained. No breed is assigned a universal temperament.', 'animals': animals}
    (out / 'characters' / 'neighbors-animals-manifest.json').write_text(json.dumps(animal_manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    characters = {}
    sprite_images, portrait_images = {}, {}
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
    sources = [{'id': 'neighbors_breed_'+identifier, 'name': 'American Kennel Club — '+name, 'url': url, 'note': 'Referência para nome e características visuais da raça; pixels originais. Nenhuma fotografia ou descrição de temperamento foi reproduzida.'} for identifier, name, description, url in BREEDS]
    content = {'version': '1.9', 'license': 'CC0-1.0', 'creator': 'Original VOICES residents and pixel art', 'residents': [resident(k, p) for k, p in PEOPLE.items()], 'characters': characters, 'sources': sources, 'animals': animals, 'assetManifest': manifest, 'animalManifest': animal_manifest}
    encoded = base64.b64encode((out / 'tilesets' / 'neighbors-props.png').read_bytes()).decode('ascii')
    registry = "(function(){'use strict';const V=window.V=window.V||{};V.neighborsAssets="+json.dumps(records, ensure_ascii=False, separators=(',', ':'))+";V.sceneAssets=V.sceneAssets||[];V.sceneAssets.push(...V.neighborsAssets);V.neighborsMaterialSources={neighbors:'data:image/png;base64,"+encoded+"'};V.neighborsContent="+json.dumps(content, ensure_ascii=False, separators=(',', ':'))+";})();\n"
    (ROOT / 'js' / 'neighbors-content.js').write_text(registry, encoding='utf-8')
    preview(props, animal_atlas, sprite_images, portrait_images)
    print(json.dumps({'props': 32, 'uniqueProps': len(set(x.tobytes() for x in props)), 'animals': 6, 'residents': 4, 'dialoguePairs': 12, 'preview': 'tests/neighbors-preview.png'}, ensure_ascii=False))

def preview(props, animals, sprites, portraits):
    im = Image.new('RGBA', (1280, 1430), '#e7dfcc')
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
    for i, (identifier, name, description, url) in enumerate(BREEDS):
        x, y = i%6*212+8, 648
        rect(d, (x, y, x+204, y+188), '#d6ccb5')
        for frame in range(4):
            image = animals.crop((frame*32, i*32, frame*32+32, i*32+32)).resize((92, 92), Image.Resampling.NEAREST)
            im.alpha_composite(image, (x+5+frame%2*100, y+6+frame//2*88))
        d.text((x+6, y+173), name, fill=P['navy'], font=font)
    for i, (key, p) in enumerate(PEOPLE.items()):
        x, y = i*320+7, 854
        rect(d, (x, y, x+304, y+566), '#d6ccb5')
        d.text((x+8, y+9), p['name']+' · '+str(p['age'])+' anos · '+p['map'], fill=P['navy'], font=font)
        im.alpha_composite(portraits[key], (x+8, y+31))
        for row in range(6):
            for frame in range(4):
                cell = sprites[key].crop((frame*32, row*32, frame*32+32, row*32+32)).resize((64, 64), Image.Resampling.NEAREST)
                im.alpha_composite(cell, (x+12+frame*72, y+141+row*69))
    im.save(ROOT / 'tests' / 'neighbors-preview.png', optimize=True)

if __name__ == '__main__':
    main()
