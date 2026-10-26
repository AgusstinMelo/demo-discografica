import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { SocialButtons } from "../../components/SocialButtons";
import { config, type ContactReason } from "../../config";
import { usePageTitle } from "../../hooks/usePageTitle";
import { api } from "../../lib/api";
import { isEmail } from "../../lib/format";
import { toast } from "../../lib/toast";

type Field = "name" | "email" | "reason" | "message" | "privacy";
interface Values {
  name: string;
  email: string;
  reason: ContactReason | "";
  message: string;
  privacy: boolean;
}
const EMPTY: Values = { name: "", email: "", reason: "", message: "", privacy: false };

/** Devuelve el mensaje de error o null si el campo es válido */
const VALIDATORS: Record<Field, (v: Values) => string | null> = {
  name: (v) => (v.name.trim().length >= 2 ? null : "Escribe tu nombre (mínimo 2 caracteres)."),
  email: (v) => (isEmail(v.email) ? null : "Introduce un email válido, p. ej. nombre@dominio.com."),
  reason: (v) => (v.reason ? null : "Selecciona el motivo de tu mensaje."),
  message: (v) => (v.message.trim().length >= 20 ? null : `Cuéntanos un poco más: mínimo 20 caracteres (llevas ${v.message.trim().length}).`),
  privacy: (v) => (v.privacy ? null : "Debes aceptar la política de privacidad."),
};
const FIELDS = Object.keys(VALIDATORS) as Field[];

