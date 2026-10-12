from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_protest_palette', ROOT / 'tools' / 'create_pixel_assets.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty
P = base.P
SKINS = [
    ('#59382d', '#8a5c43', '#35251f'),
    ('#764a34', '#a77550', '#4b3228'),
    ('#946244', '#c08a5c', '#624333'),
    ('#ad7851', '#d6a073', '#7d5239'),
    ('#684534', '#9b6a4b', '#432d25'),
    ('#bd8963', '#e0ad7d', '#895d42'),
]
HAIRS = [('#25212c', '#534047'), ('#322931', '#695145'), ('#403034', '#806051'), ('#5b504f', '#aaa79c'), ('#6e6660', '#c1bcb0'), ('#292531', '#6c5158')]
PEOPLE = [
    {'id':'protest-livia','name':'Lívia','age':33,'occupation':'Educadora e organizadora da roda','group':'organizer','action':'chant','body':'average','hairStyle':'braided-bun','outfit':'tshirt','color':'#b45657','pants':'#38465c','skinIndex':0,'hairIndex':0,'shirtSymbol':'fist','accessory':'earrings','signText':'BLACK LIVES MATTER','signColor':'#eddbc0'},
    {'id':'protest-samuel','name':'Samuel','age':42,'occupation':'Técnico de som e apoio à organização','group':'organizer','action':'greeting','body':'broad','hairStyle':'short-coils','outfit':'open-shirt','color':'#4e877e','pants':'#705c48','skinIndex':3,'hairIndex':1,'shirtSymbol':'equality','accessory':'glasses','signText':None},
    {'id':'protest-juliete','name':'Juliete','age':26,'occupation':'Estudante de história e mediadora de conversas','group':'organizer','action':'chant','body':'slender','hairStyle':'wrap-high','outfit':'tshirt','color':'#506d9e','pants':'#725065','skinIndex':1,'hairIndex':0,'shirtSymbol':'heart','accessory':'earrings','wrap':'#b77a39','signText':'VIDAS NEGRAS IMPORTAM','signColor':'#a6c9bc'},
    {'id':'protest-ezequiel','name':'Ezequiel','age':61,'occupation':'Professor aposentado e organizador da escuta','group':'organizer','action':'observing','body':'average','hairStyle':'gray-curls','outfit':'cardigan','color':'#8c6457','pants':'#415059','skinIndex':2,'hairIndex':3,'shirtSymbol':'sprout','accessory':'glasses','beard':True,'signText':None},
    {'id':'protest-priscila','name':'Priscila','age':39,'occupation':'Enfermeira e apoio ao encontro','group':'organizer','action':'chant','body':'wide','hairStyle':'round-afro','outfit':'tshirt','color':'#c78c4d','pants':'#45555b','skinIndex':4,'hairIndex':1,'shirtSymbol':'fist','accessory':'earrings','signText':'DIGNIDADE E JUSTIÇA','signColor':'#c9b6d8'},
    {'id':'protest-wellington','name':'Wellington','age':30,'occupation':'Designer dos materiais do encontro','group':'organizer','action':'chant','body':'slender','hairStyle':'tied-locs','outfit':'tshirt','color':'#6b588b','pants':'#9a825e','skinIndex':5,'hairIndex':2,'shirtSymbol':'equality','accessory':'backpack','signText':'OUÇA AS VOZES NEGRAS','signColor':'#e9cf9b'},
    {'id':'protest-debora','name':'Débora','age':34,'occupation':'Musicista e percussionista da roda','group':'musician','action':'playing','body':'average','hairStyle':'wrap-side','outfit':'blouse','color':'#797f51','pants':'#704858','skinIndex':2,'hairIndex':1,'shirtSymbol':'heart','accessory':'earrings','wrap':'#b84f5a','instrument':'tambourine','instrumentName':'Pandeiro','signText':None},
    {'id':'protest-moises','name':'Moisés','age':44,'occupation':'Professor de percussão','group':'musician','action':'playing','body':'broad','hairStyle':'short-fade','outfit':'tshirt','color':'#49828b','pants':'#5b4b47','skinIndex':0,'hairIndex':0,'shirtSymbol':'sprout','accessory':'none','beard':True,'instrument':'hand-drum','instrumentName':'Tambor de mão','signText':None},
    {'id':'protest-cassio','name':'Cássio','age':23,'occupation':'Estudante e guitarrista','group':'musician','action':'playing','body':'slender','hairStyle':'loose-twists','outfit':'open-shirt','color':'#b2644c','pants':'#36465e','skinIndex':3,'hairIndex':2,'shirtSymbol':'equality','accessory':'headphones','instrument':'guitar','instrumentName':'Guitarra','signText':None},
    {'id':'protest-soraia','name':'Soraia','age':50,'occupation':'Musicista e oficineira da comunidade','group':'musician','action':'playing','body':'wide','hairStyle':'box-braids','outfit':'dress','color':'#635489','pants':'#635489','skinIndex':4,'hairIndex':0,'shirtSymbol':'heart','accessory':'earrings','instrument':'agogo','instrumentName':'Agogô','signText':None},
    {'id':'protest-silas','name':'Silas','age':28,'occupation':'Percussionista e técnico de iluminação','group':'musician','action':'playing','body':'average','hairStyle':'short-locs','outfit':'tshirt','color':'#be9754','pants':'#4b4d58','skinIndex':1,'hairIndex':1,'shirtSymbol':'fist','accessory':'none','instrument':'shaker','instrumentName':'Chocalho','signText':None},
    {'id':'protest-tais','name':'Taís','age':21,'occupation':'Estudante e musicista','group':'musician','action':'playing','body':'slender','hairStyle':'wrap-low','outfit':'overalls','color':'#527586','pants':'#527586','skinIndex':5,'hairIndex':2,'shirtSymbol':'sprout','accessory':'earrings','wrap':'#846496','instrument':'tambourine','instrumentName':'Pandeiro','signText':None},
    {'id':'protest-ariane','name':'Ariane','age':32,'occupation':'Arquiteta e participante do encontro','group':'sign-holder','action':'chant','body':'average','hairStyle':'cornrows','outfit':'tshirt','color':'#568b73','pants':'#9e835e','skinIndex':0,'hairIndex':0,'shirtSymbol':'equality','accessory':'glasses','signText':'BLACK LIVES MATTER','signColor':'#dbc9a7'},
    {'id':'protest-jeferson','name':'Jeferson','age':37,'occupation':'Cozinheiro e participante do encontro','group':'sign-holder','action':'observing','body':'wide','hairStyle':'rounded-coils','outfit':'tshirt','color':'#844f64','pants':'#374b5c','skinIndex':2,'hairIndex':1,'shirtSymbol':'fist','accessory':'none','beard':True,'signText':'VIDAS NEGRAS IMPORTAM','signColor':'#c4d6c2'},
    {'id':'protest-clarissa','name':'Clarissa','age':24,'occupation':'Artista e autora de cartazes','group':'sign-holder','action':'chant','body':'slender','hairStyle':'wrap-knot','outfit':'blouse','color':'#477584','pants':'#b28e60','skinIndex':1,'hairIndex':0,'shirtSymbol':'heart','accessory':'earrings','wrap':'#d6a54f','signText':'RESPEITO E CUIDADO','signColor':'#eddac2'},
    {'id':'protest-dario','name':'Dário','age':53,'occupation':'Motorista e leitor da biblioteca','group':'sign-holder','action':'observing','body':'broad','hairStyle':'gray-short','outfit':'open-shirt','color':'#788556','pants':'#5a4c60','skinIndex':3,'hairIndex':4,'shirtSymbol':'equality','accessory':'glasses','signText':'DIREITOS PARA TODAS AS PESSOAS','signColor':'#bdd0dc'},
    {'id':'protest-avelina','name':'Avelina','age':64,'occupation':'Costureira aposentada e participante do encontro','group':'sign-holder','action':'greeting','body':'average','hairStyle':'gray-bun','outfit':'cardigan','color':'#ab6b6d','pants':'#54664d','skinIndex':4,'hairIndex':4,'shirtSymbol':'sprout','accessory':'earrings','signText':'MEMÓRIA E DIGNIDADE','signColor':'#d9c4dd'},
    {'id':'protest-edivaldo','name':'Edivaldo','age':19,'occupation':'Aprendiz de marcenaria e participante','group':'sign-holder','action':'chant','body':'slender','hairStyle':'high-top','outfit':'tshirt','color':'#b87b48','pants':'#3a535c','skinIndex':5,'hairIndex':0,'shirtSymbol':'fist','accessory':'backpack','signText':'POR UM FUTURO SEM RACISMO','signColor':'#cfddbd'},
    {'id':'protest-raissa','name':'Raíssa','age':27,'occupation':'Estudante e voluntária do ponto de água','group':'volunteer','action':'working','body':'average','hairStyle':'beaded-braids','outfit':'overalls','color':'#79668b','pants':'#79668b','skinIndex':2,'hairIndex':2,'shirtSymbol':'heart','accessory':'earrings','heldObject':'water-bottle','signText':None},
    {'id':'protest-aldo','name':'Aldo','age':47,'occupation':'Técnico de informática e participante','group':'listener','action':'listening','body':'broad','hairStyle':'bald','outfit':'tshirt','color':'#4f7d75','pants':'#a08866','skinIndex':1,'hairIndex':0,'shirtSymbol':'equality','accessory':'glasses','beard':True,'signText':None},
    {'id':'protest-marlene','name':'Marlene','age':58,'occupation':'Bibliotecária e voluntária da leitura','group':'volunteer','action':'reading','body':'wide','hairStyle':'wrap-folded','outfit':'dress','color':'#b98157','pants':'#b98157','skinIndex':0,'hairIndex':3,'shirtSymbol':'sprout','accessory':'glasses','wrap':'#456f85','heldObject':'notebook','signText':None},
    {'id':'protest-josias','name':'Josias','age':35,'occupation':'Pai e cuidador presente no encontro','group':'caregiver','action':'listening','body':'average','hairStyle':'medium-locs','outfit':'cardigan','color':'#536b93','pants':'#735444','skinIndex':4,'hairIndex':1,'shirtSymbol':'heart','accessory':'backpack','signText':None},
    {'id':'protest-fabiola','name':'Fabíola','age':40,'occupation':'Fotógrafa e ouvinte do encontro','group':'listener','action':'observing','body':'slender','hairStyle':'loose-afro','outfit':'blouse','color':'#9d5871','pants':'#53625b','skinIndex':3,'hairIndex':2,'shirtSymbol':'fist','accessory':'camera','signText':None},
    {'id':'protest-sebastiao','name':'Sebastião','age':71,'occupation':'Vizinho aposentado e participante da roda','group':'listener','action':'listening','body':'average','hairStyle':'gray-coils','outfit':'open-shirt','color':'#8b8159','pants':'#4b5363','skinIndex':5,'hairIndex':4,'shirtSymbol':'equality','accessory':'glasses','beard':True,'signText':None},
]


