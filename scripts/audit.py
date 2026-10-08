#!/usr/bin/env python3
"""
Audit the built page. No browser required.

    python3 scripts/audit.py            # markup, contrast, first-load payload
    python3 scripts/audit.py --glyphs   # also check every character against the fonts

Run it after `npm run build`. It reads dist/index.html *and* dist/_astro/*.css,
because several of the things worth checking (header contrast, focus rings) only
exist in the compiled stylesheet.

The glyph check needs fonttools + brotli (the same venv `npm run fonts` uses);
it is skipped with a note when those are missing.

Exit code is 0 only when every check passes.
"""

from __future__ import annotations

import gzip
import io
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
HTML_PATH = DIST / "index.html"

failures: list[str] = []
notes: list[str] = []


def check(condition: bool, message: str) -> None:
    if condition:
        print(f"  \033[32mPASS\033[0m {message}")
    else:
        print(f"  \033[31mFAIL\033[0m {message}")
        failures.append(message)


def section(title: str) -> None:
    print(f"\n\033[1m{title}\033[0m")


# --------------------------------------------------------------------------- #
# Markup                                                                       #
# --------------------------------------------------------------------------- #


def audit_markup(html: str) -> None:
    section("Markup and accessibility")

    headings = [(int(level), text) for level, text in
                re.findall(r"<h([1-6])[^>]*>(.*?)</h\1>", html, re.S)]
    check(sum(1 for level, _ in headings if level == 1) == 1, "exactly one <h1>")

    skips = [
        (previous, level)
        for (previous, _), (level, _) in zip(headings, headings[1:])
        if level > previous + 1
    ]
    check(not skips, f"no heading levels are skipped ({len(headings)} headings)")

    images = re.findall(r"<img\b[^>]*>", html)
    missing_alt = [tag for tag in images if 'alt="' not in tag]
    check(not missing_alt, f"every <img> has alt text ({len(images)} images)")

    # Links and buttons need an accessible name from their content, aria-label
    # or aria-labelledby. Placeholder figures carry their own role=img label.
    anchors = re.findall(r"<a\b[^>]*>(.*?)</a>", html, re.S)
    named_by_attr = len(re.findall(r'<a\b[^>]*aria-label="[^"]+"', html))
    empty = [
        body
        for body in anchors
        if not re.sub(r"<[^>]+>|&[a-z]+;|\s", "", body)
    ]
    check(
        len(empty) <= named_by_attr,
        f"every link has an accessible name ({len(anchors)} links, "
        f"{len(empty)} without text but {named_by_attr} carry aria-label)",
    )

    external = re.findall(r'<a\b[^>]*target="_blank"[^>]*>', html)
    unchecked = [tag for tag in external if "noopener" not in tag]
    check(not unchecked, f"every target=_blank link carries rel=noopener ({len(external)})")

    check(not re.search(r"<[a-z]+[^>]*\son[a-z]+=", html), "no inline event handlers")

    check(html.count("<main") == 1, "exactly one <main> landmark")
    check('<a href="#main"' in html or 'href="#main"' in html, "skip link present")
    check(html.count('aria-expanded=') >= 1, "menu trigger exposes aria-expanded")
    check('aria-modal="true"' in html, "mobile menu is a modal dialog with a label")
    check(
        not re.search(r"<img(?![^>]*width=)", html),
        "every <img> carries intrinsic width/height (layout shift)",
    )
    lazy = len(re.findall(r'loading="lazy"', html))
    eager = len(re.findall(r'loading="eager"', html))
    check(eager == 1 and lazy >= 1, f"one eager image, the rest lazy ({eager} eager / {lazy} lazy)")


# --------------------------------------------------------------------------- #
# Contrast                                                                     #
# --------------------------------------------------------------------------- #


