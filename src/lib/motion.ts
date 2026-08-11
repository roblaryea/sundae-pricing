/**
 * One motion system for the simulator.
 *
 * Motion was applied ad hoc — every component chose its own duration, easing and
 * delay, so steps felt like different products stitched together, and the
 * numbers that matter most (prices, credits, totals) SNAPPED between values
 * while decorative cards eased in slowly. That is backwards: a price changing
 * from $2,420 to $3,745 is the single most information-dense event in the whole
 * journey, and it happened instantly and unremarked.
 *
 * The rules here:
 *   1. Meaning moves. Prices, credit allowances and totals animate so the eye
 *      can follow a value changing rather than re-reading it.
 *   2. Chrome settles. Cards and panels ease in once, quickly, and then stop.
 *   3. Nothing waits on decoration. Stagger is capped so a long list never
 *      delays the content a user came for.
 *   4. Reduced motion is honoured everywhere, not as an afterthought — see
 *      `useReducedMotionSafe`. Under that preference, position and scale
 *      animation is dropped entirely and only opacity remains.
 */

import { useReducedMotion } from 'framer-motion';
import type { Transition, Variants } from 'framer-motion';

/** Durations in seconds. Anything above `slow` reads as sluggish on a form. */
export const DURATION = {
  /** State flips: selection, hover, focus. Must feel instant. */
  instant: 0.12,
  /** The default for entering chrome. */
  base: 0.24,
  /** Step transitions and value counters — long enough to follow, short enough not to block. */
  slow: 0.4,
} as const;

/** Standard easing. `out` for entrances, `inOut` for movement between states. */
export const EASE = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
} as const;

export const TRANSITION: Record<'instant' | 'base' | 'slow', Transition> = {
  instant: { duration: DURATION.instant, ease: EASE.out },
  base: { duration: DURATION.base, ease: EASE.out },
  slow: { duration: DURATION.slow, ease: EASE.inOut },
};

/**
 * True when the visitor asked for reduced motion. Every animated surface must
 * consult this — `prefers-reduced-motion` is an accessibility requirement, not
 * a nicety, and vestibular triggers are real.
 */
export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}

/**
 * Entrance for a block of content. Under reduced motion this is a plain fade,
 * with no travel.
 */
export function fadeUp(reduced: boolean, delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...TRANSITION.base, delay },
    },
  };
}

/**
 * Container that reveals children in sequence. `cap` bounds the total stagger
 * so a ten-card grid never makes the last card wait — the old code used a flat
 * `delay: index * 0.1`, which pushed the tenth card almost a second late.
 */
export function staggerChildren(reduced: boolean, count: number, cap = 0.24): Variants {
  const step = reduced || count <= 1 ? 0 : Math.min(0.05, cap / Math.max(1, count - 1));
  return {
    hidden: {},
    visible: { transition: { staggerChildren: step } },
  };
}

/** The step-to-step transition used by the wizard. */
export function stepTransition(reduced: boolean) {
  return {
    initial: { opacity: 0, x: reduced ? 0 : 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduced ? 0 : -16 },
    transition: TRANSITION.base,
  };
}

/**
 * Selection feedback for an option card. Deliberately a scale nudge rather than
 * a colour-only change: colour alone is not a sufficient state signal, and the
 * card also carries `aria-pressed`.
 */
export function selectableCard(reduced: boolean) {
  return {
    whileHover: reduced ? undefined : { y: -3 },
    whileTap: reduced ? undefined : { scale: 0.985 },
    transition: TRANSITION.instant,
  };
}
