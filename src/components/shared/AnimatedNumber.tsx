/**
 * A number that visibly changes.
 *
 * Every price, credit allowance and total in the simulator re-rendered by
 * SNAPPING to its new value. Moving the estate slider from 8 to 25 locations
 * rewrites four package prices, four credit allowances, four seat counts and a
 * running total simultaneously, and none of it acknowledged that anything had
 * happened — the buyer had to re-read the screen to find what moved.
 *
 * Counting to the new value does two things a snap cannot: it draws the eye to
 * the figures that changed, and it makes the DIRECTION of the change legible,
 * which is the whole point of a declining marginal curve.
 *
 * Under `prefers-reduced-motion` the value is set directly, with no count.
 */

import { useEffect, useRef, useState } from 'react';

import { DURATION, useReducedMotionSafe } from '../../lib/motion';

interface AnimatedNumberProps {
  value: number;
  /** Formatter for the displayed value. Defaults to locale-grouped integer. */
  format?: (n: number) => string;
  /** Seconds. Defaults to the shared `slow` duration. */
  duration?: number;
  className?: string;
  /**
   * Announce the settled value to screen readers. Off by default — a counter
   * that announces every intermediate frame is worse than silence.
   */
  ariaLive?: boolean;
}

/** easeOutCubic — fast start, gentle settle, so the final value reads as arrival. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString(),
  duration = DURATION.slow,
  className,
  ariaLive = false,
}: AnimatedNumberProps) {
  const reduced = useReducedMotionSafe();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    if (from === value) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      setDisplay(from + (value - from) * easeOut(t));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      // Land on the target rather than wherever the interrupted count stopped,
      // so a fast slider drag can never leave a stale figure on screen.
      fromRef.current = value;
    };
  }, [value, duration, reduced]);

  return (
    <span
      className={className}
      // The settled value is the only thing worth announcing.
      aria-live={ariaLive ? 'polite' : undefined}
      aria-atomic={ariaLive ? true : undefined}
    >
      {format(display)}
    </span>
  );
}
