// ROI calculation hook for Sundae pricing configurator
// CONSERVATIVE + DEFENSIBLE assumptions based on module selection

import { useMemo } from 'react';
import { useLocale } from '../contexts/LocaleContext';
import { getRoiCopy, type PricingUiLocale, formatMessage } from '../lib/pricingUiCopy';

interface Configuration {
  layer: 'core' | null;
  corePackage: string | null;
  locations: number;
  /**
   * Core DOMAIN modules whose savings apply. Callers pass only the domains the
   * selected package grants, keeping the value case aligned with entitlement.
   */
  activeDomains: string[];
  watchtowerModules: string[];
}

/**
 * The revenue-per-location range the ROI step will model.
 *
 * The floor was $50,000. Core Foundation costs $1,195 for a single location and
 * breaks even at roughly $73,000 of monthly revenue per site, so every position
 * between the old floor and that break-even modelled a purchase that cannot pay
 * for itself — a dead end reachable in one drag of the first control on the
 * step. Raising the floor to $75,000 puts the whole slider inside the range
 * where a Core package is a rational purchase.
 *
 * This is a bound on what the SIMULATOR models, not a statement that smaller
 * operators are unwelcome: below this, the fitting products are Profit Snapshot
 * and Crew Starter rather than a Core package.
 */
export const MIN_MONTHLY_REVENUE_PER_LOCATION = 75_000;
export const MAX_MONTHLY_REVENUE_PER_LOCATION = 500_000;
/** Keeps the $100k default and both endpoints on valid native range values. */
export const REVENUE_SLIDER_STEP = 5_000;

/** Keeps a persisted or hand-passed figure inside the modelled range. */
export function clampMonthlyRevenue(value: number): number {
  // Only NaN is unorderable and has to fall back; the infinities clamp
  // correctly on their own, and sending +Infinity to the FLOOR would be the
  // wrong end of the range.
  if (Number.isNaN(value)) return MIN_MONTHLY_REVENUE_PER_LOCATION;
  return Math.min(
    MAX_MONTHLY_REVENUE_PER_LOCATION,
    Math.max(MIN_MONTHLY_REVENUE_PER_LOCATION, value)
  );
}

export interface ROIInputs {
  monthlyRevenue: number;
  laborPercent: number;
  foodCostPercent: number;
  marketingSpend?: number;
  reservationNoShowRate?: number;
  deliveryRevenuePct?: number; // % of revenue from delivery (0-100)
  hasReviewData?: boolean;     // Whether user has review/NPS data
  /** Monthly software spend the buyer confirms this quote would replace. */
  replaceableSystemsSpend?: number;
  /** Manual reporting/reconciliation effort across the whole estate. */
  manualReportingHoursPerWeek?: number;
  /** Fully loaded rate used only to value redeployable capacity. */
  loadedHourlyRate?: number;
}

export function calculateCostAvoidance(
  inputs: Pick<ROIInputs, 'replaceableSystemsSpend' | 'manualReportingHoursPerWeek' | 'loadedHourlyRate'>,
) {
  const replaceableSystemsSavings = Math.max(0, inputs.replaceableSystemsSpend || 0);
  const hours = Math.max(0, inputs.manualReportingHoursPerWeek || 0);
  const rate = Math.max(0, inputs.loadedHourlyRate || 0);
  return {
    replaceableSystemsSavings,
    capacityValue: hours * rate * (52 / 12),
    capacityFte: hours / 40,
  };
}

// Savings line item with metadata for tooltips
export interface SavingsLineItem {
  moduleId: string;
  category: string;
  label: string;
  icon: string;
  amount: number;
  rangeMin: number;
  rangeMax: number;
  tooltip: string;
  isCountedInTotal: boolean;
  requiresInput?: string; // Input required to show this line
  missingInputMessage?: string;
}

interface SavingsAssumption {
  minPct: number;
  maxPct: number;
  midPct: number;
  tooltip: string;
  label: string;
  icon: string;
  marginOnLift?: number;
  requiresInput?: string;
  missingInputMessage?: string;
  isSoftBenefit?: boolean;
}

