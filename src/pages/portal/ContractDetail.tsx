import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import { Icon } from "../../components/Icon";
import { AuditList, Certificate, ContractTag } from "../../components/private/contractWidgets";
import { SignaturePad, type SignaturePadHandle } from "../../components/private/SignaturePad";
import { config } from "../../config";
import { useData } from "../../hooks/useData";
import { api, type Contract } from "../../lib/api";
import { artistById } from "../../lib/catalog";
import { CONTRACT_TYPES, contractClauses, contractState, contractText } from "../../lib/contracts";
import { downloadFile, fmtDate, fmtDateLong } from "../../lib/format";
import { clientInfo, parseUA } from "../../lib/signature";
import { toast } from "../../lib/toast";
import { NotFound } from "../NotFound";
import { useContracts } from "./PortalLayout";

export function ContractDetail() {
  const { id = "" } = useParams();
  const contracts = useContracts().data;
  const c = contracts?.find((x) => x.id === id);
  const events = useData(() => api.listContractEvents(id), [id]).data;
  const read = !!events?.some((e) => e.event === "read");
  const [progress, setProgress] = useState(0);
  const viewerRef = useRef<HTMLElement>(null);
  const logged = useRef(new Set<string>());

  // Auditoría: «contrato abierto» una vez por visita
  useEffect(() => {
    if (!c || logged.current.has("opened:" + c.id)) return;
    logged.current.add("opened:" + c.id);
    api.logContractEvent(c.id, "opened", `Portal de artistas · ${parseUA().browser}`).catch(() => {});
  }, [c]);

  // Lectura: barra de progreso y evento «Lectura completada» al llegar al final
  const onScroll = () => {
    const v = viewerRef.current;
    if (!v || !c) return;
    const max = v.scrollHeight - v.clientHeight;
    const p = max > 0 ? v.scrollTop / max : 1;
    setProgress(p);
    if (p > 0.98 && events && !read && !logged.current.has("read:" + c.id)) {
      logged.current.add("read:" + c.id);
      api
        .logContractEvent(c.id, "read", "Documento desplazado hasta el final")
        .then(() => toast("Lectura del contrato registrada.", "info"))
        .catch((e: Error) => toast(e.message, "err"));
    }
  };
  useEffect(onScroll, [c, events]);

  if (!contracts) return <p className="muted">Cargando contrato…</p>;
  if (!c) return <NotFound />;

  const artist = artistById(c.artistId);
  const download = () =>
    downloadFile(`${c.id}.txt`, `${c.title.toUpperCase()}\n${c.id.toUpperCase()}\n\n${contractText(c)}\n\n[Documento de ejemplo · sin validez legal]`);

  return (
    <>
      <Link to="/portal/contratos" className="back">
        <Icon name="back" size={16} /> Mis contratos
      </Link>
      <header className="app-head">
        <div>
          <div className="btn-row gap-2 mb-2.5">
            <ContractTag contract={c} />
            <span className="tag plain">{CONTRACT_TYPES[c.type]}</span>
          </div>
          <h1>{c.title}</h1>
          <p className="mono">
            {c.id.toUpperCase()} · {fmtDate(c.start)} → {fmtDate(c.end)} · {c.royalties}% royalties
          </p>
        </div>
      </header>

      <div className="contract-layout">
        <div>
          <div className="viewer-wrap">
            <div className="read-progress" aria-hidden="true">
              <span style={{ width: `${progress * 100}%` }} />
            </div>
            <article
              ref={viewerRef}
              className="contract-viewer"
              tabIndex={0}
              aria-label="Texto del contrato (desplázate para leerlo completo)"
              onScroll={onScroll}
            >
              <h2>{c.title}</h2>
              <p className="doc-sub">
                {config.label.name} S.L. · {artist?.name} · Ref. {c.id.toUpperCase()}
              </p>
              {contractClauses(c).map(([h, p]) => (
                <Fragment key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </Fragment>
              ))}
              <p className="doc-end">
                — Fin del documento —<br />
                Documento de ejemplo con cláusulas ficticias. Sin validez legal.
              </p>
            </article>
          </div>
          <p className="xs muted mt-2.5">{read ? "Has leído este contrato completo." : "Desplázate hasta el final del contrato para registrar su lectura."}</p>
        </div>

        <div className="grid gap-6">
          {contractState(c) === "pending" && <SignPanel contract={c} read={read} />}
          {c.signature ? (
            <Certificate contract={c} signature={c.signature} id="cert" />
          ) : (
            c.status === "signed" && (
              <section className="card">
                <h2 className="card-title">
                  <Icon name="shield" /> Firma registrada
                </h2>
                <p className="muted">
                  Firmado el <strong className="text-text">{c.signedOn ? fmtDateLong(c.signedOn) : "—"}</strong>. {c.signedNote}
                </p>
                <button type="button" className="btn btn-ghost btn-sm" onClick={download}>
                  <Icon name="download" /> Descargar copia (.txt)
                </button>
              </section>
            )
          )}
          <section className="card" aria-labelledby="auditTitle">
            <h2 className="card-title" id="auditTitle">
              <Icon name="shield" /> Registro de auditoría
            </h2>
            <AuditList events={events} />
          </section>
        </div>
      </div>
    </>
  );
}

