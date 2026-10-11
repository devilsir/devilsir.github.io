#!/usr/bin/env python3
"""Original VOICES cozy art expansion; isolated deterministic Pillow authoring.

Only the files declared below are written. Imports previous primitive drawing
helpers without running their generators. All portraits are fictional characters.
"""
from pathlib import Path
import importlib.util
import json
import math
import argparse
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"
_spec=importlib.util.spec_from_file_location("voices_cozy_base",ROOT/"tools"/"create_pixel_assets.py")
base=importlib.util.module_from_spec(_spec);_spec.loader.exec_module(base)
rect,ell,poly,line,star,empty,color=base.rect,base.ell,base.poly,base.line,base.star,base.empty,base.color

PEOPLE={
 "amara":dict(skin="#966246",skinlight="#c18a5e",skindark="#624535",hair="#2c2632",hairlight="#5a4050",style="bun",coat="coral",shirt="amberlight",pants="navy",accessory="zip",age="adult"),
 "tomas":dict(skin="#744935",skinlight="#a26e4e",skindark="#4d342c",hair="#262530",hairlight="#484049",style="curls",coat="navylight",shirt="cyan",pants="navy",accessory="glasses",age="adult"),
 "elisa":dict(skin="#aa7454",skinlight="#d69e72",skindark="#724b3a",hair="#b1b1a7",hairlight="#e5ddc6",style="curls",coat="violet",shirt="paper",pants="brown",accessory="scarf",age="adult"),
 "andre":dict(skin="#82513a",skinlight="#b37950",skindark="#573b30",hair="#29262e",hairlight="#574143",style="long",coat="green",shirt="amberlight",pants="navy",accessory="strap",age="adult"),
 "viviane":dict(skin="#8f5a40",skinlight="#bb8256",skindark="#5e3e31",hair="#292330",hairlight="#5b434a",style="bun",coat="white",shirt="paper",pants="white",accessory="zip",age="adult"),
 "rui":dict(skin="#b47b54",skinlight="#dfa36c",skindark="#7a513b",hair="#342b32",hairlight="#624746",style="short",coat="greendark",shirt="amberlight",pants="navy",accessory="press",age="adult"),
 "jamila":dict(skin="#7b4b38",skinlight="#ad7450",skindark="#52352d",hair="#28252e",hairlight="#57413e",style="long",coat="cyandark",shirt="coral",pants="navy",accessory="zip",age="adult"),
 "otavio":dict(skin="#9d694c",skinlight="#d09564",skindark="#684735",hair="#24232b",hairlight="#4a3b46",style="afro",coat="coraldark",shirt="cyanlight",pants="navy",accessory="glasses",age="adult"),
 "cora":dict(skin="#774a36",skinlight="#a77450",skindark="#50362b",hair="#262731",hairlight="#51434b",style="bob",coat="cyandark",shirt="violetlight",pants="navy",accessory="zip",age="adult"),
 "bento":dict(skin="#bf875e",skinlight="#e4ad7b",skindark="#895c42",hair="#40302b",hairlight="#74513a",style="short",coat="greendark",shirt="white",pants="navy",accessory="zip",age="adult"),
 "ines":dict(skin="#915d42",skinlight="#bf875c",skindark="#624332",hair="#2d2630",hairlight="#55434a",style="short",coat="white",shirt="cyandark",pants="darkgrey",accessory="goggles",age="adult"),
 "celso":dict(skin="#6f452f",skinlight="#9e6c49",skindark="#4c3328",hair="#25242b",hairlight="#4d3d40",style="short",coat="coral",shirt="coral",pants="navy",accessory="press",age="adult"),
 "luzia":dict(skin="#a06b4c",skinlight="#cea072",skindark="#6c4935",hair="#a3aba7",hairlight="#dddccd",style="afro",coat="violetdark",shirt="paper",pants="navy",accessory="scarf",age="adult"),
 "denis":dict(skin="#7d5038",skinlight="#ad7c51",skindark="#553a2c",hair="#29252b",hairlight="#55413b",style="short",coat="#71874d",shirt="amberlight",pants="navy",accessory="zip",age="adult"),
 "maite":dict(skin="#e2b38a",skinlight="#f6d1a5",skindark="#af8060",hair="#a85037",hairlight="#d27d4a",style="short",coat="green",shirt="amberlight",pants="brown",accessory="zip",age="adult"),
 "aline":dict(skin="#98664b",skinlight="#cb936a",skindark="#684735",hair="#2c2631",hairlight="#59414b",style="long",coat="#754568",shirt="amberlight",pants="navy",accessory="zip",age="adult"),
 "paulo":dict(skin="#754831",skinlight="#aa7450",skindark="#4d3328",hair="#2d272b",hairlight="#55403b",style="short",coat="navylight",shirt="greenlight",pants="navy",accessory="strap",age="adult"),
 "nara":dict(skin="#aa7450",skinlight="#d8a173",skindark="#754f37",hair="#2c2531",hairlight="#574149",style="short",coat="cyandark",shirt="cyanlight",pants="navy",accessory="zip",age="teen"),
 "dora":dict(skin="#83553c",skinlight="#b6865e",skindark="#563b2e",hair="#a9afa9",hairlight="#e1ddc7",style="long",coat="greendark",shirt="paper",pants="brown",accessory="scarf",age="adult"),
 "vitor":dict(skin="#885940",skinlight="#bd875e",skindark="#5c3e2e",hair="#2c2730",hairlight="#58433f",style="short",coat="green",shirt="paper",pants="navy",accessory="glasses",age="adult"),
 "luan":dict(skin="#85553c",skinlight="#ba855b",skindark="#583b2d",hair="#322735",hairlight="#60434b",style="curls",coat="#e58b47",shirt="#e58b47",pants="navy",accessory="none",age="teen"),
 "selma":dict(skin="#a8704d",skinlight="#d79b6b",skindark="#754c35",hair="#29242e",hairlight="#59413d",style="long",coat="paper",shirt="violet",pants="navy",accessory="press",age="adult"),
 "enzo":dict(skin="#714630",skinlight="#a6724d",skindark="#4c3327",hair="#28232b",hairlight="#503d3d",style="short",coat="violet",shirt="amberlight",pants="navy",accessory="backpack",age="teen"),
}
META={
 "amara":{"name":"Amara","age":34,"role":"Leitora e mediadora de leitura do bairro","personality":"Tranquila, curiosa e boa ouvinte; guarda anotações de frases que a fazem pensar.","appearance":"Pele negra, coque trançado, blusa coral de padrões geométricos e brincos pequenos."},
 "tomas":{"name":"Tomás","age":32,"role":"Educador de ciências e organizador de oficinas","personality":"Paciente e bem-humorado; convida as pessoas a testar ideias antes de concluir.","appearance":"Pele negra retinta, cachos curtos, óculos e jaqueta jeans com costuras claras."},
 "elisa":{"name":"Elisa","age":71,"role":"Moradora aposentada e desenhista de memórias do bairro","personality":"Observadora, independente e espirituosa; gosta de desenhar detalhes que passam despercebidos.","appearance":"Pele negra, cachos grisalhos, cardigan violeta e caderno de desenhos."},
 "andre":{"name":"André","age":27,"role":"Guitarrista e compositor do estúdio comunitário","personality":"Brincalhão e colaborativo; prefere criar música junto a disputar a atenção.","appearance":"Pele negra, locs, roupa casual verde e guitarra de madeira."},
 "viviane":{"name":"Viviane","age":43,"role":"Baiana de acarajé e comerciante de comidas tradicionais","personality":"Prática, acolhedora e criteriosa com suas receitas; conhece as histórias das pessoas da feira.","appearance":"Pele negra, pano de cabeça branco, blusa e saia brancas no contexto de seu tabuleiro; sem contas ou objetos sagrados."},
 "rui":{"name":"Rui","age":29,"role":"Auxiliar de arquivo e restaurador de suportes de papel","personality":"Metódico e inventivo; gosta de encontrar soluções simples para preservar documentos.","appearance":"Pele negra, twists curtos, camisa verde e avental marrom com bolsos."},
 "jamila":{"name":"Jamila","age":23,"role":"Artista visual e responsável pelo mural coletivo","personality":"Expressiva e perseverante; testa várias cores e ouve os moradores antes de finalizar um mural.","appearance":"Pele negra retinta, tranças compridas e jardineira azul com marcas de tinta."},
 "otavio":{"name":"Otávio","age":36,"role":"Jornalista de cultura e apresentador da rádio comunitária","personality":"Atento e comunicativo; confere a origem das informações e dá espaço às outras vozes.","appearance":"Pele negra, afro arredondado, óculos, fones e crachá da rádio."},
 "cora":{"name":"Cora","age":28,"role":"Técnica de som do estúdio comunitário","personality":"Precisa e acolhedora; explica ajustes de som sem transformar a técnica em competição.","appearance":"Pele negra retinta, twists até o pescoço e jaqueta azul com fones pequenos."},
 "bento":{"name":"Bento","age":41,"role":"Curador do espaço de memória do bairro","personality":"Curioso e cuidadoso; gosta de descobrir as histórias por trás de objetos comuns.","appearance":"Pele parda, cabelo curto e colete verde sobre camisa clara.","identity":"Personagem pardo brasileiro, original e fictício."},
 "ines":{"name":"Inês","age":38,"role":"Educadora e pesquisadora do laboratório aberto","personality":"Entusiasmada e paciente; trata perguntas inesperadas como bons pontos de partida.","appearance":"Pele negra, cabelo escuro curto, jaleco branco e roupa verde-azulada."},
 "celso":{"name":"Celso","age":31,"role":"Editor da redação comunitária","personality":"Direto e colaborativo; revisa informações com cuidado e corrige erros de forma clara.","appearance":"Pele negra retinta, tranças curtas e camiseta coral com crachá."},
 "luzia":{"name":"Luzia","age":64,"role":"Mediadora da assembleia do bairro","personality":"Serena e firme; acompanha a ordem de fala e convida opiniões diferentes a se escutarem.","appearance":"Pele negra, afro grisalho arredondado e casaco roxo."},
 "denis":{"name":"Denis","age":26,"role":"Responsável pelo catálogo e empréstimos públicos","personality":"Organizado e bem-humorado; gosta de conectar cada pessoa a um recurso útil.","appearance":"Pele negra, cabelo com fade e cardigan verde-oliva."},
 "maite":{"name":"Maitê","age":37,"role":"Jardineira e orientadora da horta comunitária","personality":"Prática e otimista; ensina a observar o solo e a acompanhar o crescimento das plantas.","appearance":"Pele clara, cabelo ruivo curto e roupas de jardinagem verdes com avental.","identity":"Personagem brasileira de pele clara, original e fictícia."},
 "aline":{"name":"Aline","age":24,"role":"Leitora e participante do clube de histórias","personality":"Atenciosa e imaginativa; costuma comparar interpretações de um mesmo texto.","appearance":"Pele negra, tranças compridas e blusa ameixa."},
 "paulo":{"name":"Paulo","age":30,"role":"Guitarrista visitante do estúdio comunitário","personality":"Curioso e descontraído; gosta de acompanhar melodias criadas pelos colegas.","appearance":"Pele negra retinta, cabelo curto, jaqueta jeans e guitarra de madeira."},
 "nara":{"name":"Nara","age":17,"role":"Estudante e observadora das oficinas de ciência","personality":"Reflexiva e curiosa; anota detalhes antes de compartilhar suas perguntas.","appearance":"Pele negra, afro pequeno e roupa verde-azulada."},
 "dora":{"name":"Dora","age":75,"role":"Moradora e participante dos encontros de memória","personality":"Independente e bem-humorada; ouve outras histórias e compartilha suas lembranças.","appearance":"Pele negra, locs grisalhos e cardigan verde."},
 "vitor":{"name":"Vitor","age":35,"role":"Designer de produtos e participante da assembleia comunitária","personality":"Franco e colaborativo; aprecia projetos que escutem a experiência de quem vai usá-los.","appearance":"Pele negra, cabelo curto, óculos, roupa verde e cadeira de rodas manual visível.","mobility":"wheelchair","animation":"Cadeira completa nas quatro direções; quatro frames distintos com aros e raios girando, mãos de propulsão, rodízios e apoio de pés. O motor desloca o personagem normalmente, usando o mesmo atlas dos demais."},
 "luan":{"name":"Luan","age":14,"role":"Estudante e participante do grupo de debates","personality":"Espontâneo e prestativo; gosta de fazer perguntas e descobrir novas palavras.","appearance":"Pele negra, cachinhos curtos e camiseta alaranjada."},
 "selma":{"name":"Selma","age":40,"role":"Arquivista e colaboradora de preservação de documentos","personality":"Cuidadosa e perspicaz; relaciona informações de diferentes relatos sem apressar conclusões.","appearance":"Pele negra, locs, cardigan claro e identificação do arquivo."},
 "enzo":{"name":"Enzo","age":15,"role":"Estudante e frequentador do catálogo público","personality":"Inventivo e sociável; procura exemplos visuais para entender ideias novas.","appearance":"Pele negra retinta, cabelo curto, mochila e roupa roxa."},
}
RESIDENTS=["amara","tomas","elisa","andre","viviane","rui","jamila","otavio"]
SERVICES=["cora","bento","ines","celso","luzia","denis","maite"]
BACKGROUND=["aline","paulo","nara","dora","vitor","luan","selma","enzo"]
PROPS=["reading-desk","book-cart","table-lamp","cushioned-chair","tea-table","fountain-basin-front","watering-can","compost","seed-tray","plant-young","plant-grown","music-case","guitar-on-stand","acoustic-panel","mic","sheet-music","archive-drawer","document-support","gallery-label","frame-original-memory-scene","heat-sensor-demo","notebook-open","task-light","labeled-drawers","newspaper-rack","editorial-board","correction-card","review-desk","speaking-order","stackable-chair","public-catalog","backup-box","acaraje-tabuleiro","abara-basket","cocada-tray","fruit-crate","market-price-board","fabric-folded","picnic-basket","reed-clump","pond-stone","lily","bicycle-rack","community-board","plant-label","handwash","stage-monitor","original-portrait-gallery"]
ICONS=["bird","note","guitar","heart","book","cup","leaf","wave"]


