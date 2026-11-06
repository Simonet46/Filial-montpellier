import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { CompareView } from "@/views/compare";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <CompareView />
    </Suspense>
  );
}
