import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  languages: ['zh', 'ja', 'en'],
  defaultLanguage: 'zh',
  // parse locale from the first directory of content files, e.g. content/docs/zh/...
  parser: 'dir',
  // each locale's directory is its own doc root: never merge untranslated
  // pages from another language (our folders are localized per language,
  // so the default fallback would leak zh docs into ja/en)
  fallbackLanguage: null,
});
