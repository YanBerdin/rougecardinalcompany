/**
 * @file TagActionBadge - Reusable tag badge with keyboard and click action handling
 * @description Eliminates onClick/onKeyDown duplication in MediaBulkActions
 */
"use client";

import { Badge } from "@/components/ui/badge";
import type { MediaTagDTO } from "@/lib/schemas/media";

interface TagActionBadgeProps {
    tag: MediaTagDTO;
    /** "secondary" for add actions, "destructive" for remove actions */
    variant: "secondary" | "destructive";
    actionLabel: string;
    onAction: () => void;
    isPending: boolean;
}

export function TagActionBadge({
    tag,
    variant,
    actionLabel,
    onAction,
    isPending,
}: TagActionBadgeProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onAction();
        }
    };

    const variantStyles =
        variant === "destructive"
            ? "cursor-pointer px-2.5 py-1 text-xs font-medium transition-all hover:scale-105 hover:bg-card-foreground focus:outline-none focus:ring-2 focus:ring-destructive border-foreground/20"
            : "cursor-pointer px-2.5 py-1 text-xs font-medium transition-all hover:scale-95 hover:bg-card focus:outline-none focus:ring-2 focus:ring-primary border-foreground/20";

    return (
        <Badge
            variant={variant}
            className={variantStyles}
            onClick={onAction}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-label={`${actionLabel} ${tag.name}`}
            aria-disabled={isPending}
        >
            {tag.name}
        </Badge>
    );
}
