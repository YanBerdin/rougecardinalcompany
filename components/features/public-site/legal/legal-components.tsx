import type { ReactNode } from "react";

/**
 * Tailwind child-selector styles for legal page prose content.
 * Applied on the wrapping <div> to style all p, ul, li, a, strong, code
 * without a prose plugin dependency.
 */
export const LEGAL_CONTENT_STYLES = [
    "space-y-10",
    "[&_p]:text-foreground/80 [&_p]:leading-relaxed",
    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2",
    "[&_li]:text-foreground/80 [&_li]:leading-relaxed",
    "[&_strong]:text-foreground [&_strong]:font-semibold",
    "[&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2",
    "[&_code]:bg-primary/10 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85em] [&_code]:font-mono [&_code]:not-italic",
].join(" ");

interface SectionHeadingProps {
    children: ReactNode;
}

/**
 * H2 with cardinal-red left accent border — consistent design-system heading
 * for all legal/policy pages.
 */
export function SectionHeading({ children }: SectionHeadingProps) {
    return (
        <h2 className="text-xl md:text-2xl font-semibold text-foreground border-l-[3px] border-primary pl-4 py-0.5 mb-4">
            {children}
        </h2>
    );
}
