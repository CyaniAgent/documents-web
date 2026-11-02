'use client';

import { Container as PageContainer } from 'fumadocs-ui/layouts/docs/page/slots/container';
import {
  TOC,
  TOCPopover,
  TOCProvider,
} from 'fumadocs-ui/layouts/docs/page/slots/toc';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { VT_EASE } from './route-shell';

/**
 * Docs viewer transition slots — the animations live INSIDE the Fumadocs
 * page slots so each animated element is itself a direct grid child of
 * `#nd-docs-layout`.
 *
 * Why slots instead of a wrapper: `DocsPage` emits three sibling grid
 * children — `TOCPopover`, `<main grid-area:main>` and the TOC
 * (`grid-area:toc`). Wrapping `<DocsPage />` in a DOM element takes them out
 * of the grid: `grid-area` stops applying and everything stacks in normal
 * flow (TOC drops below the article). The old React `<ViewTransition>` was a
 * marker that rendered no DOM, which is why the layout held. A motion.div
 * always renders DOM — so the animation is slotted in where the grid child
 * already lives.
 *
 * Two layers, two jobs:
 *
 * 1. Fade (home <-> docs): every wrapper declares only `variants` (no
 *    `animate`), so it inherits RouteShell's phase label through
 *    MotionContext — the viewer fades in at 0.5-0.7s / out at 0-0.2s, and
 *    the TOC + popover fade with it.
 *
 * 2. Push (doc <-> doc / language switch): `AnimatedDocsContainer` owns an
 *    AnimatePresence keyed by pathname (0.15s horizontal push). The navbar,
 *    sidebar and TOC wrappers keep their keys (phase only), so they stay
 *    static during document switches.
 *
 * Grid trick for the push: the fade wrapper is the `[grid-area:main]` grid
 * child and is itself `display: grid`; the old and new push children are
 * explicitly placed in the same cell (`row-start-1 col-start-1`), so they
 * overlap during the push instead of stacking vertically. No `popLayout`
 * needed — the shared grid cell gives the overlap for free.
 */

/** Viewer fade: in at 0.5-0.7s, out at 0-0.2s (phase labels from RouteShell). */
const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.5, duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { delay: 0, duration: 0.2, ease: 'easeIn' },
  },
};

/** `<main grid-area:main>` slot: phase fade outside, 0.15s push inside. */
export function AnimatedDocsContainer(
  props: ComponentProps<typeof PageContainer>,
) {
  const pathname = usePathname();

  return (
    <motion.div variants={fadeVariants} className="grid [grid-area:main]">
      {/* sync (default): both children share the same grid cell during the
          push; popLayout would fight the Fumadocs grid, so it is avoided. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={pathname}
          className="col-start-1 row-start-1"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.15, ease: VT_EASE }}
        >
          <PageContainer {...props} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/** Right-hand TOC: keeps `grid-area:toc` here; sticky sizing stays inside. */
export function AnimatedTOC(props: ComponentProps<typeof TOC>) {
  return (
    <motion.div variants={fadeVariants} className="[grid-area:toc]">
      <TOC {...props} />
    </motion.div>
  );
}

/** Mobile TOC popover: keeps `grid-area:toc-popover` here. */
export function AnimatedTOCPopover(props: ComponentProps<typeof TOCPopover>) {
  return (
    <motion.div variants={fadeVariants} className="[grid-area:toc-popover]">
      <TOCPopover {...props} />
    </motion.div>
  );
}

/**
 * Complete page slot set — Fumadocs merges each slot with `??`, but `slots.toc`
 * replaces the whole triple, so provider/main/popover must all be supplied.
 */
export const docsPageSlots = {
  container: AnimatedDocsContainer,
  toc: {
    provider: TOCProvider,
    main: AnimatedTOC,
    popover: AnimatedTOCPopover,
  },
};
