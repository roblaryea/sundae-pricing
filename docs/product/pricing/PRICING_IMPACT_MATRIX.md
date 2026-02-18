# Pricing Impact Matrix

> **Purpose:** Documents exactly where every pricing field appears across the codebase. Before changing any value in `src/data/pricing.ts`, consult this matrix to understand the full blast radius.
>
> **Source of Truth:** `src/data/pricing.ts`
>
> **Last updated:** 2026-02-17

---

## How to Use This Document

1. Find the pricing field you want to change in the tables below.
2. Check every column -- UI components render the value, tests assert it, validation scripts verify it, and hard-coded copies must be manually synced.
3. After changing `pricing.ts`, update all hard-coded copies and re-run tests (`vitest`) and validation (`npx tsx scripts/qa-validate-pricing.ts`).

---

## Legend

| Abbreviation | File |
|---|---|
| **pricing.ts** | `src/data/pricing.ts` (source of truth) |
| **PricingOverview** | `src/pages/PricingOverview.tsx` |
| **pricingEngine** | `src/lib/pricingEngine.ts` |
| **watchtowerEngine** | `src/lib/watchtowerEngine.ts` |
| **ModulePicker** | `src/components/ConfigBuilder/ModulePicker.tsx` |
| **TierSelector** | `src/components/ConfigBuilder/TierSelector.tsx` |
| **WatchtowerToggle** | `src/components/ConfigBuilder/WatchtowerToggle.tsx` |
| **ConfigSummary** | `src/components/Summary/ConfigSummary.tsx` |
| **WatchtowerValue** | `src/components/Summary/WatchtowerValue.tsx` |
| **usePriceCalc** | `src/hooks/usePriceCalculation.ts` |
| **pricingCalcs** | `src/utils/pricingCalculators.ts` |
| **featureComp** | `src/data/featureComparisons.ts` |
| **competitorPricing** | `src/data/competitorPricing.ts` |
| **pricingAssumptions** | `src/config/pricingAssumptions.ts` |
| **LayerStack** | `src/components/ConfigBuilder/LayerStack.tsx` |
| **tests** | `__tests__/pricing.test.ts` |
| **validate** | `scripts/validate-pricing.ts` |
| **qa-validate** | `scripts/qa-validate-pricing.ts` |

---

## 1. Report Tiers (`reportTiers`)

### Report Lite

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `reportTiers.lite.basePrice` = **0** | pricing.ts:52 | PricingOverview (renders `$0`), TierSelector (renders `$0`), ConfigSummary (tier details) | tests:23-25 (`toBe(0)`) | validate:20, qa-validate:38 | LayerStack:28 `"Starting at $0/month"` | -- |
| `reportTiers.lite.additionalLocationPrice` = **0** | pricing.ts:53 | PricingOverview (conditional render), TierSelector (conditional render) | tests:23-25 (implicit, price stays 0) | qa-validate:39 | -- | -- |
| `reportTiers.lite.aiCredits.base` = **40** | pricing.ts:54 | PricingOverview, TierSelector (shows `40+`) | -- | qa-validate:41 | featureComp:27 `"40 credits"` | -- |
| `reportTiers.lite.aiCredits.perLocation` = **8** | pricing.ts:54 | -- | -- | qa-validate:42 | featureComp:28 `"+8 credits"` | -- |
| `reportTiers.lite.aiSeats` = **1** | pricing.ts:55 | -- | tests:28-29 (`toBe(1)`) | validate:21, qa-validate:40 | featureComp:37 `"1 seat"` | Was previously 2; test specifically guards against regression |
| `reportTiers.lite.benchmarkMetrics` = **5** | pricing.ts:56 | TierSelector (comparison table) | -- | -- | featureComp:45 `"5 core metrics"` | -- |
| `reportTiers.lite.benchmarkRadius` = **"1km (locked)"** | pricing.ts:57 | TierSelector (comparison table) | -- | -- | featureComp:46 `"1km (locked)"` | -- |
| `reportTiers.lite.visuals` = **20** | pricing.ts:59 | PricingOverview, TierSelector | -- | qa-validate:43 | featureComp:16 `"20 core visuals"` | -- |
| `reportTiers.lite.refresh` | pricing.ts:62 | PricingOverview, TierSelector | -- | -- | -- | -- |
| `reportTiers.lite.support` | pricing.ts:63 | TierSelector (comparison table) | -- | -- | -- | -- |
| `reportTiers.lite.features[]` | pricing.ts:66-75 | PricingOverview (first 5), TierSelector (first 5), ConfigSummary | -- | -- | -- | -- |
| `reportTiers.lite.bestFor` | pricing.ts:85 | PricingOverview, TierSelector | -- | -- | -- | -- |

