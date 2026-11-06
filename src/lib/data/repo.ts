import type {
  Evaluation,
  EvaluationInput,
  Player,
  PlayerContact,
  PlayerInput,
  Profile,
  Role,
  TrainingSession,
  TrainingSessionInput,
  Trial,
  TrialInput,
  TrialStatus,
  Video,
  VideoInput,
} from "../types";

export interface PublicStats {
  players: number;
  sessions: number;
  videos: number;
  eu: number;
}

/**
 * Contrato de acceso a datos. Hay dos implementaciones:
 * - Supabase (producción): Postgres + RLS + Storage.
 * - Demo (sin credenciales): datos de ejemplo en memoria.
 */
export interface Repo {
  listPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  createPlayer(input: PlayerInput): Promise<string>;
  updatePlayer(id: string, input: PlayerInput): Promise<void>;
  deletePlayer(id: string): Promise<void>;

  getContact(playerId: string): Promise<PlayerContact | null>;
  upsertContact(contact: PlayerContact): Promise<void>;

  listEvaluations(playerId?: string): Promise<Evaluation[]>;
  createEvaluation(input: EvaluationInput): Promise<void>;
  deleteEvaluation(id: string): Promise<void>;

  listSessions(): Promise<TrainingSession[]>;
  getSession(id: string): Promise<TrainingSession | null>;
  createSession(input: TrainingSessionInput): Promise<string>;
  updateSession(id: string, input: TrainingSessionInput): Promise<void>;
  deleteSession(id: string): Promise<void>;

  listVideos(filter?: { playerId?: string; sessionId?: string }): Promise<Video[]>;
  createVideo(input: VideoInput): Promise<void>;
  deleteVideo(id: string): Promise<void>;

  listFavoriteIds(userId: string): Promise<string[]>;
  setFavorite(userId: string, playerId: string, on: boolean): Promise<void>;

  listTrials(): Promise<Trial[]>;
  createTrial(input: TrialInput): Promise<void>;
  updateTrialStatus(id: string, status: TrialStatus): Promise<void>;

  listProfiles(): Promise<Profile[]>;
  updateProfileRole(id: string, role: Role): Promise<void>;

  /** Cifras agregadas para la portada pública (no expone datos personales). */
  publicStats(): Promise<PublicStats>;

  /** URL firmada temporal para un archivo privado de Storage. */
  signedUrl(bucket: string, path: string): Promise<string | null>;
  signedUrls(bucket: string, paths: string[]): Promise<Record<string, string>>;
}
