"""Pack imagegen artwork into the game's existing frame contracts."""
from pathlib import Path
from PIL import Image
import json
import statistics

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'assets/characters/renewed'
GENERATION = TARGET / 'generation.json'
SIZE = 128


def pack(source, columns, rows):
    image = Image.open(source).convert('RGBA')
    # Remove only invisible generation noise; preserve the actual edge alpha.
    image.putalpha(image.getchannel('A').point(lambda a: 0 if a <= 8 else a))
    frames = []
    for row in range(rows):
        for col in range(columns):
            frame = image.crop((round(col*image.width/columns), round(row*image.height/rows),
                                round((col+1)*image.width/columns), round((row+1)*image.height/rows)))
            box = frame.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
            if not box:
                raise ValueError(f'Empty frame {source.name}: {row}, {col}')
            frames.append((frame, box))
    # Shared scale keeps breathing, walking and blinking from changing size.
    scale = min(112/max(b[2]-b[0] for _, b in frames), 114/max(b[3]-b[1] for _, b in frames))
    atlas = Image.new('RGBA', (columns*SIZE, rows*SIZE))
    rig_rows = []
    for row in range(rows):
        anchors, bounds = [], []
        for col in range(columns):
            frame, box = frames[row*columns+col]
            crop = frame.crop(box)
            crop = crop.resize((max(1, round(crop.width*scale)), max(1, round(crop.height*scale))), Image.Resampling.LANCZOS)
            x, y = (SIZE-crop.width)//2, 122-crop.height
            atlas.alpha_composite(crop, (col*SIZE+x, row*SIZE+y))
            bounds.append([x, y, x+crop.width, y+crop.height])
            # Feet are anchored independently of raised arms, instruments and FX.
            alpha = crop.getchannel('A')
            feet = []
            for yy in range(max(0, crop.height-5), crop.height):
                for xx in range(crop.width):
                    if alpha.getpixel((xx, yy)) > 100:
                        feet.append(x+xx)
            anchors.append([round(statistics.median(feet), 3) if feet else SIZE/2, 122])
        rig_rows.append({'anchors': anchors, 'bounds': bounds})
    # Rows with large FX retain the body scale of the first (neutral) row.
    unit = statistics.median(b[3]-b[1] for b in rig_rows[0]['bounds'])
    for row in rig_rows:
        row['unitHeight'] = unit
    return atlas, {'cell': SIZE, 'normalHeight': .859375, 'rows': rig_rows}


