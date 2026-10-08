#!/usr/bin/env python3
"""
Build the two derived brand assets from the vectorised brand marks.

    public/favicon.svg          — the real CK monogram on a square linen tile
    public/apple-touch-icon.png — 180×180, for iOS home screens
    public/icon-192.png         — web app manifest icons
    public/icon-512.png
    public/og.png               — the 1200×630 social card

Both are generated, never hand-drawn, so they cannot drift away from the
identity in `src/assets/brand/`.

Why the card's text is converted to outlines: this machine has no system fonts,
and a social card must not depend on whatever fonts a scraper happens to have.
The few words on the card are drawn from the site's own subsetted web fonts
with fontTools, converted to paths and embedded as geometry, so the render is
identical everywhere. Tracking is applied by hand — the wordmark is the
identity, not a word, and the wide letterspacing is part of it.

Requires what `npm run fonts` requires: fonttools + brotli in a venv. The final
PNG render goes through sharp, which is already a dev dependency.

Usage:  python3 scripts/build-brand-assets.py
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
MARKS = ROOT / "src" / "assets" / "brand"
PUBLIC = ROOT / "public"

# Palette — kept in step with src/styles/global.css
LINEN = "#faf7f2"
SAND_DEEP = "#e3d7c5"
INK = "#17130f"
INK_SOFT = "#443a32"
INK_MUTE = "#6f6558"
CLAY = "#a9491f"

NUMBER = re.compile(r"[A-Za-z]|-?\d*\.?\d+(?:[eE]-?\d+)?")


def monogram_path_data() -> tuple[str, float, float]:
    """The monogram's path data, plus its intrinsic width and height."""
    svg = (MARKS / "monogram.svg").read_text()
    box = re.search(r'viewBox="([^"]+)"', svg)
    if not box:
        raise SystemExit("monogram.svg has no viewBox")
    _, _, width, height = (float(v) for v in box.group(1).split())
    paths = re.findall(r'<path[^>]*\sd="([^"]+)"', svg)
    if not paths:
        raise SystemExit("monogram.svg has no path data")
    return " ".join(paths), width, height


class Face:
    """A loaded font at one optical size, with the metrics text needs."""

    def __init__(self, path: Path, opsz: float | None = None) -> None:
        font = TTFont(path)
        if opsz is not None and "fvar" in font:
            axes = {axis.axisTag for axis in font["fvar"].axes}
            if "opsz" in axes:
                font = instantiateVariableFont(font, {"opsz": opsz})
        self.font = font
        self.upem = font["head"].unitsPerEm
        self.glyphs = font.getGlyphSet()
        self.cmap = font.getBestCmap()
        self.hmtx = font["hmtx"]

    def glyph_path(self, char: str, size: float, pen_x: float) -> str:
        """One glyph, scaled to `size` px and shifted to its pen position."""
        name = self.cmap.get(ord(char))
        if name is None:
            raise SystemExit(f"{char!r} has no glyph in this face")
        pen = SVGPathPen(self.glyphs)
        self.glyphs[name].draw(pen)
        commands = pen.getCommands()
        if not commands:
            return ""
        # Glyph coordinates are in font units and need scaling; the pen
        # position is already in px, so it is only offset, never scaled.
        scale = size / self.upem
        return _place(commands, pen_x, scale)

    def advance(self, char: str, size: float, tracking: float = 0.0) -> float:
        name = self.cmap[ord(char)]
        return (self.hmtx[name][0] * (size / self.upem)) + tracking * size

    def set_text(self, text: str, size: float, tracking: float = 0.0) -> tuple[str, float]:
        """Return the outlined text and its total advance width in px."""
        parts: list[str] = []
        x = 0.0
        for char in text:
            outlined = self.glyph_path(char, size, x)
            if outlined:
                parts.append(outlined)
            x += self.advance(char, size, tracking)
        return " ".join(parts), x


