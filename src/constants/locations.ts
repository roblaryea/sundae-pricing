/**
 * Estate-size bounds, shared by every control that asks "how many locations?".
 *
 * Kept out of the component file so fast refresh stays intact, and kept in ONE
 * file so the Core and Crew controls cannot disagree about the ceiling the way
 * their two hand-rolled sliders once did.
 *
 * The band curve in `pricing.ts` has an open-ended final band, so the maths
 * carries past this number; 250 is a UI ceiling, not a pricing one. Anything
 * larger is an enterprise conversation rather than a self-serve quote.
 */
export const MAX_LOCATIONS = 250;

/** Default tick marks. Each is rendered at its own position, not evenly spread. */
export const DEFAULT_LOCATION_TICKS = [1, 25, 50, 100, 175, MAX_LOCATIONS];
