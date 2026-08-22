/**
 * The journey's step order, declared ONCE — per pathway.
 *
 * The simulator kept two parallel lists: `journeySteps` in the store (what the
 * progress rail draws) and `stepComponents` in Simulator.tsx (what actually
 * renders), and thirteen call sites navigated by hardcoded integer. When the
 * standalone locations screen was folded into the package step, the two lists
 * fell out of alignment by one and every index past "Select Your Tier" pointed
 * at the wrong component — clicking "Review & Launch" opened the ROI calculator.
 *
 * Naming the steps fixed that. What it did not fix is that the three pathways
 * are not the same journey. Core + Crew had no Crew step at all: the Crew
 * picker was rendered inside the `roi` slot behind a phase flag, with the
 * progress label rewritten at runtime to read "Configure Crew". So the rail's
 * meaning depended on a state variable, and the buyer who chose CORE + CREW
 * landed on "Choose Your Core Tier" with nothing to say a second rail existed.
 *
 * Worse, `locations` is ONE value shared by both rails. The old flow presented
 * its slider twice, on two screens several steps apart, and moving it on the
 * Crew screen silently repriced Core — a global input dressed as a local one.
 *
 * So the order is now a function of the pathway. The estate is asked once, up
 * front, where a shared input belongs. Core and Crew are adjacent because they
 * are siblings. The value case comes after both, because it prices both.
 */

export const JOURNEY_STEP_IDS = [
  'persona',
  'layer',
  'estate',
  'tier',
  'addons',
  'watchtower',
  'crew',
  'roi',
  'summary',
] as const;

export type JourneyStepId = (typeof JOURNEY_STEP_IDS)[number];

/** The pathway a visitor is on. `null` before they have chosen one. */
export type JourneyLayer = 'core' | 'crew' | 'both' | null;

const CORE_JOURNEY: JourneyStepId[] = [
  'persona',
  'layer',
  'tier',
  'addons',
  'watchtower',
  'roi',
  'summary',
];

/** Crew collapses SKUs, estate and price preview into its single builder. */
const CREW_JOURNEY: JourneyStepId[] = ['persona', 'layer', 'crew', 'summary'];

/**
 * Both rails. Estate first because it prices both; Core then Crew adjacent;
 * the value case last because it evaluates the whole basket.
 */
const BOTH_JOURNEY: JourneyStepId[] = [
  'persona',
  'layer',
  'estate',
  'tier',
  'addons',
  'watchtower',
  'crew',
  'roi',
  'summary',
];

/** The ordered steps for a pathway. Before a layer is chosen, Core's shape. */
export function journeyFor(layer: JourneyLayer): JourneyStepId[] {
  if (layer === 'crew') return CREW_JOURNEY;
  if (layer === 'both') return BOTH_JOURNEY;
  return CORE_JOURNEY;
}

/** Position of a step within a pathway, or -1 when that pathway omits it. */
export function stepIndexIn(layer: JourneyLayer, id: JourneyStepId): number {
  return journeyFor(layer).indexOf(id);
}

/** The step at a position within a pathway, or `undefined` past the end. */
export function stepAtIn(layer: JourneyLayer, index: number): JourneyStepId | undefined {
  return journeyFor(layer)[index];
}

export function lastStepIndex(layer: JourneyLayer): number {
  return journeyFor(layer).length - 1;
}

/** Display names, declared once so the rail cannot disagree with the router. */
export const STEP_NAMES: Record<JourneyStepId, string> = {
  persona: 'Discover Your Persona',
  layer: 'Choose Your Layer',
  estate: 'Your Estate',
  tier: 'Select Your Core Package',
  addons: 'Add-ons',
  watchtower: 'Watchtower Intel',
  crew: 'Configure Crew',
  roi: 'Calculate ROI',
  summary: 'Review & Launch',
};
