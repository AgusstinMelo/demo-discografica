import { useState } from "react";
import { ArtistCard, PlaylistEmbed } from "../../components/cards";
import { Reveal } from "../../components/Reveal";
import { config, type Genre } from "../../config";
import { usePageTitle } from "../../hooks/usePageTitle";
import { artists } from "../../lib/catalog";

export function Artists() {
  usePageTitle("Artistas y playlists");
  const [genre, setGenre] = useState<Genre | null>(null);
  const genres = config.genres.filter((g) => artists.some((a) => a.genre === g));
  const shown = artists.filter((a) => !genre || a.genre === genre);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <Reveal as="p" className="eyebrow">
            Roster · {artists.length} artistas
          </Reveal>
          <Reveal as="h1">
            Artistas <span className="serif accent">y playlists</span>
          </Reveal>
          <Reveal as="p" className="lead">
            Del synth-pop al post-punk. Explora el roster por género y escucha las playlists que curamos cada semana.
          </Reveal>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="filters" role="group" aria-label="Filtrar por género">
            <button type="button" className="filter-btn" aria-pressed={!genre} onClick={() => setGenre(null)}>
              Todos
            </button>
            {genres.map((g) => (
              <button key={g} type="button" className="filter-btn" aria-pressed={genre === g} onClick={() => setGenre(g)}>
                {g}
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {shown.length} artista{shown.length === 1 ? "" : "s"}
            {genre ? ` de ${genre}` : ""}
          </p>
          <div className="grid-4 artist-grid">
            {shown.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <header className="section-head">
            <div>
              <p className="eyebrow">Curaduría del sello</p>
              <h2>
                Playlists <span className="serif">Nocturna</span>
              </h2>
            </div>
            <span className="tag tag-accent plain">Embeds simulados estilo Spotify</span>
          </header>
          <div className="grid-3">
            {config.playlists.map((p) => (
              <PlaylistEmbed key={p.id} playlist={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
