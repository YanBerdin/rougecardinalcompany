import { notFound } from "next/navigation";
import { fetchPressReleaseById } from "@/lib/dal/admin-press-releases";
import { PressReleaseEditForm } from "@/components/features/admin/presse/PressReleaseEditForm";

export const metadata = {
    title: "Éditer communiqué | Admin",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PressReleaseEditPage({ params }: PageProps) {
    const { id } = await params;
    const result = await fetchPressReleaseById(BigInt(id));

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Éditer le communiqué</h1>
            <PressReleaseEditForm release={result.data} />
        </div>
    );
}
