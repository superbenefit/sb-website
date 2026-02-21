import type { Loader, LoaderContext } from 'astro/loaders';
import MOCK_POSTS from '../data/mock-posts.json';

interface KnowledgeServerOptions {
  endpoint?: string;
}

export function knowledgeServerLoader(options: KnowledgeServerOptions = {}): Loader {
  return {
    name: 'knowledge-server-loader',

    async load(context: LoaderContext): Promise<void> {
      const { store, logger, parseData, generateDigest } = context;

      // If endpoint is configured, validate and fetch from remote
      if (options.endpoint) {
        try {
          const ALLOWED_HOSTS = ['knowledge.superbenefit.org'];
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
            const posts = await response.json();
            store.clear();

            for (const post of posts) {
              const data = await parseData({
                id: post.slug || post.id,
                data: {
                  title: post.title,
                  slug: post.slug || post.id,
                  excerpt: post.excerpt,
                  content: post.content,
                  publishedAt: post.publishedAt || post.published_at,
                  updatedAt: post.updatedAt || post.updated_at,
                  author: post.author,
                  tags: post.tags || [],
                  coverImage: post.coverImage || post.cover_image,
                  draft: post.draft || false,
                },
              });

              store.set({
                id: post.slug || post.id,
                data,
                digest: generateDigest(post),
              });
            }

            logger.info(`Loaded ${posts.length} posts from knowledge server`);
            return;
          }

          logger.warn(`Knowledge server returned ${response.status}, falling back to mock data`);
        } catch (e) {
          logger.warn(`Knowledge server unreachable, falling back to mock data`);
        }
      }

      // Fallback: use mock data for development
      store.clear();

      for (const post of MOCK_POSTS) {
        const data = await parseData({
          id: post.slug,
          data: {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            publishedAt: post.publishedAt,
            author: post.author,
            tags: post.tags,
            coverImage: post.coverImage,
            draft: post.draft,
          },
        });

        store.set({
          id: post.slug,
          data,
          digest: generateDigest(post),
        });
      }

      logger.info(`Loaded ${MOCK_POSTS.length} mock posts (dev mode)`);
    },
  };
}
