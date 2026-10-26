import { memo, useId, type ReactNode } from "react";
import { seeded } from "../lib/format";

// Portadas abstractas generadas con SVG a partir de una semilla (sin imágenes externas).
// API REAL: sustituir por <img src={release.coverUrl}> cuando haya portadas reales.
const PALETTES = [
  ["#ffb238", "#ff4d6d", "#160b10"], ["#00d1b2", "#3b1d8f", "#0a0916"], ["#ff7a18", "#af002d", "#120506"],
  ["#8b5cf6", "#22d3ee", "#0b0a1a"], ["#f72585", "#4361ee", "#0a0620"], ["#e9c46a", "#2a9d8f", "#08161a"],
  ["#ff6b6b", "#ffd93d", "#1a0b0b"], ["#a8dadc", "#e63946", "#0d1b2a"], ["#c3f73a", "#0f766e", "#07130f"],
];

const rep = (n: number, fn: (i: number) => ReactNode) => Array.from({ length: n }, (_, i) => fn(i));

interface Props {
  seed: string;
  label?: string;
  withText?: boolean;
}

export const CoverArt = memo(function CoverArt({ seed, label = "", withText = true }: Props) {
  const id = useId().replace(/:/g, "");
  const r = seeded(seed);
  const p = PALETTES[Math.floor(r() * PALETTES.length)];
  const kind = Math.floor(r() * 6);

  let shapes: ReactNode;
  switch (kind) {
    case 0: {
      // Sol retro cortado por franjas
      const cx = 30 + r() * 40, cy = 34 + r() * 18, rad = 22 + r() * 10;
      shapes = (
        <>
          <circle cx={cx} cy={cy} r={rad} fill={`url(#${id}r)`} />
          {rep(7, (i) => <rect key={i} x="0" y={cy + 3 + i * 4.6} width="100" height={0.8 + i * 0.55} fill={p[2]} />)}
        </>
      );
      break;
    }
    case 1: {
      // Anillos concéntricos
      const cx = 50 + (r() - 0.5) * 36, cy = 50 + (r() - 0.5) * 36;
      shapes = rep(10, (i) => (
        <circle key={i} cx={cx} cy={cy} r={5 + i * 7} fill="none" stroke={i % 2 ? p[0] : p[1]} strokeWidth={1 + r() * 2.6} opacity={1 - i * 0.07} />
      ));
      break;
    }
    case 2: {
      // Diagonales
      const ang = [-45, -30, 30, 45, 60][Math.floor(r() * 5)];
      shapes = (
        <g transform={`rotate(${ang} 50 50)`}>
          {rep(16, (i) => <rect key={i} x={-60 + i * 14} y="-60" width={3 + r() * 6} height="220" fill={i % 3 ? p[0] : p[1]} opacity={0.35 + r() * 0.6} />)}
        </g>
      );
      break;
    }
    case 3:
      // Rejilla de puntos
      shapes = rep(64, (i) => (
        <circle key={i} cx={8 + (i % 8) * 12} cy={8 + Math.floor(i / 8) * 12} r={0.8 + r() * 4.6} fill={(i + Math.floor(i / 8)) % 2 ? p[0] : p[1]} />
      ));
      break;
    case 4:
      // Ondas
      shapes = rep(11, (i) => {
        const y = 8 + i * 8.5, a = 4 + r() * 10;
        return <path key={i} d={`M-5 ${y} Q 20 ${y - a} 45 ${y} T 95 ${y} T 145 ${y}`} fill="none" stroke={i % 2 ? p[0] : p[1]} strokeWidth={1.2 + r() * 2} />;
      });
      break;
    default:
      // Arco y bloques
      shapes = (
        <>
          <path d="M0 100 A 50 50 0 0 1 100 100 Z" fill={p[0]} />
          <rect x={12 + r() * 40} y={10 + r() * 22} width={22 + r() * 22} height={22 + r() * 22} fill={p[1]} opacity=".9" transform={`rotate(${r() * 30 - 15} 50 50)`} />
          <circle cx={20 + r() * 60} cy={62 + r() * 18} r={4 + r() * 6} fill={p[2]} />
        </>
      );
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Portada${label ? ": " + label : ""}`}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p[2]} />
          <stop offset="1" stopColor={p[1]} stopOpacity=".5" />
        </linearGradient>
        <radialGradient id={`${id}r`} cx=".35" cy=".35">
          <stop offset="0" stopColor={p[0]} />
          <stop offset="1" stopColor={p[1]} />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={p[2]} />
      <rect width="100" height="100" fill={`url(#${id}b)`} />
      {shapes}
      <rect width="100" height="100" filter="url(#grain)" opacity=".16" />
      {withText && (
        <>
          <text x="7" y="12" fontFamily="Syne,sans-serif" fontSize="5" fontWeight="800" fill="#fff" opacity=".8" letterSpacing=".6">NOCTURNA</text>
          <text x="93" y="94" textAnchor="end" fontFamily="ui-monospace,monospace" fontSize="3.6" fill="#fff" opacity=".65">{seed.toUpperCase().slice(0, 8)}</text>
        </>
      )}
    </svg>
  );
});

/** Filtro de grano compartido por todas las portadas (se monta una vez en App) */
export function CoverDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0" />
      </filter>
    </svg>
  );
}
