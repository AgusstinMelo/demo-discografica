// Backend de demostración sin servidor: todo se guarda en el localStorage de este navegador
// (prefijo "nocturna:"). Se usa cuando no hay variables de Supabase configuradas.
import { config } from "../../config";
import { isEmail, uid } from "../format";
import { getPublicIP, sha256 } from "../signature";
import * as seed from "./seed";
import type { Api, Automation, AutomationKey, ContactMessage, Contract, ContractEvent, Session, Signature, Subscriber } from "./types";

const PREFIX = "nocturna:";
const SESSION_TTL = 1000 * 60 * 60 * 8; // 8 horas

const store = {
  get<T>(key: string, fallback: () => T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* almacenamiento bloqueado o corrupto: volvemos a los datos iniciales */
    }
    const value = fallback();
    store.set(key, value);
    return value;
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* modo privado o almacenamiento lleno: los cambios viven solo en memoria */
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      /* nada que borrar */
    }
  },
  clearAll() {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
    } catch {
      /* nada que borrar */
    }
  },
};

const subscribers = () => store.get<Subscriber[]>("subscribers", seed.seedSubscribers);
const automations = () => store.get<Record<AutomationKey, Automation>>("automations", seed.seedAutomations);
const messages = () => store.get<ContactMessage[]>("messages", seed.seedMessages);
const contracts = () => store.get<Contract[]>("contracts", seed.seedContracts);
const events = () => store.get<ContractEvent[]>("events", seed.seedContractEvents);

function logAutomation(key: AutomationKey, text: string) {
  const a = automations();
  a[key].sent++;
  store.set("automations", a);
  const log = store.get("autolog", seed.seedAutomationLog);
  store.set("autolog", [{ id: uid(), key, text, at: new Date().toISOString() }, ...log].slice(0, 30));
}

function addEvent(contractId: string, event: ContractEvent["event"], detail: string) {
  store.set("events", [...events(), { id: uid(), contractId, event, detail, at: new Date().toISOString() }]);
}

/** Alta común a la newsletter, el alta manual y la importación */
function insertSubscriber(email: string, name: string, source: Subscriber["source"]) {
  email = email.trim().toLowerCase();
  if (!isEmail(email)) return "invalid" as const;
  const list = subscribers();
  const existing = list.find((s) => s.email === email);
  if (existing?.status === "active") return "dup" as const;
  if (existing) {
    existing.status = "active";
    existing.createdAt = new Date().toISOString();
  } else {
    list.unshift({ id: uid(), email, name: name.trim(), source, createdAt: new Date().toISOString(), status: "active" });
  }
  store.set("subscribers", list);
  return "ok" as const;
}

const USERS: Record<string, Session> = {
  [config.demoCredentials.admin]: { email: config.demoCredentials.admin, role: "admin", artistId: null },
  [config.demoCredentials.artist]: { email: config.demoCredentials.artist, role: "artist", artistId: config.portal.artistId },
};

export const localApi: Api = {
  mode: "local",

  async getSession() {
    const s = store.get<{ session: Session; at: number } | null>("session", () => null);
    return s && Date.now() - s.at < SESSION_TTL ? s.session : null;
  },
  async signIn(email, password) {
    const session = USERS[email.trim().toLowerCase()];
    if (!session || password !== config.demoCredentials.password) throw new Error("Email o contraseña incorrectos. Usa las credenciales de demo.");
    store.set("session", { session, at: Date.now() });
    return session;
  },
  async signOut() {
    store.del("session");
  },

  async subscribe(email) {
    const r = insertSubscriber(email, "", "web");
    if (r !== "ok") return r;
    if (!automations().welcome.enabled) return "ok";
    logAutomation("welcome", `Bienvenida enviada a ${email.trim().toLowerCase()}`);
    return "welcome";
  },
  async sendContactMessage(input) {
    const msg: ContactMessage = { id: uid(), ...input, read: false, createdAt: new Date().toISOString() };
    store.set("messages", [msg, ...messages()]);
  },

  async listSubscribers() {
    return subscribers();
  },
  async addSubscriber(email, name) {
    return insertSubscriber(email, name, "manual");
  },
  async importSubscribers(rows) {
    const out = { ok: 0, dup: 0, added: [] as string[] };
    for (const { email, name } of rows) {
      const r = insertSubscriber(email, name, "importado");
      if (r === "ok") {
        out.ok++;
        out.added.push(email.toLowerCase());
      } else if (r === "dup") out.dup++;
    }
    return out;
  },
  async deleteSubscriber(id) {
    store.set("subscribers", subscribers().filter((s) => s.id !== id));
  },

  async listCampaigns() {
    return store.get("campaigns", seed.seedCampaigns);
  },
  async createCampaign({ subject, sent, opens, clicks }) {
    const list = store.get("campaigns", seed.seedCampaigns);
    store.set("campaigns", [{ id: uid(), subject, sentAt: new Date().toISOString(), sent, opens, clicks }, ...list]);
  },
  async listAutomations() {
    return automations();
  },
  async setAutomation(key, enabled) {
    const a = automations();
    a[key].enabled = enabled;
    store.set("automations", a);
  },
  async runAutomation(key, text) {
    logAutomation(key, text);
  },
  async listAutomationLog() {
    return store.get("autolog", seed.seedAutomationLog);
  },
  async listMessages() {
    return [...messages()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async markMessageRead(id) {
    store.set("messages", messages().map((m) => (m.id === id ? { ...m, read: true } : m)));
  },
  async deleteMessage(id) {
    store.set("messages", messages().filter((m) => m.id !== id));
  },

  async listContracts() {
    return contracts();
  },
  async listContractEvents(contractId) {
    return events()
      .filter((e) => e.contractId === contractId)
      .sort((a, b) => b.at.localeCompare(a.at));
  },
  async logContractEvent(contractId, event, detail) {
    addEvent(contractId, event, detail);
  },
  async signContract({ contractId, fullName, image, documentText, client }) {
    const signedAt = new Date().toISOString();
    const [ip, h] = await Promise.all([getPublicIP(), sha256(documentText + "\n" + signedAt)]);
    const signature: Signature = {
      name: fullName,
      signedAt,
      ip: ip.ip,
      ipSource: ip.source,
      userAgent: navigator.userAgent,
      hash: h.hex,
      algo: h.algo,
      docId: `NCT-${contractId.toUpperCase()}-${h.hex.slice(0, 10).toUpperCase()}`,
      image,
      client,
    };
    store.set("contracts", contracts().map((c) => (c.id === contractId ? { ...c, status: "signed", signedOn: signedAt.slice(0, 10), signature } : c)));
    addEvent(contractId, "signed", `${fullName} · IP ${signature.ip} · SHA-256 ${h.hex.slice(0, 16)}…`);
    return signature;
  },

  async resetDemo() {
    store.clearAll();
  },
};
