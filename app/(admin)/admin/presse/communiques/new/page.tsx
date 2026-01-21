import { PressReleaseNewForm } from "@/components/features/admin/presse/PressReleaseNewForm";

export const metadata = {
    title: "Nouveau communiqué | Admin",
    description: "Créer un nouveau communiqué de presse",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PressReleaseNewPage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Nouveau communiqué de presse</h1>
            <PressReleaseNewForm />
        </div>
    );
}
