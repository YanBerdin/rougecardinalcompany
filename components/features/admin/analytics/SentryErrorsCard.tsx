import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SentryErrorsCardProps } from "./types";

/**
 * Sentry Errors Card Component
 *
 * Displays error metrics from Sentry by priority level
 */
export function SentryErrorsCard({ metrics, isLoading }: SentryErrorsCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Erreurs Production (Sentry)
                    </CardTitle>
                    <CardDescription>Chargement...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const hasErrors = metrics.totalErrors > 0;

    return (
        <Card className={hasErrors ? "border-orange-500" : undefined}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-5 w-5", hasErrors ? "text-orange-500" : "text-green-500")} />
                    Erreurs Production (Sentry)
                </CardTitle>
                <CardDescription>
                    Dernière mise à jour : {format(metrics.lastFetched, "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {/* P0 Critical */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium">P0 Critique</span>
                        </div>
                        <div className="text-2xl font-bold">{metrics.p0Critical}</div>
                        {metrics.p0Critical > 0 && (
                            <Badge variant="destructive" className="w-fit">
                                Action requise
                            </Badge>
                        )}
                    </div>

                    {/* P1 High */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm font-medium">P1 Élevé</span>
                        </div>
                        <div className="text-2xl font-bold">{metrics.p1High}</div>
                        {metrics.p1High > 0 && (
                            <Badge variant="secondary" className="w-fit bg-orange-100 text-orange-800">
                                À surveiller
                            </Badge>
                        )}
                    </div>

                    {/* P2 Medium */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">P2 Moyen</span>
                        </div>
                        <div className="text-2xl font-bold">{metrics.p2Medium}</div>
                    </div>

                    {/* Total */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Total</span>
                        </div>
                        <div className="text-2xl font-bold">{metrics.totalErrors}</div>
                        {!hasErrors && (
                            <Badge variant="secondary" className="w-fit bg-green-100 text-green-800">
                                Aucune erreur
                            </Badge>
                        )}
                    </div>
                </div>

                {!hasErrors && (
                    <p className="text-sm text-muted-foreground mt-4">
                        🎉 Aucune erreur active détectée en production.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ");
}
