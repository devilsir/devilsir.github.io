#!/usr/bin/env python3
"""VOICES original world expansion. Reuses drawing helpers, never rebuilds old art.

Run: python tools/create_world_assets.py
Requires Pillow. Deterministic, offline, native pixel drawing with real RGBA.
"""
from pathlib import Path
import importlib.util
import json
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"
spec=importlib.util.spec_from_file_location("voices_pixel_source",ROOT/"tools"/"create_pixel_assets.py")
base=importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)
rect,ell,poly,line,star,empty,color = base.rect,base.ell,base.poly,base.line,base.star,base.empty,base.color

PEOPLE={
    "gardener":dict(skin="#bc8762",skinlight="#e1ad7e",skindark="#80593f",hair="#574031",hairlight="#8b6447",style="curls",coat="green",shirt="amberlight",pants="brown",accessory="zip",age="adult"),
    "vendor":dict(skin="#915d44",skinlight="#bd825b",skindark="#5f4235",hair="#382c3a",hairlight="#624550",style="bun",coat="coral",shirt="white",pants="navy",accessory="zip",age="adult"),
    "guide":dict(skin="#cb926a",skinlight="#edb58c",skindark="#956649",hair="#473d38",hairlight="#766154",style="short",coat="cyan",shirt="violetdark",pants="navy",accessory="backpack",age="adult"),
    "archivist":dict(skin="#e0b78e",skinlight="#f8d8ad",skindark="#a97f62",hair="#252934",hairlight="#515667",style="bob",coat="violetdark",shirt="paper",pants="darkgrey",accessory="glasses",age="adult"),
    "technician":dict(skin="#82543f",skinlight="#ad7954",skindark="#543a32",hair="#282a32",hairlight="#535660",style="short",coat="navylight",shirt="cyan",pants="navy",accessory="goggles",age="adult"),
    "teacher":dict(skin="#a56d51",skinlight="#d69b70",skindark="#71503e",hair="#332b33",hairlight="#61515a",style="curls",coat="cyandark",shirt="violetlight",pants="navy",accessory="glasses",age="adult"),
    "courier":dict(skin="#dba376",skinlight="#f4c294",skindark="#aa7353",hair="#693e31",hairlight="#a26945",style="bob",coat="amber",shirt="coraldark",pants="navy",accessory="strap",age="adult"),
    "elder":dict(skin="#865942",skinlight="#b98761",skindark="#5c4035",hair="#b7b4a7",hairlight="#e6dfc5",style="curls",coat="greendark",shirt="paper",pants="brown",accessory="scarf",age="adult"),
    "student2":dict(skin="#e6bda2",skinlight="#fbdcc1",skindark="#b48570",hair="#292435",hairlight="#554565",style="long",coat="violet",shirt="cyanlight",pants="navy",accessory="backpack",age="teen"),
    "percussionist":dict(skin="#b37850",skinlight="#dda374",skindark="#795039",hair="#332b33",hairlight="#654c47",style="long",coat="amberdark",shirt="cyan",pants="violetdark",accessory="headphones",age="adult"),
}
ANIMALS=["dog","cat","pigeon","bird","duck","butterfly"]
PROPS=["flowerbed","vegetablebed","awning","fruitcrate","cart","picnic","bicycle","mailbox","stacknewspapers","readingrug","armchair","wallclock","maptable","displaycase","recordplayer","musicstand","streetart","accessiblepath","pondedge","waterlily","pilescrolls","printingpress","solarpanel","antenna","serverrack","cablebox","projectboard","handwash","feedingbowl","nest","lantern","clothesline"]


def save(im,rel):
    path=OUT/rel;path.parent.mkdir(parents=True,exist_ok=True);im.save(path,optimize=True)


