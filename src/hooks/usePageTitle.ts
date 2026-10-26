import { useEffect } from "react";
import { config } from "../config";

/** Título de la pestaña: «Página — Nocturna Records» (sin argumento, el de la portada) */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${config.label.name}` : `${config.label.name} — Sello independiente`;
  }, [title]);
}