def save(im,rel):
 p=OUT/rel;p.parent.mkdir(parents=True,exist_ok=True);im.save(p,optimize=True)


def sprite_hair(d,name,direction,b):
 """Small original hair overlays retain side-facing poses of the base renderer."""
 s=PEOPLE[name];h,hi=s["hair"],s["hairlight"]
 if name=="amara":
  ell(d,(12,0+b,20,5+b),h,"ink")
  for x in (13,16,19):line(d,(x,1+b,x+1,3+b),hi)
  if direction==0:
   for x in (10,12,19,21):line(d,(x,6+b,x+1,8+b),hi)
  if direction!=3:
   for x in ((9,22) if direction==0 else (20,) if direction==1 else (10,)):
    ell(d,(x,13+b,x+1,15+b),"amber","amberdark")
 elif name=="tomas":
  for x,y in [(11,4),(14,3),(17,3),(20,4),(22,6)]:
   ell(d,(x-2,y-1+b,x+1,y+2+b),h,"ink");rect(d,(x,y+b,x,y+b),hi)
 elif name in ("andre","jamila","aline","dora","selma"):
  xs=(8,22) if direction in (0,3) else (20,23) if direction==1 else (8,11)
  for x in xs:
   rect(d,(x,7+b,x+1,21+b),h,"ink")
   for y in (8,12,16,20):rect(d,(x,y+b,x,y+1+b),hi)
  if direction in (0,3):
   for x in (11,14,17,20):
    line(d,(x,3+b,x+1,8+b),h,2)
    rect(d,(x,4+b,x,4+b),hi)
 elif name=="viviane":
  ell(d,(9,0+b,23,9+b),"white","ink")
  poly(d,[(9,5+b),(15,1+b),(22,5+b),(21,8+b),(11,8+b)],"paper","ink")
  line(d,(12,3+b,19,4+b),"white",2)
  line(d,(11,6+b,20,6+b),"greylight")
  poly(d,[(15,1+b),(20,0+b),(21,3+b),(17,4+b)],"white","grey")
 elif name in ("rui","celso","cora"):
  for x in (11,14,17,20):
   line(d,(x,3+b,x+1,5+b,x,7+b),h,2)
   rect(d,(x,4+b,x,4+b),hi)
  if name=="cora":
   for x in ((8,22) if direction in (0,3) else (21,) if direction==1 else (10,)):
    line(d,(x,9+b,x+1,13+b,x,17+b),h,2)
    rect(d,(x,11+b,x,12+b),hi)
    rect(d,(x+1,15+b,x+1,16+b),hi)
 elif name=="denis":
  # Low side fade and a compact top, distinct from the longer curved base hair.
  if direction==0:
   rect(d,(9,7+b,10,11+b),s["skindark"])
   rect(d,(21,7+b,22,11+b),s["skindark"])
   poly(d,[(10,7+b),(11,3+b),(20,3+b),(22,7+b),(18,8+b)],h,"ink")
   line(d,(13,4+b,18,4+b),hi)
  elif direction==3:
   ell(d,(10,4+b,21,14+b),s["skindark"],"ink")
   rect(d,(10,3+b,21,7+b),h)
 elif name=="otavio":
  # Fones are added separately from the base's eyeglasses.
  line(d,(8,9+b,8,5+b,12,2+b,20,2+b,24,5+b,24,9+b),"cyandark",2)
  rect(d,(6,8+b,9,13+b),"cyan","ink")
  rect(d,(23,8+b,26,13+b),"cyan","ink")
  rect(d,(7,9+b,7,11+b),"cyanlight")
 elif name=="nara":
  ell(d,(9,2+b,23,10+b),h,"ink")
  for x,y in [(11,4),(14,3),(17,3),(20,4)]:rect(d,(x,y+b,x+1,y+b),hi)


def wheel(d,cx,cy,rx,ry,frame):
 """A real wheel with rotating three-spoke geometry and a rim marker."""
 ell(d,(cx-rx,cy-ry,cx+rx,cy+ry),"ink","ink")
 ell(d,(cx-rx+1,cy-ry+1,cx+rx-1,cy+ry-1),"navy","greylight")
 phase=frame*math.pi/6
 for j in range(3):
  theta=phase+j*math.pi*2/3
  x=cx+round((rx-1)*math.cos(theta));y=cy+round((ry-1)*math.sin(theta))
  line(d,(cx,cy,x,y),"grey")
 marker_x=cx+round((rx-1)*math.cos(phase));marker_y=cy+round((ry-1)*math.sin(phase))
 rect(d,(marker_x,marker_y,marker_x,marker_y),"cyanlight")
 rect(d,(cx,cy,cx,cy),"amber")


