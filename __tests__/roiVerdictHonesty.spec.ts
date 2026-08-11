/**
 * A configuration that loses money must say so.
 *
 * `generateROIDescription` falls through to `roiDescriptions.longTerm` when the
 * ROI multiple is below 1.0 — that is, when the modelled monthly saving is
 * SMALLER than the monthly cost. In every one of the 22 locales that branch read
 * "Long-term investment in operational intelligence."
 *
 * A sweep of 103,680 UI-reachable configurations found 6,603 that never pay
 * back. The worst of them is ordinary, not exotic: a single-site independent on
 * Core Foundation with the revenue slider at its $50,000 floor sees Monthly
 * Savings $658 against $1,195 of cost — a net $537 a month out of pocket — under
 * the heading "Long-term investment in operational intelligence." The revenue
 * slider's floor is $50k/site and Foundation's break-even is $73k/site, so the
 * whole $50k-$73k band is a dead end reachable in one drag of the first control
 * on the step.
 *
 * Calling that an investment is the selling-side failure: the buyer is not told
 * they are looking at a loss, so they cannot act on it. The verdict now states
 * the outcome plainly and points at a package that might fit.
 */
import { describe, expect, it } from "vitest";

import { getRoiCopy } from "../src/lib/pricingUiCopy";

const LOCALES = [
  "en", "ar", "fr", "es", "de", "nl", "pt", "hi", "ur", "it", "pl",
  "tr", "zh-Hans", "ja", "ko", "id", "vi", "ro", "sv", "bn", "th", "ms",
] as const;

/** The euphemism, in each language it shipped in. */
const EUPHEMISMS = [
  "Long-term investment",
  "استثمار طويل الأجل",
  "Investissement de long terme",
  "Inversión a largo plazo",
  "Langfristige Investition",
  "Langdurige investering",
  "Investimento de longo prazo",
  "दीर्घकालिक निवेश",
  "طویل مدتی سرمایہ کاری",
  "Investimento a lungo termine",
  "Długoterminowa inwestycja",
  "uzun vadeli yatırım",
  "长期投资",
  "長期的な投資",
  "장기 투자",
  "Investasi jangka panjang",
  "Đầu tư dài hạn",
  "Investiție pe termen lung",
  "Långsiktig investering",
  "দীর্ঘমেয়াদী বিনিয়োগ",
  "การลงทุนระยะยาว",
  "Pelaburan jangka panjang",
];

describe("the sub-break-even verdict", () => {
  it.each(LOCALES)("%s defines it at all", (locale) => {
    const copy = getRoiCopy(locale as never) as { roiDescriptions: Record<string, string> };
    expect(copy.roiDescriptions.longTerm, `${locale} has no longTerm verdict`).toBeTruthy();
    expect(typeof copy.roiDescriptions.longTerm).toBe("string");
  });

  it.each(LOCALES)("%s does not call a loss an investment", (locale) => {
    const copy = getRoiCopy(locale as never) as { roiDescriptions: Record<string, string> };
    const verdict = copy.roiDescriptions.longTerm;
    for (const euphemism of EUPHEMISMS) {
      expect(
        verdict,
        `${locale} still frames a net loss as "${euphemism}"`,
      ).not.toContain(euphemism);
    }
  });

  it.each(LOCALES)("%s is transcreated, not left in English", (locale) => {
    if (locale === "en") return;
    const copy = getRoiCopy(locale as never) as { roiDescriptions: Record<string, string> };
    const en = getRoiCopy("en" as never) as { roiDescriptions: Record<string, string> };
    expect(
      copy.roiDescriptions.longTerm,
      `${locale} fell back to the English verdict`,
    ).not.toBe(en.roiDescriptions.longTerm);
  });

  it("stays distinct from the verdict shown when the deal DOES pay back", () => {
    for (const locale of LOCALES) {
      const d = (getRoiCopy(locale as never) as { roiDescriptions: Record<string, string> })
        .roiDescriptions;
      expect(d.longTerm, `${locale} gives the same sentence either way`).not.toBe(d.value);
      expect(d.longTerm).not.toBe(d.positive);
    }
  });
});
