/**
 * @file MediaCard - Optimized with Thumbnails & Lazy Loading
 * @description Display media card with automatic thumbnail loading (Phase 3)
 * @pattern Uses Intersection Observer API for lazy loading
 * @phase4 Enhanced with smooth animations and full accessibility support
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { INTERSECTION_OBSERVER_MARGIN } from "./constants";
import { MediaCardThumbnail } from "./MediaCardThumbnail";
import { MediaCardFooter } from "./MediaCardFooter";
import type { MediaItemExtendedDTO } from "@/lib/schemas/media";

interface MediaCardProps {
  media: MediaItemExtendedDTO;
  isSelected?: boolean;
  selectionMode?: boolean;
  onSelect?: (media: MediaItemExtendedDTO) => void;
  onKeyboardSelect?: (media: MediaItemExtendedDTO, event: React.KeyboardEvent) => void;
}

export function MediaCard({
  media,
  isSelected,
  selectionMode,
  onSelect,
  onKeyboardSelect,
}: MediaCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: INTERSECTION_OBSERVER_MARGIN }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onSelect?.(media);
      onKeyboardSelect?.(media, e);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card cursor-pointer",
        "transition-all duration-200 ease-in-out",
        "hover:shadow-lg hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        selectionMode && "hover:border-primary",
        isSelected && "ring-2 ring-primary border-primary"
      )}
      onClick={() => onSelect?.(media)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${isSelected ? "Désélectionner" : "Sélectionner"} ${media.filename}`}
      aria-pressed={isSelected}
    >
      <MediaCardThumbnail
        media={media}
        isVisible={isVisible}
        isSelected={isSelected}
        selectionMode={selectionMode}
      />
      <MediaCardFooter media={media} />
    </div>
  );
}
