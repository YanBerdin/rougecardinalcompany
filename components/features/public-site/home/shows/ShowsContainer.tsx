"use client";

import { useShows } from './hooks';
import { ShowsView } from './ShowsView';
import { ShowsSkeleton } from '@/components/skeletons/ShowsSkeleton';

export function ShowsContainer() {
    const { shows, isLoading } = useShows();

    if (isLoading) {
        return <ShowsSkeleton />;
    }

    return <ShowsView shows={shows} />;
}
