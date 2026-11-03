from pathlib import Path
from PIL import Image
import argparse
import json

ROOT=Path(__file__).resolve().parents[1]
ROWS=['front','left','right','pulse','speaking','curious','surprised','happy']


def pack(player):
    stem='historiograph-mask'+('-p2' if player==2 else '')
    source=ROOT/'assets/adventure'/f'{stem}-source.png'
    image=Image.open(source).convert('RGBA')
    image.putalpha(image.getchannel('A').point(lambda a:0 if a<=8 else a))
    frames=[]
    for row in range(len(ROWS)):
        for col in range(4):
            frames.append(image.crop((round(col*image.width/4),round(row*image.height/len(ROWS)),
                                      round((col+1)*image.width/4),round((row+1)*image.height/len(ROWS)))))
    boxes=[f.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox() for f in frames]
    assert all(boxes), 'Every animation cell must contain a mask'
    # A common crop preserves scale and registration across all expressions.
    box=(max(0,min(b[0] for b in boxes)-4),max(0,min(b[1] for b in boxes)-4),
         min(frames[0].width,max(b[2] for b in boxes)+4),min(frames[0].height,max(b[3] for b in boxes)+4))
    atlas=Image.new('RGBA',(768,192*len(ROWS)))
    for i,frame in enumerate(frames):
        frame=frame.crop(box)
        frame.thumbnail((168,168),Image.Resampling.NEAREST)
        atlas.alpha_composite(frame,(i%4*192+(192-frame.width)//2,i//4*192+(192-frame.height)//2))
    target=ROOT/'assets/adventure'
    atlas.save(target/f'{stem}-atlas.webp',lossless=True)
    portrait=atlas.crop((0,0,192,192)).resize((384,384),Image.Resampling.NEAREST)
    portrait.save(target/f'{stem}.webp',lossless=True)
    expressions=Image.new('RGBA',(384,96))
    for index,(row,col) in enumerate([(0,0),(4,1),(5,0),(7,1)]):
        expressions.alpha_composite(atlas.crop((col*192,row*192,(col+1)*192,(row+1)*192)).resize((96,96),Image.Resampling.NEAREST),(index*96,0))
    expressions.save(target/f'{stem}-portrait.webp',lossless=True)
    icon='historio-mask'+('-p2' if player==2 else '')+'.webp'
    portrait.resize((128,128),Image.Resampling.NEAREST).save(ROOT/'assets/ui/illustrated'/icon,lossless=True)
    metadata={'file':f'assets/adventure/{stem}-atlas.webp','columns':4,'rows':ROWS,'cell':192,'frames':32,
              'player':player,'style':'pixel art','portrait':f'assets/adventure/{stem}.webp',
              'expressions':f'assets/adventure/{stem}-portrait.webp','portraitExpressions':['neutral','speaking','curious','happy'],
              'icon':'assets/ui/illustrated/'+icon,'source':source.name,
              'reference':'Original fictional feathered memory-mask companion',
              'generation':f'assets/adventure/{stem}-generation.json'}
    (target/f'{stem}-manifest.json').write_text(json.dumps(metadata,indent=2,ensure_ascii=False),encoding='utf8')
    print(f'Player {player}: 32 frames, portrait, dialogue expressions and menu icon.')


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--player',choices=['1','2','all'],default='all')
    selection=parser.parse_args().player
    for player in ([int(selection)] if selection!='all' else [1,2]):
        if (ROOT/'assets/adventure'/('historiograph-mask'+('-p2' if player==2 else '')+'-source.png')).exists():
            pack(player)
