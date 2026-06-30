import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useConfiguration } from '../hooks/useConfiguration';
import { useLocale } from '../contexts/LocaleContext';
import type { CrewSkuId } from '../types/configuration';
import { PathwaySelector } from '../components/PathwaySelector/PathwaySelector';
import { LayerStack } from '../components/ConfigBuilder/LayerStack';
import { TierSelector } from '../components/ConfigBuilder/TierSelector';
import { LocationSlider } from '../components/ConfigBuilder/LocationSlider';
import { ModulePicker } from '../components/ConfigBuilder/ModulePicker';
import { WatchtowerToggle } from '../components/ConfigBuilder/WatchtowerToggle';
import { ROISimulator } from '../components/PricingDisplay/ROISimulator';
import { ConfigSummary } from '../components/Summary/ConfigSummary';
import { CrewBuilder } from '../components/ConfigBuilder/CrewBuilder';
import { ProgressIndicator } from '../components/shared/ProgressIndicator';
import { AchievementNotification } from '../components/shared/AchievementNotification';
import { useLivePricingCatalog } from '../data/livePricing';
import { LivePricingGate } from '../components/shared/LivePricingGate';

export function Simulator() {
  const { currentStep, setCurrentStep, journeySteps, newAchievements, showAchievement, layer, modules } = useConfiguration();
  const livePricing = useLivePricingCatalog();
  const { locale } = useLocale();
  // Where "Back" goes from each step, honoring path-specific skips (Crew collapses
  // to one builder step; Report skips modules/watchtower/ROI before the summary).
  const backTarget =
    currentStep === 7
      ? layer === 'crew'
        ? 2
        : layer === 'report'
          ? 3
          : modules.length > 0
            ? 6
            : 5
      : Math.max(0, currentStep - 1);
  const backLabel =
    ({ en: 'Back', ar: 'رجوع', fr: 'Retour', es: 'Volver' } as Record<string, string>)[locale] ?? 'Back';

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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
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
      const data = JSON.parse(atob(b64)) as {
        v?: number;
        layer?: 'report' | 'core';
        tier?: 'lite' | 'plus' | 'pro' | 'enterprise';
        locations?: number;
        modules?: string[];
        watchtower?: boolean;
        crewSkus?: string[];
      };
      if (!data || data.v !== 1) return;
      const s = useConfiguration.getState();
      if (data.layer === 'report' || data.layer === 'core') {
        s.setLayer(data.layer);
        if (data.tier) s.setTier(data.tier);
        if (typeof data.locations === 'number') s.setLocations(data.locations);
        if (data.layer === 'core') {
          if (Array.isArray(data.modules)) s.setModules(data.modules);
          s.setWatchtowerModules(data.watchtower ? ['bundle'] : []);
        }
      }
      if (Array.isArray(data.crewSkus) && data.crewSkus.length > 0) {
        s.setCrewSkus(data.crewSkus as CrewSkuId[]);
      }
      // Mark the journey complete so the summary renders fully, then jump to it.
      (['persona', 'layer', 'tier', 'locations', 'modules', 'watchtower', 'roi'] as const)
        .forEach((id) => s.markStepCompleted(id));
      s.setCurrentStep(7); // Review & Launch summary
    } catch {
      // Malformed cfg — fall through to the normal first-run flow.
    } finally {
      // Strip cfg so a refresh doesn't re-apply or clobber later edits.
      window.history.replaceState(null, '', '/simulator');
    }
  }, []);

  const stepComponents = [
    <PathwaySelector />,
    <LayerStack />,
    <TierSelector />,
    <LocationSlider />,
    <ModulePicker />,
    <WatchtowerToggle />,
    <ROISimulator />,
    <ConfigSummary />,
  ];

  // Crew is the parallel operational substrate path. It bypasses the
  // Report/Core-specific tier → modules → watchtower → ROI flow because
  // none of those map to Crew. CrewBuilder consolidates SKU pick +
  // locations + price preview into one step and routes directly to the
  // shared ConfigSummary on submit.
  const isCrewPath = layer === 'crew';
  const renderStep = () => {
    const node =
      isCrewPath && currentStep >= 2 && currentStep < 7
        ? <CrewBuilder />
        : (stepComponents[currentStep] ?? <PathwaySelector />);
    return (
      <motion.div
        key={`step-${isCrewPath && currentStep >= 2 && currentStep < 7 ? 'crew-builder' : currentStep}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
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
              onClick={() => setCurrentStep(backTarget)}
              className="absolute left-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-sundae-muted transition-colors hover:bg-sundae-surface hover:text-white"
              aria-label={backLabel}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </button>
            <ProgressIndicator
              steps={journeySteps}
              onStepClick={setCurrentStep}
              currentStep={currentStep}
            />
          </div>
        </div>
      )}

      {/* Journey content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-6 md:pt-8">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>

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
