import { useEffect, useState } from "react";
import { Photo } from "../../components/Photo";
import { Reveal } from "../../components/Reveal";
import { config } from "../../config";
import { useInView } from "../../hooks/useInView";
import { usePageTitle } from "../../hooks/usePageTitle";
import { fmtNum } from "../../lib/format";

/** Contador que sube hasta `to` la primera vez que entra en pantalla */
function CountUp({ to }: { to: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{fmtNum(v)}</span>;
}

export function Label() {
  usePageTitle("El sello");
  const { about } = config;
  return (
    <>
      <section className="page-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap relative">
          <Reveal as="p" className="eyebrow">
            {about.eyebrow}
          </Reveal>
          <Reveal as="h1">
            Música hecha <span className="serif accent">de noche</span>, para quien escucha de verdad.
          </Reveal>
          <Reveal as="p" className="lead">
            {config.label.description}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap story">
          <Reveal>
            <p className="eyebrow">Historia</p>
            <p className="big">{about.quote}</p>
            <p className="small">— {about.quoteAuthor}</p>
          </Reveal>
          <Reveal>
            {about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ul className="milestones mt-9">
              {about.milestones.map(([year, text]) => (
                <li key={year}>
                  <strong>{year}</strong>
                  <span className="muted">{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap grid-2">
          {(
            [
              ["Misión", about.mission],
              ["Visión", about.vision],
            ] as const
          ).map(([label, block]) => (
            <Reveal key={label} className="value-card">
              <span className="num">{label}</span>
              <h3>{block.title}</h3>
              <p>{block.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Valores</p>
              <h2>
                Lo que nos <span className="serif">mueve</span>
              </h2>
            </div>
          </header>
          <div className="grid-4">
            {about.values.map(([title, text], i) => (
              <Reveal key={title} className="value-card">
                <span className="num">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Cifras del sello">
        <div className="wrap">
          <div className="stats">
            {about.stats.map((s) => (
              <Reveal key={s.label} className="stat">
                <strong>
                  <CountUp to={s.value} />
                  {s.suffix && <span className="accent">{s.suffix}</span>}
                </strong>
                <span>{s.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Equipo</p>
              <h2>
                Las personas <span className="serif">detrás</span>
              </h2>
            </div>
          </header>
          <div className="grid-4">
            {about.team.map((p) => (
              <Reveal as="article" key={p.name} className="team-card">
                <Photo src={p.photo} alt={p.name} />
                <h3>{p.name}</h3>
                <p className="accent small">{p.role}</p>
                <p className="muted small mt-1.5">{p.bio}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
