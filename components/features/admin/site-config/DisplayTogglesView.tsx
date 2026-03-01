"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateDisplayToggleAction } from "@/lib/actions/site-config-actions";
import { ToggleSection } from "./ToggleSection";
import { Separator } from "@/components/ui/separator";
import type { DisplayTogglesViewProps, ToggleSectionConfig } from "./types";
import type { DisplayToggleDTO } from "@/lib/schemas/site-config";

const SECTIONS: ToggleSectionConfig[] = [
    { id: "home", title: "Page d'Accueil", description: "Sections affichées sur la homepage" },
    { id: "presse", title: "Page Presse", description: "Sections affichées sur la page presse" },
    { id: "agenda", title: "Page Agenda", description: "Sections affichées sur la page agenda" },
    { id: "contact", title: "Page Contact", description: "Sections affichées sur la page contact" },
];

export function DisplayTogglesView({
    homeToggles: initialHomeToggles,
    presseToggles: initialPresseToggles,
    agendaToggles: initialAgendaToggles,
    contactToggles: initialContactToggles,
}: DisplayTogglesViewProps): React.JSX.Element {
    const router = useRouter();
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    const [togglesBySection, setTogglesBySection] = useState<Record<string, DisplayToggleDTO[]>>({
        home: initialHomeToggles,
        presse: initialPresseToggles,
        agenda: initialAgendaToggles,
        contact: initialContactToggles,
    });

    // Sync local state when props change (after router.refresh())
    useEffect(() => {
        setTogglesBySection({
            home: initialHomeToggles,
            presse: initialPresseToggles,
            agenda: initialAgendaToggles,
            contact: initialContactToggles,
        });
    }, [initialHomeToggles, initialPresseToggles, initialAgendaToggles, initialContactToggles]);

    const handleToggle = useCallback(
        async (key: string, enabled: boolean): Promise<void> => {
            setUpdatingKey(key);

            try {
                const result = await updateDisplayToggleAction({ key, enabled });

                if (!result.success) {
                    throw new Error(result.error);
                }

                toast.success("Configuration mise à jour", {
                    description: `Section ${enabled ? "activée" : "désactivée"}`,
                });

                router.refresh();
            } catch (error: unknown) {
                toast.error("Erreur", {
                    description: error instanceof Error ? error.message : "Erreur inconnue",
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

            <div className="space-y-6">
                {SECTIONS.map((section) => (
                    <ToggleSection
                        key={section.id}
                        config={section}
                        toggles={togglesBySection[section.id] ?? []}
                        updatingKey={updatingKey}
                        onToggle={handleToggle}
                    />
                ))}
            </div>
        </div>
    );
}
