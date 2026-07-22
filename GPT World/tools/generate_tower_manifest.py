#!/usr/bin/env python3
"""Gera o manifesto estático da Torre da Carne a partir dos WebPs regionais.

O jogo continua totalmente estático. A ferramenta valida todas as imagens,
mede alfa/cor e separa superfícies repetíveis, transições, bordas e cenário.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import shutil
import unicodedata
from collections import Counter, deque
from pathlib import Path
from statistics import median

from PIL import Image


REGION_THEMES = {
    "regiao_01_glacial": "medula-congelada",
    "regiao_02_floresta_ancestral": "pulmao-fungico",
    "regiao_03_vulcanica": "estomago-da-forja",
    "regiao_04_montanhosa": "ossario-da-lei",
    "regiao_05_selva_tropical": "figado-parasita",
    "regiao_06_vale_outonal": "gordura-dourada",
    "regiao_07_costa_oceanica": "pulmao-afogado",
    "regiao_08_cavernas_cristalinas": "sistema-nervoso-cristalino",
    "regiao_09_pantano_sombrio": "coracao-necrosado",
    "regiao_10_reino_arcano": "cerebro-arcano",
}


def normalized(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.lower())
    return " ".join(re.sub(r"[^a-z0-9]+", " ", value.encode("ascii", "ignore").decode()).split())


def has_any(text: str, words: tuple[str, ...]) -> bool:
    """Compatibilidade com a classificação v1; não usar em regras visuais."""
    return any(word in text for word in words)


def has_phrase(text: str, phrases: tuple[str, ...] | set[str]) -> bool:
    padded = f" {normalized(text)} "
    return any(f" {normalized(phrase)} " in padded for phrase in phrases)


BASE_SURFACE_SOURCES = {
    "piso de gelo", "piso de neve", "piso de floresta", "terreno florido", "pedra rachada",
    "rocha vulcanica", "piso de pedra", "piso pedregoso", "piso de selva", "terreno tropical",
    "piso outonal", "terreno campestre", "plantacao irrigada", "plantacao outonal", "trigo e feno",
    "areia e agua", "beira mar", "rocha costeira", "piso de caverna", "piso de pantano",
    "palafita sombria", "ilha flutuante", "jardim arcano", "vortice arcano", "plataforma arcana",
}
ALWAYS_HAZARD_SOURCES = {
    "lago congelado", "agua da floresta", "lava borbulhante", "piso de lava", "rio de lava",
    "agua tropical", "agua subterranea", "lago cristalino", "agua arcana",
}
MIXED_HAZARD_SOURCES = {
    "areia e agua", "beira mar", "rocha costeira", "terreno campestre", "plantacao irrigada",
    "palafita sombria", "ruina do cemiterio", "vortice arcano", "plataforma arcana",
}
TRANSITION_SOURCES = {
    "margem gelada", "beira mar", "rocha costeira", "penhasco com musgo", "penhasco musgoso",
    "penhasco gelado", "penhasco rochoso", "penhasco vulcanico", "agua tropical", "rio de lava",
    "lago cristalino", "cachoeira da floresta", "cachoeira tropical", "ilha flutuante", "palafita sombria",
}
PATH_ASSET_ALLOWLIST: set[str] = set()
ROLE_OVERRIDES = {
    "piso de neve 002": ("path", "vertical"),
    "piso de neve 003": ("path", "t-junction"),
}

PRESENTATION_VERSION = 1
TINY_WORDS = ("flor", "erva", "folha", "graveto", "concha", "osso", "detalhe", "fragmento", "entulho", "muda", "broto")
SMALL_WORDS = ("arbusto", "placa", "caixa", "caixote", "barril", "balde", "banco", "lanterna", "ferramenta", "cogumelo", "poste", "feno")
LARGE_WORDS = ("arvore", "pinheiro", "palmeira", "cristal grande", "obelisco", "estatua", "totem", "coluna", "rocha grande")
ARCHITECTURE_WORDS = ("casa", "castelo", "fortaleza", "templo", "mausoleu", "biblioteca", "torre", "cabana", "palafita", "mercado", "fazenda", "celeiro", "porto", "ruina", "estrutura")


def infer_scale_class(text: str, category: str, building: bool, wall: bool) -> str:
    if building or has_phrase(text, ARCHITECTURE_WORDS):
        return "architecture"
    if wall:
        return "large"
    if has_phrase(text, LARGE_WORDS):
        return "large"
    if has_phrase(text, TINY_WORDS):
        return "tiny"
    if has_phrase(text, SMALL_WORDS):
        return "small"
    if category in {"prop", "structure"}:
        return "medium"
    return "small" if category == "decoration" else "medium"


def infer_presentation(
    name: str,
    csv_category: str,
    width: int,
    height: int,
    bounds: tuple[int, int, int, int],
    metrics: dict,
    semantics: dict,
) -> dict:
    """Build world-space presentation values from semantics, not canvas size."""
    text = normalized(f"{name} {csv_category}")
    bx, by, bw, bh = bounds
    scale_class = infer_scale_class(text, semantics["category"], semantics["building"], semantics["wall"])
    class_height = {"tiny": 38, "small": 64, "medium": 100, "large": 154, "architecture": 224}[scale_class]

    # A few semantic families need stronger silhouettes than their source-file
    # dimensions suggest. These are class rules, not per-file hand placement.
    if has_phrase(text, ("arvore", "pinheiro", "palmeira")):
        class_height = 168
    elif has_phrase(text, ("cristal", "obelisco")):
        class_height = 126 if scale_class != "large" else 158
    elif has_phrase(text, ("placa", "poste")):
        class_height = 72
    elif has_phrase(text, ("rocha", "pedra")):
        class_height = 86 if scale_class != "large" else 136
    elif semantics["altar"]:
        class_height = 132
    elif semantics["building"]:
        class_height = 230
        if has_phrase(text, ("castelo", "fortaleza", "templo", "torre", "mausoleu")):
            class_height = 270
        elif has_phrase(text, ("cabana", "tenda", "mercado")):
            class_height = 204

    aspect = bw / max(1, bh)
    if scale_class == "architecture" and aspect > 1.8:
        class_height *= 0.88
    if scale_class in {"tiny", "small"} and aspect < 0.48:
        class_height *= 1.08
    recommended = round(clamp_number(class_height, 28, 330), 1)
    random_range = {"tiny": (.94, 1.06), "small": (.95, 1.06), "medium": (.95, 1.05), "large": (.97, 1.04), "architecture": (1, 1)}[scale_class]
    allows_random = scale_class != "architecture" and not semantics["altar"]
    minimum = round(recommended * random_range[0], 1)
    maximum = round(recommended * random_range[1], 1)

    ground_anchor = metrics.get("groundAnchor") or [round(bx + bw / 2, 1), by + bh]
    primary_bounds = metrics.get("primaryBounds") or [bx, by, bw, bh]
    baseline_offset = round(max(0, by + bh - ground_anchor[1]), 2)
    world_scale = recommended / max(1, bh)
    anchor_bias_x = (ground_anchor[0] - (bx + bw / 2)) * world_scale

    collision_w, collision_h = semantics["footprint"]
    visual_w = max(10, min(260, bw * world_scale * (0.72 if scale_class == "architecture" else .58)))
    visual_h = max(5, min(90, recommended * (.2 if scale_class == "architecture" else .12)))
    if semantics["collision"] == "none":
        collision_w = collision_h = 0
    else:
        collision_w = max(12, min(220, collision_w * world_scale if collision_w else visual_w * .72))
        collision_h = max(8, min(82, collision_h * world_scale if collision_h else visual_h))

    built_in_shadow = bool(metrics.get("hasBuiltInShadow", False))
    flat = semantics["terrain"] or semantics["watercraft"] or semantics["category"] == "path"
    shadow_opacity = 0 if flat else .08 if built_in_shadow else .16 if semantics["category"] == "decoration" else .24
    shadow_width = 0 if flat else max(10, visual_w * (.78 if built_in_shadow else 1))
    shadow_height = 0 if flat else max(3, visual_h * (.46 if scale_class == "architecture" else .58))

    return {
        "presentationVersion": PRESENTATION_VERSION,
        "groundAnchor": [round(float(ground_anchor[0]), 2), round(float(ground_anchor[1]), 2)],
        "primaryBounds": [round(float(value), 2) for value in primary_bounds],
        "anchorOffsetX": 0, "anchorOffsetY": 0,
        "baselineOffset": baseline_offset,
        "recommendedWorldHeight": recommended,
        "minimumWorldHeight": minimum,
        "maximumWorldHeight": maximum,
        "scaleClass": scale_class,
        "shadowWidth": round(shadow_width, 1),
        "shadowHeight": round(shadow_height, 1),
        "shadowOffsetY": round(max(0, baseline_offset * world_scale), 1),
        "shadowOpacity": round(shadow_opacity, 3),
        "hasBuiltInShadow": built_in_shadow,
        "collisionOffsetX": round(anchor_bias_x * .35, 1),
        "collisionOffsetY": round(-collision_h * .12, 1) if collision_h else 0,
        "collisionFootprint": [round(collision_w, 1), round(collision_h, 1)],
        "visualFootprint": [round(visual_w, 1), round(visual_h, 1)],
        "sortOffsetY": 0,
        "allowsRandomScale": allows_random,
        "randomScaleRange": [random_range[0], random_range[1]],
        "detachedAlphaRatio": round(float(metrics.get("detachedAlphaRatio", 0)), 4),
    }


def clamp_number(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def slug(value: str) -> str:
    return normalized(value).replace(" ", "-") or "sem-grupo"


def infer_composition(text: str) -> str:
    groups = (
        ("port", ("barco", "porto", "cais", "doca", "recife", "praia")),
        ("cemetery", ("cemiterio", "mausoleu", "ossos", "osso", "sepultura", "macabro")),
        ("mine", ("mina", "trilho", "ferramenta", "forja")),
        ("farm", ("fazenda", "rural", "trigo", "feno", "plantacao", "mercado")),
        ("laboratory", ("arcano", "biblioteca", "maquina", "mana", "plataforma")),
        ("temple", ("templo", "altar", "pedestal", "totem", "portal")),
        ("fortress", ("fortaleza", "castelo", "muralha", "torre", "fortificacao")),
        ("settlement", ("casa", "aldeia", "cabana", "tenda", "palafita")),
        ("cave", ("caverna", "cristal", "estalag", "subterranea")),
        ("forest", ("floresta", "selva", "arvore", "vegetacao", "cogumelo")),
        ("ruins", ("ruina", "entulho", "coluna", "estatua")),
    )
    for group, words in groups:
        if has_phrase(text, words):
            return group
    return "natural"


def infer_semantics(
    name: str,
    csv_category: str,
    width: int,
    height: int,
    bounds: tuple[int, int, int, int],
    metrics: dict,
    theme: str,
) -> dict:
    text = normalized(f"{name} {csv_category}")
    source = normalized(csv_category or re.sub(r"\s+\d+$", "", name))

    # Estes campos v1 permanecem deliberadamente idênticos para não alterar a
    # sequência procedural, a geometria ou a compatibilidade de saves.
    is_floor = has_any(text, ("piso", "terreno", "chao", "grama", "neve", "areia e agua"))
    is_path = has_any(text, ("estrada", "trilha", "caminho", "trilho", "rua", "ponte", "escadaria", "escada", "passarela"))
    is_surface_hazard = has_any(text, ("agua", "lava", "rio", "lago", "mar ", "oceano", "abismo", "vazio", "fosso"))
    is_cliff = has_any(text, ("penhasco", "precipicio", "margem", "parede", "muro", "barreira", "rochedo"))
    is_bridge = has_any(text, ("ponte", "passarela"))
    is_door = has_any(text, ("porta", "entrada", "portal", "escadaria", "escada"))
    is_building = has_any(text, (
        "casa", "castelo", "fortaleza", "templo", "mausoleu", "biblioteca", "mina ", "edificio",
        "torre", "cabana", "palafita", "mercado", "fazenda", "celeiro", "porto", "estrutura tribal",
        "estrutura rural", "laboratorio", "oficina", "forja", "tenda", "construcao", "ruina",
    ))
    is_wall = is_cliff or has_any(text, ("cerca", "grade", "portao", "muralha", "coluna"))
    is_tree = has_any(text, ("arvore", "tronco", "palmeira", "pinheiro"))
    is_large_prop = is_tree or has_any(text, ("cristal", "rocha", "pedra", "estatua", "obelisco", "maquina", "altar", "totem", "coluna"))
    is_decor = has_any(text, (
        "vegetacao", "arbusto", "flor", "cogumelo", "fruta", "planta", "objeto", "entulho", "ossos",
        "osso", "arma quebrada", "ferramenta", "caixa", "barril", "carroca", "lanterna", "concha",
        "recife", "tesouro", "banco", "poste", "placa", "feno", "trigo", "cultivo", "detalhe",
    ))
    is_boat = has_any(text, ("barco", "navio", "canoa"))
    is_dock = has_any(text, ("cais", "porto", "doca"))
    is_altar = "altar" in text or "pedestal" in text
    is_hazard = (is_surface_hazard or is_cliff) and not is_bridge

    if is_floor or (is_surface_hazard and not is_building):
        category = "terrain"
        layer = "surface" if is_surface_hazard else "base"
    elif is_path or is_bridge:
        category = "path"
        layer = "path"
    elif is_building:
        category = "structure"
        layer = "structure"
    elif is_wall:
        category = "wall"
        layer = "structure"
    elif is_large_prop:
        category = "prop"
        layer = "structure"
    else:
        category = "decoration"
        layer = "low"

    if is_door or is_bridge or (is_path and not is_cliff):
        collision = "none"
    elif is_surface_hazard:
        collision = "hazard"
    elif is_building or is_wall:
        collision = "solid"
    elif is_tree or is_large_prop:
        collision = "footprint"
    else:
        collision = "none"

    bx, by, bw, bh = bounds
    visible_area = max(1, bw * bh)
    full_area = max(1, width * height)
    alpha_fill = round(visible_area / full_area, 4)
    footprint_w = round(max(10, min(bw * (0.72 if is_building else 0.42), 190)), 1)
    footprint_h = round(max(8, min(bh * (0.25 if is_building else 0.16), 72)), 1)
    if collision == "none":
        footprint_w = footprint_h = 0

    weight = 1
    if category == "terrain": weight = 6
    elif category == "decoration": weight = 5
    elif category == "prop": weight = 3
    elif category == "path": weight = 4
    elif category == "structure": weight = 2
    if width > 320 or height > 320: weight = max(1, weight - 1)

    radius = 0
    if category == "structure": radius = int(max(2, min(7, math.ceil(max(bw, bh) / 95))))
    elif collision != "none": radius = int(max(1, min(4, math.ceil(max(footprint_w, footprint_h) / 62))))

    # Taxonomia visual v2: frases completas evitam falsos positivos como
    # "rio" dentro de "cemiterio" ou "sombrio".
    visual_path = has_phrase(text, ("estrada", "trilha", "caminho", "trilho", "rua", "passarela"))
    if source == "ferramenta e trilho":
        visual_path = normalized(name) in PATH_ASSET_ALLOWLIST
    visual_bridge = has_phrase(text, ("ponte", "passarela"))
    visual_cliff = has_phrase(text, ("penhasco", "precipicio", "parede", "muro", "muralha", "rochedo"))
    visual_shore = source in TRANSITION_SOURCES or has_phrase(text, ("margem", "beira mar", "costa", "cachoeira"))
    surface_candidate = source in BASE_SURFACE_SOURCES or source in ALWAYS_HAZARD_SOURCES or source in MIXED_HAZARD_SOURCES
    aspect = bw / max(1, bh)
    geometric_full_tile = (
        surface_candidate and 0.72 <= aspect <= 1.38 and bw >= 54 and bh >= 54
        and metrics["alphaCoverage"] >= 0.58 and metrics["visibleFill"] >= 0.84
    )
    visual_hazard = geometric_full_tile and (
        source in ALWAYS_HAZARD_SOURCES
        or (source in MIXED_HAZARD_SOURCES and metrics["blueRatio"] >= 0.16)
    )
    visual_base = geometric_full_tile and not visual_hazard
    irregular_patch = surface_candidate and not geometric_full_tile
    visual_transition = source in TRANSITION_SOURCES or (
        geometric_full_tile and 0.08 < metrics["blueRatio"] < 0.52 and source in MIXED_HAZARD_SOURCES
    )

    if geometric_full_tile and visual_transition:
        tile_role, surface_mode = "transition", "full"
    elif visual_hazard:
        tile_role, surface_mode = "hazard", "full"
    elif visual_base:
        tile_role, surface_mode = "base", "full"
    elif visual_bridge:
        tile_role, surface_mode = "bridge", "linear"
    elif visual_path:
        tile_role, surface_mode = "path", "linear"
    elif visual_cliff or visual_shore:
        tile_role = "boundary" if not visual_transition else "transition"
        surface_mode = "edge"
    elif is_building:
        tile_role, surface_mode = "structure", "structure"
    elif is_large_prop or is_wall:
        tile_role, surface_mode = "prop", "prop"
    elif irregular_patch:
        tile_role = "transition" if visual_transition else "decoration"
        surface_mode = "irregular-patch"
    else:
        tile_role, surface_mode = "decoration", "decoration"

    role_override = ROLE_OVERRIDES.get(normalized(name))
    if role_override:
        tile_role, forced_connection = role_override
        surface_mode = "full" if geometric_full_tile else "linear"
        visual_transition = True
    else:
        forced_connection = None

    if visual_shore: edge_role = "shore"
    elif visual_cliff: edge_role = "cliff"
    elif is_wall: edge_role = "wall"
    elif visual_transition: edge_role = "terrain-transition"
    else: edge_role = "none"

    if tile_role in {"path", "bridge", "boundary", "transition"}:
        if aspect >= 1.45: connection_type = "horizontal"
        elif aspect <= 0.68: connection_type = "vertical"
        elif geometric_full_tile: connection_type = "omnidirectional"
        else: connection_type = "unknown"
    else:
        connection_type = "omnidirectional" if geometric_full_tile else "none"
    if forced_connection:
        connection_type = forced_connection

    variant_group = slug(source)
    variant_match = re.search(r"(\d+)$", normalized(name))
    variation_index = int(variant_match.group(1)) if variant_match else 1
    repeat_mode = "tile" if geometric_full_tile else "edge" if surface_mode == "edge" else "overlay" if surface_mode == "irregular-patch" else "none"
    minimum_patch_size = 9 if tile_role in {"base", "hazard"} else 4 if tile_role == "transition" else 1
    texture_inset = 0
    if geometric_full_tile:
        texture_inset = round(min(0.28, max(0.14, 0.15 + metrics["centerEdgeDelta"] * 0.55)), 3)

    semantics = {
        "category": category, "layer": layer, "collision": collision,
        "footprint": [footprint_w, footprint_h], "weight": weight, "minClearRadius": radius,
        "repeat": category in {"terrain", "path", "decoration"} and not is_building,
        "touchPath": is_door or is_building or is_dock or is_altar,
        "terrain": category == "terrain", "wall": category == "wall" or is_cliff,
        "building": is_building, "entrance": is_door, "decoration": category == "decoration",
        "hazard": is_hazard, "bridge": is_bridge, "watercraft": is_boat, "dock": is_dock,
        "altar": is_altar, "alphaFill": alpha_fill,
        "alphaCoverage": metrics["alphaCoverage"], "visibleFill": metrics["visibleFill"],
        "edgeCoverage": metrics["edgeCoverage"], "blueRatio": metrics["blueRatio"],
        "dominantColor": metrics["dominantColor"], "centerEdgeDelta": metrics["centerEdgeDelta"],
        "oppositeEdgeMismatch": metrics["oppositeEdgeMismatch"], "seamRisk": metrics["seamRisk"],
        "textureInset": texture_inset, "variantGroup": variant_group, "variationIndex": variation_index,
        "surfaceMode": surface_mode, "tileRole": tile_role, "edgeRole": edge_role,
        "connectionType": connection_type,
        "canRotate": bool(role_override) or (geometric_full_tile and not visual_transition) or normalized(name) in PATH_ASSET_ALLOWLIST,
        "canMirror": geometric_full_tile or (surface_mode == "irregular-patch" and not is_building),
        "repeatMode": repeat_mode, "isFullTile": geometric_full_tile, "isIrregularPatch": irregular_patch,
        "isTransition": visual_transition, "isCliff": visual_cliff, "isShore": visual_shore,
        "visualFamily": f"{theme}:{variant_group}", "minimumPatchSize": minimum_patch_size,
        "compatibleWith": [], "compositionSet": infer_composition(text),
    }
    semantics.update(infer_presentation(name, csv_category, width, height, bounds, metrics, semantics))
    return semantics


def alpha_bounds(image: Image.Image, threshold: int = 8) -> tuple[int, int, int, int]:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    bbox = alpha.getbbox()
    if not bbox:
        return 0, 0, image.width, image.height
    left, top, right, bottom = bbox
    return left, top, right - left, bottom - top


def primary_component_metrics(image: Image.Image, bounds: tuple[int, int, int, int], threshold: int = 8) -> dict:
    """Estimate the physical body and support line while ignoring particles.

    Eight-neighbour components prevent detached snow, sparks, smoke, reflected
    pixels and tiny decorative fragments from redefining the prop baseline.
    """
    rgba = image.convert("RGBA")
    bx, by, bw, bh = bounds
    if bw <= 0 or bh <= 0:
        return {"primaryBounds": [bx, by, max(1, bw), max(1, bh)], "groundAnchor": [bx, by], "detachedAlphaRatio": 0, "hasBuiltInShadow": False}
    pixels = rgba.load()
    mask = bytearray(bw * bh)
    total = 0
    for local_y in range(bh):
        for local_x in range(bw):
            if pixels[bx + local_x, by + local_y][3] > threshold:
                mask[local_y * bw + local_x] = 1
                total += 1
    if not total:
        return {"primaryBounds": [bx, by, bw, bh], "groundAnchor": [bx + bw / 2, by + bh], "detachedAlphaRatio": 0, "hasBuiltInShadow": False}

    visited = bytearray(len(mask))
    components = []
    neighbours = (-bw - 1, -bw, -bw + 1, -1, 1, bw - 1, bw, bw + 1)
    for start, opaque in enumerate(mask):
        if not opaque or visited[start]:
            continue
        visited[start] = 1
        queue = deque([start])
        area = alpha_sum = light_sum = 0
        min_x = max_x = start % bw
        min_y = max_y = start // bw
        while queue:
            index = queue.popleft()
            x, y = index % bw, index // bw
            red, green, blue, alpha = pixels[bx + x, by + y]
            area += 1; alpha_sum += alpha; light_sum += (red + green + blue) / 3
            min_x = min(min_x, x); max_x = max(max_x, x); min_y = min(min_y, y); max_y = max(max_y, y)
            for delta in neighbours:
                nxt = index + delta
                if nxt < 0 or nxt >= len(mask) or visited[nxt] or not mask[nxt]:
                    continue
                nx, ny = nxt % bw, nxt // bw
                if abs(nx - x) > 1 or abs(ny - y) > 1:
                    continue
                visited[nxt] = 1
                queue.append(nxt)
        component_w, component_h = max_x - min_x + 1, max_y - min_y + 1
        components.append({
            "seed": start, "area": area, "x": min_x, "y": min_y, "w": component_w, "h": component_h,
            "bottom": max_y, "avgAlpha": alpha_sum / max(1, area), "avgLight": light_sum / max(1, area),
        })

    def looks_like_shadow(component: dict) -> bool:
        aspect = component["w"] / max(1, component["h"])
        return (
            component["bottom"] >= bh * .76 and aspect >= 2.25 and component["h"] <= max(6, bh * .2)
            and component["avgLight"] < 92 and component["area"] >= max(8, total * .008)
        )

    shadows = [component for component in components if looks_like_shadow(component)]
    bodies = [component for component in components if component not in shadows]
    primary = max(bodies or components, key=lambda component: component["area"] * (1 + component["h"] / max(1, bh) * .18))

    # Revisit only the selected component to obtain a stable bottom support
    # median without retaining every pixel from every component in memory.
    support_start = max(primary["y"], primary["bottom"] - max(2, round(primary["h"] * .09)))
    support_x = []
    component_seen = bytearray(len(mask))
    component_seen[primary["seed"]] = 1
    queue = deque([primary["seed"]])
    while queue:
        index = queue.popleft()
        x, y = index % bw, index // bw
        if y >= support_start:
            support_x.append(x)
        for delta in neighbours:
            nxt = index + delta
            if nxt < 0 or nxt >= len(mask) or component_seen[nxt] or not mask[nxt]:
                continue
            nx, ny = nxt % bw, nxt // bw
            if abs(nx - x) > 1 or abs(ny - y) > 1:
                continue
            component_seen[nxt] = 1
            queue.append(nxt)
    support_x.sort()
    anchor_x = bx + (support_x[len(support_x) // 2] if support_x else primary["x"] + primary["w"] / 2)
    anchor_y = by + primary["bottom"] + 1
    return {
        "primaryBounds": [bx + primary["x"], by + primary["y"], primary["w"], primary["h"]],
        "groundAnchor": [round(anchor_x, 2), round(anchor_y, 2)],
        "detachedAlphaRatio": round(max(0, total - primary["area"]) / max(1, total), 4),
        "hasBuiltInShadow": bool(shadows),
    }


def image_metrics(image: Image.Image, bounds: tuple[int, int, int, int], threshold: int = 8) -> dict:
    rgba = image.convert("RGBA")
    bx, by, bw, bh = bounds
    opaque = edge_opaque = edge_total = blue = 0
    color_bins: Counter[tuple[int, int, int]] = Counter()
    edge_rgb = [0, 0, 0]
    edge_rgb_count = 0
    center_rgb = [0, 0, 0]
    center_rgb_count = 0
    opposite_delta = opposite_count = 0
    inner_x0 = bx + max(2, int(bw * 0.28))
    inner_x1 = bx + bw - max(2, int(bw * 0.28))
    inner_y0 = by + max(2, int(bh * 0.28))
    inner_y1 = by + bh - max(2, int(bh * 0.28))
    edge_band = max(2, min(5, int(min(bw, bh) * 0.08)))

    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue_value, alpha = rgba.getpixel((x, y))
            if alpha <= threshold:
                continue
            opaque += 1
            if blue_value > 62 and blue_value > red * 1.1 and blue_value >= green * 0.88:
                blue += 1
            color_bins[(red // 24 * 24, green // 24 * 24, blue_value // 24 * 24)] += 1
            if x < bx + edge_band or x >= bx + bw - edge_band or y < by + edge_band or y >= by + bh - edge_band:
                edge_rgb[0] += red; edge_rgb[1] += green; edge_rgb[2] += blue_value
                edge_rgb_count += 1
            if inner_x0 <= x < inner_x1 and inner_y0 <= y < inner_y1:
                center_rgb[0] += red; center_rgb[1] += green; center_rgb[2] += blue_value
                center_rgb_count += 1
            if x < bx + 2 or x >= bx + bw - 2 or y < by + 2 or y >= by + bh - 2:
                edge_opaque += 1
        if by <= y < by + bh and (y < by + 2 or y >= by + bh - 2):
            edge_total += bw
        elif by <= y < by + bh:
            edge_total += min(4, bw)

    dominant = color_bins.most_common(1)[0][0] if color_bins else (0, 0, 0)
    sample = rgba.load()
    for y in range(by, by + bh):
        left = sample[bx + min(edge_band, bw - 1), y]
        right = sample[bx + max(0, bw - edge_band - 1), y]
        if left[3] > threshold and right[3] > threshold:
            opposite_delta += sum(abs(left[index] - right[index]) for index in range(3)); opposite_count += 1
    for x in range(bx, bx + bw):
        top = sample[x, by + min(edge_band, bh - 1)]
        bottom = sample[x, by + max(0, bh - edge_band - 1)]
        if top[3] > threshold and bottom[3] > threshold:
            opposite_delta += sum(abs(top[index] - bottom[index]) for index in range(3)); opposite_count += 1

    edge_mean = [value / max(1, edge_rgb_count) for value in edge_rgb]
    center_mean = [value / max(1, center_rgb_count) for value in center_rgb]
    center_edge_delta = sum(abs(edge_mean[index] - center_mean[index]) for index in range(3)) / (3 * 255)
    opposite_edge_mismatch = opposite_delta / max(1, opposite_count * 3 * 255)
    seam_risk = min(1.0, center_edge_delta * 0.72 + opposite_edge_mismatch * 0.28)
    result = {
        "alphaCoverage": round(opaque / max(1, rgba.width * rgba.height), 4),
        "visibleFill": round(opaque / max(1, bw * bh), 4),
        "edgeCoverage": round(edge_opaque / max(1, edge_total), 4),
        "blueRatio": round(blue / max(1, opaque), 4),
        "dominantColor": "#%02x%02x%02x" % dominant,
        "centerEdgeDelta": round(center_edge_delta, 4),
        "oppositeEdgeMismatch": round(opposite_edge_mismatch, 4),
        "seamRisk": round(seam_risk, 4),
    }
    result.update(primary_component_metrics(image, bounds, threshold))
    return result


def harmonize_presentations(assets: list[dict]) -> None:
    """Keep variants in one semantic family within a narrow size language."""
    groups: dict[tuple[str, str, str], list[dict]] = {}
    for entry in assets:
        if entry.get("tileRole") not in {"prop", "structure", "decoration", "boundary", "transition"}:
            continue
        groups.setdefault((entry.get("theme", ""), entry.get("variantGroup", ""), entry.get("scaleClass", "medium")), []).append(entry)
    for entries in groups.values():
        if len(entries) < 2:
            continue
        target = float(median(float(entry.get("recommendedWorldHeight", 64)) for entry in entries))
        for entry in entries:
            previous = max(1, float(entry.get("recommendedWorldHeight", target)))
            harmonized = round(clamp_number(previous, target * .9, target * 1.1), 1)
            factor = harmonized / previous
            entry["recommendedWorldHeight"] = harmonized
            scale_range = entry.get("randomScaleRange", [1, 1])
            entry["minimumWorldHeight"] = round(harmonized * float(scale_range[0]), 1)
            entry["maximumWorldHeight"] = round(harmonized * float(scale_range[1]), 1)
            for field in ("collisionFootprint", "visualFootprint"):
                if isinstance(entry.get(field), list):
                    entry[field] = [round(float(value) * factor, 1) for value in entry[field]]
            for field in ("shadowWidth", "shadowHeight", "shadowOffsetY", "collisionOffsetX", "collisionOffsetY"):
                if isinstance(entry.get(field), (int, float)):
                    entry[field] = round(float(entry[field]) * factor, 1)


def write_manifest(output: Path, assets: list[dict], meta: dict) -> None:
    payload = json.dumps(assets, ensure_ascii=False, separators=(",", ":"))
    output.write_text(
        "// Arquivo gerado por tools/generate_tower_manifest.py. Não editar manualmente.\n"
        f"export const TOWER_MANIFEST_META={json.dumps(meta, ensure_ascii=False, separators=(',', ':'))};\n"
        f"export const TOWER_ASSETS={payload};\n"
        "const INDEX=new Map(),VISUAL_INDEX=new Map();for(const item of TOWER_ASSETS){const key=`${item.region}:${item.category}`;if(!INDEX.has(key))INDEX.set(key,[]);INDEX.get(key).push(item);const visualKey=`${item.region}:${item.tileRole}`;if(!VISUAL_INDEX.has(visualKey))VISUAL_INDEX.set(visualKey,[]);VISUAL_INDEX.get(visualKey).push(item);}\n"
        "export function towerAssets(region,category=null){if(category)return INDEX.get(`${region}:${category}`)||[];return TOWER_ASSETS.filter((item)=>item.region===region);}\n"
        "export function towerVisualAssets(region,tileRole=null){if(tileRole)return VISUAL_INDEX.get(`${region}:${tileRole}`)||[];return TOWER_ASSETS.filter((item)=>item.region===region);}\n",
        encoding="utf-8",
    )


def read_existing_manifest(path: Path) -> tuple[dict, list[dict]]:
    text = path.read_text(encoding="utf-8")
    try:
        meta_text = text.split("export const TOWER_MANIFEST_META=", 1)[1].split(";\n", 1)[0]
        assets_text = text.split("export const TOWER_ASSETS=", 1)[1].split(";\n", 1)[0]
        return json.loads(meta_text), json.loads(assets_text)
    except (IndexError, json.JSONDecodeError) as error:
        raise ValueError(f"Manifesto existente inválido: {path}") from error


def enrich_existing_manifest(project: Path) -> dict:
    output = project / "js/tower_manifest.js"
    meta, assets = read_existing_manifest(output)
    for entry in assets:
        bounds = tuple(entry.get("bounds", [0, 0, max(1, entry.get("width", 1)), max(1, entry.get("height", 1))]))
        metrics = {
            "groundAnchor": entry.get("groundAnchor") or entry.get("anchor"),
            "primaryBounds": entry.get("primaryBounds") or list(bounds),
            "detachedAlphaRatio": entry.get("detachedAlphaRatio", 0),
            "hasBuiltInShadow": entry.get("hasBuiltInShadow", False),
        }
        entry.update(infer_presentation(
            entry.get("name", ""), entry.get("sourceCategory", ""), int(entry.get("width", 1)),
            int(entry.get("height", 1)), bounds, metrics, entry,
        ))
    harmonize_presentations(assets)
    meta.update({
        "version": 3, "presentationVersion": PRESENTATION_VERSION,
        "presentationCount": len(assets),
        "scaleClasses": dict(sorted(Counter(entry.get("scaleClass", "unknown") for entry in assets).items())),
    })
    write_manifest(output, assets, meta)
    return {"assets": len(assets), "output": str(output), "mode": "enrich-existing"}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("project", type=Path)
    parser.add_argument("--enrich-existing", action="store_true", help="Adiciona metadados de apresentação ao manifesto já gerado")
    args = parser.parse_args()

    source = args.source.resolve()
    project = args.project.resolve()
    if args.enrich_existing:
        print(json.dumps(enrich_existing_manifest(project), ensure_ascii=False, indent=2))
        return
    destination = project / "assets/pixel/tilesets_itens_nomeados_webp"
    destination.mkdir(parents=True, exist_ok=True)

    csv_path = source / "manifesto_itens_nomeados.csv"
    rows: dict[tuple[str, str], dict[str, str]] = {}
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            rows[(row["regiao"], row["novo_nome"])] = row

    assets = []
    categories = Counter()
    regions = Counter()
    for index, path in enumerate(sorted(source.glob("regiao_*/*.webp")), 1):
        region = path.parent.name
        relative = path.relative_to(source).as_posix()
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if path.resolve() != target.resolve():
            shutil.copy2(path, target)
        with Image.open(path) as image:
            image.load()
            width, height = image.size
            bounds = alpha_bounds(image)
            metrics = image_metrics(image, bounds)
        row = rows.get((region, path.name), {})
        semantics = infer_semantics(path.stem, row.get("categoria", ""), width, height, bounds, metrics, REGION_THEMES[region])
        bx, by, bw, bh = bounds
        entry = {
            "id": f"torre-{index:04d}",
            "path": f"./assets/pixel/tilesets_itens_nomeados_webp/{relative}",
            "region": region, "theme": REGION_THEMES[region], "name": path.stem,
            "sourceCategory": row.get("categoria", ""), "width": width, "height": height,
            "bounds": [bx, by, bw, bh], "anchor": [round(bx + bw / 2, 1), by + bh],
            **semantics,
        }
        assets.append(entry)
        categories[semantics["category"]] += 1
        regions[region] += 1

    harmonize_presentations(assets)
    visual_groups: dict[tuple[str, str], set[str]] = {}
    for entry in assets:
        visual_groups.setdefault((entry["theme"], entry["tileRole"]), set()).add(entry["variantGroup"])
    for entry in assets:
        if entry["tileRole"] == "base": roles = ("base", "transition", "path")
        elif entry["tileRole"] == "hazard": roles = ("hazard", "base", "transition", "bridge")
        elif entry["tileRole"] in {"path", "bridge"}: roles = ("path", "bridge", "base")
        else: roles = (entry["tileRole"],)
        compatible = set()
        for role in roles:
            compatible.update(visual_groups.get((entry["theme"], role), set()))
        entry["compatibleWith"] = sorted(compatible)

    csv_target = destination / csv_path.name
    if csv_path.resolve() != csv_target.resolve():
        shutil.copy2(csv_path, csv_target)
    readme = source / "LEIA-ME.txt"
    if readme.exists():
        readme_target = destination / readme.name
        if readme.resolve() != readme_target.resolve():
            shutil.copy2(readme, readme_target)

    output = project / "js/tower_manifest.js"
    meta = {
        "version": 3, "generatedFrom": "tilesets_itens_nomeados_webp.zip",
        "assetCount": len(assets), "regions": dict(sorted(regions.items())),
        "categories": dict(sorted(categories.items())),
        "visualRoles": dict(sorted(Counter(entry["tileRole"] for entry in assets).items())),
        "surfaceModes": dict(sorted(Counter(entry["surfaceMode"] for entry in assets).items())),
        "fullTileCount": sum(bool(entry["isFullTile"]) for entry in assets), "alphaThreshold": 8,
        "presentationVersion": PRESENTATION_VERSION, "presentationCount": len(assets),
        "scaleClasses": dict(sorted(Counter(entry["scaleClass"] for entry in assets).items())),
    }
    write_manifest(output, assets, meta)
    print(json.dumps({"assets": len(assets), "regions": regions, "categories": categories, "output": str(output)}, ensure_ascii=False, indent=2, default=dict))


if __name__ == "__main__":
    main()
