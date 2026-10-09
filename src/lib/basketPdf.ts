import type { PricingIntent } from './pricingIntent';
import { INTENT_TERMS } from './pricingIntent';
import type { BasketQuote } from './basketQuote';
import { getBuyerCopy, formatLocationAverage } from './buyerCopy';
import { getBuyerJourneyCopy } from './buyerJourneyCopy';
import { resolveMessages } from '../contexts/LocaleContext';
import { localeDirection, type PricingLocale } from './locales';
import { localizeBreakdownLabel } from './pricingI18n';
import { localizeDiscountLine } from './quoteSummaryCopy';

const printLabels: Record<PricingLocale, string> = {
  en:'Print / save PDF',ar:'طباعة / حفظ PDF',fr:'Imprimer / enregistrer en PDF',es:'Imprimir / guardar PDF',de:'Drucken / als PDF speichern',nl:'Afdrukken / PDF opslaan',pt:'Imprimir / guardar PDF',hi:'प्रिंट / PDF सहेजें',ur:'پرنٹ / PDF محفوظ کریں',it:'Stampa / salva PDF',pl:'Drukuj / zapisz PDF',tr:'Yazdır / PDF kaydet','zh-Hans':'打印 / 保存 PDF',ja:'印刷 / PDF保存',ko:'인쇄 / PDF 저장',id:'Cetak / simpan PDF',vi:'In / lưu PDF',ro:'Tipăriți / salvați PDF',sv:'Skriv ut / spara PDF',bn:'প্রিন্ট / PDF সংরক্ষণ',th:'พิมพ์ / บันทึก PDF',ms:'Cetak / simpan PDF',az:'Çap et / PDF saxla',ru:'Печать / сохранить PDF',pap:'Print / warda PDF',
};
export function getEstimatePrintLabel(locale: PricingLocale) { return printLabels[locale]; }
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

/** Native browser PDF preserves selectable text, complex scripts and RTL shaping.
 * The document uses the same reviewed basket and locale as the screen. */
