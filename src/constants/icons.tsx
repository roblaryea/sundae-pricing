/**
 * SUNDAE ICON CONSTANTS
 * 
 * Centralized icon mapping - replaces emojis with professional Lucide icons.
 * Single source of truth for consistent iconography across the pricing site.
 * 
 * Aligned with official SUNDAE_ICON_MAPPING.md for consistency with sundae.io
 */

import {
  // Product Icons (EXCLUSIVE)
  FileText,    // Sundae Report
  Zap,         // Sundae Core
  Castle,      // Watchtower
  Boxes,       // Modules

  // Module Icons (EXCLUSIVE)
  Users,       // Labor Intelligence
  Layers,      // Inventory Intelligence
  Truck,       // Purchasing Intelligence
  Target,      // Marketing Intelligence
  Calendar,    // Reservations Intelligence
  DollarSign,  // Profit Intelligence (NEW)
  Shield,      // Revenue Assurance (NEW)
  Bike,        // Delivery Economics (NEW)
  Star,        // Guest Experience (NEW)

  // Generic Concept Icons
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Gauge,
  Rocket,
  Building2,
  CheckCircle,
  Link2,
  Bell,
  Database,
  Globe2,
} from 'lucide-react';

// Icon component type
export type IconComponent = typeof Sparkles;

// ============================================================================
// PRODUCT ICONS - Use ONLY when product name is displayed
// ============================================================================

export const PRODUCT_ICONS = {
  report: FileText,      // Sundae Report
  core: Zap,             // Sundae Core
  watchtower: Castle,    // Watchtower
  modules: Boxes,        // Modules
} as const;

// ============================================================================
// MODULE ICONS - Use ONLY when module name is displayed
// ============================================================================

export const MODULE_ICONS = {
  labor: Users,          // Labor Intelligence
  inventory: Layers,     // Inventory Intelligence
  purchasing: Truck,     // Purchasing Intelligence
  marketing: Target,     // Marketing Intelligence
  reservations: Calendar, // Reservations Intelligence
  profit: DollarSign,    // Profit Intelligence (NEW)
  revenue: Shield,       // Revenue Assurance (NEW)
  delivery: Bike,        // Delivery Economics (NEW)
  guest: Star,           // Guest Experience (NEW)
} as const;

// ============================================================================
// EMOJI TO ICON MAPPING - For consistent emoji replacements
// ============================================================================

export const EMOJI_TO_ICON_MAP = {
  // Brand & product
  '🍨': Sparkles,        // Sundae brand icon
  
  // Product emojis (map to official icons)
  '📄': FileText,        // Report/Document → Sundae Report icon
  '⚡': Zap,             // Lightning → Sundae Core icon
  '🏰': Castle,          // Castle → Watchtower icon
  '📦': Boxes,           // Package → Modules icon
  
  // Module emojis (map to official icons)
  '👥': Users,           // People → Labor Intelligence
  '📚': Layers,          // Stacked → Inventory Intelligence
  '🚚': Truck,           // Delivery → Purchasing Intelligence
  '🎯': Target,          // Target → Marketing Intelligence
  '📅': Calendar,        // Calendar → Reservations Intelligence
  
  // Actions & growth
  '🚀': Rocket,          // Launch, growth, strong ROI
  '💪': TrendingUp,      // Strength, power
  
  // Data & analytics (generic concepts)
  '📊': BarChart3,       // Charts, analytics, BI
  '📈': TrendingUp,      // Growth trends, market trends
  '📉': TrendingDown,    // Savings, cost reduction
  '🔗': Link2,           // Integration, connecting
  '🔔': Bell,            // Alerts, notifications
  '💾': Database,        // Data, historical records
  '🌐': Globe2,          // Multi-location, global
  
  // Money & savings
  '💰': DollarSign,      // Money, pricing, savings
  '💡': Sparkles,        // Ideas, intelligence, insights
  
  // Documents & reports
  '📝': FileText,        // Reports, notes
  
  // Features & enhancements
  '✨': Sparkles,        // Features, enhancements, AI
  
  // Checkmarks & validation
  '✅': CheckCircle,     // Success, verified
  
  // Buildings & locations
  '🏢': Building2,       // Multi-location, enterprise
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon component from emoji
 */
export function getIconFromEmoji(emoji: string): IconComponent {
  return EMOJI_TO_ICON_MAP[emoji as keyof typeof EMOJI_TO_ICON_MAP] || Sparkles;
}

/**
 * Get product icon by product key
 * Use ONLY when the product name is displayed
 */
export function getProductIcon(product: keyof typeof PRODUCT_ICONS): IconComponent {
  return PRODUCT_ICONS[product];
}

/**
 * Get module icon by module key
 * Use ONLY when the module name is displayed
 */
export function getModuleIcon(module: keyof typeof MODULE_ICONS): IconComponent {
  return MODULE_ICONS[module];
}

// ============================================================================
// ICON SIZES - Standard sizing classes
// ============================================================================

export const ICON_SIZES = {
  xs: 'w-3 h-3',      // 12px
  sm: 'w-4 h-4',      // 16px
  md: 'w-5 h-5',      // 20px
  lg: 'w-6 h-6',      // 24px - Standard per official mapping
  xl: 'w-8 h-8',      // 32px - Large per official mapping
} as const;

// ============================================================================
// RE-EXPORTS for convenience
// ============================================================================

export {
  // Product icons
  FileText,
  Zap,
  Castle,
  Boxes,
  
  // Module icons
  Users,
  Layers,
  Truck,
  Target,
  Calendar,
  DollarSign,
  Shield,
  Bike,
  Star,
  
  // Common concept icons
  Sparkles,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Gauge,
  Rocket,
  Building2,
  CheckCircle,
  Link2,
  Bell,
  Database,
  Globe2,
};
