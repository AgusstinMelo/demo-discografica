// Fechas, números y pequeñas utilidades compartidas.

export const DAY = 864e5;

/** Hoy a mediodía (evita saltos de día por zona horaria) */
export const TODAY = (() => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
})();

export const addDays = (n: number) => new Date(TODAY.getTime() + n * DAY);
export const iso = (d: Date | string) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};
export const TODAY_ISO = iso(TODAY);
export const parseDay = (s: string) => new Date(s + "T12:00:00");

export const fmtDate = (s: string) => parseDay(s).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
export const fmtDateLong = (s: string) => parseDay(s).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
export const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
export const fmtNum = (n: number) => new Intl.NumberFormat("es-ES").format(n);
export const fmtCompact = (n: number) => new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 }).format(n);
export const fmtEur = (n: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export const daysUntil = (s: string) => Math.ceil((new Date(s + "T23:59:59").getTime() - Date.now()) / DAY);

export const isEmail = (v: string) => /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i.test(String(v).trim());
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("");

/** Hash FNV-1a: semilla estable para portadas y cifras (mismos datos en cada visita) */
export function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generador pseudoaleatorio con semilla */
export function seeded(seed: string | number) {
  let t = hashStr(String(seed));
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Descarga un archivo generado en el navegador */
export function downloadFile(name: string, content: string, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const greeting = () => {
  const h = new Date().getHours();
  return h < 7 ? "Buenas noches" : h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
};
