import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { AnimatedHomeHeader } from '@/components/animated-slots';
import { baseOptions } from '@/lib/layout.shared';

export default async function Layout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  return (
    <HomeLayout slots={{ header: AnimatedHomeHeader }} {...baseOptions(lang)}>
      {children}
    </HomeLayout>
  );
}