def shade(hexcolor, amount):
    v = tuple(int(hexcolor[k:k+2], 16) for k in (1, 3, 5))
    return '#'+''.join(f'{max(0,min(255,round(x+amount))):02x}' for x in v)


def enrich(p):
    s, sl, sd = SKINS[p['skinIndex']]
    h, hh = HAIRS[p['hairIndex']]
    p.update(skin=s, skinlight=sl, skindark=sd, hair=h, hairlight=hh, coat=p['color'], shirt=shade(p['color'], 28), ageType='adult')
    style = p['hairStyle']
    p['style'] = 'afro' if style in ('round-afro','loose-afro','rounded-coils','gray-curls','gray-coils') else 'bun' if 'bun' in style else 'long' if style in ('box-braids','beaded-braids','medium-locs','loose-twists','tied-locs') else 'short'
    p['instrument'] = p.get('instrument')
    p['hairDescription'] = {'braided-bun':'coque de tranças','short-coils':'cabelo crespo curto','wrap-high':'turbante alto ocre','gray-curls':'cachos grisalhos','round-afro':'afro arredondado','tied-locs':'locs presos','wrap-side':'turbante coral com nó lateral','short-fade':'corte natural baixo com laterais curtas','loose-twists':'twists soltos','box-braids':'tranças longas','short-locs':'locs curtos','wrap-low':'turbante violeta baixo','cornrows':'tranças rentes ao couro cabeludo','rounded-coils':'cachos crespos arredondados','wrap-knot':'turbante dourado com nó frontal','gray-short':'cabelo grisalho curto','gray-bun':'coque grisalho','high-top':'corte crespo alto','beaded-braids':'tranças com contas nas pontas','bald':'cabeça raspada','wrap-folded':'turbante azul com dobras','medium-locs':'locs médios','loose-afro':'afro amplo','gray-coils':'cabelo crespo grisalho'}[style]
    p['clothingDescription'] = {'tshirt':'camiseta','open-shirt':'camisa aberta sobre camiseta','cardigan':'cardigã sobre camiseta','blouse':'blusa estampada','dress':'vestido confortável','overalls':'jardineira sobre camiseta'}[p['outfit']]
    p['appearance'] = 'Pessoa negra original e fictícia; '+str(p['age'])+' anos; '+p['hairDescription']+'; '+p['clothingDescription']+'; símbolo gráfico original de '+{'fist':'punho erguido','equality':'igualdade','heart':'coração','sprout':'broto'}[p['shirtSymbol']]+'.'
    return p


