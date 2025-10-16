"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ContactSkeleton() {
  return (
    <div className="pt-16">
      {/* Hero Section Skeleton */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 md:h-16 bg-white/20 animate-pulse rounded mb-6 max-w-sm mx-auto" />
          <div className="h-6 md:h-8 bg-white/15 animate-pulse rounded max-w-md mx-auto" />
        </div>
      </section>

      <div className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Formulaire de contact - 2/3 de l'espace */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="h-7 bg-muted animate-pulse rounded w-40 mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-80" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Prénom + Nom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="h-4 bg-muted animate-pulse rounded w-16 mb-2" />
                        <div className="h-10 bg-muted animate-pulse rounded" />
                      </div>
                      <div>
                        <div className="h-4 bg-muted animate-pulse rounded w-12 mb-2" />
                        <div className="h-10 bg-muted animate-pulse rounded" />
                      </div>
                    </div>

                    {/* Email + Téléphone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="h-4 bg-muted animate-pulse rounded w-14 mb-2" />
                        <div className="h-10 bg-muted animate-pulse rounded" />
                      </div>
                      <div>
                        <div className="h-4 bg-muted animate-pulse rounded w-20 mb-2" />
                        <div className="h-10 bg-muted animate-pulse rounded" />
                      </div>
                    </div>

                    {/* Motif de la demande */}
                    <div>
                      <div className="h-4 bg-muted animate-pulse rounded w-40 mb-2" />
                      <div className="h-10 bg-muted animate-pulse rounded" />
                    </div>

                    {/* Message */}
                    <div>
                      <div className="h-4 bg-muted animate-pulse rounded w-20 mb-2" />
                      <div className="h-32 bg-muted animate-pulse rounded" />
                    </div>

                    {/* Consentement */}
                    <div className="flex items-start space-x-2">
                      <div className="h-4 w-4 bg-muted animate-pulse rounded mt-1" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted animate-pulse rounded w-full" />
                        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                      </div>
                    </div>

                    {/* Bouton */}
                    <div className="h-11 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informations de contact - 1/3 de l'espace */}
            <div className="space-y-8">
              {/* Coordonnées */}
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="h-5 w-5 bg-muted animate-pulse rounded mt-1" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted animate-pulse rounded w-16 mb-1" />
                        <div className="h-3 bg-muted animate-pulse rounded w-36" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Horaires */}
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-muted animate-pulse rounded mr-2" />
                    <div className="h-6 bg-muted animate-pulse rounded w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <div className="h-4 bg-muted animate-pulse rounded w-24" />
                        <div className="h-4 bg-muted animate-pulse rounded w-16" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contacts spécialisés */}
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded w-36" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="h-5 w-5 bg-muted animate-pulse rounded mt-1" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted animate-pulse rounded w-24 mb-1" />
                        <div className="h-3 bg-muted animate-pulse rounded w-40" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card>
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded w-20 mb-2" />
                  <div className="h-4 bg-muted animate-pulse rounded w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-10 bg-muted animate-pulse rounded" />
                    <div className="h-9 bg-muted animate-pulse rounded" />
                    <div className="h-3 bg-muted animate-pulse rounded w-40" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
