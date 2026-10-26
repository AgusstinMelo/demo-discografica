import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { fmtDateTime, fmtNum } from "../../lib/format";
import { useCampaigns } from "./AdminLayout";

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export function History() {
  const camps = useCampaigns().data ?? [];
  const sent = camps.reduce((s, c) => s + c.sent, 0);
  const opens = camps.reduce((s, c) => s + c.opens, 0);
  const clicks = camps.reduce((s, c) => s + c.clicks, 0);

  return (
    <>
      <header className="app-head">
        <div>
          <h1>Historial de campañas</h1>
          <p>Métricas de apertura y clics de cada envío (ficticias).</p>
        </div>
        <Link className="btn btn-accent btn-sm" to="/admin/campana">
          <Icon name="plus" size={16} /> Nueva campaña
        </Link>
      </header>

      <div className="kpis">
        <div className="kpi">
          <span>Campañas enviadas</span>
          <strong>{camps.length}</strong>
        </div>
        <div className="kpi">
          <span>Emails entregados</span>
          <strong>{fmtNum(sent)}</strong>
        </div>
        <div className="kpi highlight">
          <span>Tasa de apertura</span>
          <strong>{pct(opens, sent)}%</strong>
          <small>media del sector musical: ~22%</small>
        </div>
        <div className="kpi">
          <span>Tasa de clics</span>
          <strong>{pct(clicks, sent)}%</strong>
          <small>{pct(clicks, opens)}% de quienes abren</small>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <caption className="sr-only">Historial de campañas</caption>
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Fecha</th>
              <th className="num">Enviados</th>
              <th>Aperturas</th>
              <th>Clics</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {camps.map((c) => (
              <tr key={c.id}>
                <td>
                  <strong className="font-semibold">{c.subject}</strong>
                </td>
                <td className="muted">{fmtDateTime(c.sentAt)}</td>
                <td className="num">{fmtNum(c.sent)}</td>
                <td>
                  <div className="meter">
                    <span className="m">
                      <span style={{ width: `${pct(c.opens, c.sent)}%` }} />
                    </span>
                    <span className="small mono">
                      {pct(c.opens, c.sent)}% ({c.opens})
                    </span>
                  </div>
                </td>
                <td>
                  <div className="meter">
                    <span className="m">
                      <span className="bg-accent-2" style={{ width: `${pct(c.clicks, c.sent)}%` }} />
                    </span>
                    <span className="small mono">
                      {pct(c.clicks, c.sent)}% ({c.clicks})
                    </span>
                  </div>
                </td>
                <td>
                  <span className="tag tag-ok">Enviada</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