def wheelchair_sprite(row,frame):
 """Seated Vitor: body/chair share one moving sprite, all four views animate."""
 s=PEOPLE["vitor"];im=empty();d=ImageDraw.Draw(im)
 skin,sl,sd=s["skin"],s["skinlight"],s["skindark"]
 direction=row if row<4 else 0
 b=0 # Rolling motion is smooth; the body remains seated rather than walking.
 ell(d,(3,27,29,31),(17,23,41,72))
 if direction in (1,2):
  # Left-facing side view: backrest, seat, footplate, caster and drive wheel.
  rect(d,(21,12,24,24),"navy","ink")
  line(d,(23,12,25,12,26,16),"grey",2)
  rect(d,(9,20,23,23),"navylight","ink")
  line(d,(23,23,11,23,8,28),"grey",2)
  line(d,(11,23,17,28,24,25),"grey")
  rect(d,(4,28,12,29),"grey","ink")
  ell(d,(5,27,9,31),"navy","ink");rect(d,(7,29,7,29),"greylight")
  wheel(d,21,24,7,7,frame)
  # Folded seated legs and shoes sit above the footplate.
  rect(d,(11,20,19,23),s["pants"],"ink")
  rect(d,(8,22,15,25),s["pants"],"ink")
  rect(d,(8,25,10,28),s["pants"],"ink")
  rect(d,(5,27,10,28),"ink")
  poly(d,[(13,13),(20,13),(22,17),(20,21),(12,21),(11,17)],s["coat"],"ink")
  rect(d,(12,15,14,18),s["shirt"])
  rect(d,(14,11,18,14),skin,"ink")
  head=(10,2,22,13)
  ell(d,head,skin,"ink")
  poly(d,[(10,7),(8,9),(10,10),(11,10)],skin,"ink")
  rect(d,(10,5,11,8),sl)
  base.draw_hair(d,s,head,side=True)
  rect(d,(10,7,15,10),None,"ink");line(d,(15,8,19,9),"ink")
  rect(d,(12,8,12,8),"white")
  line(d,(10,11,13,11),sd)
  # Hands visibly change position around the push rim through the roll cycle.
  hx,hy=[(20,18),(25,22),(22,27),(17,22)][frame]
  line(d,(18,15,19,18,hx,hy),s["coat"],3)
  rect(d,(hx-1,hy-1,hx+1,hy+1),skin,"ink")
  if direction==2:im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  return im
 # Front and back views retain the full wheelchair outline and two drive wheels.
 rect(d,(8,11,24,24),"navy","ink")
 line(d,(8,12,6,12,6,17),"grey",2);line(d,(24,12,26,12,26,17),"grey",2)
 wheel(d,6,24,3,7,frame)
 wheel(d,26,24,3,7,frame)
 rect(d,(9,20,23,23),"navylight","ink")
 line(d,(8,22,10,29,22,29,24,22),"grey",2)
 ell(d,(9,28,13,31),"navy","ink");ell(d,(19,28,23,31),"navy","ink")
 if direction==3:
  poly(d,[(11,12),(21,12),(23,18),(9,18)],s["coat"],"ink")
  rect(d,(10,16,22,25),"navylight","ink")
  rect(d,(12,18,20,22),"navy","ink")
  line(d,(12,24,20,24),"cyan")
 else:
  rect(d,(11,21,14,26),s["pants"],"ink")
  rect(d,(18,21,21,26),s["pants"],"ink")
  rect(d,(11,25,14,28),s["pants"],"ink")
  rect(d,(18,25,21,28),s["pants"],"ink")
  rect(d,(10,27,15,29),"ink");rect(d,(17,27,22,29),"ink")
  rect(d,(9,30,23,31),"grey","ink")
  poly(d,[(11,13),(21,13),(23,18),(21,21),(11,21),(9,18)],s["coat"],"ink")
  rect(d,(14,14,18,18),s["shirt"])
  rect(d,(14,11,18,14),skin,"ink")
 head=(10,2,22,13)
 ell(d,head,skin,"ink");rect(d,(11,5,13,9),sl)
 base.draw_hair(d,s,head,back=direction==3)
 if direction!=3:
  rect(d,(11,7,15,10),None,"ink");rect(d,(17,7,21,10),None,"ink")
  line(d,(15,8,17,8),"ink")
  rect(d,(13,8,13,8),"white");rect(d,(19,8,19,8),"white")
  line(d,(14,11,18,11),sd)
 if row==5:
  line(d,(10,16,6,12,5,8+frame%2),s["coat"],3)
  line(d,(22,16,26,12,27,8-frame%2),s["coat"],3)
  rect(d,(4,6+frame%2,6,9+frame%2),skin,"ink")
  rect(d,(26,5-frame%2,28,8-frame%2),skin,"ink")
  star(d,2,3,"amber",1);star(d,30,2,"cyan",1)
 elif row==4:
  line(d,(10,16,8,20),s["coat"],3);rect(d,(7,20,9,22),skin,"ink")
  line(d,(22,16,25,15),s["coat"],3);rect(d,(24,13,26,15),skin,"ink")
  rect(d,(24,8,29,12),"navy","ink");rect(d,(25,9,28,10),"cyan")
 else:
  hy=[19,22,25,22][frame]
  line(d,(10,16,7,hy),s["coat"],3)
  line(d,(22,16,25,hy),s["coat"],3)
  rect(d,(6,hy-1,8,hy+1),skin,"ink");rect(d,(24,hy-1,26,hy+1),skin,"ink")
 return im


def cozy_sprite(name,row,frame):
 if name=="vitor":return wheelchair_sprite(row,frame)
 s=PEOPLE[name];direction=row if row<4 else 0
 state="walk" if row<4 else "interact" if row==4 else "celebrate"
 im=base.sprite(s,direction,frame,state);d=ImageDraw.Draw(im)
 b=1 if row<4 and frame in (1,3) else 0
 sprite_hair(d,name,direction,b)
 face=direction==0;back=direction==3
 if name=="amara":
  if face:
   for x,y,c in [(11,19,"white"),(19,19,"amber"),(12,22,"cyan"),(18,22,"white")]:
    rect(d,(x,y+b if y<21 else y,x+1,(y+b if y<21 else y)+1),c)
  if row==4:
   rect(d,(22,11,29,18),"violet","ink");rect(d,(24,12,28,16),"paper")
 elif name=="tomas":
  if face:
   line(d,(11,17+b,11,23),"greylight");line(d,(20,17+b,20,23),"greylight")
   rect(d,(12,20,14,22),"navy","greylight")
  if row==4:
   poly(d,[(24,10),(27,10),(27,13),(29,17),(22,17),(24,13)],"cyanlight","ink")
   rect(d,(23,15,28,16),"violet")
 elif name=="elisa":
  if face:
   rect(d,(12,19+b,12,19+b),"amber");rect(d,(19,21,19,21),"amber")
   line(d,(12,13+b,13,13+b),s["skindark"]);line(d,(18,13+b,19,13+b),s["skindark"])
  if row==4:
   rect(d,(21,10,28,18),"brownlight","ink");rect(d,(22,11,27,17),"paper")
   line(d,(23,15,25,12,26,16),"violet")
   line(d,(29,12,30,17),"coral")
 elif name=="andre":
  if row==4:
   ell(d,(17,21,28,30),"amberdark","ink")
   ell(d,(19,18,27,26),"amber","ink")
   line(d,(23,23,27,13),"brown",3);line(d,(23,23,27,13),"paper")
   ell(d,(21,22,24,25),"navy")
  elif row!=5:
   x=23 if direction in (0,1,3) else 5
   ell(d,(x-2,22,x+4,30),"amberdark","ink")
   line(d,(x+1,22,x+3,15),"brown",2)
   line(d,(x,24,x+2,28),"amber")
 elif name=="viviane":
  if direction in (0,3):
   poly(d,[(11,22),(20,22),(23,29),(8,29)],"white","ink")
   for x in (11,15,19):line(d,(x,23,x,28),"greylight")
   line(d,(9,28,22,28),"paper")
  else:
   poly(d,[(12,22),(20,22),(23,29),(10,29)],"white","ink")
   for x in (13,17,21):line(d,(x,23,x,28),"greylight")
  if row==4:
   rect(d,(21,16,30,18),"brownlight","ink")
   for x in (23,27):ell(d,(x-1,13,x+1,16),"amberdark","ink")
 elif name=="rui":
  if face:
   poly(d,[(13,18+b),(18,18+b),(19,24),(12,24)],"brownlight","ink")
   rect(d,(14,21,17,22),"brown")
  elif back:line(d,(11,22,20,22),"brownlight")
  if row==4:
   rect(d,(23,10,28,17),"paper","ink");line(d,(24,13,27,13),"navy")
   rect(d,(27,11,27,14),"coral")
 elif name=="jamila":
  if face:
   rect(d,(13,18+b,18,24),"navy","ink")
   line(d,(13,18+b,12,16+b),"navylight",2);line(d,(18,18+b,19,16+b),"navylight",2)
   for x,y,c in [(13,20,"coral"),(17,22,"amber"),(15,23,"cyan")]:rect(d,(x,y,x,y),c)
  if row==4:
   line(d,(24,17,26,10),"brownlight",2);rect(d,(25,8,27,10),"coral","ink")
 elif name=="otavio":
  if face:
   line(d,(13,17+b,16,20,19,17+b),"cyan")
   rect(d,(14,20,18,23),"paper","ink");rect(d,(15,21,17,21),"coral")
  if row==4:
   rect(d,(24,12,26,18),"navy","ink");ell(d,(23,9,27,13),"grey","ink")
 elif name=="cora":
  if face:
   rect(d,(10,20,13,23),"navy","ink");rect(d,(18,20,21,23),"navy","ink")
   for x in (11,19):rect(d,(x,21,x,21),"cyan")
  if row==4:
   rect(d,(22,11,29,18),"navy","ink")
   for x,c in [(23,"coral"),(25,"cyan"),(27,"amber")]:line(d,(x,13,x,16),c)
 elif name=="bento":
  if face:
   rect(d,(7,18+b,10,22+b),"paper","ink");rect(d,(21,18+b,24,22+b),"paper","ink")
   line(d,(15,18+b,15,24),"greenlight")
  if row==4:
   rect(d,(21,10,28,18),"amberdark","ink");rect(d,(23,12,26,16),"paper")
 elif name=="ines":
  if face:
   rect(d,(11,19+b,14,21+b),"cyan","ink")
   line(d,(16,19,16,23),"greylight")
  if row==4:
   poly(d,[(24,10),(27,10),(27,13),(29,17),(22,17),(24,13)],"cyanlight","ink")
   rect(d,(23,15,28,16),"violet")
 elif name=="celso":
  if row==4:
   rect(d,(21,10,28,18),"paper","ink")
   for y in (12,15):line(d,(23,y,26,y),"grey")
   line(d,(23,15,26,15),"cyan")
 elif name=="luzia":
  if row==4:
   rect(d,(22,10,28,18),"navylight","ink")
   for y,c in [(12,"coral"),(14,"amber"),(16,"cyan")]:rect(d,(23,y,24,y),c);line(d,(26,y,27,y),"paper")
 elif name=="denis":
  if face:
   rect(d,(19,19+b,21,21+b),"amber","ink")
  if row==4:
   rect(d,(22,10,28,18),"navy","ink");rect(d,(23,11,27,15),"cyan")
   line(d,(24,13,26,13),"paper")
 elif name=="maite":
  if face:
   poly(d,[(13,18+b),(18,18+b),(19,24),(12,24)],"brownlight","ink")
   rect(d,(14,21,17,22),"brown")
  if row==4:
   line(d,(24,17,26,10),"brownlight",2)
   poly(d,[(24,10),(28,8),(29,11),(26,13)],"grey","ink")
 elif name=="aline":
  if face:
   rect(d,(11,19,12,20),"amber");rect(d,(19,21,20,22),"coral")
  if row==4:
   rect(d,(22,10,28,18),"violet","ink");rect(d,(24,11,27,16),"paper")
 elif name=="paulo":
  if face:
   line(d,(11,17+b,11,23),"greylight");line(d,(20,17+b,20,23),"greylight")
  if row==4:
   ell(d,(17,21,28,30),"amberdark","ink")
   ell(d,(19,18,27,26),"amber","ink")
   line(d,(23,23,27,13),"brown",3);line(d,(23,23,27,13),"paper")
   ell(d,(21,22,24,25),"navy")
 elif name=="nara":
  if face:
   rect(d,(18,19,20,21),"cyan","ink")
  if row==4:
   rect(d,(22,10,28,17),"cyan","ink");line(d,(24,12,26,12),"paper")
 elif name=="dora":
  if face:
   line(d,(12,13+b,13,13+b),s["skindark"]);line(d,(18,13+b,19,13+b),s["skindark"])
  if row==4:
   rect(d,(22,10,28,17),"brownlight","ink");rect(d,(24,11,27,16),"paper")
 elif name=="selma":
  if face:line(d,(16,18,16,24),"greylight")
  if row==4:
   rect(d,(22,10,28,18),"paper","ink")
   for y in (12,15):line(d,(24,y,27,y),"navylight")
 elif name=="enzo":
  if face:rect(d,(11,19,13,21),"amber","ink")
  if row==4:
   rect(d,(22,10,28,18),"violet","ink");rect(d,(24,11,27,16),"cyanlight")
 return im


