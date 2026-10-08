/**
 * media.ts — every photographic asset, imported once.
 *
 * Importing here (rather than in `site.ts`) keeps the content model free of
 * build-time imports, so the copy in site.ts can be swapped for a CMS later
 * without touching asset handling. Components reach for `media.<key>`.
 *
 * All files are derived from the client-supplied source assets by
 * `scripts/prepare-assets.mjs`, which is the only place that should ever
 * re-encode them.
 */

import portraitHero from '../assets/people/portrait-hero.jpg';
import portraitEditorial from '../assets/people/portrait-editorial.jpg';
import portraitSpeaking from '../assets/people/portrait-speaking.jpg';
import portraitContact from '../assets/people/portrait-contact.jpg';
import studioAtWork from '../assets/people/studio-at-work.jpg';
import studioPodcast from '../assets/people/studio-podcast.jpg';

import studioAtrium from '../assets/work/studio-atrium.jpg';

import natureHomeEntry from '../assets/work/nature-home-entry.jpg';
import natureHomeCantilever from '../assets/work/nature-home-cantilever.jpg';
import natureHomeInterior from '../assets/work/nature-home-interior.jpg';
import natureHomeSide from '../assets/work/nature-home-side.jpg';

import natureHome2Approach from '../assets/work/nature-home-2-approach.jpg';
import natureHome2Wellness from '../assets/work/nature-home-2-wellness.jpg';
import natureHome205 from '../assets/work/nature-home-2-05.jpg';
import natureHome206 from '../assets/work/nature-home-2-06.jpg';

import communityCentreCourt from '../assets/work/community-centre-court.jpg';

export const media = {
  portraitHero,
  portraitEditorial,
  portraitSpeaking,
  portraitContact,
  studioAtWork,
  studioPodcast,
  studioAtrium,
  natureHomeEntry,
  natureHomeCantilever,
  natureHomeInterior,
  natureHomeSide,
  natureHome2Approach,
  natureHome2Wellness,
  natureHome205,
  natureHome206,
  communityCentreCourt,
} as const;

export type MediaKey = keyof typeof media;
