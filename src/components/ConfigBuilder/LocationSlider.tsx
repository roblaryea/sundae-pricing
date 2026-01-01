// Location slider with logarithmic scale mapping

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Info, ChevronLeft } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { cn } from '../../utils/cn';
import { getSkipToStep } from '../../utils/tierAvailability';

// Fixed scale points that appear on the slider
const SCALE_POINTS = [1, 5, 10, 30, 50, 100, 250, 500];

// Get the percentage position for a given location count (logarithmic)
function locationToPercent(location: number): number {
  if (location <= 1) return 0;
  if (location >= 500) return 100;
  
  // Find which segment the location falls into
  for (let i = 0; i < SCALE_POINTS.length - 1; i++) {
    const start = SCALE_POINTS[i];
    const end = SCALE_POINTS[i + 1];
    
    if (location >= start && location <= end) {
      // Linear interpolation within this segment
      const segmentStart = (i / (SCALE_POINTS.length - 1)) * 100;
      const segmentEnd = ((i + 1) / (SCALE_POINTS.length - 1)) * 100;
      const ratio = (location - start) / (end - start);
      return segmentStart + (ratio * (segmentEnd - segmentStart));
    }
  }
  
  return 100;
}

// Get the location count for a given percentage position
function percentToLocation(percent: number): number {
  if (percent <= 0) return 1;
  if (percent >= 100) return 500;
  
  // Find which segment the percent falls into
  const segmentSize = 100 / (SCALE_POINTS.length - 1);
  const segmentIndex = Math.floor(percent / segmentSize);
  const segmentProgress = (percent % segmentSize) / segmentSize;
  
  // Clamp segment index
  const safeIndex = Math.min(segmentIndex, SCALE_POINTS.length - 2);
  
  const start = SCALE_POINTS[safeIndex];
  const end = SCALE_POINTS[safeIndex + 1];
  
  // Linear interpolation within segment
  const location = start + (segmentProgress * (end - start));
  
  return Math.round(location);
}

// Get scale label for location count
function getScaleLabel(locations: number): { label: string; color: string } {
  if (locations <= 2) return { label: 'Independent', color: 'text-slate-400' };
  if (locations <= 9) return { label: 'Small Portfolio', color: 'text-blue-400' };
  if (locations <= 24) return { label: 'Growth Stage', color: 'text-green-400' };
  if (locations <= 50) return { label: 'Enterprise', color: 'text-amber-400' };
  if (locations <= 100) return { label: 'Regional Chain', color: 'text-orange-400' };
  if (locations <= 250) return { label: 'Major Chain', color: 'text-pink-400' };
  return { label: 'National Scale', color: 'text-purple-400' };
}

