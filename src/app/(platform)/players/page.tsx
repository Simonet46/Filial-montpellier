import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { PlayersView } from "@/views/players";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <PlayersView />
    </Suspense>
  );
}
