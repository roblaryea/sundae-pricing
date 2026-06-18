// Crew-path builder — multi-select grid + one-click presets.
//
// Replaces the single-SKU/bundle picker. The visitor either clicks a
// preset (Crew Lite / Operating Suite / Complete Suite) or builds their
// own set by toggling individual Crew SKUs. The store's `toggleCrewSku`
// enforces dependency + mutual-exclusion rules so the UI only has to
// render the current state — no manual dep enforcement here.
//
// Critical behaviors:
//   • crew_lite is mutually exclusive with every other SKU + caps
//     locations at 5 (hard cap from `crewSkus.crew_lite.caps.maxLocations`).
//   • crew_tna requires crew_scheduling OR crew_operations.
//   • crew_payroll requires crew_operations.
//   • crew_people_intelligence requires crew_operations.
//   • crew_operations supersedes crew_scheduling (Scheduling entitlement
//     is included — picking both wouldn't double-charge).

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ChevronRight, Check, Star, Users, Lock, Info } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { crewSkus } from '../../data/pricing';
import { computeCrewQuote, CREW_PRESETS, CREW_SKU_LIST } from '../../lib/crewPricing';
import type { CrewSkuId } from '../../types/configuration';

// Crew Lite hard location cap (mirrors crewSkus.crew_lite.caps.maxLocations).
const LITE_LOCATION_CAP = 5;

