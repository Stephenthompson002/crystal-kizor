import type { APIRoute } from 'astro';
import { asset } from '../lib/url';

/**
 * robots.txt as an endpoint rather than a static file, so the sitemap URL is
 * derived from the configured `site` and `base` instead of being hard-coded.
 * A stale Sitemap line is a silent SEO failure: crawlers fetch a 404 and quietly
 * stop discovering the page.
 *
 * Note that `import.meta.env.BASE_URL` has no trailing slash, so the path is
 * joined with `asset()` rather than resolved relatively — `new URL(...)` would
 * treat `crystal-kizor` as a file and drop it.
 */
export const GET: APIRoute = ({ site }) => {
  const raw = (site ?? new URL('https://crystalkizor.com/')).href;
  const origin = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  const sitemap = `${origin}${asset('/sitemap-index.xml')}`;

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
