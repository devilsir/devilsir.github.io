from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
_spec = importlib.util.spec_from_file_location("voices_cultural_base", ROOT / "tools" / "create_pixel_assets.py")
base = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(base)
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty

PROPS = ["braid-mirror", "braid-chair", "braid-tools", "hair-catalog", "sewing-machine", "fabric-folds", "garment-rack", "fitting-mirror", "acaraje-tray", "abara-basket", "cocada-tray", "ingredient-beans", "dende-bottle", "cloth-wrap-display", "baiana-display", "culture-books", "listening-station", "interview-notebook", "pattern-table", "folded-pano", "context-label", "community-portrait", "hair-care-shelf", "textile-samples"]
REFERENCES = {
    "ipac-baianas": "https://www.ba.gov.br/ipac/oficio-das-baianas-do-acaraje",
    "fundaj-panos": "https://pesquisaescolar.fundaj.gov.br/pt-br/artigo/panos-da-costa/",
    "secom-negra-jho": "https://www.ba.gov.br/comunicacao/2011/11/noticias/negra-jho-expoe-turbantes-no-museu-udo-knoff",
    "sv-nago": "https://www.saovicente.sp.gov.br/informacao/sao-vicente-une-moda-tradicao-e-raizes-em-oficina-de-trancas",
    "ufu-trancas": "https://repositorio.ufu.br/bitstream/123456789/33895/4/Tran%C3%A7asAfroIdentidade.pdf",
    "juvrio-trancas": "https://juv.prefeitura.rio/noticias/jovens-da-pavuna-aprendem-tecnica-de-trancas-profissionais-na-casa-da-juventude/",
    "cms-abara": "https://www.cms.ba.gov.br/noticias/dia-da-baiana-de-acaraje",
}
PEOPLE = {
    "bisa": dict(skin="#714430", skinlight="#a67250", skindark="#50352c", hair="#28242e", hairlight="#594544", style="short", coat="greendark", shirt="amberlight", pants="navy", accessory="none", age="adult"),
    "dandara": dict(skin="#a46c49", skinlight="#d3996b", skindark="#724a36", hair="#29242e", hairlight="#584245", style="short", coat="coral", shirt="coral", pants="navy", accessory="none", age="adult"),
    "jaci": dict(skin="#784a37", skinlight="#ac7555", skindark="#51382d", hair="#292731", hairlight="#53444a", style="short", coat="cyandark", shirt="paper", pants="navy", accessory="none", age="adult"),
}
META = {
    "bisa": dict(name="Bisa", age=36, role="Trancista e anfitriã do catálogo de cabelos", personality="Atenta, bem-humorada e cuidadosa com o que cada cliente escolhe; desenha suas composições antes de começar.", appearance="Pele negra retinta, tranças nagô reunidas em coque, brincos pequenos e avental verde sobre camiseta clara.", preferredPlaces=["market"], relationships=["Dandara, vizinha de trabalho", "Viviane, amiga da feira"], activities=["organizar ferramentas", "consultar o catálogo", "conversar com clientes"]),
    "dandara": dict(name="Dandara", age=29, role="Costureira e autora de roupas do bairro", personality="Criativa, prática e curiosa; adapta as roupas ao uso e às preferências da pessoa.", appearance="Pele negra, turbante de nó frontal em composição original, blusa coral com desenho geométrico autoral e tênis.", preferredPlaces=["chapter-5"], relationships=["Bisa, colega da feira", "Jamila, colaboradora da mostra"], activities=["comparar amostras", "costurar", "guardar tecido", "conversar"]),
    "jaci": dict(name="Jaci", age=43, role="Educadora do museu e mediadora de leitura", personality="Acolhedora e precisa; gosta de perguntar quem contou uma história e de rever a legenda com os colegas.", appearance="Pele negra retinta, cabelo natural curto, cardigan verde-azulado, caderno e sapatos confortáveis.", preferredPlaces=["room-2"], relationships=["Bento, colega do arquivo", "Jamila, parceira de mediação"], activities=["ler fichas", "revisar legendas", "organizar livros", "receber visitantes"]),
}
ILLUSTRATIONS = {
    "hair-nago": ("Tranças nagô: desenho junto à raiz", "hair", ["ufu-trancas", "sv-nago"]),
    "hair-box-braids": ("Box braids: tranças soltas", "hair", ["ufu-trancas", "juvrio-trancas"]),
    "hair-twists": ("Twists: duas mechas torcidas", "hair", ["ufu-trancas"]),
    "hair-locs": ("Locs: uma silhueta entre muitas", "hair", []),
    "hair-afro": ("Afro arredondado: textura e volume", "hair", []),
    "wrap-front-knot": ("Composição autoral: nó frontal", "wrap", ["secom-negra-jho"]),
    "wrap-side-fold": ("Composição autoral: dobra lateral", "wrap", ["secom-negra-jho"]),
    "wrap-band": ("Composição autoral: faixa de tecido", "wrap", ["secom-negra-jho"]),
    "clothes-cardigan": ("Cardigan e roupa de leitura", "clothing", []),
    "clothes-printed-blouse": ("Blusa com estampa autoral", "clothing", []),
    "clothes-overalls": ("Jardineira para o cotidiano", "clothing", []),
    "clothes-baiana": ("Bata, saia rodada, torço e pano da costa", "clothing", ["ipac-baianas", "fundaj-panos"]),
    "food-acaraje": ("Acarajé: casca frita e recheio visível", "food", ["ipac-baianas"]),
    "food-abara": ("Abará: massa cozida em folha de bananeira", "food", ["cms-abara"]),
    "food-cocada": ("Cocadas branca e marrom no tabuleiro", "food", ["ipac-baianas"]),
    "cloth-pano-da-costa": ("Pano da costa em uma mostra contextualizada", "textile", ["ipac-baianas", "fundaj-panos"]),
    "ingredients-beans-dende": ("Feijão-fradinho e azeite de dendê", "food", ["ipac-baianas"]),
    "textile-workshop": ("Ateliê autoral de Dandara", "textile", []),
}


def save(im, rel):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    im.save(p, optimize=True)


def fabric_pattern(d, box, fill="coral", light="amberlight", dark="coraldark", spacing=6):
    x0, y0, x1, y1 = box
    rect(d, box, fill, "ink")
    for y in range(y0+3, y1-1, spacing):
        for x in range(x0+3, x1-1, spacing):
            poly(d, [(x, y-1), (x+1, y), (x, y+1), (x-1, y)], light)
            if x+3 < x1:
                line(d, (x+2, y-1, x+2, y+1), dark)


def small_braid(d, x, y, end, hair="#28242e", hi="#594544", twist=False, width=3):
    rect(d, (x, y, x+width-1, end), hair, "ink")
    for z in range(y+1, end, 3 if twist else 4):
        if twist:
            line(d, (x+1, z, x+width-2, min(z+1, end)), hi)
            if width > 3:
                rect(d, (x+1, min(z+2, end), x+1, min(z+2, end)), hi)
        else:
            line(d, (x+1, z, x+width-2, z+1, x+1, z+2), hi)


