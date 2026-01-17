import { Activity } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { AdminActivityCardProps } from "./types";

/**
 * Admin Activity Card Component
 *
 * Displays admin activity summary from audit logs
 */
export function AdminActivityCard({ activity, isLoading }: AdminActivityCardProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activité Admin
                    </CardTitle>
                    <CardDescription>Chargement...</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activité Admin
                </CardTitle>
                <CardDescription>Actions récentes dans le panneau d'administration</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Actions Totales</span>
                        <span className="text-2xl font-bold">{activity.totalActions}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Admins Actifs</span>
                        <span className="text-2xl font-bold">{activity.uniqueAdmins}</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Opération Principale</span>
                        <Badge variant="secondary" className="w-fit mt-1">
                            {activity.topOperation ?? "N/A"}
                        </Badge>
                    </div>
                </div>

                {/* Recent Actions Table */}
                {activity.recentActions.length > 0 ? (
                    <div className="relative overflow-auto max-h-64">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Opération</TableHead>
                                    <TableHead>Table</TableHead>
                                    <TableHead className="text-right">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activity.recentActions.map((action, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Badge variant="outline">{action.operation}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{action.tableName}</TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {format(action.timestamp, "dd/MM HH:mm", { locale: fr })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                )}
            </CardContent>
        </Card>
    );
}
