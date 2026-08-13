/**
 * The competitor set covers the rivals a buyer actually shortlists.
 *
 * Three gaps closed here, all read first-party on 2026-08-11:
 *
 *   WORKFORCE. Homebase, Deputy and When I Work were absent entirely, which is
 *   why a Crew-only buyer could not be shown a comparison at all — the only
 *   Crew rival in the catalogue was 7shifts, and shipping a comparison that
 *   omitted the cheapest rivals would have rebuilt the "only show what we win"
 *   defect. Homebase's free Basic tier is the price Crew cannot beat.
 *
 *   GULF. Foodics is the dominant Saudi-headquartered POS/RMS platform across
 *   the GCC and was missing from a product sold into that market.
 *
 *   EUROPE. Apicbase is the closest European comparator to Core Margin's cost
 *   side, and publishes no price at all.
 *
 * Two of them price on a basis the simulator does not collect, and that is the
 * thing these tests guard. Deputy and When I Work bill PER USER, so an estate
 * cost needs a headcount; Foodics publishes a number with NO currency anywhere
 * in its markup. Both assumptions are declared on the line the buyer reads
 * rather than buried, and both entries are badged down accordingly.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import {
  calculateAllComparisons,
  COMPETITOR_PRICING,
  unpricedCompetitors,
} from "../src/data/competitorPricing";

const CONTEXT = { monthlyRevenuePerLocation: 100_000 };
const lines = (id: string, n = 10) =>
  COMPETITOR_PRICING[id].calculate(n, ["labor", "inventory", "revenue"], CONTEXT);

describe("the workforce rivals are present", () => {
  it.each(["homebase", "deputy"])("%s is in the catalogue", (id) => {
    expect(COMPETITOR_PRICING[id], `${id} missing`).toBeTruthy();
    expect(COMPETITOR_PRICING[id].coversDomains).toContain("labor");
  });

  it("prices Homebase per location, as published", () => {
    // $96/location/month on annual billing.
    expect(lines("homebase", 10).ongoing).toBe(96 * 10 * 12);
  });

  it("does not price an estate at Homebase's free tier", () => {
    // Basic is genuinely $0 but caps at ONE location and ten employees.
    expect(lines("homebase", 10).ongoing).toBeGreaterThan(0);
    expect(lines("homebase", 10).lines[0].source).toMatch(/annual billing/i);
  });

  it("scales the per-user vendors with headcount, not sites alone", () => {
    // Doubling locations doubles users under a fixed per-location headcount,
    // but the BASIS must be visible as per-user.
    for (const id of ["deputy"]) {
      expect(lines(id, 20).ongoing).toBeGreaterThan(lines(id, 10).ongoing);
      expect(lines(id, 10).lines[0].source, `${id} hides its per-user basis`).toMatch(
        /per user/i,
      );
    }
  });

  it("declares the headcount assumption rather than burying it", () => {
    // An unstated headcount is how a per-user competitor gets mispriced.
    for (const id of ["deputy"]) {
      const source = lines(id).lines[0].source ?? "";
      expect(source, `${id} does not state its headcount`).toMatch(/employees per location/i);
      expect(source, `${id} does not flag it as an assumption`).toMatch(/assumption/i);
      expect(lines(id).lines[0].verification).toBe("estimated");
    }
  });

  it("honours Deputy's published minimum spend", () => {
    expect(lines("deputy", 1).ongoing).toBeGreaterThanOrEqual(30 * 12);
  });
});

describe("the Gulf rival is present and its currency risk is stated", () => {
  it("includes Foodics", () => {
    expect(COMPETITOR_PRICING.foodics).toBeTruthy();
    expect(COMPETITOR_PRICING.foodics.coversDomains.length).toBeGreaterThan(1);
  });

  it("never claims the price is verified, because the currency is not published", () => {
    expect(COMPETITOR_PRICING.foodics.verification).not.toBe("verified");
    expect(lines("foodics").lines[0].verification).toBe("estimated");
  });

  it("states the currency assumption on the line the buyer reads", () => {
    const source = lines("foodics").lines[0].source ?? "";
    expect(source).toMatch(/no currency|NO currency/i);
    expect(source, "the SAR conversion is not declared").toMatch(/SAR/);
    expect(source, "the peg is not declared").toMatch(/3\.75/);
  });

  it("marks its confidence as low", () => {
    expect(lines("foodics").confidence).toBe("low");
  });
});

describe("the European rival is present without an invented price", () => {
  it("includes Apicbase", () => {
    expect(COMPETITOR_PRICING.apicbase).toBeTruthy();
    expect(COMPETITOR_PRICING.apicbase.coversDomains).toContain("inventory");
  });

  it("publishes no price and therefore quotes none", () => {
    // Their page lists three tiers with no figures and a "Talk to our team"
    // call to action. Inventing one is how a comparison collapses.
    expect(COMPETITOR_PRICING.apicbase.showPricing).toBe(false);
    expect(COMPETITOR_PRICING.apicbase.verification).toBe("unverified");
    expect(lines("apicbase").lines).toEqual([]);
    expect(lines("apicbase").ongoing).toBe(0);
  });

  it("is withheld from the rendered comparison rather than shown at zero", () => {
    // A competitor priced at $0 would read as free.
    expect(COMPETITOR_PRICING.apicbase.showPricing).toBe(false);
  });
});

describe("every new entry keeps the catalogue's invariants", () => {
  const NEW = ["homebase", "deputy", "foodics", "apicbase"];

  it.each(NEW)("%s key matches its id", (id) => {
    expect(COMPETITOR_PRICING[id].id).toBe(id);
  });

  it.each(NEW)("%s carries a first-party source and a check date", (id) => {
    expect(COMPETITOR_PRICING[id].sourceUrl).toBeTruthy();
    expect(COMPETITOR_PRICING[id].lastVerified).toBeTruthy();
  });

  it.each(NEW.filter((id) => id !== "apicbase"))("%s sources every cost line", (id) => {
    for (const line of lines(id).lines) {
      expect(line.source, `${id}: "${line.label}" has no source`).toBeTruthy();
      expect((line.source ?? "").length).toBeGreaterThan(40);
    }
  });

  it("claims no capability gap it has not evidenced", () => {
    for (const id of NEW) {
      expect(COMPETITOR_PRICING[id].cannotDoAtAnyPrice ?? []).toEqual([]);
    }
  });
});

describe("the vendors who publish no price are still shown", () => {
  const listed = unpricedCompetitors();
  const ids = listed.map((v) => v.id);

  it("includes the Gulf HR platforms", () => {
    // Foodics is a POS, not an HR provider — these are the Gulf workforce
    // rivals a buyer actually shortlists.
    expect(ids).toContain("bayzat");
    expect(ids).toContain("gulfhr");
  });

  it("includes the UK hospitality rival", () => {
    expect(ids).toContain("fourth");
  });

  it("includes the Dutch rival, because we prospect there", () => {
    // Kept for pipeline relevance, not global name recognition. An earlier cut
    // dropped it on a recognition argument, which is the wrong test for a
    // market Sundae is actively selling into.
    const n = listed.find((v) => v.id === "nostradamus");
    expect(n, "Nostradamus is missing").toBeTruthy();
    expect(n!.category).toMatch(/netherlands/i);
    expect(n!.note).toMatch(/Breda|Netherlands/);
  });

  it("does not cite the parked UK domain as Nostradamus's source", () => {
    // nostradamus.co.uk is an unrelated domain listed for sale.
    expect(COMPETITOR_PRICING.nostradamus.sourceUrl).not.toMatch(/nostradamus\.co\.uk/);
  });

  it("credits Fourth with both sides, because it has both", () => {
    // Understating a rival's coverage flatters us just as surely as
    // overstating our own.
    const f = COMPETITOR_PRICING.fourth.coversDomains;
    expect(f).toContain("labor");
    expect(f).toContain("inventory");
    expect(f).toContain("purchasing");
  });

  it("quotes no price for any of them", () => {
    for (const v of listed) {
      const cost = COMPETITOR_PRICING[v.id].calculate(10, ["labor"], undefined);
      // Nory's calculator returns nulls where the others return zero; either
      // way the contract is the same — no figure reaches the buyer.
      expect(cost.ongoing ?? 0, `${v.id} quotes a price it does not publish`).toBe(0);
      expect(cost.lines ?? []).toEqual([]);
    }
  });

  it("says on each one why there is no price", () => {
    for (const v of listed) {
      expect(v.note.length, `${v.id} has no explanation`).toBeGreaterThan(40);
      expect(v.note).toMatch(/publish|no price|demo|quote/i);
    }
  });

  it("keeps them out of the priced comparison", () => {
    for (const v of listed) {
      expect(COMPETITOR_PRICING[v.id].showPricing).toBe(false);
    }
  });
});

describe("Foodics is a POS, not an HR provider", () => {
  it("no longer claims the labour domain", () => {
    expect(COMPETITOR_PRICING.foodics.coversDomains).not.toContain("labor");
  });

  it("still covers the till and stock side", () => {
    expect(COMPETITOR_PRICING.foodics.coversDomains).toContain("revenue");
    expect(COMPETITOR_PRICING.foodics.coversDomains).toContain("inventory");
  });
});


describe("the set stays small and recognisable", () => {
  /**
   * A comparison is a shortlist, not a directory. The unpriced list reached
   * fourteen and had to be cut: four near-identical US payroll bureaus (Gusto,
   * ADP, Paychex, Rippling) that a restaurant operator is not choosing between
   * Sundae and, two UK scheduling tools narrower than Fourth in the same
   * market, and a Benelux vendor with no recognition outside it.
   *
   * What survives is restaurant- or hospitality-specific, or names the founder
   * identified as the ones that actually come up in their market.
   */
  it("keeps the unpriced list short enough to read", () => {
    expect(unpricedCompetitors().length).toBeLessThanOrEqual(8);
  });

  it("keeps the priced list short enough to read", () => {
    const priced = Object.values(COMPETITOR_PRICING).filter((c) => c.showPricing !== false);
    expect(priced.length).toBeLessThanOrEqual(10);
  });

  it("carries no more than three workforce vendors on the priced side", () => {
    // Homebase, Deputy and 7shifts cover per-location, per-user and
    // restaurant-native. A fourth was redundant.
    const priced = Object.values(COMPETITOR_PRICING).filter((c) => c.showPricing !== false);
    const workforceOnly = priced.filter(
      (c) => c.coversDomains.length === 1 && c.coversDomains[0] === "labor",
    );
    expect(workforceOnly.length).toBeLessThanOrEqual(3);
  });

  it("still spans every category a buyer arrives from", () => {
    const priced = Object.values(COMPETITOR_PRICING).filter((c) => c.showPricing !== false);
    const ids = priced.map((c) => c.id);
    // Status quo, build-your-own, restaurant analytics, ERP, inventory,
    // regional POS and workforce all remain represented.
    for (const id of ["spreadsheets", "powerbi", "tenzo", "restaurant365", "marketman", "foodics", "7shifts"]) {
      expect(ids, `${id} was cut but has no replacement in its category`).toContain(id);
    }
  });

  it("still spans every region on the unpriced side", () => {
    const cats = unpricedCompetitors().map((v) => v.category).join(" | ");
    expect(cats, "no Gulf vendor").toMatch(/Gulf/i);
    expect(cats, "no UK vendor").toMatch(/UK/i);
    expect(cats, "no European vendor").toMatch(/Europe/i);
    expect(cats, "no US vendor").toMatch(/US/i);
  });
});