export function buildBasketPrintHTML(config: PricingIntent, quote: BasketQuote, shareUrl: string, locale: PricingLocale, effectiveDate?: string) {
  if (quote.needsCrewSelection) throw new Error('Select a Crew plan before exporting.');
  const copy = getBuyerCopy(locale);
  const journey = getBuyerJourneyCopy(locale);
  const messages = resolveMessages(locale);
  const money = (n: number) => escape(new Intl.NumberFormat(locale, { style:'currency', currency:'USD', maximumFractionDigits:2 }).format(n));
  const number = (n: number) => new Intl.NumberFormat(locale).format(n);
  const row = (label: string, value: string, discount = false) => `<tr${discount ? ' class="saving"' : ''}><th scope="row">${escape(label)}</th><td><bdi>${value}</bdi></td></tr>`;
  const term = copy.terms[INTENT_TERMS.indexOf(config.billingCycle)];
  const notes = [term, copy.exclusions];
  if (quote.crew) {
    if (config.employees !== null) notes.push(`${copy.workforce}: ${number(config.employees)}`);
    if (!quote.enterprise) notes.push(`${number(quote.includedEmployees)} ${copy.allowance} · ${new Intl.NumberFormat(locale,{style:'currency',currency:'USD'}).format(quote.employeeRate)} ${copy.perEmployee}`);
    notes.push(quote.workforceUnknown ? copy.workforceUnknown : copy.overageNote);
  }
  if (quote.payrollNeedsScoping) {
    const country = config.payrollCountry ? new Intl.DisplayNames(locale,{type:'region'}).of(config.payrollCountry) : copy.scoped;
    notes.push(`${copy.payroll}: ${country}. ${copy.payrollNote}`);
  }
  if (quote.specialistScoping) notes.push(journey.coverage, copy.specialist);
  notes.push(`${copy.setup}: ${copy.scoped}`, copy.intentNote);
  if (effectiveDate) notes.push(`${messages.summary.pricingEffective} ${new Date(effectiveDate).toLocaleDateString(locale,{dateStyle:'long',timeZone:'UTC'})}`);
  const safeShare = new URL(shareUrl);
  if (!['http:','https:'].includes(safeShare.protocol)) throw new Error('Invalid estimate URL');
  safeShare.searchParams.set('lang',locale);
  const assets = new URL(import.meta.env.BASE_URL, window.location.origin).href;
  const heading = quote.enterprise ? copy.enterprise : copy.review;
  const primaryLabel = quote.enterprise ? messages.overview.contactSales : quote.averageMonthlyPerLocation !== null ? formatLocationAverage('',config.locations,locale) : messages.summary.monthlyInvestment;
  return `<!doctype html><html lang="${locale}" dir="${localeDirection[locale]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sundae · ${escape(copy.review)}</title><style>
  @font-face{font-family:Hanken;src:url('${assets}fonts/HankenGrotesk-Regular.ttf')}@font-face{font-family:Hanken;src:url('${assets}fonts/HankenGrotesk-Semibold.ttf');font-weight:600}@font-face{font-family:Fraunces;src:url('${assets}fonts/Fraunces-Semibold.ttf');font-weight:600}
  *{box-sizing:border-box}body{margin:0;background:#e7dfd4;color:#1a140f;font:14px/1.55 Hanken,system-ui,sans-serif}.sheet{max-width:820px;margin:32px auto;background:#f6f1e8;padding:48px 52px}.brand{display:flex;align-items:center;gap:14px;border-bottom:1px solid #ded3c2;padding-bottom:22px}.brand img{width:44px;height:44px}.wordmark{font:600 34px Fraunces,Georgia,serif;letter-spacing:-1.5px}.brand small{margin-inline-start:auto;color:#756b60;text-align:end;max-width:45%;font-size:12px}h1{font:600 34px/1.25 Fraunces,Hanken,system-ui,sans-serif;margin:30px 0 8px}h2{font:600 20px/1.4 Fraunces,Hanken,system-ui,sans-serif;margin:28px 0 14px}p{margin:8px 0}.scope{color:#756b60}.investment{background:#2a231c;color:#fbf8f4;border-radius:14px;padding:26px;display:grid;grid-template-columns:1.2fr 1fr;gap:24px;margin:24px 0 14px;break-inside:avoid}.investment small{display:block;font-size:12px;line-height:1.6}.investment strong{display:block;font:600 34px/1.3 Hanken,system-ui,sans-serif;margin:8px 0;overflow-wrap:anywhere}.investment .secondary{text-align:end}.investment .secondary strong{font-size:25px}.caption{color:#756b60;font-size:12px}table{width:100%;border-collapse:collapse}th,td{font-size:14px;padding:12px 0;border-bottom:1px solid #ded3c2;vertical-align:top}th{text-align:start;font-weight:400;padding-inline-end:22px}td{text-align:end;font-weight:600;width:38%;overflow-wrap:anywhere}.saving{color:#ac3025}tr{break-inside:avoid}ul{padding-inline-start:22px}li{padding:4px 0;break-inside:avoid;color:#65594e}.next{display:block;color:#ac3025;font-weight:600;margin-top:24px}footer{margin-top:34px;padding-top:16px;border-top:1px solid #ded3c2;font-size:11px;color:#756b60;display:flex;justify-content:space-between;gap:15px}.print-actions{display:flex;justify-content:center;padding:20px}.print-actions button{background:#ff5c4d;border:0;color:#1a140f;padding:14px 24px;border-radius:10px;font:600 14px Hanken,system-ui;cursor:pointer}
  @page{size:A4;margin:16mm} @media print{body{background:#f6f1e8;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{margin:0;padding:0;max-width:none}.print-actions{display:none}h1{font-size:30px}h2{break-after:avoid}.brand{break-inside:avoid}a{color:#ac3025}footer{break-inside:avoid}}@media(max-width:600px){.sheet{padding:24px;margin:0}.investment{grid-template-columns:1fr}.investment .secondary{text-align:start}h1{font-size:28px}}
  </style></head><body><div class="print-actions"><button onclick="window.print()">${escape(printLabels[locale])}</button></div><main class="sheet"><header class="brand"><img src="${assets}logos/sundae-app-icon.png" alt=""><span class="wordmark" dir="ltr">sundae</span><small>${escape(copy.review)}<br>${escape(new Date().toLocaleDateString(locale,{dateStyle:'long'}))}</small></header>
  <h1>${escape(heading)}</h1><p class="scope">${config.layer === 'both' ? 'Core + Crew' : config.layer === 'crew' ? 'Crew' : 'Core'} · ${number(config.locations)} ${escape(copy.bands)}</p>
  <section class="investment"><div><small>${escape(primaryLabel)}</small><strong><bdi>${quote.enterprise ? escape(copy.scoped) : money(quote.averageMonthlyPerLocation ?? quote.monthly)}</bdi></strong></div>${quote.enterprise ? '' : `<div class="secondary"><small>${escape(quote.averageMonthlyPerLocation !== null ? messages.summary.monthlyInvestment : copy.payment)}</small><strong><bdi>${money(quote.averageMonthlyPerLocation !== null ? quote.monthly : quote.paymentAmount)}</bdi></strong><small>${escape(quote.averageMonthlyPerLocation !== null ? messages.overview.perMonth : term)}</small></div>`}</section><p class="caption">${escape(copy.exclusions)}</p>
  <h2>${escape(copy.details)}</h2><table><tbody>${quote.lines.map(line => row(localizeBreakdownLabel(line.item,locale),quote.enterprise ? escape(copy.scoped) : money(line.price))).join('')}${quote.enterprise ? '' : quote.discounts.filter(d=>d.amount<0).map(d=>row(localizeDiscountLine(d,locale,config.locations),money(d.amount),true)).join('')}${!quote.enterprise && quote.employeeOverage ? row(copy.overage,money(quote.employeeOverage)) : ''}${row(copy.setup,escape(copy.scoped))}${quote.enterprise ? '' : row(copy.payment,money(quote.paymentAmount))}</tbody></table>
  <h2>${escape(copy.next)}</h2><ul>${notes.map(note=>`<li>${escape(note)}</li>`).join('')}</ul><a class="next" href="${escape(safeShare.href)}">${escape(copy.reviewCta)} →</a><footer><span dir="ltr">Sundae Technologies Inc.</span><span dir="ltr">pricing.sundae.io</span></footer></main></body></html>`;
}

