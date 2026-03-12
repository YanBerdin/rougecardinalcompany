import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PressReleasesContainer } from "@/components/features/admin/presse/PressReleasesContainer";
import { ArticlesContainer } from "@/components/features/admin/presse/ArticlesContainer";
import { PressContactsContainer } from "@/components/features/admin/presse/PressContactsContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUserRole } from "@/lib/auth/roles";
import { isRoleAtLeast } from "@/lib/auth/role-helpers";

export const metadata = {
    title: "Gestion Presse | Admin",
    description: "Gestion des communiqués de presse, articles et contacts presse",
};

// ✅ CRITICAL: Force dynamic rendering and disable cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PressePage() {
    const role = await getCurrentUserRole();
    const isAdmin = isRoleAtLeast(role, "admin");

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Gestion Presse</h1>

            <Tabs defaultValue="releases" className="w-full">
                <TabsList
                    className={`flex flex-col sm:grid w-full h-auto gap-1 sm:gap-0 ${isAdmin ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
                >
                    <TabsTrigger value="releases" className="hover:text-popover-foreground hover:bg-card w-full justify-center text-sm py-2.5">
                        Communiqués
                    </TabsTrigger>
                    <TabsTrigger value="articles" className="hover:text-popover-foreground hover:bg-card w-full justify-center text-sm py-2.5">
                        Articles
                    </TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="contacts" className="hover:text-popover-foreground hover:bg-card w-full justify-center text-sm py-2.5">
                            Contacts
                        </TabsTrigger>
                    )}
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

                {isAdmin && (
                    <TabsContent value="contacts" className="mt-6">
                        <Suspense fallback={<LoadingSkeleton />}>
                            <PressContactsContainer />
                        </Suspense>
                    </TabsContent>
                )}
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
