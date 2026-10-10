import { getEstimatePrintLabel, downloadBasketPDF } from '../../lib/basketPdf';
import { lazy, Suspense, useId, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Download, Link as LinkIcon, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { corePackages, CORE_PACKAGE_IDS, conceptSkus, foresightAction, packageAllowsWatchtower, billingDiscounts, crossIntelligence, crewSkus, crewBundles, watchtower, volumeDiscounts, DISCOUNT_RULES, implementationClasses, IMPLEMENTATION_CLASS_ORDER } from '../../data/pricing';
import { CREW_PRESETS, CREW_SKU_LIST } from '../../lib/crewPricing';
import { calculateBandedTotal, calculateBandLines, calculateAiCredits, calculateIntelligenceSeats, calculateCombinedDiscount, calculateCrossIntelligencePrice } from '../../lib/pricingEngine';
import { calculateBasketQuote } from '../../lib/basketQuote';
import { useBuyerQuote, useBuyerFormatting } from '../../hooks/useBuyerQuote';
import { demoUrl } from '../../lib/pricingLinks';
import { encodePricingIntent, INTENT_TERMS, INTENT_MODELS, MAX_EMPLOYEE_COUNT, SELF_SERVE_EMPLOYEE_LIMIT } from '../../lib/pricingIntent';
import { localizeTierName, localizeModuleName, localizeBreakdownLabel, localizeWatchtowerName } from '../../lib/pricingI18n';
import { localizeDiscountLine } from '../../lib/quoteSummaryCopy';
import { recommendedConceptSkus } from '../../lib/discoveryEngine';
import { trackPricingEvent } from '../../lib/analytics';
import { usePricingViewEvent } from '../../hooks/usePricingTelemetry';
import { pricingPolicyCopy } from '../../lib/pricingPolicyCopy';
import { AveragePrice } from './AveragePrice';
import { FeatureHelp, FeatureLabel, TextHelp } from './FeatureHelp';
import { OPERATING_MODEL_ICONS } from '../../lib/operatingModelIcons';
import { extraFeatureHelp, englishFeatureHelp } from '../../lib/featureHelpCopy';
import type { FeatureHelpId } from '../../lib/featureHelpCopy';
import { buyerPlanCopy } from '../../lib/buyerPlanCopy';
import { calculateWatchtowerPrice } from '../../lib/watchtowerEngine';
import { fillBuyerReviewCopy } from '../../lib/buyerReviewCopy';
import { formatPayrollCountry, getPayrollCountryOptions } from '../../lib/payrollCountryLabels';
const ROISimulator = lazy(() => import('../PricingDisplay/ROISimulator').then((m) => ({ default: m.ROISimulator })));

export function ScopeControls() {
  const { state, config } = useBuyerQuote();
  const { copy, journey } = useBuyerFormatting();
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => { const n = Number(draft ?? config.locations); state.setLocations(Number.isFinite(n) && n >= 1 ? n : config.locations); setDraft(null); };
  const max = 10000;
  return <div className="scope-controls">
    <fieldset className="need-control"><legend>{copy.need}</legend><div className="need-options">
      {(['core','crew','both'] as const).map((id) => <button type="button" key={id} data-testid={`pricing-tab-${id}`} aria-pressed={config.layer === id} onClick={() => state.setLayer(id)}>
        <span>{id === 'both' ? 'Core + Crew' : id === 'core' ? 'Core' : 'Crew'}</span><small>{copy[id]}</small>
      </button>)}
    </div></fieldset>
    <div className="location-control"><label htmlFor="buyer-locations">{journey.locationQuestion}</label><div>
      <button type="button" aria-label={`${journey.locationQuestion} −`} disabled={config.locations <= 1} onClick={() => state.setLocations(config.locations - 1)}><Minus size={16}/></button>
      <input id="buyer-locations" data-testid="location-count" type="number" min={1} max={max} step={1} inputMode="numeric" value={draft ?? String(config.locations)} onChange={(e) => { setDraft(e.target.value); const n = Number(e.target.value); if (Number.isInteger(n) && n >= 1 && n <= max) state.setLocations(n); }} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}/>
      <button type="button" aria-label={`${journey.locationQuestion} +`} disabled={config.locations >= max} onClick={() => state.setLocations(config.locations + 1)}><Plus size={16}/></button>
    </div></div>
  </div>;
}

function useBuyerDiscount() {
  const { config, quote } = useBuyerQuote();
  const { reviewCopy, locale } = useBuyerFormatting();
  const discount = calculateCombinedDiscount(config.locations, config.billingCycle);
  const percent = quote.enterprise ? 0 : discount.totalPercent;
  const label = percent ? fillBuyerReviewCopy(discount.appliedVolumePercent > 0 ? reviewCopy.volumeDiscount : reviewCopy.termDiscount, { percent: new Intl.NumberFormat(locale).format(percent) }) : '';
  return { percent, label, net: (gross: number) => Math.round(gross * (1 - percent / 100) * 100) / 100 };
}

