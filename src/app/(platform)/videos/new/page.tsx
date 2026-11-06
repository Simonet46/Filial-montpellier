import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { NewVideoView } from "@/views/video-new";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewVideoView />
    </Suspense>
  );
}
