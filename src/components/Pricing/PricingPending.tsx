import { ArrowRight, Minus, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../../contexts/LocaleContext';
import { useConfiguration } from '../../hooks/useConfiguration';
import { getBuyerCopy } from '../../lib/buyerCopy';
import { buyerPlanCopy } from '../../lib/buyerPlanCopy';
import { getImplementationPlanningCopy } from '../../lib/implementationPlanningCopy';
import { getBuyerJourneyCopy } from '../../lib/buyerJourneyCopy';
import { corePackages, CORE_PACKAGE_IDS } from '../../data/pricing';
import { CREW_PRESETS } from '../../lib/crewPricing';
import { localizeTierName } from '../../lib/pricingI18n';
import type { ReactNode } from 'react';

/** The same non-price heading is available before the catalogue and afterward. */
export function PricingHero() {
  const { locale, messages } = useLocale();
  const copy = getBuyerCopy(locale);
  return <section className="pricing-hero"><div><p className="pricing-eyebrow">SUNDAE / {messages.header.pricing}</p><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><a href="#plan-comparison" className="hero-note">Core · Crew · Core + Crew<ArrowRight size={16}/></a></section>;
}

/** Structural placeholders only: no quote calculation, pricing controls, or
 * child effects run until the authoritative catalogue passes the existing gate. */
export function PricingPending({ status }: { status: ReactNode }) {
  const { locale, messages } = useLocale();
  const copy = getBuyerCopy(locale);
  const journey = getBuyerJourneyCopy(locale);
  const { pathname } = useLocation();
  const config = useConfiguration();
  const crew = config.layer === 'crew';
  const plans = crew ? CREW_PRESETS.map(p => ({id:p.id, name:p.label, purpose:copy.crewHint}))
    : CORE_PACKAGE_IDS.map((id,i) => ({id, name:localizeTierName(corePackages[id].name,locale).replace(/^Core /,''), purpose:buyerPlanCopy[locale].purposes[i]}));
  const selected = crew ? plans[0].id : config.corePackage;
  return <div className="buyer-page pricing-pending" aria-busy="true" data-testid="pricing-pending">
    {pathname.replace(/\/+$/, '') === '/simulator'
      ? <div className="section-title step-title"><p className="pricing-eyebrow">{messages.header.simulator}</p><h1>{copy.review}</h1></div>
      : <PricingHero/>}
    <div aria-hidden="true" inert>
      <div className="scope-controls">
        <fieldset className="need-control" disabled><legend>{copy.need}</legend><div className="need-options">{(['core','crew','both'] as const).map(id => <button key={id} type="button" disabled aria-pressed={(config.layer ?? 'core') === id}><span>{id === 'both' ? 'Core + Crew' : id === 'core' ? 'Core' : 'Crew'}</span><small>{copy[id]}</small></button>)}</div></fieldset>
        <div className="location-control"><span>{journey.locationQuestion}</span><div><button type="button" disabled><Minus size={16}/></button><input type="number" disabled readOnly value={pathname === '/' && !config.locationsConfirmed ? '' : config.locations} aria-label={journey.locationQuestion}/><button type="button" disabled><Plus size={16}/></button></div></div>
      </div>
    </div>
    <div className="pricing-pending-status" role="status">{status}</div>
    <div aria-hidden="true" inert>
      <div className="mobile-plan-select"><span>{crew ? 'Sundae Crew' : 'Sundae Core'} · {copy.choose}</span><select disabled value={selected} aria-label={copy.choose} onChange={()=>undefined}>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div className="plan-grid">{plans.map(plan => <article key={plan.id} className={`plan-card ${plan.id === selected ? 'is-selected' : ''}`}>
        <div className="plan-top"><span className="plan-kicker"><span className="pricing-placeholder">&nbsp;</span></span></div>
        <h2>{plan.name}</h2><div className="plan-price"><span className="pricing-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;</span></div>
        <p className="plan-total"><span className="pricing-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p>
        <p className="plan-purpose">{plan.purpose}</p>
        <ul>{[0,1,2,3].map(i=><li key={i}><span className="pricing-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></li>)}</ul>
        <button type="button" className="plan-select" disabled><span className="pricing-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;</span></button>
      </article>)}</div>
      <details className="comparison-section pricing-disclosure"><summary>{copy.compare}</summary></details>
      <section className="setup-guide"><h3>{getImplementationPlanningCopy(locale).estimatedSetup}</h3><p><span className="pricing-placeholder">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p><p className="pricing-caption">{getImplementationPlanningCopy(locale).scopeNote}</p><details className="pricing-disclosure"><summary>{copy.setup}</summary></details></section>
    </div>
  </div>;
}
