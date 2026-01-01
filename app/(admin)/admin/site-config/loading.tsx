import { DisplayTogglesSkeleton } from "@/components/skeletons/DisplayTogglesSkeleton";

export default function Loading() {
    return (
        <div className="container py-6">
            <DisplayTogglesSkeleton />
        </div>
    );
}
