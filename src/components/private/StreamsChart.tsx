import type { MonthPoint } from "../../lib/catalog";
import { fmtCompact, fmtNum } from "../../lib/format";

/** Barras de streams por mes (SVG). Pasa el ratón o enfoca una barra para ver el valor. */
export function StreamsChart({ data }: { data: MonthPoint[] }) {
  const W = 720, H = 280, pl = 52, pr = 8, pt = 24, pb = 30, n = data.length;
  const rawMax = Math.max(...data.map((d) => d.v));
  const step = Math.pow(10, Math.floor(Math.log10(rawMax))) / 2;
  const max = Math.ceil(rawMax / step) * step;
  const bw = (W - pl - pr) / n;
  const y = (v: number) => pt + (H - pt - pb) * (1 - v / max);

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Streams por mes, últimos 12 meses">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const v = max * f;
          return (
            <g key={f}>
              <line className="grid-l" x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} />
              <text className="axis-t" x={pl - 10} y={y(v) + 4} textAnchor="end">
                {fmtCompact(v)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = pl + i * bw + bw * 0.18, w = bw * 0.64, last = i === n - 1;
          const label = `${d.label} ${d.year}: ${fmtNum(d.v)} streams`;
          return (
            <g key={i} className={`b ${last ? "last" : ""}`} tabIndex={0} role="img" aria-label={label}>
              <title>{label}</title>
              <rect className={`bar ${last ? "last" : ""}`} x={x} y={y(d.v)} width={w} height={H - pb - y(d.v)} rx="4" style={{ animationDelay: `${i * 45}ms` }} />
              <text className="val" x={x + w / 2} y={y(d.v) - 7} textAnchor="middle">
                {fmtCompact(d.v)}
              </text>
              <text className="axis-t" x={x + w / 2} y={H - 10} textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
