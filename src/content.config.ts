import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'
import { POSTS_CONFIG } from '~/config'
import type { CoverLayout, PostType } from '~/types'

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        pubDate: z.date(),
        tags: z.array(z.string()).optional(),
        updatedDate: z.date().optional(),
        author: z.string().default(POSTS_CONFIG.author),
        cover: image().optional(),
        ogImage: image().optional(),
        recommend: z.boolean().default(false),
        postType: z.custom<PostType>().optional(),
        coverLayout: z.custom<CoverLayout>().optional(),
        pinned: z.boolean().default(false),
        draft: z.boolean().default(false),
        license: z.string().optional(),
      })
      .transform((data) => ({
        ...data,
        ogImage: POSTS_CONFIG.ogImageUseCover && data.cover ? data.cover : data.ogImage,
      })),
})

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string(),
      githubUrl: z.string().optional(),
      website: z.string().optional(),
      type: z.string(),
      icon: image().optional(),
      imageClass: z.string().optional(),
      star: z.number().nullish(),
      fork: z.number().nullish(),
      draft: z.boolean().default(false),
      // New fields
      started: z.number().optional(), // Year
      status: z.enum(['Active', 'Inactive', 'Shut it down', 'Sold it']).default('Active'),
      postLink: z.string().optional(),
    }),
})

export const collections = { posts, projects }
