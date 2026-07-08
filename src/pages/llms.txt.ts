import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'

const SITE = 'https://abdullahsahin.org'

export const GET: APIRoute = async () => {
  const projects = await getCollection('projects', ({ data }) => !data.draft)
  const writing = await getCollection('writing', ({ data }) => !data.draft)

  const sortedProjects = projects.sort((a, b) => a.data.order - b.data.order)
  const sortedWriting = writing.sort((a, b) => b.data.date.localeCompare(a.data.date))

  const projectLines = sortedProjects
    .map(
      (p) =>
        `- [${p.data.name}](${SITE}/projects/${p.id}): ${p.data.description} ${p.data.statusLabel} (${p.data.years}).`,
    )
    .join('\n')

  const writingLines = sortedWriting
    .map((w) => {
      const [year, month] = w.data.date.split('-')
      return `- [${w.data.title}](${SITE}/writing/${w.id}): ${w.data.description} (${year}-${month}).`
    })
    .join('\n')

  const body = `# Abdullah Şahin

> Personal site of Abdullah Şahin, a software engineer who builds side projects and writes about what they teach. Editorial-minimal, bilingual (English/Turkish), static site. The honest version: some projects are alive, one was acquired, a few are gone.

The site is a single-author portfolio and writing collection. Language switches client-side (EN/TR) without changing the URL; the canonical content language is English. Each page is server-rendered HTML with no tracking.

## Projects

${projectLines}

## Writing

${writingLines}
- [Writing index](${SITE}/writing/): Full list of essays and notes.

## About

- [Homepage](${SITE}/): Hero, project list with honest status (ongoing / acquired / paused / sunset), and recent writing.
- Contact: hello@abdullahsahin.org

## Optional

- [Sitemap](${SITE}/sitemap-index.xml): All indexable URLs.
`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
