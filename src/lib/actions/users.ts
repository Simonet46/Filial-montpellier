"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "../auth";
import { ROLES } from "../constants";
import { repo } from "../data";
import { getSiteOrigin } from "../site";
import { createServiceClient } from "../supabase/server";
import type { ActionState, Role } from "../types";
import { str, strOrNull } from "../utils";
import { guarded, required } from "./guard";

export async function updateUserRole(id: string, role: Role): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("admin");
    if (!ROLES.includes(role)) required(null);
    await repo.updateProfileRole(id, role);
  });
  revalidatePath("/admin/users");
  return result;
}

/** Invita por correo (requiere SUPABASE_SERVICE_ROLE_KEY) y asigna el rol al perfil creado. */
export async function inviteUser(_prev: ActionState, form: FormData): Promise<ActionState> {
  const result = await guarded(async () => {
    await assertRole("admin");
    const admin = createServiceClient();
    if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY");
    const email = required(str(form, "email"));
    const role = str(form, "role") as Role;
    if (!ROLES.includes(role)) required(null);
    const origin = await getSiteOrigin();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: strOrNull(form, "full_name") },
      redirectTo: `${origin}/auth/confirm`,
    });
    if (error) throw new Error(error.message);
    const { error: upError } = await admin
      .from("profiles")
      .update({ role, full_name: strOrNull(form, "full_name"), organization: strOrNull(form, "organization") })
      .eq("id", data.user.id);
    if (upError) throw new Error(upError.message);
  });
  revalidatePath("/admin/users");
  return result;
}
