"use client";

import { useAbout } from './hooks';
import { AboutView } from './AboutView';
import { AboutSkeleton } from '@/components/skeletons/about-skeleton';

export function AboutContainer() {
    const { stats, isLoading } = useAbout();

    if (isLoading) {
        return <AboutSkeleton />;
    }

    return <AboutView stats={stats} />;
}
