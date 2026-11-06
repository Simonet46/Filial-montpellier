import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { TrainingsView } from "@/views/trainings";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TrainingsView />
    </Suspense>
  );
}
