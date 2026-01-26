import { Skeleton } from "@/components/ui/skeleton";

export default function LieuxLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
