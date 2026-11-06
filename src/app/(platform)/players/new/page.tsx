import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { NewPlayerView } from "@/views/player-edit";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewPlayerView />
    </Suspense>
  );
}
