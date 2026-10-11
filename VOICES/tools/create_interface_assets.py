from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1] / 'assets' / 'ui' / 'interface'
ROOT.mkdir(parents=True, exist_ok=True)
INK, PAPER, TEAL, GOLD, CORAL, GREEN = '#253e38', '#f6e9ce', '#83cabb', '#e3b765', '#c97768', '#8caf7c'


def rect(x, y, w, h, color):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>'


def path(points, color):
    return f'<path d="{points}" fill="{color}"/>'


def svg(name, body, width=32, height=32):
    (ROOT / f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" shape-rendering="crispEdges">{body}</svg>')


icons = {}
icons['voice'] = ''.join(rect(x, 16-h/2, 3, h, c) for x, h, c in [(3, 8, GOLD), (9, 18, TEAL), (15, 26, PAPER), (21, 18, TEAL), (27, 8, GOLD)])
icons['journal'] = rect(5, 3, 22, 26, INK) + rect(8, 4, 18, 24, CORAL) + rect(11, 7, 12, 9, PAPER) + rect(14, 10, 6, 2, INK) + rect(11, 20, 12, 2, GOLD) + rect(22, 23, 3, 8, TEAL) + ''.join(rect(3, y, 6, 2, GOLD) for y in [7, 13, 19, 25])
icons['notebook'] = rect(5, 3, 22, 26, INK) + rect(8, 4, 18, 24, GREEN) + rect(11, 7, 12, 8, PAPER) + rect(13, 9, 8, 2, INK) + rect(14, 11, 6, 2, INK) + rect(23, 24, 3, 7, CORAL) + ''.join(rect(3, y, 6, 2, GOLD) for y in [7, 13, 19, 25])
icons['book'] = path('M2 5H13V7H19V5H30V27H19V29H13V27H2Z', INK) + rect(4, 7, 9, 18, PAPER) + rect(19, 7, 9, 18, PAPER) + rect(14, 9, 4, 17, GOLD) + ''.join(rect(x, y, 5, 1, '#a99169') for x in [6, 21] for y in [11, 15, 19, 23])
icons['inventory'] = rect(10, 2, 12, 5, INK) + rect(13, 3, 6, 3, PAPER) + path('M7 6H25V9H28V28H25V30H7V28H4V9H7Z', INK) + rect(7, 8, 18, 19, GOLD) + rect(7, 17, 18, 9, '#b47e4f') + rect(10, 18, 12, 7, '#d9a968') + rect(14, 12, 4, 5, TEAL) + rect(4, 11, 2, 12, CORAL) + rect(26, 11, 2, 12, CORAL)
icons['map'] = path('M2 7L11 3L21 7L30 3V25L21 29L11 25L2 29Z', INK) + path('M4 8L10 5V23L4 26Z', PAPER) + path('M12 5L20 8V26L12 23Z', '#b7c7a1') + path('M22 8L28 5V24L22 27Z', PAPER) + rect(6, 12, 8, 2, GOLD) + rect(12, 12, 2, 8, GOLD) + rect(14, 18, 11, 2, GOLD) + rect(21, 11, 6, 6, CORAL) + rect(23, 13, 2, 2, PAPER) + rect(23, 17, 2, 5, CORAL)
icons['archive'] = rect(3, 4, 26, 25, INK) + rect(5, 6, 22, 21, '#b88455') + ''.join(rect(6, y, 20, 5, PAPER) + rect(13, y+1, 6, 2, INK) for y in [7, 14, 21])
icons['pix'] = rect(10, 1, 2, 4, GOLD) + rect(8, 5, 18, 3, INK) + rect(4, 8, 24, 17, INK) + rect(6, 9, 20, 14, TEAL) + rect(8, 11, 16, 8, '#2b5960') + rect(10, 13, 4, 3, PAPER) + rect(18, 13, 4, 3, PAPER) + rect(13, 21, 6, 2, PAPER) + rect(7, 25, 5, 4, GOLD) + rect(20, 25, 5, 4, GOLD)
icons['leaf'] = path('M8 18H4V11H8V7H15V12H18V3H27V7H30V14H27V18H21V22H17V30H14V22H11V20H8Z', INK) + path('M8 16H6V12H9V9H13V13H16V20H14V18H10V16Z', GREEN) + path('M19 6H25V9H28V13H24V16H20V20H17V13H19Z', GREEN) + rect(14, 20, 3, 8, '#8e704b')
icons['community'] = rect(3, 6, 7, 7, '#9c674c') + rect(22, 6, 7, 7, '#663e32') + rect(12, 3, 8, 9, '#be8660') + rect(3, 14, 7, 11, CORAL) + rect(22, 14, 7, 11, GREEN) + rect(11, 13, 10, 15, TEAL) + rect(12, 1, 8, 3, INK) + rect(2, 4, 9, 3, INK) + rect(21, 4, 9, 3, INK) + rect(9, 23, 14, 3, PAPER)
icons['settings'] = path('M12 2H20V6H24V9H29V22H24V26H20V30H12V26H8V22H3V9H8V6H12Z', INK) + path('M13 5H19V9H24V12H26V19H22V23H19V27H13V23H9V19H6V12H10V9H13Z', GOLD) + rect(11, 11, 10, 10, INK) + rect(14, 14, 4, 4, PAPER)
icons['teacher'] = rect(2, 4, 28, 21, '#906844') + rect(4, 6, 24, 17, INK) + rect(7, 9, 10, 2, PAPER) + rect(7, 13, 16, 2, PAPER) + rect(7, 17, 9, 2, TEAL) + rect(8, 25, 3, 5, GOLD) + rect(22, 25, 3, 5, GOLD) + rect(23, 20, 4, 2, CORAL)
icons['music'] = rect(12, 4, 17, 4, INK) + rect(12, 8, 4, 17, INK) + rect(25, 8, 4, 13, INK) + rect(5, 22, 11, 6, GOLD) + rect(18, 18, 11, 6, CORAL) + rect(14, 5, 13, 2, TEAL)
icons['science'] = rect(8, 7, 19, 19, INK) + rect(11, 10, 13, 13, TEAL) + rect(14, 13, 7, 7, PAPER) + rect(16, 15, 3, 3, CORAL)
icons['science'] += ''.join(rect(6, y, 4, 2, GOLD) + rect(25, y, 5, 2, GOLD) for y in [11, 16, 21]) + ''.join(rect(x, 4, 2, 5, GOLD) + rect(x, 24, 2, 5, GOLD) for x in [12, 17, 22]) + rect(1, 6, 3, 20, PAPER) + rect(1, 17, 3, 9, CORAL)
icons['biology'] = ''.join(rect(5+(i%2)*17, 3+i*4, 5, 3, TEAL if i%2 else CORAL) + rect(10, 4+i*4, 12, 1, GOLD) for i in range(7))
icons['art'] = rect(4, 3, 25, 22, INK) + rect(6, 5, 21, 18, PAPER) + rect(9, 8, 5, 5, GOLD) + path('M7 21V18H10V15H13V17H16V13H20V17H24V21Z', GREEN) + rect(13, 25, 3, 6, '#94633f') + rect(23, 24, 2, 7, CORAL)
icons['history'] = rect(6, 4, 23, 24, INK) + rect(4, 2, 22, 24, '#d5bb8f') + rect(6, 4, 18, 20, PAPER) + rect(9, 7, 12, 2, '#967e5c') + rect(9, 12, 10, 1, '#967e5c') + rect(9, 16, 12, 1, '#967e5c') + rect(9, 20, 7, 1, '#967e5c') + rect(22, 18, 6, 6, CORAL) + rect(24, 24, 2, 6, CORAL)
icons['market'] = rect(4, 14, 24, 15, '#ad8054') + rect(6, 17, 20, 10, PAPER) + rect(1, 3, 30, 11, INK) + ''.join(rect(x, 5, 5, 7, GOLD if (x//5)%2 else CORAL) for x in [3, 8, 13, 18, 23]) + rect(10, 21, 12, 2, '#ac7650') + rect(12, 18, 4, 3, GREEN) + rect(17, 18, 3, 3, GOLD)
icons['media'] = rect(3, 4, 26, 23, INK) + rect(5, 6, 22, 19, PAPER) + rect(8, 9, 16, 3, CORAL) + rect(8, 15, 7, 7, TEAL) + rect(18, 15, 6, 1, '#967e5c') + rect(18, 18, 6, 1, '#967e5c') + rect(18, 21, 6, 1, '#967e5c')
icons['compass'] = path('M14 1H18V6H23V9H27V14H31V18H27V23H23V27H18V31H14V27H9V23H5V18H1V14H5V9H9V6H14Z', INK) + path('M14 7H18V10H23V14H26V18H23V22H18V25H14V22H9V18H6V14H9V10H14Z', PAPER) + path('M16 8L22 21L16 18L10 21Z', CORAL) + rect(15, 15, 2, 3, INK)
icons['expand'] = ''.join(rect(x, y, 9, 3, PAPER) + rect(x if x == 3 else x+6, y if y == 3 else y-6, 3, 9, PAPER) for x, y in [(3, 3), (20, 3), (3, 26), (20, 26)])
icons['pause'] = rect(8, 5, 6, 22, PAPER) + rect(18, 5, 6, 22, PAPER)
icons['sound'] = path('M3 12H8L16 5V27L8 20H3Z', TEAL) + rect(21, 9, 3, 14, GOLD) + rect(26, 6, 3, 20, PAPER)
icons['search'] = rect(5, 3, 15, 3, INK) + rect(3, 6, 3, 13, INK) + rect(6, 19, 14, 3, INK) + rect(20, 6, 3, 13, INK) + rect(7, 7, 12, 11, TEAL) + path('M20 19H24V22H27V25H30V29H26V26H23V23H20Z', GOLD)
icons['check'] = path('M3 15H8V20H12V24H16V20H20V16H24V12H28V7H24V11H20V15H16V19H12V15H8V11H3Z', GREEN)
icons['pin'] = path('M10 2H22V5H26V17H23V21H20V25H18V30H14V25H12V21H9V17H6V5H10Z', INK) + rect(10, 6, 12, 11, CORAL) + rect(13, 8, 6, 6, PAPER)
for name, body in icons.items():
    svg(name, body)

themes = {'music': '#794d59', 'science': '#39786f', 'biology': '#587b65', 'art': '#ac714c', 'history': '#8b7050', 'leaf': '#617b51', 'market': '#b07052', 'media': '#596786', 'community': '#597872', 'voice': '#426760'}
for name, color in themes.items():
    body = rect(9, 5, 109, 150, '#253e38') + rect(14, 7, 101, 144, color) + rect(14, 7, 7, 144, '#00000025') + rect(28, 20, 73, 9, PAPER) + rect(33, 24, 63, 1, GOLD)
    body += rect(28, 41, 73, 70, '#f6e9ce') + f'<g transform="translate(40 51) scale(1.5)">{icons[name]}</g>'
    body += rect(29, 123, 71, 2, PAPER) + rect(43, 130, 43, 2, GOLD) + rect(29, 140, 71, 1, '#ffffff35') + rect(98, 149, 8, 11, CORAL)
    svg('cover-' + name, body, 128, 160)
    note = rect(16, 10, 99, 143, '#253e3820') + path('M11 6H94L111 23V148H11Z', PAPER) + path('M94 6V23H111Z', '#cebc97')
    note += rect(18, 29, 86, 2, '#ccb998') + f'<g transform="translate(43 44) scale(1.3)">{icons[name]}</g>'
    note += ''.join(rect(26, y, 67 if y != 127 else 44, 2, '#baaa85') for y in [101, 114, 127]) + rect(30, 3, 4, 25, '#8b9982') + rect(32, 3, 12, 3, '#8b9982') + rect(41, 5, 3, 15, '#8b9982')
    svg('note-' + name, note, 128, 160)

svg('binding', ''.join(rect(3, y+2, 24, 7, '#b99b6a') + rect(1, y, 24, 4, '#ead5a8') + rect(22, y+3, 5, 6, INK) for y in [10, 42, 74, 106]), 32, 128)
svg('paper', rect(0, 0, 48, 48, '#f6ecd6') + rect(0, 47, 48, 1, '#ccb99845') + rect(11, 8, 2, 1, '#bcac8e20') + rect(35, 31, 2, 1, '#bcac8e20'), 48, 48)
(ROOT / 'manifest.json').write_text(json.dumps({'name': 'VOICES · Interface de arquivo vivo', 'version': '1.3', 'origin': 'Ilustrações SVG originais do projeto, construídas com formas em uma grade de pixels.', 'icons': list(icons), 'covers': list(themes), 'notes': list(themes), 'patterns': ['binding', 'paper'], 'external_assets': []}, ensure_ascii=False, indent=2))
print(f'{len(icons)} ícones, {len(themes)} capas, {len(themes)} notas e 2 padrões SVG originais.')
