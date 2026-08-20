import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import { useLocale } from '../contexts/LocaleContext';
import { tMicro } from '../lib/pricingI18n';
import type { AddOnId, CorePackageId, CrewSkuId } from '../types/configuration';
import { CORE_PACKAGE_IDS } from '../data/pricing';
import { PathwaySelector } from '../components/PathwaySelector/PathwaySelector';
import { LayerStack } from '../components/ConfigBuilder/LayerStack';
import { EstateStep } from '../components/ConfigBuilder/EstateStep';
import { TierSelector } from '../components/ConfigBuilder/TierSelector';
import { ModulePicker } from '../components/ConfigBuilder/ModulePicker';
import { WatchtowerToggle } from '../components/ConfigBuilder/WatchtowerToggle';
import { ROISimulator } from '../components/PricingDisplay/ROISimulator';
import { ConfigSummary } from '../components/Summary/ConfigSummary';
import { CrewBuilder } from '../components/ConfigBuilder/CrewBuilder';
import { ProgressIndicator } from '../components/shared/ProgressIndicator';
import { AchievementNotification } from '../components/shared/AchievementNotification';
import { useLivePricingCatalog } from '../data/livePricing';
import { LivePricingGate } from '../components/shared/LivePricingGate';
import { stepTransition, useReducedMotionSafe } from '../lib/motion';
import { journeyFor, stepAtIn, STEP_NAMES, type JourneyStepId } from '../lib/journey';

