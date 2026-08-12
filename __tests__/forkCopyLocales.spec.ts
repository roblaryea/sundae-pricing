/**
 * The fork framing must ship in every locale, not fall back to English.
 *
 * `LocaleContext` deep-merges each pack over the English one, so a missing key
 * renders silently in English rather than crashing. That is a good failsafe and
 * a bad contract: it is exactly how the quote screen's money lines, the ROI
 * verdict and three lines on the comparison row all came to be English in 21
 * locales without anyone noticing.
 *
 * The fork copy is the sentence that stops a buyer reading four ascending
 * prices as four rungs, so an English fallback here loses the whole point of
 * the change for everyone outside the anglosphere.
 */
import { describe, expect, it } from "vitest";

import { resolveMessages } from "../src/contexts/LocaleContext";

const LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

const KEYS = [
  "shapeFoundation",
  "shapeMargin",
  "shapeGrowth",
  "shapePerformance",
  "notALadder",
  "growthOmits",
  "marginOmits",
  "selectPackage",
] as const;

type Pack = Record<string, string>;

/**
 * Resolved the way the app resolves it — through the same deep merge — so a
 * key present only in the English pack is caught here exactly as a visitor
 * would experience it.
 */
const packFor = (locale: string): Pack =>
  ((resolveMessages(locale as never) as unknown as { builder: { tierSelector: Pack } }).builder
    .tierSelector ?? {}) as Pack;

describe("every locale defines the fork framing", () => {
  it.each(LOCALES)("%s has all eight keys", (locale) => {
    const pack = packFor(locale);
    for (const key of KEYS) {
      expect(typeof pack[key], `${locale}.${key} is missing`).toBe("string");
      expect(pack[key]?.trim(), `${locale}.${key} is empty`).toBeTruthy();
    }
  });

  it.each(LOCALES.filter((l) => l !== "en"))("%s is transcreated, not English", (locale) => {
    const en = packFor("en");
    const pack = packFor(locale);
    // selectPackage is excluded: a few languages legitimately render it close
    // to the English, and it is not the sentence carrying the argument.
    for (const key of KEYS.filter((k) => k !== "selectPackage")) {
      expect(pack[key], `${locale}.${key} fell back to the English string`).not.toBe(en[key]);
    }
  });
});

describe("protected product names survive translation", () => {
  it.each(LOCALES)("%s keeps the package names in Latin script", (locale) => {
    const pack = packFor(locale);
    // These are product names. A translated or transliterated "Margin" is a
    // different product as far as the buyer's contract is concerned.
    for (const name of ["Margin", "Growth", "Performance"]) {
      expect(pack.notALadder, `${locale} lost "${name}"`).toContain(name);
    }
  });

  it.each(LOCALES)("%s keeps the {name} token on the select affordance", (locale) => {
    expect(packFor(locale).selectPackage).toContain("{name}");
  });
});

describe("the badges stay short enough to sit on a card", () => {
  it.each(LOCALES)("%s badge lengths are sane", (locale) => {
    const pack = packFor(locale);
    for (const key of ["shapeFoundation", "shapeMargin", "shapeGrowth", "shapePerformance"] as const) {
      expect(
        pack[key].length,
        `${locale}.${key} is a clause, not a badge: "${pack[key]}"`,
      ).toBeLessThan(40);
    }
  });

  it.each(LOCALES)("%s explains the fork in a single sentence-length line", (locale) => {
    expect(packFor(locale).notALadder.length).toBeLessThan(320);
  });
});

describe("the omission lines name what the buyer gives up", () => {
  it.each(LOCALES)("%s points the buyer at an alternative package", (locale) => {
    const pack = packFor(locale);
    // Naming the trade without naming the way out is a dead end, so both lines
    // must reference a package that does have the missing side.
    expect(
      /Margin|Performance/.test(pack.growthOmits),
      `${locale}.growthOmits offers no alternative`,
    ).toBe(true);
    expect(
      /Growth|Performance/.test(pack.marginOmits),
      `${locale}.marginOmits offers no alternative`,
    ).toBe(true);
  });
});
