import { Icon } from "../../components/Icon";
import { EmailPreview } from "../../components/private/EmailPreview";
import { config } from "../../config";
import { useData } from "../../hooks/useData";
import { api, type AutomationKey } from "../../lib/api";
import { fmtDateTime } from "../../lib/format";
import { toast } from "../../lib/toast";
import { useSubscribers } from "./AdminLayout";

const KEYS: AutomationKey[] = ["welcome", "release"];

export function Automations() {
  const autos = useData(() => api.listAutomations()).data;
  const log = useData(() => api.listAutomationLog()).data ?? [];
  const activeSubs = (useSubscribers().data ?? []).filter((s) => s.status === "active").length;

  const toggle = async (key: AutomationKey) => {
    const on = !autos?.[key].enabled;
    // API REAL: el disparador vive en el servidor (función subscribe() o un trigger al publicar un lanzamiento)
    await api.setAutomation(key, on);
    toast(`Automatización ${on ? "activada" : "desactivada"}.`, on ? "ok" : "warn");
  };

  const test = async (key: AutomationKey) => {
    if (!autos?.[key].enabled) return toast("Esta automatización está desactivada. Actívala para probarla.", "warn");
    if (key === "welcome") {
      await api.runAutomation(key, `Email de prueba de bienvenida enviado a ${config.demoCredentials.admin}`);
      toast(`Prueba enviada a ${config.demoCredentials.admin} (simulado).`);
    } else {
      await api.runAutomation(key, `Aviso de «Ruido Blanco» enviado a ${activeSubs} contactos`);
      toast(
        <>
          Nuevo lanzamiento detectado: aviso enviado a <strong>{activeSubs} contactos</strong> (simulado).
        </>,
      );
    }
  };

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Automatizaciones</h1>
          <p>Emails que se envían solos cuando ocurre algo.</p>
        </div>
      </header>

      <div className="grid-2 items-start">
        {KEYS.map((key) => {
          const meta = config.admin.automations[key];
          const a = autos?.[key];
          const on = !!a?.enabled;
          return (
            <section key={key} className={`card auto-card ${on ? "" : "off"}`} aria-labelledby={`t-${key}`}>
              <div className="auto-head">
                <div>
                  <h2 id={`t-${key}`}>{meta.title}</h2>
                  <p>{meta.description}</p>
                </div>
                <button type="button" className="switch" role="switch" aria-checked={on} aria-labelledby={`t-${key}`} disabled={!a} onClick={() => toggle(key)} />
              </div>
              <div className="flow">
                <span>
                  <Icon name="zap" size={14} /> {meta.trigger}
                </span>
                <Icon name="arrow" size={16} />
                <span>
                  <Icon name="mail" size={14} /> {meta.action}
                </span>
              </div>
              <div className="email-frame p-3.5">
                <EmailPreview email={meta.email} />
              </div>
              <div className="btn-row justify-between">
                <span className="small muted">
                  <strong className="text-text">{a?.sent ?? "—"}</strong> emails enviados · estado:{" "}
                  <span className={`tag ${on ? "tag-ok" : "tag-danger"}`}>{on ? "Activada" : "Desactivada"}</span>
                </span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => test(key)}>
                  <Icon name="send" size={15} /> {key === "welcome" ? "Enviar prueba" : "Simular nuevo lanzamiento"}
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <section className="card mt-6" aria-labelledby="logTitle">
        <h2 className="card-title" id="logTitle">
          <Icon name="clock" /> Actividad reciente
        </h2>
        <ol className="audit">
          {log.map((l) => (
            <li key={l.id}>
              <span className="a-ico acc">
                <Icon name={l.key === "welcome" ? "mail" : "disc"} size={15} />
              </span>
              <div>
                <strong>{l.text}</strong>
                <time dateTime={l.at}>{fmtDateTime(l.at)}</time>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
