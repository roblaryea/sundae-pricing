// Achievement notification component

import { motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import type { Achievement } from '../../data/personas';
import { useConfiguration } from '../../hooks/useConfiguration';

interface AchievementNotificationProps {
  achievement: Achievement;
}

export function AchievementNotification({ achievement }: AchievementNotificationProps) {
  const { dismissAchievement } = useConfiguration();

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className="bg-gradient-to-br from-sundae-surface to-sundae-dark rounded-xl shadow-2xl border border-white/20 p-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        
        {/* Close button */}
        <button
          onClick={dismissAchievement}
          className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-sundae-muted" />
        </button>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {/* Text */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="font-bold text-lg mb-1">
                  {achievement.name}
                </h4>
                <p className="text-sm text-sundae-muted mb-2">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="text-sm font-bold text-sundae-accent">
                    +{achievement.points} points
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress bar animation */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3, ease: "linear" }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary origin-left"
        />
      </div>
    </motion.div>
  );
}
