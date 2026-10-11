from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "characters"
spec = importlib.util.spec_from_file_location("voices_heritage_base", ROOT / "tools" / "create_pixel_assets.py")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty

PEOPLE = {
    "history-nina": {"name": "Nina Simone", "skin": "#754431", "light": "#ad7350", "shade": "#50342b", "hair": "#282331", "hairlight": "#4e3e46", "coat": "violetdark", "accent": "amberlight", "style": "wrap", "object": "music", "wide": False, "historical": True, "reference": "https://www.ninasimone.com/biography/"},
    "history-tim": {"name": "Tim Maia", "skin": "#8b573e", "light": "#bf855a", "shade": "#613f31", "hair": "#2b2731", "hairlight": "#51434a", "coat": "coral", "accent": "amber", "style": "afro-beard", "object": "music", "wide": True, "historical": True, "reference": "https://enciclopedia.itaucultural.org.br/pessoas/4595-tim-maia"},
    "history-king": {"name": "Martin Luther King Jr.", "skin": "#9b6649", "light": "#c88d63", "shade": "#6f4735", "hair": "#292633", "hairlight": "#51414c", "coat": "navy", "accent": "paper", "style": "short-mustache", "object": "document", "wide": False, "historical": True, "reference": "https://www.nps.gov/subjects/civilrights/martin-luther-king.htm"},
    "history-machado": {"name": "Machado de Assis", "skin": "#9c704f", "light": "#cda075", "shade": "#6e4d3b", "hair": "#9ba3a7", "hairlight": "#d0d1c8", "coat": "darkgrey", "accent": "paper", "style": "gray-beard", "object": "book", "wide": False, "historical": True, "reference": "https://www.academia.org.br/academicos/machado-de-assis/biografia"},
    "history-carolina": {"name": "Carolina Maria de Jesus", "skin": "#81503a", "light": "#b27952", "shade": "#55392d", "hair": "#282631", "hairlight": "#514148", "coat": "amberdark", "accent": "amberlight", "style": "scarf", "object": "notebook", "wide": False, "historical": True, "reference": "https://ims.com.br/titular-colecao/carolina-maria-de-jesus/"},
    "history-katherine": {"name": "Katherine Johnson", "skin": "#ac7854", "light": "#dca57a", "shade": "#78513b", "hair": "#37323c", "hairlight": "#786567", "coat": "greenlight", "accent": "paper", "style": "curls-glasses", "object": "document", "wide": False, "historical": True, "reference": "https://www.nasa.gov/image-article/katherine-johnson-portrait/"},
    "mila": {"name": "Mila", "skin": "#6d402f", "light": "#a46749", "shade": "#47302a", "hair": "#292431", "hairlight": "#5b434b", "coat": "cyandark", "accent": "cyanlight", "style": "twists", "object": "music", "wide": False, "historical": False, "occupation": "Educadora musical e guitarrista", "identity": "Personagem negra brasileira original e fictícia."},
    "ravi": {"name": "Ravi", "skin": "#a36e4b", "light": "#d6996b", "shade": "#704931", "hair": "#302632", "hairlight": "#65505a", "coat": "amberdark", "accent": "amberlight", "style": "short-curls", "object": "book", "wide": False, "historical": False, "occupation": "Livreiro e mediador de leitura", "identity": "Personagem negro brasileiro original e fictício."},
}


def save(im, name):
    OUT.mkdir(parents=True, exist_ok=True)
    im.save(OUT / name, optimize=True)


