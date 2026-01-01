'use client';

// Clean SVG paths for zodiac symbols (no backgrounds, just the symbol paths)
// These match the style from 42Z_zodiac6.eps

export const ZODIAC_SVG_PATHS: Record<string, React.ReactNode> = {
  Aries: (
    <path
      d="M12 22V8c0-3.5-2.5-6-6-6M12 8c0-3.5 2.5-6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
  Taurus: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="16" r="6" />
      <path d="M6 6c0-2.5 2-4 6-4s6 1.5 6 4" />
    </g>
  ),
  Gemini: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 2h12M6 22h12M8 2v20M16 2v20" />
    </g>
  ),
  Cancer: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="7" cy="9" r="3" />
      <circle cx="17" cy="15" r="3" />
      <path d="M10 9h10c0 4-2 6-6 6M14 15H4c0-4 2-6 6-6" />
    </g>
  ),
  Leo: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="8" cy="8" r="4" />
      <path d="M12 8c0 6-2 10-2 14M10 22c4 0 8-2 8-6s-4-4-4 0" />
    </g>
  ),
  Virgo: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 2v12c0 4 2 6 4 6M8 2v16M12 2v12c0 4 2 6 4 2" />
      <path d="M16 14c2 4 4 2 4-2v-2M18 10h4" />
    </g>
  ),
  Libra: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 20h16M4 14h16" />
      <path d="M12 14V8" />
      <path d="M6 8c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </g>
  ),
  Scorpio: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 2v12c0 4 2 6 4 6M8 2v16M12 2v12c0 4 2 6 4 6" />
      <path d="M16 18l4 4M20 18v4h-4" />
    </g>
  ),
  Sagittarius: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 20L20 4M20 4h-8M20 4v8M8 12l4 4" />
    </g>
  ),
  Capricorn: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 2v14c0 2 2 4 4 4s4-2 4-4V6c0-2-1-4-4-4" />
      <circle cx="18" cy="18" r="4" />
      <path d="M14 12c2 0 4 2 4 6" />
    </g>
  ),
  Aquarius: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 8l4 4 4-4 4 4 4-4 4 4" />
      <path d="M2 16l4 4 4-4 4 4 4-4 4 4" />
    </g>
  ),
  Pisces: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 2c-4 4-4 16 0 20M16 2c4 4 4 16 0 20M4 12h16" />
    </g>
  ),
};

interface ZodiacSymbolProps {
  sign: string;
  size?: number;
  className?: string;
}

export function ZodiacSymbol({ sign, size = 24, className = '' }: ZodiacSymbolProps) {
  const path = ZODIAC_SVG_PATHS[sign];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible' }}
    >
      {path}
    </svg>
  );
}
