from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("voices_scene_palette", ROOT / "tools" / "create_pixel_assets.py")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty

PROPS = [
    ("bench-south", "Banco voltado ao sul", "convívio"),
    ("bench-north", "Banco voltado ao norte", "convívio"),
    ("bench-east", "Banco voltado a leste", "convívio"),
    ("bench-west", "Banco voltado a oeste", "convívio"),
    ("low-reading-table", "Mesa baixa de leitura", "biblioteca"),
    ("desk-returns", "Balcão de devoluções", "biblioteca"),
    ("study-desk", "Mesa de estudo", "biblioteca"),
    ("round-cafe-table", "Mesa de café", "convívio"),
    ("stage-platform", "Tablado de apresentações", "música"),
    ("instrument-storage", "Estante de instrumentos", "música"),
    ("cable-mat", "Passagem protegida de cabos", "música"),
    ("music-station", "Mesa de gravação", "música"),
    ("stall-fruit-counter", "Banca de frutas", "feira"),
    ("stall-food-counter", "Tabuleiro de comidas", "feira"),
    ("stall-cloth-counter", "Banca de tecidos", "feira"),
    ("workshop-hair-counter", "Balcão da trancista", "feira"),
    ("garden-tool-rack", "Suporte de ferramentas", "horta"),
    ("compost-bin", "Composteira fechada", "horta"),
    ("water-barrel", "Reservatório da horta", "horta"),
    ("seed-workbench", "Mesa de sementes", "horta"),
    ("exhibition-plinth", "Base de exposição", "museu"),
    ("museum-label-stand", "Legenda de exposição", "museu"),
    ("archive-workbench", "Mesa de conservação", "arquivo"),
    ("catalog-cabinet", "Fichário de catálogo", "arquivo"),
    ("lab-workbench", "Bancada de laboratório", "ciência"),
    ("observation-table", "Mesa de observação", "ciência"),
    ("newsroom-desk", "Mesa da redação", "jornalismo"),
    ("interview-table", "Mesa de entrevista", "jornalismo"),
    ("assembly-table", "Mesa da assembleia", "comunidade"),
    ("public-catalog-desk", "Balcão do catálogo", "arquivo"),
    ("shade-pergola", "Pergolado de sombra", "convívio"),
    ("planter-border", "Borda de canteiro", "horta"),
]


def shadow(d, bounds=(3, 27, 29, 30)):
    ell(d, bounds, (17, 23, 41, 40))


def table(d, top=13, bottom=22, wood="brownlight", skirt="brown"):
    rect(d, (5, bottom, 7, 28), skirt, "ink")
    rect(d, (24, bottom, 26, 28), skirt, "ink")
    rect(d, (3, top, 28, bottom), wood, "ink")
    rect(d, (3, bottom-3, 28, bottom), skirt, "ink")
    line(d, (5, top+1, 26, top+1), "amberlight")
    line(d, (5, bottom-2, 26, bottom-2), wood)


def book(d, x, y, tint="violet", open=False):
    if open:
        poly(d, [(x, y), (x+5, y+1), (x+10, y), (x+10, y+6), (x+5, y+7), (x, y+6)], "paper", "ink")
        line(d, (x+5, y+1, x+5, y+6), "grey")
        line(d, (x+1, y+2, x+3, y+2), "navylight")
        line(d, (x+7, y+3, x+9, y+3), "navylight")
    else:
        rect(d, (x, y, x+6, y+5), tint, "ink")
        rect(d, (x+1, y+3, x+5, y+4), "paper")
        line(d, (x+1, y+1, x+4, y+1), "white")


def paper(d, x, y, width=8, height=7, tint="paper"):
    rect(d, (x, y, x+width, y+height), tint, "ink")
    for row in range(y+2, y+height, 2):
        line(d, (x+2, row, x+width-2, row), "grey")


def cup(d, x, y, tint="white"):
    ell(d, (x+4, y+1, x+6, y+4), None, "ink")
    rect(d, (x, y, x+4, y+5), tint, "ink")
    line(d, (x+1, y+1, x+3, y+1), "amberdark")


