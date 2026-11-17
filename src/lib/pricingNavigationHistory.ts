import { useConfiguration } from '../hooks/useConfiguration';

function selectionKey() {
  const state = useConfiguration.getState();
  return JSON.stringify([
    state.layer, state.corePackage, state.locations, state.addOns,
    state.watchtowerModules, state.crewSkus, state.crossIntelligence,
    state.billingCycle, state.operatingModels, state.employees, state.payrollCountry,
  ]);
}

/** Keep Back on the same calculator step without adding quote details to URLs. */
export function rememberPricingStepForReturn(event: { target: EventTarget | null }) {
  if (window.location.pathname !== '/simulator' || !(event.target instanceof Element) || !event.target.closest('a[href]')) return;
  window.history.replaceState({
    ...window.history.state,
    sundaePricingReturn: { step: useConfiguration.getState().currentStep, selection: selectionKey() },
  }, '');
}

export function getPricingReturnStep(): number | null {
  const saved = window.history.state?.sundaePricingReturn;
  return saved && [0, 1, 2].includes(saved.step) && saved.selection === selectionKey() ? saved.step : null;
}
