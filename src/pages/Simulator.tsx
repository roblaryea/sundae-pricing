import { useBuyerQuote, useBuyerFormatting } from '../hooks/useBuyerQuote';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PlanChoices, RefineNeeds, QuoteReview } from '../components/Pricing/PricingWorkspace';
import { LivePricingGate } from '../components/shared/LivePricingGate';
import { decodePricingIntent } from '../lib/pricingIntent';
import { useConfiguration } from '../hooks/useConfiguration';
import { usePricingViewEvent, usePricingConfigurationTelemetry } from '../hooks/usePricingTelemetry';

export function Simulator() {
  const { state, config, live, quote } = useBuyerQuote();
  const { copy, messages } = useBuyerFormatting();
  const [invalidLink] = useState(() => { const raw = new URLSearchParams(window.location.search).get('cfg'); return Boolean(raw && !decodePricingIntent(raw)); });
  const initialized = useRef(false);
  const region = useRef<HTMLDivElement>(null);
  const step = Math.min(2,Math.max(0,state.currentStep));
  const ready = (!live.required || live.status === 'ready') && !new URLSearchParams(window.location.search).has('cfg');
  usePricingConfigurationTelemetry(config, ready);
  usePricingViewEvent('simulator_started', {}, ready);
  usePricingViewEvent('configuration_link_invalid', {}, ready && invalidLink);
  usePricingViewEvent('step_viewed', { step }, ready, String(step));
  const names = [copy.choose,copy.refine,copy.review];
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const raw = new URLSearchParams(window.location.search).get('cfg');
    if (raw) {
      const intent = decodePricingIntent(raw);
      if (intent) useConfiguration.setState({ ...intent, currentStep: 2 });
      const url = new URL(window.location.href); url.searchParams.delete('cfg');
      window.history.replaceState(null,'',url.pathname + url.search);
    }
  },[]);
  useEffect(() => {
    region.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  },[step]);
  return <LivePricingGate state={live}><div className="buyer-page simulator-page">
    <nav className="buyer-progress" aria-label={messages.header.simulator}>{names.map((name,i) => <button type="button" key={i} disabled={i > 0 && quote.needsCrewSelection} aria-current={step === i ? 'step' : undefined} onClick={() => state.setCurrentStep(i)}><span>{i < step ? '✓' : `0${i+1}`}</span>{name}</button>)}</nav>
    {invalidLink && <p className="intent-warning" role="alert">{copy.intentError}</p>}
    <div ref={region} tabIndex={-1} data-testid="step-region" className="buyer-step"><div className="section-title step-title"><p className="pricing-eyebrow">{messages.header.simulator} / 0{step+1}</p><h1>{names[step]}</h1></div>
      {step === 0 ? <PlanChoices/> : step === 1 ? <RefineNeeds/> : <QuoteReview/>}
    </div>
    <div className="step-actions"><button className="pricing-secondary" type="button" disabled={step === 0} onClick={() => state.setCurrentStep(step - 1)}><ArrowLeft size={16}/>{messages.simulator.back}</button>{step < 2 && <button className="pricing-primary" type="button" disabled={quote.needsCrewSelection} onClick={() => state.setCurrentStep(step + 1)}>{step === 1 ? copy.reviewCta : copy.refineCta}<ArrowRight size={16}/></button>}</div>
  </div></LivePricingGate>;
}
