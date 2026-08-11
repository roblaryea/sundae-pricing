/**
 * The copy resolver must not corrupt the shape it resolves.
 *
 * `resolvePricingUiCopy` was changed to merge FIELD BY FIELD so a partial
 * translation could degrade to English per key rather than blanking a whole
 * screen. That fix carried a regression: not every copy group is an object.
 * Several are flat per-locale strings — `annualAmountTemplates` is
 * `{ en: '${amount} annually', fr: '${amount} par an', … }`.
 *
 * Spreading a string produces an object of character indices, so
 * `formatAnnualAmount` then called `.replaceAll` on an object and threw. English
 * escaped through the identity short-circuit, so it looked fine in development
 * while the quote screen crashed to the error boundary in all 21 translated
 * locales.
 *
 * These tests pin both halves: objects still merge, and non-objects are
 * returned untouched.
 */
import { describe, expect, it } from "vitest";

import {
  formatAnnualAmount,
  getLiveCalculatorCopy,
  getLocationSliderCopy,
  getRoiCopy,
} from "../src/lib/pricingUiCopy";

const LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

describe("flat string copy groups survive resolution", () => {
  it.each(LOCALES)("formatAnnualAmount returns a string for %s", (locale) => {
    const out = formatAnnualAmount(locale as never, "$1,234");
    expect(typeof out, `${locale} did not resolve to a string`).toBe("string");
    expect(out).toContain("$1,234");
  });

  it("never returns an object of character indices", () => {
    for (const locale of LOCALES) {
      const out = formatAnnualAmount(locale as never, "$1");
      // The bug produced something whose String() was "[object Object]".
      expect(out).not.toMatch(/\[object Object\]/);
      expect(out.length).toBeLessThan(200);
    }
  });

  it("keeps each locale's own wording rather than falling back to English", () => {
    expect(formatAnnualAmount("fr" as never, "$1")).not.toBe(
      formatAnnualAmount("en" as never, "$1"),
    );
    expect(formatAnnualAmount("ja" as never, "$1")).not.toBe(
      formatAnnualAmount("en" as never, "$1"),
    );
  });
});

describe("object copy groups still merge per field", () => {
  it.each(LOCALES)("%s resolves every live-calculator key", (locale) => {
    const c = getLiveCalculatorCopy(locale as never) as Record<string, unknown>;
    for (const key of ["monthlyTotal", "perLocation", "avgPerLocation", "perMonthShort"]) {
      expect(typeof c[key], `${locale}.${key}`).toBe("string");
      expect(c[key]).toBeTruthy();
    }
  });

  it("backfills a missing key from English instead of blanking it", () => {
    // `avgPerLocation` exists in the hand-written packs; the generated ones
    // inherit it through the merge rather than rendering nothing.
    for (const locale of LOCALES) {
      const c = getLiveCalculatorCopy(locale as never) as Record<string, string>;
      expect(c.avgPerLocation, `${locale} lost avgPerLocation`).toBeTruthy();
    }
  });

  it("does not overwrite a translated value with the English one", () => {
    const de = getLiveCalculatorCopy("de" as never) as Record<string, string>;
    const en = getLiveCalculatorCopy("en" as never) as Record<string, string>;
    expect(de.perLocation).not.toBe(en.perLocation);
  });

  it.each(LOCALES)("%s resolves nested ROI copy without throwing", (locale) => {
    const roi = getRoiCopy(locale as never) as Record<string, unknown>;
    expect(roi).toBeTruthy();
    expect(typeof roi.paysForItselfIn).toBe("string");
    expect(typeof roi.noPaybackAtTheseInputs).toBe("string");
  });

  it.each(LOCALES)("%s resolves the location-slider group", (locale) => {
    const c = getLocationSliderCopy(locale as never) as Record<string, unknown>;
    expect(typeof c.totalMonthly).toBe("string");
    expect(typeof c.avgPerLocation).toBe("string");
  });
});
