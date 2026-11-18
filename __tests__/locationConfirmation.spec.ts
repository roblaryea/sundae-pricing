import { describe, expect, it } from 'vitest';
import { restoreLocationConfirmation } from '../src/lib/persistedPricing';
import { getLocationGateCopy } from '../src/lib/locationGateCopy';
import { supportedLocales } from '../src/lib/locales';
const valid = {layer:'core',corePackage:'core_foundation',locations:1,addOns:[],crewSkus:[],watchtowerModules:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:''};
describe('explicit location confirmation', () => {
  it('does not confuse a fresh or legacy one-location default with a choice', () => {
    for (const value of [null,{},valid,{locationsConfirmed:true}]) expect(restoreLocationConfirmation(value)).toBe(false);
  });
  it('restores a deliberate one-location choice', () => expect(restoreLocationConfirmation({...valid,locationsConfirmed:true})).toBe(true));
  it('preserves legacy multi-location footprints', () => expect(restoreLocationConfirmation({...valid,locations:3})).toBe(true));
  it('honours an explicitly cleared footprint even when the last valid count was larger', () => expect(restoreLocationConfirmation({...valid,locations:3,locationsConfirmed:false})).toBe(false));
  it.each([0,-1,1.5,10001,NaN,Infinity])('does not confirm invalid count %s', locations => expect(restoreLocationConfirmation({...valid,locations,locationsConfirmed:true})).toBe(false));
  it('does not unlock an otherwise invalid saved quote', () => expect(restoreLocationConfirmation({...valid,locations:3,corePackage:'retired',locationsConfirmed:true})).toBe(false));
  it('does not accept a string as a confirmation marker', () => expect(restoreLocationConfirmation({...valid,locationsConfirmed:'true'})).toBe(false));
});
it('provides a direct localized location prompt in every supported language', () => {
  for (const locale of supportedLocales) {
    expect(getLocationGateCopy(locale)).toBeTruthy();
    if (locale!=='en') expect(getLocationGateCopy(locale)).not.toBe(getLocationGateCopy('en'));
  }
});
