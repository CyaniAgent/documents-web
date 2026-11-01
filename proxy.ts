import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { i18n } from '@/lib/i18n';
import { docsContentRoute, docsRoute } from '@/lib/shared';

const i18nMiddleware = createI18nMiddleware(i18n);

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

/** Split a leading locale prefix from the pathname, e.g. `/zh/docs/x` -> `{ locale: 'zh', rest: '/docs/x' }` */
function splitLocale(pathname: string): { locale?: string; rest: string } {
  const segments = pathname.split('/');
  const maybe = segments[1];
  if (maybe && (i18n.languages as readonly string[]).includes(maybe)) {
    return { locale: maybe, rest: `/${segments.slice(2).join('/')}` };
  }
  return { rest: pathname };
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { locale, rest } = splitLocale(request.nextUrl.pathname);

  // no locale prefix yet, let the i18n middleware redirect to the preferred locale
  if (!locale) return i18nMiddleware(request, event);

  const suffix = rewriteSuffix(rest);
  if (suffix) {
    return NextResponse.rewrite(
      new URL(`/${locale}${suffix}`, request.nextUrl),
    );
  }

  if (isMarkdownPreferred(request)) {
    const docs = rewriteDocs(rest);
    if (docs) {
      return NextResponse.rewrite(
        new URL(`/${locale}${docs}`, request.nextUrl),
        {
          // this URL has two representations, selected by `Accept`
          headers: { Vary: 'Accept' },
        },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring API routes, machine-readable endpoints, and static assets
  matcher: [
    '/((?!api|og|llms\\.txt|llms-full\\.txt|llms\\.mdx|_next/static|_next/image|favicon\\.ico).*)',
  ],
};
