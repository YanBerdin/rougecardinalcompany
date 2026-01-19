import { Users, FileText, Calendar, Image as ImageIcon, Handshake } from "lucide-react";
import { fetchDashboardStats } from "@/lib/dal/dashboard";
import { StatsCard } from "./StatsCard";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";

/**
 * Smart component that fetches and displays dashboard statistics
 *
 * Handles data fetching via DAL and error boundaries
 * Renders 4 stat cards in responsive grid layout
 */
export async function DashboardStatsContainer() {
  const result = await fetchDashboardStats();

  if (!result.success) {
    return (
      <div className="text-destructive text-sm">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  const stats = result.data;

  return (
    <ErrorBoundary>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 whitespace-nowrap">
        <StatsCard
          title="Membres de l'équipe"
          value={stats.teamCount}
          icon={<Users className="h-4 w-4" aria-hidden />}
          href="/admin/team"
        />
        <StatsCard
          title="Spectacles"
          value={stats.showsCount}
          icon={<FileText className="h-4 w-4" aria-hidden />}
          href="/admin/spectacles"
        />
        <StatsCard
          title="Événements"
          value={stats.eventsCount}
          icon={<Calendar className="h-4 w-4" aria-hidden />}
          href="/admin/evenements"
        />
        <StatsCard
          title="Médias"
          value={stats.mediaCount}
          icon={<ImageIcon className="h-4 w-4" aria-hidden />}
          href="/admin/media"
        />
        <StatsCard
          title="Partenaires"
          value={stats.partnersCount}
          icon={<Handshake className="h-4 w-4" aria-hidden />}
          href="/admin/partners"
        />
      </div>
    </ErrorBoundary>
  );
}
