/**
 * The journey's step order, declared ONCE.
 *
 * The simulator kept two parallel lists: `journeySteps` in the store (what the
 * progress rail draws) and `stepComponents` in Simulator.tsx (what actually
 * renders), and thirteen call sites navigated by hardcoded integer. When the
 * standalone locations screen was folded into the package step, the two lists
 * fell out of alignment by one and every index past "Select Your Tier" pointed
 * at the wrong component — clicking "Review & Launch" opened the ROI calculator,
 * and the orphaned locations screen was reachable through the "Add-ons" dot.
 *
 * A magic integer cannot express which step it means, so the lists could not be
 * checked against each other. Naming the steps makes the mismatch unspellable:
 * there is one ordering, every navigation refers to a step by name, and
 * `stepIndex()` is the only thing that turns a name into a position.
 */

export const JOURNEY_STEP_IDS = [
  'persona',
  'layer',
  'tier',
  'addons',
  'watchtower',
  'roi',
  'summary',
] as const;

export type JourneyStepId = (typeof JOURNEY_STEP_IDS)[number];

/** Position of a step in the journey. The only name → index conversion. */
export function stepIndex(id: JourneyStepId): number {
  return JOURNEY_STEP_IDS.indexOf(id);
}

/** The step at a position, or `undefined` past the end. */
export function stepAt(index: number): JourneyStepId | undefined {
  return JOURNEY_STEP_IDS[index];
}

export const LAST_STEP_INDEX = JOURNEY_STEP_IDS.length - 1;
