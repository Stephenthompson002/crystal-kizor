/**
 * Single source of truth for all page content.
 *
 * Editorial rules applied here:
 *  - Claims are limited to information that is publicly verifiable
 *    (Studio COKA's own site, Reuters / bird Story Agency coverage, TEDx
 *    speaker listing, published awards). Nothing is invented.
 *  - Where a brand has a thin public footprint, it is presented with the
 *    confidence its evidence supports — no overstated traction.
 *  - Every one of these values is designed to be replaced from a CMS or
 *    JSON file without touching a component.
 */

export const meta = {
  name: 'Crystal Kizor',
  role: 'Architect · Designer · Founder, Studio COKA',
  location: 'Enugu & Lagos, Nigeria',
  email: 'hello@crystalkizor.com', // ← replace with the live inbox
  site: 'https://crystalkizor.com',
  tagline: 'Buildings that already belong to the climate they stand in.',
};

/**
 * Social accounts. The first three handles are public and verified.
 * The YouTube entry currently points at a search because the channel handle
 * is not publicly listed anywhere on her profiles — once the channel URL is
 * confirmed, replace the href with it (one line, no component changes).
 */
export const socials = [
  { label: 'Instagram', handle: '@crystalkizor', href: 'https://www.instagram.com/crystalkizor/' },
  { label: 'X', handle: '@crystal_kizor', href: 'https://x.com/crystal_kizor' },
  { label: 'LinkedIn', handle: 'Crystal Kizor', href: 'https://www.linkedin.com/in/crystal-kizor/' },
  {
    label: 'YouTube',
    handle: 'Crystal Kizor',
    href: 'https://www.youtube.com/results?search_query=crystal+kizor+architecture',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Proof — the numbers the flagship project actually produced.                 */
/* -------------------------------------------------------------------------- */

export const proofStats = [
  {
    value: '100%',
    label: 'of the hospital’s power generated on site',
    detail: 'Standalone solar and inverter system, independent of the national grid.',
  },
  {
    value: '95%',
    label: 'reduction in diesel use',
    detail: 'Measured against the building’s pre-renovation running costs.',
  },
  {
    value: '400%',
    label: 'increase in patient visits',
    detail: 'Comfort and reliability changed whether people came.',
  },
  {
    value: '₦8M',
    label: 'saved annually in energy costs',
    detail: 'With daylight and ventilation doing the work first.',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Audience router — the answer to "where should I go next?"                   */
/* -------------------------------------------------------------------------- */

export const audiences = [
  {
    id: 'clients',
    kicker: 'Planning a building',
    title: 'You need a practice that can take the project end to end.',
    body: 'Homes, healthcare, commercial and civic work — designed and delivered climate-first by Studio COKA.',
    action: 'Start a project',
    href: '#studio-coka',
    primary: true,
  },
  {
    id: 'professionals',
    kicker: 'Architect, student or professional',
    title: 'You want practical tropical design you can use on Monday.',
    body: 'The Effective Architect teaches the passive strategies behind the work — orientation, shading, airflow, material.',
    action: 'Join the waitlist',
    href: '#knowledge',
    primary: false,
  },
  {
    id: 'speaking',
    kicker: 'Hosting an event',
    title: 'You are looking for a speaker on climate and African cities.',
    body: 'Keynotes, panels and workshops on climate-responsive design, indigenous knowledge and building in Africa.',
    action: 'Request Crystal',
    href: '#speaking',
    primary: false,
  },
  {
    id: 'press',
    kicker: 'Media, press and research',
    title: 'You need quotes, images or a project walkthrough.',
    body: 'The off-grid hospital has been covered internationally. Media kit, imagery and interview slots on request.',
    action: 'Get in touch',
    href: '#contact',
    primary: false,
  },
  {
    id: 'collaborators',
    kicker: 'Collaboration and partnership',
    title: 'You want to build something with Crystal, not just hire her.',
    body: 'Product, research, education and ecosystem partnerships across the Studio COKA group.',
    action: 'Pitch a collaboration',
    href: '#contact',
    primary: false,
  },
  {
    id: 'community',
    kicker: 'Young people and faith',
    title: 'You are looking for community, purpose or a way in.',
    body: 'AKO Alliance expands access to education. Alive and Free walks with young people in faith and freedom.',
    action: 'Find your place',
    href: '#initiatives',
    primary: false,
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Studio COKA                                                                 */
/* -------------------------------------------------------------------------- */

export const coka = {
  name: 'Studio COKA',
  descriptor: 'Climate-responsive architecture, interiors and design-build',
  role: 'The commercial core',
  intro:
    'A design and build studio working across architecture, interior design and urban design. The first design decision is always the climate: which way the building faces, how deep the shade is, where the air enters and leaves, and what the ground itself can give you.',
  principles: [
    { term: 'Climate responsive', note: 'Comfort designed in, not air-conditioned in.' },
    { term: 'Context driven', note: 'Site, story and material before style.' },
    { term: 'Research led', note: 'Measured performance, not a mood board.' },
    { term: 'End-user focused', note: 'Judged by how the space feels at 2pm.' },
  ],
  services: [
    {
      title: 'Design & Build',
      body: 'One team, one contract, no gaps. Concept through construction management, materials, interiors and handover.',
    },
    {
      title: 'Architecture Design',
      body: 'Fully resolved architecture and drawings — ready for your own contractor to execute exactly as intended.',
    },
    {
      title: 'Interior Design',
      body: 'Existing space, new direction. Homes, offices and commercial interiors with material intelligence.',
    },
  ],
  process: [
    'Briefing & pre-design',
    'Concept design',
    'Design development',
    'Technical design',
    'Bill of quantities & tendering',
    'Construction administration',
    'Handover',
  ],
  flagship: {
    eyebrow: 'Flagship case study',
    title: 'Nigeria’s first fully off-grid hospital',
    place: 'The Eye Specialists Hospital (TESH) — Nsukka, Enugu State',
    years: '2018 – 2019 · operating since 2020',
    body: 'An existing residential building, kept and transformed. A translucent roof brings daylight into the atrium so the lights can stay off. An elevated roof structure moves hot air out and pulls cooler air through. A standalone solar and inverter system took the building off the national grid — so surgery does not wait for power to come back.',
    note: 'The brief was personal: the client is an ophthalmologist who saw patients travelling out of Nsukka for specialist care. The design had to make people want to walk in.',
    /** No TESH photography was supplied; this names what is still needed. */
    pendingShot: 'The atrium under the translucent roof — the single image this page most needs',
  },
  /**
   * `medium` matters on a page whose whole argument is "measured, not
   * asserted": a visualisation must never be read as a photograph of a
   * finished building, so the distinction is carried in the data and rendered
   * as a chip on the image.
   *
   * `captures` are keys into `src/data/media.ts`.
   */
  work: [
    {
      title: 'Nature Home',
      place: 'Enugu, Nigeria',
      type: 'Private residential',
      year: 'Built',
      medium: 'photograph',
      note: 'A family home planned around the existing trees rather than around the plot. Deep cantilevers shade the glazing, the garden becomes the corridor, and the main rooms open on two sides so air can cross them.',
      lead: 'natureHomeEntry',
      captures: [
        { key: 'natureHomeCantilever', caption: 'Cantilevered shade over the entrance walk' },
        { key: 'natureHomeInterior', caption: 'Living room, daylight only' },
        { key: 'natureHomeSide', caption: 'The tree the plan was built around' },
      ],
    },
    {
      title: 'Nature Home 2',
      place: 'Enugu, Nigeria',
      type: 'Private residential',
      year: 'In progress',
      medium: 'visualisation',
      note: 'The second house on the same brief, pushed further: a shaded outdoor room carries the daily life of the house, and the wellness wing is daylit and cross-ventilated so it does not need cooling.',
      lead: 'natureHome2Approach',
      captures: [
        { key: 'natureHome205', caption: 'Bedroom opening to the garden and water' },
        { key: 'natureHome206', caption: 'Living and dining under a timber roof, lit from above' },
        { key: 'natureHome2Wellness', caption: 'Wellness wing — clerestory daylight and cross ventilation' },
      ],
    },
    {
      title: 'Community Centre',
      place: 'Nigeria',
      type: 'Civic · Community',
      year: 'Design',
      medium: 'visualisation',
      note: 'A public building organised around one retained tree. A timber roof ring shades the courtyard, and the social rooms sit under it in the round — the oldest idea in tropical building, kept.',
      lead: 'communityCentreCourt',
      captures: [],
    },
    {
      title: 'Studio COKA workspace',
      place: 'Enugu, Nigeria',
      type: 'Studio fit-out',
      year: 'Built',
      medium: 'photograph',
      note: 'The practice’s own workspace: a clerestory above the stair brings daylight deep into the plan, and a timber ceiling keeps it soft rather than hot.',
      lead: 'studioAtrium',
      captures: [],
    },
  ],
  testimonial: {
    quote: 'We barely use AC during the day.',
    attribution: 'Private client',
    context: 'Residential project, Enugu',
  },
  cta: {
    title: 'We take on a limited number of projects each year.',
    body: 'Good work takes focus. If you are building in Nigeria or West Africa and want comfort that does not depend on the grid, send a short brief — site, scope, stage and timeline.',
    action: 'Start a project',
    href: 'mailto', // resolved at build time from meta.email
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Knowledge layer — The Effective Architect + Speaking                        */
/* -------------------------------------------------------------------------- */

export const tea = {
  name: 'The Effective Architect',
  short: 'TEA',
  descriptor: 'Architecture education and media',
  role: 'The knowledge layer',
  body: 'Most architects graduate without ever being taught how to design for a hot, humid, unreliable place. TEA exists to close that gap — practical tropical design, taught the way it is actually practised.',
  programme: {
    name: 'The Tropical Design Framework',
    body: 'A structured, practical programme for designing climate-responsive spaces: orientation, shading, ventilation, daylight, material and cost — in the order those decisions actually get made.',
    status: 'Waitlist open',
  },
  pillars: [
    'Orientation before ornament',
    'Shade before cooling',
    'Airflow before AC',
    'Daylight before lighting',
    'Local material before imported',
  ],
} as const;

export const speaking = {
  descriptor: 'Talks, panels and workshops',
  role: 'The thought-leadership layer',
  body: 'Crystal speaks about the buildings we already know how to build — and why we stopped. Talks draw on the off-grid hospital, indigenous ventilation and shading strategies, and the cost argument for designing with the climate rather than against it.',
  topics: [
    'Climate-responsive design in the tropics',
    'What indigenous buildings already solved',
    'Designing places people remember',
    'Building off-grid in Nigeria',
    'Entrepreneurship in the built environment',
  ],
  formats: ['Keynote', 'Panel', 'Workshop', 'Guest lecture', 'Studio critique'],
  past: 'TEDx Port Harcourt',
} as const;

/* -------------------------------------------------------------------------- */
/* Initiatives — supporting layer, weighted differently                        */
/* -------------------------------------------------------------------------- */

export const initiatives = [
  {
    id: 'elevated',
    name: 'ELEvated',
    descriptor: 'Contemporary furniture & product design',
    body: 'Functional, well-made furniture and objects rooted in African context, materials and ideas. A product studio in development — briefing partners and early collaborations welcome.',
    status: 'In development',
    action: 'Talk to the studio',
    href: '#contact',
    weight: 'md',
  },
  {
    id: 'ako',
    name: 'AKO Alliance',
    descriptor: 'Access to education and opportunity',
    body: 'An NGO working to return out-of-school children to the classroom, support families with capital for business, and back ideas that move communities forward.',
    status: 'Active initiative',
    action: 'Partner or give',
    href: '#contact',
    weight: 'lg',
  },
  {
    id: 'alive-and-free',
    name: 'Alive and Free',
    descriptor: 'Christian youth movement',
    body: 'Helping young people walk in truth, healing, freedom, identity, purpose and life in Christ.',
    status: 'Ongoing',
    action: 'Join the community',
    href: '#contact',
    weight: 'md',
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Credentials                                                                  */
/* -------------------------------------------------------------------------- */

export const credentials = [
  { label: 'TEDx Port Harcourt speaker', href: null },
  { label: 'Featured by Reuters / bird Story Agency, 2026', href: null },
  { label: 'Female Entrepreneur of the Year — Glims Impact Awards, 2025', href: null },
  { label: 'The Visionaire Award nominee — Global Women Awards, 2025', href: null },
  { label: 'Business Excellence nominee — African Leading Women Awards, 2026', href: null },
  { label: 'Founder & Lead Principal, Studio COKA', href: null },
] as const;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                   */
/* -------------------------------------------------------------------------- */

export const nav = [
  { label: 'Studio COKA', href: '#studio-coka' },
  { label: 'Work', href: '#work' },
  { label: 'Learn', href: '#knowledge' },
  { label: 'Initiatives', href: '#initiatives' },
  { label: 'About', href: '#about' },
] as const;
