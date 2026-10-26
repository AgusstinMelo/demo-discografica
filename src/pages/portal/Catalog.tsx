import { useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { Icon } from "../../components/Icon";
import { StreamsChart } from "../../components/private/StreamsChart";
import { Reveal } from "../../components/Reveal";
import { config } from "../../config";
import { getCatalog, monthlyStreams } from "../../lib/catalog";
import { fmtCompact, fmtDate, fmtNum, fmtTime } from "../../lib/format";

export function Catalog() {
  const [q, setQ] = useState("");
  const catalog = getCatalog(config.portal.artistId);
  const months = monthlyStreams(config.portal.artistId);
  const total = months.reduce((s, m) => s + m.v, 0);
  const last = months[months.length - 1].v;
  const prev = months[months.length - 2].v;
  const change = Math.round(((last - prev) / prev) * 100);

  const query = q.trim().toLowerCase();
  const rows = catalog.flatMap((r) => r.tracks.map((t) => ({ r, t })));
  const shownRows = rows.filter(({ r, t }) => `${t.title} ${r.title} ${t.isrc} ${r.upc}`.toLowerCase().includes(query));
  const shownReleases = catalog.filter((r) => `${r.title} ${r.upc} ${r.tracks.map((t) => `${t.title} ${t.isrc}`).join(" ")}`.toLowerCase().includes(query));

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Mi catálogo</h1>
          <p>Lanzamientos y canciones gestionados por {config.label.name}.</p>
        </div>
      </header>

      <div className="kpis">
        <Reveal className="kpi">
          <span>Streams (12 meses)</span>
          <strong>{fmtCompact(total)}</strong>
          <small>todas las plataformas</small>
        </Reveal>
        <Reveal className="kpi">
          <span>Este mes</span>
          <strong>{fmtCompact(last)}</strong>
          <small className={change >= 0 ? "accent" : ""}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% vs. mes anterior
          </small>
        </Reveal>
        <Reveal className="kpi">
          <span>Lanzamientos</span>
          <strong>{catalog.length}</strong>
          <small>{rows.length} canciones con ISRC</small>
        </Reveal>
      </div>

      <Reveal as="section" className="card mb-6" aria-labelledby="chartTitle">
        <div className="section-head mb-3">
          <h2 className="card-title m-0" id="chartTitle">
            <Icon name="chart" /> Streams por mes
          </h2>
          <span className="muted small">Últimos 12 meses · pasa el ratón o enfoca una barra</span>
        </div>
        <StreamsChart data={months} />
      </Reveal>

      <div className="toolbar">
        <label className="search">
          <span className="sr-only">Buscar en el catálogo</span>
          <Icon name="search" />
          <input type="search" placeholder="Buscar por título, lanzamiento, ISRC o UPC…" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <span className="muted small" aria-live="polite">
          {shownRows.length} canci{shownRows.length === 1 ? "ón" : "ones"}
        </span>
      </div>

      <div className="grid-3 mb-6">
        {shownReleases.map((r) => (
          <Reveal as="article" key={r.id} className="card grid grid-cols-[96px_1fr] gap-4 p-4">
            <div className="cover">
              <CoverArt seed={r.id} label={r.title} />
            </div>
            <div className="min-w-0">
              <strong className="block">{r.title}</strong>
              <span className="muted small">
                {r.type} · {fmtDate(r.date)}
              </span>
              <p className="mono xs muted my-1.5">UPC {r.upc}</p>
              <p className="m-0 font-bold">
                {fmtNum(r.streams)} <span className="muted small font-normal">streams</span>
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="table-wrap">
        <table>
          <caption className="sr-only">Canciones del catálogo</caption>
          <thead>
            <tr>
              <th>Canción</th>
              <th>ISRC</th>
              <th>UPC</th>
              <th>Lanzamiento</th>
              <th>Plataformas</th>
              <th className="num">Streams</th>
            </tr>
          </thead>
          <tbody>
            {shownRows.map(({ r, t }) => (
              <tr key={t.id}>
                <td>
                  <div className="cell-cover">
                    <div className="cover">
                      <CoverArt seed={r.id} label={r.title} withText={false} />
                    </div>
                    <div>
                      <strong>{t.title}</strong>
                      <small>
                        {r.title} · {fmtTime(t.dur)}
                      </small>
                    </div>
                  </div>
                </td>
                <td className="mono">{t.isrc}</td>
                <td className="mono">{r.upc}</td>
                <td>{fmtDate(r.date)}</td>
                <td>
                  <div className="platforms">
                    {r.platforms.map((p) => (
                      <span key={p} className="tag plain">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="num">{fmtNum(t.streams)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shownRows.length && <p className="empty m-4 border-0">No hay resultados para esa búsqueda.</p>}
      </Reveal>
    </>
  );
}
