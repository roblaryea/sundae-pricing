import { describe, expect, it } from 'vitest';
import { CONCEPT_SKU_IDS } from '../src/data/pricing';
import { orderedConceptSkus } from '../src/lib/discoveryEngine';

describe('orderedConceptSkus', () => {
  it('returns every concept exactly once and recommends matching pathways first', () => {
    const ordered = orderedConceptSkus(['franchise', 'hotel_fb']);

    expect(ordered).toHaveLength(CONCEPT_SKU_IDS.length);
    expect(new Set(ordered)).toEqual(new Set(CONCEPT_SKU_IDS));
    expect(ordered.slice(0, 2)).toEqual(['concept_franchise', 'concept_hotel_fb']);
  });

  it('remains total when no operating model is selected', () => {
    expect(orderedConceptSkus([])).toEqual(CONCEPT_SKU_IDS);
  });
});
