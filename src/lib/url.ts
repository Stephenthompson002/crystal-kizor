/**
 * Base-aware asset URLs.
 *
 * Astro writes the configured `base` into `import.meta.env.BASE_URL` at build
 * time, always with a trailing slash. When the site is served from the domain
 * root that value is `/`, and every helper below returns the path unchanged.
 *
 * The reason this exists: the same build has to work at
 * `https://crystalkizor.com/` *and* at a project subpath such as
 * `https://<user>.github.io/crystal-kizor/`. Files in `public/` are copied
 * verbatim, so a hard-coded `/fonts/x.woff2` would 404 under a subpath.
 * Everything in `public/` goes through `asset()`.
 */
const BASE = import.meta.env.BASE_URL ?? '/';

/** Turn a root-relative public path into one that respects the deploy base. */
export function asset(path: string): string {
  const root = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  return `${root}/${path.replace(/^\/+/, '')}`;
}

/** The site origin + base, without a trailing slash. Used for canonical URLs. */
export function absolute(path: string, site: URL | undefined, fallback: string): string {
  return new URL(asset(path), site ?? fallback).href;
}
