// Comprehensive icon mapping for emoji replacement
// Maps all emojis used in the app to Lucide React icons

import {
  Sparkles,
  Store,
  Building2,
  Crown,
  Users,
  Trash2,
  Swords,
  TrendingUp,
  Cloud,
  ClipboardList,
  Bot,
  HelpCircle,
  BadgeCheck,
  Rocket,
  Target,
  Package,
  ShoppingCart,
  Megaphone,
  CalendarDays,
  Radar,
  BarChart3,
  Zap,
  Castle,
  CheckCircle,
  DollarSign,
  FileText,
  MapPin,
  Lightbulb,
  AlertTriangle,
  Building,
  UtensilsCrossed,
  MessageCircle,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

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
  | 'growth';

// Complete emoji to icon mapping
export const ICON_MAP: Record<string, LucideIcon> = {
  // Brand
  '🍨': Sparkles,
  
  // Locations/Buildings
  '🏪': Store,
  '🏬': Warehouse,
  '🏢': Building2,
  '🏙️': Building2,
  '🏨': Building,
  
  // People/Roles
  '👑': Crown,
  '👥': Users,
  '👨‍💼': Users,
  
  // Competition/Battle
  '🥊': Swords,
  
  // Trends/Growth
  '📈': TrendingUp,
  '📉': TrendingUp,
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
  '⚡': Zap,
  
  // Actions
  '🚀': Rocket,
  '✅': CheckCircle,
  '✨': Sparkles,
  
  // Goals/Targets
  '🎯': Target,
  
  // Business Operations
  '📦': Package,
  '🛒': ShoppingCart,
  '📣': Megaphone,
  '📅': CalendarDays,
  '🗓️': CalendarDays,
  
  // Strategic
  '🏰': Castle,
  '🏯': Castle,
  '🔭': Radar,
  
  // Analytics
  '📊': BarChart3,
  
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
  '🌐': Building2,
  '💬': HelpCircle,
  '🔒': BadgeCheck,
  '🔥': Sparkles,
  '⭐': Sparkles,
  '🌟': Sparkles,
  '🎨': Sparkles,
  '📧': FileText,
  '📞': HelpCircle,
  '⚙️': Zap,
  '🏗️': Building,
};

// Helper to get icon by emoji
export function getIconByEmoji(emoji: string): LucideIcon {
  return ICON_MAP[emoji] || Sparkles;
}

// Helper to get icon by name
export function getIcon(name: IconName): LucideIcon {
  const map: Record<IconName, LucideIcon> = {
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
    'package': Package,
    'cart': ShoppingCart,
    'megaphone': Megaphone,
    'calendar': CalendarDays,
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
    'growth': TrendingUp,
  };
  return map[name] || Sparkles;
}
