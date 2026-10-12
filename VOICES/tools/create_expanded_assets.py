from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("voices_scene_palette", ROOT / "tools" / "create_scene_assets.py")
scene = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scene)
rect, ell, poly, line, empty = scene.rect, scene.ell, scene.poly, scene.line, scene.empty

PROPS = [
    ("sofa", "Sofá de dois lugares", "casa"),
    ("upholstered-armchair", "Poltrona acolchoada", "casa"),
    ("single-bed", "Cama de solteiro", "casa"),
    ("bunk-bed", "Beliche", "casa"),
    ("dresser", "Cômoda", "casa"),
    ("wardrobe", "Guarda-roupa", "casa"),
    ("bedside-cabinet", "Mesa de cabeceira", "casa"),
    ("kitchen-stove", "Fogão", "cozinha"),
    ("fridge", "Geladeira", "cozinha"),
    ("kitchen-sink", "Pia da cozinha", "cozinha"),
    ("dining-table", "Mesa de jantar", "cozinha"),
    ("dining-chair", "Cadeira de jantar", "casa"),
    ("rocking-chair", "Cadeira de balanço", "casa"),
    ("classroom-desk", "Carteira escolar", "educação"),
    ("round-stool", "Banquinho redondo", "casa"),
    ("long-bookcase", "Estante larga de livros", "biblioteca"),
    ("wall-shelf", "Prateleira de parede", "casa"),
    ("coat-stand", "Cabideiro", "casa"),
    ("floor-lamp", "Luminária de chão", "casa"),
    ("wall-clock", "Relógio de parede", "casa"),
    ("woven-rug", "Tapete tecido", "casa"),
    ("curtain", "Cortina", "casa"),
    ("bathroom-sink", "Pia de banheiro", "serviços"),
    ("toilet", "Vaso sanitário", "serviços"),
    ("laundry-basin", "Tanque de lavar", "serviços"),
    ("washing-machine", "Máquina de lavar", "serviços"),
    ("tool-bench", "Bancada de ferramentas", "oficina"),
    ("easel", "Cavalete de pintura", "arte"),
    ("sewing-table", "Mesa de costura", "oficina"),
    ("reception-counter", "Balcão de recepção", "comunidade"),
    ("computer-desk", "Mesa de computador", "tecnologia"),
    ("storage-chest", "Baú de armazenamento", "casa"),
    ("crate-stack", "Caixotes empilhados", "feira"),
    ("chess-table", "Mesa de xadrez", "convívio"),
    ("picnic-table", "Mesa de piquenique", "convívio"),
    ("decorative-planter", "Jardineira com flores", "horta"),
    ("drinking-fountain", "Bebedouro", "serviços"),
    ("bicycle-rack", "Bicicletário", "convívio"),
    ("litter-bin", "Lixeira com tampa", "serviços"),
    ("accessible-low-table", "Mesa baixa com espaço livre", "comunidade"),
    ("berimbau", "Berimbau", "música"),
    ("atabaque", "Atabaque", "música"),
    ("agogo", "Agogô", "música"),
    ("reco-reco", "Reco-reco de bambu", "música"),
    ("xequere", "Xequerê", "música"),
    ("cuica", "Cuíca", "música"),
    ("djembe", "Djembe", "música"),
    ("ilu", "Ilú", "música"),
    ("headwrap-display", "Turbante em suporte", "tecidos e adornos"),
    ("beads-display", "Fio de contas em exposição", "tecidos e adornos"),
    ("pano-da-costa-display", "Pano da costa em suporte", "tecidos e adornos"),
    ("kente-cloth", "Tecido Kente em exposição", "tecidos e adornos"),
    ("ankara-cloth", "Tecido Ankara em exposição", "tecidos e adornos"),
    ("balangandas-display", "Penca de balangandãs", "tecidos e adornos"),
    ("wooden-mask-display", "Máscara de madeira em suporte", "museu"),
    ("metal-mask-display", "Máscara de metal em suporte", "museu"),
    ("ancestral-sculpture-display", "Escultura ancestral em exposição", "museu"),
    ("orixa-context-exhibit", "Escultura artística · referência a Ogum", "museu"),
    ("sankofa-relief", "Relevo didático Sankofa", "arte"),
    ("iron-tools-display", "Exposição de ferramentas de ferro", "museu"),
    ("amulet-display", "Amuleto em exposição", "museu"),
    ("museum-label-desk", "Mesa de legendas do museu", "museu"),
    ("biography-display", "Painel de biografia", "educação"),
    ("record-player", "Toca-discos", "música"),
]

SOURCES = [
    {"indices": [40, 42, 43], "institution": "IPHAN", "url": "https://bibliotecadigital.iphan.gov.br/bitstreams/835bd81e-1742-433d-bd9f-dbe2e8dbdbe4/download", "use": "Instrument silhouettes: bowed berimbau with gourd; paired metal agogô bells; ridged bamboo reco-reco."},
    {"indices": [41], "institution": "Museu Regional do Caeté / Brasiliana Museus", "url": "https://brasiliana.museus.gov.br/acervos/5348249-2/", "use": "Conical wooden atabaque, narrow cylindrical lower support, leather head and braided tension cord. Material and shape references only; original pixel illustration."},
    {"indices": [44], "institution": "Secretaria da Cultura do Ceará", "url": "https://www.ce.gov.br/secult/2022/04/12/vila-da-musica-realiza-oficina-de-xequere-neste-mes-de-abril/", "use": "Rounded gourd surrounded by a loose bead net."},
    {"indices": [45], "institution": "Musica Brasilis", "url": "https://musicabrasilis.org.br/pt-br/instrumentos/cuica/", "use": "Cylindrical friction drum with one skin; internal stick is not represented as an external striking beater."},
    {"indices": [46], "institution": "The Metropolitan Museum of Art", "url": "https://www.metmuseum.org/art/collection/search/503722", "use": "Goblet-shaped djembe with skin head, narrow waist, flared foot and tension cords."},
    {"indices": [47], "institution": "Prefeitura do Recife", "url": "https://www2.recife.pe.gov.br/noticias/04/03/2016/nucleo-de-cultura-afro-oferece-oficina-de-ilu", "use": "Hand-played ilú supported on a tripod; distinct from a goblet-shaped djembe."},
    {"indices": [48], "institution": "UNILAB", "url": "https://repositorio.unilab.edu.br/xmlui/bitstream/handle/123456789/2637/2022_proj_anandasantana.pdf?isAllowed=y&sequence=1", "use": "Headwrap folds on a neutral display, without assigning the term ojá to every headwrap."},
    {"indices": [49], "institution": "Museu Afro Brasil", "url": "https://museuafrobrasil.org.br/acervo/fio-de-contas-de-orixa-2/", "use": "Bead necklaces on their own contextual exhibit support."},
    {"indices": [50], "institution": "Universidade Federal da Bahia", "url": "https://ppgav.ufba.br/sites/ppgav.ufba.br/files/dissertacao_ana_nascimento_final.pdf", "use": "Rectangular pano da costa displayed draped, with bands rather than a universal Kente pattern."},
    {"indices": [51, 52], "institution": "Victoria and Albert Museum", "url": "https://www.vam.ac.uk/articles/cloth-of-a-continent-africa-fashion", "use": "Kente has stitched woven strips with alternating geometric blocks; Ankara has repeated printed motifs."},
    {"indices": [53], "institution": "Museu Histórico Nacional", "url": "https://brasiliana3.museus.gov.br/brasiliana/penca-de-balangandas-3/", "use": "Metal holder and chain with differently shaped hanging pendants."},
    {"indices": [55], "institution": "Smithsonian National Museum of African Art", "url": "https://africa.si.edu/collection/object/nmafa_86-12-5", "use": "Copper-alloy material cue only. The original game mask is not a replica or attributed to a specific people."},
    {"indices": [56], "institution": "The Metropolitan Museum of Art", "url": "https://www.metmuseum.org/art/collection/search/311004", "use": "Research reference for a wooden seated ancestor figure and its specific Bembe-Kongo context. The game sculpture is an original teaching illustration, not a replica or a universal ancestor figure."},
    {"indices": [58], "institution": "The Metropolitan Museum of Art", "url": "https://www.metmuseum.org/art/collection/search/317688", "use": "Sankofa bird with feet forward and head turned back toward its tail."},
    {"indices": [57, 59], "institution": "Museu Afro Brasil", "url": "https://museuafrobrasil.org.br/acervo/ferramenta-de-orixa-ogum/", "use": "Iron tools in a contextual museum display; no unsupported Ibi identification."},
    {"indices": [60], "institution": "Fundação Joaquim Nabuco", "url": "https://pesquisaescolar.fundaj.gov.br/pt-br/artigo/talismas-e-amuletos/", "use": "Small cloth bag and cord as a descriptive amulet study, not a power-up or a Patachas attribution."},
]