function SignPanel({ contract: c, read }: { contract: Contract; read: boolean }) {
  const padRef = useRef<SignaturePadHandle>(null);
  const [accept, setAccept] = useState(false);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ accept?: boolean; name?: boolean; pad?: boolean }>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nameOk = name.trim().split(/\s+/).filter(Boolean).length >= 2;
    const padOk = !!padRef.current?.hasInk();
    const next = { accept: !accept, name: !nameOk, pad: !padOk };
    setErrors(next);
    const missing = [
      next.accept && "marca «He leído y acepto»",
      next.name && "escribe tu nombre completo (nombre y apellido)",
      next.pad && "dibuja tu firma",
    ].filter(Boolean);
    if (missing.length) return setMsg(`Para firmar: ${missing.join(", ")}.`);
    setMsg("");
    setBusy(true);
    try {
      /* Con Supabase, sign_contract() comprueba la sesión y la lectura, toma la IP de la cabecera
         de la petición y calcula el SHA-256 en el servidor (pgcrypto) dentro de una transacción. */
      await api.signContract({
        contractId: c.id,
        fullName: name.trim(),
        image: padRef.current!.toDataURL(),
        documentText: contractText(c),
        client: clientInfo(),
      });
      toast(
        <>
          <strong>Contrato firmado.</strong> Se ha generado tu certificado de firma.
        </>,
      );
      setTimeout(() => document.getElementById("cert")?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } catch (err) {
      setMsg((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <section className="card" aria-labelledby="signTitle">
      <h2 className="card-title" id="signTitle">
        <Icon name="pen" /> Firma digital
      </h2>
      <p className="muted small">Al firmar se registrará la fecha y hora, tu IP, navegador, sistema operativo y una huella SHA-256 del documento.</p>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label className={`check ${errors.accept ? "invalid" : ""}`}>
            <input
              type="checkbox"
              checked={accept}
              disabled={!read}
              aria-describedby="acceptHint"
              onChange={(e) => {
                setAccept(e.target.checked);
                setErrors((x) => ({ ...x, accept: false }));
              }}
            />{" "}
            He leído y acepto los términos de este contrato
          </label>
          <p className="xs muted ml-7" id="acceptHint">
            {read ? "Lectura completada. Ya puedes aceptar." : "Se habilita al llegar al final del contrato."}
          </p>
        </div>
        <div className={`field ${errors.name ? "invalid" : ""}`}>
          <label htmlFor="signName">Nombre completo</label>
          <input
            id="signName"
            autoComplete="name"
            placeholder={`Ej. ${artistById(c.artistId)?.name ?? ""} Martín`}
            aria-describedby="signName-err"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="field-error" id="signName-err">
            {errors.name && "Introduce nombre y al menos un apellido."}
          </p>
        </div>
        <SignaturePad ref={padRef} invalid={!!errors.pad} onInk={() => setErrors((x) => ({ ...x, pad: false }))} />
        <p className="form-msg err" role="alert">
          {msg}
        </p>
        <button className="btn btn-accent btn-lg w-full" type="submit" disabled={busy}>
          <Icon name={busy ? "clock" : "pen"} /> {busy ? "Registrando firma…" : "Firmar contrato"}
        </button>
      </form>
    </section>
  );
}
