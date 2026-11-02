'use client';

import { Header as DocsHeader } from 'fumadocs-ui/layouts/docs/slots/header';
import type { SidebarProps } from 'fumadocs-ui/layouts/docs/slots/sidebar';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from 'fumadocs-ui/layouts/docs/slots/sidebar';
import { Header as HomeHeader } from 'fumadocs-ui/layouts/home/slots/header';
import { motion, type Variants } from 'motion/react';
import type { ComponentProps } from 'react';
import { VT_EASE } from './route-shell';

/**
 * Fumadocs slot wrappers that drive the route choreography (choreography is
 * declared in components/route-shell.tsx + viewer-transition.tsx).
 *
 * Each wrapper only supplies `variants` (never `animate`), so it inherits the
 * phase label RouteShell propagates through MotionContext and applies its own
 * delay. Direction comes from the label: `visible` = entering this phase,
 * `exit` = leaving it.
 *
 * Sticky note: `#nd-nav` and `#nd-subnav` are `position: sticky`. Wrapping a
 * sticky element in a short box would cap its stick range to that box, so the
 * home wrapper re-declares `sticky top-0 z-40` itself and lets the inner
 * header sit statically within it.
 */

/** Home navbar: slides up when leaving (0.5s), down when returning (0.5s delay). */
const homeNavVariants: Variants = {
  hidden: { y: '-100%' },
  visible: {
    y: 0,
    transition: { delay: 0.5, duration: 0.2, ease: VT_EASE },
  },
  exit: {
    y: '-100%',
    transition: { delay: 0, duration: 0.5, ease: VT_EASE },
  },
};

export function AnimatedHomeHeader(props: ComponentProps<'header'>) {
  return (
    <motion.div variants={homeNavVariants} className="sticky top-0 z-40">
      <HomeHeader {...props} />
    </motion.div>
  );
}

/** Docs subnav (mobile only): slides down when entering, up when leaving. */
const docsNavVariants: Variants = {
  hidden: { y: '-100%' },
  visible: {
    y: 0,
    transition: { delay: 0.25, duration: 0.2, ease: VT_EASE },
  },
  exit: {
    y: '-100%',
    transition: { delay: 0.25, duration: 0.2, ease: VT_EASE },
  },
};

export function AnimatedDocsHeader(props: ComponentProps<'header'>) {
  return (
    <motion.div
      variants={docsNavVariants}
      className="[grid-area:header] md:hidden"
    >
      <DocsHeader {...props} />
    </motion.div>
  );
}

/** Docs sidebar: slides in from the left when entering, out when leaving. */
const sidebarVariants: Variants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: { delay: 0.25, duration: 0.2, ease: VT_EASE },
  },
  exit: {
    x: '-100%',
    transition: { delay: 0.25, duration: 0.2, ease: VT_EASE },
  },
};

function AnimatedDocsSidebar(props: SidebarProps) {
  return (
    <motion.div variants={sidebarVariants} className="[grid-area:sidebar]">
      <Sidebar {...props} />
    </motion.div>
  );
}

/**
 * Complete sidebar slot set — Fumadocs shallow-replaces the whole `sidebar`
 * slot object, so the defaults must be re-supplied alongside `root`.
 */
export const docsSidebarSlots = {
  provider: SidebarProvider,
  root: AnimatedDocsSidebar,
  trigger: SidebarTrigger,
  useSidebar,
};
