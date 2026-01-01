// Progress indicator component with tooltips and click-to-navigate

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useState } from 'react';
import type { JourneyStep } from '../../hooks/useConfiguration';
import { useConfiguration } from '../../hooks/useConfiguration';
import { shouldShowStep } from '../../utils/tierAvailability';

interface ProgressIndicatorProps {
  steps: JourneyStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressIndicator({ steps, currentStep, onStepClick }: ProgressIndicatorProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const { layer, tier } = useConfiguration();

  const handleStepClick = (index: number) => {
    // Check if step is available for current tier
    if (!shouldShowStep(index, layer, tier)) {
      return; // Don't allow navigation to unavailable steps
    }
    
    const isCompleted = steps[index].completed;
    const isPast = index < currentStep;
    
    // Can click on completed or past steps to navigate back
    if ((isCompleted || isPast) && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        // Check if this step should be shown for the current tier
        const isAvailable = shouldShowStep(index, layer, tier);
        
        // Skip rendering unavailable steps
        if (!isAvailable) {
          return null;
        }
        
        const isActive = index === currentStep;
        const isCompleted = step.completed;
        const isPast = index < currentStep;
        const isClickable = (isCompleted || isPast) && index !== currentStep && isAvailable;
        const isHovered = hoveredStep === index;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step indicator */}
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                opacity: isPast || isActive ? 1 : 0.5
              }}
              className="relative group"
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              <button
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all relative ${
                  isCompleted 
                    ? 'bg-green-500 text-white'
                    : isActive 
                      ? 'bg-sundae-accent text-white'
                      : isPast
                        ? 'bg-sundae-surface-hover text-white'
                        : 'bg-sundae-surface text-sundae-muted'
                } ${
                  isClickable 
                    ? 'cursor-pointer hover:ring-2 hover:ring-sundae-accent hover:ring-offset-2 hover:ring-offset-sundae-dark' 
                    : isActive 
                      ? 'cursor-default' 
                      : 'cursor-not-allowed'
                }`}
                aria-label={`${step.name}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
                title={step.name}
                tabIndex={isClickable ? 0 : -1}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </button>
              
              {/* Tooltip on hover or active label */}
              {(isHovered || isActive) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-50"
                >
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    isActive 
                      ? 'text-sundae-accent' 
                      : isClickable
                        ? 'bg-sundae-surface border border-white/20 text-white'
                        : 'text-sundae-muted'
                  }`}>
                    {step.name}
                    {isClickable && <span className="ml-1 text-xs opacity-70">(click to go back)</span>}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-1 transition-all ${
                isPast 
                  ? 'bg-green-500'
                  : 'bg-sundae-surface-hover'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
