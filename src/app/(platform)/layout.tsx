import { AppShell } from "@/components/shell";
import { requireUser } from "@/lib/auth";
import { IS_DEMO } from "@/lib/env";
import { getI18n } from "@/lib/i18n";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [user, { t, locale }] = await Promise.all([requireUser(), getI18n()]);
  return (
    <AppShell user={user} t={t} locale={locale} isDemo={IS_DEMO}>
      {children}
    </AppShell>
  );
}
