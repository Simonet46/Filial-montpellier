export type Role = "admin" | "coach" | "club" | "pending";
export type Locale = "es" | "fr";

/** Puestos de handball (código interno, la etiqueta se traduce). */
export type Position = "GK" | "LW" | "LB" | "CB" | "RB" | "RW" | "PV";
export type Hand = "right" | "left" | "both";
export type NationalTeam = "none" | "provincial" | "national";
export type PlayerStatus =
  | "active"
  | "followup"
  | "invited"
  | "trial"
  | "signed"
  | "inactive";
export type VideoKind = "training" | "highlight" | "match";
export type VideoSource = "upload" | "youtube" | "vimeo" | "link";
export type TrialStatus = "requested" | "scheduled" | "completed" | "declined";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  organization: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string; // YYYY-MM-DD
  photo_path: string | null;
  nationality: string; // ISO 3166-1 alpha-2
  passports: string[]; // ISO 3166-1 alpha-2
  height_cm: number | null;
  weight_kg: number | null;
  wingspan_cm: number | null;
  dominant_hand: Hand;
  position: Position;
  secondary_position: Position | null;
  club: string;
  city: string | null;
  national_team: NationalTeam;
  national_team_detail: string | null;
  status: PlayerStatus;
  scouting_notes: string | null;
  joined_at: string | null; // ingreso a la filial
  created_at: string;
  updated_at: string;
}

export type PlayerInput = Omit<Player, "id" | "created_at" | "updated_at">;

/** Datos sensibles (menores): solo visibles para entrenadores y admins. */
export interface PlayerContact {
  player_id: string;
  email: string | null;
  phone: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
}

export const RATING_KEYS = [
  "technique",
  "tactics",
  "physical",
  "speed",
  "shooting",
  "defense",
  "mentality",
] as const;
export type RatingKey = (typeof RATING_KEYS)[number];
export type Ratings = Record<RatingKey, number>;

export interface Evaluation extends Ratings {
  id: string;
  player_id: string;
  session_id: string | null;
  author_id: string | null;
  author_name: string;
  date: string;
  sprint_20m_s: number | null;
  vertical_jump_cm: number | null;
  throw_speed_kmh: number | null;
  comment: string | null;
  created_at: string;
}

export type EvaluationInput = Omit<Evaluation, "id" | "created_at">;

export interface TrainingSession {
  id: string;
  title: string;
  date: string;
  location: string;
  coaches: string[];
  description: string | null;
  attendee_ids: string[];
  created_at: string;
}

export type TrainingSessionInput = Omit<TrainingSession, "id" | "created_at">;

export interface Video {
  id: string;
  title: string;
  kind: VideoKind;
  source: VideoSource;
  url: string | null;
  storage_path: string | null;
  player_id: string | null;
  session_id: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export type VideoInput = Omit<Video, "id" | "created_at">;

export interface Trial {
  id: string;
  player_id: string;
  requested_by: string | null;
  requested_by_name: string;
  status: TrialStatus;
  proposed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TrialInput = Omit<Trial, "id" | "created_at" | "updated_at">;

/** Usuario autenticado tal como lo ve la app. */
export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organization: string | null;
}

/** Jugador + métricas derivadas para listados y tarjetas. */
export interface PlayerSummary extends Player {
  photo_url: string | null;
  overall: number | null; // 0-100
  ratings: Ratings | null; // promedio de las últimas evaluaciones (1-10)
  video_count: number;
  favorite: boolean;
  is_eu: boolean;
  age: number;
}

export type ActionState = { error?: string; ok?: boolean; id?: string } | null;
