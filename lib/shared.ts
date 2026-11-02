import { createGetUrl } from 'fumadocs-core/source';
import { i18n } from './i18n';

export const appName = 'CyaniAgent Docs';
/**
 * Content root. Keep in sync with `dir` in the `defineDocs` macro
 * (lib/source.ts) — the macro needs a compile-time literal, so it cannot
 * import this constant.
 */
export const contentDir = 'content/docs';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const gitConfig = {
  user: 'CyaniAgent',
  repo: 'documents-web',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute, i18n);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute, i18n);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
