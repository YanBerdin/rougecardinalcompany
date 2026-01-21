import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PressReleasesContainer } from "@/components/features/admin/presse/PressReleasesContainer";
import { ArticlesContainer } from "@/components/features/admin/presse/ArticlesContainer";
import { PressContactsContainer } from "@/components/features/admin/presse/PressContactsContainer";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
    title: "Gestion Presse | Admin",
    description: "Gestion des communiqués de presse, articles et contacts presse",
};

// ✅ CRITICAL: Force dynamic rendering and disable cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PressePage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Gestion Presse</h1>

            <Tabs defaultValue="releases" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="releases">Communiqués de presse</TabsTrigger>
                    <TabsTrigger value="articles">Articles de presse</TabsTrigger>
                    <TabsTrigger value="contacts">Contacts presse</TabsTrigger>
                </TabsList>

                <TabsContent value="releases" className="mt-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                        <PressReleasesContainer />
                    </Suspense>
                </TabsContent>

                <TabsContent value="articles" className="mt-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                        <ArticlesContainer />
                    </Suspense>
                </TabsContent>

                <TabsContent value="contacts" className="mt-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                        <PressContactsContainer />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
            ))}
        </div>
    );
}