for person in PEOPLE:
    enrich(person)


def symbol(d, name, x, y, color, scale=1):
    bits = {'fist':['01110','11111','11111','01110','01100'],'equality':['11111','00000','11111','00000','00000'],'heart':['01010','11111','11111','01110','00100'],'sprout':['10001','11011','01110','00100','00100']}[name]
    for yy, row in enumerate(bits):
        for xx, pixel in enumerate(row):
            if pixel == '1': rect(d, (x+xx*scale, y+yy*scale, x+(xx+1)*scale-1, y+(yy+1)*scale-1), color)


def wrap_small(d, p, direction, bob):
    style = p['hairStyle']
    color = p['wrap']
    hi, sd = shade(color, 32), shade(color, -33)
    side = direction == 1
    if style == 'wrap-high':
        poly(d, [(9,8+bob),(9,4+bob),(12,1+bob),(18,0+bob),(23,3+bob),(23,8+bob),(19,9+bob),(13,8+bob)], color, 'ink')
        line(d, (12,4+bob,18,2+bob,21,4+bob), hi)
        line(d, (11,6+bob,20,5+bob), sd)
    elif style == 'wrap-side':
        ell(d, (9,2+bob,23,11+bob), color, 'ink')
        ell(d, (21,5+bob,27,10+bob), color, 'ink')
        poly(d, [(24,8+bob),(27,9+bob),(26,14+bob),(22,11+bob)], sd, 'ink')
        line(d, (12,5+bob,19,4+bob,23,7+bob), hi)
        line(d, (24,7+bob,25,9+bob), hi)
    elif style == 'wrap-low':
        ell(d, (9,3+bob,23,10+bob), color, 'ink')
        line(d, (11,7+bob,20,4+bob), hi)
        line(d, (12,8+bob,22,7+bob), sd)
        poly(d, [(20,7+bob),(24,6+bob),(24,10+bob),(22,12+bob)], color, 'ink')
    elif style == 'wrap-knot':
        ell(d, (9,2+bob,23,10+bob), color, 'ink')
        ell(d, (14,0+bob,20,7+bob), color, 'ink')
        line(d, (10,6+bob,16,8+bob,22,5+bob), sd)
        line(d, (15,3+bob,18,1+bob,19,4+bob), hi)
    else:
        poly(d, [(9,9+bob),(9,5+bob),(12,1+bob),(19,1+bob),(24,6+bob),(23,10+bob),(18,8+bob),(13,9+bob)], color, 'ink')
        line(d, (11,7+bob,19,2+bob,22,5+bob), hi)
        line(d, (12,9+bob,20,4+bob,23,7+bob), sd)
    if direction == 3:
        ell(d, (10,5+bob,22,14+bob), color, 'ink')
        line(d, (12,8+bob,20,6+bob), hi)
        line(d, (12,11+bob,21,9+bob), sd)
    elif side:
        rect(d, (9,8+bob,10,9+bob), p['skin'])


