/**
 * prepare-assets.mjs
 *
 * Derives every image this site ships from the supplied source assets.
 *
 * Source assets (client-supplied, not committed — they total ~40 MB):
 *   Crystal Kizor logo collection · 6 professional portraits
 *   Nature Home, Nature Home 2, Community Centre project photography
 *
 * Run:  node scripts/prepare-assets.mjs <path-to-source-assets>
 * Output:
 *   public/brand/…          logo marks, background knocked out + recoloured
 *   src/assets/…            photography, resized and re-encoded for the
 *                           Astro image pipeline to build srcsets from
 *
 * Two deliberate rules encoded here:
 *   1. Logo marks are exported with transparency and exact ink, so they sit on
 *      linen, sand or night without a cream plate behind them.
 *   2. Photography is only ever downscaled, never upscaled. A render is never
 *      presented as a photograph — that distinction is carried in the content
 *      layer (`coka.work[].medium`), not baked into the file.
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = process.argv[2];
if (!SRC || !fs.existsSync(SRC)) {
  console.error('Usage: node scripts/prepare-assets.mjs <source-assets-dir>');
  process.exit(1);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_BRAND = path.join(ROOT, 'public', 'brand');
const ASSETS = path.join(ROOT, 'src', 'assets');

fs.mkdirSync(PUBLIC_BRAND, { recursive: true });
for (const dir of ['people', 'work']) fs.mkdirSync(path.join(ASSETS, dir), { recursive: true });

const px = (p) => path.join(SRC, p);
const log = (label, out) =>
  console.log(`  ${label.padEnd(34)} → ${path.relative(ROOT, out)}`);

/* -------------------------------------------------------------------------- */
/* 1. Logo marks                                                              */
/* -------------------------------------------------------------------------- */

// The collection is a 2-column + 1-wide grid. Cell boundaries were measured
// from the divider rules in the file (x 960, x 1447; y 361 on the right half).
const CELLS = {
  primary: { left: 0, top: 0, width: 958, height: 722 },
  monogram: { left: 962, top: 0, width: 483, height: 359 },
  wordmark: { left: 1449, top: 0, width: 721, height: 359 },
  signature: { left: 962, top: 363, width: 483, height: 359 },
  social: { left: 1449, top: 363, width: 721, height: 359 },
};

/**
 * Within a cell, every mark sits above its own caption ("MONOGRAM LOGO",
 * "PRIMARY LOGO", …). Scanning for contiguous runs of dark rows and keeping
 * the first one isolates the glyph, without hardcoding pixel offsets that
 * would silently break if the sheet were ever re-exported.
 */
