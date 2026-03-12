import { AboutContentContainer } from "@/components/features/admin/home/AboutContentContainer";
import { StatsContainer } from "@/components/features/admin/home/StatsContainer";
import { Separator } from "@/components/ui/separator";
import { requireAdminPageAccess } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "About Section Management | Admin",
    description: "Manage about section content",
};

export default async function AboutContentPage() {
    await requireAdminPageAccess();

    return (
        <div className="container mx-auto py-8 space-y-8">
            <AboutContentContainer />

            <Separator />

            <section aria-labelledby="stats-heading">
                <h2
                    id="stats-heading"
                    className="mb-4 text-xl font-semibold"
                >
                    Chiffres clés
                </h2>
                <StatsContainer />
            </section>
        </div>
    );
}
