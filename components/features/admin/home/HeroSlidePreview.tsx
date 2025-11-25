import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import { Badge } from "@/components/ui/badge";

interface HeroSlidePreviewProps {
    slide: HeroSlideDTO;
}

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
    return (
        <div className="flex items-center gap-4 flex-1">
            {slide.image_url && (
                <img
                    src={slide.image_url}
                    alt={slide.alt_text}
                    className="h-16 w-24 object-cover rounded"
                />
            )}

            <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{slide.title}</h3>
                    {!slide.active && <Badge variant="secondary">Inactive</Badge>}
                </div>

                {slide.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                        {slide.subtitle}
                    </p>
                )}

                {slide.cta_label && (
                    <p className="text-xs text-muted-foreground">
                        CTA: {slide.cta_label}
                    </p>
                )}
            </div>
        </div>
    );
}
