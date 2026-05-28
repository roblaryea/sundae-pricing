// Shared configuration types for the pricing configurator

import type { CompetitorId } from '../data/competitors';

export type CrossIntelligenceSelection = 'none' | 'base' | 'pro';

export type CrewSkuSelection =
  | 'crew_lite'
  | 'crew_scheduling'
  | 'crew_operations'
  | 'crew_tna'
  | 'crew_payroll'
  | 'crew_people_intelligence'
  | 'crew_suite_bundle'
  | 'crew_complete_bundle';

export interface Configuration {
  layer: 'report' | 'core' | 'crew' | null;
  tier: 'lite' | 'plus' | 'pro' | 'enterprise';
  locations: number;
  modules: string[];
  watchtowerModules: string[];
  crossIntelligence: CrossIntelligenceSelection;
  /**
   * Which Crew SKU or bundle the visitor selected, when `layer === 'crew'`.
   * Null for the Report / Core paths. Defaults to the Operating Suite
   * bundle since it's the canonical "I want the full operational substrate"
   * landing choice.
   */
  crewSku: CrewSkuSelection | null;
  competitors: {
    current: CompetitorId[];      // What they use today (from quiz)
    evaluating: CompetitorId[];   // What they're considering (from quiz)
    primaryComparison: CompetitorId; // The main one to show in UI
  };
}

export interface PriceBreakdown {
  item: string;
  price: number;
  perLocation: number;
  category: 'base' | 'module' | 'watchtower' | 'cross_intelligence';
  note?: string;
}

export interface DiscountLine {
  name: string;
  amount: number;
  percent: number;
}

export interface PriceCalculation {
  total: number;
  perLocation: number;
  breakdown: PriceBreakdown[];
  annualTotal: number;
  annualPerLocation: number;
  aiCredits: number;
  aiSeats: number;
  subtotal: number;
  discounts: DiscountLine[];
  savings: {
    tenzo: { monthly: number; setup: number; firstYear: number };
  };
}
