/**
 * The comparison has to argue value, not only price.
 *
 * Above roughly 25 locations several rivals are genuinely cheaper than Sundae
 * and no honest cost line changes that. Until now the card's only non-price
 * signal was a COUNT — "covers 3 of your 11 domains" — which is an inventory,
 * not a benefit. A buyer at that size saw a bigger number, a count, and no
 * reason to pay it.
 *
 * The differentiation content did exist: `competitorEngine.ts` (360 lines,
 * carrying timeToValueDays, setupAvoided and sundaeAdvantages) is imported
 * nowhere, and `competitors.ts` is imported only for its `CompetitorId` type.
 * It could not simply be revived — `sundaeAdvantages` asserts "No setup fees",
 * which is false (we charge $1,500-$12,500) and had already been caught and
 * stripped from the live card once.
 *
 * So the rail is built from what is already verified: day-one coverage and the
 * build that precedes it come from the comparison itself, and a small
 * hand-written set of capability gaps each carries a checkable basis.
 *
 * The house rule these tests enforce is the one that keeps it credible: every
 * claim is phrased as what the VENDOR cannot do, never as "only Sundae can".
 * Toast Benchmarking already gives Toast merchants peer comparison at no
 * separate fee, so an exclusivity claim is false the moment a buyer runs Toast.
 */
import { describe, expect, it } from "vitest";

import {
  CORE_PACKAGE_SELECTION_ID,
  COMPETITOR_PRICING,
  calculateAllComparisons,
} from "../src/data/competitorPricing";
import { PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";
import { getCompetitorCompareCopy } from "../src/lib/pricingUiCopy";

const LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

function comparisons(pkg: "core_foundation" | "core_performance" = "core_foundation") {
  const modules = [
    CORE_PACKAGE_SELECTION_ID,
    ...(PACKAGE_DOMAIN_GRANTS[pkg] as readonly string[]),
  ];
  return calculateAllComparisons(
    25,
    modules,
    {
      coreMonthly: 5_020,
      crewMonthly: 0,
      implementationFee: 2_500,
      implementationScoped: false,
      implementationIsFloor: false,
    },
    { monthlyRevenuePerLocation: 100_000 },
  );
}

describe("day-one coverage is computed and carried", () => {
  it("reports it for every competitor", () => {
    for (const c of comparisons()) {
      expect(typeof c.coverage.dayOneDomains, `${c.competitor.id}`).toBe("number");
      expect(c.coverage.dayOneDomains).toBeGreaterThanOrEqual(0);
    }
  });

  it("never claims more day-one coverage than domains the buyer bought", () => {
    for (const c of comparisons()) {
      expect(c.coverage.dayOneDomains).toBeLessThanOrEqual(c.coverage.selectedDomains);
    }
  });

  it("agrees with the covered list rather than being a second opinion", () => {
    for (const c of comparisons()) {
      expect(c.coverage.dayOneDomains).toBe(c.coverage.covered.length);
    }
  });

  it("says zero for the build-your-own options, because our own data does", () => {
    const byId = Object.fromEntries(comparisons().map((c) => [c.competitor.id, c]));
    expect(byId.powerbi.coverage.dayOneDomains).toBe(0);
    expect(byId.spreadsheets.coverage.dayOneDomains).toBe(0);
    // The line that carries the argument: nothing on day one, after a
    // five-figure build.
    expect(byId.powerbi.coverage.buildBeforeFirstAnswer).toBeGreaterThan(10_000);
  });

  it("shows a point solution answering none of a Foundation buyer's domains", () => {
    // MarketMan covers inventory and purchasing; Core Foundation grants
    // neither. For that buyer it is an ADDITIONAL bill, not an alternative.
    const byId = Object.fromEntries(comparisons("core_foundation").map((c) => [c.competitor.id, c]));
    expect(byId.marketman.coverage.dayOneDomains).toBe(0);
  });
});

describe("capability claims are checkable and not overclaimed", () => {
  const withClaims = Object.values(COMPETITOR_PRICING).filter(
    (c) => (c.cannotDoAtAnyPrice?.length ?? 0) > 0,
  );

  it("has claims to check", () => {
    expect(withClaims.length).toBeGreaterThan(0);
  });

  it("gives every claim a basis a buyer could verify", () => {
    for (const competitor of withClaims) {
      for (const gap of competitor.cannotDoAtAnyPrice!) {
        expect(gap.claim, `${competitor.id}: empty claim`).toBeTruthy();
        expect(
          gap.basis.length,
          `${competitor.id}: "${gap.claim}" has no real basis`,
        ).toBeGreaterThan(40);
      }
    }
  });

  it("never claims Sundae is the only one who can do something", () => {
    // Toast Benchmarking gives Toast merchants peer comparison at no separate
    // fee. An exclusivity claim is false the moment the buyer runs Toast.
    const BANNED = /only sundae|sundae is the only|no one else|nobody else|unique to sundae/i;
    for (const competitor of Object.values(COMPETITOR_PRICING)) {
      for (const gap of competitor.cannotDoAtAnyPrice ?? []) {
        expect(BANNED.test(gap.claim), `${competitor.id}: "${gap.claim}"`).toBe(false);
        expect(BANNED.test(gap.basis), `${competitor.id} basis overclaims`).toBe(false);
      }
    }
  });

  it("does not resurrect the false 'no setup fees' claim", () => {
    // It sits in the dead competitors.ts sundaeAdvantages and is untrue: our
    // implementation classes run $1,500-$12,500.
    for (const competitor of Object.values(COMPETITOR_PRICING)) {
      for (const gap of competitor.cannotDoAtAnyPrice ?? []) {
        expect(/no setup fee/i.test(gap.claim)).toBe(false);
      }
    }
  });

  it("carries the gaps through to the comparison result", () => {
    const byId = Object.fromEntries(comparisons().map((c) => [c.competitor.id, c]));
    expect(byId.powerbi.cannotDoAtAnyPrice.length).toBeGreaterThan(2);
    // A vendor with no hand-written gaps must still get an array, never
    // undefined, or the card has to guard every render.
    expect(Array.isArray(byId.tenzo.cannotDoAtAnyPrice)).toBe(true);
  });
});

describe("the rail ships in every locale", () => {
  const KEYS = ["dayOneLabel", "dayOneDomains", "buildFirst", "cannotBuyLabel"] as const;

  it.each(LOCALES)("%s defines every rail label", (locale) => {
    const copy = getCompetitorCompareCopy(locale as never) as unknown as Record<string, unknown>;
    for (const key of KEYS) {
      expect(typeof copy[key], `${locale}.${key}`).toBe("string");
      expect(copy[key] as string).toBeTruthy();
    }
  });

  it.each(LOCALES)("%s keeps its interpolation tokens", (locale) => {
    const copy = getCompetitorCompareCopy(locale as never) as unknown as Record<string, string>;
    expect(copy.dayOneDomains).toContain("{count}");
    expect(copy.dayOneDomains).toContain("{total}");
    expect(copy.buildFirst).toContain("{amount}");
    expect(copy.cannotBuyLabel).toContain("{name}");
  });

  it("is transcreated rather than left in English", () => {
    const en = getCompetitorCompareCopy("en" as never) as unknown as Record<string, string>;
    for (const locale of LOCALES) {
      if (locale === "en") continue;
      const c = getCompetitorCompareCopy(locale as never) as unknown as Record<string, string>;
      expect(c.dayOneLabel, `${locale} fell back to English`).not.toBe(en.dayOneLabel);
    }
  });
});
