import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { EditPlayerView } from "@/views/player-edit";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <EditPlayerView />
    </Suspense>
  );
}