def sprite_hair(d, p, direction, bob):
    h, hi, style = p["hair"], p["hairlight"], p["style"]
    back, side = direction == 3, direction == 1
    if style == "wrap":
        ell(d, (9, bob, 23, 11+bob), "violetdark", "ink")
        poly(d, [(10, 6+bob), (12, 1+bob), (19, bob), (23, 5+bob), (21, 9+bob), (11, 10+bob)], "violet", "ink")
        line(d, (12, 3+bob, 20, 5+bob, 22, 7+bob), "violetlight")
        line(d, (11, 6+bob, 18, 8+bob), "violetdark")
        if not back:
            ell(d, (21, 12+bob, 23, 15+bob), "amber", "amberdark")
    elif style == "scarf":
        ell(d, (9, 2+bob, 23, 10+bob), "paper", "ink")
        line(d, (11, 5+bob, 18, 7+bob, 22, 6+bob), "coral", 2)
        line(d, (13, 3+bob, 21, 4+bob), "amberdark")
        poly(d, [(21, 7+bob), (24, 8+bob), (24, 13+bob), (22, 11+bob)], "paper", "ink")
    elif style == "afro-beard":
        ell(d, (7, 1+bob, 24, 13+bob), h, "ink")
        for x, y in ((9, 5), (12, 3), (17, 2), (21, 4), (23, 7)):
            rect(d, (x, y+bob, x+1, y+bob), hi)
        if not back:
            ell(d, (10 if side else 9, 7+bob, 20 if side else 22, 15+bob), p["skin"], "ink")
            rect(d, (11, 8+bob, 12, 11+bob), p["light"])
            poly(d, [(10, 12+bob), (14, 13+bob), (18, 12+bob), (21, 11+bob), (20, 16+bob), (15, 18+bob), (11, 15+bob)], h, "ink")
            line(d, (13, 16+bob, 17, 16+bob), hi)
    elif style == "twists":
        ell(d, (10, 2+bob, 22, 10+bob), h, "ink")
        for x in (9, 12, 15, 18, 21):
            bottom = 17 if x in (9, 21) else 7
            rect(d, (x, 4+bob, x+2, bottom+bob), h, "ink")
            for y in range(5, bottom, 3):
                line(d, (x+1, y+bob, x+2, y+1+bob), hi)
        rect(d, (9, 15+bob, 10, 15+bob), "amber")
        rect(d, (21, 16+bob, 22, 16+bob), "amber")
    elif style in ("short-curls", "curls-glasses"):
        ell(d, (10, 3+bob, 22, 9+bob), h, "ink")
        for x, y in ((11, 5), (14, 4), (17, 4), (20, 5), (22, 7)):
            ell(d, (x-1, y-1+bob, x+1, y+1+bob), h)
            rect(d, (x, y-1+bob, x, y-1+bob), hi)
        if back:
            ell(d, (10, 5+bob, 22, 14+bob), h, "ink")
            for x, y in ((12, 8), (17, 7), (20, 10), (15, 12)):
                rect(d, (x, y+bob, x, y+bob), hi)
    else:
        ell(d, (10, 3+bob, 22, 9+bob), h, "ink")
        line(d, (12, 5+bob, 19, 5+bob), hi)
        if style == "gray-beard":
            rect(d, (14, 4+bob, 19, 6+bob), p["skin"])
        if back:
            ell(d, (10, 5+bob, 22, 14+bob), h, "ink")
            line(d, (12, 8+bob, 20, 8+bob), hi)


def held_object(d, p, frame):
    y = 15 + (0, -1, 0, 1)[frame]
    if p["object"] == "music":
        ell(d, (24, y-6, 27, y-3), "darkgrey", "ink")
        line(d, (25, y-2, 25, y+3), "grey", 2)
        line(d, (24, y-5, 26, y-5), "greylight")
    elif p["object"] == "book":
        rect(d, (23, y-4, 30, y+3), "greendark", "ink")
        line(d, (24, y-3, 24, y+2), "greenlight")
        rect(d, (26, y-2, 28, y-1), "amberlight")
        line(d, (25, y+2, 29, y+2), "paper")
    else:
        rect(d, (23, y-4, 30, y+3), "brownlight" if p["object"] == "notebook" else "paper", "ink")
        rect(d, (24, y-3, 29, y+2), "paper")
        for yy in range(y-2, y+2, 2):
            line(d, (25, yy, 28, yy), "grey")
        line(d, (30, y-3, 27, y+1), "amberdark")


