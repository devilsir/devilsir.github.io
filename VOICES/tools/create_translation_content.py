from generated_module import write_module
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'data/translation-review.json').read_text(encoding='utf8'))
payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
write_module(root / 'js/translation-content.js', 
    "(function(){'use strict';window.V.translationContent=" + payload + ";})();\n")
