/**
 * The competitor card has to survive being read next to the quote it sits under.
 *
 * Five defects shipped on that one card, and each of them was a number that
 * could not be checked against anything else on the same screen:
 *
 *   1. CONTRADICTION. On the Core+Crew pathway the investment summary printed
 *      "$57,168 annually" and the card 30 pixels below printed "Sundae First
 *      Year $51,180", then built a "$37,420 saving" on the smaller one. The
 *      card re-priced Sundae with no client profile (so no commitment
 *      discount), no Cross-Intelligence and no Crew rail — a configuration the
 *      buyer had not chosen, cheaper than the one they had, by $5,988/yr.
 *   2. UNRECONCILED TOTAL. The Power BI card printed $88,600 over three lines
 *      summing to $53,600. The $35,000 gap was a second helping of the same
 *      half-analyst already billed as "Maintenance", and the UI sliced the
 *      breakdown to three rows so it never appeared.
 *   3. INVENTED INPUT. The spreadsheets card charged 0.2% of a hardcoded
 *      $100k/location/month. At 25 sites that conjured $60,000 of competitor
 *      cost while the buyer's real $50k sat two steps earlier in the journey.
 *   4. FALSE CLAIM. "No setup fees" rendered directly beneath an investment
 *      summary reading "Implementation: Scoped at contract".
 *   5. STALE BADGE. The only green "Verified" belonged to MarketMan, whose own
 *      linked page publishes Starter $199 / Growth $249 / Enterprise custom and
 *      "FREE setup" — no Professional tier, no $250, no $500 setup fee.
 *
 * These tests pin the arithmetic, the provenance and the wiring that decides
 * whether any of it reaches the screen.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import {
  comparisonAmount,
  COMPETITOR_ASSUMPTIONS,
  COMPETITOR_PRICING,
  CORE_PACKAGE_SELECTION_ID,
  VERIFICATION_FRESHNESS_DAYS,
  calculateAllComparisons,
  calculateCompetitorComparison,
  effectiveVerification,
  verificationAgeDays,
  type SundaeQuoteBasis,
} from "../src/data/competitorPricing";
import { calculateFullPrice } from "../src/lib/pricingEngine";
import { CORE_DOMAIN_MODULE_IDS, PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";

const CARD_SRC = readFileSync("src/components/Summary/CompactCompetitorCompare.tsx", "utf8");
const SUMMARY_SRC = readFileSync("src/components/Summary/ConfigSummary.tsx", "utf8");

const SELECTION = [CORE_PACKAGE_SELECTION_ID, ...CORE_DOMAIN_MODULE_IDS];
const PRICED_IDS = Object.keys(COMPETITOR_PRICING).filter(
  (id) => COMPETITOR_PRICING[id].verification !== "unverified",
);
const AS_OF = new Date("2026-08-11T00:00:00Z");

function basis(overrides: Partial<SundaeQuoteBasis> = {}): SundaeQuoteBasis {
  return {
    coreMonthly: 4265,
    crewMonthly: 499,
    implementationFee: 0,
    implementationScoped: true,
    implementationIsFloor: false,
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. THE CARD AND THE QUOTE ABOVE IT AGREE
// ═══════════════════════════════════════════════════════════════════════════

describe("Sundae's side of the comparison is the quote on the same screen", () => {
  // The exact configuration that produced the contradiction: Core Growth, 10
  // locations, Crew Operating Suite, no commitment discount.
  const coreRail = calculateFullPrice({
    layer: "core",
    corePackage: "core_growth",
    locations: 10,
    addOns: [],
    watchtower: [],
    clientProfile: {
      type: "independent",
      isEarlyAdopter: false,
      isFranchise: false,
      brandCount: 1,
      billingCycle: "monthly",
    },
  });

  it("reproduces the reported Core rail, so the rest of the test is anchored to a real quote", () => {
    expect(coreRail.total).toBe(4265);
    // The figure the card used to print, which is the Core rail alone.
    expect(coreRail.total * 12).toBe(51180);
  });

  it("prices Sundae at the summary's combined annual, not the Core rail alone", () => {
    const reported = basis({ coreMonthly: coreRail.total, crewMonthly: 499 });
    const comparisons = calculateAllComparisons(10, SELECTION, reported, undefined, AS_OF);

    expect(comparisons.length).toBeGreaterThan(0);
    for (const c of comparisons) {
      // The number the investment summary prints.
      expect(c.sundaeCost.annual).toBe(57168);
      // And never the Core-only number the card used to build savings on.
      expect(c.sundaeCost.annual).not.toBe(51180);
      expect(c.sundaeCost.crewMonthly).toBe(499);
    }
  });

  it("never reports a saving computed against a total smaller than the quote", () => {
    const reported = basis({ coreMonthly: coreRail.total, crewMonthly: 499 });
    for (const c of calculateAllComparisons(10, SELECTION, reported, undefined, AS_OF)) {
      expect(c.savings.ongoing).toBe(c.competitorCost.ongoing - 57168);
      // The headline saving the card used to advertise against Power BI.
      expect(c.savings.ongoing).not.toBe(37420);
    }
  });

  it("carries the commitment discount, because the summary does", () => {
    const discounted = calculateFullPrice({
      layer: "core",
      corePackage: "core_growth",
      locations: 10,
      addOns: [],
      watchtower: [],
      clientProfile: {
        type: "independent",
        isEarlyAdopter: false,
        isFranchise: false,
        brandCount: 1,
        billingCycle: "two_year_upfront",
      },
    });
    expect(discounted.total).toBeLessThan(coreRail.total);

    const [c] = calculateAllComparisons(
      10,
      SELECTION,
      basis({ coreMonthly: discounted.total, crewMonthly: 499 }),
      undefined,
      AS_OF,
    );
    expect(c.sundaeCost.annual).toBe(Math.round((discounted.total + 499) * 12 * 100) / 100);
    expect(c.sundaeCost.annual).toBeLessThan(57168);
  });

  it("adds every rail into the annual figure, at any rail split", () => {
    for (const [core, crew] of [
      [1195, 0],
      [4265, 499],
      [9000, 1250],
    ]) {
      const [c] = calculateAllComparisons(
        4,
        SELECTION,
        basis({ coreMonthly: core, crewMonthly: crew }),
        undefined,
        AS_OF,
      );
      expect(c.sundaeCost.annual).toBe((core + crew) * 12);
      expect(c.sundaeCost.monthly).toBe(core + crew);
    }
  });

  it("wires the card to the same inputs ConfigSummary prices from", () => {
    // Each of these is a term the old card omitted, and each omission made
    // Sundae look cheaper than the quote directly above it.
    for (const token of [
      "billingCycle",
      "isFranchise",
      "brandCount",
      "crossIntelligence",
      "computeCrewQuote",
      "resolveImplementationClass",
      "resolveImplementationFee",
    ]) {
      expect(CARD_SRC, `card no longer accounts for ${token}`).toContain(token);
      expect(SUMMARY_SRC, `summary no longer accounts for ${token}`).toContain(token);
    }
  });

  it("refuses to compare at all where the quote itself is not published", () => {
    // 250+ units is quoted, not published; the summary prints "Custom pricing".
    expect(CARD_SRC).toContain("requiresEnterpriseQuote");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. EVERY TOTAL IS THE SUM OF ITS VISIBLE PARTS
// ═══════════════════════════════════════════════════════════════════════════

describe("a competitor total reconciles with its breakdown", () => {
  const SIZES = [1, 3, 6, 10, 21, 40, 120];

  it.each(PRICED_IDS)("%s sums its lines to every headline figure", (id) => {
    for (const locations of SIZES) {
      const cost = COMPETITOR_PRICING[id].calculate(locations, SELECTION, {
        monthlyRevenuePerLocation: 100000,
      });
      const recurring = cost.lines
        .filter((l) => l.kind === "recurring")
        .reduce((t, l) => t + l.amount, 0);
      const oneTime = cost.lines
        .filter((l) => l.kind === "one_time")
        .reduce((t, l) => t + l.amount, 0);

      expect(cost.ongoing, `${id} @ ${locations}`).toBe(recurring);
      expect(cost.setupFee, `${id} @ ${locations}`).toBe(oneTime);
      expect(cost.firstYear, `${id} @ ${locations}`).toBe(recurring + oneTime);
      expect(cost.monthly, `${id} @ ${locations}`).toBe(Math.round(recurring / 12));
      // The rendered breakdown IS the lines, so it cannot omit one.
      expect(Object.keys(cost.breakdown ?? {}).length).toBe(cost.lines.length);
    }
  });

  it("charges the Power BI analyst once, not twice", () => {
    const cost = COMPETITOR_PRICING.powerbi.calculate(10, SELECTION);
    // 15 Premium seats x the published PPU rate x 12, plus a 30,000 build and
    // 20,000 support. Derived from the rate rather than hardcoded: the seat
    // price is a Microsoft list figure that moves (it went $20 -> $24 in the
    // 2025 reprice, which silently invalidated the literal that used to be
    // here).
    const ppu = COMPETITOR_PRICING.powerbi.pricing.licenses.premiumPerUser;
    expect(cost.firstYear).toBe(15 * ppu * 12 + 30000 + 20000);
    // The printed total that its own breakdown contradicted.
    expect(cost.firstYear).not.toBe(88600);
    expect(cost.lines.map((l) => l.label)).toEqual([
      "Licenses (verified)",
      "Implementation (estimated)",
      "Maintenance (estimated)",
    ]);
    // No line may name the analyst separately from the support line that is it.
    expect(cost.lines.filter((l) => /analyst|FTE/i.test(l.label))).toHaveLength(0);
    const support = cost.lines.find((l) => l.label === "Maintenance (estimated)");
    expect(support?.source).toMatch(/0\.5 FTE/);
    expect(support?.source).toMatch(/once/i);
  });

  it("cannot reproduce the $88,600 figure at any estate size", () => {
    for (let locations = 1; locations <= 300; locations++) {
      expect(COMPETITOR_PRICING.powerbi.calculate(locations, SELECTION).firstYear).not.toBe(88600);
    }
  });

  it("renders every line rather than the first three", () => {
    // The display half of the same defect: a sliced breakdown cannot reconcile.
    expect(CARD_SRC).not.toMatch(/breakdown[\s\S]{0,80}\.slice\(/);
    expect(CARD_SRC).not.toMatch(/\.slice\(0,\s*[0-9]+\)/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. NO LINE IS DERIVED FROM A NUMBER THE BUYER NEVER GAVE
// ═══════════════════════════════════════════════════════════════════════════

describe("the spreadsheets error cost uses the buyer's own revenue", () => {
  const errorLine = (locations: number, monthlyRevenuePerLocation?: number) =>
    COMPETITOR_PRICING.spreadsheets
      .calculate(locations, SELECTION, monthlyRevenuePerLocation ? { monthlyRevenuePerLocation } : undefined)
      .lines.find((l) => /Error\/rework/.test(l.label));

  it("bills 0.2% of the revenue that was actually entered", () => {
    const cost = COMPETITOR_PRICING.spreadsheets.calculate(25, SELECTION, {
      monthlyRevenuePerLocation: 50000,
    });
    // 25 x $50,000 x 12 = $15.0M; 0.2% = $30,000.
    expect(errorLine(25, 50000)?.amount).toBe(30000);
    // labour 62,500 + software 200 + errors 30,000
    expect(cost.firstYear).toBe(92700);
    // The figure produced by the invented $100k/location/month.
    expect(cost.firstYear).not.toBe(122700);
  });

  it("drops the line entirely rather than assume a revenue", () => {
    const cost = COMPETITOR_PRICING.spreadsheets.calculate(25, SELECTION);
    expect(errorLine(25)).toBeUndefined();
    expect(cost.firstYear).toBe(62700);
    expect(cost.notes).toMatch(/omitted/i);
    // A missing input must cost the comparison a line, never the buyer a number.
    expect(cost.lines.every((l) => l.amount > 0)).toBe(true);
  });

  it("scales with the entered revenue and nothing else", () => {
    for (const revenue of [20000, 50000, 100000, 250000]) {
      expect(errorLine(8, revenue)?.amount).toBe(Math.round(8 * revenue * 12 * 0.002));
    }
    // Same revenue, same rate — the 0.2% itself is unchanged from before.
    expect(errorLine(10, 100000)?.amount).toBe(24000);
  });

  it("states the basis it used, so a reader can check it", () => {
    expect(errorLine(25, 50000)?.source).toContain("15,000,000");
    expect(errorLine(25, 50000)?.source).toMatch(/you entered/i);
  });

  it("passes the buyer's ROI answer through from the card", () => {
    expect(CARD_SRC).toContain("roiInputs.monthlyRevenue");
    expect(CARD_SRC).toContain("monthlyRevenuePerLocation");
  });

  it("keeps no hardcoded revenue constant anywhere in the competitor data", () => {
    const SRC = readFileSync("src/data/competitorPricing.ts", "utf8");
    expect(SRC).not.toMatch(/locations \* 100000/);
    expect(SRC).not.toMatch(/100000 \* 12/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. ONE-TIME FEES ARE STATED, NOT WISHED AWAY
// ═══════════════════════════════════════════════════════════════════════════

describe("implementation is never claimed to be free", () => {
  it("does not print 'No setup fees'", () => {
    expect(CARD_SRC).not.toContain("noSetupFees");
    // The summary directly above says this; the card must not contradict it.
    expect(CARD_SRC).toContain("Scoped at contract");
  });

  it("withholds a first-year figure while implementation is unscoped", () => {
    const [c] = calculateAllComparisons(
      10,
      SELECTION,
      basis({ implementationScoped: true }),
      undefined,
      AS_OF,
    );
    expect(c.sundaeCost.firstYear).toBeNull();
    expect(c.savings.firstYearComparable).toBe(false);
    expect(c.sundaeCost.implementationScoped).toBe(true);
  });

  it("includes implementation on our side once it is a number", () => {
    const [c] = calculateAllComparisons(
      10,
      SELECTION,
      basis({ implementationScoped: false, implementationFee: 7500 }),
      undefined,
      AS_OF,
    );
    expect(c.sundaeCost.firstYear).toBe(57168 + 7500);
    expect(c.savings.firstYearComparable).toBe(true);
    expect(c.savings.firstYear).toBe(c.competitorCost.firstYear - (57168 + 7500));
  });

  it("leads on recurring only while OUR implementation is still scoped", () => {
    // This is the guard against the reverse defect: counting a competitor's
    // setup fee against a Sundae figure that excludes ours.
    const [c] = calculateAllComparisons(10, SELECTION, basis(), undefined, AS_OF);
    expect(c.savings.firstYearComparable).toBe(false);
    expect(comparisonAmount(c)).toBe(c.savings.ongoing);
    expect(c.savings.ongoing).toBe(c.competitorCost.ongoing - c.sundaeCost.annual);
    expect(c.competitorCost.ongoing + c.competitorCost.setupFee).toBe(c.competitorCost.firstYear);
  });

  it("leads on FIRST YEAR once our implementation is a number", () => {
    // Recurring-only silently gave every competitor their setup fee for free —
    // Tenzo charges $1,050 a location, Power BI $15,000-$50,000 to build. The
    // discovery answers now resolve our class, so both sides are knowable and
    // the honest basis is the one that includes them.
    const [c] = calculateAllComparisons(
      10,
      SELECTION,
      basis({ implementationScoped: false, implementationFee: 7500 }),
      undefined,
      AS_OF,
    );
    expect(c.savings.firstYearComparable).toBe(true);
    expect(comparisonAmount(c)).toBe(c.savings.firstYear);
    expect(comparisonAmount(c)).not.toBe(c.savings.ongoing);
  });

  it("sorts by the basis it displays, on either basis", () => {
    for (const b of [basis(), basis({ implementationScoped: false, implementationFee: 7500 })]) {
      const all = calculateAllComparisons(10, SELECTION, b, undefined, AS_OF);
      const sorted = [...all].sort((x, y) => comparisonAmount(y) - comparisonAmount(x));
      expect(all.map((c) => c.competitor.id)).toEqual(sorted.map((c) => c.competitor.id));
    }
  });

  it("keeps the PDF path's arithmetic when handed a bare monthly number", () => {
    // pdfGenerator prices the Core rail only and passes a number. That caller
    // must keep working exactly as before, or the emailed quote changes shape.
    const legacy = calculateCompetitorComparison("powerbi", 10, SELECTION, 4265, undefined, AS_OF);
    expect(legacy?.sundaeCost.annual).toBe(51180);
    expect(legacy?.sundaeCost.crewMonthly).toBe(0);
    // Against the competitor's own computed first year, not a literal that goes
    // stale the next time Microsoft reprices a seat.
    const powerbiFirstYear = COMPETITOR_PRICING.powerbi.calculate(10, SELECTION).firstYear;
    expect(legacy?.savings.firstYear).toBe(powerbiFirstYear - 51180);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. VERIFICATION MEANS WHAT IT SAYS
// ═══════════════════════════════════════════════════════════════════════════

describe("MarketMan matches the page it links to", () => {
  // Read from marketman.com/pricing on 2026-08-11:
  //   Starter $199 /monthly · Growth $249 /monthly · Enterprise "Custom"
  //   "Get started with FREE setup ($1,500 Value)"
  it("quotes a plan that exists, at the price the page publishes", () => {
    const cost = COMPETITOR_PRICING.marketman.calculate(1, SELECTION);
    expect(cost.ongoing).toBe(249 * 12);
    expect(cost.monthly).toBe(249);
    // No "Professional" tier is published, and $250 is not a published price.
    expect(cost.lines.some((l) => /Professional/i.test(l.label))).toBe(false);
    expect(JSON.stringify(COMPETITOR_PRICING.marketman.pricing)).not.toContain("250");
  });

  it("stops charging a setup fee the vendor advertises as free", () => {
    for (const locations of [1, 5, 25]) {
      expect(COMPETITOR_PRICING.marketman.calculate(locations, SELECTION).setupFee).toBe(0);
    }
  });

  it("does not claim a multi-site multiplier the page never publishes", () => {
    const single = COMPETITOR_PRICING.marketman.calculate(1, SELECTION);
    const multi = COMPETITOR_PRICING.marketman.calculate(9, SELECTION);
    expect(single.lines[0].verification).toBe("verified");
    expect(multi.lines[0].verification).toBe("estimated");
    expect(multi.lines[0].source).toMatch(/not published/i);
    expect(COMPETITOR_ASSUMPTIONS.marketman.notes).toMatch(/not published/i);
  });
});

describe("a verified badge is a claim about freshness too", () => {
  it("decays once the check is older than the published window", () => {
    const checked = "2026-01-01";
    const inside = new Date("2026-03-01T00:00:00Z");
    const outside = new Date("2026-08-11T00:00:00Z");

    expect(verificationAgeDays(checked, inside)).toBeLessThanOrEqual(VERIFICATION_FRESHNESS_DAYS);
    expect(effectiveVerification("verified", checked, inside)).toBe("verified");

    expect(verificationAgeDays(checked, outside)).toBeGreaterThan(VERIFICATION_FRESHNESS_DAYS);
    expect(effectiveVerification("verified", checked, outside)).toBe("estimated");
  });

  it("refuses to badge an undated check as verified", () => {
    expect(effectiveVerification("verified", null)).toBe("estimated");
    expect(effectiveVerification("verified", undefined)).toBe("estimated");
  });

  it("never upgrades an estimate", () => {
    expect(effectiveVerification("estimated", "2026-08-11", AS_OF)).toBe("estimated");
    expect(effectiveVerification("unverified", "2026-08-11", AS_OF)).toBe("unverified");
  });

  it("shows no stale green badge on the card today", () => {
    for (const c of calculateAllComparisons(10, SELECTION, basis(), undefined, AS_OF)) {
      if (c.competitor.effectiveVerification !== "verified") continue;
      const age = verificationAgeDays(c.competitor.lastVerified, AS_OF);
      expect(age, `${c.competitor.id} claims Verified with no dated check`).not.toBeNull();
      expect(age!, `${c.competitor.id} claims Verified on a stale check`).toBeLessThanOrEqual(
        VERIFICATION_FRESHNESS_DAYS,
      );
    }
  });

  it("renders the decayed level, not the declared one", () => {
    expect(CARD_SRC).toContain("effectiveVerification");
    expect(CARD_SRC).not.toMatch(/competitor\?\.verification \|\| ['"]estimated['"]/);
  });

  it("shows the buyer the date behind the badge", () => {
    expect(CARD_SRC).toContain("lastVerified");
  });

  it("downgrades a badge without dropping the competitor from the comparison", () => {
    const stale = calculateAllComparisons(10, SELECTION, basis(), undefined, new Date("2030-01-01"));
    expect(stale.map((c) => c.competitor.id).sort()).toEqual(
      calculateAllComparisons(10, SELECTION, basis(), undefined, AS_OF)
        .map((c) => c.competitor.id)
        .sort(),
    );
    expect(stale.every((c) => c.competitor.effectiveVerification !== "verified")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PROVENANCE — the rule the five defects all broke
// ═══════════════════════════════════════════════════════════════════════════

describe("every figure on the card carries a basis", () => {
  it.each(PRICED_IDS)("%s sources each of its lines", (id) => {
    const cost = COMPETITOR_PRICING[id].calculate(12, SELECTION, {
      monthlyRevenuePerLocation: 80000,
    });
    expect(cost.lines.length).toBeGreaterThan(0);
    for (const line of cost.lines) {
      expect(line.source, `${id} line "${line.label}" has no stated basis`).toBeTruthy();
      expect(line.source.length).toBeGreaterThan(20);
      expect(["verified", "estimated", "unverified"]).toContain(line.verification);
    }
  });

  it("only lets a line claim 'verified' when the vendor publishes a page", () => {
    for (const id of PRICED_IDS) {
      const entry = COMPETITOR_PRICING[id];
      const cost = entry.calculate(1, SELECTION, { monthlyRevenuePerLocation: 80000 });
      if (!cost.lines.some((l) => l.verification === "verified")) continue;
      expect(entry.sourceUrl, `${id} has a verified line but no source URL`).toBeTruthy();
      expect(entry.lastVerified, `${id} has a verified line but no check date`).toBeTruthy();
    }
  });

  it("models no price for a vendor that publishes none", () => {
    const nory = COMPETITOR_PRICING.nory.calculate(10, SELECTION);
    expect(nory.firstYear).toBeNull();
    expect(nory.lines).toHaveLength(0);
    // The old file kept an unsourced $800-$1,200/location band in shipped code.
    expect(JSON.stringify(COMPETITOR_PRICING.nory.pricing)).not.toMatch(/800|1200/);
    expect(calculateAllComparisons(10, SELECTION, basis(), undefined, AS_OF).map((c) => c.competitor.id))
      .not.toContain("nory");
  });

  it("scores coverage against the domains the buyer's package actually grants", () => {
    // A Core Foundation buyer is granted four domains, not eleven. Telling them
    // a vendor misses eight they were never sold is as wrong as missing none.
    const foundation = [CORE_PACKAGE_SELECTION_ID, ...PACKAGE_DOMAIN_GRANTS.core_foundation];
    const [c] = calculateAllComparisons(5, foundation, basis(), undefined, AS_OF);
    expect(c.coverage.selectedDomains).toBe(PACKAGE_DOMAIN_GRANTS.core_foundation.length);
    expect(c.coverage.covered.length + c.coverage.missing.length).toBe(c.coverage.selectedDomains);
    expect(CARD_SRC).toContain("PACKAGE_DOMAIN_GRANTS");
  });

  it("documents a source and a check date for every priced competitor", () => {
    for (const id of Object.keys(COMPETITOR_ASSUMPTIONS) as Array<
      keyof typeof COMPETITOR_ASSUMPTIONS
    >) {
      expect(COMPETITOR_ASSUMPTIONS[id].source).toBeTruthy();
      expect(COMPETITOR_ASSUMPTIONS[id].lastVerified).toBeTruthy();
    }
    // And the panel shows all of them — it used to stop after four.
    expect(CARD_SRC).not.toMatch(/COMPETITOR_ASSUMPTIONS\)\.slice/);
  });
});
