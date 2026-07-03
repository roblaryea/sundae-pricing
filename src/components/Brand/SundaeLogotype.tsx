import type { CSSProperties } from 'react';

/**
 * The Sundae logotype - the rebrand's primary register: a clean Fraunces
 * wordmark. Ported from the marketing site (src/components/ui/SundaeLogotype.tsx)
 * so the mark + wordmark lockup matches across marketing, pricing, and app.
 *
 * Color is supplied by the caller via `className` (e.g. "text-white") and size
 * via a text-[..] utility, so the same component scales across surfaces.
 */
export function SundaeLogotype({
  className = '',
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-label="Sundae"
      className={`block select-none leading-none tracking-[-0.018em] ${className}`}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        fontOpticalSizing: 'none',
        fontVariationSettings: "'opsz' 144",
        ...style,
      }}
    >
      sundae
    </span>
  );
}
