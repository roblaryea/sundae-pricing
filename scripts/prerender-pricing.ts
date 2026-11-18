import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { applyLiveCatalogValues, validatePublishedCatalog, type LiveCatalogResponse } from '../src/data/livePricing';
import { corePackages, CORE_PACKAGE_IDS } from '../src/data/pricing';
import { buyerPlanCopy } from '../src/lib/buyerPlanCopy';
import { CREW_PRESETS } from '../src/lib/crewPricing';
import { supportedLocales, localeDirection, type PricingLocale } from '../src/lib/locales';
import { getBuyerCopy } from '../src/lib/buyerCopy';
import { getPricingMetadata, pricingLocaleUrl, SOCIAL_IMAGE } from '../src/lib/pricingMetadata';

const response = await fetch(process.env.PRICING_SNAPSHOT_URL || 'https://pricing.sundae.io/api/pricing/catalog/active', { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`Cannot generate a published pricing snapshot: ${response.status}`);
const catalogue = await response.json() as LiveCatalogResponse;
// Builds have no browser hostname: explicitly enforce the hosted catalogue gate.
validatePublishedCatalog(catalogue, true);
applyLiveCatalogValues(catalogue);
const escape = (s: string) => s.replace(/[&<>"']/g,(c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const base = await readFile('dist/index.html','utf8');
function render(locale: PricingLocale, simulator = false) {
  const copy = getBuyerCopy(locale);
  const meta = getPricingMetadata(locale, simulator);
  const snapshot = `<main aria-label="Sundae Core + Crew" style="max-width:1120px;margin:auto;padding:32px;font-family:var(--font-sans),sans-serif;color:#fbf8f4;background:#2A231C">
    <a href="https://www.sundae.io" style="color:inherit">sundae</a><h1>${escape(simulator ? copy.review : copy.title)}</h1><p>${escape(copy.subtitle)}</p>
    <h2>Sundae Core</h2><ul>${CORE_PACKAGE_IDS.map((id,i) => `<li><h3>${escape(corePackages[id].name)}</h3><p>${escape(buyerPlanCopy[locale].purposes[i])}</p></li>`).join('')}</ul>
    <h2>Sundae Crew</h2><ul>${CREW_PRESETS.map(p=>`<li>${escape(p.label)}</li>`).join('')}</ul>
    <p>${escape(copy.exclusions)}</p><p>${escape(copy.intentNote)}</p>
    <a href="/simulator${locale === 'en' ? '' : `?lang=${locale}`}" style="color:#ffb2a9">${escape(copy.reviewCta)}</a>
  </main>`;
  const html = base.replace(/<title>[\s\S]*?<\/title>/,'')
    .replace(/<link[^>]+rel="canonical"[^>]*>/g,'')
    .replace(/<meta[^>]+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g,'');
  const schema = { '@context':'https://schema.org','@type':'WebPage', name:meta.title, description:meta.description, url:meta.canonical, inLanguage:locale, isPartOf:{'@type':'WebSite',name:'Sundae Pricing',url:'https://pricing.sundae.io/'}, publisher:{'@type':'Organization',name:'Sundae Technologies Inc.',url:'https://www.sundae.io/'} };
  const head = `<title>${escape(meta.title)}</title><meta name="description" content="${escape(meta.description)}"><meta name="robots" content="${meta.robots}"><link rel="canonical" href="${escape(meta.canonical)}">
    ${meta.alternates.map(a=>`<link rel="alternate" hreflang="${a.lang}" href="${escape(a.href)}">`).join('')}<link rel="alternate" hreflang="x-default" href="https://pricing.sundae.io/">
    <meta property="og:type" content="website"><meta property="og:site_name" content="Sundae"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${escape(meta.canonical)}"><meta property="og:image" content="${SOCIAL_IMAGE}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(meta.title)}"><meta name="twitter:description" content="${escape(meta.description)}"><meta name="twitter:image" content="${SOCIAL_IMAGE}"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`;
  return html.replace('<html lang="en">',`<html lang="${locale}" dir="${localeDirection[locale]}">`).replace('</head>',`${head}</head>`).replace('<div id="root"></div>',`<div id="root">${snapshot}</div>`).replace(/<noscript>[\s\S]*?<\/noscript>/,'');
}
await writeFile('dist/index.html',render('en'));
await writeFile('dist/simulator.html',render('en',true));
for (const locale of supportedLocales.filter(l=>l!=='en')) {
  const dir = `dist/localized/${locale}`;
  await mkdir(dir,{recursive:true});
  await writeFile(`${dir}/index.html`,render(locale));
  await writeFile(`${dir}/simulator.html`,render(locale,true));
}
const alternates = supportedLocales.map(locale=>`<xhtml:link rel="alternate" hreflang="${locale}" href="${escape(pricingLocaleUrl(locale))}"/>`).join('');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${supportedLocales.map(locale=>`<url><loc>${escape(pricingLocaleUrl(locale))}</loc>${alternates}<xhtml:link rel="alternate" hreflang="x-default" href="https://pricing.sundae.io/"/></url>`).join('')}</urlset>`;
await writeFile('dist/sitemap.xml',sitemap);
console.log(`Localized pricing discovery generated for ${supportedLocales.length} languages from ${catalogue.version!.versionName}`);
