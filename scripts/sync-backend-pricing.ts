/**
 * BACKEND PRICING RECONCILIATION — DISABLED PENDING A v1.7 BACKEND CATALOG
 *
 * This script used to diff the pricing-site catalog against
 * `sundae-backend/config/pricing_master.ts` MODULE_PRICING, comparing each
 * module's `orgLicensePrice`, `perLocationPrice`, `baseIncludesLocations`,
 * `setupFee` and `pricingByTier.core_lite`.
 *
 * Every one of those fields was removed by price book v1.7:
 *   • The eleven Core domain modules became PACKAGE COMPONENTS with no price.
 *   • `baseIncludesLocations` and flat per-location rates were replaced by a
 *     first-unit anchor plus MARGINAL bands.
 *   • The per-module setup-fee ladder was replaced by implementation classes
 *     charged once at the highest class in the selection.
 *   • `core_lite` / `core_pro` are retired ids and must not be reconciled
 *     against — a "match" on them would mean the site is still selling them.
 *
 * Reconciling against the old shape would now compare nothing and report a
 * false all-clear, which is worse than no check. The script therefore refuses
 * to run until the backend publishes a v1.7-shaped catalog (core packages with
 * `firstUnitPrice` + `marginalBands`, Foresight & Action, concept SKUs,
 * implementation classes) and this diff is rewritten against it.
 *
 * The live-catalog overlay in `src/data/livePricing.ts` already reads the
 * v1.7 shape and drops retired ids, so it is the reference for what the
 * backend needs to expose.
 */

const message = [
  '',
  '⛔ sync:backend-pricing is disabled after the price book v1.7 cutover.',
  '',
  '   The fields this script reconciled (module orgLicensePrice / perLocationPrice /',
  '   baseIncludesLocations / setupFee / pricingByTier.core_lite) no longer exist:',
  '   domain modules are package components with no price, and Core is priced with a',
  '   first-unit anchor plus marginal bands.',
  '',
  '   Rewrite this diff against a v1.7-shaped backend catalog before re-enabling.',
  '   See src/data/livePricing.ts for the shape the backend needs to publish.',
  '',
].join('\n');

console.error(message);
process.exit(1);