def hair_small(d, p, direction, bob):
    h, hi, style = p['hair'], p['hairlight'], p['hairStyle']
    if style.startswith('wrap-'):
        wrap_small(d, p, direction, bob)
        return
    if style == 'bald':
        rect(d, (7,0+bob,25,9+bob), (0,0,0,0))
        ell(d, (10,5+bob,21,15+bob), p['skin'], 'ink')
        line(d, (12,6+bob,17,5+bob), p['skinlight'])
        if direction == 1:
            poly(d, [(10,10+bob),(8,12+bob),(9,13+bob),(11,13+bob)], p['skin'], 'ink')
            rect(d, (11,10+bob,12,11+bob), 'ink')
        elif direction != 3:
            rect(d, (12,10+bob,13,11+bob), 'ink'); rect(d, (18,10+bob,19,11+bob), 'ink')
        return
    if style in ('short-fade','short-coils','gray-short'):
        rect(d, (8,0+bob,25,8+bob), (0,0,0,0))
        poly(d, [(10,8+bob),(11,4+bob),(15,2+bob),(20,3+bob),(23,6+bob),(21,9+bob),(18,7+bob),(13,7+bob)], h, 'ink')
        for x,y in ((12,5),(15,3),(19,4)):
            rect(d, (x,y+bob,x+1,y+bob), hi)
        if style == 'short-fade':
            rect(d, (21,7+bob,22,10+bob), p['skindark'])
        if direction == 3:
            ell(d, (10,5+bob,21,14+bob), h, 'ink')
            line(d, (12,7+bob,18,6+bob), hi)
    elif style == 'high-top':
        rect(d, (10,1+bob,22,8+bob), h, 'ink')
        poly(d, [(11,1+bob),(13,0+bob),(20,0+bob),(22,2+bob),(21,6+bob),(11,6+bob)], h, 'ink')
        line(d, (12,2+bob,19,1+bob), hi)
        rect(d, (10,8+bob,11,9+bob), p['skindark'])
        rect(d, (21,8+bob,22,9+bob), p['skindark'])
        if direction == 3: rect(d, (11,8+bob,21,13+bob), h, 'ink')
    elif style in ('box-braids','beaded-braids','loose-twists','medium-locs','tied-locs','short-locs'):
        long = style not in ('short-locs',)
        if direction == 3:
            rect(d, (9,4+bob,22,(20 if long else 14)+bob), h, 'ink')
        for x in (9,12,19,22):
            end = (19 if style in ('box-braids','beaded-braids','medium-locs') else 17 if style in ('loose-twists','tied-locs') else 12) if x in (9,22) else 8
            line(d, (x,4+bob,x+1,end+bob), h, 2)
            for y in range(6,end,3):
                line(d, (x,y+bob,x+1,y+1+bob), hi)
            if style == 'beaded-braids' and x in (9,22):
                for y,tint in ((17,'amberlight'),(19,'corallight')): rect(d, (x,y+bob,x+1,y+bob), tint)
        if style == 'tied-locs':
            if direction == 3:
                line(d, (12,11+bob,21,11+bob), '#b88754')
                poly(d, [(16,11+bob),(21,11+bob),(22,18+bob),(18,20+bob)], h, 'ink')
                line(d, (19,13+bob,20,18+bob), hi)
            else:
                ell(d, (20,2+bob,25,7+bob), h, 'ink')
                line(d, (22,3+bob,23,5+bob), hi)
    elif style == 'cornrows':
        rect(d, (8,0+bob,25,8+bob), (0,0,0,0))
        ell(d, (10,3+bob,22,9+bob), p['skindark'], 'ink')
        for x in (11,14,17,20):
            line(d, (x,5+bob,x+1,3+bob,x+2,7+bob), h)
            rect(d, (x+1,4+bob,x+1,4+bob), hi)
        if direction == 3:
            ell(d, (10,4+bob,22,14+bob), p['skindark'], 'ink')
            for x in (12,15,18,21): line(d, (x,5+bob,x,13+bob), h)
            poly(d, [(20,9+bob),(24,11+bob),(24,18+bob),(21,16+bob)], h, 'ink')
    elif style in ('braided-bun','gray-bun'):
        for x in (12,15,18,21): line(d, (x,4+bob,x+1,7+bob), hi)
        for x in (14,17,20): line(d, (x,1+bob,x+1,3+bob), hi)
        if direction == 3:
            ell(d, (9,3+bob,22,14+bob), h, 'ink')
            for x in (12,15,18,21): line(d, (x,5+bob,x+1,11+bob), hi)
    else:
        for x,y in ((10,3),(14,1),(19,2),(23,5),(22,8)):
            rect(d, (x,y+bob,x+1,y+bob), hi)
        if style == 'loose-afro':
            ell(d, (5,4+bob,10,11+bob), h, 'ink')
            ell(d, (22,3+bob,28,11+bob), h, 'ink')
            rect(d, (7,6+bob,8,7+bob), hi)
            rect(d, (24,5+bob,25,6+bob), hi)
        if direction == 3:
            for x,y in ((11,9),(15,7),(19,11)): rect(d, (x,y+bob,x+1,y+bob), hi)


def clothes_small(d, p, direction, frame):
    bob = frame%2
    side = direction == 1
    c, hi, sd = p['coat'], shade(p['coat'],28), shade(p['coat'],-29)
    if not side:
        body = {'slender':(10,21),'average':(9,22),'broad':(7,24),'wide':(6,25)}[p['body']]
        l,r = body
        poly(d, [(l+2,16+bob),(r-2,16+bob),(r,20),(r-1,24),(l+1,24),(l,20)], c, 'ink')
        line(d, (l+3,17+bob,r-3,17+bob), hi)
        if p['outfit'] in ('cardigan','open-shirt') and direction != 3:
            rect(d, (12,17+bob,19,24), p['shirt'])
            line(d, (11,18+bob,11,23), sd)
            line(d, (20,18+bob,20,23), sd)
        if p['outfit'] == 'overalls':
            rect(d, (10,16+bob,21,20), '#d3c3a5', 'ink')
            rect(d, (12,16+bob,13,24), c)
            rect(d, (18,16+bob,19,24), c)
            rect(d, (12,19,19,24), c, 'ink')
            for x in (13,18): rect(d, (x,19,x,19), 'amberlight')
        if direction != 3:
            symbol(d, p['shirtSymbol'], 13,18+bob, '#f4e5c9')
        if p['outfit'] == 'blouse':
            for x in (11,19):
                for y in (18,22): rect(d, (x,y+bob,x+1,y+bob), '#dcbb7a')
        if p['outfit'] == 'dress':
            poly(d, [(10,23),(21,23),(24,28),(7,28)], c, 'ink')
            line(d, (12,24,11,27), hi)
            line(d, (19,24,20,27), sd)
            rect(d, (10,29,13,30), '#806454', 'ink')
            rect(d, (18,29,21,30), '#806454', 'ink')
    else:
        poly(d, [(14,16+bob),(21,16+bob),(23,20+bob),(22,24),(12,24),(12,19+bob)], c, 'ink')
        line(d, (15,17+bob,20,17+bob), hi)
        if p['outfit'] == 'dress':
            poly(d, [(12,23),(22,23),(24,28),(10,28)], c, 'ink')
            line(d, (16,24,17,27), hi)
        if p['outfit'] == 'blouse':
            for x,y in ((14,18),(20,22)): rect(d, (x,y+bob,x+1,y+bob), '#dcbb7a')
        if p['outfit'] == 'overalls':
            rect(d, (13,17+bob,18,20), '#d3c3a5')
            line(d, (17,17+bob,17,24), c, 2)
        if p['outfit'] in ('cardigan','open-shirt'): rect(d, (12,18+bob,14,23), p['shirt'])
    if not side:
        stride = (0,1,0,-1)[frame]
        for x,phase in ((10,max(0,stride)),(17,max(0,-stride))):
            if p['outfit'] != 'dress':
                rect(d, (x,28+phase,x+4,29+phase), '#dedbd0' if p['age'] < 40 else '#503f38', 'ink')
                line(d, (x+1,28+phase,x+3,28+phase), '#adb7b6')