def cabinet(d, top=5, split=True, tint="brown"):
    scene.shadow(d)
    rect(d, (5, top, 26, 27), tint, "ink")
    rect(d, (4, top, 27, top+2), "brownlight", "ink")
    rect(d, (7, 27, 9, 29), "brown", "ink")
    rect(d, (22, 27, 24, 29), "brown", "ink")
    if split:
        line(d, (16, top+4, 16, 26), "ink")
        rect(d, (13, 16, 14, 18), "amberlight")
        rect(d, (18, 16, 19, 18), "amberlight")

def legs(d, x1=6, x2=25, y=22):
    rect(d, (x1, y, x1+2, 29), "brown", "ink")
    rect(d, (x2-2, y, x2, 29), "brown", "ink")

def plinth(d):
    scene.shadow(d, (4, 27, 28, 30))
    rect(d, (8, 23, 24, 28), "grey", "ink")
    rect(d, (6, 22, 26, 24), "greylight", "ink")
    line(d, (9, 25, 21, 25), "paper")

def prop(index, id):
    im = empty()
    d = ImageDraw.Draw(im)
    scene.shadow(d)
    if id == "sofa":
        rect(d, (4, 9, 27, 22), "coraldark", "ink")
        rect(d, (6, 10, 15, 18), "coral", "ink")
        rect(d, (16, 10, 25, 18), "coral", "ink")
        rect(d, (5, 18, 26, 24), "coral", "ink")
        line(d, (6, 19, 25, 19), "corallight")
        line(d, (16, 19, 16, 23), "coraldark")
        rect(d, (2, 16, 6, 25), "coraldark", "ink")
        rect(d, (25, 16, 29, 25), "coraldark", "ink")
        rect(d, (5, 26, 7, 28), "brown", "ink")
        rect(d, (25, 26, 27, 28), "brown", "ink")
        rect(d, (8, 12, 12, 16), "amberlight", "amberdark")
    elif id == "upholstered-armchair":
        rect(d, (9, 5, 23, 22), "greendark", "ink")
        rect(d, (11, 7, 21, 18), "green", "ink")
        line(d, (12, 8, 19, 8), "greenlight")
        rect(d, (9, 18, 23, 25), "green", "ink")
        rect(d, (5, 16, 10, 25), "greendark", "ink")
        rect(d, (22, 16, 27, 25), "greendark", "ink")
        line(d, (6, 17, 9, 17), "greenlight")
        line(d, (23, 17, 26, 17), "greenlight")
        legs(d, 8, 24, 25)
    elif id == "single-bed":
        rect(d, (5, 2, 26, 28), "brown", "ink")
        rect(d, (7, 4, 24, 11), "white", "ink")
        rect(d, (8, 5, 23, 8), "paper")
        rect(d, (6, 11, 25, 25), "cyandark", "ink")
        line(d, (8, 13, 23, 13), "cyanlight")
        line(d, (9, 15, 9, 24), "cyan")
        rect(d, (5, 26, 26, 28), "brownlight", "ink")
        rect(d, (5, 28, 7, 30), "brown", "ink")
        rect(d, (24, 28, 26, 30), "brown", "ink")
    elif id == "bunk-bed":
        for y in (8, 22):
            rect(d, (3, y, 28, y+4), "paper", "ink")
            rect(d, (5, y-3, 11, y), "white", "ink")
            rect(d, (12, y-1, 27, y+2), "violet", "ink")
            line(d, (13, y, 25, y), "violetlight")
        rect(d, (2, 2, 4, 29), "brown", "ink")
        rect(d, (27, 2, 29, 29), "brown", "ink")
        line(d, (4, 3, 27, 3), "brownlight", 2)
        line(d, (16, 12, 16, 28), "brownlight", 2)
        line(d, (22, 12, 22, 28), "brownlight", 2)
        for y in (15, 19, 23, 27):
            line(d, (17, y, 21, y), "brownlight")
    elif id == "dresser":
        cabinet(d, 8, False)
        for y in (12, 18, 24):
            rect(d, (7, y-2, 24, y+2), "brownlight", "ink")
            rect(d, (14, y, 18, y), "amberlight")
        scene.plant(d, 22, 4)
    elif id == "wardrobe":
        cabinet(d, 3)
        rect(d, (8, 7, 13, 12), "amberdark", "ink")
        rect(d, (19, 7, 23, 12), "amberdark", "ink")
        line(d, (9, 8, 12, 8), "brownlight")
        line(d, (20, 8, 22, 8), "brownlight")
    elif id == "bedside-cabinet":
        cabinet(d, 15, False)
        rect(d, (8, 18, 23, 22), "brownlight", "ink")
        rect(d, (15, 20, 17, 20), "amberlight")
        line(d, (16, 14, 16, 6), "grey", 2)
        poly(d, [(12, 5), (20, 5), (23, 11), (9, 11)], "amber", "ink")
        line(d, (11, 10, 21, 10), "amberlight")
    elif id == "kitchen-stove":
        rect(d, (5, 7, 26, 28), "paper", "ink")
        rect(d, (4, 7, 27, 13), "greylight", "ink")
        for x in (10, 21):
            ell(d, (x-3, 8, x+3, 12), "navy", "ink")
            ell(d, (x-1, 9, x+1, 10), "grey")
        rect(d, (8, 18, 23, 25), "navy", "ink")
        rect(d, (10, 20, 21, 23), "darkgrey")
        for x in (9, 15, 21):
            rect(d, (x, 15, x+1, 16), "navy")
        line(d, (9, 19, 22, 19), "greylight")
        rect(d, (5, 3, 26, 6), "greylight", "ink")
    elif id == "fridge":
        rect(d, (8, 3, 25, 29), "greylight", "ink")
        rect(d, (9, 4, 23, 11), "white", "ink")
        rect(d, (9, 13, 23, 27), "paper", "ink")
        line(d, (20, 6, 20, 9), "grey", 2)
        line(d, (20, 16, 20, 22), "grey", 2)
        rect(d, (11, 17, 14, 21), "amberlight", "amberdark")
        line(d, (12, 19, 13, 19), "brown")
        rect(d, (8, 29, 10, 30), "navy")
        rect(d, (23, 29, 25, 30), "navy")
    elif id == "kitchen-sink":
        cabinet(d, 15)
        rect(d, (3, 11, 28, 16), "greylight", "ink")
        ell(d, (7, 11, 24, 15), "grey", "ink")
        ell(d, (10, 12, 21, 14), "navylight")
        line(d, (22, 11, 22, 5, 17, 5, 17, 9), "navy", 2)
        line(d, (21, 6, 18, 6), "greylight")
        rect(d, (5, 8, 7, 11), "green", "ink")
    elif id == "dining-table":
        scene.table(d, 11, 22)
        for x in (9, 23):
            ell(d, (x-4, 13, x+3, 17), "white", "ink")
            line(d, (x-5, 13, x-5, 17), "grey")
        scene.cup(d, 17, 8, "coral")
        line(d, (4, 19, 27, 19), "amberlight")
    elif id == "dining-chair":
        rect(d, (9, 4, 23, 15), "brown", "ink")
        for x in (12, 17, 21):
            line(d, (x, 6, x, 13), "brownlight")
        rect(d, (7, 17, 25, 22), "brownlight", "ink")
        line(d, (9, 18, 23, 18), "amberlight")
        legs(d, 8, 24, 22)
        line(d, (9, 25, 23, 25), "brown")
    elif id == "rocking-chair":
        rect(d, (9, 4, 23, 16), "brown", "ink")
        for x in (12, 17, 21):
            line(d, (x, 6, x, 14), "brownlight")
        rect(d, (8, 17, 24, 21), "amberdark", "ink")
        line(d, (6, 13, 11, 13, 11, 18), "brownlight", 2)
        line(d, (22, 18, 22, 13, 27, 13), "brownlight", 2)
        legs(d, 10, 23, 20)
        line(d, (4, 25, 7, 28, 24, 28, 28, 25), "ink", 3)
        line(d, (4, 25, 7, 28, 24, 28, 28, 25), "brownlight")
    elif id == "classroom-desk":
        line(d, (7, 13, 7, 29), "navy", 2)
        line(d, (24, 13, 24, 29), "navy", 2)
        rect(d, (3, 9, 28, 14), "brownlight", "ink")
        line(d, (5, 10, 26, 10), "amberlight")
        rect(d, (8, 18, 24, 22), "greendark", "ink")
        line(d, (10, 20, 10, 28), "navy", 2)
        line(d, (23, 20, 23, 28), "navy", 2)
        scene.book(d, 13, 5, "coral")
        line(d, (23, 6, 26, 9), "navy")
    elif id == "round-stool":
        line(d, (10, 15, 7, 28), "ink", 3)
        line(d, (23, 15, 26, 28), "ink", 3)
        line(d, (16, 16, 16, 29), "ink", 3)
        line(d, (10, 15, 7, 27), "brownlight")
        line(d, (23, 15, 26, 27), "brownlight")
        line(d, (16, 16, 16, 28), "brownlight")
        ell(d, (5, 10, 27, 17), "brownlight", "ink")
        line(d, (9, 12, 23, 12), "amberlight")
        line(d, (8, 24, 25, 24), "brown")
    elif id == "long-bookcase":
        rect(d, (2, 3, 29, 29), "brown", "ink")
        for y in (5, 13, 21):
            rect(d, (4, y, 27, y+5), "navy", "ink")
            for x, tint, height in ((6, "coral", 5), (10, "violet", 4), (15, "green", 5), (20, "amber", 4), (24, "cyandark", 5)):
                rect(d, (x, y+5-height, x+2, y+5), tint, "ink")
                rect(d, (x+1, y+2, x+1, y+2), "paper")
            line(d, (4, y+7, 27, y+7), "brownlight")
    elif id == "wall-shelf":
        rect(d, (3, 16, 28, 20), "brownlight", "ink")
        line(d, (5, 17, 26, 17), "amberlight")
        line(d, (7, 20, 7, 25, 11, 20), "brown", 2)
        line(d, (24, 20, 24, 25, 20, 20), "brown", 2)
        scene.plant(d, 23, 9)
        for x, y, tint in ((6, 10, "coral"), (10, 8, "violet"), (14, 9, "green")):
            rect(d, (x, y, x+2, 15), tint, "ink")
    elif id == "coat-stand":
        line(d, (16, 3, 16, 28), "ink", 3)
        line(d, (16, 4, 16, 28), "brownlight")
        for x, y in ((7, 7), (25, 7), (9, 12), (23, 12)):
            line(d, (16, y+4, x, y, x, y-2), "brownlight", 2)
        poly(d, [(5, 9), (9, 9), (12, 15), (10, 22), (4, 22), (2, 15)], "coral", "ink")
        line(d, (7, 11, 7, 21), "coraldark")
        line(d, (16, 27, 9, 30), "brown", 2)
        line(d, (16, 27, 24, 30), "brown", 2)
    elif id == "floor-lamp":
        ell(d, (9, 25, 24, 29), "navy", "ink")
        line(d, (16, 8, 16, 26), "grey", 2)
        poly(d, [(11, 3), (21, 3), (27, 13), (5, 13)], "amber", "ink")
        line(d, (8, 12, 24, 12), "amberlight")
        line(d, (13, 5, 11, 10), "amberlight")
        ell(d, (13, 13, 19, 15), "amberlight", "amberdark")
    elif id == "wall-clock":
        ell(d, (5, 4, 27, 25), "brown", "ink")
        ell(d, (8, 7, 24, 22), "white", "ink")
        line(d, (16, 9, 16, 15, 21, 17), "navy")
        for x, y in ((16, 8), (23, 15), (16, 21), (9, 15)):
            rect(d, (x, y, x, y), "navy")
        rect(d, (15, 14, 17, 16), "coral")
    elif id == "woven-rug":
        poly(d, [(6, 8), (25, 8), (30, 24), (1, 24)], "coraldark", "ink")
        poly(d, [(8, 10), (23, 10), (27, 22), (4, 22)], "coral", "amberlight")
        poly(d, [(16, 12), (22, 16), (16, 21), (10, 16)], "amberlight", "ink")
        poly(d, [(16, 14), (19, 16), (16, 19), (13, 16)], "greendark", "ink")
        for x in range(3, 30, 3):
            line(d, (x, 25, x, 27), "amberlight")
        for x in range(7, 26, 3):
            line(d, (x, 6, x, 8), "amberlight")
    elif id == "curtain":
        line(d, (3, 3, 29, 3), "navy", 2)
        rect(d, (5, 4, 26, 27), "cyanlight", "navylight")
        line(d, (16, 5, 16, 26), "white", 2)
        line(d, (6, 15, 25, 15), "white", 2)
        poly(d, [(4, 4), (13, 4), (10, 17), (12, 28), (3, 28)], "violet", "ink")
        poly(d, [(20, 4), (28, 4), (29, 28), (21, 28), (23, 17)], "violet", "ink")
        line(d, (6, 6, 7, 16, 6, 25), "violetlight")
        line(d, (25, 6, 25, 16, 27, 25), "violetlight")
        line(d, (4, 18, 10, 18), "amberlight", 2)
        line(d, (23, 18, 28, 18), "amberlight", 2)
    elif id == "bathroom-sink":
        rect(d, (13, 16, 20, 28), "paper", "ink")
        ell(d, (10, 25, 23, 29), "white", "ink")
        ell(d, (5, 10, 27, 19), "white", "ink")
        ell(d, (8, 11, 24, 16), "grey", "ink")
        ell(d, (11, 12, 21, 14), "paper")
        line(d, (17, 11, 17, 5, 14, 5, 14, 8), "navy", 2)
        rect(d, (23, 8, 25, 11), "coral", "ink")
    elif id == "toilet":
        rect(d, (9, 3, 24, 12), "white", "ink")
        line(d, (11, 5, 21, 5), "paper")
        rect(d, (20, 7, 22, 8), "grey")
        rect(d, (12, 18, 21, 27), "paper", "ink")
        ell(d, (9, 24, 25, 29), "white", "ink")
        ell(d, (6, 11, 27, 23), "white", "ink")
        ell(d, (9, 13, 24, 19), "grey", "ink")
        ell(d, (12, 14, 21, 18), "paper")
    elif id == "laundry-basin":
        rect(d, (6, 15, 25, 28), "grey", "ink")
        rect(d, (3, 9, 28, 20), "greylight", "ink")
        poly(d, [(6, 11), (24, 11), (22, 17), (9, 17)], "darkgrey", "ink")
        for x in range(10, 23, 3):
            line(d, (x, 12, x-1, 16), "grey")
        line(d, (23, 10, 23, 4, 19, 4, 19, 7), "navy", 2)
        rect(d, (4, 5, 8, 10), "green", "ink")
        line(d, (5, 7, 7, 7), "paper")
    elif id == "washing-machine":
        rect(d, (6, 4, 26, 29), "paper", "ink")
        rect(d, (6, 4, 26, 10), "white", "ink")
        rect(d, (8, 6, 15, 8), "grey", "ink")
        ell(d, (21, 6, 24, 8), "navy")
        ell(d, (9, 12, 24, 26), "grey", "ink")
        ell(d, (11, 14, 22, 24), "navy", "ink")
        poly(d, [(12, 20), (16, 16), (20, 17), (20, 23), (13, 23)], "cyan", "cyandark")
        line(d, (13, 16, 18, 16), "greylight")
    elif id == "tool-bench":
        scene.table(d, 16, 23)
        rect(d, (5, 3, 26, 15), "brown", "ink")
        for x in (8, 13, 18, 23):
            for y in (6, 10, 13):
                rect(d, (x, y, x, y), "amberdark")
        line(d, (10, 5, 10, 13), "greylight", 2)
        rect(d, (8, 5, 12, 7), "grey", "ink")
        line(d, (19, 8, 19, 14), "brownlight", 2)
        rect(d, (16, 6, 22, 8), "greylight", "ink")
        rect(d, (21, 15, 26, 19), "navylight", "ink")
        line(d, (8, 18, 16, 18), "paper")
    elif id == "easel":
        line(d, (16, 2, 5, 29), "ink", 3)
        line(d, (16, 2, 27, 29), "ink", 3)
        line(d, (16, 3, 6, 29), "brownlight")
        line(d, (16, 3, 26, 29), "brownlight")
        rect(d, (7, 5, 25, 23), "brown", "ink")
        rect(d, (9, 7, 23, 21), "white", "ink")
        rect(d, (10, 8, 22, 15), "cyanlight")
        poly(d, [(10, 20), (10, 16), (14, 13), (18, 17), (21, 15), (22, 20)], "green", "greendark")
        ell(d, (17, 9, 20, 12), "amber")
        line(d, (6, 24, 26, 24), "brownlight", 2)
    elif id == "sewing-table":
        scene.table(d, 14, 22)
        rect(d, (8, 6, 21, 10), "navy", "ink")
        rect(d, (8, 6, 11, 14), "navy", "ink")
        rect(d, (19, 9, 21, 13), "navy", "ink")
        rect(d, (6, 13, 24, 15), "grey", "ink")
        ell(d, (21, 6, 25, 10), "grey", "ink")
        rect(d, (11, 3, 13, 5), "coral", "ink")
        line(d, (20, 12, 20, 14), "paper")
        poly(d, [(16, 14), (27, 14), (27, 24), (23, 22), (19, 23), (19, 18), (16, 18)], "coral", "coraldark")
        line(d, (22, 15, 22, 21), "corallight")
    elif id == "reception-counter":
        cabinet(d, 15, False, "greendark")
        rect(d, (2, 12, 29, 16), "brownlight", "ink")
        line(d, (4, 13, 27, 13), "amberlight")
        rect(d, (9, 20, 23, 24), "paper", "ink")
        line(d, (11, 22, 20, 22), "navylight")
        scene.paper(d, 19, 5, 8, 6)
        ell(d, (6, 7, 12, 11), "amber", "ink")
        rect(d, (8, 5, 10, 6), "navy")
        rect(d, (6, 11, 12, 12), "grey", "ink")
    elif id == "computer-desk":
        scene.table(d, 17, 23)
        rect(d, (7, 4, 24, 14), "navy", "ink")
        rect(d, (9, 6, 22, 12), "cyandark", "ink")
        line(d, (11, 8, 19, 8), "cyanlight")
        line(d, (11, 10, 15, 10), "paper")
        rect(d, (14, 14, 18, 16), "grey", "ink")
        rect(d, (7, 17, 22, 20), "greylight", "ink")
        for x in range(9, 21, 3):
            rect(d, (x, 18, x, 18), "navy")
        ell(d, (24, 17, 27, 21), "paper", "ink")
    elif id == "storage-chest":
        rect(d, (4, 12, 28, 28), "brown", "ink")
        poly(d, [(4, 12), (7, 7), (25, 7), (28, 12)], "brownlight", "ink")
        rect(d, (7, 8, 9, 27), "amberdark", "ink")
        rect(d, (23, 8, 25, 27), "amberdark", "ink")
        line(d, (5, 15, 27, 15), "ink")
        rect(d, (14, 13, 18, 18), "amberlight", "ink")
        rect(d, (16, 15, 16, 16), "navy")
        line(d, (11, 23, 21, 23), "brownlight")
    elif id == "crate-stack":
        for x, y in ((3, 17), (17, 17), (10, 4)):
            rect(d, (x, y, x+12, y+12), "brownlight", "ink")
            for yy in (y+4, y+8):
                line(d, (x+1, yy, x+11, yy), "brown")
            line(d, (x+1, y+1, x+11, y+11), "brown", 2)
            rect(d, (x+3, y+2, x+8, y+3), "navy", "ink")
    elif id == "chess-table":
        scene.table(d, 11, 21)
        rect(d, (7, 8, 24, 18), "ink")
        for row in range(4):
            for col in range(6):
                rect(d, (8+col*2, 9+row*2, 9+col*2, 10+row*2), "white" if (row+col)%2 else "navy")
        for x, y, tint in ((10, 9, "amberlight"), (16, 11, "coral"), (20, 15, "amberlight")):
            rect(d, (x, y-3, x+1, y-1), tint, "ink")
            line(d, (x-1, y, x+2, y), tint)
    elif id == "picnic-table":
        line(d, (10, 13, 24, 29), "brown", 3)
        line(d, (22, 13, 8, 29), "brown", 3)
        rect(d, (2, 9, 29, 16), "brownlight", "ink")
        for x in (8, 16, 23):
            line(d, (x, 10, x, 15), "brown")
        rect(d, (1, 23, 30, 26), "brownlight", "ink")
        line(d, (3, 24, 28, 24), "amberlight")
        rect(d, (6, 5, 24, 7), "brown", "ink")
        scene.cup(d, 18, 9, "cyandark")
    elif id == "decorative-planter":
        rect(d, (3, 20, 29, 28), "coraldark", "ink")
        rect(d, (2, 18, 30, 21), "coral", "ink")
        line(d, (5, 22, 26, 22), "corallight")
        for x, y, tint in ((8, 9, "amber"), (15, 6, "pink"), (24, 10, "violetlight")):
            line(d, (x, y+4, x, 18), "greendark", 2)
            poly(d, [(x, 15), (x-4, 12), (x-5, 15), (x, 17)], "green", "greendark")
            ell(d, (x-3, y-2, x+3, y+4), tint, "ink")
            rect(d, (x, y+1, x, y+1), "amberlight")
    elif id == "drinking-fountain":
        rect(d, (10, 13, 23, 28), "greylight", "ink")
        rect(d, (12, 16, 21, 25), "grey", "ink")
        ell(d, (7, 10, 26, 15), "paper", "ink")
        ell(d, (10, 11, 23, 13), "navylight", "ink")
        rect(d, (22, 7, 24, 10), "grey", "ink")
        rect(d, (23, 7, 25, 8), "white", "ink")
        rect(d, (25, 10, 27, 11), "cyan", "ink")
        ell(d, (9, 27, 25, 30), "grey", "ink")
    elif id == "bicycle-rack":
        rect(d, (1, 26, 30, 28), "grey", "ink")
        for x in (5, 13, 21):
            line(d, (x, 26, x, 13, x+4, 10, x+7, 13, x+7, 26), "ink", 3)
            line(d, (x, 26, x, 13, x+4, 10, x+7, 13, x+7, 26), "greylight")
        ell(d, (2, 18, 12, 28), None, "navy")
        ell(d, (17, 18, 27, 28), None, "navy")
        line(d, (7, 23, 12, 15, 18, 23, 7, 23, 16, 17, 22, 23), "coral")
        line(d, (20, 10, 18, 12, 22, 23), "navy")
        line(d, (11, 15, 16, 15), "navy", 2)
    elif id == "litter-bin":
        poly(d, [(7, 10), (25, 10), (23, 28), (9, 28)], "greendark", "ink")
        rect(d, (6, 7, 26, 10), "green", "ink")
        rect(d, (12, 4, 20, 7), "green", "ink")
        line(d, (9, 8, 23, 8), "greenlight")
        for x in (12, 16, 20):
            line(d, (x, 13, x, 25), "green")
        rect(d, (13, 17, 19, 21), "paper", "ink")
        line(d, (15, 18, 17, 18, 17, 20, 15, 20), "green")
    elif id == "accessible-low-table":
        rect(d, (3, 20, 5, 28), "grey", "ink")
        rect(d, (27, 20, 29, 28), "grey", "ink")
        rect(d, (2, 12, 30, 20), "brownlight", "ink")
        line(d, (4, 13, 28, 13), "amberlight")
        scene.book(d, 8, 7, open=True)
        scene.cup(d, 23, 11, "cyandark")
    else:
        cultural(d, index, id)
    return im

