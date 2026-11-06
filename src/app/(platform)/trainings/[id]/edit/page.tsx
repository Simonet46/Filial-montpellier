import { notFound, redirect } from "next/navigation";
import { SessionForm } from "@/components/session-form";
import { PageHeader } from "@/components/ui";
import { canEdit, requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { getI18n } from "@/lib/i18n";

export default async function EditTrainingPage({ params }: PageProps<"/trainings/[id]/edit">) {
  const { id } = await params;
  const user = await requireUser();
  if (!canEdit(user.role)) redirect(`/trainings/${id}`);
  const { t } = await getI18n();
  const [session, players] = await Promise.all([repo.getSession(id), repo.listPlayers()]);
  if (!session) notFound();
  return (
    <>
      <PageHeader kicker={t.trainings.editTitle} title={session.title} />
      <SessionForm t={t} session={session} players={players} />
    </>
  );
}