def save_base(id, source):
    atlas, _ = pack(source, 4, 6)
    atlas.save(ROOT/f'assets/characters/{id}.png')
    atlas.save(ROOT/f'assets/optimized/characters/{id}.webp', lossless=True)
    atlas.save(TARGET/f'{id}-base.webp', lossless=True)
    # Portraits come from the new face artwork, not from the old pixel heads.
    raw = Image.open(source).convert('RGBA')
    raw.putalpha(raw.getchannel('A').point(lambda a: 0 if a <= 8 else a))
    portraits = Image.new('RGBA', (384, 96))
    for expression, (r, c) in enumerate([(0, 0), (5, 0), (4, 1), (5, 2)]):
        frame = raw.crop((round(c*raw.width/4), round(r*raw.height/6), round((c+1)*raw.width/4), round((r+1)*raw.height/6)))
        b = frame.getchannel('A').point(lambda a: 255 if a > 64 else 0).getbbox()
        # Hair, face and the top of the jacket fill the portrait without a tile.
        face = frame.crop((b[0], b[1], b[2], min(b[3], b[1]+round((b[3]-b[1])*.68))))
        face.thumbnail((90, 94), Image.Resampling.LANCZOS)
        portraits.alpha_composite(face, (expression*96+(96-face.width)//2, 96-face.height))
    portraits.save(ROOT/f'assets/characters/{id}-portrait.png')
    portraits.save(ROOT/f'assets/optimized/characters/{id}-portrait.webp', lossless=True)
    portraits.save(TARGET/f'{id}-portrait.webp', lossless=True)


def main():
    data = json.loads(GENERATION.read_text(encoding='utf-8-sig'))
    rigs, saved = {}, []
    for job in data['jobs']:
        if job.get('kind') == 'mask' or not job.get('source'):
            continue
        id, kind = job['id'], job['kind']
        original = Path(job['source'])
        source = TARGET / 'source' / f'{id}-{kind}.png'
        if not source.exists() or source.read_bytes() != original.read_bytes():
            source.write_bytes(original.read_bytes())
        if kind == 'base':
            save_base(id, source)
            saved.extend([f'assets/characters/{id}.png', f'assets/characters/{id}-portrait.png'])
            continue
        atlas, rig = pack(source, job['cols'], job['rows'])
        if kind == 'music':
            # The last two generated rows are the separate complementary drums.
            atlas.crop((0, 14*SIZE, atlas.width, 16*SIZE)).save(ROOT/f'assets/homestead/{id}-percussion.webp', lossless=True)
            rigs[f'percussion-{id}'] = {**rig, 'rows': rig['rows'][14:]}
            saved.append(f'assets/homestead/{id}-percussion.webp')
            # Match Homestead.data.instruments, which starts with the guitars.
            order = [3, 2, 7, 4, 5, 8, 0, 1, 6, 9, 10, 11, 12, 13]
            ordered = Image.new('RGBA', (atlas.width, 14*SIZE))
            for index, row in enumerate(order):
                ordered.alpha_composite(atlas.crop((0, row*SIZE, atlas.width, (row+1)*SIZE)), (0, index*SIZE))
            atlas = ordered
            rig = {**rig, 'rows': [rig['rows'][row] for row in order]}
        file = job['target']
        atlas.save(ROOT/file, lossless=True)
        atlas.save(TARGET/f'{id}-{kind}.webp', lossless=True)
        optimized = ROOT/'assets/optimized'/Path(file).relative_to('assets')
        if optimized.exists():
            atlas.save(optimized, lossless=True)
        rigs[f'{kind}-{id}'] = rig
        saved.append(file)
    manifest = {'version': '20261103-playable2', 'mode': data['mode'],
                'generation': 'assets/characters/renewed/generation.json',
                'mask': {'manifest': 'assets/adventure/historiograph-mask-manifest.json',
                         'generation': 'assets/adventure/historiograph-mask-generation.json',
                         'player2Manifest': 'assets/adventure/historiograph-mask-p2-manifest.json',
                         'player2Generation': 'assets/adventure/historiograph-mask-p2-generation.json'},
                'files': saved, 'layouts': rigs}
    (TARGET/'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    (ROOT/'js/playable-art-data.js').write_text('window.V.PlayableArtData='+json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))+';\n', encoding='utf8')
    # Pixel Lab must show the same frame size and registration as the game.
    for name in ['sprite-editor-data.js', 'city-sprite-data.js', 'homestead-sprite-data.js']:
        file = ROOT/'js'/name
        text = file.read_text(encoding='utf8')
        start = text.index('[')
        items, length = json.JSONDecoder().raw_decode(text[start:])
        for item in items:
            path = item.get('path', '')
            for id in ['nia', 'leo', 'taina', 'sol']:
                if path == f'assets/characters/{id}.png':
                    item.update(width=512, height=768, frameWidth=128, frameHeight=128)
                    item.pop('sourceBounds', None)
                for kind, folder in [('actions', 'city'), ('motion', 'city'), ('daily', 'homestead'), ('music', 'homestead'), ('percussion', 'homestead')]:
                    key = f'{kind}-{id}'
                    if path == f'assets/{folder}/{id}-{kind}.webp' and key in rigs:
                        item.update(width=(8 if kind in ['actions', 'motion'] else 6)*SIZE,
                                    height=len(rigs[key]['rows'])*SIZE, frameWidth=SIZE, frameHeight=SIZE)
                        if 'rig' in item:
                            item['rig'] = rigs[key]
        file.write_text(text[:start]+json.dumps(items, ensure_ascii=False, separators=(',', ':'))+text[start+length:], encoding='utf8')
    print(f'Packed {len(saved)} files and {len(rigs)} animation contracts.')


if __name__ == '__main__':
    main()
