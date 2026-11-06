"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "../env";

let client: SupabaseClient | null = null;

/** Cliente de Supabase del navegador. La seguridad la aplican las políticas RLS de la base. */
export function getSupabase() {
  client ??= createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}
