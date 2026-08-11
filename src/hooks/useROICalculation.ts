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
   * Core DOMAIN modules whose savings apply. Under price book v1.7 every Core
   * package includes all eleven, so callers pass the full list — the field is
   * kept so the ROI model stays explicit about which domains it is crediting.
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
  // Labor Intelligence: 0.5% to 1.5% of revenue
  labor: {
    minPct: 0.005,  // 0.5%
    maxPct: 0.015,  // 1.5%
    midPct: 0.01,   // 1.0% midpoint
    tooltip: 'Reduces labor cost by 0.5-1.5% of revenue through better scheduling and productivity insights',
    label: 'Labor Optimization',
    icon: 'Users'
  },
  
  // Inventory Connect: 0.3% to 1.0% of revenue
  inventory: {
    minPct: 0.003,  // 0.3%
    maxPct: 0.01,   // 1.0%
    midPct: 0.0065, // 0.65% midpoint
    tooltip: 'Reduces food cost by 0.3-1.0% of revenue through waste reduction and recipe optimization',
    label: 'Food Cost Reduction',
    icon: 'Package'
  },
  
  // Purchasing Analytics: 0.2% to 0.8% of revenue
  purchasing: {
    minPct: 0.002,  // 0.2%
    maxPct: 0.008,  // 0.8%
    midPct: 0.005,  // 0.5% midpoint
    tooltip: 'Saves 0.2-0.8% of revenue through better supplier pricing and contract management',
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
  
  // Profit Intelligence: 0.2% to 0.8% of revenue
  profit: {
    minPct: 0.002,  // 0.2%
    maxPct: 0.008,  // 0.8%
    midPct: 0.005,  // 0.5% midpoint
    tooltip: 'Uncovers 0.2-0.8% of revenue in margin leakage and menu/mix optimization. Assumes execution on insights.',
    label: 'Profit Intelligence Uplift',
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
      hasReviewData = false
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
    // The published rates are expressed against revenue at a typical cost
    // ratio, so the ratio the buyer actually reports rescales the base. Bounded
    // so an extreme entry cannot run away with the answer.
    const scaleToActual = (reported: number | undefined, typical: number) => {
      if (!reported || reported <= 0) return 1;
      return Math.min(2, Math.max(0.5, reported / typical));
    };
    const laborBase = totalMonthlyRevenue * scaleToActual(laborPercent, TYPICAL_COST_RATIOS.labor);
    const foodBase = totalMonthlyRevenue * scaleToActual(foodCostPercent, TYPICAL_COST_RATIOS.food);
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
      totalSavings += addSavingsLine('purchasing', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.purchasing);
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
      totalSavings += addSavingsLine('profit', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.profit);
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
    
    const annualSavings = totalSavings * 12;
    
    // Calculate ROI
    let roi = platformCost > 0 ? totalSavings / platformCost : 0;
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
    const monthlyNet = totalSavings - platformCost;
    let paybackDays = 0;
    let paysBack = false;
    if (totalSavings > 0 && monthlyNet > 0) {
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
