import { describe, expect, it, vi } from 'vitest';
import fixture from './fixtures/published-v1.8.2.json';
import { applyLiveCatalogValues, getLivePricingState, type LiveCatalogResponse } from '../src/data/livePricing';
import { calculateBasketQuote } from '../src/lib/basketQuote';
import { calculateCrossIntelligencePrice } from '../src/lib/pricingEngine';
import { corePackages, crossIntelligence, volumeDiscounts, DISCOUNT_RULES, implementationClasses } from '../src/data/pricing';
import { getBuyerCopy } from '../src/lib/buyerCopy';
import { getBuyerJourneyCopy } from '../src/lib/buyerJourneyCopy';
import { resolveMessages } from '../src/contexts/LocaleContext';
import { supportedLocales } from '../src/lib/locales';
import type { PricingIntent } from '../src/lib/pricingIntent';
import { localizeBreakdownLabel, localizeWatchtowerName } from '../src/lib/pricingI18n';
import { calculateWatchtowerPrice } from '../src/lib/watchtowerEngine';
import { downloadBasketPDF } from '../src/lib/basketPdf';
const published = fixture as unknown as LiveCatalogResponse;
const base: PricingIntent = {v:2,layer:'crew',corePackage:'core_foundation',locations:1,addOns:[],watchtowerModules:[],crewSkus:['crew_operations'],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:40,payrollCountry:''};

it('a print window that never loads returns a retryable failure and releases its resources', async () => {
  vi.useFakeTimers();
  const output = Object.assign(new EventTarget(), { close: vi.fn() });
  const documentUrl = 'blob:https://pricing.example/estimate';
  const revoke = vi.spyOn(URL, 'revokeObjectURL');
  vi.spyOn(URL, 'createObjectURL').mockReturnValue(documentUrl);
  vi.stubGlobal('window', { location: { origin: 'https://pricing.example' }, open: () => output, setTimeout, clearTimeout });
  try {
    applyLiveCatalogValues(published);
    const failure = expect(downloadBasketPDF(base, calculateBasketQuote(base), 'https://pricing.example/simulator')).rejects.toThrow('Print document did not load');
    await vi.advanceTimersByTimeAsync(20_000);
    await failure;
    expect(output.close).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith(documentUrl);
  } finally { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); }
});

describe('buyer journey copy coverage', () => {
  it('does not inherit English labels in the offered languages', () => {
    const en = getBuyerJourneyCopy('en');
    for(const locale of supportedLocales) {
      const copy = getBuyerJourneyCopy(locale);
      expect(Object.values(copy)).toHaveLength(8);
      for(const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(copy[key]).toBeTruthy();
        if(locale !== 'en') expect(copy[key],`${locale}.${key}`).not.toBe(en[key]);
      }
      const messages = resolveMessages(locale);
      expect(messages.builder.tierSelector.estateSizeLabel).toBe(copy.locationQuestion);
      if(locale !== 'en') expect(messages.overview.intelligenceSeats).not.toBe(resolveMessages('en').overview.intelligenceSeats);
      if(locale !== 'en') {
        expect(localizeBreakdownLabel('Core Growth (3 locations)',locale)).not.toContain('Locations');
        expect(localizeWatchtowerName('events',locale)).not.toBe('Event & Calendar Signals');
      }
    }
  });
  it('completes the new buyer packs instead of spreading untranslated English actions', () => {
    const en = getBuyerCopy('en');
    for(const locale of ['az','ru','pap'] as const) for(const key of Object.keys(en) as (keyof typeof en)[]) {
      expect(getBuyerCopy(locale)[key],`${locale}.${key}`).not.toEqual(en[key]);
    }
  });
});

