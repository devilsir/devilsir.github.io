from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("voices_neighborhood_palette", ROOT / "tools" / "create_scene_assets.py")
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
rect, ell, poly, line, empty = scene.rect, scene.ell, scene.poly, scene.line, scene.empty

PROPS = [
    ("wingback-chair", "Poltrona com encosto alto", "casa"),
    ("corner-sofa", "Sofá de canto", "casa"),
    ("round-dining-table", "Mesa redonda de jantar", "cozinha"),
    ("large-dining-table", "Mesa comprida de jantar", "cozinha"),
    ("writing-desk", "Escrivaninha com gavetas", "biblioteca"),
    ("dressing-table", "Penteadeira com espelho", "casa"),
    ("glass-cabinet", "Cristaleira", "casa"),
    ("sliding-wardrobe", "Armário com portas de correr", "casa"),
    ("kitchen-cabinet", "Armário da cozinha", "cozinha"),
    ("sideboard", "Aparador", "casa"),
    ("television-stand", "Rack com televisão", "casa"),
    ("magazine-rack", "Porta-revistas", "biblioteca"),
    ("wall-coat-rack", "Cabideiro de parede", "casa"),
    ("slatted-bench", "Banco de madeira com ripas", "convívio"),
    ("curved-bench", "Banco curvo de jardim", "convívio"),
    ("stone-bench", "Banco de pedra", "convívio"),
    ("backless-bench", "Banco de jardim sem encosto", "convívio"),
    ("double-park-bench", "Banco duplo de praça", "convívio"),
    ("floor-cushions", "Almofadas de leitura", "biblioteca"),
    ("stacked-chairs", "Cadeiras empilhadas", "comunidade"),
    ("folding-chair", "Cadeira dobrável", "comunidade"),
    ("bar-stool", "Banqueta alta", "casa"),
    ("storage-ottoman", "Pufe com baú", "casa"),
    ("baby-crib", "Berço de madeira", "casa"),
    ("mango-tree", "Mangueira", "árvores"),
    ("yellow-ipe", "Ipê-amarelo", "árvores"),
    ("flamboyant-tree", "Flamboyant", "árvores"),
    ("garden-palm", "Palmeira de jardim", "árvores"),
    ("bamboo-clump", "Touceira de bambu", "árvores"),
    ("plumeria-tree", "Jasmim-manga", "árvores"),
    ("trimmed-hedge", "Cerca viva aparada", "plantas e flores"),
    ("fern-planter", "Samambaia em vaso", "plantas e flores"),
    ("succulent-pots", "Vasos de suculentas", "plantas e flores"),
    ("window-flower-box", "Floreira de janela", "plantas e flores"),
    ("sunflower-bed", "Canteiro de girassóis", "plantas e flores"),
    ("hibiscus-planter", "Vaso de hibisco", "plantas e flores"),
    ("bougainvillea-trellis", "Treliça com primavera", "plantas e flores"),
    ("wildflower-border", "Canteiro de flores do bairro", "plantas e flores"),
    ("water-lily", "Ninféias sobre a água", "plantas e flores"),
    ("herb-planter", "Jardineira de ervas", "horta"),
    ("full-figured-standing-woman", "Escultura: mulher de corpo amplo", "esculturas"),
    ("full-figured-seated-woman", "Escultura: mulher sentada", "esculturas"),
    ("hands-sculpture", "Escultura: mãos que se encontram", "esculturas"),
    ("spiral-metal-sculpture", "Escultura: espiral de metal", "esculturas"),
    ("round-wood-mask", "Máscara circular original", "esculturas"),
    ("long-wood-mask", "Máscara alongada original", "esculturas"),
    ("abstract-metal-mask", "Máscara geométrica de metal", "esculturas"),
    ("mask-triptych", "Painel de três máscaras originais", "esculturas"),
    ("portrait-nina", "Quadro: Nina Simone", "quadros"),
    ("portrait-tim", "Quadro: Tim Maia", "quadros"),
    ("portrait-machado", "Quadro: Machado de Assis", "quadros"),
    ("portrait-carolina", "Quadro: Carolina Maria de Jesus", "quadros"),
    ("portrait-katherine", "Quadro: Katherine Johnson", "quadros"),
    ("portrait-conceicao", "Quadro: Conceição Evaristo", "quadros"),
    ("portrait-sonia", "Quadro: Sônia Guimarães", "quadros"),
    ("portrait-jaqueline", "Quadro: Jaqueline Góes de Jesus", "quadros"),
    ("portrait-pixinguinha", "Quadro: Pixinguinha", "quadros"),
    ("portrait-ivone", "Quadro: Dona Ivone Lara", "quadros"),
    ("portrait-rosana", "Quadro: Rosana Paulino", "quadros"),
    ("portrait-maria-auxiliadora", "Quadro: Maria Auxiliadora da Silva", "quadros"),
    ("painting-landscape", "Quadro: paisagem do parque", "quadros"),
    ("painting-neighborhood", "Quadro: nosso bairro", "quadros"),
    ("painting-geometric", "Quadro: caminhos e cores", "quadros"),
    ("small-gallery-wall", "Painel de pequenas pinturas", "quadros"),
]

PORTRAIT_REFERENCES = [
    {"indices": [48], "institution": "Nina Simone official archive", "url": "https://www.ninasimone.com/biography/"},
    {"indices": [49], "institution": "Instituto Cultural Cravo Albin", "url": "https://dicionariompb.com.br/artista/tim-maia/"},
    {"indices": [50], "institution": "Academia Brasileira de Letras", "url": "https://www.academia.org.br/academicos/machado-de-assis/biografia"},
    {"indices": [51], "institution": "Instituto Moreira Salles", "url": "https://ims.com.br/titular-colecao/carolina-maria-de-jesus/"},
    {"indices": [52], "institution": "NASA", "url": "https://www.nasa.gov/image-article/katherine-johnson-portrait/"},
    {"indices": [53], "institution": "UFMG / Literafro", "url": "https://www.letras.ufmg.br/literafro/autoras/188-conceicao-evaristo"},
    {"indices": [54], "institution": "CNEN", "url": "https://www.gov.br/cnen/pt-br/assunto/ultimas-noticias/cnen-sedia-encontro-ancestralidade-e-ciencia"},
    {"indices": [55], "institution": "Museu Catavento", "url": "https://museucatavento.org.br/mulheres-na-ciencia/jaqueline-goes/FOLDER.pdf"},
    {"indices": [56], "institution": "Instituto Moreira Salles", "url": "https://ims.com.br/titular-colecao/pixinguinha/"},
    {"indices": [57], "institution": "Instituto Moreira Salles", "url": "https://acervos.ims.com.br/index.php/Detail/objects/60260"},
    {"indices": [58], "institution": "Pinacoteca", "url": "https://pinacoteca.org.br/programacao/exposicoes/rosana-paulino-a-costura-da-memoria/"},
    {"indices": [59], "institution": "MASP", "url": "https://masp.org.br/exposicoes/maria-auxiliadora-vida-cotidiana-pintura-e-resistencia"},
]

