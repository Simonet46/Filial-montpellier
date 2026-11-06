import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { PlayerView } from "@/views/player";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PlayerView />
    </Suspense>
  );
}
