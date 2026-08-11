/**
 * The ROI denominator must contain exactly what the numerator credits.
 *
 * `pricing.total` carries the add-ons, Watchtower and Cross-Intelligence, and
 * `SAVINGS_ASSUMPTIONS` has a rate for NONE of them — nine domain rates, and
 * nothing for Watchtower, Foresight & Action or any concept SKU. So every
 * incremental purchase entered the model as pure cost against zero benefit and
 * mechanically lowered the return. A Core Performance single site at $100k/month
 * went from +$378/mo net to -$521/mo simply by ticking Watchtower Complete, and
 * the verdict flipped to "does not pay for itself". The configurator argued
 * against its own upsell.
 *
 * Charging something in the denominator while refusing it a numerator is an
 * arithmetic error, not conservatism. The two honest repairs are to give each
 * rail a reasoned savings line, or to model the return on the rail we can
 * evidence and say so. An evidence review rejected five separate attempts to
 * raise or invent savings rates, so a Watchtower rate is not available.
 *
 * The disclosure is what makes the narrower denominator honest rather than
 * flattering: without a line naming the excluded spend, the return would simply
 * look better for reasons the buyer cannot see.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { SAVINGS_ASSUMPTIONS } from "../src/hooks/useROICalculation";
import {
  CONCEPT_SKU_IDS,
  corePackages,
  foresightAction,
  watchtower,
} from "../src/data/pricing";
import { getRoiCopy } from "../src/lib/pricingUiCopy";

const LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

describe("the model has no savings rate for the rails it used to charge", () => {
  it("scores exactly the nine domain rates", () => {
    expect(Object.keys(SAVINGS_ASSUMPTIONS)).toHaveLength(9);
  });

  it("has no rate for any purchasable add-on", () => {
    const purchasable = [...CONCEPT_SKU_IDS, foresightAction.id];
    expect(purchasable.length, "no add-ons found to check").toBeGreaterThan(0);
    for (const id of purchasable) {
      expect(
        SAVINGS_ASSUMPTIONS[id],
        `${id} now has a savings rate — it can go back in the denominator`,
      ).toBeUndefined();
    }
  });

  it("has no rate for any Watchtower module", () => {
    const ids = Object.keys(watchtower);
    expect(ids.length, "no Watchtower modules found to check").toBeGreaterThan(0);
    for (const id of ids) {
      expect(
        SAVINGS_ASSUMPTIONS[id],
        `Watchtower ${id} now has a savings rate`,
      ).toBeUndefined();
    }
  });

  it("scores only domains a package can actually grant", () => {
    const granted = new Set(
      Object.values(corePackages).flatMap((p) => [...p.includesDomainModules]),
    );
    for (const id of Object.keys(SAVINGS_ASSUMPTIONS)) {
      expect(granted.has(id), `${id} is scored but no package grants it`).toBe(true);
    }
  });
});

describe("the ROI step charges the Core rail only", () => {
  const SRC = readFileSync("src/components/PricingDisplay/ROISimulator.tsx", "utf8");

  it("prices the Core rail separately from the full quote", () => {
    expect(SRC).toMatch(/corePricing\s*=\s*usePriceCalculation\(\s*layer,\s*corePackage,\s*locations,\s*\[\],\s*\[\]\s*\)/);
  });

  it("no longer bills add-ons and Crew against Core-only savings", () => {
    const offending = SRC.split("\n").filter((l) =>
      /^\s*pricing\.total \+ crewMonthly,\s*$/.test(l),
    );
    expect(offending, "the full quote is still the ROI denominator").toEqual([]);
  });

  it("computes what it excluded rather than discarding it silently", () => {
    expect(SRC).toMatch(/excludedFromRoi/);
    expect(SRC).toMatch(/pricing\.total \+ crewMonthly - coreOnlyMonthly/);
  });

  it("renders the exclusion to the buyer", () => {
    expect(SRC).toMatch(/copy\.roiBasisNote/);
    expect(SRC).toMatch(/excludedFromRoi > 0/);
  });
});

describe("the disclosure ships in every locale", () => {
  it.each(LOCALES)("%s defines it", (locale) => {
    const copy = getRoiCopy(locale as never) as Record<string, unknown>;
    expect(typeof copy.roiBasisNote, `${locale}.roiBasisNote`).toBe("string");
    expect(copy.roiBasisNote as string).toBeTruthy();
  });

  it.each(LOCALES)("%s keeps the {excluded} token", (locale) => {
    const copy = getRoiCopy(locale as never) as Record<string, string>;
    expect(copy.roiBasisNote, `${locale} lost its amount`).toContain("{excluded}");
  });

  it.each(LOCALES)("%s names Core, so the basis is unambiguous", (locale) => {
    const copy = getRoiCopy(locale as never) as Record<string, string>;
    expect(copy.roiBasisNote).toMatch(/Core/);
  });

  it("is transcreated rather than left in English", () => {
    const en = (getRoiCopy("en" as never) as Record<string, string>).roiBasisNote;
    for (const locale of LOCALES) {
      if (locale === "en") continue;
      const s = (getRoiCopy(locale as never) as Record<string, string>).roiBasisNote;
      expect(s, `${locale} fell back to English`).not.toBe(en);
    }
  });
});
