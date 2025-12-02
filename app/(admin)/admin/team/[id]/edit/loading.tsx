import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditTeamMemberLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" disabled>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Retour à la liste</span>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Modifier le membre</h1>
                    <Skeleton className="mt-1 h-5 w-48" />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informations du membre</CardTitle>
                    <CardDescription>
                        Modifiez les informations du membre de l&apos;équipe.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Nom */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    {/* Rôle */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    {/* Photo */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-14" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    {/* Boutons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
