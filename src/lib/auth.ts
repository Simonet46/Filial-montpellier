import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { IS_DEMO } from "./env";
import { createClient } from "./supabase/server";
import type { CurrentUser, Role } from "./types";

export const DEMO_COOKIE = "demo_user";

export const DEMO_USERS: Record<Exclude<Role, "pending">, CurrentUser> = {
  coach: {
    id: "demo-coach",
    email: "entrenador@filial-demo.ar",
    name: "Martín Ferreyra",
    role: "coach",
    organization: "Filial Argentina",
  },
  club: {
    id: "demo-club",
    email: "formation@mhb-demo.fr",
    name: "Centre de Formation",
    role: "club",
    organization: "Montpellier Handball",
  },
  admin: {
    id: "demo-admin",
    email: "admin@dsconnect-demo.com",
    name: "DS CONNECT",
    role: "admin",
    organization: "DS CONNECT",
  },
};

/** Usuario actual (o null). Se memoriza por request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (IS_DEMO) {
    const key = (await cookies()).get(DEMO_COOKIE)?.value as keyof typeof DEMO_USERS | undefined;
    return key && DEMO_USERS[key] ? DEMO_USERS[key] : null;
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, organization")
    .eq("id", userId)
    .maybeSingle();

  return {
    id: userId,
    email: profile?.email ?? (data.claims.email as string | undefined) ?? "",
    name: profile?.full_name || profile?.email || "",
    role: (profile?.role as Role | undefined) ?? "pending",
    organization: profile?.organization ?? null,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "pending") redirect("/login?pending=1");
  return user;
}

export const canEdit = (role: Role) => role === "coach" || role === "admin";
export const isAdmin = (role: Role) => role === "admin";
export const canRequestTrial = (role: Role) => role === "club" || role === "admin";

export class ForbiddenError extends Error {}

/** Para Server Actions: devuelve el usuario o lanza si no tiene alguno de los roles. */
export async function assertRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role)) throw new ForbiddenError("forbidden");
  return user;
}
