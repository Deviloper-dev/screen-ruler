import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  integrations: [react(), sitemap()],
  output: 'static',
  site: 'https://onlineruler.deviloper.dev',
  adapter: cloudflare()
});