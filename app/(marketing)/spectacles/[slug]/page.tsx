import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchSpectacleBySlug } from "@/lib/dal/spectacles";
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

    return <SpectacleDetailView spectacle={spectacle} />;
}


