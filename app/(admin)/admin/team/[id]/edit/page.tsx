import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/supabase/server";
import { fetchTeamMemberById } from "@/lib/dal/team";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { TeamMemberFormWrapper } from "@/components/features/admin/team/TeamMemberFormWrapper";

export const metadata: Metadata = {
    title: "Modifier membre | Admin",
    description: "Modifier les informations d'un membre de l'équipe",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditTeamMemberPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTeamMemberPage({
    params,
}: EditTeamMemberPageProps) {
    const supabase = await createClient();

    // Auth check
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims || data.claims.user_metadata.role !== "admin") {
        redirect("/auth/login");
    }

    // Parse and validate ID
    const { id } = await params;
    const memberId = parseInt(id, 10);
    if (isNaN(memberId) || memberId <= 0) {
        notFound();
    }

    // Fetch member via DAL
    const member = await fetchTeamMemberById(memberId);
    if (!member) {
        notFound();
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
                    <h1 className="text-3xl font-bold">Modifier le membre</h1>
                    <p className="text-muted-foreground mt-1">
                        Modifier les informations de {member.name}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations du membre</CardTitle>
                    <CardDescription>
                        Modifiez les informations du membre de l&apos;équipe.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TeamMemberFormWrapper member={member} />
                </CardContent>
            </Card>
        </div>
    );
}
