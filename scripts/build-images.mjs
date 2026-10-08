/**
 * Build the site's image set from the supplied photography.
 *
 * Source files live in assets-src/ (the untouched Drive download, git-ignored).
 * This script crops, grades and resizes them into src/assets/work/, which is
 * committed and picked up by Astro's image pipeline at build time.
 *
 * Why a script instead of hand-cropping: the crops encode real art direction —
 * which part of each frame carries the point — and doing it here means the
 * decision is reviewable and repeatable rather than lost in a GUI session.
 *
 * Usage:  node scripts/build-images.mjs
 */

import sharp from 'sharp';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/** Upper bound per image, in bytes. Keeps a single frame from dominating the page. */
const BUDGET = 400 * 1024;

const SRC = 'assets-src';
const OUT = 'src/assets/work';

/**
 * Each entry: source file, output name, and the crop.
 *
 * `position` is sharp's gravity and does the framing. Aspect ratios are chosen
 * to suit where the image lands: 4/5 for the tall hero and sidebar figures,
 * 3/2 and 16/9 for the wide band and cards.
 */
const JOBS = [
  // --- Portraits ---------------------------------------------------------
  {
    src: 'Architectural Studio Portrait.png',
    out: 'portrait-hero',
    ratio: [4, 5],
    position: 'attention',
    alt: 'Crystal Kizor leaning on a stone-topped drawing table in her studio, with plans and material samples behind her and a city view through the window',
  },
  {
    src: 'Architectural Designer in Her Studio.png',
    out: 'portrait-about',
    ratio: [4, 5],
    position: 'attention',
    alt: 'Crystal Kizor at her desk, hand to her chin, with plans, elevations and material samples pinned to the wall behind her',
  },
  {
    src: 'Earthy Editorial Portrait by African Architecture.png',
    out: 'portrait-editorial',
    ratio: [5, 4],
    position: 'attention',
    alt: 'Crystal Kizor seated in a wooden armchair in a tailored brown blazer, beside a large woven planter and a wall of drawings',
  },
  {
    src: 'Confident Designer in Studio Workspace.png',
    out: 'portrait-speaking',
    ratio: [3, 4],
    position: 'attention',
    alt: 'Crystal Kizor standing with her arms folded in a brown blazer, in front of a studio wall of drawings and material samples',
  },
  {
    src: 'Cozy Architecture Podcast Workspace.png',
    out: 'portrait-tea',
    ratio: [3, 2],
    position: 'attention',
    alt: 'Crystal Kizor at a desk with a laptop and a microphone, hand to her chin, in front of a full bookshelf',
  },

  // --- Nature Home 2 (Drive folder: "Nature Home 2") ---------------------
  {
    src: '1.png',
    out: 'nature-home-2-courtyard',
    tame: true,
    ratio: [4, 3],
    position: 'centre',
    alt: 'The courtyard elevation of Nature Home 2, with stepped planting, a reflecting pool and a deep shaded verandah',
  },
  {
    src: '2.jpeg',
    out: 'nature-home-2-dining',
    ratio: [3, 2],
    position: 'centre',
    alt: 'An open dining and living space at Nature Home 2 opening onto a covered garden terrace',
  },
  {
    src: '3.jpeg',
    out: 'nature-home-2-living',
    ratio: [3, 2],
    position: 'centre',
    alt: 'A timber-lined open plan kitchen and living space at Nature Home 2, looking through to the garden',
  },
  {
    src: '4.jpeg',
    out: 'nature-home-2-bedroom',
    ratio: [4, 3],
    position: 'centre',
    alt: 'A bedroom at Nature Home 2 opening onto a private water court and planting',
  },
  {
    src: '6.jpeg',
    out: 'nature-home-2-bath',
    ratio: [3, 4],
    position: 'centre',
    alt: 'A bathroom at Nature Home 2 set against perforated brickwork with a planted light court beyond',
  },
  {
    src: '7.jpeg',
    out: 'nature-home-2-kitchen',
    ratio: [3, 2],
    position: 'centre',
    alt: 'A timber-lined kitchen at Nature Home 2 with a full-height window onto the garden',
  },
  {
    src: '8.jpeg',
    out: 'nature-home-2-gym',
    ratio: [3, 2],
    position: 'centre',
    alt: 'A home gym at Nature Home 2, glazed on two sides and looking out onto planting',
  },

  // --- Nature Home (Drive folder: "Nature Home") -------------------------
  {
    src: 'Front View with Tree shade.jpeg',
    out: 'nature-home-frontage',
    ratio: [4, 3],
    position: 'centre',
    alt: 'The Nature Home frontage held in the deep shade of a mature tree, with the drive and car port below',
  },
  {
    src: 'New tree_back garden.jpeg',
    out: 'nature-home-garden',
    ratio: [3, 2],
    position: 'centre',
    alt: 'A paved entrance court with a grid of planting and a covered walkway at Nature Home',
  },
  {
    src: 'Shade with Cantilevers.jpeg',
    out: 'nature-home-cantilevers',
    ratio: [3, 4],
    position: 'centre',
    alt: 'A cantilevered eave throwing deep shade across a Studio COKA verandah and its planting',
  },
  {
    src: 'Family Sitting Room 2.jpeg',
    out: 'nature-home-sitting',
    ratio: [3, 2],
    position: 'centre',
    alt: 'A bright family sitting room at Nature Home with sheer drapes filtering daylight across pale upholstery',
  },
  {
    src: 'Bedroom 3.jpeg',
    out: 'nature-home-bedroom',
    ratio: [3, 4],
    position: 'centre',
    alt: 'A bedroom at Nature Home with a louvred clerestory window and curtains drawn against the sun',
  },
  {
    src: 'Dividers.jpeg',
    out: 'nature-home-divider',
    ratio: [4, 3],
    position: 'centre',
    alt: 'A timber-screened interior corner at Nature Home with two armchairs against slatted panelling',
  },
  {
    src: 'B56D4EDB-41B6-48F7-AF8C-13AFA6AFCC76_1_201_a.jpeg',
    out: 'nature-home-study',
    ratio: [4, 3],
    position: 'centre',
    alt: 'A timber-lined study at Nature Home with a desk, a bookcase and shelving',
  },
  {
    src: 'ED948444-A053-4E8D-87A5-900D66602868_1_201_a.jpeg',
    out: 'nature-home-gym',
    ratio: [4, 3],
    position: 'centre',
    alt: 'A home gym at Nature Home, with equipment set against a glazed wall',
  },
  {
    src: '78FFAF38-4097-40FA-93AB-CE632EFB666E_1_105_c.jpeg',
    out: 'studio-model',
    ratio: [3, 4],
    position: 'centre',
    alt: 'A Studio COKA working drawing beside a physical massing model on a desk',
  },

  // --- Community Centre Project -----------------------------------------
  {
    src: 'IMG_2041 2.PNG',
    out: 'community-hall',
    tame: true,
    ratio: [3, 2],
    position: 'centre',
    alt: 'A tiered seating hall at the community centre beneath a woven timber roof, with pierced screens casting patterned light',
  },
  {
    src: 'IMG_2103 2.PNG',
    out: 'community-corridor',
    ratio: [3, 2],
    position: 'centre',
    alt: 'A shaded gallery at the community centre, its walls pierced with screens and hung with framed work',
  },
  {
    src: 'IMG_2105 2.JPG',
    out: 'community-court',
    tame: true,
    ratio: [4, 3],
    position: 'centre',
    alt: 'An oval courtyard at the community centre built around a retained tree, with stepped seating',
  },
];