export interface ROICalculation {
  monthlySavings: number;
  annualSavings: number;
  /** Operational recovery plus buyer-entered replaceable system spend. */
  monthlyFunding: number;
  annualFunding: number;
  /** Buyer-entered cashable cost avoidance included in the funding case. */
  replaceableSystemsSavings: number;
  /** Redeployable time value, disclosed separately and never added to ROI. */
  capacityValue: number;
  capacityFte: number;
  roi: number;
  /** True when the published cap clipped the result — render as "Nx+". */
  roiCapped: boolean;
  roiPercent: number;
  paybackDays: number;
  /** False when the monthly saving never overtakes the monthly cost. */
  paysBack: boolean;
  savingsLines: SavingsLineItem[];
  breakdowns: Record<string, number>;
  projectedImprovements: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════
// CONSERVATIVE ASSUMPTION RANGES (Single Source of Truth)
// ═══════════════════════════════════════════════════════════════════

export const SAVINGS_ASSUMPTIONS: Record<string, SavingsAssumption> = {
  // Labor Intelligence: the published 1-3% of labour cost.
  labor: {
    minPct: 0.01,
    maxPct: 0.03,
    midPct: 0.02,
    tooltip: 'Models 1-3% of the labour-cost base through scheduling and productivity improvements',
    label: 'Labor Optimization',
    icon: 'Users'
  },
  
  // Inventory Connect: the published 0.5-2% of food cost.
  inventory: {
    minPct: 0.005,
    maxPct: 0.02,
    midPct: 0.0125,
    tooltip: 'Models 0.5-2% of the food-cost base through waste and recipe controls',
    label: 'Food Cost Reduction',
    icon: 'Package'
  },
  
  // Purchasing Analytics: the published 2-5% of purchasing spend. Food cost
  // is used as the visible proxy until the buyer supplies a separate spend base.
  purchasing: {
    minPct: 0.02,
    maxPct: 0.05,
    midPct: 0.035,
    tooltip: 'Models 2-5% of purchasing spend; food cost is the planning proxy until purchasing spend is supplied',
    label: 'Purchasing Savings',
    icon: 'ShoppingCart'
  },
  
  // Reservations Intelligence: 0.5% to 2.0% revenue lift
  reservations: {
    minPct: 0.005,  // 0.5%
    maxPct: 0.02,   // 2.0%
    midPct: 0.0125, // 1.25% midpoint
    marginOnLift: 0.25, // 25% margin on incremental revenue
    tooltip: 'Revenue uplift of 0.5-2.0% through improved table utilization. Assumes demand exists.',
    label: 'Table Utilization',
    icon: 'CalendarDays'
  },
  
  // Marketing Performance: 5% to 15% efficiency of marketing spend
  marketing: {
    minPct: 0.05,   // 5%
    maxPct: 0.15,   // 15%
    midPct: 0.10,   // 10% midpoint
    tooltip: 'Improves marketing efficiency by 5-15% of marketing spend through better attribution and targeting',
    label: 'Marketing Efficiency',
    icon: 'Megaphone',
    requiresInput: 'marketingSpend',
    missingInputMessage: 'Add marketing spend to estimate savings'
  },
  
  // Profit Intelligence measures and attributes the recovery producers above.
  // It is deliberately not assigned a second generic uplift in the total.
  profit: {
    minPct: 0,
    maxPct: 0,
    midPct: 0,
    tooltip: 'Measures and attributes the recovery lines above; no separate uplift is added to avoid double counting',
    label: 'Profit Intelligence Measurement',
    icon: 'DollarSign'
  },
  
  // Revenue Assurance: 0.05% to 0.25% of revenue (VERY conservative)
  revenue: {
    minPct: 0.0005, // 0.05%
    maxPct: 0.0025, // 0.25%
    midPct: 0.0015, // 0.15% midpoint
    tooltip: 'Recovers 0.05-0.25% of revenue from voids, comps, and discount leakage. Depends on baseline leakage.',
    label: 'Revenue Leakage Recovery',
    icon: 'Shield'
  },
  
  // Delivery Economics: 0.2% to 0.8% of DELIVERY revenue
  delivery: {
    minPct: 0.002,  // 0.2%
    maxPct: 0.008,  // 0.8%
    midPct: 0.005,  // 0.5% midpoint
    tooltip: 'Saves 0.2-0.8% of delivery revenue through commission optimization and pricing parity',
    label: 'Delivery Margin Protection',
    icon: 'Bike',
    requiresInput: 'deliveryRevenuePct',
    missingInputMessage: 'Add delivery mix % to estimate savings'
  },
  
  // Guest Experience: 0.05% to 0.2% of revenue (soft benefit)
  guest: {
    minPct: 0.0005, // 0.05%
    maxPct: 0.002,  // 0.2%
    midPct: 0.001,  // 0.1% midpoint (conservative)
    tooltip: 'Qualitative benefit from improved reviews and guest satisfaction. Conservative estimate unless review data provided.',
    label: 'Reputation & Retention Lift',
    icon: 'Star',
    isSoftBenefit: true // Show but don't count unless input exists
  }
};

// Guardrails to prevent unrealistic ROI projections
/**
 * The cost ratios the published savings rates are expressed against. A buyer
 * reporting a different ratio rescales the base those rates apply to.
 */
export const TYPICAL_COST_RATIOS = {
  labor: 30,
  food: 30,
} as const;

/**
 * The revenue-per-location the original flat-dollar ceilings were calibrated
 * at. Kept explicit so the conversion below is auditable rather than magic.
 */
export const GUARDRAIL_REFERENCE_REVENUE = 100_000;

export const GUARDRAILS = {
  /**
   * Plausibility ceilings as a SHARE OF REVENUE per location, not flat dollars.
   *
   * These were absolute dollars — labour $2,500, inventory $1,500, a total of
   * $8,000 — inside a model whose every line is a percentage of revenue. One
   * flat $8,000 is 16% of revenue at a $50k/month site and 1.6% at a $500k/month
   * site: a single constant enforcing two irreconcilable standards of
   * plausibility. Above roughly $250k/site the ceilings stopped being guardrails
   * and became the model — at $400k/site every per-line ceiling bound on 100% of
   * reachable configurations, and the $8,000 total bound on Core Performance
   * ALONE, so the most expensive package was the only one the guardrail
   * penalised. A $6M site was silently modelled at half the rate of a $1.2M site
   * with no evidentiary basis for the difference.
   *
   * Each share is the old dollar figure over the $100k/location month it was
   * calibrated at, so nothing moves for a typical site — the ceilings simply
   * stop tightening as the operator gets larger.
   */
  maxSavingsShareOfRevenue: {
    labor: 0.025,
    inventory: 0.015,
    purchasing: 0.015,
    reservations: 0.015,
    marketing: 0.01,
    profit: 0.012,
    revenue: 0.005,
    delivery: 0.008,
    guest: 0.003
  },
  maxTotalShareOfRevenue: 0.08,
  maxROIMultiple: 15,
  minPaybackDays: 14, // Floor at 14 days to avoid unrealistic claims
};

/**
 * A guardrail exists to catch an implausible INPUT, never to contradict the
 * evidence. The published min/mid/max band already IS the plausibility bound,
 * so a ceiling is only ever allowed to bite ABOVE that band's own maximum.
 * Without this floor, re-denominating against revenue would newly clip lines
 * measured on a different base — marketing is a share of marketing SPEND, so a
 * site spending heavily against modest revenue would have had a legitimate,
 * in-band figure cut by a revenue-denominated ceiling.
 */
export function plausibilityCeiling(
  moduleId: string,
  monthlyRevenuePerLocation: number,
  locations: number,
  bandMaximum: number
): number {
  const share =
    GUARDRAILS.maxSavingsShareOfRevenue[
      moduleId as keyof typeof GUARDRAILS.maxSavingsShareOfRevenue
    ];
  if (share === undefined) {
    // A silent `|| 1000` fallback meant any newly-added domain inherited an
    // arbitrary ceiling nobody chose. Fail loudly instead.
    throw new Error(
      `No plausibility ceiling defined for savings domain "${moduleId}". ` +
        `Add one to GUARDRAILS.maxSavingsShareOfRevenue with a stated basis.`
    );
  }
  return Math.max(share * monthlyRevenuePerLocation * locations, bandMaximum);
}

/**
 * How much of a single site's improvement headroom a larger estate still has.
 *
 * The recovery rates are GAP-TO-BEST-PRACTICE figures: the NRA data behind the
 * labour line is the distance between the median operator and the profitable
 * one. Applying that gap flat, per location, says a 200-site group has exactly
 * the same headroom as an independent — which contradicts how it became a
 * 200-site group. A national chain already runs scheduling standards, already
 * has category managers, and already negotiates national supply contracts.
 *
 * Left flat, savings scaled linearly while the marginal price bands drove cost
 * per location from $1,195 down to $119, so the modelled return climbed with
 * every site added: 1.8x at one location, 13.3x at fifty, 18.1x at two hundred.
 * The 15x ceiling was invented to stop that number being printed — it truncated
 * the symptom at exactly the estate sizes where the deals are largest and the
 * scrutiny is hardest.
 *
 * Decaying the headroom fixes the cause. A large operator keeps HALF the
 * headroom of an independent, never zero, because scale brings its own losses
 * (more sites to keep consistent, more supplier lines to police).
 *
 * CALIBRATION IS A COMMERCIAL JUDGEMENT, not a published finding. The SHAPE is
 * defensible — headroom falls as maturity rises, with a floor — but the two
 * constants are ours, and are deliberately set to the conservative side:
 *
 *     1 site   1.00      10 sites 0.77      50 sites 0.61      200+ 0.50
 *
 * Reviewed and approved by the founder on 2026-08-13. That approval is what
 * these numbers rest on — there is no published source for them, and there is
 * not meant to be. Anyone changing them is changing a commercial position, not
 * correcting an error, so raise it rather than tuning it: a steeper curve
 * understates large estates, a shallower one puts the modelled return back
 * against the 15x ceiling that this decay exists to make unnecessary.
 */
export const MATURITY_DECAY_PER_LOG_UNIT = 0.1;
export const MATURITY_FLOOR = 0.5;

export function estateMaturityFactor(locations: number): number {
  const units = Math.max(1, Math.floor(locations));
  return Math.max(MATURITY_FLOOR, 1 - MATURITY_DECAY_PER_LOG_UNIT * Math.log(units));
}

export function useROICalculation(
  config: Configuration,
  inputs: ROIInputs,
  platformCost: number,
  /** One-time implementation charged by the same quote. */
  oneTimeCost = 0
): ROICalculation {
  const { locale } = useLocale();

  return useMemo(() => {
    const copy = getRoiCopy(locale as PricingUiLocale);
    const assumptionLabels = copy.assumptionLabels as Record<string, string>;
    const tooltips = copy.tooltips as Record<string, string>;
    const missingInputs = copy.missingInput as Record<string, string>;
    const {
      monthlyRevenue,
      laborPercent,
      foodCostPercent,
      marketingSpend = 0,
      deliveryRevenuePct = 0,
      hasReviewData = false,
      replaceableSystemsSpend = 0,
      manualReportingHoursPerWeek = 0,
      loadedHourlyRate = 0,
    } = inputs;

    const totalMonthlyRevenue = monthlyRevenue * config.locations;

    // Labour and food-cost savings scale with the SPEND they optimise, not with
    // revenue alone.
    //
    // Both sliders were read and then explicitly discarded ("Collected for
    // future use"), so dragging "Current Labor Cost %" from 20% to 40% changed
    // nothing at all — which is the first thing a numerate buyer tries, and the
    // fastest way to lose them. An operator running 40% labour has materially
    // more labour to optimise than one running 20%, and a model that cannot see
    // that is not modelling their business.
    //
    const laborBase = totalMonthlyRevenue * (Math.min(60, Math.max(0, laborPercent || TYPICAL_COST_RATIOS.labor)) / 100);
    const foodBase = totalMonthlyRevenue * (Math.min(60, Math.max(0, foodCostPercent || TYPICAL_COST_RATIOS.food)) / 100);
    const savingsLines: SavingsLineItem[] = [];
    const breakdowns: Record<string, number> = {};
    const projectedImprovements: Record<string, number> = {};
    
    // Helper to calculate and add savings line
    const addSavingsLine = (
      moduleId: string,
      baseAmount: number,
      assumption: SavingsAssumption,
      isCountedInTotal: boolean = true,
      missingInput: boolean = false
    ) => {
      const localizedLabel = assumptionLabels[moduleId] ?? assumption.label;
      const localizedTooltip = tooltips[moduleId] ?? assumption.tooltip;
      const localizedMissingInput = missingInputs[moduleId] ?? assumption.missingInputMessage;
      // A REVENUE UPLIFT is not a saving. Where an assumption declares
      // `marginOnLift`, only that share of the incremental revenue reaches the
      // operator's bottom line.
      //
      // `marginOnLift: 0.25` was declared on the reservations line and applied
      // NOWHERE — the type carried it, the assumption set it, and no code ever
      // read it. So a 0.5-2.0% table-utilisation uplift was counted as if every
      // incremental dollar were profit, on the single largest line in the model
      // (29% of total savings on a default configuration). It overstated that
      // line four-fold.
      const margin = assumption.marginOnLift ?? 1;
      const minAmount = baseAmount * assumption.minPct * margin;
      const maxAmount = baseAmount * assumption.maxPct * margin;
      const midAmount = baseAmount * assumption.midPct * margin;
      
      // Apply the per-location plausibility ceiling. It is a share of revenue,
      // and it can never cut below the top of this line's own evidenced band.
      const maxCap = plausibilityCeiling(moduleId, monthlyRevenue, config.locations, maxAmount);
      const cappedAmount = Math.min(midAmount, maxCap);
      
      const line: SavingsLineItem = {
        moduleId,
        category: moduleId,
        label: localizedLabel,
        icon: assumption.icon,
        amount: missingInput ? 0 : Math.round(cappedAmount),
        rangeMin: Math.round(minAmount),
        rangeMax: Math.round(Math.min(maxAmount, maxCap)),
        tooltip: localizedTooltip,
        isCountedInTotal: isCountedInTotal && !missingInput,
        requiresInput: assumption.requiresInput,
        missingInputMessage: missingInput ? localizedMissingInput : undefined
      };
      
      savingsLines.push(line);
      breakdowns[moduleId] = line.amount;
      projectedImprovements[moduleId] = assumption.midPct * 100;
      
      return line.isCountedInTotal ? line.amount : 0;
    };
    
    let totalSavings = 0;
    
    // ═══════════════════════════════════════════════════════════════════
    // CALCULATE SAVINGS FOR EACH SELECTED MODULE
    // ═══════════════════════════════════════════════════════════════════
    
    // Labor Intelligence
    if (config.activeDomains.includes('labor')) {
      totalSavings += addSavingsLine('labor', laborBase, SAVINGS_ASSUMPTIONS.labor);
    }
    
    // Inventory Connect
    if (config.activeDomains.includes('inventory')) {
      totalSavings += addSavingsLine('inventory', foodBase, SAVINGS_ASSUMPTIONS.inventory);
    }
    
    // Purchasing Analytics
    if (config.activeDomains.includes('purchasing')) {
      totalSavings += addSavingsLine('purchasing', foodBase, SAVINGS_ASSUMPTIONS.purchasing);
    }
    
    // Reservations Intelligence
    if (config.activeDomains.includes('reservations')) {
      totalSavings += addSavingsLine('reservations', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.reservations);
    }
    
    // Marketing Performance (requires marketing spend input)
    if (config.activeDomains.includes('marketing')) {
      const hasMarketingInput = marketingSpend > 0;
      const marketingBase = marketingSpend * config.locations;
      totalSavings += addSavingsLine(
        'marketing', 
        marketingBase, 
        SAVINGS_ASSUMPTIONS.marketing,
        true,
        !hasMarketingInput // Missing input flag
      );
    }
    
    // Profit Intelligence
    if (config.activeDomains.includes('profit')) {
      addSavingsLine('profit', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.profit, false, true);
      const profitLine = savingsLines.find((line) => line.moduleId === 'profit');
      if (profitLine) {
        profitLine.missingInputMessage = 'Enables measurement; not added again';
      }
    }
    
    // Revenue Assurance
    if (config.activeDomains.includes('revenue')) {
      totalSavings += addSavingsLine('revenue', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.revenue);
    }
    
    // Delivery Economics (requires delivery revenue % input)
    if (config.activeDomains.includes('delivery')) {
      const hasDeliveryInput = deliveryRevenuePct > 0;
      const deliveryRevenue = totalMonthlyRevenue * (deliveryRevenuePct / 100);
      totalSavings += addSavingsLine(
        'delivery',
        deliveryRevenue,
        SAVINGS_ASSUMPTIONS.delivery,
        true,
        !hasDeliveryInput
      );
    }
    
    // Guest Experience (soft benefit unless review data exists)
    if (config.activeDomains.includes('guest')) {
      const countInTotal = hasReviewData;
      totalSavings += addSavingsLine(
        'guest',
        totalMonthlyRevenue,
        SAVINGS_ASSUMPTIONS.guest,
        countInTotal,
        false
      );
      // Update the line to show as soft benefit if not counted
      if (!countInTotal) {
        const guestLine = savingsLines.find(l => l.moduleId === 'guest');
        if (guestLine) {
          guestLine.missingInputMessage = missingInputs.guest ?? copy.potentialUpside;
          guestLine.isCountedInTotal = false;
        }
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // APPLY GLOBAL GUARDRAILS
    // ═══════════════════════════════════════════════════════════════════
    
    // A share of revenue, so it scales with the estate instead of acting as a
    // second flat haircut on top of the per-line ceilings. As a flat $8,000 it
    // bound on Core Performance and on no other package — the ladder's top rung
    // was the only one the global guardrail punished.
    const maxTotal = GUARDRAILS.maxTotalShareOfRevenue * totalMonthlyRevenue;
    if (totalSavings > maxTotal) {
      const scaleFactor = maxTotal / totalSavings;
      totalSavings = maxTotal;
      // Scale all counted lines proportionally
      savingsLines.forEach(line => {
        if (line.isCountedInTotal && line.amount > 0) {
          line.amount = Math.round(line.amount * scaleFactor);
          breakdowns[line.moduleId] = line.amount;
        }
      });
    }
    
    // Recovery decays with estate maturity; buyer-entered cash does NOT.
    //
    // Applied here rather than per line so every line moves together and the
    // breakdown still reconciles to the total. Cost avoidance is excluded on
    // purpose: a replaceable subscription the buyer named is real money at any
    // estate size, and discounting it would be inventing a haircut.
    const maturity = estateMaturityFactor(config.locations);
    if (maturity < 1) {
      totalSavings = Math.round(totalSavings * maturity);
      savingsLines.forEach((line) => {
        if (line.isCountedInTotal && line.amount > 0) {
          line.amount = Math.round(line.amount * maturity);
          breakdowns[line.moduleId] = line.amount;
        }
      });
    }

    const annualSavings = totalSavings * 12;
    // Only a number the buyer supplies as genuinely replaceable is cashable.
    // Manual time is shown separately because time does not become cash unless
    // the operator can redeploy it or avoid a planned hire.
    const { replaceableSystemsSavings, capacityValue, capacityFte } = calculateCostAvoidance({
      replaceableSystemsSpend,
      manualReportingHoursPerWeek,
      loadedHourlyRate,
    });
    const monthlyFunding = totalSavings + replaceableSystemsSavings;
    const annualFunding = monthlyFunding * 12;
    
    // Calculate ROI
    let roi = platformCost > 0 ? monthlyFunding / platformCost : 0;
    // The cap keeps the headline from claiming an absurd multiple, but it also
    // makes every strong configuration print the SAME "15x" — so the number
    // stops discriminating between packages and reads as a constant rather than
    // a result. Flag it so the UI can show it as a floor.
    let roiCapped = false;
    if (roi > GUARDRAILS.maxROIMultiple) {
      roi = GUARDRAILS.maxROIMultiple;
      roiCapped = true;
    }
    
    // Payback must clear the ONE-TIME cost as well as the recurring one.
    //
    // This computed `platformCost / totalSavings * 30` — how many days of
    // savings cover a single month of subscription — and ignored the
    // implementation fee the same quote charges, which is the largest one-time
    // line in the deal ($1,500 to $12,500). A CFO reconciling the two screens
    // would find the payback claim excluded a cost the quote itself listed.
    //
    // The honest form solves for the day the cumulative saving overtakes the
    // cumulative cost: implementation + monthlyCost x (d/30) = savings x (d/30),
    // so d = 30 x implementation / (savings - monthlyCost). If the monthly
    // saving does not exceed the monthly cost, it never pays back — and the
    // model must be able to say so.
    const monthlyNet = monthlyFunding - platformCost;
    let paybackDays = 0;
    let paysBack = false;
    if (monthlyFunding > 0 && monthlyNet > 0) {
      paysBack = true;
      paybackDays = oneTimeCost > 0
        ? Math.ceil((oneTimeCost / monthlyNet) * 30)
        : GUARDRAILS.minPaybackDays;
    }

    // The floor stays: it exists to stop the model claiming a payback faster
    // than anyone could actually realise, and it makes the answer WORSE, not
    // better.
    if (paysBack && paybackDays < GUARDRAILS.minPaybackDays) {
      paybackDays = GUARDRAILS.minPaybackDays;
    }
    
    return {
      monthlySavings: Math.round(totalSavings),
      annualSavings: Math.round(annualSavings),
      monthlyFunding: Math.round(monthlyFunding),
      annualFunding: Math.round(annualFunding),
      replaceableSystemsSavings: Math.round(replaceableSystemsSavings),
      capacityValue: Math.round(capacityValue),
      capacityFte: Math.round(capacityFte * 100) / 100,
      roi: Math.round(roi * 10) / 10,
      roiCapped,
      roiPercent: Math.round(roi * 100),
      paybackDays,
      paysBack,
      savingsLines,
      breakdowns,
      projectedImprovements
    };
  }, [config, inputs, locale, platformCost, oneTimeCost]);
}

// Helper function to generate ROI description
export function generateROIDescription(
  roi: ROICalculation,
  locale: PricingUiLocale = 'en'
): string {
  const copy = getRoiCopy(locale);
  const weeks = Math.ceil(roi.paybackDays / 7);
  if (roi.roi >= 10) {
    return formatMessage(copy.roiDescriptions.strong, { roi: roi.roi, weeks });
  } else if (roi.roi >= 5) {
    return formatMessage(copy.roiDescriptions.solid, { roi: roi.roi, weeks });
  } else if (roi.roi >= 2) {
    return copy.roiDescriptions.positive;
  } else if (roi.roi >= 1) {
    return copy.roiDescriptions.value;
  } else {
    return copy.roiDescriptions.longTerm;
  }
}

// Get savings categories that have non-zero amounts
export function getTopSavingsCategories(savingsLines: SavingsLineItem[]): string[] {
  return savingsLines
    .filter(line => line.amount > 0 && line.isCountedInTotal)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map(line => line.label);
}
