// Main App component for Sundae pricing configurator

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useConfiguration } from './hooks/useConfiguration';
import { PathwaySelector } from './components/PathwaySelector/PathwaySelector';
import { LayerStack } from './components/ConfigBuilder/LayerStack';
import { TierSelector } from './components/ConfigBuilder/TierSelector';
import { LocationSlider } from './components/ConfigBuilder/LocationSlider';
import { ModulePicker } from './components/ConfigBuilder/ModulePicker';
import { WatchtowerToggle } from './components/ConfigBuilder/WatchtowerToggle';
import { ROISimulator } from './components/PricingDisplay/ROISimulator';
import { ConfigSummary } from './components/Summary/ConfigSummary';
import { ProgressIndicator } from './components/shared/ProgressIndicator';
import { AchievementNotification } from './components/shared/AchievementNotification';
import { ThemeToggle } from './components/shared/ThemeToggle';
import { Logo } from './components/Brand/Logo';

function App() {
  const { currentStep, setCurrentStep, journeySteps, newAchievements, showAchievement } = useConfiguration();

  useEffect(() => {
    // Add dark background to body
    document.body.classList.add('bg-sundae-dark', 'text-white');
    return () => {
      document.body.classList.remove('bg-sundae-dark', 'text-white');
    };
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PathwaySelector />;
      case 1:
        return <LayerStack />;
      case 2:
        return <TierSelector />;
      case 3:
        return <LocationSlider />;
      case 4:
        return <ModulePicker />;
      case 5:
        return <WatchtowerToggle />;
      case 6:
        return <ROISimulator />;
      case 7:
        return <ConfigSummary />;
      default:
        return <PathwaySelector />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sundae-dark via-sundae-surface to-sundae-dark">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-primary opacity-10 blur-3xl rounded-full" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-gold opacity-10 blur-3xl rounded-full" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header - Sticky with backdrop */}
        <header className="sticky top-0 z-50 py-4 md:py-6 px-4 md:px-8 border-b border-white/10 bg-sundae-dark/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Logo size="lg" linkToHome />
              <p className="text-xs md:text-sm text-sundae-muted mt-1 hidden sm:block">
                Decision Intelligence Platform
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {/* Progress for non-quiz steps */}
              {currentStep > 0 && (
                <ProgressIndicator
                  steps={journeySteps}
                  onStepClick={setCurrentStep}
                  currentStep={currentStep}
                />
              )}
              
              {/* Theme toggle */}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Journey content - padding to account for sticky header */}
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
    </div>
  );
}

export default App;
