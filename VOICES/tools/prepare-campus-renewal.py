from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(r'C:\Users\PICHAU\.codex\generated_images\01a19e75-9150-74c3-abc1-4e8376c85e90')
for name,source,rows,size in [
 ('campus-props','exec-a4f2e850-8a6e-419e-9773-d5ad653083f0.png',4,192),
 ('campus-activities','exec-2c9953ab-1c68-43f7-93a8-8212eb0de55b.png',6,128),
 ('cerrado-landscape','exec-5b519fc2-4053-4f92-a5e9-d41b4e779b34.png',3,192),
]:
    image=Image.open(SOURCE/source).convert('RGBA')
    atlas=Image.new('RGBA',(4*size,rows*size))
    for row in range(rows):
        for col in range(4):
            frame=image.crop((round(col*image.width/4),round(row*image.height/rows),round((col+1)*image.width/4),round((row+1)*image.height/rows)))
            frame=frame.resize((size-8,size-8),Image.Resampling.LANCZOS)
            atlas.alpha_composite(frame,(col*size+4,row*size+4))
    target=ROOT/'assets'/'expansion'/(name+'.webp')
    atlas.save(target,lossless=True)
    print(target.name,atlas.size)
