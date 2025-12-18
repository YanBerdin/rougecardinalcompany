import { Suspense } from "react";
import { Metadata } from "next";
import { UsersManagementContainer } from "@/components/features/admin/users/UsersManagementContainer";
import { UsersManagementSkeleton } from "@/components/skeletons/UsersManagementSkeleton";

export const metadata: Metadata = {
  title: "Gestion des utilisateurs",
  description: "Administration des utilisateurs et des invitations",
};

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-2 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Utilisateurs</h2>
      </div>
      <Suspense fallback={<UsersManagementSkeleton />}>
        <UsersManagementContainer />
      </Suspense>
    </div>
  );
}
