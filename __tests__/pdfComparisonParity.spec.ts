/**
 * The document a buyer forwards must answer the same question as the screen.
 *
 * Three defects lived in three consecutive lines of `pdfGenerator.ts`:
 *
 *   1. `allModules = [...addOns, `${layer}-${corePackage}`]` produced
 *      "core-core_performance", which is neither `CORE_PACKAGE_SELECTION_ID`
 *      nor any domain id. Tenzo's calculator found no Core package and no
 *      domains, priced ZERO modules, and **every PDF ever generated quoted
 *      Tenzo at $0** — a named competitor shown as free in the artefact most
 *      likely to be forwarded to someone who never saw the configurator.
 *   2. No `CompetitorCalcContext` was passed, so the status quo lost its
 *      error/rework line and the document diverged from the screen it was
 *      exported from. Same quote, two numbers.
 *   3. The list was filtered to `savings.firstYear > 0` — only competitors
 *      Sundae beats. The buyer's real alternative was dropped from 407 of 996
 *      configurations, and 279 got no comparison section at all.
 *
 * These tests pin the inputs rather than render a PDF: the defects were all in
 * what was passed to the comparison engine, not in the drawing.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import {
  CORE_PACKAGE_SELECTION_ID,
  calculateAllComparisons,
  comparisonAmount,
} from "../src/data/competitorPricing";
import { PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";

const SRC = readFileSync("src/lib/pdfGenerator.ts", "utf8");

describe("the PDF identifies the Core package the way the engine expects", () => {
  it("no longer builds a hyphenated id that matches nothing", () => {
    const offending = SRC.split("\n").filter(
      (l) => l.includes("`${layer}-${corePackage}`") && !l.trim().startsWith("//"),
    );
    expect(offending, "the PDF still passes a synthetic module id").toEqual([]);
  });

  it("passes the canonical selection marker and the granted domains", () => {
    expect(SRC).toMatch(/CORE_PACKAGE_SELECTION_ID/);
    expect(SRC).toMatch(/PACKAGE_DOMAIN_GRANTS/);
  });

  it("prices Tenzo above zero once the marker is right", () => {
    // The defect in one assertion: with the synthetic id Tenzo billed 0 modules.
    const modules = [
      CORE_PACKAGE_SELECTION_ID,
      ...(PACKAGE_DOMAIN_GRANTS.core_performance as readonly string[]),
    ];
    const [tenzo] = calculateAllComparisons(10, modules, 6_661).filter(
      (c) => c.competitor.id === "tenzo",
    );
    expect(tenzo, "Tenzo is missing from the comparison entirely").toBeTruthy();
    expect(tenzo.competitorCost.monthly, "Tenzo is still priced at $0").toBeGreaterThan(0);
  });

  it("prices Tenzo at zero with the OLD synthetic id, proving the cause", () => {
    const [tenzo] = calculateAllComparisons(10, ["core-core_performance"], 6_661).filter(
      (c) => c.competitor.id === "tenzo",
    );
    expect(tenzo.competitorCost.monthly).toBe(0);
  });
});

describe("the PDF receives the same context as the screen", () => {
  it("accepts a comparison basis and a calculation context", () => {
    expect(SRC).toMatch(/basis\?: SundaeQuoteBasis/);
    expect(SRC).toMatch(/context\?: CompetitorCalcContext/);
  });

  it("forwards them to the engine rather than dropping them", () => {
    expect(SRC).toMatch(/comparison\?\.basis \?\? pricing\.total/);
    expect(SRC).toMatch(/comparison\?\.context/);
  });

  it("is wired from both export paths", () => {
    for (const file of [
      "src/components/Summary/PDFExport.tsx",
      "src/components/Summary/EmailQuoteButton.tsx",
    ]) {
      const caller = readFileSync(file, "utf8");
      expect(caller, `${file} does not pass revenue context`).toMatch(
        /monthlyRevenuePerLocation: roiInputs\.monthlyRevenue/,
      );
      expect(caller, `${file} does not pass an implementation basis`).toMatch(
        /implementationFee: stackEstimate/,
      );
    }
  });
});

describe("the PDF may not print only the comparisons we win", () => {
  it("no longer filters to positive savings", () => {
    const offending = SRC.split("\n").filter(
      (l) => /\.filter\(\(?c\)? => c\.savings\.firstYear > 0\)/.test(l) && !l.trim().startsWith("//"),
    );
    expect(offending, "the PDF still hides competitors that beat us").toEqual([]);
  });

  it("ranks on the same basis the card displays", () => {
    expect(SRC).toMatch(/comparisonAmount\(b\) - comparisonAmount\(a\)/);
  });

  it("would carry a losing comparison rather than an empty section", () => {
    // Core Performance at one location loses to several rivals. A document
    // built from this set must still have rows to print.
    const modules = [
      CORE_PACKAGE_SELECTION_ID,
      ...(PACKAGE_DOMAIN_GRANTS.core_performance as readonly string[]),
    ];
    const all = calculateAllComparisons(1, modules, 2_980);
    const ranked = [...all].sort((a, b) => comparisonAmount(b) - comparisonAmount(a)).slice(0, 3);
    expect(ranked.length, "no comparison rows at all").toBeGreaterThan(0);
    expect(
      ranked.some((c) => comparisonAmount(c) <= 0),
      "this configuration should include a comparison Sundae loses",
    ).toBe(true);
  });
});
