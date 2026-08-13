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

import { COMPETITOR_PRICING, unpricedCompetitors } from "../src/data/competitorPricing";

const CONTEXT = { monthlyRevenuePerLocation: 100_000 };
const lines = (id: string, n = 10) =>
  COMPETITOR_PRICING[id].calculate(n, ["labor", "inventory", "revenue"], CONTEXT);

describe("the workforce rivals are present", () => {
  it.each(["homebase", "deputy", "wheniwork"])("%s is in the catalogue", (id) => {
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
    for (const id of ["deputy", "wheniwork"]) {
      expect(lines(id, 20).ongoing).toBeGreaterThan(lines(id, 10).ongoing);
      expect(lines(id, 10).lines[0].source, `${id} hides its per-user basis`).toMatch(
        /per user/i,
      );
    }
  });

  it("declares the headcount assumption rather than burying it", () => {
    // An unstated headcount is how a per-user competitor gets mispriced.
    for (const id of ["deputy", "wheniwork"]) {
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
  const NEW = ["homebase", "deputy", "wheniwork", "foodics", "apicbase"];

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

  it("includes the UK hospitality workforce rivals", () => {
    expect(ids).toContain("fourth");
    expect(ids).toContain("s4labour");
  });

  it("files Nostradamus under the Benelux, not the UK", () => {
    // nostradamus.co.uk is a parked domain listed for sale; the live product is
    // Dutch (Breda) — "Personeelsplanning, urenregistratie en meer".
    const n = listed.find((v) => v.id === "nostradamus");
    expect(n, "Nostradamus is missing").toBeTruthy();
    expect(n!.category).toMatch(/benelux/i);
    expect(n!.note).toMatch(/NETHERLANDS|Netherlands/);
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
