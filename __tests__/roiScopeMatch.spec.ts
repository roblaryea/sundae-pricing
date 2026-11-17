/**
 * Full-plan economics use all selected costs while benefit assumptions stay
 * limited to supported Core domains. Historical partial-scope copy remains
 * covered for legacy consumers; the current calculator uses the explicit
 * full-plan/economic disclosure tested in roiEconomics and roiRendering.
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

  it("keeps Delivery outside the published package grants and scores their supported domains", () => {
    const granted = new Set(
      Object.values(corePackages).flatMap((p) => [...p.includesDomainModules]),
    );
    expect(granted.has("delivery")).toBe(false);
    for (const id of Object.keys(SAVINGS_ASSUMPTIONS).filter((id) => id !== "delivery")) {
      expect(granted.has(id), `${id} is scored but no package grants it`).toBe(true);
    }
  });
});

describe("the ROI step prices the full basket and discloses the recovery boundary", () => {
  const SRC = readFileSync("src/components/PricingDisplay/ROISimulator.tsx", "utf8");
  it("passes the selected basket cost to the calculation", () => {
    expect(SRC).toMatch(/roiInputs,\s*pricing\.monthly,\s*implementationCost/);
    expect(SRC).not.toContain('coreOnlyMonthly');
    expect(SRC).toContain('roi.monthlyNetBenefit');
  });
  it("discloses Core-only benefit assumptions without excluding purchased costs", () => {
    expect(SRC).toContain('economicsCopy.scopeNote');
    expect(SRC).toContain('economicsCopy.methodNote');
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
