import { Suspense } from "react";
import { PageLoading } from "@/components/ui";
import { UsersView } from "@/views/users";

export default function Page() {
  return (
    <Suspense fallback={<PageLoading />}>
      <UsersView />
    </Suspense>
  );
}
