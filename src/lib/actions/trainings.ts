"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole } from "../auth";
import { repo } from "../data";
import type { ActionState } from "../types";
import { str, strOrNull } from "../utils";
import { guarded, required } from "./guard";

export async function saveSession(_prev: ActionState, form: FormData): Promise<ActionState> {
  let id = str(form, "id");
  const result = await guarded(async () => {
    await assertRole("coach", "admin");
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
    if (id) await repo.updateSession(id, input);
    else id = await repo.createSession(input);
  });
  if (result?.error) return result;
  revalidatePath("/", "layout");
  redirect(`/trainings/${id}`);
}

export async function deleteSession(id: string): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("coach", "admin");
    await repo.deleteSession(id);
  });
  if (result?.error) return result;
  revalidatePath("/", "layout");
  redirect("/trainings");
}
