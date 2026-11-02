import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import {
  AnimatedDocsHeader,
  docsSidebarSlots,
} from '@/components/animated-slots';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[lang]/docs'>) {
  const { lang } = await params;

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      slots={{ header: AnimatedDocsHeader, sidebar: docsSidebarSlots }}
      {...baseOptions(lang)}
    >
      {children}
    </DocsLayout>
  );
}
