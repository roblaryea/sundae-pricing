import { crewBundles } from '../data/pricing';
import { CREW_SKU_LIST, crewEntitlementsOf } from './crewPricing';
import type { CrewBundleId, CrewSkuId } from '../types/configuration';

/** Supplied capabilities are separate from the buyer's explicit selections. */
export function additionalBundleCapabilities(bundleId: CrewBundleId, requested: readonly CrewSkuId[]): CrewSkuId[] {
  const supplied = crewEntitlementsOf(crewBundles[bundleId].skus);
  return CREW_SKU_LIST.filter(id => supplied.has(id) && !requested.includes(id));
}
