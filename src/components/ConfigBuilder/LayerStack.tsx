// Layer stack 3D visualization component

import { motion } from 'framer-motion';
import { ChevronRight, Check, Layers } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';

interface Layer {
  id: 'report' | 'core';
  name: string;
  icon: string;
  tagline: string;
  startingPrice: string;
  color: string;
  features: string[];
  recommended?: boolean;
}

const layers: Layer[] = [
  {
    id: 'report',
    name: 'REPORT',
    icon: '📊',
    tagline: 'Historical analysis & benchmarking',
    startingPrice: 'Starting at $0/month',
    color: '#10B981',
    features: [
      'Historical data analysis',
      'Basic benchmarking',
      'Monthly reporting',
      'Email insights'
    ]
  },
  {
    id: 'core',
    name: 'CORE',
    icon: '⚡',
    tagline: 'Real-time operations & AI',
    startingPrice: 'Starting at $169/month',
    color: '#8B5CF6',
    features: [
      'Real-time POS integration',
      'Predictive analytics',
      'AI-powered insights',
      'Portfolio management'
    ],
    recommended: true
  }
];

const watchtowerLayer = {
  id: 'watchtower' as const,
  name: 'WATCHTOWER',
  icon: '🔭',
  tagline: 'Competitive intelligence',
  startingPrice: 'Add-on: $99-349/month',
  color: '#EF4444',
  features: [
    'Competitor tracking',
    'Market trends',
    'Event signals',
    'Strategic insights'
  ]
};

export function LayerStack() {
  const { setLayer, setCurrentStep, persona, markStepCompleted } = useConfiguration();

  const handleLayerSelect = (layerId: 'report' | 'core') => {
    setLayer(layerId);
    markStepCompleted('layer');
    setCurrentStep(2);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">
          Build Your Intelligence Stack
        </h1>
        <p className="text-xl text-sundae-muted">
          Choose your foundation layer. Start simple or go all-in.
        </p>
      </motion.div>

      {/* 3D Stack Visualization - Fixed Layout */}
      <div className="mb-12">
        <div className="relative flex flex-col items-center gap-4 max-w-2xl mx-auto">
          {/* Watchtower Layer (Top) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full relative z-10"
          >
            <div className="p-4 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{watchtowerLayer.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base leading-tight">{watchtowerLayer.name}</h3>
                  <p className="text-xs text-sundae-muted leading-tight mt-1">{watchtowerLayer.tagline}</p>
                  <p className="text-xs text-sundae-muted mt-1">{watchtowerLayer.startingPrice}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Layer (Middle) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full relative z-20"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLayerSelect('core')}
              className="w-full p-6 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-xl border-2 border-violet-500/30 hover:border-violet-500/60 backdrop-blur transition-all group text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl flex-shrink-0">{layers[1].icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg leading-tight">{layers[1].name}</h3>
                      {layers[1].recommended && persona?.recommendedPath.includes('core') && (
                        <span className="text-xs bg-violet-500/30 text-violet-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-sundae-muted leading-tight mt-1">{layers[1].tagline}</p>
                    <p className="text-xs text-sundae-muted mt-2">{layers[1].startingPrice}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-sundae-muted group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </motion.button>
          </motion.div>

          {/* Report Layer (Bottom) */}
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full relative z-30"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLayerSelect('report')}
              className="w-full p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-xl border-2 border-green-500/30 hover:border-green-500/60 backdrop-blur transition-all group text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl flex-shrink-0">{layers[0].icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg leading-tight">{layers[0].name}</h3>
                      {persona?.recommendedPath === 'report-lite' && (
                        <span className="text-xs bg-green-500/30 text-green-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-sundae-muted leading-tight mt-1">{layers[0].tagline}</p>
                    <p className="text-xs text-sundae-muted mt-2">{layers[0].startingPrice}</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-sundae-muted group-hover:text-white transition-colors flex-shrink-0" />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Feature comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {layers.map((layerItem) => (
          <motion.div
            key={layerItem.id}
            whileHover={{ y: -5 }}
            className="p-6 bg-sundae-surface rounded-xl border border-white/10"
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl">{layerItem.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: layerItem.color }}>
                  {layerItem.name}
                </h3>
                <p className="text-sm text-sundae-muted">{layerItem.tagline}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {layerItem.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLayerSelect(layerItem.id)}
              className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-white/10 to-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              style={{ borderColor: `${layerItem.color}30` }}
            >
              Select {layerItem.name}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-4 bg-sundae-accent/10 rounded-lg border border-sundae-accent/30"
      >
        <p className="text-sm flex items-start gap-2">
          <Layers className="w-4 h-4 text-sundae-accent mt-0.5 flex-shrink-0" />
          <span>
            <strong>Pro tip:</strong> You can always upgrade later. Most customers start with Report 
            and upgrade to Core within 3 months as they see the value.
          </span>
        </p>
      </motion.div>
    </div>
  );
}
