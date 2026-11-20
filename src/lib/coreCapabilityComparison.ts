import { corePackages, crewSkus, packageAllowsWatchtower, type CorePackageId, type ModuleId } from '../data/pricing';
import type { CrewSkuId } from '../types/configuration';
import type { PricingLocale } from './locales';
import { localizeModuleName } from './pricingI18n';
import { capabilityComparisonCopy } from './capabilityComparisonCopy';

export const sharedCoreCapabilities = ['pulse', 'benchmarks', 'ask', 'recovery'] as const;
export const comparedCoreDomains = ['profit', 'labor', 'revenue', 'inventory', 'purchasing', 'delivery', 'marketing', 'reservations', 'guest', 'guest_crm'] as const;
export const comparedCoreExtensions = ['foresight_action', 'watchtower'] as const;
export type ComparedCoreCapability = typeof sharedCoreCapabilities[number] | typeof comparedCoreDomains[number] | typeof comparedCoreExtensions[number];
export type CapabilityStatus = 'included' | 'separate' | 'unavailable';

/** Reads the hydrated package producer; never grants a capability or changes a quote. */
export function coreCapabilityStatus(packageId: CorePackageId, capability: ComparedCoreCapability): CapabilityStatus {
  if (capability === 'benchmarks' || capability === 'ask' || capability === 'recovery') return 'included';
  if (capability === 'watchtower') return packageAllowsWatchtower(packageId) ? 'separate' : 'unavailable';
  if (capability === 'foresight_action') return corePackages[packageId].includesForesight ? 'included' : 'separate';
  return corePackages[packageId].includesDomainModules.includes(capability as ModuleId) ? 'included' : 'unavailable';
}

export function coreCapabilityName(capability: ComparedCoreCapability, locale: PricingLocale): string {
  const copy = capabilityComparisonCopy[locale];
  if (capability === 'benchmarks' || capability === 'recovery' || capability === 'inventory' || capability === 'purchasing') return copy[capability];
  if (capability === 'ask') return 'Ask Sundae';
  if (capability === 'foresight_action') return 'Foresight';
  if (capability === 'watchtower') return 'Watchtower';
  return localizeModuleName(capability, locale);
}

export function crewCapabilityName(id: CrewSkuId, locale: PricingLocale): string {
  const copy = capabilityComparisonCopy[locale];
  const descriptions: Partial<Record<CrewSkuId, string>> = { crew_operations: copy.crewOperations, crew_payroll: copy.crewPayroll, crew_scheduling: copy.crewScheduling, crew_people_intelligence: copy.crewPeople };
  const description = descriptions[id];
  return description ? `${crewSkus[id].name} · ${description}` : crewSkus[id].name;
}
