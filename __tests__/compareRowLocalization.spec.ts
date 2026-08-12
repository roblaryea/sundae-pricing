/**
 * The always-visible comparison row must not be in English.
 *
 * Three strings on the row every visitor sees were hardcoded English in a
 * product that ships 22 locales:
 *
 *   `covers ${n} of your ${m} domains`
 *   "cheaper per year"
 *   `${name} costs less per year`
 *
 * The last two sit directly under the dollar figure and render precisely when a
 * competitor BEATS us — the honest-loss case, and the moment a non-English
 * buyer most needs to understand what they are reading. This is the same defect
 * class already fixed once on the quote screen, where the money lines were
 * literal English in JSX.
 *
 * The coverage line was also a bare count. It now carries the day-one signal,
 * so a buyer who never opens the accordion still sees that a build-your-own
 * option answers nothing on day one and what the build costs first.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { getCompetitorCompareCopy } from "../src/lib/pricingUiCopy";

const SRC = readFileSync("src/components/Summary/CompactCompetitorCompare.tsx", "utf8");

const LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

/** Lines of JSX, excluding comments — where a literal would actually render. */
const RENDERED = SRC.split("\n").filter((l) => {
  const t = l.trim();
  return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
});

describe("no English literal survives on the row", () => {
  it.each([
    ["covers N of your M domains", /covers \$\{|`covers /],
    ["cheaper per year", />cheaper per year</],
    ["costs less per year", /costs less per year`/],
  ])("%s is gone", (_label, pattern) => {
    const offending = RENDERED.filter((l) => pattern.test(l));
    expect(offending, `still rendered: ${offending[0]?.trim().slice(0, 100)}`).toEqual([]);
  });

  it("reads those three lines from the copy pack instead", () => {
    expect(SRC).toMatch(/copy\.dayOneLabel/);
    expect(SRC).toMatch(/copy\.cheaperPerYear/);
    expect(SRC).toMatch(/copy\.competitorCostsLess/);
  });
});

describe("the row's copy ships in every locale", () => {
  const KEYS = ["cheaperPerYear", "competitorCostsLess"] as const;

  it.each(LOCALES)("%s defines both money labels", (locale) => {
    const copy = getCompetitorCompareCopy(locale as never) as unknown as Record<string, unknown>;
    for (const key of KEYS) {
      expect(typeof copy[key], `${locale}.${key}`).toBe("string");
      expect(copy[key] as string).toBeTruthy();
    }
  });

  it.each(LOCALES)("%s keeps the {name} token", (locale) => {
    const copy = getCompetitorCompareCopy(locale as never) as unknown as Record<string, string>;
    expect(copy.competitorCostsLess).toContain("{name}");
  });

  it("is transcreated rather than falling back to English", () => {
    const en = getCompetitorCompareCopy("en" as never) as unknown as Record<string, string>;
    for (const locale of LOCALES) {
      if (locale === "en") continue;
      const c = getCompetitorCompareCopy(locale as never) as unknown as Record<string, string>;
      expect(c.cheaperPerYear, `${locale} still reads English`).not.toBe(en.cheaperPerYear);
    }
  });
});

describe("the collapsed row carries value, not just a count", () => {
  it("shows day-one coverage without needing the accordion opened", () => {
    // The rail inside the expanded panel is worth nothing to a visitor who
    // never expands it.
    const rowSection = SRC.slice(
      SRC.indexOf("{/* Main row - always visible */}"),
      SRC.indexOf("{/* Expanded details */}") > 0
        ? SRC.indexOf("{/* Expanded details */}")
        : SRC.length,
    );
    expect(rowSection).toMatch(/dayOneLabel/);
    expect(rowSection).toMatch(/dayOneDomains/);
  });

  it("names the build cost on the row when day one is zero", () => {
    const rowSection = SRC.slice(SRC.indexOf("{/* Main row - always visible */}"));
    expect(rowSection).toMatch(/buildBeforeFirstAnswer/);
    expect(rowSection).toMatch(/copy\.buildFirst/);
  });
});
