import { ArrowRight, Check } from "lucide-react";
import { LangSwitch } from "@/components/shell";
import { LinkButton } from "@/components/ui";
import { CourtMap, Logo, RadarChart } from "@/components/visuals";
import { getCurrentUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

// Perfil ilustrativo para el visor del hero (no corresponde a un jugador real).
const SAMPLE = { technique: 8, tactics: 7, physical: 8, speed: 7, shooting: 9, defense: 6, mentality: 8 };

export default async function LandingPage() {
  const [{ t, locale }, user, stats] = await Promise.all([getI18n(), getCurrentUser(), repo.publicStats()]);
  const l = t.landing;
  const enter = user ? "/dashboard" : "/login";

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
        <Logo t={t} />
        <div className="flex items-center gap-3">
          <LangSwitch locale={locale} t={t} />
          <LinkButton href={enter} variant="secondary" size="sm" className="hidden sm:inline-flex">
            {user ? t.nav.platform : t.nav.login}
          </LinkButton>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div className="animate-rise">
          <p className="label mb-5 flex items-center gap-2 text-mhb-orange-light">
            <span className="h-px w-8 bg-mhb-orange" /> {l.kicker}
          </p>
          <h1 className="font-display text-6xl font-extrabold uppercase italic leading-[0.88] tracking-tight sm:text-7xl xl:text-8xl">
            {l.title1}
            <br />
            <span className="text-celeste drop-shadow-[0_0_30px_rgb(116_172_223/0.45)]">{l.title2}</span>
            <br />
            <span className="text-gradient-orange">{l.title3}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{l.lead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={enter} className="h-12 px-6 text-lg">
              {user ? t.nav.platform : l.ctaPrimary} <ArrowRight className="h-5 w-5" />
            </LinkButton>
            <LinkButton href="#como-funciona" variant="secondary" className="h-12 px-6 text-lg">
              {l.ctaSecondary}
            </LinkButton>
          </div>
        </div>

        {/* Visor HUD */}
        <div className="relative animate-rise [animation-delay:150ms]">
          <div className="absolute -inset-8 rounded-full bg-mhb-blue/25 blur-3xl" />
          <div className="glass hud relative overflow-hidden rounded-3xl p-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-mhb-orange/10 to-transparent animate-scan" />
            <div className="flex items-center justify-between">
              <p className="label">{t.players.evaluation}</p>
              <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> live
              </span>
            </div>
            <div className="mt-2 grid items-center gap-4 sm:grid-cols-[1fr_0.9fr]">
              <RadarChart series={[{ label: "sample", color: "#ff6a13", values: SAMPLE }]} t={t} />
              <div className="space-y-4">
                <CourtMap primary="RB" secondary="RW" t={t} />
                <div className="grid grid-cols-2 gap-2 text-center">
                  {[
                    ["1,92", "m"],
                    ["96", "km/h"],
                  ].map(([v, u]) => (
                    <div key={u} className="rounded-xl border border-line bg-ink/50 py-2">
                      <p className="font-display text-2xl font-extrabold text-gradient-blue">{v}</p>
                      <p className="label !text-[0.55rem]">{u}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-md border border-sol/40 bg-sol/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase text-sol">
                    {t.hand.left}
                  </span>
                  <span className="rounded-md border border-mhb-blue-light/40 bg-mhb-blue/15 px-2 py-0.5 font-mono text-[0.65rem] uppercase text-mhb-blue-light">
                    AR · IT
                  </span>
                  <span className="rounded-md border border-celeste/40 bg-celeste/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase text-celeste">
                    ★ ARG
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cifras */}
      <section className="relative z-10 border-y border-line bg-night/60 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-4 md:grid-cols-4 md:divide-x md:px-8">
          {[
            [stats.players, l.statPlayers, "text-gradient-blue"],
            [stats.sessions, l.statSessions, "text-celeste"],
            [stats.videos, l.statVideos, "text-gradient-orange"],
            [stats.eu, l.statEu, "text-sol"],
          ].map(([value, label, color]) => (
            <div key={label as string} className="px-4 py-8 text-center">
              <p className={`font-display text-5xl font-extrabold tabular-nums md:text-6xl ${color}`}>{value}</p>
              <p className="label mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="relative z-10 mx-auto max-w-7xl scroll-mt-10 px-4 py-24 md:px-8">
        <h2 className="font-display text-5xl font-extrabold uppercase italic">{l.howTitle}</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [l.step1Title, l.step1Text, "text-celeste", "AR"],
            [l.step2Title, l.step2Text, "text-mhb-blue-light", "DATA"],
            [l.step3Title, l.step3Text, "text-mhb-orange-light", "FR"],
          ].map(([title, text, color, tag], i) => (
            <div key={title} className="glass hud relative overflow-hidden rounded-2xl p-6">
              <span className="pointer-events-none absolute -right-3 -top-6 font-display text-[7rem] font-extrabold italic leading-none text-white/[0.04]">
                0{i + 1}
              </span>
              <p className={`font-mono text-xs uppercase tracking-[0.3em] ${color}`}>
                0{i + 1} · {tag}
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold uppercase">{title}</h3>
              <p className="mt-3 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perfil completo */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="glass relative overflow-hidden rounded-3xl p-8 md:p-12">
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-mhb-orange/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-5xl font-extrabold uppercase italic leading-none">{l.featuresTitle}</h2>
              <div className="arg-stripe mt-6 h-1.5 w-24 rounded-full" />
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {l.features.map((feat) => (
                <li key={feat} className="flex items-center gap-3 rounded-xl border border-line bg-ink/40 px-4 py-3">
                  <Check className="h-4 w-4 shrink-0 text-mhb-orange" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-line">
        <div className="arg-stripe h-1 opacity-70" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted md:flex-row md:px-8">
          <Logo t={t} />
          <p className="font-mono text-xs uppercase tracking-widest">{t.brand.tagline}</p>
          <p className="font-mono text-xs uppercase tracking-widest">{l.footer}</p>
        </div>
      </footer>
    </div>
  );
}
