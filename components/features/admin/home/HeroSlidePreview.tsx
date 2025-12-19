import type { HeroSlideDTO } from "@/lib/schemas/home-content";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface HeroSlidePreviewProps {
    slide: HeroSlideDTO;
}

export function HeroSlidePreview({ slide }: HeroSlidePreviewProps) {
    return (
        <div className="flex flex-col gap-3 w-full">
            {slide.image_url && (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted border shadow-sm">
                    <Image
                        fill
                        src={slide.image_url}
                        alt={slide.alt_text}
                        className="object-cover transition-transform hover:scale-105 duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base leading-tight line-clamp-2">{slide.title}</h3>
                    {slide.active ? (
                        <Badge variant="default" className="shrink-0">Active</Badge>
                    ) : (
                        <Badge variant="secondary" className="shrink-0">Inactive</Badge>
                    )}
                </div>

                {slide.subtitle && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {slide.subtitle}
                    </p>
                )}

                {(slide.cta_primary_enabled || slide.cta_secondary_enabled) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {slide.cta_primary_enabled && slide.cta_primary_label && (
                            <Badge variant="outline" className="text-xs font-normal bg-background" title="CTA Principal">
                                {slide.cta_primary_label}
                            </Badge>
                        )}
                        {slide.cta_secondary_enabled && slide.cta_secondary_label && (
                            <Badge variant="outline" className="text-xs font-normal bg-background" title="CTA Secondaire">
                                {slide.cta_secondary_label}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
