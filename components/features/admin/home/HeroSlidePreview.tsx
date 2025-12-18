import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface HeroSlidePreviewProps {
    slide: HeroSlideDTO;
}

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {slide.image_url && (
                <Image
                    width={96}
                    height={64}
                    src={slide.image_url}
                    alt={slide.alt_text}
                    className="h-12 w-18 sm:h-16 sm:w-24 object-cover rounded shrink-0"
                />
            )}

            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{slide.title}</h3>
                    {!slide.active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                </div>

                {slide.subtitle && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {slide.subtitle}
                    </p>
                )}

                {slide.cta_primary_enabled && slide.cta_primary_label && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                        CTA: {slide.cta_primary_label}
                        {slide.cta_secondary_enabled && slide.cta_secondary_label && (
                            <span> | {slide.cta_secondary_label}</span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
}
