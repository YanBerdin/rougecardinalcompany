"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PresseSkeleton() {
  return (
    <div className="pt-16">
      {/* Hero Section Skeleton */}
      {/*
      <section className="py-20 hero-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 md:h-16 bg-white/20 animate-pulse rounded mb-6 max-w-md mx-auto" />
          <div className="h-6 md:h-8 bg-white/15 animate-pulse rounded max-w-lg mx-auto" />
        </div>
      </section>
*/}
      {/* Contact Presse Skeleton */}
 {/* 
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
*/}
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

      {/* Revue de Presse Skeleton (gazette layout) */}
      <section
        aria-hidden="true"
        className="relative overflow-hidden bg-background py-12 md:py-28 lg:pt-12 pb-32"
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Manchette */}
          <div className="mb-14 text-center md:mb-20">
            <div className="mx-auto mb-4 h-3 w-64 animate-pulse rounded bg-muted" />

            <div className="mb-4 flex items-center gap-4 sm:gap-8">
              <span className="h-px flex-1 bg-foreground/20" />
              <div className="h-10 w-72 animate-pulse rounded bg-muted sm:h-12 sm:w-96 md:h-14 md:w-[28rem]" />
              <span className="h-px flex-1 bg-foreground/20" />
            </div>

            <div className="mx-auto h-[3px] w-full bg-foreground/20" />
            <div className="mx-auto mt-[3px] h-px w-full bg-foreground/10" />

            <div className="mt-4 flex items-center justify-between">
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* À la une */}
          <div className="mb-14 grid grid-cols-1 gap-10 border-b-2 border-foreground/10 pb-14 md:mb-20 md:pb-16 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <div className="mb-6 aspect-[2/3] w-56 animate-pulse rounded bg-muted sm:float-left sm:mb-4 sm:mr-8 sm:w-64 md:w-72 lg:w-80" />

              <div className="mb-3 flex gap-3">
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
              </div>

              <div className="mb-4 h-8 w-4/5 animate-pulse rounded bg-muted sm:h-9 md:h-11" />

              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>

              <div className="mt-4 h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-6 h-5 w-32 animate-pulse rounded bg-muted" />
            </div>

            <div className="lg:col-span-4">
              <div className="border-t-4 border-foreground/10 pt-6">
                <div className="space-y-2">
                  <div className="h-5 w-full animate-pulse rounded bg-muted" />
                  <div className="h-5 w-full animate-pulse rounded bg-muted" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                </div>
                <div className="mt-4 h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>

          {/* En bref */}
          <div>
            <div className="mb-10 flex items-center gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <span className="h-px flex-1 bg-foreground/10" />
            </div>

            <div className="grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="space-y-3 border-b border-foreground/10 pb-8"
                >
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
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
