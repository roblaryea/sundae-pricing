// Crew-path builder — consolidates SKU pick + locations + price preview
// into a single step component. Used by Simulator.tsx when the visitor
// selected `Crew` on the LayerStack instead of Report or Core.
//
// The Crew path skips the Report/Core-specific TierSelector / ModulePicker
// / WatchtowerToggle / ROISimulator steps because Crew is its own
// operational substrate with its own bundle math (auto-applied 20%
// discount when the Operating Suite / Complete Suite is selected).

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ChevronRight, Check, Star, Users, AlertCircle } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { crewSkus, crewBundles } from '../../data/pricing';
import type { CrewSkuSelection } from '../../types/configuration';

// Bundles render in the top-of-grid as the headline "best value" path.
const SKU_CARDS: Array<{
  id: CrewSkuSelection;
  source: 'sku' | 'bundle';
}> = [
  { id: 'crew_suite_bundle', source: 'bundle' },
  { id: 'crew_complete_bundle', source: 'bundle' },
  { id: 'crew_lite', source: 'sku' },
  { id: 'crew_scheduling', source: 'sku' },
  { id: 'crew_operations', source: 'sku' },
  { id: 'crew_tna', source: 'sku' },
  { id: 'crew_payroll', source: 'sku' },
  { id: 'crew_people_intelligence', source: 'sku' },
];

function getSkuRecord(id: CrewSkuSelection) {
  if (id in crewBundles) {
    return { record: crewBundles[id as keyof typeof crewBundles], source: 'bundle' as const };
  }
  return { record: crewSkus[id as keyof typeof crewSkus], source: 'sku' as const };
}

interface CrewPriceLine {
  label: string;
  value: number;
}