def occupational_sprite(name,row,frame):
    s=PEOPLE[name]
    direction=row if row<4 else 0
    state="walk" if row<4 else "interact" if row==4 else "celebrate"
    im=base.sprite(s,direction,frame,state);d=ImageDraw.Draw(im)
    b=1 if frame in (1,3) and row<4 else 0
    face=direction==0
    side=direction in (1,2)
    back=direction==3
    # Distinct occupation details preserve the original core frame registration.
    if name in ("gardener","vendor"):
        if face:
            poly(d,[(13,18+b),(18,18+b),(19,24),(12,24)],"brown" if name=="gardener" else "navy","ink")
            line(d,(13,18+b,12,16+b),"brownlight" if name=="gardener" else "navylight")
            line(d,(18,18+b,19,16+b),"brownlight" if name=="gardener" else "navylight")
            rect(d,(14,21,17,22),"amber" if name=="gardener" else "coral")
        elif back:line(d,(11,22,20,22),"brownlight" if name=="gardener" else "coral")
        else:
            x=12 if direction==1 else 18
            rect(d,(x,18+b,x+2,24),"brown" if name=="gardener" else "navy","ink")
        if row==4:
            if name=="gardener":
                line(d,(24,17,27,21),"brownlight",2)
                poly(d,[(25,20),(29,19),(30,23),(27,25)],"grey","ink")
            else:
                rect(d,(24,15,28,19),"amber","ink");rect(d,(25,16,27,17),"green")
    if name=="guide":
        if face:
            rect(d,(18,18+b,20,20+b),"amber","ink")
            rect(d,(10,22,12,23),"violetdark")
        if row==4:
            poly(d,[(21,11),(25,10),(29,12),(29,17),(25,15),(21,17)],"paper","ink")
            line(d,(23,14,27,12),"cyandark")
    if name=="archivist" and row==4:
        poly(d,[(21,10),(27,10),(29,12),(29,17),(21,17)],"paper","ink")
        line(d,(23,12,26,12),"navylight");line(d,(23,14,27,14),"navylight")
        rect(d,(27,10,27,13),"coral")
    if name=="technician":
        rect(d,(11,23,20,24),"amberdark","ink")
        rect(d,(12,22,14,25),"coral","ink");rect(d,(18,22,20,25),"grey","ink")
        if row==4:
            line(d,(25,18,25,11),"grey",2)
            line(d,(23,9,23,12,27,12,27,9),"greylight")
    if name=="teacher":
        if face:
            line(d,(13,17+b,16,20,19,17+b),"amber")
            rect(d,(14,20,17,23),"white","ink");rect(d,(15,21,16,21),"cyan")
        if row==4:
            rect(d,(22,10,28,17),"violet","ink");rect(d,(24,11,27,15),"white")
    if name=="courier":
        # Compact cycling helmet and reflective stripe, not a costume.
        if direction==0:
            ell(d,(9,2+b,22,7+b),"coral","ink")
            for x in (12,16,20):rect(d,(x,3+b,x+1,4+b),"navy")
        elif back:
            ell(d,(9,2+b,22,8+b),"coral","ink");line(d,(11,4+b,20,4+b),"corallight")
        else:
            ell(d,(9,2+b,23,7+b),"coral","ink");line(d,(12,3+b,20,3+b),"corallight")
        if direction==0:rect(d,(11,19,20,20),"amberlight")
        if direction==3:rect(d,(11,17+b,20,25),"coraldark","ink");rect(d,(13,19,18,21),"amberlight")
        if row==4:
            rect(d,(21,11,29,18),"brownlight","ink")
            rect(d,(24,11,25,17),"amberlight");rect(d,(22,14,24,16),"paper")
    if name=="elder":
        # Cane is an ordinary mobility aid; celebration keeps the same identity.
        x=5 if direction in (0,1) else 26
        line(d,(x,22,x,30),"brownlight",2)
        line(d,(x,22,x+3,21),"brownlight",2)
        if face:rect(d,(13,19+b,13,19+b),"amber");rect(d,(19,20+b,19,20+b),"amber")
    if name=="student2" and face:
        rect(d,(11,19+b,13,21+b),"cyan","ink")
        if row==4:
            rect(d,(22,10,27,17),"cyan","ink");rect(d,(24,11,26,15),"white")
    if name=="percussionist":
        if face:
            rect(d,(9,23,11,24),"cyan");rect(d,(20,23,22,24),"coral")
        if row==4:
            line(d,(23,14,28,8),"brownlight",2)
            line(d,(26,14,29,10),"amberlight")
    return im


def occupational_portrait(name,expression):
    im=base.portrait(PEOPLE[name],expression)
    # Keep the same 2x pixel grid as all existing portraits.
    small=im.resize((48,48),Image.Resampling.NEAREST);d=ImageDraw.Draw(small)
    if name in ("gardener","vendor"):
        c="brown" if name=="gardener" else "navy"
        poly(d,[(20,36),(28,36),(31,47),(17,47)],c,"ink")
        line(d,(20,36,17,34),"brownlight" if name=="gardener" else "coral")
        line(d,(28,36,31,34),"brownlight" if name=="gardener" else "coral")
        rect(d,(21,40,27,44),"amber" if name=="gardener" else "coral","ink")
        if name=="gardener":
            poly(d,[(22,40),(25,37),(27,40),(25,42)],"greenlight","greendark")
    elif name=="guide":
        rect(d,(31,37,35,42),"amber","ink")
        star(d,33,39,"white",1)
        rect(d,(11,41,16,46),"navy","ink")
    elif name=="archivist":
        rect(d,(30,39,35,44),"paper","ink")
        line(d,(31,40,34,40),"violet")
        rect(d,(31,43,34,43),"coral")
    elif name=="technician":
        rect(d,(15,43,33,45),"amberdark","ink")
        rect(d,(16,42,20,47),"coral","ink")
        line(d,(28,38,28,47),"grey",2)
        line(d,(26,36,26,39,30,39,30,36),"greylight")
    elif name=="teacher":
        line(d,(19,35,24,40,29,35),"amber")
        rect(d,(21,41,28,47),"white","ink")
        rect(d,(22,42,27,44),"cyan")
        line(d,(22,46,27,46),"navy")
    elif name=="courier":
        ell(d,(11,3,37,13),"coral","ink")
        line(d,(15,5,31,5),"corallight")
        for x in (17,24,31):rect(d,(x,7,x+2,9),"navy")
        line(d,(13,20,17,31),"coraldark")
        line(d,(35,20,31,31),"coraldark")
        rect(d,(12,39,35,41),"amberlight")
        line(d,(17,34,35,47),"coraldark",2)
    elif name=="elder":
        line(d,(16,25,18,25),PEOPLE[name]["skindark"])
        line(d,(30,25,32,25),PEOPLE[name]["skindark"])
        line(d,(20,32,23,34,26,34,29,32),PEOPLE[name]["skindark"])
        rect(d,(14,40,15,41),"amber");rect(d,(33,41,34,42),"amber")
    elif name=="student2":
        rect(d,(13,39,17,42),"cyan","ink")
        rect(d,(14,40,16,40),"cyanlight")
    elif name=="percussionist":
        line(d,(12,42,18,36),"brownlight",2)
        line(d,(32,44,36,36),"amberlight",2)
        rect(d,(13,45,17,46),"cyan")
    return small.resize((96,96),Image.Resampling.NEAREST)


