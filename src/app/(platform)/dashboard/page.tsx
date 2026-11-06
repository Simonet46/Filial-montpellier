import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { DashboardView } from "@/views/dashboard";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <DashboardView />
    </Suspense>
  );
}
