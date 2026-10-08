#!/usr/bin/env python3
"""
Subset the two brand fonts to exactly what the site needs.

Why this exists — the font budget, measured
-------------------------------------------
`@fontsource-variable/fraunces` ships several axis-flavoured builds of the
Latin subset. Measured on this machine, subsetted to the page's character set:

    axes kept                 size      effect
    opsz + wght              62.6 KB   default shipping build
    opsz only (wght → 400)   31.9 KB   ← what this script produces
    static, opsz 90          16.1 KB   loses small-size rendering quality

The design sets every Fraunces heading and figure at weight 400 — display type
carries weight through size and optical contrast here, not through boldness —
so pinning `wght` to 400 costs nothing visually and halves the file. Keeping
`opsz` is what earns its place: at 84px the hero renders with true display
optical contrast, while an h4 at 24px stays sturdy, with no per-heading
overrides. Dropping `opsz` as well would save a further 16 KB and flatten the
most visible element on the page.

If display weight ever becomes part of the system, change `INSTANCE` to `None`
and the script will ship the full `opsz + wght` range instead.

The output is Latin plus Latin Extended, so Yoruba, Igbo and other Nigerian
orthographies render from the brand face rather than a fallback.

Run:  pip install fonttools brotli && npm run fonts
Then commit the output. Deployment never needs Python.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "node_modules" / "@fontsource-variable"
OUT = ROOT / "public" / "fonts"

# ASCII, Latin-1, Latin Extended-A/B, combining diacritics, general
# punctuation, plus the naira sign, arrows and legal marks used in the markup.
UNICODES = ",".join(
    [
        "U+0020-007E",  # Basic Latin
        "U+00A0-00FF",  # Latin-1 Supplement
        "U+0100-017F",  # Latin Extended-A  (Yoruba, Igbo, Ewe)
        "U+0180-024F",  # Latin Extended-B
        "U+02B0-02FF",  # spacing modifiers (tonal marks)
        "U+0300-036F",  # combining diacritics
        "U+1E00-1EFF",  # Latin Extended Additional
        "U+2000-206F",  # en/em dash, curly quotes, ellipsis
        "U+20A6",  # naira sign
        "U+2190-2199",  # arrows
        "U+2212",  # minus sign
        "U+00A9,U+00AE,U+2122",  # © ® ™
    ]
)

# OpenType features the design relies on: tabular and lining figures for the
# stat block, plus ligatures and contextual alternates for body copy.
FEATURES = "kern,liga,clig,calt,ccmp,locl,onum,lnum,tnum,cv01,cv02,cv03,ss01"

JOBS = [
    {
        "src": SRC / "fraunces" / "files" / "fraunces-latin-opsz-normal.woff2",
        "out": OUT / "fraunces-var.woff2",
        # Pin the weight axis to the single weight the design uses, so the
        # file carries only the optical-size deltas.
        "instance": {"wght": 400},
    },
    {
        "src": SRC / "instrument-sans" / "files" / "instrument-sans-latin-wght-normal.woff2",
        "out": OUT / "instrument-sans-var.woff2",
        # The UI face genuinely needs its range: 400 body, 500 medium,
        # 600 labels and buttons, 700 emphasis.
        "instance": None,
    },
]


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    work = OUT / ".build"
    work.mkdir(exist_ok=True)
    failures = 0
    total_before = total_after = 0

    for job in JOBS:
        src: Path = job["src"]
        out: Path = job["out"]
        if not src.exists():
            print(f"  ! missing source: {src}", file=sys.stderr)
            failures += 1
            continue

        source = src

        # Pin axes first (if any), then subset. Order matters: instancing a
        # variable font is much faster before the glyph set is reduced.
        if job["instance"]:
            instanced = work / f"{out.stem}-instanced.ttf"
            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "fontTools.varLib.instancer",
                    str(src),
                    *[f"{axis}={value}" for axis, value in job["instance"].items()],
                    "-o",
                    str(instanced),
                ],
                check=True,
                capture_output=True,
            )
            source = instanced

        subprocess.run(
            [
                sys.executable,
                "-m",
                "fontTools.subset",
                str(source),
                f"--output-file={out}",
                "--flavor=woff2",
                f"--unicodes={UNICODES}",
                f"--layout-features={FEATURES}",
                "--name-IDs=1,2,3,4,6",
                "--notdef-outline",
                "--recalc-bounds",
                "--drop-tables+=DSIG",
            ],
            check=True,
            capture_output=True,
        )

        before, after = src.stat().st_size, out.stat().st_size
        total_before += before
        total_after += after
        axes = (
            "+".join(a.axisTag for a in TTFont(str(out))["fvar"].axes)
            if "fvar" in TTFont(str(out))
            else "static"
        )
        print(
            f"  {out.name:28} {before / 1024:7.1f} KB → {after / 1024:6.1f} KB   axes: {axes}"
        )

    # Clean up intermediates so nothing stray lands in public/.
    for leftover in work.glob("*"):
        leftover.unlink()
    work.rmdir()

    if total_after:
        print(f"  {'TOTAL':28} {total_before / 1024:7.1f} KB → {total_after / 1024:6.1f} KB")
    return failures


if __name__ == "__main__":
    print("Subsetting brand fonts…")
    sys.exit(main())
