import { useEffect, useId, useState } from 'react';
import { ChevronDown, Info, SlidersHorizontal } from 'lucide-react';
import { useConfiguration } from '../../hooks/useConfiguration';
import { useBuyerQuote } from '../../hooks/useBuyerQuote';
import { useROICalculation, clampMonthlyRevenue, MIN_MONTHLY_REVENUE_PER_LOCATION, MAX_MONTHLY_REVENUE_PER_LOCATION, REVENUE_SLIDER_STEP, type SavingsLineItem } from '../../hooks/useROICalculation';
import { useLocale } from '../../contexts/LocaleContext';
import { getRoiEconomicsCopy } from '../../lib/roiEconomicsCopy';
import { getRoiPresentationCopy } from '../../lib/roiPresentationCopy';
import { formatMessage, getRoiCopy } from '../../lib/pricingUiCopy';
import { getQuoteSummaryCopy } from '../../lib/quoteSummaryCopy';
import { corePackages } from '../../data/pricing';

/** Results remain visible; assumptions and methodology expand independently. */
export function ROISimulator() {
  const { locale } = useLocale();
  const copy = getRoiCopy(locale);
  const ui = getRoiPresentationCopy(locale);
  const economicsCopy = getRoiEconomicsCopy(locale);
  const q = getQuoteSummaryCopy(locale);
  const { layer, corePackage, locations, watchtowerModules, roiInputs, setROIInputs } = useConfiguration();
  const { quote: pricing } = useBuyerQuote();
  const headingId = useId();
  const money = (amount: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
  const activeDomains = (corePackages[corePackage]?.includesDomainModules ?? []) as readonly string[];
  const implementationCost = pricing.implementation.requiresScoping || pricing.implementation.isFloor ? null : pricing.implementation.fee;
  const roi = useROICalculation(
    { layer: layer === 'core' || layer === 'both' ? 'core' : null, corePackage, locations, activeDomains: [...activeDomains], watchtowerModules },
    roiInputs,
    pricing.monthly,
    implementationCost,
  );
  const paybackText = roi.monthlyNetBenefit <= 0 ? copy.noPaybackAtTheseInputs
    : roi.paybackDays === null ? economicsCopy.unknownSetup
      : roi.paybackDays === 0 ? economicsCopy.immediate
        : formatMessage(copy.days, { count: roi.paybackDays.toLocaleString(locale) });
  const recoveryExplanation = roi.paysBack && implementationCost !== null && implementationCost > 0 && roi.paybackDays !== null
    ? formatMessage(economicsCopy.recoveryExplanation, { net: money(roi.monthlyNetBenefit), fee: money(implementationCost), days: roi.paybackDays.toLocaleString(locale) }) : null;
  const revenue = clampMonthlyRevenue(roiInputs.monthlyRevenue);
  useEffect(() => {
    if (roiInputs.monthlyRevenue !== revenue) setROIInputs({ monthlyRevenue: revenue });
  }, [roiInputs.monthlyRevenue, revenue, setROIInputs]);
  const signedMoney = (amount: number) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: amount % 1 ? 2 : 0, signDisplay: amount > 0 ? 'always' : 'auto' }).format(amount);
  const state = roi.monthlyNetBenefit > 0 ? 'positive' : 'shortfall';

  return <section id="estimated-returns" tabIndex={-1} className="roi-workspace" aria-labelledby={headingId} data-testid="roi-workspace">
    <div className="roi-heading">
      <div><p className="roi-eyebrow">{q.modelledHeading}</p><h2 id={headingId}>{ui.title}</h2><p>{ui.hint}</p></div>
      <a className="roi-adjust-link" href={`#${headingId}-assumptions`} onClick={(event) => {
        event.preventDefault();
        const details = document.getElementById(`${headingId}-assumptions`) as HTMLDetailsElement | null;
        if (details) { details.open = true; details.querySelector('summary')?.focus(); details.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' }); }
      }}><SlidersHorizontal size={16} aria-hidden/>{ui.adjust}</a>
    </div>

    <dl className="roi-metrics" data-testid="roi-metrics">
      <div><dt>{ui.monthlyBenefit}</dt><dd data-testid="roi-monthly-funding">{money(roi.monthlyFunding)}</dd></div>
      <div data-state={state}><dt>{copy.netMonthlyBenefit}</dt><dd data-testid="roi-monthly-net">{signedMoney(roi.monthlyNetBenefit)}</dd></div>
      <div><dt>{economicsCopy.paybackLabel}</dt><dd className="roi-payback-value" data-testid="roi-payback">{paybackText}</dd></div>
      <div data-state={roi.firstYearNetBenefit !== null && roi.firstYearNetBenefit > 0 ? 'positive' : 'neutral'}><dt>{economicsCopy.firstYearNetLabel}</dt><dd data-testid="roi-first-year-net">{roi.firstYearNetBenefit === null ? '—' : money(roi.firstYearNetBenefit)}</dd></div>
    </dl>
    <p className="roi-equation"><span>{ui.monthlyBenefit}: <bdi>{money(roi.monthlyFunding)}</bdi></span><span aria-hidden>−</span><span>{copy.monthlyPlatformCost}: <bdi>{money(pricing.monthly)}</bdi></span><span aria-hidden>=</span><strong>{copy.netMonthlyBenefit}: <bdi>{signedMoney(roi.monthlyNetBenefit)}</bdi></strong></p>
    {recoveryExplanation && <p className="roi-recovery-note" data-testid="roi-recovery-explanation">{recoveryExplanation}</p>}
    {roi.monthlyNetBenefit <= 0 && <p className="roi-shortfall-note">{copy.roiDescriptions.longTerm}</p>}

    <details className="roi-disclosure roi-assumptions" id={`${headingId}-assumptions`} data-testid="roi-assumptions">
      <summary><span><SlidersHorizontal size={16} aria-hidden/>{ui.adjust}</span><ChevronDown size={16} aria-hidden/></summary>
      <div className="roi-input-grid">
        <RangeField label={copy.monthlyRevenuePerLocation} min={MIN_MONTHLY_REVENUE_PER_LOCATION} max={MAX_MONTHLY_REVENUE_PER_LOCATION} step={REVENUE_SLIDER_STEP} value={revenue} display={money(revenue)} onChange={value => setROIInputs({ monthlyRevenue: value })}/>
        {activeDomains.includes('labor') && <RangeField label={copy.currentLaborCost} min={20} max={40} value={roiInputs.laborPercent} display={`${roiInputs.laborPercent.toLocaleString(locale)}%`} onChange={value => setROIInputs({ laborPercent: value })}/>}
        {(activeDomains.includes('inventory') || activeDomains.includes('purchasing')) && <RangeField label={copy.currentFoodCost} min={20} max={40} value={roiInputs.foodCostPercent} display={`${roiInputs.foodCostPercent.toLocaleString(locale)}%`} onChange={value => setROIInputs({ foodCostPercent: value })}/>}
        {activeDomains.includes('marketing') && <RangeField label={copy.monthlyMarketingSpend} min={0} max={10000} step={500} value={roiInputs.marketingSpend || 0} display={money(roiInputs.marketingSpend || 0)} onChange={value => setROIInputs({ marketingSpend: value })}/>}
        {activeDomains.includes('delivery') && <RangeField label={copy.deliveryRevenuePct} min={0} max={50} step={5} value={roiInputs.deliveryRevenuePct || 0} display={`${(roiInputs.deliveryRevenuePct || 0).toLocaleString(locale)}%`} onChange={value => setROIInputs({ deliveryRevenuePct: value })}/>}
        {activeDomains.includes('guest') && <div className="roi-toggle-field"><span>{copy.reviewData}</span><button type="button" aria-pressed={Boolean(roiInputs.hasReviewData)} onClick={() => setROIInputs({ hasReviewData: !roiInputs.hasReviewData })}>{roiInputs.hasReviewData ? copy.yes : copy.no}</button></div>}
      </div>
      <details className="roi-disclosure roi-extra-inputs">
        <summary><span>{ui.cashTitle}</span><ChevronDown size={16} aria-hidden/></summary>
        <p>{ui.cashNote}</p>
        <div className="roi-input-grid">
          <NumberField label={ui.tools} value={roiInputs.replaceableSystemsSpend || 0} step={100} onChange={value => setROIInputs({ replaceableSystemsSpend: value })}/>
        </div>
      </details>
      <details className="roi-disclosure roi-extra-inputs">
        <summary><span>{ui.capacity}</span><ChevronDown size={16} aria-hidden/></summary>
        <p>{ui.capacityNote}</p>
        <div className="roi-input-grid">
          <NumberField label={ui.hours} value={roiInputs.manualReportingHoursPerWeek || 0} step={1} onChange={value => setROIInputs({ manualReportingHoursPerWeek: value })}/>
          <NumberField label={ui.rate} value={roiInputs.loadedHourlyRate || 0} step={5} onChange={value => setROIInputs({ loadedHourlyRate: value })}/>
        </div>
        <p>{ui.capacity}: <bdi>{money(roi.capacityValue)}{copy.perMonthShort}</bdi>. {ui.capacityNote}</p>
      </details>
    </details>

    <details className="roi-disclosure" data-testid="roi-breakdown">
      <summary><span>{copy.savingsBreakdown}</span><ChevronDown size={16} aria-hidden/></summary>
      <div className="roi-savings-list">{roi.savingsLines.map(line => <SavingsLine key={line.moduleId} line={line} money={money} rangeLabel={copy.rangeLabel} perMonth={copy.perMonthShort}/>)}</div>
      {roi.replaceableSystemsSavings > 0 && <p className="roi-avoided-cost">{ui.cashTitle}: <bdi>{money(roi.replaceableSystemsSavings)}{copy.perMonthShort}</bdi></p>}
      <p>{copy.savingsNote}</p>
    </details>

    <details className="roi-disclosure" data-testid="roi-methodology">
      <summary><span>{ui.method}</span><ChevronDown size={16} aria-hidden/></summary>
      <p>{economicsCopy.scopeNote}</p><p>{economicsCopy.methodNote}</p>
      <p className="roi-formula">{economicsCopy.paybackLabel} = {economicsCopy.implementationLabel} ÷ {copy.netMonthlyBenefit} × (365 ÷ 12)</p>
      <dl className="roi-method-values">
        <div><dt>{economicsCopy.implementationLabel}</dt><dd data-testid="roi-implementation">{implementationCost === null ? economicsCopy.unknownSetup : money(implementationCost)}</dd></div>
        <div><dt>{copy.annualSavings}</dt><dd>{money(roi.annualFunding)}</dd></div>
        <div><dt>{economicsCopy.coverageLabel}</dt><dd>{roi.roi.toLocaleString(locale)}x{roi.roiCapped ? '+' : ''}</dd></div>
        <div><dt>{ui.operatingSavings}</dt><dd>{money(roi.monthlySavings)}{copy.perMonthShort}</dd></div>
        <div><dt>{ui.cashTitle}</dt><dd>{money(roi.replaceableSystemsSavings)}{copy.perMonthShort}</dd></div>
        <div><dt>{ui.capacity}</dt><dd>{money(roi.capacityValue)}{copy.perMonthShort}</dd></div>
      </dl>
      <p>{ui.capacityNote}</p><p>{q.modelledNote}</p>
    </details>
  </section>;
}

