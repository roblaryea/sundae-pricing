import { useBuyerQuote, useBuyerFormatting } from '../hooks/useBuyerQuote';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { LivePricingGate } from '../components/shared/LivePricingGate';
import { PlanChoices, PriceDetails } from '../components/Pricing/PricingWorkspace';
import { trackPricingEvent } from '../lib/analytics';
import { usePricingViewEvent, usePricingConfigurationTelemetry } from '../hooks/usePricingTelemetry';
import { getBuyerClarityCopy } from '../lib/buyerClarityCopy';
import { getLocationGateCopy } from '../lib/locationGateCopy';
import { focusLocationInput } from '../lib/locationInput';
import { PricingHero } from '../components/Pricing/PricingPending';
import { AveragePrice } from '../components/Pricing/AveragePrice';

export function PricingOverview() {
  const navigate = useNavigate();
  const { state, config, quote, live } = useBuyerQuote();
  const { copy, reviewCopy, money, messages, locale } = useBuyerFormatting();
  const ready = !live.required || live.status === 'ready';
  const pricesVisible = state.locationsConfirmed;
  usePricingViewEvent('first_price_displayed', { layer: config.layer, locations: config.locations, monthly: quote.monthly }, ready && pricesVisible && !quote.needsCrewSelection);
  usePricingConfigurationTelemetry(config, ready && pricesVisible);
  const proceed = (step: number) => { if (!pricesVisible) { focusLocationInput(); return; } if (!state.layer) state.setLayer('core'); state.setCurrentStep(step); trackPricingEvent(step === 1 ? 'refinement_started' : 'review_started', { step }); navigate('/simulator'); window.scrollTo(0,0); };
  return <LivePricingGate state={live}><div className="buyer-page">
    <PricingHero/>
    <div id="plan-comparison"><PlanChoices showPrices={pricesVisible}/></div>
    <button type="button" className="compact-refine pricing-secondary" disabled={quote.needsCrewSelection} onClick={() => proceed(1)}>{copy.refineCta}</button>
    <div className={`pricing-decision-bar ${pricesVisible ? '' : 'is-location-gated'}`}><div className={`decision-price ${pricesVisible && quote.averageMonthlyPerLocation !== null ? 'has-average' : ''}`}>
      {pricesVisible ? <><div className="decision-total-row"><small>{getBuyerClarityCopy(locale).total}</small><strong data-testid="decision-total">{quote.needsCrewSelection ? copy.chooseCrew : quote.enterprise ? messages.overview.contactSales : money(quote.monthly)}{!quote.enterprise && !quote.needsCrewSelection && <span>{messages.overview.perMonth}</span>}</strong></div>{quote.averageMonthlyPerLocation !== null && <div className="decision-average"><AveragePrice amount={money(quote.averageMonthlyPerLocation)} locations={config.locations} testId="decision-average"/></div>}{quote.workforceUnknown && !quote.enterprise && !quote.needsCrewSelection && <button type="button" className="workforce-prompt" onClick={() => proceed(1)}>{reviewCopy.addEmployees}<ArrowRight size={12} aria-hidden/></button>}</> : <button type="button" className="location-gate-message" data-testid="location-gate-message" onClick={focusLocationInput}>{getLocationGateCopy(locale)}</button>}
    </div><div className="decision-actions"><button type="button" disabled={quote.needsCrewSelection} className="pricing-secondary" onClick={() => proceed(1)}><SlidersHorizontal size={16} aria-hidden/>{copy.refineCta}</button><button type="button" disabled={quote.needsCrewSelection} className="pricing-primary" onClick={() => proceed(2)}><span className="desktop-review-label">{copy.reviewCta}</span><span className="compact-review-label">{getBuyerClarityCopy(locale).review}</span><ArrowRight size={16} aria-hidden/></button></div></div>
    <PriceDetails showPrices={pricesVisible}/>
    <div className="pricing-notes overview-notes"><p>{copy.scoped} · {copy.intentNote}</p><p>{copy.exclusions}</p></div>
  </div></LivePricingGate>;
}
