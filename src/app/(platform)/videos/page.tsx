import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { VideosView } from "@/views/videos";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <VideosView />
    </Suspense>
  );
}
