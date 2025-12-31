// ROI calculation hook for Sundae pricing configurator

import { useMemo } from 'react';

// Define Configuration interface inline
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
}

export interface ROICalculation {
  monthlySavings: number;
  annualSavings: number;
  roi: number;
  roiPercent: number;
  paybackDays: number;
  breakdowns: {
    labor: number;
    food: number;
    marketing: number;
    purchasing: number;
    reservations: number;
  };
  projectedImprovements: {
    laborReduction: number;
    foodCostReduction: number;
    marketingEfficiency: number;
    purchasingSavings: number;
    tableUtilization: number;
  };
}

// Conservative improvement percentages based on module selection
const IMPROVEMENT_RATES = {
  // Base improvements from core platform
  core: {
    labor: 0.005, // 0.5% from visibility alone
    food: 0.003,  // 0.3% from visibility alone
  },
  // Module-specific improvements
  modules: {
    labor: {
      labor: 0.015, // 1.5% additional improvement
      efficiency: 0.02, // 2% efficiency gain
    },
    inventory: {
      food: 0.01, // 1% food cost reduction
      waste: 0.015, // 1.5% waste reduction
    },
    marketing: {
      efficiency: 0.15, // 15% marketing efficiency
      revenue: 0.02, // 2% revenue lift from better campaigns
    },
    purchasing: {
      cost: 0.02, // 2% purchasing savings (reduced from 3%)
      efficiency: 0.02, // 2% process efficiency
    },
    reservations: {
      incrementalCoversPerMonth: 100, // 100 extra covers per location/month
      averageCheck: 45, // $45 average check
      profitMarginOnIncremental: 0.25, // 25% profit margin
    }
  },
  // Watchtower improvements
  watchtower: {
    competitive: {
      revenue: 0.01, // 1% revenue from competitive positioning
      retention: 0.05, // 5% better customer retention
    },
    events: {
      labor: 0.005, // 0.5% better labor planning
      revenue: 0.01, // 1% revenue from event optimization (reduced)
    },
    trends: {
      menu: 0.01, // 1% from menu optimization (reduced)
      marketing: 0.1, // 10% marketing efficiency from trends
    }
  }
};

// Guardrails to prevent unrealistic ROI projections
const GUARDRAILS = {
  maxSavingsPerLocation: {
    labor: 2500,      // $2,500/mo per location max
    food: 1500,       // $1,500/mo per location max
    marketing: 1000,  // $1,000/mo per location max
    purchasing: 2000, // $2,000/mo per location max
    reservations: 1500, // $1,500/mo per location max
  },
  maxTotalSavingsPerLocation: 6000, // $6,000/mo per location max
  maxROIMultiple: 15,  // Cap ROI at 15x
  minPaybackDays: 14,  // Minimum 2 weeks payback
};

