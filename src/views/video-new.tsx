"use client";

import { useSearchParams } from "next/navigation";
import { PageHeader, PageLoading } from "@/components/ui";
import { VideoForm } from "@/components/video-form";
import { repo } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { IS_DEMO } from "@/lib/env";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { useGuard } from "@/lib/use-guard";

export function NewVideoView() {
  const params = useSearchParams();
  const user = useUser();
  const { t } = useI18n();
  useDocumentTitle(t.videos.newTitle);
  const allowed = useGuard(canEdit(user.role), routes.videos);
  const { data } = useData(async () => {
    const [players, sessions] = await Promise.all([repo.listPlayers(), repo.listSessions()]);
    return {
      players: players
        .sort((a, b) => a.last_name.localeCompare(b.last_name))
        .map((p) => ({ id: p.id, label: `${p.last_name}, ${p.first_name}` })),
      sessions: sessions.sort((a, b) => b.date.localeCompare(a.date)).map((s) => ({ id: s.id, label: s.title })),
    };
  });
  if (!allowed || !data) return <PageLoading />;
  return (
    <>
      <PageHeader kicker={t.videos.title} title={t.videos.newTitle} />
      <VideoForm
        t={t}
        isDemo={IS_DEMO}
        defaultPlayer={params.get("player") ?? undefined}
        defaultSession={params.get("session") ?? undefined}
        players={data.players}
        sessions={data.sessions}
      />
    </>
  );
}
