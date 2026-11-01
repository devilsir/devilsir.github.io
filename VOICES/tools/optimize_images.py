"""Build smaller WebP delivery copies without changing sprite dimensions or alpha.

Original artwork stays in place. Only strictly smaller outputs enter the manifest.
Run from VOICES: python tools/optimize_images.py
"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
OUTPUT = ASSETS / 'optimized'


def optimize(path):
    relative = path.relative_to(ROOT).as_posix()
    output = OUTPUT / path.relative_to(ASSETS).with_suffix('.webp')
    with Image.open(path) as source:
        source.load()
        if getattr(source, 'n_frames', 1) != 1:
            return None
        rgba = source.convert('RGBA')
        rgb = rgba.convert('RGB')
        # Quantization keeps the crisp pixel boundaries; alpha is copied exactly.
        palette = rgb.quantize(colors=256, method=Image.Quantize.MEDIANCUT,
                               dither=Image.Dither.NONE).convert('RGB')
        palette.putalpha(rgba.getchannel('A'))
        error = ImageStat.Stat(ImageChops.difference(rgb, palette.convert('RGB')),
                              rgba.getchannel('A')).rms
        # Detailed gradients use the unquantized lossless source if necessary.
        image = palette if max(error) <= 5.5 else rgba
        encoded = BytesIO()
        image.save(encoded, 'WEBP', lossless=True, method=6, exact=True)
        data = encoded.getvalue()
        if len(data) >= path.stat().st_size * .94:
            return None
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(data)
        with Image.open(output) as check:
            assert check.size == source.size, relative
            assert ImageChops.difference(check.convert('RGBA').getchannel('A'),
                                         rgba.getchannel('A')).getbbox() is None, relative
        return {'source': relative, 'target': output.relative_to(ROOT).as_posix(),
                'before': path.stat().st_size, 'after': len(data),
                'width': source.width, 'height': source.height,
                'max_channel_rmse': round(max(error), 3)}


def main():
    # A PNG already routed to WebP does not need a second delivery copy.
    candidates = [p for p in ASSETS.rglob('*')
                  if p.is_file() and OUTPUT not in p.parents
                  and p.suffix.lower() in ('.png', '.webp')
                  and p.stat().st_size >= 48 * 1024
                  and not (p.suffix.lower() == '.png' and p.with_suffix('.webp').exists())]
    records = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        for i, result in enumerate(pool.map(optimize, candidates), 1):
            if result:
                records.append(result)
            if i % 20 == 0:
                print(f'Processed {i}/{len(candidates)} images', flush=True)
    files = {r['source']: r['target'] for r in records}
    script = "(function(){'use strict';const F=window.V.ImageFormats,optimized=" + json.dumps(files, ensure_ascii=False, separators=(',', ':')) + ";const original={...F.files},canonical=F.canonical.bind(F),reverse=Object.fromEntries(Object.entries(optimized).map(([a,b])=>[b,a]));for(const [a,b]of Object.entries(original))if(optimized[b])F.files[a]=optimized[b];Object.assign(F.files,optimized);F.canonical=key=>canonical(reverse[key]||key);F.optimized=optimized;})();\n"
    (ROOT / 'js' / 'image-delivery-data.js').write_text(script, encoding='utf-8')
    before = sum(r['before'] for r in records)
    after = sum(r['after'] for r in records)
    report = {'images': len(records), 'before_bytes': before,
              'after_bytes': after, 'saved_percent': round((1-after/before)*100, 1)
              if before else 0, 'files': records}
    (ROOT / 'data' / 'image-optimization-report.json').write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k != 'files'}), flush=True)


if __name__ == '__main__':
    main()
