import Link from "next/link";
import type { ReactNode } from "react";
import { ComparePicker } from "@/components/compare-picker";
import { PassportChips } from "@/components/player-card";
import { EmptyState, PageHeader, Panel } from "@/components/ui";
import { Avatar, CourtMap, RadarChart, RatingHex } from "@/components/visuals";
import { requireUser } from "@/lib/auth";
import { MAX_COMPARE } from "@/lib/constants";
import { getPlayerSummaries, repo } from "@/lib/data";
import { getI18n } from "@/lib/i18n";
import { RATING_KEYS, type PlayerSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLORS = ["#ff6a13", "#74acdf", "#5b85ff"];

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.compare.title };
}

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const user = await requireUser();
  const { t, locale } = await getI18n();
  const { ids } = await searchParams;
  const [players, evals] = await Promise.all([getPlayerSummaries(user), repo.listEvaluations()]);
  const wanted = (typeof ids === "string" ? ids.split(",") : []).slice(0, MAX_COMPARE);
  const selected = wanted
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is PlayerSummary => !!p);

  /** Último valor registrado de un test para un jugador. */
  const latestTest = (id: string, key: "sprint_20m_s" | "vertical_jump_cm" | "throw_speed_kmh") =>
    evals
      .filter((e) => e.player_id === id && e[key] != null)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.[key];

  /** Fila con resaltado del mejor valor. */
  const row = (label: string, values: (number | null | undefined)[], opts?: { lowerIsBetter?: boolean; unit?: string }) => {
    const nums = values.filter((v): v is number => typeof v === "number");
    const best = nums.length > 1 ? (opts?.lowerIsBetter ? Math.min(...nums) : Math.max(...nums)) : null;
    return (
      <tr key={label} className="border-t border-line/60">
        <th className="label py-2.5 pr-4 text-left font-normal">{label}</th>
        {values.map((v, i) => (
          <td
            key={i}
            className={cn(
              "py-2.5 text-center font-display text-xl font-bold tabular-nums",
              best !== null && v === best && "text-mhb-orange-light",
            )}
          >
            {v ?? "—"}
            {v != null && opts?.unit && <span className="ml-0.5 text-xs text-muted">{opts.unit}</span>}
          </td>
        ))}
      </tr>
    );
  };

  const textRow = (label: string, values: ReactNode[]) => (
    <tr key={label} className="border-t border-line/60">
      <th className="label py-2.5 pr-4 text-left font-normal">{label}</th>
      {values.map((v, i) => (
        <td key={i} className="py-2.5 text-center text-sm">{v}</td>
      ))}
    </tr>
  );

  const f = t.players.fields;

  return (
    <>
      <PageHeader kicker={t.nav.players} title={t.compare.title} subtitle={t.compare.subtitle} />
      <div className="mb-6">
        <ComparePicker
          options={players.map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}` }))}
          selected={selected.map((p) => p.id)}
          t={t}
        />
      </div>

      {selected.length === 0 ? (
        <EmptyState>
          {t.compare.pick}{" "}
          <Link href="/players" className="text-celeste hover:underline">{t.nav.players} →</Link>
        </EmptyState>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
          <Panel hud title={t.players.evaluation}>
            <div className="flex justify-center">
              <RadarChart
                t={t}
                series={selected.flatMap((p, i) =>
                  p.ratings ? [{ label: p.last_name, color: COLORS[i], values: p.ratings }] : [],
                )}
              />
            </div>
            <ul className="mt-4 space-y-1.5">
              {selected.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-6 rounded-full" style={{ background: COLORS[i] }} />
                  {p.first_name} {p.last_name}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr>
                  <th />
                  {selected.map((p, i) => (
                    <th key={p.id} className="px-2 pb-4 align-bottom">
                      <Link href={`/players/${p.id}`} className="group flex flex-col items-center gap-2">
                        <Avatar first={p.first_name} last={p.last_name} url={p.photo_url} />
                        <span className="font-display text-lg font-bold uppercase leading-tight group-hover:text-mhb-orange-light">
                          {p.first_name} <br /> {p.last_name}
                        </span>
                        <span className="h-1 w-10 rounded-full" style={{ background: COLORS[i] }} />
                        <RatingHex overall={p.overall} label={t.players.overallShort} />
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {textRow(f.position, selected.map((p) => (
                  <div key={p.id} className="mx-auto w-28">
                    <CourtMap primary={p.position} secondary={p.secondary_position} t={t} />
                    <p className="mt-1">{t.positions[p.position]}</p>
                  </div>
                )))}
                {textRow(f.hand, selected.map((p) => t.hand[p.dominant_hand]))}
                {row(t.players.age, selected.map((p) => p.age), { unit: t.common.years })}
                {row(f.height, selected.map((p) => p.height_cm), { unit: "cm" })}
                {row(f.weight, selected.map((p) => p.weight_kg), { unit: "kg" })}
                {row(f.wingspan, selected.map((p) => p.wingspan_cm), { unit: "cm" })}
                {textRow(f.passports, selected.map((p) => (
                  <div key={p.id} className="flex justify-center"><PassportChips passports={p.passports} locale={locale} t={t} /></div>
                )))}
                {textRow(f.club, selected.map((p) => p.club))}
                {textRow(f.nationalTeam, selected.map((p) => p.national_team_detail || t.nationalTeam[p.national_team]))}
                {RATING_KEYS.map((k) => row(t.ratings[k], selected.map((p) => p.ratings?.[k])))}
                {row(t.evaluation.sprint, selected.map((p) => latestTest(p.id, "sprint_20m_s")), { lowerIsBetter: true })}
                {row(t.evaluation.jump, selected.map((p) => latestTest(p.id, "vertical_jump_cm")))}
                {row(t.evaluation.throw, selected.map((p) => latestTest(p.id, "throw_speed_kmh")))}
                {row(t.players.videos, selected.map((p) => p.video_count))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}
    </>
  );
}