def plant(d, x, y):
    rect(d, (x-2, y+3, x+2, y+6), "coral", "ink")
    line(d, (x, y+3, x, y-2), "greendark")
    poly(d, [(x-1, y+1), (x-4, y), (x-4, y-2), (x-1, y-1)], "green", "greendark")
    poly(d, [(x, y-1), (x+2, y-3), (x+4, y-2), (x+2, y)], "greenlight", "greendark")


def bench(direction):
    im = empty()
    d = ImageDraw.Draw(im)
    shadow(d, (3, 25, 29, 29))
    if direction == "south":
        rect(d, (5, 19, 7, 27), "navy", "ink")
        rect(d, (24, 19, 26, 27), "navy", "ink")
        rect(d, (4, 7, 6, 22), "navy", "ink")
        rect(d, (25, 7, 27, 22), "navy", "ink")
        rect(d, (3, 7, 28, 13), "brown", "ink")
        line(d, (5, 8, 26, 8), "brownlight")
        line(d, (5, 11, 26, 11), "brownlight")
        rect(d, (3, 17, 28, 22), "brownlight", "ink")
        line(d, (5, 18, 26, 18), "amberlight")
        line(d, (5, 20, 26, 20), "brown")
        line(d, (2, 15, 7, 15, 7, 19), "navy", 2)
        line(d, (24, 19, 24, 15, 29, 15), "navy", 2)
    elif direction == "north":
        rect(d, (5, 16, 7, 27), "navy", "ink")
        rect(d, (24, 16, 26, 27), "navy", "ink")
        rect(d, (3, 10, 28, 16), "brownlight", "ink")
        line(d, (5, 11, 26, 11), "amberlight")
        line(d, (5, 13, 26, 13), "brown")
        rect(d, (4, 15, 6, 25), "navy", "ink")
        rect(d, (25, 15, 27, 25), "navy", "ink")
        rect(d, (3, 18, 28, 25), "brown", "ink")
        line(d, (5, 19, 26, 19), "brownlight")
        line(d, (5, 22, 26, 22), "brownlight")
        line(d, (2, 14, 7, 14), "navy", 2)
        line(d, (24, 14, 29, 14), "navy", 2)
    else:
        rect(d, (9, 21, 11, 27), "navy", "ink")
        rect(d, (22, 21, 24, 27), "navy", "ink")
        rect(d, (7, 7, 11, 24), "brown", "ink")
        line(d, (8, 9, 8, 22), "brownlight")
        rect(d, (11, 17, 25, 22), "brownlight", "ink")
        line(d, (12, 18, 23, 18), "amberlight")
        line(d, (13, 20, 23, 20), "brown")
        line(d, (10, 14, 25, 14, 25, 18), "navy", 2)
        rect(d, (7, 22, 10, 26), "navy", "ink")
        if direction == "west":
            im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return im