### Report Plus

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `reportTiers.plus.basePrice` = **49** | pricing.ts:92 | PricingOverview (`$49`), TierSelector (`$49`) | tests:32-33 (part of 5-loc calc) | qa-validate:46 | -- | -- |
| `reportTiers.plus.additionalLocationPrice` = **29** | pricing.ts:93 | PricingOverview (`+$29`), TierSelector (`+$29`) | tests:32-33 (`49 + 4*29 = 165`) | qa-validate:47 | -- | -- |
| `reportTiers.plus.aiCredits.base` = **150** | pricing.ts:94 | PricingOverview, TierSelector (`150+`) | -- | qa-validate:49 | featureComp:27 `"150 credits"` | -- |
| `reportTiers.plus.aiCredits.perLocation` = **30** | pricing.ts:94 | -- | -- | qa-validate:50 | featureComp:28 `"+30 credits"` | -- |
| `reportTiers.plus.aiSeats` = **3** | pricing.ts:95 | -- | tests:36-37 (`toBe(3)`) | validate:25, qa-validate:48 | featureComp:37 `"3 seats"` | -- |
| `reportTiers.plus.benchmarkMetrics` = **15** | pricing.ts:96 | TierSelector (comparison table) | -- | -- | featureComp:45 `"15 key metrics"` | -- |
| `reportTiers.plus.benchmarkRadius` = **"1-2km adjustable"** | pricing.ts:97 | TierSelector | tests:38-39 | validate:26, qa-validate:52 | featureComp:46 `"1-2km adjustable"` | -- |
| `reportTiers.plus.visuals` = **50** | pricing.ts:99 | PricingOverview, TierSelector | tests:37-38 (`toBe(50)`) | validate:24, qa-validate:51 | featureComp:16 `"50 comprehensive"` | -- |
| `reportTiers.plus.refresh` | pricing.ts:102 | PricingOverview, TierSelector | -- | -- | -- | -- |
| `reportTiers.plus.support` | pricing.ts:103 | TierSelector (comparison table) | -- | -- | -- | -- |
| `reportTiers.plus.features[]` | pricing.ts:106-117 | PricingOverview (first 5), TierSelector (first 5), ConfigSummary | -- | -- | -- | -- |
| `reportTiers.plus.bestFor` | pricing.ts:125 | PricingOverview | -- | -- | -- | -- |

### Report Pro

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `reportTiers.pro.basePrice` = **99** | pricing.ts:130 | PricingOverview (`$99`), TierSelector (`$99`) | tests:42-43 (part of 10-loc calc) | qa-validate:55 | -- | -- |
| `reportTiers.pro.additionalLocationPrice` = **49** | pricing.ts:131 | PricingOverview (`+$49`), TierSelector (`+$49`) | tests:42-43 (`99 + 9*49 = 540`) | qa-validate:56 | -- | -- |
| `reportTiers.pro.aiCredits.base` = **400** | pricing.ts:132 | PricingOverview, TierSelector (`400+`) | -- | qa-validate:58 | featureComp:27 `"400 credits"` | -- |
| `reportTiers.pro.aiCredits.perLocation` = **80** | pricing.ts:132 | -- | -- | qa-validate:59 | featureComp:28 `"+80 credits"` | -- |
| `reportTiers.pro.aiSeats` = **5** | pricing.ts:133 | -- | -- | qa-validate:57 | featureComp:37 `"5 seats"` | -- |
| `reportTiers.pro.benchmarkMetrics` = **30** | pricing.ts:134 | TierSelector (comparison table) | -- | -- | featureComp:45 `"30 full metrics"` | -- |
| `reportTiers.pro.benchmarkRadius` = **"1-3km adjustable"** | pricing.ts:135 | TierSelector | -- | -- | featureComp:46 `"1-3km adjustable"` | -- |
| `reportTiers.pro.visuals` = **120** | pricing.ts:137 | PricingOverview, TierSelector | -- | qa-validate:60 | featureComp:16 `"Up to 120 comprehensive"` | -- |
| `reportTiers.pro.refresh` | pricing.ts:140 | PricingOverview, TierSelector | -- | -- | -- | -- |
| `reportTiers.pro.support` | pricing.ts:141 | TierSelector (comparison table) | -- | -- | -- | -- |
| `reportTiers.pro.features[]` | pricing.ts:144-161 | PricingOverview (first 5), TierSelector (first 5), ConfigSummary | -- | -- | -- | -- |
| `reportTiers.pro.bestFor` | pricing.ts:166 | PricingOverview | -- | -- | -- | -- |

---

## 2. Core Tiers (`coreTiers`)

### Core Lite

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `coreTiers.lite.basePrice` = **169** | pricing.ts:179 | PricingOverview (`$169`), TierSelector (`$169`), ConfigSummary | tests:48-49 (part of 5-loc calc) | qa-validate:69 | LayerStack:42 `"Starting at $169/month"`, usePriceCalc:132-133 comment `$169 + (n-1)*$54` | -- |
| `coreTiers.lite.additionalLocationPrice` = **54** | pricing.ts:180 | PricingOverview (`+$54`), TierSelector (`+$54`), pricingCalcs (dynamic) | tests:48-49 (`169 + 4*54 = 385`), tests:57-68 (premium positioning) | qa-validate:70 | usePriceCalc:132-133 comment `$169 + (n-1) * $54` | pricingCalcs reads dynamically from coreTiers |
| `coreTiers.lite.aiCredits.base` = **800** | pricing.ts:181 | PricingOverview, TierSelector (`800+`) | -- | qa-validate:72 | featureComp:135 `"800 credits"` | -- |
| `coreTiers.lite.aiCredits.perLocation` = **160** | pricing.ts:181 | -- | -- | qa-validate:73 | featureComp:136 `"+160 credits"` | -- |
| `coreTiers.lite.aiSeats` = **10** | pricing.ts:182 | -- | -- | qa-validate:71 | featureComp:159 `"10 seats"` | -- |
| `coreTiers.lite.benchmarkMetrics` = **"30+"** | pricing.ts:183 | TierSelector (comparison table) | -- | -- | featureComp:167 `"30+ metrics"` | -- |
| `coreTiers.lite.benchmarkRadius` = **"1-5km"** | pricing.ts:184 | TierSelector | -- | -- | featureComp:168 `"1-5km"` | -- |
| `coreTiers.lite.visuals` = **200** | pricing.ts:185 | PricingOverview, TierSelector | -- | -- | -- | -- |
| `coreTiers.lite.refresh` = **"4-hour refresh cycle"** | pricing.ts:188 | PricingOverview, TierSelector | -- | -- | featureComp:112 `"4-hour cycle"` | -- |
| `coreTiers.lite.support` | pricing.ts:189 | TierSelector (comparison table) | -- | -- | featureComp:228 `"4 hours"` SLA | -- |
| `coreTiers.lite.predictiveDays` = **14** | pricing.ts:193 | -- | -- | qa-validate:74 | featureComp:145 `"14-day"` | -- |
| `coreTiers.lite.customDashboards` = **30** | pricing.ts:191 | -- | -- | qa-validate:75 | featureComp:195 `"30 dashboards"` | -- |
| `coreTiers.lite.features[]` | pricing.ts:197-211 | PricingOverview (first 5), TierSelector (first 5), ConfigSummary | -- | -- | -- | -- |
| `coreTiers.lite.bestFor` | pricing.ts:219 | PricingOverview | -- | -- | -- | -- |