def sprite(p, row, frame):
    direction = row if row < 4 else 0
    side = direction in (1, 2)
    ddir = 1 if side else direction
    im = empty()
    d = ImageDraw.Draw(im)
    bob = 1 if row < 4 and frame in (1, 3) else 0
    stride = (0, 1, 0, -1)[frame] if row < 4 else 0
    wide = p["wide"]
    left, right = (7, 24) if wide else (10, 21)
    if side:
        left, right = (8, 23) if wide else (11, 20)
    ell(d, (6 if wide else 8, 28, 26 if wide else 24, 31), (17, 23, 41, 64))
    for x, sy in ((11, max(0, stride)), (17, max(0, -stride))):
        rect(d, (x, 23, x+3, 27+sy), "navy", "ink")
        rect(d, (x-1, 27+sy, x+3, 29+sy), "ink")
        rect(d, (x, 27+sy, x+3, 27+sy), "grey")
    poly(d, [(left+1, 16+bob), (right-1, 16+bob), (right+1, 19+bob), (right, 25), (left, 25), (left-1, 19+bob)], p["coat"], "ink")
    line(d, (left+2, 18+bob, left+2, 23), p["accent"])
    rect(d, (14, 14+bob, 17, 17+bob), p["skin"], "ink")
    if direction != 3:
        if p["style"] in ("short-mustache", "gray-beard"):
            poly(d, [(13, 17+bob), (18, 17+bob), (17, 23), (14, 23)], "paper")
            poly(d, [(15, 18+bob), (17, 18+bob), (18, 23), (16, 24), (14, 23)], "coraldark" if p["style"] == "short-mustache" else "navy")
            line(d, (left+2, 17+bob, 14, 21), "darkgrey")
            line(d, (right-2, 17+bob, 18, 21), "darkgrey")
        elif p["wide"]:
            line(d, (15, 18+bob, 15, 23), "coraldark")
            rect(d, (19, 19+bob, 21, 21+bob), "amberdark")
            for x, yy in ((9, 19), (12, 23), (21, 23)):
                rect(d, (x, yy, x+1, yy), "amberlight")
        elif p["style"] == "scarf":
            for x, yy in ((12, 18+bob), (18, 19+bob), (15, 22)):
                rect(d, (x, yy, x+1, yy+1), "paper")
                rect(d, (x+1, yy, x+1, yy), "coral")
        elif p["style"] == "curls-glasses":
            line(d, (13, 17+bob, 16, 19+bob, 19, 17+bob), "paper")
            rect(d, (16, 21, 16, 23), "greendark")
        elif p["style"] == "short-curls":
            rect(d, (13, 17+bob, 18, 24), "amberlight")
            line(d, (12, 18+bob, 12, 24), "brown")
            line(d, (19, 18+bob, 19, 24), "brown")
        elif p["style"] == "twists":
            line(d, (12, 17+bob, 20, 23), "amberdark", 2)
            rect(d, (16, 20, 17, 20), "amberlight")
    if direction == 3:
        line(d, (14, 19+bob, 17, 19+bob), "navylight")
    if side:
        face = (9, 5+bob, 21, 15+bob)
    else:
        face = (9, 5+bob, 22, 15+bob) if wide else (10, 5+bob, 21, 15+bob)
    ell(d, face, p["skin"], "ink")
    rect(d, (11, 8+bob, 13, 11+bob), p["light"])
    rect(d, (19, 11+bob, 21, 13+bob), p["shade"])
    sprite_hair(d, p, ddir, bob)
    if direction != 3:
        if side:
            rect(d, (10, 10+bob, 11, 11+bob), "ink")
            rect(d, (8, 11+bob, 9, 12+bob), p["skin"], "ink")
            line(d, (10, 14+bob, 13, 14+bob), p["shade"])
        else:
            for x in (12, 18):
                rect(d, (x, 10+bob, x+1, 11+bob), "ink")
                rect(d, (x+1, 10+bob, x+1, 10+bob), "paper")
            line(d, (14, 14+bob, 17, 14+bob), p["shade"])
        if p["style"] == "short-mustache":
            line(d, (11 if side else 14, 13+bob, 14 if side else 18, 13+bob), p["hair"])
        elif p["style"] == "gray-beard":
            poly(d, [(10 if side else 11, 12+bob), (14, 14+bob), (20, 12+bob), (19, 17+bob), (14, 18+bob), (11, 15+bob)], p["hair"], "ink")
            line(d, (13, 15+bob, 17, 16+bob), p["hairlight"])
            line(d, (13, 13+bob, 17, 13+bob), p["shade"])
        if p["style"] in ("gray-beard", "curls-glasses"):
            if side:
                rect(d, (9, 9+bob, 13, 12+bob), None, "ink")
                line(d, (14, 10+bob, 19, 9+bob), "darkgrey")
            else:
                rect(d, (11, 9+bob, 15, 12+bob), None, "ink")
                rect(d, (17, 9+bob, 21, 12+bob), None, "ink")
                line(d, (15, 10+bob, 17, 10+bob), "ink")
    motion = (0, 1, 0, -1)[frame]
    for x, dy in ((left-2, motion), (right+1, -motion)):
        rect(d, (x, 18+bob, x+2, 22+bob+dy), p["coat"], "ink")
        rect(d, (x, 22+bob+dy, x+2, 24+bob+dy), p["skin"], "ink")
    if row == 4:
        rect(d, (21, 16, 24, 20), p["coat"], "ink")
        held_object(d, p, frame)
        rect(d, (22, 18, 24, 20), p["skin"], "ink")
    elif row == 5:
        rect(d, (23, 17, 25, 21), p["coat"], "ink")
        rect(d, (24, 12+frame%2, 26, 17+frame%2), p["skin"], "ink")
        rect(d, (25, 13+frame%2, 25, 15+frame%2), p["light"])
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if direction == 2 else im


