import Link from "next/link";
import { CalendarRange, MapPin, Plus } from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { Badge, EmptyState, LinkButton, PageHeader, Panel, Stat } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { Avatar, RatingHex } from "@/components/visuals";
import { canEdit, requireUser } from "@/lib/auth";
import { POSITIONS } from "@/lib/constants";
import { getPlayerSummaries, repo, withPlayableUrls } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { formatDate, todayISO } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const [players, sessions, videos, trials] = await Promise.all([
    getPlayerSummaries(user),
    repo.listSessions(),
    repo.listVideos(),
    repo.listTrials(),
  ]);

  const today = todayISO();
  const active = players.filter((p) => p.status !== "inactive");
  const upcoming = sessions.filter((s) => s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = sessions.filter((s) => s.date < today).sort((a, b) => b.date.localeCompare(a.date));
  const next = upcoming[0];
  const last = past[0];
  const openTrials = trials.filter((tr) => tr.status === "requested" || tr.status === "scheduled");
  const topRated = [...active].filter((p) => p.overall !== null).sort((a, b) => b.overall! - a.overall!).slice(0, 5);
  const favorites = players.filter((p) => p.favorite).slice(0, 3);
  const latestVideos = await withPlayableUrls(
    [...videos].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3),
  );
  const byId = new Map(players.map((p) => [p.id, p]));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const editor = canEdit(user.role);

  return (
    <>
      <PageHeader
        kicker={t.roles[user.role]}
        title={
          <>
            {t.dashboard.hello}, <span className="text-gradient-orange">{user.name}</span>
          </>
        }
        subtitle={editor ? t.dashboard.subtitleCoach : t.dashboard.subtitleClub}
        actions={
          editor && (
            <>
              <LinkButton href="/players/new" variant="secondary">
                <Plus className="h-4 w-4" /> {t.players.new}
              </LinkButton>
              <LinkButton href="/videos/new">
                <Plus className="h-4 w-4" /> {t.videos.new}
              </LinkButton>
            </>
          )
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label={t.dashboard.kpiPlayers} value={active.length} accent="blue" />
        <Stat label={t.dashboard.kpiSessions} value={past.length} accent="celeste" />
        <Stat label={t.dashboard.kpiVideos} value={videos.length} accent="orange" />
        <Stat label={t.dashboard.kpiTrials} value={openTrials.length} accent="sol" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel hud kicker={next ? t.trainings.upcoming : t.dashboard.lastSession} title={t.dashboard.nextSession} className="lg:col-span-2">
          {next ? (
            <Link href={`/trainings/${next.id}`} className="group block">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-mhb-orange/40 bg-mhb-orange/10">
                  <span className="font-display text-4xl font-extrabold leading-none text-mhb-orange-light">
                    {formatDate(next.date, locale, { day: "2-digit" })}
                  </span>
                  <span className="label !text-mhb-orange-light">{formatDate(next.date, locale, { month: "short" })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-3xl font-bold uppercase italic group-hover:text-mhb-orange-light">{next.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-muted">
                    <MapPin className="h-4 w-4" /> {next.location}
                  </p>
                  <p className="mt-2 text-sm text-muted">{next.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {next.coaches.map((c) => (
                      <Badge key={c} tone="celeste">{c}</Badge>
                    ))}
                    <Badge tone="blue">
                      {next.attendee_ids.length} {t.trainings.players}
                    </Badge>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <EmptyState>{t.dashboard.noNextSession}</EmptyState>
          )}
          {last && (
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="label">{t.dashboard.lastSession}</span>
              <Link href={`/trainings/${last.id}`} className="flex items-center gap-2 text-muted hover:text-text">
                <CalendarRange className="h-4 w-4" /> {last.title} · {formatDate(last.date, locale)}
              </Link>
            </div>
          )}
        </Panel>

        <Panel title={t.dashboard.byPosition}>
          <div className="space-y-2">
            {POSITIONS.map((pos) => {
              const count = active.filter((p) => p.position === pos).length;
              const max = Math.max(1, ...POSITIONS.map((x) => active.filter((p) => p.position === x).length));
              return (
                <div key={pos} className="grid grid-cols-[3rem_1fr_1.5rem] items-center gap-3">
                  <span className="font-mono text-xs text-muted">{t.positionsShort[pos]}</span>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-mhb-blue to-celeste" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="text-right font-display font-bold tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            {[
              [t.dashboard.kpiLefties, active.filter((p) => p.dominant_hand === "left").length, "text-sol"],
              [t.dashboard.kpiEu, active.filter((p) => p.is_eu).length, "text-mhb-blue-light"],
              [t.dashboard.kpiNational, active.filter((p) => p.national_team === "national").length, "text-celeste"],
            ].map(([label, value, color]) => (
              <div key={label as string}>
                <p className={`font-display text-3xl font-extrabold ${color}`}>{value}</p>
                <p className="label !text-[0.55rem]">{label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title={t.dashboard.topRated} action={<Link href="/players" className="label hover:text-text">{t.common.seeAll} →</Link>}>
          <ol className="space-y-2">
            {topRated.map((p, i) => (
              <li key={p.id}>
                <Link href={`/players/${p.id}`} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5">
                  <span className="w-5 font-display text-xl font-extrabold italic text-muted">{i + 1}</span>
                  <Avatar first={p.first_name} last={p.last_name} url={p.photo_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-bold uppercase leading-tight">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="label !text-[0.6rem]">
                      {t.positions[p.position]} · {p.birth_date.slice(0, 4)}
                    </p>
                  </div>
                  <RatingHex overall={p.overall} label={t.players.overallShort} />
                </Link>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel
          title={t.dashboard.latestVideos}
          className="lg:col-span-2"
          action={<Link href="/videos" className="label hover:text-text">{t.common.seeAll} →</Link>}
        >
          <div className="grid gap-4 md:grid-cols-3">
            {latestVideos.map((v) => {
              const pl = v.player_id ? byId.get(v.player_id) : null;
              return (
                <VideoCard
                  key={v.id}
                  video={v}
                  t={t}
                  locale={locale}
                  playerName={pl ? `${pl.first_name} ${pl.last_name}` : null}
                  sessionTitle={v.session_id ? sessionById.get(v.session_id)?.title : null}
                />
              );
            })}
          </div>
        </Panel>
      </div>

      {(user.role === "club" || user.role === "admin") && (
        <Panel title={t.dashboard.yourFavorites} className="mt-6">
          {favorites.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {favorites.map((p) => (
                <PlayerCard key={p.id} player={p} t={t} locale={locale} />
              ))}
            </div>
          ) : (
            <EmptyState>{t.dashboard.noFavorites}</EmptyState>
          )}
        </Panel>
      )}

      {openTrials.length > 0 && (
        <Panel title={t.dashboard.recentTrials} className="mt-6" action={<Link href="/trials" className="label hover:text-text">{t.common.seeAll} →</Link>}>
          <div className="grid gap-3 md:grid-cols-2">
            {openTrials.map((tr) => {
              const pl = byId.get(tr.player_id);
              if (!pl) return null;
              return (
                <Link key={tr.id} href={`/players/${pl.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-mhb-orange/50">
                  <Avatar first={pl.first_name} last={pl.last_name} url={pl.photo_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-bold uppercase">{pl.first_name} {pl.last_name}</p>
                    <p className="label !text-[0.6rem]">
                      {t.trials.proposedDate}: {formatDate(tr.proposed_date, locale)}
                    </p>
                  </div>
                  <Badge tone={tr.status === "scheduled" ? "orange" : "sol"}>{t.trials.status[tr.status]}</Badge>
                </Link>
              );
            })}
          </div>
        </Panel>
      )}
    </>
  );
}
