"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole } from "../auth";
import { HANDS, NATIONAL_TEAMS, PLAYER_STATUSES, POSITIONS } from "../constants";
import { repo } from "../data";
import type {
  ActionState,
  Hand,
  NationalTeam,
  PlayerInput,
  PlayerStatus,
  Position,
} from "../types";
import { numOrNull, str, strOrNull } from "../utils";
import { guarded, required } from "./guard";

function oneOf<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

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

export async function savePlayer(_prev: ActionState, form: FormData): Promise<ActionState> {
  let id = str(form, "id");
  const result = await guarded(async () => {
    await assertRole("coach", "admin");
    const input = parsePlayer(form);
    if (id) {
      await repo.updatePlayer(id, input);
    } else {
      id = await repo.createPlayer(input);
    }
    await repo.upsertContact({
      player_id: id,
      email: strOrNull(form, "contact_email"),
      phone: strOrNull(form, "contact_phone"),
      guardian_name: strOrNull(form, "guardian_name"),
      guardian_phone: strOrNull(form, "guardian_phone"),
    });
  });
  if (result?.error) return result;
  revalidatePath("/", "layout");
  redirect(`/players/${id}`);
}

export async function deletePlayer(id: string): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("coach", "admin");
    await repo.deletePlayer(id);
  });
  if (result?.error) return result;
  revalidatePath("/", "layout");
  redirect("/players");
}

export async function toggleFavorite(playerId: string, on: boolean): Promise<ActionState> {
  const result = await guarded(async () => {
    const user = await assertRole("club", "admin", "coach");
    await repo.setFavorite(user.id, playerId, on);
  });
  revalidatePath("/", "layout");
  return result;
}
