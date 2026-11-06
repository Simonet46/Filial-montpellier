import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { LoginView } from "@/views/login";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LoginView />
    </Suspense>
  );
}
