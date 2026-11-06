import { HANDS, NATIONAL_TEAMS, PLAYER_STATUSES, POSITIONS, ROLES, TRIAL_STATUSES, VIDEO_KINDS } from "./constants";
import { repo } from "./data";
import { BASE_PATH, IS_DEMO } from "./env";
import type { Dictionary } from "./i18n/es";
import { notifyChange } from "./store";
import { getSupabase } from "./supabase/client";
import {
  RATING_KEYS,
  type ActionState,
  type CurrentUser,
  type Hand,
  type NationalTeam,
  type PlayerInput,
  type PlayerStatus,
  type Position,
  type Ratings,
  type Role,
  type TrialStatus,
  type VideoKind,
} from "./types";
import { numOrNull, parseVideoUrl, str, strOrNull, todayISO } from "./utils";

/*
 * Mutaciones que corren en el navegador. Los chequeos de rol de acá son de interfaz:
 * con Supabase, la regla real la aplican las políticas RLS de la base de datos.
 */

class ForbiddenError extends Error {}
class RequiredError extends Error {}

function required<T>(value: T | null | undefined | ""): T {
  if (value === null || value === undefined || value === "") throw new RequiredError("required");
  return value;
}

function assertRole(user: CurrentUser | null, ...roles: Role[]): CurrentUser {
  if (!user || !roles.includes(user.role)) throw new ForbiddenError("forbidden");
  return user;
}

async function run(t: Dictionary, fn: () => Promise<Partial<NonNullable<ActionState>> | void>): Promise<ActionState> {
  try {
    const extra = await fn();
    notifyChange();
    return { ok: true, ...(extra ?? {}) };
  } catch (err) {
    if (err instanceof ForbiddenError) return { error: t.common.forbidden };
    if (err instanceof RequiredError) return { error: t.common.required };
    console.error(err);
    return { error: `${t.common.error}${err instanceof Error ? ` (${err.message})` : ""}` };
  }
}

function oneOf<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

/* --------------------------------- Jugadores --------------------------------- */

function parsePlayer(form: FormData): PlayerInput {
  const passports = form
    .getAll("passports")
    .map((v) => String(v).toUpperCase())
    .filter((v) => /^[A-Z]{2}$/.test(v));
  const secondary = str(form, "secondary_position");
  const nationalTeam = oneOf<NationalTeam>(str(form, "national_team"), NATIONAL_TEAMS, "none");

  return {
    first_name: required(str(form, "first_name")),
    last_name: required(str(form, "last_name")),
    birth_date: required(str(form, "birth_date")),
    photo_path: strOrNull(form, "photo_path"),
    nationality: (str(form, "nationality") || "AR").toUpperCase(),
    passports: passports.length ? Array.from(new Set(passports)) : ["AR"],
    height_cm: numOrNull(form, "height_cm"),
    weight_kg: numOrNull(form, "weight_kg"),
    wingspan_cm: numOrNull(form, "wingspan_cm"),
    dominant_hand: oneOf<Hand>(str(form, "dominant_hand"), HANDS, "right"),
    position: oneOf<Position>(required(str(form, "position")), POSITIONS, "CB"),
    secondary_position: secondary ? oneOf<Position>(secondary, POSITIONS, "CB") : null,
    club: required(str(form, "club")),
    city: strOrNull(form, "city"),
    national_team: nationalTeam,
    national_team_detail: nationalTeam === "none" ? null : strOrNull(form, "national_team_detail"),
    status: oneOf<PlayerStatus>(str(form, "status"), PLAYER_STATUSES, "active"),
    scouting_notes: strOrNull(form, "scouting_notes"),
    joined_at: strOrNull(form, "joined_at"),
  };
}

export function savePlayer(user: CurrentUser, t: Dictionary, form: FormData) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    const input = parsePlayer(form);
    let id = str(form, "id");
    if (id) await repo.updatePlayer(id, input);
    else id = await repo.createPlayer(input);
    await repo.upsertContact({
      player_id: id,
      email: strOrNull(form, "contact_email"),
      phone: strOrNull(form, "contact_phone"),
      guardian_name: strOrNull(form, "guardian_name"),
      guardian_phone: strOrNull(form, "guardian_phone"),
    });
    return { id };
  });
}

export function deletePlayer(user: CurrentUser, t: Dictionary, id: string) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    await repo.deletePlayer(id);
  });
}

export function toggleFavorite(user: CurrentUser, t: Dictionary, playerId: string, on: boolean) {
  return run(t, async () => {
    assertRole(user, "club", "admin", "coach");
    await repo.setFavorite(user.id, playerId, on);
  });
}

/* -------------------------------- Evaluaciones -------------------------------- */

