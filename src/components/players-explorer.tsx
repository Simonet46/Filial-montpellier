"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GitCompareArrows, Search, X } from "lucide-react";
import { HANDS, MAX_COMPARE, PLAYER_STATUSES, POSITIONS } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/es";
import type { Hand, Locale, PlayerStatus, PlayerSummary, Position } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlayerCard } from "./player-card";
import { Button, EmptyState } from "./ui";

type Sort = "overall" | "height" | "age" | "name";

export function PlayersExplorer({
  players,
  t,
  locale,
}: {
  players: PlayerSummary[];
  t: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [hand, setHand] = useState<Hand | "">("");
  const [status, setStatus] = useState<PlayerStatus | "">("");
  const [generation, setGeneration] = useState("");
  const [minHeight, setMinHeight] = useState("");
  const [onlyEu, setOnlyEu] = useState(false);
  const [onlyNational, setOnlyNational] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);
  const [sort, setSort] = useState<Sort>("overall");
  const [selected, setSelected] = useState<string[]>([]);

  const generations = useMemo(
    () => Array.from(new Set(players.map((p) => p.birth_date.slice(0, 4)))).sort(),
    [players],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const list = players.filter((p) => {
      if (needle) {
        const hay = `${p.first_name} ${p.last_name} ${p.club} ${p.city ?? ""}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "");
        if (!hay.includes(needle)) return false;
      }
      if (positions.length && !positions.includes(p.position) && !(p.secondary_position && positions.includes(p.secondary_position)))
        return false;
      if (hand && p.dominant_hand !== hand) return false;
      if (status && p.status !== status) return false;
      if (generation && !p.birth_date.startsWith(generation)) return false;
      if (minHeight && (p.height_cm ?? 0) < Number(minHeight)) return false;
      if (onlyEu && !p.is_eu) return false;
      if (onlyNational && p.national_team === "none") return false;
      if (onlyFav && !p.favorite) return false;
      return true;
    });
    return list.sort((a, b) => {
      switch (sort) {
        case "overall":
          return (b.overall ?? -1) - (a.overall ?? -1);
        case "height":
          return (b.height_cm ?? 0) - (a.height_cm ?? 0);
        case "age":
          return a.birth_date.localeCompare(b.birth_date) * -1;
        default:
          return a.last_name.localeCompare(b.last_name);
      }
    });
  }, [players, q, positions, hand, status, generation, minHeight, onlyEu, onlyNational, onlyFav, sort]);

  const togglePosition = (pos: Position) =>
    setPositions((cur) => (cur.includes(pos) ? cur.filter((p) => p !== pos) : [...cur, pos]));

  const toggleSelect = (id: string) =>
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_COMPARE ? cur : [...cur, id],
    );

  const reset = () => {
    setQ("");
    setPositions([]);
    setHand("");
    setStatus("");
    setGeneration("");
    setMinHeight("");
    setOnlyEu(false);
    setOnlyNational(false);
    setOnlyFav(false);
  };

  const toggles: [boolean, (v: boolean) => void, string][] = [
    [onlyEu, setOnlyEu, t.players.onlyEu],
    [onlyNational, setOnlyNational, t.players.onlyNational],
    [onlyFav, setOnlyFav, t.players.onlyFavorites],
  ];

  return (
    <div className="space-y-6">
      <div className="glass hud space-y-4 rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.players.searchPlaceholder}
              className="field pl-9"
              aria-label={t.common.search}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex">
            <select value={hand} onChange={(e) => setHand(e.target.value as Hand | "")} className="field lg:w-44" aria-label={t.players.fields.hand}>
              <option value="">{t.players.fields.hand}</option>
              {HANDS.map((h) => (
                <option key={h} value={h}>{t.hand[h]}</option>
              ))}
            </select>
            <select value={generation} onChange={(e) => setGeneration(e.target.value)} className="field lg:w-36" aria-label={t.players.generation}>
              <option value="">{t.players.generation}</option>
              {generations.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value as PlayerStatus | "")} className="field lg:w-52" aria-label={t.players.fields.status}>
              <option value="">{t.players.fields.status}</option>
              {PLAYER_STATUSES.map((s) => (
                <option key={s} value={s}>{t.playerStatus[s]}</option>
              ))}
            </select>
            <input
              type="number"
              inputMode="numeric"
              min={150}
              max={220}
              value={minHeight}
              onChange={(e) => setMinHeight(e.target.value)}
              placeholder={t.players.minHeight}
              className="field lg:w-52"
              aria-label={t.players.minHeight}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => togglePosition(pos)}
              title={t.positions[pos]}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition",
                positions.includes(pos)
                  ? "border-mhb-orange bg-mhb-orange/20 text-mhb-orange-light"
                  : "border-line text-muted hover:border-mhb-blue-light/50 hover:text-text",
              )}
            >
              {t.positionsShort[pos]}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
          {toggles.map(([on, set, label]) => (
            <button
              key={label}
              type="button"
              onClick={() => set(!on)}
              className={cn(
                "rounded-md border px-2.5 py-1 font-mono text-xs uppercase tracking-wider transition",
                on ? "border-celeste bg-celeste/15 text-celeste" : "border-line text-muted hover:text-text",
              )}
            >
              {label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="label">{t.players.sortBy}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field !w-auto !py-1.5 text-sm">
              <option value="overall">{t.players.sortOverall}</option>
              <option value="height">{t.players.sortHeight}</option>
              <option value="age">{t.players.sortAge}</option>
              <option value="name">{t.players.sortName}</option>
            </select>
            <button type="button" onClick={reset} className="label flex items-center gap-1 hover:text-text">
              <X className="h-3 w-3" />
              {t.common.clear}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="label">
          <span className="text-text">{filtered.length}</span> {t.common.results}
        </p>
        <p className="label hidden sm:block">{t.players.selectToCompare}</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState>{t.players.noResults}</EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p, i) => (
            <div key={p.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
              <PlayerCard
                player={p}
                t={t}
                locale={locale}
                selectable
                selected={selected.includes(p.id)}
                onSelect={() => toggleSelect(p.id)}
              />
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="glass hud flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl">
            <span className="label">
              <span className="text-text">{selected.length}</span>/{MAX_COMPARE}
            </span>
            <Button onClick={() => router.push(`/compare?ids=${selected.join(",")}`)}>
              <GitCompareArrows className="h-4 w-4" />
              {t.players.compareSelected}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelected([])} aria-label={t.common.clear}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
