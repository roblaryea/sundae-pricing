// ROI calculation hook for Sundae pricing configurator
// CONSERVATIVE + DEFENSIBLE assumptions based on module selection

import { useMemo } from 'react';

interface Configuration {
  layer: 'report' | 'core' | null;
  tier: 'lite' | 'plus' | 'pro' | 'enterprise' | null;
  locations: number;
  modules: string[];
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
  roiPercent: number;
  paybackDays: number;
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
  platformCost: number
): ROICalculation {
  return useMemo(() => {
    const { 
      monthlyRevenue, 
      // laborPercent and foodCostPercent are collected for context but savings are calculated as % of revenue
      laborPercent: _laborPercent, 
      foodCostPercent: _foodCostPercent, 
      marketingSpend = 0,
      deliveryRevenuePct = 0,
      hasReviewData = false
    } = inputs;
    void _laborPercent; void _foodCostPercent; // Collected for future use
    
    const totalMonthlyRevenue = monthlyRevenue * config.locations;
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
      const minAmount = baseAmount * assumption.minPct;
      const maxAmount = baseAmount * assumption.maxPct;
      const midAmount = baseAmount * assumption.midPct;
      
      // Apply per-location cap
      const maxCap = GUARDRAILS.maxSavingsPerLocation[moduleId as keyof typeof GUARDRAILS.maxSavingsPerLocation] || 1000;
      const cappedAmount = Math.min(midAmount, maxCap * config.locations);
      
      const line: SavingsLineItem = {
        moduleId,
        category: moduleId,
        label: assumption.label,
        icon: assumption.icon,
        amount: missingInput ? 0 : Math.round(cappedAmount),
        rangeMin: Math.round(minAmount),
        rangeMax: Math.round(Math.min(maxAmount, maxCap * config.locations)),
        tooltip: assumption.tooltip,
        isCountedInTotal: isCountedInTotal && !missingInput,
        requiresInput: assumption.requiresInput,
        missingInputMessage: missingInput ? assumption.missingInputMessage : undefined
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
    if (config.modules.includes('labor')) {
      totalSavings += addSavingsLine('labor', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.labor);
    }
    
    // Inventory Connect
    if (config.modules.includes('inventory')) {
      totalSavings += addSavingsLine('inventory', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.inventory);
    }
    
    // Purchasing Analytics
    if (config.modules.includes('purchasing')) {
      totalSavings += addSavingsLine('purchasing', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.purchasing);
    }
    
    // Reservations Intelligence
    if (config.modules.includes('reservations')) {
      totalSavings += addSavingsLine('reservations', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.reservations);
    }
    
    // Marketing Performance (requires marketing spend input)
    if (config.modules.includes('marketing')) {
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
    if (config.modules.includes('profit')) {
      totalSavings += addSavingsLine('profit', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.profit);
    }
    
    // Revenue Assurance
    if (config.modules.includes('revenue')) {
      totalSavings += addSavingsLine('revenue', totalMonthlyRevenue, SAVINGS_ASSUMPTIONS.revenue);
    }
    
    // Delivery Economics (requires delivery revenue % input)
    if (config.modules.includes('delivery')) {
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
    if (config.modules.includes('guest')) {
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
          guestLine.missingInputMessage = 'Potential upside (not counted in totals)';
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
    if (roi > GUARDRAILS.maxROIMultiple) {
      roi = GUARDRAILS.maxROIMultiple;
    }
    
    // Calculate payback with floor guardrail
    let paybackDays = platformCost > 0 && totalSavings > 0
      ? Math.ceil((platformCost / totalSavings) * 30)
      : 0;
    
    // Apply minimum payback floor to avoid unrealistic claims
    if (paybackDays > 0 && paybackDays < GUARDRAILS.minPaybackDays) {
      paybackDays = GUARDRAILS.minPaybackDays;
    }
    
    return {
      monthlySavings: Math.round(totalSavings),
      annualSavings: Math.round(annualSavings),
      roi: Math.round(roi * 10) / 10,
      roiPercent: Math.round(roi * 100),
      paybackDays,
      savingsLines,
      breakdowns,
      projectedImprovements
    };
  }, [config, inputs, platformCost]);
}

// Helper function to generate ROI description
export function generateROIDescription(roi: ROICalculation): string {
  if (roi.roi >= 10) {
    return `Strong ROI potential: ${roi.roi}x return with ${Math.ceil(roi.paybackDays / 7)}-week payback period.`;
  } else if (roi.roi >= 5) {
    return `Solid returns with ${roi.roi}x ROI and ${Math.ceil(roi.paybackDays / 7)}-week payback.`;
  } else if (roi.roi >= 2) {
    return `Positive ROI with measurable impact on your operations.`;
  } else if (roi.roi >= 1) {
    return `Value builds as you optimize operations over time.`;
  } else {
    return `Long-term investment in operational intelligence.`;
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
