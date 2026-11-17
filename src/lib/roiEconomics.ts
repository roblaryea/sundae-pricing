/** Economic payback accrues subscription expense monthly; it is not cash payback. */
export const DAYS_PER_MODEL_MONTH = 365 / 12;

export function nonNegativeFinite(value: number | undefined, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

export function moneyAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateRoiEconomics(
  monthlyFunding: number,
  monthlyCost: number,
  implementationCost: number | null,
) {
  const funding = moneyAmount(nonNegativeFinite(monthlyFunding));
  const cost = moneyAmount(nonNegativeFinite(monthlyCost));
  const setup = implementationCost === null || !Number.isFinite(implementationCost)
    ? null : moneyAmount(nonNegativeFinite(implementationCost));
  const monthlyNetBenefit = moneyAmount(funding - cost);
  const annualNetBenefit = moneyAmount(monthlyNetBenefit * 12);
  const paysBack = cost > 0 && monthlyNetBenefit > 0 && setup !== null;
  return {
    monthlyNetBenefit,
    annualNetBenefit,
    firstYearNetBenefit: setup === null ? null : moneyAmount(annualNetBenefit - setup),
    benefitCostMultiple: cost > 0 ? funding / cost : 0,
    roiPercent: cost > 0 ? (monthlyNetBenefit / cost) * 100 : 0,
    paysBack,
    paybackDays: paysBack ? Math.ceil((setup! / monthlyNetBenefit) * DAYS_PER_MODEL_MONTH) : null,
    implementationCost: setup,
  };
}
