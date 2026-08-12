/**
 * A source URL has to point at a page that still sells the product.
 *
 * Tenzo carried `sourceUrl: 'https://tenzo.io/pricing'` with
 * `verification: 'verified'` and a $75/module/location figure. Checked by hand
 * on 2026-08-11, that URL serves a 114-byte HTML stub whose only content is a
 * JavaScript redirect to `/lander`, which resolves to
 * `forsale.godaddy.com/forsale/tenzo.io`. The domain is for sale. Tenzo's live
 * site is gotenzo.com, and `gotenzo.com/pricing` returns 404 — they publish no
 * pricing page at all.
 *
 * The failure mode is the interesting part, and it is why this test exists in
 * this shape. `curl -o /dev/null -w '%{http_code}'` returns **200** for that
 * URL, because the parking stub is served successfully. Any liveness check
 * built on status codes would have renewed the badge indefinitely while the
 * card linked buyers to a domain-sale page.
 *
 * These tests cannot fetch the network, so they pin the invariant instead: a
 * `verified` badge requires a source URL, and every cost line's verification
 * must be consistent with its vendor's. The freshness decay in
 * `effectiveVerification` handles age; this handles provenance.
 */
import { describe, expect, it } from "vitest";

import { COMPETITOR_PRICING } from "../src/data/competitorPricing";

const CONTEXT = { monthlyRevenuePerLocation: 100_000 };

const ENTRIES = Object.entries(COMPETITOR_PRICING) as Array<
  [
    string,
    {
      verification: string;
      sourceUrl?: string | null;
      lastVerified?: string | null;
      calculate?: (n: number, m: string[], c?: unknown) => {
        lines: Array<{ verification?: string; source?: string; label: string }>;
      };
    },
  ]
>;

describe("a verified badge requires something to verify against", () => {
  it.each(ENTRIES.map(([id]) => id))("%s", (id) => {
    const entry = COMPETITOR_PRICING[id] as {
      verification: string;
      sourceUrl?: string | null;
      lastVerified?: string | null;
    };
    if (entry.verification !== "verified") return;
    expect(entry.sourceUrl, `${id} claims verified with no source URL`).toBeTruthy();
    expect(entry.lastVerified, `${id} claims verified with no check date`).toBeTruthy();
  });

  it("never points a buyer at a dead or parked source", () => {
    // tenzo.io was the live instance of this. Nothing in the catalogue may
    // cite it again without a first-party page behind it.
    for (const [id, entry] of ENTRIES) {
      if (!entry.sourceUrl) continue;
      expect(
        /tenzo\.io/.test(entry.sourceUrl),
        `${id} cites tenzo.io, which now resolves to a domain-sale page`,
      ).toBe(false);
    }
  });

  it("keeps Tenzo priced but no longer claims the price is verified", () => {
    const tenzo = COMPETITOR_PRICING.tenzo as {
      verification: string;
      sourceUrl?: string | null;
    };
    expect(tenzo.verification).not.toBe("verified");
    expect(tenzo.sourceUrl ?? null).toBeNull();
    // Deleting the vendor would hide the competitor we lose to most often, so
    // the figure stays with an honest badge rather than disappearing.
    const cost = COMPETITOR_PRICING.tenzo.calculate(10, ["labor"], CONTEXT);
    expect(cost.monthly).toBeGreaterThan(0);
  });
});

describe("line-level provenance agrees with the vendor's", () => {
  it("lets a line be better sourced than its vendor, but never worse-sourced than it claims", () => {
    // A line may legitimately outrank the vendor aggregate: Power BI's licence
    // prices are published by Microsoft while its implementation and
    // maintenance figures are our estimates, so the entry is 'estimated' and
    // that one line is 'verified'. The aggregate takes the WEAKEST line.
    //
    // What must never happen is a verified line whose source is not a
    // published price — that is the Tenzo failure, where the cited page had
    // become a domain-sale listing.
    for (const [id, entry] of ENTRIES) {
      if (typeof entry.calculate !== "function") continue;
      const { lines } = entry.calculate(10, ["labor", "inventory", "revenue"], CONTEXT);
      for (const line of lines) {
        if (line.verification !== "verified") continue;
        expect(
          /\.com|\.io|\.net|pricing|microsoft/i.test(line.source ?? ""),
          `${id}: "${line.label}" claims verified without citing a published price`,
        ).toBe(true);
        expect(
          /tenzo\.io/.test(line.source ?? ""),
          `${id}: "${line.label}" claims verified against a dead source`,
        ).toBe(false);
      }
    }
  });

  it("every line states where its number came from", () => {
    for (const [id, entry] of ENTRIES) {
      if (typeof entry.calculate !== "function") continue;
      const { lines } = entry.calculate(10, ["labor", "inventory", "revenue"], CONTEXT);
      for (const line of lines) {
        expect(line.source, `${id}: "${line.label}" has no source`).toBeTruthy();
        expect((line.source ?? "").length, `${id}: "${line.label}" source is a stub`).toBeGreaterThan(
          20,
        );
      }
    }
  });

  it("says so on the line when the provenance has lapsed", () => {
    // A downgraded badge is easy to miss in a list; the line the buyer reads
    // should carry the reason.
    const { lines } = COMPETITOR_PRICING.tenzo.calculate(10, ["labor"], CONTEXT);
    const licence = lines.find((l) => /module/i.test(l.source ?? ""));
    expect(licence?.source).toMatch(/no longer be verified|domain-sale|for sale/i);
  });
});
