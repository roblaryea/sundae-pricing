import jsPDF from 'jspdf';
import type { PricingIntent } from './pricingIntent';
import { INTENT_TERMS } from './pricingIntent';
import type { BasketQuote } from './basketQuote';
import { getBuyerCopy, formatLocationAverage } from './buyerCopy';

const palette = { cream:'#F6F1E8', ink:'#1A140F', espresso:'#2A231C', muted:'#756B60', edge:'#DED3C2', coral:'#FF5C4D', white:'#FBF8F4' };
let brandAssets: Promise<string[]> | undefined;
function base64(bytes: Uint8Array) {
  let binary='';
  for(let i=0;i<bytes.length;i+=8192) binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return btoa(binary);
}
function loadBrandAssets() {
  brandAssets ??= Promise.all(['fonts/HankenGrotesk-Regular.ttf','fonts/HankenGrotesk-Semibold.ttf','fonts/Fraunces-Semibold.ttf','logos/sundae-app-icon.png'].map(async (path) => {
    const response=await fetch(`${import.meta.env.BASE_URL}${path}`);
    if(!response.ok) throw new Error('Estimate brand assets unavailable');
    return base64(new Uint8Array(await response.arrayBuffer()));
  })).catch((error) => { brandAssets=undefined; throw error; });
  return brandAssets;
}

