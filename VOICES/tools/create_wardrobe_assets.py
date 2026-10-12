from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('voices_wardrobe_base', ROOT / 'tools' / 'create_pixel_assets.py')
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
rect, ell, poly, line, empty = base.rect, base.ell, base.poly, base.line, base.empty
OUT = ROOT / 'assets'

SOURCES = [
    {'id': 'wardrobe_ipac', 'name': 'IPAC Bahia — Ofício das Baianas do Acarajé', 'url': 'https://www.ba.gov.br/ipac/oficio-das-baianas-do-acaraje', 'note': 'Referência para saia rodada, bata, torço e pano da costa no contexto do ofício. Não copiamos fotografias, tecidos ou adereços rituais.'},
    {'id': 'wardrobe_negra_jho', 'name': 'SECOM Bahia — Negra Jhô expõe turbantes no Museu Udo Knoff', 'url': 'https://www.ba.gov.br/comunicacao/2011/11/noticias/negra-jho-expoe-turbantes-no-museu-udo-knoff', 'note': 'Referência de autoria e variedade de composições. As amarrações de VOICES são desenhos cotidianos originais; não reproduzem peças da exposição nem lhes atribuem significado ritual.'},
    {'id': 'wardrobe_mab', 'name': 'Museu Afro Brasil Emanoel Araujo — Indumentária', 'url': 'https://museuafrobrasil.org.br/classificacao/indumentaria/', 'note': 'Referência para distinguir peças do cotidiano e contextos cerimoniais. Os cortes, estampas e acessórios apresentados são desenhos originais do jogo.'}
]

NEW_GALLERY = [
    ('clothes-wrap-dress', 'Vestido transpassado de Dandara', 'clothes', 'Decote transpassado, faixa na cintura e saia com caimento. A estampa geométrica foi criada para esta peça do jogo.', 'culture-book-06', ['wardrobe_mab']),
    ('clothes-flowing-dress', 'Vestido leve de alças', 'clothes', 'Vestido cotidiano de alças largas, cintura suave e saia longa com pregas. A cor azul é uma escolha da personagem.', 'culture-book-06', ['wardrobe_mab']),
    ('clothes-loose-shirt', 'Camisa de corte amplo', 'clothes', 'Camisa com mangas soltas e abertura curta no decote; as linhas coloridas são uma criação original de Dandara.', 'culture-book-06', ['wardrobe_mab']),
    ('clothes-long-skirt', 'Saia longa com bolsos', 'clothes', 'Cós, bolsos laterais e pregas dão forma à saia. O desenho autoral combina conforto e espaço para pequenos objetos.', 'culture-book-06', ['wardrobe_mab']),
    ('clothes-cropped-jacket', 'Jaqueta curta e calça', 'clothes', 'Jaqueta de corte curto, gola dobrada e punhos sobre uma calça de cintura alta. As peças têm costuras e bolsos visíveis.', 'culture-book-06', ['wardrobe_mab']),
    ('wrap-high-fold', 'Turbante: dobras altas', 'wrap', 'Estudo cotidiano original com dobras altas e tecido sobreposto. A direção das pregas ajuda a ler o volume.', 'culture-book-03', ['wardrobe_negra_jho']),
    ('wrap-tied-back', 'Turbante: amarração atrás', 'wrap', 'Estudo cotidiano original em que o tecido abraça a cabeça e termina em uma amarração atrás, com pontas curtas.', 'culture-book-03', ['wardrobe_negra_jho']),
    ('accessories-earrings', 'Brincos e pulseira de Dandara', 'clothes', 'Argolas, pequenos brincos geométricos e uma pulseira larga de desenho contemporâneo original. São escolhas pessoais da criadora.', 'culture-book-06', ['wardrobe_mab'])
]