def accessory_small(d, p, direction, bob):
    if direction == 3: return
    if p['accessory'] == 'earrings':
        rect(d, (21,13+bob,22,15+bob), 'amberlight')
        if direction == 0: rect(d, (9,13+bob,10,15+bob), 'amberlight')
    if p.get('beard'):
        if direction == 0:
            line(d, (11,13+bob,13,16+bob,19,16+bob,21,13+bob), p['hair'], 2)
            line(d, (14,14+bob,17,14+bob), p['skindark'])
        else: line(d, (9,14+bob,13,16+bob,17,15+bob), p['hair'], 2)
    if p['age'] >= 58:
        if direction == 0:
            line(d, (11,12+bob,12,12+bob), p['skindark'])
            line(d, (19,12+bob,20,12+bob), p['skindark'])
        else: rect(d, (10,12+bob,10,12+bob), p['skindark'])
    if p['accessory'] == 'glasses':
        if direction == 0:
            rect(d, (10,9+bob,15,12+bob), None, 'ink')
            rect(d, (17,9+bob,22,12+bob), None, 'ink')
            line(d, (15,10+bob,17,10+bob), 'ink')
            rect(d, (11,10+bob,12,10+bob), 'cyanlight')
            rect(d, (18,10+bob,19,10+bob), 'cyanlight')
        else:
            rect(d, (9,9+bob,14,12+bob), None, 'ink')
            line(d, (14,10+bob,20,11+bob), 'ink')


def held_sign(d, p, direction, row, frame):
    if not p['signText']: return
    left = PEOPLE.index(p)%2 == 1
    x = 0 if left else 20
    polex = x+6
    lift = -1 if row == 4 and frame%2 else 0
    line(d, (polex,10+lift,polex,24), '#8c6545', 2)
    line(d, (polex,7+lift,polex,10+lift), '#b58b58', 2)
    rect(d, (polex-1,18,polex+2,20), p['skin'], 'ink')
    line(d, (polex,18,polex+1,18), p['skinlight'])


def instrument_small(d, p, row, frame):
    instrument = p['instrument']
    if not instrument: return
    phase = frame%2 if row == 4 else 0
    if instrument == 'guitar':
        line(d, (10,17,22,22), '#7c6142', 2)
        ell(d, (12,20,22,29), '#8c5b40', 'ink')
        ell(d, (13,21,19,27), '#c89455', 'ink')
        ell(d, (17,18,23,24), '#b27d49', 'ink')
        line(d, (21,22,28,13), '#8c6545', 3)
        line(d, (20,23,28,13), 'paper')
        rect(d, (27,10,30,14), '#6e4937', 'ink')
        line(d, (15,25,19,25), 'ink')
        rect(d, (14+phase,22,17+phase,24), p['skin'], 'ink')
        rect(d, (24,16,26,18), p['skin'], 'ink')
    elif instrument == 'hand-drum':
        line(d, (10,17,22,18), '#94724b', 2)
        poly(d, [(9,19),(23,19),(21,28),(11,28)], '#9b6b45', 'ink')
        ell(d, (9,17,23,21), '#e5c998', 'ink')
        line(d, (11,19,21,19), '#b18d59')
        for x in (11,15,19,22): line(d, (x,21,x-1,27), '#d1b68b')
        rect(d, (9,16+phase,12,18+phase), p['skin'], 'ink')
        rect(d, (21,17-phase,24,19-phase), p['skin'], 'ink')
    elif instrument == 'tambourine':
        ell(d, (20,17+phase,29,25+phase), '#a16a42', 'ink')
        ell(d, (22,19+phase,27,23+phase), '#e1c9a6', 'ink')
        for x,y in ((23,17),(27,18),(28,22),(23,24),(20,21)):
            rect(d, (x,y+phase,x+1,y+phase), 'greylight')
        rect(d, (19,21+phase,22,23+phase), p['skin'], 'ink')
        rect(d, (15,18-phase,18,20-phase), p['skin'], 'ink')
    elif instrument == 'agogo':
        poly(d, [(23,15),(27,15),(29,21),(21,21)], '#80929a', 'ink')
        poly(d, [(28,18),(30,18),(31,24),(26,24)], '#b3b9ae', 'ink')
        line(d, (25,14,25,17,28,17,29,20), '#80929a')
        line(d, (22,18,26,18), '#dbe0cd')
        line(d, (16,20-phase,23,17-phase), '#a68050', 2)
        rect(d, (16,21-phase,19,23-phase), p['skin'], 'ink')
        rect(d, (22,22,24,24), p['skin'], 'ink')
    elif instrument == 'shaker':
        ell(d, (22+phase,16,28+phase,23), '#b98b52', 'ink')
        rect(d, (24+phase,23,26+phase,26), '#765239', 'ink')
        line(d, (23+phase,18,27+phase,18), '#e6c798')
        for x,y in ((23,20),(26,19),(25,22)): rect(d, (x+phase,y,x+phase,y), '#705d47')
        rect(d, (23+phase,24,26+phase,26), p['skin'], 'ink')
        rect(d, (8,22,10,24), p['skin'], 'ink')


