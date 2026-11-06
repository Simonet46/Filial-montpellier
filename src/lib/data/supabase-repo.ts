import { STORAGE_BUCKETS } from "../constants";
import { getSupabase } from "../supabase/client";
import type { Player, Profile, TrainingSession, Trial, Video, Evaluation } from "../types";
import type { Repo } from "./repo";

const SIGNED_URL_TTL = 60 * 60; // 1 hora

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

type SessionRow = Omit<TrainingSession, "attendee_ids"> & {
  session_attendance: { player_id: string }[] | null;
};

const SESSION_SELECT = "id, title, date, location, coaches, description, created_at, session_attendance(player_id)";

function toSession(row: SessionRow): TrainingSession {
  const { session_attendance, ...rest } = row;
  return { ...rest, attendee_ids: (session_attendance ?? []).map((a) => a.player_id) };
}

async function replaceAttendance(sessionId: string, playerIds: string[]) {
  const sb = getSupabase();
  check(await sb.from("session_attendance").delete().eq("session_id", sessionId));
  if (playerIds.length) {
    check(
      await sb
        .from("session_attendance")
        .insert(playerIds.map((player_id) => ({ session_id: sessionId, player_id }))),
    );
  }
}

export const supabaseRepo: Repo = {
  async listPlayers() {
    const sb = getSupabase();
    return check(await sb.from("players").select("*").order("last_name")) as Player[];
  },
  async getPlayer(id) {
    const sb = getSupabase();
    return check(await sb.from("players").select("*").eq("id", id).maybeSingle()) as Player | null;
  },
  async createPlayer(input) {
    const sb = getSupabase();
    const row = check(await sb.from("players").insert(input).select("id").single()) as { id: string };
    return row.id;
  },
  async updatePlayer(id, input) {
    const sb = getSupabase();
    check(await sb.from("players").update(input).eq("id", id));
  },
  async deletePlayer(id) {
    const sb = getSupabase();
    const row = check(
      await sb.from("players").select("photo_path").eq("id", id).maybeSingle(),
    ) as { photo_path: string | null } | null;
    check(await sb.from("players").delete().eq("id", id));
    if (row?.photo_path) await sb.storage.from(STORAGE_BUCKETS.photos).remove([row.photo_path]);
  },

  async getContact(playerId) {
    const sb = getSupabase();
    return check(
      await sb.from("player_contacts").select("*").eq("player_id", playerId).maybeSingle(),
    );
  },
  async upsertContact(contact) {
    const sb = getSupabase();
    check(await sb.from("player_contacts").upsert(contact));
  },

  async listEvaluations(playerId) {
    const sb = getSupabase();
    let q = sb.from("evaluations").select("*").order("date", { ascending: false });
    if (playerId) q = q.eq("player_id", playerId);
    return check(await q) as Evaluation[];
  },
  async createEvaluation(input) {
    const sb = getSupabase();
    check(await sb.from("evaluations").insert(input));
  },
  async deleteEvaluation(id) {
    const sb = getSupabase();
    check(await sb.from("evaluations").delete().eq("id", id));
  },

  async listSessions() {
    const sb = getSupabase();
    const rows = check(
      await sb.from("training_sessions").select(SESSION_SELECT).order("date", { ascending: false }),
    ) as unknown as SessionRow[];
    return rows.map(toSession);
  },
  async getSession(id) {
    const sb = getSupabase();
    const row = check(
      await sb.from("training_sessions").select(SESSION_SELECT).eq("id", id).maybeSingle(),
    ) as unknown as SessionRow | null;
    return row ? toSession(row) : null;
  },
  async createSession({ attendee_ids, ...input }) {
    const sb = getSupabase();
    const row = check(
      await sb.from("training_sessions").insert(input).select("id").single(),
    ) as { id: string };
    await replaceAttendance(row.id, attendee_ids);
    return row.id;
  },
  async updateSession(id, { attendee_ids, ...input }) {
    const sb = getSupabase();
    check(await sb.from("training_sessions").update(input).eq("id", id));
    await replaceAttendance(id, attendee_ids);
  },
  async deleteSession(id) {
    const sb = getSupabase();
    check(await sb.from("training_sessions").delete().eq("id", id));
  },

  async listVideos(filter) {
    const sb = getSupabase();
    let q = sb.from("videos").select("*").order("created_at", { ascending: false });
    if (filter?.playerId) q = q.eq("player_id", filter.playerId);
    if (filter?.sessionId) q = q.eq("session_id", filter.sessionId);
    return check(await q) as Video[];
  },
  async createVideo(input) {
    const sb = getSupabase();
    check(await sb.from("videos").insert(input));
  },
  async deleteVideo(id) {
    const sb = getSupabase();
    const row = check(
      await sb.from("videos").select("storage_path").eq("id", id).maybeSingle(),
    ) as { storage_path: string | null } | null;
    check(await sb.from("videos").delete().eq("id", id));
    if (row?.storage_path) await sb.storage.from(STORAGE_BUCKETS.videos).remove([row.storage_path]);
  },

  async listFavoriteIds(userId) {
    const sb = getSupabase();
    const rows = check(
      await sb.from("favorites").select("player_id").eq("user_id", userId),
    ) as { player_id: string }[];
    return rows.map((r) => r.player_id);
  },
  async setFavorite(userId, playerId, on) {
    const sb = getSupabase();
    if (on) {
      check(await sb.from("favorites").upsert({ user_id: userId, player_id: playerId }));
    } else {
      check(await sb.from("favorites").delete().eq("user_id", userId).eq("player_id", playerId));
    }
  },

  async listTrials() {
    const sb = getSupabase();
    return check(
      await sb.from("trials").select("*").order("created_at", { ascending: false }),
    ) as Trial[];
  },
  async createTrial(input) {
    const sb = getSupabase();
    check(await sb.from("trials").insert(input));
  },
  async updateTrialStatus(id, status) {
    const sb = getSupabase();
    check(await sb.from("trials").update({ status }).eq("id", id));
  },

  async listProfiles() {
    const sb = getSupabase();
    return check(
      await sb.from("profiles").select("*").order("created_at", { ascending: true }),
    ) as Profile[];
  },
  async updateProfileRole(id, role) {
    const sb = getSupabase();
    check(await sb.from("profiles").update({ role }).eq("id", id));
  },

  async signedUrl(bucket, path) {
    const sb = getSupabase();
    const { data } = await sb.storage.from(bucket).createSignedUrl(path, SIGNED_URL_TTL);
    return data?.signedUrl ?? null;
  },
  async signedUrls(bucket, paths) {
    if (paths.length === 0) return {};
    const sb = getSupabase();
    const { data } = await sb.storage.from(bucket).createSignedUrls(paths, SIGNED_URL_TTL);
    const out: Record<string, string> = {};
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
    }
    return out;
  },
};
