"use client";

import { InviteForm, RoleSelect } from "@/components/admin-bits";
import { PageHeader, PageLoading, Panel } from "@/components/ui";
import { repo } from "@/lib/data";
import { useData } from "@/lib/data/use-data";
import { IS_DEMO } from "@/lib/env";
import { useDocumentTitle, useI18n } from "@/lib/i18n";
import { isAdmin } from "@/lib/roles";
import { routes } from "@/lib/routes";
import { useUser } from "@/lib/session";
import { useGuard } from "@/lib/use-guard";
import { formatDate } from "@/lib/utils";

export function UsersView() {
  const user = useUser();
  const { t, locale } = useI18n();
  useDocumentTitle(t.users.title);
  const allowed = useGuard(isAdmin(user.role), routes.dashboard);
  const { data: profiles } = useData(() => repo.listProfiles());
  if (!allowed || !profiles) return <PageLoading />;
  const canInvite = !IS_DEMO;
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
