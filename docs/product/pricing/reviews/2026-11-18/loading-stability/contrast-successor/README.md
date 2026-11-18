# Cookie-banner contrast — successor to frozen F11

Application source: **`6d96e92f1bf5d7b5ce3e9a7479f561870013fd29`**. Frozen F11 source remains **`d74a09f29c77a876ba35d68cd925468b8fee0d74`**, with evidence head **`a3c21d5462788b0fbdf0342d2d38d036e65a355f`**. The matched performance reports in the parent directory belong to that frozen predecessor; no new performance measurement or improvement is claimed for this contrast-only successor.

The existing espresso consent banner inherited dark light-page text colours. A narrowly scoped `.light .pricing-cookie-banner` override now uses existing **cream-edge #EAE0CE** for the explanatory text and Decline label, and **cream #F6F1E8** for the privacy link and hover/focus states. The dark banner, typography, dimensions, buttons, copy and all consent/analytics handlers are unchanged. Dark mode retains its original supporting colour **#D0C6B6**.

Only `src/index.css` changes application behaviour after the frozen F11 cut; `e2e/pricing-consent-contrast.spec.ts` adds focused verification. Three browser cases pass: light1440 desktop, light390 mobile, and dark412 regression. Measured normal text/Decline contrast is **12.31:1** in light mode; privacy link is **14.32:1**. Dark-mode text/link/Decline remain **9.54:1**. Readbacks conservatively composite the existing translucent banner over white, rather than assuming a favourable backing colour. Hover/focus text also exceeds4.5:1. Banner height remains **77px desktop /133px mobile** through state changes. Decline still stores `declined` and dismisses the banner. Lint and the standalone TypeScript/build/static-generation checks pass.

- [Light desktop](evidence/consent-light-1440.png)
- [Light mobile](evidence/consent-light-390.png)
- [Dark regression](evidence/consent-dark-412.png)
- [Full colour/contrast/geometry receipt](receipt.json)

The original **Fraunces-LICENSE.txt** and **HankenGrotesk-LICENSE.txt** SIL OFL notices were already tracked in `public/fonts`. The parent [font provenance](../font-provenance.json) records their exact paths and SHA256 alongside each unmodified WOFF2 file's original URL/hash; no replacement or missing notice is assumed.

No consent semantics, analytics firing, theme preference, layout, quote/PDF logic, pricing or branding changed. The banner is never hidden to improve metrics. Prepared for the existing independent review/publication process; **not published**.
