"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import {
  Clapperboard,
  CalendarRange,
  GitCompareArrows,
  LayoutDashboard,
  LogOut,
  Plane,
  Users,
  ShieldCheck,
} from "lucide-react";
import { setLocale, signOut } from "@/lib/actions/session";
import type { Dictionary } from "@/lib/i18n/es";
import type { CurrentUser, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./visuals";

export function LangSwitch({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className={cn("flex rounded-lg border border-line p-0.5", pending && "opacity-60")}>
      {(["es", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          title={t.lang[l]}
          onClick={() =>
            start(async () => {
              await setLocale(l);
              router.refresh();
            })
          }
          className={cn(
            "rounded-md px-2 py-1 font-mono text-[0.7rem] uppercase tracking-wider transition",
            locale === l ? "bg-mhb-blue text-white" : "text-muted hover:text-text",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function AppShell({
  user,
  t,
  locale,
  isDemo,
  children,
}: {
  user: CurrentUser;
  t: Dictionary;
  locale: Locale;
  isDemo: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const nav = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/players", label: t.nav.players, icon: Users },
    { href: "/compare", label: t.nav.compare, icon: GitCompareArrows },
    { href: "/trainings", label: t.nav.trainings, icon: CalendarRange },
    { href: "/videos", label: t.nav.videos, icon: Clapperboard },
    { href: "/trials", label: t.nav.trials, icon: Plane },
    ...(user.role === "admin" ? [{ href: "/admin/users", label: t.nav.users, icon: ShieldCheck }] : []),
  ];
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-night/60 backdrop-blur-xl lg:flex">
        <div className="p-5">
          <Link href="/dashboard">
            <Logo t={t} />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-[1.05rem] font-semibold uppercase tracking-wide transition",
                isActive(href)
                  ? "bg-gradient-to-r from-mhb-blue/30 to-transparent text-text"
                  : "text-muted hover:bg-white/5 hover:text-text",
              )}
            >
              {isActive(href) && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-mhb-orange shadow-[0_0_12px_var(--color-mhb-orange)]" />
              )}
              <Icon className={cn("h-4.5 w-4.5", isActive(href) ? "text-mhb-orange" : "")} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 border-t border-line p-4">
          <div className="flex items-center justify-between">
            <LangSwitch locale={locale} t={t} />
            <form action={signOut}>
              <button type="submit" className="label flex items-center gap-1.5 hover:text-text">
                <LogOut className="h-3.5 w-3.5" />
                {t.nav.logout}
              </button>
            </form>
          </div>
          <div className="rounded-xl border border-line bg-ink/50 p-3">
            <p className="truncate font-display text-lg font-bold uppercase leading-tight">{user.name}</p>
            <p className="label mt-0.5 !text-[0.6rem] text-celeste">{t.roles[user.role]}</p>
          </div>
          <div className="arg-stripe h-1 rounded-full opacity-70" />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior móvil */}
        <header className="sticky top-0 z-30 border-b border-line bg-night/80 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard">
              <Logo t={t} />
            </Link>
            <div className="flex items-center gap-2">
              <LangSwitch locale={locale} t={t} />
              <form action={signOut}>
                <button type="submit" className="p-2 text-muted hover:text-text" aria-label={t.nav.logout}>
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide",
                  isActive(href) ? "bg-mhb-blue/30 text-text" : "text-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        {isDemo && (
          <div className="border-b border-sol/20 bg-sol/5 px-4 py-2 text-center text-xs text-sol md:px-8">
            <span className="font-mono uppercase tracking-wider">{t.common.demoBadge}</span>
            <span className="hidden text-sol/70 md:inline"> — {t.common.demoNotice}</span>
          </div>
        )}

        <main className="bg-grid min-h-[calc(100vh-3rem)] px-4 py-8 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