PEOPLE = {
    'beach-lara': {'name': 'Lara', 'age': 32, 'role': 'Nadadora e professora de artes', 'skin': '#754832', 'light': '#a8734c', 'shade': '#50372c', 'hair': '#29232c', 'hairlight': '#554049', 'style': 'coils', 'outfit': 'onepiece', 'fabric': '#297e86', 'fabriclight': '#7ed0ce', 'fabricshade': '#1b505b', 'wide': True, 'personality': 'Tranquila e observadora; prefere nadar acompanhada e desenhar depois.', 'activities': ['Observar o mar.', 'Conversar à sombra.', 'Desenhar no caderno.'], 'relationships': ['beach-celina', 'beach-rebeca'], 'appearance': 'Pele negra retinta, cachos crespos curtos, maiô verde-azulado de alças largas e sandálias.', 'lines': [('O mar mudou de cor com a luz. Vou desenhar essas duas faixas no caderno.', 'The sea changed colour with the light. I will draw these two bands in my notebook.'), ('Este maiô tem alças largas; gosto do conforto para nadar.', 'This swimsuit has wide straps; I like the comfort when I swim.'), ('Guardei um lugar à sombra para a Teresa. Quer sentar com a gente?', 'I saved a place in the shade for Teresa. Would you like to sit with us?')]},
    'beach-jorge': {'name': 'Jorge', 'age': 40, 'role': 'Marceneiro em um dia de descanso', 'skin': '#9d6a47', 'light': '#c38d5e', 'shade': '#704b35', 'hair': '#27232a', 'hairlight': '#51414a', 'style': 'short', 'outfit': 'shorts', 'fabric': '#cb6d47', 'fabriclight': '#f0ae6d', 'fabricshade': '#884a3c', 'wide': True, 'personality': 'Sociável e cuidadoso; gosta de reparar bancos e descansar ouvindo as ondas.', 'activities': ['Observar o banco de madeira.', 'Descansar sob o guarda-sol.', 'Conversar perto do caminho.'], 'relationships': ['beach-nalu', 'beach-beto'], 'appearance': 'Pele negra, cabelo natural baixo, bermuda de banho coral com cordão e chinelos.', 'lines': [('Hoje a oficina ficou fechada. Vim escutar as ondas.', 'The workshop is closed today. I came to listen to the waves.'), ('A madeira desse banco precisa secar antes de receber outra camada de óleo.', 'The wood on this bench needs to dry before it gets another coat of oil.'), ('Beto trouxe o caderno. Vou guardar a bola enquanto ele desenha.', 'Beto brought his notebook. I will hold the ball while he draws.')]},
    'beach-samira': {'name': 'Samira', 'age': 28, 'role': 'Costureira e visitante da praia', 'skin': '#674131', 'light': '#9a6749', 'shade': '#45302a', 'hair': '#26212b', 'hairlight': '#54414a', 'style': 'wrap', 'outfit': 'sarong', 'fabric': '#97526f', 'fabriclight': '#e19caf', 'fabricshade': '#633d58', 'wide': False, 'personality': 'Criativa e bem-humorada; observa tecidos, nós e preferências individuais.', 'activities': ['Ajustar a canga.', 'Comparar sombras no tecido.', 'Conversar sob o guarda-sol.'], 'relationships': ['beach-lara', 'beach-nalu'], 'appearance': 'Pele negra retinta, turbante cotidiano de dobras altas, roupa de banho violeta e canga rosa transpassada.', 'lines': [('Amarrei minha canga de lado. O nó deixa o tecido longe da areia molhada.', 'I tied my sarong at the side. The knot keeps the fabric away from the wet sand.'), ('Escolhi esse turbante para hoje. As dobras e as cores são uma composição minha.', 'I chose this headwrap for today. The folds and colours are my own composition.'), ('Quero mostrar o desenho à Dandara quando voltar à feira.', 'I want to show the drawing to Dandara when I return to the market.')]},
    'beach-ivo': {'name': 'Ivo', 'age': 25, 'role': 'Técnico de som e leitor na praia', 'skin': '#b27a53', 'light': '#daa274', 'shade': '#7b523b', 'hair': '#312733', 'hairlight': '#66505a', 'style': 'locbun', 'outfit': 'rashguard', 'fabric': '#3b719c', 'fabriclight': '#8cb4d8', 'fabricshade': '#284965', 'wide': False, 'personality': 'Curioso e paciente; gosta de conversar sobre som sem interromper o descanso dos outros.', 'activities': ['Ler à sombra.', 'Escutar o mar.', 'Guardar a garrafa na bolsa.'], 'relationships': ['beach-rebeca', 'beach-jorge'], 'appearance': 'Pele negra, locs reunidos em coque, camisa de banho azul de manga comprida e bermuda escura.', 'lines': [('O vento e a água fazem sons diferentes. Estou anotando o que consigo distinguir.', 'The wind and the water make different sounds. I am writing down what I can distinguish.'), ('Minha camisa de banho tem mangas compridas. Escolhi essa peça para passar a tarde aqui.', 'My swimming shirt has long sleeves. I chose this garment for the afternoon here.'), ('O livro fica na bolsa quando chego perto da água.', 'The book stays in my bag when I get near the water.')]},
    'beach-nalu': {'name': 'Nalu', 'age': 37, 'role': 'Vendedora do quiosque e cozinheira', 'skin': '#88533b', 'light': '#ba7c53', 'shade': '#5a3a2e', 'hair': '#292430', 'hairlight': '#5a444e', 'style': 'twists', 'outfit': 'vendor', 'fabric': '#d19747', 'fabriclight': '#f3d087', 'fabricshade': '#865c38', 'wide': True, 'personality': 'Acolhedora e organizada; apresenta o que preparou e combina o horário de descanso com a equipe.', 'activities': ['Organizar copos e guardanapos.', 'Conferir a etiqueta dos ingredientes.', 'Conversar com clientes.'], 'relationships': ['beach-samira', 'beach-jorge'], 'appearance': 'Pele negra, twists curtos, camisa ampla de estampa autoral, avental verde e sandálias.', 'lines': [('Fiz suco de caju hoje. A lista de ingredientes está ao lado dos copos.', 'I made cashew fruit juice today. The ingredient list is beside the cups.'), ('O avental guarda meu lápis; uso ele para atualizar o cardápio.', 'The apron holds my pencil; I use it to update the menu.'), ('Separei os copos e recolhi as embalagens. O caminho do quiosque ficou livre.', 'I sorted the cups and collected the wrappers. The path to the kiosk is clear.')]},
    'beach-celina': {'name': 'Teresa', 'age': 68, 'role': 'Bibliotecária aposentada e frequentadora da praia', 'skin': '#8c5d43', 'light': '#bc8962', 'shade': '#604131', 'hair': '#949a94', 'hairlight': '#d6d8cd', 'style': 'sunhat', 'outfit': 'dress', 'fabric': '#459789', 'fabriclight': '#9bd4b4', 'fabricshade': '#2b655f', 'wide': True, 'personality': 'Serena e espirituosa; gosta de ler, conversar e reconhecer mudanças na paisagem.', 'activities': ['Ler no banco.', 'Conversar com Lara.', 'Observar as aves ao longe.'], 'relationships': ['beach-lara', 'beach-beto'], 'appearance': 'Pele negra, cachos grisalhos sob um chapéu de abas, vestido leve verde e sandálias.', 'lines': [('Trouxe um livro curto para ler entre uma conversa e outra.', 'I brought a short book to read between conversations.'), ('A Lara guardou meu lugar. Daqui consigo observar as aves sem me aproximar delas.', 'Lara saved my place. From here I can watch the birds without approaching them.'), ('Meu chapéu cabe na bolsa, mas gosto de usar essa aba larga aqui.', 'My hat fits in my bag, but I like wearing this wide brim here.')]},
    'beach-rebeca': {'name': 'Rebeca', 'age': 34, 'role': 'Guarda-vidas', 'skin': '#714634', 'light': '#a97453', 'shade': '#4b332b', 'hair': '#28242e', 'hairlight': '#58444b', 'style': 'braidbun', 'outfit': 'lifeguard', 'fabric': '#e17c45', 'fabriclight': '#ffd286', 'fabricshade': '#955039', 'wide': False, 'personality': 'Atenta e direta; orienta visitantes com calma e acompanha as condições do mar.', 'activities': ['Observar a área de banho.', 'Conferir a placa de orientação.', 'Conversar com visitantes no posto.'], 'relationships': ['beach-lara', 'beach-ivo'], 'appearance': 'Pele negra retinta, tranças em coque, camisa de banho laranja de manga longa, bermuda escura e apito.', 'lines': [('Antes de entrar na água, veja a orientação do posto e fale com a equipe.', 'Before you enter the water, check the station guidance and talk to the team.'), ('Estou observando esta área. Deixe a passagem do posto livre, por favor.', 'I am watching this area. Please keep the station entrance clear.'), ('Posso conversar aqui no posto enquanto acompanho o movimento.', 'I can talk here at the station while I watch what is happening.')]},
    'beach-beto': {'name': 'Beto', 'age': 17, 'role': 'Estudante e desenhista', 'skin': '#a76d49', 'light': '#d89968', 'shade': '#724a35', 'hair': '#2b2430', 'hairlight': '#5a424c', 'style': 'afro', 'outfit': 'openshirt', 'fabric': '#7b74aa', 'fabriclight': '#c3b6df', 'fabricshade': '#504c79', 'wide': False, 'personality': 'Animado e observador; prefere desenhar os animais de longe e compartilhar o caderno.', 'activities': ['Desenhar pegadas no caderno.', 'Conversar com Teresa.', 'Guardar a bola perto do banco.'], 'relationships': ['beach-celina', 'beach-jorge'], 'appearance': 'Adolescente negro, afro arredondado, camisa leve aberta sobre camiseta e bermuda de banho azul.', 'lines': [('Não mexi nas pegadas. Desenhei o formato no caderno para comparar depois.', 'I did not touch the tracks. I drew their shape in my notebook to compare them later.'), ('A Teresa encontrou outro livro sobre aves. Quero olhar as imagens com ela.', 'Teresa found another book about birds. I want to look at the pictures with her.'), ('Minha camisa fica aberta por cima da camiseta. A bermuda tem bolso para a chave.', 'My shirt stays open over my T-shirt. My shorts have a pocket for the key.')]}
}