def prop(name):
    if name.startswith("bench-"):
        return bench(name.split("-")[-1])
    im = empty()
    d = ImageDraw.Draw(im)
    if name == "low-reading-table":
        shadow(d, (3, 25, 29, 28))
        table(d, 12, 20)
        book(d, 6, 8, open=True)
        cup(d, 22, 10, "cyandark")
    elif name == "desk-returns":
        shadow(d)
        rect(d, (3, 12, 28, 28), "brown", "ink")
        rect(d, (3, 12, 28, 16), "brownlight", "ink")
        line(d, (5, 13, 26, 13), "amberlight")
        rect(d, (6, 18, 19, 25), "navy", "ink")
        rect(d, (8, 20, 17, 23), "paper", "grey")
        rect(d, (22, 19, 25, 23), "amber", "ink")
        book(d, 6, 7, "coral")
        book(d, 7, 4, "violet")
        rect(d, (21, 5, 27, 11), "paper", "ink")
        line(d, (23, 7, 25, 7), "cyandark")
        line(d, (24, 9, 25, 8, 24, 7), "cyandark")
    elif name == "study-desk":
        shadow(d)
        table(d)
        book(d, 5, 8, open=True)
        line(d, (21, 14, 21, 8, 24, 5), "grey", 2)
        poly(d, [(20, 3), (27, 4), (27, 8), (18, 7)], "amber", "ink")
        line(d, (19, 7, 26, 8), "amberlight")
        rect(d, (23, 11, 25, 14), "coral", "ink")
    elif name == "round-cafe-table":
        shadow(d, (6, 26, 27, 30))
        rect(d, (15, 17, 17, 28), "brown", "ink")
        line(d, (16, 27, 8, 29), "brown", 2)
        line(d, (16, 27, 25, 29), "brown", 2)
        ell(d, (3, 10, 29, 21), "brown", "ink")
        ell(d, (3, 8, 29, 18), "brownlight", "ink")
        line(d, (7, 10, 14, 10), "amberlight")
        cup(d, 8, 8)
        cup(d, 22, 9, "coral")
        ell(d, (15, 11, 20, 14), "paper", "ink")
        rect(d, (17, 12, 18, 12), "amber")
    elif name == "stage-platform":
        shadow(d, (2, 26, 29, 30))
        poly(d, [(3, 7), (28, 7), (30, 21), (1, 21)], "brownlight", "ink")
        for x in (7, 13, 19, 25):
            line(d, (x, 8, x-1, 20), "brown")
        line(d, (5, 9, 27, 9), "amberlight")
        rect(d, (1, 21, 30, 25), "brown", "ink")
        line(d, (4, 23, 27, 23), "amberdark")
        rect(d, (11, 25, 21, 28), "brownlight", "ink")
        line(d, (12, 26, 20, 26), "amberlight")
    elif name == "instrument-storage":
        shadow(d)
        rect(d, (3, 3, 28, 29), "brown", "ink")
        rect(d, (5, 5, 26, 26), "navy", "ink")
        rect(d, (7, 5, 14, 26), "navylight", "ink")
        ell(d, (7, 16, 14, 24), "amberdark", "ink")
        ell(d, (8, 12, 13, 18), "amber", "ink")
        rect(d, (10, 6, 11, 18), "brownlight", "ink")
        rect(d, (9, 5, 12, 8), "brownlight", "ink")
        ell(d, (10, 18, 12, 20), "navy")
        line(d, (11, 7, 11, 23), "paper")
        rect(d, (18, 7, 23, 23), "violetdark", "ink")
        rect(d, (19, 9, 22, 18), "violet", "ink")
        rect(d, (23, 13, 24, 15), "amber")
        rect(d, (4, 26, 27, 28), "brownlight", "ink")
    elif name == "cable-mat":
        shadow(d, (2, 23, 29, 26))
        poly(d, [(4, 12), (27, 12), (30, 23), (1, 23)], "darkgrey", "ink")
        for y in (15, 18, 21):
            line(d, (4, y, 27, y), "grey")
        rect(d, (5, 16, 26, 19), "navy", "ink")
        line(d, (1, 17, 7, 17), "navy", 2)
        line(d, (25, 17, 30, 17), "navy", 2)
        rect(d, (4, 13, 6, 15), "amber")
        rect(d, (25, 21, 27, 22), "amber")
    elif name == "music-station":
        shadow(d)
        table(d, 14, 23)
        rect(d, (7, 4, 20, 13), "navy", "ink")
        rect(d, (9, 6, 18, 11), "cyandark")
        line(d, (10, 9, 11, 9, 12, 7, 13, 10, 14, 8, 16, 8), "cyanlight")
        rect(d, (12, 13, 15, 15), "grey", "ink")
        rect(d, (7, 16, 24, 20), "navy", "ink")
        for x in (9, 12, 15, 18):
            rect(d, (x, 17, x, 18), "greylight")
            rect(d, (x, 20, x, 20), "cyan" if x < 15 else "coral")
        rect(d, (22, 7, 27, 13), "navylight", "ink")
        ell(d, (23, 9, 26, 12), "navy", "ink")
        line(d, (23, 23, 23, 26, 18, 26, 18, 29), "navy")
    elif name in ("stall-fruit-counter", "stall-food-counter", "stall-cloth-counter", "workshop-hair-counter"):
        shadow(d)
        rect(d, (3, 13, 28, 28), "brown", "ink")
        rect(d, (2, 12, 29, 17), "brownlight", "ink")
        line(d, (4, 13, 27, 13), "amberlight")
        rect(d, (5, 19, 26, 26), "paper" if name == "stall-food-counter" else "greendark" if name == "stall-fruit-counter" else "coraldark" if name == "stall-cloth-counter" else "violetdark", "ink")
        line(d, (7, 20, 24, 20), "white" if name == "stall-food-counter" else "greenlight" if name == "stall-fruit-counter" else "coral" if name == "stall-cloth-counter" else "violetlight")
        rect(d, (12, 22, 20, 25), "paper", "ink")
        line(d, (14, 23, 18, 23), "navylight")
        if name == "stall-fruit-counter":
            rect(d, (5, 6, 13, 12), "brownlight", "ink")
            rect(d, (16, 6, 26, 12), "brownlight", "ink")
            for x, y, tint in [(7, 7, "coral"), (11, 8, "coral"), (19, 7, "amber"), (24, 8, "greenlight")]:
                ell(d, (x-2, y-2, x+2, y+2), tint, "ink")
                rect(d, (x, y-3, x, y-2), "greendark")
            line(d, (5, 10, 13, 10), "brown")
            line(d, (16, 10, 26, 10), "brown")
        elif name == "stall-food-counter":
            ell(d, (5, 7, 13, 12), "white", "ink")
            ell(d, (7, 7, 11, 10), "amberdark", "ink")
            rect(d, (8, 8, 10, 8), "amber")
            poly(d, [(16, 8), (18, 5), (22, 6), (24, 10), (21, 12), (17, 11)], "green", "ink")
            line(d, (18, 7, 22, 10), "greenlight")
            line(d, (20, 6, 18, 11), "brownlight")
            rect(d, (24, 7, 27, 12), "paper", "ink")
            rect(d, (25, 8, 26, 10), "amberlight")
        elif name == "stall-cloth-counter":
            rect(d, (5, 10, 17, 13), "violet", "ink")
            line(d, (6, 11, 15, 11), "violetlight")
            rect(d, (7, 7, 19, 10), "coral", "ink")
            line(d, (9, 8, 17, 8), "amberlight")
            rect(d, (21, 5, 25, 11), "green", "ink")
            ell(d, (21, 4, 25, 6), "greenlight", "ink")
            line(d, (23, 6, 23, 10), "greendark")
        else:
            rect(d, (5, 5, 8, 12), "coral", "ink")
            rect(d, (6, 3, 7, 5), "grey", "ink")
            rect(d, (12, 6, 14, 12), "cyandark", "ink")
            rect(d, (12, 5, 14, 6), "paper", "ink")
            rect(d, (19, 8, 26, 10), "amberdark", "ink")
            for x in (20, 22, 24, 26):
                line(d, (x, 9, x, 12), "amberdark")
            line(d, (19, 5, 22, 8, 26, 5), "grey")
    elif name == "garden-tool-rack":
        shadow(d)
        rect(d, (4, 5, 6, 28), "brown", "ink")
        rect(d, (25, 5, 27, 28), "brown", "ink")
        rect(d, (3, 5, 28, 8), "brownlight", "ink")
        rect(d, (3, 19, 28, 22), "brownlight", "ink")
        line(d, (9, 7, 9, 26), "brownlight", 2)
        poly(d, [(6, 23), (12, 23), (11, 29), (8, 30)], "grey", "ink")
        line(d, (17, 7, 17, 28), "brownlight", 2)
        line(d, (14, 9, 21, 9), "grey", 2)
        for x in (14, 16, 18, 20):
            line(d, (x, 7, x, 12), "grey")
        rect(d, (21, 16, 25, 19), "coral", "ink")
        line(d, (23, 18, 22, 16, 24, 16, 23, 18), "paper")
    elif name == "compost-bin":
        shadow(d)
        rect(d, (5, 9, 26, 28), "brown", "ink")
        for y in (12, 18, 24):
            line(d, (6, y, 25, y), "brownlight")
        rect(d, (7, 10, 9, 27), "amberdark")
        rect(d, (22, 10, 24, 27), "amberdark")
        poly(d, [(5, 9), (8, 4), (24, 4), (27, 9)], "brownlight", "ink")
        line(d, (10, 6, 22, 6), "amberlight")
        rect(d, (13, 16, 19, 22), "paper", "ink")
        poly(d, [(14, 19), (17, 17), (18, 19), (16, 21)], "green", "greendark")
        line(d, (15, 20, 18, 18), "greenlight")
    elif name == "water-barrel":
        shadow(d, (4, 26, 28, 30))
        rect(d, (6, 7, 25, 25), "cyandark", "ink")
        ell(d, (6, 22, 25, 28), "cyandark", "ink")
        ell(d, (6, 4, 25, 11), "cyan", "ink")
        ell(d, (8, 5, 23, 9), "cyandark", "navy")
        line(d, (10, 6, 15, 6), "cyanlight")
        line(d, (7, 13, 24, 13), "navy", 2)
        line(d, (7, 21, 24, 21), "navy", 2)
        line(d, (9, 14, 9, 19), "cyan")
        rect(d, (22, 19, 28, 21), "grey", "ink")
        rect(d, (26, 20, 28, 24), "grey", "ink")
        line(d, (23, 18, 26, 18), "coral", 2)
        rect(d, (25, 24, 29, 25), "navy", "ink")
    elif name == "seed-workbench":
        shadow(d)
        table(d)
        rect(d, (6, 5, 11, 12), "paper", "ink")
        line(d, (7, 7, 10, 7), "coral")
        ell(d, (8, 9, 10, 11), "amberdark")
        rect(d, (13, 6, 18, 13), "paper", "ink")
        line(d, (14, 8, 17, 8), "green")
        line(d, (15, 11, 16, 9), "green")
        rect(d, (21, 10, 26, 14), "brownlight", "ink")
        for x, y in ((22, 12), (24, 11), (25, 13)):
            rect(d, (x, y, x, y), "amberdark")
        line(d, (9, 24, 9, 26, 21, 26, 21, 24), "brownlight", 2)
        rect(d, (12, 24, 18, 26), "paper", "ink")
    elif name == "exhibition-plinth":
        shadow(d)
        poly(d, [(7, 10), (25, 10), (25, 27), (7, 27)], "greylight", "ink")
        rect(d, (7, 10, 11, 27), "grey", "ink")
        rect(d, (6, 7, 26, 12), "white", "ink")
        line(d, (8, 8, 24, 8), "paper")
        rect(d, (13, 16, 23, 22), "paper", "ink")
        line(d, (15, 18, 21, 18), "navylight")
        line(d, (15, 20, 19, 20), "grey")
    elif name == "museum-label-stand":
        shadow(d, (7, 27, 26, 30))
        rect(d, (15, 15, 17, 28), "grey", "ink")
        rect(d, (8, 27, 24, 29), "darkgrey", "ink")
        poly(d, [(5, 7), (24, 4), (28, 14), (8, 18)], "brownlight", "ink")
        poly(d, [(7, 8), (23, 6), (25, 13), (9, 15)], "paper", "navy")
        line(d, (10, 9, 22, 8), "navy")
        line(d, (11, 12, 22, 11), "grey")
    elif name == "archive-workbench":
        shadow(d)
        table(d)
        rect(d, (5, 7, 20, 15), "paper", "ink")
        rect(d, (6, 8, 19, 14), "white")
        line(d, (8, 10, 16, 10), "grey")
        line(d, (8, 12, 14, 12), "grey")
        line(d, (7, 7, 7, 15), "brownlight")
        line(d, (18, 7, 18, 15), "brownlight")
        rect(d, (23, 6, 26, 12), "cyandark", "ink")
        rect(d, (24, 4, 25, 6), "paper", "ink")
        line(d, (22, 15, 27, 10), "brown", 2)
        rect(d, (26, 9, 28, 11), "paper", "ink")
        rect(d, (9, 24, 22, 26), "paper", "ink")
        line(d, (11, 25, 20, 25), "grey")
    elif name == "catalog-cabinet":
        shadow(d)
        rect(d, (4, 2, 27, 29), "brown", "ink")
        rect(d, (4, 2, 27, 5), "brownlight", "ink")
        for y in (7, 14, 21):
            for x in (6, 17):
                rect(d, (x, y, x+8, y+5), "brownlight", "ink")
                rect(d, (x+2, y+1, x+6, y+2), "paper", "grey")
                rect(d, (x+3, y+4, x+5, y+4), "amber")
        rect(d, (6, 29, 8, 30), "ink")
        rect(d, (23, 29, 25, 30), "ink")
    elif name == "lab-workbench":
        shadow(d)
        rect(d, (4, 17, 7, 28), "grey", "ink")
        rect(d, (24, 17, 27, 28), "grey", "ink")
        rect(d, (2, 12, 29, 18), "paper", "ink")
        line(d, (4, 13, 27, 13), "white")
        rect(d, (4, 19, 16, 27), "navylight", "ink")
        rect(d, (6, 21, 14, 24), "navy", "ink")
        rect(d, (8, 22, 12, 23), "paper")
        rect(d, (7, 4, 16, 11), "navy", "ink")
        rect(d, (9, 6, 14, 9), "cyandark")
        line(d, (10, 8, 13, 7), "cyanlight")
        rect(d, (10, 11, 12, 13), "grey", "ink")
        rect(d, (21, 4, 24, 7), "greylight", "ink")
        poly(d, [(21, 7), (19, 12), (26, 12), (24, 7)], "cyanlight", "ink")
        line(d, (21, 11, 24, 11), "cyan")
        rect(d, (25, 8, 27, 12), "paper", "ink")
    elif name == "observation-table":
        shadow(d)
        table(d)
        paper(d, 5, 7, 9, 7)
        ell(d, (19, 4, 26, 11), None, "grey", 2)
        line(d, (21, 9, 17, 14), "brown", 2)
        ell(d, (22, 6, 24, 9), "green", "greendark")
        rect(d, (22, 14, 27, 15), "amberlight", "ink")
        for x in (23, 25):
            rect(d, (x, 14, x, 14), "amberdark")
        rect(d, (8, 22, 23, 24), "brownlight", "ink")
    elif name == "newsroom-desk":
        shadow(d)
        table(d)
        paper(d, 5, 6, 9, 8)
        rect(d, (7, 8, 11, 9), "navy")
        paper(d, 18, 8, 9, 7)
        rect(d, (20, 10, 23, 12), "coral")
        line(d, (16, 6, 15, 13), "coraldark", 2)
        rect(d, (10, 23, 22, 26), "paper", "ink")
        line(d, (12, 24, 20, 24), "grey")
    elif name == "interview-table":
        shadow(d)
        table(d)
        book(d, 5, 7, open=True)
        rect(d, (22, 6, 27, 13), "navylight", "ink")
        rect(d, (23, 7, 26, 9), "paper")
        ell(d, (23, 11, 24, 12), "coral")
        rect(d, (25, 11, 26, 12), "cyan")
        line(d, (18, 8, 17, 14), "brown", 2)
    elif name == "assembly-table":
        shadow(d)
        table(d)
        paper(d, 11, 7, 10, 8)
        line(d, (14, 10, 19, 10), "cyandark")
        line(d, (14, 12, 18, 12), "cyandark")
        cup(d, 5, 9, "violetlight")
        rect(d, (24, 8, 26, 14), "coral", "ink")
        line(d, (25, 8, 26, 5), "brown")
        rect(d, (8, 24, 23, 26), "paper", "ink")
        line(d, (10, 25, 21, 25), "grey")
    elif name == "public-catalog-desk":
        shadow(d)
        rect(d, (3, 14, 28, 28), "brown", "ink")
        rect(d, (2, 13, 29, 17), "brownlight", "ink")
        line(d, (4, 14, 27, 14), "amberlight")
        rect(d, (5, 3, 18, 12), "navy", "ink")
        rect(d, (7, 5, 16, 10), "cyandark")
        rect(d, (8, 6, 14, 7), "paper")
        for y in (8, 10):
            line(d, (9, y, 13, y), "cyanlight")
        rect(d, (10, 12, 13, 14), "grey", "ink")
        book(d, 21, 9, "violet")
        book(d, 20, 6, "coral")
        rect(d, (7, 20, 24, 25), "paper", "ink")
        line(d, (10, 22, 21, 22), "navylight")
        line(d, (10, 24, 18, 24), "grey")
    elif name == "shade-pergola":
        shadow(d, (2, 26, 30, 30))
        for x in (4, 26):
            rect(d, (x, 8, x+2, 28), "brown", "ink")
            line(d, (x+1, 10, x+1, 26), "brownlight")
        rect(d, (2, 5, 30, 8), "brownlight", "ink")
        for y in (2, 5, 8):
            line(d, (4, y, 28, y), "brown", 2)
        for x in (7, 13, 19, 25):
            line(d, (x, 1, x, 10), "brownlight", 2)
        for x, y in ((4, 3), (9, 2), (14, 3), (20, 2), (26, 3), (5, 10)):
            ell(d, (x-2, y, x+2, y+3), "green", "greendark")
            rect(d, (x, y+1, x, y+1), "greenlight")
        line(d, (5, 13, 6, 17), "greendark")
        poly(d, [(4, 14), (2, 14), (3, 17), (5, 16)], "green", "greendark")
    elif name == "planter-border":
        shadow(d, (2, 25, 30, 29))
        poly(d, [(5, 9), (26, 9), (30, 22), (1, 22)], "brownlight", "ink")
        poly(d, [(7, 11), (24, 11), (26, 19), (5, 19)], "brown", "ink")
        rect(d, (1, 22, 30, 27), "brownlight", "ink")
        line(d, (3, 23, 28, 23), "amberlight")
        for x in (7, 14, 21, 28):
            line(d, (x, 24, x, 26), "brown")
        for x, y in ((9, 15), (16, 13), (23, 16)):
            line(d, (x, y+2, x, y-3), "greendark")
            poly(d, [(x, y), (x-3, y-2), (x-2, y-4), (x, y-2)], "green", "greendark")
            poly(d, [(x, y-1), (x+2, y-3), (x+3, y-1), (x+1, y+1)], "greenlight", "greendark")
    else:
        raise ValueError(name)
    return im


