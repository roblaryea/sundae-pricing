/**
 * Discovery → quote wiring.
 *
 * The journey asked what hurts and how fast you want results, then jumped to a
 * package. Two things every real Sundae deal turns on were never asked, so the
 * quote could not model them:
 *
 *   • HOW THE BUSINESS IS RUN — a franchisor, a hotel F&B group and a cloud
 *     kitchen buy different concept pathways and are billed on different
 *     per-object overlays.
 *   • WHAT WE CONNECT TO — v1.7 section 7 charges implementation ONCE at the
 *     highest class in the selection. With nothing asked, every quote said
 *     "Scoped at contract" and the buyer never saw the largest one-time line.
 */
import { describe, expect, it } from "vitest";

import {
  objectOverlaysFor,
  recommendedConceptSkus,
  resolveImplementationClass,
  type OperatingModelId,
  type TechStackId,
} from "../src/lib/discoveryEngine";
import { conceptSkus, implementationClasses } from "../src/data/pricing";

describe("recommendedConceptSkus", () => {
  it("maps each concept-bearing model to a real, published SKU", () => {
    const cases: Array<[OperatingModelId, string]> = [
      ["franchise", "concept_franchise"],
      ["hotel_fb", "concept_hotel_fb"],
      ["cloud_kitchen", "concept_cloud_kitchen"],
      ["catering", "concept_catering"],
      ["production", "concept_production"],
    ];
    for (const [model, sku] of cases) {
      expect(recommendedConceptSkus([model])).toEqual([sku]);
      expect(conceptSkus[sku as keyof typeof conceptSkus]).toBeTruthy();
    }
  });

  it("recommends nothing for plain multi-site groups — Core already covers them", () => {
    expect(recommendedConceptSkus(["single_brand"])).toEqual([]);
    expect(recommendedConceptSkus(["multi_brand"])).toEqual([]);
  });

  it("handles a group running more than one model without duplicating", () => {
    const out = recommendedConceptSkus(["franchise", "hotel_fb", "franchise"]);
    expect(out).toEqual(["concept_franchise", "concept_hotel_fb"]);
  });
});

describe("objectOverlaysFor", () => {
  it("surfaces the per-object rate a buyer would otherwise meet after signature", () => {
    expect(objectOverlaysFor(["hotel_fb"])).toEqual([
      { model: "hotel_fb", object: "revenue centre", includedPerLocation: 5, ratePerObject: 75 },
    ]);
    expect(objectOverlaysFor(["cloud_kitchen"])[0].ratePerObject).toBe(45);
    expect(objectOverlaysFor(["production"])[0].ratePerObject).toBe(15);
  });

  it("returns nothing for models with no object billing", () => {
    expect(objectOverlaysFor(["single_brand", "franchise", "catering"])).toEqual([]);
  });
});

describe("resolveImplementationClass", () => {
  const r = (stack: TechStackId[], models: OperatingModelId[] = ["single_brand"], opts = {}) =>
    resolveImplementationClass(stack, models, opts);

  it("escalates on integration complexity, not on estate size", () => {
    expect(r(["pos_standard"]).classId).toBe("class_a");
    expect(r(["pos_standard", "accounting"]).classId).toBe("class_b");
    expect(r(["pos_standard", "pos_multiple"]).classId).toBe("class_c");
    expect(r(["pos_standard", "custom_legacy"]).classId).toBe("class_c");
  });

  it("treats payroll as Class D — it validates against statutory packs", () => {
    const out = r(["pos_standard", "payroll_hr"], ["single_brand"], {
      crewPayrollSelected: true,
    });
    expect(out.classId).toBe("class_d");
    expect(out.isFloor).toBe(true);
    expect(out.drivers.join(" ")).toMatch(/statutory/i);
  });

  it("does NOT escalate to Class D merely for having an HR system to read", () => {
    // Reading an HR system is a connector. RUNNING payroll is the statutory
    // exposure — conflating them would overquote every operator with a BYO-HR
    // stack.
    expect(r(["pos_standard", "payroll_hr"]).classId).toBe("class_b");
  });

  it("escalates when several operating models must be sequenced", () => {
    const out = r(["pos_standard"], ["franchise", "hotel_fb"]);
    expect(out.classId).toBe("class_c");
    expect(out.drivers.join(" ")).toMatch(/operating models/i);
  });

  it("marks an unknown stack indicative rather than inventing a precise fee", () => {
    for (const stack of [[], ["not_sure"] as TechStackId[]]) {
      const out = r(stack as TechStackId[]);
      expect(out.isIndicative).toBe(true);
      expect(out.classId).toBe("class_b");
      expect(out.drivers.join(" ")).toMatch(/indicative/i);
    }
  });

  it("always explains itself — a fee with no drivers is a mystery number", () => {
    const out = r(["pos_standard", "accounting", "custom_legacy"]);
    expect(out.drivers.length).toBeGreaterThan(0);
  });

  it("only ever returns a published class and its published fee", () => {
    const combos: TechStackId[][] = [
      ["pos_standard"],
      ["accounting"],
      ["pos_multiple", "inventory_supply"],
      ["custom_legacy", "delivery_reservations"],
      ["pos_standard", "accounting", "payroll_hr", "inventory_supply"],
    ];
    for (const stack of combos) {
      const out = r(stack);
      const published = implementationClasses[out.classId];
      expect(published, `unknown class ${out.classId}`).toBeTruthy();
      expect(out.fee).toBe(published.fee);
      expect(out.isFloor).toBe(published.isFloor);
    }
  });

  it("never lets a bigger stack cost less to launch than a subset of itself", () => {
    const base = r(["pos_standard"]);
    const more = r(["pos_standard", "accounting"]);
    const most = r(["pos_standard", "accounting", "custom_legacy"]);
    expect(more.fee).toBeGreaterThanOrEqual(base.fee);
    expect(most.fee).toBeGreaterThanOrEqual(more.fee);
  });
});
