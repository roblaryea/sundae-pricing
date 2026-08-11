/**
 * The quote screen ships in all 22 locales.
 *
 * The summary is the artefact a buyer forwards, and its most important lines
 * were literal English in JSX — the monthly investment, the two rails, the
 * combined total, the one-time implementation, the per-object overlay
 * disclosure, the commitment term and every discount line. A visitor on the
 * German site configured a quote in German and then read the number that
 * decides the deal in English.
 *
 * The discount lines were the subtlest: the engine has no locale, so it emitted
 * English text, and the existing localiser matched on English substrings
 * ("volume discount", "billing discount") that the itemised labels no longer
 * contain — so they fell through untranslated. Each line now carries a stable
 * key the summary resolves.
 */
import { describe, expect, it } from "vitest";

import { quoteSummaryCopy, getQuoteSummaryCopy } from "../src/lib/quoteSummaryCopy";

const SHIPPED_LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

const KEYS = Object.keys(quoteSummaryCopy.en) as Array<keyof typeof quoteSummaryCopy.en>;

describe("coverage", () => {
  it("ships every locale the site supports", () => {
    expect(Object.keys(quoteSummaryCopy).sort()).toEqual([...SHIPPED_LOCALES].sort());
  });

  it.each(SHIPPED_LOCALES)("%s defines every key", (locale) => {
    const pack = quoteSummaryCopy[locale];
    expect(pack, `${locale} is missing entirely`).toBeTruthy();
    for (const key of KEYS) {
      expect(pack[key], `${locale}.${String(key)} is empty`).toBeTruthy();
      expect(typeof pack[key]).toBe("string");
    }
  });

  it("has no locale with extra or missing keys", () => {
    for (const locale of SHIPPED_LOCALES) {
      expect(Object.keys(quoteSummaryCopy[locale]).sort()).toEqual([...KEYS].sort());
    }
  });
});

describe("transcreation, not translation-by-fallback", () => {
  it("does not leave the money lines in English", () => {
    // These are the lines a buyer scrutinises; an English fallback here is the
    // whole defect.
    const MUST_DIFFER = [
      "monthlyInvestment",
      "combinedMonthly",
      "implementationOneTime",
      "commitmentTerm",
      "yourConfiguration",
    ] as const;
    for (const locale of SHIPPED_LOCALES) {
      if (locale === "en") continue;
      for (const key of MUST_DIFFER) {
        expect(
          quoteSummaryCopy[locale][key],
          `${locale}.${key} is still the English string`,
        ).not.toBe(quoteSummaryCopy.en[key]);
      }
    }
  });

  it("keeps protected brand terms literal in every locale", () => {
    // Sundae product names are never translated.
    for (const locale of SHIPPED_LOCALES) {
      expect(quoteSummaryCopy[locale].coreRail).toMatch(/Core/);
      expect(quoteSummaryCopy[locale].crewRail).toMatch(/Crew/);
      expect(quoteSummaryCopy[locale].crewStackReady).toMatch(/Crew/);
    }
  });

  it("preserves every interpolation token", () => {
    const TOKENS: Array<[keyof typeof quoteSummaryCopy.en, string]> = [
      ["saveShort", "{percent}"],
      ["volumeLabel", "{locations}"],
      ["volumeNotApplied", "{percent}"],
      ["termNotApplied", "{percent}"],
    ];
    for (const locale of SHIPPED_LOCALES) {
      for (const [key, token] of TOKENS) {
        expect(
          quoteSummaryCopy[locale][key],
          `${locale}.${String(key)} lost its ${token} token`,
        ).toContain(token);
      }
    }
  });
});

describe("getQuoteSummaryCopy", () => {
  it("returns the locale's own pack", () => {
    expect(getQuoteSummaryCopy("de")).toBe(quoteSummaryCopy.de);
    expect(getQuoteSummaryCopy("ja")).toBe(quoteSummaryCopy.ja);
  });

  it("falls back to English only for a locale we do not ship", () => {
    expect(getQuoteSummaryCopy("xx-YY")).toBe(quoteSummaryCopy.en);
  });
});
