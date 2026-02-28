/**
 * @file BulkTagSelector - Add/Remove tags section for bulk media actions
 * @description Extracted from MediaBulkActions for SRP compliance
 */
"use client";

import { TagActionBadge } from "./TagActionBadge";
import { MAX_VISIBLE_TAGS } from "./constants";
import type { MediaTagDTO } from "@/lib/schemas/media";

interface BulkTagSelectorProps {
    addableTags: MediaTagDTO[];
    removableTags: MediaTagDTO[];
    isPending: boolean;
    onAddTag: (tagId: number) => void;
    onRemoveTag: (tagId: number) => void;
}

export function BulkTagSelector({
    addableTags,
    removableTags,
    isPending,
    onAddTag,
    onRemoveTag,
}: BulkTagSelectorProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Add tags row */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Ajouter:</span>
                <div
                    className="flex flex-wrap gap-1.5 flex-1 min-w-0"
                    role="group"
                    aria-label="Sélection de tags à ajouter"
                >
                    {addableTags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                        <TagActionBadge
                            key={tag.id}
                            tag={tag}
                            variant="secondary"
                            actionLabel="Ajouter tag"
                            onAction={() => onAddTag(tag.id)}
                            isPending={isPending}
                        />
                    ))}
                </div>
            </div>

            {/* Remove tags row */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Retirer:</span>
                {removableTags.length > 0 ? (
                    <div
                        className="flex flex-wrap gap-1.5 flex-1 min-w-0"
                        role="group"
                        aria-label="Sélection de tags à retirer"
                    >
                        {removableTags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                            <TagActionBadge
                                key={tag.id}
                                tag={tag}
                                variant="destructive"
                                actionLabel="Retirer tag"
                                onAction={() => onRemoveTag(tag.id)}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground italic">
                        Aucun tag sur les médias sélectionnés
                    </span>
                )}
            </div>
        </div>
    );
}
