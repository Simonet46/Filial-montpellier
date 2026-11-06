"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { MAX_COMPARE } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/es";

export function ComparePicker({
  options,
  selected,
  t,
}: {
  options: { id: string; name: string }[];
  selected: string[];
  t: Dictionary;
}) {
  const router = useRouter();
  const go = (ids: string[]) => router.push(ids.length ? `/compare?ids=${ids.join(",")}` : "/compare");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {selected.map((id) => {
        const o = options.find((x) => x.id === id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => go(selected.filter((s) => s !== id))}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-red-400/50"
            title={t.compare.remove}
          >
            {o?.name} <X className="h-3.5 w-3.5 text-muted" />
          </button>
        );
      })}
      {selected.length < MAX_COMPARE && (
        <select
          value=""
          onChange={(e) => e.target.value && go([...selected, e.target.value])}
          className="field !w-auto"
          aria-label={t.compare.add}
        >
          <option value="">+ {t.compare.add}</option>
          {options
            .filter((o) => !selected.includes(o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
        </select>
      )}
    </div>
  );
}
