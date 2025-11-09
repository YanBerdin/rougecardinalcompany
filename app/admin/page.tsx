// Auth / env UI is rendered in the admin layout to keep it unique across admin pages

import { createClient } from "@/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Calendar, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Récupérer quelques statistiques de base
  const [
    { count: teamCount },
    { count: showsCount },
    { count: eventsCount },
    { count: mediaCount },
  ] = await Promise.all([
    supabase.from("membres_equipe").select("*", { count: "exact", head: true }),
    supabase.from("spectacles").select("*", { count: "exact", head: true }),
    supabase.from("evenements").select("*", { count: "exact", head: true }),
    supabase.from("medias").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Gérez le contenu et la configuration de votre site
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 whitespace-nowrap">
        <StatsCard
          title="Membres de l'équipe"
          value={teamCount || 0}
          icon={<Users className="h-4 w-4" aria-hidden />}
          href="/admin/team"
        />
        <StatsCard
          title="Spectacles"
          value={showsCount || 0}
          icon={<FileText className="h-4 w-4" aria-hidden />}
          href="/admin/shows"
        />
        <StatsCard
          title="Événements"
          value={eventsCount || 0}
          icon={<Calendar className="h-4 w-4" aria-hidden />}
          href="/admin/events"
        />
        <StatsCard
          title="Médias"
          value={mediaCount || 0}
          icon={<ImageIcon className="h-4 w-4" aria-hidden />}
          href="/admin/media"
        />
      </div>

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
            <Link href="/admin/shows">
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

function StatsCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
