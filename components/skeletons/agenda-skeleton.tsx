"use client";

import { Card, CardContent } from "@/components/ui/card";

export function AgendaSkeleton() {
  return (
    <div className="pt-16">
      {/* Hero Section Skeleton */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 md:h-16 bg-white/20 animate-pulse rounded mb-6 max-w-sm mx-auto" />
          <div className="h-6 md:h-8 bg-white/15 animate-pulse rounded max-w-md mx-auto" />
        </div>
      </section>

      {/* Filtres Section Skeleton */}
      <section className="py-8 border-b">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </section>

      {/* Liste des événements Skeleton */}
      <section className="py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
                  {/* Image Section */}
                  <div className="relative">
                    <div className="h-32 md:h-full bg-muted animate-pulse" />
                    {/* Badge simulé */}
                    <div className="absolute top-2 left-2">
                      <div className="h-5 w-16 bg-white/30 animate-pulse rounded" />
                    </div>
                  </div>

                  {/* Contenu */}
                  <CardContent className="md:col-span-3 lg:col-span-4 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                      {/* Info principale */}
                      <div className="lg:col-span-2">
                        {/* Titre + Badge Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-6 bg-muted animate-pulse rounded w-2/3" />
                          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                        </div>

                        {/* Meta informations */}
                        <div className="space-y-3">
                          {/* Date */}
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-muted animate-pulse rounded mr-3" />
                            <div className="h-4 bg-muted animate-pulse rounded w-48" />
                          </div>
                          {/* Heure */}
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-muted animate-pulse rounded mr-3" />
                            <div className="h-4 bg-muted animate-pulse rounded w-16" />
                          </div>
                          {/* Lieu */}
                          <div className="flex items-start">
                            <div className="h-4 w-4 bg-muted animate-pulse rounded mr-3 mt-0.5" />
                            <div className="flex-1 space-y-1">
                              <div className="h-4 bg-muted animate-pulse rounded w-40" />
                              <div className="h-3 bg-muted animate-pulse rounded w-32" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col justify-center space-y-3">
                        <div className="h-10 bg-muted animate-pulse rounded w-full" />
                        <div className="h-10 bg-muted animate-pulse rounded w-full" />
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-8 bg-white/20 animate-pulse rounded mb-6 max-w-xs mx-auto" />
          <div className="space-y-2 mb-8">
            <div className="h-5 bg-white/15 animate-pulse rounded max-w-lg mx-auto" />
            <div className="h-5 bg-white/15 animate-pulse rounded max-w-md mx-auto" />
          </div>
          <div className="h-12 bg-white/20 animate-pulse rounded max-w-xs mx-auto" />
        </div>
      </section>
    </div>
  );
}