### Core Pro

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `coreTiers.pro.basePrice` = **319** | pricing.ts:226 | PricingOverview (`$319`), TierSelector (`$319`), ConfigSummary | tests:52-53 (part of 5-loc calc), tests:56-68 (premium positioning) | qa-validate:78 | usePriceCalc:134 comment `$319 + (n-1) * $49` | -- |
| `coreTiers.pro.additionalLocationPrice` = **49** | pricing.ts:227 | PricingOverview (`+$49`), TierSelector (`+$49`), pricingCalcs (dynamic) | tests:52-53 (`319 + 4*49 = 515`), tests:56-68 | qa-validate:79 | usePriceCalc:134 comment `$319 + (n-1) * $49` | pricingCalcs reads dynamically from coreTiers |
| `coreTiers.pro.aiCredits.base` = **1400** | pricing.ts:228 | PricingOverview, TierSelector (`1400+`) | -- | qa-validate:81 | featureComp:135 `"1,400 credits"` | -- |
| `coreTiers.pro.aiCredits.perLocation` = **280** | pricing.ts:228 | -- | -- | qa-validate:82 | featureComp:136 `"+280 credits"` | -- |
| `coreTiers.pro.aiSeats` = **20** | pricing.ts:229 | -- | -- | qa-validate:80 | featureComp:159 `"20 seats"` | -- |
| `coreTiers.pro.benchmarkMetrics` = **"30+"** | pricing.ts:230 | TierSelector (comparison table) | -- | -- | featureComp:167 `"30+ metrics"` | -- |
| `coreTiers.pro.benchmarkRadius` = **"0.5-10km"** | pricing.ts:231 | TierSelector | -- | -- | featureComp:168 `"0.5-10km"` | -- |
| `coreTiers.pro.visuals` = **200** | pricing.ts:232 | PricingOverview, TierSelector | -- | -- | -- | -- |
| `coreTiers.pro.refresh` = **"2-hour refresh cycle"** | pricing.ts:235 | PricingOverview, TierSelector | -- | -- | featureComp:112 `"2-hour cycle"` | -- |
| `coreTiers.pro.support` | pricing.ts:236 | TierSelector (comparison table) | -- | -- | featureComp:228 `"2 hours"` SLA | -- |
| `coreTiers.pro.predictiveDays` = **30** | pricing.ts:240 | -- | -- | qa-validate:83 | featureComp:145 `"30-day"` | -- |
| `coreTiers.pro.customDashboards` = **75** | pricing.ts:238 | -- | -- | qa-validate:84 | featureComp:195 `"75 dashboards"` | -- |
| `coreTiers.pro.customKPIs` = **10** | pricing.ts:239 | -- | -- | -- | featureComp:198 `"10 KPIs"` | -- |
| `coreTiers.pro.features[]` | pricing.ts:244-262 | PricingOverview (first 5), TierSelector (first 5), ConfigSummary | -- | -- | -- | -- |
| `coreTiers.pro.bestFor` | pricing.ts:264 | PricingOverview | -- | -- | -- | -- |

### Core Enterprise

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `coreTiers.enterprise.basePrice` = **"Custom"** | pricing.ts:271 | PricingOverview (renders string), TierSelector (renders string), ConfigSummary | -- | -- | -- | String, not number |
| `coreTiers.enterprise.additionalLocationPrice` = **"Volume-based"** | pricing.ts:272 | PricingOverview, TierSelector | -- | -- | -- | String, not number |
| `coreTiers.enterprise.features[]` | pricing.ts:289-309 | PricingOverview (first 5), TierSelector (first 5) | -- | -- | -- | -- |
| `coreTiers.enterprise.bestFor` | pricing.ts:312 | PricingOverview | -- | -- | -- | -- |

---

## 3. Modules (`modules`)

