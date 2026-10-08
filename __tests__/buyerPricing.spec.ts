import { describe, expect, it } from 'vitest';
import fixture from './fixtures/published-v1.8.2.json';
import { catalogCurve, validatePublishedCatalog, applyLiveCatalogValues, getLivePricingState, type LiveCatalogResponse } from '../src/data/livePricing';
import { calculateConceptPrice, calculateAddOnsPrice, calculateFullPrice } from '../src/lib/pricingEngine';
import { calculateBasketQuote } from '../src/lib/basketQuote';
import { decodePricingIntent, encodePricingIntent, parsePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
import { corePackages } from '../src/data/pricing';
import { restorePricingSelection, restorePricingPreferences } from '../src/lib/persistedPricing';
import { pricingPolicyCopy } from '../src/lib/pricingPolicyCopy';
import { getBuyerCopy, formatLocationAverage } from '../src/lib/buyerCopy';
import { supportedLocales } from '../src/lib/locales';
import { localizeBreakdownLabel } from '../src/lib/pricingI18n';
import { localizeDiscountLine, getQuoteSummaryCopy } from '../src/lib/quoteSummaryCopy';
const config: PricingIntent = { v:2, layer:'core', corePackage:'core_foundation', locations:3, addOns:[],watchtowerModules:[],crewSkus:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:'' };
const published = fixture as unknown as LiveCatalogResponse;

describe('published catalogue hydration', () => {
  it('consumes actual tiers/modules/bundles, grants, caps, terms and version', () => {
    const n = validatePublishedCatalog(published);
    expect(n.corePackages).toHaveLength(4); expect(n.crew).toHaveLength(6); expect(n.bundles).toHaveLength(3);
    applyLiveCatalogValues(published);
    expect(getLivePricingState().catalog?.id).toBe(published.version!.id);
    expect(corePackages.core_performance.includesForesight).toBe(true);
    expect(corePackages.core_performance.includesDomainModules).not.toContain('delivery');
  });
  it('rejects missing families and does not partially mutate prior valid prices', () => {
    const before = corePackages.core_foundation.firstUnitPrice;
    const broken = structuredClone(published); broken.tiers![0].locationBands![0][1] = 999;
    broken.modules = [];
    expect(() => applyLiveCatalogValues(broken)).toThrow();
    expect(corePackages.core_foundation.firstUnitPrice).toBe(before);
  });
  it('rejects a catalogue without authority/version and malformed curves', () => {
    expect(() => validatePublishedCatalog({})).toThrow();
    const broken = structuredClone(published); broken.tiers![0].locationBands![2][0] = 2;
    expect(() => validatePublishedCatalog(broken)).toThrow();
  });
  it('preserves the Starter hard cap in the published band schedule', () => {
    expect(catalogCurve(published.modules!.find((r) => r.id === 'crew_lite')!).marginalBands.at(-1)?.toUnit).toBe(5);
  });
});
describe('one buyer basket', () => {
  it('uses published concept totals through every add-on path', () => {
    expect(calculateConceptPrice('concept_franchise',3)).toBe(745);
    expect(calculateAddOnsPrice(['concept_franchise','concept_hotel_fb'],3)).toBe(1310);
    const q = calculateBasketQuote({...config,addOns:['concept_franchise']});
    expect(q.core!.subtotal).toBe(1545 + 745);
  });
  it('never charges included Foresight, even from an older link', () => {
    const input = {...config,corePackage:'core_performance' as const};
    expect(calculateBasketQuote({...input,addOns:['foresight_action']}).monthly).toBe(calculateBasketQuote(input).monthly);
    expect(calculateFullPrice({layer:'core',corePackage:'core_performance',locations:1,addOns:['foresight_action'],watchtower:[],clientProfile:{type:'independent',isEarlyAdopter:false,isFranchise:false,brandCount:1}}).subtotal).toBe(2980);
  });
  it('pools Crew staff allowance and applies the highest overage rate once', () => {
    const q = calculateBasketQuote({...config,layer:'crew',addOns:[],crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll'],employees:65});
    expect(q.crew!.monthly).toBe(697); expect(q.includedEmployees).toBe(60);
    expect(q.employeeOverage).toBe(15); expect(q.monthly).toBe(712);
  });
  it('keeps unknown headcount and setup exclusions explicit', () => {
    const q = calculateBasketQuote({...config,layer:'both',crewSkus:['crew_scheduling','crew_tna']});
    expect(q.workforceUnknown).toBe(true); expect(q.implementation.requiresScoping).toBe(true);
    expect(q.monthly).toBe(1545+347);
  });
  it('applies the published term once and excludes employee expansion from discounts', () => {
    const q = calculateBasketQuote({...config,layer:'crew',crewSkus:['crew_operations','crew_scheduling','crew_tna','crew_payroll'],employees:65,billingCycle:'annual_upfront'});
    expect(q.monthly).toBe(628.36); expect(q.paymentAmount).toBeCloseTo(7540.32);
  });
  it('switches from a reference estimate to enterprise at 250 units', () => {
    expect(calculateBasketQuote({...config,locations:249}).enterprise).toBe(false);
    expect(calculateBasketQuote({...config,locations:250}).enterprise).toBe(true);
  });
  it('derives the average from the discounted monthly basket including extra employees', () => {
    const input: PricingIntent = {...config,layer:'both',corePackage:'core_growth',watchtowerModules:['events'],addOns:['concept_franchise'],crewSkus:['crew_operations','crew_scheduling','crew_payroll'],employees:72,billingCycle:'annual_quarterly'};
    const quarterly=calculateBasketQuote(input);
    expect(quarterly.monthly).toBe(4039.30);
    expect(quarterly.averageMonthlyPerLocation).toBe(1346.43);
    const upfront=calculateBasketQuote({...input,billingCycle:'annual_upfront'});
    expect(upfront.averageMonthlyPerLocation).toBe(1248.11);
    expect(upfront.averageMonthlyPerLocation).not.toBeCloseTo(upfront.paymentAmount/3);
  });
  it('omits averages for a single location, Enterprise and an incomplete Crew selection', () => {
    for(const input of [{...config,locations:1},{...config,locations:250},{...config,layer:'crew' as const,crewSkus:[]}]) expect(calculateBasketQuote(input).averageMonthlyPerLocation).toBeNull();
  });
  it('records selected Watchtower services separately while preserving the bundle total', () => {
    const single=calculateBasketQuote({...config,corePackage:'core_growth',watchtowerModules:['events']});
    expect(single.lines.find((line)=>line.item==='Event & Calendar Signals')?.price).toBe(327);
    const two=calculateBasketQuote({...config,corePackage:'core_growth',watchtowerModules:['events','trends']});
    expect(two.lines.filter((line)=>'watchtowerModuleId' in line)).toHaveLength(2);
    expect(two.lines.reduce((sum,line)=>sum+line.price,0)).toBe(two.subtotal);
    const bundle=calculateBasketQuote({...config,corePackage:'core_growth',watchtowerModules:['bundle']});
    expect(bundle.lines.find((line)=>line.item==='Watchtower Bundle')?.price).toBe(1117);
  });
});
describe('shared buyer intent', () => {
  it('round-trips every bill-affecting field without contact data or payable promises', () => {
    const exact: PricingIntent = {...config,layer:'both',corePackage:'core_growth',watchtowerModules:['events'],addOns:['concept_franchise'],crewSkus:['crew_operations','crew_scheduling','crew_payroll'],employees:72,payrollCountry:'AE',billingCycle:'annual_quarterly',operatingModels:['franchise']};
    expect(decodePricingIntent(encodePricingIntent(exact))).toEqual(exact);
  });
  it.each([NaN,-1,0,1.5,10001])('rejects invalid location count %s', (locations) => expect(parsePricingIntent({...config,locations})).toBeNull());
  it('rejects retired products and malformed or unsupported selections', () => {
    for (const x of [{...config,corePackage:'core_lite'}, {...config,addOns:['labor']}, {...config,watchtowerModules:['bundle']}, {...config,crewSkus:['crew_lite'],locations:6}]) expect(parsePricingIntent(x)).toBeNull();
    expect(decodePricingIntent('not-json')).toBeNull();
    expect(parsePricingIntent({...config, layer:'crew', crewSkus:['crew_operations'], employees:10, payrollCountry:'ZZ'})).toBeNull();
  });
  it('removes Crew-only handoff fields from a Core selection', () => {
    const encoded = encodePricingIntent({...config, employees:1000000, payrollCountry:'XX'});
    const raw = JSON.parse(atob(encoded.replace(/-/g,'+').replace(/_/g,'/')));
    expect(raw).not.toHaveProperty('employees');
    expect(raw).not.toHaveProperty('payrollCountry');
    expect(decodePricingIntent(encoded)).toMatchObject({ employees: null, payrollCountry: '' });
  });
  it('routes very large Crew workforces to a tailored proposal', () => {
    const q = calculateBasketQuote({...config, layer:'crew', crewSkus:['crew_operations'], employees:100001});
    expect(q.employeeLimitExceeded).toBe(true);
    expect(q.enterprise).toBe(true);
    expect(q.averageMonthlyPerLocation).toBeNull();
  });
  it('resolves Crew prerequisites before returning an imported selection', () => {
    expect(parsePricingIntent({...config,layer:'crew',crewSkus:['crew_payroll']})!.crewSkus).toEqual(['crew_payroll','crew_operations','crew_scheduling']);
  });
  it('normalizes a complete individual Watchtower selection before restoring or sharing', () => {
    const intent={...config,corePackage:'core_growth' as const,watchtowerModules:['competitive','events','trends']};
    expect(parsePricingIntent(intent)?.watchtowerModules).toEqual(['bundle']);
    expect(restorePricingSelection(intent).watchtowerModules).toEqual(['bundle']);
  });
  it('rejects empty Crew baskets and removes internal catalogue context from customer links', () => {
    expect(parsePricingIntent({...config,layer:'crew'})).toBeNull();
    expect(parsePricingIntent({...config,layer:'both'})).toBeNull();
    const value = {...config,catalogue:{id:'published-version',versionName:'v1.8.2 · publié'}};
    expect(decodePricingIntent(encodePricingIntent(value))).toEqual(config);
    expect(atob(encodePricingIntent(value).replace(/-/g,'+').replace(/_/g,'/'))).not.toMatch(/catalogue|published-version|v1\.8\.2/);
  });
  it('restores valid returning selections and rejects corrupt storage', () => {
    const returned = restorePricingSelection({...config,billingCycle:'annual'});
    expect(returned.billingCycle).toBe('annual_upfront');
    expect(returned.corePackage).toBe('core_foundation');
    for (const saved of [null, {...config,locations:-3}, {...config,corePackage:'core_lite'}, {...config,addOns:['unknown']}]) expect(restorePricingSelection(saved)).toEqual({});
  });
  it('preserves editable ROI assumptions while rejecting unsafe browser preferences', () => {
    expect(restorePricingPreferences({ techStack:['accounting','accounting'], roiInputs:{monthlyRevenue:250000,laborPercent:34,replaceableSystemsSpend:750,hasReviewData:true} })).toEqual({techStack:['accounting'],roiInputs:{monthlyRevenue:250000,laborPercent:34,replaceableSystemsSpend:750,hasReviewData:true}});
    expect(restorePricingPreferences({ techStack:['unknown'], roiInputs:{monthlyRevenue:Infinity,laborPercent:-1,foodCostPercent:'29',manualReportingHoursPerWeek:NaN,hasReviewData:'yes',unknown:2} })).toEqual({roiInputs:{}});
  });
  it('provides localized new payment, exclusions and workforce disclosures', () => {
    const en = getBuyerCopy('en');
    for (const locale of supportedLocales) {
      const copy = getBuyerCopy(locale);
      const average=formatLocationAverage('$1,346.43',3,locale);
      expect(average).toContain('$1,346.43');
      expect(average).toContain(new Intl.NumberFormat(locale).format(3));
      expect(average).not.toMatch(/\{amount\}|\{locations\}/);
      if(locale!=='en') expect(average).not.toContain('per location');
      expect(pricingPolicyCopy[locale].discount).toContain('{cap}');
      expect(pricingPolicyCopy[locale].classes).toHaveLength(5);
      if (locale !== 'en') expect(pricingPolicyCopy[locale].setup).not.toBe(pricingPolicyCopy.en.setup);
      expect(copy.models).toHaveLength(7); expect(copy.terms).toHaveLength(4);
      for (const key of ['estimate','exclusions','optional','payrollNote','overageNote','workforceUnknown','specialist','intentNote','review','chooseCrew'] as const) {
        expect(copy[key]).toBeTruthy();
        if (locale !== 'en') expect(copy[key], `${locale}.${key}`).not.toBe(en[key]);
      }
    }
  });
  it('uses stable discount keys and localized scope labels in the money lines', () => {
    for(const locale of supportedLocales){
      const term=localizeDiscountLine({name:'Commitment term — 12%',key:'term',percent:12},locale,3);
      const volume=localizeDiscountLine({name:'Volume (3 locations) — 4%',key:'volume',percent:4},locale,3);
      expect(term).toContain(getQuoteSummaryCopy(locale).commitmentTerm);
      expect(volume).toContain(new Intl.NumberFormat(locale).format(3));
      if(locale!=='en'){
        expect(term).not.toContain('Commitment term');
        expect(localizeBreakdownLabel('Core Growth (3 locations)',locale)).not.toContain('3 locations');
      }
    }
    expect(localizeBreakdownLabel('Core Foundation (1 location)','en')).toBe('Core Foundation (1 location)');
  });
});
