"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Pencil, Plus } from "lucide-react";
import { DeleteSessionButton } from "@/components/session-form";
import { Badge, EmptyState, LinkButton, NotFoundState, PageHeader, PageLoading, Panel } from "@/components/ui";
import { VideoCard } from "@/components/video-card";
import { Avatar } from "@/components/visuals";
import { loadPlayerSummaries, repo, withPlayableUrls } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { formatDate, todayISO } from "@/lib/utils";

export function TrainingView() {
  const id = useSearchParams().get("id") ?? "";
  return <TrainingDetail key={id} id={id} />;
}

function TrainingDetail({ id }: { id: string }) {
  const user = useUser();
  const { t, locale } = useI18n();
  const { data, ready } = useData(async () => {
    const session = await repo.getSession(id);
    if (!session) return null;
    const [players, videos] = await Promise.all([
      loadPlayerSummaries(user),
      repo.listVideos({ sessionId: id }).then(withPlayableUrls),
    ]);
    return { session, players, videos };
  }, [id, user.id]);
  useDocumentTitle(data?.session.title ?? t.trainings.title);
  if (!ready) return <PageLoading />;
  if (!data) return <NotFoundState t={t} />;
  const { session, players, videos } = data;
  const attendees = players.filter((p) => session.attendee_ids.includes(p.id));
  const byId = new Map(players.map((p) => [p.id, p]));
  const editor = canEdit(user.role);
  const upcoming = session.date >= todayISO();
  return (
    <>
      <PageHeader
        kicker={formatDate(session.date, locale, { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        title={session.title}
        subtitle={
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> {session.location}
          </span>
        }
        actions={
          editor && (
            <>
              <LinkButton href={routes.newVideo({ session: session.id })}>
                <Plus className="h-4 w-4" /> {t.videos.new}
              </LinkButton>
              <LinkButton href={routes.editTraining(session.id)} variant="secondary">
                <Pencil className="h-4 w-4" /> {t.common.edit}
              </LinkButton>
              <DeleteSessionButton id={session.id} t={t} />
            </>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel hud title={t.trainings.coaches} kicker={upcoming ? t.trainings.upcoming : t.trainings.past}>
          <div className="flex flex-wrap gap-2">
            {session.coaches.map((c) => (
              <Badge key={c} tone="celeste">{c}</Badge>
            ))}
          </div>
          {session.description && (
            <div className="mt-5 border-t border-line pt-4">
              <p className="label mb-2">{t.trainings.fields.description}</p>
              <p className="text-sm leading-relaxed text-text/90">{session.description}</p>
            </div>
          )}
        </Panel>

        <Panel title={t.trainings.attendees} kicker={`${attendees.length} ${t.trainings.players}`} className="lg:col-span-2">
          {attendees.length ? (
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {attendees.map((p) => (
                <Link key={p.id} href={routes.player(p.id)} className="flex items-center gap-3 rounded-xl border border-line p-2 transition hover:border-mhb-blue-light/50 hover:bg-white/5">
                  <Avatar first={p.first_name} last={p.last_name} url={p.photo_url} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold uppercase">{p.first_name} {p.last_name}</p>
                    <p className="label !text-[0.6rem]">{t.positions[p.position]}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState>{t.common.empty}</EmptyState>
          )}
        </Panel>
      </div>

      <Panel title={t.trainings.videos} className="mt-6">
        {videos.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => {
              const pl = v.player_id ? byId.get(v.player_id) : null;
              return (
                <VideoCard
                  key={v.id}
                  video={v}
                  t={t}
                  locale={locale}
                  playerName={pl ? `${pl.first_name} ${pl.last_name}` : null}
                  canDelete={editor}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState>{t.trainings.noVideos}</EmptyState>
        )}
      </Panel>
    </>
  );
}