def animal(name,frame):
    im=empty();d=ImageDraw.Draw(im)
    step=[0,1,0,-1][frame];b=[0,-1,0,1][frame]
    if name=="dog":
        ell(d,(5,26,28,30),(17,23,41,62))
        line(d,(8,18,4,15,3,11+step),"brown",3)
        ell(d,(7,14+b,24,24+b),"amberlight","ink")
        ell(d,(9,15+b,16,22+b),"brown")
        for x,y in [(9+step,23),(18-step,23)]:
            rect(d,(x,y,x+2,27),"amberlight","ink");rect(d,(x-1,27,x+3,28),"white","ink")
        ell(d,(19,8+b,29,20+b),"amberlight","ink")
        ell(d,(19,8+b,23,18+b),"brown","ink")
        rect(d,(25,14+b,30,18+b),"amberlight","ink")
        rect(d,(28,14+b,30,15+b),"ink")
        rect(d,(25,11+b,26,12+b),"ink")
        rect(d,(25,11+b,25,11+b),"white")
        line(d,(26,18+b,28,18+b),"brown")
        poly(d,[(20,19+b),(25,19+b),(22,24+b)],"cyan","ink")
        rect(d,(10,16+b,12,16+b),"white")
    elif name=="cat":
        ell(d,(5,26,28,29),(17,23,41,58))
        line(d,(9,19,4,17,3,9+step,6,7+step),"grey",3)
        ell(d,(7,16+b,25,24+b),"grey","ink")
        rect(d,(8+step,22,10+step,27),"grey","ink");rect(d,(20-step,22,22-step,27),"grey","ink")
        rect(d,(8+step,27,12+step,28),"white","ink");rect(d,(19-step,27,23-step,28),"white","ink")
        poly(d,[(19,12+b),(19,6+b),(24,10+b),(28,6+b),(30,12+b)],"grey","ink")
        ell(d,(19,9+b,30,20+b),"grey","ink")
        poly(d,[(20,10+b),(20,7+b),(23,10+b)],"coral")
        poly(d,[(27,10+b),(28,7+b),(29,10+b)],"coral")
        rect(d,(22,13+b,23,14+b),"greenlight");rect(d,(27,13+b,28,14+b),"greenlight")
        rect(d,(23,13+b,23,14+b),"ink");rect(d,(27,13+b,27,14+b),"ink")
        rect(d,(25,16+b,26,16+b),"coral")
        line(d,(19,17+b,23,17+b),"white");line(d,(28,17+b,31,17+b),"white")
        line(d,(10,18+b,12,20+b),"darkgrey");line(d,(15,17+b,17,19+b),"darkgrey")
    elif name=="pigeon":
        ell(d,(7,25,26,28),(17,23,41,50))
        line(d,(13+step,23,12+step,27,15+step,27),"coral")
        line(d,(20-step,23,19-step,27,22-step,27),"coral")
        poly(d,[(6,19+b),(1,22+b),(11,23+b)],"darkgrey","ink")
        ell(d,(7,13+b,23,25+b),"grey","ink")
        ell(d,(17,8+b,27,18+b),"grey","ink")
        poly(d,[(19,15+b),(25,14+b),(24,20+b),(18,19+b)],"violet","ink")
        line(d,(20,16+b,23,16+b),"cyan")
        ell(d,(9,15+b,19,22+b),"darkgrey","ink")
        line(d,(11,18+b,17,18+b),"greylight")
        poly(d,[(26,12+b),(31,14+b),(26,15+b)],"amberdark","ink")
        rect(d,(24,11+b,25,12+b),"ink");rect(d,(24,11+b,24,11+b),"corallight")
    elif name=="bird":
        # Wings change silhouette across all four frames.
        ell(d,(10,16+b,23,25+b),"cyan","ink")
        poly(d,[(12,23+b),(5,27+b),(8,21+b)],"cyandark","ink")
        ell(d,(18,11+b,28,21+b),"cyan","ink")
        poly(d,[(27,16+b),(31,18+b),(27,19+b)],"amber","ink")
        rect(d,(24,14+b,25,15+b),"ink");rect(d,(24,14+b,24,14+b),"white")
        ell(d,(17,20+b,24,25+b),"amberlight")
        wing=[[(14,19),(4,15),(2,18),(12,24)],[(14,19),(8,7),(5,5),(4,12)],[(14,19),(8,13),(5,16),(12,23)],[(14,19),(7,24),(5,30),(12,26)]][frame]
        poly(d,[(x,y+b) for x,y in wing],"cyandark","ink")
        line(d,((wing[0][0],wing[0][1]+b),(wing[1][0],wing[1][1]+b)),"cyanlight")
    elif name=="duck":
        ell(d,(4,26,28,29),(17,23,41,54))
        rect(d,(11+step,25,15+step,27),"amber","ink");rect(d,(19-step,25,23-step,27),"amber","ink")
        ell(d,(5,14+b,25,26+b),"paper","ink")
        poly(d,[(5,18+b),(1,14+b),(3,22+b),(9,24+b)],"white","ink")
        ell(d,(13,16+b,22,22+b),"white","grey")
        ell(d,(20,7+b,29,17+b),"greendark","ink")
        rect(d,(22,15+b,26,18+b),"green","ink")
        line(d,(22,16+b,26,16+b),"white")
        poly(d,[(27,12+b),(31,13+b),(31,16+b),(27,16+b)],"amber","ink")
        rect(d,(25,10+b,26,11+b),"ink");rect(d,(25,10+b,25,10+b),"white")
    elif name=="butterfly":
        width=[10,6,2,7][frame]
        # Symmetric wing panels and contrasting eyespots make the silhouette legible.
        ell(d,(15-width,7+b,15,18+b),"violet","ink")
        ell(d,(16,7+b,16+width,18+b),"violet","ink")
        ell(d,(16-width,16+b,15,26+b),"coral","ink")
        ell(d,(16,16+b,15+width,26+b),"coral","ink")
        if width>3:
            ell(d,(17-width,10+b,20-width,14+b),"amberlight","cyan")
            ell(d,(12+width,10+b,15+width,14+b),"amberlight","cyan")
            rect(d,(18-width,20+b,20-width,21+b),"corallight")
            rect(d,(12+width,20+b,14+width,21+b),"corallight")
        rect(d,(15,12+b,16,24+b),"ink")
        line(d,(15,12+b,12,8+b),"ink");line(d,(16,12+b,19,8+b),"ink")
        rect(d,(15,12+b,16,13+b),"cyanlight")
    return im


