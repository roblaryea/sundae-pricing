# Pricing Site — Color System (warm-signature parity)

The pricing site follows the **same warm-signature role system as the main
website**. The canonical rules live in the website repo at
`sundae-website/docs/COLOR_SYSTEM.md` — read that first. This note records how
the rules map onto this Vite + Tailwind-v4 codebase.

## Where the tokens live

[`src/index.css`](../src/index.css) — the `@theme` block + the `.light` override
block. Brand colors are the `sundae-*` scale (`--color-sundae-*`); fonts are
Hanken Grotesk (body) + Fraunces (display).

## The roles (same five as the website)

| Role | Token | Use |
|------|-------|-----|
| Foundation | `--color-sundae-dark` `--color-sundae-surface` `--color-ink` | backgrounds, surfaces |
| Action | `--color-sundae-accent` (`#FF5C4D`) `--color-sundae-cherry` | CTAs, active states, the price/“act now” moment |
| Warmth | `--color-sundae-core-lite` (`#E9A24A`) | optimism / savings highlights |
| Canvas | `--color-cream` | relief surfaces, light-mode wash |
| Tier taxonomy | `--color-sundae-report-*`, `--color-sundae-core-*`, `enterprise`, `watchtower` | tier identity ONLY — never brand chrome |

## Rules specific to this codebase

1. **No cool slate.** Tailwind's default `slate` ramp is COOL (blue-grey). This
   repo **overrides the entire `--color-slate-*` ramp to a warm neutral** in the
   `@theme` block, so every `text-slate-*` / `bg-slate-*` / `border-slate-*`
   (and the `.light` remaps that lean on slate) reads warm. Do not reintroduce
   cool greys (`gray-*`, `zinc-*`) for muted text/surfaces — use `sundae-muted`
   or the warm slate ramp.
2. **Text tokens are warm.** `--color-sundae-text` is `#FBF8F4` (warm off-white)
   in dark / `#15110D` in light — never the old cool `#F8FAFC`.
3. **Eyebrows / small labels = `text-sundae-muted`**, not coral. Coral is the
   rationed action color (CTAs, active states, the price moment). A coral label
   on every block is the failure mode.
4. **Tier colors stay taxonomy.** Report/Core/Enterprise/Watchtower colors
   identify tiers only; never promote them to section chrome or brand.
5. **Verify both themes.** The site has a light/dark toggle (`.light` class).
   Every color change must hold in both.
