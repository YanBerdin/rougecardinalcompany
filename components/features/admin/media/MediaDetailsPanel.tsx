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
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] border-l bg-background shadow-lg">
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Détails du média</h2>
                    <Button variant="ghost" size="icon" onClick={actions.onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        <MediaPreview />
                        <MediaFileInfo />
                        <Separator />
                        <MediaEditForm />
                        <Separator />
                        <MediaDetailActions />
                    </div>
                </ScrollArea>
            </div>
        </div>
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