def rect_footprint(x=0.10, y=0.50, width=0.80, height=0.38):
    return {"x": x, "y": y, "width": width, "height": height}


def anchor(x, y, facing, state):
    return {"x": x, "y": y, "facing": facing, "state": state}


def metadata(index, id, name, category):
    footprint = rect_footprint()
    anchors = {"work": anchor(0.50, 1.12, "north", "working"), "approach": anchor(0.50, 1.10, "north", "observing")}
    layer = "object"
    interaction = "observe"
    if id.startswith("bench-"):
        direction = id.split("-")[-1]
        seats = {"south": (0.5, 0.58), "north": (0.5, 0.40), "east": (0.56, 0.58), "west": (0.44, 0.58)}
        approaches = {"south": (0.5, 1.1, "north"), "north": (0.5, -0.12, "south"), "east": (1.1, 0.65, "west"), "west": (-0.1, 0.65, "east")}
        sx, sy = seats[direction]
        ax, ay, face = approaches[direction]
        footprint = rect_footprint(0.10, 0.25, 0.80, 0.60) if direction in ("south", "north") else rect_footprint(0.20, 0.25, 0.60, 0.60)
        anchors = {"seat": anchor(sx, sy, direction, "sitting"), "approach": anchor(ax, ay, face, "waiting")}
        interaction = "sit"
    elif id == "cable-mat":
        footprint = None
        anchors = {}
        layer = "ground"
        interaction = "none"
    elif id == "stage-platform":
        footprint = None
        anchors = {"perform": anchor(0.50, 0.40, "south", "working"), "audience": anchor(0.50, 1.45, "north", "observing")}
        layer = "ground"
        interaction = "music"
    elif id == "shade-pergola":
        footprint = [rect_footprint(0.12, 0.63, 0.10, 0.24), rect_footprint(0.81, 0.63, 0.10, 0.24)]
        anchors = {"shelter": anchor(0.50, 0.80, "south", "waiting")}
        layer = "canopy"
        interaction = "none"
    elif id == "planter-border":
        footprint = rect_footprint(0.05, 0.30, 0.90, 0.55)
        anchors = {"tend": anchor(0.50, 1.10, "north", "working")}
        interaction = "garden"
    elif id in ("catalog-cabinet", "instrument-storage", "garden-tool-rack"):
        footprint = rect_footprint(0.12, 0.12, 0.76, 0.79)
    elif id == "water-barrel":
        footprint = rect_footprint(0.20, 0.34, 0.58, 0.48)
        anchors = {"tap": anchor(1.08, 0.80, "west", "working")}
        interaction = "garden"
    elif id == "compost-bin":
        footprint = rect_footprint(0.15, 0.32, 0.70, 0.55)
        interaction = "garden"
    elif id in ("stall-fruit-counter", "stall-food-counter", "stall-cloth-counter", "workshop-hair-counter"):
        footprint = rect_footprint(0.07, 0.42, 0.86, 0.43)
        anchors = {"vendor": anchor(0.50, -0.18, "south", "working"), "customer": anchor(0.50, 1.10, "north", "observing")}
    elif id == "round-cafe-table":
        footprint = rect_footprint(0.14, 0.28, 0.74, 0.58)
        anchors = {"first": anchor(-0.18, 0.70, "east", "sitting"), "second": anchor(1.18, 0.70, "west", "sitting")}
    elif id == "interview-table":
        anchors = {"reporter": anchor(0.50, 1.15, "north", "reading"), "guest": anchor(0.50, -0.18, "south", "conversing")}
    elif id == "assembly-table":
        anchors = {"facilitator": anchor(0.50, -0.18, "south", "working"), "participant": anchor(0.50, 1.15, "north", "reading")}
    elif id in ("low-reading-table", "study-desk"):
        anchors = {"read": anchor(0.50, 1.10, "north", "reading")}
        interaction = "read"
    elif id == "museum-label-stand":
        footprint = rect_footprint(0.22, 0.68, 0.60, 0.24)
        anchors = {"read": anchor(0.50, 1.10, "north", "reading")}
        interaction = "read"
    elif id == "exhibition-plinth":
        footprint = rect_footprint(0.19, 0.31, 0.64, 0.56)
    return {"index": index, "id": id, "name": name, "category": category, "solidFootprint": footprint, "anchors": anchors, "layer": layer, "interaction": interaction}


