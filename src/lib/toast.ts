// Notificaciones tipo toast. Se lanzan con toast("texto", "ok" | "info" | "warn" | "err").
import { useSyncExternalStore, type ReactNode } from "react";

export type ToastType = "ok" | "info" | "warn" | "err";
export interface Toast {
  id: number;
  message: ReactNode;
  type: ToastType;
  leaving: boolean;
}

let toasts: Toast[] = [];
let seq = 0;
const listeners = new Set<() => void>();
const emit = (next: Toast[]) => {
  toasts = next;
  listeners.forEach((fn) => fn());
};

export function toast(message: ReactNode, type: ToastType = "ok", ms = 4200) {
  const id = ++seq;
  emit([...toasts, { id, message, type, leaving: false }]);
  setTimeout(() => {
    emit(toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => emit(toasts.filter((t) => t.id !== id)), 300);
  }, ms);
}

export const useToasts = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    () => toasts,
  );
