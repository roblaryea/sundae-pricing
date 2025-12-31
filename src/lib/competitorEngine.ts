// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR COMPARISON ENGINE
// ═══════════════════════════════════════════════════════════════════════════

import { competitors } from '../data/competitors';
import type { CompetitorId } from '../data/competitors';
import type { PriceResult } from './pricingEngine';

export interface CompetitorCost {
  competitorId: CompetitorId;
  name: string;
  monthly: number;
  setupFee: number;
  firstYearTotal: number;
  threeYearTotal: number;
  hiddenCosts: string[];
  implementationMonths: number;
  isEstimate: boolean;  // True for hidden-cost models
}

export interface SavingsResult {
  competitor: CompetitorCost;
  sundae: {
    monthly: number;
    firstYearTotal: number;
    threeYearTotal: number;
  };
  savings: {
    monthly: number;
    monthlyPercent: number;
    firstYear: number;
    firstYearPercent: number;
    threeYear: number;
    threeYearPercent: number;
    setupAvoided: number;
    timeToValueDays: number;  // Sundae vs competitor implementation
  };
  advantages: string[];
  painPointsAddressed: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITOR COST CALCULATORS
// ═══════════════════════════════════════════════════════════════════════════

function calculateTenzoCost(locations: number, moduleCount: number): CompetitorCost {
  const monthly = locations * moduleCount * 75;
  const setupFee = locations * moduleCount * 350;
  return {
    competitorId: 'tenzo',
    name: 'Tenzo',
    monthly,
    setupFee,
    firstYearTotal: (monthly * 12) + setupFee,
    threeYearTotal: (monthly * 36) + setupFee,
    hiddenCosts: [],
    implementationMonths: 1,
    isEstimate: false
  };
}

function calculateNoryCost(locations: number): CompetitorCost {
  const monthly = locations * 200;
  const setupFee = 500 * locations;
  return {
    competitorId: 'nory',
    name: 'Nory',
    monthly,
    setupFee,
    firstYearTotal: (monthly * 12) + setupFee,
    threeYearTotal: (monthly * 36) + setupFee,
    hiddenCosts: [],
    implementationMonths: 2,
    isEstimate: false
  };
}

function calculateMarketManCost(locations: number): CompetitorCost {
  const monthly = 179 + (locations * 50);
  return {
    competitorId: 'marketman',
    name: 'MarketMan',
    monthly,
    setupFee: 0,
    firstYearTotal: monthly * 12,
    threeYearTotal: monthly * 36,
    hiddenCosts: ['Only covers inventory — need additional tools for full analytics'],
    implementationMonths: 1,
    isEstimate: false
  };
}

function calculateR365Cost(locations: number): CompetitorCost {
  const monthly = 400 + (locations * 100);
  const setupFee = 2000 + (locations * 200);
  return {
    competitorId: 'restaurant365',
    name: 'Restaurant365',
    monthly,
    setupFee,
    firstYearTotal: (monthly * 12) + setupFee,
    threeYearTotal: (monthly * 36) + setupFee,
    hiddenCosts: ['Training costs', 'Change management'],
    implementationMonths: 3,
    isEstimate: false
  };
}

function calculatePowerBICost(_locations: number, users: number = 10): CompetitorCost {
  const licenseMonthly = users * 10;
  const dataEngineerAnnual = 80000;  // Conservative estimate
  const dashboardDevelopment = 30000;  // One-time
  const ongoingMaintenance = 2000;  // Monthly
  
  const monthly = licenseMonthly + ongoingMaintenance + (dataEngineerAnnual / 12);
  const setupFee = dashboardDevelopment;
  
  return {
    competitorId: 'powerbi',
    name: 'Power BI',
    monthly: Math.round(monthly),
    setupFee,
    firstYearTotal: Math.round((monthly * 12) + setupFee),
    threeYearTotal: Math.round((monthly * 36) + setupFee),
    hiddenCosts: [
      `Data engineering (~$${Math.round(dataEngineerAnnual/1000)}k/year)`,
      'Custom dashboard development',
      'Ongoing maintenance',
      'No restaurant-specific features'
    ],
    implementationMonths: 4,
    isEstimate: true
  };
}

function calculateTableauCost(_locations: number, users: number = 10): CompetitorCost {
  const licenseMonthly = users * 70;
  const dataEngineerAnnual = 100000;
  const dashboardDevelopment = 50000;
  const serverCosts = 1000;  // Monthly
  
  const monthly = licenseMonthly + serverCosts + (dataEngineerAnnual / 12);
  const setupFee = dashboardDevelopment;
  
  return {
    competitorId: 'tableau',
    name: 'Tableau',
    monthly: Math.round(monthly),
    setupFee,
    firstYearTotal: Math.round((monthly * 12) + setupFee),
    threeYearTotal: Math.round((monthly * 36) + setupFee),
    hiddenCosts: [
      `Data engineering (~$${Math.round(dataEngineerAnnual/1000)}k/year)`,
      'Server infrastructure',
      'Training and adoption',
      'Custom development'
    ],
    implementationMonths: 6,
    isEstimate: true
  };
}

function calculateLookerCost(_locations: number, users: number = 10): CompetitorCost {
  const baseMonthly = 3000;
  const perUserMonthly = users * 60;
  const dataWarehouse = 500;  // Monthly
  const implementation = 25000;
  
  const monthly = baseMonthly + perUserMonthly + dataWarehouse;
  
  return {
    competitorId: 'looker',
    name: 'Looker',
    monthly,
    setupFee: implementation,
    firstYearTotal: (monthly * 12) + implementation,
    threeYearTotal: (monthly * 36) + implementation,
    hiddenCosts: [
      'LookML development required',
      'Data warehouse costs',
      'Implementation partner fees'
    ],
    implementationMonths: 4,
    isEstimate: true
  };
}

function calculateExcelCost(locations: number): CompetitorCost {
  // Calculate opportunity cost
  const managerHoursPerWeek = 10;
  const managerHourlyRate = 35;
  const weeklyOpportunityCost = managerHoursPerWeek * managerHourlyRate * locations;
  const monthlyOpportunityCost = weeklyOpportunityCost * 4.33;
  
  return {
    competitorId: 'excel',
    name: 'Spreadsheets',
    monthly: Math.round(monthlyOpportunityCost),
    setupFee: 0,
    firstYearTotal: Math.round(monthlyOpportunityCost * 12),
    threeYearTotal: Math.round(monthlyOpportunityCost * 36),
    hiddenCosts: [
      `~${managerHoursPerWeek}hrs/week of manager time per location`,
      'Data entry errors (2-5% typical)',
      'Decisions based on stale data',
      'No scalability'
    ],
    implementationMonths: 0,
    isEstimate: true
  };
}

function calculatePosNativeCost(locations: number): CompetitorCost {
  // Opportunity cost of limited insights
  const missedOptimizationMonthly = locations * 200;  // Conservative estimate
  
  return {
    competitorId: 'pos-native',
    name: 'POS Reports',
    monthly: 0,  // "Free" but with opportunity cost
    setupFee: 0,
    firstYearTotal: 0,
    threeYearTotal: 0,
    hiddenCosts: [
      `Est. ~$${missedOptimizationMonthly}/mo in missed optimizations`,
      'No cross-location insights',
      'No AI recommendations',
      'No benchmarking data'
    ],
    implementationMonths: 0,
    isEstimate: true
  };
}

function calculateNothingCost(locations: number): CompetitorCost {
  const missedSavingsMonthly = locations * 500;  // Conservative
  
  return {
    competitorId: 'nothing',
    name: 'No Analytics',
    monthly: 0,
    setupFee: 0,
    firstYearTotal: 0,
    threeYearTotal: 0,
    hiddenCosts: [
      `Est. ~$${missedSavingsMonthly}/mo in optimization opportunities`,
      'Blind spots in operations',
      'Reactive decision-making',
      'Competitor intelligence gap'
    ],
    implementationMonths: 0,
    isEstimate: true
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPARISON FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

export function calculateCompetitorCost(
  competitorId: CompetitorId,
  locations: number,
  options: {
    moduleCount?: number;  // For Tenzo
    users?: number;        // For BI tools
  } = {}
): CompetitorCost {
  const { moduleCount = 2, users = Math.max(5, locations) } = options;
  
  switch (competitorId) {
    case 'tenzo':
      return calculateTenzoCost(locations, moduleCount);
    case 'nory':
      return calculateNoryCost(locations);
    case 'marketman':
      return calculateMarketManCost(locations);
    case 'restaurant365':
      return calculateR365Cost(locations);
    case 'powerbi':
      return calculatePowerBICost(locations, users);
    case 'tableau':
      return calculateTableauCost(locations, users);
    case 'looker':
      return calculateLookerCost(locations, users);
    case 'excel':
      return calculateExcelCost(locations);
    case 'pos-native':
      return calculatePosNativeCost(locations);
    case 'nothing':
      return calculateNothingCost(locations);
    default:
      return calculateNothingCost(locations);
  }
}

export function calculateSavings(
  sundaeResult: PriceResult,
  competitorId: CompetitorId,
  locations: number,
  options?: { moduleCount?: number; users?: number }
): SavingsResult {
  const competitor = calculateCompetitorCost(competitorId, locations, options);
  const competitorProfile = competitors[competitorId];
  
  const sundaeFirstYear = sundaeResult.annualTotal;
  const sundaeThreeYear = sundaeResult.annualTotal * 3;
  
  // For free/hidden-cost models, savings is the value Sundae provides
  const monthlySavings = competitor.monthly - sundaeResult.total;
  const firstYearSavings = competitor.firstYearTotal - sundaeFirstYear;
  const threeYearSavings = competitor.threeYearTotal - sundaeThreeYear;
  
  return {
    competitor,
    sundae: {
      monthly: sundaeResult.total,
      firstYearTotal: sundaeFirstYear,
      threeYearTotal: sundaeThreeYear
    },
    savings: {
      monthly: monthlySavings,
      monthlyPercent: competitor.monthly > 0 
        ? Math.round((monthlySavings / competitor.monthly) * 100) 
        : 0,
      firstYear: firstYearSavings,
      firstYearPercent: competitor.firstYearTotal > 0 
        ? Math.round((firstYearSavings / competitor.firstYearTotal) * 100) 
        : 0,
      threeYear: threeYearSavings,
      threeYearPercent: competitor.threeYearTotal > 0 
        ? Math.round((threeYearSavings / competitor.threeYearTotal) * 100) 
        : 0,
      setupAvoided: competitor.setupFee,
      timeToValueDays: Math.max(0, (competitor.implementationMonths * 30) - 7)  // Sundae = ~1 week
    },
    advantages: competitorProfile.sundaeAdvantages,
    painPointsAddressed: competitorProfile.painPoints
  };
}

// Calculate savings against multiple competitors
export function calculateMultiCompetitorSavings(
  sundaeResult: PriceResult,
  competitorIds: CompetitorId[],
  locations: number
): SavingsResult[] {
  return competitorIds.map(id => calculateSavings(sundaeResult, id, locations));
}

// Get default comparison set if user doesn't specify
export function getDefaultCompetitors(locations: number): CompetitorId[] {
  if (locations >= 10) {
    return ['tenzo', 'restaurant365', 'powerbi'];
  } else if (locations >= 3) {
    return ['tenzo', 'nory', 'excel'];
  } else {
    return ['excel', 'pos-native', 'tenzo'];
  }
}
