// Location slider with dynamic pricing updates and logarithmic scale

import { motion } from 'framer-motion';
import { MapPin, TrendingUp, Info, ChevronLeft } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { useState } from 'react';

// Visual milestone markers (display only, not for snapping)
const MILESTONE_MARKERS = [
  { position: 3, label: 'Cheaper than Tenzo', color: '#10B981' },
  { position: 14, label: 'Core Pro break-even', color: '#8B5CF6' },
  { position: 30, label: 'Enterprise pricing', color: '#F59E0B' }
];

export function LocationSlider() {
  const { layer, tier, locations, setLocations, setCurrentStep } = useConfiguration();
  // Calculate pricing with ONLY current selections (no modules yet)
  const pricing = usePriceCalculation(layer, tier, locations, [], []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(locations.toString());

  // Direct integer slider (no snapping)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocations = parseInt(e.target.value, 10);
    setLocations(newLocations);
    setInputValue(newLocations.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const num = parseInt(inputValue, 10);
    if (!isNaN(num) && num >= 1) {
      const clamped = Math.min(Math.max(num, 1), 9999);
      setLocations(clamped);
      setInputValue(clamped.toString());
    } else {
      setInputValue(locations.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handleContinue = () => {
    setCurrentStep(4);
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  // Determine optimal range based on persona
  const getLocationLabel = (value: number) => {
    if (value === 1) return 'Solo Location';
    if (value === 2) return 'Dual Location';
    if (value <= 5) return 'Small Portfolio';
    if (value <= 9) return 'Growing Portfolio';
    if (value <= 24) return 'Growth Stage';
    if (value <= 29) return 'Multi-Site';
    if (value <= 50) return 'Enterprise';
    if (value <= 100) return 'Regional Chain';
    if (value <= 250) return 'Major Chain';
    if (value <= 500) return 'National Brand';
    return 'Global Scale';
  };

  const getLocationColor = (value: number) => {
    if (value === 1) return '#10B981';
    if (value <= 5) return '#3B82F6';
    if (value <= 10) return '#6366F1';
    if (value <= 24) return '#8B5CF6';
    if (value <= 50) return '#A855F7';
    if (value <= 100) return '#F59E0B';
    if (value <= 250) return '#EC4899';
    return '#EF4444';
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
        {/* Current value display */}
        <div className="text-center mb-8">
          <motion.div
            key={locations}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="inline-block"
          >
            <div className="text-7xl font-bold tabular-nums mb-2" style={{ color: getLocationColor(locations) }}>
              {locations}
            </div>
            <div className="text-lg font-medium" style={{ color: getLocationColor(locations) }}>
              {getLocationLabel(locations)}
            </div>
          </motion.div>
        </div>

        {/* Continuous integer slider (1-500) - True linear mapping */}
        <div className="mb-8">
          <input
            type="range"
            min="1"
            max="500"
            step="1"
            value={locations}
            onChange={handleSliderChange}
            className="w-full h-3 bg-sundae-surface-hover rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${getLocationColor(locations)} 0%, ${getLocationColor(locations)} ${(locations / 500) * 100}%, #334155 ${(locations / 500) * 100}%, #334155 100%)`
            }}
          />
          
          {/* Scale markers (visual only, no snapping) */}
          <div className="flex justify-between mt-2 text-xs text-sundae-muted">
            <span>1</span>
            <span>5</span>
            <span>10</span>
            <span>30</span>
            <span>50</span>
            <span>100</span>
            <span>250</span>
            <span>500</span>
          </div>
        </div>
        
        {/* Click-to-edit large number input */}
        {locations >= 100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 text-center"
          >
            <p className="text-sm text-sundae-muted mb-2">
              For precise counts, click the number above or type here:
            </p>
            {isEditing ? (
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="bg-sundae-dark border border-sundae-accent rounded-lg px-4 py-2 text-center text-lg w-32 focus:border-sundae-accent outline-none"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-sundae-dark border border-white/20 hover:border-sundae-accent rounded-lg px-4 py-2 text-lg w-32 transition-colors"
              >
                {locations.toLocaleString()}
              </button>
            )}
          </motion.div>
        )}

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
          Continue to Modules
        </button>
      </motion.div>
    </div>
  );
}
