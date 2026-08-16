/**
 * The PolyCarp mark: three chain units, the middle one the second comonomer.
 * A copolymer is two repeat units in one chain, so the mark is the site's own
 * subject rather than a picture of it — and at 16 px it still reads as three
 * shapes because the middle one carries the other colour.
 * @param root0 - Component props.
 * @param root0.size - Rendered edge length in pixels.
 * @default 24
 */
export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="PolyCarp"
    >
      <path
        d="M6 22.5 16 9.5 26 22.5"
        stroke="var(--brand)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="6" cy="22.5" r="5" fill="var(--brand)" />
      <circle cx="26" cy="22.5" r="5" fill="var(--brand)" />
      <circle cx="16" cy="9.5" r="6" fill="var(--brand-alt)" />
    </svg>
  );
}

/**
 * The site name in the two colours it owns. `PolyCarp` splits on itself, so it
 * carries no domain suffix.
 * @param root0 - Component props.
 * @param root0.className - Extra class names for the wrapping span.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className ? `wordmark ${className}` : 'wordmark'}>
      <span className="wordmark__lead">Poly</span>
      <span className="wordmark__alt">Carp</span>
    </span>
  );
}
