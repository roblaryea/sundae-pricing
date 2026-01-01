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
        description: 'Competitor raises prices 5% — you follow on 30% of menu',
        calculation: (revenuePerLocation: number) => {
          const priceIncrease = 0.05;
          const menuPortion = 0.30;
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
        description: 'Early warning on new competitor — time to respond',
        calculation: (revenuePerLocation: number) => {
          const shareLossPrevented = 0.02;  // 2% of revenue
          const annualValue = revenuePerLocation * 12 * shareLossPrevented;
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
    
    // Conservative annual range (not monthly!)
    annualValueRange: {
      perLocation: {
        low: 15000,   // $15K per location per year
        mid: 30000,   // $30K
        high: 50000   // $50K
      }
    },
    
    // "One win" threshold - one scenario that pays for the module
    oneWinExample: {
      description: 'Following one competitor price increase',
      typicalValue: 15000
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
        description: 'Concert, game, or convention drives 40% demand spike',
        calculation: (revenuePerLocation: number) => {
          const dailyRevenue = revenuePerLocation / 30;
          const demandSpike = 0.40;
          const captureImprovement = 0.25;  // Capture 25% more of spike with prep
          const eventsPerYear = 12;  // ~1 major event per month
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
        description: 'Right staff levels for demand — less overtime, less understaffing',
        calculation: (revenuePerLocation: number) => {
          const laborPercent = 0.30;
          const laborCost = revenuePerLocation * 12 * laborPercent;
          const efficiencyGain = 0.02;  // 2% labor efficiency on event days
          const eventDaysPercent = 0.15;  // 15% of days have events
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
    
    annualValueRange: {
      perLocation: {
        low: 10000,
        mid: 20000,
        high: 35000
      }
    },
    
    oneWinExample: {
      description: 'Perfect preparation for 2 major events',
      typicalValue: 12000
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
        description: 'Add trending item before competitors — capture early demand',
        calculation: (revenuePerLocation: number) => {
          const newItemShare = 0.025;  // New item becomes 2.5% of sales
          const successRate = 0.60;  // 60% of trend-informed items succeed
          const attemptsPerYear = 3;
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
    
    annualValueRange: {
      perLocation: {
        low: 5000,
        mid: 12000,
        high: 25000
      }
    },
    
    oneWinExample: {
      description: 'One successful trend-informed menu item',
      typicalValue: 8000
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// BUNDLE SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export const WATCHTOWER_BUNDLE_VALUE = {
  annualValueRange: {
    perLocation: {
      low: 30000,   // Sum of lows
      mid: 62000,   // Sum of mids
      high: 110000  // Sum of highs
    }
  },
  
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