export function SetupGuide({ compact = false }: { compact?: boolean }) {
  const { config, quote, live } = useBuyerQuote();
  const { copy, reviewCopy, money, locale } = useBuyerFormatting();
  const policy = pricingPolicyCopy[locale];
  const selectedCrewPreset = CREW_PRESETS.find((preset) => preset.skus.length === config.crewSkus.length && preset.skus.every((id) => config.crewSkus.includes(id)));
  const setupProduct = config.layer === 'core'
    ? 'Core'
    : config.layer === 'both'
      ? 'Core + Crew'
      : selectedCrewPreset?.label ?? 'Crew';
  const setupPublished = !live.catalog || live.policyCoverage?.implementation;
  const selectedSetup = quote.enterprise || quote.implementation.requiresScoping ? copy.scoped : `${quote.implementation.isFloor ? '≥ ' : ''}${money(quote.implementation.fee)}`;
  return <section className={`setup-guide ${compact ? 'is-compact' : ''}`} aria-label={copy.setup} data-testid="setup-guide">
    <h3>{copy.setup}</h3>
    <p>{setupProduct} · {copy.setup}: {setupPublished ? selectedSetup : copy.scoped}.</p>
    <p className="pricing-caption">{reviewCopy.setupNote}</p>
    {!compact && setupPublished && <details className="pricing-disclosure"><summary>{copy.setup}<ChevronDown size={16} aria-hidden/></summary>
      {IMPLEMENTATION_CLASS_ORDER.map((id, i) => <div key={id} className="band-line"><span>{policy.classes[i].replace(/^[A-D]\s*[·-]\s*/, '')}</span><strong>{implementationClasses[id].isFloor ? '≥ ' : ''}{money(implementationClasses[id].fee)}</strong></div>)}
    </details>}
  </section>;
}

function CoreComparison() {
  const { config } = useBuyerQuote();
  const { copy, messages, locale } = useBuyerFormatting();
  const [comparisonPlan, setComparisonPlan] = useState(config.corePackage);
  return <details className="comparison-section pricing-disclosure" data-testid="plan-comparison-details"><summary>{copy.compare}<ChevronDown size={16} aria-hidden/></summary>
    <p className="pricing-caption">{buyerPlanCopy[locale].comparison}</p>
    <div className="comparison-desktop comparison-scroll" tabIndex={0} role="region" aria-label={copy.compare}><table className="comparison-table"><thead><tr><th scope="col">{messages.builder.tierSelector.feature}</th>{CORE_PACKAGE_IDS.map((id) => <th scope="col" key={id}>{localizeTierName(corePackages[id].name,locale)}</th>)}</tr></thead><tbody>
      {(['profit','labor','revenue','pulse','inventory','purchasing','marketing','reservations','guest','guest_crm'] as const).map((domain) => <tr key={domain}><th scope="row"><FeatureLabel feature={domain} name={localizeModuleName(domain,locale)}/></th>{CORE_PACKAGE_IDS.map((id) => <td key={id}>{corePackages[id].includesDomainModules.includes(domain) ? <span role="img" aria-label={copy.included}><Check size={16} aria-hidden/></span> : <span aria-label={copy.excluded}>—</span>}</td>)}</tr>)}
      <tr><th scope="row"><FeatureLabel feature="foresight_action" name="Foresight & Action"/></th>{CORE_PACKAGE_IDS.map((id) => <td key={id}>{corePackages[id].includesForesight ? <span role="img" aria-label={copy.included}><Check size={16} aria-hidden/></span> : copy.available}</td>)}</tr>
    </tbody></table></div>
    <div className="comparison-mobile"><label htmlFor="comparison-plan">{copy.compare}</label><select id="comparison-plan" data-testid="comparison-plan" value={comparisonPlan} onChange={(e) => setComparisonPlan(e.target.value as typeof comparisonPlan)}>{CORE_PACKAGE_IDS.map((id) => <option key={id} value={id}>{localizeTierName(corePackages[id].name,locale)}</option>)}</select>
      <ul>{corePackages[comparisonPlan].includesDomainModules.map((id) => <li key={id}><Check size={15} aria-hidden/><FeatureLabel feature={id} name={localizeModuleName(id,locale)}/></li>)}<li><Check size={15} aria-hidden/><FeatureLabel feature="foresight_action" name="Foresight & Action">Foresight · {corePackages[comparisonPlan].includesForesight ? copy.included : copy.available}</FeatureLabel></li></ul>
    </div>
  </details>;
}