const main = async () => {
  mkdirSync(OUT, { recursive: true });
  const available = new Set(readdirSync(SRC));
  let made = 0;
  let skipped = 0;

  for (const job of JOBS) {
    if (!available.has(job.src)) {
      console.warn(`  ! missing source: ${job.src}`);
      skipped++;
      continue;
    }

    const [w, h] = job.ratio;
    const targetWidth = w >= h ? 1600 : 1200;

    const pipeline = sharp(path.join(SRC, job.src))
      .resize({
        width: targetWidth,
        height: Math.round((targetWidth * h) / w),
        fit: 'cover',
        position: job.position,
        withoutEnlargement: false,
      })
      // A whisper of sharpening counteracts the softening from resampling.
      .sharpen({ sigma: 0.6 });

    // A few frames carry so much high-frequency detail that WebP cannot get
    // under the budget at any sane quality. A light median pass removes the
    // sensor grain the encoder is spending bytes on, without touching detail
    // that is visible at display size.
    if (job.tame) pipeline.median(3);

    // Per-file size budget. Busy frames (a courtyard full of planting, a hall
    // full of detail) cost far more bytes than a flat interior at the same
    // quality, so step the quality down only as far as each file needs.
    const out = path.join(OUT, `${job.out}.webp`);
    let buffer = null;
    let used = 80;
    for (const quality of [80, 72, 64, 56, 48]) {
      used = quality;
      buffer = await pipeline.clone().webp({ quality, effort: 5 }).toBuffer();
      if (buffer.length <= BUDGET) break;
    }
    writeFileSync(out, buffer);

    const meta = await sharp(out).metadata();
    console.log(
      `  ${job.out.padEnd(26)} ${`${meta.width}×${meta.height}`.padEnd(11)} ${(buffer.length / 1024)
        .toFixed(0)
        .padStart(4)} KB  q${used}`,
    );
    made++;
  }

  console.log(`\n${made} images written to ${OUT}/, ${skipped} skipped.`);
};

await main();
