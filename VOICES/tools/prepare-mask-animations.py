"""Package generated 4 x 8 masks with the same registration as the originals."""
from pathlib import Path
from PIL import Image
import argparse
import json
import hashlib
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'assets/adventure/mask-styles'
MODELS = ['plumagem', 'coroa-solar', 'totem', 'sol-e-lua', 'felino',
          'leque', 'chifres', 'hibisco', 'mosaico', 'caveira']
ROWS = ['front', 'left', 'right', 'pulse', 'speaking', 'curious', 'surprised', 'happy']
CELL = 192


def clean_fragments(frame):
    # Extraction only: remove tiny disconnected pieces at cell edges, which
    # belong to a neighboring sprite. Earrings and bead clusters remain intact.
    alpha = frame.getchannel('A')
    data = list(alpha.tobytes())
    seen = bytearray(len(data))
    for start, value in enumerate(data):
        if not value or seen[start]:
            continue
        component = [start]
        seen[start] = 1
        for at in component:
            x, y = at % 224, at // 224
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                xx, yy = x + dx, y + dy
                index = yy * 224 + xx
                if 0 <= xx < 224 and 0 <= yy < 224 and not seen[index] and data[index]:
                    seen[index] = 1
                    component.append(index)
        if len(component) < 12 and any(at // 224 < 20 or at // 224 >= 204 for at in component):
            for at in component:
                data[at] = 0
    alpha.putdata(data)
    frame.putalpha(alpha)
    return frame


def pack(model):
    source = TARGET / f'{model}-animation-source-v2.png'
    if not source.exists():
        source = TARGET / f'{model}-animation-source.png'
    image = Image.open(source).convert('RGBA')
    image.putalpha(image.getchannel('A').point(lambda a: 0 if a <= 8 else a))
    # Normalize fractional source cells before computing one shared crop.
    frames = [image.crop((round(col * image.width / 4), round(row * image.height / 8),
                          round((col + 1) * image.width / 4), round((row + 1) * image.height / 8)))
              .resize((224, 224), Image.Resampling.NEAREST)
              for row in range(8) for col in range(4)]
    frames = [clean_fragments(frame) for frame in frames]
    boxes = [frame.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox() for frame in frames]
    assert all(boxes), f'{model}: an animation cell is empty'
    box = (max(0, min(b[0] for b in boxes) - 3), max(0, min(b[1] for b in boxes) - 3),
           min(224, max(b[2] for b in boxes) + 3), min(224, max(b[3] for b in boxes) + 3))
    registration = json.loads((TARGET / 'registration.json').read_text(encoding='utf8'))['models'][model]
    assert registration['source'] == source.name
    assert registration['sha256'] == hashlib.sha256(source.read_bytes()).hexdigest(), f'{model}: update facial anchors for the new source'
    assert len(registration['offsets']) == 32
    atlas = Image.new('RGBA', (4 * CELL, 8 * CELL))
    for index, frame in enumerate(frames):
        frame = frame.crop(box)
        frame.thumbnail((168, 168), Image.Resampling.NEAREST)
        tile = Image.new('RGBA', (CELL, CELL))
        tile.alpha_composite(frame, ((CELL - frame.width) // 2, (CELL - frame.height) // 2))
        dx, dy = registration['offsets'][index]
        bounds = tile.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
        assert min(bounds[0] + dx, bounds[1] + dy) >= 2 and max(bounds[2] + dx, bounds[3] + dy) <= CELL - 2, f'{model}: aligned sprite would be clipped'
        # Translate only: retain the common scale, pixel art and facial changes.
        # A fixed forehead/nose anchor avoids centering on moving eyelids, jaw,
        # feathers or the changing overall silhouette.
        aligned = Image.new('RGBA', (CELL, CELL))
        aligned.alpha_composite(tile, (dx, dy))
        atlas.alpha_composite(aligned, (index % 4 * CELL, index // 4 * CELL))
    atlas.save(TARGET / f'{model}-atlas.webp', lossless=True)
    metadata = {'file': f'assets/adventure/mask-styles/{model}-atlas.webp', 'model': model,
                'player': 2, 'columns': 4, 'rows': ROWS, 'cell': CELL, 'frames': 32,
                'source': source.name, 'generation': f'{model}-generation.json',
                'style': 'pixel art', 'animation': 'drawn frame by frame',
                'registration': 'fixed facial landmark; common scale; integer translation only',
                'registrationFile': 'registration.json', 'anchor': registration['anchor'],
                'palettes': ['original', 'turquesa', 'violeta', 'rubi']}
    if model == 'plumagem':
        metadata['revision'] = 'plumagem-animation-fix-generation.json'
    (TARGET / f'{model}-manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(f'{model}: 32 transparent painted frames, 768 x 1536')
    return atlas


def previews(atlases):
    review = ROOT / '.qa/review'
    review.mkdir(parents=True, exist_ok=True)
    # One model per row; representative drawn faces across the existing states.
    contact = Image.new('RGBA', (10 * CELL, len(MODELS) * CELL), '#243a32')
    poses = [(0, 0), (0, 2), (1, 0), (2, 0), (3, 2), (4, 1), (4, 2), (5, 1), (6, 1), (7, 2)]
    for model_index, model in enumerate(MODELS):
        for pose_index, (row, col) in enumerate(poses):
            contact.alpha_composite(atlases[model].crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL)),
                                    (pose_index * CELL, model_index * CELL))
    contact.convert('RGB').save(review / 'mask-animations-contact.png')
    sequence = [(0, col) for col in [0, 0, 0, 1, 2, 3, 0]] + [(row, col) for row in range(1, 8) for col in range(4)]
    frames = []
    for row, col in sequence:
        frame = Image.new('RGBA', (5 * CELL, 2 * CELL), '#243a32')
        for index, model in enumerate(MODELS):
            frame.alpha_composite(atlases[model].crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL)),
                                  (index % 5 * CELL, index // 5 * CELL))
        frames.append(frame.convert('RGB'))
    frames[0].save(review / 'mask-animations-preview.gif', save_all=True, append_images=frames[1:], duration=180, loop=0, disposal=2)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', choices=MODELS + ['all'], default='all')
    args = parser.parse_args()
    atlases = {model: pack(model) for model in MODELS if args.model in ('all', model)}
    if args.model == 'all':
        # Neutral thumbnails and animated sprites now use the same artwork.
        gallery = Image.new('RGBA', (5 * CELL, 2 * CELL))
        for index, model in enumerate(MODELS):
            gallery.alpha_composite(atlases[model].crop((0, 0, CELL, CELL)), (index % 5 * CELL, index // 5 * CELL))
        gallery.save(TARGET / 'gallery.webp', lossless=True)
        gallery_manifest = json.loads((TARGET / 'manifest.json').read_text(encoding='utf8'))
        gallery_manifest.update({'thumbnailSource': 'front/open frame of each animated atlas',
                                 'animationManifest': 'assets/adventure/mask-styles/animations.json'})
        (TARGET / 'manifest.json').write_text(json.dumps(gallery_manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
        manifest = {'models': MODELS, 'columns': 4, 'rows': ROWS, 'cell': CELL,
                    'framesPerModel': 32, 'totalFrames': 320, 'player': 2,
                    'palettes': ['original', 'turquesa', 'violeta', 'rubi'],
                    'tool': 'image_gen built-in',
                    'atlases': [f'assets/adventure/mask-styles/{m}-atlas.webp' for m in MODELS],
                    'prompts': [f'assets/adventure/mask-styles/{m}-generation.json' for m in MODELS] + ['assets/adventure/mask-styles/plumagem-animation-fix-generation.json']}
        (TARGET / 'animations.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
        previews(atlases)
    subprocess.run([sys.executable, str(ROOT / 'tools/prepare-mask-palettes.py')], check=True)
