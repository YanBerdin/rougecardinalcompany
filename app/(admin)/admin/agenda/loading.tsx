import { Skeleton } from "@/components/ui/skeleton";

export default function AgendaLoading() {
    return (
        <div className="container py-8">
            <Skeleton className="h-10 w-48 mb-6" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
}
