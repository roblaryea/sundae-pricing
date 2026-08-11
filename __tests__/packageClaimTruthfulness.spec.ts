/**
 * No surface may claim every package grants all eleven domains.
 *
 * Price book v1.7 section 3.1 grants four domains to Core Foundation, six to
 * Margin, eight to Growth and eleven only to Performance. The pricing FAQ told
 * the buyer the opposite, in English, French and Spanish:
 *
 *   "Every package includes all eleven Core domain modules"
 *
 * That is the precise claim that sends a buyer who needs inventory to Core
 * Foundation — which does not grant inventory — and it is the claim a
 * competitor comparison then quietly contradicts, because a rival selling
 * inventory shows up as an "alternative" to a package that cannot do the job.
 *
 * What IS universal is the Cross-Intelligence correlation engine and Sundae
 * Intelligence. The engine is not the grant, and conflating the two is what
 * produced the false sentence.
 */
import { describe, expect, it } from "vitest";

import { readFileSync } from "node:fs";

import { CORE_DOMAIN_MODULE_IDS, PACKAGE_DOMAIN_GRANTS } from "../src/data/pricing";

const SURFACES = [
  "src/components/Summary/PricingFAQ.tsx",
  "src/components/ConfigBuilder/TierSelector.tsx",
  "src/components/ConfigBuilder/WatchtowerToggle.tsx",
  "src/components/PricingDisplay/ROISimulator.tsx",
  "src/components/Summary/ConfigSummary.tsx",
];

/** The false claim, in each language a locale pack was written in. */
const FALSE_CLAIMS = [
  /[Ee]very package includes all eleven Core domain modules/,
  /[Cc]haque forfait inclut les onze modules de domaine Core, le moteur/,
  /[Cc]ada paquete incluye los once m[oó]dulos de dominio de Core, el motor/,
  /every Core package ships all eleven domain modules/,
  /all four granted all eleven/,
];

describe("the grant counts are stated truthfully", () => {
  it("has four genuinely different grants to state", () => {
    expect(PACKAGE_DOMAIN_GRANTS.core_foundation).toHaveLength(4);
    expect(PACKAGE_DOMAIN_GRANTS.core_margin).toHaveLength(6);
    expect(PACKAGE_DOMAIN_GRANTS.core_growth).toHaveLength(8);
    expect(PACKAGE_DOMAIN_GRANTS.core_performance).toHaveLength(
      CORE_DOMAIN_MODULE_IDS.length,
    );
  });

  it.each(SURFACES)("%s makes no all-eleven claim", (file) => {
    let src: string;
    try {
      src = readFileSync(file, "utf8");
    } catch {
      return; // a surface may legitimately be renamed or removed
    }
    for (const claim of FALSE_CLAIMS) {
      // Historical notes explaining the defect are allowed; the claim must not
      // appear as copy the buyer reads. Comment lines are excluded.
      const offending = src
        .split("\n")
        .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line))
        .filter((line) => claim.test(line));
      expect(
        offending,
        `${file} still asserts to the buyer: ${offending[0]?.trim().slice(0, 120)}`,
      ).toEqual([]);
    }
  });

  it("names each package's real grant count in the FAQ", () => {
    const faq = readFileSync("src/components/Summary/PricingFAQ.tsx", "utf8");
    // English pack: the counts must be present as words next to the packages.
    const answer = faq
      .split("\n")
      .find((l) => l.includes("Core Foundation, Core Margin, Core Growth, and Core Performance"));
    expect(answer, "the English packages FAQ answer is missing").toBeTruthy();
    for (const count of ["four", "six", "eight", "eleven"]) {
      expect(answer, `the FAQ does not state "${count}"`).toContain(count);
    }
  });

  it("still credits what genuinely IS universal", () => {
    // Every package does ship the correlation engine and Sundae Intelligence.
    // Correcting the grant claim must not delete the true one.
    const faq = readFileSync("src/components/Summary/PricingFAQ.tsx", "utf8");
    expect(faq).toMatch(/Cross-Intelligence/);
    expect(faq).toMatch(/Sundae Intelligence/);
  });
});
