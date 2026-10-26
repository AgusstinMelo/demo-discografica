// Datos técnicos que acompañan a una firma: navegador, IP y huella SHA-256.
import { hashStr } from "./format";
import type { ClientInfo } from "./api/types";

export function parseUA(ua = navigator.userAgent) {
  let browser = "Desconocido";
  let os = "Desconocido";
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Edg\/(\d+)/))) browser = "Microsoft Edge " + m[1];
  else if ((m = ua.match(/OPR\/(\d+)/))) browser = "Opera " + m[1];
  else if ((m = ua.match(/Firefox\/(\d+)/))) browser = "Firefox " + m[1];
  else if ((m = ua.match(/Chrome\/(\d+)/))) browser = "Google Chrome " + m[1];
  else if ((m = ua.match(/Version\/(\d+).*Safari/))) browser = "Safari " + m[1];
  if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
  else if ((m = ua.match(/Windows NT ([\d.]+)/))) os = "Windows NT " + m[1];
  else if ((m = ua.match(/iPhone OS ([\d_]+)/)) || (m = ua.match(/CPU OS ([\d_]+)/))) os = "iOS " + m[1].replace(/_/g, ".");
  else if ((m = ua.match(/Android ([\d.]+)/))) os = "Android " + m[1];
  else if ((m = ua.match(/Mac OS X ([\d_]+)/))) os = "macOS " + m[1].replace(/_/g, ".");
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";
  return { browser, os };
}

export function clientInfo(): ClientInfo {
  const off = -new Date().getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  return {
    ...parseUA(),
    language: (navigator.languages || [navigator.language]).join(", "),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Desconocida",
    utcOffset: `${sign}${String(Math.floor(Math.abs(off) / 60)).padStart(2, "0")}:${String(Math.abs(off) % 60).padStart(2, "0")}`,
    screen: `${screen.width} × ${screen.height} px (densidad ${window.devicePixelRatio || 1}x)`,
  };
}

/** Solo modo local. Con Supabase la IP la registra el servidor desde la cabecera de la petición. */
export async function getPublicIP() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch("https://api.ipify.org?format=json", { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    const j = await res.json();
    if (j?.ip) return { ip: j.ip as string, source: "api.ipify.org" };
  } catch {
    /* sin conexión o bloqueado: usamos una IP ficticia */
  }
  return { ip: "203.0.113." + (10 + Math.floor(Math.random() * 200)), source: "IP ficticia, ipify no disponible" };
}

/** Solo modo local. Con Supabase el hash se calcula en el servidor (pgcrypto). */
export async function sha256(text: string) {
  if (window.crypto?.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return { hex: [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""), algo: "SHA-256 (Web Crypto API)" };
  }
  // Alternativa no criptográfica si el navegador no expone Web Crypto (contexto no seguro)
  let out = "";
  for (let i = 0; i < 8; i++) out += hashStr(i + "|" + text).toString(16).padStart(8, "0");
  return { hex: out, algo: "FNV-1a ×8 (Web Crypto no disponible en este contexto)" };
}
