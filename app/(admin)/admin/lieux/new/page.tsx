import { Suspense } from "react";
import { LieuForm } from "@/components/features/admin/lieux/LieuForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nouveau Lieu | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewLieuPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Nouveau Lieu</h1>
            <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                <LieuForm />
            </Suspense>
        </div>
    );
}
