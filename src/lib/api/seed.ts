// Datos iniciales del modo local. Son los mismos que siembra seed_demo() en
// supabase/migrations/0001_schema.sql: si cambias uno, cambia el otro.
import { addDays, iso } from "../format";
import type { Automation, AutomationKey, AutomationLog, Campaign, ContactMessage, Contract, ContractEvent, Subscriber } from "./types";

const ago = (days: number) => addDays(-days).toISOString();

export const seedSubscribers = (): Subscriber[] =>
  (
    [
      ["lucia.moreno@example.com", "Lucía Moreno", 2, "web"],
      ["javi.ortega@example.org", "Javier Ortega", 4, "web"],
      ["carla.nieto@example.net", "Carla Nieto", 7, "concierto"],
      ["pablo.serrano@example.com", "Pablo Serrano", 9, "web"],
      ["ainhoa.goikoetxea@example.org", "Ainhoa Goikoetxea", 12, "importado"],
      ["marc.puig@example.com", "Marc Puig", 15, "web"],
      ["elena.vidal@example.net", "Elena Vidal", 21, "concierto"],
      ["hugo.campos@example.com", "Hugo Campos", 26, "web"],
      ["sara.lopez@example.org", "Sara López", 33, "web"],
      ["dani.ferrer@example.com", "Dani Ferrer", 40, "importado"],
      ["noelia.ramos@example.net", "Noelia Ramos", 48, "web"],
      ["ivan.castro@example.com", "Iván Castro", 55, "concierto"],
      ["paula.mendez@example.org", "Paula Méndez", 63, "web"],
      ["alex.rubio@example.com", "Álex Rubio", 77, "importado"],
      ["marina.soler@example.net", "Marina Soler", 90, "web"],
    ] as const
  ).map(([email, name, d, source], i) => ({
    id: "s" + i,
    email,
    name,
    source,
    createdAt: ago(d),
    status: i === 13 ? "unsubscribed" : "active",
  }));

export const seedCampaigns = (): Campaign[] => [
  { id: "cmp-4", subject: "Ya disponible: «Mareas de Neón» de Luna Vega", sentAt: ago(9), sent: 14, opens: 8, clicks: 3 },
  { id: "cmp-3", subject: "Agenda de otoño: todas las fechas del sello", sentAt: ago(38), sent: 13, opens: 6, clicks: 2 },
  { id: "cmp-2", subject: "Seda, el nuevo disco de Inés Marlo", sentAt: ago(60), sent: 12, opens: 7, clicks: 2 },
  { id: "cmp-1", subject: "Nocturna Summer Sessions: playlist del verano", sentAt: ago(110), sent: 10, opens: 4, clicks: 1 },
];

export const seedAutomations = (): Record<AutomationKey, Automation> => ({
  welcome: { key: "welcome", enabled: true, sent: 46 },
  release: { key: "release", enabled: true, sent: 5 },
});

export const seedAutomationLog = (): AutomationLog[] => [
  { id: "l2", key: "welcome", text: "Bienvenida enviada a lucia.moreno@example.com", at: ago(2) },
  { id: "l1", key: "release", text: "Aviso de «Mareas de Neón» enviado a 14 contactos", at: ago(9) },
];

export const seedMessages = (): ContactMessage[] => [
  { id: "m1", name: "Clara Duarte", email: "clara.duarte@example.com", reason: "press", createdAt: ago(1), read: false,
    message: "Hola, escribo desde una revista cultural online. Nos gustaría entrevistar a Luna Vega con motivo del lanzamiento de «Mareas de Neón». ¿Con quién puedo coordinarlo?" },
  { id: "m2", name: "Tomás Beltrán", email: "tomas.beltran@example.org", reason: "demo", createdAt: ago(3), read: false,
    message: "Buenas, soy productor de electrónica en Zaragoza. Os dejo un enlace privado con un EP de cuatro temas. Creo que encaja con la línea de Aura Sur y Luna Vega. ¡Gracias por escuchar!" },
  { id: "m3", name: "Festival Mar de Fondo", email: "booking@example.net", reason: "booking", createdAt: ago(8), read: true,
    message: "Queremos cerrar a Fósforo para nuestra edición de primavera. ¿Podéis enviarnos caché, rider y disponibilidad para abril y mayo?" },
];

const day = (n: number) => iso(addDays(n));

export const seedContracts = (): Contract[] => [
  { id: "c-2023-014", artistId: "luna-vega", title: "Contrato de grabación", type: "recording",
    scope: "la grabación, producción y explotación comercial de los álbumes «Ciudad Dormida» y «Mareas de Neón», así como de los sencillos derivados",
    start: day(-1027), end: day(68), royalties: 18, territory: "Mundial", advance: 12000, status: "signed", signedOn: day(-1030),
    signedNote: "Firma electrónica realizada en una versión anterior del portal.", signature: null },
  { id: "c-2026-041", artistId: "luna-vega", title: "Contrato de distribución digital", type: "distribution",
    scope: "la distribución digital, gestión de metadatos, entrega a plataformas de streaming y descarga, y monetización de contenido en redes sociales del catálogo de LA ARTISTA",
    start: day(7), end: day(7 + 365 * 3), royalties: 22, territory: "Mundial", advance: 0, status: "pending", signedOn: null, signedNote: null, signature: null },
  { id: "c-2020-007", artistId: "luna-vega", title: "Contrato de edición musical", type: "publishing",
    scope: "la administración y explotación editorial de las composiciones musicales de LA ARTISTA, incluyendo sincronizaciones y derechos de comunicación pública",
    start: day(-1580), end: day(-118), royalties: 15, territory: "España y Latinoamérica", advance: 3000, status: "signed", signedOn: day(-1584),
    signedNote: "Firma manuscrita en papel; el original escaneado está archivado por el sello.", signature: null },
];

export const seedContractEvents = (): ContractEvent[] => [
  { id: "e1", contractId: "c-2020-007", event: "sent", detail: "Por Marta Ríos", at: ago(1590) },
  { id: "e2", contractId: "c-2020-007", event: "signed", detail: "Firma manuscrita en papel (archivo escaneado)", at: ago(1584) },
  { id: "e3", contractId: "c-2023-014", event: "sent", detail: "Por Marta Ríos", at: ago(1036) },
  { id: "e4", contractId: "c-2023-014", event: "opened", detail: "Portal de artistas", at: ago(1033) },
  { id: "e5", contractId: "c-2023-014", event: "signed", detail: "Firma electrónica en el portal", at: ago(1030) },
  { id: "e6", contractId: "c-2026-041", event: "sent", detail: "Por Marta Ríos · pendiente de firma", at: ago(6) },
];