def activity_small(d, p, row, frame):
    skin, coat = p['skin'], p['coat']
    if row == 5:
        side = -1 if p['signText'] and PEOPLE.index(p)%2 == 0 else 1
        if side == 1:
            rect(d, (21,16,28,26), (0,0,0,0))
            poly(d, [(20,18),(23,17),(25,13+frame%2),(27,14+frame%2),(25,19),(22,21)], coat, 'ink')
            rect(d, (24,10+frame%2,27,13+frame%2), skin, 'ink')
        else:
            rect(d, (3,16,10,26), (0,0,0,0))
            poly(d, [(11,18),(8,17),(6,13+frame%2),(4,14+frame%2),(6,19),(9,21)], coat, 'ink')
            rect(d, (4,10+frame%2,7,13+frame%2), skin, 'ink')
        if frame == 2: line(d, (14,14,17,14), p['skindark'])
        if p['action'] == 'chant' and frame in (1,3):
            rect(d, (14,13,17,15), 'ink')
            rect(d, (15,13,16,13), 'paper')
    elif row == 4:
        if p['group'] in ('organizer','sign-holder') and p['action'] == 'chant':
            if not p['signText']:
                poly(d, [(21,19),(24,16),(24,12+frame%2),(26,12+frame%2),(27,16),(24,21)], coat, 'ink')
                rect(d, (24,9+frame%2,27,12+frame%2), skin, 'ink')
            if frame in (1,3):
                rect(d, (14,13,17,15), 'ink')
                rect(d, (15,13,16,13), 'paper')
            else: line(d, (14,14,17,14), p['skindark'])
        elif p['group'] != 'musician':
            poly(d, [(21,18),(23,19),(21,22),(16+frame%2,22),(15+frame%2,20)], coat, 'ink')
            rect(d, (14+frame%2,20,17+frame%2,22), skin, 'ink')
            if p.get('heldObject') == 'water-bottle':
                rect(d, (20,19,25,27), '#78a7ae', 'ink')
                rect(d, (21,18,24,19), '#d9d8c5', 'ink')
                line(d, (21,22,24,22), '#d7ded0')
                rect(d, (20+frame%2,23,22+frame%2,25), skin, 'ink')
            elif p.get('heldObject') == 'notebook':
                poly(d, [(12,21),(18,20),(24,22),(23,27),(17,25),(11,27)], '#d9d6bc', 'ink')
                line(d, (17,21,17,25), '#8f8871')
                line(d, (19,22,22,23), '#7d817a')
                line(d, (22+frame%2,18,20+frame%2,23), 'darkgrey')
                rect(d, (21+frame%2,18,23+frame%2,20), skin, 'ink')
            elif frame%2:
                rect(d, (14,14,17,14), p['skindark'])


def sprite(p, row, frame):
    direction = row if row < 4 else 0
    canonical = 1 if direction == 2 else direction
    im = base.sprite({**p,'age':'adult','accessory':'none'}, canonical, frame if row < 4 else 0, 'walk')
    d = ImageDraw.Draw(im)
    clothes_small(d, p, canonical, frame if row < 4 else 0)
    bob = frame%2 if row < 4 else 0
    hair_small(d, p, canonical, bob)
    accessory_small(d, p, canonical, bob)
    if canonical == 3 and p['accessory'] == 'backpack':
        rect(d, (11,17+bob,20,25), '#70584e', 'ink')
        rect(d, (13,20+bob,18,23), '#a47b58', 'ink')
        line(d, (14,21+bob,17,21+bob), '#d8b379')
    if canonical != 3 and p['accessory'] == 'camera':
        line(d, (12,17+bob,20,22), '#543d34')
        rect(d, (17,21,24,25), '#46525f', 'ink')
        ell(d, (19,21,23,25), '#a9c4bc', 'ink')
        ell(d, (20,22,22,24), '#304850')
    if row in (4,5): activity_small(d, p, row, frame)
    instrument_small(d, p, row, frame)
    held_sign(d, p, canonical, row, frame)
    if direction == 2: im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return im


def hair_portrait(d, p):
    h, hi, style = p['hair'], p['hairlight'], p['hairStyle']
    if style.startswith('wrap-'):
        c, sh, hl = p['wrap'], shade(p['wrap'],-32), shade(p['wrap'],32)
        rect(d, (6,0,43,18), (0,0,0,0))
        if style == 'wrap-high':
            poly(d, [(11,16),(11,7),(16,1),(29,0),(37,7),(37,17),(32,16),(17,16)], c, 'ink')
            line(d, (14,9,25,3,32,6), hl, 2)
            line(d, (15,13,31,8,34,10), sh, 2)
        elif style == 'wrap-side':
            ell(d, (11,4,37,19), c, 'ink')
            ell(d, (34,8,44,19), c, 'ink')
            poly(d, [(37,15),(43,17),(41,25),(35,21)], sh, 'ink')
            line(d, (15,10,28,7,35,11), hl, 2)
            line(d, (38,11,40,15), hl, 2)
        elif style == 'wrap-low':
            ell(d, (11,6,37,18), c, 'ink')
            line(d, (14,13,31,8), hl, 2)
            line(d, (15,16,35,12), sh, 2)
            poly(d, [(33,13),(40,10),(41,18),(37,21)], c, 'ink')
        elif style == 'wrap-knot':
            ell(d, (11,4,37,19), c, 'ink')
            ell(d, (20,0,31,13), c, 'ink')
            line(d, (13,12,24,17,34,11), sh, 2)
            line(d, (22,6,27,2,29,7), hl, 2)
        else:
            poly(d, [(11,17),(11,9),(17,2),(28,2),(38,11),(36,19),(29,15),(17,18)], c, 'ink')
            line(d, (14,13,28,4,34,9), hl, 2)
            line(d, (15,17,30,9,35,14), sh, 2)
        return
    if style == 'bald':
        rect(d, (7,0,41,18), (0,0,0,0))
        ell(d, (14,7,34,34), p['skin'], 'ink')
        poly(d, [(15,16),(16,11),(21,9),(25,9),(25,12),(18,15),(17,24),(15,26)], p['skinlight'])
        poly(d, [(32,17),(34,20),(33,29),(29,32),(25,33),(24,31),(29,29),(31,25)], p['skindark'])
        line(d, (17,20,21,20), h); line(d, (27,20,31,20), h)
        rect(d, (17,21,21,23), 'white'); rect(d, (27,21,31,23), 'white')
        rect(d, (19,21,20,24), 'ink'); rect(d, (28,21,29,24), 'ink')
        line(d, (24,23,23,26,25,26), p['skindark'])
        line(d, (21,29,27,29,28,28), 'ink')
    elif style in ('short-fade','short-coils','gray-short'):
        rect(d, (8,0,40,14), (0,0,0,0))
        poly(d, [(13,16),(12,10),(16,6),(28,5),(35,10),(34,16),(30,13),(18,12)], h, 'ink')
        line(d, (16,9,23,7,30,9), hi, 2)
        if style == 'short-fade':
            rect(d, (12,14,15,19), p['skindark'])
            rect(d, (33,14,36,19), p['skindark'])
    elif style == 'high-top':
        rect(d, (10,0,39,14), (0,0,0,0))
        poly(d, [(13,13),(13,3),(18,0),(30,0),(35,4),(35,13)], h, 'ink')
        line(d, (16,4,25,2,31,4), hi, 2)
        rect(d, (13,14,15,18), p['skindark'])
        rect(d, (33,14,35,18), p['skindark'])
    elif style == 'cornrows':
        rect(d, (8,0,40,14), (0,0,0,0))
        ell(d, (12,5,35,17), p['skindark'], 'ink')
        for x in (14,19,24,29):
            line(d, (x,12,x+1,7,x+3,6,x+4,13), h, 2)
            line(d, (x+1,10,x+2,8), hi)
        poly(d, [(34,14),(39,16),(40,30),(36,28)], h, 'ink')
        for y in (18,23,27): line(d, (37,y,39,y+1), hi)
    elif style in ('box-braids','beaded-braids','medium-locs','loose-twists','tied-locs','short-locs'):
        for x in (12,17,31,36):
            end = 35 if style in ('box-braids','beaded-braids','medium-locs') else 31 if style in ('loose-twists','tied-locs') else 23
            line(d, (x,8,x+1,end if x in (12,36) else 14), h, 3)
            for y in range(10,end if x in (12,36) else 14,4): line(d, (x,y,x+1,y+1), hi)
            if style == 'beaded-braids' and x in (12,36):
                rect(d, (x,31,x+1,32), 'amberlight'); rect(d, (x,34,x+1,35), 'corallight')
        if style == 'tied-locs':
            ell(d, (33,3,42,13), h, 'ink')
            line(d, (35,6,39,8), hi, 2)
    elif style in ('braided-bun','gray-bun'):
        for x in (16,21,26,31): line(d, (x,9,x+1,14), hi)
        for x in (20,24,28): line(d, (x,2,x+1,6), hi)
    else:
        for x,y in ((13,6),(19,2),(26,2),(34,7),(38,11),(12,15)):
            rect(d, (x,y,x+2,y+1), hi)
        if style == 'loose-afro':
            ell(d, (5,10,13,24), h, 'ink')
            ell(d, (35,10,44,25), h, 'ink')
            rect(d, (7,14,9,15), hi); rect(d, (39,13,41,14), hi)


