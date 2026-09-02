import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import rehypeExternalLinks from 'rehype-external-links'

export default defineConfig({
  site: 'https://abdullahsahin.org',
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
  },
  integrations: [mdx(), sitemap(), robotsTxt()],
})
