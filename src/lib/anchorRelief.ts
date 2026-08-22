import { corePackages, crewSkus, crewBundles } from '../data/pricing';
import type { CorePackageId } from '../data/pricing';

/**
 * Anchor relief — a first-unit discount that tapers to list over four years.
 *
 * The anchor is where the small-estate problem lives. At five locations it is
 * 63% of the bill; at 250 it is 4%. So a flat percentage off the whole invoice
 * gives most of its value to the customers who need it least, and a flat
 * discount that simply expires creates a renewal quote that reads as a price
 * rise — 50% off year one is a +46% increase at month 13 for a five-site group,
 * which is how a discount turns into churn.
 *
 * Discounting only the first unit self-targets: the same schedule is worth ~31%
 * to a five-site operator and ~2% to a 250-site one, without touching list and
 * without repricing the per-location bands anybody else is on.
 *
 * The glide is 75 / 50 / 25 / 0. Four steps rather than two keeps every
 * year-on-year increase in single digits from 25 locations upward, and it is
 * the only schedule modelled that makes Sundae cheaper per site than the
 * Tenzo + Deputy stack for an operator below 20 locations.
 */

/** Discount applied to the anchor, by contract year (1-indexed). */
export const ANCHOR_RELIEF_GLIDE = [0.75, 0.5, 0.25, 0] as const;

export interface AnchorReliefYear {
  year: number;
  /** Fraction off the anchor this year. */
  discount: number;
  /** Monthly bill for the year. */
  monthly: number;
  /** Monthly bill ÷ locations. An average, never a per-location rate. */
  perLocation: number;
  /** Increase over the previous year, as a fraction. Null in year one. */
  stepUp: number | null;
}

export interface AnchorReliefInput {
  /** Sum of the anchors on the quote — Core, and Crew when both rails are sold. */
  anchorTotal: number;
  /** Everything that is not an anchor: the per-location bands, add-ons, Watchtower. */
  recurringTotal: number;
  locations: number;
  glide?: readonly number[];
}

/**
 * The full schedule, including the step-ups.
 *
 * Returning the increases alongside the prices is deliberate: a schedule that
 * shows only the discounted years is the same document that produces an
 * unwelcome surprise at renewal, and the whole point of a glide over a cliff is
 * that the buyer can see the path before signing it.
 */
export function anchorReliefSchedule({
  anchorTotal,
  recurringTotal,
  locations,
  glide = ANCHOR_RELIEF_GLIDE,
}: AnchorReliefInput): AnchorReliefYear[] {
  const sites = Math.max(1, Math.floor(locations));
  let previous: number | null = null;
  return glide.map((discount, i) => {
    const monthly = anchorTotal * (1 - discount) + recurringTotal;
    const row: AnchorReliefYear = {
      year: i + 1,
      discount,
      monthly,
      perLocation: monthly / sites,
      stepUp: previous === null ? null : monthly / previous - 1,
    };
    previous = monthly;
    return row;
  });
}

/** The anchor for a Core package. */
export function coreAnchor(packageId: CorePackageId | null): number {
  if (!packageId) return 0;
  return corePackages[packageId]?.firstUnitPrice ?? 0;
}

/**
 * The anchor carried by a Crew selection.
 *
 * A detected bundle replaces its constituent SKUs on the quote, so its anchor
 * is the one that bills — summing the individual SKU anchors as well would
 * charge a first unit twice for the same rail.
 */
export function crewAnchor(
  selectedSkus: readonly string[],
  detectedBundleId: string | null,
): number {
  if (detectedBundleId) {
    return (crewBundles as Record<string, { firstUnitPrice?: number }>)[detectedBundleId]
      ?.firstUnitPrice ?? 0;
  }
  return selectedSkus.reduce(
    (sum, id) =>
      sum + ((crewSkus as Record<string, { firstUnitPrice?: number }>)[id]?.firstUnitPrice ?? 0),
    0,
  );
}
