import { uiTranslations } from 'fumadocs-ui/i18n';
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { i18n } from './i18n';
import { appName, gitConfig } from './shared';

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    zh: {
      displayName: '简体中文',
    },
    ja: {
      displayName: '日本語',
    },
    en: {
      displayName: 'English',
    },
  });

export function baseOptions(_locale: string): BaseLayoutProps {
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
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
