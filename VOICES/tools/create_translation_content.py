import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'data/translation-review.json').read_text())
payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
(root / 'js/translation-content.js').write_text(
    "(function(){'use strict';window.V.translationContent=" + payload + ";})();\n")
