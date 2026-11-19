import { describe, expect, it } from 'vitest';
import { restoreLocationConfirmation } from '../src/lib/persistedPricing';
import { getLocationGateCopy } from '../src/lib/locationGateCopy';
import { LOCATION_INACTIVITY_MS } from '../src/lib/locationMemory';
import { supportedLocales } from '../src/lib/locales';
const now = 1_800_000_000_000;
const valid = {locationsLastActiveAt:now,layer:'core',corePackage:'core_foundation',locations:1,addOns:[],crewSkus:[],watchtowerModules:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:''};
describe('explicit location confirmation', () => {
  it('does not confuse a fresh or legacy one-location default with a choice', () => {
    for (const value of [null,{},valid,{locationsConfirmed:true}]) expect(restoreLocationConfirmation(value,now)).toBe(false);
  });
  it('restores a deliberate one-location choice', () => expect(restoreLocationConfirmation({...valid,locationsConfirmed:true},now)).toBe(true));
  it('requires a deliberate marker even for a multi-location value', () => expect(restoreLocationConfirmation({...valid,locations:3},now)).toBe(false));
  it('honours an explicitly cleared footprint even when the last valid count was larger', () => expect(restoreLocationConfirmation({...valid,locations:3,locationsConfirmed:false},now)).toBe(false));
  it.each([0,-1,1.5,10001,NaN,Infinity])('does not confirm invalid count %s', locations => expect(restoreLocationConfirmation({...valid,locations,locationsConfirmed:true},now)).toBe(false));
  it('does not unlock an otherwise invalid saved quote', () => expect(restoreLocationConfirmation({...valid,locations:3,corePackage:'retired',locationsConfirmed:true},now)).toBe(false));
  it('does not accept a string as a confirmation marker', () => expect(restoreLocationConfirmation({...valid,locationsConfirmed:'true'},now)).toBe(false));
  it('keeps a footprint until just before 24 hours, then expires at the boundary', () => {
    const saved={...valid,locationsConfirmed:true};
    expect(restoreLocationConfirmation(saved,now+LOCATION_INACTIVITY_MS-1)).toBe(true);
    expect(restoreLocationConfirmation(saved,now+LOCATION_INACTIVITY_MS)).toBe(false);
  });
  it.each([undefined,null,'1800000000000',0,-1,NaN,Infinity,now+1])('rejects missing or invalid activity %s', locationsLastActiveAt => {
    expect(restoreLocationConfirmation({...valid,locationsConfirmed:true,locationsLastActiveAt},now)).toBe(false);
  });

});
it('provides a direct localized location prompt in every supported language', () => {
  for (const locale of supportedLocales) {
    expect(getLocationGateCopy(locale)).toBeTruthy();
    if (locale!=='en') expect(getLocationGateCopy(locale)).not.toBe(getLocationGateCopy('en'));
  }
});
