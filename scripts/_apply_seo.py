#!/usr/bin/env python3
"""One-shot SEO + tracking batch update for all HTML pages.

Updates each page's <title>, <meta name="description">, Open Graph + Twitter
tags, favicon links, and the GA4 gtag.js snippet. Idempotent — re-running
overwrites the SEO block cleanly without duplicating tags.
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://oleo.com.au"
OG_IMAGE = f"{BASE_URL}/assets/img/og-image.svg"
GA4_ID = "G-HY9WJBL4NY"

PAGES = {
    "index.html": {
        "title": "Oleo — Marketing agency in Perth, WA · Paid media, production & web",
        "desc": "Operator-led marketing agency in Perth, Western Australia. Paid media, production and web development for ambitious brands that want more from every dollar.",
        "og_type": "website",
        "url_path": "/",
    },
    "services.html": {
        "title": "Services — Paid media, production, web | Oleo Perth",
        "desc": "Three core services from a Perth-based WA agency: paid media across Meta and Google, production for paid channels, and web development built to convert.",
        "og_type": "website",
        "url_path": "/services.html",
    },
    "work.html": {
        "title": "Case studies — Paid media & web growth | Oleo Perth WA",
        "desc": "Selected work from Oleo: paid media, production and web projects for equestrian, horticulture, legal and hospitality brands across Australia.",
        "og_type": "website",
        "url_path": "/work.html",
    },
    "about.html": {
        "title": "About Oleo — Operator-led marketing agency, Perth WA",
        "desc": "Oleo is a senior, operator-led marketing studio in Perth, Western Australia. Founder-led, deliberately small, performance-obsessed.",
        "og_type": "website",
        "url_path": "/about.html",
    },
    "contact.html": {
        "title": "Contact Oleo — Perth marketing agency · Get in touch",
        "desc": "Get in touch with Oleo, a Perth, WA marketing agency. Send a few lines via the form or email admin@oleo.com.au and we'll reply within a working day.",
        "og_type": "website",
        "url_path": "/contact.html",
    },
    "the-pop.html": {
        "title": "The Pop — Studio culture &amp; values | Oleo Perth",
        "desc": "The Pop is the way Oleo works: senior operators, weekly tests, honest reporting and the studio standards behind our paid media and web work in Perth.",
        "og_type": "website",
        "url_path": "/the-pop.html",
    },
    "the-spark.html": {
        "title": "The Spark — Notes &amp; thinking from Oleo Perth",
        "desc": "Field notes on paid media, production and web from Oleo's Perth, Western Australia studio. Frameworks, tests and what's working in marketing right now.",
        "og_type": "website",
        "url_path": "/the-spark.html",
    },
    "services/media.html": {
        "title": "Paid media — Meta, Google, TikTok, LinkedIn | Oleo Perth",
        "desc": "Senior-managed paid media for ambitious brands in Perth and across Australia. Meta, Google, TikTok and LinkedIn, structured for growth and reported in plain English.",
        "og_type": "website",
        "url_path": "/services/media.html",
    },
    "services/production.html": {
        "title": "Production — Photo &amp; video for paid channels | Oleo Perth",
        "desc": "Performance creative built for paid channels, not repurposed organic. Photo, video and motion production from Oleo's Perth, WA studio.",
        "og_type": "website",
        "url_path": "/services/production.html",
    },
    "services/web-development.html": {
        "title": "Web development — Shopify &amp; marketing sites | Oleo Perth",
        "desc": "Fast, accessible Shopify storefronts, marketing sites and landing pages built to convert. Web development by Oleo, a Perth, Western Australia agency.",
        "og_type": "website",
        "url_path": "/services/web-development.html",
    },
    "work/equestrian-retailer.html": {
        "title": "Case study · A WA equestrian retailer | Oleo",
        "desc": "How Oleo rebuilt paid media for a Western Australian equestrian retailer, moving from seasonal spikes to a year-round growth engine.",
        "og_type": "article",
        "url_path": "/work/equestrian-retailer.html",
    },
    "work/horticulture-supplier.html": {
        "title": "Case study · A B2B horticulture supplier | Oleo",
        "desc": "How Oleo built a B2B lead engine in a niche horticulture supplier market with paid search and LinkedIn targeting across Australia.",
        "og_type": "article",
        "url_path": "/work/horticulture-supplier.html",
    },
    "the-spark/paid-traffic-pre-flight.html": {
        "title": "What we run before any paid traffic | The Spark · Oleo",
        "desc": "The four checks Oleo does on every new paid media account before a single dollar of spend: tracking, offer, creative library, baseline.",
        "og_type": "article",
        "url_path": "/the-spark/paid-traffic-pre-flight.html",
    },
    "the-spark/third-frame.html": {
        "title": "Why the third frame matters | The Spark · Oleo Perth",
        "desc": "How Oleo briefs, shoots and edits the opening three seconds of short-form video without sacrificing the rest of the spot.",
        "og_type": "article",
        "url_path": "/the-spark/third-frame.html",
    },
    "the-spark/landing-pages-feedback-loop.html": {
        "title": "Landing pages are a feedback loop | The Spark · Oleo",
        "desc": "How Oleo structures landing pages so they can be diagnosed, iterated and rebuilt section by section instead of treated as static assets.",
        "og_type": "article",
        "url_path": "/the-spark/landing-pages-feedback-loop.html",
    },
    "the-spark/things-we-stopped-doing.html": {
        "title": "Things we stopped doing in 2026 | The Spark · Oleo",
        "desc": "A short list of agency habits, rituals and account-management theatre Oleo has quietly dropped, and what we're doing instead.",
        "og_type": "article",
        "url_path": "/the-spark/things-we-stopped-doing.html",
    },
}

GA4_BLOCK = (
    "<!-- Google tag (gtag.js) — GA4 -->\n"
    f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA4_ID}"></script>\n'
    "<script>\n"
    "  window.dataLayer = window.dataLayer || [];\n"
    "  function gtag(){dataLayer.push(arguments);}\n"
    "  gtag('js', new Date());\n"
    f"  gtag('config', '{GA4_ID}');\n"
    "</script>\n"
)

FAVICON_BLOCK = (
    '<link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">\n'
    '<link rel="icon" type="image/png" href="/assets/img/oleo-logo.png">\n'
    '<link rel="apple-touch-icon" href="/assets/img/oleo-logo.png">\n'
)


def og_block(meta: dict) -> str:
    url = f"{BASE_URL}{meta['url_path']}"
    og_type = meta.get("og_type", "website")
    title = meta["title"]
    desc = meta["desc"]
    return (
        f'<meta property="og:title" content="{title}">\n'
        f'<meta property="og:description" content="{desc}">\n'
        f'<meta property="og:type" content="{og_type}">\n'
        f'<meta property="og:url" content="{url}">\n'
        f'<meta property="og:image" content="{OG_IMAGE}">\n'
        f'<meta property="og:image:width" content="1200">\n'
        f'<meta property="og:image:height" content="630">\n'
        f'<meta property="og:image:alt" content="Oleo — marketing agency in Perth, Western Australia">\n'
        f'<meta property="og:site_name" content="Oleo">\n'
        f'<meta property="og:locale" content="en_AU">\n'
        f'<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:title" content="{title}">\n'
        f'<meta name="twitter:description" content="{desc}">\n'
        f'<meta name="twitter:image" content="{OG_IMAGE}">'
    )


def update_page(rel: str, meta: dict) -> None:
    p = ROOT / rel
    s = p.read_text(encoding="utf-8")

    # 1) Title
    s = re.sub(
        r"<title>.*?</title>",
        f"<title>{meta['title']}</title>",
        s, count=1, flags=re.DOTALL,
    )

    # 2) Description
    s = re.sub(
        r'<meta\s+name="description"\s+content="[^"]*"\s*/?>',
        f'<meta name="description" content="{meta["desc"]}">',
        s, count=1,
    )

    # 3) Strip any prior OG / Twitter tags (so we don't accumulate duplicates)
    s = re.sub(r"\s*<meta\s+property=\"og:[^\"]+\"\s+content=\"[^\"]*\">", "", s)
    s = re.sub(r"\s*<meta\s+name=\"twitter:[^\"]+\"\s+content=\"[^\"]*\">", "", s)

    # 4) Insert fresh OG/Twitter block right after the description
    s = re.sub(
        r'(<meta\s+name="description"\s+content="[^"]*">)',
        r"\1\n" + og_block(meta).replace("\\", r"\\"),
        s, count=1,
    )

    # 5) Favicon links — only insert if not already present
    if "favicon.svg" not in s:
        s = re.sub(
            r'(<link rel="preconnect" href="https://fonts.googleapis.com">)',
            FAVICON_BLOCK + r"\1",
            s, count=1,
        )

    # 6) GA4 — only insert if not already present
    if "googletagmanager.com/gtag/js" not in s:
        s = s.replace("</head>", GA4_BLOCK + "</head>", 1)

    p.write_text(s, encoding="utf-8")
    print(f"Updated {rel}")


def main() -> int:
    for rel, meta in PAGES.items():
        update_page(rel, meta)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