export function PlanChoices() {
  const { state, config, quote } = useBuyerQuote();
  const { copy, reviewCopy, messages, locale, money, cardMoney } = useBuyerFormatting();
  const [rail, setRail] = useState<'core' | 'crew'>('core');
  const activeRail = config.layer === 'both' ? rail : config.layer;
  const discount = useBuyerDiscount();
  const shapes = messages.builder.tierSelector;
  const shapeLabels = [shapes.shapeFoundation, shapes.shapeMargin, shapes.shapeGrowth, shapes.shapePerformance];
  const domains = [['profit','labor','revenue','pulse'], ['inventory','purchasing'], ['marketing','reservations','guest','guest_crm'], []] as const;
  const selectedPreset = CREW_PRESETS.find((preset) => preset.skus.length === config.crewSkus.length && preset.skus.every((id) => config.crewSkus.includes(id)));
  const starterMaxLocations = crewSkus.crew_lite.caps.maxLocations;
  const starterUnavailable = starterMaxLocations !== null && config.locations > starterMaxLocations;
  const starterUnavailableLabel = fillBuyerReviewCopy(reviewCopy.unavailable, { count: new Intl.NumberFormat(locale).format(starterMaxLocations ?? config.locations) });
  const starterCapLabel = starterMaxLocations === null ? copy.crew : copy.starterCap.replace('{count}', new Intl.NumberFormat(locale).format(starterMaxLocations));
  const otherQuote = config.layer === 'both' ? calculateBasketQuote({ ...config, layer: rail === 'core' ? 'crew' : 'core' }) : null;
  return <>
    <ScopeControls/>
    <p className="pricing-caption">{copy.estimate}</p>
    {config.layer === 'both' && <div className="combined-plan-switch">
      <div role="group" aria-label={copy.choose}>{(['core','crew'] as const).map((id) => <button type="button" key={id} data-testid={`edit-${id}-plan`} aria-pressed={rail === id} onClick={() => setRail(id)}>Sundae {id === 'core' ? 'Core' : 'Crew'}</button>)}</div>
      <div className="other-plan-summary"><span><small>{copy.selected} · Sundae {rail === 'core' ? 'Crew' : 'Core'}</small>{rail === 'core' ? quote.crew?.lines.map((line) => line.label).join(' + ') || copy.chooseCrew : localizeTierName(corePackages[config.corePackage].name,locale)}</span><div className="other-plan-price">{otherQuote!.averageMonthlyPerLocation !== null ? <><AveragePrice amount={money(otherQuote!.averageMonthlyPerLocation)} locations={config.locations} testId="other-plan-average"/><p className="plan-total">{messages.summary.monthlyInvestment} <bdi>{money(otherQuote!.monthly)}</bdi>{messages.overview.perMonth}</p></> : <strong>{otherQuote!.needsCrewSelection ? copy.chooseCrew : quote.enterprise ? messages.overview.contactSales : money(otherQuote!.monthly)}{!quote.enterprise && !otherQuote!.needsCrewSelection && <small>{messages.overview.perMonth}</small>}</strong>}</div></div>
    </div>}
    {activeRail === 'core' && <>
      <div className="mobile-plan-select"><label htmlFor="core-plan">Sundae Core · {copy.choose}</label><select id="core-plan" data-testid="mobile-core-plan" value={config.corePackage} onChange={(e) => state.setCorePackage(e.target.value as typeof config.corePackage)}>{CORE_PACKAGE_IDS.map((id) => <option key={id} value={id}>{localizeTierName(corePackages[id].name,locale)}</option>)}</select></div>
      <div className="plan-grid" aria-label={copy.choose}>
        {CORE_PACKAGE_IDS.map((id, i) => {
          const pkg = corePackages[id];
          const q = calculateBasketQuote({ ...config, layer:'core', crewSkus:[], employees:null, corePackage: id, addOns: [], watchtowerModules: [], crossIntelligence: 'none' });
          return <article key={id} data-testid={`card-${id}`} className={`plan-card ${config.corePackage === id ? 'is-selected' : ''}`}>
            <div className="plan-top"><span className="plan-kicker">{shapeLabels[i]}</span><span className="selection-mark" aria-hidden>{config.corePackage === id && <Check size={13}/>}</span></div>
            <h2>{localizeTierName(pkg.name, locale).replace(/^Core /,'')}</h2>
            <div className="plan-price">{q.averageMonthlyPerLocation !== null ? <AveragePrice amount={cardMoney(q.averageMonthlyPerLocation)} locations={config.locations}/> : <>{q.enterprise ? messages.overview.contactSales : cardMoney(q.monthly)}{!q.enterprise && <small>{messages.overview.perMonth}</small>}</>}</div>
            {q.averageMonthlyPerLocation !== null && <p className="plan-total">{messages.summary.monthlyInvestment} <bdi>{cardMoney(q.monthly)}</bdi>{messages.overview.perMonth}</p>}
            {discount.label && <p className="card-discount">{discount.label}</p>}
            <p className="plan-purpose">{buyerPlanCopy[locale].purposes[i]}</p>
            {i > 0 && <p className="plan-inheritance">{i === 3 ? reviewCopy.combinedPlus : reviewCopy.foundationPlus}</p>}
            <ul>{domains[i].map((domain) => <li key={domain}><Check size={13} aria-hidden/><FeatureLabel feature={domain} name={localizeModuleName(domain, locale)}/></li>)}{i === 3 && <li><Check size={13} aria-hidden/><FeatureLabel feature="foresight_action" name="Foresight & Action">{copy.foresight}</FeatureLabel></li>}</ul>
            <button type="button" className="plan-select" data-testid={`select-${id}`} aria-pressed={config.corePackage === id} aria-label={messages.overview.selectTier.replace('{tier}',localizeTierName(pkg.name,locale))} onClick={() => { if (!state.layer) state.setLayer('core'); state.setCorePackage(id); }}>{config.corePackage === id ? copy.selected : messages.overview.selectTier.replace('{tier}',localizeTierName(pkg.name,locale))}<ArrowRight size={15} aria-hidden/></button>
          </article>;
        })}
      </div>
      <CoreComparison/>
    </>}
    {activeRail === 'crew' && <section className="crew-plans"><div className="section-title"><h2>Sundae Crew</h2><p>{copy.crewHint}</p></div>
      <div className="mobile-plan-select"><label htmlFor="crew-plan">Sundae Crew · {copy.choose}</label><select id="crew-plan" data-testid="mobile-crew-plan" value={selectedPreset?.id ?? 'custom'} onChange={(e) => { const preset = CREW_PRESETS.find((p) => p.id === e.target.value); if (preset) state.setCrewSkus(preset.skus); }}><option value="custom" disabled>{copy.customCrew}</option>{CREW_PRESETS.map((p) => <option key={p.id} value={p.id} disabled={p.id === 'lite' && starterUnavailable}>{p.label}{p.id === 'lite' && starterUnavailable ? ` · ${starterUnavailableLabel}` : ''}</option>)}</select></div>
      {!selectedPreset && <p className="custom-crew-summary pricing-caption">{copy.customCrew}: {quote.crew?.lines.map((line) => line.label).join(' + ') || copy.chooseCrew}</p>}
      <div className="plan-grid">
        {CREW_PRESETS.map((preset) => {
          const active = preset.id === selectedPreset?.id;
          const disabled = preset.id === 'lite' && starterUnavailable;
          const q = disabled ? null : calculateBasketQuote({ ...config, layer: 'crew', addOns: [], watchtowerModules: [], crossIntelligence: 'none', crewSkus: preset.skus });
          return <article key={preset.id} data-testid={`card-${preset.id}`} className={`plan-card ${active ? 'is-selected' : ''} ${disabled ? 'is-unavailable' : ''}`}>
            <div className="plan-top"><span className="plan-kicker">{preset.id === 'lite' ? starterCapLabel : copy.crew}</span><span className="selection-mark" aria-hidden>{active && <Check size={13}/>}</span></div>
            <h2>{preset.label}</h2>{disabled ? <p className="plan-unavailable">{starterUnavailableLabel}</p> : <><div className="plan-price">{q!.averageMonthlyPerLocation !== null ? <AveragePrice amount={cardMoney(q!.averageMonthlyPerLocation)} locations={config.locations}/> : <>{q!.enterprise ? messages.overview.contactSales : cardMoney(q!.monthly)}{!q!.enterprise && <small>{messages.overview.perMonth}</small>}</>}</div>{q!.averageMonthlyPerLocation !== null && <p className="plan-total">{messages.summary.monthlyInvestment} <bdi>{cardMoney(q!.monthly)}</bdi>{messages.overview.perMonth}</p>}{discount.label && <p className="card-discount">{discount.label}</p>}{!q!.enterprise && <p className="card-caveat">{new Intl.NumberFormat(locale).format(q!.includedEmployees)} {copy.allowance} · {money(q!.employeeRate)} {copy.perEmployee}</p>}{config.employees === null && !quote.enterprise && <p className="card-caveat">{reviewCopy.addEmployees}</p>}</>}
            <ul>{preset.skus.filter((s) => !(s === 'crew_scheduling' && preset.skus.includes('crew_operations'))).map((s) => <li key={s}><Check size={13} aria-hidden/><FeatureLabel feature={s} name={crewSkus[s].name}/></li>)}</ul>
            <button type="button" className="plan-select" data-testid={`preset-${preset.id}`} disabled={disabled} aria-pressed={active} aria-label={messages.overview.selectTier.replace('{tier}',preset.label)} onClick={() => state.setCrewSkus(preset.skus)}>{disabled ? starterUnavailableLabel : active ? copy.selected : messages.overview.selectTier.replace('{tier}',preset.label)}{!disabled && <ArrowRight size={15} aria-hidden/>}</button>
          </article>;
        })}
      </div>
      <details className="pricing-disclosure"><summary>{copy.customCrew}<ChevronDown size={16} aria-hidden/></summary><div className="sku-options">{CREW_SKU_LIST.map((id) => <CrewOption key={id} id={id}/>)}</div>{discount.label && <p className="pricing-caption">{discount.label}</p>}</details>{quote.needsCrewSelection && <p role="status">{copy.chooseCrew}</p>}
    </section>}
    <p className="pricing-caption rounding-note">{copy.exclusions} · {copy.terms[INTENT_TERMS.indexOf(config.billingCycle)]}</p>
    {!quote.enterprise && <p className="pricing-caption rounding-note">{reviewCopy.rounding}</p>}
    <p className="selection-memory pricing-caption">{reviewCopy.saved}</p>
    <SetupGuide/>
    {quote.enterprise && <EnterprisePanel/>}
  </>;
}

