import { useId, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { isEmail } from "../lib/format";
import { toast } from "../lib/toast";

export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!isEmail(value)) return setMsg({ ok: false, text: "Introduce un email válido." });
    if (!consent) return setMsg({ ok: false, text: "Debes aceptar recibir la newsletter." });
    setBusy(true);
    try {
      // API REAL: doble opt-in recomendado (email de confirmación antes de activar el alta)
      const r = await api.subscribe(value);
      if (r === "dup") return setMsg({ ok: false, text: "Este email ya está suscrito. ¡Gracias por seguirnos!" });
      if (r === "invalid") return setMsg({ ok: false, text: "Introduce un email válido." });
      setMsg({ ok: true, text: `¡Listo! ${value} se ha suscrito. Revisa tu bandeja de entrada.` });
      setEmail("");
      setConsent(false);
      toast(
        <>
          <strong>¡Gracias por suscribirte!</strong> Ya formas parte de la lista de Nocturna.
        </>,
      );
      if (r === "welcome") {
        setTimeout(
          () =>
            toast(
              <>
                Automatización: <strong>email de bienvenida</strong> enviado a {value} (simulado).
              </>,
              "info",
            ),
          700,
        );
      }
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const invalid = msg && !msg.ok;
  return (
    <form className={`nl-form ${invalid ? "invalid" : ""}`} onSubmit={onSubmit} noValidate>
      <label htmlFor={`${id}-email`} className="sr-only">
        Tu email
      </label>
      <div className="nl-row">
        <input
          id={`${id}-email`}
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
          value={email}
          aria-invalid={!!invalid}
          aria-describedby={`${id}-msg`}
          onChange={(e) => {
            setEmail(e.target.value);
            setMsg(null);
          }}
        />
        <button className="btn btn-accent" type="submit" disabled={busy}>
          Suscribirme
        </button>
      </div>
      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> Acepto recibir la newsletter y la política de
        privacidad (ficticia).
      </label>
      <p className={`form-msg ${msg ? (msg.ok ? "ok" : "err") : ""}`} id={`${id}-msg`} aria-live="polite">
        {msg?.text}
      </p>
    </form>
  );
}
