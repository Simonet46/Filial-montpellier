"use client";

import { useSearchParams } from "next/navigation";
import { SessionForm } from "@/components/session-form";
import { NotFoundState, PageHeader, PageLoading } from "@/components/ui";
import { repo } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { canEdit } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { useGuard } from "@/lib/use-guard";

export function NewTrainingView() {
  const user = useUser();
  const { t } = useI18n();
  useDocumentTitle(t.trainings.newTitle);
  const allowed = useGuard(canEdit(user.role), routes.trainings);
  const { data: players } = useData(async () => (await repo.listPlayers()).filter((p) => p.status !== "inactive"));
  if (!allowed || !players) return <PageLoading />;
  return (
    <>
      <PageHeader kicker={t.trainings.title} title={t.trainings.newTitle} />
      <SessionForm t={t} players={players} />
    </>
  );
}

export function EditTrainingView() {
  const id = useSearchParams().get("id") ?? "";
  return <EditTraining key={id} id={id} />;
}

function EditTraining({ id }: { id: string }) {
  const user = useUser();
  const { t } = useI18n();
  useDocumentTitle(t.trainings.editTitle);
  const allowed = useGuard(canEdit(user.role), routes.training(id));
  const { data, ready } = useData(async () => {
    const [session, players] = await Promise.all([repo.getSession(id), repo.listPlayers()]);
    return session ? { session, players } : null;
  }, [id]);
  if (!allowed || !ready) return <PageLoading />;
  if (!data) return <NotFoundState t={t} />;
  return (
    <>
      <PageHeader kicker={t.trainings.editTitle} title={data.session.title} />
      <SessionForm t={t} session={data.session} players={data.players} />
    </>
  );
}
