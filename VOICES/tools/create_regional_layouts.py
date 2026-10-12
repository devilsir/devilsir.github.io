import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
before=json.loads((root/'data/map-baseline-v2.1.json').read_text())
catalog=json.loads((root/'data/catalog-baseline-v2.1.json').read_text())
regional=json.loads((root/'assets/tilesets/regional-manifest.json').read_text())['props']
assets={(a['family'],a['index']):a for a in catalog+regional}
plans={}

def plan(id,w,h,name,outline,zones,spawn,palette,buildings=(),holes=()):
    old=before[id]['design']
    p={**old,'width':w,'height':h,'name':name,'regionRevision':8,'outline':outline,'holes':list(holes),'zones':zones,'spawn':spawn,'palette':palette,'paths':[],'rugs':[],'decor':[],'positions':{},'anchors':[],'routines':{},'scenes':json.loads(json.dumps(old['scenes'])),'buildings':list(buildings),'surfaces':[],'meeting':spawn,'composedScenes':[]}
    p.pop('pond',None)
    for s in p['scenes']:
        for key in ['hostDecor','materials','rotation','flip']:s.pop(key,None)
    plans[id]=p
    return p

def places(p,rows):
    for key,pos in rows.items():p['positions'][key]=pos

def scene(p,id,x,y,family=None,index=None,size=None,dir=None):
    s=next(s for s in p['scenes'] if s['id']==id)
    s['x'],s['y']=x,y
    if family is not None:s['family'],s['prop']=family,index
    if size is not None:s['size']=size
    if dir is not None:s['dir']=dir
    p['positions']['cozy-'+p['id']+'-'+id]=[x,y]
    return s

def decor(p,family,index,x,y,size=1.5,solid=None,meta=None):
    a=assets[(family,index)]
    serial=p.get('_propSerial',0);p['_propSerial']=serial+1
    uid='region-'+p['id']+'-'+str(serial)
    row=[family,index,x,y,size,a.get('solid',False) if solid is None else solid,{'id':uid,'layer':a.get('layer','object'),**(meta or {})}]
    p['decor'].append(row)
    return row

def host(p,scene_id,index,x,y,size=2):
    row=decor(p,'furnishings',index,x,y,size)
    s=next(s for s in p['scenes'] if s['id']==scene_id)
    s.update(family='furnishings',prop=index,x=x+size/2-.5,y=y+size*.79-.5,size=size,hostDecor=row[6]['id'])
    row[6]['sceneIds']=[scene_id]
    return row

def anchor(p,id,x,y,state='working',duration=24,dir=0):
    p['anchors'].append([id,x,y,state,duration,dir])

def routine(p,id,tasks):p['routines'][id]=tasks

def path(p,*rects):p['paths'].extend(rects)

def surface(p,points,color,pattern='stone'):p['surfaces'].append({'polygon':points,'color':color,'pattern':pattern})

def building(x,y,w,h,label,style,color,door=None):return {'x':x,'y':y,'w':w,'h':h,'label':label,'style':style,'color':color,'door':door}

p=plan('hub',38,26,'Praça das Vozes · largos e alamedas',[[6,1],[31,1],[37,7],[37,20],[31,25],[7,25],[1,19],[1,7]], [['Fonte e descanso',13,9,11,9],['Leitura e avisos',4,5,8,7],['Refrescos e correspondência',4,15,8,7],['Palco de bairro',26,12,9,9]], [18.5,21],['#426657','#a7a28b','#dfcfaa'],[building(4,2,9,4,'BIBLIOTECA','gable','#b79a77','door-library'),building(25,3,9,4,'CENTRAL VOICES','arcade','#8da993','door-room-6')]);p['id']='hub';p['purpose']='Uma praça octogonal: a fonte organiza quatro largos ligados por alamedas, com biblioteca ao noroeste e música no lado oposto.'
path(p,[6,6,6,3],[10,8,19,3],[16,8,5,15],[6,14,26,4],[6,18,8,4],[25,16,8,6],[26,7,6,7])
surface(p,[[13,10],[17,8],[23,10],[25,14],[22,18],[16,18],[12,14]],'#b9b297','mosaic')
places(p,{'fountain':[18.5,14],'hub-pix':[19.8,20],'hub-nia':[14,17.7],'hub-student':[29,19],'portal-1':[32,14],'portal-2':[9.8,9.5],'portal-3':[27.5,9],'portal-4':[33,12],'portal-5':[29,22],'portal-6':[10.8,20.5],'guide':[17,22.6],'terminal-hub':[26,22.5],'word-runner':[7,22],'hub-record':[7.7,14.3],'travel-park':[3.6,12.5],'travel-market':[12.5,23],'travel-garden':[31.5,9.5],'travel-beach':[23.5,23],'community-board':[7.5,7.9],'parcel':[7,17.5],'note-01':[11,12],'note-02':[31,17],'history-hub':[24,20.4],'resident-courier':[6.2,18.9],'neighbor-paulo':[29,17.7],'neighbors-pet-4':[30.8,20],'animal-hub-0':[10.5,18.6],'animal-hub-1':[22.6,16.5],'animal-hub-2':[30,7.5],'coast-hub-cat':[8,20.6]})
scene(p,'square-water-left',14,13.5,'furnishings',0,1.9,2);scene(p,'square-water-right',23.5,13.5,'furnishings',0,1.9,1);scene(p,'square-tea',10,17.8,'neighborhood',21,1.2,2)
host(p,'square-news',6,6,7,1.65);scene(p,'square-guitar',29.8,15.5,'cozy',12,1.3);host(p,'furnishings-discovery-hub',3,11.2,5.8,1.3)
for i,x,y,s in [(1,5,16,2.2),(2,3.5,9.6,1.8),(4,24,18.7,1.7),(5,25,21,1.7),(7,12.3,10,1.45),(7,24,14.5,1.4)]:decor(p,'furnishings',i,x,y,s)
decor(p,'scene',8,28,14.1,3,False,{'layer':'ground'});decor(p,'neighborhood',25,2.5,15.5,2.6);decor(p,'neighborhood',25,33.5,16.5,2.5);decor(p,'neighborhood',25,16,2.5,2.3)
anchor(p,'observe-water',20,17.5,'observing',22,3);anchor(p,'mail-sort',6.2,18.9);p['meeting']=[14,19.5];p['progressSpot']=[18.5,9]