def prop(name):
    im=empty();d=ImageDraw.Draw(im)
    if name in ("flowerbed","vegetablebed"):
        poly(d,[(2,13),(24,9),(30,14),(8,20)],"brown","ink")
        poly(d,[(2,13),(8,20),(8,29),(2,24)],"amberdark","ink")
        poly(d,[(8,20),(30,14),(30,23),(8,29)],"brownlight","ink")
        line(d,(9,25,29,19),"brown");line(d,(9,22,28,17),"amberlight")
        for x,y in [(7,13),(14,12),(22,10),(15,16),(24,15)]:
            line(d,(x,y,x,y-4),"greendark",2)
            if name=="flowerbed":
                star(d,x,y-5,["coral","amber","violetlight"][(x+y)%3],2);rect(d,(x,y-5,x,y-5),"white")
            else:
                poly(d,[(x-3,y-3),(x-1,y-5),(x,y-3),(x+2,y-5),(x+3,y-2)],"green","ink")
                poly(d,[(x-1,y),(x+1,y),(x,y+3)],"coral")
    elif name=="awning":
        rect(d,(3,12,5,30),"brown","ink");rect(d,(26,12,28,30),"brown","ink")
        poly(d,[(6,3),(25,3),(31,13),(0,13)],"cyanlight","ink")
        for x in (6,16,26):poly(d,[(x,3),(x+3,3),(x+4,13),(x-2,13)],"violet","ink")
        for x,c in [(1,"cyanlight"),(6,"violet"),(11,"cyanlight"),(16,"violet"),(21,"cyanlight"),(26,"violet")]:
            rect(d,(x,13,x+4,17),c,"ink")
        line(d,(7,4,23,4),"white")
    elif name=="fruitcrate":
        rect(d,(3,13,28,29),"brownlight","ink")
        for y in (17,23):line(d,(4,y,27,y),"brown",2)
        rect(d,(5,15,7,27),"amberdark");rect(d,(25,15,27,27),"amberdark")
        for x,y,c in [(8,13,"coral"),(15,10,"greenlight"),(24,13,"amber"),(18,15,"coral")]:
            ell(d,(x-4,y-4,x+4,y+3),c,"ink");line(d,(x,y-4,x+1,y-6),"greendark")
            rect(d,(x-2,y-2,x-1,y-2),"white")
        rect(d,(11,24,20,27),"paper","ink");line(d,(13,25,18,25),"navylight")
    elif name=="cart":
        ell(d,(5,23,13,31),"navy","ink");ell(d,(22,23,30,31),"navy","ink")
        ell(d,(8,26,10,28),"grey");ell(d,(25,26,27,28),"grey")
        rect(d,(4,13,29,25),"amberdark","ink")
        rect(d,(5,14,28,17),"brownlight")
        for x in (8,14,20,26):line(d,(x,18,x,24),"brown")
        line(d,(5,16,1,9,0,9),"grey",2)
        for x,y,c in [(10,12,"coral"),(19,10,"green"),(25,12,"amber")]:ell(d,(x-3,y-3,x+3,y+2),c,"ink")
    elif name=="picnic":
        poly(d,[(8,9),(27,9),(31,28),(0,28)],"paper","ink")
        for y in (11,18,25):line(d,(4,y,29,y),"coral",2)
        for x in (8,16,24):line(d,(x,10,x-2,27),"coral",2)
        rect(d,(10,14,20,22),"brownlight","ink")
        ell(d,(10,11,20,18),None,"amberdark",2)
        rect(d,(23,13,26,22),"cyandark","ink");rect(d,(24,11,25,13),"navy")
        ell(d,(4,20,10,25),"white","navy");ell(d,(6,21,8,23),"amber")
    elif name=="bicycle":
        ell(d,(1,17,13,29),None,"ink",2);ell(d,(18,17,30,29),None,"ink",2)
        ell(d,(3,19,11,27),None,"greylight");ell(d,(20,19,28,27),None,"greylight")
        line(d,(7,23,13,12,20,23,7,23,17,23,22,12,24,23),"coral",2)
        line(d,(13,12,22,12),"coral",2)
        line(d,(12,12,11,9,7,9),"navy",2)
        line(d,(22,13,23,7,28,7),"grey",2)
        rect(d,(8,7,13,9),"navy","ink")
        ell(d,(15,21,19,25),"amber","ink")
        line(d,(17,23,15,26,12,26),"grey")
    elif name=="mailbox":
        rect(d,(14,15,17,29),"navylight","ink");rect(d,(9,29,22,31),"navy","ink")
        ell(d,(6,3,25,16),"coral","ink")
        rect(d,(6,10,25,18),"coral","ink")
        rect(d,(8,12,22,14),"navy","ink")
        rect(d,(10,13,19,17),"paper","ink");line(d,(11,14,15,16,18,14),"grey")
        line(d,(25,10,25,3,29,3),"amber",2)
        rect(d,(26,2,30,5),"amber","ink")
        line(d,(9,6,19,6),"corallight")
    elif name=="stacknewspapers":
        for x,y,c in [(2,23,"greylight"),(4,18,"paper"),(3,12,"white"),(5,6,"paper")]:
            rect(d,(x,y,x+23,y+5),c,"ink")
            line(d,(x+2,y+1,x+20,y+1),"grey")
            line(d,(x+2,y+3,x+10,y+3),"navylight")
        rect(d,(7,8,13,11),"navy");line(d,(16,8,25,8),"coraldark");line(d,(16,10,23,10),"navylight")
        line(d,(15,6,15,28),"brownlight",2)
    elif name=="readingrug":
        rect(d,(1,9,30,28),"violetdark","ink")
        rect(d,(3,11,28,26),"violet","amber")
        for x in range(3,30,3):line(d,(x,7,x,9),"amber");line(d,(x,28,x,30),"amber")
        poly(d,[(5,15),(13,12),(21,15),(21,23),(13,20),(5,23)],"white","ink")
        line(d,(13,13,13,21),"brownlight")
        line(d,(7,17,11,15),"grey");line(d,(16,16,19,17),"grey")
        ell(d,(22,12,29,20),"coral","ink")
    elif name=="armchair":
        ell(d,(6,3,25,18),"coral","ink")
        rect(d,(6,10,25,25),"coral","ink")
        rect(d,(9,7,22,17),"corallight","coraldark")
        rect(d,(3,15,8,26),"coraldark","ink");rect(d,(23,15,28,26),"coraldark","ink")
        rect(d,(9,19,22,26),"coral","ink")
        line(d,(11,20,20,20),"corallight")
        rect(d,(5,27,8,30),"brown","ink");rect(d,(23,27,26,30),"brown","ink")
    elif name=="wallclock":
        ell(d,(3,3,28,28),"amberdark","ink",2)
        ell(d,(6,6,25,25),"white","amber")
        for x,y in [(16,8),(23,16),(16,23),(8,16)]:rect(d,(x,y,x+1,y+1),"navy")
        line(d,(16,16,16,10),"navy",2);line(d,(16,16,21,18),"navy",2)
        ell(d,(14,14,18,18),"coral","ink")
        line(d,(16,16,12,21),"coral")
    elif name=="maptable":
        rect(d,(3,19,6,30),"brown","ink");rect(d,(25,19,28,30),"brown","ink")
        poly(d,[(5,7),(26,7),(31,20),(0,20)],"brownlight","ink")
        poly(d,[(7,9),(24,9),(27,18),(4,18)],"paper","ink")
        line(d,(8,12,12,15,20,12,23,16),"cyandark",2)
        line(d,(13,9,15,12,13,17),"coral")
        for x,y in [(12,15),(20,12),(23,16)]:rect(d,(x,y,x+1,y+1),"violet")
        rect(d,(1,20,30,22),"amberdark","ink")
    elif name=="displaycase":
        rect(d,(3,6,28,28),"navylight","ink")
        rect(d,(5,8,26,23),"cyandark","navy")
        line(d,(7,9,16,9),"cyanlight")
        line(d,(20,10,24,14),"cyan")
        rect(d,(7,21,24,24),"paper","ink")
        poly(d,[(11,21),(12,15),(10,12),(13,10),(18,10),(20,13),(18,16),(19,21)],"amber","ink")
        line(d,(14,12,17,12),"amberlight")
        rect(d,(5,28,8,31),"navy","ink");rect(d,(23,28,26,31),"navy","ink")
    elif name=="recordplayer":
        rect(d,(2,13,29,29),"brown","ink")
        rect(d,(4,14,27,24),"brownlight","ink")
        poly(d,[(3,13),(5,3),(27,3),(29,13)],"amberdark","ink")
        poly(d,[(6,12),(7,5),(25,5),(27,12)],"navy","ink")
        ell(d,(6,14,21,24),"ink","grey")
        ell(d,(10,17,17,21),"violet","ink")
        rect(d,(13,19,14,19),"amber")
        line(d,(25,16,25,20,19,22),"greylight",2)
        rect(d,(22,26,25,27),"cyan","ink")
    elif name=="musicstand":
        poly(d,[(5,5),(27,5),(25,19),(7,19)],"navy","ink")
        rect(d,(8,6,23,17),"paper","ink")
        for y in (9,12,15):line(d,(10,y,21,y),"grey")
        line(d,(15,8,15,13,12,14),"violet",2);line(d,(21,11,21,15,18,16),"coral")
        line(d,(16,20,16,27),"grey",2)
        line(d,(16,26,6,30),"navy",2);line(d,(16,26,26,30),"navy",2)
    elif name=="streetart":
        rect(d,(1,3,30,28),"navy","ink")
        rect(d,(3,5,28,26),"violetdark")
        poly(d,[(5,20),(12,8),(16,15),(23,7),(27,23)],"cyan","ink")
        poly(d,[(5,20),(12,8),(15,14),(12,22)],"coral","ink")
        poly(d,[(16,16),(23,7),(26,17),(22,24)],"amber","ink")
        star(d,20,15,"white",3)
        line(d,(5,24,26,24),"violetlight")
        rect(d,(7,29,10,31),"coral","ink");rect(d,(12,28,15,31),"cyan","ink")
    elif name=="accessiblepath":
        poly(d,[(8,3),(25,3),(31,29),(0,29)],"greylight","ink")
        for y in (8,14,20,26):line(d,(6,y,27,y),"grey")
        poly(d,[(2,27),(10,1),(12,1),(5,29)],"amber","ink")
        poly(d,[(24,1),(26,1),(31,27),(28,29)],"amber","ink")
        rect(d,(11,9,22,24),"cyandark","ink")
        ell(d,(14,10,17,13),"white")
        line(d,(16,14,16,18,21,18,23,22),"white",2)
        ell(d,(12,16,20,24),None,"white")
    elif name=="pondedge":
        poly(d,[(0,1),(10,4),(20,1),(31,7),(31,31),(0,31)],"cyandark","ink")
        poly(d,[(0,1),(10,4),(20,1),(31,7),(31,14),(23,11),(14,10),(8,13),(0,10)],"greendark","ink")
        line(d,(0,12,8,15,15,12,23,13,31,16),"cyanlight")
        for x,y in [(4,19),(20,25),(12,30)]:line(d,(x,y,x+6,y),"cyan")
        ell(d,(3,5,8,10),"grey","ink");ell(d,(17,4,22,9),"greylight","ink")
    elif name=="waterlily":
        ell(d,(2,12,29,29),"green","greendark")
        poly(d,[(16,19),(31,22),(28,29)],"cyandark")
        line(d,(4,21,15,18),"greenlight");line(d,(10,27,16,19),"greenlight")
        for box in [(8,10,17,23),(14,8,23,22),(6,15,18,24),(14,15,25,24)]:ell(d,box,"pink","violetdark")
        ell(d,(10,13,22,24),"corallight","coral")
        ell(d,(14,17,19,21),"amberlight","amber")
    elif name=="pilescrolls":
        for x,y,w in [(3,23,24),(6,15,20),(4,8,23)]:
            rect(d,(x,y,x+w,y+5),"paper","ink")
            ell(d,(x-2,y-1,x+3,y+6),"white","ink")
            ell(d,(x+w-2,y-1,x+w+3,y+6),"white","ink")
            rect(d,(x+7,y,x+9,y+5),"coraldark","ink")
            line(d,(x+13,y+2,x+w-3,y+2),"brownlight")
        rect(d,(12,7,15,13),"violet","ink")
    elif name=="printingpress":
        rect(d,(4,27,28,31),"brown","ink")
        rect(d,(6,2,9,27),"navy","ink");rect(d,(23,2,26,27),"navy","ink")
        rect(d,(5,2,27,5),"amberdark","ink")
        rect(d,(14,0,17,16),"grey","ink")
        for y in range(1,15,3):line(d,(14,y,17,y),"darkgrey")
        line(d,(10,8,22,8),"brownlight",2)
        rect(d,(9,15,24,18),"navylight","ink")
        rect(d,(8,22,25,25),"brownlight","ink")
        rect(d,(11,20,22,22),"paper","ink")
        line(d,(13,21,19,21),"violetdark")
        ell(d,(0,18,6,24),"navylight","ink");ell(d,(2,20,4,22),"amber")
    elif name=="solarpanel":
        poly(d,[(7,3),(29,3),(24,24),(2,24)],"navy","ink")
        poly(d,[(8,5),(27,5),(23,22),(4,22)],"cyandark","cyan")
        for y in (10,16):line(d,(6,y,26,y),"cyan")
        for x in (13,20):line(d,(x,5,x-4,22),"cyan")
        line(d,(7,6,12,6),"cyanlight")
        line(d,(9,25,9,29,4,29),"grey",2);line(d,(22,25,22,29,28,29),"grey",2)
        star(d,28,1,"amberlight",2)
    elif name=="antenna":
        rect(d,(14,18,17,29),"grey","ink")
        rect(d,(9,29,23,31),"navy","ink")
        poly(d,[(7,7),(27,19),(20,23),(13,21),(9,17)],"greylight","ink")
        line(d,(7,7,27,19),"white",2)
        line(d,(17,15,22,7),"grey",2)
        ell(d,(20,5,24,9),"cyan","ink")
        line(d,(23,3,25,1,28,2),"cyan")
        line(d,(25,6,29,5,31,7),"cyan")
    elif name=="serverrack":
        rect(d,(4,1,27,30),"navylight","ink")
        for y in (4,10,16,22):
            rect(d,(6,y,25,y+4),"navy","ink")
            for x in (9,12,15):line(d,(x,y+1,x,y+3),"grey")
            rect(d,(21,y+1,22,y+2),"cyan" if y%12==4 else "amber")
            rect(d,(24,y+1,24,y+2),"coral")
        line(d,(5,2,25,2),"greylight")
        rect(d,(6,30,9,31),"ink");rect(d,(22,30,25,31),"ink")
    elif name=="cablebox":
        rect(d,(8,5,25,24),"navylight","ink")
        rect(d,(10,7,23,18),"navy","ink")
        for x,c in [(13,"cyan"),(17,"coral"),(21,"amber")]:
            rect(d,(x,11,x+1,13),c,"ink")
            line(d,(x+1,18,x+1,24,x-3,28,x-8,28),c,2)
        rect(d,(11,20,14,22),"cyan","ink");rect(d,(18,20,21,22),"coral","ink")
        rect(d,(26,6,28,9),"grey","ink")
    elif name=="projectboard":
        rect(d,(2,3,29,24),"grey","ink")
        rect(d,(4,5,27,22),"white","ink")
        for x,y,c in [(6,7,"coral"),(18,7,"amber"),(10,15,"cyan"),(21,15,"violetlight")]:
            rect(d,(x,y,x+5,y+4),c,"ink");line(d,(x+1,y+2,x+4,y+2),"navylight")
        line(d,(12,9,17,9),"navy");line(d,(9,12,12,14),"navy");line(d,(22,12,24,14),"navy")
        rect(d,(5,25,8,31),"navy","ink");rect(d,(23,25,26,31),"navy","ink")
    elif name=="handwash":
        rect(d,(6,19,25,29),"greylight","ink")
        rect(d,(4,14,27,22),"white","ink")
        ell(d,(7,15,24,21),"cyan","grey")
        line(d,(17,15,17,6,22,6,22,10),"grey",3)
        line(d,(17,7,21,7),"white")
        line(d,(22,11,22,15),"cyanlight")
        rect(d,(7,9,11,15),"coral","ink");rect(d,(8,7,10,9),"white","ink")
        rect(d,(11,27,20,31),"grey","ink")
    elif name=="feedingbowl":
        ell(d,(3,13,28,27),"cyandark","ink")
        ell(d,(3,10,28,22),"cyan","ink")
        ell(d,(6,12,25,19),"brown","navy")
        for x,y in [(9,14),(15,13),(22,14),(13,17),(19,17)]:rect(d,(x,y,x+1,y+1),"amber")
        line(d,(8,23,17,23),"cyanlight")
        # A tiny paw on the bowl makes its purpose readable.
        ell(d,(21,21,24,24),"cyanlight");rect(d,(20,20,20,20),"cyanlight");rect(d,(23,19,23,19),"cyanlight")
    elif name=="nest":
        ell(d,(3,15,29,29),"brown","ink")
        ell(d,(5,14,27,25),"amberdark","ink")
        ell(d,(7,15,25,23),"brown","ink")
        for x,y,c in [(11,16,"white"),(18,15,"cyanlight"),(23,18,"paper")]:
            ell(d,(x-3,y-4,x+2,y+3),c,"grey");rect(d,(x-1,y-2,x,y-1),"white")
        for pts in [(4,19,12,25),(7,24,22,27),(14,26,27,22),(3,25,10,27),(21,26,28,25)]:line(d,pts,"brownlight")
    elif name=="lantern":
        ell(d,(1,1,30,31),(239,183,78,40))
        ell(d,(6,0,25,12),None,"navy",2)
        rect(d,(7,8,24,27),"navy","ink")
        rect(d,(10,11,21,24),"amber","ink")
        rect(d,(13,12,18,23),"amberlight")
        line(d,(15,10,15,25),"amberdark")
        rect(d,(5,7,26,10),"navylight","ink");rect(d,(5,26,26,29),"navylight","ink")
        rect(d,(9,29,22,31),"navy","ink")
    elif name=="clothesline":
        rect(d,(1,3,3,31),"brown","ink");rect(d,(28,3,30,31),"brown","ink")
        line(d,(3,5,14,7,28,5),"paper")
        for x,y,c in [(5,7,"coral"),(14,9,"cyan"),(23,7,"amber")]:
            poly(d,[(x-2,y+1),(x,y),(x+2,y+1),(x+4,y+3),(x+2,y+5),(x+2,y+12),(x-2,y+12),(x-2,y+5),(x-4,y+3)],c,"ink")
            rect(d,(x,y-1,x,y+1),"brownlight")
            line(d,(x-1,y+4,x-1,y+9),"white")
    return im


