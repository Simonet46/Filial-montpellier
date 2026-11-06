import Link from "next/link";
import { TrialStatusMenu } from "@/components/admin-bits";
import { Badge, PageHeader } from "@/components/ui";
import { Avatar, RatingHex } from "@/components/visuals";
import { requireUser } from "@/lib/auth";
import { TRIAL_STATUSES } from "@/lib/constants";
import { getPlayerSummaries, repo } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { cn, formatDate } from "@/lib/utils";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.trials.title };
}

const columnAccent = {
  requested: "border-t-sol",
  scheduled: "border-t-mhb-orange",
  completed: "border-t-emerald-400",
  declined: "border-t-white/20",
} as const;

export default async function TrialsPage() {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const [trials, players] = await Promise.all([repo.listTrials(), getPlayerSummaries(user)]);
  const byId = new Map(players.map((p) => [p.id, p]));

  return (
    <>
      <PageHeader kicker="Argentina → Montpellier" title={t.trials.title} subtitle={t.trials.subtitle} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {TRIAL_STATUSES.map((status) => {
          const items = trials.filter((tr) => tr.status === status);
          return (
            <section key={status} className={cn("glass rounded-2xl border-t-2 p-4", columnAccent[status])}>
              <header className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold uppercase">{t.trials.status[status]}</h2>
                <Badge>{items.length}</Badge>
              </header>
              <div className="space-y-3">
                {items.length === 0 && <p className="py-6 text-center text-sm text-muted">{t.trials.empty}</p>}
                {items.map((tr) => {
                  const p = byId.get(tr.player_id);
                  if (!p) return null;
                  return (
                    <article key={tr.id} className="rounded-xl border border-line bg-ink/50 p-3">
                      <Link href={`/players/${p.id}`} className="flex items-center gap-3">
                        <Avatar first={p.first_name} last={p.last_name} url={p.photo_url} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg font-bold uppercase leading-tight hover:text-mhb-orange-light">
                            {p.first_name} {p.last_name}
                          </p>
                          <p className="label !text-[0.6rem]">{t.positions[p.position]} · {p.birth_date.slice(0, 4)}</p>
                        </div>
                        <RatingHex overall={p.overall} label={t.players.overallShort} />
                      </Link>
                      <dl className="mt-3 space-y-1 text-xs">
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted">{t.trials.proposedDate}</dt>
                          <dd className="font-medium">{formatDate(tr.proposed_date, locale)}</dd>
                        </div>
                        <div className="flex justify-between gap-2">
                          <dt className="text-muted">{t.trials.requestedBy}</dt>
                          <dd>{tr.requested_by_name}</dd>
                        </div>
                      </dl>
                      {tr.notes && <p className="mt-2 text-sm text-text/80">{tr.notes}</p>}
                      <div className="mt-3 border-t border-line pt-2">
                        <TrialStatusMenu id={tr.id} status={tr.status} t={t} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