export function Contact() {
  usePageTitle("Contacto");
  const [values, setValues] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [sent, setSent] = useState<Values | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const { emails } = config.label;

  const error = (f: Field) => (touched[f] ? VALIDATORS[f](values) : null);
  const fieldClass = (f: Field) => {
    if (!touched[f]) return "field";
    return `field ${error(f) ? "invalid" : f === "privacy" || f === "reason" ? "" : "valid"}`;
  };
  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const touch = (f: Field) => setTouched((t) => ({ ...t, [f]: true }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
    const firstInvalid = FIELDS.find((f) => VALIDATORS[f](values));
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      toast("Revisa los campos marcados en rojo.", "err");
      return;
    }
    setBusy(true);
    try {
      /* API REAL: además de guardar el mensaje, una Edge Function de Supabase (o un webhook)
         avisaría por email al equipo según el motivo y aplicaría antispam (captcha / rate limit). */
      await api.sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        reason: values.reason as ContactReason,
        message: values.message.trim(),
      });
      setSent(values);
      setTimeout(() => successRef.current?.focus(), 0);
    } catch (err) {
      toast((err as Error).message, "err");
    } finally {
      setBusy(false);
    }
  };

  const again = () => {
    setValues(EMPTY);
    setTouched({});
    setSent(null);
    setTimeout(() => formRef.current?.querySelector<HTMLElement>("#c-name")?.focus(), 0);
  };

  const errorText = (f: Field) => (
    <p className="field-error" id={`c-${f}-err`} aria-live="polite">
      {error(f)}
    </p>
  );

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            Contacto
          </Reveal>
          <Reveal as="h1">
            Hablemos <span className="serif accent">de música.</span>
          </Reveal>
          <Reveal as="p" className="lead">
            ¿Tienes una demo, eres medio de comunicación o quieres contratar a alguno de nuestros artistas? Escríbenos y te responderemos en menos de 72 horas.
          </Reveal>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap contact-layout">
          <Reveal className="card">
            {!sent ? (
              <form ref={formRef} onSubmit={onSubmit} noValidate>
                <div className="grid-2 gap-x-5 gap-y-0">
                  <div className={fieldClass("name")}>
                    <label htmlFor="c-name">
                      Nombre <span className="req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="c-name" name="name" autoComplete="name" required placeholder="Tu nombre o el de tu proyecto"
                      value={values.name} aria-invalid={!!error("name")} aria-describedby="c-name-err"
                      onChange={(e) => set("name", e.target.value)} onBlur={() => values.name && touch("name")}
                    />
                    {errorText("name")}
                  </div>
                  <div className={fieldClass("email")}>
                    <label htmlFor="c-email">
                      Email <span className="req" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="c-email" name="email" type="email" autoComplete="email" required placeholder="nombre@dominio.com"
                      value={values.email} aria-invalid={!!error("email")} aria-describedby="c-email-err"
                      onChange={(e) => set("email", e.target.value)} onBlur={() => values.email && touch("email")}
                    />
                    {errorText("email")}
                  </div>
                </div>

                <fieldset className={fieldClass("reason")}>
                  <legend className="mb-2">
                    Motivo <span className="req" aria-hidden="true">*</span>
                  </legend>
                  <div className="chips">
                    {(Object.entries(config.contactReasons) as [ContactReason, string][]).map(([key, label]) => (
                      <label key={key} className="chip-radio">
                        <input
                          type="radio" name="reason" value={key} checked={values.reason === key}
                          aria-invalid={!!error("reason")} aria-describedby="c-reason-err"
                          onChange={() => {
                            set("reason", key);
                            touch("reason");
                          }}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  {errorText("reason")}
                </fieldset>

                <div className={fieldClass("message")}>
                  <label htmlFor="c-message">
                    Mensaje <span className="req" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="c-message" name="message" maxLength={1000} required
                    placeholder="Cuéntanos qué tienes en mente. Si es una demo, incluye un enlace privado (SoundCloud, Drive, Bandcamp…)."
                    value={values.message} aria-invalid={!!error("message")} aria-describedby="c-message-err c-message-count"
                    onChange={(e) => set("message", e.target.value)} onBlur={() => values.message && touch("message")}
                  />
                  <div className="field-hint">
                    {errorText("message")}
                    <span id="c-message-count">{values.message.length} / 1000</span>
                  </div>
                </div>

                <div className={fieldClass("privacy")}>
                  <label className="check">
                    <input
                      type="checkbox" name="privacy" checked={values.privacy} aria-describedby="c-privacy-err"
                      onChange={(e) => {
                        set("privacy", e.target.checked);
                        touch("privacy");
                      }}
                    />{" "}
                    He leído y acepto la política de privacidad (ficticia).
                  </label>
                  {errorText("privacy")}
                </div>

                <button className="btn btn-accent btn-lg" type="submit" disabled={busy}>
                  <Icon name="send" /> {busy ? "Enviando…" : "Enviar mensaje"}
                </button>
              </form>
            ) : (
              <div className="success-panel" ref={successRef} tabIndex={-1}>
                <div className="success-icon">
                  <Icon name="check" size={34} />
                </div>
                <h2>¡Mensaje enviado!</h2>
                <p className="muted">
                  Gracias, {sent.name.trim().split(" ")[0]}. Hemos recibido tu mensaje ({config.contactReasons[sent.reason as ContactReason]}) y te responderemos a{" "}
                  {sent.email.trim()} en menos de 72 horas.
                </p>
                <p className="small muted">
                  En esta demo puedes verlo en la <Link to="/admin/mensajes">bandeja del panel de administración</Link>.
                </p>
                <button type="button" className="btn btn-ghost" onClick={again}>
                  Enviar otro mensaje
                </button>
              </div>
            )}
          </Reveal>

          <Reveal as="aside" className="contact-info">
            <dl>
              <div><dt>Demos</dt><dd><a href={`mailto:${emails.demos}`}>{emails.demos}</a></dd></div>
              <div><dt>Prensa</dt><dd><a href={`mailto:${emails.press}`}>{emails.press}</a></dd></div>
              <div><dt>Booking</dt><dd><a href={`mailto:${emails.booking}`}>{emails.booking}</a></dd></div>
              <div><dt>Teléfono</dt><dd>{config.label.phone}</dd></div>
              <div>
                <dt>Estudio y oficina</dt>
                <dd>
                  {config.label.address}
                  <br />
                  <span className="muted small">Visitas solo con cita previa</span>
                </dd>
              </div>
              <div>
                <dt>Redes</dt>
                <dd className="socials mt-1">
                  <SocialButtons socials={config.label.socials} />
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  );
}
