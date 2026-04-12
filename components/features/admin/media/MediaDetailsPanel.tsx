"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { MediaItemExtendedDTO, MediaFolderDTO, MediaTagDTO } from "@/lib/schemas/media";
import { MediaPreview } from "./details/MediaPreview";
import { MediaFileInfo } from "./details/MediaFileInfo";
import { MediaEditForm } from "./details/MediaEditForm";
import { MediaDetailActions } from "./details/MediaDetailActions";
import { MediaDetailsProvider } from "./MediaDetailsProvider";
import { useMediaDetailsContext } from "./MediaDetailsContext";

interface MediaDetailsPanelProps {
    media: MediaItemExtendedDTO | null;
    folders: MediaFolderDTO[];
    tags: MediaTagDTO[];
    onClose: () => void;
    onUpdate: () => void;
}

function MediaDetailsPanelLayout() {
    const { actions } = useMediaDetailsContext();

    return (
        <>
            {/* Backdrop — fermeture au clic sur mobile et desktop */}
            <div
                className="fixed inset-0 z-40 bg-black/40 sm:bg-black/20"
                onClick={actions.onClose}
                aria-hidden="true"
            />

            {/*
             * Mobile  : bottom sheet (max 90dvh, coins arrondis)
             * Desktop : panneau latéral droit (400px, inset-y-0 = hauteur plein écran)
             *
             * Ce div est directement le conteneur flex : la contrainte max-h-[95dvh]
             * s'applique alors directement sur le flex layout, ce qui permet à
             * flex-1 + min-h-0 sur ScrollArea de fonctionner correctement sur mobile.
             * Sur desktop, inset-y-0 donne une hauteur définie (viewport), sm:max-h-none
             * lève la contrainte mobile.
             */}
            <div
                className="fixed inset-x-0 bottom-0 z-50
                           flex flex-col max-h-[100dvh] overflow-auto
                           rounded-t-2xl border-t bg-background shadow-xl
                           sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:w-[400px] sm:rounded-none sm:border-t-0 sm:border-l"
                role="dialog"
                aria-modal="true"
                aria-label="Détails du média"
            >
                {/* Poignée visuelle (mobile uniquement) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden" aria-hidden="true">
                    <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-1 border-b shrink-0">
                    <h2 className="text-lg font-semibold">Détails du média</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={actions.onClose}
                        className="h-11 w-11"
                        aria-label="Fermer le panneau"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content — flex-1 min-h-0 : le ScrollArea occupe l'espace restant et scrolle */}
                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4 space-y-4 pb-8">
                        <MediaPreview />
                        <MediaFileInfo />

                        <MediaEditForm />
                        <MediaDetailActions />
                    </div>
                </ScrollArea>
            </div>
        </>
    );
}

export function MediaDetailsPanel({
    media,
    folders,
    tags,
    onClose,
    onUpdate,
}: MediaDetailsPanelProps) {
    if (!media) return null;

    return (
        <MediaDetailsProvider
            media={media}
            folders={folders}
            tags={tags}
            onClose={onClose}
            onUpdate={onUpdate}
        >
            <MediaDetailsPanelLayout />
        </MediaDetailsProvider>
    );
}
