import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/supabase/server";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TeamMemberFormClient } from "@/components/features/admin/team/TeamMemberFormClient";

export const metadata: Metadata = {
    title: "Nouveau membre | Admin",
    description: "Ajouter un nouveau membre à l'équipe",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewTeamMemberPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
        redirect("/auth/login");
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/team">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Retour à la liste</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Nouveau membre</h1>
                    <p className="text-muted-foreground mt-1">
                        Ajouter un nouveau membre à l&apos;équipe
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations du membre</CardTitle>
                    <CardDescription>
                        Renseignez les informations du nouveau membre de l&apos;équipe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TeamMemberFormClient member={null} />
                </CardContent>
            </Card>
        </div>
    );
}