def cozy_portrait(name,expression):
 im=base.portrait(PEOPLE[name],expression).resize((48,48),Image.Resampling.NEAREST)
 d=ImageDraw.Draw(im);s=PEOPLE[name];h,hi=s["hair"],s["hairlight"]
 if name=="amara":
  ell(d,(17,0,31,10),h,"ink")
  for x in (19,23,27):line(d,(x,2,x+2,6),hi)
  for x in (14,18,30,34):line(d,(x,9,x+1,12),hi)
  ell(d,(10,24,13,28),"amber","amberdark");ell(d,(35,24,38,28),"amber","amberdark")
  for x,y,c in [(12,39,"amberlight"),(16,44,"cyan"),(31,39,"white"),(34,44,"amber"),(29,46,"cyan")]:
   poly(d,[(x,y),(x+2,y-1),(x+3,y+1),(x+1,y+2)],c)
  rect(d,(19,43,28,47),"violet","ink");rect(d,(21,44,27,46),"paper")
 elif name=="tomas":
  for x,y in [(15,7),(20,6),(25,6),(30,7),(33,10)]:
   ell(d,(x-2,y-2,x+2,y+2),h,"ink");rect(d,(x-1,y-1,x,y-1),hi)
  line(d,(14,36,14,47),"greylight");line(d,(34,37,34,47),"greylight")
  rect(d,(15,40,19,44),"navy","greylight");rect(d,(29,40,33,44),"navy","greylight")
  rect(d,(31,41,31,41),"amber")
 elif name=="elisa":
  line(d,(16,25,18,25),s["skindark"]);line(d,(30,25,32,25),s["skindark"])
  line(d,(19,32,22,34,27,34,30,32),s["skindark"])
  for x,y in [(14,40),(34,41),(14,45)]:rect(d,(x,y,x+1,y+1),"amber")
  rect(d,(23,41,36,47),"brownlight","ink");rect(d,(24,42,35,46),"paper")
  line(d,(27,45,29,42,31,45,33,43),"violet")
 elif name in ("andre","jamila"):
  # Locs and braids are drawn as individual segments, not straight hair.
  for x in (10,13,34,37):
   line(d,(x,12,x,35),h,2)
   for y in (14,20,26,32):rect(d,(x,y,x,y+2),hi)
  for x in (15,20,25,30):
   line(d,(x,6,x+1,11),h,2);rect(d,(x,7,x,8),hi)
  if name=="andre":
   line(d,(15,35,35,47),"brown",3)
   ell(d,(30,41,43,54),"amberdark","ink")
   ell(d,(33,40,41,48),"amber","ink")
   line(d,(37,45,40,35),"brown",3);line(d,(37,45,40,35),"paper")
   ell(d,(35,43,38,46),"navy")
  else:
   poly(d,[(18,37),(29,37),(32,47),(16,47)],"navy","ink")
   line(d,(18,37,15,34),"navylight",2);line(d,(29,37,33,34),"navylight",2)
   rect(d,(20,41,27,44),"navylight","ink")
   for x,y,c in [(19,42,"coral"),(27,45,"amber"),(23,39,"cyanlight")]:rect(d,(x,y,x+1,y),c)
   line(d,(35,43,38,35),"brownlight",2);rect(d,(37,33,39,36),"coral","ink")
 elif name=="viviane":
  ell(d,(10,0,38,16),"white","ink")
  poly(d,[(12,11),(17,3),(30,2),(36,11),(31,15),(15,15)],"paper","ink")
  line(d,(16,5,23,3,30,5),"white",2)
  line(d,(13,10,24,8,34,10),"greylight")
  line(d,(14,12,24,11,33,13),"white",2)
  poly(d,[(24,3),(30,0),(34,2),(31,6),(27,7)],"white","grey")
  rect(d,(17,36,30,47),"white")
  line(d,(18,38,24,40,29,38),"greylight")
  for x in (13,15,33,35):rect(d,(x,42,x,43),"greylight")
  # Tray marks the cultural food-selling context. No sacred objects are drawn.
  rect(d,(14,45,35,47),"brownlight","ink")
  for x in (19,25,31):ell(d,(x-2,41,x+2,45),"amberdark","ink");rect(d,(x-1,42,x,42),"amber")
 elif name=="rui":
  for x in (14,19,24,29,33):
   line(d,(x,6,x+1,9,x,13),h,2)
   rect(d,(x,7,x,8),hi)
   rect(d,(x+1,11,x+1,12),hi)
  poly(d,[(19,36),(29,36),(31,47),(17,47)],"brownlight","ink")
  line(d,(19,36,16,34),"brown");line(d,(29,36,32,34),"brown")
  rect(d,(21,41,28,45),"brown","ink")
  rect(d,(23,40,26,43),"paper","ink")
 elif name=="otavio":
  line(d,(10,20,10,10,16,3,30,3,38,10,38,22),"cyandark",2)
  rect(d,(8,18,12,26),"cyan","ink");rect(d,(36,18,40,26),"cyan","ink")
  rect(d,(9,20,10,23),"cyanlight");rect(d,(37,20,38,23),"cyanlight")
  line(d,(18,35,24,40,30,35),"cyan")
  rect(d,(21,41,28,47),"paper","ink");rect(d,(22,42,27,44),"coral")
  line(d,(23,46,27,46),"navy")
 elif name in ("cora","celso"):
  for x in (14,19,24,29,33):
   line(d,(x,6,x+1,9,x,13),h,2)
   rect(d,(x,7,x,8),hi);rect(d,(x+1,11,x+1,12),hi)
  if name=="cora":
   for x in (11,36):
    line(d,(x,12,x+1,18,x,24,x+1,30),h,2)
    for y in (15,21,27):rect(d,(x,y,x,y+1),hi)
   ell(d,(14,34,34,44),None,"navy",2)
   rect(d,(13,37,17,43),"navy","ink");rect(d,(31,37,35,43),"navy","ink")
   rect(d,(14,39,15,41),"cyan");rect(d,(32,39,33,41),"cyan")
  else:
   rect(d,(31,40,35,45),"paper","ink")
   line(d,(32,42,34,42),"coral")
 elif name=="bento":
  poly(d,[(8,40),(13,36),(17,35),(17,47),(8,47)],"paper","ink")
  poly(d,[(31,35),(36,37),(40,41),(40,47),(31,47)],"paper","ink")
  line(d,(24,37,24,47),"greenlight")
  rect(d,(29,41,34,44),"green","ink")
 elif name=="ines":
  rect(d,(12,39,17,42),"cyan","ink")
  line(d,(24,38,24,47),"greylight")
  rect(d,(31,40,35,43),"white","grey")
  rect(d,(32,41,34,41),"cyan")
 elif name=="luzia":
  line(d,(16,25,18,25),s["skindark"]);line(d,(30,25,32,25),s["skindark"])
  rect(d,(13,40,16,43),"violet","ink")
  rect(d,(32,40,34,42),"amber","ink")
 elif name=="denis":
  # Short textured top, shaved temples and smooth olive cardigan.
  rect(d,(11,14,13,19),s["skindark"])
  rect(d,(35,14,37,19),s["skindark"])
  poly(d,[(12,14),(13,7),(19,4),(29,5),(36,9),(35,14),(30,11),(18,11)],h,"ink")
  for x,y in [(17,7),(23,6),(29,8)]:rect(d,(x,y,x+1,y),hi)
  line(d,(24,38,24,47),"amberlight")
  rect(d,(29,41,34,44),"greendark","ink")
 elif name=="maite":
  poly(d,[(19,36),(29,36),(31,47),(17,47)],"brownlight","ink")
  line(d,(19,36,16,34),"brown");line(d,(29,36,32,34),"brown")
  rect(d,(21,41,28,45),"brown","ink")
  poly(d,[(23,41),(23,38),(26,39),(28,36),(29,38),(25,42)],"greenlight","greendark")
 elif name in ("aline","dora","selma"):
  for x in (10,13,34,37):
   line(d,(x,12,x,35),h,2)
   for y in (14,20,26,32):rect(d,(x,y,x,y+2),hi)
  for x in (15,20,25,30):line(d,(x,6,x+1,11),h,2);rect(d,(x,7,x,8),hi)
  if name=="aline":
   rect(d,(19,42,32,47),"violet","ink");rect(d,(21,43,31,46),"paper")
  elif name=="dora":
   line(d,(16,25,18,25),s["skindark"]);line(d,(30,25,32,25),s["skindark"])
   line(d,(19,32,22,34,27,34,30,32),s["skindark"])
   rect(d,(14,40,15,41),"amber");rect(d,(33,42,34,43),"amber")
  else:
   line(d,(24,38,24,47),"greylight")
   rect(d,(31,40,35,44),"paper","grey")
 elif name=="paulo":
  line(d,(14,36,14,47),"greylight");line(d,(34,37,34,47),"greylight")
  rect(d,(15,40,19,44),"navy","greylight")
  line(d,(15,35,35,47),"brown",3)
  ell(d,(30,41,43,54),"amberdark","ink")
  ell(d,(33,40,41,48),"amber","ink")
  line(d,(37,45,40,35),"brown",3);line(d,(37,45,40,35),"paper")
  ell(d,(35,43,38,46),"navy")
 elif name=="nara":
  ell(d,(12,5,36,17),h,"ink")
  for x,y in [(15,9),(20,7),(25,7),(30,9)]:rect(d,(x,y,x+1,y),hi)
  rect(d,(29,41,34,44),"cyan","ink")
 elif name=="vitor":
  # Chair back, armrests and portions of the wheels remain visible in portrait.
  rect(d,(6,36,10,47),"navy","ink");rect(d,(38,36,42,47),"navy","ink")
  rect(d,(5,39,11,41),"grey","ink");rect(d,(37,39,43,41),"grey","ink")
  ell(d,(1,42,10,53),None,"greylight",2)
  ell(d,(38,42,47,53),None,"greylight",2)
  rect(d,(20,42,27,44),"greenlight","greendark")
 elif name=="luan":
  rect(d,(11,38,37,47),s["coat"])
  ell(d,(19,33,29,39),s["coat"],"ink")
  ell(d,(20,33,28,37),s["skin"])
  rect(d,(13,41,16,44),"amberlight","coraldark")
 elif name=="enzo":
  line(d,(15,36,16,47),"violetdark",2);line(d,(33,36,32,47),"violetdark",2)
  rect(d,(29,42,33,45),"amber","ink")
 return im.resize((96,96),Image.Resampling.NEAREST)


