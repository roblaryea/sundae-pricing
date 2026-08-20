import { motion } from 'framer-motion';
import { useConfiguration } from '../../hooks/useConfiguration';
import { LocationSelector } from '../shared/LocationSelector';
import { fadeUp, useReducedMotionSafe } from '../../lib/motion';
import { VolumeCurve } from '../shared/VolumeCurve';
import { suggestOptimalCorePackage } from '../../hooks/usePriceCalculation';

/**
 * The estate, asked once — because it is one value.
 *
 * `locations` is shared by both rails. The combined pathway used to show its
 * slider twice, on the Core package screen and again inside the Crew builder,
 * several steps apart. Moving it on the Crew screen silently repriced Core on a
 * page that never mentioned Core: a global input wearing a local costume.
 *
 * Asking here, before either rail is configured, makes the shared-ness the
 * obvious reading rather than a surprise, and lets every price the buyer meets
 * afterwards already be in their own units.
 */
export function EstateStep() {
  const { locations, setLocations, goToPrevStep, goToNextStep } = useConfiguration();
  const reduced = useReducedMotionSafe();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div variants={fadeUp(reduced)} initial="hidden" animate="visible" className="text-center mb-10">
        <p className="text-sundae-accent font-semibold mb-2">Your Estate</p>
        <h1 className="text-4xl font-bold mb-3">How big is the business?</h1>
        <p className="text-sundae-muted">
          One number, used by both rails. Core and Crew are each priced from it, so every
          figure you see from here is already in your units.
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp(reduced, 0.05)}
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-white/10 bg-sundae-surface/60 p-6 backdrop-blur mb-6"
      >
        <LocationSelector
          idPrefix="estate"
          locations={locations}
          onChange={setLocations}
          label="How many locations?"
          hint="Drag for a feel, or type an exact number."
          accent="#FF5C4D"
        />
      </motion.div>

      <div className="mb-8">
        <VolumeCurve packageId={suggestOptimalCorePackage(locations)} locations={locations} />
      </div>

      <div className="flex justify-between">
        <button onClick={() => goToPrevStep()} className="px-6 py-3 rounded-xl border border-white/15 text-sundae-muted hover:text-white">
          Back
        </button>
        <button
          onClick={() => goToNextStep()}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-sundae-accent to-[#FF5C4D] font-semibold text-white"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
