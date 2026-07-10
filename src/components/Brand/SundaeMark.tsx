import { useId } from 'react';

/**
 * The Sundae brand mark - the layered-S tile: one smooth vertical cream->clay
 * gradient (no bands) cut into an S, topped by the cherry (the signal). Per the
 * 2026-07 logo handoff. Ported verbatim from the marketing site
 * (src/components/ui/SundaeMark.tsx) so pricing, marketing, and app render one
 * identical mark.
 *
 * `useId()` namespaces the gradient/clip IDs so multiple instances on one page
 * don't collide.
 */
export function SundaeMark({
  size = 30,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Sundae"
    >
      <defs>
        <clipPath id={`c${uid}`}>
          <rect width="200" height="200" rx="44" />
        </clipPath>
        <radialGradient id={`cg${uid}`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#FF6E5E" />
          <stop offset="1" stopColor="#D8313C" />
        </radialGradient>
        <linearGradient id={`hd${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6F1E8" />
          <stop offset="0.15" stopColor="#F6C66B" />
          <stop offset="0.33" stopColor="#E9A24A" />
          <stop offset="0.52" stopColor="#F7A088" />
          <stop offset="0.68" stopColor="#FF5C4D" />
          <stop offset="0.84" stopColor="#E03E48" />
          <stop offset="1" stopColor="#B23A1E" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#c${uid})`}>
        <rect width="200" height="200" fill="#171210" />
        <path
          d="M118,46 C100,41 72,45 72,74 C72,103 140,104 140,139 C140,171 74,172 69,149"
          fill="none"
          stroke={`url(#hd${uid})`}
          strokeWidth="32"
          strokeLinecap="round"
        />
        <path
          d="M140,36 C145,24 153,20 160,12"
          stroke="#7d1f12"
          strokeWidth="4.5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="140" cy="50" r="16" fill={`url(#cg${uid})`} />
      </g>
    </svg>
  );
}
