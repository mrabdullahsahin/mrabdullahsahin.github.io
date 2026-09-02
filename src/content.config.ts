import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const writing = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/writing',
  }),
  schema: z.object({
    title: z.string(),
    titleTr: z.string(),
    date: z.string(),
    category: z.string(),
    categoryTr: z.string(),
    readTime: z.number(),
    description: z.string(),
    descriptionTr: z.string(),
    draft: z.boolean().default(false),
  }),
})

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: z.object({
    name: z.string(),
    years: z.string(),
    status: z.enum(['live', 'acquired', 'open-source', 'paused', 'sunset', 'failed']),
    statusLabel: z.string(),
    statusLabelTr: z.string(),
    description: z.string(),
    descriptionTr: z.string(),
    stack: z.string().optional(),
    role: z.string().optional(),
    roleTr: z.string().optional(),
    statusValue: z.string().optional(),
    statusValueTr: z.string().optional(),
    timeline: z
      .array(
        z.object({
          date: z.string(),
          dateTr: z.string().optional(),
          en: z.string(),
          tr: z.string(),
          mark: z.boolean().default(false),
        }),
      )
      .default([]),
    order: z.number().default(99),
    draft: z.boolean().default(false),
  }),
})

export const collections = { writing, projects }
