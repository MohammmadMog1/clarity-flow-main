/** The app's mark: an aperture-like ring with a gap and a center point — focus, not decoration. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <circle
        cx="16"
        cy="16"
        r="11"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="49 20.1"
        transform="rotate(-38 16 16)"
      />
      <circle cx="16" cy="16" r="2.75" fill="currentColor" />
    </svg>
  );
}