def make_preview():
    im=Image.new("RGBA",(1000,800),color("outline"));d=ImageDraw.Draw(im)
    for i,name in enumerate(PEOPLE):
        x=10+(i%5)*198;y=12+(i//5)*166
        d.text((x,y),name,fill=color("white"))
        with Image.open(OUT/"characters"/f"{name}.png") as s:
            im.alpha_composite(s.crop((0,0,32,32)).resize((64,64),Image.Resampling.NEAREST),(x,y+23))
            im.alpha_composite(s.crop((0,32,32,64)).resize((48,48),Image.Resampling.NEAREST),(x+10,y+97))
        with Image.open(OUT/"characters"/f"{name}-portrait.png") as s:
            im.alpha_composite(s.crop((0,0,96,96)),(x+72,y+34))
    d.text((10,348),"ANIMALS / 4 FRAMES EACH",fill=color("white"))
    with Image.open(OUT/"characters"/"animals.png") as s:
        for i,name in enumerate(ANIMALS):
            x=10+i*160
            d.text((x,370),name,fill=color("white"))
            im.alpha_composite(s.crop((0,i*32,32,i*32+32)).resize((80,80),Image.Resampling.NEAREST),(x+10,390))
    d.text((10,478),"32 WORLD OBJECTS / IDs 0-31",fill=color("white"))
    with Image.open(OUT/"tilesets"/"world-props.png") as s:
        for i,name in enumerate(PROPS):
            x=10+(i%8)*123;y=502+(i//8)*72
            tile=s.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32))
            im.alpha_composite(tile.resize((56,56),Image.Resampling.NEAREST),(x+22,y))
            d.text((x,y+56),f"{i} {name}",fill=color("white"))
    save(im,"ui/world-preview.png")


