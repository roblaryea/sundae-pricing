import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const filesToAudit = [
  'src/lib/generatedPricingLocalePacks.ts',
  'src/lib/generatedAuxiliaryLocalePacks.ts',
  'src/lib/pricingI18n.ts',
  'src/lib/pricingUiCopy.ts',
  'src/lib/locales.ts',
  // Copy hardcoded in a component is still shipped copy. LivePricingGate held
  // en/ar/fr/es inline and was audited by nothing, which is how its French and
  // Spanish lost every accent ("tarifs publies", "catalogo") while the same
  // strings in the generated pack kept theirs.
  'src/components/shared/LivePricingGate.tsx',
]

const bannedPatterns = [
  ['temporary /tmp translation generator provenance', /\/tmp\/generate/i],
  ['fallback generator marker', /Google Translate fallback|fallback filled remaining quota-limited chunks/i],
  ['quota-driven partial generation provenance', /OpenAI generated completed chunks/i],
  ['Dutch product name Pulse translated as Puls', /\bPuls(?!e)\b/],
  ['German tier Report Lite translated', /\bBericht Lite\b/],
  ['Dutch tier Report Lite translated', /\bRapport Lite\b/],
  ['Spanish tier Report Lite translated', /\bReporte Lite\b/],
  ['Portuguese tier Report Lite translated', /\bRelat[oó]rio Lite\b/],
  ['Hindi tier Report Lite translated', /रिपोर्ट लाइट/],
  ['Urdu tier Report Lite translated', /رپورٹ لائٹ/],
  ['Chinese tier Report Lite translated', /报告基础版/],
  ['Japanese tier Report Lite translated', /レポートライト/],
  ['Korean tier Report Lite translated', /리포트\s*라이트/],
  ['German Watchtower translated', /\bWachturm\b|\bWACHTTURM\b/],
  ['Dutch Watchtower translated', /\bWachttoren\b|\bWACHTTOREN\b/],
  ['French Watchtower translated', /\bTour de guet\b/],
  ['Spanish Watchtower translated', /\bTorre de Vigilancia\b/],
  ['Portuguese Watchtower translated', /\bTorre de Vigia\b|\bTORRE DE VIGIA\b/],
  ['Arabic Watchtower translated', /برج المراقبة/],
  ['Urdu Watchtower translated', /واچ ٹاور/],
  ['Hindi Watchtower translated', /वॉचटावर|प्रहरीदुर्ग/],
  ['Sundae translated as dessert/common noun', /مثلجات|سانداي|圣代/],
  ['Spanish POS translated in product/system context', /punto de venta/i],
  ['Portuguese POS translated in product/system context', /ponto de venda/i],
  ['French POS translated in product/system context', /point de vente/i],
  ['Dutch POS translated in product/system context', /kassasysteem/i],
  ['Arabic POS translated in product/system context', /نقطة البيع/],
]

/**
 * Locales whose copy CANNOT legitimately be pure ASCII: Latin scripts that
 * always carry diacritics, plus every non-Latin script. Indonesian, Malay,
 * Dutch and English are excluded because ASCII is correct for them.
 *
 * This catches the specific decay that banned-pattern matching cannot: text
 * that is grammatically intact but has been stripped of its accents somewhere
 * between authoring and commit. A reviewer skims past "publies"; a byte check
 * does not.
 */
const diacriticRequiredLocales = [
  'fr', 'es', 'pt', 'de', 'it', 'pl', 'tr', 'ro', 'sv', 'vi',
  'ar', 'hi', 'ur', 'zh-Hans', 'ja', 'ko', 'bn', 'th',
]

const failures = []

for (const relativePath of filesToAudit) {
  const absolutePath = path.join(root, relativePath)
  const text = fs.readFileSync(absolutePath, 'utf8')

  for (const [label, pattern] of bannedPatterns) {
    const match = text.match(pattern)
    if (!match) continue
    const lineNumber = text.slice(0, match.index).split('\n').length
    failures.push(`${relativePath}:${lineNumber}: ${label} (${match[0]})`)
  }
}

// ── Structural: live-pricing gate copy ─────────────────────────────────────
// Scoped deliberately to livePricingCopy rather than "any block for this
// locale": Italian's layerStackCopy is legitimately accent-free, so a
// whole-locale sample reports a false positive and trains people to ignore
// the gate. Guard the specific strings, not the neighbourhood.
const livePricingByLocale = new Map()

const packText = fs.readFileSync(
  path.join(root, 'src/lib/generatedAuxiliaryLocalePacks.ts'),
  'utf8',
)
const supportStart = packText.indexOf('"supportCopy"')
if (supportStart !== -1) {
  const supportSegment = packText.slice(supportStart)
  const localeHeader = /\n {4}"([a-zA-Z-]+)": \{/g
  const headers = []
  let hit
  while ((hit = localeHeader.exec(supportSegment)) !== null) {
    headers.push({ locale: hit[1], index: hit.index })
  }
  headers.forEach(({ locale, index }, position) => {
    const end = position + 1 < headers.length ? headers[position + 1].index : supportSegment.length
    const found = /"livePricingCopy": \{([^}]*)\}/.exec(supportSegment.slice(index, end))
    if (found) livePricingByLocale.set(locale, found[1])
  })
}

const gateText = fs.readFileSync(
  path.join(root, 'src/components/shared/LivePricingGate.tsx'),
  'utf8',
)
const inlineConst = /const LIVE_PRICING_COPY = \{([\s\S]*?)\n\} as const;/.exec(gateText)
if (inlineConst) {
  const entry = /\n {2}'?([a-zA-Z-]+)'?: \{([^}]*)\}/g
  let hit
  while ((hit = entry.exec(inlineConst[1])) !== null) {
    livePricingByLocale.set(hit[1], hit[2])
  }
}

// Coverage: a locale the site offers but has no gate copy for silently falls
// back to English at exactly the moment the visitor is being told something
// went wrong.
const localesText = fs.readFileSync(path.join(root, 'src/lib/locales.ts'), 'utf8')
const declared = /export const supportedLocales = \[([\s\S]*?)\] as const/.exec(localesText)
if (declared) {
  const supported = [...declared[1].matchAll(/'([a-zA-Z-]+)'/g)].map((m) => m[1])
  for (const locale of supported) {
    if (!livePricingByLocale.has(locale)) {
      failures.push(
        `live-pricing gate copy: locale "${locale}" is offered by the site but has no livePricingCopy — it will silently render English`,
      )
    }
  }
}

for (const [locale, body] of livePricingByLocale) {
  if (!diacriticRequiredLocales.includes(locale)) continue
  if (!/[^\u0000-\u007F]/.test(body)) {
    failures.push(
      `live-pricing gate copy: locale "${locale}" is pure ASCII — its copy has likely been accent-stripped or left in English`,
    )
  }
}

if (failures.length) {
  console.error(`Pricing translation quality QA failed with ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Pricing translation quality QA passed')