def portrait_hair(d, p):
    h, hi, style = p["hair"], p["hairlight"], p["style"]
    if style == "wrap":
        ell(d, (10, 0, 38, 17), "violetdark", "ink")
        poly(d, [(11, 9), (16, 1), (27, 0), (36, 5), (38, 12), (35, 16), (13, 16)], "violet", "ink")
        line(d, (16, 4, 27, 7, 36, 9), "violetlight", 2)
        line(d, (13, 9, 27, 12, 36, 12), "violetdark", 2)
        line(d, (14, 14, 33, 15), "amberdark")
        ell(d, (11, 24, 15, 29), "amber", "amberdark")
        ell(d, (34, 24, 38, 29), "amber", "amberdark")
    elif style == "scarf":
        ell(d, (10, 2, 37, 18), "paper", "ink")
        poly(d, [(12, 12), (16, 4), (29, 3), (35, 9), (35, 15), (13, 17)], "white", "ink")
        line(d, (14, 6, 21, 9, 34, 10), "coral", 2)
        line(d, (13, 12, 26, 14, 35, 12), "amberdark")
        poly(d, [(33, 10), (39, 12), (40, 21), (35, 18)], "paper", "ink")
        line(d, (36, 14, 38, 18), "coral")
    elif style == "twists":
        ell(d, (12, 4, 36, 15), h, "ink")
        for x, bottom in ((11, 31), (15, 18), (19, 14), (23, 14), (27, 15), (31, 19), (35, 32)):
            rect(d, (x, 7, x+3, bottom), h, "ink")
            for y in range(8, bottom, 4):
                line(d, (x+1, y, x+2, y+1), hi)
                rect(d, (x+1, y+2, x+1, y+2), hi)
        rect(d, (11, 27, 13, 28), "amberdark")
        rect(d, (35, 29, 37, 30), "amber")
    elif style == "afro-beard":
        ell(d, (7, 1, 41, 24), h, "ink")
        for x, y in ((10, 10), (13, 5), (20, 3), (28, 4), (36, 8), (39, 14)):
            rect(d, (x, y, x+2, y+1), hi)
        ell(d, (12, 10, 36, 34), p["skin"], "ink")
        poly(d, [(13, 18), (16, 12), (24, 11), (23, 15), (17, 18), (16, 26), (14, 26)], p["light"])
        poly(d, [(14, 26), (19, 29), (27, 29), (34, 25), (34, 32), (29, 37), (21, 37), (15, 32)], h, "ink")
        line(d, (19, 33, 27, 34, 31, 32), hi)
    elif style in ("short-curls", "curls-glasses"):
        ell(d, (12, 5, 36, 15), h, "ink")
        for x, y in ((13, 11), (17, 7), (22, 6), (27, 7), (32, 9), (35, 13)):
            ell(d, (x-2, y-2, x+2, y+2), h)
            rect(d, (x-1, y-1, x, y-1), hi)
        line(d, (12, 13, 12, 20), h, 2)
        line(d, (35, 13, 35, 20), h, 2)
    else:
        poly(d, [(12, 17), (11, 10), (16, 5), (29, 4), (36, 9), (36, 17), (32, 14), (29, 10), (19, 9), (16, 14)], h, "ink")
        line(d, (16, 8, 23, 7, 31, 9), hi)
        if style == "gray-beard":
            poly(d, [(18, 7), (24, 5), (30, 7), (29, 12), (21, 12)], p["skin"])
            poly(d, [(14, 26), (19, 29), (29, 29), (35, 24), (33, 32), (28, 37), (21, 37), (16, 33)], h, "ink")
            line(d, (17, 29, 21, 34, 28, 34, 31, 29), hi)


