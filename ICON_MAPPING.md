# SUNDAE ICON MAPPING

This document provides the official icon mapping for Sundae products, modules, and concepts. Use this for consistency across sundae.io and pricing.sundae.io.

---

## PRODUCT ICONS (Use ONLY when product is named)

These icons are **exclusive** to their products. Only use them when the product name appears.

| Product | Icon Name | Lucide Icon | Visual |
|---------|-----------|-------------|--------|
| **Sundae Report** | `report` | `FileText` | 📄 Document |
| **Sundae Core** | `core` | `Zap` | ⚡ Lightning bolt |
| **Watchtower** | `watchtower` | `Castle` | 🏰 Castle/Tower |
| **Modules** | `modules` | `Boxes` | 📦 Stacked boxes |

### Implementation Example (React/Lucide)

```tsx
import { PRODUCT_ICONS } from '../constants/icons';

// Usage
const { report: FileText, core: Zap, watchtower: Castle } = PRODUCT_ICONS;

// Sundae Report
<FileText className="w-6 h-6" />

// Sundae Core  
<Zap className="w-6 h-6" />

// Watchtower
<Castle className="w-6 h-6" />
```

---

## MODULE ICONS (Use ONLY when module is named)

These icons are **exclusive** to their modules. Only use them when the module name appears.

| Module | Icon Name | Lucide Icon | Visual |
|--------|-----------|-------------|--------|
| **Labor Intelligence** | `labor` | `Users` | 👥 People |
| **Inventory Intelligence** | `inventory` | `Layers` | 📚 Stacked layers |
| **Purchasing Intelligence** | `purchasing` | `Truck` | 🚚 Delivery truck |
| **Marketing Intelligence** | `marketing` | `Target` | 🎯 Target |
| **Reservations Intelligence** | `reservations` | `Calendar` | 📅 Calendar |

### Implementation Example (React/Lucide)

```tsx
import { MODULE_ICONS } from '../constants/icons';

// Usage
const IconComponent = MODULE_ICONS[moduleId];
<IconComponent className="w-6 h-6" />
```

---

## GENERIC CONCEPT ICONS (Use freely for concepts/features)

These icons represent **concepts** and can be used freely throughout the site.

### Data & Analytics

| Concept | Icon Name | Lucide Icon | Use Case |
|---------|-----------|-------------|----------|
| Data/Historical | `data` | `Database` | Raw data, historical records |
| Benchmarking | `benchmarking` | `LineChart` | Comparisons, plan vs actual |
| Insights | `insights` | `BarChart3` | Analytics, patterns |
| Forecasting | `forecasting` | `Gauge` | Predictions, future state |
| Chart | `chart` | `PieChart` | Visualizations |
| Dashboard | `dashboard` | `LayoutDashboard` | Dashboards, views |

### Actions & Features

| Concept | Icon Name | Lucide Icon | Use Case |
|---------|-----------|-------------|----------|
| Integration | `integration` | `Link2` | Connecting, linking |
| Alerts | `alerts` | `Bell` | Notifications |
| AI/Intelligence | `aiOs` | `Sparkles` | AI features |
| Growth | `growth` | `Rocket` | Improvement, scaling |
| Speed | `speed` | `Gauge` | Real-time, fast |
| Success | `success` | `CheckCircle` | Completion, verification |
| Warning | `warning` | `AlertTriangle` | Alerts, issues |
| Search | `search` | `Search` | Finding, querying |
| Sync | `sync` | `RefreshCw` | Syncing, updating |

### Personas/Roles

| Persona | Icon Name | Lucide Icon | Use Case |
|---------|-----------|-------------|----------|
| Operations | `operators` | `Users` | Ops teams |
| Finance | `finance` | `DollarSign` | Finance teams, FP&A |
| Technology | `technology` | `Cpu` | Tech teams, data teams |
| Owners/C-Suite | `owners` | `ShieldCheck` | Executives, owners |
| HR | `hr` | `HeartHandshake` | HR, people teams |
| Regional | `regional` | `MapPinned` | Regional managers |
| Multi-location | `multiLocation` | `Globe2` | Multiple sites, global |

### Industry

| Concept | Icon Name | Lucide Icon | Use Case |
|---------|-----------|-------------|----------|
| Restaurant | `restaurant` | `Store` | Restaurants |
| Hotel | `hotel` | `Hotel` | Hotels |
| Kitchen | `kitchen` | `ChefHat` | Kitchens |
| Franchise | `franchise` | `Building2` | Franchises |

---

## PRICING PAGE ICON USAGE GUIDE

### Product Tiers Section
Use **product icons** since products are named:

```
Sundae Report → FileText (report)
Sundae Core → Zap (core)  
Watchtower → Castle (watchtower)
```

### Module Add-ons Section
Use **module icons** since modules are named:

```
Labor Intelligence → Users (labor)
Inventory Intelligence → Layers (inventory)
Purchasing Intelligence → Truck (purchasing)
Marketing Intelligence → Target (marketing)
Reservations Intelligence → Calendar (reservations)
```

### Feature Lists
Use **generic concept icons** for feature descriptions:

```
"Real-time data" → Gauge (speed)
"AI recommendations" → Sparkles (aiOs)
"Integration support" → Link2 (integration)
"Benchmarking" → LineChart (benchmarking)
```

---

## COLOR ASSOCIATIONS

### Product Colors (for gradients/backgrounds)

| Product | Primary Color | Gradient |
|---------|--------------|----------|
| Sundae Report | Blue | `from-blue-500 to-blue-600` |
| Sundae Core | Purple | `from-purple-500 to-purple-600` |
| Watchtower | Amber/Yellow | `from-amber-500 to-amber-600` |

### Module Colors

All modules use a unified gradient:
```
from-blue-500 to-purple-600
```

---

## RULES FOR ICON USAGE

### ✅ DO

1. Use product icons **only** when the product name is displayed
2. Use module icons **only** when the module name is displayed
3. Use generic icons for concepts, features, and descriptions
4. Maintain consistent sizing (`w-6 h-6` for standard, `w-8 h-8` for large)

### ❌ DON'T

1. Don't use `report` icon for generic "data" concepts
2. Don't use `core` icon for generic "speed" concepts
3. Don't use `watchtower` icon for generic "market" concepts
4. Don't mix product icons with unrelated content

---

## NPM PACKAGE

Icons are from **Lucide React**:

```bash
npm install lucide-react
```

```tsx
import { FileText, Zap, Castle, Users, Layers, Truck, Target, Calendar } from "lucide-react";
```

---

## QUICK REFERENCE

### Products (Exclusive)
- **Report** = `FileText` 📄
- **Core** = `Zap` ⚡
- **Watchtower** = `Castle` 🏰

### Modules (Exclusive)
- **Labor** = `Users` 👥
- **Inventory** = `Layers` 📚
- **Purchasing** = `Truck` 🚚
- **Marketing** = `Target` 🎯
- **Reservations** = `Calendar` 📅

### Common Concepts (Shared)
- Data = `Database`
- Analytics = `BarChart3`
- Compare = `LineChart`
- Predict = `Gauge`
- AI = `Sparkles`
- Connect = `Link2`
- Alert = `Bell`

---

*Synced with main sundae.io icon mapping - Last updated: January 2, 2026*
