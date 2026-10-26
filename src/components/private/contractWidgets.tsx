import { useEffect, useState } from "react";
import { config } from "../../config";
import type { Contract, ContractEvent, Signature } from "../../lib/api";
import { contractState, EVENT_LABELS, stateLabel, STATES } from "../../lib/contracts";
import { DAY, fmtDateTime } from "../../lib/format";
import { Icon, type IconName } from "../Icon";

export function ContractTag({ contract }: { contract: Contract }) {
  return <span className={`tag ${STATES[contractState(contract)].tag}`}>{stateLabel(contract)}</span>;
}

const EVENT_ICON: Record<ContractEvent["event"], [string, IconName]> = {
  sent: ["", "send"],
  opened: ["acc", "file"],
  read: ["acc", "eye"],
  signed: ["ok", "pen"],
};

export function AuditList({ events }: { events: ContractEvent[] | undefined }) {
  if (!events) return <p className="muted small">Cargando…</p>;
  if (!events.length) return <p className="muted small">Sin eventos registrados.</p>;
  return (
    <ol className="audit">
      {events.map((e) => {
        const [cls, icon] = EVENT_ICON[e.event];
        return (
          <li key={e.id}>
            <span className={`a-ico ${cls}`}>
              <Icon name={icon} size={15} />
            </span>
            <div>
              <strong>{EVENT_LABELS[e.event]}</strong>
              <time dateTime={e.at}>{fmtDateTime(e.at)}</time>
              {e.detail && <small>{e.detail}</small>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Cuenta atrás en días, horas, minutos y segundos */
export function Countdown({ to, label }: { to: string; label: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(to).getTime() - now);
  const parts: [string, string][] = [
    [String(Math.floor(diff / DAY)), "días"],
    [String(Math.floor(diff / 36e5) % 24).padStart(2, "0"), "horas"],
    [String(Math.floor(diff / 6e4) % 60).padStart(2, "0"), "min"],
    [String(Math.floor(diff / 1e3) % 60).padStart(2, "0"), "seg"],
  ];
  return (
    <div className="countdown" aria-label={label}>
      {parts.map(([v, unit]) => (
        <div key={unit}>
          <b>{v}</b>
          <small>{unit}</small>
        </div>
      ))}
    </div>
  );
}

/** «QR» decorativo generado a partir del hash del documento */
function FakeQR({ hash }: { hash: string }) {
  const bits = hash.split("").map((c) => parseInt(c, 16).toString(2).padStart(4, "0")).join("");
  const cells: [number, number][] = [];
  let k = 0;
  for (let y = 0; y < 21; y++)
    for (let x = 0; x < 21; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      if (bits[k++ % bits.length] === "1") cells.push([x, y]);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#111" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#111" />
    </g>
  );
  return (
    <svg viewBox="-1 -1 23 23" width="84" height="84" role="img" aria-label="Código de verificación (simulado)" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width="23" height="23" fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width="1" height="1" fill="#111" />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  );
}

/** Certificado de firma electrónica (imprimible) */
export function Certificate({ contract, signature: s, id }: { contract: Contract; signature: Signature; id?: string }) {
  const local = new Date(s.signedAt).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "long" });
  const rows: [string, string, string?][] = [
    ["ID de documento", s.docId, "mono"],
    ["Firmante", s.name],
    ["Fecha y hora (ISO 8601, UTC)", s.signedAt, "mono"],
    ["Fecha y hora (local)", local],
    ["Navegador", s.client.browser],
    ["Sistema operativo", s.client.os],
    ["Idioma", s.client.language],
  ];
  return (
    <section className="cert print-area" id={id} aria-labelledby="certTitle">
      <header className="cert-head">
        <span className="logo-mark" aria-hidden="true" />
        <div>
          <p>{config.label.name} · Certificado de firma electrónica</p>
          <h2 id="certTitle">{contract.title}</h2>
        </div>
        <div className="qr">
          <FakeQR hash={s.hash} />
        </div>
      </header>
      <span className="cert-seal">
        <Icon name="check" size={13} /> Documento firmado
      </span>
      <dl className="cert-grid">
        {rows.slice(0, 4).map(([dt, dd, cls]) => (
          <div key={dt}>
            <dt>{dt}</dt>
            <dd className={cls}>{dd}</dd>
          </div>
        ))}
        <div>
          <dt>Dirección IP</dt>
          <dd className="mono">
            {s.ip} <small>({s.ipSource})</small>
          </dd>
        </div>
        {rows.slice(4).map(([dt, dd]) => (
          <div key={dt}>
            <dt>{dt}</dt>
            <dd>{dd}</dd>
          </div>
        ))}
        <div>
          <dt>Zona horaria</dt>
          <dd>
            {s.client.timezone} <small>(UTC{s.client.utcOffset})</small>
          </dd>
        </div>
        <div>
          <dt>Resolución de pantalla</dt>
          <dd>{s.client.screen}</dd>
        </div>
        <div className="wide">
          <dt>User agent</dt>
          <dd className="mono xs">{s.userAgent}</dd>
        </div>
        <div className="wide">
          <dt>Huella SHA-256 (texto del contrato + fecha de firma)</dt>
          <dd className="mono xs break">{s.hash}</dd>
        </div>
      </dl>
      <div className="cert-sign">
        <div>
          <img src={s.image} alt={`Firma manuscrita de ${s.name}`} />
          <p>{s.name} · LA ARTISTA</p>
        </div>
        <div className="no-print">
          <button type="button" className="btn btn-accent" onClick={() => window.print()}>
            <Icon name="download" /> Descargar comprobante
          </button>
        </div>
      </div>
      <p className="cert-foot">Certificado generado en una demo con datos ficticios. Sin validez legal. Algoritmo: {s.algo}.</p>
    </section>
  );
}
