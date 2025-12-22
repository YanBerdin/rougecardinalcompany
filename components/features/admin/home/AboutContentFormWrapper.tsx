"use client";

import dynamic from "next/dynamic";
import { AboutContentSkeleton } from "@/components/skeletons/AboutContentSkeleton";
import type { AboutContentDTO } from "@/lib/schemas/home-content";

const AboutContentForm = dynamic(
    () => import("./AboutContentForm").then((mod) => ({ default: mod.AboutContentForm })),
    {
        ssr: false,
        loading: () => <AboutContentSkeleton />
    }
);

interface AboutContentFormWrapperProps {
    content: AboutContentDTO;
}

export function AboutContentFormWrapper({ content }: AboutContentFormWrapperProps) {
    return <AboutContentForm content={content} />;
}
