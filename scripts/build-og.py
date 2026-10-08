#!/usr/bin/env python3
"""
Build the 1200×630 Open Graph card.

Why this is generated rather than drawn in a design tool
--------------------------------------------------------
The card has to carry the same type and the same mark as the page, so that a
link shared in a WhatsApp group or on LinkedIn looks like it came from the same
place. Generating it from `public/brand/primary-lockup-linen.png` and the actual
brand font files means it can never drift from the identity.

There is no headless browser and no system font set in the build environment,
so type is converted to SVG paths with fontTools before rasterising. That is why
this is Python calling Node (for `sharp`) rather than a single script.

Run:  pip install fonttools brotli && python3 scripts/build-og.py
Output: public/og.png (1200×630)

Re-run whenever the headline or the lockup changes.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

try:
    from fontTools.misc.transform import Transform
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    from fontTools.ttLib import TTFont
    from fontTools.ttLib.woff2 import decompress
    from fontTools.varLib import instancer
except ImportError:
    sys.exit("Missing dependency. Run: pip install fonttools brotli")

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "node_modules" / "@fontsource-variable"
WORK = ROOT / ".cache" / "og"
WORK.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630

# The card is composed in these steps, in order.
HEADLINE = ("Design for the climate", "you actually have.")
EYEBROW = "ARCHITECT  ·  DESIGNER  ·  FOUNDER, STUDIO COKA"
SUB = "Nigeria’s first fully off-grid hospital  ·  Climate-responsive architecture"


def load(kind: str, weight: int) -> TTFont:
    """Decompress a variable woff2 and pin it to a single weight."""
    src = (
        FONTS / "fraunces" / "files" / "fraunces-latin-opsz-normal.woff2"
        if kind == "display"
        else FONTS / "instrument-sans" / "files" / "instrument-sans-latin-wght-normal.woff2"
    )
    ttf = WORK / f"{kind}-{weight}.ttf"
    if not ttf.exists():
        decompress(str(src), str(ttf))
    font = TTFont(str(ttf))

    if "fvar" in font:
        axes = {a.axisTag: a for a in font["fvar"].axes}
        coords: dict[str, float] = {}
        if "wght" in axes and axes["wght"].minValue <= weight <= axes["wght"].maxValue:
            coords["wght"] = weight
        if "opsz" in axes:
            a = axes["opsz"]
            # Display optical size for the headline, text size for small type.
            coords["opsz"] = max(a.minValue, min(a.maxValue, 96 if weight <= 500 else 14))
        if coords:
            font = instancer.instantiateVariableFont(font, coords, inplace=False)
    return font


def to_paths(font: TTFont, text: str, size: float, x: float, y: float, tracking: float = 0.0):
    """Return (svg path data, advance width) for `text` with its baseline at y."""
    upm = font["head"].unitsPerEm
    scale = size / upm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    glyphs = font.getGlyphSet()

    parts: list[str] = []
    cursor = x
    for char in text:
        name = cmap.get(ord(char))
        if name is None:
            cursor += size * 0.3
            continue
        pen = SVGPathPen(glyphs)
        # Font space is Y-up, SVG is Y-down — hence the negative Y scale.
        glyphs[name].draw(TransformPen(pen, Transform(scale, 0, 0, -scale, cursor, y)))
        d = pen.getCommands()
        if d:
            parts.append(d)
        cursor += hmtx[name][0] * scale + tracking
    return " ".join(parts), cursor - x


def main() -> int:
    display = load("display", 400)
    sans_bold = load("sans", 600)
    sans = load("sans", 500)

    h1_size, h1_track = 74, -1.6
    line1_y = 340
    line2_y = line1_y + 86

    p1, _ = to_paths(display, HEADLINE[0], h1_size, 96, line1_y, h1_track)
    p2, _ = to_paths(display, HEADLINE[1], h1_size, 96, line2_y, h1_track)
    p_eb, _ = to_paths(sans_bold, EYEBROW, 17, 98, 236, 3.4)
    p_sub, _ = to_paths(sans, SUB, 20, 98, H - 88, 0.1)

    rule_y = H - 118

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <radialGradient id="glow" cx="86%" cy="-8%" r="78%">
      <stop offset="0%" stop-color="#c08a3e" stop-opacity="0.30"/>
      <stop offset="55%" stop-color="#c08a3e" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#12100e" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="-6%" cy="108%" r="70%">
      <stop offset="0%" stop-color="#a9491f" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#a9491f" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="88" height="88" patternUnits="userSpaceOnUse">
      <path d="M 88 0 L 0 0 0 88" fill="none" stroke="#faf7f2" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="{W}" height="{H}" fill="#12100e"/>
  <rect width="{W}" height="{H}" fill="url(#grid)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>
  <rect width="{W}" height="{H}" fill="url(#glow2)"/>

  <path d="{p_eb}" fill="#faf7f2" fill-opacity="0.62"/>
  <path d="{p1}" fill="#faf7f2"/>
  <path d="{p2}" fill="#c08a3e"/>

  <line x1="96" y1="{rule_y}" x2="{W - 96}" y2="{rule_y}" stroke="#faf7f2" stroke-opacity="0.16"/>
  <path d="{p_sub}" fill="#faf7f2" fill-opacity="0.66"/>
</svg>
"""

    svg_path = WORK / "og.svg"
    svg_path.write_text(svg)
    out = ROOT / "public" / "og.png"
    lockup = ROOT / "public" / "brand" / "primary-lockup-linen.png"

    if not lockup.exists():
        sys.exit("Missing public/brand/primary-lockup-linen.png — run prepare-assets.mjs first")

    script = f"""
    const sharp = require({json.dumps(str(ROOT / 'node_modules' / 'sharp'))});
    (async () => {{
      const W = {W}, H = {H};
      const base = await sharp({json.dumps(str(svg_path))}, {{ density: 144 }})
        .resize(W, H, {{ fit: 'fill' }})
        .png()
        .toBuffer();

      // The real primary lockup, knocked out to linen by prepare-assets.mjs.
      const mark = await sharp({json.dumps(str(lockup))})
        .resize({{ width: 268, fit: 'inside' }})
        .toBuffer();

      await sharp(base)
        .composite([{{ input: mark, left: 96, top: 78 }}])
        .png({{ compressionLevel: 9 }})
        .toFile({json.dumps(str(out))});

      const info = await sharp({json.dumps(str(out))}).metadata();
      const kb = (require('fs').statSync({json.dumps(str(out))}).size / 1024).toFixed(1);
      console.log('  og.png ' + info.width + 'x' + info.height + '  ' + kb + ' KB');
    }})().catch((e) => {{ console.error(e); process.exit(1); }});
    """

    print("Building social card…")
    subprocess.run(["node", "-e", script], check=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