### Labor Intelligence

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.labor.orgLicensePrice` = **139** | pricing.ts:326 | PricingOverview (table), ModulePicker (`$139`+) | tests:72-73 (`toBe(139)`) | validate:29, qa-validate:93 | -- | -- |
| `modules.labor.perLocationPrice` = **19** | pricing.ts:327 | PricingOverview (table), ModulePicker (extra loc calc) | tests:76-77 (`139 + 5*19 = 234`) | qa-validate:94 | -- | -- |
| `modules.labor.includedLocations` = **5** | pricing.ts:328 | ModulePicker (loc threshold) | -- | qa-validate:95 | -- | Affects when per-location kicks in |
| `modules.labor.roiPotential` | pricing.ts:343 | PricingOverview (table), ModulePicker | -- | -- | -- | -- |
| `modules.labor.features[]` | pricing.ts:330-342 | -- | -- | -- | -- | Not rendered in current UI |

### Inventory Connect

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.inventory.orgLicensePrice` = **139** | pricing.ts:349 | PricingOverview (table), ModulePicker | tests:80-81 (`toBe(139)`) | validate:30, qa-validate:98 | -- | -- |
| `modules.inventory.perLocationPrice` = **19** | pricing.ts:350 | PricingOverview (table), ModulePicker | tests:82-83 (`toBe(19)`) | validate:31, qa-validate:99 | -- | -- |
| `modules.inventory.includedLocations` = **5** | pricing.ts:351 | ModulePicker | -- | qa-validate:100 | -- | -- |
| `modules.inventory.roiPotential` | pricing.ts:367 | PricingOverview, ModulePicker | -- | -- | -- | -- |

### Purchasing Analytics

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.purchasing.orgLicensePrice` = **119** | pricing.ts:374 | PricingOverview (table), ModulePicker | tests:85-86 (`toBe(119)`) | validate:32, qa-validate:103 | -- | -- |
| `modules.purchasing.perLocationPrice` = **15** | pricing.ts:375 | PricingOverview (table), ModulePicker | tests:87-88 (`toBe(15)`) | validate:33, qa-validate:104 | -- | -- |
| `modules.purchasing.includedLocations` = **5** | pricing.ts:376 | ModulePicker | tests:90-92 (`119 + 5*15 = 194`) | qa-validate:105 | -- | -- |
| `modules.purchasing.roiPotential` | pricing.ts:390 | PricingOverview, ModulePicker | -- | -- | -- | -- |

### Marketing Performance

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.marketing.orgLicensePrice` = **169** | pricing.ts:398 | PricingOverview (table), ModulePicker | -- | qa-validate:108 | -- | -- |
| `modules.marketing.perLocationPrice` = **25** | pricing.ts:399 | PricingOverview (table), ModulePicker | -- | qa-validate:109 | -- | -- |
| `modules.marketing.includedLocations` = **5** | pricing.ts:400 | ModulePicker | -- | -- | -- | -- |
| `modules.marketing.roiPotential` | pricing.ts:413 | PricingOverview, ModulePicker | -- | -- | -- | -- |

### Reservations Intelligence

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.reservations.orgLicensePrice` = **119** | pricing.ts:421 | PricingOverview (table), ModulePicker | -- | qa-validate:112 | -- | -- |
| `modules.reservations.perLocationPrice` = **15** | pricing.ts:422 | PricingOverview (table), ModulePicker | -- | qa-validate:113 | -- | -- |
| `modules.reservations.includedLocations` = **5** | pricing.ts:423 | ModulePicker | -- | -- | -- | -- |
| `modules.reservations.roiPotential` | pricing.ts:434 | PricingOverview, ModulePicker | -- | -- | -- | -- |

### Profit Intelligence (NEW)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.profit.orgLicensePrice` = **199** | pricing.ts:447 | PricingOverview (table), ModulePicker | -- | -- | -- | Added Jan 2026; no test or validation coverage yet |
| `modules.profit.perLocationPrice` = **29** | pricing.ts:448 | PricingOverview (table), ModulePicker | -- | -- | -- | No test or validation coverage yet |
| `modules.profit.includedLocations` = **5** | pricing.ts:449 | ModulePicker | -- | -- | -- | -- |

### Revenue Assurance (NEW)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.revenue.orgLicensePrice` = **99** | pricing.ts:470 | PricingOverview (table), ModulePicker | -- | -- | -- | Added Jan 2026; no test or validation coverage yet |
| `modules.revenue.perLocationPrice` = **12** | pricing.ts:471 | PricingOverview (table), ModulePicker | -- | -- | -- | No test or validation coverage yet |
| `modules.revenue.includedLocations` = **5** | pricing.ts:472 | ModulePicker | -- | -- | -- | -- |

### Delivery Economics (NEW)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.delivery.orgLicensePrice` = **129** | pricing.ts:491 | PricingOverview (table), ModulePicker | -- | -- | -- | Added Jan 2026; no test or validation coverage yet |
| `modules.delivery.perLocationPrice` = **17** | pricing.ts:492 | PricingOverview (table), ModulePicker | -- | -- | -- | No test or validation coverage yet |
| `modules.delivery.includedLocations` = **5** | pricing.ts:493 | ModulePicker | -- | -- | -- | -- |

### Guest Experience (NEW)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `modules.guest.orgLicensePrice` = **89** | pricing.ts:516 | PricingOverview (table), ModulePicker | -- | -- | -- | Added Jan 2026; no test or validation coverage yet |
| `modules.guest.perLocationPrice` = **10** | pricing.ts:517 | PricingOverview (table), ModulePicker | -- | -- | -- | No test or validation coverage yet |
| `modules.guest.includedLocations` = **5** | pricing.ts:518 | ModulePicker | -- | -- | -- | -- |

---

## 4. Watchtower (`watchtower`)

