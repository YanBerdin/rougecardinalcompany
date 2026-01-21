import { PressContactNewForm } from "@/components/features/admin/presse/PressContactNewForm";

export const metadata = {
    title: "Nouveau contact presse | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewContactPage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Nouveau contact presse</h1>
            <PressContactNewForm />
        </div>
    );
}