/** Vector text with embedded Sundae typography. Uses the exact reviewed basket. */
export async function downloadBasketPDF(config: PricingIntent, quote: BasketQuote, shareUrl: string, effectiveDate?: string) {
  if(quote.needsCrewSelection) throw new Error('Select a Crew plan before exporting.');
  const [regular,semibold,display,mark]=await loadBrandAssets();
  const doc=new jsPDF({putOnlyUsedFonts:true});
  doc.addFileToVFS('Hanken-Regular.ttf',regular); doc.addFont('Hanken-Regular.ttf','Hanken','normal');
  doc.addFileToVFS('Hanken-Semibold.ttf',semibold); doc.addFont('Hanken-Semibold.ttf','Hanken','bold');
  doc.addFileToVFS('Fraunces-Semibold.ttf',display); doc.addFont('Fraunces-Semibold.ttf','Fraunces','normal');
  doc.setProperties({title:'Your Sundae subscription estimate',author:'Sundae Technologies Inc.',subject:'Subscription estimate'});
  const copy=getBuyerCopy('en');
  const money=(n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
  const date=(value:string) => new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const term=copy.terms[INTENT_TERMS.indexOf(config.billingCycle)];
  const layer=config.layer==='both'?'Core + Crew':config.layer==='crew'?'Crew':'Core';
  let y=0;
  const type=(family='Hanken',size=10,colour=palette.ink,style='normal') => {doc.setFont(family,style);doc.setFontSize(size);doc.setTextColor(colour);};
  const header=(continuation?:string) => {
    doc.setFillColor(palette.cream);doc.rect(0,0,210,297,'F');
    doc.addImage(`data:image/png;base64,${mark}`,'PNG',18,17,11,11);
    type('Fraunces',23);doc.text('sundae',33,26);
    type('Hanken',8,palette.muted,'bold');doc.text('YOUR SUBSCRIPTION ESTIMATE',192,21,{align:'right'});
    type('Hanken',8,palette.muted);doc.text(`Prepared ${date(new Date().toISOString())}`,192,27,{align:'right'});
    doc.setDrawColor(palette.edge);doc.line(18,36,192,36);
    if(continuation){type('Fraunces',24);doc.text(continuation,18,52);y=65;}
  };
  const ensure=(height:number,continuation='Your estimate, continued.') => {
    if(y+height<=270) return false;
    doc.addPage();header(continuation);return true;
  };
  const paragraph=(value:string,size=9,colour=palette.muted) => {
    type('Hanken',size,colour);
    const lines=doc.splitTextToSize(value,174) as string[];
    ensure(lines.length*4.6+3);
    for(const line of lines){type('Hanken',size,colour);doc.text(line,18,y);y+=4.6;}
    y+=3;
  };
  const bulletLines=(value:string) => {
    type('Hanken',9.5,palette.muted);
    return doc.splitTextToSize(value,168) as string[];
  };
  const bullet=(value:string) => {
    const lines=bulletLines(value);
    ensure(lines.length*5.1+3);
    doc.setFillColor(palette.muted);doc.circle(19,y-1,0.65,'F');
    for(const line of lines){type('Hanken',9.5,palette.muted);doc.text(line,24,y);y+=5.1;}
    y+=3;
  };
  const row=(label:string,value:string,accent=false) => {
    type('Hanken',10,palette.ink);
    const lines=doc.splitTextToSize(label,112) as string[];
    type('Hanken',10,palette.ink,'bold');
    const amounts=doc.splitTextToSize(value,58) as string[];
    const height=Math.max(10,lines.length*4.5+5,amounts.length*4.5+5);
    ensure(height);type('Hanken',10,accent?palette.coral:palette.ink);doc.text(lines,18,y);
    type('Hanken',10,accent?palette.coral:palette.ink,'bold');
    doc.text(amounts,192,y,{align:'right'});
    y+=height;
    doc.setDrawColor(palette.edge);doc.line(18,y-4,192,y-4);
  };
  header();
  type('Fraunces',30);doc.text('Your Sundae estimate.',18,55);
  type('Hanken',10,palette.muted);doc.text(`${layer}  /  ${config.locations} ${config.locations===1?'location':'locations'}`,18,67);
  doc.setFillColor(palette.espresso);doc.roundedRect(18,77,174,49,3,3,'F');
  type('Hanken',8,palette.white,'bold');doc.text(quote.enterprise?'CUSTOM PROPOSAL':quote.cadenceMonths===1?'MONTHLY SUBSCRIPTION':'MONTHLY EQUIVALENT',26,89);
  if(quote.enterprise){
    type('Fraunces',22,palette.white);doc.text(copy.enterprise,26,107);
  }else{
    const amounts=[money(quote.monthly),money(quote.paymentAmount)];
    let amountSize=31;
    type('Hanken',amountSize,palette.white,'bold');
    // Fit both values together so their font, size and baseline stay identical.
    while(amounts.some((amount)=>doc.getTextWidth(amount)>74) && amountSize>17) type('Hanken',--amountSize,palette.white,'bold');
    doc.text(amounts[0],26,107);doc.text(amounts[1],110,107);
    type('Hanken',9,palette.white);doc.text('/ month',26,116);
    type('Hanken',8,palette.white,'bold');doc.text('PAYMENT AMOUNT',110,89);
    type('Hanken',9,palette.white);doc.text(term,110,116);
  }
  const averageOffset=quote.averageMonthlyPerLocation===null?0:8;
  if(quote.averageMonthlyPerLocation!==null){y=135;paragraph(formatLocationAverage(money(quote.averageMonthlyPerLocation),config.locations,'en'),9);}
  y=135+averageOffset;paragraph(copy.exclusions,8);
  type('Fraunces',17);doc.text(quote.enterprise?'Your selected plans and extensions':'Your monthly price, item by item',18,151+averageOffset);y=162+averageOffset;
  for(const line of quote.lines) row(line.item,quote.enterprise?'Confirmed in proposal':money(line.price));
  if(!quote.enterprise){
    for(const d of quote.discounts.filter(d=>d.amount<0)) row(d.key==='term'?`Subscription saving - ${d.percent}%`:d.key==='volume'?`Location saving - ${d.percent}%`:d.name,money(d.amount),true);
    if(quote.employeeOverage) row(copy.overage,money(quote.employeeOverage));
  }
  row(copy.setup,quote.implementation.requiresScoping?copy.scoped:money(quote.implementation.fee));
  y+=4;
  const notes:string[]=[];
  if(!quote.enterprise) notes.push(config.billingCycle==='monthly'?'Monthly subscription, paid each month.':config.billingCycle==='annual_quarterly'?'12-month subscription, paid every 3 months. Each payment covers 3 months.':config.billingCycle==='annual_upfront'?'12-month subscription, paid in full upfront.':'24-month subscription, paid in full upfront.');
  if(quote.crew){
    if(quote.enterprise){
      notes.push(`Employees: ${config.employees ?? 'not yet specified'} across your group. Included employees and any extra employee charges will be confirmed in your proposal.`);
    }else{
      notes.push(`Employees: ${config.employees ?? 'not yet specified'} across your group, counted once each. Your plan includes ${quote.includedEmployees}.`);
      notes.push(quote.workforceUnknown?`${copy.workforceUnknown} The current rate is ${money(quote.employeeRate)} per extra employee / month.`:quote.excessEmployees>0?`Additional employees: ${quote.excessEmployees} at ${money(quote.employeeRate)} each / month = ${money(quote.employeeOverage)} / month. This is included in your monthly estimate.`:`No extra employee charges at your current employee count. Additional employees cost ${money(quote.employeeRate)} each / month above the included amount.`);
      notes.push(copy.overageNote);
    }
  }
  if(quote.payrollNeedsScoping){
    const country=config.payrollCountry ? new Intl.DisplayNames(['en'],{type:'region'}).of(config.payrollCountry) : undefined;
    const countryLabel=country && country!==config.payrollCountry ? `${country} (${config.payrollCountry})` : config.payrollCountry || 'not yet specified';
    notes.push(`Payroll country: ${countryLabel}. ${copy.payrollNote}`);
  }
  if(quote.specialistScoping) notes.push(copy.specialist);
  notes.push(quote.enterprise?'Subscription pricing and setup will be confirmed in your proposal. Taxes are not included.':quote.implementation.requiresScoping?'Taxes and one-time setup are not included in the subscription amounts. Setup will be confirmed separately before you start.':'Taxes and the one-time setup fee shown above are not included in the subscription amounts.');
  notes.push(copy.intentNote);
  if(effectiveDate) notes.push(`Pricing effective ${date(effectiveDate)}. Reopen your estimate to see current prices.`);
  const notesHeight=notes.reduce((height,note)=>height+bulletLines(note).length*5.1+3,0)+27;
  // Keep scope disclosures together; never strand the last line on a new page.
  const notesOnNewPage=ensure(notesHeight,'Your scope and next steps.');
  if(!notesOnNewPage){type('Fraunces',15);doc.text('Scope and next steps',18,y);y+=10;}
  for(const note of notes) bullet(note);
  ensure(15);y+=3;
  type('Hanken',10,palette.coral,'bold');doc.textWithLink('Review or update your estimate >',18,y,{url:shareUrl});y+=8;
  type('Hanken',8,palette.muted);doc.text('pricing.sundae.io',18,y);
  const pages=doc.getNumberOfPages();
  for(let page=1;page<=pages;page++){
    doc.setPage(page);doc.setDrawColor(palette.edge);doc.line(18,279,192,279);
    type('Hanken',7.5,palette.muted);doc.text('Sundae Technologies Inc.  /  Decision Intelligence Platform',18,287);
    doc.text(`${page} / ${pages}`,192,287,{align:'right'});
  }
  doc.save(`Sundae-estimate-${config.locations}-locations.pdf`);
}
