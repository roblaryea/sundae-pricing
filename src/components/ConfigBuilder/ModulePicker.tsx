// Add-on picker (price book v1.7).
//
// Two distinct things live on this step, and conflating them is what the old
// build got wrong:
//   1. The eleven Core DOMAIN modules — PACKAGE COMPONENTS. Shown as what the
//      chosen package already includes. No price, no checkbox, no purchase.
//   2. The genuinely optional add-ons — Foresight & Action (banded) and the
//      concept SKUs (flat monthly). These are selectable.

import { motion } from 'framer-motion';
import { Check, Zap, TrendingUp, ChevronLeft, Sparkles, Lock } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import {
  conceptSkus,
  CONCEPT_SKU_IDS,
  corePackages,
  foresightAction,
  modules as coreDomainModules,
} from '../../data/pricing';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { MODULE_ICONS } from '../../constants/icons';
import { useLocale } from '../../contexts/LocaleContext';
import {
  calculateBandLines,
  calculateForesightActionPrice,
} from '../../lib/pricingEngine';
import type { AddOnId } from '../../lib/pricingEngine';

export function ModulePicker() {
  const {
    layer,
    corePackage,
    locations,
    addOns,
    toggleAddOn,
    setCurrentStep,
  } = useConfiguration();
  const { locale, messages } = useLocale();
  const copy = messages.builder.modulePicker;
  const moduleCatalog = messages.catalog.modules;

  const pricing = usePriceCalculation(layer, corePackage, locations, addOns, []);
  const pkg = corePackages[corePackage];

  const fmt = (value: number) => `$${value.toLocaleString(locale)}`;

  const handleContinue = () => setCurrentStep(5);
  const handleBack = () => setCurrentStep(3);

  const getModuleIcon = (moduleId: string) =>
    MODULE_ICONS[moduleId as keyof typeof MODULE_ICONS] || MODULE_ICONS.labor;

  const foresightTotal = calculateForesightActionPrice(locations);
  const foresightBands = calculateBandLines(foresightAction, locations);

  const isSelected = (id: AddOnId) => addOns.includes(id);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.title}</h1>
        <p className="text-xl text-sundae-muted">{copy.subtitle}</p>
      </motion.div>

      {/* ── 1. Included with the package (NOT purchasable) ───────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 p-6 rounded-xl border border-white/10 bg-sundae-surface"
      >
        <div className="flex items-start gap-3 mb-5">
          <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold">Included in {pkg.name}</h2>
            <p className="text-sm text-sundae-muted">
              All {Object.keys(coreDomainModules).length} Core domain modules ship with every Core
              package. They are components of the package, not separate purchases.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(coreDomainModules).map(([moduleId, module]) => {
            const localizedModule = moduleCatalog[moduleId as keyof typeof moduleCatalog];
            const IconComponent = getModuleIcon(moduleId);
            return (
              <div
                key={moduleId}
                className="flex items-start gap-3 p-3 rounded-lg bg-sundae-dark/40 border border-white/5"
                data-testid={`included-module-${moduleId}`}
              >
                <IconComponent className="w-6 h-6 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {localizedModule?.name ?? module.name}
                  </div>
                  <div className="text-xs text-green-400">
                    {localizedModule?.roi ?? module.roiPotential}
                  </div>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-sundae-muted flex-shrink-0">
                  <Lock className="w-3 h-3" />
                  Included
                </span>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* ── 2. Optional add-ons ──────────────────────────────────────────── */}
      <h2 className="text-2xl font-bold mb-2">Optional add-ons</h2>
      <p className="text-sundae-muted mb-6">
        Sold alongside your Core package. Nothing here is required.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Foresight & Action — banded */}
        <motion.button
          onClick={() => toggleAddOn('foresight_action')}
          data-testid="addon-foresight_action"
          whileHover={{ y: -4 }}
          className={`w-full h-full p-6 rounded-xl border-2 transition-all text-left relative ${
            isSelected('foresight_action')
              ? 'bg-gradient-to-br from-sundae-accent/20 to-[#FF5C4D]/20 border-sundae-accent/50'
              : 'bg-sundae-surface border-white/10 hover:border-white/30'
          }`}
        >
          {isSelected('foresight_action') && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="w-8 h-8 flex-shrink-0 text-[#E9A24A]" />
            <div>
              <h3 className="font-bold text-lg">{foresightAction.name}</h3>
              <p className="text-xs text-sundae-muted">{foresightAction.tagline}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span
                className="font-display text-2xl font-bold tabular-nums"
                data-testid="addon-price-foresight_action"
              >
                {fmt(foresightTotal)}
              </span>
              <span className="text-sm text-sundae-muted">{copy.perMonth}</span>
            </div>
            <p className="text-xs text-sundae-muted mt-1">
              {fmt(foresightAction.firstUnitPrice)} first location
              {locations > 1 && (
                <>
                  {' '}
                  +{' '}
                  {foresightBands
                    .map((line) => `${line.units} × ${fmt(line.band.pricePerUnit)}`)
                    .join(' + ')}
                </>
              )}
            </p>
          </div>

          <ul className="space-y-1">
            {foresightAction.features.slice(0, 4).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-sundae-muted">
                <Check className="w-3 h-3 text-sundae-accent mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.button>

        {/* Concept SKUs — flat monthly */}
        {CONCEPT_SKU_IDS.map((conceptId) => {
          const concept = conceptSkus[conceptId];
          return (
            <motion.button
              key={conceptId}
              onClick={() => toggleAddOn(conceptId)}
              data-testid={`addon-${conceptId}`}
              whileHover={{ y: -4 }}
              className={`w-full h-full p-6 rounded-xl border-2 transition-all text-left relative ${
                isSelected(conceptId)
                  ? 'bg-gradient-to-br from-sundae-accent/20 to-[#FF5C4D]/20 border-sundae-accent/50'
                  : 'bg-sundae-surface border-white/10 hover:border-white/30'
              }`}
            >
              {isSelected(conceptId) && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              <h3 className="font-bold text-lg mb-2">{concept.name}</h3>
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display text-2xl font-bold tabular-nums"
                    data-testid={`addon-price-${conceptId}`}
                  >
                    {fmt(concept.monthlyPrice)}
                  </span>
                  <span className="text-sm text-sundae-muted">{copy.perMonth}</span>
                </div>
                <p className="text-xs text-sundae-muted mt-1">Flat monthly — not per location</p>
              </div>
              <p className="text-xs text-sundae-muted">{concept.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Cross-Intelligence: always on with a Core package */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 p-4 bg-gradient-to-r from-[#E9A24A]/20 to-[#FF7E6F]/20 rounded-lg border border-[#E9A24A]/30"
      >
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-[#E9A24A]" />
          <div>
            <span className="font-semibold text-[#E9A24A]">{copy.crossUnlocked}</span>
            <span className="ml-2 text-sm text-sundae-muted">
              The correlation engine is included with every Core package.
            </span>
          </div>
        </div>
      </motion.div>

      {/* Running total */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 p-6 bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-sundae-muted mb-1">{copy.totalWithModules}</div>
            <div className="font-display text-3xl font-bold tabular-nums">
              {fmt(pricing.total)}
              {copy.perMonth}
            </div>
            <div className="text-sm text-sundae-muted mt-1">
              {addOns.length} add-on{addOns.length === 1 ? '' : 's'} selected
            </div>
          </div>

          {(() => {
            const tenzoMonthly = pricing.savings.tenzo.monthly;
            const monthlySavings = tenzoMonthly - pricing.total;
            const savingsPercent = tenzoMonthly > 0 ? (monthlySavings / tenzoMonthly) * 100 : 0;

            return monthlySavings > 0 ? (
              <div className="text-right">
                <div className="text-sm text-sundae-muted mb-1">{copy.vsTenzo}</div>
                <div className="font-display text-2xl font-bold text-green-400">
                  {fmt(Math.round(monthlySavings))}
                </div>
                <div className="text-sm text-green-400">
                  {Math.round(savingsPercent)}% less
                </div>
              </div>
            ) : null;
          })()}
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-32 flex items-center justify-between relative z-50"
      >
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sundae-surface hover:bg-sundae-surface-hover border border-white/10 hover:border-white/20 transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          {copy.back}
        </button>

        <div className="text-center">
          <button
            onClick={handleContinue}
            className="button-primary inline-flex items-center gap-2 relative z-50"
            data-testid="continue-button-modules"
          >
            <span>{copy.continueToWatchtower}</span>
            {addOns.length === 0 && <span className="text-sm opacity-75">{copy.optional}</span>}
          </button>

          {addOns.length === 0 && (
            <p className="text-sm text-sundae-muted mt-2 flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {copy.skipModules}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
