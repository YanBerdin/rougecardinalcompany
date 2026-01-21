import { notFound } from "next/navigation";
import { fetchPressContactById } from "@/lib/dal/admin-press-contacts";
import { PressContactEditForm } from "@/components/features/admin/presse/PressContactEditForm";

export const metadata = {
    title: "Modifier contact presse | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditContactPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
    const { id } = await params;
    const result = await fetchPressContactById(BigInt(id));

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Modifier le contact</h1>
            <PressContactEditForm contact={result.data} />
        </div>
    );
}
