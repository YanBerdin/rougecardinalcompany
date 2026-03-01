import { Suspense } from "react";
import { Metadata } from "next";
import { UsersManagementContainer } from "@/components/features/admin/users/UsersManagementContainer";
import { UsersManagementSkeleton } from "@/components/skeletons/UsersManagementSkeleton";

export const metadata: Metadata = {
  title: "Gestion des utilisateurs",
  description: "Administration des utilisateurs et des invitations",
};

// ✅ OBLIGATOIRE : Force le re-fetch à chaque visite (CRUD pattern)
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-2 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Utilisateurs (Admin)</h2>
      </div>
      <Suspense fallback={<UsersManagementSkeleton />}>
        <UsersManagementContainer />
      </Suspense>
    </div>
  );
}
