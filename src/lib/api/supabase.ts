// Backend real: Supabase (Postgres + Auth). El esquema, las políticas RLS y las
// funciones están en supabase/migrations/0001_schema.sql.
import { createClient, type PostgrestError } from "@supabase/supabase-js";
import type { Api, AutomationKey, Automation, Contract, ContractType, Role, Session, Signature } from "./types";

// Sin tipos generados: las filas llegan sin tipar y se mapean a los tipos de la app
type Row = Record<string, any>;

export function createSupabaseApi(url: string, anonKey: string): Api {
  const db = createClient(url, anonKey);

  /** Lanza el error de Supabase con un mensaje legible */
  const check = <T>({ data, error }: { data: T; error: PostgrestError | null }) => {
    if (error) throw new Error(error.message);
    return data as NonNullable<T>;
  };

  async function profileFor(userId: string, email: string): Promise<Session | null> {
    const { data } = await db.from("profiles").select("role, artist_id").eq("id", userId).maybeSingle();
    return data ? { email, role: data.role as Role, artistId: data.artist_id } : null;
  }

  const toSignature = (s: Row): Signature => ({
    name: s.full_name,
    signedAt: s.signed_at,
    ip: s.ip,
    ipSource: s.ip_source,
    userAgent: s.user_agent,
    hash: s.document_hash,
    algo: s.algo,
    docId: s.doc_id,
    image: s.signature_png,
    client: s.client,
  });

  const toContract = (c: Row): Contract => {
    // Relación 1:1 (contract_id único): PostgREST devuelve un objeto, o un array en versiones antiguas
    const sig = Array.isArray(c.signatures) ? c.signatures[0] : c.signatures;
    return {
      id: c.id,
      artistId: c.artist_id,
      title: c.title,
      type: c.type as ContractType,
      scope: c.scope,
      start: c.start_date,
      end: c.end_date,
      royalties: Number(c.royalty_pct),
      territory: c.territory,
      advance: c.advance_eur,
      status: c.status,
      signedOn: c.signed_on,
      signedNote: c.signed_note,
      signature: sig ? toSignature(sig) : null,
    };
  };

  return {
    mode: "supabase",

    async getSession() {
      const { data } = await db.auth.getSession();
      const user = data.session?.user;
      return user ? profileFor(user.id, user.email ?? "") : null;
    },
    async signIn(email, password) {
      const { data, error } = await db.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error("Email o contraseña incorrectos. Usa las credenciales de demo.");
      const session = await profileFor(data.user.id, data.user.email ?? email);
      if (!session) {
        await db.auth.signOut();
        throw new Error("Este usuario no tiene perfil. Ejecuta `npm run seed:users`.");
      }
      return session;
    },
    async signOut() {
      await db.auth.signOut();
    },

    async subscribe(email) {
      return check(await db.rpc("subscribe", { p_email: email }));
    },
    async sendContactMessage(input) {
      check(await db.from("contact_messages").insert(input));
    },

    async listSubscribers() {
      const rows = check(await db.from("subscribers").select("*").order("created_at", { ascending: false }));
      return rows.map((s) => ({ id: s.id, email: s.email, name: s.name, source: s.source, status: s.status, createdAt: s.created_at }));
    },
    async addSubscriber(email, name) {
      return check(await db.rpc("subscribe", { p_email: email, p_name: name, p_source: "manual" }));
    },
    async importSubscribers(rows) {
      const byEmail = new Map(rows.map((r) => [r.email.toLowerCase(), r.name]));
      const existing = check(await db.from("subscribers").select("email, status").in("email", [...byEmail.keys()]));
      const active = new Set(existing.filter((s) => s.status === "active").map((s) => s.email));
      const gone = existing.filter((s) => s.status !== "active").map((s) => s.email);
      const fresh = [...byEmail.keys()].filter((e) => !existing.some((s) => s.email === e));
      if (gone.length) check(await db.from("subscribers").update({ status: "active", created_at: new Date().toISOString() }).in("email", gone));
      if (fresh.length) check(await db.from("subscribers").insert(fresh.map((email) => ({ email, name: byEmail.get(email) ?? "", source: "importado" }))));
      const added = [...gone, ...fresh];
      return { ok: added.length, dup: active.size + (rows.length - byEmail.size), added };
    },
    async deleteSubscriber(id) {
      check(await db.from("subscribers").delete().eq("id", id));
    },

    async listCampaigns() {
      const rows = check(await db.from("campaigns").select("*").order("sent_at", { ascending: false }));
      return rows.map((c) => ({ id: c.id, subject: c.subject, sentAt: c.sent_at, sent: c.sent_count, opens: c.open_count, clicks: c.click_count }));
    },
    async createCampaign(c) {
      check(
        await db.from("campaigns").insert({
          subject: c.subject, preheader: c.preheader, body: c.body, cta_text: c.cta, cta_url: c.url,
          sent_count: c.sent, open_count: c.opens, click_count: c.clicks,
        }),
      );
    },
    async listAutomations() {
      const rows = check(await db.from("automations").select("*"));
      const out = {} as Record<AutomationKey, Automation>;
      for (const r of rows) out[r.key as AutomationKey] = { key: r.key, enabled: r.enabled, sent: r.sent_count };
      return out;
    },
    async setAutomation(key, enabled) {
      check(await db.from("automations").update({ enabled }).eq("key", key));
    },
    async runAutomation(key, text) {
      check(await db.rpc("log_automation", { p_key: key, p_text: text }));
    },
    async listAutomationLog() {
      const rows = check(await db.from("automation_log").select("*").order("created_at", { ascending: false }).limit(30));
      return rows.map((l) => ({ id: l.id, key: l.key, text: l.text, at: l.created_at }));
    },
    async listMessages() {
      const rows = check(await db.from("contact_messages").select("*").order("created_at", { ascending: false }));
      return rows.map((m) => ({ id: m.id, name: m.name, email: m.email, reason: m.reason, message: m.message, read: m.is_read, createdAt: m.created_at }));
    },
    async markMessageRead(id) {
      check(await db.from("contact_messages").update({ is_read: true }).eq("id", id));
    },
    async deleteMessage(id) {
      check(await db.from("contact_messages").delete().eq("id", id));
    },

    async listContracts() {
      const rows = check(await db.from("contracts").select("*, signatures(*)").order("start_date", { ascending: false }));
      return rows.map(toContract);
    },
    async listContractEvents(contractId) {
      const rows = check(await db.from("contract_events").select("*").eq("contract_id", contractId).order("created_at", { ascending: false }));
      return rows.map((e) => ({ id: e.id, contractId: e.contract_id, event: e.event, detail: e.detail, at: e.created_at }));
    },
    async logContractEvent(contractId, event, detail) {
      check(await db.from("contract_events").insert({ contract_id: contractId, event, detail }));
    },
    async signContract({ contractId, fullName, image, documentText, client }) {
      const row = check(
        await db.rpc("sign_contract", {
          p_contract_id: contractId, p_full_name: fullName, p_signature_png: image, p_document_text: documentText, p_client: client,
        }),
      );
      return toSignature(row);
    },

    async resetDemo() {
      check(await db.rpc("reset_demo"));
    },
  };
}