def portrait(p, expression):
    im = base.portrait({**p,'age':'adult','accessory':'none'}, expression).resize((48,48), Image.Resampling.NEAREST)
    d = ImageDraw.Draw(im)
    if p['body'] in ('wide','broad'):
        poly(d, [(4,48),(5,40),(12,35),(20,34),(28,34),(36,35),(43,40),(44,48)], p['coat'], 'ink')
    if p['outfit'] in ('cardigan','open-shirt'):
        rect(d, (19,38,29,47), p['shirt'])
        line(d, (17,39,17,47), shade(p['coat'],-29), 2)
        line(d, (31,39,31,47), shade(p['coat'],-29), 2)
    elif p['outfit'] == 'overalls':
        rect(d, (14,37,34,43), '#d3c3a5', 'ink')
        rect(d, (17,37,19,47), p['coat'])
        rect(d, (29,37,31,47), p['coat'])
        rect(d, (18,41,30,47), p['coat'], 'ink')
        for x in (19,29): rect(d, (x,41,x,42), 'amberlight')
    else:
        poly(d, [(14,36),(20,35),(24,39),(28,35),(34,36),(36,48),(12,48)], p['coat'])
        line(d, (18,37,24,41,30,37), shade(p['coat'],26))
    symbol(d, p['shirtSymbol'], 22,42,'#f4e5c9')
    if p['outfit'] == 'blouse':
        for x,y in ((15,40),(32,40),(14,45),(33,45)): rect(d, (x,y,x+1,y+1), '#dec284')
    if p['outfit'] == 'dress':
        line(d, (16,41,15,47), shade(p['coat'],28))
        line(d, (33,41,34,47), shade(p['coat'],-25))
    hair_portrait(d,p)
    if expression == 'happy':
        line(d, (17,22,19,20,21,22), 'ink'); line(d, (27,22,29,20,31,22), 'ink')
        poly(d, [(20,28),(28,28),(27,31),(24,32),(21,30)], 'ink')
        rect(d, (21,28,27,28), 'white')
        rect(d, (22,30,26,30), 'coral')
    elif expression == 'concerned':
        line(d, (17,18,21,19), p['hair']); line(d, (27,19,31,18), p['hair'])
        line(d, (21,29,23,28,26,28,28,29), 'ink')
    if p['accessory'] == 'glasses':
        rect(d, (16,19,22,25), None, 'ink'); rect(d, (26,19,32,25), None, 'ink')
        line(d, (22,21,26,21), 'ink')
        rect(d, (17,20,18,20), 'cyanlight'); rect(d, (27,20,28,20), 'cyanlight')
    elif p['accessory'] == 'earrings':
        for x in (12,35): ell(d, (x,26,x+2,30), 'amberlight', 'amberdark')
    elif p['accessory'] == 'headphones':
        line(d, (10,20,10,11,16,4,29,4,37,12,37,22), '#8b6b4c', 2)
        rect(d, (8,18,12,26), '#b78659', 'ink'); rect(d, (35,18,39,26), '#b78659', 'ink')
        rect(d, (9,20,10,23), 'amberlight'); rect(d, (36,20,37,23), 'amberlight')
    elif p['accessory'] == 'camera':
        line(d, (15,35,31,44), '#59443d', 2)
        rect(d, (30,40,39,47), '#46525f', 'ink')
        ell(d, (33,41,38,47), '#a9c4bc', 'ink')
        ell(d, (35,43,37,45), '#304850')
    elif p['accessory'] == 'backpack':
        line(d, (13,37,14,47), '#6e5449', 3)
        line(d, (35,37,34,47), '#6e5449', 3)
        line(d, (13,38,14,45), '#bd9671')
    if p.get('beard'):
        line(d, (16,28,20,34,28,34,32,28), p['hair'], 3)
        line(d, (19,29,28,29), p['skindark'])
        if p['age'] > 58:
            for x,y in ((19,32),(24,34),(29,32)): rect(d, (x,y,x+1,y), p['hairlight'])
    if p['age'] >= 58:
        line(d, (15,23,16,24), p['skindark']); line(d, (32,23,33,24), p['skindark'])
        line(d, (17,27,18,29), p['skindark']); line(d, (30,27,29,29), p['skindark'])
    return im.resize((96,96),Image.Resampling.NEAREST)


