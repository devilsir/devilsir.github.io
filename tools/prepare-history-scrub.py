#!/usr/bin/env python3
from pathlib import Path
import re
target=Path('.git/portfolio-sensitive-replacements.txt')
target.write_text('regex:data:audio/mpeg;base64,[A-Za-z0-9+/=]{1000,}==>PRIVATE_AUDIO_REDACTED\n',encoding='utf-8')
print("Replacement rule created (original audio values are never printed).")
