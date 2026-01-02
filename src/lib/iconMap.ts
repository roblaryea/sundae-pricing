/**
 * SUNDAE ICON MAPPING
 * 
 * Official icon mapping for Sundae products, modules, and concepts.
 * Aligned with sundae.io for consistency across both sites.
 * 
 * @see /Users/robertlaryea/Desktop/sundae/SUNDAE_ICON_MAPPING.md
 */

import {
  // Product Icons (EXCLUSIVE - only use when product is named)
  FileText,    // Sundae Report
  Zap,         // Sundae Core
  Castle,      // Watchtower
  Boxes,       // Modules

  // Module Icons (EXCLUSIVE - only use when module is named)
  Users,       // Labor Intelligence
  Layers,      // Inventory Intelligence
  Truck,       // Purchasing Intelligence
  Target,      // Marketing Intelligence
  Calendar,    // Reservations Intelligence

  // Data & Analytics (Generic - use freely for concepts)
  Database,         // Data/Historical
  LineChart,        // Benchmarking
  BarChart3,        // Insights/Analytics
  Gauge,            // Forecasting/Speed
  PieChart,         // Chart visualizations
  LayoutDashboard,  // Dashboards

  // Actions & Features (Generic)
  Link2,            // Integration
  Bell,             // Alerts/Notifications
  Sparkles,         // AI/Intelligence
  Rocket,           // Growth
  CheckCircle,      // Success
  AlertTriangle,    // Warning
  Search,           // Search
  RefreshCw,        // Sync

  // Personas/Roles (Generic)
  DollarSign,       // Finance
  Cpu,              // Technology
  ShieldCheck,      // Owners/C-Suite
  HeartHandshake,   // HR
  MapPinned,        // Regional
  Globe2,           // Multi-location

  // Industry (Generic)
  Store,            // Restaurant
  Hotel,            // Hotel
  ChefHat,          // Kitchen
  Building2,        // Franchise

  // Additional common icons
  Crown,
  TrendingUp,
  TrendingDown,
  Cloud,
  ClipboardList,
  Bot,
  HelpCircle,
  BadgeCheck,
  Megaphone,
  Radar,
  MapPin,
  Lightbulb,
  Building,
  UtensilsCrossed,
  MessageCircle,
  Warehouse,
  Swords,
  Trash2,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// PRODUCT ICONS (EXCLUSIVE - only use when product name appears)
// ============================================================================

export const PRODUCT_ICONS = {
  report: FileText,      // Sundae Report → FileText 📄
  core: Zap,             // Sundae Core → Zap ⚡
  watchtower: Castle,    // Watchtower → Castle 🏰
  modules: Boxes,        // Modules → Boxes 📦
} as const;

// ============================================================================
// MODULE ICONS (EXCLUSIVE - only use when module name appears)
// ============================================================================

export const MODULE_ICONS = {
  labor: Users,          // Labor Intelligence → Users 👥
  inventory: Layers,     // Inventory Intelligence → Layers 📚
  purchasing: Truck,     // Purchasing Intelligence → Truck 🚚
  marketing: Target,     // Marketing Intelligence → Target 🎯
  reservations: Calendar, // Reservations Intelligence → Calendar 📅
} as const;

// ============================================================================
// CONCEPT ICONS (Generic - use freely for features/concepts)
// ============================================================================

export const CONCEPT_ICONS = {
  // Data & Analytics
  data: Database,
  benchmarking: LineChart,
  insights: BarChart3,
  forecasting: Gauge,
  chart: PieChart,
  dashboard: LayoutDashboard,

  // Actions & Features
  integration: Link2,
  alerts: Bell,
  aiOs: Sparkles,
  growth: Rocket,
  speed: Gauge,
  success: CheckCircle,
  warning: AlertTriangle,
  search: Search,
  sync: RefreshCw,

  // Personas/Roles
  operators: Users,
  finance: DollarSign,
  technology: Cpu,
  owners: ShieldCheck,
  hr: HeartHandshake,
  regional: MapPinned,
  multiLocation: Globe2,

  // Industry
  restaurant: Store,
  hotel: Hotel,
  kitchen: ChefHat,
  franchise: Building2,
} as const;

// ============================================================================
// PRODUCT COLORS (for gradients/backgrounds)
// ============================================================================

export const PRODUCT_COLORS = {
  report: {
    primary: '#3B82F6',
    gradient: 'from-blue-500 to-blue-600',
  },
  core: {
    primary: '#8B5CF6',
    gradient: 'from-purple-500 to-purple-600',
  },
  watchtower: {
    primary: '#F59E0B',
    gradient: 'from-amber-500 to-amber-600',
  },
} as const;

// Module colors (unified gradient)
export const MODULE_GRADIENT = 'from-blue-500 to-purple-600';

// ============================================================================
// LEGACY ICON MAP (for emoji replacement compatibility)
// ============================================================================

export type IconName =
  | 'sundae'
  | 'store'
  | 'building'
  | 'crown'
  | 'users'
  | 'trash'
  | 'swords'
  | 'trending-up'
  | 'cloud'
  | 'clipboard'
  | 'bot'
  | 'help'
  | 'badge-check'
  | 'rocket'
  | 'target'
  | 'package'
  | 'cart'
  | 'megaphone'
  | 'calendar'
  | 'radar'
  | 'chart'
  | 'zap'
  | 'castle'
  | 'check'
  | 'dollar'
  | 'file'
  | 'map-pin'
  | 'lightbulb'
  | 'alert'
  | 'muscle'
  | 'growth'
  // New official names
  | 'report'
  | 'core'
  | 'watchtower'
  | 'labor'
  | 'inventory'
  | 'purchasing'
  | 'marketing'
  | 'reservations';

// Complete emoji to icon mapping
export const ICON_MAP: Record<string, LucideIcon> = {
  // Brand
  '🍨': Sparkles,
  
  // Locations/Buildings
  '🏪': Store,
  '🏬': Warehouse,
  '🏢': Building2,
  '🏙️': Building2,
  '🏨': Hotel,
  
  // People/Roles
  '👑': Crown,
  '👥': Users,
  '👨‍💼': Users,
  
  // Competition/Battle
  '🥊': Swords,
  
  // Trends/Growth
  '📈': TrendingUp,
  '📉': TrendingDown,
  '💪': BadgeCheck,
  
  // Weather/Feelings
  '☁️': Cloud,
  '🤔': HelpCircle,
  '💭': MessageCircle,
  
  // Documents/Reports
  '📋': ClipboardList,
  '📝': FileText,
  '📄': FileText,
  '🧾': FileText,
  
  // AI/Tech
  '🤖': Bot,
  '⚡': Zap,  // Official: Sundae Core icon
  
  // Actions
  '🚀': Rocket,
  '✅': CheckCircle,
  '✨': Sparkles,
  
  // Goals/Targets
  '🎯': Target,  // Official: Marketing Intelligence icon
  
  // Business Operations
  '📦': Boxes,   // Official: Modules icon
  '🛒': ShoppingCart,
  '📣': Megaphone,
  '📅': Calendar, // Official: Reservations Intelligence icon
  '🗓️': Calendar,
  
  // Strategic
  '🏰': Castle,  // Official: Watchtower icon
  '🏯': Castle,
  '🔭': Radar,
  
  // Analytics
  '📊': BarChart3, // Generic insights icon
  
  // Money
  '💰': DollarSign,
  '💡': Lightbulb,
  
  // Locations
  '📍': MapPin,
  
  // Alerts
  '⚠️': AlertTriangle,
  
  // Food/Waste
  '🍲': Trash2,
  '🥘': UtensilsCrossed,
  
  // Other
  '🌐': Globe2,
  '💬': HelpCircle,
  '🔒': BadgeCheck,
  '🔥': Sparkles,
  '⭐': Sparkles,
  '🌟': Sparkles,
  '🎨': Sparkles,
  '📧': FileText,
  '📞': HelpCircle,
  '⚙️': Cpu,
  '🏗️': Building,
  
  // Stacked layers (Inventory Intelligence)
  '📚': Layers,
  
  // Delivery truck (Purchasing Intelligence)
  '🚚': Truck,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon component for a product
 * Use ONLY when the product name is displayed
 */
export function getProductIcon(product: keyof typeof PRODUCT_ICONS): LucideIcon {
  return PRODUCT_ICONS[product];
}

/**
 * Get icon component for a module
 * Use ONLY when the module name is displayed
 */
export function getModuleIcon(module: keyof typeof MODULE_ICONS): LucideIcon {
  return MODULE_ICONS[module];
}

/**
 * Get icon component for a concept
 * Use freely for features, descriptions, etc.
 */
export function getConceptIcon(concept: keyof typeof CONCEPT_ICONS): LucideIcon {
  return CONCEPT_ICONS[concept];
}

/**
 * Get icon by emoji (legacy support)
 */
export function getIconByEmoji(emoji: string): LucideIcon {
  return ICON_MAP[emoji] || Sparkles;
}

/**
 * Get icon by name (legacy support)
 */
export function getIcon(name: IconName): LucideIcon {
  const map: Record<IconName, LucideIcon> = {
    // Product icons (official)
    'report': FileText,
    'core': Zap,
    'watchtower': Castle,
    
    // Module icons (official)
    'labor': Users,
    'inventory': Layers,
    'purchasing': Truck,
    'marketing': Target,
    'reservations': Calendar,
    
    // Legacy/generic names
    'sundae': Sparkles,
    'store': Store,
    'building': Building2,
    'crown': Crown,
    'users': Users,
    'trash': Trash2,
    'swords': Swords,
    'trending-up': TrendingUp,
    'cloud': Cloud,
    'clipboard': ClipboardList,
    'bot': Bot,
    'help': HelpCircle,
    'badge-check': BadgeCheck,
    'rocket': Rocket,
    'target': Target,
    'package': Boxes,
    'cart': ShoppingCart,
    'megaphone': Megaphone,
    'calendar': Calendar,
    'radar': Radar,
    'chart': BarChart3,
    'zap': Zap,
    'castle': Castle,
    'check': CheckCircle,
    'dollar': DollarSign,
    'file': FileText,
    'map-pin': MapPin,
    'lightbulb': Lightbulb,
    'alert': AlertTriangle,
    'muscle': BadgeCheck,
    'growth': Rocket,
  };
  return map[name] || Sparkles;
}

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
  
  // Common concept icons
  Database,
  LineChart,
  BarChart3,
  Gauge,
  PieChart,
  LayoutDashboard,
  Link2,
  Bell,
  Sparkles,
  Rocket,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Store,
  Building2,
  Globe2,
};
