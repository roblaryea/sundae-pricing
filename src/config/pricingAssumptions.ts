// Canonical pricing assumptions and constants
// Single source of truth for competitor comparison calculations

/**
 * Labor rate assumptions for competitor cost modeling
 * Updated: January 2026
 */

// Spreadsheets competitor: Analyst labor cost
export const SPREADSHEETS_LABOR_RATE_USD = 25; // $25/hour (was $35)

// Power BI competitor: Implementation/maintenance labor cost
// (Power BI uses different cost model - not hourly rate)
export const POWER_BI_IMPLEMENTATION_COST_SMALL = 50000;
export const POWER_BI_IMPLEMENTATION_COST_MEDIUM = 75000;
export const POWER_BI_IMPLEMENTATION_COST_LARGE = 150000;
export const POWER_BI_MAINTENANCE_COST_SMALL = 20000;
export const POWER_BI_MAINTENANCE_COST_MEDIUM = 35000;
export const POWER_BI_MAINTENANCE_COST_LARGE = 50000;

/**
 * Tenzo pricing (verified January 2026)
 */
export const TENZO_PER_LOCATION_PER_MODULE = 75;
export const TENZO_SETUP_FEE_PER_MODULE_PER_LOCATION = 350;

/**
 * Guards to prevent regressions
 */
if (SPREADSHEETS_LABOR_RATE_USD !== 25) {
  console.warn('⚠️ SPREADSHEETS_LABOR_RATE_USD should be $25/hr');
}
