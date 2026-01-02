// Centralized icon mapping - replaces emojis with professional Lucide icons
// Single source of truth for consistent iconography

import {
  Sparkles,
  TrendingUp,
  Zap,
  Target,
  Calendar,
  BarChart3,
  Castle,
  Rocket,
  DollarSign,
  FileText,
  Building2,
  CheckCircle,
  TrendingDown,
  Layers,
} from 'lucide-react';

// Icon component type
export type IconComponent = typeof Sparkles;

// Emoji to Icon mapping for consistent replacements
export const EMOJI_TO_ICON_MAP = {
  // Brand & product
  '🍨': Sparkles,        // Sundae brand icon
  
  // Actions & growth
  '🚀': Rocket,          // Launch, growth, strong ROI
  '⚡': Zap,             // Real-time, fast, efficiency
  '🎯': Target,          // Goals, targeting, focus
  '💪': TrendingUp,      // Strength, power
  
  // Data & analytics
  '📊': BarChart3,       // Charts, analytics, BI
  '📈': TrendingUp,      // Growth trends, market trends
  '📉': TrendingDown,    // Savings, cost reduction
  
  // Calendar & events
  '📅': Calendar,        // Events, reservations, scheduling
  
  // Money & savings
  '💰': DollarSign,      // Money, pricing, savings
  '💡': Sparkles,        // Ideas, intelligence, insights
  
  // Documents & reports
  '📝': FileText,        // Reports, notes
  '📄': FileText,        // Documents
  
  // Features & modules
  '🏰': Castle,          // Watchtower
  '✨': Sparkles,        // Features, enhancements
  
  // Checkmarks & validation
  '✅': CheckCircle,     // Success, verified
  
  // Buildings & locations
  '🏢': Building2,       // Multi-location, enterprise
  
  // Layers & structure
  '📚': Layers,          // Layers, stack
} as const;

// Helper to get icon component from emoji
export function getIconFromEmoji(emoji: string): IconComponent {
  return EMOJI_TO_ICON_MAP[emoji as keyof typeof EMOJI_TO_ICON_MAP] || Sparkles;
}

// Common icon sizes
export const ICON_SIZES = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px
  lg: 'w-6 h-6',      // 24px
  xl: 'w-8 h-8',      // 32px
} as const;