export function CrewBuilder() {
  const {
    crewSku,
    setCrewSku,
    locations,
    setLocations,
    setCurrentStep,
    markStepCompleted,
  } = useConfiguration();

  const selectedId: CrewSkuSelection = crewSku ?? 'crew_suite_bundle';
  const { record: selected, source: selectedSource } = getSkuRecord(selectedId);

  // Pricing math: base license + (perLocationPrice × locations beyond
  // baseIncludedLocations). SKUs include 1-3 locations in the base; bundles
  // include 3 by default. Negative diffs clamp to 0.
  const pricing = useMemo<{
    monthly: number;
    annual: number;
    setup: number;
    lines: CrewPriceLine[];
  }>(() => {
    const orgLicense = 'orgLicensePrice' in selected ? selected.orgLicensePrice : selected.basePrice;
    const perLoc = selected.perLocationPrice;
    const includedLocations = 'baseIncludesLocations' in selected ? selected.baseIncludesLocations : 3;
    const billableExtras = Math.max(0, locations - includedLocations);
    const monthly = orgLicense + perLoc * billableExtras;
    const setup = selected.setupFee ?? 0;

    return {
      monthly,
      annual: monthly * 12,
      setup,
      lines: [
        { label: 'Org license', value: orgLicense },
        {
          label: `${billableExtras} extra location${billableExtras === 1 ? '' : 's'} × $${perLoc}`,
          value: perLoc * billableExtras,
        },
      ],
    };
  }, [selected, locations]);

  const handleSelectSku = (id: CrewSkuSelection) => {
    setCrewSku(id);
  };

  const handleContinue = () => {
    markStepCompleted('tier');
    markStepCompleted('locations');
    markStepCompleted('modules');
    markStepCompleted('watchtower');
    markStepCompleted('roi');
    // Jump straight to summary (step 7 in the existing journey array).
    setCurrentStep(7);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Users className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl md:text-4xl font-bold">Build your Sundae Crew</h1>
        </div>
        <p className="text-lg text-sundae-muted max-w-2xl mx-auto">
          Pick the Crew SKU or bundle that matches the workforce ops you run today.
          You can change locations next — the price recalculates live.
        </p>
      </motion.div>

      {/* SKU + bundle grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SKU_CARDS.map(({ id, source }) => {
          const { record } = getSkuRecord(id);
          const isSelected = selectedId === id;
          const isBundle = source === 'bundle';
          const orgLicense = 'orgLicensePrice' in record ? record.orgLicensePrice : record.basePrice;
          const tier = 'tier' in record ? record.tier : 'Bundle';

          return (
            <motion.button
              key={id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectSku(id)}
              className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-400'
                  : 'bg-sundae-surface border-white/10 hover:border-cyan-400/40'
              }`}
            >
              {isBundle && (
                <div className="absolute -top-2 left-3">
                  <div className="bg-gradient-primary text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    BUNDLE
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-base font-bold ${isSelected ? 'text-cyan-300' : 'text-cyan-400'}`}>
                  {record.name}
                </h3>
                {isSelected ? (
                  <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                ) : (
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-sundae-muted">
                    {tier}
                  </span>
                )}
              </div>
              <p className="text-xs text-sundae-muted leading-snug mb-3 line-clamp-3">
                {record.description}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white tabular-nums">${orgLicense}</span>
                <span className="text-xs text-sundae-muted">/mo + ${record.perLocationPrice}/loc</span>
              </div>
              {'prerequisiteMessage' in record && record.prerequisiteMessage ? (
                <p className="text-[10px] font-medium text-amber-300/80 mt-2">
                  {record.prerequisiteMessage}
                </p>
              ) : null}
              {isBundle && 'baseSavings' in record && (
                <p className="text-[10px] font-semibold text-emerald-300 mt-2">
                  Save ${record.baseSavings}/mo · 20% bundle discount
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Locations slider */}
      <div className="bg-sundae-surface rounded-xl p-6 mb-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base mb-1">Locations</h3>
            <p className="text-xs text-sundae-muted">
              How many physical locations will run Crew?
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-cyan-400 tabular-nums">{locations}</div>
            <p className="text-xs text-sundae-muted">
              {locations === 1 ? '1 location' : `${locations} locations`}
            </p>
          </div>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={locations}
          onChange={(e) => setLocations(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
        <div className="flex justify-between text-[10px] uppercase tracking-wider text-sundae-muted mt-2">
          <span>1</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100+</span>
        </div>
      </div>

      {/* Live price summary */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-teal-600/5 border-2 border-cyan-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-cyan-300 font-semibold mb-1">
              Your Crew {selectedSource === 'bundle' ? 'bundle' : 'SKU'}
            </p>
            <h3 className="text-xl font-bold text-white truncate">{selected.name}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-bold text-white tabular-nums">${pricing.monthly}</span>
              <span className="text-sm text-sundae-muted">/mo</span>
            </div>
            <p className="text-xs text-sundae-muted">${pricing.annual.toLocaleString()}/yr</p>
          </div>
        </div>
        <div className="space-y-1.5 pt-4 border-t border-cyan-500/20">
          {pricing.lines.filter((line) => line.value > 0).map((line) => (
            <div key={line.label} className="flex justify-between text-sm">
              <span className="text-sundae-muted">{line.label}</span>
              <span className="text-white tabular-nums">${line.value}</span>
            </div>
          ))}
          {pricing.setup > 0 && (
            <div className="flex justify-between text-xs pt-2 mt-2 border-t border-cyan-500/10">
              <span className="text-sundae-muted">One-time setup</span>
              <span className="text-white tabular-nums">${pricing.setup}</span>
            </div>
          )}
        </div>
      </div>

      {/* BYO-HR strategic note */}
      <div className="mb-8 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex gap-2.5 items-start">
        <AlertCircle className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-sundae-muted leading-snug">
          <strong className="text-white">BYO-HR supported.</strong> Already on Bayzat, Personio, Pento, Gusto, or BambooHR? Crew can stay off — Sundae still consolidates the workforce signal into Labor Intelligence.
        </p>
      </div>

      {/* Continue */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleContinue}
          className="px-6 py-3 bg-gradient-primary text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          Review summary
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