async function glyphBounds(cell) {
  const { data, info } = await sharp(px('Crystal Kizor Logo Collection.png'))
    .extract(cell)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const luma = (i) => 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

  let first = null;
  let current = null;

  for (let y = 0; y < height; y++) {
    let minX = Infinity;
    let maxX = -1;
    for (let x = 0; x < width; x++) {
      if (luma((y * width + x) * channels) < 170) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
    if (maxX >= 0) {
      if (!current) current = { top: y, bottom: y, minX, maxX };
      else {
        current.bottom = y;
        current.minX = Math.min(current.minX, minX);
        current.maxX = Math.max(current.maxX, maxX);
      }
    } else if (current) {
      if (!first) first = current; // first run is the mark; the next is its caption
      current = null;
    }
  }
  if (!first) first = current;

  // A few pixels of breathing room so antialiased edges are never clipped.
  const pad = 3;
  const left = Math.max(0, first.minX - pad);
  const top = Math.max(0, first.top - pad);
  return {
    left: cell.left + left,
    top: cell.top + top,
    width: Math.min(width - left, first.maxX - first.minX + 1 + pad * 2),
    height: Math.min(height - top, first.bottom - first.top + 1 + pad * 2),
  };
}

async function cropCell(name) {
  const bounds = await glyphBounds(CELLS[name]);
  return sharp(px('Crystal Kizor Logo Collection.png'))
    .extract(bounds)
    .png()
    .toBuffer({ resolveWithObject: true });
}

/**
 * Turn a dark-on-cream mark into a transparent PNG of one exact colour.
 * Alpha is derived from darkness relative to the paper, which keeps the
 * glyph's own antialiasing intact instead of hard-thresholding it.
 *
 * The paper in the source is not perfectly uniform (there is a faint vignette),
 * so alpha is re-normalised above a small floor. Without that, the residual
 * paper tint survives as a visible cream plate behind the mark on dark grounds.
 */
async function knockout(buffer, ink) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

  const samples = [];
  for (let i = 0; i < data.length; i += channels) {
    samples.push(luma(data[i], data[i + 1], data[i + 2]));
  }
  samples.sort((a, b) => a - b);

  // 96th percentile as "paper" (robust to a few bright specks) and the darkest
  // 0.2th percentile as "ink" (robust to a stray dark pixel).
  const paper = samples[Math.floor(samples.length * 0.96)];
  const inkLum = samples[Math.max(0, Math.floor(samples.length * 0.002))];
  const span = Math.max(1, paper - inkLum);

  // Anything at or above this ramp start is treated as pure paper.
  const FLOOR = 0.1;

  for (let i = 0, o = 0, s = 0; i < data.length; i += channels, o += 4, s++) {
    void s;
    const l = luma(data[i], data[i + 1], data[i + 2]);
    const raw = Math.max(0, Math.min(1, (paper - l) / span));
    const a = raw <= FLOOR ? 0 : (raw - FLOOR) / (1 - FLOOR);
    out[o] = ink[0];
    out[o + 1] = ink[1];
    out[o + 2] = ink[2];
    out[o + 3] = Math.round(a * 255);
  }

  return sharp(out, { raw: { width, height, channels: 4 } });
}

const INK = [23, 19, 15]; // --color-ink   #17130f
const LINEN = [250, 247, 242]; // --color-linen #faf7f2

async function buildMarks() {
  console.log('\nBrand marks');

  const monogram = await cropCell('monogram');
  // The header renders the monogram at 40px tall; 144px is 3.6× that, so it
  // stays crisp on every current display without shipping pixels nobody sees.
  const MONO_H = 144;

  for (const [suffix, colour] of [
    ['ink', INK],
    ['linen', LINEN],
  ]) {
    const out = path.join(PUBLIC_BRAND, `monogram-${suffix}.png`);
    await (await knockout(monogram.data, colour))
      .resize({ height: MONO_H, fit: 'inside', withoutEnlargement: false })
      .png({ compressionLevel: 9, palette: true })
      .toFile(out);
    log(`monogram (${suffix})`, out);
  }

  // Full primary lockup, in both grounds, at the largest size this design uses.
  const primary = await cropCell('primary');
  for (const [suffix, colour] of [
    ['ink', INK],
    ['linen', LINEN],
  ]) {
    const out = path.join(PUBLIC_BRAND, `primary-lockup-${suffix}.png`);
    // Rendered at 176px in the footer; 440px covers 2.5× displays.
    await (await knockout(primary.data, colour))
      .resize({ width: 440, fit: 'inside' })
      .png({ compressionLevel: 9, palette: true, colours: 64 })
      .toFile(out);
    log(`primary lockup (${suffix})`, out);
  }

  // Signature, used on the acknowledgement line.
  const signature = await cropCell('signature');
  const sigOut = path.join(PUBLIC_BRAND, 'signature-ink.png');
  await (await knockout(signature.data, INK))
    .resize({ height: 120, fit: 'inside' })
    .png({ compressionLevel: 9, palette: true })
    .toFile(sigOut);
  log('signature (ink)', sigOut);

  /* ---------------------------------------------------------------------- */
  /* App icons — built from the collection's own "social profile" mark: the */
  /* monogram inside a circle, which is exactly what an icon slot wants.     */
  /* ---------------------------------------------------------------------- */
  const social = await cropCell('social');
  const mark = await (await knockout(social.data, LINEN))
    .resize({ width: 320, fit: 'inside' })
    .png()
    .toBuffer();

  for (const [size, name] of [
    [512, 'icon-512.png'],
    [192, 'icon-192.png'],
    [180, 'apple-touch-icon.png'],
  ]) {
    const out = path.join(ROOT, 'public', name);
    const inner = Math.round(size * 0.66);
    const scaled = await sharp(mark).resize({ width: inner, fit: 'inside' }).toBuffer();
    const meta = await sharp(scaled).metadata();
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 18, g: 16, b: 14, alpha: 1 }, // --color-night
      },
    })
      .composite([
        {
          input: scaled,
          left: Math.round((size - meta.width) / 2),
          top: Math.round((size - meta.height) / 2),
        },
      ])
      .png({ compressionLevel: 9, palette: true, colours: 64 })
      .toFile(out);
    log(`app icon ${size}×${size}`, out);
  }
}

