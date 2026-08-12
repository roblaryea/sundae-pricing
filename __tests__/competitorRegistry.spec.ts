/**
 * A competitor must not be able to disappear from the comparison by accident.
 *
 * `COMPETITOR_PRICING` is keyed by record name, and `calculateAllComparisons`
 * looked competitors up with `COMPETITOR_PRICING[c.competitor.id]`. One entry —
 * 7shifts — was stored under the key `sevenShifts` while carrying
 * `id: '7shifts'`. The lookup returned `undefined`, the filter dropped the row,
 * and 7shifts vanished from every on-screen comparison.
 *
 * It was the only entry where key and id disagreed, and it was the cheapest
 * rival on the board — $924/yr at one location, a price Sundae never undercuts
 * at any reachable estate size. Meanwhile the Assumptions panel, which reads the
 * record directly, went on printing "sevenShifts: $76.99/location". The card
 * said one thing and its own footnotes said another.
 *
 * The list of competitors to compare was ALSO hand-maintained and contained the
 * key rather than the id, so the same string appeared in two roles. It is now
 * derived from the catalogue, and these tests pin the invariant that makes the
 * whole class of bug unspellable.
 */
import { describe, expect, it } from "vitest";

import {
  CORE_PACKAGE_SELECTION_ID,
  COMPETITOR_ASSUMPTIONS,
  COMPETITOR_PRICING,
  calculateAllComparisons,
} from "../src/data/competitorPricing";
import { PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";

const ENTRIES = Object.entries(COMPETITOR_PRICING) as Array<[string, { id: string }]>;

function comparisonsAt(locations: number) {
  const modules = [
    CORE_PACKAGE_SELECTION_ID,
    ...(PACKAGE_DOMAIN_GRANTS.core_margin as readonly string[]),
  ];
  return calculateAllComparisons(
    locations,
    modules,
    {
      coreMonthly: 4_000,
      crewMonthly: 0,
      implementationFee: 2_500,
      implementationScoped: false,
      implementationIsFloor: false,
    },
    { monthlyRevenuePerLocation: 100_000 },
  );
}

describe("every record is reachable by its own id", () => {
  it("has competitors to check", () => {
    expect(ENTRIES.length).toBeGreaterThan(4);
  });

  it.each(ENTRIES.map(([key, v]) => [key, v.id]))(
    "key %s matches id %s",
    (key, id) => {
      expect(id, `record "${key}" is unreachable by id "${id}"`).toBe(key);
    },
  );

  it("round-trips every id back to its record", () => {
    for (const [, entry] of ENTRIES) {
      expect(
        (COMPETITOR_PRICING as Record<string, unknown>)[entry.id],
        `id "${entry.id}" does not resolve to a record`,
      ).toBeDefined();
    }
  });
});

describe("the rendered set is derived, not hand-maintained", () => {
  it("renders 7shifts, which the key/id mismatch used to drop", () => {
    const ids = comparisonsAt(10).map((c) => c.competitor.id);
    expect(ids, "7shifts is still missing from the comparison").toContain("7shifts");
  });

  it("renders every priced competitor that is not explicitly withheld", () => {
    const rendered = new Set(comparisonsAt(10).map((c) => c.competitor.id));
    for (const [key, entry] of ENTRIES) {
      const e = entry as { verification?: string; showPricing?: boolean };
      // Unverified prices and deliberately withheld ones stay off the card.
      if (e.verification === "unverified" || e.showPricing === false) continue;
      expect(rendered.has(key), `${key} is priced but never rendered`).toBe(true);
    }
  });

  it("keeps the Assumptions panel in step with the comparison", () => {
    // The panel reads the record directly; a competitor documented there but
    // absent from the card is exactly the contradiction 7shifts produced.
    for (const id of Object.keys(COMPETITOR_ASSUMPTIONS)) {
      expect(
        (COMPETITOR_PRICING as Record<string, unknown>)[id],
        `assumptions document "${id}", which is not a competitor record`,
      ).toBeDefined();
    }
  });
});