export function RefineNeeds() {
  const { state, config, quote, live } = useBuyerQuote();
  const { copy, messages, locale, reviewCopy, journey } = useBuyerFormatting();
  const discount = useBuyerDiscount();
  const suggestions = recommendedConceptSkus(config.operatingModels);
  // Preserve imported/user-selected extensions even when the model changes.
  const extensionIds = [...new Set([...suggestions, ...config.addOns.filter((id) => id !== 'foresight_action')])];
  const modelLabel = (id: typeof INTENT_MODELS[number]) => id === 'franchise' ? journey.franchiseLabel : copy.models[INTENT_MODELS.indexOf(id)];
  const modelHelp = (id: typeof INTENT_MODELS[number]) => {
    if (id === 'single_brand') return journey.singleHelp;
    if (id === 'multi_brand') return journey.multiHelp;
    if (id === 'franchise') return journey.franchiseHelp;
    const feature = recommendedConceptSkus([id])[0];
    return extraFeatureHelp(feature, locale) ?? englishFeatureHelp[feature];
  };
  const selectModel = (id: typeof INTENT_MODELS[number]) => {
    const selected = config.operatingModels.includes(id);
    const other = id === 'single_brand' ? 'multi_brand' : id === 'multi_brand' ? 'single_brand' : null;
    const models = selected ? config.operatingModels.filter(m => m !== id) : [...config.operatingModels.filter(m => m !== other), id];
    state.setDiscoveryAnswers(models, state.techStack);
  };
  return <div className="refinement-layout">
    <div className="refinement-fields">{config.layer !== 'crew' && <section className="refine-panel"><h2>{copy.business}</h2><p>{journey.selectionNote}</p><div className="model-options" role="group" aria-label={copy.business}>{INTENT_MODELS.map((id) => { const Icon = OPERATING_MODEL_ICONS[id]; const selected = config.operatingModels.includes(id); return <div className={`model-choice ${selected ? 'is-selected' : ''}`} key={id}><button type="button" data-testid={`business-model-${id}`} aria-pressed={selected} onClick={() => selectModel(id)}><span className="model-icon" aria-hidden><Icon size={22} strokeWidth={1.6}/></span><span className="model-label">{modelLabel(id)}</span><span className="model-check" aria-hidden>{selected && <Check size={13}/>}</span></button><TextHelp helpId={`model-${id}`} name={modelLabel(id)} description={modelHelp(id)}/></div>; })}</div></section>}
    {config.layer !== 'crew' && <section className="refine-panel"><h2>{copy.specialists}</h2>
      {suggestions.map((id) => <ExtensionToggle key={id} feature={id} name={conceptSkus[id].name} price={calculateBandedTotal(conceptSkus[id], config.locations)} checked required onChange={() => undefined}/>)}
      {suggestions.length > 0 && <p className="pricing-caption">{journey.coverage}</p>}
      {config.operatingModels.some((id) => ['catering','production'].includes(id)) && <p>{copy.specialist}</p>}
      {corePackages[config.corePackage].includesForesight && <p className="included-note"><Check size={16}/><FeatureLabel feature="foresight_action" name="Foresight & Action">{copy.foresight}</FeatureLabel></p>}
      <details className="pricing-disclosure optional-upgrades"><summary>{copy.available}<ChevronDown size={16} aria-hidden/></summary>
      {!corePackages[config.corePackage].includesForesight ? <ExtensionToggle feature="foresight_action" name="Foresight & Action" price={calculateBandedTotal(foresightAction, config.locations)} checked={config.addOns.includes('foresight_action')} onChange={() => state.toggleAddOn('foresight_action')}/> : null}
      {extensionIds.filter(id => !suggestions.includes(id as never)).map((id) => <ExtensionToggle key={id} feature={id} name={conceptSkus[id].name} price={calculateBandedTotal(conceptSkus[id],config.locations)} checked={config.addOns.includes(id)} onChange={() => state.toggleAddOn(id)}/>)}
      {packageAllowsWatchtower(config.corePackage) && <ExtensionToggle feature="bundle" name={copy.watchtower} price={calculateWatchtowerPrice(['bundle'],config.locations).total} checked={config.watchtowerModules.includes('bundle')} onChange={() => state.setWatchtowerModules(config.watchtowerModules.includes('bundle') ? [] : ['bundle'])}/>}
      {packageAllowsWatchtower(config.corePackage) && <details className="pricing-disclosure"><summary>Watchtower<ChevronDown size={16}/></summary>{(['competitive','events','trends'] as const).map((id) => <ExtensionToggle key={id} feature={id} name={localizeWatchtowerName(id, locale)} price={calculateWatchtowerPrice([id],config.locations).total} checked={config.watchtowerModules.includes(id) || config.watchtowerModules.includes('bundle')} onChange={() => state.setWatchtowerModules(config.watchtowerModules.includes('bundle') ? ['competitive','events','trends'].filter((m) => m !== id) : config.watchtowerModules.includes(id) ? config.watchtowerModules.filter((m) => m !== id) : [...config.watchtowerModules,id])}/>)}</details>}
      {!packageAllowsWatchtower(config.corePackage) && <p className="availability-note">{reviewCopy.watchtowerAvailability}</p>}
      <details className="pricing-disclosure"><summary>{messages.summary.crossIntelligencePro}<ChevronDown size={16}/></summary><ExtensionToggle feature="cross_pro" name={messages.summary.crossIntelligencePro} price={calculateCrossIntelligencePrice('pro',config.locations,config.corePackage)} checked={config.crossIntelligence === 'pro'} onChange={() => state.setCrossIntelligence(config.crossIntelligence === 'pro' ? 'none' : 'pro')}/></details>
      </details>
    </section>}
    {config.layer !== 'core' && <section className="refine-panel"><h2>{copy.crew}</h2><label className="field-label" htmlFor="buyer-employees">{copy.workforce}</label><input id="buyer-employees" type="number" min={0} max={MAX_EMPLOYEE_COUNT} value={config.employees ?? ''} onChange={(e) => state.setEmployees(e.target.value === '' ? null : Number(e.target.value))}/><p>{copy.workforceHint}</p>
      {config.crewSkus.includes('crew_payroll') && <><label className="field-label" htmlFor="payroll-country">{copy.payroll}</label><select id="payroll-country" value={config.payrollCountry} onChange={(e) => state.setPayrollCountry(e.target.value)}><option value="">{copy.countryPlaceholder}</option>{getPayrollCountryOptions(locale).map((country) => <option key={country.code} value={country.code}>{country.label}{country.supported ? '' : ` · ${reviewCopy.payrollAvailability}`}</option>)}</select><p>{copy.payrollNote}</p></>}
    </section>}
    <details className="refine-panel pricing-disclosure commitment-panel" data-testid="commitment-details">
      <summary><span><span className="commitment-title">{copy.commitment}</span><small data-testid="selected-term">{copy.terms[INTENT_TERMS.indexOf(config.billingCycle)]}</small>{discount.label && <small className="commitment-discount">{discount.label}</small>}</span><ChevronDown size={18} aria-hidden/></summary>
      <div className="term-options" role="group" aria-label={copy.commitment}>{INTENT_TERMS.map((id, i) => <button type="button" key={id} data-testid={`payment-term-${id}`} aria-pressed={config.billingCycle === id} onClick={() => state.setBillingCycle(id)}><span>{copy.terms[i]}</span><strong>{quote.enterprise ? copy.scoped : billingDiscounts[id] > 0 ? `−${new Intl.NumberFormat(locale).format(billingDiscounts[id])}%` : '—'}</strong></button>)}</div>
    </details>
    </div><aside className="quote-aside"><BasketSummary compact/><SetupGuide compact/>{quote.enterprise && <EnterprisePanel/>}{live.catalog && <div className="pricing-notes"><p>{copy.intentNote}</p></div>}</aside>
  </div>;
}
function ExtensionToggle({ name, feature, price, checked, required = false, onChange }: { name: string; feature: FeatureHelpId; price: number; checked: boolean; required?: boolean; onChange: () => void }) {
  const { money, messages, copy, journey } = useBuyerFormatting();
  const { quote } = useBuyerQuote();
  const discount = useBuyerDiscount();
  const inputId = useId();
  return <div className={`extension-toggle ${required ? 'is-required' : ''}`}><input id={inputId} type="checkbox" aria-describedby={`${inputId}-price${discount.label ? ` ${inputId}-discount` : ''}`} checked={checked} disabled={required} onChange={onChange}/><div className="extension-name"><label htmlFor={inputId}>{name}{required && <small className="extension-linked">{journey.linked}</small>}{discount.label && <small id={`${inputId}-discount`} className="extension-discount">{discount.label}</small>}</label><FeatureHelp feature={feature} name={name}/></div><strong id={`${inputId}-price`} className={quote.enterprise ? 'is-scoped' : undefined}>{quote.enterprise ? copy.scoped : <>+{money(discount.net(price))}<small>{messages.overview.perMonth}</small></>}</strong></div>;
}
function CrewOption({ id }: { id: typeof CREW_SKU_LIST[number] }) {
  const { config, state, quote } = useBuyerQuote();
  const { money, copy, messages } = useBuyerFormatting();
  const discount = useBuyerDiscount();
  const inputId = useId();
  const unavailable = crewSkus[id].caps.maxLocations !== null && config.locations > crewSkus[id].caps.maxLocations!;
  const included = id === 'crew_scheduling' && config.crewSkus.includes('crew_operations');
  return <div className="crew-option"><input id={inputId} type="checkbox" aria-describedby={`${inputId}-price`} checked={config.crewSkus.includes(id)} disabled={included || unavailable} onChange={() => state.toggleCrewSku(id)}/><label htmlFor={inputId}>{crewSkus[id].name}</label><FeatureHelp feature={id} name={crewSkus[id].name}/><small id={`${inputId}-price`}>{included ? copy.included : unavailable ? copy.scoped : quote.enterprise ? copy.scoped : <>{money(discount.net(calculateBandedTotal(crewSkus[id], config.locations)))}{messages.overview.perMonth}</>}</small></div>;
}
export function EnterprisePanel() {
  const { copy, messages, locale, reviewCopy } = useBuyerFormatting();
  const { config, quote } = useBuyerQuote();
  if(quote.needsCrewSelection) return null;
  const body = quote.employeeLimitExceeded
    ? fillBuyerReviewCopy(reviewCopy.largeWorkforce, { count: new Intl.NumberFormat(locale).format(SELF_SERVE_EMPLOYEE_LIMIT) })
    : copy.enterpriseBody;
  return <div className="enterprise-panel"><div><h2>{copy.enterprise}</h2><p>{body}</p></div><a className="pricing-primary" href={demoUrl(config,locale)} onClick={() => trackPricingEvent('proposal_clicked')}>{messages.overview.contactSales}<ArrowRight size={16}/></a></div>;
}
export function BasketSummary({ compact = false }: { compact?: boolean }) {
  const { quote, config, live } = useBuyerQuote();
  const { money, copy, messages, locale } = useBuyerFormatting();
  if (quote.needsCrewSelection) return <p role="status">{copy.chooseCrew}</p>;
  return <div className={`basket-summary ${compact ? 'is-compact' : ''}`}>
    <p className="plan-kicker">{quote.averageMonthlyPerLocation !== null ? config.layer === 'both' ? 'Core + Crew' : config.layer === 'core' ? 'Sundae Core' : 'Sundae Crew' : messages.summary.monthlyInvestment} · {config.locations} {copy.bands.toLowerCase()}</p>
    {quote.averageMonthlyPerLocation !== null && <AveragePrice amount={money(quote.averageMonthlyPerLocation)} locations={config.locations} testId="basket-average"/>}
    <div className={quote.averageMonthlyPerLocation !== null ? 'basket-total-row' : ''}>
      {quote.averageMonthlyPerLocation !== null && <span>{messages.summary.monthlyInvestment}</span>}
      <div className={`basket-price ${quote.averageMonthlyPerLocation !== null ? 'is-secondary' : ''}`} data-testid="basket-total" aria-live="polite" aria-atomic="true">{quote.enterprise ? messages.overview.contactSales : <>{money(quote.monthly)}<small>{messages.overview.perMonth}</small></>}</div>
    </div>
    <p className="pricing-caption">{copy.exclusions}</p>
    <div className="basket-lines">{quote.lines.map((line, i) => <div key={`${line.item}-${i}`}><span>{localizeBreakdownLabel(line.item,locale)}</span><strong>{quote.enterprise ? copy.scoped : money(line.price)}</strong></div>)}
      {quote.discounts.filter((d) => d.amount < 0 && !quote.enterprise).map((d) => <div key={d.name} className="discount-line"><span>{localizeDiscountLine(d,locale,config.locations)}</span><strong>{money(d.amount)}</strong></div>)}
      {!quote.enterprise && quote.employeeOverage > 0 && <div><span>{copy.overage}</span><strong>{money(quote.employeeOverage)}</strong></div>}
    </div>
    {!quote.enterprise && <div className="payment-line"><span>{copy.payment}<small>{copy.terms[INTENT_TERMS.indexOf(config.billingCycle)]}</small></span><strong>{money(quote.paymentAmount)}</strong></div>}
    <div className="setup-line"><span>{copy.setup}</span><strong>{quote.enterprise || quote.implementation.requiresScoping ? copy.scoped : `${quote.implementation.isFloor ? '≥ ' : ''}${money(quote.implementation.fee)}`}</strong></div>
    {(quote.crew || quote.specialistScoping) && <ul className="scope-notes pricing-caption">
      {quote.crew && config.employees !== null && <li>{copy.workforce}: {config.employees}</li>}
      {quote.crew && <li>{quote.enterprise ? <>{copy.overage}: {copy.scoped}</> : <>{quote.includedEmployees} {copy.allowance} · {money(quote.employeeRate)} {copy.perEmployee}</>}</li>}
      {quote.crew && !quote.enterprise && <li>{quote.workforceUnknown ? copy.workforceUnknown : copy.overageNote}</li>}
      {quote.payrollNeedsScoping && <li>{copy.payrollNote} {config.payrollCountry ? formatPayrollCountry(config.payrollCountry, locale) : copy.scoped}</li>}
      {quote.specialistScoping && <li>{copy.specialist}</li>}
    </ul>}
    <p className="catalogue-stamp">{live.catalog ? `${messages.summary.pricingEffective} ${new Date(live.catalog.effectiveDate).toLocaleDateString(locale)}` : copy.intentNote}</p>
  </div>;
}

