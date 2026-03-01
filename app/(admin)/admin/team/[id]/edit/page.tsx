import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdminPageAccess } from "@/lib/auth/is-admin";
import { fetchTeamMemberById } from "@/lib/dal/team";
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
    await requireAdminPageAccess();

    // Parse and validate ID
    const { id } = await params;
    const memberId = parseInt(id, 10);
    if (isNaN(memberId) || memberId <= 0) {
        redirect("/admin/team?error=invalid_id");
    }

    // Fetch member via DAL — unwrap DALResult
    const memberResult = await fetchTeamMemberById(memberId);
    if (!memberResult.success || !memberResult.data) {
        // Member was deleted or doesn't exist - redirect to list with message
        redirect("/admin/team?deleted=true");
    }
    const member = memberResult.data;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="lg" asChild>
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
                    <TeamMemberFormClient member={member} />
                </CardContent>
            </Card>
        </div>
    );
}
