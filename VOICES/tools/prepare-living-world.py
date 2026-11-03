"""Pack ImageGen originals into runtime atlases; preserve their actual alpha."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\PICHAU\.codex\generated_images\01a19e75-9150-74c3-abc1-4e8376c85e90')
FILES = {
    'cerrado-fauna': ('exec-e0801a9e-3e89-452e-828d-73bfdf944ad8.png', 4, 4, 160),
    'savanna-fauna': ('exec-89d87124-66ed-472e-a7b3-5326fbdd6b79.png', 4, 4, 160),
    'savanna-landscape': ('exec-24039cca-dc13-488c-aac2-cf5fd99efad5.png', 4, 3, 192),
    'cerrado-understory': ('exec-31e35f2d-216c-4b4f-95fb-a44b3fbb0be6.png', 4, 3, 192),
    'place-npcs': ('exec-b32d3384-ab55-4acd-a9b2-971d52c567ed.png', 4, 8, 160),
    'town-animals': ('exec-08eb6cbc-d80a-4116-8454-35f46b68c5db.png', 4, 6, 128),
}

def frames(source, cols, rows):
    im = Image.open(SOURCE/source).convert('RGBA')
    for row in range(rows):
        for col in range(cols):
            yield im.crop((round(col*im.width/cols), round(row*im.height/rows),
                           round((col+1)*im.width/cols), round((row+1)*im.height/rows)))

def pack(source, cols, rows, size, trim=False):
    atlas = Image.new('RGBA', (cols*size, rows*size))
    for i, frame in enumerate(frames(source, cols, rows)):
        if trim:
            box = frame.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
            if box:
                frame = frame.crop(box)
        frame.thumbnail((size-12, size-12), Image.Resampling.LANCZOS)
        atlas.alpha_composite(frame, (i%cols*size+(size-frame.width)//2,
                                     i//cols*size+size-6-frame.height))
    return atlas

def pack_people(source):
    cells = list(frames(source, 4, 8))
    atlas = Image.new('RGBA', (640, 1280))
    for row in range(8):
        boxes = [f.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
                 for f in cells[row*4:row*4+4]]
        box = (min(b[0] for b in boxes), min(b[1] for b in boxes),
               max(b[2] for b in boxes), max(b[3] for b in boxes))
        for col in range(4):
            frame = cells[row*4+col].crop(box)
            frame.thumbnail((148,148), Image.Resampling.LANCZOS)
            atlas.alpha_composite(frame, (col*160+(160-frame.width)//2,
                                         row*160+154-frame.height))
    return atlas

manifest = {}
for name, (source, cols, rows, size) in FILES.items():
    # Animation frames retain their common source canvas and foot baseline.
    atlas = pack_people(source) if name == 'place-npcs' else pack(source, cols, rows, size)
    target = ROOT/'assets'/('nature' if name.endswith('-fauna') else 'expansion')/(name+'.webp')
    atlas.save(target, lossless=True)
    alpha = atlas.getchannel('A')
    assert alpha.getextrema()[0] == 0, f'{name} lacks transparency'
    manifest[name] = dict(path=str(target.relative_to(ROOT)).replace('\\','/'), source=source,
                          columns=cols, rows=rows, cell=size)
    print(name, atlas.size, 'alpha', alpha.getextrema())

# Two generated reading-order sheets become the existing stable 48-object ID order.
atlas = Image.new('RGBA', (8*128, 6*128))
for part, source in enumerate(['exec-880d08e9-d2c2-4b75-bff1-186ad63ec37f.png',
                                'exec-f8a56048-27c9-4b61-9892-300528cd809a.png']):
    packed = pack(source, 4, 6, 128, trim=True)
    for i in range(24):
        frame = packed.crop((i%4*128, i//4*128, (i%4+1)*128, (i//4+1)*128))
        index = part*24+i
        atlas.alpha_composite(frame, (index%8*128, index//8*128))
atlas.save(ROOT/'assets/tilesets/cozy-props-polished.webp', lossless=True)
hero = Image.open(SOURCE/'exec-7c2db780-6521-48e7-ac9e-b95a73c76f37.png').convert('RGB')
target = ROOT/'assets/ui/menu'
target.mkdir(parents=True, exist_ok=True)
hero.save(target/'world-journey.webp', quality=90)
(ROOT/'assets/expansion/living-world-manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('cozy-props-polished', atlas.size, 'menu', hero.size)