export function Simulator() {
  const { currentStep, setCurrentStep, journeySteps, newAchievements, showAchievement, layer } = useConfiguration();
  const livePricing = useLivePricingCatalog();
  const { locale } = useLocale();
  const reducedMotion = useReducedMotionSafe();

  // Back is now just "one step earlier in THIS pathway".
  //
  // It used to be a nest of special cases: the summary had to guess which step
  // the visitor came from, because Crew collapsed its middle steps and the
  // combined path ended on a builder that was pretending to be the ROI step.
  // With the pathway declaring its own order, the previous step is simply the
  // previous step, and there is nothing left to get wrong.
  const backLabel = tMicro(locale, 'back');
  const handleStickyBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  // The step bar sticks directly below the site header. Measure the header's real
  // height (logo + subtitle; differs mobile vs desktop) instead of a hardcoded
  // offset — otherwise the bar tucks BEHIND a header taller than the guess.
  const [headerH, setHeaderH] = useState(96);
  useEffect(() => {
    const measure = () => {
      const h = document.querySelector('header');
      if (h) setHeaderH(Math.round(h.getBoundingClientRect().height));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Open each step at the top. Without this, navigating next/back keeps the prior
  // scroll position (usually the bottom, where the CTA was), so the new step
  // appears scrolled to its bottom and the user has to scroll back up.
  //
  // Focus moves with it. A step change swaps the entire main region, which drops
  // focus to <body> — a keyboard user is returned to the top of the document and
  // a screen-reader user is told nothing happened at all. Moving focus to the
  // step container announces the new step and puts the next Tab in the right
  // place. `tabIndex={-1}` makes it focusable without adding a tab stop.
  const stepRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    stepRef.current?.focus({ preventScroll: true });
  }, [currentStep]);

  useEffect(() => {
    // Add dark background to body
    document.body.classList.add('bg-sundae-dark', 'text-white');
    return () => {
      document.body.classList.remove('bg-sundae-dark', 'text-white');
    };
  }, []);

  // One-time prefill from a diagnostic deep-link (?cfg=...). The marketing-site
  // Operations Diagnostic encodes the operator's already-known configuration
  // here (see pricingLink.ts in sundae-website) so "Open pricing simulator"
  // seeds the store and jumps straight to the Review & Launch summary instead
  // of restarting the questionnaire.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('cfg');
    if (!raw) return;
    try {
      const b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
      // A deep link minted before price book v1.7 may still carry `layer:
      // 'report'` or a retired tier id. Those are dropped, not translated —
      // there is no v1.7 equivalent to silently substitute.
      const data = JSON.parse(atob(b64)) as {
        v?: number;
        layer?: string;
        corePackage?: CorePackageId;
        locations?: number;
        addOns?: string[];
        watchtower?: boolean;
        crewSkus?: string[];
      };
      if (!data || data.v !== 1) return;
      const s = useConfiguration.getState();
      if (data.layer === 'core') {
        s.setLayer('core');
        if (data.corePackage && CORE_PACKAGE_IDS.includes(data.corePackage)) {
          s.setCorePackage(data.corePackage);
        }
        if (typeof data.locations === 'number') s.setLocations(data.locations);
        if (Array.isArray(data.addOns)) s.setAddOns(data.addOns as AddOnId[]);
        s.setWatchtowerModules(data.watchtower ? ['bundle'] : []);
      }
      if (Array.isArray(data.crewSkus) && data.crewSkus.length > 0) {
        s.setCrewSkus(data.crewSkus as CrewSkuId[]);
      }
      // Mark the journey complete so the summary renders fully, then jump to it.
      (['persona', 'layer', 'estate', 'package', 'locations', 'addons', 'watchtower', 'crew', 'roi'] as const)
        .forEach((id) => s.markStepCompleted(id));
      s.goToStep('summary');
    } catch {
      // Malformed cfg — fall through to the normal first-run flow.
    } finally {
      // Strip cfg so a refresh doesn't re-apply or clobber later edits.
      window.history.replaceState(null, '', '/simulator');
    }
  }, []);

  // Keyed BY STEP NAME, so the render map and the progress rail cannot drift
  // out of alignment. The previous positional array still carried the retired
  // standalone locations screen, which pushed every later index one place out:
  // "Review & Launch" rendered the ROI calculator, and the orphaned locations
  // screen was reachable through the "Add-ons" dot.
  const stepComponents: Record<JourneyStepId, React.ReactNode> = {
    persona: <PathwaySelector />,
    layer: <LayerStack />,
    estate: <EstateStep />,
    tier: <TierSelector />,
    crew: <CrewBuilder />,
    addons: <ModulePicker />,
    watchtower: <WatchtowerToggle />,
    roi: <ROISimulator />,
    summary: <ConfigSummary />,
  };

  // The rail draws the visitor's OWN pathway. It used to draw a single fixed
  // list and rewrite one label at runtime, so a Core+Crew buyer saw "Calculate
  // ROI" where the Crew picker actually was.
  const railSteps = journeyFor(layer).map((id) => ({
    id,
    name: STEP_NAMES[id],
    completed: journeySteps.find((s) => s.id === id)?.completed ?? false,
  }));

  // One list decides both what the rail draws and what renders, so they cannot
  // disagree. No path-specific component swapping, no phase flag.
  const renderStep = () => {
    const stepId = stepAtIn(layer, currentStep);
    const node = stepId ? stepComponents[stepId] : <PathwaySelector />;
    return (
      <motion.div
        key={`step-${stepId ?? currentStep}`}
        {...stepTransition(reducedMotion)}
      >
        {node}
      </motion.div>
    );
  };

  return (
    <LivePricingGate state={livePricing}>
    <div className="min-h-screen">
      {/* Progress indicator bar below header */}
      {currentStep > 0 && (
        <div className="sticky z-40 py-3 px-4 md:px-8 border-b border-white/10 bg-sundae-dark/95 backdrop-blur-sm" style={{ top: headerH }}>
          <div className="max-w-7xl mx-auto relative flex items-center justify-center">
            {/* Always-visible (sticky) back, so every step — including the ROI and
                Review & Launch summary — can navigate to the previous page. */}
            <button
              onClick={handleStickyBack}
              className="absolute left-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sundae-muted transition-colors hover:bg-sundae-surface hover:text-white"
              aria-label={backLabel}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </button>
            <ProgressIndicator
              steps={railSteps}
              onStepClick={setCurrentStep}
              currentStep={currentStep}
            />
          </div>
        </div>
      )}

      {/* Journey content */}
      {/* Layout already renders the page's <main>; a second one nested inside
          it gives the document two main landmarks. This is the step region. */}
      <div
        ref={stepRef}
        data-testid="step-region"
        tabIndex={-1}
        role="region"
        aria-label={backLabel === 'Back' ? 'Configuration step' : backLabel}
        className="max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-8 focus:outline-none"
      >
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Achievement notifications */}
      <AnimatePresence>
        {showAchievement && newAchievements[0] && (
          <AchievementNotification achievement={newAchievements[0]} />
        )}
      </AnimatePresence>
    </div>
    </LivePricingGate>
  );
}
