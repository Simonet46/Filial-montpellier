export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** Sin credenciales de Supabase la plataforma corre en modo demo, con datos en el navegador. */
export const IS_DEMO = !SUPABASE_URL || !SUPABASE_KEY;

/** Subcarpeta de publicación (p. ej. "/Filial-montpellier" en GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
