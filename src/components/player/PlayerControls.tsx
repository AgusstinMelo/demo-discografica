import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";
import { getTrack } from "../../lib/catalog";
import { fmtTime } from "../../lib/format";
import { player, useIsActive, useIsPlaying, usePosition } from "../../lib/player";
import { Icon } from "../Icon";

interface PlayButtonProps {
  tid: string;
  /** Con texto se pinta como botón normal («Escuchar» → «Pausar») */
  label?: string;
  className?: string;
  ariaLabel?: string;
}

export function PlayButton({ tid, label, className = "icon-btn", ariaLabel }: PlayButtonProps) {
  const on = useIsPlaying(tid);
  const big = /\bbtn\b|cover-play/.test(className);
  const title = getTrack(tid)?.title ?? "";
  return (
    <button
      type="button"
      className={className}
      aria-pressed={on}
      aria-label={label ? undefined : (ariaLabel ?? `${on ? "Pausar" : "Reproducir"} ${title}`)}
      onClick={() => player.toggle(tid)}
    >
      <Icon name={on ? "pause" : "play"} size={big ? 18 : 16} />
      {label && <span>{on ? "Pausar" : label}</span>}
    </button>
  );
}

/** Barra de progreso: clic para saltar, flechas ±5 s, Inicio/Fin */
export function ProgressBar({ tid }: { tid: string }) {
  const pos = usePosition(tid);
  const t = getTrack(tid);
  if (!t) return null;
  const p = pos / t.dur;

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    player.seek(tid, (e.clientX - r.left) / r.width);
  };
  const onKey = (e: KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const to = e.key === "Home" ? 0 : e.key === "End" ? t.dur - 1 : pos + (e.key === "ArrowRight" ? 5 : -5);
    player.seek(tid, to / t.dur);
  };

  return (
    <div
      className="progress"
      role="slider"
      tabIndex={0}
      aria-label="Progreso de la canción"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p * 100)}
      aria-valuetext={`${fmtTime(pos)} de ${fmtTime(t.dur)}`}
      onClick={onClick}
      onKeyDown={onKey}
    >
      <span className="progress-fill" style={{ "--p": p } as CSSProperties} />
    </div>
  );
}

export function TimeLabel({ tid }: { tid: string }) {
  return <>{fmtTime(usePosition(tid))}</>;
}

/** Fila de una lista de pistas: se resalta cuando es la pista activa */
export function TrackRow({ tid, className = "", children }: { tid: string; className?: string; children: ReactNode }) {
  const active = useIsActive(tid);
  const playing = useIsPlaying(tid);
  return <li className={`${className} ${active ? "is-active" : ""} ${active && !playing ? "paused" : ""}`}>{children}</li>;
}
