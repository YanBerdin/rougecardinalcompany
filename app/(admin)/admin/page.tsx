// Auth / env UI is rendered in the admin layout to keep it unique across admin pages

import { Suspense } from "react";
import { DashboardStatsContainer } from "@/components/admin/dashboard/DashboardStatsContainer";
import { StatsCardsSkeleton } from "@/components/skeletons/StatsCardsSkeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accédez rapidement aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button variant="outline-primary" className="h-auto py-4" asChild>
            <Link href="/admin/team">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" aria-hidden />
                <span>Gérer l&apos;équipe</span>
              </div>
            </Link>
          </Button>
          <Button variant="outline-primary" className="h-auto py-4" asChild>
            <Link href="/admin/spectacles">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" aria-hidden />
                <span>Gérer les spectacles</span>
              </div>
            </Link>
          </Button>
          <Button variant="outline-primary" className="h-auto py-4" asChild>
            <Link href="/admin/events">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" aria-hidden />
                <span>Gérer les événements</span>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
