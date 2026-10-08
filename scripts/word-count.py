#!/usr/bin/env python3
"""
Check the written submission against the word limits the brief sets.

    python3 scripts/word-count.py

The brief fixes three limits, and they attach to the submission note (200), the
AI tool proposal (300) and Part 3 as a whole (250) — Part 3 carries both the
measurement answer and the 5,000-visitor scenario, so the two share one budget.
Counting rules are stated here rather than guessed at, so the numbers in the
submission can be reproduced:

  * fenced code blocks, inline code, markdown emphasis and heading markers are
    not prose and are not counted;
  * URLs count as one word, headings and table cell text do count — they are
    part of the answer the assessor reads;
  * a hyphenated compound ("climate-responsive") counts once, and a dash on its
    own counts as nothing.

Exit code is 0 when every limited section is inside its limit.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "ASSESSMENT.md"

# (label, heading the section starts at, end marker — None means to end of file, limit)
LIMITS = [
    ("Part 2 — AI tool", "## Part 2", "\n---\n", 300),
    ("Part 3 — analytics", "## Part 3", "\n---\n", 250),
    ("Submission note", "## Submission note", None, 200),
]

# The brief's four deliverables, which must all be present in the submission.
REQUIRED = ["## Part 1", "## Part 2", "## Part 3", "## Submission note"]

STRIP = [
    (r"```.*?```", " ", re.S),  # fenced blocks
    (r"`[^`]*`", " ", 0),  # inline code
    (r"https?://\S+", " link ", 0),
    (r"\[([^\]]*)\]\([^)]*\)", r"\1", 0),  # links → their text
    (r"^\s*#{1,6}\s*", "", re.M),  # heading markers
    (r"[*_>]+", "", 0),  # emphasis and block quotes
    (r"^\s*[-•]\s+", "", re.M),  # bullets
    (r"^\s*\d+\.\s+", "", re.M),  # numbered list markers
    (r"^\s*\|", " ", re.M),  # table pipes
    (r"\|\s*$", " ", re.M),
    (r"[-–—/|]", " ", 0),  # dashes and slashes are not words
]


def count(text: str) -> int:
    for pattern, replacement, flags in STRIP:
        text = re.compile(pattern, flags).sub(replacement, text)
    return len([word for word in text.split() if any(char.isalnum() for char in word)])


def extract(markdown: str, start: str, end: str | None) -> str:
    if start not in markdown:
        raise SystemExit(f"could not find section {start!r}")
    body = markdown.split(start, 1)[1]
    if end is None:
        return body
    return body.split(end, 1)[0]


def main() -> int:
    markdown = SOURCE.read_text()
    failed = False

    for label, start, end, limit in LIMITS:
        body = extract(markdown, start, end)
        # Drop the heading line itself, which is a label, not part of the answer.
        body = body.split("\n", 1)[1]
        words = count(body)
        state = "PASS" if words <= limit else "FAIL"
        failed |= words > limit
        print(f"  {state} {label:<20} {words:>4} words  (limit {limit})")

    missing = [heading for heading in REQUIRED if heading not in markdown]
    print(f"  {'PASS' if not missing else 'FAIL'} every brief deliverable present"
          + (f" (missing: {', '.join(missing)})" if missing else ""))
    return 1 if failed or missing else 0


if __name__ == "__main__":
    sys.exit(main())