export function LocationSlider() {
  const { layer, tier, locations, setLocations, setCurrentStep } = useConfiguration();
  const pricing = usePriceCalculation(layer, tier, locations, [], []);
  
  const [inputValue, setInputValue] = useState(locations.toString());
  const [isDragging, setIsDragging] = useState(false);
  
  // Sync input value with prop
  useEffect(() => {
    if (!isDragging) {
      setInputValue(locations.toString());
    }
  }, [locations, isDragging]);
  
  const percent = useMemo(() => locationToPercent(locations), [locations]);
  const scaleInfo = getScaleLabel(locations);
  
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDragging(true);
    const newPercent = parseFloat(e.target.value);
    const newLocation = percentToLocation(newPercent);
    setLocations(newLocation);
    setInputValue(newLocation.toString());
  }, [setLocations]);
  
  const handleSliderEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val);
  }, []);
  
  const handleInputBlur = useCallback(() => {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 1) {
      const clamped = Math.min(Math.max(num, 1), 9999);
      setLocations(clamped);
      setInputValue(clamped.toString());
    } else {
      setInputValue(locations.toString());
    }
  }, [inputValue, setLocations, locations]);
  
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  }, [handleInputBlur]);
  
  // Calculate positions for scale point labels
  const scalePointPositions = SCALE_POINTS.map((point, index) => ({
    value: point,
    percent: (index / (SCALE_POINTS.length - 1)) * 100
  }));

  const handleContinue = () => {
    // Check if tier requires skipping steps
    const skipTo = getSkipToStep(layer, tier);
    setCurrentStep(skipTo || 4); // Default to step 4 (Modules) if no skip
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          How Many Locations?
        </h1>
        <p className="text-xl text-sundae-muted">
          Slide to configure your portfolio size. Pricing scales efficiently.
        </p>
      </motion.div>

      {/* Main slider section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-sundae-surface to-sundae-surface/50 rounded-2xl p-8 border border-white/10"
      >
        {/* Current value display - clickable */}
        <div className="text-center mb-8">
          <motion.div
            key={locations}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="inline-block cursor-pointer"
            onClick={() => document.getElementById('location-input')?.focus()}
          >
            <div className={cn('text-7xl font-bold tabular-nums mb-2', scaleInfo.color)}>
              {locations.toLocaleString()}
            </div>
            <div className={cn('text-lg font-medium', scaleInfo.color)}>
              {scaleInfo.label}
            </div>
          </motion.div>
        </div>

        {/* Slider with logarithmic mapping */}
        <div className="mb-8">
          <div className="relative pt-2 pb-8">
            {/* Track background */}
            <div className="relative h-2 bg-slate-700 rounded-full">
              {/* Filled track */}
              <div
                className="absolute h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-75"
                style={{ width: `${percent}%` }}
              />
              
              {/* Slider input */}
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={percent}
                onChange={handleSliderChange}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-amber-400 pointer-events-none transition-all duration-75"
                style={{ left: `calc(${percent}% - 10px)` }}
              />
            </div>
            
            {/* Scale labels - positioned at exact percentages */}
            <div className="relative mt-3">
              {scalePointPositions.map(({ value: scaleValue, percent: labelPercent }) => (
                <div
                  key={scaleValue}
                  className="absolute transform -translate-x-1/2 text-sm text-slate-500"
                  style={{ left: `${labelPercent}%` }}
                >
                  {scaleValue >= 500 ? '500+' : scaleValue}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Manual input */}
        <div className="text-center mb-6">
          <p className="text-sm text-slate-400 mb-2">
            For precise counts, click the number above or type here:
          </p>
          <input
            id="location-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-center text-lg w-28 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Live pricing display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-sundae-dark/50 rounded-lg"
          >
            <div className="text-sm text-sundae-muted mb-1">Total Monthly</div>
            <div className="text-3xl font-bold tabular-nums">
              ${pricing.total.toLocaleString()}
            </div>
            <div className="text-sm text-sundae-muted mt-1">
              ${(pricing.total * 12).toLocaleString()}/year
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-sundae-dark/50 rounded-lg"
          >
            <div className="text-sm text-sundae-muted mb-1">Per Location</div>
            <div className="text-3xl font-bold tabular-nums">
              ${pricing.perLocation.toFixed(0)}
            </div>
            <div className="text-sm text-green-400 mt-1">
              {locations > 1 && `Save ${Math.round((1 - pricing.perLocation / pricing.total) * 100)}% vs single`}
              {locations === 1 && 'Best value at scale'}
            </div>
          </motion.div>
        </div>

        {/* Enterprise notice for large chains */}
        {locations >= 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg"
          >
            <p className="text-purple-300 text-sm">
              🏆 With {locations.toLocaleString()} locations, you qualify for <strong>Enterprise pricing</strong> with dedicated support.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Pricing insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Volume discount callout */}
        {locations >= 5 && (
          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-green-400 mb-1">Volume Discount Active</div>
                <p className="text-sm text-sundae-muted">
                  You're getting enterprise pricing benefits with {locations} locations
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Core Pro advantage */}
        {layer === 'core' && tier === 'lite' && locations >= 15 && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-lg border border-purple-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-purple-400 mb-1">Consider Core Pro</div>
                <p className="text-sm text-sundae-muted">
                  At {locations} locations, Core Pro is more cost-effective than Core Lite
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio management */}
        {locations >= 2 && layer === 'core' && (
          <div className="p-4 bg-gradient-to-r from-sundae-accent/10 to-blue-500/10 rounded-lg border border-sundae-accent/30">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-sundae-accent mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sundae-accent mb-1">Portfolio Management Unlocked</div>
                <p className="text-sm text-sundae-muted">
                  Compare performance across all {locations} locations in one view
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 mb-32 flex items-center justify-between relative z-50"
      >
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sundae-surface hover:bg-sundae-surface-hover border border-white/10 hover:border-white/20 transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleContinue}
          className="button-primary relative z-50"
          data-testid="continue-button"
        >
          {getSkipToStep(layer, tier) === 6 ? 'Continue to ROI Calculator' : 'Continue to Modules'}
        </button>
      </motion.div>
    </div>
  );
}
