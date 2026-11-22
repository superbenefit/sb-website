// Connects EmDash to Astro's content system:
// https://docs.emdashcms.com/existing-project/
import { defineLiveCollection } from 'astro:content';
import { emdashLoader } from 'emdash/runtime';

export const collections = {
  _emdash: defineLiveCollection({ loader: emdashLoader() }),
};
