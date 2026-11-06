import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { VideoForm } from "@/components/video-form";
import { canEdit, requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { IS_DEMO } from "@/lib/env";
import { getI18n } from "@/lib/i18n";

export default async function NewVideoPage({ searchParams }: PageProps<"/videos/new">) {
  const user = await requireUser();
  if (!canEdit(user.role)) redirect("/videos");
  const { t } = await getI18n();
  const { player, session } = await searchParams;
  const [players, sessions] = await Promise.all([repo.listPlayers(), repo.listSessions()]);
  return (
    <>
      <PageHeader kicker={t.videos.title} title={t.videos.newTitle} />
      <VideoForm
        t={t}
        isDemo={IS_DEMO}
        defaultPlayer={typeof player === "string" ? player : undefined}
        defaultSession={typeof session === "string" ? session : undefined}
        players={players
          .sort((a, b) => a.last_name.localeCompare(b.last_name))
          .map((p) => ({ id: p.id, label: `${p.last_name}, ${p.first_name}` }))}
        sessions={sessions
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((s) => ({ id: s.id, label: s.title }))}
      />
    </>
  );
}