def preview(sprites, portraits):
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',12)
    im = Image.new('RGBA',(1440,1920),'#ddd4c0')
    d = ImageDraw.Draw(im)
    for i,p in enumerate(PEOPLE):
        x,y = (i%6)*240,(i//6)*480
        rect(d,(x+4,y+4,x+235,y+475),'#eee6d4')
        d.text((x+10,y+10),str(i)+' · '+p['name']+' · '+str(p['age']),font=font,fill=P['navy'])
        d.text((x+10,y+30),p['group']+' / '+p['action'],font=small,fill=P['navy'])
        face = portraits[p['id']].crop((0,0,96,96))
        im.alpha_composite(face,(x+18,y+51))
        im.alpha_composite(portraits[p['id']].crop((96,0,192,96)),(x+125,y+51))
        for row in range(6):
            for frame in range(4):
                tile = sprites[p['id']].crop((frame*32,row*32,frame*32+32,row*32+32)).resize((48,48),Image.Resampling.NEAREST)
                im.alpha_composite(tile,(x+14+frame*54,y+163+row*50))
    im.save(ROOT/'tests'/'protest-preview.png',optimize=True)


def main():
    dest = ROOT/'assets'/'characters'
    dest.mkdir(parents=True,exist_ok=True)
    sprites, portraits, characters, manifest_people = {},{},{},[]
    for index,p in enumerate(PEOPLE):
        key = p['id']
        sheet = empty(128,192)
        faces = empty(288,96)
        unique = set()
        for row in range(6):
            for frame in range(4):
                cell = sprite(p,row,frame)
                unique.add(cell.tobytes())
                sheet.alpha_composite(cell,(frame*32,row*32))
        for column,expression in enumerate(('neutral','happy','concerned')):
            faces.alpha_composite(portrait(p,expression),(column*96,0))
        assert sheet.getchannel('A').getextrema() == (0,255),key
        assert faces.getchannel('A').getextrema() == (0,255),key
        assert len(unique) >= 14,(key,len(unique))
        assert len(set(faces.crop((x*96,0,x*96+96,96)).tobytes() for x in range(3))) == 3,key
        sprite_path = 'assets/characters/'+key+'.png'
        face_path = 'assets/characters/'+key+'-portrait.png'
        sheet.save(ROOT/sprite_path,optimize=True)
        faces.save(ROOT/face_path,optimize=True)
        sprites[key],portraits[key] = sheet,faces
        characters[key] = {'name':p['name'],'role':p['occupation'],'quote':'Pessoa original e fictícia da comunidade.','accent':p['coat'],'sprite':sprite_path,'portrait':face_path,'originalArt':True,'license':'CC0-1.0','spriteDimensions':{'width':128,'height':192,'cellWidth':32,'cellHeight':32,'columns':4,'rows':['down','left','right','up','activity','greeting']},'portraitDimensions':{'width':288,'height':96,'nativePixelGrid':48,'columns':['neutral','happy','concerned']}}
        item = {k:p.get(k) for k in ('id','name','occupation','age','appearance','group','action','signText','instrument','instrumentName','shirtSymbol','hairStyle','body','outfit','accessory','heldObject')}
        item.update(index=index,character=key,skinTone=p['skin'],clothingColor=p['coat'],pantsColor=p['pants'],headwrapColor=p.get('wrap'),fictional=True,personalStyle=True)
        if p['signText']:
            pole = 26 if index%2 == 0 else 6
            item['signGeometry'] = {'coordinateUnits':'native-pixel','boardCenter':{'x':pole,'y':7},'handCenter':{'x':pole,'y':19},'flippedBoardCenterX':31-pole,'boardIsRuntimeOverlay':True,'frameLift':{'row':4,'oddFrameOffsetY':-1},'color':p['signColor']}
        manifest_people.append(item)
    assert len(set(im.tobytes() for im in sprites.values())) == 24
    assert len(set(im.tobytes() for im in portraits.values())) == 24
    assert sum(bool(p['signText']) for p in PEOPLE) == 10
    assert sum(p['hairStyle'].startswith('wrap-') for p in PEOPLE) == 5
    manifest = {'version':'2.1','license':'CC0-1.0','licenseURL':'https://creativecommons.org/publicdomain/zero/1.0/','creator':'Original VOICES pixel art','generator':'tools/create_protest_assets.py','attributionRequired':False,'historicalPortraits':False,'people':manifest_people,'characters':characters,'groups':{'organizers':6,'musicians':6,'signHolders':6,'listenersCaregiversVolunteers':6},'signs':{'withSigns':10,'withoutSigns':14,'nativePose':'pole-and-hand','boardIsRuntimeOverlay':True,'fullTextField':'signText'},'palette':P,'sources':[]}
    (dest/'protest-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    content = {'version':'2.1','license':'CC0-1.0','people':manifest_people,'characters':characters,'sources':[],'assetManifest':manifest}
    js = "(function(){'use strict';const V=window.V=window.V||{};V.protestContent="+json.dumps(content,ensure_ascii=False,separators=(',',':'))+";})();\n"
    (ROOT/'js'/'protest-content.js').write_text(js,encoding='utf-8')
    preview(sprites,portraits)
    print(json.dumps({'people':24,'sprites':24,'portraits':24,'withSigns':10,'withoutSigns':14,'headwraps':5,'musicians':6,'uniqueSheets':24,'uniquePortraits':24,'preview':'tests/protest-preview.png'},ensure_ascii=False))

if __name__ == '__main__':
    main()
