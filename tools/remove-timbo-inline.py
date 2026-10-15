#!/usr/bin/env python3
from pathlib import Path
import re
file=Path('Timbo-Speaker/index.html')
src=file.read_text(encoding='utf-8')
for key,filename in [('audioOriginal','audio-original-embedded.mp3'),('audioChoco','audio-choco-embedded.mp3')]:
    pattern=r'(<script id="'+key+r'" type="text/plain">)data:audio/mpeg;base64,[A-Za-z0-9+/=]+(</script>)'
    src,n=re.subn(pattern,r'\1/private-media/timbo-speaker/audio/'+filename+r'\2',src)
    if n!=1: raise SystemExit('Missing embedded media '+key)
file.write_text(src,encoding='utf-8')
print('Inline audio removed; new HTML size:',file.stat().st_size)
