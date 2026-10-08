/**
 * Project register.
 *
 * Every entry maps to a folder of supplied assets, and the images used are the
 * ones from that folder. Where a project appears in the brief or on Studio
 * COKA's public site but no imagery was supplied, it is listed without an image
 * rather than illustrated with something that is not it — a portfolio page
 * cannot afford to misattribute work.
 *
 * Images are imported statically so Astro can hash, resize and emit a srcset.
 */

import natureHome2Courtyard from '../assets/work/nature-home-2-courtyard.webp';
import natureHome2Living from '../assets/work/nature-home-2-living.webp';
import natureHome2Dining from '../assets/work/nature-home-2-dining.webp';
import natureHome2Bedroom from '../assets/work/nature-home-2-bedroom.webp';
import natureHome2Kitchen from '../assets/work/nature-home-2-kitchen.webp';
import natureHome2Bath from '../assets/work/nature-home-2-bath.webp';
import natureHomeFrontage from '../assets/work/nature-home-frontage.webp';
import natureHomeGarden from '../assets/work/nature-home-garden.webp';
import natureHomeCantilevers from '../assets/work/nature-home-cantilevers.webp';
import natureHomeSitting from '../assets/work/nature-home-sitting.webp';
import natureHomeBedroom from '../assets/work/nature-home-bedroom.webp';
import natureHomeStudy from '../assets/work/nature-home-study.webp';
import communityCourt from '../assets/work/community-court.webp';
import communityHall from '../assets/work/community-hall.webp';
import communityCorridor from '../assets/work/community-corridor.webp';

export type Project = {
  id: string;
  title: string;
  place: string;
  type: string;
  year?: string;
  note: string;
  /** Lead image. Omit when no supplied asset belongs to this project. */
  image?: ImageMetadata;
  imageAlt?: string;
  /** Additional frames for the project's small gallery. */
  gallery?: { image: ImageMetadata; alt: string }[];
  /**
   * A before/after pair of the same place, for the drag-to-compare slider.
   * Each side takes an `image` once the photograph is supplied; until then the
   * slider shows the labelled placeholder for that side.
   */
  beforeAfter?: {
    before: { image?: ImageMetadata; alt: string; label: string };
    after: { image?: ImageMetadata; alt: string; label: string };
  };
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: 'tesh',
    title: 'The Eye Specialists Hospital',
    place: 'Nsukka, Enugu State',
    type: 'Healthcare · Renovation',
    year: '2018 – 2019',
    note: 'Nigeria’s first fully off-grid hospital. An existing residential building retained and transformed around daylight, natural ventilation and a standalone solar system.',
    // Only photographs of this building are used here. The before and after
    // frames are the same place, shot by the practice, and shown with the
    // measured results. Nothing is borrowed from another project.
    beforeAfter: {
      before: {
        alt: 'The Eye Specialists Hospital before renovation, when the building was an existing residential structure',
        label: 'Before — the existing building, pre-renovation photograph to be supplied',
      },
      after: {
        alt: 'The Eye Specialists Hospital after renovation, with its daylit atrium and open, naturally ventilated interior',
        label: 'After — the renovated hospital, photograph to be supplied',
      },
    },
    featured: true,
  },
  {
    id: 'nature-home-2',
    title: 'Nature Home 2',
    place: 'Enugu, Nigeria',
    type: 'Private residential',
    note: 'A tropical home organised around airflow, shade and the garden it sits in — full-height openings, deep verandahs, and water and planting brought right up to the glass.',
    image: natureHome2Courtyard,
    imageAlt:
      'The courtyard elevation of Nature Home 2, with stepped planting, a reflecting pool and a deep shaded verandah',
    gallery: [
      {
        image: natureHome2Living,
        alt: 'A timber-lined open plan kitchen and living space at Nature Home 2, looking through to the garden',
      },
      {
        image: natureHome2Dining,
        alt: 'An open dining space at Nature Home 2 opening onto a covered garden terrace',
      },
      {
        image: natureHome2Bedroom,
        alt: 'A bedroom at Nature Home 2 opening onto a private water court and planting',
      },
      {
        image: natureHome2Kitchen,
        alt: 'A kitchen at Nature Home 2 with a full-height window onto the garden',
      },
      {
        image: natureHome2Bath,
        alt: 'A bathroom at Nature Home 2 set against perforated brickwork with a planted light court beyond',
      },
    ],
  },
  {
    id: 'nature-home',
    title: 'Nature Home',
    place: 'Enugu, Nigeria',
    type: 'Private residential',
    note: 'The first of the two. A house frontage held in the shade of a retained tree, with a grid-planted entrance court and interiors built around filtered daylight.',
    image: natureHomeFrontage,
    imageAlt:
      'The Nature Home frontage held in the deep shade of a mature tree, with the drive and car port below',
    gallery: [
      {
        image: natureHomeCantilevers,
        alt: 'A cantilevered eave throwing deep shade across a verandah and its planting',
      },
      {
        image: natureHomeGarden,
        alt: 'A paved entrance court with a grid of planting and a covered walkway',
      },
      {
        image: natureHomeSitting,
        alt: 'A bright family sitting room with sheer drapes filtering daylight across pale upholstery',
      },
      {
        image: natureHomeBedroom,
        alt: 'A bedroom with a louvred clerestory window and curtains drawn against the sun',
      },
      {
        image: natureHomeStudy,
        alt: 'A timber-lined study with a desk, bookcase and a window looking onto a mature tree',
      },
    ],
  },
  {
    id: 'community-centre',
    title: 'Community Centre',
    place: 'Enugu State, Nigeria',
    type: 'Civic · Cultural',
    note: 'A civic scheme built around a retained tree: a woven timber roof over a shaded court, pierced blockwork screens, and a gallery that carries exhibitions through the building.',
    image: communityCourt,
    imageAlt:
      'An oval courtyard at the community centre built around a retained tree, with stepped seating',
    gallery: [
      {
        image: communityHall,
        alt: 'A community hall with a woven timber roof structure and pierced blockwork casting patterned light',
      },
      {
        image: communityCorridor,
        alt: 'A shaded gallery carrying exhibitions beneath a slatted timber ceiling',
      },
    ],
  },
];

/**
 * Projects that appear in Studio COKA's public portfolio but for which no
 * assets were supplied. Listed as text so the register is honest about the
 * breadth of the practice without illustrating work we cannot show.
 */
export const alsoInPortfolio = [
  { title: 'International Event Center', place: 'Enugu, Nigeria', type: 'Civic · Cultural' },
  { title: 'Garden Home', place: 'Kigali, Rwanda', type: 'Residential' },
  { title: 'Pine Towers', place: 'Enugu, Nigeria', type: 'Mixed use' },
] as const;