p=plan('library',30,22,'Biblioteca · alas e jardim de leitura',[[2,2],[27,2],[29,5],[29,18],[25,21],[5,21],[1,17],[1,5]],[['Acervo e devolução',3,3,12,6],['Estudo em grupo',17,3,10,7],['Leitura silenciosa',3,12,9,7],['Oficina e memória',19,12,8,7]],[14,19],['#4c5b51','#8b7662','#d6c5a2'],holes=[[12,4,4,4]]);p['id']='library';p['purpose']='Biblioteca com duas alas ao redor de um pequeno jardim interno; devolução próxima da entrada do acervo, estudo a leste e leitura silenciosa ao sudoeste.'
path(p,[11,9,7,11],[5,9,21,3]);surface(p,[[2,12],[11,12],[11,20],[4,20],[2,17]],'#687465','rug');surface(p,[[18,4],[27,4],[27,10],[18,10]],'#a89072','rug')
places(p,{'room-librarian':[8,10.5],'room-runner-library':[24,19],'room-bonus-library':[25.5,11.5],'room-terminal-library':[3.2,9.8],'room-exit-library':[14,20],'room-source-library':[24.5,3],'resident-neighbors-abel':[5.3,16.5],'neighbors-pet-0':[4.7,18.8],'library-desk':[7.4,10.8],'work-backup':[20.7,15.3],'work-heritage-voices':[23.8,16.2],'history-library':[17.5,18.5],'resident-archivist':[21.4,11],'resident-amara':[7.7,14.8],'neighbor-aline':[21,8],'resident-ravi':[20.4,17.7],'portrait-machado':[3.8,5.1],'portrait-carolina':[25.4,13.1],'animal-library-0':[5.5,19]})
for r in before['library']['objects']:
    if r['type']=='reading':p['positions'][r['id']]=[6,6]
