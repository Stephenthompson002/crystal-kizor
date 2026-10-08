#!/usr/bin/env python3
"""
Trace the Crystal Kizor monogram and signature into clean SVG.

Why
---
The supplied logo collection is a raster sheet. Two of its marks are needed as
live site assets, and both have to change colour with their background — the
monogram sits in a light header and a dark footer, and the signature sits on a
dark ground. A raster PNG would need one file per colour.

Both marks are high-contrast black-on-cream line art, which traces cleanly, so
they are converted to vector paths with potrace. The output is a single SVG per
mark with `fill="currentColor"`, so one file serves every context.

Source crops are produced by `extract-marks.mjs` from the Drive asset sheet.

Run:  pip install fonttools brotli potracer && python3 scripts/trace-marks.py
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MARKS = Path("/tmp/marks")  # crops from the logo sheet
OUT = ROOT / "src" / "assets" / "brand"
WORK = Path("/tmp/trace")

# Marks to trace: (source crop, output basename, threshold, turd size,
#                   tolerance, trace width)
#
# Both marks are displayed at under 200 px, so tracing at 1400 px gives a
# comfortable 7× headroom for high-DPI screens. The measured trade-off:
#
#   monogram   900px →  4.8 KB   1400px →  9.3 KB   2200px → 18.0 KB
#   signature  900px →  6.8 KB   1400px → 10.2 KB   2200px → 19.7 KB
#
# 1400 px is where the curves stop visibly improving; beyond it the files
# double for detail no screen can show. `opttolerance` is set high because the
# 4000 px first attempt produced point soup — resolution, not tolerance, is
# what drives these file sizes.
JOBS = [
    # The CK monogram is the primary brand mark, used in the header and footer.
    ("monogram.png", "monogram", 150, 3, 1.5, 1400),
    # The signature is used once, as a closing flourish in the footer.
    ("signature.png", "signature", 150, 3, 1.5, 1400),
]


def prep(src: Path, dst: Path, threshold: int, width: int) -> None:
    """Threshold to pure black/white and resample, which is what potrace wants."""
    subprocess.run(
        [
            "node",
            "-e",
            f"""
            const sharp = require({str(ROOT / 'node_modules' / 'sharp')!r});
            sharp({str(src)!r})
              .resize({{ width: {width}, kernel: 'lanczos3' }})
              .greyscale()
              .threshold({threshold})
              .png()
              .toFile({str(dst)!r})
              .then(() => process.exit(0))
              .catch(e => {{ console.error(e.message); process.exit(1); }});
            """,
        ],
        check=True,
        capture_output=True,
    )


def trace(src: Path, turd: int, tolerance: float):
    """
    Trace a prepped black-on-white PNG.

    potracer's Bitmap takes a numpy array (or a PIL image), not a path. Passing
    an unsigned greyscale array works because the constructor thresholds at 0.5
    and then inverts, which lands ink as the True foreground potrace traces.
    """
    from PIL import Image
    import numpy as np
    from potrace import Bitmap  # type: ignore

    with Image.open(src) as im:
        grey = np.array(im.convert("L"))

    bitmap = Bitmap(grey)
    return bitmap.trace(turdsize=turd, alphamax=1.0, opticurve=1, opttolerance=tolerance)


def to_svg(path, title: str) -> str:
    """Serialise a potrace path to SVG with currentColor fill."""
    xs, ys = [], []
    for curve in path:
        sp = curve.start_point
        xs.append(sp.x)
        ys.append(sp.y)
        for segment in curve:
            if hasattr(segment, "start_point"):
                xs.append(segment.start_point.x)
                ys.append(segment.start_point.y)
            if hasattr(segment, "end_point"):
                xs.append(segment.end_point.x)
                ys.append(segment.end_point.y)
            for attr in ("c", "c1", "c2"):
                pt = getattr(segment, attr, None)
                if pt is not None:
                    xs.append(pt.x)
                    ys.append(pt.y)
    minx, miny, maxx, maxy = min(xs), min(ys), max(xs), max(ys)
    w, h = maxx - minx, maxy - miny

    def fmt(v: float) -> str:
        # 2dp is more than enough at this scale and keeps the file small.
        return f"{v:.2f}".rstrip("0").rstrip(".")

    def pt(p) -> str:
        return f"{fmt(p.x - minx)} {fmt(p.y - miny)}"

    d: list[str] = []
    for curve in path:
        # Every contour needs its own moveto; without it the renderer closes the
        # gap from the previous contour and the shape fills as one blob.
        d.append(f"M{pt(curve.start_point)}")
        for segment in curve:
            if segment.is_corner:
                d.append(f"L{pt(segment.c)}")
                d.append(f"L{pt(segment.end_point)}")
            else:
                d.append(
                    f"C{pt(segment.c1)} {pt(segment.c2)} {pt(segment.end_point)}"
                )
        d.append("Z")

    body = re.sub(r"\s+", " ", "".join(d))

    # Normalise the viewBox so the width is 100 units. Coordinates are scaled
    # rather than the viewBox, which keeps font-size-relative sizing predictable
    # (`h-[1em]`, `w-[3em]`) and the path precision proportional.
    k = 100.0 / w
    scaled = re.sub(
        r"-?\d+(?:\.\d+)?",
        lambda m: f"{float(m.group(0)) * k:.2f}".rstrip("0").rstrip("."),
        body,
    )
    hh = f"{h * k:.2f}".rstrip("0").rstrip(".")

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 {hh}" '
        f'fill="currentColor" role="img" aria-label="{title}">'
        f"<title>{title}</title>"
        f'<path fill-rule="evenodd" d="{scaled}"/>'
        f"</svg>\n"
    )


def main() -> int:
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    failures = 0

    for name, basename, threshold, turd, tolerance, width in JOBS:
        src = MARKS / name
        if not src.exists():
            print(f"  ! missing crop: {src}", file=sys.stderr)
            failures += 1
            continue

        prepped = WORK / f"{basename}.pbm.png"
        prep(src, prepped, threshold, width)

        path = trace(prepped, turd, tolerance)
        title = "Crystal Kizor" if basename == "monogram" else "Crystal Kizor signature"
        svg = to_svg(path, title)

        out = OUT / f"{basename}.svg"
        out.write_text(svg)
        print(f"  {out.name:16} {len(svg) / 1024:6.1f} KB  (traced at {width}px)")

    return failures


if __name__ == "__main__":
    print("Tracing brand marks…")
    sys.exit(main())
