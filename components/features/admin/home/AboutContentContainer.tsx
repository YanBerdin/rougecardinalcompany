import { Suspense } from "react";
import { fetchActiveAboutContent } from "@/lib/dal/admin-home-about";
import { AboutContentForm } from "./AboutContentForm";
import { AboutContentSkeleton } from "@/components/skeletons/AboutContentSkeleton";

async function AboutContentData() {
  const content = await fetchActiveAboutContent();

  if (!content) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No about content found. Please create one.
      </div>
    );
  }

  return <AboutContentForm content={content} />;
}

export function AboutContentContainer() {
  return (
    <Suspense fallback={<AboutContentSkeleton />}>
      <AboutContentData />
    </Suspense>
  );
}
