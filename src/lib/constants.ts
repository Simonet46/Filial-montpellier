import type {
  Hand,
  NationalTeam,
  PlayerStatus,
  Position,
  Role,
  TrialStatus,
  VideoKind,
} from "./types";

export const POSITIONS: Position[] = ["GK", "LW", "LB", "CB", "RB", "RW", "PV"];
export const HANDS: Hand[] = ["right", "left", "both"];
export const NATIONAL_TEAMS: NationalTeam[] = ["none", "provincial", "national"];
export const PLAYER_STATUSES: PlayerStatus[] = [
  "active",
  "followup",
  "invited",
  "trial",
  "signed",
  "inactive",
];
export const VIDEO_KINDS: VideoKind[] = ["training", "highlight", "match"];
export const TRIAL_STATUSES: TrialStatus[] = [
  "requested",
  "scheduled",
  "completed",
  "declined",
];
export const ROLES: Role[] = ["admin", "coach", "club", "pending"];

/** Coordenadas de cada puesto sobre la media cancha (SVG 200x120, arco arriba). */
export const POSITION_COORDS: Record<Position, { x: number; y: number }> = {
  GK: { x: 100, y: 16 },
  LW: { x: 16, y: 26 },
  RW: { x: 184, y: 26 },
  PV: { x: 100, y: 70 },
  LB: { x: 46, y: 88 },
  RB: { x: 154, y: 88 },
  CB: { x: 100, y: 104 },
};

/** Países ofrecidos en el selector de pasaportes (ISO alpha-2). */
export const PASSPORT_OPTIONS = [
  "AR",
  "IT",
  "ES",
  "FR",
  "DE",
  "PT",
  "PL",
  "HR",
  "GR",
  "IE",
  "NL",
  "BE",
  "AT",
  "SI",
  "LT",
  "CH",
  "GB",
  "UY",
  "CL",
  "PY",
  "BR",
  "IL",
  "US",
] as const;

/** Estados miembro de la Unión Europea: pasaporte comunitario. */
export const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE",
]);

export const MAX_COMPARE = 3;

export const STORAGE_BUCKETS = {
  videos: "videos",
  photos: "player-photos",
} as const;
