import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { knowledgeServerLoader } from './loaders/knowledge-server';
import { projectsLoader } from './loaders/projects';

const contentSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  author: z
    .object({
      name: z.string(),
      avatar: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
});

const updates = defineCollection({
  loader: knowledgeServerLoader({
    endpoint: import.meta.env.KNOWLEDGE_API_URL,
  }),
  schema: contentSchema,
});

const projects = defineCollection({
  loader: projectsLoader(),
  schema: contentSchema,
});

const offeringsSchema = z.object({
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  price: z.string(),
  order: z.number(),
});

const offerings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/offerings' }),
  schema: offeringsSchema,
});

export const collections = { updates, projects, offerings };
