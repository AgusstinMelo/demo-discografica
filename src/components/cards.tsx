import type { CSSProperties } from "react";
import { Link } from "react-router";
import type { Artist, Playlist } from "../config";
import { artistById, getTrack, isUpcoming, type Release } from "../lib/catalog";
import { daysUntil, fmtDate, fmtNum, fmtTime } from "../lib/format";
import { CoverArt } from "./CoverArt";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import { PlayButton, TrackRow } from "./player/PlayerControls";
import { Reveal } from "./Reveal";

export function ReleaseCard({ release: r }: { release: Release }) {
  const a = artistById(r.artist);
  const upcoming = isUpcoming(r);
  const d = Math.max(0, daysUntil(r.date));
  return (
    <Reveal as="article" className="release-card">
      <div className="cover">
        <CoverArt seed={r.id} label={r.title} />
        {upcoming && <span className="cover-badge">{d === 0 ? "Hoy" : `En ${d} días`}</span>}
        <PlayButton tid={`${r.id}:0`} className="cover-play" ariaLabel={`${upcoming ? "Preescucha" : "Escuchar"}: ${r.title}`} />
      </div>
      <h3>{r.title}</h3>
      <p>
        {a && <Link to={`/artistas/${a.id}`}>{a.name}</Link>} <span className="muted">· {r.type}</span>
      </p>
      <p className="muted small">
        {upcoming ? "Sale el " : ""}
        {fmtDate(r.date)}
      </p>
    </Reveal>
  );
}

export function ArtistCard({ artist: a }: { artist: Artist }) {
  return (
    <Reveal as={Link} to={`/artistas/${a.id}`} className="artist-card">
      <Photo src={a.photo} alt={a.name} />
      <span className="arrow" aria-hidden="true">
        <Icon name="arrow" />
      </span>
      <h3>{a.name}</h3>
      <p>
        {a.genre} · {a.city}
      </p>
    </Reveal>
  );
}

/* Embed simulado. API REAL: sustituir por el iframe oficial de Spotify con playlist.spotifyId:
   <iframe src={`https://open.spotify.com/embed/playlist/${spotifyId}`} width="100%" height="352" loading="lazy"
           allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" /> */
export function PlaylistEmbed({ playlist: p }: { playlist: Playlist }) {
  const tracks = p.tracks.map(getTrack).filter((t) => t !== null);
  const total = tracks.reduce((s, t) => s + t.dur, 0);
  return (
    <Reveal as="article" className="sp-embed" style={{ "--sp-a": p.color } as CSSProperties} aria-label={`Playlist ${p.title} (embed simulado)`}>
      <div className="sp-head">
        <div className="cover">
          <CoverArt seed={p.id} label={p.title} withText={false} />
        </div>
        <div>
          <p className="sp-kicker">Playlist</p>
          <h3>{p.title}</h3>
          <p className="sp-desc">{p.description}</p>
          <p className="sp-meta">Nocturna Records · {fmtNum(p.followers)} seguidores</p>
        </div>
        <span className="sp-logo">
          <Icon name="spotify" size={24} />
        </span>
      </div>
      <ol className="sp-list">
        {tracks.map((t, i) => (
          <TrackRow key={t.id} tid={t.id}>
            <span className="sp-n">{i + 1}</span>
            <PlayButton tid={t.id} />
            <span className="sp-t">
              <strong>{t.title}</strong>
              <small>{t.artist.name}</small>
            </span>
            <span className="sp-d">{fmtTime(t.dur)}</span>
          </TrackRow>
        ))}
      </ol>
      <div className="sp-foot">
        <span>
          {tracks.length} canciones · {Math.round(total / 60)} min
        </span>
        <span>Vista previa</span>
      </div>
    </Reveal>
  );
}
