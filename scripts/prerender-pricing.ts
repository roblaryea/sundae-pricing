import { readFile, writeFile } from 'node:fs/promises';
import { applyLiveCatalogValues, type LiveCatalogResponse } from '../src/data/livePricing';
import { corePackages, CORE_PACKAGE_IDS } from '../src/data/pricing';
import { buyerPlanCopy } from '../src/lib/buyerPlanCopy';
import { CREW_PRESETS, computeCrewQuote } from '../src/lib/crewPricing';
const response = await fetch(process.env.PRICING_SNAPSHOT_URL || 'https://pricing.sundae.io/api/pricing/catalog/active', { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`Cannot generate a published pricing snapshot: ${response.status}`);
const catalogue = await response.json() as LiveCatalogResponse;
applyLiveCatalogValues(catalogue);
const escape = (s: string) => s.replace(/[&<>"']/g,(c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const money = (n: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const snapshot = `<main aria-label="Sundae pricing overview" style="max-width:1120px;margin:auto;padding:32px;font-family:var(--font-sans),sans-serif;color:#fbf8f4;background:#2A231C">
  <a href="https://sundae.io" style="color:inherit;display:flex;align-items:center;gap:12px;text-decoration:none"><img src="/logos/sundae-icon.svg" width="36" height="36" alt=""/><span style="font-family:var(--font-display),serif;font-size:32px;font-weight:600">sundae</span></a><h1 style="font-family:var(--font-display),serif">Pricing that fits your business.</h1>
  <p>Core intelligence, Crew workforce operations, or both. Prices below cover one location per month, in USD.</p>
  <h2>Core packages</h2><ul>${CORE_PACKAGE_IDS.map((id,i) => `<li><h3>${escape(corePackages[id].name)} — ${money(corePackages[id].firstUnitPrice)}/month</h3><p>${escape(buyerPlanCopy.en.purposes[i])}</p></li>`).join('')}</ul>
  <h2>Crew workforce operations</h2><ul>${CREW_PRESETS.map((p) => `<li>${escape(p.label)} — ${money(computeCrewQuote(p.skus,1).monthly)}/month for the first location</li>`).join('')}</ul>
  <h2>How pricing works</h2><p>Your package price covers the first location. Additional locations are priced in groups, with lower rates as your business grows. Lower rates apply only to the additional locations in each group. ${escape(buyerPlanCopy.en.comparison)}</p>
  <p>Taxes and one-time setup are excluded. Selected extensions and additional employees may add charges. 250 or more locations and custom requirements need a proposal.</p>
  <p>Pricing effective ${escape(catalogue.version!.effectiveDate.slice(0,10))}. The interactive calculator uses the latest published prices. This page is an estimate, not a fixed quote.</p>
  <a href="/simulator" style="color:#ff7e6f">Configure your estimate</a> · <a href="https://sundae.io/demo" style="color:#ff7e6f">Discuss a proposal</a>
</main>`;
const path = 'dist/index.html';
let html = await readFile(path,'utf8');
html = html.replace('<div id="root"></div>',`<div id="root">${snapshot}</div>`).replace(/<noscript>[\s\S]*?<\/noscript>/,'<noscript><p>The pricing overview above is available without JavaScript. Enable JavaScript to calculate a configuration for your locations.</p></noscript>');
await writeFile(path,html);
console.log(`Indexable pricing snapshot generated from ${catalogue.version!.versionName}`);
