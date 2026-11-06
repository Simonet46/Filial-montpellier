import { redirect } from "next/navigation";
import { InviteForm, RoleSelect } from "@/components/admin-bits";
import { PageHeader, Panel } from "@/components/ui";
import { isAdmin, requireUser } from "@/lib/auth";
import { repo } from "@/lib/data";
import { IS_DEMO } from "@/lib/env";
import { getI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

export default async function UsersPage() {
  const user = await requireUser();
  if (!isAdmin(user.role)) redirect("/dashboard");
  const { t, locale } = await getI18n();
  const profiles = await repo.listProfiles();
  const canInvite = !IS_DEMO && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  return (
    <>
      <PageHeader kicker="Admin" title={t.users.title} subtitle={t.users.subtitle} />
      <Panel className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="label text-left">
              <th className="pb-3 font-normal">{t.users.name}</th>
              <th className="pb-3 font-normal">{t.users.email}</th>
              <th className="pb-3 font-normal">{t.users.organization}</th>
              <th className="pb-3 font-normal">{t.users.since}</th>
              <th className="pb-3 font-normal">{t.users.role}</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t border-line/60">
                <td className="py-3 font-display text-base font-bold uppercase">{p.full_name || "—"}</td>
                <td className="py-3 text-muted">{p.email}</td>
                <td className="py-3">{p.organization ?? "—"}</td>
                <td className="py-3 text-muted">{formatDate(p.created_at, locale)}</td>
                <td className="py-3">
                  <RoleSelect id={p.id} role={p.role} t={t} disabled={p.id === user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title={t.users.invite} className="mt-6">
        <InviteForm t={t} enabled={canInvite} />
      </Panel>
    </>
  );
}