/* -------------------------------------------------------------------------- */
/* 2. Photography                                                             */
/* -------------------------------------------------------------------------- */

const PHOTOS = [
  // Portraits
  ['Architectural Studio Portrait.png', 'people/portrait-hero.jpg', 1600],
  ['Earthy Editorial Portrait by African Architecture.png', 'people/portrait-editorial.jpg', 1600],
  ['Cozy Architecture Podcast Workspace.png', 'people/studio-podcast.jpg', 1600],
  ['Confident Designer in Studio Workspace.png', 'people/portrait-speaking.jpg', 1500],
  ['Poised in a Warm Design Studio.png', 'people/portrait-contact.jpg', 1400],
  ['Architectural Designer in Her Studio.png', 'people/studio-at-work.jpg', 1400],

  // Nature Home (photographs of the built house)
  ['nh1/Front View with Tree shade.jpeg', 'work/nature-home-entry.jpg', 1400],
  ['nh1/Shade with Cantilevers.jpeg', 'work/nature-home-cantilever.jpg', 1400],
  ['nh1/Family Sitting Room 2.jpeg', 'work/nature-home-interior.jpg', 1400],
  ['nh1/25.png', 'work/nature-home-side.jpg', 1400],

  // Studio COKA fit-out (photograph)
  ['78FFAF38-4097-40FA-93AB-CE632EFB666E_1_105_c.jpeg', 'work/studio-atrium.jpg', 1200],

  // Nature Home 2 (visualisations)
  ['nh2/1.png', 'work/nature-home-2-approach.jpg', 1600],
  ['nh2/8.jpeg', 'work/nature-home-2-wellness.jpg', 1400],
  ['nh2/4.jpeg', 'work/nature-home-2-05.jpg', 1400],
  ['nh2/3.jpeg', 'work/nature-home-2-06.jpg', 1400],

  // Community Centre (visualisation)
  ['cc/IMG_2105 2.JPG', 'work/community-centre-court.jpg', 1800],
];

async function buildPhotos() {
  console.log('\nPhotography');
  let totalIn = 0;
  let totalOut = 0;

  for (const [from, to, maxEdge] of PHOTOS) {
    const source = px(from);
    if (!fs.existsSync(source)) {
      console.log(`  ! missing ${from}`);
      continue;
    }
    const out = path.join(ASSETS, to);
    const meta = await sharp(source).metadata();

    await sharp(source)
      .rotate() // respect EXIF orientation
      .resize({
        width: meta.width >= meta.height ? maxEdge : undefined,
        height: meta.height > meta.width ? maxEdge : undefined,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(out);

    const inSize = fs.statSync(source).size;
    const outSize = fs.statSync(out).size;
    totalIn += inSize;
    totalOut += outSize;
    log(
      `${path.basename(from)} (${meta.width}×${meta.height})`,
      out
    );
  }

  console.log(
    `\n  source ${(totalIn / 1048576).toFixed(1)} MB → committed ${(totalOut / 1048576).toFixed(1)} MB`
  );
}

await buildMarks();
await buildPhotos();
console.log('\nDone.');
