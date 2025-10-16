"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PresseSkeleton() {
  return (
    <div className="pt-16">
      {/* Hero Section Skeleton */}
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 md:h-16 bg-white/20 animate-pulse rounded mb-6 max-w-md mx-auto" />
          <div className="h-6 md:h-8 bg-white/15 animate-pulse rounded max-w-lg mx-auto" />
        </div>
      </section>

      {/* Contact Presse Skeleton */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-32" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-48" />
                    <div className="h-4 bg-muted animate-pulse rounded w-40" />
                    <div className="h-4 bg-muted animate-pulse rounded w-36" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded w-40" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-32" />
                    <div className="h-4 bg-muted animate-pulse rounded w-44" />
                    <div className="h-4 bg-muted animate-pulse rounded w-52" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Communiqués de Presse Skeleton */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-sm mx-auto" />
            <div className="h-5 bg-muted animate-pulse rounded max-w-lg mx-auto" />
          </div>

          {/* Cards Grid */}
          <div className="flex flex-wrap justify-center gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="animate-pulse w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-16" />
                    <div className="h-4 bg-muted animate-pulse rounded w-12" />
                  </div>
                  <div className="h-6 bg-muted animate-pulse rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Revue de Presse Skeleton */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-xs mx-auto" />
            <div className="h-5 bg-muted animate-pulse rounded max-w-md mx-auto" />
          </div>

          {/* Articles List */}
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      {/* Badges et meta */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="h-5 bg-muted animate-pulse rounded w-16" />
                        <div className="h-4 bg-muted animate-pulse rounded w-24" />
                        <div className="h-4 bg-muted animate-pulse rounded w-20" />
                      </div>

                      {/* Titre */}
                      <div className="h-6 bg-muted animate-pulse rounded mb-2 w-4/5" />

                      {/* Extrait */}
                      <div className="space-y-2 mb-3">
                        <div className="h-4 bg-muted animate-pulse rounded w-full" />
                        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      </div>

                      {/* Auteur */}
                      <div className="h-4 bg-muted animate-pulse rounded w-32" />
                    </div>

                    {/* Bouton */}
                    <div className="flex items-center justify-center lg:justify-end">
                      <div className="h-10 bg-muted animate-pulse rounded w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kit Média Skeleton */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-xs mx-auto" />
            <div className="h-5 bg-muted animate-pulse rounded max-w-lg mx-auto" />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="text-center animate-pulse">
                <CardContent className="p-6">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-muted animate-pulse rounded-lg mb-4" />

                  {/* Title */}
                  <div className="h-6 bg-muted animate-pulse rounded mb-3 w-32 mx-auto" />

                  {/* Description */}
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3 mx-auto" />
                  </div>

                  {/* File size */}
                  <div className="h-4 bg-muted animate-pulse rounded w-24 mx-auto mb-6" />

                  {/* Button */}
                  <div className="h-10 bg-muted animate-pulse rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accréditation Skeleton */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-8 bg-white/20 animate-pulse rounded mb-6 max-w-sm mx-auto" />
          <div className="h-6 bg-white/15 animate-pulse rounded mb-8 max-w-lg mx-auto" />

          {/* Liste des exigences */}
          <div className="space-y-4 mb-8">
            <div className="h-4 bg-white/15 animate-pulse rounded max-w-md mx-auto" />
            <div className="max-w-md mx-auto space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-white/10 animate-pulse rounded w-48 mx-auto"
                />
              ))}
            </div>
          </div>

          {/* Bouton */}
          <div className="h-12 bg-white/20 animate-pulse rounded max-w-xs mx-auto" />
        </div>
      </section>
    </div>
  );
}