### Competitive Intelligence

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `watchtower.competitive.basePrice` = **399** | pricing.ts:544 | PricingOverview (`$399`), WatchtowerToggle (`$399 base`) | -- | qa-validate:122 | -- | -- |
| `watchtower.competitive.perLocationPrice` = **49** | pricing.ts:545 | PricingOverview, WatchtowerToggle (`$49 x N locs`) | -- | qa-validate:123 | -- | -- |
| `watchtower.competitive.includedLocations` = **1** | pricing.ts:546 | -- | -- | -- | -- | Base covers first location |
| `watchtower.competitive.features[]` | pricing.ts:548-561 | WatchtowerToggle (first 3) | -- | -- | -- | -- |

### Event & Calendar Signals

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `watchtower.events.basePrice` = **199** | pricing.ts:569 | PricingOverview (`$199`), WatchtowerToggle (`$199 base`) | -- | qa-validate:124 | LayerStack:59 `"From $199/mo"` | LayerStack uses lowest Watchtower price |
| `watchtower.events.perLocationPrice` = **29** | pricing.ts:570 | PricingOverview, WatchtowerToggle | -- | qa-validate:125 | -- | -- |
| `watchtower.events.includedLocations` = **1** | pricing.ts:571 | -- | -- | -- | -- | -- |
| `watchtower.events.features[]` | pricing.ts:573-586 | WatchtowerToggle (first 3) | -- | -- | -- | -- |

### Market Trends

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `watchtower.trends.basePrice` = **249** | pricing.ts:594 | PricingOverview (`$249`), WatchtowerToggle (`$249 base`) | -- | qa-validate:126 | -- | -- |
| `watchtower.trends.perLocationPrice` = **19** | pricing.ts:595 | PricingOverview, WatchtowerToggle | -- | qa-validate:127 | -- | -- |
| `watchtower.trends.includedLocations` = **1** | pricing.ts:596 | -- | -- | -- | -- | -- |
| `watchtower.trends.features[]` | pricing.ts:598-611 | WatchtowerToggle (first 3) | -- | -- | -- | -- |

### Full Watchtower Bundle

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `watchtower.bundle.basePrice` = **720** | pricing.ts:619 | PricingOverview (`$720`), WatchtowerToggle (`$720 base`) | tests:96-97 (`toBe(720)`) | qa-validate:128 | -- | -- |
| `watchtower.bundle.perLocationPrice` = **82** | pricing.ts:620 | PricingOverview, WatchtowerToggle (`$82 x N locs`) | tests:100-101 (`720 + 4*82 = 1048`) | qa-validate:129 | -- | -- |
| `watchtower.bundle.includedLocations` = **1** | pricing.ts:621 | -- | -- | -- | -- | -- |
| `watchtower.bundle.individualBaseTotal` = **847** | pricing.ts:622 | -- | -- | qa-validate:134-135 (verified = `399+199+249`) | -- | Derived value; must equal sum of individual basePrices |
| `watchtower.bundle.individualPerLocTotal` = **97** | pricing.ts:623 | -- | -- | -- | -- | Must equal sum of individual perLocationPrices |
| `watchtower.bundle.baseSavings` = **127** | pricing.ts:624 | PricingOverview (`Save $127/mo`) | tests:112-113 (`toBe(127)`) | qa-validate:130, qa-validate:136 (math check) | -- | Must equal `individualBaseTotal - basePrice` |
| `watchtower.bundle.perLocSavings` = **15** | pricing.ts:625 | -- | -- | -- | -- | Must equal `individualPerLocTotal - perLocationPrice` |
| `watchtower.bundle.savingsPercent` = **15** | pricing.ts:626 | WatchtowerToggle (`15% OFF` text) | tests:111-112 (`toBe(15)`) | validate:36, qa-validate:131 | WatchtowerToggle:173 hard-coded `"BEST VALUE - SAVE 15%"`, WatchtowerToggle:220 `"15% OFF"` | -- |
| `watchtower.bundle.includes` = **['competitive','events','trends']** | pricing.ts:628 | WatchtowerToggle (iterates to show included modules) | -- | -- | -- | -- |
| `watchtower.bundle.icon` | pricing.ts:618 | WatchtowerToggle (emoji render) | -- | -- | -- | -- |
| `watchtower.bundle.features[]` | pricing.ts:629-636 | -- | -- | -- | -- | Not currently rendered in UI |

---

## 5. Client Type Rules (`CLIENT_TYPE_RULES`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `independent.locationRange` = **[1, 2]** | pricing.ts:652 | -- | -- | -- | -- | Used by `detectClientType()` |
| `independent.discountTier` = **0** | pricing.ts:653 | -- | -- | qa-validate:165 | -- | -- |
| `growth.locationRange` = **[3, 24]** | pricing.ts:658 | -- | -- | -- | -- | -- |
| `growth.discountTier` = **10** | pricing.ts:659 | -- | tests:117-126 (10% discount: `1000 -> 900`) | qa-validate:166 | -- | -- |
| `multi-site.locationRange` = **[25, 29]** | pricing.ts:664 | -- | -- | -- | -- | Key is hyphenated `"multi-site"` |
| `multi-site.discountTier` = **15** | pricing.ts:665 | -- | tests:128-136 (15% discount: `1000 -> 850`) | validate:39-41, qa-validate:145-162, qa-validate:167 | -- | -- |
| `enterprise.locationRange` = **[30, null]** | pricing.ts:670 | -- | tests:160-162 (`locationRange[0]` = 30) | validate:42 | -- | Null upper bound = unlimited |
| `enterprise.discountTier` = **0** | pricing.ts:671 | -- | tests:138-146 (`1000 -> 1000`, no discount) | -- | -- | Enterprise uses volume pricing instead |
| `enterprise.pricingModel` = **'enterprise'** | pricing.ts:672 | -- | -- | -- | -- | -- |
| `franchise.locationRange` = **[1, null]** | pricing.ts:676 | -- | -- | -- | -- | -- |
| `franchise.pricingModel` = **'enterprise'** | pricing.ts:678 | -- | -- | -- | -- | -- |