def book(d,x,y,w=9,h=6,c="violet"):
 rect(d,(x,y,x+w,y+h),c,"ink");rect(d,(x+2,y+1,x+w-1,y+h-1),"paper")
 line(d,(x+2,y+2,x+w-2,y+2),"grey")


def open_book(d,x,y,w=16,h=9):
 poly(d,[(x,y+2),(x+w//2,y),(x+w,y+2),(x+w,y+h),(x+w//2,y+h-2),(x,y+h)],"paper","ink")
 line(d,(x+w//2,y+1,x+w//2,y+h-2),"brownlight")
 line(d,(x+2,y+4,x+w//2-2,y+3),"grey");line(d,(x+w//2+2,y+3,x+w-2,y+4),"grey")


def cup(d,x,y,c="white"):
 rect(d,(x,y,x+6,y+7),c,"ink")
 ell(d,(x,y-1,x+6,y+2),"brown","ink")
 ell(d,(x+5,y+1,x+9,y+5),None,c)
 line(d,(x+2,y-3,x+1,y-5,x+3,y-7),"paper")


def framed_people(d,x,y,w=25,h=25):
 rect(d,(x,y,x+w,y+h),"amberdark","ink");rect(d,(x+2,y+2,x+w-2,y+h-2),"brownlight")
 rect(d,(x+3,y+3,x+w-3,y+h-3),"navylight")
 rect(d,(x+3,y+h-8,x+w-3,y+h-3),"green")
 ell(d,(x+5,y+5,x+10,y+10),"amberlight")
 for xx,skin,c in [(x+7,"#8f5a40","coral"),(x+14,"#b47b54","cyan"),(x+20,"#744935","amber")]:
  ell(d,(xx-2,y+11,xx+2,y+15),skin,"ink")
  rect(d,(xx-2,y+10,xx+2,y+11),"ink")
  poly(d,[(xx-2,y+17),(xx+2,y+17),(xx+3,y+21),(xx-3,y+21)],c,"ink")
 line(d,(x+7,y+19,x+14,y+20,x+20,y+19),"paper")


def prop(name):
 im=empty();d=ImageDraw.Draw(im)
 if name=="reading-desk":
  rect(d,(3,21,6,30),"brown","ink");rect(d,(25,21,28,30),"brown","ink")
  rect(d,(1,17,30,22),"brownlight","ink")
  open_book(d,6,9,15,9)
  rect(d,(24,10,26,17),"coral","ink");line(d,(25,10,26,7),"amber")
 elif name=="book-cart":
  rect(d,(3,9,5,26),"grey","ink");rect(d,(25,9,27,26),"grey","ink")
  rect(d,(3,24,27,27),"navylight","ink")
  rect(d,(3,13,27,15),"navylight","ink")
  for x,c in [(6,"violet"),(11,"amber"),(16,"cyan"),(22,"coral")]:
   rect(d,(x,17,x+3,23),c,"ink");rect(d,(x+1,18,x+1,19),"paper")
  book(d,7,5,13,6,"coral")
  ell(d,(4,27,10,31),"navy","ink");ell(d,(21,27,27,31),"navy","ink")
  line(d,(26,11,29,11,29,5),"grey",2)
 elif name in ("table-lamp","task-light"):
  ell(d,(8,26,24,30),"navylight","ink")
  line(d,(16,26,16,17,22,11),"grey",2)
  poly(d,[(15,4),(26,7),(26,13),(11,9)],"amber" if name=="table-lamp" else "cyandark","ink")
  line(d,(12,9,25,13),"amberlight" if name=="table-lamp" else "cyanlight",2)
  poly(d,[(12,11),(24,14),(27,24),(7,24)],(239,183,78,45))
 elif name=="cushioned-chair":
  ell(d,(6,3,25,16),"violet","ink")
  rect(d,(6,11,25,26),"violet","ink")
  rect(d,(9,7,22,16),"violetlight","violetdark")
  rect(d,(3,17,8,27),"violetdark","ink");rect(d,(23,17,28,27),"violetdark","ink")
  rect(d,(9,20,22,26),"violetlight","ink")
  rect(d,(5,28,8,31),"brown","ink");rect(d,(23,28,26,31),"brown","ink")
 elif name=="tea-table":
  rect(d,(5,20,7,30),"brown","ink");rect(d,(25,20,27,30),"brown","ink")
  ell(d,(1,12,30,22),"brownlight","ink")
  line(d,(7,21,25,21),"amberdark")
  cup(d,8,10,"white");cup(d,21,12,"coral")
  ell(d,(16,8,21,13),"amberlight","ink")
 elif name=="fountain-basin-front":
  ell(d,(0,12,31,30),"grey","ink")
  ell(d,(2,13,29,24),"cyan","navy")
  poly(d,[(1,21),(5,25),(16,27),(27,25),(30,21),(30,27),(24,30),(7,30),(1,27)],"greylight","ink")
  for x in (7,16,25):line(d,(x,26,x,29),"grey")
  line(d,(5,18,11,18),"cyanlight");line(d,(19,20,25,20),"cyanlight")
 elif name=="watering-can":
  ell(d,(6,7,23,22),None,"cyandark",2)
  rect(d,(7,14,23,27),"cyan","ink")
  ell(d,(7,11,23,17),"cyandark","ink")
  poly(d,[(23,20),(29,11),(31,12),(27,25),(22,25)],"cyan","ink")
  rect(d,(28,10,31,13),"grey","ink")
  line(d,(10,17,10,24),"cyanlight")
  line(d,(3,18,6,18),"cyanlight")
 elif name=="compost":
  rect(d,(3,12,28,29),"brown","ink")
  for y in (16,21,26):line(d,(4,y,27,y),"brownlight",2)
  rect(d,(6,12,8,28),"amberdark");rect(d,(24,12,26,28),"amberdark")
  poly(d,[(5,13),(9,6),(13,8),(18,4),(24,9),(27,13)],"greendark","ink")
  for x,y,c in [(10,10,"green"),(17,7,"amber"),(21,11,"brownlight")]:rect(d,(x,y,x+2,y+1),c)
  poly(d,[(13,22),(15,19),(18,20),(17,23)],"greenlight")
 elif name=="seed-tray":
  poly(d,[(3,12),(24,8),(29,14),(8,20)],"navylight","ink")
  poly(d,[(3,12),(8,20),(8,27),(3,23)],"navy","ink")
  poly(d,[(8,20),(29,14),(29,22),(8,27)],"navylight","ink")
  for x,y in [(8,13),(14,12),(21,10),(16,17),(23,15)]:
   ell(d,(x-2,y-1,x+2,y+1),"brown","ink")
   line(d,(x,y,x,y-4),"green",2)
   line(d,(x-2,y-3,x,y-1,x+2,y-4),"greenlight")
 elif name in ("plant-young","plant-grown"):
  poly(d,[(10,20),(23,20),(21,29),(12,29)],"coraldark","ink")
  rect(d,(9,18,24,21),"coral","ink")
  line(d,(16,18,16,8 if name=="plant-young" else 2),"greendark",2)
  coords=[(12,11),(20,8)] if name=="plant-young" else [(11,13),(21,10),(12,5),(20,2)]
  for x,y in coords:
   ell(d,(x-3,y-2,x+3,y+2),"green","greendark");line(d,(x,y,16,y+3),"greenlight")
  if name=="plant-grown":star(d,16,1,"amberlight",2)
 elif name=="music-case":
  ell(d,(4,16,25,30),"navy","ink")
  ell(d,(7,12,23,23),"navy","ink")
  rect(d,(12,4,18,19),"navy","ink")
  rect(d,(11,1,19,7),"navylight","ink")
  line(d,(8,24,19,24),"navylight")
  rect(d,(23,18,26,23),"grey","ink")
  rect(d,(10,18,13,19),"amber");rect(d,(18,26,21,27),"cyan")
 elif name=="guitar-on-stand":
  ell(d,(8,18,24,30),"amberdark","ink")
  ell(d,(11,13,23,24),"amber","ink")
  rect(d,(15,5,18,21),"brown","ink")
  rect(d,(14,1,19,6),"brownlight","ink")
  ell(d,(13,20,20,26),"navy","ink")
  line(d,(16,4,16,28),"paper");line(d,(18,4,18,28),"paper")
  line(d,(6,30,7,22,10,22),"grey",2);line(d,(25,22,28,30),"grey",2)
  rect(d,(13,28,21,29),"brown","ink")
 elif name=="acoustic-panel":
  rect(d,(3,2,28,30),"brownlight","ink")
  rect(d,(5,4,26,28),"violetdark","ink")
  for y in range(7,27,6):
   for x in range(8,25,6):
    poly(d,[(x,y-3),(x+3,y),(x,y+3),(x-3,y)],"violet","navy")
    line(d,(x,y-2,x+2,y),"violetlight")
 elif name=="mic":
  ell(d,(11,2,21,14),"grey","ink")
  for y in (5,8,11):line(d,(13,y,19,y),"navy")
  rect(d,(14,14,17,25),"navy","ink")
  rect(d,(12,17,19,19),"cyan","ink")
  line(d,(16,24,7,29),"grey",2);line(d,(16,24,25,29),"grey",2)
 elif name=="sheet-music":
  poly(d,[(6,2),(23,2),(27,6),(27,29),(6,29)],"paper","ink")
  poly(d,[(23,2),(23,6),(27,6)],"grey","ink")
  for y in (10,13,16,19,22):line(d,(9,y,24,y),"grey")
  for x,y in [(13,13),(22,19)]:line(d,(x,y-5,x,y),"navy");ell(d,(x-3,y-1,x,y+1),"navy")
  line(d,(16,8,21,10),"violet",2)
 elif name in ("archive-drawer","labeled-drawers"):
  rect(d,(3,2,28,30),"brown" if name=="archive-drawer" else "navylight","ink")
  for y in (5,13,21):
   rect(d,(5,y,26,y+6),"brownlight" if name=="archive-drawer" else "navy","ink")
   rect(d,(9,y+1,18,y+3),"paper","grey")
   line(d,(11,y+2,16,y+2),"navylight")
   rect(d,(21,y+2,23,y+3),"amber","ink")
  rect(d,(5,30,8,31),"ink");rect(d,(23,30,26,31),"ink")
 elif name=="document-support":
  poly(d,[(4,24),(8,8),(25,8),(28,24)],"brownlight","ink")
  poly(d,[(8,10),(24,10),(25,22),(7,22)],"paper","ink")
  for y in (13,16,19):line(d,(10,y,22,y),"navylight")
  rect(d,(3,24,29,27),"amberdark","ink")
  rect(d,(7,27,9,30),"brown","ink");rect(d,(23,27,25,30),"brown","ink")
 elif name in ("gallery-label","plant-label"):
  if name=="plant-label":
   rect(d,(14,19,17,31),"brownlight","ink")
   poly(d,[(5,6),(26,6),(26,20),(5,20)],"paper","ink")
   line(d,(10,9,13,13,11,16),"green",2);ell(d,(10,8,16,12),"green","greendark")
   line(d,(18,10,23,10),"navylight");line(d,(18,14,23,14),"navylight")
  else:
   rect(d,(3,8,28,23),"paper","ink")
   rect(d,(5,10,7,21),"violet")
   line(d,(10,11,25,11),"navy",2)
   for y in (15,18):line(d,(10,y,23,y),"grey")
 elif name=="frame-original-memory-scene":
  framed_people(d,2,2,27,27)
 elif name=="heat-sensor-demo":
  rect(d,(4,23,28,29),"navylight","ink")
  rect(d,(7,6,14,23),"navy","ink")
  rect(d,(9,8,12,18),"paper","ink")
  rect(d,(10,11,11,18),"coral")
  ell(d,(8,17,13,22),"coral","ink")
  rect(d,(19,10,26,23),"cyandark","ink")
  rect(d,(21,12,24,17),"cyanlight")
  line(d,(20,6,20,3,23,1),"coral")
  line(d,(25,8,26,5,29,3),"amber")
 elif name=="notebook-open":
  open_book(d,3,8,25,18)
  for y in (14,17,20):line(d,(6,y,13,y-1),"grey");line(d,(18,y-1,25,y),"grey")
  line(d,(22,25,28,9),"coral",2);rect(d,(28,7,29,9),"amber")
  rect(d,(15,10,15,23),"violet")
 elif name=="newspaper-rack":
  rect(d,(4,5,27,26),"brown","ink")
  for y in (7,15,23):
   rect(d,(6,y,25,y+6),"paper","ink")
   line(d,(8,y+1,23,y+1),"navylight")
   rect(d,(8,y+3,13,y+5),"grey");line(d,(16,y+3,23,y+3),"grey")
   rect(d,(5,y+5,26,y+7),"brownlight","ink")
  rect(d,(5,28,8,31),"navy","ink");rect(d,(23,28,26,31),"navy","ink")
 elif name in ("editorial-board","community-board"):
  rect(d,(2,3,29,25),"brownlight","ink")
  rect(d,(4,5,27,23),"navy" if name=="editorial-board" else "violetdark","ink")
  for x,y,c in [(6,7,"paper"),(18,7,"amberlight"),(9,16,"corallight"),(21,16,"cyanlight")]:
   rect(d,(x,y,x+5,y+4),c,"ink");line(d,(x+1,y+2,x+4,y+2),"grey")
  if name=="editorial-board":line(d,(12,9,17,9),"cyan");line(d,(10,12,12,15),"coral")
  else:star(d,16,13,"amber",2)
  rect(d,(5,26,8,31),"brown","ink");rect(d,(23,26,26,31),"brown","ink")
 elif name=="correction-card":
  rect(d,(5,4,27,27),"paper","ink")
  for y in (9,14,19):line(d,(9,y,23,y),"grey")
  line(d,(10,9,21,9),"coral",2)
  line(d,(10,13,22,13),"cyan",2)
  line(d,(18,24,21,27,29,19),"green",2)
 elif name=="review-desk":
  rect(d,(3,20,6,30),"brown","ink");rect(d,(25,20,28,30),"brown","ink")
  rect(d,(1,15,30,22),"brownlight","ink")
  rect(d,(5,6,18,17),"paper","ink")
  for y in (9,12,15):line(d,(7,y,15,y),"grey")
  line(d,(8,10,15,10),"coral")
  ell(d,(18,9,27,18),"cyanlight","ink")
  ell(d,(20,11,25,16),"paper","cyandark")
  line(d,(24,17,29,22),"navy",3)
 elif name=="speaking-order":
  rect(d,(6,4,25,27),"navylight","ink")
  rect(d,(8,6,23,25),"paper","ink")
  for y,c in [(9,"coral"),(15,"amber"),(21,"cyan")]:
   ell(d,(10,y-2,14,y+2),c,"ink");line(d,(17,y,21,y),"grey")
  rect(d,(12,2,19,6),"amber","ink")
  line(d,(27,10,30,13,27,16),"cyan",2)
 elif name=="stackable-chair":
  for x,y,c in [(8,3,"navylight"),(5,8,"cyan"),(2,13,"cyandark")]:
   rect(d,(x+4,y,x+20,y+10),c,"ink")
   rect(d,(x+1,y+10,x+22,y+13),c,"ink")
  for x in (4,25):line(d,(x,26,x,31),"grey",2)
  line(d,(12,24,12,29),"grey")
 elif name=="public-catalog":
  rect(d,(4,3,27,19),"navylight","ink")
  rect(d,(6,5,25,17),"navy","ink")
  rect(d,(8,7,23,9),"paper")
  for y in (12,15):line(d,(9,y,21,y),"cyan")
  rect(d,(14,20,17,24),"grey","ink")
  rect(d,(7,24,25,27),"navylight","ink")
  rect(d,(3,28,28,30),"darkgrey","ink")
  for x in (6,10,14,18,22,26):rect(d,(x,29,x,29),"cyanlight")
 elif name=="backup-box":
  rect(d,(3,11,28,29),"navy","ink")
  rect(d,(5,13,26,18),"navylight","ink")
  rect(d,(7,14,18,16),"paper","ink")
  rect(d,(23,14,24,16),"cyan")
  line(d,(9,23,13,20,13,25,18,22),"cyan",2)
  rect(d,(4,7,27,11),"grey","ink");rect(d,(8,3,23,7),"navylight","ink")
 elif name=="acaraje-tabuleiro":
  rect(d,(3,21,6,31),"brown","ink");rect(d,(25,21,28,31),"brown","ink")
  rect(d,(1,17,30,23),"brownlight","ink")
  rect(d,(4,12,27,18),"paper","ink")
  for x,y in [(8,13),(15,11),(22,13)]:
   ell(d,(x-4,y-4,x+4,y+3),"amberdark","ink")
   line(d,(x-2,y,x+2,y-1),"brown")
   rect(d,(x-2,y-2,x,y-2),"amber")
   line(d,(x-2,y+1,x+2,y),"coral")
  rect(d,(2,7,6,12),"white","ink");ell(d,(2,6,6,8),"coral","ink")
  rect(d,(26,7,30,12),"white","ink");ell(d,(26,6,30,8),"amber","ink")
 elif name=="abara-basket":
  ell(d,(2,10,30,29),"brownlight","ink")
  ell(d,(4,10,28,21),"brown","ink")
  for x,y in [(8,12),(16,9),(24,13),(15,18)]:
   poly(d,[(x-4,y),(x,y-4),(x+4,y),(x+1,y+6),(x-2,y+5)],"green","ink")
   line(d,(x-2,y,x+2,y),"greenlight");line(d,(x,y-2,x,y+4),"greendark")
  for y in (22,25,28):line(d,(5,y,27,y),"amberdark")
  for x in (7,13,19,25):line(d,(x,21,x,28),"amberdark")
 elif name=="cocada-tray":
  poly(d,[(3,9),(25,9),(30,24),(0,24)],"paper","ink")
  line(d,(2,23,28,23),"grey")
  for x,y,c in [(8,11,"white"),(17,11,"amberlight"),(7,18,"brownlight"),(19,18,"white")]:
   rect(d,(x-3,y,x+4,y+5),c,"amberdark")
   for xx,yy in [(x-1,y+1),(x+2,y+2),(x,y+4)]:rect(d,(xx,yy,xx+1,yy),"paper" if c=="brownlight" else "brownlight")
 elif name=="fruit-crate":
  rect(d,(3,13,28,29),"brownlight","ink")
  for y in (17,23):line(d,(4,y,27,y),"brown",2)
  rect(d,(5,15,7,27),"amberdark");rect(d,(25,15,27,27),"amberdark")
  for x,y,c in [(8,13,"coral"),(15,10,"greenlight"),(24,13,"amber"),(18,15,"coral")]:
   ell(d,(x-4,y-4,x+4,y+3),c,"ink");line(d,(x,y-4,x+1,y-6),"greendark")
   rect(d,(x-2,y-2,x-1,y-2),"white")
 elif name=="market-price-board":
  rect(d,(5,2,26,26),"brownlight","ink")
  rect(d,(7,4,24,24),"navy","ink")
  for y,c in [(8,"coral"),(14,"green"),(20,"amber")]:
   ell(d,(9,y-2,13,y+2),c);line(d,(16,y-1,21,y-1),"paper");line(d,(16,y+1,20,y+1),"amberlight")
  line(d,(7,26,3,31),"brown",2);line(d,(24,26,28,31),"brown",2)
 elif name=="fabric-folded":
  for x,y,c in [(3,24,"violet"),(5,18,"cyan"),(3,12,"coral"),(6,6,"amber")]:
   rect(d,(x,y,x+23,y+5),c,"ink")
   line(d,(x+2,y+1,x+20,y+1),"paper")
   for xx in (x+4,x+10,x+17):rect(d,(xx,y+3,xx+1,y+4),"violetdark" if c=="amber" else "amberlight")
 elif name=="picnic-basket":
  ell(d,(8,1,25,17),None,"amberdark",2)
  poly(d,[(4,14),(29,14),(26,29),(7,29)],"brownlight","ink")
  for y in (18,23,27):line(d,(6,y,27,y),"amberdark")
  for x in (10,16,22):line(d,(x,15,x,28),"amberdark")
  poly(d,[(7,13),(24,13),(26,20),(19,19),(17,22),(13,18),(8,20)],"paper","ink")
  for x in (10,16,22):line(d,(x,14,x+2,20),"coral")
  rect(d,(14,21,19,24),"amber","ink")
 elif name=="reed-clump":
  ell(d,(2,25,29,30),"greendark")
  for x,y in [(7,4),(14,1),(22,7),(27,10)]:
   line(d,(x,28,x,y),"green",2)
   rect(d,(x-1,y,x+1,y+5),"brownlight","ink")
  for pts in [(5,28,1,15),(12,27,8,10),(17,28,23,17),(26,27,31,18)]:line(d,pts,"greenlight",2)
 elif name=="pond-stone":
  ell(d,(2,24,30,30),(17,23,41,65))
  poly(d,[(3,22),(7,13),(19,10),(28,15),(30,24),(23,28),(8,28)],"grey","ink")
  poly(d,[(7,14),(18,11),(27,16),(21,20),(6,19)],"greylight")
  line(d,(9,26,22,26),"darkgrey")
  ell(d,(6,13,12,18),"green","greendark")
  line(d,(15,14,20,14),"white")
 elif name=="lily":
  ell(d,(2,13,29,29),"green","greendark")
  poly(d,[(16,20),(30,23),(27,29)],"cyandark")
  line(d,(5,22,16,19),"greenlight")
  for box in [(8,10,17,23),(14,8,23,22),(6,16,18,24),(14,16,25,24)]:ell(d,box,"pink","violetdark")
  ell(d,(10,14,22,24),"corallight","coral")
  ell(d,(14,17,19,21),"amberlight","amber")
 elif name=="bicycle-rack":
  for x in (4,13,22):
   line(d,(x,28,x,9,x+2,6,x+5,6,x+7,9,x+7,28),"grey",2)
   line(d,(x+1,10,x+1,26),"greylight")
  rect(d,(1,27,31,30),"navylight","ink")
 elif name=="handwash":
  rect(d,(6,19,25,29),"greylight","ink")
  rect(d,(4,14,27,22),"white","ink")
  ell(d,(7,15,24,21),"cyan","grey")
  line(d,(17,15,17,6,22,6,22,10),"grey",3)
  line(d,(17,7,21,7),"white");line(d,(22,11,22,15),"cyanlight")
  rect(d,(7,9,11,15),"coral","ink");rect(d,(8,7,10,9),"white","ink")
  rect(d,(11,27,20,31),"grey","ink")
 elif name=="stage-monitor":
  poly(d,[(3,25),(9,12),(25,12),(30,25)],"navylight","ink")
  poly(d,[(6,23),(11,14),(23,14),(27,23)],"navy","ink")
  ell(d,(12,15,21,22),"violetdark","ink")
  ell(d,(15,17,18,20),"cyan","ink")
  rect(d,(3,25,30,29),"navy","ink")
  rect(d,(6,26,9,27),"cyan");line(d,(26,29,30,31),"grey")
 elif name=="original-portrait-gallery":
  # Three deliberately fictional portraits painted for this game's gallery.
  for x,y,skin,c in [(1,5,"#744935","cyan"),(12,2,"#966246","coral"),(23,5,"#b47b54","amber")]:
   rect(d,(x,y,x+8,y+23),"amberdark","ink")
   rect(d,(x+1,y+1,x+7,y+22),"paper")
   rect(d,(x+2,y+3,x+6,y+18),"violetdark")
   ell(d,(x+2,y+7,x+6,y+12),skin,"ink")
   rect(d,(x+2,y+6,x+6,y+8),"ink")
   poly(d,[(x+2,y+14),(x+6,y+14),(x+7,y+18),(x+1,y+18)],c,"ink")
   rect(d,(x+2,y+20,x+6,y+20),"grey")
 else:raise ValueError(name)
 return im


def icon(name):
 im=empty();d=ImageDraw.Draw(im)
 if name=="bird":
  ell(d,(9,14,23,25),"cyan","ink")
  poly(d,[(11,22),(3,28),(6,20)],"cyandark","ink")
  ell(d,(19,8,28,18),"cyan","ink")
  poly(d,[(27,12),(31,15),(27,16)],"amber","ink")
  rect(d,(24,11,25,12),"ink")
  ell(d,(17,20,24,25),"amberlight")
  poly(d,[(14,18),(7,5),(3,7),(7,16)],"cyandark","ink")
  line(d,(14,18,6,8),"cyanlight")
 elif name=="note":
  line(d,(12,8,25,4,25,22),"violetlight",3)
  line(d,(12,8,12,25),"violetlight",3)
  ell(d,(4,22,13,29),"coral","ink");ell(d,(17,19,26,26),"amber","ink")
 elif name=="guitar":return prop("guitar-on-stand")
 elif name=="heart":
  poly(d,[(3,10),(6,5),(11,5),(16,10),(21,5),(26,5),(29,10),(28,17),(16,29),(4,17)],"coral","ink")
  line(d,(6,10,7,8,10,8),"corallight",2)
 elif name=="book":
  open_book(d,2,6,27,23)
  for y in (13,18,23):line(d,(5,y,12,y-1),"grey");line(d,(19,y-1,26,y),"grey")
  rect(d,(15,8,16,25),"violet")
 elif name=="cup":
  ell(d,(3,25,29,30),"paper","ink")
  rect(d,(6,11,23,26),"cyan","ink")
  ell(d,(6,8,23,15),"brown","ink")
  ell(d,(22,13,30,22),None,"cyan",2)
  line(d,(9,17,9,23),"cyanlight")
  line(d,(12,6,10,3,13,0),"paper");line(d,(19,6,21,3,19,0),"paper")
 elif name=="leaf":
  poly(d,[(6,27),(4,16),(8,8),(18,4),(29,3),(28,15),(23,23),(13,26)],"green","ink")
  line(d,(4,30,24,8),"greenlight",2)
  line(d,(12,21,9,12),"greendark");line(d,(17,17,24,17),"greendark")
  line(d,(18,14,16,7),"greenlight")
 elif name=="wave":
  for y,c in [(9,"cyanlight"),(17,"cyan"),(25,"cyandark")]:
   line(d,(1,y,5,y-3,10,y-3,15,y,20,y,25,y-3,30,y-3),c,3)
 return im


def create_preview():
 im=Image.new("RGBA",(1100,1040),color("outline"));d=ImageDraw.Draw(im)
 d.text((12,10),"VOICES / COZY WORLD / ORIGINAL FICTIONAL RESIDENTS",fill=color("paper"))
 for i,name in enumerate(RESIDENTS):
  x=12+(i%4)*272;y=38+(i//4)*178
  d.text((x,y),f"{name} / {META[name]['age']}",fill=color("white"))
  with Image.open(OUT/"characters"/f"{name}.png") as s:
   im.alpha_composite(s.crop((0,0,32,32)).resize((64,64),Image.Resampling.NEAREST),(x,y+23))
   im.alpha_composite(s.crop((0,32,32,64)).resize((48,48),Image.Resampling.NEAREST),(x+8,y+94))
  with Image.open(OUT/"characters"/f"{name}-portrait.png") as s:
   im.alpha_composite(s.crop((0,0,96,96)),(x+72,y+32))
   im.alpha_composite(s.crop((96,0,192,96)).resize((72,72),Image.Resampling.NEAREST),(x+174,y+56))
 d.text((12,404),"48 COZY OBJECTS / EXACT IDs 0-47",fill=color("paper"))
 with Image.open(OUT/"tilesets"/"cozy-props.png") as s:
  for i,name in enumerate(PROPS):
   x=12+(i%8)*136;y=432+(i//8)*84
   cell=s.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32))
   im.alpha_composite(cell.resize((64,64),Image.Resampling.NEAREST),(x+30,y))
   # Long labels are shortened only in the review contact sheet.
   label=f"{i} {name}"
   d.text((x,y+65),label[:24],fill=color("white"))
 d.text((12,944),"ICONS: bird, note, guitar, heart, book, cup, leaf, wave",fill=color("paper"))
 with Image.open(OUT/"ui"/"cozy-icons.png") as s:im.alpha_composite(s.resize((512,64),Image.Resampling.NEAREST),(12,960))
 save(im,"ui/cozy-preview.png")
 im=Image.new("RGBA",(1100,415),color("outline"));d=ImageDraw.Draw(im)
 d.text((12,10),"VOICES / COZY SERVICES / DISTINCT FICTIONAL CHARACTERS",fill=color("paper"))
 for i,name in enumerate(SERVICES):
  x=12+(i%4)*272;y=38+(i//4)*178
  d.text((x,y),f"{name} / {META[name]['age']}",fill=color("white"))
  with Image.open(OUT/"characters"/f"{name}.png") as s:
   im.alpha_composite(s.crop((0,0,32,32)).resize((64,64),Image.Resampling.NEAREST),(x,y+23))
   im.alpha_composite(s.crop((0,32,32,64)).resize((48,48),Image.Resampling.NEAREST),(x+8,y+94))
  with Image.open(OUT/"characters"/f"{name}-portrait.png") as s:
   im.alpha_composite(s.crop((0,0,96,96)),(x+72,y+32))
   im.alpha_composite(s.crop((96,0,192,96)).resize((72,72),Image.Resampling.NEAREST),(x+174,y+56))
 save(im,"ui/cozy-services-preview.png")


def validate():
 expected={}
 for name in PEOPLE:
  expected[f"characters/{name}.png"]=(128,192)
  expected[f"characters/{name}-portrait.png"]=(288,96)
 expected.update({"tilesets/cozy-props.png":(256,192),"ui/cozy-icons.png":(256,32)})
 for rel,size in expected.items():
  with Image.open(OUT/rel) as im:
   assert im.size==size,(rel,im.size,size)
   assert im.mode=="RGBA",(rel,im.mode)
   assert im.getchannel("A").getextrema()==(0,255),(rel,"alpha")
   assert im.getbbox(),(rel,"empty")
 with Image.open(OUT/"tilesets"/"cozy-props.png") as im:
  for i,name in enumerate(PROPS):
   cell=im.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32))
   assert cell.getbbox(),(i,name,"empty")
   assert cell.getchannel("A").getextrema()==(0,255),(i,name,"alpha")
 for name in PEOPLE:
  with Image.open(OUT/"characters"/f"{name}-portrait.png") as im:
   assert len({im.crop((i*96,0,i*96+96,96)).tobytes() for i in range(3)})==3,(name,"expressions")
 print(f"Validated {len(expected)} new RGBA sheets,48 detailed props,23 distinct original characters,69 portrait expressions and8 icons.")


def main():
 for name in PEOPLE:
  s=empty(128,192)
  for row in range(6):
   for frame in range(4):s.alpha_composite(cozy_sprite(name,row,frame),(frame*32,row*32))
  save(s,f"characters/{name}.png")
  p=empty(288,96)
  for i,e in enumerate(("neutral","happy","concerned")):p.alpha_composite(cozy_portrait(name,e),(i*96,0))
  save(p,f"characters/{name}-portrait.png")
 s=empty(256,192)
 for i,name in enumerate(PROPS):s.alpha_composite(prop(name),((i%8)*32,(i//8)*32))
 save(s,"tilesets/cozy-props.png")
 s=empty(256,32)
 for i,name in enumerate(ICONS):s.alpha_composite(icon(name),(i*32,0))
 save(s,"ui/cozy-icons.png")
 manifest={
  "name":"VOICES cozy original art expansion","version":1,"tileSize":32,
  "props":{"file":"assets/tilesets/cozy-props.png","width":256,"height":192,"columns":8,"rows":6,"cellWidth":32,"cellHeight":32,"ids":{name:i for i,name in enumerate(PROPS)},"crop":"sx=(id%8)*32;sy=Math.floor(id/8)*32"},
  "icons":{"file":"assets/ui/cozy-icons.png","width":256,"height":32,"columns":8,"rows":1,"ids":{name:i for i,name in enumerate(ICONS)},"crop":"sx=id*32;sy=0"},
  "npcSprite":{"pattern":"assets/characters/{id}.png","width":128,"height":192,"cellWidth":32,"cellHeight":32,"columns":4,"idleColumn":0,"rows":{"down":0,"left":1,"right":2,"up":3,"interaction":4,"celebration":5}},
  "npcPortrait":{"pattern":"assets/characters/{id}-portrait.png","width":288,"height":96,"cellWidth":96,"cellHeight":96,"columns":{"neutral":0,"happy":1,"concerned":2}},
  "characters":{name:{**data,"identity":data.get("identity","Personagem negro(a) brasileiro(a), original e fictício(a)."),"sprite":f"assets/characters/{name}.png","portrait":f"assets/characters/{name}-portrait.png"} for name,data in META.items()},
  "residents":RESIDENTS,"services":SERVICES,"neighbors":BACKGROUND,
  "preview":"assets/ui/cozy-preview.png","servicesPreview":"assets/ui/cozy-services-preview.png","source":"tools/create_cozy_assets.py",
  "art":"Original deterministic native Pillow pixel source. Uses navy,violet,cyan,amber,coral and warm wood. All sprites and props have actual alpha. Existing art files are preserved.",
  "culturalContext":"Viviane is an individually characterized food entrepreneur in the contextual baiana de acarajé occupation. The food props distinguish acarajé,abará in banana leaves and cocada. No sacred beads,ritual objects or real famous portrait are represented. Character personalities are individual,not claims about any demographic group.",
 }
 (OUT/"tilesets"/"cozy-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 validate();create_preview()


if __name__=="__main__":main()
