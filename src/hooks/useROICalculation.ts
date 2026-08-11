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

const GUARDRAILS = {
  maxSavingsPerLocation: {
    labor: 2500,
    inventory: 1500,
    purchasing: 1500,
    reservations: 1500,
    marketing: 1000,
    profit: 1200,
    revenue: 500,
    delivery: 800,
    guest: 300
  },
  maxTotalSavingsPerLocation: 8000,
  maxROIMultiple: 15,
  minPaybackDays: 14, // Floor at 14 days to avoid unrealistic claims
};

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
      const minAmount = baseAmount * assumption.minPct;
      const maxAmount = baseAmount * assumption.maxPct;
      const midAmount = baseAmount * assumption.midPct;
      
      // Apply per-location cap
      const maxCap = GUARDRAILS.maxSavingsPerLocation[moduleId as keyof typeof GUARDRAILS.maxSavingsPerLocation] || 1000;
      const cappedAmount = Math.min(midAmount, maxCap * config.locations);
      
      const line: SavingsLineItem = {
        moduleId,
        category: moduleId,
        label: localizedLabel,
        icon: assumption.icon,
        amount: missingInput ? 0 : Math.round(cappedAmount),
        rangeMin: Math.round(minAmount),
        rangeMax: Math.round(Math.min(maxAmount, maxCap * config.locations)),
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
    
    const maxTotal = GUARDRAILS.maxTotalSavingsPerLocation * config.locations;
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
