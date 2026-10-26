// Estado y texto de los contratos. El texto es el que se firma y del que se calcula el hash.
import { config } from "../config";
import { artistById } from "./catalog";
import { DAY, fmtDate, fmtDateLong, fmtEur, parseDay, TODAY_ISO } from "./format";
import type { Contract, ContractEventType, ContractType } from "./api/types";

export type ContractState = "signed" | "pending" | "expired";

export const CONTRACT_TYPES: Record<ContractType, string> = {
  recording: "Grabación",
  distribution: "Distribución",
  publishing: "Edición",
};

export const STATES: Record<ContractState, { label: string; tag: string }> = {
  signed: { label: "Firmado · vigente", tag: "tag-ok" },
  pending: { label: "Pendiente de firma", tag: "tag-warn" },
  expired: { label: "Vencido", tag: "tag-danger" },
};

export const EVENT_LABELS: Record<ContractEventType, string> = {
  sent: "Contrato enviado",
  opened: "Contrato abierto",
  read: "Lectura completada",
  signed: "Contrato firmado",
};

export function contractState(c: Contract): ContractState {
  if (c.status === "pending") return "pending";
  return c.end < TODAY_ISO ? "expired" : "signed";
}

export function stateLabel(c: Contract) {
  const st = contractState(c);
  return st === "signed" && c.start > TODAY_ISO ? `Firmado · inicia ${fmtDate(c.start)}` : STATES[st].label;
}

/** Cláusulas de ejemplo generadas a partir de los datos del contrato */
export function contractClauses(c: Contract): [string, string][] {
  const artist = artistById(c.artistId);
  const { label } = config;
  const years = Math.round((parseDay(c.end).getTime() - parseDay(c.start).getTime()) / (365 * DAY));
  return [
    ["Reunidos", `De una parte, ${label.legalName} (en adelante, «EL SELLO»), con domicilio en ${label.address}, y CIF ${label.taxId}. De otra parte, ${(artist?.name ?? "").toUpperCase()} (en adelante, «LA ARTISTA»), mayor de edad, actuando en su propio nombre y derecho. Ambas partes se reconocen capacidad legal suficiente para obligarse y, a tal efecto, EXPONEN y ACUERDAN las siguientes cláusulas.`],
    ["Primera. Objeto", `El presente ${c.title.toLowerCase()} tiene por objeto ${c.scope}, en los términos y condiciones aquí establecidos.`],
    ["Segunda. Duración", `El contrato entrará en vigor el ${fmtDateLong(c.start)} y finalizará el ${fmtDateLong(c.end)} (${years} años). Llegado su vencimiento, podrá prorrogarse por periodos anuales si ninguna de las partes comunica lo contrario con al menos noventa (90) días de antelación.`],
    ["Tercera. Territorio", `Los derechos objeto del presente contrato se conceden para el territorio: ${c.territory}.`],
    ["Cuarta. Royalties", `LA ARTISTA percibirá un ${c.royalties}% de los ingresos netos obtenidos por EL SELLO derivados de la explotación de las obras y grabaciones objeto de este contrato. Se entienden por ingresos netos los efectivamente cobrados, una vez deducidos impuestos indirectos y comisiones de plataformas.`],
    ["Quinta. Anticipo", c.advance ? `EL SELLO abonará a LA ARTISTA un anticipo recuperable de ${fmtEur(c.advance)}, que se compensará con los royalties devengados. El anticipo no será reembolsable en ningún caso.` : "Las partes acuerdan expresamente que el presente contrato no incluye anticipo alguno sobre royalties."],
    ["Sexta. Liquidaciones", "EL SELLO emitirá liquidaciones trimestrales detalladas por plataforma y territorio dentro de los cuarenta y cinco (45) días siguientes al cierre de cada trimestre natural, accesibles en todo momento desde el Portal de Artistas."],
    ["Séptima. Obligaciones del sello", "EL SELLO se compromete a realizar sus mejores esfuerzos en la promoción, distribución y comunicación pública de las grabaciones, a mantener actualizados los metadatos (ISRC, UPC, créditos) y a proporcionar a LA ARTISTA acceso transparente a la información de explotación."],
    ["Octava. Obligaciones de la artista", "LA ARTISTA garantiza ser autora o titular de los derechos sobre las obras, que estas no infringen derechos de terceros, y se compromete a participar razonablemente en las acciones promocionales acordadas con antelación."],
    ["Novena. Propiedad intelectual", "LA ARTISTA conserva en todo momento la autoría moral de sus obras. Los derechos de explotación se ceden en exclusiva únicamente en los términos, territorio y duración aquí previstos, revirtiendo íntegramente a LA ARTISTA a la finalización del contrato."],
    ["Décima. Confidencialidad", "Las partes se obligan a mantener la confidencialidad de las condiciones económicas del presente contrato, salvo requerimiento legal o autorización expresa de la otra parte."],
    ["Undécima. Resolución", "Cualquiera de las partes podrá resolver el contrato en caso de incumplimiento grave de la otra, previa notificación fehaciente y un plazo de subsanación de treinta (30) días naturales."],
    ["Duodécima. Protección de datos", "Los datos personales de LA ARTISTA serán tratados conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018, con la única finalidad de gestionar la presente relación contractual."],
    ["Decimotercera. Firma electrónica", "Las partes aceptan la firma electrónica de este documento a través del Portal de Artistas de EL SELLO, que registrará fecha y hora, dirección IP, dispositivo y una huella criptográfica (SHA-256) del contenido íntegro del contrato."],
    ["Decimocuarta. Legislación y jurisdicción", "Este contrato se rige por la legislación española. Para cualquier controversia, las partes se someten a los Juzgados y Tribunales de Madrid capital."],
  ];
}

export const contractText = (c: Contract) => contractClauses(c).map(([h, p]) => `${h}\n${p}`).join("\n\n");