NEW_PEOPLE = {
    "conceicao": {"skin": "#875039", "light": "#b47754", "shade": "#603c30", "hair": "#bab9b2", "hairlight": "#eeeada", "style": "gray-curls", "shirt": "violet", "accessory": "glasses"},
    "sonia": {"skin": "#8c5b41", "light": "#bd855e", "shade": "#603d2f", "hair": "#787578", "hairlight": "#b9b4b2", "style": "gray-short", "shirt": "coral", "accessory": "glasses"},
    "jaqueline": {"skin": "#815039", "light": "#b67a50", "shade": "#523629", "hair": "#302531", "hairlight": "#63414a", "style": "natural", "shirt": "paper", "accessory": "earrings"},
    "pixinguinha": {"skin": "#8e5b40", "light": "#bc855f", "shade": "#614033", "hair": "#373138", "hairlight": "#68616b", "style": "short", "shirt": "navy", "accessory": "tie"},
    "ivone": {"skin": "#986548", "light": "#c59168", "shade": "#654537", "hair": "#343039", "hairlight": "#676070", "style": "side-curls", "shirt": "coral", "accessory": "beads"},
    "rosana": {"skin": "#91593d", "light": "#c18457", "shade": "#613d30", "hair": "#302831", "hairlight": "#69504e", "style": "twists", "shirt": "cyandark", "accessory": "glasses"},
    "maria-auxiliadora": {"skin": "#8c5a3e", "light": "#ba8055", "shade": "#5b3c2e", "hair": "#30282f", "hairlight": "#685048", "style": "short-waves", "shirt": "green", "accessory": "collar"},
}

def legs(d, x1=7, x2=24, y=22, tint="brown"):
    rect(d, (x1, y, x1+2, 29), tint, "ink")
    rect(d, (x2-2, y, x2, 29), tint, "ink")

def box(d, top=10, tint="brown"):
    rect(d, (5, top, 26, 27), tint, "ink")
    rect(d, (4, top, 27, top+2), "brownlight", "ink")
    rect(d, (7, 27, 9, 29), "brown", "ink")
    rect(d, (22, 27, 24, 29), "brown", "ink")

def plinth(d, tint="grey"):
    scene.shadow(d, (4, 27, 28, 30))
    rect(d, (7, 25, 25, 28), tint, "ink")
    rect(d, (6, 23, 26, 25), "greylight", "ink")
    line(d, (10, 27, 20, 27), "paper")

def blossom(d, x, y, tint="coral", center="amber"):
    for xx, yy in ((x-2, y), (x+2, y), (x, y-2), (x, y+2)):
        ell(d, (xx-1, yy-1, xx+1, yy+1), tint)
    rect(d, (x, y, x, y), center)

def pot(d, x, y, width=10, tint="coral"):
    poly(d, [(x, y), (x+width, y), (x+width-2, y+8), (x+2, y+8)], tint, "ink")
    rect(d, (x-1, y, x+width+1, y+2), "coraldark", "ink")
    line(d, (x+2, y+4, x+3, y+6), "corallight")

def trunk(d, fork=True):
    rect(d, (14, 11, 18, 28), "brown", "ink")
    line(d, (15, 13, 15, 26), "brownlight")
    if fork:
        line(d, (16, 16, 10, 11), "ink", 3)
        line(d, (16, 16, 23, 10), "ink", 3)
        line(d, (16, 16, 10, 11), "brownlight")
        line(d, (16, 16, 23, 10), "brown")
    poly(d, [(14, 25), (12, 29), (21, 29), (18, 25)], "brown", "ink")

def canopy(d, tint="green", shade="greendark", light="greenlight", shape="round"):
    if shape == "flat":
        ell(d, (1, 4, 31, 17), shade, "ink")
        ell(d, (3, 3, 16, 13), tint)
        ell(d, (10, 1, 26, 14), tint)
        ell(d, (21, 5, 29, 14), tint)
    else:
        ell(d, (5, 4, 28, 20), shade, "ink")
        ell(d, (8, 1, 22, 16), tint, "ink")
        ell(d, (3, 9, 16, 20), tint, "ink")
        ell(d, (17, 6, 29, 19), tint, "ink")
    for x, y in ((9, 8), (15, 4), (22, 10), (9, 15), (20, 15)):
        line(d, (x, y, x+2, y), light)

def portrait_head(name):
    im = empty(20, 23)
    d = ImageDraw.Draw(im)
    p = NEW_PEOPLE[name]
    poly(d, [(2, 22), (3, 18), (7, 16), (13, 16), (17, 18), (19, 22)], p["shirt"], "ink")
    rect(d, (8, 14, 11, 18), p["skin"], "ink")
    ell(d, (4, 5, 15, 17), p["skin"], "ink")
    rect(d, (5, 9, 6, 12), p["light"])
    line(d, (11, 16, 13, 14), p["shade"])
    h, hi = p["hair"], p["hairlight"]
    if p["style"] == "natural":
        for x, y, r in ((4, 5, 3), (7, 3, 3), (11, 2, 3), (15, 5, 3), (3, 9, 2), (16, 9, 2)):
            ell(d, (x-r, y-r, x+r, y+r), h, "ink")
            rect(d, (x-1, y-r+1, x, y-r+1), hi)
        rect(d, (5, 8, 13, 9), p["skin"])
    elif p["style"] in ("gray-curls", "side-curls"):
        for x, y in ((4, 7), (5, 4), (8, 2), (11, 2), (14, 4), (16, 7)):
            ell(d, (x-2, y-2, x+2, y+2), h, "ink")
            rect(d, (x, y-1, x+1, y-1), hi)
        if p["style"] == "side-curls":
            ell(d, (1, 9, 4, 14), h, "ink")
            ell(d, (15, 9, 18, 14), h, "ink")
    elif p["style"] == "twists":
        ell(d, (3, 1, 16, 8), h, "ink")
        for x in (3, 6, 9, 12, 15):
            bottom = 17 if x in (3, 15) else 6
            line(d, (x, 5, x, bottom), h, 2)
            for y in range(6, bottom, 3):
                rect(d, (x, y, x, y), hi)
    else:
        ell(d, (4, 2, 15, 8), h, "ink")
        for x, y in ((5, 5), (8, 3), (11, 3), (14, 5)):
            line(d, (x, y, x+1, y), hi)
        if p["style"] == "short-waves":
            line(d, (3, 6, 5, 4, 9, 3, 13, 4, 16, 6), h, 2)
    line(d, (6, 10, 7, 10), "ink")
    line(d, (12, 10, 13, 10), "ink")
    rect(d, (9, 12, 9, 13), p["shade"])
    line(d, (8, 15, 11, 15), p["shade"])
    if p["accessory"] == "glasses":
        rect(d, (5, 9, 8, 12), None, "darkgrey")
        rect(d, (11, 9, 14, 12), None, "darkgrey")
        line(d, (8, 10, 11, 10), "darkgrey")
    elif p["accessory"] in ("earrings", "beads"):
        rect(d, (3, 12, 3, 13), "amberlight")
        rect(d, (16, 12, 16, 13), "amberlight")
        if p["accessory"] == "beads":
            for x, y in ((5, 18), (7, 20), (9, 21), (11, 20), (13, 18)):
                rect(d, (x, y, x, y), "paper")
    elif p["accessory"] == "tie":
        poly(d, [(7, 18), (12, 18), (10, 22)], "paper")
        line(d, (9, 19, 9, 22), "coraldark")
        line(d, (7, 14, 11, 14), h)
    elif p["accessory"] == "collar":
        line(d, (5, 18, 9, 20, 14, 18), "paper")
    return im

