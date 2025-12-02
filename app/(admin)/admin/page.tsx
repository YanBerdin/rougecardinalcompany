// Auth / env UI is rendered in the admin layout to keep it unique across admin pages

import { Suspense } from "react";
import { DashboardStatsContainer } from "@/components/admin/dashboard/DashboardStatsContainer";
import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";
import CardsDashboard from "@/components/admin/CardsDashboard";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Gérez le contenu et la configuration de votre site
        </p>
      </div>

      {/* Stats cards: suspend only the stats container so header and actions render immediately */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <DashboardStatsContainer />
      </Suspense>

      <CardsDashboard />
    </div>
  );
}
