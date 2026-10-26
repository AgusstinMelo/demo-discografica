import { Link, useParams } from "react-router";
import { ReleaseCard } from "../../components/cards";
import { CoverArt } from "../../components/CoverArt";
import { Icon } from "../../components/Icon";
import { Photo } from "../../components/Photo";
import { PlayButton, ProgressBar, TimeLabel, TrackRow } from "../../components/player/PlayerControls";
import { Reveal } from "../../components/Reveal";
import { SocialButtons } from "../../components/SocialButtons";
import { usePageTitle } from "../../hooks/usePageTitle";
import { artistById, isUpcoming, releaseMinutes, releasesBy } from "../../lib/catalog";
import { fmtNum, fmtTime } from "../../lib/format";
import { NotFound } from "../NotFound";

export function ArtistDetail() {
  const { id = "" } = useParams();
  const a = artistById(id);
  usePageTitle(a?.name ?? "No encontrado");
  if (!a) return <NotFound />;

  const rels = releasesBy(a.id).sort((x, y) => y.date.localeCompare(x.date));
  const top = rels.find((r) => !isUpcoming(r)) ?? rels[0];

  return (
    <>
      <section className="artist-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="wrap relative">
          <Link to="/artistas" className="back">
            <Icon name="back" size={16} /> Todos los artistas
          </Link>
          <div className="artist-hero-grid">
            <Reveal>
              <Photo src={a.photo} alt={a.name} />
            </Reveal>
            <Reveal>
              <span className="tag tag-accent">{a.genre}</span>
              <h1>{a.name}</h1>
              <div className="meta-line">
                <span>
                  <Icon name="pin" size={15} className="inline-ico" /> {a.city}
                </span>
                <span>
                  En Nocturna desde <b>{a.since}</b>
                </span>
                <span>
                  <b>{fmtNum(a.listeners)}</b> oyentes mensuales
                </span>
              </div>
              <p className="lead max-w-[62ch]">{a.bio}</p>
              <div className="btn-row mt-6">
                {top && <PlayButton tid={top.tracks[0].id} label={`Escuchar ${top.title}`} className="btn btn-accent" />}
                <Link className="btn btn-ghost" to="/contacto">
                  Contratar · booking
                </Link>
              </div>
              <div className="socials" aria-label="Redes sociales">
                <SocialButtons socials={a.socials} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap artist-layout">
          {top && (
            <Reveal className="card player-card" aria-label="Reproductor simulado">
              <div className="player-top">
                <div className="cover">
                  <CoverArt seed={top.id} label={top.title} />
                </div>
                <div>
                  <p className="eyebrow mb-2">
                    {top.type} · {new Date(top.date).getFullYear()}
                  </p>
                  <h3>{top.title}</h3>
                  <p className="muted small m-0">
                    {top.tracks.length} canciones · {releaseMinutes(top)} min
                  </p>
                </div>
              </div>
              <ol className="tracklist">
                {top.tracks.map((t, i) => (
                  <TrackRow key={t.id} tid={t.id}>
                    <span className="t-num">
                      <span>{i + 1}</span>
                      <span className="eq" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    </span>
                    <PlayButton tid={t.id} className="icon-btn sm" />
                    <div className="min-w-0">
                      <div className="t-title">{t.title}</div>
                      <div className="player-line mt-1.5">
                        <ProgressBar tid={t.id} />
                      </div>
                    </div>
                    <span className="t-dur">
                      <TimeLabel tid={t.id} /> / {fmtTime(t.dur)}
                    </span>
                  </TrackRow>
                ))}
              </ol>
              {/* API REAL: <audio> con previews de 30 s guardadas en Supabase Storage */}
              <p className="xs muted m-0">Reproductor simulado: no se reproduce audio real.</p>
            </Reveal>
          )}
          <Reveal>
            <h2 className="text-[1.6rem]">Discografía</h2>
            <div className="disco-grid">
              {rels.map((r) => (
                <ReleaseCard key={r.id} release={r} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
