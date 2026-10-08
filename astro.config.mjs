// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Deploy configuration.
 *
 * Both values come from the environment so one repository can build for a
 * domain root *and* for a project subpath without editing source:
 *
 *   SITE=https://crystalkizor.com            BASE_PATH=/            (root domain)
 *   SITE=https://user.github.io              BASE_PATH=/crystal-kizor (GitHub Pages)
 *
 * `site` drives canonical URLs, `sitemap-index.xml` and Open Graph tags, so a
 * wrong value here is silently bad for SEO rather than visibly broken.
 */
export const SITE = process.env.SITE ?? 'https://crystalkizor.com';
export const BASE_PATH = process.env.BASE_PATH ?? '/';

// Extra hosts allowed to reach the dev server. Vite blocks unknown Host
// headers by default, which breaks proxied previews and tunnels. Set
// ALLOWED_DEV_HOSTS=".example.dev,my-tunnel.ngrok.app" when you need them.
const allowedDevHosts =
  process.env.ALLOWED_DEV_HOSTS?.split(',')
    .map((host) => host.trim())
    .filter(Boolean) ?? [];

export default defineConfig({
  site: SITE,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // With a subpath `base`, the integration emits both `/sub` and `/sub/`
      // for the same document. Both serve fine, but a duplicated URL is noise
      // in a sitemap, so keep the canonical trailing-slash form only.
      filter: (page) => page !== `${SITE}${BASE_PATH === '/' ? '' : BASE_PATH}`,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: { allowedHosts: allowedDevHosts },
    preview: { allowedHosts: allowedDevHosts },
  },
  build: {
    // Inline small stylesheets to remove a blocking request on first paint.
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
  },
});
