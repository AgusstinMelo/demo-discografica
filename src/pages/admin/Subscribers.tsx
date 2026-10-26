import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { api } from "../../lib/api";
import { DAY, downloadFile, fmtDateTime, isEmail } from "../../lib/format";
import { toast } from "../../lib/toast";
import { useCampaigns, useMessages, useSubscribers } from "./AdminLayout";

const SAMPLE_IMPORT =
  "email,nombre\nrocio.prieto@example.com,Rocío Prieto\nmateo.gil@example.org;Mateo Gil\nlucia.moreno@example.com,Lucía Moreno\ncorreo-mal-escrito@\nirene.vera@example.net, adrian.mora@example.com";

/** Lee una lista pegada o un CSV (email,nombre). Separadores: coma, punto y coma, tabulador o salto de línea. */
function parseImport(text: string) {
  const rows: { email: string; name: string }[] = [];
  let invalid = 0;
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const cells = line.split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      const emails = cells.filter(isEmail);
      if (!emails.length) {
        if (!(i === 0 && /email|correo/i.test(line))) invalid += cells.length || 1;
        return;
      }
      invalid += cells.filter((c) => c.includes("@") && !isEmail(c)).length;
      const name = emails.length === 1 ? (cells.find((c) => !c.includes("@")) ?? "") : "";
      emails.forEach((email) => rows.push({ email: email.toLowerCase(), name }));
    });
  return { rows, invalid };
}

