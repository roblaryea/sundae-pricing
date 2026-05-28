// Configuration state management using Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Configuration, CrewSkuId } from '../types/configuration';
import { crewSkus } from '../data/pricing';
import type { CompetitorId } from '../data/competitors';
import type { ROIInputs } from './useROICalculation';
import type { Persona } from '../data/personas';
import type { Achievement } from '../data/personas';
import { achievements } from '../data/personas';

type E2EStoreWindow = Window & {
  __SUNDAE_STORE__?: typeof useConfiguration;
};

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
  setLayer: (layer: 'report' | 'core' | 'crew' | null) => void;
  setTier: (tier: 'lite' | 'plus' | 'pro' | 'enterprise') => void;
  // Crew multi-select API. `toggle` flips a single SKU and auto-resolves
  // prerequisites + mutual exclusions. `set` replaces the entire set (used
  // when picking a one-click preset like Operating Suite / Complete Suite).
  toggleCrewSku: (sku: CrewSkuId) => void;
  setCrewSkus: (skus: CrewSkuId[]) => void;
  setLocations: (locations: number) => void;
  toggleModule: (moduleId: string) => void;
  setModules: (modules: string[]) => void;
  toggleWatchtowerModule: (moduleId: string) => void;
  setWatchtowerModules: (modules: string[]) => void;
  setCrossIntelligence: (selection: 'none' | 'base' | 'pro') => void;
  
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
  layer: null as 'report' | 'core' | 'crew' | null,
  tier: 'lite' as 'lite' | 'plus' | 'pro' | 'enterprise',
  locations: 1,
  modules: [] as string[],
  watchtowerModules: [] as string[],
  crossIntelligence: 'none' as 'none' | 'base' | 'pro',
  crewSkus: [] as CrewSkuId[],
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
          // Switching to Crew clears Report/Core configuration that doesn't
          // apply, and defaults the SKU set to the Operating Suite preset
          // (Operations + T&A + Payroll) so the visitor sees a populated
          // price card right away. Existing picks are preserved across
          // re-entries to the Crew step.
          if (layer === 'crew') {
            const existing = get().crewSkus;
            // Operating Suite default seed. Scheduling rides along
            // because Operations is in it (Operations entitlement
            // includes Scheduling — pricing engine zeros its line).
            const seed: CrewSkuId[] = existing.length > 0
              ? existing
              : ['crew_operations', 'crew_scheduling', 'crew_tna', 'crew_payroll'];
            set({
              layer,
              modules: [],
              watchtowerModules: [],
              crossIntelligence: 'none' as const,
              crewSkus: seed,
            });
            // If the Lite cap (5) is exceeded by the persisted location
            // count, clamp it. `seed` is never Lite here, so no clamp.
          } else {
            // Leaving Crew or switching away — clear the Crew SKU pick.
            set({ layer, crewSkus: [] });
          }
          get().checkAchievements();
        },

        toggleCrewSku: (sku) => {
          const current = get().crewSkus;
          const isAdding = !current.includes(sku);

          // Crew Lite is mutually exclusive with every full Crew SKU
          // (per crewSkus[crew_lite].mutuallyExclusiveWith). Picking Lite
          // wipes the rest; picking anything else wipes Lite.
          if (sku === 'crew_lite') {
            const next: CrewSkuId[] = isAdding ? ['crew_lite'] : [];
            set({ crewSkus: next, locations: isAdding ? Math.min(get().locations, 5) : get().locations });
            get().markStepCompleted('tier');
            get().checkAchievements();
            return;
          }

          let next: CrewSkuId[] = current.filter((id) => id !== 'crew_lite');

          // Guard: Scheduling can't be unticked while Operations is in
          // the set — Operations entitlement includes Scheduling, so
          // Scheduling is auto-locked-on. (The UI also disables the
          // tile; this is the defensive layer.)
          if (sku === 'crew_scheduling' && !isAdding && next.includes('crew_operations')) {
            return;
          }

          if (isAdding) {
            next = Array.from(new Set([...next, sku]));
            // Auto-attach declared prerequisites (one-hop is enough for
            // the current graph). T&A's prereq is Scheduling, but if
            // Operations is already in the set, T&A is satisfied — skip
            // attaching Scheduling for T&A specifically. For everything
            // else, attach the declared prereq.
            const prereqs = (crewSkus[sku]?.prerequisites ?? []) as CrewSkuId[];
            for (const p of prereqs) {
              if (sku === 'crew_tna' && p === 'crew_scheduling' && next.includes('crew_operations')) {
                continue;
              }
              if (!next.includes(p)) next.push(p);
            }
            // Operations auto-attaches Scheduling so the Scheduling tile
            // renders as "selected" with a $0 line (visual confirmation
            // that Operations includes it). Removing Operations later
            // leaves Scheduling in the set and reinstates its price.
            if (sku === 'crew_operations' && !next.includes('crew_scheduling')) {
              next.push('crew_scheduling');
            }
          } else {
            next = next.filter((id) => id !== sku);
            // Cascade: removing a SKU may break a downstream dep.
            const dependentsOf: Record<CrewSkuId, CrewSkuId[]> = {
              crew_lite: [],
              // Removing Scheduling only breaks T&A if Operations isn't
              // present — Operations satisfies T&A's OR dep.
              crew_scheduling: ['crew_tna'],
              crew_operations: ['crew_payroll', 'crew_people_intelligence', 'crew_tna'],
              crew_tna: [],
              crew_payroll: [],
              crew_people_intelligence: [],
            };
            const dependents = dependentsOf[sku] ?? [];
            for (const d of dependents) {
              // T&A is OK if EITHER Scheduling OR Operations still
              // remains in the set (the OR rule for T&A's prereq).
              if (d === 'crew_tna') {
                if (next.includes('crew_scheduling') || next.includes('crew_operations')) {
                  continue;
                }
              }
              next = next.filter((id) => id !== d);
            }
          }

          set({ crewSkus: next });
          get().markStepCompleted('tier');
          get().checkAchievements();
        },

        setCrewSkus: (skus) => {
          set({ crewSkus: skus });
          // If preset is Lite, clamp locations to the hard cap of 5.
          if (skus.length === 1 && skus[0] === 'crew_lite') {
            set({ locations: Math.min(get().locations, 5) });
          }
          get().markStepCompleted('tier');
          get().checkAchievements();
        },
        
        setTier: (tier) => {
          const { layer } = get();
          const updates: Partial<ConfigurationState> = { tier };
          
          // Import tier availability check
          const key = `${layer}-${tier}`;
          const TIER_AVAILABILITY: Record<string, { modules: boolean; watchtower: boolean }> = {
            'report-lite': { modules: false, watchtower: false },
            'report-plus': { modules: false, watchtower: false },
            'report-pro': { modules: false, watchtower: false },
            'report-enterprise': { modules: false, watchtower: false },
            'core-lite': { modules: true, watchtower: true },
            'core-pro': { modules: true, watchtower: true },
            'core-enterprise': { modules: true, watchtower: true }
          };
          
          const features = TIER_AVAILABILITY[key];
          
          // Clear modules if tier doesn't support them
          if (features && !features.modules) {
            updates.modules = [];
            updates.crossIntelligence = 'none' as const;
          }

          // Clear watchtower if tier doesn't support it
          if (features && !features.watchtower) {
            updates.watchtowerModules = [];
          }
          
          set(updates);
          get().markStepCompleted('tier');
          get().checkAchievements();
        },
        
        setLocations: (locations) => {
          // Crew Lite has a hard location cap of 5 (`crewSkus.crew_lite.caps.maxLocations`).
          // Clamp any caller that requests more so the slider, persisted
          // state, and pricing math never disagree.
          const skus = get().crewSkus;
          const liteOnly = skus.length === 1 && skus[0] === 'crew_lite';
          const clamped = liteOnly ? Math.min(locations, 5) : locations;
          set({ locations: clamped });
          get().markStepCompleted('locations');
          get().checkAchievements();
        },
        
        toggleModule: (moduleId) => {
          const modules = get().modules;
          const newModules = modules.includes(moduleId)
            ? modules.filter(id => id !== moduleId)
            : [...modules, moduleId];
          const updates: Partial<ConfigurationState> = { modules: newModules };
          // Auto-enable Cross-Intelligence Base when 3+ modules
          if (newModules.length >= 3 && get().crossIntelligence === 'none') {
            updates.crossIntelligence = 'base' as const;
          } else if (newModules.length < 3 && get().crossIntelligence !== 'none') {
            updates.crossIntelligence = 'none' as const;
          }
          set(updates);
          if (newModules.length > 0) {
            get().markStepCompleted('modules');
          }
          get().checkAchievements();
        },

        setModules: (modules) => {
          const updates: Partial<ConfigurationState> = { modules };
          if (modules.length >= 3 && get().crossIntelligence === 'none') {
            updates.crossIntelligence = 'base' as const;
          } else if (modules.length < 3) {
            updates.crossIntelligence = 'none' as const;
          }
          set(updates);
          if (modules.length > 0) {
            get().markStepCompleted('modules');
          }
          get().checkAchievements();
        },
        
        toggleWatchtowerModule: (moduleId) => {
          const watchtowerModules = get().watchtowerModules;
          
          if (moduleId === 'bundle') {
            // Toggle bundle: if already selected, deselect it
            if (watchtowerModules.includes('bundle')) {
              set({ watchtowerModules: [] });
            } else {
              // If selecting bundle, clear individual modules
              set({ watchtowerModules: ['bundle'] });
            }
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

        setCrossIntelligence: (selection) => {
          set({ crossIntelligence: selection });
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
          
          // Check all modules (now 12 modules)
          const allModules = ['labor', 'inventory', 'marketing', 'purchasing', 'reservations', 'profit', 'revenue', 'delivery', 'guest', 'accounting', 'guest_crm', 'economic'];
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
          // NOTE: modules are NOT set here - they are set by the recommendation engine
          // in PathwaySelector based on user's "keeps you up at night" answers
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
          
          const watchtowerModules = persona.recommendedPath.includes('watchtower') ? ['bundle'] : [];
          
          // Only set layer, tier, and watchtower - DO NOT overwrite modules
          // Modules are pre-selected by the recommendation engine based on quiz answers
          set({
            layer,
            tier,
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
          crossIntelligence: state.crossIntelligence,
          crewSkus: state.crewSkus,
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

// Expose store for E2E testing in dev mode
if (import.meta.env.DEV) {
  (window as E2EStoreWindow).__SUNDAE_STORE__ = useConfiguration;
}
