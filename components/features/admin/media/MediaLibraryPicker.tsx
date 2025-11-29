"use client";
import { useState, useCallback, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ImageIcon, Check } from "lucide-react";
import Image from "next/image";
import type { MediaLibraryPickerProps, MediaSearchItem } from "./types";

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

/**
 * MediaLibraryPicker - Library search mode for media picker
 * Allows searching and selecting from existing media library
 */
export function MediaLibraryPicker({
    open,
    onClose,
    onSelect,
}: MediaLibraryPickerProps) {
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<MediaSearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MediaSearchItem | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchMedia = useCallback(async (searchQuery: string, page: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                q: searchQuery,
                page: page.toString(),
                limit: "12",
            });

            const response = await fetch(`/api/admin/media/search?${params}`);

            if (!response.ok) {
                throw new Error("Erreur lors de la recherche");
            }

            const result = await response.json();

            if (result.success) {
                setItems(result.data.items);
                setPagination(result.data.pagination);
            } else {
                console.error("[MediaLibraryPicker] Search error:", result.error);
                setItems([]);
            }
        } catch (error) {
            console.error("[MediaLibraryPicker] Fetch error:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial media when dialog opens
    useEffect(() => {
        if (open) {
            fetchMedia("", 1);
            setSelectedItem(null);
            setQuery("");
            setCurrentPage(1);
        }
    }, [open, fetchMedia]);

    // Debounced search
    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchMedia(query, 1);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, open, fetchMedia]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        fetchMedia(query, newPage);
    };

    const handleSelect = () => {
        if (!selectedItem) return;

        onSelect({
            id: selectedItem.id,
            url: selectedItem.url,
        });
        handleClose();
    };

    const handleClose = () => {
        setSelectedItem(null);
        setQuery("");
        setItems([]);
        setCurrentPage(1);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Médiathèque</DialogTitle>
                    <DialogDescription>
                        Recherchez et sélectionnez une image existante
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom ou description..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Results grid */}
                    <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center h-[300px]">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                <ImageIcon className="h-12 w-12 mb-2" />
                                <p>Aucune image trouvée</p>
                                {query && (
                                    <p className="text-sm">
                                        Essayez une autre recherche
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
                                {items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setSelectedItem(item)}
                                        className={`
                      relative aspect-square rounded-lg overflow-hidden border-2 
                      transition-all hover:scale-105 focus:outline-none focus:ring-2 
                      focus:ring-ring focus:ring-offset-2
                      ${selectedItem?.id === item.id
                                                ? "border-primary ring-2 ring-primary"
                                                : "border-transparent hover:border-muted-foreground/30"
                                            }
                    `}
                                    >
                                        <Image
                                            src={item.url}
                                            alt={item.alt_text || item.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 33vw, 25vw"
                                        />
                                        {selectedItem?.id === item.id && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                            <p className="text-xs text-white truncate">
                                                {item.name}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                            >
                                Précédent
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} sur {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || loading}
                            >
                                Suivant
                            </Button>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end border-t pt-4">
                        <Button variant="outline" onClick={handleClose}>
                            Annuler
                        </Button>
                        <Button onClick={handleSelect} disabled={!selectedItem}>
                            Sélectionner
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default MediaLibraryPicker;
