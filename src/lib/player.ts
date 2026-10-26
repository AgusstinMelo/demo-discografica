// Reproductor simulado: sin audio real, el progreso avanza en tiempo real con requestAnimationFrame.
// API REAL: usar un elemento <audio> con previews de 30 s (p. ej. desde Supabase Storage).
import { useSyncExternalStore } from "react";
import { getTrack, type ResolvedTrack } from "./catalog";

interface PlayerState {
  track: ResolvedTrack | null;
  pos: number; // segundos
  playing: boolean;
}

let state: PlayerState = { track: null, pos: 0, playing: false };
let last = 0;
let raf = 0;
const listeners = new Set<() => void>();

const set = (patch: Partial<PlayerState>) => {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn());
};

function tick(now: number) {
  const t = state.track;
  if (!t) return;
  const pos = state.pos + (now - last) / 1000;
  last = now;
  if (pos >= t.dur) {
    // Autoavance dentro del mismo lanzamiento
    const [rid, i] = t.id.split(":");
    const next = getTrack(`${rid}:${Number(i) + 1}`);
    if (next) {
      set({ track: next, pos: 0 });
      raf = requestAnimationFrame(tick);
    } else {
      set({ pos: t.dur, playing: false });
    }
    return;
  }
  set({ pos });
  raf = requestAnimationFrame(tick);
}

function resume() {
  if (!state.track) return;
  cancelAnimationFrame(raf);
  last = performance.now();
  set({ playing: true, pos: state.pos >= state.track.dur ? 0 : state.pos });
  raf = requestAnimationFrame(tick);
}

export const player = {
  toggle(tid: string) {
    if (state.track?.id === tid) return state.playing ? player.pause() : resume();
    const t = getTrack(tid);
    if (!t) return;
    set({ track: t, pos: 0 });
    resume();
  },
  pause() {
    cancelAnimationFrame(raf);
    set({ playing: false });
  },
  close() {
    cancelAnimationFrame(raf);
    set({ track: null, pos: 0, playing: false });
  },
  seek(tid: string, ratio: number) {
    const t = state.track?.id === tid ? state.track : getTrack(tid);
    if (!t) return;
    set({ track: t, pos: Math.max(0, Math.min(1, ratio)) * t.dur });
    if (!state.playing) resume();
  },
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};

/** Suscribe un componente a una parte del estado; solo se re-renderiza si esa parte cambia. */
export function usePlayer<T>(select: (s: PlayerState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}

/** ¿Está sonando esta pista? */
export const useIsPlaying = (tid: string) => usePlayer((s) => s.playing && s.track?.id === tid);
/** ¿Es la pista activa (sonando o en pausa)? */
export const useIsActive = (tid: string) => usePlayer((s) => s.track?.id === tid);
/** Posición en segundos de esta pista (0 si no es la activa) */
export const usePosition = (tid: string) => usePlayer((s) => (s.track?.id === tid ? s.pos : 0));
