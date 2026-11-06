import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { AuthCallbackView } from "@/views/auth";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AuthCallbackView />
    </Suspense>
  );
}
