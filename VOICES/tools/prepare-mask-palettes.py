"""Bake the game's hue variants so file:// never needs canvas pixel access."""
from pathlib import Path
from PIL import Image
import json
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / 'assets/adventure/mask-styles'
PALETTES = {'original': 0, 'turquesa': 140, 'violeta': 250, 'rubi': 325}


def recolor(image, hue):
    if not hue:
        return image.copy()
    data = np.asarray(image).copy()
    rgb = data[:, :, :3].astype(np.float64) / 255
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    high, low = rgb.max(axis=2), rgb.min(axis=2)
    delta = high - low
    divisor = np.where(delta > 0, delta, 1)
    phase = np.where(high == r, (g - b) / divisor + np.where(g < b, 6, 0),
                     np.where(high == g, (b - r) / divisor + 2, (r - g) / divisor + 4))
    phase = (phase + hue / 60) % 6
    x = delta * (1 - np.abs(phase % 2 - 1))
    zero = np.zeros_like(delta)
    colors = [(delta, x, zero), (x, delta, zero), (zero, delta, x),
              (zero, x, delta), (x, zero, delta), (delta, zero, x)]
    rotated = np.zeros_like(rgb)
    for sector, channels in enumerate(colors):
        selected = (phase >= sector) & (phase < sector + 1)
        for channel in range(3):
            rotated[:, :, channel][selected] = (channels[channel] + low)[selected]
    changed = (data[:, :, 3] > 0) & (delta >= .025)
    data[:, :, :3][changed] = np.clip(np.floor(rotated[changed] * 255 + .5), 0, 255).astype(np.uint8)
    return Image.fromarray(data)


def pack():
    models = json.loads((TARGET / 'animations.json').read_text(encoding='utf8'))['models']
    portraits = TARGET / 'portraits'
    portraits.mkdir(exist_ok=True)
    files = []
    for model in models:
        source = Image.open(TARGET / f'{model}-atlas.webp').convert('RGBA')
        alpha = source.getchannel('A').tobytes()
        for palette, hue in PALETTES.items():
            image = recolor(source, hue)
            assert image.getchannel('A').tobytes() == alpha
            atlas = f'{model}-atlas.webp' if palette == 'original' else f'{model}-{palette}-atlas.webp'
            if hue:
                image.save(TARGET / atlas, lossless=True)
            portrait = f'portraits/{model}-{palette}.webp'
            image.crop((0, 0, 192, 192)).save(TARGET / portrait, lossless=True)
            files.append({'model': model, 'palette': palette,
                          'atlas': 'assets/adventure/mask-styles/' + atlas,
                          'portrait': 'assets/adventure/mask-styles/' + portrait})
        print(f'{model}: four file-safe animated palettes and portraits', flush=True)
    (TARGET / 'palettes.json').write_text(json.dumps({'cell': 192, 'frames': 32, 'palettes': PALETTES,
                                                    'runtimePixelAccess': False, 'files': files},
                                                   ensure_ascii=False, indent=2) + '\n', encoding='utf8')


if __name__ == '__main__':
    pack()