export function PriceDetails() {
  const { config, quote, live } = useBuyerQuote();
  const { copy, money, messages, locale } = useBuyerFormatting();
  const policy = pricingPolicyCopy[locale];
  const banded = [ ...(config.layer !== 'crew' ? [corePackages[config.corePackage], ...config.addOns.filter((id) => !(id === 'foresight_action' && quote.includedForesight)).map((id) => id === 'foresight_action' ? foresightAction : conceptSkus[id])] : []),
    ...(quote.crew?.lines.map((line) => line.id in crewSkus ? crewSkus[line.id as keyof typeof crewSkus] : crewBundles[line.id as keyof typeof crewBundles]).filter((s) => s !== null) ?? []) ];
  if(quote.enterprise || quote.needsCrewSelection) return null;
  return <details className="pricing-disclosure price-details"><summary>{copy.details}<ChevronDown size={16} aria-hidden/></summary><p>{messages.summary.locationPricingNote}</p>
    <div className="calculation-grid">
    {banded.map((sku) => <section key={sku.id} className="band-detail"><h3>{localizeBreakdownLabel(sku.name,locale)}</h3><div className="band-line"><span>{copy.anchor}</span><strong>{money(sku.firstUnitPrice)}</strong></div>{calculateBandLines(sku,config.locations).map((line) => <div className="band-line" key={line.band.fromUnit}><span>{new Intl.NumberFormat(locale).format(line.units)} × {money(line.band.pricePerUnit)}</span><strong>{money(line.subtotal)}</strong></div>)}
      <div className="band-line calculation-total"><span>{messages.summary.monthlyInvestment}</span><strong>{money(calculateBandedTotal(sku,config.locations))}</strong></div>
      <details><summary>{copy.schedule}</summary>{sku.marginalBands.map((b) => <div className="band-line" key={b.fromUnit}><span>{copy.bands} {b.fromUnit}–{b.toUnit ?? '∞'}</span><span>{money(b.pricePerUnit)}</span></div>)}</details></section>)}
    {quote.core && calculateWatchtowerPrice(config.watchtowerModules,config.locations).modules.map((m) => <section key={m.id} className="band-detail"><h3>{localizeWatchtowerName(m.id,locale)}</h3><div className="band-line"><span>{money(m.basePrice)} + {Math.max(0,config.locations - (watchtower[m.id].includedLocations ?? 1))} × {money(watchtower[m.id].perLocationPrice)}</span><strong>{money(m.totalPrice)}</strong></div></section>)}
    {quote.core && config.crossIntelligence === 'pro' && <section className="band-detail"><h3>{messages.summary.crossIntelligencePro}</h3><div className="band-line"><span>{money(calculateCrossIntelligencePrice('pro',crossIntelligence.pro.includedLocations,config.corePackage))} + {Math.max(0,config.locations - crossIntelligence.pro.includedLocations)} × {money(crossIntelligence.pro.perLocationPrice)}</span><strong>{money(calculateCrossIntelligencePrice('pro',config.locations,config.corePackage))}</strong></div></section>}
    </div>
    <div className="calculation-policies"><details className="pricing-disclosure"><summary>{copy.commitment}<ChevronDown size={16} aria-hidden/></summary><p>{policy.discount.replace('{cap}',String(DISCOUNT_RULES.maxDiscountPercent))}</p><div className="policy-grid"><div>{INTENT_TERMS.map((id,i) => <div className="band-line" key={id}><span>{copy.terms[i]}</span><strong>{billingDiscounts[id]}%</strong></div>)}</div><div>{volumeDiscounts.tiers.filter((t) => !t.enterpriseOnly).map((t) => <div className="band-line" key={t.min}><span>{copy.bands} {t.min}–{t.max}</span><strong>{t.percent}%</strong></div>)}</div></div></details>
    <details className="pricing-disclosure"><summary>{copy.setup}<ChevronDown size={16} aria-hidden/></summary><p>{policy.setup}</p>{(!live.catalog || live.policyCoverage?.implementation) && IMPLEMENTATION_CLASS_ORDER.map((id,i) => <div className="band-line" key={id}><span>{policy.classes[i].replace(/^[A-D]\s*[·-]\s*/, '')}</span><strong>{implementationClasses[id].isFloor ? '≥ ' : ''}{money(implementationClasses[id].fee)}</strong></div>)}<p>{copy.scoped}</p></details></div>
    {quote.core && <div className="allowance-details"><p>{messages.overview.aiCredits}: {calculateAiCredits(corePackages[config.corePackage],config.locations).toLocaleString(locale)}</p><p>{messages.overview.intelligenceSeats}: {calculateIntelligenceSeats(corePackages[config.corePackage],config.locations)}</p></div>}
  </details>;
}
export function QuoteReview() {
  const { config, quote, live } = useBuyerQuote();
  const { copy, messages, locale } = useBuyerFormatting();
  const [status, setStatus] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [showRoi, setShowRoi] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const roiDisclosure = useRef<HTMLDetailsElement>(null);
  usePricingViewEvent('quote_reviewed', { layer: config.layer, locations: config.locations, monthly: quote.monthly }, !quote.needsCrewSelection);
  if (quote.needsCrewSelection) return <PlanChoices/>;
  const url = new URL('/simulator',window.location.origin); url.searchParams.set('lang',locale); url.searchParams.set('cfg',encodePricingIntent(config));
  const share = async () => {
    trackPricingEvent('share_clicked');
    try { await navigator.clipboard.writeText(url.toString()); setShareLink(''); setStatus(copy.copied); trackPricingEvent('share_copied'); } catch { trackPricingEvent('share_fallback'); setShareLink(url.toString()); setStatus(copy.shareError); }
  };
  const download = async () => {
    setDownloading(true); setStatus(''); trackPricingEvent('pdf_clicked');
    try { await downloadBasketPDF(config,quote,url.toString(),live.catalog?.effectiveDate,locale); trackPricingEvent('pdf_downloaded'); } catch { setStatus(copy.pdfError); trackPricingEvent('pdf_failed'); } finally { setDownloading(false); }
  };
  const appUrl = new URL('https://sundae.io/sign-in');
  appUrl.searchParams.set('returnUrl',`/onboarding?lang=${locale}&cfg=${encodePricingIntent(config)}`);
  return <><div className="review-layout"><BasketSummary/><div className="next-step-panel"><p className="plan-kicker">Sundae</p><h2>{copy.next}</h2><p>{copy.nextHint}</p>
    <a className="pricing-primary" href={demoUrl(config,locale)} onClick={() => trackPricingEvent('demo_clicked')}>{quote.enterprise ? messages.overview.contactSales : messages.header.bookDemo}<ArrowRight size={16}/></a>
    {!quote.enterprise && <a className="pricing-secondary" href={appUrl.toString()} onClick={() => trackPricingEvent('onboarding_clicked')}>{copy.continue}<ArrowRight size={16}/></a>}
    <div className="quote-utilities"><button type="button" onClick={share}><LinkIcon size={16}/>{copy.share}</button><button type="button" disabled={downloading} onClick={download}><Download size={16}/>{downloading ? messages.pdf.generating : getEstimatePrintLabel(locale)}</button></div>
    <p role="status">{status}</p>{shareLink && <input aria-label={copy.shareError} readOnly value={shareLink} onFocus={(e) => e.target.select()}/>}<p className="pricing-caption">{copy.intentNote}</p>
    </div></div><SetupGuide compact/><PriceDetails/>{quote.enterprise && <EnterprisePanel/>}
    {config.layer !== 'crew' && !quote.enterprise && <details ref={roiDisclosure} className="pricing-disclosure" onToggle={(e) => setShowRoi(e.currentTarget.open)}><summary><span>{copy.roi}<small>{copy.roiHint}</small></span><SlidersHorizontal size={16}/></summary>{showRoi && <Suspense fallback={<p>{messages.pdf.generating}</p>}><ROISimulator onBack={() => { if (roiDisclosure.current) roiDisclosure.current.open = false; setShowRoi(false); roiDisclosure.current?.querySelector('summary')?.focus(); }}/></Suspense>}</details>}
  </>;
}
