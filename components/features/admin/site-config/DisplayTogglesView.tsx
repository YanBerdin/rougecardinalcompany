"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDisplayToggleAction } from "@/lib/actions/site-config-actions";
import { ToggleCard } from "./ToggleCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { DisplayTogglesViewProps } from "./types";

export function DisplayTogglesView({
    homeToggles: initialHomeToggles,
    compagnieToggles: initialCompagnieToggles,
    presseToggles: initialPresseToggles,
    agendaToggles: initialAgendaToggles,
    contactToggles: initialContactToggles,
}: DisplayTogglesViewProps) {
    const router = useRouter();
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    // ✅ Local state synced with props
    const [homeToggles, setHomeToggles] = useState(initialHomeToggles);
    const [compagnieToggles, setCompagnieToggles] = useState(
        initialCompagnieToggles
    );
    const [presseToggles, setPresseToggles] = useState(initialPresseToggles);
    const [agendaToggles, setAgendaToggles] = useState(initialAgendaToggles);
    const [contactToggles, setContactToggles] = useState(initialContactToggles);

    // ✅ CRITIQUE: Sync local state when props change (after router.refresh())
    useEffect(() => {
        setHomeToggles(initialHomeToggles);
    }, [initialHomeToggles]);

    useEffect(() => {
        setCompagnieToggles(initialCompagnieToggles);
    }, [initialCompagnieToggles]);

    useEffect(() => {
        setPresseToggles(initialPresseToggles);
    }, [initialPresseToggles]);

    useEffect(() => {
        setAgendaToggles(initialAgendaToggles);
    }, [initialAgendaToggles]);

    useEffect(() => {
        setContactToggles(initialContactToggles);
    }, [initialContactToggles]);

    const handleToggle = useCallback(
        async (key: string, enabled: boolean) => {
            setUpdatingKey(key);

            try {
                const result = await updateDisplayToggleAction({
                    key,
                    enabled,
                });

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Configuration mise à jour", {
                    description: `Section ${enabled ? "activée" : "désactivée"}`,
                });

                router.refresh(); // ✅ Déclenche re-fetch Server Component
            } catch (error) {
                toast.error("Erreur", {
                    description:
                        error instanceof Error ? error.message : "Erreur inconnue",
                });
            } finally {
                setUpdatingKey(null);
            }
        },
        [router]
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">
                    Affichage des Sections
                </h2>
                <p className="text-muted-foreground">
                    Contrôlez la visibilité des sections sur les pages publiques
                </p>
            </div>

            <Separator />

            {/* Homepage Toggles */}
            <Card>
                <CardHeader>
                    <CardTitle>Page d'Accueil</CardTitle>
                    <CardDescription>
                        Sections affichées sur la homepage
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {homeToggles.map((toggle) => (
                        <ToggleCard
                            key={toggle.key}
                            toggle={toggle}
                            onToggle={handleToggle}
                            isUpdating={updatingKey === toggle.key}
                        />
                    ))}
                </CardContent>
            </Card>

            {/* Presse Toggles */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Presse</CardTitle>
                    <CardDescription>Sections affichées sur la page presse</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {presseToggles.map((toggle) => (
                        <ToggleCard
                            key={toggle.key}
                            toggle={toggle}
                            onToggle={handleToggle}
                            isUpdating={updatingKey === toggle.key}
                        />
                    ))}
                </CardContent>
            </Card>

            {/* Agenda Toggles */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Agenda</CardTitle>
                    <CardDescription>
                        Sections affichées sur la page agenda
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {agendaToggles.map((toggle) => (
                        <ToggleCard
                            key={toggle.key}
                            toggle={toggle}
                            onToggle={handleToggle}
                            isUpdating={updatingKey === toggle.key}
                        />
                    ))}
                </CardContent>
            </Card>

            {/* Contact Toggles */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Contact</CardTitle>
                    <CardDescription>
                        Sections affichées sur la page contact
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {contactToggles.map((toggle) => (
                        <ToggleCard
                            key={toggle.key}
                            toggle={toggle}
                            onToggle={handleToggle}
                            isUpdating={updatingKey === toggle.key}
                        />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
