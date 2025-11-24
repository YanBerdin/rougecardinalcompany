import AdminDashboardSkeleton from "@/components/skeletons/AdminDashboardSkeleton";

export default function AdminLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AdminDashboardSkeleton />
    </div>
  );
}
