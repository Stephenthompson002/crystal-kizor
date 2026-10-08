import type { APIRoute } from 'astro';
import { asset } from '../lib/url';
import { meta } from '../data/site';

/**
 * The web app manifest as an endpoint rather than a static file.
 *
 * Every path inside a manifest is resolved against the manifest's own URL, so a
 * hard-coded `/icon-192.png` breaks the moment the site is served from a
 * project subpath such as `https://<user>.github.io/crystal-kizor/`. Building it
 * here means the icons, the start URL and the scope all follow the same
 * `asset()` helper as the rest of the site's public paths.
 */
export const GET: APIRoute = () => {
  const manifest = {
    name: `${meta.name} — ${meta.role}`,
    short_name: meta.name,
    description: meta.tagline,
    start_url: asset('/'),
    scope: asset('/'),
    display: 'standalone',
    background_color: '#faf7f2',
    theme_color: '#12100e',
    icons: [
      { src: asset('/icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: asset('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: asset('/icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
};
