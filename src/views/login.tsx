"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Building2, ClipboardList, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { FullScreenLoader, LangSwitch } from "@/components/shell";
import { Logo } from "@/components/visuals";
import { IS_DEMO } from "@/lib/env";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { isDemoRole, type DemoRole } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useSession } from "@/lib/session";

export function LoginView() {
  const { t } = useI18n();
  const { session, loginDemo } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const pending = params.get("pending") === "1" || (session.status === "authed" && session.user.role === "pending");
  const autoRole = params.get("as");
  useDocumentTitle(t.nav.login);

  // Link directo, p. ej. /login/?as=coach para el entrenador de la filial (modo demo).
  useEffect(() => {
    if (IS_DEMO && isDemoRole(autoRole) && session.status === "anon") loginDemo(autoRole);
  }, [autoRole, session.status, loginDemo]);

  useEffect(() => {
    if (session.status === "authed" && session.user.role !== "pending") router.replace(routes.dashboard);
  }, [session, router]);

  if (session.status === "loading" || (session.status === "authed" && !pending)) return <FullScreenLoader />;

  const demoRoles: { role: DemoRole; title: string; text: string; icon: typeof ClipboardList; accent: string }[] = [
    { role: "coach", title: t.login.demoCoach, text: t.login.demoCoachText, icon: ClipboardList, accent: "from-mhb-blue/30" },
    { role: "club", title: t.login.demoClub, text: t.login.demoClubText, icon: Building2, accent: "from-mhb-orange/25" },
    { role: "admin", title: t.login.demoAdmin, text: t.login.demoAdminText, icon: ShieldCheck, accent: "from-celeste/20" },
  ];

  return (
    <div className="bg-grid relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href={routes.home}>
          <Logo t={t} />
        </Link>
        <LangSwitch />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-4xl animate-rise">
          {pending ? (
            <div className="glass hud mx-auto max-w-md rounded-3xl p-8 text-center">
              <h1 className="text-4xl font-extrabold uppercase">{t.login.pendingTitle}</h1>
              <p className="mt-3 text-muted">{t.login.pendingText}</p>
            </div>
          ) : IS_DEMO ? (
            <>
              <div className="mb-8 text-center">
                <p className="label mb-2 !text-sol">{t.common.demoBadge}</p>
                <h1 className="text-5xl font-extrabold uppercase md:text-6xl">{t.login.demoTitle}</h1>
                <p className="mx-auto mt-2 max-w-xl text-muted">{t.login.demoSubtitle}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {demoRoles.map(({ role, title, text, icon: Icon, accent }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => loginDemo(role)}
                    className={`glass hud group flex h-full w-full flex-col rounded-2xl bg-gradient-to-br ${accent} to-transparent p-6 text-left transition hover:-translate-y-1 hover:border-mhb-blue-light/60`}
                  >
                    <Icon className="h-8 w-8 text-mhb-orange-light" />
                    <p className="mt-4 font-display text-3xl font-bold uppercase leading-none">{title}</p>
                    <p className="mt-2 flex-1 text-sm text-muted">{text}</p>
                    <span className="label mt-6 flex items-center gap-1 !text-celeste group-hover:!text-text">
                      {t.nav.login} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
              <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted">{t.login.demoStorage}</p>
            </>
          ) : (
            <div className="glass hud mx-auto max-w-md rounded-3xl p-8">
              <h1 className="text-5xl font-extrabold uppercase">{t.login.title}</h1>
              <p className="mb-6 mt-2 text-muted">{t.login.subtitle}</p>
              <LoginForm t={t} />
            </div>
          )}
        </div>
      </main>
      <div className="arg-stripe h-1 opacity-60" />
    </div>
  );
}