def npc_hair(d, name, direction, bob):
    s = PEOPLE[name]
    h, hi = s["hair"], s["hairlight"]
    if name == "bisa":
        ell(d, (10, 3+bob, 22, 10+bob), s["skindark"], "ink")
        for x in (11, 14, 17, 20):
            line(d, (x, 5+bob, x+1, 7+bob, x, 9+bob), h, 2)
            rect(d, (x, 6+bob, x, 6+bob), hi)
        if direction == 3:
            ell(d, (10, 5+bob, 22, 14+bob), h, "ink")
            for x in (11, 14, 17, 20):
                line(d, (x, 6+bob, x+1, 11+bob), hi)
            ell(d, (12, 10+bob, 20, 17+bob), h, "ink")
            line(d, (14, 12+bob, 18, 12+bob, 18, 15+bob, 14, 15+bob), hi)
        else:
            bx = 21 if direction == 1 else 8 if direction == 2 else 20
            ell(d, (bx, 6+bob, bx+5, 12+bob), h, "ink")
            line(d, (bx+1, 8+bob, bx+3, 8+bob, bx+3, 10+bob), hi)
            xs = (9, 22) if direction == 0 else (20,) if direction == 1 else (10,)
            for x in xs:
                ell(d, (x, 13+bob, x+1, 15+bob), "amber", "amberdark")
    elif name == "dandara":
        ell(d, (9, 0+bob, 23, 10+bob), "amber", "ink")
        poly(d, [(9, 6+bob), (13, 2+bob), (22, 4+bob), (22, 8+bob), (11, 9+bob)], "amberdark", "ink")
        line(d, (11, 5+bob, 19, 7+bob), "amberlight", 2)
        line(d, (13, 2+bob, 21, 5+bob), "coral")
        if direction == 0:
            poly(d, [(15, 2+bob), (12, 0+bob), (16, 0+bob), (18, 3+bob), (17, 6+bob), (14, 4+bob)], "coral", "ink")
            poly(d, [(17, 2+bob), (21, 0+bob), (22, 3+bob), (19, 6+bob), (17, 5+bob)], "amber", "ink")
            rect(d, (16, 3+bob, 18, 5+bob), "amberlight", "amberdark")
        elif direction == 3:
            line(d, (11, 3+bob, 20, 5+bob, 21, 9+bob), "amberlight")
        else:
            x = 9 if direction == 1 else 21
            ell(d, (x-2, 3+bob, x+2, 7+bob), "coral", "ink")
    else:
        ell(d, (10, 3+bob, 21, 8+bob), h, "ink")
        for x, y in ((11, 5), (13, 4), (16, 4), (19, 5), (21, 7)):
            ell(d, (x-1, y-1+bob, x+1, y+1+bob), h)
            rect(d, (x, y+bob, x, y+bob), hi)
        if direction == 3:
            ell(d, (10, 5+bob, 22, 13+bob), h, "ink")
            for x, y in ((12, 7), (16, 6), (20, 8), (15, 10)):
                rect(d, (x, y+bob, x+1, y+bob), hi)


def npc_sprite(name, row, frame):
    direction = row if row < 4 else 0
    state = "walk" if row < 4 else "interact" if row == 4 else "celebrate"
    im = base.sprite(PEOPLE[name], direction, frame, state)
    d = ImageDraw.Draw(im)
    bob = 1 if frame in (1, 3) and row < 4 else 0
    npc_hair(d, name, direction, bob)
    if name == "bisa":
        if direction in (0, 3):
            poly(d, [(12, 17+bob), (19, 17+bob), (20, 24), (11, 24)], "greendark", "ink")
            line(d, (12, 18+bob, 12, 23), "green")
            rect(d, (13, 21, 18, 23), "green", "ink")
            rect(d, (14, 22, 14, 22), "amberlight")
        else:
            x = 10 if direction == 1 else 19
            rect(d, (x, 18+bob, x+3, 23), "greendark", "ink")
    elif name == "dandara":
        xs = (11, 17) if direction in (0, 3) else (11,) if direction == 1 else (20,)
        for x in xs:
            for y in (18+bob, 22):
                rect(d, (x, y, x+1, y), "amberlight")
                rect(d, (x+1, y+1, x+1, y+1), "coraldark")
        if direction in (0, 3):
            line(d, (14, 18+bob, 14, 21), "coraldark")
            line(d, (19, 18+bob, 19, 21), "coraldark")
    elif direction == 0:
        line(d, (12, 17+bob, 13, 21, 12, 23), "cyanlight")
        line(d, (19, 17+bob, 18, 21, 19, 23), "cyanlight")
        rect(d, (20, 21, 22, 23), "cyan", "ink")
    if row == 4:
        motion = (0, 1, 2, -1)[frame]
        rect(d, (22, 8, 31, 20), (0, 0, 0, 0))
        rect(d, (26, 5, 31, 8), (0, 0, 0, 0))
        line(d, (22, 19, 23, 17+motion), PEOPLE[name]["coat"], 3)
        rect(d, (22, 16+motion, 24, 18+motion), PEOPLE[name]["skin"], "ink")
        if name == "bisa":
            line(d, (24, 12+motion, 28, 12+motion), "amberlight", 2)
            for x in (24, 26, 28):
                line(d, (x, 12+motion, x, 15+motion), "amberdark")
        elif name == "dandara":
            poly(d, [(23, 13+motion), (28, 11+motion), (30, 15+motion), (25, 17+motion)], "violet", "ink")
            line(d, (25, 13+motion, 28, 14+motion), "amberlight")
        else:
            rect(d, (23, 11+motion, 29, 16+motion), "paper", "ink")
            line(d, (26, 12+motion, 26, 15+motion), "brownlight")
            line(d, (24, 13+motion, 25, 13+motion), "grey")
            if frame in (1, 2):
                poly(d, [(26, 11+motion), (29, 12+motion), (27, 15+motion)], "white", "grey")
    return im