export function createEvaluation(user: CurrentUser, t: Dictionary, form: FormData) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    const ratings = Object.fromEntries(
      RATING_KEYS.map((k) => [k, Math.max(1, Math.min(10, Math.round(numOrNull(form, k) ?? 5)))]),
    ) as Ratings;
    await repo.createEvaluation({
      player_id: required(str(form, "player_id")),
      session_id: strOrNull(form, "session_id"),
      author_id: user.id,
      author_name: user.name,
      date: str(form, "date") || todayISO(),
      ...ratings,
      sprint_20m_s: numOrNull(form, "sprint_20m_s"),
      vertical_jump_cm: numOrNull(form, "vertical_jump_cm"),
      throw_speed_kmh: numOrNull(form, "throw_speed_kmh"),
      comment: strOrNull(form, "comment"),
    });
  });
}

export function deleteEvaluation(user: CurrentUser, t: Dictionary, id: string) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    await repo.deleteEvaluation(id);
  });
}

/* ------------------------------ Concentraciones ------------------------------ */

export function saveSession(user: CurrentUser, t: Dictionary, form: FormData) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    const input = {
      title: required(str(form, "title")),
      date: required(str(form, "date")),
      location: required(str(form, "location")),
      coaches: str(form, "coaches")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      description: strOrNull(form, "description"),
      attendee_ids: form.getAll("attendee_ids").map(String),
    };
    let id = str(form, "id");
    if (id) await repo.updateSession(id, input);
    else id = await repo.createSession(input);
    return { id };
  });
}

export function deleteSession(user: CurrentUser, t: Dictionary, id: string) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    await repo.deleteSession(id);
  });
}

/* ----------------------------------- Videos ----------------------------------- */

export function createVideo(user: CurrentUser, t: Dictionary, form: FormData) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    const storagePath = strOrNull(form, "storage_path");
    const url = strOrNull(form, "url");
    if (!storagePath && !url) required(null);
    if (url && !/^https?:\/\//i.test(url)) required(null);
    const kind = str(form, "kind") as VideoKind;
    await repo.createVideo({
      title: required(str(form, "title")),
      kind: VIDEO_KINDS.includes(kind) ? kind : "highlight",
      source: storagePath ? "upload" : parseVideoUrl(url!).source,
      url: storagePath ? null : url,
      storage_path: storagePath,
      player_id: strOrNull(form, "player_id"),
      session_id: strOrNull(form, "session_id"),
      description: strOrNull(form, "description"),
      created_by: user.id,
    });
  });
}

export function deleteVideo(user: CurrentUser, t: Dictionary, id: string) {
  return run(t, async () => {
    assertRole(user, "coach", "admin");
    await repo.deleteVideo(id);
  });
}

/* ----------------------------------- Pruebas ----------------------------------- */

export function createTrial(user: CurrentUser, t: Dictionary, form: FormData) {
  return run(t, async () => {
    assertRole(user, "club", "admin");
    await repo.createTrial({
      player_id: required(str(form, "player_id")),
      requested_by: user.id,
      requested_by_name: user.name,
      status: "requested",
      proposed_date: strOrNull(form, "proposed_date"),
      notes: strOrNull(form, "notes"),
    });
    // El paso del jugador a "invitado" lo hace el trigger on_trial_created (y el repo demo).
  });
}

export function updateTrialStatus(user: CurrentUser, t: Dictionary, id: string, status: TrialStatus) {
  return run(t, async () => {
    assertRole(user, "club", "coach", "admin");
    if (!TRIAL_STATUSES.includes(status)) required(null);
    await repo.updateTrialStatus(id, status);
  });
}

/* ---------------------------------- Usuarios ---------------------------------- */

export function updateUserRole(user: CurrentUser, t: Dictionary, id: string, role: Role) {
  return run(t, async () => {
    assertRole(user, "admin");
    if (!ROLES.includes(role)) required(null);
    await repo.updateProfileRole(id, role);
  });
}

/**
 * Invitación por correo. Necesita la Edge Function `invite-user`
 * (supabase/functions/invite-user), que usa la service role del lado de Supabase.
 */
export function inviteUser(user: CurrentUser, t: Dictionary, form: FormData) {
  return run(t, async () => {
    assertRole(user, "admin");
    if (IS_DEMO) throw new Error("demo");
    const role = str(form, "role") as Role;
    if (!ROLES.includes(role) || role === "pending") required(null);
    const { data, error } = await getSupabase().functions.invoke("invite-user", {
      body: {
        email: required(str(form, "email")),
        role,
        full_name: strOrNull(form, "full_name"),
        organization: strOrNull(form, "organization"),
        redirect_to: `${window.location.origin}${BASE_PATH}/auth/confirm/`,
      },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(String(data.error));
  });
}
