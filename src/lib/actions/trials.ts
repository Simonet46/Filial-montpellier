"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "../auth";
import { TRIAL_STATUSES } from "../constants";
import { repo } from "../data";
import type { ActionState, TrialStatus } from "../types";
import { str, strOrNull } from "../utils";
import { guarded, required } from "./guard";

export async function createTrial(_prev: ActionState, form: FormData): Promise<ActionState> {
  const result = await guarded(async () => {
    const user = await assertRole("club", "admin");
    const playerId = required(str(form, "player_id"));
    await repo.createTrial({
      player_id: playerId,
      requested_by: user.id,
      requested_by_name: user.name,
      status: "requested",
      proposed_date: strOrNull(form, "proposed_date"),
      notes: strOrNull(form, "notes"),
    });
    // El paso del jugador a "invitado" lo hace el trigger on_trial_created (y el repo demo).
  });
  revalidatePath("/", "layout");
  return result;
}

export async function updateTrialStatus(id: string, status: TrialStatus): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("club", "coach", "admin");
    if (!TRIAL_STATUSES.includes(status)) required(null);
    await repo.updateTrialStatus(id, status);
  });
  revalidatePath("/", "layout");
  return result;
}
