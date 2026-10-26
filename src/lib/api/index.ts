// Elige el backend: Supabase si hay variables de entorno, si no, modo local (localStorage).
// Cada escritura avisa a los hooks useData para que vuelvan a pedir los datos.
import { localApi } from "./local";
import { createSupabaseApi } from "./supabase";
import type { Api } from "./types";

export * from "./types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const backend: Api = url && anonKey ? createSupabaseApi(url, anonKey) : localApi;

const listeners = new Set<() => void>();
export const onDataChange = (fn: () => void) => {
  listeners.add(fn);
  return () => void listeners.delete(fn);
};
export const invalidate = () => listeners.forEach((fn) => fn());

const READS = new Set<keyof Api>(["mode", "getSession", "signIn", "signOut", "listSubscribers", "listCampaigns", "listAutomations", "listAutomationLog", "listMessages", "listContracts", "listContractEvents"]);

export const api: Api = Object.fromEntries(
  Object.entries(backend).map(([key, value]) => {
    if (READS.has(key as keyof Api) || typeof value !== "function") return [key, value];
    return [
      key,
      async (...args: unknown[]) => {
        const result = await value(...args);
        invalidate();
        return result;
      },
    ];
  }),
) as unknown as Api;
