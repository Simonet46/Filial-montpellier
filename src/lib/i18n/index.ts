import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "../types";
import es, { type Dictionary } from "./es";
import fr from "./fr";

export const LOCALES: Locale[] = ["es", "fr"];
export const LOCALE_COOKIE = "lang";
const dictionaries: Record<Locale, Dictionary> = { es, fr };

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "fr" ? "fr" : "es";
}

export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}

export type { Dictionary };
