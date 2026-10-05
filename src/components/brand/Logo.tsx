/**
 * BuildCalc Pro — Brand mark.
 *
 * The mark: a navy rounded square holding three ascending measuring bars
 * over a ruler baseline — measurement + calculation in one glyph.
 * Geometric, no fine detail: legible from 16px favicon to hero sizes.
 *
 * Colors are locked to the brand board:
 *   navy #14284A · orange #ED7D22 · white #FFFFFF
 */

export const BRAND_NAVY = "#14284A";
export const BRAND_ORANGE = "#ED7D22";

export function BrandMark({
  size = 36,
  className,
  title = "BuildCalc Pro",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <rect x="2" y="2" width="60" height="60" rx="15" fill={BRAND_NAVY} />
      {/* ascending measuring bars */}
      <rect x="15" y="34" width="9" height="13" rx="2" fill={BRAND_ORANGE} />
      <rect x="27.5" y="26" width="9" height="21" rx="2" fill={BRAND_ORANGE} />
      <rect x="40" y="18" width="9" height="29" rx="2" fill={BRAND_ORANGE} />
      {/* ruler baseline with tick marks */}
      <rect x="13" y="50" width="38" height="4.5" rx="2.25" fill="#FFFFFF" />
      <rect x="17" y="42" width="3" height="6" rx="1.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="29.5" y="42" width="3" height="6" rx="1.5" fill="#FFFFFF" opacity="0.85" />
      <rect x="42" y="42" width="3" height="6" rx="1.5" fill="#FFFFFF" opacity="0.85" />
    </svg>
  );
}

export function Logo({
  size = 36,
  className,
  wordmarkClassName,
  compact = false,
}: {
  size?: number;
  className?: string;
  wordmarkClassName?: string;
  /** Hide the wordmark (mark only) — for tight mobile headers. */
  compact?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <BrandMark size={size} />
      {!compact && (
        <span
          className={`font-display text-xl font-extrabold uppercase leading-none tracking-wide text-[#14284A] ${wordmarkClassName ?? ""}`}
        >
          BuildCalc
          <span className="ml-1.5 rounded bg-[#ED7D22] px-1.5 py-0.5 align-middle text-[11px] font-extrabold tracking-widest text-white">
            PRO
          </span>
        </span>
      )}
    </span>
  );
}