def _place(commands: str, dx: float, scale: float) -> str:
    """
    Scale an SVGPathPen command string and shift it along x.

    SVGPathPen emits absolute commands only, so a coordinate pair in a line or
    curve needs the same treatment wherever it appears; H and V carry a single
    coordinate. Anything unexpected raises rather than silently misplacing
    geometry.
    """
    tokens = NUMBER.findall(commands)
    out: list[str] = []
    index = 0
    while index < len(tokens):
        token = tokens[index]
        if token[0].isalpha():
            command = token.upper()
            out.append(token)
            index += 1
            if command == "Z":
                continue
            if command in ("H", "V"):
                value = float(tokens[index]) * scale + (dx if command == "H" else 0.0)
                out.append(f"{value:.2f}")
                index += 1
                continue
            arity = {"M": 2, "L": 2, "T": 2, "Q": 4, "S": 4, "C": 6, "A": 7}[command]
            continue

        x = float(token) * scale + dx
        y = float(tokens[index + 1]) * scale
        out.append(f"{x:.2f} {y:.2f}")
        index += 2
    return " ".join(out)


def publish_marks() -> None:
    """Mirror the traced marks into public/, where the CSS masks read them."""
    target = PUBLIC / "brand"
    target.mkdir(parents=True, exist_ok=True)
    for name in ("monogram.svg", "signature.svg"):
        source = MARKS / name
        shutil.copyfile(source, target / name)
        print(f"  brand/{name:14} {source.stat().st_size / 1024:5.1f} KB  copied")


def quantise(path_data: str, scale: float, decimals: int = 1) -> str:
    """
    Re-emit a path at a new scale with a fixed number of decimals.

    The favicon draws the mark at 78 units across, where a tenth of a unit is
    well under a hundredth of a pixel at any size a favicon is shown — but it
    is a third of a kilobyte of coordinate text on every page load.
    """
    tokens = NUMBER.findall(path_data)
    out: list[str] = []
    index = 0
    while index < len(tokens):
        token = tokens[index]
        if token[0].isalpha():
            command = token.upper()
            out.append(token)
            index += 1
            if command == "Z":
                continue
            if command in ("H", "V"):
                out.append(f"{float(tokens[index]) * scale:.{decimals}f}")
                index += 1
                continue
            continue
        x = float(token) * scale
        y = float(tokens[index + 1]) * scale
        out.append(f"{x:.{decimals}f} {y:.{decimals}f}")
        index += 2
    return " ".join(out)


def build_favicon(path_data: str, mark_w: float, mark_h: float) -> None:
    """
    A square tile: the monogram on linen, inset and optically centred.

    The monogram's own box is 100 × 77.88, so the tile is set from the real
    aspect rather than assuming a wide, shallow mark.
    """
    width = 78.0
    height = width * mark_h / mark_w
    x = (100 - width) / 2
    y = (100 - height) / 2
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" '
        'role="img" aria-label="Crystal Kizor">\n'
        f'  <rect width="100" height="100" rx="14" fill="{LINEN}"/>\n'
        f'  <g transform="translate({x:.2f} {y:.2f})" fill="{INK}">\n'
        f'    <path d="{quantise(path_data, width / mark_w)}"/>\n'
        "  </g>\n</svg>\n"
    )
    (PUBLIC / "favicon.svg").write_text(svg)
    print(f"  favicon.svg   100 × 100     {len(svg) / 1024:5.1f} KB")


def build_icons() -> None:
    """
    Rasterise the favicon tile into the home-screen and manifest sizes.

    Rendered from the same generated SVG rather than from a second hand-exported
    file, so the app icon and the browser tab cannot disagree.
    """
    source = PUBLIC / "favicon.svg"
    for name, size in (
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("apple-touch-icon.png", 180),
    ):
        subprocess.run(
            [
                "node",
                "--input-type=module",
                "-e",
                "import sharp from 'sharp';"
                f"await sharp({str(source)!r}, {{ density: 384 }})"
                f".resize({size}, {size}).png({{ compressionLevel: 9 }}).toFile({str(PUBLIC / name)!r});",
            ],
            cwd=ROOT,
            check=True,
        )
        print(f"  {name:<24} {size} × {size}   {(PUBLIC / name).stat().st_size / 1024:5.1f} KB")


