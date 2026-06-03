# I18n Translation Guidelines

These rules apply to every pricing-site translation update, whether copy is edited by hand or generated from a translation workflow.

## Required Language Surface

The pricing site must maintain copy coverage for all supported pricing locales:

`en`, `ar`, `fr`, `es`, `de`, `nl`, `pt`, `hi`, `ur`, `it`, `pl`, `tr`, `zh-Hans`, `ja`, `ko`, `id`, `vi`, `ro`, `sv`, `bn`, `th`, `ms`.

English is the source catalog. The four hand-authored base locales are `en`, `ar`, `fr`, and `es`; the remaining locales are served through generated packs and must be treated as production copy, not placeholders.

## Source Of Truth

Generated translation files must come from repository source catalogs and repository-owned generation workflows. Do not commit packs that identify temporary generators such as `/tmp/generate_*`, quota-limited partial generation, or fallback engines.

If an external translation model is used during a future workflow, the generated output must still pass the repository guardrails before commit. Model output is draft copy; the repo QA gates are the acceptance boundary.

## Non-Translatable Glossary

Keep these product, brand, system, and acronym terms exactly as written:

- `Sundae`
- `Sundae Report`
- `Sundae Core`
- `Pulse`
- `Watchtower`
- `Cross-Intelligence`
- `Report Lite`
- `Report Plus`
- `Report Pro`
- `Core Lite`
- `Core Pro`
- `Toast`
- `Square`
- `Lightspeed`
- `EBITDA`
- `CapEx`
- `POS`
- `P&L`

These terms should be integrated naturally into the translated sentence, not appended as awkward parenthetical fixes.

## Structural Fields

Never translate identifiers, module ids, tier ids, route paths, icon names, or pricing keys. They are application contracts, not customer copy.

## Quality Rules

Translations must read as market-ready customer copy, not literal machine output. Avoid word-for-word phrases such as Dutch `Puls` for the product `Pulse`, translated `Watchtower` product names, translated `Report Lite` tier names, translated `Sundae` brand names, and localized `POS` labels where the product/system acronym is intended.

## Required Checks

Run these before committing or deploying translation updates:

```bash
npm run qa:i18n
npm run validate:pricing
npm run lint
npm run build
```

`npm run build` runs the i18n translation gate and pricing validation through `prebuild`, so bad translation packs fail before production compilation.