def npc_portrait(name, expression):
    im = base.portrait(PEOPLE[name], "neutral" if expression == "focused" else expression).resize((48, 48), Image.Resampling.NEAREST)
    d = ImageDraw.Draw(im)
    s = PEOPLE[name]
    if name == "bisa":
        ell(d, (12, 5, 36, 15), s["skindark"], "ink")
        for x in (14, 19, 24, 29, 33):
            line(d, (x, 7, x+1, 10, x, 14), s["hair"], 3)
            line(d, (x, 8, x+1, 10), s["hairlight"])
        ell(d, (31, 6, 41, 17), s["hair"], "ink")
        line(d, (34, 9, 38, 9, 39, 13, 35, 14, 34, 11), s["hairlight"])
        ell(d, (12, 24, 15, 28), "amber", "amberdark")
        ell(d, (34, 24, 37, 28), "amber", "amberdark")
        poly(d, [(17, 35), (19, 33), (20, 37), (28, 37), (30, 33), (32, 35), (30, 48), (18, 48)], "greendark", "ink")
        rect(d, (21, 41, 27, 45), "green", "ink")
        line(d, (19, 38, 19, 46), "greenlight")
    elif name == "dandara":
        ell(d, (10, 1, 37, 18), "amber", "ink")
        poly(d, [(11, 11), (17, 4), (34, 5), (36, 12), (34, 17), (14, 17)], "amberdark", "ink")
        line(d, (13, 10, 20, 12, 34, 14), "amberlight", 2)
        line(d, (16, 5, 30, 7, 35, 10), "coral", 2)
        poly(d, [(23, 4), (18, 0), (21, 0), (27, 3), (28, 9), (24, 12), (21, 8)], "coral", "ink")
        poly(d, [(26, 4), (30, 0), (35, 1), (34, 5), (29, 11), (25, 10)], "amber", "ink")
        ell(d, (23, 6, 28, 12), "amberlight", "amberdark")
        for x, y in ((13, 39), (19, 43), (31, 38), (34, 43), (27, 46)):
            poly(d, [(x, y-1), (x+1, y), (x, y+1), (x-1, y)], "amberlight")
            line(d, (x+2, y-1, x+2, y+1), "coraldark")
        line(d, (18, 36, 20, 39, 28, 39, 30, 36), "coraldark")
    else:
        ell(d, (12, 6, 36, 15), s["hair"], "ink")
        for x, y in ((14, 10), (18, 7), (23, 8), (28, 8), (32, 11), (35, 13)):
            ell(d, (x-1, y-1, x+1, y+1), s["hair"])
            rect(d, (x, y-1, x+1, y-1), s["hairlight"])
        line(d, (17, 35, 20, 39, 19, 47), "cyanlight")
        line(d, (31, 35, 28, 39, 29, 47), "cyanlight")
        rect(d, (31, 42, 36, 47), "cyan", "ink")
        rect(d, (10, 44, 17, 47), "brownlight", "ink")
        line(d, (12, 45, 16, 45), "paper")
    if expression == "focused":
        line(d, (17, 19, 21, 20), s["hair"])
        line(d, (27, 20, 31, 19), s["hair"])
        line(d, (22, 29, 27, 29), s["skindark"])
    return im.resize((96, 96), Image.Resampling.NEAREST)


def frame_base(d, box=(11, 6, 36, 31)):
    rect(d, box, "brown", "ink")
    x0, y0, x1, y1 = box
    rect(d, (x0+2, y0+2, x1-2, y1-2), "cyanlight", "amberdark")
    line(d, (x0+4, y0+5, x1-7, y1-6), "white", 2)


def small_book(d, x, y, w=11, h=8, c="violet"):
    rect(d, (x, y, x+w, y+h), c, "ink")
    rect(d, (x+2, y+2, x+w-2, y+h-1), "paper")
    line(d, (x+2, y+h-2, x+w-2, y+h-2), "grey")


def food_acaraje(d, x, y, w=24, h=17):
    outline=[(.02,.3),(.13,.09),(.37,0),(.69,.04),(.9,.21),(1,.45),(.94,.68),(.72,.92),(.47,1),(.21,.89),(.02,.68)]
    poly(d, [(x+round(px*w),y+round(py*h)) for px,py in outline], "#bd6b2d", "ink")
    poly(d, [(x+3,y+round(h*.31)),(x+round(w*.2),y+3),(x+round(w*.53),y+2),(x+w-4,y+round(h*.29)),(x+w-3,y+round(h*.57)),(x+round(w*.68),y+h-3),(x+round(w*.28),y+h-3),(x+3,y+round(h*.64))], "#d58939")
    for yy in range(4,h-3,3):
        for xx in range(4,w-3,4):
            if ((xx-w/2)/(w*.43))**2+((yy-h/2)/(h*.4))**2 < 1:
                offset=(xx+yy)%3
                rect(d, (x+xx,y+yy,x+xx+1,y+yy), "#8e4527" if offset==0 else "#e7a14d")
    poly(d, [(x+3,y+round(h*.57)),(x+round(w*.31),y+round(h*.4)),(x+w-6,y+round(h*.29)),(x+w-3,y+round(h*.44)),(x+round(w*.68),y+round(h*.63)),(x+7,y+round(h*.8))], "#6a3929", "#8e4527")
    poly(d, [(x+6,y+round(h*.57)),(x+round(w*.35),y+round(h*.47)),(x+w-7,y+round(h*.35)),(x+w-5,y+round(h*.44)),(x+round(w*.66),y+round(h*.57)),(x+8,y+round(h*.7))], "#e8b36c", "#bc793a")
    for ratio in (.25,.5,.72):
        xx=x+round(w*ratio)
        yy=y+round(h*(.68-ratio*.35))
        rect(d,(xx,yy,xx+2,yy+1),"coral")


def food_abara(d, x, y, w=21, h=18, opened=False):
    poly(d, [(x, y+4), (x+w-4, y), (x+w, y+h-4), (x+5, y+h)], "greendark", "ink")
    if opened:
        poly(d, [(x-2, y+9), (x+4, y+3), (x+w+4, y+7), (x+w-1, y+h), (x+4, y+h+3)], "green", "ink")
        poly(d, [(x+4, y+3), (x+w-4, y+1), (x+w-1, y+h-4), (x+7, y+h-2)], "amber", "amberdark")
        line(d, (x+7, y+5, x+w-5, y+4), "amberlight", 2)
        line(d, (x+3, y+12, x+6, y+h), "greenlight")
        line(d, (x+w-1, y+7, x+w+2, y+8), "greenlight")
    else:
        line(d, (x+4, y+4, x+w-2, y+h-4), "greenlight")
        line(d, (x+9, y+3, x+w-1, y+h-8), "green")
        line(d, (x+4, y+7, x+w-4, y+4), "brownlight")


def food_cocada(d, x, y, w=12, h=7, brown=False):
    c = "amberdark" if brown else "white"
    hi = "amber" if brown else "paper"
    ell(d, (x, y, x+w, y+h), c, "ink")
    for dx, dy in ((3, 2), (6, 1), (9, 3), (4, 4), (7, 5)):
        line(d, (x+dx, y+dy, x+dx+1, y+dy), hi)


def sewing(d, x, y):
    rect(d, (x, y+13, x+29, y+16), "navylight", "ink")
    poly(d, [(x+9, y), (x+25, y), (x+27, y+3), (x+27, y+14), (x+20, y+14), (x+20, y+7), (x+9, y+7), (x+8, y+12), (x+5, y+12), (x+5, y+3)], "greylight", "ink")
    rect(d, (x+8, y+1, x+21, y+3), "white")
    ell(d, (x+23, y+4, x+30, y+11), "navy", "ink")
    ell(d, (x+25, y+6, x+28, y+9), "grey", "ink")
    line(d, (x+6, y+11, x+6, y+15), "grey")
    rect(d, (x+12, y-3, x+17, y), "coral", "ink")
    line(d, (x+15, y, x+10, y+2, x+6, y+6), "coral")