def build_og_card(path_data: str, mark_w: float, mark_h: float) -> None:
    """
    Draw the 1200×630 social card, then rasterise it with sharp.

    Glyph coordinates come out of the font y-up, so every text group is flipped
    with scale(1,-1) and positioned by its baseline. The monogram's own SVG is
    already y-down and needs no such treatment.
    """
    fonts = ROOT / "src" / "assets" / "fonts"
    display = Face(fonts / "fraunces-var.woff2", opsz=144)
    editorial = Face(fonts / "fraunces-var.woff2", opsz=110)
    sans = Face(fonts / "instrument-sans-var.woff2")

    wordmark, wordmark_w = display.set_text("CRYSTAL KIZOR", 76, tracking=0.19)
    role, _ = sans.set_text("Architect · Designer · Founder, Studio COKA", 25)
    tagline, tagline_w = editorial.set_text("Design for the climate you actually have.", 40)
    url, url_w = sans.set_text("crystalkizor.com", 22)

    # Nothing on the card may leave the frame (34 px inset, 96 px margin).
    limit = 1200 - 96 - 34
    for label, width in (("wordmark", wordmark_w), ("tagline", tagline_w)):
        if width > limit:
            raise SystemExit(f"{label} is {width:.0f}px wide, over the {limit}px frame")

    # Both marks are taller than they are wide (the monogram is 100 × 77.88),
    # so the space between them is set from the real aspect ratio, not guessed.
    mark_w_px = 152.0
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">\n'
        f'  <rect width="1200" height="630" fill="{LINEN}"/>\n'
        f'  <rect x="34" y="34" width="1132" height="562" fill="none" stroke="{SAND_DEEP}"/>\n'
        f'  <rect x="34" y="34" width="1132" height="6" fill="{CLAY}"/>\n'
        f'  <g transform="translate(96 116) scale({mark_w_px / mark_w:.5f})" fill="{INK}">\n'
        f'    <path d="{path_data}"/>\n'
        "  </g>\n"
        f'  <g transform="translate(96 330) scale(1 -1)" fill="{INK}"><path d="{wordmark}"/></g>\n'
        f'  <g transform="translate(98 372) scale(1 -1)" fill="{INK_SOFT}"><path d="{role}"/></g>\n'
        f'  <rect x="98" y="448" width="96" height="2" fill="{SAND_DEEP}"/>\n'
        f'  <g transform="translate(98 496) scale(1 -1)" fill="{CLAY}"><path d="{tagline}"/></g>\n'
        f'  <g transform="translate(98 560) scale(1 -1)" fill="{INK_MUTE}"><path d="{url}"/></g>\n'
        "</svg>\n"
    )

    source = Path("/tmp/crystal-kizor-og.svg")
    source.write_text(svg)
    out = PUBLIC / "og.png"
    subprocess.run(
        [
            "node",
            "--input-type=module",
            "-e",
            "import sharp from 'sharp';"
            f"await sharp({str(source)!r}).png({{ compressionLevel: 9 }}).toFile({str(out)!r});",
        ],
        cwd=ROOT,
        check=True,
    )
    print(f"  og.png        1200 × 630   {out.stat().st_size / 1024:5.1f} KB")
    print(f"  (wordmark {wordmark_w:.0f}px wide · tagline {tagline_w:.0f}px of {limit}px · url {url_w:.0f}px)")


if __name__ == "__main__":
    data, mark_width, mark_height = monogram_path_data()
    print("Writing derived brand assets…")
    publish_marks()
    build_favicon(data, mark_width, mark_height)
    build_icons()
    build_og_card(data, mark_width, mark_height)
    sys.exit(0)
