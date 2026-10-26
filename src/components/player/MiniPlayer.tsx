import { player, usePlayer } from "../../lib/player";
import { CoverArt } from "../CoverArt";
import { Icon } from "../Icon";
import { PlayButton, ProgressBar } from "./PlayerControls";

/** Mini reproductor flotante (aparece al pulsar cualquier «play») */
export function MiniPlayer() {
  const track = usePlayer((s) => s.track);
  if (!track) return null;
  return (
    <div className="mini-player" role="region" aria-label="Reproductor">
      <div className="cover">
        <CoverArt seed={track.release.id} label={track.release.title} withText={false} />
      </div>
      <div className="mp-meta">
        <strong>{track.title}</strong>
        <span>
          {track.artist.name} · {track.release.title}
        </span>
        <div className="player-line">
          <ProgressBar tid={track.id} />
        </div>
      </div>
      <PlayButton tid={track.id} className="icon-btn solid" />
      <button type="button" className="icon-btn sm" aria-label="Cerrar reproductor" onClick={player.close}>
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
