import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Calendar, Image as ImageIcon, Settings } from "lucide-react";

interface CardItem {
    title: string;
    description?: string;
    href: string;
    icon?: React.ReactNode;
}

const items: CardItem[] = [
    { title: "Gérer l'équipe", description: "Membres, rôles et profils", href: "/admin/team", icon: <Users className="h-5 w-5" /> },
    { title: "Spectacles", description: "Créer et modifier les spectacles", href: "/admin/spectacles", icon: <FileText className="h-5 w-5" /> },
    { title: "Événements", description: "Calendrier et billetterie", href: "/admin/events", icon: <Calendar className="h-5 w-5" /> },
    { title: "Médias", description: "Gérer images et vidéos", href: "/admin/media", icon: <ImageIcon className="h-5 w-5" /> },
    { title: "Utilisateurs", description: "Comptes et permissions", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
    { title: "Réglages", description: "Configuration du site", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
];

export default function CardsDashboard() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
                <Card key={it.href} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex items-start justify-between gap-4 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">{it.title}</CardTitle>
                            {it.description && (
                                <CardDescription className="text-muted-foreground">{it.description}</CardDescription>
                            )}
                        </div>
                        <div className="text-muted-foreground">{it.icon}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-end">
                            <Button asChild size="sm">
                                <Link href={it.href}>Accéder</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