function RangeField({ label, min, max, step = 1, value, display, onChange }: { label: string; min: number; max: number; step?: number; value: number; display: string; onChange: (value: number) => void }) {
  const id = useId();
  const progress = Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
  return <div className="roi-range-field"><div><label htmlFor={id}>{label}</label><output htmlFor={id}>{display}</output></div><input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={display} onChange={event => onChange(Number(event.target.value))} style={{ '--roi-progress': `${progress}%` } as React.CSSProperties}/></div>;
}
function NumberField({ label, value, step, onChange }: { label: string; value: number; step: number; onChange: (value: number) => void }) {
  const id = useId();
  return <div className="roi-number-field"><label htmlFor={id}>{label}</label><input id={id} type="number" min={0} step={step} value={value} onChange={event => onChange(Math.max(0, Number(event.target.value)))}/></div>;
}
function SavingsLine({ line, money, rangeLabel, perMonth }: { line: SavingsLineItem; money: (value: number) => string; rangeLabel: string; perMonth: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="roi-saving-line"><div><button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={id}><span>{line.label}</span><Info size={15} aria-hidden/></button><strong>{line.isCountedInTotal ? <>{money(line.amount)}<small>{perMonth}</small></> : <span>{line.missingInputMessage || '—'}</span>}</strong></div>{open && <div id={id} className="roi-line-explanation"><p>{line.tooltip}</p><p>{rangeLabel}: <bdi>{money(line.rangeMin)} – {money(line.rangeMax)}{perMonth}</bdi></p></div>}</div>;
}
