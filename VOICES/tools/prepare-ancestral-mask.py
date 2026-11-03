from pathlib import Path
from PIL import Image
import json

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/adventure/historiograph-mask-source.png'
ROWS=['front','left','right','pulse','speaking','curious','surprised','happy']
image=Image.open(SOURCE).convert('RGBA')
frames=[]
for row in range(len(ROWS)):
    for col in range(4):
        frames.append(image.crop((round(col*image.width/4),round(row*image.height/len(ROWS)),
                                  round((col+1)*image.width/4),round((row+1)*image.height/len(ROWS)))))
# A common crop preserves animation scale and the mask's center in all poses.
boxes=[f.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox() for f in frames]
# Leave original antialiasing and glow intact, including the soft alpha fringe.
box=(max(0,min(b[0] for b in boxes)-4),max(0,min(b[1] for b in boxes)-4),
     min(frames[0].width,max(b[2] for b in boxes)+4),min(frames[0].height,max(b[3] for b in boxes)+4))
atlas=Image.new('RGBA',(768,192*len(ROWS)))
for i,frame in enumerate(frames):
    frame=frame.crop(box)
    frame.thumbnail((168,168),Image.Resampling.LANCZOS)
    atlas.alpha_composite(frame,(i%4*192+(192-frame.width)//2,i//4*192+(192-frame.height)//2))
target=ROOT/'assets/adventure'
atlas.save(target/'historiograph-mask-atlas.webp',lossless=True)
portrait=atlas.crop((0,0,192,192)).resize((384,384),Image.Resampling.LANCZOS)
portrait.save(target/'historiograph-mask.webp',lossless=True)
expressions=Image.new('RGBA',(384,96))
for index,(row,col) in enumerate([(0,0),(4,1),(5,0),(7,1)]):
    expressions.alpha_composite(atlas.crop((col*192,row*192,(col+1)*192,(row+1)*192)).resize((96,96),Image.Resampling.LANCZOS),(index*96,0))
expressions.save(target/'historiograph-mask-portrait.webp',lossless=True)
portrait.resize((128,128),Image.Resampling.LANCZOS).save(ROOT/'assets/ui/illustrated/historio-mask.webp',lossless=True)
(target/'historiograph-mask-manifest.json').write_text(json.dumps({'file':'assets/adventure/historiograph-mask-atlas.webp','columns':4,'rows':ROWS,'cell':192,'frames':32,'portrait':'assets/adventure/historiograph-mask.webp','expressions':'assets/adventure/historiograph-mask-portrait.webp','portraitExpressions':['neutral','speaking','curious','happy'],'icon':'assets/ui/illustrated/historio-mask.webp','source':SOURCE.name,'reference':'User-provided feathered fantasy mask; original fictional game companion','generation':'assets/adventure/historiograph-mask-generation.json'},indent=2,ensure_ascii=False),encoding='utf8')
print('Saved 32 animation frames, four dialogue expressions, portrait and UI icon.')
