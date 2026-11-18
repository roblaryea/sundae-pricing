# Approved Sundae brand correction — pricing

Source: **`b15b88e64fdfebd1a8b898c0ef0a342f068b9982`**, branch `codex/pricing-approved-brand-20261118`, isolated from published pricing `140def24416bebd7fd3dcae919463b0987f4424c`. Status: prepared for the established independent review/publication process; no pricing publication is implied.

## What was corrected

- Header, mobile-menu and footer identity now use the exact original approved dark/white Fraunces PNGs from the brand registry. The recreated SVG S mark and separately typeset wordmark components are removed.
- Printed basket estimates use the approved dark PNG; both legacy PDF paths use the approved white PNG. The generated static discovery snapshot also uses the approved white PNG.
- Browser, Apple and square icon assets contain the complete approved dark wordmark on a cream canvas. Only empty alpha margins are trimmed; full lettering and proportions remain intact. The old coral S icons, lockup SVGs and old public wordmark are removed from the served public directory. Historical `brand-archive` material remains outside the public build.
- Existing public main-site social artwork URL is preserved by agreement with the main owner, who is rebuilding that artwork from the approved white PNG. Coordinated main-site publication must complete that external artwork replacement; pricing does not claim that external asset is already corrected.

Primary PNGs are **byte-identical**, 480×120 originals. [Asset provenance, hashes and icon recipe](asset-receipt.json). Components display the full original at 144×36 for the shared medium size; print uses 160×40. No filter, retyping or recolouring is applied. The square icon reproduction script is `scripts/build-approved-brand-icons.py`.

## Evidence

| Surface | Dark | Light |
|---|---|---|
| Desktop header | [1440 px](evidence/desktop-dark-header.png) | [1440 px](evidence/desktop-light-header.png) |
| Desktop footer | [1440 px](evidence/desktop-dark-footer.png) | [1440 px](evidence/desktop-light-footer.png) |
| Mobile header | [390 px](evidence/mobile-dark-header.png) | [390 px](evidence/mobile-light-header.png) |
| Mobile footer | [390 px](evidence/mobile-dark-footer.png) | [390 px](evidence/mobile-light-footer.png) |
| Arabic mobile | [390 px RTL](evidence/mobile-arabic-dark.png) | [390 px RTL](evidence/mobile-arabic-light.png) |

[Print estimate](evidence/estimate-print.png) · [actual 16/32/180 px icon specimens, plus magnified views](evidence/icon-specimens.png) · [browser dimensions and exact quote readbacks](browser-receipt.json).

The complete six-letter wordmark is approximately **14×4 px at 16 px**, so it is not independently readable at that size. The 32 px specimen is more recognizable and the 180 px Apple specimen is clear. These concrete specimens were sent to the existing SEO and main-site reviewers for the approved small-format asset decision; no standalone glyph was invented and the retired S was not retained.

## Validation and scope

All **1,458 unit tests in 52 files**, **41 existing pricing browser journeys**, lint, translation QA, TypeScript, catalogue validation and standalone production build pass. The browser captures used the live published catalogue through the existing local same-origin proxy. Header/footer PNGs decode at 480×120 and render at a preserved 4:1 ratio. Dark/light desktop and mobile retain **$1,545/month** for three-location Core Foundation with no horizontal overflow. Arabic 390 px remains RTL, retains the same quote and has no overflow. The real print/PDF workflow was captured with the approved image decoded.

No price, entitlement, quote calculation, ROI formula, F13 preference handler, UTM handling or navigation code changed. Existing F13 closure and arithmetic acceptance remain intact. Optional sibling roots were absent for the standalone build; this makes no cross-repository parity claim. No marketing, app or main-site worktree was edited. SEO remains publication/integration owner.
