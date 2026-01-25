import { Suspense } from "react";
import { EventForm } from "@/components/features/admin/agenda/EventForm";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import { fetchAllLieux } from "@/lib/dal/admin-agenda";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Nouvel Événement | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function NewEventFormData() {
    const [spectacles, lieuxResult] = await Promise.all([
        fetchAllSpectacles(true),
        fetchAllLieux(),
    ]);

    if (!lieuxResult.success) {
        throw new Error(lieuxResult.error);
    }

    return <EventForm spectacles={spectacles} lieux={lieuxResult.data} />;
}

export default function NewEventPage() {
    return (
        <div className="container max-w-4xl py-8">
            <h1 className="text-3xl font-bold mb-6">Nouvel Événement</h1>
            <Suspense fallback={<Skeleton className="h-96" />}>
                <NewEventFormData />
            </Suspense>
        </div>
    );
}
