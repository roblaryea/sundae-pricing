/**
 * The quote screen has to be able to survive being read by the person paying.
 *
 * Three ways it failed that test:
 *
 *   1. The Core rail identity was gated on `layer === 'core'`, so the Core+Crew
 *      pathway — a strictly bigger deal — lost the package name, the
 *      What's-Included list, the AI credit allowance and Cross-Intelligence.
 *      The combined quote printed LESS product than the Core-only quote it is a
 *      superset of.
 *   2. The headline printed the Core rail while a "Combined monthly" line lower
 *      down the same card printed Core + Crew. Two answers to one question, and
 *      the prominent one was the cheaper, wrong one.
 *   3. `perLocation` is `total ÷ units`. Bands are MARGINAL, so no location is
 *      ever billed at that figure; labelling it "per location" invites it back
 *      across the table as a rate card.
 *
 * These pin the arithmetic the screen must show and the wiring that decides
 * whether it shows it at all.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { calculateFullPrice, resolveImplementationFee } from "../src/lib/pricingEngine";
import type { Configuration as EngineConfig } from "../src/lib/pricingEngine";
import { computeCrewQuote } from "../src/lib/crewPricing";
import { corePackages, crewBundles } from "../src/data/pricing";

const SUMMARY_SRC = readFileSync("src/components/Summary/ConfigSummary.tsx", "utf8");

function coreConfig(overrides: Partial<EngineConfig> = {}): EngineConfig {
  return {
    layer: "core",
    corePackage: "core_growth",
    locations: 7,
    addOns: [],
    watchtower: ["bundle"],
    crossIntelligence: "pro",
    clientProfile: {
      type: "independent",
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
    },
    ...overrides,
  };
}

describe("combined Core + Crew quote", () => {
  it("bills the sum of both rails, not the Core rail alone", () => {
    const core = calculateFullPrice(coreConfig());
    const LOCATIONS = 7;
    const crew = computeCrewQuote(["crew_operations", "crew_tna", "crew_payroll"], LOCATIONS);

    // Crew Operating is $499 for the first location then $99 a location to ten
    // (price book v1.7 section 4.1), so a seven-location estate is not the anchor.
    expect(crew.monthly).toBe(499 + 6 * 99);
    expect(crew.monthly).toBeGreaterThan(crewBundles.crew_suite_bundle.basePrice);
    // The number the buyer signs. Anything that prints `core.total` as the
    // monthly investment on this pathway is short by the whole Crew rail.
    expect(core.total + crew.monthly).toBeGreaterThan(core.total);
    expect(core.total + crew.monthly).toBe(core.total + 1093);
  });

  it("moves BOTH rails with location count — Crew is banded, not flat", () => {
    // This test previously asserted the Crew rail was estate-independent. It is
    // not: every Crew SKU and net bundle carries a marginal band table, and a
    // buyer adding locations must see the Crew line move with them.
    const skus = ["crew_operations", "crew_tna", "crew_payroll"] as const;
    expect(computeCrewQuote([...skus], 40).monthly).toBeGreaterThan(
      computeCrewQuote([...skus], 1).monthly,
    );

    const one = calculateFullPrice(coreConfig({ locations: 1 }));
    const forty = calculateFullPrice(coreConfig({ locations: 40 }));
    expect(forty.total).toBeGreaterThan(one.total);
  });

  it("goes fractional the moment a term discount applies, so the screen has to print cents", () => {
    // 10% off $5,351 is $4,815.90. The default locale format renders that as
    // "$4,815.9" — a price one digit short of a cent, on the largest number on
    // the page.
    const annual = calculateFullPrice(
      coreConfig({
        clientProfile: {
          type: "independent",
          isEarlyAdopter: false,
          isFranchise: false,
          brandCount: 1,
          billingCycle: "annual",
        },
      }),
    );
    expect(Number.isInteger(annual.total)).toBe(false);
    expect(SUMMARY_SRC).toMatch(/minimumFractionDigits: Number\.isInteger\(amount\) \? 0 : 2/);
  });

  it("charges implementation ONCE at the highest class across both rails", () => {
    // Two rails, two classes, one charge — never a sum, and never the Core
    // rail's class alone just because the Crew rail was quoted separately.
    expect(resolveImplementationFee(["class_a", "class_c"]).fee).toBe(7500);
    expect(resolveImplementationFee(["class_c", "class_a"]).classId).toBe("class_c");

    // An unpublished class on EITHER rail means the selection is scoped, not
    // that the other rail's fee is the answer.
    const mixed = resolveImplementationFee(["class_a", null]);
    expect(mixed.requiresScoping).toBe(true);
  });
});

describe("what the summary screen renders", () => {
  it("resolves the Core package on the combined pathway too", () => {
    // The regression: `layer === 'core' ? corePackages[corePackage] : null`.
    expect(SUMMARY_SRC).not.toMatch(/layer === 'core' \? corePackages/);
    expect(SUMMARY_SRC).toMatch(/hasCoreRail = layer === 'core' \|\| layer === 'both'/);
    expect(SUMMARY_SRC).toMatch(/packageDetails = hasCoreRail \? corePackages\[corePackage\] : null/);
  });

  it("hangs What's-Included, the AI wallet and Cross-Intelligence off the package, not the layer", () => {
    for (const marker of [
      "includedFeatures",
      "pricing.aiCredits",
      "messages.summary.crossIntelligencePro",
    ]) {
      expect(SUMMARY_SRC).toContain(marker);
    }
    // Cross-Intelligence base is $0 with every Core package, so it is part of
    // what was bought whether or not the visitor ever opened the Pro toggle.
    expect(SUMMARY_SRC).not.toMatch(/crossIntelSelection !== 'none' && \(/);
  });

  it("prints the combined total in the headline", () => {
    expect(SUMMARY_SRC).toMatch(/combinedMonthly = pricing\.total \+ crewMonthly/);
    // The annual figure is derived from the same number as the monthly one.
    expect(SUMMARY_SRC).toMatch(/combinedMonthly \* 12/);
    expect(SUMMARY_SRC).not.toMatch(/pricing\.total \* 12/);
  });

  it("labels the marginal-band average as an average and shows the division", () => {
    expect(SUMMARY_SRC).toMatch(/avgLabel = getLiveCalculatorCopy\(locale\)\.avgPerLocation/);
    expect(SUMMARY_SRC).toMatch(/an average, never a per-location rate/);
    // The bare "per location" label on a derived figure is what made it read
    // as a rate card.
    expect(SUMMARY_SRC).not.toMatch(/Avg \$\$\{pricing\.perLocation/);
  });

  it("says outright that the domain modules are not sold separately", () => {
    expect(SUMMARY_SRC).toMatch(/Core domain modules included/);
    expect(SUMMARY_SRC).toMatch(/never sold\s+separately/);
    // Add-ons are the only Core-side purchase, and they get published names —
    // `addOns.join(', ')` printed raw ids like `concept_hotel_fb` on a quote.
    expect(SUMMARY_SRC).not.toMatch(/addOns\.join\(/);
    expect(SUMMARY_SRC).toMatch(/addOnNames/);
  });

  it("gives each package a DIFFERENT module list — that difference is what the ladder sells", () => {
    // This asserted every package granted an identical list, which made Core
    // Performance at $2,980 indistinguishable from Core Foundation at $1,195.
    // Price book v1.7 section 3.1 grants 4 / 6 / 8 / 11.
    const lists = Object.values(corePackages).map((p) => [...p.includesDomainModules].sort().join());
    expect(new Set(lists).size).toBe(Object.keys(corePackages).length);
  });

  it("describes each package by what it delivers, not by what it withholds", () => {
    for (const p of Object.values(corePackages)) {
      expect(p.includedOutcome).toBeTruthy();
      expect(p.includedOutcome).not.toMatch(/\bof 11\b|not included|without|signal but not/i);
    }
  });
});
