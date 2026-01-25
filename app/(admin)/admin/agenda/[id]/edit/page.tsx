import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/features/admin/agenda/EventForm";
import {
  fetchEventByIdAdmin,
  fetchAllLieux,
} from "@/lib/dal/admin-agenda";
import { fetchAllSpectacles } from "@/lib/dal/spectacles";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Modifier Événement | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

async function EditEventFormData({ id }: { id: string }) {
  const [eventResult, spectacles, lieuxResult] = await Promise.all([
    fetchEventByIdAdmin(BigInt(id)),
    fetchAllSpectacles(true),
    fetchAllLieux(),
  ]);

  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  const lieux = lieuxResult.success ? lieuxResult.data : [];

  return (
    <EventForm
      event={eventResult.data}
      spectacles={spectacles}
      lieux={lieux}
    />
  );
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Modifier Événement</h1>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <EditEventFormData id={id} />
      </Suspense>
    </div>
  );
}
