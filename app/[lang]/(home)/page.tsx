import { HomeWelcome } from '@/components/home-welcome';

export default async function HomePage(props: PageProps<'/[lang]'>) {
  const { lang } = await props.params;

  return <HomeWelcome lang={lang} />;
}
