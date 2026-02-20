import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSpectacleBySlug, fetchSpectacleNextVenue } from "@/lib/dal/spectacles";
import { fetchSpectacleLandscapePhotos, fetchSpectacleGalleryPhotos } from "@/lib/dal/spectacle-photos";
import { SpectacleDetailView } from "@/components/features/public-site/spectacles/SpectacleDetailView";

export const dynamic = "force-dynamic";
export const revalidate = 60;

interface SpectacleDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({
    params,
}: SpectacleDetailPageProps): Promise<Metadata> {
    const { slug } = await params;
    const spectacle = await fetchSpectacleBySlug(slug);

    if (!spectacle) {
        return {
            title: "Spectacle introuvable",
        };
    }

    return {
        title: `${spectacle.title} | Rouge Cardinal`,
        description:
            spectacle.short_description ||
            spectacle.description ||
            `Découvrez ${spectacle.title}, un spectacle de la compagnie Rouge Cardinal`,
        openGraph: {
            title: spectacle.title,
            description:
                spectacle.short_description ||
                spectacle.description ||
                `Découvrez ${spectacle.title}`,
            images: spectacle.image_url ? [spectacle.image_url] : [],
        },
    };
}

export default async function SpectacleDetailPage({
    params,
}: SpectacleDetailPageProps) {
    const { slug } = await params;
    const spectacle = await fetchSpectacleBySlug(slug);

    if (!spectacle) {
        notFound();
    }

    // Fetch landscape photos, gallery photos, and venue in parallel
    const [landscapePhotos, galleryPhotos, venue] = await Promise.all([
        fetchSpectacleLandscapePhotos(BigInt(spectacle.id)),
        fetchSpectacleGalleryPhotos(BigInt(spectacle.id)),
        fetchSpectacleNextVenue(spectacle.id),
    ]);

    return (
        <SpectacleDetailView
            spectacle={spectacle}
            landscapePhotos={landscapePhotos}
            galleryPhotos={galleryPhotos}
            venue={venue}
        />
    );
}


