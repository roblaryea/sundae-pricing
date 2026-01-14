// Shared configuration types for the pricing configurator

import type { CompetitorId } from '../data/competitors';

export interface Configuration {
  layer: 'report' | 'core' | null;
  tier: 'lite' | 'plus' | 'pro' | 'enterprise';
  locations: number;
  modules: string[];
  watchtowerModules: string[];
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
  category: 'base' | 'module' | 'watchtower';
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
