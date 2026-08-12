// Configuration state management using Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AddOnId, Configuration, CorePackageId, CrewSkuId } from '../types/configuration';
import { corePackages, crewSkus, packageAllowsWatchtower } from '../data/pricing';
import type { ROIInputs } from './useROICalculation';
import type { Persona } from '../data/personas';
import type { Achievement } from '../data/personas';
import { achievements } from '../data/personas';
import type { OperatingModelId, TechStackId } from '../lib/discoveryEngine';
import type { BillingCycle } from '../data/pricing';

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
  /**
   * Multi-select discovery answers, kept OUT of `quizAnswers` because that map
   * is single-answer. `operating_model` decides which concept pathways apply
   * and which per-object overlays are billed; `tech_stack` resolves the
   * one-time implementation class. Both are asked before a package is chosen —
   * asking after is how a franchisor gets quoted a single-brand configuration.
   */
  operatingModels: OperatingModelId[];
  techStack: TechStackId[];
  /**
   * Commitment term. v1.7 gives 10% for annual and 15% for two-year, and it is
   * the main lever in any real negotiation — but nothing in the simulator ever
   * set it, so `clientProfile.billingCycle` stayed undefined and both discounts
   * were unreachable.
   */
  billingCycle: BillingCycle;
  /** Persona suggested Watchtower. A suggestion, never a silent selection. */
  recommendsWatchtower: boolean;
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
  setLayer: (layer: 'core' | 'crew' | 'both' | null) => void;
  setCorePackage: (corePackage: CorePackageId) => void;
  // Crew multi-select API. `toggle` flips a single SKU and auto-resolves
  // prerequisites + mutual exclusions. `set` replaces the entire set (used
  // when picking a one-click preset like Operating Suite / Complete Suite).
  toggleCrewSku: (sku: CrewSkuId) => void;
  setCrewSkus: (skus: CrewSkuId[]) => void;
  setLocations: (locations: number) => void;
  toggleAddOn: (addOnId: AddOnId) => void;
  setAddOns: (addOns: AddOnId[]) => void;
  toggleWatchtowerModule: (moduleId: string) => void;
  setWatchtowerModules: (modules: string[]) => void;
  setCrossIntelligence: (selection: 'none' | 'base' | 'pro') => void;
  
  // Quiz actions
  setQuizAnswer: (questionId: string, answerId: string) => void;
  setDiscoveryAnswers: (operatingModels: OperatingModelId[], techStack: TechStackId[]) => void;
  setBillingCycle: (cycle: BillingCycle) => void;
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
  layer: null as 'core' | 'crew' | 'both' | null,
  corePackage: 'core_foundation' as CorePackageId,
  locations: 1,
  addOns: [] as AddOnId[],
  watchtowerModules: [] as string[],
  crossIntelligence: 'none' as 'none' | 'base' | 'pro',
  crewSkus: [] as CrewSkuId[],
  
  // Journey
  currentStep: 0,
  journeySteps: [
    { id: 'persona', name: 'Discover Your Persona', completed: false },
    { id: 'layer', name: 'Choose Your Layer', completed: false },
    { id: 'tier', name: 'Select Your Tier', completed: false },
    { id: 'addons', name: 'Add-ons', completed: false },
    { id: 'watchtower', name: 'Watchtower Intel', completed: false },
    { id: 'roi', name: 'Calculate ROI', completed: false },
    { id: 'summary', name: 'Review & Launch', completed: false }
  ],
  
  // Quiz
  quizAnswers: {},
  operatingModels: [],
  techStack: [],
  billingCycle: 'monthly' as BillingCycle,
  recommendsWatchtower: false,
  persona: null,
  personaConfidence: 0,
  
  // ROI
  roiInputs: {
    monthlyRevenue: 100000,
    laborPercent: 32,
    foodCostPercent: 29,
    marketingSpend: 2000,
    reservationNoShowRate: 15,
    replaceableSystemsSpend: 0,
    manualReportingHoursPerWeek: 0,
    loadedHourlyRate: 50,
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
              addOns: [],
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
            get().markStepCompleted('package');
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
          get().markStepCompleted('package');
          get().checkAchievements();
        },

        setCrewSkus: (skus) => {
          set({ crewSkus: skus });
          // If preset is Lite, clamp locations to the hard cap of 5.
          if (skus.length === 1 && skus[0] === 'crew_lite') {
            set({ locations: Math.min(get().locations, 5) });
          }
          get().markStepCompleted('package');
          get().checkAchievements();
        },
        
        setCorePackage: (corePackage) => {
          set({
            corePackage,
            // A package change can make a previously valid Watchtower choice
            // unavailable. Clear it rather than carrying a priced-looking line
            // that the engine silently drops from the total.
            watchtowerModules: packageAllowsWatchtower(corePackage)
              ? get().watchtowerModules
              : [],
          });
          get().markStepCompleted('package');
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
        
        toggleAddOn: (addOnId) => {
          const addOns = get().addOns;
          const next = addOns.includes(addOnId)
            ? addOns.filter((id) => id !== addOnId)
            : [...addOns, addOnId];
          set({ addOns: next });
          if (next.length > 0) {
            get().markStepCompleted('addons');
          }
          get().checkAchievements();
        },

        setAddOns: (addOns) => {
          set({ addOns });
          if (addOns.length > 0) {
            get().markStepCompleted('addons');
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
        setDiscoveryAnswers: (operatingModels, techStack) => {
          set({ operatingModels, techStack });
        },

        setBillingCycle: (billingCycle) => {
          set({ billingCycle });
        },

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

          // Check package selection
          if (state.corePackage && !state.unlockedAchievements.includes('stack-builder')) {
            state.unlockAchievement('stack-builder');
          }

          // Check add-on count
          if (state.addOns.length >= 2 && !state.unlockedAchievements.includes('module-master')) {
            state.unlockAchievement('module-master');
          }

          // Check Watchtower
          if (state.watchtowerModules.length > 0 && !state.unlockedAchievements.includes('intelligence-commander')) {
            state.unlockAchievement('intelligence-commander');
          }

          const packageDomains = state.corePackage
            ? corePackages[state.corePackage].includesDomainModules
            : [];
          if (packageDomains.includes('labor') && packageDomains.includes('inventory') &&
              !state.unlockedAchievements.includes('efficiency-expert')) {
            state.unlockAchievement('efficiency-expert');
          }

          // Full stack = Foresight & Action plus at least one concept SKU.
          if (state.addOns.includes('foresight_action') && state.addOns.length >= 2 &&
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
          // v1.7: the Report layer is retired, so every analytics persona lands
          // on a Core package. `recommendedPath` carries the package slug.
          const path = persona.recommendedPath;
          let corePackage: CorePackageId = 'core_foundation';
          if (path.includes('performance')) corePackage = 'core_performance';
          else if (path.includes('growth')) corePackage = 'core_growth';
          else if (path.includes('margin')) corePackage = 'core_margin';

          // A persona is a RECOMMENDATION, not a purchase. This used to set
          // `watchtowerModules: ['bundle']` whenever the persona's path
          // mentioned Watchtower, so finishing the quiz as a Strategist
          // silently added the paid Watchtower Complete bundle — $899 + $109
          // per location, never chosen, and appearing in the total as though
          // the buyer had asked for it. The suggestion is now surfaced on the
          // Watchtower step instead, where it can be accepted or ignored.
          const recommendsWatchtower = path.includes('watchtower');

          set({
            layer: 'core',
            corePackage,
            recommendsWatchtower,
          });

          get().markStepCompleted('layer');
        }
      }),
      {
        // Key bumped for price book v1.7: the persisted shape changed
        // (tier/modules → corePackage/addOns) and the old shape references
        // retired catalog ids. A fresh key discards it outright.
        name: 'sundae-pricing-config-v1-7',
        partialize: (state) => ({
          // Only persist essential configuration
          layer: state.layer,
          corePackage: state.corePackage,
          locations: state.locations,
          addOns: state.addOns,
          watchtowerModules: state.watchtowerModules,
          crossIntelligence: state.crossIntelligence,
          crewSkus: state.crewSkus,
          quizAnswers: state.quizAnswers,
          operatingModels: state.operatingModels,
          techStack: state.techStack,
          billingCycle: state.billingCycle,
          recommendsWatchtower: state.recommendsWatchtower,
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