export async function downloadBasketPDF(config: PricingIntent, quote: BasketQuote, shareUrl: string, effectiveDate?: string, locale: PricingLocale = 'en') {
  // Open synchronously inside the click event so popup blockers cannot swallow it.
  const documentUrl = URL.createObjectURL(new Blob([buildBasketPrintHTML(config,quote,shareUrl,locale,effectiveDate)], { type: 'text/html;charset=utf-8' }));
  const output = window.open(documentUrl,'_blank');
  if (!output) { URL.revokeObjectURL(documentUrl); throw new Error('Print window unavailable'); }
  try {
    // Navigate to a complete document instead of replacing about:blank with
    // document.write, which can strand font requests during popup navigation.
    await new Promise<void>((resolve, reject) => {
      const loaded = () => { window.clearTimeout(timeout); resolve(); };
      const timeout = window.setTimeout(() => {
        output.removeEventListener('load', loaded);
        reject(new Error('Print document did not load'));
      }, 20_000);
      output.addEventListener('load', loaded, { once: true });
    });
    output.opener = null;
    // Start font loading explicitly. A background print window may not lay out
    // until focused, leaving fonts.ready pending while the opener waits for it.
    await Promise.all(['14px Hanken','600 14px Hanken','600 34px Fraunces'].map(font => output.document.fonts.load(font)));
    output.document.body.getBoundingClientRect();
    await output.document.fonts.ready;
    await Promise.all(Array.from(output.document.images).map(img => img.decode().catch(()=>undefined)));
    output.document.documentElement.dataset.printReady = 'true';
    output.focus();
    // The buyer can review the document, then use its Print / save PDF button.
  } catch (error) { output.close(); throw error; }
  finally { URL.revokeObjectURL(documentUrl); }
}