def portrait(p, expression):
    im = empty(48, 48)
    d = ImageDraw.Draw(im)
    wide = p["wide"]
    left, right = (4, 44) if wide else (8, 40)
    poly(d, [(left, 47), (left, 41), (left+5, 36), (20, 33), (28, 33), (right-5, 36), (right, 41), (right, 47)], p["coat"], "ink")
    rect(d, (20, 29, 28, 36), p["skin"], "ink")
    rect(d, (20, 31, 28, 33), p["shade"])
    ell(d, (11, 19, 16, 26), p["skin"], "ink")
    ell(d, (33, 19, 38, 26), p["skin"], "ink")
    ell(d, (14, 8, 34, 34), p["skin"], "ink")
    poly(d, [(15, 16), (18, 11), (25, 10), (24, 14), (18, 17), (17, 25), (15, 26)], p["light"])
    poly(d, [(32, 17), (34, 23), (32, 29), (28, 33), (23, 33), (27, 29), (30, 26)], p["shade"])
    portrait_hair(d, p)
    style = p["style"]
    if style in ("gray-beard", "short-mustache"):
        poly(d, [(19, 35), (24, 39), (29, 35), (29, 47), (19, 47)], "paper")
        poly(d, [(22, 38), (26, 38), (28, 46), (24, 47), (20, 46)], "coraldark" if style == "short-mustache" else "navy", "ink")
        poly(d, [(13, 36), (19, 34), (23, 39), (17, 43)], p["coat"], "ink")
        poly(d, [(29, 34), (35, 36), (31, 43), (25, 39)], p["coat"], "ink")
        if style == "short-mustache":
            line(d, (20, 27, 23, 26, 28, 27), p["hair"], 2)
    elif style == "scarf":
        for x, y in ((12, 39), (18, 43), (30, 39), (34, 44)):
            poly(d, [(x, y-2), (x+2, y), (x, y+2), (x-2, y)], "paper")
            rect(d, (x, y, x, y), "coral")
        rect(d, (7, 40, 16, 47), "brown", "ink")
        rect(d, (9, 42, 15, 46), "paper")
        line(d, (10, 43, 14, 43), "grey")
        line(d, (10, 45, 14, 45), "grey")
    elif style == "curls-glasses":
        line(d, (18, 35, 24, 38, 30, 35), "paper", 2)
        rect(d, (24, 41, 24, 44), "greendark")
        rect(d, (31, 42, 41, 47), "paper", "ink")
        line(d, (33, 44, 39, 44), "grey")
        line(d, (33, 46, 39, 46), "grey")
    elif style == "short-curls":
        poly(d, [(19, 35), (24, 37), (29, 35), (29, 47), (19, 47)], "amberlight")
        line(d, (18, 36, 18, 47), "brown")
        line(d, (30, 36, 30, 47), "brown")
        rect(d, (31, 41, 41, 47), "greendark", "ink")
        rect(d, (34, 42, 39, 43), "amberlight")
        line(d, (33, 46, 40, 46), "paper")
    elif style == "twists":
        line(d, (15, 35, 32, 47), "amberdark", 3)
        line(d, (16, 35, 32, 46), "amberlight")
        rect(d, (11, 42, 13, 46), "cyanlight")
    elif style == "wrap":
        line(d, (17, 35, 21, 38, 28, 38, 32, 35), "amber", 2)
        line(d, (13, 41, 13, 46), "violet")
        line(d, (35, 41, 35, 46), "violet")
    elif wide:
        line(d, (22, 37, 22, 47), "coraldark", 2)
        rect(d, (32, 40, 37, 43), "amberdark", "ink")
        line(d, (14, 36, 18, 41, 23, 36), "amberlight")
        line(d, (25, 36, 28, 41, 32, 36), "amberlight")
        for x, y in ((8, 43), (15, 45), (39, 45)):
            rect(d, (x, y, x+1, y), "amberlight")
    if expression == "happy":
        line(d, (17, 22, 19, 21, 21, 22), "ink")
        line(d, (27, 22, 29, 21, 31, 22), "ink")
    else:
        for x in (17, 27):
            rect(d, (x, 21, x+4, 23), "white")
            rect(d, (x+2, 21, x+3, 24), "ink")
            rect(d, (x+2, 21, x+2, 21), "paper")
        if expression == "concerned":
            line(d, (17, 19, 21, 20), p["hair"])
            line(d, (27, 20, 31, 19), p["hair"])
        else:
            line(d, (17, 19, 21, 19), p["hair"])
            line(d, (27, 19, 31, 19), p["hair"])
    if style in ("gray-beard", "curls-glasses"):
        rect(d, (16, 20, 22, 25), None, "ink")
        rect(d, (26, 20, 32, 25), None, "ink")
        line(d, (22, 22, 26, 22), "ink")
        line(d, (13, 21, 16, 22), "darkgrey")
        line(d, (32, 22, 35, 21), "darkgrey")
    mouth_y = 31 if style in ("gray-beard", "afro-beard") else 29
    if expression == "happy":
        line(d, (21, mouth_y-1, 23, mouth_y, 26, mouth_y, 28, mouth_y-1), "paper" if style in ("gray-beard", "afro-beard") else p["shade"])
    elif expression == "concerned":
        line(d, (21, mouth_y, 23, mouth_y-1, 26, mouth_y-1, 28, mouth_y), p["shade"])
    else:
        line(d, (22, mouth_y, 27, mouth_y), "paper" if style in ("gray-beard", "afro-beard") else p["shade"])
    return im.resize((96, 96), Image.Resampling.NEAREST)


