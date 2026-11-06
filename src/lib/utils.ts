import { EU_COUNTRIES } from "./constants";
import {
  RATING_KEYS,
  type Evaluation,
  type Locale,
  type Ratings,
  type VideoSource,
} from "./types";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ageFrom(birthDate: string, now = new Date()) {
  const b = new Date(birthDate + "T00:00:00");
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function hasEuPassport(passports: string[]) {
  return passports.some((p) => EU_COUNTRIES.has(p.toUpperCase()));
}

/** Promedio de cada atributo sobre las últimas `take` evaluaciones (más recientes primero). */
export function averageRatings(evals: Evaluation[], take = 3): Ratings | null {
  const recent = [...evals]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, take);
  if (recent.length === 0) return null;
  const out = {} as Ratings;
  for (const key of RATING_KEYS) {
    const sum = recent.reduce((acc, e) => acc + e[key], 0);
    out[key] = Math.round((sum / recent.length) * 10) / 10;
  }
  return out;
}

/** Valoración global 0-100 a partir de atributos 1-10. */
export function overallFrom(ratings: Ratings | null) {
  if (!ratings) return null;
  const vals = RATING_KEYS.map((k) => ratings[k]);
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10);
}

export function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const intlLocale: Record<Locale, string> = { es: "es-AR", fr: "fr-FR" };

export function formatDate(
  date: string | null | undefined,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" },
) {
  if (!date) return "—";
  const d = new Date(date.length === 10 ? date + "T12:00:00" : date);
  return new Intl.DateTimeFormat(intlLocale[locale], opts).format(d);
}

export function countryName(code: string, locale: Locale) {
  try {
    return new Intl.DisplayNames([intlLocale[locale]], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Detecta la plataforma de un link y devuelve la URL embebible. */
export function parseVideoUrl(raw: string): { source: VideoSource; embed: string | null } {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { source: "link", embed: null };
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return { source: "youtube", embed: id ? `https://www.youtube-nocookie.com/embed/${id}` : null };
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    let id = url.searchParams.get("v");
    if (!id) {
      const m = url.pathname.match(/\/(embed|shorts|live)\/([^/?]+)/);
      id = m?.[2] ?? null;
    }
    return { source: "youtube", embed: id ? `https://www.youtube-nocookie.com/embed/${id}` : null };
  }
  if (host.endsWith("vimeo.com")) {
    const m = url.pathname.match(/\/(?:video\/)?(\d+)/);
    return { source: "vimeo", embed: m ? `https://player.vimeo.com/video/${m[1]}` : null };
  }
  return { source: "link", embed: null };
}

export function uid() {
  return crypto.randomUUID();
}

export function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function strOrNull(form: FormData, key: string) {
  const v = str(form, key);
  return v === "" ? null : v;
}

export function numOrNull(form: FormData, key: string) {
  const v = str(form, key).replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
