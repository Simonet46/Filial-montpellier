import { redirect } from "next/navigation";
import { SessionForm } from "@/components/session-form";
import { PageHeader } from "@/components/ui";
import { canEdit, requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export default async function NewTrainingPage() {
  const user = await requireUser();
  if (!canEdit(user.role)) redirect("/trainings");
  const { t } = await getI18n();
  const players = (await repo.listPlayers()).filter((p) => p.status !== "inactive");
  return (
    <>
      <PageHeader kicker={t.trainings.title} title={t.trainings.newTitle} />
      <SessionForm t={t} players={players} />
    </>
  );
}
