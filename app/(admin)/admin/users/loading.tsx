import { UsersManagementSkeleton } from "@/components/skeletons/UsersManagementSkeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight"> Utilisateurs (Admin)</h2>
      </div>
      <UsersManagementSkeleton />
    </div>
  );
}
