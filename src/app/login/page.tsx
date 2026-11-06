import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, ClipboardList, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { LangSwitch } from "@/components/shell";
import { Logo } from "@/components/visuals";
import { demoLogin } from "@/lib/actions/session";
import { getCurrentUser } from "@/lib/auth";
import { IS_DEMO } from "@/lib/env";
import { getI18n } from "@/lib/i18n";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.nav.login };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const [{ t, locale }, user, { pending }] = await Promise.all([getI18n(), getCurrentUser(), searchParams]);
  if (user && user.role !== "pending") redirect("/dashboard");

  const demoRoles = [
    { role: "coach" as const, title: t.login.demoCoach, text: t.login.demoCoachText, icon: ClipboardList, accent: "from-mhb-blue/30" },
    { role: "club" as const, title: t.login.demoClub, text: t.login.demoClubText, icon: Building2, accent: "from-mhb-orange/25" },
    { role: "admin" as const, title: t.login.demoAdmin, text: t.login.demoAdminText, icon: ShieldCheck, accent: "from-celeste/20" },
  ];

  return (
    <div className="bg-grid relative flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/"><Logo t={t} /></Link>
        <LangSwitch locale={locale} t={t} />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-4xl animate-rise">
          {pending || user?.role === "pending" ? (
            <div className="glass hud mx-auto max-w-md rounded-3xl p-8 text-center">
              <h1 className="font-display text-3xl font-extrabold uppercase italic">{t.login.pendingTitle}</h1>
              <p className="mt-3 text-muted">{t.login.pendingText}</p>
            </div>
          ) : IS_DEMO ? (
            <>
              <div className="mb-8 text-center">
                <p className="label mb-2 text-sol">{t.common.demoBadge}</p>
                <h1 className="font-display text-5xl font-extrabold uppercase italic">{t.login.demoTitle}</h1>
                <p className="mx-auto mt-2 max-w-xl text-muted">{t.login.demoSubtitle}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {demoRoles.map(({ role, title, text, icon: Icon, accent }) => (
                  <form key={role} action={demoLogin.bind(null, role)}>
                    <button
                      type="submit"
                      className={`glass hud group flex h-full w-full flex-col rounded-2xl bg-gradient-to-br ${accent} to-transparent p-6 text-left transition hover:-translate-y-1 hover:border-mhb-blue-light/60`}
                    >
                      <Icon className="h-8 w-8 text-mhb-orange-light" />
                      <p className="mt-4 font-display text-2xl font-bold uppercase leading-tight">{title}</p>
                      <p className="mt-2 flex-1 text-sm text-muted">{text}</p>
                      <span className="label mt-6 flex items-center gap-1 text-celeste group-hover:text-text">
                        {t.nav.login} <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </form>
                ))}
              </div>
            </>
          ) : (
            <div className="glass hud mx-auto max-w-md rounded-3xl p-8">
              <h1 className="font-display text-4xl font-extrabold uppercase italic">{t.login.title}</h1>
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
