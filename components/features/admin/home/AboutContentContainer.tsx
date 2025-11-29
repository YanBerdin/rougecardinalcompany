import { Suspense } from "react";
import { fetchActiveAboutContent } from "@/lib/dal/admin-home-about";
import { AboutContentForm } from "./AboutContentForm";
import { AboutContentSkeleton } from "@/components/skeletons/AboutContentSkeleton";

async function AboutContentData() {
  const result = await fetchActiveAboutContent();

  if (!result.success) {
    return (
      <div className="text-center text-destructive py-8">
        Error: {result.error}
      </div>
    );
  }

  if (!result.data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No about content found. Please create one.
      </div>
    );
  }

  return <AboutContentForm content={result.data} />;
}

export function AboutContentContainer() {
  return (
    <Suspense fallback={<AboutContentSkeleton />}>
      <AboutContentData />
    </Suspense>
  );
}
