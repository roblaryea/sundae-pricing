// Core PACKAGE selector (price book v1.7).
//
// Replaces the retired Report / Core Lite / Core Pro tier picker. Each card
// shows the FIRST-UNIT anchor and the MARGINAL band table — never a flat
// per-location rate, and never an "includes N locations" allowance.

import { motion } from 'framer-motion';
import { Check, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { corePackages, CORE_PACKAGE_IDS, packageShape } from '../../data/pricing';
import type { PackageShape } from '../../data/pricing';
import type { CorePackageId } from '../../data/pricing';
import {
  calculateAiCredits,
  calculateBandLines,
  calculateBandedTotal,
  calculateIntelligenceSeats,
} from '../../lib/pricingEngine';
import { suggestOptimalCorePackage } from '../../hooks/usePriceCalculation';
import { useLivePricingCatalog } from '../../data/livePricing';
import { useLocale } from '../../contexts/LocaleContext';
import { AnimatedNumber } from '../shared/AnimatedNumber';
import { LocationSelector } from '../shared/LocationSelector';
import { fadeUp, selectableCard, staggerChildren, useReducedMotionSafe } from '../../lib/motion';

const PACKAGE_COLORS: Record<CorePackageId, string> = {
  core_foundation: '#E9A24A',
  core_margin: '#FF7E6F',
  core_growth: '#FF5C4D',
  core_performance: '#C2410C',
};

export function TierSelector() {
  const { layer, corePackage, setCorePackage, locations, setLocations, goToStep, goToNextStep } = useConfiguration();
  const { locale, messages } = useLocale();
  useLivePricingCatalog();
  // Must be read above the `!layer` bail-out below: hooks cannot sit behind an
  // early return, and this component has one.
  const reduced = useReducedMotionSafe();
  const card = selectableCard(reduced);
  const copy = messages.builder.tierSelector;

  if (!layer) {
    // Shouldn't happen, but handle gracefully
    goToStep('layer');
    return null;
  }

  const packages = CORE_PACKAGE_IDS.map((id) => corePackages[id]);
  // Discovery has already selected the package that covers the buyer's stated
  // needs. Preserve it here. A location-only badge made a cost-control buyer
  // see "Core Margin" on the reveal screen and "RECOMMENDED" over Foundation
  // one click later.
  const recommendedPackage = corePackage ?? suggestOptimalCorePackage(locations);

  const handleSelect = (packageId: CorePackageId) => {
    setCorePackage(packageId);
    // Step 3 was a standalone "How Many Locations?" slider — a second ask for
    // something the opening question already collected, on a screen with no
    // packages to compare it against. The estate control now lives on this
    // screen, where every price moves as it changes, so the journey goes
    // straight to add-ons.
    goToNextStep();
  };

  // The fork vocabulary, resolved once per render.
  const shapeLabel = (shape: PackageShape) =>
    ({
      entry: copy.shapeFoundation,
      cost_side: copy.shapeMargin,
      demand_side: copy.shapeGrowth,
      both_sides: copy.shapePerformance,
    })[shape];

  // Only the two fork packages carry an omission line. Foundation is the entry
  // point and Performance grants everything, so neither is a trade.
  const omissionFor = (id: CorePackageId): string | null => {
    const shape = packageShape(id);
    if (shape === 'cost_side') return copy.marginOmits;
    if (shape === 'demand_side') return copy.growthOmits;
    return null;
  };

  const formatSelect = (template: string, name: string) => template.replace('{name}', name);

  const fmt = (value: number) => `$${value.toLocaleString(locale)}`;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        variants={fadeUp(reduced)}
        initial="hidden"
        animate="visible"
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">{copy.chooseCoreTier}</h1>
        <p className="text-xl text-sundae-muted">{copy.coreSubtitle}</p>
        {/* Said once, plainly, before the buyer reads four prices in ascending
            order and concludes the last one is the most complete. */}
        <p className="mt-3 text-sm text-sundae-muted max-w-2xl mx-auto">{copy.notALadder}</p>
      </motion.div>

      {/* Estate size lives HERE, not on a step of its own: every figure below
          moves as it changes, so the buyer sees the curve behave instead of
          being told about it on a separate screen. */}
      {/* Core-only asks for the estate here, because there is no earlier step
          to ask it on. The combined pathway already asked — showing the same
          control twice is what made a shared value look like a per-rail one. */}
      {layer === 'both' ? (
        <div className="mb-8 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-sundae-surface/60 p-4 text-center text-sm text-sundae-muted">
          Pricing {locations} {locations === 1 ? 'location' : 'locations'}.{' '}
          <button onClick={() => goToStep('estate')} className="text-white underline underline-offset-4">
            Change
          </button>
        </div>
      ) : (
      <motion.div
        variants={fadeUp(reduced, 0.05)}
        initial="hidden"
        animate="visible"
        className="mb-8 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-sundae-surface/60 p-5 backdrop-blur"
      >
        <LocationSelector
          idPrefix="core"
          locations={locations}
          onChange={setLocations}
          label={copy.estateSizeLabel ?? 'How many locations?'}
          hint={copy.estateSizeHint ?? 'Every price below updates as you move this.'}
          accent="#FF5C4D"
        />
      </motion.div>
      )}

      {/* Marginal-band explainer — the single most misread mechanic in the book */}
      <div className="mb-10 mx-auto max-w-3xl p-4 rounded-xl border border-white/10 bg-sundae-surface text-sm text-sundae-muted">
        <p>
          <strong className="text-white">How unit pricing works.</strong> Your first location is
          priced at the anchor. Every location after that is priced by band, and{' '}
          <strong className="text-white">bands are marginal</strong> — reaching a cheaper band never
          reprices the locations you already have. There is no bundled location allowance.
        </p>
      </div>

      {/* Package cards.

          Sequencing belongs to the CONTAINER, not to each card. The cards used
          to carry `transition={{ delay: index * 0.08 }}`, and in framer that
          `transition` prop is the component's default for EVERY animation it
          runs — including `whileHover`. So the fourth card, the most expensive
          one, sat for its entrance delay again before it would even begin to
          acknowledge a pointer. `staggerChildren` puts the delay on the parent
          where it can only ever affect entrance, and caps the total so a long
          grid never makes its last card wait. */}
      <motion.div
        variants={staggerChildren(reduced, packages.length)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12"
      >
        {packages.map((pkg) => {
          const isOptimal = pkg.id === recommendedPackage;
          const color = PACKAGE_COLORS[pkg.id];
          const total = calculateBandedTotal(pkg, locations);
          const bandLines = calculateBandLines(pkg, locations);
          const average = locations > 0 ? Math.round(total / locations) : total;

          return (
            <motion.div
              key={pkg.id}
              variants={fadeUp(reduced)}
              {...card}
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
                /* `transition-all` is a trap on any card framer is animating:
                   `all` includes `transform`, so the browser re-eases every
                   transform frame framer writes and most of the movement is
                   swallowed. Only the border colour changes on hover, so only
                   the border colour needs a CSS transition. */
                className={`w-full h-full p-6 rounded-xl border-2 transition-colors text-left ${
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
                  {/* Which SIDE of the business this package works.
                      The four packages were laid out as a ladder, which is not
                      what they are: Core Growth has a $1,925 first-unit anchor
                      and does not include Inventory or Purchasing. A
                      buyer "upgrading" from Margin to Growth loses the ability
                      to manage food cost and suppliers, and the ROI model
                      correctly shows their savings FALL as they pay more. The
                      shape is derived from the grants, so a card cannot claim
                      a side its module list does not support. */}
                  <span
                    className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full border"
                    style={{ color, borderColor: `${color}60` }}
                  >
                    {shapeLabel(packageShape(pkg.id))}
                  </span>
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
                      <AnimatedNumber value={total} format={fmt} />
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
                  {/* Credits scale with EVERY licensed location (price book
                      v1.7 section 8.1). This used to render the BASE wallet
                      raw, understating an 8-location Foundation buyer by
                      22,400 credits — directly beneath a line that already
                      said "8 locations". */}
                  <div className="flex justify-between text-sm">
                    <span className="text-sundae-muted">{copy.aiCredits}</span>
                    <AnimatedNumber
                      value={calculateAiCredits(pkg, locations)}
                      format={(n) => Math.round(n).toLocaleString(locale)}
                      className="font-semibold tabular-nums"
                    />
                  </div>
                  {locations > 1 && (
                    <div className="flex justify-between text-xs text-sundae-muted">
                      <span>{copy.aiCreditsBasis}</span>
                      <span className="tabular-nums">
                        {pkg.aiCreditWallet.toLocaleString(locale)} +{' '}
                        {locations} × {pkg.aiCreditsPerLocation.toLocaleString(locale)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-sundae-muted">{copy.intelligenceSeats}</span>
                    <AnimatedNumber
                      value={calculateIntelligenceSeats(pkg, locations)}
                      format={(n) => Math.round(n).toLocaleString(locale)}
                      className="font-semibold tabular-nums"
                    />
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {/* Say what the package DELIVERS, never what it withholds.
                        The runtime grants differ per package (price book v1.7
                        section 3.1), but 3.1 is explicit that "a prospect should
                        never hear artificial 'signal but not experience'
                        withholding language" — so this states the outcome the
                        buyer gets rather than a count out of eleven. The card
                        previously claimed "All 11" on every package, which made
                        the four indistinguishable and left the ladder with
                        nothing to sell. */}
                    <span>{pkg.includedOutcome}</span>
                  </div>
                  {/* Naming the trade is the point of the fork. Without it the
                      buyer reads a bigger price as a bigger package. */}
                  {omissionFor(pkg.id) && (
                    <p className="mt-3 text-xs text-amber-300/80">{omissionFor(pkg.id)}</p>
                  )}
                </div>

                <div
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold"
                  style={{ color }}
                >
                  {formatSelect(copy.selectPackage, pkg.name)}
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Side-by-side comparison at the selected unit count.

          This waited 400ms on nothing. It is the table a buyer scrolls to in
          order to decide, not decoration, so it settles with everything else. */}
      <motion.div
        variants={fadeUp(reduced, 0.08)}
        initial="hidden"
        animate="visible"
        className="bg-sundae-surface rounded-xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sundae-accent" />
          {copy.detailedFeatureComparison}
        </h3>

        {/* `w-full` made the table COMPRESS into the viewport instead of
            scrolling, so on a phone two of the four packages were squeezed out
            of sight with nothing to indicate more existed. A min-width forces
            the scroll the wrapper was already prepared for, and the feature
            column sticks so a scrolled row still says what it is measuring. */}
        <p className="mb-2 text-xs text-sundae-muted md:hidden">
          Scroll sideways to compare all four packages.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="sticky left-0 z-10 bg-sundae-surface text-left py-2 px-4">{copy.feature}</th>
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
                <td className="sticky left-0 z-10 bg-sundae-surface py-3 px-4">{copy.aiCredits}</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-3 px-4 tabular-nums">
                    {calculateAiCredits(pkg, locations).toLocaleString(locale)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-sundae-surface py-3 px-4">{copy.intelligenceSeats}</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} className="text-center py-3 px-4 tabular-nums">
                    {calculateIntelligenceSeats(pkg, locations).toLocaleString(locale)}
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
