import { useCallback, useEffect, useRef, useState } from "react";
import { onDataChange } from "../lib/api";

/**
 * Carga datos del backend y los vuelve a pedir cada vez que se escribe algo
 * (api.* avisa con invalidate()). `deps` funciona como en useEffect.
 */
export function useData<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const loadRef = useRef(load);
  loadRef.current = load;

  const reload = useCallback(() => {
    let alive = true;
    loadRef.current().then(
      (d) => {
        if (!alive) return;
        setData(d);
        setError(null);
      },
      (e: Error) => {
        if (alive) setError(e.message);
      },
    );
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const cancel = reload();
    const off = onDataChange(reload);
    return () => {
      cancel();
      off();
    };
  }, deps);

  return { data, error, loading: data === undefined && !error, reload };
}
