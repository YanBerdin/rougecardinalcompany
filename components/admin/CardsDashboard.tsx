import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, Image as ImageIcon, Settings, Newspaper } from "lucide-react";
import { isRoleAtLeast } from "@/lib/auth/role-helpers";
import type { AppRole } from "@/lib/auth/role-helpers";

interface CardItem {
    title: string;
    description?: string;
    href: string;
    icon?: React.ReactNode;
    minRole: AppRole;
}

const items: CardItem[] = [
    { title: "Gérer l'équipe", description: "Membres, rôles et profils", href: "/admin/team", icon: <Users className="h-5 w-5" />, minRole: "admin" },
    { title: "Spectacles", description: "Créer et modifier les spectacles", href: "/admin/spectacles", icon: <FileText className="h-5 w-5" />, minRole: "editor" },
    { title: "Événements", description: "Calendrier et billetterie", href: "/admin/events", icon: <Calendar className="h-5 w-5" />, minRole: "editor" },
    { title: "Presse", description: "Communiqués, articles et contacts", href: "/admin/presse", icon: <Newspaper className="h-5 w-5" />, minRole: "editor" },
    { title: "Médias", description: "Gérer images et vidéos", href: "/admin/media", icon: <ImageIcon className="h-5 w-5" />, minRole: "editor" },
    { title: "Utilisateurs", description: "Comptes et permissions", href: "/admin/users", icon: <Users className="h-5 w-5" />, minRole: "admin" },
    { title: "Réglages", description: "Configuration du site", href: "/admin/settings", icon: <Settings className="h-5 w-5" />, minRole: "admin" },
];

interface CardsDashboardProps {
    userRole: AppRole;
}

export default function CardsDashboard({ userRole }: CardsDashboardProps) {
    const visibleItems = items.filter(item => isRoleAtLeast(userRole, item.minRole));

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((it) => (
                <Card key={it.href} className="hover:shadow-md hover:bg-card/20 transition-colors">
                    <CardHeader className="flex items-start justify-between gap-4 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">{it.title}</CardTitle>
                            {it.description && (
                                <CardDescription className="text-muted-foreground">{it.description}</CardDescription>
                            )}
                        </div>
                        <div className="text-muted-foreground" aria-hidden="true">{it.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end">
                            <Button asChild variant="default">
                                <Link href={it.href} aria-label={`Accéder à ${it.title}`}>Accéder</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