scene(p,'reading-left',5.8,13.5,'furnishings',9,1.65,0);scene(p,'reading-right',21,6,'furnishings',9,1.65,0)
host(p,'library-returns',10,7,8.7,1.8);host(p,'library-recommend',8,4.8,3,2.3);host(p,'library-catalog',13,19,9,2.3);host(p,'library-culture',14,22.5,17,1.4)
host(p,'library-music-section',8,9,3,2.3);host(p,'library-science-section',8,18,3,2.3);host(p,'library-history-section',8,23,3,2.3);host(p,'heritage-reading-desk',13,19,13,2)
scene(p,'neighborhood-exhibit-50',3.8,6.6,None,None,1.1)['hostPortrait']='portrait-machado';scene(p,'neighborhood-exhibit-51',25.4,14.6,None,None,1.1)['hostPortrait']='portrait-carolina';host(p,'furnishings-discovery-library',11,24.5,16.8,1.35)
for i,x,y,s in [(12,10,5.8,1.45),(15,10.5,13.2,1.6),(13,22.5,5.4,2.1),(10,3,11,1.4)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighbors',4,7.5,15.8,1.3);decor(p,'neighbors',1,3.4,17,1.1);p['meeting']=[16.5,12]
anchor(p,'shelf-check',10,7.8,'working',20,3);anchor(p,'catalog-work',20,11.7,'writing',27,3);anchor(p,'neighbors-abel-work',5.3,16.5,'reading',28,3);anchor(p,'neighbors-abel-pause',7.8,17.3,'waiting',23,1)

p=plan('park',36,30,'Parque das Pontes · trilhas e margens',[[4,2],[19,1],[31,4],[35,11],[33,25],[25,29],[8,28],[1,20],[2,8]],[['Mirante das aves',5,3,9,7],['Lago e ponte',17,7,14,12],['Piquenique sombreado',3,17,10,9],['Campo e desenhos',24,21,8,6]],[17,26.5],['#446c53','#aaa88a','#dbd0a7']);p['id']='park';p['purpose']='Parque de contorno orgânico com lago a leste, uma ponte curta, trilha em circuito, piquenique sob árvores e um mirante separado.'
path(p,[14,3,3,24],[6,10,11,2.5],[4,17,13,3],[16,20,15,3],[28,12,3,12],[9,23,8,3],[16,12,5,1.5],[27,12,4,1.5]);p['pond']={'x':18,'y':6,'w':11,'h':12,'polygon':[[20,6],[26,6],[29,9],[26,12],[26,14],[29,16],[26,18],[21,18],[18,16],[21,14],[21,12],[18,10]],'bridges':[[20,12,7,1.5]]}
places(p,{'park-exit':[17,28],'resident-neighbors-nilo':[6.7,22],'neighbors-pet-2':[9.2,23],'work-interview':[9.7,17.3],'work-field-notes':[27.3,24],'history-park':[23,26.5],'resident-teacher':[9,12.8],'resident-elder':[16.4,14.3],'resident-elisa':[7.5,7.5],'neighbor-nara':[29.8,20.2],'animal-park-0':[10.8,22.5],'animal-park-1':[11.5,14.4],'animal-park-2':[8.6,5.9],'animal-park-3':[23,10],'animal-park-4':[6.3,9.2],'cozy-activity-cozy-activity-sketch':[26,25.5]})
scene(p,'park-reading',9.3,11.2,'furnishings',17,1.6,0);scene(p,'park-lake',16.2,11.5,'furnishings',17,1.65,2);scene(p,'park-picnic',7.7,19,'furnishings',17,1.7,2);host(p,'park-sketch',19,7,4.3,1.9);host(p,'park-field',18,29.5,18,1.65);host(p,'furnishings-discovery-park',20,13,24.5,1.6)
for i,x,y,s in [(16,4.2,19,2.5),(21,5,23.5,1.35),(22,10,20.4,1.6),(23,3,12,1.1)]:decor(p,'furnishings',i,x,y,s)
for x,y in [(3,5),(10,3),(3,16),(10,25),(30,6),(29,26)]:decor(p,'neighborhood',24,x,y,2.6)
decor(p,'neighbors',24,4,21,1.25);decor(p,'cozy',38,6.5,8.5,1,False);p['meeting']=[12.5,19.5];anchor(p,'dog-owner',6.7,22,'observing',24,1);anchor(p,'neighbors-nilo-work',6.7,22,'working',28,3);anchor(p,'neighbors-nilo-pause',9,24,'waiting',24,1)

p=plan('market',42,24,'Feira das Histórias · rua e pátios de ofício',[[4,2],[20,2],[20,4],[36,4],[41,8],[40,20],[34,23],[7,23],[1,18],[1,7]],[['Frutas e pesagem',3,4,9,7],['Tecidos e costura',18,4,11,7],['Tabuleiro de Viviane',5,15,9,6],['Cabelos e adornos',30,10,9,9]],[20,20.5],['#596e55','#b19c7a','#dfcc9e']);p['id']='market';p['purpose']='Feira em uma rua alongada com pátios de ofícios; frutas, tecidos, comida e cabelos têm áreas de preparo próprias, sem quatro bancas idênticas.'
path(p,[3,10,34,4],[12,13,4,8],[20,6,3,15],[28,13,8,7],[6,20,27,2]);surface(p,[[3,5],[11,5],[11,9],[3,9]],'#bdac8d','stone');surface(p,[[30,10],[39,10],[39,18],[30,18]],'#b1a48f','stone')
places(p,{'market-exit':[20,22],'resident-neighbors-yara':[25,7.3],'neighbors-pet-1':[27,9.5],'label-1':[10.7,8.7],'label-2':[22.7,9.7],'label-3':[10.8,19.8],'work-labels':[13.5,8.5],'work-community-mail':[27,20],'work-heritage-contexts':[35.5,18.5],'cozy-book-07':[12.5,17],'culture-book-01':[6.5,20.2],'culture-book-04':[25.7,5.4],'culture-book-05':[33,19.2],'history-market':[31,20.5],'resident-vendor':[7.6,7.5],'resident-viviane':[7.5,17.7],'resident-bisa':[34,13.6],'resident-dandara':[22.5,7.3],'neighbor-enzo':[14,17.7],'animal-market-0':[12.4,19.5],'animal-market-1':[17.8,11.5],'cozy-activity-cozy-activity-craft':[24.7,8.4]})
scene(p,'market-food',7.5,16,'culture',8,2.1);host(p,'market-labels',30,24.8,7.8,2.1);host(p,'market-paper',31,27,18.3,1.5);scene(p,'market-rest',15,15.5,'expanded',11,1.5,1);scene(p,'market-hair',34,12,'culture',3,1.7)
for id,x,y in [('heritage-item-48',31.5,9.5),('heritage-item-50',37,10.5),('heritage-item-51',29,5.8),('heritage-item-52',28.7,8.5)]:scene(p,id,x,y,None,None,1.25)
host(p,'furnishings-discovery-market',25,11.4,14.3,1.5)
for i,x,y,s in [(24,6,5.4,2.35),(26,3.3,7.6,1.6),(27,4.3,15.4,1.5),(28,10,16.8,1.45),(29,9.2,5.7,1.7)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighbors',8,31,14.5,1.3);decor(p,'neighbors',10,19,7,1.25);decor(p,'culture',0,35.2,11,1.25);decor(p,'culture',4,18.6,4.8,1.35);decor(p,'neighborhood',27,2,15,2.5);decor(p,'neighborhood',27,36.5,19,2.8)
anchor(p,'fruit-arrange',7.6,7.5,'working',25,3);anchor(p,'handwash-work',5,18.4,'working',20,3);anchor(p,'braid-work',34,13.6,'working',27,3);anchor(p,'braid-tools',36,13.5,'working',22,3);anchor(p,'sewing-work',22.5,7.3,'working',30,3);anchor(p,'fabric-check',25,7.3,'observing',23,3);anchor(p,'neighbors-yara-work',25,7.3,'working',28,3);anchor(p,'neighbors-yara-pause',25.3,9.5,'waiting',24,1);p['meeting']=[22,13.5]

p=plan('garden',27,33,'Horta Comunitária · canteiros em terraços',[[3,2],[17,2],[17,5],[25,5],[26,18],[24,29],[18,32],[5,31],[1,22],[1,7]],[['Água e transplante',3,4,8,7],['Canteiros norte',12,7,10,9],['Composto e sementes',3,16,8,8],['Viveiro e descanso',14,22,10,7]],[12,29.5],['#4c6f4d','#b59a70','#dfc496']);p['id']='garden';p['purpose']='Horta comprida com terraços em zigue-zague; água no alto, composto a jusante, sementes protegidas e canteiros acessíveis pelo caminho central.'
path(p,[11,5,3,25],[4,9,10,2],[12,14,10,2],[4,20,10,2],[12,26,11,2]);surface(p,[[3,4],[10,4],[10,10],[3,10]],'#a8a388','stone')
places(p,{'garden-exit':[12,31],'resident-neighbors-rute':[7.5,24.5],'neighbors-pet-5':[10,27.5],'bed-1':[6.8,12.2],'bed-2':[18.2,17.2],'bed-3':[7,22.7],'resident-gardener':[14.8,14.5],'resident-maite':[7.5,18.5],'animal-garden-0':[19.5,11.8],'animal-garden-1':[20,25.5]})
scene(p,'garden-seeds',7.5,17,'furnishings',35,1.8);scene(p,'garden-compost',4.5,23,'furnishings',38,1.75);scene(p,'garden-rest',18,27,'neighborhood',13,1.75,0);scene(p,'garden-turns',14.5,7,'neighbors',27,1.2);host(p,'furnishings-discovery-garden',37,22.3,17.8,1.3)
for i,x,y,s in [(32,4.2,25,2),(33,4,5.5,2.2),(34,8,5.5,1.7),(36,16,22.3,2.4),(39,3.2,16,1.6)]:decor(p,'furnishings',i,x,y,s)
for index,x,y in [(0,5.3,10),(1,16.5,15),(2,5.5,20)]:decor(p,'world',1,x,y,3,True,{'bed':index})
decor(p,'world',1,21,25,2.4,True,{'nursery':True});decor(p,'neighborhood',29,20,5.5,2.5);decor(p,'neighborhood',29,3,27.5,2.5);decor(p,'neighbors',28,17.5,8.3,1.65)
anchor(p,'garden-inspect',7.5,12.6,'observing',22,3);anchor(p,'garden-water',18.2,17.8,'watering',24,3);anchor(p,'neighbors-rute-work',7.5,24.5,'working',28,3);anchor(p,'neighbors-rute-pause',17,28.4,'waiting',24,1);anchor(p,'neighbors-rute-seedlings',5.4,26.8,'working',30,3);anchor(p,'neighbors-rute-labels',7.5,24.5,'observing',23,1);p['meeting']=[12.6,22.5]

p=plan('chapter-1',40,25,'Distrito do Ritmo · rua do ensaio',[[2,3],[16,2],[21,4],[36,2],[39,7],[38,21],[31,24],[5,23],[1,16]],[['Palco e público',3,9,12,11],['Ensaios e instrumentos',22,9,13,8],['História e escuta',19,17,15,6]],[18,21.5],['#5d645b','#aa947f','#dbba98'],[building(4,3,9,4,'ESTÚDIO / REHEARSAL','shed','#bd9779','door-room-1-0'),building(28,3,8,4,'PALCO FESTIVAL','canopy','#a7a47c','door-room-1-1')]);p['id']='chapter-1';p['purpose']='Uma rua de música em diagonal liga o palco íntimo ao pátio de ensaio; os ouvintes ocupam bancos voltados aos músicos, e as descobertas ficam na galeria de escuta.'
path(p,[7,7,4,5],[10,9,20,3],[16,10,4,13],[26,7,6,7],[6,19,27,3]);surface(p,[[3,10],[12,10],[15,14],[12,17],[3,17]],'#b89069','wood')
places(p,{'c1_samba':[5.5,10.3],'c1_capoeira':[30.5,15.5],'c1_credit':[23,21.2],'npc-1-0':[7.2,15.3],'npc-1-1':[29,13.5],'station-1':[18,12.2],'boss-1':[35.5,18.5],'exit-1':[18,23],'terminal-1':[4.2,21.1],'sign-1':[14,21],'bonus-1':[24,8],'work-rhythm-workshop':[25.2,13.2],'work-heritage-sounds':[32,12.3],'note-03':[11.5,16.2],'note-04':[24,16.3],'history-chapter-1':[31,22],'resident-percussionist':[9.5,14.8],'resident-atelier-gilberto':[13.5,18.5],'resident-mila':[24.5,18.8],'portrait-tim':[23,4.3],'animal-chapter-1-0':[13.5,21.5],'animal-chapter-1-1':[26,6.5]})
scene(p,'rhythm-tune',9.2,13,'furnishings',50,1.55);scene(p,'rhythm-listen',12.2,16.3,'neighborhood',17,1.7,1);host(p,'rhythm-program',51,22.1,7.5,1.5);scene(p,'rhythm-rehearse',5.5,13.5,'furnishings',48,2.2)
for id,x,y in [('heritage-item-40',23,13.4),('heritage-item-41',31.5,10.5),('heritage-rock-station',28,19.8),('neighborhood-exhibit-48',21,18.3),('neighborhood-exhibit-57',31.5,19.5)]:scene(p,id,x,y,None,None,1.3)
host(p,'furnishings-discovery-chapter-1',55,7,8.8,1.5)
for i,x,y,s in [(49,7,17,1.9),(52,21.5,18.8,1.6),(53,34,10.5,1.9),(54,28,10,1.7)]:decor(p,'furnishings',i,x,y,s)
decor(p,'atelier',17,12,19.8,1.7);decor(p,'neighborhood',26,2.3,18,2.7);decor(p,'neighborhood',26,33,21,2.6);p['meeting']=[16,17.5];anchor(p,'atelier-gilberto-activity-0',13.5,18.5,'listening',25,1);anchor(p,'atelier-gilberto-activity-1',10.8,18.5,'playing',25,1);p['progressSpot']=[18.5,8]

p=plan('room-1',29,17,'Estúdio · cabine, ensaio e técnica',[[1,2],[27,2],[28,6],[28,13],[24,16],[13,16],[13,14],[1,14]],[['Ensaio coletivo',2,4,11,8],['Cabine e gravação',18,3,9,8],['Mesa técnica',13,9,6,5]],[15,14.5],['#514b51','#8b756d','#ceb796'],holes=[[13,3,3,4]]);p['id']='room-1';p['purpose']='Estúdio horizontal em L, com uma cabine de gravação isolada, instrumentos organizados no ensaio e mesa técnica junto ao corredor de saída.'
path(p,[12,7,6,7],[3,12,23,2]);surface(p,[[2,4],[11,4],[11,11],[2,11]],'#7d6862','rug');surface(p,[[18,3],[27,3],[27,10],[18,10]],'#66736c','rug')
places(p,{'room-librarian':[21,10.3],'room-runner-room-1':[24.5,13.5],'room-bonus-room-1':[7,11.5],'room-terminal-room-1':[14.2,12],'room-exit-room-1':[15,15],'room-source-room-1':[25.5,3.6],'book-01':[4,11.5],'book-02':[22.7,12.8],'cozy-book-03':[11.5,10.2],'resident-andre':[7,9.5],'cozy-activity-cozy-activity-music':[15.5,8.3],'portrait-nina':[3.3,3.5]})
scene(p,'studio-tune',6.5,6.5,'furnishings',57,1.75);host(p,'studio-record',59,19.5,7.5,2.4);scene(p,'studio-pause',24.2,11.5,'furnishings',60,1.3,1);host(p,'studio-credit',61,11.3,3,1.55)
for id,x,y in [('heritage-item-42',3,7),('heritage-item-43',9.5,7),('heritage-item-44',20.5,4),('heritage-item-45',24,6.1),('neighborhood-exhibit-49',6,3.5),('neighborhood-exhibit-56',9,3.5)]:scene(p,id,x,y,None,None,1.2)
host(p,'furnishings-discovery-room-1',63,25.5,9.4,1.35);decor(p,'furnishings',56,2,4.5,2);decor(p,'furnishings',58,7.6,6.5,1.4);decor(p,'furnishings',62,22,2.2,1.7,False);p['meeting']=[16.5,10.5]

p=plan('chapter-2',35,29,'Museu Esquecido · pátio de três percursos',[[6,1],[27,1],[34,7],[34,24],[29,28],[6,28],[1,22],[1,9]],[['Acolhimento e guia',10,8,13,6],['Mali',3,17,8,8],['Songhai',13,19,8,7],['Kongo',25,14,8,10]],[17,25.5],['#62715c','#b5a891','#ded0ab'],[building(9,2,15,5,'ARQUIVO / ARCHIVE','portico','#cbb381','door-room-2-0'),building(2,8,7,5,'GALERIA RESTAURADA','tower','#bcb390','door-room-2-1')]);p['id']='chapter-2';p['purpose']='Um pátio de museu com entrada monumental e três percursos de visita distintos, preservando os contextos de Mali, Songhai e Kongo.'
path(p,[14,7,5,19],[6,13,25,3],[7,16,4,10],[9,23,19,3],[27,14,3,12]);surface(p,[[10,8],[24,8],[26,12],[22,16],[12,16],[9,12]],'#c7b999','stone')
places(p,{'c2_mali':[5.5,21],'c2_songhai':[16,22.5],'c2_kongo':[28,20],'npc-2-0':[8.6,18],'npc-2-1':[26,16.7],'station-2':[18.5,16.7],'boss-2':[29.8,10.5],'exit-2':[17,27],'terminal-2':[4,26],'sign-2':[13,25.5],'bonus-2':[25,6.6],'resident-atelier-cecilia':[27.5,23],'work-exhibition':[23.5,18.5],'note-05':[7.6,23.2],'note-06':[18.5,25.5],'culture-book-07':[28.5,24.5],'history-chapter-2':[23,26],'resident-guide':[14,12.7],'resident-jaci':[25.5,21.5],'animal-chapter-2-0':[11.5,13]})
scene(p,'museum-courtyard',13.4,11,'neighborhood',15,1.7,0);host(p,'museum-label',69,24.5,17.4,1.8);host(p,'museum-visit',70,12,8.8,2);scene(p,'museum-culture',28.3,15.3,None,None,1.3)
for id,x,y in [('heritage-item-46',4.3,18.5),('heritage-item-47',15,19.8),('heritage-item-54',8.5,21),('heritage-item-55',29.5,22),('neighborhood-exhibit-40',11,21.5)]:scene(p,id,x,y,None,None,1.4)
host(p,'furnishings-discovery-chapter-2',68,21,9.6,1.8)
for i,x,y,s in [(64,4.2,20,1.4),(65,12,7.2,1.8),(66,13,10.1,2.6),(67,23.5,4.4,1.8),(71,28.7,17.4,1.45)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighborhood',28,2,15,2.5);decor(p,'neighborhood',28,29.6,25,2.1);p['meeting']=[18.5,12.5];anchor(p,'museum-community',25.5,21.5,'reading',26,3);anchor(p,'atelier-cecilia-activity-0',27.5,23,'working',28,1);anchor(p,'atelier-cecilia-activity-1',24.3,24,'observing',22,1);p['progressSpot']=[17,8.5]

p=plan('room-2',25,27,'Arquivo · alas de catalogação e conservação',[[2,2],[22,2],[24,6],[24,15],[17,15],[17,25],[8,25],[8,15],[1,15],[1,5]],[['Catalogação',2,3,9,10],['Conservação',14,3,9,10],['Consulta documentada',9,15,7,9]],[12,23.5],['#635b4d','#968870','#d3c6a1']);p['id']='room-2';p['purpose']='Arquivo em T: catalogação e conservação em alas distintas, ligados a uma área de consulta estreita com documentos e legendas organizados por contexto.'
path(p,[10,3,4,21],[3,12,19,3]);surface(p,[[9,16],[16,16],[16,24],[9,24]],'#766e5e','rug')
places(p,{'room-librarian':[17.8,11.5],'room-runner-room-2':[14.5,22],'room-bonus-room-2':[19,4.4],'room-terminal-room-2':[5,12.5],'room-exit-room-2':[12,24.5],'room-source-room-2':[10.3,18.6],'book-03':[3.8,10.5],'book-04':[19.5,12.5],'cozy-book-05':[10.2,20.8],'culture-book-08':[14.3,18.8],'resident-rui':[6.5,10],'cozy-activity-cozy-activity-caption':[14.4,21.5]})
host(p,'archive-label',73,15.5,7.9,1.55);host(p,'archive-work',77,4.5,7.7,2);scene(p,'archive-pause',14,17,'expanded',12,1.5,1);host(p,'archive-drawer',72,3,3,2.2);scene(p,'archive-clothing',20,6.5,None,None,1.4)
for id,x,y in [('heritage-item-49',4,5.9),('heritage-item-53',7.5,4),('heritage-item-56',14.5,4),('heritage-item-57',20.5,10),('heritage-item-59',9.5,10.5),('heritage-item-60',16.5,13.2),('neighborhood-exhibit-58',9.4,17),('neighborhood-exhibit-59',14.4,15.5),('neighborhood-exhibit-47',11.2,22.7)]:scene(p,id,x,y,None,None,1.15)
host(p,'furnishings-discovery-room-2',76,15.5,11.2,1.5)
for i,x,y,s in [(74,17,8.2,2.2),(75,19,2.5,1.65),(78,14.5,2.4,1.7),(79,4.5,11.1,1.7)]:decor(p,'furnishings',i,x,y,s)
p['meeting']=[11.2,13]

p=plan('chapter-3',33,31,'Gênios Ocultos · pátio de investigação',[[10,1],[23,1],[30,6],[32,15],[29,26],[23,30],[9,30],[2,23],[1,13],[4,5]],[['Demonstração de vento',4,9,10,10],['Sol, chuva e observação',19,8,11,12],['Caderno e comparação',8,20,18,8]],[16,27.5],['#497368','#afb39a','#e3d5ad'],[building(5,3,8,4,'OFICINA / WORKSHOP','workshop','#86aea0','door-room-3-0'),building(21,3,8,4,'OBSERVATÓRIO','observatory','#b5c8a2','door-room-3-1')]);p['id']='chapter-3';p['purpose']='Pátio de ciência arredondado com áreas abertas para experimentar vento, comparar sombras, observar o céu e registrar resultados, sem a mesma disposição de museu ou feira.'
path(p,[14,7,4,22],[6,18,23,3],[6,9,3,12],[25,8,3,14]);surface(p,[[4,10],[12,9],[13,17],[5,18]],'#bbc3a6','stone');surface(p,[[18,21],[25,21],[26,26],[18,27]],'#a5afa0','stone')
places(p,{'c3_johnson':[10.4,12.6],'c3_carolina':[21.5,24],'c3_reboucas':[7.5,22.5],'npc-3-0':[7.3,15.6],'npc-3-1':[23,26.8],'station-3':[16,20.2],'boss-3':[27.5,18.8],'exit-3':[16,29],'terminal-3':[9,27],'sign-3':[20,28],'bonus-3':[20,8.5],'work-experiment':[22.5,14],'note-07':[5,18.8],'note-08':[25.5,11],'history-chapter-3':[11.5,25.5],'resident-technician':[11,17.2],'animal-chapter-3-0':[24,6.5]})
host(p,'science-observe',81,5.5,13,2.6);scene(p,'science-pause',10.8,23.7,'atelier',6,1.6,0);host(p,'science-notebook',83,20,21.2,2.1);scene(p,'neighborhood-exhibit-52',25,22.5,None,None,1.25);host(p,'furnishings-discovery-chapter-3',82,27.5,11.5,1.4)
for i,x,y,s in [(80,18.5,9.3,2),(84,4.5,21,1.8),(85,10,9.5,1.8),(86,21,12.5,1.9),(87,19,25.4,1.7)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighborhood',36,27.5,23.5,2.4);decor(p,'neighborhood',36,4,8.5,2.2);p['meeting']=[16.5,23.5];p['progressSpot']=[16,8.8]

p=plan('room-3',31,20,'Laboratório · duas bancadas e mesa comum',[[3,2],[27,2],[30,6],[30,16],[26,19],[5,19],[1,15],[1,6]],[['Óptica e sensores',3,4,9,10],['Circuitos e medidas',19,4,9,10],['Discussão em equipe',12,11,7,6]],[15,17],['#53766d','#8a9c8b','#d7d0aa'],holes=[[13,3,4,5]]);p['id']='room-3';p['purpose']='Laboratório de alas paralelas, com bancadas técnicas nas laterais e uma mesa comum no meio; os cadernos ficam junto às experiências e os equipamentos não tomam a passagem.'
path(p,[12,8,6,10],[4,14,23,3]);surface(p,[[3,5],[11,5],[11,13],[3,13]],'#a2b2a0','tile');surface(p,[[19,5],[27,5],[27,13],[19,13]],'#8fa796','tile')
places(p,{'room-librarian':[23,12.2],'room-runner-room-3':[26.5,16.3],'room-bonus-room-3':[5,14.8],'room-terminal-room-3':[11,17],'room-exit-room-3':[15,18],'room-source-room-3':[21.5,3.7],'book-05':[6.8,11.5],'book-06':[24.5,14.8],'cozy-book-01':[8.3,16.3],'resident-tomas':[8.3,10],'cozy-activity-cozy-activity-heat':[5.4,14.8],'portrait-katherine':[11.4,4.5]})
host(p,'lab-sensor',88,4,7.7,2.8);host(p,'lab-notes',93,20,8.9,2.2);scene(p,'lab-pause',16,14.7,'furnishings',95,1.3,3);host(p,'lab-team',94,13.5,10.7,2)
scene(p,'neighborhood-exhibit-54',4,4.5,None,None,1.3);scene(p,'neighborhood-exhibit-55',25.8,4.5,None,None,1.3);host(p,'furnishings-discovery-room-3',91,25.3,10.5,1.4)
for i,x,y,s in [(89,21,5.5,2.1),(90,3.4,3,1.7),(92,26.5,7,1.55),(95,7,9.5,1.2)]:decor(p,'furnishings',i,x,y,s)
p['meeting']=[14,16]

p=plan('chapter-4',46,21,'Rede do Viés · avenida da informação',[[5,2],[40,2],[45,6],[45,15],[39,20],[7,20],[1,15],[1,7]],[['Jornal e correções',3,6,12,12],['Ágora de notícias',17,8,12,10],['Oficina e entrevistas',31,6,12,12]],[21.5,17.5],['#5c7563','#b8b5a1','#dfd8bb'],[building(3,2,9,4,'FONTES / SOURCES','shopfront','#92b299','door-room-4-0'),building(33,2,10,4,'SERVIDORES','sawtooth','#a6b1a6','door-room-4-1')]);p['id']='chapter-4';p['purpose']='Uma avenida longa: o quiosque de notícias, a área de correções e a oficina de mídia se distribuem em sequência, com travessias e uma ágora central para conversar.'
path(p,[3,10,40,4],[6,6,4,12],[20,5,4,14],[35,6,4,12]);surface(p,[[17,8],[27,8],[29,13],[25,17],[18,17],[15,13]],'#c4c4ad','mosaic')
places(p,{'c4_racism':[7.5,9],'c4_stereotype':[36.3,14.3],'c4_context':[24.5,15.9],'npc-4-0':[12.5,14.8],'npc-4-1':[33.7,17],'station-4':[21.5,11.5],'boss-4':[41.7,12.5],'exit-4':[21.5,19],'terminal-4':[3.6,15.9],'sign-4':[17,17.7],'bonus-4':[29,7.4],'work-newsroom':[31,9.8],'note-09':[10.4,17.8],'note-10':[39,17.4],'cozy-book-04':[28.2,17.3],'history-chapter-4':[27,9],'resident-student2':[7.7,13.3]})
host(p,'news-kiosk',96,4.5,7.2,2.3);scene(p,'news-discuss',19,15.5,'furnishings',98,1.8,1);host(p,'news-corrections',100,11,7.3,1.8);host(p,'furnishings-discovery-chapter-4',97,25.4,6.5,1.6)
for i,x,y,s in [(99,34,7.5,2.2),(101,31.5,15,1.4),(102,38,7,1.7),(103,24.5,13.5,1.55)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighborhood',35,14.5,4,1.7);decor(p,'neighborhood',35,40,16.8,1.6);p['meeting']=[16.7,13.5];p['progressSpot']=[22,6.5]

p=plan('room-4',23,26,'Redação · da entrevista à revisão',[[3,2],[21,2],[22,8],[22,14],[17,14],[17,24],[3,25],[1,21],[1,6]],[['Entrevista',13,3,8,10],['Edição',3,8,9,9],['Referências e correções',4,18,12,6]],[10.5,22.5],['#676e5c','#a89b7e','#e2cfa8']);p['id']='room-4';p['purpose']='Redação em L vertical, com sala de entrevista no alto, mesa editorial em ferradura no centro e uma linha de revisão até as correções, sem repetir a planta do laboratório.'
path(p,[10,3,3,20],[4,16,11,3]);surface(p,[[3,9],[10,9],[10,15],[3,15]],'#b4a385','rug');surface(p,[[13,4],[21,4],[21,11],[13,11]],'#98a38d','rug')
places(p,{'room-librarian':[8,20.8],'room-runner-room-4':[14.5,22.7],'room-bonus-room-4':[19.4,12],'room-terminal-room-4':[4,21.5],'room-exit-room-4':[10.5,24],'room-source-room-4':[5.8,18.6],'resident-atelier-joel':[16.5,9.6],'book-07':[4.6,15.5],'book-08':[14,18.8],'resident-otavio':[7.8,14]})
host(p,'editor-draft',104,3.5,10.6,3);host(p,'editor-correct',109,6,18.4,1.6);scene(p,'editor-pause',14,20.5,'furnishings',111,1.5,1);host(p,'editor-reference',106,4,3.8,2)
scene(p,'neighborhood-exhibit-61',7.5,7.5,None,None,1.3);host(p,'furnishings-discovery-room-4',108,12.9,17,1.7)
for i,x,y,s in [(105,3,15.4,1.7),(107,15,7,2.1),(110,4,20.4,1.7),(111,15.7,9,1.1)]:decor(p,'furnishings',i,x,y,s)
p['meeting']=[11.2,15.5];anchor(p,'atelier-joel-activity-0',16.5,9.6,'writing',28,3);anchor(p,'atelier-joel-activity-1',16.2,12,'reading',26,3)

p=plan('chapter-5',44,32,'Uma Cidade, Muitas Vozes · campus comunitário',[[8,1],[35,1],[43,8],[43,25],[35,31],[8,31],[1,24],[1,9]],[['Manifestação e escuta',4,7,14,12],['Mural e encontro',5,20,13,9],['Projeto do bairro',22,12,12,14],['Escola e cuidado',32,8,9,20]],[21.5,28.5],['#59775b','#b7b69a','#e4d5ad'],[building(18,2,10,5,'CENTRO COMUNITÁRIO','atrium','#adb789','door-room-5-0'),building(33,3,8,4,'ESCOLA ABERTA','classroom','#b6bb90','door-room-5-1')]);p['id']='chapter-5';p['purpose']='Campus comunitário com largo de manifestação a oeste, mural e convivência ao sul, escola a leste e uma área ampla de propostas e participação acessível.'
path(p,[18,7,6,22],[4,17,34,3],[7,25,28,3],[32,7,5,20],[10,20,5,8]);surface(p,[[4,8],[17,8],[17,18],[4,18]],'#bdbca1','stone');surface(p,[[24,12],[32,12],[35,17],[32,24],[24,24]],'#b9c2a3','mosaic')
places(p,{'c5_indigenous':[8.5,22],'c5_access':[36,19],'c5_participation':[27.5,25.8],'npc-5-0':[25.4,17.8],'npc-5-1':[33.5,26],'station-5':[21.5,16.5],'boss-5':[38,11.5],'exit-5':[21.5,30],'terminal-5':[5,27],'sign-5':[17,27.5],'bonus-5':[29.5,8.5],'work-protest-records':[16.6,18.3],'note-11':[6.5,24.5],'culture-book-03':[36.7,22.8],'protest-book-history':[7,18.6],'history-chapter-5':[30.5,28.4],'resident-jamila':[10.3,25.3],'animal-chapter-5-0':[13,28.5],'animal-chapter-5-1':[31,14]})
scene(p,'community-mural',8,20.4,'furnishings',114,2.2);scene(p,'community-listen',12.5,24.2,'furnishings',116,2.1,0);host(p,'community-proposal',112,25.8,15.3,2.4);host(p,'community-access',117,32.5,21.2,1.5);scene(p,'community-clothing',35.5,17,None,None,1.55)
scene(p,'heritage-item-58',4.5,21.5,None,None,1.4);scene(p,'neighborhood-exhibit-41',15.5,22.7,None,None,1.4);scene(p,'community-protest',12.5,16.8,None,None,1);host(p,'furnishings-discovery-chapter-5',118,28,24.5,1.8)
for i,x,y,s in [(113,5,25,1.75),(115,28.5,19.5,1.9),(119,11,20.5,1.65)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighborhood',30,29,10,2.4);decor(p,'neighborhood',37,36,26,2.1);decor(p,'neighborhood',30,7,5,2.4);p['meeting']=[17,22.5];p['progressSpot']=[22,9]
for o in before['chapter-5']['objects']:
    if o['id'].startswith('resident-protest-'):
        x=o['x']-19+12.5;y=o['y']-8.6+16.8;p['positions'][o['id']]=[x,y]
        olda=next(a for a in before['chapter-5']['design']['anchors'] if a[0]==o['id'][9:]+'-activity')
        anchor(p,olda[0],x,y,olda[3],olda[4],olda[5]);routine(p,o['id'],[olda[0]])

p=plan('room-5',33,24,'Assembleia · roda e participação escrita',[[8,2],[24,2],[31,7],[32,15],[28,22],[19,23],[8,22],[2,16],[1,9]],[['Roda e escuta',8,6,17,12],['Propostas por escrito',3,13,7,8],['Apoio e oficina',25,9,6,10]],[16,21],['#727c61','#b3a889','#e9d8b2']);p['id']='room-5';p['purpose']='Salão em leque, com assentos em arco voltados para a facilitação, maquete em mesa própria e uma alternativa de participação por escrito fora da roda.'
path(p,[13,4,6,18],[4,17,23,3]);surface(p,[[8,5],[24,5],[28,10],[25,18],[9,18],[5,11]],'#c2b58e','mosaic')
places(p,{'room-librarian':[16,7.5],'room-runner-room-5':[27,19.5],'room-bonus-room-5':[25,7.4],'room-terminal-room-5':[5.5,19.4],'room-exit-room-5':[16,22.2],'room-source-room-5':[22,4.5],'book-09':[5.5,15.5],'book-10':[25.5,15.5],'cozy-book-06':[10.5,20],'culture-book-06':[29,12.5],'neighbor-dora':[9.7,15.6],'neighbor-vitor':[23,15.8],'neighbor-luan':[9.8,11.5],'portrait-king':[12,4.3]})
scene(p,'assembly-listen',9,13.7,'furnishings',120,2,2);scene(p,'assembly-quiet',25,17.5,'furnishings',120,1.8,1);host(p,'assembly-note',122,3.4,14,2.3);host(p,'assembly-turn',121,15,5,2);scene(p,'assembly-fashion',28.6,10.8,None,None,1.4);scene(p,'neighborhood-exhibit-53',8,6,None,None,1.25);host(p,'furnishings-discovery-room-5',123,23.5,5,1.4)
for i,x,y,s in [(124,25.2,13.5,2),(125,6,3.5,1.65),(126,26,18.8,1.7),(127,28.5,17.2,1.4),(120,12,16.3,1.75),(120,19,16.3,1.75),(120,22,12.5,1.75)]:decor(p,'furnishings',i,x,y,s)
p['meeting']=[14.5,13]

p=plan('chapter-6',37,34,'Reboot the Story · pátios do arquivo vivo',[[9,1],[28,1],[35,8],[36,17],[32,29],[24,33],[9,32],[2,25],[1,12],[4,5]],[['Catálogo público',5,10,11,10],['Contribuições e memória',22,10,11,11],['Restauração e revisão',9,22,20,9]],[18,30],['#506d60','#aeb09a','#e0d1af'],[building(7,2,13,5,'ARQUIVO CENTRAL','civic','#a9bda4','door-room-6-0'),building(25,5,8,5,'NÚCLEO DO SISTEMA','annex','#97aea9','door-room-6-1')]);p['id']='chapter-6';p['purpose']='Arquivo cívico em pátios escalonados: consulta pública na chegada, memória documentada a leste e revisão humana em uma praça de restauração ao sul.'
path(p,[15,7,5,25],[7,16,24,3],[26,10,4,16],[9,26,22,3]);surface(p,[[4,11],[13,9],[17,13],[14,20],[5,19]],'#bac1a5','stone');surface(p,[[10,23],[27,23],[30,28],[26,31],[10,31],[7,27]],'#b3baa0','mosaic')
places(p,{'c6_dataset':[9.5,14.4],'c6_logic':[27.7,19.5],'c6_review':[22.3,27.8],'npc-6-0':[10.5,19],'npc-6-1':[26,27.8],'station-6':[17.5,20.5],'boss-6':[31.5,24.5],'exit-6':[18,32],'terminal-6':[7,28.8],'sign-6':[18,28.5],'bonus-6':[22,10.5],'resident-atelier-ivana':[13.4,27.8],'work-human-review':[24,24.7],'note-12':[12,22.5],'history-chapter-6':[28,30]})
host(p,'central-catalog',128,6.5,11.4,2.6);host(p,'central-review',132,22.5,23,2.1);scene(p,'central-pause',11,25.3,'furnishings',131,2.1,0);host(p,'furnishings-discovery-chapter-6',130,28.6,15.7,1.55)
for i,x,y,s in [(129,24.5,13,1.8),(133,6,20,1.65),(134,13,12.3,1.8),(135,25,17.5,2.1)]:decor(p,'furnishings',i,x,y,s)
decor(p,'neighborhood',31,3.5,23,1.6);decor(p,'neighborhood',32,29.2,27.3,1.8);decor(p,'neighborhood',31,22,4.7,1.6);p['meeting']=[16,25];anchor(p,'atelier-ivana-activity-0',13.4,27.8,'working',28,3);anchor(p,'atelier-ivana-activity-1',16,27.5,'writing',27,1);p['progressSpot']=[18,10]

p=plan('room-6',35,19,'Catálogo central · revisão e cópias protegidas',[[3,2],[30,2],[34,6],[34,14],[29,18],[5,18],[1,13],[1,6]],[['Consulta e revisão humana',3,4,13,11],['Equipamentos e segurança',21,3,12,11],['Restauro e retorno',15,10,6,6]],[17,16],['#566d66','#99a392','#d9ceb0'],holes=[[18,3,2,5]]);p['id']='room-6';p['purpose']='Sala horizontal com tecnologia organizada na ala leste e mesas de revisão na ala oeste, ligadas por um corredor limpo e uma estação de acompanhamento do restauro.'
path(p,[15,8,6,9],[4,14,27,2.5]);surface(p,[[3,5],[14,5],[14,13],[3,13]],'#afb69f','tile');surface(p,[[22,3],[32,3],[32,13],[22,13]],'#879c92','tile')
places(p,{'room-librarian':[25.5,12],'room-runner-room-6':[30.3,15.2],'room-bonus-room-6':[29,9],'room-terminal-room-6':[4,13.8],'room-exit-room-6':[17,17.2],'room-source-room-6':[11.5,3.8],'book-11':[7.5,11.5],'book-12':[23.5,15.4],'cozy-book-02':[13,14.8],'neighbor-selma':[9.5,12.5],'cozy-activity-cozy-activity-team':[15.6,11.2]})
host(p,'control-catalog',137,5,8,2.7);host(p,'control-backup',136,24,5.4,2.1);host(p,'control-review',143,10,8,2.5);scene(p,'control-pause',19,14.5,'atelier',13,1.8,1);scene(p,'neighborhood-exhibit-62',7.8,4.5,None,None,1.3);host(p,'furnishings-discovery-room-6',142,29.7,11.5,1.55)
for i,x,y,s in [(138,22,2.5,2.1),(139,29,6.4,1.8),(140,15.5,9.2,2),(141,22,10,1.7)]:decor(p,'furnishings',i,x,y,s)
p['meeting']=[17,12.8];p['progressSpot']=[14.4,5]

regional_placements={
 'hub':[(4,4.8,14.5,2.6),(5,28,12.4,3.3)],
 'library':[(6,11,11.4,1.6),(7,5.1,19,1.2),(8,8.5,16.5,1.3)],
 'market':[(0,5.5,4.6,3),(1,6.5,15.1,2.5),(2,21,3.8,3.6),(3,32.7,11.8,2.4)],
 'garden':[(9,5.1,8.7,3.4),(10,2.5,2.5,2.7),(11,20.5,6.7,1.8)],
 'chapter-1':[(12,24.5,8.8,3.5)],'room-1':[(13,17,3.4,2.4)],
 'room-2':[(14,18.2,4.3,1.8),(15,16.5,10.1,1.1)],
 'chapter-3':[(16,19,16,2.5)],'room-3':[(17,17.5,3.3,1.6)],
 'chapter-4':[(18,30,6.8,2.1)],'room-4':[(19,18,4.2,1.9)],
 'chapter-5':[(20,23.5,10,3.7)],'room-5':[(21,14.5,16.5,2)],
 'chapter-6':[(22,22.5,10.4,1.8)],'room-6':[(23,19.6,3.5,1.8)]
}
for id,rows in regional_placements.items():
    for index,x,y,size in rows:
        p=plans[id]
        row=decor(p,'regional',index,x,y,size)
        if id=='market':
            if index==0:
                row[6]['anchorIds']=['fruit-arrange'];row[6]['objectIds']=['resident-vendor']
                p['decor']=[r for r in p['decor'] if not(r[0]=='furnishings' and r[1]==24)]
                decor(p,'furnishings',24,9.2,6.5,1.5)
            elif index==1:
                food=next(s for s in p['scenes'] if s['id']=='market-food')
                food.update(family='regional',prop=1,hostDecor=row[6]['id'],x=7.75,y=17.8,size=2.5)
                row[6]['sceneIds']=['market-food'];row[6]['objectIds']=['resident-viviane']
                p['positions']['resident-viviane']=[6.1,17.5]
            elif index==2:row[6]['anchorIds']=['sewing-work','fabric-check'];row[6]['objectIds']=['resident-dandara']
            elif index==3:
                p['decor']=[r for r in p['decor'] if not(r[0]=='culture' and r[1]==0)]
                row[6]['anchorIds']=['braid-work','braid-tools'];row[6]['objectIds']=['resident-bisa']
                p['positions']['resident-bisa']=[35.4,14.2]

for id,p in plans.items():
    for s in p['scenes']:
        if s['kind']=='seat':s['rotation']=0
    p['objectKinds']={o['id']:o['type'] for o in before[id]['objects']}
    p['routines']={**before[id]['design'].get('routines',{}),**p['routines']}
    for o in before[id]['objects']:
        if o['type']=='cozy' and o.get('scene',{}).get('kind')=='conversation':continue
        if o['type']=='door':
            b=next(b for b in p['buildings'] if b.get('door')==o['id'])
            p['positions'][o['id']]=[b['x']+b['w']/2-.5,b['y']+b['h']+.1]
        elif o['id'] not in p['positions']:
            if o['type']=='cozy':
                s=next((s for s in p['scenes'] if s['id']==o['scene']['id']),None)
                if s:p['positions'][o['id']]=[s['x'],s['y']]
            if o['id'] not in p['positions']:raise ValueError(id+' lacks authored position for '+o['id'])
    for s in p['scenes']:
        p['positions'].pop('cozy-'+id+'-'+s['id'],None)
        if s['kind']=='seat':p['composedScenes'].append({'id':s['id'],'relationship':'assento voltado para '+next((z[0] for z in p['zones'] if z[1]<=s['x']<=z[1]+z[3] and z[2]<=s['y']<=z[2]+z[4]),p['zones'][0][0])})
    for a in before[id]['design'].get('anchors') or []:
        if any(b[0]==a[0] for b in p['anchors']):continue
        owner=next((k for k,tasks in p['routines'].items() if a[0] in tasks and k in p['positions']),None)
        point=p['positions'].get(owner,p['meeting'])
        anchor(p,a[0],point[0],point[1],a[3],a[4],a[5])
    if id=='chapter-1':p['blockedAreas']=[[28,2,8,1]]
    p['floor']='wood' if id in ['library','room-1','room-4'] else 'stone'
    p['furnitureTheme']=id
    p['furnitureGroup']=[a['index'] for a in catalog if a['family']=='furnishings' and a.get('mapTheme')==id]
    p.pop('_propSerial',None);p.pop('objectEdits',None);p.pop('removedObjects',None)

output=root/'js/regional-content.js'
output.write_text("(function(){'use strict';window.V.regionalContent="+json.dumps(plans,ensure_ascii=False,separators=(',',':'))+";})();\n")
(root/'data/regional-layouts.json').write_text(json.dumps(plans,ensure_ascii=False,indent=2))
print(json.dumps({id:[p['width'],p['height'],len(p['positions']),len(p['decor'])] for id,p in plans.items()}))