def baiana(d, ox=0, oy=0, scale=1):
    layer = empty(48, 48)
    q = ImageDraw.Draw(layer)
    rect(q, (22, 6, 25, 14), "brownlight", "ink")
    ell(q, (18, 1, 30, 10), "paper", "ink")
    line(q, (20, 4, 27, 6), "white", 2)
    poly(q, [(22, 2), (25, 0), (28, 2), (27, 5), (23, 4)], "white", "grey")
    poly(q, [(18, 12), (29, 12), (33, 23), (15, 23)], "white", "ink")
    line(q, (21, 13, 24, 15, 27, 13), "greylight")
    for x in (16, 30):
        line(q, (x, 19, x+1, 22), "paper", 2)
    poly(q, [(17, 23), (30, 23), (38, 40), (35, 43), (12, 43), (9, 40)], "white", "ink")
    for x in (15, 21, 27, 33):
        line(q, (22+(x-24)//3, 25, x, 39), "paper")
    line(q, (12, 40, 35, 40), "greylight")
    for x in range(13, 35, 3):
        rect(q, (x, 41, x+1, 42), "paper")
    poly(q, [(17, 14), (22, 14), (29, 32), (25, 35)], "amberdark", "ink")
    line(q, (19, 17, 26, 32), "amberlight")
    line(q, (20, 15, 27, 31), "coral")
    rect(q, (20, 44, 27, 45), "brown", "ink")
    line(q, (24, 43, 24, 46), "brownlight", 2)
    if scale != 1:
        layer = layer.resize((48*scale, 48*scale), Image.Resampling.NEAREST)
    d._image.alpha_composite(layer, (ox, oy))


def prop(name):
    im = empty(48, 48)
    d = ImageDraw.Draw(im)
    ell(d, (5, 41, 42, 46), (17, 23, 41, 56))
    if name == "braid-mirror":
        frame_base(d, (10, 2, 37, 30))
        rect(d, (5, 32, 42, 36), "brownlight", "ink")
        rect(d, (8, 36, 11, 45), "brown", "ink")
        rect(d, (36, 36, 39, 45), "brown", "ink")
        rect(d, (29, 27, 34, 31), "coral", "ink")
        line(d, (15, 28, 22, 28), "amberlight", 2)
        for x in range(15, 23, 2):
            line(d, (x, 28, x, 30), "amberdark")
    elif name == "braid-chair":
        ell(d, (12, 4, 34, 21), "greendark", "ink")
        rect(d, (12, 13, 34, 29), "greendark", "ink")
        rect(d, (15, 8, 31, 20), "green", "ink")
        rect(d, (9, 24, 13, 34), "brown", "ink")
        rect(d, (33, 24, 37, 34), "brown", "ink")
        rect(d, (14, 26, 32, 33), "green", "ink")
        rect(d, (21, 34, 26, 40), "grey", "ink")
        line(d, (14, 43, 34, 43), "navylight", 3)
        line(d, (23, 40, 23, 43), "grey", 2)
    elif name == "braid-tools":
        rect(d, (5, 19, 42, 36), "brownlight", "ink")
        rect(d, (8, 36, 11, 44), "brown", "ink")
        rect(d, (36, 36, 39, 44), "brown", "ink")
        rect(d, (9, 21, 25, 29), "paper", "ink")
        line(d, (11, 23, 22, 23), "amber", 2)
        for x in range(12, 23, 2):
            line(d, (x, 24, x, 27), "amberdark")
        ell(d, (29, 19, 35, 25), "coral", "ink")
        ell(d, (35, 19, 41, 25), "coral", "ink")
        line(d, (33, 23, 38, 31, 34, 27, 29, 32), "grey")
        rect(d, (12, 13, 15, 18), "cyan", "ink")
        rect(d, (13, 10, 14, 13), "grey", "ink")
    elif name == "hair-catalog":
        poly(d, [(6, 9), (22, 12), (40, 8), (40, 34), (23, 38), (6, 34)], "paper", "ink")
        line(d, (23, 13, 23, 36), "brownlight")
        for x, y, c in ((13, 17, "brown"), (32, 17, "coraldark"), (13, 28, "greendark"), (32, 28, "violetdark")):
            ell(d, (x-4, y-4, x+4, y+3), c, "ink")
            ell(d, (x-2, y-1, x+2, y+4), "brownlight", "ink")
            line(d, (x-4, y+6, x+4, y+6), "grey")
        rect(d, (36, 9, 38, 20), "coral")
    elif name == "sewing-machine":
        rect(d, (5, 28, 43, 33), "brownlight", "ink")
        rect(d, (8, 33, 11, 44), "brown", "ink")
        rect(d, (36, 33, 39, 44), "brown", "ink")
        fabric_pattern(d, (10, 24, 24, 34), "violet", "amberlight", "violetdark", 5)
        sewing(d, 11, 12)
        line(d, (12, 44, 24, 39, 36, 44), "navy", 2)
    elif name in ("fabric-folds", "folded-pano"):
        colors = [("violetdark", "violetlight"), ("greendark", "greenlight"), ("coraldark", "amberlight")] if name == "fabric-folds" else [("amberdark", "amberlight"), ("brown", "coral")]
        for i, (c, hi) in enumerate(colors):
            y = 31-i*8
            poly(d, [(7+i*2, y), (36+i*2, y-3), (40+i*2, y+3), (11+i*2, y+6)], c, "ink")
            line(d, (12+i*2, y+2, 35+i*2, y), hi)
            for x in range(15+i*2, 35+i*2, 5):
                line(d, (x, y+1, x+2, y+3), hi)
    elif name == "garment-rack":
        line(d, (5, 44, 9, 41, 9, 7, 39, 7, 39, 41, 44, 44), "navylight", 3)
        line(d, (8, 6, 40, 6), "greylight")
        for x in (15, 25, 35):
            line(d, (x, 9, x-3, 14, x+3, 14, x, 9), "grey")
        poly(d, [(12, 14), (18, 14), (21, 18), (19, 23), (18, 22), (18, 33), (11, 33), (11, 23), (8, 22), (9, 18)], "violet", "ink")
        poly(d, [(23, 14), (28, 14), (31, 18), (28, 23), (28, 34), (22, 34), (22, 21), (19, 20)], "coral", "ink")
        for y in (19, 25, 30):
            rect(d, (24, y, 25, y), "amberlight")
        poly(d, [(33, 14), (37, 14), (39, 20), (41, 35), (31, 35), (32, 22)], "green", "ink")
        line(d, (35, 16, 35, 31), "greenlight")
    elif name == "fitting-mirror":
        frame_base(d, (15, 1, 33, 40))
        line(d, (17, 10, 30, 23), "white", 2)
        line(d, (17, 25, 25, 33), "white")
        line(d, (15, 39, 11, 45), "brown", 3)
        line(d, (33, 39, 38, 45), "brown", 3)
    elif name == "acaraje-tray":
        ell(d, (2, 19, 46, 42), "paper", "ink")
        ell(d, (5, 21, 43, 39), "white", "greylight")
        food_acaraje(d, 10, 14, 28, 19)
        ell(d, (6, 30, 16, 35), "greendark", "ink")
        ell(d, (33, 28, 42, 34), "coral", "ink")
    elif name == "abara-basket":
        poly(d, [(4, 23), (39, 21), (43, 36), (37, 43), (11, 43), (5, 35)], "brownlight", "ink")
        for y in (30, 34, 38):
            line(d, (7, y, 39, y-1), "amberdark")
        for x in (11, 19, 27, 35):
            line(d, (x, 24, x+2, 41), "brown")
        food_abara(d, 8, 15, 17, 15)
        food_abara(d, 24, 20, 17, 15, True)
    elif name == "cocada-tray":
        rect(d, (3, 13, 44, 38), "brownlight", "ink")
        rect(d, (6, 16, 41, 35), "paper", "amberdark")
        for x in (8, 25):
            food_cocada(d, x, 19, 13, 7)
            food_cocada(d, x, 28, 13, 7, True)
    elif name == "ingredient-beans":
        poly(d, [(9, 13), (35, 13), (38, 37), (34, 42), (11, 42), (7, 37)], "brownlight", "ink")
        ell(d, (8, 7, 37, 20), "brown", "ink")
        for x, y in ((14, 12), (20, 10), (27, 12), (32, 13), (17, 16), (25, 17)):
            ell(d, (x-2, y-1, x+2, y+1), "paper", "amberdark")
            rect(d, (x, y, x, y), "brown")
        rect(d, (16, 26, 30, 34), "paper", "ink")
        ell(d, (20, 29, 25, 32), "amberlight", "brown")
        rect(d, (22, 30, 23, 30), "brown")
    elif name == "dende-bottle":
        rect(d, (19, 4, 29, 8), "greendark", "ink")
        rect(d, (20, 9, 28, 15), "amberdark", "ink")
        poly(d, [(20, 14), (16, 19), (16, 39), (19, 42), (31, 42), (34, 39), (34, 19), (28, 14)], "coraldark", "ink")
        rect(d, (18, 21, 31, 38), "amberdark")
        line(d, (19, 20, 19, 36), "amber", 2)
        rect(d, (20, 25, 30, 32), "paper", "ink")
        ell(d, (23, 27, 28, 30), "coral", "amberdark")
    elif name == "cloth-wrap-display":
        rect(d, (21, 29, 26, 43), "brown", "ink")
        ell(d, (14, 40, 34, 46), "brownlight", "ink")
        ell(d, (15, 11, 34, 31), "paper", "ink")
        ell(d, (12, 2, 37, 20), "violet", "ink")
        poly(d, [(14, 11), (20, 5), (34, 7), (35, 16), (15, 17)], "violetdark", "ink")
        line(d, (16, 11, 31, 14), "violetlight", 2)
        poly(d, [(24, 4), (19, 1), (22, 0), (28, 4), (27, 10), (23, 9)], "coral", "ink")
        poly(d, [(26, 5), (32, 0), (35, 3), (32, 7), (27, 11)], "amber", "ink")
        ell(d, (24, 6, 29, 11), "amberlight", "amberdark")
    elif name == "baiana-display":
        baiana(d)
    elif name == "culture-books":
        rect(d, (5, 34, 42, 40), "brown", "ink")
        for x, y, c in ((8, 23, "violet"), (15, 18, "coral"), (22, 22, "greendark"), (31, 15, "amber")):
            rect(d, (x, y, x+6, 34), c, "ink")
            rect(d, (x+2, y+3, x+4, y+6), "paper")
            line(d, (x+2, 30, x+4, 30), "paper")
    elif name == "listening-station":
        rect(d, (6, 28, 42, 34), "brownlight", "ink")
        rect(d, (9, 34, 12, 44), "brown", "ink")
        rect(d, (35, 34, 38, 44), "brown", "ink")
        rect(d, (10, 17, 32, 28), "navy", "ink")
        rect(d, (13, 19, 27, 23), "green", "ink")
        for x in (14, 19, 24):
            rect(d, (x, 25, x+1, 25), "amber")
        line(d, (26, 17, 28, 8, 37, 8, 39, 17), "grey", 2)
        rect(d, (25, 13, 29, 21), "coral", "ink")
        rect(d, (37, 13, 41, 21), "coral", "ink")
        line(d, (38, 22, 41, 27, 32, 29), "ink")
    elif name == "interview-notebook":
        poly(d, [(7, 13), (22, 17), (39, 11), (40, 35), (23, 41), (7, 37)], "paper", "ink")
        line(d, (23, 18, 23, 39), "brownlight")
        for y in (21, 25, 29, 33):
            line(d, (10, y, 19, y+1), "grey")
            line(d, (27, y, 36, y-3), "grey")
        line(d, (33, 14, 40, 26), "coral", 3)
        rect(d, (39, 26, 40, 28), "amberlight", "ink")
        rect(d, (10, 8, 19, 15), "navy", "ink")
        rect(d, (12, 10, 16, 11), "cyan")
        ell(d, (17, 10, 18, 12), "coral")
    elif name == "pattern-table":
        rect(d, (3, 19, 45, 34), "brownlight", "ink")
        rect(d, (6, 34, 10, 44), "brown", "ink")
        rect(d, (38, 34, 42, 44), "brown", "ink")
        fabric_pattern(d, (6, 22, 25, 35), "coral", "amberlight", "coraldark", 5)
        poly(d, [(26, 21), (30, 21), (30, 24), (36, 25), (35, 32), (24, 31), (23, 25), (26, 24)], "paper", "grey")
        line(d, (28, 24, 28, 30), "grey")
        rect(d, (9, 14, 12, 20), "violet", "ink")
        rect(d, (16, 16, 40, 18), "amberlight", "amberdark")
        for x in range(18, 40, 3):
            line(d, (x, 16, x, 17), "amberdark")
    elif name == "context-label":
        rect(d, (23, 23, 26, 43), "grey", "ink")
        poly(d, [(5, 10), (38, 5), (42, 25), (9, 31)], "brown", "ink")
        poly(d, [(8, 12), (35, 8), (38, 23), (11, 28)], "paper", "amberdark")
        for y in (15, 19, 23):
            line(d, (12, y, 32, y-3), "grey")
        line(d, (19, 43, 31, 43), "navy", 2)
    elif name == "community-portrait":
        rect(d, (5, 3, 43, 41), "brown", "ink")
        rect(d, (8, 6, 40, 38), "paper", "amberdark")
        ell(d, (17, 9, 30, 21), "ink")
        ell(d, (19, 12, 29, 26), "brown", "ink")
        poly(d, [(12, 36), (15, 29), (20, 26), (28, 26), (34, 30), (37, 36)], "greendark", "ink")
        line(d, (21, 22, 26, 22), "ink")
        rect(d, (21, 18, 21, 19), "ink")
        rect(d, (26, 18, 26, 19), "ink")
        rect(d, (11, 42, 37, 47), "paper", "ink")
        line(d, (15, 44, 32, 44), "grey")
    elif name == "hair-care-shelf":
        rect(d, (7, 4, 40, 43), "brown", "ink")
        for y in (17, 30, 42):
            rect(d, (8, y, 39, y+2), "brownlight", "ink")
        for x, c in ((11, "cyan"), (22, "violet"), (31, "coral")):
            rect(d, (x, 9, x+5, 16), c, "ink")
            rect(d, (x+1, 6, x+4, 8), "paper", "ink")
            rect(d, (x+1, 12, x+4, 14), "paper")
        for x, c in ((12, "green"), (25, "amber")):
            ell(d, (x, 22, x+9, 28), c, "ink")
            rect(d, (x, 21, x+9, 23), "paper", "ink")
        rect(d, (13, 35, 34, 39), "paper", "ink")
        line(d, (16, 37, 30, 37), "grey")
    elif name == "textile-samples":
        rect(d, (6, 3, 42, 42), "brown", "ink")
        rect(d, (9, 6, 39, 39), "paper", "amberdark")
        fabric_pattern(d, (12, 10, 24, 21), "coral", "amberlight", "coraldark", 5)
        fabric_pattern(d, (25, 10, 36, 21), "greendark", "greenlight", "cyan", 5)
        fabric_pattern(d, (12, 24, 24, 35), "violet", "violetlight", "violetdark", 5)
        rect(d, (27, 25, 36, 34), "white", "grey")
        for y in (27, 30, 33):
            line(d, (28, y, 35, y), "paper")
    return im


def gallery_head(d, style):
    skin, hi, shade = "#8a573e", "#bb825b", "#603e2f"
    hair, hairhi = "#28242e", "#5a4447"
    if style == "hair-afro" or style == "wrap-band":
        for x, y, r in ((22, 19, 7), (24, 12, 7), (33, 10, 8), (42, 14, 8), (46, 21, 6), (19, 25, 6), (45, 29, 6)):
            ell(d, (x-r, y-r, x+r, y+r), hair, "ink")
    elif style in ("hair-box-braids", "hair-twists", "hair-locs"):
        ell(d, (18, 11, 47, 34), hair, "ink")
        for i, x in enumerate((15, 20, 25, 39, 44, 49)):
            if style == "hair-locs":
                end = 56-i%3*4
                ell(d, (x-1, 22, x+4, end), hair, "ink")
                line(d, (x, 26, x+1, 38, x, end-3), hairhi)
            else:
                end = 57-i%2*3 if style == "hair-box-braids" else 50+i%2*4
                small_braid(d, x, 22, end, hair, hairhi, style == "hair-twists", 4)
    poly(d, [(13, 63), (13, 56), (21, 50), (27, 49), (39, 49), (47, 53), (53, 58), (53, 63)], "cyandark", "ink")
    rect(d, (28, 44, 38, 52), skin, "ink")
    poly(d, [(25, 52), (32, 55), (40, 51), (39, 63), (25, 63)], "paper")
    ell(d, (21, 20, 44, 49), skin, "ink")
    poly(d, [(22, 27), (24, 23), (28, 22), (30, 24), (25, 28), (24, 39), (22, 40)], hi)
    poly(d, [(43, 31), (43, 41), (38, 46), (33, 48), (31, 45), (38, 43), (41, 36)], shade)
    rect(d, (25, 33, 29, 35), "white")
    rect(d, (36, 33, 40, 35), "white")
    rect(d, (27, 33, 28, 36), "ink")
    rect(d, (37, 33, 38, 36), "ink")
    line(d, (25, 31, 29, 31), hair)
    line(d, (36, 31, 40, 31), hair)
    line(d, (33, 35, 32, 39, 34, 39), shade)
    line(d, (28, 43, 37, 43, 38, 42), "ink")
    line(d, (30, 44, 35, 44), hi)
    if style == "hair-nago":
        ell(d, (21, 12, 45, 27), skin, "ink")
        for i, x in enumerate((23, 28, 33, 38, 43)):
            line(d, (x, 17, x-2, 21, x-1, 27), hair, 3)
            for y in (18, 23):
                rect(d, (x-1, y, x, y), hairhi)
        ell(d, (44, 16, 55, 27), hair, "ink")
        line(d, (47, 19, 51, 19, 52, 23, 48, 25, 46, 23), hairhi)
    elif style in ("hair-box-braids", "hair-twists", "hair-locs"):
        poly(d, [(20, 28), (19, 19), (23, 13), (32, 10), (41, 13), (47, 20), (45, 28), (40, 23), (32, 21), (26, 22)], hair, "ink")
        for i, x in enumerate((23, 28, 33, 38, 43)):
            if style == "hair-locs":
                line(d, (x, 13+i%2, x-1, 19, x, 25-i%3), hairhi, 2)
            elif style == "hair-twists":
                for y in (16, 21):
                    line(d, (x, y, x+1, y+2), hairhi)
            else:
                for y in (16, 20):
                    line(d, (x, y, x+1, y+1, x, y+2), hairhi)
        if style == "hair-box-braids":
            line(d, (25, 13, 26, 18, 42, 20), shade)
            line(d, (24, 21, 27, 20, 29, 13), shade)
            line(d, (34, 12, 33, 20), shade)
    elif style == "hair-afro":
        for x, y in ((21, 17), (27, 10), (36, 8), (43, 16), (17, 26), (48, 26), (25, 23), (39, 22)):
            line(d, (x, y, x+2, y, x+2, y+2), hairhi)
        poly(d, [(21, 29), (20, 22), (26, 20), (31, 22), (37, 20), (44, 23), (44, 29), (40, 26), (26, 26)], hair, "ink")
    elif style == "wrap-band":
        poly(d, [(19, 24), (26, 21), (42, 22), (47, 26), (46, 32), (39, 29), (26, 29), (20, 32)], "coral", "ink")
        line(d, (22, 25, 41, 25, 45, 27), "amberlight", 2)
        for x in (25, 31, 38):
            rect(d, (x, 27, x+1, 28), "coraldark")
    else:
        c, light, dark = ("amber", "amberlight", "amberdark") if style == "wrap-front-knot" else ("violet", "violetlight", "violetdark")
        ell(d, (17, 4, 49, 29), c, "ink")
        poly(d, [(19, 20), (26, 10), (43, 12), (48, 22), (45, 28), (21, 28)], dark, "ink")
        line(d, (21, 18, 32, 22, 44, 24), light, 2)
        line(d, (25, 10, 41, 14, 45, 19), c, 2)
        if style == "wrap-front-knot":
            poly(d, [(30, 9), (22, 2), (27, 1), (34, 7), (34, 17), (29, 15), (27, 10)], "coral", "ink")
            poly(d, [(33, 8), (42, 1), (46, 6), (43, 12), (34, 17)], c, "ink")
            ell(d, (29, 12, 35, 18), light, dark)
        else:
            poly(d, [(44, 15), (51, 11), (56, 15), (51, 21), (49, 24), (44, 22)], c, "ink")
            line(d, (48, 16, 51, 17, 49, 20), light)
            poly(d, [(48, 22), (52, 23), (54, 33), (49, 34)], dark, "ink")
    for x in (18, 46):
        ell(d, (x, 40, x+2, 44), "amber", "amberdark")


def clothes_figure(d, style):
    skin, hi, dark, hair = "#89583d", "#bd865b", "#603e2e", "#28242e"
    ell(d, (25, 6, 38, 23), skin, "ink")
    ell(d, (24, 4, 38, 13), hair, "ink")
    line(d, (27, 8, 35, 7), "#584347")
    rect(d, (27, 14, 28, 15), "ink")
    rect(d, (34, 14, 35, 15), "ink")
    line(d, (29, 19, 34, 19), dark)
    rect(d, (29, 22, 34, 26), skin, "ink")
    rect(d, (23, 42, 29, 57), "navy", "ink")
    rect(d, (34, 42, 40, 57), "navy", "ink")
    rect(d, (20, 57, 29, 61), "white", "ink")
    rect(d, (34, 57, 43, 61), "white", "ink")
    line(d, (22, 59, 28, 59), "grey")
    line(d, (35, 59, 41, 59), "grey")
    c = "greendark" if style == "clothes-cardigan" else "coral" if style == "clothes-printed-blouse" else "amberlight"
    poly(d, [(23, 25), (29, 24), (35, 24), (42, 26), (47, 37), (42, 40), (40, 33), (40, 44), (22, 44), (22, 33), (18, 40), (14, 37)], c, "ink")
    rect(d, (16, 38, 19, 44), skin, "ink")
    rect(d, (44, 38, 47, 44), skin, "ink")
    if style == "clothes-cardigan":
        poly(d, [(27, 26), (31, 28), (35, 26), (35, 44), (27, 44)], "paper", "ink")
        line(d, (24, 27, 27, 32, 25, 41), "greenlight")
        line(d, (38, 27, 35, 32, 38, 41), "greenlight")
        rect(d, (23, 37, 27, 40), "green", "ink")
        rect(d, (36, 37, 40, 40), "green", "ink")
    elif style == "clothes-printed-blouse":
        for y in (29, 35, 41):
            for x in (24, 31, 38):
                poly(d, [(x, y-1), (x+1, y), (x, y+1), (x-1, y)], "amberlight")
                line(d, (x+3, y-1, x+3, y+1), "coraldark")
        line(d, (27, 26, 31, 28, 36, 26), "coraldark")
    else:
        rect(d, (23, 33, 39, 44), "navylight", "ink")
        rect(d, (24, 27, 26, 34), "navylight", "ink")
        rect(d, (36, 27, 38, 34), "navylight", "ink")
        rect(d, (24, 30, 25, 30), "amber")
        rect(d, (37, 30, 38, 30), "amber")
        rect(d, (28, 36, 35, 40), "navy", "ink")
        line(d, (25, 43, 25, 53), "grey")
        line(d, (37, 43, 37, 53), "grey")


def illustration(name):
    im = empty(64, 64)
    d = ImageDraw.Draw(im)
    ell(d, (7, 52, 57, 61), (17, 23, 41, 52))
    if name.startswith("hair-") or name.startswith("wrap-"):
        gallery_head(d, name)
    elif name in ("clothes-cardigan", "clothes-printed-blouse", "clothes-overalls"):
        clothes_figure(d, name)
    elif name == "clothes-baiana":
        baiana(d, 9, 8)
        rect(d, (8, 57, 56, 60), "brownlight", "ink")
    elif name == "food-acaraje":
        ell(d, (3, 29, 61, 57), "paper", "ink")
        ell(d, (7, 32, 58, 52), "white", "greylight")
        food_acaraje(d, 12, 14, 40, 29)
        ell(d, (7, 42, 21, 48), "greendark", "ink")
        ell(d, (46, 39, 56, 47), "coral", "ink")
        line(d, (48, 42, 52, 41), "corallight")
    elif name == "food-abara":
        ell(d, (4, 35, 61, 57), "paper", "ink")
        ell(d, (8, 37, 58, 53), "white", "greylight")
        food_abara(d, 10, 20, 26, 24)
        food_abara(d, 31, 29, 25, 20, True)
    elif name == "food-cocada":
        rect(d, (4, 18, 59, 53), "brownlight", "ink")
        rect(d, (7, 21, 56, 49), "paper", "amberdark")
        for x in (10, 33):
            food_cocada(d, x, 25, 18, 10)
            food_cocada(d, x, 39, 18, 10, True)
        ell(d, (16, 6, 34, 19), "brown", "ink")
        ell(d, (19, 8, 32, 16), "white", "amberdark")
    elif name == "cloth-pano-da-costa":
        rect(d, (12, 8, 52, 11), "brownlight", "ink")
        line(d, (17, 11, 17, 57), "brown", 2)
        line(d, (47, 11, 47, 57), "brown", 2)
        fabric_pattern(d, (16, 11, 48, 46), "amberdark", "amberlight", "coral", 7)
        rect(d, (17, 12, 23, 44), "brown")
        line(d, (19, 13, 19, 43), "amberlight")
        line(d, (44, 13, 44, 45), "brown", 2)
        for x in range(18, 48, 3):
            line(d, (x, 47, x, 51), "amberdark")
        rect(d, (10, 54, 54, 59), "paper", "ink")
        line(d, (14, 56, 41, 56), "grey")
    elif name == "ingredients-beans-dende":
        poly(d, [(6, 30), (32, 28), (35, 52), (28, 57), (8, 57), (4, 50)], "brownlight", "ink")
        ell(d, (5, 23, 34, 36), "brown", "ink")
        for x, y in ((11, 28), (17, 26), (25, 29), (14, 32), (23, 33), (30, 30)):
            ell(d, (x-2, y-1, x+2, y+1), "paper", "amberdark")
            rect(d, (x, y, x, y), "brown")
        rect(d, (44, 10, 52, 14), "greendark", "ink")
        rect(d, (45, 15, 51, 21), "amberdark", "ink")
        poly(d, [(44, 21), (39, 26), (39, 52), (43, 56), (56, 56), (59, 52), (59, 26), (52, 21)], "coraldark", "ink")
        rect(d, (42, 28, 56, 51), "amberdark")
        line(d, (43, 29, 43, 48), "amber", 2)
        rect(d, (44, 35, 54, 43), "paper", "ink")
        ell(d, (47, 37, 51, 41), "coral", "amberdark")
    elif name == "textile-workshop":
        rect(d, (4, 38, 59, 43), "brownlight", "ink")
        rect(d, (8, 43, 12, 59), "brown", "ink")
        rect(d, (50, 43, 54, 59), "brown", "ink")
        fabric_pattern(d, (9, 33, 35, 47), "coral", "amberlight", "coraldark", 6)
        sewing(d, 23, 22)
        fabric_pattern(d, (6, 12, 17, 27), "violet", "violetlight", "violetdark", 5)
        rect(d, (7, 7, 16, 10), "brownlight", "ink")
        rect(d, (46, 9, 50, 16), "coral", "ink")
        line(d, (48, 8, 48, 18), "grey")
        line(d, (8, 55, 21, 53, 26, 57), "amberlight", 2)
    return im.resize((128, 128), Image.Resampling.NEAREST)


def preview():
    folder = ROOT / "tests" / "culture-renders"
    folder.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default()
    im = Image.new("RGB", (960, 770), "#ede5d2")
    d = ImageDraw.Draw(im)
    for i, name in enumerate(ILLUSTRATIONS):
        x, y = i%6*160, i//6*184
        with Image.open(OUT / "culture" / f"{name}.png") as art:
            im.paste(art, (x+16, y+13), art)
        d.text((x+7, y+146), name, fill="#263250", font=font)
    for i, name in enumerate(PEOPLE):
        x, y = i*312, 568
        with Image.open(OUT / "characters" / f"{name}-portrait.png") as art:
            part = art.crop((0, 0, 96, 96))
            im.paste(part, (x+8, y+4), part)
        with Image.open(OUT / "characters" / f"{name}.png") as art:
            part = art.crop((0, 0, 128, 32)).resize((256, 64), Image.Resampling.NEAREST)
            im.paste(part, (x+16, y+111), part)
        d.text((x+112, y+28), name, fill="#263250", font=font)
    im.save(folder / "gallery-and-residents.png")
    im = Image.new("RGB", (768, 390), "#ede5d2")
    d = ImageDraw.Draw(im)
    for i, name in enumerate(PROPS):
        x, y = i%8*96, i//8*126
        art = prop(name).resize((96, 96), Image.Resampling.NEAREST)
        im.paste(art, (x, y), art)
        d.text((x+3, y+100), str(i)+" "+name[:13], fill="#263250", font=font)
    im.save(folder / "culture-props.png")


def main():
    atlas = empty(384, 144)
    for i, name in enumerate(PROPS):
        atlas.alpha_composite(prop(name), ((i%8)*48, (i//8)*48))
    save(atlas, "tilesets/culture-props.png")
    for name in PEOPLE:
        sheet = empty(128, 192)
        portraits = empty(384, 96)
        for row in range(6):
            for frame in range(4):
                sheet.alpha_composite(npc_sprite(name, row, frame), (frame*32, row*32))
        for i, expression in enumerate(("neutral", "happy", "concerned", "focused")):
            portraits.alpha_composite(npc_portrait(name, expression), (i*96, 0))
        save(sheet, f"characters/{name}.png")
        save(portraits, f"characters/{name}-portrait.png")
    for name in ILLUSTRATIONS:
        save(illustration(name), f"culture/{name}.png")
    manifest = {
        "name": "VOICES — Saberes do bairro",
        "license": "CC0-1.0",
        "licenseURL": "https://creativecommons.org/publicdomain/zero/1.0/",
        "creator": "Original artwork created for the VOICES project",
        "created": "2026-10-11",
        "source": "tools/create_cultural_assets.py",
        "art": "Original code-native pixel illustrations. No downloaded photographs, traced artworks or external textures. All character identities and geometric garment prints are fictional original designs.",
        "culturalContext": "The baiana display is a contextual educational mannequin: bata, rounded skirt, torço and pano da costa. It carries no sacred bead colors or ritual objects. The three wrap compositions use descriptive names; they are not named ceremonial styles. Locs, twists, afro and braids are distinct examples, without assigning universal meanings or beliefs to their wearers.",
        "references": REFERENCES,
        "referenceUse": "Primary and institutional references informed limited physical distinctions and context before drawing. Original compositions do not reproduce an artwork, an exhibition item or a complete cultural tradition.",
        "props": {name: {"index": i, "x": i%8*48, "y": i//8*48} for i, name in enumerate(PROPS)},
        "atlas": {"path": "assets/tilesets/culture-props.png", "width": 384, "height": 144, "cellWidth": 48, "cellHeight": 48, "columns": 8, "rows": 3, "anchor": "bottom-center"},
        "characters": {name: {**META[name], "identity": "Personagem negro(a) brasileiro(a), original e fictício(a).", "sprite": f"assets/characters/{name}.png", "portrait": f"assets/characters/{name}-portrait.png"} for name in PEOPLE},
        "sprite": {"width": 128, "height": 192, "cellWidth": 32, "cellHeight": 32, "columns": 4, "rows": ["down", "left", "right", "up", "working", "greeting"]},
        "portrait": {"width": 384, "height": 96, "cellWidth": 96, "columns": {"neutral": 0, "happy": 1, "concerned": 2, "focused": 3}},
        "illustrations": {name: {"path": f"assets/culture/{name}.png", "title": data[0], "category": data[1], "references": data[2], "width": 128, "height": 128, "nativePixelGrid": 64, "original": True} for name, data in ILLUSTRATIONS.items()},
    }
    (OUT / "culture-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    preview()
    paths = [OUT / "tilesets/culture-props.png"] + [OUT / "culture" / f"{name}.png" for name in ILLUSTRATIONS] + [OUT / "characters" / f"{name}{suffix}.png" for name in PEOPLE for suffix in ("", "-portrait")]
    for path in paths:
        with Image.open(path) as im:
            assert im.mode == "RGBA", path
            extrema = im.getchannel("A").getextrema()
            assert extrema[0] == 0 and extrema[1] == 255, (path, extrema)
            expected = (384, 144) if path.name == "culture-props.png" else (128, 128) if path.parent.name == "culture" else (384, 96) if path.name.endswith("-portrait.png") else (128, 192)
            assert im.size == expected, (path, im.size, expected)
    assert Image.open(OUT / "tilesets/culture-props.png").size == (384, 144)
    print(json.dumps({"characters": len(PEOPLE), "illustrations": len(ILLUSTRATIONS), "props": len(PROPS), "pngFiles": len(paths), "alpha": "verified", "preview": str(ROOT / "tests/culture-renders")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
