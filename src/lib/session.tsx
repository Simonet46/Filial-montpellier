"use client";

import { createContext, use, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { BASE_PATH, IS_DEMO } from "./env";
import { DEMO_USERS, isDemoRole, type DemoRole } from "./roles";
import { notifyChange, persistedValue } from "./store";
import { getSupabase } from "./supabase/client";
import type { CurrentUser, Role } from "./types";

export type Session =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "authed"; user: CurrentUser };

interface SessionApi {
  session: Session;
  loginDemo: (role: DemoRole) => void;
  signOut: () => Promise<void>;
  /** Devuelven un mensaje de error o null si salió bien. */
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  sendMagicLink: (email: string) => Promise<string | null>;
}

const SessionContext = createContext<SessionApi | null>(null);

/* ---------------------------------- Demo ---------------------------------- */

const demoUserStore = persistedValue<DemoRole | null>("mhb-filial-demo-user", (raw) =>
  isDemoRole(raw) ? raw : null,
);

function DemoSessionProvider({ children }: { children: ReactNode }) {
  // undefined durante el prerender (todavía no sabemos quién es).
  const role = useSyncExternalStore(demoUserStore.subscribe, demoUserStore.read, () => undefined);
  const api = useMemo<SessionApi>(() => {
    const session: Session =
      role === undefined ? { status: "loading" } : role ? { status: "authed", user: DEMO_USERS[role] } : { status: "anon" };
    return {
      session,
      loginDemo: (r) => {
        demoUserStore.write(r);
        notifyChange();
      },
      signOut: async () => demoUserStore.write(null),
      signInWithPassword: async () => "demo",
      sendMagicLink: async () => "demo",
    };
  }, [role]);
  return <SessionContext value={api}>{children}</SessionContext>;
}

/* -------------------------------- Supabase -------------------------------- */

function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: "loading" });

  useEffect(() => {
    const sb = getSupabase();
    let active = true;

    const load = async (userId: string | undefined, email: string | undefined) => {
      if (!userId) {
        if (active) setSession({ status: "anon" });
        return;
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("id, email, full_name, role, organization")
        .eq("id", userId)
        .maybeSingle();
      if (!active) return;
      setSession({
        status: "authed",
        user: {
          id: userId,
          email: profile?.email ?? email ?? "",
          name: profile?.full_name || profile?.email || email || "",
          role: (profile?.role as Role | undefined) ?? "pending",
          organization: profile?.organization ?? null,
        },
      });
      notifyChange();
    };

    sb.auth.getSession().then(({ data }) => load(data.session?.user.id, data.session?.user.email));
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      // Diferido: no se deben encadenar llamadas a Supabase dentro del callback.
      setTimeout(() => void load(s?.user.id, s?.user.email), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const api = useMemo<SessionApi>(
    () => ({
      session,
      loginDemo: () => undefined,
      signOut: async () => {
        await getSupabase().auth.signOut();
      },
      signInWithPassword: async (email, password) => {
        const { error } = await getSupabase().auth.signInWithPassword({ email, password });
        return error ? error.message : null;
      },
      sendMagicLink: async (email) => {
        const { error } = await getSupabase().auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: `${window.location.origin}${BASE_PATH}/auth/callback/`,
          },
        });
        return error ? error.message : null;
      },
    }),
    [session],
  );
  return <SessionContext value={api}>{children}</SessionContext>;
}

export const SessionProvider = IS_DEMO ? DemoSessionProvider : SupabaseSessionProvider;

export function useSession() {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error("useSession fuera de SessionProvider");
  return ctx;
}

/* ------------------------- Usuario dentro de la plataforma ------------------------- */

const UserContext = createContext<CurrentUser | null>(null);
export const UserProvider = UserContext;

/** Usuario autenticado (solo dentro del área protegida). */
export function useUser(): CurrentUser {
  const user = use(UserContext);
  if (!user) throw new Error("useUser fuera del área autenticada");
  return user;
}
