"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clapperboard,
  Cpu,
  Flame,
  GitCompareArrows,
  GraduationCap,
  Handshake,
  IdCard,
  KeyRound,
  Lock,
  Maximize2,
  Minimize2,
  Plane,
  Quote,
  Rocket,
  Scale,
  ScanSearch,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { LangSwitch } from "@/components/shell";
import { LinkButton } from "@/components/ui";
import { CourtMap, Logo, RadarChart } from "@/components/visuals";
import { summarize } from "@/lib/data";
import { demoEvaluations, demoPlayers, demoVideos } from "@/lib/data/demo-seed";
import { IS_DEMO } from "@/lib/env";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const SLIDES = 12;

// Jugador ficticio de los datos de ejemplo, para mostrar cómo se ve la plataforma.
const SAMPLE = summarize(demoPlayers[0], demoEvaluations, demoVideos, new Set());

const subscribeFullscreen = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
};
const noopSubscribe = () => () => undefined;

export function PresentationView() {
  const { t, locale } = useI18n();
  const p = t.pitch;
  useDocumentTitle(p.slides[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => !!document.fullscreenElement, () => false);
  const canFullscreen = useSyncExternalStore(noopSubscribe, () => !!document.fullscreenEnabled, () => false);

  const goTo = useCallback((i: number) => {
    const index = Math.max(0, Math.min(SLIDES - 1, i));
    containerRef.current
      ?.querySelector<HTMLElement>(`[data-index="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Diapositiva activa: la que ocupa el centro de la pantalla.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root, rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    root.querySelectorAll("[data-slide]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Teclado: flechas, página, espacio, inicio y fin (como un presentador).
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target as HTMLElement | null)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    const forward = ["ArrowDown", "ArrowRight", "PageDown", " "];
    const back = ["ArrowUp", "ArrowLeft", "PageUp"];
    if (forward.includes(e.key)) {
      e.preventDefault();
      goTo(active + 1);
    } else if (back.includes(e.key)) {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(SLIDES - 1);
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  const coachHref = IS_DEMO ? `${routes.login}?as=coach` : routes.login;
  const clubHref = IS_DEMO ? `${routes.login}?as=club` : routes.login;

  return (
    <div ref={containerRef} className="h-svh snap-y snap-proximity overflow-y-auto overflow-x-hidden md:snap-mandatory">
      {/* Progreso */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-celeste via-mhb-blue-light to-mhb-orange transition-all duration-500"
          style={{ width: `${((active + 1) / SLIDES) * 100}%` }}
        />
      </div>

      {/* Barra superior */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <button type="button" onClick={() => goTo(0)} className="shrink-0" aria-label={p.slides[0]}>
            <span className="sm:hidden">
              <Logo t={t} compact />
            </span>
            <span className="hidden sm:block">
              <Logo t={t} />
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="label hidden tabular-nums sm:inline">
              <span className="text-text">{String(active + 1).padStart(2, "0")}</span> / {SLIDES} · {p.slides[active]}
            </span>
            <LangSwitch />
            {canFullscreen && (
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? p.controls.exitFullscreen : p.controls.fullscreen}
                className="hidden rounded-lg border border-line p-2 text-muted transition hover:text-text md:inline-flex"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            )}
            <LinkButton href={routes.login} variant="secondary" size="sm">
              {p.controls.platform}
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Navegación lateral */}
      <nav className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-2.5 lg:flex" aria-label="Slides">
        {p.slides.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => goTo(i)}
            className="group flex items-center gap-3"
            aria-label={label}
            aria-current={i === active}
          >
            <span className="label pointer-events-none opacity-0 transition group-hover:opacity-100">{label}</span>
            <span
              className={cn(
                "block rounded-full transition-all",
                i === active ? "h-2.5 w-6 bg-mhb-orange shadow-[0_0_10px_var(--color-mhb-orange)]" : "h-2 w-2 bg-white/25 group-hover:bg-white/60",
              )}
            />
          </button>
        ))}
      </nav>

      {/* Anterior / siguiente */}
      <div className="fixed bottom-5 right-5 z-40 hidden gap-2 md:flex">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          className="glass rounded-lg p-2 text-muted transition hover:text-text disabled:opacity-30"
          aria-label={p.controls.prev}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === SLIDES - 1}
          className="glass rounded-lg p-2 text-muted transition hover:text-text disabled:opacity-30"
          aria-label={p.controls.next}
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>

      {/* 01 · Portada */}
      <Slide index={0} className="pt-28">
        <div className="mhb-band pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[44rem] opacity-60 blur-[1px]" aria-hidden />
        <CourtLines className="pointer-events-none absolute -right-24 top-1/2 hidden w-[52rem] -translate-y-1/2 opacity-[0.07] lg:block" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-rise">
            <p className="label mb-6 flex items-center gap-3 !text-mhb-orange-light">
              <span className="h-px w-10 bg-mhb-orange" /> {p.cover.kicker}
            </p>
            <h1 className="font-display text-[5.5rem] font-black uppercase leading-[0.82] tracking-tight sm:text-[8rem] xl:text-[10rem]">
              {p.cover.title1}
              <br />
              <span className="text-celeste drop-shadow-[0_0_40px_rgb(116_172_223/0.35)]">{p.cover.title2}</span>
            </h1>
            <p className="mt-4 font-display text-4xl font-extrabold uppercase tracking-wide text-gradient-orange sm:text-5xl">
              {p.cover.club}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{p.cover.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => goTo(1)}
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-mhb-orange to-mhb-orange-light px-6 font-display text-xl font-bold uppercase tracking-wider text-white shadow-[0_0_28px_-6px_var(--color-mhb-orange)] transition hover:brightness-110"
              >
                {p.cover.start} <ArrowDown className="h-5 w-5" />
              </button>
              <LinkButton href={routes.login} variant="secondary" className="h-12 px-6 !text-xl">
                {p.cover.platform} <ArrowRight className="h-5 w-5" />
              </LinkButton>
            </div>
          </div>
          <div className="relative hidden animate-rise [animation-delay:150ms] lg:block">
            <div className="absolute -inset-10 rounded-full bg-mhb-blue/25 blur-3xl" />
            <div className="glass hud relative overflow-hidden rounded-3xl p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-mhb-orange/10 to-transparent animate-scan" />
              <div className="flex items-center justify-between">
                <p className="label">{t.players.evaluation}</p>
                <span className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> live
                </span>
              </div>
              <div className="mt-2 grid items-center gap-4 sm:grid-cols-[1fr_0.85fr]">
                {SAMPLE.ratings && <RadarChart series={[{ label: "sample", color: "#e95323", values: SAMPLE.ratings }]} t={t} />}
                <div className="space-y-4">
                  <CourtMap primary={SAMPLE.position} secondary={SAMPLE.secondary_position} t={t} />
                  <div className="grid grid-cols-2 gap-2 text-center">
                    {[
                      [`${SAMPLE.height_cm}`, "cm"],
                      [`${SAMPLE.overall}`, t.players.overallShort],
                    ].map(([v, u]) => (
                      <div key={u} className="rounded-xl border border-line bg-ink/60 py-2">
                        <p className="font-display text-3xl font-extrabold text-gradient-blue">{v}</p>
                        <p className="label !text-[0.55rem]">{u}</p>
                      </div>
                    ))}
                  </div>
                  <p className="label text-center !text-[0.55rem]">{p.platform.sample}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-14 flex flex-col items-center gap-3 text-center">
          <p className="label">{p.proposal}</p>
          <span className="arg-stripe h-1 w-24 rounded-full" />
        </div>
      </Slide>

      {/* 02 · El proyecto */}
      <Slide index={1}>
        <SlideTitle n={2} kicker={p.vision.kicker} title={p.vision.title} />
        <p className="mt-6 max-w-4xl text-lg leading-relaxed text-text/85 md:text-xl">{p.vision.text}</p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {p.vision.pillars.map((pillar, i) => {
            const Icon = [ScanSearch, GraduationCap, Plane][i];
            return (
              <div key={pillar.title} className="glass hud relative overflow-hidden rounded-2xl p-6">
                <BigNumber n={i + 1} />
                <Icon className="h-8 w-8 text-mhb-orange" />
                <h3 className="mt-4 text-4xl font-extrabold uppercase">{pillar.title}</h3>
                <p className="mt-2 text-muted">{pillar.text}</p>
              </div>
            );
          })}
        </div>
      </Slide>

      {/* 03 · Por qué Argentina */}
      <Slide index={2}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <SlideTitle n={3} kicker={p.argentina.kicker} title={p.argentina.title} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {p.argentina.points.map((point, i) => {
                const Icon = [Trophy, IdCard, Flame, Handshake][i];
                return (
                  <div key={point.title} className="glass rounded-2xl p-5">
                    <Icon className="h-6 w-6 text-celeste" />
                    <h3 className="mt-3 text-2xl font-bold uppercase">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{point.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <RouteCard distance={p.argentina.distance} label={p.argentina.distanceLabel} />
        </div>
      </Slide>

      {/* 04 · La filial */}
      <Slide index={3}>
        <SlideTitle n={4} kicker={p.filial.kicker} title={p.filial.title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.filial.items.map((item, i) => (
            <div key={item.title} className="glass hud rounded-2xl p-5">
              <p className={cn("font-display text-7xl font-black leading-none", i % 2 ? "text-gradient-blue" : "text-gradient-orange")}>
                {item.value}
              </p>
              <p className="label mt-1">{item.unit}</p>
              <h3 className="mt-4 text-2xl font-bold uppercase leading-tight">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="glass mt-6 rounded-2xl p-5">
          <p className="label mb-4 flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-mhb-orange" /> {p.filial.calendar}
          </p>
          <div className="grid grid-cols-12 gap-1">
            {p.filial.months.map((m, i) => {
              const on = [2, 4, 6, 8, 9, 11].includes(i);
              return (
                <div key={m} className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full",
                      on ? "bg-mhb-orange shadow-[0_0_12px_var(--color-mhb-orange)]" : "bg-white/10",
                    )}
                  />
                  <span className={cn("text-[0.65rem] font-bold uppercase", on ? "text-text" : "text-muted")}>{m}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Slide>

      {/* 05 · La plataforma */}
      <Slide index={4}>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <SlideTitle n={5} kicker={p.platform.kicker} title={p.platform.title} />
            <ul className="mt-8 space-y-3">
              {p.platform.features.map((feature, i) => {
                const Icon = [IdCard, Activity, Clapperboard, GitCompareArrows, Plane][i];
                return (
                  <li key={feature.title} className="flex gap-4 rounded-xl border border-line bg-white/[0.03] p-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mhb-blue/20 text-mhb-blue-light">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-display text-xl font-bold uppercase leading-tight">{feature.title}</p>
                      <p className="text-sm text-muted">{feature.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <LinkButton href={routes.login} className="mt-6 h-12 px-6 !text-xl">
              {p.platform.cta} <ArrowRight className="h-5 w-5" />
            </LinkButton>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-mhb-blue/20 blur-3xl" />
            <div className="pointer-events-none relative grid gap-4 sm:grid-cols-[1fr_0.9fr]" aria-hidden>
              <PlayerCard player={SAMPLE} t={t} locale={locale} />
              <div className="glass hud flex flex-col items-center justify-center rounded-2xl p-4">
                {SAMPLE.ratings && <RadarChart series={[{ label: "sample", color: "#18a9e6", values: SAMPLE.ratings }]} t={t} size={260} />}
              </div>
            </div>
            <p className="label relative mt-3 text-center !text-sol">{p.platform.sample}</p>
          </div>
        </div>
      </Slide>

      {/* 06 · Roles */}
      <Slide index={5}>
        <SlideTitle n={6} kicker={p.roles.kicker} title={p.roles.title} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {p.roles.items.map((role, i) => {
            const Icon = [ClipboardList, Building2, Cpu][i];
            const stripe = ["arg-stripe", "bg-gradient-to-r from-mhb-blue via-white to-mhb-orange", "bg-gradient-to-r from-mhb-blue-light to-mhb-orange"][i];
            return (
              <div key={role.who} className="glass hud flex flex-col rounded-2xl p-6">
                <span className={cn("mb-5 h-1.5 w-16 rounded-full", stripe)} />
                <Icon className="h-9 w-9 text-mhb-orange-light" />
                <h3 className="mt-4 text-4xl font-extrabold uppercase leading-none">{role.who}</h3>
                <p className="label mt-2 !text-celeste">{role.where}</p>
                <p className="mt-4 text-muted">{role.text}</p>
              </div>
            );
          })}
        </div>
      </Slide>

      {/* 07 · El recorrido */}
      <Slide index={6}>
        <SlideTitle n={7} kicker={p.journey.kicker} title={p.journey.title} />
        <div className="relative mt-12">
          <div className="absolute left-6 right-6 top-6 hidden h-0.5 bg-gradient-to-r from-celeste via-mhb-blue-light to-mhb-orange md:block" />
          <ol className="grid gap-6 md:grid-cols-5">
            {p.journey.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 md:block">
                <span
                  className={cn(
                    "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-ink font-display text-2xl font-black",
                    i === 0 ? "border-celeste text-celeste" : i === 4 ? "border-mhb-orange text-mhb-orange shadow-[0_0_20px_var(--color-mhb-orange)]" : "border-mhb-blue-light text-mhb-blue-light",
                  )}
                >
                  {i + 1}
                </span>
                <div className="md:mt-5">
                  <h3 className="text-3xl font-extrabold uppercase leading-none">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-12 flex items-center justify-between text-sm font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2 text-celeste">
            <span className="arg-stripe h-1.5 w-8 rounded-full" /> Argentina
          </span>
          <span className="flex items-center gap-2 text-mhb-orange-light">
            Montpellier <Plane className="h-4 w-4" />
          </span>
        </div>
      </Slide>

      {/* 08 · Beneficios */}
      <Slide index={7}>
        <SlideTitle n={8} kicker={p.benefits.kicker} title={p.benefits.title} />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {[
            { block: p.benefits.club, accent: "text-mhb-orange", border: "border-t-mhb-orange", icon: Building2 },
            { block: p.benefits.filial, accent: "text-celeste", border: "border-t-celeste", icon: Users },
          ].map(({ block, accent, border, icon: Icon }) => (
            <div key={block.title} className={cn("glass rounded-2xl border-t-2 p-6", border)}>
              <div className="flex items-center gap-3">
                <Icon className={cn("h-7 w-7", accent)} />
                <h3 className="text-3xl font-extrabold uppercase leading-none">{block.title}</h3>
              </div>
              <ul className="mt-6 space-y-3">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className={cn("mt-0.5 h-5 w-5 shrink-0", accent)} />
                    <span className="text-text/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Slide>

      {/* 09 · Seguridad */}
      <Slide index={8}>
        <SlideTitle n={9} kicker={p.security.kicker} title={p.security.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.security.items.map((item, i) => {
            const Icon = [KeyRound, ShieldCheck, Lock, Scale][i];
            return (
              <div key={item.title} className="glass hud rounded-2xl p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-mhb-blue-light/30 bg-mhb-blue/15">
                  <Icon className="h-6 w-6 text-mhb-blue-light" />
                </span>
                <h3 className="mt-5 text-2xl font-bold uppercase leading-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Slide>

      {/* 10 · Hoja de ruta */}
      <Slide index={9}>
        <SlideTitle n={10} kicker={p.roadmap.kicker} title={p.roadmap.title} />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {p.roadmap.phases.map((phase, i) => (
            <div key={phase.tag} className="glass relative overflow-hidden rounded-2xl p-6">
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mhb-blue to-mhb-orange"
                style={{ opacity: 0.4 + i * 0.2 }}
              />
              <p className="label !text-mhb-orange-light">{phase.tag}</p>
              <h3 className="mt-3 text-3xl font-extrabold uppercase leading-none">{phase.title}</h3>
              <p className="mt-3 text-sm text-muted">{phase.text}</p>
              {i === 0 && <Rocket className="absolute bottom-4 right-4 h-6 w-6 text-white/15" />}
            </div>
          ))}
        </div>
      </Slide>

      {/* 11 · Quiénes somos */}
      <Slide index={10}>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SlideTitle n={11} kicker={p.about.kicker} title={p.about.title} />
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text/85">{p.about.text}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {p.about.facts.map((fact, i) => (
                <div key={fact.value} className="glass rounded-2xl p-4 text-center">
                  <p className={cn("font-display text-4xl font-black", ["text-gradient-orange", "text-celeste", "text-gradient-blue"][i])}>
                    {fact.value}
                  </p>
                  <p className="label mt-1 !text-[0.6rem] leading-snug">{fact.label}</p>
                </div>
              ))}
            </div>
          </div>
          <blockquote className="glass hud relative rounded-3xl p-10">
            <Quote className="h-10 w-10 text-mhb-orange" />
            <p className="mt-4 font-display text-6xl font-black uppercase leading-[0.9]">{p.about.quote}</p>
            <div className="mt-6 flex items-center gap-3">
              <span className="arg-stripe h-1.5 w-10 rounded-full" />
              <span className="label">DS CONNECT</span>
            </div>
          </blockquote>
        </div>
      </Slide>

      {/* 12 · Próximos pasos */}
      <Slide index={11}>
        <SlideTitle n={12} kicker={p.next.kicker} title={p.next.title} />
        <ol className="mt-10 grid gap-4 md:grid-cols-4">
          {p.next.steps.map((step, i) => (
            <li key={step} className="glass rounded-2xl p-5">
              <span className="font-display text-5xl font-black text-gradient-orange">0{i + 1}</span>
              <p className="mt-2 text-lg font-medium leading-snug">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <LinkButton href={routes.login} className="h-12 px-6 !text-xl">
            {p.next.ctaPlatform} <ArrowRight className="h-5 w-5" />
          </LinkButton>
          <LinkButton href={coachHref} variant="secondary" className="h-12 px-6 !text-xl">
            <ClipboardList className="h-5 w-5" /> {p.next.ctaCoach}
          </LinkButton>
          <LinkButton href={clubHref} variant="secondary" className="h-12 px-6 !text-xl">
            <Building2 className="h-5 w-5" /> {p.next.ctaClub}
          </LinkButton>
        </div>
        <footer className="mt-14 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo t={t} />
          <p className="label">{p.next.footer}</p>
        </footer>
      </Slide>
    </div>
  );
}

/* ------------------------------------------------------------------ piezas -- */

function Slide({ index, className, children }: { index: number; className?: string; children: ReactNode }) {
  return (
    <section
      data-slide
      data-index={index}
      className={cn(
        "relative flex min-h-svh snap-start items-center overflow-hidden px-5 pb-16 pt-24 md:px-12 lg:px-24",
        index % 2 === 1 && "bg-night/40",
        className,
      )}
    >
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="relative mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

function SlideTitle({ n, kicker, title }: { n: number; kicker: string; title: string }) {
  return (
    <div>
      <p className="label flex items-center gap-3 !text-mhb-orange-light">
        <span className="font-display text-xl font-black text-white/40">{String(n).padStart(2, "0")}</span>
        <span className="h-px w-8 bg-mhb-orange" />
        {kicker}
      </p>
      <h2 className="mt-3 max-w-4xl text-5xl font-black uppercase leading-[0.88] tracking-tight md:text-7xl">{title}</h2>
    </div>
  );
}

function BigNumber({ n }: { n: number }) {
  return (
    <span className="pointer-events-none absolute -right-2 -top-6 font-display text-[8rem] font-black leading-none text-white/[0.04]">
      0{n}
    </span>
  );
}

/** Ruta Buenos Aires → Montpellier. */
function RouteCard({ distance, label }: { distance: string; label: string }) {
  return (
    <div className="glass hud relative overflow-hidden rounded-3xl p-6">
      <svg viewBox="0 0 400 260" className="h-auto w-full" aria-hidden>
        <defs>
          <linearGradient id="route" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#74acdf" />
            <stop offset="1" stopColor="#e95323" />
          </linearGradient>
          <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="rgb(255 255 255 / 0.12)" />
          </pattern>
        </defs>
        <rect width="400" height="260" fill="url(#dots)" />
        <path d="M70 210 C 120 40, 260 10, 330 70" fill="none" stroke="url(#route)" strokeWidth="3" strokeDasharray="8 8">
          <animate attributeName="stroke-dashoffset" from="64" to="0" dur="2.5s" repeatCount="indefinite" />
        </path>
        <circle cx="70" cy="210" r="9" fill="#74acdf" />
        <circle cx="70" cy="210" r="18" fill="none" stroke="#74acdf" strokeOpacity="0.4" className="animate-pulse-glow" />
        <circle cx="330" cy="70" r="9" fill="#e95323" />
        <circle cx="330" cy="70" r="18" fill="none" stroke="#e95323" strokeOpacity="0.45" className="animate-pulse-glow" />
        <text x="70" y="244" textAnchor="middle" className="fill-celeste font-sans text-[13px] font-bold uppercase">Buenos Aires</text>
        <text x="330" y="40" textAnchor="middle" className="fill-mhb-orange-light font-sans text-[13px] font-bold uppercase">Montpellier</text>
      </svg>
      <p className="mt-2 font-display text-6xl font-black text-gradient-orange">{distance}</p>
      <p className="label mt-1">{label}</p>
    </div>
  );
}

/** Líneas de media cancha de handball (decorativas). */
function CourtLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 240" className={className} aria-hidden>
      <g fill="none" stroke="#fff" strokeWidth="2">
        <path d="M50 1 A120 120 0 0 0 170 121 L230 121 A120 120 0 0 0 350 1" />
        <path d="M-10 1 A180 180 0 0 0 170 181 L230 181 A180 180 0 0 0 410 1" strokeDasharray="10 8" />
        <rect x="170" y="1" width="60" height="6" fill="#fff" />
        <line x1="190" y1="141" x2="210" y2="141" />
      </g>
    </svg>
  );
}