---

## 6. Early Adopter Terms (`EARLY_ADOPTER_TERMS`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `discountPercent` = **20** | pricing.ts:696 | -- | tests:148-156 (stacking: `1000 -> 900 -> 720`), tests:177-178 (`toBe(20)`) | qa-validate:175 | -- | Stacks on remainder after client type discount |
| `priceLockMonths` = **24** | pricing.ts:697 | -- | -- | qa-validate:176 | -- | -- |
| `extendedTrialDays` = **30** | pricing.ts:698 | -- | -- | qa-validate:177 | -- | -- |
| `bonusCredits` = **500** | pricing.ts:699 | -- | tests:179 (`toBe(500)`) | qa-validate:178 | -- | Added to AI credits total in pricingEngine |
| `features[]` | pricing.ts:700-706 | -- | -- | -- | -- | Marketing copy; not rendered in current UI |

---

## 7. Enterprise Pricing (`enterprisePricing`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `minLocations` = **30** | pricing.ts:715 | -- | tests:160-162 (`toBe(30)`) | qa-validate:186 | -- | -- |
| `volumeDiscount.tiers[0]` = **{min:30, max:50, monthly:7500}** | pricing.ts:722 | -- | -- | -- | -- | -- |
| `volumeDiscount.tiers[1]` = **{min:51, max:100, monthly:12000}** | pricing.ts:723 | -- | -- | -- | -- | -- |
| `volumeDiscount.tiers[2]` = **{min:101, max:200, monthly:20000}** | pricing.ts:724 | -- | -- | -- | -- | -- |
| `volumeDiscount.tiers[3]` = **{min:201, max:null, monthly:'Custom'}** | pricing.ts:725 | -- | -- | -- | -- | -- |
| `orgLicense.baseFee` = **2500** | pricing.ts:742 | -- | tests:165-168 (part of 40-loc calc) | -- | -- | -- |
| `orgLicense.perLocationTiers[0]` = **{min:1, max:10, price:99}** | pricing.ts:744 | -- | tests:165-168 (`2500 + 10*99 + ...`) | -- | -- | -- |
| `orgLicense.perLocationTiers[1]` = **{min:11, max:30, price:79}** | pricing.ts:745 | -- | tests:165-168 (`... + 20*79 + ...`) | -- | -- | -- |
| `orgLicense.perLocationTiers[2]` = **{min:31, max:50, price:59}** | pricing.ts:746 | -- | tests:165-168 (`... + 10*59 = 5660`) | -- | -- | -- |
| `orgLicense.perLocationTiers[3]` = **{min:51, max:null, price:49}** | pricing.ts:747 | -- | -- | -- | -- | -- |

---

## 8. Watchtower Enterprise (`watchtowerEnterprise`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `tiers[0].locationRange` = **[30, 50]** | pricing.ts:768 | -- | -- | -- | -- | Used by watchtowerEngine at 30+ locs |
| `tiers[0].bundlePrice` = **2500** | pricing.ts:769 | -- | -- | -- | -- | -- |
| `tiers[0].perModulePricing.competitive` = **1500** | pricing.ts:771 | -- | -- | -- | -- | -- |
| `tiers[0].perModulePricing.events` = **800** | pricing.ts:772 | -- | -- | -- | -- | -- |
| `tiers[0].perModulePricing.trends` = **600** | pricing.ts:773 | -- | -- | -- | -- | -- |
| `tiers[1].locationRange` = **[51, 100]** | pricing.ts:776 | -- | -- | -- | -- | -- |
| `tiers[1].bundlePrice` = **4000** | pricing.ts:778 | -- | -- | -- | -- | -- |
| `tiers[1].perModulePricing.competitive` = **2400** | pricing.ts:780 | -- | -- | -- | -- | -- |
| `tiers[1].perModulePricing.events` = **1200** | pricing.ts:781 | -- | -- | -- | -- | -- |
| `tiers[1].perModulePricing.trends` = **900** | pricing.ts:782 | -- | -- | -- | -- | -- |
| `tiers[2].locationRange` = **[101, null]** | pricing.ts:785 | -- | -- | -- | -- | Custom pricing |

---

## 9. Break-Even Points (`BREAK_EVEN_POINTS`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `sundaeVsTenzo.locations` = **3** | pricing.ts:801 | -- | -- | qa-validate:194 | -- | -- |
| `coreProVsLite.locations` = **null** | pricing.ts:802 | -- | -- | -- | -- | Pro is always more expensive (premium positioning) |
| `enterprise.locations` = **30** | pricing.ts:803 | -- | -- | qa-validate:197 | -- | -- |

---

## 10. Competitor Pricing (`competitorPricing` in pricing.ts)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `tenzo.setupFeePerModulePerLocation` = **350** | pricing.ts:813 | -- | -- | -- | competitorPricing.ts:74 (`350`), pricingAssumptions.ts:25 (`TENZO_SETUP_FEE = 350`) | Must sync across 3 files |
| `tenzo.modules.sales/labor/inventory` = **75** each | pricing.ts:815-817 | -- | -- | -- | competitorPricing.ts:77-79 (`75` each), pricingAssumptions.ts:24 (`TENZO_PER_LOCATION = 75`), pricingEngine.ts:270 (`* 75`) | Must sync across 4 files |

