import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfiguration } from '../hooks/useConfiguration';
import { PathwaySelector } from '../components/PathwaySelector/PathwaySelector';
import { LayerStack } from '../components/ConfigBuilder/LayerStack';
import { TierSelector } from '../components/ConfigBuilder/TierSelector';
import { LocationSlider } from '../components/ConfigBuilder/LocationSlider';
import { ModulePicker } from '../components/ConfigBuilder/ModulePicker';
import { WatchtowerToggle } from '../components/ConfigBuilder/WatchtowerToggle';
import { ROISimulator } from '../components/PricingDisplay/ROISimulator';
import { ConfigSummary } from '../components/Summary/ConfigSummary';
import { ProgressIndicator } from '../components/shared/ProgressIndicator';
import { AchievementNotification } from '../components/shared/AchievementNotification';

export function Simulator() {
  const { currentStep, setCurrentStep, journeySteps, newAchievements, showAchievement } = useConfiguration();

  useEffect(() => {
    // Add dark background to body
    document.body.classList.add('bg-sundae-dark', 'text-white');
    return () => {
      document.body.classList.remove('bg-sundae-dark', 'text-white');
    };
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

  const renderStep = () => (
    <motion.div
      key={`step-${currentStep}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {stepComponents[currentStep] ?? <PathwaySelector />}
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      {/* Progress indicator bar below header */}
      {currentStep > 0 && (
        <div className="sticky top-[73px] md:top-[89px] z-40 py-3 px-4 md:px-8 border-b border-white/10 bg-sundae-dark/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
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
  );
}
