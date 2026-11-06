import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { TrainingView } from "@/views/training";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TrainingView />
    </Suspense>
  );
}
