import { Link } from "react-router";
import { Icon } from "../../components/Icon";
import { ContractTag } from "../../components/private/contractWidgets";
import { Reveal } from "../../components/Reveal";
import { CONTRACT_TYPES, contractState } from "../../lib/contracts";
import { fmtDate } from "../../lib/format";
import { useContracts } from "./PortalLayout";

export function Contracts() {
  const contracts = useContracts().data;
  return (
    <>
      <header className="app-head">
        <div>
          <h1>Mis contratos</h1>
          <p>Consulta, lee y firma tus contratos con el sello.</p>
        </div>
      </header>
      {!contracts && <p className="muted">Cargando contratos…</p>}
      <div className="contract-list">
        {contracts?.map((c) => {
          const pending = contractState(c) === "pending";
          return (
            <Reveal as="article" key={c.id} className="contract-card">
              <div>
                <div className="btn-row gap-2">
                  <ContractTag contract={c} />
                  <span className="tag plain">{CONTRACT_TYPES[c.type]}</span>
                  <span className="tag plain mono">{c.id.toUpperCase()}</span>
                </div>
                <h2>{c.title}</h2>
                <dl className="contract-meta">
                  <div><dt>Inicio</dt><dd>{fmtDate(c.start)}</dd></div>
                  <div><dt>Fin</dt><dd>{fmtDate(c.end)}</dd></div>
                  <div><dt>Royalties</dt><dd className="accent">{c.royalties}%</dd></div>
                  <div><dt>Territorio</dt><dd>{c.territory}</dd></div>
                </dl>
              </div>
              <Link className={`btn ${pending ? "btn-accent" : "btn-ghost"}`} to={`/portal/contratos/${c.id}`}>
                {pending ? (
                  <><Icon name="pen" /> Revisar y firmar</>
                ) : (
                  <><Icon name="eye" /> Ver contrato</>
                )}
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