def validate():
    expected={}
    for name in PEOPLE:
        expected[f"characters/{name}.png"]=(128,192)
        expected[f"characters/{name}-portrait.png"]=(288,96)
    expected.update({"characters/animals.png":(128,192),"tilesets/world-props.png":(256,128)})
    for rel,size in expected.items():
        with Image.open(OUT/rel) as im:
            assert im.size==size,(rel,im.size,size)
            assert im.mode=="RGBA",(rel,im.mode)
            assert im.getchannel("A").getextrema()==(0,255),(rel,"alpha")
            assert im.getbbox(),(rel,"empty")
    for i,name in enumerate(ANIMALS):
        with Image.open(OUT/"characters"/"animals.png") as im:
            assert len({im.crop((f*32,i*32,f*32+32,i*32+32)).tobytes() for f in range(4)})>=3,(name,"animation")
    print(f"Validated {len(expected)} new original sheets:10 NPCs +10 portraits +6 animals +32 props.")


def main():
    for name in PEOPLE:
        sheet=empty(128,192)
        for row in range(6):
            for frame in range(4):sheet.alpha_composite(occupational_sprite(name,row,frame),(frame*32,row*32))
        save(sheet,f"characters/{name}.png")
        portraits=empty(288,96)
        for i,expression in enumerate(("neutral","happy","concerned")):
            portraits.alpha_composite(occupational_portrait(name,expression),(96*i,0))
        save(portraits,f"characters/{name}-portrait.png")
    animals=empty(128,192)
    for row,name in enumerate(ANIMALS):
        for frame in range(4):animals.alpha_composite(animal(name,frame),(frame*32,row*32))
    save(animals,"characters/animals.png")
    props=empty(256,128)
    for i,name in enumerate(PROPS):props.alpha_composite(prop(name),((i%8)*32,(i//8)*32))
    save(props,"tilesets/world-props.png")
    manifest={
        "name":"VOICES original pixel world expansion","version":1,"tileSize":32,
        "npcSprite":{"pattern":"assets/characters/{id}.png","width":128,"height":192,"cellWidth":32,"cellHeight":32,"columns":4,"rows":{"down":0,"left":1,"right":2,"up":3,"interaction":4,"celebration":5},"idleColumn":0},
        "npcPortrait":{"pattern":"assets/characters/{id}-portrait.png","width":288,"height":96,"cellWidth":96,"cellHeight":96,"columns":{"neutral":0,"happy":1,"concerned":2}},
        "characters":list(PEOPLE),
        "animals":{"file":"assets/characters/animals.png","width":128,"height":192,"cellWidth":32,"cellHeight":32,"frames":4,"rows":{name:i for i,name in enumerate(ANIMALS)},"crop":"sx=frame*32;sy=row*32"},
        "props":{"file":"assets/tilesets/world-props.png","width":256,"height":128,"cellWidth":32,"cellHeight":32,"columns":8,"rows":4,"ids":{name:i for i,name in enumerate(PROPS)},"crop":"sx=(id%8)*32;sy=Math.floor(id/8)*32"},
        "preview":"assets/ui/world-preview.png","source":"tools/create_world_assets.py",
        "authoring":"Original deterministic Pillow pixel drawing. Base sprite helper import only; old sheets are never regenerated or overwritten. Real alpha. Contemporary respectful appearance and occupations.",
    }
    (OUT/"tilesets"/"world-manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    validate();make_preview()


if __name__=="__main__":main()
