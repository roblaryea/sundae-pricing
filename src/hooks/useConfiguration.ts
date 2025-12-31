// Configuration state management using Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Configuration } from '../types/configuration';
import type { CompetitorId } from '../data/competitors';
import type { ROIInputs } from './useROICalculation';
import type { Persona } from '../data/personas';
import type { Achievement } from '../data/personas';
import { achievements } from '../data/personas';

export interface JourneyStep {
  id: string;
  name: string;
  completed: boolean;
}

export interface ConfigurationState extends Configuration {
  // Journey state
  currentStep: number;
  journeySteps: JourneyStep[];
  
  // Quiz state
  quizAnswers: Record<string, string>;
  persona: Persona | null;
  personaConfidence: number;
  
  // ROI inputs
  roiInputs: ROIInputs;
  
  // Achievements
  unlockedAchievements: string[];
  totalPoints: number;
  newAchievements: Achievement[];
  
  // UI state
  showAchievement: boolean;
  isAnimating: boolean;
  
  // Actions
  setLayer: (layer: 'report' | 'core' | null) => void;
  setTier: (tier: 'lite' | 'plus' | 'pro' | 'enterprise') => void;
  setLocations: (locations: number) => void;
  toggleModule: (moduleId: string) => void;
  setModules: (modules: string[]) => void;
  toggleWatchtowerModule: (moduleId: string) => void;
  setWatchtowerModules: (modules: string[]) => void;
  
  // Quiz actions
  setQuizAnswer: (questionId: string, answerId: string) => void;
  setPersona: (persona: Persona | null, confidence: number) => void;
  
  // ROI actions
  setROIInputs: (inputs: Partial<ROIInputs>) => void;
  
  // Journey actions
  setCurrentStep: (step: number) => void;
  markStepCompleted: (stepId: string) => void;
  
  // Achievement actions
  unlockAchievement: (achievementId: string) => void;
  dismissAchievement: () => void;
  checkAchievements: () => void;
  
  // Utility actions
  reset: () => void;
  loadFromPersona: (persona: Persona) => void;
}

const initialState = {
  // Configuration
  layer: null as 'report' | 'core' | null,
  tier: 'lite' as 'lite' | 'plus' | 'pro' | 'enterprise',
  locations: 1,
  modules: [] as string[],
  watchtowerModules: [] as string[],
  competitors: {
    current: [] as CompetitorId[],
    evaluating: [] as CompetitorId[],
    primaryComparison: 'nothing' as CompetitorId
  },
  
  // Journey
  currentStep: 0,
  journeySteps: [
    { id: 'persona', name: 'Discover Your Persona', completed: false },
    { id: 'layer', name: 'Choose Your Layer', completed: false },
    { id: 'tier', name: 'Select Your Tier', completed: false },
    { id: 'locations', name: 'Configure Locations', completed: false },
    { id: 'modules', name: 'Add Modules', completed: false },
    { id: 'watchtower', name: 'Watchtower Intel', completed: false },
    { id: 'roi', name: 'Calculate ROI', completed: false },
    { id: 'summary', name: 'Review & Launch', completed: false }
  ],
  
  // Quiz
  quizAnswers: {},
  persona: null,
  personaConfidence: 0,
  
  // ROI
  roiInputs: {
    monthlyRevenue: 100000,
    laborPercent: 32,
    foodCostPercent: 29,
    marketingSpend: 2000,
    reservationNoShowRate: 15
  },
  
  // Achievements
  unlockedAchievements: [],
  totalPoints: 0,
  newAchievements: [],
  showAchievement: false,
  isAnimating: false
};