---

## 11. Pricing Footer (`pricingFooter`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `effectiveDate` = **"January 1, 2026"** | pricing.ts:833 | PricingOverview (footer), ConfigSummary (footer) | -- | -- | -- | -- |
| `currency` = **"USD"** | pricing.ts:834 | ConfigSummary (footer) | -- | -- | -- | -- |
| `taxNote` | pricing.ts:835 | PricingOverview (footer), ConfigSummary (footer) | -- | -- | -- | -- |
| `changeNotice` | pricing.ts:836 | PricingOverview (footer), ConfigSummary (footer) | -- | -- | -- | -- |
| `supportHours` | pricing.ts:837 | -- | -- | -- | -- | Not currently rendered |
| `locationPricingNote` | pricing.ts:838 | ConfigSummary (footer) | -- | -- | -- | -- |

---

## 12. Pricing Changelog (`pricingChangelog`)

| Pricing Field | Source File:Line | UI Components | Tests | Validation Scripts | Hard-coded Copies | Notes |
|---|---|---|---|---|---|---|
| `pricingChangelog[]` | pricing.ts:26-41 | -- | -- | -- | -- | Informational only; not imported by any other file |

---

## 13. Hard-coded Pricing Values (NOT imported from pricing.ts)

These values are duplicated outside the source of truth and **must be manually kept in sync**.

| Hard-coded Value | File:Line | Corresponding Source Field | Risk |
|---|---|---|---|
| `"Starting at $0/month"` | LayerStack.tsx:28 | `reportTiers.lite.basePrice` (0) | LOW -- unlikely to change |
| `"Starting at $169/month"` | LayerStack.tsx:42 | `coreTiers.lite.basePrice` (169) | **HIGH** -- will break if Core Lite price changes |
| `"From $199/mo + per-location"` | LayerStack.tsx:59 | `watchtower.events.basePrice` (199, lowest Watchtower price) | **HIGH** -- will break if Events price changes |
| `"BEST VALUE - SAVE 15%"` | WatchtowerToggle.tsx:173 | `watchtower.bundle.savingsPercent` (15) | MEDIUM -- cosmetic but misleading if percent changes |
| `"15% OFF"` | WatchtowerToggle.tsx:220 | `watchtower.bundle.savingsPercent` (15) | MEDIUM -- same as above |
| `$12/$10/$8/seat/mo` (Report AI seats) | featureComparisons.ts:39 | Not in pricing.ts | **HIGH** -- AI seat add-on prices are only in featureComparisons |
| `$5/seat/mo` (Core AI seats) | featureComparisons.ts:161 | Not in pricing.ts | **HIGH** -- Core AI seat add-on price only in featureComparisons |
| `+$19/mo, +$32/mo, +$29/mo` (Report data retention upgrades) | featureComparisons.ts:55-58 | Not in pricing.ts | **HIGH** -- data retention upgrade prices only in featureComparisons |
| `+$29/mo, +$49/mo` (Core data retention upgrades) | featureComparisons.ts:208-209 | Not in pricing.ts | **HIGH** -- data retention upgrade prices only in featureComparisons |
| `$30/$20/$15` (Report 100-credit top-up) | featureComparisons.ts:90 | Not in pricing.ts | **HIGH** -- credit top-up prices only in featureComparisons |
| `$85/$65` (Report 500-credit top-up) | featureComparisons.ts:91 | Not in pricing.ts | **HIGH** -- credit top-up prices only in featureComparisons |
| `$160/$120` (Report 1000-credit top-up) | featureComparisons.ts:92 | Not in pricing.ts | **HIGH** -- credit top-up prices only in featureComparisons |
| `$12/$10` (Core 100-credit top-up) | featureComparisons.ts:236 | Not in pricing.ts | **HIGH** -- Core credit top-up prices only in featureComparisons |
| `$50/$40` (Core 500-credit top-up) | featureComparisons.ts:237 | Not in pricing.ts | **HIGH** -- Core credit top-up prices only in featureComparisons |
| `$90/$70` (Core 1000-credit top-up) | featureComparisons.ts:238 | Not in pricing.ts | **HIGH** -- Core credit top-up prices only in featureComparisons |
| `+$149/mo` (Priority Support) | featureComparisons.ts:239 | Not in pricing.ts | **HIGH** -- support add-on price only in featureComparisons |
| `+$299/mo` (Premium Support) | featureComparisons.ts:240 | Not in pricing.ts | **HIGH** -- support add-on price only in featureComparisons |
| `$100,000` monthly revenue per location | WatchtowerValue.tsx:22 | Not in pricing.ts | LOW -- assumption, not a price |
| `$25/hr` spreadsheet labor rate | pricingAssumptions.ts:10 | Not in pricing.ts | LOW -- competitor assumption |
| `$75/loc/module` Tenzo | pricingAssumptions.ts:24, competitorPricing.ts:73, pricingEngine.ts:270 | `competitorPricing.tenzo` in pricing.ts:815-817 | **MEDIUM** -- duplicated in 4 places |
| `$350` Tenzo setup fee | pricingAssumptions.ts:25, competitorPricing.ts:74 | `competitorPricing.tenzo` in pricing.ts:813 | **MEDIUM** -- duplicated in 3 places |
| `$199/$99/$149` and `$349` (old Watchtower prices) | usePriceCalculation.ts:103-106 (comments only) | **STALE** -- old values | LOW -- comments only, not executed, but misleading |
| `$169 + (n-1)*$54` and `$319 + (n-1)*$49` | usePriceCalculation.ts:132-135 (comments only) | `coreTiers.lite/pro` basePrice + additionalLocationPrice | LOW -- comments only; will be misleading if prices change |

