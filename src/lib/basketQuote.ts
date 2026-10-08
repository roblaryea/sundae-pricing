import { corePackages, detectClientType } from '../data/pricing';
import { calculateFullPrice, applyDiscounts, resolveImplementationFee } from './pricingEngine';
import { computeCrewQuote } from './crewPricing';
import { crewSkus } from '../data/pricing';
import type { PricingIntent } from './pricingIntent';

/** One calculation for overview, review, PDF, demo and share. No eligibility grants. */
export function calculateBasketQuote(config: PricingIntent) {
  const profile = { type: detectClientType(config.locations), isEarlyAdopter: false, isFranchise: false, brandCount: 1, billingCycle: config.billingCycle };
  const core = config.layer === 'crew' ? null : calculateFullPrice({
    layer: 'core', corePackage: config.corePackage, locations: config.locations,
    addOns: config.addOns, watchtower: config.watchtowerModules,
    crossIntelligence: config.crossIntelligence === 'none' ? undefined : config.crossIntelligence,
    clientProfile: profile,
  });
  const crew = config.layer === 'core' ? null : computeCrewQuote(config.crewSkus, config.locations);
  const allowance = crew?.employeeAllowancePerLocation ?? 0;
  const rate = crew ? Math.max(0, ...crew.selectedSkus.map((id) => crewSkus[id].caps.perEmployeeOverageUsd)) : 0;
  const includedEmployees = allowance * config.locations;
  const excessEmployees = crew && config.employees !== null ? Math.max(0, config.employees - includedEmployees) : 0;
  // Employee expansions are not discounted; backend pools slots and charges once.
  const employeeOverage = excessEmployees * rate;
  const subtotal = (core?.subtotal ?? 0) + (crew?.monthly ?? 0);
  const net = applyDiscounts(subtotal, profile, config.locations);
  const monthly = Math.round((net.total + employeeOverage) * 100) / 100;
  const cadenceMonths = config.billingCycle === 'two_year_upfront' ? 24 : config.billingCycle === 'annual_upfront' ? 12 : config.billingCycle === 'annual_quarterly' ? 3 : 1;
  const implementation = resolveImplementationFee([...(core ? [core.implementation.classId] : []), ...(crew ? [crew.implementation.classId] : [])]);
  const specialistScoping = config.addOns.some((id) => id.startsWith('concept_'));
  const payrollNeedsScoping = Boolean(crew?.selectedSkus.includes('crew_payroll'));
  const enterprise = config.locations >= 250;
  const needsCrewSelection = config.layer !== 'core' && config.crewSkus.length === 0;
  return {
    core, crew, subtotal, monthly, annual: monthly * 12,
    averageMonthlyPerLocation: config.locations > 1 && !enterprise && !needsCrewSelection ? Math.round(monthly / config.locations * 100) / 100 : null,
    cadenceMonths, paymentAmount: monthly * cadenceMonths,
    discounts: net.discounts, implementation,
    includedEmployees, excessEmployees, employeeOverage, employeeRate: rate,
    workforceUnknown: Boolean(crew && config.employees === null), specialistScoping, payrollNeedsScoping,
    enterprise, needsCrewSelection,
    includedForesight: config.layer !== 'crew' && corePackages[config.corePackage].includesForesight === true,
    lines: [ ...(core?.breakdown ?? []), ...(crew?.lines.map((l) => ({ item: l.label, price: l.monthly })) ?? []) ],
  };
}
export type BasketQuote = ReturnType<typeof calculateBasketQuote>;
