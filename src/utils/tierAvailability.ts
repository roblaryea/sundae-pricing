// Step availability rules for the configurator (price book v1.7).
//
// The Report layer was retired. Core packages share the same journey shape;
// package-specific Watchtower eligibility is enforced inside the selector and
// pricing engine. Crew has its own consolidated builder step.

export interface StepFeatures {
  addOns: boolean;
  watchtower: boolean;
  /** If set, skip to this step after locations. */
  skipToStep?: number;
}

const CORE_FEATURES: StepFeatures = { addOns: true, watchtower: true };
// Crew collapses SKU pick + locations + price preview into CrewBuilder and
// routes straight to the shared summary.
const CREW_FEATURES: StepFeatures = { addOns: false, watchtower: false, skipToStep: 7 };

export function getStepFeatures(layer: string | null): StepFeatures {
  return layer === 'crew' ? CREW_FEATURES : CORE_FEATURES;
}

export function canAccessAddOns(layer: string | null): boolean {
  return getStepFeatures(layer).addOns;
}

export function canAccessWatchtower(layer: string | null): boolean {
  return getStepFeatures(layer).watchtower;
}

export function getSkipToStep(layer: string | null): number | undefined {
  return getStepFeatures(layer).skipToStep;
}

/** Step 4 = Add-ons, Step 5 = Watchtower. Everything else always shows. */
export function shouldShowStep(step: number, layer: string | null): boolean {
  const features = getStepFeatures(layer);
  if (step === 4) return features.addOns;
  if (step === 5) return features.watchtower;
  return true;
}
