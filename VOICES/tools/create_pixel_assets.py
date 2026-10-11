#!/usr/bin/env python3
"""Rebuild VOICES' original, deterministic, native pixel-art asset collection.

No downloaded images, fonts, generative API calls or resampling other than integer
nearest-neighbour portrait/boss enlargement. Run with Python 3 and Pillow.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import json
import random

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
P = {
    "ink": "#111729", "outline": "#1b2039", "navy": "#263250",
    "navylight": "#465777", "violetdark": "#463575", "violet": "#7860be",
    "violetlight": "#b498f0", "cyan": "#59d9dd", "cyandark": "#278c9d",
    "cyanlight": "#b8f4ea", "amber": "#efb74e", "amberdark": "#a66c32",
    "amberlight": "#ffdd88", "coral": "#ed7978", "coraldark": "#ab4d65",
    "corallight": "#ffc0a0", "white": "#eeeada", "paper": "#d8dccf",
    "green": "#58aa83", "greendark": "#2f6b69", "greenlight": "#9cd3a0",
    "brown": "#805a49", "brownlight": "#b99068", "greylight": "#afb5ba",
    "grey": "#768894", "darkgrey": "#49576d", "pink": "#dd9dc3",
}

CHARACTERS = {
    "nia": dict(skin="#ad7052", skinlight="#d89a6e", skindark="#78473d", hair="#292235", hairlight="#4e3549", style="curls", coat="violet", shirt="amber", pants="navy", accessory="zip", age="teen"),
    "leo": dict(skin="#e5b987", skinlight="#ffdcab", skindark="#ad7c64", hair="#734b37", hairlight="#a67549", style="swoop", coat="amber", shirt="white", pants="navy", accessory="glasses", age="teen"),
    "taina": dict(skin="#bd8058", skinlight="#e4a576", skindark="#80553f", hair="#292839", hairlight="#4c4151", style="long", coat="cyandark", shirt="white", pants="navy", accessory="camera", age="teen"),
    "sol": dict(skin="#81503e", skinlight="#b77853", skindark="#543a35", hair="#242431", hairlight="#45404d", style="afro", coat="coral", shirt="violetdark", pants="navy", accessory="headphones", age="teen"),
    "pix": dict(robot=True),
    "curator": dict(skin="#8b624c", skinlight="#b98864", skindark="#5b443e", hair="#afb5ba", hairlight="#e0ded2", style="short", coat="violetdark", shirt="white", pants="navy", accessory="glasses", age="adult"),
    "librarian": dict(skin="#9a674c", skinlight="#c88e62", skindark="#61453c", hair="#3d3040", hairlight="#625061", style="bun", coat="greendark", shirt="amber", pants="navy", accessory="scarf", age="adult"),
    "scientist": dict(skin="#d09f79", skinlight="#efc5a0", skindark="#9a705e", hair="#828b95", hairlight="#c3c7c4", style="curls", coat="white", shirt="cyandark", pants="darkgrey", accessory="goggles", age="adult"),
    "journalist": dict(skin="#c59677", skinlight="#e9bb90", skindark="#8f6553", hair="#493d44", hairlight="#746052", style="bob", coat="navylight", shirt="cyan", pants="navy", accessory="press", age="adult"),
    "resident": dict(skin="#d3ad88", skinlight="#f0d0a0", skindark="#9b785e", hair="#9b9891", hairlight="#d1c5ad", style="short", coat="brown", shirt="greenlight", pants="navy", accessory="scarf", age="adult"),
    "student": dict(skin="#ac7558", skinlight="#d59a72", skindark="#755040", hair="#403044", hairlight="#69506b", style="cap", coat="green", shirt="amberlight", pants="violetdark", accessory="backpack", age="teen"),
    "musician": dict(skin="#8f5c42", skinlight="#b88057", skindark="#654436", hair="#34303d", hairlight="#66535a", style="curls", coat="coraldark", shirt="amber", pants="navy", accessory="strap", age="adult"),
}

TILES = ["grass", "grass_light", "flower_grass", "dirt_path", "stone_path", "street", "sidewalk", "plaza", "wood_floor", "archive_floor", "museum_floor", "library_floor", "lab_floor", "studio_floor", "transit_floor", "water", "water_edge", "brick_wall", "archive_wall", "glass_wall", "rock", "sand", "soil", "hedge", "circuit_floor", "mural_wall", "steps", "road_line", "void", "community_floor", "park_ground", "portal_base"]
PROPS = ["oak_tree", "palm", "sapling", "hedge", "bench", "lamp", "fountain", "mural", "noticeboard", "books", "bookshelf", "reading_desk", "archive_cabinet", "document", "portrait_frame", "globe", "microscope", "telescope", "lab_table", "terminal", "projector", "camera_tripod", "microphone", "speaker", "dj_desk", "drums", "guitar", "keyboard", "plant_pot", "flowers", "street_banner", "market_stall", "gate", "portal", "clue", "chest", "signpost", "footbridge", "bin", "coffee", "bus_stop", "dialogue", "inclusive_flag", "texture_booth", "map_board", "charging_station", "evidence", "podium"]
ICONS = ["inventory", "journal", "map", "translate", "scan", "source", "timeline", "shield", "clue", "settings", "audio", "fullscreen", "arrow", "back", "heart", "star"]
BADGES = ["listening", "curiosity", "collaboration", "critical_thinking", "history", "language", "culture", "courage", "care", "repair", "science", "music", "inclusion", "connection", "checkpoint", "voices"]
EFFECTS = ["spark_cyan", "spark_coral", "spark_amber", "spark_violet", "scan", "portal", "ripple", "warning", "heart", "shield", "music", "translate", "trail", "burst", "confetti", "signal"]
BOSSES = ["djglitch", "eraser", "copycat", "clickbait", "wall", "bias"]


def color(c):
    return P.get(c, c)


def rect(d, xy, fill, outline=None, width=1):
    d.rectangle(xy, fill=color(fill), outline=color(outline) if outline else None, width=width)


def poly(d, xy, fill, outline=None, width=1):
    d.polygon(xy, fill=color(fill), outline=color(outline) if outline else None, width=width)


def ell(d, xy, fill, outline=None, width=1):
    d.ellipse(xy, fill=color(fill), outline=color(outline) if outline else None, width=width)


def line(d, xy, fill, width=1):
    d.line(xy, fill=color(fill), width=width)


def star(d, x, y, c, r=3):
    line(d, (x-r, y, x+r, y), c)
    line(d, (x, y-r, x, y+r), c)
    rect(d, (x-1, y-1, x+1, y+1), c)


def save(im, rel):
    dest = OUT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, optimize=True)


def empty(w=32, h=32):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def draw_hair(d, s, face_box, back=False, side=False):
    x0, y0, x1, y1 = face_box
    h, hi, style = s["hair"], s["hairlight"], s["style"]
    if style in ("curls", "afro"):
        for x,y,r in [(x0+1,y0+2,3),(x0+4,y0,3),(x0+8,y0,3),(x1-1,y0+2,3),(x0-1,y0+5,2),(x1+1,y0+5,2)]:
            ell(d,(x-r,y-r,x+r,y+r),h,"ink")
            rect(d,(x-1,y-1,x,y),hi)
        if back:
            ell(d,(x0-2,y0-2,x1+2,y1),h,"ink")
            for x,y in [(x0+2,y0+2),(x0+6,y0),(x1-2,y0+4),(x0+4,y1-2)]:
                rect(d,(x,y,x+1,y+1),hi)
    elif style in ("long", "bob"):
        rect(d,(x0-2,y0+1,x0,y1+(4 if style=="long" else 1)),h,"ink")
        rect(d,(x1,y0+1,x1+2,y1+(4 if style=="long" else 1)),h,"ink")
        poly(d,[(x0-1,y0+3),(x0+2,y0-2),(x1-2,y0-2),(x1+1,y0+3),(x1-1,y0+5),(x0+4,y0+2)],h,"ink")
        line(d,(x0+2,y0,x1-2,y0),hi)
        if back:
            rect(d,(x0-1,y0,x1+1,y1+3),h,"ink")
            line(d,(x0+2,y0+3,x0+2,y1+1),hi)
            line(d,(x1-2,y0+3,x1-2,y1+1),hi)
    elif style == "bun":
        ell(d,(x0+2,y0-5,x1-1,y0+1),h,"ink")
        ell(d,(x0-1,y0-1,x1+1,y0+5),h,"ink")
        rect(d,(x0+4,y0-3,x0+6,y0-2),hi)
        if back:
            ell(d,(x0-1,y0-1,x1+1,y1-1),h,"ink")
    elif style == "cap":
        ell(d,(x0-1,y0-1,x1+1,y0+6),h,"ink")
        rect(d,(x0-1,y0-1,x1+1,y0+3),"navy","ink")
        rect(d,(x1-1,y0+2,x1+4,y0+4),"violet")
        line(d,(x0+2,y0,x1-1,y0),"cyan")
        if back:
            ell(d,(x0-1,y0,x1+1,y1-1),h,"ink")
            rect(d,(x0-1,y0-1,x1+1,y0+3),"navy","ink")
    else:
        poly(d,[(x0-1,y0+4),(x0,y0),(x0+3,y0-2),(x1-1,y0-1),(x1+1,y0+2),(x1,y0+5),(x0+4,y0+3)],h,"ink")
        line(d,(x0+2,y0,x1-2,y0+1),hi)
        if back:
            ell(d,(x0-1,y0-1,x1+1,y1-1),h,"ink")
            rect(d,(x0+3,y0+1,x0+6,y0+2),hi)


def robot_sprite(frame, state):
    im = empty(); d = ImageDraw.Draw(im)
    y = [0,-1,0,1][frame]
    ell(d,(8,27,24,30),(17,23,41,72))
    line(d,(16,7+y,16,4+y),"navylight")
    ell(d,(14,2+y,18,6+y),"amber","ink")
    poly(d,[(8,12+y),(4,13+y),(4,18+y),(8,20+y)],"cyandark","ink")
    poly(d,[(24,12+y),(28,13+y),(28,18+y),(24,20+y)],"cyandark","ink")
    rect(d,(7,8+y,25,22+y),"white","ink")
    rect(d,(9,10+y,23,19+y),"navy","ink")
    line(d,(10,9+y,22,9+y),"cyanlight")
    if state == "celebrate":
        line(d,(11,14+y,13,12+y,15,14+y),"cyan",2)
        line(d,(18,14+y,20,12+y,22,14+y),"cyan",2)
        star(d,3,5,"amber",2); star(d,28,4,"violetlight",2)
    elif state == "interact":
        rect(d,(11,12+y,14,15+y),"cyan")
        rect(d,(19,12+y,21,15+y),"cyan")
        line(d,(12,17+y,20,17+y),"coral")
        line(d,(26,8+y,30,5+y),"cyan")
    else:
        rect(d,(11,12+y,13,15+y),"cyanlight")
        rect(d,(19,12+y,21,15+y),"cyanlight")
        line(d,(14,17+y,18,17+y),"cyan")
    rect(d,(12,23+y,20,24+y),"cyandark","ink")
    poly(d,[(13,25+y),(19,25+y),(18,28+y),(15,29+y)],"cyan")
    rect(d,(15,25+y,17,26+y),"cyanlight")
    return im


def profile_sprite(s, direction, frame):
    """Readable side-on animation; backpacks live behind the shoulder."""
    im=empty();d=ImageDraw.Draw(im)
    skin,sl,sd=s["skin"],s["skinlight"],s["skindark"]
    hair,hi,style=s["hair"],s["hairlight"],s["style"]
    bob=1 if frame in (1,3) else 0
    stride=[0,2,0,-2][frame]
    ell(d,(8,28,25,31),(17,23,41,72))
    rect(d,(17+stride,23,20+stride,28),s["pants"],"ink")
    rect(d,(14-stride,23,17-stride,28),s["pants"],"ink")
    rect(d,(16+stride,28,21+stride,30),"ink")
    rect(d,(12-stride,28,17-stride,30),"ink")
    line(d,(13-stride,28,16-stride,28),"grey")
    poly(d,[(14,16+bob),(21,16+bob),(23,20+bob),(22,24),(12,24),(12,19+bob)],s["coat"],"ink")
    rect(d,(12,17+bob,14,21),s["shirt"])
    rect(d,(14,14+bob,18,17+bob),skin,"ink")
    if style in ("long","bob"):
        rect(d,(18,6+bob,23,21+bob if style=="long" else 16+bob),hair,"ink")
        line(d,(21,8+bob,21,18+bob),hi)
    ell(d,(10,5+bob,22,16+bob),skin,"ink")
    poly(d,[(10,10+bob),(8,12+bob),(9,13+bob),(11,13+bob)],skin,"ink")
    rect(d,(10,9+bob,11,12+bob),sl)
    ell(d,(18,10+bob,21,14+bob),sd)
    if style in ("curls","afro"):
        for x,y,r in [(12,6,3),(16,4,3),(20,6,3),(22,10,3),(21,14,2)]:
            ell(d,(x-r,y-r+bob,x+r,y+r+bob),hair,"ink")
            rect(d,(x-1,y-1+bob,x,y+bob),hi)
    elif style in ("long","bob"):
        poly(d,[(10,9+bob),(10,5+bob),(13,2+bob),(20,3+bob),(23,7+bob),(22,15+bob),(19,13+bob),(18,7+bob),(13,7+bob)],hair,"ink")
        line(d,(13,4+bob,19,5+bob),hi)
    elif style=="bun":
        ell(d,(19,0+bob,25,6+bob),hair,"ink")
        poly(d,[(10,9+bob),(10,5+bob),(14,2+bob),(20,3+bob),(23,7+bob),(22,12+bob),(18,11+bob),(16,7+bob)],hair,"ink")
        line(d,(14,4+bob,20,5+bob),hi)
    elif style=="cap":
        rect(d,(10,4+bob,22,7+bob),"navy","ink")
        rect(d,(6,7+bob,16,9+bob),"violet","ink")
        line(d,(13,5+bob,18,5+bob),"cyan")
        rect(d,(20,8+bob,22,11+bob),hair)
    else:
        poly(d,[(10,9+bob),(10,5+bob),(14,2+bob),(21,3+bob),(23,7+bob),(22,12+bob),(19,11+bob),(18,7+bob),(13,7+bob)],hair,"ink")
        line(d,(14,4+bob,20,5+bob),hi)
    rect(d,(11,10+bob,12,11+bob),"ink")
    rect(d,(11,10+bob,11,10+bob),"white")
    line(d,(10,14+bob,13,14+bob),sd)
    # A single near arm swinging across a side-view coat.
    rect(d,(17+stride//2,18+bob,20+stride//2,23+bob),s["coat"],"ink")
    rect(d,(17+stride//2,23+bob,19+stride//2,25+bob),skin,"ink")
    acc=s["accessory"]
    if acc in ("glasses","backpack"):
        rect(d,(22,17+bob,25,24),"amberdark" if acc=="glasses" else "violetdark","ink")
        line(d,(23,19,23,22),"amber" if acc=="glasses" else "violet")
    if acc in ("glasses","goggles"):
        gy=9+bob if acc=="glasses" else 5+bob
        rect(d,(9,gy,14,gy+4),None,"ink")
        line(d,(14,gy+1,19,gy+2),"ink")
        rect(d,(10,gy+1,10,gy+1),"cyanlight")
    if acc=="headphones":
        line(d,(11,5+bob,13,2+bob,20,2+bob,23,6+bob,23,10+bob),"coral",2)
        rect(d,(19,8+bob,23,13+bob),"coral","ink")
        line(d,(20,9+bob,20,11+bob),"amberlight")
    if acc=="camera":
        line(d,(15,17+bob,11,21),"navy")
        rect(d,(9,20,15,24),"navy","ink")
        ell(d,(8,21,12,24),"cyan","ink")
    if acc=="scarf":
        rect(d,(13,16+bob,19,18+bob),"amber")
        rect(d,(12,18+bob,13,22),"amberdark")
    if acc=="press":
        line(d,(14,17+bob,12,20),"coral")
        rect(d,(11,20,14,23),"white","ink")
    if acc=="strap":line(d,(13,17+bob,19,23),"amberdark",2)
    if acc=="zip":line(d,(12,18+bob,12,22),"violetlight")
    return im.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if direction==2 else im


def sprite(s, direction, frame, state="walk"):
    if s.get("robot"):
        return robot_sprite(frame,state)
    if state=="walk" and direction in (1,2):
        return profile_sprite(s,direction,frame)
    im=empty(); d=ImageDraw.Draw(im)
    skin,sl,sd=s["skin"],s["skinlight"],s["skindark"]
    bob=1 if frame in (1,3) and state=="walk" else 0
    head=(10,5+bob,21,15+bob)
    stride = [0,1,0,-1][frame] if state=="walk" else 0
    ell(d,(7,28,25,31),(17,23,41,72))
    # Coats and long hair have a consistent dark one-pixel silhouette.
    if s["style"] in ("long","bob"):
        rect(d,(8,8+bob,23,20+bob),s["hair"],"ink")
    rect(d,(11,23,14,27+max(0,stride)),s["pants"],"ink")
    rect(d,(17,23,20,27+max(0,-stride)),s["pants"],"ink")
    rect(d,(10,27+max(0,stride),14,29+max(0,stride)),"ink")
    rect(d,(17,27+max(0,-stride),21,29+max(0,-stride)),"ink")
    rect(d,(11,27+max(0,stride),14,27+max(0,stride)),"grey")
    rect(d,(17,27+max(0,-stride),20,27+max(0,-stride)),"grey")
    poly(d,[(11,16+bob),(20,16+bob),(22,19+bob),(21,24),(10,24),(9,19+bob)],s["coat"],"ink")
    rect(d,(13,17+bob,18,22),s["shirt"])
    line(d,(11,18+bob,11,22),"white" if s["coat"]=="white" else s["coat"])
    rect(d,(13,23,18,24),s["coat"])
    rect(d,(14,14+bob,17,17+bob),skin)
    ell(d,head,skin,"ink")
    rect(d,(11,8+bob,13,12+bob),sl)
    rect(d,(19,11+bob,21,13+bob),sd)
    draw_hair(d,s,head,back=direction==3,side=direction in (1,2))
    if direction==3:
        rect(d,(13,17+bob,18,24),s["coat"])
        line(d,(15,19+bob,15,22),"grey" if s["coat"]=="white" else "navylight")
    if direction!=3:
        if direction in (1,2):
            # Profile eye, eyebrow and nose are distinct from the front face.
            ex=12 if direction==1 else 19
            rect(d,(ex,10+bob,ex+1,11+bob),"ink")
            nx=9 if direction==1 else 22
            rect(d,(nx,11+bob,nx,12+bob),skin)
            rect(d,(ex,14+bob,ex+1,14+bob),sd)
        else:
            rect(d,(12,10+bob,13,11+bob),"ink")
            rect(d,(18,10+bob,19,11+bob),"ink")
            rect(d,(13,10+bob,13,10+bob),"white")
            rect(d,(19,10+bob,19,10+bob),"white")
            line(d,(14,14+bob,17,14+bob),sd)
    # Walking hands, an interaction gesture, or raised celebration arms.
    if state=="celebrate":
        poly(d,[(10,18),(8,17),(6,12+frame%2),(8,11),(11,16)],s["coat"],"ink")
        poly(d,[(21,18),(23,17),(25,12-frame%2),(23,11),(20,16)],s["coat"],"ink")
        rect(d,(5,9+frame%2,8,12+frame%2),skin,"ink")
        rect(d,(23,8-frame%2,26,11-frame%2),skin,"ink")
        star(d,3,5+frame%2,"amber",2); star(d,28,3+frame%2,"cyan",2)
    elif state=="interact":
        rect(d,(7,18+bob,10,22+bob),s["coat"],"ink")
        rect(d,(8,22+bob,10,24+bob),skin,"ink")
        rect(d,(21,17,24,20),s["coat"],"ink")
        rect(d,(22,15,24,17),skin,"ink")
        rect(d,(23,11,28,15),"navy","ink")
        rect(d,(24,12,27,13),"cyan")
        if frame in (1,3): star(d,28,8,"cyanlight",2)
    else:
        rect(d,(7,18+bob+stride,10,22+bob+stride),s["coat"],"ink")
        rect(d,(8,22+bob+stride,10,24+bob+stride),skin,"ink")
        rect(d,(21,18+bob-stride,24,22+bob-stride),s["coat"],"ink")
        rect(d,(21,22+bob-stride,23,24+bob-stride),skin,"ink")
    acc=s["accessory"]
    if acc in ("glasses","goggles") and direction!=3:
        gy=10+bob if acc=="glasses" else 6+bob
        if direction==0:
            rect(d,(11,gy,15,gy+3),None,"ink")
            rect(d,(17,gy,21,gy+3),None,"ink")
            line(d,(15,gy+1,17,gy+1),"ink")
            rect(d,(12,gy+1,12,gy+1),"cyanlight")
            rect(d,(18,gy+1,18,gy+1),"cyanlight")
        else:
            x=10 if direction==1 else 18
            rect(d,(x,gy,x+4,gy+3),None,"ink")
            rect(d,(x+1,gy+1,x+1,gy+1),"cyanlight")
    if acc=="headphones":
        line(d,(8,9+bob,8,5+bob,12,2+bob,19,2+bob,23,5+bob,23,9+bob),"coraldark",2)
        rect(d,(6,8+bob,9,13+bob),"coral","ink")
        rect(d,(22,8+bob,25,13+bob),"coral","ink")
        rect(d,(7,9+bob,7,11+bob),"amberlight")
    if acc=="camera" and direction!=3:
        line(d,(12,17+bob,19,22),"navy")
        rect(d,(13,20,20,24),"navy","ink")
        ell(d,(15,20,19,24),"cyan","ink")
        rect(d,(14,19,16,19),"greylight")
    if acc in ("backpack","glasses"):
        if direction==3:
            rect(d,(11,17+bob,20,24),"amberdark" if acc=="glasses" else "violetdark","ink")
            rect(d,(13,20+bob,18,23),"amber" if acc=="glasses" else "violet","ink")
        elif direction in (1,2):
            x=21 if direction==1 else 7
            rect(d,(x,17+bob,x+3,23),"amberdark" if acc=="glasses" else "violetdark","ink")
    if acc=="scarf":
        rect(d,(12,16+bob,19,17+bob),"amber")
        rect(d,(18,17+bob,19,21),"amberdark")
    if acc=="press":
        line(d,(13,17+bob,18,19),"coral")
        rect(d,(15,19,18,22),"white","ink")
        rect(d,(16,20,17,20),"coral")
    if acc=="strap":
        line(d,(11,17+bob,20,23),"amberdark",2)
    if acc=="zip" and direction!=3:
        line(d,(16,18+bob,16,23),"violetlight")
        rect(d,(11,20,12,21),"cyan")
    return im


def robot_portrait(expression):
    im=empty(48,48); d=ImageDraw.Draw(im)
    ell(d,(6,39,42,45),(17,23,41,65))
    line(d,(24,8,24,3),"navylight",2)
    ell(d,(21,0,27,6),"amber","ink")
    poly(d,[(8,18),(2,21),(2,30),(8,33)],"cyandark","ink")
    poly(d,[(39,18),(45,21),(45,30),(39,33)],"cyandark","ink")
    rect(d,(7,10,40,37),"white","ink",2)
    rect(d,(10,14,37,31),"navy","ink")
    line(d,(10,12,35,12),"cyanlight")
    if expression=="happy":
        line(d,(14,22,17,19,20,22),"cyan",2)
        line(d,(27,22,30,19,33,22),"cyan",2)
        line(d,(19,27,22,29,26,29,29,27),"cyanlight")
        star(d,4,9,"amber",2); star(d,43,5,"violetlight",2)
    else:
        rect(d,(15,19,19,23),"cyanlight")
        rect(d,(28,19,32,23),"cyanlight")
        if expression=="concerned":
            line(d,(14,16,20,18),"coral")
            line(d,(27,18,33,16),"coral")
            line(d,(21,28,27,28),"coral")
        else:
            line(d,(21,27,27,27),"cyan")
    rect(d,(15,36,32,40),"cyandark","ink")
    poly(d,[(20,41),(28,41),(26,46),(22,46)],"cyan")
    rect(d,(9,34,11,35),"amber")
    return im.resize((96,96), Image.Resampling.NEAREST)


def portrait(s, expression):
    if s.get("robot"): return robot_portrait(expression)
    im=empty(48,48); d=ImageDraw.Draw(im)
    skin,sl,sd=s["skin"],s["skinlight"],s["skindark"]
    style=s["style"]; hair=s["hair"]; hh=s["hairlight"]
    # Original 48px portrait art, enlarged exactly 2x for crisp 96px frames.
    if style in ("long","bob"):
        ell(d,(10,5,38,33),hair,"ink")
        rect(d,(10,16,38,37 if style=="long" else 31),hair,"ink")
        line(d,(12,15,12,34),hh)
        line(d,(35,13,35,33),hh)
    if style in ("curls","afro"):
        for x,y,r in [(13,12,5),(15,7,5),(22,5,5),(29,6,5),(35,11,5),(36,17,4),(12,19,4)]:
            ell(d,(x-r,y-r,x+r,y+r),hair,"ink")
            rect(d,(x-2,y-2,x,y-1),hh)
        if style=="afro":
            ell(d,(10,7,38,30),hair,"ink")
            for x,y in [(12,12),(16,8),(24,6),(31,8),(35,13)]: rect(d,(x,y,x+2,y+1),hh)
    elif style=="bun":
        ell(d,(17,0,30,11),hair,"ink")
        ell(d,(11,7,36,24),hair,"ink")
        line(d,(20,3,27,3),hh)
        line(d,(15,10,29,9),hh)
    elif style not in ("long","bob"):
        ell(d,(11,5,37,27),hair,"ink")
    # Shoulder coat and face produce a friendly, contemporary silhouette.
    poly(d,[(8,48),(8,40),(13,35),(20,33),(28,33),(35,35),(40,40),(40,48)],s["coat"],"ink")
    rect(d,(20,30,28,36),skin,"ink")
    rect(d,(20,32,28,34),sd)
    poly(d,[(19,35),(24,38),(29,35),(29,48),(19,48)],s["shirt"])
    poly(d,[(15,35),(20,34),(23,38),(18,41)],s["coat"],"ink")
    poly(d,[(29,34),(34,36),(30,42),(25,38)],s["coat"],"ink")
    line(d,(13,41,13,47),"greylight" if s["coat"]=="white" else "navylight")
    line(d,(35,41,35,47),"greylight" if s["coat"]=="white" else "navylight")
    ell(d,(11,18,16,25),skin,"ink")
    ell(d,(33,18,38,25),skin,"ink")
    ell(d,(14,8,34,34),skin,"ink")
    poly(d,[(15,16),(16,11),(21,9),(25,9),(25,12),(18,15),(17,24),(15,26)],sl)
    poly(d,[(32,17),(34,20),(33,29),(29,32),(25,33),(24,31),(29,29),(31,25)],sd)
    rect(d,(14,21,15,23),sl)
    # Forehead hair sits in front of the face rather than a headwear stereotype.
    if style in ("curls","afro"):
        for x,y,r in [(16,10,3),(19,8,3),(24,8,3),(29,9,3),(33,12,3)]:
            ell(d,(x-r,y-r,x+r,y+r),hair,"ink")
            rect(d,(x,y-1,x+1,y),hh)
    elif style in ("long","bob"):
        poly(d,[(13,17),(13,10),(18,6),(28,6),(35,11),(35,18),(31,14),(27,10),(23,12),(18,12)],hair,"ink")
        line(d,(16,10,21,8,29,9),hh)
        line(d,(33,17,33,28),hh)
    elif style=="bun":
        poly(d,[(13,17),(13,11),(18,7),(30,8),(35,13),(34,18),(30,13),(19,12)],hair,"ink")
        line(d,(16,10,23,9,30,10),hh)
    elif style=="cap":
        rect(d,(12,5,36,13),"navy","ink")
        poly(d,[(13,12),(35,12),(42,15),(42,17),(31,16),(13,15)],"violet","ink")
        line(d,(16,8,27,8),"cyan")
        rect(d,(24,6,27,10),"cyan")
    else:
        poly(d,[(13,17),(12,11),(16,6),(29,5),(36,10),(35,17),(30,12),(24,12),(19,10),(17,15)],hair,"ink")
        line(d,(16,10,24,8,31,9),hh)
    if expression=="happy":
        line(d,(17,22,19,20,21,22),"ink")
        line(d,(27,22,29,20,31,22),"ink")
        poly(d,[(20,28),(28,28),(27,31),(24,32),(21,30)],"ink")
        rect(d,(21,28,27,28),"white")
        rect(d,(22,30,26,30),"coral")
        rect(d,(16,25,18,26),sd)
        rect(d,(30,25,32,26),sd)
    else:
        line(d,(17,20,21,20),hair)
        line(d,(27,20,31,20),hair)
        rect(d,(17,21,21,23),"white")
        rect(d,(27,21,31,23),"white")
        rect(d,(19,21,20,24),"ink")
        rect(d,(28,21,29,24),"ink")
        rect(d,(19,21,19,21),"white")
        rect(d,(28,21,28,21),"white")
        if expression=="concerned":
            line(d,(17,18,21,19),hair)
            line(d,(27,19,31,18),hair)
            line(d,(21,29,23,28,26,28,28,29),"ink")
        else:
            line(d,(21,29,27,29,28,28),"ink")
            line(d,(22,30,26,30),sl)
    line(d,(24,23,23,26,25,26),sd)
    if s["age"]=="adult":
        rect(d,(15,24,16,24),sd); rect(d,(32,24,33,24),sd)
    acc=s["accessory"]
    if acc=="glasses":
        rect(d,(16,19,22,25),None,"ink")
        rect(d,(26,19,32,25),None,"ink")
        line(d,(22,21,26,21),"ink")
        rect(d,(17,20,18,20),"cyanlight")
        rect(d,(27,20,28,20),"cyanlight")
    if acc=="goggles":
        line(d,(12,11,35,11),"navy",2)
        rect(d,(16,8,22,13),"cyan","ink")
        rect(d,(25,8,31,13),"cyan","ink")
        rect(d,(17,9,19,9),"cyanlight"); rect(d,(26,9,28,9),"cyanlight")
        rect(d,(12,39,17,42),"white","ink")
        rect(d,(13,40,16,40),"cyan")
    if acc=="headphones":
        line(d,(10,20,10,11,16,4,29,4,37,12,37,22),"coraldark",2)
        rect(d,(8,18,12,26),"coral","ink")
        rect(d,(35,18,39,26),"coral","ink")
        rect(d,(9,20,10,23),"amberlight"); rect(d,(36,20,37,23),"amberlight")
        rect(d,(30,39,34,42),"violetdark","ink")
        rect(d,(31,40,31,41),"cyan")
    if acc=="camera":
        line(d,(17,35,29,43),"ink",2)
        rect(d,(22,39,34,47),"navy","ink")
        rect(d,(24,37,28,39),"navy","ink")
        ell(d,(26,40,33,47),"cyan","ink")
        ell(d,(28,42,31,45),"navy","cyanlight")
        rect(d,(23,40,25,41),"amber")
    if acc=="scarf":
        poly(d,[(18,34),(24,36),(30,34),(29,38),(20,38)],"amber","ink")
        rect(d,(27,38,30,46),"amberdark","ink")
        line(d,(28,40,28,43),"amberlight")
    if acc=="press":
        line(d,(19,35,24,40,29,35),"coral")
        rect(d,(22,41,28,47),"white","ink")
        rect(d,(23,42,26,43),"coral")
        line(d,(23,45,27,45),"navy")
    if acc=="strap":
        line(d,(15,35,34,47),"amberdark",3)
        line(d,(15,35,34,47),"amber")
        # Short beard gives this NPC an adult silhouette.
        line(d,(18,30,21,33,27,33,31,30),hair,2)
    if acc=="backpack":
        line(d,(15,36,16,47),"violetdark",2); line(d,(33,36,32,47),"violetdark",2)
    if acc=="zip":
        line(d,(24,38,24,47),"violetlight")
        rect(d,(14,40,17,42),"cyan","ink")
        rect(d,(26,42,30,44),"violetdark","ink")
    return im.resize((96,96),Image.Resampling.NEAREST)


def create_characters():
    for name,s in CHARACTERS.items():
        sheet=empty(128,192)
        for row in range(6):
            for f in range(4):
                sheet.alpha_composite(sprite(s,row if row<4 else 0,f,"walk" if row<4 else "interact" if row==4 else "celebrate"),(32*f,32*row))
        save(sheet,f"characters/{name}.png")
        portraits=empty(288,96)
        for i,e in enumerate(("neutral","happy","concerned")):
            portraits.alpha_composite(portrait(s,e),(96*i,0))
        save(portraits,f"characters/{name}-portrait.png")


def boss(name,frame):
    im=empty(48,48); d=ImageDraw.Draw(im)
    ell(d,(7,41,41,47),(17,23,41,80))
    bob=[0,-1,0,1][frame]
    if name=="djglitch":
        rect(d,(10,6+bob,38,38+bob),"violetdark","ink",2)
        rect(d,(12,8+bob,36,10+bob),"violetlight")
        rect(d,(15,14+bob,32,22+bob),"navy","ink")
        for x in (18,27):
            rect(d,(x,16+bob,x+3,18+bob),"coral")
            rect(d,(x+1,16+bob,x+1,16+bob),"amberlight")
        line(d,(19,21+bob,28,21+bob),"cyan")
        ell(d,(15,25+bob,32,40+bob),"navy","ink",2)
        ell(d,(19,29+bob,28,36+bob),"cyandark","cyan")
        ell(d,(22,31+bob,25,34+bob),"cyanlight")
        rect(d,(7,3+bob,11,18+bob),"coral","ink")
        rect(d,(37,3+bob,41,18+bob),"coral","ink")
        line(d,(9,6+bob,9,0+bob,38,0+bob,39,6+bob),"coral",2)
        rect(d,(4,37,44,42),"navy","ink")
        ell(d,(8,38,17,41),"grey","cyan")
        ell(d,(29,38,38,41),"grey","cyan")
        rect(d,(21,38,25,40),"amber")
        for x,y,c in [(3,10,"cyan"),(43,17,"amber"),(4,27,"violetlight"),(43,30,"coral")]:
            rect(d,(x,y+frame%2,x+2,y+1+frame%2),c)
    elif name=="eraser":
        # An animated archive eraser, never a caricature of a person/group.
        poly(d,[(8,12+bob),(30,5+bob),(40,12+bob),(39,34+bob),(18,43+bob),(8,36+bob)],"paper","ink",2)
        poly(d,[(8,12+bob),(30,5+bob),(30,27+bob),(8,36+bob)],"coral","ink")
        poly(d,[(30,5+bob),(40,12+bob),(39,34+bob),(30,27+bob)],"coraldark","ink")
        poly(d,[(8,28+bob),(30,20+bob),(30,27+bob),(8,36+bob)],"violetdark","ink")
        line(d,(12,16+bob,27,11+bob),"corallight")
        rect(d,(13,19+bob,17,21+bob),"ink")
        rect(d,(22,16+bob,26,18+bob),"ink")
        line(d,(16,25+bob,22,23+bob),"white")
        rect(d,(7,33,12,37),"greylight","ink")
        rect(d,(33,35,39,40),"greylight","ink")
        for x,y in [(3,33),(8,41),(15,45),(41,38)]:
            rect(d,(x+frame%2,y,x+2+frame%2,y+1),"paper")
        line(d,(0,13,5,13),"coral")
    elif name=="copycat":
        # A copying machine made from mirrors and duplicated pixels.
        rect(d,(10,7+bob,39,36+bob),"navylight","ink",2)
        rect(d,(14,10+bob,35,29+bob),"violetdark","cyan")
        rect(d,(17,13+bob,32,26+bob),"cyan","ink")
        rect(d,(19,15+bob,30,23+bob),"navy")
        rect(d,(21,17+bob,23,19+bob),"violetlight")
        rect(d,(27,17+bob,29,19+bob),"violetlight")
        line(d,(23,21+bob,27,21+bob),"cyan")
        rect(d,(6,2+bob,28,5+bob),"white","ink")
        rect(d,(8,3+bob,23,3+bob),"violet")
        poly(d,[(13,33+bob),(36,33+bob),(33,44),(11,44)],"white","ink")
        line(d,(17,36,30,36),"violet")
        line(d,(15,39,27,39),"cyandark")
        rect(d,(3,16+bob,9,30+bob),"violet","ink")
        rect(d,(39,16+bob,45,30+bob),"violet","ink")
        rect(d,(14,30+bob,17,31+bob),"amber")
        rect(d,(21,30+bob,24,31+bob),"coral")
        for x,y in [(2,7),(42,6),(3,37)]:
            rect(d,(x,y,x+3,y+3),"cyanlight","violet")
    elif name=="clickbait":
        # A gaudy headline screen: its exaggerated expression sells the trick.
        rect(d,(8,10+bob,39,35+bob),"amber","ink",2)
        rect(d,(11,13+bob,36,30+bob),"coraldark","ink")
        rect(d,(12,14+bob,35,17+bob),"coral")
        line(d,(14,15+bob,32,15+bob),"amberlight")
        poly(d,[(16,20+bob),(21,19+bob),(20,23+bob),(16,23+bob)],"white","ink")
        poly(d,[(27,19+bob),(32,20+bob),(32,23+bob),(28,23+bob)],"white","ink")
        rect(d,(18,20+bob,19,22+bob),"ink")
        rect(d,(29,20+bob,30,22+bob),"ink")
        poly(d,[(17,26+bob),(31,26+bob),(28,29+bob),(21,29+bob)],"white","ink")
        line(d,(24,26+bob,24,29+bob),"coraldark")
        line(d,(18,10+bob,13,3+bob,9,3+bob),"navylight",2)
        line(d,(30,10+bob,35,3+bob,39,3+bob),"navylight",2)
        rect(d,(19,36+bob,28,39+bob),"navy","ink")
        rect(d,(12,40,35,43),"coral","ink")
        poly(d,[(4,24),(0,20),(1,17),(7,19)],"coral","ink")
        poly(d,[(42,23),(47,19),(46,16),(40,19)],"coral","ink")
        star(d,4,5+frame%2,"amber",3); star(d,44,35-frame%2,"coral",3)
    elif name=="wall":
        rect(d,(6,5,41,42),"darkgrey","ink",2)
        for y in range(8,41,7):
            line(d,(8,y,39,y),"navy")
            for x in range(7+(4 if (y//7)%2 else 0),40,10): line(d,(x,y,x,y+6),"navy")
        rect(d,(10,8,37,10),"grey")
        rect(d,(14,14,33,37),"navy","ink")
        poly(d,[(14,14),(23,9),(33,14),(33,18),(14,18)],"grey","ink")
        rect(d,(17,20,20,24),"coral")
        rect(d,(27,20,30,24),"coral")
        line(d,(19,29,28,29),"grey")
        rect(d,(21,31,27,36),"amber","ink")
        ell(d,(22,32,26,35),"amberdark")
        rect(d,(23,30,25,32),"amberdark","ink")
        if frame==1: line(d,(8,16,11,21,9,24),"amber")
        if frame==3: line(d,(37,27,34,32,36,35),"cyan")
        rect(d,(4,40,43,44),"grey","ink")
    elif name=="bias":
        rect(d,(21,10+bob,27,36+bob),"violetdark","ink")
        ell(d,(15,3+bob,33,20+bob),"navy","ink",2)
        rect(d,(18,9+bob,21,12+bob),"coral")
        rect(d,(27,9+bob,30,12+bob),"cyan")
        line(d,(22,15+bob,27,15+bob),"grey")
        line(d,(6,20+bob,40,13+bob),"amber",2)
        line(d,(9,20+bob,6,31,13,31,9,20+bob),"amberdark")
        line(d,(37,14+bob,32,24,42,24,37,14+bob),"amberdark")
        poly(d,[(4,31),(15,31),(12,36),(7,36)],"cyan","ink")
        poly(d,[(31,24),(43,24),(40,29),(35,29)],"coral","ink")
        rect(d,(17,35,31,40),"navylight","ink")
        rect(d,(11,41,37,44),"violet","ink")
        rect(d,(18,37,21,38),"cyan")
        rect(d,(27,37,30,38),"coral")
        rect(d,(7,26,11,30),"white","ink")
        rect(d,(34,20,38,23),"amber","ink")
    return im.resize((96,96),Image.Resampling.NEAREST)


def create_bosses():
    for name in BOSSES:
        sheet=empty(384,96)
        for frame in range(4): sheet.alpha_composite(boss(name,frame),(frame*96,0))
        save(sheet,f"characters/boss-{name}.png")


def tile(name,idx):
    im=empty(); d=ImageDraw.Draw(im); rng=random.Random(5300+idx)
    ground={"grass":"greendark","grass_light":"green","flower_grass":"greendark","dirt_path":"brownlight","stone_path":"grey","street":"darkgrey","sidewalk":"greylight","plaza":"navylight","wood_floor":"brown","archive_floor":"navy","museum_floor":"greylight","library_floor":"brown","lab_floor":"navylight","studio_floor":"violetdark","transit_floor":"darkgrey","water":"cyandark","water_edge":"cyandark","brick_wall":"coraldark","archive_wall":"navy","glass_wall":"navylight","rock":"darkgrey","sand":"amberlight","soil":"brown","hedge":"greendark","circuit_floor":"violetdark","mural_wall":"violet","steps":"grey","road_line":"darkgrey","void":"ink","community_floor":"brownlight","park_ground":"greendark","portal_base":"violetdark"}
    rect(d,(0,0,31,31),ground[name])
    if name in ("grass","grass_light","flower_grass","park_ground"):
        for i in range(20):
            x,y=rng.randrange(1,30),rng.randrange(1,30)
            line(d,(x,y,x,y-1,x+1,y-2),"greenlight" if name=="grass_light" else "green")
        for x,y in [(4,6),(22,17),(13,27)]: rect(d,(x,y,x+1,y),"greendark" if name=="grass_light" else "navy")
        if name=="flower_grass":
            for x,y,c in [(6,7,"amber"),(24,13,"coral"),(17,25,"violetlight")]:
                star(d,x,y,c,2);rect(d,(x,y,x,y),"white")
    elif name in ("dirt_path","sand","soil"):
        for i in range(30):
            x,y=rng.randrange(32),rng.randrange(32)
            rect(d,(x,y,x+1,y),"brown" if name=="dirt_path" else "amber" if name=="sand" else "brownlight")
        if name=="soil":
            for y in (6,15,24):line(d,(0,y,31,y),"amberdark")
    elif name in ("stone_path","sidewalk","plaza","museum_floor","lab_floor","transit_floor","archive_floor","community_floor"):
        border="navy" if name not in ("museum_floor","sidewalk") else "grey"
        for y in (0,16):
            line(d,(0,y,31,y),border)
            for x in (0,16):
                line(d,(x,y,x,y+15),border)
                line(d,(x+1,y+1,x+14,y+1),"grey" if name in ("plaza","archive_floor","lab_floor") else "white")
        if name=="lab_floor":
            for x,y in [(8,8),(24,24)]: rect(d,(x,y,x+1,y+1),"cyan")
        if name=="archive_floor":
            rect(d,(5,5,10,10),"violetdark"); rect(d,(21,21,26,26),"violetdark")
        if name=="community_floor":
            for x,y in [(6,6),(22,22)]:poly(d,[(x,y+3),(x+3,y),(x+6,y+3),(x+3,y+6)],"amberdark")
    elif name in ("wood_floor","library_floor"):
        for y in range(0,32,8):
            line(d,(0,y,31,y),"amberdark")
            line(d,(0,y+1,31,y+1),"brownlight")
            x=8 if y%16==0 else 24
            line(d,(x,y,x,y+7),"amberdark")
            line(d,(x+3,y+4,x+9,y+4),"brownlight")
    elif name in ("street","road_line"):
        for i in range(32):
            x,y=rng.randrange(32),rng.randrange(32)
            rect(d,(x,y,x,y),"grey" if i%5==0 else "navylight")
        if name=="road_line":rect(d,(14,0,17,31),"amber")
    elif name in ("water","water_edge"):
        for x,y in [(2,4),(17,8),(6,16),(24,22),(9,28)]:
            line(d,(x,y,min(x+7,31),y),"cyan")
            line(d,(x+2,y+1,min(x+6,31),y+1),"cyanlight")
        if name=="water_edge":
            poly(d,[(0,0),(31,0),(31,6),(25,5),(21,8),(14,5),(7,7),(0,5)],"green")
            line(d,(0,6,7,8,14,6,21,9,25,6,31,7),"cyanlight")
    elif name in ("brick_wall","archive_wall"):
        for y in (0,8,16,24):
            line(d,(0,y,31,y),"ink")
            line(d,(0,y+1,31,y+1),"coral" if name=="brick_wall" else "navylight")
            for x in range(0 if y%16==0 else 8,32,16):line(d,(x,y,x,y+7),"ink")
    elif name=="glass_wall":
        rect(d,(1,1,30,30),"cyandark","navy")
        line(d,(3,4,14,4),"cyanlight");line(d,(17,5,28,16),"cyan")
        line(d,(10,30,29,11),"navylight",2)
        line(d,(16,0,16,31),"navy",2)
    elif name=="rock":
        for pts in [[(1,8),(8,1),(17,4),(15,15),(4,18)],[(18,6),(27,2),(31,8),(29,19),(19,16)],[(5,20),(14,18),(22,23),(19,31),(6,31)]]:
            poly(d,pts,"grey","navy");line(d,(pts[0],pts[1],pts[2]),"greylight")
    elif name=="hedge":
        for y in (4,12,20,28):
            for x in (4,12,20,28):
                ell(d,(x-5,y-4,x+5,y+4),"green","greendark")
                rect(d,(x-2,y-2,x,y-1),"greenlight")
    elif name=="circuit_floor":
        line(d,(0,8,8,8,8,24,24,24,24,31),"violet",2)
        line(d,(18,0,18,12,31,12),"cyandark")
        ell(d,(6,6,10,10),"cyan","ink"); ell(d,(22,22,26,26),"coral","ink")
    elif name=="studio_floor":
        for x in (0,8,16,24):line(d,(x,0,x,31),"navy")
        for y in (0,8,16,24):line(d,(0,y,31,y),"navy")
        for x,y in [(5,5),(21,21)]:rect(d,(x,y,x+2,y+2),"violet")
    elif name=="mural_wall":
        for x,c in [(2,"coral"),(11,"amber"),(23,"cyan")]:
            ell(d,(x,8,x+10,19),c)
            poly(d,[(x+2,20),(x+8,20),(x+12,31),(x-2,31)],c)
        line(d,(0,4,31,4),"violetlight")
    elif name=="steps":
        for y in (0,8,16,24):
            rect(d,(0,y,31,y+2),"greylight")
            rect(d,(0,y+6,31,y+7),"navy")
    elif name=="portal_base":
        for box,c in [((1,1,30,30),"navy"),((5,5,26,26),"violet"),((9,9,22,22),"cyan")]:ell(d,box,c)
        ell(d,(12,12,19,19),"violetlight")
        for x,y in [(4,16),(16,4),(27,16),(16,27)]:rect(d,(x-1,y-1,x+1,y+1),"amber")
    return im


def prop(name):
    im=empty();d=ImageDraw.Draw(im)
    if name in ("oak_tree","palm","sapling"):
        if name=="oak_tree":
            rect(d,(13,14,18,30),"brown","ink")
            rect(d,(14,17,15,29),"brownlight")
            line(d,(14,23,9,19),"brown",2)
            for box,c in [((2,5,18,21),"greendark"),((13,5,30,22),"greendark"),((6,0,26,17),"green")]:ell(d,box,c,"ink")
            for x,y in [(8,7),(18,3),(23,12),(10,15)]:line(d,(x,y,x+3,y),"greenlight")
            ell(d,(7,27,24,31),(17,23,41,75))
        elif name=="palm":
            poly(d,[(15,7),(19,7),(17,30),(12,30)],"brown","ink")
            for y in (14,20,26):line(d,(14,y,17,y),"brownlight")
            for pts in [[(16,8),(7,1),(1,3),(11,9)],[(16,8),(26,0),(31,4),(21,9)],[(16,8),(31,11),(31,17),(20,12)],[(16,8),(4,10),(0,17),(11,13)]]:poly(d,pts,"green","greendark")
            ell(d,(13,8,17,12),"amberdark","ink")
        else:
            rect(d,(15,14,17,28),"brown","ink")
            ell(d,(6,5,24,19),"green","greendark")
            ell(d,(9,1,21,13),"green","ink")
            line(d,(11,5,16,4),"greenlight")
    elif name=="hedge":
        for x in (6,15,25):ell(d,(x-6,11,x+6,27),"green","greendark")
        for x in (3,13,22):rect(d,(x,15,x+3,16),"greenlight")
        rect(d,(1,28,30,30),"greendark","ink")
    elif name=="bench":
        rect(d,(3,11,28,20),"brownlight","ink")
        for y in (14,17):line(d,(4,y,27,y),"amberdark")
        rect(d,(1,20,30,24),"brownlight","ink")
        rect(d,(4,25,7,29),"navy","ink");rect(d,(24,25,27,29),"navy","ink")
        rect(d,(1,17,3,23),"navylight","ink");rect(d,(28,17,30,23),"navylight","ink")
    elif name=="lamp":
        rect(d,(14,8,17,28),"navylight","ink")
        rect(d,(10,28,21,30),"navy","ink")
        poly(d,[(8,8),(10,2),(21,2),(23,8)],"amber","ink")
        rect(d,(10,5,21,9),"amberlight","ink")
        line(d,(15,3,15,8),"amberdark")
        rect(d,(12,0,19,2),"navy","ink")
    elif name=="fountain":
        ell(d,(1,17,30,30),"grey","ink")
        ell(d,(3,18,28,25),"cyan","navy")
        rect(d,(14,6,17,21),"grey","ink")
        ell(d,(9,4,22,11),"greylight","ink")
        line(d,(16,3,16,0),"cyanlight",2)
        line(d,(11,10,8,14,8,19),"cyan",2);line(d,(20,10,23,14,23,19),"cyan",2)
        line(d,(5,23,10,23),"cyanlight");line(d,(20,21,25,21),"cyanlight")
    elif name=="mural":
        rect(d,(1,2,30,29),"violetdark","ink")
        rect(d,(3,4,28,27),"violet")
        for x,c,skin in [(8,"cyan","#ad7052"),(16,"amber","#e5b987"),(24,"coral","#81503e")]:
            ell(d,(x-3,8,x+3,14),skin,"ink")
            poly(d,[(x-3,16),(x+3,16),(x+5,24),(x-5,24)],c,"ink")
        line(d,(6,18,12,20,16,17,22,20,26,18),"white",2)
        rect(d,(4,5,10,5),"cyanlight");rect(d,(24,25,27,25),"amberlight")
    elif name in ("noticeboard","map_board","bus_stop","texture_booth"):
        rect(d,(4,3,27,24),"brown","ink")
        rect(d,(6,5,25,22),"navy" if name=="bus_stop" else "paper","ink")
        rect(d,(5,24,8,30),"brown","ink");rect(d,(23,24,26,30),"brown","ink")
        if name=="map_board":
            line(d,(9,7,11,12,21,13,18,20),"cyandark",2)
            line(d,(9,18,21,8),"coral")
            for x,y in [(11,12),(21,13),(18,20)]:ell(d,(x-1,y-1,x+1,y+1),"violetdark")
        elif name=="bus_stop":
            rect(d,(10,8,21,17),"cyan","ink")
            rect(d,(11,9,20,12),"navy");rect(d,(12,18,14,19),"white");rect(d,(18,18,20,19),"white")
        elif name=="texture_booth":
            for x,y,c in [(8,8,"violet"),(17,8,"coral"),(8,15,"cyan"),(17,15,"amber")]:rect(d,(x,y,x+6,y+5),c,"ink")
        else:
            for x,y,c in [(8,7,"amberlight"),(17,7,"white"),(10,15,"corallight")]:
                rect(d,(x,y,x+6,y+5),c,"grey");line(d,(x+1,y+2,x+4,y+2),"navylight")
    elif name in ("books","bookshelf","archive_cabinet"):
        if name=="books":
            for x,y,w,c in [(5,23,21,"violet"),(3,17,23,"coral"),(7,11,20,"cyan"),(5,6,17,"amber")]:
                rect(d,(x,y,x+w,y+4),c,"ink");rect(d,(x+2,y+1,x+w-2,y+2),"paper");rect(d,(x+1,y,x+2,y+4),c)
        elif name=="bookshelf":
            rect(d,(2,2,29,30),"brown","ink")
            for y in (4,13,22):
                rect(d,(4,y,27,y+6),"ink")
                for x,c,w in [(5,"violet",3),(9,"amber",4),(14,"cyan",3),(18,"coral",4),(23,"green",3)]:
                    rect(d,(x,y+1,x+w-1,y+6),c,"navy");rect(d,(x+1,y+2,x+1,y+3),"white")
            for y in (11,20,29):rect(d,(3,y,28,y+1),"brownlight")
        else:
            rect(d,(3,2,28,30),"navylight","ink")
            for y in (5,13,21):
                rect(d,(5,y,26,y+6),"navy","ink");rect(d,(13,y+2,19,y+3),"amber","ink");rect(d,(7,y+1,11,y+2),"paper")
            rect(d,(5,29,8,31),"ink");rect(d,(23,29,26,31),"ink")
    elif name in ("reading_desk","lab_table","dj_desk"):
        rect(d,(3,21,6,30),"navy","ink");rect(d,(25,21,28,30),"navy","ink")
        rect(d,(1,17,30,22),"brownlight" if name=="reading_desk" else "greylight" if name=="lab_table" else "navylight","ink")
        if name=="reading_desk":
            poly(d,[(7,11),(15,9),(23,11),(23,17),(15,15),(7,17)],"white","ink")
            line(d,(15,10,15,16),"brownlight")
            line(d,(9,13,12,12),"navylight");line(d,(18,12,21,13),"navylight")
        elif name=="lab_table":
            rect(d,(6,10,12,16),"cyan","ink");rect(d,(7,8,11,10),"cyanlight","ink")
            poly(d,[(21,7),(24,7),(24,10),(28,16),(17,16),(21,10)],"violetlight","ink")
            line(d,(21,13,25,13),"coral")
        else:
            rect(d,(4,11,27,18),"navy","ink")
            ell(d,(6,12,13,17),"grey","cyan");ell(d,(19,12,26,17),"grey","coral")
            for x,c in [(14,"amber"),(16,"cyan"),(18,"violetlight")]:rect(d,(x,13,x,15),c)
    elif name in ("document","evidence"):
        poly(d,[(7,2),(22,2),(26,6),(26,28),(7,28)],"white","ink")
        poly(d,[(22,2),(22,6),(26,6)],"paper","grey")
        for y in (9,12,15,18):line(d,(10,y,22-(y%3),y),"navylight")
        if name=="evidence":
            ell(d,(14,16,25,27),"cyan","ink");ell(d,(17,19,22,24),"white","cyandark")
            line(d,(23,25,29,30),"navy",3)
        else:rect(d,(10,22,16,25),"coral","ink")
    elif name=="portrait_frame":
        rect(d,(4,2,27,29),"amberdark","ink")
        rect(d,(6,4,25,27),"amberlight","ink")
        rect(d,(8,6,23,25),"violetdark")
        ell(d,(11,10,20,19),"#ad7052","ink")
        ell(d,(10,8,20,13),"ink")
        poly(d,[(10,21),(21,21),(23,25),(8,25)],"cyan")
    elif name=="globe":
        ell(d,(5,2,26,23),"cyan","navy",2)
        poly(d,[(9,5),(16,3),(17,8),(13,10),(15,14),(9,15),(7,10)],"green")
        poly(d,[(20,12),(24,13),(23,18),(18,21),(17,17)],"green")
        line(d,(6,13,26,13),"cyandark")
        line(d,(16,3,13,9,13,17,17,23),"cyandark")
        line(d,(25,3,28,9,28,20,21,26,16,26),"amberdark",2)
        rect(d,(14,25,17,29),"navy","ink");rect(d,(9,29,23,31),"amberdark","ink")
    elif name=="microscope":
        rect(d,(6,28,27,31),"navylight","ink")
        line(d,(22,27,25,21,24,15,20,12),"white",3)
        poly(d,[(12,4),(15,2),(24,13),(20,16)],"grey","ink")
        rect(d,(11,2,15,5),"navy","ink")
        rect(d,(18,14,21,19),"cyan","ink")
        rect(d,(8,22,24,24),"navy","ink")
        rect(d,(12,21,18,22),"cyanlight")
        line(d,(17,24,17,28),"grey",2)
        ell(d,(22,18,26,22),"amber","ink")
    elif name=="telescope":
        poly(d,[(5,11),(8,4),(25,11),(22,18)],"violet","ink")
        poly(d,[(5,11),(8,4),(11,5),(8,12)],"cyan","ink")
        rect(d,(23,13,28,16),"navy","ink")
        line(d,(17,17,17,26,8,30),"grey",2)
        line(d,(17,25,25,30),"grey",2)
    elif name=="terminal":
        rect(d,(4,3,27,21),"navy","ink")
        rect(d,(6,5,25,18),"cyandark","ink")
        for y,w,c in [(8,11,"cyanlight"),(11,15,"cyan"),(14,9,"amber")]:line(d,(9,y,w+8,y),c)
        rect(d,(14,21,17,25),"grey","ink")
        rect(d,(7,25,25,28),"navylight","ink")
        rect(d,(3,29,28,30),"darkgrey","ink")
        for x in range(6,26,3):rect(d,(x,29,x,29),"cyan")
    elif name=="projector":
        rect(d,(4,11,27,23),"grey","ink")
        rect(d,(6,12,21,14),"greylight")
        ell(d,(19,14,28,22),"navy","ink")
        ell(d,(22,16,26,20),"cyan","cyanlight")
        for x in (7,10,13):rect(d,(x,17,x,20),"navy")
        rect(d,(7,24,9,26),"ink");rect(d,(22,24,24,26),"ink")
        rect(d,(8,8,13,11),"navy","ink")
    elif name=="camera_tripod":
        rect(d,(5,4,25,15),"navylight","ink")
        rect(d,(9,2,15,5),"navy","ink")
        ell(d,(15,6,23,14),"cyan","ink")
        ell(d,(18,8,21,11),"navy")
        rect(d,(7,6,11,8),"amber")
        line(d,(16,16,16,27),"grey",2)
        line(d,(16,21,6,30),"navy",2);line(d,(16,21,26,30),"navy",2)
    elif name=="microphone":
        ell(d,(10,3,21,15),"greylight","ink")
        for y in (6,9,12):line(d,(12,y,19,y),"navy")
        rect(d,(14,14,17,26),"navy","ink")
        line(d,(16,23,8,29),"grey",2);line(d,(16,23,25,29),"grey",2)
        rect(d,(12,17,19,19),"coral","ink")
    elif name=="speaker":
        rect(d,(5,2,26,30),"navy","ink")
        rect(d,(7,3,24,5),"navylight")
        ell(d,(9,7,22,17),"violetdark","ink")
        ell(d,(13,10,18,14),"violetlight","ink")
        ell(d,(8,18,23,28),"cyandark","ink")
        ell(d,(12,21,19,26),"cyan","ink")
        rect(d,(8,29,10,31),"ink");rect(d,(21,29,23,31),"ink")
    elif name=="drums":
        ell(d,(8,13,25,30),"coral","ink")
        ell(d,(11,16,22,27),"white","coraldark")
        ell(d,(2,7,13,12),"amber","ink")
        ell(d,(20,4,30,9),"amber","ink")
        line(d,(7,12,7,26),"grey");line(d,(25,9,25,27),"grey")
        rect(d,(13,5,20,11),"coral","ink")
        ell(d,(13,4,20,7),"white","ink")
        line(d,(10,1,18,4),"brownlight");line(d,(23,0,16,4),"brownlight")
    elif name=="guitar":
        ell(d,(8,16,24,31),"amberdark","ink")
        ell(d,(10,12,23,25),"amber","ink")
        rect(d,(15,5,18,20),"brown","ink")
        rect(d,(14,1,19,6),"brownlight","ink")
        ell(d,(13,19,20,26),"navy","ink")
        line(d,(16,4,16,29),"paper");line(d,(18,4,18,29),"paper")
        rect(d,(13,28,21,29),"brown","ink")
    elif name=="keyboard":
        rect(d,(1,12,30,22),"navy","ink")
        rect(d,(3,14,28,20),"white")
        for x in range(6,28,4):line(d,(x,14,x,20),"grey")
        for x in (5,9,17,21,25):rect(d,(x,14,x+1,17),"ink")
        line(d,(7,23,24,30),"grey",2);line(d,(24,23,7,30),"grey",2)
        rect(d,(24,12,27,12),"coral")
    elif name in ("plant_pot","flowers"):
        poly(d,[(8,21),(24,21),(21,30),(11,30)],"coraldark","ink")
        rect(d,(7,19,25,22),"coral","ink")
        line(d,(16,18,16,6),"greendark",2)
        for x,y in [(9,13),(20,10),(12,5)]:
            ell(d,(x-3,y-2,x+3,y+2),"green","greendark")
            line(d,(x,y,16,y+3),"green")
        if name=="flowers":
            for x,y,c in [(10,8,"amber"),(21,6,"violetlight"),(15,2,"coral")]:star(d,x,y,c,3);rect(d,(x,y,x,y),"white")
    elif name=="street_banner":
        rect(d,(4,2,6,31),"grey","ink")
        poly(d,[(7,3),(25,3),(25,21),(16,27),(7,21)],"violet","ink")
        poly(d,[(12,9),(16,6),(21,10),(16,16)],"cyan","ink")
        line(d,(12,20,21,20),"amber")
    elif name=="market_stall":
        rect(d,(3,13,5,30),"brown","ink");rect(d,(26,13,28,30),"brown","ink")
        poly(d,[(5,3),(26,3),(31,13),(0,13)],"amber","ink")
        for x in (5,15,25):poly(d,[(x,3),(x+3,3),(x+4,13),(x-2,13)],"coral","ink")
        rect(d,(2,24,29,30),"brownlight","ink")
        for x,c in [(7,"green"),(15,"coral"),(22,"amber")]:ell(d,(x-3,18,x+3,24),c,"ink")
    elif name=="gate":
        rect(d,(1,4,5,31),"grey","ink");rect(d,(26,4,30,31),"grey","ink")
        poly(d,[(1,4),(4,0),(27,0),(30,4)],"violetdark","ink")
        rect(d,(5,9,26,12),"navylight","ink")
        for x in range(7,27,6):rect(d,(x,10,x+1,30),"navylight","ink")
        rect(d,(14,19,19,24),"amber","ink")
    elif name=="portal":
        ell(d,(4,0,27,30),"violetdark","ink",2)
        ell(d,(7,3,24,28),"violet","cyan")
        ell(d,(10,6,21,26),"navy","violetlight")
        line(d,(13,8,17,7,20,11),"cyanlight")
        line(d,(12,22,16,25,20,22),"cyan")
        for x,y,c in [(5,8,"amber"),(25,20,"coral"),(7,27,"cyan")]:star(d,x,y,c,2)
    elif name=="clue":
        ell(d,(8,5,23,25),"amber","ink")
        ell(d,(10,7,21,23),"amberlight","amberdark")
        rect(d,(14,10,17,16),"violetdark")
        rect(d,(14,19,17,21),"violetdark")
        star(d,5,4,"cyan",2);star(d,26,27,"cyanlight",2)
    elif name=="chest":
        rect(d,(4,13,27,29),"brown","ink")
        poly(d,[(4,13),(7,6),(24,6),(27,13)],"brownlight","ink")
        rect(d,(7,7,9,28),"amberdark","ink");rect(d,(22,7,24,28),"amberdark","ink")
        line(d,(4,17,27,17),"ink")
        rect(d,(13,15,18,22),"amber","ink")
        rect(d,(15,17,16,19),"navy")
        line(d,(10,9,20,9),"amberlight")
    elif name=="signpost":
        rect(d,(14,4,17,31),"brown","ink")
        poly(d,[(3,5),(24,5),(29,9),(24,13),(3,13)],"amber","ink")
        poly(d,[(27,15),(7,15),(2,19),(7,23),(27,23)],"cyan","ink")
        line(d,(7,9,20,9),"amberdark");line(d,(9,19,23,19),"cyandark")
    elif name=="footbridge":
        rect(d,(0,11,31,28),"brown","ink")
        for x in range(0,32,5):rect(d,(x,12,x+3,27),"brownlight","amberdark")
        for y in (8,28):rect(d,(0,y,31,y+2),"amberdark","ink")
        for x in (1,28):rect(d,(x,5,x+2,30),"brown","ink")
    elif name=="bin":
        poly(d,[(8,10),(24,10),(22,29),(10,29)],"cyandark","ink")
        rect(d,(7,7,25,11),"navy","ink")
        rect(d,(12,4,20,7),"navy","ink")
        line(d,(12,14,12,25),"cyan");line(d,(21,14,21,25),"greendark")
        poly(d,[(15,15),(19,18),(15,21)],"cyanlight")
    elif name=="coffee":
        ell(d,(4,24,28,29),"paper","ink")
        rect(d,(8,12,22,25),"white","ink")
        ell(d,(8,9,22,16),"brown","ink")
        ell(d,(10,10,20,13),"amberdark")
        ell(d,(22,14,28,22),(0,0,0,0),"white",2)
        line(d,(12,7,10,5,13,2),"paper");line(d,(19,7,21,5,19,1),"paper")
    elif name=="dialogue":
        poly(d,[(3,5),(28,5),(28,22),(16,22),(10,28),(10,22),(3,22)],"white","ink")
        for x in (9,16,23):ell(d,(x-1,12,x+1,14),"violet")
    elif name=="inclusive_flag":
        rect(d,(4,2,6,31),"grey","ink")
        rect(d,(7,3,27,20),"white","ink")
        for y,c in [(4,"coral"),(7,"amber"),(10,"green"),(13,"cyan"),(16,"violet")]:rect(d,(8,y,26,y+2),c)
    elif name=="charging_station":
        rect(d,(7,5,24,30),"navylight","ink")
        rect(d,(9,7,22,18),"navy","ink")
        poly(d,[(17,8),(12,14),(16,14),(14,18),(20,12),(16,12)],"cyan")
        rect(d,(10,22,21,26),"cyan","ink")
        line(d,(24,16,28,17,28,26,25,27),"amber",2)
        rect(d,(5,29,26,31),"navy","ink")
    elif name=="podium":
        poly(d,[(8,15),(24,15),(25,30),(7,30)],"violetdark","ink")
        poly(d,[(4,10),(23,6),(28,12),(9,17)],"violet","ink")
        line(d,(21,6,21,2,25,1),"navy",2)
        rect(d,(24,0,28,2),"grey","ink")
        star(d,16,23,"cyan",3)
    return im


def icon(name,accent="cyan",badge=False):
    im=empty();d=ImageDraw.Draw(im)
    if badge:
        ell(d,(1,1,30,30),"navy","ink")
        ell(d,(3,3,28,28),"violetdark",accent)
    c=accent
    if name=="inventory":
        rect(d,(7,7,25,27),"violet","ink")
        rect(d,(10,3,21,9),"violetdark","ink")
        rect(d,(11,14,21,23),c,"ink")
        line(d,(9,10,23,10),"violetlight")
        rect(d,(14,8,17,12),"amber","ink")
    elif name in ("journal","history"):
        rect(d,(7,4,25,28),"violet","ink")
        rect(d,(5,4,9,28),"violetdark","ink")
        rect(d,(11,6,23,26),"white","ink")
        for y in (10,14,18):line(d,(13,y,21,y),"navylight")
        rect(d,(19,5,21,11),c)
    elif name=="map":
        poly(d,[(3,7),(11,4),(21,7),(28,4),(28,25),(21,28),(11,25),(3,28)],"paper","ink")
        line(d,(11,5,11,25),"grey");line(d,(21,7,21,27),"grey")
        line(d,(7,21,12,13,20,17,24,11),"cyandark",2)
        ell(d,(18,13,23,18),"coral","ink")
    elif name in ("translate","language"):
        poly(d,[(3,5),(22,5),(22,19),(12,19),(7,24),(7,19),(3,19)],"violet","ink")
        poly(d,[(13,13),(29,13),(29,27),(24,27),(24,30),(20,27),(13,27)],c,"ink")
        line(d,(7,15,10,8,13,15),"white",2);line(d,(8,12,12,12),"white")
        line(d,(19,18,25,18),"navy");line(d,(22,16,22,23),"navy");line(d,(19,24,25,21),"navy")
    elif name in ("scan","curiosity","critical_thinking","clue"):
        ell(d,(5,4,22,21),c,"ink",2)
        ell(d,(8,7,19,18),"navy","cyanlight")
        line(d,(19,19,27,27),"navylight",4)
        line(d,(20,19,28,27),"white")
        if name=="clue":rect(d,(12,10,14,14),"amber");rect(d,(12,16,14,16),"amber")
        else:line(d,(10,11,12,9,16,9),"cyanlight")
    elif name=="source":
        poly(d,[(5,3),(21,3),(27,9),(27,27),(5,27)],"paper","ink")
        poly(d,[(21,3),(21,9),(27,9)],"grey","ink")
        for y in (11,15,19):line(d,(9,y,21,y),"navylight")
        line(d,(16,25,19,28,28,19),c,3)
    elif name=="timeline":
        line(d,(4,17,27,17),c,2)
        for x,y in [(6,11),(16,21),(26,9)]:
            line(d,(x,17,x,y),"grey")
            ell(d,(x-3,y-3,x+3,y+3),"amber","ink")
        rect(d,(3,25,9,26),"violet")
    elif name in ("shield","courage","care","repair"):
        poly(d,[(5,6),(16,2),(27,6),(26,19),(22,25),(16,30),(10,25),(6,19)],"navylight","ink")
        poly(d,[(8,8),(16,5),(24,8),(23,18),(16,26),(9,18)],c,"navy")
        line(d,(12,15,15,18,21,11),"white",2)
    elif name=="settings":
        for x,y in [(15,2),(25,7),(28,17),(24,26),(13,29),(4,23),(2,12),(6,4)]:rect(d,(x-2,y-2,x+2,y+2),"greylight","ink")
        ell(d,(5,5,27,27),"grey","ink");ell(d,(11,11,21,21),"navy",c)
    elif name in ("audio","listening"):
        poly(d,[(4,11),(10,11),(17,5),(17,27),(10,21),(4,21)],c,"ink")
        line(d,(21,10,24,13,24,19,21,22),"violetlight",2)
        line(d,(25,6,29,11,29,22,25,27),"white")
    elif name=="fullscreen":
        for pts in [[(4,12),(4,4),(12,4)],[(20,4),(28,4),(28,12)],[(4,20),(4,28),(12,28)],[(20,28),(28,28),(28,20)]]:line(d,pts,c,3)
    elif name in ("arrow","back"):
        poly(d,[(5,12),(19,12),(19,5),(29,16),(19,27),(19,20),(5,20)],c,"ink")
        if name=="back":im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    elif name in ("heart","inclusion"):
        poly(d,[(3,10),(6,5),(11,5),(16,10),(21,5),(26,5),(29,10),(28,17),(16,29),(4,17)],"coral","ink")
        line(d,(6,10,7,8,10,8),"corallight",2)
        if name=="inclusion":star(d,16,17,"amberlight",3)
    elif name in ("star","checkpoint"):
        poly(d,[(16,2),(20,11),(30,12),(23,19),(25,29),(16,24),(7,29),(9,19),(2,12),(12,11)],"amber","ink")
        line(d,(15,6,17,12,23,13),"amberlight")
    elif name in ("collaboration","connection"):
        for x,y,c1 in [(10,10,"cyan"),(23,11,"coral"),(16,23,"amber")]:ell(d,(x-4,y-4,x+4,y+4),c1,"ink")
        line(d,(10,14,13,19),"white",2);line(d,(23,15,19,19),"white",2);line(d,(14,10,19,10),"white",2)
    elif name=="culture":
        poly(d,[(5,8),(14,10),(14,21),(10,25),(6,21)],"amber","ink")
        poly(d,[(17,6),(27,4),(26,20),(22,23),(18,18)],"coral","ink")
        rect(d,(7,12,9,13),"navy");rect(d,(11,12,12,13),"navy")
        line(d,(8,18,11,20,13,18),"navy")
        rect(d,(19,9,21,10),"navy");rect(d,(24,8,25,9),"navy")
        line(d,(20,16,23,14,25,15),"navy")
    elif name=="science":
        line(d,(13,4,19,4),"white",2)
        poly(d,[(13,4),(19,4),(19,13),(27,25),(25,29),(7,29),(5,25),(13,13)],"cyanlight","ink")
        poly(d,[(10,19),(22,19),(26,25),(24,27),(8,27),(6,25)],"violet","ink")
        ell(d,(11,22,14,25),"coral");ell(d,(19,20,21,22),"cyan")
    elif name=="music":
        line(d,(12,9,25,5,25,22),c,3)
        line(d,(12,9,12,25),c,3)
        ell(d,(5,22,13,28),"coral","ink");ell(d,(18,19,26,25),"amber","ink")
    elif name=="voices":
        poly(d,[(4,5),(27,5),(27,20),(20,20),(16,27),(12,20),(4,20)],c,"ink")
        for x,h in [(9,4),(13,8),(17,11),(21,5)]:line(d,(x,12-h//2,x,12+h//2),"navy",2)
    return im


def effect(name):
    im=empty();d=ImageDraw.Draw(im)
    if name.startswith("spark_"):
        c=name.split("_",1)[1]
        star(d,16,16,c,10);star(d,6,5,c,3);star(d,26,27,c,2)
        rect(d,(13,13,19,19),"white");rect(d,(11,15,21,17),c)
    elif name=="scan":
        for pts in [[(3,10),(3,3),(10,3)],[(22,3),(29,3),(29,10)],[(3,22),(3,29),(10,29)],[(22,29),(29,29),(29,22)]]:line(d,pts,"cyan",2)
        line(d,(5,16,27,16),"cyanlight",2)
        for y in (11,21):line(d,(8,y,24,y),(89,217,221,90))
    elif name=="portal":
        for box,c in [((2,0,29,31),"violet"),((5,2,26,29),"cyan"),((9,6,22,25),"violetlight")]:ell(d,box,(0,0,0,0),c,2)
        star(d,4,5,"amberlight",2);star(d,27,25,"cyanlight",2)
    elif name=="ripple":
        for box,c in [((0,9,31,24),(89,217,221,100)),((4,11,27,22),(89,217,221,160)),((10,14,21,19),"cyanlight")]:ell(d,box,(0,0,0,0),c)
    elif name=="warning":
        poly(d,[(16,2),(30,28),(2,28)],"amber","ink")
        rect(d,(14,10,17,19),"navy");rect(d,(14,23,17,25),"navy")
    elif name in ("heart","shield","music","translate"):
        return icon(name,"cyan")
    elif name=="trail":
        for x,y,r,a in [(7,24,2,70),(12,19,3,110),(19,13,4,160),(25,6,5,230)]:ell(d,(x-r,y-r,x+r,y+r),(89,217,221,a))
    elif name=="burst":
        poly(d,[(16,0),(20,9),(28,4),(24,12),(31,16),(23,20),(28,28),(20,24),(16,31),(12,23),(4,28),(8,20),(0,16),(8,12),(4,4),(12,9)],"amber")
        ell(d,(9,9,23,23),"coral")
        star(d,16,16,"white",6)
    elif name=="confetti":
        for x,y,c in [(3,4,"coral"),(14,2,"cyan"),(25,5,"amber"),(7,13,"violetlight"),(20,15,"coral"),(29,23,"cyan"),(14,28,"amber"),(2,26,"violetlight")]:
            rect(d,(x,y,x+2,y+4),c);rect(d,(x,y,x,y+1),"white")
    elif name=="signal":
        ell(d,(13,23,18,28),"cyanlight")
        for pts in [[(9,20),(11,16),(20,16),(23,20)],[(5,15),(9,10),(23,10),(27,15)],[(1,10),(7,4),(25,4),(31,10)]]:line(d,pts,"cyan",2)
    return im


def sheet(cells,cols,rows):
    im=empty(cols*32,rows*32)
    for i,cell in enumerate(cells):im.alpha_composite(cell,((i%cols)*32,(i//cols)*32))
    return im


def validate():
    expected={}
    for name in CHARACTERS:
        expected[f"characters/{name}.png"]=(128,192)
        expected[f"characters/{name}-portrait.png"]=(288,96)
    for name in BOSSES:expected[f"characters/boss-{name}.png"]=(384,96)
    expected.update({"tilesets/tiles.png":(256,128),"tilesets/props.png":(384,128),"ui/icons.png":(256,64),"ui/badges.png":(256,64),"effects/effects.png":(256,64)})
    for rel,size in expected.items():
        with Image.open(OUT/rel) as im:
            assert im.size==size,(rel,im.size,size)
            assert im.mode=="RGBA",(rel,im.mode)
            alpha=im.getchannel("A")
            if rel!="tilesets/tiles.png":
                assert alpha.getextrema()[0]==0,f"{rel} has no transparent pixels"
                assert alpha.getextrema()[1]==255,f"{rel} has no opaque art"
            assert im.getbbox(),f"{rel} is empty"
    print(f"Validated {len(expected)} original RGBA sheets; all sprite transparency and dimensions correct.")


def create_preview():
    """One contact sheet for a quick art review; not used by the game engine."""
    preview=Image.new("RGBA",(960,810),color("outline"));d=ImageDraw.Draw(preview)
    for i,name in enumerate(CHARACTERS):
        x=10+(i%6)*158;y=10+(i//6)*168
        d.text((x,y),name,fill=color("white"))
        with Image.open(OUT/"characters"/f"{name}.png") as s:
            preview.alpha_composite(s.crop((0,0,32,32)).resize((64,64),Image.Resampling.NEAREST),(x,y+23))
        with Image.open(OUT/"characters"/f"{name}-portrait.png") as s:
            preview.alpha_composite(s.crop((0,0,96,96)),(x+60,y+52))
    for i,name in enumerate(BOSSES):
        x=10+i*158;y=354
        d.text((x,y),name,fill=color("white"))
        with Image.open(OUT/"characters"/f"boss-{name}.png") as s:
            preview.alpha_composite(s.crop((0,0,96,96)),(x+15,y+22))
    with Image.open(OUT/"tilesets"/"props.png") as s:
        preview.alpha_composite(s.resize((768,256),Image.Resampling.NEAREST),(10,484))
    for rel,x in [("ui/icons.png",10),("ui/badges.png",276),("effects/effects.png",542)]:
        with Image.open(OUT/rel) as s:preview.alpha_composite(s,(x,746))
    save(preview,"ui/art-preview.png")


def main():
    create_characters();create_bosses()
    save(sheet([tile(n,i) for i,n in enumerate(TILES)],8,4),"tilesets/tiles.png")
    save(sheet([prop(n) for n in PROPS],12,4),"tilesets/props.png")
    save(sheet([icon(n) for n in ICONS],8,2),"ui/icons.png")
    accents=["cyan","amber","coral","violetlight"]
    save(sheet([icon(n,accents[i%4],True) for i,n in enumerate(BADGES)],8,2),"ui/badges.png")
    save(sheet([effect(n) for n in EFFECTS],8,2),"effects/effects.png")
    # The manifest sits with the owned tileset files and is convenient to load.
    (OUT/"tilesets"/"manifest.json").write_text(json.dumps({"tileSize":32,"tiles":{n:i for i,n in enumerate(TILES)},"props":{n:i for i,n in enumerate(PROPS)},"icons":{n:i for i,n in enumerate(ICONS)},"badges":{n:i for i,n in enumerate(BADGES)},"effects":{n:i for i,n in enumerate(EFFECTS)},"characters":list(CHARACTERS),"bosses":BOSSES},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    validate()
    create_preview()


if __name__=="__main__":main()
