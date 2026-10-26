// Artistas, lanzamientos y cifras del catálogo, derivados de src/config.ts.
// API REAL: GET /artists, /releases, /tracks y /stats (o tablas equivalentes en Supabase).
import { config, type Artist, type ReleaseInput } from "../config";
import { addDays, DAY, iso, parseDay, seeded, TODAY, TODAY_ISO } from "./format";

export interface Track {
  /** "idLanzamiento:índice" */
  id: string;
  title: string;
  dur: number;
}
export interface Release extends Omit<ReleaseInput, "tracks" | "daysFromToday"> {
  date: string;
  blurb: string;
  tracks: Track[];
}
export interface ResolvedTrack extends Track {
  release: Release;
  artist: Artist;
}

export const artists = config.artists;

export const releases: Release[] = config.releases.map(({ tracks, daysFromToday, blurb, ...r }) => {
  const rnd = seeded(r.id);
  return {
    ...r,
    blurb: blurb ?? "",
    date: iso(addDays(daysFromToday)),
    tracks: tracks.map((title, i) => ({ id: `${r.id}:${i}`, title, dur: 148 + Math.floor(rnd() * 140) })),
  };
});

export const artistById = (id: string) => artists.find((a) => a.id === id);
export const releaseById = (id: string) => releases.find((r) => r.id === id);
export const releasesBy = (artistId: string) => releases.filter((r) => r.artist === artistId);
export const isUpcoming = (r: Release) => r.date > TODAY_ISO;
export const releaseMinutes = (r: Release) => Math.round(r.tracks.reduce((s, t) => s + t.dur, 0) / 60);

export function getTrack(tid: string): ResolvedTrack | null {
  const [rid, i] = tid.split(":");
  const release = releaseById(rid);
  const t = release?.tracks[Number(i)];
  const artist = release && artistById(release.artist);
  return release && t && artist ? { ...t, release, artist } : null;
}

// ── Catálogo del artista del portal (ISRC/UPC y streams ficticios) ──

export interface CatalogTrack extends Track {
  isrc: string;
  streams: number;
}
export interface CatalogRelease extends Omit<Release, "tracks"> {
  upc: string;
  platforms: string[];
  tracks: CatalogTrack[];
  streams: number;
}

export function getCatalog(artistId: string): CatalogRelease[] {
  return releasesBy(artistId)
    .filter((r) => !isUpcoming(r))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => {
      const rnd = seeded(r.id + "cat");
      const yy = r.date.slice(2, 4);
      const n = parseInt(r.id.slice(4), 10);
      const upc = "8435" + String(Math.floor(rnd() * 1e9)).padStart(9, "0");
      const platforms = config.portal.platforms.filter((_, i) => i < 4 || rnd() > 0.4);
      const age = Math.max(1, -Math.round((parseDay(r.date).getTime() - TODAY.getTime()) / DAY));
      const tracks = r.tracks.map((t, i) => ({
        ...t,
        isrc: `ES-NC7-${yy}-${String(n * 100 + i + 1).padStart(5, "0")}`,
        streams: Math.round((age < 30 ? 22000 + rnd() * 70000 : 120000 + rnd() * 1900000) * (i === 0 ? 1.6 : 1)),
      }));
      return { ...r, upc, platforms, tracks, streams: tracks.reduce((s, t) => s + t.streams, 0) };
    });
}

export interface MonthPoint {
  label: string;
  year: number;
  v: number;
}

/** Streams de los últimos 12 meses (con los picos de cada lanzamiento) */
export function monthlyStreams(artistId: string): MonthPoint[] {
  const r = seeded("streams-" + artistId);
  const out: MonthPoint[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth() - i, 1);
    let v = 180000 + (11 - i) * 9000 + r() * 60000;
    if (i === 0) v += 210000; // pico por el lanzamiento de «Mareas de Neón»
    if (i === 8) v += 90000; // efecto del sencillo «Satélite»
    out.push({ label: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""), year: d.getFullYear(), v: Math.round(v) });
  }
  return out;
}

export const labelSignedOn = iso(addDays(-config.portal.signedWithLabelDaysAgo));
