from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/ui/renewed'
OUT.mkdir(parents=True,exist_ok=True)
icons={
 'inventory':'<path d="M10 13V9a6 6 0 0 1 12 0v4M7 12h18l2 16H5z"/><path d="M10 21h12v7H10zM12 13v4m8-4v4"/>',
 'journal':'<path d="M7 4h17v24H7z"/><path d="M11 4v24m3-17h6m-6 5h6m-6 5h4M5 9h4M5 15h4M5 21h4"/>',
 'notebook':'<path d="M4 6q6-2 12 2 6-4 12-2v20q-6-2-12 2-6-4-12-2zM16 8v20M8 12h4m-4 5h4m8-5h4m-4 5h4"/>',
 'book':'<path d="M4 6q6-2 12 2 6-4 12-2v20q-6-2-12 2-6-4-12-2zM16 8v20M8 12h4m8 0h4"/>',
 'map':'<path d="m3 7 8-3 10 4 8-3v21l-8 3-10-4-8 3zM11 4v21m10-17v21"/><path d="M6 18q6-8 11-2t9-3" stroke-dasharray="2 3"/>',
 'compass':'<circle cx="16" cy="16" r="12"/><path d="m21 9-3 10-8 4 4-10zM16 2v3m0 22v3M2 16h3m22 0h3"/>',
 'pix':'<path d="M6 10h20v15H6zM16 5v5m-4 18h8M3 14v6m26-6v6"/><circle cx="12" cy="16" r="1.5"/><circle cx="21" cy="16" r="1.5"/><path d="M11 21h10"/><circle cx="16" cy="4" r="2"/>',
 'archive':'<path d="M4 10h24v18H4zM3 5h26v5H3zM12 16h8v5h-8z"/>',
 'settings':'<path d="M4 8h24M4 16h24M4 24h24"/><rect x="9" y="5" width="5" height="6" rx="1"/><rect x="20" y="13" width="5" height="6" rx="1"/><rect x="7" y="21" width="5" height="6" rx="1"/>',
 'sound':'<path d="M4 12h6l8-7v22l-8-7H4zM22 11q5 5 0 10m3-14q8 9 0 18"/>',
 'teacher':'<path d="M5 5h22v16H5zM16 21v7m-6 0h12M10 10h12m-12 5h8"/>',
 'scene':'<path d="m4 14 12-9 12 9M7 12v16h18V12m-13 16V18h8v10M4 4h6m-6 0v6m24 18h-5"/>',
 'voice':'<rect x="11" y="3" width="10" height="17" rx="5"/><path d="M7 15v2a9 9 0 0 0 18 0v-2m-9 11v4m-6 0h12"/>',
 'challenges':'<path d="M10 4h12v10a6 6 0 0 1-12 0zM10 7H4v5q0 6 8 6m10-11h6v5q0 6-8 6M16 20v7m-6 2h12"/>',
 'leaf':'<path d="M27 4Q2 3 5 22q16 11 22-18zM6 26 23 9m-9 9-1-7m5 3 7-1"/>',
 'profile':'<circle cx="16" cy="10" r="6"/><path d="M5 29v-3a11 11 0 0 1 22 0v3"/>',
 'pin':'<path d="M25 13q0 7-9 16Q7 20 7 13a9 9 0 0 1 18 0z"/><circle cx="16" cy="13" r="3"/>',
 'science':'<path d="M11 3h10m-8 0v10L5 26q-1 3 3 3h16q4 0 3-3l-8-13V3M9 21h14"/><circle cx="14" cy="24" r="1"/>',
 'music':'<path d="M12 23V7l15-3v16M12 12l15-3"/><ellipse cx="8" cy="25" rx="5" ry="3"/><ellipse cx="23" cy="23" rx="5" ry="3"/>',
}
for name,paths in icons.items():
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><g fill="#d8c391" fill-opacity=".34" stroke="#254f43" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+paths+'</g></svg>'
    (OUT/(name+'.svg')).write_text(svg,encoding='utf-8')
meat='''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="roast" x2=".8" y2="1"><stop stop-color="#dfab69"/><stop offset=".5" stop-color="#b87340"/><stop offset="1" stop-color="#864e32"/></linearGradient></defs><path d="m21 24 7 6 1 4q4 3 6-1 5-2 1-6l-4-1-6-7" fill="#f6e7be" stroke="#493e2b" stroke-width="1.6"/><path d="M8 8c6-6 20-4 23 4 3 7-6 15-12 17C8 34 0 16 8 8Z" fill="url(#roast)" stroke="#493e2b" stroke-width="1.7"/><path d="M9 14q3-6 11-5m-9 12 2 3m6-13 2 3m1 6 2-3" fill="none" stroke="#f5ca84" stroke-width="2.5" stroke-linecap="round"/></svg>'''
(OUT/'care-meat.svg').write_text(meat,encoding='utf-8')
print('Created',len(icons)+1,'SVG icons')
