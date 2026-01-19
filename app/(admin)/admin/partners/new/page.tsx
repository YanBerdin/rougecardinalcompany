import { PartnerForm } from "@/components/features/admin/partners/PartnerForm";

export const metadata = {
    title: "Nouveau Partenaire | Admin",
};

export default function NewPartnerPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Nouveau partenaire</h1>
                <p className="text-muted-foreground">
                    Ajoutez un nouveau partenaire avec son logo
                </p>
            </div>
            <PartnerForm />
        </div>
    );
}