def cultural(d, index, id):
    if id == "berimbau":
        line(d, (17, 2, 12, 5, 8, 11, 7, 16, 9, 23, 17, 29), "ink", 3)
        line(d, (17, 2, 12, 5, 8, 11, 7, 16, 9, 23, 17, 29), "brownlight")
        line(d, (18, 2, 18, 29), "grey")
        line(d, (18, 3, 18, 17), "paper")
        line(d, (17, 2, 19, 2), "brown")
        line(d, (17, 29, 19, 29), "brown")
        ell(d, (9, 19, 20, 28), "amberdark", "ink")
        ell(d, (11, 20, 18, 26), "brownlight", "brown")
        ell(d, (10, 21, 13, 25), "navy", "ink")
        line(d, (11, 20, 17, 20), "amberlight")
        line(d, (9, 22, 18, 22), "brown")
        line(d, (25, 6, 23, 24), "ink", 3)
        line(d, (25, 6, 23, 24), "brownlight")
        ell(d, (23, 16, 26, 19), "greylight", "ink")
        poly(d, [(25, 24), (29, 24), (30, 29), (24, 29)], "amberlight", "ink")
        line(d, (26, 21, 26, 24, 28, 24, 28, 21), "brown")
        for x in (26, 28):
            line(d, (x, 25, x, 28), "brownlight")
        line(d, (25, 27, 29, 27), "brown")
    elif id == "atabaque":
        poly(d, [(6, 6), (26, 6), (23, 24), (20, 29), (12, 29), (9, 24)], "brown", "ink")
        for x in (9, 13, 19, 23):
            end = 13 if x < 16 else 19
            line(d, (x, 9, end, 27), "brownlight")
        for x in (8, 15, 23):
            line(d, (x, 8, 20 if x < 16 else 12, 26), "paper")
        ell(d, (5, 3, 27, 10), "amberdark", "ink")
        ell(d, (7, 4, 25, 8), "paper", "ink")
        line(d, (10, 24, 22, 24), "amberdark", 2)
        line(d, (12, 28, 20, 28), "navy")
    elif id == "agogo":
        poly(d, [(5, 10), (10, 7), (15, 18), (3, 20)], "grey", "ink")
        ell(d, (3, 17, 15, 22), "navy", "ink")
        line(d, (6, 11, 9, 10, 12, 16), "greylight")
        poly(d, [(18, 4), (22, 3), (27, 13), (16, 15)], "grey", "ink")
        ell(d, (16, 12, 28, 17), "navy", "ink")
        line(d, (19, 6, 21, 5, 24, 11), "greylight")
        line(d, (10, 8, 13, 4, 18, 4), "navy", 2)
        line(d, (13, 5, 16, 10, 18, 25), "grey", 2)
        line(d, (6, 27, 26, 21), "ink", 3)
        line(d, (6, 27, 26, 21), "brownlight")
    elif id == "reco-reco":
        poly(d, [(3, 17), (25, 9), (28, 14), (6, 22)], "brownlight", "ink")
        ell(d, (3, 17, 8, 22), "amberdark", "ink")
        for x, y in ((9, 16), (12, 15), (15, 14), (18, 13), (21, 12)):
            line(d, (x, y, x+2, y+4), "brown")
        line(d, (10, 8, 23, 26), "ink", 3)
        line(d, (10, 8, 23, 26), "amberlight")
    elif id == "xequere":
        rect(d, (14, 3, 18, 11), "brownlight", "ink")
        ell(d, (7, 9, 25, 29), "amberdark", "ink")
        ell(d, (10, 11, 22, 27), "brownlight")
        line(d, (15, 10, 10, 16, 11, 24, 16, 28, 22, 23, 23, 15, 18, 10), "paper")
        for row, y in enumerate((13, 17, 21, 25)):
            for x in range(11+(row%2)*2, 23, 4):
                line(d, (x, y, x-3, y+4), "paper")
                rect(d, (x, y, x+1, y+1), "cyanlight" if row%2 else "white")
        line(d, (14, 5, 17, 5), "amberlight")
    elif id == "cuica":
        rect(d, (6, 10, 25, 26), "grey", "ink")
        ell(d, (6, 22, 25, 29), "grey", "ink")
        rect(d, (8, 12, 23, 24), "greylight", "ink")
        for x in (9, 16, 23):
            line(d, (x, 12, x, 24), "navy")
            rect(d, (x-1, 14, x+1, 17), "grey", "ink")
        ell(d, (5, 6, 26, 13), "grey", "ink")
        ell(d, (7, 7, 24, 11), "paper", "ink")
        line(d, (10, 8, 19, 8), "white")
        poly(d, [(23, 21), (29, 22), (27, 28), (22, 27)], "cyanlight", "cyandark")
    elif id == "djembe":
        poly(d, [(6, 6), (26, 6), (21, 18), (20, 22), (24, 28), (8, 28), (12, 22), (11, 18)], "brown", "ink")
        poly(d, [(10, 10), (22, 10), (18, 21), (20, 26), (12, 26), (14, 21)], "amberdark")
        for x in (8, 13, 18, 23):
            target = 14 if x<16 else 19
            line(d, (x, 9, target, 19, x, 10), "paper")
        line(d, (11, 18, 21, 18), "amberlight")
        ell(d, (5, 3, 27, 10), "brown", "ink")
        ell(d, (7, 4, 25, 8), "paper", "ink")
        line(d, (10, 6, 20, 6), "white")
        line(d, (9, 28, 23, 28), "brownlight")
    elif id == "ilu":
        line(d, (13, 19, 6, 29), "ink", 3)
        line(d, (20, 19, 27, 29), "ink", 3)
        line(d, (16, 20, 16, 29), "ink", 3)
        line(d, (13, 20, 6, 29), "brownlight")
        line(d, (20, 20, 27, 29), "brownlight")
        line(d, (16, 21, 16, 29), "brownlight")
        poly(d, [(7, 6), (25, 6), (24, 21), (9, 21)], "coraldark", "ink")
        for x in (10, 14, 19, 23):
            line(d, (x, 9, x, 18), "coral")
            line(d, (x, 9, 23 if x<16 else 10, 20), "paper")
        line(d, (9, 19, 23, 19), "amberlight")
        ell(d, (6, 3, 26, 10), "brown", "ink")
        ell(d, (8, 4, 24, 8), "paper", "ink")
    elif id == "headwrap-display":
        plinth(d)
        rect(d, (14, 16, 18, 22), "grey", "ink")
        ell(d, (9, 8, 23, 20), "greylight", "ink")
        ell(d, (7, 2, 25, 14), "violet", "ink")
        poly(d, [(7, 10), (10, 5), (24, 9), (24, 13), (9, 13)], "violetdark", "ink")
        line(d, (9, 8, 23, 12), "violetlight")
        line(d, (11, 4, 22, 8), "violetlight")
        poly(d, [(21, 6), (26, 4), (27, 8), (24, 10), (21, 9)], "violet", "ink")
        poly(d, [(23, 9), (28, 12), (25, 15), (21, 12)], "violet", "ink")
    elif id == "beads-display":
        plinth(d)
        poly(d, [(12, 3), (20, 3), (22, 8), (26, 12), (25, 21), (7, 21), (6, 12), (10, 8)], "navylight", "ink")
        points = [(11, 8), (10, 11), (10, 14), (11, 17), (13, 19), (16, 20), (19, 19), (21, 17), (22, 14), (22, 11), (21, 8)]
        line(d, tuple(v for point in points for v in point), "paper")
        for x, y in points:
            rect(d, (x-1, y-1, x+1, y+1), "cyanlight", "cyandark")
        for x, y in ((12, 10), (12, 13), (13, 16), (16, 17), (19, 16), (20, 13), (20, 10)):
            rect(d, (x, y, x+1, y+1), "white", "grey")
    elif id == "pano-da-costa-display":
        plinth(d)
        line(d, (7, 6, 25, 6), "brownlight", 2)
        line(d, (9, 7, 9, 22), "brown", 2)
        line(d, (23, 7, 23, 22), "brown", 2)
        poly(d, [(5, 6), (26, 6), (26, 19), (21, 21), (16, 19), (11, 21), (5, 19)], "paper", "ink")
        for y in (9, 14, 18):
            line(d, (6, y, 25, y), "coraldark", 2)
        for x in (8, 12, 16, 20, 24):
            rect(d, (x, 11, x, 12), "amberdark")
    elif id == "kente-cloth":
        plinth(d)
        rect(d, (5, 3, 27, 22), "amber", "ink")
        for col in range(4):
            x = 6+col*5
            for row in range(3):
                y = 4+row*6
                rect(d, (x, y, x+4, y+5), "amber" if (row+col)%2 else "greendark")
                if (row+col)%2:
                    for yy in (y+1, y+3):
                        line(d, (x, yy, x+4, yy), "coraldark")
                else:
                    poly(d, [(x+2, y+1), (x+4, y+3), (x+2, y+4), (x, y+3)], "amberlight")
            line(d, (x, 4, x, 21), "brown")
        for x in range(6, 27, 2):
            line(d, (x, 23, x, 25), "amberlight")
    elif id == "ankara-cloth":
        plinth(d)
        rect(d, (5, 3, 27, 22), "cyandark", "ink")
        for row in range(3):
            for col in range(3):
                x, y = 9+col*7, 7+row*6
                ell(d, (x-2, y-2, x+2, y+2), "coral", "ink")
                rect(d, (x, y-1, x, y+1), "amberlight")
                line(d, (x+2, y+2, x+4, y+3), "cyanlight")
        line(d, (6, 21, 26, 21), "cyanlight")
    elif id == "balangandas-display":
        plinth(d)
        rect(d, (5, 3, 27, 22), "navy", "ink")
        line(d, (9, 7, 12, 5, 16, 6, 21, 5, 24, 7), "greylight")
        ell(d, (10, 7, 23, 12), None, "greylight")
        for x, y in ((10, 14), (14, 17), (19, 17), (23, 14)):
            line(d, (x, 11, x, y), "grey")
        poly(d, [(8, 14), (10, 12), (12, 14), (10, 18)], "greylight", "ink")
        rect(d, (13, 16, 16, 20), "greylight", "ink")
        ell(d, (17, 16, 21, 20), "greylight", "ink")
        poly(d, [(21, 14), (24, 13), (26, 15), (24, 18), (22, 17)], "greylight", "ink")
        line(d, (9, 14, 10, 15), "white")
    elif id in ("wooden-mask-display", "metal-mask-display"):
        plinth(d)
        rect(d, (14, 17, 18, 22), "grey", "ink")
        tint = "brownlight" if id == "wooden-mask-display" else "amberdark"
        shade = "brown" if id == "wooden-mask-display" else "amber"
        poly(d, [(11, 3), (21, 3), (25, 8), (23, 16), (16, 21), (9, 16), (7, 8)], tint, "ink")
        if id == "wooden-mask-display":
            line(d, (11, 5, 10, 15), "amberdark")
            line(d, (21, 5, 22, 15), "amberdark")
            poly(d, [(14, 5), (18, 5), (16, 8)], "brown", "ink")
        else:
            line(d, (11, 4, 20, 4, 23, 8), "amberlight")
            for x, y in ((9, 8), (23, 8), (12, 17), (20, 17)):
                rect(d, (x, y, x, y), "amberlight")
        line(d, (10, 10, 13, 10), "navy", 2)
        line(d, (19, 10, 22, 10), "navy", 2)
        line(d, (16, 10, 16, 14), shade, 2)
        line(d, (14, 17, 18, 17), "navy")
    elif id == "ancestral-sculpture-display":
        plinth(d)
        ell(d, (12, 2, 20, 9), "brown", "ink")
        rect(d, (15, 8, 17, 10), "brownlight", "ink")
        poly(d, [(12, 10), (20, 10), (22, 17), (20, 20), (12, 20), (10, 17)], "brown", "ink")
        line(d, (13, 12, 11, 17, 15, 17), "brownlight", 2)
        line(d, (19, 12, 21, 17, 17, 17), "brownlight", 2)
        rect(d, (10, 20, 14, 22), "brown", "ink")
        rect(d, (18, 20, 22, 22), "brown", "ink")
        rect(d, (14, 5, 18, 6), "amberdark")
        line(d, (16, 13, 16, 18), "amberdark")
    elif id == "orixa-context-exhibit":
        plinth(d)
        ell(d, (11, 2, 17, 8), "grey", "ink")
        line(d, (12, 3, 15, 3), "greylight")
        rect(d, (13, 8, 15, 10), "grey", "ink")
        poly(d, [(10, 10), (18, 10), (18, 16), (15, 18), (11, 17)], "grey", "ink")
        line(d, (12, 11, 12, 15), "greylight")
        line(d, (11, 17, 10, 21, 13, 21), "navy", 3)
        line(d, (16, 17, 17, 21, 20, 21), "navy", 3)
        line(d, (11, 18, 11, 20), "grey")
        line(d, (17, 18, 18, 20), "grey")
        line(d, (10, 11, 7, 14, 5, 13), "ink", 3)
        line(d, (10, 11, 7, 14, 5, 13), "grey")
        line(d, (18, 11, 20, 15), "ink", 3)
        line(d, (18, 11, 20, 15), "grey")
        line(d, (5, 10, 5, 21), "navy", 2)
        poly(d, [(4, 7), (9, 7), (8, 11), (4, 10)], "grey", "ink")
        line(d, (6, 8, 8, 8), "greylight")
        rect(d, (23, 15, 29, 21), "paper", "ink")
        line(d, (25, 17, 27, 17), "navylight")
        line(d, (25, 19, 28, 19), "grey")
    elif id == "sankofa-relief":
        plinth(d)
        rect(d, (4, 2, 28, 22), "brown", "ink")
        rect(d, (6, 4, 26, 20), "amberdark", "ink")
        poly(d, [(11, 13), (6, 10), (7, 15), (12, 17)], "amberlight", "ink")
        ell(d, (10, 11, 23, 17), "amber", "ink")
        line(d, (21, 12, 23, 9, 20, 7, 15, 6, 12, 8), "ink", 3)
        line(d, (21, 12, 23, 9, 20, 7, 15, 6, 12, 8), "amberlight")
        ell(d, (9, 6, 14, 10), "amberlight", "ink")
        poly(d, [(9, 8), (7, 10), (10, 10)], "amberlight", "ink")
        rect(d, (11, 7, 11, 7), "navy")
        line(d, (14, 16, 14, 19, 18, 19), "amberlight")
        line(d, (20, 16, 20, 19, 24, 19), "amberlight")
        line(d, (15, 13, 20, 15), "amberdark")
    elif id == "iron-tools-display":
        plinth(d)
        rect(d, (4, 2, 28, 22), "brownlight", "ink")
        rect(d, (6, 4, 26, 20), "paper", "ink")
        line(d, (11, 7, 11, 18), "navy", 2)
        poly(d, [(10, 6), (14, 6), (14, 10), (10, 9)], "grey", "ink")
        line(d, (19, 8, 19, 18), "navy", 2)
        line(d, (15, 6, 15, 10, 23, 10, 23, 6), "grey", 2)
        line(d, (19, 6, 19, 10), "grey", 2)
        line(d, (9, 18, 24, 18), "amberdark")
    elif id == "amulet-display":
        plinth(d)
        rect(d, (5, 3, 27, 22), "paper", "ink")
        line(d, (11, 6, 15, 9, 21, 6, 23, 8, 19, 13), "brown")
        poly(d, [(11, 12), (21, 12), (21, 19), (12, 20), (10, 17)], "coraldark", "ink")
        line(d, (13, 14, 19, 14), "coral")
        rect(d, (13, 12, 20, 13), "brownlight", "ink")
        line(d, (18, 7, 17, 10), "brown")
    elif id == "record-player":
        cabinet(d, 20, False)
        rect(d, (5, 10, 27, 21), "brownlight", "ink")
        poly(d, [(5, 10), (5, 3), (27, 3), (27, 10)], "brown", "ink")
        rect(d, (7, 5, 25, 8), "amberdark", "ink")
        ell(d, (8, 12, 23, 19), "navy", "ink")
        ell(d, (13, 14, 18, 17), "coral", "ink")
        rect(d, (15, 15, 16, 16), "paper")
        line(d, (25, 12, 24, 17, 20, 17), "greylight", 2)
        for x in (10, 14, 18, 22):
            line(d, (x, 24, x, 26), "navy")
    elif id == "museum-label-desk":
        scene.table(d, 14, 22)
        scene.paper(d, 5, 7, 12, 10)
        scene.book(d, 20, 11, "violet")
        line(d, (21, 7, 25, 11), "navy")
        rect(d, (23, 18, 25, 19), "coral")
    elif id == "biography-display":
        plinth(d)
        rect(d, (5, 2, 27, 22), "brownlight", "ink")
        rect(d, (7, 4, 25, 20), "paper", "ink")
        ell(d, (9, 6, 15, 12), "brown", "ink")
        rect(d, (9, 11, 15, 15), "cyandark", "ink")
        ell(d, (10, 6, 14, 9), "ink")
        for y in (7, 10, 13):
            line(d, (18, y, 23, y), "navylight")
        line(d, (10, 17, 22, 17), "grey")
        line(d, (10, 19, 20, 19), "grey")
    else:
        raise ValueError(id)

