/**
 * The motion system's contract.
 *
 * Motion was applied ad hoc across the simulator: each component picked its own
 * duration, easing and delay, and several used a flat `delay: index * 0.1`
 * stagger that pushed the last card of a ten-card grid almost a full second
 * behind the first. These tests pin the properties that keep the system
 * coherent — most importantly that reduced motion actually removes movement
 * rather than merely shortening it.
 */
import { describe, expect, it } from "vitest";

import {
  DURATION,
  EASE,
  TRANSITION,
  fadeUp,
  selectableCard,
  staggerChildren,
  stepTransition,
} from "../src/lib/motion";

describe("durations", () => {
  it("keeps every duration inside the range that reads as responsive", () => {
    for (const [name, d] of Object.entries(DURATION)) {
      expect(d, `${name} is not a positive duration`).toBeGreaterThan(0);
      expect(d, `${name} is slow enough to feel like lag`).toBeLessThanOrEqual(0.4);
    }
  });

  it("orders instant < base < slow", () => {
    expect(DURATION.instant).toBeLessThan(DURATION.base);
    expect(DURATION.base).toBeLessThan(DURATION.slow);
  });

  it("exposes a transition for every duration", () => {
    for (const key of Object.keys(DURATION) as Array<keyof typeof DURATION>) {
      expect(TRANSITION[key]).toBeTruthy();
      expect(TRANSITION[key].duration).toBe(DURATION[key]);
    }
  });

  it("uses cubic-bezier arrays, not named easings that differ across engines", () => {
    for (const curve of Object.values(EASE)) {
      expect(curve).toHaveLength(4);
      for (const n of curve) expect(typeof n).toBe("number");
    }
  });
});

describe("reduced motion removes MOVEMENT, not just time", () => {
  it("fadeUp drops travel entirely", () => {
    expect((fadeUp(false).hidden as { y: number }).y).toBeGreaterThan(0);
    expect((fadeUp(true).hidden as { y: number }).y).toBe(0);
  });

  it("stepTransition drops horizontal travel entirely", () => {
    const normal = stepTransition(false);
    const reduced = stepTransition(true);
    expect(normal.initial.x).not.toBe(0);
    expect(normal.exit.x).not.toBe(0);
    expect(reduced.initial.x).toBe(0);
    expect(reduced.exit.x).toBe(0);
    // Opacity still animates — the transition should remain legible.
    expect(reduced.initial.opacity).toBe(0);
  });

  it("selectableCard drops hover lift and tap scale entirely", () => {
    expect(selectableCard(false).whileHover).toBeTruthy();
    expect(selectableCard(false).whileTap).toBeTruthy();
    expect(selectableCard(true).whileHover).toBeUndefined();
    expect(selectableCard(true).whileTap).toBeUndefined();
  });

  it("stagger collapses to zero so nothing is sequenced", () => {
    const v = staggerChildren(true, 10);
    expect((v.visible as { transition: { staggerChildren: number } }).transition.staggerChildren).toBe(0);
  });
});

describe("staggerChildren is bounded", () => {
  const step = (count: number, cap?: number) =>
    (staggerChildren(false, count, cap).visible as {
      transition: { staggerChildren: number };
    }).transition.staggerChildren;

  it("never lets the last child of a long list wait longer than the cap", () => {
    for (const count of [2, 4, 6, 10, 24]) {
      const total = step(count) * (count - 1);
      expect(total, `${count} children exceeded the stagger cap`).toBeLessThanOrEqual(0.2401);
    }
  });

  it("is dramatically tighter than the flat per-index delay it replaces", () => {
    // The old pattern was `delay: index * 0.1` — the tenth card waited 0.9s.
    const tenth = step(10) * 9;
    expect(tenth).toBeLessThan(0.9);
  });

  it("does not sequence a single child", () => {
    expect(step(1)).toBe(0);
  });

  it("respects a caller-supplied cap", () => {
    expect(step(10, 0.1) * 9).toBeLessThanOrEqual(0.1001);
  });
});

describe("fadeUp delay", () => {
  it("threads an explicit delay without changing the duration", () => {
    const v = fadeUp(false, 0.15).visible as { transition: { delay: number; duration: number } };
    expect(v.transition.delay).toBe(0.15);
    expect(v.transition.duration).toBe(DURATION.base);
  });
});
