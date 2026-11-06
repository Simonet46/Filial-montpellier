import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { EditTrainingView } from "@/views/training-edit";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditTrainingView />
    </Suspense>
  );
}