describe('published updates flow through the reviewed estimate', () => {
  it('automatically charges the published rate for employees above the included allowance', () => {
    applyLiveCatalogValues(published);
    const q = calculateBasketQuote(base);
    expect(q.includedEmployees).toBe(20);
    expect(q.excessEmployees).toBe(20);
    expect(q.employeeOverage).toBe(60);
    const revised = structuredClone(published);
    const caps = revised.modules!.find(r=>r.id==='crew_operations')!.rules!.find(r=>r.ruleKey==='outlet_caps')!.ruleValue;
    caps.maxEmployeesPerLocation = 30;
    caps.perEmployeeOverageUsd = 4;
    applyLiveCatalogValues(revised);
    const next = calculateBasketQuote(base);
    expect(next.includedEmployees).toBe(30);
    expect(next.employeeOverage).toBe(40);
    expect(next.monthly).toBe(q.monthly - 20);
    applyLiveCatalogValues(published);
  });
  it('hydrates catalogue policies and package-specific extensions atomically', () => {
    const oldVolume=structuredClone(volumeDiscounts.tiers), oldCap=DISCOUNT_RULES.maxDiscountPercent;
    const oldCross=structuredClone(crossIntelligence.pro), oldClasses=structuredClone(implementationClasses);
    try {
      const revised = structuredClone(published);
      revised.version!.volumeDiscountTiers = [{minLocations:1,maxLocations:49,discountPercent:0},{minLocations:50,maxLocations:null,discountPercent:6}];
      revised.version!.maxCombinedDiscountPercent = 18;
      revised.addons = [{id:'cross_intelligence_pro',pricingByTier:{foundation:222,margin:333,growth:444,performance:555},perLocationPrice:21,baseIncludesLocations:2}];
      revised.implementationClasses = Object.fromEntries(Object.entries(implementationClasses).map(([id,c])=>[id,{fee:c.fee+100,isFloor:c.isFloor}]));
      applyLiveCatalogValues(revised);
      expect(calculateCrossIntelligencePrice('pro',3,'core_growth')).toBe(465);
      expect(calculateBasketQuote({...base,layer:'core',locations:50,employees:null,crewSkus:[]}).discounts.find(d=>d.key==='volume')?.percent).toBe(6);
      expect(DISCOUNT_RULES.maxDiscountPercent).toBe(18);
      expect(implementationClasses.class_a.fee).toBe(oldClasses.class_a.fee+100);
      expect(getLivePricingState().policyCoverage).toMatchObject({volume:true,ceiling:true,implementation:true,crossIntelligence:true});
      const broken = structuredClone(revised);
      broken.tiers![0].locationBands![0][1] = 111;
      broken.version!.maxCombinedDiscountPercent = NaN;
      const before = corePackages.core_foundation.firstUnitPrice;
      expect(()=>applyLiveCatalogValues(broken)).toThrow();
      expect(corePackages.core_foundation.firstUnitPrice).toBe(before);
      applyLiveCatalogValues(published);
      expect(getLivePricingState().policyCoverage).toMatchObject({volume:false,ceiling:false,implementation:false});
      expect(DISCOUNT_RULES.maxDiscountPercent).toBe(oldCap);
      expect(volumeDiscounts.tiers).toEqual(oldVolume);
      expect(implementationClasses.class_a.fee).toBe(oldClasses.class_a.fee);
    } finally {
      applyLiveCatalogValues(published);
      volumeDiscounts.tiers=oldVolume;DISCOUNT_RULES.maxDiscountPercent=oldCap;
      Object.assign(crossIntelligence.pro,oldCross);
      for(const [id,c] of Object.entries(oldClasses)) Object.assign(implementationClasses[id as keyof typeof implementationClasses],c);
    }
  });
  it('uses the published Watchtower included-location count rather than assuming one', () => {
    const revised = structuredClone(published);
    const events = revised.watchtower!.find(r=>r.id==='events')!;
    events.baseIncludesLocations = 3;
    events.basePrice = 400;
    events.perLocationPrice = 25;
    applyLiveCatalogValues(revised);
    expect(calculateWatchtowerPrice(['events'],3).total).toBe(400);
    expect(calculateWatchtowerPrice(['events'],4).total).toBe(425);
    applyLiveCatalogValues(published);
  });
});
