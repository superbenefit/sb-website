import type { Loader, LoaderContext } from 'astro/loaders';
import MOCK_PROJECTS from '../data/mock-projects.json';

interface ProjectsLoaderOptions {
  endpoint?: string;
}

const ALLOWED_HOSTS = ['knowledge.superbenefit.org'];

export function projectsLoader(options: ProjectsLoaderOptions = {}): Loader {
  return {
    name: 'projects-loader',

    async load(context: LoaderContext): Promise<void> {
      const { store, logger, parseData, generateDigest } = context;

      // If endpoint is configured, validate and fetch from remote
      if (options.endpoint) {
        try {
          const url = new URL(options.endpoint);
          if (url.protocol !== 'https:') {
            throw new Error(`Endpoint must use HTTPS, got: ${url.protocol}`);
          }
          if (!ALLOWED_HOSTS.includes(url.hostname)) {
            throw new Error(`Endpoint host "${url.hostname}" is not in the allowlist`);
          }

          const response = await fetch(options.endpoint, {
            headers: { Accept: 'application/json' },
          });

          if (response.ok) {
            const projects = await response.json();
            store.clear();

            for (const project of projects) {
              const data = await parseData({
                id: project.slug || project.id,
                data: {
                  title: project.title,
                  slug: project.slug || project.id,
                  excerpt: project.excerpt,
                  content: project.content,
                  publishedAt: project.publishedAt || project.published_at,
                  updatedAt: project.updatedAt || project.updated_at,
                  author: project.author,
                  tags: project.tags || [],
                  coverImage: project.coverImage || project.cover_image,
                  draft: project.draft || false,
                },
              });

              store.set({
                id: project.slug || project.id,
                data,
                digest: generateDigest(project),
              });
            }

            logger.info(`Loaded ${projects.length} projects from knowledge server`);
            return;
          }

          logger.warn(`Knowledge server returned ${response.status}, falling back to mock data`);
        } catch (e) {
          logger.warn(`Knowledge server unreachable, falling back to mock data`);
        }
      }

      // Fallback: use mock data for development
      store.clear();

      for (const project of MOCK_PROJECTS) {
        const data = await parseData({
          id: project.slug,
          data: {
            title: project.title,
            slug: project.slug,
            excerpt: project.excerpt,
            content: project.content,
            publishedAt: project.publishedAt,
            author: project.author,
            tags: project.tags,
            draft: project.draft,
          },
        });

        store.set({
          id: project.slug,
          data,
          digest: generateDigest(project),
        });
      }

      logger.info(`Loaded ${MOCK_PROJECTS.length} mock projects (dev mode)`);
    },
  };
}