def preview():
    im = Image.new("RGBA", (816, 432), base.color("ink"))
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    for i, (name, p) in enumerate(PEOPLE.items()):
        x, y = 8+(i%4)*204, 8+(i//4)*212
        rect(d, (x, y, x+195, y+202), "navy", "navylight")
        d.text((x+7, y+5), p["name"], font=font, fill=base.color("paper"))
        im.alpha_composite(portrait(p, "neutral"), (x+6, y+26))
        im.alpha_composite(portrait(p, "happy"), (x+100, y+26))
        for row in range(4):
            im.alpha_composite(sprite(p, row, 0).resize((40, 40), Image.Resampling.NEAREST), (x+6+row*47, y+128))
        for state in range(2):
            im.alpha_composite(sprite(p, 4+state, 1), (x+16+state*60, y+168))
    path = ROOT / "tests" / "heritage-assets-preview.png"
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, optimize=True)
    return str(path)


def main():
    for name, p in PEOPLE.items():
        sheet = empty(128, 192)
        portraits = empty(288, 96)
        for row in range(6):
            for frame in range(4):
                sheet.alpha_composite(sprite(p, row, frame), (frame*32, row*32))
        for i, expression in enumerate(("neutral", "happy", "concerned")):
            portraits.alpha_composite(portrait(p, expression), (i*96, 0))
        save(sheet, name+".png")
        save(portraits, name+"-portrait.png")
        assert sheet.mode == portraits.mode == "RGBA"
        assert sheet.getchannel("A").getextrema() == (0, 255)
        assert portraits.getchannel("A").getextrema() == (0, 255)
        assert len({sheet.crop((i*32, j*32, i*32+32, j*32+32)).tobytes() for j in range(6) for i in range(4)}) >= 12
    manifest = {
        "name": "VOICES — Pessoas, memória e criação",
        "license": "CC0-1.0",
        "licenseURL": "https://creativecommons.org/publicdomain/zero/1.0/",
        "creator": "Original pixel illustrations created for VOICES",
        "created": "2026-10-11",
        "source": "tools/create_heritage_characters.py",
        "art": "Original simplified educational pixel illustrations; no photographs, traced artwork, external textures, logos or copied portraits.",
        "historicalUse": "Historical figures are labeled educational exhibit illustrations with third-person biography. They do not deliver invented first-person speech, endorsements or attributed quotations. Clothing depicts an original illustrative interpretation, not an authenticated outfit or sacred costume.",
        "sprite": {"width": 128, "height": 192, "cellWidth": 32, "cellHeight": 32, "columns": 4, "rows": ["down", "left", "right", "up", "interaction", "greeting"]},
        "portrait": {"width": 288, "height": 96, "cellWidth": 96, "cellHeight": 96, "nativePixelGrid": 48, "columns": {"neutral": 0, "happy": 1, "concerned": 2}},
        "characters": {name: {"name": p["name"], "historical": p["historical"], "identity": "Original educational illustration of a historical figure." if p["historical"] else p["identity"], "role": "Stationary educational portrait exhibit" if p["historical"] else p["occupation"], "sprite": "assets/characters/"+name+".png", "portrait": "assets/characters/"+name+"-portrait.png", **({"reference": p["reference"]} if p.get("reference") else {})} for name, p in PEOPLE.items()},
    }
    (OUT / "heritage-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps({"characters": len(PEOPLE), "pngFiles": len(PEOPLE)*2, "spriteSize": [128, 192], "portraitSize": [288, 96], "alpha": "verified", "preview": preview()}, ensure_ascii=False))


if __name__ == "__main__":
    main()
