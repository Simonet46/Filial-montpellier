"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, DEMO_USERS } from "../auth";
import { IS_DEMO } from "../env";
import { getI18n, LOCALE_COOKIE } from "../i18n";
import { getSiteOrigin } from "../site";
import { createClient } from "../supabase/server";
import type { ActionState, Locale } from "../types";
import { str } from "../utils";

const YEAR = 60 * 60 * 24 * 365;

export async function setLocale(locale: Locale) {
  (await cookies()).set(LOCALE_COOKIE, locale === "fr" ? "fr" : "es", {
    path: "/",
    maxAge: YEAR,
    sameSite: "lax",
  });
}

export async function demoLogin(role: keyof typeof DEMO_USERS) {
  if (!IS_DEMO || !DEMO_USERS[role]) return;
  (await cookies()).set(DEMO_COOKIE, role, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
  redirect("/dashboard");
}

export async function signIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  const { t } = await getI18n();
  const email = str(form, "email");
  const password = str(form, "password");
  const intent = str(form, "intent");
  if (!email) return { error: t.common.required };

  const supabase = await createClient();
  if (intent === "magic") {
    const origin = await getSiteOrigin();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback` },
    });
    return error ? { error: error.message } : { ok: true };
  }

  if (!password) return { error: t.common.required };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: t.login.invalid };
  redirect("/dashboard");
}

export async function signOut() {
  if (IS_DEMO) {
    (await cookies()).delete(DEMO_COOKIE);
  } else {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
