#!/usr/bin/env python3
"""Migração explícita do portfólio público para bucket privado. Não exclui arquivos automaticamente."""
import argparse
import mimetypes
import os
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError

PROJECTS = {
    "Album-Familia": "album-familia",
    "Album-World-Stars": "album-world-stars",
    "Timbo-Speaker": "timbo-speaker",
    "silvinho/silvinho": "silvinho",
}

def upload(base_url, secret, bucket, object_name, file_path):
    mime = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    url = base_url.rstrip("/") + "/storage/v1/object/" + bucket + "/" + quote(object_name, safe="/")
    data = file_path.read_bytes()
    req = Request(url, data=data, method="POST", headers={
        "Authorization": "Bearer " + secret,
        "apikey": secret,
        "Content-Type": mime,
        "x-upsert": "true",
        "Cache-Control": "no-store",
    })
    try:
        with urlopen(req, timeout=120) as res:
            return res.status
    except HTTPError as e:
        raise RuntimeError(f"{file_path}: HTTP {e.code}: {e.read()[:500]!r}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".", help="Raiz do clone local devilsir.github.io")
    parser.add_argument("--apply", action="store_true", help="Enviar dados (o padrão é dry-run)")
    parser.add_argument("--project", choices=["all", *PROJECTS.keys()], default="all")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    selected = PROJECTS if args.project == "all" else {args.project: PROJECTS[args.project]}
    files = []
    for folder, slug in selected.items():
        path = root / folder
        if not path.is_dir():
            raise SystemExit(f"Diretório não encontrado: {path}")
        for f in path.rglob("*"):
            if f.is_file() and ".git" not in f.parts:
                files.append((slug + "/" + f.relative_to(path).as_posix(), f))
    bytes_total = sum(f.stat().st_size for _, f in files)
    print(f"{len(files)} arquivos | {bytes_total/1024/1024:.1f} MiB | modo {'APPLY' if args.apply else 'DRY-RUN'}")
    for dest, file in files:
        print(dest)
        if args.apply:
            url=os.environ.get("SUPABASE_URL")
            secret=os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
            if not url or not secret:
                raise SystemExit("Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY como variáveis de ambiente privadas.")
            upload(url,secret,"portfolio-private",dest,file)
    print("Transferência concluída." if args.apply else "Nenhum arquivo enviado. Use --apply após confirmar a configuração do bucket.")

if __name__=="__main__":
    main()
