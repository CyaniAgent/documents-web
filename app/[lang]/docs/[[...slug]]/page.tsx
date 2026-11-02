import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DocInfoRow } from '@/components/doc-info';
import { getMDXComponents } from '@/components/mdx';
import { docsPageSlots } from '@/components/viewer-transition';
import { i18n } from '@/lib/i18n';
import { getPageInfo } from '@/lib/page-info';
import { getPageImageUrl, getPageMarkdownUrl, gitConfig } from '@/lib/shared';
import { source } from '@/lib/source';

const indexTexts = {
  zh: {
    title: '选择一个文档来阅读吧',
    description: '请选择想要阅读的文档。',
  },
  ja: {
    title: 'ドキュメントを選んで読みましょう',
    description: '読みたいドキュメントを選択してください。',
  },
  en: {
    title: 'Choose a document to read',
    description: 'Please select the document you would like to read.',
  },
} as const;

function getIndexTexts(lang: string) {
  return indexTexts[lang as keyof typeof indexTexts] ?? indexTexts.zh;
}

export default async function Page(
  props: PageProps<'/[lang]/docs/[[...slug]]'>,
) {
  const params = await props.params;

  // docs index: sidebar tree on the left, placeholder in the center
  if (!params.slug || params.slug.length === 0) {
    const t = getIndexTexts(params.lang);
    return (
      <DocsPage slots={docsPageSlots}>
        <DocsTitle>{t.title}</DocsTitle>
        <DocsDescription>{t.description}</DocsDescription>
      </DocsPage>
    );
  }

  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;
  const info = getPageInfo(page);

  return (
    <DocsPage slots={docsPageSlots} toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <DocInfoRow wordCount={info.wordCount} lastUpdated={info.lastUpdated} />
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return [
    // the docs index route without any slug, e.g. `/zh/docs`
    ...i18n.languages.map((lang) => ({ lang, slug: [] as string[] })),
    ...source.generateParams(),
  ];
}

export async function generateMetadata(
  props: PageProps<'/[lang]/docs/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  if (!params.slug || params.slug.length === 0) {
    const t = getIndexTexts(params.lang);
    return { title: t.title, description: t.description };
  }

  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
