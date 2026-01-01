// ═══════════════════════════════════════════════════════════════════════════
// WATCHTOWER VALUE SCENARIOS
// These are defensible examples, not guaranteed monthly returns
// ═══════════════════════════════════════════════════════════════════════════

export const WATCHTOWER_VALUE_SCENARIOS = {
  
  competitive: {
    id: 'competitive',
    name: 'Competitive Intelligence',
    icon: '🔍',
    tagline: 'Know what your competitors are doing before your customers do',
    
    // Specific, defensible scenarios
    scenarios: [
      {
        id: 'pricing-follow',
        title: 'Pricing Optimization',
        description: 'Spot competitor price increase, follow on portion of menu',
        calculation: (revenuePerLocation: number) => {
          // CONSERVATIVE: 3% price increase on 20% of menu, happens 1-2x/year
          const priceIncrease = 0.03;
          const menuPortion = 0.20;
          const annualLift = revenuePerLocation * 12 * priceIncrease * menuPortion;
          return {
            impact: Math.round(annualLift),
            explanation: `${(priceIncrease * 100).toFixed(0)}% increase on ${(menuPortion * 100).toFixed(0)}% of menu`
          };
        },
        frequency: '1-2x per year',
        confidence: 'high'  // This is measurable
      },
      {
        id: 'share-protection',
        title: 'Market Share Protection',
        description: 'Early warning on competitive threats',
        calculation: (revenuePerLocation: number) => {
          // CONSERVATIVE: 1% share protection (not 2%), 30% probability
          const shareLossPrevented = 0.01;
          const probability = 0.3;  // 30% chance this happens in a year
          const annualValue = revenuePerLocation * 12 * shareLossPrevented * probability;
          return {
            impact: Math.round(annualValue),
            explanation: `Preventing ${(shareLossPrevented * 100).toFixed(0)}% share erosion`
          };
        },
        frequency: 'When threats emerge',
        confidence: 'medium'  // Harder to attribute
      },
      {
        id: 'menu-intel',
        title: 'Menu Intelligence',
        description: 'Spot trending item at competitor — fast-follow strategy',
        calculation: (revenuePerLocation: number) => {
          const newItemShare = 0.03;  // New item becomes 3% of sales
          const annualValue = revenuePerLocation * 12 * newItemShare * 0.5;  // 50% attribution
          return {
            impact: Math.round(annualValue),
            explanation: 'New item capturing market demand'
          };
        },
        frequency: '2-4x per year',
        confidence: 'medium'
      }
    ],
    
    // REVISED: More conservative annual range (not monthly!)
    annualValueRange: {
      perLocation: {
        low: 5000,    // $5K per location per year (was $15K)
        mid: 10000,   // $10K (was $30K)
        high: 15000   // $15K (was $50K)
      }
    },
    
    // "One win" threshold - one scenario that pays for the module
    oneWinExample: {
      description: 'Following one competitor price increase',
      typicalValue: 7000
    }
  },
  
  events: {
    id: 'events',
    name: 'Event & Calendar Signals',
    icon: '📅',
    tagline: 'Never be caught understaffed for a big night again',
    
    scenarios: [
      {
        id: 'major-event',
        title: 'Major Event Preparation',
        description: 'Optimal staffing and inventory for local events',
        calculation: (revenuePerLocation: number) => {
          const dailyRevenue = revenuePerLocation / 30;
          const demandSpike = 0.30;  // 30% spike (not 40%)
          const captureImprovement = 0.15;  // Capture 15% more (not 25%)
          const eventsPerYear = 8;  // 8 major events (not 12)
          const annualValue = dailyRevenue * demandSpike * captureImprovement * eventsPerYear;
          return {
            impact: Math.round(annualValue),
            explanation: `${eventsPerYear} major events, capturing more demand`
          };
        },
        frequency: '8-15 events per year',
        confidence: 'high'  // Easy to measure
      },
      {
        id: 'staffing-optimization',
        title: 'Staffing Optimization',
        description: 'Right staff levels for predicted demand',
        calculation: (revenuePerLocation: number) => {
          const laborPercent = 0.30;
          const laborCost = revenuePerLocation * 12 * laborPercent;
          const efficiencyGain = 0.01;  // 1% labor efficiency (not 2%)
          const eventDaysPercent = 0.10;  // 10% of days (not 15%)
          const annualValue = laborCost * efficiencyGain * eventDaysPercent;
          return {
            impact: Math.round(annualValue),
            explanation: 'Labor efficiency on high-demand days'
          };
        },
        frequency: 'Ongoing',
        confidence: 'medium'
      },
      {
        id: 'inventory-prep',
        title: 'Inventory Preparation',
        description: 'Stock up before demand spike — no 86\'d items, less waste',
        calculation: (_revenuePerLocation: number) => {
          const avgCheck = 45;
          const missedTickets = 5;  // 5 tickets lost to stockouts per event
          const eventsPerYear = 12;
          const annualValue = avgCheck * missedTickets * eventsPerYear;
          return {
            impact: Math.round(annualValue),
            explanation: 'Preventing stockout losses'
          };
        },
        frequency: '8-15 events per year',
        confidence: 'medium'
      }
    ],
    
    // REVISED: More conservative
    annualValueRange: {
      perLocation: {
        low: 3000,    // $3K (was $10K)
        mid: 6000,    // $6K (was $20K)
        high: 10000   // $10K (was $35K)
      }
    },
    
    oneWinExample: {
      description: 'Perfect preparation for 2 major events',
      typicalValue: 5000
    }
  },
  
  trends: {
    id: 'trends',
    name: 'Market Trends',
    icon: '📈',
    tagline: 'See where the market is going before your competitors do',
    
    scenarios: [
      {
        id: 'menu-trend',
        title: 'Trend-Informed Menu Addition',
        description: 'Add trending item that captures demand',
        calculation: (revenuePerLocation: number) => {
          const newItemShare = 0.015;  // 1.5% of sales (not 2.5%)
          const successRate = 0.50;  // 50% success (not 60%)
          const attemptsPerYear = 2;  // 2 attempts (not 3)
          const annualValue = revenuePerLocation * 12 * newItemShare * successRate * attemptsPerYear / 3;
          return {
            impact: Math.round(annualValue),
            explanation: 'Successful trend-informed menu items'
          };
        },
        frequency: '2-4 attempts per year',
        confidence: 'medium'
      },
      {
        id: 'concept-validation',
        title: 'Concept Validation',
        description: 'Data-informed decision on new location or concept',
        calculation: (_revenuePerLocation: number) => {
          // This is about avoiding a bad decision, not monthly value
          // Value is probabilistic: 20% chance of avoiding $100K mistake
          const mistakeAvoided = 100000;
          const probability = 0.10;  // 10% chance this saves you
          const annualValue = mistakeAvoided * probability;
          return {
            impact: Math.round(annualValue),
            explanation: 'Risk reduction on strategic decisions'
          };
        },
        frequency: 'When expanding',
        confidence: 'low'  // Highly variable
      },
      {
        id: 'demographic-shift',
        title: 'Demographic Shift Awareness',
        description: 'Adapt to changing neighborhood before revenue drops',
        calculation: (revenuePerLocation: number) => {
          const adaptationLift = 0.01;  // 1% better performance from adaptation
          const annualValue = revenuePerLocation * 12 * adaptationLift;
          return {
            impact: Math.round(annualValue),
            explanation: 'Staying relevant to evolving market'
          };
        },
        frequency: 'Ongoing',
        confidence: 'low'
      }
    ],
    
    // REVISED: More conservative
    annualValueRange: {
      perLocation: {
        low: 2000,    // $2K (was $5K)
        mid: 5000,    // $5K (was $12K)
        high: 8000    // $8K (was $25K)
      }
    },
    
    oneWinExample: {
      description: 'One successful trend-informed menu item',
      typicalValue: 4000
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BUNDLE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// REVISED BUNDLE TOTALS - More Conservative
// ═══════════════════════════════════════════════════════════════════════════

export const WATCHTOWER_BUNDLE_VALUE = {
  annualValueRange: {
    perLocation: {
      low: 10000,   // $10K (was $30K) - Sum of lows: $5K + $3K + $2K
      mid: 21000,   // $21K (was $62K) - Sum of mids: $10K + $6K + $5K
      high: 33000   // $33K (was $110K) - Sum of highs: $15K + $10K + $8K
    }
  },
  
  // For 10 locations:
  // Low: $100,000 (was $300,000)
  // Mid: $210,000 (was $620,000)
  // High: $330,000 (was $1,100,000)
  
  // Key message: one win per module pays for the year
  oneWinMessage: 'One competitive insight, two well-prepared events, and one successful trend item pays for Watchtower 2-3x over'
};

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface WatchtowerValueResult {
  modules: {
    id: string;
    name: string;
    icon: string;
    tagline: string;
    scenarios: {
      title: string;
      description: string;
      impact: number;
      explanation: string;
      frequency: string;
      confidence: string;
    }[];
    annualRange: { low: number; mid: number; high: number };
    oneWinExample: { description: string; typicalValue: number };
  }[];
  totalAnnualRange: { low: number; mid: number; high: number };
  watchtowerCost: number;
  breakevenScenario: string;
  roiRange: { low: number; high: number };
}

export function calculateWatchtowerValue(
  selectedModules: string[],
  locations: number,
  monthlyRevenuePerLocation: number,
  watchtowerMonthlyCost: number
): WatchtowerValueResult {
  
  const hasBundle = selectedModules.includes('bundle');
  const moduleIds = hasBundle 
    ? ['competitive', 'events', 'trends']
    : selectedModules.filter(id => id !== 'bundle');
  
  const modules = moduleIds.map(id => {
    const data = WATCHTOWER_VALUE_SCENARIOS[id as keyof typeof WATCHTOWER_VALUE_SCENARIOS];
    if (!data) return null;
    
    const scenarios = data.scenarios.map(scenario => {
      const result = scenario.calculation(monthlyRevenuePerLocation);
      return {
        title: scenario.title,
        description: scenario.description,
        impact: result.impact * locations,  // Scale by locations
        explanation: result.explanation,
        frequency: scenario.frequency,
        confidence: scenario.confidence
      };
    });
    
    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      tagline: data.tagline,
      scenarios,
      annualRange: {
        low: data.annualValueRange.perLocation.low * locations,
        mid: data.annualValueRange.perLocation.mid * locations,
        high: data.annualValueRange.perLocation.high * locations
      },
      oneWinExample: {
        description: data.oneWinExample.description,
        typicalValue: data.oneWinExample.typicalValue * locations
      }
    };
  }).filter(Boolean) as WatchtowerValueResult['modules'];
  
  // Calculate totals
  const totalAnnualRange = modules.reduce((acc, m) => ({
    low: acc.low + m.annualRange.low,
    mid: acc.mid + m.annualRange.mid,
    high: acc.high + m.annualRange.high
  }), { low: 0, mid: 0, high: 0 });
  
  const annualCost = watchtowerMonthlyCost * 12;
  
  // Find the "one win" that pays for the year
  const allOneWins = modules.map(m => m.oneWinExample);
  const breakevenScenario = allOneWins.find(w => w.typicalValue >= annualCost)?.description 
    || 'Combined wins across modules';
  
  return {
    modules,
    totalAnnualRange,
    watchtowerCost: annualCost,
    breakevenScenario,
    roiRange: {
      low: Math.round((totalAnnualRange.low / annualCost) * 10) / 10,
      high: Math.round((totalAnnualRange.high / annualCost) * 10) / 10
    }
  };
}