def metadata(index, id, name, category):
    footprint = scene.rect_footprint(0.10, 0.47, 0.82, 0.43)
    anchors = {"approach": scene.anchor(0.50, 1.14, "north", "observing")}
    interaction, layer = "observe", "object"
    if id in ("sofa", "upholstered-armchair", "dining-chair", "rocking-chair", "round-stool"):
        footprint = scene.rect_footprint(0.16, 0.44, 0.68, 0.45)
        anchors["seat"] = scene.anchor(0.50, 0.58, "south", "sitting")
        anchors["approach"] = scene.anchor(0.50, 1.12, "north", "waiting")
        interaction = "sit"
    elif id in ("single-bed", "bunk-bed", "wardrobe", "long-bookcase", "fridge", "washing-machine"):
        footprint = scene.rect_footprint(0.16, 0.15, 0.68, 0.74)
    elif id in ("wall-shelf", "wall-clock", "curtain"):
        footprint, anchors = None, {}
        interaction = "none"
    elif id == "woven-rug":
        footprint, anchors = None, {}
        interaction, layer = "none", "ground"
    elif id in ("floor-lamp", "coat-stand"):
        footprint = scene.rect_footprint(0.25, 0.78, 0.52, 0.15)
    elif id == "bicycle-rack":
        footprint = scene.rect_footprint(0.03, 0.60, 0.91, 0.29)
    elif id == "accessible-low-table":
        footprint = [scene.rect_footprint(0.08, 0.65, 0.12, 0.23), scene.rect_footprint(0.82, 0.65, 0.12, 0.23)]
        anchors = {"work": scene.anchor(0.50, 0.83, "north", "reading"), "approach": scene.anchor(0.50, 1.10, "north", "observing")}
        interaction = "read"
    elif id in ("classroom-desk", "computer-desk", "tool-bench", "sewing-table", "easel", "museum-label-desk"):
        anchors["work"] = scene.anchor(0.50, 1.12, "north", "working")
        interaction = "read" if id == "museum-label-desk" else "observe"
    elif 40 <= index <= 47:
        footprint = scene.rect_footprint(0.25, 0.64, 0.50, 0.24)
        anchors["perform"] = scene.anchor(0.50, 1.14, "north", "working")
        interaction = "music"
    elif 48 <= index <= 60:
        footprint = scene.rect_footprint(0.22, 0.70, 0.60, 0.20)
        anchors["read"] = scene.anchor(0.50, 1.12, "north", "reading")
        interaction = "read"
    elif id == "record-player":
        interaction = "music"
    record = {"index": index, "id": id, "name": name, "category": category, "solidFootprint": footprint, "anchors": anchors, "layer": layer, "interaction": interaction, "sourceRect": {"x": index%8*32, "y": index//8*32, "width": 32, "height": 32}}
    if 48 <= index <= 60:
        record["illustrationStatus"] = "Original educational illustration. Specific meanings require the accompanying sourced text; this sprite is not an authentic ritual object or a replica."
    if id == "berimbau":
        record["designRevision"] = "1.7"
        record["depictedParts"] = ["verga de madeira arqueada", "arame de aço tensionado", "cabaça ressonadora na parte inferior", "baqueta", "caxixi", "dobrão"]
        record["references"] = ["https://bibliotecadigital.iphan.gov.br/bitstreams/835bd81e-1742-433d-bd9f-dbe2e8dbdbe4/download", "https://music.yale.edu/browse-collection/berimbau-42032010"]
    return record

def main():
    atlas = empty(256, 256)
    records, sprites = [], []
    for index, (id, name, category) in enumerate(PROPS):
        sprite = prop(index, id)
        sprites.append(sprite)
        atlas.alpha_composite(sprite, ((index%8)*32, (index//8)*32))
        records.append(metadata(index, id, name, category))
    out = ROOT / "assets" / "tilesets"
    out.mkdir(parents=True, exist_ok=True)
    atlas.save(out / "expanded-props.png", optimize=True)
    manifest = {"version": "1.6", "license": "CC0-1.0", "attributionRequired": False, "author": "Original VOICES pixel art", "atlas": "assets/tilesets/expanded-props.png", "generator": "tools/create_expanded_assets.py", "tileSize": 32, "columns": 8, "rows": 8, "coordinateUnits": "tile-fraction", "sourceRectUnits": "pixel", "anchorConvention": "Anchor positions are relative to the sprite top-left; positions beyond the cell indicate an adjacent activity or approach point.", "visualReferences": SOURCES, "palette": scene.base.P, "props": records}
    (out / "expanded-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    preview = Image.new("RGB", (1280, 1232), "#e7dfcc")
    d = ImageDraw.Draw(preview)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except OSError:
        font = ImageFont.load_default()
    for index, ((id, name, category), sprite) in enumerate(zip(PROPS, sprites)):
        x, y = (index%8)*160, (index//8)*154
        rect(d, (x+6, y+5, x+153, y+119), "#ded3b9")
        scaled = sprite.resize((112, 112), Image.Resampling.NEAREST)
        preview.paste(scaled, (x+24, y+5), scaled)
        rows = [""]
        for word in f"{index:02d} {name}".split():
            value = (rows[-1]+" "+word).strip()
            if d.textlength(value, font=font) > 150:
                rows.append(word)
            else:
                rows[-1] = value
        for row, label in enumerate(rows[:2]):
            d.text((x+7, y+121+row*14), label, fill=scene.base.P["navy"], font=font)
    dest = ROOT / "tests" / "expanded-assets-preview.png"
    preview.save(dest, optimize=True)
    print(json.dumps({"atlas": str(out / "expanded-props.png"), "size": atlas.size, "props": len(PROPS), "alphaExtrema": atlas.getchannel("A").getextrema(), "occupiedPixelsPerCell": [sum(s.getchannel("A").histogram()[1:]) for s in sprites], "uniqueFrames": len(set(s.tobytes() for s in sprites))}, ensure_ascii=False))

if __name__ == "__main__":
    main()