export function useROICalculation(
  config: Configuration,
  inputs: ROIInputs,
  platformCost: number
): ROICalculation {
  return useMemo(() => {
    const { monthlyRevenue, laborPercent, foodCostPercent, marketingSpend = 0, reservationNoShowRate = 0 } = inputs;
    
    // Calculate base costs
    const monthlyLaborCost = (monthlyRevenue * laborPercent / 100) * config.locations;
    const monthlyFoodCost = (monthlyRevenue * foodCostPercent / 100) * config.locations;
    const monthlyMarketingCost = marketingSpend * config.locations;
    
    // Initialize savings
    let laborSavings = 0;
    let foodSavings = 0;
    let marketingSavings = 0;
    let purchasingSavings = 0;
    let reservationSavings = 0;
    
    // Calculate improvement rates based on configuration
    let laborImprovement = 0;
    let foodImprovement = 0;
    let marketingImprovement = 0;
    let purchasingImprovement = 0;
    let tableUtilizationImprovement = 0;
    
    // Base improvements from core platform
    if (config.layer === 'core') {
      laborImprovement += IMPROVEMENT_RATES.core.labor;
      foodImprovement += IMPROVEMENT_RATES.core.food;
    }
    
    // Module-specific improvements
    if (config.modules.includes('labor')) {
      laborImprovement += IMPROVEMENT_RATES.modules.labor.labor;
      laborSavings = monthlyLaborCost * laborImprovement;
    } else {
      laborSavings = monthlyLaborCost * laborImprovement;
    }
    
    if (config.modules.includes('inventory')) {
      foodImprovement += IMPROVEMENT_RATES.modules.inventory.food;
      foodSavings = monthlyFoodCost * foodImprovement;
    } else {
      foodSavings = monthlyFoodCost * foodImprovement;
    }
    
    if (config.modules.includes('marketing') && marketingSpend > 0) {
      marketingImprovement = IMPROVEMENT_RATES.modules.marketing.efficiency;
      marketingSavings = monthlyMarketingCost * marketingImprovement;
      
      // Additional revenue lift from better marketing
      const revenueLift = monthlyRevenue * config.locations * IMPROVEMENT_RATES.modules.marketing.revenue;
      marketingSavings += revenueLift * 0.3; // Assume 30% margin on incremental revenue
    }
    
    if (config.modules.includes('purchasing')) {
      purchasingImprovement = IMPROVEMENT_RATES.modules.purchasing.cost;
      // Purchasing affects total COGS, estimated at 30% of revenue
      const monthlyPurchasing = monthlyRevenue * 0.3 * config.locations;
      purchasingSavings = monthlyPurchasing * purchasingImprovement;
    }
    
    if (config.modules.includes('reservations')) {
      // Calculate based on incremental covers with no-show realization
      const { incrementalCoversPerMonth, averageCheck, profitMarginOnIncremental } = IMPROVEMENT_RATES.modules.reservations;
      
      // Apply realization factor based on no-show rate
      // reservationNoShowRate is 0-100, so realizationFactor reduces expected covers
      const realizationFactor = 1 - (reservationNoShowRate / 100);
      const realizedIncrementalCovers = incrementalCoversPerMonth * realizationFactor;
      
      // Profit from realized incremental covers per location
      reservationSavings = realizedIncrementalCovers * averageCheck * profitMarginOnIncremental * config.locations;
      
      // Apply per-location cap
      const maxReservations = GUARDRAILS.maxSavingsPerLocation.reservations * config.locations;
      if (reservationSavings > maxReservations) {
        reservationSavings = maxReservations;
      }
      
      tableUtilizationImprovement = (realizedIncrementalCovers * averageCheck * profitMarginOnIncremental) / (monthlyRevenue || 1) * 100;
    }
    
    // Watchtower improvements
    if (config.watchtowerModules.includes('competitive') || config.watchtowerModules.includes('bundle')) {
      // Competitive positioning improvements
      const competitiveRevenue = monthlyRevenue * config.locations * IMPROVEMENT_RATES.watchtower.competitive.revenue;
      marketingSavings += competitiveRevenue * 0.3; // Margin on incremental revenue
    }
    
    if (config.watchtowerModules.includes('events') || config.watchtowerModules.includes('bundle')) {
      // Event optimization improvements
      laborImprovement += IMPROVEMENT_RATES.watchtower.events.labor;
      laborSavings = monthlyLaborCost * laborImprovement;
      
      const eventRevenue = monthlyRevenue * config.locations * IMPROVEMENT_RATES.watchtower.events.revenue;
      marketingSavings += eventRevenue * 0.3;
    }
    
    if (config.watchtowerModules.includes('trends') || config.watchtowerModules.includes('bundle')) {
      // Market trends improvements
      const menuOptimization = monthlyRevenue * config.locations * IMPROVEMENT_RATES.watchtower.trends.menu;
      foodSavings += menuOptimization * 0.15; // Food cost portion of menu optimization
      
      if (marketingSpend > 0) {
        marketingImprovement += IMPROVEMENT_RATES.watchtower.trends.marketing;
        marketingSavings = monthlyMarketingCost * marketingImprovement;
      }
    }
    
    // ═══════════════════════════════════════════════════════════════════
    // APPLY GUARDRAILS
    // ═══════════════════════════════════════════════════════════════════
    
    // Apply per-category caps
    const maxLabor = GUARDRAILS.maxSavingsPerLocation.labor * config.locations;
    if (laborSavings > maxLabor) laborSavings = maxLabor;
    
    const maxFood = GUARDRAILS.maxSavingsPerLocation.food * config.locations;
    if (foodSavings > maxFood) foodSavings = maxFood;
    
    const maxMarketing = GUARDRAILS.maxSavingsPerLocation.marketing * config.locations;
    if (marketingSavings > maxMarketing) marketingSavings = maxMarketing;
    
    const maxPurchasing = GUARDRAILS.maxSavingsPerLocation.purchasing * config.locations;
    if (purchasingSavings > maxPurchasing) purchasingSavings = maxPurchasing;
    
    // reservationSavings already capped above
    
    // Calculate totals after per-category caps
    let totalMonthlySavings = laborSavings + foodSavings + marketingSavings + purchasingSavings + reservationSavings;
    
    // Apply global cap: max total savings per location
    const maxTotalByLocation = GUARDRAILS.maxTotalSavingsPerLocation * config.locations;
    if (totalMonthlySavings > maxTotalByLocation) {
      // Scale down all categories proportionally
      const scaleFactor = maxTotalByLocation / totalMonthlySavings;
      laborSavings = Math.round(laborSavings * scaleFactor);
      foodSavings = Math.round(foodSavings * scaleFactor);
      marketingSavings = Math.round(marketingSavings * scaleFactor);
      purchasingSavings = Math.round(purchasingSavings * scaleFactor);
      reservationSavings = Math.round(reservationSavings * scaleFactor);
      totalMonthlySavings = maxTotalByLocation;
    }
    
    const totalAnnualSavings = totalMonthlySavings * 12;
    
    // Calculate ROI with guardrails
    let monthlyROI = platformCost > 0 ? totalMonthlySavings / platformCost : 0;
    
    // Cap ROI multiple
    if (monthlyROI > GUARDRAILS.maxROIMultiple) {
      monthlyROI = GUARDRAILS.maxROIMultiple;
    }
    
    const roiPercent = monthlyROI * 100;
    
    // Calculate payback period in days
    let paybackDays = platformCost > 0 && totalMonthlySavings > 0 
      ? Math.ceil((platformCost / totalMonthlySavings) * 30)
      : 0;
    
    // Apply minimum payback period
    if (paybackDays > 0 && paybackDays < GUARDRAILS.minPaybackDays) {
      paybackDays = GUARDRAILS.minPaybackDays;
    }
    
    return {
      monthlySavings: Math.round(totalMonthlySavings),
      annualSavings: Math.round(totalAnnualSavings),
      roi: Math.round(monthlyROI * 10) / 10,
      roiPercent: Math.round(roiPercent),
      paybackDays: paybackDays,
      breakdowns: {
        labor: Math.round(laborSavings),
        food: Math.round(foodSavings),
        marketing: Math.round(marketingSavings),
        purchasing: Math.round(purchasingSavings),
        reservations: Math.round(reservationSavings)
      },
      projectedImprovements: {
        laborReduction: Math.round(laborImprovement * 1000) / 10, // Convert to percentage
        foodCostReduction: Math.round(foodImprovement * 1000) / 10,
        marketingEfficiency: Math.round(marketingImprovement * 1000) / 10,
        purchasingSavings: Math.round(purchasingImprovement * 1000) / 10,
        tableUtilization: Math.round(tableUtilizationImprovement * 1000) / 10
      }
    };
  }, [config, inputs, platformCost]);
}

// Helper function to generate ROI description - Conservative messaging
export function generateROIDescription(roi: ROICalculation): string {
  if (roi.roi >= 10) {
    return `🚀 Strong ROI! ${roi.roi}x return with ${Math.ceil(roi.paybackDays / 7)}-week payback period.`;
  } else if (roi.roi >= 5) {
    return `📈 Solid returns with ${roi.roi}x ROI and ${Math.ceil(roi.paybackDays / 7)}-week payback.`;
  } else if (roi.roi >= 2) {
    return `✅ Positive ROI with measurable impact on your operations.`;
  } else if (roi.roi >= 1) {
    return `💡 Value builds as you optimize operations over time.`;
  } else {
    return `📊 Long-term investment in operational intelligence.`;
  }
}

// Helper to identify top savings categories
export function getTopSavingsCategories(breakdowns: ROICalculation['breakdowns']): string[] {
  const categories = Object.entries(breakdowns)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => {
      const labels: Record<string, string> = {
        labor: 'Labor Optimization',
        food: 'Food Cost Reduction',
        marketing: 'Marketing Efficiency',
        purchasing: 'Purchasing Savings',
        reservations: 'Table Utilization'
      };
      return labels[key] || key;
    });
  
  return categories;
}
