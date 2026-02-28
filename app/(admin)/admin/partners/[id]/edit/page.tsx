import { notFound } from "next/navigation";
import { fetchPartnerById } from "@/lib/dal/admin-partners";
import { PartnerForm } from "@/components/features/admin/partners/PartnerForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "Éditer Partenaire | Admin",
};

interface EditPartnerPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditPartnerPage({ params }: EditPartnerPageProps) {
    const { id } = await params;
    const result = await fetchPartnerById(BigInt(id));

    if (!result.success) {
        throw new Error(result.error);
    }

    if (!result.data) {
        notFound();
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Éditer partenaire</h1>
                <p className="text-muted-foreground">
                    Modifiez les informations du partenaire
                </p>
            </div>
            <PartnerForm partner={result.data} />
        </div>
    );
}
