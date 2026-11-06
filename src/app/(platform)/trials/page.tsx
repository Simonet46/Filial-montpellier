import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { TrialsView } from "@/views/trials";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TrialsView />
    </Suspense>
  );
}
