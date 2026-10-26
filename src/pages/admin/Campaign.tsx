import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { EmailPreview } from "../../components/private/EmailPreview";
import { config, type EmailContent } from "../../config";
import { api } from "../../lib/api";
import { seeded, sleep } from "../../lib/format";
import { toast } from "../../lib/toast";
import { useSubscribers } from "./AdminLayout";

// El borrador se guarda en este navegador para no perderlo al cambiar de pantalla
const DRAFT_KEY = "nocturna:draft";
const loadDraft = (): EmailContent => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...config.admin.campaignTemplate, ...JSON.parse(raw) };
  } catch {
    /* sin almacenamiento: usamos la plantilla */
  }
  return config.admin.campaignTemplate;
};
const saveDraft = (d: EmailContent | null) => {
  try {
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* sin almacenamiento */
  }
};

interface Sending {
  pct: number;
  label: string;
}

export function Campaign() {
  const recipients = (useSubscribers().data ?? []).filter((s) => s.status === "active");
  const n = recipients.length;
  const [draft, setDraft] = useState<EmailContent>(loadDraft);
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});
  const [mobile, setMobile] = useState(false);
  const [sending, setSending] = useState<Sending | null>(null);
  const [result, setResult] = useState<{ n: number; subject: string } | null>(null);

  const update = (key: keyof EmailContent, value: string) => {
    const next = { ...draft, [key]: value };
    setDraft(next);
    saveDraft(next);
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const errs = {
      subject: draft.subject.trim().length >= 4 ? undefined : "Escribe un asunto (mínimo 4 caracteres).",
      body: draft.body.trim().length >= 20 ? undefined : "El contenido es demasiado corto.",
    };
    setErrors(errs);
    if (errs.subject || errs.body) return;
    if (!n) return toast("No hay suscriptores activos.", "err");

    setResult(null);
    /* API REAL: guardar la campaña y encolar un envío por destinatario; una Edge Function de Supabase
       (o un proveedor como Resend / Brevo) los procesa por lotes y registra aperturas (píxel) y clics. */
    const steps = Math.max(n, 20);
    for (let i = 1; i <= steps; i++) {
      await sleep(2600 / steps);
      const sent = Math.round((i / steps) * n);
      setSending({ pct: Math.round((i / steps) * 100), label: `Enviando ${sent} de ${n} · ${recipients[Math.min(n - 1, sent)]?.email ?? ""}` });
    }
    const r = seeded(draft.subject + Date.now());
    const opens = Math.round(n * (0.38 + r() * 0.22));
    const clicks = Math.max(1, Math.round(opens * (0.18 + r() * 0.2)));
    try {
      await api.createCampaign({ ...draft, subject: draft.subject.trim(), sent: n, opens, clicks });
      setSending({ pct: 100, label: "Envío completado" });
      setResult({ n, subject: draft.subject });
      toast(
        <>
          Campaña enviada a <strong>{n} contactos</strong> (simulado).
        </>,
      );
    } catch (err) {
      setSending(null);
      toast((err as Error).message, "err");
    }
  };

  const busy = !!sending && !result;
  const field = (key: keyof EmailContent, label: string, props: { maxLength?: number; type?: string } = {}) => {
    const error = key === "subject" ? errors.subject : undefined;
    return (
      <div className={`field ${error ? "invalid" : ""}`}>
        <label htmlFor={`cmp-${key}`}>{label}</label>
        <input
          id={`cmp-${key}`}
          {...props}
          value={draft[key]}
          aria-invalid={!!error}
          aria-describedby={key === "subject" ? "cmp-subject-err" : undefined}
          onChange={(e) => update(key, e.target.value)}
        />
        {key === "subject" && (
          <p className="field-error" id="cmp-subject-err">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Nueva campaña</h1>
          <p>Redacta, previsualiza y envía un email a tu lista.</p>
        </div>
        <span className="tag tag-accent plain">
          <Icon name="users" size={14} /> {n} destinatarios activos
        </span>
      </header>

      <div className="compose">
        <section className="card">
          <form onSubmit={send} noValidate>
            {field("subject", "Asunto", { maxLength: 120 })}
            {field("preheader", "Texto de vista previa (preheader)", { maxLength: 140 })}
            <div className={`field ${errors.body ? "invalid" : ""}`}>
              <label htmlFor="cmp-body">Contenido</label>
              <textarea
                id="cmp-body"
                rows={11}
                value={draft.body}
                aria-invalid={!!errors.body}
                aria-describedby="cmp-body-help cmp-body-err"
                onChange={(e) => update("body", e.target.value)}
              />
              <div className="field-hint">
                <span id="cmp-body-help">Usa **negrita** y deja una línea en blanco entre párrafos.</span>
              </div>
              <p className="field-error" id="cmp-body-err">
                {errors.body}
              </p>
            </div>
            <div className="grid-2 gap-x-4 gap-y-0">
              {field("cta", "Texto del botón")}
              {field("url", "Enlace del botón", { type: "url" })}
            </div>
            <div className="btn-row">
              <button className="btn btn-accent btn-lg" type="submit" disabled={busy}>
                <Icon name="send" /> Enviar a {n} contactos
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  saveDraft(null);
                  setDraft(config.admin.campaignTemplate);
                  setErrors({});
                  toast("Plantilla restaurada.", "info");
                }}
              >
                Restaurar plantilla
              </button>
            </div>
            {sending && (
              <div className="send-progress">
                <div className="player-line mb-2 justify-between">
                  <span className="small" id="sendLabel">
                    {sending.label}
                  </span>
                  <span className="small mono">{sending.pct}%</span>
                </div>
                <div className="bar-lg" role="progressbar" aria-labelledby="sendLabel" aria-valuemin={0} aria-valuemax={100} aria-valuenow={sending.pct}>
                  <span style={{ width: `${sending.pct}%` }} />
                </div>
              </div>
            )}
            {result && (
              <div className="send-summary" role="status">
                <Icon name="check" size={26} />
                <div>
                  <strong>Enviado a {result.n} contactos</strong>
                  <p className="small muted mt-0.5 mb-0">
                    «{result.subject}» · 0 rebotes · métricas disponibles en el <Link to="/admin/historial">historial</Link>.
                  </p>
                </div>
              </div>
            )}
          </form>
        </section>

        <div className="preview-wrap">
          <div className="preview-bar">
            <strong>Vista previa</strong>
            <div className="seg" role="group" aria-label="Tamaño de vista previa">
              <button type="button" aria-pressed={!mobile} onClick={() => setMobile(false)}>
                Escritorio
              </button>
              <button type="button" aria-pressed={mobile} onClick={() => setMobile(true)}>
                Móvil
              </button>
            </div>
          </div>
          <div className={`email-frame ${mobile ? "mobile" : ""}`}>
            <EmailPreview email={draft} />
          </div>
        </div>
      </div>
    </>
  );
}
