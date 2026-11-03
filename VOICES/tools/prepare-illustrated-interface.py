"""Extract the ImageGen menu artwork into optically balanced RGBA icon files."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\PICHAU\.codex\generated_images\01a19e75-9150-74c3-abc1-4e8376c85e90')
TARGET = ROOT/'assets/ui/illustrated'
TARGET.mkdir(parents=True, exist_ok=True)
SHEETS = [
    ('exec-df77eade-f558-4174-9a23-a4008bae8222.png',
     'inventory journal objectives notebook heritage map homes challenges pix archive community leaf compass scene teacher voice'.split(),4),
    ('exec-4343dc32-8fa4-490d-84a2-83b1645dcc66.png',
     'settings sound pause resume save export import exit help expand search history science biology music profile'.split(),4),
    ('exec-cedba2f0-38c4-40b9-aefb-d34a9f264c5c.png',
     'coins historio care-meat care-water care-sleep market pin paper'.split(),2),
]
manifest = {'generator':'imagegen built-in', 'size':128, 'icons':{}}
for filename, names, rows in SHEETS:
    source = Image.open(SOURCE/filename).convert('RGBA')
    for index, name in enumerate(names):
        col, row = index%4, index//4
        frame = source.crop((round(col*source.width/4), round(row*source.height/rows),
                             round((col+1)*source.width/4), round((row+1)*source.height/rows)))
        # Source images already carry alpha; trimming is only atlas extraction.
        box = frame.getchannel('A').point(lambda a:255 if a>32 else 0).getbbox()
        assert box, name
        frame = frame.crop(box)
        frame.thumbnail((112,112), Image.Resampling.LANCZOS)
        icon = Image.new('RGBA',(128,128))
        icon.alpha_composite(frame,((128-frame.width)//2,(128-frame.height)//2))
        icon.save(TARGET/(name+'.webp'),lossless=True)
        assert icon.getpixel((0,0))[3]==0
        manifest['icons'][name]={'path':'assets/ui/illustrated/'+name+'.webp','source':filename,'cell':index}
hero = Image.open(SOURCE/'exec-0893d21b-73d7-4159-8340-9ee873a96b83.png').convert('RGB')
hero.save(TARGET/'pause-vignette.webp',quality=91)
manifest['pauseIllustration']='assets/ui/illustrated/pause-vignette.webp'
(TARGET/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
print('Saved',len(manifest['icons']),'transparent icons and the pause illustration.')
