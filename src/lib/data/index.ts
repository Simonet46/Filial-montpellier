import "server-only";
import { STORAGE_BUCKETS } from "../constants";
import { IS_DEMO } from "../env";
import type { CurrentUser, Evaluation, Player, PlayerSummary, Video } from "../types";
import { ageFrom, averageRatings, hasEuPassport, overallFrom } from "../utils";
import { demoRepo } from "./demo-repo";
import type { Repo } from "./repo";
import { supabaseRepo } from "./supabase-repo";

export const repo: Repo = IS_DEMO ? demoRepo : supabaseRepo;

function summarize(
  p: Player,
  evals: Evaluation[],
  videos: Video[],
  favorites: Set<string>,
  photoUrls: Record<string, string>,
): PlayerSummary {
  const ratings = averageRatings(evals.filter((e) => e.player_id === p.id));
  return {
    ...p,
    photo_url: p.photo_path ? (photoUrls[p.photo_path] ?? null) : null,
    ratings,
    overall: overallFrom(ratings),
    video_count: videos.filter((v) => v.player_id === p.id).length,
    favorite: favorites.has(p.id),
    is_eu: hasEuPassport(p.passports),
    age: ageFrom(p.birth_date),
  };
}

/** Todos los jugadores con valoración, videos y favoritos del usuario. */
export async function getPlayerSummaries(user: CurrentUser): Promise<PlayerSummary[]> {
  const [players, evals, videos, favs] = await Promise.all([
    repo.listPlayers(),
    repo.listEvaluations(),
    repo.listVideos(),
    repo.listFavoriteIds(user.id),
  ]);
  const photoPaths = players.map((p) => p.photo_path).filter((x): x is string => !!x);
  const photoUrls = await repo.signedUrls(STORAGE_BUCKETS.photos, photoPaths);
  const favSet = new Set(favs);
  return players.map((p) => summarize(p, evals, videos, favSet, photoUrls));
}

export async function getPlayerSummary(id: string, user: CurrentUser) {
  const player = await repo.getPlayer(id);
  if (!player) return null;
  const [evals, videos, favs] = await Promise.all([
    repo.listEvaluations(id),
    repo.listVideos({ playerId: id }),
    repo.listFavoriteIds(user.id),
  ]);
  const photoUrl = player.photo_path
    ? await repo.signedUrl(STORAGE_BUCKETS.photos, player.photo_path)
    : null;
  const summary = summarize(
    player,
    evals,
    videos,
    new Set(favs),
    photoUrl && player.photo_path ? { [player.photo_path]: photoUrl } : {},
  );
  return { summary, evals, videos };
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