---

## 14. Stale / Misleading References

| Location | Issue | Action Needed |
|---|---|---|
| usePriceCalculation.ts:103-106 | Comments reference old Watchtower prices (`$199/$99/$149`, bundle `$349`). Current prices are `$399/$199/$249`, bundle `$720`. | Update or remove stale comments |
| usePriceCalculation.ts:132-138 | Comments reference `$169 + (n-1)*$54` and `$319 + (n-1)*$49` -- currently correct, but will drift if prices change. | Consider removing hard-coded values from comments |
| usePriceCalculation.ts:106 | `return 98` hard-coded savings -- stale. Current bundle savings = $127 at base. | Fix `getWatchtowerBundleSavings()` to use `watchtower.bundle.baseSavings` instead of `98` |

---

## 15. Coverage Gaps

The following pricing fields from `pricing.ts` have **no test or validation coverage**:

| Field | Added | Risk |
|---|---|---|
| `modules.profit.*` (orgLicensePrice=199, perLocationPrice=29) | Jan 2026 | **HIGH** -- new module, no regression safety net |
| `modules.revenue.*` (orgLicensePrice=99, perLocationPrice=12) | Jan 2026 | **HIGH** -- new module, no regression safety net |
| `modules.delivery.*` (orgLicensePrice=129, perLocationPrice=17) | Jan 2026 | **HIGH** -- new module, no regression safety net |
| `modules.guest.*` (orgLicensePrice=89, perLocationPrice=10) | Jan 2026 | **HIGH** -- new module, no regression safety net |
| `modules.marketing.orgLicensePrice` (169) | Original | MEDIUM -- in qa-validate but not in unit tests |
| `modules.reservations.orgLicensePrice` (119) | Original | MEDIUM -- in qa-validate but not in unit tests |
| `watchtower.competitive.basePrice` (399) | Updated | MEDIUM -- in qa-validate but not in unit tests |
| `watchtower.events.basePrice` (199) | Updated | MEDIUM -- in qa-validate but not in unit tests |
| `watchtower.trends.basePrice` (249) | Updated | MEDIUM -- in qa-validate but not in unit tests |
| `watchtowerEnterprise.*` (all tiers) | Original | MEDIUM -- used by watchtowerEngine but no direct test assertions |
| `enterprisePricing.volumeDiscount.tiers` (7500/12000/20000) | Original | MEDIUM -- no test assertions on tier amounts |
| All `featureComparisons.ts` add-on prices | Original | **HIGH** -- not in pricing.ts at all; no single source of truth |

---

## Quick Reference: What to Update When...

### Changing a Report tier price
1. `src/data/pricing.ts` -- the value itself
2. `__tests__/pricing.test.ts` -- update expected calculation results
3. `scripts/qa-validate-pricing.ts` -- update expected values
4. `scripts/validate-pricing.ts` -- update expected values (if covered)
5. `src/data/featureComparisons.ts` -- update any matching strings (AI credits, seats, etc.)
6. If Report Lite base price changes: update `src/components/ConfigBuilder/LayerStack.tsx:28`

### Changing a Core tier price
1. `src/data/pricing.ts` -- the value itself
2. `__tests__/pricing.test.ts` -- update expected calculation results
3. `scripts/qa-validate-pricing.ts` -- update expected values
4. `src/data/featureComparisons.ts` -- update any matching strings
5. `src/hooks/usePriceCalculation.ts` -- update stale comments (lines 132-138)
6. If Core Lite base price changes: update `src/components/ConfigBuilder/LayerStack.tsx:42`

### Changing a Module price
1. `src/data/pricing.ts` -- the value itself
2. `__tests__/pricing.test.ts` -- update expected calculation results (labor, inventory, purchasing)
3. `scripts/qa-validate-pricing.ts` -- update expected values
4. `scripts/validate-pricing.ts` -- update expected values (labor, inventory, purchasing)

### Changing a Watchtower price
1. `src/data/pricing.ts` -- the value itself (individual AND bundle fields)
2. Recalculate `bundle.individualBaseTotal`, `bundle.baseSavings`, `bundle.individualPerLocTotal`, `bundle.perLocSavings`
3. `__tests__/pricing.test.ts` -- update bundle assertions
4. `scripts/qa-validate-pricing.ts` -- update all Watchtower validations
5. `scripts/validate-pricing.ts` -- update bundle savings validation
6. If Events base price changes: update `src/components/ConfigBuilder/LayerStack.tsx:59`
7. If savings percent changes: update hard-coded `"15%"` strings in WatchtowerToggle.tsx (lines 173, 220)
8. `src/hooks/usePriceCalculation.ts` -- update stale comments (lines 103-106) and hard-coded savings return value (line 106)

### Changing a discount percentage
1. `src/data/pricing.ts` -- the value itself
2. `__tests__/pricing.test.ts` -- update discount stacking test expectations
3. `scripts/qa-validate-pricing.ts` -- update expected discount tier values

### Changing Enterprise pricing
1. `src/data/pricing.ts` -- the value itself
2. `__tests__/pricing.test.ts` -- update `calculateEnterpriseOrg` test
3. `scripts/qa-validate-pricing.ts` -- update enterprise validations
