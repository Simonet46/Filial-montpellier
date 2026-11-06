import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { NewTrainingView } from "@/views/training-edit";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewTrainingView />
    </Suspense>
  );
}
