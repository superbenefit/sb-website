import { defineCollection, z } from 'astro:content';
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

const blog = defineCollection({
  loader: knowledgeServerLoader({
    endpoint: import.meta.env.KNOWLEDGE_API_URL,
  }),
  schema: contentSchema,
});

const projects = defineCollection({
  loader: projectsLoader(),
  schema: contentSchema,
});

export const collections = { blog, projects };
