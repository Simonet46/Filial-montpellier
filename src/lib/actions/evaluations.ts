"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "../auth";
import { repo } from "../data";
import { RATING_KEYS, type ActionState, type Ratings } from "../types";
import { numOrNull, str, strOrNull, todayISO } from "../utils";
import { guarded, required } from "./guard";

export async function createEvaluation(_prev: ActionState, form: FormData): Promise<ActionState> {
  const playerId = str(form, "player_id");
  const result = await guarded(async () => {
    const user = await assertRole("coach", "admin");
    const ratings = Object.fromEntries(
      RATING_KEYS.map((k) => [k, Math.max(1, Math.min(10, Math.round(numOrNull(form, k) ?? 5)))]),
    ) as Ratings;
    await repo.createEvaluation({
      player_id: required(playerId),
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
  revalidatePath("/", "layout");
  return result;
}

export async function deleteEvaluation(id: string): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("coach", "admin");
    await repo.deleteEvaluation(id);
  });
  revalidatePath("/", "layout");
  return result;
}
