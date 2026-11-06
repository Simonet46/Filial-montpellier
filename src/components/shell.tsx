"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  CalendarRange,
  Clapperboard,
  GitCompareArrows,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plane,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { resetDemoData } from "@/lib/data";
import { IS_DEMO } from "@/lib/env";
import { useI18n, type Dictionary } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { UserProvider, useSession } from "@/lib/session";
import type { CurrentUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./visuals";

export function LangSwitch() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className="flex rounded-lg border border-line p-0.5">
      {(["es", "fr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          title={t.lang[l]}
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-md px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wider transition",
            locale === l ? "bg-mhb-blue text-white" : "text-muted hover:text-text",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-mhb-orange" aria-label="…" />
    </div>
  );
}

/** Protege el área de la plataforma: redirige al login si no hay sesión. */
export function PlatformGate({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const router = useRouter();
  const user = session.status === "authed" ? session.user : null;
  const blocked = session.status === "anon" || user?.role === "pending";

  useEffect(() => {
    if (session.status === "anon") router.replace(routes.login);
    else if (user?.role === "pending") router.replace(`${routes.login}?pending=1`);
  }, [session.status, user?.role, router]);

  if (!user || blocked) return <FullScreenLoader />;
  return (
    <UserProvider value={user}>
      <AppShell user={user}>{children}</AppShell>
    </UserProvider>
  );
}

function SignOutButton({ t, compact }: { t: Dictionary; compact?: boolean }) {
  const { signOut } = useSession();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.replace(routes.home);
      }}
      className={compact ? "p-2 text-muted hover:text-text" : "label flex items-center gap-1.5 hover:text-text"}
      aria-label={t.nav.logout}
    >
      <LogOut className="h-3.5 w-3.5" />
      {!compact && t.nav.logout}
    </button>
  );
}

function AppShell({ user, children }: { user: CurrentUser; children: ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const nav = [
    { href: routes.dashboard, label: t.nav.dashboard, icon: LayoutDashboard },
    { href: routes.players, label: t.nav.players, icon: Users },
    { href: routes.compare(), label: t.nav.compare, icon: GitCompareArrows },
    { href: routes.trainings, label: t.nav.trainings, icon: CalendarRange },
    { href: routes.videos, label: t.nav.videos, icon: Clapperboard },
    { href: routes.trials, label: t.nav.trials, icon: Plane },
    ...(user.role === "admin" ? [{ href: routes.users, label: t.nav.users, icon: ShieldCheck }] : []),
  ];
  const clean = (p: string) => p.replace(/\/+$/, "") || "/";
  const current = clean(pathname);
  const isActive = (href: string) => {
    const h = clean(href.split("?")[0]);
    return current === h || current.startsWith(h + "/");
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line bg-night/70 backdrop-blur-xl lg:flex">
        <div className="mhb-band absolute inset-x-0 top-0 h-28 opacity-30" aria-hidden />
        <div className="relative p-5">
          <Link href={routes.dashboard}>
            <Logo t={t} />
          </Link>
        </div>
        <nav className="relative flex-1 space-y-1 px-3">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 font-display text-[1.15rem] font-semibold uppercase tracking-wide transition",
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
            <LangSwitch />
            <SignOutButton t={t} />
          </div>
          <div className="rounded-xl border border-line bg-ink/60 p-3">
            <p className="truncate font-display text-xl font-bold uppercase leading-tight">{user.name}</p>
            <p className="label mt-0.5 !text-[0.62rem] text-celeste">{t.roles[user.role]}</p>
          </div>
          <div className="arg-stripe h-1 rounded-full opacity-70" />
        </div>
      </aside>

      <div className="min-w-0">
        {/* Barra superior móvil */}
        <header className="sticky top-0 z-30 border-b border-line bg-night/85 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href={routes.dashboard}>
              <Logo t={t} />
            </Link>
            <div className="flex items-center gap-2">
              <LangSwitch />
              <SignOutButton t={t} compact />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 font-display text-base font-semibold uppercase tracking-wide",
                  isActive(href) ? "bg-mhb-blue/30 text-text" : "text-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        {IS_DEMO && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b border-sol/20 bg-sol/5 px-4 py-2 text-center text-xs text-sol md:px-8">
            <span className="font-bold uppercase tracking-wider">{t.common.demoBadge}</span>
            <span className="hidden text-sol/75 md:inline">{t.common.demoNotice}</span>
            <button
              type="button"
              onClick={() => {
                if (confirm(t.common.demoResetConfirm)) resetDemoData();
              }}
              className="inline-flex items-center gap-1 rounded-md border border-sol/30 px-2 py-0.5 font-bold uppercase tracking-wider hover:bg-sol/10"
            >
              <RotateCcw className="h-3 w-3" /> {t.common.demoReset}
            </button>
          </div>
        )}

        <main className="bg-grid min-h-[calc(100vh-3rem)] px-4 py-8 md:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
