import { Fragment } from "react";
import { config, type EmailContent } from "../../config";
import { CoverArt } from "../CoverArt";

/** Markdown mínimo: párrafos separados por línea en blanco, **negrita** y saltos de línea */
function MdLite({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>
          {para.split("\n").map((line, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {line.split(/\*\*(.+?)\*\*/g).map((chunk, k) => (k % 2 ? <strong key={k}>{chunk}</strong> : chunk))}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

export function EmailPreview({ email: d }: { email: EmailContent }) {
  return (
    <>
      <div className="inbox-line" aria-hidden="true">
        <span className="av">
          <span />
        </span>
        <b>{config.label.name}</b>
        <em>
          <b className="font-semibold text-[#222]">{d.subject || "(sin asunto)"}</b> — {d.preheader}
        </em>
      </div>
      <div className="email" role="document" aria-label="Vista previa del email">
        <div className="email-head">
          <span className="logo-mark size-[26px]" aria-hidden="true" /> {config.label.name}
        </div>
        <div className="email-hero">
          <CoverArt seed={`email-${(d.subject || "").length % 7}`} label="Cabecera del email" withText={false} />
        </div>
        <div className="email-body">
          <h2>{d.subject || "Escribe un asunto"}</h2>
          <MdLite text={d.body || ""} />
          {d.cta && (
            <a className="email-cta" href={d.url || "#"} onClick={(e) => e.preventDefault()}>
              {d.cta}
            </a>
          )}
        </div>
        <div className="email-foot">
          Recibes este email porque te suscribiste a la newsletter de {config.label.name}.
          <br />
          {config.label.address} · <u>Darse de baja</u> · <u>Preferencias</u>
        </div>
      </div>
    </>
  );
}