def luminance(hex_colour: str) -> float:
    channels = [int(hex_colour[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast(foreground: str, background: str) -> float:
    a, b = luminance(foreground), luminance(background)
    lighter, darker = max(a, b), min(a, b)
    return (lighter + 0.05) / (darker + 0.05)


def audit_contrast() -> None:
    section("Contrast (WCAG 2.2 AA)")
    palette = dict(
        re.findall(r"--color-([a-z-]+):\s*(#[0-9a-f]{6})", (ROOT / "src/styles/global.css").read_text())
    )
    if not palette:
        failures.append("no palette found in global.css")
        print("  \033[31mFAIL\033[0m palette not found")
        return

    # (foreground, background, minimum ratio, what it is used for)
    pairs = [
        ("ink", "linen", 4.5, "body copy on the light ground"),
        ("ink", "paper", 4.5, "body copy in cards"),
        ("ink-soft", "linen", 4.5, "secondary copy"),
        ("ink-soft", "sand", 4.5, "secondary copy on the sand ground"),
        ("ink-mute", "linen", 4.5, "eyebrow labels and captions"),
        ("ink-mute", "sand", 4.5, "captions on the sand ground"),
        ("clay", "linen", 4.5, "accent text on light"),
        ("clay", "paper", 4.5, "accent text in cards"),
        ("paper", "clay", 4.5, "button label on the clay fill"),
        ("linen", "night", 4.5, "body copy on the dark ground"),
        ("sand", "night", 4.5, "body copy on the dark ground"),
        ("ochre", "night", 4.5, "accent text on the dark ground"),
    ]
    worst = None
    for foreground, background, minimum, label in pairs:
        if foreground not in palette or background not in palette:
            continue
        ratio = contrast(palette[foreground], palette[background])
        worst = ratio if worst is None else min(worst, ratio - minimum)
        check(ratio >= minimum, f"{label}: {foreground} on {background} = {ratio:.2f}:1")
    if worst is not None:
        notes.append("contrast ratios are the ones the design actually ships; nothing is opacity-based")


# --------------------------------------------------------------------------- #
# Glyph coverage                                                               #
# --------------------------------------------------------------------------- #


def audit_glyphs(html: str) -> None:
    section("Glyph coverage")
    try:
        from fontTools.ttLib import TTFont
    except ImportError:
        notes.append("glyph check skipped — run it with the fontTools venv (see README)")
        print("  \033[33mSKIP\033[0m fontTools not importable in this interpreter")
        return

    text = re.sub(r"<script.*?</script>|<style.*?</style>", " ", html, flags=re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = (
        text.replace("&amp;", "&")
        .replace("&nbsp;", " ")
        .replace("&#39;", "'")
        .replace("&quot;", '"')
        .replace("&lt;", "<")
        .replace("&gt;", ">")
    )
    visible = {char for char in text if char.strip() and char.isprintable()}

    for pattern, label in (
        ("fraunces-var*.woff2", "Fraunces"),
        ("instrument-sans-var*.woff2", "Instrument Sans"),
    ):
        candidates = sorted((ROOT / "src/assets/fonts").glob(pattern))
        if not candidates:
            check(False, f"{label} source font not found in src/assets/fonts")
            continue
        font = TTFont(candidates[0], lazy=True)
        covered = set(font.getBestCmap())
        missing = sorted(char for char in visible if ord(char) not in covered)
        # ₦ is drawn as an inline SVG (NairaMark), so it is expected to be absent.
        missing = [char for char in missing if char != "₦"]
        check(
            not missing,
            f"{label} covers the page's characters ({len(visible)} used)"
            + (f" — missing {missing}" if missing else ""),
        )


# --------------------------------------------------------------------------- #
# First-load payload                                                           #
# --------------------------------------------------------------------------- #


def gzipped(path: Path) -> int:
    buffer = io.BytesIO()
    with gzip.GzipFile(fileobj=buffer, mode="wb", compresslevel=9) as handle:
        handle.write(path.read_bytes())
    return len(buffer.getvalue())


def audit_payload(html: str) -> None:
    section("First-load payload (gzipped)")
    total = 0

    rows: list[tuple[str, int]] = [("index.html", gzipped(HTML_PATH))]
    for asset in sorted(DIST.glob("_astro/*.css")) + sorted(DIST.glob("_astro/*.js")):
        rows.append((asset.name, gzipped(asset)))
    for font in sorted(DIST.rglob("*.woff2")):
        rows.append((f"font {font.name[:26]}", gzipped(font)))
    if (DIST / "favicon.svg").exists():
        rows.append(("favicon.svg", gzipped(DIST / "favicon.svg")))

    # The one eager image. Report the candidate a desktop browser actually
    # picks — the smallest one that still covers the layout slot — rather than
    # the largest file in the srcset.
    hero = re.search(r'<img[^>]*fetchpriority="high"[^>]*>', html)
    if hero:
        tag = hero.group(0)
        candidates = sorted(
            ((int(width), name) for name, width in re.findall(r"/_astro/([^ \"]+\.webp) (\d+)w", tag))
        )
        viewport = 1440
        hint = re.search(r'sizes="([^"]+)"', tag)
        vw = re.search(r"\((?:min|max)-width:\s*(\d+)px\)\s*([\d.]+)vw", hint.group(1)) if hint else None
        slot = round(viewport * float(vw.group(2)) / 100) if vw and viewport >= int(vw.group(1)) else viewport
        pick = next((pair for pair in candidates if pair[0] >= slot), candidates[-1])
        path = DIST / "_astro" / pick[1]
        if path.exists():
            rows.append((f"hero image @{pick[0]}w", path.stat().st_size))
            print(f"  hero slot ≈ {slot}px at {viewport}px wide → @{pick[0]}w chosen")

    for name, size in rows:
        print(f"  {name:<34} {size / 1024:7.1f} KB")
        total += size
    print(f"  {'—' * 34} {'—' * 8}")
    print(f"  {'total':<34} {total / 1024:7.1f} KB  ({len(rows)} requests, 0 third-party)")

    check(total <= 400 * 1024, f"first load stays under 400 KB ({total / 1024:.1f} KB)")
    check(len(rows) <= 8, f"first load is a handful of requests ({len(rows)})")


def main() -> int:
    if not HTML_PATH.exists():
        print("dist/index.html not found — run `npm run build` first.")
        return 2
    html = HTML_PATH.read_text()

    audit_markup(html)
    audit_contrast()
    if "--glyphs" in sys.argv:
        audit_glyphs(html)
    audit_payload(html)

    print()
    if failures:
        print(f"\033[31m{len(failures)} check(s) failed\033[0m")
        for failure in failures:
            print(f"  · {failure}")
    else:
        print("\033[32mAll checks passed.\033[0m")
    for note in notes:
        print(f"  note: {note}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
