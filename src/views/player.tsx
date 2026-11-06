"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, Lock, Pencil, Plus } from "lucide-react";
import { PassportChips, statusTone } from "@/components/player-card";
import {
  DeleteEvaluationButton,
  DeletePlayerButton,
  EvaluationForm,
  FavoriteButton,
  TrialRequest,
} from "@/components/player-actions";
import { Badge, DataRow, EmptyState, LinkButton, NotFoundState, PageLoading, Panel } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { Avatar, CourtMap, RadarChart, RatingBars, RatingHex } from "@/components/visuals";
import { loadPlayerDetail, repo, withPlayableUrls } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit, canRequestTrial } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { RATING_KEYS } from "@/lib/types";
import { countryName, formatDate, todayISO } from "@/lib/utils";

export function PlayerView() {
  const id = useSearchParams().get("id") ?? "";
  return <PlayerDetail key={id} id={id} />;
}

function PlayerDetail({ id }: { id: string }) {
  const user = useUser();
  const { t, locale } = useI18n();
  const editor = canEdit(user.role);
  const { data, ready } = useData(async () => {
    const detail = await loadPlayerDetail(id, user);
    if (!detail) return null;
    const [sessions, trials, contact, playable] = await Promise.all([
      repo.listSessions(),
      repo.listTrials(),
      editor ? repo.getContact(id) : Promise.resolve(null),
      withPlayableUrls(detail.videos),
    ]);
    return { ...detail, sessions, trials, contact, playable };
  }, [id, user.id]);
  useDocumentTitle(data ? `${data.summary.first_name} ${data.summary.last_name}` : t.nav.players);
  if (!ready) return <PageLoading />;
  if (!data) return <NotFoundState t={t} />;
  const { summary: p, evals, sessions, trials, contact, playable } = data;

  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const pastSessions = sessions.filter((s) => s.date <= todayISO()).sort((a, b) => b.date.localeCompare(a.date));
  const attended = pastSessions.filter((s) => s.attendee_ids.includes(p.id));
  const playerTrials = trials.filter((tr) => tr.player_id === p.id);
  const sortedEvals = [...evals].sort((a, b) => b.date.localeCompare(a.date));
  // Último y primer valor registrado de cada test (pueden venir de evaluaciones distintas).
  const testMetric = (key: "sprint_20m_s" | "vertical_jump_cm" | "throw_speed_kmh") => {
    const withValue = sortedEvals.filter((e) => e[key] != null);
    return { latest: withValue[0]?.[key] ?? null, first: withValue.at(-1)?.[key] ?? null, count: withValue.length };
  };
  const tests = [
    { label: t.evaluation.sprint, lowerIsBetter: true, ...testMetric("sprint_20m_s") },
    { label: t.evaluation.jump, lowerIsBetter: false, ...testMetric("vertical_jump_cm") },
    { label: t.evaluation.throw, lowerIsBetter: false, ...testMetric("throw_speed_kmh") },
  ];
  const hasTests = tests.some((x) => x.count > 0);
  const lastTestDate = sortedEvals.find((e) => e.sprint_20m_s || e.vertical_jump_cm || e.throw_speed_kmh)?.date;
  const f = t.players.fields;

  const delta = (a: number | null | undefined, b: number | null | undefined, lowerIsBetter = false) => {
    if (a == null || b == null || a === b) return null;
    const diff = Math.round((a - b) * 100) / 100;
    const good = lowerIsBetter ? diff < 0 : diff > 0;
    return (
      <span className={good ? "text-emerald-300" : "text-red-300"}>
        {diff > 0 ? "+" : ""}
        {diff}
      </span>
    );
  };
  return (
    <>
      {/* Encabezado */}
      <section className="glass hud relative mb-6 overflow-hidden rounded-3xl p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-mhb-blue/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-mhb-orange/15 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <Avatar first={p.first_name} last={p.last_name} url={p.photo_url} size="xl" />
          <div className="min-w-0 flex-1 animate-rise">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="orange">{t.positions[p.position]}</Badge>
              {p.secondary_position && <Badge tone="celeste">{t.positions[p.secondary_position]}</Badge>}
              <Badge tone={p.dominant_hand === "left" ? "sol" : "neutral"}>{t.hand[p.dominant_hand]}</Badge>
              <Badge tone={statusTone(p.status)}>{t.playerStatus[p.status]}</Badge>
            </div>
            <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.9] md:text-7xl">
              {p.first_name}
              <br />
              <span className="text-gradient-blue">{p.last_name}</span>
            </h1>
            <p className="mt-3 text-muted">
              {p.club}
              {p.city ? ` · ${p.city}` : ""} · {p.age} {t.common.years}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <RatingHex overall={p.overall} label={t.players.overall} size="lg" />
            <div className="w-40 md:w-48">
              <CourtMap primary={p.position} secondary={p.secondary_position} t={t} />
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          {canRequestTrial(user.role) && <TrialRequest playerId={p.id} t={t} />}
          <FavoriteButton playerId={p.id} initial={p.favorite} t={t} />
          <LinkButton href={routes.compare([p.id])} variant="secondary">
            {t.nav.compare}
          </LinkButton>
          {editor && (
            <>
              <LinkButton href={routes.editPlayer(p.id)} variant="secondary">
                <Pencil className="h-4 w-4" /> {t.common.edit}
              </LinkButton>
              <LinkButton href={routes.newVideo({ player: p.id })} variant="secondary">
                <Plus className="h-4 w-4" /> {t.videos.new}
              </LinkButton>
              <span className="ml-auto">
                <DeletePlayerButton playerId={p.id} t={t} />
              </span>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ficha */}
        <Panel title={t.players.profile} kicker={t.players.sections.identity}>
          <dl>
            <DataRow label={f.birthDate} value={formatDate(p.birth_date, locale, { day: "2-digit", month: "long", year: "numeric" })} />
            <DataRow label={f.nationality} value={countryName(p.nationality, locale)} />
            <DataRow label={f.passports} value={<PassportChips passports={p.passports} locale={locale} t={t} />} />
            <DataRow label={f.height} value={p.height_cm ?? "—"} />
            <DataRow label={f.weight} value={p.weight_kg ?? "—"} />
            <DataRow label={f.wingspan} value={p.wingspan_cm ?? "—"} />
            <DataRow label={f.hand} value={t.hand[p.dominant_hand]} />
            <DataRow label={f.club} value={p.club} />
            <DataRow
              label={f.nationalTeam}
              value={
                <span className={p.national_team === "national" ? "text-celeste" : ""}>
                  {p.national_team_detail || t.nationalTeam[p.national_team]}
                </span>
              }
            />
            <DataRow label={f.joinedAt} value={formatDate(p.joined_at, locale)} />
          </dl>
        </Panel>

        {/* Radar */}
        <Panel title={t.players.evaluation} kicker={t.evaluation.latest} className="lg:col-span-2">
          {p.ratings ? (
            <div className="grid items-center gap-6 md:grid-cols-2">
              <div className="flex justify-center">
                <RadarChart series={[{ label: p.last_name, color: "#e95323", values: p.ratings }]} t={t} />
              </div>
              <RatingBars ratings={p.ratings} t={t} />
            </div>
          ) : (
            <EmptyState>{t.players.noEvaluations}</EmptyState>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Tests físicos */}
        <Panel title={t.players.physicalTests} kicker={lastTestDate ? formatDate(lastTestDate, locale) : undefined}>
          {hasTests ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              {tests.map((m) => (
                <div key={m.label} className="rounded-xl border border-line bg-ink/40 p-3">
                  <p className="font-display text-3xl font-extrabold tabular-nums text-gradient-orange">{m.latest ?? "—"}</p>
                  <p className="label mt-1 !text-[0.55rem] leading-tight">{m.label}</p>
                  {m.count > 1 && <p className="mt-1 font-sans text-xs">{delta(m.latest, m.first, m.lowerIsBetter)}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>{t.players.noEvaluations}</EmptyState>
          )}
          {p.scouting_notes && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="label mb-2">{t.players.sections.scouting}</p>
              <p className="text-sm leading-relaxed text-text/90">{p.scouting_notes}</p>
            </div>
          )}
        </Panel>

        {/* Historial de evaluaciones */}
        <Panel title={t.players.evaluations} className="lg:col-span-2">
          {editor && (
            <div className="mb-4">
              <EvaluationForm playerId={p.id} sessions={pastSessions} defaults={p.ratings} t={t} />
            </div>
          )}
          {sortedEvals.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="label text-left">
                    <th className="py-2 pr-2 font-normal">{t.evaluation.date}</th>
                    {RATING_KEYS.map((k) => (
                      <th key={k} className="px-1 py-2 text-center font-normal" title={t.ratings[k]}>
                        {t.ratings[k].slice(0, 3)}
                      </th>
                    ))}
                    <th className="py-2 pl-2 font-normal">{t.evaluation.comment}</th>
                    {editor && <th />}
                  </tr>
                </thead>
                <tbody>
                  {sortedEvals.map((e) => (
                    <tr key={e.id} className="border-t border-line/60 align-top">
                      <td className="py-2 pr-2">
                        <p className="font-medium">{formatDate(e.date, locale)}</p>
                        <p className="text-xs text-muted">
                          {e.session_id ? sessionById.get(e.session_id)?.title : t.evaluation.noSession}
                          {e.author_name ? ` · ${t.evaluation.by} ${e.author_name}` : ""}
                        </p>
                      </td>
                      {RATING_KEYS.map((k) => (
                        <td key={k} className="px-1 py-2 text-center font-display text-lg font-bold tabular-nums">
                          {e[k]}
                        </td>
                      ))}
                      <td className="py-2 pl-2 text-muted">{e.comment}</td>
                      {editor && (
                        <td className="py-2">
                          <DeleteEvaluationButton id={e.id} t={t} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState>{t.players.noEvaluations}</EmptyState>
          )}
        </Panel>
      </div>

      {/* Videos */}
      <Panel title={t.players.videos} className="mt-6" kicker={`${playable.length} ${t.players.videosCount}`}>
        {playable.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {playable.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                t={t}
                locale={locale}
                sessionTitle={v.session_id ? sessionById.get(v.session_id)?.title : null}
                canDelete={editor}
              />
            ))}
          </div>
        ) : (
          <EmptyState>{t.players.noVideos}</EmptyState>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel
          title={t.players.attendance}
          kicker={`${t.players.attendedOf} ${attended.length}/${pastSessions.length}`}
        >
          <div className="flex flex-wrap gap-2">
            {pastSessions.map((s) => {
              const was = s.attendee_ids.includes(p.id);
              return (
                <Link
                  key={s.id}
                  href={routes.training(s.id)}
                  className={
                    was
                      ? "flex items-center gap-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm text-emerald-200"
                      : "rounded-lg border border-line px-3 py-1.5 text-sm text-muted line-through decoration-white/20"
                  }
                >
                  {was && <CalendarCheck className="h-3.5 w-3.5" />}
                  {s.title}
                </Link>
              );
            })}
          </div>
        </Panel>

        <Panel title={t.players.trialsHistory}>
          {playerTrials.length ? (
            <ul className="space-y-2">
              {playerTrials.map((tr) => (
                <li key={tr.id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3">
                  <div>
                    <p className="font-medium">
                      {t.trials.proposedDate}: {formatDate(tr.proposed_date, locale)}
                    </p>
                    <p className="text-xs text-muted">
                      {t.trials.requestedBy} {tr.requested_by_name} · {formatDate(tr.created_at, locale)}
                    </p>
                    {tr.notes && <p className="mt-1 text-sm text-text/80">{tr.notes}</p>}
                  </div>
                  <Badge tone={tr.status === "scheduled" ? "orange" : tr.status === "completed" ? "green" : tr.status === "declined" ? "neutral" : "sol"}>
                    {t.trials.status[tr.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>{t.players.noTrials}</EmptyState>
          )}
        </Panel>
      </div>

      {editor && contact && (contact.email || contact.phone || contact.guardian_name) && (
        <Panel
          title={t.players.sections.contact}
          className="mt-6"
          action={<Lock className="h-4 w-4 text-muted" aria-label={t.players.contactPrivate} />}
        >
          <dl className="grid gap-x-8 md:grid-cols-2">
            <DataRow label={f.email} value={contact.email ?? "—"} />
            <DataRow label={f.phone} value={contact.phone ?? "—"} />
            <DataRow label={f.guardianName} value={contact.guardian_name ?? "—"} />
            <DataRow label={f.guardianPhone} value={contact.guardian_phone ?? "—"} />
          </dl>
          <p className="mt-3 text-xs text-muted">{t.players.contactPrivate}</p>
        </Panel>
      )}
    </>
  );
}
