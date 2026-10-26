import { Link } from "react-router";
import { ArtistCard, ReleaseCard } from "../../components/cards";
import { CoverArt } from "../../components/CoverArt";
import { Icon } from "../../components/Icon";
import { NewsletterForm } from "../../components/NewsletterForm";
import { PlayButton, ProgressBar, TimeLabel } from "../../components/player/PlayerControls";
import { Reveal } from "../../components/Reveal";
import { config } from "../../config";
import { usePageTitle } from "../../hooks/usePageTitle";
import { artistById, artists, isUpcoming, releaseById, releases } from "../../lib/catalog";
import { fmtDate, fmtTime } from "../../lib/format";
import { usePlayer } from "../../lib/player";

export function Home() {
  usePageTitle();
  const f = releaseById(config.featuredRelease)!;
  const fa = artistById(f.artist)!;
  const t0 = f.tracks[0];
  const playing = usePlayer((s) => s.playing);
  const upcoming = releases.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const marquee = [...config.genres, ...config.marquee];

  return (
    <>
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <Reveal as="p" className="eyebrow">
              <span className="dot" />
              Último lanzamiento · {fmtDate(f.date)}
            </Reveal>
            <Reveal as="h1" className="display">
              {f.title}
            </Reveal>
            <Reveal as="p" className="hero-artist">
              <Link to={`/artistas/${fa.id}`}>{fa.name}</Link>{" "}
              <span className="muted">
                · {f.type} · {f.tracks.length} canciones
              </span>
            </Reveal>
            <Reveal as="p" className="lead">
              {f.blurb}
            </Reveal>
            <Reveal className="btn-row">
              <PlayButton tid={t0.id} label="Escuchar" className="btn btn-accent btn-lg" />
              <Link className="btn btn-ghost btn-lg" to={`/artistas/${fa.id}`}>
                Ver artista <Icon name="arrow" />
              </Link>
            </Reveal>
            <Reveal className="hero-progress">
              <p className="small muted mb-2">
                <Icon name="music" size={14} className="inline-ico" /> {t0.title}
              </p>
              <div className="player-line">
                <span className="time">
                  <TimeLabel tid={t0.id} />
                </span>
                <ProgressBar tid={t0.id} />
                <span className="time">{fmtTime(t0.dur)}</span>
              </div>
            </Reveal>
          </div>
          <Reveal className={`hero-art ${playing ? "is-playing" : ""}`}>
            <div className="vinyl" aria-hidden="true">
              <div className="vinyl-label">
                <CoverArt seed={f.id + "-label"} withText={false} />
              </div>
            </div>
            <div className="cover cover-hero">
              <CoverArt seed={f.id} label={f.title} />
            </div>
          </Reveal>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Agenda</p>
              <h2>
                Próximos <span className="serif">lanzamientos</span>
              </h2>
            </div>
            <Link className="btn btn-ghost" to="/artistas">
              Todo el catálogo <Icon name="arrow" />
            </Link>
          </header>
          <div className="grid-4">
            {upcoming.map((r) => (
              <ReleaseCard key={r.id} release={r} />
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Roster</p>
              <h2>
                Artistas <span className="serif">destacados</span>
              </h2>
            </div>
            <Link className="btn btn-ghost" to="/artistas">
              Ver los {artists.length} artistas <Icon name="arrow" />
            </Link>
          </header>
          <div className="grid-4">
            {artists.slice(0, 4).map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="wrap">
          <Reveal className="nl-block">
            <div>
              <p className="eyebrow">Newsletter</p>
              <h2>
                Entérate <span className="serif">antes que nadie.</span>
              </h2>
              <p className="muted m-0">Preescuchas exclusivas, preventas de vinilo y entradas para los conciertos del sello. Un email al mes.</p>
            </div>
            <NewsletterForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
