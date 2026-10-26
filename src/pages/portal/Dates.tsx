import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { ContractTag } from "../../components/private/contractWidgets";
import { Reveal } from "../../components/Reveal";
import { config } from "../../config";
import { CONTRACT_TYPES, contractState, STATES } from "../../lib/contracts";
import { daysUntil, fmtDate, fmtDateLong, fmtNum, parseDay, TODAY_ISO } from "../../lib/format";
import { useContracts } from "./PortalLayout";

const BAR_CLASS = { signed: "firmado", pending: "pendiente", expired: "vencido" };

export function Dates() {
  const cs = useContracts().data;
  if (!cs) return <p className="muted">Cargando…</p>;
  if (!cs.length) return <p className="empty">No hay contratos.</p>;

  const minY = Math.min(...cs.map((c) => parseDay(c.start).getFullYear()));
  const maxY = Math.max(...cs.map((c) => parseDay(c.end).getFullYear())) + 1;
  const t0 = new Date(minY, 0, 1).getTime();
  const t1 = new Date(maxY, 0, 1).getTime();
  const pos = (d: string) => ((parseDay(d).getTime() - t0) / (t1 - t0)) * 100;
  const years = Array.from({ length: maxY - minY + 1 }, (_, i) => minY + i);
  const soon = cs.filter((c) => contractState(c) === "signed" && daysUntil(c.end) >= 0 && daysUntil(c.end) <= 90);
  const pend = cs.filter((c) => contractState(c) === "pending");
  const m = config.portal.manager;

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Fechas de contrato</h1>
          <p>Inicio y fin de cada contrato en una línea de tiempo.</p>
        </div>
      </header>

      {soon.map((c) => (
        <Reveal key={c.id} className="alert" role="alert">
          <Icon name="alert" size={20} />
          <div>
            <p>
              <strong>{c.title}</strong> vence en <strong>{daysUntil(c.end)} días</strong> ({fmtDateLong(c.end)}).
            </p>
            <p className="small muted">Quedan menos de 90 días: contacta con tu manager para renovar o renegociar.</p>
          </div>
          <a className="btn btn-sm btn-ghost ml-auto" href={`mailto:${m.email}?subject=Renovaci%C3%B3n%20${encodeURIComponent(c.id)}`}>
            Hablar con {m.name.split(" ")[0]}
          </a>
        </Reveal>
      ))}
      {pend.map((c) => (
        <Reveal key={c.id} className="alert info">
          <Icon name="info" size={20} />
          <div>
            <p>
              <strong>{c.title}</strong> está pendiente de firma. Comenzaría el {fmtDateLong(c.start)}.
            </p>
          </div>
          <Link className="btn btn-sm btn-accent ml-auto" to={`/portal/contratos/${c.id}`}>
            Firmar
          </Link>
        </Reveal>
      ))}

      <Reveal as="section" className="card" aria-labelledby="tlTitle">
        <h2 className="card-title" id="tlTitle">
          <Icon name="calendar" /> Línea de tiempo
        </h2>
        <div className="timeline">
          <div className="tl-years" aria-hidden="true">
            {years.map((y) => (
              <span key={y} style={{ left: `${pos(`${y}-01-01`)}%` }}>
                {y}
              </span>
            ))}
          </div>
          <div className="tl-body">
            <div className="tl-overlay" aria-hidden="true">
              <div className="tl-today" style={{ left: `${pos(TODAY_ISO)}%` }}>
                <span>Hoy</span>
              </div>
            </div>
            {cs.map((c) => {
              const st = contractState(c);
              const isSoon = soon.includes(c);
              return (
                <div key={c.id} className="tl-row">
                  <div className="tl-label">
                    <strong>{CONTRACT_TYPES[c.type]}</strong>
                    <small>
                      {fmtDate(c.start)} → {fmtDate(c.end)}
                    </small>
                  </div>
                  <div className="tl-track">
                    <div
                      className={`tl-bar ${BAR_CLASS[st]} ${isSoon ? "soon" : ""}`}
                      style={{ left: `${pos(c.start)}%`, width: `${pos(c.end) - pos(c.start)}%` }}
                      title={`${c.title}: ${fmtDate(c.start)} → ${fmtDate(c.end)}`}
                    >
                      {STATES[st].label}
                      {isSoon && ` · ${daysUntil(c.end)} d`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="legend">
          <span><i className="bg-[rgba(94,227,152,.6)]" />Firmado · vigente</span>
          <span><i className="bg-[rgba(255,200,87,.45)]" />Pendiente de firma</span>
          <span><i className="bg-[rgba(255,255,255,.15)]" />Vencido</span>
          <span><i className="bg-accent-2" />Hoy</span>
        </div>
      </Reveal>

      <Reveal className="table-wrap mt-6">
        <table>
          <caption className="sr-only">Resumen de fechas</caption>
          <thead>
            <tr>
              <th>Contrato</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th className="num">Días restantes</th>
            </tr>
          </thead>
          <tbody>
            {cs.map((c) => {
              const d = daysUntil(c.end);
              return (
                <tr key={c.id}>
                  <td>
                    <Link to={`/portal/contratos/${c.id}`}>{c.title}</Link>
                  </td>
                  <td>
                    <ContractTag contract={c} />
                  </td>
                  <td>{fmtDate(c.start)}</td>
                  <td>{fmtDate(c.end)}</td>
                  <td className="num">
                    {d < 0 ? <span className="muted">Venció hace {-d} d</span> : d <= 90 ? <strong className="text-warn">{d}</strong> : fmtNum(d)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Reveal>
    </>
  );
}
