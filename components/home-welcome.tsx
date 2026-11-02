'use client';

import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { motion, type Variants } from 'motion/react';
import Link from 'next/link';

const texts = {
  zh: {
    title: '欢迎进入 CyaniAgent Docs',
    description: '在这里，快速查看 CyaniAgent 公开发布的文档。',
    action: '进入文档一览',
  },
  ja: {
    title: 'CyaniAgent Docs へようこそ',
    description:
      'CyaniAgent が公開するドキュメントを、ここですばやくご覧いただけます。',
    action: 'ドキュメント一覧へ',
  },
  en: {
    title: 'Welcome to CyaniAgent Docs',
    description:
      'Quickly browse the documentation publicly released by CyaniAgent.',
    action: 'Browse Documentation',
  },
} as const;

/** Home content: fades out when leaving to docs, fades in when returning. */
const homeContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.5, duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { delay: 0, duration: 0.5, ease: 'easeIn' },
  },
};

export function HomeWelcome({ lang }: { lang: string }) {
  const t = texts[lang as keyof typeof texts] ?? texts.zh;

  return (
    <motion.div
      variants={homeContentVariants}
      className="flex flex-1 flex-col items-center justify-center gap-6 text-center"
    >
      <h1 className="text-4xl font-bold">{t.title}</h1>
      <p className="text-fd-muted-foreground max-w-md">{t.description}</p>
      <Link
        href={`/${lang}/docs`}
        className={buttonVariants({ className: 'px-6' })}
      >
        {t.action}
      </Link>
    </motion.div>
  );
}
