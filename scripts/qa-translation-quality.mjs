import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const filesToAudit = [
  'src/lib/generatedPricingLocalePacks.ts',
  'src/lib/generatedAuxiliaryLocalePacks.ts',
  'src/lib/pricingI18n.ts',
  'src/lib/pricingUiCopy.ts',
  'src/lib/locales.ts',
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

if (failures.length) {
  console.error(`Pricing translation quality QA failed with ${failures.length} issue(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Pricing translation quality QA passed')
