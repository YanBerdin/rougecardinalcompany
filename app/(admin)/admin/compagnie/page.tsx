import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ValuesContainer } from "@/components/features/admin/compagnie/ValuesContainer";
import { PresentationContainer } from "@/components/features/admin/compagnie/PresentationContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Gestion Compagnie | Admin",
    description: "Gestion des valeurs et sections de présentation de la compagnie",
};

// ✅ CRITICAL: Force dynamic rendering and disable cache
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CompagniePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold md:text-4xl">Gestion Compagnie</h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    Gérez les sections de présentation et les valeurs de la compagnie.
                </p>
            </div>

            <Tabs defaultValue="presentation" className="w-full">
                <TabsList className="flex h-auto w-full flex-col gap-1 sm:grid sm:grid-cols-2 sm:gap-0">
                    <TabsTrigger
                        value="presentation"
                        className="w-full justify-center py-2.5 text-sm hover:bg-card hover:text-popover-foreground"
                    >
                        Présentation
                    </TabsTrigger>
                    <TabsTrigger
                        value="values"
                        className="w-full justify-center py-2.5 text-sm hover:bg-card hover:text-popover-foreground"
                    >
                        Valeurs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="presentation" className="mt-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                        <PresentationContainer />
                    </Suspense>
                </TabsContent>

                <TabsContent value="values" className="mt-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                        <ValuesContainer />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
            ))}
        </div>
    );
}

