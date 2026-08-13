/**
 * The exported quote is the artefact that travels. It must not say things the
 * screen does not.
 *
 * A real export (Core Margin, 8 locations) was generated and read back. It had
 * three defects, each verified in the rendered PDF rather than inferred:
 *
 *   1. EVERY competitor line printed "Verified". `pdfGenerator` rendered a
 *      constant `copy.verifiedLabel` and referenced no per-vendor badge at all —
 *      zero mentions of `effectiveVerification`. In that export Spreadsheets,
 *      Power BI and Tenzo all read "Verified"; all three are `estimated`, and
 *      Tenzo was downgraded because its cited source is now a domain-sale page.
 *      The document that reaches people who never opened the configurator was
 *      making a false provenance claim on every line.
 *   2. It printed "Best Savings: $-980/year vs Spreadsheets" — a NEGATIVE under
 *      a heading asserting the opposite, in a green banner.
 *   3. The funding case was absent entirely. The buyer read "$19,740/mo funding
 *      case, +$16,375 net" on screen, downloaded the quote, and forwarded a
 *      document that made no value argument at all.
 *
 * These tests pin the source, because rendering a PDF in unit tests would test
 * jsPDF rather than us. The rendered output was checked by hand.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { getPricingPdfCopy } from "../src/lib/pricingI18n";

const SRC = readFileSync("src/lib/pdfGenerator.ts", "utf8");
const RENDERED = SRC.split("\n").filter((l) => {
  const t = l.trim();
  return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
});

describe("competitor provenance survives the export", () => {
  it("resolves a per-vendor badge instead of a constant", () => {
    expect(SRC).toMatch(/effectiveVerification\(/);
    expect(SRC).toMatch(/badgeLevel/);
  });

  it("no longer stamps the verified label unconditionally", () => {
    // The defect in one line: a template literal ending in copy.verifiedLabel.
    const offending = RENDERED.filter((l) =>
      /\$\{copy\.verifiedLabel\}`/.test(l),
    );
    expect(offending, `still hardcoded: ${offending[0]?.trim()}`).toEqual([]);
  });

  it("can express all three provenance levels", () => {
    expect(SRC).toMatch(/copy\.unverifiedLabel/);
    expect(SRC).toMatch(/copy\.estimatedLabel/);
    expect(SRC).toMatch(/copy\.verifiedLabel/);
  });

  it("has those labels in the PDF copy packs", () => {
    for (const locale of ["en", "ar", "fr", "es"] as const) {
      const copy = getPricingPdfCopy(locale) as unknown as Record<string, string>;
      for (const key of ["verifiedLabel", "estimatedLabel", "unverifiedLabel"]) {
        expect(typeof copy[key], `${locale}.${key}`).toBe("string");
        expect(copy[key]).toBeTruthy();
      }
    }
  });
});

describe("a loss is not printed as a saving", () => {
  it("gates the best-savings banner on a positive figure", () => {
    expect(SRC).toMatch(/savingsComparisons\[0\] && comparisonAmount\(savingsComparisons\[0\]\) > 0/);
  });

  it("renders the per-row figure on the same basis the card uses", () => {
    expect(SRC).toMatch(/const delta = comparisonAmount\(comp\)/);
    // And no longer reaches past it to the raw field.
    const offending = RENDERED.filter((l) =>
      /formatCurrencyAmount\(comp\.savings\.firstYear/.test(l),
    );
    expect(offending).toEqual([]);
  });

  it("says 'costs more' rather than printing a negative", () => {
    expect(SRC).toMatch(/copy\.costsMoreLabel/);
    expect(SRC).toMatch(/Math\.abs\(delta\)/);
  });

  it("does not colour a loss green", () => {
    expect(SRC).toMatch(/if \(delta > 0\) doc\.setTextColor\(22, 163, 74\)/);
  });
});

describe("the value case travels with the quote", () => {
  it("accepts the funding case rather than recomputing it", () => {
    // Recomputing would let the document and the screen disagree.
    expect(SRC).toMatch(/funding\?: \{/);
    expect(SRC).toMatch(/monthlyFunding: number/);
    expect(SRC).toMatch(/capacityFte: number/);
  });

  it("renders it only when there is one", () => {
    expect(SRC).toMatch(/if \(funding && funding\.monthlyFunding > 0\)/);
  });

  it("keeps capacity out of the cash total, as the screen does", () => {
    // The rows carry an isCash flag and capacity is the one marked false.
    expect(SRC).toMatch(/copy\.capacityLabel, funding\.capacityValue, false/);
    expect(SRC).toMatch(/copy\.cashAvoidanceLabel, funding\.cashAvoidance, true/);
  });

  it("shows the net against the Core rail only", () => {
    expect(SRC).toMatch(/funding\.monthlyFunding - funding\.coreMonthly/);
  });

  it("is wired from both export paths", () => {
    for (const file of [
      "src/components/Summary/PDFExport.tsx",
      "src/components/Summary/EmailQuoteButton.tsx",
    ]) {
      const caller = readFileSync(file, "utf8");
      expect(caller, `${file} does not accept a funding case`).toMatch(/funding\?: \{/);
      expect(caller, `${file} does not forward it`).toMatch(/\n\s*funding,/);
    }
    const summary = readFileSync("src/components/Summary/ConfigSummary.tsx", "utf8");
    expect(summary).toMatch(/monthlyFunding: summaryRoi\.monthlyFunding/);
    expect(summary).toMatch(/coreMonthly: coreOnlyPricing\.total/);
  });
});
