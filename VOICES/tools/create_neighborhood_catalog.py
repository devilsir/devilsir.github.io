from pathlib import Path
import base64
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'assets/tilesets/neighborhood-manifest.json').read_text())
assets = [dict(item, family='neighborhood', solid=bool(item['solidFootprint'])) for item in manifest['props']]
sources = {family: 'data:image/png;base64,' + base64.b64encode((root / ('assets/tilesets/' + family + '-props.png')).read_bytes()).decode() for family in ['scene', 'expanded', 'neighborhood']}
output = "(function(){'use strict';const V=window.V;V.neighborhoodAssets=" + json.dumps(assets, ensure_ascii=False, separators=(',', ':')) + ';V.sceneAssets.push(...V.neighborhoodAssets);V.materialSources=' + json.dumps(sources, separators=(',', ':')) + ';})();\n'
(root / 'js/neighborhood-assets.js').write_text(output)
