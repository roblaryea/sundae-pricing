import { describe, expect, it, vi } from 'vitest';
import fixture from './fixtures/published-v1.8.2.json';
import { applyLiveCatalogValues, validatePublishedCatalog, type LiveCatalogResponse } from '../src/data/livePricing';
import { corePackages, conceptSkus, crewSkus, crewBundles, implementationClasses, volumeDiscounts, crossIntelligence, watchtower, requiresEnterpriseQuote } from '../src/data/pricing';
import { calculateBasketQuote } from '../src/lib/basketQuote';

function complete(): LiveCatalogResponse {
  const data = structuredClone(fixture) as unknown as LiveCatalogResponse;
  data.resolvedAt = '2026-10-09T10:30:00.000Z';
  data.version!.volumeDiscountTiers = [{minLocations:1,maxLocations:49,discountPercent:0},{minLocations:50,maxLocations:99,discountPercent:2.5},{minLocations:100,maxLocations:199,discountPercent:5},{minLocations:200,maxLocations:249,discountPercent:7}];
  data.version!.maxCombinedDiscountPercent = 20;
  data.implementationClasses = structuredClone(implementationClasses);
  data.offerImplementationClasses = Object.fromEntries([
    ...Object.entries(corePackages).map(([id])=>[id.replace('core_',''),'class_a']),
    ...Object.keys(conceptSkus).map(id=>[({concept_franchise:'franchise_intelligence',concept_hotel_fb:'hotel_fb_analytics',concept_cloud_kitchen:'cloud_kitchen',concept_catering:'crew_catering',concept_production:'crew_production',concept_rental_commissary:'rental_commissary'} as Record<string,string>)[id],'class_d']),
    ...Object.keys(crewSkus).map(id=>[id,'self_service']), ...Object.keys(crewBundles).map(id=>[id,'self_service']), ['foresight','class_b'],
  ]) as LiveCatalogResponse['offerImplementationClasses'];
  data.watchtower!.push({id:'bundle',basePrice:watchtower.bundle.basePrice,perLocationPrice:watchtower.bundle.perLocationPrice,baseIncludesLocations:watchtower.bundle.includedLocations});
  data.addons = [{id:"cross_intelligence_pro", pricingByTier:{foundation:399,margin:399,growth:399,performance:399},perLocationPrice:49,baseIncludesLocations:1}];
  return data;
}
describe('hosted catalogue authority', () => {
  it('requires the server clock and every published commercial policy', () => {
    const data=complete(); expect(()=>validatePublishedCatalog(data,true)).not.toThrow();
    for (const field of ['resolvedAt','implementationClasses','offerImplementationClasses'] as const) {
      const broken=structuredClone(data); delete broken[field]; expect(()=>validatePublishedCatalog(broken,true)).toThrow();
    }
    const broken=structuredClone(data); delete broken.version!.volumeDiscountTiers; expect(()=>validatePublishedCatalog(broken,true)).toThrow();
  });
  it('uses the server effective time even when the buyer clock is wrong', () => {
    const data=complete(); vi.spyOn(Date,'now').mockReturnValue(Date.parse('2020-01-01'));
    try { expect(()=>validatePublishedCatalog(data,true)).not.toThrow(); data.version!.effectiveDate='2026-10-10T00:00:00Z'; expect(()=>validatePublishedCatalog(data,true)).toThrow('not effective'); }
    finally { vi.restoreAllMocks(); }
  });
  it('takes new prices, allowances, discounts and Enterprise boundaries from one response', () => {
    const data=complete(); const before=structuredClone({volume:volumeDiscounts.tiers,core:corePackages.core_foundation,cross:crossIntelligence.pro});
    try {
      data.tiers![0].locationBands![0][1]=2000;
      data.version!.volumeDiscountTiers=[{minLocations:1,maxLocations:149,discountPercent:9}];
      applyLiveCatalogValues(data);
      const q=calculateBasketQuote({v:2,layer:'core',corePackage:'core_foundation',locations:3,addOns:[],watchtowerModules:[],crewSkus:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:''});
      expect(q.monthly).toBe(2138.5); expect(requiresEnterpriseQuote(149)).toBe(false); expect(requiresEnterpriseQuote(150)).toBe(true);
    } finally { volumeDiscounts.tiers=before.volume; Object.assign(corePackages.core_foundation,before.core); Object.assign(crossIntelligence.pro,before.cross); }
  });
});
