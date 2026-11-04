"""Pack the ten transparent reference masks; recolors are cached by the game."""
from pathlib import Path
from PIL import Image
import json

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'assets/adventure/mask-styles'
MODELS = ['plumagem', 'coroa-solar', 'totem', 'sol-e-lua', 'felino',
          'leque', 'chifres', 'hibisco', 'mosaico', 'caveira']
# The extracted sheet has slightly uneven gutters. Use explicit sprite bounds
# so a neighboring crown or feather cannot leak into the next model.
BOUNDS = [(16, 8, 312, 492), (330, 64, 626, 484), (642, 4, 920, 512),
          (926, 54, 1236, 470), (1250, 54, 1530, 496),
          (8, 520, 320, 980), (328, 540, 624, 980), (626, 536, 898, 988),
          (904, 526, 1214, 980), (1220, 508, 1534, 990)]


def pack():
    source = Image.open(TARGET / 'source.png').convert('RGBA')
    # Match the existing mask pipeline's removal of near-transparent edge noise.
    source.putalpha(source.getchannel('A').point(lambda a: 0 if a <= 8 else a))
    sheet = Image.new('RGBA', (960, 384))
    for index, name in enumerate(MODELS):
        col, row = index % 5, index // 5
        frame = source.crop(BOUNDS[index])
        box = frame.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox()
        assert box, f'Missing mask: {name}'
        frame = frame.crop(box)
        frame.thumbnail((168, 168), Image.Resampling.NEAREST)
        sheet.alpha_composite(frame, (col * 192 + (192 - frame.width) // 2,
                                      row * 192 + (192 - frame.height) // 2))
    animated = all((TARGET / f'{name}-atlas.webp').exists() for name in MODELS)
    if animated:
        for index, name in enumerate(MODELS):
            frame = Image.open(TARGET / f'{name}-atlas.webp').convert('RGBA').crop((0, 0, 192, 192))
            sheet.paste(frame, (index % 5 * 192, index // 5 * 192))
    sheet.save(TARGET / 'gallery.webp', lossless=True)
    metadata = {'file': 'assets/adventure/mask-styles/gallery.webp', 'columns': 5,
                'rows': 2, 'cell': 192, 'models': MODELS,
                'palettes': {'original': 0, 'turquesa': 140, 'violeta': 250, 'rubi': 325},
                'player': 2, 'source': 'source.png',
                'reference': 'User-provided ten-mask reference, 8deb8f89-51d0-42e2-b2f8-57dd1d636802.png',
                'tool': 'Built-in image_gen; transparent background extraction',
                'prompt': 'Use case: background-extraction. Asset type: transparent pixel-art game sprite sheet for VOICES. Edit target: the supplied image of TEN masks arranged in TWO rows of FIVE. Remove ONLY the flat black background surrounding all ten separate masks, making it truly transparent alpha. Preserve all ten designs, colors, pixel-art shading, small earrings, feathers, leaves, teeth and dark interior facial features. Keep the same order, full shapes with no cropping, and a regular two-row five-column grid, each mask centered in its own equal-size cell with ample transparent margins and gaps; do not let any shapes cross cell boundaries. Do not add text, borders, new masks or decorations. The existing black eye sockets and internal dark details must remain dark and opaque; only outside background becomes transparent. Exact reference artwork preservation is the priority.'}
    if animated:
        metadata.update({'thumbnailSource': 'front/open frame of each animated atlas',
                         'animationManifest': 'assets/adventure/mask-styles/animations.json'})
    (TARGET / 'manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print('Packed ten transparent masks in one 960 x 384 WebP; four runtime palettes each.')


if __name__ == '__main__':
    pack()
