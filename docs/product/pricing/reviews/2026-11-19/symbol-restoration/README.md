# Approved S/cherry restoration and optical alignment — 19 November 2026

Application source: `e83c964dcb1b8cf4ee5d606dcfbc5179be9e2db4`.
Base: published expiry merge `2bb40157d2df88cff7b60cd12800948c7fb58122`.
Branch: `codex/pricing-symbol-restore-20261119`.
Status: locally implemented/verified; exact-source independent acceptance and publication pending. Pricing author does not publish this cut.

## Authorization and identity

The existing positioning owner relayed Robert's direct confirmation: **“Yes, the gradient S and cherry”** beside the approved Fraunces wordmark on both sites. Robert then required the symbol to be in line with the wordmark in the header. Main-site and pricing authors agreed the same original assets and a presentation-only optical correction.

- Exact website `d926935:public/logos/sundae-mark.svg` is restored; SHA256 `dff75ed182b38965d4b4c066f41152b66e1c525b92d4aac40e458a0d1909ee05`. The corresponding `sundae-icon.svg` is identical.
- Exact original512 app PNG,180 Apple PNG and July favicon ICO are restored. The original square bitmaps have historic opaque gray corner matte; these are preserved byte-for-byte for browser icons.
- 16/32/192 icon PNGs are full512RGBA LANCZOS resizes without crop/recolor. The reproducible icon script now derives from the approved square symbol instead of composing the wordmark on a cream canvas. Unused wordmark-only square variants were removed.
- Both current Fraunces PNG originals are unchanged byte-for-byte. No typeset, traced, recolored, cropped or redrawn wordmark was introduced. [Source/provenance hashes](asset-provenance.json).

## Corrected surfaces

The shared Logo now defaults to the symbol plus original wordmark. Existing header, native mobile menu and footer therefore share one identity. Links/locales/theme behavior are unchanged. Mark is decorative alongside the existing accessible Sundae name. The complete group staysLTR withinRTL pages.

Browser faviconSVG/PNG/ICO and Apple icon references carry a fresh cache version. The loading/prerender shell uses the same Logo; its existing dual-original-PNG prepaint rule remains intact. Current browser-print estimates use the exactSVG beside the original dark Fraunces PNG. Legacy Core/Crew PDF headers rasterize the unchangedSVG to a512canvas because jsPDF requires a bitmap; the original white Fraunces PNG is embedded separately. This avoids introducing the app-icon corner matte into full logo headers. Asset-load failure uses the legal entity as ordinary text rather than a fabricated SUNDAE wordmark.

No pricing engine, quote values, discounts, overage, ROI, implementation logic, location entry/24-hour expiry, selected-product summary contract, metadata, UTM handoff or navigation destination changed. This is not a page redesign or a performance optimization.

## Shared final optical recipe

Use the exact original symbol at **1.5em square**, translateY **+0.0285em**, original wordmark **6.4em ×1.6em**, margin-inline-start **−0.6em**, wrapperLTR. These are the main owner's final agreed values; the earlier1.2em whole-tile comparison was rejected and is not the final source.

The colored S/cherry/visible stem foreground, excluding espresso tile, is measured from the512 source at y25..463. Its normalized center is244/512. The original wordmark alpha ink is y12..107 on its120px canvas. Pricing's144×36 wordmark therefore pairs with a33.75px symbol whose colored foreground is28.872px high against28.5px wordmark ink. The measured foreground/wordmark center delta is under0.001px in the finite rendered views. The tile is not confused with the colored artwork. No source pixels or SVG paths are changed.

Header/menu/footer/print/PDF all use the same proportional presentation. Readbacks record actual bounds and optical centers; screenshots remain the visual acceptance evidence, not just the numerical center claim.

## Verification and finite evidence

- **1,480 unit tests in53files pass**. Lint, TypeScript, translation/catalogue validation and standalone production build/prerender pass. Optional sibling roots were absent for standalone deployment parity.
- The finite50-case browser run covers41configured simulator/quote/PDF journeys,6loading cases and3consent/contrast cases. Final combined run:49passed with one1440loading case failing when its already-asserted heading temporarily had no bounding box during the loading transition. The unchanged complete loading file was then rerun with one worker: **6/6pass**. Earlier same-cut functional runs also passed50/50 before the final presentation-only alignment. Both final logs are retained; no hidden whole-suite-green claim.
- Six actual local-browser views:1440desktop dark/light,1280German desktop,390mobile dark/light,320ArabicRTL. Every mark asset decodes; expected wordmark original follows theme; blank initial location gate and three-location combined$2,242quote remain; no horizontal document overflow. Three mobile menus display the restored logo. [Bounds/optical readbacks](visual-readbacks.json).
- Local production build with application chunks blocked:1440dark and390light render the restored symbol and appropriate original theme wordmark before hydration, retain the blank count and have no overflow. [Static-shell receipt](static-shell-readbacks.json).
- Current EN/AR browser-print documents load the original mark/wordmark correctly, preserveLTR logo insideRTL document, and render totals$2,242/$747.33average with expected$1,545Core/$697Crew lines. Both were exported toPDF and rendered with Poppler for inspection. Legacy CoreEN/CrewAR header logos were also generated through their actual export functions and visually rendered. [PDF asset receipt](pdf-readbacks.json).

The six page views use the published-policy fixture at the catalogue boundary; static-shell proof uses the final local production build. These are local source/runtime evidence, not hosted preview or public publication evidence.

## Representative visuals

| Surface | Evidence |
|---|---|
| Desktop light header, optical alignment | [Header](header-1440-light-en.png) |
| Desktop dark full page/footer | [Page](page-1440-dark-en.png) |
| Mobile light full page/footer | [Page](page-390-light-en.png) |
| Mobile dark header | [Header](header-390-dark-en.png) |
| Arabic320 header | [Header](header-320-dark-ar.png) |
| Arabic320 mobile menu | [Menu](menu-320-dark-ar.png) |
| Light production static shell before chunks | [Shell](static-shell-390-light.png) |
| Current English print/PDF | [Rendered page](basket-en-page1.png), [PDF](basket-en.pdf) |
| Current Arabic print/PDF | [Rendered page](basket-ar-page1.png), [PDF](basket-ar.pdf) |
| Legacy Core PDF header | [Rendered page](legacy-core-page1.png), [PDF](legacy-core.pdf) |

## Existing legacy Arabic PDF boundary

The older jsPDF CrewArabic body contains malformed/reversed text and numbers. This is **not introduced or fixed by the symbol restoration**. The same quote was generated through the published original module and the new module; the body rectangle below the logo is pixel-identical. [Baseline](baseline-legacy-crew-page1.png), [current](legacy-crew-page1.png), [comparison receipt](legacy-arabic-boundary.json). The current buyer browser-print Arabic output shown above is coherent. This cut qualifies the old exporter rather than silently claiming all export typography is repaired.

Logs: [unit](unit-checks.txt), [browser](browser-checks.txt), [loading retake](loading-retake.txt), [build](build-checks.txt), [lint](lint-checks.txt).