describe("a Crew-only buyer gets a comparison", () => {
  /**
   * They used to get a price and nothing else. The reason was real — the
   * workforce rivals were missing, and a comparison containing only 7shifts
   * would have omitted the cheapest options and rebuilt the "only show what we
   * win" defect. Homebase, Deputy and 7shifts now carry published prices, so
   * the comparison is possible and, at ten locations, unflattering: Crew loses
   * to both Homebase and 7shifts there, which is the honest picture below the
   * crossover.
   */
  const SRC = readFileSync("src/components/Summary/CompactCompetitorCompare.tsx", "utf8");

  it("builds a Crew rail on the crew-only path, not just on 'both'", () => {
    expect(SRC).toMatch(/layer === 'both' \|\| layer === 'crew'/);
    expect(SRC).toMatch(/isCrewOnly/);
  });

  it("charges no Core cost to a buyer who bought no Core", () => {
    // `usePriceCalculation` prices a package regardless of what was chosen, so
    // reading it here would invoice them for something they never selected.
    expect(SRC).toMatch(/coreMonthly: isCrewOnly \? 0 : pricing\.total/);
  });

  it("withholds the Core-package marker from competitor calculators", () => {
    // Passing it would tell every calculator the buyer holds a Core package.
    expect(SRC).toMatch(/isCrewOnly\s*\n?\s*\?\s*\[\.\.\.grantedDomains\]/);
  });

  it("scores the comparison on labour, which is what Crew delivers", () => {
    // Asserts the INTENT — crew-only selects the labour domain — not the exact
    // expression. The first version of this pinned a cast that was later
    // wrapped in a useMemo, and failed on a refactor that changed nothing about
    // the behaviour. A test that breaks when the spelling changes is a tax, not
    // a guard.
    expect(SRC).toMatch(/isCrewOnly[\s\S]{0,40}\?[\s\S]{0,20}\['labor'\]/);
  });

  it("is mounted on the Crew summary", () => {
    const summary = readFileSync("src/components/Summary/ConfigSummary.tsx", "utf8");
    const crewBody = summary.slice(summary.indexOf("function CrewSummaryBody"));
    expect(crewBody, "the Crew summary renders no comparison").toMatch(
      /<CompactCompetitorCompare \/>/,
    );
  });

  it("has priced workforce rivals for it to compare against", () => {
    // If these ever lose their prices the comparison becomes one-sided again.
    for (const id of ["homebase", "deputy", "7shifts"]) {
      const c = COMPETITOR_PRICING[id];
      expect(c.showPricing, `${id} is no longer priced`).not.toBe(false);
      expect(c.coversDomains).toContain("labor");
    }
  });

  it("shows only plausible workforce alternatives on the priced Crew path", () => {
    const comparisons = calculateAllComparisons(
      8,
      ["labor"],
      {
        coreMonthly: 0,
        crewMonthly: 1192,
        implementationFee: 0,
        implementationScoped: true,
        implementationIsFloor: false,
      },
      { ...CONTEXT, comparisonPath: "crew" },
    );
    const ids = comparisons.map((comparison) => comparison.competitor.id).sort();
    expect(ids).toEqual(["7shifts", "deputy", "homebase"]);
    expect(ids).not.toContain("powerbi");
    expect(ids).not.toContain("restaurant365");
    expect(ids).not.toContain("foodics");
  });

  it("limits the unpriced Crew shortlist to workforce-relevant regional rivals", () => {
    const ids = unpricedCompetitors("crew").map((vendor) => vendor.id).sort();
    expect(ids).toEqual(["bayzat", "fourth", "gulfhr", "nostradamus"]);
    expect(ids).not.toContain("apicbase");
    expect(ids).not.toContain("nory");
    expect(ids).not.toContain("crunchtime");
  });

  it("states the missing paid scope before presenting a cheaper workforce price", () => {
    for (const id of ["homebase", "deputy", "7shifts"]) {
      expect(COMPETITOR_PRICING[id].crewScopeSummary, `${id} hides its priced scope`).toMatch(
        /excludes/i,
      );
    }
  });
});
