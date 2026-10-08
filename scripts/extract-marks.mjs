/**
 * Extract the individual brand marks from the supplied logo collection sheet.
 *
 * The Drive asset is one 2172×724 presentation sheet containing five lockups
 * plus their captions. This script finds each lockup by its ink bounding box
 * (rather than hard-coding coordinates, which broke the first time), crops it
 * with padding, and writes the crops to /tmp/marks for `trace-marks.py` to
 * vectorise.
 *
 * Usage:  node scripts/extract-marks.mjs
 * Input:  assets-src/Crystal Kizor Logo Collection.png
 * Output: /tmp/marks/{monogram,signature,horizontal,social}.png
 *
 * assets-src/ is the untouched Drive download and is git-ignored; the processed
 * output lives in src/assets/brand/ and is committed.
 */

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SRC = 'assets-src/Crystal Kizor Logo Collection.png';
const OUT = '/tmp/marks';

/**
 * Sheet geometry. The sheet is one large panel on the left and a 2×2 grid on
 * the right, so the dividing rules sit at x ≈ 950 and x ≈ 1447 and y ≈ 359.
 * These were measured from the luminance profile of the file rather than
 * eyeballed — an earlier guess at 1560 split the monogram down the middle.
 */
const CELLS = {
  primary: { x: [0, 948], y: [0, 723], thr: 100 },
  monogram: { x: [952, 1445], y: [0, 358], thr: 100 },
  horizontal: { x: [1449, 2171], y: [0, 358], thr: 100 },
  signature: { x: [952, 1445], y: [360, 723], thr: 100 },
  social: { x: [1449, 2171], y: [360, 723], thr: 100 },
};

/**
 * Ink bounding box within a cell, in the cell's own coordinates.
 *
 * Every cell contains a lockup *and* an uppercase caption below it, separated
 * by a wide gap. Row-ink segmentation is used to keep the lockup and drop the
 * caption, so the crop never depends on hard-coded coordinates.
 */
function inkBox(data, channels, width, cell, { pad = 10, dropLeft = 0 } = {}) {
  const { x: [x0, x1], y: [y0, y1], thr } = cell;
  const lum = (x, y) => {
    const i = (y * width + x) * channels;
    return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  };

  // Total ink per row, so the lockup can be told apart from its caption.
  const rows = [];
  for (let y = y0; y < y1; y++) {
    let n = 0;
    for (let x = x0 + dropLeft; x < x1; x++) if (lum(x, y) < thr) n++;
    rows.push({ y, n });
  }

  // Split into contiguous bands of ink. A gap of more than 12 rows means the
  // next band is a separate element — in practice, the caption.
  const bands = [];
  let band = null;
  for (const row of rows) {
    if (row.n > 0) {
      if (!band) band = { y0: row.y, y1: row.y, ink: 0 };
      band.y1 = row.y;
      band.ink += row.n;
    } else if (band && row.y - band.y1 > 12) {
      bands.push(band);
      band = null;
    }
  }
  if (band) bands.push(band);
  if (bands.length === 0) return null;

  // The lockup carries far more ink than its caption, so keep the heaviest band.
  const mark = bands.reduce((a, b) => (b.ink > a.ink ? b : a));

  // The same segmentation horizontally. Some cells carry a small stray mark
  // bled in from the neighbouring lockup; requiring a wide contiguous run of
  // ink columns drops it without touching the mark itself.
  const cols = [];
  for (let x = x0 + dropLeft; x < x1; x++) {
    let n = 0;
    for (let y = mark.y0; y <= mark.y1; y++) if (lum(x, y) < thr) n++;
    cols.push({ x, n });
  }

  const colBands = [];
  let colBand = null;
  for (const col of cols) {
    if (col.n > 0) {
      if (!colBand) colBand = { x0: col.x, x1: col.x, ink: 0 };
      colBand.x1 = col.x;
      colBand.ink += col.n;
    } else if (colBand && col.x - colBand.x1 > 12) {
      colBands.push(colBand);
      colBand = null;
    }
  }
  if (colBand) colBands.push(colBand);
  if (colBands.length === 0) return null;

  // Keep every band that carries real ink and drop the trivial ones. Taking
  // the widest band alone split the CK monogram, whose C and K are separated
  // by more than the gap threshold; weighting by ink instead keeps both
  // letters while discarding a stray speck.
  const totalInk = colBands.reduce((sum, b) => sum + b.ink, 0);
  const kept = colBands.filter((b) => b.ink >= totalInk * 0.02);
  if (kept.length === 0) return null;

  const firstX = Math.min(...kept.map((b) => b.x0));
  const lastX = Math.max(...kept.map((b) => b.x1));

  const left = Math.max(0, firstX - pad);
  const top = Math.max(0, mark.y0 - pad);
  return {
    left,
    top,
    width: Math.min(x1 - left, lastX - firstX + 1 + pad * 2),
    height: Math.min(y1 - top, mark.y1 - mark.y0 + 1 + pad * 2),
  };
}

const main = async () => {
  mkdirSync(OUT, { recursive: true });

  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });

  // Only the monogram (header/footer) and signature (footer flourish) are
  // needed as live site marks. The horizontal wordmark is set in type instead
  // of an image, so the text is selectable and searchable.
  const wanted = ['monogram', 'signature'];

  const boxes = {};
  for (const name of wanted) {
    const opts = {};
    const box = inkBox(data, info.channels, info.width, CELLS[name], opts);
    if (!box) {
      console.error(`  ! no ink found for ${name}`);
      continue;
    }
    boxes[name] = box;
    await sharp(SRC).extract(box).png().toFile(`${OUT}/${name}.png`);
    console.log(`  ${name.padEnd(11)} ${box.width}×${box.height} at (${box.left},${box.top})`);
  }

  writeFileSync(`${OUT}/boxes.json`, JSON.stringify(boxes, null, 2));
  console.log(`\nWrote ${Object.keys(boxes).length} crops to ${OUT}/`);
};

await main();