def save(im, folder, name):
    dest = OUT / folder / (name + '.png')
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, optimize=True)


def hanger(d, x=32, y=9, width=19):
    line(d, (x-2, y-5, x-2, y-7, x, y-9, x+3, y-8, x+3, y-5, x, y-3, x, y), 'grey')
    line(d, (x, y, x-width, y+8, x+width, y+8, x, y), 'grey')
    line(d, (x-width+2, y+7, x+width-2, y+7), 'greylight')


def pattern(im, polygon, main='#cb7046', accent='#f1c171', shade='#864435', spacing=9):
    mask = Image.new('L', im.size, 0)
    dm = ImageDraw.Draw(mask)
    dm.polygon(polygon, fill=255)
    ornament = empty(*im.size)
    d = ImageDraw.Draw(ornament)
    for y in range(8, im.height, spacing):
        for x in range(8 + (y//spacing % 2)*4, im.width, spacing):
            poly(d, [(x, y-2), (x+2, y), (x, y+2), (x-2, y)], accent)
            line(d, (x+3, y+1, x+4, y+3), shade)
    ornament.putalpha(Image.composite(ornament.getchannel('A'), Image.new('L', im.size), mask))
    im.alpha_composite(ornament)


def garment(name):
    im = empty(64, 64)
    d = ImageDraw.Draw(im)
    ell(d, (9, 57, 55, 61), (17, 23, 41, 36))
    if name == 'clothes-cardigan':
        hanger(d, 32, 9, 20)
        shape = [(23, 13), (27, 12), (28, 16), (36, 16), (37, 12), (41, 13), (47, 18), (53, 42), (46, 44), (42, 29), (42, 54), (22, 54), (22, 29), (18, 44), (11, 42), (17, 18)]
        poly(d, shape, '#447d73', 'ink')
        poly(d, [(27, 13), (31, 19), (31, 53), (23, 53), (24, 27)], '#305e5b')
        poly(d, [(37, 13), (33, 19), (33, 53), (41, 53), (40, 27)], '#619a8b')
        poly(d, [(28, 16), (32, 20), (36, 16), (35, 50), (29, 50)], '#ded9bf', '#afb5a3')
        line(d, (26, 15, 29, 22, 29, 51), '#90b6a0')
        line(d, (38, 15, 35, 22, 35, 51), '#a4c7af')
        for y in (29, 35, 41, 47):
            ell(d, (34, y, 35, y+1), '#d5c99d')
        rect(d, (24, 39, 28, 46), '#558d7e', '#2d5352')
        rect(d, (36, 39, 40, 46), '#78ab94', '#3e6c63')
        line(d, (13, 39, 18, 40), '#9ab6a4')
        line(d, (46, 40, 51, 39), '#a4c7af')
        line(d, (24, 51, 28, 51), '#90b6a0')
        line(d, (36, 51, 40, 51), '#a4c7af')
    elif name == 'clothes-printed-blouse':
        hanger(d, 32, 8, 20)
        shape = [(22, 14), (27, 12), (29, 17), (35, 17), (37, 12), (42, 14), (53, 25), (49, 36), (43, 33), (43, 50), (37, 53), (25, 53), (21, 50), (21, 33), (15, 36), (11, 25)]
        poly(d, shape, '#cb7046', 'ink')
        pattern(im, shape)
        d = ImageDraw.Draw(im)
        line(d, (28, 15, 31, 20, 35, 17), '#edbc82', 2)
        line(d, (25, 26, 24, 46, 25, 50), '#9a4e36')
        line(d, (38, 26, 40, 47, 38, 50), '#f0aa65')
        line(d, (21, 31, 17, 32), '#efc791')
        line(d, (43, 31, 47, 32), '#efc791')
        line(d, (24, 50, 38, 50), '#864435')
    elif name == 'clothes-overalls':
        hanger(d, 32, 7, 14)
        poly(d, [(23, 12), (27, 12), (29, 24), (35, 24), (37, 12), (41, 12), (40, 31), (42, 56), (34, 56), (32, 38), (30, 56), (22, 56), (24, 31)], '#47667c', 'ink')
        rect(d, (25, 22, 39, 33), '#567f94', 'ink')
        rect(d, (28, 25, 36, 31), '#7096a5', '#324b63')
        line(d, (24, 13, 27, 24), '#a9bec4')
        line(d, (40, 13, 37, 24), '#a9bec4')
        for x in (27, 37):
            ell(d, (x-1, 21, x+1, 23), 'amberlight', 'amberdark')
        line(d, (25, 36, 27, 40, 29, 39), '#263c56')
        line(d, (39, 36, 37, 40, 35, 39), '#263c56')
        line(d, (24, 54, 29, 54), '#9ab7bc')
        line(d, (35, 54, 40, 54), '#9ab7bc')
        line(d, (33, 34, 32, 38), '#2e465e')
    elif name == 'clothes-baiana':
        rect(d, (29, 49, 34, 58), '#805a49', 'ink')
        rect(d, (19, 58, 44, 60), '#b99068', 'ink')
        ell(d, (25, 4, 39, 17), '#c9bca2', '#887e6b')
        ell(d, (22, 1, 41, 10), '#e8e4d4', 'ink')
        poly(d, [(24, 5), (28, 1), (36, 1), (39, 5), (38, 9), (26, 10)], '#f3eedc', '#979f9a')
        line(d, (26, 5, 36, 7), '#bbc4b9')
        poly(d, [(22, 16), (27, 15), (29, 19), (35, 19), (37, 15), (42, 16), (47, 28), (41, 31), (40, 29), (40, 34), (24, 34), (24, 29), (21, 31), (16, 28)], '#eee9d8', 'ink')
        line(d, (28, 18, 31, 21, 35, 18), '#adbab5')
        for x in range(20, 47, 3):
            if x < 26 or x > 39:
                rect(d, (x, 28, x, 28), '#b4bdb6')
        shape = [(23, 32), (40, 32), (43, 38), (50, 51), (46, 56), (18, 56), (14, 51), (20, 38)]
        poly(d, shape, '#dfe5db', 'ink')
        for x in (18, 24, 31, 38, 45):
            line(d, (28 + (x-31)//4, 35, x, 52), '#bdc9c2')
        line(d, (18, 51, 46, 51), '#f7f0dc', 2)
        for x in range(19, 46, 3):
            rect(d, (x, 54, x+1, 54), '#a8b8ad')
        shawl = [(19, 19), (24, 17), (40, 41), (35, 45), (23, 28)]
        poly(d, shawl, '#b78146', 'ink')
        line(d, (23, 20, 37, 42), '#e4c179', 2)
        line(d, (21, 22, 34, 42), '#986643')
        for y in range(24, 43, 4):
            line(d, (25+(y-24)//2, y, 29+(y-24)//2, y-2), '#f0d79b')
    elif name == 'cloth-pano-da-costa':
        line(d, (13, 10, 53, 10), 'brownlight', 3)
        line(d, (18, 10, 18, 59), 'brown', 2)
        line(d, (48, 10, 48, 59), 'brown', 2)
        shape = [(17, 11), (47, 11), (48, 47), (42, 51), (15, 47)]
        poly(d, shape, '#b17644', 'ink')
        for x in range(18, 49, 5):
            line(d, (x, 12, x-1, 45), '#e1b465', 2)
        for y in range(16, 48, 5):
            line(d, (17, y, 46, y+2), '#633c31')
            line(d, (17, y+1, 46, y+3), '#d59751')
        poly(d, [(15, 12), (23, 13), (22, 46), (16, 46)], '#946238')
        line(d, (17, 14, 18, 43), '#e0b16d')
        poly(d, [(45, 12), (48, 14), (46, 44), (42, 49), (43, 20)], '#d0924d')
        for x in range(16, 46, 2):
            line(d, (x, 48+(x%3), x, 54+(x%3)), '#b4844c')
    elif name == 'clothes-wrap-dress':
        hanger(d, 32, 6, 14)
        shape = [(25, 12), (29, 11), (33, 16), (36, 11), (40, 13), (46, 23), (42, 29), (38, 26), (38, 31), (48, 54), (42, 58), (20, 58), (14, 54), (24, 31), (24, 25), (20, 29), (16, 24)]
        poly(d, shape, '#b85e44', 'ink')
        pattern(im, shape, spacing=8)
        d = ImageDraw.Draw(im)
        line(d, (29, 12, 36, 22, 25, 30), '#eece86', 2)
        line(d, (24, 31, 39, 31), '#493846', 2)
        poly(d, [(37, 29), (42, 28), (43, 32), (40, 34), (38, 31)], '#f2c473', 'ink')
        line(d, (38, 32, 43, 40), '#f2c473', 2)
        line(d, (26, 36, 22, 52), '#7d3d39')
        line(d, (33, 36, 34, 54), '#e79c62')
        line(d, (40, 38, 45, 53), '#7d3d39')
    elif name == 'clothes-flowing-dress':
        hanger(d, 32, 6, 12)
        shape = [(25, 13), (28, 13), (29, 20), (35, 20), (36, 13), (39, 13), (38, 31), (45, 52), (44, 57), (21, 57), (20, 52), (26, 31)]
        poly(d, shape, '#318799', 'ink')
        line(d, (27, 15, 28, 22, 36, 22, 37, 15), '#9ed4d8')
        line(d, (26, 30, 38, 30), '#1c5b71')
        for x in (25, 30, 35, 40):
            line(d, (29+(x-32)//4, 33, x, 53), '#62b5bd')
        line(d, (23, 54, 42, 54), '#236c7f')
        for x, y in ((26, 37), (36, 43), (28, 50), (39, 52)):
            poly(d, [(x, y-1), (x+1, y), (x, y+1), (x-1, y)], '#e8d390')
    elif name == 'clothes-loose-shirt':
        hanger(d, 32, 6, 19)
        shape = [(22, 12), (28, 11), (30, 17), (34, 17), (36, 11), (42, 12), (53, 23), (49, 39), (42, 39), (42, 51), (22, 51), (22, 39), (15, 39), (11, 23)]
        poly(d, shape, '#d6ab62', 'ink')
        line(d, (27, 13, 29, 19, 35, 19, 37, 13), '#944d42', 2)
        line(d, (32, 19, 32, 31), '#944d42')
        line(d, (24, 26, 25, 47), '#9a763e')
        line(d, (39, 26, 39, 47), '#f1d494')
        for x in (18, 45):
            line(d, (x, 22, x, 36), '#2f6869', 2)
            line(d, (x+3, 24, x+3, 36), '#ae6151')
        for y in (35, 43):
            line(d, (27, y, 30, y+2, 34, y, 36, y+2), '#357c78')
        line(d, (23, 49, 41, 49), '#986d3f')
    elif name == 'clothes-long-skirt':
        hanger(d, 32, 6, 17)
        shape = [(20, 16), (44, 16), (43, 25), (51, 54), (46, 57), (18, 57), (13, 54), (21, 25)]
        poly(d, shape, '#467f64', 'ink')
        pattern(im, shape, '#467f64', '#e0c67d', '#285c53', 10)
        d = ImageDraw.Draw(im)
        rect(d, (21, 17, 43, 21), '#315c53', 'ink')
        line(d, (24, 24, 26, 29, 28, 27), '#d6c98a')
        line(d, (40, 24, 38, 29, 36, 27), '#d6c98a')
        line(d, (29, 23, 27, 52), '#2b5d50')
        line(d, (35, 23, 39, 53), '#75a77d')
        line(d, (17, 54, 47, 54), '#d6c98a')
    elif name == 'clothes-cropped-jacket':
        hanger(d, 32, 5, 18)
        rect(d, (24, 33, 40, 39), '#9b855d', 'ink')
        poly(d, [(24, 38), (40, 38), (44, 56), (34, 56), (32, 43), (30, 56), (20, 56)], '#bfae82', 'ink')
        line(d, (25, 42, 23, 53), '#e6d9ae')
        line(d, (38, 42, 40, 53), '#8d7856')
        shape = [(24, 10), (29, 10), (31, 15), (34, 15), (36, 10), (42, 12), (48, 30), (43, 34), (39, 24), (40, 35), (23, 35), (23, 24), (18, 35), (13, 31), (18, 14)]
        poly(d, shape, '#796293', 'ink')
        poly(d, [(25, 11), (29, 11), (31, 15), (27, 21), (23, 15)], '#b0a0c1', 'ink')
        poly(d, [(36, 11), (40, 12), (42, 16), (36, 21), (33, 15)], '#9c8aae', 'ink')
        line(d, (32, 17, 32, 34), '#d9cda9')
        rect(d, (25, 25, 29, 29), '#927fa6', '#514463')
        rect(d, (35, 25, 39, 29), '#927fa6', '#514463')
        line(d, (24, 32, 39, 32), '#af9abf')
    elif name == 'accessories-earrings':
        poly(d, [(12, 13), (20, 11), (25, 15), (25, 48), (11, 50)], '#c1b89c', '#897c66')
        poly(d, [(40, 11), (51, 14), (53, 48), (38, 48)], '#c1b89c', '#897c66')
        for x in (18, 45):
            ell(d, (x-5, 22, x+5, 35), None, '#8a613a', 3)
            ell(d, (x-4, 23, x+4, 33), None, '#ecc275')
            ell(d, (x-1, 19, x+1, 21), '#f4d68a', '#8a613a')
        poly(d, [(30, 16), (34, 20), (30, 25), (26, 20)], '#ae7344', 'ink')
        poly(d, [(30, 17), (33, 20), (30, 23), (28, 20)], '#f4d68a')
        ell(d, (22, 41, 40, 54), '#b67e48', 'ink')
        ell(d, (25, 43, 37, 50), '#615341', '#eac484')
        line(d, (24, 51, 36, 52), '#f4d68a', 2)
    return im.resize((128, 128), Image.Resampling.NEAREST)


def gallery_head(name):
    im = empty(64, 64)
    d = ImageDraw.Draw(im)
    hair, hi = '#292530', '#54414c'
    if name == 'hair-afro':
        ell(d, (11, 4, 53, 47), hair, 'ink')
        for x, y, r in ((15, 14, 3), (22, 7, 2), (33, 5, 2), (44, 12, 2), (50, 25, 2), (14, 34, 2)):
            ell(d, (x-r, y-r, x+r, y+r), hair, 'ink')
    elif name in ('hair-box-braids', 'hair-twists', 'hair-locs'):
        ell(d, (16, 7, 47, 43), hair, 'ink')
        for i, x in enumerate((13, 17, 21, 41, 45, 49)):
            bottom = 53 - i % 3 * 3
            line(d, (x, 22, x, bottom), hair, 4)
            for y in range(23, bottom, 4 if name == 'hair-box-braids' else 6):
                line(d, (x-1, y, x+1, y+1, x-1, y+2), hi) if name != 'hair-locs' else line(d, (x, y, x+1, y+2), hi)
    poly(d, [(13, 63), (14, 57), (21, 52), (27, 49), (38, 49), (46, 53), (50, 59), (51, 63)], '#427f84', 'ink')
    rect(d, (28, 44, 37, 54), '#80513c', 'ink')
    poly(d, [(25, 52), (31, 55), (39, 51), (37, 63), (27, 63)], '#e2d4b7')
    ell(d, (19, 19, 44, 49), '#97623f', 'ink')
    poly(d, [(20, 27), (23, 22), (29, 21), (29, 24), (24, 28), (22, 39), (20, 39)], '#bc865b')
    poly(d, [(43, 30), (43, 40), (37, 47), (31, 49), (30, 46), (37, 44), (41, 37)], '#684532')
    for x in (25, 36):
        line(d, (x, 32, x+3, 32), '#322d31')
        rect(d, (x+1, 34, x+2, 35), '#1b2031')
    line(d, (32, 35, 31, 39, 33, 39), '#6d4834')
    line(d, (28, 43, 35, 43), '#6a3e35')
    line(d, (29, 44, 34, 44), '#af7450')
    if name == 'hair-nago':
        ell(d, (19, 9, 43, 28), '#885b40', 'ink')
        poly(d, [(19, 26), (19, 15), (23, 11), (29, 9), (35, 10), (41, 13), (44, 21), (42, 27), (39, 22), (34, 20), (26, 20), (22, 24)], '#6d4a39')
        tracks = [(22, 22, 25, 15, 30, 11), (26, 21, 28, 15, 32, 11), (31, 20, 33, 15, 35, 12), (36, 22, 38, 17, 38, 13), (40, 25, 41, 21, 40, 17)]
        for i, points in enumerate(tracks):
            line(d, points, hair, 2)
            rect(d, (points[2], points[3], points[2], points[3]), hi)
        ell(d, (40, 14, 50, 25), hair, 'ink')
        line(d, (43, 17, 47, 18, 48, 21, 45, 23, 42, 21, 43, 18), hi)
    elif name == 'hair-afro':
        poly(d, [(19, 26), (18, 20), (22, 17), (26, 18), (30, 16), (35, 17), (39, 16), (44, 21), (44, 27), (40, 23), (36, 23), (33, 24), (29, 23), (24, 24)], hair, 'ink')
        for x, y in ((17, 18), (23, 9), (33, 7), (43, 13), (48, 25), (14, 28), (18, 38), (46, 38), (25, 18), (38, 19)):
            line(d, (x, y, x+1, y-1, x+2, y), hi)
    elif name in ('hair-box-braids', 'hair-twists', 'hair-locs'):
        poly(d, [(18, 27), (17, 19), (21, 12), (29, 8), (37, 9), (43, 14), (47, 22), (45, 29), (41, 24), (34, 20), (27, 20), (22, 25)], hair, 'ink')
        for i, x in enumerate((21, 26, 31, 36, 41)):
            if name == 'hair-box-braids':
                line(d, (x, 13+i%2, x-1, 18, x, 23), hi)
                line(d, (x-1, 14, x+1, 16, x-1, 18), '#685149')
            elif name == 'hair-twists':
                line(d, (x, 13, x+1, 16, x, 18, x+1, 21), hi)
            else:
                line(d, (x, 12+i%2, x, 18, x+2, 23), hi, 2)
        if name == 'hair-box-braids':
            line(d, (30, 9, 29, 17, 27, 20), '#8d654b')
    elif name in ('wrap-high-fold', 'wrap-tied-back'):
        if name == 'wrap-high-fold':
            poly(d, [(17, 26), (16, 15), (20, 5), (25, 2), (37, 2), (45, 8), (47, 20), (43, 29), (38, 24), (25, 24), (21, 28)], '#9057a0', 'ink')
            poly(d, [(18, 18), (22, 10), (36, 11), (45, 18), (43, 25), (25, 23)], '#603e7a', 'ink')
            line(d, (23, 6, 32, 9, 40, 7), '#d8a8c9', 2)
            line(d, (21, 15, 30, 18, 42, 20), '#be8db8', 2)
            line(d, (21, 21, 30, 23, 41, 24), '#e2bacd')
        else:
            poly(d, [(17, 24), (18, 14), (23, 8), (32, 6), (41, 11), (45, 18), (43, 29), (37, 24), (25, 24), (21, 28)], '#d29149', 'ink')
            line(d, (21, 12, 30, 16, 42, 19), '#f0cd89', 2)
            line(d, (19, 19, 29, 22, 40, 22), '#995537', 2)
            poly(d, [(43, 21), (49, 19), (53, 23), (49, 27), (45, 26)], '#a85d38', 'ink')
            line(d, (48, 22, 49, 24, 46, 25), '#efbd73')
            poly(d, [(47, 27), (52, 28), (49, 37), (46, 34)], '#d29149', 'ink')
    return im.resize((128, 128), Image.Resampling.NEAREST)


def hair(d, p, direction, bob=0, portrait=False):
    h, hi, style = p['hair'], p['hairlight'], p['style']
    if portrait:
        x0, x1, top, bottom = 13, 34, 7, 19
    else:
        x0, x1, top, bottom = 10, 21, 3+bob, 9+bob
    w = x1-x0
    if style == 'wrap':
        poly(d, [(x0-2, bottom+2), (x0-2, top), (x0+3, top-3), (x1-2, top-3), (x1+2, top+2), (x1+1, bottom+3), (x0+3, bottom+1)], '#97526f', 'ink')
        line(d, (x0+1, top+1, x1-1, top+4), '#e19caf')
        line(d, (x0, top+5, x1-1, bottom+1), '#633d58')
        line(d, (x0+4, top-1, x1-2, top+1), '#e19caf')
    elif style == 'sunhat':
        ell(d, (x0-2, top+3, x1+2, bottom+3), h, 'ink')
        poly(d, [(x0, top+2), (x0+3, top-2), (x1-3, top-2), (x1, top+2), (x1+1, top+5), (x0-1, top+5)], '#c4a069', 'ink')
        rect(d, (x0, top+3, x1, top+4), '#73613f')
        poly(d, [(x0-5, top+5), (x0, top+4), (x1, top+4), (x1+5, top+6), (x1+4, top+8), (x0-4, top+8)], '#d7ba7a', 'ink')
        line(d, (x0-2, top+6, x1+3, top+6), '#edce92')
    elif style in ('locbun', 'braidbun'):
        ell(d, (x0+2, top-3, x1-1, top+3), h, 'ink')
        ell(d, (x0-1, top, x1+1, bottom), h, 'ink')
        for x in range(x0+1, x1, 4 if style == 'locbun' else 3):
            line(d, (x, top+1, x+1, bottom-1), hi, 2 if portrait and style == 'locbun' else 1)
        line(d, (x0+4, top-1, x1-3, top), hi)
        if direction == 3:
            ell(d, (x0-1, top+1, x1+1, bottom+5), h, 'ink')
            for x in range(x0+2, x1, 3):
                line(d, (x, top+3, x+1, bottom+2), hi)
            ell(d, (x0+2, bottom-1, x1-1, bottom+5), h, 'ink')
            line(d, (x0+4, bottom+1, x1-3, bottom+2), hi)
    elif style == 'short':
        ell(d, (x0, top, x1, bottom), h, 'ink')
        line(d, (x0+2, top+2, x1-2, top+2), hi)
        if direction == 3:
            ell(d, (x0, top+1, x1, bottom+5), h, 'ink')
            line(d, (x0+2, top+4, x1-2, top+4), hi)
    elif style == 'twists':
        ell(d, (x0-1, top-1, x1+1, bottom+1), h, 'ink')
        step = 4 if portrait else 3
        for x in range(x0, x1+1, step):
            ending = bottom+3 if x in (x0, x1-step+1, x1) else bottom
            line(d, (x, top+2, x-1, ending), h, 3 if portrait else 2)
            for y in range(top+2, ending, 3):
                line(d, (x, y, x-1, y+1), hi)
        if direction == 3:
            ell(d, (x0-1, top, x1+1, bottom+5), h, 'ink')
            for x in range(x0+1, x1, step):
                line(d, (x, top+2, x-1, bottom+3), hi)
    else:
        r = 1 if not portrait else 2
        grow = 3 if style == 'afro' else 1
        ell(d, (x0-grow, top-grow, x1+grow, bottom+1), h, 'ink')
        if direction == 3:
            ell(d, (x0-grow, top-grow, x1+grow, bottom+5), h, 'ink')
        for x, y in ((x0, top+2), (x0+w//3, top-grow+1), (x0+2*w//3, top-grow+1), (x1, top+3)):
            ell(d, (x-r, y-r, x+r, y+r), h, 'ink')
            rect(d, (x, y-1, x+1, y-1), hi)
        for x, y in ((x0+2, top+2), (x0+5, top+4), (x1-2, top+1), (x1-5, top+5)):
            line(d, (x, y, x+1, y-1), hi)


def npc_sprite(p, row, frame):
    direction = row if row < 4 else 0
    side = direction in (1, 2)
    dd = 1 if side else direction
    bob = frame % 2 if row < 4 else 0
    stride = (0, 1, 0, -1)[frame] if row < 4 else 0
    im = empty()
    d = ImageDraw.Draw(im)
    skin, light, shade = p['skin'], p['light'], p['shade']
    fabric, hi, dark, outfit = p['fabric'], p['fabriclight'], p['fabricshade'], p['outfit']
    lx, rx = (8, 23) if p['wide'] and not side else (10, 21)
    ell(d, (7, 28, 25, 31), (17, 23, 41, 56))
    for x, sy in ((12, max(0, stride)), (17, max(0, -stride))):
        rect(d, (x, 23, x+2, 28+sy), skin, 'ink')
        rect(d, (x, 25, x, 27+sy), light)
        rect(d, (x-1, 28+sy, x+3, 29+sy), '#484a55', 'ink')
        line(d, (x, 28+sy, x+2, 28+sy), '#b9b095')
    torso = [(lx+2, 16+bob), (rx-2, 16+bob), (rx, 18+bob), (rx-1, 24), (lx+1, 24), (lx, 18+bob)]
    poly(d, torso, skin, 'ink')
    if outfit in ('shorts', 'openshirt', 'rashguard', 'lifeguard'):
        shortcolor = '#49687d' if outfit == 'openshirt' else dark if outfit != 'shorts' else fabric
        poly(d, [(lx+1, 22), (rx-1, 22), (rx, 26), (17, 26), (16, 24), (15, 26), (lx, 26)], shortcolor, 'ink')
        line(d, (lx+2, 23, rx-2, 23), hi)
        if dd != 3:
            line(d, (15, 23, 16, 24, 17, 23), '#e4d6b4')
    if outfit == 'onepiece':
        poly(d, [(lx+3, 16+bob), (lx+5, 16+bob), (lx+5, 18+bob), (rx-5, 18+bob), (rx-5, 16+bob), (rx-3, 16+bob), (rx-2, 22), (19, 25), (13, 25), (lx+2, 22)], fabric, 'ink')
        line(d, (lx+4, 18+bob, lx+4, 21), hi)
        line(d, (13, 23, 18, 23), dark)
    elif outfit == 'sarong':
        poly(d, [(lx+2, 16+bob), (rx-2, 16+bob), (rx-1, 19+bob), (lx+1, 19+bob)], '#535074', 'ink')
        poly(d, [(lx, 21), (rx+1, 21), (rx-1, 28), (lx+1, 28)], fabric, 'ink')
        line(d, (rx, 22, lx+3, 27), hi)
        ell(d, (rx-1, 20, rx+2, 22), hi, dark)
        line(d, (rx, 23, rx+2, 26), dark)
    elif outfit in ('rashguard', 'lifeguard', 'vendor', 'dress', 'openshirt'):
        bottom = 27 if outfit == 'dress' else 23
        poly(d, [(lx+1, 16+bob), (rx-1, 16+bob), (rx+1, 19+bob), (rx+2 if outfit == 'dress' else rx, bottom), (lx-2 if outfit == 'dress' else lx, bottom), (lx-1, 19+bob)], fabric, 'ink')
        line(d, (lx+3, 18+bob, lx+2, bottom-1), hi)
        if outfit == 'openshirt':
            poly(d, [(13, 17+bob), (16, 19+bob), (19, 17+bob), (18, 23), (14, 23)], '#e5ddc6')
            line(d, (12, 18+bob, 12, 22), dark)
            line(d, (20, 18+bob, 20, 22), hi)
        elif outfit == 'vendor':
            for x, y in ((lx+2, 19+bob), (rx-2, 18+bob), (rx-3, 22)):
                rect(d, (x, y, x+1, y), '#794a42')
            poly(d, [(13, 18+bob), (19, 18+bob), (21, 25), (11, 25)], '#407465', 'ink')
            rect(d, (14, 22, 18, 24), '#729b77', '#285246')
            line(d, (17, 21, 17, 23), 'amberlight')
        elif outfit == 'lifeguard':
            line(d, (13, 17+bob, 16, 20+bob, 19, 17+bob), '#48404a')
            rect(d, (16, 20+bob, 17, 21+bob), '#e7d6ad', '#645950')
            rect(d, (20, 20+bob, 21, 22+bob), '#f2d9aa')
        elif outfit == 'dress':
            line(d, (15, 18+bob, 13, 26), hi)
            line(d, (19, 18+bob, 21, 26), dark)
            line(d, (lx+1, 25, rx-1, 25), hi)
    rect(d, (14, 14+bob, 17, 17+bob), skin, 'ink')
    for x, sign in ((lx-2, 1), (rx+1, -1)):
        armend = 23+bob+sign*stride
        sleeve = outfit in ('rashguard', 'lifeguard', 'vendor', 'dress', 'openshirt')
        rect(d, (x, 18+bob, x+2, armend), fabric if sleeve else skin, 'ink')
        if sleeve and outfit in ('vendor', 'dress', 'openshirt'):
            rect(d, (x, 20+bob, x+2, armend), skin, 'ink')
        rect(d, (x, armend, x+2, armend+2), skin, 'ink')
        rect(d, (x+1, armend, x+1, armend+1), light)
    ell(d, (10, 5+bob, 21, 15+bob), skin, 'ink')
    rect(d, (11, 8+bob, 12, 11+bob), light)
    rect(d, (19, 11+bob, 20, 13+bob), shade)
    hair(d, p, dd, bob)
    if dd != 3:
        if side:
            rect(d, (10, 10+bob, 10, 11+bob), 'ink')
            rect(d, (8, 11+bob, 9, 12+bob), skin, 'ink')
            line(d, (10, 14+bob, 13, 14+bob), shade)
        else:
            for x in (12, 18):
                rect(d, (x, 10+bob, x, 11+bob), 'ink')
            line(d, (14, 14+bob, 17, 14+bob), shade)
        if p['age'] > 60:
            line(d, (12, 12+bob, 13, 12+bob), shade)
            line(d, (18, 12+bob, 19, 12+bob), shade)
    if row in (4, 5):
        rect(d, (rx, 17, rx+2, 21), fabric if outfit not in ('shorts', 'onepiece') else skin, 'ink')
        yy = 13 + frame%2
        line(d, (rx+1, 20, rx+3, yy+2), skin, 3)
        rect(d, (rx+2, yy, rx+4, yy+2), skin, 'ink')
        if row == 4 and p['outfit'] not in ('shorts', 'onepiece', 'sarong'):
            rect(d, (rx+3, yy+1, rx+7, yy+6), '#c9b58e', 'ink')
            line(d, (rx+4, yy+3, rx+6, yy+3), '#817562')
            line(d, (rx+4, yy+5, rx+6, yy+5), '#817562')
        elif row == 4:
            ell(d, (rx+2, yy+2, rx+6, yy+6), '#c59b63', 'ink')
            line(d, (rx+3, yy+3, rx+5, yy+4), '#e5c990')
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if direction == 2 else im


def npc_portrait(p, expression):
    im = empty(48, 48)
    d = ImageDraw.Draw(im)
    skin, light, shade, outfit = p['skin'], p['light'], p['shade'], p['outfit']
    fabric, hi, dark = p['fabric'], p['fabriclight'], p['fabricshade']
    poly(d, [(5, 47), (7, 39), (15, 34), (19, 32), (29, 32), (35, 35), (42, 40), (44, 47)], skin if outfit in ('shorts', 'onepiece', 'sarong') else fabric, 'ink')
    if outfit == 'onepiece':
        poly(d, [(13, 36), (17, 35), (20, 41), (27, 41), (31, 35), (35, 36), (35, 47), (13, 47)], fabric, 'ink')
        line(d, (16, 38, 18, 43), hi)
        line(d, (31, 39, 31, 46), dark)
    elif outfit == 'sarong':
        poly(d, [(7, 42), (12, 38), (35, 38), (40, 42), (42, 47), (6, 47)], fabric, 'ink')
        line(d, (13, 40, 30, 44, 35, 41), hi)
    elif outfit == 'openshirt':
        poly(d, [(17, 34), (24, 39), (31, 34), (31, 47), (17, 47)], '#e5ddc6', 'ink')
        line(d, (16, 36, 14, 47), dark)
        line(d, (32, 36, 33, 47), hi)
        poly(d, [(14, 35), (17, 34), (19, 38), (16, 41)], hi, 'ink')
        poly(d, [(31, 34), (34, 35), (32, 41), (29, 38)], hi, 'ink')
    elif outfit == 'vendor':
        for x, y in ((10, 40), (14, 44), (34, 39), (39, 43)):
            poly(d, [(x, y-1), (x+1, y), (x, y+1), (x-1, y)], '#794a42')
        poly(d, [(17, 35), (19, 38), (29, 38), (31, 35), (33, 47), (15, 47)], '#407465', 'ink')
        line(d, (17, 39, 17, 46), '#85af83')
        rect(d, (22, 43, 28, 47), '#729b77', '#285246')
    elif outfit == 'lifeguard':
        line(d, (18, 35, 24, 40, 30, 35), '#4b4350', 2)
        rect(d, (23, 41, 26, 43), '#e7d6ad', '#645950')
        rect(d, (34, 41, 37, 44), '#f2d9aa', dark)
        line(d, (10, 41, 10, 46), hi)
    elif outfit in ('dress', 'rashguard'):
        line(d, (16, 35, 21, 39, 27, 39, 32, 35), hi)
        line(d, (12, 40, 11, 46), hi)
        line(d, (36, 40, 37, 46), dark)
    rect(d, (19, 29, 28, 36), skin, 'ink')
    ell(d, (12, 11, 35, 35), skin, 'ink')
    poly(d, [(13, 20), (15, 14), (20, 13), (20, 16), (16, 21), (15, 27), (13, 28)], light)
    poly(d, [(34, 21), (34, 28), (30, 32), (26, 34), (23, 34), (23, 32), (29, 29), (32, 24)], shade)
    hair(d, p, 0, portrait=True)
    for x in (17, 27):
        line(d, (x, 20, x+3, 20), p['hair'])
        if expression == 'happy':
            line(d, (x, 23, x+1, 22, x+3, 23), '#242231')
        else:
            rect(d, (x+1, 22, x+2, 24), '#242231')
    if expression == 'concerned':
        line(d, (17, 20, 20, 21), p['hair'])
        line(d, (27, 21, 30, 20), p['hair'])
    line(d, (24, 24, 23, 27, 25, 27), shade)
    if expression == 'happy':
        line(d, (20, 30, 23, 31, 26, 31, 28, 30), shade)
    elif expression == 'concerned':
        line(d, (21, 31, 23, 30, 26, 30, 28, 31), shade)
    else:
        line(d, (21, 31, 27, 31), shade)
    if p['age'] > 60:
        line(d, (16, 26, 18, 26), shade)
        line(d, (29, 26, 31, 26), shade)
        line(d, (18, 29, 19, 30), shade)
    return im.resize((96, 96), Image.Resampling.NEAREST)


def resident_entry(key, p):
    lines = [{'speaker': key, 'pt': pt, 'en': {str(g): en for g in (6, 7, 8)}} for pt, en in p['lines']]
    return {'id': key, 'name': p['name'], 'character': key, 'role': p['role'], 'age': p['age'], 'chapter': 5, 'map': 'beach', 'identity': 'Pessoa negra brasileira original e fictícia. ' + p['appearance'], 'personality': p['personality'], 'relationships': p['relationships'], 'preferredActivities': p['activities'], 'lines': lines, 'repeat': lines[0]}


def main():
    revised = ['clothes-cardigan', 'clothes-printed-blouse', 'clothes-overalls', 'clothes-baiana', 'cloth-pano-da-costa']
    hairs = ['hair-nago', 'hair-box-braids', 'hair-twists', 'hair-locs', 'hair-afro']
    gallery = []
    for name in revised:
        save(garment(name), 'culture', name)
    for name in hairs:
        save(gallery_head(name), 'culture', name)
    for name, title, category, description, reading_id, source_ids in NEW_GALLERY:
        art = gallery_head(name) if category == 'wrap' else garment(name)
        save(art, 'culture', name)
        gallery.append({'id': name, 'asset': name, 'title': title, 'category': category, 'description': description, 'context': 'Ilustração original de VOICES. A autoria, a escolha de quem veste e o uso da peça têm contexto; aparência não informa religião ou nacionalidade.', 'sourceIds': source_ids, 'readingIds': [reading_id]})
    chars = {}
    for key, p in PEOPLE.items():
        sheet = empty(128, 192)
        portraits = empty(288, 96)
        for row in range(6):
            for frame in range(4):
                sheet.alpha_composite(npc_sprite(p, row, frame), (frame*32, row*32))
        for i, expression in enumerate(('neutral', 'happy', 'concerned')):
            portraits.alpha_composite(npc_portrait(p, expression), (i*96, 0))
        save(sheet, 'characters', key)
        save(portraits, 'characters', key+'-portrait')
        assert sheet.getchannel('A').getextrema() == (0, 255)
        assert portraits.getchannel('A').getextrema() == (0, 255)
        assert len({sheet.crop((col*32, row*32, col*32+32, row*32+32)).tobytes() for row in range(6) for col in range(4)}) >= 12
        chars[key] = {'name': p['name'], 'role': p['role'], 'quote': p['lines'][0][0], 'accent': p['fabriclight'], 'sprite': 'assets/characters/'+key+'.png', 'portrait': 'assets/characters/'+key+'-portrait.png'}
    data = {'gallery': gallery, 'residents': [resident_entry(k, p) for k, p in PEOPLE.items()], 'characters': chars, 'sources': SOURCES}
    (ROOT / 'js' / 'wardrobe-content.js').write_text("(function(){'use strict';const V=window.V=window.V||{};V.wardrobeContent="+json.dumps(data, ensure_ascii=False, separators=(',', ':'))+";})();\n", encoding='utf-8')
    manifest = {'version': '1.8', 'license': 'CC0-1.0', 'licenseURL': 'https://creativecommons.org/publicdomain/zero/1.0/', 'creator': 'Original pixel illustrations created for VOICES', 'generator': 'tools/create_wardrobe_assets.py', 'originalArt': True, 'referenceUse': 'Context and original visual studies only. No copied images, traced photographs, authentic religious costume claims or reproduced commercial textile designs.', 'galleryDimensions': {'width': 128, 'height': 128, 'nativePixelGrid': 64}, 'spriteDimensions': {'width': 128, 'height': 192, 'cellWidth': 32, 'cellHeight': 32, 'rows': ['down', 'left', 'right', 'up', 'interaction', 'greeting']}, 'portraitDimensions': {'width': 288, 'height': 96, 'cellWidth': 96, 'cellHeight': 96, 'nativePixelGrid': 48, 'columns': ['neutral', 'happy', 'concerned']}, 'revisedGallery': revised+hairs, 'newGallery': gallery, 'characters': chars, 'sources': SOURCES}
    (ROOT / 'data' / 'wardrobe-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    preview(revised+hairs+[r[0] for r in NEW_GALLERY])
    print(json.dumps({'revisedGallery': len(revised+hairs), 'newGallery': len(gallery), 'residents': len(chars), 'preview': 'tests/wardrobe-preview.png'}))


def preview(gallery):
    im = Image.new('RGBA', (1024, 1240), '#eee3c5')
    d = ImageDraw.Draw(im)
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    for i, key in enumerate(gallery):
        x, y = 7+(i%6)*170, 7+(i//6)*170
        rect(d, (x, y, x+163, y+163), '#ded1ad', '#b8a578')
        with Image.open(OUT / 'culture' / (key+'.png')) as art:
            im.alpha_composite(art, (x+18, y+8))
        d.text((x+4, y+142), key, fill='#354936', font=font)
    for i, (key, p) in enumerate(PEOPLE.items()):
        x, y = 7+(i%4)*255, 527+(i//4)*350
        rect(d, (x, y, x+247, y+339), '#d9cfb8', '#b8a578')
        d.text((x+8, y+9), p['name']+' · '+str(p['age'])+' anos', fill='#354936', font=font)
        im.alpha_composite(npc_portrait(p, 'neutral'), (x+10, y+32))
        im.alpha_composite(npc_portrait(p, 'happy'), (x+130, y+32))
        for row in range(4):
            im.alpha_composite(npc_sprite(p, row, 0).resize((56, 56), Image.Resampling.NEAREST), (x+5+row*60, y+146))
        for row in (4, 5):
            im.alpha_composite(npc_sprite(p, row, 1).resize((80, 80), Image.Resampling.NEAREST), (x+28+(row-4)*116, y+216))
        d.text((x+8, y+317), key, fill='#354936', font=font)
    target = ROOT / 'tests' / 'wardrobe-preview.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    im.save(target, optimize=True)


if __name__ == '__main__':
    main()
