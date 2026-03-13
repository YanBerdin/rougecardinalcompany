import { Users, FileText, Calendar, Image as ImageIcon, Handshake } from "lucide-react";
import { fetchDashboardStats } from "@/lib/dal/dashboard";
import { isRoleAtLeast } from "@/lib/auth/role-helpers";
import type { AppRole } from "@/lib/auth/role-helpers";
import { StatsCard } from "./StatsCard";
import { ErrorBoundary } from "@/components/admin/ErrorBoundary";

interface DashboardStatsContainerProps {
  userRole: AppRole;
}

/**
 * Smart component that fetches and displays dashboard statistics
 *
 * Handles data fetching via DAL and error boundaries
 * Renders stat cards in responsive grid layout, filtered by user role
 */
export async function DashboardStatsContainer({ userRole }: DashboardStatsContainerProps) {
  const result = await fetchDashboardStats();

  if (!result.success) {
    return (
      <div className="text-destructive text-sm" role="alert">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  const stats = result.data;

  const allStats: Array<{
    title: string;
    value: number;
    icon: React.ReactNode;
    href: string;
    minRole: AppRole;
  }> = [
      { title: "Membres de l'équipe", value: stats.teamCount, icon: <Users className="h-4 w-4" aria-hidden="true" />, href: "/admin/team", minRole: "admin" },
      { title: "Spectacles", value: stats.showsCount, icon: <FileText className="h-4 w-4" aria-hidden="true" />, href: "/admin/spectacles", minRole: "editor" },
      { title: "Événements", value: stats.eventsCount, icon: <Calendar className="h-4 w-4" aria-hidden="true" />, href: "/admin/agenda", minRole: "editor" },
      { title: "Médias", value: stats.mediaCount, icon: <ImageIcon className="h-4 w-4" aria-hidden="true" />, href: "/admin/media", minRole: "editor" },
      { title: "Partenaires", value: stats.partnersCount, icon: <Handshake className="h-4 w-4" aria-hidden="true" />, href: "/admin/partners", minRole: "admin" },
    ];

  const visibleStats = allStats.filter(s => isRoleAtLeast(userRole, s.minRole));

  return (
    <ErrorBoundary>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 whitespace-nowrap">
        {visibleStats.map(stat => (
          <StatsCard
            key={stat.href}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            href={stat.href}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
}