export function Subscribers() {
  const subs = useSubscribers().data;
  const camps = useCampaigns().data ?? [];
  const unread = useMessages().data?.filter((m) => !m.read).length ?? 0;
  const [q, setQ] = useState("");
  const [highlight, setHighlight] = useState<string[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const importRef = useRef<HTMLTextAreaElement>(null);

  const list = subs ?? [];
  const active = list.filter((s) => s.status === "active");
  const recent = list.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 30 * DAY).length;
  const openRate = camps.length ? Math.round((camps.reduce((s, c) => s + c.opens / c.sent, 0) / camps.length) * 100) : 0;
  const query = q.trim().toLowerCase();
  const shown = list.filter((s) => !query || `${s.email} ${s.name} ${s.source}`.toLowerCase().includes(query));

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim();
    const r = await api.addSubscriber(email, newName);
    if (r === "invalid") return toast("Introduce un email válido.", "err");
    if (r === "dup") return toast("Ese email ya está en la lista.", "warn");
    setNewEmail("");
    setNewName("");
    setHighlight([email.toLowerCase()]);
    toast(`${email} añadido a la lista.`);
  };

  const doImport = async () => {
    if (!importText.trim()) return setImportMsg({ ok: false, text: "Pega una lista o carga un archivo primero." });
    const { rows, invalid } = parseImport(importText);
    try {
      // API REAL: para listas grandes, subir el CSV a una Edge Function que lo procese por lotes
      const r = rows.length ? await api.importSubscribers(rows) : { ok: 0, dup: 0, added: [] };
      setImportMsg({ ok: r.ok > 0, text: `Importación terminada: ${r.ok} añadidos · ${r.dup} duplicados · ${invalid} no válidos.` });
      if (r.ok) {
        setImportText("");
        setHighlight(r.added);
        toast(`${r.ok} contactos importados.`);
      }
    } catch (err) {
      setImportMsg({ ok: false, text: (err as Error).message });
    }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      setImportText(String(rd.result));
      toast(`Archivo «${file.name}» cargado. Pulsa «Importar contactos».`, "info");
    };
    rd.readAsText(file);
  };

  const remove = async (id: string, email: string) => {
    if (!confirm(`¿Eliminar a ${email} de la lista?`)) return;
    await api.deleteSubscriber(id);
    toast(`${email} eliminado.`, "info");
  };

  const exportCsv = () => {
    const rows = list.map((s) => [s.email, s.name, s.source, s.createdAt, s.status === "active" ? "activo" : "baja"].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    downloadFile("suscriptores-nocturna.csv", "﻿email,nombre,origen,fecha_alta,estado\n" + rows.join("\n"), "text/csv;charset=utf-8");
  };

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Suscriptores</h1>
          <p>Lista de correos de la newsletter del sello.</p>
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportCsv}>
            <Icon name="download" size={16} /> Exportar CSV
          </button>
          <button
            type="button"
            className="btn btn-soft btn-sm"
            aria-expanded={showImport}
            aria-controls="importPanel"
            onClick={() => {
              setShowImport((s) => !s);
              setTimeout(() => importRef.current?.focus(), 0);
            }}
          >
            <Icon name="upload" size={16} /> Importar
          </button>
        </div>
      </header>

      <div className="kpis">
        <div className="kpi highlight">
          <span><Icon name="users" size={15} /> Suscriptores activos</span>
          <strong>{active.length}</strong>
          <small>{list.length - active.length} bajas</small>
        </div>
        <div className="kpi">
          <span><Icon name="plus" size={15} /> Nuevos (30 días)</span>
          <strong>{recent}</strong>
          <small>web, conciertos e importaciones</small>
        </div>
        <div className="kpi">
          <span><Icon name="eye" size={15} /> Apertura media</span>
          <strong>{openRate}%</strong>
          <small>últimas {camps.length} campañas</small>
        </div>
        <div className="kpi">
          <span><Icon name="inbox" size={15} /> Mensajes sin leer</span>
          <strong>{unread}</strong>
          <small>
            <Link to="/admin/mensajes">Ir a la bandeja</Link>
          </small>
        </div>
      </div>

      {showImport && (
        <section className="card import-panel" id="importPanel" aria-labelledby="impTitle">
          <h2 className="card-title" id="impTitle">
            <Icon name="upload" /> Importar contactos
          </h2>
          <p className="muted small">
            Pega una lista de correos (separados por comas, punto y coma o saltos de línea) o un CSV con columnas <code className="mono">email,nombre</code>. También puedes cargar un archivo .csv.
          </p>
          <div className="field">
            <label htmlFor="impText">Lista o CSV</label>
            <textarea
              id="impText"
              ref={importRef}
              rows={6}
              placeholder={"email,nombre\nana@example.com,Ana Gil\nluis@example.org;Luis Pardo\notro@example.net"}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <div className="btn-row">
            <label className="btn btn-ghost btn-sm cursor-pointer" htmlFor="impFile">
              <Icon name="file" size={16} /> Cargar archivo .csv
            </label>
            <input id="impFile" type="file" accept=".csv,.txt,text/csv" className="sr-only" onChange={onFile} />
            <button type="button" className="btn btn-accent btn-sm" onClick={doImport}>
              <Icon name="check" size={16} /> Importar contactos
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setImportText(SAMPLE_IMPORT)}>
              Pegar ejemplo
            </button>
          </div>
          <p className={`form-msg ${importMsg ? (importMsg.ok ? "ok" : "err") : ""}`} aria-live="polite">
            {importMsg?.text}
          </p>
        </section>
      )}

      <div className="toolbar">
        <label className="search">
          <span className="sr-only">Buscar suscriptores</span>
          <Icon name="search" />
          <input type="search" placeholder="Buscar por email, nombre u origen…" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <form className="inline-add" onSubmit={add} noValidate>
          <label className="sr-only" htmlFor="addEmail">Email</label>
          <input className="input" id="addEmail" type="email" placeholder="nuevo@email.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <label className="sr-only" htmlFor="addName">Nombre</label>
          <input className="input" id="addName" placeholder="Nombre (opcional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button className="btn btn-accent btn-sm" type="submit">
            <Icon name="plus" size={16} /> Añadir
          </button>
        </form>
      </div>

      <div className="table-wrap">
        <table>
          <caption className="sr-only">Listado de suscriptores</caption>
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Origen</th>
              <th>Fecha de alta</th>
              <th>Estado</th>
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {!subs && (
              <tr>
                <td colSpan={6} className="muted">Cargando…</td>
              </tr>
            )}
            {subs && !shown.length && (
              <tr>
                <td colSpan={6}>
                  <p className="empty my-2 border-0">Sin resultados.</p>
                </td>
              </tr>
            )}
            {shown.map((s) => (
              <tr key={s.id} className={highlight.includes(s.email) ? "row-new" : ""}>
                <td>
                  <strong className="font-semibold">{s.email}</strong>
                </td>
                <td>{s.name || <span className="muted">—</span>}</td>
                <td>
                  <span className="tag plain">{s.source}</span>
                </td>
                <td className="muted">{fmtDateTime(s.createdAt)}</td>
                <td>
                  <span className={`tag ${s.status === "active" ? "tag-ok" : "tag-danger"}`}>{s.status === "active" ? "Activo" : "Baja"}</span>
                </td>
                <td className="num">
                  <button type="button" className="icon-btn sm" aria-label={`Eliminar ${s.email}`} title="Eliminar" onClick={() => remove(s.id, s.email)}>
                    <Icon name="trash" size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted mt-3" aria-live="polite">
        {list.length} contactos en la lista
      </p>
    </>
  );
}
