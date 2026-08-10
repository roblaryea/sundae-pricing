// Core PACKAGE selector (price book v1.7).
//
// Replaces the retired Report / Core Lite / Core Pro tier picker. Each card
// shows the FIRST-UNIT anchor and the MARGINAL band table — never a flat
// per-location rate, and never an "includes N locations" allowance.

import { motion } from 'framer-motion';
import { Check, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { corePackages, CORE_PACKAGE_IDS, modules as coreDomainModules } from '../../data/pricing';
import type { CorePackageId } from '../../data/pricing';
import { calculateBandedTotal, calculateBandLines } from '../../lib/pricingEngine';
import { suggestOptimalCorePackage } from '../../hooks/usePriceCalculation';
import { useLivePricingCatalog } from '../../data/livePricing';
import { useLocale } from '../../contexts/LocaleContext';

const PACKAGE_COLORS: Record<CorePackageId, string> = {
  core_foundation: '#E9A24A',
  core_margin: '#FF7E6F',
  core_growth: '#FF5C4D',
  core_performance: '#C2410C',
};

export function TierSelector() {
  const { layer, setCorePackage, locations, setCurrentStep } = useConfiguration();
  const { locale, messages } = useLocale();
  useLivePricingCatalog();
  const copy = messages.builder.tierSelector;

  if (!layer) {
    // Shouldn't happen, but handle gracefully
    setCurrentStep(1);
    return null;
  }

  const packages = CORE_PACKAGE_IDS.map((id) => corePackages[id]);
  const optimalPackage = suggestOptimalCorePackage(locations);

  const handleSelect = (packageId: CorePackageId) => {
    setCorePackage(packageId);
    setCurrentStep(3);
  };

  const fmt = (value: number) => `$${value.toLocaleString(locale)}`;

  const domainModuleCount = Object.keys(coreDomainModules).length;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.chooseCoreTier}</h1>
        <p className="text-xl text-sundae-muted">{copy.coreSubtitle}</p>
      </motion.div>

      {/* Marginal-band explainer — the single most misread mechanic in the book */}
      <div className="mb-10 mx-auto max-w-3xl p-4 rounded-xl border border-white/10 bg-sundae-surface text-sm text-sundae-muted">
        <p>
          <strong className="text-white">How unit pricing works.</strong> Your first location is
          priced at the anchor. Every location after that is priced by band, and{' '}
          <strong className="text-white">bands are marginal</strong> — reaching a cheaper band never
          reprices the locations you already have. There is no bundled location allowance.
        </p>
      </div>

      {/* Package cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {packages.map((pkg, index) => {
          const isOptimal = pkg.id === optimalPackage;
          const color = PACKAGE_COLORS[pkg.id];
          const total = calculateBandedTotal(pkg, locations);
          const bandLines = calculateBandLines(pkg, locations);
          const average = locations > 0 ? Math.round(total / locations) : total;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="relative"
            >
              {isOptimal && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-primary text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    {copy.recommended}
                  </div>
                </div>
              )}

              <motion.button
                onClick={() => handleSelect(pkg.id)}
                data-testid={`core-package-${pkg.id}`}
                className={`w-full h-full p-6 rounded-xl border-2 transition-all text-left ${
                  isOptimal
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/30 hover:border-white/50'
                    : 'bg-sundae-surface border-white/10 hover:border-white/30'
                }`}
                style={{
                  borderColor: isOptimal ? `${color}50` : undefined,
                  boxShadow: isOptimal ? `0 0 30px ${color}30` : undefined,
                }}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1" style={{ color }}>
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-sundae-muted">{pkg.tagline}</p>
                </div>

                {/* First-unit anchor */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold tabular-nums">
                      {fmt(pkg.firstUnitPrice)}
                    </span>
                    <span className="text-sundae-muted text-sm">{copy.perMonth}</span>
                  </div>
                  <p className="text-xs text-sundae-muted mt-1">First location</p>
                </div>

                {/* Marginal band table */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-[11px] uppercase tracking-wider text-sundae-muted font-semibold mb-2">
                    Then, per additional location (marginal bands)
                  </p>
                  <ul className="space-y-1">
                    {pkg.marginalBands.map((band) => (
                      <li key={band.label} className="flex justify-between text-xs">
                        <span className="text-sundae-muted">{band.label}</span>
                        <span className="font-semibold tabular-nums">{fmt(band.pricePerUnit)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Live total at the chosen unit count */}
                <div className="mb-4 p-3 rounded-lg bg-sundae-dark/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-sundae-muted">
                      {locations} {locations === 1 ? 'location' : 'locations'}
                    </span>
                    <span
                      className="font-semibold tabular-nums"
                      data-testid={`core-package-total-${pkg.id}`}
                    >
                      {fmt(total)}
                      {copy.perMonth}
                    </span>
                  </div>
                  {locations > 1 && (
                    <>
                      <p className="text-[11px] text-sundae-muted mt-1">
                        {fmt(pkg.firstUnitPrice)} +{' '}
                        {bandLines
                          .map((line) => `${line.units} × ${fmt(line.band.pricePerUnit)}`)
                          .join(' + ')}
                      </p>
                      <p className="text-[11px] text-sundae-muted mt-1">
                        Averages {fmt(average)} per location
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-sundae-muted">{copy.aiCredits}</span>
                    <span className="font-semibold tabular-nums">
                      {pkg.aiCreditWallet.toLocaleString(locale)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>All {domainModuleCount} Core domain modules included</span>
                  </div>
                </div>

                <div
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ color }}
                >
                  Select {pkg.name}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Side-by-side comparison at the selected unit count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-sundae-surface rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sundae-accent" />
          {copy.detailedFeatureComparison}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-4">{copy.feature}</th>
                {packages.map((pkg) => (
                  <th
                    key={pkg.id}
                    className="text-center py-2 px-4"
                    style={{ color: PACKAGE_COLORS[pkg.id] }}
                  >
                    {pkg.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 px-4">First location</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-3 px-4 tabular-nums">
                    {fmt(pkg.firstUnitPrice)}
                  </td>
                ))}
              </tr>
              {corePackages.core_foundation.marginalBands.map((_, bandIndex) => (
                <tr key={bandIndex}>
                  <td className="py-3 px-4">
                    {corePackages.core_foundation.marginalBands[bandIndex].label}
                  </td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="text-center py-3 px-4 tabular-nums">
                      {fmt(pkg.marginalBands[bandIndex].pricePerUnit)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="py-3 px-4">{copy.aiCredits}</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-3 px-4 tabular-nums">
                    {pkg.aiCreditWallet.toLocaleString(locale)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4">
                  Total at {locations} {locations === 1 ? 'location' : 'locations'}
                </td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-3 px-4 font-semibold tabular-nums">
                    {fmt(calculateBandedTotal(pkg, locations))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
