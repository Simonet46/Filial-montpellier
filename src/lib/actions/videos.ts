"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole } from "../auth";
import { VIDEO_KINDS } from "../constants";
import { repo } from "../data";
import type { ActionState, VideoKind } from "../types";
import { parseVideoUrl, str, strOrNull } from "../utils";
import { guarded, required } from "./guard";

export async function createVideo(_prev: ActionState, form: FormData): Promise<ActionState> {
  const playerId = strOrNull(form, "player_id");
  const sessionId = strOrNull(form, "session_id");
  const result = await guarded(async () => {
    const user = await assertRole("coach", "admin");
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
      player_id: playerId,
      session_id: sessionId,
      description: strOrNull(form, "description"),
      created_by: user.id,
    });
  });
  if (result?.error) return result;
  revalidatePath("/", "layout");
  redirect(playerId ? `/players/${playerId}` : sessionId ? `/trainings/${sessionId}` : "/videos");
}

export async function deleteVideo(id: string): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("coach", "admin");
    await repo.deleteVideo(id);
  });
  revalidatePath("/", "layout");
  return result;
}
