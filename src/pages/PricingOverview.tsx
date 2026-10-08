import { useBuyerQuote, useBuyerFormatting } from '../hooks/useBuyerQuote';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { LivePricingGate } from '../components/shared/LivePricingGate';
import { PlanChoices, PriceDetails } from '../components/Pricing/PricingWorkspace';
import { trackPricingEvent } from '../lib/analytics';
import { usePricingViewEvent, usePricingConfigurationTelemetry } from '../hooks/usePricingTelemetry';

export function PricingOverview() {
  const navigate = useNavigate();
  const { state, config, quote, live } = useBuyerQuote();
  const { copy, money, messages } = useBuyerFormatting();
  const ready = !live.required || live.status === 'ready';
  usePricingViewEvent('first_price_displayed', { layer: config.layer, locations: config.locations, monthly: quote.monthly }, ready);
  usePricingConfigurationTelemetry(config, ready);
  const proceed = (step: number) => { if (!state.layer) state.setLayer('core'); state.setCurrentStep(step); trackPricingEvent('refinement_started', { step }); navigate('/simulator'); window.scrollTo(0,0); };
  return <LivePricingGate state={live}><div className="buyer-page">
    <section className="pricing-hero"><div><p className="pricing-eyebrow">SUNDAE / {messages.header.pricing}</p><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><a href="#plan-comparison" className="hero-note">Core · Crew · Core + Crew<ArrowRight size={16}/></a></section>
    <div id="plan-comparison"><PlanChoices/></div>
    <div className="pricing-decision-bar"><div><small>{messages.summary.monthlyInvestment}</small><strong>{quote.needsCrewSelection ? copy.chooseCrew : quote.enterprise ? messages.overview.contactSales : money(quote.monthly)}{!quote.enterprise && !quote.needsCrewSelection && <span>{messages.overview.perMonth}</span>}</strong></div><div className="decision-actions"><button type="button" disabled={quote.needsCrewSelection} className="pricing-secondary" onClick={() => proceed(1)}><SlidersHorizontal size={16}/>{copy.refineCta}</button><button type="button" disabled={quote.needsCrewSelection} className="pricing-primary" onClick={() => proceed(2)}>{copy.reviewCta}<ArrowRight size={16}/></button></div></div>
    <PriceDetails/>
    <div className="pricing-notes overview-notes"><p>{copy.scoped} · {copy.intentNote}</p><p>{copy.exclusions}</p></div>
  </div></LivePricingGate>;
}
