import Link from "next/link";
import { Clapperboard, MapPin, Plus, Users } from "lucide-react";
import { Badge, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { canEdit, requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { cn, formatDate, todayISO } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.trainings.title };
}

export default async function TrainingsPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const [sessions, videos] = await Promise.all([repo.listSessions(), repo.listVideos()]);
  const today = todayISO();
  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader
        kicker={t.brand.filial}
        title={t.trainings.title}
        subtitle={t.trainings.subtitle}
        actions={
          canEdit(user.role) && (
            <LinkButton href="/trainings/new">
              <Plus className="h-4 w-4" /> {t.trainings.new}
            </LinkButton>
          )
        }
      />
      {sorted.length === 0 ? (
        <EmptyState>{t.common.empty}</EmptyState>
      ) : (
        <ol className="relative space-y-4 border-l border-line pl-6 md:pl-10">
          {sorted.map((s, i) => {
            const upcoming = s.date >= today;
            const videoCount = videos.filter((v) => v.session_id === s.id).length;
            return (
              <li key={s.id} className="relative animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                <span
                  className={cn(
                    "absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 md:-left-[47px]",
                    upcoming
                      ? "border-mhb-orange bg-mhb-orange shadow-[0_0_14px_var(--color-mhb-orange)]"
                      : "border-celeste bg-ink",
                  )}
                />
                <Link
                  href={`/trainings/${s.id}`}
                  className={cn(
                    "glass group flex flex-col gap-4 rounded-2xl p-5 transition hover:border-mhb-blue-light/50 md:flex-row md:items-center",
                    upcoming && "hud border-mhb-orange/40",
                  )}
                >
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-ink/60">
                    <span className="font-display text-3xl font-extrabold leading-none">{formatDate(s.date, locale, { day: "2-digit" })}</span>
                    <span className="label">{formatDate(s.date, locale, { month: "short", year: "2-digit" })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-2xl font-bold uppercase italic group-hover:text-mhb-orange-light">{s.title}</h2>
                      <Badge tone={upcoming ? "orange" : "neutral"}>{upcoming ? t.trainings.upcoming : t.trainings.past}</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                      <MapPin className="h-3.5 w-3.5" /> {s.location}
                    </p>
                    {s.description && <p className="mt-2 line-clamp-2 text-sm text-text/80">{s.description}</p>}
                  </div>
                  <div className="flex gap-4 md:flex-col md:items-end md:gap-1">
                    <span className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted">
                      <Users className="h-3.5 w-3.5" /> {s.attendee_ids.length} {t.trainings.players}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-xs uppercase text-muted">
                      <Clapperboard className="h-3.5 w-3.5" /> {videoCount} {t.players.videosCount}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
