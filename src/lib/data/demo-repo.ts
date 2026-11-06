import "server-only";
import { hasEuPassport, todayISO, uid } from "../utils";
import type {
  Evaluation,
  Player,
  PlayerContact,
  Profile,
  TrainingSession,
  Trial,
  Video,
} from "../types";
import * as seed from "./demo-seed";
import type { Repo } from "./repo";

interface DemoStore {
  players: Player[];
  contacts: PlayerContact[];
  evaluations: Evaluation[];
  sessions: TrainingSession[];
  videos: Video[];
  favorites: { user_id: string; player_id: string }[];
  trials: Trial[];
  profiles: Profile[];
}

const g = globalThis as unknown as { __filialDemo?: DemoStore };

/** Store en memoria del proceso. Se reinicia al reiniciar el servidor. */
function db(): DemoStore {
  g.__filialDemo ??= structuredClone({
    players: seed.demoPlayers,
    contacts: seed.demoContacts,
    evaluations: seed.demoEvaluations,
    sessions: seed.demoSessions,
    videos: seed.demoVideos,
    favorites: seed.demoFavorites,
    trials: seed.demoTrials,
    profiles: seed.demoProfiles,
  });
  return g.__filialDemo;
}

const now = () => new Date().toISOString();
const clone = <T>(v: T): T => structuredClone(v);

export const demoRepo: Repo = {
  async listPlayers() {
    return clone(db().players);
  },
  async getPlayer(id) {
    return clone(db().players.find((p) => p.id === id) ?? null);
  },
  async createPlayer(input) {
    const id = uid();
    db().players.push({ ...input, id, created_at: now(), updated_at: now() });
    return id;
  },
  async updatePlayer(id, input) {
    const s = db();
    s.players = s.players.map((p) => (p.id === id ? { ...p, ...input, updated_at: now() } : p));
  },
  async deletePlayer(id) {
    const s = db();
    s.players = s.players.filter((p) => p.id !== id);
    s.contacts = s.contacts.filter((c) => c.player_id !== id);
    s.evaluations = s.evaluations.filter((e) => e.player_id !== id);
    s.videos = s.videos.filter((v) => v.player_id !== id);
    s.trials = s.trials.filter((t) => t.player_id !== id);
    s.favorites = s.favorites.filter((f) => f.player_id !== id);
    s.sessions = s.sessions.map((x) => ({ ...x, attendee_ids: x.attendee_ids.filter((a) => a !== id) }));
  },

  async getContact(playerId) {
    return clone(db().contacts.find((c) => c.player_id === playerId) ?? null);
  },
  async upsertContact(contact) {
    const s = db();
    s.contacts = [...s.contacts.filter((c) => c.player_id !== contact.player_id), contact];
  },

  async listEvaluations(playerId) {
    const all = db().evaluations;
    return clone(playerId ? all.filter((e) => e.player_id === playerId) : all);
  },
  async createEvaluation(input) {
    db().evaluations.push({ ...input, id: uid(), created_at: now() });
  },
  async deleteEvaluation(id) {
    const s = db();
    s.evaluations = s.evaluations.filter((e) => e.id !== id);
  },

  async listSessions() {
    return clone(db().sessions);
  },
  async getSession(id) {
    return clone(db().sessions.find((s) => s.id === id) ?? null);
  },
  async createSession(input) {
    const id = uid();
    db().sessions.push({ ...input, id, created_at: now() });
    return id;
  },
  async updateSession(id, input) {
    const s = db();
    s.sessions = s.sessions.map((x) => (x.id === id ? { ...x, ...input } : x));
  },
  async deleteSession(id) {
    const s = db();
    s.sessions = s.sessions.filter((x) => x.id !== id);
    s.videos = s.videos.map((v) => (v.session_id === id ? { ...v, session_id: null } : v));
    s.evaluations = s.evaluations.map((e) => (e.session_id === id ? { ...e, session_id: null } : e));
  },

  async listVideos(filter) {
    return clone(
      db().videos.filter(
        (v) =>
          (!filter?.playerId || v.player_id === filter.playerId) &&
          (!filter?.sessionId || v.session_id === filter.sessionId),
      ),
    );
  },
  async createVideo(input) {
    db().videos.push({ ...input, id: uid(), created_at: now() });
  },
  async deleteVideo(id) {
    const s = db();
    s.videos = s.videos.filter((v) => v.id !== id);
  },

  async listFavoriteIds(userId) {
    return db().favorites.filter((f) => f.user_id === userId).map((f) => f.player_id);
  },
  async setFavorite(userId, playerId, on) {
    const s = db();
    s.favorites = s.favorites.filter((f) => !(f.user_id === userId && f.player_id === playerId));
    if (on) s.favorites.push({ user_id: userId, player_id: playerId });
  },

  async listTrials() {
    return clone(db().trials);
  },
  async createTrial(input) {
    const s = db();
    s.trials.push({ ...input, id: uid(), created_at: now(), updated_at: now() });
    // Igual que el trigger on_trial_created de Supabase.
    s.players = s.players.map((p) =>
      p.id === input.player_id && (p.status === "active" || p.status === "followup")
        ? { ...p, status: "invited", updated_at: now() }
        : p,
    );
  },
  async updateTrialStatus(id, status) {
    const s = db();
    s.trials = s.trials.map((t) => (t.id === id ? { ...t, status, updated_at: now() } : t));
  },

  async listProfiles() {
    return clone(db().profiles);
  },
  async updateProfileRole(id, role) {
    const s = db();
    s.profiles = s.profiles.map((p) => (p.id === id ? { ...p, role } : p));
  },

  async publicStats() {
    const s = db();
    const active = s.players.filter((p) => p.status !== "inactive");
    return {
      players: active.length,
      sessions: s.sessions.filter((x) => x.date <= todayISO()).length,
      videos: s.videos.length,
      eu: active.filter((p) => hasEuPassport(p.passports)).length,
    };
  },

  async signedUrl() {
    return null;
  },
  async signedUrls() {
    return {};
  },
};
