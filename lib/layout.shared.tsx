import { uiTranslations } from 'fumadocs-ui/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { i18n } from './i18n';
import { appName, gitConfig } from './shared';

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  // register our own keys: uiTranslations() narrows the key type to
  // fumadocs-ui's closed union, so custom strings must be added here first
  .extend({
    keys: ['{count} words · {date}', '{count} words'],
  })
  .add({
    zh: {
      displayName: '简体中文',
      // docs info row: `{count}` = word count, `{date}` = last update time
      // (format: `YYYY/M/D H:MM:SS`, leading zeros per spec)
      '{count} words · {date}': '{count} 字 · {date}',
      '{count} words': '{count} 字',
    },
    ja: {
      displayName: '日本語',
      '{count} words · {date}': '{count} 文字 · {date}',
      '{count} words': '{count} 文字',
    },
    en: {
      displayName: 'English',
      // en copy is the source string itself: t() falls back to the key when
      // a language has no entry, so no mapping is needed here
    },
  });

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/favicon.ico"
            alt="logo"
            width={20}
            height={20}
            className="size-5 rounded-md"
          />
          {appName}
        </>
      ),
      // logo links straight to the current locale's home page (a bare `/`
      // would require a redirect, which can interrupt route transitions)
      url: `/${locale}`,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
