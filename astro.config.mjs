import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cloudflare Pages で公開
export default defineConfig({
  site: 'https://bikaku.norimaro.com',
  integrations: [sitemap()],
});