export function CrewBuilder() {
  const {
    crewSkus: selectedSkus,
    toggleCrewSku,
    setCrewSkus,
    locations,
    setLocations,
    setCurrentStep,
    markStepCompleted,
  } = useConfiguration();

  const quote = useMemo(
    () => computeCrewQuote(selectedSkus, locations),
    [selectedSkus, locations],
  );

  const isLite = quote.isLiteOnly;
  const sliderMax = isLite ? LITE_LOCATION_CAP : 100;

  // Per-SKU UI state: selected/disabled/note, plus whether the line
  // should render its price as "$0 — Included".
  const skuState = (id: CrewSkuId): {
    isSelected: boolean;
    isDisabled: boolean;
    isIncludedFree: boolean;
    note: string | null;
  } => {
    const isSelected = selectedSkus.includes(id);
    if (selectedSkus.includes('crew_lite')) {
      return {
        isSelected: false,
        isDisabled: true,
        isIncludedFree: false,
        note: 'Disabled while Crew Lite is selected (mutually exclusive)',
      };
    }
    // Operations entitlement includes Scheduling capabilities — the
    // Scheduling tile auto-selects + locks at $0 while Operations is
    // in the set. Unticking Operations reverts Scheduling to its
    // standalone $179 price (the store keeps it in the set).
    if (id === 'crew_scheduling' && selectedSkus.includes('crew_operations')) {
      return {
        isSelected: true,
        isDisabled: true,
        isIncludedFree: true,
        note: 'Included with Operations · $0/mo',
      };
    }
    return { isSelected, isDisabled: false, isIncludedFree: false, note: null };
  };

  const handlePresetClick = (skus: CrewSkuId[]) => {
    setCrewSkus(skus);
  };

  const handleContinue = () => {
    markStepCompleted('tier');
    markStepCompleted('locations');
    markStepCompleted('modules');
    markStepCompleted('watchtower');
    markStepCompleted('roi');
    setCurrentStep(7);
  };

  // Match a preset id by exact SKU-set comparison.
  const activePresetId = useMemo(() => {
    for (const preset of CREW_PRESETS) {
      if (
        preset.skus.length === selectedSkus.length &&
        preset.skus.every((s) => selectedSkus.includes(s))
      ) {
        return preset.id;
      }
    }
    return null;
  }, [selectedSkus]);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className="w-8 h-8 text-[#FF7E6F]" />
          <h1 className="text-3xl md:text-4xl font-bold">Build your Sundae Crew</h1>
        </div>
        <p className="text-base md:text-lg text-sundae-muted max-w-2xl mx-auto">
          Pick a preset or build your own. Dependencies auto-resolve — selecting Payroll attaches
          Operations, selecting T&amp;A attaches Scheduling, and bundle discounts auto-apply.
        </p>
      </motion.div>

      {/* Quick presets row */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-sundae-muted font-semibold mb-3">
          Quick presets
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CREW_PRESETS.map((preset) => {
            const isActive = activePresetId === preset.id;
            return (
              <motion.button
                key={preset.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePresetClick(preset.skus)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'bg-[#FF7E6F]/15 border-[#FF7E6F]'
                    : 'bg-sundae-surface border-white/10 hover:border-[#FF7E6F]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-bold ${isActive ? 'text-[#FF7E6F]' : 'text-[#FF7E6F]'}`}>
                    {preset.label}
                  </h3>
                  {isActive ? (
                    <Check className="w-4 h-4 text-[#FF7E6F]" />
                  ) : (
                    <Star className="w-4 h-4 text-sundae-muted" />
                  )}
                </div>
                <p className="text-xs text-sundae-muted leading-snug">{preset.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Or build your own */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-sundae-muted font-semibold">
            Or build your own
          </p>
          <p className="text-[10px] text-sundae-muted">
            Dependencies auto-attach · Bundle discount applied automatically when matched
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CREW_SKU_LIST.map((id) => {
            const sku = crewSkus[id];
            const state = skuState(id);
            return (
              <motion.button
                key={id}
                whileHover={state.isDisabled ? undefined : { y: -2 }}
                whileTap={state.isDisabled ? undefined : { scale: 0.98 }}
                onClick={() => !state.isDisabled && toggleCrewSku(id)}
                disabled={state.isDisabled}
                className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                  state.isSelected
                    ? 'bg-[#FF7E6F]/10 border-[#FF7E6F]'
                    : state.isDisabled
                      ? 'bg-sundae-surface/40 border-white/5 opacity-60 cursor-not-allowed'
                      : 'bg-sundae-surface border-white/10 hover:border-[#FF7E6F]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`text-sm font-bold ${state.isSelected ? 'text-[#FF7E6F]' : 'text-[#FF7E6F]'}`}>
                    {sku.name}
                  </h3>
                  {state.isSelected ? (
                    <Check className="w-4 h-4 text-[#FF7E6F] flex-shrink-0" />
                  ) : state.isDisabled ? (
                    <Lock className="w-3.5 h-3.5 text-sundae-muted flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-white/20 rounded flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-sundae-muted leading-snug mb-2 line-clamp-2">
                  {sku.description}
                </p>
                {state.isIncludedFree ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-emerald-300 tabular-nums">$0</span>
                    <span className="text-[11px] text-sundae-muted line-through tabular-nums">
                      ${sku.orgLicensePrice}/mo
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold text-white tabular-nums">
                      ${sku.orgLicensePrice}
                    </span>
                    <span className="text-[11px] text-sundae-muted">
                      /mo + ${sku.perLocationPrice}/loc
                    </span>
                  </div>
                )}
                {'prerequisiteMessage' in sku && sku.prerequisiteMessage && (
                  <p className="text-[10px] font-medium text-amber-300/80 mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {sku.prerequisiteMessage}
                  </p>
                )}
                {state.note && (
                  <p className={`text-[10px] font-medium mt-1.5 flex items-center gap-1 ${
                    state.isIncludedFree ? 'text-emerald-300' : 'text-[#FF7E6F]/80'
                  }`}>
                    <Info className="w-3 h-3" />
                    {state.note}
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Locations slider */}
      <div className="bg-sundae-surface rounded-xl p-5 mb-5 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-base mb-1">Locations</h3>
            <p className="text-xs text-sundae-muted">
              {isLite
                ? `Crew Lite caps at ${LITE_LOCATION_CAP} locations. For 6+ outlets, switch to the Operating Suite or build your own.`
                : 'How many physical locations will run Crew?'}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold text-[#FF7E6F] tabular-nums">{locations}</div>
            <p className="text-xs text-sundae-muted">
              {locations === 1 ? '1 location' : `${locations} locations`}
            </p>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={sliderMax}
          value={Math.min(locations, sliderMax)}
          onChange={(e) => setLocations(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-sundae-muted mt-2">
          <span>1</span>
          {isLite ? (
            <>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>{LITE_LOCATION_CAP}</span>
            </>
          ) : (
            <>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100+</span>
            </>
          )}
        </div>
      </div>

      {/* Live price summary */}
      {selectedSkus.length === 0 ? (
        <div className="bg-sundae-surface/60 border border-white/10 rounded-xl p-5 mb-5 text-center text-sm text-sundae-muted">
          Pick a preset or toggle at least one SKU to see your live Crew quote.
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#FF7E6F]/10 to-teal-600/5 border-2 border-[#FF7E6F]/30 rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between mb-3 gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-sundae-muted font-semibold mb-1">
                {quote.detectedBundleId ? 'Bundle auto-detected · 20% off' : 'Your Crew stack'}
              </p>
              <h3 className="text-lg font-bold text-white truncate">
                {quote.detectedBundleId
                  ? quote.lines[0].label
                  : `${selectedSkus.length} SKU${selectedSkus.length === 1 ? '' : 's'} selected`}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="font-display text-3xl font-bold text-white tabular-nums">${quote.monthly}</span>
                <span className="text-sm text-sundae-muted">/mo</span>
              </div>
              <p className="text-xs text-sundae-muted">${quote.annual.toLocaleString()}/yr</p>
            </div>
          </div>
          <div className="space-y-1 pt-3 border-t border-[#FF7E6F]/20">
            {quote.lines.map((line) => {
              const isFreeIncluded = line.monthly === 0 && line.id === 'crew_scheduling';
              return (
                <div key={line.id} className="flex justify-between text-xs">
                  <span className="text-sundae-muted truncate pr-2">
                    {line.label}
                    {isFreeIncluded && (
                      <span className="text-[10px] text-emerald-300 ml-1">· included</span>
                    )}
                    {line.billableExtras > 0 && (
                      <span className="text-[10px] opacity-70">
                        {' '}· {line.billableExtras} extra × ${line.perLoc}
                      </span>
                    )}
                  </span>
                  <span
                    className={`tabular-nums flex-shrink-0 ${
                      isFreeIncluded ? 'text-emerald-300' : 'text-white'
                    }`}
                  >
                    ${line.monthly}
                  </span>
                </div>
              );
            })}
            {quote.setupFee > 0 && (
              <div className="flex justify-between text-xs pt-2 mt-2 border-t border-[#FF7E6F]/10">
                <span className="text-sundae-muted">One-time setup</span>
                <span className="text-white tabular-nums">${quote.setupFee}</span>
              </div>
            )}
            {quote.bundleSavingsMonthly > 0 && (
              <div className="flex justify-between text-xs pt-2 mt-2 border-t border-[#FF7E6F]/10">
                <span className="text-emerald-300 font-semibold">Bundle savings</span>
                <span className="text-emerald-300 tabular-nums font-semibold">
                  −${quote.bundleSavingsMonthly}/mo
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue */}
      <div className="flex justify-end">
        <motion.button
          whileHover={selectedSkus.length === 0 ? undefined : { scale: 1.02 }}
          whileTap={selectedSkus.length === 0 ? undefined : { scale: 0.98 }}
          onClick={handleContinue}
          disabled={selectedSkus.length === 0}
          className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all ${
            selectedSkus.length === 0
              ? 'bg-sundae-surface text-sundae-muted cursor-not-allowed opacity-50'
              : 'bg-gradient-primary text-white shadow-[#FF7E6F]/20'
          }`}
        >
          Review summary
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
