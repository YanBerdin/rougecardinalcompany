"use client";

import { Card } from "@/components/ui/card";

export function PartnersSkeleton() {
    return (
        <section className="py-20">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
                    <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
                </div>
                <div className="flex flex-wrap justify-center gap-6 mb-12">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(16.666%-1.25rem)] max-w-48">
                            <Card className="p-6 border h-full">
                                <div className="flex flex-col space-y-4">
                                    <div className="h-16 bg-muted animate-pulse rounded mb-2" />
                                    <div className="h-4 bg-muted animate-pulse rounded mb-2 w-3/4 mx-auto" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-1/2 mx-auto" />
                                    <div className="h-3 bg-muted animate-pulse rounded w-4/5 mx-auto" />
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
                        <div className="h-6 bg-muted animate-pulse rounded w-1/3 mx-auto mb-4" />
                        <div className="h-4 bg-muted animate-pulse rounded mb-2 w-full" />
                        <div className="h-4 bg-muted animate-pulse rounded mb-2 w-full" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4 mx-auto" />
                    </div>
                </div>
            </div>
        </section>
    );
}
