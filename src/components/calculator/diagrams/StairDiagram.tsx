/**
 * BuildCalc Pro — Stair stringer diagram (SVG).
 *
 * Sawtooth stringer profile with dimension callouts: total rise, total run,
 * unit riser/tread, and stringer cut length. Updates live with the inputs.
 */
export function StairDiagram({
  totalRiseIn,
  totalRunIn,
  riserCount,
  unitRiseIn,
  unitRunIn,
  stringerLengthIn,
}: {
  totalRiseIn: number;
  totalRunIn: number;
  riserCount: number;
  unitRiseIn: number;
  unitRunIn: number;
  stringerLengthIn: number;
}) {
  if (totalRiseIn <= 0 || totalRunIn <= 0 || riserCount <= 0) return null;

  const W = 380;
  const H = 230;
  const padL = 46;
  const padB = 34;
  const padT = 16;
  const padR = 12;
  const dw = W - padL - padR;
  const dh = H - padT - padB;
  const sx = dw / totalRunIn;
  const sy = dh / totalRiseIn;
  const s = Math.min(sx, sy);
  const runPx = totalRunIn * s;
  const risePx = totalRiseIn * s;
  const x0 = padL + (dw - runPx) / 2;
  const yBase = padT + dh;

  // Sawtooth path: up (riser), right (tread), repeated.
  const stepRisePx = risePx / riserCount;
  const treadCount = Math.max(0, riserCount - 1);
  const stepRunPx = treadCount > 0 ? runPx / treadCount : runPx;
  let d = `M ${x0} ${yBase}`;
  let x = x0;
  let y = yBase;
  for (let i = 0; i < riserCount; i++) {
    y -= stepRisePx;
    d += ` L ${x} ${y}`;
    if (i < treadCount) {
      x += stepRunPx;
      d += ` L ${x} ${y}`;
    }
  }
  const xEnd = x;
  const yTop = y;

  // Stringer board: parallel line below the sawtooth.
  const boardOffset = 14;
  const hyp = Math.hypot(runPx, risePx);
  const ang = Math.atan2(risePx, runPx);

  return (
    <figure
      className="overflow-hidden rounded-xl border border-border bg-zinc-950 p-3"
      aria-label="Stair stringer diagram"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Stair with ${riserCount} risers at ${unitRiseIn} inches and ${treadCount} treads at ${unitRunIn} inches`}
      >
        {/* ground + landing lines */}
        <line
          x1={x0 - 14}
          y1={yBase}
          x2={xEnd + 14}
          y2={yBase}
          stroke="#5a6c85"
          strokeWidth={2}
        />
        <line
          x1={xEnd}
          y1={yTop}
          x2={xEnd + 14}
          y2={yTop}
          stroke="#5a6c85"
          strokeWidth={2}
        />

        {/* stringer board (under the sawtooth) */}
        <line
          x1={x0 + boardOffset * Math.sin(ang)}
          y1={yBase + boardOffset * Math.cos(ang)}
          x2={xEnd + boardOffset * Math.sin(ang)}
          y2={yTop + boardOffset * Math.cos(ang)}
          stroke="#14284a"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.9}
        />

        {/* sawtooth cut */}
        <path d={d} fill="none" stroke="#ed7d22" strokeWidth={2.5} />

        {/* total rise dimension (left) */}
        <line
          x1={x0 - 18}
          y1={yBase}
          x2={x0 - 18}
          y2={yTop}
          stroke="#8fa1b8"
          strokeWidth={1}
        />
        <text
          x={x0 - 24}
          y={(yBase + yTop) / 2}
          fill="#5a6c85"
          fontSize={11}
          textAnchor="middle"
          transform={`rotate(-90 ${x0 - 24} ${(yBase + yTop) / 2})`}
          fontFamily="monospace"
        >
          {totalRiseIn.toFixed(1)}&Prime;
        </text>

        {/* total run dimension (bottom) */}
        <text
          x={(x0 + xEnd) / 2}
          y={H - 10}
          fill="#5a6c85"
          fontSize={11}
          textAnchor="middle"
          fontFamily="monospace"
        >
          run {totalRunIn.toFixed(1)}&Prime;
        </text>

        {/* unit riser callout (first riser) */}
        <text
          x={x0 + 6}
          y={yBase - stepRisePx / 2 + 4}
          fill="#fbbf24"
          fontSize={10}
          fontFamily="monospace"
        >
          {unitRiseIn}&Prime;
        </text>
        {/* unit tread callout (first tread) */}
        <text
          x={x0 + stepRunPx / 2}
          y={yBase - stepRisePx - 6}
          fill="#fbbf24"
          fontSize={10}
          textAnchor="middle"
          fontFamily="monospace"
        >
          {unitRunIn}&Prime;
        </text>

        {/* stringer length along hypotenuse */}
        <text
          x={(x0 + xEnd) / 2 + 10}
          y={(yBase + yTop) / 2 + 16}
          fill="#f59e0b"
          fontSize={10}
          textAnchor="middle"
          fontFamily="monospace"
          transform={`rotate(${-((ang * 180) / Math.PI)} ${(x0 + xEnd) / 2 + 10} ${(yBase + yTop) / 2 + 16})`}
        >
          {(stringerLengthIn / 12).toFixed(2)} ft
        </text>
      </svg>
      <figcaption className="mt-1 text-center text-[11px] text-zinc-500">
        {riserCount} risers &times; {unitRiseIn}&Prime; &nbsp;·&nbsp; {treadCount}{" "}
        treads &times; {unitRunIn}&Prime;
      </figcaption>
    </figure>
  );
}
