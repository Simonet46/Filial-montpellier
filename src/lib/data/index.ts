import { STORAGE_BUCKETS } from "../constants";
import { IS_DEMO } from "../env";
import type { CurrentUser, Evaluation, Player, PlayerSummary, Video } from "../types";
import { ageFrom, averageRatings, hasEuPassport, overallFrom } from "../utils";
import { localRepo } from "./local-repo";
import type { Repo } from "./repo";
import { supabaseRepo } from "./supabase-repo";

export const repo: Repo = IS_DEMO ? localRepo : supabaseRepo;
export { resetDemoData } from "./local-repo";

/** URL mostrable de la foto: data URL (demo) o URL firmada de Storage. */
function photoUrl(p: Player, signed: Record<string, string>) {
  if (!p.photo_path) return null;
  if (p.photo_path.startsWith("data:")) return p.photo_path;
  return signed[p.photo_path] ?? null;
}

export function summarize(
  p: Player,
  evals: Evaluation[],
  videos: Video[],
  favorites: Set<string>,
  signedPhotos: Record<string, string> = {},
): PlayerSummary {
  const ratings = averageRatings(evals.filter((e) => e.player_id === p.id));
  return {
    ...p,
    photo_url: photoUrl(p, signedPhotos),
    ratings,
    overall: overallFrom(ratings),
    video_count: videos.filter((v) => v.player_id === p.id).length,
    favorite: favorites.has(p.id),
    is_eu: hasEuPassport(p.passports),
    age: ageFrom(p.birth_date),
  };
}

async function signedPhotoUrls(players: Player[]) {
  const paths = players
    .map((p) => p.photo_path)
    .filter((x): x is string => !!x && !x.startsWith("data:"));
  return repo.signedUrls(STORAGE_BUCKETS.photos, paths);
}

/** Todos los jugadores con valoración, videos y favoritos del usuario. */
export async function loadPlayerSummaries(user: CurrentUser): Promise<PlayerSummary[]> {
  const [players, evals, videos, favs] = await Promise.all([
    repo.listPlayers(),
    repo.listEvaluations(),
    repo.listVideos(),
    repo.listFavoriteIds(user.id),
  ]);
  const signed = await signedPhotoUrls(players);
  const favSet = new Set(favs);
  return players.map((p) => summarize(p, evals, videos, favSet, signed));
}

export async function loadPlayerDetail(id: string, user: CurrentUser) {
  const player = await repo.getPlayer(id);
  if (!player) return null;
  const [evals, videos, favs, signed] = await Promise.all([
    repo.listEvaluations(id),
    repo.listVideos({ playerId: id }),
    repo.listFavoriteIds(user.id),
    signedPhotoUrls([player]),
  ]);
  return { summary: summarize(player, evals, videos, new Set(favs), signed), evals, videos };
}

/** Agrega la URL reproducible (firmada) a los videos subidos como archivo. */
export async function withPlayableUrls(videos: Video[]) {
  const paths = videos.map((v) => v.storage_path).filter((x): x is string => !!x);
  const urls = await repo.signedUrls(STORAGE_BUCKETS.videos, paths);
  return videos.map((v) => ({
    ...v,
    playable_url: v.storage_path ? (urls[v.storage_path] ?? null) : v.url,
  }));
}

export type PlayableVideo = Awaited<ReturnType<typeof withPlayableUrls>>[number];
