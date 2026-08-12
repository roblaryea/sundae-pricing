/**
 * An imputed cost may not be presented as an invoice.
 *
 * The status quo is the only competitor Sundae consistently beats — it took the
 * "Best Savings Opportunity" badge in 316 of 316 sampled configurations — and
 * the largest line in it is analyst/manager time nobody writes a cheque for.
 * Labelled simply "Labor" beside two cash costs it read as a bill. A CFO who
 * strikes it flips roughly 3,400 of 8,700 "Sundae is cheaper" cells the other
 * way: the honest scoreboard is status-quo-wins ~41%, not the 2.8% the card
 * admitted.
 *
 * The line is NOT deleted. The time is genuinely spent, and every credible TCO
 * comparison counts staff time. What was wrong was presenting it as cash
 * without saying so — the one thing that does not survive the question "do we
 * actually pay that?" being asked out loud in a sales call.
 *
 * These tests pin the disclosure, and pin that no cost line in the whole
 * catalogue claims a verification it does not have.
 */
import { describe, expect, it } from "vitest";

import { COMPETITOR_PRICING } from "../src/data/competitorPricing";

const CONTEXT = { monthlyRevenuePerLocation: 100_000 };

function spreadsheetLines(locations = 10) {
  return COMPETITOR_PRICING.spreadsheets.calculate(locations, [], CONTEXT).lines;
}

describe("the status quo's imputed time is labelled as time", () => {
  it("no longer calls it plain 'Labor'", () => {
    const labels = spreadsheetLines().map((l) => l.label);
    expect(
      labels.some((l) => /^Labor \(/.test(l)),
      "the imputed line still reads as an invoice",
    ).toBe(false);
  });

  it("names it as time on its face", () => {
    const labels = spreadsheetLines().map((l) => l.label);
    expect(labels.some((l) => /time/i.test(l))).toBe(true);
  });

  it("says plainly that it is not an invoice", () => {
    const line = spreadsheetLines().find((l) => /time/i.test(l.label));
    expect(line, "the manager-time line is missing entirely").toBeTruthy();
    expect(line!.source).toMatch(/not an invoice/i);
  });

  it("tells the buyer what the cash saving really is", () => {
    // The honest follow-through: if the hours are not redeployed, the only cash
    // the operator stops spending is the software line.
    const line = spreadsheetLines().find((l) => /time/i.test(l.label));
    expect(line!.source).toMatch(/cash saving/i);
  });

  it("still charges the time, rather than quietly dropping it", () => {
    const line = spreadsheetLines().find((l) => /time/i.test(l.label));
    expect(line!.amount).toBeGreaterThan(0);
  });

  it("keeps it the largest line, because it is", () => {
    const lines = spreadsheetLines();
    const time = lines.find((l) => /time/i.test(l.label))!;
    for (const other of lines) {
      if (other === time) continue;
      expect(time.amount).toBeGreaterThanOrEqual(other.amount);
    }
  });
});

describe("no cost line overstates its own provenance", () => {
  const ALL = Object.entries(COMPETITOR_PRICING) as Array<[string, { calculate?: unknown }]>;

  it.each(ALL.filter(([, v]) => typeof v.calculate === "function").map(([k]) => k))(
    "%s marks every line with a verification level",
    (id) => {
      const entry = COMPETITOR_PRICING[id] as {
        calculate: (n: number, m: string[], c?: unknown) => { lines: Array<{ verification?: string; source?: string }> };
      };
      const { lines } = entry.calculate(10, [], CONTEXT);
      for (const line of lines) {
        expect(line.verification, `${id}: a line has no verification level`).toBeTruthy();
        expect(line.source, `${id}: a line has no stated source`).toBeTruthy();
      }
    },
  );

  it("only calls a line verified when it comes from a published price", () => {
    for (const [id, entry] of ALL) {
      const e = entry as {
        calculate?: (n: number, m: string[], c?: unknown) => { lines: Array<{ verification?: string; source?: string }> };
      };
      if (typeof e.calculate !== "function") continue;
      for (const line of e.calculate(10, [], CONTEXT).lines) {
        if (line.verification !== "verified") continue;
        expect(
          /\.com|\.io|\.net|pricing|microsoft/i.test(line.source ?? ""),
          `${id}: a line claims "verified" without citing a published price — "${line.source}"`,
        ).toBe(true);
      }
    }
  });
});
