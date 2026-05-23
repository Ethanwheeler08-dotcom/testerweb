#!/usr/bin/env python3
"""
Auto-generate sitemap.xml by walking the repo for *.html files.

Excludes 404.html and any HTML under dotted directories (e.g. .git).
Each URL is written with <loc>, <lastmod> (today's date, UTC), and a
simple <priority> heuristic (homepage 1.0, top-level 0.8, nested 0.6).

The base URL is read from the SITE_BASE_URL environment variable so the
same script works locally and in CI. Defaults to https://oleo.com.au.

Run locally: python scripts/generate-sitemap.py
Run in CI:   see .github/workflows/sitemap.yml
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = os.environ.get("SITE_BASE_URL", "https://oleo.com.au").rstrip("/")
EXCLUDE = {"404.html"}


def find_pages():
    for path in sorted(ROOT.rglob("*.html")):
        if any(part.startswith(".") or part in {"node_modules"} for part in path.parts):
            continue
        rel = path.relative_to(ROOT).as_posix()
        if rel in EXCLUDE:
            continue
        yield rel


def priority(rel: str) -> str:
    if rel == "index.html":
        return "1.0"
    if "/" not in rel:
        return "0.8"
    return "0.6"


def main() -> int:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    pages = list(find_pages())
    for rel in pages:
        url_path = "/" if rel == "index.html" else f"/{rel}"
        loc = f"{BASE_URL}{url_path}"
        lines += [
            "  <url>",
            f"    <loc>{loc}</loc>",
            f"    <lastmod>{today}</lastmod>",
            f"    <priority>{priority(rel)}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    out = ROOT / "sitemap.xml"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {out.relative_to(ROOT)} with {len(pages)} URLs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