export const useConfiguration = create<ConfigurationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Configuration actions
        setLayer: (layer) => {
          set({ layer });
          get().checkAchievements();
        },
        
        setTier: (tier) => {
          set({ tier });
          get().markStepCompleted('tier');
          get().checkAchievements();
        },
        
        setLocations: (locations) => {
          set({ locations });
          get().markStepCompleted('locations');
          get().checkAchievements();
        },
        
        toggleModule: (moduleId) => {
          const modules = get().modules;
          const newModules = modules.includes(moduleId)
            ? modules.filter(id => id !== moduleId)
            : [...modules, moduleId];
          set({ modules: newModules });
          if (newModules.length > 0) {
            get().markStepCompleted('modules');
          }
          get().checkAchievements();
        },
        
        setModules: (modules) => {
          set({ modules });
          if (modules.length > 0) {
            get().markStepCompleted('modules');
          }
          get().checkAchievements();
        },
        
        toggleWatchtowerModule: (moduleId) => {
          const watchtowerModules = get().watchtowerModules;
          
          if (moduleId === 'bundle') {
            // If selecting bundle, clear individual modules
            set({ watchtowerModules: ['bundle'] });
          } else {
            // Toggle individual module
            let newModules = watchtowerModules.includes(moduleId)
              ? watchtowerModules.filter(id => id !== moduleId)
              : [...watchtowerModules.filter(id => id !== 'bundle'), moduleId];
            
            // Check if all individual modules are selected
            const allIndividual = ['competitive', 'events', 'trends'];
            const hasAll = allIndividual.every(id => newModules.includes(id));
            
            if (hasAll) {
              // Suggest bundle instead
              newModules = ['bundle'];
            }
            
            set({ watchtowerModules: newModules });
          }
          
          if (get().watchtowerModules.length > 0) {
            get().markStepCompleted('watchtower');
          }
          get().checkAchievements();
        },
        
        setWatchtowerModules: (modules) => {
          set({ watchtowerModules: modules });
          if (modules.length > 0) {
            get().markStepCompleted('watchtower');
          }
          get().checkAchievements();
        },
        
        // Quiz actions
        setQuizAnswer: (questionId, answerId) => {
          const quizAnswers = { ...get().quizAnswers, [questionId]: answerId };
          set({ quizAnswers });
        },
        
        setPersona: (persona, confidence) => {
          set({ persona, personaConfidence: confidence });
          get().markStepCompleted('persona');
          get().unlockAchievement('explorer');
        },
        
        // ROI actions
        setROIInputs: (inputs) => {
          set({ roiInputs: { ...get().roiInputs, ...inputs } });
          get().markStepCompleted('roi');
          get().unlockAchievement('roi-believer');
        },
        
        // Journey actions
        setCurrentStep: (step) => set({ currentStep: step }),
        
        markStepCompleted: (stepId) => {
          const journeySteps = get().journeySteps.map(step =>
            step.id === stepId ? { ...step, completed: true } : step
          );
          set({ journeySteps });
        },
        
        // Achievement actions
        unlockAchievement: (achievementId) => {
          const { unlockedAchievements, totalPoints } = get();
          
          if (!unlockedAchievements.includes(achievementId)) {
            // Find achievement data
            const achievement = achievements.find((a: Achievement) => a.id === achievementId);
            
            if (achievement) {
              set({
                unlockedAchievements: [...unlockedAchievements, achievementId],
                totalPoints: totalPoints + achievement.points,
                newAchievements: [...get().newAchievements, achievement],
                showAchievement: true
              });
              
              // Auto-dismiss after 3 seconds
              setTimeout(() => {
                get().dismissAchievement();
              }, 3000);
            }
          }
        },
        
        dismissAchievement: () => {
          set({ 
            showAchievement: false,
            newAchievements: get().newAchievements.slice(1)
          });
          
          // Show next achievement if any
          if (get().newAchievements.length > 0) {
            setTimeout(() => {
              set({ showAchievement: true });
            }, 500);
          }
        },
        
        checkAchievements: () => {
          const state = get();
          
          // Check tier selection
          if (state.tier && !state.unlockedAchievements.includes('stack-builder')) {
            state.unlockAchievement('stack-builder');
          }
          
          // Check module count
          if (state.modules.length >= 2 && !state.unlockedAchievements.includes('module-master')) {
            state.unlockAchievement('module-master');
          }
          
          // Check Watchtower
          if (state.watchtowerModules.length > 0 && !state.unlockedAchievements.includes('intelligence-commander')) {
            state.unlockAchievement('intelligence-commander');
          }
          
          // Check efficiency combo
          if (state.modules.includes('labor') && state.modules.includes('inventory') && 
              !state.unlockedAchievements.includes('efficiency-expert')) {
            state.unlockAchievement('efficiency-expert');
          }
          
          // Check all modules
          const allModules = ['labor', 'inventory', 'marketing', 'purchasing', 'reservations'];
          if (allModules.every(m => state.modules.includes(m)) && 
              !state.unlockedAchievements.includes('full-stack')) {
            state.unlockAchievement('full-stack');
          }
          
          // Check empire builder
          if (state.locations >= 10 && !state.unlockedAchievements.includes('empire-builder')) {
            state.unlockAchievement('empire-builder');
          }
          
          // Check summary viewed
          if (state.journeySteps.filter(s => s.completed).length === state.journeySteps.length &&
              !state.unlockedAchievements.includes('sundae-ready')) {
            state.unlockAchievement('sundae-ready');
          }
        },
        
        // Utility actions
        reset: () => set(initialState),
        
        loadFromPersona: (persona) => {
          // Set recommended configuration based on persona
          let layer: 'report' | 'core' = 'report';
          let tier: 'lite' | 'plus' | 'pro' | 'enterprise' = 'lite';
          
          if (persona.recommendedPath.includes('report')) {
            layer = 'report';
            if (persona.recommendedPath.includes('lite')) tier = 'lite';
            else if (persona.recommendedPath.includes('plus')) tier = 'plus';
            else if (persona.recommendedPath.includes('pro')) tier = 'pro';
          } else if (persona.recommendedPath.includes('core')) {
            layer = 'core';
            if (persona.recommendedPath.includes('lite')) tier = 'lite';
            else if (persona.recommendedPath.includes('pro')) tier = 'pro';
          }
          
          const locations = Math.floor((persona.locationRange.min + persona.locationRange.max) / 2);
          const modules = [...persona.modules];
          const watchtowerModules = persona.recommendedPath.includes('watchtower') ? ['bundle'] : [];
          
          set({
            layer,
            tier,
            locations,
            modules,
            watchtowerModules
          });
          
          // Mark appropriate steps as completed
          get().markStepCompleted('layer');
        }
      }),
      {
        name: 'sundae-pricing-config',
        partialize: (state) => ({
          // Only persist essential configuration
          layer: state.layer,
          tier: state.tier,
          locations: state.locations,
          modules: state.modules,
          watchtowerModules: state.watchtowerModules,
          competitors: state.competitors,
          quizAnswers: state.quizAnswers,
          persona: state.persona,
          roiInputs: state.roiInputs,
          unlockedAchievements: state.unlockedAchievements,
          totalPoints: state.totalPoints
        })
      }
    )
  )
);
