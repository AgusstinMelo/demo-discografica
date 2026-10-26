import { Icon } from "../../components/Icon";
import { Reveal } from "../../components/Reveal";
import { config } from "../../config";
import { labelSignedOn } from "../../lib/catalog";
import { addDays, DAY, downloadFile, fmtDate, fmtDateLong, fmtEur, iso, parseDay, TODAY } from "../../lib/format";
import { toast } from "../../lib/toast";

const PAY_TAG: Record<string, string> = { Pagado: "tag-ok", "En cálculo": "tag-warn", Estimado: "tag-info" };

export function Relation() {
  const { portal } = config;
  const years = ((TODAY.getTime() - parseDay(labelSignedOn).getTime()) / (365 * DAY)).toFixed(1).replace(".", ",");
  return (
    <>
      <header className="app-head">
        <div>
          <h1>Mi relación con el sello</h1>
          <p>Información general, pagos, documentos y preguntas frecuentes.</p>
        </div>
      </header>

      <div className="kpis">
        <Reveal className="kpi">
          <span><Icon name="heart" size={15} /> En Nocturna desde</span>
          <strong className="text-[1.4rem]">{fmtDateLong(labelSignedOn)}</strong>
          <small>{years} años juntos</small>
        </Reveal>
        <Reveal className="kpi">
          <span><Icon name="user" size={15} /> Contacto asignado</span>
          <strong className="text-[1.4rem]">{portal.manager.name}</strong>
          <small>
            <a href={`mailto:${portal.manager.email}`}>{portal.manager.email}</a>
          </small>
        </Reveal>
        <Reveal className="kpi">
          <span><Icon name="euro" size={15} /> Royalties cobrados (12 m)</span>
          <strong>{fmtEur(portal.royaltiesLast12m)}</strong>
          <small>4 liquidaciones</small>
        </Reveal>
      </div>

      <div className="grid-2 items-start">
        <Reveal as="section" className="card" aria-labelledby="payTitle">
          <h2 className="card-title" id="payTitle">
            <Icon name="euro" /> Próximos pagos de royalties
          </h2>
          <div className="table-wrap border-0 bg-transparent">
            <table>
              <caption className="sr-only">Calendario de pagos</caption>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Fecha est.</th>
                  <th className="num">Importe</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {portal.payments.map((p) => (
                  <tr key={p.period}>
                    <td>{p.period}</td>
                    <td>{fmtDate(iso(addDays(p.daysFromToday)))}</td>
                    <td className="num">{fmtEur(p.amount)}</td>
                    <td>
                      <span className={`tag ${PAY_TAG[p.status]}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="xs muted mt-3 mb-0">Importes estimados y ficticios. Se confirman al cierre de cada liquidación.</p>
        </Reveal>

        <Reveal as="section" className="card" aria-labelledby="docTitle">
          <h2 className="card-title" id="docTitle">
            <Icon name="file" /> Documentos
          </h2>
          {/* API REAL: archivos privados en Supabase Storage con URL firmada (createSignedUrl) */}
          <ul className="doc-list">
            {portal.documents.map((d) => (
              <li key={d.file}>
                <span className="ico-wrap">
                  <Icon name="file" />
                </span>
                <div>
                  <strong>{d.name}</strong>
                  <small>{d.meta}</small>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Descargar ${d.name}`}
                  onClick={() => {
                    downloadFile(d.file, d.body);
                    toast(`Descargando «${d.name}» (documento de ejemplo).`, "info");
                  }}
                >
                  <Icon name="download" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal as="section" className="card faq mt-6" aria-labelledby="faqTitle">
        <h2 className="card-title" id="faqTitle">
          <Icon name="info" /> Preguntas frecuentes
        </h2>
        {portal.faq.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </Reveal>
    </>
  );
}
