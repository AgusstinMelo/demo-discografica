import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { Photo } from "../../components/Photo";
import { Countdown } from "../../components/private/contractWidgets";
import { Reveal } from "../../components/Reveal";
import { config } from "../../config";
import { artistById, getCatalog } from "../../lib/catalog";
import { contractState } from "../../lib/contracts";
import { addDays, fmtCompact, fmtDate, fmtDateLong, fmtEur, greeting, iso, TODAY_ISO } from "../../lib/format";
import { useContracts } from "./PortalLayout";

export function Dashboard() {
  const { portal } = config;
  const artist = artistById(portal.artistId)!;
  const contracts = useContracts().data ?? [];
  const active = contracts.filter((c) => contractState(c) === "signed");
  const pending = contracts.filter((c) => contractState(c) === "pending");
  const next = active.filter((c) => c.end >= TODAY_ISO).sort((x, y) => x.end.localeCompare(y.end))[0];
  const catalog = getCatalog(portal.artistId);
  const totalStreams = catalog.reduce((s, r) => s + r.streams, 0);
  const payment = portal.payments[0];
  const m = portal.manager;

  return (
    <>
      <Reveal className="welcome">
        <Photo src={artist.photo} alt={artist.name} />
        <div>
          <p className="eyebrow mb-2">{new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
          <h1>
            {greeting()}, {artist.name.split(" ")[0]}
          </h1>
          <p>Esto es lo que está pasando con tu música esta semana.</p>
        </div>
        <Link className="btn btn-accent" to="/portal/catalogo">
          <Icon name="chart" /> Ver mis cifras
        </Link>
      </Reveal>

      {pending.length > 0 && (
        <Reveal className="alert" role="status">
          <Icon name="pen" size={20} />
          <div>
            <p>
              <strong>Tienes {pending.length} contrato pendiente de firma:</strong> {pending[0].title}.
            </p>
          </div>
          <Link className="btn btn-sm btn-accent ml-auto" to={`/portal/contratos/${pending[0].id}`}>
            Revisar y firmar
          </Link>
        </Reveal>
      )}

      <div className="kpis">
        <Reveal className="kpi">
          <span><Icon name="file" size={15} /> Contratos activos</span>
          <strong>{active.length}</strong>
          <small>de {contracts.length} en total</small>
        </Reveal>
        <Reveal className="kpi">
          <span><Icon name="disc" size={15} /> Lanzamientos</span>
          <strong>{catalog.length}</strong>
          <small>{catalog.reduce((s, r) => s + r.tracks.length, 0)} canciones gestionadas</small>
        </Reveal>
        <Reveal className="kpi">
          <span><Icon name="chart" size={15} /> Streams totales</span>
          <strong>{fmtCompact(totalStreams)}</strong>
          <small>todas las plataformas</small>
        </Reveal>
        <Reveal className="kpi highlight">
          <span><Icon name="clock" size={15} /> Próximo fin de contrato</span>
          {next ? (
            <>
              <strong className="text-[1.15rem]">{next.title}</strong>
              <small>Vence el {fmtDate(next.end)}</small>
              <Countdown to={`${next.end}T23:59:59`} label={`Cuenta atrás hasta el ${fmtDateLong(next.end)}`} />
            </>
          ) : (
            <>
              <strong>—</strong>
              <small>Sin contratos activos</small>
            </>
          )}
        </Reveal>
      </div>

      <div className="dash-grid">
        <Reveal as="section" className="card" aria-labelledby="notTitle">
          <h2 className="card-title" id="notTitle">
            <Icon name="bell" /> Avisos del sello
          </h2>
          {portal.notices.map((n) => (
            <article key={n.title} className="notice">
              <span className="ico-wrap">
                <Icon name={n.icon} />
              </span>
              <div>
                <h3>{n.title}</h3>
                <p>{n.text}</p>
                <p className="xs muted mt-1.5">{fmtDate(iso(addDays(-n.daysAgo)))}</p>
              </div>
            </article>
          ))}
        </Reveal>
        <div className="grid gap-6">
          <Reveal as="section" className="card" aria-labelledby="mgrTitle">
            <h2 className="card-title" id="mgrTitle">
              <Icon name="user" /> Tu manager en el sello
            </h2>
            <div className="manager">
              <Photo src={m.photo} alt={m.name} />
              <div>
                <strong>{m.name}</strong>
                <p className="muted small m-0">{m.role}</p>
              </div>
            </div>
            <p className="small mb-1.5">
              <Icon name="mail" size={15} className="inline-ico" /> <a href={`mailto:${m.email}`}>{m.email}</a>
            </p>
            <p className="small mb-1.5">
              <Icon name="phone" size={15} className="inline-ico" /> {m.phone}
            </p>
            <p className="small muted mb-4">
              <Icon name="clock" size={15} className="inline-ico" /> {m.hours}
            </p>
            <a className="btn btn-ghost btn-sm" href={`mailto:${m.email}?subject=Consulta%20desde%20el%20portal`}>
              Escribir a {m.name.split(" ")[0]}
            </a>
          </Reveal>
          <Reveal as="section" className="card">
            <h2 className="card-title">
              <Icon name="euro" /> Próximo pago
            </h2>
            <p className="font-display text-[2rem] leading-none font-bold mb-1.5">{fmtEur(payment.amount)}</p>
            <p className="muted small">
              {payment.period} · estimado para el {fmtDate(iso(addDays(payment.daysFromToday)))}
            </p>
            <Link className="btn btn-soft btn-sm" to="/portal/relacion">
              Ver calendario de pagos
            </Link>
          </Reveal>
        </div>
      </div>
    </>
  );
}