def main():
    atlas = empty(256, 128)
    records = []
    sprites = []
    for index, (id, name, category) in enumerate(PROPS):
        im = prop(id)
        sprites.append(im)
        atlas.alpha_composite(im, ((index % 8)*32, (index // 8)*32))
        record = metadata(index, id, name, category)
        record["sourceRect"] = {"x": (index % 8)*32, "y": (index // 8)*32, "width": 32, "height": 32}
        records.append(record)
    output = ROOT / "assets" / "tilesets"
    output.mkdir(parents=True, exist_ok=True)
    atlas.save(output / "scene-props.png", optimize=True)
    manifest = {"version": "1.5", "license": "CC0-1.0", "attributionRequired": False, "author": "Original VOICES pixel art", "atlas": "assets/tilesets/scene-props.png", "generator": "tools/create_scene_assets.py", "tileSize": 32, "columns": 8, "rows": 4, "coordinateUnits": "tile-fraction", "sourceRectUnits": "pixel", "anchorConvention": "Anchor positions are relative to the sprite top-left; positions beyond the cell indicate an adjacent activity or approach point.", "palette": {key: base.P[key] for key in ("ink", "navy", "navylight", "brown", "brownlight", "amberlight", "paper", "white", "grey", "greylight", "green", "greendark", "coral", "violet", "cyandark")}, "props": records}
    (output / "scene-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    preview = Image.new("RGB", (1280, 616), "#e7dfcc")
    d = ImageDraw.Draw(preview)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except OSError:
        font = ImageFont.load_default()
    for index, ((id, name, category), im) in enumerate(zip(PROPS, sprites)):
        x, y = (index % 8)*160, (index // 8)*154
        rect(d, (x+6, y+5, x+153, y+119), "#ded3b9")
        preview.paste(im.resize((112, 112), Image.Resampling.NEAREST), (x+24, y+5), im.resize((112, 112), Image.Resampling.NEAREST))
        words = f"{index:02d} {name}".split()
        rows = [""]
        for word in words:
            candidate = (rows[-1] + " " + word).strip()
            if d.textlength(candidate, font=font) > 150:
                rows.append(word)
            else:
                rows[-1] = candidate
        for line_index, label in enumerate(rows[:2]):
            d.text((x+7, y+121+line_index*14), label, fill=base.P["navy"], font=font)
    renders = ROOT / "tests" / "scene-renders"
    renders.mkdir(parents=True, exist_ok=True)
    preview.save(renders / "props.png", optimize=True)
    alpha = atlas.getchannel("A")
    opaque_counts = [sum(sprite.getchannel("A").histogram()[1:]) for sprite in sprites]
    print(json.dumps({"atlas": str(output / "scene-props.png"), "size": atlas.size, "props": len(PROPS), "alphaExtrema": alpha.getextrema(), "occupiedPixelsPerCell": opaque_counts, "uniqueFrames": len(set(sprite.tobytes() for sprite in sprites))}, ensure_ascii=False))


if __name__ == "__main__":
    main()
