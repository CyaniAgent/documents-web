import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  languages: ['zh', 'ja', 'en'],
  defaultLanguage: 'zh',
  // parse locale from the first directory of content files, e.g. content/docs/zh/...
  parser: 'dir',
});