def framed_portrait(im, name):
    d = ImageDraw.Draw(im)
    rect(d, (3, 1, 28, 29), "brown", "ink")
    rect(d, (5, 3, 26, 27), "amberlight", "ink")
    rect(d, (6, 4, 25, 25), "paper")
    if name in ("nina", "tim", "machado", "carolina", "katherine"):
        src = Image.open(ROOT / "assets" / "characters" / f"history-{name}-portrait.png").convert("RGBA")
        image = src.crop((0, 0, 96, 96)).resize((20, 23), Image.Resampling.NEAREST)
    else:
        image = portrait_head(name)
    im.alpha_composite(image, (6, 4))
    d = ImageDraw.Draw(im)
    rect(d, (6, 26, 25, 27), "amberlight")
    line(d, (10, 27, 21, 27), "brown")
    line(d, (4, 2, 27, 2), "brownlight")
    line(d, (4, 3, 4, 26), "brownlight")
    line(d, (8, 30, 24, 30), (17, 23, 41, 40))

def prop(index, id):
    im = empty()
    d = ImageDraw.Draw(im)
    if not 48 <= index <= 63:
        scene.shadow(d)
    if id == "wingback-chair":
        rect(d, (8, 3, 23, 24), "coraldark", "ink")
        rect(d, (10, 5, 21, 20), "coral", "ink")
        rect(d, (6, 5, 9, 15), "coraldark", "ink")
        rect(d, (22, 5, 25, 15), "coraldark", "ink")
        rect(d, (7, 18, 25, 25), "coral", "ink")
        line(d, (11, 6, 20, 6), "corallight")
        line(d, (10, 20, 22, 20), "corallight")
        rect(d, (5, 16, 9, 25), "coraldark", "ink")
        rect(d, (23, 16, 27, 25), "coraldark", "ink")
        legs(d, 8, 24, 25)
    elif id == "corner-sofa":
        poly(d, [(2, 5), (27, 5), (27, 16), (15, 16), (15, 27), (2, 27)], "coraldark", "ink")
        rect(d, (5, 7, 13, 16), "coral", "ink")
        rect(d, (14, 7, 24, 16), "coral", "ink")
        rect(d, (4, 16, 13, 24), "coral", "ink")
        rect(d, (14, 14, 25, 19), "coral", "ink")
        line(d, (6, 8, 11, 8), "corallight")
        line(d, (16, 8, 22, 8), "corallight")
        rect(d, (1, 13, 4, 26), "coraldark", "ink")
        rect(d, (25, 11, 29, 20), "coraldark", "ink")
        rect(d, (3, 27, 5, 29), "brown", "ink")
        rect(d, (24, 20, 26, 24), "brown", "ink")
    elif id == "round-dining-table":
        legs(d, 8, 24, 19)
        ell(d, (2, 9, 29, 23), "brown", "ink")
        ell(d, (2, 6, 29, 19), "brownlight", "ink")
        line(d, (8, 9, 21, 9), "amberlight")
        ell(d, (12, 8, 19, 13), "paper", "ink")
        scene.cup(d, 22, 11, "cyandark")
    elif id == "large-dining-table":
        legs(d, 4, 28, 19)
        rect(d, (1, 8, 30, 22), "brown", "ink")
        rect(d, (1, 6, 30, 18), "brownlight", "ink")
        line(d, (3, 7, 28, 7), "amberlight")
        line(d, (16, 7, 16, 17), "brown")
        ell(d, (7, 9, 13, 13), "paper", "ink")
        ell(d, (20, 10, 26, 14), "paper", "ink")
    elif id == "writing-desk":
        legs(d, 4, 28, 19)
        rect(d, (3, 10, 29, 17), "brownlight", "ink")
        rect(d, (20, 17, 28, 26), "brown", "ink")
        for y in (18, 22):
            rect(d, (21, y, 27, y+3), "brownlight", "ink")
            line(d, (23, y+2, 25, y+2), "amberlight")
        scene.book(d, 5, 6, "green", True)
        line(d, (15, 9, 19, 5), "grey")
    elif id == "dressing-table":
        legs(d, 5, 26, 22)
        rect(d, (3, 18, 28, 24), "brownlight", "ink")
        ell(d, (7, 1, 25, 19), "brown", "ink")
        ell(d, (10, 3, 22, 16), "greylight", "ink")
        line(d, (13, 6, 18, 6, 18, 11), "white")
        rect(d, (14, 23, 18, 23), "amberlight")
        rect(d, (4, 15, 7, 18), "violet", "ink")
        line(d, (5, 14, 6, 14), "amberlight")
    elif id == "glass-cabinet":
        box(d, 3)
        rect(d, (7, 6, 24, 22), "navylight", "ink")
        for x in (9, 18):
            rect(d, (x, 8, x+4, 12), "greylight", "ink")
            ell(d, (x, 16, x+4, 19), "paper", "ink")
        line(d, (8, 14, 23, 14), "brownlight")
        line(d, (16, 6, 16, 21), "brown")
        line(d, (8, 7, 10, 7, 10, 11), "cyanlight")
        line(d, (18, 7, 20, 7, 20, 11), "cyanlight")
        line(d, (11, 25, 21, 25), "amberlight")
    elif id == "sliding-wardrobe":
        box(d, 2)
        rect(d, (7, 5, 16, 25), "brownlight", "ink")
        rect(d, (17, 5, 24, 25), "brown", "ink")
        line(d, (14, 12, 14, 17), "amberlight")
        line(d, (19, 12, 19, 17), "amberlight")
        line(d, (8, 6, 15, 6), "amberlight")
        line(d, (19, 6, 22, 6), "brownlight")
    elif id == "kitchen-cabinet":
        box(d, 13)
        rect(d, (3, 10, 29, 14), "paper", "ink")
        rect(d, (7, 16, 15, 24), "brownlight", "ink")
        rect(d, (17, 16, 24, 24), "brownlight", "ink")
        rect(d, (13, 18, 13, 20), "amberlight")
        rect(d, (19, 18, 19, 20), "amberlight")
        scene.cup(d, 6, 4, "cyandark")
        scene.plant(d, 23, 3)
    elif id == "sideboard":
        box(d, 16)
        rect(d, (7, 20, 15, 25), "brownlight", "ink")
        rect(d, (17, 20, 24, 25), "brownlight", "ink")
        line(d, (11, 21, 12, 21), "amberlight")
        line(d, (20, 21, 21, 21), "amberlight")
        scene.plant(d, 10, 7)
        scene.book(d, 21, 10, "violet")
    elif id == "television-stand":
        box(d, 20)
        rect(d, (5, 3, 26, 17), "darkgrey", "ink")
        rect(d, (7, 5, 24, 14), "navy", "ink")
        line(d, (8, 6, 11, 6, 11, 9), "navylight")
        line(d, (15, 17, 15, 19, 20, 19), "grey", 2)
        rect(d, (8, 24, 16, 26), "darkgrey", "ink")
        rect(d, (21, 23, 24, 26), "paper", "ink")
    elif id == "magazine-rack":
        poly(d, [(4, 10), (28, 10), (25, 27), (7, 27)], "brown", "ink")
        for x, y, tint in ((7, 8, "violet"), (13, 6, "cyan"), (20, 9, "coral")):
            rect(d, (x, y, x+5, y+13), tint, "ink")
            line(d, (x+1, y+2, x+4, y+2), "paper")
        rect(d, (5, 19, 27, 24), "brownlight", "ink")
        line(d, (7, 20, 25, 20), "amberlight")
    elif id == "wall-coat-rack":
        rect(d, (2, 5, 29, 9), "brownlight", "ink")
        for x in (7, 15, 24):
            line(d, (x, 7, x, 12, x+2, 12), "grey", 2)
        poly(d, [(3, 15), (7, 12), (11, 15), (10, 26), (4, 26)], "coral", "ink")
        line(d, (7, 15, 7, 24), "coraldark")
        line(d, (16, 12, 14, 14, 16, 27, 20, 27, 18, 13), "violet", 2)
        rect(d, (21, 15, 28, 24), "green", "ink")
    elif id == "slatted-bench":
        legs(d, 5, 27, 22, "darkgrey")
        for y in (7, 11, 15):
            rect(d, (2, y, 29, y+2), "brown", "ink")
            line(d, (4, y+1, 27, y+1), "brownlight")
        rect(d, (2, 20, 29, 24), "brownlight", "ink")
        line(d, (4, 21, 27, 21), "amberlight")
        line(d, (4, 8, 4, 20), "darkgrey")
        line(d, (27, 8, 27, 20), "darkgrey")
    elif id == "curved-bench":
        legs(d, 5, 26, 23)
        poly(d, [(2, 15), (5, 8), (11, 5), (21, 5), (27, 8), (30, 15), (27, 18), (24, 13), (19, 10), (12, 10), (7, 13), (5, 18)], "brown", "ink")
        line(d, (4, 14, 7, 9, 12, 7, 20, 7, 25, 9, 28, 14), "brownlight")
        poly(d, [(3, 19), (8, 15), (23, 15), (29, 19), (27, 25), (4, 25)], "brownlight", "ink")
        line(d, (6, 20, 26, 20), "amberlight")
    elif id == "stone-bench":
        rect(d, (6, 19, 11, 28), "grey", "ink")
        rect(d, (22, 19, 27, 28), "grey", "ink")
        rect(d, (2, 13, 30, 21), "grey", "ink")
        rect(d, (2, 11, 30, 15), "greylight", "ink")
        line(d, (4, 12, 27, 12), "paper")
        line(d, (7, 23, 8, 25), "darkgrey")
        rect(d, (24, 23, 25, 23), "greylight")
    elif id == "backless-bench":
        legs(d, 4, 28, 22)
        rect(d, (1, 15, 30, 23), "brown", "ink")
        rect(d, (1, 12, 30, 19), "brownlight", "ink")
        line(d, (3, 14, 28, 14), "amberlight")
        line(d, (3, 17, 28, 17), "brown")
        line(d, (7, 26, 24, 26), "brown")
    elif id == "double-park-bench":
        legs(d, 5, 27, 21, "darkgrey")
        rect(d, (3, 7, 29, 17), "brown", "ink")
        line(d, (5, 9, 27, 9), "brownlight")
        line(d, (5, 13, 27, 13), "brownlight")
        rect(d, (3, 18, 29, 24), "brownlight", "ink")
        line(d, (5, 19, 27, 19), "amberlight")
        rect(d, (2, 15, 5, 24), "darkgrey", "ink")
        rect(d, (27, 15, 30, 24), "darkgrey", "ink")
        line(d, (16, 9, 16, 23), "darkgrey", 2)
    elif id == "floor-cushions":
        poly(d, [(3, 14), (12, 11), (20, 16), (18, 25), (7, 28), (1, 23)], "coraldark", "ink")
        poly(d, [(4, 14), (12, 12), (18, 17), (16, 23), (8, 26), (3, 22)], "coral", "ink")
        line(d, (5, 16, 11, 14), "corallight")
        poly(d, [(15, 11), (25, 8), (31, 15), (28, 23), (19, 24), (14, 20)], "violetdark", "ink")
        poly(d, [(17, 12), (25, 10), (29, 15), (26, 21), (20, 22), (16, 18)], "violet")
        line(d, (18, 13, 24, 12), "violetlight")
    elif id == "stacked-chairs":
        for x, y in ((4, 3), (8, 8), (12, 13)):
            rect(d, (x+1, y, x+13, y+7), "brown", "ink")
            line(d, (x+3, y+2, x+11, y+2), "brownlight")
            rect(d, (x, y+9, x+14, y+12), "brownlight", "ink")
            line(d, (x+1, y+12, x+1, y+17), "darkgrey", 2)
            line(d, (x+13, y+12, x+13, y+17), "darkgrey", 2)
    elif id == "folding-chair":
        rect(d, (9, 4, 23, 13), "coral", "ink")
        line(d, (11, 6, 20, 6), "corallight")
        line(d, (8, 5, 8, 18, 25, 29), "grey", 2)
        line(d, (24, 5, 24, 18, 7, 29), "darkgrey", 2)
        rect(d, (6, 17, 26, 21), "coral", "ink")
        line(d, (9, 18, 23, 18), "corallight")
    elif id == "bar-stool":
        line(d, (8, 12, 6, 29), "ink", 3)
        line(d, (24, 12, 26, 29), "ink", 3)
        line(d, (8, 12, 6, 28), "brownlight")
        line(d, (24, 12, 26, 28), "brownlight")
        line(d, (8, 23, 24, 23), "brown", 2)
        ell(d, (5, 6, 27, 15), "coraldark", "ink")
        ell(d, (6, 4, 26, 11), "coral", "ink")
        line(d, (11, 6, 21, 6), "corallight")
    elif id == "storage-ottoman":
        rect(d, (5, 15, 27, 27), "coraldark", "ink")
        ell(d, (4, 9, 28, 21), "coral", "ink")
        line(d, (10, 12, 21, 12), "corallight")
        line(d, (5, 20, 26, 20), "coraldark")
        rect(d, (15, 23, 18, 24), "amberlight", "ink")
        rect(d, (7, 27, 9, 29), "brown", "ink")
        rect(d, (24, 27, 26, 29), "brown", "ink")
    elif id == "baby-crib":
        legs(d, 3, 29, 22)
        rect(d, (3, 13, 29, 23), "paper", "ink")
        rect(d, (4, 12, 28, 19), "corallight", "ink")
        rect(d, (5, 13, 12, 16), "white", "ink")
        for x in (3, 8, 13, 18, 23, 28):
            line(d, (x, 8, x, 24), "brown", 2)
        rect(d, (2, 7, 29, 9), "brownlight", "ink")
        rect(d, (2, 23, 29, 25), "brownlight", "ink")
        line(d, (4, 8, 27, 8), "amberlight")
    elif id == "mango-tree":
        trunk(d)
        canopy(d)
        for x, y in ((8, 13), (20, 12), (17, 17), (25, 15)):
            ell(d, (x, y, x+2, y+3), "amberdark", "ink")
            rect(d, (x+1, y+1, x+1, y+1), "amber")
    elif id == "yellow-ipe":
        trunk(d)
        canopy(d, "amber", "amberdark", "amberlight")
        for x, y in ((8, 8), (13, 4), (21, 7), (12, 15), (24, 13), (18, 11)):
            blossom(d, x, y, "amber", "amberlight")
        rect(d, (8, 27, 9, 27), "amber")
        rect(d, (25, 28, 25, 28), "amberlight")
    elif id == "flamboyant-tree":
        trunk(d)
        canopy(d, "coral", "coraldark", "corallight", "flat")
        for x, y in ((8, 7), (14, 4), (23, 9), (17, 11), (6, 12)):
            blossom(d, x, y, "coral", "amberlight")
    elif id == "garden-palm":
        poly(d, [(14, 8), (17, 8), (19, 29), (13, 29)], "brown", "ink")
        for y in (14, 19, 24):
            line(d, (14, y, 17, y+1), "brownlight")
        for points in ([(16, 8), (6, 5), (1, 9), (6, 11)], [(16, 8), (7, 0), (1, 1), (12, 8)], [(16, 8), (21, 1), (28, 0), (23, 6)], [(16, 8), (27, 5), (31, 11), (25, 10)], [(16, 8), (22, 9), (25, 18), (20, 13)], [(16, 8), (11, 10), (6, 17), (8, 9)]):
            poly(d, points, "green", "greendark")
        line(d, (6, 7, 15, 8, 25, 8), "greenlight")
        ell(d, (13, 7, 16, 11), "amberdark", "ink")
        ell(d, (17, 7, 20, 11), "brown", "ink")
    elif id == "bamboo-clump":
        for x, y, lean in ((6, 4, 0), (13, 1, 1), (21, 5, -1), (26, 8, 0)):
            line(d, (x, y, x+lean, 29), "greendark", 3)
            line(d, (x, y+1, x+lean, 28), "greenlight")
            for yy in range(y+4, 29, 6):
                line(d, (x-1, yy, x+1, yy), "green")
            poly(d, [(x, y+5), (x-5, y+2), (x-6, y+1), (x-1, y+2)], "green", "greendark")
            poly(d, [(x, y+9), (x+5, y+5), (x+4, y+9)], "green", "greendark")
    elif id == "plumeria-tree":
        trunk(d)
        canopy(d, shape="flat")
        for x, y in ((7, 8), (13, 4), (21, 6), (25, 12), (14, 12)):
            blossom(d, x, y, "paper", "amber")
    elif id == "trimmed-hedge":
        rect(d, (2, 13, 29, 27), "greendark", "ink")
        rect(d, (3, 8, 28, 23), "green", "ink")
        ell(d, (2, 6, 11, 17), "green", "ink")
        ell(d, (11, 4, 21, 16), "green", "ink")
        ell(d, (21, 7, 30, 17), "green", "ink")
        for x, y in ((6, 10), (15, 8), (24, 12), (11, 18), (22, 21)):
            line(d, (x, y, x+2, y), "greenlight")
    elif id == "fern-planter":
        pot(d, 11, 21, 10)
        for points in ((16, 23, 16, 6), (16, 22, 6, 12, 4, 7), (16, 21, 26, 11, 27, 7), (15, 22, 5, 18, 2, 20), (17, 22, 28, 19, 30, 21)):
            line(d, points, "greendark", 2)
        for x, y in ((16, 9), (16, 14), (16, 18), (7, 12), (10, 16), (24, 12), (21, 16), (7, 19), (25, 19)):
            line(d, (x-3, y-2, x, y, x+3, y-2), "green", 2)
            rect(d, (x-2, y-1, x-2, y-1), "greenlight")
    elif id == "succulent-pots":
        for x, y, size in ((3, 20, 8), (14, 22, 7), (23, 15, 6)):
            pot(d, x, y, size)
            cx = x+size//2
            ell(d, (cx-4, y-7, cx+4, y+1), "greendark", "ink")
            poly(d, [(cx, y-8), (cx-3, y-4), (cx, y), (cx+3, y-4)], "green", "ink")
            line(d, (cx, y-6, cx, y-2), "greenlight")
    elif id == "window-flower-box":
        rect(d, (2, 20, 29, 28), "brown", "ink")
        rect(d, (1, 18, 30, 21), "brownlight", "ink")
        for x, y, tint in ((6, 11, "coral"), (13, 8, "violetlight"), (21, 12, "paper"), (26, 7, "pink")):
            line(d, (x, y+2, x, 19), "greendark", 2)
            poly(d, [(x, y+7), (x-3, y+4), (x-4, y+7)], "green", "greendark")
            blossom(d, x, y, tint)
        line(d, (5, 23, 25, 23), "brownlight")
    elif id == "sunflower-bed":
        ell(d, (1, 21, 31, 30), "brown", "ink")
        for x, y in ((6, 12), (16, 5), (26, 10)):
            line(d, (x, y+2, x, 26), "greendark", 2)
            poly(d, [(x, 21), (x-5, 17), (x-5, 21)], "green", "greendark")
            for xx, yy in ((x-3, y), (x+3, y), (x, y-3), (x, y+3)):
                ell(d, (xx-1, yy-1, xx+1, yy+1), "amber", "amberdark")
            ell(d, (x-2, y-2, x+2, y+2), "brown", "ink")
            rect(d, (x, y-1, x, y-1), "brownlight")
    elif id == "hibiscus-planter":
        pot(d, 11, 21, 10)
        line(d, (16, 24, 16, 5), "brown", 2)
        for x, y, points in ((10, 15, [(16, 17), (9, 11), (5, 15), (12, 19)]), (22, 10, [(16, 13), (20, 6), (27, 9), (23, 14)]), (9, 7, [(15, 8), (11, 3), (5, 5), (10, 10)])):
            poly(d, points, "green", "greendark")
            line(d, (x, y, x+2, y-1), "greenlight")
        blossom(d, 19, 6, "coral")
        blossom(d, 8, 14, "pink")
        line(d, (19, 6, 22, 4), "amberlight")
    elif id == "bougainvillea-trellis":
        for x in (6, 16, 26):
            line(d, (x, 2, x, 28), "brown", 2)
        for y in (6, 13, 20):
            line(d, (4, y, 28, y), "brownlight", 2)
        line(d, (10, 28, 9, 22, 15, 15, 11, 8, 20, 3), "greendark", 2)
        for x, y in ((9, 21), (14, 15), (10, 8), (19, 5), (22, 13), (23, 19)):
            ell(d, (x-3, y-2, x+3, y+2), "green", "greendark")
            blossom(d, x, y, "pink", "paper")
        rect(d, (4, 27, 28, 30), "brownlight", "ink")
    elif id == "wildflower-border":
        ell(d, (1, 20, 31, 30), "greendark", "ink")
        for x, y, tint in ((3, 17, "paper"), (8, 13, "coral"), (15, 18, "amber"), (21, 12, "violetlight"), (28, 17, "pink")):
            line(d, (x, y+1, x, 25), "greenlight")
            blossom(d, x, y, tint)
        for x in (5, 12, 23, 28):
            poly(d, [(x, 28), (x-2, 23), (x+2, 26)], "green")
    elif id == "water-lily":
        ell(d, (2, 16, 20, 25), "greendark", "ink")
        ell(d, (15, 10, 30, 19), "green", "ink")
        poly(d, [(11, 21), (17, 17), (20, 23)], (0, 0, 0, 0))
        poly(d, [(23, 15), (27, 11), (30, 15)], (0, 0, 0, 0))
        for points in ([(8, 17), (5, 10), (11, 13), (16, 10), (14, 18)], [(8, 18), (7, 13), (11, 8), (14, 13), (14, 19)]):
            poly(d, points, "paper", "pink")
        rect(d, (10, 15, 12, 16), "amber")
        line(d, (20, 13, 25, 13), "greenlight")
    elif id == "herb-planter":
        rect(d, (2, 19, 29, 28), "brown", "ink")
        rect(d, (1, 17, 30, 20), "brownlight", "ink")
        for x in (5, 14, 23):
            line(d, (x+2, 19, x+2, 5), "greendark")
            for y in (9, 14):
                ell(d, (x-2, y, x+2, y+3), "green", "greendark")
                ell(d, (x+2, y-2, x+6, y+1), "greenlight", "greendark")
        line(d, (9, 27, 9, 13), "brownlight")
        rect(d, (7, 12, 11, 15), "paper", "ink")
        rect(d, (8, 13, 10, 13), "grey")
    elif id == "full-figured-standing-woman":
        plinth(d)
        ell(d, (12, 2, 20, 9), "brownlight", "ink")
        poly(d, [(13, 8), (19, 8), (23, 11), (25, 17), (23, 23), (10, 23), (7, 17), (9, 11)], "brown", "ink")
        ell(d, (9, 12, 24, 23), "brownlight", "ink")
        poly(d, [(13, 9), (11, 12), (9, 18), (13, 19), (15, 15), (18, 15), (20, 19), (23, 18), (21, 11), (19, 9)], "brownlight", "ink")
        line(d, (14, 12, 14, 16), "amberlight")
        line(d, (18, 12, 19, 16), "brown")
        line(d, (16, 18, 16, 22), "brown")
        rect(d, (11, 21, 14, 23), "brown", "ink")
        rect(d, (19, 21, 22, 23), "brown", "ink")
        line(d, (15, 4, 18, 4), "amberlight")
    elif id == "full-figured-seated-woman":
        plinth(d)
        rect(d, (8, 13, 23, 22), "grey", "ink")
        ell(d, (13, 1, 21, 9), "greylight", "ink")
        ell(d, (9, 8, 25, 20), "grey", "ink")
        ell(d, (8, 14, 24, 24), "greylight", "ink")
        poly(d, [(10, 9), (7, 14), (8, 18), (15, 19), (17, 17), (12, 15), (13, 11)], "greylight", "ink")
        line(d, (22, 10, 25, 17, 18, 19), "darkgrey", 2)
        line(d, (21, 10, 24, 17, 18, 18), "greylight")
        line(d, (16, 18, 14, 22), "grey")
        line(d, (16, 3, 19, 3), "paper")
        rect(d, (10, 22, 14, 23), "grey", "ink")
        rect(d, (18, 22, 23, 23), "grey", "ink")
    elif id == "hands-sculpture":
        plinth(d)
        poly(d, [(8, 23), (6, 18), (4, 12), (6, 7), (8, 5), (10, 7), (11, 11), (14, 12), (16, 10), (18, 12), (16, 16), (12, 19), (12, 23)], "brownlight", "ink")
        poly(d, [(23, 23), (26, 17), (28, 10), (26, 5), (24, 3), (22, 5), (21, 10), (18, 11), (16, 14), (18, 18), (22, 19), (21, 23)], "brown", "ink")
        line(d, (7, 10, 9, 16, 13, 16), "amberlight")
        line(d, (25, 9, 23, 14, 19, 14), "brownlight")
    elif id == "spiral-metal-sculpture":
        plinth(d)
        line(d, (16, 24, 14, 20, 9, 17, 8, 12, 12, 8, 20, 8, 24, 12, 22, 17, 17, 19, 13, 15, 14, 11, 18, 10, 20, 13, 17, 14), "ink", 4)
        line(d, (16, 23, 14, 20, 9, 17, 8, 12, 12, 8, 20, 8, 24, 12, 22, 17, 17, 19, 13, 15, 14, 11, 18, 10, 20, 13, 17, 14), "grey", 2)
        line(d, (9, 12, 12, 9, 20, 9), "paper")
        line(d, (14, 16, 17, 18, 22, 16), "greylight")
    elif id == "round-wood-mask":
        plinth(d)
        line(d, (16, 19, 16, 23), "darkgrey", 2)
        ell(d, (6, 2, 26, 22), "brown", "ink")
        ell(d, (8, 4, 24, 20), "brownlight", "ink")
        poly(d, [(16, 5), (13, 14), (19, 14)], "brown", "ink")
        line(d, (10, 10, 12, 9), "ink", 2)
        line(d, (20, 9, 22, 10), "ink", 2)
        ell(d, (12, 16, 20, 19), "brown", "ink")
        line(d, (10, 7, 13, 6), "amberlight")
        line(d, (21, 6, 22, 7), "amberlight")
    elif id == "long-wood-mask":
        plinth(d)
        line(d, (16, 21, 16, 24), "darkgrey", 2)
        poly(d, [(10, 2), (22, 2), (25, 7), (21, 19), (16, 23), (11, 19), (7, 7)], "brown", "ink")
        poly(d, [(12, 4), (20, 4), (23, 8), (19, 17), (16, 20), (13, 17), (10, 8)], "brownlight", "ink")
        line(d, (11, 9, 14, 9), "ink")
        line(d, (18, 9, 21, 9), "ink")
        line(d, (16, 7, 15, 14, 18, 14), "brown", 2)
        line(d, (14, 17, 18, 17), "ink")
        line(d, (12, 6, 19, 6), "amberlight")
    elif id == "abstract-metal-mask":
        plinth(d)
        poly(d, [(15, 2), (25, 7), (24, 18), (17, 23), (8, 18), (6, 8)], "grey", "ink")
        poly(d, [(15, 3), (16, 22), (9, 17), (7, 8)], "greylight", "ink")
        poly(d, [(11, 8), (14, 10), (10, 11)], "navy")
        poly(d, [(20, 8), (23, 10), (18, 11)], "navy")
        line(d, (16, 8, 18, 15, 15, 16), "paper")
        line(d, (13, 19, 19, 18), "navy")
    elif id == "mask-triptych":
        rect(d, (1, 4, 30, 26), "brown", "ink")
        rect(d, (3, 6, 28, 24), "paper", "ink")
        for x, top, tint in ((4, 10, "brownlight"), (12, 7, "grey"), (21, 10, "amberdark")):
            ell(d, (x, top, x+6, top+12), tint, "ink")
            line(d, (x+1, top+4, x+2, top+4), "ink")
            line(d, (x+4, top+4, x+5, top+4), "ink")
            line(d, (x+3, top+4, x+3, top+8), "paper")
            rect(d, (x+2, top+10, x+4, top+10), "ink")
        line(d, (5, 28, 26, 28), (17, 23, 41, 40))
    elif id.startswith("portrait-"):
        framed_portrait(im, id.removeprefix("portrait-"))
    elif id in ("painting-landscape", "painting-neighborhood", "painting-geometric"):
        rect(d, (2, 4, 29, 26), "brown", "ink")
        rect(d, (4, 6, 27, 24), "amberlight", "ink")
        rect(d, (5, 7, 26, 23), "paper")
        if id == "painting-landscape":
            rect(d, (5, 7, 26, 18), "cyanlight")
            poly(d, [(5, 18), (12, 13), (17, 18), (23, 14), (26, 18), (26, 23), (5, 23)], "green")
            ell(d, (20, 9, 23, 12), "amber")
            poly(d, [(9, 18), (12, 16), (13, 19), (21, 21), (20, 23), (10, 21)], "cyan")
            line(d, (17, 16, 17, 21), "brown")
            ell(d, (14, 12, 20, 17), "greendark")
        elif id == "painting-neighborhood":
            rect(d, (5, 7, 26, 23), "cyanlight")
            rect(d, (5, 20, 26, 23), "brownlight")
            for x, y, tint in ((6, 12, "coral"), (14, 11, "amber"), (22, 13, "violet")):
                rect(d, (x, y, x+5, 20), tint, "ink")
                poly(d, [(x-1, y), (x+2, y-3), (x+6, y)], "coraldark", "ink")
                rect(d, (x+2, y+3, x+3, y+5), "paper")
            line(d, (11, 22, 22, 22), "paper")
        else:
            rect(d, (5, 7, 26, 23), "violetdark")
            poly(d, [(6, 8), (16, 8), (9, 16)], "coral")
            rect(d, (17, 8, 24, 14), "amber")
            ell(d, (8, 16, 16, 22), "cyan")
            poly(d, [(19, 17), (25, 17), (25, 22), (17, 22)], "paper")
            line(d, (6, 20, 25, 10), "violetlight")
        line(d, (4, 5, 27, 5), "brownlight")
        line(d, (5, 28, 26, 28), (17, 23, 41, 40))
    elif id == "small-gallery-wall":
        for x, y, w, h, tint in ((2, 3, 12, 12, "green"), (17, 5, 12, 17, "cyan"), (4, 20, 10, 8, "coral")):
            rect(d, (x, y, x+w, y+h), "brown", "ink")
            rect(d, (x+2, y+2, x+w-2, y+h-2), tint, "ink")
            if tint == "green":
                ell(d, (x+3, y+3, x+5, y+5), "amberlight")
                line(d, (x+3, y+h-3, x+6, y+6, x+w-3, y+h-3), "greendark", 2)
            elif tint == "cyan":
                poly(d, [(x+3, y+h-3), (x+6, y+4), (x+w-3, y+h-3)], "paper")
                line(d, (x+3, y+3, x+6, y+6), "cyanlight")
            else:
                line(d, (x+3, y+3, x+w-3, y+h-3), "amberlight", 2)
    else:
        raise ValueError(id)
    return im

