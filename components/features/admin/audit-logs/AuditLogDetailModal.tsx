"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AuditLogDetailModalProps } from "./types";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AuditLogDetailModal({ log, open, onClose }: AuditLogDetailModalProps) {
    const hasOldValues = log.old_values && Object.keys(log.old_values).length > 0;
    const hasNewValues = log.new_values && Object.keys(log.new_values).length > 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="font-mono text-base">{log.table_name}</span>
                        {log.record_id && (
                            <span className="text-muted-foreground">#{log.record_id}</span>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {format(new Date(log.created_at), "PPpp", { locale: fr })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
                        <div>
                            <span className="font-semibold text-muted-foreground">Utilisateur</span>
                            <p className="mt-1">{log.user_email ?? "Système"}</p>
                        </div>
                        <div>
                            <span className="font-semibold text-muted-foreground">Adresse IP</span>
                            <p className="mt-1 font-mono">{log.ip_address ?? "—"}</p>
                        </div>
                        <div className="col-span-2">
                            <span className="font-semibold text-muted-foreground">User Agent</span>
                            <p className="mt-1 truncate text-xs">{log.user_agent ?? "—"}</p>
                        </div>
                    </div>

                    {/* JSON Values Tabs */}
                    {(hasOldValues || hasNewValues) && (
                        <Tabs defaultValue={hasOldValues ? "old" : "new"} className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger value="old" className="flex-1" disabled={!hasOldValues}>
                                    Anciennes valeurs
                                    {hasOldValues && (
                                        <Badge variant="secondary" className="ml-2">
                                            {Object.keys(log.old_values ?? {}).length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="new" className="flex-1" disabled={!hasNewValues}>
                                    Nouvelles valeurs
                                    {hasNewValues && (
                                        <Badge variant="secondary" className="ml-2">
                                            {Object.keys(log.new_values ?? {}).length}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="old" className="mt-4">
                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    {hasOldValues ? (
                                        <JsonView
                                            src={log.old_values}
                                            theme="vscode"
                                            collapsed={2}
                                            enableClipboard
                                            displaySize
                                        />
                                    ) : (
                                        <p className="text-center text-muted-foreground">
                                            Aucune donnée disponible
                                        </p>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="new" className="mt-4">
                                <ScrollArea className="h-[300px] rounded-md border p-4">
                                    {hasNewValues ? (
                                        <JsonView
                                            src={log.new_values}
                                            theme="vscode"
                                            collapsed={2}
                                            enableClipboard
                                            displaySize
                                        />
                                    ) : (
                                        <p className="text-center text-muted-foreground">
                                            Aucune donnée disponible
                                        </p>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    )}

                    {/* No values message */}
                    {!hasOldValues && !hasNewValues && (
                        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                            Aucune donnée JSON enregistrée pour cette opération
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
