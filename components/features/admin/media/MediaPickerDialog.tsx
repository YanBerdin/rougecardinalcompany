"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface Media {
    id: bigint;
    url: string;
    name: string;
    type: string;
}

interface MediaPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (media: { id: bigint; url: string }) => void;
}

export function MediaPickerDialog({
    open,
    onClose,
    onSelect,
}: MediaPickerDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [mediaItems, setMediaItems] = useState<Media[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = useCallback(
        async (query: string) => {
            setSearchQuery(query);

            if (!query.trim()) {
                setMediaItems([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/admin/media/search?q=${encodeURIComponent(query)}`
                );

                if (!response.ok) {
                    throw new Error("Failed to search media");
                }

                const data = await response.json();
                setMediaItems(data.items || []);
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : "Failed to search media"
                );
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const handleSelect = useCallback(
        (media: Media) => {
            onSelect({
                id: media.id,
                url: media.url,
            });
            setSearchQuery("");
            setMediaItems([]);
        },
        [onSelect]
    );

    // Reset state when dialog closes
    useEffect(() => {
        if (!open) {
            setSearchQuery("");
            setMediaItems([]);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select Media</DialogTitle>
                    <DialogDescription>
                        Search and select an image from your media library
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search media by name..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            disabled={isLoading}
                            className="pl-10"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="col-span-3 flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : mediaItems.length > 0 ? (
                            mediaItems.map((media) => (
                                <button
                                    key={media.id.toString()}
                                    onClick={() => handleSelect(media)}
                                    className="group relative overflow-hidden rounded-lg border border-input hover:border-primary transition-colors"
                                >
                                    <img
                                        src={media.url}
                                        alt={media.name}
                                        className="w-full h-32 object-cover group-hover:opacity-75 transition-opacity"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            Select
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <p className="text-white text-xs truncate">{media.name}</p>
                                    </div>
                                </button>
                            ))
                        ) : searchQuery ? (
                            <div className="col-span-3 text-center py-8 text-muted-foreground">
                                No media found
                            </div>
                        ) : (
                            <div className="col-span-3 text-center py-8 text-muted-foreground">
                                Start typing to search media
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
