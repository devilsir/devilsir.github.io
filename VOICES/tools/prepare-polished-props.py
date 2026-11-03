"""Pack generated sprite sheets into regular game atlases; preserve RGBA."""
from pathlib import Path
from PIL import Image
from collections import deque
ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\PICHAU\.codex\generated_images\01a19e75-9150-74c3-abc1-4e8376c85e90')
def sprite_box(frame):
    # Locate the primary sprite inside its cell. Narrow fragments of the next
    # row must not be packed as part of this frame. Keep the original RGBA.
    alpha = frame.getchannel('A')
    pixels = alpha.load()
    seen = set()
    largest = []
    for y in range(frame.height):
        for x in range(frame.width):
            if (x, y) in seen or pixels[x, y] < 24:
                continue
            component = []
            queue = deque([(x, y)])
            seen.add((x, y))
            while queue:
                xx, yy = queue.popleft()
                component.append((xx, yy))
                for nx, ny in ((xx-1, yy), (xx+1, yy), (xx, yy-1), (xx, yy+1)):
                    if 0 <= nx < frame.width and 0 <= ny < frame.height and (nx, ny) not in seen and pixels[nx, ny] >= 24:
                        seen.add((nx, ny))
                        queue.append((nx, ny))
            if len(component) > len(largest):
                largest = component
    if not largest:
        return frame
    xs, ys = zip(*largest)
    return frame.crop((max(0, min(xs)-1), max(0, min(ys)-1), min(frame.width, max(xs)+2), min(frame.height, max(ys)+2)))
for source, name, cols in [
    ('exec-9909bedd-19c4-4465-9855-9a8d9a4c0e91.png', 'props-polished', 12),
    ('exec-b5835137-dcb1-4053-8091-cf864887899d.png', 'world-props-polished', 8),
]:
    image = Image.open(SOURCE / source).convert('RGBA')
    atlas = Image.new('RGBA', (cols * 128, 4 * 128))
    for row in range(4):
        for col in range(cols):
            frame = image.crop((round(col*image.width/cols), round(row*image.height/4), round((col+1)*image.width/cols), round((row+1)*image.height/4)))
            frame = sprite_box(frame)
            frame.thumbnail((120, 120), Image.Resampling.LANCZOS)
            atlas.alpha_composite(frame, (col*128+(128-frame.width)//2, row*128+128-frame.height-4))
    target = ROOT / 'assets' / 'tilesets' / (name+'.webp')
    atlas.save(target, lossless=True)
    print(target.name, atlas.size)
