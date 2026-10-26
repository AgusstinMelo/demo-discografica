import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Icon } from "../../components/Icon";
import { config } from "../../config";
import { api, type ContactMessage } from "../../lib/api";
import { fmtDate, fmtDateTime, iso } from "../../lib/format";
import { toast } from "../../lib/toast";
import { useMessages } from "./AdminLayout";

const REASON_TAG: Record<ContactMessage["reason"], string> = { demo: "tag-accent", press: "tag-info", booking: "tag-ok", other: "" };

export function Messages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const msgs = useMessages().data;
  const cur = msgs?.find((m) => m.id === id) ?? null;

  // Abrir un mensaje lo marca como leído
  useEffect(() => {
    if (cur && !cur.read) api.markMessageRead(cur.id).catch(() => {});
  }, [cur]);

  const remove = async (m: ContactMessage) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await api.deleteMessage(m.id);
    toast("Mensaje eliminado.", "info");
    navigate("/admin/mensajes");
  };

  if (!msgs) return <p className="muted">Cargando mensajes…</p>;

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Mensajes recibidos</h1>
          <p>Enviados desde el formulario de contacto de la web.</p>
        </div>
        <span className="tag plain">
          {msgs.length} mensajes · {msgs.filter((m) => !m.read).length} sin leer
        </span>
      </header>

      {!msgs.length ? (
        <div className="empty">
          No hay mensajes. Prueba a enviar uno desde la página de <Link to="/contacto">contacto</Link>.
        </div>
      ) : (
        <div className="inbox">
          <ul className="msg-list" aria-label="Bandeja de entrada">
            {msgs.map((m) => (
              <li key={m.id}>
                <Link className={`msg-item no-underline ${m.read ? "" : "unread"}`} to={`/admin/mensajes/${m.id}`} aria-current={cur?.id === m.id ? "true" : undefined}>
                  <span className="row">
                    <strong>{m.name}</strong>
                    <span className="xs muted">{fmtDate(iso(m.createdAt))}</span>
                  </span>
                  <span className="row">
                    <span className={`tag ${REASON_TAG[m.reason]}`}>{config.contactReasons[m.reason] ?? m.reason}</span>
                  </span>
                  <p>{m.message}</p>
                </Link>
              </li>
            ))}
          </ul>
          <section className="card msg-detail" aria-live="polite">
            {cur ? (
              <>
                <div className="btn-row justify-between">
                  <span className={`tag ${REASON_TAG[cur.reason] || "tag-info"}`}>{config.contactReasons[cur.reason]}</span>
                  <span className="small muted">{fmtDateTime(cur.createdAt)}</span>
                </div>
                <h2 className="mt-4 mb-1 text-[1.6rem]">{cur.name}</h2>
                <p className="muted m-0">
                  <a href={`mailto:${cur.email}`}>{cur.email}</a>
                </p>
                <div className="msg-body">{cur.message}</div>
                <div className="btn-row">
                  <a className="btn btn-accent btn-sm" href={`mailto:${cur.email}?subject=${encodeURIComponent(`Re: tu mensaje a ${config.label.name}`)}`}>
                    <Icon name="mail" size={16} /> Responder
                  </a>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(cur)}>
                    <Icon name="trash" size={16} /> Eliminar
                  </button>
                </div>
              </>
            ) : (
              <div className="empty border-0">
                <Icon name="inbox" size={32} className="mx-auto mb-3" />
                Selecciona un mensaje para leerlo.
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
