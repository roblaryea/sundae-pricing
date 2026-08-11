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
  calculateBandedTotal,
  calculateForesightActionPrice,
} from '../../lib/pricingEngine';
import { recommendedConceptSkus } from '../../lib/discoveryEngine';
import type { AddOnId } from '../../lib/pricingEngine';
import { stepIndex } from '../../lib/journey';
import { fadeUp, selectableCard, staggerChildren, useReducedMotionSafe } from '../../lib/motion';

export function ModulePicker() {
  const {
    layer,
    corePackage,
    locations,
    addOns,
    toggleAddOn,
    setCurrentStep,
    operatingModels,
  } = useConfiguration();
  const { locale, messages } = useLocale();
  const reduced = useReducedMotionSafe();
  const card = selectableCard(reduced);
  const copy = messages.builder.modulePicker;
  const moduleCatalog = messages.catalog.modules;

  const pricing = usePriceCalculation(layer, corePackage, locations, addOns, []);
  const pkg = corePackages[corePackage];

  const fmt = (value: number) => `$${value.toLocaleString(locale)}`;

  // Concept pathways matching the operating model the visitor already gave are
  // surfaced FIRST and badged. Six unlabelled pathways ask a franchisor to
  // recognise which one is theirs; the answer was collected at question two.
  const recommendedConcepts = recommendedConceptSkus(operatingModels);
  const orderedConceptIds = [
    ...CONCEPT_SKU_IDS.filter((id) => recommendedConcepts.includes(id)),
    ...CONCEPT_SKU_IDS.filter((id) => !recommendedConcepts.includes(id)),
  ];

  const handleContinue = () => setCurrentStep(stepIndex('watchtower'));
  const handleBack = () => setCurrentStep(stepIndex('tier'));

  const getModuleIcon = (moduleId: string) =>
    MODULE_ICONS[moduleId as keyof typeof MODULE_ICONS] || MODULE_ICONS.labor;

  const foresightTotal = calculateForesightActionPrice(locations);
  const foresightBands = calculateBandLines(foresightAction, locations);

  const isSelected = (id: AddOnId) => addOns.includes(id);

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.title}</h1>
        <p className="text-xl text-sundae-muted">{copy.subtitle}</p>
      </motion.div>

      {/* ── 1. Included with the package (NOT purchasable) ───────────────── */}
      <motion.section
        variants={fadeUp(reduced, 0.04)}
        initial="hidden"
        animate="visible"
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

      {/* One stagger container for the whole add-on grid. The lift and the
          press live in `selectableCard`, whose tween replaces framer's default
          spring — the default is under-damped and every one of these cards
          overshot its resting size before settling back. */}
      <motion.div
        variants={staggerChildren(reduced, orderedConceptIds.length + 1)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
      >
        {/* Foresight & Action — banded */}
        <motion.button
          onClick={() => toggleAddOn('foresight_action')}
          aria-pressed={isSelected('foresight_action')}
          data-testid="addon-foresight_action"
          variants={fadeUp(reduced)}
          {...card}
          className={`w-full h-full p-6 rounded-xl border-2 transition-colors text-left relative ${
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
        {orderedConceptIds.map((conceptId) => {
          const concept = conceptSkus[conceptId];
          const conceptTotal = calculateBandedTotal(concept, locations);
          const conceptLines = calculateBandLines(concept, locations);
          const isRecommended = recommendedConcepts.includes(conceptId);
          return (
            <motion.button
              key={conceptId}
              onClick={() => toggleAddOn(conceptId)}
              aria-pressed={isSelected(conceptId)}
              data-testid={`addon-${conceptId}`}
              variants={fadeUp(reduced)}
              {...card}
              className={`w-full h-full p-6 rounded-xl border-2 transition-colors text-left relative ${
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
              {/* Recommended straight from the operating model the visitor gave
                  at the start. A franchisor should not have to recognise which
                  of six pathways is theirs. */}
              {isRecommended && !isSelected(conceptId) && (
                <div className="absolute -top-2.5 left-4 rounded-full bg-[#E9A24A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
                  Matches your operating model
                </div>
              )}
              <h3 className="font-bold text-lg mb-2">{concept.name}</h3>
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span
                    className="font-display text-2xl font-bold tabular-nums"
                    data-testid={`addon-price-${conceptId}`}
                  >
                    {fmt(conceptTotal)}
                  </span>
                  <span className="text-sm text-sundae-muted">{copy.perMonth}</span>
                </div>
                {/* Concept pathways are BANDED, not flat. The old copy said
                    "Flat monthly — not per location", which understated a
                    25-location estate by up to $2,055/mo while asserting the
                    mechanic that made it wrong. */}
                <p className="text-xs text-sundae-muted mt-1">
                  {locations === 1
                    ? `First location ${fmt(concept.firstUnitPrice)}`
                    : `${fmt(concept.firstUnitPrice)} + ${conceptLines
                        .map((l) => `${l.units}×${fmt(l.band.pricePerUnit)}`)
                        .join(' + ')}`}
                </p>
              </div>
              <p className="text-xs text-sundae-muted">{concept.description}</p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Cross-Intelligence: always on with a Core package */}
      <motion.div
        variants={fadeUp(reduced, 0.04)}
        initial="hidden"
        animate="visible"
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

      {/* Running total — the number the visitor is on this screen for, so it
          does not queue behind the cards it is summing. */}
      <motion.div
        variants={fadeUp(reduced, 0.06)}
        initial="hidden"
        animate="visible"
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

      {/* Navigation — a 400ms delay on the only way forward was the clearest
          case of decoration blocking content on this step. */}
      <motion.div
        variants={fadeUp(reduced, 0.06)}
        initial="hidden"
        animate="visible"
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
