// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Replace `site` with the production domain before deploying.
// It is used for canonical URLs, sitemap.xml and Open Graph tags.
export const SITE = 'https://crystalkizor.com';

// Extra hosts allowed to reach the dev server. Vite blocks unknown Host
// headers by default, which breaks proxied previews and tunnels. Set
// ALLOWED_DEV_HOSTS=".example.dev,my-tunnel.ngrok.app" when you need them.
const allowedDevHosts =
  process.env.ALLOWED_DEV_HOSTS?.split(',')
    .map((host) => host.trim())
    .filter(Boolean) ?? [];

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
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
