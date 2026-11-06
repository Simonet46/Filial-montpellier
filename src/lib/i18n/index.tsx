"use client";

import { createContext, use, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { persistedValue } from "../store";
import type { Locale } from "../types";
import es, { type Dictionary } from "./es";
import fr from "./fr";

export const LOCALES: Locale[] = ["es", "fr"];
const dictionaries: Record<Locale, Dictionary> = { es, fr };

const localeStore = persistedValue<Locale>("mhb-filial-lang", (raw) => (raw === "fr" ? "fr" : "es"));

interface I18n {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(localeStore.subscribe, localeStore.read, () => "es" as Locale);

  // ?lang=fr en el link permite compartir la versión en francés.
  useEffect(() => {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang === "es" || lang === "fr") localeStore.write(lang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18n>(
    () => ({ locale, t: dictionaries[locale], setLocale: (l) => localeStore.write(l) }),
    [locale],
  );
  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n() {
  const ctx = use(I18nContext);
  if (!ctx) throw new Error("useI18n fuera de I18nProvider");
  return ctx;
}

/** Título de la pestaña del navegador. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) document.title = `${title} · Filial Argentina · Montpellier Handball`;
  }, [title]);
}

export type { Dictionary };
