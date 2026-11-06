import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { AuthConfirmView } from "@/views/auth";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuthConfirmView />
    </Suspense>
  );
}