def metadata(index, id, name, category):
    footprint = scene.rect_footprint(0.12, 0.48, 0.76, 0.40)
    anchors = {"approach": scene.anchor(0.50, 1.12, "north", "observing")}
    interaction, layer, colors = "observe", "object", {}
    if index < 24:
        wood = [scene.base.P[k] for k in ("brown", "brownlight", "amberlight")]
        if index not in (15, 18, 20):
            colors["wood"] = wood
        if index in (0, 1, 18, 20, 21, 22):
            colors["fabric"] = [scene.base.P[k] for k in ("coraldark", "coral", "corallight")]
        if index == 18:
            colors["secondFabric"] = [scene.base.P[k] for k in ("violetdark", "violet", "violetlight")]
        if index in (0, 1, 13, 14, 15, 16, 17, 18, 20, 21, 22):
            interaction = "sit"
            anchors["seat"] = scene.anchor(0.50, 0.64, "south", "sitting")
        if index in (6, 7, 8, 23):
            footprint = scene.rect_footprint(0.15, 0.20, 0.70, 0.67)
        elif index in (2, 3, 4):
            anchors["work"] = scene.anchor(0.50, 1.12, "north", "working")
        elif index == 12:
            footprint, anchors, layer, interaction = None, {}, "wall", "none"
    elif 24 <= index <= 29:
        footprint = scene.rect_footprint(0.40, 0.75, 0.22, 0.20)
        if index == 28:
            footprint = scene.rect_footprint(0.12, 0.80, 0.76, 0.12)
        if index == 25:
            colors["foliage"] = [scene.base.P[k] for k in ("amberdark", "amber", "amberlight")]
        elif index == 26:
            colors["foliage"] = [scene.base.P[k] for k in ("coraldark", "coral", "corallight")]
        else:
            colors["foliage"] = [scene.base.P[k] for k in ("greendark", "green", "greenlight")]
    elif 30 <= index <= 39:
        footprint = scene.rect_footprint(0.08, 0.65, 0.85, 0.22)
        if index in (34, 37, 38):
            footprint, layer = None, "ground"
        if index == 38:
            anchors = {}
        if index == 39:
            anchors["work"] = scene.anchor(0.50, 1.10, "north", "observing")
        colors["foliage"] = [scene.base.P[k] for k in ("greendark", "green", "greenlight")]
        if index in (33, 35, 37):
            colors["flowers"] = [scene.base.P[k] for k in ("coraldark", "coral", "corallight")]
        elif index == 34:
            colors["flowers"] = [scene.base.P[k] for k in ("amberdark", "amber", "amberlight")]
        elif index == 36:
            colors["flowers"] = [scene.base.P[k] for k in ("coraldark", "pink", "corallight")]
    elif 40 <= index <= 47:
        footprint = scene.rect_footprint(0.22, 0.73, 0.58, 0.17)
        interaction = "read"
        anchors["read"] = scene.anchor(0.50, 1.10, "north", "reading")
        if index == 47:
            footprint, layer = None, "wall"
    else:
        footprint, layer, interaction = None, "wall", "read"
        anchors["read"] = scene.anchor(0.50, 1.10, "north", "reading")
    record = {"index": index, "id": id, "name": name, "category": category, "solidFootprint": footprint, "anchors": anchors, "layer": layer, "interaction": interaction, "colorRoles": colors, "sourceRect": {"x": index%8*32, "y": index//8*32, "width": 32, "height": 32}}
    if 40 <= index <= 47:
        record["illustrationStatus"] = "Escultura original criada para o jogo. Não é réplica, objeto ritual autêntico ou representação atribuída a uma cultura específica."
        record["description"] = "Formas, volumes e materiais podem contar uma história. Observe o gesto e o equilíbrio desta escultura original."
    if 48 <= index <= 59:
        record["historicalName"] = name.removeprefix("Quadro: ")
        record["illustrationStatus"] = "Retrato didático original em pixel art; interpretação estilizada, sem copiar fotografias ou obras."
        record["description"] = "Conheça a trajetória desta pessoa no arquivo cultural do bairro. Este quadro foi desenhado para o VOICES."
        record["references"] = [row for row in PORTRAIT_REFERENCES if index in row["indices"]]
    return record

def main():
    atlas = empty(256, 256)
    records, sprites = [], []
    for index, (id, name, category) in enumerate(PROPS):
        image = prop(index, id)
        if image.getchannel("A").getextrema() != (0, 255):
            raise ValueError(f"Alpha inválido: {id}")
        sprites.append(image)
        atlas.alpha_composite(image, (index%8*32, index//8*32))
        records.append(metadata(index, id, name, category))
    if len(set(s.tobytes() for s in sprites)) != 64:
        raise ValueError("Células duplicadas")
    out = ROOT / "assets" / "tilesets"
    out.mkdir(parents=True, exist_ok=True)
    atlas.save(out / "neighborhood-props.png", optimize=True)
    manifest = {"version": "1.7", "license": "CC0-1.0", "attributionRequired": False, "author": "Original VOICES pixel art", "atlas": "assets/tilesets/neighborhood-props.png", "generator": "tools/create_neighborhood_assets.py", "tileSize": 32, "columns": 8, "rows": 8, "coordinateUnits": "tile-fraction", "sourceRectUnits": "pixel", "colorRoleConvention": "Each role lists exact source RGB hex colors in shadow, body, highlight order. Replace only listed colors of this individual prop; outlines, alpha, portraits and skin colors are preserved.", "palette": scene.base.P, "visualReferences": PORTRAIT_REFERENCES, "artStatus": "All pixels are original. Stylized portraits use biographical visual references, without tracing or copying photographs. Abstract masks and full-figured sculptures are original neighborhood art, without a claimed traditional or ritual attribution.", "props": records}
    (out / "neighborhood-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    preview = Image.new("RGB", (1280, 1280), "#e7dfcc")
    d = ImageDraw.Draw(preview)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except OSError:
        font = ImageFont.load_default()
    for index, ((id, name, category), image) in enumerate(zip(PROPS, sprites)):
        x, y = index%8*160, index//8*160
        rect(d, (x+6, y+5, x+153, y+119), "#ded3b9")
        scaled = image.resize((112, 112), Image.Resampling.NEAREST)
        preview.paste(scaled, (x+24, y+5), scaled)
        rows = [""]
        for word in f"{index:02d} {name}".split():
            value = (rows[-1]+" "+word).strip()
            if d.textlength(value, font=font) > 148:
                rows.append(word)
            else:
                rows[-1] = value
        for row, label in enumerate(rows[:3]):
            d.text((x+7, y+121+row*13), label, fill=scene.base.P["navy"], font=font)
    preview.save(ROOT / "tests" / "neighborhood-assets-preview.png", optimize=True)
    print(json.dumps({"atlas": str(out / "neighborhood-props.png"), "props": len(PROPS), "uniqueCells": len(set(s.tobytes() for s in sprites)), "alphaExtrema": atlas.getchannel("A").getextrema(), "recolorableProps": sum(bool(r["colorRoles"]) for r in records), "historicalPortraits": sum("historicalName" in r for r in records)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
