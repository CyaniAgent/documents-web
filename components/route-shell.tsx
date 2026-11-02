'use client';

import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Variants,
} from 'motion/react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Shared easing: cubic-bezier(0.22, 1, 0.36, 1) — smooth decelerate. */
export const VT_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The phase container carries no visual variants of its own — it is a pure
 * variant dispatcher. Its `hidden` / `visible` / `exit` labels propagate down
 * through MotionContext to the navbar / sidebar / viewer wrappers, each of
 * which declares its own delay, so the choreography is driven per element:
 *
 *   forward  (home -> docs): home nav + content exit 0-0.5s,
 *                            docs sidebar + subnav enter 0.25-0.45s,
 *                            docs viewer enters 0.5-0.7s
 *   reverse  (docs -> home): mirrored phases
 *
 * Only the coarse `phase` (home | docs) keys this shell, so doc-to-doc and
 * language switches never remount it — the navbar and sidebar stay static and
 * only the inner viewer (see viewer-transition.tsx) pushes.
 */
const shellVariants: Variants = {
  hidden: {},
  visible: {},
  exit: {},
};

function getPhase(pathname: string): 'home' | 'docs' {
  return pathname.includes('/docs') ? 'docs' : 'home';
}

export function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const phase = getPhase(pathname);

  return (
    <MotionConfig reducedMotion="user">
      {/* popLayout lets the exiting phase leave the flow so the entering one
          can overlap it (sidebar slides in while home is still fading out). */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={phase}
          variants={shellVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex min-h-screen flex-1 flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
